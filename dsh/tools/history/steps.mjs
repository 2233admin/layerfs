// The pure half of the history replay's step library (#352 SPEC §2, §3, §7;
// SCRIPTS.md §5–§6): how a range's plan becomes SDK calls in a phase, which
// route each file takes, the Sandbox scripts that write files an fs call
// cannot, the expected tree the calls keep, and the numbers a range's metrics
// are built from. Nothing here touches the SDK, Docker or the disk; lib.mjs
// makes the calls and run.mjs plays the ranges.

/** The largest file one fs request carries: an SDK request is one 65,519-byte control record (sdk/js/README.md). */
export const FS_MAX = 60_000;
/** Base64 characters one exec command carries when a file goes through a Sandbox. */
export const CHUNK = 45_000;
/** Paths per exec when a Sandbox prints git blob ids (one command stays under the record). */
export const ID_BATCH_BYTES = 40_000;
/** Lines per exec page of the full-tree walk (an exec keeps 1 MiB of output). */
export const TREE_PAGE = 6_000;
/** The probe fixture's folder: the oracle leaves it out (oracle.mjs IGNORE). */
export const PROBE_DIR = ".lfs-probe";

/** What each phase runs (SPEC §9). Only P1 is built; later phases refuse until their player exists. */
export const PHASES = {
  p1: { lanes: 1, agents: 1, fsOnly: true, conflicts: false, tests: false, snapshot: "every", probes: true },
};

export const pad = (n, w = 3) => String(n).padStart(w, "0");
export const abs = (p) => (p === "/" || p === "" ? "/" : `/${p}`);
const parentOf = (p) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");
const ancestors = (p) => { const out = []; for (let d = parentOf(p); d; d = parentOf(d)) out.push(d); return out; };
export const quote = (t) => `'${String(t).replaceAll("'", "'\\''")}'`;

/**
 * The expected tree of one Branch: files by path ({ mode, blob, size? }) and
 * how many files each folder holds, so the player knows when a write needs
 * its parents made and when a removal leaves a folder empty (git keeps no
 * empty folders, so neither does the replay).
 */
export class Tree {
  constructor(files = new Map()) {
    this.files = new Map(files);
    this.dirs = new Map();
    for (const p of this.files.keys()) for (const d of ancestors(p)) this.dirs.set(d, (this.dirs.get(d) || 0) + 1);
  }
  has(p) { return this.files.has(p); }
  get(p) { return this.files.get(p) ?? null; }
  isDir(p) { return p === "" || (this.dirs.get(p) || 0) > 0; }
  set(p, v) {
    if (!this.files.has(p)) for (const d of ancestors(p)) this.dirs.set(d, (this.dirs.get(d) || 0) + 1);
    this.files.set(p, v);
  }
  delete(p) {
    if (!this.files.delete(p)) return;
    for (const d of ancestors(p)) { const n = this.dirs.get(d) - 1; if (n) this.dirs.set(d, n); else this.dirs.delete(d); }
  }
  /** The folder a write of `p` must make first (its nearest missing ancestor's top), or null. */
  missingParent(p) {
    const parent = parentOf(p);
    return parent && !this.isDir(parent) ? parent : null;
  }
  /** What to remove so that `p` goes and no folder is left empty: `p`, or its highest ancestor holding only `p`. */
  removalTarget(p) {
    let target = p;
    for (const d of ancestors(p)) { if ((this.dirs.get(d) || 0) === 1) target = d; else break; }
    return target;
  }
  /** The folder with the most direct entries (files and folders), for the scale probe. */
  largestDir() {
    const entries = new Map();
    const note = (p) => { const d = parentOf(p); entries.set(d, (entries.get(d) || new Set()).add(p)); };
    for (const p of this.files.keys()) note(p);
    for (const d of this.dirs.keys()) note(d);
    let best = ["", 0];
    for (const [d, set] of entries) if (set.size > best[1] || (set.size === best[1] && d < best[0])) best = [d, set.size];
    return { dir: best[0], entries: best[1] };
  }
}

/** A file an fs call cannot write: a mode other than 100644, a mode change, or more bytes than one request carries. */
export const viaSandbox = (f) => f.op === "write" && (f.mode !== "100644" || f.modeChange || (f.size ?? 0) > FS_MAX);

/**
 * A range's plan as the phase plays it. P1 (one lane, one agent, fs only):
 * every file change of the plan's fs, apply and stale-apply steps, in plan
 * order, on one Branch; the planned conflicts' own steps (holds, stale
 * mounts, checks, decoys) are left out, since they need several agents.
 * Lanes never share a path, so each file's planned outcome holds on one
 * Branch. Each op keeps the plan step it came from and that step's reads.
 */
