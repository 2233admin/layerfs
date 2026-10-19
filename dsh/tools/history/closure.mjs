#!/usr/bin/env node
// A range's closure from P3 on (INSTALLS.md, SPEC §2): a real `pnpm install`
// inside the Workspace from a pnpm store outside it, `tsc -b` of the changed
// packages, the calibrated unit tests; each a one-shot exec with its own
// Commit. And the node_modules oracle: the tree a native install of the same
// lockfile makes in the same image, network off.
//   node dsh/tools/history/closure.mjs check-plan --repo <dsh.git> --plan <dir>
//   node dsh/tools/history/closure.mjs oracle --repo <dsh.git> --plan <dir> --range k --image I --volume V
// check-plan lists the ranges whose plan install flag differs from git (an
// install input changed). oracle writes ~/lfs-history/oracle/node_modules/<lockfile blob>.json
// once per lockfile (a cached one is kept): pnpm's exit status and output
// (timing removed) and the installed tree as digests per package folder.
//
// Store access (decided 2026-10-18 from native runs, range 15, pnpm 11.7.0):
// pnpm cannot install from a read-only store directly. Its store index
// (v11/index.db) is SQLite opened read-write in WAL mode ("unable to open
// database file" on a read-only mount), and offline it asks the registry
// unless its cache holds the lockfile's verification record
// (lockfile-verified.jsonl, written by the fetch). So each install gets a
// private writable layer in the Sandbox's /tmp, outside the Workspace
// (INSTALLS §3.2): a copy of the index (15 MB at 81 lockfiles) and of the
// verification records (73 KB), with links to the read-only package files
// and registry metadata. Nothing is written to the store volume. Measured:
// exit 0, "Done in 3.8s", --network none.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { lsTree } from "./git.mjs";
import { compareResults, packageOf, parseVitestJson, vitestCommand } from "./unit-tests.mjs";
import { BUILD_GROUPS, emittedCommand, nodeOf, parseEmitted, pointBuild, PRUNE_EMPTY, wholeBuild } from "./nodeconfig.mjs";

const pad = (n) => String(n).padStart(3, "0");
const quote = (t) => `'${String(t).replaceAll("'", "'\\''")}'`;

/** Where the store volume is mounted in a Sandbox: outside /workspaces and /layerfs-*. */
export const STORE_MOUNT = "/pnpm-store";
/**
 * The Sandbox's read-only volumes for P3 (INSTALLS §3.1): the argument
 * `sandbox.create` takes once the product change for read-only volume mounts
 * lands (`{ volumes }`; not in sdk/ today). setup() passes it for a closure phase.
 */
export const sandboxVolumes = (volume) => ({ volumes: [{ volume, target: STORE_MOUNT, readOnly: true }] });
/** A file whose change makes a range install (INSTALLS §1: package.json or the lockfile; the workspace and .npmrc steer the same install). */
export const INSTALL_INPUT = /(^|\/)(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|\.npmrc)$/;
export const installInputsChanged = (paths) => paths.some((p) => INSTALL_INPUT.test(p) && !p.includes("node_modules/"));

/** The private writable store and cache in /tmp over the read-only store (see the header). */
export const storeSetup = (store = STORE_MOUNT) => [
  "mkdir -p /tmp/pnpm-cache /tmp/pnpm-store",
  `for d in ${store}/.cache/*/; do ln -sfn "\${d%/}" /tmp/pnpm-cache/; done`,
  `cp ${store}/.cache/lockfile-verified.jsonl /tmp/pnpm-cache/`,
  `for v in ${store}/v*/; do v=\${v%/}; n=\${v##*/}; mkdir -p /tmp/pnpm-store/$n && cp "$v/index.db" /tmp/pnpm-store/$n/ && ln -sfn "$v/files" /tmp/pnpm-store/$n/files; done`,
].join(" && ");
/** The install (INSTALLS §1); `clean` at milestones removes node_modules first. */
export const CLEAN_REMOVE = "find . -name node_modules -type d -prune -exec rm -rf {} +";
/**
 * How the store meets dsh's `minimumReleaseAge` policy (NODE_RULE §11 a; owner decision pending, so a switch):
 * `verified` keeps dsh's config (the store must hold a verification record per lockfile); `release-age-off`
 * departs from it with the one override that disables the check offline.
 */
export const STORE_POLICIES = { verified: "", "release-age-off": "pnpm_config_minimum_release_age=0 " };
/** NODE_RULE B3: a store gap fails at once instead of hanging on network retries (§11). */
export const FAIL_FAST = "--fetch-retries=0 --fetch-timeout=3000";
/** A NODE_RULE point's install (nodelanes.mjs): empty folders pruned first (a replayed removal leaves them; tsdown takes each as a package). */
export const pointInstall = ({ clean = false, policy = "verified" } = {}) => `${PRUNE_EMPTY} && ${installCommand({ clean, policy })}`;

export function installCommand({ store = STORE_MOUNT, clean = false, policy = "verified" } = {}) {
  if (!(policy in STORE_POLICIES)) throw new Error(`store policy ${policy}: one of ${Object.keys(STORE_POLICIES).join(", ")}`);
  const install = `${STORE_POLICIES[policy]}pnpm install --offline --frozen-lockfile --store-dir /tmp/pnpm-store --cache-dir /tmp/pnpm-cache --ignore-scripts ${FAIL_FAST}`;
  // clean (lead interim yes 2026-10-18, from P3 on): every node_modules folder goes, not only the root's; a package
  // that left the workspace keeps its untracked node_modules otherwise (dev352-p3p r016, packages/core/agent-core)
  return `${storeSetup(store)} && ${clean ? `${CLEAN_REMOVE} && ` : ""}${install}`;
}
export const buildCommand = (packages) => `./node_modules/.bin/tsc -b ${packages.map(quote).join(" ")}`;
/** The rebuild check's command: the same build again, reporting each project's state (owner 2026-10-18, design 8). */
export const rebuildCommand = (packages) => `./node_modules/.bin/tsc -b --verbose ${packages.map(quote).join(" ")}`;

/**
 * What `tsc -b --verbose` says about each project: up to date, out of date or
 * built, by tsconfig path relative to `root` (the tree's folder), sorted.
 * The reasons name files chosen by mtime, so only the states are compared;
 * the clock prefix is dropped.
 */
export function tscStates(text, root = "") {
  const out = new Map();
  for (const raw of String(text).split("\n")) {
    // tsc's time prefix: "[6:19:48 AM] " on a terminal, "6:19:48 AM - " without one (dev352-p3e r015)
    const l = raw.replace(/^\[[^\]]*\]\s*/, "").replace(/^\d{1,2}:\d{2}:\d{2}(\s?[AP]M)? - /, "").replaceAll(root ? `'${root}/` : "\0", "'");
    let m = /^Project '([^']+)' is (up to date|out of date)/.exec(l);
    if (m) { if (out.get(m[1]) !== "built") out.set(m[1], m[2]); continue; }
    m = /^Building project '([^']+)'/.exec(l);
    if (m) out.set(m[1], "built");
  }
  return [...out].sort(([a], [b]) => a.localeCompare(b)).map(([project, state]) => `${project} ${state}`);
}
/** True when a rebuild reports its projects and none to build; no parsed project state is not "nothing to build". */
export const nothingToBuild = (states) => states.length > 0 && states.every((l) => !/ (built|out of date)$/.test(l));

/**
 * The closure steps of one range, in order: install (first, incremental where
 * an install input changed, clean at a milestone), build of the changed
 * packages that have a tsconfig.json, then the calibrated tests.
 * @param {{ changed: string[], packages: Set<string>, tsconfigs: Set<string>, milestone: boolean, installed: boolean, run: string[] }} r
 */
