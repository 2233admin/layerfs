// The demo workspace: one Session per scenario of the dsh-layerfs-demo
// bundle, read from the Host's /layerfs-demo route (absent without the
// bundle). Play gives a demo a fresh run in a new Session that takes the old
// one's place: the old Session is archived (its work stopped), the demo's
// project is Inited again from the workspace folder (on LayerFS, or on the
// simulator for Sim), and the new Session gets the preset, the scenario's
// mock model, the project and the first message.
import { api, type InitJob } from './api.ts'

export type DemoMode = 'live' | 'sim'
/** A run's progress, from the mock model's replies (mock/src/progress.js). */
export interface DemoRun { root: string, state: 'running' | 'done' | 'stopped', done: number, of: number, phase: string | null, error: string | null, started: number, ended: number | null }
export interface Demo { id: string, title: string, blurb: string | null, agents: string[], sessionId: string | null, run: DemoRun | null }
export interface DemoInfo { workspace: string, preset: string, provider: string, prompt: string, intro: string, demos: Demo[] }

/** What Play and the Session check use of dsh's Client services (read with ctx.get). */
export interface DemoServices {
  remote?: {
    session: {
      create(request: { workspaceId?: string, agentPreset?: string }): Promise<Result<{ sessionId: string }>>
      rename(request: { sessionId: string, title: string }): Promise<Result<unknown>>
      selectModel(request: { sessionId: string, provider: string, model: string }): Promise<Result<unknown>>
      prompt(request: { requestId: string, sessionId: string, mode: 'queue', content: { type: 'text', text: string }[] }): Promise<Result<unknown>>
    }
    workspace: {
      create(request: { path: string }): Promise<Result<{ workspace: Workspace }>>
      archiveSession(request: { sessionId: string, stopActivity?: boolean }): Promise<Result<unknown>>
      insertSessionBefore(request: { workspaceId: string, sessionId: string, beforeSessionId?: string }): Promise<Result<unknown>>
    }
  }
  uiWorkspace?: { openSession(sessionId: string): void }
}
interface Workspace { workspaceId: string, path: string, sessionIds?: readonly string[] }
type Result<T> = { ok: true, value: T } | { ok: false, error: { code?: string, message?: string } }

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/layerfs-demo${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { /* not JSON */ }
  if (!res.ok) throw Object.assign(new Error(data?.message ?? `the demo route answered ${res.status}`), { code: data?.code, status: res.status })
  return data as T
}

export const demoApi = {
  /** null when the dsh-layerfs-demo bundle is not installed */
  info: () => call<DemoInfo>('GET', '').catch((error) => { if (error.status === 404) return null; throw error }),
  demo: (id: string) => call<Demo>('GET', `/${encodeURIComponent(id)}`),
  setSession: (id: string, sessionId: string) => call<Demo>('POST', `/${encodeURIComponent(id)}/session`, { sessionId }),
}

