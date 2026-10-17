#!/usr/bin/env node
// A checkpoint's files, its difference from git and its Store's figures, for
// troubleshooting (#352 SPEC §7, Inspecting a checkpoint). It only reads.
//   node dsh/tools/history/inspect.mjs ls   --store <store.json> <ref|rN> [path]
//   node dsh/tools/history/inspect.mjs cat  --store <store.json> <ref|rN> <path>
//   node dsh/tools/history/inspect.mjs diff --store <store.json> --repo <dsh.git> --plan <dir> <N> [ref]
//   node dsh/tools/history/inspect.mjs stats --store <store.json> [--save <snapshots> --range N]
//   node dsh/tools/history/inspect.mjs trend --dir <snapshots>
//   node dsh/tools/history/inspect.mjs open  --dir <snapshots> --work <dir> --project <name> <N>
// <store.json> is what restore-store.mjs or `snapshot.mjs fork` printed: the
// project, the SDK and the environment of the Store to read; the live run's
// own (its runner writes one) works for ls, cat and diff. A ref is a Branch, a
// Commit id, or rN: range N's checkpoint, main's head Commit as the runner
// recorded it in the metrics (`head`, with --metrics <dir>).
//
// `diff` compares the ref's tracked files with git's tree at range N's
// checkpoint by git blob id and mode (compareTree): one Sandbox, a check
// Branch forked from the ref, and one exec per 200 files printing each file's
// blob id, as the per-range verify does. `stats` reads the SDK's Store
// statistics and, from a fork's own file (never the live Store, never a
// snapshot's blocks), SQLite's page use per table and index, and objects by
// role and size. `trend` lines up every snapshot's manifest with the stats
// saved for it. `open` forks a snapshot (snapshot.mjs) and prints its
// store.json, for the commands above and for a dsh web pointed at it.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CHECK_PREFIX } from "../checks/history.mjs";
import { listAll, readAll, trackedTree } from "../checks/tree.mjs";
import { compareTree, expectedTree } from "./oracle.mjs";
import { loadAttempts } from "./report.mjs";

const pad = (n) => String(n).padStart(3, "0");
const quote = (text) => `'${text.replaceAll("'", "'\\''")}'`;

// Prints "<mode> <git blob id> <path>" for each path argument, as git sees them.
const BLOB_IDS = `const fs=require("fs"),c=require("crypto");for(const p of process.argv.slice(1)){const s=fs.lstatSync("."+p);let b,m;if(s.isSymbolicLink()){b=Buffer.from(fs.readlinkSync("."+p));m="120000"}else{b=fs.readFileSync("."+p);m=s.mode&0o111?"100755":"100644"}const h=c.createHash("sha1").update("blob "+b.length+"\\0").update(b).digest("hex");process.stdout.write(m+" "+h+" "+p+"\\n")}`;

/** Object role names by their persisted code (layerfs-content ObjectRole::code). */
export const ROLES = ["", "whole file", "chunk", "extent leaf", "extent branch", "file state", "inode leaf", "directory leaf", "directory branch", "inode branch", "filesystem root", "attribute leaf", "attribute branch", "symlink"];

/** Parses BLOB_IDS's output into path -> { mode, blob } (paths without the leading /). */
export function parseIds(stdout) {
  const out = new Map();
  for (const line of String(stdout).split("\n").filter(Boolean)) {
    const m = /^(100644|100755|120000) ([0-9a-f]{40}) \/(.*)$/.exec(line);
    if (!m) throw new Error(`unexpected line: ${line.slice(0, 200)}`);
    out.set(m[3], { mode: m[1], blob: m[2] });
  }
  return out;
}

/**
 * The tracked files of `ref` by git blob id and mode, read in a Workspace of
 * `sandbox` on a check Branch forked from `ref` (unmounted without a Commit).
 */
