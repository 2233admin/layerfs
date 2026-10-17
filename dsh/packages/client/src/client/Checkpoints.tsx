// The demo strip's checkpoint timeline (#352): one segment per checkpoint of
// the demo's scenario, in order, colored by its verdict once the run reached
// it, the next one marked while the run goes. Hovering a segment shows its
// label, verdict, note and time. Clicking a reached checkpoint selects it
// (the last one reached by default): Resume would play on from the range
// after it. Resume does not replay the checkpoints before: it restores the
// one Store snapshot taken at the selected checkpoint, which already holds
// every earlier range, or the nearest earlier snapshot and fast-forwards the
// ranges between. It is shown but off: it needs #352's P2 (Store snapshots).
import { useState } from 'react'
import type { DemoCheckpoint } from './demo.ts'

export const VERDICT_COLOR: Record<DemoCheckpoint['verdict'], string> = {
  pass: '#2e9e5b', watch: '#d9a400', optimize: '#e07b24', stop: '#d14343',
}
const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

/** The line the strip shows for the checkpoints: how many were reached, and the last one. */
export function checkpointText(checkpoints: DemoCheckpoint[]): string {
  const reached = checkpoints.filter((c) => c.reachedAt !== null)
  const last = reached.at(-1)
  return last ? `Checkpoint ${reached.length} of ${checkpoints.length} · ${last.label} · ${last.verdict}` : `0 of ${checkpoints.length} checkpoints`
}

/** What resuming after checkpoint `i` would do, for the button's title. */
export function resumePlan(checkpoints: DemoCheckpoint[], i: number): string {
  const c = checkpoints[i], next = checkpoints[i + 1]
  return [
    `Resume after ${c.label}${next ? `: play ${next.label} onwards` : ' (the last checkpoint: nothing left to play)'}.`,
    `Restores the Store snapshot taken at ${c.label}; it already holds ${i ? `${checkpoints[0].label}–${c.label}` : c.label}, which are not replayed.`,
    'Without a snapshot there, the nearest earlier one is restored and the ranges between are fast-forwarded (no timing, no tests).',
    'Needs #352 P2 (Store snapshots).',
  ].join('\n')
}

export function Checkpoints({ checkpoints, running }: { checkpoints: DemoCheckpoint[], running: boolean }) {
  const next = checkpoints.findIndex((c) => c.reachedAt === null)
  const reachedIdx = checkpoints.flatMap((c, i) => (c.reachedAt !== null ? [i] : []))
  const [picked, pick] = useState<number | null>(null)
  // the selected checkpoint while it stays reached, else the last one reached
  const chosen = picked !== null && reachedIdx.includes(picked) ? picked : reachedIdx.at(-1) ?? null
  const last = chosen !== null ? checkpoints[chosen] : undefined
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
      <div role="list" aria-label="Checkpoints" style={{ display: 'flex', flex: 1, gap: 3, minWidth: 0 }}>
        {checkpoints.map((c, i) => {
          const reached = c.reachedAt !== null, current = running && i === next
          const title = reached
            ? `${c.label} · ${c.verdict} · reached ${time(c.reachedAt as number)}${c.note ? `\n${c.note}` : ''}`
            : `${c.label} · ${current ? 'in progress' : 'not reached yet'}`
          return (
            <div role="listitem" key={i} title={reached ? `${title}\nClick to select: Resume plays on from the next range.` : title}
              aria-selected={i === chosen} onClick={reached ? () => pick(i) : undefined}
              style={{ flex: 1, minWidth: 0, display: 'grid', gap: 2, cursor: reached ? 'pointer' : 'default' }}>
              <div style={{
                height: 6, borderRadius: 3,
                background: reached ? VERDICT_COLOR[c.verdict] : 'color-mix(in srgb, currentColor 12%, transparent)',
                outline: current ? '1px dashed color-mix(in srgb, currentColor 55%, transparent)' : i === chosen ? '2px solid color-mix(in srgb, currentColor 70%, transparent)' : 'none', outlineOffset: 1,
                animation: current ? 'lfs-checkpoint-pulse 1.2s ease-in-out infinite' : 'none',
              }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: reached ? 'inherit' : 'var(--dsh-color-fg-muted, inherit)', opacity: reached ? 1 : 0.7, fontWeight: i === chosen ? 600 : 400 }}>
                {reached ? '✓ ' : ''}{c.label}
              </span>
            </div>
          )
        })}
      </div>
      <button type="button" disabled title={chosen !== null ? resumePlan(checkpoints, chosen) : 'No checkpoint reached yet'}
        style={{ border: '1px solid color-mix(in srgb, currentColor 18%, transparent)', borderRadius: 8, padding: '2px 8px', font: 'inherit', fontSize: 11, color: 'inherit', background: 'transparent', opacity: 0.55, cursor: 'not-allowed', whiteSpace: 'nowrap' }}>
        {last ? `Resume after ${last.label}` : 'Resume'}
      </button>
      <style>{'@keyframes lfs-checkpoint-pulse { 0%, 100% { opacity: 0.35 } 50% { opacity: 0.9 } }'}</style>
    </div>
  )
}
