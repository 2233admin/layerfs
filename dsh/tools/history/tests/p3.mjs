// Tests of the P3 harness build (F-031 git lanes, NODE_RULE churn and proofs):
//   node dsh/tools/history/tests/p3.mjs
// Pure parts and the native tree identity on a small git repository; nothing
// here starts a Sandbox, a daemon or a container.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { changedPackages, checkNode, commitIdOf, inputsHash, pointsBefore, testPoints, treeDelta, treeIdCommand, wholeBuild } from "../nodelanes.mjs";
import { PRUNE_EMPTY, pointBuild } from "../nodeconfig.mjs";
import { chooseFiles, laneSteps, laneWriteOrder, nativeClean, oracleKey, reinstallStates, judgeP1, judgeP2, judgeP3, judgeP4, judgeP5, judgePoint, judgeRepair, materialize, modelDelta, scratchRepo, STATE_FILES, vitestReport } from "../nodeproof.mjs";
import { execTool, forkP3State, p3StateOf, partsFromMetrics } from "../run.mjs";
import { installCommand, pointInstall, STORE_POLICIES } from "../closure.mjs";
import { sliceRange } from "../slice.mjs";
import { stepSource } from "../storage.mjs";
import { decoyBytes, Tree } from "../steps.mjs";
import { proofTally } from "../p3.mjs";
import { cleanedPaths, cleanScript, marks } from "../gitlanes.mjs";
import * as lanemerge from "../lanemerge.mjs";
import { existsSync } from "node:fs";

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const f = (blob) => ({ mode: "100644", blob });

const plan = {
  range: 15,
  lanes: [{ name: "L1", areas: ["/", "docs"] }, { name: "L2", areas: ["packages/a"] }],
  steps: [
    { id: "s1", lane: "L1", kind: "fs", order: 0, files: [{ path: "docs/a.md", op: "write", mode: "100644", blob: "b1" }] },
    { id: "s2", lane: "L1", kind: "fs", order: 2, files: [{ path: "pnpm-lock.yaml", op: "write", mode: "100644", blob: "lock2" }] },
    { id: "s3", lane: "L1", kind: "check", order: 3, files: [] },
    { id: "s4", lane: "L1", kind: "fs", order: 4, files: [{ path: "README.md", op: "decoy", base: "r0", marker: "planned conflict s4" }] },
    { id: "t1", lane: "L2", kind: "apply", order: 1, files: [{ path: "packages/a/src/x.ts", op: "write", mode: "100644", blob: "x1" }] },
    { id: "t2", lane: "L2", kind: "fs", order: 5, files: [{ path: "packages/a/old.ts", op: "rm" }] },
  ],
};

test("NODE_RULE §4 test points: one per lane at its end, after its last writing step (owner 2026-10-19); the root lane installs when the lane changed an input", () => {
  const pts = testPoints(plan);
  assert.deepEqual(pts.map((p) => [p.id, p.step, p.kind, p.root]), [["L1.end", "s4", "install", true], ["L2.end", "t2", "refresh", false]]);
  assert.deepEqual(pts[0].before, ["s1", "s2", "s4"], "a check step is not a writing step");
  assert.equal(testPoints({ ...plan, steps: plan.steps.filter((s) => s.id !== "s2") }).find((p) => p.lane === "L1").kind, "refresh", "no install input changed on the lane: a refresh");
});

test("a refresh's Commit id comes from sandbox.commit's record (R1 dev slice: a refresh Committed, and diff_commits got the record)", () => {
  assert.equal(commitIdOf({ kind: "Committed", commit: { id: "c1", logical: 3 } }), "c1");
  assert.equal(commitIdOf({ kind: "Committed", commit: "c2" }), "c2");
  assert.equal(commitIdOf({ kind: "UpToDate" }), null);
  assert.equal(commitIdOf(null), null);
});

test("NODE_RULE §3 and the store policy are switches: plan and R1 play their own plans; release-age-off is the one override", () => {
  assert.equal(checkNode({ inputsRule: "plan" }), null);
  assert.equal(checkNode({ inputsRule: "r1" }), null);
  assert.equal(checkNode({ inputsRule: "r1" }, { range: 15, inputsRule: "r1" }), null);
  assert.equal(checkNode({ inputsRule: "plan" }, { range: 14 }), null);
  assert.match(checkNode({ inputsRule: "r1" }, { range: 15 }), /planned under inputs rule plan, the run plays r1: re-plan/);
  assert.match(checkNode({ inputsRule: "plan" }, { range: 15, inputsRule: "r1" }), /planned under inputs rule r1/);
  assert.match(checkNode({ inputsRule: "travel" }), /was not chosen/);
  assert.match(checkNode({ inputsRule: "x" }), /one of plan, r1, travel/);
  assert.ok(!installCommand().includes("minimum_release_age") && installCommand({ policy: "release-age-off" }).includes("pnpm_config_minimum_release_age=0 pnpm install"));
  assert.ok(installCommand().endsWith("--fetch-retries=0 --fetch-timeout=3000"));
  assert.throws(() => installCommand({ policy: "nope" }), /store policy/);
  assert.deepEqual(Object.keys(STORE_POLICIES), ["verified", "release-age-off"]);
});

test("tree deltas: dsh blobs by id, decoys by base and marker, removals; the install-inputs hash", () => {
  const base = new Map([["README.md", f("r0")], ["packages/a/old.ts", f("o")], ["package.json", f("p0")]]);
  const { tree, delta } = modelDelta(plan, base, { before: ["s1", "s2", "s4", "t2"] });
  assert.deepEqual(delta, [["README.md", "100644", null, { base: "r0", marker: "planned conflict s4" }], ["docs/a.md", "100644", "b1"], ["packages/a/old.ts", null], ["pnpm-lock.yaml", "100644", "lock2"]]);
  assert.deepEqual(treeDelta(base, tree, plan), delta, "the play's delta (treeDelta) and the plan's model agree");
  assert.notEqual(inputsHash(base), inputsHash(tree.files), "a lockfile change changes the inputs hash");
  assert.equal(inputsHash(new Map([...base, ["docs/x.md", f("z")]])), inputsHash(base), "a non-input does not");
  assert.equal(inputsHash(new Map([...base, ["node_modules/x/package.json", f("z")]])), inputsHash(base), "installed files are not inputs");
});

