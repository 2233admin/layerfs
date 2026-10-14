// Headless run of the 25-step demo. Usage: node sdk_sim/test_demo.js
"use strict";
const { Sim } = require("./model.js");
const { Engine } = require("./terminal.js");
const SCN = require("./scenarios.js");
const DEMO = require("./demo.js");
const sim = new Sim();
sim.run("project.init", { name: "website", files: SCN[0].steps[0].args.files });
const e = new Engine(sim, "website");
const fsState = {}, panes = {};
let active = "main", failed = 0;
DEMO.forEach((st, i) => {
  let calls = [], label;
  if (st.ui === "open" || st.ui === "split") {
    const o = e.openSandbox(active, st.ui === "split" ? panes[st.from].sandbox : null);
    panes[st.as] = o.binding; calls = o.rec.calls; label = `[${st.ui}] ${st.as}`;
  } else if (st.ui === "stop") {
    const b = panes[st.term], sb = sim.s.sandboxes[b.sandbox];
    const proc = sb.procOrder.find((p) => sb.processes[p].path === b.path && sb.processes[p].status === "running");
    const o = sim.run("process.cancel", { sandbox: b.sandbox, process: proc });
    calls = [{ outcome: o }]; label = `[stop] ${proc}`;
  } else {
    for (const line of st.lines) {
      const rec = st.term === "history" ? e.history(line) : st.term === "fs" ? e.fs(active, line, fsState[active] ||= {}) : e.sandbox(panes[st.term], line);
      calls = rec.calls.length ? rec.calls : calls;
      if (rec.forked) active = rec.forked;
    }
    label = `${st.term}> ${st.lines[0]}`;
  }
  const code = calls.length ? calls[calls.length - 1].outcome.code : "(none)";
  const ok = code === st.expect;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${String(i + 1).padStart(2)} ${label.padEnd(60).slice(0, 60)} ${code}${ok ? "" : "  expected " + st.expect}`);
});
console.log(failed ? `\n${failed} FAILED` : `\n${DEMO.length}/${DEMO.length} demo steps match`);
process.exit(failed ? 1 : 0);
