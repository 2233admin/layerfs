// The agents of a replayed multi-agent run (issue #347, Crew): the lead plays
// as root and starts each role as a subagent; the roles run at the same time.
// Order between agents comes only from the mock's waits, never from time:
//   - a dependency joins two steps of different agents that touch the same
//     Branch where at least one of them writes it (a fs write, a Commit, a
//     merge or fork into it, a publish into main), in the recorded order of
//     those touches: a write waits for the last write and the reads since; a
//     read (a mount, a merge or fork from it, a publish from it) waits for the
//     last write;
//   - a Sandbox the lead creates for a role comes after the role's earlier
//     steps and before its next one;
//   - a role's steps are cut into turns only where a dependency enters (the
//     turn starts there) or leaves (the turn ends there);
//   - the lead sends each turn's start (subagent, then send_message) and waits
//     (`reply until`) for the turns whose steps something depends on, all in
//     recorded order, so every dependency holds and nothing else is serialized.

/** The Branches a kept step's calls read and write: { reads: Set, writes: Set }, with each touch's recorded start. */
function touches(calls, wsBranch) {
  const out = [];
  const read = (branch, at) => branch && out.push({ branch, write: false, at });
  const write = (branch, at) => branch && out.push({ branch, write: true, at });
  const from = (ref) => (ref == null || ref === "main" || /^L[0-9]+$/.test(ref) ? "main" : ref.replace(/#[0-9]+$/, ""));
  for (const c of calls) {
    const at = c.at ?? 0;
    if (c.op === "write") write(c.branch, at);
    else if (c.op === "fork") { read(from(c.from), at); write(c.name, at); }
    else if (c.op === "merge") { read(c.a, at); read(c.b, at); write(c.name, at); }
    else if (c.op === "publish") { read(c.branch, at); write("main", at); }
    else if (c.op === "mount") { wsBranch.set(c.ws, c.branch); read(c.branch, at); }
    else if (c.op === "commit") write(wsBranch.get(c.ws), at);
  }
  return out;
}

/** Dependencies between kept steps of different agents: Map<step index, Set<step index it waits for>>. */
export function dependencies(kept) {
  const wsBranch = new Map(), byBranch = new Map();
  kept.forEach((s, i) => {
    for (const t of touches(s.calls, wsBranch)) {
      if (!byBranch.has(t.branch)) byBranch.set(t.branch, []);
      byBranch.get(t.branch).push({ ...t, i });
    }
  });
  const waits = new Map(kept.map((_, i) => [i, new Set()]));
  // a create for another agent replaces that agent's Sandbox: it waits for the
  // agent's earlier steps, and the agent's next step waits for it
  kept.forEach((s, i) => {
    for (const c of s.calls.filter((x) => x.op === "create" && x.for)) {
      const before = kept.findLastIndex((x, j) => j < i && x.step.agent === c.for);
      const after = kept.findIndex((x, j) => j > i && x.step.agent === c.for);
      if (before >= 0) waits.get(i).add(before);
      if (after >= 0) waits.get(after).add(i);
    }
  });
  for (const list of byBranch.values()) {
    list.sort((a, b) => a.at - b.at || a.i - b.i);
    let lastWrite = null, readsSince = [];
    for (const t of list) {
      const add = (j) => { if (j !== null && kept[j].step.agent !== kept[t.i].step.agent) waits.get(t.i).add(j); };
      add(lastWrite);
      if (t.write) { for (const r of readsSince) add(r); lastWrite = t.i; readsSince = []; } else readsSince.push(t.i);
    }
  }
  return waits;
}

/**
 * The scenario's agents.
 * @param {object[]} kept the kept steps in recorded order ({ step: { agent, label }, calls, start })
 * @param {(i: number) => object[]} stepsOf the scenario steps (a pause and a bash step) of kept step i
 * @returns {Record<string, object[]>} root's steps and each role's
 */
export function assemble(kept, stepsOf) {
  const waits = dependencies(kept);
  const feeds = new Set([...waits.values()].flatMap((s) => [...s]));
  const roles = [...new Set(kept.map((s) => s.step.agent))].filter((a) => a !== "root");
  // each role's turns: cut where a dependency enters or leaves
  const turnOf = new Map(), turns = new Map(roles.map((r) => [r, []]));
  kept.forEach((s, i) => {
    const agent = s.step.agent;
    if (agent === "root") return;
    const list = turns.get(agent), last = list.at(-1);
    const startsHere = !last || waits.get(i).size > 0 || feeds.has(last.at(-1));
    if (startsHere) list.push([i]); else last.push(i);
    turnOf.set(i, list.length - 1);
  });
  const agents = { root: [] };
  for (const role of roles) {
    agents[role] = turns.get(role).flatMap((turn, k) => [
      ...turn.flatMap((i) => stepsOf(i)),
      { reply: k === turns.get(role).length - 1 ? `${role}: done.` : `${role}: turn ${k + 1} done, through ${kept[turn.at(-1)].step.label}.` },
    ]);
  }
  // the lead's own steps, the turn starts and the waits, in recorded order
  const events = [];
  kept.forEach((s, i) => {
    if (s.step.agent === "root") events.push({ i, start: s.start });
    else if (turns.get(s.step.agent)[turnOf.get(i)][0] === i) events.push({ i, start: s.start, turn: turnOf.get(i) });
  });
  events.sort((a, b) => a.start - b.start || a.i - b.i);
  const open = new Map(), started = new Set();
  const waitFor = (children, why) => {
    const list = [...children].filter((c) => open.get(c));
    if (!list.length) return;
    agents.root.push({ reply: `Waiting for ${list.join(", ")}: ${why}.`, until: list });
    for (const c of list) open.set(c, false);
  };
  for (const e of events) {
    const s = kept[e.i], agent = s.step.agent;
    const need = new Set([...waits.get(e.i)].map((j) => kept[j].step.agent).filter((a) => a !== "root"));
    if (agent !== "root") need.add(agent);
    need.delete(agent === "root" ? null : undefined);
    waitFor([...need].filter((c) => c !== agent || open.get(c)), `${s.step.label} comes next`);
    if (agent === "root") { agents.root.push(...stepsOf(e.i)); continue; }
    if (!started.has(agent)) {
      agents.root.push({ subagent: { description: agent, prompt: `You are ${agent} of the Crew run. Each turn replays your recorded steps from the one the lead names; report when they are done.` } });
      started.add(agent);
    } else {
      agents.root.push({ send_message: { agent_id: `@${agent}`, message: `Go on from ${s.step.label}.` } });
    }
    open.set(agent, true);
  }
  waitFor(roles, "the run ends with every role done");
  agents.root.push({ reply: "Done." });
  return agents;
}