export function closureSteps({ changed, packages, tsconfigs, milestone, installed, run = [], store = STORE_MOUNT, checks = false, lwwPicked = false, policy = "verified", repair = false, files = null }) {
  const steps = [];
  if (milestone && installed) steps.push({ kind: "clean-install", command: installCommand({ store, clean: true, policy }) });
  else if (!installed) steps.push({ kind: "install", command: installCommand({ store, policy }) });
  // owner S4: after a merge whose /.lww rules picked a side, the merged result re-runs the install, as developers do after git merge;
  // NODE_RULE §4 (`repair`): a lead repair follows every consolidation, whatever changed
  else if (installInputsChanged(changed) || lwwPicked || repair) steps.push({ kind: repair ? "repair-install" : "incremental-install", command: installCommand({ store, policy }) });
  // development checks (owner 2026-10-18): a clean reinstall of the unchanged lockfile, whose Commit's metadata bytes are recorded
  if (checks && steps.length) steps.push({ kind: "reinstall-check", command: installCommand({ store, clean: true, policy }) });
  const built = [...new Set(changed.map((p) => packageOf(p, packages)).filter((d) => d && tsconfigs.has(d)))].sort();
  // NODE_RULE (the lead repair, `files` given): dsh's build, tsc -b then its bundler, as at the test points
  if (built.length) steps.push({ kind: "build", command: files ? pointBuild(files, built).command : buildCommand(built), packages: built });
  // and the same build again after its Commit, unmount and a fresh mount: it must find nothing to build, or what native finds
  if (checks && built.length) steps.push({ kind: "rebuild", command: rebuildCommand(built), packages: built });
  if (run.length) steps.push({ kind: "test", command: vitestCommand(run), files: run });
  return steps;
}

/**
 * Plays the steps on `branch`, each in its own one-shot Workspace: mount,
 * exec, the step's listing (install: the node_modules lister; build: the
 * build outputs), its own Commit, unmount (INSTALLS §3.3). An install first
 * checks that the Sandbox has the pnpm store mount (the read-only volume
 * `sandbox.create` takes, sandboxVolumes). A non-zero install or build exit,
 * or a test that does not give its native pass, is a stop finding
 * (Mismatch); nothing is retried.
 */
export async function playClosure(run, k, steps, { sb, branch, expectCall, Mismatch, store = STORE_MOUNT, roots = [], binCheck = false }) {
  const out = [];
  for (const s of steps) {
    const label = `r${pad(k)}.${s.kind}`;
    run.label(label);
    const ws = await expectCall(run, `${label} mount`, () => run.lf.sandbox.mount(sb, branch));
    try {
      if (/install/.test(s.kind)) {
        const has = await run.lf.sandbox.exec(sb, ws, `test -d ${store}/v11 && test -f ${store}/.cache/lockfile-verified.jsonl`);
        if (has.exitCode !== 0) throw new Mismatch(`${label}: the Sandbox has no pnpm store at ${store} (sandbox.create's read-only volume mount, INSTALLS §3.1)`);
      }
      const t0 = Date.now();
      const r = await expectCall(run, `${label} exec`, () => run.lf.sandbox.exec(sb, ws, s.command));
      const row = { kind: s.kind, exitCode: r.exitCode, ms: Date.now() - t0, ...(s.packages ? { packages: s.packages } : {}) };
      run.progress?.(`closure ${s.kind} exit ${r.exitCode} ${row.ms} ms`);
      out.push(row);
      if (s.kind !== "test" && r.exitCode !== 0) throw new Mismatch(`${label} exited ${r.exitCode}: ${String(r.stderr || r.stdout || "").slice(-300)}`);
      // every step's mount root: the node_modules chain records it, and a later install's lister substitutes it
      row.root = String((await run.lf.sandbox.exec(sb, ws, "pwd")).stdout).trim();
      if (/install/.test(s.kind)) {
        if (nodeOf(run.manifest).on) row.command = s.command;
        row.output = normalizeOutput(`${r.stdout ?? ""}${r.stderr ?? ""}`);
        Object.assign(row, parseLister((await run.lf.sandbox.exec(sb, ws, listerCommand([], { roots }))).stdout));
        // dev: the vitest cache as installed, for the .vite finding (lead 2026-10-18; never compared)
        if (binCheck) row.dump = parseDump((await run.lf.sandbox.exec(sb, ws, dumpCommand(DEV_DUMP))).stdout);
        // F-034 (owner 2026-10-18): a fact, not a gate: does a bin whose shim holds an earlier mount's root run in this mount?
        if (binCheck && s.kind === "incremental-install") {
          const b = await run.lf.sandbox.exec(sb, ws, BIN_CHECK);
          row.binCheck = { command: BIN_CHECK, exitCode: b.exitCode, output: `${b.stdout ?? ""}${b.stderr ?? ""}`.trim().slice(0, 300), shimRoots: Object.keys(row.normalized?.earlierRoots?.["node_modules/.bin/tsc"] ?? {}) };
        }
      }
      if (s.kind === "rebuild") {
        row.output = `${r.stdout ?? ""}${r.stderr ?? ""}`.slice(-20_000);
        row.states = tscStates(row.output, row.root);
        row.nothingToBuild = nothingToBuild(row.states);
      }
      if (s.kind === "build") {
        row.bytes = buildBytes((await run.lf.sandbox.exec(sb, ws, buildListCommand(s.packages))).stdout, s.packages);
        // NODE_RULE P6 (its P4 part): the emitted .js/.d.ts by blob id, judged natively after the play (nodeproof.mjs)
        if (s.kind === "build" && nodeOf(run.manifest).on) { row.command = s.command; row.emitted = parseEmitted((await run.lf.sandbox.exec(sb, ws, emittedCommand(s.packages))).stdout); }
      }
      // NODE_RULE P6: the files the repair rewrote (the Workspace's dirty inodes before its Commit)
      if (s.kind === "repair-install") row.rewritten = (await run.lf.sandbox.status(sb, ws))?.overlay?.inodes ?? null;
      if (s.kind === "test") row.results = compareResults(s.files, parseVitestJson(String(r.stdout), row.root));
      row.commit = (await expectCall(run, `${label} commit`, () => run.lf.sandbox.commit(sb, ws, label), "Committed|UpToDate"))?.kind;
      if (row.results?.differ.length) throw new Mismatch(`${label}: ${row.results.differ.length} file(s) differ from native`);
    } finally {
      await run.lf.sandbox.unmount(sb, ws, true);
    }
  }
  return out;
}

/** The F-034 fact (dev runs): one bin through its shim in the new mount. */
export const BIN_CHECK = "./node_modules/.bin/tsc --version";

/**
 * The node_modules chain after a range's closure (lead 2026-10-18): the steps
 * executed since the last install compared equal to the clean native oracle
 * (a first install, a milestone clean install, the dev reinstall check),
 * that install first. An install on top is compared with a native replay of
 * this chain plus itself (sequenceOracle), because its tree is the chain's
 * state: orphan packages and test caches included.
 */
export function nextChain(chain = [], range, checkpoint, executed) {
  let next = [...chain];
  for (const e of executed) {
    const entry = { range, checkpoint, kind: e.kind, command: e.command, root: e.root ?? null };
    if (CLEAN_KINDS.has(e.kind)) next = [entry];
    else next.push(entry);
  }
  return next;
}
export const CLEAN_KINDS = new Set(["install", "clean-install", "reinstall-check"]);
/** The cache key of an install on top: the chain's checkpoints and commands, then the install's own. */
export const sequenceKey = (chain, final) => createHash("sha256").update(JSON.stringify({ v: LISTER_VERSION, chain: chain.map((e) => [e.checkpoint, e.command]), final: [final.checkpoint, final.command] })).digest("hex").slice(0, 24);

