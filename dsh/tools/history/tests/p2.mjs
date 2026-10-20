// Tests of the P2 player's and the report statistics' pure parts (#352):
// the P2 plan split, consolidation order, phase moves, routing with
// concurrent agents, removals in a Sandbox, FUSE attribution, the call
// records, the wall projection, the call table, the Overview and its F1
// sums, STATS.md and the per-entry fit. Synthetic data only; nothing here
// touches Docker or LayerFS.
//   node dsh/tools/history/tests/p2.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fetchScript } from "../fetch-store.mjs";
import { addedBySource, changedGroupBytes, cumulative, liveParts, sealedParts, seedBySource, stepSource, storageFigures, storageProblems } from "../storage.mjs";
import { CLEAN_REMOVE, installCommand, STORE_MOUNT, parseLister, rootless, verifiedAges, buildBytes, buildListCommand, changedPackages, CLOSURE_OUTPUT, closureSteps, studyMeasurements, compareInstalled, rawChangedBytes, storeSetup, installInputsChanged, listerCommand, normalizeOutput, nothingToBuild, playClosure, tscStates, buildCommand } from "../closure.mjs";
import { PRUNE_EMPTY, repairClean } from "../nodeconfig.mjs";
import { aggregate, buildBaseline, callName, reinstallGate, evaluate, probeSeries, thinClass } from "../gates.mjs";
import { checkFinding } from "../findings.mjs";
import { checkFormat, installedText, issuesAsOf, movers, NONE_LINE, openIssues, renderFindingFormat, renderFormat } from "../format.mjs";
import { parseReport } from "../frozen.mjs";
import { blockTables, findingTableProblems } from "../reportcheck.mjs";
import { baselineFor, leadNote, loadBaselines, probeCommitsOf, probeSetupCommits, regate, writeBaseline } from "../report.mjs";
import { atHead } from "../frozen.mjs";
import { laneChanges, mergedTree } from "../agents.mjs";
import { measure, record } from "../lib.mjs";
import { checkRunner, loadBudget, wallBudget, wallProjection } from "../run.mjs";
import { runnerArgs, runOf } from "../runner.mjs";
import { demux, parseRun } from "../runner/docker-shim.mjs";
import {
  attributeFuse, callOf, comparePaths, diskGuard, markContention, diskModel, changedDirs, outcomeOf, checkpointDiff, consolidationSteps, withDirs, decoyBytes, nextPhase, p2Plan, route, sandboxCommands, STEP_KINDS, Tree,
} from "../steps.mjs";
import {
  buildOverview, callTable, categoryOf, withoutProbeSampleCommits, withoutProbeSetupCommits, categoryRows, CATEGORIES, checkOverview, derivedOverview, renderOverview, renderStats, stageSplit, tenths, timeLine,
} from "../stats.mjs";

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const dir = mkdtempSync(join(tmpdir(), "lfs-history-p2-"));
const f = (blob = "a".repeat(40)) => ({ mode: "100644", blob });

const plan = {
  range: 7, agents: ["a01", "a02", "a03"],
  lanes: [{ name: "r007-1-pk", agents: ["a01", "a02"], commits: 3 }, { name: "r007-2-docs", agents: ["a03"], commits: 1 }],
  steps: [
    { id: "s1", kind: "fs", agent: "a01", lane: "r007-1-pk", order: 1, after: [], files: [{ path: "pk/x/a.ts", op: "write" }] },
    { id: "s2", kind: "hold-mount", agent: "a02", lane: "r007-1-pk", order: 0.6, after: [] },
    { id: "s3", kind: "hold-write", agent: "a02", lane: "r007-1-pk", order: 0.7, after: ["s2"], files: [{ path: "pk/x/a.ts", op: "decoy" }] },
    { id: "s4", kind: "hold-commit", agent: "a02", lane: "r007-1-pk", order: 1.3, after: ["s1", "s3"] },
    { id: "s5", kind: "hold-resolve", agent: "a02", lane: "r007-1-pk", order: 1.4, after: ["s4"], files: [{ path: "pk/x/a.ts" }] },
    { id: "s6", kind: "stale-mount", agent: "a02", lane: "r007-1-pk", order: 0.5, after: [] },
    { id: "s7", kind: "stale-apply", agent: "a02", lane: "r007-1-pk", order: 3, after: ["s6"], files: [{ path: "pk/y/b.ts", op: "write" }] },
    { id: "s8", kind: "apply", agent: "a03", lane: "r007-2-docs", order: 1, after: [], files: [{ path: "docs/c.md", op: "rm" }] },
    { id: "s9", kind: "fs", agent: "a02", lane: "r007-1-pk", order: 4, after: [], files: [{ path: "pk/x/d.ts", op: "write" }] },
  ],
  conflicts: [
    { kind: "commit-conflict", lane: "r007-1-pk", agents: ["a01", "a02"], steps: ["s1", "s2", "s3", "s4", "s5"] },
    { kind: "stale-clean-merge", lane: "r007-1-pk", agents: ["a01", "a02"], steps: ["s6", "s1", "s7"] },
  ],
  consolidation: [{ op: "merge", lane: "r007-1-pk", race: true }, { op: "merge", lane: "r007-2-docs", race: true }, { op: "reconcile", files: [{ path: "z", op: "rm" }] }, { op: "publish" }],
  closure: { install: true, tests: { files: ["t.spec.ts"] } },
};

test("p2Plan: each agent's steps in plan order, held Workspaces, shared folders, the closure left to P3", () => {
  const p = p2Plan(plan, new Set(["pk"]));
  assert.deepEqual(p.agents.get("a02").map((s) => s.id), ["s6", "s2", "s3", "s4", "s5", "s7", "s9"]);
  assert.equal(p.held.get("s4"), "hold:r007-1-pk");
  assert.equal(p.held.get("s7"), "stale:r007-1-pk");
  assert.equal(p.held.has("s1"), false);
  const o = p.options("r007-1-pk");
  assert.equal(o.keep("pk/x"), true, "a01 and a02 both write under pk/x");
  assert.equal(o.keep("docs"), false);
  assert.equal(o.mkdir("pk/x/new.ts"), "pk/x", "pk/x is shared and new");
  assert.equal(o.mkdir("pk/z.ts"), null, "pk existed at the start");
  assert.deepEqual(p.left, { install: 1, tests: 1 });
  assert.deepEqual(p.reconcile, [{ path: "z", op: "rm", expect: "Committed" }]);
  for (const s of plan.steps) assert.ok(STEP_KINDS[s.kind], s.kind);
});

test("consolidationSteps: the race publishes one lane while merging the other, then merges the published lane", () => {
  assert.deepEqual(consolidationSteps(plan.consolidation).map((c) => c.op + (c.lane ? ` ${c.lane}` : "") + (c.again ? " again" : "")),
    ["race", "merge r007-1-pk again", "reconcile", "publish"]);
  assert.deepEqual(consolidationSteps([{ op: "merge", lane: "a" }, { op: "merge", lane: "b" }, { op: "publish" }]).map((c) => c.op), ["merge", "merge", "publish"]);
});

test("nextPhase: one phase forward only, to a phase with a player", () => {
  assert.equal(nextPhase("p1", "p2"), null);
  assert.match(nextPhase("p2", "p1"), /one phase forward/);
  assert.match(nextPhase("p1", "p3"), /one phase forward/);
  assert.equal(nextPhase("p2", "p3"), null, "P3 has its player (the closure)");
  assert.match(nextPhase("p3", "p4"), /no player/);
});

test("route with concurrent agents: a removal stops at a shared folder; a write re-makes a shared new folder; all through a Sandbox", () => {
  const t = new Tree(new Map([["pk/x/a.ts", f()], ["pk/q.ts", f()]]));
  const keep = (d) => d === "pk/x";
  const r = route([{ path: "pk/x/a.ts", op: "rm" }], t, { keep });
  assert.equal(r.calls[0].target, "pk/x/a.ts");
  const w = route([{ path: "pk/x/n.ts", op: "write", mode: "100644", blob: "b".repeat(40), size: 3 }], t, { mkdir: () => "pk/x" });
  assert.equal(w.calls[0].call, "apply");
  const all = route([{ path: "pk/q.ts", op: "rm" }, { path: "n/m.ts", op: "write", mode: "100644", blob: "c".repeat(40), size: 1 }], t, { all: true });
  assert.equal(all.calls.length, 0);
  assert.deepEqual(all.sandbox.map((x) => x.op), ["rm", "write"]);
  assert.equal(all.sandbox[1].previous, null);
});

test("sandboxCommands: a removal is one rm of its target in the script", () => {
  const c = sandboxCommands([{ op: "rm", path: "a/b.txt", target: "a" }, { path: "c.txt", mode: "100644", bytes: Buffer.from("x") }]);
  const script = c.at(-1);
  assert.ok(script.includes("rm -rf -- './a'"), script);
  assert.ok(script.includes("base64 -d < /tmp/lfs352/1 > './c.txt'"), script);
  const sh = join(dir, "ws");
  mkdirSync(join(sh, "a"), { recursive: true });
  writeFileSync(join(sh, "a", "b.txt"), "old");
  for (const cmd of c) execFileSync("sh", ["-c", cmd.replaceAll("/tmp/lfs352", join(dir, "scratch"))], { cwd: sh });
  assert.equal(execFileSync("sh", ["-c", "ls"], { cwd: sh, encoding: "utf8" }).trim(), "c.txt");
});

test("decoyBytes changes every line of the base, so any real change overlaps it", () => {
  const d = decoyBytes(Buffer.from("one\ntwo\n"), "decoy r1.s2").toString();
  assert.deepEqual(d.split("\n"), ["// decoy r1.s2", "decoy r1.s2 | one", "decoy r1.s2 | two", "decoy r1.s2 | "]);
});

test("laneChanges and mergedTree: the base plus each lane's changes", () => {
  const base = new Map([["a", f()], ["b", f()]]);
  const l1 = new Tree(base); l1.set("c", f("c".repeat(40))); l1.delete("a");
  const l2 = new Tree(base); l2.set("b", f("d".repeat(40)));
  assert.deepEqual([...laneChanges(base, l1)], [["c", f("c".repeat(40))], ["a", null]]);
  const m = mergedTree(base, [l1, l2]);
  assert.deepEqual([...m.files.keys()].sort(), ["b", "c"]);
  assert.equal(m.get("b").blob, "d".repeat(40));
});

test("attributeFuse: a Workspace's opcodes at unmount, split over its execs", () => {
  const lines = attributeFuse([
    { method: "sandbox.exec", ok: true, args: { sandbox: "p1", path: "/workspaces/1" } },
    { method: "sandbox.exec", ok: true, args: { sandbox: "p1", path: "/workspaces/1" } },
    { method: "sandbox.exec", ok: true, args: { sandbox: "p1", path: "/workspaces/2" } },
    { method: "sandbox.unmount", ok: true, args: { sandbox: "p1", path: "/workspaces/1" }, daemon: [{}, { fuse: { lookup: 6, write: 4, served: 99 } }] },
  ]);
  assert.deepEqual(lines.map((l) => l.fuse), [5, 5, undefined, undefined]);
});

test("callOf and aggregate: the record's size, SQL work, FUSE and the per-unit cost", () => {
  const line = { method: "branch.diff_commits", ms: 20, ok: true, args: {}, daemon: [{ sql: { readers: { statements: 4, vm_steps: 100, fullscan_steps: 2 } } }] };
  const c = callOf(line, { size: { kind: "entries", n: 10 } });
  assert.deepEqual(c.size, { kind: "entries", n: 10 });
  assert.deepEqual(c.sql, { statements: 4, vm_steps: 100, fullscan_steps: 2 });
  assert.equal(callOf({ method: "fs.write", ms: 1, args: { contentBytes: 5 } }).size.n, 5, "a line without a record keeps the trace's size");
  const rows = aggregate([c, { ...c, ms: 40 }, { method: "sandbox.exec", ms: 9, fuse: 12 }, { method: "sandbox.exec", ms: 9, fuse: 20 }]);
  const diff = rows.find((r) => r.op === "branch.diff_commits");
  assert.equal(diff.sizeClass, "5–16 entries");
  assert.equal(diff.perUnit.kind, "entries");
  assert.equal(diff.perUnit.ms, 2);
  assert.equal(rows.find((r) => r.op === "sandbox.exec").fuse, 12);
});

test("measure: bytes, entries and files by method", () => {
  assert.deepEqual(measure("fs.write", ["b", "/p", Buffer.alloc(300)], { kind: "Committed" }, null, null).size, { kind: "bytes", n: 300 });
  assert.equal(measure("fs.apply", ["b", [{ op: "mkdir" }, { op: "write", bytes: Buffer.alloc(9) }]], null, null, null).files, 1);
  assert.deepEqual(measure("fs.list", [], { items: [1, 2, 3] }, null, null).size, { kind: "entries", n: 3 });
  const t = new Tree(new Map([["a/b.ts", f()], ["a/c/d.ts", f()], ["e.ts", f()]]));
  assert.deepEqual(measure("fs.grep", ["b", "x", "/a"], { items: [] }, t, null).size, { kind: "files", n: 2 });
  assert.equal(measure("sandbox.mount", [], "/workspaces/1", null, null).size, null);
  assert.deepEqual(measure("sandbox.commit", [], { kind: "Committed" }, null, { kind: "files", n: 4 }).size, { kind: "files", n: 4 });
  assert.equal(measure("sandbox.exec", ["s", "/w", "echo hi"], { stdout: "hi\n", stderr: "" }, null, null).bytesOut, 3);
});

test("record: each call gets the label <step>#<seq> and one record with its outcome", async () => {
  const raw = { options: {}, sandboxes: new Set(), service: async () => "svc", fs: { write: async () => ({ kind: "Committed" }), rm: async () => { throw Object.assign(new Error("x"), { code: "NoSuchPath" }); } }, branch: { merge: async () => ({ kind: "Merged", fastForward: false }) }, sandbox: {}, project: {} };
  const rec = { label: "r1.s5", next: null, tree: null, agent: "a02" }, sink = { seq: 0, log: [] };
  const lf = record(raw, rec, sink);
  await lf.fs.write("b", "/x", "abc");
  assert.equal(raw.options.traceStep, "r1.s5#1");
  await assert.rejects(lf.fs.rm("b", "/y"));
  rec.next = { kind: "entries", n: 7 };
  await lf.branch.merge("a", "b", "c");
  assert.deepEqual(sink.log.map((e) => [e.seq, e.method, e.kind, e.agent]), [[1, "fs.write", "Committed", "a02"], [2, "fs.rm", "NoSuchPath", "a02"], [3, "branch.merge", "Merged", "a02"]]);
  assert.equal(sink.log[2].newCommit, true);
  assert.deepEqual(sink.log[2].size, { kind: "entries", n: 7 });
  assert.equal(rec.next, null);
});

test("wall projection: the phase's latest attempts, this one included, × the ranges; the budget from its file", () => {
  const attempts = [{ phase: "p2", range: 5, attempt: 1, wall: { totalMs: 30_000 } }, { phase: "p2", range: 5, attempt: 2, wall: { totalMs: 40_000 } },
    { phase: "p1", range: 4, attempt: 1, wall: { totalMs: 10_000 } }, { phase: "p2", range: 6, attempt: 1, wall: { totalMs: 99_000 } }];
  assert.deepEqual(wallProjection(attempts, "p2", { range: 6, totalMs: 20_000 }, 202), { wallProjectedMs: 30_000 * 202, wallMeanOf: 2 });
  const file = join(dir, "budget.json");
  assert.equal(loadBudget(file), null);
  writeFileSync(file, JSON.stringify({ wallBudgetMs: 24_240_000, ranges: 202, reason: "test" }));
  assert.equal(loadBudget(file).wallBudgetMs, 24_240_000);
  const g = evaluate({ range: 6, binary: { daemon: "d" }, checks: {}, budget: { wallBudgetMs: 24_240_000, wallProjectedMs: 30_000 * 202 } });
  assert.equal(g.checks.find((c) => c.name === "Wall projection").value, 0.25);
});

test("P3 is judged against its own budget entry (owner 2026-10-19: 300 s per range); other phases keep the P1 entry", () => {
  const file = join(dir, "budget-phases.json");
  writeFileSync(file, JSON.stringify({ wallBudgetMs: 24_240_000, ranges: 202, perRangeMs: 120_000, phases: { p3: { wallBudgetMs: 60_600_000, perRangeMs: 300_000 } } }));
  assert.deepEqual([loadBudget(file, "p3").wallBudgetMs, loadBudget(file, "p3").ranges, loadBudget(file, "p3").phase], [60_600_000, 202, "p3"]);
  for (const ph of ["p1", "p2", null]) assert.deepEqual([loadBudget(file, ph).wallBudgetMs, loadBudget(file, ph).phase], [24_240_000, "p1"], String(ph));
  // the same 203 s range: over the P1 entry (1.69, stop), within P3's own (0.68, pass)
  const own = { range: 15, totalMs: 203_000 };
  const p3 = wallBudget(loadBudget(file, "p3"), "p3", [], own), p1 = wallBudget(loadBudget(file, "p2"), "p3", [], own);
  assert.equal(p3.wallBudgetOf, "p3");
  const judge = (budget) => evaluate({ range: 15, phase: "p2", binary: { daemon: "d" }, checks: {}, budget }).checks.find((c) => c.name === "Wall projection");
  assert.deepEqual([judge(p3).value, judge(p3).result, judge(p3).threshold], [0.68, "pass", "≤ 1 (p3 budget)"]);
  assert.deepEqual([judge(p1).value, judge(p1).result], [1.69, "stop"]);
});

test("categories: every method the replay calls has one; list_commits is project; an unknown method has none", () => {
  for (const m of ["fs.write", "fs.diff_files", "sandbox.service", "sandbox.exec", "branch.merge", "branch.diff_commits", "operator.store.stats", "operator.inspect.snapshot"]) assert.ok(categoryOf(m), m);
  assert.equal(categoryOf("branch.list_commits"), "project");
  assert.equal(categoryOf("fs.frobnicate"), null);
  assert.equal(categoryOf("operator.process.start"), null);
  assert.ok(CATEGORIES.fs.includes("blame"));
});

const lines = [
  { method: "fs.write", ok: true, kind: "Committed", seq: 1 }, { method: "fs.write", ok: true, kind: "UpToDate", seq: 2 }, { method: "fs.read", ok: true, seq: 3 },
  { method: "sandbox.mount", ok: true, seq: 4 }, { method: "sandbox.exec", ok: true, seq: 5 }, { method: "sandbox.commit", ok: false, code: "Conflict", seq: 6 },
  { method: "sandbox.commit", ok: true, kind: "Committed", seq: 7 },
  { method: "branch.merge", ok: true, kind: "Merged", seq: 8 }, { method: "branch.publish", ok: true, kind: "Added", seq: 9 },
  { method: "branch.list_commits", ok: true, seq: 10 }, { method: "operator.store.stats", ok: true },
];
const log = [
  { seq: 1, method: "fs.write", agent: "a01", label: "s1", kind: "Committed", bytesIn: 10, bytesOut: 0, files: 1 },
  { seq: 2, method: "fs.write", agent: "a01", label: "s1", kind: "UpToDate", bytesIn: 4, bytesOut: 0, files: 1 },
  { seq: 3, method: "fs.read", agent: "a01", label: "s1", kind: "ok", bytesIn: 0, bytesOut: 50, files: 1 },
  { seq: 4, method: "sandbox.mount", agent: "a02", label: "s2", kind: "ok" },
  { seq: 5, method: "sandbox.exec", agent: "a02", label: "s2", kind: "ok", bytesIn: 30, bytesOut: 2 },
  { seq: 6, method: "sandbox.commit", agent: "a02", label: "s4", kind: "Conflict" },
  { seq: 7, method: "sandbox.commit", agent: "a03", label: "s8", kind: "Committed" },
  { seq: 8, method: "branch.merge", agent: "lead", label: "r007.merge", kind: "Merged", newCommit: true },
  { seq: 9, method: "branch.publish", agent: "lead", label: "r007.publish", kind: "Added" },
  { seq: 10, method: "branch.list_commits", agent: "lead", label: "probe:list_commits", kind: "ok" },
];

test("callTable and categoryRows: n, bytes, outcomes, writes and reads", () => {
  const t = callTable(lines, log);
  assert.deepEqual(t["fs.write"], { n: 2, bytesIn: 14, bytesOut: 0, files: 2, outcomes: { Committed: 1, UpToDate: 1 } });
  assert.deepEqual(t["sandbox.commit"].outcomes, { Conflict: 1, Committed: 1 });
  const { rows, unassigned } = categoryRows(t);
  assert.deepEqual(unassigned, []);
  assert.deepEqual([rows.fs.calls, rows.fs.writes, rows.fs.reads], [3, 2, 1]);
  assert.deepEqual([rows.sandbox.calls, rows.sandbox.writes, rows.sandbox.reads], [4, 3, 0]);
  assert.deepEqual([rows.project.calls, rows.operator.calls], [1, 1]);
});

