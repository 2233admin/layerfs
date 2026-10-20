// The P3 parts of a range report (#352 REPORT_FORMAT.md §8, from range 15):
// the git rule (GIT_RULE.md) and the Node rule (NODE_RULE.md) add a headline
// line, Correctness rows, the "Node and git proofs" subsection, Activity
// tables, Storage lines, Speed rows, resilience, appendix H–J, five gate
// checks and their `report.mjs check` rules. Everything reads one recorded
// object, the attempt's `p3` (§8.1 lists its fields); a field the harness did
// not record renders `not recorded` and its check is at least watch (SPEC §3
// F8), and a proof that was not run is `NOT_RUN`, never pass.
export const PROOFS = ["P1", "P2", "P3", "P4", "P5", "P6"];
export const P3_APPENDIX = ["### H. Git internals", "### I. Proof details", "### J. Conflicts by path class"];
export const PROOFS_HEADING = "### Node and git proofs";
/** LayerFS ÷ native rows of §4 Speed, in order: key, label, #362 cost case of the same kind. */
export const P3_SPEED = [
  ["git.status.cold", "git status (cold)", "git / status-cold"], ["git.status.steady", "git status (steady)", "git / status-steady"],
  ["git.add", "git add", "git / add"], ["git.commit", "git commit (lane)", "git / commit"], ["git.main", "lead writes main", null], ["git.repack", "repack", null],
  ["pnpm.install", "pnpm install (incremental)", "pnpm-reinstall / cold"], ["pnpm.refresh", "pnpm refresh", "pnpm-reinstall / steady"],
  ["tsc", "tsc -b", "tsc-b / cold"], ["vitest", "vitest", "vitest / cold"],
];
export const CONFLICT_CLASSES = [["tracked", "Tracked"], ["installOutputs", "Install outputs"], ["buildOutputs", "Build outputs"], ["git", "`.git`"]];
/** NODE_RULE §8: the content ratio's bands. */
export const CONTENT_BANDS = { watch: 2, act: 5 };

