// The SDK trace both #334 (Shop) and #337 (Depot) recorded: trace.jsonl, one
// line per call, its step label set by the builder's script. Calls are grouped
// into steps by that label, in recorded order; observer labels (OBS…) are left
// out. A long `command` is shortened in the trace to 200 characters and "…";
// each format's reader supplies the whole one.
import { readFileSync } from "node:fs";

/**
 * @param {string} file trace.jsonl
 * @returns {{ label: string, agent: string, calls: object[] }[]}
 */
export function readTrace(file) {
  const steps = new Map();
  for (const text of readFileSync(file, "utf8").split("\n").filter(Boolean)) {
    const line = JSON.parse(text);
    if (line.phase === "start" || /^OBS\b/.test(line.step)) continue;
    if (!steps.has(line.step)) steps.set(line.step, { label: line.step, agent: "root", calls: [] });
    steps.get(line.step).calls.push({
      method: line.method, args: line.args ?? {}, ok: line.ok, kind: line.kind ?? null, code: line.code ?? null,
      commit: line.commit ?? null, start: Date.parse(line.start), ms: line.ms,
    });
  }
  return [...steps.values()];
}
