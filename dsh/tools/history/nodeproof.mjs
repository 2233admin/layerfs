#!/usr/bin/env node
// NODE_RULE §6 proofs, native side: each test point's command run natively on
// the identical tree (the same tree id), with the native oracle cached per
// (tree, install inputs, chain) key; then P1–P6 judged against what the point
// recorded in LayerFS (nodelanes.mjs). A proof not run is NOT_RUN, never pass;
// a proof that does not apply to a point is n/a.
//   node dsh/tools/history/nodeproof.mjs calibrate --run <id> --range k [--point <id>]
//     before the play: the point's vitest files, natively on the lane's tree as
//     the plan builds it, passing files fastest first within the 20 s cap
//     (planDir/node-NNN.json); one point per command (each native run < 2 min)
//   node dsh/tools/history/nodeproof.mjs inputs --run <id> --range k
//     before the play: NODE_RULE §11 b for the plan's lane steps (reported, not gated)
//   node dsh/tools/history/nodeproof.mjs proofs --run <id> --range k [--attempt a] [--budget-s 90]
//     after the play: native oracles for the recorded points (cached), P1–P6
//     into the attempt's metrics, its p3 object refilled and the report rendered again;
//     points left over the budget wait for the next command
//   node dsh/tools/history/nodeproof.mjs reinstall --run <id> --range k [--attempt a]
//     after the proofs, before run.mjs devcheck: the clean reinstall natively on top of the repair's chain
//     and the rebuild check's native rerun after it (metrics/devcheck-oracle-k.json), the devcheck's oracle when Node is on
// The trees are rebuilt in a scratch repository whose objects borrow dsh.git's
// (alternates): dsh blobs by id, decoys from their base and marker.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BlobCache, lsTree } from "./git.mjs";
import { compareInstalled, LISTER_VERSION, listerCommand, normalizeOutput, ORACLE_ROOT, parseLister, rootless, STORE_MOUNT, firstDifference } from "./closure.mjs";
import { emittedCommand, groupsFile, inputsHash, nodeOf, parseEmitted, pointBuild, testPoints, treeDelta, wholeBuild, changedPackages } from "./nodelanes.mjs";
import { buildCommand, planClosure, tscStates } from "./closure.mjs";
import { BUILD_GROUPS, diagUnits, EMITTED, vitestMessages } from "./nodeconfig.mjs";
export { BUILD_GROUPS };
import { selectTests, vitestCommand } from "./unit-tests.mjs";
import { devSteps } from "./devcheck.mjs";
import { decoyBytes, pad, Tree } from "./steps.mjs";
import { UNTRACKED_LIST } from "./gitlanes.mjs";
import { installCommand } from "./closure.mjs";
import { checkStates, isNativeState, provenRun, restoreCommand, saveCommand, stateCommand, stateMounts, NATIVE_STATES } from "./nativestate.mjs";

const here = dirname(fileURLToPath(import.meta.url));

export const PROOFS = ["P1", "P2", "P3", "P4", "P5", "P6"];
/** pnpm's state files (not byte-compared since lister v6; owner 2026-10-19). */
export const STATE_FILES = /^(.*\/)?node_modules\/(\.modules\.yaml|\.pnpm\/lock\.yaml|\.pnpm-workspace-state[^/]*\.json)$/;
/** A `.bin` shim (lister v6 judges it by target). With the state files, pnpm's bookkeeping: all a no-op refresh may change (P3). */
export const SHIM = /(^|\/)node_modules\/\.bin\/[^/]+$/;

const git = (repo, args, opts = {}) => execFileSync("git", ["--git-dir", repo, ...args], { encoding: "utf8", maxBuffer: 1 << 28, ...opts });

/** The scratch repository: objects borrowed from dsh.git, decoy blobs and trees of its own. */
export function scratchRepo(dir, dsh) {
  if (!existsSync(join(dir, "HEAD"))) {
    mkdirSync(dir, { recursive: true });
    execFileSync("git", ["init", "-q", "--bare", dir]);
    writeFileSync(join(dir, "objects", "info", "alternates"), `${join(dsh, "objects")}\n`);
  }
  return dir;
}

