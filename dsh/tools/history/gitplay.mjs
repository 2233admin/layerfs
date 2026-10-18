// F-031 owner option (c) played (F031_DESIGN.md; scripts in gitlanes.mjs):
// the seed on the first git range's lead Branch, a git exec after each lane
// step that changes tracked files, and the lead's writing of every dsh commit
// before the closure. On only when the run's manifest says so (`run.mjs git`),
// in a closure phase; dev runs prove it before any measured range uses it.
import { execAll, expectCall, Mismatch, scratchDir, setup } from "./lib.mjs";
import { git } from "./git.mjs";
import { catFiles, finishScript, GIT_ENV, JOB_DIR, jobBytes, laneCommands, LEAD_WRITER, leadJob, marks, parseCommit, seedOps, seedScript, statusLines, statusProbe } from "./gitlanes.mjs";
import { pad, quote } from "./steps.mjs";

/** Per-exec deadline of the lead's commit writer: each exec stays well under the 120 s command ceiling. */
export const WRITER_DEADLINE_MS = 80_000;

/** One-shot Workspace on `branch`: the exec commands, Commit (`want`), unmount. Returns the results and the wall. */
async function oneShot(who, branch, label, commands, want = "Committed", between = null) {
  const sb = await setup(who), t0 = performance.now();
  const ws = await expectCall(who, `${label} mount`, () => who.lf.sandbox.mount(sb, branch));
  let landed = false;
  try {
    const results = await execAll(who, sb, ws, commands, label);
    if (between) results.push(...await between(sb, ws));
    who.rec.next = { kind: "files", n: 0 };
    await expectCall(who, `${label} commit`, () => who.lf.sandbox.commit(sb, ws, label), want);
    landed = true;
    return { results, ms: Math.round(performance.now() - t0) };
  } finally {
    await who.lf.sandbox.unmount(sb, ws, !landed);
  }
}

/** The git state of a range, or null when git is off: dates of the steps' dsh commits, per-lane locks, counters. */
export function gitContext(run, plan) {
  if (!run.manifest.git?.on) return null;
  const ids = [...new Set(plan.steps.map((s) => s.commit).filter(Boolean)), plan.checkpoint];
  const raw = catFiles(run.repo, ids), dates = new Map(ids.map((id) => [id, parseCommit(raw.get(id)).committer.date]));
  return { dates, locks: new Map(), lane: { execs: 0, commits: 0, wallMs: 0, gitMs: 0, status: [] }, seed: null, lead: null };
}

/** The seed (first git range): fs.apply of the packed `.git` on the lead Branch, then the index and its checks. */
export async function seedGit(run, k, ctx) {
  const label = `r${pad(k)}.git-seed`, { ops, facts } = seedOps(run.repo, run.state.prevCommit);
  run.label(label);
  const t0 = performance.now();
  await expectCall(run, `${label} apply`, () => run.lf.fs.apply(ctx.lead, ops, "replay .git seed (F-031 option (c))"), "Committed");
  const { results, ms } = await oneShot(run, ctx.lead, label, [seedScript(run.state.prevCommit, facts.commits)]);
  const out = results.at(-1).stdout;
  ctx.work.commits += 2;
  ctx.git.seed = { ...facts, ...marks(out), status: statusLines(out), execWallMs: ms, wallMs: Math.round(performance.now() - t0) };
  delete ctx.git.seed.files;
  run.state.gitSeeded = k; // saved with the range (advance); a stopped range leaves the run dirty anyway
}

/**
 * The lane's git exec after step `s` landed: its written and decoy paths
 * added, its removed paths removed from the lane index, one lane commit.
 * One at a time per lane (the lane index and ref are single files).
 */
export async function laneGit(a, k, s, ctx, { add, remove }) {
  if (!ctx.git || (!add.length && !remove.length)) return;
  const lane = s.lane, prev = ctx.git.locks.get(lane) ?? Promise.resolve();
  const run = async () => {
    const label = `${s.id}.git`, status = Number(String(s.id).replace(/^.*\.s/, "")) % 10 === 0;
    a.label(label);
    const commands = laneCommands({ lane, add, remove, message: `${s.id} (dsh ${String(s.commit ?? "none").slice(0, 12)})`, date: ctx.git.dates.get(s.commit) ?? ctx.git.dates.get(ctx.checkpoint), status }, scratchDir());
    const { results, ms } = await oneShot(a, lane, label, commands);
    const m = marks(results.at(-1).stdout), g = ctx.git.lane;
    g.execs++; g.commits++; g.wallMs += ms; g.gitMs += m.gitMs ?? 0;
    if (status) g.status.push({ step: s.id, ms: m.statusMs, lines: m.statusLines });
    ctx.work.commits++;
  };
  const next = prev.then(run);
  ctx.git.locks.set(lane, next.catch(() => {}));
  return next;
}

/**
 * The lead's git work on the merged Branch `cur`, before the closure: the
 * job (and the blobs no step writes) by fs.apply, then one Workspace whose
 * execs unpack those blobs, write every dsh commit (each exec under the
 * writer deadline) and finish (main, index, repack, lane refs gone, checks).
 */
