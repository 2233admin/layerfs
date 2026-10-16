// A root session's trace lines replayed into the view model, the way the
// design preview replays a trace file (?source=trace).
import * as X from '../../../model/src/index.js'
import { api, type SessionView } from './api.ts'

/** Trees by real id, kept across rebuilds: a saved id never changes. */
export type TreeCache = Map<string, Promise<object>>

export function treeLoader(sessionId: string, cache: TreeCache) {
  return (real: string) => {
    if (!cache.has(real)) {
      const reading = api.tree(sessionId, real).then(({ tree, partial }) => (partial ? Object.defineProperty(tree, 'partial', { value: partial }) : tree))
      reading.catch(() => cache.delete(real))
      cache.set(real, reading)
    }
    return cache.get(real)!
  }
}

/** The lines' identity: a rebuild is needed only when it changes. */
export const linesKey = (view: SessionView) => `${view.lines.length}:${view.lines.at(-1)?.id ?? ''}:${Object.values(view.agents).join(',')}`

/**
 * Replays the lines on a fresh engine.
 * @returns the view model and the last drawn step
 */
export async function replay(view: SessionView, loadTree: (real: string) => Promise<object>, onchange: () => void) {
  const engine: any = new X.ReplayEngine({ project: view.project?.name ?? 'project', loadTree })
  engine.onchange = onchange
  const W: any = X.storyView(engine, { lead: 'main' })
  const lines = view.lines.map((line) => ({ ...line, agent: view.agents[line.agentId] ?? line.agent }))
  const steps = X.traceSteps(lines, { agent: 'main' })
  for (const step of steps) await X.runStep(W, step, {})
  return { W, last: steps.at(-1) ?? null, agents: [...new Set(lines.map((line) => line.agent as string))] }
}
