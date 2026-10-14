// Headless run of every demo story. Usage: node sdk_sim/test_demo.js
"use strict";
const { Sim } = require("./model.js");
const { Engine } = require("./terminal.js");
const SCN = require("./scenarios.js");
const STORIES = require("./demo.js");
let failed = 0, total = 0;
for (const [key, story] of Object.entries(STORIES)) {
console.log(`\n# ${key}: ${story.title}`);
const DEMO = story.steps;
const sim = new Sim();
sim.run("project.init", { name: "website", files: SCN[0].steps[0].args.files });
const e = new Engine(sim, "website");
const fsState = {}, panes = {};
let active = "main";
DEMO.forEach((st, i) => {
  let calls = [], label;
  if (st.branch) active = st.branch;
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
  total++;
});
}
console.log(failed ? `\n${failed} FAILED` : `\n${total}/${total} demo steps match`);
process.exit(failed ? 1 : 0);
