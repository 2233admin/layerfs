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
import { loadavg } from "node:os";
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BlobCache, diffTrees, lsTree } from "./git.mjs";
import { compareTree, IGNORE } from "./oracle.mjs";
import { compareResults, parseVitestJson, vitestCommand } from "./unit-tests.mjs";
import { INSTALL } from "./calibrate-tests.mjs";
import { CLOSURE_OUTPUT, sandboxVolumes } from "./closure.mjs";
import {
  abs, attributeFuse, callOf, changedDirs, compareIds, comparePaths, idBatches, pad, parseTreePage, PHASES, phaseOps, PROBE_DIR, quote,
  deltaWork, markContention, placeEntries, route, sameAsTree, sandboxCommands, sandboxExpect, sqlCounters, traceLines, Tree, TREE_IDS, TREE_PAGE,
} from "./steps.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(here, "../../..");
export const PNPM_STORE = "layerfs-issue352-pnpm-store";
export const HISTORY = process.env.LFS_HISTORY ?? join(process.env.HOME, "lfs-history");
export class Mismatch extends Error {}

export const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 1));
  renameSync(`${file}.tmp`, file);
}
const docker = (args, opts = {}) => execFileSync("docker", args, { encoding: "utf8", maxBuffer: 1 << 26, ...opts }).trim();
/** The image's id as Docker has it, or null. */
export const imageId = (image) => { try { return docker(["image", "inspect", "--format", "{{.Id}}", image]); } catch { return null; } };

/**
 * The SDK JavaScript a run loads, for the record: its folder and one SHA-256
 * over its src/ and operator/ files (path and bytes, sorted), which needs no
 * git (the runner mounts only the folder).
 */
export function sdkJsFacts(dir) {
  const h = createHash("sha256");
  const walk = (d) => readdirSync(d, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1)).forEach((e) => {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.isFile()) h.update(`${p.slice(dir.length)}\0`).update(readFileSync(p));
  });
  for (const sub of ["src", "operator"]) if (existsSync(join(dir, sub))) walk(join(dir, sub));
  return { dir, sha256: h.digest("hex") };
}

/** The binaries a run is pinned to: the daemon's and the native addon's SHA-256, the image id; and the source commit, for the record. */
export function binaries(env) {
  return {
    daemon: sha256(env.LAYERFS_DAEMON),
    sdk: sha256(env.LAYERFS_NATIVE ?? join(REPO, "sdk/js/native/layerfs.node")),
    sdkJs: sdkJsFacts(env.LAYERFS_SDK_JS ?? join(REPO, "sdk/js")),
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
    // shared by the agents' views of this run (agent()): the call count and the call log
    this.tally = { calls: 0 };
    this.sink = { seq: 0, log: [] };
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
    const sdk = this.manifest.env.LAYERFS_SDK_JS ?? join(REPO, "sdk/js");
    const { LayerFS } = await import(join(sdk, "src/index.js"));
    const { LayerFSOperator } = await import(join(sdk, "operator/index.js"));
    this.LayerFS = LayerFS;
    this.raw = new LayerFS(this.manifest.project, { trace: this.trace ?? undefined });
    this.clients = [this.raw];
    this.rec = { label: undefined, next: null, tree: null, agent: "lead" };
    this.lf = record(this.raw, this.rec, this.sink);
    this.op = new LayerFSOperator(this.raw);
    this.sandbox = null;
    this.pool = [];
    return this.lf;
  }
  /**
   * Another actor's view of this run (P2): its own SDK client, so its trace
   * labels never mix with a concurrent actor's, Store calls in this process
   * (the process's one Store, F-020), Workspaces in `sandbox`; the call count
   * and log shared.
   */
  async agent(name, sandbox) {
    const a = Object.create(this);
    a.raw = new this.LayerFS(this.manifest.project, { trace: this.trace ?? undefined });
    this.clients.push(a.raw);
    a.rec = { label: undefined, next: null, tree: null, agent: name };
    a.lf = record(a.raw, a.rec, this.sink);
    a.sandbox = sandbox;
    a.blobs = () => this.blobs();
    return a;
  }
  /** Points the trace at `file` (null: off) and labels the next calls with `step`. */
  traceTo(file, step) {
    this.trace = file;
    if (this.raw) this.raw.options.trace = file ?? undefined;
    if (this.rec) this.rec.label = step;
  }
  label(step) { if (this.rec) this.rec.label = step; }
  blobs() { return (this.blobCache ??= new BlobCache(this.repo)); }
  close() { this.blobCache?.close(); this.blobCache = null; }
  /** The container id of Sandbox `id`, from its record. */
  container(id) {
    try { return readFileSync(join(this.manifest.env.LAYERFS_HOME, "_sandboxes", id, "container"), "utf8").trim(); } catch { return null; }
  }
}

