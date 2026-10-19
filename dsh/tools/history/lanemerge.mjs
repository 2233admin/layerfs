// The native model of the lanes' merge for the repair's oracle (owner decision 2026-10-19, option A; fix 042):
// each lane point runs on the state the lanes forked from, its changes (tracked, ignored and untracked, any file
// or symlink it wrote with new content, any path it created or removed) are captured, the folder goes back to that
// state, and the captured changes are applied in the lanes' recorded write order (owner option 1, after range 18
// a3: each lane's last exec end in the play), so a path two lanes both changed takes the newest writer's version,
// as the product's `/.lww` does (`layerfs-content/src/merge/lww.rs`: newer modification time, ours on a tie).
// Before this the native chain ran the lane points one on top of another in one folder, so a later lane's build
// could rewrite what an earlier lane changed (r018.a1: `core/session/lib/types/tool-pairing.*`). Every two-sided
// path is counted and listed in the oracle (`twoSided`).
// Runs inside the native chain's container (node, the folder at $PWD):
//   node lanemerge.mjs snapshot <dir> <base>          the lanes' starting state, copied with modes, links, times
//   node lanemerge.mjs mark <store>                     before a lane's states: the time its writes are newer than
//   node lanemerge.mjs capture <dir> <base> <store>     after them: its changes into <store>
//   node lanemerge.mjs restore <dir> <base> <store>     the folder back to <base> on the paths <store> names
//   node lanemerge.mjs apply <dir> <store>...           the captured changes in the order given (write order)
// The F-057 merge-units diagnostic (#352 fix 050) adds `--units <file>` (JSON, `branch.merge`'s units) to capture,
// restore and apply: capture also counts each unit's changed paths and latest write as merge/units.rs does, restore
// sets directory times back to the base's, and apply takes a unit two lanes changed whole from the later writer.
import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, cpSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { lwwMatch, parseRules } from "./globrules.mjs";

/** Every path under `dir` (relative), with its kind, link target and modification time; never follows a link. */
export function walk(dir) {
  const out = new Map(), stack = [""];
  while (stack.length) {
    const rel = stack.pop();
    for (const name of readdirSync(join(dir, rel))) {
      const p = rel ? `${rel}/${name}` : name, st = lstatSync(join(dir, p));
      if (st.isSymbolicLink()) out.set(p, { kind: "l", target: readlinkSync(join(dir, p)), mtimeMs: st.mtimeMs, mode: st.mode });
      else if (st.isDirectory()) { out.set(p, { kind: "d", mtimeMs: st.mtimeMs, mode: st.mode }); stack.push(p); }
      else out.set(p, { kind: "f", mtimeMs: st.mtimeMs, size: st.size, mode: st.mode });
    }
  }
  return out;
}

export function snapshot(dir, base) {
  rmSync(base, { recursive: true, force: true });
  execFileSync("cp", ["-a", dir, base]);
}

export function mark(store) {
  rmSync(store, { recursive: true, force: true });
  mkdirSync(join(store, "files"), { recursive: true });
  writeFileSync(join(store, "since"), String(Date.now()));
}

/**
 * A lane's changes against `base`: created paths, removed paths and files or links with other content (a file
 * written since the mark with the same bytes and mode is no change, as in a content-addressed Store).
 */
export function changesOf(dir, base, sinceMs) {
  const now = walk(dir), was = walk(base), changed = [];
  for (const [p, e] of now) {
    const b = was.get(p);
    if (!b || b.kind !== e.kind) changed.push(p);
    else if (e.kind === "l" && e.target !== b.target) changed.push(p);
    else if (e.kind === "f" && e.mtimeMs >= sinceMs - 1 && (e.size !== b.size || e.mode !== b.mode || !readFileSync(join(dir, p)).equals(readFileSync(join(base, p))))) changed.push(p);
  }
  // a removed folder's contents are removed with it: keep the topmost removed path only
  const gone = [...was.keys()].filter((p) => !now.has(p)).sort();
  const removed = gone.filter((p) => { const i = p.lastIndexOf("/"); return i < 0 || now.has(p.slice(0, i)); });
  return { changed: changed.sort(), removed };
}

