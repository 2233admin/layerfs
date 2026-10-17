// The history replay's step library (#352 SCRIPTS.md §6): the calls a bash
// step's `run` may name, and the headless runner (run.mjs) calls directly.
//   setup(range)            the range's Sandbox, created once per range
//   step(range, id)         one plan step's file changes and reads, each outcome checked
//   consolidate(range, op)  the reconcile and the publish of the range's Branch
//   closure(range, what)    the range's unit tests in a one-shot Workspace
//   verify(range, full)     the proof checkpoint: changed paths, blob ids and modes
//   teardown()              closes every Sandbox of the run
// A run lives in its folder (LFS_RUN, under ~/lfs-history/runs/): run.json
// (its names, binaries and policy), state.json (where it is), ledger.jsonl
// (every Docker resource and folder it made, removed by literal name) and
// trace/. One attempt per call: no retry, no wait, no sleep. The first
// outcome that differs from the plan throws Mismatch, which ends the range.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BlobCache, diffTrees, lsTree } from "./git.mjs";
import { compareTree, IGNORE } from "./oracle.mjs";
import { compareResults, parseVitestJson, vitestCommand } from "./unit-tests.mjs";
import { INSTALL } from "./calibrate-tests.mjs";
import {
  abs, callOf, compareIds, comparePaths, idBatches, pad, parseTreePage, PHASES, phaseOps, PROBE_DIR, quote,
  route, sandboxCommands, sandboxExpect, sqlCounters, traceLines, Tree, TREE_IDS, TREE_PAGE,
} from "./steps.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(here, "../../..");
export const HISTORY = process.env.LFS_HISTORY ?? join(process.env.HOME, "lfs-history");
export class Mismatch extends Error {}

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 1));
  renameSync(`${file}.tmp`, file);
}
const docker = (args, opts = {}) => execFileSync("docker", args, { encoding: "utf8", maxBuffer: 1 << 26, ...opts }).trim();
/** The image's id as Docker has it, or null. */
export const imageId = (image) => { try { return docker(["image", "inspect", "--format", "{{.Id}}", image]); } catch { return null; } };

