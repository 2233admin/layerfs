// The LayerFS sidebar page. On the left, every LayerFS project (with the dsh
// workspace it is attached to) and "Import project" for workspaces without
// one (InitDialog). On the right, the chosen project: a header with its one
// action, New session, and a menu for Refresh, the attached workspace and
// Remove (RemoveDialog); tiles for where main is, Branches, Commits, the
// last publish, and its Store (storage.ts: on disk, saved, the last Commit's
// cost); then its History and Files (ProjectBoard). ellen_joe sits in
// the header, and full size where there is nothing else to show.
// Colours, borders and radii are dsh's own tokens (--dsw-*).
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { Button, IconEllipsisOutlineRegular, IconFolderOpenOutlineRegular, IconPlusOutlineRegular, IconRefreshOutlineRegular, IconTrashOutlineRegular, Menu, type MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import ellen from '../../../../../sdk_sim/avatars/ellen_joe.gif'
import { api, type Project, type ProjectState, type Status, type Storage } from './api.ts'
import { InitDialog } from './InitDialog.tsx'
import { ProjectBoard } from './ProjectBoard.tsx'
import { RemoveDialog } from './RemoveDialog.tsx'
import { storageTiles } from './storage.ts'

/** What the panel uses of dsh's workspace services (read with ctx.get). */
export interface PanelServices {
  workspaces?: { list: { getSnapshot(): { items: readonly Workspace[] }, subscribe(listener: () => void): () => void } }
  uiWorkspace?: { startSession(workspaceId?: string, options?: { agentPreset?: string }): void, listDirectory(path?: string): Promise<any> }
}
interface Workspace { workspaceId: string, path: string, title: string }

const PRESET = 'layerfs-dsh-minimalist'
const NO_ITEMS = { items: [] as readonly Workspace[] }
const NOT_LISTED = { getSnapshot: () => NO_ITEMS, subscribe: () => () => {} }

// dsh tokens, and the 4/8/12/16/24 spacing scale
const T = {
  text: 'var(--dsw-alias-label-primary)', text2: 'var(--dsw-alias-label-secondary)', caption: 'var(--dsw-alias-label-caption)',
  border: 'var(--dsw-alias-border-l2)', card: 'var(--dsw-alias-bg-layer-1)', well: 'var(--dsw-alias-bg-skeleton)',
  hover: 'var(--dsw-alias-interactive-bg-hover)', active: 'var(--dsw-alias-interactive-bg-active)',
  danger: 'var(--dsw-alias-state-error-primary)', warn: 'var(--dsw-alias-state-warn-primary)',
  sm: 'var(--dsw-radius-sm)', md: 'var(--dsw-radius-md)',
} as const
const ROWS = `.lfs-prow { background: transparent; } .lfs-prow:hover { background: ${T.hover}; } .lfs-prow[aria-current='true'] { background: ${T.active}; }
.lfs-bone { border-radius: 4px; background: ${T.well}; animation: lfs-bone 1.2s ease-in-out infinite alternate; } @keyframes lfs-bone { to { opacity: .45; } }`
// a card: dsh's layer fill (white in light mode) inside a hairline, as dsh's settings cards
const card = { background: T.card, border: `1px solid ${T.border}`, borderRadius: T.md } as const

export function LayerFsIcon({ size }: { size?: number }) {
  const s = size ?? 16
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 14 5 8 8 2 5z" /><path d="M2 8l6 3 6-3" /><path d="M2 11l6 3 6-3" />
    </svg>
  )
}

const short = (path: string) => path.split('/').filter(Boolean).slice(-2).join('/')
const day = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/** The project's stats over the board: [label, value, title?]. */
function stats(state: ProjectState): [string, string, string?][] {
  const s = state.s, real = Object.fromEntries(Object.entries(state.labels).map(([r, l]) => [l, r]))
  const last = Object.values(s.layers as Record<string, any>).filter((l) => l.sourceBranch).sort((a, b) => b.slot - a.slot)[0]
  const by = last && state.authors[real[last.id]]
  return [
    ['main', s.main?.head ?? '–'],
    ['Branches', String(s.branchOrder.length)],
    ['Commits', String(Object.keys(s.commits).length)],
    ['Last publish', last ? `${last.sourceBranch}${by ? ` · ${by}` : ''}` : 'Nothing yet', last ? `${last.sourceBranch} published as ${last.id}${by ? ` by ${by}` : ''}` : undefined],
  ]
}

