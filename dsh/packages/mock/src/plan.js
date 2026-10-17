// The mock model's decision for one request, derived from the conversation
// alone: which agent this is (root, or a child known by the prompt its parent
// gave it), how far its steps got, and what it says next. Nothing is kept
// between requests, so a reload, a restart or a second viewer changes nothing.
//
// Walking the agent's assistant messages against its steps gives the
// position. A message with a tool call is one call step: a result matching
// the step's retry rule repeats it, any other error result stops the
// scenario, otherwise the next step follows. dsh's bash tool does not mark a
// command that exits non-zero, is killed or times out as an error; its result
// ends with a marker line instead ("[exit code: 1]"), which stops the
// scenario the same way. A text-only message is the
// reply step when one is due, and otherwise what the agent said while it
// waited to be woken.

/** A child's id in the subagent tool's result, and in its settled notice; a background job's id. */
const STARTED = /started subagent ([0-9a-f-]{8,})/;
const SETTLED = /subagent ([0-9a-f-]{8,}) finished/;
const JOB = /background job ([A-Za-z0-9_.:-]+)/;

/** The marker dsh's bash tool appends to a command that did not exit 0. */
const SHELL_FAILURE = /\n\[(exit code: [1-9][0-9]*|killed by signal: [^\]\n]+)\]$|\[timed out after [0-9]+ms\]/;

