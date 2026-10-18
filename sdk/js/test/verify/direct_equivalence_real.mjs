// Equivalence with the old binaries (#352 F-020 step 5.3). Two forks of the
// newest `p2-main-c` snapshot (range 11, project `dsh`); the same Store-call
// sequence (equivalence_sequence.mjs) runs on one through the old route
// (daemon c25119ac, addon 5baa0f5d, the parent's SDK JavaScript, on the
// Docker host) and on the other in-process with the new addon (in the runtime
// image). The old binaries are evidence only, not a product route.
// Each step is its own command (≤120 s):
//
//   node direct_equivalence_real.mjs fork <tag>            two forks, A (old) and B (new)
//   node direct_equivalence_real.mjs old <tag> <daemon> <addon> <sdk dir> <image>
//   node direct_equivalence_real.mjs new <tag> <daemon> <addon> <image>
//   node direct_equivalence_real.mjs compare <tag> [<control tag>]  replies and Store contents
//
// Replies must be equal after ids and times are normalized and compressed
// sizes are masked; those sizes vary by a few bytes between two runs of the
// same binaries (mtimes in metadata), so their raw deltas are reported beside
// an old-against-old control run's.
//   node direct_equivalence_real.mjs cleanup <tag>         volumes and folders
//
// Outputs stay in core/target/f020/eq/<tag>/ until cleanup.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { docker, inRuntime, REPO, RUNTIME, STORE_PATH } from "./container.mjs";
import { normalize, sequence, SIZES } from "./equivalence_sequence.mjs";

const HISTORY = process.env.LFS_HISTORY ?? join(homedir(), "lfs-history");
const SOURCE = { run: "p2-main-c", range: 11 };
const dir = (tag) => join(REPO, "core/target/f020/eq", tag);
const volume = (tag, arm) => `layerfs-issue352-f020-eq-${tag}-${arm}`;
const home = (tag, arm) => join(dir(tag), arm, "home");

async function fork(tag) {
  const { rebuild } = await import(join(REPO, "dsh/tools/history/snapshot.mjs"));
  const manifest = JSON.parse(readFileSync(join(HISTORY, "snapshots", `range-${String(SOURCE.range).padStart(3, "0")}.json`), "utf8"));
  assert.equal(manifest.run, SOURCE.run, "the range-11 snapshot is p2-main-c's");
  const restored = join(dir(tag), "restore", "global", "store.sqlite");
  rebuild(manifest, join(HISTORY, "snapshots", "blocks"), restored);
  for (const arm of ["A", "B"]) {
    docker(["volume", "create", volume(tag, arm)]);
    const copied = docker(["run", "--rm", "--network", "none", "--user", "0", "-v", `${volume(tag, arm)}:/v`, "-v", `${join(dir(tag), "restore")}:/src:ro`, "--entrypoint", "sh", manifest.image, "-c",
      "mkdir -p /v/global && cp /src/global/store.sqlite /v/global/store.sqlite && chown -R 0:0 /v && chmod 755 /v && chmod 700 /v/global && chmod 600 /v/global/store.sqlite"]);
    assert.equal(copied.status, 0, copied.stderr);
    const project = join(home(tag, arm), "dsh");
    mkdirSync(project, { recursive: true, mode: 0o700 });
    execFileSync("chmod", ["700", home(tag, arm)]);
    copyFileSync(join(HISTORY, "runs", SOURCE.run, "home", "dsh", "project.record"), join(project, "project.record"));
  }
  writeFileSync(join(dir(tag), "fork.json"), JSON.stringify({ source: SOURCE, sha256: manifest.sha256, image: manifest.image }, null, 1));
  console.log(`forked ${SOURCE.run} range ${SOURCE.range} (${manifest.sha256.slice(0, 12)}) into ${volume(tag, "A")} and ${volume(tag, "B")}`);
}

async function run(lf, op, out) {
  const t = Date.now();
  const steps = await sequence(lf, op);
  writeFileSync(out, JSON.stringify({ ms: Date.now() - t, steps }, (k, v) => (typeof v === "bigint" ? String(v) : v), 1));
}

async function old(tag, daemon, addon, sdk, image) {
  Object.assign(process.env, {
    LAYERFS_HOME: home(tag, "A"), LAYERFS_DOCKER: execFileSync("docker", ["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"], { encoding: "utf8" }).trim().replace(/^unix:\/\//, ""),
    LAYERFS_IMAGE: image, LAYERFS_VOLUME: volume(tag, "A"), LAYERFS_DAEMON: daemon, LAYERFS_NATIVE: addon,
    LAYERFS_CONTAINER_PREFIX: `f020-eq-${tag}-A-`, LAYERFS_CONSTRUCTION_WORKERS: "1",
  });
  const { LayerFS } = await import(join(sdk, "src/index.js"));
  const { LayerFSOperator } = await import(join(sdk, "operator/index.js"));
  const lf = new LayerFS("dsh");
  try {
    await run(lf, new LayerFSOperator(lf), join(dir(tag), "A.json"));
  } finally {
    for (const id of [...lf.sandboxes]) await lf.sandbox.close(id).catch((e) => console.error(`close ${id}: ${e.message}`));
  }
  console.log(`old arm done: ${join(dir(tag), "A.json")}`);
}

async function inner(tag) {
  process.env.LAYERFS_HOME = home(tag, "B");
  const { LayerFS } = await import("../../src/index.js");
  const { LayerFSOperator } = await import("../../operator/index.js");
  const lf = new LayerFS("dsh");
  try {
    await run(lf, new LayerFSOperator(lf), join(dir(tag), "B.json"));
  } finally {
    await lf.close?.();
  }
  console.log("new arm done");
}

function fresh(tag, daemon, addon, image) {
  const r = inRuntime({ script: fileURLToPath(import.meta.url), args: [tag], daemon, addon, image, volume: volume(tag, "B"), prefix: `f020-eq-${tag}-B-`, timeout: 110_000 });
  console.log(r.out.split("\n").slice(-6).join("\n"));
  assert.equal(r.status, 0, `new arm failed (signal ${r.signal})`);
}

/** Table row counts, page count and integrity of one fork's Store, read once all openers are closed. */
function store(tag, arm) {
  const js = `const { DatabaseSync } = require("node:sqlite"); const db = new DatabaseSync(${JSON.stringify(STORE_PATH)}, { readOnly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((r) => r.name);
const rows = Object.fromEntries(tables.map((t) => [t, Number(db.prepare('SELECT count(*) AS n FROM "' + t + '"').get().n)]));
const pages = Number(db.prepare("PRAGMA page_count").get().page_count), free = Number(db.prepare("PRAGMA freelist_count").get().freelist_count);
const size = Number(db.prepare("PRAGMA page_size").get().page_size);
const integrity = db.prepare("PRAGMA integrity_check").all().map((r) => Object.values(r)[0]);
console.log(JSON.stringify({ rows, usedBytes: (pages - free) * size, integrity }));`;
  const r = docker(["run", "--rm", "--network", "none", "-v", `${volume(tag, arm)}:/layerfs-store:ro`, "--entrypoint", "node", RUNTIME, "-e", js]);
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim().split("\n").pop());
}

