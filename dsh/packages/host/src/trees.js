// Saved trees for the Files pane: a Commit's or Layer's entries with file text,
// read through one SDK client per project. Saved ids never change, so a tree
// is read once and kept; the client (and its service Sandbox) is released
// after a quiet minute. Large trees are cut short and say so.
import { clientFor, release } from "./layerfs-client.js";

const IDLE_MS = 60_000;
const KEEP_TREES = 32;
const MAX_ENTRIES = 4000;
const MAX_FILE = 128 * 1024;
const MAX_TOTAL = 8 * 1024 * 1024;
const PAGE = 200;
/** Directories listed but not entered: dependencies, builds, version control. */
const SKIP = new Set(["node_modules", ".git", ".next", "dist", "build"]);

export const isSavedId = (ref) => typeof ref === "string" && /^[0-9a-f]{64,68}$/.test(ref);

export class TreeReader {
  /** @param {object} spec @param {(project: object) => Promise<object>} [open] a project's SDK client */
  constructor(spec, open = (project) => clientFor(spec, project)) {
    this.spec = spec;
    this.open = open;
    /** project name -> { client: Promise, users, timer } */
    this.clients = new Map();
    /** `${project}\n${ref}` -> Promise<{ tree, partial }> */
    this.trees = new Map();
  }

  /** The tree of a saved id in a project; a failed read is not kept. */
  read(project, ref) {
    const key = `${project.name}\n${ref}`;
    if (this.trees.has(key)) {
      const kept = this.trees.get(key);
      this.trees.delete(key);
      this.trees.set(key, kept);
      return kept;
    }
    const reading = this.use(project, (client) => walk(client.layerfs, ref));
    this.trees.set(key, reading);
    reading.catch(() => this.trees.delete(key));
    while (this.trees.size > KEEP_TREES) this.trees.delete(this.trees.keys().next().value);
    return reading;
  }

  async use(project, fn) {
    let entry = this.clients.get(project.name);
    if (!entry) {
      entry = { client: this.open(project), users: 0, timer: null };
      this.clients.set(project.name, entry);
      entry.client.catch(() => { if (this.clients.get(project.name) === entry) this.clients.delete(project.name); });
    }
    clearTimeout(entry.timer);
    entry.users++;
    try {
      return await fn(await entry.client);
    } finally {
      if (--entry.users === 0) {
        entry.timer = setTimeout(() => this.drop(project.name, entry), IDLE_MS);
        entry.timer.unref?.();
      }
    }
  }

  async drop(name, entry) {
    if (this.clients.get(name) !== entry || entry.users) return;
    this.clients.delete(name);
    await release(await entry.client).catch(() => {});
  }

  /** Releases every client; runs with the plugin fiber. */
  async dispose() {
    const entries = [...this.clients.entries()];
    this.clients.clear();
    for (const [, entry] of entries) {
      clearTimeout(entry.timer);
      await entry.client.then(release).catch(() => {});
    }
  }
}

/** Every entry under `/` of a saved id, within the bounds above. */
async function walk(layerfs, ref) {
  const tree = {}, dirs = ["/"], notes = new Set();
  let entries = 0, total = 0;
  while (dirs.length) {
    const dir = dirs.shift();
    let position = 0;
    do {
      const page = await layerfs.fs.list(ref, dir, PAGE, position);
      for (const item of page.items) {
        if (++entries > MAX_ENTRIES) { notes.add(`only the first ${MAX_ENTRIES} entries are shown`); return done(tree, notes); }
        const name = item.path.slice(item.path.lastIndexOf("/") + 1);
        if (item.type === "dir") {
          tree[item.path] = { type: "dir", inode: item.inode };
          if (SKIP.has(name)) notes.add(`${name} folders are not opened`);
          else dirs.push(item.path);
          continue;
        }
        if (item.type !== "file") { tree[item.path] = { type: "file", inode: item.inode, content: `→ ${item.type}` }; continue; }
        if (total >= MAX_TOTAL) { tree[item.path] = { type: "file", inode: item.inode, content: null }; notes.add("text past 8 MB in all is not shown"); continue; }
        const content = await text(layerfs, ref, item.path);
        if (content.length > MAX_FILE) notes.add("files over 128 KB are cut short");
        tree[item.path] = { type: "file", inode: item.inode, content: content.length > MAX_FILE ? `${content.slice(0, MAX_FILE)}\n[cut at 128 KB]\n` : content };
        total += Math.min(content.length, MAX_FILE);
      }
      position = page.hasMore ? position + page.items.length : null;
    } while (position !== null);
  }
  return done(tree, notes);
}

const done = (tree, notes) => ({ tree, partial: notes.size ? `Partial tree: ${[...notes].join("; ")}.` : null });

async function text(layerfs, ref, path) {
  let content = "", nextLine = 1;
  do {
    const window = await layerfs.fs.read(ref, path, nextLine);
    if (window.text == null) return `(${window.size} bytes, binary)`;
    content += window.text;
    if (window.lineTruncated) content += "\n[huge-line remainder omitted]\n";
    nextLine = content.length > MAX_FILE ? null : window.nextLine;
  } while (nextLine !== null);
  return content;
}
