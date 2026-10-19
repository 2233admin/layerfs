// The attempt's `p3` object (REPORT_FORMAT §10.1), filled from what the play
// recorded: the git counters (gitplay.mjs, `m.git`), the Node points
// (nodelanes.mjs, `m.node`), their proofs (nodeproof.mjs, `m.p3proofs`), the
// closure (the lead's repair, `m.closure`), the trace facts the play keeps
// (`m.p3raw`) and the storage figures. A field nothing measured stays null,
// which p3.mjs renders `not recorded` and gates at least watch; a proof not
// run is NOT_RUN. Refilled by `nodeproof.mjs proofs` once the native oracles ran.
import { PROOFS } from "./p3.mjs";

const q = (xs, p) => { const v = xs.filter((x) => x != null && Number.isFinite(x)).sort((a, b) => a - b); return v.length ? v[Math.min(v.length - 1, Math.floor((v.length - 1) * p))] : null; };
const pq = (xs) => (xs?.length ? { p50: q(xs, 0.5), p95: q(xs, 0.95), n: xs.length } : null);
const median = (xs) => q(xs, 0.5);

/** The trace facts `p3` needs, taken while the play still has the trace (run.mjs): content, resilience, unmounts. */
export function p3Raw(lines) {
  const ends = lines.filter((l) => l.phase === "end" || l.ms != null);
  const commits = ends.filter((l) => l.sizes?.newStored != null);
  const err = (l) => `${l.kind ?? ""} ${l.error?.code ?? ""} ${l.error?.message ?? ""} ${l.refused?.code ?? ""}`;
  return {
    content: { storedContent: commits.reduce((n, l) => n + (l.sizes.newStored - (l.sizes.newMetadata ?? 0)), 0), distinctNewContent: commits.reduce((n, l) => n + (l.sizes.newCanonical ?? 0), 0), metadata: commits.reduce((n, l) => n + (l.sizes.newMetadata ?? 0), 0), commits: commits.length },
    resilience: {
      busy: ends.filter((l) => l.ok === false && /\bBusy\b/.test(err(l))).length,
      eagain: ends.filter((l) => /EAGAIN/.test(err(l)) || /EAGAIN/.test(String(l.stderr ?? ""))).length,
      refusedUnmount: ends.filter((l) => l.method === "sandbox.unmount" && l.ok === false).length,
      unmountMs: ends.filter((l) => l.method === "sandbox.unmount" && l.ok !== false).map((l) => l.ms),
    },
  };
}

/** Bytes of the package folders that changed between two lister listings (closure.mjs changedGroupBytes's rule). */
const changedBytes = (prev, cur) => {
  if (!prev || !cur) return null;
  const was = new Map(prev.map((g) => [g.g, g.digest]));
  return cur.filter((g) => was.get(g.g) !== g.digest).reduce((n, g) => n + (g.bytes ?? 0), 0);
};

