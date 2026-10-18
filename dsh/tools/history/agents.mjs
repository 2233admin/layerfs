// The P2 player of the history replay (#352 SPEC §2 "Agents and conflicts",
// §9 P2; SCRIPTS.md §5): a range's lanes as LayerFS Branches, its agents as
// concurrent tasks, each running its own plan steps in order and waiting only
// on the steps' `after` barriers (never on time), and the lead's
// consolidation: lane merges into its Branch, the planned merge/publish race,
// the reconcile and the publish. One attempt per operation; the first outcome
// that differs from the plan throws Mismatch, which ends the range.
//
// Step kinds (SCRIPTS.md §5):
//   fs            fs calls per file (a decoy writes its base bytes plus a marker)
//   apply         one-shot Workspace: mount, exec (files from inline content), Commit, unmount
//   check         one-shot Workspace: mount, exec printing blob ids (compared), Commit UpToDate, unmount
//   hold-mount    mount; the Workspace is kept           hold-write  the decoy in the kept Workspace
//   hold-commit   its Commit answers Conflict             hold-resolve unmount (discard), a fresh one-shot Workspace verifies, Commit UpToDate
//   stale-mount   mount; kept                             stale-apply  the files in the kept Workspace, Commit (a clean merge), unmount
// Workspaces live in a pool of Sandboxes the lead creates one at a time
// (a create during another is refused Busy): one per agent, agent aN uses
// pool[N-1], so two agents never unmount in one Sandbox at the same time.
// Decision (P2 dev run, 2026-10-18): two concurrent unmounts of different
// Workspaces in one Sandbox failed "Workspace absent" (daemon 511dceed), a
// product finding (F-009, fixed in addon 3da0f665). Decision kept on
// 2026-10-18 after the fix: dropping the pool is not free. It changes the
// measured shape of P2 (Sandboxes per daemon, concurrent mounts per Sandbox)
// against the dev evidence and would need its own dev run to qualify; one
// Sandbox per agent also matches one agent per Sandbox in the target. The pool
// stays across ranges until a seal.
import { lsTree } from "./git.mjs";
import {
  BLOB_IDS, countMutation, execAll, expectCall, Mismatch, placeCommands, PNPM_STORE, reads, setup, writeOp,
} from "./lib.mjs";
import { sandboxVolumes } from "./closure.mjs";
import { generateLww, gitignores } from "./lww.mjs";
import { gitContext, laneGit, leadGit, seedGit } from "./gitplay.mjs";
import { createHash } from "node:crypto";
import { abs, consolidationSteps, decoyBytes, p2Plan, pad, PHASES, quote, route, sandboxExpect, STEP_KINDS, Tree } from "./steps.mjs";

/** The lead creates the pool (one Sandbox per agent, at least 4), one Sandbox at a time, recording each in the ledger. */
/** How many Sandboxes a range's pool holds: the phase's shared pool, else one per agent (at least 4). */
export const poolSize = (phase, agents) => phase.sharedPool ?? Math.max(4, agents);
/** The pool index of agent aN: (N-1) mod the pool size (one per agent when the pool has one per agent). */
export const poolOf = (n, size) => (n - 1) % size;

export async function pool(run, k, agents = 4) {
  run.pool ??= [];
  const phase = PHASES[run.manifest.phase] ?? {};
  // P3 on: a shared pool of 4 (agents share Sandboxes, poolOf); before it, one Sandbox per agent
  const size = poolSize(phase, agents);
  // closure phases: every pool Sandbox has the read-only pnpm store (INSTALLS §3.1), since setup() hands out pool[0]
  const extra = phase.closure ? [sandboxVolumes(run.manifest.env.LAYERFS_PNPM_STORE ?? PNPM_STORE)] : [];
  for (let i = run.pool.length; i < size; i++) {
    const id = `p${k}-${i + 1}`;
    run.pool.push(await run.lf.sandbox.create(id, run.manifest.project, run.manifest.env.LAYERFS_IMAGE, ...extra));
    run.note({ kind: "container", name: `${run.manifest.env.LAYERFS_CONTAINER_PREFIX}${id}`, id: run.container(id), sandbox: id });
  }
  run.sandbox = run.pool[0];
  return run.pool;
}