const int = (n) => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));
const num = (v, d = 2) => (v == null || !Number.isFinite(v) ? "—" : v.toFixed(d));
const bytes = (n) => (n == null ? "—" : Math.abs(n) >= 2 ** 30 ? `${(n / 2 ** 30).toFixed(2)} GiB` : Math.abs(n) >= 2 ** 20 ? `${(n / 2 ** 20).toFixed(1)} MiB` : `${(n / 1024).toFixed(1)} KiB`);
const ms = (v) => (v == null ? "—" : `${v >= 100 ? Math.round(v) : v.toFixed(1)} ms`);
const table = (head, rows) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map((c) => (c == null || c === "" ? "—" : String(c))).join(" | ")} |`)].join("\n");
const NOT_RECORDED = "not recorded";

export const isP3 = (m) => m?.phase === "p3";
const ratio = (a, b) => (a == null || !b ? null : a / b);

/** The git rule's outcome: ok, the failed parts, or null when the harness recorded none. */
export function gitOutcome(g) {
  if (!g) return null;
  const bad = [];
  if (g.head !== g.checkpoint) bad.push(`HEAD ${String(g.head).slice(0, 9)} is not the checkpoint ${String(g.checkpoint).slice(0, 9)}`);
  if (g.commitsWritten !== g.dshCommits) bad.push(`${g.commitsWritten} git commits for ${g.dshCommits} dsh commits`);
  if (!g.statusClean) bad.push("git status not clean at the checkpoint");
  if (g.freshSumScan) bad.push(`fresh mount read back ${g.freshSumScan} tracked files`);
  if (g.guardViolations?.length) bad.push(`${g.guardViolations.length} lane-guard violations`);
  return { ok: !bad.length, bad };
}

/** Every test point's proofs: pass, stop and NOT_RUN counts over all point × proof cells. */
export function proofTally(node) {
  const t = { points: node?.points?.length ?? 0, pass: 0, stop: 0, notRun: 0, na: 0, stops: [] };
  for (const p of node?.points ?? []) for (const id of PROOFS) {
    const r = p.proofs?.[id]?.result ?? "NOT_RUN";
    // n/a: the proof does not apply at this point (a refresh's P3 at an install, P6 off the repair); never counted
    if (r === "n/a") t.na++; else if (r === "pass") t.pass++; else if (r === "stop") { t.stop++; t.stops.push(`${p.lane} ${p.point} ${id}`); } else t.notRun++;
  }
  return t;
}

export const contentRatio = (p3) => ratio(p3?.content?.storedContent, p3?.content?.distinctNewContent);
export const churnRatio = (p3) => ratio(p3?.node?.churn?.storedBytes, p3?.node?.churn?.rewrittenBytes);

/** The five P3 gate rows, added to evaluate()'s checks for a P3 attempt. */
export function p3Checks(m, t = CONTENT_BANDS) {
  const p3 = m.p3 ?? {}, rows = [];
  const add = (name, value, threshold, result) => rows.push({ name, value, threshold, result });
  const git = gitOutcome(p3.git);
  if (!git) add("Git", "not judged: no git outcome recorded", "HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard", "watch");
  else add("Git", git.ok ? `HEAD = checkpoint; ${p3.git.commitsWritten} commits; clean; 0 read back; 0 guard violations` : git.bad.join("; "), "HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard", git.ok ? "pass" : "stop");
  const pt = proofTally(p3.node);
  if (!pt.points) add("Node proofs", "not judged: no test point recorded", "P1–P6 pass at every point", "watch");
  else add("Node proofs", `${pt.pass} pass · ${pt.stop} stop · ${pt.notRun} NOT_RUN over ${pt.points} points${pt.stops.length ? `: ${pt.stops.join(", ")}` : ""}`, "P1–P6 pass at every point", pt.stop ? "stop" : pt.notRun ? "watch" : "pass");
  const cc = p3.conflicts;
  if (!cc) add("`.git` conflicts", "not judged: conflicts by class not recorded", "0", "watch");
  else add("`.git` conflicts", `${cc.git ?? 0} (tracked ${cc.tracked ?? 0} · install ${cc.installOutputs ?? 0} · build ${cc.buildOutputs ?? 0}; tracked judged by Correctness)`, "0", cc.git ? "stop" : "pass");
  const r = p3.resilience;
  if (!r) add("Resilience", "not judged: not recorded", "0 Busy, EAGAIN, refused unmount", "watch");
  else {
    const failures = (r.busy ?? 0) + (r.eagain ?? 0) + (r.refusedUnmount ?? 0);
    add("Resilience", `Busy ${r.busy ?? 0} · EAGAIN ${r.eagain ?? 0} · refused unmount ${r.refusedUnmount ?? 0}`, "0 Busy, EAGAIN, refused unmount", failures ? "stop" : "pass");
  }
  const cr = contentRatio(p3);
  if (cr == null) add("Content ratio", "not judged: content bytes not recorded", `≤ ${t.watch}× (act > ${t.act}×)`, "watch");
  else add("Content ratio", `${num(cr)}×`, `≤ ${t.watch}× (act > ${t.act}×)`, cr > t.act ? "optimize" : cr > t.watch ? "watch" : "pass");
  const inp = p3.node?.inputs;
  add("Install inputs (reported, not gated)", inp ? `${int(inp.consistent)} of ${int(inp.total)} lane steps consistent` : NOT_RECORDED, "none until NODE_RULE §3 is decided", "pass");
  return rows;
}

/** Headline lines under the binary line. */
export function p3Headline(m) {
  const p3 = m.p3 ?? {}, git = gitOutcome(p3.git), pt = proofTally(p3.node), w = m.wall ?? {}, s = (x) => (x == null ? "—" : `${num(x / 1000, 1)} s`);
  return [
    `**Phase P3** · **Git ${git ? (git.ok ? "✓" : "✗") : "—"}** · **Node ${pt.points ? (pt.stop ? "✗" : pt.notRun ? "—" : "✓") : "—"}** (P1–P6: ${pt.pass} pass, ${pt.stop} stop, ${pt.notRun} NOT_RUN over ${pt.points} points) · **Content ${num(contentRatio(p3))}×** · **Churn ${num(churnRatio(p3))}**`,
    `**Time split:** play ${s(w.playMs)} · git ${s(p3.stages?.gitMs)} · Node ${s(p3.stages?.nodeMs)} · verify ${s(w.verifyMs)}`,
  ];
}

/** Correctness rows added after the base rows. */
export function p3CorrectnessRows(m) {
  const p3 = m.p3 ?? {}, g = p3.git, git = gitOutcome(g), cc = p3.conflicts, inp = p3.node?.inputs;
  return [
    ["Git", git ? (git.ok ? `**HEAD = checkpoint \`${String(g.checkpoint).slice(0, 9)}\`** · ${int(g.commitsWritten)} commits written for ${int(g.dshCommits)} dsh commits · status clean · fresh mount read back 0 · lane guard 0${g.cleaned ? ` · git clean ${int(g.cleaned.files)} untracked, unignored (${int(g.cleaned.bytes)} B)${g.cleaned.dirs ? `, ${int(g.cleaned.dirs)} folders (${g.cleaned.dirPaths.map((d) => `\`${d}\``).join(", ")})` : ""}` : ""}` : `**${git.bad.join("; ")}**`) : NOT_RECORDED],
    ["Install inputs (NODE_RULE §3; reported, not gated)", inp ? `${int(inp.consistent)} of ${int(inp.total)} lane steps consistent` : NOT_RECORDED],
    ["Conflicts by path class", cc ? CONFLICT_CLASSES.map(([k, name]) => `${name} ${int(cc[k] ?? 0)}`).join(" · ") : NOT_RECORDED],
  ];
}

/** The "Node and git proofs" subsection of §1: one row per test point. */
export function p3Proofs(m) {
  const pts = m.p3?.node?.points ?? [];
  const cell = (p, id) => { const x = p.proofs?.[id]; const r = x?.result ?? "NOT_RUN"; return id === "P1" && x?.normalized != null ? `${r} (${int(x.normalized)} normalized)` : id === "P6" && x?.rewritten != null ? `${r} (${int(x.rewritten)} rewritten)` : r; };
  const skips = pts.flatMap((p) => (p.proofs?.P5?.skipped ?? []).map((s) => `\`${s.file}\` (${s.reason})`));
  return [PROOFS_HEADING, "", "Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.", "",
    pts.length ? table(["Lane", "Point", "Tree", "Install inputs", ...PROOFS], pts.map((p) => [p.lane, p.point, `\`${String(p.tree).slice(0, 12)}\``, `\`${String(p.inputs).slice(0, 12)}\``, ...PROOFS.map((id) => cell(p, id))]))
      : "No test point recorded: every proof NOT_RUN.", "",
    `P5 skip list (failing natively, set at calibration): ${skips.length ? skips.join(" · ") : "none"}.`].join("\n");
}

