// Headless run of every demo story. Usage: node sdk_sim/test_demo.js
"use strict";
const { Sim } = require("./model.js");
const { Engine } = require("./terminal.js");
const SCN = require("./scenarios.js");
const STORIES = require("./demo.js");
let failed = 0, total = 0;
const TRACE = (process.env.TRACE || "").split(",").filter(Boolean).map(Number); // TRACE=11,17 prints those steps of the agents story
for (const [key, story] of Object.entries(STORIES)) {
console.log(`\n# ${key}: ${story.title}`);
const DEMO = story.steps;
const sim = new Sim();
sim.run("project.init", { name: "website", files: SCN[0].steps[0].args.files });
const e = new Engine(sim, "website");
const fsState = {}, panes = {}, agents = {};
let active = "main";
if (story.roster) e.actor = "lead";
DEMO.forEach((st, i) => {
  let calls = [], label;
  if (st.branch) active = st.branch;
  if (st.ui === "agents") {
    for (const a of st.agents) agents[a] = { name: a, branch: st.branch, sandbox: null, open: null, sticky: null, server: null };
    calls = [{ outcome: { code: "ok" } }]; label = `[agents] ${st.agents.join(", ")} on ${st.branch}`;
  } else if (st.milestone) {
    calls = [{ outcome: { code: "ok" } }]; label = `[milestone] ${st.milestone} ${st.pct}%`;
  } else if (st.agent || st.burst) {
    // The same timeline the player uses: mounts, runs and commits in time order.
    let code = "(none)";
    for (const ev of STORIES.schedule(st)) {
      const a = agents[ev.who];
      let rec = null;
      if (ev.phase === "stop") rec = e.agentStop(a);
      else if (ev.phase === "mount") { rec = e.agentMount(a, st.on); if (a.open) rec = null; }
      else if (ev.phase === "exec" && a.open) rec = e.agentExec(a, ev.line);
      else if (ev.phase === "done" && a.open) rec = e.agentFinish(a);
      if (!rec) continue;
      code = rec.code;
      if (TRACE.includes(i + 1)) [`  [${ev.who} ${ev.phase} @${ev.t}]`, ...rec.lines.map((l) => l.t)].forEach((t) => console.log("       " + t));
    }
    calls = [{ outcome: { code } }]; label = st.burst ? `burst ${st.burst.map(([a]) => a).join("+")}` : `${st.agent}> ${st.lines[0]}`;
  } else if (st.ui === "open" || st.ui === "split") {
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
      if (story.roster && TRACE.includes(i + 1)) rec.lines.forEach((l) => console.log("       " + l.t));
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
