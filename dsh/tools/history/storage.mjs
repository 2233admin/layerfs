// The storage report's figures (REPORT_FORMAT.md §3 Storage, §9 formulas;
// owner direction 2026-10-18): where Store on disk goes (five parts that sum
// to it exactly), what each source stores (tracked, node_modules, build;
// shared never divided), and the per-change and per-Commit figures.
//
// Parts at a snapshot come from the sealed file (inspect.mjs storeFigures:
// pack bodies by domain, dbstat used/unused per table and index, free pages,
// page count) and its allocation. Elsewhere content and metadata are the
// previous range's plus this range's Commits' traced sizes (newStored,
// newMetadata), and the rest of Store on disk (file + WAL) is one live
// remainder: index rows, waste and other are not split without the sealed
// file.
//
// Sources are attributed by the Commit that wrote them (P3 closure: the
// install Commit is node_modules, the build Commit build output, every other
// Commit tracked). REPORT_FORMAT §9 attributes by the path each object was
// constructed for; the two differ only by the ancestor directories an
// install or build Commit rewrites, which §9 counts as tracked. Exact path
// attribution needs the daemon counter in the builder's notes
// (builder-storage-counters.md); this module takes it when a Commit's sizes
// carry `bySource`.

/** pack.domain values (layerfs-storage PackDomain: Metadata, Payload). */
export const DOMAIN = { metadata: 0, payload: 1 };
export const SOURCES = ["tracked", "nodeModules", "build", "git"];

/**
 * The five parts of Store on disk from the sealed file (§9). Exact: they sum
 * to `allocated` by construction (Other is the remainder, a tooling defect
 * when large).
 */
export function sealedParts(f, allocated) {
  const body = (d) => f.packs.filter((p) => p.domain === d).reduce((n, p) => n + p.bytes, 0);
  const content = body(DOMAIN.payload), metadata = body(DOMAIN.metadata);
  const tables = f.tables ?? [];
  const used = (t) => t.bytes - t.unused;
  const pack = tables.find((t) => t.name === "pack");
  const indexRows = tables.filter((t) => t.name !== "pack").reduce((n, t) => n + used(t), 0);
  const waste = tables.reduce((n, t) => n + t.unused, 0) + f.freePages * f.pageSize
    + (pack ? used(pack) - content - metadata : 0) + Math.max(0, allocated - f.pages * f.pageSize);
  const other = allocated - content - metadata - indexRows - waste;
  return { exact: true, content, metadata, indexRows, waste, other, total: allocated };
}

/** The parts at a live range: content and metadata carried forward by the Commits' sizes; the rest one remainder. */
export function liveParts(prev, added, storeOnDisk) {
  if (!prev || storeOnDisk == null) return null;
  const content = prev.content + added.content, metadata = prev.metadata + added.metadata;
  return { exact: false, content, metadata, remainder: storeOnDisk - content - metadata, total: storeOnDisk };
}

/** Shared bytes (never divided among sources): index rows + waste + other, or the live remainder. */
export const shared = (p) => (p ? (p.exact ? p.indexRows + p.waste + p.other : p.remainder) : null);

/**
 * This range's stored bytes by source from its Commits' traced sizes: each
 * Commit's content (newStored − newMetadata) and metadata go to the source of
 * the step that made it (`sourceOf(line)`), or are split by the Commit's own
 * `bySource` when the daemon reports it.
 */
export function addedBySource(lines, sourceOf) {
  const out = Object.fromEntries(SOURCES.map((s) => [s, { content: 0, metadata: 0 }]));
  for (const l of lines) {
    const z = l.sizes;
    if (!z || z.newStored == null) continue;
    if (z.bySource) {
      for (const s of SOURCES) { out[s].content += z.bySource[s]?.content ?? 0; out[s].metadata += z.bySource[s]?.metadata ?? 0; }
      continue;
    }
    const s = sourceOf(l);
    out[s].content += z.newStored - (z.newMetadata ?? 0);
    out[s].metadata += z.newMetadata ?? 0;
  }
  return out;
}

/** The source of a Commit's line by the step that made it (P3 closure steps; everything else tracked). */
export const stepSource = (k) => (l) => {
  const step = String(l.step ?? "");
  return /\.(install|incremental-install|clean-install|reinstall-check|refresh|repair-install)$/.test(step) ? "nodeModules" : /\.(build|rebuild|tsc|vitest|test)$/.test(step) ? "build"
    : /\.(git-seed|git-commit|git-main)$/.test(step) ? "git" : "tracked";
};

/** node_modules bytes changed by an install: package folders added or rewritten against the previous install's lister groups. */
export function changedGroupBytes(prevGroups = [], groups = []) {
  const was = new Map(prevGroups.map((g) => [g.g, g.digest]));
  return groups.filter((g) => was.get(g.g) !== g.digest).reduce((n, g) => n + (g.bytes ?? 0), 0);
}

/**
 * The first cumulative figures of a run recorded before this format: at a
 * sealed snapshot, everything stored before this range is tracked (no install
 * or build before P3), less this range's own additions.
 */
export function seedBySource(parts, added) {
  if (!parts?.exact) return null;
  const sum = (k) => SOURCES.reduce((n, s) => n + (added[s]?.[k] ?? 0), 0);
  return { tracked: { content: parts.content - sum("content"), metadata: parts.metadata - sum("metadata") }, nodeModules: { content: 0, metadata: 0 }, build: { content: 0, metadata: 0 }, git: { content: 0, metadata: 0 } };
}

