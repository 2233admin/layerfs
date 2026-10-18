// Tests of the P2 player's and the report statistics' pure parts (#352):
// the P2 plan split, consolidation order, phase moves, routing with
// concurrent agents, removals in a Sandbox, FUSE attribution, the call
// records, the wall projection, the call table, the Overview and its F1
// sums, STATS.md and the per-entry fit. Synthetic data only; nothing here
// touches Docker or LayerFS.
//   node dsh/tools/history/tests/p2.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fetchScript } from "../fetch-store.mjs";
import { changedPackages, closureSteps, compareInstalled, rawChangedBytes, storeSetup, installInputsChanged, listerCommand, normalizeOutput, playClosure } from "../closure.mjs";
import { aggregate, buildBaseline, reinstallGate, evaluate, probeSeries, thinClass } from "../gates.mjs";
import { checkFinding } from "../findings.mjs";
import { checkFormat, issuesAsOf, movers, NONE_LINE, openIssues, renderFindingFormat, renderFormat } from "../format.mjs";
import { parseReport } from "../frozen.mjs";
import { blockTables, findingTableProblems } from "../reportcheck.mjs";
import { baselineFor, leadNote, loadBaselines, probeSetupCommits, regate, writeBaseline } from "../report.mjs";
import { atHead } from "../frozen.mjs";
import { laneChanges, mergedTree } from "../agents.mjs";
import { measure, record } from "../lib.mjs";
import { checkRoute, loadBudget, wallProjection } from "../run.mjs";
import { runnerArgs } from "../runner.mjs";
import { demux, parseRun } from "../runner/docker-shim.mjs";
import {
  attributeFuse, callOf, changedDirs, outcomeOf, checkpointDiff, consolidationSteps, withDirs, decoyBytes, nextPhase, p2Plan, route, sandboxCommands, STEP_KINDS, Tree,
} from "../steps.mjs";
import {
  buildOverview, callTable, categoryOf, withoutProbeSetupCommits, categoryRows, CATEGORIES, checkOverview, derivedOverview, renderOverview, renderStats, stageSplit, tenths, timeLine,
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
  assert.match(nextPhase("p1", "p3"), /no player/);
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
  const grows = [1, 2, 3].map((i) => mk(i, 1000 * i, { list_largest: one(3 * i * i, { entries: 10 * i }) }));
  assert.equal(row(grows).result, "optimize", "list_largest is exempt from the same-input rule and fitted per entry");
  const perEntryFlat = [1, 2, 3].map((i) => mk(i, 1000 * i, { list_largest: { ...one(3 * i, { entries: 10 * i }), counters: { statements: 100 * i } } }));
  assert.equal(row(perEntryFlat).result, "pass", row(perEntryFlat).value);
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
  assert.ok(text.includes("| **Space amplification** | — | 5.00× |"), "5,000 B on disk over 1,000 B");
  assert.ok(text.includes(NONE_LINE) && text.includes("| F-005 | chunks | the fixer | diagnose |"));
  assert.deepEqual(checkFormat(text, m, issues), []);
  assert.ok(checkFormat(text.replace("| **Space amplification** | — | 5.00× |", "| **Space amplification** | — | 0.50× |"), m, issues).some((p) => /amplification/.test(p)));
  assert.ok(checkFormat(text, m, [...issues, { id: "F-009" }]).some((p) => /F-009/.test(p)));
  assert.ok(checkFormat(text.replace("\n## 4. Speed", "\n## 4. Pace"), m, issues).some((p) => /4\. Speed/.test(p)));
  assert.ok(checkFormat(text.replace("**Moved most:**", "**Moved:**"), m, issues).some((p) => /Moved most/.test(p)));
  const parsed = parseReport(text);
  assert.deepEqual([parsed.latest, parsed.checks.length], [1, 2]);
  assert.equal(leadNote(text.replace("- (none yet)", "- watch metadata")).trim(), "- watch metadata");
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
  assert.deepEqual(o, buildOverview(base), "probe and probe-setup records add no Commit");
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

test("runner container: docker run arguments, the route guard, the shim's run parsing and stream split", () => {
  const a = runnerArgs({ imageId: "sha256:abc", hostSocket: "/Users/u/.docker/run/docker.sock", route: "daemon", args: ["play", "--run", "x"], home: "/Users/u", repo: "/r", history: "/Users/u/lfs-history" });
  const s = a.join(" ");
  for (const want of ["--name layerfs-issue352-runner", "-v /r:/r", "-v /Users/u/lfs-history:/Users/u/lfs-history", "-v /var/run/docker.sock:/var/run/docker.sock",
    "-v /var/run/docker.sock:/Users/u/.docker/run/docker.sock", "LAYERFS_ROUTE=daemon", "LAYERFS_RUNNER_IMAGE=sha256:abc", "PATH=/r/dsh/tools/history/runner:"]) assert.ok(s.includes(want), want);
  assert.deepEqual(a.slice(-4), ["/r/dsh/tools/history/run.mjs", "play", "--run", "x"]);
  assert.equal(checkRoute({ route: "daemon" }, {}, true), null);
  assert.match(checkRoute({ route: "daemon" }, { LAYERFS_ROUTE: "direct" }, true), /not available until F-020/);
  assert.match(checkRoute({}, { LAYERFS_ROUTE: "other" }, true), /not the run's recorded route daemon/);
  assert.equal(checkRoute({}, { LAYERFS_ROUTE: "other" }, false), null, "fast mode records no measurement");
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

test("F-024: baseline classes carry n; a thin class is not judged; merge and Commit outcomes are their own classes", () => {
  const b = buildBaseline([2, 3, 4].map((range) => ({ range, binary: { daemon: "d" }, ops: [{ op: "branch.merge", sizeClass: "17–64 entries · UpToDate", n: range === 2 ? 1 : 0, p50: 3.51, p95: 3.51 }, { op: "fs.read", sizeClass: "≤8 KiB", n: 20, p50: 4, p95: 6 }].filter((r) => r.n) })));
  assert.deepEqual([b.ops["branch.merge\u000017–64 entries · UpToDate"].perRange, b.ops["fs.read\u0000≤8 KiB"].n], [[1, 0, 0], 60]);
  const m = { range: 10, binary: { daemon: "d" }, checks: {}, ops: [{ op: "branch.merge", sizeClass: "17–64 entries · UpToDate", n: 3, p50: 227, p95: 300 }, { op: "fs.read", sizeClass: "≤8 KiB", n: 30, p50: 4.4, p95: 6.6 }] };
  const speed = evaluate(m, [], b).checks.find((c) => c.name === "Speed");
  assert.equal(speed.result, "watch");
  assert.match(speed.value, /not judged: branch\.merge 17–64 entries · UpToDate: baseline class has 1\/0\/0 calls \(minimum 5 per range\)/);
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
  const kinds = (o) => closureSteps({ packages, tsconfigs, run: [], ...o }).map((s) => s.kind);
  assert.deepEqual(kinds({ changed: ["packages/a/src/x.ts"], installed: false, milestone: false }), ["install", "build"]);
  assert.deepEqual(kinds({ changed: ["packages/c/package.json", "packages/b/src/y.ts"], installed: true, milestone: false }), ["incremental-install", "build"]);
  assert.deepEqual(kinds({ changed: ["docs/x.md"], installed: true, milestone: false }), []);
  assert.deepEqual(kinds({ changed: ["docs/x.md"], installed: true, milestone: true }), ["clean-install"]);
  assert.equal(installInputsChanged(["node_modules/x/package.json"]), false, "installed files are not inputs");
  const steps = closureSteps({ packages, tsconfigs, changed: ["packages/b/src/y.ts", "packages/a/q.ts", "packages/c/z.ts"], installed: true, milestone: true, run: ["packages/a/tests/t.spec.ts"] });
  assert.match(steps[0].command, /rm -rf node_modules && pnpm install --offline --frozen-lockfile --store-dir \/tmp\/pnpm-store --cache-dir \/tmp\/pnpm-cache --ignore-scripts$/);
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
  const groups = list().trim().split("\n").map((l) => JSON.parse(l));
  assert.deepEqual(groups.map((g) => [g.g, g.n, g.bytes]), [["node_modules/.pnpm", 1, 0], ["node_modules/.pnpm/x@1", 3, 3], ["node_modules/x", 1, 24]]);
  assert.match(list(["node_modules/.pnpm/x@1"]), /^f 644 45b983be36b73c0788dc9cbcb76cbb80fc7bb057 node_modules\/\.pnpm\/x@1\/node_modules\/x\/index\.js$/m);
  assert.match(list(["node_modules/x"]), /^l 755 \.pnpm\/x@1\/node_modules\/x node_modules\/x$/m);
  assert.equal(compareInstalled({ groups }, groups).ok, true);
  const changed = compareInstalled({ groups }, [{ ...groups[0], digest: "0" }]);
  assert.deepEqual([changed.differ, changed.missing], [["node_modules/.pnpm"], ["node_modules/.pnpm/x@1", "node_modules/x"]]);
  rmSync(t, { recursive: true, force: true });
  // playing: one exec and one Commit per step; a failing build stops
  const calls = [];
  const fake = { label: () => {}, tally: { calls: 0 }, lf: { sandbox: {
    exec: async (sb, ws, c) => { calls.push(c.startsWith("./node_modules/.bin/tsc") ? "build" : c === "pwd" ? "pwd" : "exec"); return { exitCode: c.startsWith("./node_modules/.bin/tsc") ? 2 : 0, stdout: "" }; },
    commit: async () => { calls.push("commit"); return { kind: "Committed" }; } } } };
  await assert.rejects(playClosure(fake, 15, steps.slice(0, 2), { sb: 1, ws: 1, expectCall: (r, l, w) => w(), Mismatch: class extends Error {} }), /r015\.build exited 2/);
  assert.deepEqual(calls, ["exec", "commit", "build", "commit"]);
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
  assert.deepEqual(gate({ changedPackages: 3, rawChangedBytes: 6007, storedNewBytes: 9000 }), { value: "1.498× the raw bytes of 3 changed packages", result: "pass" });
  assert.equal(gate({ changedPackages: 3, rawChangedBytes: 6007, storedNewBytes: 18000 }).result, "watch");
  assert.equal(gate({ changedPackages: 3, rawChangedBytes: 6007, storedNewBytes: 31000 }).result, "optimize");
  assert.deepEqual([0.5, 2, 17].map((mib) => gate({ changedPackages: 0, rawChangedBytes: 0, storedNewBytes: mib * 2 ** 20 }).result), ["pass", "watch", "optimize"]);
  assert.equal(gate(null).result, "pass");
  assert.equal(gate({ changedPackages: 2, rawChangedBytes: 10, storedNewBytes: null }).result, "watch");
});

// the runner stays last: a test registered after it never runs
let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok   ${name}`); } catch (error) { failed++; console.log(`FAIL ${name}\n${error.stack}`); }
}
rmSync(dir, { recursive: true, force: true });
console.log(`${tests.length - failed}/${tests.length} passed`);
if (failed) process.exit(1);
