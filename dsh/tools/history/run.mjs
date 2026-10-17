#!/usr/bin/env node
// The headless player of the history replay (#352 SPEC §2, §3, §7; SCRIPTS.md §1):
//   node dsh/tools/history/run.mjs new  --run <id> --phase p1 [--label measured|dev|control] [--policy default|control]
//   node dsh/tools/history/run.mjs play --run <id> --from N --to M [--mode measured|fast] [--serialize-commits 1 (dev/control runs only)]
//   node dsh/tools/history/run.mjs fork --run <new id> --from-run <id> --range N [--label …]
//   node dsh/tools/history/run.mjs cleanup --run <id>
//   node dsh/tools/history/run.mjs phase --run <id> --phase p2
// `phase` moves a run to the next phase (P1 → P2 …) at the range it stands
// at, keeping its pinned binaries and its Store; the move is recorded in the
// run's manifest (`phases`) and ledger. A dirty run cannot move.
// `new` makes the run's folder (~/lfs-history/runs/<id>/), its Docker volume
// layerfs-issue352-<id>, and its Store by Init of dsh's first commit; every
// container is named layerfs-issue352-<id>-<sandbox> (LAYERFS_CONTAINER_PREFIX).
// `play` plays ranges N..M back to back, continuing where the run stands
// (state.json). Before each range: the binary-vs-manifest check and the disk
// guard. Each range: its steps in the phase's player, the reconcile and the
// publish, the proof checkpoint (diff_commits against git's changed paths with
// blob ids and modes; the whole tree at snapshots), the unit tests when the
// phase has them, the scale probes, then the seal and snapshot when due, the
// metrics (range-NNN.aK.json) and report.mjs. Measured mode traces every call
// (LAYERFS_TRACE) with LAYERFS_CONSTRUCTION_WORKERS=1; fast mode (fast-forward
// after a fork) plays and checks the changed paths only: no trace, probes,
// tests, snapshots or metrics.
// P2 (agents.mjs) plays the plan's lanes as Branches and its agents as
// concurrent tasks ordered by the plan's barriers, with the lead's merges,
// race, reconcile and publish; every call is recorded (lib.mjs record) for
// the call table, size classes and the Overview (stats.mjs).
// The wall budget is read from ~/lfs-history/budget.json ({ wallBudgetMs,
// ranges, reason }); the projection is the mean tooling wall time of the
// phase's latest attempts (this one included) × `ranges` (SPEC §5).
// Exit codes: 0 the last range passed (or watch); 3 optimize; 4 stop (a gate,
// a step that differs from the plan, or a failed checkpoint); 5 the guard
// refused a range (disk, binary, missing calibration); 1 an error; 2 usage.
// It never commits, pushes or comments. It leaves the Store live, so the next
// `play --from M+1` continues; a stopped range leaves the run dirty, to be
// recovered by `fork` from a snapshot (SPEC §6).
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { blobSizes, diffTrees, lsTree } from "./git.mjs";
import { due, manifestPath, rebuild } from "./snapshot.mjs";
import { aggregate } from "./gates.mjs";
import { PLAN_VERSION } from "./plan.mjs";
import {
  binaries, closure, consolidate, HISTORY, Mismatch, probeFixture, probes, readTrace, REPO, Run,
  step, teardown, verify, writeJson,
} from "./lib.mjs";
import { addDelta, deltaSummary, diskGuard, EXIT, nextPhase, pad, PHASES, phaseOps, Tree } from "./steps.mjs";
import { consolidateLanes, playAgents, pool, startRange } from "./agents.mjs";
import { buildOverview, callTable } from "./stats.mjs";

const here = new URL(".", import.meta.url).pathname;
const IMAGE = "sha256:d3773b4eac6a7a644887b17e36956cd1553786d47103f0170a3bb2b0ff6988de";
const DAEMON = join(REPO, "core/target/cluster2-linux/release/layerfs-daemon");
/** SPEC §8's control arm: the old depths. */
export const POLICIES = { default: null, control: { smallFileThreshold: 131072, wholeFileDepth: 8, chunkDepth: 4 } };
/** The depth cap per role of a run's Store policy (the defaults of SPEC §8, or its override). */
export const caps = (policy) => ({ wholeFile: policy?.wholeFileDepth ?? 16, chunk: policy?.chunkDepth ?? 8, metadata: policy?.metadataDepth ?? 8 });
const RUN_ID = /^[a-z0-9][a-z0-9-]{0,40}$/;
const docker = (args) => execFileSync("docker", args, { encoding: "utf8" }).trim();

/** Where a run's folders go by its label: a measured run reports into the issue's docs; others keep theirs. */
export function outputs(label, dir) {
  return label === "measured"
    ? { metrics: join(HISTORY, "metrics"), docs: join(REPO, "core/docs/issues/352"), snapshots: join(HISTORY, "snapshots") }
    : { metrics: join(dir, "metrics"), docs: join(dir, "docs"), snapshots: join(dir, "snapshots") };
}