/**
 * Paths the closure writes that git does not track: node_modules and build
 * output. dsh's tsc outDir is `lib/` (its .gitignore lists `node_modules/`,
 * `lib/` and `*.tsbuildinfo`; dev352-p3e r015); `dist/` stays for bundles.
 * The proof leaves them out when extra; a tracked file under them is compared.
 */
export const CLOSURE_OUTPUT = /(^|\/)node_modules(\/|$)|(^|\/)(dist|lib)\/|\.tsbuildinfo$/;

/**
 * One range's closure on `branch` before its publish (P3, INSTALLS §3): the
 * steps from git's changes since the previous checkpoint, the checkpoint's
 * packages and tsconfigs, the milestone flag and the calibrated tests, played
 * by playClosure. The installed tree must equal the native oracle of the same
 * lockfile and pnpm's output must equal native apart from timing; either
 * difference is a stop finding. Returns the rows, the oracle comparison and
 * the reinstall input (changed packages and their raw bytes); the caller adds
 * the stored bytes from the install Commit's traced sizes.
 */
/** A range's closure plan: the lockfile blob, the calibrated tests and the steps (closureSteps), from git and the run's state. */
export function planClosure({ repo, planDir, k, plan, prevCommit, installed, checks, lwwPicked = false, policy = "verified", repair = false }) {
  const git = (args) => execFileSync("git", ["--git-dir", repo, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });
  const tree = lsTree(repo, plan.checkpoint).files;
  const lock = tree.get("pnpm-lock.yaml")?.blob;
  if (!lock) return { skipped: "no pnpm-lock.yaml (not a pnpm project at this checkpoint)" };
  const dirsWith = (name) => new Set([...tree.keys()].filter((p) => p.endsWith(`/${name}`)).map((p) => p.slice(0, -name.length - 1)));
  const calFile = join(planDir, `tests-${pad(k)}.json`);
  if (!existsSync(calFile)) return { missing: `range ${k} has no calibration (${calFile})` };
  const cal = JSON.parse(readFileSync(calFile, "utf8"));
  const changed = git(["diff", "--name-only", prevCommit, plan.checkpoint]).split("\n").filter(Boolean);
  return { lock, steps: closureSteps({ changed, packages: dirsWith("package.json"), tsconfigs: dirsWith("tsconfig.json"), milestone: !!plan.milestone, installed: !!installed, run: cal.run, checks, lwwPicked, policy, repair, files: repair ? tree : null }) };
}

/**
 * The oracle files a range's closure needs: an install on top of an existing
 * node_modules (incremental, with a chain) compares with the native replay of
 * the chain (`seq-<key>.json`); a first or clean install, and the dev
 * reinstall check, with the clean native install of the lockfile.
 */
export function oracleFiles(oracleDir, { lock, steps, chain = [], checkpoint, policy = "verified" }) {
  const install = steps.find((s) => /install/.test(s.kind) && s.kind !== "reinstall-check");
  const onTop = (install?.kind === "incremental-install" || install?.kind === "repair-install") && chain.length > 0;
  // a clean oracle per lockfile and store policy (NODE_RULE §11 a: the policy decides whether pnpm accepts the lockfile offline)
  const clean = join(oracleDir, "node_modules", `${lock}${policy === "verified" ? "" : `.${policy}`}.json`);
  return {
    install: install ? (onTop ? join(oracleDir, "node_modules", `seq-${sequenceKey(chain, { checkpoint, command: install.command })}.json`) : clean) : null,
    kind: onTop ? "sequence" : "clean",
    clean: !install || !onTop || steps.some((s) => s.kind === "reinstall-check") ? clean : null,
  };
}

export async function rangeClosure(run, k, plan, branch, { sb, expectCall, Mismatch, oracleDir, checks = false, lwwPicked = false, laneRoots = [], dumpTo = null }) {
  const git = (args) => execFileSync("git", ["--git-dir", run.repo, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });
  // the development checks run after the publish, on a fork (devcheck.mjs; SCRIPTS.md, 120 s rule)
  const node = nodeOf(run.manifest);
  const planned = planClosure({ repo: run.repo, planDir: run.planDir, k, plan, prevCommit: run.state.prevCommit, installed: run.state.installed, checks: false, lwwPicked, policy: node.storePolicy, repair: node.on && !!run.state.installed });
  if (planned.skipped) return { skipped: planned.skipped };
  if (planned.missing) throw new Mismatch(planned.missing);
  const { lock, steps } = planned, chain = run.state.closureChain ?? [];
  const files = oracleFiles(oracleDir, { lock, steps, chain, checkpoint: plan.checkpoint, policy: node.storePolicy });
  for (const f of [files.install].filter(Boolean)) {
    if (!existsSync(f)) throw new Mismatch(`range ${k}: no node_modules oracle ${f.split("/").at(-1)}; run closure.mjs oracle --run ${run.manifest.run ?? "<run>"} --range ${k} first`);
    const o = JSON.parse(readFileSync(f, "utf8")), want = steps.find((s) => /install/.test(s.kind))?.command;
    if (o.listerVersion !== LISTER_VERSION) throw new Mismatch(`range ${k}: the node_modules oracle ${f.split("/").at(-1)} predates lister version ${LISTER_VERSION}; rerun closure.mjs oracle --range ${k}`);
    // a clean oracle is a fresh checkout's install, which has no node_modules to remove: a milestone's clean install
    // matches the plain command (rb-p3-…-c r004 stopped on the string); any other difference is still refused
    const sameCommand = o.install === want || (steps.some((s) => s.kind === "clean-install") && want.replace(`${CLEAN_REMOVE} && `, "") === o.install);
    if (files.kind === "clean" && want && !sameCommand) throw new Mismatch(`range ${k}: the node_modules oracle ${f.split("/").at(-1)} was made with another install command; rerun closure.mjs oracle --range ${k}`);
  }
  // the recorded mount roots of this chain's earlier steps: listed substitutions (INSTALLS §4, F-034); with Node on,
  // the lane points' too: the merge brings their shims into the lead, and the native repair chain lists their roots
  // as earlier roots (#352 p3-main-b r015.a2 lead.repair: shims written at /workspaces/15 hashed raw here only)
  const roots = [...new Set([...chain.map((e) => e.root), ...(run.state.closureRoots ?? []), ...laneRoots].filter(Boolean))];
  const rows = await playClosure(run, k, steps, { sb, branch, expectCall, Mismatch, roots, binCheck: checks });
  const out = { steps: steps.map((s) => s.kind), rows: rows.map(({ groups, dump, ...r }) => r), oracleKind: files.kind,
    executed: steps.map((s, i) => ({ kind: s.kind, command: s.command, root: rows[i]?.root ?? null })) };
  const done = rows.find((r) => /install/.test(r.kind));
  if (done) {
    const oracle = JSON.parse(readFileSync(files.install, "utf8"));
    out.earlierRoots = { roots, install: earlierRootCount(done.normalized), perFile: done.normalized?.earlierRoots ?? {}, binCheck: done.binCheck ?? null };
    // pnpm prints the install root in some warnings: the root alone is compared as <root> (INSTALLS §4)
    // the oracle's output is normalized again here, so a rule added after it was built applies to both sides
    const nativeOutput = normalizeOutput(oracle.output), native = rootless(nativeOutput, oracle.root), ours = rootless(done.output, done.root);
    out.normalized = { root: done.root, nativeRoot: oracle.root, files: done.normalized, nativeFiles: oracle.normalized, outputRoot: done.output.split(done.root).length - 1, nativeOutputRoot: oracle.output.split(oracle.root).length - 1, outputVerifiedAge: verifiedAges(done.output), nativeOutputVerifiedAge: verifiedAges(nativeOutput) };
    // NODE_RULE P1 (Node on): build-output caches (node_modules/.vite, the test points' vitest cache) are not install output
    out.oracle = node.on ? { ...compareInstalled({ ...oracle, groups: oracle.groups.filter((g) => !BUILD_GROUPS.test(g.g)) }, done.groups.filter((g) => !BUILD_GROUPS.test(g.g))), buildGroups: done.groups.filter((g) => BUILD_GROUPS.test(g.g)).map((g) => g.g) } : compareInstalled(oracle, done.groups);
    // dev: the dumped groups as installed (playClosure, before any later step), for the finding (never compared)
    if (dumpTo && done.dump) writeFileSync(dumpTo, JSON.stringify({ range: k, groups: DEV_DUMP, differ: out.oracle.differ, files: done.dump }, null, 1));
    out.outputOk = ours === native;
    // Node on: this oracle's chain is the lead's alone, not the lane points' installs the merged node_modules carries;
    // nodeproof.mjs judges the repair (P6) against that on-top chain, from the groups kept here (f031-slice-e r015:
    // pendingBuilds gains one "." per install, so a lead-only chain differs by the root lane's install)
    if (node.on) {
      const file = join(run.dir, "node", `r${pad(k)}`, "lead.repair.groups.json");
      mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(done.groups));
      out.repairGroups = file;
    }
    if (!out.oracle.ok && !node.on) throw new Mismatch(`r${pad(k)} install differs from native: ${JSON.stringify({ missing: out.oracle.missing.slice(0, 5), extra: out.oracle.extra.slice(0, 5), differ: out.oracle.differ.slice(0, 5) })}`);
    if (ours !== native && !node.on) throw new Mismatch(`r${pad(k)} install output differs from native: ${firstDifference(native, ours)}`);
    // the lockfile installed before this install: none on a run's first install (every package is new; rb-p3 r002 read
    // 935479× against the previous range's lockfile, which was never installed); with Node on the lead installed the
    // range base's lockfile first (NODE_RULE §2)
    let prevLock = "";
    if (run.state.installed || node.on) try { prevLock = git(["show", `${run.state.prevCommit}:pnpm-lock.yaml`]); } catch { prevLock = ""; }
    const ch = changedPackages(prevLock, git(["show", `${plan.checkpoint}:pnpm-lock.yaml`]));
    out.reinstall = { changedPackages: ch.count, rawChangedBytes: rawChangedBytes(ch, oracle.groups), changed: ch };
    out.prevGroups = run.state.nmGroupsFile ? JSON.parse(readFileSync(run.state.nmGroupsFile, "utf8")) : [];
    out.groups = done.groups;
  }
  return out;
}

