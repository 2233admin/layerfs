// The per-range gates (#352 SPEC §5): one decision from one range's metrics,
// the ranges before it and the pilot baseline. Pure functions; report.mjs
// reads the files and writes the reports.
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
//                directoryShare, reinstallGrowth, delta: { share, atCap, byBudget } },
//     snapshot: { size, newBytes, sealMs, copyMs } | null   (snapshot.mjs's manifest, when taken),
//     budget: { diskProjected, diskBudget, wallProjectedMs, wallBudgetMs } }

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
    const key = `${c.method}\u0000${sizeClass(c.size?.kind, c.size?.n)}`;
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
    const row = { op, sizeClass: cls, n: cs.length, p50: quantile(ms, 0.5), p95, p99: quantile(ms, 0.99), max: Math.max(...ms), slowPhase };
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

/** The pilot baseline: per op and class the median p50/p95 of ranges 0-4, per probe its median. */
export function buildBaseline(metrics) {
  const ops = new Map(), probes = new Map();
  for (const m of metrics) {
    for (const r of m.ops || []) {
      const k = `${r.op}\u0000${r.sizeClass}`;
      (ops.get(k) || ops.set(k, { p50: [], p95: [] }).get(k)).p50.push(r.p50);
      ops.get(k).p95.push(r.p95);
    }
    for (const [name, p] of Object.entries(m.probes || {})) (probes.get(name) || probes.set(name, []).get(name)).push(p.ms);
  }
  const daemons = new Set(metrics.map((m) => m.binary?.daemon));
  if (daemons.size > 1) throw new Error(`a baseline mixes daemons ${[...daemons].join(", ")}`);
  return {
    daemon: metrics[0]?.binary?.daemon ?? null,
    ranges: metrics.map((m) => m.range),
    ops: Object.fromEntries([...ops].map(([k, v]) => [k, { p50: quantile(v.p50, 0.5), p95: quantile(v.p95, 0.5) }])),
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
  const same = all.filter((x) => x.probes?.[name] && (x.probes[name].version ?? 1) === v);
  let pts = same;
  if (FIXED_INPUT.has(name) && p.input == null) return { pts: [], note: "input not recorded (before F-014): a fixed input cannot be confirmed" };
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
 * The checkpoint diff's fits (F-013). Statements first, then ms; each against
 * depth and against tree files. Total = a + b·n: a fixed part per checkpoint,
 * b per changed entry. Where entries n do not grow with the axis (exponent
 * ≤ the watch band), the total is judged: a rise means a or b grew. Where n
 * grows with it, per entry (a/n + b) is judged: a rise means b (or a, faster
 * than n) grew; no rise cannot separate a from b, so the fit is not judged
 * (watch, F8), never pass. Nothing is divided by tree files.
 */
export function splitFits(op, pts, th) {
  const fits = [];
  for (const [axis, at] of [["depth", (x) => x.depth?.after], ["tree files", treeFiles]]) {
    const eN = exponent(pts.map((x) => [at(x), x.perUnit[op].entries]));
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
export const SCOPED = { grep_tree: (x) => x.inputs?.tree?.bytes };
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
  if (baseline && (baseline.daemon ?? null) !== (m.binary?.daemon ?? null)) {
    add("Speed", `baseline measured with daemon ${(baseline.daemon ?? "unknown").slice(0, 12)}; ${insufficient(0)}`, `≤ ${t.speed.watch}×`, "watch");
  } else if (baseline) {
    let worstRow = null;
    for (const r of m.ops || []) {
      const b = baseline.ops[`${r.op}\u0000${r.sizeClass}`];
      if (!b) continue;
      const ratio = Math.max(r.p50 / b.p50, r.p95 / b.p95);
      if (!worstRow || ratio > worstRow.ratio) worstRow = { ...r, ratio: +ratio.toFixed(2) };
    }
    if (worstRow) {
      const series = history.map((x) => {
        const o = (x.ops || []).find((r) => r.op === worstRow.op && r.sizeClass === worstRow.sizeClass);
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
  const unit = (name) => (scoped && SCOPED[name] ? " per tree byte" : "");
  // The probe and the counter with the highest depth exponent, and the worst band of any.
  const probeFits = [], counterFits = [];
  for (const name of Object.keys(m.probes || {})) {
    // F-014: only points of the same probe version, and for a fixed-input probe the same recorded input
    const { pts, note } = probeSeries(name, m, all);
    if (note) { probeFits.push({ name, e: null, result: "watch", note }); counterFits.push({ name, e: null, result: "watch", note }); continue; }
    probeFits.push({ name: `${name}${unit(name)}`, e: exponent(pts.map((x) => [x.depth?.after, perInput(name, x, x.probes?.[name]?.ms, scoped)])) });
    for (const k of Object.keys(m.probes[name].counters || {})) {
      counterFits.push({ name: `${name}.${k}${unit(name)}`, e: exponent(pts.map((x) => [x.depth?.after, perInput(name, x, x.probes?.[name]?.counters?.[k], scoped)])) });
      if (TREE_FLAT.has(name)) counterFits.push({ name: `${name}.${k}`, against: "tree files", e: exponent(pts.map((x) => [treeFiles(x), x.probes?.[name]?.counters?.[k]])) });
    }
  }
  // An operation judged against its own input (SPEC §4): the checkpoint diff's fixed and marginal parts
  // (splitFits, header); a legacy per-page basis keeps its per-entry fit against depth.
  for (const [op, p] of Object.entries(m.perUnit || {})) {
    const pts = all.filter((x) => x.perUnit?.[op] && x.perUnit[op].basis === p.basis);
    if (p.basis === "checkpoint") probeFits.push(...splitFits(op, pts, t.depthExponent));
    else probeFits.push({ name: `${op} per ${p.unit}`, e: null, result: "watch", note: "a per-page median per entry cannot separate the fixed and per-entry parts (F-013)" });
  }
  // the fit that decides: the worst result, then the highest exponent; a fit may carry its own result (not judged)
  const top = (fits, th) => {
    if (!fits.length) return { name: null, e: null, result: "pass" };
    const r = fits.map((f) => f.result ?? band(f.e, th));
    const i = r.reduce((b, x, j) => (RANK[x] > RANK[r[b]] || (RANK[x] === RANK[r[b]] && (fits[j].e ?? -Infinity) > (fits[b].e ?? -Infinity)) ? j : b), 0);
    return { ...fits[i], result: worst(r) };
  };
  const scale = top(probeFits, t.depthExponent), counter = top(counterFits, t.counterExponent);
  const fit = (f, what) => (fitted < MINIMUM_POINTS ? { value: insufficient(fitted), result: "watch" }
    : !f.name ? { value: `not judged: no ${what}`, result: "watch" }
    : f.note ? { value: `not judged: ${f.name}: ${f.note}`, result: f.result }
    : f.e == null ? { value: `not judged: ${f.name}: no ${f.against ?? "depth"} exponent (points without ${f.against ?? "depth"} or value)`, result: "watch" }
    : { value: `${f.name}: ${f.against ?? "depth"} exponent ${f.e}${seeded.length ? ` (${seeded.length} seeded probe point${seeded.length > 1 ? "s" : ""})` : ""}`, result: f.result });
  const sv = fit(scale, "probes"), cv = fit(counter, "counters");
  add("Scaling", sv.value, `< ${t.depthExponent.watch}`, sv.result);
  add("Counters", cv.value, `< ${t.counterExponent.watch}`, cv.result);
  const s = m.storage || {};
  if (s.directoryShare == null) unjudged("Directory share", "no new bytes measured", `< ${t.directoryShare.watch}`);
  else add("Directory share", s.directoryShare, `< ${t.directoryShare.watch}`, band(s.directoryShare, t.directoryShare));
  if (s.reinstallGrowth == null) add("Reinstall growth", "not applicable: no node_modules reinstall in this range", `≤ ${t.reinstallGrowth.watch}×`, "pass");
  else add("Reinstall growth", s.reinstallGrowth, `≤ ${t.reinstallGrowth.watch}×`, band(s.reinstallGrowth, t.reinstallGrowth));
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
  if (b.wallBudgetMs) add("Wall projection", +(b.wallProjectedMs / b.wallBudgetMs).toFixed(2), `≤ ${t.wall.watch}`, band(b.wallProjectedMs / b.wallBudgetMs, t.wall, "stop"));
  else unjudged("Wall projection", "no wall budget recorded", `≤ ${t.wall.watch}`);
  return { verdict: worst(rows.map((r) => r.result)), checks: rows };
}