/** The wall budget (SPEC §5; decided at P1 close and recorded in budget.json), or null. */
export function loadBudget(file = join(HISTORY, "budget.json")) {
  if (!existsSync(file)) return null;
  const b = JSON.parse(readFileSync(file, "utf8"));
  return Number.isFinite(b.wallBudgetMs) && Number.isInteger(b.ranges) ? b : null;
}

/**
 * The projected wall time of the whole history (SPEC §5, lead decision at P1
 * close): the mean tooling wall time of the phase's latest attempts, this
 * one included (`own`), × the history's ranges.
 */
export function wallProjection(attempts, phase, own, ranges) {
  const latest = new Map();
  for (const a of attempts) if (a.phase === phase && a.range !== own.range && a.wall?.totalMs != null && (!latest.has(a.range) || latest.get(a.range).attempt < a.attempt)) latest.set(a.range, a);
  const walls = [...[...latest.values()].map((a) => a.wall.totalMs), own.totalMs];
  return { wallProjectedMs: Math.round((walls.reduce((n, x) => n + x, 0) / walls.length) * ranges), wallMeanOf: walls.length };
}

/** Metrics files of `dir`, as recorded. */
function readAttempts(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /^range-\d{3}\.a\d+\.json$/.test(f)).map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
}

/** The next attempt number of range k in `metrics`. */
export function nextAttempt(metrics, k) {
  if (!existsSync(metrics)) return 1;
  const re = new RegExp(`^range-${pad(k)}\\.a(\\d+)\\.json$`);
  return 1 + Math.max(0, ...readdirSync(metrics).map((f) => Number(re.exec(f)?.[1] ?? 0)));
}