/** Why the project could not be read, in words. */
function problem(error: string) {
  // the SDK refuses a second client while one is starting the project's
  // service Sandbox (the first one also installs the Store into the volume)
  if (/^Busy\b/.test(error)) return "LayerFS is busy with this project: another client is starting its Sandbox. The first start installs the Store, which takes a while for a big project. Refresh in a moment."
  return `This project couldn't be read: ${error}`
}

/** ellen_joe at full size, for a page with nothing else to show. */
function Notice({ title, children }: { title: string, children?: React.ReactNode }) {
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
      <img src={ellen} alt="" width={72} height={72} style={{ flex: 'none' }} />
      <div style={{ display: 'grid', gap: 4 }}><div style={{ fontWeight: 500 }}>{title}</div>{children && <div style={{ color: T.text2 }}>{children}</div>}</div>
    </div>
  )
}

/** The board's shape while the project is read: History rows on the left, a file tree on the right. */
function Skeleton() {
  const bars = (widths: number[]) => widths.map((w, i) => <div key={i} className="lfs-bone" style={{ height: 12, width: `${w}%` }} />)
  return (
    <div aria-label="Reading the project" style={{ ...card, flex: 1, minHeight: 380, display: 'grid', gridTemplateColumns: 'minmax(0, 55fr) minmax(0, 45fr)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', alignContent: 'start', gap: 16, padding: 16, borderRight: `1px solid ${T.border}` }}>{bars([70, 45, 80, 55, 65, 40, 75])}</div>
      <div style={{ display: 'grid', alignContent: 'start', gap: 16, padding: 16 }}>{bars([35, 50, 45, 30, 55, 40])}</div>
    </div>
  )
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
  const [storage, setStorage] = useState<Storage | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reads, setReads] = useState(0)
  const [initFor, setInitFor] = useState<Workspace | null>(null)
  const [removing, setRemoving] = useState(false)
  const [menu, setMenu] = useState<'project' | 'import' | null>(null)

  const loadProjects = useCallback(() => api.projects().then(({ projects }) => { setProjects(projects); return projects }), [])
  useEffect(() => {
    api.status().then(setStatus, (e: Error) => setError(e.message))
    loadProjects().then((all) => setSelected((current) => current ?? (all.find((p) => p.folder) ?? all[0])?.name ?? null), (e: Error) => setError(e.message))
  }, [loadProjects])
  useEffect(() => {
    if (!selected) return
    let stopped = false
    setState(null); setStateError(null); setStorage(null); setStorageError(null)
    api.projectState(selected).then((s) => { if (!stopped) setState(s) }, (e: Error) => { if (!stopped) setStateError(e.message) })
    api.projectStorage(selected).then((z) => { if (!stopped) setStorage(z) }, (e: Error) => { if (!stopped) setStorageError(e.message) })
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
  const folderOf = (p: Project) => (p.folder ? items.find((w) => w.path === p.folder)?.title ?? short(p.folder) : null)

  // the project menu: Refresh, the attached workspace (a submenu), Remove
  const projectMenu: MenuEntry[] = project ? [
    { id: 'refresh', label: 'Refresh', icon: <IconRefreshOutlineRegular size={16} /> },
    {
      id: 'attach', label: 'Attached workspace', icon: <IconFolderOpenOutlineRegular size={16} />, submenu: [
        ...items.map((w) => ({ id: `attach:${w.path}`, label: `${w.title} · ${short(w.path)}` })),
        { id: 'detach', label: 'Not attached' },
      ],
    },
    { type: 'separator', id: 'sep' },
    { id: 'remove', label: 'Remove project…', icon: <IconTrashOutlineRegular size={16} />, danger: true },
  ] : []
  const onProjectMenu = (id: string) => {
    setMenu(null)
    if (id === 'refresh') setReads((n) => n + 1)
    else if (id === 'remove') setRemoving(true)
    else if (id === 'detach') void attach(null)
    else if (id.startsWith('attach:')) void attach(id.slice('attach:'.length))
  }
  const importMenu: MenuEntry[] = bare.length
    ? [{ type: 'label', id: 'l', text: 'Workspaces without a project' }, ...bare.map((w) => ({ id: w.workspaceId, label: `${w.title} · ${short(w.path)}`, disabled: !status?.configured }))]
    : [{ type: 'label', id: 'l', text: 'Every workspace has a project' }]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'clamp(150px, 18%, 200px) minmax(0, 1fr)', height: '100%', minHeight: 0, fontSize: 13, lineHeight: '20px', color: T.text }}>
      <style>{ROWS}</style>
      <nav aria-label="LayerFS projects" style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, padding: '16px 8px', borderRight: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 8px', fontWeight: 500 }}><LayerFsIcon size={16} />LayerFS</div>
        <div style={{ display: 'grid', gap: 2, overflowY: 'auto', minHeight: 0 }}>
          {projects?.map((p) => (
            <button key={p.name} className="lfs-prow" aria-current={p.name === selected} onClick={() => setSelected(p.name)} title={p.folder ?? 'Not attached to a workspace'}
              style={{ display: 'grid', textAlign: 'left', gap: 0, padding: '6px 8px', border: 0, borderRadius: T.sm, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>
              <span style={{ fontWeight: p.name === selected ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ fontSize: 12, color: p.folder ? T.text2 : T.caption, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folderOf(p) ?? 'Not attached'}</span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Menu open={menu === 'import'} onClose={() => setMenu(null)} items={importMenu} align="start" side="top" portal
          onSelect={(id) => { setMenu(null); const w = bare.find((x) => x.workspaceId === id); if (w) setInitFor(w) }}
          anchor={<Button variant="ghost" size="sm" icon={<IconPlusOutlineRegular size={16} />} onClick={() => setMenu(menu === 'import' ? null : 'import')} style={{ width: '100%', justifyContent: 'flex-start' }}>Import project</Button>} />
      </nav>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, minHeight: 0, padding: '16px 24px' }}>
        {status && !status.configured && <div style={{ ...card, padding: '8px 12px', color: T.warn }}>LayerFS isn't set up: layerfs-host is missing {status.missing.join(', ')}.</div>}
        {projects && projects.length === 0 && <Notice title="Start your first project">Import a folder from a workspace: LayerFS keeps a versioned copy that agents fork, test and merge.</Notice>}
        {project && (
          <>
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <img src={ellen} alt="" width={36} height={36} style={{ flex: 'none', borderRadius: '50%', background: T.well }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px' }}>{project.name}</div>
                <div style={{ fontSize: 12, color: T.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={project.volume}>
                  {project.folder ? folderOf(project) : 'Not attached to a workspace'} · imported {day(project.created)} from {short(project.source)}
                </div>
              </div>
              <Button variant="primary" size="sm" disabled={!!busy || !workspace || !uiWorkspace} onClick={() => { void newSession() }}
                title={workspace ? `New session in ${workspace.title} on the LayerFS × DSH minimalist preset` : 'Attach the project to a workspace first (in the … menu)'}>New session</Button>
              <Menu open={menu === 'project'} onClose={() => setMenu(null)} items={projectMenu} onSelect={onProjectMenu} align="end" portal
                anchor={<Button variant="ghost" size="sm" aria-label="Project actions" icon={<IconEllipsisOutlineRegular size={16} />} disabled={!!busy} onClick={() => setMenu(menu === 'project' ? null : 'project')} />} />
            </header>
            {(busy || error) && <div role="status" style={{ color: error ? T.danger : T.text2 }}>{error ?? busy}</div>}
            {stateError
              ? <Notice title="Couldn't read this project">{problem(stateError)}</Notice>
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                  {[
                    ...(state ? stats(state) : [['main'], ['Branches'], ['Commits'], ['Last publish']] as [string, string?, string?][]),
                    ...(storage ? storageTiles(storage) : [['On disk', storageError ? '–' : undefined, storageError ?? undefined], ['Last Commit', storageError ? '–' : undefined, storageError ?? undefined]] as [string, string?, string?][]),
                  ].map(([label, value, title]) => (
                    <div key={label} title={title} style={{ ...card, padding: '8px 12px', minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: value ? T.text : T.caption }}>{value ?? '…'}</div>
                    </div>
                  ))}
                </div>
              )}
            {state && <ProjectBoard name={project.name} state={state} />}
            {!state && !stateError && <Skeleton />}
          </>
        )}
      </main>
      {removing && project && <RemoveDialog project={project} onClose={() => setRemoving(false)} onDone={() => {
        setRemoving(false)
        void loadProjects().then((all) => setSelected((all.find((p) => p.folder) ?? all[0])?.name ?? null))
      }} />}
      {initFor && <InitDialog folder={initFor.path} directories={uiWorkspace} onClose={() => setInitFor(null)} onDone={(made) => { setInitFor(null); void loadProjects().then(() => setSelected(made.name)) }} />}
    </div>
  )
}
