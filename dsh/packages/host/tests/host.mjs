// Host plugin checks without dsh, Docker or a Store:
//   node dsh/packages/host/tests/host.mjs
// dsh's appendPluginRecord is replaced by a stand-in that keeps each record
// on the fake Session; Sessions, the web server and Connection are fakes.
import assert from "node:assert/strict";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const STAND_IN = "export function appendPluginRecord(session, type, data) { session.records.push({ type, data }); }";
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, next) {
  if (specifier === "@deepseek-ai/dsh-session") return { url: ${JSON.stringify(`data:text/javascript,${encodeURIComponent(STAND_IN)}`)}, shortCircuit: true };
  return next(specifier, context);
}`)}`);
const { resolveConfig } = await import("../src/config.js");
const { BindingStore } = await import("../src/binding.js");
const { Collector } = await import("../src/collector.js");
const { contributor } = await import("../src/env.js");
const { registerRoutes } = await import("../src/route.js");
const { TreeReader } = await import("../src/trees.js");
const { removeProject } = await import("../src/remove.js");
const { prepareInit, scanSource, watching } = await import("../src/init.js");
const { InitJobs } = await import("../src/jobs.js");
const { CALL, PROJECT } = await import("@dsh-layerfs/model/sources/records.js");

const dir = mkdtempSync(join(tmpdir(), "dsh-layerfs-host-"));
const FOLDER = "/work/website";
const tick = () => new Promise((resolve) => setImmediate(resolve));

function session(id, cwd, parentSession) {
  return { header: parentSession ? { id, cwd, parentSession, origin: "subagent" } : { id, cwd }, records: [] };
}

function host() {
  const spec = resolveConfig({ image: "sha256:img", daemon: "/d/layerfs-daemon", home: join(dir, "home"), traceDir: join(dir, "traces") }, { dir: join(dir, "profile") });
  const live = new Map();
  const ctx = { sessions: { get: (id) => live.get(id) } };
  const bindings = new BindingStore(spec.stateDir);
  const collector = new Collector(ctx, spec, bindings);
  return { spec, live, ctx, bindings, collector, env: contributor(ctx, spec, bindings, collector) };
}

const trace = (id, method, phase, extra = {}) => JSON.stringify({ layerfs_trace: 1, id, step: "call_1", method, args: {}, start: "2026-10-16T00:00:00.000Z", phase, ...(phase === "end" ? { ms: 1, ok: true, daemon: { t: 1 }, scope: "x" } : {}), ...extra }) + "\n";