const byteLength = (x) => (x == null ? 0 : typeof x === "string" ? Buffer.byteLength(x) : x.length ?? 0);
const jsonBytes = (v) => { try { return v == null ? 0 : Buffer.byteLength(typeof v === "string" ? v : JSON.stringify(v)); } catch { return 0; } };
const READ_INPUT = { "fs.read": "bytes", "fs.stat": "bytes", "fs.diff_files": "bytes", "fs.blame": "bytes" };

/**
 * One call's input and output as the replay sees it (SPEC §3c, the size
 * class of its own input): bytes in (content, an exec's command), bytes out
 * (a read's answer, an exec's output), files or entries touched, and the
 * size its latency is classed by. `size` is the caller's own measure (the
 * files a Sandbox Commit changes, the entries a merge brings) when it set one.
 */
export function measure(method, args, value, tree, size) {
  const out = { bytesIn: 0, bytesOut: 0, files: 0, size: size ?? null };
  const items = Array.isArray(value?.items) ? value.items.length : null;
  switch (method) {
    case "fs.write": out.bytesIn = byteLength(args[2]); out.files = 1; out.size ??= { kind: "bytes", n: out.bytesIn }; break;
    case "fs.edit": out.bytesIn = byteLength(args[3]); out.files = 1; out.size ??= { kind: "bytes", n: out.bytesIn }; break;
    case "fs.apply": {
      const changes = Array.isArray(args[1]) ? args[1] : [];
      out.bytesIn = changes.reduce((n, c) => n + byteLength(c?.bytes ?? c?.content ?? c?.newText), 0);
      out.files = changes.filter((c) => c?.op !== "mkdir").length;
      out.size ??= { kind: "bytes", n: out.bytesIn };
      break;
    }
    case "fs.rm": case "fs.mkdir": case "fs.cp": case "fs.mv": out.files = 1; out.size ??= { kind: "files", n: 1 }; break;
    case "fs.list": case "branch.diff_commits": case "branch.diff_branches": case "branch.list_commits":
      out.bytesOut = jsonBytes(value); out.files = items ?? 0; out.size ??= items == null ? null : { kind: "entries", n: items }; break;
    case "fs.grep": case "fs.glob": {
      out.bytesOut = jsonBytes(value); out.files = items ?? 0;
      const scope = tree?.filesUnder(args[2] ?? "/");
      out.size ??= scope == null ? null : { kind: "files", n: scope };
      break;
    }
    case "sandbox.exec":
      out.bytesIn = byteLength(args[2]); out.bytesOut = byteLength(value?.stdout) + byteLength(value?.stderr);
      if (Number.isInteger(value?.exitCode)) out.exit = value.exitCode;
      break;
    default:
      if (READ_INPUT[method]) {
        out.bytesOut = jsonBytes(value); out.files = value ? 1 : 0;
        out.size ??= { kind: "bytes", n: method === "fs.stat" && Number.isFinite(value?.size) ? value.size : out.bytesOut };
      }
  }
  return out;
}

/**
 * The run's SDK client with every call recorded (seq, method, actor, step
 * label, outcome, measure()) in `sink.log`. Each call's trace label is
 * `<step>#<seq>`, so the trace line joins its record exactly.
 */
export function record(raw, rec, sink) {
  const wrap = (group) => Object.fromEntries(Object.entries(raw[group]).map(([name, fn]) => [name, async (...args) => {
    const seq = ++sink.seq, method = `${group}.${name}`, size = rec.next;
    rec.next = null;
    raw.options.traceStep = `${rec.label ?? ""}#${seq}`;
    const entry = { seq, method, label: rec.label ?? null, agent: rec.agent };
    sink.log.push(entry);
    try {
      const value = await fn(...args);
      Object.assign(entry, { kind: value?.kind ?? "ok", ...(value?.fastForward === false ? { newCommit: true } : {}) }, measure(method, args, value, rec.tree, size));
      return value;
    } catch (error) {
      Object.assign(entry, { kind: error?.code ?? "error" }, measure(method, args, null, rec.tree, size));
      throw error;
    }
  }]));
  return { raw, options: raw.options, sandboxes: raw.sandboxes, service: () => raw.service(), fs: wrap("fs"), branch: wrap("branch"), sandbox: wrap("sandbox"), project: wrap("project") };
}