/**
 * The development checks' verdicts (owner 2026-10-18), played by devcheck.mjs
 * on a fork of the published main: the clean reinstall against the clean
 * oracle of the lockfile, and the build after a remount, which must find
 * nothing to build or what a native rerun finds (design 8).
 */
export function judgeDevChecks(k, rows, { cleanOracle, Mismatch, nativeRun = null }) {
  const out = {};
  const again = rows.find((r) => r.kind === "reinstall-check");
  if (again) {
    const same = compareInstalled(cleanOracle, again.groups);
    out.reinstallCheck = { commit: again.commit ?? null, ms: again.ms, oracleOk: same.ok, earlierRoots: earlierRootCount(again.normalized) };
    if (!same.ok) throw new Mismatch(`r${pad(k)} clean reinstall differs from native: ${JSON.stringify({ missing: same.missing.slice(0, 5), extra: same.extra.slice(0, 5), differ: same.differ.slice(0, 5) })}`);
  }
  const rebuild = rows.find((r) => r.kind === "rebuild");
  if (rebuild) {
    out.rebuild = { commit: rebuild.commit ?? null, ms: rebuild.ms, states: rebuild.states, nothingToBuild: rebuild.nothingToBuild };
    if (!rebuild.nothingToBuild) {
      if (!nativeRun) throw new Mismatch(`r${pad(k)} rebuild after remount found work to do and no native rerun is available here (design 8): ${rebuild.states.filter((l) => / (built|out of date)$/.test(l)).slice(0, 5).join("; ")}`);
      const n = nativeRun(rebuild.packages);
      out.rebuild.native = n.states;
      const diff = firstDifference(n.states.join("\n"), rebuild.states.join("\n"));
      if (diff !== "none") throw new Mismatch(`r${pad(k)} rebuild after remount differs from native (design 8): ${diff}`);
    }
  }
  return out;
}

/** The first line where two outputs differ, for a stop finding. */
export function firstDifference(a, b) {
  const x = String(a).split("\n"), y = String(b).split("\n");
  for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) return `line ${i + 1}: native ${JSON.stringify(x[i] ?? null)}, LayerFS ${JSON.stringify(y[i] ?? null)}`;
  return "none";
}

/**
 * Lists the installed tree: every entry under a node_modules folder (lstat,
 * symlink targets, git blob ids), one JSON line per package folder
 * ({ g, n, bytes, digest }: bytes of files and symlinks); with folder names as arguments, their entry lines.
 * A package folder is the path through the first node_modules and its next
 * name (two for a scope or `.pnpm`): `.pnpm/<pkg>@<v>` holds the package and
 * its dependency links.
 */
/**
 * The node_modules lister. Version 4 (dev352-p3c r015; v3 counts what it normalizes; v4 substitutes roots only at a path boundary and the chain's earlier mount roots, dev352-p3h r016): pnpm writes the
 * install root into the \`.bin\` shims, \`.modules.yaml\` and
 * \`.pnpm-workspace-state-v1.json\`, and the run's time into the last two
 * (\`prunedAt\`, \`lastValidatedTimestamp\`). Only for those files, the
 * digest hashes the content with the root (the lister's cwd) as \`<root>\` and
 * those two values as \`<t>\`. Every other file is its git blob id. The raw
 * size stays in \`bytes\`. Native installs at ORACLE_ROOT, a path no package
 * content contains, so the replacement cannot touch unrelated bytes.
 */
