// LayerFS SDK simulator: an in-memory model of the *proposed* agent-facing SDK
// (sdk_js.md, issue #322). It reproduces the decision rules only; it is not the
// product. Branch publication is overwrite-only (BRANCH-OVERWRITE-DECISION) and
// main-line publication follows History add_layer (fast-forward only).
(function (global) {
  "use strict";

  const clone = (v) => JSON.parse(JSON.stringify(v));
  const J = (v) => JSON.stringify(v);

  class Refusal extends Error {
    constructor(code, message, detail) {
      super(message);
      this.code = code;
      this.detail = detail || {};
    }
  }
  const refuse = (code, message, detail) => { throw new Refusal(code, message, detail); };

  // ---------------------------------------------------------------- file trees
  // A tree is { "/path": { type: "file"|"dir", inode, content? } }; "/" is implicit.
  const parentOf = (p) => (p.lastIndexOf("/") <= 0 ? "/" : p.slice(0, p.lastIndexOf("/")));
  const baseName = (p) => p.slice(p.lastIndexOf("/") + 1);
  const isUnder = (p, dir) => p === dir || p.startsWith(dir === "/" ? "/" : dir + "/");
  const childrenOf = (tree, dir) =>
    Object.keys(tree).filter((p) => p !== dir && parentOf(p) === dir).sort();

  function treeKey(tree) {
    return Object.keys(tree).sort()
      .map((p) => { const e = tree[p]; return `${p}\u0000${e.type}\u0000${e.inode}\u0000${e.content ?? ""}`; })
      .join("\u0001");
  }

  function countOccurrences(text, needle) {
    if (!needle) return 0;
    let n = 0, i = 0;
    while ((i = text.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
    return n;
  }

  // Applies one ordered change list to a copy of `tree`. Throws a Refusal on the
  // first invalid change, so callers never observe a partially changed tree.
  function applyChanges(tree, changes, newInode) {
    const t = clone(tree);
    const need = (p) => { if (!t[p]) refuse("NoSuchPath", `${p} does not exist`, { path: p }); return t[p]; };
    const needParent = (p) => {
      const d = parentOf(p);
      if (d !== "/" && (!t[d] || t[d].type !== "dir")) refuse("NoSuchPath", `parent ${d} does not exist`, { path: d });
    };
    for (const c of changes) {
      switch (c.kind) {
        case "write": {
          needParent(c.path);
          const e = t[c.path];
          if (e && e.type === "dir") refuse("IsDirectory", `${c.path} is a directory`, { path: c.path });
          t[c.path] = { type: "file", inode: e ? e.inode : newInode(), content: c.content };
          break;
        }
        case "edit": {
          const e = need(c.path);
          if (e.type !== "file") refuse("IsDirectory", `${c.path} is a directory`, { path: c.path });
          const n = countOccurrences(e.content, c.oldText);
          if (n === 0) refuse("NoMatch", `oldText not found in ${c.path}`, { path: c.path });
          if (n > 1 && !c.all) refuse("AmbiguousMatch", `oldText matches ${n} times in ${c.path}`, { path: c.path, matches: n });
          e.content = c.all ? e.content.split(c.oldText).join(c.newText) : e.content.replace(c.oldText, c.newText);
          break;
        }
        case "mkdir": {
          if (t[c.path]) { if (c.recursive && t[c.path].type === "dir") break; refuse("Exists", `${c.path} exists`, { path: c.path }); }
          if (c.recursive) {
            const parts = c.path.split("/").filter(Boolean);
            let p = "";
            for (const part of parts) {
              p += "/" + part;
              if (!t[p]) t[p] = { type: "dir", inode: newInode() };
              else if (t[p].type !== "dir") refuse("NotDirectory", `${p} is a file`, { path: p });
            }
          } else {
            needParent(c.path);
            t[c.path] = { type: "dir", inode: newInode() };
          }
          break;
        }
        case "remove": {
          const e = need(c.path);
          if (e.type === "dir" && childrenOf(t, c.path).length && !c.recursive)
            refuse("NotEmpty", `${c.path} is not empty`, { path: c.path });
          for (const p of Object.keys(t)) if (isUnder(p, c.path)) delete t[p];
          break;
        }
        case "cp": {
          const e = need(c.from);
          if (t[c.to]) refuse("Exists", `${c.to} exists`, { path: c.to });
          needParent(c.to);
          if (e.type === "dir" && !c.recursive) refuse("IsDirectory", `${c.from} needs recursive: true`, { path: c.from });
          for (const p of Object.keys(t).filter((q) => isUnder(q, c.from)).sort()) {
            const src = t[p];
            t[c.to + p.slice(c.from.length)] = { ...clone(src), inode: newInode() };
          }
          break;
        }
        case "mv": {
          need(c.from);
          if (t[c.to]) refuse("Exists", `${c.to} exists`, { path: c.to });
          needParent(c.to);
          if (isUnder(c.to, c.from)) refuse("InvalidMove", `cannot move ${c.from} into itself`, { path: c.to });
          for (const p of Object.keys(t).filter((q) => isUnder(q, c.from)).sort()) {
            t[c.to + p.slice(c.from.length)] = t[p];
            delete t[p];
          }
          break;
        }
        default:
          refuse("InvalidInput", `unknown change kind ${c.kind}`);
      }
    }
    return t;
  }

  // ---------------------------------------------------------------- diffs
  function lineDiff(a, b) {
    const x = (a ?? "").split("\n"), y = (b ?? "").split("\n");
    const m = x.length, n = y.length;
    const L = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--)
      for (let j = n - 1; j >= 0; j--)
        L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (x[i] === y[j]) { out.push({ op: " ", text: x[i] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out.push({ op: "-", text: x[i++] });
      else out.push({ op: "+", text: y[j++] });
    }
    while (i < m) out.push({ op: "-", text: x[i++] });
    while (j < n) out.push({ op: "+", text: y[j++] });
    return out;
  }

  // Filesystem comparison from `a` to `b`: Added means present only in b.
  function diffTrees(a, b) {
    const paths = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    const entries = [];
    for (const p of paths) {
      const l = a[p], r = b[p];
      if (!l) entries.push({ path: p, kind: "Added", type: r.type, after: r });
      else if (!r) entries.push({ path: p, kind: "Removed", type: l.type, before: l });
      else {
        const content = (l.content ?? null) !== (r.content ?? null);
        const identity = l.inode !== r.inode;
        const type = l.type !== r.type;
        if (content || identity || type)
          entries.push({ path: p, kind: "Modified", type: r.type, before: l, after: r, content, identity,
            hunks: content && l.type === "file" && r.type === "file" ? lineDiff(l.content, r.content) : null });
      }
    }
    return entries;
  }

  // ---------------------------------------------------------------- the model
  class Sim {
    constructor() {
      this.s = {
        project: null, main: null,
        roots: {}, rootKeys: {}, commits: {}, layers: {},
        branches: {}, branchOrder: [], sandboxes: {}, sandboxOrder: [],
        seq: { root: 0, commit: 0, layer: 0, inode: 0, sandbox: 0, proc: 0, slot: 0 },
      };
    }

    snapshot() { return clone(this.s); }

    // -- identities
    newInode() { return "i" + ++this.s.seq.inode; }
    slot() { return this.s.seq.slot++; }
    intern(tree) {
      const key = treeKey(tree);
      if (this.s.rootKeys[key]) return this.s.rootKeys[key];
      const id = "R" + this.s.seq.root++;
      this.s.rootKeys[key] = id;
      this.s.roots[id] = clone(tree);
      return id;
    }

    // -- lookups
    branch(name) {
      const b = this.s.branches[name];
      if (!b) refuse("NoSuchBranch", `no Branch named ${name}`, { branch: name });
      return b;
    }
    branchRoot(b) { return b.head ? this.s.commits[b.head].root : this.s.layers[b.base].root; }
    sandbox(id) {
      const sb = this.s.sandboxes[id];
      if (!sb) refuse("NoSuchSandbox", `no Sandbox ${id} owned by this controller`, { sandbox: id });
      if (sb.closed) refuse("SandboxClosed", `${id} is closed`, { sandbox: id });
      return sb;
    }
    workspace(sbId, path) {
      const sb = this.sandbox(sbId);
      const ws = sb.workspaces[path];
      if (!ws || !ws.mounted) refuse("NotMounted", `${sbId}:${path} is not mounted`, { workspace: `${sbId}:${path}` });
      return ws;
    }
    liveMountsOf(branchName) {
      const out = [];
      for (const id of this.s.sandboxOrder) {
        const sb = this.s.sandboxes[id];
        if (sb.closed) continue;
        for (const p of sb.wsOrder) if (sb.workspaces[p].mounted && sb.workspaces[p].branch === branchName) out.push(`${id}:${p}`);
      }
      return out;
    }

    // Resolves any readable selector to { label, kind, tree }.
    // "main", a Branch name, "C3", "L1", or a live view "sb_01:/workspaces/1".
    resolve(ref) {
      const s = this.s;
      if (ref === "main") {
        if (!s.main) refuse("NoProject", "project not initialized");
        const l = s.layers[s.main.head];
        return { label: `main @ ${l.id}`, kind: "main", root: l.root, tree: s.roots[l.root], layer: l.id };
      }
      if (/^C\d+$/.test(ref)) {
        const c = s.commits[ref];
        if (!c) refuse("NoSuchCommit", `no Commit ${ref}`);
        return { label: ref, kind: "commit", root: c.root, tree: s.roots[c.root], commit: ref };
      }
      if (/^L\d+$/.test(ref)) {
        const l = s.layers[ref];
        if (!l) refuse("NoSuchLayer", `no Layer ${ref}`);
        return { label: ref, kind: "layer", root: l.root, tree: s.roots[l.root], layer: ref };
      }
      if (ref.includes(":/")) {
        const [sb, path] = [ref.slice(0, ref.indexOf(":")), ref.slice(ref.indexOf(":") + 1)];
        const w = s.sandboxes[sb] && s.sandboxes[sb].workspaces[path];
        if (!w) refuse("NotMounted", `${ref} does not exist`);
        return { label: `${ref} (live)`, kind: "live", root: null, tree: w.live, workspace: ref };
      }
      const b = this.branch(ref);
      const root = this.branchRoot(b);
      return { label: `${b.name} @ ${b.head || b.base}`, kind: "branch", root, tree: s.roots[root], head: b.head };
    }

    // -- operation entry point: one attempt, typed result or typed refusal
    run(call, args = {}) {
      const fn = OPS[call];
      if (!fn) return { ok: false, code: "Unsupported", refusal: { code: "Unsupported", message: `unknown call ${call}` } };
      try {
        const result = fn.call(this, args);
        const code = result && result.kind ? result.kind : "ok";
        return { ok: true, code, result };
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        return { ok: false, code: e.code, refusal: { code: e.code, message: e.message, ...e.detail } };
      }
    }

    // -- fs mutation shared by write/edit/mkdir/remove/cp/mv/apply. Allowed
    // while mounted: it advances the head, so live mounts become stale.
    mutate(branchName, changes, via) {
      const b = this.branch(branchName);
      const capturedHead = b.head;
      const currentRoot = this.branchRoot(b);
      const tree = applyChanges(this.s.roots[currentRoot], changes, () => this.newInode());
      const root = this.intern(tree);
      if (root === currentRoot)
        return { kind: "UpToDate", branch: b.name, head: b.head, root, capturedHead, displacedHead: null };
      const id = "C" + ++this.s.seq.commit;
      this.s.commits[id] = { id, parent: capturedHead, root, base: b.base, branch: b.name, slot: this.slot(), by: "fs", via };
      b.head = id;
      return { kind: "Committed", branch: b.name, head: id, root, capturedHead, displacedHead: null };
    }
  }

  const OPS = {
    // ---------------------------------------------------------- project
    "project.init"(a) {
      if (this.s.project) refuse("Exists", "project already initialized");
      const tree = {};
      for (const [p, v] of Object.entries(a.files)) {
        // create parent directories implicitly for the imported source tree
        let d = parentOf(p);
        const dirs = [];
        while (d !== "/" && !tree[d]) { dirs.unshift(d); d = parentOf(d); }
        for (const dir of dirs) tree[dir] = { type: "dir", inode: this.newInode() };
        tree[p] = v === null ? { type: "dir", inode: this.newInode() } : { type: "file", inode: this.newInode(), content: v };
      }
      const root = this.intern(tree);
      const id = "L" + this.s.seq.layer++;
      this.s.layers[id] = { id, parent: null, root, sourceBranch: null, sourceCommit: null, slot: this.slot() };
      this.s.project = { name: a.name };
      this.s.main = { head: id };
      return { kind: "Initialized", project: a.name, main: { headLayer: id, root } };
    },
    "project.list_branches"() {
      return { kind: "ok", items: this.s.branchOrder.map((n) => {
        const b = this.s.branches[n];
        return { name: n, base: b.base, head: b.head, root: this.branchRoot(b), mountedBy: this.liveMountsOf(n) };
      }), nextCursor: null };
    },
    "main.fork"(a) { return forkFrom.call(this, a.name, this.s.main.head, null); },
    "main.list_layers"() {
      const out = [];
      for (let id = this.s.main.head; id; id = this.s.layers[id].parent) out.push(clone(this.s.layers[id]));
      return { kind: "ok", items: out, nextCursor: null };
    },

    // ---------------------------------------------------------- branch
    "branch.fork"(a) {
      const b = this.branch(a.branch);
      return forkFrom.call(this, a.name, b.base, a.fromCommit || b.head);
    },
    "branch.list_commits"(a) {
      const b = this.branch(a.branch);
      const out = [];
      for (let id = b.head; id; id = this.s.commits[id].parent) out.push(clone(this.s.commits[id]));
      return { kind: "ok", items: out, nextCursor: null };
    },
    "branch.diff_commits"(a) {
      const l = this.resolve(a.from), r = this.resolve(a.to);
      if (l.kind !== "commit" || r.kind !== "commit") refuse("InvalidInput", "diff_commits takes two saved Commits");
      return { kind: "ok", from: { commit: a.from, root: l.root }, to: { commit: a.to, root: r.root }, items: diffTrees(l.tree, r.tree) };
    },
    "branch.diff_branches"(a) {
      const l = this.resolve(a.from), r = this.resolve(a.to);
      if (!["branch", "main"].includes(l.kind) || !["branch", "main"].includes(r.kind))
        refuse("InvalidInput", "diff_branches takes Branches or main");
      return { kind: "ok", from: { ref: a.from, label: l.label, root: l.root }, to: { ref: a.to, label: r.label, root: r.root }, items: diffTrees(l.tree, r.tree) };
    },
    // Mirrors History add_layer: published-source UpToDate, head/base checks,
    // stack head must equal the Branch base (fast-forward only), NoChanges.
    "branch.publish"(a) {
      const b = this.branch(a.branch);
      const cid = a.commit || b.head;
      if (!cid) refuse("NoCommit", `${b.name} has no saved Commit to publish`);
      const c = this.s.commits[cid];
      const already = Object.values(this.s.layers).find((l) => l.sourceBranch === b.name && l.sourceCommit === cid);
      if (already) return { kind: "UpToDate", layer: already.id, main: { headLayer: this.s.main.head, root: this.s.layers[this.s.main.head].root } };
      if (b.head !== cid) refuse("HeadMoved", `${b.name} head is ${b.head}, not ${cid}`);
      if (c.base !== b.base) refuse("BaseMismatch", `${cid} base ${c.base} differs from Branch base ${b.base}`);
      if (this.s.main.head !== b.base)
        refuse("StackMoved", `main moved to ${this.s.main.head}; ${b.name} is based on ${b.base}`, { expected: b.base, actual: this.s.main.head });
      if (c.root === this.s.layers[b.base].root) return { kind: "NoChanges", main: { headLayer: this.s.main.head } };
      const id = "L" + this.s.seq.layer++;
      this.s.layers[id] = { id, parent: b.base, root: c.root, sourceBranch: b.name, sourceCommit: cid, slot: this.slot() };
      this.s.main.head = id;
      return { kind: "Added", source: { branch: b.name, commit: cid }, publishedLayer: { id, parent: b.base, root: c.root }, main: { headLayer: id, root: c.root } };
    },

    // ---------------------------------------------------------- fs reads
    "fs.read"(a) {
      const v = this.resolve(a.commit || a.ref);
      const e = v.tree[a.path];
      if (!e) refuse("NoSuchPath", `${a.path} does not exist at ${v.label}`, { path: a.path });
      if (e.type !== "file") refuse("IsDirectory", `${a.path} is a directory`, { path: a.path });
      return { kind: "ok", snapshot: v.label, root: v.root, path: a.path, inode: e.inode, text: e.content };
    },
    "fs.list"(a) {
      const v = this.resolve(a.ref);
      const dir = a.path || "/";
      if (dir !== "/" && (!v.tree[dir] || v.tree[dir].type !== "dir")) refuse("NoSuchPath", `${dir} is not a directory`);
      return { kind: "ok", snapshot: v.label, root: v.root, items: childrenOf(v.tree, dir).map((p) => ({ name: baseName(p), path: p, type: v.tree[p].type, inode: v.tree[p].inode })), nextCursor: null };
    },
    "fs.stat"(a) {
      const v = this.resolve(a.ref);
      const e = v.tree[a.path];
      if (!e) refuse("NoSuchPath", `${a.path} does not exist`);
      return { kind: "ok", snapshot: v.label, path: a.path, type: e.type, inode: e.inode, size: (e.content || "").length };
    },
    "fs.grep"(a) {
      const v = this.resolve(a.ref);
      const items = [];
      for (const p of Object.keys(v.tree).sort()) {
        const e = v.tree[p];
        if (e.type !== "file" || !isUnder(p, a.path || "/")) continue;
        e.content.split("\n").forEach((line, i) => { if (line.includes(a.pattern)) items.push({ path: p, line: i + 1, text: line.trim() }); });
      }
      return { kind: "ok", snapshot: v.label, root: v.root, items, nextCursor: null };
    },
    "fs.diff_files"(a) {
      // Current selectors share one captured Branch root.
      const base = this.resolve(a.ref);
      const side = (sel) => {
        const v = sel.commit ? this.resolve(sel.commit) : base;
        const e = v.tree[sel.path];
        if (!e) refuse("NoSuchPath", `${sel.path} does not exist at ${v.label}`);
        if (e.type !== "file") refuse("IsDirectory", `${sel.path} is a directory`);
        return { path: sel.path, snapshot: v.label, inode: e.inode, content: e.content };
      };
      const l = side(a.left), r = side(a.right);
      const equal = l.content === r.content;
      return { kind: equal ? "Equal" : "Text", left: { path: l.path, snapshot: l.snapshot, inode: l.inode }, right: { path: r.path, snapshot: r.snapshot, inode: r.inode },
        contentEqual: equal, sameInode: l.inode === r.inode, hunks: equal ? [] : lineDiff(l.content, r.content) };
    },

    // ---------------------------------------------------------- fs writes
    "fs.write"(a) { return this.mutate(a.branch, [{ kind: "write", path: a.path, content: a.content }], "fs.write"); },
    "fs.edit"(a) { return this.mutate(a.branch, [{ kind: "edit", path: a.path, oldText: a.oldText, newText: a.newText, all: a.all }], "fs.edit"); },
    "fs.mkdir"(a) { return this.mutate(a.branch, [{ kind: "mkdir", path: a.path, recursive: a.recursive }], "fs.mkdir"); },
    "fs.remove"(a) { return this.mutate(a.branch, [{ kind: "remove", path: a.path, recursive: a.recursive }], "fs.remove"); },
    "fs.cp"(a) { return this.mutate(a.branch, [{ kind: "cp", from: a.from, to: a.to, recursive: a.recursive }], "fs.cp"); },
    "fs.mv"(a) { return this.mutate(a.branch, [{ kind: "mv", from: a.from, to: a.to }], "fs.mv"); },
    "fs.apply"(a) { return this.mutate(a.branch, a.changes, "fs.apply"); },

    // ---------------------------------------------------------- sandbox
    "sandbox.create"() {
      const id = "sb_" + String(++this.s.seq.sandbox).padStart(2, "0");
      this.s.sandboxes[id] = { id, closed: false, nextWs: 1, workspaces: {}, wsOrder: [], processes: {}, procOrder: [] };
      this.s.sandboxOrder.push(id);
      return { kind: "Ready", id, mounted: false };
    },
    "sandbox.list"() {
      return { kind: "ok", items: this.s.sandboxOrder.map((id) => {
        const sb = this.s.sandboxes[id];
        return { id, status: sb.closed ? "closed" : "ready", mounts: sb.wsOrder.filter((p) => sb.workspaces[p].mounted) };
      }) };
    },
    "sandbox.mount"(a) {
      const sb = this.sandbox(a.sandbox);
      const b = this.branch(a.branch);
      const path = "/workspaces/" + sb.nextWs++;
      const root = this.branchRoot(b);
      sb.workspaces[path] = { sandbox: sb.id, path, branch: b.name, baseCommit: b.head, baseLayer: b.base, baseRoot: root, live: clone(this.s.roots[root]), mounted: true, slot: this.slot() };
      sb.wsOrder.push(path);
      return { kind: "Mounted", sandbox: sb.id, path, branch: b.name, base: b.head || b.base, root };
    },
    "sandbox.list_mounts"(a) {
      const sb = this.sandbox(a.sandbox);
      return { kind: "ok", items: sb.wsOrder.filter((p) => sb.workspaces[p].mounted).map((p) => {
        const w = sb.workspaces[p];
        return { path: p, branch: w.branch, base: w.baseCommit || w.baseLayer, overlay: diffTrees(this.s.roots[w.baseRoot], w.live).length };
      }) };
    },
    "sandbox.exec"(a) {
      const ws = this.workspace(a.sandbox, a.path);
      const sb = this.s.sandboxes[a.sandbox];
      let changed = [];
      let exitCode = a.exitCode ?? 0;
      let stdout = a.output ?? "";
      if (a.writes && a.writes.length) {
        try {
          const before = ws.live;
          ws.live = applyChanges(ws.live, a.writes, () => this.newInode());
          changed = diffTrees(before, ws.live).map((d) => d.path);
        } catch (e) {
          if (!(e instanceof Refusal)) throw e;
          exitCode = 1; stdout = e.message;
        }
      }
      if (a.background) {
        const id = "proc_" + String(++this.s.seq.proc).padStart(2, "0");
        sb.processes[id] = { id, path: a.path, command: a.command, status: "running" };
        sb.procOrder.push(id);
        return { kind: "running", process: id, command: a.command, changed };
      }
      return { kind: "exit:" + exitCode, exitCode, stdout, changed };
    },
    "sandbox.list_processes"(a) {
      const sb = this.sandbox(a.sandbox);
      return { kind: "ok", items: sb.procOrder.map((id) => clone(sb.processes[id])) };
    },
    "process.cancel"(a) {
      const sb = this.sandbox(a.sandbox);
      const p = sb.processes[a.process];
      if (!p) refuse("NoSuchProcess", `${a.process} is not owned by ${a.sandbox}`);
      if (p.status !== "running") return { kind: "Stopped", process: p.id, status: p.status };
      p.status = "stopped";
      return { kind: "Stopped", process: p.id, status: "stopped" };
    },
    "sandbox.status"(a) {
      const ws = this.workspace(a.sandbox, a.path);
      const b = this.s.branches[ws.branch];
      return { kind: "ok", workspace: `${a.sandbox}:${a.path}`, branch: ws.branch, base: ws.baseCommit || ws.baseLayer, branchHead: b.head,
        headMovedSinceMount: b.head !== ws.baseCommit, overlay: diffTrees(this.s.roots[ws.baseRoot], ws.live).map((d) => `${d.kind[0]} ${d.path}`) };
    },
    // Mirrors commit_staged: the new Commit keeps the captured parent; UpToDate
    // compares against the *current* Branch root. A stale Workspace (head moved
    // since mount or its last Commit) is refused unless force overwrites it.
    "sandbox.commit"(a) {
      const ws = this.workspace(a.sandbox, a.path);
      const b = this.s.branches[ws.branch];
      const capturedHead = ws.baseCommit;
      const currentRoot = this.branchRoot(b);
      const root = this.intern(ws.live);
      if (root === currentRoot) {
        ws.baseCommit = b.head; ws.baseRoot = root;
        return { kind: "UpToDate", branch: b.name, head: b.head, root, capturedHead, displacedHead: null };
      }
      if (b.head !== capturedHead && !a.force)
        refuse("Stale", `${b.name} head is ${b.head}; this Workspace mounted ${capturedHead || b.base}`, { head: b.head, base: capturedHead || b.base });
      const id = "C" + ++this.s.seq.commit;
      const displacedHead = b.head !== capturedHead ? b.head : null;
      this.s.commits[id] = { id, parent: capturedHead, root, base: b.base, branch: b.name, slot: this.slot(), by: "workspace", via: `${a.sandbox}:${a.path}` };
      if (displacedHead) this.s.commits[displacedHead].displacedBy = id;
      b.head = id;
      ws.baseCommit = id; ws.baseRoot = root;
      return { kind: "Committed", branch: b.name, head: id, root, capturedHead, displacedHead };
    },
    "sandbox.unmount"(a) {
      const ws = this.workspace(a.sandbox, a.path);
      const sb = this.s.sandboxes[a.sandbox];
      const busy = sb.procOrder.filter((id) => sb.processes[id].status === "running" && sb.processes[id].path === a.path);
      if (busy.length) refuse("Busy", `${a.sandbox}:${a.path} is busy: ${busy.join(", ")} still running`, { processes: busy });
      const discarded = diffTrees(this.s.roots[ws.baseRoot], ws.live).map((d) => d.path);
      ws.mounted = false;
      return { kind: "Unmounted", workspace: `${a.sandbox}:${a.path}`, discardedUncommitted: discarded };
    },
    "sandbox.close"(a) {
      const sb = this.sandbox(a.sandbox);
      const live = sb.wsOrder.filter((p) => sb.workspaces[p].mounted);
      if (live.length) refuse("MountsActive", `${sb.id} still has mounted Workspaces: ${live.join(", ")}`, { mounts: live });
      sb.closed = true;
      return { kind: "Closed", id: sb.id };
    },
  };

  function forkFrom(name, baseLayer, fromCommit) {
    if (name === "main") refuse("ReservedName", `"main" names the project's main line`);
    if (this.s.branches[name]) refuse("NameTaken", `Branch ${name} already exists`);
    // A fork from a saved Commit keeps that Commit's base Layer.
    const base = fromCommit ? this.s.commits[fromCommit].base : baseLayer;
    const b = { name, base, head: fromCommit || null, from: fromCommit || baseLayer, slot: this.slot() };
    this.s.branches[name] = b;
    this.s.branchOrder.push(name);
    return { kind: "Forked", branch: name, base, head: b.head, root: this.branchRoot(b) };
  }

  // ---------------------------------------------------------------- scripts
  // Generates the inline Node tool call an agent would send for one step.
  function scriptFor(step, project) {
    const a = step.args || {};
    const conn = { project };
    let body;
    const sb = () => `const sandbox = await layerfs.sandbox.connect(${J(a.sandbox)});\n`;
    const onRef = (ref) => (ref === "main" ? "layerfs.project.main.fs" : "layerfs.fs");
    const print = "console.log(JSON.stringify(result));";
    switch (step.call) {
      case "project.init":
        delete conn.project;
        body = `const result = await layerfs.project.init("./${a.name}", { name: ${J(a.name)} });\n${print}`; break;
      case "project.list_branches": body = `const result = await layerfs.project.list_branches();\n${print}`; break;
      case "main.fork": body = `const branch = await layerfs.project.main.fork(${J(a.name)});\nconsole.log(JSON.stringify(branch.branchRef));`; break;
      case "main.list_layers": body = `const result = await layerfs.project.main.list_layers();\n${print}`; break;
      case "branch.fork": conn.branch = a.branch; body = `const branch = await layerfs.branch.fork(${J(a.name)});\nconsole.log(JSON.stringify(branch.branchRef));`; break;
      case "branch.list_commits": conn.branch = a.branch; body = `const result = await layerfs.branch.list_commits();\n${print}`; break;
      case "branch.diff_commits": body = `const result = await layerfs.branch.diff_commits({ from: ${J(a.from)}, to: ${J(a.to)} });\n${print}`; break;
      case "branch.diff_branches": {
        const sel = (r) => (r === "main" ? "layerfs.project.main" : J(r));
        body = `const result = await layerfs.branch.diff_branches({\n  from: ${sel(a.from)},\n  to: ${sel(a.to)},\n});\n${print}`; break;
      }
      case "branch.publish": conn.branch = a.branch; body = `const result = await layerfs.branch.publish(${a.commit ? `{ commit: ${J(a.commit)} }` : ""});\n${print}`; break;
      case "fs.read":
        if (a.ref !== "main") conn.branch = a.ref;
        body = `const result = await ${onRef(a.ref)}.read(${J(a.path)}${a.commit ? `, { commit: ${J(a.commit)} }` : ""});\n${print}`; break;
      case "fs.list": if (a.ref !== "main") conn.branch = a.ref; body = `const result = await ${onRef(a.ref)}.list(${J(a.path || "/")});\n${print}`; break;
      case "fs.stat": if (a.ref !== "main") conn.branch = a.ref; body = `const result = await ${onRef(a.ref)}.stat(${J(a.path)});\n${print}`; break;
      case "fs.grep": if (a.ref !== "main") conn.branch = a.ref; body = `const result = await ${onRef(a.ref)}.grep(${J(a.pattern)}, { path: ${J(a.path || "/")} });\n${print}`; break;
      case "fs.diff_files": {
        if (a.ref !== "main") conn.branch = a.ref;
        const sel = (x) => `{ path: ${J(x.path)}${x.commit ? `, commit: ${J(x.commit)}` : ""} }`;
        body = `const result = await ${onRef(a.ref)}.diff_files({\n  left: ${sel(a.left)},\n  right: ${sel(a.right)},\n});\n${print}`; break;
      }
      case "fs.write": conn.branch = a.branch; body = `const result = await layerfs.fs.write(${J(a.path)}, ${J(a.content)});\n${print}`; break;
      case "fs.edit": conn.branch = a.branch; body = `const result = await layerfs.fs.edit(${J(a.path)}, {\n  oldText: ${J(a.oldText)},\n  newText: ${J(a.newText)},\n});\n${print}`; break;
      case "fs.mkdir": conn.branch = a.branch; body = `const result = await layerfs.fs.mkdir(${J(a.path)}${a.recursive ? ", { recursive: true }" : ""});\n${print}`; break;
      case "fs.remove": conn.branch = a.branch; body = `const result = await layerfs.fs.remove(${J(a.path)}${a.recursive ? ", { recursive: true }" : ""});\n${print}`; break;
      case "fs.cp": conn.branch = a.branch; body = `const result = await layerfs.fs.cp(${J(a.from)}, ${J(a.to)});\n${print}`; break;
      case "fs.mv": conn.branch = a.branch; body = `const result = await layerfs.fs.mv(${J(a.from)}, ${J(a.to)});\n${print}`; break;
      case "fs.apply": {
        conn.branch = a.branch;
        const lines = a.changes.map((c) => "  " + JSON.stringify(c).replace(/"(\w+)":/g, "$1: ").replace(/,(?=\w+: )/g, ", ").replace(/^\{/, "{ ").replace(/\}$/, " }") + ",");
        body = `const result = await layerfs.fs.apply([\n${lines.join("\n")}\n]);\n${print}`; break;
      }
      case "sandbox.create": body = `const sandbox = await layerfs.sandbox.create();\nconsole.log(JSON.stringify({ id: sandbox.id }));`; break;
      case "sandbox.list": body = `const result = await layerfs.sandbox.list();\n${print}`; break;
      case "sandbox.mount": body = `${sb()}const path = await sandbox.mount({ branch: ${J(a.branch)} });\nconsole.log(JSON.stringify({ sandbox: sandbox.id, path }));`; break;
      case "sandbox.list_mounts": body = `${sb()}const result = await sandbox.list_mounts();\n${print}`; break;
      case "sandbox.list_processes": body = `${sb()}const result = await sandbox.list_processes();\n${print}`; break;
      case "sandbox.exec":
        body = a.background
          ? `${sb()}const proc = await sandbox.exec(${J(a.path)}, ${J(a.command)}, {\n  background: true,\n});\nconsole.log(JSON.stringify({ process: proc.id }));`
          : `${sb()}const result = await sandbox.exec(${J(a.path)}, ${J(a.command)});\n${print}`;
        break;
      case "process.cancel": body = `${sb()}const proc = await sandbox.get_process(${J(a.process)});\nconst result = await proc.cancel();\n${print}`; break;
      case "sandbox.status": body = `${sb()}const result = await sandbox.status(${J(a.path)});\n${print}`; break;
      case "sandbox.commit": body = `${sb()}const result = await sandbox.commit(${J(a.path)}${a.force ? ", { force: true }" : ""});\n${print}`; break;
      case "sandbox.unmount": body = `${sb()}const result = await sandbox.unmount(${J(a.path)});\n${print}`; break;
      case "sandbox.close": body = `${sb()}const result = await sandbox.close();\n${print}`; break;
      default: body = `// ${step.call}`;
    }
    const connArgs = Object.keys(conn).length
      ? `{\n${Object.entries(conn).map(([k, v]) => `  ${k}: ${J(v)},`).join("\n")}\n}`
      : "";
    return `node --input-type=module <<'JS'\nimport { LayerFS } from "@layerfs/sdk";\nconst layerfs = await LayerFS.connect(${connArgs});\n${body}\nJS`;
  }

  // ---------------------------------------------------------------- scenarios
  // Runs every step on a fresh model; records outcome, snapshot and the check.
  function runScenario(scn) {
    const sim = new Sim();
    const steps = [];
    const initial = sim.snapshot();
    for (const [i, st] of scn.steps.entries()) {
      const before = sim.snapshot();
      const outcome = sim.run(st.call, st.args);
      const after = sim.snapshot();
      let pass = outcome.code === st.expect;
      let why = pass ? "" : `expected ${st.expect}, got ${outcome.code}`;
      if (pass && st.check) {
        try {
          const r = st.check(outcome.result || outcome.refusal, after);
          if (r !== true) { pass = false; why = typeof r === "string" ? r : "check failed"; }
        } catch (e) { pass = false; why = "check threw: " + e.message; }
      }
      steps.push({ index: i, ...st, outcome, before, after, pass, why, script: scriptFor(st, scn.project) });
    }
    return { scenario: scn, initial, steps, sim };
  }

  const api = { Sim, Refusal, applyChanges, diffTrees, lineDiff, treeKey, scriptFor, runScenario, childrenOf, parentOf, baseName };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.LayerSim = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