/** Every numeric field of `SIZES` that differs between two outputs, with its delta. */
function sizeDeltas(a, b) {
  const out = [];
  const walk = (x, y, path) => {
    if (x && y && typeof x === "object" && typeof y === "object") for (const k of Object.keys(x)) walk(x[k], y[k], `${path}.${k}`);
    else if (typeof x === "number" && typeof y === "number" && x !== y && SIZES.has(path.split(".").pop())) out.push(`${path}: ${x} -> ${y} (${y - x > 0 ? "+" : ""}${+(y - x).toFixed(6)})`);
  };
  a.forEach((s, i) => walk(s, b[i], s.name));
  return out;
}

/** `control` (optional): another old run, whose deltas against this tag's old run show the run-to-run spread. */
function compare(tag, control) {
  const [a, b] = ["A", "B"].map((arm) => JSON.parse(readFileSync(join(dir(tag), `${arm}.json`), "utf8")));
  const [na, nb] = [normalize(a.steps, true), normalize(b.steps, true)];
  const differing = na.map((s, i) => [s, nb[i]]).filter(([x, y]) => JSON.stringify(x) !== JSON.stringify(y));
  const deltas = sizeDeltas(normalize(a.steps), normalize(b.steps));
  const spread = control ? sizeDeltas(normalize(a.steps), normalize(JSON.parse(readFileSync(join(dir(control), "A.json"), "utf8")).steps)) : null;
  console.log(`compressed sizes, old -> new: ${deltas.length} fields differ, max |delta| ${Math.max(0, ...deltas.map((d) => Math.abs(Number(d.match(/\(([-+0-9.]+)\)$/)[1]))))}`);
  if (spread) console.log(`compressed sizes, old -> old (${control}): ${spread.length} fields differ, max |delta| ${Math.max(0, ...spread.map((d) => Math.abs(Number(d.match(/\(([-+0-9.]+)\)$/)[1]))))}`);
  const [sa, sb] = ["A", "B"].map((arm) => store(tag, arm));
  const report = { steps: na.length, differing: differing.map(([x, y]) => ({ old: x, new: y })), sizeDeltas: deltas, controlSpread: spread, oldStore: sa, newStore: sb, oldMs: a.ms, newMs: b.ms };
  writeFileSync(join(dir(tag), "compare.json"), JSON.stringify(report, null, 1));
  console.log(`steps ${report.steps}, differing ${differing.length}; Store used bytes old ${sa.usedBytes} new ${sb.usedBytes}; integrity ${sa.integrity} / ${sb.integrity}`);
  for (const d of report.differing.slice(0, 6)) console.log(JSON.stringify(d).slice(0, 600));
  const rowDiff = Object.keys({ ...sa.rows, ...sb.rows }).filter((t) => sa.rows[t] !== sb.rows[t]).map((t) => `${t}: ${sa.rows[t]} vs ${sb.rows[t]}`);
  console.log(`row counts differing: ${rowDiff.length ? rowDiff.join(", ") : "none"}`);
  assert.deepEqual(sa.integrity, ["ok"]);
  assert.deepEqual(sb.integrity, ["ok"]);
  assert.equal(differing.length, 0, "replies differ");
  assert.deepEqual(rowDiff, [], "Store rows differ");
  console.log(`Store used bytes: old ${sa.usedBytes}, new ${sb.usedBytes} (delta ${sb.usedBytes - sa.usedBytes})`);
  console.log("direct equivalence: ok");
}

function cleanup(tag) {
  for (const arm of ["A", "B"]) docker(["volume", "rm", volume(tag, arm)]);
  rmSync(join(dir(tag), "restore"), { recursive: true, force: true });
  console.log(`removed the volumes and the restored file; results stay in ${dir(tag)}`);
}

const [mode, tag, ...rest] = process.argv.slice(2);
if (mode === "fork") await fork(tag);
else if (mode === "old") await old(tag, ...rest);
else if (mode === "new") fresh(tag, ...rest);
else if (mode === "inner") await inner(tag);
else if (mode === "compare") compare(tag, rest[0]);
else if (mode === "cleanup") cleanup(tag);
else throw new Error("usage: fork|old|new|compare|cleanup <tag> …");
