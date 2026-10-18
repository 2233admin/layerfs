#!/usr/bin/env node
// Each range's oracle (#352 SPEC §2, §7): what its checkpoint must prove.
//   node dsh/tools/history/oracle.mjs build --repo <dsh.git> --plan <dir> --out <dir>
//   node dsh/tools/history/oracle.mjs checkout --repo <dsh.git> --plan <dir> --dir <work tree> --range N
// `build` writes oracle-NNN.json: the checkpoint commit and tree, its file
// count and bytes, and the history, step outcomes and conflicts the plan
// expects. The tree itself is read from git when a checkpoint is verified
// (expectedTree), so no file list is stored. `checkout` moves one working tree
// to a range's checkpoint; git rewrites only the files that changed.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { blobSizes, checkout, lsTree } from "./git.mjs";

/** Paths the replay adds that git does not have; the tree comparison leaves them out. */
// .lww: the replay's generated last-writer-wins rules (owner S4), replay infrastructure like the probe fixture
export const IGNORE = [".lfs-probe/", ".lww", ".git/"];

/** What a range's plan expects LayerFS to show at its checkpoint. */
export function expectations(plan) {
  const byLane = Object.fromEntries(plan.lanes.map((l) => [l.name, 0]));
  const outcomes = {};
  for (const s of plan.steps) {
    byLane[s.lane] += s.commits;
    if (s.expect) outcomes[s.expect] = (outcomes[s.expect] || 0) + 1;
    for (const f of s.files || []) if (f.expect) outcomes[f.expect] = (outcomes[f.expect] || 0) + 1;
  }
  const reconcile = plan.consolidation.find((c) => c.op === "reconcile")?.files.length ?? 0;
  return {
    branches: byLane,
    main: { merges: plan.lanes.length, reconcile, install: plan.closure.install ? 1 : 0 },
    outcomes,
    conflicts: plan.conflicts,
    steps: plan.steps.length,
  };
}

/** The checkpoint's files from git: path -> { mode, blob }. */
export function expectedTree(repo, commit) {
  return lsTree(repo, commit).files;
}

/**
 * Compares a replayed tree (path -> { mode, blob }, blob = git blob id of the
 * bytes LayerFS returned) with the checkpoint's. Mode is compared as git sees
 * it: regular, executable or symlink.
 */
export function compareTree(expected, actual, ignore = IGNORE, outputs = null) {
  const skip = (p) => ignore.some((i) => p.startsWith(i)) || !!outputs?.test(p);
  const out = { missing: [], extra: [], content: [], mode: [] };
  for (const [p, e] of expected) {
    const a = actual.get(p);
    if (!a) out.missing.push(p);
    else if (a.blob !== e.blob) out.content.push(p);
    else if (a.mode !== e.mode) out.mode.push(p);
  }
  for (const p of actual.keys()) if (!skip(p) && !expected.has(p)) out.extra.push(p);
  out.ok = !out.missing.length && !out.extra.length && !out.content.length && !out.mode.length;
  out.files = expected.size;
  return out;
}

const pad = (n) => String(n).padStart(3, "0");

function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  const repo = opt("--repo"), planDir = opt("--plan");
  if (cmd === "build" && repo && planDir && opt("--out")) {
    const out = opt("--out");
    mkdirSync(out, { recursive: true });
    for (const f of readdirSync(planDir).filter((f) => /^range-\d+\.json$/.test(f)).sort()) {
      const plan = JSON.parse(readFileSync(join(planDir, f), "utf8"));
      const tree = expectedTree(repo, plan.checkpoint);
      const sizes = blobSizes(repo, [...tree.values()].map((v) => v.blob));
      const bytes = [...tree.values()].reduce((n, v) => n + (sizes.get(v.blob) ?? 0), 0);
      const modes = {};
      for (const v of tree.values()) modes[v.mode] = (modes[v.mode] || 0) + 1;
      writeFileSync(join(out, `oracle-${pad(plan.range)}.json`), JSON.stringify({
        range: plan.range, checkpoint: plan.checkpoint, tree: plan.tree, files: tree.size, bytes, modes,
        ignore: IGNORE, ignoredOutput: plan.closure.install ? ["node_modules/.modules.yaml"] : [],
        tests: plan.closure.tests, expect: expectations(plan),
      }, null, 1));
    }
    console.log(`oracles written to ${out}`);
  } else if (cmd === "checkout" && repo && planDir && opt("--dir") && opt("--range")) {
    const plan = JSON.parse(readFileSync(join(planDir, `range-${pad(Number(opt("--range")))}.json`), "utf8"));
    checkout(repo, opt("--dir"), plan.checkpoint);
    console.log(`${opt("--dir")} at ${plan.checkpoint}`);
  } else {
    console.error("usage: oracle.mjs build --repo <dsh.git> --plan <dir> --out <dir>\n       oracle.mjs checkout --repo <dsh.git> --plan <dir> --dir <work tree> --range N");
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
