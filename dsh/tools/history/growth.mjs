// Speed as history grows (owner 2026-10-19; a watch row only, never a gate, workload, timeout or cache change).
// Range 15 is the reference. Three sources, all recorded, none rerun:
//   - per call in the play (record(), lib.mjs): an in-process Store call's /proc/self/io delta (read syscalls,
//     rchar, read_bytes) and the Store WAL's size before and after any call. The delta is the call's only when no
//     other recorded call overlapped it (`solo`); the harness's own reads on the main thread can still land in it.
//     A Workspace call (sandbox.*) reads in the daemon's process: no counter here (product code would be needed).
//   - per class at the range's end (growthByClass, metrics `growth`): those counters next to p50, SQL statements
//     and VM steps, for the uncontended classes the owner named;
//   - the control probe (control.mjs, metrics control-NNN.json): the range 15 Store against the range's, same window.
// SQLite's own page-cache hit/miss counters (sqlite3_db_status) are not reported by the binary: read syscalls per
// call stand in for page-cache misses (SQLite reads a missing page with one pread), read_bytes for storage reads.
import { readFileSync, statSync } from "node:fs";
import { sizeClass } from "./gates.mjs";
import { callOf } from "./steps.mjs";
import { parseIo, WATCH } from "./control.mjs";

/** The classes tracked (uncontended, as the speed gate's series): label, method, size class, outcome. */
export const GROWTH_CLASSES = [
  ["fs.write ≤1 KiB", "fs.write", "≤1 KiB"], ["fs.write ≤8 KiB", "fs.write", "≤8 KiB"], ["fs.write ≤64 KiB", "fs.write", "≤64 KiB"],
  ["fs.read ≤8 KiB", "fs.read", "≤8 KiB"], ["sandbox.mount", "sandbox.mount", "—"],
  ["sandbox.commit 1 file (Committed)", "sandbox.commit", "1 files", "Committed"], ["branch.merge", "branch.merge", null],
];
/** Methods whose work runs in this process (Store calls, F-020); a Workspace call's runs in the daemon. */
export const inProcess = (method) => !method.startsWith("sandbox.");

/** This process's /proc/self/io (null off Linux). */
export function procIo() { try { return parseIo(readFileSync("/proc/self/io", "utf8")); } catch { return null; } }
/** The Store WAL's size (null when absent). */
export function walSize(store = process.env.LAYERFS_STORE_PATH) { try { return store ? statSync(`${store}-wal`).size : null; } catch { return null; } }

/** Starts a call's counters (record()); returns the function that finishes them into `entry`. */
export function startIo(entry, sink, method) {
  const active = (sink.active ??= new Set());
  if (active.size) { entry.overlap = true; for (const e of active) e.overlap = true; }
  active.add(entry);
  const io0 = inProcess(method) ? procIo() : null, wal0 = walSize();
  return () => {
    active.delete(entry);
    const io1 = io0 ? procIo() : null;
    if (io0 && io1) entry.io = { syscr: io1.syscr - io0.syscr, rchar: io1.rchar - io0.rchar, read_bytes: io1.read_bytes - io0.read_bytes, solo: !entry.overlap };
    entry.wal = [wal0, walSize()];
  };
}

