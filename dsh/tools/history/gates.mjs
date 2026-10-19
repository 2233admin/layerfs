// The per-range gates (#352 SPEC §5): one decision from one range's metrics,
// the ranges before it and the pilot baseline. Pure functions; report.mjs
// reads the files and writes the reports.
//
// Chain-reading probes (F-016, builder's choice, 2026-10-18): stat, read,
// list_small, grep/glob scoped and diff_files read the fixture, and (F-023)
// diff_commits, merge and oneshot_commit rewrite fixed probe paths, through
// metadata delta chains, whose position rises one link per range and resets
// at the cap (8): list_small cycled 60 → 228 blob reads. They are judged as a
// bound, not a depth exponent: the max over the latest cap period against the
// max over the first (chainBound); 1.0 is bounded. Chosen over cost per
// decoded link, which stays flat under unbounded chain growth too (each extra
// link is one more read) and so would hide it. Needs a period plus one points.
//
// The checkpoint diff_commits gate (F-013, builder's choice, 2026-10-18): a
// checkpoint's difference costs a + b·n, a fixed per checkpoint and b per
// changed entry n; both must stay flat with depth and with tree size (SPEC §4).
// Per entry alone (a/n + b) rises whenever n falls, whatever the tree does
// (p1-rebase-b range 2, a false optimize). a and b are not estimated from the
// one-file probe: it does not carry the checkpoint's fixed work (subtracting
// it still leaves (S − a)/n rising 4.3 → 6.1 on flat totals), and one
// checkpoint has one or two pages, too few for an intercept. Instead, per axis
// (depth, tree files): where n does not grow with the axis, the total is
// judged (a rise means a or b grew); where n grows with it, per entry is
// judged (a rise means b grew, or a faster than n); otherwise a and b cannot
// be separated and the fit is "not judged", watch (F8). Statements first,
// then ms. Never normalised by tree files. Limit: a b that grows exactly as n
// falls keeps the total flat; it shows once n stops falling.
//
// A range's metrics file (the runner writes one per attempt):
//   { range, attempt, binary, head (main's head Commit id), depth: { before, after }, wall: { totalMs, ... },
//     checks: { tree: { ok, files, missing, extra, content, mode }, history: { ok },
//               steps: { matched, total }, conflicts: { planned, hit, unplanned },
//               ignored: { ok }, tests: { equal, run } (files whose result equals the native one) },
//     health: { workspacesOpen, overlaysLeft, daemonRssMb, openFiles, walBytes },
//     work: { ... SPEC §3b counts },
//     ops: [ { op, sizeClass, n, p50, p95, p99, max, slowPhase } ]   (aggregate())
//     probes: { <name>: { ms, counters: { <name>: n } } },
//     storage: { logical, canonical, stored, metadata, newStored, changedBytes,
//                directoryShare, reinstall: { changedPackages, rawChangedBytes, storedNewBytes }, delta: { share, atCap, byBudget } },
//     snapshot: { size, newBytes, sealMs, copyMs } | null   (snapshot.mjs's manifest, when taken),
//     budget: { diskProjected, diskBudget, wallProjectedMs, wallBudgetMs } }

import { p3Checks } from "./p3.mjs";

export const THRESHOLDS = {
  speed: { watch: 1.2, act: 1.5 },
  depthExponent: { watch: 0.15, act: 0.7 },
  counterExponent: { watch: 0.05, act: 0.5 },
  directoryShare: { watch: 0.5, act: 0.7 },
  reinstallGrowth: { watch: 2, act: 5 },
  deltaAtCap: { watch: 0.1, act: 0.25 },
  disk: { watch: 0.8, act: 1 },
  wall: { watch: 1, act: 1.5 },
  rising: 3,
  // a range's new stored bytes against the median of the ranges before it, and in absolute terms
  growth: { median: 3, bytes: 2 * 2 ** 30, history: 3 },
};
const RANK = { pass: 0, watch: 1, optimize: 2, stop: 3 };
const worst = (xs) => xs.reduce((m, x) => (RANK[x] > RANK[m] ? x : m), "pass");

/** An input's size class: bytes, files or entries in a few log-spaced buckets. */
export function sizeClass(kind, n) {
  if (n == null) return "—";
  const edges = kind === "bytes" ? [[1024, "≤1 KiB"], [8192, "≤8 KiB"], [65536, "≤64 KiB"], [524288, "≤512 KiB"]]
    : [[0, "0"], [1, "1"], [4, "2–4"], [16, "5–16"], [64, "17–64"]];
  for (const [e, name] of edges) if (n <= e) return kind === "bytes" ? name : `${name} ${kind}`;
  return kind === "bytes" ? ">512 KiB" : `>64 ${kind}`;
}

const quantile = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))] : null; };

/**
 * Per-call trace lines -> latency rows by operation and size class. A line is
 * { method, ms, size?: { kind, n }, phases?: { name: ms } }.
 */
