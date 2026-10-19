#!/usr/bin/env node
// Speed as history grows (owner 2026-10-19, watch only): a fixed control probe at a range's end.
//   node dsh/tools/history/control.mjs --run <id> --range N [--b live|snapshot:<range>[:<run>]] [--label <name>]
// The same small set of Store calls (fs.write ≤1 KiB, fs.write ≤8 KiB, fs.read ≤8 KiB) runs, one sample per arm,
// in the same command and with the same binaries, on two independent clones:
//   (a) the range 15 terminal Store (snapshot range-015.p3-main-d, the comparison's reference);
//   (b) the range's Store: the run's live volume (default) or a snapshot.
// Each clone is a fresh Docker volume made for this command and removed after it (both arms: the OS cache holds
// what the copy wrote; neither arm is warmed any other way). Each arm runs in its own runner process (one Store
// per process, F-020), Disposable as every run Store, with no network: the calls are SDK Store calls in-process.
// Per call: wall ms around the binding call, the SQL counters of its trace line, the process's /proc read
// counters (rchar: bytes read through read syscalls, page-cache hits included; syscr: read syscalls; read_bytes:
// bytes the kernel fetched from storage) and the WAL's size before and after. Both arms share a host window, so
// if both slow together the host is the cause; if only (b) slows, history growth is (format.mjs historySpeed).
// Writes metrics/control-NNN.a<attempt>.json (the run's latest attempt at range N), or control-NNN.<label>.json. Never a gate: the report shows a watch row only.
import { execFileSync } from "node:child_process";
import { loadavg } from "node:os";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { THRESHOLDS } from "./gates.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const pad = (n) => String(n).padStart(3, "0");
export const STORE = "/layerfs-store/global/store.sqlite";
/** The reference arm: range 15's terminal Store (r015.a4, run p3-main-d). */
export const REFERENCE = { range: 15, run: "p3-main-d" };
/** Calls per class (one sample per arm: each class's p50 is over these). */
export const PER_CLASS = 15;
export const CLASSES = ["fs.write ≤1 KiB", "fs.write ≤8 KiB", "fs.read ≤8 KiB"];
/** The watch row's lines (owner 2026-10-19): (b)/(a) p50 over 1.25×, or (b)'s read syscalls per call over 2× (a)'s. */
export const WATCH = { ratio: 1.25, misses: 2 };

/** Deterministic text of `bytes` bytes for write `i` of class `tag`. */
export const controlText = (tag, i, bytes) => `${tag} ${i} `.padEnd(bytes, "abcdefghijklmnopqrstuvwxyz0123456789\n".repeat(Math.ceil(bytes / 37))).slice(0, bytes);

/** /proc/<self>/io as numbers (Linux). */
export const parseIo = (text) => Object.fromEntries(text.trim().split("\n").map((l) => l.split(":")).map(([k, v]) => [k.trim(), Number(v)]));

/**
 * The read set: PER_CLASS tracked files between 1 and 8 KiB in both trees, the same paths in both arms, picked
 * by path order (`lsA`, `lsB`: `git ls-tree -r -l` text of each arm's checkpoint tree).
 */
export function readSet(lsA, lsB, n = PER_CLASS) {
  const sizes = (text) => new Map(text.split("\n").filter(Boolean).map((l) => { const [meta, path] = l.split("\t"); const f = meta.split(/\s+/); return [path, f[1] === "blob" ? Number(f[3]) : null]; }));
  const a = sizes(lsA), b = sizes(lsB), ok = (s) => s != null && s > 1024 && s <= 8192;
  const both = [...a].filter(([p, s]) => ok(s) && ok(b.get(p)) && !p.includes(" ")).map(([p]) => p).sort();
  if (both.length < n) throw new Error(`only ${both.length} files of 1–8 KiB are in both trees`);
  // spread over the sorted list, not its first directory
  return Array.from({ length: n }, (_, i) => both[Math.floor((i * both.length) / n)]);
}