test("the time line: stages sum exactly to the total in tenths", () => {
  const wall = { totalMs: 23445, prepareMs: 259, playMs: 13299, consolidateMs: 2079, verifyMs: 3679, probesMs: 378, metricsMs: 75, sealMs: 2905, snapshotMs: 326, reportMs: 176 };
  const st = stageSplit(wall);
  assert.equal(Object.values(st).reduce((n, x) => n + x, 0), wall.totalMs);
  const t = tenths(st, wall.totalMs);
  assert.equal(Object.values(t).reduce((n, x) => n + x, 0), 234);
  assert.ok(timeLine(wall).startsWith("**Time 23.4 s** (tooling): play"));
});

const overviewInput = () => ({
  plan, log, played: new Map([["a01", { fs: 1, sandbox: 0, branch: 0, project: 0 }], ["a02", { fs: 1, sandbox: 6, branch: 0, project: 0 }], ["a03", { fs: 0, sandbox: 1, branch: 0, project: 0 }]]),
  leadSteps: [{ category: "branch" }, { category: "branch" }, { category: "fs" }, { category: "branch" }],
  laneOf: (l) => plan.steps.find((s) => s.id === l)?.lane ?? null,
  events: [{ kind: "commit-conflict", conflictAt: 1000, resolvedAt: 1800 }, { kind: "stale-clean-merge" }],
  merged: new Map([["r007-1-pk", 1], ["r007-2-docs", 1]]), tries: new Map([["r007-1-pk", 1], ["r007-2-docs", 2]]), published: new Set(["r007-1-pk"]),
  lanesPlayed: [{ name: "r007-1-pk", agents: ["a01", "a02"], steps: 8 }, { name: "r007-2-docs", agents: ["a03"], steps: 1 }], runningBefore: 100, phase: "p2",
});

test("buildOverview: steps by category, Commits by agent and Branch, conflicts hit with their resolution", () => {
  const o = buildOverview(overviewInput());
  assert.deepEqual(o.agents.map((a) => [a.agent, a.steps, a.commits]), [["a01", 1, 1], ["a02", 7, 0], ["a03", 1, 1], ["lead", 4, 1]]);
  assert.deepEqual(o.branches.map((b) => [b.name, b.commits, b.merged, b.published]), [["r007-1-pk", 1, "✓", "✓"], ["r007-2-docs", 1, "✓ (2nd try)", "—"], ["main", 1, "—", "✓"]]);
  assert.deepEqual(o.conflicts.map((c) => [c.kind, c.hit, c.planned, c.resolved]), [["commit-conflict", 1, 1, "0.8 s"], ["stale-clean-merge", 1, 1, "merged cleanly"], ["decoy", 0, 0, "—"], ["merge-race", 0, 0, "—"]]);
  assert.deepEqual([o.steps, o.commits, o.running], [13, 3, 103]);
  assert.deepEqual(o.agents[1].conflicts, ["commit-conflict", "stale-clean-merge"]);
});

const metricsOf = (o, calls) => ({ range: 7, attempt: 1, binary: { daemon: "511dceeda1b5ec7e" }, overview: o, calls,
  work: { bashCalls: o.steps, lfsCommits: o.commits, sdkCalls: Object.values(calls).reduce((n, c) => n + c.n, 0) },
  wall: { totalMs: 23445, prepareMs: 259, playMs: 13299, consolidateMs: 2079, verifyMs: 3679, probesMs: 378, sealMs: 2905, snapshotMs: 326, reportMs: 176 } });

test("renderOverview and checkOverview: the F1 sums hold, and a wrong sum fails", () => {
  const o = buildOverview(overviewInput()), calls = callTable(lines, log), m = metricsOf(o, calls);
  const text = `# Range 007\n\n> note\n\n${renderOverview({ range: 7, verdict: "watch", m })}\n| | |\n| --- | --- |\n\n## Attempts\n`;
  assert.ok(text.includes("## Overview · Range 007 · **watch** · attempt 1 · daemon `511dceeda1b5`"));
  assert.ok(text.includes("**3 Branches**") && text.includes("**3 agents + lead**"), text);
  assert.deepEqual(checkOverview(text, m), []);
  assert.ok(checkOverview(text, { ...m, work: { ...m.work, sdkCalls: 99 } }).some((p) => /SDK call count 99/.test(p)));
  assert.ok(checkOverview(text, { ...m, work: { ...m.work, lfsCommits: 4 } }).some((p) => /LayerFS Commits 4/.test(p)));
  assert.ok(checkOverview(text.replace("| **Unplanned** |", "| Other |"), m).some((p) => /Unplanned/.test(p)));
  assert.ok(checkOverview(`# Range 007\n\n## Attempts\n`, m)[0].includes("missing"));
  const bad = { ...m, calls: { ...calls, "fs.frobnicate": { n: 1, outcomes: {} } }, work: { ...m.work, sdkCalls: 12 } };
  assert.ok(checkOverview(`# Range 007\n\n${renderOverview({ range: 7, verdict: "watch", m: bad })}`, bad).some((p) => /without a category/.test(p)));
});

test("STATS.md: a row per range, a cumulative row, P1 ranges derived and marked", () => {
  const o = buildOverview(overviewInput()), calls = callTable(lines, log);
  const p1 = { range: 0, attempt: 1, run: "p1-pilot", binary: { daemon: "0ef24121aaaa" }, wall: { totalMs: 12_000 }, storage: { newStored: 1000 },
    ops: [{ op: "fs.write", n: 5 }, { op: "branch.publish", n: 1 }], work: { bashCalls: 7, lfsCommits: 6, reconcile: 2 } };
  const d = derivedOverview(p1);
  assert.deepEqual(d.overview.agents.map((a) => [a.agent, a.steps, a.commits]), [["a01", 5, 4], ["lead", 2, 2]]);
  const text = renderStats([{ range: 0, m: p1, ...d }, { range: 7, m: { ...metricsOf(o, calls), storage: { newStored: 500 } }, overview: o, calls, derived: false }]);
  assert.ok(text.includes("| 000† | `0ef24121` (line p1-pilot) | a1 | 12.0 | 12.0 |"), text);
  assert.ok(text.includes("| 2 | 35.4 |"), text);
  assert.ok(text.includes("| branch.list_commits | project |"));
  // F8: a derived range has no byte data, so its bytes read "—" (alone) or carry ‡ (mixed), never 0
  assert.ok(text.includes("| branch.publish | project | 1 | — | — |") || /\| branch\.publish \| [a-z]+ \| \d+ \| [\d,]+ ‡ \| [\d,]+ ‡ \|/.test(text), text);
  const only = renderStats([{ range: 0, m: p1, ...d }]);
  assert.ok(only.includes("| fs.write |") && /\| fs\.write \| [a-z]+ \| 5 \| — \| — \|/.test(only), only);
});

test("Scaling: a legacy per-page diff_commits series is not judged (F-013), never optimize or pass", () => {
  const mk = (range, depth, ms) => ({ range, binary: { daemon: "d" }, depth: { after: depth }, checks: {}, probes: { fork: { ms: 3 } }, perUnit: { "branch.diff_commits": { unit: "entry", msPerEntry: ms } } });
  const row = evaluate(mk(3, 4000, 0.4), [mk(1, 1000, 0.1), mk(2, 2000, 0.2)]).checks.find((c) => c.name === "Scaling");
  assert.match(row.value, /not judged: branch\.diff_commits per entry: a per-page median/);
  assert.equal(row.result, "watch");
});

test("shared pool (P3, lead 2026-10-18): aN in pool[(N-1) mod 4]; sharing per Sandbox from the trace", async () => {
  const { poolOf, poolSize } = await import("../agents.mjs");
  const { poolSharing, PHASES } = await import("../steps.mjs");
  assert.equal(poolSize(PHASES.p3, 9), 4);
  assert.equal(poolSize(PHASES.p2, 9), 9, "P2 keeps one Sandbox per agent");
  assert.deepEqual([1, 4, 5, 9].map((n) => poolOf(n, 4)), [0, 3, 0, 0]);
  assert.deepEqual([1, 9].map((n) => poolOf(n, 9)), [0, 8]);
  const at = (ms) => new Date(Date.UTC(2026, 9, 18, 0, 0, 0, ms)).toISOString();
  const lines = [
    { method: "sandbox.mount", args: { sandbox: "p15-1" }, path: "/workspaces/1", start: at(0), ms: 10, ok: true },
    { method: "sandbox.mount", args: { sandbox: "p15-1" }, path: "/workspaces/2", start: at(5), ms: 10, ok: true },
    { method: "sandbox.unmount", args: { sandbox: "p15-1", path: "/workspaces/1" }, start: at(30), ms: 5 },
    { method: "sandbox.mount", args: { sandbox: "p15-1" }, path: "/workspaces/3", start: at(40), ms: 10, ok: true },
    { method: "sandbox.unmount", args: { sandbox: "p15-1", path: "/workspaces/2" }, start: at(42), ms: 5 },
    { method: "sandbox.unmount", args: { sandbox: "p15-1", path: "/workspaces/3" }, start: at(60), ms: 5 },
    { method: "sandbox.mount", args: { sandbox: "p15-2" }, path: "/workspaces/1", start: at(0), ms: 10, ok: true },
    { method: "sandbox.unmount", args: { sandbox: "p15-2", path: "/workspaces/1" }, start: at(20), ms: 5 },
  ];
  assert.deepEqual(poolSharing(lines), { "p15-1": { workspaces: 2, calls: 2, mounts: 3 }, "p15-2": { workspaces: 1, calls: 1, mounts: 1 } });
});

test("pnpm's install output (INSTALLS §4): the root, the store-verification age and the run's duration only", () => {
  assert.equal(rootless("WARN at /workspaces/23/x", "/workspaces/23"), rootless("WARN at /lfs352-native-root/x", "/lfs352-native-root"));
  assert.throws(() => rootless("x", ""), /no install root/);
  // the store-verification age on its own line only (dev352-p3g r015)
  assert.equal(normalizeOutput("✓ Lockfile passes supply-chain policies (verified 6h ago)"), normalizeOutput("✓ Lockfile passes supply-chain policies (verified 5h ago)"));
  assert.equal(verifiedAges(normalizeOutput("a\n✓ Lockfile passes supply-chain policies (verified 2m ago)")), 1);
  assert.notEqual(normalizeOutput("note: verified 6h ago"), normalizeOutput("note: verified 5h ago"), "the age elsewhere is compared");
});

test("lister v6 (owner 2026-10-19): bookkeeping-only differences pass; a package byte, an extra or missing package and a shim's target stop", () => {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "lfs352-lister6-"))); // the lister's root is its cwd, a real path
  const tree = (name, { when = "t", content = "x", extraPkg = false, shimTo = "../a/bin.js" } = {}) => {
    const root = join(dir, name), nm = join(root, "node_modules"), pkg = (n) => join(nm, ".pnpm", `${n}@1`, "node_modules", n);
    for (const n of ["a", ...(extraPkg ? ["b"] : [])]) { mkdirSync(pkg(n), { recursive: true }); writeFileSync(join(pkg(n), "bin.js"), `module.exports = "${content}";\n`); symlinkSync(`.pnpm/${n}@1/node_modules/${n}`, join(nm, n)); }
    mkdirSync(join(nm, ".bin"), { recursive: true });
    // pnpm's shim carries the install root (NODE_PATH) and runs its target relative to $basedir
    writeFileSync(join(nm, ".bin", "a"), `#!/bin/sh\nbasedir=$(dirname "$0")\nexport NODE_PATH="${root}/node_modules/.pnpm/node_modules"\nif [ -x "$basedir/node" ]; then\n  exec "$basedir/node"  "$basedir/${shimTo}" "$@"\nelse\n  exec node  "$basedir/${shimTo}" "$@"\nfi\n`, { mode: 0o755 });
    writeFileSync(join(nm, ".modules.yaml"), `{\n  "prunedAt": "${when}",\n  "hoistedDependencies": { "${when}": {} }\n}\n`);
    mkdirSync(join(nm, ".pnpm"), { recursive: true });
    writeFileSync(join(nm, ".pnpm", "lock.yaml"), `lockfileVersion: '9.0'\n# ${when}\n`);
    writeFileSync(join(nm, ".pnpm-workspace-state-v1.json"), `{ "lastValidatedTimestamp": ${when.length}, "projects": { "${root}": {} } }\n`);
    return parseLister(execFileSync("sh", ["-c", listerCommand()], { cwd: root, encoding: "utf8" }));
  };
  try {
    const a = tree("one"), same = tree("workspaces-15", { when: "another run, at another root" });
    assert.deepEqual(a.normalized, { bookkeeping: 3, shims: 1, links: 1 });
    assert.deepEqual(compareInstalled({ groups: a.groups }, same.groups).ok, true, "state files and the shim's root differ: bookkeeping only, equal");
    assert.deepEqual(compareInstalled({ groups: a.groups }, tree("byte", { content: "y" }).groups).differ, ["node_modules/.pnpm/a@1"], "one byte of a package file stops");
    const extra = compareInstalled({ groups: a.groups }, tree("extra", { extraPkg: true }).groups);
    assert.deepEqual([extra.ok, extra.extra], [false, ["node_modules/.pnpm/b@1", "node_modules/b"]], "an extra package stops; reversed, a missing one");
    assert.deepEqual(compareInstalled({ groups: tree("extra2", { extraPkg: true }).groups }, a.groups).missing, ["node_modules/.pnpm/b@1", "node_modules/b"]);
    assert.deepEqual(compareInstalled({ groups: a.groups }, tree("shim", { shimTo: "../b/bin.js" }).groups).differ, ["node_modules/.bin"], "a shim running another target stops");
    // the resolved package set is its own group: a different `pnpm ls` set stops on it alone
    const ls = (list) => ({ g: "#pnpm-ls", n: list.length, bytes: 0, digest: list.join("|") });
    assert.deepEqual(compareInstalled({ groups: [ls(["a@1 <root>/node_modules/.pnpm/a@1/node_modules/a"])] }, [ls(["a@2 <root>/node_modules/.pnpm/a@2/node_modules/a"])]).differ, ["#pnpm-ls"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("version figures (lead 2026-10-18): the incremental manifest from diff_commits paths equals a full walk; ties go to the smallest path", async () => {
  const { VERSION_WALK, applyEntries, changedPaths, decodeEntries, lstatCommands, manifestDiff, statsOf } = await import("../version.mjs");
  const { execFacts } = await import("../run.mjs");
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "lfs352-version-"))), ws = join(dir, "ws");
  const put = (p, text) => { mkdirSync(join(ws, p, ".."), { recursive: true }); writeFileSync(join(ws, p), text); };
  put(".lfs-probe/x", "probe"); put("a/one.txt", "12345"); put("a/two.txt", "12345"); put("b/sub/three.txt", "1");
  put("node_modules/.pnpm/p@1/node_modules/p/index.js", "module.exports=1;\n"); symlinkSync(".pnpm/p@1/node_modules/p", join(ws, "node_modules/p"));
  put("gone/inner/deep.txt", "x"); put("becomes-file/inside.txt", "y");
  const walkSh = () => decodeEntries(execFileSync("node", ["-e", VERSION_WALK], { cwd: ws, encoding: "utf8" }));
  const before = walkSh();
  assert.equal(before.get(".lfs-probe")[0], "x");
  assert.equal([...before.keys()].some((p) => p.startsWith(".lfs-probe/")), false, "the fixture is not descended");
  const s0 = statsOf(before);
  assert.deepEqual([s0.files, s0.symlinks, s0.nm.files, s0.nm.symlinks], [6, 1, 1, 1]);
  assert.deepEqual(s0.largestFile, { path: "node_modules/.pnpm/p@1/node_modules/p/index.js", bytes: 18 });
  assert.deepEqual(s0.largestDir, { path: ".", entries: 6 }, "root: a, b, becomes-file, gone, node_modules and the fixture");
  // a range's changes: add, modify, delete a subtree, a directory replaced by a file, a symlink retargeted
  put("a/three.txt", "123456789"); put("a/one.txt", "1"); rmSync(join(ws, "gone"), { recursive: true });
  rmSync(join(ws, "becomes-file"), { recursive: true }); writeFileSync(join(ws, "becomes-file"), "now a file");
  rmSync(join(ws, "node_modules/p")); symlinkSync(".pnpm/p@1/node_modules/p/", join(ws, "node_modules/p"));
  // diff_commits lists every changed path, a deleted folder's files included, with a leading slash
  const items = ["/a/three.txt", "/a/one.txt", "/gone", "/gone/inner", "/gone/inner/deep.txt", "/becomes-file", "/becomes-file/inside.txt", "/node_modules/p", "/.lfs-probe/x"].map((path) => ({ path }));
  const paths = changedPaths(items);
  assert.equal(paths.includes(".lfs-probe/x"), false);
  const cmds = lstatCommands(paths, join(dir, "scratch"));
  let out = "";
  for (const c of cmds) out = execFileSync("sh", ["-c", c], { cwd: ws, encoding: "utf8" });
  assert.equal(existsSync(join(dir, "scratch")), false, "the lstat script removes its scratch");
  const updated = applyEntries(before, decodeEntries(out)), after = walkSh();
  assert.deepEqual(manifestDiff(after, updated), []);
  assert.deepEqual(statsOf(updated), statsOf(after));
  assert.deepEqual(statsOf(after).largestFile, { path: "node_modules/.pnpm/p@1/node_modules/p/index.js", bytes: 18 });
  // chunks: a long list travels in several commands
  assert.ok(lstatCommands(Array.from({ length: 40000 }, (_, i) => `node_modules/.pnpm/pkg-${i}@${i}.0.0/node_modules/pkg-${i}/lib/file-${(i * 7919) % 104729}.js`), "/tmp/s").length > 3);
  // files only (no folder items): the ancestors are looked at, so a new folder and a removed one are still seen
  put("c/new/deep.txt", "n"); rmSync(join(ws, "b"), { recursive: true });
  const fileOnly = changedPaths([{ path: "/c/new/deep.txt" }, { path: "/b/sub/three.txt" }]);
  assert.deepEqual(fileOnly, ["b", "b/sub", "b/sub/three.txt", "c", "c/new", "c/new/deep.txt"]);
  let out2 = "";
  for (const c of lstatCommands(fileOnly, join(dir, "scratch2"))) out2 = execFileSync("sh", ["-c", c], { cwd: ws, encoding: "utf8" });
  const again = applyEntries(updated, decodeEntries(out2));
  assert.deepEqual(manifestDiff(walkSh(), again), []);
  // a missed change is caught by the cross-check
  assert.ok(manifestDiff(after, applyEntries(before, new Map())).length > 0);
  // the version execs are counted as tooling inside the total
  const ex = execFacts([{ method: "sandbox.exec", step: "r015.version#9", args: { command: "node -e x" }, ok: true }, { method: "sandbox.exec", step: "r015.s0001#1", args: { command: "ls" }, ok: true }]);
  assert.deepEqual([ex.total, ex.version], [2, 1]);
  const inst = execFacts([{ method: "sandbox.exec", step: "r015.install#2501", args: { command: "test -d /pnpm-store/v11 && test -f x" }, ok: true },
    { method: "sandbox.exec", step: "r015.install#2502", args: { command: "mkdir -p /tmp/pnpm-cache /tmp/pnpm-store && for d in /pnpm-s…" }, ok: true },
    { method: "sandbox.exec", step: "r015.install#2503", args: { command: "pwd" }, ok: true }]);
  assert.equal(inst.installs, 1, "a shortened install command is counted by its step");
  rmSync(dir, { recursive: true, force: true });
});

