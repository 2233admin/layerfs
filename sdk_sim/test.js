// Headless check: runs every scenario and reports each step's outcome.
// Usage: node sdk_sim/test.js
"use strict";
const { runScenario } = require("./simulation_engine/model.js");
const SCENARIOS = require("./scenarios.js");

let failed = 0, total = 0;
for (const scn of SCENARIOS) {
  const run = runScenario(scn);
  for (const st of run.steps) {
    total++;
    const tag = st.pass ? "ok  " : "FAIL";
    if (!st.pass) failed++;
    console.log(`${tag} ${scn.id.padEnd(12)} ${String(st.index + 1).padStart(2)} ${st.call.padEnd(22)} ${st.outcome.code}${st.pass ? "" : "  <- " + st.why}`);
  }
}
console.log(`\n${total - failed}/${total} steps match their expected outcome`);
process.exit(failed ? 1 : 0);
