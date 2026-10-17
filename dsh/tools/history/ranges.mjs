// dsh's history as mainline steps and ranges (#352 SPEC §2). A mainline
// (first-parent) commit is one step: a direct commit brings itself, a merge
// brings the side commits it is the first to reach, in topological order.
// Merge commits add no content of their own here; whatever a merge resolved
// is written by the range's reconcile step at consolidation.

export const RANGE = { target: 60, min: 30, max: 100 };

/** Mainline steps from `commits` (readCommits) and `pos` (topoPositions), oldest first. */
export function mainlineSteps(commits, pos, head) {
  const line = [];
  for (let c = head; c; c = commits.get(c)?.parents[0]) line.push(c);
  line.reverse();
  const seen = new Set();
  const steps = [];
  for (const id of line) {
    const c = commits.get(id);
    seen.add(id);
    if (c.parents.length < 2) { steps.push({ mainline: id, tree: c.tree, commits: [id], side: false }); continue; }
    const side = [];
    const stack = c.parents.slice(1);
    while (stack.length) {
      const x = stack.pop();
      if (seen.has(x) || !commits.has(x)) continue;
      seen.add(x);
      const xc = commits.get(x);
      if (xc.parents.length < 2) side.push(x);
      stack.push(...xc.parents);
    }
    side.sort((a, b) => pos.get(a) - pos.get(b));
    steps.push({ mainline: id, tree: c.tree, commits: side, side: true });
  }
  return steps;
}

/**
 * Cuts steps (after the Init commit, steps[0]) into ranges of `target`
 * commits, never more than `max` unless one step alone is larger, and folds a
 * short tail into the range before it. Every range ends on a mainline commit.
 */
export function cutRanges(steps, { target, min, max } = RANGE) {
  const ranges = [];
  let acc = null;
  for (const s of steps.slice(1)) {
    const n = s.commits.length;
    if (acc && acc.commits + n > max && acc.commits >= min) { ranges.push(acc); acc = null; }
    acc ??= { steps: [], commits: 0 };
    acc.steps.push(s);
    acc.commits += n;
    if (acc.commits >= target) { ranges.push(acc); acc = null; }
  }
  if (acc) {
    if (acc.commits < min && ranges.length) {
      const last = ranges.at(-1);
      last.steps.push(...acc.steps);
      last.commits += acc.commits;
    } else ranges.push(acc);
  }
  return ranges.map((r, index) => ({
    index, steps: r.steps, commits: r.commits,
    checkpoint: r.steps.at(-1).mainline, tree: r.steps.at(-1).tree,
    oversize: r.commits > max,
  }));
}

/**
 * The snapshots the plan fixes: every pilot range and the milestones (kept
 * forever). Other ranges snapshot when snapshot.mjs's `due` says so at run
 * time (SPEC §7, When).
 */
export function snapshotPolicy(count, { pilot = 5 } = {}) {
  const milestones = new Set([Math.min(pilot, count) - 1]);
  for (const f of [0.25, 0.5, 0.75]) milestones.add(Math.max(pilot, Math.round(count * f)) - 1);
  milestones.add(count - 1);
  return (i) => ({
    snapshot: i < pilot || milestones.has(i),
    milestone: milestones.has(i),
  });
}
