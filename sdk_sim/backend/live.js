// The live backend: the real product through the local server
// (server/server.mjs), which runs the JS SDK. The server answers each call
// with the simulator's outcome envelope and its mirror of the project in the
// simulator's shape, so terminal.js, files.js and tui.html read it like the
// model. Commands really run in the Workspace (`simulated` is false).
//
// Saved trees load on first use: `s.roots` returns an empty tree for a root
// it has not fetched yet, fetches it, and calls `onchange` when it arrives.
(function (global) {
  "use strict";
  const EMPTY = Object.freeze({});

  class LiveBackend {
    constructor(base = "") {
      this.base = base;
      this.live = true;
      this.simulated = false;
      this.trees = {};
      this.loading = {};
      this.onchange = null;
      this.version = null;
      this.state = null;
    }
    get s() { return this.state; }
    set s(_) { /* the server owns the state: saved worlds are not restored */ }

    async request(method, path, body) {
      const response = await fetch(this.base + path, method === "GET" ? {} : {
        method, headers: { "content-type": "application/json" }, body: JSON.stringify(body || {}),
      });
      const answer = await response.json();
      if (!response.ok) throw new Error(`${path}: ${answer.error}`);
      return answer;
    }
    adopt(state) {
      const roots = new Proxy({}, { get: (_, root) => (typeof root === "string" ? this.tree(root) : undefined) });
      this.state = { ...state.s, roots };
      this.version = state.version;
    }
    tree(root) {
      if (this.trees[root]) return this.trees[root];
      if (!/^R\d+$/.test(root)) return undefined;
      if (!this.loading[root]) {
        this.loading[root] = this.request("POST", "/api/tree", { root }).then((answer) => {
          this.trees[root] = answer.tree;
          if (this.onchange) this.onchange();
        }, (error) => console.warn(`tree ${root}: ${error.message}`));
      }
      return EMPTY;
    }
    /** A fresh project on the server: new volume, Init of the fixture. */
    async reset() {
      this.trees = {}; this.loading = {};
      const answer = await this.request("POST", "/api/reset");
      this.adopt(answer.state);
      return { ok: true, code: "Initialized", result: { kind: "Initialized" } };
    }
    async run(name, args) {
      const started = performance.now();
      const answer = await this.request("POST", "/api/call", { name, args });
      this.adopt(answer.state);
      const outcome = answer.outcome;
      outcome.timing = { ...outcome.timing, totalMs: performance.now() - started };
      return outcome;
    }
    /** Store size: not reported by the product yet (issue #329 D). */
    storage() { return null; }
    /** A Workspace's overlay rows as inspect.snapshot reports them; no bytes yet. */
    overlayOf(ws) { return ws && ws.overlay ? { inodes: ws.overlay.inodes, entries: ws.overlay.entries } : null; }
    /** Picks up changes made outside a call (a process that exits). */
    async poll() {
      const answer = await this.request("GET", `/api/state?since=${this.version}`);
      if (!answer.state) return false;
      this.adopt(answer.state);
      return true;
    }
    async close() { return this.request("POST", "/api/close"); }

    liveMountsOf(branch) {
      const s = this.state, out = [];
      for (const id of s.sandboxOrder) {
        const sb = s.sandboxes[id];
        if (sb.closed) continue;
        for (const p of sb.wsOrder) if (sb.workspaces[p].mounted && sb.workspaces[p].branch === branch) out.push(`${id}:${p}`);
      }
      return out;
    }
    // Like Sim.resolve: "main", a Branch, "C3", "L1", or a live view.
    resolve(ref) {
      const s = this.state, refuse = (code, message) => { throw Object.assign(new Error(message), { code }); };
      if (ref === "main") {
        const l = s.layers[s.main.head];
        return { label: `main @ ${l.id}`, kind: "main", root: l.root, tree: s.roots[l.root], layer: l.id };
      }
      if (/^C\d+$/.test(ref)) {
        const c = s.commits[ref] || refuse("NoSuchCommit", `no Commit ${ref}`);
        return { label: ref, kind: "commit", root: c.root, tree: s.roots[c.root], commit: ref };
      }
      if (/^L\d+$/.test(ref)) {
        const l = s.layers[ref] || refuse("NoSuchLayer", `no Layer ${ref}`);
        return { label: ref, kind: "layer", root: l.root, tree: s.roots[l.root], layer: ref };
      }
      if (ref.includes(":/")) return { label: `${ref} (live)`, kind: "live", root: null, tree: EMPTY, workspace: ref };
      const b = s.branches[ref] || refuse("NoSuchBranch", `no Branch named ${ref}`);
      const root = b.head ? s.commits[b.head].root : s.layers[b.base].root;
      return { label: `${b.name} @ ${b.head || b.base}`, kind: "branch", root, tree: s.roots[root], head: b.head };
    }
    markersIn(ws) { return ws.markers || []; }
    dirtyOf(ws) { return ws.dirty || 0; }
  }

  const api = { LiveBackend };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.LayerBackendLive = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