/** A tree id from a base tree and a delta (nodelanes treeDelta rows), written in the scratch repository. */
export async function materialize(repo, baseTree, delta, blobs) {
  const tmp = mkdtempSync(join(tmpdir(), "lfs352-tree-")), env = { ...process.env, GIT_INDEX_FILE: join(tmp, "index") };
  try {
    git(repo, ["read-tree", baseTree], { env });
    const lines = [];
    for (const [path, mode, blob, decoy] of delta) {
      if (mode == null) { lines.push(`0 ${"0".repeat(40)}\t${path}`); continue; }
      const id = blob ?? git(repo, ["hash-object", "-w", "--stdin"], { input: decoyBytes(await blobs.get(decoy.base), decoy.marker) }).trim();
      lines.push(`${mode} ${id}\t${path}`);
    }
    if (lines.length) git(repo, ["update-index", "--index-info"], { env, input: `${lines.join("\n")}\n` });
    return git(repo, ["write-tree"], { env }).trim();
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

/** A lane point's tree as the plan builds it (before the play): the base with the point's steps applied in lane order. */
export function modelDelta(plan, base, pt) {
  const tree = new Tree(base), byId = new Map(plan.steps.map((s) => [s.id, s]));
  for (const id of pt.before) for (const f of byId.get(id).files ?? []) {
    if (f.op === "rm") tree.delete(f.path);
    else if (f.op === "write") tree.set(f.path, { mode: f.mode, blob: f.blob });
    else if (f.op === "decoy") tree.set(f.path, { mode: tree.get(f.path)?.mode ?? "100644", blob: `decoy:${id}` });
  }
  return { tree, delta: treeDelta(base, tree, plan) };
}

/**
 * The native run of a chain of states (a tree and its install command, as the
 * replay ran them, in order) and a tail on the last state: the lister, the
 * build and its emitted files, vitest. One container, network off, the store
 * read-only; between states the tree is set to the next (archive over it,
 * git's deletions removed; untracked output stays). It starts at ORACLE_ROOT.
 * A state's (or the tail's) `root` is the LayerFS mount path that step ran
 * at: the folder is moved there first, so tools that record absolute paths
 * (pnpm's workspace state, its bin shims) see the same paths on both sides.
 * Each mount gets a new path in LayerFS, so pnpm's up-to-date shortcut is
 * skipped there (#352 R1 slice, r015-2-packages-core). The final lister
 * normalizes the earlier roots, as the LayerFS lister does.
 */
/** The native `git clean -f` of state i in the current folder (decision B): `idx` holds `git ls-tree -r -z` of its tree. */
export const nativeClean = (i, idx, scratch = "/tmp") => `if rm -rf ${scratch}/cg && git init -q ${scratch}/cg && GIT_DIR=${scratch}/cg/.git GIT_WORK_TREE=$PWD git update-index -z --index-info < ${idx} && (export GIT_DIR=${scratch}/cg/.git GIT_WORK_TREE=$PWD; ${UNTRACKED_LIST}) > ${scratch}/cl${i}; then echo "@@cleaned ${i} $(tr -cd '\\0' < ${scratch}/cl${i} | wc -c | tr -d ' ')"; xargs -0 rm -f -- < ${scratch}/cl${i}; else echo "@@cleaned ${i} -1"; fi`;

/**
 * Option A (owner 2026-10-19, fix 042): the lane points' states (`lane`, `merge` = the lane's place in the
 * lanes' recorded write order, laneWriteOrder) each run from the state the lanes forked from, as LayerFS's lanes
 * do; their changes are captured, the folder restored, and the changes applied in that order before the next
 * state (lanemerge.mjs), so the newest writer wins a two-sided path as `/.lww` does.
 * Returns, per state index, the commands to run before it, whether `prev` (the tree the folder holds) goes back to
 * the lanes' base before it, and the commands after the last state.
 */
export function laneSteps(states, tool = "/seq/lanemerge.mjs", base = "/lanebase", lanes = "/lanes") {
  const before = states.map(() => []), reset = states.map(() => false), stores = [];
  // a failed merge step is reported, never skipped: nativeChain refuses the oracle (fix 042 a2: a silent failure
  // left the old sequential model in place)
  const step = (args) => `node ${tool} ${args} 2>/tmp/lane.err || { echo "@@lanefail ${args.split(" ")[0]} $?"; sed 's/^/@@laneerr /' /tmp/lane.err | tail -20; }`;
  let cur = null;
  // the F-057 diagnostic: the lane states carry merge units, and the captures merge by the whole-unit rule
  const units = states.find((s) => s.units)?.units ?? null, u = units ? "--units /seq/units.json " : "";
  const close = (i, cmds) => { cmds.push(step(`capture ${u}"$PWD" ${base} ${lanes}/${cur.n}`), step(`restore ${u}"$PWD" ${base} ${lanes}/${cur.n}`)); if (i != null) reset[i] = true; };
  const merge = (cmds) => cmds.push(step(`apply ${u}"$PWD" ${[...stores].sort((a, b) => a.merge - b.merge || a.n - b.n).map((x) => `${lanes}/${x.n}`).join(" ")}`));
  states.forEach((st, i) => {
    if (cur && st.lane !== cur.lane) {
      close(i, before[i]);
      if (!st.lane) { merge(before[i]); cur = null; }
    }
    if (st.lane && !cur && !stores.length) before[i].push(step(`snapshot "$PWD" ${base}`));
    if (st.lane && st.lane !== cur?.lane) {
      if (stores.some((x) => x.lane === st.lane)) throw new Error(`native chain: lane ${st.lane}'s points are not together`);
      if (!Number.isFinite(st.merge)) throw new Error(`native chain: lane ${st.lane} has no merge order`);
      cur = { lane: st.lane, merge: st.merge, n: stores.length };
      stores.push(cur);
      before[i].push(step(`mark ${lanes}/${cur.n}`));
    }
  });
  const after = [];
  if (cur) { close(null, after); merge(after); }
  return { before, reset, after, lanes: stores.length, units };
}

export function nativeChain({ repo, states, tail = {}, image, volume, name, saveState = null }) {
  checkStates(states);
  const stage = mkdtempSync(join(tmpdir(), "lfs352-chain-"));
  try {
    const script = [`mkdir ${ORACLE_ROOT} /seq && tar -x -C /seq && cd ${ORACLE_ROOT}`];
    let prev = null, at = ORACLE_ROOT, installRoot = ORACLE_ROOT, laneBase = null;
    const lanes = laneSteps(states);
    if (lanes.lanes) for (const f of ["lanemerge.mjs", "globrules.mjs"]) writeFileSync(join(stage, f), readFileSync(join(here, f)));
    if (lanes.units) writeFileSync(join(stage, "units.json"), JSON.stringify(lanes.units));
    const earlier = [], moveTo = (root) => {
      if (!root || root === at) return;
      if (!/^\/[\w./-]+$/.test(root) || root.split("/").includes("..")) throw new Error(`native chain: root ${root} is not a plain absolute path`);
      script.push(`mkdir -p ${root.slice(0, root.lastIndexOf("/")) || "/"} && mv ${at} ${root} && cd ${root}`);
      earlier.push(at); at = root;
    };
    states.forEach((st, i) => {
      // a snapshot (nativestate.mjs) stands for the states it was made from: extracted, not replayed
      if (st.state) { moveTo(st.root); script.push(restoreCommand(i, st.state, at)); prev = st.tree; return; }
      if (lanes.before[i].some((c) => c.includes(" snapshot "))) laneBase = prev;
      script.push(...lanes.before[i]);
      // after a lane's capture and restore (and after the merge) the folder's tracked files are the lanes' base
      if (lanes.reset[i]) prev = laneBase;
      moveTo(st.root);
      // the consolidation's reconcile (its `rm` files): after the lanes' merge LayerFS removes the tracked files the
      // lanes brought that the checkpoint has not (r019 a3: packages/ui/stdio-agent/src/*, natively kept, so tsdown
      // took the folder as a package)
      if (st.remove?.length) {
        writeFileSync(join(stage, `${i}.rm`), `${st.remove.join("\n")}\n`);
        script.push(`while IFS= read -r f; do rm -f -- "$f"; done < /seq/${i}.rm; echo "@@removed ${i} ${st.remove.length}"`);
      }
      if (st.tree !== prev) {
        if (!existsSync(join(stage, `${st.tree}.tar`))) writeFileSync(join(stage, `${st.tree}.tar`), execFileSync("git", ["--git-dir", repo, "archive", st.tree], { maxBuffer: 1 << 30 }));
        // -m: the files get the time of the extraction, as a checkout's (and a LayerFS step's) writes do; with the
        // archive's commit times tsc -b and pnpm take changed sources as older than their outputs and skip them
        // (f031-slice-f r015: native "Already up to date" and tsc exit 0 where LayerFS rebuilt and failed)
        // only files whose content, mode or link differs from the folder's get the time of the extraction (r029 a1,
        // fix 054): a checkout and a LayerFS step write only those, so tsc -b judges an unchanged package by its old
        // times, as LayerFS does; extracting the whole tree made every package look edited and rebuilt them all. By
        // content, not by a git diff: after the lanes' merge the folder is not any one tree.
        if (prev) script.push(`rm -rf /x && mkdir /x && tar -x -m -C /x -f /seq/${st.tree}.tar && node -e '${SYNC_TREE}' /x ${at} && rm -rf /x`);
        else script.push(`tar -x -m -C ${at} -f /seq/${st.tree}.tar`);
        if (prev) {
          writeFileSync(join(stage, `${i}.del`), git(repo, ["diff", "--no-renames", "--name-only", "--diff-filter=D", prev, st.tree]));
          script.push(`while IFS= read -r f; do rm -f -- "$f"; done < /seq/${i}.del`);
        }
        prev = st.tree;
      }
      // decision B (liaison 2026-10-19): the lead's `git clean -f` on the checkpoint before the repair, natively the
      // same: an index of the state's tree in a scratch git dir, the same untracked, unignored list removed
      if (st.clean) {
        writeFileSync(join(stage, `${i}.idx`), execFileSync("git", ["--git-dir", repo, "ls-tree", "-r", "-z", "--full-tree", st.tree], { maxBuffer: 1 << 30 }));
        script.push(nativeClean(i, `/seq/${i}.idx`));
      }
      if (i === states.length - 1) installRoot = at;
      script.push(i < states.length - 1 ? `t=$(date +%s%N); (${st.command}) > /tmp/s${i} 2>&1; e=$?; echo "@@step ${i} $e $(( ($(date +%s%N) - t) / 1000000 ))"`
        : `t=$(date +%s%N); (${st.command}) > /tmp/o 2>&1; echo "@@exit $? $(( ($(date +%s%N) - t) / 1000000 ))"; sed 's/^/@@out /' /tmp/o; ${listerCommand()}`);
    });
    script.push(...lanes.after);
    moveTo(tail.root);
    if (tail.build) script.push(`t=$(date +%s%N); (${tail.build}) > /tmp/b 2>&1; echo "@@tsc $? $(( ($(date +%s%N) - t) / 1000000 ))"; tail -c ${tail.outputBytes ?? 4000} /tmp/b | sed 's/^/@@tscout /'`, `${emittedCommand(tail.packages ?? [])} | sed 's/^/@@emit /'`);
    if (tail.tests?.length) script.push(`t=$(date +%s%N); (${vitestCommand(tail.tests, tail.vitestTimeoutS ?? 100)}) > /tmp/v 2>/dev/null; echo "@@vt $? $(( ($(date +%s%N) - t) / 1000000 ))"; echo "@@vtjson $(base64 -w0 /tmp/v)"`);
    if (saveState) script.push(saveCommand(at, saveState.file));
    const input = execFileSync("tar", ["-c", "-C", stage, "."], { maxBuffer: 1 << 30 });
    const t0 = Date.now();
    const r = spawnSync("docker", ["run", "--rm", "-i", "--name", name, "--network", "none", "-v", `${volume}:${STORE_MOUNT}:ro`, ...stateMounts(states, saveState), "--entrypoint", "sh", image, "-c", script.join("; ")], { input, encoding: "utf8", maxBuffer: 1 << 28 });
    if (r.status !== 0) throw new Error(`native chain container exited ${r.status}: ${String(r.stderr).slice(-300)}`);
    const lines = r.stdout.split("\n"), pick = (p) => lines.filter((l) => l.startsWith(p)).map((l) => l.slice(p.length));
    // option A's merge must have run whole: every lane captured and the merge applied, or no oracle
    if (lanes.lanes && (pick("@@lanefail ").length || pick("@@lanecap ").length !== lanes.lanes || !pick("@@twosided ").length))
      throw new Error(`native chain: the lanes' merge did not complete (${pick("@@lanefail ").join("; ") || `${pick("@@lanecap ").length} of ${lanes.lanes} lanes captured`}): ${pick("@@laneerr ").join(" | ").slice(0, 1200)}`);
    // fail loud (step 0, ranges 21–30): every state, the snapshot, the cleans, the reconcile and the tail proved they ran
    const restored = states[0]?.state ? 1 : 0;
    const proven = provenRun(r.stdout, { steps: states.length - 1 - restored, tsc: !!tail.build, tests: !!tail.tests?.length, restored: !!restored,
      cleaned: states.filter((st) => st.clean).length, removed: states.filter((st) => st.remove?.length).length, lanes: lanes.lanes, saved: !!saveState });
    if (proven.missing.length) throw new Error(`native chain did not prove it ran: ${proven.missing.join("; ")}`);
    const saved = pick("@@saved ")[0]?.split(" ");
    const tsc = pick("@@tsc ")[0]?.split(" ").map(Number), vt = pick("@@vt ")[0]?.split(" ").map(Number);
    let vitest = null;
    if (vt) {
      const json = Buffer.from(pick("@@vtjson ")[0] ?? "", "base64").toString("utf8");
      vitest = { exit: vt[0], ms: vt[1], ...vitestReport(json, at) };
    }
    return {
      steps: pick("@@step ").map((l) => { const [i, exit, ms] = l.split(" ").map(Number); return { i, exit, ms }; }),
      exit: Number(String(pick("@@exit ")[0] ?? "NaN").split(" ")[0]), installMs: Number(String(pick("@@exit ")[0] ?? "").split(" ")[1] ?? NaN), output: normalizeOutput(pick("@@out ").join("\n")), ...parseLister(r.stdout),
      tsc: tsc ? { exit: tsc[0], ms: tsc[1], output: pick("@@tscout ").join("\n") } : null,
      emitted: tail.build ? parseEmitted(pick("@@emit ").join("\n")) : null, vitest, ms: Date.now() - t0, root: at, installRoot,
      cleaned: pick("@@cleaned ").map((l) => { const [i, files] = l.split(" ").map(Number); return { i, files }; }),
      ...(lanes.lanes ? { lanes: pick("@@lanecap ").map((l) => { const [n, changed, removed] = l.split(" ").map(Number); return { n, changed, removed }; }),
        twoSided: { n: Number(pick("@@twosided ")[0] ?? NaN), paths: pick("@@twopath ") }, ...(lanes.units ? { units: pick("@@unit ").map((l) => JSON.parse(l)) } : {}) } : {}),
      ran: proven.ran, ...(saved ? { saved: { volume: saveState.volume ?? NATIVE_STATES, file: saveState.file, sha256: saved[0], bytes: Number(saved[1]) } } : {}),
    };
  } finally { rmSync(stage, { recursive: true, force: true }); }
}

/** vitest's JSON report: per file pass/fail and its duration (ms), paths relative to `root`; null fields when it did not parse. */
export function vitestReport(text, root) {
  try {
    const report = JSON.parse(String(text).slice(String(text).indexOf("{")));
    const rel = (n) => (n.startsWith(`${root}/`) ? n.slice(root.length + 1) : n);
    return { results: Object.fromEntries(report.testResults.map((t) => [rel(t.name), t.status === "passed" ? "pass" : "fail"])), durations: Object.fromEntries(report.testResults.map((t) => [rel(t.name), Math.max(0, (t.endTime ?? 0) - (t.startTime ?? 0))])),
      // a failing file's first message, for the skip list's reason
      messages: vitestMessages(text, root) };
  } catch { return { results: null, durations: null, messages: null }; }
}

/** The oracle's cache key: the tree, its install inputs and the chain that leads to it (NODE_RULE §6). */
/** How nativeChain lays a tree down; part of the key, so an oracle made the old way is never reused (2: tar -m). */
export const CHAIN_VERSION = 4;
/** Copies into argv[2] each file or link of argv[1] that is missing there or differs in content, mode or target (no single quotes). */
export const SYNC_TREE = "const fs=require(`fs`),p=require(`path`);const [src,dst]=process.argv.slice(1);const walk=(d)=>{for(const e of fs.readdirSync(p.join(src,d),{withFileTypes:true})){const r=p.join(d,e.name),a=p.join(src,r),b=p.join(dst,r);if(e.isDirectory()){walk(r);continue}let same=false;try{const s=fs.lstatSync(b);if(e.isSymbolicLink())same=s.isSymbolicLink()&&fs.readlinkSync(a)===fs.readlinkSync(b);else same=s.isFile()&&s.mode===fs.lstatSync(a).mode&&fs.readFileSync(a).equals(fs.readFileSync(b))}catch{}if(!same){fs.mkdirSync(p.dirname(b),{recursive:true});fs.rmSync(b,{recursive:true,force:true});if(e.isSymbolicLink())fs.symlinkSync(fs.readlinkSync(a),b);else{fs.copyFileSync(a,b);fs.chmodSync(b,fs.lstatSync(a).mode)}}}};walk(`.`)";
/** The lanes' merge (fix 042) in the key of a chain with lane states only: 2 after the a2 silent-failure fix. */
export const LANE_MERGE_VERSION = 3;
export const oracleKey = ({ tree, inputs, states, tail, image }) => createHash("sha256").update(JSON.stringify({ v: LISTER_VERSION, chain: CHAIN_VERSION, tree, inputs, states, tail, image,
  laneMerge: states?.some((st) => st.lane) ? LANE_MERGE_VERSION : undefined,
  // the tail's own commands (r028 a1, fix 053): an oracle built with an older emitted-id or vitest command is not reused
  tailCommands: tail?.build || tail?.tests?.length ? tailCommands() : undefined })).digest("hex").slice(0, 24);
const tailCommands = () => createHash("sha256").update(`${EMITTED}\0${vitestCommand(["f"], 1)}`).digest("hex").slice(0, 16);

/**
 * The pnpm store's generation: its fetch batches in the ledger (fix 048, r021 a1). A fetch changes what an offline
 * install verifies (lockfile-verified.jsonl), so an oracle cached before it is never reused after it.
 */
export function storeGeneration(ledger = join(process.env.LFS_HISTORY ?? join(process.env.HOME, "lfs-history"), "ledger", "ledger.jsonl")) {
  if (!existsSync(ledger)) return "none";
  const fetches = readFileSync(ledger, "utf8").split("\n").filter((l) => l.includes('"kind":"pnpm-fetch"'));
  return fetches.length ? `${fetches.length}@${JSON.parse(fetches.at(-1)).at}` : "none";
}

/** The native oracle of one point, cached under `dir` by its key (the store's generation in it). */
export function cachedOracle(dir, args) {
  const key = oracleKey({ tree: args.states.at(-1).tree, inputs: args.inputs, states: args.states, tail: args.tail, image: `${args.image}#store ${storeGeneration()}` });
  const file = join(dir, `${key}.json`);
  if (existsSync(file)) return { ...JSON.parse(readFileSync(file, "utf8")), cached: true, key };
  const n = nativeChain(args);
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify({ key, tree: args.states.at(-1).tree, inputs: args.inputs, states: args.states, tail: args.tail, image: args.image, listerVersion: LISTER_VERSION, ...n, root: n.root ?? ORACLE_ROOT }));
  renameSync(`${file}.tmp`, file);
  return { ...n, cached: false, key };
}

/** Passing files fastest first within the cap; the rest skipped with their reason (§4: 20 s native per point). */
export function chooseFiles(results, durations, capMs) {
  const run = [], skipped = [];
  let total = 0;
  for (const f of Object.keys(results ?? {}).sort((a, b) => (durations[a] ?? 0) - (durations[b] ?? 0) || (a < b ? -1 : 1))) {
    if (results[f] !== "pass") skipped.push({ file: f, reason: "fails natively" });
    else if (total + (durations[f] ?? 0) > capMs) skipped.push({ file: f, reason: "over the 20 s cap" });
    else { run.push(f); total += durations[f] ?? 0; }
  }
  return { run: run.sort(), skipped, nativeMs: Math.round(total) };
}

// ---- judging (pure, for the tests) ----

const res = (result, detail = null, extra = {}) => ({ result, ...(detail ? { detail } : {}), ...extra });
/**
 * P1: the installed tree against native (lister v6 groups), build-output caches left out: package files byte for
 * byte, links and shims by resolved target, the resolved package set (`#pnpm-ls`). `normalized` counts what is not
 * byte-compared: pnpm's state files and the shims judged by target.
 */
export function judgeP1(native, groups, normalized) {
  if (!native?.groups || !groups) return res("NOT_RUN", "no lister on one side");
  const keep = (gs) => gs.filter((g) => !BUILD_GROUPS.test(g.g));
  const c = compareInstalled({ groups: keep(native.groups) }, keep(groups));
  const count = (n) => (n?.bookkeeping ?? 0) + (typeof n?.shims === "number" ? n.shims : 0);
  return c.ok ? res("pass", null, { normalized: count(normalized) }) : res("stop", `missing ${c.missing.length}, extra ${c.extra.length}, differ ${c.differ.length}: ${[...c.missing, ...c.extra, ...c.differ].slice(0, 3).join(", ")}`, { normalized: count(normalized) });
}
/** P2: pnpm's exit and output equal native, each root as <root>. */
export function judgeP2(native, install, root) {
  if (!native || !install) return res("NOT_RUN", "no install on one side");
  if (native.exit !== install.exitCode) return res("stop", `exit ${install.exitCode}, native ${native.exit}`);
  // native's install output names the folder the install ran in, not the build's after it (r016.a2: install at
  // /workspaces/3, build at /workspaces/4, pnpm's bin warning carried /workspaces/3)
  const nativeRoot = native.installRoot ?? native.states?.at(-1)?.root ?? native.root ?? ORACLE_ROOT;
  const a = rootless(install.output, root), b = rootless(native.output, nativeRoot);
  return a === b ? res("pass", `exit ${native.exit}`) : res("stop", firstDifference(b, a));
}
/**
 * P3: a no-op refresh (install inputs unchanged since the chain's last install) changes only pnpm's bookkeeping:
 * its state files, `.bin` shims and symlinks under node_modules (`install.links`, read in the mount), which P1
 * judges by target (owner 2026-10-19; the moved-root allowance is retired with it). Any other path is a stop,
 * wherever the mount root is: a package file's bytes, or anything outside node_modules.
 */
export function judgeP3(pt, prevInputs) {
  if (pt.kind !== "refresh") return res("n/a", "an install, not a refresh");
  if (prevInputs != null && prevInputs !== pt.inputs) return res("n/a", "install inputs changed: not a no-op");
  const changed = pt.install?.changed;
  if (!Array.isArray(changed)) return res("NOT_RUN", "changed paths not recorded");
  const links = new Set(pt.install?.links ?? []);
  const other = changed.filter((p) => !STATE_FILES.test(p) && !SHIM.test(p) && !(links.has(p) && /(^|\/)node_modules\//.test(p)));
  return other.length ? res("stop", `${other.length} non-bookkeeping path(s): ${other.slice(0, 3).join(", ")}`)
    : res("pass", `${changed.length} bookkeeping path(s)`);
}
/** P4: tsc's exit equal native and every emitted .js/.d.ts equal by blob id. */
export function judgeP4(native, tsc) {
  if (!tsc) return res("n/a", "no changed package to build");
  if (!native?.tsc) return res("NOT_RUN", "no native build");
  if (native.tsc.exit !== tsc.exitCode) return res("stop", `tsc exit ${tsc.exitCode}, native ${native.tsc.exit}`);
  const a = tsc.emitted ?? {}, b = native.emitted ?? {}, keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const differ = [...keys].filter((p) => a[p] !== b[p]);
  return differ.length ? res("stop", `${differ.length} emitted file(s) differ: ${differ.slice(0, 3).join(", ")}`) : res("pass", `${Object.keys(b).length} emitted files, exit ${native.tsc.exit}`);
}
/** P5: each test file's result equals native; a file failing natively was skip-listed at calibration; pass natively and fail here stops. */
export function judgeP5(native, vitest, calibration) {
  if (!calibration) return res("NOT_RUN", "no calibration for this point");
  const skipped = calibration.skipped?.filter((s) => s.reason === "fails natively").map((s) => ({ file: s.file, reason: s.reason })) ?? [];
  if (!calibration.run?.length) return res("n/a", "no calibrated file", { skipped });
  if (!vitest?.results || !native?.vitest?.results) return res("NOT_RUN", "no vitest results on one side", { skipped });
  const differ = calibration.run.filter((f) => vitest.results[f] !== native.vitest.results[f]);
  const bad = differ.filter((f) => native.vitest.results[f] === "pass");
  return bad.length ? res("stop", `${bad.length} pass natively, fail on LayerFS: ${bad.slice(0, 3).join(", ")}`, { skipped })
    : differ.length ? res("stop", `${differ.length} differ from native: ${differ.slice(0, 3).join(", ")}`, { skipped }) : res("pass", `${calibration.run.length} files`, { skipped });
}

/** All six for one recorded point and its native oracle (or null: NOT_RUN for the native ones). */
export function judgePoint(pt, native, { groups, prevInputs, calibration, treeOk }) {
  if (!treeOk) {
    const why = `tree differs: LayerFS ${String(pt.treeLfs ?? "none").slice(0, 12)}, native ${String(pt.tree ?? "none").slice(0, 12)}`;
    return Object.fromEntries(PROOFS.map((id) => [id, id === "P6" ? res("n/a", "not a repair") : res("NOT_RUN", why)]));
  }
  return { P1: judgeP1(native, groups, pt.lister?.normalized), P2: judgeP2(native, pt.install, pt.root), P3: pt.lane === "lead" ? res("n/a", "the lead's first install") : judgeP3(pt, prevInputs),
    P4: judgeP4(native, pt.tsc), P5: pt.lane === "lead" ? res("n/a", "no tests at the first install") : judgeP5(native, pt.vitest, calibration), P6: res("n/a", "not a repair") };
}

/** The repair point (P6, the closure on the merged tree): P1 and P2 judged inline by the closure, P4 natively here, its rewritten-file count. */
export function judgeRepair(closure, nativeBuild, { groups = null } = {}) {
  const inst = closure?.rows?.find((r) => /install/.test(r.kind)), build = closure?.rows?.find((r) => r.kind === "build");
  if (!inst) return null;
  // P1 against the on-top native chain when it ran (Node on); else the closure's own comparison
  const p1 = groups && nativeBuild?.groups ? judgeP1(nativeBuild, groups, inst.normalized)
    : closure.oracle ? (closure.oracle.ok ? res("pass") : res("stop", "installed tree differs from native")) : res("NOT_RUN", "no oracle comparison");
  const p2 = nativeBuild && inst.output != null && inst.root ? judgeP2(nativeBuild, inst, inst.root) : closure.outputOk == null ? res("NOT_RUN") : closure.outputOk ? res("pass") : res("stop", "pnpm output differs");
  const p4 = build ? judgeP4(nativeBuild, { exitCode: build.exitCode, emitted: build.emitted }) : res("n/a", "no changed package to build");
  const p6 = p1.result === "stop" || p4.result === "stop" ? "stop" : p1.result === "pass" && (p4.result === "pass" || p4.result === "n/a") ? "pass" : "NOT_RUN";
  const tests = closure.rows.find((r) => r.kind === "test")?.results;
  return { lane: "lead", point: "repair", id: "lead.repair", kind: inst.kind, tree: closure.tree ?? null, inputs: closure.inputs ?? null, cached: !!nativeBuild?.cached,
    nativeInstallMs: nativeBuild?.installMs ?? null, nativeTscMs: nativeBuild?.tsc?.ms ?? null,
    proofs: { P1: res("n/a", "folded into P6"), P2: p2, P3: res("n/a", "a repair, not a no-op"),
      P4: res("n/a", "folded into P6"), P5: tests ? (tests.differ.length ? res("stop", `${tests.differ.length} differ`) : res("pass", `${tests.run} files`)) : res("n/a", "no range tests"),
      P6: res(p6, `P1 ${p1.result}${p1.detail ? ` (${p1.detail})` : ""}, P4 ${p4.result}${p4.detail ? ` (${p4.detail})` : ""}`, { rewritten: inst.rewritten ?? null }) } };
}

/** Each state at the mount path LayerFS ran it at (nativeChain): the lead's chain at the lead's root, and an earlier
 * point as its lane ran it, its install and then its build (its lib/ output stays in the lane's tree, as the lead's
 * build does in chain0; R1 slice f031-r1-slice-e r015-1-docs-rfc.end). */
function chainParts(m) {
  const at = (root) => (root ? { root } : {}), leadRoot = m.node.points.find((q) => q.lane === "lead")?.root ?? null;
  const chain0 = m.node.chain.map((e) => ({ tree: e.tree, command: e.command, ...(e.state ? { state: e.state } : {}), ...at(leadRoot) }));
  const pointStates = (q) => [{ tree: q.treeNative, command: q.install.command, ...at(q.root) }, ...(q.tsc?.command ? [{ tree: q.treeNative, command: q.tsc.command, ...at(q.root) }] : [])];
  return { at, chain0, pointStates };
}

/** The play's trace lines of attempt `m` (runs/<run>/trace/range-NNN.aK.jsonl), ended calls only. */
export function traceOf(run, m) {
  const file = join(run.dir, "trace", `range-${pad(m.range)}.a${m.attempt}.jsonl`);
  if (!existsSync(file)) throw new Error(`range ${m.range}: no trace of attempt ${m.attempt} (${file}): the lanes' write order is not recorded`);
  return readFileSync(file, "utf8").split("\n").filter((l) => l.includes('"phase":"end"')).map((l) => JSON.parse(l));
}

/**
 * The lanes in the order of their last recorded write (owner option 1, 2026-10-19): each lane's latest end of a
 * `sandbox.exec` at one of its Node points (`<lane>.<point>.<step>#seq`, start + ms). LayerFS's `/.lww` keeps the
 * newer write and ours on a tie; ours (main) holds the earlier-merged lane, so on a tie the earlier-merged lane
 * is applied last. A lane with no recorded point exec, or one the consolidation does not merge, has no order.
 */
export function laneWriteOrder(lines, points, mergeOrder, k) {
  const lanes = [...new Set(points.map((q) => q.lane))];
  const rank = (lane) => { const r = mergeOrder.indexOf(lane); if (r < 0) throw new Error(`range ${k}: lane ${lane} is not merged in the plan's consolidation`); return r; };
  return lanes.map((lane) => {
    const prefixes = points.filter((q) => q.lane === lane).map((q) => `${lane}.${q.point}.`);
    const ends = lines.filter((l) => l.method === "sandbox.exec" && prefixes.some((p) => String(l.step ?? "").startsWith(p))).map((l) => Date.parse(l.start) + l.ms);
    if (!ends.length) throw new Error(`range ${k}: lane ${lane} has no recorded exec at its points: its write order is unknown`);
    return { lane, end: new Date(Math.max(...ends)).toISOString(), merge: rank(lane) };
  }).sort((a, b) => Date.parse(a.end) - Date.parse(b.end) || b.merge - a.merge);
}

/** The F-057 diagnostic (nodeconfig.mjs diagUnits): a lane state carries the units its captures merge by. */
const unitsOf = (run) => (diagUnits(run.manifest) ? { units: diagUnits(run.manifest) } : {});

/**
 * The chain the lead's merged node_modules carries at the repair: the lead's install and build, every lane point's
 * install and build in the order they ran, then the repair install on the checkpoint tree (its build is the tail).
 * `complete` is false until the proofs recorded every lane point's native tree.
 */
export function repairChain(run, m, k) {
  const node = nodeOf(run.manifest), { at, chain0, pointStates } = chainParts(m);
  const inst = m.closure.rows.find((r) => /install/.test(r.kind)), build = m.closure.rows.find((r) => r.kind === "build");
  const tree = git(run.manifest.repo, ["rev-parse", `${m.plan.checkpoint}^{tree}`]).trim();
  // NODE_RULE §3 R1: only the root lane changes install inputs, so only its installs change the installed
  // packages; another lane's install is a refresh of the range base's inputs (P1 at its point judges what it
  // rewrites). Replayed in one native folder, that refresh would remove what the root lane added, which the
  // merge keeps (R1 slice f031-r1-slice-e: js-yaml), so only those lanes' builds are in the chain
  const plan = JSON.parse(readFileSync(join(run.manifest.plan, `range-${pad(k)}.json`), "utf8"));
  const rootLane = node.inputsRule === "r1" ? plan.lanes.find((l) => l.areas.includes("/"))?.name ?? null : null;
  const ran = m.node.points.filter((q) => q.lane !== "lead" && q.install?.command && q.treeNative);
  // option A (fix 042): each lane's states run from the lanes' base; their captures apply in the lanes' recorded
  // write order (owner option 1, range 18 a3), so the newest writer wins a two-sided path as `/.lww` does
  const order = (plan.consolidation ?? []).filter((c) => c.op === "merge").map((c) => c.lane);
  const wrote = laneWriteOrder(traceOf(run, m), ran, order, k);
  const lanes = wrote.flatMap(({ lane, end }, rank) => ran.filter((q) => q.lane === lane).flatMap((q) => (rootLane && q.lane !== rootLane ? pointStates(q).slice(1) : pointStates(q)))
    .map((st) => ({ ...st, lane, merge: rank, wrote: end, ...unitsOf(run) })));
  const remove = lanes.length ? (plan.consolidation ?? []).filter((c) => c.op === "reconcile").flatMap((c) => c.files.filter((f) => f.op === "rm").map((f) => f.path)) : [];
  const states = [...chain0, ...lanes, { tree, command: inst.command ?? installCommand({ policy: node.storePolicy }), ...at(inst.root), clean: true, ...(remove.length ? { remove } : {}) }];
  const buildState = build ? { tree, command: build.command ?? buildCommand(build.packages), ...at(build.root) } : null;
  return { tree, states, buildState, tail: build ? { build: buildState.command, packages: build.packages, ...at(build.root) } : {},
    complete: ran.length === m.node.points.filter((q) => q.lane !== "lead").length };
}

/**
 * The devcheck's clean reinstall, natively on top of the state it runs on (devcheck.mjs, Node on): the repair's
 * chain and build, then the devcheck's command. The reinstall keeps the published main's untracked build output,
 * and pnpm links a workspace bin only when its target exists (R1 slice f031-r1-slice-f:
 * `python/sdk-runtime/node_modules/.bin/dsh-jsonrpc-agent` -> packages/ui/jsonrpc-agent/lib/bin.js), so a fresh
 * checkout's clean install is not this state's oracle. A clean install removes every node_modules first, so no
 * earlier root survives into its tree and it runs where the chain ends.
 */
export function reinstallStates(run, m, k, command) {
  if (!m.p3proofs?.["lead.repair"]) throw new Error(`range ${k}: the repair proof has not run (nodeproof.mjs proofs first)`);
  const r = repairChain(run, m, k);
  if (!r.complete) throw new Error(`range ${k}: the proofs did not record every lane point's native tree`);
  return [...r.states, ...(r.buildState ? [r.buildState] : []), { tree: r.tree, command }];
}
export const reinstallOracleFile = (metrics, k) => join(metrics, `devcheck-oracle-${pad(k)}.json`);

// ---- commands ----
// ---- commands ----

function loadRun(id) {
  const dir = join(process.env.LFS_HISTORY ?? join(process.env.HOME, "lfs-history"), "runs", id);
  return { dir, manifest: JSON.parse(readFileSync(join(dir, "run.json"), "utf8")), state: JSON.parse(readFileSync(join(dir, "state.json"), "utf8")) };
}
const oracleDir = (run) => join(run.manifest.oracle, "node-points");
const nativeName = () => `${process.env.LFS_RESOURCE_PREFIX ?? "layerfs-issue352"}-node-oracle`;
const PNPM_STORE = "layerfs-issue352-pnpm-store";

/** The chain the range's lane points start from: the lead's install this range (§2), else the run's recorded chain. */
function startChain(run, plan) {
  const node = nodeOf(run.manifest), repo = run.manifest.repo;
  const treeOf = (c) => git(repo, ["rev-parse", `${c}^{tree}`]).trim();
  if (!run.state.installed || plan.milestone) {
    const build = wholeBuild(lsTree(repo, run.state.prevCommit).files), tree = treeOf(run.state.prevCommit);
    return [{ tree, command: installCommand({ clean: !!run.state.installed, policy: node.storePolicy }) }, ...(build.packages.length ? [{ tree, command: build.command }] : [])];
  }
  return (run.state.closureChain ?? []).map((e) => ({ tree: treeOf(e.checkpoint), command: e.command, ...(e.state ? { state: e.state } : {}) }));
}

async function cmdCalibrate(o) {
  const run = loadRun(o.run), k = Number(o.range), plan = JSON.parse(readFileSync(join(run.manifest.plan, `range-${pad(k)}.json`), "utf8"));
  if (run.state.next !== k) throw new Error(`run ${o.run} is at range ${run.state.next}, not ${k}`);
  const node = nodeOf(run.manifest), repo = scratchRepo(join(oracleDir(run), "repo.git"), run.manifest.repo), blobs = new BlobCache(run.manifest.repo);
  const file = join(run.manifest.plan, `node-${pad(k)}.json`), have = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { range: k, points: [] };
  try {
    const base = lsTree(run.manifest.repo, run.state.prevCommit).files, baseTree = git(run.manifest.repo, ["rev-parse", `${run.state.prevCommit}^{tree}`]).trim();
    const points = testPoints(plan), todo = points.filter((p) => (o.point ? p.id === o.point : !have.points.some((h) => h.id === p.id)));
    if (!todo.length && have.repair && !o.repair) { console.log(`range ${k}: every point calibrated (${have.points.length}) and the native repair ran (${have.repair.verdict})`); return; }
    if (!todo.length || o.repair) { process.exitCode = await calibrateRepair(run, k, plan, have, file, { repo, base, baseTree, blobs, node }); return; }
    if (!todo.length) return;
    const pt = todo[0], chain = startChain(run, plan);
    // the lane's earlier points (as the plan builds them) are in the chain before this one
    for (const q of points.filter((p) => p.lane === pt.lane && p.order < pt.order)) chain.push({ tree: await materialize(repo, baseTree, modelDelta(plan, base, q).delta, blobs), command: installCommand({ policy: node.storePolicy }) });
    const { tree, delta } = modelDelta(plan, base, pt), treeId = await materialize(repo, baseTree, delta, blobs);
    const changed = delta.map((r) => r[0]), packages = changedPackages(tree.files, changed);
    const read = async (id) => (String(id).startsWith("decoy:") ? Buffer.from("") : blobs.get(id));
    const sel = await selectTests({ state: tree.files, changed, milestone: false, read });
    const states = [...chain, { tree: treeId, command: installCommand({ policy: node.storePolicy }) }];
    const tail = { build: pointBuild(tree.files, packages).command, packages, tests: sel.files, vitestTimeoutS: 90 };
    const t0 = Date.now(), n = sel.files.length ? cachedOracle(join(oracleDir(run), "calibration"), { repo, states, tail, inputs: inputsHash(tree.files), image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() }) : null;
    const chosen = n?.vitest?.results ? chooseFiles(n.vitest.results, n.vitest.durations, node.vitestCapMs) : { run: [], skipped: sel.files.map((file) => ({ file, reason: n ? "vitest report did not parse" : "no candidate" })), nativeMs: 0 };
    have.points = [...have.points.filter((h) => h.id !== pt.id), { id: pt.id, lane: pt.lane, point: pt.point, step: pt.step, tree: treeId, inputs: inputsHash(tree.files), packages, candidates: sel.files.length, dropped: sel.dropped,
      install: n ? { exit: n.exit } : null, tsc: n?.tsc ? { exit: n.tsc.exit, ms: n.tsc.ms } : null, vitestExit: n?.vitest?.exit ?? null, ...chosen, nativeChainMs: n?.ms ?? 0, image: run.manifest.env.LAYERFS_IMAGE }];
    writeFileSync(`${file}.tmp`, JSON.stringify(have, null, 1)); renameSync(`${file}.tmp`, file);
    console.log(JSON.stringify({ point: pt.id, tree: treeId.slice(0, 12), candidates: sel.files.length, run: chosen.run.length, skipped: chosen.skipped.length, nativeMs: chosen.nativeMs, chainMs: n?.ms ?? 0, wallMs: Date.now() - t0, left: todo.length - 1 }));
  } finally { blobs.close(); }
}

/**
 * Native first (step 2, ranges 21–30): after the points, the range's predicted repair natively, before any LayerFS
 * attempt: the start chain, each lane's points as calibrated (option A, merged in the plan's merge order; the root
 * lane's installs, the other lanes' builds, as repairChain), then the repair's clean relink on the checkpoint with
 * the reconcile's removals, the whole build and the range's tests. A broken reference (an install or build that
 * fails natively, a calibrated test that fails) is fixed before it costs an attempt. Returns the exit code: 0, or
 * 4 when the reference is broken. The real oracle is still the proofs' (recorded roots and write order).
 */
async function calibrateRepair(run, k, plan, have, file, { repo, base, baseTree, blobs, node }) {
  const planned = planClosure({ repo: run.manifest.repo, planDir: run.manifest.plan, k, plan, prevCommit: run.state.prevCommit, installed: run.state.installed, checks: false, policy: node.storePolicy, repair: node.on && !!run.state.installed, incremental: !!diagUnits(run.manifest) });
  if (planned.skipped || planned.missing) { console.log(JSON.stringify({ range: k, repair: planned.skipped ?? planned.missing })); return 4; }
  const inst = planned.steps.find((s) => /install/.test(s.kind)), build = planned.steps.find((s) => s.kind === "build"), test = planned.steps.find((s) => s.kind === "test");
  const rootLane = node.inputsRule === "r1" ? plan.lanes.find((l) => l.areas.includes("/"))?.name ?? null : null;
  const order = (plan.consolidation ?? []).filter((c) => c.op === "merge").map((c) => c.lane);
  const points = testPoints(plan), lanes = [];
  for (const lane of order) for (const q of points.filter((p) => p.lane === lane)) {
    const { tree, delta } = modelDelta(plan, base, q), id = await materialize(repo, baseTree, delta, blobs);
    const packages = changedPackages(tree.files, delta.map((r) => r[0])), b = pointBuild(tree.files, packages).command;
    const sts = [{ tree: id, command: installCommand({ policy: node.storePolicy }) }, ...(b ? [{ tree: id, command: b }] : [])];
    lanes.push(...(rootLane && lane !== rootLane ? sts.slice(1) : sts).map((st) => ({ ...st, lane, merge: order.indexOf(lane), ...unitsOf(run) })));
  }
  const remove = lanes.length ? (plan.consolidation ?? []).filter((c) => c.op === "reconcile").flatMap((c) => c.files.filter((f) => f.op === "rm").map((f) => f.path)) : [];
  const tree = git(run.manifest.repo, ["rev-parse", `${plan.checkpoint}^{tree}`]).trim();
  const states = [...startChain(run, plan), ...lanes, { tree, command: inst.command, clean: true, ...(remove.length ? { remove } : {}) }];
  const tail = { ...(build ? { build: build.command, packages: build.packages } : {}), ...(test ? { tests: test.files, vitestTimeoutS: 90 } : {}) };
  const t0 = Date.now();
  let n = null, error = null;
  try { n = cachedOracle(join(oracleDir(run), "calibration"), { repo, states, tail, inputs: "repair-calibration", image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() }); } catch (e) { error = String(e.message ?? e).slice(0, 800); }
  const failedTests = n?.vitest?.results ? Object.entries(n.vitest.results).filter(([, r]) => r !== "pass").map(([f]) => f) : [];
  const broken = error ? [`did not run: ${error}`] : [...(n.exit !== 0 ? [`repair install exit ${n.exit}`] : []), ...(build && n.tsc?.exit !== 0 ? [`build exit ${n.tsc?.exit}: ${String(n.tsc?.output ?? "").slice(-300)}`] : []),
    ...(test && !n.vitest?.results ? ["vitest report did not parse"] : []), ...(failedTests.length ? [`${failedTests.length} calibrated test(s) fail natively: ${failedTests.slice(0, 3).join(", ")}`] : [])];
  // a lane point's own install or build may fail mid-history (LayerFS runs the same): recorded, not judged
  have.repair = { verdict: broken.length ? "broken" : "ok", broken, laneExits: n?.steps?.filter((x) => x.exit !== 0).map((x) => `state ${x.i} exit ${x.exit}`) ?? [], states: states.length, lanes: [...new Set(lanes.map((l) => l.lane))].length, ran: n?.ran ?? null, exit: n?.exit ?? null, tsc: n?.tsc ? { exit: n.tsc.exit, ms: n.tsc.ms } : null,
    emitted: n?.emitted ? Object.keys(n.emitted).length : null, tests: n?.vitest?.results ? Object.keys(n.vitest.results).length : 0, installMs: n?.installMs ?? null, chainMs: n?.ms ?? null, key: n?.key ?? null };
  writeFileSync(`${file}.tmp`, JSON.stringify(have, null, 1)); renameSync(`${file}.tmp`, file);
  console.log(JSON.stringify({ range: k, repair: have.repair.verdict, broken, states: states.length, ran: n?.ran ?? null, chainMs: n?.ms ?? null, wallMs: Date.now() - t0 }));
  if (broken.length) console.log(`NATIVE REFERENCE BROKEN at range ${k}: fix it before the LayerFS attempt`);
  return broken.length ? 4 : 0;
}

/**
 * Native state snapshots (step 5, ranges 21–30; nativestate.mjs): the run's closure chain (its first `--entries`, or
 * all of it) replayed once natively and the folder tarred into the snapshot volume, as `native-state-pending.json`.
 * `--check <oracle file>` replays that cached oracle with its chain prefix replaced by the pending snapshot and
 * compares every result (equal or exit 4). `--adopt` puts the pending snapshot in the run's chain in place of the
 * states it stands for (the earlier state.json is kept beside it). Never while a range is halfway.
 */
async function cmdSavestate(o) {
  const run = loadRun(o.run), pending = join(run.dir, "native-state-pending.json");
  if (run.state.halfway) throw new Error(`run ${o.run} is halfway through range ${run.state.halfway}`);
  const chain = run.state.closureChain ?? [], treeOf = (c) => git(run.manifest.repo, ["rev-parse", `${c}^{tree}`]).trim();
  // each state at the root LayerFS ran it at (r030 a1, fix 055): tsdown writes a module's absolute path into its
  // output (CSS-module class hashes, region comments), so a snapshot built at the oracle root left other bundles
  const asState = (e) => ({ tree: treeOf(e.checkpoint), command: e.command, ...(e.root ? { root: e.root } : {}), ...(e.state ? { state: e.state } : {}) });
  const repo = scratchRepo(join(oracleDir(run), "repo.git"), run.manifest.repo), image = run.manifest.env.LAYERFS_IMAGE;
  if (o.adopt) {
    const p = JSON.parse(readFileSync(pending, "utf8"));
    const same = p.of.length <= chain.length && p.of.every((x, i) => x.checkpoint === chain[i].checkpoint && x.command === chain[i].command);
    if (!same) throw new Error("the pending snapshot is not a prefix of the run's chain");
    writeFileSync(join(run.dir, `state.pre-savestate-${Date.now()}.json`), JSON.stringify(run.state, null, 1));
    run.state.closureChain = [p.entry, ...chain.slice(p.of.length)];
    writeFileSync(join(run.dir, "state.json.tmp"), JSON.stringify(run.state, null, 1)); renameSync(join(run.dir, "state.json.tmp"), join(run.dir, "state.json"));
    console.log(JSON.stringify({ adopted: p.entry.state.file, replaces: p.of.length, chain: run.state.closureChain.map((e) => `${e.range} ${e.kind}`) }));
    return;
  }
  if (o.check) {
    const p = JSON.parse(readFileSync(pending, "utf8")), c = JSON.parse(readFileSync(o.check, "utf8"));
    const prefix = p.of.map(asState);
    if (!prefix.every((st, i) => c.states[i] && c.states[i].tree === st.tree && c.states[i].command === st.command && !!c.states[i].state === !!st.state)) throw new Error(`${o.check}: its chain does not begin with the snapshot's ${prefix.length} states`);
    const states = [{ ...p.state, ...(c.states[0].root ? { root: c.states[0].root } : {}) }, ...c.states.slice(prefix.length)];
    const n = nativeChain({ repo, states, tail: c.tail ?? {}, image: c.image, volume: PNPM_STORE, name: nativeName() });
    // what the proofs judge: build-output caches out of the groups (BUILD_GROUPS, as judgeP1), results by key
    const judged = (gs) => (gs ?? []).filter((g) => !BUILD_GROUPS.test(g.g)), sorted = (o) => (o ? Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1))) : null);
    const pairs = { exit: [c.exit, n.exit], output: [c.output, n.output], groups: [judged(c.groups), judged(n.groups)], tsc: [c.tsc?.exit ?? null, n.tsc?.exit ?? null], emitted: [sorted(c.emitted), sorted(n.emitted)], vitest: [sorted(c.vitest?.results), sorted(n.vitest?.results)] };
    const differ = Object.entries(pairs).filter(([, [a, b]]) => JSON.stringify(a) !== JSON.stringify(b)).map(([key]) => key);
    writeFileSync(join(run.dir, "native-state-check.json"), JSON.stringify({ check: o.check, differ, ...n }));
    console.log(JSON.stringify({ check: o.check.split("/").pop(), replaced: prefix.length, of: c.states.length, differ, ran: n.ran, ms: n.ms, longMs: c.ms }));
    if (differ.length) process.exitCode = 4;
    return;
  }
  const take = o.entries ? Number(o.entries) : chain.length, part = chain.slice(0, take);
  if (part.length < 2 || take > chain.length) throw new Error(`nothing to snapshot (${part.length} of ${chain.length} entries)`);
  const states = part.map(asState);
  const file = `state-${oracleKey({ tree: states.at(-1).tree, inputs: "native-state", states, tail: {}, image })}.tar`;
  execFileSync("docker", ["volume", "create", NATIVE_STATES], { stdio: "ignore" });
  const n = nativeChain({ repo, states, image, volume: PNPM_STORE, name: nativeName(), saveState: { file } });
  if (!n.saved?.sha256) throw new Error("the snapshot was not saved");
  const failed = n.steps.filter((s) => s.exit !== 0).length;
  const entry = { range: part.at(-1).range, checkpoint: part.at(-1).checkpoint, kind: "native-state", command: stateCommand(n.saved), root: null,
    state: { ...n.saved, of: part.map((e) => `${e.range} ${e.kind}`), states: states.length, ms: n.ms, at: new Date().toISOString() } };
  writeFileSync(pending, JSON.stringify({ entry, state: { tree: states.at(-1).tree, command: entry.command, state: entry.state }, of: part.map(({ checkpoint, command, range, kind }) => ({ checkpoint, command, range, kind })) }, null, 1));
  console.log(JSON.stringify({ pending, file, sha256: n.saved.sha256.slice(0, 12), bytes: n.saved.bytes, states: states.length, failedSteps: failed, ran: n.ran, ms: n.ms }));
}

