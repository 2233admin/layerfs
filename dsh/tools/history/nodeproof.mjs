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
import { join } from "node:path";
import { BlobCache, lsTree } from "./git.mjs";
import { compareInstalled, LISTER_VERSION, listerCommand, normalizeOutput, ORACLE_ROOT, parseLister, rootless, STORE_MOUNT, firstDifference } from "./closure.mjs";
import { emittedCommand, groupsFile, inputsHash, nodeOf, parseEmitted, pointBuild, testPoints, treeDelta, wholeBuild, changedPackages } from "./nodelanes.mjs";
import { buildCommand, tscStates } from "./closure.mjs";
import { BUILD_GROUPS, vitestMessages } from "./nodeconfig.mjs";
export { BUILD_GROUPS };
import { selectTests, vitestCommand } from "./unit-tests.mjs";
import { devSteps } from "./devcheck.mjs";
import { decoyBytes, pad, Tree } from "./steps.mjs";
import { installCommand } from "./closure.mjs";

export const PROOFS = ["P1", "P2", "P3", "P4", "P5", "P6"];
/** pnpm's state files: the only paths a no-op refresh may change (P3). */
export const STATE_FILES = /^(.*\/)?node_modules\/(\.modules\.yaml|\.pnpm\/lock\.yaml|\.pnpm-workspace-state(-v\d+)?\.json)$/;

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
export function nativeChain({ repo, states, tail = {}, image, volume, name }) {
  const stage = mkdtempSync(join(tmpdir(), "lfs352-chain-"));
  try {
    const script = [`mkdir ${ORACLE_ROOT} /seq && tar -x -C /seq && cd ${ORACLE_ROOT}`];
    let prev = null, at = ORACLE_ROOT;
    const earlier = [], moveTo = (root) => {
      if (!root || root === at) return;
      if (!/^\/[\w./-]+$/.test(root) || root.split("/").includes("..")) throw new Error(`native chain: root ${root} is not a plain absolute path`);
      script.push(`mkdir -p ${root.slice(0, root.lastIndexOf("/")) || "/"} && mv ${at} ${root} && cd ${root}`);
      earlier.push(at); at = root;
    };
    states.forEach((st, i) => {
      moveTo(st.root);
      if (st.tree !== prev) {
        if (!existsSync(join(stage, `${st.tree}.tar`))) writeFileSync(join(stage, `${st.tree}.tar`), execFileSync("git", ["--git-dir", repo, "archive", st.tree], { maxBuffer: 1 << 30 }));
        // -m: the files get the time of the extraction, as a checkout's (and a LayerFS step's) writes do; with the
        // archive's commit times tsc -b and pnpm take changed sources as older than their outputs and skip them
        // (f031-slice-f r015: native "Already up to date" and tsc exit 0 where LayerFS rebuilt and failed)
        script.push(`tar -x -m -C ${at} -f /seq/${st.tree}.tar`);
        if (prev) {
          writeFileSync(join(stage, `${i}.del`), git(repo, ["diff", "--no-renames", "--name-only", "--diff-filter=D", prev, st.tree]));
          script.push(`while IFS= read -r f; do rm -f -- "$f"; done < /seq/${i}.del`);
        }
        prev = st.tree;
      }
      script.push(i < states.length - 1 ? `t=$(date +%s%N); (${st.command}) > /tmp/s${i} 2>&1; e=$?; echo "@@step ${i} $e $(( ($(date +%s%N) - t) / 1000000 ))"`
        : `t=$(date +%s%N); (${st.command}) > /tmp/o 2>&1; echo "@@exit $? $(( ($(date +%s%N) - t) / 1000000 ))"; sed 's/^/@@out /' /tmp/o; ${listerCommand([], { roots: [...new Set(earlier)] })}`);
    });
    moveTo(tail.root);
    if (tail.build) script.push(`t=$(date +%s%N); (${tail.build}) > /tmp/b 2>&1; echo "@@tsc $? $(( ($(date +%s%N) - t) / 1000000 ))"; tail -c ${tail.outputBytes ?? 4000} /tmp/b | sed 's/^/@@tscout /'`, `${emittedCommand(tail.packages ?? [])} | sed 's/^/@@emit /'`);
    if (tail.tests?.length) script.push(`t=$(date +%s%N); (${vitestCommand(tail.tests, tail.vitestTimeoutS ?? 100)}) > /tmp/v 2>/dev/null; echo "@@vt $? $(( ($(date +%s%N) - t) / 1000000 ))"; echo "@@vtjson $(base64 -w0 /tmp/v)"`);
    const input = execFileSync("tar", ["-c", "-C", stage, "."], { maxBuffer: 1 << 30 });
    const t0 = Date.now();
    const r = spawnSync("docker", ["run", "--rm", "-i", "--name", name, "--network", "none", "-v", `${volume}:${STORE_MOUNT}:ro`, "--entrypoint", "sh", image, "-c", script.join("; ")], { input, encoding: "utf8", maxBuffer: 1 << 28 });
    if (r.status !== 0) throw new Error(`native chain container exited ${r.status}: ${String(r.stderr).slice(-300)}`);
    const lines = r.stdout.split("\n"), pick = (p) => lines.filter((l) => l.startsWith(p)).map((l) => l.slice(p.length));
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
      emitted: tail.build ? parseEmitted(pick("@@emit ").join("\n")) : null, vitest, ms: Date.now() - t0, root: at,
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
export const CHAIN_VERSION = 2;
export const oracleKey = ({ tree, inputs, states, tail, image }) => createHash("sha256").update(JSON.stringify({ v: LISTER_VERSION, chain: CHAIN_VERSION, tree, inputs, states, tail, image })).digest("hex").slice(0, 24);

/** The native oracle of one point, cached under `dir` by its key. */
export function cachedOracle(dir, args) {
  const key = oracleKey({ tree: args.states.at(-1).tree, inputs: args.inputs, states: args.states, tail: args.tail, image: args.image });
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
/** P1: the installed tree against native, file by file (lister groups), build-output caches left out; roots and timestamps normalized and counted. */
export function judgeP1(native, groups, normalized) {
  if (!native?.groups || !groups) return res("NOT_RUN", "no lister on one side");
  const keep = (gs) => gs.filter((g) => !BUILD_GROUPS.test(g.g));
  const c = compareInstalled({ groups: keep(native.groups) }, keep(groups));
  const count = (n) => (n?.shims?.files ?? 0) + Object.keys(n ?? {}).filter((k) => k.startsWith("node_modules/")).length;
  return c.ok ? res("pass", null, { normalized: count(normalized) }) : res("stop", `missing ${c.missing.length}, extra ${c.extra.length}, differ ${c.differ.length}: ${[...c.missing, ...c.extra, ...c.differ].slice(0, 3).join(", ")}`, { normalized: count(normalized) });
}
/** P2: pnpm's exit and output equal native, each root as <root>. */
export function judgeP2(native, install, root) {
  if (!native || !install) return res("NOT_RUN", "no install on one side");
  if (native.exit !== install.exitCode) return res("stop", `exit ${install.exitCode}, native ${native.exit}`);
  const a = rootless(install.output, root), b = rootless(native.output, native.root ?? ORACLE_ROOT);
  return a === b ? res("pass", `exit ${native.exit}`) : res("stop", firstDifference(b, a));
}
/**
 * P3: a no-op refresh (install inputs unchanged since the chain's last install) changes only pnpm's state files.
 * When its mount root moved from the previous install's (`prevRoot`; every LayerFS mount gets a new path),
 * pnpm skips its up-to-date shortcut (its workspace state keys projects by absolute path) and rewrites what
 * carries the root (bin shims, hoisted links): any path inside node_modules is then allowed, and P1 judges
 * those files against native run at the same roots. A path outside node_modules is a stop either way.
 */
export function judgeP3(pt, prevInputs, prevRoot = null) {
  if (pt.kind !== "refresh") return res("n/a", "an install, not a refresh");
  if (prevInputs != null && prevInputs !== pt.inputs) return res("n/a", "install inputs changed: not a no-op");
  const changed = pt.install?.changed;
  if (!Array.isArray(changed)) return res("NOT_RUN", "changed paths not recorded");
  const moved = prevRoot != null && pt.root != null && prevRoot !== pt.root;
  const other = changed.filter((p) => !STATE_FILES.test(p) && !(moved && /(^|\/)node_modules\//.test(p)));
  const kept = changed.length - other.length;
  return other.length ? res("stop", `${other.length} non-state path(s): ${other.slice(0, 3).join(", ")}`)
    : res("pass", moved ? `${kept} path(s) in node_modules, root moved` : `${kept} state file(s)`);
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
export function judgePoint(pt, native, { groups, prevInputs, prevRoot = null, calibration, treeOk }) {
  if (!treeOk) {
    const why = `tree differs: LayerFS ${String(pt.treeLfs ?? "none").slice(0, 12)}, native ${String(pt.tree ?? "none").slice(0, 12)}`;
    return Object.fromEntries(PROOFS.map((id) => [id, id === "P6" ? res("n/a", "not a repair") : res("NOT_RUN", why)]));
  }
  return { P1: judgeP1(native, groups, pt.lister?.normalized), P2: judgeP2(native, pt.install, pt.root), P3: pt.lane === "lead" ? res("n/a", "the lead's first install") : judgeP3(pt, prevInputs, prevRoot),
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
  const chain0 = m.node.chain.map((e) => ({ tree: e.tree, command: e.command, ...at(leadRoot) }));
  const pointStates = (q) => [{ tree: q.treeNative, command: q.install.command, ...at(q.root) }, ...(q.tsc?.command ? [{ tree: q.treeNative, command: q.tsc.command, ...at(q.root) }] : [])];
  return { at, chain0, pointStates };
}

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
  const lanes = ran.flatMap((q) => (rootLane && q.lane !== rootLane ? pointStates(q).slice(1) : pointStates(q)));
  const states = [...chain0, ...lanes, { tree, command: inst.command ?? installCommand({ policy: node.storePolicy }), ...at(inst.root) }];
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
  return (run.state.closureChain ?? []).map((e) => ({ tree: treeOf(e.checkpoint), command: e.command }));
}

async function cmdCalibrate(o) {
  const run = loadRun(o.run), k = Number(o.range), plan = JSON.parse(readFileSync(join(run.manifest.plan, `range-${pad(k)}.json`), "utf8"));
  if (run.state.next !== k) throw new Error(`run ${o.run} is at range ${run.state.next}, not ${k}`);
  const node = nodeOf(run.manifest), repo = scratchRepo(join(oracleDir(run), "repo.git"), run.manifest.repo), blobs = new BlobCache(run.manifest.repo);
  const file = join(run.manifest.plan, `node-${pad(k)}.json`), have = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { range: k, points: [] };
  try {
    const base = lsTree(run.manifest.repo, run.state.prevCommit).files, baseTree = git(run.manifest.repo, ["rev-parse", `${run.state.prevCommit}^{tree}`]).trim();
    const points = testPoints(plan), todo = points.filter((p) => (o.point ? p.id === o.point : !have.points.some((h) => h.id === p.id)));
    if (!todo.length) { console.log(`range ${k}: every point calibrated (${have.points.length})`); return; }
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
  const node = nodeOf(run.manifest), repo = scratchRepo(join(oracleDir(run), "repo.git"), run.manifest.repo), blobs = new BlobCache(run.manifest.repo);
  const proofs = (m.p3proofs ??= {});
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
      const native = treeOk ? cachedOracle(oracleDir(run), { repo, states, tail, inputs: pt.inputs, image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() }) : null;
      const groups = existsSync(groupsFile(run, k, pt.id)) ? JSON.parse(readFileSync(groupsFile(run, k, pt.id), "utf8")) : null;
      const before = pt.lane === "lead" ? null : [m.node.points.find((q) => q.lane === "lead"), ...m.node.points.filter((q) => q.lane === pt.lane && q.order < pt.order)].filter(Boolean).at(-1);
      const prev = pt.lane === "lead" ? null : before?.inputs ?? m.node.chainInputs ?? null;
      const cal = m.node.calibration?.points?.find((c) => c.id === pt.id) ?? null;
      pt.treeNative = tree;
      proofs[pt.id] = { tree, treeOk, kind: pt.kind, cached: !!native?.cached, key: native?.key ?? null, nativeMs: native?.ms ?? null, nativeInstallMs: native?.installMs ?? null, nativeTscMs: native?.tsc?.ms ?? null, nativeVitestMs: native?.vitest?.ms ?? null, proofs: judgePoint({ ...pt, tree }, native, { groups, prevInputs: prev, prevRoot: before?.root ?? null, calibration: cal, treeOk }),
        native: native ? { install: native.exit, tsc: native.tsc?.exit ?? null, vitest: native.vitest?.exit ?? null } : null };
      console.error(`${pt.id}: ${Object.entries(proofs[pt.id].proofs).map(([id, r]) => `${id} ${r.result}`).join(" · ")} (native ${native?.cached ? "cached" : `${native?.ms ?? 0} ms`})`);
    }
    // the repair (P6) on top of the chain its merged node_modules carries: the lead's install and build, every lane
    // point's install and build in the order they ran, then the repair install and build on the checkpoint tree
    const inst = m.closure?.rows?.find((r) => /install/.test(r.kind));
    if (inst && !proofs["lead.repair"] && Date.now() - t0 <= budget) {
      const r = repairChain(run, m, k), tree = r.tree;
      const native = r.complete ? cachedOracle(oracleDir(run), { repo, states: r.states, tail: r.tail, inputs: "repair", image: run.manifest.env.LAYERFS_IMAGE, volume: PNPM_STORE, name: nativeName() }) : null;
      const groups = m.closure.repairGroups && existsSync(m.closure.repairGroups) ? JSON.parse(readFileSync(m.closure.repairGroups, "utf8")) : null;
      proofs["lead.repair"] = judgeRepair({ ...m.closure, tree }, native, { groups, nativeMs: native?.ms ?? null });
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
  const run = { calibrate: cmdCalibrate, inputs: cmdInputs, proofs: cmdProofs, reinstall: cmdReinstall }[cmd];
  if (!run || !o.run || !o.range) { console.error("usage: nodeproof.mjs calibrate|inputs|proofs|reinstall --run <id> --range k [--point id] [--attempt a] [--budget-s s]"); process.exit(2); }
  run(o).catch((e) => { console.error(e.stack ?? e); process.exit(1); });
}
