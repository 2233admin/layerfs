// Tests of "Speed as history grows" (owner 2026-10-19; a watch row, not a gate):
//   node dsh/tools/history/tests/growth.mjs
// Pure parts: the control probe's read set and comparison, the per-call counters, the per-class summary, the
// report section and the host load window. Nothing here starts a container or opens a Store.
import assert from "node:assert/strict";
import { compare, controlText, parseIo, readSet, summarize, WATCH } from "../control.mjs";
import { attemptHostLoad, growthByClass, growthSection, startIo } from "../growth.mjs";
import { hostLoadLine } from "../runner.mjs";

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test("control probe: deterministic text of the asked size; /proc/self/io parsed", () => {
  assert.equal(controlText("w1", 3, 700).length, 700);
  assert.equal(controlText("w8", 3, 6000), controlText("w8", 3, 6000));
  assert.notEqual(controlText("w8", 3, 6000), controlText("w8", 4, 6000));
  assert.deepEqual(parseIo("rchar: 10\nwchar: 2\nsyscr: 3\nsyscw: 1\nread_bytes: 4096\nwrite_bytes: 0\ncancelled_write_bytes: 0\n"), { rchar: 10, wchar: 2, syscr: 3, syscw: 1, read_bytes: 4096, write_bytes: 0, cancelled_write_bytes: 0 });
});

test("control probe: the read set is the same 1–8 KiB tracked files in both trees, spread by path", () => {
  const ls = (rows) => rows.map(([p, s]) => `100644 blob ${"a".repeat(40)} ${String(s).padStart(7)}\t${p}`).join("\n");
  const a = ls([...Array.from({ length: 40 }, (_, i) => [`d${String(i).padStart(2, "0")}/f.ts`, 2000]), ["big.ts", 9000], ["tiny.ts", 100], ["gone.ts", 3000]]);
  const b = ls([...Array.from({ length: 40 }, (_, i) => [`d${String(i).padStart(2, "0")}/f.ts`, i === 5 ? 9000 : 2000]), ["big.ts", 4000], ["tiny.ts", 3000]]);
  const set = readSet(a, b, 15);
  assert.equal(set.length, 15);
  assert.ok(!set.includes("d05/f.ts"), "over 8 KiB in one tree: out");
  assert.ok(!set.some((p) => ["big.ts", "tiny.ts", "gone.ts"].includes(p)), "each file must be 1–8 KiB in both trees");
  assert.equal(set[0], "d00/f.ts");
  assert.ok(set.includes("d39/f.ts") || set.at(-1) > "d30", "spread over the list, not its first directory");
  assert.throws(() => readSet(a, b, 50), /only 39 files/);
});

test("control probe: (b)/(a) per class; the watch row fires over 1.25× or over 2× the read syscalls", () => {
  const calls = (ms, syscr) => ["fs.write ≤1 KiB", "fs.write ≤8 KiB", "fs.read ≤8 KiB"].flatMap((c) => [1, 2, 3].map(() => ({ class: c, ok: true, ms, statements: 100, vmSteps: 4000, io: { syscr, rchar: syscr * 4096, read_bytes: 0 } })));
  const a = summarize(calls(4, 100));
  assert.deepEqual(a["fs.write ≤1 KiB"], { n: 3, failed: 0, p50: 4, statements: 100, vmSteps: 4000, syscr: 100, rchar: 409600, readBytes: 0 });
  assert.equal(compare(a, summarize(calls(5, 100))).watch, "pass", "1.25× is the line, not over it");
  assert.equal(WATCH.ratio, 1.25);
  // owner 2026-10-20: 1.3× of 4 ms is +1.2 ms, under the 5 ms floor, so it passes; 1.3× of 40 ms (+12 ms) fires
  assert.equal(compare(a, summarize(calls(5.2, 100))).watch, "pass");
  const slow = compare(summarize(calls(40, 100)), summarize(calls(52, 100)));
  assert.equal(slow.watch, "watch");
  assert.deepEqual(slow.fired, ["fs.write ≤1 KiB", "fs.write ≤8 KiB", "fs.read ≤8 KiB"]);
  assert.equal(compare(a, summarize(calls(4, 201))).watch, "watch", "read syscalls over 2× fire on their own");
  assert.equal(compare(a, summarize(calls(4, 200))).watch, "pass");
  const failed = summarize([{ class: "fs.write ≤1 KiB", ok: false, ms: 1 }]);
  assert.deepEqual([failed["fs.write ≤1 KiB"].n, failed["fs.write ≤1 KiB"].failed], [0, 1], "a failed call is counted, never timed");
});

