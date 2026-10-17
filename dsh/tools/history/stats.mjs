// The range report's statistics (#352 SPEC §3, REPORT_OVERVIEW.md): the
// per-method call table, the Overview (calls by category, Branches,
// conflicts, agents, tooling time) and STATS.md's running totals. Pure
// functions over a range's metrics; run.mjs records the inputs (calls,
// overview) and report.mjs renders them. Attempts recorded before these
// inputs existed (ranges 000–004) get an Overview derived from what they did
// record (`derivedOverview`), used only by STATS.md: their committed reports
// stay byte-identical (SPEC §3 F2).

/** Every SDK method's category (REPORT_OVERVIEW.md §1); a method not here fails the check. */
export const CATEGORIES = {
  fs: ["write", "edit", "apply", "mkdir", "rm", "cp", "mv", "read", "list", "stat", "grep", "glob", "diff_files", "blame"],
  sandbox: ["create", "service", "mount", "exec", "status", "commit", "unmount", "close"],
  branch: ["fork", "merge", "publish", "diff_commits", "diff_branches"],
  project: ["init", "list_commits", "list_branches", "branches"],
  operator: ["store.stats", "store.commits", "files.stats", "inspect.snapshot", "workspace.overlay"],
};
export const CATEGORY_ORDER = ["fs", "sandbox", "branch", "project", "operator"];
/** Calls that change state (Writes); reads only read (Reads); the rest are Workspace and Sandbox lifecycle. */
const WRITES = new Set(["fs.write", "fs.edit", "fs.apply", "fs.mkdir", "fs.rm", "fs.cp", "fs.mv", "sandbox.exec", "sandbox.commit", "branch.fork", "branch.merge", "branch.publish", "project.init"]);
const LIFECYCLE = new Set(["sandbox.create", "sandbox.service", "sandbox.mount", "sandbox.unmount", "sandbox.close"]);

/** A method's category, or null when it is not assigned (REPORT_OVERVIEW.md §1). */
export function categoryOf(method) {
  const [group, ...rest] = String(method).split(".");
  const name = rest.join(".");
  if (group === "operator") return CATEGORIES.operator.includes(name) ? "operator" : null;
  for (const c of CATEGORY_ORDER) if (CATEGORIES[c].includes(name) && (group === c || (c === "project" && group === "branch" && name === "list_commits"))) return c;
  return null;
}
export const isWrite = (method) => WRITES.has(method);
export const isRead = (method) => categoryOf(method) != null && !WRITES.has(method) && !LIFECYCLE.has(method);

/** A trace line's outcome: the value's kind, or the refusal's code. */
export const outcomeOf = (line) => (line.ok === false ? line.code ?? "error" : line.kind ?? "ok");

/**
 * The per-method call table (SPEC §3b): n, bytes in and out, files or
 * entries touched, outcomes by kind. `lines` are the range's trace end lines
 * (labels already split by lib.mjs readTrace), `log` the replay's call
 * records joined by `seq`.
 */
export function callTable(lines, log = []) {
  const bySeq = new Map(log.map((e) => [e.seq, e]));
  const out = {};
  for (const l of lines) {
    const e = l.seq != null && bySeq.get(l.seq)?.method === l.method ? bySeq.get(l.seq) : null;
    const row = (out[l.method] ??= { n: 0, bytesIn: 0, bytesOut: 0, files: 0, outcomes: {} });
    row.n++;
    row.bytesIn += e?.bytesIn ?? 0; row.bytesOut += e?.bytesOut ?? 0; row.files += e?.files ?? 0;
    const o = outcomeOf(l);
    row.outcomes[o] = (row.outcomes[o] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1)));
}

/** Calls by category: calls, writes, reads, outcome kinds, and per-method counts for sandbox and branch. */
export function categoryRows(calls) {
  const rows = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, { calls: 0, writes: 0, reads: 0, outcomes: {}, methods: {}, unassigned: [] }]));
  const unassigned = [];
  for (const [method, r] of Object.entries(calls ?? {})) {
    const c = categoryOf(method);
    if (!c) { unassigned.push(method); continue; }
    const row = rows[c];
    row.calls += r.n;
    if (isWrite(method)) row.writes += r.n; else if (isRead(method)) row.reads += r.n;
    row.methods[method.slice(method.indexOf(".") + 1)] = { n: r.n, outcomes: r.outcomes };
    for (const [k, n] of Object.entries(r.outcomes)) if (k !== "ok") row.outcomes[k] = (row.outcomes[k] || 0) + n;
  }
  return { rows, unassigned };
}

