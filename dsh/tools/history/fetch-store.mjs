#!/usr/bin/env node
// Fills the pnpm store once from the lockfiles of all ranges (SPEC §2,
// Speed-ups 4; INSTALLS.md §2): the one step that uses the network.
//   node dsh/tools/history/fetch-store.mjs --repo <dsh.git> --plan <dir> --image I --volume V [--from i] [--to j] [--list]
// The distinct pnpm lockfiles of the plan's checkpoints (by git blob id, in
// first-range order; range 0 is yarn's and has none) are numbered 0..n-1;
// `--list` prints them. For lockfiles [from, to) it writes each one's
// pnpm-lock.yaml, pnpm-workspace.yaml, package.json and .npmrc (those that
// exist at its first checkpoint) under ~/lfs-history/fetch/<blob>/, then runs
// one container `layerfs-issue352-fetch` (network on) with the store volume
// that runs `pnpm fetch` in each, one attempt each, and measures the store
// before and after. Installs and tests never use the network. Each batch is
// recorded in ~/lfs-history/ledger/ledger.jsonl (kind pnpm-fetch): lockfiles,
// exit statuses, store bytes before and after, duration; failed fetches keep
// their log beside the lockfile, and nothing works around them.
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FETCH } from "./calibrate-tests.mjs";

const pad = (n) => String(n).padStart(3, "0");
const FILES = ["pnpm-lock.yaml", "pnpm-workspace.yaml", "package.json", ".npmrc"];

/** The distinct lockfiles of the plan: [{ blob, ranges, checkpoint }], first-range order. */
export function lockfiles(repo, planDir) {
  const summary = JSON.parse(readFileSync(join(planDir, "plan.json"), "utf8"));
  const out = new Map();
  for (let k = 0; k < summary.ranges.length; k++) {
    const checkpoint = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8")).checkpoint;
    const r = spawnSync("git", ["--git-dir", repo, "rev-parse", `${checkpoint}:pnpm-lock.yaml`], { encoding: "utf8" });
    if (r.status !== 0) continue;
    const blob = r.stdout.trim();
    if (!out.has(blob)) out.set(blob, { blob, ranges: [], checkpoint });
    out.get(blob).ranges.push(k);
  }
  return [...out.values()];
}

/** The script one fetch container runs: each directory's `pnpm fetch`, its status on one line. */
export const fetchScript = (dirs) => dirs.map((d) => `(cd /f/${d} && ${FETCH} > /f/${d}/fetch.log 2>&1); echo "${d} $?"`).join("; ");

const storeBytes = (image, volume) => Number(execFileSync("docker", ["run", "--rm", "--network", "none", "-v", `${volume}:/s:ro`, "--entrypoint", "du", image, "-sk", "/s"], { encoding: "utf8" }).split(/\s+/)[0]) * 1024;

function main() {
  const args = process.argv.slice(2);
  const opt = (n, d = null) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
  const repo = opt("--repo"), planDir = opt("--plan"), image = opt("--image"), volume = opt("--volume");
  if (!repo || !planDir) { console.error("usage: fetch-store.mjs --repo <dsh.git> --plan <dir> --image I --volume V [--from i] [--to j] [--list]"); process.exit(2); }
  const all = lockfiles(repo, planDir);
  if (args.includes("--list")) { all.forEach((l, i) => console.log(`${i} ${l.blob} ranges ${l.ranges.join(",")}`)); return; }
  if (!image || !volume) process.exit(2);
  const from = Number(opt("--from", "0")), to = Number(opt("--to", String(all.length)));
  const batch = all.slice(from, to), root = join(process.env.HOME, "lfs-history", "fetch");
  for (const l of batch) {
    const dir = join(root, l.blob);
    mkdirSync(dir, { recursive: true });
    for (const f of FILES) {
      const r = spawnSync("git", ["--git-dir", repo, "show", `${l.checkpoint}:${f}`], { maxBuffer: 1 << 28 });
      if (r.status === 0) writeFileSync(join(dir, f), r.stdout);
    }
  }
  const before = storeBytes(image, volume), t0 = Date.now();
  const r = spawnSync("docker", ["run", "--rm", "--name", "layerfs-issue352-fetch", "--network", "bridge", "-v", `${volume}:/pnpm-store`, "-v", `${root}:/f`,
    "--entrypoint", "sh", image, "-c", fetchScript(batch.map((l) => l.blob))], { encoding: "utf8", maxBuffer: 1 << 26 });
  const ms = Date.now() - t0, after = storeBytes(image, volume);
  const status = Object.fromEntries(String(r.stdout).trim().split("\n").filter(Boolean).map((l) => l.split(" ")).map(([b, s]) => [b, Number(s)]));
  const failed = batch.filter((l) => status[l.blob] !== 0).map((l) => ({ blob: l.blob, ranges: l.ranges, status: status[l.blob] ?? null, log: join(root, l.blob, "fetch.log") }));
  const entry = { at: new Date().toISOString(), kind: "pnpm-fetch", volume, image, from, to, lockfiles: batch.map((l) => ({ blob: l.blob, ranges: l.ranges })), status, failed, storeBefore: before, storeAfter: after, ms, exit: r.status };
  mkdirSync(join(process.env.HOME, "lfs-history", "ledger"), { recursive: true });
  appendFileSync(join(process.env.HOME, "lfs-history", "ledger", "ledger.jsonl"), `${JSON.stringify(entry)}\n`);
  console.log(JSON.stringify({ from, to, ok: batch.length - failed.length, failed: failed.map((f) => f.blob.slice(0, 8)), storeBefore: before, storeAfter: after, ms }));
  if (failed.length || r.status !== 0) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
