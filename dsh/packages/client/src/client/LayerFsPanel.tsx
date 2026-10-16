// The LayerFS sidebar page: every LayerFS project, the dsh workspace each is
// attached to (change or detach it), its History and Files, and a new
// session on the LayerFS preset; a project can be removed (RemoveDialog).
// Workspaces without a project offer Init (InitDialog). ellen_joe keeps the
// page company.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import ellen from '../../../../../sdk_sim/avatars/ellen_joe.gif'
import { api, type Project, type ProjectState, type Status } from './api.ts'
import { InitDialog } from './InitDialog.tsx'
import { ProjectBoard } from './ProjectBoard.tsx'
import { RemoveDialog } from './RemoveDialog.tsx'

/** What the panel uses of dsh's workspace services (read with ctx.get). */
export interface PanelServices {
  workspaces?: { list: { getSnapshot(): { items: readonly Workspace[] }, subscribe(listener: () => void): () => void } }
  uiWorkspace?: { startSession(workspaceId?: string, options?: { agentPreset?: string }): void, listDirectory(path?: string): Promise<any> }
}
interface Workspace { workspaceId: string, path: string, title: string }

const PRESET = 'layerfs-dsh-minimalist'
const NO_ITEMS = { items: [] as readonly Workspace[] }
const NOT_LISTED = { getSnapshot: () => NO_ITEMS, subscribe: () => () => {} }
const muted = 'var(--dsh-color-fg-muted, #8a8a8a)'
const line = 'var(--dsh-color-border, #8883)'
const button = { font: 'inherit', fontSize: 12, padding: '4px 12px', borderRadius: 6, border: `1px solid ${line}`, background: 'transparent', color: 'inherit', cursor: 'pointer' } as const
const primary = { ...button, background: 'var(--dsh-color-fg, #111)', color: 'var(--dsh-color-bg, #fff)', border: '1px solid transparent' } as const
const chip = (on: boolean) => ({ ...button, borderRadius: 999, background: on ? 'var(--dsh-color-bg-muted, #8882)' : 'transparent', fontWeight: on ? 600 : 400 })

export function LayerFsIcon({ size }: { size?: number }) {
  const s = size ?? 16
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 14 5 8 8 2 5z" /><path d="M2 8l6 3 6-3" /><path d="M2 11l6 3 6-3" />
    </svg>
  )
}

const short = (path: string) => path.split('/').filter(Boolean).slice(-2).join('/')

/** One line for ellen_joe's bubble: where main is and what was published last. */
function summary(state: ProjectState | null, error: string | null) {
  if (error) return `I couldn't read this project: ${error}`
  if (!state) return 'Reading the project…'
  const s = state.s, real = Object.fromEntries(Object.entries(state.labels).map(([r, l]) => [l, r]))
  const last = Object.values(s.layers as Record<string, any>).filter((l) => l.sourceBranch).sort((a, b) => b.slot - a.slot)[0]
  const branches = s.branchOrder.length, commits = Object.keys(s.commits).length
  const head = `main is at ${s.main?.head ?? '–'} · ${branches} Branch${branches === 1 ? '' : 'es'}, ${commits} Commit${commits === 1 ? '' : 's'}.`
  if (!last) return `${head} Nothing published yet.`
  const by = state.authors[real[last.id]]
  return `${head} Last publish: ${last.sourceBranch} as ${last.id}${by ? `, by ${by}` : ''}.`
}