export function aggregate(calls) {
  const groups = new Map();
  for (const c of calls) {
    const key = `${c.method}\u0000${sizeClass(c.size?.kind, c.size?.n)}${c.outcome ? ` · ${c.outcome}` : ""}${c.contention ? ` · ${c.contention}` : ""}`;
    (groups.get(key) || groups.set(key, []).get(key)).push(c);
  }
  return [...groups].map(([key, cs]) => {
    const [op, cls] = key.split("\u0000");
    const ms = cs.map((c) => c.ms);
    const p95 = quantile(ms, 0.95);
    const slow = cs.filter((c) => c.ms >= p95 && c.phases);
    const phaseTotals = {};
    for (const c of slow) for (const [k, v] of Object.entries(c.phases)) phaseTotals[k] = (phaseTotals[k] || 0) + v;
    const slowPhase = Object.entries(phaseTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const row = { op, sizeClass: cls, ...(cs[0].contention ? { series: cs[0].contention } : {}), n: cs.length, p50: quantile(ms, 0.5), p95, p99: quantile(ms, 0.99), max: Math.max(...ms), slowPhase };
    // per call: the SQL work's p50, an exec's FUSE opcodes' p50, and ms per unit of its own input
    const withSql = cs.filter((c) => c.sql);
    if (withSql.length) row.sql = Object.fromEntries(["statements", "vm_steps", "fullscan_steps"].map((k) => [k, quantile(withSql.map((c) => c.sql[k] ?? 0), 0.5)]));
    const withFuse = cs.filter((c) => c.fuse != null);
    if (withFuse.length) row.fuse = quantile(withFuse.map((c) => c.fuse), 0.5);
    const sized = cs.filter((c) => c.size?.n > 0);
    if (sized.length) row.perUnit = { kind: sized[0].size.kind, ms: +quantile(sized.map((c) => c.ms / c.size.n), 0.5).toFixed(4), n: quantile(sized.map((c) => c.size.n), 0.5) };
    return row;
  }).sort((a, b) => (a.op < b.op ? -1 : a.op > b.op ? 1 : a.sizeClass < b.sizeClass ? -1 : 1));
}

/**
 * F-024, lead decision 2026-10-18: the fewest calls a baseline class needs in
 * each of the baseline's ranges to be a reference. A class with fewer than 5
 * calls in any baseline range (absent = 0) is never used for a ratio: Speed
 * for it reads "not judged: baseline class has n calls" (watch, F8). One rule
 * for every op and class, no exceptions; e.g. fs.write ≤512 KiB (3/3/8) and
 * branch.merge 17–64 entries (1) are not judged. Per range, not summed: the
 * lead's 3/3/8 example is thin although it sums to 14. A baseline without
 * per-range counts falls back to its total n. This does not hide F-025 (merge
 * queueing): merge-affected fs.* classes are judged as they come out, and
 * merges are never filtered out of them.
 */
export const BASELINE_MIN_N = 5;

/**
 * The node_modules reinstall gate (lead decision 2026-10-18, STORAGE_STUDY.md
 * §3c). `reinstall` = { changedPackages, rawChangedBytes, storedNewBytes }:
 * changed packages are lockfile package entries whose resolution (name,
 * version, integrity) or workspace link target differs from the previous
 * lockfile (closure.mjs changedPackages; a link counts one package and its
 * link entry's bytes); stored new bytes are the install's new stored
 * node_modules bytes. Judged as stored ÷ raw changed; an install with no
 * changed package by its absolute new bytes: watch over 1 MiB, optimize over 16 MiB.
 */
export const REINSTALL_ABSOLUTE = { watch: 1 << 20, act: 16 << 20 };
export function reinstallGate(r, t = THRESHOLDS) {
  if (!r) return { value: "not applicable: no node_modules reinstall in this range", result: "pass" };
  if (r.storedNewBytes == null) return { value: "not judged: the install's stored node_modules bytes were not attributed", result: "watch" };
  if (!r.changedPackages) return { value: `no changed packages: ${r.storedNewBytes} new stored bytes`, result: band(r.storedNewBytes, REINSTALL_ABSOLUTE) };
  const g = +(r.storedNewBytes / r.rawChangedBytes).toFixed(3);
  return { value: `${g}× the raw bytes of ${r.changedPackages} changed package${r.changedPackages === 1 ? "" : "s"}`, result: band(g, t.reinstallGrowth) };
}

/**
 * Uncontended vs contended (SPEC §5, owner direction 2026-10-18). Every op
 * and class has two series (aggregate's ` · uncontended` / ` · contended`
 * suffix, from the trace's start and ms: steps.mjs markContention). Speed
 * judges the uncontended rows against the baseline's uncontended rows. A
 * baseline re-derived from stored traces (`derivation: "trace"`, classes from
 * the trace alone) is compared with the attempt's rows classed the same way
 * (`opsTrace`). Rows without a series (recorded before the split) are
 * judged as before only against a baseline that predates it too.
 */
export const opsOf = (x, baseline) => (baseline?.derivation === "trace" ? x.opsTrace : x.ops) ?? [];
export const uncontended = (ops) => ops.filter((r) => r.series === "uncontended" || / · uncontended$/.test(r.sizeClass));
export const contended = (ops) => ops.filter((r) => r.series === "contended" || / · contended$/.test(r.sizeClass));

/**
 * The contended series is watched for growth of the contended work itself,
 * never its wall time (queueing that the no-delay replay creates): per
 * contended op and class, the SQL VM steps p50 against the tree's files over
 * this attempt and its same-binary history (e.g. merge cost against tree
 * size), banded like Counters. A point needs BASELINE_MIN_N calls in its
 * range, and the tree must have grown CONTENDED_SPAN× over the points: a fit
 * over ~10% of growth is noise (range 11 of p2-main-c fitted 5.55 over three
 * ranges of 7% growth). The worst fit is reported. Lane hold per
 * Commit is not in the trace yet; the merge's own work stands for it.
 */
export const CONTENDED_SPAN = 1.5;
export function contendedWork(m, history, t = THRESHOLDS) {
  const ser = (x) => (x.ops?.some((r) => r.series) ? x.ops : x.opsTrace) ?? [];
  const rows = contended(ser(m));
  if (!rows.length) return { value: "not applicable: no contended calls in this range", result: "pass" };
  let worst = null, short = 0;
  for (const r of rows) {
    const pts = [...history, m].map((x) => [x.inputs?.tree?.files, contended(ser(x)).find((o) => o.op === r.op && o.sizeClass === r.sizeClass && o.n >= BASELINE_MIN_N)?.sql?.vm_steps]).filter(([a, b]) => a > 0 && b > 0);
    if (pts.length < MINIMUM_POINTS) continue;
    const xs = pts.map(([x]) => x);
    if (Math.max(...xs) < CONTENDED_SPAN * Math.min(...xs)) { short++; continue; }
    const e = exponent(pts);
    if (e != null && (!worst || e > worst.e)) worst = { op: r.op, sizeClass: r.sizeClass, e, n: pts.length };
  }
  if (!worst) return { value: `not judged: no contended class has ${MINIMUM_POINTS} ranges of ${BASELINE_MIN_N}+ calls${short ? ` over a tree that grew ${CONTENDED_SPAN}× (${short} class${short > 1 ? "es" : ""} too narrow)` : ""}`, result: "watch" };
  return { value: `${worst.op} ${worst.sizeClass}: SQL VM steps against tree files, exponent ${worst.e} over ${worst.n} ranges`, result: band(worst.e, t.counterExponent) };
}

/** F-024: a baseline class too thin to be a reference (BASELINE_MIN_N). */
export const thinClass = (b) => (b.perRange ? Math.min(...b.perRange) : b.n ?? Infinity) < BASELINE_MIN_N;

/** The pilot baseline: per op and class the median p50/p95 of ranges 0-4, per probe its median. */
export function buildBaseline(metrics) {
  const ops = new Map(), probes = new Map();
  for (const m of metrics) {
    for (const r of m.ops || []) {
      const k = `${r.op}\u0000${r.sizeClass}`;
      (ops.get(k) || ops.set(k, { p50: [], p95: [], n: 0, perRange: metrics.map(() => 0) }).get(k)).p50.push(r.p50);
      ops.get(k).p95.push(r.p95);
      ops.get(k).n += r.n ?? 0;
      ops.get(k).perRange[metrics.indexOf(m)] += r.n ?? 0;
    }
    for (const [name, p] of Object.entries(m.probes || {})) (probes.get(name) || probes.set(name, []).get(name)).push(p.ms);
  }
  const daemons = new Set(metrics.map((m) => m.binary?.daemon));
  if (daemons.size > 1) throw new Error(`a baseline mixes daemons ${[...daemons].join(", ")}`);
  return {
    daemon: metrics[0]?.binary?.daemon ?? null,
    ranges: metrics.map((m) => m.range),
    ops: Object.fromEntries([...ops].map(([k, v]) => [k, { p50: quantile(v.p50, 0.5), p95: quantile(v.p95, 0.5), n: v.n, perRange: v.perRange }])),
    probes: Object.fromEntries([...probes].map(([k, v]) => [k, quantile(v, 0.5)])),
  };
}

/** Probes whose input may grow by SPEC §3c (fitted per their own input instead): exempt from the same-input rule. */
export const GROWS = new Set(["list_largest", "grep_tree", "glob_tree"]);
/** Probes with a fixed input by SPEC §3c; they record it (lib.mjs probes) and are not judged without it. */
export const FIXED_INPUT = new Set(["stat", "read", "list_small", "grep_scoped", "glob_scoped", "diff_files", "diff_commits", "merge", "list_commits", "oneshot_commit"]);

/**
 * A probe's fit series (F-014): the points of `all` with the probe's version
 * (unversioned = 1). A fixed-input probe that recorded its input is fitted
 * only over points with the same recorded input; an earlier same-version point
 * with a different input refuses the fit ("not judged", watch, with the
 * reason), and fewer than MINIMUM_POINTS such points are not judged either.
 * A fixed-input probe (FIXED_INPUT) that recorded no input (before F-014) is
 * not judged: its input cannot be confirmed (the v1 diff_commits probe drifted).
 */
export function probeSeries(name, m, all) {
  const p = m.probes[name], v = p.version ?? 1;
  // the one-shot exec's LayerFS share leaves out FUSE time, which the trace does not carry (steps.mjs oneshotSplit)
  if (p.untimed) return { pts: [], note: `${p.fuseRequests} FUSE request(s) during the exec, whose time is not traced: its LayerFS share is not judged` };
  const same = all.filter((x) => x.probes?.[name] && (x.probes[name].version ?? 1) === v && !x.probes[name].untimed);
  let pts = same;
  if (FIXED_INPUT.has(name) && p.input == null) return { pts: [], note: "input not recorded (before F-014): a fixed input cannot be confirmed" };
  if (SCOPED[name] && !(SCOPED[name](m) > 0)) return { pts: [], note: `its own input (${SCOPE_UNIT[name]}s) is not recorded: a growing probe is fitted per unit of it` };
  if (p.input != null && !GROWS.has(name)) {
    const key = JSON.stringify(p.input);
    const differ = same.filter((x) => x.probes[name].input != null && JSON.stringify(x.probes[name].input) !== key);
    if (differ.length) return { pts: [], note: `input ${key} differs from range ${differ.map((x) => `${x.range} (${JSON.stringify(x.probes[name].input)})`).join(", ")}` };
    pts = same.filter((x) => x.probes[name].input != null);
  }
  const n = pts.filter((x) => x.depth?.after > 0).length;
  if (n < MINIMUM_POINTS) return { pts, note: `${n} of ${MINIMUM_POINTS} points of probe version ${v}${p.input != null && !GROWS.has(name) ? " with this input" : ""}` };
  return { pts };
}

/**
 * Probes that read the fixture through metadata delta chains (F-016): their
 * cost follows the chain position, which rises by one link per range and
 * resets at the metadata delta cap, so a depth exponent over a few points
 * reads a sawtooth as growth. They are judged as a bound: the maximum over
 * the latest cap period against the maximum over the first one, from the
 * first point on (a fresh base is at most one period away). Bounded cycling
 * gives 1.0; growth without a reset raises the latest period's maximum.
 * Fewer than a period plus one point, or no recorded cap, is not judged.
 */
export const CHAIN = new Set(["stat", "read", "list_small", "grep_scoped", "glob_scoped", "diff_files",
  // F-023: probes that rewrite a fixed file or directory each range (diff-one.txt, m/*, c/one.txt), so their
  // own writes and reads walk the same per-path delta chains: bounded by the cap, not monotone
  "diff_commits", "merge", "oneshot_commit"]);
/** The bound's bands: counters are deterministic (any rise is a finding), ms carries noise. */
export const BOUND = { counters: { watch: 1.0, act: 1.05 }, ms: { watch: 1.2, act: 1.5 } };

export function chainBound(name, m, pts, t = BOUND) {
  const period = m.storage?.delta?.caps?.metadata ?? m.storage?.deltaTotal?.caps?.metadata ?? null;
  const one = (label, value, th) => {
    const v = pts.map(value).filter((x) => x != null);
    if (period == null) return { name: label, e: null, result: "watch", note: "no metadata delta cap recorded: the chain period is unknown" };
    if (v.length < period + 1) return { name: label, e: null, result: "watch", note: `${v.length} of ${period + 1} points: a bound needs a full metadata delta-cap period (${period}) plus one` };
    const first = Math.max(...v.slice(0, period)), last = Math.max(...v.slice(-period)), ratio = +(last / first).toFixed(3);
    return { name: label, e: ratio, result: band(ratio, th), text: `max over the latest cap period ${last} vs the first ${first}: ${ratio}× (bound, period ${period})` };
  };
  return {
    probe: [one(`${name} (chain-bounded)`, (x) => x.probes?.[name]?.ms, t.ms)],
    counters: Object.keys(m.probes[name].counters || {}).map((k) => one(`${name}.${k} (chain-bounded)`, (x) => x.probes?.[name]?.counters?.[k], t.counters)),
  };
}

/**
 * The checkpoint diff's fits (F-013). Statements first, then ms; each against
 * depth and against tree files. Total = a + b·n: a fixed part per checkpoint,
 * b per changed entry. Where entries n do not grow with the axis (exponent
 * ≤ the watch band), the total is judged: a rise means a or b grew. Where n
 * grows with it, per entry (a/n + b) is judged: a rise means b (or a, faster
 * than n) grew; no rise cannot separate a from b, so the fit is not judged
 * (watch, F8), never pass. Nothing is divided by tree files.
 */
export const DIFF_POINTS = 4;
export function splitFits(op, pts, th) {
  const fits = [];
  // F-019: three points of a change-shaped cost cannot tell a residual from noise
  if (pts.length < DIFF_POINTS) return [{ name: `${op} checkpoint`, e: null, result: "watch", note: `${pts.length} of ${DIFF_POINTS} same-binary points of basis ${pts.at(-1)?.perUnit?.[op]?.basis}` }];
  for (const [axis, at] of [["depth", (x) => x.depth?.after], ["tree files", treeFiles]]) {
    const eN = exponent(pts.map((x) => [at(x), x.perUnit[op].units ?? x.perUnit[op].entries]));
    for (const [total, per, what] of [["statements", "statementsPerEntry", "statements"], ["ms", "msPerEntry", "ms"]]) {
      if (pts.at(-1)?.perUnit[op][total] == null) continue;
      const against = axis === "depth" ? undefined : axis;
      if (eN == null) { fits.push({ name: `${op} checkpoint ${what}`, against, e: null }); continue; }
      if (eN <= th.watch) { fits.push({ name: `${op} checkpoint ${what} in total (entries exponent ${eN})`, against, e: exponent(pts.map((x) => [at(x), x.perUnit[op][total]])) }); continue; }
      const eP = exponent(pts.map((x) => [at(x), x.perUnit[op][per]]));
      if (band(eP, th) !== "pass") fits.push({ name: `${op} checkpoint ${what} per entry (entries exponent ${eN})`, against, e: eP });
      else fits.push({ name: `${op} checkpoint ${what}`, against, e: null, result: "watch",
        note: `entries grow with ${axis} (exponent ${eN}) and ${what} per entry does not rise (${eP}): the fixed and per-entry parts cannot be separated` });
    }
  }
  return fits;
}

/** Least-squares slope of log(y) on log(x): how y grows with x (0 flat, 1 linear). */
export function exponent(points) {
  const ps = points.filter(([x, y]) => x > 0 && y > 0).map(([x, y]) => [Math.log(x), Math.log(y)]);
  if (ps.length < 3) return null;
  const mx = ps.reduce((s, p) => s + p[0], 0) / ps.length, my = ps.reduce((s, p) => s + p[1], 0) / ps.length;
  const sxx = ps.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  return sxx ? +(ps.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / sxx).toFixed(3) : null;
}

/**
 * Probes whose own input grows with the tree (SPEC §4: grep over the whole
 * tree may grow with the files and bytes in its scope, never with depth): the
 * input each is divided by before its depth exponent is fitted. A metrics file
 * carries the checkpoint tree as `inputs.tree` (run.mjs, from the oracle); an
 * attempt recorded without it is judged as it was, raw.
 */
export const SCOPED = { grep_tree: (x) => x.inputs?.tree?.bytes, glob_tree: (x) => x.inputs?.tree?.files, list_largest: (x) => x.probes?.list_largest?.input?.entries };
const SCOPE_UNIT = { grep_tree: "tree byte", glob_tree: "tree file", list_largest: "entry of the largest directory" };
/** Probes whose raw counters must stay flat with tree size as well as depth (SPEC §4): the one-file diff. */
export const TREE_FLAT = new Set(["diff_commits"]);
const treeFiles = (x) => x.inputs?.tree?.files;

/** The probe's value per unit of its own input, or the raw value when unscoped. */
export function perInput(name, x, value, scoped) {
  if (!scoped || !SCOPED[name] || value == null) return value;
  const n = SCOPED[name](x);
  return n > 0 ? value / n : null;
}

/** Same-binary filter: never a series across daemons (SPEC §6). A point without a daemon id matches only another without one. */
export const sameBinary = (m) => (x) => (x.binary?.daemon ?? null) === (m.binary?.daemon ?? null);

/** Points a depth fit needs; fewer is reported as insufficient, never as a pass. */
export const MINIMUM_POINTS = 3;

/** True when the last `n` values each rose over the one before. */
export const rising = (series, n = THRESHOLDS.rising) =>
  series.length > n && series.slice(-n - 1).every((v, i, a) => i === 0 || (v != null && a[i - 1] != null && v > a[i - 1]));

const band = (v, t, high = "optimize") => (v == null ? "pass" : v > t.act ? high : v > t.watch ? "watch" : "pass");

/** True when every point of the series recorded the same SQL counters for `name` as `m` (and some). */
export function sameCounters(name, m, pts) {
  const c = m.probes?.[name]?.counters, key = JSON.stringify(c ?? {});
  return !!c && Object.keys(c).length > 0 && pts.every((x) => x.probes?.[name]?.counters && JSON.stringify(x.probes[name].counters) === key);
}

/**
 * Owner 2026-10-18: a time-only trip, where the probe's time trips while its
 * SQL counters are identical at every point, reads watch. It escalates to
 * optimize only when the same probe also tripped time-only at the previous
 * range (the series without this point, ending at range k-1). Counter gates
 * are untouched. Mutates the fit row `f` (its result and note).
 */
export function timeOnly(f, m, t = THRESHOLDS) {
  if (!f.probe || !f.pts) return f;
  const r = f.result ?? band(f.e, f.text ? BOUND.ms : t.depthExponent);
  if (r !== "optimize" && r !== "stop") return f;
  if (!sameCounters(f.probe, m, f.pts.filter((x) => x.probes?.[f.probe]))) return f;
  const prior = f.pts.filter((x) => x.range < m.range);
  const prev = prior.at(-1)?.range === m.range - 1 && prior.filter((x) => x.depth?.after > 0).length >= MINIMUM_POINTS ? f.timeAt(prior) : null;
  const prevResult = prev ? prev.result ?? band(prev.e, prev.text ? BOUND.ms : t.depthExponent) : null;
  const what = f.text ?? `depth exponent ${f.e}`;
  f.result = r;
  if (prevResult === "optimize" || prevResult === "stop") { f.text = `${what}; time-only (identical SQL counters), repeated: it also tripped at range ${m.range - 1}`; return f; }
  f.result = "watch";
  f.text = `${what}; time-only trip (identical SQL counters at every point): watch, optimize only if it repeats at range ${m.range + 1}`;
  return f;
}

/**
 * The range's gate decision. `history` is the earlier ranges' metrics (last
 * attempt each, oldest first); `baseline` comes from buildBaseline; `seeds`
 * are probe points a fix measured with its new daemon on earlier snapshots
 * (`probes-<daemon>.json`). Every series, fit and baseline uses only points
 * measured with this attempt's daemon; a seed fills a range no measured
 * same-binary attempt covers.
 */
export function evaluate(m, allHistory = [], baseline = null, t = THRESHOLDS, seeds = []) {
  const own = sameBinary(m);
  const history = allHistory.filter(own);
  const short = (m.binary?.daemon ?? "unknown").slice(0, 12);
  const insufficient = (n) => `insufficient same-binary points: ${n} of ${MINIMUM_POINTS} (daemon ${short})`;
  const rows = [];
  const add = (name, value, threshold, result) => rows.push({ name, value, threshold, result });
  // SPEC §3 F8: a check that cannot be judged says so and is at least watch;
  // one whose event did not happen in the range says "not applicable" and passes.
  const unjudged = (name, why, threshold) => add(name, `not judged: ${why}`, threshold, "watch");
  const c = m.checks || {};
  const correct = c.tree?.ok && c.history?.ok && c.steps?.matched === c.steps?.total
    && c.conflicts?.hit === c.conflicts?.planned && !c.conflicts?.unplanned && c.ignored?.ok !== false
    && c.tests?.equal === c.tests?.run;
  add("Correctness", c.tree ? `tree ${c.tree.ok ? "ok" : `${c.tree.missing?.length ?? 0} missing, ${c.tree.extra?.length ?? 0} extra, ${c.tree.content?.length ?? 0} content, ${c.tree.mode?.length ?? 0} mode`}; steps ${c.steps?.matched}/${c.steps?.total}; conflicts ${c.conflicts?.hit}/${c.conflicts?.planned}${c.conflicts?.unplanned ? `, ${c.conflicts.unplanned} unplanned` : ""}; tests ${c.tests?.equal}/${c.tests?.run} equal to native` : "not run", "all", correct ? "pass" : "stop");
  const h = m.health || {};
  const leaked = (h.workspacesOpen || 0) + (h.overlaysLeft || 0);
  const grow = ["daemonRssMb", "openFiles", "walBytes"].filter((k) => rising([...history.map((x) => x.health?.[k]), h[k]]));
  add("Health", `${h.workspacesOpen ?? "?"} open, ${h.overlaysLeft ?? "?"} overlays${grow.length ? `; rising: ${grow.join(", ")}` : ""}`, "0, 0, flat",
    leaked ? "stop" : grow.length ? "optimize" : "pass");
  // Speed: worst ratio to the baseline per op and class; act only when it also keeps rising.
  if (baseline && ((baseline.phase && (baseline.phase !== m.phase || baseline.sdk !== m.binary?.sdk)))) {
    add("Speed", `baseline measured in ${baseline.phase} with addon ${String(baseline.sdk).slice(0, 12)}, not this attempt's; not judged`, `≤ ${t.speed.watch}×`, "watch");
  } else if (baseline && (baseline.daemon ?? null) !== (m.binary?.daemon ?? null)) {
    add("Speed", `baseline measured with daemon ${(baseline.daemon ?? "unknown").slice(0, 12)}; ${insufficient(0)}`, `≤ ${t.speed.watch}×`, "watch");
  } else if (baseline) {
    let worstRow = null, thin = null;
    // SPEC §5: Speed judges the uncontended series only, against the baseline's own
    // (rows recorded before the split, against a baseline that predates it too, are judged as before)
    const judged = (x) => { const ops = opsOf(x, baseline); return ops.some((r) => r.series) ? uncontended(ops) : baseline.derivation ? [] : ops; };
    for (const r of judged(m)) {
      const b = baseline.ops[`${r.op}\u0000${r.sizeClass}`];
      if (!b) continue;
      const ratio = +Math.max(r.p50 / b.p50, r.p95 / b.p95).toFixed(2);
      // F-024: a baseline class of fewer than BASELINE_MIN_N calls is not a reference
      if (thinClass(b)) { if (!thin || ratio > thin.ratio) thin = { ...r, ratio, bn: b.perRange ? b.perRange.join("/") : b.n }; continue; }
      if (!worstRow || ratio > worstRow.ratio) worstRow = { ...r, ratio };
    }
    if (thin && (!worstRow || thin.ratio > worstRow.ratio) && thin.ratio > t.speed.watch) {
      add("Speed", `not judged: ${thin.op} ${thin.sizeClass}: baseline class has ${thin.bn} call${thin.bn === 1 ? "" : "s"} (minimum ${BASELINE_MIN_N} per range); ${thin.ratio}× it`, `≤ ${t.speed.watch}×`, "watch");
    } else if (worstRow) {
      const series = history.map((x) => {
        const o = judged(x).find((r) => r.op === worstRow.op && r.sizeClass === worstRow.sizeClass);
        const b = baseline.ops[`${worstRow.op}\u0000${worstRow.sizeClass}`];
        return o ? Math.max(o.p50 / b.p50, o.p95 / b.p95) : null;
      }).concat(worstRow.ratio);
      const v = worstRow.ratio > t.speed.act ? (rising(series) ? "optimize" : "watch") : worstRow.ratio > t.speed.watch ? "watch" : "pass";
      add("Speed", `${worstRow.op} ${worstRow.sizeClass}: ${worstRow.ratio}× baseline (${worstRow.slowPhase ?? "no phase"})`, `≤ ${t.speed.watch}×`, v);
    } else unjudged("Speed", "no operation comparable to the baseline", `≤ ${t.speed.watch}×`);
  } else unjudged("Speed", "baseline not set (pilot)", `≤ ${t.speed.watch}×`);
  // Scaling: probes must stay flat with depth; counters are judged more strictly.
  // Seeded probe points fill the ranges no same-binary attempt covers.
  const covered = new Set([...history.map((x) => x.range), m.range]);
  const seeded = seeds.filter(own).filter((p) => !covered.has(p.range));
  const all = [...seeded, ...history, m].sort((a, b) => a.range - b.range);
  const fitted = all.filter((x) => x.depth?.after > 0).length;
  // A probe with its own growing input is fitted per unit of that input, when this attempt recorded it.
  const scoped = m.inputs != null;
  const unit = (name) => (SCOPED[name] ? ` per ${SCOPE_UNIT[name]}` : "");
  // The probe and the counter with the highest depth exponent, and the worst band of any.
  const probeFits = [], counterFits = [];
  for (const name of Object.keys(m.probes || {})) {
    // F-014: only points of the same probe version, and for a fixed-input probe the same recorded input
    const { pts, note } = probeSeries(name, m, all);
    if (note) { probeFits.push({ name, e: null, result: "watch", note }); counterFits.push({ name, e: null, result: "watch", note }); continue; }
    // time rows carry their probe and a re-judge on fewer points (timeOnly: the previous range's own verdict)
    const timeAt = (ps) => (CHAIN.has(name) ? chainBound(name, m, ps).probe[0] : { e: exponent(ps.map((x) => [x.depth?.after, perInput(name, x, x.probes?.[name]?.ms, true)])) });
    if (CHAIN.has(name)) { const b = chainBound(name, m, pts); probeFits.push(...b.probe.map((f) => ({ ...f, probe: name, pts, timeAt }))); counterFits.push(...b.counters); continue; }
    probeFits.push({ name: `${name}${unit(name)}`, probe: name, pts, timeAt, e: exponent(pts.map((x) => [x.depth?.after, perInput(name, x, x.probes?.[name]?.ms, true)])) });
    for (const k of Object.keys(m.probes[name].counters || {})) {
      counterFits.push({ name: `${name}.${k}${unit(name)}`, e: exponent(pts.map((x) => [x.depth?.after, perInput(name, x, x.probes?.[name]?.counters?.[k], true)])) });
      if (TREE_FLAT.has(name)) counterFits.push({ name: `${name}.${k}`, against: "tree files", e: exponent(pts.map((x) => [treeFiles(x), x.probes?.[name]?.counters?.[k]])) });
    }
  }
  // An operation judged against its own input (SPEC §4): the checkpoint diff's fixed and marginal parts
  // (splitFits, header); a legacy per-page basis keeps its per-entry fit against depth.
  for (const [op, p] of Object.entries(m.perUnit || {})) {
    const pts = all.filter((x) => x.perUnit?.[op] && x.perUnit[op].basis === p.basis);
    if (p.basis === "checkpoint" || p.basis === "checkpoint+dirs") probeFits.push(...splitFits(op, pts, t.depthExponent));
    else probeFits.push({ name: `${op} per ${p.unit}`, e: null, result: "watch", note: "a per-page median per entry cannot separate the fixed and per-entry parts (F-013)" });
  }
  // the fit that decides: the worst result, then the highest exponent; a fit may carry its own result (not judged)
  const top = (fits, th) => {
    if (!fits.length) return { name: null, e: null, result: "pass" };
    const r = fits.map((f) => f.result ?? band(f.e, th));
    const i = r.reduce((b, x, j) => (RANK[x] > RANK[r[b]] || (RANK[x] === RANK[r[b]] && (fits[j].e ?? -Infinity) > (fits[b].e ?? -Infinity)) ? j : b), 0);
    return { ...fits[i], result: worst(r) };
  };
  for (const f of probeFits) timeOnly(f, m, t);
  const scale = top(probeFits, t.depthExponent), counter = top(counterFits, t.counterExponent);
  const fit = (f, what) => (fitted < MINIMUM_POINTS ? { value: insufficient(fitted), result: "watch" }
    : !f.name ? { value: `not judged: no ${what}`, result: "watch" }
    : f.note ? { value: `not judged: ${f.name}: ${f.note}`, result: f.result }
    : f.text ? { value: `${f.name}: ${f.text}`, result: f.result }
    : f.e == null ? { value: `not judged: ${f.name}: no ${f.against ?? "depth"} exponent (points without ${f.against ?? "depth"} or value)`, result: "watch" }
    : { value: `${f.name}: ${f.against ?? "depth"} exponent ${f.e}${seeded.length ? ` (${seeded.length} seeded probe point${seeded.length > 1 ? "s" : ""})` : ""}`, result: f.result });
  const sv = fit(scale, "probes"), cv = fit(counter, "counters");
  // a probe left unjudged for a reason of its own says so even when another probe is the one shown
  for (const f of probeFits.filter((x) => x.note && /^oneshot_exec\b/.test(x.name))) if (!sv.value.includes(f.name)) sv.value += `; also not judged: ${f.name}: ${f.note}`;
  add("Scaling", sv.value, `< ${t.depthExponent.watch}`, sv.result);
  add("Counters", cv.value, `< ${t.counterExponent.watch}`, cv.result);
  const cw = contendedWork(m, history, t);
  add("Contended work", cw.value, `< ${t.counterExponent.watch} (SQL work against tree size)`, cw.result);
  const s = m.storage || {};
  if (s.directoryShare == null) unjudged("Directory share", "no new bytes measured", `< ${t.directoryShare.watch}`);
  else add("Directory share", s.directoryShare, `< ${t.directoryShare.watch}`, band(s.directoryShare, t.directoryShare));
  const ri = reinstallGate(s.reinstall, t);
  add("Reinstall growth", ri.value, `≤ ${t.reinstallGrowth.watch}× changed packages; ≤ 1 MiB with none`, ri.result);
  const measured = [...history, m];
  const eff = measured.map((x) => (x.storage?.changedBytes ? x.storage.newStored / x.storage.changedBytes : null));
  const cap = s.delta?.atCap;
  if (cap == null) unjudged("Delta at cap", "no delta outcomes traced", `< ${t.deltaAtCap.watch}`);
  else add("Delta at cap", `${cap} (budget ${s.delta?.byBudget ?? "no refusals"})`, `< ${t.deltaAtCap.watch}`,
    cap > t.deltaAtCap.act && rising(eff) ? "optimize" : cap > t.deltaAtCap.watch ? "watch" : "pass");
  // Growth: a range that stores far more than the ranges before it (SPEC §5)
  const earlier = history.map((x) => x.storage?.newStored).filter((v) => v != null);
  const median = earlier.length >= t.growth.history ? quantile(earlier, 0.5) : null;
  const ratio = median && s.newStored != null ? +(s.newStored / median).toFixed(2) : null;
  if (s.newStored == null) unjudged("Range growth", "no stored bytes measured", `≤ ${t.growth.median}× median, ≤ 2 GiB`);
  else {
    const over = s.newStored > t.growth.bytes || (ratio != null && ratio > t.growth.median);
    add("Range growth", `${(s.newStored / 2 ** 20).toFixed(1)} MiB${ratio != null ? `, ${ratio}× the median` : `; median not judged: ${earlier.length} of ${t.growth.history} earlier ranges`}`,
      `≤ ${t.growth.median}× median, ≤ 2 GiB`, over ? "optimize" : ratio == null ? "watch" : "pass");
  }
  // Snapshot time per new byte must not grow with the Store's size (SPEC §5, §7)
  const snaps = measured.filter((x) => x.snapshot?.copyMs != null && x.snapshot?.size).map((x) => [x.snapshot.size, ((x.snapshot.sealMs ?? 0) + x.snapshot.copyMs) / Math.max(x.snapshot.newBytes, 1 << 20)]);
  const snapE = exponent(snaps);
  if (!m.snapshot) add("Snapshot time", "not applicable: no snapshot this range", `< ${t.depthExponent.watch}`, "pass");
  else add("Snapshot time", `${m.snapshot.copyMs} ms for ${(m.snapshot.newBytes / 2 ** 20).toFixed(1)} MiB new; size exponent ${snapE ?? `not judged (${snaps.length} snapshots)`}`,
    `< ${t.depthExponent.watch}`, snapE == null ? "watch" : band(snapE, t.depthExponent));
  const b = m.budget || {};
  if (b.diskBudget) add("Disk projection", +(b.diskProjected / b.diskBudget).toFixed(2), `< ${t.disk.watch}`, band(b.diskProjected / b.diskBudget, t.disk, "stop"));
  else unjudged("Disk projection", "no disk budget recorded", `< ${t.disk.watch}`);
  // against the phase's own budget entry (run.mjs loadBudget; P3's is 300 s per range, owner 2026-10-19)
  if (b.wallBudgetMs) add("Wall projection", +(b.wallProjectedMs / b.wallBudgetMs).toFixed(2), `≤ ${t.wall.watch}${b.wallBudgetOf && b.wallBudgetOf !== "p1" ? ` (${b.wallBudgetOf} budget)` : ""}`, band(b.wallProjectedMs / b.wallBudgetMs, t.wall, "stop"));
  else unjudged("Wall projection", "no wall budget recorded", `≤ ${t.wall.watch}`);
  // REPORT_FORMAT §8.3: the git rule's and Node rule's gates (P3 on)
  if (m.phase === "p3") rows.push(...p3Checks(m));
  return { verdict: worst(rows.map((r) => r.result)), checks: rows };
}

/**
 * DEFER D-6 (#355, owner 2026-10-18): the three measured triggers, checked at every range close.
 * Candidate paths per merge and the lane hold of the merge at publish are not traced today: no
 * estimate, the trace field each needs is named. Merge errors come from the trace's merge lines.
 */
export const D6_FIELDS = {
  candidates: "a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)",
  publishHold: "a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)",
};
export const D6_ERRORS = new Set(["Capacity", "ObjectLimitExceeded", "Busy"]);
export function d6Triggers(lines) {
  const merges = lines.filter((l) => l.method === "branch.merge" && l.phase === "end");
  const errors = merges.filter((l) => !l.ok && D6_ERRORS.has(l.kind ?? l.code ?? l.error?.code)).length;
  return { merges: merges.length, candidatesMax: null, publishHoldMaxMs: null, mergeErrors: errors };
}
export function d6Text(d) {
  if (!d) return "D-6 triggers: not recorded for this attempt";
  const tripped = d.mergeErrors >= 1 || (d.candidatesMax ?? 0) > 50_000 || (d.publishHoldMaxMs ?? 0) > 500;
  const v = (x, field) => (x == null ? `not traced (needs ${field})` : String(x));
  return `D-6 triggers (${tripped ? "**TRIPPED**" : "none"}): max candidate paths in a merge ${v(d.candidatesMax, D6_FIELDS.candidates)} (trips > 50,000) · max lane hold of the merge at publish ${v(d.publishHoldMaxMs, D6_FIELDS.publishHold)} (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from ${d.merges} merges: ${d.mergeErrors} (trips at 1)`;
}
