#!/usr/bin/env node
// A range's pre-scan (#352 fix 064, ranges 51–100 prep): what in the dsh
// history alone, before the range plays, is known to stop the replay's oracle
// or lanes. From the previous checkpoint to the range's checkpoint:
//   1. packages (workspace folders, package.json folders) added and removed
//      within the range: they leave untracked folders (r044, fix 060, LESSONS R9);
//   2. new or changed .gitignore entries: ignored test outputs (r038, fix 058, R7);
//   3. tests or scripts whose new lines write files, and changed package.json
//      scripts: candidates for outputs outside sources (R7);
//   4. new top-level packages and folders: hybrid lane trees (R5).
// A flag is a reading aid for the lead, not a verdict: (3) is a text match.
//   node dsh/tools/history/prescan.mjs --repo ~/lfs-history/dsh.git --plan <plan dir> --from 51 --to 100 --out <dir>
// writes <out>/prescan-NNN.json and the range's plan notes <out>/prescan-NNN.md.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { git, lsTree } from "./git.mjs";

const pad = (n) => String(n).padStart(3, "0");
const parentOf = (p) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");
const PKG = /(^|\/)package\.json$/;
const IGNORE = /(^|\/)\.gitignore$/;
export const TEST = /(\.(spec|test|snapshot|e2e)\.[cm]?[jt]sx?$)|(^|\/)(tests?|__tests__)\/.*\.[cm]?[jt]sx?$/;
export const SCRIPT = /(^|\/)scripts\/.*\.([cm]?[jt]s|sh|bash)$|\.(sh|bash)$/;
const SHELL = /\.(sh|bash)$/;
/** Code lines that write, create or move files; a write into the OS temp folder is not outside the tree. */
export const WRITE = /(?:(?<![\w.])(?<!async\s+)|\bfs(?:Promises)?\.|\bpromises\.)(writeFile(Sync)?|appendFile(Sync)?|createWriteStream|mkdir(Sync)?|copyFile(Sync)?|cp(Sync)?|rename(Sync)?|symlink(Sync)?)\s*\(|\bnew\s+Database\s*\(/;
/** Scripts the replay's install, build and tests run on their own. */
const LIFECYCLE = /^(pre|post)?(install|prepare|build|test|bundle)$/;
/** Shell lines that write: a redirection to a file (not to an fd or /dev/null), tee, mkdir, cp, mv, touch. */
export const SHELL_WRITE = /(^|[^<>=&0-9])>{1,2}\s*(?!&|\/dev\/null)[\w.$/"'{~-]|\b(tee|mkdir|cp|mv|touch|install)\s+[^#]/;
const TMP = /tmpdir\(|mkdtemp|\/tmp\b|os\.tmpdir|TMPDIR/;

/** Workspace globs (pnpm-workspace.yaml `packages:`) as matchers of a folder path. */
export function workspaceGlobs(yaml) {
  const out = [];
  let inside = false;
  for (const line of String(yaml ?? "").split("\n")) {
    if (/^packages:\s*$/.test(line)) { inside = true; continue; }
    if (inside && /^\S/.test(line)) break;
    const m = inside && /^\s*-\s*['"]?([^'"#\s]+)['"]?/.exec(line);
    if (m) out.push(m[1]);
  }
  return out;
}
const globRe = (g) => new RegExp(`^${g.split("/").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]+")).join("/")}$`);
/** The workspace folder a path falls under (its glob's depth), or null. */
export function workspaceOf(path, globs) {
  for (const g of globs) {
    const depth = g.split("/").length, segs = path.split("/");
    if (segs.length <= depth) continue;
    const dir = segs.slice(0, depth).join("/");
    if (globRe(g).test(dir)) return dir;
  }
  return null;
}
/** Folders holding at least one file of `files` (a Set or array of paths), with all their ancestors. */
const foldersOf = (files) => { const s = new Set(); for (const p of files) for (let d = parentOf(p); d; d = parentOf(d)) s.add(d); return s; };

/**
 * The pre-scan of one range (pure, for the tests).
 * prev/cp: paths at the previous and this checkpoint; touched: every path any range commit changed (deleted included);
 * globs: workspace globs at the checkpoint; ignore: [{ path, added: [lines], removed: [lines] }];
 * writers: [{ path, lines: [added lines] }] of changed test/script files; scripts: [{ path, name, from, to }];
 * lanes: [{ lane, path }] the plan's file steps.
 */
export function scan({ range, prev, cp, touched, globs, ignore = [], writers = [], scripts = [], lanes = [] }) {
  const P = new Set(prev), C = new Set(cp), pf = foldersOf(P), cf = foldersOf(C);
  const lanesUnder = (dir) => [...new Set(lanes.filter((l) => l.path.startsWith(`${dir}/`)).map((l) => l.lane))].sort();
  // 1. a folder some commit wrote into that neither checkpoint holds: a workspace folder or a package.json's folder
  const transient = new Map();
  for (const p of touched) {
    if (p.includes("node_modules/")) continue;
    for (const dir of new Set([workspaceOf(p, globs), PKG.test(p) ? parentOf(p) || "." : null])) {
      if (!dir || dir === "." || pf.has(dir) || cf.has(dir)) continue;
      const t = transient.get(dir) ?? { dir, paths: 0, packageJson: false };
      t.paths++; t.packageJson ||= PKG.test(p) && parentOf(p) === dir;
      transient.set(dir, t);
    }
  }
  // the ones a plan step writes into first: only they can leave a folder in a lane
  const addedRemoved = [...transient.values()].map((t) => ({ ...t, lanes: lanesUnder(t.dir) })).sort((a, b) => (!a.lanes.length - !b.lanes.length) || a.dir.localeCompare(b.dir));
  // 4. workspace folders and top-level folders the checkpoint has and the previous one did not
  const ws = (files) => new Set([...files].map((p) => workspaceOf(p, globs)).filter(Boolean));
  const wsPrev = ws(P), top = (files) => new Set([...files].filter((p) => p.includes("/")).map((p) => p.split("/")[0]));
  const topPrev = top(P);
  const newPackages = [...ws(C)].filter((d) => !wsPrev.has(d)).sort().map((dir) => ({ dir, packageJson: C.has(`${dir}/package.json`), lanes: lanesUnder(dir) }));
  const newTop = [...top(C)].filter((d) => !topPrev.has(d)).sort();
  // 3. writers: only lines that write, and not into the OS temp folder
  const writing = (path, l) => !/^\s*(\/\/|\*|\/\*|#)/.test(l) && (SHELL.test(path) ? SHELL_WRITE : WRITE).test(l) && !TMP.test(l);
  const writes = writers.map((w) => ({ path: w.path, lines: w.lines.filter((l) => writing(w.path, l)).map((l) => l.trim().slice(0, 160)) })).filter((w) => w.lines.length);
  const ign = ignore.filter((g) => g.added.length || g.removed.length);
  const flags = { addedRemoved: addedRemoved.length, gitignore: ign.length, writers: writes.length + scripts.length, newPackages: newPackages.length + newTop.length };
  return { range, flags, total: Object.values(flags).reduce((a, b) => a + b, 0), addedRemoved, gitignore: ign, writers: writes, scripts, newPackages, newTop };
}

/** The range's plan notes. */
export function notes(s, meta = {}) {
  const L = [`# Range ${pad(s.range)} · pre-scan (dsh history only, fix 064)`, ""];
  if (meta.prev) L.push(`From \`${meta.prev.slice(0, 10)}\` (range ${pad(s.range - 1)} checkpoint) to \`${meta.cp.slice(0, 10)}\`: ${meta.commits} commits. Plan lanes: ${meta.lanes ?? "?"}.`, "");
  L.push(`**${s.total ? `${s.total} flag${s.total > 1 ? "s" : ""}` : "No flags"}:** packages added and removed ${s.flags.addedRemoved} · .gitignore ${s.flags.gitignore} · writers outside sources ${s.flags.writers} · new top-level packages ${s.flags.newPackages}.`, "");
  const lanes = (xs) => (xs.length ? ` (lanes: ${xs.join(", ")})` : " (no plan step writes there: a side-branch commit only)");
  L.push("## 1. Packages added and removed within the range (R9, fix 060)", "");
  L.push(...(s.addedRemoved.length ? s.addedRemoved.map((t) => `- \`${t.dir}/\`: ${t.paths} path change${t.paths > 1 ? "s" : ""}${t.packageJson ? ", with its package.json" : ""}; neither checkpoint holds it${lanes(t.lanes)}. Expect an untracked folder after a lane build; the \`-d\` clean must reach it`) : ["- none"]), "");
  L.push("## 2. New or changed .gitignore entries (R7, fix 058)", "");
  L.push(...(s.gitignore.length ? s.gitignore.flatMap((g) => [`- \`${g.path}\`: ${g.added.length} added, ${g.removed.length} removed`, ...g.added.map((x) => `  - \`+ ${x}\``), ...g.removed.map((x) => `  - \`- ${x}\``)]) : ["- none"]), "");
  L.push("## 3. Tests or scripts that write files (R7; a text match, check the target)", "");
  const w = [...s.writers.map((x) => [`- \`${x.path}\`: ${x.lines.length} writing line${x.lines.length > 1 ? "s" : ""}`, ...x.lines.slice(0, 3).map((l) => `  - \`${l.replace(/`/g, "'")}\``)]).flat(),
    ...s.scripts.map((x) => `- \`${x.path}\` script \`${x.name}\`: ${x.from == null ? "new" : "changed"}: \`${String(x.to ?? "(removed)").replace(/`/g, "'").slice(0, 160)}\``)];
  L.push(...(w.length ? w : ["- none"]), "");
  L.push("## 4. New top-level packages and folders (R5)", "");
  L.push(...(s.newPackages.length || s.newTop.length ? [...s.newPackages.map((p) => `- package \`${p.dir}/\`${p.packageJson ? "" : " (no package.json at the checkpoint)"}${lanes(p.lanes)}`), ...s.newTop.map((d) => `- top-level folder \`${d}/\``)] : ["- none"]), "");
  return L.join("\n");
}

const changedLines = (diff) => diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1));
const removedLines = (diff) => diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).map((l) => l.slice(1));
const show = (repo, ref, path) => { try { return execFileSync("git", ["--git-dir", repo, "show", `${ref}:${path}`], { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }); } catch { return null; } };
const scriptsOf = (text) => { try { return JSON.parse(text)?.scripts ?? {}; } catch { return {}; } };

