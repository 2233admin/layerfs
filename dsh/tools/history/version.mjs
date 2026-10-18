// The latest version as LayerFS shows it (REPORT_FORMAT.md §4): every file,
// folder and symlink under the Workspace (the probe fixture left out), their
// raw bytes, the node_modules share, the largest file and the folder with the
// most entries.
//
// The figures come from a manifest (path -> type, size), kept per range in the
// run folder. A full lstat walk builds it when there is no manifest for the
// previous range. Otherwise the range's diff_commits paths (verify's list, which
// includes node_modules and build output) are lstat-ed in one Workspace and
// applied to the previous manifest; the path list travels gzip+base64 in chunks
// like Sandbox file bytes, so no list is too large. At snapshots and milestones
// the full walk runs as well and must equal the incremental manifest exactly.
// Which path ran is returned (`how`) and shown in the report. lstat only: no
// file is read.
import { gzipSync, gunzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execAll, expectCall, Mismatch, scratchDir, setup } from "./lib.mjs";
import { pad, quote } from "./steps.mjs";

const PROBE = ".lfs-probe";
const CHUNK = 48_000;

/** Full walk: `t\tsize\tpath` per entry (t: f file, d dir, l symlink, x the probe fixture, not descended), gzip+base64. */
export const VERSION_WALK = `const fs=require("fs"),z=require("zlib");const out=[];const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=d==="."?e.name:d+"/"+e.name;if(p===${JSON.stringify(PROBE)}){out.push("x\\t0\\t"+p);continue}const s=fs.lstatSync(p);if(s.isSymbolicLink())out.push("l\\t"+s.size+"\\t"+p);else if(s.isDirectory()){out.push("d\\t0\\t"+p);walk(p)}else out.push("f\\t"+s.size+"\\t"+p)}};walk(".");process.stdout.write(z.gzipSync(out.join("\\n")).toString("base64")+"\\n")`;

/** lstat of the paths in a gzip+base64 file (argv[1]): `t\tsize\tpath`, `-` when absent; gzip+base64. */
export const VERSION_LSTAT = `const fs=require("fs"),z=require("zlib");const ps=z.gunzipSync(Buffer.from(fs.readFileSync(process.argv[1],"utf8").trim(),"base64")).toString().split("\\n").filter(Boolean);const out=[];for(const p of ps){let s;try{s=fs.lstatSync(p)}catch{out.push("-\\t0\\t"+p);continue}out.push((s.isSymbolicLink()?"l":s.isDirectory()?"d":"f")+"\\t"+(s.isDirectory()?0:s.size)+"\\t"+p)}process.stdout.write(z.gzipSync(out.join("\\n")).toString("base64")+"\\n")`;

/** A walk's or lstat's stdout as a Map path -> [t, size]. */
export function decodeEntries(stdout) {
  const text = gunzipSync(Buffer.from(String(stdout).trim().split("\n").at(-1), "base64")).toString();
  const out = new Map();
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [t, size, ...rest] = line.split("\t");
    out.set(rest.join("\t"), [t, Number(size)]);
  }
  return out;
}

/** The exec commands that lstat `paths`: the list in chunks into a scratch file, then the script. */
export function lstatCommands(paths, scratch = scratchDir()) {
  const b64 = gzipSync(paths.join("\n")).toString("base64");
  const commands = [`rm -rf ${scratch} && mkdir -p ${scratch}`];
  for (let at = 0; at < b64.length; at += CHUNK) commands.push(`printf %s ${quote(b64.slice(at, at + CHUNK))} >> ${scratch}/paths`);
  commands.push(`node -e ${quote(VERSION_LSTAT)} ${scratch}/paths; e=$?; rm -rf ${scratch}; exit $e`);
  commands.scratch = scratch;
  return commands;
}

/**
 * The paths to lstat for diff_commits items: each changed path without the
 * leading slash, and its ancestor folders, so a folder created or removed
 * with its files is seen whether or not diff_commits lists folders. The
 * probe fixture is left out.
 */
export function changedPaths(items) {
  const out = new Set();
  for (const i of items) {
    const p = String(i.path).replace(/^\/+/, "");
    if (!p || p === PROBE || p.startsWith(`${PROBE}/`)) continue;
    const parts = p.split("/");
    for (let n = 1; n <= parts.length; n++) out.add(parts.slice(0, n).join("/"));
  }
  return [...out].sort();
}

/** The previous manifest with the lstat results applied: absent paths and the descendants of anything no longer a folder are removed. */
export function applyEntries(prev, looked) {
  const next = new Map(prev);
  for (const [p, [t, size]] of looked) {
    if (t !== "d" && prev.get(p)?.[0] === "d") for (const q of [...next.keys()]) if (q.startsWith(`${p}/`)) next.delete(q);
    if (t === "-") next.delete(p);
    else next.set(p, [t, size]);
  }
  return next;
}