export function phaseOps(plan, phase) {
  if (!PHASES[phase]) throw new Error(`phase ${phase} has no player yet`);
  const ops = [], left = {};
  for (const s of plan.steps) {
    const files = (s.files || []).filter((f) => f.op === "write" || f.op === "rm");
    if (!["fs", "apply", "stale-apply"].includes(s.kind) || !files.length) { left[s.kind] = (left[s.kind] || 0) + 1; continue; }
    ops.push({ id: s.id, kind: s.kind, commit: s.commit, files, reads: s.reads ?? [] });
  }
  const reconcile = plan.consolidation.find((c) => c.op === "reconcile")?.files ?? [];
  return { ops, reconcile: reconcile.map((f) => ({ ...f, expect: "Committed" })), left };
}

/**
 * How one op's files are written: fs calls in order (a write, a write with
 * its parents made in the same Commit, or one removal that takes the folders
 * it empties), then, for files an fs call cannot write, one Sandbox step.
 * `tree` is the Branch's expected tree; it is updated as the calls would.
 */
export function route(files, tree) {
  const calls = [], sandbox = [];
  for (const f of files) {
    if (f.op === "rm") {
      if (!tree.has(f.path)) continue;
      calls.push({ call: "rm", path: f.path, target: tree.removalTarget(f.path), expect: f.expect ?? "Committed" });
      tree.delete(f.path);
    } else if (viaSandbox(f)) {
      sandbox.push({ ...f, previous: tree.get(f.path) });
      tree.set(f.path, { mode: f.mode, blob: f.blob, size: f.size });
    } else {
      const parent = tree.missingParent(f.path);
      calls.push({ call: parent ? "apply" : "write", path: f.path, blob: f.blob, size: f.size, parent, expect: f.expect ?? "Committed" });
      tree.set(f.path, { mode: f.mode, blob: f.blob, size: f.size });
    }
  }
  return { calls, sandbox };
}

/**
 * The exec commands of one Sandbox step: each file's bytes as base64, in
 * chunks appended to a scratch file outside the Workspace, then one script
 * that puts every file in place. A regular file is overwritten in place, so
 * equal bytes and mode leave the Workspace unchanged; a symlink is replaced
 * only when its target differs.
 * @param {{ path: string, mode: string, bytes: Buffer }[]} files
 */
export function sandboxCommands(files, scratch = "/tmp/lfs352") {
  const commands = [`rm -rf ${scratch} && mkdir -p ${scratch}`];
  let batch = [];
  let size = 0;
  const flush = () => { if (batch.length) commands.push(batch.join(" && ")); batch = []; size = 0; };
  files.forEach((f, i) => {
    const b64 = f.bytes.toString("base64");
    for (let at = 0; at < b64.length || at === 0; at += CHUNK) {
      const piece = b64.slice(at, at + CHUNK);
      if (size + piece.length > CHUNK) flush();
      batch.push(`printf %s ${quote(piece)} >> ${scratch}/${i}`);
      size += piece.length + 40;
      if (!b64.length) break;
    }
  });
  flush();
  const script = ["set -e"];
  files.forEach((f, i) => {
    const p = quote(`./${f.path}`), dir = parentOf(f.path);
    if (dir) script.push(`mkdir -p ${quote(`./${dir}`)}`);
    if (f.mode === "120000") {
      script.push(`t="$(base64 -d < ${scratch}/${i})"; if [ ! -L ${p} ] || [ "$(readlink -- ${p})" != "$t" ]; then rm -rf -- ${p}; ln -s -- "$t" ${p}; fi`);
    } else {
      script.push(`if [ -L ${p} ] || [ -d ${p} ]; then rm -rf -- ${p}; fi`, `base64 -d < ${scratch}/${i} > ${p}`, `chmod ${f.mode === "100755" ? 755 : 644} ${p}`);
    }
  });
  script.push(`rm -rf ${scratch}`);
  commands.push(script.join("\n"));
  for (const c of commands) if (Buffer.byteLength(c) > 60_000) throw new Error(`a Sandbox command of ${Buffer.byteLength(c)} bytes is over one request`);
  return commands;
}

/** The outcome one Sandbox step's Commit should have: Committed when any file changes. */
export const sandboxExpect = (files) => (files.some((f) => (f.expect ?? "Committed") === "Committed") ? "Committed" : "UpToDate");