test("install on top (lead 2026-10-18, dev352-p3h r016): the chain and its oracle file; the installed line under lister v6", async () => {
  const { nextChain, sequenceKey, oracleFiles } = await import("../closure.mjs");
  const ex = (kind, root) => ({ kind, command: `${kind} cmd`, root });
  let chain = nextChain([], 15, "c15", [ex("install", "/workspaces/23"), ex("reinstall-check", "/workspaces/24"), ex("build", "/workspaces/25"), ex("test", "/workspaces/27")]);
  assert.deepEqual(chain.map((e) => [e.range, e.kind, e.root]), [[15, "reinstall-check", "/workspaces/24"], [15, "build", "/workspaces/25"], [15, "test", "/workspaces/27"]], "the chain starts at the last clean install");
  chain = nextChain(chain, 16, "c16", [ex("test", "/workspaces/31")]);
  assert.equal(chain.length, 4);
  assert.deepEqual(nextChain(chain, 17, "c17", [ex("clean-install", "/workspaces/40")]).map((e) => e.kind), ["clean-install"]);
  const key = sequenceKey(chain, { checkpoint: "c17", command: "i" });
  assert.equal(key, sequenceKey(JSON.parse(JSON.stringify(chain)).map((e) => ({ ...e, root: "/elsewhere" })), { checkpoint: "c17", command: "i" }), "roots don't change the key");
  assert.notEqual(key, sequenceKey(chain, { checkpoint: "c17", command: "j" }));
  const top = oracleFiles("/o", { lock: "L", steps: [{ kind: "incremental-install", command: "i" }, { kind: "reinstall-check" }], chain, checkpoint: "c17" });
  assert.deepEqual([top.kind, top.install, top.clean], ["sequence", `/o/node_modules/seq-${key}.json`, "/o/node_modules/L.json"]);
  const first = oracleFiles("/o", { lock: "L", steps: [{ kind: "install", command: "i" }], chain: [], checkpoint: "c15" });
  assert.deepEqual([first.kind, first.install], ["clean", "/o/node_modules/L.json"]);
  assert.equal(oracleFiles("/o", { lock: "L", steps: [{ kind: "incremental-install", command: "i" }], chain: [], checkpoint: "c" }).kind, "clean", "no chain: clean");
  const shown = installedText({ oracleKind: "sequence", oracle: { ok: true, groups: 3, missing: [], extra: [], differ: [] }, normalized: { files: { bookkeeping: 3, shims: 251, links: 1753 }, outputRoot: 0 }, binCheck: { command: "./node_modules/.bin/tsc --version", exitCode: 0 } });
  assert.equal(shown, "against the native replay of its chain · **3 package groups equal to native** · not byte-compared: 3 pnpm state file(s) · by target: 251 bin shims, 1753 links · output root ×0 · `./node_modules/.bin/tsc --version` in the new mount: exit 0");
  // Node on (r017.a2): the lead-only chain lacks the shim a lane's build target makes; the row's verdict is the repair's P1
  const r17 = { oracleKind: "sequence", repairGroups: "/g.json", oracle: { ok: false, groups: 1612, missing: [], extra: [], differ: ["python/sdk-runtime/node_modules/.bin"] }, normalized: { files: { bookkeeping: 3, shims: 273, links: 2723 }, outputRoot: 0 } };
  const p6 = (detail) => ({ proofs: { P6: { result: detail.startsWith("P1 stop") ? "stop" : "pass", detail } } });
  assert.equal(installedText(r17, p6("P1 pass, P4 pass (418 emitted files, exit 0)")), "against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 0 missing, 0 extra, 1 differ (`python/sdk-runtime/node_modules/.bin`) · not byte-compared: 3 pnpm state file(s) · by target: 273 bin shims, 2723 links · output root ×0");
  assert.match(installedText(r17, p6("P1 stop (2 groups differ), P4 pass")), /on-top chain[^·]*: \*\*differs\*\* \(the repair's P1\)/, "a real difference stays a difference");
  assert.match(installedText(r17, null), /on-top chain[^·]*: not judged yet/, "before the proofs: not judged, never equal");
  assert.doesNotMatch(installedText(r17, null), /equal to native/);
});

test("per-call scratch (lead 2026-10-18): distinct folders; removed on success and after a failed exec", async () => {
  const { execAll, scratchDir } = await import("../lib.mjs");
  assert.notEqual(scratchDir(), scratchDir());
  const dir = mkdtempSync(join(tmpdir(), "lfs352-scratch-")), ws = join(dir, "ws");
  mkdirSync(ws);
  const fake = (failAt) => {
    let n = 0;
    const run = { tally: { calls: 0 }, rec: {}, execs: [], lf: { sandbox: { exec: async (_sb, _ws, cmd) => {
      run.execs.push(cmd);
      if (++n === failAt) return { exitCode: 1, stderr: "injected" };
      try { execFileSync("sh", ["-c", cmd], { cwd: ws }); return { exitCode: 0 }; } catch (e) { return { exitCode: e.status ?? 1, stderr: String(e.stderr) }; }
    } } } };
    return run;
  };
  const files = [{ path: "a.txt", mode: "100644", bytes: Buffer.from("a\n") }];
  const ok = join(dir, "ok"), okRun = fake(0);
  const okCmds = sandboxCommands(files, ok);
  await execAll(okRun, "sb", "ws", okCmds, "s1", 1);
  assert.equal(readFileSync(join(ws, "a.txt"), "utf8"), "a\n");
  assert.equal(existsSync(ok), false, "the script removes its scratch on success");
  assert.equal(okRun.execs.length, okCmds.length, "no cleanup exec on success");
  // the chunk command (second exec) fails: the scratch folder exists, and one cleanup exec removes it
  const bad = join(dir, "bad"), badRun = fake(2);
  await assert.rejects(execAll(badRun, "sb", "ws", sandboxCommands(files, bad), "s2", 1), /s2 exec exited 1: injected/);
  assert.equal(existsSync(bad), false, "a failed call removes its own scratch");
  assert.deepEqual(badRun.execs.at(-1), `rm -rf ${bad}`);
  // a failing cleanup is reported with the original failure
  const worse = fake(2);
  const exec = worse.lf.sandbox.exec;
  worse.lf.sandbox.exec = async (sb, w, cmd) => (cmd.startsWith("rm -rf ") && !cmd.includes("&&") ? { exitCode: 7 } : exec(sb, w, cmd));
  await assert.rejects(execAll(worse, "sb", "ws", sandboxCommands(files, join(dir, "worse")), "s3", 1), /s3 exec exited 1: injected; scratch cleanup exited 7/);
  rmSync(dir, { recursive: true, force: true });
});

test("time-only trips (owner 2026-10-18): identical counters read watch; a repeat at the next range escalates; counter trips unchanged", () => {
  // times x100 (owner 2026-10-20: a time fit adding under 5 ms per call passes, which 013.a2's sub-ms shape now does)
  const mk = (range, depth, ms, statements = 16) => ({ range, binary: { daemon: "d" }, depth: { after: depth }, checks: {}, probes: { fork: { ms: ms * 100, counters: { statements, vm_steps: 271 } } } });
  const row = (xs, name = "Scaling") => evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === name);
  // 013.a2's shape: 0.635, 0.477, 0.77 ms over three ranges, every counter identical
  const once = [mk(11, 7783, 0.635), mk(12, 8519, 0.477), mk(13, 9385, 0.77)];
  assert.equal(row(once).result, "watch", row(once).value);
  assert.match(row(once).value, /fork: depth exponent [\d.]+; time-only trip \(identical SQL counters at every point\): watch, optimize only if it repeats at range 14/);
  // it tripped time-only at range 12 too: the repeat escalates
  const twice = [mk(10, 7000, 0.3), mk(11, 7783, 0.4), mk(12, 8519, 0.6), mk(13, 9385, 0.9)];
  assert.equal(row(twice).result, "optimize", row(twice).value);
  assert.match(row(twice).value, /time-only \(identical SQL counters\), repeated: it also tripped at range 12/);
  // a gap (no range 12 point) is not a repeat
  assert.equal(row([mk(9, 6000, 0.2), mk(10, 7000, 0.3), mk(11, 7783, 0.4), mk(13, 9385, 0.9)]).result, "watch");
  // counters that move make it a real trip, judged as before
  assert.equal(row([mk(11, 7783, 0.4, 16), mk(12, 8519, 0.6, 18), mk(13, 9385, 0.9, 20)]).result, "optimize");
});

test("F-014: probes fit only same-version, same-input points; growing probes are exempt; no input is not judged", () => {
  const mk = (range, depth, probes) => ({ range, binary: { daemon: "d" }, depth: { after: depth }, inputs: { tree: { files: 100 * (range + 1), bytes: 1e4 * (range + 1) } }, checks: {}, probes });
  const one = (ms, input, version) => ({ ms, counters: { statements: 100 }, ...(input ? { input } : {}), ...(version ? { version } : {}) });
  const row = (xs, name = "Scaling") => evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === name);
  // (a fixed-input probe outside the chain-bounded set: diff_commits is chain-bounded since F-023)
  const same = [1, 2, 3].map((i) => mk(i, 1000 * i, { list_commits: one(5, { pageSize: 20, items: 20 }) }));
  assert.equal(row(same).result, "pass", row(same).value);
  // the input drifted (the v1 defect): refused with the reason
  const drift = [1, 2, 3].map((i) => mk(i, 1000 * i, { diff_commits: one(5 * i, { files: [4, 5, 60][i - 1] }, 2) }));
  assert.match(row(drift).value, /not judged: diff_commits: input \{"files":60\} differs from range 1 \(\{"files":4\}\), 2/);
  assert.equal(row(drift).result, "watch");
  // versions never share a fit: two v1 points and one v2 point are too few
  const mixed = [mk(1, 1000, { diff_commits: one(5, { files: 1 }) }), mk(2, 2000, { diff_commits: one(5, { files: 1 }) }), mk(3, 3000, { diff_commits: one(50, { files: 1 }, 2) })];
  assert.match(row(mixed).value, /not judged: diff_commits: 1 of 3 points of probe version 2/);
  assert.equal(row(mixed).result, "watch");
  // a fixed-input probe without its input is not judged; a growing probe needs none and is fitted
  const legacy = [1, 2, 3].map((i) => mk(i, 1000 * i, { stat: one(3) }));
  assert.match(row(legacy).value, /stat: input not recorded/);
  // (its counters grow too: a time-only trip with identical counters reads watch, owner 2026-10-18)
  const grows = [1, 2, 3].map((i) => mk(i, 1000 * i, { list_largest: { ...one(3 * i * i, { entries: 10 * i }), counters: { statements: 100 * i } } }));
  // exempt from the same-input rule (no refusal on 10/20/30 entries); since r017.a1 it is chain-bounded per entry,
  // so three points are not judged, and growth over a cap period trips (the r017.a1 test)
  assert.doesNotMatch(row(grows).value, /differs/, "list_largest is exempt from the same-input rule");
  assert.match(row(grows, "Counters").value, /not judged: list_largest.*chain-bounded/);
  const perEntryFlat = [1, 2, 3].map((i) => mk(i, 1000 * i, { list_largest: { ...one(3 * i, { entries: 10 * i }), counters: { statements: 100 * i } } }));
  // a directory growing alone never trips (judged pass once a period is recorded: the r017.a1 test's `wider`)
  assert.equal(row(perEntryFlat).result, "watch", row(perEntryFlat).value);
  assert.match(row(perEntryFlat).value, /not judged/);
  assert.deepEqual(probeSeries("list_largest", grows[2], grows).note, undefined);
});


test("atHead: a folder outside git is null, quietly", () => {
  const file = join(dir, "outside", "r.md");
  mkdirSync(join(dir, "outside"));
  writeFileSync(file, "x");
  assert.equal(atHead(file), null);
});

test("openIssues: open BUGS.md findings with owner and next step; fixed ones left out", () => {
  const text = ["## Open findings", "", "- **F-001 · fs request size cap.** One request. Owner of the fix: the fixer, before P3.",
    "- **F-002 · full scans (lead).** Read them.", "- **F-002, fixer's reading.** Bounded.", "- **F-003 · diff walks (fixer).** **Fixed** in `abc`.",
    "- **F-006 · overlays (lead, 2026-10-18).** The row reads ?.", "  Owner: the builder (measure it per range)."].join("\n");
  assert.deepEqual(openIssues(text), [
    { id: "F-001", title: "fs request size cap", owner: "the fixer", next: "before P3" },
    { id: "F-002", title: "full scans", owner: "lead", next: "see BUGS.md" },
    { id: "F-006", title: "overlays", owner: "the builder", next: "measure it per range" },
  ]);
});

test("movers: the three largest changes against the previous range, signed", () => {
  const prev = { wall: { totalMs: 10_000 }, key: { ops: { "fs.write": { n: 9, p95: 10 } } }, storage: { newStored: 2 ** 20, newMetadata: 2 ** 20 }, probes: { stat: { ms: 4 } } };
  const m = { wall: { totalMs: 12_000 }, key: { ops: { "fs.write": { n: 9, p95: 5 } } }, storage: { newStored: 2 ** 20, newMetadata: 3 * 2 ** 20 }, probes: { stat: { ms: 4.1 } } };
  assert.deepEqual(movers(m, prev).map((x) => [x.name, Math.round(x.pct * 100)]), [["metadata added", 200], ["fs.write p95", -50], ["range time", 20]]);
  assert.deepEqual(movers(m, null), []);
});

const formatMetrics = () => {
  const o = buildOverview(overviewInput()), calls = callTable(lines, log);
  return { ...metricsOf(o, calls), phase: "p2", run: "dev", plan: { version: 2 }, depth: { before: 100, after: 103 },
    binary: { daemon: "511dceeda1b5ec7e", image: "sha256:d3773b4eac6a" }, startedFrom: { kind: "live", range: 6 },
    checks: { tree: { ok: true, files: 12, full: false }, history: { ok: true }, steps: { matched: 20, total: 20 }, conflicts: { planned: 2, hit: 2, unplanned: 0 }, tests: { equal: 0, run: 0 } },
    version: { bytes: 1000, files: 9, dirs: 3, symlinks: 1, largestFile: { path: "a", bytes: 400 }, largestDir: { path: ".", entries: 5 }, tracked: { files: 9, bytes: 1000 }, nodeModules: { files: 0, bytes: 0 }, build: { files: 0, bytes: 0 } },
    storeDisk: { allocated: 4000, walAllocated: 1000, sealed: false }, storage: { stored: 800, canonical: 1600, metadata: 900, newStored: 300, newMetadata: 100, changedBytes: 150, directoryShare: 0.33, delta: { atCap: 0.03, byBudget: 0.2, depths: { wholeFile: [1, 3], chunk: [2], metadata: [1, 1] } } },
    key: { ops: { "fs.write": { n: 3, p50: 9, p95: 12, statements: 40 } }, commitPerFileMs: 1.5, oneShotP50: 70, oneShots: 4, slowest: [{ op: "fs.write", ms: 12, size: { kind: "bytes", n: 9 } }] },
    health: { workspacesOpen: 0, overlaysLeft: 0, daemonRssMb: 300, openFiles: 90, sandboxes: "4 of 4" }, execs: { total: 3, js: 1, shell: 2, nonZero: 0, installs: 0, tests: 0 },
    dsh: { first: "2026-07-01", last: "2026-07-02", mainline: 5, side: 20, areas: [{ name: "packages/core", share: 0.6 }, { name: "docs", share: 0.4 }], changedBytes: 150 },
    budget: { diskProjected: 40, diskBudget: 100, wallProjectedMs: 3.6e6, wallBudgetMs: 24_240_000 }, probes: {}, ops: [] };
};
const gate = (verdict) => ({ verdict, reason: "x", binary: "511dceeda1b5ec7e", started: "t", checks: [{ name: "Correctness", value: "ok", threshold: "all", result: "pass" }, { name: "Scaling", value: "fit", threshold: "< 0.15", result: verdict === "optimize" ? "optimize" : "pass" }] });
const summary = { bashCalls: 13, lanes: 2, agents: 3, lfsCommits: 3, workspaces: 4, oneShotShare: 1, reads: 0, reconcile: 1 };

test("renderFormat and checkFormat: the binding shape passes; a missing part or a wrong amplification fails", () => {
  const m = formatMetrics();
  const issues = [{ id: "F-005", title: "chunks", owner: "the fixer", next: "diagnose" }];
  const text = renderFormat({ plan: { ...plan, dsh: { first: "a".repeat(40), commits: 25 }, checkpoint: "b".repeat(40), milestone: false }, summary, attempts: [m], gates: [gate("pass")], issues });
  assert.ok(text.startsWith("# Range 007 · **pass** · attempt 1"), text.slice(0, 80));
  assert.ok(text.includes("| **Space amplification** (total · tracked) | — | 5.00× |"), "5,000 B on disk over 1,000 B");
  assert.ok(text.includes(NONE_LINE) && text.includes("| F-005 | chunks | the fixer | diagnose |"));
  assert.deepEqual(checkFormat(text, m, issues), []);
  assert.ok(checkFormat(text.replace("| **Space amplification** (total · tracked) | — | 5.00× |", "| **Space amplification** | — | 0.50× |"), m, issues).some((p) => /amplification/.test(p)));
  assert.ok(checkFormat(text, m, [...issues, { id: "F-009" }]).some((p) => /F-009/.test(p)));
  assert.ok(checkFormat(text.replace("\n## 4. Speed", "\n## 4. Pace"), m, issues).some((p) => /4\. Speed/.test(p)));
  assert.ok(checkFormat(text.replace("**Moved most:**", "**Moved:**"), m, issues).some((p) => /Moved most/.test(p)));
  // the storage revision's tables, and its sums checked on the recorded figures
  const sm = { ...m, storageReport: storageFigures({ parts: { exact: false, content: 900, metadata: 600, remainder: 3500, total: 5000 }, prevParts: null,
    bySource: { tracked: { content: 900, metadata: 600 }, nodeModules: { content: 0, metadata: 0 }, build: { content: 0, metadata: 0 } },
    added: { tracked: { content: 200, metadata: 100 }, nodeModules: { content: 0, metadata: 0 }, build: { content: 0, metadata: 0 } }, version: m.version, changed: { tracked: 150 }, commits: 3 }) };
  const st = renderFormat({ plan: { ...plan, dsh: { first: "a".repeat(40), commits: 25 }, checkpoint: "b".repeat(40), milestone: false }, summary, attempts: [sm], gates: [gate("pass")], issues });
  for (const x of ["**3b. Where the bytes are**", "| Index rows + waste + other (live, not split) |", "**Total = Store on disk**", "| Shared (index rows + waste + other) |", "| **Stored per Commit** |"]) assert.ok(st.includes(x), x);
  assert.deepEqual(checkFormat(st, sm, issues), []);
  assert.ok(checkFormat(st, { ...sm, storageReport: { ...sm.storageReport, parts: { ...sm.storageReport.parts, remainder: 1 } } }, issues).some((x) => /Storage: the parts sum/.test(x)));
  const parsed = parseReport(text);
  assert.deepEqual([parsed.latest, parsed.checks.length], [1, 2]);
  assert.equal(leadNote(text.replace("- (none yet)", "- watch metadata")).trim(), "- watch metadata");
});

// REPORT_FORMAT §8 (P3, from range 15): the git and Node rules' report parts, gates and checks
const p3Of = () => {
  const proofs = (r) => ({ P1: { result: r, normalized: 4 }, P2: { result: "pass" }, P3: { result: "pass" }, P4: { result: "pass" }, P5: { result: "pass", skipped: [{ file: "a.test.ts", reason: "fails natively" }] }, P6: { result: "pass", rewritten: 12 } });
  return {
    git: { head: "c".repeat(40), checkpoint: "c".repeat(40), commitsWritten: 25, dshCommits: 25, statusClean: true, freshSumScan: 0, guardViolations: [],
      lanes: [{ lane: "a01", status: 3, diff: 3, add: 3, rm: 0, commits: 3, loose: 40 }], lead: { commitTree: 25, indexRebuild: true, repack: true },
      perCommit: { commits: 28, index: 28_000, loose: 56_000, pack: 14_000 }, internals: { seedObjects: 9000, seedPackBytes: 2e7, lanes: [{ lane: "a01", objects: 40, indexBytes: 9000 }], trace2: [{ cmd: "git status --porcelain", ms: 140, lstat: 900 }] } },
    node: { points: [{ lane: "a01", point: "mid", tree: "d".repeat(40), inputs: "e".repeat(64), proofs: proofs("pass"), cached: true }],
      lanes: [{ lane: "a01", installs: 1, refreshes: 2, tsc: 2, vitestPoints: 2, vitestFiles: 9, equal: 9, run: 9 }], repair: { installs: 1, tsc: 1, rewritten: 30 },
      inputs: { consistent: 40, total: 51 }, churn: { rewrittenBytes: 4e8, storedBytes: 2e6 }, nativeDisk: { lanes: 4, checkoutBytes: 5e8, storedBytes: 6e8 }, metadata: { perFile: 300, perCommit: 9000, budgetPerFile: null } },
    conflicts: { tracked: 2, installOutputs: 30, buildOutputs: 4, git: 0, paths: [{ path: "node_modules/.modules.yaml", class: "installOutputs", lane: "a01" }] },
    speed: { "git.status.cold": { lfs: { p50: 600, p95: 700 }, native: { p50: 140, p95: 150 }, cost362: 4.5 } },
    resilience: { busy: 0, eagain: 0, refusedUnmount: 0, writerWaitMs: { p50: 1, p95: 9 }, laneHoldMs: { p50: 6, p95: 20 }, rss: { max: 210, median: 150, n: 4 }, overlayMaxBytes: 4e6, unmountMs: { p50: 30, p95: 80 } },
    stages: { gitMs: 9000, nodeMs: 60000 }, content: { storedContent: 1.3e6, distinctNewContent: 1e6 },
  };
};

