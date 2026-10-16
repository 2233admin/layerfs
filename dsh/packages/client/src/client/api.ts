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
  init: (folder: string, name?: string) => call<{ project: Project }>('POST', '/init', { folder, name }),
  projects: () => call<{ projects: Project[] }>('GET', '/projects'),
  projectState: (name: string) => call<ProjectState>('GET', `/project/${encodeURIComponent(name)}/state`),
  projectTree: (name: string, ref: string) => call<{ tree: Record<string, unknown>, partial: string | null }>('GET', `/project/${encodeURIComponent(name)}/tree?ref=${encodeURIComponent(ref)}`),
  attach: (name: string, folder: string | null) => call<{ project: Project }>('POST', `/project/${encodeURIComponent(name)}/attach`, { folder }),
  tree: (id: string, ref: string) => call<{ tree: Record<string, unknown>, partial: string | null }>('GET', `/session/${sid(id)}/tree?ref=${encodeURIComponent(ref)}`),
}