/** Blob ids of `paths` in a mounted Workspace, compared with the plan's: a Mismatch names the first difference. */
async function checkIds(a, sb, ws, files, label) {
  a.rec.next = { kind: "files", n: files.length };
  const r = await expectCall(a, `${label} exec`, () => a.lf.sandbox.exec(sb, ws, `node -e ${quote(BLOB_IDS)} ${files.map((f) => quote(f.path)).join(" ")}`));
  // a refused exec answers no exit code: name the refusal (dev352-p3l r016.s0159 read "exited undefined")
  if (r.refused) throw new Mismatch(`${label} blob ids exec refused: ${r.refused.code ?? ""} ${String(r.refused.message ?? "").slice(0, 300)}`);
  if (r.exitCode !== 0 || r.truncated) throw new Mismatch(`${label} blob ids exited ${r.exitCode}: ${String(r.stderr ?? "").slice(0, 300)}`);
  const got = new Map(String(r.stdout).split("\n").filter(Boolean).map((l) => { const [, blob, ...p] = l.split(" "); return [p.join(" "), blob]; }));
  for (const f of files) if (got.get(f.path) !== f.blob) throw new Mismatch(`${label} ${f.path}: blob ${got.get(f.path) ?? "missing"}, the plan has ${f.blob}`);
}

/** One mount, `body(ws)`, Commit expecting `want`, unmount (discarding when the Commit did not land). */
async function oneShot(a, branch, label, files, want, body) {
  const sb = await setup(a);
  const ws = await expectCall(a, `${label} mount`, () => a.lf.sandbox.mount(sb, branch));
  let landed = false;
  try {
    await body(sb, ws);
    a.rec.next = { kind: "files", n: files };
    await expectCall(a, `${label} commit`, () => a.lf.sandbox.commit(sb, ws, label), want);
    landed = true;
  } finally {
    await a.lf.sandbox.unmount(sb, ws, !landed);
  }
}

/** Decoy files of a step with their bytes: the base content plus the step's marker. */
async function decoys(a, files, tree) {
  return Promise.all(files.map(async (f) => ({ path: f.path, mode: tree.get(f.path)?.mode ?? "100644", op: "write",
    bytes: decoyBytes(await a.blobs().get(f.base), f.marker), previous: tree.get(f.path), expect: "Committed" })));
}

/** A Sandbox step's paths for its lane git exec: written (unchanged ones included; git add is a no-op for them) and removed. */
const tracked = (files) => ({ add: files.filter((f) => f.op !== "rm").map((f) => f.path), remove: files.filter((f) => f.op === "rm").map((f) => f.path) });

