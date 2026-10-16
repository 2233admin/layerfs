// The New Session row's LayerFS control: which of the workspace folder's
// projects this session uses, or none, and a button that Inits one from the
// folder. The choice is fixed once an agent's first bash call has used the
// project. Init is a button, not a list entry, so typing into a focused list
// cannot start it.
import { useEffect, useState } from 'react'
import { api, type SessionView } from './api.ts'

const NONE = '\u0000none'
const chip = { font: 'inherit', fontSize: 12, padding: '3px 6px', borderRadius: 6, border: '1px solid var(--dsh-color-border, #8884)', background: 'transparent', color: 'inherit', maxWidth: 220 } as const

export function ProjectPicker({ sessionId }: { sessionId: string }) {
  const [view, setView] = useState<SessionView | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let stopped = false
    api.session(sessionId).then((v) => { if (!stopped) setView(v) }, (e: Error) => { if (!stopped) setError(e.message) })
    return () => { stopped = true }
  }, [sessionId])
  if (!view?.folder) return error ? <span title={error} style={{ fontSize: 12, opacity: 0.6 }}>LayerFS unavailable</span> : null

  const run = async (step: () => Promise<SessionView>) => {
    setBusy(true); setError(null)
    try { setView(await step()) } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  const pick = (value: string) => run(() => api.choose(sessionId, value === NONE ? null : value))
  const init = () => run(async () => api.choose(sessionId, (await api.init(view.folder!)).project.name))
  const value = view.project ? view.project.name : NONE
  const locked = !!view.choice?.locked
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }} title={error ?? (locked ? 'Fixed: an agent has used this project' : 'LayerFS project for this session')}>
      <span style={{ opacity: 0.7 }}>LayerFS</span>
      <select aria-label="LayerFS project" style={chip} value={value} disabled={busy || locked} onChange={(e) => { void pick(e.target.value) }}>
        {view.choices.projects.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
        <option value={NONE}>none</option>
      </select>
      {!locked && <button type="button" style={{ ...chip, cursor: 'pointer' }} disabled={busy} onClick={() => { void init() }} title="Init a new LayerFS project from this folder">{busy ? '…' : '+ Init'}</button>}
      {error && <span style={{ color: 'var(--dsh-color-fg-danger, #d33)' }}>!</span>}
    </label>
  )
}