/** `p3` from the metrics file `m` (and, for churn, each point's lister groups by id, when read). */
export function fillP3(m, { groupsOf = () => null } = {}) {
  const g = m.git ?? null, lead = g?.lead ?? null, n = m.node ?? null, proofs = m.p3proofs ?? {}, raw = m.p3raw ?? {};
  const lanes = (g?.lanes ?? []).map((l) => ({ lane: l.lane, status: l.status, diff: l.diff, add: l.add, rm: l.rm, commits: l.commits, loose: l.loose }));
  const git = g && lead ? {
    head: lead.head ?? null, checkpoint: m.plan?.checkpoint ?? null, commitsWritten: lead.count ?? null, dshCommits: lead.commits ?? null,
    statusClean: lead.statusLines === 0 && (g.fresh ? g.fresh.statusLines === 0 : true), freshSumScan: g.fresh?.sumScan ?? null,
    guardViolations: (g.guard ?? []).flatMap((x) => x.violations), guard: (g.guard ?? []).map(({ lane, paths, ms }) => ({ lane, paths, ms })),
    lanes, lead: { commitTree: lead.commits ?? null, indexRebuild: lead.refreshMs != null, repack: lead.repackMs != null },
    // decision B (liaison 2026-10-19): what the lead's `git clean -f` removed before the status checks
    cleaned: lead.cleaned ?? null,
    perCommit: { commits: (g.lane?.commits ?? 0) + (lead.commits ?? 0), index: lead.indexBytes ?? null, loose: Object.entries(lead).filter(([k]) => k.startsWith("laneBytes_")).reduce((s, [, v]) => s + v, 0), pack: (lead.newPackBytes ?? 0) + (lead.newIdxBytes ?? 0) },
    internals: {
      seedObjects: null, seedPackBytes: g.seed?.packBytes ?? null, seedCommits: g.seed?.commits ?? null,
      lanes: (g.lanes ?? []).map((l) => ({ lane: l.lane, objects: l.loose, indexBytes: l.indexBytes })),
      trace2: [["git status --porcelain", "status", "statusLstat"], ["git diff --stat", "diff", "diffLstat"], ["git add -f", "add", null], ["git rm --cached", "rm", null], ["git commit", "commit", "commitLstat"]]
        .filter(([, k]) => g.timings?.[k]?.length).map(([cmd, k, ls]) => ({ cmd, ms: median(g.timings[k]), lstat: ls ? Math.round((g.lanes ?? []).reduce((s, l) => s + (l[ls] ?? 0), 0) / Math.max(1, g.timings[k].length)) : null })),
    },
  } : null;
  // Node: each point with its proofs (NOT_RUN until the native side ran), per lane, the repair
  const points = (n?.points ?? []).map((pt) => {
    const pr = proofs[pt.id];
    return { lane: pt.lane, point: pt.point, tree: pr?.tree ?? pt.treeLfs ?? pt.tree ?? null, inputs: pt.inputs ?? null, cached: !!pr?.cached,
      proofs: pr?.proofs ?? Object.fromEntries(PROOFS.map((id) => [id, { result: id === "P6" ? "n/a" : "NOT_RUN", detail: "native oracle not run yet (nodeproof.mjs proofs)" }])) };
  });
  const repair = proofs["lead.repair"] ?? null;
  if (m.closure?.rows?.some((r) => /install/.test(r.kind))) points.push(repair ? { lane: repair.lane, point: repair.point, tree: repair.tree, inputs: repair.inputs, cached: repair.cached, proofs: repair.proofs }
    : { lane: "lead", point: "repair", tree: null, inputs: null, cached: false, proofs: Object.fromEntries(PROOFS.map((id) => [id, { result: "NOT_RUN", detail: "native build not run yet" }])) });
  const nodeLanes = Object.values(n?.lanes ?? {}).map((l) => {
    const p5 = points.filter((p) => p.lane === l.lane).map((p) => p.proofs.P5).filter((x) => x?.result === "pass" || x?.result === "stop");
    const files = (n?.points ?? []).filter((p) => p.lane === l.lane && p.vitest).reduce((s, p) => s + p.vitest.files.length, 0);
    return { ...l, run: p5.length ? files : null, equal: p5.length ? (p5.every((x) => x.result === "pass") ? files : null) : null };
  });
  const closureInstall = m.closure?.rows?.find((r) => /install/.test(r.kind)), closureBuild = m.closure?.rows?.find((r) => r.kind === "build");
  const prevGroups = (id) => groupsOf(id);
  let rewritten = null;
  for (const pt of n?.points ?? []) {
    const chainPrev = pt.lane === "lead" ? null : [n.points.find((x) => x.lane === "lead"), ...n.points.filter((x) => x.lane === pt.lane && x.order < pt.order)].filter(Boolean).at(-1);
    const b = changedBytes(chainPrev ? prevGroups(chainPrev.id) : [], prevGroups(pt.id));
    if (b != null) rewritten = (rewritten ?? 0) + b;
  }
  const src = m.storageReport?.sources;
  const node = n ? {
    points, lanes: nodeLanes,
    repair: closureInstall ? { installs: 1, tsc: closureBuild ? 1 : 0, rewritten: closureInstall.rewritten ?? null } : null,
    inputs: n.inputs ?? null,
    churn: src && rewritten != null ? { rewrittenBytes: rewritten, storedBytes: ["nodeModules", "build"].reduce((s, k) => s + (src[k]?.added?.content ?? 0) + (src[k]?.added?.metadata ?? 0), 0), basis: "node_modules package folders rewritten (lister bytes) against stored node_modules and build bytes" } : null,
    nativeDisk: m.storeDisk && m.version ? { lanes: m.work?.lanes ?? null, checkoutBytes: m.version.bytes, storedBytes: m.storeDisk.allocated + (m.storeDisk.walAllocated ?? 0) } : null,
    metadata: raw.content && m.version?.files ? { perFile: raw.content.metadata / m.version.files, perCommit: raw.content.commits ? raw.content.metadata / raw.content.commits : null, budgetPerFile: null, budgetPerCommit: null } : null,
  } : null;
  // conflicts by path class: the merges' recorded LWW picks and conflicts (any .git one is a stop)
  const conflicts = m.checks?.conflicts ? { tracked: m.checks.conflicts.unplanned ?? 0, installOutputs: (m.lww?.picks ?? []).reduce((s, p) => s + (p.nodeModules ?? 0), 0), buildOutputs: (m.lww?.picks ?? []).reduce((s, p) => s + Math.max(0, (p.picks ?? 0) - (p.nodeModules ?? 0)), 0), git: 0, paths: [] } : null;
  // speed: LayerFS from the play, native from the cached oracles on the identical tree
  const pts = n?.points ?? [], natives = Object.values(proofs);
  const sp = {};
  const put = (key, lfs, native) => { if (lfs?.length || native?.length) sp[key] = { lfs: pq(lfs), native: pq(native), cost362: null }; };
  if (g) {
    put("git.status.cold", g.fresh?.statusMs != null ? [g.fresh.statusMs] : [], []);
    put("git.status.steady", g.timings?.status, []); put("git.add", g.timings?.add, []); put("git.commit", g.timings?.commit, []);
    put("git.main", lead?.writerMs != null ? [lead.writerMs] : [], []); put("git.repack", lead?.repackMs != null ? [lead.repackMs] : [], []);
  }
  put("pnpm.install", pts.filter((p) => p.kind !== "refresh").map((p) => p.install?.ms), natives.filter((x) => x?.nativeInstallMs != null && x.kind !== "refresh").map((x) => x.nativeInstallMs));
  put("pnpm.refresh", pts.filter((p) => p.kind === "refresh").map((p) => p.install?.ms), natives.filter((x) => x?.nativeInstallMs != null && x.kind === "refresh").map((x) => x.nativeInstallMs));
  put("tsc", pts.map((p) => p.tsc?.ms), natives.map((x) => x?.nativeTscMs));
  put("vitest", pts.map((p) => p.vitest?.ms), natives.map((x) => x?.nativeVitestMs));
  const r = raw.resilience;
  const rss = m.health?.daemonRssMb;
  const rssList = Array.isArray(rss) ? rss : rss != null ? [rss] : [];
  const resilience = r ? { busy: r.busy, eagain: r.eagain, refusedUnmount: r.refusedUnmount, writerWaitMs: null, laneHoldMs: null, rss: rssList.length ? { max: Math.max(...rssList), median: median(rssList), n: rssList.length } : null, overlayMaxBytes: null, unmountMs: pq(r.unmountMs) } : null;
  const gitMs = g ? (g.seed?.wallMs ?? 0) + (g.lane?.wallMs ?? 0) + (lead?.wallMs ?? 0) + (g.fresh?.wallMs ?? 0) + (g.guard ?? []).reduce((s, x) => s + (x.ms ?? 0), 0) : null;
  const nodeMs = n ? pts.reduce((s, p) => s + (p.ms ?? 0), 0) + (m.closure?.rows ?? []).reduce((s, x) => s + (x.ms ?? 0), 0) : null;
  return { git, node, conflicts, speed: sp, resilience, stages: { gitMs, nodeMs }, content: raw.content ? { storedContent: raw.content.storedContent, distinctNewContent: raw.content.distinctNewContent } : null };
}