/** Plays one P2 step as agent view `a` (SCRIPTS.md §5). */
async function playStep(a, k, s, ctx) {
  const lane = s.lane, tree = ctx.trees.get(lane), opts = { ...ctx.p2.options(lane), untracked: !!ctx.untracked }, label = s.id, work = ctx.work;
  a.label(label);
  a.rec.tree = tree;
  const now = () => performance.now();
  switch (s.kind) {
    case "fs": {
      const real = (s.files ?? []).filter((f) => f.op === "write" || f.op === "rm");
      const fake = (s.files ?? []).filter((f) => f.op === "decoy");
      if (real.length) await writeOp(a, lane, real, tree, label, work, opts);
      for (const d of await decoys(a, fake, tree)) {
        await expectCall(a, `${label} decoy ${d.path}`, () => a.lf.fs.write(lane, abs(d.path), d.bytes, `${label} ${d.path}`), s.expect ?? "Committed");
        tree.set(d.path, { mode: d.mode, blob: `decoy:${s.id}`, size: d.bytes.length });
        work.fs++; work.commits++;
        countMutation(work, "fs", { ...d, size: d.bytes.length });
        ctx.events.push({ kind: "decoy", step: s.id, at: now() });
      }
      await laneGit(a, k, s, ctx, { add: [...real.filter((f) => f.op === "write"), ...fake].map((f) => f.path), remove: real.filter((f) => f.op === "rm").map((f) => f.path) });
      if (ctx.measured) await reads(a, lane, s, tree);
      return;
    }
    case "apply": case "check": {
      if (s.kind === "check") return oneShot(a, lane, label, 0, s.expect ?? "UpToDate", (sb, ws) => checkIds(a, sb, ws, s.files, label));
      const { sandbox } = route(s.files, tree, { ...opts, all: true });
      const want = sandboxExpect(sandbox);
      await oneShot(a, lane, label, sandbox.length, want, async (sb, ws) => execAll(a, sb, ws, await placeCommands(a, sandbox), label, sandbox.length));
      work.sandbox += sandbox.length;
      for (const f of sandbox) countMutation(work, "sandbox", f);
      if (want === "Committed") work.commits++;
      if (want === "Committed") await laneGit(a, k, s, ctx, tracked(sandbox));
      return;
    }
    case "hold-mount": case "stale-mount": {
      const sb = await setup(a);
      const ws = await expectCall(a, `${label} mount`, () => a.lf.sandbox.mount(sb, lane));
      ctx.held.set(ctx.p2.held.get(s.id), { sb, ws, agent: a.rec.agent });
      return;
    }
    case "hold-write": {
      const h = ctx.held.get(ctx.p2.held.get(s.id));
      await execAll(a, h.sb, h.ws, await placeCommands(a, await decoys(a, s.files, tree)), label, s.files.length);
      return;
    }
    case "hold-commit": {
      const h = ctx.held.get(ctx.p2.held.get(s.id));
      a.rec.next = { kind: "files", n: 1 };
      await expectCall(a, `${label} commit`, () => a.lf.sandbox.commit(h.sb, h.ws, label), s.expect ?? "Conflict");
      ctx.events.push({ kind: "commit-conflict", step: s.id, conflictAt: now() });
      return;
    }
    case "hold-resolve": {
      const key = ctx.p2.held.get(s.id), h = ctx.held.get(key);
      ctx.held.delete(key);
      await a.lf.sandbox.unmount(h.sb, h.ws, true);
      await oneShot(a, lane, label, 0, s.expect ?? "UpToDate", (sb, ws) => checkIds(a, sb, ws, s.files, label));
      const c = ctx.events.find((e) => e.kind === "commit-conflict" && e.conflictAt && !e.resolvedAt);
      if (c) c.resolvedAt = now();
      return;
    }
    case "stale-apply": {
      const key = ctx.p2.held.get(s.id), h = ctx.held.get(key);
      ctx.held.delete(key);
      const { sandbox } = route(s.files, tree, { ...opts, all: true });
      let landed = false;
      try {
        await execAll(a, h.sb, h.ws, await placeCommands(a, sandbox), label, sandbox.length);
        a.rec.next = { kind: "files", n: sandbox.length };
        await expectCall(a, `${label} commit`, () => a.lf.sandbox.commit(h.sb, h.ws, label), s.expect ?? "Committed");
        landed = true;
      } finally {
        await a.lf.sandbox.unmount(h.sb, h.ws, !landed);
      }
      work.sandbox += sandbox.length;
      for (const f of sandbox) countMutation(work, "sandbox", f);
      work.commits++;
      await laneGit(a, k, s, ctx, tracked(sandbox));
      ctx.events.push({ kind: "stale-clean-merge", step: s.id, at: now() });
      return;
    }
    default: throw new Error(`no P2 player for step kind ${s.kind}`);
  }
}

/**
 * Plays range k's agent steps: one task per agent, its steps in plan order,
 * each step after its barriers. The first failure rejects every barrier
 * still pending, so no agent waits forever; agents in a call finish it, then
 * stop. Held Workspaces left by a failure are unmounted (discarded).
 */
export async function playAgents(run, k, ctx) {
  const done = new Map(), settle = new Map();
  for (const list of ctx.p2.agents.values()) for (const s of list) {
    done.set(s.id, new Promise((resolve, reject) => settle.set(s.id, { resolve, reject })));
    done.get(s.id).catch(() => {});
  }
  let failure = null;
  const fail = (error) => {
    failure ??= error;
    for (const [, x] of settle) x.reject(failure);
  };
  const views = new Map();
  for (const agent of ctx.p2.agents.keys()) {
    const n = Number(agent.slice(1));
    views.set(agent, await run.agent(agent, run.pool[poolOf(n, run.pool.length)]));
  }
  ctx.steps = new Map([...ctx.p2.agents.keys()].map((a) => [a, 0]));
  const task = async (agent) => {
    const a = views.get(agent);
    for (const s of ctx.p2.agents.get(agent)) {
      for (const id of s.after) if (done.has(id)) await done.get(id);
      if (failure) return;
      await playStep(a, k, s, ctx);
      ctx.steps.set(agent, ctx.steps.get(agent) + 1);
      const by = ctx.played.get(agent) ?? ctx.played.set(agent, { fs: 0, sandbox: 0, branch: 0, project: 0 }).get(agent);
      by[STEP_KINDS[s.kind]]++;
      settle.get(s.id).resolve();
    }
  };
  await Promise.all([...ctx.p2.agents.keys()].map((agent) => task(agent).catch(fail)));
  for (const [key, h] of ctx.held) { try { await run.lf.sandbox.unmount(h.sb, h.ws, true); } catch { /* reported by the failure */ } ctx.held.delete(key); }
  if (failure) throw failure;
}