/** One entry copied as it is: a link as the same link (never followed: pnpm links folders), a file with its mode and times. */
const copyEntry = (from, to) => {
  rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  const st = lstatSync(from);
  if (st.isSymbolicLink()) symlinkSync(readlinkSync(from), to);
  else if (st.isDirectory()) mkdirSync(to, { recursive: true, mode: st.mode & 0o7777 });
  else { copyFileSync(from, to); chmodSync(to, st.mode & 0o7777); utimesSync(to, st.atime, st.mtime); }
};

export function capture(dir, base, store, units = null) {
  const since = Number(readFileSync(join(store, "since"), "utf8"));
  const c = changesOf(dir, base, since);
  for (const p of c.changed) copyEntry(join(dir, p), join(store, "files", p));
  if (units) c.units = unitChanges(dir, base, units);
  writeFileSync(join(store, "changes.json"), JSON.stringify(c));
  return c;
}

/** Each unit's rules (globrules.mjs) and the first listed unit covering a path (merge/units.rs `unit_of`; the root is in none). */
export const unitRules = (units) => units.map((u) => (typeof u === "string" ? { name: u, rules: parseRules(u) } : { name: u.name, rules: parseRules(u.patterns.join("\n")) }));
export const unitOf = (rules, p) => (p ? rules.findIndex((u) => lwwMatch(u.rules, p)) : -1);

/**
 * One lane's changes per unit, as merge/units.rs classifies a side: every path in the unit that differs from the
 * base (added, removed, kind, link target, file bytes, mode or mtime; a directory by its own mtime or mode), and
 * the latest write among them (a removed path takes its nearest surviving parent's mtime).
 */
export function unitChanges(dir, base, units) {
  const rules = unitRules(units), now = walk(dir), was = walk(base), out = rules.map((u) => ({ unit: u.name, changed: 0, latest: null }));
  const note = (i, ms) => { out[i].changed++; if (ms != null && (out[i].latest == null || ms > out[i].latest)) out[i].latest = ms; };
  for (const [p, e] of now) {
    const i = unitOf(rules, p);
    if (i < 0) continue;
    const b = was.get(p);
    // times within a millisecond: the restores set times from Dates (utimesSync), which round the finer digits
    const differs = !b || b.kind !== e.kind || e.mode !== b.mode || Math.abs(e.mtimeMs - b.mtimeMs) >= 1 || (e.kind === "l" && e.target !== b.target)
      || (e.kind === "f" && (e.size !== b.size || !readFileSync(join(dir, p)).equals(readFileSync(join(base, p)))));
    if (differs) note(i, e.mtimeMs);
  }
  for (const p of was.keys()) {
    if (now.has(p)) continue;
    const i = unitOf(rules, p);
    if (i < 0) continue;
    let q = p;
    do { const at = q.lastIndexOf("/"); q = at < 0 ? "" : q.slice(0, at); } while (q && !now.has(q));
    note(i, lstatSync(join(dir, q || ".")).mtimeMs);
  }
  return out;
}

/** The folder back to the base state on every path the capture names (deepest first, then the base's copies). */
export function restore(dir, base, store, units = null) {
  const c = JSON.parse(readFileSync(join(store, "changes.json"), "utf8"));
  for (const p of [...c.changed].sort().reverse()) rmSync(join(dir, p), { recursive: true, force: true });
  for (const p of [...c.changed, ...c.removed].sort()) {
    if (!existsLink(join(base, p))) continue;
    const st = lstatSync(join(base, p));
    if (st.isDirectory()) { if (!existsLink(join(dir, p))) cpSync(join(base, p), join(dir, p), { recursive: true, verbatimSymlinks: true, preserveTimestamps: true }); }
    else copyEntry(join(base, p), join(dir, p));
  }
  // units mode: a lane classifies a unit by every path's time, so the folders the restore touched get the base's back
  if (units) {
    const dirs = new Set();
    for (const p of [...c.changed, ...c.removed]) for (let q = p; q; ) { dirs.add(q); const at = q.lastIndexOf("/"); q = at < 0 ? "" : q.slice(0, at); }
    for (const q of [...dirs].sort().reverse()) {
      if (!existsLink(join(base, q)) || !existsLink(join(dir, q))) continue;
      const st = lstatSync(join(base, q));
      if (st.isDirectory() && lstatSync(join(dir, q)).isDirectory()) utimesSync(join(dir, q), st.atime, st.mtime);
    }
    const st = lstatSync(base);
    utimesSync(dir, st.atime, st.mtime);
  }
}
const existsLink = (p) => { try { lstatSync(p); return true; } catch { return false; } };