test("the native tree is the identical tree: materialize from the delta equals git's write-tree of the same files in a Workspace (treeIdCommand)", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lfs352-p3-")), src = join(dir, "src");
  const sh = (cwd, cmd) => execFileSync("sh", ["-c", cmd], { cwd, encoding: "utf8", env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "a", GIT_AUTHOR_EMAIL: "a@x", GIT_COMMITTER_NAME: "a", GIT_COMMITTER_EMAIL: "a@x" } });
  try {
    mkdirSync(join(src, "packages/a"), { recursive: true });
    writeFileSync(join(src, "README.md"), "hello\nworld\n"); writeFileSync(join(src, "packages/a/old.ts"), "old\n"); writeFileSync(join(src, ".gitignore"), "node_modules/\nlib/\n");
    sh(src, "git init -q -b main . && git add -A && git commit -qm base");
    const baseTree = sh(src, "git rev-parse HEAD^{tree}").trim(), r0 = sh(src, "git rev-parse HEAD:README.md").trim();
    const b1 = sh(src, "printf 'doc\\n' | git hash-object -w --stdin").trim(), lock = sh(src, "printf 'lockfileVersion: 9\\n' | git hash-object -w --stdin").trim();
    const p = { ...plan, steps: plan.steps.map((s) => ({ ...s, files: s.files.map((x) => (x.blob === "b1" ? { ...x, blob: b1 } : x.blob === "lock2" ? { ...x, blob: lock } : x.base === "r0" ? { ...x, base: r0 } : x)) })) };
    const base = new Map(sh(src, "git ls-tree -r HEAD").trim().split("\n").map((l) => { const [m, path] = l.split("\t"); const [mode, , blob] = m.split(" "); return [path, { mode, blob }]; }));
    const { delta } = modelDelta(p, base, { before: ["s1", "s2", "s4", "t2"] });
    const blobs = { get: async (id) => Buffer.from(sh(src, `git cat-file blob ${id}`)) };
    const repo = scratchRepo(join(dir, "scratch.git"), join(src, ".git"));
    const native = await materialize(repo, baseTree, delta, blobs);
    // the Workspace side: the same files on disk, plus ignored output, then treeIdCommand
    mkdirSync(join(src, "docs"), { recursive: true }); writeFileSync(join(src, "docs/a.md"), "doc\n"); writeFileSync(join(src, "pnpm-lock.yaml"), "lockfileVersion: 9\n");
    writeFileSync(join(src, "README.md"), decoyBytes(Buffer.from("hello\nworld\n"), "planned conflict s4")); rmSync(join(src, "packages/a/old.ts"));
    mkdirSync(join(src, "node_modules/x"), { recursive: true }); writeFileSync(join(src, "node_modules/x/i.js"), "x"); mkdirSync(join(src, "packages/a/lib"), { recursive: true }); writeFileSync(join(src, "packages/a/lib/i.js"), "y");
    const before = sh(src, "git status --porcelain");
    const lfs = /@@tree (\w+)/.exec(sh(src, treeIdCommand(".git")))[1];
    assert.equal(lfs, native);
    assert.equal(sh(src, "git status --porcelain"), before, "the tree id command writes nothing to .git or its index");
    assert.equal(sh(src, `git count-objects | cut -d' ' -f1`).trim(), sh(src, "git count-objects | cut -d' ' -f1").trim());
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("P1–P5 judges: pass, stop, n/a and NOT_RUN; build-output caches are not install output", () => {
  const g = (name, d) => ({ g: name, digest: d, n: 1, bytes: 1 });
  const native = { groups: [g("node_modules/a", "1"), g("node_modules/.vite", "x")], exit: 0, output: "Done in <t> using pnpm\n/lfs352-native-root ok", tsc: { exit: 0 }, emitted: { "packages/a/lib/i.js": "e1" }, vitest: { results: { "t1.spec.ts": "pass", "t2.spec.ts": "fail" } } };
  assert.equal(judgeP1(native, [g("node_modules/a", "1"), g("node_modules/.vite", "y")], { bookkeeping: 2, shims: 3, links: 9 }).result, "pass");
  assert.equal(judgeP1(native, [g("node_modules/a", "1"), g("node_modules/.vite", "y")], { bookkeeping: 2, shims: 3, links: 9 }).normalized, 5, "not byte-compared: state files and shims");
  assert.match(judgeP1(native, [g("node_modules/a", "2")]).detail, /differ 1/);
  assert.equal(judgeP1(null, []).result, "NOT_RUN");
  assert.equal(judgeP2(native, { exitCode: 0, output: "Done in <t> using pnpm\n/w/ws1 ok" }, "/w/ws1").result, "pass");
  assert.equal(judgeP2(native, { exitCode: 1, output: "" }, "/w").result, "stop");
  assert.equal(judgeP3({ kind: "install" }, null).result, "n/a");
  assert.equal(judgeP3({ kind: "refresh", inputs: "b" }, "a").result, "n/a");
  assert.equal(judgeP3({ kind: "refresh", inputs: "a", install: { changed: ["node_modules/.modules.yaml", "packages/x/node_modules/.pnpm-workspace-state-v1.json"] } }, "a").result, "pass");
  assert.equal(judgeP3({ kind: "refresh", inputs: "a", install: { changed: ["node_modules/a/index.js"] } }, "a").result, "stop");
  // R1 slice r015-2-packages-core: a new mount path makes pnpm rewrite its shims and links; bookkeeping at any root
  const shims = { kind: "refresh", inputs: "a", root: "/workspaces/20", install: { changed: ["node_modules/.modules.yaml", "node_modules/.bin/tsc", "node_modules/.pnpm/node_modules/cosmokit", "packages/x/node_modules/.bin/cordis"], links: ["node_modules/.pnpm/node_modules/cosmokit"] } };
  assert.deepEqual([judgeP3(shims, "a").result, judgeP3(shims, "a").detail], ["pass", "4 bookkeeping path(s)"]);
  assert.equal(judgeP3({ ...shims, install: { ...shims.install, links: [] } }, "a").result, "stop", "a rewritten path that is not a link is a package file: stop");
  assert.equal(judgeP3({ ...shims, install: { ...shims.install, changed: [...shims.install.changed, "examples/acp-agent/README.md"] } }, "a").result, "stop", "a path outside node_modules stops");
  assert.equal(judgeP3({ ...shims, install: { changed: ["docs/x"], links: ["docs/x"] } }, "a").result, "stop", "a link outside node_modules stops");
  // P2 strips native's own root when it ran at LayerFS's path (nativeChain `root`)
  assert.equal(judgeP2({ exit: 0, output: "/workspaces/20/x ok", root: "/workspaces/20" }, { exitCode: 0, output: "/workspaces/20/x ok" }, "/workspaces/20").result, "pass");
  // the repair (r016.a2): native installs at /workspaces/3, then its build moves the folder to /workspaces/4 (root);
  // the install's output names /workspaces/3, so P2 strips the install's folder, never the build's
  const warn = (r) => `[WARN] Failed to create bin at ${r}/python/x/.bin/a. ENOENT: open '${r}/packages/b/lib/bin.js'`;
  assert.equal(judgeP2({ exit: 0, output: warn("/workspaces/3"), root: "/workspaces/4", installRoot: "/workspaces/3" }, { exitCode: 0, output: warn("/workspaces/3") }, "/workspaces/3").result, "pass");
  assert.equal(judgeP2({ exit: 0, output: warn("/workspaces/3"), root: "/workspaces/4", states: [{ root: "/workspaces/1" }, { root: "/workspaces/3" }] }, { exitCode: 0, output: warn("/workspaces/3") }, "/workspaces/3").result, "pass", "a cached oracle: the last state's folder");
  assert.equal(judgeP2({ exit: 0, output: warn("/workspaces/3"), root: "/workspaces/4", installRoot: "/workspaces/3" }, { exitCode: 0, output: warn("/workspaces/3").replace("bin.js", "cli.js") }, "/workspaces/3").result, "stop", "a real difference still stops");
  assert.ok(STATE_FILES.test("node_modules/.pnpm/lock.yaml") && !STATE_FILES.test("node_modules/.pnpm/a@1/node_modules/a/index.js"));
  assert.equal(judgeP4(native, null).result, "n/a");
  assert.equal(judgeP4(native, { exitCode: 0, emitted: { "packages/a/lib/i.js": "e1" } }).result, "pass");
  assert.match(judgeP4(native, { exitCode: 0, emitted: { "packages/a/lib/i.js": "e2" } }).detail, /1 emitted file/);
  assert.equal(judgeP4(native, { exitCode: 2, emitted: {} }).result, "stop");
  const cal = { run: ["t1.spec.ts"], skipped: [{ file: "t2.spec.ts", reason: "fails natively" }] };
  assert.equal(judgeP5(native, { results: { "t1.spec.ts": "pass" } }, cal).result, "pass");
  assert.deepEqual(judgeP5(native, { results: { "t1.spec.ts": "pass" } }, cal).skipped, [{ file: "t2.spec.ts", reason: "fails natively" }]);
  assert.match(judgeP5(native, { results: { "t1.spec.ts": "fail" } }, cal).detail, /pass natively, fail on LayerFS/);
  assert.equal(judgeP5(native, null, null).result, "NOT_RUN");
  assert.equal(judgeP5(native, null, { run: [], skipped: [] }).result, "n/a");
  const moved = judgePoint({ kind: "refresh", treeLfs: "a".repeat(40) }, null, { treeOk: false });
  assert.deepEqual(Object.values(moved).map((x) => x.result), ["NOT_RUN", "NOT_RUN", "NOT_RUN", "NOT_RUN", "NOT_RUN", "n/a"]);
  const t = proofTally({ points: [{ lane: "L", point: "mid", proofs: moved }] });
  assert.deepEqual([t.pass, t.stop, t.notRun, t.na], [0, 0, 5, 1], "n/a is never counted as NOT_RUN or pass");
  const rp = judgeRepair({ rows: [{ kind: "repair-install", rewritten: 12 }, { kind: "build", exitCode: 0, emitted: { "packages/a/lib/i.js": "e1" } }], oracle: { ok: true }, outputOk: true }, native);
  assert.deepEqual([rp.proofs.P6.result, rp.proofs.P6.rewritten, rp.proofs.P2.result], ["pass", 12, "pass"]);
  // Node on: P1 against the on-top native chain's lister, even where the closure's lead-only oracle differed
  const merged = [{ g: "node_modules/.modules.yaml", digest: "y3" }, { g: "node_modules/.vite", digest: "cache" }];
  const onTop = { ...native, groups: [{ g: "node_modules/.modules.yaml", digest: "y3" }] };
  const closure = { rows: [{ kind: "repair-install", rewritten: 1, exitCode: native.exit, output: "", root: "/w" }, { kind: "build", exitCode: 0, emitted: { "packages/a/lib/i.js": "e1" } }], oracle: { ok: false }, outputOk: false };
  assert.equal(judgeRepair(closure, onTop, { groups: merged }).proofs.P6.result, "pass", "the vitest cache is build output; the state file equals the on-top chain's");
  assert.match(judgeRepair(closure, { ...onTop, groups: [{ g: "node_modules/.modules.yaml", digest: "y2" }] }, { groups: merged }).proofs.P6.detail, /P1 stop \(missing 0, extra 0, differ 1/);
  assert.equal(judgeRepair(closure, native).proofs.P6.result, "stop", "without the on-top lister the closure's comparison decides");
});

test("the vitest cap: passing files fastest first within 20 s native; failing files skip-listed with their reason", () => {
  const c = chooseFiles({ a: "pass", b: "pass", c: "fail", d: "pass" }, { a: 15_000, b: 3_000, c: 1, d: 4_000 }, 20_000);
  assert.deepEqual(c.run, ["b", "d"]);
  assert.deepEqual(c.skipped, [{ file: "c", reason: "fails natively" }, { file: "a", reason: "over the 20 s cap" }]);
  assert.equal(c.nativeMs, 7_000);
  const r = vitestReport(`junk{"testResults":[{"name":"/lfs352-native-root/p/t.spec.ts","status":"passed","startTime":10,"endTime":40}]}`, "/lfs352-native-root");
  assert.deepEqual([r.results, r.durations], [{ "p/t.spec.ts": "pass" }, { "p/t.spec.ts": 30 }]);
  assert.deepEqual(vitestReport("not json", "/x"), { results: null, durations: null, messages: null });
});

test("builds: the lead's whole workspace (dsh's tsconfig.build.json), a lane's changed packages with a tsconfig", () => {
  const files = new Map([["tsconfig.build.json", f("t")], ["packages/a/package.json", f("1")], ["packages/a/tsconfig.json", f("2")], ["packages/b/package.json", f("3")], ["docs/x.md", f("4")]]);
  assert.equal(wholeBuild(files).command, "./node_modules/.bin/tsc -b tsconfig.build.json");
  assert.deepEqual(wholeBuild(new Map([...files].filter(([p]) => p !== "tsconfig.build.json"))).command, "./node_modules/.bin/tsc -b 'packages/a'");
  assert.deepEqual(changedPackages(files, ["packages/a/src/x.ts", "packages/b/y.ts", "docs/x.md"]), ["packages/a"]);
  // dsh's build bundles after tsc (its package.json `build`): tsc emits only lib/types, the tests resolve lib/index.js
  const bundled = new Map([...files, ["tsdown.config.ts", f("5")]]);
  assert.equal(wholeBuild(bundled).command, "./node_modules/.bin/tsc -b tsconfig.build.json && ./node_modules/.bin/tsdown");
  assert.deepEqual(pointBuild(bundled, ["packages/a"]), { command: "./node_modules/.bin/tsc -b 'packages/a' && ./node_modules/.bin/tsdown", packages: ["packages/a"] });
  assert.equal(pointBuild(bundled, []).command, null);
  // the lead's install first removes empty folders a P2 replay left (tsdown takes each as a package); .git and node_modules are kept
  assert.match(PRUNE_EMPTY, /-path \.\/\.git -o -name node_modules \\\) -prune -o -type d -empty/);
});

test("execs by tool and storage by step: git, pnpm, tsc, vitest, other; .git-*, Node and build labels", () => {
  assert.equal(execTool("set -e\nexport GIT_CONFIG_COUNT=1 …", "r015.s0003.git-commit"), "git");
  assert.equal(execTool("mkdir -p /tmp/pnpm-cache && for d in /pnpm-store/.cache/*/", "r015-1-a.mid.refresh"), "pnpm");
  assert.equal(execTool("./node_modules/.bin/tsc -b 'packages/a'", "r015-1-a.mid.tsc"), "tsc");
  assert.equal(execTool("CI=1 timeout 110 ./node_modules/.bin/vitest run --reporter=json", "r015-1-a.mid.vitest"), "vitest");
  assert.equal(execTool("pwd", "r015-1-a.mid.refresh"), "other");
  const src = stepSource(15);
  assert.deepEqual(["r015.git-seed", "r015.s0001.git-commit", "r015.git-main", "r015-1-a.mid.refresh", "r015-1-a.end.install", "r015.repair-install", "r015.install", "r015-1-a.mid.tsc", "r015-1-a.mid.vitest", "r015.test", "r015.s0001"].map((step) => src({ step })),
    ["git", "git", "git", "nodeModules", "nodeModules", "nodeModules", "nodeModules", "build", "build", "build", "tracked"]);
});

test("a dev slice: the range's first mainline steps up to N dsh commits, its checkpoint a mainline commit", () => {
  const range = { index: 15, steps: [{ mainline: "m1", tree: "t1", commits: ["a", "b"] }, { mainline: "m2", tree: "t2", commits: ["c"] }, { mainline: "m3", tree: "t3", commits: ["d", "e", "f"] }], commits: 6, checkpoint: "m3", tree: "t3" };
  const s = sliceRange(range, 3);
  assert.deepEqual([s.steps.length, s.commits, s.checkpoint, s.tree, s.slice.of], [2, 3, "m2", "t2", "m3"]);
  assert.equal(sliceRange(range, 99).checkpoint, "m3");
});

test("the devcheck's reinstall oracle under Node: the repair's chain and build, then the clean reinstall on top (R1 slice f031-r1-slice-f)", () => {
  const dir = mkdtempSync(join(tmpdir(), "p3-reinstall-")), repo = join(dir, "r.git"), plan = join(dir, "plan");
  try {
    execFileSync("git", ["init", "-q", "--bare", repo]);
    const tree = execFileSync("git", ["--git-dir", repo, "mktree"], { input: "", encoding: "utf8" }).trim();
    const commit = execFileSync("git", ["--git-dir", repo, "-c", "user.name=t", "-c", "user.email=t@t", "commit-tree", tree, "-m", "c"], { encoding: "utf8" }).trim();
    mkdirSync(plan); writeFileSync(join(plan, "range-015.json"), JSON.stringify({ lanes: [{ name: "a", areas: ["/"] }, { name: "b", areas: ["docs"] }], consolidation: [{ op: "merge", lane: "b" }, { op: "merge", lane: "a" }, { op: "reconcile", files: [{ path: "pk/gone/src/i.ts", op: "rm" }, { path: "pk/kept.ts", op: "write" }] }] }));
    const run = { dir, manifest: { repo, plan, node: { on: true, inputsRule: "r1" } } };
    // the lanes' recorded writes (owner option 1): a's point finished after b's
    mkdirSync(join(dir, "trace"));
    const exec = (step, start, ms) => JSON.stringify({ method: "sandbox.exec", phase: "end", step, start, ms });
    writeFileSync(join(dir, "trace", "range-015.a1.jsonl"), [exec("a.1.tsc#9", "2026-10-19T10:00:05.000Z", 1000), exec("b.1.tsc#8", "2026-10-19T10:00:00.000Z", 2000), exec("a.lane-step#3", "2026-10-19T11:00:00.000Z", 1)].join("\n") + "\n");
    const lane = (laneName, order, root) => ({ lane: laneName, point: String(order), order, root, treeNative: `t-${laneName}${order}`, install: { command: "install" }, tsc: { command: `tsc ${laneName}` } });
    const m = { range: 15, attempt: 1, plan: { checkpoint: commit }, node: { chain: [{ tree: "t0", command: "lead install" }], points: [{ lane: "lead", root: "/workspaces/1" }, lane("a", 1, "/workspaces/2"), lane("b", 1, "/workspaces/3")] },
      closure: { rows: [{ kind: "repair-install", command: "repair", root: "/workspaces/4" }, { kind: "build", command: "build", packages: ["p"], root: "/workspaces/4" }] }, p3proofs: { "lead.repair": {} } };
    const states = reinstallStates(run, m, 15, "clean install");
    // option A (fix 042), owner option 1: lanes in their recorded write order (b ended 10:00:02, a 10:00:06; a lane
    // step outside its points does not count), each tagged with its lane, its place and its last write
    assert.deepEqual(states.map((x) => [x.tree, x.command, x.root ?? null, x.lane ?? null, x.merge ?? null, x.wrote ?? null]), [
      ["t0", "lead install", "/workspaces/1", null, null, null], ["t-b1", "tsc b", "/workspaces/3", "b", 0, "2026-10-19T10:00:02.000Z"],
      ["t-a1", "install", "/workspaces/2", "a", 1, "2026-10-19T10:00:06.000Z"], ["t-a1", "tsc a", "/workspaces/2", "a", 1, "2026-10-19T10:00:06.000Z"],
      [tree, "repair", "/workspaces/4", null, null, null], [tree, "build", "/workspaces/4", null, null, null], [tree, "clean install", null, null, null, null]]);
    // after the lanes' merge the repair state carries the reconcile's removals, as LayerFS's reconcile applies them
    // (r019 a3: a lane's files under a folder the checkpoint deleted, natively kept, made tsdown fail)
    assert.deepEqual(states.find((x) => x.command === "repair").remove, ["pk/gone/src/i.ts"]);
    writeFileSync(join(plan, "range-015.json"), JSON.stringify({ lanes: [{ name: "a", areas: ["/"] }, { name: "b", areas: ["docs"] }], consolidation: [{ op: "merge", lane: "a" }] }));
    assert.throws(() => reinstallStates(run, m, 15, "clean install"), /lane b is not merged/);
    assert.throws(() => reinstallStates(run, { ...m, attempt: 2 }, 15, "clean install"), /no trace of attempt 2/);
    assert.throws(() => reinstallStates(run, { ...m, p3proofs: {} }, 15, "clean install"), /repair proof has not run/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("the oracle tool predicts the lead's install as the run records it (p3-main-a r015.a1: a seq oracle keyed without PRUNE_EMPTY)", () => {
  assert.equal(pointInstall({ policy: "verified" }), `${PRUNE_EMPTY} && ${installCommand({ policy: "verified" })}`);
  assert.equal(pointInstall({ clean: true }), `${PRUNE_EMPTY} && ${installCommand({ clean: true })}`);
});

test("a lane's later steps wait for its test point, never another lane's (#352 r015.a2: s0073 landed during docs-rfc.mid)", () => {
  const later = { ...plan, steps: [...plan.steps, { id: "s5", lane: "L1", kind: "check", order: 6, files: [] }] };
  const pts = testPoints(later), at = (id) => later.steps.find((s) => s.id === id);
  assert.deepEqual(pointsBefore(pts, at("s4")), [], "a point's own step does not wait for it");
  assert.deepEqual(pointsBefore(pts, at("s5")), ["L1.end"], "a non-writing step after the point waits: the lane is quiet during it");
  assert.deepEqual(pointsBefore(pts, at("t2")), [], "L2's point is its own");
});

test("decision B: the lead's git clean removes untracked, unignored files only; native the same; a clean tree is untouched", () => {
  const dir = mkdtempSync(join(tmpdir(), "lfs352-clean-"));
  const sh = (cwd, script) => execFileSync("sh", ["-c", script], { cwd, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
  const put = (root, path, text) => { mkdirSync(join(root, path, ".."), { recursive: true }); writeFileSync(join(root, path), text); };
  try {
    const wt = join(dir, "wt");
    put(wt, ".gitignore", "node_modules/\nlib/\n"); put(wt, "pkg/src/a.ts", "export {}\n"); put(wt, "pkg/tsconfig.json", "{}\n"); put(wt, "README.md", "r\n");
    sh(wt, "git init -q && git add -A && git commit -q -m base");
    // a tree with nothing untracked: nothing removed, nothing listed
    let m = marks(sh(wt, cleanScript()));
    assert.deepEqual([m.cleanedFiles, m.cleanedBytes, m.cleanedTracked, m.cleanedIgnored, m.cleanLeft], [0, 0, 0, 0, 0]);
    // an emitted output beside its source (r016.a1), ignored output, node_modules, an untracked folder
    put(wt, "pkg/src/a.js", "x\n"); put(wt, "pkg/src/a.d.ts.map", "yy\n"); put(wt, "pkg/lib/types/a.js", "z\n"); put(wt, "node_modules/p/index.js", "n\n"); put(wt, "pkg/node_modules/q/i.js", "q\n"); put(wt, "newdir/f.txt", "f\n");
    put(wt, "README.md", "changed\n");
    const out = sh(wt, cleanScript());
    m = marks(out);
    assert.deepEqual([m.cleanedFiles, m.cleanedBytes, m.cleanedTracked, m.cleanedIgnored, m.cleanLeft], [2, 5, 0, 0, 0]);
    assert.deepEqual(cleanedPaths(out).sort(), ["pkg/src/a.d.ts.map", "pkg/src/a.js"]);
    for (const p of ["pkg/src/a.js", "pkg/src/a.d.ts.map"]) assert.ok(!existsSync(join(wt, p)), `${p} removed`);
    for (const p of ["pkg/lib/types/a.js", "node_modules/p/index.js", "pkg/node_modules/q/i.js", "newdir/f.txt", "pkg/src/a.ts"]) assert.ok(existsSync(join(wt, p)), `${p} kept (ignored, node_modules, untracked folder: no -x, no -d; tracked)`);
    assert.equal(sh(wt, "cat README.md"), "changed\n", "a tracked file is never touched");
    // native: the same list from an index of the tree, no .git in the folder
    const nat = join(dir, "nat"), tree = sh(wt, "git rev-parse HEAD^{tree}").trim();
    sh(wt, `git archive HEAD | (mkdir -p ${nat} && tar -x -C ${nat}) && git ls-tree -r -z --full-tree ${tree} > ${join(dir, "0.idx")}`);
    put(nat, "pkg/src/a.js", "x\n"); put(nat, "pkg/src/a.d.ts.map", "yy\n"); put(nat, "pkg/lib/types/a.js", "z\n"); put(nat, "node_modules/p/index.js", "n\n"); put(nat, "newdir/f.txt", "f\n"); put(nat, "README.md", "changed\n");
    const nm = sh(nat, nativeClean(0, join(dir, "0.idx"), dir));
    assert.match(nm, /^@@cleaned 0 2$/m);
    for (const p of ["pkg/src/a.js", "pkg/src/a.d.ts.map"]) assert.ok(!existsSync(join(nat, p)));
    for (const p of ["pkg/lib/types/a.js", "node_modules/p/index.js", "newdir/f.txt", "pkg/src/a.ts", "README.md"]) assert.ok(existsSync(join(nat, p)));
    assert.match(sh(nat, nativeClean(1, join(dir, "0.idx"), dir)), /^@@cleaned 1 0$/m, "natively clean: nothing to remove");
    assert.match(sh(nat, nativeClean(2, join(dir, "missing.idx"), dir)), /^@@cleaned 2 -1$/m, "a failed native clean says so");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a fork of a P3 snapshot keeps the git and Node state (r016.a2): from the source run while it never advanced, else the snapshot, else refused", () => {
  const st = { next: 16, halfway: null, dirty: 16, gitSeeded: 15, installed: true, closureChain: [{ range: 15, kind: "install" }], lwwSha: "s", nmGroupsFile: "/r/closure/groups-015.json", parts: { total: 1 }, bySource: { a: 1 }, heads: { 15: "h" } };
  const src = (state, on = true) => ({ manifest: { git: { on }, node: { on } }, state });
  assert.deepEqual(forkP3State(src(st), { next: 16 }, 15), { from: "source run state (never advanced past the snapshot)", state: p3StateOf(st) });
  assert.deepEqual(Object.keys(p3StateOf(st)), ["gitSeeded", "installed", "closureChain", "lwwSha", "nmGroupsFile", "parts", "bySource"]);
  assert.equal(forkP3State(src({ ...st, nmGroupsFile: "/r/closure/groups-013.json" }), {}, 15).from, "source run state (never advanced past the snapshot)", "an earlier range's install is still range 15's state");
  // the run went on, or k + 1 got past its closure: the snapshot's own state, or a refusal
  for (const s of [{ ...st, next: 17 }, { ...st, closureChain: [{ range: 16 }] }, { ...st, nmGroupsFile: "/r/closure/groups-016.json" }, { ...st, halfway: 16 }]) {
    assert.equal(forkP3State(src(s), { next: 16 }, 15), null);
    assert.equal(forkP3State(src(s), { next: 16, installed: true, gitSeeded: 15 }, 15).from, "snapshot");
  }
  assert.deepEqual(forkP3State(src({ next: 9 }, false), {}, 7), { from: "none", state: {} }, "git and Node off: nothing to carry");
  // a snapshot's parts are the range before's: range k's come from its metrics (storageReport parts and sources)
  const sr = { storageReport: { parts: { total: 9, content: 5 }, sources: { tracked: { content: 3, metadata: 1, latest: 7 }, git: { content: 2, metadata: 0 } } } };
  assert.deepEqual(partsFromMetrics(sr), { parts: { total: 9, content: 5 }, bySource: { tracked: { content: 3, metadata: 1 }, git: { content: 2, metadata: 0 } } });
  assert.equal(partsFromMetrics({ storageReport: { parts: null } }), null);
});


// ---- option A (owner 2026-10-19, fix 042): the native repair chain merges the lanes as LayerFS does ----
test("option A: lane steps snapshot the base, capture and restore each lane, and apply in merge order before the repair", () => {
  const st = (lane, merge) => ({ tree: "t", command: "c", ...(lane ? { lane, merge } : {}) });
  const ls = laneSteps([st(), st("root", 0), st("core", 1), st("core", 1), st("ex", 2), st()], "/t.mjs", "/b", "/l");
  const cmd = (c) => c.replace(/ 2>\/tmp\/lane\.err .*$/, "");
  assert.deepEqual(ls.before.map((xs) => xs.map(cmd)), [[], ["node /t.mjs snapshot \"$PWD\" /b", "node /t.mjs mark /l/0"],
    ["node /t.mjs capture \"$PWD\" /b /l/0", "node /t.mjs restore \"$PWD\" /b /l/0", "node /t.mjs mark /l/1"], [],
    ["node /t.mjs capture \"$PWD\" /b /l/1", "node /t.mjs restore \"$PWD\" /b /l/1", "node /t.mjs mark /l/2"],
    ["node /t.mjs capture \"$PWD\" /b /l/2", "node /t.mjs restore \"$PWD\" /b /l/2", "node /t.mjs apply \"$PWD\" /l/0 /l/1 /l/2"]]);
  assert.ok(ls.before.flat().every((c) => /\|\| \{ echo "@@lanefail /.test(c)), "every merge step reports its failure");
  assert.notEqual(oracleKey({ tree: "t", states: [st("a", 0)] }), oracleKey({ tree: "t", states: [{ ...st("a", 0), lane: undefined, merge: undefined }] }));
  assert.equal(oracleKey({ tree: "t", states: [st()] }), oracleKey({ tree: "t", states: [st()] }), "a chain without lanes keeps its key");
  assert.deepEqual(ls.reset, [false, false, true, false, true, true], "after a restore the folder holds the lanes' base tree");
  assert.equal(ls.lanes, 3);
  // applied by merge rank, not by the order the lanes ran
  assert.match(laneSteps([st("b", 1), st("a", 0), st()], "/t.mjs", "/b", "/l").before[2].at(-1), /apply "\$PWD" \/l\/1 \/l\/0 2>/);
  assert.deepEqual(laneSteps([st(), st()]).lanes, 0, "no lanes: the chain as before");
  assert.throws(() => laneSteps([st("a", 0), st("b", 1), st("a", 0)]), /not together/);
  assert.throws(() => laneSteps([st("a")]), /no merge order/);
});

/** A folder of `files` ({path: text}) under a new temporary directory. */
const folder = (files) => {
  const dir = mkdtempSync(join(tmpdir(), "p3-lanes-")), work = join(dir, "w");
  for (const [p, text] of Object.entries(files)) { mkdirSync(join(work, p, ".."), { recursive: true }); writeFileSync(join(work, p), text); }
  return { dir, work, read: (p) => (existsSync(join(work, p)) ? readFileSync(join(work, p), "utf8") : null) };
};
/** Runs the lanes on `f` as nativeChain does: each lane's writes from the base, then the merge in `order`. */
const playLanes = (f, lanes, order) => {
  const base = join(f.dir, "base"), stores = {};
  lanemerge.snapshot(f.work, base);
  for (const [name, writes] of lanes) {
    const store = join(f.dir, `l-${name}`);
    lanemerge.mark(store);
    for (const [p, text] of Object.entries(writes)) { if (text == null) rmSync(join(f.work, p), { recursive: true, force: true }); else { mkdirSync(join(f.work, p, ".."), { recursive: true }); writeFileSync(join(f.work, p), text); } }
    lanemerge.capture(f.work, base, store);
    lanemerge.restore(f.work, base, store);
    stores[name] = store;
  }
  return lanemerge.apply(f.work, order.map((n) => stores[n]));
};

test("option A, r018.a1: lane 2's new tsc output of a moved source survives a later lane's rebuild of the old bytes", () => {
  const out = "packages/core/session/lib/types/tool-pairing.js";
  const f = folder({ "packages/core/session/src/tool-pairing.ts": "old src", [out]: "23bf (base output)", "node_modules/.pnpm/x/index.js": "pkg" });
  try {
    // lanes run 3, 2, 1 (as the play recorded them); the root lane's build rewrites the base's bytes (no change)
    const two = playLanes(f, [
      ["examples", { "packages/compact/compact/lib/types/tool-pairing.js": "compact output" }],
      ["core", { "packages/core/session/src/tool-pairing.ts": "edited src", [out]: "042b (lane 2 output)" }],
      ["root", { [out]: "23bf (base output)", "node_modules/.pnpm/y/index.js": "new pkg" }],
    ], ["root", "core", "examples"]);
    assert.equal(f.read(out), "042b (lane 2 output)", "LayerFS's merge: the only lane that changed it wins");
    assert.equal(f.read("packages/compact/compact/lib/types/tool-pairing.js"), "compact output");
    assert.equal(f.read("node_modules/.pnpm/y/index.js"), "new pkg", "the root lane's install changes merge too");
    assert.equal(f.read("packages/core/session/src/tool-pairing.ts"), "edited src");
    assert.deepEqual(two, [], "rewriting the base's bytes is no change, so nothing is two-sided");
    // the checkpoint removes the source; the repair build never touches the orphan: it stays lane 2's
    rmSync(join(f.work, "packages/core/session/src/tool-pairing.ts"));
    assert.equal(f.read(out), "042b (lane 2 output)");
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
  // the old sequential model, for contrast: the last lane to run writes the base's bytes back
  const g = folder({ [out]: "23bf (base output)" });
  try {
    writeFileSync(join(g.work, out), "042b (lane 2 output)"); writeFileSync(join(g.work, out), "23bf (base output)");
    assert.equal(g.read(out), "23bf (base output)");
  } finally { rmSync(g.dir, { recursive: true, force: true }); }
});

test("option A: a lane output the checkpoint build rewrites still converges; a lane's removals and restores are exact", () => {
  const f = folder({ "pkg/lib/a.js": "base a", "pkg/lib/b.js": "base b", "pkg/src/a.ts": "a", "keep/x.txt": "x", "gone/y.txt": "y" });
  try {
    playLanes(f, [["one", { "pkg/lib/a.js": "lane a", "gone/y.txt": null, "gone": null, "new/dir/z.txt": "z" }], ["two", { "pkg/lib/b.js": "lane b" }]], ["one", "two"]);
    assert.deepEqual([f.read("pkg/lib/a.js"), f.read("pkg/lib/b.js"), f.read("gone/y.txt"), f.read("new/dir/z.txt"), f.read("keep/x.txt")], ["lane a", "lane b", null, "z", "x"]);
    // the repair build rewrites a.js from the checkpoint's source: the result is the build's, whatever the lanes wrote
    writeFileSync(join(f.work, "pkg/lib/a.js"), "built from checkpoint");
    assert.equal(f.read("pkg/lib/a.js"), "built from checkpoint");
    // each lane ran from the base: lane two never saw lane one's files
    const two = JSON.parse(readFileSync(join(f.dir, "l-two", "changes.json"), "utf8"));
    assert.deepEqual(two, { changed: ["pkg/lib/b.js"], removed: [] });
    const one = JSON.parse(readFileSync(join(f.dir, "l-one", "changes.json"), "utf8"));
    assert.deepEqual(one.removed, ["gone"], "a removed folder is named once");
    assert.deepEqual(one.changed, ["new", "new/dir", "new/dir/z.txt", "pkg/lib/a.js"]);
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});

test("option A: links are copied as links, never followed (r018.a2: pnpm links a folder), and restored exactly", () => {
  const f = folder({ "node_modules/.pnpm/a@1/node_modules/a/index.js": "a1", "node_modules/.pnpm/a@2/node_modules/a/index.js": "a2" });
  try {
    symlinkSync(".pnpm/a@1/node_modules/a", join(f.work, "node_modules/a"));
    const base = join(f.dir, "base"), store = join(f.dir, "l");
    lanemerge.snapshot(f.work, base);
    lanemerge.mark(store);
    rmSync(join(f.work, "node_modules/a")); symlinkSync(".pnpm/a@2/node_modules/a", join(f.work, "node_modules/a"));
    symlinkSync(".pnpm/a@2/node_modules/a", join(f.work, "node_modules/b"));
    assert.deepEqual(lanemerge.capture(f.work, base, store).changed, ["node_modules/a", "node_modules/b"]);
    lanemerge.restore(f.work, base, store);
    assert.equal(readlinkSync(join(f.work, "node_modules/a")), ".pnpm/a@1/node_modules/a");
    assert.ok(!existsSync(join(f.work, "node_modules/b")));
    lanemerge.apply(f.work, [store]);
    assert.equal(readlinkSync(join(f.work, "node_modules/b")), ".pnpm/a@2/node_modules/a");
    assert.equal(f.read("node_modules/a/index.js"), "a2");
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});

test("option 1: two lanes writing one ignored file: the newest writer wins, even out of merge order; the path is listed", () => {
  // r018.a3's recorded ends: examples first, then root, then packages-core; merge order root, packages-core, examples
  const exec = (step, start, ms) => ({ method: "sandbox.exec", step, start, ms });
  const lines = [exec("r018-3-examples-acp-agent.end.tsc", "2026-10-19T15:50:10.887Z", 5240), exec("r018-1-root.end.tsc", "2026-10-19T15:50:16.684Z", 3726),
    exec("r018-2-packages-core.end.tsc", "2026-10-19T15:50:15.189Z", 5259), exec("r018-3-examples-acp-agent.s0100.git", "2026-10-19T15:59:00.000Z", 1)];
  const points = ["r018-3-examples-acp-agent", "r018-2-packages-core", "r018-1-root"].map((lane) => ({ lane, point: "end" }));
  const merged = ["r018-1-root", "r018-2-packages-core", "r018-3-examples-acp-agent"];
  const order = laneWriteOrder(lines, points, merged, 18);
  assert.deepEqual(order.map((x) => x.lane), ["r018-3-examples-acp-agent", "r018-1-root", "r018-2-packages-core"], "by last write, not merge order; a lane step is not a point write");
  assert.equal(order[2].end, "2026-10-19T15:50:20.448Z");
  // a tie keeps ours (main): the earlier-merged lane is applied last
  const tie = laneWriteOrder([exec("x.end.tsc", "2026-10-19T10:00:00.000Z", 5), exec("y.end.tsc", "2026-10-19T10:00:00.000Z", 5)], [{ lane: "x", point: "end" }, { lane: "y", point: "end" }], ["x", "y"], 18);
  assert.deepEqual(tie.map((x) => x.lane), ["y", "x"]);
  assert.throws(() => laneWriteOrder([], points, merged, 18), /has no recorded exec/);
  // applied in that order: packages-core's tsbuildinfo wins over the later-merged examples lane's, as /.lww kept it
  const f = folder({ "packages/bash/tool-bash/lib/tsconfig.tsbuildinfo": "base" });
  try {
    const two = playLanes(f, [["examples", { "packages/bash/tool-bash/lib/tsconfig.tsbuildinfo": "examples' build" }], ["core", { "packages/bash/tool-bash/lib/tsconfig.tsbuildinfo": "core's build" }]], ["examples", "core"]);
    assert.equal(f.read("packages/bash/tool-bash/lib/tsconfig.tsbuildinfo"), "core's build", "written last in the play, applied last");
    assert.deepEqual(two, ["packages/bash/tool-bash/lib/tsconfig.tsbuildinfo"], "the two-sided path stays listed");
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n${e.stack}`); }
}
console.log(`${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