/** Gathers one range's inputs from the bare clone and the plan file, then scans. */
export function prescanRange(repo, planDir, k) {
  const plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
  const before = JSON.parse(readFileSync(join(planDir, `range-${pad(k - 1)}.json`), "utf8"));
  const prevC = before.checkpoint, cpC = plan.checkpoint;
  const prev = [...lsTree(repo, prevC).files.keys()], cp = [...lsTree(repo, cpC).files.keys()];
  const touched = [...new Set(git(repo, ["log", "-m", "--no-renames", "--name-only", "--format=", `${prevC}..${cpC}`]).split("\n").filter(Boolean))];
  const commits = Number(git(repo, ["rev-list", "--count", `${prevC}..${cpC}`]).trim());
  const net = git(repo, ["diff-tree", "-r", "--no-renames", "--name-status", prevC, cpC]).split("\n").filter(Boolean).map((l) => l.split("\t")).map(([st, path]) => ({ st, path }));
  const ignore = net.filter((c) => IGNORE.test(c.path)).map((c) => { const d = git(repo, ["diff", "-U0", prevC, cpC, "--", c.path]); return { path: c.path, added: changedLines(d), removed: removedLines(d) }; });
  const writers = net.filter((c) => c.st !== "D" && !c.path.includes("node_modules/") && (TEST.test(c.path) || SCRIPT.test(c.path)))
    .map((c) => ({ path: c.path, lines: changedLines(git(repo, ["diff", "-U0", prevC, cpC, "--", c.path])) }));
  const scripts = [];
  for (const c of net.filter((x) => PKG.test(x.path) && !x.path.includes("node_modules/"))) {
    const a = scriptsOf(show(repo, prevC, c.path)), b = scriptsOf(show(repo, cpC, c.path));
    // a new package's scripts only when they run on their own (its bundle/watch boilerplate is noise)
    const fresh = c.st === "A";
    for (const name of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[name] !== b[name] && b[name] != null && (!fresh || (LIFECYCLE.test(name) && !/^(tsdown|tsc|vitest)( |$)/.test(b[name])))) scripts.push({ path: c.path, name, from: a[name] ?? null, to: b[name] });
  }
  const lanes = [...plan.steps.flatMap((s) => (s.files ?? []).map((f) => ({ lane: s.lane, path: f.path }))).filter((x) => x.lane),
    ...(plan.consolidation ?? []).flatMap((c) => (c.files ?? []).map((f) => ({ lane: "reconcile", path: f.path })))];
  const s = scan({ range: k, prev, cp, touched, globs: workspaceGlobs(show(repo, cpC, "pnpm-workspace.yaml")), ignore, writers, scripts, lanes });
  return { ...s, meta: { prev: prevC, cp: cpC, commits, lanes: plan.lanes.map((l) => l.name).join(", ") } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { values: v } = parseArgs({ options: { repo: { type: "string" }, plan: { type: "string" }, from: { type: "string" }, to: { type: "string" }, out: { type: "string" } } });
  if (!v.repo || !v.plan || !v.from || !v.out) { console.error("usage: prescan.mjs --repo <bare dsh clone> --plan <plan dir> --from N [--to M] --out <dir>"); process.exit(2); }
  mkdirSync(v.out, { recursive: true });
  for (let k = Number(v.from); k <= Number(v.to ?? v.from); k++) {
    const s = prescanRange(v.repo, v.plan, k);
    writeFileSync(join(v.out, `prescan-${pad(k)}.json`), `${JSON.stringify(s, null, 2)}\n`);
    writeFileSync(join(v.out, `prescan-${pad(k)}.md`), notes(s, s.meta));
    console.log(`${pad(k)}: ${s.total} flag(s) ${JSON.stringify(s.flags)}`);
  }
}
