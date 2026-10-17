// Tests of the P2 player's and the report statistics' pure parts (#352):
// the P2 plan split, consolidation order, phase moves, routing with
// concurrent agents, removals in a Sandbox, FUSE attribution, the call
// records, the wall projection, the call table, the Overview and its F1
// sums, STATS.md and the per-entry fit. Synthetic data only; nothing here
// touches Docker or LayerFS.
//   node dsh/tools/history/tests/p2.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { aggregate, evaluate } from "../gates.mjs";
import { atHead } from "../frozen.mjs";
import { laneChanges, mergedTree } from "../agents.mjs";
import { measure, record } from "../lib.mjs";
import { loadBudget, wallProjection } from "../run.mjs";
import {
  attributeFuse, callOf, consolidationSteps, decoyBytes, nextPhase, p2Plan, route, sandboxCommands, STEP_KINDS, Tree,
} from "../steps.mjs";
import {
  buildOverview, callTable, categoryOf, categoryRows, CATEGORIES, checkOverview, derivedOverview, renderOverview, renderStats, stageSplit, tenths, timeLine,
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
});

test("Scaling: diff_commits judged per entry against depth when three attempts recorded it", () => {
  const mk = (range, depth, ms) => ({ range, binary: { daemon: "d" }, depth: { after: depth }, checks: {}, probes: { stat: { ms: 3 } }, perUnit: { "branch.diff_commits": { unit: "entry", msPerEntry: ms } } });
  const g = evaluate(mk(3, 4000, 0.4), [mk(1, 1000, 0.1), mk(2, 2000, 0.2)]);
  const row = g.checks.find((c) => c.name === "Scaling");
  assert.match(row.value, /branch\.diff_commits per entry: depth exponent 1/);
  assert.equal(row.result, "optimize");
});

test("atHead: a folder outside git is null, quietly", () => {
  const file = join(dir, "outside", "r.md");
  mkdirSync(join(dir, "outside"));
  writeFileSync(file, "x");
  assert.equal(atHead(file), null);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok   ${name}`); } catch (error) { failed++; console.log(`FAIL ${name}\n${error.stack}`); }
}
rmSync(dir, { recursive: true, force: true });
console.log(`${tests.length - failed}/${tests.length} passed`);
if (failed) process.exit(1);