const int = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const sec = (ms) => (ms == null ? "—" : (ms / 1000).toFixed(1));
const kinds = (o) => Object.entries(o).filter(([k]) => k !== "ok").map(([k, n]) => `${k} ${int(n)}`).join(", ");

/** The Outcomes cell: fs and the rest by outcome kind; sandbox and branch per method with its kinds. */
export function outcomesCell(category, row) {
  if (category === "sandbox" || category === "branch") {
    const parts = Object.entries(row.methods).map(([m, x]) => `${m} ${int(x.n)}${kinds(x.outcomes) ? ` (${kinds(x.outcomes)})` : ""}`);
    return parts.join(" · ") || "0";
  }
  if (category === "project" || category === "operator") return Object.entries(row.methods).map(([m, x]) => `${m} ${int(x.n)}`).join(" · ") || "0";
  return Object.entries(row.outcomes).map(([k, n]) => `${k} ${int(n)}`).join(" · ") || "0";
}

/**
 * The time line's stages (REPORT_OVERVIEW.md §2), in ms, summing to the
 * total: play holds the runner's prepare (binary and disk checks, the
 * Sandbox pool); report holds the metrics and the bookkeeping between laps.
 */
export function stageSplit(wall) {
  if (!wall?.totalMs) return null;
  const g = (k) => wall[k] ?? 0;
  const st = { play: g("prepareMs") + g("playMs"), consolidate: g("consolidateMs"), verify: g("verifyMs"), probes: g("probesMs"), tests: g("testsMs"), "seal + snapshot": g("sealMs") + g("snapshotMs") };
  const named = Object.values(st).reduce((n, x) => n + x, 0);
  st.report = Math.max(0, wall.totalMs - named);
  return st;
}
/** Tenths of a second per stage that sum exactly to the total's tenths (largest remainder). */
export function tenths(st, totalMs) {
  const want = Math.round(totalMs / 100), entries = Object.entries(st).map(([k, v]) => [k, v / 100]);
  const out = Object.fromEntries(entries.map(([k, v]) => [k, Math.floor(v)]));
  let left = want - Object.values(out).reduce((n, x) => n + x, 0);
  for (const [k] of [...entries].sort((a, b) => (b[1] % 1) - (a[1] % 1))) { if (left <= 0) break; out[k]++; left--; }
  return out;
}
export const timeLine = (wall) => {
  const st = stageSplit(wall);
  if (!st) return "**Time —** (tooling): not recorded";
  const t = tenths(st, wall.totalMs);
  return `**Time ${sec(wall.totalMs)} s** (tooling): ${Object.keys(st).map((k) => `${k} ${(t[k] / 10).toFixed(1)}`).join(" · ")}`;
};

export const CONFLICT_KINDS = [["commit-conflict", "Commit Conflict"], ["stale-clean-merge", "Stale clean merge"], ["decoy", "Decoy edit"], ["merge-race", "Merge / publish race"]];

/**
 * A range's Overview inputs, recorded by run.mjs in its metrics (`overview`):
 * the agent rows (steps by category, Commits, conflict kinds), Branch rows
 * (main last), conflict rows and the totals. `log` is the call records of
 * the range; `laneOf` maps a step label to its lane (null: the lead's).
 */
