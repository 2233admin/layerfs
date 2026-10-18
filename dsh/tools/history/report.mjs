#!/usr/bin/env node
// Writes the range reports (#352 SPEC §3, ranges/TEMPLATE.md) and the index:
//   node dsh/tools/history/report.mjs --metrics <dir> --plan <dir> --docs <core/docs/issues/352> [--range N]
//   node dsh/tools/history/report.mjs check <NNN> [--metrics <dir>] [--docs <dir>]   (reportcheck.mjs: F1–F8)
//   node dsh/tools/history/report.mjs regate --metrics <dir> [--split-oneshot]   (dry run: today's gates over recorded metrics; prints only, F2)
//   node dsh/tools/history/report.mjs records [--docs <dir>]   (every fixes/ record states its REBUILD.md §4 kind fields)
//   node dsh/tools/history/report.mjs baseline --run <id> --metrics <dir> --ranges 2-4 [--out <dir>] [--phase pN --note <why>]   (one daemon's, or daemon+addon+phase's, speed baseline)
//   node dsh/tools/history/report.mjs stats --metrics <dir> --docs <dir>   (STATS.md alone, e.g. its backfill)
// A range whose latest attempt recorded the binding format's measurements
// (REPORT_FORMAT.md) is written in that format (format.mjs); earlier ones keep
// the shape they were committed in.
// <metrics>/range-NNN.aK.json is attempt K of range NNN (the runner writes it).
// Only range N's report (default: the latest range) is written, with every
// attempt (SPEC §3 F2): an attempt's gate result is stored in its metrics file
// the first time it is reported and rendered from there ever after; attempts
// recorded before that rule render from git HEAD's report (frozen.mjs). §7
// holds one generated Finding block per optimize or stop attempt (findings.mjs)
// and the lead's note, which is kept verbatim. The pilot's ranges 0-4 set baseline.json.
// Exit code: 0 pass or watch, 3 optimize, 4 stop (of the latest range), so the
// runner knows when to stop and wake the lead.
// It also writes <metrics>/comment-NNN.md for the latest range: the issue
// comment the lead posts on #352 at every range's end (renderComment, a fixed
// format), with `gh issue comment 352 --body-file <it>`.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { aggregate, BASELINE_MIN_N, buildBaseline, evaluate, exponent, MINIMUM_POINTS, reinstallGate, sameBinary, thinClass } from "./gates.mjs";
import { categoryOf, derivedOverview, renderOverview, renderStats } from "./stats.mjs";
import { FINDINGS, loadIssues, renderFormat } from "./format.mjs";
import { change, closedWithoutChange, EVIDENCE_COLUMNS, evidenceRow, kindText, loadFindings } from "./findings.mjs";
import { changedDirs, oneshotSplit, withDirs } from "./steps.mjs";
import { diffTrees } from "./git.mjs";
import { HISTORY as HISTORY_DIR, readTrace } from "./lib.mjs";
import { legacyGates, parseReport, storedGate, storeGate } from "./frozen.mjs";

const pad = (n) => String(n).padStart(3, "0");
const fmt = (v) => (v == null ? "—" : typeof v === "number" ? (Number.isInteger(v) ? v.toLocaleString("en-US") : v.toFixed(2)) : String(v));
const bytes = (n) => (n == null ? "—" : n >= 1 << 30 ? `${(n / 2 ** 30).toFixed(2)} GiB` : n >= 1 << 20 ? `${(n / 2 ** 20).toFixed(1)} MiB` : `${(n / 1024).toFixed(1)} KiB`);
const table = (head, rows) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map(fmt).join(" | ")} |`)].join("\n");
export const LEAD_START = "## 7. Findings and action";
export const LEAD_END = "## 8. Evidence";
export const NOTE_START = "### Lead's note";
export const FINDING_COLUMNS = ["Measure", "Before", "After", "Change", "Old binary", "New binary", "Snapshot / checkpoint", "Cache"];
const NONE_YET = "- (none yet)";

/** Attempts by range: range -> [metrics, ...] in attempt order. */
export function loadAttempts(dir) {
  const byRange = new Map();
  for (const f of readdirSync(dir).filter((f) => /^range-\d+\.a\d+\.json$/.test(f))) {
    const m = JSON.parse(readFileSync(join(dir, f), "utf8"));
    (byRange.get(m.range) || byRange.set(m.range, []).get(m.range)).push(m);
  }
  for (const xs of byRange.values()) xs.sort((a, b) => a.attempt - b.attempt);
  return new Map([...byRange].sort((a, b) => a[0] - b[0]));
}

/**
 * The checkpoint tree each range's scoped probes read (gates.mjs SCOPED), from
 * its oracle: attached in memory to earlier ranges' metrics that predate
 * `inputs`, never written back to a recorded file.
 */
/**
 * Probe points a fix measured with its new daemon on earlier snapshots
 * (`probes-<daemon>.json`: { daemon, points: [{ range, depth, binary, cache, probes }] }),
 * so the new binary's depth fits need not wait three ranges (gates.mjs evaluate).
 */
export function loadSeeds(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /^probes-[0-9a-f]{64}\.json$/.test(f)).flatMap((f) => {
    const x = JSON.parse(readFileSync(join(dir, f), "utf8"));
    return x.points.filter((p) => p.binary?.daemon === x.daemon);
  });
}

export function withInputs(m, oracleDir) {
  if (m.inputs) return m;
  const file = join(oracleDir, `oracle-${pad(m.range)}.json`);
  if (!existsSync(file)) return m;
  const o = JSON.parse(readFileSync(file, "utf8"));
  return { ...m, inputs: { tree: { files: o.files, bytes: o.bytes } } };
}

/** One range's report, following ranges/TEMPLATE.md. */
const STAGES = [["prepare", "prepareMs"], ["play", "playMs"], ["consolidate", "consolidateMs"], ["verify", "verifyMs"], ["version walk", "versionMs"], ["probes", "probesMs"], ["tests", "testsMs"],
  ["metrics", "metricsMs"], ["Store allocation", "diskMs"], ["seal", "sealMs"], ["sealed figures", "figuresMs"], ["snapshot copy", "snapshotMs"], ["report", "reportMs"]];

/** The runner's wall time per stage: tooling time, never operation latency. */
export function stageLine(wall) {
  if (!wall) return "—";
  const parts = STAGES.filter(([, k]) => wall[k] != null).map(([name, k]) => `${name} ${fmt(wall[k] / 1000)}${k === "verifyMs" && wall.verify ? ` (${wall.verify})` : ""}`);
  return `${fmt(wall.totalMs / 1000)} s tooling: ${parts.join(" · ")}`;
}

/** The delta row of §5: shares, refusals and the depth histogram per role. */
export function deltaLine(d) {
  if (!d?.depths) return null;
  const hist = (list) => (list?.length ? list.map((n, depth) => (n ? `${depth}:${n}` : null)).filter(Boolean).join(" ") : "—");
  return `${fmt(d.share)} of ${d.objects} stored objects are deltas · at cap ${fmt(d.atCap)} (${d.atCapObjects}) · refused bases: budget ${d.refusedByBudget}, cap ${d.refusedByCap} (budget share ${fmt(d.byBudget)}) · depths whole-file [${hist(d.depths.wholeFile)}] chunk [${hist(d.depths.chunk)}] metadata [${hist(d.depths.metadata)}] (caps ${d.caps.wholeFile}/${d.caps.chunk}/${d.caps.metadata})`;
}

/** A finding's value with its unit. */
const withUnit = (v, unit) => `${fmt(v)}${unit ? ` ${unit}` : ""}`;

/** One improvement row of F4's before/after table. */
const improvementRow = (r) => [r.measure, withUnit(r.before, r.unit), withUnit(r.after, r.unit), change(r.before, r.after),
  `\`${r.oldBinary}\``, `\`${r.newBinary}\``, r.snapshot, r.cache];