/**
 * The units mode's decisions (merge/units.rs `decide_units`): a unit two or more captures changed comes whole from
 * the one with the latest write, the earlier in `stores` (write order) on a tie; the others' changes in it drop.
 */
export function decideUnits(units, changes) {
  return units.map((u, i) => {
    const sides = changes.map((c, n) => ({ n, ...(c.units?.[i] ?? { changed: 0, latest: null }) })).filter((s) => s.changed > 0);
    if (sides.length < 2) return null;
    const kept = sides.reduce((a, b) => ((b.latest ?? -Infinity) > (a.latest ?? -Infinity) ? b : a));
    return { unit: typeof u === "string" ? u : u.name, index: i, kept: kept.n, keptTime: kept.latest == null ? null : new Date(kept.latest).toISOString(),
      changed: changes.map((c) => c.units?.[i]?.changed ?? 0), dropped: sides.filter((s) => s.n !== kept.n).reduce((t, s) => t + s.changed, 0) };
  }).filter(Boolean);
}

/** The captured changes applied in the order given; returns the paths more than one capture changed (and the units decided). */
export function apply(dir, stores, units = null) {
  const seen = new Map(), twoSided = new Set();
  const changes = stores.map((store) => JSON.parse(readFileSync(join(store, "changes.json"), "utf8")));
  const decided = units ? decideUnits(units, changes) : [], rules = units ? unitRules(units) : null;
  const lost = (n, p) => { if (!rules) return false; const i = unitOf(rules, p); return decided.some((d) => d.index === i && d.kept !== n); };
  for (const [n, store] of stores.entries()) {
    const c = changes[n];
    for (const p of c.removed) { if (lost(n, p)) continue; rmSync(join(dir, p), { recursive: true, force: true }); if (seen.has(p)) twoSided.add(p); seen.set(p, store); }
    for (const p of c.changed) {
      if (lost(n, p)) continue;
      const from = join(store, "files", p), st = lstatSync(from);
      if (st.isDirectory()) { if (!existsLink(join(dir, p)) || !lstatSync(join(dir, p)).isDirectory()) copyEntry(from, join(dir, p)); continue; }
      if (seen.has(p)) twoSided.add(p);
      seen.set(p, store);
      copyEntry(from, join(dir, p));
    }
  }
  const out = [...twoSided].sort();
  return units ? Object.assign(out, { units: decided }) : out;
}

function main([cmd, ...rest]) {
  // `--units <file>` (the F-057 diagnostic) right after the command
  const units = rest[0] === "--units" ? JSON.parse(readFileSync(rest[1], "utf8")) : null, a = units ? rest.slice(2) : rest;
  if (cmd === "snapshot") snapshot(a[0], a[1]);
  else if (cmd === "mark") mark(a[0]);
  else if (cmd === "capture") { const c = capture(a[0], a[1], a[2], units); console.log(`@@lanecap ${a[2].split("/").pop()} ${c.changed.length} ${c.removed.length}`); }
  else if (cmd === "restore") restore(a[0], a[1], a[2], units);
  else if (cmd === "apply") {
    const two = apply(a[0], a.slice(1), units);
    console.log(`@@twosided ${two.length}`); for (const p of two.slice(0, 200)) console.log(`@@twopath ${p}`);
    for (const d of two.units ?? []) console.log(`@@unit ${JSON.stringify({ ...d, keptStore: a.slice(1)[d.kept].split("/").pop() })}`);
  }
  else { console.error("usage: lanemerge.mjs snapshot|mark|capture|restore|apply … (see the header)"); process.exit(2); }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