test("P3 report (REPORT_FORMAT §8): git and Node parts render and pass the check; a stop proof or .git conflict stops; P2 renders none", () => {
  const base = formatMetrics();
  const version = { ...base.version, bytes: 1200, git: { files: 30, bytes: 200 } };
  const storageReport = storageFigures({ parts: { exact: false, content: 900, metadata: 600, remainder: 3500, total: 5000 }, prevParts: null,
    bySource: { tracked: { content: 800, metadata: 500 }, git: { content: 100, metadata: 100 } }, added: { tracked: { content: 200, metadata: 100 }, git: { content: 50, metadata: 20 } }, version, changed: { tracked: 150, git: 60 }, commits: 3 });
  const m = { ...base, phase: "p3", version, storageReport, execs: { ...base.execs, git: 12, pnpm: 3, tsc: 4, vitest: 2, other: 1 }, p3: p3Of() };
  const args = { plan: { ...plan, dsh: { first: "a".repeat(40), commits: 25 }, checkpoint: "b".repeat(40), milestone: false }, summary, gates: [gate("pass")] };
  const text = renderFormat({ ...args, attempts: [m] });
  for (const x of ["**Phase P3** · **Git ✓** · **Node ✓**", "**Content 1.30×**", "**Churn 0.01**", "**Time split:**", "### Node and git proofs", "| a01 | mid |", "pass (4 normalized)", "pass (12 rewritten)",
    "| Install inputs (NODE_RULE §3; reported, not gated) | 40 of 51 lane steps consistent |", "`.git` 0", "**Execs by tool:** git 12", "| `.git` |", "**3e. Git and Node (P3)**", "Tracked only", "| git status (cold) | 600 ms / 700 ms | 140 ms / 150 ms | 4.29× | git / status-cold: 4.50× |",
    "**Resilience:** Busy 0", "### H. Git internals", "### I. Proof details", "### J. Conflicts by path class", ", reported only in P3)"]) assert.ok(text.includes(x), x);
  assert.ok(!text.includes("target ~9 : 1"));
  assert.deepEqual(checkFormat(text, m, []), []);
  assert.ok(checkFormat(text.replace("### Node and git proofs", "### Proofs"), m, []).some((x) => /Node and git proofs/.test(x)));
  assert.ok(checkFormat(text.replace("\n### J. Conflicts by path class", "\n### J. Other"), m, []).some((x) => /J\. Conflicts/.test(x)));
  assert.ok(checkFormat(text.replace("**Time split:**", "**Time:**"), m, []).some((x) => /Time split/.test(x)));
  // gates: every P3 row passes on the good attempt; a stopped proof, a .git conflict or a Busy stops; nothing recorded is watch
  const rows = (x) => Object.fromEntries(evaluate(x).checks.map((r) => [r.name, r.result]));
  const good = rows(m);
  for (const k of ["Git", "Node proofs", "`.git` conflicts", "Resilience", "Content ratio", "Install inputs (reported, not gated)"]) assert.equal(good[k], "pass", k);
  const bad = p3Of(); bad.node.points[0].proofs.P1.result = "stop"; bad.conflicts.git = 1; bad.resilience.busy = 1; bad.git.statusClean = false; bad.content.storedContent = 6e6;
  const b = rows({ ...m, p3: bad });
  assert.deepEqual([b.Git, b["Node proofs"], b["`.git` conflicts"], b.Resilience, b["Content ratio"]], ["stop", "stop", "stop", "stop", "optimize"]);
  const empty = rows({ ...m, p3: {} });
  for (const k of ["Git", "Node proofs", "`.git` conflicts", "Resilience", "Content ratio"]) assert.equal(empty[k], "watch", k);
  const unrun = p3Of(); delete unrun.node.points[0].proofs.P4;
  assert.equal(rows({ ...m, p3: unrun })["Node proofs"], "watch", "a proof not run is never pass");
  assert.ok(renderFormat({ ...args, attempts: [{ ...m, p3: unrun }] }).includes("| NOT_RUN |"));
  // P2 attempts: none of it
  const p2 = renderFormat({ ...args, attempts: [base] });
  assert.ok(!p2.includes("**Phase P3**") && !p2.includes("### H. Git internals") && p2.includes("target ~9 : 1"));
  assert.ok(!("Git" in rows(base)));
});

test("p3record (REPORT_FORMAT §10.1): the p3 object filled from the play's git counters, Node points and proofs renders and passes the check", async () => {
  const { fillP3, p3Raw } = await import("../p3record.mjs");
  const base = formatMetrics(), ck = "c".repeat(40);
  const version = { ...base.version, bytes: 1200, git: { files: 30, bytes: 200 } };
  const storageReport = storageFigures({ parts: { exact: false, content: 900, metadata: 600, remainder: 3500, total: 5000 }, prevParts: null,
    bySource: { tracked: { content: 800, metadata: 500 }, git: { content: 100, metadata: 100 } }, added: { tracked: { content: 200, metadata: 100 }, nodeModules: { content: 30, metadata: 10 }, build: { content: 5, metadata: 1 }, git: { content: 50, metadata: 20 } }, version, changed: { tracked: 150, git: 60 }, commits: 3 });
  const git = { seed: { packBytes: 2e7, commits: 900, wallMs: 4000 }, lane: { execs: 3, commits: 3, wallMs: 3000 }, lanes: [{ lane: "L1", status: 3, diff: 3, add: 3, rm: 1, commits: 3, loose: 12, indexBytes: 9000, statusLstat: 3000, diffLstat: 3000, commitLstat: 3000 }],
    timings: { status: [100, 120, 140], diff: [90], add: [30], rm: [10], commit: [200], exec: [900] }, guard: [{ lane: "L1", paths: 14, violations: [], ms: 40 }],
    lead: { commits: 25, count: 25, head: ck, statusLines: 0, refreshMs: 50, repackMs: 300, writerMs: 2000, indexBytes: 28_000, newPackBytes: 9000, newIdxBytes: 1000, laneBytes_blob: 4000, wallMs: 6000 }, fresh: { statusLines: 0, sumScan: 0, statusMs: 600, wallMs: 900 } };
  const proofsOf = (r) => Object.fromEntries(["P1", "P2", "P3", "P4", "P5", "P6"].map((id) => [id, { result: id === "P6" ? "n/a" : r }]));
  const node = { points: [{ id: "lead.initial", lane: "lead", point: "initial", kind: "install", tree: "t".repeat(40), inputs: "i0", order: undefined, ms: 9000, install: { ms: 13000 }, tsc: { ms: 9800 } },
    { id: "L1.mid", lane: "L1", point: "mid", kind: "refresh", order: 4, inputs: "i0", treeLfs: "u".repeat(40), ms: 20000, install: { ms: 3000 }, tsc: { ms: 5000 }, vitest: { ms: 5600, files: ["a.spec.ts"] } }],
    lanes: { L1: { lane: "L1", installs: 0, refreshes: 1, tsc: 1, vitestPoints: 1, vitestFiles: 1, equal: null, run: null } }, inputs: { consistent: 3, total: 4 } };
  const m0 = { ...base, phase: "p3", plan: { ...base.plan, checkpoint: ck }, version, storageReport, execs: { ...base.execs, git: 12, pnpm: 3, tsc: 2, vitest: 1, other: 4 }, git, node,
    p3raw: p3Raw([{ phase: "end", method: "sandbox.commit", ok: true, sizes: { newStored: 1000, newMetadata: 200, newCanonical: 900 } }, { phase: "end", method: "sandbox.unmount", ok: true, ms: 30 }]), lww: { picks: [{ lane: "L1", picks: 5, nodeModules: 4 }] } };
  const args = { plan: { ...plan, dsh: { first: "a".repeat(40), commits: 25 }, checkpoint: ck, milestone: false }, summary, gates: [gate("pass")] };
  // played, proofs not run yet: every Node cell NOT_RUN, the report still passes its check
  const unrun = { ...m0, p3: fillP3(m0) };
  assert.equal(unrun.p3.git.commitsWritten, 25);
  assert.deepEqual(unrun.p3.node.points.map((p) => p.proofs.P1.result), ["NOT_RUN", "NOT_RUN"]);
  const t1 = renderFormat({ ...args, attempts: [unrun] });
  assert.deepEqual(checkFormat(t1, unrun, []), []);
  assert.equal(Object.fromEntries(evaluate(unrun).checks.map((r) => [r.name, r.result]))["Node proofs"], "watch");
  // after nodeproof.mjs proofs: the judged cells, churn from the lister groups, native speed
  const done = { ...m0, p3proofs: { "lead.initial": { tree: "t".repeat(40), cached: true, kind: "install", nativeInstallMs: 4100, nativeTscMs: 6400, proofs: { ...proofsOf("pass"), P3: { result: "n/a" }, P5: { result: "n/a" } } }, "L1.mid": { tree: "u".repeat(40), cached: false, kind: "refresh", nativeInstallMs: 1000, nativeVitestMs: 1500, proofs: proofsOf("pass") } } };
  const groups = { "lead.initial": [{ g: "node_modules/a", digest: "1", bytes: 100 }], "L1.mid": [{ g: "node_modules/a", digest: "2", bytes: 100 }, { g: "node_modules/b", digest: "1", bytes: 50 }] };
  const filled = { ...done, p3: fillP3(done, { groupsOf: (id) => groups[id] ?? null }) };
  assert.deepEqual([filled.p3.node.churn.rewrittenBytes, filled.p3.node.churn.storedBytes], [250, 46], "100 B of the first install, then 150 B the refresh rewrote; stored node_modules + build");
  assert.deepEqual([filled.p3.speed["pnpm.refresh"].lfs.p50, filled.p3.speed["pnpm.refresh"].native.p50, filled.p3.conflicts.installOutputs, filled.p3.conflicts.buildOutputs], [3000, 1000, 4, 1]);
  const t2 = renderFormat({ ...args, attempts: [filled] });
  for (const x of ["**Phase P3** · **Git ✓** · **Node ✓**", "| L1 | mid |", "| lead | initial |", "n/a", "| git status (steady) | 120 ms / 120 ms |", "**Execs by tool:** git 12 · pnpm 3 · tsc 2 · vitest 1 · other 4"]) assert.ok(t2.includes(x), x);
  assert.deepEqual(checkFormat(t2, filled, []), []);
  assert.equal(Object.fromEntries(evaluate(filled).checks.map((r) => [r.name, r.result]))["Node proofs"], "pass");
});

test("a finding in the binding format: pending, then every part, with vs without under two binaries", () => {
  const a1 = { ...formatMetrics(), attempt: 1, gate: gate("optimize") }, a2 = { ...formatMetrics(), attempt: 2, binary: { daemon: "7c2e9d40f1a3" }, gate: gate("pass") };
  const f = { range: 7, attempt: 1, verdict: "optimize", trigger: { check: "Scaling", value: "fit", threshold: "< 0.15" }, diagnosis: { step: "D4", summary: "a scan. more" },
    fix: { summary: "index", kind: 1, commit: "9a41c07e2", oldStores: "open unchanged", oldData: "still read as before", compat: "r006 fork opens: ok" }, improvement: [{ measure: "p95", before: 40, after: 17, unit: "ms", oldBinary: "511dceed", newBinary: "7c2e9d40", snapshot: "r007", cache: "warm" }],
    recovery: "fork", records: [{ title: "x", path: "fixes/007-a1-index.md" }], ledger: [{ file: "OPTIMIZATIONS.md", entry: "007.a1" }] };
  assert.deepEqual(checkFinding(f), []);
  assert.deepEqual(checkFinding(f, { full: true }), ["design.old is missing", "design.new is missing", "cost is missing"]);
  const pending = renderFindingFormat(7, a1, a1.gate, null, null);
  assert.ok(pending.includes("Diagnosis pending: `finding-007.a1.json`") && pending.includes("**1. Trigger**"));
  const full = renderFindingFormat(7, a1, a1.gate, { ...f, design: { old: "scan", new: "index" }, cost: "+1 index write" }, a2);
  for (const part of ["**2. Fix context**", "| Old design | scan |", "**4. With vs without", "`511dceeda1b5`", "`7c2e9d40f1a3`", "**5. Cost of the fix:** +1 index write", "](../fixes/007-a1-index.md)"]) assert.ok(full.includes(part), part);
  const text = renderFormat({ plan: { ...plan, dsh: { first: "a".repeat(40), commits: 25 }, checkpoint: "b".repeat(40) }, summary, attempts: [a1, a2], gates: [a1.gate, a2.gate], findings: [{ ...f, design: { old: "scan", new: "index" }, cost: "+1" }] });
  assert.deepEqual(checkFormat(text, a2, []), []);
  assert.ok(checkFormat(text.replace("`7c2e9d40f1a3` |", "`511dceeda1b5` |"), a2, []).some((p) => /same binary/.test(p)));
});


test("baselines by daemon: one per re-baseline run, beside the pilot's, never mixed", () => {
  const d = mkdtempSync(join(tmpdir(), "baseline-")), run = join(d, "run"), main = join(d, "main");
  mkdirSync(run); mkdirSync(main);
  const A = "511dceed".padEnd(64, "a"), B = "71001f65".padEnd(64, "b");
  writeFileSync(join(main, "baseline.json"), JSON.stringify({ daemon: A, ranges: [2, 3, 4], ops: {}, probes: {} }));
  const m = (range, daemon, p50) => ({ range, attempt: 1, mode: "measured", binary: { daemon }, ops: [{ op: "fs.read", sizeClass: "1–4 KiB", p50, p95: p50 * 2 }, { op: "fs.read", sizeClass: "≥1 MiB", p50: 9, p95: 12 }], probes: { stat: { ms: 3 } } });
  for (const k of [2, 3, 4]) writeFileSync(join(run, `range-00${k}.a1.json`), JSON.stringify(m(k, B, k)));
  assert.throws(() => writeBaseline({ metricsDir: run, ranges: [2, 3, 4, 5], out: main, run: "r" }), /no attempt of range 5/);
  const { file, baseline } = writeBaseline({ metricsDir: run, ranges: [2, 3, 4], out: main, run: "p1-rebase" });
  assert.equal(file, join(main, "baseline-71001f65bbbb.json"));
  assert.deepEqual([baseline.ranges, baseline.ops["fs.read\u00001–4 KiB"], Object.keys(baseline.ops).length], [[2, 3, 4], { p50: 3, p95: 6, n: 0, perRange: [0, 0, 0] }, 2]);
  const all = loadBaselines(main, { daemon: A });
  assert.deepEqual([...all.keys()], [A, B]);
  assert.throws(() => writeBaseline({ metricsDir: run, ranges: [2, 3, 4], out: main, run: "again" }), /already has a baseline/);
  writeFileSync(join(run, "range-003.a2.json"), JSON.stringify(m(3, A, 1)));
  rmSync(file);
  assert.throws(() => writeBaseline({ metricsDir: run, ranges: [2, 3, 4], out: main, run: "mixed" }), /mixes daemons/);
  rmSync(d, { recursive: true, force: true });
});

test("F-012 gate: checkpoint diff per changed entry, fitted against depth and tree files; never per tree file", () => {
  const cp = (stmts, ms = 1) => ({ unit: "entry", basis: "checkpoint", pages: 2, entries: 100, ms: ms * 100, statements: stmts * 100, msPerEntry: ms, statementsPerEntry: stmts });
  const mk = (range, depth, files, stmts, ms) => ({ range, binary: { daemon: "d" }, depth: { after: depth }, inputs: { tree: { files } }, checks: {}, perUnit: { "branch.diff_commits": cp(stmts, ms) } });
  const depths = [1000, 4000, 2000, 8000, 3000], files = [400, 800, 1600, 3200, 6400];
  const series = (f) => depths.map((d, i) => mk(i, d, files[i], f(i), 1));
  const scaling = (xs) => evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === "Scaling");
  const grows = scaling(series((i) => 0.25 * files[i]));
  assert.equal(grows.result, "optimize", grows.value);
  const flat = scaling(series(() => 6));
  assert.equal(flat.result, "pass", flat.value);
  assert.match(flat.value, /checkpoint (statements|ms)/);
  // ms alone rising with tree files also trips
  assert.equal(scaling(depths.map((d, i) => mk(i, d, files[i], 6, files[i] / 400))).result, "optimize");
});

test("checkpointDiff sums every page of the checkpoint step, per changed entry", () => {
  const line = (seq, step, ms, statements) => ({ seq, step, method: "branch.diff_commits", ms, ok: true, daemon: [{ sql: { writer: { statements, vm_steps: statements * 10 } } }] });
  const log = [1, 2, 3].map((seq) => ({ seq, method: "branch.diff_commits", size: { kind: "entries", n: seq === 3 ? 7 : 60 } }));
  const d = checkpointDiff([line(1, "r003.verify", 30, 300), line(2, "r003.verify", 10, 100), line(3, "probe:diff_commits", 5, 50)], log, "r003.verify");
  assert.deepEqual([d.pages, d.entries, d.ms, d.statements, d.msPerEntry, d.statementsPerEntry, d.basis], [2, 120, 40, 400, 0.3333, 3.333, "checkpoint"]);
  assert.equal(checkpointDiff([], log, "r003.verify"), null);
});

test("F-013: fixed and per-entry parts; flat total with falling entries passes, unseparable is watch", () => {
  const cp = (entries, statements, ms) => ({ unit: "entry", basis: "checkpoint", pages: 1, entries, statements, ms, statementsPerEntry: statements / entries, msPerEntry: ms / entries });
  const mk = (range, depth, files, c) => ({ range, binary: { daemon: "d" }, depth: { after: depth }, inputs: { tree: { files } }, checks: {}, perUnit: { "branch.diff_commits": c } });
  const scaling = (xs) => evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === "Scaling");
  // p1-rebase-b ranges 0-2 (daemon 361bb09e): totals flat, entries falling, tree growing
  const realRows = [[571, 255, 327, 1557, 18.6], [1114, 307, 240, 1389, 14.2], [1533, 373, 208, 1413, 16.9]];
  // F-019: three points are not judged (watch); a fourth with the same shape (flat total, falling entries) passes
  const three = scaling(realRows.map(([d, f, n, s, ms], i) => mk(i, d, f, cp(n, s, ms))));
  assert.equal(three.result, "watch", three.value);
  assert.match(three.value, /3 of 4 same-binary points/);
  const real = [...realRows, [2611, 438, 190, 1480, 15.5]].map(([d, f, n, s, ms], i) => mk(i, d, f, cp(n, s, ms)));
  const r = scaling(real);
  assert.equal(r.result, "pass", r.value);
  // entries grow with tree and depth, per entry flat: a and b not separable
  const grow = [[1000, 400, 100], [2000, 800, 200], [4000, 1600, 400], [8000, 3200, 800]].map(([d, f, n], i) => mk(i, d, f, cp(n, n * 6, n * 0.05)));
  const w = scaling(grow);
  assert.equal(w.result, "watch", w.value);
  assert.match(w.value, /not judged: .*cannot be separated/);
  // entries grow and per entry grows with tree files: trips
  const walk = [[1000, 400, 100], [2000, 800, 200], [4000, 1600, 400], [8000, 3200, 800]].map(([d, f, n], i) => mk(i, d, f, cp(n, n * 0.25 * f, n * 0.05)));
  assert.equal(scaling(walk).result, "optimize");
});

test("regate: prints today's verdicts over recorded metrics and writes nothing", () => {
  const d = mkdtempSync(join(tmpdir(), "regate-"));
  const m = (range) => ({ range, attempt: 1, run: "r", mode: "measured", binary: { daemon: "d".repeat(64) }, depth: { after: 1000 * (range + 1) }, checks: {}, gate: { verdict: "optimize", checks: [] },
    probes: { diff_commits: { ms: 5, version: 2, input: { files: 1 }, counters: { statements: 100 } } } });
  for (const k of [0, 1, 2]) writeFileSync(join(d, `range-00${k}.a1.json`), JSON.stringify(m(k)));
  const before = readdirSync(d).map((f) => [f, readFileSync(join(d, f), "utf8")]);
  const rows = regate({ metricsDir: d, oracleDir: join(d, "none") });
  assert.deepEqual(rows.map((r) => [r.range, r.stored]), [[0, "optimize"], [1, "optimize"], [2, "optimize"]]);
  assert.ok(rows.every((r) => typeof r.verdict === "string" && r.worst.name), "each row has today's verdict and its worst check");
  assert.deepEqual(readdirSync(d).map((f) => [f, readFileSync(join(d, f), "utf8")]), before, "no file written or changed");
  rmSync(d, { recursive: true, force: true });
});

