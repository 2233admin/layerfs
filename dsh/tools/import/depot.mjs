// Issue #337's record format (Depot, Builder 2): the SDK trace (trace.mjs) and
// the receipts folder beside it, which holds NNN-exec.json for each step that
// ran a command: the whole command and its result ({ command, run: { kind,
// exitCode, stdout, stderr } }). A step runs at most one command.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readTrace } from "./trace.mjs";

/**
 * @param {{ receipts: string }} inputs
 * @returns {{ steps: { label: string, agent: string, calls: object[] }[] }}
 */
export function readDepot({ receipts }) {
  const steps = readTrace(join(receipts, "trace.jsonl"));
  for (const step of steps) {
    const execs = step.calls.filter((c) => c.method === "sandbox.exec");
    if (!execs.length) continue;
    if (execs.length > 1) throw new Error(`${step.label}: ${execs.length} commands in one step`);
    const file = join(receipts, `${step.label.slice(0, 3)}-exec.json`);
    if (!existsSync(file)) throw new Error(`${step.label}: no ${file}`);
    const record = JSON.parse(readFileSync(file, "utf8")), [call] = execs;
    const short = call.args.command;
    if (short.endsWith("…") ? !record.command.startsWith(short.slice(0, -1)) : record.command !== short) {
      throw new Error(`${step.label}: ${file}'s command is not the trace's`);
    }
    if (record.run?.kind !== call.kind) throw new Error(`${step.label}: ${file} ended ${record.run?.kind}, the trace ${call.kind}`);
    call.command = record.command;
    call.output = `${record.run.stdout ?? ""}${record.run.stderr ?? ""}`;
  }
  return { steps };
}