/**
 * The Finding block of attempt K (SPEC §3 F3–F5, TEMPLATE.md §7), from its
 * finding record; until the record exists, "Diagnosis pending" naming it.
 * Links are relative to ranges/.
 */
export function renderFinding(range, attempt, f) {
  const head = `### Finding ${pad(range)}.a${attempt}`, file = `finding-${pad(range)}.a${attempt}.json`;
  if (!f) return [head, "", `Diagnosis pending: \`${file}\`.`].join("\n");
  const d = f.diagnosis;
  return [head, "", table(["", ""], [
    ["Trigger", `${f.trigger.check} · ${f.trigger.value}${f.trigger.threshold ? ` · threshold ${f.trigger.threshold}` : ""}`],
    ["Diagnosis", `${d.step} · ${d.summary}${d.counter ? ` · counter \`${d.counter}\`` : ""}${d.exponent ? `, exponent ${d.exponent.before} → ${d.exponent.after}` : ""}`],
    ["Fix", closedWithoutChange(f) ? `${f.fix.summary} · ${kindText(f.fix.kind)}` : `${f.fix.summary} · ${kindText(f.fix.kind)} · commits ${String(f.fix.commit).split(/,\s*/).map((c) => `\`${c}\``).join(", ")}${f.fix.test ? ` · regression tests ${f.fix.test}` : ""}`],
    ["Recovery", f.recovery],
    ["Records", [...(f.records ?? []).map((r) => `[${r.title}](../${r.path})`), ...(f.ledger ?? []).map((l) => `[${l.file}](../${l.file}) (${l.entry})`)].join(" · ")],
  ]), "", closedWithoutChange(f) ? table(EVIDENCE_COLUMNS, f.evidence.map(evidenceRow)) : table(FINDING_COLUMNS, f.improvement.map(improvementRow))].join("\n");
}

/**
 * The lead's note of an existing report, kept verbatim. A report from before
 * the Finding blocks has the lead's text as all of §7: it becomes the note,
 * less the improvement table the Finding block now generates.
 */
export function leadNote(old) {
  if (old && !old.includes(LEAD_START) && old.includes(`\n${FINDINGS}`) && old.includes(`\n${NOTE_START}`)) {
    // the binding format (format.mjs): the note runs from its heading to the appendix
    const at = old.indexOf(`\n${NOTE_START}`), end = old.indexOf("\n## Appendix", at);
    const body = old.slice(old.indexOf("\n", at + 1) + 1, end < 0 ? undefined : end);
    return body.trim() === NONE_YET ? null : body;
  }
  if (!old || !old.includes(LEAD_START)) return null;
  const end = old.indexOf(`\n${LEAD_END}`);
  if (old.includes(`\n${NOTE_START}`)) {
    const at = old.indexOf(`\n${NOTE_START}`);
    const body = old.slice(old.indexOf("\n", at + 1) + 1, end);
    return body.trim() === NONE_YET ? null : body;
  }
  const at = old.indexOf(LEAD_START);
  const body = old.slice(old.indexOf("\n", at) + 1, end);
  const kept = [];
  let skipping = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("| Improvement |")) skipping = true;
    if (skipping && !line.startsWith("|")) skipping = false;
    if (!skipping) kept.push(line);
  }
  const text = kept.join("\n").replace(/\n{3,}/g, "\n\n");
  return text.trim() === NONE_YET ? null : text;
}

/**
 * The speed baselines by daemon (SPEC §4): baseline.json (the pilot's, daemon
 * 511dceed) and one baseline-<daemon12>.json per later daemon, each built from
 * one re-baseline run under that daemon alone (`report.mjs baseline`). An
 * attempt is compared with its own daemon's baseline; none mixes daemons.
 */
export function loadBaselines(metricsDir, pilot = null) {
  const out = new Map(pilot ? [[pilot.daemon ?? null, pilot]] : []);
  if (!existsSync(metricsDir)) return out;
  for (const f of readdirSync(metricsDir).filter((f) => /^baseline-[0-9a-f]{12}(-[0-9a-f]{12}-p\d)?\.json$/.test(f))) {
    const b = JSON.parse(readFileSync(join(metricsDir, f), "utf8"));
    if (!b.daemon || f !== baselineName(b)) throw new Error(`${f} is not named by its daemon, addon and phase (${baselineName(b)})`);
    const key = baselineKey(b);
    if (out.has(key)) throw new Error(`two baselines for ${key}`);
    out.set(key, b);
  }
  return out;
}

/** A baseline's file name: by daemon (P1, before phase matching), or by daemon, addon and phase. */
export const baselineName = (b) => `baseline-${b.daemon.slice(0, 12)}${b.phase ? `-${String(b.sdk).slice(0, 12)}-${b.phase}` : ""}.json`;
const baselineKey = (b) => (b.phase ? `${b.daemon}|${b.sdk}|${b.phase}` : b.daemon ?? null);

/**
 * The speed baseline of an attempt (never a mix): the phase-matched one for its
 * daemon, addon and phase; for P1 only, a P1 daemon baseline (by daemon) or the
 * pilot's. From P2 on, no phase-matched baseline means none (Speed not judged).
 */
export function baselineFor(baselines, m, pilot = null) {
  const exact = baselines.get(`${m.binary?.daemon}|${m.binary?.sdk}|${m.phase}`);
  if (exact) return exact;
  if (m.phase && m.phase !== "p1") return null;
  return baselines.get(m.binary?.daemon ?? null) ?? pilot;
}

/**
 * Builds the speed baseline of one daemon from a re-baseline run's metrics
 * (`ranges`, latest attempt each, all their size classes) into
 * <out>/baseline-<daemon12>.json. Refuses unmeasured attempts, a mix of
 * daemons, a missing range and a daemon that has a baseline (one series per binary, F2).
 */
export function writeBaseline({ metricsDir, ranges, out, run, phase = null, note = null }) {
  const attempts = loadAttempts(metricsDir);
  const ms = ranges.map((k) => { const m = attempts.get(k)?.at(-1); if (!m) throw new Error(`no attempt of range ${k} in ${metricsDir}`); return m; });
  if (ms.some((m) => m.mode !== "measured")) throw new Error("a baseline takes measured attempts only");
  const sdks = new Set(ms.map((m) => m.binary?.sdk)), phases = new Set(ms.map((m) => m.phase));
  if (phase && (sdks.size > 1 || phases.size > 1 || !phases.has(phase))) throw new Error(`a ${phase} baseline mixes addons (${[...sdks].join(", ")}) or phases (${[...phases].join(", ")})`);
  const b = { ...buildBaseline(ms), ...(phase ? { sdk: [...sdks][0], phase } : {}), run, source: metricsDir, built: new Date().toISOString(), ...(note ? { note } : {}) };
  const pilot = join(out, "baseline.json");
  if (loadBaselines(out, existsSync(pilot) ? JSON.parse(readFileSync(pilot, "utf8")) : null).has(baselineKey(b))) throw new Error(`${baselineKey(b)} already has a baseline in ${out}`);
  const file = join(out, baselineName(b));
  writeFileSync(file, JSON.stringify(b, null, 1));
  return { file, baseline: b };
}

/** A baseline with n per class (F-024), summed from the latest attempt of each of its ranges in `attempts`; marked derived. */
export function withBaselineN(b, attempts) {
  const per = {};
  b.ranges.forEach((k, i) => { for (const r of attempts.get(k)?.at(-1)?.ops ?? []) (per[`${r.op}\u0000${r.sizeClass}`] ??= b.ranges.map(() => 0))[i] += r.n ?? 0; });
  const of = (k) => per[k] ?? b.ranges.map(() => 0);
  return { ...b, ops: Object.fromEntries(Object.entries(b.ops).map(([k, v]) => [k, { ...v, n: of(k).reduce((x, y) => x + y, 0), perRange: of(k) }])), derived: { ...(b.derived ?? {}), n: "F-024: n and perRange from the stored ranges' ops (latest attempt each)" } };
}

/** The latency table of an attempt that recorded its calls (REPORT_OVERVIEW.md, SPEC §3c): classes, ×baseline, slopes, SQL work, FUSE. */
export function latencyRows(m, history = [], baseline = null) {
  const own = history.filter(sameBinary(m));
  const series = (r, x) => [...own, m].map((h) => [x(h), (h.ops || []).find((o) => o.op === r.op && o.sizeClass === r.sizeClass)?.p50]);
  const comparable = baseline && (baseline.daemon ?? null) === (m.binary?.daemon ?? null);
  // SPEC §5: both series, each class suffixed · uncontended / · contended; against a baseline
  // re-derived from traces, the rows classed the same way (opsTrace)
  return (baseline?.derivation === "trace" && m.opsTrace ? m.opsTrace : m.ops || []).map((r) => {
    const b = comparable ? baseline.ops[`${r.op}\u0000${r.sizeClass}`] : null;
    const depth = exponent(series(r, (h) => h.depth?.after)), tree = exponent(series(r, (h) => h.inputs?.tree?.files));
    return [r.op, r.sizeClass, r.n, r.p50, r.p95, r.p99, r.max, b ? `${(r.p50 / b.p50).toFixed(2)}×` : "no baseline", b ? `${(r.p95 / b.p95).toFixed(2)}×` : "no baseline",
      depth ?? "—", tree ?? "—", r.sql ? `${fmt(r.sql.statements)} / ${fmt(r.sql.vm_steps)} / ${fmt(r.sql.fullscan_steps)}` : "—", r.fuse ?? "—",
      r.perUnit ? `${r.perUnit.ms} ms per ${r.perUnit.kind.replace(/s$/, "")}` : "—", r.slowPhase];
  });
}

const LATENCY_HEAD = ["Operation", "Size class", "n", "p50", "p95", "p99", "max", "×base p50", "×base p95", "Depth slope", "Tree slope", "SQL p50: statements / VM steps / full-scan steps", "FUSE opcodes p50 per exec", "Per unit (p50)", "Slowest phase"];

export function renderRange({ plan, summary, attempts, gates, lead, findings = [], history = [], baseline = null }) {
  const m = attempts.at(-1), g = gates.at(-1);
  const w = m.work || {}, s = m.storage || {};
  const out = [];
  const full = !!(m.overview && m.calls);
  out.push(`# Range ${pad(plan.range)}`, "", "> Generated by `dsh/tools/history/report.mjs`. The lead writes §7. A rerun adds an attempt and never replaces one.", "");
  if (full) out.push(renderOverview({ range: plan.range, verdict: g.verdict, m }), "");
  out.push(table(["", ""], [
    ["Verdict", `**${g.verdict}**`],
    ["dsh commits", `\`${plan.dsh.first.slice(0, 9)}\` .. \`${plan.checkpoint.slice(0, 9)}\`: ${plan.dsh.commits} commits, ${plan.dsh.mainline} mainline steps`],
    ["Checkpoint", `\`${plan.checkpoint}\`, tree \`${plan.tree.slice(0, 12)}\``],
    ["LayerFS depth", `${fmt(m.depth?.before)} → ${fmt(m.depth?.after)} Commits`],
    ["Binary", `daemon \`${m.binary?.daemon ?? "?"}\`, SDK \`${m.binary?.sdk ?? "?"}\`, image \`${m.binary?.image ?? "?"}\`, plan v${m.plan?.version ?? "?"}`],
    ["Snapshot", m.snapshot ? `${plan.milestone ? "milestone, " : ""}${bytes(m.snapshot.newBytes)} new of ${bytes(m.snapshot.size)}; seal ${fmt(m.snapshot.sealMs ?? null)} ms, copy ${fmt(m.snapshot.copyMs)} ms` : plan.snapshot ? "planned, not taken" : "none"],
    ["Wall time (tooling, not operation latency)", stageLine(m.wall)],
  ]), "");
  out.push("## Attempts", "", table(["#", "Binary", "Started", "Result", "Reason"], attempts.map((a, i) => [
    String(a.attempt), gates[i].binary, gates[i].started, gates[i].verdict, gates[i].reason,
  ])), "");
  out.push("## 1. Checks", "", table(["Check", "Value", "Threshold", "Result"], g.checks.map((c) => [c.name, c.value, c.threshold, c.result])), "");
  if (full) out.push(...workSection(plan, summary, m));
  else out.push("## 2. Work", "", table(["Count", "Planned", "Observed"], [
    ["Steps (bash calls)", summary.bashCalls, w.bashCalls],
    ["Lanes / agents", `${summary.lanes} / ${summary.agents}`, w.lanes != null ? `${w.lanes} / ${w.agents}` : null],
    ["LayerFS Commits", summary.lfsCommits, w.lfsCommits],
    ["Workspaces (one-shot share)", `${summary.workspaces} (${summary.oneShotShare})`, w.workspaces != null ? `${w.workspaces} (${w.oneShotShare})` : null],
    ["File mutations fs : Sandbox", `${summary.fileMutations.fs} : ${summary.fileMutations.sandbox}`, w.fileMutations ? `${w.fileMutations.fs} : ${w.fileMutations.sandbox}` : null],
    ["Reads", summary.reads, w.reads],
    ["Reconcile writes", summary.reconcile, w.reconcile],
    ["Planned conflicts", summary.conflicts.join(", ") || "none", m.checks?.conflicts ? `${m.checks.conflicts.hit}/${m.checks.conflicts.planned}` : null],
  ]), "");
  if (!full) {
    out.push(table(["Agent", "Steps", "Commits"], Object.entries(summary.perAgent).map(([a, v]) => [a, v.steps, v.commits])), "");
    out.push(table(["Branch", "Commits"], Object.entries(summary.perLane)), "");
  }
  const binary = `Binary: daemon \`${(m.binary?.daemon ?? "?").slice(0, 12)}\` (attempt ${m.attempt}).`;
  if (full) out.push("## 3. Operation latency", "", binary, "", "Size classes are each call's own input (bytes, entries, files in scope, entries changed, files changed); `—` only for calls with no input. ×base compares the same operation and class only. Slopes are log-log exponents of p50 against LayerFS depth and against tree files, over this daemon's ranges (`—` under 3 points).", "",
    (m.ops || []).length ? table(LATENCY_HEAD, latencyRows(m, history, baseline)) : "No operations recorded.", "");
  else out.push("## 3. Operation latency", "", binary, "", (m.ops || []).length
    ? table(["Operation", "Size class", "n", "p50", "p95", "p99", "max", "Slowest phase"], m.ops.map((r) => [r.op, r.sizeClass, r.n, r.p50, r.p95, r.p99, r.max, r.slowPhase]))
    : "No operations recorded.", "");
  out.push("## 4. Scale probes", "", binary, "", Object.keys(m.probes || {}).length
    ? table(["Probe", "ms", "Counters"], Object.entries(m.probes).map(([k, p]) => [k, p.ms, Object.entries(p.counters || {}).map(([c, n]) => `${c} ${n}`).join(", ")]))
    : "No probes recorded.", "");
  out.push("## 5. Storage", "", table(["Measure", "Value"], [
    ["Logical / canonical / stored / metadata", `${bytes(s.logical)} / ${bytes(s.canonical)} / ${bytes(s.stored)} / ${bytes(s.metadata)}`],
    ["Deduplication (logical / canonical)", s.canonical ? s.logical / s.canonical : null],
    ["Compression (canonical / stored)", s.stored ? s.canonical / s.stored : null],
    ["New stored per changed byte", s.changedBytes ? s.newStored / s.changedBytes : null],
    ["Directory share of new bytes", s.directoryShare],
    ["Delta share / at cap / stopped by budget", s.delta ? `${fmt(s.delta.share)} / ${fmt(s.delta.atCap)} / ${fmt(s.delta.byBudget)}` : null],
    ["Delta, this range", deltaLine(s.delta)],
    ["Delta, since Init", deltaLine(s.deltaTotal)],
    ["node_modules reinstall growth", s.reinstall ? reinstallGate(s.reinstall).value : null],
    ["New stored bytes this range", bytes(s.newStored)],
  ]), "");
  out.push("## 6. Trends", "", m.trends?.length ? m.trends.map((t) => `- ${t}`).join("\n") : "Written by the runner from the last 3 ranges.", "");
  out.push(LEAD_START, "");
  for (const [i, a] of attempts.entries()) {
    if (gates[i].verdict === "optimize" || gates[i].verdict === "stop") out.push(renderFinding(plan.range, a.attempt, findings.find((f) => f.attempt === a.attempt)), "");
  }
  out.push(`${NOTE_START} (written by the lead)`, "", lead?.trim() ? lead.trim() : NONE_YET, "", "");
  out.push(`${LEAD_END}`, "", ...attempts.map((a) => `- \`~/lfs-history/metrics/range-${pad(a.range)}.a${a.attempt}.json\``),
    ...findings.map((f) => `- \`~/lfs-history/metrics/finding-${pad(f.range)}.a${f.attempt}.json\``), "");
  return out.join("\n");
}

/** §2 Work of an attempt that recorded its calls: played beside planned, mutations, the per-method call table. */
function workSection(plan, summary, m) {
  const w = m.work, o = m.overview, mu = w.mutations ?? {};
  const pp = (played, planned) => [played ?? "—", planned ?? "—"];
  const muCell = (x) => (x ? `${fmt(x.added)} added, ${fmt(x.modified)} modified, ${fmt(x.deleted)} deleted; ${bytes(x.bytes)}` : "0");
  const left = Object.entries(w.leftOut ?? {});
  const planStepsOf = (a) => plan.steps.filter((s) => s.agent === a).length;
  const planCommitsOf = (a) => summary.perAgent?.[a]?.commits;
  return ["## 2. Work", "", table(["Count", "Played", "Planned"], [
    ["Steps (bash calls)", ...pp(w.bashCalls, summary.bashCalls)],
    ["Lanes / agents", `${o.branches.length - 1} / ${o.agents.length - 1}`, `${summary.lanes} / ${summary.agents}`],
    ["LayerFS Commits", ...pp(w.lfsCommits, summary.lfsCommits)],
    ["Workspaces (one-shot share)", `${fmt(w.workspaces)} (${fmt(w.oneShotShare)}); ${fmt(w.longLived)} long-lived`, `${summary.workspaces} (${summary.oneShotShare})`],
    ["File mutations fs : Sandbox", `${fmt(w.fileMutations?.fs)} : ${fmt(w.fileMutations?.sandbox)}`, `${summary.fileMutations.fs} : ${summary.fileMutations.sandbox}`],
    ["fs mutations", muCell(mu.fs), "—"],
    ["Sandbox mutations", muCell(mu.sandbox), "—"],
    ["Reads", ...pp(w.reads, summary.reads)],
    ["Reconcile writes", ...pp(w.reconcile, summary.reconcile)],
    ["Planned conflicts (hit / planned)", o.conflicts.map((c) => `${c.title} ${c.hit}/${c.planned}`).join(", "), summary.conflicts.join(", ") || "none"],
    ["Left out (not played in this phase)", left.length ? left.map(([k, n]) => `${k} ${n}`).join(", ") : "none", "—"],
  ]), "",
  table(["Agent", "Steps played", "Steps planned", "Commits played", "Commits planned"], o.agents.map((a) => [a.agent, a.steps, a.agent === "lead" ? plan.consolidation.length + 1 : planStepsOf(a.agent), a.commits, a.agent === "lead" ? "—" : planCommitsOf(a.agent) ?? 0])
    .concat(plan.agents.filter((a) => !o.agents.some((x) => x.agent === a)).map((a) => [a, 0, planStepsOf(a), 0, planCommitsOf(a) ?? 0]))), "",
  table(["Branch", "Commits played", "Commits planned"], o.branches.map((b) => [b.name, b.commits, b.name === "main" ? "—" : summary.perLane?.[b.name] ?? "—"])
    .concat(Object.keys(summary.perLane ?? {}).filter((l) => !o.branches.some((b) => b.name === l)).map((l) => [l, 0, summary.perLane[l]]))), "",
  table(["Method", "Category", "Calls", "Bytes in", "Bytes out", "Files / entries", "Outcomes"], Object.entries(m.calls).map(([meth, r]) => [meth, categoryOf(meth) ?? "unassigned", r.n, bytes(r.bytesIn), bytes(r.bytesOut), r.files,
    Object.entries(r.outcomes).map(([k, n]) => `${k} ${n}`).join(", ")])), ""];
}

const REPORTS = "https://github.com/Ephemeral-AI-Lab/layerfs/blob/dsh-history-replay/core/docs/issues/352/ranges";

/**
 * The optimization part of a range's comment (SPEC §3): "none" when no
 * attempt of the range tripped a gate; for an attempt that just did, its
 * trigger and the diagnosis still pending; for a rerun, the finding of the
 * attempt before it (findings.mjs): trigger, diagnosis, fix, the old-vs-new
 * improvement, and what the tripped check reads now.
 */
export function renderOptimization({ plan, attempts, gates, findings = [] }) {
  const m = attempts.at(-1), g = gates.at(-1);
  const tripped = g.checks.filter((x) => x.result === "optimize" || x.result === "stop");
  if (tripped.length) {
    const own = findings.find((f) => f.attempt === m.attempt);
    // the earlier attempts' findings follow, so every recorded finding of the range is in the comment (F3)
    const earlier = findings.filter((x) => x.attempt < m.attempt).map((f) => findingComment(f, g, earlierTitle(f)));
    if (own) return [findingComment(own, g, closedWithoutChange(own) ? earlierTitle(own) : `${own.verdict === "stop" ? "Bug" : "Optimization"} (attempt ${own.attempt})`), ...earlier].join("\n\n");
    const lines = [`#### ${g.verdict === "stop" ? "Bug" : "Optimization"} needed`, ""];
    for (const x of tripped) lines.push(`- **Trigger:** ${x.name}: ${x.value} (threshold ${x.threshold})`);
    lines.push(`- **Diagnosis:** pending; the fixer records it in \`finding-${pad(plan.range)}.a${m.attempt}.json\`.`);
    return [lines.join("\n"), ...earlier].join("\n\n");
  }
  const fs = findings.filter((x) => x.attempt < m.attempt);
  if (!fs.length) return "**Optimization:** none.";
  return fs.map((f) => findingComment(f, g, earlierTitle(f))).reverse().join("\n\n");
}

/** The comment heading of an earlier attempt's finding. */
const earlierTitle = (f) => (closedWithoutChange(f) ? `Attempt ${f.attempt}: closed without a code change` : `${f.verdict === "stop" ? "Bug fixed" : "Optimization"} (from attempt ${f.attempt})`);

/** A finding in the issue comment, from the same record as the report's Finding block. */
function findingComment(f, g, title) {
  const d = f.diagnosis, now = g.checks.find((x) => x.name === f.trigger.check);
  return [
    `#### ${title}`, "",
    `- **Trigger:** ${f.trigger.check}: ${f.trigger.value}${f.trigger.threshold ? ` (threshold ${f.trigger.threshold})` : ""}`,
    `- **Diagnosis:** ${d.step} · ${d.summary}${d.phase ? ` · phase \`${d.phase}\`` : ""}${d.counter ? ` · counter \`${d.counter}\`` : ""}${d.exponent ? ` · depth exponent ${d.exponent.before} → ${d.exponent.after}` : ""}`,
    closedWithoutChange(f) ? `- **Closed without a code change:** ${f.fix.summary}`
      : `- **Fix:** ${f.fix.summary} · ${kindText(f.fix.kind)} · commit \`${String(f.fix.commit).slice(0, 9)}\`${f.fix.test ? ` · regression test \`${f.fix.test}\`` : ""}`,
    `- **Recovery:** ${f.recovery}`,
    `- **Now:** ${now ? `${now.name} ${now.result}: ${now.value}` : "the check no longer applies"}`, "",
    closedWithoutChange(f) ? table(["Evidence", ...EVIDENCE_COLUMNS.slice(1)], f.evidence.map(evidenceRow)) : table(["Improvement", ...FINDING_COLUMNS.slice(1)], f.improvement.map(improvementRow)), "",
    `Record: ${f.record ?? [...(f.records ?? []).map((r) => r.path), ...(f.ledger ?? []).map((l) => `${l.file} (${l.entry})`)].join(", ")}`,
  ].join("\n");
}

/**
 * The #352 issue comment for a range's latest attempt, in a fixed format:
 * headline, the checks that did not pass, work, latency (the three slowest
 * operations by p95), storage, the optimization part, and what happens next.
 */
export function renderComment({ plan, summary, attempts, gates, findings = [] }) {
  const m = attempts.at(-1), g = gates.at(-1), c = m.checks || {}, s = m.storage || {}, w = m.work || {};
  const next = { pass: "Continues with the next range.", watch: "Continues; the watch items get probes at the next milestone.",
    optimize: "The runner stopped: the fixer diagnoses and fixes, then the run resumes from the snapshot (SPEC §6).",
    stop: "The runner stopped: bug cycle, no retry (SPEC §6)." }[g.verdict];
  const failing = g.checks.filter((x) => x.result !== "pass");
  const slow = [...(m.ops || [])].sort((a, b) => b.p95 - a.p95).slice(0, 3);
  return [
    `### Range ${pad(plan.range)} · **${g.verdict}** · attempt ${m.attempt}`, "",
    `dsh \`${plan.dsh.first.slice(0, 9)}\`..\`${plan.checkpoint.slice(0, 9)}\` (${plan.dsh.commits} commits) · depth ${fmt(m.depth?.before)} → ${fmt(m.depth?.after)} · daemon \`${m.binary?.daemon ?? "?"}\` · wall ${m.wall ? `${fmt(m.wall.totalMs / 1000)} s` : "—"}`, "",
    `**Tooling time (not operation latency):** ${stageLine(m.wall)}`, "",
    failing.length ? table(["Check", "Value", "Result"], failing.map((x) => [x.name, x.value, x.result])) : `All ${g.checks.length} checks pass.`, "",
    `**Work:** ${fmt(w.bashCalls ?? summary?.bashCalls)} bash calls · ${fmt(w.lfsCommits ?? summary?.lfsCommits)} LayerFS Commits · conflicts ${c.conflicts ? `${c.conflicts.hit}/${c.conflicts.planned}` : "—"} · unit tests ${c.tests ? `${c.tests.equal}/${c.tests.run} equal to native` : "—"}`,
    `**Slowest p95:** ${slow.length ? slow.map((r) => `${r.op}${r.sizeClass && r.sizeClass !== "—" ? ` (${r.sizeClass})` : ""} ${fmt(r.p95)} ms`).join(" · ") : "—"}`,
    `**Storage:** +${bytes(s.newStored)} stored (total ${bytes(s.stored == null ? null : s.stored + (s.metadata ?? 0))}) · dedupe ${s.canonical ? fmt(s.logical / s.canonical) : "—"} · compression ${s.stored ? fmt(s.canonical / s.stored) : "—"} · snapshot ${m.snapshot ? `+${bytes(m.snapshot.newBytes)} in ${fmt(m.snapshot.copyMs)} ms` : "none"}`,
    `**Delta:** ${s.delta ? `share ${fmt(s.delta.share)} · at cap ${fmt(s.delta.atCap)} · budget share of refusals ${fmt(s.delta.byBudget)}` : "—"}`, "",
    renderOptimization({ plan, attempts, gates, findings }), "",
    `**Next:** ${next}`, "",
    `Report: [range-${pad(plan.range)}.md](${REPORTS}/range-${pad(plan.range)}.md)`, "",
  ].join("\n");
}

/** STATS.md (REPORT_OVERVIEW.md §4): every range's latest attempt; those recorded before the Overview, derived. */
export function writeStats(attempts, docs) {
  writeFileSync(join(docs, "STATS.md"), renderStats([...attempts].map(([k, ys]) => {
    const m = ys.at(-1);
    return m.overview && m.calls ? { range: k, m, overview: m.overview, calls: m.calls, derived: false } : { range: k, m, ...derivedOverview(m) };
  })));
}

/** RANGES.md: one row per range, linking its report. */
export function renderIndex(rows) {
  return ["# Ranges", "", "> Generated by `dsh/tools/history/report.mjs`; one row per range.", "",
    table(["Range", "dsh commits", "Depth", "Verdict", "Worst check", "New stored", "Report"], rows.map((r) => [
      pad(r.range), r.dshCommits, r.depth, `**${r.verdict}**`, r.worst, bytes(r.newStored), `[range-${pad(r.range)}](ranges/range-${pad(r.range)}.md)`])), ""].join("\n");
}

/**
 * Writes range `range`'s report and comment and the index (SPEC §3 F2): no
 * other range's report is touched. Attempts with a stored gate result render
 * from it; legacy attempts from git HEAD's report; any other attempt is
 * evaluated now, once, and its result stored in its metrics file.
 * @returns {{ verdict: string, file: string, comment: string }}
 */
/** The Commits the probe setup made in one attempt's trace (F-015): Committed fs/sandbox calls labelled probe-setup:. */
export function probeSetupCommits(trace) {
  return trace.split("\n").filter(Boolean).map((l) => JSON.parse(l))
    .filter((d) => d.phase === "end" && String(d.step ?? "").startsWith("probe-setup:") && d.kind === "Committed" && /^(fs|sandbox)\./.test(d.method)).length;
}

/**
 * F-019 for an attempt recorded before the changed directories were counted:
 * its checkpoint diff with the changed ancestor directories of git's change
 * set between the range's base and checkpoint (which the checkpoint proved the
 * diff lists). Returns `m` unchanged when it has them or has no such diff.
 */
export function withDirsFromGit(m, { repo, planDir }) {
  const d = m.perUnit?.["branch.diff_commits"];
  if (!d || d.basis !== "checkpoint" || !m.range) return m;
  const plan = (k) => JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
  const dirs = changedDirs(diffTrees(repo, plan(m.range - 1).checkpoint, plan(m.range).checkpoint).map((c) => c.path));
  return { ...m, perUnit: { ...m.perUnit, "branch.diff_commits": withDirs(d, dirs, "git") } };
}

/**
 * The dry run (F2: prints only): every range's latest attempt in `metricsDir`
 * re-evaluated by today's gates.mjs over the same history, seeds and
 * per-daemon baselines (`baselinesDir`), beside its stored verdict. Writes
 * nothing: no stored gate, report, comment or baseline.
 * @returns {{ range, attempt, run, daemon, stored, verdict, worst: { name, result, value } }[]}
 */
/** A stored attempt's trace, if its run kept it: <history>/runs/<run>/trace/range-NNN.aK.jsonl. */
const traceOf = (m, history = HISTORY_DIR) => join(history, "runs", String(m.run), "trace", `range-${pad(m.range)}.a${m.attempt}.jsonl`);

/**
 * The one-shot probe split (steps.mjs oneshotSplit) for an attempt recorded
 * before it: its `oneshot_mount_exec` sequence re-read from its stored trace
 * into the two new probes, in memory only (`derived: "trace"`); the old
 * probe's recorded value and verdict stay. Without the trace it is unchanged.
 */
/**
 * SPEC §5 (uncontended vs contended): an attempt recorded before the split
 * gets `opsTrace`, its calls classed from its stored trace alone (overlap and
 * outcome from the trace; sizes the trace carries). Without the trace it is
 * returned unchanged, and Speed against a re-derived baseline is not judged.
 */
export function withSplitProbe(m, history = HISTORY_DIR) {
  if (!m.probes?.oneshot_mount_exec || m.probes.oneshot_mount_unmount) return m;
  const file = traceOf(m, history);
  if (!existsSync(file)) return m;
  const split = oneshotSplit(readTrace(file).all.filter((l) => l.step === "probe:oneshot_mount_exec"));
  if (!split) return m;
  const { oneshot_mount_exec: old, ...rest } = m.probes;
  return { ...m, probes: { ...rest, oneshot_mount_unmount: { ...split.oneshot_mount_unmount, derived: "trace" }, oneshot_exec: { ...split.oneshot_exec, derived: "trace" } } };
}

export function withTraceOps(m, history = HISTORY_DIR) {
  if (m.opsTrace) return m;
  const file = traceOf(m, history);
  return existsSync(file) ? { ...m, opsTrace: aggregate(readTrace(file).callsTrace) } : m;
}

/**
 * Re-derives a baseline into both series from its runs' stored traces (SPEC
 * §5): per range its latest attempt's trace, classed from the trace alone,
 * through buildBaseline (n and perRange per class). The file keeps its
 * daemon, probes, phase and addon; the earlier classes stay as `previousOps`
 * and earlier reports keep their recorded verdicts (F2). Null when a range
 * has no stored trace.
 */
export function rederiveBaseline(b, run, history = HISTORY_DIR) {
  const dir = join(history, "runs", run, "trace");
  const per = [];
  for (const k of b.ranges) {
    const tries = existsSync(dir) ? readdirSync(dir).map((f) => new RegExp(`^range-${pad(k)}\\.a(\\d+)\\.jsonl$`).exec(f)).filter(Boolean).map((x) => Number(x[1])) : [];
    if (!tries.length) return null;
    const file = join(dir, `range-${pad(k)}.a${Math.max(...tries)}.jsonl`);
    per.push({ range: k, binary: { daemon: b.daemon }, ops: aggregate(readTrace(file).callsTrace) });
  }
  const fresh = buildBaseline(per);
  return { ...b, ops: fresh.ops, previousOps: b.previousOps ?? b.ops, derivation: "trace", derived: { ...(b.derived ?? {}), series: `SPEC §5: uncontended/contended classes re-derived from ${run}'s stored traces (classes from the trace alone)` } };
}

export function regate({ metricsDir, oracleDir, baselinesDir = metricsDir, repo = null, planDir = null, split = false }) {
  const attempts = loadAttempts(metricsDir);
  const last = [...attempts.values()].map((ys) => ys.at(-1)).map((m) => (split ? withSplitProbe(m) : m)).map((m) => withTraceOps(withInputs(m, oracleDir)))
    .map((m) => (repo && planDir ? withDirsFromGit(m, { repo, planDir }) : m));
  const pilotFile = join(baselinesDir, "baseline.json");
  const pilot = existsSync(pilotFile) ? JSON.parse(readFileSync(pilotFile, "utf8")) : null;
  const baselines = loadBaselines(baselinesDir, pilot);
  const seeds = loadSeeds(metricsDir).map((p) => withInputs(p, oracleDir));
  return last.map((m) => {
    const g = evaluate(m, last.filter((x) => x.range < m.range), m.range < 5 ? null : baselineFor(baselines, m, pilot), undefined, seeds);
    const rank = { pass: 0, watch: 1, optimize: 2, stop: 3 };
    const worst = g.checks.reduce((w, c) => (rank[c.result] > rank[w.result] ? c : w), { name: "—", result: "pass", value: "" });
    return { range: m.range, attempt: m.attempt, run: m.run, daemon: String(m.binary?.daemon ?? "?").slice(0, 8), stored: m.gate?.verdict ?? "—", verdict: g.verdict,
      worst: { name: worst.name, result: worst.result, value: String(worst.value) },
      ...(split ? { oneshot: g.checks.filter((c) => /oneshot_(mount|exec)/.test(`${c.name} ${c.value}`)).map((c) => `${c.name} ${c.result}: ${c.value}`) } : {}) };
  });
}

export function reportRange({ metricsDir, planDir, docs, oracleDir, range }) {
  const summaries = new Map(JSON.parse(readFileSync(join(planDir, "plan.json"), "utf8")).ranges.map((r) => [r.range, r]));
  const attempts = loadAttempts(metricsDir), findings = loadFindings(metricsDir);
  const xs = attempts.get(range);
  if (!xs) throw new Error(`no attempt of range ${range} in ${metricsDir}`);
  const last = [...attempts.values()].map((ys) => ys.at(-1));
  const pilot = last.filter((m) => m.range < 5);
  // The baseline is the complete pilot's ranges measured with its newest daemon (never a mix).
  const pilotDaemon = pilot.at(-1)?.binary?.daemon;
  const pilotOwn = pilot.filter((m) => m.binary?.daemon === pilotDaemon);
  const baselineFile = join(metricsDir, "baseline.json");
  const pilotBaseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, "utf8"))
    : pilot.length === 5 && pilotOwn.length >= MINIMUM_POINTS ? buildBaseline(pilotOwn) : null;
  const baselines = loadBaselines(metricsDir, pilotBaseline);
  const baselineOf = (m) => baselineFor(baselines, m, pilotBaseline);
  const baseline = baselineOf(xs.at(-1));
  const seeds = loadSeeds(metricsDir).map((p) => withInputs(p, oracleDir));
  if (pilotBaseline && !existsSync(baselineFile)) writeFileSync(baselineFile, JSON.stringify(pilotBaseline, null, 1));
  mkdirSync(join(docs, "ranges"), { recursive: true });
  const reportFile = (k) => join(docs, "ranges", `range-${pad(k)}.md`);
  const file = reportFile(range), legacy = legacyGates(file);
  const history = last.filter((m) => m.range < range).map((m) => withInputs(m, oracleDir));
  const gates = xs.map((m) => {
    if (m.gate) return m.gate;
    if (legacy.has(m.attempt)) return legacy.get(m.attempt);
    const gate = storedGate(m, evaluate(m, history, range < 5 ? null : baselineOf(m), undefined, seeds));
    storeGate(join(metricsDir, `range-${pad(range)}.a${m.attempt}.json`), gate);
    return gate;
  });
  const old = existsSync(file) ? readFileSync(file, "utf8") : "";
  const plan = JSON.parse(readFileSync(join(planDir, `range-${pad(range)}.json`), "utf8"));
  const own = findings.get(range) ?? [];
  const latest = xs.at(-1);
  writeFileSync(file, latest.version && latest.overview && latest.calls
    ? renderFormat({ plan, summary: summaries.get(range), attempts: xs, gates, lead: leadNote(old), findings: own, history, baseline, issues: loadIssues(docs),
      latencyRows: (m, h, b) => table(LATENCY_HEAD, latencyRows(m, h, b)), stageLine })
    : renderRange({ plan, summary: summaries.get(range), attempts: xs, gates, lead: leadNote(old), findings: own, history, baseline }));
  writeStats(attempts, docs);
  const comment = join(metricsDir, `comment-${pad(range)}.md`);
  writeFileSync(comment, renderComment({ plan, summary: summaries.get(range), attempts: xs, gates, findings: own }));
  // the index: every range's latest recorded outcome, read, never re-evaluated
  const rows = [];
  for (const [k, ys] of attempts) {
    const m = ys.at(-1);
    let g = k === range ? gates.at(-1) : m.gate;
    if (!g && existsSync(reportFile(k))) {
      const r = parseReport(readFileSync(reportFile(k), "utf8"));
      const row = r.attempts.get(r.latest);
      g = row ? { verdict: row.verdict, checks: r.checks } : null;
    }
    if (!g) continue;
    const p = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    rows.push({ range: k, dshCommits: p.dsh.commits, depth: m.depth?.after ?? "—", verdict: g.verdict,
      worst: (g.checks ?? []).find((c) => c.result === g.verdict && c.result !== "pass")?.name ?? "—", newStored: m.storage?.newStored });
  }
  writeFileSync(join(docs, "RANGES.md"), renderIndex(rows));
  return { verdict: gates.at(-1).verdict, file, comment };
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  if (args[0] === "check") {
    const { checkReport } = await import("./reportcheck.mjs");
    const range = Number(args[1]);
    if (!Number.isInteger(range)) { console.error("usage: report.mjs check <NNN> [--metrics <dir>] [--docs <dir>]"); process.exit(2); }
    const result = checkReport({ range, metricsDir: opt("--metrics") ?? join(process.env.HOME, "lfs-history", "metrics"),
      docs: opt("--docs") ?? new URL("../../../core/docs/issues/352", import.meta.url).pathname });
    for (const line of result.lines) console.log(line);
    if (result.failed.length) { console.log(`range ${pad(range)}: FAIL ${result.failed.join(" ")}`); process.exit(1); }
    console.log(`range ${pad(range)}: PASS F1–F8`);
    return;
  }
  if (args[0] === "regate") {
    const metricsDir = opt("--metrics");
    if (!metricsDir) { console.error("usage: report.mjs regate --metrics <dir> [--oracle <dir>] [--baselines <dir>]"); process.exit(2); }
    const H = join(process.env.HOME, "lfs-history");
    // --split-oneshot: earlier attempts' one-shot probe re-read from their traces as the split probes (withSplitProbe)
    const split = args.includes("--split-oneshot");
    const rows = regate({ metricsDir, oracleDir: opt("--oracle") ?? join(H, "oracle"), baselinesDir: opt("--baselines") ?? join(H, "metrics"), repo: opt("--repo") ?? join(H, "dsh.git"), planDir: opt("--plan") ?? join(H, "plan"), split });
    console.log("| Range | Run | Daemon | Stored | Now | Worst check |\n| --- | --- | --- | --- | --- | --- |");
    for (const r of rows) console.log(`| ${pad(r.range)}.a${r.attempt} | ${r.run} | ${r.daemon} | ${r.stored} | ${r.verdict} | ${r.worst.name} ${r.worst.result}: ${r.worst.value} |`);
    if (split) for (const r of rows) for (const c of r.oneshot ?? []) console.log(`${pad(r.range)} ${c}`);
    return;
  }
  if (args[0] === "fix-overview") {
    // F-015: removes the probe setup's Commits from an Overview recorded before the fix (counted from the attempt's trace)
    const { withoutProbeSetupCommits } = await import("./stats.mjs");
    const run = opt("--run"), range = Number(opt("--range")), attempt = Number(opt("--attempt") ?? 1);
    if (!run || !Number.isInteger(range)) { console.error("usage: report.mjs fix-overview --run <id> --range N [--attempt K]"); process.exit(2); }
    const dir = join(process.env.HOME, "lfs-history", "runs", run), manifest = JSON.parse(readFileSync(join(dir, "run.json"), "utf8"));
    const file = join(manifest.outputs.metrics, `range-${pad(range)}.a${attempt}.json`), m = JSON.parse(readFileSync(file, "utf8"));
    const n = probeSetupCommits(readFileSync(join(dir, "trace", `range-${pad(range)}.a${attempt}.jsonl`), "utf8"));
    const o = withoutProbeSetupCommits(m.overview, n);
    if (o !== m.overview) writeFileSync(file, JSON.stringify({ ...m, overview: o }, null, 1));
    console.log(JSON.stringify({ file, probeSetupCommits: n, commits: o.commits, changed: o !== m.overview }));
    return;
  }
  if (args[0] === "fix-diff-dirs") {
    // F-019: adds the changed ancestor directories to a checkpoint diff recorded before the fix, from git's
    // change set between the range's base and its checkpoint (the checkpoint proved the diff lists exactly it)
    const run = opt("--run"), range = Number(opt("--range")), attempt = Number(opt("--attempt") ?? 1);
    if (!run || !Number.isInteger(range)) { console.error("usage: report.mjs fix-diff-dirs --run <id> --range N [--attempt K]"); process.exit(2); }
    const manifest = JSON.parse(readFileSync(join(process.env.HOME, "lfs-history", "runs", run, "run.json"), "utf8"));
    const file = join(manifest.outputs.metrics, `range-${pad(range)}.a${attempt}.json`), m = JSON.parse(readFileSync(file, "utf8"));
    const d = m.perUnit?.["branch.diff_commits"];
    if (!d || d.basis !== "checkpoint") { console.log(JSON.stringify({ file, changed: false, why: d ? `basis ${d.basis}` : "no checkpoint diff" })); return; }
    const out = withDirsFromGit(m, { repo: manifest.repo, planDir: manifest.plan }), fixed = out.perUnit["branch.diff_commits"];
    writeFileSync(file, JSON.stringify({ ...out, corrections: [...(m.corrections ?? []), { finding: "F-019", field: "perUnit.branch.diff_commits", dirs: fixed.dirs, source: "git" }] }, null, 1));
    console.log(JSON.stringify({ file, entries: d.entries, dirs: fixed.dirs, statementsPerUnit: fixed.statementsPerEntry }));
    return;
  }
  if (args[0] === "baseline-n") {
    // F-024: n per class for baselines written before it, summed from their stored ranges (derived; gates untouched)
    const dir = opt("--metrics") ?? join(process.env.HOME, "lfs-history", "metrics");
    for (const f of readdirSync(dir).filter((f) => /^baseline(-[0-9a-f]{12}(-[0-9a-f]{12}-p\d)?)?\.json$/.test(f))) {
      const file = join(dir, f), b = JSON.parse(readFileSync(file, "utf8"));
      if (b.derived?.n && Object.values(b.ops).every((v) => v.perRange)) { console.log(`${f}: has n`); continue; }
      const out = withBaselineN(b, loadAttempts(b.source ?? dir));
      writeFileSync(file, JSON.stringify(out, null, 1));
      console.log(`${f}: ${Object.entries(out.ops).filter(([, v]) => thinClass(v)).map(([k, v]) => `${k.replace("\u0000", " ")} ${v.perRange.join("/")}`).join("; ") || `every class ≥ ${BASELINE_MIN_N} per range`}`);
    }
    return;
  }
  if (args[0] === "baseline-series") {
    // SPEC §5: re-derive every stored baseline into both series from its run's traces
    const dir = opt("--metrics") ?? join(HISTORY_DIR, "metrics");
    for (const f of readdirSync(dir).filter((x) => /^baseline.*\.json$/.test(x))) {
      const file = join(dir, f), b = JSON.parse(readFileSync(file, "utf8"));
      if (b.derivation === "trace") { console.log(`${f}: already re-derived`); continue; }
      const run = b.run ?? opt("--pilot-run");
      const out = run && rederiveBaseline(b, run);
      if (!out) { console.log(`${f}: not re-derived (no run or no stored trace${run ? ` in ${run}` : "; give --pilot-run"})`); continue; }
      writeFileSync(file, JSON.stringify(out, null, 1));
      const series = (x) => Object.keys(out.ops).filter((k) => k.endsWith(` · ${x}`)).length;
      console.log(`${f}: from ${run}: ${series("uncontended")} uncontended, ${series("contended")} contended classes`);
    }
    return;
  }
  if (args[0] === "records") {
    const { checkRecords } = await import("./findings.mjs");
    const problems = checkRecords(join(opt("--docs") ?? new URL("../../../core/docs/issues/352", import.meta.url).pathname, "fixes"));
    for (const p of problems) console.log(p);
    console.log(problems.length ? `fixes/: FAIL ${problems.length}` : "fixes/: PASS REBUILD.md §4");
    process.exit(problems.length ? 1 : 0);
  }
  if (args[0] === "baseline") {
    const [from, to] = String(opt("--ranges") ?? "").split("-").map(Number);
    if (!opt("--metrics") || !opt("--run") || !Number.isInteger(from) || !Number.isInteger(to)) { console.error("usage: report.mjs baseline --run <id> --metrics <its metrics> --ranges 2-4 [--out <main metrics>]"); process.exit(2); }
    const ranges = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const r = writeBaseline({ metricsDir: opt("--metrics"), ranges, run: opt("--run"), out: opt("--out") ?? join(process.env.HOME, "lfs-history", "metrics"), phase: opt("--phase"), note: opt("--note") });
    console.log(JSON.stringify({ file: r.file, daemon: r.baseline.daemon, ranges: r.baseline.ranges, ops: Object.keys(r.baseline.ops).length, probes: Object.keys(r.baseline.probes).length }));
    return;
  }
  if (args[0] === "stats") {
    if (!opt("--metrics") || !opt("--docs")) { console.error("usage: report.mjs stats --metrics <dir> --docs <dir>"); process.exit(2); }
    writeStats(loadAttempts(opt("--metrics")), opt("--docs"));
    console.log(`wrote ${join(opt("--docs"), "STATS.md")}`);
    return;
  }
  const metricsDir = opt("--metrics"), planDir = opt("--plan"), docs = opt("--docs");
  const oracleDir = opt("--oracle") ?? join(dirname(planDir ?? "."), "oracle");
  if (!metricsDir || !planDir || !docs) { console.error("usage: report.mjs --metrics <dir> --plan <dir> --docs <dir> [--range N]"); process.exit(2); }
  const range = opt("--range") != null ? Number(opt("--range")) : Math.max(...loadAttempts(metricsDir).keys());
  const r = reportRange({ metricsDir, planDir, docs, oracleDir, range });
  console.log(`range ${pad(range)} report ${r.file}; verdict: ${r.verdict}; issue comment ${r.comment}`);
  process.exit({ pass: 0, watch: 0, optimize: 3, stop: 4 }[r.verdict]);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
