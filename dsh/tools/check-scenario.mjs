// A converted scenario's static checks, run before a headless or Live run
// (issue #350); each finds in seconds a converter mistake a run would find
// only after the steps before it:
//   node dsh/tools/check-scenario.mjs <scenario>
//   - every bash step names a run file, and every run file is named once
//   - a step's `expect` is its run file's, and each entry parses (method:kind
//     or alternatives sharing one method, as replay.mjs and check-demo read them)
//   - a disabled verification command has no expect, its run file says
//     verification is off, and the Commit after it in its Workspace expects UpToDate
//   - the lead starts each role once, before it sends it a turn or waits on it
//   - each role's turns are answered: the lead never waits on a role more
//     often than it sent the role turns
// It does not play the scenario; dsh/packages/mock/tests/mock.mjs does.
import { readFileSync, readdirSync } from "node:fs";

const id = process.argv[2];
if (!id) { console.error("usage: check-scenario.mjs <scenario>"); process.exit(2); }
const dir = new URL(`../scenarios/${id}/`, import.meta.url);
const scenario = JSON.parse(readFileSync(new URL("scenario.json", dir), "utf8"));
const METHODS = new Set(["branch.fork", "branch.merge", "branch.publish", "fs.apply", "sandbox.create", "sandbox.close", "sandbox.mount", "sandbox.exec", "sandbox.commit", "sandbox.unmount"]);
const problems = [];
const problem = (where, text) => problems.push(`${where}: ${text}`);

const parses = (want) => {
  const colon = want.indexOf(":");
  if (colon < 0 || !METHODS.has(want.slice(0, colon))) return false;
  const rest = want.slice(colon + 1), bar = rest.indexOf("|");
  if (bar < 0) return rest.length > 0;
  const head = rest.slice(0, rest.lastIndexOf(":", bar) + 1);
  return rest.slice(head.length).split("|").every((kind) => kind.length > 0 && !kind.includes(":"));
};

const files = new Set(readdirSync(new URL("run/", dir)).filter((f) => f.endsWith(".json")));
const named = new Map();
for (const [agent, steps] of Object.entries(scenario.agents)) {
  const open = new Set(); // Workspaces with a disabled command since their last Commit, across the agent's steps
  for (const step of steps) {
    if (!step.bash) continue;
    const [command, scen, number] = step.bash.run?.[0] ?? [];
    const where = `${agent} ${step.bash.description}`;
    if (command !== "step" || scen !== id) { problem(where, `runs ${JSON.stringify(step.bash.run)}`); continue; }
    const file = `${number}.json`;
    if (!files.has(file)) { problem(where, `names run/${file}, which does not exist`); continue; }
    if (named.has(file)) problem(where, `names run/${file}, which ${named.get(file)} names too`);
    named.set(file, where);
    const run = JSON.parse(readFileSync(new URL(`run/${file}`, dir), "utf8"));
    if (run.agent !== agent) problem(where, `run/${file} is ${run.agent}'s`);
    const want = run.calls.map((c) => c.expect).filter(Boolean);
    if (JSON.stringify(step.expect ?? []) !== JSON.stringify(want) || JSON.stringify(run.expect) !== JSON.stringify(want)) problem(where, `expect ${JSON.stringify(step.expect)} is not its calls' ${JSON.stringify(want)}`);
    for (const e of want) if (!parses(e)) problem(where, `expect ${e} does not parse`);
    for (const call of run.calls) {
      if (call.op === "exec" && call.disabled) {
        if (!call.verification) problem(where, "a disabled command that is not verification only");
        if (call.expect) problem(where, `a disabled command expects ${call.expect}`);
        if (!["off", "no-browser"].includes(run.verification)) problem(where, `a disabled command where verification is ${run.verification ?? "on"}`);
        if (run.verification === "no-browser" && !call.browser) problem(where, "a disabled command that drives no browser, with verification no-browser");
        open.add(call.ws);
      }
      if (call.op === "commit" && open.delete(call.ws) && call.expect !== "sandbox.commit:UpToDate") problem(where, `the Commit after a disabled command expects ${call.expect}`);
      if (call.op === "exec" && !call.disabled) open.delete(call.ws);
    }
  }
  if (open.size) problem(agent, `a disabled command with no Commit after it in ${[...open].join(", ")}`);
}
for (const file of files) if (!named.has(file)) problem(`run/${file}`, "no step names it");

const root = scenario.agents.root ?? [], roles = Object.keys(scenario.agents).filter((a) => a !== "root");
const started = new Set(), sent = new Map(), waited = new Map();
for (const step of root) {
  if (step.subagent) {
    const role = step.subagent.description;
    if (!roles.includes(role)) problem(`root subagent ${role}`, "names no agent of the scenario");
    if (started.has(role)) problem(`root subagent ${role}`, "starts it twice");
    started.add(role); sent.set(role, 1);
  }
  if (step.send_message) {
    const role = step.send_message.agent_id.replace(/^@/, "");
    if (!started.has(role)) problem(`root send_message ${role}`, "before the role is started");
    sent.set(role, (sent.get(role) ?? 0) + 1);
  }
  for (const role of step.until ?? []) {
    if (!started.has(role)) problem(`root waits on ${role}`, "before the role is started");
    waited.set(role, (waited.get(role) ?? 0) + 1);
    if (waited.get(role) > (sent.get(role) ?? 0)) problem(`root waits on ${role}`, `for turn ${waited.get(role)}, but sent ${sent.get(role) ?? 0}`);
  }
}
for (const role of roles) {
  if (!started.has(role)) problem(role, "the lead never starts it");
  const replies = scenario.agents[role].filter((s) => s.reply !== undefined).length;
  if (replies !== (sent.get(role) ?? 0)) problem(role, `answers ${replies} turn(s); the lead sends ${sent.get(role) ?? 0}`);
}

const disabled = [...named.keys()].filter((f) => JSON.parse(readFileSync(new URL(`run/${f}`, dir), "utf8")).calls.some((c) => c.disabled)).length;
console.log(`${id}: ${named.size} run files, ${roles.length} roles, ${disabled} step(s) with a disabled command`);
for (const p of problems.slice(0, 40)) console.log(`✕ ${p}`);
if (problems.length) { console.log(`${problems.length} problem(s)`); process.exit(1); }
console.log("ok");