export const LISTER_VERSION = 5;
export const ORACLE_ROOT = "/lfs352-native-root";
export const LISTER = `const fs=require("fs"),c=require("crypto");const full=new Set(process.argv.slice(1));const groups=new Map(),bytes=new Map();const groupOf=(p)=>{const s=p.split("/");const i=s.indexOf("node_modules");let j=i+1;if(s[j]===".pnpm"||(s[j]||"").startsWith("@"))j++;return s.slice(0,Math.min(j+1,s.length)).join("/")};const add=(p,line,n)=>{const g=groupOf(p);bytes.set(g,(bytes.get(g)||0)+n);let e=groups.get(g);if(!e)groups.set(g,e=[]);e.push(line)};const root=process.cwd(),state={"node_modules/.modules.yaml":/("prunedAt": )"[^"\\n]*"/,"node_modules/.pnpm-workspace-state-v1.json":/("lastValidatedTimestamp": )\\d+/},shim=/(^|\\/)node_modules\\/\\.bin\\/[^/]+$/;const stale=JSON.parse(process.env.LFS352_ROOTS||"[]").filter((x)=>x&&x!==root);const sub=(s,r)=>{let o="",i=0,n=0;for(;;){const j=s.indexOf(r,i);if(j<0)break;if(/[A-Za-z0-9_.-]/.test(s[j+r.length]||"")){o+=s.slice(i,j+r.length);i=j+r.length;continue}o+=s.slice(i,j)+"<root>";i=j+r.length;n++}return[o+s.slice(i),n]};const norm={shims:{files:0,root:0}};const blob=(p,n)=>{let b=fs.readFileSync(p);if(p.startsWith("node_modules/.vite/vitest/")&&p.endsWith("/results.json")&&p.split("/").length===5){let j;try{j=JSON.parse(b.toString("utf8"))}catch{j=null}const v=norm.vitest=norm.vitest||{files:0,entries:0,reordered:0,durations:0,unparsed:0};if(j&&Array.isArray(j.results)&&j.results.every((r)=>Array.isArray(r)&&r.length===2&&typeof r[0]==="string"&&r[1]&&typeof r[1]==="object")){const keys=j.results.map((r)=>r[0]);const sorted=[...j.results].sort((x,y)=>(x[0]<y[0]?-1:x[0]>y[0]?1:0));v.files++;v.entries+=sorted.length;if(sorted.some((r,i)=>r[0]!==keys[i]))v.reordered++;for(const r of sorted)if("duration" in r[1]){r[1].duration="<t>";v.durations++}j.results=sorted;b=Buffer.from(JSON.stringify(j))}else v.unparsed++}const t=state[p];if(t||(shim.test(p)&&b.subarray(0,10).toString()==="#!/bin/sh\\n")){let[s,r0]=sub(b.toString("utf8"),root);const st={};for(const x of stale){const[s2,c]=sub(s,x);if(c){st[x]=c;s=s2}}if(Object.keys(st).length){norm.earlierRoots=norm.earlierRoots||{};norm.earlierRoots[p]=st}if(t){if(!t.test(s))throw new Error(p+": no "+t);s=s.replace(t,"$1<t>");norm[p]={root:r0,time:1}}else{norm.shims.files++;norm.shims.root+=r0}b=Buffer.from(s)}const h=c.createHash("sha1");h.update("blob "+b.length+"\\0");h.update(b);return h.digest("hex")};const walk=(d,nm)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=d==="."?e.name:d+"/"+e.name;if(p===".git"||p===".lfs-probe")continue;const inNm=nm||e.name==="node_modules";const s=fs.lstatSync(p);const m=(s.mode&0o7777).toString(8);if(s.isSymbolicLink()){if(inNm)add(p,"l "+m+" "+fs.readlinkSync(p)+" "+p,s.size)}else if(s.isDirectory()){if(inNm&&e.name!=="node_modules")add(p,"d "+m+" - "+p,0);walk(p,inNm)}else if(inNm)add(p,"f "+m+" "+blob(p,s.size)+" "+p,s.size)}};walk(".",false);for(const g of [...groups.keys()].sort()){const ls=groups.get(g).sort();if(full.size){if(full.has(g))for(const l of ls)process.stdout.write(l+"\\n");continue}process.stdout.write(JSON.stringify({g,n:ls.length,bytes:bytes.get(g)||0,digest:c.createHash("sha256").update(ls.join("\\n")).digest("hex")})+"\\n")}if(!full.size)process.stdout.write("#normalized "+JSON.stringify(norm)+"\\n")`;
/** Lister stdout: its groups, and what version 2 normalized (`#normalized`: per state file root and time substitutions; shims: files and root substitutions). */
/**
 * Development dump (lead, 2026-10-18, .vite): every file under the given
 * node_modules groups with its bytes, `@@dump <base64 path> <base64 bytes>`,
 * so a differing group can be read file by file on both sides. Never part of a
 * comparison.
 */
export const DUMP = `const fs=require("fs");const walk=(p)=>{let s;try{s=fs.lstatSync(p)}catch{return}if(s.isDirectory()){for(const e of fs.readdirSync(p).sort())walk(p+"/"+e);return}const b=s.isSymbolicLink()?Buffer.from("-> "+fs.readlinkSync(p)):fs.readFileSync(p);process.stdout.write("@@dump "+Buffer.from(p).toString("base64")+" "+b.toString("base64")+"\\n")};for(const g of process.argv.slice(1))walk(g)`;
export const DEV_DUMP = ["node_modules/.vite", "node_modules/.modules.yaml"];
export const dumpCommand = (groups) => `node -e ${quote(DUMP)} ${groups.map(quote).join(" ")}`;
export const parseDump = (stdout) => Object.fromEntries(String(stdout).split("\n").filter((l) => l.startsWith("@@dump ")).map((l) => { const [, p, b] = l.split(" "); return [Buffer.from(p, "base64").toString(), Buffer.from(b ?? "", "base64").toString("utf8")]; }));

export const parseLister = (stdout) => {
  const lines = String(stdout).split("\n"), norm = lines.find((l) => l.startsWith("#normalized "));
  return { groups: lines.filter((l) => l.startsWith("{")).map((l) => JSON.parse(l)), normalized: norm ? JSON.parse(norm.slice(12)) : null };
};
/**
 * The lister's command. `roots` are the recorded mount roots of earlier steps
 * in this node_modules chain: each is substituted by exact string, like the
 * current root, and counted per file (`normalized.earlierRoots`). A new
 * directory per mount is the product's model (owner, F-034, 2026-10-18), so
 * pnpm's files keep the root of the mount that wrote them.
 */
export const listerCommand = (groups = [], { roots = [] } = {}) =>
  `${roots.length ? `LFS352_ROOTS=${quote(JSON.stringify(roots))} ` : ""}node -e ${quote(LISTER)} ${groups.map(quote).join(" ")}`;
/** The earlier-root substitutions of a lister's `normalized`: occurrences and files. */
export const earlierRootCount = (normalized) => {
  const files = Object.values(normalized?.earlierRoots ?? {});
  return { files: files.length, occurrences: files.reduce((n, f) => n + Object.values(f).reduce((a, x) => a + x, 0), 0) };
};

/** `text` with every occurrence of the install `root` written `<root>`; a missing root is refused. */
export const rootless = (text, root) => { if (!root || root === "/") throw new Error(`no install root to normalize (${root})`); return String(text).split(root).join("<root>"); };

/**
 * pnpm's output without what varies run to run (INSTALLS §4): progress lines,
 * the duration on the "Done in" line, and the store-verification age on the
 * supply-chain line only (dev352-p3g r015: "verified 5h ago" natively, "6h ago"
 * in LayerFS), and the check's own duration on that line once it ran (f031-slice-f r015: "662 entries in 7ms"
 * natively, "in 9ms" in LayerFS; owner approved 2026-10-19, liaison relay). Any other difference stays a mismatch.
 */
export const VERIFIED_LINE = /^(✓ Lockfile passes supply-chain policies \(verified )[^)]+( ago\))$/;
export const CHECKED_LINE = /^(✓ Lockfile passes supply-chain policies \(\d+ entries in )[\d.]+m?s(\))$/;
export const normalizeOutput = (text) => String(text).split("\n").filter((l) => !/^Progress: /.test(l)).map((l) => l.replace(/Done in [\d.ms ]+using/, "Done in <t> using").replace(VERIFIED_LINE, "$1<t>$2").replace(CHECKED_LINE, "$1<t>$2")).join("\n").trim();
/** How many store-verification ages normalizeOutput replaced in `normalized` output. */
export const verifiedAges = (normalized) => String(normalized).split("\n").filter((l) => l === "✓ Lockfile passes supply-chain policies (verified <t> ago)").length;

