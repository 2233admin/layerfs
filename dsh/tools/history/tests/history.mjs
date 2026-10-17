// Tests of the history replay tools (#352) on a small synthetic repository:
//   node dsh/tools/history/tests/history.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BlobCache, blobId, diffTrees, git, lsTree, readCommits, topoPositions, unquote } from "../git.mjs";
import { cutRanges, mainlineSteps, snapshotPolicy } from "../ranges.mjs";
import { area, dirCounts, finishes, planRange, replayPlan, rng, stateDiff } from "../plan-range.mjs";
import { apply, summarize } from "../plan.mjs";
import { compareTree, expectations } from "../oracle.mjs";
import { aggregate, buildBaseline, evaluate, exponent, rising, sizeClass } from "../gates.mjs";
import { renderComment, renderIndex, renderRange, LEAD_START } from "../report.mjs";

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// A repository with mainline commits, a side branch merged with a textual
// merge, a symlink, an executable and a spread of areas.
const dir = mkdtempSync(join(tmpdir(), "lfs-history-test-"));
const run = (...a) => execFileSync("git", a, { cwd: dir, env: { ...process.env, GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z", GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z", GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" }, encoding: "utf8" });
const put = (p, text) => { mkdirSync(join(dir, p, ".."), { recursive: true }); writeFileSync(join(dir, p), text); };
run("init", "-q", "-b", "master");
put("README.md", "hello\n");
put("packages/a/src/index.ts", "export const a = 1;\n");
run("add", "-A"); run("commit", "-q", "-m", "init");
for (let i = 0; i < 12; i++) {
  put(`packages/${"abc"[i % 3]}/src/f${i}.ts`, `export const f${i} = ${i};\n`);
  put("packages/a/src/index.ts", `export const a = ${i};\nexport const shared = "x";\n`);
  run("add", "-A"); run("commit", "-q", "-m", `main ${i}`);
}
run("checkout", "-q", "-b", "side");
for (let i = 0; i < 6; i++) {
  put(`apps/web/p${i}.ts`, `export const p${i} = ${i};\n`);
  if (i === 0) put("packages/a/src/index.ts", `// side header\nexport const a = 11;\nexport const shared = "x";\n`);
  if (i === 1) { symlinkSync("p0.ts", join(dir, "apps/web/link.ts")); put("apps/web/run.sh", "#!/bin/sh\necho hi\n"); chmodSync(join(dir, "apps/web/run.sh"), 0o755); }
  run("add", "-A"); run("commit", "-q", "-m", `side ${i}`);
}
run("checkout", "-q", "master");
put("packages/a/src/index.ts", `export const a = 11;\nexport const shared = "y";\n`);
run("add", "-A"); run("commit", "-q", "-m", "main edit");
run("merge", "-q", "--no-ff", "-m", "merge side", "side");
for (let i = 0; i < 8; i++) { put(`packages/b/src/g${i}.ts`, `export const g${i} = ${i};\n`); run("add", "-A"); run("commit", "-q", "-m", `after ${i}`); }
run("rm", "-q", "packages/c/src/f2.ts"); run("commit", "-q", "-m", "remove one");
const repo = join(dir, ".git");
const head = git(repo, ["rev-parse", "master"]).trim();

test("unquote reverses git path quoting", () => {
  assert.equal(unquote('"a\\tb"'), "a\tb");
  assert.equal(unquote('"caf\\303\\251.md"'), "café.md");
  assert.equal(unquote("plain/path"), "plain/path");
});

test("blob cache returns contents whose ids match git", async () => {
  const tree = lsTree(repo, head).files;
  const cache = new BlobCache(repo);
  const e = tree.get("README.md");
  const body = await cache.get(e.blob);
  assert.equal(body.toString(), "hello\n");
  assert.equal(blobId(body), e.blob);
  assert.equal(blobId(await cache.get(e.blob)), e.blob, "a second read comes from the LRU");
  await assert.rejects(cache.get("0".repeat(39) + "1"), /missing/);
  cache.close();
});

test("mainline steps bring side commits in topological order", () => {
  const commits = readCommits(repo, head);
  const steps = mainlineSteps(commits, topoPositions(repo, head), head);
  const merge = steps.find((s) => s.side);
  assert.equal(merge.commits.length, 6);
  const pos = topoPositions(repo, head);
  assert.deepEqual(merge.commits, [...merge.commits].sort((a, b) => pos.get(a) - pos.get(b)));
  assert.equal(steps.reduce((n, s) => n + s.commits.length, 0), commits.size - 1, "every non-merge commit once");
});

test("ranges respect the target, fold a short tail and end on mainline", () => {
  const commits = readCommits(repo, head);
  const steps = mainlineSteps(commits, topoPositions(repo, head), head);
  const ranges = cutRanges(steps, { target: 8, min: 4, max: 12 });
  assert.equal(ranges.reduce((n, r) => n + r.commits, 0), steps.slice(1).reduce((n, s) => n + s.commits.length, 0));
  for (const r of ranges.slice(0, -1)) assert.ok(r.commits >= 4);
  for (const r of ranges) assert.equal(r.checkpoint, r.steps.at(-1).mainline);
  const p = snapshotPolicy(40);
  assert.ok(p(0).snapshot && p(4).snapshot && p(4).milestone && !p(5).snapshot && !p(10).snapshot && p(9).milestone && p(39).milestone);
});

/** Plans every range of the test repository, checking each reaches its checkpoint. */
function planAll(opts = {}) {
  const commits = readCommits(repo, head);
  const steps = mainlineSteps(commits, topoPositions(repo, head), head);
  const ranges = cutRanges(steps, { target: 10, min: 5, max: 30 });
  let state = lsTree(repo, steps[0].mainline).files, prevCommit = steps[0].mainline;
  const sizes = new Map();
  for (const c of commits.values()) for (const x of c.changes) sizes.set(x.blob, 30);
  const plans = [];
  for (const [i, r] of ranges.entries()) {
    const next = apply(new Map(state), diffTrees(repo, prevCommit, r.checkpoint));
    const plan = planRange({ k: i, range: r, commits, prev: state, next, prevDirs: dirCounts(state), sizes, seed: "t", milestone: false, snapshot: true, ...opts });
    plans.push({ plan, prev: state, next });
    state = next; prevCommit = r.checkpoint;
  }
  return plans;
}

test("every range's plan reaches its checkpoint, finishes, and is deterministic", () => {
  const plans = planAll();
  for (const { plan, prev, next } of plans) {
    const played = replayPlan(prev, plan);
    assert.deepEqual(played.problems, []);
    assert.deepEqual(stateDiff(played.state, next), []);
    assert.ok(finishes(plan.agents, plan.steps));
    assert.ok(plan.agents.length > plan.lanes.length, "more agents than lanes");
  }
  assert.equal(JSON.stringify(planAll().map((p) => p.plan)), JSON.stringify(plans.map((p) => p.plan)), "same seed, same plan");
});

test("the merge's textual result is written by the reconcile step", () => {
  const plans = planAll();
  const files = plans.flatMap(({ plan }) => plan.consolidation.find((c) => c.op === "reconcile")?.files ?? []);
  assert.ok(files.some((f) => f.path === "packages/a/src/index.ts"), "merged index.ts reconciled");
});

test("symlinks and executables go through a Sandbox apply step", () => {
  const steps = planAll().flatMap(({ plan }) => plan.steps);
  for (const p of ["apps/web/link.ts", "apps/web/run.sh"]) {
    const s = steps.find((x) => x.files?.some((f) => f.path === p && f.op === "write"));
    assert.equal(s.kind, "apply", p);
  }
});

test("lanes never share a path, and planned conflicts are wired with barriers", () => {
  for (const { plan } of planAll()) {
    const owner = new Map();
    for (const s of plan.steps) for (const f of s.files || []) {
      assert.equal(owner.get(f.path) ?? s.lane, s.lane, f.path);
      owner.set(f.path, s.lane);
    }
    for (const c of plan.conflicts.filter((c) => c.kind === "commit-conflict")) {
      const byId = new Map(plan.steps.map((s) => [s.id, s]));
      const [x, mount, , commit, resolve] = c.steps.map((id) => byId.get(id));
      assert.ok(x.after.includes(mount.id), "A commits after B mounted");
      assert.ok(commit.after.includes(x.id), "B commits after A");
      assert.equal(commit.expect, "Conflict");
      assert.equal(resolve.expect, "UpToDate");
    }
  }
  assert.ok(planAll().some(({ plan }) => plan.conflicts.length), "some range plans a conflict");
});

test("summary and expectations count the plan", () => {
  const { plan } = planAll()[0];
  const s = summarize(plan), e = expectations(plan);
  assert.equal(s.steps, plan.steps.length);
  assert.equal(Object.values(e.branches).reduce((a, b) => a + b, 0) + e.main.merges + e.main.reconcile + e.main.install, s.lfsCommits);
  assert.ok(s.oneShotShare >= 0.7);
  assert.equal(area("a/b/c.ts"), "a/b"); assert.equal(area("a/b.ts"), "a"); assert.equal(area("x.md"), "/");
  const r = rng("x"); assert.equal(r(), rng("x")());
});

test("tree comparison finds missing, extra, content and mode differences", () => {
  const e = new Map([["a", { mode: "100644", blob: "1" }], ["b", { mode: "100755", blob: "2" }], ["c", { mode: "100644", blob: "3" }]]);
  const a = new Map([["a", { mode: "100644", blob: "1" }], ["b", { mode: "100644", blob: "2" }], ["d", { mode: "100644", blob: "4" }], [".lfs-probe/x", { mode: "100644", blob: "5" }]]);
  const r = compareTree(e, a);
  assert.deepEqual([r.missing, r.extra, r.content, r.mode, r.ok], [["c"], ["d"], [], ["b"], false]);
});

const metrics = (range, over = {}) => ({
  range, attempt: 1, depth: { before: range * 1000, after: (range + 1) * 1000 },
  checks: { tree: { ok: true }, history: { ok: true }, steps: { matched: 10, total: 10 }, conflicts: { planned: 3, hit: 3, unplanned: 0 }, ignored: { ok: true }, tests: { equal: 4, run: 4 } },
  health: { workspacesOpen: 0, overlaysLeft: 0, daemonRssMb: 200, openFiles: 50, walBytes: 1e6 },
  ops: [{ op: "fs.stat", sizeClass: "—", n: 50, p50: 2, p95: 4, p99: 5, max: 6, slowPhase: "sdk.read" }],
  probes: { "stat-small": { ms: 2, counters: { rows: 3 } } },
  storage: { directoryShare: 0.3, reinstallGrowth: 1.5, newStored: 100, changedBytes: 200, delta: { share: 0.4, atCap: 0.05, byBudget: 0.01 } },
  budget: { diskProjected: 10, diskBudget: 64, wallProjectedMs: 1, wallBudgetMs: 2 },
  ...over,
});

test("gates pass a healthy range and stop on a wrong tree or a leak", () => {
  const pilot = [0, 1, 2, 3, 4].map((i) => metrics(i));
  const base = buildBaseline(pilot);
  assert.equal(evaluate(metrics(5), pilot, base).verdict, "pass");
  assert.equal(evaluate(metrics(5, { checks: { ...metrics(5).checks, tree: { ok: false, missing: ["x"] } } }), pilot, base).verdict, "stop");
  assert.equal(evaluate(metrics(5, { health: { ...metrics(5).health, workspacesOpen: 1 } }), pilot, base).verdict, "stop");
});

test("speed acts only when the ratio is high and still rising", () => {
  const pilot = [0, 1, 2, 3, 4].map((i) => metrics(i));
  const base = buildBaseline(pilot);
  const slow = (r, p95) => metrics(r, { ops: [{ op: "fs.stat", sizeClass: "—", n: 50, p50: 2, p95, p99: p95, max: p95, slowPhase: "sdk.read" }] });
  assert.equal(evaluate(slow(5, 5.6), pilot, base).verdict, "watch", "1.4x");
  const hist = [...pilot, slow(5, 6.5), slow(6, 7), slow(7, 7.5)];
  assert.equal(evaluate(slow(8, 8), hist, base).verdict, "optimize", "2x and rising");
  assert.equal(evaluate(slow(8, 6.4), [...pilot, slow(5, 8), slow(6, 7), slow(7, 6.5)], base).verdict, "watch", "1.6x but falling");
});

test("a probe that grows with depth is a scaling finding even when fast", () => {
  const hist = [0, 1, 2, 3, 4, 5, 6].map((i) => metrics(i, { probes: { "list-small": { ms: 0.1 * (i + 1), counters: { rows: 10 * (i + 1) } } } }));
  const g = evaluate(metrics(7, { probes: { "list-small": { ms: 0.8, counters: { rows: 80 } } } }), hist, buildBaseline(hist.slice(0, 5)));
  assert.equal(g.verdict, "optimize");
  assert.equal(g.checks.find((c) => c.name === "Scaling").result, "optimize");
  assert.equal(g.checks.find((c) => c.name === "Counters").result, "optimize");
  assert.equal(exponent([[1, 5], [2, 5], [4, 5]]), 0);
  assert.equal(exponent([[1, 1], [2, 2], [4, 4]]), 1);
  assert.ok(rising([1, 2, 3, 4]) && !rising([1, 3, 2, 4]));
});

test("aggregate groups calls by operation and size class", () => {
  const rows = aggregate([
    { method: "fs.write", ms: 3, size: { kind: "bytes", n: 500 } }, { method: "fs.write", ms: 9, size: { kind: "bytes", n: 700 }, phases: { construct: 7 } },
    { method: "fs.write", ms: 20, size: { kind: "bytes", n: 100_000 } },
  ]);
  assert.deepEqual(rows.map((r) => [r.op, r.sizeClass, r.n]), [["fs.write", "≤1 KiB", 2], ["fs.write", "≤512 KiB", 1]]);
  assert.equal(rows[0].slowPhase, "construct");
  assert.equal(sizeClass("files", 3), "2–4");
});

test("the report keeps the lead's section and the index links each range", () => {
  const { plan } = planAll()[0];
  const m = metrics(0);
  const gates = [evaluate(m)];
  const lead = `${LEAD_START} (written by the lead)\n\n- found something\n\n`;
  const md = renderRange({ plan, summary: summarize(plan), attempts: [m], gates, lead });
  for (const h of ["## Attempts", "## 1. Checks", "## 2. Work", "## 3. Operation latency", "## 4. Scale probes", "## 5. Storage", "## 6. Trends", "## 8. Evidence"]) assert.ok(md.includes(h), h);
  assert.ok(md.includes("- found something"));
  assert.ok(renderIndex([{ range: 0, dshCommits: 10, depth: 5, verdict: "pass", worst: "—", newStored: 1024 }]).includes("[range-000](ranges/range-000.md)"));
});

test("the issue comment has a fixed shape and names what happens next", () => {
  const { plan } = planAll()[0];
  const m = metrics(0);
  const ok = renderComment({ plan, summary: summarize(plan), attempts: [m], gates: [evaluate(m)] });
  assert.ok(ok.startsWith("### Range 000 · **pass** · attempt 1"));
  for (const part of ["**Work:**", "**Slowest p95:**", "**Storage:**", "**Next:** Continues", "range-000.md)"]) assert.ok(ok.includes(part), part);
  const bad = { ...m, checks: { ...m.checks, tests: { equal: 3, run: 4 } } };
  const stop = renderComment({ plan, summary: summarize(plan), attempts: [bad], gates: [evaluate(bad)] });
  assert.ok(stop.includes("**stop**") && stop.includes("| Correctness |") && stop.includes("bug cycle"));
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok   ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n${e.stack}`); }
}
rmSync(dir, { recursive: true, force: true });
console.log(`${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