/** Activity: execs split, then git and Node per lane. */
export function p3Activity(m) {
  const p3 = m.p3 ?? {}, ex = m.execs ?? {}, g = p3.git, n = p3.node;
  return [`**Execs by tool:** git ${int(ex.git)} · pnpm ${int(ex.pnpm)} · tsc ${int(ex.tsc)} · vitest ${int(ex.vitest)} · other ${int(ex.other)}`, "",
    g?.lanes?.length ? table(["Lane", "git status", "git diff", "git add", "git rm --cached", "Lane commits", "Loose objects"], [
      ...g.lanes.map((l) => [l.lane, int(l.status), int(l.diff), int(l.add), int(l.rm), int(l.commits), int(l.loose)]),
      ["**lead**", "—", "—", "—", "—", `${int(g.lead?.commitTree)} commit-tree`, `index rebuild ${g.lead?.indexRebuild ? "✓" : "—"} · repack ${g.lead?.repack ? "✓" : "—"}`]]) : "Git per lane: not recorded.", "",
    n?.lanes?.length ? table(["Lane", "Installs", "Refreshes", "tsc -b", "vitest points", "Test files", "Equal to native"], [
      ...n.lanes.map((l) => [l.lane, int(l.installs), int(l.refreshes), int(l.tsc), int(l.vitestPoints), int(l.vitestFiles), `${int(l.equal)} / ${int(l.run)}`]),
      ["**lead repair**", int(n.repair?.installs), "—", int(n.repair?.tsc), "—", "—", `${int(n.repair?.rewritten)} files rewritten`]]) : "Node per lane: not recorded."].join("\n");
}