const med = (xs) => { const s = xs.filter((x) => x != null).sort((p, q) => p - q); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

/** Per tracked class, uncontended calls of the range (readTrace lines joined to their records by seq). */
export function growthByClass(lines, log) {
  const bySeq = new Map((log ?? []).map((e) => [e.seq, e]));
  const rows = lines.filter((l) => l.contention === "uncontended" && l.ok !== false && !/^probe/.test(String(l.step ?? ""))).map((l) => {
    const e = bySeq.get(l.seq)?.method === l.method ? bySeq.get(l.seq) : null, c = callOf(l, e);
    return { ...c, cls: c.size ? sizeClass(c.size.kind, c.size.n) : "—", io: e?.io ?? null, wal: e?.wal ?? null, seq: l.seq };
  });
  return Object.fromEntries(GROWTH_CLASSES.map(([label, method, cls, outcome]) => {
    const xs = rows.filter((r) => r.method === method && (cls == null || r.cls === cls) && (!outcome || r.outcome === outcome)).sort((p, q) => p.seq - q.seq);
    const solo = xs.filter((x) => x.io?.solo);
    return [label, { n: xs.length, p50: med(xs.map((x) => x.ms)), statements: med(xs.map((x) => x.sql?.statements)), vmSteps: med(xs.map((x) => x.sql?.vm_steps)),
      io: inProcess(method) ? { solo: solo.length, syscr: med(solo.map((x) => x.io.syscr)), rchar: med(solo.map((x) => x.io.rchar)), readBytes: med(solo.map((x) => x.io.read_bytes)) } : null,
      wal: xs.length ? { start: xs[0].wal?.[0] ?? null, end: xs.at(-1).wal?.[1] ?? null } : null }];
  }));
}

/** A range's tracked class from its metrics: `growth` when recorded (range 18 on), else its uncontended ops row. */
function classOf(m, [label, method, cls, outcome]) {
  if (m.growth?.[label]) return m.growth[label];
  // before range 18 a class without a size (merge) has no one ops row to stand for it
  if (cls == null) return null;
  const key = [cls ?? null, outcome, "uncontended"].filter(Boolean).join(" · ");
  const r = (m.ops ?? []).find((x) => x.op === method && (cls == null ? / · uncontended$/.test(x.sizeClass) : x.sizeClass === key));
  return r ? { n: r.n, p50: r.p50, statements: r.sql?.statements ?? null, vmSteps: r.sql?.vm_steps ?? null, io: null, wal: null } : null;
}

const MiB = (b) => (b == null ? "—" : `${(b / 2 ** 20).toFixed(1)}`);
const num = (v, d = 2) => (v == null ? "—" : Number(v).toFixed(d));

/**
 * The report section (REPORT_FORMAT "Speed as history grows"): per range from 15, Commits, Store MiB, and per
 * class p50, VM steps and read syscalls per solo call; the control probe; the watch row. `points` are the terminal
 * metrics of ranges 15..k in order (the current last), `controls` control-NNN.json files by range.
 */
export function growthSection(points, controls = {}, hostLines = []) {
  const out = ["### Speed as history grows", "", "Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.", ""];
  const ref = points[0];
  out.push("| Range | Commits | Store MiB | " + GROWTH_CLASSES.map(([l]) => `${l} p50 ms (×r15) · VM steps · reads/call`).join(" | ") + " |");
  out.push("| --- | --- | --- | " + GROWTH_CLASSES.map(() => "---").join(" | ") + " |");
  for (const m of points) {
    const cells = GROWTH_CLASSES.map((c) => {
      const x = classOf(m, c), r = classOf(ref, c);
      if (!x) return c[2] == null && !m.growth ? "not split by class (before range 18)" : "—";
      return `${num(x.p50)} (${x.p50 && r?.p50 ? (x.p50 / r.p50).toFixed(2) : "—"}×) · ${x.vmSteps ?? "—"} · ${x.io ? `${x.io.syscr ?? "—"} (${x.io.solo} solo)` : m.growth ? "— (daemon)" : "not recorded"}`;
    });
    const disk = m.storeDisk ? m.storeDisk.allocated + (m.storeDisk.walAllocated ?? 0) : null;
    out.push(`| ${String(m.range).padStart(3, "0")}${m.attempt ? `.a${m.attempt}` : ""} | ${m.depth?.after ?? m.history?.commits ?? "—"} | ${MiB(disk)} | ${cells.join(" | ")} |`);
  }
  const cur = points.at(-1);
  const wal = Object.entries(cur.growth ?? {}).filter(([, v]) => v?.wal).map(([l, v]) => `${l} ${v.wal.start ?? "—"} → ${v.wal.end ?? "—"} B`);
  out.push("", `**WAL across each class this range:** ${wal.length ? wal.join(" · ") : "not recorded"}`);
  const h = cur.hostLoad, host = attemptHostLoad(hostLines, cur);
  out.push(`**Host load (1-min, recorded, not waited on):** macOS ${host ? `${num(host.start)} at the first command → ${num(host.end)} after the last (max ${num(host.max)} over ${host.commands} commands)` : "not recorded (before 2026-10-19)"} · Docker VM ${h ? `${h.start ?? "—"} → ${h.end ?? "—"}` : "—"}`);
  const ctl = Object.entries(controls).sort(([a], [b]) => a.localeCompare(b));
  if (ctl.length) {
    out.push("", "**Control probe** (one sample per arm, same window and binaries; (a) the range 15 Store, (b) the range's). Gap: each clone is copied just before its arm, which warms the OS cache equally in both, so the control cannot see a cold-read effect of a larger Store (storage reads are 0 in both arms); it compares warm-cache work only.", "", "| Sample | (a) Commits · MiB | (b) Commits · MiB | " + CLASSES_SHOWN.map((c) => `${c}: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b)`).join(" | ") + " | Host load (macOS) | Watch |", "| --- | --- | --- | " + CLASSES_SHOWN.map(() => "---").join(" | ") + " | --- | --- |");
    // the (a) arm's reference: its first sample in which the class completed (a failed sample is listed, never a reference)
    const first = (k) => ctl.map(([, c]) => c.arms.a.classes[k]).find((a) => a?.n && a.p50);
    for (const [name, c] of ctl) {
      const cells = CLASSES_SHOWN.map((k) => { const a = c.arms.a.classes[k], b = c.arms.b.classes[k]; return a?.n && b?.n ? `${num(a.p50)} (${num(a.p50 / first(k).p50)}× first) / ${num(b.p50)} · ${num(c.per[k].ratio)}× · ${a.syscr}/${b.syscr}` : `failed: (a) ${a?.n ?? 0} of ${(a?.n ?? 0) + (a?.failed ?? 0) || "?"} calls ok, (b) ${b?.n ?? 0} ok`; });
      out.push(`| ${name} | ${c.arms.a.commits} · ${MiB(c.arms.a.bytes)} | ${c.arms.b.commits} · ${MiB(c.arms.b.bytes)} | ${cells.join(" | ")} | ${num(c.hostLoad?.mac?.start)} → ${num(c.hostLoad?.mac?.end)} | ${complete(c) ? `${c.watch}${c.fired?.length ? ` (${c.fired.join(", ")})` : ""}` : "not judged (failed calls)"} |`);
    }
  }
  const own = ctl.map(([, c]) => c).filter((c) => c.range === cur.range && c.attempt != null && c.attempt === cur.attempt), last = own.at(-1);
  const judged = own.filter(complete).at(-1);
  out.push("", `**Watch row** (control (b)/(a) p50 over ${WATCH.ratio}×, or (b)'s reads per call over ${WATCH.misses}× (a)'s): ${judged ? `${judged.watch}${judged.fired?.length ? ` — ${judged.fired.join(", ")}` : ""} (sample ${ctl.find(([, c]) => c === judged)[0]})` : last ? "not judged: this range's sample has failed calls" : "not judged: no control sample for this range"}`);
  return out;
}
const CLASSES_SHOWN = ["fs.write ≤1 KiB", "fs.write ≤8 KiB", "fs.read ≤8 KiB"];
/** A control sample whose every class ran in both arms (only such a sample is judged). */
const complete = (c) => CLASSES_SHOWN.every((k) => c.arms.a.classes[k]?.n && c.arms.b.classes[k]?.n);

/**
 * The macOS load of an attempt from the runner's lines (runs/<id>/hostload.jsonl): the commands from the attempt's
 * start up to its final command (a --resume without --until), inclusive.
 */
export function attemptHostLoad(lines, m) {
  const t0 = Date.parse(m.started ?? "") - 120000;
  if (!Number.isFinite(t0)) return null;
  const xs = [];
  for (const l of lines.filter((x) => Date.parse(x.start?.at) >= t0).sort((a, b) => Date.parse(a.start.at) - Date.parse(b.start.at))) {
    xs.push(l);
    if (l.args?.includes("--resume") && !l.args.includes("--until")) break;
  }
  return xs.length ? { start: xs[0].start.load, end: xs.at(-1).end.load, max: Math.max(...xs.flatMap((x) => [x.start.load, x.end.load])), commands: xs.length } : null;
}