export function buildOverview({ plan, log, played, leadSteps, laneOf, events = [], race = null, merged = new Map(), tries = new Map(), published = new Set(), lanesPlayed, runningBefore, phase }) {
  const commitsOf = (pred) => log.filter((e) => pred(e) && !String(e.label ?? "").startsWith("probe:") && (e.kind === "Committed" && /^(fs|sandbox)\./.test(e.method) || e.newCommit)).length;
  const agents = [];
  const conflictsOf = new Map();
  for (const c of plan.conflicts ?? []) for (const a of c.kind === "merge-race" ? ["lead"] : c.agents ?? []) conflictsOf.set(a, [...(conflictsOf.get(a) ?? []), c.kind]);
  for (const [agent, by] of [...played].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const lane = plan.lanes.find((l) => l.agents.includes(agent))?.name ?? null;
    agents.push({ agent, lane, steps: Object.values(by).reduce((n, x) => n + x, 0), ...by, commits: commitsOf((e) => e.agent === agent), conflicts: hitKinds(conflictsOf.get(agent), events, race) });
  }
  const lead = { fs: 0, sandbox: 0, branch: 0, project: 0 };
  for (const s of leadSteps) lead[s.category]++;
  agents.push({ agent: "lead", lane: "main", steps: leadSteps.length, ...lead, commits: commitsOf((e) => e.agent === "lead"), conflicts: hitKinds(conflictsOf.get("lead"), events, race) });
  const branches = lanesPlayed.map((l) => ({
    name: l.name, agents: l.agents, steps: l.steps, commits: commitsOf((e) => e.agent !== "lead" && laneOf(e.label) === l.name),
    merged: merged.get(l.name) ? ((tries.get(l.name) ?? 1) > 1 ? `✓ (${ordinal(tries.get(l.name))} try)` : "✓") : "—", published: published.has(l.name) ? "✓" : "—",
  }));
  branches.push({ name: "main", agents: ["lead"], steps: leadSteps.length, commits: commitsOf((e) => e.agent === "lead"), merged: "—", published: "✓" });
  const conflicts = CONFLICT_KINDS.map(([kind, title]) => {
    const planned = (plan.conflicts ?? []).filter((c) => c.kind === kind);
    const c = planned[0];
    const hit = hitCount(kind, planned.length, events, race);
    const where = !c ? "—" : kind === "merge-race" ? `lead merge of ${short(c.lanes[1])} vs ${short(c.lanes[0])} publish` : kind === "commit-conflict" ? `${short(c.lane)}, ${c.agents[1]} after ${c.agents[0]}` : `${short(c.lane)}, ${c.agents.join(" ")}`;
    const ev = events.find((e) => e.kind === kind);
    const resolved = !planned.length ? (phase === "p1" ? "— (not played in P1)" : "—") : !hit ? "not hit"
      : kind === "commit-conflict" ? `${sec(ev.resolvedAt - ev.conflictAt)} s` : kind === "stale-clean-merge" ? "merged cleanly"
      : kind === "decoy" ? "replaced before the checkpoint" : `${sec((race.doneAt ?? race.t0) - race.t0)} s, merged again`;
    return { kind, title, hit, planned: planned.length, where, resolved };
  });
  const steps = agents.reduce((n, a) => n + a.steps, 0), commits = agents.reduce((n, a) => n + a.commits, 0);
  return { agents, branches, conflicts, unplanned: 0, steps, commits, running: (runningBefore ?? 0) + commits,
    planned: { branches: plan.lanes.length + 1, agents: plan.agents.length } };
}
const ordinal = (n) => `${n}${n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
const short = (lane) => String(lane).split("-").slice(0, 2).join("-");
function hitCount(kind, planned, events, race) {
  if (!planned) return 0;
  if (kind === "merge-race") return race && race.doneAt != null ? 1 : 0;
  if (kind === "commit-conflict") return Math.min(planned, events.filter((e) => e.kind === kind && e.resolvedAt != null).length);
  return Math.min(planned, events.filter((e) => e.kind === kind).length);
}
const hitKinds = (list, events, race) => (list ?? []).filter((k) => hitCount(k, 1, events, race));

/**
 * The Overview of a range recorded before its metrics carried `overview` or
 * `calls` (ranges 000–004, P1): derived from what they recorded, for STATS.md
 * only. Calls come from the latency rows (probe calls were not in them), one
 * agent a01 played every fs batch, the lead the reconcile and the publish.
 */
export function derivedOverview(m) {
  const calls = {};
  for (const r of m.ops ?? []) { const x = (calls[r.op] ??= { n: 0, bytesIn: 0, bytesOut: 0, files: 0, outcomes: {} }); x.n += r.n; }
  const lead = m.work?.reconcile ?? 0, total = m.work?.lfsCommits ?? 0, steps = m.work?.bashCalls ?? 0;
  return {
    calls, derived: true,
    overview: {
      agents: [{ agent: "a01", lane: "lane", steps: steps - 2, fs: steps - 2, sandbox: 0, branch: 0, project: 0, commits: total - lead, conflicts: [] },
        { agent: "lead", lane: "main", steps: 2, fs: 1, sandbox: 0, branch: 1, project: 0, commits: lead, conflicts: [] }],
      branches: [{ name: "lane", agents: ["a01"], steps: steps - 2, commits: total - lead, merged: "—", published: "✓" }, { name: "main", agents: ["lead"], steps: 2, commits: lead, merged: "—", published: "✓" }],
      conflicts: CONFLICT_KINDS.map(([kind, title]) => ({ kind, title, hit: 0, planned: 0, where: "—", resolved: "— (not played in P1)" })),
      unplanned: 0, steps, commits: total, planned: null,
    },
  };
}

const table = (head, rows) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
const bracket = (played, planned) => (planned != null && planned !== played ? `${int(played)} [${int(planned)}]` : int(played));

/** The Overview section (REPORT_OVERVIEW.md §2) of a range's latest attempt. */
export function renderOverview({ range, verdict, m }) {
  const o = m.overview, cat = categoryRows(m.calls);
  const callTotal = Object.values(cat.rows).reduce((n, r) => n + r.calls, 0);
  const hit = o.conflicts.reduce((n, c) => n + c.hit, 0), planned = o.conflicts.reduce((n, c) => n + c.planned, 0);
  const lanes = o.branches.length, agents = o.agents.length - 1;
  const pad3 = String(range).padStart(3, "0");
  const out = [`## Overview · Range ${pad3} · **${verdict}** · attempt ${m.attempt} · daemon \`${String(m.binary?.daemon ?? "?").slice(0, 12)}\``, "",
    timeLine(m.wall),
    `**${int(callTotal)} calls** · **${int(o.commits)} Commits** (running ${int(o.running)}) · **${bracket(lanes, o.planned?.branches)} Branches** · **${bracket(agents, o.planned?.agents)} agents + lead** · conflicts **${hit} / ${planned}** hit`, "",
    "**Calls by category**", "",
    table(["Category", "Calls", "Writes", "Reads", "Outcomes"], [
      ...CATEGORY_ORDER.map((c) => [c, int(cat.rows[c].calls), int(cat.rows[c].writes), int(cat.rows[c].reads), outcomesCell(c, cat.rows[c])]),
      ["**Total**", `**${int(callTotal)}**`, `**${int(CATEGORY_ORDER.reduce((n, c) => n + cat.rows[c].writes, 0))}**`, `**${int(CATEGORY_ORDER.reduce((n, c) => n + cat.rows[c].reads, 0))}**`, cat.unassigned.length ? `unassigned: ${cat.unassigned.join(", ")}` : ""],
    ]), "",
    "**Branches**", "",
    table(["Branch", "Agents", "Steps", "Commits", "Merged into main", "Published"], o.branches.map((b) => [b.name, b.agents.join(" "), int(b.steps), int(b.commits), b.merged, b.published])), "",
    "**Conflicts**", "",
    table(["Kind", "Hit / planned", "Where", "Resolved in"], [...o.conflicts.map((c) => [c.title, `${c.hit} / ${c.planned}`, c.where, c.resolved]), ["**Unplanned**", `**${o.unplanned}**`, "—", "—"]]), "",
    "**Agents**", "",
    table(["Agent", "Branch", "Steps", "fs", "sandbox", "branch", "project", "Commits", "Conflicts"], [
      ...o.agents.map((a) => [a.agent, short(a.lane), int(a.steps), int(a.fs), int(a.sandbox), int(a.branch), int(a.project), int(a.commits), a.conflicts.length ? a.conflicts.join(", ") : "—"]),
      ["**Total**", "", `**${int(o.steps)}**`, ...["fs", "sandbox", "branch", "project"].map((k) => `**${int(o.agents.reduce((n, a) => n + (a[k] ?? 0), 0))}**`), `**${int(o.commits)}**`, `**${hit}**`],
    ]), ""];
  return out.join("\n");
}