/** Checks a call's outcome against the plan; a refusal is its code. */
export async function expectCall(run, label, work, want) {
  run.tally.calls++;
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
  // P3 (INSTALLS §3.1): the pnpm store volume, read-only, outside every Workspace
  const extra = PHASES[run.manifest.phase]?.closure ? [sandboxVolumes(run.manifest.env.LAYERFS_PNPM_STORE ?? PNPM_STORE)] : [];
  run.sandbox = await run.lf.sandbox.create(id, run.manifest.project, run.manifest.env.LAYERFS_IMAGE, ...extra);
  run.note({ kind: "container", name: `${run.manifest.env.LAYERFS_CONTAINER_PREFIX}${id}`, id: run.container(id), sandbox: id });
  const service = `_service.${run.manifest.project}`;
  if (run.lf.sandboxes.has(service) && !run.state.serviceNoted) {
    run.note({ kind: "container", name: `${run.manifest.env.LAYERFS_CONTAINER_PREFIX}service.${run.manifest.project}`, id: run.container(service), sandbox: service });
    run.state.serviceNoted = true;
  }
  return run.sandbox;
}

/** Counts one file mutation (SPEC §3b): added, modified or deleted, with its bytes, by route. */
export function countMutation(work, via, f) {
  work.mutations ??= { fs: { added: 0, modified: 0, deleted: 0, bytes: 0 }, sandbox: { added: 0, modified: 0, deleted: 0, bytes: 0 } };
  const m = work.mutations[via];
  if (f.op === "rm" || f.call === "rm") m.deleted++;
  else { if (f.previous) m.modified++; else m.added++; m.bytes += f.size ?? 0; }
}

/**
 * The exec commands that put `files` (writes with blob ids, decoys with bytes, removals) in a Workspace.
 * Each call has its own scratch folder in the Sandbox's /tmp: from P3 several agents share one Sandbox
 * (shared pool), so a common /tmp/lfs352 was removed under a concurrent step (dev352-p3a, r015.s0023).
 */
let scratchSeq = 0;
export const scratchDir = () => `/tmp/lfs352-${process.pid}-${++scratchSeq}`;
export async function placeCommands(run, files) {
  const bytes = await Promise.all(files.map((f) => (f.op === "rm" || sameAsTree(f) ? null : f.bytes ?? run.blobs().get(f.blob))));
  return sandboxCommands(placeEntries(files, bytes), scratchDir());
}

/**
 * Runs exec commands in a Workspace; each must exit 0. When one fails (exit or error) and the commands
 * carry a scratch folder (sandboxCommands), one cleanup exec removes it, so a long-lived shared Sandbox
 * does not accumulate /tmp/lfs352-* folders (lead, 2026-10-18). The original failure is rethrown;
 * a failed cleanup is appended to its message.
 */
export async function execAll(run, sb, ws, commands, label, files = 0) {
  const results = [];
  try {
    for (const command of commands) {
      run.rec.next = { kind: "files", n: files };
      const r = await expectCall(run, `${label} exec`, () => run.lf.sandbox.exec(sb, ws, command));
      if (r.refused) throw new Mismatch(`${label} exec refused: ${r.refused.code ?? ""} ${String(r.refused.message ?? "").slice(0, 300)}`);
      if (r.exitCode !== 0) throw new Mismatch(`${label} exec exited ${r.exitCode}: ${String(r.stderr ?? "").slice(0, 300)}`);
      results.push(r);
    }
    return results;
  } catch (error) {
    if (commands.scratch) {
      try {
        const r = await expectCall(run, `${label} scratch cleanup`, () => run.lf.sandbox.exec(sb, ws, `rm -rf ${commands.scratch}`));
        if (r.exitCode !== 0) error.message += `; scratch cleanup exited ${r.exitCode}`;
      } catch (c) { error.message += `; scratch cleanup failed: ${c.code ?? ""} ${c.message}`; }
    }
    throw error;
  }
}

