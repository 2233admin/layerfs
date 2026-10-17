// Plays a session's SDK calls in the LayerFS tab one step at a time, for
// live agents and demos alike. A step is one drawn trace line (the SDK's own
// service Sandbox and operator reads ride with the next one). New lines wait
// behind the step on screen, and each step stays for its kind's minimum time
// (HOLD_MS, divided by the speed) before the next one plays. So a bash call
// that mounts, runs, commits and unmounts a Workspace within a second still
// shows the window, the run and the Commit. A long queue plays faster, to stay
// about CATCH_UP steps behind at most; no step is dropped. When the tab
// opens, calls that ended over RECENT_MS ago are shown at once and the rest
// play, so a run just started (a demo's Play) plays from its first call. A
// rebuild when an agent is named applies at once what already played, so no
// Workspace opens and closes on screen twice.
import * as X from '../../../model/src/index.js'

/** Playback speeds: a multiple of the hold times, or 0 for none (each call shows as it lands). */
export const SPEEDS = [1, 2, 4, 0] as const
export type Speed = typeof SPEEDS[number]
export const speedLabel = (speed: Speed) => (speed ? `${speed}×` : 'Max')

/** Minimum time on screen at 1×, by SDK method, in ms. */
const HOLD_MS: Record<string, number> = {
  'sandbox.create': 1000, 'sandbox.mount': 1800, 'sandbox.exec': 1800, 'operator.process.start': 1800,
  'operator.process.cancel': 1200, 'sandbox.status': 900, 'sandbox.commit': 1600, 'sandbox.unmount': 1000, 'sandbox.close': 800,
  'branch.fork': 1300, 'branch.merge': 2000, 'branch.publish': 2000, 'project.init': 1300,
}
const WRITE_MS = 1300, READ_MS = 900, REFUSED_MS = 1500
const WRITES = new Set(['fs.write', 'fs.edit', 'fs.apply', 'fs.mkdir', 'fs.rm', 'fs.cp', 'fs.mv'])
const CATCH_UP = 30
const RECENT_MS = 2 * 60_000

/** How long a step stays at 1×: its method's time, and longer for a refusal (Conflict, Busy). */
export function holdOf(line: { method: string, ok?: boolean }): number {
  const base = HOLD_MS[line.method] ?? (WRITES.has(line.method) ? WRITE_MS : READ_MS)
  return base + (line.ok === false ? REFUSED_MS : 0)
}

/** The same rule as the trace source's (model/src/sources/trace.js): lines that are not steps of their own. */
const rides = (method: string) => method === 'sandbox.service' || (method.startsWith('operator.') && method !== 'operator.process.start' && method !== 'operator.process.cancel')

export interface Step { a: string, line: any, replay: (W: any) => void, instant?: boolean, ids: string[] }

export class Playback {
  W: any
  private seen = new Set<string>()
  private pending: any[] = []
  private queue: Step[] = []
  private t0: number | null = null
  private running = false
  private stopped = false
  private wake: (() => void) | null = null
  private feeding: Promise<void> = Promise.resolve()
  played = 0
  /** Ids of the lines played so far, for a rebuild to skip past. */
  readonly done = new Set<string>()

  /**
   * @param fresh a new view model (an empty trace replay)
   * @param show draws the model after `step`, or after catching up (null)
   * @param speed the speed now
   * @param shown the lines an earlier playback of the same session already played: a
   *   rebuild (an agent was named) applies them at once instead of playing them again
   */
  constructor(private fresh: () => any, private show: (W: any, step: Step | null) => void, private speed: () => Speed, private shown = new Set<string>()) {
    this.W = fresh()
  }

  /** Steps still to play. */
  get waiting() { return this.queue.length }

  /**
   * Takes a session's lines so far (agents named): the new ones queue. On
   * `opening`, the lines before the first that ended within RECENT_MS are
   * applied at once and drawn once.
   */
  feed(lines: any[], agent: string, opening: boolean): Promise<void> {
    // one feed at a time: an opening's fast-forward finishes before the next poll's lines queue
    const next = this.feeding.then(() => this.take(lines, agent, opening))
    this.feeding = next.catch(() => {})
    return next
  }

  private async take(lines: any[], agent: string, opening: boolean) {
    const ends = X.endLines(lines)
    if (!ends.length) return
    this.t0 ??= Date.parse(ends[0].start)
    const t0 = this.t0, recent = Date.now() - RECENT_MS
    let instant = opening ? ends.findIndex((line) => Date.parse(line.start) + (line.ms || 0) >= recent) : 0
    if (instant < 0) instant = ends.length
    for (const [k, line] of ends.entries()) {
      if (this.seen.has(line.id)) continue
      this.seen.add(line.id)
      this.pending.push(line)
      if (rides(line.method)) continue
      const batch = this.pending
      this.pending = []
      this.queue.push({ a: line.agent || agent, line, ids: batch.map((l) => l.id), replay: (W) => { for (const l of batch) X.replayLine(W, l, { agent, t0 }) } })
      if (k < instant || this.shown.has(line.id)) this.queue[this.queue.length - 1].instant = true
    }
    if (opening) {
      while (this.queue[0]?.instant) await this.run(this.queue.shift()!)
      this.show(this.W, null)
    }
    this.wake?.() // a longer queue may shorten the hold under way
    void this.play()
  }

  /** The speed changed: a step waiting out its hold rechecks it now. */
  nudge() { this.wake?.() }

  stop() { this.stopped = true; this.queue = []; this.wake?.() }

  private async play() {
    if (this.running) return
    this.running = true
    try {
      while (this.queue.length && !this.stopped) {
        const step = this.queue.shift()!
        await this.run(step)
        if (this.stopped) return
        this.show(this.W, step)
        await this.hold(holdOf(step.line), Date.now())
      }
      if (!this.stopped) this.show(this.W, null)
    } finally {
      this.running = false
    }
  }

  private async run(step: Step) {
    await X.runStep(this.W, step, {})
    this.played++
    for (const id of step.ids) this.done.add(id)
  }

  /** Waits out `ms` at the current speed, from `since`; a speed change takes effect at once. */
  private async hold(ms: number, since: number) {
    for (;;) {
      const speed = this.speed(), behind = Math.max(1, this.queue.length / CATCH_UP)
      const left = speed ? ms / speed / behind - (Date.now() - since) : 0
      if (left <= 0 || this.stopped) return
      await new Promise<void>((resolve) => { const timer = setTimeout(resolve, left); this.wake = () => { clearTimeout(timer); resolve() } })
      this.wake = null
    }
  }
}