export async function leadGit(run, k, plan, ctx, cur) {
  const label = `r${pad(k)}.git-lead`, t0 = performance.now();
  // blobs a lane's git add wrote: lane step writes (the reconcile's are on the lead Branch, never added; they travel in the pack)
  const written = new Set();
  for (const s of plan.steps) for (const f of s.files ?? []) if (f.op === "write" && f.blob) written.add(f.blob);
  const job = leadJob(run.repo, run.state.prevCommit, plan.checkpoint, written), bytes = jobBytes(job.commits);
  run.label(label);
  const ops = [{ op: "mkdir", path: `/${JOB_DIR}` }, { op: "write", path: `/${JOB_DIR}/job.json.gz`, bytes }, ...(job.pack ? [{ op: "write", path: `/${JOB_DIR}/missing.pack`, bytes: job.pack }] : [])];
  await expectCall(run, `${label} job`, () => run.lf.fs.apply(cur, ops, "replay .git lead job (F-031 option (c))"), "Committed");
  const prepMs = Math.round(performance.now() - t0), index = `/tmp/lfs352-lead-${process.pid}-${k}.index`, writer = { execs: 0, writerMs: 0, readTrees: 0 };
  const between = async (sb, ws) => {
    const out = [];
    for (let next = 0; next < job.commits.length;) {
      const r = await expectCall(run, `${label} writer`, () => run.lf.sandbox.exec(sb, ws, `${GIT_ENV}; node -e ${quote(LEAD_WRITER)} ${JOB_DIR}/job.json.gz ${index} ${next} ${WRITER_DEADLINE_MS}`));
      if (r.refused) throw new Mismatch(`${label} writer refused: ${r.refused.code ?? ""} ${String(r.refused.message ?? "").slice(0, 300)}`);
      if (r.exitCode !== 0) throw new Mismatch(`${label} writer exited ${r.exitCode} at commit ${next}: ${String(r.stderr ?? "").slice(0, 400)}`);
      const m = marks(r.stdout);
      if (!(m.next > next)) throw new Mismatch(`${label} writer made no progress at commit ${next}`);
      next = m.next; writer.execs++; writer.writerMs += m.writerMs ?? 0; writer.readTrees += m.readTrees ?? 0;
      out.push(r);
    }
    out.push(...await execAll(run, sb, ws, [`${finishScript({ checkpoint: plan.checkpoint, prev: run.state.prevCommit, count: job.commits.length })}\nrm -f ${index}`], `${label} finish`));
    return out;
  };
  const unpack = job.pack ? [`set -e; ${GIT_ENV}; git unpack-objects -q < ${JOB_DIR}/missing.pack`] : [`rm -f ${index}`];
  const { results, ms } = await oneShot(run, cur, label, unpack, "Committed", between);
  ctx.work.commits += 2;
  const out = results.at(-1).stdout, f = marks(out), tree = git(run.repo, ["rev-parse", `${plan.checkpoint}^{tree}`]).trim();
  ctx.git.lead = { commits: job.commits.length, merges: job.commits.filter((c) => c.parents.length > 1).length, jobBytes: bytes.length, missing: job.missing, ...writer, ...f,
    headOk: f.head === plan.checkpoint, treeOk: f.tree === tree, status: statusLines(out), prepMs, workspaceMs: ms, wallMs: Math.round(performance.now() - t0) };
  const l = ctx.git.lead;
  if (!l.headOk || !l.treeOk) throw new Mismatch(`${label}: HEAD ${f.head} tree ${f.tree}, dsh has ${plan.checkpoint} tree ${tree}`);
  if (l.refsLeft) throw new Mismatch(`${label}: ${l.refsLeft} lane refs left`);
  if (l.statusLines) throw new Mismatch(`${label}: git status --porcelain lists ${l.statusLines} lines at the checkpoint: ${l.status.slice(0, 5).join("; ")}`);
  await freshStatus(run, k, ctx, cur);
}

/**
 * The FUSE stat check (owner; liaison condition 2026-10-18): `git status
 * --porcelain` in a fresh one-shot Workspace on the checkpoint, timed. It must
 * be clean and read back no tracked file (git trace2 refresh/sum_scan 0: every
 * index entry's inode, ctime and mtime still match after a remount). The
 * Workspace is discarded, so an index rewrite there changes nothing.
 */
export async function freshStatus(run, k, ctx, branch) {
  const label = `r${pad(k)}.git-status`, sb = await setup(run);
  run.label(label);
  const t0 = performance.now();
  const ws = await expectCall(run, `${label} mount`, () => run.lf.sandbox.mount(sb, branch));
  let r;
  try { [r] = await execAll(run, sb, ws, [`${GIT_ENV}\n${statusProbe()}`], label); } finally { await run.lf.sandbox.unmount(sb, ws, true); }
  const m = marks(r.stdout);
  ctx.git.fresh = { ...m, status: statusLines(r.stdout), wallMs: Math.round(performance.now() - t0) };
  if (m.statusLines) throw new Mismatch(`${label}: git status --porcelain in a fresh Workspace lists ${m.statusLines} lines: ${ctx.git.fresh.status.slice(0, 5).join("; ")}`);
  if (m.sumScan) throw new Mismatch(`${label}: git status in a fresh Workspace read back ${m.sumScan} of ${m.sumLstat} tracked files (stat data changed across the remount; index changed ${m.indexChanged})`);
}

/** The range's git facts for the metrics (null when git is off). */
export const gitFacts = (ctx) => (ctx?.git ? { seed: ctx.git.seed, lane: ctx.git.lane, lead: ctx.git.lead, fresh: ctx.git.fresh ?? null } : null);
