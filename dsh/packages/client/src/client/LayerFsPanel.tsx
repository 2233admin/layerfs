// The LayerFS sidebar panel: the Host's settings, and each dsh workspace with
// its LayerFS projects, Init, and a new session on the LayerFS preset.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { api, type Project, type Status } from './api.ts'
import { MESSAGE } from './ui.ts'

/** What the panel uses of dsh's workspace services (read with ctx.get). */
export interface PanelServices {
  workspaces?: { list: { getSnapshot(): { items: readonly { workspaceId: string, path: string, title: string }[] }, subscribe(listener: () => void): () => void } }
  uiWorkspace?: { startSession(workspaceId?: string, options?: { agentPreset?: string }): void }
}

const PRESET = 'layerfs-dsh-minimalist'
const NO_ITEMS = { items: [] } as const
const NOT_LISTED = { getSnapshot: () => NO_ITEMS, subscribe: () => () => {} }
const button = { font: 'inherit', fontSize: 12, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--dsh-color-border, #8884)', background: 'transparent', color: 'inherit', cursor: 'pointer' } as const

export function LayerFsIcon({ size }: { size?: number }) {
  const s = size ?? 16
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 14 5 8 8 2 5z" /><path d="M2 8l6 3 6-3" /><path d="M2 11l6 3 6-3" />
    </svg>
  )
}

export function LayerFsPanel({ services }: { services: () => PanelServices }) {
  const { workspaces, uiWorkspace } = services()
  const list = workspaces?.list ?? NOT_LISTED
  const subscribe = useCallback((listener: () => void) => list.subscribe(listener), [list])
  const { items } = useSyncExternalStore(subscribe, () => list.getSnapshot())
  const [status, setStatus] = useState<Status & { home?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { api.status().then(setStatus, (e: Error) => setError(e.message)) }, [])

  return (
    <div style={{ ...MESSAGE, paddingBottom: 24, display: 'grid', gap: 16, maxWidth: 760 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dsh-color-fg, inherit)' }}>LayerFS</div>
        {error && <div>The LayerFS Host plugin is not answering: {error}</div>}
        {status && (status.configured
          ? <div>Projects keep versioned copies of workspace folders. Sessions on the <b>LayerFS × DSH minimalist</b> preset fork, test and merge them through the SDK.</div>
          : <div>LayerFS is not set up on this dsh Host. Missing settings of <code>layerfs-host</code>: {status.missing.join(', ')}.</div>)}
      </div>
      {items.length === 0 && <div>No workspaces yet. Add one from the sidebar.</div>}
      {items.map((w) => (
        <WorkspaceRow key={w.workspaceId} title={w.title} path={w.path} disabled={!status?.configured} onNewSession={uiWorkspace ? () => uiWorkspace.startSession(w.workspaceId, { agentPreset: PRESET }) : undefined} />
      ))}
    </div>
  )
}

function WorkspaceRow({ title, path, disabled, onNewSession }: { title: string, path: string, disabled: boolean, onNewSession?: () => void }) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(() => { api.workspace(path).then((w) => setProjects(w.projects), (e: Error) => setError(e.message)) }, [path])
  useEffect(load, [load])
  const init = async () => {
    setBusy(true); setError(null)
    try { await api.init(path); load() } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <div style={{ display: 'grid', gap: 4, paddingTop: 12, borderTop: '1px solid var(--dsh-color-border, #8883)' }}>
      <div><b style={{ color: 'var(--dsh-color-fg, inherit)' }}>{title}</b> <code style={{ opacity: 0.7 }}>{path}</code></div>
      <div>
        {projects === null ? 'Reading…' : projects.length === 0 ? 'No LayerFS project.' : projects.map((p) => (
          <span key={p.name} title={`volume ${p.volume}`} style={{ marginRight: 12 }}>◆ {p.name} <span style={{ opacity: 0.6 }}>since {new Date(p.created).toLocaleDateString()}</span></span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {projects?.length === 0 && <button style={button} disabled={disabled || busy} onClick={() => { void init() }}>{busy ? 'Initializing…' : 'Init LayerFS'}</button>}
        {!!projects?.length && onNewSession && <button style={button} onClick={onNewSession}>New LayerFS session</button>}
      </div>
      {error && <div style={{ color: 'var(--dsh-color-fg-danger, #d33)' }}>{error}</div>}
    </div>
  )
}