test("per-call counters: an overlapped call is not solo; a Workspace call gets the WAL only", () => {
  const sink = {};
  const a = {}, b = {}, c = {};
  const endA = startIo(a, sink, "fs.write");
  const endB = startIo(b, sink, "sandbox.mount");
  endB(); endA();
  const endC = startIo(c, sink, "fs.read");
  endC();
  assert.ok(a.overlap && b.overlap, "two calls in flight together are both overlapped");
  assert.ok(!c.overlap);
  assert.equal(sink.active.size, 0, "every call leaves the in-flight set");
  assert.equal(b.io, undefined, "a daemon call reads in the daemon's process: no counter here");
  assert.ok(Array.isArray(a.wal) && Array.isArray(b.wal), "the WAL is recorded around every call");
  if (c.io) assert.equal(c.io.solo, true);
});

test("per-class summary: uncontended only, read counters from solo calls, WAL at the class's ends", () => {
  const line = (seq, method, ms, contention, args = {}) => ({ seq, step: `r018.s${seq}`, method, ms, ok: true, contention, args, daemon: [{ sql: { writer: { statements: 10, vm_steps: 100 }, readers: {} } }] });
  const lines = [line(1, "fs.write", 4, "uncontended"), line(2, "fs.write", 6, "uncontended"), line(3, "fs.write", 50, "contended"), line(4, "sandbox.mount", 9, "uncontended"), line(5, "fs.write", 5, "uncontended")];
  const log = [
    { seq: 1, method: "fs.write", size: { kind: "bytes", n: 500 }, io: { syscr: 100, rchar: 1, read_bytes: 0, solo: true }, wal: [10, 20] },
    { seq: 2, method: "fs.write", size: { kind: "bytes", n: 600 }, io: { syscr: 900, rchar: 1, read_bytes: 0, solo: false }, wal: [20, 30] },
    { seq: 3, method: "fs.write", size: { kind: "bytes", n: 700 }, io: { syscr: 5, rchar: 1, read_bytes: 0, solo: true }, wal: [30, 40] },
    { seq: 4, method: "sandbox.mount", size: null, wal: [40, 40] },
    { seq: 5, method: "fs.write", size: { kind: "bytes", n: 800 }, io: { syscr: 120, rchar: 1, read_bytes: 0, solo: true }, wal: [40, 55] },
  ];
  const g = growthByClass(lines, log);
  assert.deepEqual(g["fs.write ≤1 KiB"], { n: 3, p50: 5, statements: 10, vmSteps: 100, io: { solo: 2, syscr: 100, rchar: 1, readBytes: 0 }, wal: { start: 10, end: 55 } });
  assert.equal(g["sandbox.mount"].io, null);
  assert.equal(g["fs.read ≤8 KiB"].n, 0);
});

test("host load: the attempt's commands up to its final one", () => {
  const l = (at, args, s, e) => ({ start: { at, load: s }, end: { at, load: e }, args });
  const lines = [l("2026-10-19T10:00:00Z", ["play", "--until", "lead"], 1, 2), l("2026-10-19T12:00:00Z", ["play", "--until", "lead"], 3, 4),
    l("2026-10-19T12:01:00Z", ["play", "--resume", "--until", "lanes"], 9, 12), l("2026-10-19T12:03:00Z", ["play", "--resume"], 10, 11), l("2026-10-19T13:00:00Z", ["play", "--until", "lead"], 30, 30)];
  assert.deepEqual(attemptHostLoad(lines, { started: "2026-10-19T12:00:30Z" }), { start: 3, end: 11, max: 12, commands: 3 });
  assert.equal(attemptHostLoad([], { started: "2026-10-19T12:00:30Z" }), null);
  assert.deepEqual(Object.keys(hostLoadLine(["play"], { at: "t", load: 1 }, { at: "u", load: 2 }, 0)), ["where", "args", "start", "end", "status"]);
});