/** Inits `name` from `folder` (Live) or into the simulator (Sim) and reads its job until it ends, as api.init. */
async function initProject(folder: string, name: string, mode: DemoMode, onJob: (job: InitJob) => void): Promise<void> {
  const request = async (method: string, path: string, body?: unknown): Promise<{ job: InitJob }> => {
    const res = await fetch(`/layerfs${path}`, { method, credentials: 'same-origin', headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw Object.assign(new Error(data?.message ?? `the LayerFS route answered ${res.status}`), { code: data?.code, status: res.status })
    return data
  }
  let { job } = await request('POST', '/init', { folder, name, source: folder, ...(mode === 'sim' ? { backend: 'sim' } : {}) })
  for (;;) {
    onJob(job)
    if (job.step === 'done') return
    if (job.step === 'failed') throw Object.assign(new Error(job.error!.message), { code: job.error!.code })
    await new Promise((resolve) => setTimeout(resolve, 300))
    job = (await request('GET', `/init/${encodeURIComponent(job.id)}`)).job
  }
}

/** The demo's project for a mode: one per demo and mode, Inited again on each Play. */
export const projectOf = (id: string, mode: DemoMode) => (mode === 'sim' ? `demo-${id}-sim` : `demo-${id}`)

const value = <T,>(what: string, result: Result<T>): T => {
  if (result.ok) return result.value
  throw Object.assign(new Error(`${what}: ${result.error.message ?? result.error.code ?? 'refused'}`), { code: result.error.code })
}

/** The demo workspace's dsh Workspace with its current Sessions; registering answers the existing one. */
async function workspaceOf(services: DemoServices, info: DemoInfo): Promise<Workspace> {
  return value('register the demo workspace', await services.remote!.workspace.create({ path: info.workspace })).workspace
}

/** A new Session in the demo workspace for `demo`, named after it, at `before`'s place. */
async function newSession(services: DemoServices, info: DemoInfo, workspace: Workspace, demo: Demo, before?: string): Promise<string> {
  const { session, workspace: workspaces } = services.remote!
  const { sessionId } = value('create the Session', await session.create({ workspaceId: workspace.workspaceId, agentPreset: info.preset }))
  value('name the Session', await session.rename({ sessionId, title: demo.title }))
  value('choose the mock model', await session.selectModel({ sessionId, provider: info.provider, model: demo.id }))
  if (before) value('place the Session', await workspaces.insertSessionBefore({ workspaceId: workspace.workspaceId, sessionId, beforeSessionId: before }))
  await demoApi.setSession(demo.id, sessionId)
  return sessionId
}

const send = async (services: DemoServices, sessionId: string, text: string) =>
  value('send the first message', await services.remote!.session.prompt({ requestId: crypto.randomUUID(), sessionId, mode: 'queue', content: [{ type: 'text', text }] }))

/**
 * Gives every demo a Session in the demo workspace: one is made for each demo
 * whose recorded Session is not in the workspace (never made, archived or
 * removed). Made in reverse so the list reads in scenario order. Each opens
 * with the intro question, which the mock model answers with what the demo
 * shows: the sidebar lists no Session before its first turn.
 */
export async function ensureDemoSessions(services: DemoServices, info: DemoInfo): Promise<void> {
  if (!services.remote) return
  const workspace = await workspaceOf(services, info)
  const present = new Set(workspace.sessionIds ?? [])
  for (const demo of [...info.demos].reverse()) {
    if (demo.sessionId && present.has(demo.sessionId)) continue
    await send(services, await newSession(services, info, workspace, demo), info.intro)
  }
}

/** The step Play is on, for the strip. */
export type PlayStep = { step: 'session' } | { step: 'stop' } | { step: 'init', job: InitJob | null } | { step: 'start' }

/**
 * Plays `demo` from scratch: a new Session takes the place of its current
 * one, which is then archived with its work stopped, and the demo's project
 * is Inited again before the first message is sent. Each step is attempted
 * once; a refusal (a project still in use, say) ends Play with its message,
 * leaving the new Session in place for the next Play.
 * @returns the new Session's id; it is opened once its first message is sent
 */
export async function playDemo(services: DemoServices, info: DemoInfo, demo: Demo, mode: DemoMode, onStep: (step: PlayStep) => void): Promise<string> {
  if (!services.remote) throw new Error('this client has no Remote session services')
  const workspace = await workspaceOf(services, info)
  onStep({ step: 'session' })
  const sessionId = await newSession(services, info, workspace, demo, demo.sessionId ?? undefined)
  onStep({ step: 'stop' })
  if (demo.sessionId) value('archive the previous run', await services.remote.workspace.archiveSession({ sessionId: demo.sessionId, stopActivity: true }))
  for (const name of [projectOf(demo.id, 'live'), projectOf(demo.id, 'sim')]) {
    await api.remove(name).catch((error) => { if (error.status !== 404) throw error })
  }
  onStep({ step: 'init', job: null })
  const project = projectOf(demo.id, mode)
  await initProject(info.workspace, project, mode, (job) => onStep({ step: 'init', job }))
  await api.choose(sessionId, project)
  onStep({ step: 'start' })
  await send(services, sessionId, info.prompt)
  services.uiWorkspace?.openSession(sessionId)
  return sessionId
}
