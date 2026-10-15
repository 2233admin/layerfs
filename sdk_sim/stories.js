// Plays a demo story (demo.js) headlessly on a backend, in the order the
// player in tui.html plays it: each step's calls, an agent step's tool calls
// on their timeline (mount, run, commit, unmount). Used by test_demo.js
// (simulator) and test_live.js (live). `shape` is the graph a story leaves,
// for comparing the two backends (VERIFICATION D3).
"use strict";
const { Engine } = require("./terminal.js");
const STORIES = require("./demo.js");

/** Runs every step once; returns [{ index, label, code, expect, ok, lines }]. */
async function playStory(backend, story, { trace = [], log = () => {} } = {}) {
  const e = new Engine(backend, "website");
  const fsState = {}, panes = {}, agents = {}, results = [];
  let active = "main";
  if (story.roster) e.actor = "lead";
  for (const [i, st] of story.steps.entries()) {
    let calls = [], label, lines = [];
    if (st.branch) active = st.branch;
    if (st.ui === "agents") {
      for (const a of st.agents) agents[a] = { name: a, branch: st.branch, sandbox: null, open: null, sticky: null, server: null };
      calls = [{ outcome: { code: "ok" } }]; label = `[agents] ${st.agents.join(", ")} on ${st.branch}`;
    } else if (st.milestone) {
      calls = [{ outcome: { code: "ok" } }]; label = `[milestone] ${st.milestone} ${st.pct}%`;
    } else if (st.agent || st.burst) {
      // The player's timeline: mounts, runs and commits in time order.
      let code = "(none)";
      for (const ev of STORIES.schedule(st)) {
        const a = agents[ev.who];
        let rec = null;
        if (ev.phase === "stop") rec = await e.agentStop(a);
        else if (ev.phase === "mount") { rec = await e.agentMount(a, st.on); if (a.open) rec = null; }
        else if (ev.phase === "exec" && a.open) rec = await e.agentExec(a, ev.line);
        else if (ev.phase === "done" && a.open) rec = await e.agentFinish(a);
        if (!rec) continue;
        code = rec.code;
        lines.push(`  [${ev.who} ${ev.phase}]`, ...rec.lines.map((l) => "  " + l.t));
      }
      calls = [{ outcome: { code } }]; label = st.burst ? `burst ${st.burst.map(([a]) => a).join("+")}` : `${st.agent}> ${st.lines[0]}`;
    } else if (st.ui === "open" || st.ui === "split") {
      const o = await e.openSandbox(active, st.ui === "split" ? panes[st.from].sandbox : null);
      panes[st.as] = o.binding; calls = o.rec.calls; label = `[${st.ui}] ${st.as}`; lines = o.rec.lines.map((l) => l.t);
    } else if (st.ui === "stop") {
      const b = panes[st.term], sb = backend.s.sandboxes[b.sandbox];
      const proc = sb.procOrder.find((p) => sb.processes[p].path === b.path && sb.processes[p].status === "running");
      const o = await backend.run("process.cancel", { sandbox: b.sandbox, process: proc });
      calls = [{ outcome: o }]; label = `[stop] ${proc}`;
    } else {
      for (const line of st.lines) {
        const rec = st.term === "history" ? await e.history(line) : st.term === "fs" ? await e.fs(active, line, fsState[active] ||= {}) : await e.sandbox(panes[st.term], line);
        lines.push(...rec.lines.map((l) => l.t));
        calls = rec.calls.length ? rec.calls : calls;
        if (rec.forked) active = rec.forked;
      }
      label = `${st.term}> ${st.lines[0]}`;
    }
    const code = calls.length ? calls[calls.length - 1].outcome.code : "(none)";
    const expect = backend.live && st.live ? st.live : st.expect;
    const result = { index: i, label, code, expect, ok: code === expect, lines };
    results.push(result);
    log(result);
    if (trace.includes(i + 1)) for (const t of lines) log({ trace: t });
  }
  return { results, engine: e };
}

/** The graph a story leaves: what VERIFICATION "Equivalence" compares. */
function shape(s) {
  const n = (id) => Number(String(id).slice(1));
  return {
    main: s.main.head,
    layers: Object.values(s.layers).sort((a, b) => n(a.id) - n(b.id)).map((l) => [l.id, l.parent, l.sourceBranch, l.sourceCommit]),
    branches: [...s.branchOrder].sort().map((name) => { const b = s.branches[name]; return [name, b.base, b.head || null, b.from]; }),
    commits: Object.values(s.commits).sort((a, b) => n(a.id) - n(b.id))
      .map((c) => [c.id, c.branch, c.parent || null, c.mergedFrom || null, c.merged ? c.merged.from : null, c.by]),
  };
}

module.exports = { playStory, shape, STORIES };
