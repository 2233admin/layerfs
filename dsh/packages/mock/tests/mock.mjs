// The LayerFS mock model without dsh: every demo scenario played through a
// stand-in for dsh's agent loop (tool results made up here, children
// settling back to their parent, send_message waking a child), then the
// scenario checks and the adapter's chunk stream.
//   node packages/mock/tests/mock.mjs
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdapter } from "../src/adapter.js";
import { agentOf, nextReply } from "../src/plan.js";
import { Progress } from "../src/progress.js";
import { compileScenario, loadScenarios, ScenarioError } from "../src/scenario.js";

const scenarios = loadScenarios(fileURLToPath(new URL("../../../scenarios/", import.meta.url)));
assert.deepEqual([...scenarios.keys()], ["tour", "parallel", "conflicts", "merge", "sandbox", "agents", "shop"]);
assert.equal(scenarios.get("shop").live, true, "a replayed run plays only on Live LayerFS");
assert.equal(scenarios.get("agents").speed, 2, "5 agents plays at 2× as the original did");
assert.equal(scenarios.get("tour").speed, 1);
// a run step imports the scenario's lib and awaits each call
assert.match(scenarios.get("tour").agents.root[0].call.args.command, /^node --input-type=module <<'JS'\nconst t = await import\("file:\/\/\/.*\/scenarios\/shared\/terminal\.mjs"\);\nawait t\.history\("fork feature-home"\);\nJS$/);

let n = 0;
const id = (prefix) => `${prefix}-${String(++n).padStart(8, "0")}-0000-4000-8000-000000000000`;
const textMessage = (role, text, source) => ({ role, id: `m${++n}`, source, content: [{ type: "text", text }] });

/**
 * Plays a scenario the way dsh runs it: each agent is a conversation; a model
 * request is made whenever an agent has something new to answer. `busyOnce`
 * makes the first bash result of that agent read Busy (as LayerFS answers
 * when another process changes its records).
 */
function play(scenario, { busyOnce = null, progress = null } = {}) {
  const agents = new Map(), calls = [];
  const start = (name, firstText, parent) => {
    const agent = { name, id: id("a"), parent, messages: [textMessage("user", firstText, { kind: "user" })], awake: true, busyUsed: false };
    agents.set(agent.id, agent);
    return agent;
  };
  const root = start("root", "Run the demo.", null);
  for (let requests = 0; requests < 2000; requests++) {
    const agent = [...agents.values()].find((a) => a.awake);
    if (!agent) break;
    assert.equal(agentOf(scenario, agent.messages), agent.name, `${scenario.name}: ${agent.name}'s conversation is recognised`);
    const reply = nextReply(scenario, agent.name, agent.messages);
    progress?.report(scenario.name, agent.name, reply, agent.id);
    assert.notEqual(reply.kind, "error", `${scenario.name}/${agent.name}: ${reply.message}`);
    if (reply.kind === "text") {
      agent.messages.push(textMessage("assistant", reply.text, { kind: "model" }));
      agent.awake = false;
      const parent = agent.parent && agents.get(agent.parent);
      if (parent) {
        parent.messages.push(textMessage("user", `Background subagent ${agent.id} finished and will do no further work unless you send it more.`, { kind: "subagent-settled", form: "notice" }));
        parent.awake = true;
      }
      continue;
    }
    assert.equal(reply.calls.length, 1, "one call per step");
    const [call] = reply.calls, callId = `c${++n}`;
    calls.push({ agent: agent.name, ...call });
    agent.messages.push({ role: "assistant", id: `m${++n}`, source: { kind: "model" }, content: [...(reply.say ? [{ type: "text", text: reply.say }] : []), { type: "tool-call", id: callId, name: call.name, arguments: JSON.stringify(call.args) }] });
    let result = "ok", isError = false;
    if (call.name === "bash") {
      assert.match(call.args.command, /^node --input-type=module <<'JS'\n[\s\S]*\nJS$/);
      if (busyOnce === agent.name && !agent.busyUsed) {
        agent.busyUsed = true;
        result = "LayerFSError: Busy: another process owns this discovery mutation";
        isError = true;
      } else if (call.args.run_in_background) result = `started background job job_${++n}`;
    } else if (call.name === "subagent") {
      const child = start(call.args.description, `${call.args.prompt}\n\n(Working directory: /ws)`, agent.id);
      result = `started subagent ${child.id}`;
    } else if (call.name === "send_message") {
      const child = agents.get(call.args.agent_id);
      assert.ok(child, `${call.args.agent_id} is a started child`);
      child.messages.push(textMessage("user", call.args.message, { kind: "agent-message" }));
      child.awake = true;
      result = `message delivered to ${child.id}`;
    } else if (call.name === "job_output" || call.name === "job_kill") {
      assert.match(call.args.job_id, /^job_\d+$/, "a job reference resolves to the job id");
    }
    agent.messages.push({ role: "tool", id: `m${++n}`, source: { kind: "tool", callId }, toolCallId: callId, isError, content: [{ type: "text", text: result }] });
  }
  // every agent said its closing reply last
  for (const agent of agents.values()) {
    const steps = scenario.agents[agent.name];
    const said = agent.messages.filter((m) => m.role === "assistant" && !m.content.some((b) => b.type === "tool-call")).map((m) => m.content[0].text);
    assert.equal(said.at(-1), steps.at(-1).text, `${scenario.name}/${agent.name} ends with its closing reply`);
  }
  return { calls, agents: [...agents.values()].map((a) => a.name), root };
}

