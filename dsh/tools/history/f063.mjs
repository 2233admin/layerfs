#!/usr/bin/env node
// F-063 active, from a run's own traces (fix 066, owner 2026-10-20: "the .git improvements should be ported into the
// 51-100 lane"). The lane git Commits (`<step>.git-commit`, gitplay.mjs) carry each Commit's delta outcome
// (`daemon[].delta.payload.chunk_depths`, depth 0 = FULL, depth > 0 = PREFIX). With the rename-over predecessor the
// git index's chunks after a lane's first step delta against the replaced index, so PREFIX > 0; without it every
// changed chunk is FULL. The build commit must contain the fix.
//   node dsh/tools/history/f063.mjs --run <id> --range N [--attempt K] [--build <sha>]
// exit 0 active, 4 not active (stop before playing on: liaison 2026-10-20), 2 usage or no lane git Commit traced.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { HISTORY, REPO } from "./lib.mjs";

export const F063_COMMIT = "2de43d0a02";
const GIT_COMMIT = /\.git-commit(#\d+)?$/;
const pad = (n) => String(n).padStart(3, "0");

/** The lane git Commits' chunk outcomes, from trace lines (objects): FULL/PREFIX chunks, Commits, depth histogram. */
export function laneGitChunks(lines) {
  const depths = [];
  let commits = 0, withPrefix = 0, withChunks = 0, prefixSelected = 0;
  for (const d of lines) {
    if (d.method !== "sandbox.commit" || !GIT_COMMIT.test(String(d.step ?? ""))) continue;
    commits++;
    const own = [];
    for (const x of d.daemon ?? []) {
      const p = x?.delta?.payload;
      if (!p) continue;
      (p.chunk_depths ?? []).forEach((v, i) => { own[i] = (own[i] ?? 0) + v; depths[i] = (depths[i] ?? 0) + v; });
      prefixSelected += p.prefix_selected ?? 0;
    }
    const prefix = own.slice(1).reduce((n, v) => n + (v ?? 0), 0);
    if ((own[0] ?? 0) + prefix) withChunks++;
    if (prefix) withPrefix++;
  }
  const full = depths[0] ?? 0, prefix = depths.slice(1).reduce((n, v) => n + (v ?? 0), 0);
  return { commits, withChunks, withPrefix, full, prefix, prefixSelected, depths: Array.from(depths, (v) => v ?? 0) };
}

/** The decision: active when a lane git Commit stored a PREFIX chunk; stop when chunks were stored and none was PREFIX. */
export function judge(c, build = null) {
  if (build && build.contains === false) return { active: false, exit: 4, why: `build ${build.commit.slice(0, 10)} does not contain F-063 (${F063_COMMIT})` };
  if (!c.commits) return { active: false, exit: 2, why: "no lane git Commit traced" };
  if (!c.full && !c.prefix) return { active: false, exit: 2, why: `${c.commits} lane git Commits stored no chunk` };
  if (!c.prefix) return { active: false, exit: 4, why: `chunk PREFIX 0 vs FULL ${c.full} over ${c.commits} lane git Commits: F-063 not active` };
  return { active: true, exit: 0, why: `chunk PREFIX ${c.prefix} vs FULL ${c.full} over ${c.commits} lane git Commits (${c.withPrefix} with a PREFIX chunk)` };
}

/** One line for a range report or the re-baseline report. */
export function line(c, v, build = null) {
  const depthText = c.depths.map((n, i) => (n ? `${i}:${n}` : null)).filter(Boolean).join(" ");
  return `**F-063 (rename-over chunk predecessor):** ${v.active ? "active" : "NOT active"}; ${v.why}; chunk depths ${depthText || "none"}${build ? `; build ${build.commit.slice(0, 10)} ${build.contains ? "contains" : "lacks"} ${F063_COMMIT}` : ""}.`;
}

/** Whether `commit` has the fix in its history (git merge-base --is-ancestor). */
export function buildContains(commit, fix = F063_COMMIT, repo = REPO) {
  try { execFileSync("git", ["-C", repo, "merge-base", "--is-ancestor", fix, commit], { stdio: "ignore" }); return true; } catch (e) { if (e.status === 1) return false; throw e; }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { values: v } = parseArgs({ options: { run: { type: "string" }, range: { type: "string" }, attempt: { type: "string", default: "1" }, build: { type: "string" } } });
  if (!v.run || !v.range) { console.error("usage: f063.mjs --run <id> --range N [--attempt K] [--build <sha>]"); process.exit(2); }
  const file = join(HISTORY, "runs", v.run, "trace", `range-${pad(v.range)}.a${v.attempt}.jsonl`);
  if (!existsSync(file)) { console.error(`${file}: no trace`); process.exit(2); }
  const lines = readFileSync(file, "utf8").split("\n").filter((l) => l.includes(".git-commit")).map((l) => JSON.parse(l));
  const c = laneGitChunks(lines);
  const build = v.build ? { commit: v.build, contains: buildContains(v.build) } : null;
  const verdict = judge(c, build);
  console.log(JSON.stringify({ run: v.run, range: Number(v.range), attempt: Number(v.attempt), ...c, build, ...verdict }));
  console.log(line(c, verdict, build));
  process.exit(verdict.exit);
}