/** An installed tree (lister lines) against the oracle: package folders missing, extra or differing. */
export function compareInstalled(oracle, actualLines) {
  const want = new Map(oracle.groups.map((g) => [g.g, g])), got = new Map(actualLines.map((g) => [g.g, g]));
  const missing = [...want.keys()].filter((g) => !got.has(g)), extra = [...got.keys()].filter((g) => !want.has(g));
  const differ = [...want.keys()].filter((g) => got.has(g) && got.get(g).digest !== want.get(g).digest);
  return { ok: !missing.length && !extra.length && !differ.length, groups: want.size, missing, extra, differ };
}

/**
 * The package entries and workspace links of a pnpm v9 lockfile (line-based:
 * `packages:` keys with their `resolution:`; `importers:` dependencies whose
 * version is `link:`), for the reinstall gate.
 */
export function parseLock(text) {
  const packages = new Map(), links = new Map();
  let section = null, key = null, importer = null, dep = null;
  const unq = (t) => t.replace(/^'(.*)'$/, "$1");
  for (const line of String(text).split("\n")) {
    const top = /^([a-zA-Z]+):/.exec(line);
    if (top) { section = top[1]; key = importer = dep = null; continue; }
    if (section === "packages") {
      const k = /^ {2}(\S.*):$/.exec(line);
      if (k) key = unq(k[1]);
      else if (key && /^ {4}resolution: /.test(line)) packages.set(key, line.trim().slice("resolution: ".length));
    } else if (section === "importers") {
      let k;
      if ((k = /^ {2}(\S.*):$/.exec(line))) importer = unq(k[1]);
      else if ((k = /^ {6}(\S.*):$/.exec(line))) dep = unq(k[1]);
      else if (importer && dep && (k = /^ {8}version: link:(.*)$/.exec(line))) links.set(`${importer}\u0000${dep}`, k[1].trim());
    }
  }
  return { packages, links };
}

/** Changed packages between two lockfiles (lead decision 2026-10-18): new or re-resolved entries, and links with a new target. */
export function changedPackages(prevText, nextText) {
  const a = parseLock(prevText ?? ""), b = parseLock(nextText);
  const packages = [...b.packages].filter(([k, v]) => a.packages.get(k) !== v).map(([k]) => k);
  const links = [...b.links].filter(([k, v]) => a.links.get(k) !== v).map(([k]) => { const [importer, dep] = k.split("\u0000"); return { importer, dep }; });
  return { packages, links, count: packages.length + links.length };
}

/**
 * The raw bytes of the changed packages in an installed tree's lister groups:
 * a package's `.pnpm/<name>@<version>[_peers]` folders; a link's entry only
 * (`<importer>/node_modules/<dep>`, the symlink's bytes).
 */
export function rawChangedBytes(changed, groups) {
  const by = new Map(groups.map((g) => [g.g, g.bytes ?? 0]));
  let total = 0;
  for (const key of changed.packages) {
    const at = key.lastIndexOf("@"), base = `node_modules/.pnpm/${key.slice(0, at).replaceAll("/", "+")}@${key.slice(at + 1)}`;
    for (const [g, n] of by) if (g === base || g.startsWith(`${base}_`)) total += n;
  }
  for (const l of changed.links) total += by.get(`${l.importer === "." ? "" : `${l.importer}/`}node_modules/${l.dep}`) ?? 0;
  return total;
}

/**
 * Build outputs of the built packages, listed in the Workspace after the
 * build step: `dist/` files and `*.tsbuildinfo`, node_modules pruned. One
 * line per file: `<bytes> <path>`.
 */
export const buildListCommand = (packages) => `find ${packages.map(quote).join(" ")} -path '*/node_modules' -prune -o \\( -name '*.tsbuildinfo' -o -path '*/dist/*' \\) -type f -printf '%s %p\\n'`;

/** Build output bytes per built package from buildListCommand's lines. */
export function buildBytes(lines, packages) {
  const out = Object.fromEntries(packages.map((p) => [p, 0]));
  for (const l of String(lines).split("\n")) {
    const m = /^(\d+) (.*)$/.exec(l);
    if (!m) continue;
    const pkg = packages.find((p) => m[2] === p || m[2].startsWith(`${p}/`));
    if (pkg) out[pkg] += Number(m[1]);
  }
  return out;
}

/** The four large binary packages STORAGE_STUDY.md §3c could not size (§8 item 6). */
export const STUDY_BINARIES = [/^@anthropic-ai\/claude-agent-sdk-linux-arm64@/, /^@openai\/codex@.*linux-arm64/, /libreoffice-kit-wasm@/, /cua-driver@/];

/**
 * The seven measurements STORAGE_STUDY.md §8 asks of P3's development run,
 * from what one range records. Storage is attributed by the step's own Commit
 * (an install Commit writes node_modules, a build Commit build output, the
 * agents' Commits tracked files), from each Commit's traced `sizes`: newStored
 * (every new pack body) and newMetadata (metadata-domain packs), so content =
 * newStored − newMetadata (layerfs-storage Save outcome; no new counter).
 * @param {{ fsWrites: object[], install?: { sizes, delta, prevGroups, groups, changed, paths }, build?: { sizes, bytes }, binaries?: object }} r
 */