const textOf = (message) => (message.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
const settledId = (message) => message.role === "user" ? message.source?.childId ?? textOf(message).match(SETTLED)?.[1] : undefined;

// A run may start after a checkpoint (#352): the root's first message ends
// "from after <label>." Its steps are then the checkpoint's restore, a start
// of each child it had started (the child's prompt says which turn it starts
// at), and its steps after the checkpoint, less the first send_message to each
// restarted child (the start opens that turn). A child skips the turns it had
// finished. Nothing is kept: both come from the conversation again.
const RESUME_ROOT = / from after (.+)\.$/;
// dsh may add its own text around a child's prompt, so the marker is found anywhere in it
const RESUME_CHILD = /\(Resumed after .+?: start at your turn ([0-9]+)\.\)/;
const variants = new WeakMap();

/** The root's steps and each restarted child's skipped turns, for a run started after checkpoint `label`. */
export function resumed(scenario, label) {
  let cache = variants.get(scenario);
  if (!cache) variants.set(scenario, (cache = new Map()));
  if (cache.has(label)) return cache.get(label);
  const at = scenario.checkpoints.findIndex((c) => c.label === label), cp = scenario.checkpoints[at];
  if (!cp?.restore) { cache.set(label, null); return null; }
  const root = scenario.agents.root, prefix = root.slice(0, cp.index + 1), rest = root.slice(cp.index + 1);
  const starts = new Map(), turns = new Map();
  for (const s of prefix) {
    if (s.kind !== "call") continue;
    if (s.call.child) { starts.set(s.call.child, s); turns.set(s.call.child, (turns.get(s.call.child) ?? 0) + 1); }
    if (s.call.name === "send_message") { const c = s.call.refs.agent_id.agent; turns.set(c, (turns.get(c) ?? 0) + 1); }
  }
  const skip = new Map();
  const steps = [cp.restore];
  for (const [child, s] of starts) {
    const done = turns.get(child), left = skipTurns(scenario.agents[child], done);
    if (!left.length) continue;
    skip.set(child, done);
    steps.push({ ...s, call: { ...s.call, args: { ...s.call.args, prompt: `${s.call.args.prompt} (Resumed after ${label}: start at your turn ${done + 1}.)` } }, say: null, phase: null, delay: 0 });
  }
  const opened = new Set();
  let phase = null;
  for (const s of rest) {
    if (s.kind === "call" && s.call.name === "send_message") {
      const c = s.call.refs.agent_id.agent;
      if (skip.has(c) && !opened.has(c)) { opened.add(c); phase ??= s.phase; continue; }
    }
    steps.push(phase && !s.phase ? { ...s, phase } : s);
    phase = null;
  }
  const value = { label, restored: at + 1, root: steps, skip };
  cache.set(label, value);
  return value;
}

/** A child's steps after its first `turns` turns. */
function skipTurns(steps, turns) {
  let seen = 0, i = 0;
  while (seen < turns && i < steps.length) if (steps[i++].kind === "reply") seen++;
  return steps.slice(i);
}

/** The steps this conversation plays: the scenario's, or a resumed run's; and how many checkpoints were restored. */
export function stepsOf(scenario, agent, messages) {
  const first = messages.find((m) => m.role === "user"), text = first ? textOf(first).trim() : "";
  if (agent === "root") {
    const label = text.match(RESUME_ROOT)?.[1];
    const r = label ? resumed(scenario, label) : null;
    return r ? { steps: r.root, restored: r.restored } : { steps: scenario.agents.root, restored: 0 };
  }
  const turn = Number(text.match(RESUME_CHILD)?.[1] ?? 0);
  return { steps: turn > 1 ? skipTurns(scenario.agents[agent], turn - 1) : scenario.agents[agent], restored: 0 };
}

/** Which of the scenario's agents a conversation belongs to. */
export function agentOf(scenario, messages) {
  const first = messages.find((m) => m.role === "user");
  const text = first ? textOf(first) : "";
  for (const [agent, prompt] of scenario.prompts) if (text.includes(prompt)) return agent;
  return "root";
}

/**
 * The next reply for `agent` in `scenario`, from its `messages`:
 *   { kind: "calls", calls: [{ name, args }], say, delay, step }   answer with this tool call
 *   { kind: "text", text, delay }        answer with text, which ends the turn
 *   { kind: "error", message }           the scenario cannot go on
 * Each also carries `done` (this agent's steps finished once it is sent),
 * `of` (its steps) and `phase` (the latest `phase` at or before its step).
 */
export function nextReply(scenario, agent, messages) {
  const { steps, restored } = stepsOf(scenario, agent, messages);
  let index = 0;
  const reply = placed(steps, () => index, restored);
  const results = new Map(), settled = [];
  messages.forEach((m, k) => {
    if (m.role === "tool") results.set(String(m.toolCallId), { text: textOf(m), isError: m.isError === true });
    const id = settledId(m);
    if (id) settled.push({ id: String(id), k });
  });

  const children = new Map(), contact = new Map(), jobs = new Map();
  let attempts = 0, retrying = false, replyAt = -1;
  // the children of `until` that have not settled since the agent last
  // contacted them, counting the messages before `before`
  const unsettled = (until, before) => until.filter((child) => {
    const id = children.get(child), since = contact.get(child) ?? -1;
    return !id || !settled.some((s) => s.id === id && s.k > since && s.k < before);
  });
  // a wait whose children all settled already is not said: saying it would end
  // the turn, and no notice would come to wake the agent again
  const skipWait = (before) => {
    const step = steps[index];
    if (step?.kind === "reply" && step.until.length && !retrying && !unsettled(step.until, before).length) { index++; return true; }
    return false;
  };
  for (const [k, m] of messages.entries()) {
    if (m.role !== "assistant") continue;
    const calls = (m.content ?? []).filter((b) => b.type === "tool-call");
    if (calls.length) skipWait(k);
    if (!calls.length) {
      if (steps[index]?.kind === "reply") { index++; replyAt = k; retrying = false; }
      continue;
    }
    const step = steps[index];
    if (step?.kind !== "call") return reply({ kind: "error", message: `the conversation has a ${calls[0].name} call where ${step ? `${step.at} is a reply` : `${agent} has no steps left`}` });
    if (calls.length !== 1 || calls[0].name !== step.call.name) {
      return reply({ kind: "error", message: `${step.at} calls ${step.call.name}, but the conversation has ${calls.map((c) => c.name).join(", ")}` });
    }
    const result = results.get(String(calls[0].id));
    if (!result) return reply({ kind: "error", message: `${step.at}: the ${step.call.name} call has no result yet` });
    if (step.call.child) {
      const id = result.text.match(STARTED)?.[1];
      if (id) children.set(step.call.child, id);
      contact.set(step.call.child, k);
    }
    for (const ref of Object.values(step.call.refs ?? {})) if (ref.agent) contact.set(ref.agent, k);
    if (step.call.job) {
      const id = result.text.match(JOB)?.[1];
      if (id) jobs.set(step.call.job, id);
    }
    if (step.retry && step.retry.on.test(result.text) && attempts < step.retry.times) {
      attempts++, retrying = true;
      continue;
    }
    if (result.isError || (step.call.name === "bash" && SHELL_FAILURE.test(result.text))) {
      return reply({ kind: "error", message: `${step.at} failed, so ${agent} stops here: ${result.text.slice(-400)}` });
    }
    index++, attempts = 0, retrying = false;
  }

  skipWait(messages.length);
  const step = steps[index];
  if (!step) return reply({ kind: "text", text: "Done.", delay: 0 });
  // the first step of a later turn waits until the agent is woken
  const previous = steps[index - 1];
  if (previous?.kind === "reply" && !retrying) {
    if (previous.until.length) {
      const waiting = unsettled(previous.until, messages.length);
      if (waiting.length) return reply({ kind: "text", text: `Still waiting for ${waiting.join(" and ")}.`, delay: 0 });
    } else if (!messages.slice(replyAt + 1).some((m) => m.role === "user" && !settledId(m))) {
      return reply({ kind: "text", text: "Waiting for a message.", delay: 0 });
    }
  }
  if (step.kind === "reply") return reply({ kind: "text", text: step.text, delay: step.delay }, 1);

  const args = { ...step.call.args };
  for (const [key, ref] of Object.entries(step.call.refs ?? {})) {
    const id = ref.agent ? children.get(ref.agent) : jobs.get(ref.job);
    if (!id) return reply({ kind: "error", message: `${step.at}: no id for @${ref.agent ?? ref.job} in the results so far` });
    args[key] = id;
  }
  return reply({
    kind: "calls",
    calls: [{ name: step.call.name, args }],
    say: retrying ? "LayerFS is busy; trying again." : step.say,
    delay: retrying ? step.retry.wait : step.delay,
    step: step.at,
  });
}

/**
 * Adds the agent's position to a reply; `sent` counts the step the reply
 * finishes. `passed` lists the checkpoints (their root step index) of the
 * steps done, and `restored` how many a resumed run started after.
 */
function placed(steps, index, restored = 0) {
  return (value, sent = 0) => {
    const done = Math.min(index() + sent, steps.length);
    let phase = null;
    for (let i = Math.min(index(), steps.length - 1); i >= 0 && !phase; i--) phase = steps[i].phase ?? null;
    const passed = steps.slice(0, done).flatMap((s) => (s.checkpoint ? [s.checkpoint.index] : []));
    return { ...value, done, of: steps.length, phase, passed, restored };
  };
}

/** Names of the tools the request offers, including ones added by tool updates. */
export function offeredTools(options) {
  const names = new Set((options.tools ?? []).map((t) => t.name));
  for (const t of options.toolHistory?.tools ?? []) names.add(t.name);
  for (const u of options.toolHistory?.updates ?? []) for (const t of u.additions ?? []) names.add(t.name);
  return names;
}
