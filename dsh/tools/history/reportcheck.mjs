// `report.mjs check <NNN>`: the report format rule (#352 SPEC §3, F1–F8) on
// range NNN's report as it is about to be committed, its issue comment and
// its findings. Each rule prints PASS or FAIL with the reasons; the caller
// exits non-zero naming the failing rule ids.
//   F1 fixed shape     the template's headings in order, none empty; for an
//                      attempt that recorded its calls and Overview, the
//                      Overview first with its sums (REPORT_OVERVIEW.md §3)
//   F2 frozen          attempt rows and the latest check rows equal the stored
//                      gate results (legacy attempts: git HEAD's report);
//                      every earlier range's report equals HEAD's
//   F3 findings        a Finding block per optimize or stop attempt, complete
//                      from its finding record, or "Diagnosis pending"; the
//                      comment carries no finding the report lacks
//   F4 table           the before/after columns; every cell filled; units
//   F5 links           each record and ledger linked; every relative link resolves
//   F6 lead's note     not empty unless the latest verdict is pass
//   F7 labels          tooling time labeled; latency and probes name their binary
//   F8 no silent pass  stored check rows that could not be judged are not pass
//                      (legacy attempts predate the rule and are reported as such)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { checkFinding, checkRecord, closedWithoutChange, EVIDENCE_COLUMNS, loadFindings } from "./findings.mjs";
import { atHead, cells, legacyGates, parseReport, tableAfter } from "./frozen.mjs";
import { FINDING_COLUMNS, LEAD_END, LEAD_START, NOTE_START } from "./report.mjs";
import { checkOverview } from "./stats.mjs";
import { checkFormat, FINDINGS, issueOpenTimes, issuesAsOf, loadIssues } from "./format.mjs";

const pad = (n) => String(n).padStart(3, "0");
const HEADINGS = (k) => [`# Range ${pad(k)}`, "## Attempts", "## 1. Checks", "## 2. Work", "## 3. Operation latency", "## 4. Scale probes", "## 5. Storage", "## 6. Trends", LEAD_START, NOTE_START, LEAD_END];
const UNJUDGED = /\bn\/a\b|not set|insufficient|not judged|no comparable/;

