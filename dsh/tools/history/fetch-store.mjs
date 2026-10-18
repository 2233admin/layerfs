#!/usr/bin/env node
// Fills the pnpm store once from the lockfiles of all ranges (SPEC §2,
// Speed-ups 4; INSTALLS.md §2): the one step that uses the network.
//   node dsh/tools/history/fetch-store.mjs --repo <dsh.git> --plan <dir> --image I --volume V [--from i] [--to j | --only blob,…] [--jobs n] [--note text] [--list] | --collect
// The distinct pnpm lockfiles of the plan's checkpoints (by git blob id, in
// first-range order; range 0 is yarn's and has none) are numbered 0..n-1;
// `--list` prints them. For lockfiles [from, to) it writes each one's
// pnpm-lock.yaml, pnpm-workspace.yaml, package.json, .npmrc and patches/ (those that
// exist at its first checkpoint) under ~/lfs-history/fetch/<blob>/, measures
// the store and starts one detached container `layerfs-issue352-fetch`
// (network on) that runs `pnpm fetch` in each, one attempt each. A batch
// outlives any command wall (two foreground batches overran theirs and left
// the container running), so `--collect` reads it back once it has exited:
// each lockfile's status, the store after, the duration; one entry in
// ~/lfs-history/ledger/ledger.jsonl (kind pnpm-fetch). Failed fetches keep
// their log beside the lockfile, and nothing works around them. Installs and
// tests never use the network.
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { FETCH } from "./calibrate-tests.mjs";

const pad = (n) => String(n).padStart(3, "0");
const NAME = "layerfs-issue352-fetch", PENDING = join(process.env.HOME, "lfs-history", "fetch", "pending.json");
const LEDGER = join(process.env.HOME, "lfs-history", "ledger", "ledger.jsonl");
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

/**
 * The script one fetch container runs: each directory's `pnpm fetch`, its
 * status on one line, `jobs` at a time (pnpm's store is content-addressed and
 * safe for concurrent writers; mostly-reused lockfiles spend their time in
 * resolution, so batches of one at a time ran about 25 s per lockfile). It
 * runs in a copy inside the container: pnpm fetch also links node_modules,
 * which was slow on the host bind mount. Four at a time ran out of memory in
 * the 3.8 GiB Docker VM on large binary tarballs (exit 137); `--jobs` sets it.
 */
export const fetchScript = (dirs, jobs = 4) => `printf '%s\\n' ${dirs.join(" ")} | xargs -P ${jobs} -I{} sh -c 'mkdir -p /tmp/{} && cp -R /f/{}/. /tmp/{}/ && rm -rf /tmp/{}/node_modules && cd /tmp/{} && ${FETCH} > /f/{}/fetch.log 2>&1; echo "{} $?"'`;

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
  const jobs = Number(opt("--jobs", "4")), only = opt("--only")?.split(",");
  const batch = (only ? all.filter((l) => only.some((b) => l.blob.startsWith(b))) : all.slice(from, to)), root = join(process.env.HOME, "lfs-history", "fetch");
  for (const l of batch) {
    const dir = join(root, l.blob);
    mkdirSync(dir, { recursive: true });
    // patchedDependencies name files under patches/: pnpm fetch fails without them (ERR_PNPM_PATCH_NOT_FOUND)
    const patches = spawnSync("git", ["--git-dir", repo, "ls-tree", "-r", "--name-only", l.checkpoint, "patches/"], { encoding: "utf8" }).stdout.split("\n").filter(Boolean);
    for (const f of [...FILES, ...patches]) {
      mkdirSync(dirname(join(dir, f)), { recursive: true });
      const r = spawnSync("git", ["--git-dir", repo, "show", `${l.checkpoint}:${f}`], { maxBuffer: 1 << 28 });
      if (r.status === 0) writeFileSync(join(dir, f), r.stdout);
    }
  }
  if (existsSync(PENDING)) { console.error(`a fetch batch is pending (${PENDING}); collect it first`); process.exit(1); }
  const before = storeBytes(image, volume);
  const id = execFileSync("docker", ["run", "-d", "--name", NAME, "--network", "bridge", "-v", `${volume}:/pnpm-store`, "-v", `${root}:/f`,
    "--entrypoint", "sh", image, "-c", fetchScript(batch.map((l) => l.blob), jobs)], { encoding: "utf8" }).trim();
  writeFileSync(PENDING, JSON.stringify({ id, volume, image, from, to, jobs, only, note: opt("--note"), lockfiles: batch.map((l) => ({ blob: l.blob, ranges: l.ranges })), storeBefore: before }));
  console.log(JSON.stringify({ started: id.slice(0, 12), from, to }));
}

/** Collects the pending batch once its container has exited: statuses, store size, duration; one ledger entry. */
function collect() {
  const p = JSON.parse(readFileSync(PENDING, "utf8"));
  const state = JSON.parse(execFileSync("docker", ["inspect", "-f", "{{json .State}}", p.id], { encoding: "utf8" }));
  const logs = execFileSync("docker", ["logs", p.id], { encoding: "utf8", maxBuffer: 1 << 26 });
  const status = Object.fromEntries(logs.trim().split("\n").filter((l) => /^[0-9a-f]{40} \d+$/.test(l)).map((l) => l.split(" ")).map(([b, s]) => [b, Number(s)]));
  if (state.Running) { console.log(JSON.stringify({ running: true, done: Object.keys(status).length, of: p.lockfiles.length })); process.exit(3); }
  const root = join(process.env.HOME, "lfs-history", "fetch");
  const failed = p.lockfiles.filter((l) => status[l.blob] !== 0).map((l) => ({ ...l, status: status[l.blob] ?? null, log: join(root, l.blob, "fetch.log") }));
  const after = storeBytes(p.image, p.volume), ms = Date.parse(state.FinishedAt) - Date.parse(state.StartedAt);
  const { id, ...rest } = p;
  appendFileSync(LEDGER, `${JSON.stringify({ at: new Date().toISOString(), kind: "pnpm-fetch", ...rest, container: id, status, failed, storeAfter: after, ms, exit: state.ExitCode })}\n`);
  unlinkSync(PENDING); // before the removal, which is slow (the container holds the copies): a killed collect must not ledger twice
  execFileSync("docker", ["rm", p.id]);
  console.log(JSON.stringify({ from: p.from, to: p.to, ok: p.lockfiles.length - failed.length, failed: failed.map((f) => f.blob.slice(0, 8)), storeBefore: p.storeBefore, storeAfter: after, ms }));
  if (failed.length) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) (process.argv.includes("--collect") ? collect() : main());