/** One Sandbox step on `branch`: mount, the exec commands, Commit (checked), unmount. */
export async function sandboxStep(run, branch, files, label, work) {
  const sb = await setup(run);
  const ws = await expectCall(run, `${label} mount`, () => run.lf.sandbox.mount(sb, branch));
  let committed = false;
  try {
    await execAll(run, sb, ws, await placeCommands(run, files), label, files.length);
    const want = sandboxExpect(files);
    run.rec.next = { kind: "files", n: files.length };
    await expectCall(run, `${label} commit`, () => run.lf.sandbox.commit(sb, ws, label), want);
    committed = true;
    work.sandbox += files.length;
    for (const f of files) countMutation(work, "sandbox", f);
    if (want === "Committed") work.commits++;
  } finally {
    await run.lf.sandbox.unmount(sb, ws, !committed);
  }
}

/** One op's fs calls (and its Sandbox step) on `branch`, each outcome checked. */
export async function writeOp(run, branch, files, tree, label, work, options = {}) {
  const { calls, sandbox } = route(files, tree, options);
  for (const c of calls) {
    const msg = `${label} ${c.path}`.slice(0, 200);
    if (c.call === "rm") await expectCall(run, `${label} rm ${c.path}`, () => run.lf.fs.rm(branch, abs(c.target), msg), c.expect);
    else {
      const bytes = await run.blobs().get(c.blob);
      if (c.call === "write") await expectCall(run, `${label} write ${c.path}`, () => run.lf.fs.write(branch, abs(c.path), bytes, msg), c.expect);
      else await expectCall(run, `${label} write ${c.path}`, () => run.lf.fs.apply(branch, [{ op: "mkdir", path: abs(c.parent) }, { op: "write", path: abs(c.path), bytes }], msg), c.expect);
    }
    work.fs++;
    countMutation(work, "fs", c);
    if (c.expect === "Committed") work.commits++;
  }
  if (sandbox.length) await sandboxStep(run, branch, sandbox, label, work);
}