/** NODE_RULE §11 b, per range: each lane step's install inputs (plan order, the plan as frozen) through a frozen offline install natively; cached per inputs hash. */
async function cmdInputs(o) {
  const run = loadRun(o.run), k = Number(o.range), plan = JSON.parse(readFileSync(join(run.manifest.plan, `range-${pad(k)}.json`), "utf8"));
  const node = nodeOf(run.manifest), repo = scratchRepo(join(oracleDir(run), "repo.git"), run.manifest.repo), blobs = new BlobCache(run.manifest.repo);
  try {
    const base = lsTree(run.manifest.repo, run.state.prevCommit).files, baseTree = git(run.manifest.repo, ["rev-parse", `${run.state.prevCommit}^{tree}`]).trim();
    const rows = [], seen = new Map();
    for (const l of plan.lanes) {
      const steps = plan.steps.filter((s) => s.lane === l.name && ["fs", "apply", "stale-apply"].includes(s.kind)).sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
      for (let i = 0; i < steps.length; i++) {
        const { tree, delta } = modelDelta(plan, base, { before: steps.slice(0, i + 1).map((s) => s.id) }), inputs = inputsHash(tree.files);
        if (!seen.has(inputs)) {
          // only the install inputs travel: the tree is the base's inputs plus the step's (a frozen install reads nothing else)
          const only = delta.filter((r) => /(^|\/)(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|\.npmrc)$/.test(r[0]) && !r[0].includes("node_modules/"));
          const id = await materialize(repo, baseTree, only, blobs), file = join(oracleDir(run), "inputs", `${inputs}.${node.storePolicy}.json`);
          let r = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
          if (!r) {
            const n = nativeChain({ repo, states: [{ tree: id, command: installCommand({ policy: node.storePolicy }) }], image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() });
            r = { inputs, exit: n.exit, outdated: /ERR_PNPM_OUTDATED_LOCKFILE/.test(n.output), policy: /ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION/.test(n.output), ms: n.ms };
            mkdirSync(join(oracleDir(run), "inputs"), { recursive: true }); writeFileSync(file, JSON.stringify(r));
          }
          seen.set(inputs, r);
        }
        rows.push({ lane: l.name, step: steps[i].id, inputs, consistent: seen.get(inputs).exit === 0 });
      }
    }
    const out = { range: k, policy: node.storePolicy, rule: node.inputsRule, total: rows.length, consistent: rows.filter((r) => r.consistent).length, states: seen.size, rows };
    writeFileSync(join(run.manifest.plan, `inputs-${pad(k)}.json`), JSON.stringify(out, null, 1));
    console.log(JSON.stringify({ range: k, consistent: out.consistent, total: out.total, states: out.states }));
  } finally { blobs.close(); }
}