const med = (xs) => { const s = xs.filter((x) => x != null).sort((p, q) => p - q); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

/** One arm's summary per class: p50 ms, SQL statements and VM steps, read syscalls, rchar and read_bytes per call. */
export function summarize(calls) {
  return Object.fromEntries(CLASSES.map((c) => {
    const xs = calls.filter((x) => x.class === c && x.ok);
    return [c, { n: xs.length, failed: calls.filter((x) => x.class === c && !x.ok).length, p50: med(xs.map((x) => x.ms)), statements: med(xs.map((x) => x.statements)), vmSteps: med(xs.map((x) => x.vmSteps)),
      syscr: med(xs.map((x) => x.io?.syscr)), rchar: med(xs.map((x) => x.io?.rchar)), readBytes: med(xs.map((x) => x.io?.read_bytes)) }];
  }));
}

/** (b) against (a) per class, and the watch row's state. */
export function compare(a, b) {
  const per = Object.fromEntries(CLASSES.map((c) => [c, {
    ratio: a[c]?.p50 && b[c]?.p50 != null ? +(b[c].p50 / a[c].p50).toFixed(3) : null,
    misses: a[c]?.syscr != null && b[c]?.syscr != null ? +(b[c].syscr / Math.max(a[c].syscr, 1)).toFixed(3) : null,
  }]));
  // owner 2026-10-20: a time ratio counts only when (b) also adds more than the absolute floor per call
  const fired = CLASSES.filter((c) => (per[c].ratio > WATCH.ratio && b[c].p50 - a[c].p50 > THRESHOLDS.absoluteFloorMs) || per[c].misses > WATCH.misses);
  return { per, watch: fired.length ? "watch" : "pass", fired };
}

// ---- one arm, inside its runner container ----
async function arm({ out, reads, tag }) {
  const io = () => parseIo(readFileSync("/proc/self/io", "utf8"));
  const wal = () => (existsSync(`${STORE}-wal`) ? statSync(`${STORE}-wal`).size : 0);
  const { LayerFS } = await import(join(process.env.LAYERFS_SDK_JS, "src/index.js"));
  const trace = `${out}.trace.jsonl`;
  const lf = new LayerFS(process.env.LFS_CONTROL_PROJECT, { trace });
  const branch = `control-${tag}`;
  const load0 = readFileSync("/proc/loadavg", "utf8").split(" ")[0];
  // setup, untimed: opens the Store, forks the Branch the writes go to and makes their folder
  await lf.branch.fork(branch, "main");
  await lf.fs.mkdir(branch, "/.lfs352-control", "control folder");
  const plan = [
    ...Array.from({ length: PER_CLASS }, (_, i) => ["fs.write ≤1 KiB", () => lf.fs.write(branch, `/.lfs352-control/w1-${i}.txt`, controlText("w1", i, 700), `control w1 ${i}`)]),
    ...Array.from({ length: PER_CLASS }, (_, i) => ["fs.write ≤8 KiB", () => lf.fs.write(branch, `/.lfs352-control/w8-${i}.txt`, controlText("w8", i, 6000), `control w8 ${i}`)]),
    ...reads.map((p) => ["fs.read ≤8 KiB", () => lf.fs.read("main", `/${p}`)]),
  ];
  const walStart = wal(), calls = [];
  for (const [c, op] of plan) {
    const w0 = wal(), i0 = io(), t0 = performance.now();
    let ok = true, error = null;
    try { await op(); } catch (e) { ok = false; error = e?.code ?? String(e?.message ?? e); }
    const ms = performance.now() - t0, i1 = io();
    calls.push({ class: c, ok, ...(error ? { error } : {}), ms, io: { rchar: i1.rchar - i0.rchar, syscr: i1.syscr - i0.syscr, read_bytes: i1.read_bytes - i0.read_bytes }, walBefore: w0, walAfter: wal() });
  }
  // SQL counters from the trace, in call order (the fork's line first)
  const lines = readFileSync(trace, "utf8").split("\n").filter((l) => l.includes('"phase":"end"')).map((l) => JSON.parse(l)).filter((l) => l.method !== "branch.fork" && l.method !== "fs.mkdir");
  const sum = (s, k) => (s?.writer?.[k] ?? 0) + (s?.readers?.[k] ?? 0);
  lines.forEach((l, i) => { if (calls[i]) Object.assign(calls[i], { statements: sum(l.daemon?.[0]?.sql, "statements"), vmSteps: sum(l.daemon?.[0]?.sql, "vm_steps"), traceMs: l.ms }); });
  const threads = readdirSync("/proc/self/task").map((t) => { try { return readFileSync(`/proc/self/task/${t}/comm`, "utf8").trim(); } catch { return "?"; } });
  writeFileSync(out, JSON.stringify({ tag, load: { start: Number(load0), end: Number(readFileSync("/proc/loadavg", "utf8").split(" ")[0]) }, walStart, walEnd: wal(), calls, threads }));
}

// ---- the host command ----
function docker(args, opts = {}) { return execFileSync("docker", args, { encoding: "utf8", maxBuffer: 1 << 26, ...opts }); }
const volumeExists = (v) => docker(["volume", "ls", "-q"]).split("\n").includes(v);

async function main(argv) {
  if (argv[0] === "arm") {
    const o = (n) => argv[argv.indexOf(n) + 1];
    return arm({ out: o("--out"), reads: JSON.parse(readFileSync(o("--reads"), "utf8")), tag: o("--tag") });
  }
  const o = (n, d = null) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
  const { HISTORY, PREFIX, REPO, Run } = await import("./lib.mjs");
  const runId = o("--run"), k = Number(o("--range")), bSpec = o("--b", "live"), label = o("--label");
  if (!runId || !Number.isFinite(k)) { console.error("usage: control.mjs --run <id> --range N [--b live|snapshot:<range>[:<run>]] [--label <name>]"); return 2; }
  const run = new Run(join(HISTORY, "runs", runId)), env = run.manifest.env, image = env.LAYERFS_IMAGE;
  const snaps = join(HISTORY, "snapshots"), metrics = join(HISTORY, "metrics");
  const { manifestPath } = await import("./snapshot.mjs");
  const refManifest = manifestPath(snaps, REFERENCE.range, REFERENCE.run);
  const ref = JSON.parse(readFileSync(refManifest, "utf8"));
  const [, bRange, bRun] = /^snapshot:(\d+)(?::(.+))?$/.exec(bSpec) ?? [];
  const bManifest = bRange ? manifestPath(snaps, Number(bRange), bRun ?? runId) : null;
  const ckpt = bManifest ? JSON.parse(readFileSync(bManifest, "utf8")).tree : execFileSync("git", ["--git-dir", run.manifest.repo, "rev-parse", `${run.plan(k).checkpoint}^{tree}`], { encoding: "utf8" }).trim();
  const ls = (t) => execFileSync("git", ["--git-dir", run.manifest.repo, "ls-tree", "-r", "-l", t], { encoding: "utf8", maxBuffer: 1 << 28 });
  const reads = readSet(ls(ref.tree), ls(ckpt));
  // the sample belongs to the run's latest attempt at range k (a live Store), unless labelled (a diagnostic)
  const attempt = label ? null : Math.max(0, ...readdirSync(metrics).map((f) => new RegExp(`^range-${pad(k)}\\.a(\\d+)\\.json$`).exec(f)).filter(Boolean)
    .filter((x) => JSON.parse(readFileSync(join(metrics, x[0]), "utf8")).run === runId).map((x) => Number(x[1])));
  if (attempt === 0) { console.error(`run ${runId} has no metrics for range ${k}: play it first, or label a diagnostic`); return 2; }
  const name = label ?? `a${attempt}`;
  const out = join(metrics, `control-${pad(k)}.${name}.json`);
  if (existsSync(out)) { console.error(`${out} exists; a control sample is never replaced`); return 2; }
  const work = join(HISTORY, "control", `${pad(k)}.${name}`);
  execFileSync("mkdir", ["-p", work]);
  writeFileSync(join(work, "reads.json"), JSON.stringify(reads));
  const vols = { a: `${PREFIX}-control-a`, b: `${PREFIX}-control-b` };
  const macLoad = { start: loadavg()[0] };
  const t0 = Date.now(), arms = {};
  try {
    for (const [tag, v] of Object.entries(vols)) {
      if (volumeExists(v)) throw new Error(`volume ${v} exists (an earlier control did not finish): remove it by name first`);
      docker(["volume", "create", v]); run.note({ created: "volume", name: v, why: `control probe arm ${tag}, range ${k}` });
    }
    const fill = (v, manifest) => docker(["run", "--rm", "--network", "none", "-v", `${v}:/v`, "-v", `${snaps}:/s:ro`, "-v", `${here}:/t:ro`, "--entrypoint", "node", image, "/t/snapshot.mjs", "rebuild", "--manifest", `/s/${manifest.split("/").pop()}`, "--blocks", "/s/blocks", "--out", "/v/global/store.sqlite"]);
    fill(vols.a, refManifest);
    let liveBytes = null;
    if (bManifest) fill(vols.b, bManifest);
    else liveBytes = Number(docker(["run", "--rm", "--network", "none", "-v", `${env.LAYERFS_VOLUME}:/src:ro`, "-v", `${vols.b}:/v`, "--entrypoint", "sh", image, "-c", "mkdir -p /v/global && cp /src/global/store.sqlite* /v/global/ && stat -c %s /v/global/store.sqlite"]).trim());
    const fillMs = Date.now() - t0;
    for (const [tag, v] of Object.entries(vols)) {
      const file = join(work, `arm-${tag}.json`), sdk = env.LAYERFS_SDK_JS;
      docker(["run", "--rm", "--network", "none", "--name", `${PREFIX}-control`, "-v", `${REPO}:${REPO}:ro`, "-v", `${HISTORY}:${HISTORY}`,
        ...(sdk && !sdk.startsWith(`${REPO}/`) ? ["-v", `${sdk}:${sdk}:ro`] : []), "-v", `${v}:/layerfs-store`,
        ...Object.entries({ ...env, LAYERFS_STORE_PATH: STORE, HOME: process.env.HOME, LFS_CONTROL_PROJECT: run.manifest.project }).flatMap(([key, val]) => ["-e", `${key}=${val}`]),
        "--entrypoint", "node", image, join(here, "control.mjs"), "arm", "--out", file, "--reads", join(work, "reads.json"), "--tag", tag]);
      arms[tag] = JSON.parse(readFileSync(file, "utf8"));
    }
    macLoad.end = loadavg()[0];
    const size = (m) => m.size;
    const a = summarize(arms.a.calls), b = summarize(arms.b.calls);
    const result = {
      range: k, attempt, run: runId, label: label ?? null, taken: new Date().toISOString(), ms: Date.now() - t0, fillMs,
      binary: { daemon: env.LAYERFS_DAEMON, addon: env.LAYERFS_NATIVE, sdkJs: env.LAYERFS_SDK_JS, image },
      cache: "each arm a fresh volume written just before it (the copy's OS cache, both arms); no other warming",
      reads, hostLoad: { mac: macLoad, docker: { a: arms.a.load, b: arms.b.load } },
      arms: {
        a: { source: `snapshot ${refManifest.split("/").pop()}`, commits: ref.depth, bytes: size(ref), walStart: arms.a.walStart, walEnd: arms.a.walEnd, threads: arms.a.threads, classes: a },
        b: { source: bManifest ? `snapshot ${bManifest.split("/").pop()}` : `live volume ${env.LAYERFS_VOLUME}`, commits: bManifest ? JSON.parse(readFileSync(bManifest, "utf8")).depth : run.state?.depth?.commits ?? null,
          bytes: bManifest ? JSON.parse(readFileSync(bManifest, "utf8")).size : liveBytes, walStart: arms.b.walStart, walEnd: arms.b.walEnd, threads: arms.b.threads, classes: b },
      },
      ...compare(a, b),
    };
    writeFileSync(out, JSON.stringify(result, null, 1));
    console.log(JSON.stringify({ out, ms: result.ms, fillMs, watch: result.watch, per: result.per, a: Object.fromEntries(CLASSES.map((c) => [c, a[c].p50])), b: Object.fromEntries(CLASSES.map((c) => [c, b[c].p50])), macLoad }));
    return 0;
  } finally {
    for (const v of Object.values(vols)) {
      try { if (volumeExists(v)) { docker(["volume", "rm", v]); run.note({ removed: "volume", name: v }); } } catch (e) { console.error(`volume ${v} not removed: ${e.message}`); }
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2)).then((c) => process.exit(c ?? 0), (e) => { console.error(e.stack ?? e); process.exit(1); });
