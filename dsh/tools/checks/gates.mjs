// The checks a finished demo run must pass, shared by check-demo.mjs (a dsh
// web session) and run-scenario.mjs (a headless run):
//   expected     each bash step with `expect` left those LayerFS outcomes, in
//                order, on its agent's trace lines ("a|b" allows either)
//   order        the project's history equals the recorded one (final.json):
//                each Branch's Commits in the recorded order, each fork from
//                and each merge and publish of the recorded node
//   final tree   every tracked file on main has the recorded SHA-256, and no
//                other tracked file exists
//   closed       no container uses the project's volume: every Sandbox of the
//                run, the service Sandbox included, is closed, so no Workspace
//                is mounted
import { execFileSync } from "node:child_process";
import { compareHistory, historyOf } from "./history.mjs";
import { trackedHashes } from "./tree.mjs";

// an expected entry is a code ("Committed"), method:code, or alternatives
// sharing one method ("sandbox.commit:Committed|UpToDate")
const matches = (code, want) => {
  const bar = want.indexOf("|");
  if (bar < 0) return code === want || code.endsWith(`:${want}`);
  const head = want.slice(0, want.lastIndexOf(":", bar) + 1);
  return want.slice(head.length).split("|").some((kind) => matches(code, head + kind));
};
/** Whether `want` appears in `codes` in order. */
const inOrder = (codes, want) => { let i = 0; for (const c of codes) if (i < want.length && matches(c, want[i])) i++; return i === want.length; };
export const codeOf = (line) => `${line.method}:${line.ok ? line.kind ?? "ok" : line.code}`;

/**
 * @param {object} scenario compiled scenario
 * @param {(agent: string) => object[]} linesOf the agent's finished trace lines, in order
 * @returns {{ failures: string[], notes: string[] }}
 */
export function expectedOutcomes(scenario, linesOf) {
  const failures = [], notes = [];
  for (const [agent, steps] of Object.entries(scenario.agents)) {
    const groups = [];
    for (const line of linesOf(agent).filter((l) => l.ok !== undefined && l.method !== "sandbox.service")) {
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
    notes.push(`${agent}: ${groups.length} bash call(s) with LayerFS lines, ${expecting.length} checked`);
  }
  return { failures, notes };
}

/** The order checks: the run's history against final.json's recorded one. */
export async function orderFailures(final, lf, operator) {
  return compareHistory(final.history, await historyOf(lf, operator));
}

/** The final-tree check: main's tracked files against final.json's. */
export async function finalTreeFailures(final, lf) {
  const run = await trackedHashes(lf, "main"), failures = [];
  for (const [path, problem] of Object.entries(run.problems)) failures.push(`${path}: ${problem}`);
  for (const [path, sha] of Object.entries(final.main)) {
    if (!(path in run.files) && !(path in run.problems)) failures.push(`${path} is missing from main`);
    else if (path in run.files && run.files[path] !== sha) failures.push(`${path} differs: ${run.files[path].slice(0, 12)}, recorded ${sha.slice(0, 12)}`);
  }
  for (const path of Object.keys(run.files)) if (!(path in final.main)) failures.push(`${path} is tracked on main but not in the record`);
  return { failures, files: Object.keys(run.files).length };
}

/** The closed check: the containers that still use the project's volume. */
export function openContainers(volume, docker = "/var/run/docker.sock") {
  const out = execFileSync("docker", ["-H", `unix://${docker}`, "ps", "-a", "--filter", `volume=${volume}`, "--format", "{{.Names}} {{.State}}"], { encoding: "utf8" });
  return out.split("\n").filter(Boolean);
}