/** The devcheck's on-top reinstall oracle (reinstallStates), cached, into metrics/devcheck-oracle-k.json; run on the host before devcheck. */
async function cmdReinstall(o) {
  const run = loadRun(o.run), k = Number(o.range), metrics = run.manifest.outputs.metrics;
  const files = readdirSync(metrics).filter((f) => new RegExp(`^range-${pad(k)}\\.a(\\d+)\\.json$`).test(f));
  const a = o.attempt ?? Math.max(...files.map((f) => Number(/\.a(\d+)\./.exec(f)[1])));
  const m = JSON.parse(readFileSync(join(metrics, `range-${pad(k)}.a${a}.json`), "utf8"));
  const steps = devSteps(m.closure), step = steps.find((s) => s.kind === "reinstall-check"), rebuild = steps.find((s) => s.kind === "rebuild");
  if (!step) { console.log(JSON.stringify({ range: k, attempt: a, reinstall: false })); return; }
  const repo = scratchRepo(join(oracleDir(run), "repo.git"), run.manifest.repo);
  // the rebuild check's native rerun (design 8) after the reinstall, its whole --verbose output for the states
  const tail = rebuild ? { build: rebuild.command, packages: rebuild.packages, outputBytes: 1 << 20 } : {};
  const n = cachedOracle(oracleDir(run), { repo, states: reinstallStates(run, m, k, step.command), tail, inputs: "reinstall-check", image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() });
  const file = reinstallOracleFile(metrics, k);
  writeFileSync(`${file}.tmp`, JSON.stringify({ range: k, attempt: a, kind: "on-top", key: n.key, cached: n.cached, command: step.command, exit: n.exit, root: n.root, listerVersion: LISTER_VERSION, groups: n.groups, normalized: n.normalized,
    rebuild: rebuild && n.tsc ? { command: rebuild.command, exit: n.tsc.exit, ms: n.tsc.ms, states: tscStates(n.tsc.output, n.root) } : null, ms: n.ms }, null, 1));
  renameSync(`${file}.tmp`, file);
  console.log(JSON.stringify({ range: k, attempt: a, file, exit: n.exit, groups: n.groups.length, cached: n.cached, ms: n.ms }));
}

