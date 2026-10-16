// VERIFICATION D2, D3 and D5 for one demo story against the real product.
// Usage: node sdk_sim/test_live.js <tour|conflicts|merge|agents>
//
// Starts the local server (server/server.mjs) on a free port, which Inits the
// offline fixture on a fresh Docker volume; plays the story through the live
// backend over HTTP; then plays it on the simulator. D2: every step's outcome
// code equals the story's expectation. D3: the graph left by both runs has the
// same shape (Branch heads, Commit parents and merge links, Layers). D5 (the
// agents story): at most five Workspaces mounted at once, the dev server's
// Workspace stays mounted and its process running while other calls commit,
// and nothing is mounted at the end. The project is closed (Sandboxes, volume)
// whatever happens. A receipt goes to core/target/issue327/verify/.
"use strict";
const { execFileSync } = require("child_process");
const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");
const { LiveBackend } = require("./simulation_engine/backend/live.js");
const { SimBackend } = require("./simulation_engine/backend/sim.js");
const SCN = require("./scenarios.js");
const { playStory, shape, STORIES } = require("./stories.js");

const REPO = join(__dirname, "..");
const key = process.argv[2];
if (!STORIES[key]) {
  console.error(`usage: test_live.js <${Object.keys(STORIES).join("|")}>`);
  process.exit(2);
}

function mounted(s) {
  const out = [];
  for (const id of s.sandboxOrder) for (const p of s.sandboxes[id].wsOrder) if (s.sandboxes[id].workspaces[p].mounted) out.push(`${id}:${p}`);
  return out;
}

(async () => {
  const started = Date.now(), story = STORIES[key], checks = [], notes = [];
  const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail: ok ? null : detail }); };
  const { startServer } = await import("./server/server.mjs");
  const server = await startServer({ port: 0 });
  const live = new LiveBackend(`http://127.0.0.1:${server.port}`);
  let results = [], liveShape = null, error = null, closed = null;
  const d5 = { most: 0, server: null, serving: [], end: null };
  try {
    await live.reset();
    // D5 peak: sampled after every call, so overlapping tool calls inside a burst count.
    const run = live.run.bind(live);
    live.run = async (...args) => { const out = await run(...args); d5.most = Math.max(d5.most, mounted(live.s).length); return out; };
    ({ results } = await playStory(live, story, { log: (r) => {
      if (r.trace !== undefined) return;
      console.log(`${r.ok ? "ok  " : "FAIL"} ${String(r.index + 1).padStart(2)} ${r.label.padEnd(60).slice(0, 60)} ${r.code}${r.ok ? "" : "  expected " + r.expect}`);
      if (!r.ok) for (const t of r.lines.slice(-12)) console.log(`       ${t}`);
      const s = live.s, now = mounted(s);
      d5.most = Math.max(d5.most, now.length);
      const running = s.sandboxOrder.flatMap((id) => s.sandboxes[id].procOrder.map((p) => ({ ...s.sandboxes[id].processes[p], key: `${id}:${s.sandboxes[id].processes[p].path}` })))
        .filter((p) => p.status === "running");
      if (running.length) d5.serving.push({ step: r.index + 1, running: running.map((p) => p.key), mounted: running.every((p) => now.includes(p.key)) });
    } }));
    liveShape = shape(live.s);
    d5.end = mounted(live.s);
  } catch (caught) {
    error = { message: caught.message, stack: caught.stack };
  } finally {
    closed = await server.stop().then(() => "closed", (e) => `close failed: ${e.message}`);
  }
  const sim = new SimBackend();
  await sim.reset(SCN[0].steps[0].args.files);
  await playStory(sim, story);
  const simShape = shape(sim.s);

  check("D2 every step's outcome code equals the story's expectation", results.length === story.steps.length && results.every((r) => r.ok),
    results.filter((r) => !r.ok).map((r) => ({ step: r.index + 1, code: r.code, expect: r.expect })));
  for (const part of ["main", "layers", "branches", "commits"])
    check(`D3 ${part} match the simulator`, liveShape && JSON.stringify(liveShape[part]) === JSON.stringify(simShape[part]), { live: liveShape && liveShape[part], sim: simShape[part] });
  if (story.roster) {
    check("D5 at most five Workspaces mounted at once", d5.most > 0 && d5.most <= 5, d5.most);
    check("D5 the server's Workspace stays mounted while it runs", d5.serving.length > 0 && d5.serving.every((x) => x.mounted), d5.serving);
    check("D5 nothing is mounted at the end", d5.end && d5.end.length === 0, d5.end);
    notes.push(`most Workspaces mounted at once, sampled after every call: ${d5.most}; server running across ${d5.serving.length} steps`);
  }
  const failed = checks.filter((c) => !c.ok);
  const outcome = error || failed.length ? "FAIL" : "PASS";
  const commit = execFileSync("git", ["-C", REPO, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const dirty = execFileSync("git", ["-C", REPO, "status", "--porcelain", "--untracked-files=no", "--", "sdk_sim", "sdk/js", "core/crates"], { encoding: "utf8" }).trim();
  const daemon = execFileSync("shasum", ["-a", "256", join(REPO, "core/target/issue327/layerfs-daemon")], { encoding: "utf8" }).slice(0, 64);
  const dir = join(REPO, "core/target/issue327/verify"), stamp = `d-${key}-${Date.now().toString(36)}`;
  mkdirSync(dir, { recursive: true });
  const record = { case: `D2/D3 ${key}`, stamp, commit, dirty: dirty ? dirty.split("\n") : [], daemon, outcome, error, closed, checks, notes,
    steps: results.map((r) => ({ step: r.index + 1, label: r.label, code: r.code, expect: r.expect })), seconds: (Date.now() - started) / 1000 };
  writeFileSync(join(dir, `${stamp}.json`), JSON.stringify(record, null, 2), { flag: "wx" });
  for (const c of checks) console.log(`${c.ok ? "ok  " : "FAIL"} ${c.name}${c.ok ? "" : `: ${JSON.stringify(c.detail).slice(0, 1200)}`}`);
  for (const n of notes) console.log(`note ${n}`);
  if (error) console.log(`ERROR ${error.message}`);
  console.log(`${outcome} ${key} in ${record.seconds.toFixed(1)} s; project ${closed}; receipt ${join(dir, `${stamp}.json`)}`);
  process.exit(outcome === "PASS" ? 0 : 1);
})();