// every demo plays to the end, every agent started, every step called once;
// its progress ends done with every step of every agent counted
const progress = new Progress(scenarios);
for (const [name, scenario] of scenarios) {
  const { calls, agents, root } = play(scenario, { progress });
  const run = progress.get(name);
  assert.equal(run.root, root.id, `${name}: the run is the root Session's`);
  assert.equal(run.state, "done", `${name}: the run ends done`);
  assert.equal(run.done, Object.values(scenario.agents).reduce((n, steps) => n + steps.length, 0), `${name}: every step counted`);
  assert.equal(run.done, run.of, `${name}: done of all`);
  assert.deepEqual(new Set(agents), new Set(Object.keys(scenario.agents)), `${name}: every agent runs`);
  for (const [agent, steps] of Object.entries(scenario.agents)) {
    const want = steps.filter((s) => s.kind === "call").map((s) => s.call.name);
    assert.deepEqual(calls.filter((c) => c.agent === agent).map((c) => c.name), want, `${name}/${agent} makes its calls in order`);
  }
}

// Busy runs a step again after its retry wait
{
  const parallel = scenarios.get("parallel");
  const { calls } = play(parallel, { busyOnce: "header" });
  assert.equal(calls.filter((c) => c.agent === "header" && c.name === "bash").length, 2, "header's script runs twice");
  const header = [{ role: "user", id: "u", source: { kind: "user" }, content: [{ type: "text", text: parallel.prompts.get("header") }] }];
  const first = nextReply(parallel, "header", header);
  header.push({ role: "assistant", id: "a1", source: { kind: "model" }, content: [{ type: "tool-call", id: "x1", name: "bash", arguments: "{}" }] });
  header.push({ role: "tool", id: "t1", toolCallId: "x1", isError: true, source: { kind: "tool", callId: "x1" }, content: [{ type: "text", text: "Busy: another process owns this discovery mutation" }] });
  const again = nextReply(parallel, "header", header);
  assert.deepEqual([again.say, again.delay], ["LayerFS is busy; trying again.", 2000]);
  assert.equal(again.calls[0].args.command, first.calls[0].args.command);
}

// the root waits until every child in `until` has settled after its last contact
{
  const s = scenarios.get("parallel");
  const root = [textMessage("user", "Run the demo.", { kind: "user" })];
  const step = (reply, result) => {
    const callId = `c${++n}`;
    root.push({ role: "assistant", id: `m${++n}`, source: { kind: "model" }, content: [{ type: "tool-call", id: callId, name: reply.calls[0].name, arguments: "{}" }] });
    root.push({ role: "tool", id: `m${++n}`, toolCallId: callId, source: { kind: "tool", callId }, content: [{ type: "text", text: result }] });
  };
  const H = "11111111-1111-4111-8111-111111111111", F = "22222222-2222-4222-8222-222222222222";
  step(nextReply(s, "root", root), `started subagent ${H}`);
  step(nextReply(s, "root", root), `started subagent ${F}`);
  const waiting = nextReply(s, "root", root);
  assert.equal(waiting.text, "header and footer are working in parallel; I'll publish when they report.");
  root.push(textMessage("assistant", waiting.text, { kind: "model" }));
  root.push(textMessage("user", `Background subagent ${H} finished and will do no further work unless you send it more.`, { kind: "subagent-settled" }));
  assert.equal(nextReply(s, "root", root).text, "Still waiting for footer.");
  root.push(textMessage("assistant", "Still waiting for footer.", { kind: "model" }));
  root.push(textMessage("user", `Background subagent ${F} finished and will do no further work unless you send it more.`, { kind: "subagent-settled" }));
  const publish = nextReply(s, "root", root);
  assert.match(publish.calls[0].args.command, /branch\.publish\("header"\)/);
  step(publish, "publish header → Added");
  const message = nextReply(s, "root", root);
  assert.deepEqual([message.calls[0].name, message.calls[0].args.agent_id], ["send_message", F], "@footer resolves to footer's id");
  step(message, `message delivered to ${F}`);
  root.push(textMessage("assistant", nextReply(s, "root", root).text, { kind: "model" }));
  assert.equal(nextReply(s, "root", root).text, "Still waiting for footer.", "footer's earlier notice does not count after the message");
}

