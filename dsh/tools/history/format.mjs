// The range report in its binding format (#352 REPORT_FORMAT.md, owner
// 2026-10-18): a headline, 1. Correctness, 2. Activity, 3. Storage, 4. Speed,
// 5. Findings and action, then the appendix A–G. report.mjs renders it for an
// attempt that recorded the format's measurements (`version`, `overview`,
// `calls`); attempts recorded before keep their committed report (F2).
// `checkFormat` holds REPORT_FORMAT.md §7's checks; reportcheck.mjs runs it.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { d6Text, exponent, opsOf, reinstallGate, sameBinary, uncontended } from "./gates.mjs";
import { storageProblems } from "./storage.mjs";
import { change, closedWithoutChange, EVIDENCE_COLUMNS, evidenceRow, kindText, REBUILD_KINDS } from "./findings.mjs";
import { activityTables, categoryOf, checkOverview, checkTimeLine, timeLine } from "./stats.mjs";

const pad = (n) => String(n).padStart(3, "0");
const int = (n) => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));
const num = (v, d = 2) => (v == null || !Number.isFinite(v) ? "—" : v.toFixed(d));
export const bytes = (n) => (n == null ? "—" : Math.abs(n) >= 2 ** 30 ? `${(n / 2 ** 30).toFixed(2)} GiB` : Math.abs(n) >= 2 ** 20 ? `${(n / 2 ** 20).toFixed(1)} MiB` : `${(n / 1024).toFixed(1)} KiB`);
const signed = (n, f = bytes) => (n == null ? "—" : `${n >= 0 ? "+" : "−"}${f(Math.abs(n))}`);
const table = (head, rows) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map((c) => (c == null || c === "" ? "—" : String(c))).join(" | ")} |`)].join("\n");
const id12 = (x) => String(x ?? "?").slice(0, 12);
const ms = (v) => (v == null ? "—" : `${v >= 100 ? Math.round(v) : v.toFixed(1)} ms`);

export const FORMAT_HEADINGS = ["## 1. Correctness", "## 2. Activity", "## 3. Storage", "## 4. Speed", "## 5. Findings and action", "## Appendix"];
export const APPENDIX = ["### A. Checks", "### B. Latency by method and size class", "### C. Scale probes", "### D. Storage internals", "### E. Stage times", "### F. Attempts", "### G. Evidence"];
export const NONE_LINE = "**Optimization:** none — no problems found.";
export const FINDINGS = "## 5. Findings and action";
export const HEADLINE_CELLS = ["Latest version", "Store on disk", "Space amplification", "Added this range", "Commits", "Time"];

/**
 * The closure's install against the native oracle, with the count of every
 * normalized field (INSTALLS §4, lister v3), so the comparison can't silently
 * widen: install root and time in the two named state files, root in sh bin
 * shims, root in pnpm's output.
 */
export function installedText(cl) {
  const o = cl.oracle, n = cl.normalized, f = n?.files ?? {};
  const st = (p) => (f[p] ? `\`${p.slice(13)}\` root ×${f[p].root}, time ×${f[p].time}` : `\`${p.slice(13)}\` absent`);
  const norm = n ? `normalized: ${st("node_modules/.modules.yaml")} · ${st("node_modules/.pnpm-workspace-state-v1.json")} · root ×${f.shims?.root ?? 0} in ${f.shims?.files ?? 0} bin shims · output root ×${n.outputRoot}${n.outputVerifiedAge != null ? `, verification age ×${n.outputVerifiedAge}` : ""}` : "normalized: not recorded";
  const er = cl.earlierRoots, earlier = er ? ` · earlier mount roots ×${er.install.occurrences} in ${er.install.files} files (${er.roots.length} roots${er.reinstall ? `; reinstall ×${er.reinstall.occurrences}` : ""})${er.binCheck ? ` · \`${er.binCheck.command}\` in the new mount: exit ${er.binCheck.exitCode}` : ""}` : "";
  return `${cl.oracleKind === "sequence" ? "against the native replay of its chain · " : ""}${o.ok ? `**${o.groups} package groups equal to native**` : `**differs**: ${o.missing.length} missing, ${o.extra.length} extra, ${o.differ.length} differ`} · ${norm}${earlier}`;
}

/** The range's 1-min load average line (owner 2026-10-18), or why there is none. */
export const hostLoadLine = (m) => (m?.hostLoad ? `Load average (1-min, ${m.hostLoad.where ?? "player"}): start ${m.hostLoad.start ?? "—"} · end ${m.hostLoad.end ?? "—"}.` : "Load average: not recorded (before 2026-10-18).");

/** The Store on disk of an attempt: the allocated bytes of the Store file and its WAL (sealed: no WAL). */
export const storeOnDisk = (m) => (m?.storeDisk ? m.storeDisk.allocated + (m.storeDisk.walAllocated ?? 0) : null);
/** Space amplification (REPORT_FORMAT.md §4): Store on disk ÷ latest version. */
export const spaceAmp = (m) => (m?.version?.bytes ? storeOnDisk(m) / m.version.bytes : null);

/**
 * Open findings from BUGS.md (REPORT_FORMAT.md §3.5 "Open issues"): each
 * bullet `- **F-NNN · <title> …**` with its continuation lines; one marked
 * **Fixed** or **Closed** is closed. The owner and next step come from its
 * "Owner: <who>, <next step>." sentence. Every open finding is listed.
 */
export function openIssues(text) {
  const items = [];
  let cur = null;
  for (const line of String(text ?? "").split("\n")) {
    const head = /^- \*\*(F-\d{3}) · (.+)$/.exec(line);
    if (head) { cur = { id: head[1], text: head[2] }; items.push(cur); continue; }
    if (/^- \*\*F-\d{3}[,\s]/.test(line) || (cur && /^\s+\S/.test(line))) { if (cur) cur.text += ` ${line.trim()}`; continue; }
    if (/^(#|- |\|)/.test(line) || !line.trim()) cur = /^\s*$/.test(line) ? cur : null;
  }
  return items.filter((x) => !/\*\*(Fixed|Closed)\*\*/.test(x.text)).map((x) => {
    const title = x.text.replace(/\*\*/g, "").split(/ \(|\.\s/)[0].replace(/\.$/, "");
    const owner = /Owner(?: of the fix)?: ([^,.(]+)(?:\(([^)]*)\)|,\s*([^.]*))?/.exec(x.text);
    return { id: x.id, title, owner: owner ? owner[1].trim() : "lead", next: (owner?.[2] ?? owner?.[3])?.trim() || "see BUGS.md" };
  });
}

/** The three measures that moved most against the previous range (F-007): op p95s, storage, probes, time. */
export function movers(m, prev) {
  if (!prev) return [];
  const out = [];
  const add = (name, a, b, min = 0) => { if (a > min && b != null) out.push({ name, pct: (b - a) / a }); };
  add("range time", prev.wall?.totalMs, m.wall?.totalMs);
  for (const [op, k] of Object.entries(m.key?.ops ?? {})) if (k.n >= 5 && prev.key?.ops?.[op]?.n >= 5) add(`${op} p95`, prev.key.ops[op].p95, k.p95);
  add("stored added", prev.storage?.newStored, m.storage?.newStored, 1024);
  add("metadata added", prev.storage?.newMetadata, m.storage?.newMetadata, 1024);
  for (const [name, p] of Object.entries(m.probes ?? {})) add(`probe ${name}`, prev.probes?.[name]?.ms, p.ms, 0.5);
  return out.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 3);
}
const moverText = (x) => `${x.pct >= 0 ? "▲" : "▼"} ${x.name} ${x.pct >= 0 ? "+" : "−"}${Math.round(Math.abs(x.pct) * 100)}%`;

/** Probe depth exponents over this daemon's ranges: flat (< watch) out of all, and the others by name. */
function probeFits(m, history, watch = 0.15) {
  const all = [...history.filter(sameBinary(m)), m];
  const fits = Object.keys(m.probes ?? {}).map((name) => ({ name, e: exponent(all.map((x) => [x.depth?.after, x.probes?.[name]?.ms])) }));
  const judged = fits.filter((f) => f.e != null);
  return { total: fits.length, judged: judged.length, flat: judged.filter((f) => f.e < watch).length, rising: judged.filter((f) => f.e >= watch) };
}

const ROLE_ROWS = [["Whole files", [1]], ["Chunks (large files)", [2]], ["Large-file extents", [3, 4]], ["Directories", [7, 8]], ["Inodes and attributes", [5, 6, 9, 10, 11, 12]], ["Symlinks", [13]]];

/** The "What's inside" rows: totals and average sizes from the sealed file (snapshots), added and delta share from the range's Saves. */
function insideRows(m) {
  const d = m.storage?.delta, f = m.figures, sum = (l = []) => l.reduce((n, x) => n + x, 0);
  const total = (roles) => (f ? f.objects.filter((o) => roles.includes(Number(o.role))).reduce((a, o) => ({ n: a.n + o.n, b: a.b + (o.canonical ?? 0) }), { n: 0, b: 0 }) : null);
  const deltaShare = (list) => (sum(list) ? `${Math.round((1 - (list[0] ?? 0) / sum(list)) * 100)}%` : "—");
  const c = m.construction ?? {};
  const wholeAdded = sum(d?.depths?.wholeFile), chunkAdded = sum(d?.depths?.chunk), metaAdded = sum(d?.depths?.metadata);
  const reused = c.files_constructed != null ? Math.max(0, c.files_constructed - (c.files_unchanged ?? 0) - wholeAdded) : null;
  return ROLE_ROWS.map(([name, roles]) => {
    const t = total(roles);
    const added = name === "Whole files" ? wholeAdded : name === "Chunks (large files)" ? chunkAdded : name === "Directories" ? `${int(metaAdded)} (with inodes, pooled)` : name === "Symlinks" ? c.symlinks ?? 0 : name === "Inodes and attributes" ? "↑ pooled" : "—";
    const share = name === "Whole files" ? deltaShare(d?.depths?.wholeFile) : name === "Chunks (large files)" ? deltaShare(d?.depths?.chunk) : name === "Directories" ? deltaShare(d?.depths?.metadata) : "—";
    return [name, t ? int(t.n) : "— (at snapshots)", typeof added === "number" ? `+${int(added)}` : added, t?.n ? bytes(t.b / t.n) : "—", name === "Whole files" ? (reused == null ? "—" : `${int(reused)} (derived)`) : "—", share];
  });
}

/**
 * The report of a range whose latest attempt recorded the format's
 * measurements. `history` holds earlier ranges' latest attempts (oldest
 * first), `issues` the open findings (openIssues).
 */
export function renderFormat({ plan, summary, attempts, gates, lead, findings = [], history = [], baseline = null, issues = [], latencyRows = null, stageLine = null }) {
  const m = attempts.at(-1), g = gates.at(-1), prev = history.at(-1) ?? null, s = m.storage ?? {}, o = m.overview, w = m.work ?? {};
  const c = m.checks ?? {}, v = m.version, out = [];
  const totalMs = [...history, m].reduce((n, x) => n + (x.wall?.totalMs ?? 0), 0);
  const start = m.startedFrom?.kind === "fork" ? `forked from snapshot r${pad(m.startedFrom.range)} (run ${m.startedFrom.run})` : `continued from r${pad(m.startedFrom?.range ?? plan.range - 1)} (live Store)`;
  const areas = m.dsh?.areas ?? [], top = areas.slice(0, 3), other = 1 - top.reduce((n, a) => n + a.share, 0);
  const bad = g.checks.filter((x) => x.result === "optimize" || x.result === "stop"), watch = g.checks.filter((x) => x.result === "watch");
  const store = storeOnDisk(m), amp = spaceAmp(m), prevAmp = spaceAmp(prev);
  const b = m.budget ?? {};
  out.push(`# Range ${pad(plan.range)} · **${g.verdict}** · attempt ${m.attempt}`, "",
    `**Matches git ${c.tree?.ok ? "✓" : "✗"}** · daemon \`${id12(m.binary?.daemon)}\` · image \`${String(m.binary?.image ?? "?").replace(/^sha256:/, "").slice(0, 8)}\` · plan v${m.plan?.version ?? "?"} · ${start}${m.devAid ? ` · dev aid: ${m.devAid}` : ""}`,
    `dsh \`${plan.dsh.first.slice(0, 9)}\`..\`${plan.checkpoint.slice(0, 9)}\` · **${int(plan.dsh.commits)} commits** (${int(m.dsh?.mainline)} mainline, ${int(m.dsh?.side)} side) · ${m.dsh?.first ?? "?"} → ${m.dsh?.last ?? "?"}`,
    `Areas changed: ${top.map((a) => `\`${a.name}\` ${Math.round(a.share * 100)}%`).join(" · ")}${other > 0.005 ? ` · other ${Math.round(other * 100)}%` : ""}`, "",
    table(HEADLINE_CELLS, [[
      `**${bytes(v?.bytes)}** (${prev?.version ? signed(v.bytes - prev.version.bytes) : "prev —"})`,
      `**${bytes(store)}** (${prev?.storeDisk ? signed(store - storeOnDisk(prev)) : "prev —"})${m.storeDisk?.sealed ? "" : " live"}`,
      `**${num(amp)}×** (prev ${prevAmp == null ? "—" : `${num(prevAmp)}×`})`,
      `**${bytes(s.newStored)}**`,
      `**${int(w.lfsCommits)}** (total ${int(m.depth?.after)})`,
      `**${num((m.wall?.totalMs ?? 0) / 1000, 1)} s** tooling (total ${num(totalMs / 60000, 1)} min)`,
    ]]), "",
    `**Checks:** ${g.checks.length - watch.length - bad.length} pass${watch.length ? ` · ${watch.length} watch: ${watch.map((x) => `${x.name} ${x.value}`).join("; ")}` : ""}${bad.length ? ` · ${bad.length} optimize/stop: ${bad.map((x) => x.name).join(", ")}` : ""}`,
    `**${d6Text(m.defer?.d6).replace(/^D-6 triggers/, "D-6 triggers**")}`,
    `**Moved most:** ${movers(m, prev).map(moverText).join(" · ") || "— (no previous range in this metrics folder)"}`,
    `**Budget:** ${plan.range + 1} of 202 ranges · projected total ${b.wallProjectedMs ? `${num(b.wallProjectedMs / 3.6e6, 1)} h` : "—"} (budget ${b.wallBudgetMs ? `${num(b.wallBudgetMs / 3.6e6, 1)} h` : "not set"}) · disk ${b.diskBudget ? `${Math.round((b.diskProjected / b.diskBudget) * 100)}%` : "—"} of budget at range 202`, "");
  // 1. Correctness
  const conflicts = o.conflicts.reduce((n, x) => n + x.hit, 0), planned = o.conflicts.reduce((n, x) => n + x.planned, 0);
  out.push("## 1. Correctness", "", table(["Check", "Result"], [
    ["Tree vs git", c.tree?.ok ? `**${int(c.tree.files)} ${c.tree.full ? "tracked files match" : "changed paths match"}** (blob id and mode)${c.tree.full ? "" : " via diff_commits; full tree at snapshots"}` : `**differs**: ${c.tree?.missing?.length ?? 0} missing, ${c.tree?.extra?.length ?? 0} extra, ${c.tree?.content?.length ?? 0} content, ${c.tree?.mode?.length ?? 0} mode`],
    ["History", `${o.branches.filter((x) => x.merged !== "—").length} lanes merged, ${o.branches.filter((x) => x.published === "✓").length} publish${o.branches.filter((x) => x.published === "✓").length === 1 ? "" : "es"}${c.history?.ok ? "" : " · **not as planned**"}`],
    ["Steps", `${int(c.steps?.matched)} / ${int(c.steps?.total)} outcomes as planned`],
    ["Conflicts", `**${conflicts} / ${planned} planned hit · ${c.conflicts?.unplanned ?? 0} unplanned**`],
    ["Unit tests", c.tests?.run ? `**${c.tests.equal} / ${c.tests.run} equal to native**` : `— (not played in ${String(m.phase).toUpperCase()})`],
    ...(m.closure?.oracle ? [["Installed tree", installedText(m.closure)]] : []),
    ...(m.lww ? [["Last-writer-wins (`/.lww`)", `${m.lww.written ? "written" : "unchanged"} (${int(m.lww.lines)} lines from ${Object.keys(m.lww.sources ?? {}).length} .gitignore files) · **${int(m.lww.total)} picks** in ${m.lww.picks.length} merges${m.lww.picks.some((p) => p.nodeModules) ? ` (${int(m.lww.picks.reduce((n, p) => n + p.nodeModules, 0))} under node_modules)` : ""}${m.closure?.lwwPicked ? " · re-installed after the merge" : ""}`]] : []),
    ["Ignored files", (w.leftOut?.install ? `— (installs not played in ${String(m.phase).toUpperCase()})` : "as expected")],
    ["Milestone", plan.milestone ? (m.snapshot ? "snapshot taken; restore, oracle and quick_check by the lead (SPEC §7)" : "**snapshot not taken**") : "—"],
  ]), "");
  // 2. Activity
  const mu = w.mutations ?? {}, sumMu = (k) => (mu.fs?.[k] ?? 0) + (mu.sandbox?.[k] ?? 0);
  const fsN = w.fileMutations?.fs ?? 0, sbN = w.fileMutations?.sandbox ?? 0, ex = m.execs ?? {};
  out.push("## 2. Activity", "",
    `**${int(Object.values(m.calls).reduce((n, x) => n + x.n, 0))} calls** · **${int(o.steps)} steps** by **${o.agents.length - 1} agents + lead** on **${o.branches.length - 1} Branches + main** · **${int(w.workspaces)} Workspaces** (${Math.round((w.oneShotShare ?? 0) * 100)}% one-shot, ${int(m.health?.workspacesOpen)} open at end)`,
    `**File changes:** +${int(sumMu("added"))} added · ${int(sumMu("modified"))} modified · −${int(sumMu("deleted"))} deleted · ${bytes(sumMu("bytes"))} written · fs ${int(fsN)} : Sandbox ${int(sbN)} (**${sbN ? num(fsN / sbN, 0) : "—"} : 1**, target ~9 : 1)`,
    `**Execs:** ${int(ex.total)} (JS ${int(ex.js)} · shell ${int(ex.shell)}) · ${int(ex.nonZero)} non-zero exits · install ${int(ex.installs)} · test runs ${int(ex.tests)}${ex.version != null ? ` · version figures ${int(ex.version)} (tooling)` : ""}`, "",
    activityTables(m));
  // 3. Storage
  const pv = prev?.version, median = (() => { const xs = history.map((x) => (x.storage?.changedBytes ? x.storage.newStored / x.storage.changedBytes : null)).filter((x) => x != null).sort((a, b) => a - b); return xs.length ? xs[Math.floor((xs.length - 1) / 2)] : null; })();
  const perByte = s.changedBytes ? s.newStored / s.changedBytes : null;
  const split = (x) => (x ? `${bytes(x.bytes)} (${bytes(x.tracked.bytes)} / ${bytes(x.nodeModules.bytes)} / ${bytes(x.build.bytes)})` : "—");
  const counts = (x) => (x ? `${int(x.files)} / ${int(x.dirs)} / ${int(x.symlinks)}` : "—");
  const sr = m.storageReport, psr = prev?.storageReport;
  const xv = (n) => (n == null || !v?.bytes ? "—" : `${num(n / v.bytes)}`);
  const headCost = sr ? (m.storeDisk?.sealed ? "— (needs a reachability walk of the sealed file; not built)" : "— (not at a snapshot)") : "—";
  out.push("## 3. Storage", "", "**3a. Overview**", "", table(["", `Previous${prev ? ` (r${pad(prev.range)})` : ""}`, "Now", "Change"], [
    ["Latest version (tracked / `node_modules` / build)", split(pv), split(v), pv && v ? signed(v.bytes - pv.bytes) : "—"],
    ...(v?.how ? [["Version figures from", "", `${v.how}${v.how === "incremental" ? ` (${int(v.looked)} changed paths)` : ""}`, ""]] : []),
    ["Files / directories / symlinks", counts(pv), counts(v), pv && v ? `${signed(v.files - pv.files, int)} / ${signed(v.dirs - pv.dirs, int)} / ${signed(v.symlinks - pv.symlinks, int)}` : "—"],
    ["Largest file / largest directory", pv ? `${bytes(pv.largestFile.bytes)} / ${int(pv.largestDir.entries)} entries` : "—", v ? `${bytes(v.largestFile.bytes)} (\`${v.largestFile.path}\`) / ${int(v.largestDir.entries)} entries (\`${v.largestDir.path}\`)` : "—", ""],
    [`**Store on disk** (allocated${m.storeDisk?.sealed ? ", sealed" : ", live: file + WAL"})`, bytes(storeOnDisk(prev)), bytes(store), prev?.storeDisk ? signed(store - storeOnDisk(prev)) : "—"],
    ["**Space amplification** (total · tracked)", prevAmp == null ? "—" : `${num(prevAmp)}×${psr?.trackedAmplification != null ? ` · tracked ${num(psr.trackedAmplification)}×` : ""}`, amp == null ? "—" : `${num(amp)}×${sr?.trackedAmplification != null ? ` · tracked ${num(sr.trackedAmplification)}×` : ""}`, prevAmp != null && amp != null ? num(amp - prevAmp) : "—"],
    ["Head cost / history cost", "", `${headCost} / —`, ""],
    ["**Stored per byte changed** (content / metadata / shared)", "", sr?.perByteChanged ? `**${num(perByte)}** (${num(sr.perByteChanged.content)} / ${num(sr.perByteChanged.metadata)} / ${sr.perByteChanged.shared == null ? "—" : num(sr.perByteChanged.shared)})` : perByte == null ? "—" : `**${num(perByte)}**`, perByte != null && median ? `${num(perByte / median)}× the median range` : "median not yet"],
    ["**Stored per Commit**", psr?.perCommit != null ? bytes(psr.perCommit) : "—", sr?.perCommit != null ? bytes(sr.perCommit) : "—", ""],
    ["Metadata share", prev?.storeDisk ? num(prev.storage.metadata / storeOnDisk(prev)) : "—", store ? num(s.metadata / store) : "—", `this range ${num(s.directoryShare)}`],
    ["History: Commits / Layers / Branches", prev ? `${int(prev.depth?.after)}` : "—", `${int(m.depth?.after)} / ${int(m.history?.layers)} / ${int(m.history?.branches)}`, `+${int(w.lfsCommits)}`],
    ["Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast)", "", b.diskModel ? `${bytes(b.diskModel.estimate)} (Commits ${bytes(b.diskModel.commitBytes)} · installs ${bytes(b.diskModel.installBytes)} · build ${bytes(b.diskModel.buildBytes)})` : "—", ""],
    ["Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget", "", `${bytes(b.diskProjected)} / ${b.diskBudget ? `${Math.round((b.diskProjected / b.diskBudget) * 100)}%` : "—"}`, ""],
    ["Snapshot", "", m.snapshot ? `r${pad(plan.range)}, ${bytes(m.snapshot.newBytes)} new blocks` : "none this range", ""],
  ]), "", "**3b. Where the bytes are**", "", sr ? partsTable(sr.parts, psr?.parts, v?.bytes) : "— (recorded before the storage revision, REPORT_FORMAT §3)", "",
  "**3c. By source**", "", sr ? sourceTable(sr) : "— (recorded before the storage revision)", "",
  "**3d. What's inside**", "", table(["Object", "Total", "Added", "Avg size", "Reused (dedupe hits)", "As delta"], insideRows(m)), "",
  `Delta: ${num((s.delta?.atCap ?? 0) * 100, 1)}% at depth cap · ${num((s.delta?.byBudget ?? 0) * 100, 0)}% of refused bases stopped by budget · \`node_modules\` reinstall: ${s.reinstall == null ? "none this range" : reinstallGate(s.reinstall).value}`, "");
  // 4. Speed
  const k = m.key?.ops ?? {}, cell = (op) => (k[op] ? `${ms(k[op].p50)} / ${ms(k[op].p95)}` : "—");
  // SPEC §5: the ratio is the uncontended series' (rows recorded before the split: all of them)
  const judged = (() => { const ops = opsOf(m, baseline); return ops.some((r) => r.series) ? uncontended(ops) : ops; })();
  const ratio = (op) => { const r = judged.filter((x) => x.op === op).sort((a, b2) => b2.n - a.n)[0]; const bl = baseline && (baseline.daemon ?? null) === (m.binary?.daemon ?? null) && r ? baseline.ops[`${op}\u0000${r.sizeClass}`] : null; return bl ? ` (${num(r.p50 / bl.p50)}×)` : ""; };
  const fits = probeFits(m, history);
  const h = m.health ?? {};
  out.push("## 4. Speed", "", `Daemon \`${id12(m.binary?.daemon)}\` · p50 / p95 · ratio to baseline (dominant size class) in brackets`, "",
    table(["write", "read", "list", "Commit (one-shot)", "mount", "merge", "exec (FUSE ÷ native)"], [
      [...["fs.write", "fs.read", "fs.list", "sandbox.commit", "sandbox.mount", "branch.merge"].map((op) => `${cell(op)}${ratio(op)}`), `— (native comparison in P3; exec ${cell("sandbox.exec")})`],
      [...["fs.write", "fs.read", "fs.list", "sandbox.commit", "sandbox.mount", "branch.merge"].map((op, i) => `${i ? "" : "SQL p50: "}${k[op]?.statements == null ? "—" : `${int(k[op].statements)} stmts`}`), "—"],
    ]), "",
    `**Commit cost:** ${m.key?.commitPerFileMs == null ? "—" : `${num(m.key.commitPerFileMs)} ms per changed file`} · **One-shot Workspace** (mount + exec + commit + unmount): ${ms(m.key?.oneShotP50)} p50 over ${int(m.key?.oneShots)}`,
    `**Slowest:** ${(m.key?.slowest ?? []).map((x) => `${x.op} ${ms(x.ms)}${x.size ? ` (${int(x.size.n)} ${x.size.kind})` : ""}`).join(" · ") || "—"}${m.perUnit?.["branch.diff_commits"] ? ` · checkpoint diff_commits ${num(m.perUnit["branch.diff_commits"].msPerEntry)} ms${m.perUnit["branch.diff_commits"].statementsPerEntry != null ? ` and ${num(m.perUnit["branch.diff_commits"].statementsPerEntry)} statements` : ""} per entry (${int(m.perUnit["branch.diff_commits"].entries)} entries${m.perUnit["branch.diff_commits"].basis === "checkpoint" ? ` in ${m.perUnit["branch.diff_commits"].pages} pages` : " per page"})` : ""}`,
    `**Scaling:** ${fits.judged ? `${fits.flat} of ${fits.judged} probes flat${fits.rising.length ? ` · ${fits.rising.map((f) => `\`${f.name}\` ${num(f.e)}`).join(" · ")}` : ""}` : `not judged: fewer than 3 same-binary ranges (${fits.total} probes)`}`, "",
    `**Health:** ${int(h.workspacesOpen)} Workspaces open · ${h.overlaysLeft == null ? "overlay files not measured" : `${int(h.overlaysLeft)} overlay files left`} · daemons ${h.daemonRssMb == null ? "—" : `${num(h.daemonRssMb, 0)} MB`}${prev?.health?.daemonRssMb != null && h.daemonRssMb != null ? ` (${signed(h.daemonRssMb - prev.health.daemonRssMb, (x) => `${num(x, 0)} MB`)})` : ""} over ${h.sandboxes ?? "?"} Sandboxes · ${int(h.openFiles)} open files · WAL ${m.snapshot ? `before seal ${bytes(m.snapshot.walBytes)}` : `${bytes(m.storeDisk?.wal)} (live)`}`, "");
  // 5. Findings and action
  out.push(FINDINGS, "");
  const tripped = attempts.map((a, i) => [a, gates[i]]).filter(([, x]) => x.verdict === "optimize" || x.verdict === "stop");
  if (!tripped.length && g.verdict !== "stop") out.push(NONE_LINE, "");
  for (const [a, x] of tripped) out.push(renderFindingFormat(plan.range, a, x, findings.find((f) => f.attempt === a.attempt), attempts.find((y) => y.attempt > a.attempt) ?? null), "");
  out.push("### Open issues touching this range", "", issues.length ? table(["Id", "Issue", "Owner", "Next step"], issues.map((i) => [i.id, i.title, i.owner, i.next])) : "None open.", "");
  out.push("### Lead's note (written by the lead; never empty unless the verdict is pass)", "", lead?.trim() ? lead.trim() : "- (none yet)", "", "");
  // Appendix
  out.push("## Appendix", "", APPENDIX[0], "", table(["Check", "Value", "Threshold", "Result"], g.checks.map((x) => [x.name, x.value, x.threshold, x.result])), "",
    "Played vs planned:", "", table(["Count", "Played", "Planned"], [
      ["Steps (bash calls)", w.bashCalls, summary.bashCalls], ["Lanes / agents", `${o.branches.length - 1} / ${o.agents.length - 1}`, `${summary.lanes} / ${summary.agents}`],
      ["LayerFS Commits", w.lfsCommits, summary.lfsCommits], ["Workspaces (one-shot share)", `${int(w.workspaces)} (${num(w.oneShotShare)})`, `${summary.workspaces} (${summary.oneShotShare})`],
      ["Reads", w.reads, summary.reads], ["Reconcile writes", w.reconcile, summary.reconcile],
      ["Left out (not played in this phase)", Object.entries(w.leftOut ?? {}).map(([kk, n]) => `${kk} ${n}`).join(", ") || "none", "—"],
    ]), "",
    APPENDIX[1], "", `Binary: daemon \`${id12(m.binary?.daemon)}\` (attempt ${m.attempt}). Each call's own input is its size class; ×base compares the same operation and class only.`, "",
    latencyRows ? latencyRows(m, history, baseline) : "", "",
    table(["Method", "Category", "Calls", "Bytes in", "Bytes out", "Files / entries", "Outcomes"], Object.entries(m.calls).map(([meth, r]) => [meth, categoryOf(meth) ?? "unassigned", int(r.n), bytes(r.bytesIn), bytes(r.bytesOut), int(r.files), Object.entries(r.outcomes).map(([kk, n]) => `${kk} ${n}`).join(", ")])), "",
    APPENDIX[2], "", `Binary: daemon \`${id12(m.binary?.daemon)}\`.`, "", hostLoadLine(m), "",
    Object.keys(m.probes ?? {}).length ? table(["Probe", "ms (median)", "Samples", "Load 1-min", "Counters (first sample)"], Object.entries(m.probes).map(([kk, p]) => [kk, p.ms,
      p.samples ? p.samples.join(" · ") : "1 (before 2026-10-18)", p.load ? `${Math.min(...p.load)}–${Math.max(...p.load)}` : "—",
      Object.entries(p.counters ?? {}).map(([cc, n]) => `${cc} ${n}`).join(", ")])) : "No probes recorded.", "",
    APPENDIX[3], "", m.figures ? storageInternals(m.figures, plan.range, m) : "No snapshot this range: the sealed file's figures are read at snapshots.", "",
    APPENDIX[4], "", timeLine(m.wall), "", stageLine ? stageLine(m.wall) : "", "",
    APPENDIX[5], "", table(["#", "Binary", "Started", "Result", "Reason"], attempts.map((a, i) => [String(a.attempt), gates[i].binary, gates[i].started, gates[i].verdict, gates[i].reason])), "",
    APPENDIX[6], "", ...attempts.map((a) => `- \`~/lfs-history/metrics/range-${pad(a.range)}.a${a.attempt}.json\``), ...findings.map((f) => `- \`~/lfs-history/metrics/finding-${pad(f.range)}.a${f.attempt}.json\``),
    `- trace \`~/lfs-history/runs/${m.run}/trace/range-${pad(m.range)}.a${m.attempt}.jsonl\` · runner log \`~/lfs-history/runs/${m.run}/play.log\`${m.snapshot ? ` · snapshot manifest \`${m.snapshot.manifest}\`` : ""}`, "");
  return out.join("\n");
}

/** 3b (REPORT_FORMAT §3): the five parts, × latest version, change; exact at snapshots, else content and metadata plus one live remainder. */
function partsTable(p, prevP, versionBytes) {
  const x = (n) => (n == null || !versionBytes ? "—" : `${num(n / versionBytes)}`);
  const ch = (k) => (prevP && prevP[k] != null && p[k] != null ? signed(p[k] - prevP[k]) : "—");
  const rows = p.exact
    ? [["Content", p.content, "content"], ["Metadata", p.metadata, "metadata"], ["Index rows", p.indexRows, "indexRows"], ["Waste", p.waste, "waste"], ["Other", p.other, "other"]]
    : [["Content", p.content, "content"], ["Metadata", p.metadata, "metadata"], ["Index rows + waste + other (live, not split)", p.remainder, "remainder"]];
  return [table(["Part", "Bytes", "× latest version", "Change this range"], [...rows.map(([name, n, k]) => [name, bytes(n), x(n), ch(k)]),
    ["**Total = Store on disk**", `**${bytes(p.total)}**`, `**= ${x(p.total)}** space amplification`, prevP ? signed(p.total - prevP.total) : "—"]]),
  p.exact ? "Exact: from the sealed file." : "Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them."].join("\n\n");
}

/** 3c (REPORT_FORMAT §3): per source; Shared is shown and never divided. */
function sourceTable(sr) {
  const name = { tracked: "Tracked", nodeModules: "`node_modules`", build: "Build output" };
  const rows = Object.entries(sr.sources).map(([k, x]) => [name[k], bytes(x.latest), `${bytes(x.stored)} (${bytes(x.content)} + ${bytes(x.metadata)})`, x.latest ? `${num(x.amplification)}×` : "—",
    "—", x.added.content + x.added.metadata ? bytes(x.added.content + x.added.metadata) : "0", x.changed == null ? "—" : bytes(x.changed),
    x.perByteChanged ? num(x.perByteChanged.content + x.perByteChanged.metadata) : "—"]);
  const total = Object.values(sr.sources).reduce((n, x) => n + x.stored, 0);
  return [table(["Source", "Latest version", "Stored (content + metadata)", "Amplification", "Head cost", "Added this range", "Changed this range", "Stored per byte changed"], [...rows,
    ["Shared (index rows + waste + other)", "—", bytes(sr.shared.stored), "— (not divided)", "—", sr.shared.added == null ? "—" : bytes(sr.shared.added), "—", "—"],
    ...(sr.unattributed ? [["Unattributed (Saves without traced sizes)", "—", bytes(sr.unattributed), "—", "—", "—", "—", "—"]] : []),
    ["**Total**", "", `**${bytes(total + (sr.shared.stored ?? 0) + (sr.unattributed ?? 0))}**`, `**= ${num(sr.amplification)}×** space amplification`, "", "", "", ""]]),
  "Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only."].join("\n\n");
}

function storageInternals(f, range, m) {
  return [`From the sealed file at snapshot r${pad(range)}: ${int(f.pages)} pages of ${int(f.pageSize)} B, ${int(f.freePages)} free · Commits ${int(f.commits)} · Branches ${int(f.branches)} · Layers ${int(f.layers)}${m?.storage?.stored ? ` · compression ${num(m.storage.canonical / m.storage.stored)}× (canonical ÷ stored)` : ""}.`, "",
    table(["Role", "Objects", "Canonical bytes"], f.objects.map((o) => [o.role, int(o.n), bytes(o.canonical)])), "",
    table(["Pack domain", "Packs", "Bytes"], f.packs.map((p) => [p.domain, int(p.n), bytes(p.bytes)])), "",
    f.tables ? table(["Table or index", "Pages", "Bytes", "Unused"], f.tables.slice(0, 20).map((t) => [t.name, int(t.pages), bytes(t.bytes), bytes(t.unused)])) : "No dbstat in the image's SQLite."].join("\n");
}

/**
 * One tripped attempt's finding (REPORT_FORMAT.md §3.5): trigger, fix
 * context (old and new design), before/after, with vs without on this range
 * (the tripped attempt against its rerun, each under its binary), the cost of
 * the fix and the records; "Diagnosis pending" until the finding exists.
 */
export function renderFindingFormat(range, a, gate, f, rerun) {
  const none = closedWithoutChange(f);
  const head = `### Finding ${pad(range)}.a${a.attempt} · ${gate.verdict}${f ? (none ? " → closed without a code change" : " → fixed") : ""}${f ? ` · ${f.diagnosis.summary.split(/[.;]/)[0]}` : ""}`;
  const trip = gate.checks?.filter((x) => x.result === "optimize" || x.result === "stop") ?? [];
  const lines = [head, "", `**1. Trigger** (attempt ${a.attempt}, daemon \`${id12(a.binary?.daemon)}\`)`, "",
    table(["Check", "Value", "Threshold"], (f ? [{ name: f.trigger.check, value: f.trigger.value, threshold: f.trigger.threshold }] : trip).map((x) => [x.name, x.value, x.threshold])), ""];
  if (!f) return [...lines, `Diagnosis pending: \`finding-${pad(range)}.a${a.attempt}.json\`.`].join("\n");
  const d = f.diagnosis;
  lines.push("**2. Fix context**", "", table(["", ""], [
    ["Playbook step", d.step], ["Cause", d.cause ?? d.summary], ...(none ? [] : [["Old design", f.design?.old], ["New design", f.design?.new]]),
    ["Kind", none ? `${kindText(f.fix.kind)} · ${f.fix.summary}` : kindText(f.fix.kind)], ...(REBUILD_KINDS[f.fix.kind] ? [["Old Stores", f.fix.oldStores], ["Old data", f.fix.oldData],
      f.fix.kind < 3 ? ["Compatibility test", f.fix.compat] : ["Rebuild justification", Object.values(f.fix.justification ?? {}).join(" · ")]] : []),
    ...(none ? [] : [["Commits", `${String(f.fix.commit).split(/,\s*/).map((x) => `\`${x}\``).join(", ")}${f.fix.test ? ` · regression tests ${f.fix.test}` : ""}`]]), ["Recovery", f.recovery],
  ]), "", none ? "**3. Evidence** (no code change; one sample each unless the row says otherwise)" : "**3. Before / after** (same snapshots, one sample each)", "",
  none ? table(EVIDENCE_COLUMNS, f.evidence.map(evidenceRow))
    : table(["Measure", "Before", "After", "Change", "Old binary", "New binary", "Snapshot / checkpoint", "Cache"], f.improvement.map((r) => [r.measure, `${r.before}${r.unit ? ` ${r.unit}` : ""}`, `${r.after}${r.unit ? ` ${r.unit}` : ""}`, change(r.before, r.after), `\`${r.oldBinary}\``, `\`${r.newBinary}\``, r.snapshot, r.cache])), "",
  d.exponent ? `Counter \`${d.counter}\` depth exponent ${d.exponent.before} → ${d.exponent.after}.` : "", "",
  // no code change: the rerun ran the same binary, so the table is attempt vs rerun, not with vs without
  none ? "**4. Attempt vs rerun, this range** (same binary; no code change)" : "**4. With vs without the optimization, this range**", "", withWithout(a, rerun, { none }), "",
  none ? "**5. Cost of the fix:** none: no code change." : `**5. Cost of the fix:** ${f.cost ?? "not recorded"}`, "",
  `**6. Records:** ${[...(f.records ?? []).map((r) => `[${r.path.replace(/^fixes\//, "fixes/")}](../${r.path})`), ...(f.ledger ?? []).map((l) => `[${l.file}](../${l.file}) (${l.entry})`)].join(" · ")} · finding \`~/lfs-history/metrics/finding-${pad(range)}.a${a.attempt}.json\``);
  return lines.join("\n");
}

/** The tripped attempt against its rerun on the headline numbers, each column under its binary; never one series. */
export function withWithout(a, r, { none = false } = {}) {
  if (!r) return none ? "No rerun: no code change, and an unchanged treatment is not resampled." : "Rerun pending: the next attempt of this range fills this table.";
  const [without, withIt] = none ? ["", ""] : [" (without)", " (with)"];
  const kk = (m, op, q) => m.key?.ops?.[op]?.[q];
  const row = (name, f, unit = "") => [name, `${f(a) ?? "—"}${unit}`, `${f(r) ?? "—"}${unit}`];
  return [table(["Measure", `Attempt ${a.attempt}${without} · \`${id12(a.binary?.daemon)}\``, `Attempt ${r.attempt}${withIt} · \`${id12(r.binary?.daemon)}\``], [
    row("Range time (tooling)", (m) => num((m.wall?.totalMs ?? 0) / 1000, 1), " s"),
    row("One-shot Commit p50 / p95", (m) => `${num(kk(m, "sandbox.commit", "p50"), 1)} / ${num(kk(m, "sandbox.commit", "p95"), 1)}`, " ms"),
    row("fs.write p50 / p95", (m) => `${num(kk(m, "fs.write", "p50"), 1)} / ${num(kk(m, "fs.write", "p95"), 1)}`, " ms"),
    row("merge p50 / p95", (m) => `${num(kk(m, "branch.merge", "p50"), 1)} / ${num(kk(m, "branch.merge", "p95"), 1)}`, " ms"),
    row("SQL per one-shot Commit (statements p50)", (m) => kk(m, "sandbox.commit", "statements")),
    row("Store on disk", (m) => bytes(storeOnDisk(m))),
    row("Space amplification", (m) => num(spaceAmp(m)), "×"),
    row("Verdict", (m) => m.gate?.verdict ?? "—"),
  ]), "", none ? "The same binary twice: the rerun repeats the measurement; nothing was changed between them." : "The two columns are separate series under their own binaries; no fit or baseline mixes them."].join("\n");
}

/**
 * REPORT_FORMAT.md §7's checks on a report in this format, against its
 * latest attempt `m` and the open findings; returns the problems.
 */
export function checkFormat(text, m, issues = []) {
  const p = [];
  const head = text.slice(0, text.indexOf("\n## ") < 0 ? undefined : text.indexOf("\n## "));
  if (!/^# Range \d{3} · \*\*(pass|watch|optimize|stop)\*\* · attempt \d+/.test(head)) p.push("the headline's first line is not `# Range NNN · **verdict** · attempt K`");
  for (const x of ["**Matches git", "daemon `", "image `", "plan v", "dsh `", "commits**", "Areas changed:", "**Checks:**", "**Moved most:**", "**Budget:**"]) if (!head.includes(x)) p.push(`the headline lacks ${x}`);
  for (const x of HEADLINE_CELLS) if (!head.includes(`| ${x} |`) && !head.includes(` ${x} |`)) p.push(`the headline table lacks ${x}`);
  if (!/\*\*[\d.]+ s\*\* tooling/.test(head)) p.push("the headline's time is not labeled tooling");
  let from = 0;
  for (const h of [...FORMAT_HEADINGS, ...APPENDIX]) {
    const at = text.indexOf(`\n${h}`, from);
    if (at < 0) p.push(`missing or out of order: ${h}`); else from = at + 1;
  }
  p.push(...checkOverview(text, m, { heading: "## 2. Activity", first: false, time: false }).map((x) => `Activity: ${x}`));
  const e = text.indexOf(`\n${APPENDIX[4]}`);
  if (e >= 0) p.push(...checkTimeLine(text.slice(e, text.indexOf("\n### ", e + 2))).map((x) => `E. Stage times: ${x}`));
  const five = text.slice(text.indexOf(`\n${FINDINGS}`), text.indexOf("\n## Appendix"));
  const blocks = five.split("\n### Finding ").slice(1);
  if (!blocks.length && !five.includes(NONE_LINE) && m.gate?.verdict !== "stop") p.push(`§5 has neither "${NONE_LINE}" nor a Finding block`);
  if (blocks.length && five.includes(NONE_LINE)) p.push("§5 says none and has a Finding block");
  for (const b of blocks) {
    if (b.includes("Diagnosis pending")) { if (!b.includes("**1. Trigger**")) p.push("a pending Finding lacks its trigger"); continue; }
    // a finding closed without a code change: its evidence, no design lines, the rerun under the same binary
    const none = b.split("\n")[0].includes("→ closed without a code change");
    const parts = none ? ["**1. Trigger**", "**2. Fix context**", "**3. Evidence**", "**4. Attempt vs rerun", "**5. Cost of the fix:**", "**6. Records:**"]
      : ["**1. Trigger**", "**2. Fix context**", "**3. Before / after**", "**4. With vs without", "**5. Cost of the fix:**", "**6. Records:**"];
    for (const part of parts) if (!b.includes(part)) p.push(`Finding ${b.slice(0, 7)} lacks ${part}`);
    if (!none && /\| Old design \| — \||\| New design \| — \|/.test(b)) p.push(`Finding ${b.slice(0, 7)} lacks its old or new design line`);
    if (b.includes("Cost of the fix:** not recorded")) p.push(`Finding ${b.slice(0, 7)} lacks the cost of the fix`);
    const ww = /\| Measure \| Attempt \d+ \(without\) · `([0-9a-f]+)` \| Attempt \d+ \(with\) · `([0-9a-f]+)` \|/.exec(b);
    if (ww && ww[1] === ww[2]) p.push(`Finding ${b.slice(0, 7)}: with and without name the same binary ${ww[1]}`);
  }
  for (const i of issues) if (!five.includes(`| ${i.id} |`)) p.push(`open finding ${i.id} is not listed in §5`);
  const amp = /\| \*\*Space amplification\*\*[^|]* \| [^|]* \| ([\d.]+)×[^|]* \|/.exec(text);
  // REPORT_FORMAT §7 storage sums, on the attempt's recorded figures, and the parts table
  if (m.storageReport) {
    p.push(...storageProblems(m.storageReport, storeOnDisk(m), m.version?.bytes).map((x) => `Storage: ${x}`));
    for (const x of ["**3a. Overview**", "**3b. Where the bytes are**", "**3c. By source**", "**3d. What's inside**", "**Total = Store on disk**", "Shared (index rows + waste + other)"]) if (!text.includes(x)) p.push(`Storage lacks ${x}`);
    if (/git/i.test(text.slice(text.indexOf("**3c. By source**"), text.indexOf("**3d."))) && !text.includes("Any comparison with git uses the Tracked row only")) p.push("Storage: a git comparison does not name the Tracked row");
  }
  if (amp && m.version?.bytes && storeOnDisk(m) != null && Math.abs(Number(amp[1]) - storeOnDisk(m) / m.version.bytes) > 0.006) p.push(`space amplification ${amp[1]}× is not Store on disk ÷ latest version (${(storeOnDisk(m) / m.version.bytes).toFixed(3)})`);
  for (const h of ["## 4. Speed", APPENDIX[1], APPENDIX[2]]) {
    const at = text.indexOf(`\n${h}`), body = at < 0 ? "" : text.slice(at, text.indexOf("\n#", at + 2));
    if (!/daemon `[0-9a-f]+`|Daemon `[0-9a-f]+`/.test(body)) p.push(`${h} does not name its binary`);
  }
  return p;
}

/** BUGS.md's open findings for the docs folder, or none when it has no BUGS.md. */
/**
 * When each finding of BUGS.md was opened: the commit time of the first commit
 * that added its "- **F-NNN ·" line (git log -S). An entry not committed yet
 * has none (it opened after every recorded attempt).
 */
export function issueOpenTimes(docs) {
  const file = join(docs, "BUGS.md");
  if (!existsSync(file)) return new Map();
  const out = new Map();
  for (const id of [...readFileSync(file, "utf8").matchAll(/^- \*\*(F-\d{3}) ·/gm)].map((m) => m[1])) {
    try {
      const t = execFileSync("git", ["-C", docs, "log", "--format=%cI", "-S", `**${id} ·`, "--", "BUGS.md"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean).at(-1);
      if (t) out.set(id, Date.parse(t));
    } catch { /* outside git: unknown */ }
  }
  return out;
}

/**
 * F-021 follow-up (F2): a report's open issues are judged as of its latest
 * attempt's start (`started` in its metrics): the findings open now that were
 * opened (committed) by then. One opened later, or not committed, is not required.
 */
export const issuesAsOf = (issues, opened, started) => {
  const t = Date.parse(started ?? "");
  return Number.isFinite(t) ? issues.filter((i) => opened.has(i.id) && opened.get(i.id) <= t) : issues;
};

export const loadIssues = (docs) => (existsSync(join(docs, "BUGS.md")) ? openIssues(readFileSync(join(docs, "BUGS.md"), "utf8")) : []);
