// The per-range gates (#352 SPEC §5): one decision from one range's metrics,
// the ranges before it and the pilot baseline. Pure functions; report.mjs
// reads the files and writes the reports.
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
    : [[1, "1"], [4, "2–4"], [16, "5–16"], [64, "17–64"]];
  for (const [e, name] of edges) if (n <= e) return name;
  return kind === "bytes" ? ">512 KiB" : ">64";
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
    return { op, sizeClass: cls, n: cs.length, p50: quantile(ms, 0.5), p95, p99: quantile(ms, 0.99), max: Math.max(...ms), slowPhase };
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
  return {
    ranges: metrics.map((m) => m.range),
    ops: Object.fromEntries([...ops].map(([k, v]) => [k, { p50: quantile(v.p50, 0.5), p95: quantile(v.p95, 0.5) }])),
    probes: Object.fromEntries([...probes].map(([k, v]) => [k, quantile(v, 0.5)])),
  };
}

/** Least-squares slope of log(y) on log(x): how y grows with x (0 flat, 1 linear). */
export function exponent(points) {
  const ps = points.filter(([x, y]) => x > 0 && y > 0).map(([x, y]) => [Math.log(x), Math.log(y)]);
  if (ps.length < 3) return null;
  const mx = ps.reduce((s, p) => s + p[0], 0) / ps.length, my = ps.reduce((s, p) => s + p[1], 0) / ps.length;
  const sxx = ps.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  return sxx ? +(ps.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / sxx).toFixed(3) : null;
}

/** True when the last `n` values each rose over the one before. */
export const rising = (series, n = THRESHOLDS.rising) =>
  series.length > n && series.slice(-n - 1).every((v, i, a) => i === 0 || (v != null && a[i - 1] != null && v > a[i - 1]));

const band = (v, t, high = "optimize") => (v == null ? "pass" : v > t.act ? high : v > t.watch ? "watch" : "pass");

/**
 * The range's gate decision. `history` is the earlier ranges' metrics (last
 * attempt each, oldest first); `baseline` comes from buildBaseline.
 */
export function evaluate(m, history = [], baseline = null, t = THRESHOLDS) {
  const rows = [];
  const add = (name, value, threshold, result) => rows.push({ name, value, threshold, result });
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
  if (baseline) {
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
    } else add("Speed", "no comparable operation", `≤ ${t.speed.watch}×`, "pass");
  } else add("Speed", "baseline not set (pilot)", "—", "pass");
  // Scaling: probes must stay flat with depth; counters are judged more strictly.
  const all = [...history, m];
  // The probe and the counter with the highest depth exponent, and the worst band of any.
  const probeFits = [], counterFits = [];
  for (const name of Object.keys(m.probes || {})) {
    probeFits.push({ name, e: exponent(all.map((x) => [x.depth?.after, x.probes?.[name]?.ms])) });
    for (const k of Object.keys(m.probes[name].counters || {}))
      counterFits.push({ name: `${name}.${k}`, e: exponent(all.map((x) => [x.depth?.after, x.probes?.[name]?.counters?.[k]])) });
  }
  const top = (fits, th) => fits.length
    ? { ...fits.reduce((m2, f) => ((f.e ?? -Infinity) > (m2.e ?? -Infinity) ? f : m2)), result: worst(fits.map((f) => band(f.e, th))) }
    : { name: null, e: null, result: "pass" };
  const scale = top(probeFits, t.depthExponent), counter = top(counterFits, t.counterExponent);
  add("Scaling", scale.name ? `${scale.name}: depth exponent ${scale.e ?? "n/a"}` : "no probes", `< ${t.depthExponent.watch}`, scale.result);
  add("Counters", counter.name ? `${counter.name}: depth exponent ${counter.e ?? "n/a"}` : "no counters", `< ${t.counterExponent.watch}`, counter.result);
  const s = m.storage || {};
  add("Directory share", s.directoryShare ?? "n/a", `< ${t.directoryShare.watch}`, band(s.directoryShare, t.directoryShare));
  add("Reinstall growth", s.reinstallGrowth ?? "n/a", `≤ ${t.reinstallGrowth.watch}×`, band(s.reinstallGrowth, t.reinstallGrowth));
  const eff = all.map((x) => (x.storage?.changedBytes ? x.storage.newStored / x.storage.changedBytes : null));
  const cap = s.delta?.atCap;
  add("Delta at cap", cap == null ? "n/a" : `${cap} (budget ${s.delta?.byBudget ?? "n/a"})`, `< ${t.deltaAtCap.watch}`,
    cap > t.deltaAtCap.act && rising(eff) ? "optimize" : cap > t.deltaAtCap.watch ? "watch" : "pass");
  // Growth: a range that stores far more than the ranges before it (SPEC §5)
  const earlier = history.map((x) => x.storage?.newStored).filter((v) => v != null);
  const median = earlier.length >= t.growth.history ? quantile(earlier, 0.5) : null;
  const ratio = median && s.newStored != null ? +(s.newStored / median).toFixed(2) : null;
  add("Range growth", s.newStored == null ? "n/a" : `${(s.newStored / 2 ** 20).toFixed(1)} MiB${ratio != null ? `, ${ratio}× the median` : ""}`, `≤ ${t.growth.median}× median, ≤ 2 GiB`,
    s.newStored != null && (s.newStored > t.growth.bytes || (ratio != null && ratio > t.growth.median)) ? "optimize" : "pass");
  // Snapshot time per new byte must not grow with the Store's size (SPEC §5, §7)
  const snaps = all.filter((x) => x.snapshot?.copyMs != null && x.snapshot?.size).map((x) => [x.snapshot.size, ((x.snapshot.sealMs ?? 0) + x.snapshot.copyMs) / Math.max(x.snapshot.newBytes, 1 << 20)]);
  const snapE = exponent(snaps);
  add("Snapshot time", m.snapshot ? `${m.snapshot.copyMs} ms for ${(m.snapshot.newBytes / 2 ** 20).toFixed(1)} MiB new; size exponent ${snapE ?? "n/a"}` : "no snapshot",
    `< ${t.depthExponent.watch}`, band(snapE, t.depthExponent));
  const b = m.budget || {};
  add("Disk projection", b.diskBudget ? +(b.diskProjected / b.diskBudget).toFixed(2) : "n/a", `< ${t.disk.watch}`, b.diskBudget ? band(b.diskProjected / b.diskBudget, t.disk, "stop") : "pass");
  add("Wall projection", b.wallBudgetMs ? +(b.wallProjectedMs / b.wallBudgetMs).toFixed(2) : "n/a", `≤ ${t.wall.watch}`, b.wallBudgetMs ? band(b.wallProjectedMs / b.wallBudgetMs, t.wall, "stop") : "pass");
  return { verdict: worst(rows.map((r) => r.result)), checks: rows };
}