/** The binaries a run is pinned to: the daemon's and the native addon's SHA-256, the image id; and the source commit, for the record. */
export function binaries(env) {
  return {
    daemon: sha256(env.LAYERFS_DAEMON),
    sdk: sha256(env.LAYERFS_NATIVE ?? join(REPO, "sdk/js/native/layerfs.node")),
    image: imageId(env.LAYERFS_IMAGE),
    source: execFileSync("git", ["-C", REPO, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  };
}

/** One run: its folder, manifest, state and the SDK client that serves it. */
export class Run {
  constructor(dir) {
    this.dir = resolve(dir);
    this.manifest = readJson(join(this.dir, "run.json"));
    this.statePath = join(this.dir, "state.json");
    this.state = existsSync(this.statePath) ? readJson(this.statePath) : null;
    this.planDir = this.manifest.plan;
    this.repo = this.manifest.repo;
    this.calls = 0;
  }
  save() { writeJson(this.statePath, this.state); }
  /** Appends one created or removed resource to the run's ledger and the shared one. */
  note(entry) {
    const line = JSON.stringify({ at: new Date().toISOString(), run: this.manifest.run, ...entry }) + "\n";
    appendFileSync(join(this.dir, "ledger.jsonl"), line);
    mkdirSync(join(HISTORY, "ledger"), { recursive: true });
    appendFileSync(join(HISTORY, "ledger", "ledger.jsonl"), line);
  }
  plan(k) { return readJson(join(this.planDir, `range-${pad(k)}.json`)); }
  /** A fresh SDK client (after a seal, the old one's Sandboxes are closed). */
  async client() {
    Object.assign(process.env, this.manifest.env);
    const { LayerFS } = await import(join(REPO, "sdk/js/src/index.js"));
    const { LayerFSOperator } = await import(join(REPO, "sdk/js/operator/index.js"));
    this.lf = new LayerFS(this.manifest.project, { trace: this.trace ?? undefined });
    this.op = new LayerFSOperator(this.lf);
    this.sandbox = null;
    return this.lf;
  }
  /** Points the trace at `file` (null: off) and labels the next calls with `step`. */
  traceTo(file, step) {
    this.trace = file;
    if (this.lf) { this.lf.options.trace = file ?? undefined; this.lf.options.traceStep = step; }
  }
  label(step) { if (this.lf) this.lf.options.traceStep = step; }
  blobs() { return (this.blobCache ??= new BlobCache(this.repo)); }
  close() { this.blobCache?.close(); this.blobCache = null; }
  /** The container id of Sandbox `id`, from its record. */
  container(id) {
    try { return readFileSync(join(this.manifest.env.LAYERFS_HOME, "_sandboxes", id, "container"), "utf8").trim(); } catch { return null; }
  }
}

/** Checks a call's outcome against the plan; a refusal is its code. */
async function expectCall(run, label, work, want) {
  run.calls++;
  let got, value;
  try { value = await work(); got = value?.kind ?? "ok"; } catch (error) {
    if (!error?.code) throw error;
    got = error.code; value = { refused: error };
  }
  if (want && !want.split("|").includes(got)) throw new Mismatch(`${label}: answered ${got}, the plan has ${want}${value?.refused ? ` (${value.refused.message})` : ""}`);
  return value;
}

/** The range's Sandbox, created once (named by the run's container prefix) and recorded in the ledger. */
export async function setup(run) {
  if (run.sandbox) return run.sandbox;
  const id = `s${run.state.next}`;
  run.sandbox = await run.lf.sandbox.create(id, run.manifest.project, run.manifest.env.LAYERFS_IMAGE);
  run.note({ kind: "container", name: `${run.manifest.env.LAYERFS_CONTAINER_PREFIX}${id}`, id: run.container(id), sandbox: id });
  const service = `_service.${run.manifest.project}`;
  if (run.lf.sandboxes.has(service) && !run.state.serviceNoted) {
    run.note({ kind: "container", name: `${run.manifest.env.LAYERFS_CONTAINER_PREFIX}service.${run.manifest.project}`, id: run.container(service), sandbox: service });
    run.state.serviceNoted = true;
  }
  return run.sandbox;
}

/** One Sandbox step on `branch`: mount, the exec commands, Commit (checked), unmount. */
async function sandboxStep(run, branch, files, label, work) {
  const sb = await setup(run);
  const ws = await expectCall(run, `${label} mount`, () => run.lf.sandbox.mount(sb, branch));
  let committed = false;
  try {
    const bytes = await Promise.all(files.map((f) => run.blobs().get(f.blob)));
    for (const command of sandboxCommands(files.map((f, i) => ({ path: f.path, mode: f.mode, bytes: bytes[i] })))) {
      const r = await expectCall(run, `${label} exec`, () => run.lf.sandbox.exec(sb, ws, command));
      if (r.exitCode !== 0) throw new Mismatch(`${label} exec exited ${r.exitCode}: ${String(r.stderr ?? "").slice(0, 300)}`);
    }
    const want = sandboxExpect(files);
    await expectCall(run, `${label} commit`, () => run.lf.sandbox.commit(sb, ws, label), want);
    committed = true;
    work.sandbox += files.length;
    if (want === "Committed") work.commits++;
  } finally {
    await run.lf.sandbox.unmount(sb, ws, !committed);
  }
}

/** One op's fs calls (and its Sandbox step) on `branch`, each outcome checked. */
async function writeOp(run, branch, files, tree, label, work) {
  const { calls, sandbox } = route(files, tree);
  for (const c of calls) {
    const msg = `${label} ${c.path}`.slice(0, 200);
    if (c.call === "rm") await expectCall(run, `${label} rm ${c.path}`, () => run.lf.fs.rm(branch, abs(c.target), msg), c.expect);
    else {
      const bytes = await run.blobs().get(c.blob);
      if (c.call === "write") await expectCall(run, `${label} write ${c.path}`, () => run.lf.fs.write(branch, abs(c.path), bytes, msg), c.expect);
      else await expectCall(run, `${label} write ${c.path}`, () => run.lf.fs.apply(branch, [{ op: "mkdir", path: abs(c.parent) }, { op: "write", path: abs(c.path), bytes }], msg), c.expect);
    }
    work.fs++;
    if (c.expect === "Committed") work.commits++;
  }
  if (sandbox.length) await sandboxStep(run, branch, sandbox, label, work);
}

/** The read samples of a plan step (SPEC §3c): each must answer, or be Binary. */
async function reads(run, branch, step, tree) {
  for (const r of step.reads) {
    if (r.kind !== "list" && r.kind !== "grep" && r.kind !== "glob" && !tree.has(r.path)) continue;
    if ((r.kind === "list" || r.kind === "grep" || r.kind === "glob") && !tree.isDir(r.path === "/" ? "" : r.path)) continue;
    const p = abs(r.path === "/" ? "" : r.path);
    const call = { stat: () => run.lf.fs.stat(branch, p), read: () => run.lf.fs.read(branch, p, 1, 50), list: () => run.lf.fs.list(branch, p, 50, 0),
      grep: () => run.lf.fs.grep(branch, r.pattern, p, 20, 0), glob: () => run.lf.fs.glob(branch, r.pattern, p, 20, 0),
      diff_files: () => run.lf.fs.diff_files(branch, p, r.right ?? "main", p) }[r.kind];
    const v = await expectCall(run, `${step.id} ${r.kind} ${p}`, call);
    const code = v?.refused?.code;
    if (code && !(code === "Binary" || (r.kind === "diff_files" && code === "NoSuchPath"))) throw new Mismatch(`${step.id} ${r.kind} ${p}: refused ${code}`);
  }
}

/** Plays one plan step (SCRIPTS.md §6 `step`) in the run's phase. */
export async function step(run, k, id, ctx) {
  const op = ctx.ops.find((o) => o.id === id);
  if (!op) throw new Error(`r${pad(k)}: no step ${id} in phase ${run.manifest.phase}`);
  run.label(id);
  await writeOp(run, ctx.branch, op.files, ctx.tree, id, ctx.work);
  if (ctx.measured) await reads(run, ctx.branch, op, ctx.tree);
}

/** The lead's consolidation (one lane: the reconcile on the range's Branch, then its publish). */
export async function consolidate(run, k, what, ctx) {
  const label = `r${pad(k)}.${what}`;
  run.label(label);
  if (what === "reconcile") {
    if (ctx.reconcile.length) await writeOp(run, ctx.branch, ctx.reconcile, ctx.tree, label, ctx.work);
    return null;
  }
  if (what === "publish") return expectCall(run, label, () => run.lf.branch.publish(ctx.branch), "Added");
  throw new Error(`no consolidation ${what}`);
}

/** The Workspace check: blob ids and modes of `paths` (or the whole tree) of `ref`, read in one Sandbox. */
async function readIds(run, ref, paths, label) {
  const sb = await setup(run);
  const branch = `chk-${label}`;
  await expectCall(run, `${label} fork`, () => run.lf.branch.fork(branch, ref), "Forked");
  const ws = await expectCall(run, `${label} mount`, () => run.lf.sandbox.mount(sb, branch));
  const out = new Map();
  try {
    if (paths) {
      for (const batch of idBatches(paths)) {
        const r = await run.lf.sandbox.exec(sb, ws, `node -e ${quote(BLOB_IDS)} ${batch.map((p) => quote(p)).join(" ")}`);
        if (r.exitCode !== 0 || r.truncated) throw new Mismatch(`${label} blob ids exited ${r.exitCode}${r.truncated ? " (truncated)" : ""}: ${String(r.stderr ?? "").slice(0, 300)}`);
        for (const line of String(r.stdout).split("\n").filter(Boolean)) {
          const m = /^(100644|100755|120000|missing) ([0-9a-f]{40}|-) (.*)$/.exec(line);
          if (m && m[1] !== "missing") out.set(m[3], { mode: m[1], blob: m[2] });
        }
      }
    } else {
      const skip = IGNORE.map((i) => i.replace(/\/$/, ""));
      for (let from = 0, total = Infinity; from < total; from += TREE_PAGE) {
        const r = await run.lf.sandbox.exec(sb, ws, `node -e ${quote(TREE_IDS)} ${from} ${TREE_PAGE} ${skip.map(quote).join(" ")}`);
        if (r.exitCode !== 0 || r.truncated) throw new Mismatch(`${label} tree walk exited ${r.exitCode}${r.truncated ? " (truncated)" : ""}: ${String(r.stderr ?? "").slice(0, 300)}`);
        const page = parseTreePage(r.stdout);
        for (const [p, v] of page.files) out.set(p, v);
        total = page.total;
      }
    }
  } finally {
    await run.lf.sandbox.unmount(sb, ws, true);
  }
  return out;
}

// Prints "<mode> <blob> <path>" for each path argument (relative to the Workspace), "missing - <path>" when absent.
const BLOB_IDS = `const fs=require("fs"),c=require("crypto");for(const p of process.argv.slice(1)){let s;try{s=fs.lstatSync(p)}catch{process.stdout.write("missing - "+p+"\\n");continue}let b,m;if(s.isSymbolicLink()){b=Buffer.from(fs.readlinkSync(p));m="120000"}else{b=fs.readFileSync(p);m=s.mode&0o111?"100755":"100644"}process.stdout.write(m+" "+c.createHash("sha1").update("blob "+b.length+"\\0").update(b).digest("hex")+" "+p+"\\n")}`;

/**
 * The proof checkpoint (SPEC §7): diff_commits between the previous
 * checkpoint's head Commit and this one lists exactly the paths git changed
 * (diff_commits takes saved Commits, not Layers; the first range's base is
 * the probe fixture's Commit, which holds Init's tree plus ignored paths), and
 * each changed file has git's blob id and mode. With `full`, the whole tree
 * is compared too (compareTree), as at every snapshot.
 */
export async function verify(run, k, { prevHead, head, layer, prevCommit, full }) {
  const plan = run.plan(k);
  run.label(`r${pad(k)}.verify`);
  const changes = diffTrees(run.repo, prevCommit, plan.checkpoint);
  const items = [];
  for (let pos = 0; ;) {
    const page = await run.lf.branch.diff_commits(prevHead, head, 1000, pos);
    items.push(...page.items);
    if (!page.hasMore) break;
    pos += page.items.length;
  }
  const paths = comparePaths(items, changes, IGNORE);
  const expected = lsTree(run.repo, plan.checkpoint).files;
  const present = [...changes.filter((c) => !c.gitlink && c.mode !== "000000").map((c) => c.path), ...paths.metadataOnly];
  const ids = compareIds(present, present.length ? await readIds(run, layer, present, `r${pad(k)}-ids`) : new Map(), expected);
  const tree = full ? compareTree(expected, await readIds(run, layer, null, `r${pad(k)}-tree`)) : null;
  return { ok: paths.ok && ids.ok && (!tree || tree.ok), paths, ids, tree };
}

/**
 * The range's unit tests (SPEC §2, Tests) in a one-shot Workspace on a fork
 * of main: an offline install, then one vitest run of the calibrated files,
 * each compared with its native result. A range without its calibration
 * (tests-NNN.json) is refused, never run without its tests.
 */
export async function closure(run, k, what, { layer }) {
  if (what !== "tests") throw new Error(`no closure ${what}`);
  const file = join(run.planDir, `tests-${pad(k)}.json`);
  if (!existsSync(file)) throw new Error(`range ${k} has no calibration (${file}); run calibrate-tests.mjs --from ${k} --to ${k} first`);
  const cal = readJson(file);
  if (!cal.run.length) return { equal: 0, run: 0, differ: [], skipped: cal.skipped.length };
  const sb = await setup(run), branch = `tests-r${pad(k)}`;
  run.label(`r${pad(k)}.tests`);
  await expectCall(run, `r${pad(k)} tests fork`, () => run.lf.branch.fork(branch, layer), "Forked");
  const ws = await expectCall(run, `r${pad(k)} tests mount`, () => run.lf.sandbox.mount(sb, branch));
  try {
    if (cal.install) {
      const i = await run.lf.sandbox.exec(sb, ws, INSTALL);
      if (i.exitCode !== 0) throw new Mismatch(`r${pad(k)} install exited ${i.exitCode}: ${String(i.stderr ?? "").slice(0, 300)}`);
    }
    const r = await run.lf.sandbox.exec(sb, ws, vitestCommand(cal.run));
    const root = String((await run.lf.sandbox.exec(sb, ws, "pwd")).stdout).trim();
    return { ...compareResults(cal.run, parseVitestJson(String(r.stdout), root)), skipped: cal.skipped.length };
  } finally {
    await run.lf.sandbox.unmount(sb, ws, true);
  }
}

/** Closes every Sandbox the client opened (the range's and the service), recording each. */
export async function teardown(run) {
  if (!run.lf) return [];
  const problems = [];
  for (const id of [...run.lf.sandboxes]) {
    try { await run.lf.sandbox.close(id); run.note({ kind: "sandbox", name: id, removed: true }); } catch (e) { problems.push(`close ${id}: ${e.code ?? ""} ${e.message}`); }
  }
  run.sandbox = null;
  return problems;
}

/** The probe fixture (SPEC §3c): a 2 KiB file, a 5-entry folder and two 8 KiB files, in one Commit. */
export function probeFixture() {
  const text = (seed, n) => Array.from({ length: Math.ceil(n / 64) }, (_, i) => `${seed} line ${String(i).padStart(4, "0")} probe ${"x".repeat(36)}\n`).join("").slice(0, n);
  return [
    { op: "mkdir", path: `/${PROBE_DIR}/dir` },
    { op: "write", path: `/${PROBE_DIR}/small.txt`, content: text("small", 2048) },
    ...[1, 2, 3, 4, 5].map((i) => ({ op: "write", path: `/${PROBE_DIR}/dir/${i}.txt`, content: text(`entry ${i}`, 512) })),
    { op: "write", path: `/${PROBE_DIR}/a.txt`, content: text("left", 8192) },
    { op: "write", path: `/${PROBE_DIR}/b.txt`, content: `${text("left", 4096)}${text("right", 4096)}` },
  ];
}

/**
 * The scale probes (SPEC §3c) on main after the publish, each one call or one
 * fixed sequence, labelled `probe:<name>` in the trace so its ms and SQL
 * counters can be read back. A publish probe would change main, so it is not run.
 */
export async function probes(run, k, { branch, tree }) {
  const lf = run.lf, r = `r${pad(k)}`, P = `/${PROBE_DIR}`;
  const big = tree.largestDir();
  const sb = await setup(run);
  const list = [
    ["stat", () => lf.fs.stat("main", `${P}/small.txt`)],
    ["read", () => lf.fs.read("main", `${P}/small.txt`, 1, 50)],
    ["list_small", () => lf.fs.list("main", `${P}/dir`, 50, 0)],
    ["list_largest", () => lf.fs.list("main", abs(big.dir), 1000, 0)],
    ["grep_scoped", () => lf.fs.grep("main", "probe", `${P}/dir`, 50, 0)],
    ["glob_scoped", () => lf.fs.glob("main", "*.txt", `${P}/dir`, 50, 0)],
    ["grep_tree", () => lf.fs.grep("main", "LFS352_NEVER_PRESENT", "/", 50, 0)],
    ["glob_tree", () => lf.fs.glob("main", "**/*.md", "/", 50, 0)],
    ["diff_files", () => lf.fs.diff_files("main", `${P}/a.txt`, "main", `${P}/b.txt`)],
    ["list_commits", () => lf.branch.list_commits(branch, 20, 0)],
    ["diff_commits", async () => { const c = (await lf.branch.list_commits(branch, 2, 0)).items; return c.length === 2 ? lf.branch.diff_commits(c[1].id, c[0].id, 50, 0) : null; }],
    ["fork", () => lf.branch.fork(`probe-${r}`, "main")],
    ["merge", async () => {
      await lf.branch.fork(`probe-${r}-a`, "main"); await lf.branch.fork(`probe-${r}-b`, "main");
      await lf.fs.apply(`probe-${r}-a`, [{ op: "mkdir", path: `${P}/m` }, { op: "write", path: `${P}/m/a1.txt`, content: `a1 ${r}\n` }, { op: "write", path: `${P}/m/a2.txt`, content: `a2 ${r}\n` }], "probe a");
      await lf.fs.apply(`probe-${r}-b`, [{ op: "mkdir", path: `${P}/m` }, { op: "write", path: `${P}/m/b1.txt`, content: `b1 ${r}\n` }, { op: "write", path: `${P}/m/b2.txt`, content: `b2 ${r}\n` }], "probe b");
      return lf.branch.merge(`probe-${r}-a`, `probe-${r}-b`, `probe-${r}-m`, "probe merge");
    }],
    ["oneshot_mount_exec", async () => { const ws = await lf.sandbox.mount(sb, `probe-${r}`); await lf.sandbox.exec(sb, ws, "true"); return lf.sandbox.unmount(sb, ws, true); }],
    ["oneshot_commit", async () => {
      const ws = await lf.sandbox.mount(sb, `probe-${r}`);
      await lf.sandbox.exec(sb, ws, `mkdir -p ${PROBE_DIR}/c && head -c 2048 /dev/zero | tr '\\0' p > ${PROBE_DIR}/c/one.txt`);
      const c = await lf.sandbox.commit(sb, ws, "probe commit");
      await lf.sandbox.unmount(sb, ws, false);
      return c;
    }],
  ];
  const out = {};
  for (const [name, f] of list) {
    run.label(`probe:${name}`);
    const t0 = performance.now();
    try { await f(); out[name] = { ms: +(performance.now() - t0).toFixed(3) }; } catch (e) { out[name] = { ms: null, error: `${e.code ?? ""} ${e.message}`.slice(0, 200) }; }
  }
  return out;
}

/** Reads a range's trace file: the latency rows' input, and each probe's SQL counters. */
export function readTrace(file) {
  const lines = existsSync(file) ? traceLines(readFileSync(file, "utf8")) : [];
  const calls = lines.filter((l) => !String(l.step ?? "").startsWith("probe:")).map(callOf);
  const probe = {};
  for (const l of lines.filter((x) => String(x.step ?? "").startsWith("probe:"))) {
    const name = l.step.slice(6), c = sqlCounters(l);
    probe[name] ??= {};
    for (const [key, n] of Object.entries(c)) probe[name][key] = (probe[name][key] || 0) + n;
  }
  return { calls, probe, lines: lines.length };
}

export { PHASES, phaseOps, Tree };