/**
 * The F1 sums of an Overview (REPORT_OVERVIEW.md §3) against the attempt's
 * metrics; returns the problems.
 */
export function checkOverview(text, m) {
  const problems = [];
  const at = text.indexOf("\n## Overview");
  if (at < 0) return ["the Overview is missing"];
  if (text.slice(0, at).includes("\n## ") || text.slice(0, at).includes("\n| ")) problems.push("the Overview is not the first section");
  const end = text.indexOf("\n## ", at + 1);
  const body = text.slice(at, end < 0 ? undefined : end);
  let from = 0;
  for (const h of ["**Time", "calls**", "**Calls by category**", "**Branches**", "**Conflicts**", "**Agents**"]) {
    const i = body.indexOf(h, from);
    if (i < 0) problems.push(`the Overview lacks ${h} (or it is out of order)`); else from = i;
  }
  const rows = (title) => { const i = body.indexOf(title); return i < 0 ? [] : tableRows(body.slice(i)); };
  const num = (c) => Number(String(c).replace(/[*,]/g, "").split(" ")[0]);
  const cats = rows("**Calls by category**");
  const total = cats.find((r) => r[0] === "**Total**");
  const sum = cats.filter((r) => r[0] !== "**Total**").reduce((n, r) => n + num(r[1]), 0);
  const sdk = m.work?.sdkCalls;
  if (!total || num(total[1]) !== sum) problems.push(`Calls total ${total?.[1]} is not the sum of the categories (${sum})`);
  else if (sdk != null && sum !== sdk) problems.push(`Calls total ${sum} is not the range's SDK call count ${sdk}`);
  if (total && /unassigned/.test(total[4] ?? "")) problems.push(`methods without a category: ${total[4]}`);
  const agents = rows("**Agents**"), at2 = agents.find((r) => r[0] === "**Total**"), each = agents.filter((r) => r[0] !== "**Total**");
  const steps = each.reduce((n, r) => n + num(r[2]), 0), commits = each.reduce((n, r) => n + num(r[7]), 0);
  if (!at2 || num(at2[2]) !== steps || num(at2[7]) !== commits) problems.push("the Agents Total row is not the sum of its rows");
  if (m.work?.bashCalls != null && steps !== m.work.bashCalls) problems.push(`Agents' Steps ${steps} are not the played bash calls ${m.work.bashCalls}`);
  if (m.work?.lfsCommits != null && commits !== m.work.lfsCommits) problems.push(`Agents' Commits ${commits} are not the range's LayerFS Commits ${m.work.lfsCommits}`);
  for (const r of each) if ([3, 4, 5, 6].reduce((n, i) => n + num(r[i]), 0) !== num(r[2])) problems.push(`agent ${r[0]}: its category counts do not sum to its Steps`);
  const branches = rows("**Branches**");
  if (branches.reduce((n, r) => n + num(r[3]), 0) !== commits) problems.push("the Branches' Commits do not sum to the range's Commits");
  const conflicts = rows("**Conflicts**");
  for (const [, title] of CONFLICT_KINDS) if (!conflicts.some((r) => r[0] === title)) problems.push(`Conflicts lacks the ${title} row`);
  if (!conflicts.some((r) => r[0] === "**Unplanned**")) problems.push("Conflicts lacks the Unplanned row");
  const time = /\*\*Time ([\d.]+) s\*\* \(tooling\): (.*)/.exec(body);
  if (!time) problems.push("the time line is missing or not labeled tooling");
  else {
    const parts = [...time[2].matchAll(/ ([\d.]+)(?: ·|$)/g)].reduce((n, x) => n + Number(x[1]), 0);
    if (Math.abs(parts - Number(time[1])) > 0.1 + 1e-9) problems.push(`the time line's stages sum to ${parts.toFixed(1)} s, not ${time[1]} s`);
  }
  return problems;
}

