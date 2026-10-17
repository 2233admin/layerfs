// One range's plan (#352 SPEC §2): lanes, agents, steps, planned conflicts
// and consolidation, decided from git and a fixed seed and nothing else, so
// the same inputs always give the same plan. Agents write file content by git
// blob id. Order comes only from each agent's own list and each step's
// `after` barriers; the plan is checked to finish before it is returned.

export const LIMITS = {
  inlineFile: 64 << 10, inlineTotal: 256 << 10, decoyFile: 32 << 10,
  sandboxShare: 0.1, checkRate: 0.6, raceEvery: 5,
  readsPerWrite: 0.5, maxReads: 8, checkFiles: 20,
};
const TEXT = /\.(ts|tsx|js|mjs|cjs|jsx|json|md|txt|ya?ml|toml|css|html|sh|py|rs)$/i;
const READS = ["stat", "read", "list", "grep", "glob", "diff_files"];
const INSTALL = /(^|\/)(pnpm-lock\.yaml|pnpm-workspace\.yaml)$/;

/** mulberry32 seeded from a string: the plan's only randomness. */
export function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353), h = (h << 13) | (h >>> 19);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, xs) => xs[Math.floor(r() * xs.length)];
const pad = (n, w = 3) => String(n).padStart(w, "0");
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const parentOf = (p) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");
const ancestors = (p) => { const out = []; for (let d = parentOf(p); d; d = parentOf(d)) out.push(d); return out; };

/** A path's repository area: its first two folders, or its first for a shallow path. */
export function area(path) {
  const segs = path.split("/");
  return segs.length >= 3 ? `${segs[0]}/${segs[1]}` : segs.length === 2 ? segs[0] : "/";
}

/** Folder entry counts of a state: dir -> files under it. */
export function dirCounts(state) {
  const dirs = new Map();
  for (const p of state.keys()) for (const d of ancestors(p)) dirs.set(d, (dirs.get(d) || 0) + 1);
  return dirs;
}

/** A Branch's files as the plan expects them, over a shared base state. */
class LaneState {
  constructor(base, baseDirs) { this.base = base; this.baseDirs = baseDirs; this.over = new Map(); this.dirs = new Map(); }
  get(p) { return this.over.has(p) ? this.over.get(p) : this.base.get(p) ?? null; }
  isDir(p) { return (this.baseDirs.get(p) || 0) + (this.dirs.get(p) || 0) > 0; }
  set(p, v) {
    const had = !!this.get(p);
    this.over.set(p, v);
    if (had !== !!v) for (const d of ancestors(p)) this.dirs.set(d, (this.dirs.get(d) || 0) + (v ? 1 : -1));
  }
  /** Why a write of `p` cannot apply here, or null. */
  blocked(p) { return this.isDir(p) ? "folder" : ancestors(p).some((d) => this.get(d)) ? "file-parent" : null; }
}

/** Checks every agent can run its list to the end: no barrier waits on a later step. */
export function finishes(agents, steps) {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const done = new Set();
  const at = new Map(agents.map((a) => [a, 0]));
  const lists = new Map(agents.map((a) => [a, steps.filter((s) => s.agent === a).sort((x, y) => x.order - y.order)]));
  for (let progress = true; progress;) {
    progress = false;
    for (const a of agents) {
      const list = lists.get(a);
      while (at.get(a) < list.length && list[at.get(a)].after.every((d) => done.has(d) || !byId.has(d))) {
        done.add(list[at.get(a)].id); at.set(a, at.get(a) + 1); progress = true;
      }
    }
  }
  return done.size === steps.length;
}

/**
 * Plans range `k`. `range` comes from cutRanges, `commits` from readCommits,
 * `prev`/`next` are the checkpoint states before and after (path -> {mode, blob}),
 * `sizes` maps blob ids to bytes.
 */
