// Issue #334's record format (Shop, Phase C Builder 2): the SDK trace
// (trace.jsonl, one line per call, its step label set by the builder's
// script) and the builder's working folder, which holds each step's script
// (NNN-*.mjs) and what it printed (NNN-*.out).
//
// The trace shortens a long `command` to 200 characters and "…". Such a
// command is taken whole from the step's own script: the script runs once
// with a recording stand-in for @layerfs/sdk, in a scratch copy of the
// working folder, and the command it passes to sandbox.exec is kept when it
// starts with the trace's text. Nothing else of that run is used.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const STUB = `
import { appendFileSync } from "node:fs";
let n = 0;
const log = (value) => appendFileSync(process.env.STUB_LOG, JSON.stringify(value) + "\\n");
const answer = (path) => {
  if (path === "sandbox.mount") return { kind: "Mounted", path: "/workspaces/" + (++n) };
  if (path === "sandbox.exec") return { kind: "exit:0", exitCode: 0, stdout: "", stderr: "" };
  if (path === "sandbox.create") return "sb_stub";
  if (path.startsWith("fs.read")) return { kind: "ok", text: "", nextLine: null };
  if (/list/.test(path)) return { kind: "ok", items: [], hasMore: false };
  return { kind: "Committed" };
};
const group = (name) => new Proxy({}, { get: (_, method) => async (...args) => {
  if (name + "." + String(method) === "sandbox.exec") log({ command: args[2] });
  return answer(name + "." + String(method));
} });
export class LayerFS { constructor() { for (const g of ["project", "fs", "branch", "sandbox"]) this[g] = group(g); } }
export const isRefusal = () => false;
`;

/** The whole commands each listed step's script passes to sandbox.exec, in order. */
function scriptCommands(builder, number) {
  const script = readdirSync(builder).find((f) => f.startsWith(`${number}-`) && f.endsWith(".mjs"));
  if (!script) throw new Error(`no script ${number}-*.mjs in ${builder}`);
  const scratch = mkdtempSync(join(tmpdir(), "lfs-shop-"));
  try {
    for (const entry of readdirSync(builder)) {
      if (["node_modules", "sdk", "layerfs-js-sdk", "seed"].includes(entry)) continue;
      cpSync(join(builder, entry), join(scratch, entry), { recursive: true });
    }
    const pkg = join(scratch, "node_modules", "@layerfs", "sdk");
    mkdirSync(pkg, { recursive: true });
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@layerfs/sdk", type: "module", main: "index.js" }));
    writeFileSync(join(pkg, "index.js"), STUB);
    const log = join(scratch, "stub.log");
    writeFileSync(log, "");
    execFileSync(process.execPath, [script], { cwd: scratch, env: { PATH: process.env.PATH, STUB_LOG: log }, stdio: ["ignore", "ignore", "pipe"], timeout: 30_000 });
    return readFileSync(log, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line).command);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** Each exec's printed result in the step's .out file (lines `<name> {json with exitCode}`), in order. */
function printedRuns(builder, number) {
  const out = readdirSync(builder).find((f) => f.startsWith(`${number}-`) && f.endsWith(".out"));
  if (!out) return [];
  const runs = [];
  for (const line of readFileSync(join(builder, out), "utf8").split("\n")) {
    const json = line.slice(line.indexOf(" ") + 1);
    try {
      const value = JSON.parse(json);
      if (value && typeof value.exitCode === "number") runs.push(value);
    } catch { /* not a result line */ }
  }
  return runs;
}

/**
 * @param {{ trace: string, builder: string }} inputs
 * @returns {{ steps: { label: string, agent: string, calls: object[] }[] }}
 */
export function readShop({ trace, builder }) {
  const steps = new Map();
  for (const text of readFileSync(trace, "utf8").split("\n").filter(Boolean)) {
    const line = JSON.parse(text);
    if (line.phase === "start" || /^OBS\b/.test(line.step)) continue;
    if (!steps.has(line.step)) steps.set(line.step, { label: line.step, agent: "root", calls: [] });
    steps.get(line.step).calls.push({
      method: line.method, args: line.args ?? {}, ok: line.ok, kind: line.kind ?? null, code: line.code ?? null,
      commit: line.commit ?? null, start: Date.parse(line.start), ms: line.ms,
    });
  }
  for (const step of steps.values()) {
    const number = step.label.slice(0, 3), execs = step.calls.filter((c) => c.method === "sandbox.exec");
    if (!execs.length) continue;
    const runs = printedRuns(builder, number);
    let whole = null;
    execs.forEach((call, i) => {
      let command = call.args.command;
      if (command.endsWith("…")) {
        whole ??= scriptCommands(builder, number);
        const found = whole[i];
        if (!found || !found.startsWith(command.slice(0, -1))) throw new Error(`${step.label}: the script's command ${i + 1} does not start with the trace's`);
        command = found;
      }
      call.command = command;
      call.output = runs[i] ? `${runs[i].stdout ?? ""}${runs[i].stderr ?? ""}` : "";
    });
  }
  return { steps: [...steps.values()] };
}