/** The version figures of a manifest. Ties go to the smallest path, so a walk and an update agree. */
export function statsOf(entries) {
  const o = { files: 0, dirs: 0, symlinks: 0, bytes: 0, nm: { files: 0, dirs: 0, symlinks: 0, bytes: 0 }, git: { files: 0, dirs: 0, symlinks: 0, bytes: 0 }, largestFile: { path: null, bytes: -1 }, largestDir: { path: ".", entries: -1 } };
  const children = new Map([[".", 0]]);
  const better = (n, p, best, key) => n > best[key] || (n === best[key] && best.path != null && p < best.path);
  for (const [p, [t, size]] of entries) {
    const parent = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : ".";
    children.set(parent, (children.get(parent) ?? 0) + 1);
    if (t === "x") continue;
    // `.git` (P3, GIT_RULE) is its own source, never node_modules or build
    const nm = p === ".git" || p.startsWith(".git/") ? o.git : p.split("/").includes("node_modules") ? o.nm : null;
    if (t === "d") { o.dirs++; if (nm) nm.dirs++; if (!children.has(p)) children.set(p, 0); continue; }
    if (t === "l") { o.symlinks++; o.bytes += size; if (nm) { nm.symlinks++; nm.bytes += size; } continue; }
    o.files++; o.bytes += size; if (nm) { nm.files++; nm.bytes += size; }
    if (better(size, p, o.largestFile, "bytes")) o.largestFile = { path: p, bytes: size };
  }
  for (const [p, n] of children) if (better(n, p, o.largestDir, "entries")) o.largestDir = { path: p, entries: n };
  return o;
}

/** First differences between two manifests, for a cross-check failure. */
export function manifestDiff(a, b, limit = 5) {
  const out = [];
  for (const [p, v] of a) if (!b.has(p) || b.get(p)[0] !== v[0] || b.get(p)[1] !== v[1]) out.push(`${p}: walk ${v.join(" ")}, update ${b.get(p)?.join(" ") ?? "absent"}`);
  for (const p of b.keys()) if (!a.has(p)) out.push(`${p}: walk absent, update ${b.get(p).join(" ")}`);
  return out.slice(0, limit);
}

const manifestFile = (run) => join(run.dir, "version", "manifest.json.gz");
function loadManifest(run) {
  const f = manifestFile(run);
  if (!existsSync(f)) return null;
  const { range, entries } = JSON.parse(gunzipSync(readFileSync(f)).toString());
  return { range, entries: new Map(entries.map(([p, t, s]) => [p, [t, s]])) };
}
function saveManifest(run, k, entries) {
  mkdirSync(join(run.dir, "version"), { recursive: true });
  const f = manifestFile(run);
  writeFileSync(`${f}.tmp`, gzipSync(JSON.stringify({ range: k, entries: [...entries].map(([p, [t, s]]) => [p, t, s]) })));
  renameSync(`${f}.tmp`, f);
}

/**
 * The version figures of the published `layer`, in one Workspace on a fork.
 * `items` are verify's diff_commits items from the previous checkpoint;
 * `crossCheck` (snapshot or milestone) also runs the full walk.
 * Returns the figures plus `how` and the number of paths looked at.
 */
export async function versionStats(run, k, layer, { items = null, crossCheck = false } = {}) {
  const sb = await setup(run), branch = `ver-r${pad(k)}`, label = `r${pad(k)}.version`;
  run.label(label);
  await expectCall(run, `${label} fork`, () => run.lf.branch.fork(branch, layer), "Forked");
  const ws = await expectCall(run, `${label} mount`, () => run.lf.sandbox.mount(sb, branch));
  try {
    const prev = loadManifest(run);
    const canUpdate = prev && prev.range === k - 1 && items;
    const walk = async () => {
      const r = await run.lf.sandbox.exec(sb, ws, `node -e ${quote(VERSION_WALK)}`);
      if (r.exitCode !== 0) throw new Mismatch(`${label} walk exited ${r.exitCode}: ${String(r.stderr ?? "").slice(0, 300)}`);
      return decodeEntries(r.stdout);
    };
    let entries, how, looked = 0;
    if (canUpdate) {
      const paths = changedPaths(items);
      looked = paths.length;
      let updated = prev.entries;
      if (paths.length) {
        const out = await execAll(run, sb, ws, lstatCommands(paths), `${label} lstat`, 0);
        updated = applyEntries(prev.entries, decodeEntries(out.at(-1).stdout));
      }
      if (crossCheck) {
        entries = await walk();
        const diff = manifestDiff(entries, updated);
        if (diff.length) throw new Mismatch(`${label}: the full walk differs from the incremental manifest: ${diff.join("; ")}`);
        how = "full: snapshot cross-check";
      } else { entries = updated; how = "incremental"; }
    } else {
      entries = await walk();
      how = `full: first (no manifest for range ${k - 1})`;
    }
    saveManifest(run, k, entries);
    return { ...statsOf(entries), how, looked };
  } finally {
    await run.lf.sandbox.unmount(sb, ws, true);
  }
}