test("F-015: the probe setup's Commits are not range work; a recorded Overview is corrected from its trace", () => {
  const base = overviewInput();
  const setup = [{ seq: 900, method: "fs.apply", label: "probe-setup:diff_commits", agent: "lead", kind: "Committed" }, { seq: 901, method: "fs.apply", label: "probe-setup:diff_commits", agent: "lead", kind: "Committed" },
    { seq: 902, method: "branch.merge", label: "probe:merge", agent: "lead", kind: "Merged", newCommit: true }];
  const o = buildOverview({ ...base, log: [...base.log, ...setup] });
  const { probeCommits, ...rest } = o;
  const { probeCommits: none, ...plain } = buildOverview(base);
  assert.deepEqual(rest, plain, "probe and probe-setup records add no Commit");
  assert.deepEqual([probeCommits, none], [3, 0], "they are counted on their own line");
  // the later probe samples (probe-s<i>:, a88169557) are probe records too
  const samples = [{ seq: 903, method: "branch.merge", label: "probe-s1:merge", agent: "lead", kind: "Merged", newCommit: true }, { seq: 904, method: "sandbox.commit", label: "probe-s2:oneshot_commit", agent: "lead", kind: "Committed" }];
  const withSamples = buildOverview({ ...base, log: [...base.log, ...setup, ...samples] });
  assert.deepEqual([withSamples.commits, withSamples.probeCommits], [o.commits, 5]);
  assert.match(renderOverview({ range: 14, verdict: "watch", m: { overview: withSamples, calls: {}, work: {} } }), /Scale-probe Commits \(setup and samples\): \*\*5\*\*, not range work and not counted above\./);
  // a recorded Overview that counted them (before the fix)
  const bad = { ...o, agents: o.agents.map((a) => (a.agent === "lead" ? { ...a, commits: a.commits + 2 } : a)), branches: o.branches.map((b) => (b.name === "main" ? { ...b, commits: b.commits + 2 } : b)), commits: o.commits + 2, running: o.running + 2 };
  const trace = [{ phase: "end", step: "probe-setup:diff_commits#1", method: "fs.apply", kind: "Committed" }, { phase: "start", step: "probe-setup:diff_commits#1", method: "fs.apply" },
    { phase: "end", step: "probe-setup:diff_commits#2", method: "fs.apply", kind: "Committed" }, { phase: "end", step: "r007.s0001#3", method: "fs.write", kind: "Committed" },
    { phase: "end", step: "probe-setup:diff_commits#4", method: "branch.list_commits", kind: "ok" }].map((x) => JSON.stringify(x)).join("\n");
  assert.equal(probeSetupCommits(trace), 2);
  const fixed = withoutProbeSetupCommits(bad, 2);
  assert.deepEqual([fixed.commits, fixed.running, fixed.agents.at(-1).commits, fixed.branches.at(-1).commits], [o.commits, o.running, o.agents.at(-1).commits, o.branches.at(-1).commits]);
  assert.equal(fixed.corrections[0].finding, "F-015");
  assert.equal(withoutProbeSetupCommits(fixed, 2), fixed, "applied once");
  // an Overview recorded with the samples counted (014.a2): corrected from its trace, the probe Commits kept on their own line
  const sampleTrace = [{ phase: "end", step: "probe-s1:merge#5", method: "branch.merge", kind: "Merged" }, { phase: "end", step: "probe-s1:oneshot_commit#6", method: "sandbox.commit", kind: "Committed" },
    { phase: "end", step: "probe:merge#7", method: "branch.merge", kind: "Merged" }, { phase: "end", step: "probe-s2:fork#8", method: "branch.fork", kind: "Forked" }].map((x) => JSON.stringify(x)).join("\n");
  assert.deepEqual([probeCommitsOf(sampleTrace, { samples: true }), probeCommitsOf(sampleTrace)], [2, 3]);
  const counted = { ...o, agents: o.agents.map((a) => (a.agent === "lead" ? { ...a, commits: a.commits + 2 } : a)), branches: o.branches.map((b) => (b.name === "main" ? { ...b, commits: b.commits + 2 } : b)), commits: o.commits + 2, running: o.running + 2 };
  const back = withoutProbeSampleCommits(counted, 2, 3);
  assert.deepEqual([back.commits, back.agents.at(-1).commits, back.probeCommits, back.corrections.at(-1).finding], [o.commits, o.agents.at(-1).commits, 3, "probe-samples"]);
  assert.equal(withoutProbeSampleCommits(back, 2, 3), back, "applied once");
});

test("F-016: chain-reading probes are judged as a bound over a delta-cap period, not a depth exponent", () => {
  const cyc = [60, 84, 108, 132, 156, 180, 204, 228];
  const mk = (i, v) => ({ range: 5 + i, binary: { daemon: "d" }, depth: { after: 4000 + 500 * i }, checks: {}, storage: { delta: { caps: { metadata: 8 } } },
    probes: { list_small: { ms: 4 + v / 100, input: { entries: 5 }, counters: { statements: v + 24 } } } });
  const series = (f, n) => Array.from({ length: n }, (_, i) => mk(i, f(i)));
  const rows = (xs) => { const g = evaluate(xs.at(-1), xs.slice(0, -1)); return ["Scaling", "Counters"].map((n) => g.checks.find((c) => c.name === n)); };
  // the recorded periodic series (fixes/007-a1-list-small-chain-period.md): 20 points, 60 ... 228, reset
  const periodic = rows(series((i) => cyc[i % 8], 20));
  for (const r of periodic) assert.equal(r.result, "pass", r.value);
  assert.match(periodic[1].value, /chain-bounded.*1×/);
  // growth without a reset: +24 reads per range
  const grows = rows(series((i) => 60 + 24 * i, 10));
  assert.equal(grows[1].result, "optimize", grows[1].value);
  // too few points to see a period
  const few = rows(series((i) => cyc[i], 5));
  for (const r of few) { assert.equal(r.result, "watch"); assert.match(r.value, /not judged: list_small.*of 9 points/); }
});

test("phase-matched baselines: chosen by daemon, addon and phase; P2 never falls back to a P1 baseline", () => {
  const d = mkdtempSync(join(tmpdir(), "pbase-")), run = join(d, "run"), main = join(d, "main");
  mkdirSync(run); mkdirSync(main);
  const D = "c25119ac".padEnd(64, "c"), S = "5baa0f5d".padEnd(64, "5"), S0 = "3da0f665".padEnd(64, "3");
  const m = (range, phase, sdk = S) => ({ range, attempt: 1, mode: "measured", phase, binary: { daemon: D, sdk }, ops: [{ op: "fs.read", sizeClass: "≤8 KiB", p50: range, p95: 2 * range }], probes: {} });
  for (const k of [2, 3, 4]) writeFileSync(join(run, `range-00${k}.a1.json`), JSON.stringify(m(k, "p2")));
  writeFileSync(join(main, `baseline-${D.slice(0, 12)}.json`), JSON.stringify({ daemon: D, ranges: [2, 3, 4], ops: {}, probes: {} }));
  const { file } = writeBaseline({ metricsDir: run, ranges: [2, 3, 4], out: main, run: "rb", phase: "p2" });
  assert.equal(file, join(main, `baseline-${D.slice(0, 12)}-${S.slice(0, 12)}-p2.json`));
  const all = loadBaselines(main);
  assert.equal(baselineFor(all, m(7, "p2")).phase, "p2");
  assert.equal(baselineFor(all, m(7, "p2", S0)), null, "another addon: no baseline, never the P1 one");
  assert.equal(baselineFor(all, m(7, "p1")).phase, undefined, "P1 keeps its daemon baseline");
  assert.throws(() => writeBaseline({ metricsDir: run, ranges: [2, 3, 4], out: main, run: "again", phase: "p2" }), /already has a baseline/);
  writeFileSync(join(run, "range-003.a2.json"), JSON.stringify(m(3, "p2", S0)));
  rmSync(file);
  assert.throws(() => writeBaseline({ metricsDir: run, ranges: [2, 3, 4], out: main, run: "mixed", phase: "p2" }), /mixes addons/);
  // the gate refuses a baseline of another phase or addon
  const g = evaluate({ ...m(7, "p2", S0), checks: {} }, [], { daemon: D, sdk: S, phase: "p2", ops: {} });
  assert.match(g.checks.find((c) => c.name === "Speed").value, /not this attempt's; not judged/);
  rmSync(d, { recursive: true, force: true });
});

test("glob_tree is fitted per tree file: growth with the tree passes, a per-file rise with depth trips", () => {
  const mk = (i, perFile) => ({ range: i, binary: { daemon: "d" }, depth: { after: 1000 * (i + 1) }, inputs: { tree: { files: 300 * (i + 1), bytes: 1e5 * (i + 1) } }, checks: {},
    probes: { glob_tree: { ms: 0.02 * 300 * (i + 1) * perFile(i), counters: { statements: Math.round(300 * (i + 1) * perFile(i)) } } } });
  const row = (xs, n) => evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === n);
  const tree = [0, 1, 2, 3].map((i) => mk(i, () => 1));
  assert.equal(row(tree, "Counters").result, "pass", row(tree, "Counters").value);
  assert.match(row(tree, "Scaling").value, /per tree file|pass|exponent/);
  const depth = [0, 1, 2, 3].map((i) => mk(i, (j) => j + 1));
  assert.equal(row(depth, "Counters").result, "optimize", row(depth, "Counters").value);
  assert.match(row(depth, "Counters").value, /glob_tree\.statements per tree file/);
});

test("F-019: the checkpoint diff is normalised by changed entries plus their changed ancestor directories", () => {
  assert.equal(changedDirs(["/a/b/c.txt", "/a/b/d.txt", "/a/e.txt", "/f.txt"]), 3, "root, a, a/b");
  assert.equal(changedDirs([]), 0);
  const d = withDirs({ unit: "entry", basis: "checkpoint", entries: 100, ms: 50, statements: 1000, msPerEntry: 0.5, statementsPerEntry: 10 }, 25);
  assert.deepEqual([d.basis, d.units, d.statementsPerEntry, d.msPerEntry, d.perChangedEntryOnly.statementsPerEntry], ["checkpoint+dirs", 125, 8, 0.4, 10]);
  // the fixer's same-Store series: per entry rises with change shape, per (entry + changed directory) much less
  const mk = (i, files, entries, dirs, stmts) => ({ range: 5 + i, binary: { daemon: "d" }, depth: { after: 4000 + 500 * i }, inputs: { tree: { files } }, checks: {},
    perUnit: { "branch.diff_commits": withDirs({ unit: "entry", basis: "checkpoint", entries, ms: stmts / 100, statements: stmts, msPerEntry: 0, statementsPerEntry: stmts / entries }, dirs) } });
  const xs = [mk(0, 654, 253, 40, 1851), mk(1, 706, 195, 75, 1725), mk(2, 804, 317, 116, 3132)];
  const row = evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === "Scaling");
  assert.equal(row.result, "watch", "three points: not judged");
});

test("F-020: F4 checks the before/after table and the with-vs-without table each by its own shape", () => {
  const ba = "| Measure | Before | After | Change | Old binary | New binary | Snapshot / checkpoint | Cache |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| p50 | 40 ms | 17 ms | −58% | `aaaaaaaa` | `bbbbbbbb` | r007 | warm |";
  const ww = (h2 = "Attempt 2 (with) · `c25119ace6ae`", row = "| Range time (tooling) | 16.6 s | 20.6 s |") =>
    `**4. With vs without the optimization, this range**\n\n| Measure | Attempt 1 (without) · \`361bb09e1d94\` | ${h2} |\n| --- | --- | --- |\n${row}`;
  const block = (w) => `**3. Before / after**\n\n${ba}\n\nCounter text.\n\n${w}\n\n**5. Cost of the fix:** none`;
  assert.deepEqual(findingTableProblems(block(ww())), []);
  assert.deepEqual(findingTableProblems(block(ww("Attempt 2 (with)"))), ['with-vs-without column "Attempt 2 (with)" is not labelled with its binary']);
  assert.deepEqual(findingTableProblems(block(ww(undefined, "| Range time (tooling) | 16.6 s |  |"))), ['with-vs-without row "Range time (tooling)" does not fill every column']);
  assert.deepEqual(findingTableProblems(block("").replace("| warm |", "|  |")), ['row "p50" does not fill every column']);
  assert.deepEqual(blockTables(block(ww())).map((t) => t.rows.length), [1, 1]);
});

test("F-021 follow-up: open issues are judged as of the latest attempt's start", () => {
  const issues = [{ id: "F-013" }, { id: "F-020" }, { id: "F-099" }];
  const opened = new Map([["F-013", Date.parse("2026-10-17T20:00:00Z")], ["F-020", Date.parse("2026-10-18T00:11:13Z")]]);
  assert.deepEqual(issuesAsOf(issues, opened, "2026-10-17T23:16:50.546Z").map((i) => i.id), ["F-013"], "F-020 opened after; F-099 not committed");
  assert.deepEqual(issuesAsOf(issues, opened, "2026-10-18T01:00:00Z").map((i) => i.id), ["F-013", "F-020"]);
  assert.deepEqual(issuesAsOf(issues, opened, undefined), issues, "no start recorded: every open issue");
});

test("runner container: docker run arguments with the run's Store volume, the host refused, the shim's run parsing and stream split", () => {
  const a = runnerArgs({ imageId: "sha256:abc", hostSocket: "/Users/u/.docker/run/docker.sock", args: ["play", "--run", "x"], sdk: "/w/f020/sdk/js", gitCommon: "/m/.git", home: "/Users/u", repo: "/r", history: "/Users/u/lfs-history" });
  const s = a.join(" ");
  for (const want of ["--name layerfs-issue352-runner --init -v", "LAYERFS_DAEMON_HOST=host.docker.internal", "--mount type=bind,src=/m/.git,dst=/m/.git,readonly", "-v /r:/r", "-v /Users/u/lfs-history:/Users/u/lfs-history", "-v layerfs-issue352-x:/layerfs-store", "-v /w/f020/sdk/js:/w/f020/sdk/js:ro",
    "-v /var/run/docker.sock:/Users/u/.docker/run/docker.sock", "LAYERFS_STORE_PATH=/layerfs-store/global/store.sqlite", "LAYERFS_RUNNER_IMAGE=sha256:abc", "PATH=/r/dsh/tools/history/runner:"]) assert.ok(s.includes(want), want);
  assert.ok(!s.includes("ROUTE"), "one route: nothing to choose");
  assert.ok(!s.includes("--network"), "the default bridge; host networking is excluded");
  assert.ok(!runnerArgs({ imageId: "i", args: ["play", "--run", "x"], gitCommon: "/r/.git", repo: "/r", history: "/h" }).join(" ").includes("--mount"), "a plain checkout's .git is already mounted");
  assert.ok(!runnerArgs({ imageId: "i", args: ["play", "--run", "x"], sdk: "/r/sdk/js", repo: "/r", history: "/h" }).join(" ").includes(":ro -v /var"), "an SDK inside the checkout is already mounted");
  assert.equal(runOf(["phase", "--run", "y", "--phase", "p2"]), "y");
  assert.equal(runOf(["play"]), null);
  const env = { LAYERFS_RUNNER: "layerfs-issue352-runner", LAYERFS_STORE_PATH: "/layerfs-store/global/store.sqlite" };
  assert.equal(checkRunner("play", env, "linux"), null);
  assert.match(checkRunner("play", {}, "darwin"), /run it in the runner container/);
  assert.match(checkRunner("fork", { ...env, LAYERFS_STORE_PATH: "/x" }, "linux"), /not \/layerfs-store\/global\/store\.sqlite/);
  assert.equal(checkRunner("phase", {}, "darwin"), null, "phase touches no Store");
  assert.equal(checkRunner("cleanup", {}, "darwin"), null, "cleanup removes the volume the runner would hold");
  const body = parseRun(["--rm", "--network", "none", "--user", "0", "-v", "vol:/v:ro", "--entrypoint", "python3", "img", "-c", "print(1)"]);
  assert.deepEqual([body.Image, body.Cmd, body.Entrypoint, body.User, body.HostConfig], ["img", ["-c", "print(1)"], ["python3"], "0", { Binds: ["vol:/v:ro"], NetworkMode: "none" }]);
  assert.throws(() => parseRun(["--privileged", "img"]), /not supported/);
  const frame = (k, t) => Buffer.concat([Buffer.from([k, 0, 0, 0]), Buffer.from([0, 0, 0, Buffer.byteLength(t)]), Buffer.from(t)]);
  const d = demux(Buffer.concat([frame(1, "out1 "), frame(2, "err"), frame(1, "out2")]));
  assert.deepEqual([d.stdout.toString(), d.stderr.toString()], ["out1 out2", "err"]);
});

test("F-023: the one-file diff_commits probe is chain-bounded: the recorded nine points pass, unbounded growth trips", () => {
  const files = [373, 438, 530, 654, 706, 760, 804, 830, 860], stmts = [78, 78, 96, 72, 96, 90, 90, 93, 84];
  const mk = (i, v) => ({ range: 2 + i, binary: { daemon: "d" }, depth: { after: 1500 + 500 * i }, inputs: { tree: { files: files[i] } }, checks: {}, storage: { delta: { caps: { metadata: 8 } } },
    probes: { diff_commits: { ms: 5 + (v % 7) / 10, version: 3, input: { files: 1 }, counters: { statements: v } } } });
  const counters = (xs) => evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === "Counters");
  const rec = counters(stmts.map((v, i) => mk(i, v)));
  assert.equal(rec.result, "pass", rec.value);
  assert.equal(counters(stmts.map((v, i) => mk(i, 72 + 12 * i))).result, "optimize");
  assert.equal(counters(stmts.slice(0, 3).map((v, i) => mk(i, v))).result, "watch", "three points: not judged");
});

test("r017.a1 (liaison 2026-10-19): list_largest is chain-bounded per entry: r015-r017 not judged, a bounded sawtooth passes, growth past a period or a rise per entry trips", () => {
  const mk = (i, entries, st, reads, ms = 5) => ({ range: 15 + i, binary: { daemon: "d" }, depth: { after: 12851 + 1000 * i }, inputs: { tree: { files: 40000 + 100 * i } }, checks: {}, storage: { delta: { caps: { metadata: 8 } } },
    probes: { list_largest: { ms, input: { dir: "scripts", entries }, counters: { statements: st, blob_reads: reads } } } });
  const rows = (xs) => { const g = evaluate(xs.at(-1), xs.slice(0, -1)); return ["Scaling", "Counters"].map((n) => g.checks.find((c) => c.name === n)); };
  // the recorded points: 72/92/103 statements, 153/207/240 blob reads at 45/50/50 entries (r015.a4, r016.a3, r017.a1)
  const rec = rows([[45, 72, 153, 4.7], [50, 92, 207, 7.8], [50, 103, 240, 8.1]].map(([e, s, r, ms], i) => mk(i, e, s, r, ms)));
  for (const r of rec) { assert.equal(r.result, "watch", r.value); assert.match(r.value, /not judged: list_largest.*of 9 points/); }
  // a bounded sawtooth per entry over 20 ranges (a cap-8 chain that resets), with the directory growing: pass
  const saw = [1.6, 1.84, 2.06, 2.3, 2.5, 2.7, 2.9, 3.1];
  const bounded = rows(Array.from({ length: 20 }, (_, i) => { const e = 45 + i; return mk(i, e, saw[i % 8] * e, 2.125 * saw[i % 8] * e); }));
  for (const r of bounded) assert.equal(r.result, "pass", r.value);
  assert.match(bounded[1].value, /per entry of the largest directory \(chain-bounded\)/);
  // growth that goes on past one cap period: +0.2 statements per entry every range, never resetting
  const grows = rows(Array.from({ length: 12 }, (_, i) => mk(i, 50, Math.round((1.6 + 0.2 * i) * 50), 150 + 20 * i)));
  assert.equal(grows[1].result, "optimize", grows[1].value);
  // a rise per entry at a fixed chain depth: the same sawtooth, each period 10% dearer per entry
  const dearer = rows(Array.from({ length: 20 }, (_, i) => mk(i, 50, Math.round(saw[i % 8] * 50 * (1 + 0.1 * Math.floor(i / 8))), 160)));
  assert.equal(dearer[1].result, "optimize", dearer[1].value);
  // the directory growing alone (cost proportional to its entries) is not growth per entry
  const wider = rows(Array.from({ length: 12 }, (_, i) => mk(i, 45 + 10 * i, 2 * (45 + 10 * i), 4 * (45 + 10 * i))));
  for (const r of wider) assert.equal(r.result, "pass", r.value);
});

test("#352 prep 51-100: a chain-bounded window maximum names the call that set it and says when it is carried", () => {
  // merge.returned_rows as recorded r031-r048 (last attempt each, daemon 27a769a4): 2,513 at r41, 2,514 at r45
  const rows = [1633, 1488, 1941, 1849, 1784, 1536, 1553, 1818, 1739, 1753, 2513, 2440, 1721, 1720, 2514, 1874, 1613, 1926];
  const mk = (i, r) => ({ range: 31 + i, attempt: i === 7 || i === 13 ? 2 : 1, binary: { daemon: "d" }, depth: { after: 30000 + 1000 * i }, checks: {}, storage: { delta: { caps: { metadata: 8 } } },
    probes: { merge: { ms: 30, input: { filesPerSide: 2 }, counters: { returned_rows: r } } } });
  const xs = rows.map((r, i) => mk(i, r));
  const at = (k) => evaluate(xs[k], xs.slice(0, k)).checks.find((c) => c.name === "Counters");
  const r48 = at(17);
  assert.equal(r48.result, "optimize", "the band is unchanged");
  assert.match(r48.value, /max over the latest cap period 2514 \(r045\.a1 merge probe\) vs the first 1941 \(r033\.a1 merge probe\): 1\.295× \(bound, period 8; carried from r045\.a1 merge probe; this range 1926, not a new maximum\)/);
  assert.match(at(14).value, /2514 \(r045\.a1 merge probe\).*set by this range\)/, "r45 set it");
  assert.match(at(12).value, /2513 \(r041\.a1 merge probe\).*carried from r041\.a1/, "r43 carries r41's");
  assert.equal(callName({ range: 7 }, "stat"), "r007 seed stat probe");
});