// a child's later turn starts only with a message from its parent
{
  const s = scenarios.get("agents");
  const ava = [textMessage("user", s.prompts.get("ava"), { kind: "user" })];
  const ready = nextReply(s, "ava", ava);
  assert.equal(ready.text, "Ava here, ready on checkout.");
  ava.push(textMessage("assistant", ready.text, { kind: "model" }));
  assert.equal(nextReply(s, "ava", ava).text, "Waiting for a message.");
  ava.push(textMessage("user", "sh install.sh", { kind: "agent-message" }));
  const call = nextReply(s, "ava", ava);
  assert.match(call.calls[0].args.command, /await t\.call\("ava", "checkout", "sh install\.sh"\);/);
  assert.ok(call.delay > 0, "the call waits out the agent's thinking time");
}

// an error that the retry rule does not cover stops the agent; an off-script call is reported
{
  const s = scenarios.get("tour");
  const root = [textMessage("user", "Run the demo.", { kind: "user" })];
  root.push({ role: "assistant", id: "x", source: { kind: "model" }, content: [{ type: "tool-call", id: "k", name: "bash", arguments: "{}" }] });
  root.push({ role: "tool", id: "y", toolCallId: "k", isError: true, source: { kind: "tool", callId: "k" }, content: [{ type: "text", text: "Error: NameTaken feature-home" }] });
  assert.match(nextReply(s, "root", root).message, /agents\.root\[1\] failed, so root stops here: Error: NameTaken/);
  // dsh's bash tool reports a non-zero exit, a signal or a timeout only in the text
  for (const [text, stops] of [["out\n[exit code: 1]", true], ["out\n[killed by signal: SIGKILL]", true], ["out\n[timed out after 5000ms]", true], ["out\n[exit code: 0]", false], ["ok", false]]) {
    const ran = [textMessage("user", "Run the demo.", { kind: "user" }), root[1], { ...root[2], isError: false, content: [{ type: "text", text }] }];
    const next = nextReply(s, "root", ran);
    assert.equal(next.kind === "error", stops, text);
    if (stops) assert.match(next.message, /agents\.root\[1\] failed, so root stops here/);
  }
  const off = [textMessage("user", "Run the demo.", { kind: "user" }), { role: "assistant", id: "x", source: { kind: "model" }, content: [{ type: "tool-call", id: "k", name: "job_list", arguments: "{}" }] }];
  assert.match(nextReply(s, "root", off).message, /calls bash, but the conversation has job_list/);
}

// scenario checks name the step at fault
const folder = mkdtempSync(join(tmpdir(), "lfs-mock-"));
const bad = (agents, pattern) => assert.throws(
  () => compileScenario({ type: "layerfs-mock-scenario", version: 2, title: "t", agents }, { name: "t", folder }),
  (e) => e instanceof ScenarioError && pattern.test(e.message), String(pattern));