/** The files a lane changed against the range's base (path -> entry, null when removed). */
export function laneChanges(base, tree) {
  const out = new Map();
  for (const [p, v] of tree.files) { const b = base.get(p); if (!b || b.blob !== v.blob || b.mode !== v.mode) out.set(p, v); }
  for (const p of base.keys()) if (!tree.files.has(p)) out.set(p, null);
  return out;
}

/** The lead's expected tree after every lane merged: the base plus each lane's changes. */
export function mergedTree(base, trees) {
  const t = new Tree(base);
  for (const tree of trees) for (const [p, v] of laneChanges(base, tree)) { if (v) t.set(p, v); else t.delete(p); }
  return t;
}

/** Starts range k: the pool, the lead's Branch and one Branch per lane, forked from main (one lead step). */
/** The size merge/decide.rs reads /.lww up to (compare/text.rs MAXIMUM_TEXT_BYTES); a larger file is ignored as absent. */
export const LWW_MAX_BYTES = 1 << 20;

export async function startRange(run, k, plan, measured) {
  await pool(run, k, plan.agents.length);
  const base = lsTree(run.repo, run.state.prevCommit).files;
  const ctx = { untracked: !!PHASES[run.manifest.phase]?.closure, p2: p2Plan(plan, new Set(new Tree(base).dirs.keys())), base, trees: new Map(plan.lanes.map((l) => [l.name, new Tree(base)])), held: new Map(), events: [], measured,
    work: { fs: 0, sandbox: 0, commits: 0 }, lead: `r${pad(k)}-main`, leadSteps: [], merged: new Map(), tries: new Map(), published: new Set(), played: new Map() };
  run.label(`r${pad(k)}.fork`);
  await expectCall(run, `r${pad(k)} fork`, () => run.lf.branch.fork(ctx.lead, "main"), "Forked");
  // P3 (owner S4): /.lww from every .gitignore of the range's base, on the lead's Branch, whose rules a lane
  // merge reads (branch.rs: merge with a's /.lww); written only when its text changes, so main carries it on
  if (ctx.untracked) {
    const texts = new Map();
    for (const p of gitignores([...base.keys()])) texts.set(p, (await run.blobs().get(base.get(p).blob)).toString("utf8"));
    const { text, sources } = generateLww(texts), sha = createHash("sha256").update(text).digest("hex");
    ctx.lww = { written: run.state.lwwSha !== sha, sha, lines: text.split("\n").filter(Boolean).length, bytes: Buffer.byteLength(text), sources, picks: [] };
    // merge/decide.rs reads /.lww through read_all_bounded(MAXIMUM_TEXT_BYTES = 1 MiB) and treats a larger file as absent: never silently
    if (ctx.lww.bytes > LWW_MAX_BYTES) throw new Mismatch(`r${pad(k)}: the generated /.lww is ${ctx.lww.bytes} bytes, over the 1 MiB the merge reads (compare/text.rs MAXIMUM_TEXT_BYTES); its rules would be ignored`);
    if (ctx.lww.written) {
      run.label(`r${pad(k)}.lww`);
      await expectCall(run, `r${pad(k)} write /.lww`, () => run.lf.fs.write(ctx.lead, "/.lww", Buffer.from(text), "replay /.lww from every .gitignore (owner S4)"), "Committed");
      run.state.lwwSha = sha;
      ctx.work.commits++;
    }
  }
  // F-031 option (c): the seed on the first git range's lead Branch; its lanes then fork from the lead, so they have .git
  ctx.git = ctx.untracked ? gitContext(run, plan) : null;
  ctx.checkpoint = plan.checkpoint;
  if (ctx.git && !run.state.gitSeeded) { await seedGit(run, k, ctx); run.progress?.(`git seed ${ctx.git.seed.wallMs} ms`); }
  const from = ctx.git?.seed ? ctx.lead : "main";
  for (const l of plan.lanes) await expectCall(run, `r${pad(k)} fork ${l.name}`, () => run.lf.branch.fork(l.name, from), "Forked");
  ctx.leadSteps.push({ op: "fork", category: "branch" });
  return ctx;
}

/**
 * The lead's consolidation (SPEC §2): each lane merged into the lead's
 * Branch (a new Branch per merge, `r<k>-main-<n>`), the planned race (the
 * first raced lane publishes while the lead merges the second; the
 * published lane is then merged again), the reconcile on the result and its
 * publish (P3: the closure first, `beforePublish`). Returns the publish's answer.
 */
