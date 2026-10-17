// Tests of the headless runner's pure parts (#352): routing, the Sandbox
// step's commands, the checkpoint comparisons, trace counters and the disk
// guard, on synthetic data only. Nothing here touches Docker or LayerFS.
//   node dsh/tools/history/tests/runner.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  CHUNK, compareIds, comparePaths, diskGuard, EXIT, FS_MAX, idBatches, parseTreePage, phaseOps, route,
  sandboxCommands, sandboxExpect, sqlCounters, callOf, traceLines, Tree, TREE_IDS, viaSandbox,
} from "../steps.mjs";
import { nextAttempt, options, outputs, POLICIES } from "../run.mjs";

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const dir = mkdtempSync(join(tmpdir(), "lfs-history-runner-"));
const file = (blob = "a".repeat(40), mode = "100644", size = 10) => ({ mode, blob, size });

test("Tree: parents to make, the folder a removal takes, the largest folder", () => {
  const t = new Tree(new Map([["a/b/c.txt", file()], ["a/d.txt", file()], ["e.txt", file()]]));
  assert.equal(t.missingParent("a/b/new.txt"), null);
  assert.equal(t.missingParent("x/y/z.txt"), "x/y");
  assert.equal(t.missingParent("top.txt"), null);
  assert.equal(t.removalTarget("a/b/c.txt"), "a/b");
  assert.equal(t.removalTarget("a/d.txt"), "a/d.txt");
  assert.deepEqual(t.largestDir(), { dir: "", entries: 2 });
  t.delete("a/b/c.txt");
  assert.equal(t.isDir("a/b"), false);
  assert.equal(t.removalTarget("a/d.txt"), "a");
});

test("viaSandbox: modes, mode changes and sizes over one request", () => {
  assert.equal(viaSandbox({ op: "write", mode: "100644", size: FS_MAX }), false);
  assert.equal(viaSandbox({ op: "write", mode: "100644", size: FS_MAX + 1 }), true);
  assert.equal(viaSandbox({ op: "write", mode: "100755", size: 1 }), true);
  assert.equal(viaSandbox({ op: "write", mode: "120000", size: 1 }), true);
  assert.equal(viaSandbox({ op: "write", mode: "100644", size: 1, modeChange: true }), true);
  assert.equal(viaSandbox({ op: "rm", mode: "100755" }), false);
});

test("route: write, apply with parents, removal of emptied folders, Sandbox files", () => {
  const t = new Tree(new Map([["a/b/c.txt", file()], ["a/d.txt", file()]]));
  const { calls, sandbox } = route([
    { op: "write", path: "a/b/c.txt", mode: "100644", blob: "b".repeat(40), size: 5 },
    { op: "write", path: "n/m.txt", mode: "100644", blob: "c".repeat(40), size: 5 },
    { op: "write", path: "bin/run", mode: "100755", blob: "d".repeat(40), size: 5 },
    { op: "rm", path: "a/b/c.txt" },
    { op: "rm", path: "gone.txt" },
  ], t);
  assert.deepEqual(calls.map((c) => [c.call, c.path, c.call === "rm" ? c.target : c.parent]), [["write", "a/b/c.txt", null], ["apply", "n/m.txt", "n"], ["rm", "a/b/c.txt", "a/b"]]);
  assert.equal(sandbox.length, 1);
  assert.equal(sandbox[0].previous, null);
  assert.ok(t.has("bin/run") && !t.has("a/b/c.txt") && t.has("n/m.txt"));
  assert.equal(sandboxExpect(sandbox), "Committed");
  assert.equal(sandboxExpect([{ expect: "UpToDate" }]), "UpToDate");
});

