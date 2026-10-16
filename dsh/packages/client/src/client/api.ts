// The Host's /layerfs route, from the page that dsh web or Desktop serves
// (same origin, its session cookie).
export interface Project { name: string, source: string, volume: string, created: number, folder: string | null }
/**
 * inspect.snapshot through the Host's mirror (labelled state, labels by real
 * id), with what the session journals add: who made each node, when each
 * Layer was published (by real id) and when each Branch was forked (by name).
 */
export interface ProjectState { s: any, labels: Record<string, string>, authors: Record<string, string>, times: Record<string, number>, forks: Record<string, number> }
export interface SessionView {
  session: string
  root: string
  folder: string | null
  choice: { project: string | null, locked: boolean } | null
  project: Project | null
  choices: { projects: Project[], lastUsed: string | null }
  lines: any[]
  running: any[]
  agents: Record<string, string>
}
export interface Status { configured: boolean, missing: string[] }
/** A project's Store as LayerFS reports it, with what Init recorded and each recent Commit's cost (Host storage.js). */
export interface Storage {
  store: { logical: number, canonical: number, stored: number, metadata: number, file: number, free: number, dedupe: number | null, compression: number | null }
  init: { entries: number, files: number, bytes: number, canonical: number, stored: number, metadata: number, millis: number } | null
  commits: { id: string, time: number, message: string | null, via: string, logical: number, newCanonical: number, newStored: number, newMetadata: number }[]
  branches: number
  partial: boolean
}
export interface Counts { entries: number, files: number, bytes: number }
/** A running or ended Init on the Host (jobs.js). */
export interface InitJob {
  id: string
  name: string
  source: string
  started: number
  step: 'scan' | 'volume' | 'import' | 'done' | 'failed'
  scanned: Counts | null
  totals: Counts | null
  /** LayerFS's own counts while it imports (SDK operator project.progress). */
  imported: { step: 'scan' | 'files' | 'tree' | 'publish' | 'seal', entries: number, files: number, bytes: number } | null
  project: Project | null
  error: { code: string, message: string } | null
}
const POLL_MS = 300
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Starts an Init and reads its job until it ends; `onProgress` sees each read. */
async function init(folder: string, name?: string, source?: string, onProgress: (job: InitJob) => void = () => {}): Promise<{ project: Project }> {
  let { job } = await call<{ job: InitJob }>('POST', '/init', { folder, name, source })
  for (;;) {
    onProgress(job)
    if (job.step === 'done') return { project: job.project! }
    if (job.step === 'failed') throw Object.assign(new Error(job.error!.message), { code: job.error!.code })
    await pause(POLL_MS)
    job = (await call<{ job: InitJob }>('GET', `/init/${encodeURIComponent(job.id)}`)).job
  }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/layerfs${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { /* not JSON */ }
  if (!res.ok) throw Object.assign(new Error(data?.message ?? `LayerFS answered ${res.status}`), { code: data?.code, status: res.status })
  return data as T
}

const sid = (id: string) => encodeURIComponent(id)

export const api = {
  status: () => call<Status>('GET', '/status'),
  workspace: (folder: string) => call<{ projects: Project[], lastUsed: string | null }>('GET', `/workspace?folder=${encodeURIComponent(folder)}`),
  session: (id: string) => call<SessionView>('GET', `/session/${sid(id)}`),
  choose: (id: string, project: string | null) => call<SessionView>('POST', `/session/${sid(id)}/project`, { project }),
  init,
  projects: () => call<{ projects: Project[] }>('GET', '/projects'),
  projectState: (name: string) => call<ProjectState>('GET', `/project/${encodeURIComponent(name)}/state`),
  projectStorage: (name: string) => call<Storage>('GET', `/project/${encodeURIComponent(name)}/storage`),
  projectTree: (name: string, ref: string) => call<{ tree: Record<string, unknown>, partial: string | null }>('GET', `/project/${encodeURIComponent(name)}/tree?ref=${encodeURIComponent(ref)}`),
  remove: (name: string) => call<{ removed: string, volume: string }>('POST', `/project/${encodeURIComponent(name)}/remove`, { confirm: name }),
  attach: (name: string, folder: string | null) => call<{ project: Project }>('POST', `/project/${encodeURIComponent(name)}/attach`, { folder }),
  tree: (id: string, ref: string) => call<{ tree: Record<string, unknown>, partial: string | null }>('GET', `/session/${sid(id)}/tree?ref=${encodeURIComponent(ref)}`),
}