export function LayerFsPanel({ services }: { services: () => PanelServices }) {
  const { workspaces, uiWorkspace } = services()
  const list = workspaces?.list ?? NOT_LISTED
  const subscribe = useCallback((listener: () => void) => list.subscribe(listener), [list])
  const { items } = useSyncExternalStore(subscribe, () => list.getSnapshot())
  const [status, setStatus] = useState<Status | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [state, setState] = useState<ProjectState | null>(null)
  const [stateError, setStateError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reads, setReads] = useState(0)
  const [initFor, setInitFor] = useState<Workspace | null>(null)
  const [removing, setRemoving] = useState(false)

  const loadProjects = useCallback(() => api.projects().then(({ projects }) => { setProjects(projects); return projects }), [])
  useEffect(() => {
    api.status().then(setStatus, (e: Error) => setError(e.message))
    loadProjects().then((all) => setSelected((current) => current ?? (all.find((p) => p.folder) ?? all[0])?.name ?? null), (e: Error) => setError(e.message))
  }, [loadProjects])
  useEffect(() => {
    if (!selected) return
    let stopped = false
    setState(null); setStateError(null)
    api.projectState(selected).then((s) => { if (!stopped) setState(s) }, (e: Error) => { if (!stopped) setStateError(e.message) })
    return () => { stopped = true }
  }, [selected, reads])

  const act = (label: string, run: () => Promise<unknown>) => async () => {
    setBusy(label); setError(null)
    try { await run() } catch (e) { setError((e as Error).message) } finally { setBusy(null) }
  }
  const project = projects?.find((p) => p.name === selected) ?? null
  const workspace = project?.folder ? items.find((w) => w.path === project.folder) : undefined
  const bare = items.filter((w) => !projects?.some((p) => p.folder === w.path))
  const attach = (folder: string | null) => act(folder ? 'Attaching…' : 'Detaching…', async () => { await api.attach(project!.name, folder); await loadProjects() })()
  const newSession = act('Opening a session…', async () => {
    await api.attach(project!.name, project!.folder) // the folder's project for the new session
    uiWorkspace!.startSession(workspace!.workspaceId, { agentPreset: PRESET })
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 24px', height: '100%', boxSizing: 'border-box', fontSize: 13, lineHeight: 1.5, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 600, marginRight: 8 }}>LayerFS</span>
        {projects?.map((p) => (
          <button key={p.name} style={chip(p.name === selected)} onClick={() => setSelected(p.name)} title={p.folder ? `attached to ${p.folder}` : 'not attached to a workspace'}>
            {p.name}{p.folder ? '' : ' · detached'}
          </button>
        ))}
        {status && !status.configured && <span style={{ color: muted }}>Not set up: missing {status.missing.join(', ')} in layerfs-host.</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src={ellen} alt="ellen_joe" width={88} height={88} style={{ flex: 'none' }} />
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 8 }}>
          <div style={{ position: 'relative', alignSelf: 'start', justifySelf: 'start', padding: '8px 12px', borderRadius: 12, background: 'var(--dsh-color-bg-muted, #8881)', border: `1px solid ${line}` }}>
            {project ? summary(state, stateError) : projects?.length === 0 ? 'No LayerFS project yet. Init one from a workspace below.' : 'Pick a project.'}
          </div>
          {project && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: muted }}>
              <span>Workspace</span>
              <select
                aria-label="Workspace this project is attached to"
                value={project.folder ?? ''}
                disabled={!!busy}
                onChange={(e) => { void attach(e.target.value || null) }}
                style={{ ...button, cursor: 'pointer', maxWidth: 360 }}
              >
                <option value="">not attached</option>
                {items.map((w) => <option key={w.workspaceId} value={w.path}>{w.title} · {short(w.path)}</option>)}
                {project.folder && !items.some((w) => w.path === project.folder) && <option value={project.folder}>{short(project.folder)} (not a dsh workspace)</option>}
              </select>
              <span title={project.volume}>imported from {short(project.source)} · {new Date(project.created).toLocaleDateString()}</span>
              <button style={button} onClick={() => setReads((n) => n + 1)} title="Read the project again">Refresh</button>
              <button style={{ ...button, color: 'var(--dsh-color-fg-danger, #d33)' }} disabled={!!busy} onClick={() => setRemoving(true)}>Remove project…</button>
            </div>
          )}
        </div>
        {project && (
          <button style={primary} disabled={!!busy || !workspace || !uiWorkspace} onClick={() => { void newSession() }} title={workspace ? `New session in ${workspace.title} on the LayerFS × DSH minimalist preset` : 'Attach the project to a dsh workspace first'}>
            New LayerFS session
          </button>
        )}
      </div>

      {(busy || error) && <div style={{ color: error ? 'var(--dsh-color-fg-danger, #d33)' : muted }}>{error ?? busy}</div>}
      {project && state && <ProjectBoard name={project.name} state={state} />}
      {project && !state && <div style={{ flex: 1, minHeight: 380, border: `1px dashed ${line}`, borderRadius: 10 }} />}

      {bare.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: muted, borderTop: `1px solid ${line}`, paddingTop: 10 }}>
          <span>No project yet:</span>
          {bare.map((w) => (
            <button key={w.workspaceId} style={button} disabled={!!busy || !status?.configured} onClick={() => setInitFor(w)} title={`Init LayerFS for ${w.path}`}>
              Init {w.title}
            </button>
          ))}
        </div>
      )}
      {removing && project && <RemoveDialog project={project} onClose={() => setRemoving(false)} onDone={() => {
        setRemoving(false)
        void loadProjects().then((all) => setSelected((all.find((p) => p.folder) ?? all[0])?.name ?? null))
      }} />}
      {initFor && <InitDialog folder={initFor.path} directories={uiWorkspace} onClose={() => setInitFor(null)} onDone={(made) => { setInitFor(null); void loadProjects().then(() => setSelected(made.name)) }} />}
    </div>
  )
}