test("F-024: baseline classes carry n; a thin class is not judged; merge and Commit outcomes are their own classes", () => {
  const b = buildBaseline([2, 3, 4].map((range) => ({ range, binary: { daemon: "d" }, ops: [{ op: "branch.merge", sizeClass: "17–64 entries · UpToDate", n: range === 2 ? 1 : 0, p50: 3.51, p95: 3.51 }, { op: "fs.read", sizeClass: "≤8 KiB", n: 20, p50: 4, p95: 6 }].filter((r) => r.n) })));
  assert.deepEqual([b.ops["branch.merge\u000017–64 entries · UpToDate"].perRange, b.ops["fs.read\u0000≤8 KiB"].n], [[1, 0, 0], 60]);
  const m = { range: 10, binary: { daemon: "d" }, checks: {}, ops: [{ op: "branch.merge", sizeClass: "17–64 entries · UpToDate", n: 3, p50: 227, p95: 300 }, { op: "fs.read", sizeClass: "≤8 KiB", n: 30, p50: 4.4, p95: 6.6 }] };
  const speed = evaluate(m, [], b).checks.find((c) => c.name === "Speed");
  // #352 prep 51-100: the thin class is listed beside the judged ones and no longer hides the row
  assert.equal(speed.result, "pass");
  assert.match(speed.value, /^fs\.read ≤8 KiB: 1\.1× baseline .*; not judged: branch\.merge 17–64 entries · UpToDate: 1\/0\/0 calls \(85\.47×\) \(baseline class under 5 calls per range\)$/);
  // only thin classes: the row is not judged, as before
  const alone = evaluate({ ...m, ops: m.ops.slice(0, 1) }, [], b).checks.find((c) => c.name === "Speed");
  assert.equal(alone.result, "watch");
  assert.match(alone.value, /not judged: branch\.merge 17–64 entries · UpToDate: baseline class has 1\/0\/0 calls \(minimum 5 per range\)/);
  // lead rule: per range, every op and class; 3/3/8 is thin though it sums to 14, 5/5/5 is a reference
  const w = (counts) => buildBaseline(counts.map((n, i) => ({ range: 2 + i, binary: { daemon: "d" }, ops: [{ op: "fs.write", sizeClass: "≤512 KiB", n, p50: 10, p95: 12 }] })));
  const sp = (bl) => evaluate({ range: 10, binary: { daemon: "d" }, checks: {}, ops: [{ op: "fs.write", sizeClass: "≤512 KiB", n: 9, p50: 30, p95: 36 }] }, [], bl).checks.find((c) => c.name === "Speed");
  assert.match(sp(w([3, 3, 8])).value, /not judged: fs\.write ≤512 KiB: baseline class has 3\/3\/8 calls/);
  assert.equal(sp(w([3, 3, 8])).result, "watch");
  assert.match(sp(w([5, 5, 5])).value, /^fs\.write ≤512 KiB: 3× baseline/);
  assert.equal(thinClass({ n: 4 }), true, "a baseline without per-range counts falls back to its total");
  // outcome classes from the calls
  const calls = [{ method: "branch.merge", ms: 3, size: { kind: "entries", n: 20 }, outcome: outcomeOf("UpToDate") }, { method: "branch.merge", ms: 200, size: { kind: "entries", n: 20 }, outcome: outcomeOf("Merged", true) }];
  assert.deepEqual(aggregate(calls).map((r) => r.sizeClass), ["17–64 entries · Merged (new Commit)", "17–64 entries · UpToDate"]);
  assert.equal(callOf({ method: "sandbox.commit", ms: 1, kind: "UpToDate" }).outcome, "UpToDate");
  assert.equal(callOf({ method: "fs.read", ms: 1, kind: "ok" }).outcome, undefined);
});

test("fetch-store: one status line per lockfile, at most four fetches at a time, scripts ignored", () => {
  const sc = fetchScript(["aa", "bb"]);
  assert.match(sc, /^printf '%s\\n' aa bb \| xargs -P 4 -I\{\} sh -c /);
  assert.match(sc, /cd \/tmp\/\{\} && pnpm fetch .*--ignore-scripts > \/f\/\{\}\/fetch\.log 2>&1; echo "\{\} \$\?"'$/);
});

test("closure (INSTALLS): install, build and test steps; the node_modules lister and oracle comparison", async () => {
  const packages = new Set(["packages/a", "packages/b", "packages/c"]), tsconfigs = new Set(["packages/a", "packages/b"]);
  // the lead repair is a clean relink (owner 2026-10-19, F-057): every node_modules removed, then the frozen offline install
  const repairStep = closureSteps({ packages, tsconfigs, run: [], changed: ["docs/x.md"], installed: true, milestone: false, repair: true })[0];
  assert.deepEqual([repairStep.kind, repairStep.command], ["repair-install", installCommand({ clean: true })]);
  assert.ok(repairStep.command.includes(`${CLEAN_REMOVE} && `) && /--offline --frozen-lockfile/.test(repairStep.command) && repairStep.command.startsWith(storeSetup(STORE_MOUNT)));
  assert.equal(closureSteps({ packages, tsconfigs, run: [], changed: ["pnpm-lock.yaml"], installed: true, milestone: false })[0].command, installCommand(), "an incremental install outside the repair stays incremental");
  assert.equal(closureSteps({ packages, tsconfigs, run: [], changed: [], installed: true, milestone: true, repair: true })[0].kind, "clean-install", "a milestone's clean install is already clean");
  // F-059 (owner 2026-10-20, option A): the repair's build first removes lib/ and every tsbuildinfo in every tsconfig package
  const files = new Map(["packages/a/package.json", "packages/a/tsconfig.json", "packages/b/package.json", "packages/b/tsconfig.json", "packages/c/package.json", "tsconfig.json", "tsdown.config.ts"].map((p) => [p, {}]));
  const repairBuildStep = closureSteps({ packages, tsconfigs, run: [], changed: ["packages/a/src/x.ts"], installed: true, milestone: false, repair: true, files }).find((s) => s.kind === "build");
  // then dsh's whole build: tsdown bundles every package from its lib/types (r018 a5: UNRESOLVED_ENTRY after a partial build)
  assert.deepEqual([repairBuildStep.command, repairBuildStep.packages], [`${repairClean(files)} && ./node_modules/.bin/tsc -b 'packages/a' 'packages/b' && ./node_modules/.bin/tsdown`, ["packages/a", "packages/b"]]);
  // every package with a tsconfig, none without (the root's tsconfig is no package), and every packages/<group>/<name>
  // folder the checkpoint no longer has, its emptied folder pruned (r019 a2: an orphan's lib/ bundled by tsdown)
  assert.equal(repairClean(files), `rm -rf 'packages/a/lib' 'packages/b/lib' packages/*/*/lib && find . -path ./.git -prune -o -name node_modules -prune -o -name '*.tsbuildinfo' -type f -print0 | xargs -0 -r rm -f && ${PRUNE_EMPTY}`);
  assert.equal(repairClean(new Map([["vendor/v/package.json", {}], ["vendor/v/tsconfig.json", {}]])), "rm -rf 'vendor/v/lib' && find . -path ./.git -prune -o -name node_modules -prune -o -name '*.tsbuildinfo' -type f -print0 | xargs -0 -r rm -f", "no packages/ folder, no orphan sweep");
  // fix 060 (r044 a1): a packages/<group>/<name> folder the checkpoint does not track goes whole, ignored or emitted
  // files and all (git clean -f never enters it); tracked folders keep their files
  {
    const tmp = mkdtempSync(join(tmpdir(), "fix060-")), at = (p) => join(tmp, p);
    for (const p of ["packages/g/a/src/x.ts", "packages/g/a/node_modules/m/i.js", "packages/g/gone/src/index.js", "packages/g/gone/src/index.d.ts", "packages/g/bare/README.md"]) { mkdirSync(dirname(at(p)), { recursive: true }); writeFileSync(at(p), "x"); }
    const tracked = new Map([["packages/g/a/package.json", {}], ["packages/g/a/tsconfig.json", {}], ["packages/g/bare/README.md", {}]]);
    execFileSync("sh", ["-c", repairClean(tracked).replace(` && ${PRUNE_EMPTY}`, "")], { cwd: tmp }); // PRUNE_EMPTY is GNU xargs (the image)
    assert.deepEqual(["packages/g/a/src/x.ts", "packages/g/a/node_modules/m/i.js", "packages/g/gone", "packages/g/bare/README.md"].map((p) => existsSync(at(p))), [true, true, false, true]);
    rmSync(tmp, { recursive: true, force: true });
  }
  assert.equal(closureSteps({ packages, tsconfigs, run: [], changed: ["packages/a/src/x.ts"], installed: true, milestone: false }).find((s) => s.kind === "build").command, buildCommand(["packages/a"]), "only the repair cleans");
  const kinds = (o) => closureSteps({ packages, tsconfigs, run: [], ...o }).map((s) => s.kind);
  assert.deepEqual(kinds({ changed: ["packages/a/src/x.ts"], installed: false, milestone: false }), ["install", "build"]);
  assert.deepEqual(kinds({ changed: ["packages/c/package.json", "packages/b/src/y.ts"], installed: true, milestone: false }), ["incremental-install", "build"]);
  assert.deepEqual(kinds({ changed: ["docs/x.md"], installed: true, milestone: false }), []);
  assert.deepEqual(kinds({ changed: ["docs/x.md"], installed: true, milestone: true }), ["clean-install"]);
  assert.equal(installInputsChanged(["node_modules/x/package.json"]), false, "installed files are not inputs");
  const steps = closureSteps({ packages, tsconfigs, changed: ["packages/b/src/y.ts", "packages/a/q.ts", "packages/c/z.ts"], installed: true, milestone: true, run: ["packages/a/tests/t.spec.ts"] });
  assert.match(steps[0].command, /find \. -name node_modules -type d -prune -exec rm -rf \{\} \+ && pnpm install --offline --frozen-lockfile --store-dir \/tmp\/pnpm-store --cache-dir \/tmp\/pnpm-cache --ignore-scripts --fetch-retries=0 --fetch-timeout=3000$/, "NODE_RULE B3: a store gap fails at once");
  // the private writable layer over the read-only store, built by the shell on a fake store
  const fakeStore = mkdtempSync(join(tmpdir(), "store-"));
  mkdirSync(join(fakeStore, ".cache/v11"), { recursive: true }); mkdirSync(join(fakeStore, "v11/files"), { recursive: true });
  writeFileSync(join(fakeStore, ".cache/lockfile-verified.jsonl"), "{}\n"); writeFileSync(join(fakeStore, "v11/index.db"), "db");
  const tmpRoot = mkdtempSync(join(tmpdir(), "priv-"));
  execFileSync("sh", ["-c", storeSetup(fakeStore).replaceAll("/tmp/", `${tmpRoot}/`)]);
  assert.equal(readFileSync(join(tmpRoot, "pnpm-store/v11/index.db"), "utf8"), "db");
  assert.equal(readlinkSync(join(tmpRoot, "pnpm-store/v11/files")), join(fakeStore, "v11/files"));
  assert.equal(readlinkSync(join(tmpRoot, "pnpm-cache/v11")), join(fakeStore, ".cache/v11"));
  assert.ok(existsSync(join(tmpRoot, "pnpm-cache/lockfile-verified.jsonl")));
  rmSync(fakeStore, { recursive: true, force: true }); rmSync(tmpRoot, { recursive: true, force: true });
  assert.equal(steps[1].command, "./node_modules/.bin/tsc -b 'packages/a' 'packages/b'");
  assert.match(steps[2].command, /vitest run --reporter=json 'packages\/a\/tests\/t\.spec\.ts'$/);
  assert.equal(normalizeOutput("Progress: resolved 1\nPackages: +3\nDone in 1m 44.3s using pnpm v11.7.0"), "Packages: +3\nDone in <t> using pnpm v11.7.0");
  // the lister on a small pnpm-shaped tree
  const t = mkdtempSync(join(tmpdir(), "nm-"));
  mkdirSync(join(t, "node_modules/.pnpm/x@1/node_modules/x"), { recursive: true });
  writeFileSync(join(t, "node_modules/.pnpm/x@1/node_modules/x/index.js"), "hi\n");
  symlinkSync(".pnpm/x@1/node_modules/x", join(t, "node_modules/x"));
  mkdirSync(join(t, "src")); writeFileSync(join(t, "src/a.ts"), "no\n");
  const list = (g = []) => execFileSync("sh", ["-c", listerCommand(g)], { cwd: t, encoding: "utf8" });
  const groups = parseLister(list()).groups;
  assert.deepEqual(parseLister(list()).normalized, { bookkeeping: 0, shims: 0, links: 1 });
  assert.deepEqual(groups.map((g) => [g.g, g.n, g.bytes]).slice(0, 3), [["node_modules/.pnpm", 1, 0], ["node_modules/.pnpm/x@1", 3, 3], ["node_modules/x", 1, 24]]);
  assert.equal(groups.at(-1).g, "#pnpm-ls", "the resolved package set is one more group");
  assert.match(list(["node_modules/.pnpm/x@1"]), /^f 644 45b983be36b73c0788dc9cbcb76cbb80fc7bb057 node_modules\/\.pnpm\/x@1\/node_modules\/x\/index\.js$/m);
  assert.match(list(["node_modules/x"]), /^l node_modules\/\.pnpm\/x@1\/node_modules\/x node_modules\/x$/m, "a link by where it resolves, from the root");
  assert.equal(compareInstalled({ groups }, groups).ok, true);
  const changed = compareInstalled({ groups }, [{ ...groups[0], digest: "0" }]);
  assert.deepEqual([changed.differ, changed.missing], [["node_modules/.pnpm"], ["node_modules/.pnpm/x@1", "node_modules/x", "#pnpm-ls"]]);
  rmSync(t, { recursive: true, force: true });
  // playing: each step in its own one-shot Workspace (mount, exec, listing, Commit, unmount); a failing build stops
  const calls = [];
  const kind = (c) => (c.startsWith("test -d /pnpm-store") ? "store?" : c.startsWith("./node_modules/.bin/tsc") ? "build" : c.startsWith("node -e") ? "list" : c.includes("pnpm install") ? "install" : c);
  const fake = (store) => ({ label: () => {}, tally: { calls: 0 }, lf: { sandbox: {
    mount: async () => { calls.push("mount"); return "/workspaces/1"; }, unmount: async () => { calls.push("unmount"); },
    exec: async (sb, ws, c) => { calls.push(kind(c)); return { exitCode: kind(c) === "build" ? 2 : kind(c) === "store?" && !store ? 1 : 0, stdout: "" }; },
    commit: async () => { calls.push("commit"); return { kind: "Committed" }; } } } });
  const deps = { sb: 1, branch: "r015-main-3", expectCall: (r, l, w) => w(), Mismatch: class extends Error {} };
  await assert.rejects(playClosure(fake(true), 15, steps.slice(0, 2), deps), (e) => /r015\.build exited 2/.test(e.message)
    // a stop inside the closure keeps the steps played so far, so their Commits count (r019 a1: F1 counted one fewer)
    && e.closureRows.map((r) => [r.kind, r.commit ?? null]).join() === [[steps[0].kind, "Committed"], ["build", null]].join());
  assert.deepEqual(calls, ["mount", "store?", "install", "pwd", "list", "commit", "unmount", "mount", "build", "unmount"]);
  calls.length = 0;
  await assert.rejects(playClosure(fake(false), 15, steps.slice(0, 1), deps), /no pnpm store at \/pnpm-store/);
  assert.deepEqual(calls, ["mount", "store?", "unmount"], "no install without the store mount");
});

test("one-shot probe split (lead, after 013.a1): mount + unmount judged as before; the exec by its LayerFS share, its wall not scaled", async () => {
  const { oneshotSplit } = await import("../steps.mjs");
  const { probeSeries } = await import("../gates.mjs");
  const sql = (vm) => ({ writer: { statements: 1, vm_steps: vm }, readers: {} });
  const lines = [
    { method: "sandbox.mount", ms: 8, daemon: [{ sql: sql(100), timing: [{ name: "mount", ms: 7 }] }] },
    { method: "sandbox.exec", ms: 62.4, daemon: [{ sql: sql(0), timing: [{ name: "observe.before", ms: 0.004 }, { name: "observe.after", ms: 1.304 }], fuse: { getattr: 0, served: 0 } }] },
    { method: "sandbox.unmount", ms: 6.25, daemon: [{ sql: sql(30), fuse: { getattr: 1, served: 1 } }] },
  ];
  const s = oneshotSplit(lines);
  assert.equal(s.oneshot_mount_unmount.ms, 14.25);
  assert.equal(s.oneshot_mount_unmount.counters.vm_steps, 130, "the mount's and unmount's counters, as before");
  assert.deepEqual([s.oneshot_exec.ms, s.oneshot_exec.wallMs, s.oneshot_exec.fuseRequests, s.oneshot_exec.untimed], [1.308, 62.4, 0, undefined], "the launch (62 ms) is the Sandbox's; LayerFS's share is its spans");
  assert.equal(oneshotSplit(lines.slice(0, 2)), null, "an incomplete sequence gives nothing");
  const noSpans = oneshotSplit([lines[0], { ...lines[1], daemon: [{ sql: sql(0) }] }, lines[2]]);
  assert.equal(noSpans.oneshot_exec.ms, null, "a daemon that traced no exec spans gives no point, never 0");
  const busy = oneshotSplit([lines[0], { ...lines[1], daemon: [{ ...lines[1].daemon[0], fuse: { getattr: 3, lookup: 1 } }] }, lines[2]]);
  assert.deepEqual([busy.oneshot_exec.fuseRequests, busy.oneshot_exec.untimed], [4, true]);
  // counts are cumulative per Workspace since the mount: the exec's own are its count less the mount's
  const since = oneshotSplit([{ ...lines[0], daemon: [{ fuse: { getattr: 35, served: 35 } }] }, { ...lines[1], daemon: [{ ...lines[1].daemon[0], fuse: { getattr: 35, served: 35 } }] }, lines[2]]);
  assert.deepEqual([since.oneshot_exec.fuseRequests, since.oneshot_exec.untimed], [0, undefined], "35 before the exec are not the exec's");
  const m = { range: 5, depth: { after: 10 }, probes: { oneshot_exec: busy.oneshot_exec } };
  assert.match(probeSeries("oneshot_exec", m, [m]).note, /4 FUSE request\(s\) during the exec, whose time is not traced/);
  // the unjudged exec says why in the Scaling row even when another probe is shown
  const { evaluate } = await import("../gates.mjs");
  const pts = [3, 4, 5].map((r) => ({ range: r, depth: { after: r * 10 }, binary: { daemon: "d" }, probes: { stat: { ms: r * r, input: { bytes: 1 } }, oneshot_exec: busy.oneshot_exec } }));
  const scaling = evaluate(pts[2], pts.slice(0, 2), null).checks.find((c) => c.name === "Scaling");
  assert.match(scaling.value, /also not judged: oneshot_exec: 4 FUSE request/, scaling.value);
  // a new name: the old series never shares a fit with the new ones
  const old = { range: 4, depth: { after: 8 }, probes: { oneshot_mount_exec: { ms: 50 } } };
  const now = { range: 5, depth: { after: 10 }, probes: { oneshot_mount_unmount: s.oneshot_mount_unmount } };
  assert.equal(probeSeries("oneshot_mount_unmount", now, [old, now]).pts.length, 1);
});

test("closure development checks (owner 2026-10-18): a clean reinstall of the unchanged lockfile, and the build again after a remount", async () => {
  const packages = new Set(["packages/a", "packages/b"]), tsconfigs = new Set(["packages/a"]);
  const steps = closureSteps({ packages, tsconfigs, changed: ["packages/a/src/x.ts"], installed: false, milestone: false, run: ["packages/a/t.spec.ts"], checks: true });
  assert.deepEqual(steps.map((s) => s.kind), ["install", "reinstall-check", "build", "rebuild", "test"]);
  assert.match(steps[1].command, /find \. -name node_modules -type d -prune -exec rm -rf \{\} \+ && pnpm install --offline/);
  assert.equal(steps[3].command, "./node_modules/.bin/tsc -b --verbose 'packages/a'");
  assert.deepEqual(closureSteps({ packages, tsconfigs, changed: ["docs/x.md"], installed: true, milestone: false, checks: true }).map((s) => s.kind), [], "nothing installed or built: no checks");
  assert.deepEqual(closureSteps({ packages, tsconfigs, changed: ["packages/a/src/x.ts"], installed: false, milestone: false }).map((s) => s.kind), ["install", "build"], "measured runs carry no checks");
  // tsc -b --verbose: states only, the clock and the tree's folder dropped
  const fresh = "[10:01:02 AM] Projects in this build: \n    * packages/a/tsconfig.json\n\n[10:01:02 AM] Project 'packages/a/tsconfig.json' is up to date because newest input 'packages/a/src/x.ts' is older than output 'packages/a/dist/x.js'\n";
  assert.deepEqual(tscStates(fresh, "/workspaces/1"), ["packages/a/tsconfig.json up to date"]);
  assert.equal(nothingToBuild(tscStates(fresh)), true);
  const stale = "[10:01:02 AM] Project 'packages/a/tsconfig.json' is out of date because output 'packages/a/dist/x.js' is older than input 'packages/a/src/x.ts'\n\n[10:01:02 AM] Building project '/workspaces/1/packages/a/tsconfig.json'...\n";
  assert.deepEqual(tscStates(stale, "/workspaces/1"), ["packages/a/tsconfig.json built"]);
  assert.deepEqual(tscStates(stale.replaceAll("/workspaces/1", "/w"), "/w"), tscStates(stale, "/workspaces/1"), "the same states natively under /w");
  assert.equal(nothingToBuild(tscStates(stale, "/workspaces/1")), false);
  // without a terminal tsc writes "6:19:48 AM - Project ..." (dev352-p3e r015); no parsed state is not nothing to build
  const plain = "6:19:48 AM - Projects in this build: \n    * packages/a/tsconfig.json\n\n6:19:48 AM - Project 'packages/a/tsconfig.json' is up to date because newest input 'packages/a/src/index.ts' is older than output 'packages/a/lib/tsconfig.tsbuildinfo'\n";
  assert.deepEqual(tscStates(plain, "/workspaces/1"), ["packages/a/tsconfig.json up to date"]);
  assert.equal(nothingToBuild(tscStates("no tsc lines")), false);
  // playing the rebuild row: its states from the output, in its own one-shot Workspace with its own Commit
  const fake = { label: () => {}, lf: { sandbox: { mount: async () => "/workspaces/1", unmount: async () => {},
    exec: async (sb, ws, c) => ({ exitCode: 0, stdout: c === "pwd" ? "/workspaces/1\n" : c.includes("--verbose") ? stale : "" }),
    commit: async () => ({ kind: "Committed" }) } } };
  const rows = await playClosure(fake, 12, [steps[3]], { sb: 1, branch: "b", expectCall: (r, l, w) => w(), Mismatch: class extends Error {} });
  assert.deepEqual([rows[0].kind, rows[0].states, rows[0].nothingToBuild, rows[0].commit], ["rebuild", ["packages/a/tsconfig.json built"], false, "Committed"]);
});

test("P3 removals take the file only (dev352-p3k r016): a folder may hold untracked closure output", () => {
  const tree = new Tree(new Map([["a/b/c.txt", { mode: "100644", blob: "x" }], ["d.txt", { mode: "100644", blob: "y" }]]));
  assert.equal(route([{ op: "rm", path: "a/b/c.txt" }], tree.clone ? tree.clone() : new Tree(new Map([["a/b/c.txt", { mode: "100644", blob: "x" }], ["d.txt", { mode: "100644", blob: "y" }]])), { all: true }).sandbox[0].target, "a", "P2: the highest folder it empties");
  assert.equal(route([{ op: "rm", path: "a/b/c.txt" }], tree, { all: true, untracked: true }).sandbox[0].target, "a/b/c.txt", "P3: the file only, as git does");
});

test("/.lww from every .gitignore (owner S4): nested patterns prefixed, deeper rules last; the lww.rs matcher port", async () => {
  const { generateLww, gitignores, lwwMatch, parseRules, prefixed } = await import("../lww.mjs");
  assert.deepEqual(gitignores(["a/b/.gitignore", ".gitignore", "z/.gitignore", "a/.gitignore", "x.txt"]), [".gitignore", "a/.gitignore", "z/.gitignore", "a/b/.gitignore"]);
  assert.equal(prefixed("pkg", "dist"), "pkg/**/dist");
  assert.equal(prefixed("pkg", "/build/"), "pkg/build/");
  assert.equal(prefixed("pkg", "a/b"), "pkg/a/b");
  assert.equal(prefixed("pkg", "!keep.log"), "!pkg/**/keep.log");
  assert.equal(prefixed("pkg", "*.log"), "pkg/**/*.log");
  const { text, sources } = generateLww(new Map([[".gitignore", "# c\nnode_modules/\nlib/\n*.tsbuildinfo\nexamples/*/*.jsonl\n\n"], ["pkg/.gitignore", "out/\n!out/keep.txt\n/root-only\n"]]));
  assert.equal(text.includes("%include"), false, "inline, no %include (F-039)");
  assert.deepEqual(sources, { ".gitignore": 4, "pkg/.gitignore": 3 });
  const rules = parseRules(text);
  const hit = (p) => !!lwwMatch(rules, p);
  assert.ok(hit("node_modules/.pnpm/x/index.js") && hit("packages/a/node_modules/.bin/tsc"), "unanchored node_modules/ at any depth, with everything under it");
  assert.ok(hit("packages/a/lib/index.js") && hit("packages/a/tsconfig.tsbuildinfo"));
  assert.ok(hit("examples/demo/run.jsonl") && !hit("examples/demo/sub/run.jsonl") && !hit("x/examples/demo/run.jsonl"), "anchored glob");
  assert.ok(hit("pkg/out/a.js") && hit("pkg/deep/out/a.js"));
  assert.equal(hit("pkg/out/keep.txt"), false, "lww.rs: the last matching rule decides, so a negation re-includes a file under a matched folder (git would keep it ignored); the check-ignore proof reports such paths");
  assert.ok(hit("pkg/root-only") && !hit("pkg/x/root-only"));
  assert.ok(!hit("packages/a/src/index.ts") && !hit("pnpm-lock.yaml") && !hit("pkg/src/out.ts"));
});

test("F-031 Q1: `!/.git` is the last /.lww rule, so no .git path matches whatever a .gitignore lists", async () => {
  const { generateLww, GIT_PROBES, LWW_GIT_RULE, lwwMatch, parseRules } = await import("../lww.mjs");
  const { text } = generateLww(new Map([[".gitignore", "node_modules/\nindex\n*.pack\nlogs/\nHEAD\n"], ["a/.gitignore", "*\n"]]));
  assert.equal(text.trim().split("\n").at(-1), LWW_GIT_RULE);
  const rules = parseRules(text);
  assert.deepEqual(GIT_PROBES.filter((p) => lwwMatch(rules, p)), []);
  assert.ok(lwwMatch(rules, "x/index") && lwwMatch(rules, "node_modules/.pnpm/a/index.js"), "the rules still decide everything else");
});

test("F-031 A4 lane guard: .git paths from the lead's base, scanned from the cursor /.git in either order; a violation stops", async () => {
  const { laneGuard } = await import("../gitplay.mjs");
  const pages = (items, size = 2) => { const out = []; for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size)); return out; };
  const fake = (items) => {
    const calls = [];
    const ps = pages(items.map((p) => ({ path: p })));
    return { calls, run: { label() {}, lf: { branch: { diff_branches: async (from, to, n, pos, o) => { calls.push(o.cursor); const i = o.cursor === "/.git" ? 0 : Number(o.cursor.split("#")[1]); return { items: ps[i] ?? [], hasMore: i + 1 < ps.length, nextCursor: `c#${i + 1}` }; } } } } };
  };
  const ok = ["/.git/objects/ab", "/.git/objects/ab/" + "c".repeat(38), "/.git/refs/heads/lanes/L1", "/.git/worktrees/L1/index"];
  for (const order of [[...ok, "/.gitignore", "/x/a.ts", "/y"], ["/.git-x", ...ok, "/a"]]) {
    const ctx = { lead: "r015-main", git: { guard: [] } }, f = fake(order);
    await laneGuard(f.run, 15, ctx, "L1");
    assert.deepEqual([ctx.git.guard[0].paths, ctx.git.guard[0].violations], [4, []]);
    assert.ok(f.calls.length <= 3, "stops once past .git");
  }
  const ctx = { lead: "r015-main", git: { guard: [] } };
  await assert.rejects(laneGuard(fake([...ok, "/.git/index", "/.git/worktrees/L2/index"]).run, 15, ctx, "L1"), /2 \.git path\(s\) outside/);
  assert.deepEqual(ctx.git.guard[0].violations, [".git/index", ".git/worktrees/L2/index"]);
});