/** Storage lines after 3a: per git commit, churn, native disk, metadata against its budget. */
export function p3Storage(m) {
  const p3 = m.p3 ?? {}, pc = p3.git?.perCommit, nd = p3.node?.nativeDisk, md = p3.node?.metadata, ch = p3.node?.churn;
  const per = (x) => (pc?.commits ? bytes(x / pc.commits) : "—");
  const tr = m.storageReport?.sources?.tracked;
  return ["**3e. Git and Node (P3)**", "", table(["Measure", "Value"], [
    ["Tracked only (amplification of the tracked source; comparable with ranges 0–14)", tr?.latest ? `${num(tr.amplification)}× (${bytes(tr.stored)} for ${bytes(tr.latest)})` : NOT_RECORDED],
    ["Store growth per git commit (index / loose objects / pack)", pc ? `${per(pc.index)} / ${per(pc.loose)} / ${per(pc.pack)} over ${int(pc.commits)} git commits` : NOT_RECORDED],
    ["**Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×)", `${num(contentRatio(p3))}×`],
    ["**Churn ratio** (stored ÷ bytes Node churn rewrote)", ch ? `${num(churnRatio(p3))} (${bytes(ch.storedBytes)} stored for ${bytes(ch.rewrittenBytes)} rewritten)` : NOT_RECORDED],
    ["Native-disk equivalence (stored ÷ lanes × one native checkout)", nd ? `${num(ratio(nd.storedBytes, nd.lanes * nd.checkoutBytes))} (${int(nd.lanes)} lanes × ${bytes(nd.checkoutBytes)})` : NOT_RECORDED],
    ["Metadata per file / per Commit (budget from the dev range)", md ? `${bytes(md.perFile)} / ${bytes(md.perCommit)} (budget ${md.budgetPerFile == null ? "not set" : `${bytes(md.budgetPerFile)} / ${bytes(md.budgetPerCommit)}`})` : NOT_RECORDED],
  ])].join("\n");
}

/** Speed: LayerFS ÷ native for git and Node operations, each beside its #362 cost case. */
export function p3Speed(m) {
  const sp = m.p3?.speed ?? {};
  const x = (a, b) => (a == null || !b ? "—" : `${num(a / b)}×`);
  return table(["Operation", "LayerFS p50 / p95", "Native p50 / p95", "÷ native (p50)", "#362 case ÷ native"], P3_SPEED.map(([k, label, c]) => {
    const r = sp[k];
    return [label, r ? `${ms(r.lfs?.p50)} / ${ms(r.lfs?.p95)}` : "—", r ? `${ms(r.native?.p50)} / ${ms(r.native?.p95)}` : "—", r ? x(r.lfs?.p50, r.native?.p50) : "—", c ? `${c}: ${r?.cost362 == null ? "—" : `${num(r.cost362)}×`}` : "—"];
  }));
}

