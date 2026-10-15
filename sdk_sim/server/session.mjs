// One live project for the UI: a fresh Docker volume and an Init of the
// offline fixture, the JS SDK client that owns its Sandboxes, and the mirror.
// `call(name, args)` takes the simulator's call names (model.js OPS) and
// returns the simulator's outcome envelope { ok, code, result | refusal },
// so terminal.js reads both backends the same way. Each call is attempted
// once; a refusal is returned as it came.
import { setup, teardown } from "../../sdk/js/test/verify/lib.mjs";
import { Executor } from "./executor.mjs";
import { Mirror } from "./mirror.mjs";

const fail = (code, message, detail = {}) => Object.assign(new Error(`${code}: ${message}`), { code, detail });
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
// Commit attribution is at most 128 bytes with no control character
// (MAXIMUM_ATTRIBUTION_BYTES); a longer call line is shortened with an ellipsis.
const ATTRIBUTION_BYTES = 128;
const attribution = (text) => {
  if (text === undefined || text === null) return undefined;
  let out = String(text).replace(/\p{Cc}/gu, " ");
  if (Buffer.byteLength(out) <= ATTRIBUTION_BYTES) return out;
  while (Buffer.byteLength(out) > ATTRIBUTION_BYTES - 3) out = [...out].slice(0, -1).join("");
  return out + "\u2026";
};

export class Session {
  /** `project` names the project: the addon keeps every name a process has
   *  initialized (there is no project close), so each reset takes a new one. */
  static async open(project = "website") {
    const session = new Session(await setup("ui", { project }));
    try {
      await session.layerfs.project.init(session.ctx.source, { name: project });
      await session.refresh();
    } catch (error) {
      await session.close();
      throw error;
    }
    return session;
  }

  constructor(ctx) {
    this.ctx = ctx;
    this.layerfs = ctx.layerfs;
    this.operator = ctx.operator;
    this.m = new Mirror();
    this.executor = new Executor(this.layerfs, this.operator);
    this.boxes = {};
    this.trees = {};
  }

  async close() {
    return teardown(this.ctx);
  }

  state() {
    return { version: this.m.version, s: { ...this.m.s, roots: {} } };
  }

  async refresh() {
    const snap = await this.operator.inspect.snapshot();
    const boxes = [];
    for (const box of Object.values(this.boxes)) {
      if (box.watch && !box.closed) {
        box.processes = await this.executor.list(box);
        box.watch = box.processes.some((p) => p.status === "running");
      }
      boxes.push(box);
    }
    this.m.absorb(snap, boxes);
  }

  box(label) {
    const box = this.boxes[label];
    if (!box) throw fail("NoSuchSandbox", `no Sandbox ${label} owned by this server`, { sandbox: label });
    if (box.closed) throw fail("SandboxClosed", `${label} is closed`, { sandbox: label });
    return box;
  }
  /** Read options for a ref: a Branch, "main", or a C#/L# node. */
  at(ref, commit) {
    if (commit) return { commit: this.m.real(commit) };
    if (ref === "main") return { commit: this.m.real(this.m.s.main.head) };
    if (/^[CL]\d+$/.test(ref)) return { commit: this.m.real(ref) };
    return { branch: ref };
  }
  rootOf(name) {
    const b = this.m.s.branches[name];
    return b.head ? this.m.s.commits[b.head].root : this.m.s.layers[b.base].root;
  }

  async call(name, args = {}) {
    const op = OPS[name];
    if (!op) return { ok: false, code: "Unsupported", refusal: { code: "Unsupported", message: `unknown call ${name}` } };
    // Diagnostic timing (not a measurement): the SDK call, then the refresh
    // of the mirror. The browser adds its HTTP round trip.
    let after, sdkMs;
    const started = performance.now();
    try {
      after = await op.call(this, args);
      sdkMs = performance.now() - started;
    } catch (error) {
      if (!error || !error.code) throw error;
      sdkMs = performance.now() - started;
      this.onRefusal(name, args, error.code, error.detail || {});
      const refreshed = performance.now();
      await this.refresh();
      const timing = { sdkMs, refreshMs: performance.now() - refreshed };
      const detail = this.m.ids(error.detail || {});
      const message = this.m.text(String(error.message).replace(`${error.code}: `, ""));
      return { ok: false, code: error.code, refusal: { code: error.code, message, ...detail }, timing };
    }
    const refreshed = performance.now();
    await this.refresh();
    const timing = { sdkMs, refreshMs: performance.now() - refreshed };
    const result = after();
    return { ok: true, code: result.kind || "ok", result, timing };
  }