export async function consolidateLanes(run, k, plan, ctx, { beforePublish = null } = {}) {
  let cur = ctx.lead, n = 0;
  const changes = (lane) => laneChanges(ctx.base, ctx.trees.get(lane)).size;
  const merge = async (who, lane, want = "Merged") => {
    const name = `${ctx.lead}-${++n}`;
    who.label(`r${pad(k)}.merge ${lane}`);
    who.rec.next = { kind: "entries", n: changes(lane) };
    ctx.tries.set(lane, (ctx.tries.get(lane) ?? 0) + 1);
    const v = await expectCall(who, `r${pad(k)} merge ${lane}`, () => who.lf.branch.merge(cur, lane, name, `merge ${lane}`), want);
    run.progress?.(`merge ${lane}: ${v?.kind}`);
    if (v?.kind === "Merged") { cur = name; ctx.merged.set(lane, (ctx.merged.get(lane) ?? 0) + 1); if (v.fastForward === false) ctx.work.commits++; }
    // LWW picks counted from the merge's own list (F-041: its truncated flag alone is not trusted)
    if (ctx.lww && Array.isArray(v?.lww)) ctx.lww.picks.push({ lane, picks: v.lww.length, nodeModules: v.lww.filter((d) => /(^|\/)node_modules(\/|$)/.test(d.path ?? "")).length, truncatedFlag: v.lwwTruncated ?? null, decided: v.decided ?? null });
    return v;
  };
  for (const c of consolidationSteps(plan.consolidation)) {
    if (c.op === "merge") {
      await merge(run, c.lane);
      ctx.leadSteps.push({ op: c.again ? "merge again" : "merge", category: "branch" });
    } else if (c.op === "race") {
      const publisher = await run.agent("lead", run.pool[0]);
      publisher.label(`r${pad(k)}.race publish ${c.publish}`);
      const t0 = performance.now();
      const [, m] = await Promise.all([
        expectCall(publisher, `r${pad(k)} race publish ${c.publish}`, () => publisher.lf.branch.publish(c.publish), "Added").then((v) => { ctx.published.add(c.publish); return v; }),
        merge(run, c.merge, "Merged|Conflict"),
      ]);
      ctx.leadSteps.push({ op: "race publish", category: "branch" }, { op: "race merge", category: "branch" });
      // a raced merge that lost is merged again, in plan order, after the published lane
      ctx.race = { publish: c.publish, merge: c.merge, mergeKind: m?.kind, t0 };
      if (m?.kind === "Conflict") ctx.race.again = c.merge;
    } else if (c.op === "reconcile") {
      if (ctx.race?.again) { await merge(run, ctx.race.again); ctx.leadSteps.push({ op: "merge again", category: "branch" }); ctx.race.again = null; }
      ctx.mainTree = mergedTree(ctx.base, [...ctx.trees.values()]);
      run.label(`r${pad(k)}.reconcile`);
      await writeOp(run, cur, ctx.p2.reconcile, ctx.mainTree, `r${pad(k)}.reconcile`, ctx.work, { untracked: !!ctx.untracked });
      ctx.leadSteps.push({ op: "reconcile", category: "fs" });
    } else if (c.op === "publish") {
      if (ctx.race?.again) { await merge(run, ctx.race.again); ctx.leadSteps.push({ op: "merge again", category: "branch" }); ctx.race.again = null; }
      if (ctx.race && ctx.race.doneAt == null) ctx.race.doneAt = performance.now();
      ctx.mainTree ??= mergedTree(ctx.base, [...ctx.trees.values()]);
      // F-031 option (c): the lead writes every dsh commit of the range, before the closure
      if (ctx.git) { run.progress?.("lead git start"); await leadGit(run, k, plan, ctx, cur); run.progress?.(`lead git ${ctx.git.lead.wallMs} ms; fresh status ${ctx.git.fresh?.wallMs} ms`); }
      // P3: the closure's install, build and tests, each with its own Commit on the Branch published next
      if (beforePublish) { run.progress?.("closure start"); ctx.closure = await beforePublish(cur); run.progress?.("closure done"); }
      run.label(`r${pad(k)}.publish`);
      const v = await expectCall(run, `r${pad(k)} publish`, () => run.lf.branch.publish(cur), "Added");
      ctx.leadSteps.push({ op: "publish", category: "branch" });
      ctx.final = cur;
      return v;
    }
  }
  throw new Error("the consolidation has no publish");
}
