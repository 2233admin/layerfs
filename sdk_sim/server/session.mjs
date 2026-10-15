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

export class Session {
  /** `project` names the project: the addon keeps every name a process has
   *  initialized (there is no project close), so each reset takes a new one. */
  static async open(project = "website") {
    const session = new Session(await setup("ui", { project }));
    try {
      await session.layerfs.project.init(session.ctx.source);
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
      if (!box.closed) for (const path of Object.keys(box.workspaces)) {
        const changes = await this.operator.workspace.changes(box.real, path, 1000, 0);
        box.workspaces[path].changes = changes;
        box.workspaces[path].overlay = await this.operator.workspace.overlay(box.real, path);
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
    if (commit) return this.m.real(commit);
    if (ref === "main") return this.m.real(this.m.s.main.head);
    if (/^[CL]\d+$/.test(ref)) return this.m.real(ref);
    return ref;
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

  }

  /** Every entry of a saved root, files with their text, for the Files pane. */
  async tree(root) {
    if (this.trees[root]) return this.trees[root];
    const owner = [...Object.values(this.m.s.commits), ...Object.values(this.m.s.layers)].find((n) => n.root === root);
    if (!owner) throw fail("NoSuchRoot", `${root} is not a saved root the mirror knows`);
    const commit = this.m.real(owner.id), tree = {}, dirs = ["/"];
    while (dirs.length) {
      const dir = dirs.shift();
      let position = 0;
      do {
        const page = await this.layerfs.fs.list(commit, dir, 50, position);
        for (const item of page.items) {
          if (item.type === "dir") { tree[item.path] = { type: "dir", inode: item.inode }; dirs.push(item.path); continue; }
          tree[item.path] = { type: "file", inode: item.inode, content: item.type === "file" ? await this.text(item.path, commit) : `→ ${item.type}` };
        }
        position = page.hasMore ? position + page.items.length : null;
      } while (position !== null);
    }
    return (this.trees[root] = tree);
  }
  async text(path, commit) {
    let text = "", nextLine = 1;
    do {
      const window = await this.layerfs.fs.read(commit, path, nextLine);
      text += window.text ?? `(${window.size} bytes, binary)`;
      if (window.lineTruncated) text += "\n[huge-line remainder omitted]\n";
      nextLine = window.nextLine;
    } while (nextLine !== null);
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
    const value = await this.layerfs.branch.fork(a.name, "main");
    return () => ({ kind: "Forked", branch: a.name, base: this.m.label("L", value.base), head: null, root: this.rootOf(a.name) });
  },
  // ---------------------------------------------------------- branch
  async "branch.fork"(a) {
    const value = await this.layerfs.branch.fork(a.name, a.fromCommit ? this.m.real(a.fromCommit) : a.branch);
    return () => ({ kind: "Forked", branch: a.name, base: this.m.label("L", value.base), head: this.m.node(value.head), root: this.rootOf(a.name) });
  },
  async "branch.list_commits"(a) {
    const value = await this.layerfs.branch.list_commits(a.branch, a.pageSize, a.pagePos);
    return () => ({ kind: "ok", nextCursor: null, items: value.items.map((c) => ({ ...this.m.s.commits[this.m.commitLabel(c.id)] })) });
  },
  async "branch.diff_commits"(a) {
    const value = await this.layerfs.branch.diff_commits(this.m.real(a.from), this.m.real(a.to), a.pageSize, a.pagePos);
    return () => this.m.ids(value);
  },
  async "branch.diff_branches"(a) {
    const value = await this.layerfs.branch.diff_branches(a.from, a.to, a.pageSize, a.pagePos);
    return () => this.m.ids(value);
  },
  async "branch.publish"(a) {
    const value = await this.layerfs.branch.publish(a.branch, a.commit ? this.m.real(a.commit) : undefined);
    return () => {
      const v = this.m.ids(value), main = { headLayer: this.m.s.main.head };
      if (v.kind !== "Added") return { ...v, main };
      return { ...v, main, publishedLayer: { id: v.publishedLayer.id, parent: v.publishedLayer.parent, root: v.publishedLayer.root }, overwrote: v.overwrote.length ? v.overwrote[0] : null };
    };
  },
  async "branch.merge"(a) {
    const value = await this.layerfs.branch.merge(a.branch, a.with, a.name, a.message);
    const head = this.m.commitLabel(value.head);
    return () => this.m.ids(value);
  },
  // ---------------------------------------------------------- fs reads
  async "fs.read"(a) {
    const value = await this.layerfs.fs.read(this.at(a.ref, a.commit), a.path, a.startLine, a.endLine);
    return () => this.m.ids(value);
  },
  async "fs.list"(a) {
    const value = await this.layerfs.fs.list(this.at(a.ref), a.path || "/", a.pageSize, a.pagePos);
    return () => this.m.ids(value);
  },
  async "fs.stat"(a) {
    const value = await this.layerfs.fs.stat(this.at(a.ref), a.path);
    return () => this.m.ids(value);
  },
  async "fs.grep"(a) {
    const value = await this.layerfs.fs.grep(this.at(a.ref), a.pattern, a.path || "/", a.pageSize, a.pagePos);
    return () => this.m.ids(value);
  },
  async "fs.diff_files"(a) {
    const side = (sel) => clean({ path: sel.path, commit: sel.commit ? this.m.real(sel.commit) : undefined });
    const value = await this.layerfs.fs.diff_files(this.at(a.ref, a.left.commit), a.left.path, this.at(a.ref, a.right.commit), a.right.path);
    return () => this.m.ids(value);
  },
  async "fs.blame"(a) {
    const value = await this.layerfs.fs.blame(this.at(a.ref, a.commit), a.path, a.fromLine);
    return () => this.m.ids(value);
  },
  // ---------------------------------------------------------- fs writes
  "fs.write"(a) { return this.write(a, () => this.layerfs.fs.write(a.branch, a.path, a.content, a.message)); },
  "fs.edit"(a) { return this.write(a, () => this.layerfs.fs.edit(a.branch, a.path, a.oldText, a.newText, a.message)); },
  "fs.mkdir"(a) { return this.write(a, () => this.layerfs.fs.mkdir(a.branch, a.path, a.message)); },
  "fs.rm"(a) { return this.write(a, () => this.layerfs.fs.rm(a.branch, a.path, a.message)); },
  "fs.cp"(a) { return this.write(a, () => this.layerfs.fs.cp(a.branch, a.from, a.to, a.message)); },
  "fs.mv"(a) { return this.write(a, () => this.layerfs.fs.mv(a.branch, a.from, a.to, a.message)); },
  "fs.apply"(a) { return this.write(a, () => this.layerfs.fs.apply(a.branch, a.changes.map((c) => { const { kind, ...rest } = clean(c); return { op: (c.op || kind) === "remove" ? "rm" : (c.op || kind), ...rest }; }), a.message)); },
  // ---------------------------------------------------------- sandbox
  async "sandbox.create"() {
    const value = await this.layerfs.sandbox.create();
    const label = this.m.label("sb", value);
    this.boxes[label] = { label, real: value, closed: false, workspaces: {}, processes: [], watch: false };
    return () => ({ kind: "Ready", id: label, mounted: false });
  },
  async "sandbox.mount"(a) {
    const box = this.box(a.sandbox);
    const value = await this.layerfs.sandbox.mount(box.real, a.branch);
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
    const value = await this.layerfs.sandbox.commit(box.real, a.path, clean({ force: a.force, message: a.message }));
    if (value.kind === "Committed") {
      const head = this.m.commitLabel(value.head);
      // A Commit record names the Commit a Workspace merged from, not a
      // Layer it was bound to: the answer keeps both.
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

// Direct public/operator HTTP method tables. Arguments retain their positional
// SDK shapes; display-id translation is confined to reference/id positions.
Session.prototype.table = async function(surface, group, method, args) {
  const target = surface === "sdk" ? this.layerfs : this.operator;
  const fn = target[group]?.[method];
  if (!Object.hasOwn(target,group) || !Object.hasOwn(target[group],method) || typeof fn !== "function" || method.startsWith("_") || !Array.isArray(args)) throw fail("UnknownMethod", `${surface}.${group}.${method}`);
  const actual = [...args];
  const positions = group === "sandbox" || group === "workspace" || group === "process" ? [0] : group === "files" || group === "fs" ? (method === "diff_files" ? [0,2] : [0]) : group === "branch" ? (method === "fork" || method === "publish" ? [1] : method.startsWith("diff_") ? [0,1] : []) : [];
  for (const index of positions) if (actual[index] !== undefined) actual[index] = this.m.real(actual[index]);
  const started = performance.now();
  const value = await fn(...actual);
  if (surface === "sdk" && group === "sandbox") {
    if (method === "create") {
      const label=this.m.label("sb",value);
      this.boxes[label]={label,real:value,closed:false,workspaces:{},processes:[],watch:false};
    } else {
      const box=Object.values(this.boxes).find((box)=>box.real===actual[0]);
      if (method === "mount") {
        if (box) box.workspaces[value.path]={};
        this.ctx.mounts.push({sandbox:actual[0],path:value.path});
      } else if (method === "unmount") {
        if(box) delete box.workspaces[actual[1]];
        this.ctx.mounts=this.ctx.mounts.filter((m)=>m.sandbox!==actual[0]||m.path!==actual[1]);
      } else if(method === "close" && box) box.closed=true;
    }
  }
  const sdkMs=performance.now()-started;
  const refreshed=performance.now();await this.refresh();
  return {value,state:this.state(),timing:{sdkMs,refreshMs:performance.now()-refreshed}};
};

Session.prototype.uiCall = function(surface,group,method,args,view) {
  args=args.map((value)=>value===null?undefined:value);
  if(surface === "operator") {
    if(group==="process"&&method==="list") return this.call("sandbox.list_processes",{sandbox:args[0]});
    if(group==="process"&&method==="cancel") return this.call("process.cancel",{sandbox:args[0],process:args[1]});
    if(group==="process"&&method==="start") return this.call("sandbox.exec",{sandbox:args[0],path:args[1],command:args[2],background:true});
    if(group==="inspect"&&method==="snapshot"&&view==="layers") return this.call("main.list_layers");
    throw fail("UnknownMethod",`${surface}.${group}.${method}`);
  }
  const parameters = {
    "project.list_branches":["pageSize","pagePos"],
    "branch.fork":["name","branch"],"branch.list_commits":["branch","pageSize","pagePos"],
    "branch.diff_commits":["from","to","pageSize","pagePos"],"branch.diff_branches":["from","to","pageSize","pagePos"],
    "branch.publish":["branch","commit"],"branch.merge":["branch","with","name","message"],
    "fs.read":["ref","path","startLine","endLine"],"fs.list":["ref","path","pageSize","pagePos"],"fs.stat":["ref","path"],
    "fs.grep":["ref","pattern","path","pageSize","pagePos"],"fs.blame":["ref","path","fromLine"],
    "fs.write":["branch","path","content","message"],"fs.edit":["branch","path","oldText","newText","message"],
    "fs.mkdir":["branch","path","message"],"fs.rm":["branch","path","message"],"fs.cp":["branch","from","to","message"],"fs.mv":["branch","from","to","message"],"fs.apply":["branch","changes","message"],
    "sandbox.create":[],"sandbox.mount":["sandbox","branch"],"sandbox.exec":["sandbox","path","command","message"],"sandbox.status":["sandbox","path"],"sandbox.commit":["sandbox","path","options"],"sandbox.unmount":["sandbox","path","options"],"sandbox.close":["sandbox"],
  };
  const name=`${group}.${method}`;
  if(name==="fs.diff_files") return this.call(name,{ref:args[0],left:{path:args[1],commit:args[0]},right:{path:args[3],commit:args[2]}});
  const keys=parameters[name];if(!keys) throw fail("UnknownMethod",name);
  const a=Object.fromEntries(keys.map((key,i)=>[key,args[i]]));
  if(a.options){Object.assign(a,a.options);delete a.options;}
  if(name==="branch.fork") a.branch??="main";
  return this.call(name,a);
};