  onRefusal(name, args, code, detail) {
    if (name !== "sandbox.commit" || code !== "Conflict") return;
    const ws = this.boxes[args.sandbox] && this.boxes[args.sandbox].workspaces[args.path];
    if (ws) ws.markers = (detail.conflicts || []).map((c) => c.path);
  }

  /** Every entry of a saved root, files with their text, for the Files pane. */
  async tree(root) {
    if (this.trees[root]) return this.trees[root];
    const owner = [...Object.values(this.m.s.commits), ...Object.values(this.m.s.layers)].find((n) => n.root === root);
    if (!owner) throw fail("NoSuchRoot", `${root} is not a saved root the mirror knows`);
    const commit = this.m.real(owner.id), tree = {}, dirs = ["/"];
    while (dirs.length) {
      const dir = dirs.shift();
      let cursor;
      do {
        const page = await this.layerfs.fs.list(dir, { commit, cursor });
        for (const item of page.items) {
          if (item.type === "dir") { tree[item.path] = { type: "dir", inode: item.inode }; dirs.push(item.path); continue; }
          tree[item.path] = { type: "file", inode: item.inode, content: item.type === "file" ? await this.text(item.path, commit) : `→ ${item.type}` };
        }
        cursor = page.nextCursor;
      } while (cursor);
    }
    return (this.trees[root] = tree);
  }
  async text(path, commit) {
    let text = "", offset;
    do {
      const window = await this.layerfs.fs.read(path, { commit, offset });
      text += window.text ?? `(${window.size} bytes, binary)`;
      offset = window.text === undefined ? null : window.nextOffset;
    } while (offset);
    return text;
  }
}

