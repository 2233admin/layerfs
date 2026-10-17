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
  const steps = scenario.agents[agent];
  let index = 0;
  const reply = placed(steps, () => index);
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

/** Adds the agent's position to a reply; `sent` counts the step the reply finishes. */
function placed(steps, index) {
  return (value, sent = 0) => {
    const done = Math.min(index() + sent, steps.length);
    let phase = null;
    for (let i = Math.min(index(), steps.length - 1); i >= 0 && !phase; i--) phase = steps[i].phase ?? null;
    return { ...value, done, of: steps.length, phase };
  };
}

/** Names of the tools the request offers, including ones added by tool updates. */
export function offeredTools(options) {
  const names = new Set((options.tools ?? []).map((t) => t.name));
  for (const t of options.toolHistory?.tools ?? []) names.add(t.name);
  for (const u of options.toolHistory?.updates ?? []) for (const t of u.additions ?? []) names.add(t.name);
  return names;
}