/** The proofs of a played attempt (see the header): native oracles per recorded point, P1–P6, the p3 object refilled, the report again. */
async function cmdProofs(o) {
  const run = loadRun(o.run), k = Number(o.range), budget = Number(o["budget-s"] ?? 90) * 1000, t0 = Date.now();
  const metrics = run.manifest.outputs.metrics, files = readdirSync(metrics).filter((f) => new RegExp(`^range-${pad(k)}\\.a(\\d+)\\.json$`).test(f));
  const a = o.attempt ?? Math.max(...files.map((f) => Number(/\.a(\d+)\./.exec(f)[1])));
  const mfile = join(metrics, `range-${pad(k)}.a${a}.json`), m = JSON.parse(readFileSync(mfile, "utf8"));
  if (!m.node?.points?.length) throw new Error(`${mfile}: no Node points recorded`);
  // step 3 (liaison 2026-10-20): a stop caused only by the oracle, harness or report is re-judged on the attempt's
  // retained state after the fix (`--rejudge "fix NNN"`, first proofs command only): its proofs are judged again,
  // nothing is replayed and no timing is measured again; the earlier results are kept beside it
  if (o.rejudge) {
    if (typeof o.rejudge !== "string" || !/^fix \d{3}/.test(o.rejudge)) throw new Error('--rejudge takes the fix, as "fix NNN"');
    if (!m.p3proofs) throw new Error(`${mfile}: no proofs to re-judge`);
    m.rejudged = [...(m.rejudged ?? []), { after: o.rejudge, at: new Date().toISOString(), proofs: Object.fromEntries(Object.entries(m.p3proofs).map(([id, p]) => [id, Object.fromEntries(Object.entries(p.proofs ?? {}).map(([n, r]) => [n, r.result]))])), gate: m.gate?.verdict ?? m.gateBeforeProofs?.verdict ?? null }];
    delete m.p3proofs;
    // a native state remade for the same states (fix 055: rebuilt at LayerFS's roots) stands in for the one the attempt
    // recorded; the swap is kept in the metrics
    const now = run.state.closureChain?.[0], was = m.node.chain?.[0];
    if (now?.state && was?.state && now.state.sha256 !== was.state.sha256 && JSON.stringify(now.state.of) === JSON.stringify(was.state.of)) {
      m.node.chainRestated = [...(m.node.chainRestated ?? []), { after: o.rejudge, from: was.state.file, to: now.state.file, of: now.state.of }];
      m.node.chain[0] = { ...was, command: now.command, state: now.state };
    }
  }
  const node = nodeOf(run.manifest), repo = scratchRepo(join(oracleDir(run), "repo.git"), run.manifest.repo), blobs = new BlobCache(run.manifest.repo);
  const proofs = (m.p3proofs ??= {});
  // fail loud: a native reference that did not prove it ran leaves its proofs NOT_RUN with the reason, never a fallback
  const tryNative = (args) => { try { return { native: cachedOracle(oracleDir(run), args), error: null }; } catch (e) { return { native: null, error: String(e.message ?? e).slice(0, 600) }; } };
  const notRun = (judged, error) => { if (error) for (const r of Object.values(judged)) if (r.result === "NOT_RUN") Object.assign(r, { detail: `native reference did not run: ${error}` }); return judged; };
  let left = 0;
  try {
    const baseTree = m.node.baseTree, { at, chain0, pointStates } = chainParts(m);
    for (const pt of m.node.points) {
      if (proofs[pt.id]) continue;
      if (Date.now() - t0 > budget) { left++; continue; }
      const tree = pt.lane === "lead" ? pt.tree : await materialize(repo, baseTree, pt.delta, blobs);
      const treeOk = !pt.treeLfs || pt.treeLfs === tree;
      const states = pt.lane === "lead" ? [{ tree, command: pt.install.command, ...at(pt.root) }] : [...chain0, ...m.node.points.filter((q) => q.lane === pt.lane && q.order < pt.order).flatMap(pointStates), { tree, command: pt.install.command, ...at(pt.root) }];
      const tail = { build: pt.tsc?.command ?? null, packages: pt.tsc?.packages ?? [], tests: pt.vitest?.files ?? [], vitestTimeoutS: 90 };
      const { native, error } = treeOk ? tryNative({ repo, states, tail, inputs: pt.inputs, image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() }) : { native: null, error: null };
      const groups = existsSync(groupsFile(run, k, pt.id)) ? JSON.parse(readFileSync(groupsFile(run, k, pt.id), "utf8")) : null;
      const before = pt.lane === "lead" ? null : [m.node.points.find((q) => q.lane === "lead"), ...m.node.points.filter((q) => q.lane === pt.lane && q.order < pt.order)].filter(Boolean).at(-1);
      const prev = pt.lane === "lead" ? null : before?.inputs ?? m.node.chainInputs ?? null;
      const cal = m.node.calibration?.points?.find((c) => c.id === pt.id) ?? null;
      pt.treeNative = tree;
      proofs[pt.id] = { tree, treeOk, kind: pt.kind, cached: !!native?.cached, key: native?.key ?? null, nativeMs: native?.ms ?? null, nativeInstallMs: native?.installMs ?? null, nativeTscMs: native?.tsc?.ms ?? null, nativeVitestMs: native?.vitest?.ms ?? null, proofs: notRun(judgePoint({ ...pt, tree }, native, { groups, prevInputs: prev, calibration: cal, treeOk }), error),
        native: native ? { install: native.exit, tsc: native.tsc?.exit ?? null, vitest: native.vitest?.exit ?? null } : null, ran: native?.ran ?? null, ...(error ? { nativeError: error } : {}) };
      console.error(`${pt.id}: ${Object.entries(proofs[pt.id].proofs).map(([id, r]) => `${id} ${r.result}`).join(" · ")} (native ${error ? `FAILED: ${error}` : native?.cached ? "cached" : `${native?.ms ?? 0} ms`}${native?.ran ? `; ran ${JSON.stringify(native.ran)}` : ""})`);
    }
    // the repair (P6) on top of the chain its merged node_modules carries: the lead's install and build, every lane
    // point's install and build in the order they ran, then the repair install and build on the checkpoint tree
    const inst = m.closure?.rows?.find((r) => /install/.test(r.kind));
    if (inst && !proofs["lead.repair"] && Date.now() - t0 <= budget) {
      const r = repairChain(run, m, k), tree = r.tree;
      const { native, error } = r.complete ? tryNative({ repo, states: r.states, tail: r.tail, inputs: "repair", image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() }) : { native: null, error: null };
      const groups = m.closure.repairGroups && existsSync(m.closure.repairGroups) ? JSON.parse(readFileSync(m.closure.repairGroups, "utf8")) : null;
      proofs["lead.repair"] = judgeRepair({ ...m.closure, tree }, native, { groups, nativeMs: native?.ms ?? null });
      if (proofs["lead.repair"]) Object.assign(proofs["lead.repair"], { ran: native?.ran ?? null, ...(error ? { nativeError: error } : {}) });
      if (proofs["lead.repair"] && error) proofs["lead.repair"].proofs.P6 = res("NOT_RUN", `native reference did not run: ${error}`);
      // decision B: the native clean on the checkpoint, beside the lead's (metrics git.lead.cleaned); a failed native clean is a proof not run
      if (proofs["lead.repair"] && native) {
        proofs["lead.repair"].nativeCleaned = native.cleaned ?? null;
        if (!native.cleaned?.length || native.cleaned.some((c) => c.files < 0)) proofs["lead.repair"].proofs.P6 = res("NOT_RUN", "the native clean before the repair did not run");
      }
    } else if (inst && !proofs["lead.repair"]) left++;
  } finally { blobs.close(); }
  const { fillP3 } = await import("./p3record.mjs");
  m.p3 = fillP3(m, { groupsOf: (id) => (existsSync(groupsFile(run, k, id)) ? JSON.parse(readFileSync(groupsFile(run, k, id), "utf8")) : null) });
  // the gate stored at the play's end judged these proofs NOT_RUN: kept as it was, and the report evaluates the
  // attempt again with them (frozen.mjs storeGate stores the new one)
  if (m.gate && !m.gateBeforeProofs) { m.gateBeforeProofs = m.gate; delete m.gate; } else if (m.gate) delete m.gate;
  writeFileSync(`${mfile}.tmp`, JSON.stringify(m, null, 1)); renameSync(`${mfile}.tmp`, mfile);
  const r = spawnSync("node", [join(new URL(".", import.meta.url).pathname, "report.mjs"), "--metrics", metrics, "--plan", run.manifest.plan, "--docs", run.manifest.outputs.docs, "--oracle", run.manifest.oracle, "--range", String(k)], { encoding: "utf8" });
  process.stdout.write(r.stdout); process.stderr.write(r.stderr);
  console.log(JSON.stringify({ range: k, attempt: a, points: Object.keys(proofs).length, left, ms: Date.now() - t0 }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, ...rest] = process.argv.slice(2), o = {};
  for (let i = 0; i < rest.length; i++) if (rest[i].startsWith("--")) o[rest[i].slice(2)] = rest[i + 1] == null || rest[i + 1].startsWith("--") ? true : rest[++i];
  const run = { calibrate: cmdCalibrate, inputs: cmdInputs, proofs: cmdProofs, reinstall: cmdReinstall, savestate: cmdSavestate }[cmd];
  // QUIET (quiet.mjs): these native replays are part of the attempt; a failure releases it
  const { holdQuiet, releaseQuiet } = await import("./quiet.mjs");
  if (run && o.run && ["calibrate", "proofs", "savestate"].includes(cmd)) { const q = holdQuiet(o.run, `nodeproof ${cmd}`); if (q.overlap) console.error(q.why); process.on("exit", (c) => { if (c && c !== 3 && c !== 4) releaseQuiet(o.run); }); }
  if (!run || !o.run || (!o.range && cmd !== "savestate")) { console.error("usage: nodeproof.mjs calibrate|inputs|proofs|reinstall --run <id> --range k [--point id] [--repair] [--attempt a] [--budget-s s] [--rejudge \"fix NNN\"] | savestate --run <id> [--entries n | --check <oracle file> | --adopt]"); process.exit(2); }
  run(o).catch((e) => { console.error(e.stack ?? e); process.exit(1); });
}