/** The read samples of a plan step (SPEC §3c): each must answer, or be Binary. */
export async function reads(run, branch, step, tree) {
  run.rec.tree = tree;
  for (const r of step.reads ?? []) {
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
  const op = (ctx.byId ??= new Map(ctx.ops.map((o) => [o.id, o]))).get(id);
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
export const BLOB_IDS = `const fs=require("fs"),c=require("crypto");for(const p of process.argv.slice(1)){let s;try{s=fs.lstatSync(p)}catch{process.stdout.write("missing - "+p+"\\n");continue}let b,m;if(s.isSymbolicLink()){b=Buffer.from(fs.readlinkSync(p));m="120000"}else{b=fs.readFileSync(p);m=s.mode&0o111?"100755":"100644"}process.stdout.write(m+" "+c.createHash("sha1").update("blob "+b.length+"\\0").update(b).digest("hex")+" "+p+"\\n")}`;

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
  // F-010: each page resumes at the previous page's nextCursor; paths and kinds only, no line hunks
  for (let cursor = null; ;) {
    const page = await run.lf.branch.diff_commits(prevHead, head, 1000, 0, { ...(cursor ? { cursor } : {}), hunks: false });
    items.push(...page.items);
    if (!page.hasMore) break;
    if (!page.nextCursor || page.nextCursor === cursor) throw new Error(`diff_commits answered hasMore without a new nextCursor (${cursor ?? "first page"})`);
    cursor = page.nextCursor;
  }
  const outputs = PHASES[run.manifest.phase]?.closure ? CLOSURE_OUTPUT : null;
  const paths = comparePaths(items, changes, IGNORE, outputs);
  const expected = lsTree(run.repo, plan.checkpoint).files;
  const present = [...changes.filter((c) => !c.gitlink && c.mode !== "000000").map((c) => c.path), ...paths.metadataOnly];
  const ids = compareIds(present, present.length ? await readIds(run, layer, present, `r${pad(k)}-ids`) : new Map(), expected);
  const tree = full ? compareTree(expected, await readIds(run, layer, null, `r${pad(k)}-tree`), IGNORE, outputs) : null;
  return { ok: paths.ok && ids.ok && (!tree || tree.ok), paths, ids, tree, changedDirs: changedDirs(items.map((i) => i.path)), items };
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

/**
 * Health of every Sandbox of the run (SPEC §5, F-006): overlay files left in
 * each daemon's overlay folder (numbered `<n>.sqlite`; the template
 * `overlay.sqlite` is not one), the daemons' resident memory and open files,
 * summed. One `docker exec` per Sandbox, at once.
 */
export async function sandboxHealth(run) {
  const { execFile } = await import("node:child_process");
  const one = (container) => new Promise((resolve) => execFile("docker", ["exec", container, "sh", "-c",
    "n=$(ls /layerfs-local/overlay 2>/dev/null | grep -cE '^[0-9]+\\.sqlite$'); r=$(awk '/VmRSS/{print $2}' /proc/1/status); f=$(ls /proc/1/fd | wc -l); echo $n $r $f"],
  { encoding: "utf8" }, (error, out) => resolve(error ? null : out.trim().split(/\s+/).map(Number))));
  const ids = [...(run.lf?.sandboxes ?? [])];
  const got = await Promise.all(ids.map((id) => run.container(id)).filter(Boolean).map(one));
  const ok = got.filter(Boolean);
  if (!ok.length) return null;
  return { sandboxes: ok.length, of: ids.length, overlaysLeft: ok.reduce((n, x) => n + x[0], 0), daemonRssMb: +(ok.reduce((n, x) => n + x[1], 0) / 1024).toFixed(1), openFiles: ok.reduce((n, x) => n + x[2], 0) };
}

/** Closes every Sandbox the client opened (the range's and the service), recording each. */
export async function teardown(run) {
  if (!run.lf) return [];
  const problems = [];
  const close = async (id) => {
    try { await run.lf.sandbox.close(id); run.note({ kind: "sandbox", name: id, removed: true }); } catch (e) { problems.push(`close ${id}: ${e.code ?? ""} ${e.message}`); }
  };
  // Named Sandboxes close at once (each takes only its own lock); the service, which also takes the project's, last.
  const ids = [...run.lf.sandboxes], service = ids.filter((id) => id.startsWith("_service."));
  await Promise.all(ids.filter((id) => !service.includes(id)).map(close));
  for (const id of service) await close(id);
  run.sandbox = null;
  run.pool = [];
  // then the Store: the process's last client closes it (a seal checkpoints the file next)
  for (const c of run.clients ?? []) {
    try { await c.close(); } catch (e) { problems.push(`close Store: ${e.code ?? ""} ${e.message}`); }
  }
  run.clients = [];
  return problems;
}

/** The probe fixture (SPEC §3c): a 2 KiB file, a 5-entry folder and two 8 KiB files, in one Commit. */
/** `n` bytes of probe text lines seeded by `seed` (a fixed size whatever the seed's length, up to 20 characters). */
export const probeText = (seed, n) => Array.from({ length: Math.ceil(n / 64) }, (_, i) => `${seed.padEnd(20).slice(0, 20)} line ${String(i).padStart(4, "0")} probe ${"x".repeat(20)}\n`).join("").slice(0, n);

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
  run.rec.tree = tree;
  const list = [
    // `input` (F-014): the probe's input size, recorded so the gate fits only points with the same input (SPEC §3c)
    ["stat", () => lf.fs.stat("main", `${P}/small.txt`), { input: (v) => ({ bytes: v.size }) }],
    ["read", () => lf.fs.read("main", `${P}/small.txt`, 1, 50), { setup: () => lf.fs.stat("main", `${P}/small.txt`), input: (v, s) => ({ bytes: s.size }) }],
    ["list_small", () => lf.fs.list("main", `${P}/dir`, 50, 0), { input: (v) => ({ entries: v.items.length }) }],
    ["list_largest", () => lf.fs.list("main", abs(big.dir), 1000, 0), { input: (v) => ({ dir: big.dir, entries: v.items.length }) }],
    ["grep_scoped", () => lf.fs.grep("main", "probe", `${P}/dir`, 50, 0), { setup: () => lf.fs.list("main", `${P}/dir`, 50, 0), input: (v, s) => ({ files: s.items.length }) }],
    ["glob_scoped", () => lf.fs.glob("main", "*.txt", `${P}/dir`, 50, 0), { setup: () => lf.fs.list("main", `${P}/dir`, 50, 0), input: (v, s) => ({ files: s.items.length }) }],
    ["grep_tree", () => lf.fs.grep("main", "LFS352_NEVER_PRESENT", "/", 50, 0)],
    ["glob_tree", () => lf.fs.glob("main", "**/*.md", "/", 50, 0)],
    ["diff_files", () => lf.fs.diff_files("main", `${P}/a.txt`, "main", `${P}/b.txt`), { setup: async () => [(await lf.fs.stat("main", `${P}/a.txt`)).size, (await lf.fs.stat("main", `${P}/b.txt`)).size], input: (v, s) => ({ bytes: s }) }],
    ["list_commits", () => lf.branch.list_commits(branch, 20, 0), { input: (v) => ({ pageSize: 20, items: v.items.length }) }],
    // v3 (F-014): two adjacent Commits of its own Branch, the second changing one fixed 2 KiB file; only the
    // diff is timed. (v2 read a Commit off the fresh fork, which has none: main's head is a Layer; it never ran.)
    ["diff_commits", (ids) => lf.branch.diff_commits(ids.from, ids.to, 50, 0, { hunks: false }), { version: 3, input: (v) => ({ files: v.items.length }), setup: async () => {
      await lf.branch.fork(`probe-${r}-d`, "main");
      await lf.fs.apply(`probe-${r}-d`, [{ op: "write", path: `${P}/diff-one.txt`, content: probeText(`diff ${r} a`, 2048) }], "probe diff base");
      const from = (await lf.branch.list_commits(`probe-${r}-d`, 1, 0)).items[0]?.id;
      if (!from) throw new Error("probe diff_commits: the base Commit is missing");
      await lf.fs.apply(`probe-${r}-d`, [{ op: "write", path: `${P}/diff-one.txt`, content: probeText(`diff ${r} b`, 2048) }], "probe diff");
      const c = (await lf.branch.list_commits(`probe-${r}-d`, 2, 0)).items;
      if (c.length !== 2 || c[1].id !== from) throw new Error(`probe diff_commits: the Commit after ${from} is not adjacent`);
      return { from, to: c[0].id };
    } }],
    // samples after the first fork their own Branch (the first keeps `probe-<r>`, which the one-shot probes mount)
    ["fork", (_, s) => lf.branch.fork(`probe-${r}${s.suffix}`, "main")],
    ["merge", async (_, s) => {
      const b = `probe-${r}${s.suffix}`;
      await lf.branch.fork(`${b}-a`, "main"); await lf.branch.fork(`${b}-b`, "main");
      await lf.fs.apply(`${b}-a`, [{ op: "mkdir", path: `${P}/m` }, { op: "write", path: `${P}/m/a1.txt`, content: `a1 ${r}\n` }, { op: "write", path: `${P}/m/a2.txt`, content: `a2 ${r}\n` }], "probe a");
      await lf.fs.apply(`${b}-b`, [{ op: "mkdir", path: `${P}/m` }, { op: "write", path: `${P}/m/b1.txt`, content: `b1 ${r}\n` }, { op: "write", path: `${P}/m/b2.txt`, content: `b2 ${r}\n` }], "probe b");
      return lf.branch.merge(`${b}-a`, `${b}-b`, `${b}-m`, "probe merge");
    }, { input: () => ({ filesPerSide: 2 }) }],
    // split by owner after 013.a1 (steps.mjs oneshotSplit): mount + unmount, and the exec under its own
    // label; the metrics take both values from the trace (the old `oneshot_mount_exec` series ends here)
    ["oneshot_mount_unmount", async (_, s) => {
      const ws = await lf.sandbox.mount(sb, `probe-${r}`);
      run.label(`${s.prefix}:oneshot_exec`);
      await lf.sandbox.exec(sb, ws, "true");
      run.label(`${s.prefix}:oneshot_mount_unmount`);
      return lf.sandbox.unmount(sb, ws, true);
    }],
    // each sample writes the same 2 KiB with its own byte (the first keeps `p`), so every sample commits a change
    ["oneshot_commit", async (_, s) => {
      const ws = await lf.sandbox.mount(sb, `probe-${r}`);
      await lf.sandbox.exec(sb, ws, `mkdir -p ${PROBE_DIR}/c && head -c 2048 /dev/zero | tr '\\0' ${"pqrstuvwxy"[s.i] ?? "z"} > ${PROBE_DIR}/c/one.txt`);
      run.rec.next = { kind: "files", n: 1 };
      const c = await lf.sandbox.commit(sb, ws, "probe commit");
      await lf.sandbox.unmount(sb, ws, false);
      return c;
    }, { input: () => ({ files: 1, bytes: 2048 }) }],
  ];
  const out = {};
  // a probe's setup runs untimed under its own label (its counters are not the probe's); `version` marks a changed input.
  // PROBE_SAMPLES samples each (owner 2026-10-18): `ms` is their median; the first runs as `probe:<name>` and alone
  // gives the counters (unchanged), the others as `probe-s<i>:<name>`; each sample records the 1-min load average.
  for (const [name, f, { version, setup, input } = {}] of list) {
    const v = version ? { version } : {};
    try {
      let prepared;
      if (setup) { run.label(`probe-setup:${name}`); prepared = await setup(); }
      const samples = [], load = [];
      let first;
      for (let i = 0; i < PROBE_SAMPLES; i++) {
        const s = { i, prefix: i ? `probe-s${i}` : "probe", suffix: i ? `-s${i}` : "" };
        run.label(`${s.prefix}:${name}`);
        const t0 = performance.now();
        const value = await f(prepared, s);
        samples.push(+(performance.now() - t0).toFixed(3));
        load.push(+loadavg()[0].toFixed(2));
        if (!i) first = value;
      }
      out[name] = { ms: median(samples), samples, load, ...v, ...(input ? { input: input(first, prepared) } : {}) };
    } catch (e) { out[name] = { ms: null, ...v, error: `${e.code ?? ""} ${e.message}`.slice(0, 200) }; }
  }
  return out;
}

/** Samples per scale probe (owner 2026-10-18): the fit uses their median. */
export const PROBE_SAMPLES = 5;
/** The median of numbers (the mean of the middle two for an even count). */
export const median = (xs) => { const s = [...xs].sort((a, b) => a - b), h = s.length >> 1; return s.length ? +(s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2).toFixed(3) : null; };
/** The 1-min load average where the player runs (in the runner: the Docker VM's Linux kernel). */
export const loadNow = () => +loadavg()[0].toFixed(2);

/** Reads a range's trace file: the latency rows' input, and each probe's SQL counters. */
export function readTrace(file, log = null) {
  const lines = existsSync(file) ? traceLines(readFileSync(file, "utf8")) : [];
  // a label is "<step>#<seq>" (record()): the step, and the call record it joins
  for (const l of lines) { const m = /^(.*)#(\d+)$/.exec(String(l.step ?? "")); if (m) { l.step = m[1]; l.seq = Number(m[2]); } }
  attributeFuse(lines);
  markContention(lines);
  const bySeq = new Map((log ?? []).map((e) => [e.seq, e]));
  const isProbe = (l) => /^probe(-setup|-s\d+)?:/.test(String(l.step ?? ""));
  const calls = lines.filter((l) => !isProbe(l)).map((l) => callOf(l, bySeq.get(l.seq)?.method === l.method ? bySeq.get(l.seq) : null));
  // the same calls classed from the trace alone (no call records): how stored traces are re-derived (SPEC §5)
  const callsTrace = lines.filter((l) => !isProbe(l)).map((l) => callOf(l));
  const probe = {};
  for (const l of lines.filter(isProbe)) {
    if (!l.step.startsWith("probe:")) continue;
    const name = l.step.slice(6), c = sqlCounters(l);
    probe[name] ??= {};
    for (const [key, n] of Object.entries(c)) probe[name][key] = (probe[name][key] || 0) + n;
  }
  const delta = deltaWork(lines.filter((x) => !isProbe(x)));
  // construction work of the replay's own Saves (probes left out): files built, unchanged, symlinks
  const construction = {};
  for (const l of lines.filter((x) => !isProbe(x))) for (const d of l.daemon ?? []) for (const [key, n] of Object.entries(d.construction ?? {})) construction[key] = (construction[key] ?? 0) + n;
  return { calls, callsTrace, probe, delta, construction, lines: lines.length, all: lines };
}

export { PHASES, phaseOps, Tree };