// Each op makes its SDK call, records what only the call knows, and returns
// a function that shapes the answer once the mirror has been refreshed.
const OPS = {
  // ---------------------------------------------------------- project
  async "project.list_branches"() {
    const value = await this.layerfs.project.list_branches();
    return () => ({ kind: "ok", nextCursor: null, items: value.items.filter((b) => this.m.s.branches[b.name]).map((b) => ({
      name: b.name, base: this.m.label("L", b.base), head: this.m.node(b.head), root: this.rootOf(b.name), mountedBy: this.m.liveMountsOf(b.name),
    })) });
  },
  async "main.list_layers"() {
    return () => {
      const items = [];
      for (let id = this.m.s.main.head; id; id = this.m.s.layers[id].parent) items.push({ ...this.m.s.layers[id] });
      return { kind: "ok", items, nextCursor: null };
    };
  },
  async "main.fork"(a) {
    const value = await this.layerfs.branch.fork(a.name, { from: "main" });
    this.m.forkedFrom[a.name] = this.m.label("L", value.base);
    return () => ({ kind: "Forked", branch: a.name, base: this.m.label("L", value.base), head: null, root: this.rootOf(a.name) });
  },
  // ---------------------------------------------------------- branch
  async "branch.fork"(a) {
    const value = await this.layerfs.branch.fork(a.name, { from: a.fromCommit ? this.m.real(a.fromCommit) : a.branch });
    this.m.forkedFrom[a.name] = this.m.node(value.head) ?? this.m.label("L", value.base);
    return () => ({ kind: "Forked", branch: a.name, base: this.m.label("L", value.base), head: this.m.node(value.head), root: this.rootOf(a.name) });
  },
  async "branch.list_commits"(a) {
    const value = await this.layerfs.branch.list_commits({ branch: a.branch });
    return () => ({ kind: "ok", nextCursor: null, items: value.items.map((c) => ({ ...this.m.s.commits[this.m.commitLabel(c.id)] })) });
  },
  async "branch.diff_commits"(a) {
    const value = await this.layerfs.branch.diff_commits({ from: this.m.real(a.from), to: this.m.real(a.to) });
    return () => this.m.ids(value);
  },
  async "branch.diff_branches"(a) {
    const value = await this.layerfs.branch.diff_branches({ from: a.from, to: a.to });
    return () => this.m.ids(value);
  },
  async "branch.publish"(a) {
    const value = await this.layerfs.branch.publish(clean({ branch: a.branch, commit: a.commit ? this.m.real(a.commit) : undefined }));
    return () => {
      const v = this.m.ids(value), main = { headLayer: this.m.s.main.head };
      if (v.kind !== "Added") return { ...v, main };
      return { ...v, main, publishedLayer: { id: v.publishedLayer.id, parent: v.publishedLayer.parent, root: v.publishedLayer.root }, overwrote: v.overwrote.length ? v.overwrote[0] : null };
    };
  },
  async "branch.merge"(a) {
    const value = await this.layerfs.branch.merge(a.branch, a.with, clean({ name: a.name, agent: a.agent }));
    const head = this.m.commitLabel(value.head);
    if (!value.fastForward) this.m.mergeOf[head] = { left: a.branch, right: a.with, mergeBase: this.m.ids(value.mergeBase), lww: this.m.ids(value.lww) };
    this.m.forkedFrom[a.name] = value.fastForward ? head : this.m.ids(value.sources[0].node);
    return () => this.m.ids(value);
  },
  // ---------------------------------------------------------- fs reads
  async "fs.read"(a) {
    const value = await this.layerfs.fs.read(a.path, this.at(a.ref, a.commit));
    return () => this.m.ids(value);
  },
  async "fs.list"(a) {
    const value = await this.layerfs.fs.list(a.path || "/", this.at(a.ref));
    return () => this.m.ids(value);
  },
  async "fs.stat"(a) {
    const value = await this.layerfs.fs.stat(a.path, this.at(a.ref));
    return () => this.m.ids(value);
  },
  async "fs.grep"(a) {
    const value = await this.layerfs.fs.grep(a.pattern, { ...this.at(a.ref), path: a.path || "/" });
    return () => this.m.ids(value);
  },
  async "fs.diff_files"(a) {
    const side = (sel) => clean({ path: sel.path, commit: sel.commit ? this.m.real(sel.commit) : undefined });
    const value = await this.layerfs.fs.diff_files({ left: side(a.left), right: side(a.right) }, this.at(a.ref));
    return () => this.m.ids(value);
  },
  async "fs.blame"(a) {
    const value = await this.layerfs.fs.blame(a.path, this.at(a.ref, a.commit));
    return () => this.m.ids(value);
  },
  // ---------------------------------------------------------- fs writes
  "fs.write"(a) { return this.write(a, () => this.layerfs.fs.write(a.path, a.content, opts(a))); },
  "fs.edit"(a) { return this.write(a, () => this.layerfs.fs.edit(a.path, clean({ oldText: a.oldText, newText: a.newText, all: a.all }), opts(a))); },
  "fs.mkdir"(a) { return this.write(a, () => this.layerfs.fs.mkdir(a.path, { ...opts(a), recursive: a.recursive })); },
  "fs.remove"(a) { return this.write(a, () => this.layerfs.fs.remove(a.path, { ...opts(a), recursive: a.recursive })); },
  "fs.cp"(a) { return this.write(a, () => this.layerfs.fs.cp(a.from, a.to, { ...opts(a), recursive: a.recursive })); },
  "fs.mv"(a) { return this.write(a, () => this.layerfs.fs.mv(a.from, a.to, opts(a))); },
  "fs.apply"(a) { return this.write(a, () => this.layerfs.fs.apply(a.changes.map(clean), opts(a))); },
  // ---------------------------------------------------------- sandbox
  async "sandbox.create"() {
    const value = await this.layerfs.sandbox.create();
    const label = this.m.label("sb", value.id);
    this.boxes[label] = { label, real: value.id, closed: false, workspaces: {}, processes: [], watch: false };
    return () => ({ kind: "Ready", id: label, mounted: false });
  },
  async "sandbox.mount"(a) {
    const box = this.box(a.sandbox);
    const value = await this.layerfs.sandbox.mount(box.real, { branch: a.branch });
    box.workspaces[value.path] = { markers: [] };
    this.ctx.mounts.push({ sandbox: box.real, path: value.path });
    return () => ({ kind: "Mounted", sandbox: box.label, path: value.path, branch: a.branch,
      base: this.m.node(value.base) ?? this.m.label("L", value.baseLayer), root: this.m.root(value.root) });
  },
  async "sandbox.exec"(a) {
    const box = this.box(a.sandbox);
    const value = await this.executor.exec(box, a.path, a.command, !!a.background);
    if (a.background) box.watch = true;
    return () => ({ ...value, stdout: this.m.text(value.stdout), stderr: this.m.text(value.stderr) });
  },
  async "sandbox.list_processes"(a) {
    const box = this.box(a.sandbox);
    const items = await this.executor.list(box);
    return () => ({ kind: "ok", items });
  },
  async "process.cancel"(a) {
    const box = this.box(a.sandbox);
    const value = await this.executor.cancel(box, a.process);
    box.watch = true;
    return () => ({ ...value, process: a.process });
  },
  async "sandbox.status"(a) {
    const box = this.box(a.sandbox);
    const value = await this.layerfs.sandbox.status(box.real, a.path);
    return () => ({ ...this.m.ids(value), workspace: `${box.label}:${a.path}` });
  },
  async "sandbox.commit"(a) {
    const box = this.box(a.sandbox), ws = this.workspace(box, a.path), captured = ws ? ws.baseCommit : null;
    const bound = ws ? ws.baseCommit || ws.baseLayer : null;
    const value = await this.layerfs.sandbox.commit(box.real, a.path, clean({ force: a.force, agent: attribution(a.agent), call: attribution(a.call) }));
    if (value.kind === "Committed") {
      const head = this.m.commitLabel(value.head);
      // A Commit record names the Commit a Workspace merged from, not a
      // Layer it was bound to: the answer keeps both.
      this.m.mergeOf[head] = { lww: this.m.ids(value.lww || []), from: value.merged ? this.m.ids(value.merged.from) || bound : null };
      if (value.displacedHead) this.m.displaced[this.m.ids(value.displacedHead)] = head;
    }
    box.workspaces[a.path].markers = [];
    return () => {
      const v = this.m.ids(value), lww = v.lww || [];
      return { kind: v.kind, branch: ws ? ws.branch : null, head: v.head ?? null, root: v.commit ? v.commit.root : v.root ?? null,
        capturedHead: captured, displacedHead: v.displacedHead ?? null, merged: v.merged ? { ...v.merged, lww } : null };
    };
  },
  async "sandbox.unmount"(a) {
    const box = this.box(a.sandbox), ws = this.workspace(box, a.path);
    await this.layerfs.sandbox.unmount(box.real, a.path, clean({ discard: a.discard }));
    delete box.workspaces[a.path];
    this.ctx.mounts = this.ctx.mounts.filter((m) => !(m.sandbox === box.real && m.path === a.path));
    // The daemon does not list what a discard dropped; the overlay count stands in.
    const dropped = a.discard && ws ? ws.dirty : 0;
    return () => ({ kind: "Unmounted", workspace: `${box.label}:${a.path}`, discardedUncommitted: Array.from({ length: dropped }, () => "(overlay entry)") });
  },
  async "sandbox.close"(a) {
    const box = this.box(a.sandbox);
    await this.layerfs.sandbox.close(box.real);
    box.closed = true;
    return () => ({ kind: "Closed", id: box.label });
  },
};

const opts = (a) => clean({ branch: a.branch, agent: attribution(a.agent), call: attribution(a.call) });

Object.assign(Session.prototype, {
  /** A Store write: one Commit (or UpToDate) on the Branch. */
  async write(a, run) {
    const value = await run();
    return () => {
      const v = this.m.ids(value);
      return { kind: v.kind, branch: a.branch, head: v.head ?? null, root: v.commit ? v.commit.root : null,
        capturedHead: v.commit ? v.commit.parent : v.head ?? null, displacedHead: null };
    };
  },
  workspace(box, path) {
    const mirrored = this.m.s.sandboxes[box.label];
    return mirrored && mirrored.workspaces[path] && mirrored.workspaces[path].mounted ? mirrored.workspaces[path] : null;
  },
});