const sh = { bash: { description: "d", command: "true" } };
bad({ root: [{ parallel: [sh] }] }, /a step is one call to one of bash, subagent, send_message/);
bad({ root: [{ bash: { description: "d", command: "true", stdin: "x" } }] }, /root\[0\]\.bash: unknown field stdin/);
bad({ root: [{ subagent: { description: "a" } }], a: [{ reply: "x" }] }, /root\[0\]\.subagent\.prompt: is required/);
bad({ root: [sh, { pause: 10 }] }, /a pause comes before a step/);
bad({ root: [{ reply: "a" }, { reply: "b" }] }, /two replies in a row/);
bad({ root: [sh, { reply: "a", until: ["x"] }, sh] }, /x is not started by an earlier step of root/);
bad({ root: [{ send_message: { agent_id: "@x", message: "m" } }] }, /"@<child>" for a child root started earlier/);
bad({ root: [{ job_output: { job_id: "@b" } }] }, /"@<job>" for a background bash step of root/);
bad({ root: [{ ...sh, as: "b" }] }, /names a background job: set run_in_background/);
bad({ root: [{ bash: { description: "d", script: "../x.mjs" } }] }, /must be a file inside the scenario folder/);
bad({ root: [sh], helper: [{ reply: "b" }] }, /agents\.helper: no subagent step starts this agent/);
bad({ root: [{ subagent: { description: "a", prompt: "do the thing" } }, { subagent: { description: "b", prompt: "do the thing now" } }], a: [{ reply: "x" }], b: [{ reply: "y" }] }, /must not contain or be contained in a's prompt/);
bad({ root: [{ ...sh, expect: "Committed" }] }, /expect: lists outcome codes/);
bad({ root: [{ subagent: { description: "a", prompt: "p" }, expect: ["x"] }], a: [{ reply: "x" }] }, /only a bash step's LayerFS calls are traced/);
mkdirSync(join(folder, "scripts"));
writeFileSync(join(folder, "scripts", "x.mjs"), "JS\n");
bad({ root: [{ bash: { description: "d", script: "scripts/x.mjs" } }] }, /a line may not read JS/);
assert.throws(() => compileScenario({ type: "layerfs-mock-scenario", version: 1, title: "t", agents: { root: [sh] } }, { name: "t", folder }), /version: must be 2/);
bad({ root: [{ bash: { description: "d", run: [["call"]] } }] }, /bash\.run: needs the scenario's lib/);
bad({ root: [{ bash: { description: "d", command: "true", run: [["call"]] } }] }, /has exactly one of script, run and command/);
writeFileSync(join(folder, "lib.mjs"), "export const go = () => {};\n");
const withLib = (extra, run) => compileScenario({ type: "layerfs-mock-scenario", version: 2, title: "t", lib: "lib.mjs", ...extra, agents: { root: [{ bash: { description: "d", run } }] } }, { name: "t", folder });
assert.equal(withLib({}, [["go", "a\"b", { run: 1 }]]).agents.root[0].call.args.command.split("\n")[2], 'await t.go("a\\"b", {"run":1});');
assert.throws(() => withLib({}, [["go()"]]), /is \[name, \.\.\.args\] with name an export of lib/);
assert.throws(() => withLib({ speed: 3 }, [["go"]]), /speed: is one of 1, 2, 4/);

// the adapter: a stub base class stands in for dsh's LlmAdapter
const adapter = createAdapter(class {}, scenarios, { typingMs: 0, intro: "What does this demo show?" });
const chunks = async (options) => { const out = []; for await (const c of adapter.stream(options)) out.push(c); return out; };
const tools = ["bash", "subagent", "send_message", "list_agents", "job_output", "job_list"].map((name) => ({ name }));
let out = await chunks({ model: "tour", messages: [textMessage("user", "Run the demo.", { kind: "user" })], tools });
assert.deepEqual([out[0].type, out.at(-3).type, out.at(-2).type, out.at(-1).reason.kind], ["block-start", "block-start", "block-end", "tool-calls"]);
assert.equal(JSON.parse(out.at(-2).block.arguments).description, "fork feature-home");
out = await chunks({ model: "tour", messages: [textMessage("user", "Run the demo.", { kind: "user" })], tools: [{ name: "job_list" }] });
assert.equal(out.at(-1).reason.failure.code, "MOCK_TOOL_NOT_OFFERED");
out = await chunks({ model: "tour", messages: [textMessage("user", "Write a title", { kind: "user" })], tools: [] });
assert.equal(out.find((c) => c.type === "block-end").block.text, "Tour");
// a demo Session's intro question is answered with what the demo shows, not run
out = await chunks({ model: "conflicts", messages: [textMessage("user", "What does this demo show?", { kind: "user" })], tools });
assert.match(out.find((c) => c.type === "block-end").block.text, /^Conflicts: [\s\S]*Agents: root\./);
assert.equal(out.at(-1).reason.kind, "stop");
out = await chunks({ model: "nope", messages: [], tools });
assert.equal(out.at(-1).reason.failure.code, "MOCK_NO_SCENARIO");
assert.deepEqual((await adapter.listModels("layerfs-mock")).map((x) => x.name), ["LayerFS mock · Tour", "LayerFS mock · Parallel Branches", "LayerFS mock · Conflicts", "LayerFS mock · Commit & merge", "LayerFS mock · One Sandbox, two Workspaces", "LayerFS mock · 5 agents", "LayerFS mock · Shop"]);
const aborted = new AbortController(); aborted.abort();
out = await chunks({ model: "tour", messages: [textMessage("user", "Run the demo.", { kind: "user" })], tools, signal: aborted.signal });
assert.equal(out.at(-1).reason.kind, "aborted");
// a stopped agent's aborted request stops its run, so Replay's strip reads Stopped
{
  const stops = new Progress(scenarios), stopping = createAdapter(class {}, scenarios, { typingMs: 0, progress: stops });
  const live = new AbortController(), messages = [textMessage("user", "Run the demo.", { kind: "user" })];
  const pending = (async () => { const got = []; for await (const c of stopping.stream({ model: "tour", sessionId: "s1", messages, tools, signal: live.signal })) got.push(c); return got; })();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(stops.get("tour").state, "running");
  live.abort();
  assert.equal((await pending).at(-1).reason.kind, "aborted");
  assert.deepEqual([stops.get("tour").state, stops.get("tour").error], ["stopped", "stopped while root worked"]);
}

console.log(`mock: ok (${scenarios.size} scenarios played)`);
