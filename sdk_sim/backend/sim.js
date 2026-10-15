// The simulator backend: the model in this page (model.js), behind the same
// asynchronous surface as backend/live.js. Shell commands are simulated
// (terminal.js simulateShell), so `simulated` is true.
(function (global) {
  "use strict";
  const M = typeof module !== "undefined" && module.exports ? require("../model.js") : global.LayerSim;

  class SimBackend {
    constructor() {
      this.sim = new M.Sim();
      this.live = false;
      this.simulated = true;
    }
    get s() { return this.sim.s; }
    set s(world) { this.sim.s = world; }
    /** A fresh project: Init of `files` as main's first Layer. */
    async reset(files) {
      this.sim = new M.Sim();
      return this.sim.run("project.init", { name: "website", files });
    }
    /** One call; the outcome envelope of Sim.run. */
    async run(name, args) { return this.sim.run(name, args); }
    liveMountsOf(branch) { return this.sim.liveMountsOf(branch); }
    resolve(ref) { return this.sim.resolve(ref); }
    markersIn(ws) { return this.sim.markersIn(ws); }
    dirtyOf(ws) { return M.diffTrees(this.sim.s.roots[ws.baseRoot], ws.live).length; }
    async poll() { return false; }
    async close() {}
  }

  const api = { SimBackend };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.LayerBackendSim = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