/** Paths in exec-sized batches for the blob-id script. */
export function idBatches(paths, limit = ID_BATCH_BYTES) {
  const out = [];
  let cur = [], size = 0;
  for (const p of paths) {
    const n = Buffer.byteLength(p) + 4;
    if (cur.length && size + n > limit) { out.push(cur); cur = []; size = 0; }
    cur.push(p); size += n;
  }
  if (cur.length) out.push(cur);
  return out;
}

// Prints "<mode> <git blob id> /<path>" for every file and symlink under the
// Workspace, sorted, lines [from, from+count); then "TOTAL <n>". Folders named
// node_modules and the ignored prefixes are not walked (SPEC §2, Ignored files).
export const TREE_IDS = `const fs=require("fs"),c=require("crypto"),[from,count,...skip]=process.argv.slice(1);const out=[];const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=d==="."?e.name:d+"/"+e.name;if(skip.some(s=>p===s||p.startsWith(s+"/")))continue;if(e.isDirectory()){if(e.name!=="node_modules")walk(p);continue}out.push(p)}};walk(".");out.sort();for(const p of out.slice(+from,+from+ +count)){const s=fs.lstatSync(p);let b,m;if(s.isSymbolicLink()){b=Buffer.from(fs.readlinkSync(p));m="120000"}else{b=fs.readFileSync(p);m=s.mode&0o111?"100755":"100644"}process.stdout.write(m+" "+c.createHash("sha1").update("blob "+b.length+"\\0").update(b).digest("hex")+" /"+p+"\\n")}process.stdout.write("TOTAL "+out.length+"\\n")`;

/** One page of TREE_IDS's output: its entries and the walk's total. */
export function parseTreePage(stdout) {
  const lines = String(stdout).split("\n").filter(Boolean);
  const last = lines.pop() ?? "";
  const m = /^TOTAL (\d+)$/.exec(last);
  if (!m) throw new Error(`the tree walk did not finish: ${last.slice(0, 200)}`);
  const files = new Map();
  for (const line of lines) {
    const x = /^(100644|100755|120000) ([0-9a-f]{40}) \/(.*)$/.exec(line);
    if (!x) throw new Error(`unexpected line: ${line.slice(0, 200)}`);
    files.set(x[3], { mode: x[1], blob: x[2] });
  }
  return { files, total: Number(m[1]) };
}

/**
 * The proof checkpoint's path check (SPEC §7): the files diff_commits lists
 * between the previous checkpoint and this one against the paths git
 * changed. Folders are left out (git has none), and so are ignored prefixes.
 */