export async function treeIds(lf, sandbox, ref) {
  const tree = await trackedTree(lf, ref);
  const paths = [...tree].filter(([, type]) => type !== "dir").map(([path]) => path);
  const branch = `${CHECK_PREFIX}inspect-${Date.now().toString(36)}`;
  await lf.branch.fork(branch, ref);
  const ws = await lf.sandbox.mount(sandbox, branch), out = new Map();
  try {
    for (let i = 0; i < paths.length; i += 200) {
      const chunk = paths.slice(i, i + 200);
      const r = await lf.sandbox.exec(sandbox, ws, `timeout 100 node -e ${quote(BLOB_IDS)} ${chunk.map(quote).join(" ")}`);
      if (r.exitCode !== 0) throw new Error(`blob ids exited ${r.exitCode}: ${String(r.stderr ?? "").slice(0, 400)}`);
      for (const [p, v] of parseIds(r.stdout)) out.set(p, v);
    }
  } finally {
    await lf.sandbox.unmount(sandbox, ws, true);
  }
  return out;
}

/** Range N's checkpoint as a ref: main's head Commit the runner recorded in its latest attempt. */
export function checkpointRef(metricsDir, range) {
  const attempts = loadAttempts(metricsDir).get(range);
  const head = attempts?.at(-1)?.head;
  if (!head) throw new Error(`range ${range} has no recorded head Commit in ${metricsDir}`);
  return head;
}

/** Read-only SQL on a fork's Store file: one query, rows as arrays. */
export function sql(file, query) {
  const out = execFileSync("sqlite3", ["-separator", "\t", `file:${file}?mode=ro&immutable=1`, query], { encoding: "utf8", maxBuffer: 1 << 26 });
  return out.split("\n").filter(Boolean).map((line) => line.split("\t"));
}

const SIZE_CLASS = "case when canonical_length<=4096 then '≤4 KiB' when canonical_length<=32768 then '≤32 KiB' when canonical_length<=131072 then '≤128 KiB' else '>128 KiB' end";

/** The SQL half of `stats`: pages, page use per table and index, objects and packs. */
export function storeFigures(file) {
  const one = (q) => Number(sql(file, q)[0]?.[0]);
  const [p] = sql(file, "select whole_file_delta_max_depth, chunk_delta_max_depth, metadata_delta_max_depth, small_file_threshold_bytes from store_policy");
  const figures = {
    pageSize: one("pragma page_size"), pages: one("pragma page_count"), freePages: one("pragma freelist_count"),
    commits: one("select count(*) from \"commit\""), branches: one("select count(*) from branch"), layers: one("select count(*) from layer"),
    policy: p ? { wholeFileDepth: Number(p[0]), chunkDepth: Number(p[1]), metadataDepth: Number(p[2]), cutoff: Number(p[3]) } : null,
    objects: sql(file, `select role, ${SIZE_CLASS} as class, count(*), sum(canonical_length) from object_location group by role, class order by role, class`)
      .map(([role, cls, n, bytes]) => ({ role: ROLES[Number(role)] ?? role, class: cls, n: Number(n), canonical: Number(bytes) })),
    packs: sql(file, "select domain, count(*), sum(length) from pack group by domain").map(([domain, n, bytes]) => ({ domain: Number(domain), n: Number(n), bytes: Number(bytes) })),
  };
  try {
    figures.tables = sql(file, "select name, count(*), sum(pgsize), sum(unused) from dbstat group by name order by sum(pgsize) desc")
      .map(([name, pages, bytes, unused]) => ({ name, pages: Number(pages), bytes: Number(bytes), unused: Number(unused) }));
  } catch {
    figures.tables = null; // this sqlite3 has no dbstat
  }
  return figures;
}

/** Every snapshot's manifest with the stats saved for it, oldest first. */
export function trend(dir) {
  return readdirSync(dir).filter((f) => /^range-\d+\.json$/.test(f)).sort().map((f) => {
    const m = JSON.parse(readFileSync(join(dir, f), "utf8"));
    const statsFile = join(dir, `stats-${pad(m.range)}.json`);
    const s = existsSync(statsFile) ? JSON.parse(readFileSync(statsFile, "utf8")) : null;
    return { range: m.range, depth: m.depth ?? null, size: m.size, newBytes: m.newBytes, copyMs: m.copyMs, sealMs: m.sealMs ?? null,
      stored: s?.sdk?.stored ?? null, metadata: s?.sdk?.metadata ?? null, dedupe: s?.sdk?.dedupe ?? null, compression: s?.sdk?.compression ?? null,
      freePages: s?.sql?.freePages ?? null };
  });
}