test("phaseOps: P1 plays fs/apply/stale-apply files and leaves out the conflicts' own steps", () => {
  const w = { op: "write", path: "x", mode: "100644", blob: "a".repeat(40) };
  const plan = {
    steps: [
      { id: "s1", kind: "fs", files: [w] },
      { id: "s2", kind: "apply", files: [w, { op: "read", path: "y" }] },
      { id: "s3", kind: "stale-apply", files: [w] },
      { id: "s4", kind: "hold", files: [w] },
      { id: "s5", kind: "check" },
      { id: "s6", kind: "decoy", files: [w] },
      { id: "s7", kind: "fs", files: [] },
    ],
    consolidation: [{ op: "reconcile", files: [w] }, { op: "publish" }],
  };
  const { ops, reconcile, left } = phaseOps(plan, "p1");
  assert.deepEqual(ops.map((o) => o.id), ["s1", "s2", "s3"]);
  assert.equal(ops[1].files.length, 1);
  assert.deepEqual(left, { hold: 1, check: 1, decoy: 1, fs: 1 });
  assert.equal(reconcile[0].expect, "Committed");
  assert.throws(() => phaseOps(plan, "p2"), /no player/);
});

test("sandboxCommands: chunks stay under one request and the script restores bytes and modes", () => {
  const big = Buffer.alloc(3 * CHUNK, 7);
  const cmds = sandboxCommands([
    { path: "d/big.bin", mode: "100644", bytes: big },
    { path: "run.sh", mode: "100755", bytes: Buffer.from(`#!/bin/sh\necho "it's"\n`) },
    { path: "empty", mode: "100644", bytes: Buffer.alloc(0) },
    { path: "d/link", mode: "120000", bytes: Buffer.from("big.bin") },
  ], join(dir, "scratch"));
  for (const c of cmds) assert.ok(Buffer.byteLength(c) <= 60_000);
  assert.ok(cmds.length > 3);
  const ws = join(dir, "ws");
  mkdirSync(ws);
  for (const c of cmds) execFileSync("sh", ["-c", c], { cwd: ws });
  assert.equal(execFileSync("wc", ["-c", "d/big.bin"], { cwd: ws, encoding: "utf8" }).trim().split(/\s+/)[0], String(big.length));
  assert.equal(execFileSync("sh", ["-c", "./run.sh"], { cwd: ws, encoding: "utf8" }), "it's\n");
  assert.equal(execFileSync("readlink", ["d/link"], { cwd: ws, encoding: "utf8" }).trim(), "big.bin");
  assert.equal(execFileSync("wc", ["-c", "empty"], { cwd: ws, encoding: "utf8" }).trim().split(/\s+/)[0], "0");
});

test("idBatches: paths split by bytes, none empty", () => {
  const b = idBatches(["aaaa", "bbbb", "cccc"], 16);
  assert.deepEqual(b, [["aaaa", "bbbb"], ["cccc"]]);
  assert.deepEqual(idBatches([], 16), []);
});

test("TREE_IDS and parseTreePage: git blob ids, modes, skipped prefixes and node_modules", () => {
  const ws = join(dir, "tree");
  mkdirSync(join(ws, "src"), { recursive: true });
  mkdirSync(join(ws, "node_modules/x"), { recursive: true });
  mkdirSync(join(ws, ".lfs-probe"), { recursive: true });
  writeFileSync(join(ws, "src/a.txt"), "hello\n");
  writeFileSync(join(ws, "node_modules/x/i.js"), "x");
  writeFileSync(join(ws, ".lfs-probe/p"), "p");
  const out = execFileSync("node", ["-e", TREE_IDS, "0", "100", ".lfs-probe"], { cwd: ws, encoding: "utf8" });
  const { files, total } = parseTreePage(out);
  assert.equal(total, 1);
  assert.deepEqual(files.get("src/a.txt"), { mode: "100644", blob: "ce013625030ba8dba906f756967f9e9ca394464a" });
  assert.throws(() => parseTreePage("100644 xx /a\n"), /did not finish/);
});

test("comparePaths: missing, extra, folders, ignored prefixes and metadata-only changes", () => {
  const items = [
    { path: "/a.txt", kind: "Modified", content: true },
    { path: "/dir", type: "dir", kind: "Added" },
    { path: "/.lfs-probe/x", kind: "Added", content: true },
    { path: "/t.txt", kind: "Modified", content: false, metadata: true },
    { path: "/odd.txt", kind: "Added", content: true },
  ];
  const r = comparePaths(items, [{ path: "a.txt" }, { path: "b.txt" }, { path: "sub", gitlink: true }], [".lfs-probe"]);
  assert.deepEqual([r.ok, r.missing, r.extra, r.metadataOnly], [false, ["b.txt"], ["odd.txt"], ["t.txt"]]);
  assert.equal(comparePaths(items.slice(0, 4), [{ path: "a.txt" }], [".lfs-probe"]).ok, true);
});

