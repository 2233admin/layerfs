#!/usr/bin/env node
// Block-incremental Store snapshots (#352 SPEC §7):
//   node dsh/tools/history/snapshot.mjs take --range N --volume V --image I --dir <snapshots> [--facts <json>]
//   node dsh/tools/history/snapshot.mjs verify --range N --dir <snapshots>
//   node dsh/tools/history/snapshot.mjs fork --range N --dir <snapshots> --work <dir> --project <name> [--volume <name>]
//   node dsh/tools/history/snapshot.mjs orphans --dir <snapshots>
// A snapshot is the global Store's SQLite file at a checkpoint, kept as
// range-NNN.json (a manifest of block hashes) over <snapshots>/blocks/, which
// holds every distinct 1 MiB block once, named by its SHA-256. Taking one
// writes only the blocks no earlier snapshot has, so its cost follows the
// bytes the Store changed, not its size.
//
// `take` needs a sealed Store: the runner seals it (Handles::seal) before and
// reopens it after; take refuses a Store with a non-empty WAL or a page size
// other than 4096. The file lives in a Docker volume, so the blocks are hashed
// inside a container (this file's `blockify`, run by node in the image) with
// the snapshots folder bound in. `fork` rebuilds a snapshot's file and
// restores it as a new project with restore-store.mjs. `orphans` lists blocks
// no manifest names; removing them is the lead's decision, by literal path.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, renameSync, statSync, writeFileSync, writeSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const BLOCK = 1 << 20;
export const PAGE_SIZE = 4096;
const here = dirname(fileURLToPath(import.meta.url));
const pad = (n) => String(n).padStart(3, "0");
export const manifestPath = (dir, range) => join(dir, `range-${pad(range)}.json`);

/** SQLite's page size from a database file's header (bytes 16–17; 1 means 65536). */
export function pageSizeOf(header) {
  if (header.length < 100 || header.subarray(0, 16).toString("latin1") !== "SQLite format 3\0") throw new Error("not a SQLite database file");
  const n = header.readUInt16BE(16);
  return n === 1 ? 65536 : n;
}

/**
 * Hashes `file` in blocks and writes each block `blocks` does not hold yet.
 * @returns {{ size: number, sha256: string, pageSize: number, blocks: string[], newBlocks: number, newBytes: number }}
 */
export function blockify(file, blocks, blockSize = BLOCK) {
  mkdirSync(blocks, { recursive: true });
  const fd = openSync(file, "r"), buf = Buffer.alloc(blockSize), whole = createHash("sha256");
  const out = { size: 0, sha256: "", pageSize: 0, blocks: [], newBlocks: 0, newBytes: 0 };
  try {
    for (;;) {
      const n = readSync(fd, buf, 0, blockSize, out.size);
      if (n === 0) break;
      const body = buf.subarray(0, n);
      if (out.size === 0) out.pageSize = pageSizeOf(body);
      whole.update(body);
      const id = createHash("sha256").update(body).digest("hex");
      const target = join(blocks, id);
      if (!existsSync(target)) {
        writeFileSync(`${target}.tmp`, body);
        renameSync(`${target}.tmp`, target);
        out.newBlocks++;
        out.newBytes += n;
      }
      out.blocks.push(id);
      out.size += n;
    }
  } finally {
    closeSync(fd);
  }
  out.sha256 = whole.digest("hex");
  return out;
}

/** Writes a manifest's file to `out` from its blocks and checks its SHA-256. */
export function rebuild(manifest, blocks, out) {
  mkdirSync(dirname(out), { recursive: true });
  const fd = openSync(`${out}.tmp`, "w"), whole = createHash("sha256");
  try {
    for (const id of manifest.blocks) {
      const body = readFileSync(join(blocks, id));
      whole.update(body);
      writeSync(fd, body);
    }
  } finally {
    closeSync(fd);
  }
  const sha = whole.digest("hex");
  if (sha !== manifest.sha256) throw new Error(`rebuilt file's SHA-256 ${sha} is not the manifest's ${manifest.sha256}`);
  renameSync(`${out}.tmp`, out);
  return sha;
}

/** Every block of a manifest is present and hashes to its name, and together they make the file. */
export function verify(manifest, blocks) {
  const problems = [], whole = createHash("sha256");
  for (const id of manifest.blocks) {
    const path = join(blocks, id);
    if (!existsSync(path)) { problems.push(`block ${id} missing`); continue; }
    const body = readFileSync(path);
    if (createHash("sha256").update(body).digest("hex") !== id) problems.push(`block ${id} damaged`);
    whole.update(body);
  }
  if (!problems.length && whole.digest("hex") !== manifest.sha256) problems.push("the blocks do not make the manifest's file");
  return { ok: problems.length === 0, problems };
}

/** The blocks in `blocks` that no manifest of `dir` names. */
export function orphans(dir) {
  const used = new Set();
  for (const f of readdirSync(dir).filter((f) => /^range-\d+\.json$/.test(f))) for (const id of JSON.parse(readFileSync(join(dir, f), "utf8")).blocks) used.add(id);
  const blocks = join(dir, "blocks");
  return existsSync(blocks) ? readdirSync(blocks).filter((f) => /^[0-9a-f]{64}$/.test(f) && !used.has(f)).map((f) => join(blocks, f)) : [];
}

