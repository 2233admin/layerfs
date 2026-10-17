// Recorded gate outcomes are frozen (#352 SPEC §3 F2, F-004). An attempt's
// gate result is stored in its range-NNN.aK.json (`gate`) when report.mjs
// first reports it, right after the attempt ran; every later report renders
// it from there and never evaluates it again. Attempts reported before this
// rule have no stored result: what was recorded is the committed report
// text, so their rows are read from git HEAD's report.
//   gate: { verdict, reason, checks: [ { name, value, threshold, result } ] | null,
//           binary, started, source: "stored" | "report at HEAD" }
import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

/** The cells of one markdown table row. */
export const cells = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split(" | ").map((c) => c.trim());

/** The rows (cells) of the first table after `heading` in `text`, header and rule left out. */
export function tableAfter(text, heading) {
  const at = text.indexOf(`\n${heading}\n`);
  if (at < 0) return null;
  const lines = text.slice(at + heading.length + 2).split("\n");
  const start = lines.findIndex((l) => l.startsWith("|"));
  if (start < 0) return null;
  const rows = [];
  for (const l of lines.slice(start + 2)) { if (!l.startsWith("|")) break; rows.push(cells(l)); }
  return rows;
}

/** A report's recorded attempts (attempt -> row) and the check rows of its latest attempt. */
export function parseReport(text) {
  const attempts = new Map();
  for (const [n, binary, started, verdict, reason] of tableAfter(text, "## Attempts") ?? []) attempts.set(Number(n), { binary, started, verdict, reason });
  const checks = (tableAfter(text, "## 1. Checks") ?? []).map(([name, value, threshold, result]) => ({ name, value, threshold, result }));
  const latest = attempts.size ? Math.max(...attempts.keys()) : null;
  return { attempts, checks, latest };
}

/** The file at git HEAD, or null when HEAD has none. */
export function atHead(file) {
  try {
    const at = join(realpathSync(dirname(file)), basename(file));
    const top = execFileSync("git", ["-C", dirname(at), "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
    return execFileSync("git", ["-C", top, "show", `HEAD:${relative(top, at)}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch { return null; }
}

/** The legacy gate results of a report as committed at HEAD: attempt -> gate. */
export function legacyGates(reportFile) {
  const text = atHead(reportFile);
  if (text == null) return new Map();
  const r = parseReport(text), out = new Map();
  for (const [n, row] of r.attempts) out.set(n, { ...row, checks: n === r.latest ? r.checks : null, source: "report at HEAD" });
  return out;
}

/** The reason an attempt's row gives: every check that did not pass. */
export const reasonOf = (checks) => checks.filter((c) => c.result !== "pass").map((c) => `${c.name}: ${c.value}`).join("; ") || "all checks pass";

/** A just-evaluated gate result as stored. */
export const storedGate = (m, g) => ({ verdict: g.verdict, reason: reasonOf(g.checks), checks: g.checks, binary: m.binary?.daemon ?? "?", started: m.started ?? "—", source: "stored" });

/** Writes `gate` into the attempt's metrics file (the rest of the file unchanged). */
export function storeGate(file, gate) {
  const m = JSON.parse(readFileSync(file, "utf8"));
  if (m.gate) throw new Error(`${file} already holds its gate result`);
  m.gate = gate;
  writeFileSync(`${file}.tmp`, JSON.stringify(m, null, 1));
  renameSync(`${file}.tmp`, file);
  return m;
}
