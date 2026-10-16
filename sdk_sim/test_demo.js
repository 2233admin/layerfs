// Headless run of every demo story on the simulator. Usage: node sdk_sim/test_demo.js
// TRACE=11,17 prints the lines of those steps.
"use strict";
const { SimBackend } = require("./simulation_engine/backend/sim.js");
const SCN = require("./scenarios.js");
const { playStory, STORIES } = require("./stories.js");

const TRACE = (process.env.TRACE || "").split(",").filter(Boolean).map(Number);
(async () => {
  let failed = 0, total = 0;
  for (const [key, story] of Object.entries(STORIES)) {
    console.log(`\n# ${key}: ${story.title}`);
    const backend = new SimBackend();
    await backend.reset(SCN[0].steps[0].args.files);
    await playStory(backend, story, { trace: story.roster ? TRACE : [], log: (r) => {
      if (r.trace !== undefined) return console.log("       " + r.trace);
      total++;
      if (!r.ok) failed++;
      console.log(`${r.ok ? "ok  " : "FAIL"} ${String(r.index + 1).padStart(2)} ${r.label.padEnd(60).slice(0, 60)} ${r.code}${r.ok ? "" : "  expected " + r.expect}`);
    } });
  }
  console.log(failed ? `\n${failed} FAILED` : `\n${total}/${total} demo steps match`);
  process.exit(failed ? 1 : 0);
})();