/** The body rows (cells) of the first table in `text`. */
export function tableRows(text) {
  const lines = text.split("\n"), start = lines.findIndex((l) => l.startsWith("|"));
  if (start < 0) return [];
  const out = [];
  for (const l of lines.slice(start + 2)) { if (!l.startsWith("|")) break; out.push(l.trim().replace(/^\|/, "").replace(/\|$/, "").split(" | ").map((c) => c.trim())); }
  return out;
}

/**
 * STATS.md (REPORT_OVERVIEW.md §4): one row per range (its latest attempt)
 * and a cumulative row, in the Overview's shapes. `ranges` are
 * { range, m, overview, calls, derived } oldest first.
 */
export function renderStats(ranges) {
  const tot = { ms: 0, calls: Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])), callsAll: 0, commits: 0, branches: 0, agents: 0, hit: 0, planned: 0, steps: 0, newStored: 0, bytesIn: 0 };
  const rows = [], kindRows = [], methods = {};
  for (const r of ranges) {
    const { m, overview: o, calls } = r, cat = categoryRows(calls).rows;
    const n = CATEGORY_ORDER.reduce((x, c) => x + cat[c].calls, 0);
    const hit = o.conflicts.reduce((x, c) => x + c.hit, 0), planned = o.conflicts.reduce((x, c) => x + c.planned, 0);
    const bytesIn = Object.values(calls).reduce((x, c) => x + (c.bytesIn ?? 0), 0);
    tot.ms += m.wall?.totalMs ?? 0; tot.callsAll += n; tot.commits += o.commits; tot.branches += o.branches.length; tot.agents += o.agents.length - 1;
    tot.hit += hit; tot.planned += planned; tot.steps += o.steps; tot.newStored += m.storage?.newStored ?? 0; tot.bytesIn += bytesIn;
    for (const c of CATEGORY_ORDER) tot.calls[c] += cat[c].calls;
    for (const [meth, c] of Object.entries(calls)) { const x = (methods[meth] ??= { n: 0, bytesIn: 0, bytesOut: 0 }); x.n += c.n; x.bytesIn += c.bytesIn ?? 0; x.bytesOut += c.bytesOut ?? 0; }
    const daemon = String(m.binary?.daemon ?? "?").slice(0, 8);
    const label = `${String(r.range).padStart(3, "0")}${r.derived ? "†" : ""}`;
    rows.push([label, `\`${daemon}\`${m.run && m.run !== "p1-pilot-b" ? ` (line ${m.run})` : ""}`, `a${m.attempt}`, sec(m.wall?.totalMs), sec(tot.ms), ...CATEGORY_ORDER.map((c) => int(cat[c].calls)), int(n), int(tot.callsAll),
      int(o.commits), int(tot.commits), int(o.branches.length), int(o.agents.length - 1), `${hit} / ${planned}`, int(o.steps), r.derived ? "—" : int(bytesIn), int(m.storage?.newStored), int(tot.newStored)]);
    kindRows.push([label, ...o.conflicts.map((c) => `${c.hit} / ${c.planned}`), String(o.unplanned)]);
  }
  return ["# Statistics", "",
    "> Generated by `dsh/tools/history/report.mjs` from the measured metrics (`~/lfs-history/metrics/`), the latest attempt of each range; the lead commits it with each range's report. Counts are played, never planned. Time is tooling wall time, never operation latency. † derived from metrics recorded before the Overview existed (calls from the latency rows, without the probe calls; Commits split between a01 and the lead's reconcile). Ranges 000–001 were measured on daemon `0ef24121` (line p1-pilot). Format: [REPORT_OVERVIEW.md](REPORT_OVERVIEW.md) §4.", "",
    "## Per range", "",
    table(["Range", "Daemon", "Attempt", "Time s", "Running s", ...CATEGORY_ORDER, "Calls", "Running calls", "Commits", "Running Commits", "Branches", "Agents", "Conflicts hit / planned", "Steps", "Bytes written", "New stored", "Running stored"], rows), "",
    "## Cumulative", "",
    table(["Ranges", "Time s", ...CATEGORY_ORDER, "Calls", "Commits", "Branches", "Agents (sum per range)", "Conflicts hit / planned", "Steps", "Bytes written (since the Overview)", "New stored"],
      [[String(ranges.length), sec(tot.ms), ...CATEGORY_ORDER.map((c) => int(tot.calls[c])), int(tot.callsAll), int(tot.commits), int(tot.branches), int(tot.agents), `${tot.hit} / ${tot.planned}`, int(tot.steps), int(tot.bytesIn), int(tot.newStored)]]), "",
    "## Conflicts per range", "",
    table(["Range", ...CONFLICT_KINDS.map(([, t]) => t), "Unplanned"], kindRows), "",
    "## SDK calls per method (running total)", "",
    table(["Method", "Category", "Calls", "Bytes in", "Bytes out"], Object.entries(methods).sort(([a], [b]) => (a < b ? -1 : 1)).map(([meth, x]) => [meth, categoryOf(meth) ?? "unassigned", int(x.n), int(x.bytesIn), int(x.bytesOut)])), ""].join("\n");
}