try {
  const h = host();
  const root = session("session-root", FOLDER), child = session("child-1", FOLDER, "session-root");
  h.live.set(root.header.id, root).set(child.header.id, child);

  // a session without a project gets no LayerFS environment
  assert.deepEqual(h.env.resolve({ agent: { session: root }, callId: "c0" }), {});
  assert.equal(h.bindings.session("session-root"), null);

  // the folder's only project is used, locked at the first bash call and recorded on the root
  h.bindings.addProject(FOLDER, { name: "website", source: FOLDER, volume: "dsh-layerfs-website-1", created: 1 });
  const vars = h.env.resolve({ agent: { session: child }, callId: "c1", rootCallId: "r1" });
  assert.equal(vars.DSH_LAYERFS_PROJECT, "website");
  assert.equal(vars.DSH_LAYERFS_VOLUME, "dsh-layerfs-website-1");
  assert.equal(vars.DSH_LAYERFS_IMAGE, "sha256:img");
  assert.match(vars.DSH_LAYERFS_OPERATOR, /^file:.*\/operator\/index\.js$/);
  assert.equal(vars.DSH_LAYERFS_TRACE_STEP, "r1");
  assert.equal(vars.DSH_LAYERFS_TRACE, join(h.spec.traceDir, "child-1.jsonl"));
  assert.ok(Object.keys(vars).every((key) => key in h.env.variables), "every value is a declared variable");
  assert.deepEqual(h.bindings.session("session-root"), { project: "website", locked: true, folder: FOLDER });
  assert.equal(h.bindings.choose("session-root", FOLDER, null), false, "a locked choice is refused");
  assert.deepEqual(root.records.map((r) => r.type), [PROJECT]);
  h.env.resolve({ agent: { session: root }, callId: "c2" });
  assert.equal(root.records.length, 1, "the project is recorded once");

  // the parent's catalog names the child; the child's files land in its own Session
  h.collector.observe(root, { type: "subagent/catalog", data: { childId: "child-1", label: " tester " } });
  assert.equal(h.collector.agentOf(child).name, "tester");
  assert.equal(h.collector.agentOf(root).name, "main");
  appendFileSync(vars.DSH_LAYERFS_TRACE, trace("a-1", "sandbox.create", "start"));
  h.collector.poll();
  assert.equal(h.collector.snapshot("session-root").running.length, 1);
  appendFileSync(vars.DSH_LAYERFS_TRACE, trace("a-1", "sandbox.create", "end", { sandbox: "sb_1" }) + trace("a-2", "sandbox.exec", "end").slice(0, 20));
  h.collector.poll();
  const snap = h.collector.snapshot("session-root");
  assert.deepEqual([snap.running.length, snap.lines.length, snap.lines[0].agent], [0, 1, "tester"]);
  assert.deepEqual(snap.agents, { "session-root": "main", "child-1": "tester" });
  assert.deepEqual(h.collector.sandboxesOf("session-root"), ["sb_1"]);
  const [record] = child.records;
  assert.equal(record.type, CALL);
  assert.deepEqual(record.data.agent, { id: "child-1", name: "tester" });
  assert.equal(record.data.project, "website");
  assert.ok(!("daemon" in record.data.line) && !("scope" in record.data.line), "telemetry stays out of records");

  // a partial line waits for its newline; a Session that is not live gets its records later
  h.live.delete("child-1");
  appendFileSync(vars.DSH_LAYERFS_TRACE, trace("a-2", "sandbox.exec", "end").slice(20));
  h.collector.afterEvent("child-1");
  await tick();
  assert.equal(child.records.length, 1);
  assert.equal(h.collector.snapshot("session-root").lines.length, 2);
  h.live.set("child-1", child);
  h.collector.observe(child, { type: "turn/start", data: {} });
  await tick();
  assert.deepEqual(child.records.map((r) => r.data.line.method), ["sandbox.create", "sandbox.exec"]);

  // a new Host loads earlier lines for the views without recording them again
  const again = host();
  again.live.set("child-1", child);
  assert.equal(again.collector.snapshot("session-root").lines.length, 2);
  again.collector.track({ id: "child-1", root: "session-root" }, { name: "website" });
  again.collector.poll();
  assert.equal(child.records.length, 2);
  assert.equal(JSON.parse(readFileSync(join(h.spec.stateDir, "bindings.json"), "utf8")).agents["child-1"].name, "tester");

  // finished lines outlive the temporary trace files through the journal
  rmSync(h.spec.traceDir, { recursive: true, force: true });
  assert.deepEqual(host().collector.snapshot("session-root").lines.map((l) => l.method), ["sandbox.create", "sandbox.exec"]);

  // saved trees: dependency folders stay closed, long files are cut, a tree is read once
  const REF = "a".repeat(64), reads = [], closed = [];
  const fakeFs = {
    async list(ref, dir) {
      const items = { "/": [{ path: "/node_modules", type: "dir", inode: 2 }, { path: "/src", type: "dir", inode: 3 }, { path: "/big.txt", type: "file", inode: 4 }], "/src": [{ path: "/src/a.js", type: "file", inode: 5 }, { path: "/src/link", type: "symlink", inode: 6 }] }[dir] ?? [];
      return { items, hasMore: false };
    },
    async read(ref, path, line) { reads.push(path); return path === "/big.txt" ? { text: "x".repeat(100_000), nextLine: line + 1 } : { text: "ok\n", nextLine: null }; },
  };
  const trees = new TreeReader(h.spec, async () => ({ layerfs: { fs: fakeFs, sandboxes: new Set(["sb_service"]), sandbox: { close: async (id) => closed.push(id) } } }));

  // the route answers only requests Connection accepts
  let handler;
  const routeCtx = { ...h.ctx, effect: (fn) => fn(), webServer: { register: (route) => { handler = route.handler; return () => {}; } }, connection: { requestRejection: (req) => (req.headers.cookie ? undefined : 401) } };
  const runs = [];
  const jobs = new InitJobs((prepared, report) => new Promise((resolve, reject) => runs.push({ prepared, report, resolve, reject })));
  registerRoutes(routeCtx, { spec: h.spec, bindings: h.bindings, collector: h.collector, trees, jobs });
  const call = async (method, url, body, cookie = "dsh=1") => {
    const res = { statusCode: 0, headers: {}, text: "", setHeader(k, v) { this.headers[k] = v; }, end(text = "") { this.text = text; } };
    const req = { method, url, headers: cookie ? { cookie } : {}, async *[Symbol.asyncIterator]() { if (body) yield Buffer.from(JSON.stringify(body)); } };
    await handler(req, res);
    return { status: res.statusCode, body: res.text ? JSON.parse(res.text) : null };
  };
  assert.equal((await call("GET", "/layerfs/status", null, null)).status, 401);
  assert.deepEqual((await call("GET", "/layerfs/status")).body.missing, []);
  assert.equal((await call("GET", `/layerfs/workspace?folder=${encodeURIComponent(FOLDER)}`)).body.lastUsed, "website");
  const view = await call("GET", "/layerfs/session/child-1");
  assert.deepEqual([view.status, view.body.root, view.body.project.name, view.body.lines.length], [200, "session-root", "website", 2]);
  assert.equal((await call("POST", "/layerfs/session/session-root/project", { project: null })).status, 409);
  const fresh = session("session-new", FOLDER);
  h.live.set(fresh.header.id, fresh);
  const chose = await call("POST", "/layerfs/session/session-new/project", { project: null });
  assert.deepEqual([chose.status, chose.body.project, chose.body.lines], [200, null, []]);
  h.live.clear(); // Sessions that are not loaded: the binding keeps the folder
  const cold = await call("GET", "/layerfs/session/child-1");
  assert.deepEqual([cold.body.root, cold.body.folder, cold.body.project.name, cold.body.agents["child-1"]], ["session-root", FOLDER, "website", "tester"]);
  assert.equal((await call("GET", "/layerfs/nope")).status, 404);
  assert.equal((await call("GET", "/layerfs/session/child-1/tree?ref=main")).status, 400);
  const tree = await call("GET", `/layerfs/session/child-1/tree?ref=${REF}`);
  assert.deepEqual(Object.keys(tree.body.tree).sort(), ["/big.txt", "/node_modules", "/src", "/src/a.js", "/src/link"]);
  assert.match(tree.body.tree["/big.txt"].content, /\[cut at 128 KB\]\n$/);
  assert.equal(tree.body.tree["/src/link"].content, "→ symlink");
  assert.match(tree.body.partial, /node_modules folders are not opened.*over 128 KB/);
  const count = reads.length;
  await call("GET", `/layerfs/session/child-1/tree?ref=${REF}`);
  assert.equal(reads.length, count, "a saved tree is read once");
  await trees.dispose();
  assert.deepEqual(closed, ["sb_service"]);

  // state reads go through the same per-project client: one service Sandbox start, not one per read
  let opened = 0;
  const empty = { project: "p", branches: [], commits: [], layers: [], sandboxes: [], store: {} };
  const shared = new TreeReader(h.spec, async () => { opened++; return { layerfs: { fs: fakeFs, sandboxes: new Set(), sandbox: { close: async () => {} } }, operator: { inspect: { snapshot: async () => empty } } }; });
  const P = { name: "p" };
  const [stateA, stateB] = await Promise.all([shared.state(P, []), shared.state(P, []), shared.read(P, REF)]);
  assert.deepEqual([opened, typeof stateA.s, typeof stateB.labels], [1, "object", "object"]);
  await shared.dispose();

  // storage: Store totals and Init apart; every Branch's Commits once, newest first; main lists none
  const C = (id, time) => ({ id, time, message: id, via: "fs", logical: 10, newCanonical: 5, newStored: 3, newMetadata: 1 });
  const commitsOf = { feature: [C("c2", 2), C("c1", 1)], fix: [C("c3", 3), C("c1", 1)] };
  const listed = [];
  const stores = new TreeReader(h.spec, async () => ({
    layerfs: {
      sandboxes: new Set(), sandbox: { close: async () => {} },
      project: { list_branches: async () => ({ items: ["main", "feature", "fix"].map((name) => ({ name })), hasMore: false }) },
      branch: { list_commits: async (b) => (listed.push(b), { items: commitsOf[b], hasMore: false }) },
    },
    operator: { store: { stats: async () => ({ file: 4096, logical: 30, init: { entries: 3 } }) } },
  }));
  const storage = await stores.storage(P);
  assert.deepEqual([storage.store, storage.init, storage.commits.map((c) => c.id), storage.branches, storage.partial, listed], [{ file: 4096, logical: 30 }, { entries: 3 }, ["c3", "c2", "c1"], 2, false, ["feature", "fix"]]);
  await stores.dispose();

  // projects: listed with their folder; attach moves one, detach keeps sessions on it
  const OTHER = "/work/other";
  assert.deepEqual((await call("GET", "/layerfs/projects")).body.projects.map((p) => [p.name, p.folder]), [["website", FOLDER]]);
  assert.equal((await call("POST", "/layerfs/project/website/attach", { folder: OTHER })).body.project.folder, OTHER);
  assert.deepEqual([h.bindings.workspace(FOLDER).projects, h.bindings.workspace(OTHER).lastUsed], [[], "website"]);
  assert.equal((await call("POST", "/layerfs/project/website/attach", { folder: null })).body.project.folder, null);
  assert.equal(h.bindings.projectFor("session-root", FOLDER).name, "website", "a locked session keeps its detached project");
  assert.equal(h.bindings.projectFor("session-other", FOLDER), null);
  assert.equal((await call("POST", "/layerfs/project/website/attach", { folder: 3 })).status, 400);
  assert.equal((await call("POST", "/layerfs/project/nope/attach", { folder: null })).status, 404);
  assert.equal((await call("GET", "/layerfs/project/nope/storage")).status, 404);
  await call("POST", "/layerfs/project/website/attach", { folder: FOLDER });

  // Init: the source is counted first; the route answers a job, and the job its steps
  const src = join(dir, "src-folder");
  mkdirSync(join(src, "lib"), { recursive: true });
  writeFileSync(join(src, "a.txt"), "hello");
  writeFileSync(join(src, "lib", "b.txt"), "abc");
  const seen = [];
  assert.deepEqual(await scanSource(src, (c) => seen.push(c.entries)), { entries: 4, files: 2, bytes: 8 });
  assert.equal(seen.at(-1), 4);
  const started = await call("POST", "/layerfs/init", { folder: dir, source: src });
  assert.deepEqual([started.status, started.body.job.name, started.body.job.step], [202, "src-folder", "scan"]);
  const second = await call("POST", "/layerfs/init", { folder: dir, source: src });
  assert.equal(second.body.job.name, "src-folder-2", "a running Init keeps its name");
  assert.equal((await call("POST", "/layerfs/init", { folder: "relative" })).status, 409);
  const job = (id) => call("GET", `/layerfs/init/${id}`).then((r) => r.body.job);
  runs[0].report({ step: "import", totals: { entries: 4, files: 2, bytes: 8 } });
  assert.deepEqual([(await job(started.body.job.id)).step, (await job(started.body.job.id)).totals.files], ["import", 2]);
  runs[0].resolve({ name: "src-folder" });
  runs[1].reject(Object.assign(new Error("no Docker"), { code: "docker" }));
  await tick();
  assert.deepEqual([(await job(started.body.job.id)).step, (await job(started.body.job.id)).project.name], ["done", "src-folder"]);
  assert.deepEqual((await job(second.body.job.id)).error, { code: "docker", message: "no Docker" });
  runs[1].report({ step: "import" });
  assert.equal((await job(second.body.job.id)).step, "failed", "an ended job takes no more reports");
  assert.equal((await call("GET", "/layerfs/init/nope")).status, 404);
  // LayerFS's counts are read while its Init runs; a failed read stops only the counts
  const later = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
  let progressReads = 0;
  const counted = [], counting = { operator: { project: { progress: async () => ({ step: "files", entries: 3, files: ++progressReads, bytes: 10 }) } } };
  assert.equal(await watching(counting, (f) => counted.push(f.imported), () => later(600, "sealed")), "sealed");
  assert.ok(counted.length >= 2 && counted.every((c) => c.step === "files"), "counts while Init runs");
  const after = progressReads;
  await later(300);
  assert.equal(progressReads, after, "no reads after Init ends");
  const broken = { operator: { project: { progress: async () => { throw new Error("no binding"); } } } };
  assert.equal(await watching(broken, () => assert.fail("no counts"), () => later(300, "sealed")), "sealed");

  // who made each node: every journaled session's lines of that project
  const journal = (line) => appendFileSync(join(h.spec.stateDir, "lines", "session-root.jsonl"), JSON.stringify({ agentId: "child-1", agent: "tester", project: "website", ok: true, start: "2026-10-16T00:00:01.000Z", ms: 5, ...line }) + "\n");
  journal({ id: "x-1", method: "fs.write", kind: "Committed", commit: "c".repeat(64) });
  journal({ id: "x-2", method: "branch.publish", kind: "Added", commit: "c".repeat(64), layer: "l".repeat(66) });
  journal({ id: "x-3", method: "branch.fork", kind: "Forked", branch: "feature" });
  const known = h.collector.nodesOf("website"), at = Date.parse("2026-10-16T00:00:01.005Z");
  assert.deepEqual(known.authors, { ["c".repeat(64)]: "tester", ["l".repeat(66)]: "tester" });
  assert.deepEqual([known.times, known.forks], [{ ["l".repeat(66)]: at }, { feature: at }]);
  assert.deepEqual(h.collector.nodesOf("other"), { authors: {}, times: {}, forks: {} });

  // a version 1 file is read as version 2
  const old = join(dir, "v1");
  mkdirSync(old);
  writeFileSync(join(old, "bindings.json"), JSON.stringify({ version: 1, workspaces: { [FOLDER]: { projects: [{ name: "a", source: FOLDER, volume: "v", created: 1 }], lastUsed: "a" } }, sessions: {}, agents: {} }));
  const upgraded = new BindingStore(old);
  assert.deepEqual([upgraded.data.version, upgraded.byName("a").folder, upgraded.workspace(FOLDER).lastUsed], [2, FOLDER, "a"]);

  // removal: confirmed by name, refused while a running container uses the volume; stopped ones go with it, then volume, home entry and binding
  assert.equal((await call("POST", "/layerfs/project/website/remove", { confirm: "web" })).status, 400);
  const ran = [], dockerWith = (users) => async (file, args) => { ran.push(args.slice(2).join(" ")); return { stdout: args[2] === "ps" ? users : "" }; };
  const forgot = [], fakeTrees = { forget: async (name) => { forgot.push(name); } };
  mkdirSync(join(h.spec.home, "website"), { recursive: true });
  await assert.rejects(removeProject(h.spec, h.bindings, fakeTrees, "website", dockerWith("abc running\nold exited\n")), { code: "busy" });
  assert.deepEqual([ran, h.bindings.byName("website") !== null], [["ps -a --filter volume=dsh-layerfs-website-1 --format {{.ID}} {{.State}}"], true]);
  ran.length = 0;
  assert.deepEqual(await removeProject(h.spec, h.bindings, fakeTrees, "website", dockerWith("old exited\nnew created\n")), { removed: "website", volume: "dsh-layerfs-website-1" });
  assert.deepEqual(ran, ["ps -a --filter volume=dsh-layerfs-website-1 --format {{.ID}} {{.State}}", "rm old new", "volume rm dsh-layerfs-website-1"]);
  assert.deepEqual(forgot, ["website", "website"]);
  mkdirSync(join(dir, "website"), { recursive: true });
  assert.equal(prepareInit(h.spec, h.bindings, { folder: dir, source: join(dir, "website") }).project.name, "website", "a removed name is free again at once");
  assert.equal(prepareInit(h.spec, h.bindings, { folder: dir, name: "website" }).project.name, "website");
  assert.equal(existsSync(join(h.spec.home, "website")), false);
  assert.deepEqual([h.bindings.byName("website"), h.bindings.workspace(FOLDER).lastUsed, h.bindings.session("session-root").project], [null, null, null]);
  assert.equal(h.bindings.projectFor("session-root", FOLDER), null, "a session on a removed project has none");
  await assert.rejects(removeProject(h.spec, h.bindings, fakeTrees, "website", dockerWith("")), { code: "not-found" });
  // a demo's Replay asks to stop the running Sandboxes instead of refusing
  h.bindings.addProject(FOLDER, { name: "website", source: FOLDER, volume: "dsh-layerfs-website-2", created: 2 });
  ran.length = 0;
  // its Sandbox records go too: the service Sandbox's (an empty claim, as a stopped call leaves it) and each naming its volume
  const records = join(h.spec.home, "_sandboxes");
  for (const [entry, volume] of [["_service.website", null], ["website-a", "dsh-layerfs-website-2"], ["other-b", "dsh-layerfs-other-1"]]) {
    mkdirSync(join(records, entry), { recursive: true });
    if (volume) writeFileSync(join(records, entry, "sandbox.record"), Buffer.concat([Buffer.from("LFSA\u0002\u0000volume\u0004"), Buffer.from(volume)]));
  }
  assert.deepEqual(await removeProject(h.spec, h.bindings, fakeTrees, "website", dockerWith("abc running\nold exited\n"), { stopSandboxes: true }), { removed: "website", volume: "dsh-layerfs-website-2" });
  assert.deepEqual(ran, ["ps -a --filter volume=dsh-layerfs-website-2 --format {{.ID}} {{.State}}", "rm -f abc old", "volume rm dsh-layerfs-website-2"]);
  assert.deepEqual(readdirSync(records), ["other-b"], "another project's Sandbox record stays");
  console.log("host: ok");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