/** Health line for §4: NODE_RULE §7's resilience. */
export function p3Health(m) {
  const r = m.p3?.resilience;
  if (!r) return `**Resilience:** ${NOT_RECORDED}.`;
  const pq = (q) => (q ? `${ms(q.p50)} / ${ms(q.p95)}` : "—");
  return `**Resilience:** Busy ${int(r.busy)} · EAGAIN ${int(r.eagain)} · refused unmount ${int(r.refusedUnmount)} · writer wait ${pq(r.writerWaitMs)} · lane hold ${pq(r.laneHoldMs)} per Commit (p50 / p95) · daemon RSS max ${int(r.rss?.max)} MB, median ${int(r.rss?.median)} MB over ${int(r.rss?.n)} daemons · overlay max ${bytes(r.overlayMaxBytes)} · unmount ${pq(r.unmountMs)}`;
}

/** Appendix H–J. */
export function p3Appendix(m) {
  const p3 = m.p3 ?? {}, gi = p3.git?.internals, pts = p3.node?.points ?? [], paths = p3.conflicts?.paths ?? [];
  return [P3_APPENDIX[0], "", gi ? [`Seed pack: ${int(gi.seedObjects)} objects, ${bytes(gi.seedPackBytes)} (counted apart from lane objects).`, "",
    table(["Lane", "Objects", "Index bytes"], (gi.lanes ?? []).map((l) => [l.lane, int(l.objects), bytes(l.indexBytes)])), "",
    table(["git command", "ms", "lstat"], (gi.trace2 ?? []).map((t) => [`\`${t.cmd}\``, num(t.ms, 1), int(t.lstat)]))].join("\n") : NOT_RECORDED, "",
  P3_APPENDIX[1], "", pts.length ? table(["Lane", "Point", "Proof", "Result", "Detail", "Native cached"], pts.flatMap((p) => PROOFS.map((id) => [p.lane, p.point, id, p.proofs?.[id]?.result ?? "NOT_RUN", p.proofs?.[id]?.detail ?? "—", p.cached ? "✓" : "—"]))) : "No test point recorded.", "",
  P3_APPENDIX[2], "", paths.length ? table(["Path", "Class", "Lane"], paths.map((x) => [`\`${x.path}\``, x.class, x.lane])) : "No conflicts by path recorded."].join("\n");
}

/** REPORT_FORMAT §8.4: `report.mjs check` for a P3 report. */
export function checkP3(text, m) {
  if (!isP3(m)) return [];
  const p = [];
  const head = text.slice(0, text.indexOf("\n## ") < 0 ? undefined : text.indexOf("\n## "));
  for (const x of ["**Phase P3**", "**Git ", "**Node ", "**Content ", "**Churn ", "**Time split:**"]) if (!head.includes(x)) p.push(`P3 headline lacks ${x}`);
  const one = text.slice(text.indexOf("\n## 1. Correctness"), text.indexOf("\n## 2. Activity"));
  if (!one.includes(PROOFS_HEADING)) p.push(`§1 lacks ${PROOFS_HEADING}`);
  for (const pt of m.p3?.node?.points ?? []) if (!one.includes(`| ${pt.lane} | ${pt.point} |`)) p.push(`§1 proofs lack the point ${pt.lane} ${pt.point}`);
  if (proofTally(m.p3?.node).notRun && !one.includes("NOT_RUN")) p.push("§1 shows no NOT_RUN for proofs that were not run");
  for (const x of ["Git", "Install inputs", "Conflicts by path class"]) if (!one.includes(`| ${x}`)) p.push(`§1 lacks the ${x} row`);
  if (text.includes("target ~9 : 1")) p.push("§2 still holds the P2 fs : Sandbox target");
  for (const x of ["**Execs by tool:**", "**3e. Git and Node (P3)**", "**Resilience:**", "Tracked only"]) if (!text.includes(x)) p.push(`P3 report lacks ${x}`);
  if (m.storageReport?.sources?.git && !text.includes("| `.git` |")) p.push("3c lacks the `.git` row");
  let from = text.indexOf("\n### G. Evidence");
  for (const h of P3_APPENDIX) { const at = text.indexOf(`\n${h}`, from); if (at < 0) p.push(`missing or out of order: ${h}`); else from = at + 1; }
  return p;
}
