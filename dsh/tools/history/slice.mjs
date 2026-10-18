#!/usr/bin/env node
// A dev slice of one range (F-031 and NODE_RULE build, liaison 2026-10-19):
// the range's first mainline steps until `--commits` dsh commits, planned with
// the same planner, seed and limits as plan.mjs, so its checkpoint is a real
// dsh mainline commit and every proof (HEAD = checkpoint, tree = git) holds
// for it. Dev runs only: a slice is never a measured range.
//   node dsh/tools/history/slice.mjs --repo <dsh.git> --plan <full plan dir> --out <dir> --range k --commits N
// It writes <out>/plan/ (plan.json with the slice's row, range-(k-1).json and
// range-k.json) and <out>/oracle/ (oracle-k.json, node_modules -> the shared
// native cache); `run.mjs fork --plan <out>/plan --oracle <out>/oracle` points
// a dev run at them. Calibrate its tests with calibrate-tests.mjs --plan <out>/plan.
import { copyFileSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BlobCache, blobSizes, diffTrees, git, lsTree, readCommits, topoPositions } from "./git.mjs";
import { cutRanges, mainlineSteps, snapshotPolicy } from "./ranges.mjs";
import { dirCounts, LIMITS, planRange, replayPlan, stateDiff } from "./plan-range.mjs";
import { apply, summarize } from "./plan.mjs";
import { selectTests } from "./unit-tests.mjs";
import { expectations, expectedTree, IGNORE } from "./oracle.mjs";

const pad = (n) => String(n).padStart(3, "0");

/** The first mainline steps of `range` holding at least `commits` dsh commits, as a range of its own. */
export function sliceRange(range, commits) {
  const steps = [];
  let n = 0;
  for (const s of range.steps) { steps.push(s); n += s.commits.length; if (n >= commits) break; }
  return { ...range, steps, commits: n, checkpoint: steps.at(-1).mainline, tree: steps.at(-1).tree, oversize: false, slice: { of: range.checkpoint, steps: steps.length, of_steps: range.steps.length } };
}

async function main() {
  const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  const repo = opt("--repo"), full = opt("--plan"), out = opt("--out"), k = Number(opt("--range")), want = Number(opt("--commits"));
  if (!repo || !full || !out || !Number.isInteger(k) || k < 1 || !(want > 0)) { console.error("usage: slice.mjs --repo <dsh.git> --plan <dir> --out <dir> --range k --commits N"); process.exit(2); }
  const summary = JSON.parse(readFileSync(join(full, "plan.json"), "utf8"));
  const commits = readCommits(repo, summary.head), pos = topoPositions(repo, summary.head);
  const ranges = cutRanges(mainlineSteps(commits, pos, summary.head));
  const prevPlan = JSON.parse(readFileSync(join(full, `range-${pad(k - 1)}.json`), "utf8"));
  if (ranges[k - 1].checkpoint !== prevPlan.checkpoint) throw new Error(`range ${k - 1}'s checkpoint differs from the plan's; the plan is not this history's`);
  const range = sliceRange(ranges[k], want);
  const prev = lsTree(repo, prevPlan.checkpoint).files, net = diffTrees(repo, prevPlan.checkpoint, range.checkpoint), next = apply(new Map(prev), net);
  const sizes = blobSizes(repo, [...range.steps.flatMap((s) => s.commits.flatMap((id) => commits.get(id).changes.map((x) => x.blob))), ...net.map((x) => x.blob)]);
  const policy = snapshotPolicy(ranges.length)(k);
  const plan = planRange({ k, range, commits, prev, next, prevDirs: dirCounts(prev), sizes, seed: summary.seed, ...policy, limits: LIMITS });
  const played = replayPlan(prev, plan), diff = stateDiff(played.state, next);
  if (played.problems.length || diff.length) throw new Error(`the slice does not reach its checkpoint: ${[...played.problems, ...diff.slice(0, 5)].join("; ")}`);
  const blobs = new BlobCache(repo);
  try { plan.closure.tests = await selectTests({ state: next, changed: net.map((c) => c.path), milestone: plan.milestone, read: (id) => blobs.get(id) }); } finally { blobs.close(); }
  plan.slice = range.slice;
  const planDir = join(out, "plan"), oracleDir = join(out, "oracle");
  mkdirSync(planDir, { recursive: true }); mkdirSync(oracleDir, { recursive: true });
  writeFileSync(join(planDir, `range-${pad(k)}.json`), JSON.stringify(plan));
  copyFileSync(join(full, `range-${pad(k - 1)}.json`), join(planDir, `range-${pad(k - 1)}.json`));
  const rows = [...summary.ranges]; rows[k] = summarize(plan);
  writeFileSync(join(planDir, "plan.json"), JSON.stringify({ ...summary, slice: { range: k, commits: range.commits, checkpoint: range.checkpoint, of: range.slice.of, from: full }, ranges: rows }, null, 1));
  // the checkpoint oracle (oracle.mjs build, for the slice's range only); native node_modules oracles stay shared
  const tree = expectedTree(repo, plan.checkpoint), bsz = blobSizes(repo, [...tree.values()].map((v) => v.blob)), modes = {};
  for (const v of tree.values()) modes[v.mode] = (modes[v.mode] || 0) + 1;
  writeFileSync(join(oracleDir, `oracle-${pad(k)}.json`), JSON.stringify({ range: k, checkpoint: plan.checkpoint, tree: plan.tree, files: tree.size, bytes: [...tree.values()].reduce((n, v) => n + (bsz.get(v.blob) ?? 0), 0), modes,
    ignore: IGNORE, ignoredOutput: plan.closure.install ? ["node_modules/.modules.yaml"] : [], tests: plan.closure.tests, expect: expectations(plan), slice: plan.slice }, null, 1));
  const shared = join(process.env.LFS_HISTORY ?? join(process.env.HOME, "lfs-history"), "oracle", "node_modules");
  if (!existsSync(join(oracleDir, "node_modules"))) symlinkSync(shared, join(oracleDir, "node_modules"));
  console.log(JSON.stringify({ range: k, checkpoint: plan.checkpoint, dshCommits: plan.dsh.commits, lanes: plan.lanes.map((l) => l.name), agents: plan.agents.length, steps: plan.steps.length, tests: plan.closure.tests.files.length, install: plan.closure.install, plan: planDir, oracle: oracleDir }, null, 1));
  void git;
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
