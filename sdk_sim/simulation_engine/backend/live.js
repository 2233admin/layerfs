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
      this.fileReports = {};
      this.fileLoading = {};
    }
    get s() { return this.state; }
    set s(_) { /* the server owns the state: saved worlds are not restored */ }

    async request(method, path, body) {
      const response = await fetch(this.base + path, method === "GET" ? {} : {
        method, headers: { "content-type": "application/json" }, body: JSON.stringify(body || {}),
      });
      // A static file server (no /api) answers with an HTML error page.
      if (!(response.headers.get("content-type") || "").includes("application/json"))
        throw new Error(`${path}: no LayerFS server here (HTTP ${response.status}); start node sdk_sim/server/server.mjs and open this page from it`);
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
    async run(name, args = {}) {
      const started = performance.now();
      const selected = methodArgs(name,args);
      const query = new URLSearchParams({ui:"1",...(selected.view?{view:selected.view}:{})});
      const path=`/api/${selected.surface || "sdk"}/${selected.group}/${selected.method}`;
      let answer;
      if(selected.read){query.set("args",JSON.stringify(selected.args));answer=await this.request("GET",`${path}?${query}`);}
      else answer=await this.request("POST",`${path}?${query}`,{args:selected.args});
      this.adopt(answer.state);
      const outcome = answer.outcome;
      outcome.timing = { ...outcome.timing, totalMs: performance.now() - started };
      return outcome;
    }
    fileReport(ref,path) {
      const key=JSON.stringify([this.version,ref,path]);
      if(this.fileReports[key]) return this.fileReports[key];
      if(!this.fileLoading[key]) {
        const get=(group,method,args)=>this.request("GET",`/api/${group==="fs"?"sdk":"operator"}/${group}/${method}?labels=1&args=${encodeURIComponent(JSON.stringify(args))}`);
        this.fileLoading[key]=Promise.all([get("files","stats",[ref,path]),get("files","history",[ref,path,50,0]),get("fs","blame",[ref,path]).catch(error=>({value:{lines:[],versions:0,error:error.message}}))]).then(([stats,history,blame])=>{
          const f=stats.value,h=history.value,b=blame.value;
          this.fileReports[key]={...f,unique:f.canonical,pending:false,reported:true,hasMore:h.hasMore,rows:h.items.map(r=>({node:{id:r.commit,kind:r.commit.startsWith("L")?"layer":"commit",branch:r.branch||ref},change:r.change.toLowerCase(),size:r.size,added:r.newCanonical,stored:r.newStored,content:r.size===null?null:""})),blame:b};
          if(this.onchange)this.onchange();
        }).catch(error=>{this.fileReports[key]={error:error.message,rows:[],revisions:null,logical:null,unique:null,stored:null,metadata:null,pending:false};if(this.onchange)this.onchange();});
      }
      return {rows:[],revisions:null,logical:null,unique:null,stored:null,metadata:null,pending:true};
    }
    /** Store statistics reported by the product. */
    storage() { const z = this.state?.store?.stats; return z ? { ...z, store: z.file, payload: z.canonical, estimate: false } : null; }
    /** Actual overlay payload and row counts from the operator. */
    overlayOf(ws) { return ws?.overlay ?? null; }
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

  function methodArgs(name,a) {
    let [group,method]=name.split(".");let surface="sdk",view;
    if(name==="main.fork"){group="branch";method="fork";a={...a,branch:"main"};}
    if(name==="main.list_layers"){return {surface:"operator",group:"inspect",method:"snapshot",args:[],read:true,view:"layers"};}
    if(name==="sandbox.list_processes"){return {surface:"operator",group:"process",method:"list",args:[a.sandbox],read:true};}
    if(name==="process.cancel"){return {surface:"operator",group:"process",method:"cancel",args:[a.sandbox,a.process],read:false};}
    if(name==="sandbox.exec"&&a.background){return {surface:"operator",group:"process",method:"start",args:[a.sandbox,a.path,a.command],read:false};}
    const keys={
      "project.list_branches":[a.pageSize,a.pagePos],"branch.fork":[a.name,a.fromCommit||a.branch||"main"],"branch.list_commits":[a.branch,a.pageSize,a.pagePos],
      "branch.diff_commits":[a.from,a.to,a.pageSize,a.pagePos],"branch.diff_branches":[a.from,a.to,a.pageSize,a.pagePos],"branch.publish":[a.branch,a.commit],"branch.merge":[a.branch,a.with,a.name,a.message],
      "fs.read":[a.commit||a.ref,a.path,a.startLine,a.endLine],"fs.list":[a.ref,a.path,a.pageSize,a.pagePos],"fs.stat":[a.ref,a.path],"fs.grep":[a.ref,a.pattern,a.path,a.pageSize,a.pagePos],"fs.blame":[a.commit||a.ref,a.path,a.fromLine],
      "fs.write":[a.branch,a.path,a.content,a.message],"fs.edit":[a.branch,a.path,a.oldText,a.newText,a.message],"fs.mkdir":[a.branch,a.path,a.message],"fs.rm":[a.branch,a.path,a.message],"fs.cp":[a.branch,a.from,a.to,a.message],"fs.mv":[a.branch,a.from,a.to,a.message],"fs.apply":[a.branch,a.changes,a.message],
      "sandbox.create":[a.name,a.project,a.image],"sandbox.mount":[a.sandbox,a.branch],"sandbox.exec":[a.sandbox,a.path,a.command,a.message],"sandbox.status":[a.sandbox,a.path],"sandbox.commit":[a.sandbox,a.path,a.message,!!a.force],"sandbox.unmount":[a.sandbox,a.path,!!a.discard],"sandbox.close":[a.sandbox],
    };
    if(group==="fs"&&method==="diff_files")keys[name]=[a.left.commit||a.ref,a.left.path,a.right.commit||a.ref,a.right.path];
    const read=new Set(["list_branches","list_commits","diff_commits","diff_branches","read","list","stat","grep","glob","diff_files","blame","status"]).has(method);
    return {surface,group,method,args:keys[`${group}.${method}`],read,view};
  }

  const api = { LiveBackend };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.LayerBackendLive = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
