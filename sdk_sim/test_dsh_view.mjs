// Headless check of the dsh view model (@dsh-layerfs/model) on the stories
// dsh_design.html plays, plus a recorded SDK trace. Usage:
//   node sdk_sim/test_dsh_view.mjs            the dsh story and the four demo stories, on the simulator
//   node sdk_sim/test_dsh_view.mjs trace      replay dsh/packages/model/tests/fixtures/real-trace.jsonl
//   node sdk_sim/test_dsh_view.mjs live <story> <port>   one story on a running live server
// Each story's digest (agents, calls, outcomes, terminal lines, panes and
// attribution) must equal the one dsh_design.html produced before the model
// was extracted (sdk_sim at e200346e1), so nothing the views draw changed.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as X from "../dsh/packages/model/src/index.js";

const require = createRequire(import.meta.url);
const { SimBackend } = require("./simulation_engine/backend/sim.js");
const { LiveBackend } = require("./simulation_engine/backend/live.js");
const { simulateShell, liveCommand, execLines, Engine } = require("./simulation_engine/terminal.js");
const M = require("./simulation_engine/model.js");
const SCN = require("./scenarios.js");
const DEMO = require("./demo.js");
const DSH = require("./dsh_story.js");

const FIXTURE = SCN[0].steps[0].args.files;
const EXPECT = {
  dsh: "f751b1dda6fb01e2", agents: "cf5710461a5eb4cb", tour: "50a345e71f22e740", conflicts: "34ad1d097e0f681a", merge: "7c251f496e33d86c",
};
const CHECKS = { agents: 52, tour: 24, conflicts: 15, merge: 21 };

/** What the page's baseline recorded for a played view. */
function digest(w, steps) {
  const r = {
    steps, attrib: w.attrib, sbBy: w.sbBy, hist: w.hist.map((h) => [h.agent, h.text, h.group || null]),
    fs: Object.fromEntries(Object.entries(w.fsLog).map(([k, v]) => [k, v.map((x) => [x.agent, x.text])])),
    panes: Object.fromEntries(Object.entries(w.panes).map(([k, v]) => [k, [v.agent, v.lines.map((l) => l.text)]])),
    ws: Object.keys(w.ws), checks: (w.checks || []).filter((c) => c.ok).length + "/" + (w.checks || []).length,
    nodes: Object.keys(w.nodes).length, agents: Object.fromEntries(Object.entries(w.agents).map(([n, A]) => [n, A.lastLoc])),
  };
  return createHash("sha256").update(JSON.stringify(r)).digest("hex").slice(0, 16);
}

async function play(key, engine, live) {
  const demo = DEMO[key] && key !== "schedule" ? DEMO[key] : null;
  const lead = demo && demo.roster ? "lead" : "main";
  const story = demo ? X.demoFrames(demo, { lead, fixture: FIXTURE, schedule: DEMO.schedule }) : DSH.story(FIXTURE);
  const env = { live, simulateShell, liveCommand, execLines, scriptFor: M.scriptFor, diffTrees: M.diffTrees, loaded: (r, w) => !live || w.engine.trees[r] };
  const w = X.storyView(engine, { lead, demo, Engine });
  const steps = [];
  for (const st of story) {
    await X.runStep(w, st, env);
    steps.push([w.last ? w.last.agent : null, w.last ? w.last.call : null, w.last ? w.last.o.code : null, w.check ? w.check.ok : null]);
  }
  return { w, steps };
}

const OK = new Set(["Initialized", "Forked", "Ready", "Mounted", "Committed", "Merged", "Added", "Unmounted", "Closed", "Stopped", "UpToDate", "running", "ok"]);
function checkDsh(w, steps) {
  const refusals = steps.filter((s) => s[2] && !OK.has(s[2]) && !/^exit/.test(s[2]));
  assert.deepEqual(refusals.map((s) => s.slice(0, 3)), [["tester", "sandbox.commit", "Conflict"]], "the planned Conflict is the only refusal");
  assert.deepEqual(w.sbBy, { sb_01: { made: "ui-dev" }, sb_02: { made: "tester", closed: "tester" } });
  // the matrix.sh script's calls share one group
  assert.ok(w.hist.some((h) => h.text === "sandbox close sb_02" && h.group === "matrix.sh"));
  // fan-out: model-side, ×2 when tester holds two Workspaces
  return refusals.length;
}

