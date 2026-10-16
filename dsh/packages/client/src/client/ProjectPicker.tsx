// The New Session row's LayerFS chip, drawn like dsh's workspace and preset
// chips: an icon, the session's project (or "No LayerFS") and a chevron. Its
// menu lists the workspace folder's projects and "No LayerFS", with "Import
// project…" pinned below them. Like "Add workspace…", that opens the
// directory picker (Finder in dsh web on a Mac); the chosen folder is
// imported as a new project attached to the workspace folder and chosen for
// this session. Without a directory picker it opens InitDialog instead. The
// choice is fixed once an agent's first bash call has used the project.
import { useEffect, useRef, useState } from 'react'
import { IconChevronDownOutlineRegular, IconDatabaseOutlineRegular, IconPlusOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import { api, type InitJob, type SessionView } from './api.ts'
import { ProgressBar, jobFraction, jobText, useClock } from './Progress.tsx'
import { InitDialog, type Directories } from './InitDialog.tsx'

const NONE = '\u0000none'
const IMPORT = '\u0000import'
const MARK = 'data-lfs-hero-options'
// dsh pushes the hero options to the row's far end (margin-left: auto); the
// chip sits beside the preset chip instead. The hover fill matches dsh's chips.
const RULE = `[${MARK}] { margin-left: 0 !important; }
.lfs-seat:not(:disabled):hover, .lfs-seat[aria-expanded='true'] { background: var(--dsw-alias-interactive-bg-hover); }
.lfs-seat > svg { flex: none; }
.lfs-seat > .lfs-chevron { color: var(--dsw-alias-label-caption); }`
const seat = {
  display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, maxWidth: 240, minHeight: 28, padding: '0 8px',
  border: 'none', borderRadius: 'var(--dsw-radius-sm)', background: 'transparent', color: 'var(--dsw-alias-label-primary)',
  font: 'inherit', fontSize: 13, lineHeight: '20px', fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
} as const

/** Marks the nearest laid-out ancestor (dsh's hero options box) so the rule above applies while mounted. */
function useBesidePreset(anchor: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const doc = anchor.current?.ownerDocument
    let box = anchor.current?.parentElement ?? null
    while (box && getComputedStyle(box).display === 'contents') box = box.parentElement
    if (!doc || !box) return
    if (!doc.getElementById('lfs-hero-rule')) {
      const style = doc.createElement('style')
      style.id = 'lfs-hero-rule'
      style.textContent = RULE
      doc.head.append(style)
    }
    box.setAttribute(MARK, '')
    return () => { box.removeAttribute(MARK) }
  })
}

export function ProjectPicker({ sessionId, directories }: { sessionId: string, directories: () => Directories | undefined }) {
  const [initing, setIniting] = useState(false)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<SessionView | null>(null)
  const [busy, setBusy] = useState(false)
  const [job, setJob] = useState<InitJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const anchor = useRef<HTMLSpanElement>(null)
  useBesidePreset(anchor)
  const now = useClock(job !== null)
  useEffect(() => {
    let stopped = false
    api.session(sessionId).then((v) => { if (!stopped) setView(v) }, (e: Error) => { if (!stopped) setError(e.message) })
    return () => { stopped = true }
  }, [sessionId])
  if (!view?.folder) return <span ref={anchor} title={error ?? undefined} style={{ fontSize: 12, opacity: 0.6 }}>{error ? 'LayerFS unavailable' : null}</span>
  const folder = view.folder

  const run = async (step: () => Promise<SessionView>) => {
    setBusy(true); setError(null)
    try { setView(await step()) } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  // the picker answers null when the user cancels; nothing is imported then
  const importProject = async () => {
    // as dsh's native directory flow: the desktop bridge when present, else the Host's OS chooser
    const desktop = (globalThis as { __DSH_DIRECTORY_PICKER__?: { pick(): Promise<string | null> } }).__DSH_DIRECTORY_PICKER__
    const dirs = directories()
    if (!desktop && !dirs?.pickDirectory) { setIniting(true); return }
    await run(async () => {
      const source = desktop ? await desktop.pick() : await dirs!.pickDirectory!()
      if (!source) return view
      try {
        const { project } = await api.init(folder, undefined, source, setJob)
        return await api.choose(sessionId, project.name)
      } finally { setJob(null) }
    })
  }
  const select = (id: string) => {
    setOpen(false)
    if (id === IMPORT) void importProject()
    else void run(() => api.choose(sessionId, id === NONE ? null : id))
  }
  const locked = !!view.choice?.locked
  const icon = <IconDatabaseOutlineRegular size={16} />
  return (
    <span ref={anchor} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        items={[
          ...view.choices.projects.map((p) => ({ id: p.name, label: p.name, icon })),
          { id: NONE, label: 'No LayerFS', icon: <span style={{ width: 16 }} /> },
        ]}
        footer={[{ id: IMPORT, label: 'Import project…', icon: <IconPlusOutlineRegular size={16} />, disabled: busy }]}
        selectedId={view.project?.name ?? NONE}
        onSelect={select}
        align="start"
        portal
        anchor={(
          <button
            type="button"
            className="lfs-seat"
            style={{ ...seat, ...(busy || locked ? { cursor: 'default' } : {}), ...(error ? { color: 'var(--dsh-color-fg-danger, #d33)' } : {}) }}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="LayerFS project"
            title={job ? jobText(job, now) : error ?? (locked ? 'Fixed: an agent has used this project' : 'LayerFS project for this session')}
            disabled={busy || locked}
            onClick={() => setOpen((value) => !value)}
          >
            <IconDatabaseOutlineRegular size={16} />
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{job ? `Importing ${job.name}…` : view.project?.name ?? 'No LayerFS'}</span>
            {!locked && <IconChevronDownOutlineRegular size={14} className="lfs-chevron" />}
          </button>
        )}
      />
      {job && (
        <span role="status" style={{ position: 'absolute', left: 0, top: '100%', marginTop: 6, zIndex: 20, width: 300, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'var(--dsw-alias-bg-base, #fff)', border: '1px solid var(--dsw-alias-border-subtle, #8883)', boxShadow: '0 8px 24px rgba(0,0,0,.12)', pointerEvents: 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Importing {job.name}</span>
          <ProgressBar fraction={jobFraction(job)} />
          <span style={{ fontSize: 12, lineHeight: '17px', overflowWrap: 'anywhere', color: 'var(--dsw-alias-label-caption)' }}>{jobText(job, now)}</span>
        </span>
      )}
      {initing && <InitDialog folder={folder} directories={directories()} onClose={() => setIniting(false)} onDone={(project) => { setIniting(false); void run(() => api.choose(sessionId, project.name)) }} />}
    </span>
  )
}