test("DEFER D-6 (#355): merge errors from the trace; untraced values named, never estimated", async () => {
  const { d6Triggers, d6Text } = await import("../gates.mjs");
  const lines = [{ method: "branch.merge", phase: "end", ok: true, kind: "Merged" }, { method: "branch.merge", phase: "end", ok: false, kind: "Busy" }, { method: "branch.merge", phase: "start" }];
  const d = d6Triggers(lines);
  assert.deepEqual(d, { merges: 2, candidatesMax: null, publishHoldMaxMs: null, mergeErrors: 1 });
  assert.match(d6Text(d), /^D-6 triggers \(\*\*TRIPPED\*\*\): max candidate paths in a merge not traced \(needs .*merge\.paths.*\) \(trips > 50,000\) · max lane hold of the merge at publish not traced \(needs .*publish\.lane.*\) \(trips > 500 ms\) · Capacity\/ObjectLimitExceeded\/Busy from 2 merges: 1 \(trips at 1\)$/);
  assert.match(d6Text(d6Triggers(lines.slice(0, 1))), /^D-6 triggers \(none\)/);
  assert.equal(d6Text(null), "D-6 triggers: not recorded for this attempt");
});

test("vitest results.json (lead interim yes, 2026-10-18): order sorted and durations <t>, counted; any other field exact", () => {
  const dir = mkdtempSync(join(tmpdir(), "lfs352-vt-")), f = join(dir, "node_modules/.vite/vitest/h/results.json");
  mkdirSync(join(dir, "node_modules/.vite/vitest/h"), { recursive: true });
  const list = (results) => { writeFileSync(f, JSON.stringify({ version: "4.1.8", results })); return parseLister(execFileSync("sh", ["-c", listerCommand([])], { cwd: dir, encoding: "utf8" })); };
  try {
    const a = list([[":b.spec.ts", { duration: 72.7, failed: false }], [":a.spec.ts", { duration: 5, failed: false }]]);
    const b = list([[":a.spec.ts", { duration: 9.1, failed: false }], [":b.spec.ts", { duration: 1, failed: false }]]);
    const g = (x) => x.groups.find((y) => y.g === "node_modules/.vite").digest;
    assert.equal(g(a), g(b));
    assert.deepEqual(a.normalized.vitest, { files: 1, entries: 2, reordered: 1, durations: 2, unparsed: 0 });
    assert.equal(b.normalized.vitest.reordered, 0);
    assert.notEqual(g(list([[":a.spec.ts", { duration: 9.1, failed: true }], [":b.spec.ts", { duration: 1, failed: false }]])), g(a), "a failed flag stays exact");
    assert.notEqual(g(list([[":a.spec.ts", { duration: 9.1, failed: false }]])), g(a), "the set of spec paths stays exact");
    writeFileSync(f, "not json");
    assert.equal(parseLister(execFileSync("sh", ["-c", listerCommand([])], { cwd: dir, encoding: "utf8" })).normalized.vitest.unparsed, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("F-031 option (c): seed pack, lane commits with their own index and ref, the lead writes dsh's ids exactly", async () => {
  const g = await import("../gitlanes.mjs");
  const dir = mkdtempSync(join(tmpdir(), "lfs352-git-")), src = join(dir, "src"), bin = join(dir, "bin");
  // the scripts run in the Debian image (GNU date, sha1sum); on a macOS host two shims stand in
  mkdirSync(bin);
  writeFileSync(join(bin, "date"), '#!/bin/sh\nif [ "$1" = "+%s%N" ]; then node -e "process.stdout.write(String(BigInt(Date.now())*1000000n))"; echo; else exec /bin/date "$@"; fi\n', { mode: 0o755 });
  writeFileSync(join(bin, "sha1sum"), '#!/bin/sh\nexec shasum "$@"\n', { mode: 0o755 });
  const sh = (cwd, cmd, env = {}) => execFileSync("sh", ["-c", cmd], { cwd, encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", ...env } });
  const at = (n) => ({ GIT_AUTHOR_NAME: "A", GIT_AUTHOR_EMAIL: "a@x", GIT_COMMITTER_NAME: "C", GIT_COMMITTER_EMAIL: "c@x", GIT_AUTHOR_DATE: `${1700000000 + n} +0000`, GIT_COMMITTER_DATE: `${1700000000 + n} +0000` });
  try {
    mkdirSync(src);
    sh(src, "git init -q -b main . && mkdir d && echo a > a.txt && echo b > d/b.txt && git add . && git commit -q -m A", at(0));
    const A = sh(src, "git rev-parse HEAD").trim();
    sh(src, "echo a2 > a.txt && git commit -qam B && git checkout -q -b side " + A + " && echo c > c.txt && git rm -q d/b.txt && git add c.txt && git commit -qm C", at(1));
    sh(src, "git checkout -q main && git merge -q --no-ff -m M side; echo resolved > a.txt; git commit -qam M2", at(2));
    const head = sh(src, "git rev-parse HEAD").trim();
    // seed: a fresh .git from the seed ops holds exactly A
    const { ops, facts } = g.seedOps(join(src, ".git"), A), wt = join(dir, "wt");
    for (const o of ops) { if (o.op === "mkdir") mkdirSync(join(wt, o.path), { recursive: true }); else writeFileSync(join(wt, o.path), o.bytes); }
    assert.equal(facts.commits, 1);
    sh(wt, `git -C ${src} archive ${A} | tar -x`);
    assert.equal(g.marks(sh(wt, g.seedScript(A, 1))).statusLines, 0);
    // a lane step (Q3, porcelain): status, diff, git add, git rm --cached, git commit in the lane's linked worktree
    const before = readFileSync(join(wt, ".git/index"));
    sh(dir, "sleep 1; touch marker");
    writeFileSync(join(wt, "a.txt"), "a2\n"); rmSync(join(wt, "d/b.txt"));
    const cmds = g.laneCommands({ lane: "L1", add: ["a.txt"], remove: ["d/b.txt"], message: "r016.s0010", date: "1700000001 +0000" }, join(dir, "scratch"));
    // the add hashes its paths again whatever their stat data says (f031-r1-slice-g r015.s0013)
    assert.match(cmds.at(-1), /git add -f --pathspec-from-file=\S+ --pathspec-file-nul && git add --renormalize --pathspec-from-file=/);
    let out = ""; for (const c of cmds) out = sh(wt, c);
    const m = g.marks(out);
    assert.equal(sh(wt, "git rev-parse refs/heads/lanes/L1").trim(), m.commit);
    assert.equal(sh(wt, "git rev-parse refs/heads/lanes/L1^").trim(), A, "the first lane commit's parent is the range base (HEAD)");
    assert.equal(sh(wt, `git ls-tree -r --name-only ${m.commit}`).trim(), "a.txt");
    assert.equal(sh(wt, "git rev-parse HEAD").trim(), A, "the shared HEAD and main stay at the base");
    assert.ok(readFileSync(join(wt, ".git/index")).equals(before), "a lane never rewrites the shared index");
    assert.equal(readFileSync(join(wt, ".git/worktrees/L1/HEAD"), "utf8"), "ref: refs/heads/lanes/L1\n");
    assert.ok(m.statusLines === 2 && m.diffLines > 0 && m.setupMs != null && m.addMs != null && m.rmMs != null && m.commitMs != null, JSON.stringify(m));
    assert.equal(m.tree, sh(wt, `git rev-parse ${m.commit}^{tree}`).trim());
    // a second step on the lane: no setup, the commit's parent is the lane's first
    writeFileSync(join(wt, "a.txt"), "a3\n");
    out = ""; for (const c of g.laneCommands({ lane: "L1", add: ["a.txt"], remove: [], message: "r016.s0011", date: "1700000002 +0000" }, join(dir, "scratch"))) out = sh(wt, c);
    const m2 = g.marks(out);
    assert.ok(m2.setupMs == null && m2.statusLines === 1);
    assert.equal(sh(wt, "git rev-parse refs/heads/lanes/L1^").trim(), m.commit);
    writeFileSync(join(wt, "a.txt"), "a2\n");
    // the lane guard's allowed set: exactly what the lane wrote (A4)
    // folders too: one gains an entry when the lane adds a loose object or its ref (f031-slice-b r015: .git/objects, .git/refs/heads)
    const wrote = sh(wt, "find .git -newer ../marker | sort").trim().split("\n").filter((p) => !/^\.git\/objects\/pack\//.test(p));
    const ok = g.laneAllowed("L1");
    assert.deepEqual(wrote.filter((p) => !ok.test(p)), [], "every file a lane exec writes is in its allowed set");
    for (const p of [".git/index", ".git/HEAD", ".git/refs/heads/main", ".git/worktrees/L2/index", ".git/refs/heads/lanes/L2", ".git/worktrees/L1/ORIG_HEAD", ".git/packed-refs", ".git/refs/tags", ".git/worktrees/L2", ".git/objects/info", ".git/refs/heads/lanes/L2/x"]) assert.equal(ok.test(p), false, p);
    // the lead: every commit after A from the job, blobs no step wrote unpacked from the pack, ids equal
    const job = g.leadJob(join(src, ".git"), A, head, new Set());
    assert.deepEqual([job.commits.length, job.commits.filter((c) => c.parents.length > 1).length], [4, 1]);
    assert.ok(job.missing.blobs >= 2 && job.pack.length > 0);
    writeFileSync(join(dir, "missing.pack"), job.pack); writeFileSync(join(dir, "job.json.gz"), g.jobBytes(job.commits));
    sh(wt, `git unpack-objects -q < ${join(dir, "missing.pack")}`);
    const w = g.marks(sh(wt, `node -e '${g.LEAD_WRITER.replaceAll("'", "'\\''")}' ${join(dir, "job.json.gz")} ${join(dir, "lead.index")} 0 60000`));
    assert.equal(w.next, 4);
    sh(wt, `git -C ${src} archive ${head} | tar -x`);
    const fin = g.marks(sh(wt, g.finishScript({ checkpoint: head, prev: A, count: 4 }).replace(`rm -rf ${g.JOB_DIR}\n`, "") + "\n"));
    assert.deepEqual([fin.head, fin.count, fin.refsLeft, fin.laneRefs, fin.looseAfter, fin.worktrees], [head, 4, 0, 1, 0, 1]);
    assert.ok(fin.lane_commit === 2, "the lane commits are packed and counted apart");
    assert.ok(!existsSync(join(wt, ".git/worktrees")), "the finish removes the lane worktree folders");
    assert.ok(g.GIT_ALLOWED.test(".git/objects/pack/pack-" + "0".repeat(40) + ".idx") && !g.GIT_ALLOWED.test(".git/ORIG_HEAD") && !g.GIT_ALLOWED.test(".git/lanes/L1/index"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a range in two commands (halves.mjs): the context round-trips; a resume is refused off its range or under other binaries; bare flags", async () => {
  const h = await import("../halves.mjs");
  const { options } = await import("../run.mjs");
  const { Tree } = await import("../steps.mjs");
  const base = new Map([["a.txt", { mode: "100644", blob: "b1" }], ["d/x.txt", { mode: "100644", blob: "b2" }]]);
  const lane = new Tree(base); lane.set("d/y.txt", { mode: "100755", blob: "b3" }); lane.delete("a.txt");
  const ctx = { untracked: true, base, p2: { built: "from the plan" }, trees: new Map([["L1", lane]]), held: new Map(), events: [{ kind: "decoy" }], measured: false,
    work: { fs: 3, sandbox: 1, commits: 4 }, lead: "r015-main", leadSteps: [{ op: "fork" }], merged: new Map(), tries: new Map(), published: new Set(["L0"]), played: new Map([["a01", { fs: 2 }]]),
    steps: new Map([["a01", 2]]), lww: { picks: [] }, checkpoint: "c", git: { dates: new Map([["c", "1 +0000"]]), locks: new Map([["L1", Promise.resolve()]]), lane: { execs: 2 }, seed: { commits: 9 } } };
  const back = h.ctxFromJson(JSON.parse(JSON.stringify(h.ctxToJson(ctx))), (b) => ({ rebuilt: b.size }));
  assert.deepEqual([...back.trees.get("L1").files], [...lane.files]);
  assert.ok(back.trees.get("L1").isDir("d") && !back.trees.get("L1").has("a.txt"));
  assert.deepEqual([back.p2, back.base.size, [...back.published], back.played.get("a01"), back.steps.get("a01"), back.git.dates.get("c"), back.git.lane, back.work], [{ rebuilt: 2 }, 2, ["L0"], { fs: 2 }, 2, "1 +0000", { execs: 2 }, ctx.work]);
  assert.equal(back.git.locks.size, 0);
  assert.throws(() => h.ctxToJson({ ...ctx, held: new Map([["x", {}]]) }), /held Workspaces/);
  // a saved half is checked: the run must stand halfway at that range, and the binaries must be the pinned ones
  const dir = mkdtempSync(join(tmpdir(), "lfs352-half-")), daemon = join(dir, "daemon"), native = join(dir, "native.node");
  writeFileSync(daemon, "d1"); writeFileSync(native, "n1");
  const run = { dir, manifest: { run: "t", env: { LAYERFS_DAEMON: daemon, LAYERFS_NATIVE: native, LAYERFS_SDK_JS: dir, LAYERFS_IMAGE: "layerfs-issue352-no-such-image" } }, state: { halfway: 15 }, sink: { seq: 3, log: [{ seq: 1 }] }, tally: { calls: 3 } };
  try {
    h.saveHalf(run, 15, { ctx, attempt: 0, wall: { playMs: 5 }, elapsedMs: 9 });
    const got = h.loadHalf(run, 15);
    assert.deepEqual([got.attempt, got.calls, got.sink.log.length, got.wall.playMs], [0, 3, 1, 5]);
    assert.match(h.loadHalf({ ...run, state: { halfway: null } }, 15).refused, /not halfway through range 15/);
    assert.match(h.loadHalf(run, 16).refused, /not halfway through range 16/);
    writeFileSync(daemon, "d2");
    assert.match(h.loadHalf(run, 15).refused, /binaries differ from the first half's: daemon/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  assert.deepEqual(options(["--run", "x", "--resume", "--mode", "fast"]), { _: [], run: "x", resume: true, mode: "fast" });
  assert.deepEqual(options(["--until", "lanes", "--on"]), { _: [], until: "lanes", on: true });
});

test("devcheck (lead 2026-10-18, 120 s rule): dev checks after the publish; the verdicts; a native rerun equal to ours passes", async () => {
  const { devSteps } = await import("../devcheck.mjs");
  const { judgeDevChecks } = await import("../closure.mjs");
  const ds = devSteps({ steps: ["incremental-install", "build", "test"], rows: [{ kind: "build", packages: ["packages/a"] }] });
  assert.deepEqual(ds.map((x) => x.kind), ["reinstall-check", "rebuild"]);
  assert.match(ds[0].command, /find \. -name node_modules -type d -prune -exec rm -rf \{\} \+ && pnpm install --offline/);
  assert.equal(ds[1].command, "./node_modules/.bin/tsc -b --verbose 'packages/a'");
  assert.deepEqual(devSteps({ steps: ["test"], rows: [] }), [], "nothing installed or built: no checks");
  const M = class extends Error {};
  const groups = [{ g: "node_modules/x", digest: "d" }];
  const ok = judgeDevChecks(16, [{ kind: "reinstall-check", ms: 5, groups, commit: "Committed" }, { kind: "rebuild", ms: 1, states: ["p up to date"], nothingToBuild: true }], { cleanOracle: { groups }, Mismatch: M });
  assert.deepEqual([ok.reinstallCheck.oracleOk, ok.rebuild.nothingToBuild], [true, true]);
  assert.throws(() => judgeDevChecks(16, [{ kind: "reinstall-check", groups: [] }], { cleanOracle: { groups }, Mismatch: M }), /clean reinstall differs/);
  const built = [{ kind: "rebuild", states: ["p built"], nothingToBuild: false, packages: ["p"] }];
  assert.equal(judgeDevChecks(16, built, { Mismatch: M, nativeRun: () => ({ states: ["p built"] }) }).rebuild.native[0], "p built", "equal to native passes (firstDifference returns \"none\")");
  assert.throws(() => judgeDevChecks(16, built, { Mismatch: M, nativeRun: () => ({ states: ["p up to date"] }) }), /differs from native/);
  assert.throws(() => judgeDevChecks(16, built, { Mismatch: M }), /no native rerun/);
});

test("reinstall gate (lead decision): changed lockfile packages and links, stored ÷ raw changed; none changed is judged absolutely", () => {
  const prev = `lockfileVersion: '9.0'

importers:

  .:
    devDependencies:
      vitest:
        specifier: ^4
        version: 4.1.7
  packages/a:
    dependencies:
      '@x/b':
        specifier: workspace:*
        version: link:../b

packages:

  '@scope/p@1.0.0':
    resolution: {integrity: sha512-AAA}

  vitest@4.1.7:
    resolution: {integrity: sha512-BBB}

snapshots:
`;
  const next = prev.replace("sha512-AAA", "sha512-CCC").replace("vitest@4.1.7:\n", "vitest@4.1.8:\n").replace("link:../b", "link:../c");
  const ch = changedPackages(prev, next);
  assert.deepEqual([ch.packages, ch.links, ch.count], [["@scope/p@1.0.0", "vitest@4.1.8"], [{ importer: "packages/a", dep: "@x/b" }], 3]);
  assert.equal(changedPackages(prev, prev).count, 0);
  const groups = [{ g: "node_modules/.pnpm/@scope+p@1.0.0", bytes: 1000 }, { g: "node_modules/.pnpm/vitest@4.1.8_peer", bytes: 5000 }, { g: "node_modules/.pnpm/vitest@4.1.7", bytes: 9999 },
    { g: "packages/a/node_modules/@x/b", bytes: 7 }, { g: "node_modules/vitest", bytes: 40 }];
  assert.equal(rawChangedBytes(ch, groups), 6007, "a link counts its link entry only");
  const gate = (r) => reinstallGate(r);
  // ratio mode (raw change of 1 MiB or more): the bands are unchanged
  const raw = 6007 * 1000;
  assert.deepEqual(gate({ changedPackages: 3, rawChangedBytes: raw, storedNewBytes: 9000 * 1000 }), { value: `1.498× the raw bytes of 3 changed packages (ratio: 9000000 new stored for ${raw} raw)`, result: "pass", mode: "ratio" });
  assert.equal(gate({ changedPackages: 3, rawChangedBytes: raw, storedNewBytes: 18000 * 1000 }).result, "watch");
  assert.equal(gate({ changedPackages: 3, rawChangedBytes: raw, storedNewBytes: 31000 * 1000 }).result, "optimize", "a large reinstall over 2× raw still trips by its ratio");
  // owner 2026-10-19 ("proceed with the fix"): raw change under 1 MiB (link-only or tiny) is judged by absolute stored bytes
  const rec = { r015: { changedPackages: 152, rawChangedBytes: 17280470, storedNewBytes: 646831 }, r016: { changedPackages: 101, rawChangedBytes: 5953866, storedNewBytes: 633581 }, r017: { changedPackages: 55, rawChangedBytes: 75810, storedNewBytes: 638855 } };
  assert.deepEqual(Object.values(rec).map((r) => [gate(r).mode, gate(r).result]), [["ratio", "pass"], ["ratio", "pass"], ["absolute", "pass"]], "the recorded r015-r017 relinks pass");
  assert.match(gate(rec.r017).value, /^absolute: 638855 new stored bytes for 75810 raw changed bytes of 55 changed packages \(8\.427×; raw under 1 MiB\)$/);
  assert.deepEqual([gate({ changedPackages: 4, rawChangedBytes: 1870, storedNewBytes: 646831 }).result, gate({ changedPackages: 4, rawChangedBytes: 1870, storedNewBytes: 646831 }).mode], ["pass", "absolute"]);
  assert.equal(gate({ changedPackages: 11, rawChangedBytes: 20000, storedNewBytes: 3 * 2 ** 20 }).result, "watch", "a tiny-raw relink storing 3 MiB trips");
  assert.equal(gate({ changedPackages: 11, rawChangedBytes: 20000, storedNewBytes: 17 * 2 ** 20 }).result, "optimize");
  assert.deepEqual([0.5, 2, 17].map((mib) => gate({ changedPackages: 0, rawChangedBytes: 0, storedNewBytes: mib * 2 ** 20 }).result), ["pass", "watch", "optimize"]);
  assert.equal(gate(null).result, "pass");
  assert.equal(gate({ changedPackages: 2, rawChangedBytes: 10, storedNewBytes: null }).result, "watch");
});

test("disk projection: the study model's estimate beside the guard's floor", () => {
  const ranges = Array.from({ length: 202 }, (_, r) => ({ range: r, lfsCommits: 402 }));
  const m = diskModel({ storeBytes: 100 * 2 ** 20, k: 14, perCommitBytes: 5000, ranges });
  // 187 ranges left, each 400 + 2 Commits at the study's 9.0 KB after the first install
  assert.equal(m.commitsLeft, 187 * 402);
  assert.equal(m.commitBytes, Math.round(187 * 402 * 9216));
  assert.equal(Math.round(m.installBytes / 2 ** 20), 1159, "the study's expected installs, all bands");
  assert.equal(Math.round(m.buildBytes / 2 ** 20), 120);
  const later = diskModel({ storeBytes: 0, k: 100, perCommitBytes: 7000, ranges });
  assert.equal(later.commitBytes, 101 * 402 * 7000, "after range 15 the run's measured cost");
  assert.equal(Math.round(later.installBytes / 2 ** 20), 290 + 370);
  const floor = diskGuard({ storeBytes: 0, growthBytes: 2 ** 20, dockerFree: 2 ** 40, hostFree: 2 ** 40, rangesLeft: 10 });
  assert.equal(floor.projected, 10 * 256 * 2 ** 20, "the guard keeps its 256 MiB floor");
});

test("study §8 measurements: storage by the step's Commit, content and metadata from its traced sizes", () => {
  const prevGroups = [{ g: "node_modules/.pnpm/a@1", n: 3, digest: "x" }, { g: "node_modules/.pnpm/b@1", n: 2, digest: "y" }];
  const groups = [{ g: "node_modules/.pnpm/a@1", n: 3, digest: "x" }, { g: "node_modules/.pnpm/b@1", n: 2, digest: "z" }, { g: "node_modules/.pnpm/c@2", n: 4, digest: "w" }];
  const m = studyMeasurements({
    fsWrites: [{ sizes: { newStored: 5000, newMetadata: 3000 } }, { sizes: { newStored: 7000, newMetadata: 4000 } }, { sizes: { newStored: 9000, newMetadata: 5000 } }],
    install: { sizes: { newStored: 1000, newMetadata: 400 }, delta: { share: 0.4 }, prevGroups, groups, changed: { packages: ["c@2"], links: [] } },
    build: { sizes: { newStored: 300, newMetadata: 100 }, bytes: buildBytes("10 packages/a/dist/x.js\n5 packages/a/tsconfig.tsbuildinfo\n7 packages/b/dist/y.js\n", ["packages/a", "packages/b"]) },
  });
  assert.deepEqual(m.fsWriteCommit, { n: 3, storedP50: 7000, contentP50: 3000, metadataP50: 4000 });
  assert.deepEqual([m.install.newPaths, m.install.newPackageFolders, m.install.content, m.install.metadata, m.relink], [4, 1, 600, 400, { rewrittenFolders: 1, unchangedPackageFolders: 1 }]);
  assert.equal(m.metadataPerPath.perNewPath, 100);
  assert.deepEqual(m.build, { stored: 300, perPackage: { "packages/a": 15, "packages/b": 7 }, content: 200, metadata: 100 });
  assert.match(buildListCommand(["packages/a"]), /^find 'packages\/a' -path '\*\/node_modules' -prune -o/);
});

test("uncontended vs contended (SPEC §5): overlap with a Commit or merge classes a call; Speed judges the uncontended series; contended work growth trips", () => {
  const at = (ms) => new Date(Date.UTC(2026, 9, 18, 0, 0, 0, ms)).toISOString();
  const lines = markContention([
    { method: "sandbox.commit", start: at(0), ms: 100 },
    { method: "fs.read", start: at(50), ms: 10 },           // inside the Commit
    { method: "fs.read", start: at(200), ms: 10 },          // alone
    { method: "fs.write", start: at(300), ms: 20, commit: "c1" },
    { method: "fs.stat", start: at(310), ms: 5 },           // inside an fs Commit
    { method: "branch.merge", start: at(400), ms: 50 },
    { method: "fs.list", start: at(440), ms: 30 },          // overlaps the merge's end by 10 ms
    { method: "fs.list", start: at(449), ms: 30 },          // within the 1 ms start resolution of its end: no overlap
  ]);
  assert.deepEqual(lines.map((l) => l.contention), ["uncontended", "contended", "uncontended", "uncontended", "contended", "uncontended", "contended", "uncontended"]);
  const rows = aggregate(lines.map((l) => callOf(l)));
  assert.ok(rows.some((r) => r.op === "fs.read" && r.sizeClass === "— · contended" && r.series === "contended"));
  assert.ok(rows.some((r) => r.op === "branch.merge" && r.n === 1), "merges stay in the series");
  // a contended-only slowdown never trips Speed
  const ops = (contendedMs) => [{ op: "fs.read", sizeClass: "≤8 KiB · uncontended", series: "uncontended", n: 20, p50: 4, p95: 6 }, { op: "fs.read", sizeClass: "≤8 KiB · contended", series: "contended", n: 20, p50: contendedMs, p95: contendedMs * 2 }];
  const b = buildBaseline([2, 3, 4].map((range) => ({ range, binary: { daemon: "d" }, ops: ops(5) })));
  const speed = evaluate({ range: 10, binary: { daemon: "d" }, checks: {}, ops: ops(500) }, [], b).checks.find((c) => c.name === "Speed");
  assert.equal(speed.result, "pass", speed.value);
  assert.match(speed.value, /· uncontended: 1× baseline/);
  // merge cost rising with tree size in the contended series trips; flat work does not
  const mk = (i, steps) => ({ range: 5 + i, binary: { daemon: "d" }, checks: {}, inputs: { tree: { files: 1000 * (i + 1) } },
    ops: [{ op: "branch.merge", sizeClass: ">64 entries · Merged · contended", series: "contended", n: 5, p50: 9000, p95: 9000, sql: { vm_steps: steps(i) } }] });
  const cw = (steps) => { const xs = [0, 1, 2, 3].map((i) => mk(i, steps)); return evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === "Contended work"); };
  assert.equal(cw((i) => 5000 * (i + 1)).result, "optimize");
  assert.equal(cw(() => 5000).result, "pass");
  const narrow = [0, 1, 2].map((i) => ({ ...mk(i, (j) => 5000 * (j + 1)), inputs: { tree: { files: 1000 + 30 * i } } }));
  assert.match(evaluate(narrow.at(-1), narrow.slice(0, -1)).checks.find((c) => c.name === "Contended work").value, /too narrow/, "a fit over a few percent of growth is not judged");
});

test("fix 067 (owner yes, 2026-10-20): Contended work reads the call's own SQL (sql.call) when traced, else process-wide", () => {
  // a contended call whose session work doubles with overlap while its own work stays flat (fix 057's r30 probe shape)
  const line = (own, session) => ({ method: "fs.rm", ms: 14, ok: true, daemon: [{ sql: { writer: { statements: session, vm_steps: session * 75 }, readers: { statements: 0, vm_steps: 0 }, call: { statements: own, vm_steps: own * 75 } } }] });
  assert.deepEqual(callOf(line(191, 377)).sqlCall, { statements: 191, vm_steps: 14325, fullscan_steps: 0 });
  assert.equal(callOf({ method: "fs.rm", ms: 1, daemon: [{ sql: { writer: { vm_steps: 5 } } }] }).sqlCall, undefined, "binaries before fix 057: no per-call counters");
  assert.equal(aggregate([callOf(line(191, 377)), callOf({ method: "fs.rm", ms: 1, daemon: [{ sql: { writer: { vm_steps: 5 } } }] })])[0].sqlCall, undefined, "a class is per-call only when every call is");
  const mk = (i, call) => ({ range: 51 + i, binary: { daemon: "d" }, checks: {}, inputs: { tree: { files: 1000 * (i + 1) } },
    ops: [{ op: "fs.rm", sizeClass: "1 files · contended", series: "contended", n: 9, p50: 14, p95: 20, sql: { vm_steps: 15000 * (i + 1) }, ...(call ? { sqlCall: { vm_steps: 14500 } } : {}) }] });
  const cw = (call) => { const xs = [0, 1, 2, 3].map((i) => mk(i, call)); return evaluate(xs.at(-1), xs.slice(0, -1)).checks.find((c) => c.name === "Contended work"); };
  // with sql.call the overlap no longer reads as growth; without it the old process-wide reading stands, labeled
  assert.equal(cw(true).result, "pass");
  assert.match(cw(true).value, /SQL VM steps per call \(sql\.call\) against tree files, exponent 0 over 4 ranges/);
  assert.equal(cw(false).result, "optimize");
  assert.match(cw(false).value, /process-wide \(writer \+ readers\)/);
  // per-call points never mix with earlier process-wide ones: three ranges without call and one with it is one point
  const mixed = [mk(0, false), mk(1, false), mk(2, false), mk(3, true)];
  assert.match(evaluate(mixed.at(-1), mixed.slice(0, -1)).checks.find((c) => c.name === "Contended work").value, /^not judged: .* with per-call SQL.*; SQL per call/);
});

test("P3 proof: untracked closure output is no extra; a tracked file under it is still compared", () => {
  const items = [{ path: "/src/a.ts", kind: "Modified" }, { path: "/node_modules/.pnpm/x@1/node_modules/x/i.js", kind: "Added" }, { path: "/packages/a/dist/i.js", kind: "Added" },
    { path: "/packages/a/tsconfig.tsbuildinfo", kind: "Added" }, { path: "/packages/b/dist/keep.js", kind: "Modified" }];
  const git = [{ path: "src/a.ts" }, { path: "packages/b/dist/keep.js" }];
  assert.equal(comparePaths(items, git, [".lfs-probe/"]).extra.length, 3, "P2: every untracked path is an extra");
  const p3 = comparePaths(items, git, [".lfs-probe/"], CLOSURE_OUTPUT);
  assert.deepEqual(comparePaths([{ path: "packages/a/lib/types/index.d.ts" }, { path: "packages/a/src/x.ts" }], [{ path: "packages/a/src/x.ts" }], [], CLOSURE_OUTPUT).extra, [], "dsh's tsc outDir lib/ is closure output (dev352-p3e r015)");
  assert.deepEqual([p3.ok, p3.extra, p3.missing], [true, [], []]);
  assert.equal(comparePaths(items, [...git, { path: "packages/c/dist/gone.js" }], [".lfs-probe/"], CLOSURE_OUTPUT).missing[0], "packages/c/dist/gone.js", "git's tracked output is still required");
});

test("storage revision (REPORT_FORMAT §3/§9): five parts sum to Store on disk; sources by Commit; shared never divided; the checks catch a broken sum", () => {
  const f = { pageSize: 4096, pages: 100, freePages: 2, packs: [{ domain: 0, n: 3, bytes: 60000 }, { domain: 1, n: 2, bytes: 50000 }],
    tables: [{ name: "pack", bytes: 200000, unused: 20000 }, { name: "object_location", bytes: 120000, unused: 10000 }, { name: "commit", bytes: 50000, unused: 5000 }] };
  const parts = sealedParts(f, 100 * 4096 + 4096);
  assert.deepEqual([parts.content, parts.metadata, parts.indexRows], [50000, 60000, 155000]);
  assert.equal(parts.waste, 35000 + 2 * 4096 + (180000 - 110000) + 4096);
  assert.equal(parts.content + parts.metadata + parts.indexRows + parts.waste + parts.other, parts.total);
  const lines = [{ method: "fs.write", step: "r015.s0001", sizes: { newStored: 3000, newMetadata: 1000 } }, { method: "sandbox.commit", step: "r015.install", sizes: { newStored: 9000, newMetadata: 4000 } },
    { method: "sandbox.commit", step: "r015.build", sizes: { newStored: 500, newMetadata: 100 } }, { method: "branch.merge", step: "r015.merge a", sizes: null }];
  const added = addedBySource(lines, stepSource(15));
  assert.deepEqual(added, { tracked: { content: 2000, metadata: 1000 }, nodeModules: { content: 5000, metadata: 4000 }, build: { content: 400, metadata: 100 }, git: { content: 0, metadata: 0 } });
  // P3 (REPORT_FORMAT §8): a lane's git commit and the lead's write of main are the `.git` source
  assert.deepEqual(addedBySource([{ method: "sandbox.commit", step: "r015.a01.git-commit", sizes: { newStored: 70, newMetadata: 20 } }, { method: "sandbox.commit", step: "r015.lead.git-main", sizes: { newStored: 30, newMetadata: 10 } }], stepSource(15)).git, { content: 70, metadata: 30 });
  const seed = seedBySource(parts, added);
  const bySource = cumulative(seed, added);
  const version = { bytes: 100000, tracked: { bytes: 60000 }, nodeModules: { bytes: 39000 }, build: { bytes: 1000 } };
  const st = storageFigures({ parts, prevParts: null, bySource, added, version, changed: { tracked: 4000, nodeModules: 20000, build: 1000 }, commits: 3 });
  assert.equal(st.unattributed, 0);
  assert.equal(st.sources.tracked.stored + st.sources.nodeModules.stored + st.sources.build.stored + st.shared.stored, parts.total, "sources + shared = Store on disk");
  assert.deepEqual(storageProblems(st, parts.total, version.bytes), []);
  assert.equal(st.sources.nodeModules.amplification, +(9000 / 39000).toFixed(3));
  assert.ok(storageProblems({ ...st, parts: { ...parts, waste: parts.waste + 1 } }, parts.total, version.bytes).some((x) => /parts sum/.test(x)));
  assert.ok(storageProblems(st, parts.total, version.bytes + 5).some((x) => /latest versions sum/.test(x)));
  const live = liveParts(parts, { content: 100, metadata: 50 }, parts.total + 4096);
  assert.deepEqual([live.exact, live.content, live.remainder], [false, 50100, parts.total + 4096 - 50100 - 60050]);
  assert.equal(changedGroupBytes([{ g: "a", digest: "1", bytes: 5 }], [{ g: "a", digest: "1", bytes: 5 }, { g: "b", digest: "2", bytes: 7 }]), 7);
});

// the runner stays last: a test registered after it never runs
let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok   ${name}`); } catch (error) { failed++; console.log(`FAIL ${name}\n${error.stack}`); }
}
rmSync(dir, { recursive: true, force: true });
console.log(`${tests.length - failed}/${tests.length} passed`);
if (failed) process.exit(1);
