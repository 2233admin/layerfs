// Tests of the P3 harness build (F-031 git lanes, NODE_RULE churn and proofs):
//   node dsh/tools/history/tests/p3.mjs
// Pure parts and the native tree identity on a small git repository; nothing
// here starts a Sandbox, a daemon or a container.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { changedPackages, checkNode, commitIdOf, inputsHash, testPoints, treeDelta, treeIdCommand, wholeBuild } from "../nodelanes.mjs";
import { PRUNE_EMPTY, pointBuild } from "../nodeconfig.mjs";
import { chooseFiles, reinstallStates, judgeP1, judgeP2, judgeP3, judgeP4, judgeP5, judgePoint, judgeRepair, materialize, modelDelta, scratchRepo, STATE_FILES, vitestReport } from "../nodeproof.mjs";
import { execTool } from "../run.mjs";
import { installCommand, STORE_POLICIES } from "../closure.mjs";
import { sliceRange } from "../slice.mjs";
import { stepSource } from "../storage.mjs";
import { decoyBytes, Tree } from "../steps.mjs";
import { proofTally } from "../p3.mjs";

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

test("NODE_RULE §4 test points: after the middle and the last writing step; the root lane installs when its window changed an input", () => {
  const pts = testPoints(plan);
  assert.deepEqual(pts.map((p) => [p.id, p.step, p.kind, p.root]), [["L1.mid", "s2", "install", true], ["L1.end", "s4", "refresh", true], ["L2.mid", "t1", "refresh", false], ["L2.end", "t2", "refresh", false]]);
  assert.deepEqual(pts[1].before, ["s1", "s2", "s4"], "a check step is not a writing step");
  assert.equal(testPoints({ ...plan, steps: plan.steps.filter((s) => s.id !== "t2") }).filter((p) => p.lane === "L2").map((p) => p.point).join(), "end", "one point when mid and end coincide");
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
  assert.equal(judgeP1(native, [g("node_modules/a", "1"), g("node_modules/.vite", "y")], { shims: { files: 3 }, "node_modules/.modules.yaml": {} }).result, "pass");
  assert.equal(judgeP1(native, [g("node_modules/a", "1"), g("node_modules/.vite", "y")], { shims: { files: 3 }, "node_modules/.modules.yaml": {} }).normalized, 4);
  assert.match(judgeP1(native, [g("node_modules/a", "2")]).detail, /differ 1/);
  assert.equal(judgeP1(null, []).result, "NOT_RUN");
  assert.equal(judgeP2(native, { exitCode: 0, output: "Done in <t> using pnpm\n/w/ws1 ok" }, "/w/ws1").result, "pass");
  assert.equal(judgeP2(native, { exitCode: 1, output: "" }, "/w").result, "stop");
  assert.equal(judgeP3({ kind: "install" }, null).result, "n/a");
  assert.equal(judgeP3({ kind: "refresh", inputs: "b" }, "a").result, "n/a");
  assert.equal(judgeP3({ kind: "refresh", inputs: "a", install: { changed: ["node_modules/.modules.yaml", "packages/x/node_modules/.pnpm-workspace-state-v1.json"] } }, "a").result, "pass");
  assert.equal(judgeP3({ kind: "refresh", inputs: "a", install: { changed: ["node_modules/a/index.js"] } }, "a").result, "stop");
  // R1 slice r015-2-packages-core: a new mount path makes pnpm rewrite its root-carrying shims and links
  const shims = { kind: "refresh", inputs: "a", root: "/workspaces/20", install: { changed: ["node_modules/.modules.yaml", "node_modules/.bin/tsc", "node_modules/.pnpm/node_modules/cosmokit", "packages/x/node_modules/.bin/cordis"] } };
  assert.equal(judgeP3(shims, "a").result, "stop", "the same root: only state files");
  assert.equal(judgeP3(shims, "a", "/workspaces/20").result, "stop");
  assert.deepEqual([judgeP3(shims, "a", "/workspaces/2").result, judgeP3(shims, "a", "/workspaces/2").detail], ["pass", "4 path(s) in node_modules, root moved"]);
  assert.equal(judgeP3({ ...shims, install: { changed: [...shims.install.changed, "examples/acp-agent/README.md"] } }, "a", "/workspaces/2").result, "stop", "a path outside node_modules still stops");
  // P2 strips native's own root when it ran at LayerFS's path (nativeChain `root`)
  assert.equal(judgeP2({ exit: 0, output: "/workspaces/20/x ok", root: "/workspaces/20" }, { exitCode: 0, output: "/workspaces/20/x ok" }, "/workspaces/20").result, "pass");
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
    mkdirSync(plan); writeFileSync(join(plan, "range-015.json"), JSON.stringify({ lanes: [{ name: "a", areas: ["/"] }, { name: "b", areas: ["docs"] }] }));
    const run = { manifest: { repo, plan, node: { on: true, inputsRule: "r1" } } };
    const lane = (laneName, order, root) => ({ lane: laneName, order, root, treeNative: `t-${laneName}${order}`, install: { command: "install" }, tsc: { command: `tsc ${laneName}` } });
    const m = { plan: { checkpoint: commit }, node: { chain: [{ tree: "t0", command: "lead install" }], points: [{ lane: "lead", root: "/workspaces/1" }, lane("a", 1, "/workspaces/2"), lane("b", 1, "/workspaces/3")] },
      closure: { rows: [{ kind: "repair-install", command: "repair", root: "/workspaces/4" }, { kind: "build", command: "build", packages: ["p"], root: "/workspaces/4" }] }, p3proofs: { "lead.repair": {} } };
    const states = reinstallStates(run, m, 15, "clean install");
    assert.deepEqual(states.map((x) => [x.tree, x.command, x.root ?? null]), [
      ["t0", "lead install", "/workspaces/1"], ["t-a1", "install", "/workspaces/2"], ["t-a1", "tsc a", "/workspaces/2"],
      ["t-b1", "tsc b", "/workspaces/3"], [tree, "repair", "/workspaces/4"], [tree, "build", "/workspaces/4"], [tree, "clean install", null]]);
    assert.throws(() => reinstallStates(run, { ...m, p3proofs: {} }, 15, "clean install"), /repair proof has not run/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n${e.stack}`); }
}
console.log(`${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
