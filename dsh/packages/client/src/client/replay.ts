// A root session's trace lines replayed into the view model, the way the
// design preview replays a trace file (?source=trace).
import * as X from '../../../model/src/index.js'
import { api, type ProjectState, type SessionView } from './api.ts'

/** Trees by real id, kept across rebuilds: a saved id never changes. */
export type TreeCache = Map<string, Promise<object>>

export function treeLoader(sessionId: string, cache: TreeCache, read = (real: string) => api.tree(sessionId, real)) {
  return (real: string) => {
    if (!cache.has(real)) {
      const reading = read(real).then(({ tree, partial }) => (partial ? Object.defineProperty(tree, 'partial', { value: partial }) : tree))
      reading.catch(() => cache.delete(real))
      cache.set(real, reading)
    }
    return cache.get(real)!
  }
}

/**
 * A project's view model from its LayerFS state (no session): the Host's
 * labelled mirror, with trees loaded on demand and each node's author.
 */
export function projectModel(state: ProjectState, loadTree: (real: string) => Promise<object>, onchange: () => void) {
  const engine: any = new X.ReplayEngine({ project: state.s.project?.name ?? 'project', loadTree })
  engine.m.s = { ...state.s, roots: engine.m.s.roots }
  for (const [real, label] of Object.entries(state.labels)) { engine.m.toLabel.set(real, label); engine.m.toReal.set(label, real) }
  for (const node of [...Object.values(engine.s.commits), ...Object.values(engine.s.layers)] as any[]) node.root = node.id
  chronological(engine.s, state)
  engine.onchange = onchange
  const W: any = X.storyView(engine, { lead: 'main' })
  for (const [real, agent] of Object.entries(state.authors)) {
    const label = state.labels[real]
    if (label) W.attrib[label] = agent
  }
  return X.derive(W)
}

/**
 * Orders a snapshot's nodes by when they happened, as History draws them
 * (by slot). Commits carry their time; Layers and fork points do not, so
 * the journals' times are used, else a Layer follows its source Commit and
 * parent Layer, and a fork point follows the node it forked from and comes
 * before its Branch's first Commit.
 */
function chronological(s: any, state: ProjectState) {
  const at = new Map<string, number>()
  for (const c of Object.values(s.commits) as any[]) at.set(c.id, c.time)
  const realOf = new Map(Object.entries(state.labels).map(([r, label]) => [label, r]))
  const layers = Object.values(s.layers as Record<string, any>).sort((a, b) => a.slot - b.slot)
  for (const l of layers) {
    const after = Math.max(at.get(l.parent) ?? -Infinity, at.get(l.sourceCommit) ?? -Infinity)
    const known = state.times[realOf.get(l.id) ?? '']
    at.set(l.id, known ?? (after === -Infinity ? 0 : after + 1))
  }
  const branches = s.branchOrder.map((name: string) => s.branches[name])
  for (const b of branches) {
    const first = Math.min(...(Object.values(s.commits) as any[]).filter((c) => c.branch === b.name).map((c) => c.time))
    const after = (at.get(b.from) ?? 0) + 0.5
    at.set(`fork:${b.name}`, Math.min(state.forks[b.name] ?? after, first - 0.5))
  }
  const rank = (id: string) => (id.startsWith('fork:') ? 0 : s.commits[id] ? 1 : 2)
  const order = [...at.keys()].sort((x, y) => at.get(x)! - at.get(y)! || rank(x) - rank(y))
  order.forEach((id, slot) => {
    if (id.startsWith('fork:')) s.branches[id.slice(5)].slot = slot
    else (s.commits[id] ?? s.layers[id]).slot = slot
  })
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