export function planRange({ k, range, commits, prev, next, prevDirs, sizes, seed, milestone, snapshot, limits = LIMITS }) {
  const r = rng(`${seed}:${k}`);
  const counts = { gitlinks: 0, empty: 0, split: 0, dropped: { folder: 0, "file-parent": 0, absent: 0 }, upToDate: 0 };
  // The range's commits with their file operations.
  const list = [];
  for (const s of range.steps) for (const id of s.commits) {
    const c = commits.get(id);
    const files = [];
    for (const ch of c.changes) {
      if (ch.gitlink) { counts.gitlinks++; continue; }
      files.push(ch.mode === "000000" ? { path: ch.path, op: "rm" }
        : { path: ch.path, op: "write", mode: ch.mode, blob: ch.blob, size: sizes.get(ch.blob) ?? 0, modeChange: ch.oldMode !== "000000" && ch.oldMode !== ch.mode });
    }
    if (!files.length) { counts.empty++; continue; }
    list.push({ id, group: s.side ? s.mainline : "main", files, order: list.length });
  }
  // Lanes: repository areas packed into 2-4 Branches by file changes. A path's
  // area decides its lane, so lanes never change the same path and merge cleanly;
  // a commit that spans lanes becomes one part per lane.
  const ops = new Map();
  for (const c of list) for (const f of c.files) ops.set(area(f.path), (ops.get(area(f.path)) || 0) + 1);
  const want = clamp(Math.round(list.length / 20), 2, 4);
  const laneCount = Math.max(1, Math.min(want, ops.size));
  const bins = Array.from({ length: laneCount }, () => ({ areas: [], ops: 0 }));
  for (const [a, n] of [...ops].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))) {
    const bin = bins.reduce((m, b) => (b.ops < m.ops ? b : m));
    bin.areas.push(a); bin.ops += n;
  }
  const laneOfArea = new Map();
  bins.forEach((b, i) => b.areas.forEach((a) => laneOfArea.set(a, i)));
  const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "root";
  const lanes = bins.map((b, i) => ({ name: `r${pad(k)}-${i + 1}-${slug(b.areas[0])}`, areas: b.areas, commits: [] }));
  for (const c of list) {
    const parts = new Map();
    for (const f of c.files) { const li = laneOfArea.get(area(f.path)); (parts.get(li) || parts.set(li, []).get(li)).push(f); }
    if (parts.size > 1) counts.split++;
    for (const [li, files] of parts) lanes[li].commits.push({ ...c, files });
  }
  // Agents: 5-10, more than lanes, spread by commits.
  const agentCount = clamp(Math.round(list.length / 8), 5, 10);
  const perLane = lanes.map(() => 1);
  for (let left = agentCount - laneCount; left > 0; left--) {
    let best = 0;
    lanes.forEach((l, i) => { if (l.commits.length / perLane[i] > lanes[best].commits.length / perLane[best]) best = i; });
    perLane[best]++;
  }
  let next1 = 1;
  lanes.forEach((l, i) => { l.agents = Array.from({ length: perLane[i] }, () => `a${pad(next1++, 2)}`); });
  // Steps, lane by lane, with the lane's expected files after each.
  const steps = [];
  let seq = 0, fsFiles = 0, sbFiles = 0;
  const newId = () => `r${pad(k)}.s${pad(++seq, 4)}`;
  const states = lanes.map(() => new LaneState(prev, prevDirs));
  for (const [li, lane] of lanes.entries()) {
    const st = states[li];
    const load = new Map(lane.agents.map((a) => [a, 0]));
    const groupAgent = new Map();
    const lastWriter = new Map();
    const push = (step) => {
      step.after = [...new Set(step.after.filter(Boolean))];
      steps.push(step);
      load.set(step.agent, load.get(step.agent) + 1);
      return step;
    };
    for (const c of lane.commits) {
      if (!groupAgent.has(c.group)) groupAgent.set(c.group, [...load].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1))[0][0]);
      const agent = groupAgent.get(c.group);
      const ops = [];
      for (const f of c.files) {
        const cur = st.get(f.path);
        if (f.op === "rm") {
          if (!cur) { counts.dropped.absent++; continue; }
          ops.push({ ...f, prev: cur.blob, prevStep: lastWriter.get(f.path), expect: "Committed" });
          st.set(f.path, null);
          continue;
        }
        const why = st.blocked(f.path);
        if (why) { counts.dropped[why]++; continue; }
        const same = cur && cur.blob === f.blob && cur.mode === f.mode;
        if (same) counts.upToDate++;
        ops.push({ ...f, prev: cur?.blob ?? null, prevStep: lastWriter.get(f.path), expect: same ? "UpToDate" : "Committed" });
        st.set(f.path, { mode: f.mode, blob: f.blob });
      }
      if (!ops.length) continue;
      const special = ops.filter((f) => f.op === "write" && (f.mode !== "100644" || f.modeChange));
      const regular = ops.filter((f) => !special.includes(f));
      const inline = regular.every((f) => f.op === "rm" || f.size <= limits.inlineFile)
        && regular.reduce((n, f) => n + (f.size || 0), 0) <= limits.inlineTotal;
      const share = (sbFiles + regular.length) / (fsFiles + sbFiles + regular.length);
      const viaSandbox = regular.length > 0 && inline && share <= limits.sandboxShare;
      const make = (kind, files) => {
        const step = push({ id: newId(), kind, agent, lane: lane.name, commit: c.id, order: c.order, files, after: files.map((f) => f.prevStep) });
        for (const f of files) lastWriter.set(f.path, step.id);
        step.commits = kind === "fs" ? files.filter((f) => f.expect === "Committed").length : files.some((f) => f.expect === "Committed") ? 1 : 0;
        return step;
      };
      if (regular.length) {
        const s = make(viaSandbox ? "apply" : "fs", regular);
        if (viaSandbox) sbFiles += regular.length; else fsFiles += regular.length;
        if (!viaSandbox) {
          const n = Math.min(limits.maxReads, Math.ceil(regular.length * limits.readsPerWrite));
          s.reads = Array.from({ length: n }, (_, i) => {
            const target = regular[i % regular.length].path, kind = READS[(seq + i) % READS.length];
            const ext = target.includes(".") ? target.slice(target.lastIndexOf(".")) : "";
            return { kind, path: kind === "list" || kind === "grep" || kind === "glob" ? parentOf(target) || "/" : target,
              ...(kind === "grep" ? { pattern: "export" } : kind === "glob" ? { pattern: `*${ext}` } : kind === "diff_files" ? { right: "main" } : {}) };
          });
          const written = regular.filter((f) => f.op === "write").slice(0, limits.checkFiles);
          if (written.length && r() < limits.checkRate) {
            const check = push({ id: newId(), kind: "check", agent, lane: lane.name, commit: c.id, order: c.order + 0.1,
              files: written.map((f) => ({ path: f.path, blob: f.blob })), after: [s.id], commits: 0, expect: "UpToDate" });
            for (const f of written) lastWriter.set(f.path, check.id);
          }
        }
      }
      if (special.length) { make("apply", special.map((f) => ({ ...f, prevStep: lastWriter.get(f.path) ?? f.prevStep }))); sbFiles += special.length; }
    }
  }
  // Planned conflicts, each kept only if every agent still finishes.
  const agents = lanes.flatMap((l) => l.agents);
  const conflicts = [];
  const tryAdd = (fn) => {
    const saved = JSON.stringify(steps);
    const added = fn();
    if (added && finishes(agents, steps)) { conflicts.push(added); return true; }
    steps.splice(0, steps.length, ...JSON.parse(saved));
    return false;
  };
  const byId = () => new Map(steps.map((s) => [s.id, s]));
  const textWrites = (s) => s.kind === "fs" ? s.files.filter((f) => f.op === "write" && f.prev && f.expect === "Committed" && TEXT.test(f.path) && f.size <= limits.decoyFile) : [];
  const later = (path, order) => steps.filter((s) => s.order > order && s.files?.some((f) => f.path === path));
  const multi = lanes.filter((l) => l.agents.length >= 2);
  const candidates = (lane) => steps.filter((s) => s.lane === lane.name && textWrites(s).length);
  for (const lane of multi.length ? [pick(r, multi)] : []) {
    // 1. Same-lane Commit Conflict: B holds a Workspace across A's Commit of the same file.
    for (const x of candidates(lane).sort(() => r() - 0.5)) {
      if (tryAdd(() => {
        const f = textWrites(x)[0], b = pick(r, lane.agents.filter((a) => a !== x.agent));
        const ids = [newId(), newId(), newId(), newId()];
        steps.push(
          { id: ids[0], kind: "hold-mount", agent: b, lane: lane.name, order: x.order - 0.4, after: [f.prevStep].filter(Boolean), commits: 0 },
          { id: ids[1], kind: "hold-write", agent: b, lane: lane.name, order: x.order - 0.3, files: [{ path: f.path, op: "decoy", base: f.prev, marker: `planned conflict ${ids[0]}` }], after: [ids[0]], commits: 0 },
          { id: ids[2], kind: "hold-commit", agent: b, lane: lane.name, order: x.order + 0.3, after: [x.id, ids[1]], commits: 0, expect: "Conflict" },
          { id: ids[3], kind: "hold-resolve", agent: b, lane: lane.name, order: x.order + 0.4, files: [{ path: f.path, blob: f.blob }], after: [ids[2]], commits: 0, expect: "UpToDate" });
        byId().get(x.id).after.push(ids[0]);
        for (const s of later(f.path, x.order + 0.4)) s.after.push(ids[3]);
        return { kind: "commit-conflict", lane: lane.name, path: f.path, agents: [x.agent, b], steps: [x.id, ...ids], expect: ["Committed", "Conflict", "UpToDate"] };
      })) break;
    }
    // 2. Stale Workspace, clean merge: B mounts before A's Commit of another file, then commits its own change.
    const applies = steps.filter((s) => s.lane === lane.name && s.kind === "apply" && s.commits === 1);
    outer: for (const y of applies) for (const x of steps.filter((s) => s.lane === lane.name && s.kind === "fs" && s.agent !== y.agent && s.order < y.order && s.commits > 0)) {
      const paths = new Set(y.files.map((f) => f.path));
      if (x.files.some((f) => paths.has(f.path))) continue;
      if (tryAdd(() => {
        const id = newId(), ys = byId().get(y.id);
        steps.push({ id, kind: "stale-mount", agent: y.agent, lane: lane.name, order: x.order - 0.2, after: [...ys.after], commits: 0 });
        byId().get(x.id).after.push(id);
        Object.assign(ys, { kind: "stale-apply", after: [id, x.id], expect: "Committed" });
        return { kind: "stale-clean-merge", lane: lane.name, agents: [x.agent, y.agent], steps: [id, x.id, y.id], expect: ["Committed", "Committed"] };
      })) break outer;
    }
    // 3. Decoy: another agent edits the file just before its real change lands.
    for (const z of candidates(lane).sort(() => r() - 0.5)) {
      if (conflicts.some((c) => c.steps.includes(z.id))) continue;
      if (tryAdd(() => {
        const f = textWrites(z)[0], d = pick(r, lane.agents.filter((a) => a !== z.agent)), id = newId(), zs = byId().get(z.id);
        // It waits for all z waits for, so it never lands before a reader of the file.
        steps.push({ id, kind: "fs", agent: d, lane: lane.name, order: z.order - 0.2, files: [{ path: f.path, op: "decoy", base: f.prev, marker: `decoy ${id}` }], after: [...zs.after], commits: 1, expect: "Committed" });
        zs.after.push(id);
        return { kind: "decoy", lane: lane.name, path: f.path, agents: [d, z.agent], steps: [id, z.id], expect: ["Committed", "Committed"] };
      })) break;
    }
  }
  // A file in one lane under a path another lane changes may not merge cleanly
  // (file vs folder); counted so the pilot shows whether it happens.
  const laneTouch = lanes.map((l) => new Set(steps.filter((s) => s.lane === l.name).flatMap((s) => (s.files || []).map((f) => f.path))));
  counts.typeRisk = laneTouch.reduce((n, own, i) => n + [...own].filter((p) => ancestors(p).some((d) => laneTouch.some((o, j) => j !== i && o.has(d)))).length, 0);
  // Consolidation: merge every lane into main, then write what git's merges resolved.
  const main = new LaneState(prev, prevDirs);
  for (const st of states) for (const [p, v] of st.over) main.over.set(p, v);
  const touched = new Set([...main.over.keys()]);
  for (const [p] of next) if (prev.get(p)?.blob !== next.get(p)?.blob || prev.get(p)?.mode !== next.get(p)?.mode) touched.add(p);
  for (const [p] of prev) if (!next.has(p)) touched.add(p);
  const reconcile = [];
  for (const p of [...touched].sort()) {
    const want = next.get(p) ?? null, have = main.get(p);
    if (want?.blob === have?.blob && want?.mode === have?.mode) continue;
    reconcile.push(want ? { path: p, op: "write", mode: want.mode, blob: want.blob, size: sizes.get(want.blob) ?? 0 } : { path: p, op: "rm" });
  }
  reconcile.sort((a, b) => (a.op === b.op ? (a.op === "rm" ? b.path.length - a.path.length : a.path.length - b.path.length) : a.op === "rm" ? -1 : 1));
  const race = laneCount >= 2 && k % limits.raceEvery === limits.raceEvery - 1;
  if (race) conflicts.push({ kind: "merge-race", lanes: [lanes[0].name, lanes[1].name], expect: ["Merged", "Merged or Conflict, then merged again in plan order"] });
  const install = k === 0 || [...touched].some((p) => INSTALL.test(p));
  const consolidation = [
    ...lanes.map((l, i) => ({ op: "merge", lane: l.name, ...(race && i < 2 ? { race: true } : {}) })),
    ...(reconcile.length ? [{ op: "reconcile", files: reconcile }] : []),
    { op: "publish" },
  ];
  steps.sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
  if (!finishes(agents, steps)) throw new Error(`range ${k}: the plan does not finish`);
  return {
    range: k, checkpoint: range.checkpoint, tree: range.tree, milestone, snapshot,
    dsh: { commits: range.commits, mainline: range.steps.length, first: range.steps[0].commits[0] ?? range.steps[0].mainline, oversize: range.oversize },
    lanes: lanes.map((l) => ({ name: l.name, areas: l.areas, agents: l.agents, commits: l.commits.length })),
    agents, steps, conflicts, consolidation, closure: { install, tests: null },
    counts: { ...counts, fsFiles, sandboxFiles: sbFiles, reconcile: reconcile.length },
  };
}