export function comparePaths(items, gitChanges, ignore) {
  const skip = (p) => ignore.some((i) => p.startsWith(i));
  const files = items.filter((i) => i.type !== "dir").map((i) => ({ ...i, path: i.path.replace(/^\//, "") })).filter((i) => !skip(i.path));
  const lfs = new Set(files.map((i) => i.path));
  const git = new Set(gitChanges.filter((c) => !c.gitlink).map((c) => c.path).filter((p) => !skip(p)));
  const missing = [...git].filter((p) => !lfs.has(p)).sort();
  // A file whose bytes are unchanged but whose metadata changed (a timestamp,
  // after a step changed it and a later one put it back) is no change to git;
  // the caller checks its blob id and mode against git's tree instead.
  const metadataOnly = files.filter((i) => !git.has(i.path) && i.kind === "Modified" && i.content === false).map((i) => i.path).sort();
  const extra = files.filter((i) => !git.has(i.path) && !metadataOnly.includes(i.path)).map((i) => i.path).sort();
  return { ok: !missing.length && !extra.length, git: git.size, layerfs: lfs.size, missing, extra, metadataOnly };
}

/** Compares blob ids and modes of `paths` read from LayerFS with git's tree. */
export function compareIds(paths, actual, expected) {
  const out = { checked: paths.length, missing: [], content: [], mode: [] };
  for (const p of paths) {
    const a = actual.get(p), e = expected.get(p);
    if (!a) out.missing.push(p);
    else if (a.blob !== e.blob) out.content.push(p);
    else if (a.mode !== e.mode) out.mode.push(p);
  }
  out.ok = !out.missing.length && !out.content.length && !out.mode.length;
  return out;
}

/** The SQL work of one trace line's exchanges, summed: the counters the probes report. */
export function sqlCounters(line) {
  const out = { statements: 0, vm_steps: 0, fullscan_steps: 0, sorts: 0, returned_rows: 0 };
  for (const d of line.daemon ?? []) for (const group of [d.sql?.writer, d.sql?.readers]) {
    if (group) for (const k of Object.keys(out)) out[k] += group[k] ?? 0;
  }
  return out;
}

const DELTA_KEYS = {
  payload: ["prepared_full", "trials", "prefix_selected", "full_losses", "no_candidate", "absent_candidates", "ineligible_candidates", "depth_capped", "work_exceeded"],
  metadata: ["leaves", "delta_leaves", "full_leaves", "trials", "depth_capped", "work_exceeded"],
};
const DELTA_LISTS = { payload: ["whole_file_depths", "chunk_depths"], metadata: ["depths"] };
const addList = (a = [], b = []) => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0));

/** Two delta work records summed (either may be null). */
export function addDelta(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  const out = {};
  for (const group of ["payload", "metadata"]) {
    out[group] = {};
    for (const k of DELTA_KEYS[group]) out[group][k] = (a[group]?.[k] ?? 0) + (b[group]?.[k] ?? 0);
    for (const k of DELTA_LISTS[group]) out[group][k] = addList(a[group]?.[k], b[group]?.[k]);
  }
  return out;
}

/** The delta selection work of trace lines (each Save's stored depths and refusals), summed; null when none saved. */
export const deltaWork = (lines) => lines.flatMap((l) => (l.daemon ?? []).map((d) => d.delta).filter(Boolean)).reduce(addDelta, null);

/**
 * SPEC §3d, Delta: from summed delta work and the role caps, the share of
 * stored objects kept as deltas, the depth histogram per role, the share at
 * the depth cap, and of the refused bases the share refused by the chain-work
 * budget rather than the depth cap.
 */
export function deltaSummary(work, caps) {
  if (!work) return null;
  const depths = { wholeFile: work.payload.whole_file_depths, chunk: work.payload.chunk_depths, metadata: work.metadata.depths };
  const sum = (list) => list.reduce((n, x) => n + x, 0);
  const objects = sum(Object.values(depths).map(sum)), deltas = objects - sum(Object.values(depths).map((l) => l[0] ?? 0));
  const atCap = Object.entries(depths).reduce((n, [role, list]) => n + (list[caps[role]] ?? 0), 0);
  const capped = work.payload.depth_capped + work.metadata.depth_capped, budget = work.payload.work_exceeded + work.metadata.work_exceeded;
  const ratio = (n, d) => (d ? +(n / d).toFixed(4) : null);
  return { objects, deltas, share: ratio(deltas, objects), atCap: ratio(atCap, objects), atCapObjects: atCap,
    byBudget: ratio(budget, budget + capped), refusedByBudget: budget, refusedByCap: capped, caps, depths };
}

/** One trace line as gates.aggregate's input: method, client ms, input size and the top daemon phases. */
export function callOf(line) {
  const a = line.args ?? {};
  const size = a.contentBytes != null ? { kind: "bytes", n: a.contentBytes } : a.changes != null ? { kind: "files", n: a.changes } : a.changeBytes != null ? { kind: "bytes", n: a.changeBytes } : null;
  const phases = {};
  for (const d of line.daemon ?? []) for (const root of d.timing ?? []) {
    phases[root.name] = (phases[root.name] || 0) + root.ms;
    for (const child of root.children ?? []) phases[`${root.name}.${child.name}`] = (phases[`${root.name}.${child.name}`] || 0) + child.ms;
  }
  return { method: line.method, ms: line.ms, ok: line.ok, ...(size ? { size } : {}), ...(Object.keys(phases).length ? { phases } : {}) };
}

/** Parses a trace file's text into end lines. */
export const traceLines = (text) => String(text).split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((l) => l.phase !== "start");

/**
 * The disk guard (SPEC §7, Disk): the space the run will hold after the next
 * range, on the Docker disk (the working Store, one fork, the install peak)
 * and on the host (the new snapshot blocks and a fork's rebuilt file). It
 * stops when free space on either is under twice that.
 */
export function diskGuard({ storeBytes, growthBytes, installPeak = 0, dockerFree, hostFree, rangesLeft }) {
  const growth = Math.max(growthBytes ?? 0, 256 * 2 ** 20);
  const docker = storeBytes + growth + storeBytes + growth + installPeak;
  const host = growth + storeBytes + growth;
  const ok = dockerFree >= 2 * docker && hostFree >= 2 * host;
  return {
    ok, docker, host, dockerFree, hostFree,
    why: ok ? "enough free space" : `free space is under twice the projection (Docker ${dockerFree} < 2×${docker} or host ${hostFree} < 2×${host})`,
    projected: storeBytes + growth * Math.max(rangesLeft, 1),
  };
}

/** The runner's exit codes, one per way it stops. */
export const EXIT = { done: 0, error: 1, usage: 2, optimize: 3, stop: 4, guard: 5 };