function create({ id, phase, label, policy, image, daemon, source }) {
  if (!RUN_ID.test(id)) throw new Error(`run id ${id}: lowercase letters, digits and -`);
  if (!PHASES[phase]) throw new Error(`phase ${phase} has no player yet (built: ${Object.keys(PHASES).join(", ")})`);
  const dir = join(HISTORY, "runs", id);
  if (existsSync(dir)) throw new Error(`${dir} exists`);
  const volume = `layerfs-issue352-${id}`;
  const host = docker(["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"]);
  const env = {
    LAYERFS_HOME: join(dir, "home"), LAYERFS_DOCKER: host.replace(/^unix:\/\//, ""), LAYERFS_IMAGE: image, LAYERFS_VOLUME: volume,
    LAYERFS_DAEMON: daemon, LAYERFS_NATIVE: join(REPO, "sdk/js/native/layerfs.node"), LAYERFS_CONTAINER_PREFIX: `layerfs-issue352-${id}-`,
    LAYERFS_CONSTRUCTION_WORKERS: "1",
  };
  return { dir, volume, env, manifest: {
    run: id, phase, label, policyName: policy, policy: POLICIES[policy], project: "dsh", volume, env,
    repo: join(HISTORY, "dsh.git"), plan: join(HISTORY, "plan"), oracle: join(HISTORY, "oracle"),
    outputs: outputs(label, dir), created: new Date().toISOString(), source,
  } };
}

async function cmdNew(o) {
  const { dir, volume, env, manifest } = create({ id: o.run, phase: o.phase ?? "p1", label: o.label ?? "measured", policy: o.policy ?? "default", image: o.image ?? IMAGE, daemon: resolve(o.daemon ?? DAEMON) });
  const summary = JSON.parse(readFileSync(join(manifest.plan, "plan.json"), "utf8"));
  if (summary.version !== PLAN_VERSION) throw new Error(`the plan is v${summary.version}; regenerate it as v${PLAN_VERSION}`);
  manifest.binary = binaries(env);
  if (manifest.binary.image !== env.LAYERFS_IMAGE) throw new Error(`image ${env.LAYERFS_IMAGE} is not a local image id (${manifest.binary.image})`);
  manifest.planVersion = summary.version;
  mkdirSync(dir, { recursive: true });
  writeJson(join(dir, "run.json"), manifest);
  const run = new Run(dir);
  run.note({ kind: "folder", name: dir });
  docker(["volume", "create", volume]);
  run.note({ kind: "volume", name: volume });
  // the seed is dsh's Init commit's tree (SCRIPTS.md §8)
  const src = join(dir, "init-src");
  mkdirSync(src);
  execFileSync("sh", ["-c", `git --git-dir ${JSON.stringify(manifest.repo)} archive ${summary.init.commit} | tar -x -C ${JSON.stringify(src)}`]);
  Object.assign(process.env, env);
  const { LayerFS } = await import(join(REPO, "sdk/js/src/index.js"));
  const t0 = performance.now();
  const init = await new LayerFS(manifest.project, manifest.policy ? { storePolicy: manifest.policy } : {}).project.init(src);
  run.state = { next: 0, layer: init.layer, head: null, prevCommit: summary.init.commit, heads: {}, layers: { init: init.layer }, depth: { commits: 0, layers: 1, branches: 0 }, initMs: Math.round(performance.now() - t0), dirty: null, sinceMs: [], lastSnapshotMs: null, growth: [] };
  run.save();
  console.log(JSON.stringify({ run: o.run, dir, volume, layer: init.layer, initMs: run.state.initMs, binary: manifest.binary, outputs: manifest.outputs }, null, 1));
}

/** The binary-vs-manifest check: the run's daemon, addon and image are still the ones it was made with. */
function checkBinaries(run) {
  const now = binaries(run.manifest.env), was = run.manifest.binary;
  const differ = ["daemon", "sdk", "image"].filter((k) => now[k] !== was[k]);
  return differ.length ? `${differ.map((k) => `${k} ${now[k]} is not the manifest's ${was[k]}`).join("; ")}` : null;
}

function freeBytes(run) {
  const host = execFileSync("df", ["-k", HISTORY], { encoding: "utf8" }).trim().split("\n").at(-1).split(/\s+/);
  const vm = docker(["run", "--rm", "--network", "none", "-v", `${run.manifest.volume}:/v:ro`, "--entrypoint", "df", run.manifest.env.LAYERFS_IMAGE, "-k", "/v"]).split("\n").at(-1).split(/\s+/);
  return { hostFree: Number(host[3]) * 1024, dockerFree: Number(vm[3]) * 1024 };
}

/** Seals the Store for a snapshot: every Sandbox closed, then one WAL checkpoint (TRUNCATE) and close in the image. */
async function seal(run) {
  const t0 = performance.now();
  const problems = await teardown(run);
  if (problems.length) throw new Error(`seal: ${problems.join("; ")}`);
  run.lf = null;
  const v = run.manifest.volume, image = run.manifest.env.LAYERFS_IMAGE;
  const walBytes = Number(docker(["run", "--rm", "--network", "none", "-v", `${v}:/v:ro`, "--entrypoint", "sh", image, "-c", "stat -c %s /v/global/store.sqlite-wal 2>/dev/null || echo 0"]));
  // The daemons are gone; this is the only connection. Handles::seal does the same
  // checkpoint, but needs the catalog keys the runner does not hold.
  const out = docker(["run", "--rm", "--network", "none", "--user", "0", "-v", `${v}:/v`, "--entrypoint", "python3", image, "-c",
    "import sqlite3,os;c=sqlite3.connect('/v/global/store.sqlite');r=c.execute('pragma wal_checkpoint(TRUNCATE)').fetchone();p=c.execute('pragma page_size').fetchone()[0];c.close();w='/v/global/store.sqlite-wal';print(r[0],p,os.path.getsize(w) if os.path.exists(w) else 0)"]);
  const [busy, page, after] = out.split(" ").map(Number);
  if (busy !== 0 || after !== 0) throw new Error(`seal: checkpoint busy ${busy}, WAL ${after} bytes after`);
  if (page !== 4096) throw new Error(`seal: page size ${page}, not 4096`);
  return { walBytes, sealMs: Math.round(performance.now() - t0) };
}

function snapshot(run, k, facts) {
  const factsFile = join(run.dir, `facts-${pad(k)}.json`);
  writeJson(factsFile, facts);
  const dir = run.manifest.outputs.snapshots;
  mkdirSync(dir, { recursive: true });
  const r = spawnSync("node", [join(here, "snapshot.mjs"), "take", "--range", String(k), "--volume", run.manifest.volume, "--image", run.manifest.env.LAYERFS_IMAGE, "--dir", dir, "--facts", factsFile], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`snapshot: ${r.stderr.slice(0, 400)}`);
  const file = manifestPath(dir, k, run.manifest.run), m = JSON.parse(readFileSync(file, "utf8"));
  return { size: m.size, newBlocks: m.newBlocks, newBytes: m.newBytes, copyMs: m.copyMs, sealMs: facts.sealMs, walBytes: facts.walBytes, manifest: file };
}

/** Plays range k. Returns the exit code the range ends with (0 to go on). */
async function playRange(run, k, mode) {
  const phase = PHASES[run.manifest.phase], measured = mode === "measured";
  // Tooling wall time per stage (never operation latency: that is m.ops).
  const plan = run.plan(k), t0 = performance.now(), wall = {};
  const lap = (name, since) => { wall[name] = Math.round(performance.now() - since); };
  // prepare: binaries, disk, calibration
  const binaryProblem = checkBinaries(run);
  if (binaryProblem) { console.error(`range ${k} refused: ${binaryProblem}`); return EXIT.guard; }
  const free = freeBytes(run);
  const growth = Math.max(0, ...run.state.growth);
  const guard = diskGuard({ storeBytes: run.state.storeBytes ?? 0, growthBytes: growth, installPeak: phase.tests ? 3 * 2 ** 30 : 0, ...free, rangesLeft: 202 - k });
  if (!guard.ok) { console.error(`range ${k} refused: ${guard.why}`); return EXIT.guard; }
  if (phase.tests && measured && !existsSync(join(run.planDir, `tests-${pad(k)}.json`))) { console.error(`range ${k} refused: no tests-${pad(k)}.json; calibrate it first`); return EXIT.guard; }
  if (!run.lf) await run.client();
  const p2 = phase.lanes === "plan";
  if (p2) await pool(run, k, plan.agents.length);
  lap("prepareMs", t0);
  const outputs = run.manifest.outputs, attempt = measured ? nextAttempt(outputs.metrics, k) : 0;
  const traceFile = measured ? join(run.dir, "trace", `range-${pad(k)}.a${attempt}.jsonl`) : null;
  if (traceFile) mkdirSync(join(run.dir, "trace"), { recursive: true });
  run.traceTo(traceFile, `r${pad(k)}`);
  const m = { ...(run.serialize ? { devAid: "serialize-commits" } : {}), range: k, attempt, run: run.manifest.run, phase: run.manifest.phase, label: run.manifest.label, mode, started: new Date().toISOString(),
    binary: run.manifest.binary, plan: { version: run.manifest.planVersion, checkpoint: plan.checkpoint }, policy: run.manifest.policyName };
  const before = measured ? await run.op.store.stats() : null;
  const { ops, reconcile, left } = p2 ? { ops: [], reconcile: [], left: {} } : phaseOps(plan, run.manifest.phase);
  let branch = `r${pad(k)}-lane`;
  let ctx = p2 ? null : { ops, reconcile, branch, tree: new Tree(lsTree(run.repo, run.state.prevCommit).files), work: { fs: 0, sandbox: 0, commits: 0 }, measured };
  const depthBefore = run.state.depth.commits;
  let failure = null, published = null, proof = null, tests = null, probeOut = {};
  run.tally.calls = 0;
  run.sink.log.length = 0;
  try {
    let since = performance.now();
    if (p2) {
      if (!run.state.head) throw new Error("P2 continues a run whose first range wrote the probe fixture (a P1 run, or a fork of one)");
      ctx = await startRange(run, k, plan, measured, run.serialize);
      await playAgents(run, k, ctx);
      lap("playMs", since);
      since = performance.now();
      published = await consolidateLanes(run, k, plan, ctx);
      branch = ctx.final;
      ctx.tree = ctx.mainTree;
      lap("consolidateMs", since);
    } else {
      run.label(`r${pad(k)}.fork`);
      await run.lf.branch.fork(branch, "main");
      // The first range writes the probe fixture (ignored paths) first: its Commit
      // is the checkpoint check's base, since Init's Layer has no Commit.
      if (!run.state.head) {
        run.label(`r${pad(k)}.probe-fixture`);
        run.state.head = (await run.lf.fs.apply(branch, probeFixture(), "scale probe fixture (SPEC §3c)")).head;
        run.state.depth.commits++;
      }
      run.rec.agent = "a01";
      for (const op of ops) await step(run, k, op.id, ctx);
      run.rec.agent = "lead";
      lap("playMs", since);
      since = performance.now();
      await consolidate(run, k, "reconcile", ctx);
      published = await consolidate(run, k, "publish", ctx);
      lap("consolidateMs", since);
    }
    since = performance.now();
    const snapshotDue = measured && (phase.snapshot === "every" || due({ planned: plan.snapshot, verdict: "pass", sinceMs: run.state.sinceMs, lastCostMs: run.state.lastSnapshotMs }).due);
    proof = await verify(run, k, { prevHead: run.state.head, head: published.source.commit, layer: published.publishedLayer.id, prevCommit: run.state.prevCommit, full: snapshotDue });
    lap("verifyMs", since);
    wall.verify = snapshotDue ? "diff_commits + full compareTree" : "diff_commits";
    if (!proof.ok) failure = `the checkpoint differs from git: ${JSON.stringify({ paths: proof.paths, ids: proof.ids, tree: proof.tree && { missing: proof.tree.missing.slice(0, 5), extra: proof.tree.extra.slice(0, 5), content: proof.tree.content.slice(0, 5), mode: proof.tree.mode.slice(0, 5) } }).slice(0, 1500)}`;
    if (!failure && phase.tests && measured) { since = performance.now(); tests = await closure(run, k, "tests", { layer: published.publishedLayer.id }); lap("testsMs", since); }
    if (!failure && phase.probes && measured) { since = performance.now(); probeOut = await probes(run, k, { branch, tree: ctx.tree }); lap("probesMs", since); }
    m.snapshotDue = snapshotDue;
  } catch (error) {
    if (!(error instanceof Mismatch)) console.error(error.stack ?? error);
    failure = error instanceof Mismatch ? error.message : `error: ${error.message}`;
  }
  if (run.rec) run.rec.agent = "lead";
  run.traceTo(null, undefined);
  const head = published?.source?.commit ?? null, layer = published?.publishedLayer?.id ?? null;
  m.head = head; m.layer = layer; m.failure = failure;
  m.depth = { before: depthBefore, after: run.state.depth.commits + ctx.work.commits };
  if (!measured) {
    const stages = { kind: "tooling", totalMs: Math.round(performance.now() - t0), ...wall };
    writeJson(join(run.dir, "fast", `range-${pad(k)}.json`), { range: k, mode, head, failure, calls: run.tally.calls, wall: stages });
    console.log(`range ${k}: ${failure ? `STOP ${failure}` : "ok"} (${run.tally.calls} calls; tooling ${JSON.stringify(stages)})`);
    if (failure) { run.state.dirty = k; run.save(); return EXIT.stop; }
    advance(run, k, plan, head, layer, ctx, performance.now() - t0);
    return EXIT.done;
  }
  // measured: storage, metrics, snapshot, report
  let since = performance.now();
  const t = readTrace(traceFile, run.sink.log);
  const deltaTotal = addDelta(run.state.deltaTotal ?? null, t.delta);
  const after = await run.op.store.stats().catch(() => null);
  const snap = await run.op.inspect.snapshot().catch(() => null);
  const changes = diffTrees(run.repo, run.state.prevCommit, plan.checkpoint).filter((c) => !c.gitlink && c.mode !== "000000");
  const sizes = blobSizes(run.repo, changes.map((c) => c.blob));
  const newStored = after && before ? after.stored + after.metadata - before.stored - before.metadata : null;
  m.storage = after && {
    logical: after.logical, canonical: after.canonical, stored: after.stored, metadata: after.metadata, file: after.file, free: after.free,
    newStored, newMetadata: after.metadata - before.metadata, newPacks: after.stored - before.stored,
    changedBytes: changes.reduce((n, c) => n + (sizes.get(c.blob) ?? 0), 0),
    directoryShare: newStored > 0 ? +((after.metadata - before.metadata) / newStored).toFixed(3) : null,
    delta: deltaSummary(t.delta, caps(run.manifest.policy)),
    deltaTotal: deltaSummary(deltaTotal, caps(run.manifest.policy)),
    reinstallGrowth: null,
  };
  m.ops = aggregate(t.calls);
  // every call by method (SPEC §3b), and the checkpoint diff's cost per entry it lists (SPEC §4)
  m.calls = callTable(t.all, run.sink.log);
  const diffs = t.calls.filter((c) => c.method === "branch.diff_commits" && c.size?.n > 0);
  const median = (xs) => { const v = [...xs].sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : null; };
  m.perUnit = diffs.length ? { "branch.diff_commits": { unit: "entry", n: diffs.length, msPerEntry: +median(diffs.map((c) => c.ms / c.size.n)).toFixed(4), entries: median(diffs.map((c) => c.size.n)), ms: median(diffs.map((c) => c.ms)) } } : {};
  // the checkpoint tree the scoped probes read (gates.mjs SCOPED)
  const oracle = JSON.parse(readFileSync(join(run.manifest.oracle, `oracle-${pad(k)}.json`), "utf8"));
  m.inputs = { tree: { files: oracle.files, bytes: oracle.bytes } };
  m.probes = Object.fromEntries(Object.entries(probeOut).map(([name, p]) => [name, { ms: p.ms, ...(p.error ? { error: p.error } : {}), counters: t.probe[name] ?? {} }]));
  const open = snap?.sandboxes?.reduce((n, s) => n + (s.workspaces?.length ?? 0), 0) ?? null;
  m.health = { workspacesOpen: open, overlaysLeft: null };
  const mounts = run.sink.log.filter((e) => e.method === "sandbox.mount");
  const heldIds = new Set(p2 ? [...ctx.p2.held.keys()].filter((id) => /mount/.test(plan.steps.find((s) => s.id === id)?.kind ?? "")) : []);
  const held = mounts.filter((e) => heldIds.has(e.label)).length;
  const played = p2 ? ctx.played : new Map([["a01", { fs: ops.length, sandbox: 0, branch: 0, project: 0 }]]);
  const leadSteps = p2 ? ctx.leadSteps : [{ op: "reconcile", category: "fs" }, { op: "publish", category: "branch" }];
  const stepLane = new Map(plan.steps.map((s) => [s.id, s.lane]));
  m.work = { bashCalls: [...played.values()].reduce((n, by) => n + Object.values(by).reduce((x, y) => x + y, 0), 0) + leadSteps.length,
    lanes: p2 ? plan.lanes.length : 1, agents: p2 ? plan.agents.length : 1, lfsCommits: ctx.work.commits,
    workspaces: mounts.length, oneShot: mounts.length - held, longLived: held, oneShotShare: mounts.length ? +((mounts.length - held) / mounts.length).toFixed(3) : null,
    fileMutations: { fs: ctx.work.fs, sandbox: ctx.work.sandbox }, mutations: ctx.work.mutations ?? null,
    reads: p2 ? plan.steps.reduce((n, s) => n + (s.reads?.length ?? 0), 0) : ops.reduce((n, o) => n + o.reads.length, 0),
    reconcile: p2 ? ctx.p2.reconcile.length : reconcile.length, leftOut: p2 ? ctx.p2.left : left, sdkCalls: t.lines };
  m.overview = buildOverview({ plan: p2 ? plan : { ...plan, conflicts: [], lanes: [{ name: branch, agents: ["a01"] }], agents: ["a01"] }, log: run.sink.log, played, leadSteps,
    laneOf: (label) => (p2 ? stepLane.get(label) ?? null : String(label ?? "").startsWith(`r${pad(k)}.s`) ? branch : null),
    events: ctx.events ?? [], race: ctx.race ?? null, merged: ctx.merged ?? new Map(), tries: ctx.tries ?? new Map(), published: ctx.published ?? new Set(),
    lanesPlayed: p2 ? plan.lanes.map((l) => ({ name: l.name, agents: l.agents, steps: l.agents.reduce((n, a) => n + (ctx.steps.get(a) ?? 0), 0) })) : [{ name: branch, agents: ["a01"], steps: ops.length }],
    runningBefore: run.state.depth.commits, phase: run.manifest.phase });
  if (!p2) m.overview.planned = { branches: plan.lanes.length + 1, agents: plan.agents.length };
  const pathsOk = proof?.paths?.ok, idsOk = proof?.ids?.ok;
  m.checks = {
    tree: proof ? { ok: proof.ok, files: proof.tree?.files ?? proof.paths.git, missing: [...proof.paths.missing, ...proof.ids.missing, ...(proof.tree?.missing ?? [])], extra: [...proof.paths.extra, ...(proof.tree?.extra ?? [])],
      content: [...proof.ids.content, ...(proof.tree?.content ?? [])], mode: [...proof.ids.mode, ...(proof.tree?.mode ?? [])], paths: pathsOk, ids: idsOk, full: !!proof.tree } : { ok: false, files: 0, missing: [], extra: [], content: [], mode: [] },
    history: { ok: !!layer },
    steps: { matched: failure ? Math.max(run.tally.calls - 1, 0) : run.tally.calls, total: run.tally.calls },
    conflicts: { planned: p2 ? plan.conflicts.length : 0, hit: p2 ? m.overview.conflicts.reduce((n, c) => n + c.hit, 0) : 0, unplanned: 0,
      byKind: Object.fromEntries(m.overview.conflicts.map((c) => [c.kind, { hit: c.hit, planned: c.planned }])) },
    ignored: { ok: true },
    tests: tests ?? { equal: 0, run: 0 },
  };
  lap("metricsMs", since);
  m.budget = { diskProjected: guard.projected, diskBudget: free.dockerFree + (run.state.storeBytes ?? 0) };
  if (!failure && m.snapshotDue) {
    try {
      const sealed = await seal(run);
      wall.sealMs = sealed.sealMs;
      since = performance.now();
      m.snapshot = snapshot(run, k, { run: run.manifest.run, dsh: plan.checkpoint, tree: plan.tree, head, layer, depth: m.depth.after, daemon: run.manifest.binary.daemon,
        sdk: run.manifest.binary.sdk, planVersion: run.manifest.planVersion, policy: run.manifest.policy ?? "default", pageSize: 4096, ...sealed,
        state: { next: k + 1, layer, head, prevCommit: plan.checkpoint, depth: { ...run.state.depth, commits: m.depth.after }, deltaTotal } });
      lap("snapshotMs", since);
    } catch (error) { failure = `snapshot: ${error.message}`; m.failure = failure; m.checks.history.ok = false; }
  }
  m.wall = { kind: "tooling", totalMs: Math.round(performance.now() - t0), ...wall };
  const budget = loadBudget();
  if (budget) Object.assign(m.budget, { wallBudgetMs: budget.wallBudgetMs, ...wallProjection(readAttempts(outputs.metrics), m.phase, { range: k, totalMs: m.wall.totalMs }, budget.ranges) });
  const file = join(outputs.metrics, `range-${pad(k)}.a${attempt}.json`);
  writeJson(file, m);
  if (failure) { run.state.dirty = k; run.save(); }
  else { run.state.deltaTotal = deltaTotal; advance(run, k, plan, head, layer, ctx, m.wall.totalMs, m); }
  since = performance.now();
  // Only range k's report (SPEC §3 F2): it stores this attempt's gate result in its metrics file.
  const r = spawnSync("node", [join(here, "report.mjs"), "--metrics", outputs.metrics, "--plan", run.planDir, "--docs", outputs.docs, "--oracle", run.manifest.oracle, "--range", String(k)], { encoding: "utf8" });
  // The report's own time is known only after it ran: added to the metrics
  // file as report.mjs left it (with the stored gate result).
  const stored = JSON.parse(readFileSync(file, "utf8"));
  stored.wall = { ...m.wall, reportMs: Math.round(performance.now() - since), totalMs: Math.round(performance.now() - t0) };
  writeJson(file, stored);
  process.stdout.write(r.stdout); process.stderr.write(r.stderr);
  console.log(`range ${k} attempt ${attempt}: ${failure ? `STOP ${failure}` : "checkpoint ok"}; metrics ${file}`);
  if (failure) return EXIT.stop;
  return { 0: EXIT.done, 3: EXIT.optimize, 4: EXIT.stop }[r.status] ?? EXIT.error;
}

function advance(run, k, plan, head, layer, ctx, ms, m = null) {
  const s = run.state;
  s.next = k + 1; s.layer = layer; s.head = head; s.prevCommit = plan.checkpoint; s.heads[k] = head; s.layers[k] = layer;
  // Branches made in the range: forks and merges (every Merged makes one), probes and checks included
  const made = run.sink.log.filter((e) => (e.method === "branch.fork" && e.kind === "Forked") || (e.method === "branch.merge" && e.kind === "Merged")).length;
  s.depth = { commits: s.depth.commits + ctx.work.commits, layers: s.depth.layers + 1, branches: s.depth.branches + (made || 1) };
  if (m?.storage) { s.storeBytes = m.storage.file; s.growth = [...s.growth, m.storage.newStored ?? 0].slice(-20); }
  if (m?.snapshot) { s.sinceMs = []; s.lastSnapshotMs = (m.snapshot.sealMs ?? 0) + m.snapshot.copyMs; s.lastSnapshot = k; } else s.sinceMs = [...s.sinceMs, Math.round(ms)];
  s.dirty = null;
  run.save();
}

async function cmdPlay(o) {
  const run = new Run(join(HISTORY, "runs", o.run));
  const mode = o.mode ?? "measured", from = Number(o.from), to = Number(o.to);
  if (!["measured", "fast"].includes(mode) || !Number.isInteger(from) || !Number.isInteger(to) || to < from) return usage();
  if (run.state.dirty != null) { console.error(`run ${o.run} stopped in range ${run.state.dirty}; recover by fork from a snapshot (SPEC §6)`); return EXIT.guard; }
  if (from !== run.state.next) { console.error(`run ${o.run} stands at range ${run.state.next}, not ${from}`); return EXIT.usage; }
  if (mode === "measured") process.env.LAYERFS_CONSTRUCTION_WORKERS = "1";
  // A development aid only: one publishing call per lane at a time, to play past
  // concurrent same-Branch HeadMoved refusals while they are open. Never measured.
  if (o["serialize-commits"] != null) {
    if (run.manifest.label === "measured") { console.error("--serialize-commits is a development aid; a measured run never uses it"); return EXIT.usage; }
    run.serialize = true;
  }
  let code = EXIT.done;
  try {
    for (let k = from; k <= to && code === EXIT.done; k++) code = await playRange(run, k, mode);
  } catch (error) {
    console.error(error.stack ?? error);
    code = EXIT.error;
  } finally {
    const problems = await teardown(run);
    if (problems.length) console.error(`teardown: ${problems.join("; ")}`);
    run.close();
  }
  return code;
}

/** Moves a run to the next phase at the range it stands at; its binaries and Store stay (SPEC §9). */
function cmdPhase(o) {
  const dir = join(HISTORY, "runs", o.run), run = new Run(dir);
  const why = nextPhase(run.manifest.phase, o.phase);
  if (why) { console.error(`run ${o.run}: ${why}`); return EXIT.usage; }
  if (run.state?.dirty != null) { console.error(`run ${o.run} stopped in range ${run.state.dirty}; recover by fork first`); return EXIT.guard; }
  const entry = { from: run.manifest.phase, to: o.phase, atRange: run.state.next, at: new Date().toISOString(), binary: run.manifest.binary };
  run.manifest.phases = [...(run.manifest.phases ?? []), entry];
  run.manifest.phase = o.phase;
  writeJson(join(dir, "run.json"), run.manifest);
  run.note({ kind: "phase", name: `${entry.from}->${entry.to}`, atRange: entry.atRange });
  console.log(JSON.stringify({ run: o.run, ...entry }, null, 1));
  return EXIT.done;
}

/** A new run from run `from`'s snapshot of range N (SPEC §7, Forking): its file rebuilt into a new volume and home. */
async function cmdFork(o) {
  const source = new Run(join(HISTORY, "runs", o["from-run"]));
  const k = Number(o.range);
  const manifest = JSON.parse(readFileSync(manifestPath(source.manifest.outputs.snapshots, k, source.manifest.run), "utf8"));
  if (!manifest.state) throw new Error(`snapshot ${k} carries no runner state`);
  const { dir, volume, env, manifest: runManifest } = create({ id: o.run, phase: source.manifest.phase, label: o.label ?? "dev", policy: source.manifest.policyName, image: source.manifest.env.LAYERFS_IMAGE, daemon: source.manifest.env.LAYERFS_DAEMON, source: { run: source.manifest.run, range: k } });
  runManifest.binary = binaries(env);
  runManifest.planVersion = source.manifest.planVersion;
  mkdirSync(dir, { recursive: true });
  writeJson(join(dir, "run.json"), runManifest);
  const run = new Run(dir);
  run.note({ kind: "folder", name: dir });
  const restored = join(dir, "restore", "global", "store.sqlite");
  rebuild(manifest, join(source.manifest.outputs.snapshots, "blocks"), restored);
  docker(["volume", "create", volume]);
  run.note({ kind: "volume", name: volume });
  docker(["run", "--rm", "--network", "none", "--user", "0", "-v", `${volume}:/v`, "-v", `${join(dir, "restore")}:/src:ro`, "--entrypoint", "sh", env.LAYERFS_IMAGE, "-c",
    "mkdir -p /v/global && cp /src/global/store.sqlite /v/global/store.sqlite && chown -R 0:0 /v && chmod 755 /v && chmod 700 /v/global && chmod 600 /v/global/store.sqlite"]);
  // the project record: copied from the source run (same catalog binding); it says the Store is installed
  const record = join(source.manifest.env.LAYERFS_HOME, source.manifest.project, "project.record");
  mkdirSync(join(env.LAYERFS_HOME, runManifest.project), { recursive: true, mode: 0o700 });
  execFileSync("chmod", ["700", env.LAYERFS_HOME]);
  execFileSync("cp", ["-p", record, join(env.LAYERFS_HOME, runManifest.project, "project.record")]);
  run.state = { ...manifest.state, heads: {}, layers: {}, dirty: null, sinceMs: [], lastSnapshotMs: null, growth: [], storeBytes: manifest.size, probeFixture: true, forkedFrom: { run: source.manifest.run, range: k, sha256: manifest.sha256 } };
  run.save();
  // inspect.mjs reads the fork through this: its project, SDK, environment and rebuilt file
  writeJson(join(dir, "store.json"), { project: runManifest.project, sdk: join(REPO, "sdk/js/src/index.js"), env, file: restored, range: k, fork: o.run });
  console.log(JSON.stringify({ run: o.run, dir, volume, from: run.state.forkedFrom, next: run.state.next, store: join(dir, "store.json") }, null, 1));
}

/** Removes a run's resources by the literal names its ledger recorded. */
async function cmdCleanup(o) {
  const dir = join(HISTORY, "runs", o.run);
  const ledger = readFileSync(join(dir, "ledger.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const run = new Run(dir);
  await run.client();
  for (const id of existsSync(join(run.manifest.env.LAYERFS_HOME, "_sandboxes")) ? readdirSync(join(run.manifest.env.LAYERFS_HOME, "_sandboxes")) : []) {
    run.lf.sandboxes.add(id);
  }
  const problems = await teardown(run);
  for (const e of ledger.filter((x) => x.kind === "container" && !x.removed)) {
    if (docker(["ps", "-a", "--filter", `name=^${e.name}$`, "--format", "{{.Names}}"]) === e.name) { docker(["rm", "-f", e.name]); console.log(`removed container ${e.name}`); }
  }
  for (const e of ledger.filter((x) => x.kind === "volume" && !x.removed)) {
    try { docker(["volume", "rm", e.name]); console.log(`removed volume ${e.name}`); } catch (err) { problems.push(`volume ${e.name}: ${err.message.split("\n")[0]}`); }
  }
  run.close();
  const folder = ledger.find((x) => x.kind === "folder" && x.name === dir);
  if (folder && !problems.length) { rmSync(folder.name, { recursive: true, force: true }); console.log(`removed folder ${folder.name}`); }
  if (problems.length) { console.error(problems.join("\n")); return EXIT.error; }
  return EXIT.done;
}

function usage() {
  console.error("usage: run.mjs new|play|fork|cleanup|phase … (see the file's header)");
  return EXIT.usage;
}

export function options(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) o[argv[i].slice(2)] = argv[++i]; else o._.push(argv[i]);
  return o;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const o = options(rest);
  if (!o.run) process.exit(usage());
  const code = cmd === "new" ? (await cmdNew(o), EXIT.done) : cmd === "play" ? await cmdPlay(o) : cmd === "phase" ? cmdPhase(o) : cmd === "fork" ? (await cmdFork(o), EXIT.done) : cmd === "cleanup" ? await cmdCleanup(o) : usage();
  process.exit(code);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => { console.error(error.stack ?? error); process.exit(EXIT.error); });
}
