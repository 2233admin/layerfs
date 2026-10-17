// The fixer's record of one optimize or stop finding (#352 SPEC §6,
// Recording a finding): <metrics>/finding-NNN.aK.json answers attempt K of
// range NNN. report.mjs puts it in the range's issue comment: what tripped,
// how it was diagnosed, what was fixed and how much it improved.
//   {
//     range, attempt, verdict: "optimize" | "stop",
//     trigger: { check, value, threshold },         the gate row that tripped
//     diagnosis: { step: "D0".."D6", summary, phase?, counter?, exponent?: { before, after } },
//     fix: { summary, kind: "code path" | "data" | "format", commit, test? },
//     improvement: [ { measure, before, after, unit?, oldBinary, newBinary, snapshot, cache } ],
//                                                    old vs new binary, same snapshots (SPEC §3 F4)
//     recovery,                                      SPEC §6 recovery
//     records: [ { title, path: "fixes/NNN-aK-<slug>.md" } ],   one per cause (F5)
//     ledger: [ { file: "OPTIMIZATIONS.md" | "BUGS.md", entry } ],   its BUGS / OPTIMIZATIONS line
//     record?                                        free-text pointer, kept from older records
//   }
// Paths in records and ledger are relative to core/docs/issues/352/.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const STEPS = ["D0", "D1", "D2", "D3", "D4", "D5", "D6"];
export const FIX_KINDS = ["code path", "data", "format"];

/** The problems of a finding record; empty when it is complete. */
export function checkFinding(f) {
  const p = [];
  const need = (v, what) => { if (v == null || v === "") p.push(`${what} is missing`); };
  need(f.range, "range"); need(f.attempt, "attempt");
  if (!["optimize", "stop"].includes(f.verdict)) p.push("verdict is optimize or stop");
  need(f.trigger?.check, "trigger.check"); need(f.trigger?.value, "trigger.value");
  if (!STEPS.includes(f.diagnosis?.step)) p.push(`diagnosis.step is one of ${STEPS.join(", ")}`);
  need(f.diagnosis?.summary, "diagnosis.summary");
  need(f.fix?.summary, "fix.summary"); need(f.fix?.commit, "fix.commit");
  if (!FIX_KINDS.includes(f.fix?.kind)) p.push(`fix.kind is one of ${FIX_KINDS.join(", ")}`);
  if (!Array.isArray(f.improvement) || !f.improvement.length) p.push("improvement has at least one old-vs-new row");
  for (const r of f.improvement ?? []) {
    if (r.measure == null || r.before == null || r.after == null) p.push("an improvement row needs measure, before and after");
    for (const k of ["oldBinary", "newBinary", "snapshot", "cache"]) if (r[k] == null || r[k] === "") p.push(`improvement "${r.measure}" needs ${k}`);
  }
  need(f.recovery, "recovery");
  const prefix = `fixes/${String(f.range).padStart(3, "0")}-a${f.attempt}-`;
  if (!Array.isArray(f.records) || !f.records.length) p.push("records lists the fixes/ record of each cause");
  for (const r of f.records ?? []) if (!r?.title || !/^fixes\/\d{3}-a\d+-[a-z0-9-]+\.md$/.test(r?.path ?? "") || !r.path.startsWith(prefix)) p.push(`record ${JSON.stringify(r)} is { title, path: "${prefix}<slug>.md" }`);
  if (!Array.isArray(f.ledger) || !f.ledger.length) p.push("ledger names its BUGS.md or OPTIMIZATIONS.md line");
  for (const l of f.ledger ?? []) if (!["BUGS.md", "OPTIMIZATIONS.md"].includes(l?.file) || !l?.entry) p.push(`ledger ${JSON.stringify(l)} is { file: BUGS.md | OPTIMIZATIONS.md, entry }`);
  return p;
}

/** The findings of `dir` by range: range -> [finding, ...] in attempt order. */
export function loadFindings(dir) {
  const byRange = new Map();
  if (!existsSync(dir)) return byRange;
  for (const f of readdirSync(dir).filter((f) => /^finding-\d+\.a\d+\.json$/.test(f))) {
    const x = JSON.parse(readFileSync(join(dir, f), "utf8"));
    (byRange.get(x.range) || byRange.set(x.range, []).get(x.range)).push(x);
  }
  for (const xs of byRange.values()) xs.sort((a, b) => a.attempt - b.attempt);
  return byRange;
}

/** Relative change from before to after, as "−42%" (lower is better for times and bytes). */
export function change(before, after) {
  if (!before) return "—";
  const pct = Math.round(((after - before) / before) * 100);
  return `${pct > 0 ? "+" : pct < 0 ? "−" : "±"}${Math.abs(pct)}%`;
}
