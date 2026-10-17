#!/usr/bin/env node
// Writes the history replay's plan (#352 SPEC §2) from a bare clone of dsh:
//   node dsh/tools/history/plan.mjs --repo <dsh.git> --out <dir> [--ref master] [--seed 352] [--from N]
// <out>/range-NNN.json holds one range's plan; <out>/plan.json the summary.
// The plan only moves forward: --from N rewrites ranges N and later and
// leaves earlier ranges, whose checkpoints may already be proved, untouched.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { blobSizes, diffTrees, git, lsTree, readCommits, topoPositions } from "./git.mjs";
import { cutRanges, mainlineSteps, RANGE, snapshotPolicy } from "./ranges.mjs";
import { dirCounts, LIMITS, planRange, replayPlan, stateDiff } from "./plan-range.mjs";

export const PLAN_VERSION = 1;

/** Applies raw changes to a state (path -> {mode, blob}) in place. */
export function apply(state, changes) {
  for (const c of changes) {
    if (c.gitlink) continue;
    if (c.mode === "000000") state.delete(c.path); else state.set(c.path, { mode: c.mode, blob: c.blob });
  }
  return state;
}

/** The numbers SPEC §3b reports for a range, as the plan expects them. */
export function summarize(plan) {
  const kinds = {};
  for (const s of plan.steps) kinds[s.kind] = (kinds[s.kind] || 0) + 1;
  const reconcile = plan.consolidation.find((c) => c.op === "reconcile")?.files.length ?? 0;
  const merges = plan.consolidation.filter((c) => c.op === "merge").length;
  const oneShot = (kinds.apply || 0) + (kinds.check || 0) + (kinds["hold-resolve"] || 0) + (plan.closure.install ? 1 : 0) + 1;
  const longLived = (kinds["stale-mount"] || 0) + (kinds["hold-mount"] || 0);
  const perAgent = Object.fromEntries(plan.agents.map((a) => [a, { steps: 0, commits: 0 }]));
  for (const s of plan.steps) { perAgent[s.agent].steps++; perAgent[s.agent].commits += s.commits; }
  const perLane = Object.fromEntries(plan.lanes.map((l) => [l.name, plan.steps.filter((s) => s.lane === l.name).reduce((n, s) => n + s.commits, 0)]));
  return {
    range: plan.range, checkpoint: plan.checkpoint, dshCommits: plan.dsh.commits, mainline: plan.dsh.mainline,
    lanes: plan.lanes.length, agents: plan.agents.length, steps: plan.steps.length, kinds,
    bashCalls: plan.steps.length + plan.consolidation.length + (plan.closure.install ? 1 : 0) + 1,
    workspaces: oneShot + longLived, oneShot, oneShotShare: +(oneShot / (oneShot + longLived)).toFixed(3),
    fileMutations: { fs: plan.counts.fsFiles, sandbox: plan.counts.sandboxFiles },
    lfsCommits: plan.steps.reduce((n, s) => n + s.commits, 0) + merges + reconcile + (plan.closure.install ? 1 : 0),
    perLane, perAgent, reads: plan.steps.reduce((n, s) => n + (s.reads?.length || 0), 0),
    conflicts: plan.conflicts.map((c) => c.kind), reconcile, install: plan.closure.install,
    snapshot: plan.snapshot, milestone: plan.milestone, dropped: plan.counts.dropped, typeRisk: plan.counts.typeRisk,
  };
}

function main() {
  const args = process.argv.slice(2);
  const opt = (n, d) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
  const repo = opt("--repo"), out = opt("--out"), ref = opt("--ref", "master"), seed = opt("--seed", "352"), from = Number(opt("--from", "0"));
  if (!repo || !out) { console.error("usage: plan.mjs --repo <dsh.git> --out <dir> [--ref master] [--seed 352] [--from N]"); process.exit(2); }
  const t0 = Date.now(), lap = (m) => console.error(`${((Date.now() - t0) / 1000).toFixed(1)} s  ${m}`);
  const head = git(repo, ["rev-parse", ref]).trim();
  const commits = readCommits(repo, head);
  const pos = topoPositions(repo, head);
  lap(`${commits.size} commits`);
  const steps = mainlineSteps(commits, pos, head);
  const ranges = cutRanges(steps);
  const init = steps[0];
  lap(`${steps.length} mainline steps, ${ranges.length} ranges`);
  const nets = [];
  let prevCommit = init.mainline;
  for (const r of ranges) { nets.push(diffTrees(repo, prevCommit, r.checkpoint)); prevCommit = r.checkpoint; }
  const sizes = blobSizes(repo, [...[...commits.values()].flatMap((c) => c.changes.map((x) => x.blob)), ...nets.flat().map((x) => x.blob)]);
  lap(`${sizes.size} blob sizes`);
  mkdirSync(out, { recursive: true });
  const summaryFile = join(out, "plan.json");
  const old = existsSync(summaryFile) ? JSON.parse(readFileSync(summaryFile, "utf8")) : null;
  if (from > 0 && (!old || old.seed !== seed || old.head !== head)) throw new Error("--from needs an existing plan.json with the same seed and head");
  const policy = snapshotPolicy(ranges.length);
  const initTree = lsTree(repo, init.mainline);
  let state = initTree.files;
  const rows = [];
  for (const [i, r] of ranges.entries()) {
    const prev = state, next = apply(new Map(prev), nets[i]);
    if (i >= from) {
      const plan = planRange({ k: i, range: r, commits, prev, next, prevDirs: dirCounts(prev), sizes, seed, ...policy(i), limits: LIMITS });
      // Static check: the plan alone must reach the checkpoint.
      const played = replayPlan(prev, plan);
      const diff = stateDiff(played.state, next);
      if (played.problems.length || diff.length) throw new Error(`range ${i} does not reach its checkpoint: ${[...played.problems, ...diff.slice(0, 5)].join("; ")}`);
      writeFileSync(join(out, `range-${String(i).padStart(3, "0")}.json`), JSON.stringify(plan));
      rows.push(summarize(plan));
    } else rows.push(old.ranges[i]);
    state = next;
    if (i % 25 === 0) lap(`range ${i}`);
  }
  const total = (k) => rows.reduce((n, r) => n + (typeof r[k] === "number" ? r[k] : 0), 0);
  const summary = {
    version: PLAN_VERSION, seed, ref, head, generated: new Date().toISOString(), from,
    init: { commit: init.mainline, tree: init.tree, files: initTree.files.size, gitlinks: initTree.gitlinks },
    rules: { range: RANGE, limits: LIMITS },
    totals: {
      ranges: rows.length, dshCommits: total("dshCommits"), mainline: steps.length, bashCalls: total("bashCalls"),
      steps: total("steps"), workspaces: total("workspaces"), oneShot: total("oneShot"), lfsCommits: total("lfsCommits"),
      reads: total("reads"), reconcile: total("reconcile"), installs: rows.filter((r) => r.install).length,
      snapshots: rows.filter((r) => r.snapshot).length, milestones: rows.filter((r) => r.milestone).map((r) => r.range),
      conflicts: rows.reduce((m, r) => { for (const c of r.conflicts) m[c] = (m[c] || 0) + 1; return m; }, {}),
      fileMutations: rows.reduce((m, r) => ({ fs: m.fs + r.fileMutations.fs, sandbox: m.sandbox + r.fileMutations.sandbox }), { fs: 0, sandbox: 0 }),
    },
    ranges: rows,
  };
  writeFileSync(summaryFile, JSON.stringify(summary, null, 1));
  lap("done");
  console.log(JSON.stringify(summary.totals, null, 1));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