/** Cumulative by source: the previous range's plus this range's, never recomputed (REPORT_FORMAT §6). */
export function cumulative(prev, added) {
  return Object.fromEntries(SOURCES.map((s) => [s, { content: (prev?.[s]?.content ?? 0) + (added[s]?.content ?? 0), metadata: (prev?.[s]?.metadata ?? 0) + (added[s]?.metadata ?? 0) }]));
}

/**
 * The storage figures one range records (§3a–§3c, §9): parts, per-source
 * stored and amplification against the latest version, added this range,
 * stored per byte changed (split content / metadata / shared) and per Commit.
 * `version` is the latest version's per-source raw bytes; `changed` the bytes
 * changed per source; `commits` this range's LayerFS Commits. Head cost is
 * null until a reachability walk of the sealed file exists (see the notes).
 */
export function storageFigures({ parts, prevParts, bySource: by, added: add, version, changed, commits }) {
  // a source a caller did not record (metrics before `git`, P3) counts zero
  const zero = { content: 0, metadata: 0 }, fill = (x) => Object.fromEntries(SOURCES.map((k) => [k, x?.[k] ?? zero]));
  const bySource = fill(by), added = fill(add);
  const total = parts?.total ?? null;
  const latest = version ? { tracked: version.tracked?.bytes ?? 0, nodeModules: version.nodeModules?.bytes ?? 0, build: version.build?.bytes ?? 0, git: version.git?.bytes ?? 0 } : null;
  const ratio = (a, b) => (a == null || !b ? null : +(a / b).toFixed(3));
  const stored = (s) => bySource[s].content + bySource[s].metadata;
  const addedAll = SOURCES.reduce((n, s) => n + added[s].content + added[s].metadata, 0);
  const sharedNow = shared(parts), sharedPrev = shared(prevParts);
  const sharedAdded = sharedNow != null && sharedPrev != null ? sharedNow - sharedPrev : null;
  const changedAll = SOURCES.reduce((n, s) => n + (changed?.[s] ?? 0), 0);
  return {
    parts,
    amplification: ratio(total, version?.bytes),
    trackedAmplification: ratio(stored("tracked"), latest?.tracked),
    sources: Object.fromEntries(SOURCES.map((s) => [s, {
      latest: latest?.[s] ?? null, content: bySource[s].content, metadata: bySource[s].metadata, stored: stored(s),
      amplification: ratio(stored(s), latest?.[s]), headCost: null,
      added: added[s], changed: changed?.[s] ?? null,
      perByteChanged: changed?.[s] ? { content: ratio(added[s].content, changed[s]), metadata: ratio(added[s].metadata, changed[s]) } : null,
    }])),
    shared: { stored: sharedNow, added: sharedAdded },
    perByteChanged: changedAll ? { content: ratio(SOURCES.reduce((n, s) => n + added[s].content, 0), changedAll), metadata: ratio(SOURCES.reduce((n, s) => n + added[s].metadata, 0), changedAll), shared: ratio(sharedAdded, changedAll) } : null,
    perCommit: commits ? Math.round((addedAll + (sharedAdded ?? 0)) / commits) : null,
    // content and metadata no Commit's traced sizes covered (e.g. a merge's new Commit, which the trace gives no sizes)
    unattributed: parts ? parts.content + parts.metadata - SOURCES.reduce((n, s) => n + stored(s), 0) : null,
    headCost: null,
  };
}

/**
 * The sums REPORT_FORMAT §7 adds to `report.mjs check`, on recorded figures:
 * parts sum to Store on disk exactly and to space amplification within
 * rounding; per-source stored plus shared is Store on disk; per-source latest
 * versions sum to the total; history cost = amplification − head cost.
 */
export function storageProblems(st, storeOnDisk, versionBytes) {
  const p = [];
  if (!st?.parts) return p;
  const parts = st.parts;
  const sum = parts.exact ? parts.content + parts.metadata + parts.indexRows + parts.waste + parts.other : parts.content + parts.metadata + parts.remainder;
  if (sum !== storeOnDisk) p.push(`the parts sum to ${sum} bytes, Store on disk is ${storeOnDisk}`);
  if (versionBytes && st.amplification != null && Math.abs(sum / versionBytes - st.amplification) > 0.006) p.push(`the parts give ${(sum / versionBytes).toFixed(3)}×, space amplification is ${st.amplification}×`);
  // the sources this attempt recorded (`git` from P3; earlier metrics have three)
  const have = Object.keys(st.sources);
  const bySource = have.reduce((n, s) => n + st.sources[s].stored, 0);
  if (st.shared.stored != null && bySource + (st.unattributed ?? 0) + st.shared.stored !== storeOnDisk) p.push(`stored by source (${bySource}) plus unattributed (${st.unattributed}) plus shared (${st.shared.stored}) is not Store on disk (${storeOnDisk})`);
  const latest = have.reduce((n, s) => n + (st.sources[s].latest ?? 0), 0);
  if (versionBytes != null && latest !== versionBytes) p.push(`per-source latest versions sum to ${latest}, the latest version is ${versionBytes}`);
  if (st.headCost != null && st.historyCost != null && Math.abs(st.amplification - st.headCost - st.historyCost) > 0.006) p.push("history cost is not space amplification − head cost");
  return p;
}