/**
 * Whether range `range` takes a snapshot (SPEC §7, When): the plan's pilot
 * and milestone ranges, a range whose verdict is optimize (before the fix
 * starts), and any range after which fast-forwarding from the last snapshot
 * would take longer than taking a new one.
 * @param {{ planned: boolean, verdict: string, sinceMs: number[], lastCostMs: number | null }} at
 *   sinceMs: the fast-rebuild time (or, unknown, the wall time) of each range since the last snapshot, this one included;
 *   lastCostMs: the last snapshot's seal and copy time
 */
export function due({ planned, verdict, sinceMs, lastCostMs }) {
  if (planned) return { due: true, why: "planned (pilot or milestone)" };
  if (verdict === "optimize") return { due: true, why: "optimize: the fix starts from here" };
  const forward = sinceMs.reduce((n, ms) => n + ms, 0);
  if (lastCostMs == null) return { due: true, why: "no snapshot yet" };
  return forward > lastCostMs
    ? { due: true, why: `fast-forward ${forward} ms > snapshot ${lastCostMs} ms` }
    : { due: false, why: `fast-forward ${forward} ms ≤ snapshot ${lastCostMs} ms` };
}

/** The manifest of a taken snapshot: the block list and the facts SPEC §7 lists. */
export function manifestOf(range, image, made, facts, copyMs) {
  if (made.pageSize !== PAGE_SIZE) throw new Error(`page size ${made.pageSize}: the Store must keep 4096 (SPEC §7)`);
  return { range, image, ...facts, pageSize: made.pageSize, size: made.size, sha256: made.sha256, blockSize: BLOCK,
    blocks: made.blocks, newBlocks: made.newBlocks, newBytes: made.newBytes, copyMs, taken: new Date().toISOString() };
}

function take({ range, volume, image, dir, facts }) {
  const file = manifestPath(dir, range);
  if (existsSync(file)) throw new Error(`${file} exists; a snapshot is never replaced`);
  mkdirSync(join(dir, "blocks"), { recursive: true });
  const t0 = Date.now();
  // the WAL check and the hashing run where the volume is; only new blocks cross to the host
  const script = "w=/v/global/store.sqlite-wal; if [ -s \"$w\" ]; then echo 'the Store is not sealed: its WAL is not empty' >&2; exit 3; fi; exec node /t/snapshot.mjs blockify /v/global/store.sqlite /s/blocks";
  const out = execFileSync("docker", ["run", "--rm", "--network", "none", "-v", `${volume}:/v:ro`, "-v", `${resolve(dir)}:/s`, "-v", `${here}:/t:ro`, "--entrypoint", "sh", image, "-c", script], { encoding: "utf8", maxBuffer: 1 << 28 });
  const manifest = manifestOf(range, image, JSON.parse(out), facts, Date.now() - t0);
  writeFileSync(`${file}.tmp`, JSON.stringify(manifest));
  renameSync(`${file}.tmp`, file);
  return manifest;
}

function fork({ range, dir, work, project, volume }) {
  const manifest = JSON.parse(readFileSync(manifestPath(dir, range), "utf8"));
  const id = `r${pad(range)}-${Date.now().toString(36)}`, source = join(resolve(work), `${id}-src`);
  if (existsSync(source)) throw new Error(`${source} exists`);
  rebuild(manifest, join(dir, "blocks"), join(source, "global", "store.sqlite"));
  const repo = resolve(here, "../../..");
  const env = { ...process.env, LAYERFS_READER: process.env.LAYERFS_READER ?? repo, ...(manifest.image ? { RESTORE_IMAGE: manifest.image } : {}), ...(volume ? { RESTORE_VOLUME: volume } : {}) };
  const printed = execFileSync("node", [join(here, "..", "restore-store.mjs"), id, source, resolve(work), project], { encoding: "utf8", env, stdio: ["ignore", "pipe", "inherit"] });
  const store = JSON.parse(printed);
  // the snapshot's own runtime image, not restore-store's default
  if (manifest.image) store.env.LAYERFS_IMAGE = manifest.image;
  // its containers are named after its volume, as the run's are
  if (volume) store.env.LAYERFS_CONTAINER_PREFIX = `${volume}-`;
  return { ...store, range, fork: id, source };
}

function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  const range = opt("--range") === null ? null : Number(opt("--range")), dir = opt("--dir");
  if (cmd === "blockify" && args.length === 2) console.log(JSON.stringify(blockify(args[0], args[1])));
  else if (cmd === "take" && range !== null && dir && opt("--volume") && opt("--image")) {
    const facts = opt("--facts") ? JSON.parse(readFileSync(opt("--facts"), "utf8")) : {};
    const m = take({ range, volume: opt("--volume"), image: opt("--image"), dir, facts });
    console.log(JSON.stringify({ range, size: m.size, blocks: m.blocks.length, newBlocks: m.newBlocks, newBytes: m.newBytes, copyMs: m.copyMs }));
  } else if (cmd === "verify" && range !== null && dir) {
    const r = verify(JSON.parse(readFileSync(manifestPath(dir, range), "utf8")), join(dir, "blocks"));
    console.log(JSON.stringify(r));
    if (!r.ok) process.exit(1);
  } else if (cmd === "fork" && range !== null && dir && opt("--work") && opt("--project")) {
    console.log(JSON.stringify(fork({ range, dir, work: opt("--work"), project: opt("--project"), volume: opt("--volume") }), null, 2));
  } else if (cmd === "orphans" && dir) {
    for (const path of orphans(dir)) console.log(path);
  } else {
    console.error("usage: snapshot.mjs take --range N --volume V --image I --dir <snapshots> [--facts <json>]\n       snapshot.mjs verify|fork|orphans … (see the file's header)");
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