test("report section: trend from range 15, the control samples, the watch row judges this range's sample only", () => {
  const ops = (p50) => [{ op: "fs.write", sizeClass: "≤1 KiB · uncontended", n: 9, p50, sql: { statements: 140, vm_steps: 6000 } }];
  const r15 = { range: 15, attempt: 4, depth: { after: 12851 }, storeDisk: { allocated: 200 * 2 ** 20 }, ops: ops(5.9) };
  const r18 = { range: 18, attempt: 1, depth: { after: 17442 }, storeDisk: { allocated: 332 * 2 ** 20 }, ops: ops(7.9), started: "2026-10-19T12:00:30Z",
    growth: { "fs.write ≤1 KiB": { n: 9, p50: 7.94, statements: 143, vmSteps: 7071, io: { solo: 4, syscr: 110, rchar: 1, readBytes: 0 }, wal: { start: 0, end: 4096 } } } };
  const cls = (p50, syscr) => ({ n: 15, failed: 0, p50, syscr });
  const sample = (range, b, watch = "pass", attempt = null) => ({ range, attempt, hostLoad: { mac: { start: 9, end: 10 } }, watch, fired: [], per: { "fs.write ≤1 KiB": { ratio: b / 6 }, "fs.write ≤8 KiB": { ratio: 1 }, "fs.read ≤8 KiB": { ratio: 1 } },
    arms: { a: { commits: 12851, bytes: 1, classes: { "fs.write ≤1 KiB": cls(6, 110), "fs.write ≤8 KiB": cls(6, 110), "fs.read ≤8 KiB": cls(2, 60) } }, b: { commits: 15811, bytes: 1, classes: { "fs.write ≤1 KiB": cls(b, 112), "fs.write ≤8 KiB": cls(6, 110), "fs.read ≤8 KiB": cls(2, 57) } } } });
  const text = growthSection([r15, r18], { "control-017.diag-15v17-2": sample(17, 6.6) }).join("\n");
  assert.match(text, /^### Speed as history grows/);
  assert.match(text, /\| 015\.a4 \| 12851 \| 200\.0 \| 5\.90 \(1\.00×\) · 6000 · not recorded/);
  assert.match(text, /\| 018\.a1 \| 17442 \| 332\.0 \| 7\.94 \(1\.35×\) · 7071 · 110 \(4 solo\)/);
  assert.match(text, /fs\.write ≤1 KiB 0 → 4096 B/);
  assert.match(text, /\| control-017\.diag-15v17-2 \| 12851/);
  assert.match(text, /cannot see a cold-read effect/, "the warm-cache gap is stated");
  assert.match(text, /not split by class \(before range 18\)/, "merge before range 18: no ops row stands for it");
  const failedFirst = sample(17, 6.6); failedFirst.arms.a.classes["fs.write ≤1 KiB"] = { n: 0, p50: null, syscr: null };
  const two = growthSection([r15, r18], { "control-017.x": failedFirst, "control-017.y": sample(17, 6.6) }).join("\n");
  assert.match(two, /\| control-017\.y \| [^|]*\| [^|]*\| 6\.00 \(1\.00× first\)/, "the reference is the first sample in which the class completed");
  assert.doesNotMatch(two, /Infinity|NaN/);
  assert.match(two, /\| control-017\.x \|[^\n]*\| not judged \(failed calls\) \|/);
  assert.match(text, /\*\*Watch row\*\*[^\n]*not judged: no control sample for this range/, "a range 17 diagnostic does not judge range 18");
  const own = growthSection([r15, r18], { "control-017.diag-15v17-2": sample(17, 6.6), "control-018.a1": { ...sample(18, 8, "watch", 1), fired: ["fs.write ≤1 KiB"] } }).join("\n");
  assert.match(own, /\*\*Watch row\*\*[^\n]*watch — fs\.write ≤1 KiB \(sample control-018\.a1\)/);
  assert.match(growthSection([r15, { ...r18, attempt: 2 }], { "control-018.a1": { ...sample(18, 8, "watch", 1), fired: ["fs.write ≤1 KiB"] } }).join("\n"), /\*\*Watch row\*\*[^\n]*not judged: no control sample/, "another attempt's sample does not judge this one");
  const broken = sample(18, 6, "pass", 1); broken.arms.b.classes["fs.write ≤1 KiB"] = { n: 0, failed: 15, p50: null };
  assert.match(growthSection([r15, r18], { "control-018.a1": broken }).join("\n"), /not judged: this range's sample has failed calls/);
  assert.match(growthSection([r15, r18], {}, [{ start: { at: "2026-10-19T12:01:00Z", load: 9.5 }, end: { at: "2026-10-19T12:03:00Z", load: 11 }, args: ["play", "--resume"] }]).join("\n"), /macOS 9\.50 at the first command → 11\.00 after the last/);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n${e.stack}`); }
}
console.log(`${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