export function studyMeasurements({ fsWrites = [], install = null, build = null, binaries = null }) {
  const p50 = (xs) => { const v = xs.filter((x) => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : null; };
  const role = (z) => (z?.newStored == null ? { content: null, metadata: null } : { content: z.newStored - (z.newMetadata ?? 0), metadata: z.newMetadata ?? 0 });
  const out = {
    fsWriteCommit: { n: fsWrites.length, storedP50: p50(fsWrites.map((c) => c.sizes?.newStored)), contentP50: p50(fsWrites.map((c) => role(c.sizes).content)), metadataP50: p50(fsWrites.map((c) => role(c.sizes).metadata)) },
  };
  if (install) {
    const was = new Map((install.prevGroups ?? []).map((g) => [g.g, g.digest]));
    const added = install.groups.filter((g) => !was.has(g.g)), rewritten = install.groups.filter((g) => was.has(g.g) && was.get(g.g) !== g.digest);
    const newPaths = added.reduce((n, g) => n + g.n, 0), r = role(install.sizes);
    const ownGroup = (g) => install.changed?.packages.some((k) => { const at = k.lastIndexOf("@"); return g.g.includes(`/.pnpm/${k.slice(0, at).replaceAll("/", "+")}@${k.slice(at + 1)}`); });
    out.install = { stored: install.sizes?.newStored ?? null, ...r, newPaths, newPackageFolders: added.length,
      // per-path facts: read from the sealed snapshot (inspect.mjs), not from one Commit's counters
      lockYamlDeduped: install.paths?.lockYamlDeduped ?? null, modulesYamlDelta: install.paths?.modulesYamlDelta ?? null };
    out.metadataPerPath = { perNewPath: r.metadata == null || !newPaths ? null : +(r.metadata / newPaths).toFixed(1) };
    out.reuse = install.delta ?? null;
    out.relink = { rewrittenFolders: rewritten.length, unchangedPackageFolders: rewritten.filter((g) => !ownGroup(g)).length };
  }
  if (binaries) out.binaries = binaries;
  if (build) out.build = { stored: build.sizes?.newStored ?? null, perPackage: build.bytes, ...role(build.sizes) };
  return out;
}

/** Ranges whose plan install flag (plan-range.mjs) differs from git: an install input changed or not. */
export function checkPlan(repo, planDir) {
  const summary = JSON.parse(readFileSync(join(planDir, "plan.json"), "utf8"));
  const out = [];
  let prev = null;
  for (let k = 0; k < summary.ranges.length; k++) {
    const plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    const changed = prev ? execFileSync("git", ["--git-dir", repo, "diff", "--name-only", prev, plan.checkpoint], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\n").filter(Boolean) : [];
    const git = prev ? installInputsChanged(changed) : true;
    if (Boolean(plan.closure?.install) !== git) out.push({ range: k, plan: Boolean(plan.closure?.install), git, inputs: changed.filter((p) => INSTALL_INPUT.test(p)).slice(0, 5) });
    prev = plan.checkpoint;
  }
  return out;
}

/** The native install of one checkpoint's tree in the image (network off, read-only store): exit, output, lister groups. */
export function nativeInstall({ repo, commit, image, volume, name = "layerfs-issue352-oracle", policy = "verified" }) {
  const script = `mkdir ${ORACLE_ROOT} && tar -x -C ${ORACLE_ROOT} && cd ${ORACLE_ROOT} && (${installCommand({ policy })}) > /tmp/o 2>&1; echo "@@exit $?"; sed 's/^/@@out /' /tmp/o; ${listerCommand()}`;
  const archive = execFileSync("git", ["--git-dir", repo, "archive", commit], { maxBuffer: 1 << 30 });
  const t0 = Date.now();
  const r = spawnSync("docker", ["run", "--rm", "-i", "--name", name, "--network", "none", "-v", `${volume}:${STORE_MOUNT}:ro`, "--entrypoint", "sh", image, "-c", script], { input: archive, encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`native install container exited ${r.status}: ${String(r.stderr).slice(-300)}`);
  const lines = r.stdout.split("\n");
  return {
    exit: Number(/^@@exit (\d+)/.exec(lines.find((l) => l.startsWith("@@exit")) ?? "")?.[1] ?? NaN),
    output: normalizeOutput(lines.filter((l) => l.startsWith("@@out ")).map((l) => l.slice(6)).join("\n")),
    ...parseLister(r.stdout),
    ms: Date.now() - t0,
  };
}

/**
 * The native replay of a node_modules chain plus the install on top (lead
 * 2026-10-18): one container at ORACLE_ROOT, network off, read-only store. For
 * each step the tree is set to its checkpoint (the checkpoint's archive over
 * the tree, then git's deletions since the previous step's checkpoint removed;
 * untracked output stays), then the step's command runs, as the run did. The
 * final install's exit, output and lister groups are the oracle; each step's
 * exit is kept.
 */
export function nativeSequence({ repo, chain, final, image, volume, name = "layerfs-issue352-oracle", dump = [] }) {
  const steps = [...chain, { ...final, kind: "final" }];
  const stage = mkdtempSync(join(tmpdir(), "lfs352-seq-"));
  try {
    const script = [`mkdir ${ORACLE_ROOT} /seq && tar -x -C /seq && cd ${ORACLE_ROOT}`];
    let prev = null;
    steps.forEach((st, i) => {
      if (st.checkpoint !== prev) {
        if (!existsSync(join(stage, `${st.checkpoint}.tar`))) writeFileSync(join(stage, `${st.checkpoint}.tar`), execFileSync("git", ["--git-dir", repo, "archive", st.checkpoint], { maxBuffer: 1 << 30 }));
        script.push(`tar -x -C ${ORACLE_ROOT} -f /seq/${st.checkpoint}.tar`);
        if (prev) {
          writeFileSync(join(stage, `${i}.del`), execFileSync("git", ["--git-dir", repo, "diff", "--no-renames", "--name-only", "--diff-filter=D", prev, st.checkpoint], { encoding: "utf8" }));
          // --no-renames: a renamed file's old path is a deletion too (dev352-p3k r016: 96 workspace projects natively, 92 in git)
          script.push(`while IFS= read -r f; do rm -f -- "$f"; done < /seq/${i}.del`);
        }
        prev = st.checkpoint;
      }
      script.push(i < steps.length - 1 ? `t=$(date +%s%N); (${st.command}) > /tmp/s${i} 2>&1; e=$?; echo "@@step ${i} ${st.kind} $e $(( ($(date +%s%N) - t) / 1000000 ))"` : `(${st.command}) > /tmp/o 2>&1; echo "@@exit $?"; sed 's/^/@@out /' /tmp/o; ${listerCommand()}${dump.length ? `; ${dumpCommand(dump)}` : ""}`);
    });
    const input = execFileSync("tar", ["-c", "-C", stage, "."], { maxBuffer: 1 << 30 });
    if (process.env.LFS352_SEQ_DEBUG) writeFileSync(process.env.LFS352_SEQ_DEBUG, script.join(";\n"));
    const t0 = Date.now();
    const r = spawnSync("docker", ["run", "--rm", "-i", "--name", name, "--network", "none", "-v", `${volume}:${STORE_MOUNT}:ro`, "--entrypoint", "sh", image, "-c", script.join("; ")], { input, encoding: "utf8", maxBuffer: 1 << 28 });
    if (r.status !== 0) throw new Error(`native sequence container exited ${r.status}: ${String(r.stderr).slice(-300)}`);
    const lines = r.stdout.split("\n");
    return {
      steps: lines.filter((l) => l.startsWith("@@step ")).map((l) => { const [, i, kind, exit, ms] = l.split(" "); return { i: Number(i), kind, exit: Number(exit), ms: Number(ms) }; }),
      exit: Number(/^@@exit (\d+)/.exec(lines.find((l) => l.startsWith("@@exit")) ?? "")?.[1] ?? NaN),
      output: normalizeOutput(lines.filter((l) => l.startsWith("@@out ")).map((l) => l.slice(6)).join("\n")),
      ...parseLister(r.stdout),
      ...(dump.length ? { dump: parseDump(r.stdout) } : {}),
      ms: Date.now() - t0,
    };
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

/**
 * The native rerun of one build (owner 2026-10-18): the checkpoint's tree in
 * the image, network off, installed, built with `tsc -b`, then built again
 * with --verbose; the second run's project states (tscStates).
 */
export function nativeRebuild({ repo, commit, image, volume, packages, name = "layerfs-issue352-oracle" }) {
  const script = `mkdir /w && tar -x -C /w && cd /w && (${installCommand()}) > /dev/null 2>&1 && ${buildCommand(packages)} > /dev/null 2>&1; ${rebuildCommand(packages)} > /tmp/o 2>&1; echo "@@exit $?"; sed 's/^/@@out /' /tmp/o`;
  const archive = execFileSync("git", ["--git-dir", repo, "archive", commit], { maxBuffer: 1 << 30 });
  const r = spawnSync("docker", ["run", "--rm", "-i", "--name", name, "--network", "none", "-v", `${volume}:${STORE_MOUNT}:ro`, "--entrypoint", "sh", image, "-c", script], { input: archive, encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`native rebuild container exited ${r.status}: ${String(r.stderr).slice(-300)}`);
  const output = r.stdout.split("\n").filter((l) => l.startsWith("@@out ")).map((l) => l.slice(6)).join("\n");
  return { exit: Number(/@@exit (\d+)/.exec(r.stdout)?.[1] ?? NaN), states: tscStates(output, "/w"), output };
}

function main() {
  const args = process.argv.slice(2);
  const opt = (n, d = null) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
  const repo = opt("--repo"), planDir = opt("--plan");
  if (args[0] === "check-plan" && repo && planDir) {
    const rows = checkPlan(repo, planDir);
    for (const r of rows) console.log(JSON.stringify(r));
    console.log(rows.length ? `${rows.length} range(s) differ` : "plan install flags match git");
    return;
  }
  if (args[0] === "oracle" && repo && planDir && opt("--image") && opt("--volume") && opt("--run")) {
    // the oracles a run's range k needs, from its state: the clean install of the lockfile and, for an install on top, the chain's replay
    const k = Number(opt("--range")), plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    const runDir = join(process.env.HOME, "lfs-history", "runs", opt("--run"));
    let state = JSON.parse(readFileSync(join(runDir, "state.json"), "utf8"));
    const manifest = JSON.parse(readFileSync(join(runDir, "run.json"), "utf8"));
    if (state.next !== k) { console.error(`run ${opt("--run")} is at range ${state.next}, not ${k}`); process.exit(1); }
    // NODE_RULE §2: the lead installs on the range base before the lanes fork, so the repair installs on top of that chain
    if (nodeOf(manifest).on && (!state.installed || plan.milestone)) {
      const clean = !!state.installed;
      const build = wholeBuild(lsTree(repo, state.prevCommit).files);
      state = { ...state, installed: true, closureChain: [{ range: k, checkpoint: state.prevCommit, kind: clean ? "clean-install" : "install", command: pointInstall({ clean, policy: nodeOf(manifest).storePolicy }) }, ...(build.packages.length ? [{ range: k, checkpoint: state.prevCommit, kind: "tsc", command: build.command }] : [])] };
    }
    const node = nodeOf(manifest), oracleRoot = manifest.oracle ?? join(process.env.HOME, "lfs-history", "oracle");
    const planned = planClosure({ repo, planDir: manifest.plan ?? planDir, k, plan, prevCommit: state.prevCommit, installed: state.installed, checks: false, policy: node.storePolicy, repair: node.on && !!state.installed });
    if (planned.skipped || planned.missing) { console.log(planned.skipped ?? planned.missing); return; }
    const files = oracleFiles(oracleRoot, { lock: planned.lock, steps: planned.steps, chain: state.closureChain ?? [], checkpoint: plan.checkpoint, policy: node.storePolicy });
    const fresh = (f) => existsSync(f) && JSON.parse(readFileSync(f, "utf8")).listerVersion === LISTER_VERSION;
    mkdirSync(join(process.env.HOME, "lfs-history", "oracle", "node_modules"), { recursive: true });
    if (existsSync(join(process.env.HOME, "lfs-history", "fetch", "pending.json"))) { console.error("a pnpm fetch batch is pending; the oracle needs a quiescent store"); process.exit(1); }
    // a dev run's devcheck compares its clean reinstall with the clean oracle of the lockfile, so a dev run needs it too
    if (!files.clean && files.install && manifest.label === "dev") files.clean = oracleFiles(oracleRoot, { lock: planned.lock, steps: [], policy: node.storePolicy }).clean;
    if (files.clean && !(fresh(files.clean) && JSON.parse(readFileSync(files.clean, "utf8")).install === installCommand({ policy: node.storePolicy }))) {
      const n = nativeInstall({ repo, commit: plan.checkpoint, image: opt("--image"), volume: opt("--volume"), policy: node.storePolicy });
      writeFileSync(`${files.clean}.tmp`, JSON.stringify({ lockfile: planned.lock, range: k, checkpoint: plan.checkpoint, image: opt("--image"), install: installCommand({ policy: node.storePolicy }), listerVersion: LISTER_VERSION, root: ORACLE_ROOT, ...n }, null, 1));
      renameSync(`${files.clean}.tmp`, files.clean);
      console.log(JSON.stringify({ file: files.clean, exit: n.exit, groups: n.groups.length, ms: n.ms }));
    } else if (files.clean) console.log(`cached ${files.clean}`);
    // a range without an install of its own may still re-install after an LWW merge (owner S4): its sequence oracle too
    if (files.kind !== "sequence" && state.installed && (state.closureChain ?? []).length && !planned.steps.some((s) => /install/.test(s.kind))) {
      const forced = planClosure({ repo, planDir: manifest.plan ?? planDir, k, plan, prevCommit: state.prevCommit, installed: state.installed, checks: false, lwwPicked: true, policy: node.storePolicy });
      Object.assign(files, oracleFiles(oracleRoot, { lock: forced.lock, steps: forced.steps, chain: state.closureChain, checkpoint: plan.checkpoint, policy: node.storePolicy }), { clean: files.clean });
      planned.steps = forced.steps;
    }
    // dev: the sequence replayed again with the named groups dumped, beside the cached oracle (never replacing it)
    if (files.kind === "sequence" && opt("--dump")) {
      const install = planned.steps.find((s) => s.kind === "incremental-install" || s.kind === "repair-install");
      const n = nativeSequence({ repo, chain: state.closureChain, final: { checkpoint: plan.checkpoint, command: install.command }, image: opt("--image"), volume: opt("--volume"), dump: opt("--dump").split(",") });
      const file = files.install.replace(/\.json$/, `.dump-${pad(k)}.json`);
      writeFileSync(file, JSON.stringify({ range: k, root: ORACLE_ROOT, groups: n.groups.filter((g) => opt("--dump").split(",").includes(g.g)), dump: n.dump, ms: n.ms }, null, 1));
      console.log(JSON.stringify({ file, files: Object.keys(n.dump ?? {}).length, ms: n.ms }));
      return;
    }
    if (files.kind === "sequence" && !fresh(files.install)) {
      const install = planned.steps.find((s) => s.kind === "incremental-install" || s.kind === "repair-install");
      const n = nativeSequence({ repo, chain: state.closureChain, final: { checkpoint: plan.checkpoint, command: install.command }, image: opt("--image"), volume: opt("--volume") });
      writeFileSync(`${files.install}.tmp`, JSON.stringify({ lockfile: planned.lock, range: k, checkpoint: plan.checkpoint, image: opt("--image"), chain: state.closureChain.map(({ range, checkpoint, kind }) => ({ range, checkpoint, kind })), install: install.command, listerVersion: LISTER_VERSION, root: ORACLE_ROOT, ...n }, null, 1));
      renameSync(`${files.install}.tmp`, files.install);
      console.log(JSON.stringify({ file: files.install, chain: state.closureChain.length, steps: n.steps, exit: n.exit, groups: n.groups.length, ms: n.ms }));
    } else if (files.kind === "sequence") console.log(`cached ${files.install}`);
    return;
  }
  if (args[0] === "oracle" && repo && planDir && opt("--image") && opt("--volume")) {
    const k = Number(opt("--range")), plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    const lock = lsTree(repo, plan.checkpoint).files.get("pnpm-lock.yaml");
    if (!lock) { console.log(`range ${k}: no pnpm-lock.yaml, no oracle`); return; }
    const dir = join(process.env.HOME, "lfs-history", "oracle", "node_modules"), file = join(dir, `${lock.blob}.json`);
    if (existsSync(file) && JSON.parse(readFileSync(file, "utf8")).listerVersion === LISTER_VERSION) { console.log(`cached ${file}`); return; }
    // pnpm 11's store index is SQLite: a read-only open fails ("unable to open database file") while a fetch writes the store
    if (existsSync(join(process.env.HOME, "lfs-history", "fetch", "pending.json"))) { console.error("a pnpm fetch batch is pending; the oracle needs a quiescent store"); process.exit(1); }
    mkdirSync(dir, { recursive: true });
    const n = nativeInstall({ repo, commit: plan.checkpoint, image: opt("--image"), volume: opt("--volume") });
    writeFileSync(`${file}.tmp`, JSON.stringify({ lockfile: lock.blob, range: k, checkpoint: plan.checkpoint, image: opt("--image"), install: installCommand(), listerVersion: LISTER_VERSION, root: ORACLE_ROOT, ...n }, null, 1));
    renameSync(`${file}.tmp`, file);
    console.log(JSON.stringify({ file, exit: n.exit, groups: n.groups.length, entries: n.groups.reduce((a, g) => a + g.n, 0), ms: n.ms }));
    return;
  }
  console.error("usage: closure.mjs check-plan --repo R --plan P | oracle --repo R --plan P --range k --image I --volume V [--run <id>]");
  process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
