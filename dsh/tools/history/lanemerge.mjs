// The native model of the lanes' merge for the repair's oracle (owner decision 2026-10-19, option A; fix 042):
// each lane point runs on the state the lanes forked from, its changes (tracked, ignored and untracked, any file
// or symlink it wrote with new content, any path it created or removed) are captured, the folder goes back to that
// state, and the captured changes are applied in the consolidation's merge order, as LayerFS merges each lane's
// Branch into main. Before this the native chain ran the lane points one on top of another in one folder, so a
// later lane's build could rewrite what an earlier lane changed (r018.a1: `core/session/lib/types/tool-pairing.*`).
// A path two lanes both changed takes the later-merged lane's version (the liaison's rule); the product's `/.lww`
// rule picks the newer modification time, which a sequential native run cannot reproduce, so every such path is
// counted and listed in the oracle (`twoSided`), never hidden.
// Runs inside the native chain's container (node, the folder at $PWD):
//   node lanemerge.mjs snapshot <dir> <base>          the lanes' starting state, copied with modes, links, times
//   node lanemerge.mjs mark <store>                     before a lane's states: the time its writes are newer than
//   node lanemerge.mjs capture <dir> <base> <store>     after them: its changes into <store>
//   node lanemerge.mjs restore <dir> <base> <store>     the folder back to <base> on the paths <store> names
//   node lanemerge.mjs apply <dir> <store>...           the captured changes in the order given (merge order)
import { execFileSync } from "node:child_process";
import { cpSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Every path under `dir` (relative), with its kind, link target and modification time; never follows a link. */
export function walk(dir) {
  const out = new Map(), stack = [""];
  while (stack.length) {
    const rel = stack.pop();
    for (const name of readdirSync(join(dir, rel))) {
      const p = rel ? `${rel}/${name}` : name, st = lstatSync(join(dir, p));
      if (st.isSymbolicLink()) out.set(p, { kind: "l", target: readlinkSync(join(dir, p)) });
      else if (st.isDirectory()) { out.set(p, { kind: "d" }); stack.push(p); }
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

const copyEntry = (from, to) => {
  rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  const st = lstatSync(from);
  if (st.isDirectory()) mkdirSync(to, { recursive: true, mode: st.mode });
  else cpSync(from, to, { verbatimSymlinks: true, preserveTimestamps: true });
};

export function capture(dir, base, store) {
  const since = Number(readFileSync(join(store, "since"), "utf8"));
  const c = changesOf(dir, base, since);
  for (const p of c.changed) copyEntry(join(dir, p), join(store, "files", p));
  writeFileSync(join(store, "changes.json"), JSON.stringify(c));
  return c;
}

/** The folder back to the base state on every path the capture names (deepest first, then the base's copies). */
export function restore(dir, base, store) {
  const c = JSON.parse(readFileSync(join(store, "changes.json"), "utf8"));
  for (const p of [...c.changed].sort().reverse()) rmSync(join(dir, p), { recursive: true, force: true });
  for (const p of [...c.changed, ...c.removed].sort()) {
    if (!existsLink(join(base, p))) continue;
    const st = lstatSync(join(base, p));
    if (st.isDirectory()) { if (!existsLink(join(dir, p))) cpSync(join(base, p), join(dir, p), { recursive: true, verbatimSymlinks: true, preserveTimestamps: true }); }
    else copyEntry(join(base, p), join(dir, p));
  }
}
const existsLink = (p) => { try { lstatSync(p); return true; } catch { return false; } };

/** The captured changes applied in the order given; returns the paths more than one capture changed. */
export function apply(dir, stores) {
  const seen = new Map(), twoSided = new Set();
  for (const store of stores) {
    const c = JSON.parse(readFileSync(join(store, "changes.json"), "utf8"));
    for (const p of c.removed) { rmSync(join(dir, p), { recursive: true, force: true }); if (seen.has(p)) twoSided.add(p); seen.set(p, store); }
    for (const p of c.changed) {
      const from = join(store, "files", p), st = lstatSync(from);
      if (st.isDirectory()) { if (!existsLink(join(dir, p)) || !lstatSync(join(dir, p)).isDirectory()) copyEntry(from, join(dir, p)); continue; }
      if (seen.has(p)) twoSided.add(p);
      seen.set(p, store);
      copyEntry(from, join(dir, p));
    }
  }
  return [...twoSided].sort();
}

function main([cmd, ...a]) {
  if (cmd === "snapshot") snapshot(a[0], a[1]);
  else if (cmd === "mark") mark(a[0]);
  else if (cmd === "capture") { const c = capture(a[0], a[1], a[2]); console.log(`@@lanecap ${a[2].split("/").pop()} ${c.changed.length} ${c.removed.length}`); }
  else if (cmd === "restore") restore(a[0], a[1], a[2]);
  else if (cmd === "apply") { const two = apply(a[0], a.slice(1)); console.log(`@@twosided ${two.length}`); for (const p of two.slice(0, 200)) console.log(`@@twopath ${p}`); }
  else { console.error("usage: lanemerge.mjs snapshot|mark|capture|restore|apply … (see the header)"); process.exit(2); }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