/**
 * Plays a plan over `prev` without LayerFS: steps in plan order, then the
 * reconcile. Returns the final state and every problem found: a check or
 * resolve that would read another blob than it expects, or a decoy left in
 * place. Equal to the next checkpoint's state means the plan proves out.
 */
export function replayPlan(prev, plan) {
  const state = new Map(prev);
  const problems = [];
  for (const s of plan.steps) {
    if (s.kind === "hold-write" || s.kind === "hold-mount" || s.kind === "hold-commit" || s.kind === "stale-mount") continue;
    for (const f of s.files || []) {
      if (s.kind === "check" || s.kind === "hold-resolve") {
        if (state.get(f.path)?.blob !== f.blob) problems.push(`${s.id} reads ${f.path}: expected ${f.blob.slice(0, 8)}, plan has ${state.get(f.path)?.blob?.slice(0, 8) ?? "nothing"}`);
      } else if (f.op === "rm") state.delete(f.path);
      else if (f.op === "decoy") state.set(f.path, { mode: "100644", blob: `decoy:${s.id}` });
      else state.set(f.path, { mode: f.mode, blob: f.blob });
    }
  }
  for (const c of plan.consolidation) if (c.op === "reconcile") for (const f of c.files) {
    if (f.op === "rm") state.delete(f.path); else state.set(f.path, { mode: f.mode, blob: f.blob });
  }
  for (const [p, v] of state) if (v.blob.startsWith("decoy:")) problems.push(`decoy left in ${p}`);
  return { state, problems };
}

/** Differences between two states, for the static check. */
export function stateDiff(a, b) {
  const out = [];
  for (const [p, v] of a) if (b.get(p)?.blob !== v.blob || b.get(p)?.mode !== v.mode) out.push(p);
  for (const p of b.keys()) if (!a.has(p)) out.push(p);
  return out;
}