const mode = process.argv[2] || "sim";
if (mode === "sim") {
  let total = 0, passed = 0;
  for (const key of ["dsh", "agents", "tour", "conflicts", "merge"]) {
    const engine = new SimBackend();
    const { w, steps } = await play(key, engine, false);
    const got = digest(w, steps);
    if (key === "dsh") checkDsh(w, steps);
    else {
      const ok = w.checks.filter((c) => c.ok).length;
      assert.equal(w.checks.length, CHECKS[key], `${key} checks`);
      total += w.checks.length; passed += ok;
    }
    assert.equal(got, EXPECT[key], `${key}: the view model draws what the preview drew`);
    console.log(`ok ${key.padEnd(9)} ${got}${key === "dsh" ? " · one Conflict" : ` · ${w.checks.filter((c) => c.ok).length}/${w.checks.length}`}`);
  }
  assert.equal(passed, 112);
  console.log(`PASS dsh view sim: ${passed}/${total} demo checks, dsh story unchanged`);
} else if (mode === "fanout") {
  // fan-out and poses after the matrix.sh mounts (step 32 of the dsh story)
  const engine = new SimBackend();
  const story = DSH.story(FIXTURE), env = { live: false, simulateShell, liveCommand, execLines, scriptFor: M.scriptFor, diffTrees: M.diffTrees };
  const w = X.storyView(engine, { lead: "main" });
  for (const st of story.slice(0, 33)) await X.runStep(w, st, env);
  const fan = X.fanOf(w, "tester");
  assert.equal(fan.n, 2);
  assert.equal(fan.others.length, 1);
  assert.equal(X.where(w, "tester").kind, "ws");
  assert.equal(X.ghostPose(w, fan.others[0]), "laptop");
  assert.deepEqual(X.ghostSpot("main", fan.others[0]).mode, "row");
  console.log("PASS dsh view fanout");
} else if (mode === "trace") {
  const file = process.argv[3] || new URL("../dsh/packages/model/tests/fixtures/real-trace.jsonl", import.meta.url);
  const expected = JSON.parse(readFileSync(new URL("../dsh/packages/model/tests/fixtures/real-trace.expect.json", import.meta.url), "utf8"));
  const lines = X.parseTrace(readFileSync(file, "utf8"));
  const E = new X.ReplayEngine({ project: expected.project });
  const w = X.createView(E, { lead: "main" });
  X.derive(w);
  for (const st of X.traceSteps(lines)) await X.runStep(w, st, {});
  const s = E.s;
  // Branches and heads, Sandboxes and their Workspaces, as LayerFS reported them at the end
  const branches = Object.fromEntries(s.branchOrder.map((b) => [b, E.m.real(s.branches[b].head) ?? null]));
  assert.deepEqual(branches, expected.branches);
  assert.equal(E.m.real(s.main.head), expected.mainLayer);
  assert.deepEqual(s.sandboxOrder.map((id) => [E.m.real(id), s.sandboxes[id].closed]), expected.sandboxes);
  assert.deepEqual(Object.keys(w.ws), [], "nothing mounted at the end");
  // attribution: every call in the trace is the main agent's; the script's step groups them
  for (const [node, by] of Object.entries(w.attrib)) assert.equal(by, "main", node);
  assert.ok(Object.keys(w.attrib).length >= expected.minNodes);
  assert.ok(w.hist.every((h) => h.group === expected.step) && w.hist.length > 0);
  console.log(`PASS dsh view trace: ${lines.length} lines, ${s.branchOrder.length} Branches, ${s.sandboxOrder.length} Sandboxes, ${Object.keys(w.attrib).length} attributed nodes`);
} else if (mode === "live") {
  const key = process.argv[3], port = process.argv[4] || "8327";
  const engine = new LiveBackend(`http://127.0.0.1:${port}`);
  engine.state = { project: null, main: null, roots: {}, commits: {}, layers: {}, branches: {}, branchOrder: [], sandboxes: {}, sandboxOrder: [] };
  const { w, steps } = await play(key, engine, true);
  if (key === "dsh") checkDsh(w, steps);
  else assert.equal(w.checks.filter((c) => c.ok).length, CHECKS[key], `${key} checks`);
  console.log(`PASS dsh view live ${key}: ${key === "dsh" ? "one Conflict" : `${w.checks.filter((c) => c.ok).length}/${w.checks.length}`}`);
} else {
  console.error("usage: test_dsh_view.mjs [sim|fanout|trace [file]|live <story> <port>]");
  process.exit(2);
}