/** The text of section `heading` (to the next heading of its level or higher). */
function section(text, heading) {
  const lines = text.split("\n"), at = lines.findIndex((l) => l === heading || l.startsWith(`${heading} (`));
  if (at < 0) return null;
  // the lead's note runs to §8: its own text may hold headings
  const level = heading === NOTE_START ? 2 : heading.match(/^#+/)[0].length, body = [];
  for (const l of lines.slice(at + 1)) {
    const h = l.match(/^(#+) /);
    if (h && h[1].length <= level) break;
    body.push(l);
  }
  return body.join("\n");
}

/** The tables of a Finding block: each one's header and rows, contiguous `|` lines, in order. */
export function blockTables(block) {
  const tables = [];
  let cur = null;
  for (const l of block.split("\n")) {
    if (!l.startsWith("|")) { cur = null; continue; }
    if (!cur) { cur = { header: cells(l), rows: [] }; tables.push(cur); continue; }
    if (!/^\|\s*-{3}/.test(l)) cur.rows.push(cells(l));
  }
  return tables;
}

/**
 * F4 (REPORT_FORMAT.md §5 Findings, items 3 and 4): the before/after table has
 * the eight columns, every cell filled, numbers with units; the with-vs-without
 * table, when present, is Measure plus one column per attempt, each labelled
 * with its binary (a backticked id), every cell filled.
 */
export function findingTableProblems(block, { none = false } = {}) {
  const p = [], tables = blockTables(block);
  // a finding closed without a code change shows its evidence table instead of a before/after one
  const cols = none ? EVIDENCE_COLUMNS : FINDING_COLUMNS;
  const ba = tables.find((t) => JSON.stringify(t.header) === JSON.stringify(cols));
  if (!ba) return [`the ${none ? "evidence" : "before/after"} columns are not ${cols.join(" · ")}`];
  for (const c of ba.rows) {
    if (c.length !== cols.length || c.some((x) => !x)) p.push(`row "${c[0]}" does not fill every column`);
    else if (!/exponent|ratio|share/.test(c[0]) && (none ? [c[1]] : [c[1], c[2]]).some((x) => /^[−\-]?[\d,.]+$/.test(x))) p.push(`row "${c[0]}" has a number without its unit`);
  }
  const at = block.indexOf("With vs without");
  const ww = at < 0 ? null : blockTables(block.slice(at))[0];
  if (ww) {
    if (ww.header[0] !== "Measure" || ww.header.length < 3) p.push("the with-vs-without table is not Measure plus one column per attempt");
    else for (const h of ww.header.slice(1)) if (!/`[0-9a-f]{8,}`/.test(h)) p.push(`with-vs-without column "${h}" is not labelled with its binary`);
    for (const c of ww.rows) if (c.length !== ww.header.length || c.some((x) => !x)) p.push(`with-vs-without row "${c[0]}" does not fill every column`);
  }
  return p;
}

/** The Finding blocks of §7 (the binding format: §5): "NNN.aK" -> block text. */
function findingBlocks(text, heading = LEAD_START) {
  const seven = section(text, heading) ?? "", out = new Map();
  for (const part of seven.split("\n### ").slice(1)) {
    const m = /^Finding (\d{3}\.a\d+)\b/.exec(part);
    if (m) out.set(m[1], part);
  }
  return out;
}

/**
 * @param {{ range: number, metricsDir: string, docs: string }} o
 * @returns {{ lines: string[], failed: string[] }}
 */
export function checkReport({ range, metricsDir, docs }) {
  const problems = new Map([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`F${n}`, []])), notes = [];
  const fail = (rule, text) => problems.get(rule).push(text);
  const file = join(docs, "ranges", `range-${pad(range)}.md`);
  if (!existsSync(file)) return { lines: [`FAIL F1: ${file} does not exist`], failed: ["F1"] };
  const text = readFileSync(file, "utf8"), report = parseReport(text);
  const attempts = [];
  for (const f of readdirSync(metricsDir).filter((f) => f.startsWith(`range-${pad(range)}.a`) && f.endsWith(".json"))) attempts.push(JSON.parse(readFileSync(join(metricsDir, f), "utf8")));
  attempts.sort((a, b) => a.attempt - b.attempt);
  const legacy = legacyGates(file);
  const recorded = attempts.map((m) => m.gate ?? legacy.get(m.attempt) ?? null);
  const findings = loadFindings(metricsDir).get(range) ?? [];

  // F1: the headings in order, each section with content; the binding format
  // (REPORT_FORMAT.md) for an attempt that recorded its measurements
  const last = attempts.at(-1);
  const binding = !!(last?.version && last?.overview && last?.calls);
  // open issues as of the latest attempt's start (F2: a recorded report is frozen)
  if (binding) for (const p of checkFormat(text, last, issuesAsOf(loadIssues(docs), issueOpenTimes(docs), last.started))) fail("F1", p);
  let from = 0;
  for (const h of binding ? [] : HEADINGS(range)) {
    const lines = text.split("\n"), at = lines.findIndex((l, i) => i >= from && (l === h || l.startsWith(`${h} (`)));
    if (at < 0) { fail("F1", `missing or out of order: ${h}`); continue; }
    from = at + 1;
    if (h !== LEAD_START && h !== `# Range ${pad(range)}` && !section(text, h)?.trim()) fail("F1", `${h} is empty; an empty section says why`);
  }

  // F1, the Overview: required, and its sums checked, when the latest attempt recorded its data
  if (!binding && last?.overview && last?.calls) for (const p of checkOverview(text, last)) fail("F1", `Overview: ${p}`);
  else if (text.includes("\n## Overview")) notes.push("note F1: an Overview without recorded data in the latest attempt");

  // F2: rows equal the recorded results; earlier reports unchanged
  attempts.forEach((m, i) => {
    const g = recorded[i], row = report.attempts.get(m.attempt);
    if (!g) return fail("F2", `attempt ${m.attempt} has no stored gate result and no row at HEAD`);
    if (!row) return fail("F2", `attempt ${m.attempt} has no row in the report`);
    for (const k of ["binary", "started", "verdict", "reason"]) if (String(row[k]) !== String(g[k])) fail("F2", `attempt ${m.attempt} ${k}: report "${row[k]}" vs recorded (${g.source}) "${g[k]}"`);
  });
  const latest = recorded.at(-1);
  if (latest?.checks) {
    const want = latest.checks.map((c) => [c.name, String(c.value), String(c.threshold), c.result].join(" | "));
    const got = report.checks.map((c) => [c.name, c.value, c.threshold, c.result].join(" | "));
    // stored values are numbers or strings; the report prints numbers formatted, so compare names, thresholds and results exactly
    if (want.length !== got.length || report.checks.some((c, j) => c.name !== latest.checks[j].name || c.result !== latest.checks[j].result)) fail("F2", "§1 check rows differ from the recorded result");
    if (latest.source !== "stored" && JSON.stringify(want) !== JSON.stringify(got)) fail("F2", "§1 check rows differ from HEAD's report");
  }
  for (const f of readdirSync(join(docs, "ranges")).filter((f) => /^range-\d{3}\.md$/.test(f) && Number(f.slice(6, 9)) < range)) {
    const head = atHead(join(docs, "ranges", f));
    if (head != null && head !== readFileSync(join(docs, "ranges", f), "utf8")) fail("F2", `${f} differs from HEAD (an earlier report must stay byte-identical)`);
  }

  // F3, F4, F5: Finding blocks
  const blocks = findingBlocks(text, binding ? FINDINGS : LEAD_START);
  const comment = existsSync(join(metricsDir, `comment-${pad(range)}.md`)) ? readFileSync(join(metricsDir, `comment-${pad(range)}.md`), "utf8") : null;
  attempts.forEach((m, i) => {
    const v = recorded[i]?.verdict;
    if (v !== "optimize" && v !== "stop") return;
    const id = `${pad(range)}.a${m.attempt}`, block = blocks.get(id), f = findings.find((x) => x.attempt === m.attempt);
    if (!block) return fail("F3", `attempt ${m.attempt} is ${v} and §7 has no "### Finding ${id}" block`);
    if (!f) {
      if (!block.includes("Diagnosis pending") || !block.includes(`finding-${id}.json`)) fail("F3", `Finding ${id}: no finding record, and the block does not say Diagnosis pending with its file`);
      return;
    }
    for (const p of checkFinding(f, { full: binding })) fail(/improvement|evidence/.test(p) ? "F4" : /record|ledger/.test(p) ? "F5" : "F3", `finding-${id}.json: ${p}`);
    // F5 and REBUILD.md §4: each fixes/ record the finding names states its kind fields
    for (const r of f.records ?? []) {
      const file = join(docs, r.path);
      if (!existsSync(file)) fail("F5", `finding-${id}.json names ${r.path}, which does not exist`);
      else for (const p of checkRecord(r.path.replace(/^fixes\//, ""), readFileSync(file, "utf8"))) fail("F5", p);
    }
    if (!binding) for (const row of ["Trigger", "Diagnosis", "Fix", "Recovery", "Records"]) if (!block.includes(`| ${row} |`)) fail("F3", `Finding ${id} has no ${row} row`);
    if (!block.includes(f.trigger.check)) fail("F3", `Finding ${id} does not show its trigger`);
    if (comment != null) {
      if (!comment.includes(f.trigger.check)) fail("F3", `comment-${pad(range)}.md lacks finding ${id}'s trigger`);
      for (const r of (closedWithoutChange(f) ? f.evidence : f.improvement) ?? []) if (!comment.includes(r.measure)) fail("F3", `comment-${pad(range)}.md lacks the measure "${r.measure}" of finding ${id}`);
    }
    // F4: each table of the block by its own shape (F-020): the before/after table, and the with-vs-without one
    for (const p of findingTableProblems(block, { none: closedWithoutChange(f) })) fail("F4", `Finding ${id}: ${p}`);
    // F5: its records and ledger linked
    for (const r of f.records ?? []) if (!block.includes(`](../${r.path})`)) fail("F5", `Finding ${id} does not link ${r.path}`);
    for (const l of f.ledger ?? []) if (!block.includes(`](../${l.file})`)) fail("F5", `Finding ${id} does not link ${l.file}`);
  });
  for (const id of blocks.keys()) if (!attempts.some((m, i) => `${pad(range)}.a${m.attempt}` === id && ["optimize", "stop"].includes(recorded[i]?.verdict))) fail("F3", `§7 has a Finding ${id} block for no optimize or stop attempt`);
  if (comment != null) for (const m of comment.matchAll(/from attempt (\d+)|finding-(\d{3})\.a(\d+)/g)) {
    const k = Number(m[1] ?? m[3]);
    if (!blocks.has(`${pad(range)}.a${k}`) && recorded[k - 1]?.verdict && ["optimize", "stop"].includes(recorded[k - 1].verdict) === false) fail("F3", `the comment names a finding of attempt ${k}, which the report lacks`);
  }
  if (comment == null) notes.push(`note: comment-${pad(range)}.md is not in ${metricsDir}; F3's comment check skipped`);
  // F5: every relative link resolves
  for (const m of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
    const target = m[1];
    if (/^[a-z]+:/.test(target)) continue;
    if (!existsSync(resolve(dirname(file), target))) fail("F5", `link ${target} does not resolve`);
  }

  // F6: the lead's note
  const verdict = recorded.at(-1)?.verdict ?? report.attempts.get(report.latest)?.verdict;
  const note = (section(text, NOTE_START) ?? "").trim();
  if (verdict !== "pass" && (!note || note === "- (none yet)")) fail("F6", `the verdict is ${verdict} and the lead's note is empty`);

  // F7: labels
  const header = text.slice(0, text.indexOf("\n## "));
  if (binding) { /* the binding format's labels are checkFormat's (F1) */ } else if (!/\| Wall time[^|]*tooling/.test(header) || !/tooling:|\| Wall time[^|]*\| — \|/.test(header)) fail("F7", "the header's wall time is not labeled tooling");
  for (const h of binding ? [] : ["## 3. Operation latency", "## 4. Scale probes"]) if (!/daemon `[0-9a-f]+`/.test(section(text, h) ?? "")) fail("F7", `${h} does not name its binary`);
  for (const c of report.checks) if (/seed/.test(c.value) && !/seeded/.test(c.value)) fail("F7", `check ${c.name} uses seeded points without saying so`);

  // F8: no silent pass (stored results; legacy attempts predate the rule)
  attempts.forEach((m, i) => {
    const g = recorded[i];
    if (!g?.checks) return;
    if (g.source !== "stored") {
      const silent = g.checks.filter((c) => c.result === "pass" && UNJUDGED.test(String(c.value)));
      if (silent.length) notes.push(`note F8: attempt ${m.attempt} is recorded from HEAD's report and predates the rule: ${silent.map((c) => c.name).join(", ")} passed without a judgement (frozen, not re-evaluated)`);
      return;
    }
    for (const c of g.checks) if (c.result === "pass" && UNJUDGED.test(String(c.value)) && !String(c.value).startsWith("not applicable")) fail("F8", `attempt ${m.attempt} ${c.name} passes without a judgement: ${c.value}`);
  });

  const lines = [];
  for (const [rule, ps] of problems) {
    if (!ps.length) lines.push(`PASS ${rule}`);
    for (const p of ps) lines.push(`FAIL ${rule}: ${p}`);
  }
  lines.push(...notes);
  return { lines, failed: [...problems].filter(([, ps]) => ps.length).map(([r]) => r) };
}