async function open(storeFile) {
  const store = JSON.parse(readFileSync(storeFile, "utf8"));
  Object.assign(process.env, store.env);
  const { LayerFS } = await import(store.sdk);
  const { LayerFSOperator } = await import(new URL("../operator/index.js", `file://${store.sdk}`).href);
  const lf = new LayerFS(store.project);
  return { store, lf, operator: new LayerFSOperator(lf) };
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = {}, args = [];
  for (let i = 0; i < rest.length; i++) if (rest[i].startsWith("--")) flags[rest[i].slice(2)] = rest[++i]; else args.push(rest[i]);
  const ref = (r) => (/^r\d+$/.test(r) ? checkpointRef(flags.metrics ?? join(process.env.HOME, "lfs-history", "metrics"), Number(r.slice(1))) : r);
  const usage = () => { console.error("usage: inspect.mjs ls|cat|diff|stats|trend|open … (see the file's header)"); process.exit(2); };
  if (cmd === "trend") { if (!flags.dir) usage(); console.table(trend(flags.dir)); return; }
  if (cmd === "open") {
    if (!flags.dir || !flags.work || !flags.project || !args[0]) usage();
    const printed = execFileSync("node", [join(dirname(new URL(import.meta.url).pathname), "snapshot.mjs"), "fork", "--range", args[0], "--dir", flags.dir, "--work", flags.work, "--project", flags.project], { encoding: "utf8" });
    const store = JSON.parse(printed), file = join(flags.work, `${store.fork}.store.json`);
    writeFileSync(file, JSON.stringify(store, null, 2));
    console.log(`${file}\nLAYERFS_HOME=${store.env.LAYERFS_HOME} LAYERFS_VOLUME=${store.env.LAYERFS_VOLUME}`);
    return;
  }
  if (!flags.store) usage();
  const { store, lf, operator } = await open(flags.store);
  if (cmd === "ls") {
    for (const item of await listAll(lf, ref(args[0] ?? "main"), args[1] ?? "/")) console.log(`${item.type.padEnd(7)} ${item.path}`);
  } else if (cmd === "cat") {
    const r = await readAll(lf, ref(args[0]), args[1]);
    if (r.problem) { console.error(r.problem); process.exit(1); }
    process.stdout.write(r.text);
  } else if (cmd === "diff") {
    if (!flags.repo || !flags.plan || !args[0]) usage();
    const range = Number(args[0]), plan = JSON.parse(readFileSync(join(flags.plan, `range-${pad(range)}.json`), "utf8"));
    const sandbox = await lf.sandbox.create(`${store.project}-inspect`.slice(0, 63), store.project, store.env.LAYERFS_IMAGE);
    try {
      const actual = await treeIds(lf, sandbox, ref(args[1] ?? `r${range}`));
      const result = compareTree(expectedTree(flags.repo, plan.checkpoint), actual);
      console.log(JSON.stringify(result, null, 1));
      if (!result.ok) process.exitCode = 1;
    } finally {
      await lf.sandbox.close(sandbox);
    }
  } else if (cmd === "stats") {
    // a fork made by restore-store.mjs keeps its file beside the home: <work>/<id>/{home,vol/global}
    const file = join(dirname(store.env.LAYERFS_HOME), "vol", "global", "store.sqlite");
    const out = { sdk: await operator.store.stats(), sql: existsSync(file) ? storeFigures(file) : null };
    if (!out.sql) console.error(`no fork file at ${file}: SQL figures need a fork (open), never the live Store`);
    if (flags.save) {
      if (!flags.range) usage();
      mkdirSync(flags.save, { recursive: true });
      writeFileSync(join(flags.save, `stats-${pad(Number(flags.range))}.json`), JSON.stringify(out));
    }
    console.log(JSON.stringify(out, null, 1));
  } else usage();
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
