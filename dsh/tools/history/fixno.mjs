#!/usr/bin/env node
// The next free #352 fix-record number (step 6, ranges 21–30): claimed at commit
// time from origin/main after a fetch, and from every origin branch and HEAD, so
// two sessions never take the same number (044 was taken twice on 2026-10-19).
//   node dsh/tools/history/fixno.mjs [--no-fetch]
import { execFileSync } from "node:child_process";

const DIR = "core/docs/issues/352/fixes/";
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 26 });

/** The highest numbered record in the listed names (pure, for the tests). */
export const highest = (names) => Math.max(0, ...names.map((n) => /^(\d{3})-/.exec(n.split("/").pop())?.[1]).filter(Boolean).map(Number));

export function nextFix({ fetch = true } = {}) {
  if (fetch) git("fetch", "-q", "origin");
  const refs = ["HEAD", ...git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin").split("\n").filter((r) => r && r !== "origin/HEAD" && r !== "origin")];
  const seen = refs.map((ref) => { try { return { ref, top: highest(git("ls-tree", "--name-only", ref, DIR).split("\n")) }; } catch { return { ref, top: 0 }; } });
  const top = Math.max(...seen.map((s) => s.top));
  return { next: String(top + 1).padStart(3, "0"), top, where: seen.filter((s) => s.top === top).map((s) => s.ref) };
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(nextFix({ fetch: !process.argv.includes("--no-fetch") })));
