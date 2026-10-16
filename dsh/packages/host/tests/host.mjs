// Host plugin checks without dsh, Docker or a Store:
//   node dsh/packages/host/tests/host.mjs
// dsh's appendPluginRecord is replaced by a stand-in that keeps each record
// on the fake Session; Sessions, the web server and Connection are fakes.
import assert from "node:assert/strict";
import { appendFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
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
  registerRoutes(routeCtx, { spec: h.spec, bindings: h.bindings, collector: h.collector, trees });
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
  console.log("host: ok");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