test("compareIds: missing, content and mode", () => {
  const e = new Map([["a", file("1".repeat(40))], ["b", file("2".repeat(40))], ["c", file("3".repeat(40))], ["d", file("4".repeat(40))]]);
  const a = new Map([["a", file("1".repeat(40))], ["b", file("9".repeat(40))], ["c", file("3".repeat(40), "100755")]]);
  const r = compareIds(["a", "b", "c", "d"], a, e);
  assert.deepEqual([r.ok, r.missing, r.content, r.mode, r.checked], [false, ["d"], ["b"], ["c"], 4]);
});

test("trace parsing: SQL counters summed over writer and readers, call sizes and phases", () => {
  const line = {
    method: "fs.write", ms: 3, ok: true, args: { contentBytes: 100 },
    daemon: [{ sql: { writer: { statements: 2, vm_steps: 10, returned_rows: 1 }, readers: { statements: 1, fullscan_steps: 4 } }, timing: [{ name: "commit", ms: 2, children: [{ name: "save", ms: 1 }] }] }],
  };
  assert.deepEqual(sqlCounters(line), { statements: 3, vm_steps: 10, fullscan_steps: 4, sorts: 0, returned_rows: 1 });
  assert.deepEqual(callOf(line), { method: "fs.write", ms: 3, ok: true, size: { kind: "bytes", n: 100 }, phases: { commit: 2, "commit.save": 1 } });
  assert.equal(traceLines(`${JSON.stringify({ phase: "start" })}\n${JSON.stringify(line)}\n`).length, 1);
});

test("diskGuard: twice the projection on both disks", () => {
  const G = 2 ** 30;
  assert.equal(diskGuard({ storeBytes: G, growthBytes: 0, dockerFree: 100 * G, hostFree: 100 * G, rangesLeft: 3 }).ok, true);
  const low = diskGuard({ storeBytes: G, growthBytes: G, installPeak: G, dockerFree: 9 * G, hostFree: 100 * G, rangesLeft: 1 });
  assert.equal(low.ok, false);
  assert.equal(low.docker, 5 * G);
  assert.equal(diskGuard({ storeBytes: G, growthBytes: G, dockerFree: 100 * G, hostFree: 5 * G, rangesLeft: 1 }).ok, false);
});

test("runner: exit codes, outputs by label, attempts, options and the control policy", () => {
  assert.deepEqual(EXIT, { done: 0, error: 1, usage: 2, optimize: 3, stop: 4, guard: 5 });
  assert.ok(outputs("measured", "/r").docs.endsWith("core/docs/issues/352"));
  assert.deepEqual(outputs("dev", "/r"), { metrics: "/r/metrics", docs: "/r/docs", snapshots: "/r/snapshots" });
  const m = join(dir, "metrics");
  assert.equal(nextAttempt(m, 4), 1);
  mkdirSync(m);
  writeFileSync(join(m, "range-004.a1.json"), "{}");
  writeFileSync(join(m, "range-004.a2.json"), "{}");
  writeFileSync(join(m, "range-005.a7.json"), "{}");
  assert.equal(nextAttempt(m, 4), 3);
  assert.deepEqual(options(["play", "--run", "x", "--from", "0"]), { _: ["play"], run: "x", from: "0" });
  assert.deepEqual(POLICIES.control, { smallFileThreshold: 131072, wholeFileDepth: 8, chunkDepth: 4 });
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok   ${name}`); } catch (error) { failed++; console.log(`FAIL ${name}\n${error.stack}`); }
}
rmSync(dir, { recursive: true, force: true });
console.log(`${tests.length - failed}/${tests.length} passed`);
if (failed) process.exit(1);
