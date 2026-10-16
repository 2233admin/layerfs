// Trace collection: each agent's bash calls append SDK trace lines to that
// agent's own file. The collector reads new lines as they arrive, keeps them
// per root session for the views, and writes each finished call to the
// calling agent's session as a plugin:layerfs/call record.
import { closeSync, existsSync, openSync, readSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { appendCall } from "./records.js";

const MAX_CHUNK = 1 << 20;

export class Collector {
  /**
   * @param {object} ctx plugin context (ctx.sessions)
   * @param {object} spec resolved Host settings
   * @param {import("./binding.js").BindingStore} bindings
   */
  constructor(ctx, spec, bindings) {
    this.ctx = ctx;
    this.spec = spec;
    this.bindings = bindings;
    /** sessionId -> { file, offset, rest, project } */
    this.tails = new Map();
    /** rootId -> { lines: [], running: Map<id, line>, loaded } */
    this.roots = new Map();
    /** sessionId -> label from its subagent descriptor */
    this.labels = new Map();
    /** sessionId -> records waiting for the Session to be live again */
    this.pending = new Map();
    /** sessions whose files are read on the next turn of the event loop */
    this.soon = new Set();
  }

  /** The agent a Session belongs to: its id, root session, display name and folder. */
  agentOf(session) {
    const id = session.header.id;
    let root = session, guard = 0;
    while (root.header.origin === "subagent" && root.header.parentSession && guard++ < 16) {
      const parent = this.ctx.sessions.get(root.header.parentSession);
      if (!parent) break;
      root = parent;
    }
    const rootId = root === session && session.header.origin === "subagent" ? this.bindings.agent(id)?.root ?? id : root.header.id;
    const name = id === rootId ? "main" : this.labels.get(id) ?? this.bindings.agent(id)?.name ?? `agent-${String(id).slice(-4)}`;
    this.bindings.setAgent(id, rootId, name);
    return { id, root: rootId, name, cwd: root.header.cwd };
  }

  /**
   * Observes committed Session events. A parent's subagent/catalog entry names
   * its child; the child's own descriptor is written before its Session is
   * attached, so it is seen only when a later descriptor replaces it.
   */
  observe(session, event) {
    this.afterEvent(session.header.id);
    const data = event.data;
    if (!data || typeof data.label !== "string") return;
    const id = event.type === "subagent/catalog" ? data.childId : event.type === "subagent/descriptor" ? session.header.id : undefined;
    const label = data.label.trim().slice(0, 40);
    if (typeof id !== "string" || !label) return;
    this.labels.set(id, label);
    const known = this.bindings.agent(id);
    if (known) this.bindings.setAgent(id, known.root, label);
  }

  /** Starts following an agent's trace file and returns its path. */
  track(agent, project) {
    const file = join(this.spec.traceDir, `${agent.id}.jsonl`);
    if (!this.tails.has(agent.id)) {
      // lines already in the file were collected before this Host started
      const offset = existsSync(file) ? statSync(file).size : 0;
      this.tails.set(agent.id, { file, offset, rest: "", project: project.name });
      this.load(agent.root);
    } else this.tails.get(agent.id).project = project.name;
    return file;
  }

  /**
   * A traced agent's Session moved (a tool result, a turn ending): its last
   * lines are read and recorded before the Session may go idle. Records are
   * appended after the observer returns, since a Session refuses an append
   * while it publishes one.
   */
  afterEvent(sessionId) {
    if (!this.tails.has(sessionId) && !this.pending.has(sessionId)) return;
    if (this.soon.size === 0) setImmediate(() => {
      const ids = [...this.soon];
      this.soon.clear();
      try { this.poll(ids); } catch (error) { this.ctx.logger?.warn?.(`layerfs: trace collection failed: ${error.message}`); }
    });
    this.soon.add(sessionId);
  }

  /** Reads new bytes of the followed files (all of them by default). */
  poll(ids = [...this.tails.keys()]) {
    for (const sessionId of ids) {
      this.flush(sessionId);
      const tail = this.tails.get(sessionId);
      if (!tail || !existsSync(tail.file)) continue;
      const size = statSync(tail.file).size;
      if (size < tail.offset) { tail.offset = 0; tail.rest = ""; }
      while (tail.offset < size) {
        const length = Math.min(MAX_CHUNK, size - tail.offset), buffer = Buffer.alloc(length), fd = openSync(tail.file, "r");
        try { readSync(fd, buffer, 0, length, tail.offset); } finally { closeSync(fd); }
        tail.offset += length;
        const text = tail.rest + buffer.toString("utf8"), parts = text.split("\n");
        tail.rest = parts.pop();
        for (const raw of parts) this.take(sessionId, tail.project, raw, true);
      }
    }
  }

  /** One trace line from an agent's file. */
  take(sessionId, project, raw, live) {
    let line;
    try { line = JSON.parse(raw); } catch { return; }
    if (!line || line.layerfs_trace !== 1) return;
    const agent = this.bindings.agent(sessionId) ?? { root: sessionId, name: "main" };
    const view = this.view(agent.root);
    const own = { ...stripped(line), agent: agent.name, agentId: sessionId, project };
    if (line.phase === "start") { view.running.set(line.id, own); return; }
    view.running.delete(line.id);
    view.lines.push(own);
    if (!live) return;
    const record = { agent: { id: sessionId, name: agent.name }, project, line: stripped(line) };
    if (!this.pending.has(sessionId)) this.pending.set(sessionId, []);
    this.pending.get(sessionId).push(record);
    this.flush(sessionId);
  }

  /** Appends an agent's waiting records once its Session is live. */
  flush(sessionId) {
    const records = this.pending.get(sessionId), session = records && this.ctx.sessions.get(sessionId);
    if (!session) return;
    this.pending.delete(sessionId);
    for (const record of records) appendCall(session, record);
  }

  view(rootId) {
    if (!this.roots.has(rootId)) this.roots.set(rootId, { lines: [], running: new Map(), loaded: false });
    return this.roots.get(rootId);
  }

  /** Loads the lines a root session's agents wrote before this Host started. */
  load(rootId) {
    const view = this.view(rootId);
    if (view.loaded) return view;
    view.loaded = true;
    if (!existsSync(this.spec.traceDir)) return view;
    for (const entry of readdirSync(this.spec.traceDir)) {
      if (!entry.endsWith(".jsonl")) continue;
      const sessionId = entry.slice(0, -6), agent = this.bindings.agent(sessionId);
      if (!agent || agent.root !== rootId) continue;
      const file = join(this.spec.traceDir, entry), tail = this.tails.get(sessionId);
      const end = tail ? tail.offset : statSync(file).size, fd = openSync(file, "r"), buffer = Buffer.alloc(end);
      try { readSync(fd, buffer, 0, end, 0); } finally { closeSync(fd); }
      for (const raw of buffer.toString("utf8").split("\n")) this.take(sessionId, tail ? tail.project : null, raw, false);
    }
    view.lines.sort((x, y) => Date.parse(x.start) - Date.parse(y.start));
    return view;
  }

  /** What the views need for one root session. */
  snapshot(rootId) {
    const view = this.load(rootId);
    return { lines: view.lines, running: [...view.running.values()], agents: this.bindings.agentsOf(rootId) };
  }

  /** Real Sandbox ids the root session's agents created. */
  sandboxesOf(rootId) {
    return [...new Set(this.load(rootId).lines.filter((l) => l.method === "sandbox.create" && l.ok).map((l) => l.sandbox))];
  }

  /** Polls on an interval until the returned disposer runs. */
  start() {
    const timer = setInterval(() => {
      try { this.poll(); } catch (error) { this.ctx.logger?.warn?.(`layerfs: trace collection failed: ${error.message}`); }
    }, this.spec.pollMs);
    timer.unref?.();
    return () => { clearInterval(timer); this.poll(); };
  }
}

/** A line as records and views keep it: no daemon telemetry or observation scope. */
function stripped(line) {
  const { daemon, scope, ...rest } = line;
  return rest;
}
