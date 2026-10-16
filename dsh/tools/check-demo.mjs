// Checks a finished mock demo session against its scenario, through a
// running dsh web Host's /layerfs route: every agent of the scenario ran, and
// each bash step with `expect` produced those LayerFS outcome codes in order
// on its trace lines (other calls may come between; a retried step may leave
// earlier attempts). An outcome code is a refusal's code, else the value's
// kind, else "ok"; an expected entry is a code ("Committed") or method:code
// ("sandbox.commit:Committed").
//   node dsh/tools/check-demo.mjs '<dsh web URL with ?token=…>' <session id> <scenario>
// Exit status 0 when every check holds; each failure is printed.
import { fileURLToPath } from "node:url";
import { loadScenarios } from "../packages/mock/src/scenario.js";

const [address, sessionId, name] = process.argv.slice(2);
const scenario = loadScenarios(fileURLToPath(new URL("../scenarios/", import.meta.url))).get(name ?? "");
if (!address || !sessionId || !scenario) {
  console.error("usage: check-demo.mjs '<dsh web URL with ?token=…>' <session id> <scenario>");
  process.exit(2);
}

const login = await fetch(address, { redirect: "manual" });
const cookie = login.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
const res = await fetch(`${new URL(address).origin}/layerfs/session/${encodeURIComponent(sessionId)}`, { headers: { cookie } });
const view = await res.json();
if (!res.ok) throw new Error(`${res.status} ${view.code}: ${view.message}`);

const failures = [];
const codeOf = (line) => `${line.method}:${line.ok ? line.kind ?? "ok" : line.code}`;
const matches = (code, want) => code === want || code.endsWith(`:${want}`);
/** Whether `want` appears in `codes` in order. */
const inOrder = (codes, want) => { let i = 0; for (const c of codes) if (i < want.length && matches(c, want[i])) i++; return i === want.length; };

const finished = view.lines.filter((l) => l.ok !== undefined && l.method !== "sandbox.service");
const agentOf = (line) => line.agentId === view.root ? "root" : view.agents[line.agentId] ?? line.agent;
for (const [agent, steps] of Object.entries(scenario.agents)) {
  // this agent's bash calls in order, each the trace lines of one step label
  const groups = [];
  for (const line of finished.filter((l) => agentOf(l) === agent)) {
    let group = groups.find((g) => g.step === line.step);
    if (!group) groups.push(group = { step: line.step, codes: [] });
    group.codes.push(codeOf(line));
  }
  const expecting = steps.filter((s) => s.kind === "call" && s.call.name === "bash" && s.expect);
  if (expecting.length && !groups.length) { failures.push(`${agent}: no LayerFS calls on the trace`); continue; }
  let next = 0;
  for (const step of expecting) {
    const at = groups.findIndex((g, i) => i >= next && inOrder(g.codes, step.expect));
    if (at < 0) {
      failures.push(`${step.at} (${step.call.args.description}): expected ${step.expect.join(", ")}; ${agent}'s later calls show ${groups.slice(next).map((g) => `[${g.codes.join(", ")}]`).join(" ") || "nothing"}`);
      continue;
    }
    if (at > next && !step.retry) failures.push(`${step.at}: ${at - next} earlier bash call(s) of ${agent} did not match and the step has no retry rule`);
    next = at + 1;
  }
  console.log(`${agent}: ${groups.length} bash call(s) with LayerFS lines, ${expecting.length} checked`);
}
if (failures.length) {
  for (const failure of failures) console.log(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS ${scenario.title}: every expected outcome is on the trace`);
