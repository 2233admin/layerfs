// Git access for the history replay (#352): a read-only bare clone of dsh,
// never the owner's checkout. Raw diffs and trees are parsed from git's own
// output; file contents come from one long-lived `git cat-file --batch`
// process (BlobCache), so a step costs a pipe round trip, not a process.
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const ZERO = "0000000000000000000000000000000000000000";

/** Runs git against `repo` (a bare clone) and returns stdout as text. */
export function git(repo, args, input) {
  return execFileSync("git", ["--git-dir", repo, "-c", "core.quotePath=false", ...args], {
    encoding: "utf8", maxBuffer: 1 << 30, input,
  });
}

/** Git's C-style path quoting undone: "a\tb" and octal UTF-8 bytes. */
export function unquote(path) {
  if (!path.startsWith('"')) return path;
  const bytes = [];
  const body = path.slice(1, -1);
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c !== "\\") { bytes.push(...Buffer.from(c)); continue; }
    const n = body[++i];
    if (/[0-7]/.test(n)) { bytes.push(parseInt(body.slice(i, i + 3), 8)); i += 2; continue; }
    bytes.push({ t: 9, n: 10, r: 13, a: 7, b: 8, f: 12, v: 11 }[n] ?? n.charCodeAt(0));
  }
  return Buffer.from(bytes).toString("utf8");
}

/**
 * One `--raw` line as a change: `:old new oldBlob newBlob status\tpath`.
 * Gitlinks (mode 160000) come back with `gitlink: true`; the replay skips them.
 */
export function parseRaw(line) {
  const tab = line.indexOf("\t");
  const [oldMode, newMode, oldBlob, newBlob, status] = line.slice(1, tab).split(" ");
  const path = unquote(line.slice(tab + 1));
  const change = { path, status: status[0], oldMode, mode: newMode, oldBlob, blob: newBlob };
  if (oldMode === "160000" || newMode === "160000") change.gitlink = true;
  return change;
}

/** Every commit reachable from `ref`: id, tree, parents and (non-merge) its raw diff. */
export function readCommits(repo, ref) {
  const out = git(repo, ["log", "--format=@%H %T %P", "--raw", "--no-renames", "--no-abbrev", "--root", ref]);
  const commits = new Map();
  let cur = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("@")) {
      const [id, tree, ...parents] = line.slice(1).split(" ").filter(Boolean);
      cur = { id, tree, parents, changes: [] };
      commits.set(id, cur);
    } else if (line.startsWith(":") && cur) cur.changes.push(parseRaw(line));
  }
  return commits;
}

/** Commits in topological order, oldest first: id -> position. */
export function topoPositions(repo, ref) {
  const ids = git(repo, ["rev-list", "--topo-order", "--reverse", ref]).trim().split("\n");
  return new Map(ids.map((id, i) => [id, i]));
}

/** Net change between two commits (or the empty tree when `from` is null). */
export function diffTrees(repo, from, to) {
  const args = from ? ["diff-tree", "-r", "--raw", "--no-renames", "--no-abbrev", from, to]
    : ["diff-tree", "-r", "--raw", "--no-renames", "--no-abbrev", "--root", to];
  return git(repo, args).split("\n").filter((l) => l.startsWith(":")).map(parseRaw);
}

/** A tree's files: path -> { mode, blob }. Gitlinks are left out and counted. */
export function lsTree(repo, treeish) {
  const files = new Map();
  let gitlinks = 0;
  for (const line of git(repo, ["ls-tree", "-r", "--full-tree", treeish]).split("\n")) {
    if (!line) continue;
    const tab = line.indexOf("\t");
    const [mode, type, blob] = line.slice(0, tab).split(" ");
    if (type === "commit") { gitlinks++; continue; }
    files.set(unquote(line.slice(tab + 1)), { mode, blob });
  }
  return { files, gitlinks };
}

/**
 * The paths among `paths` that `commit`'s own .gitignore files ignore (fix 058, r038 a1): git's check-ignore over
 * a scratch repository holding only those .gitignore files, so git's own rules (directory patterns, negations,
 * nested files) decide. Paths need not exist.
 */
export function gitIgnored(repo, commit, paths) {
  if (!paths.length) return [];
  const rules = [...lsTree(repo, commit).files].filter(([p]) => p === ".gitignore" || p.endsWith("/.gitignore"));
  if (!rules.length) return [];
  const dir = mkdtempSync(join(tmpdir(), "lfs352-ignore-"));
  try {
    execFileSync("git", ["init", "-q", dir]);
    for (const [p, { blob }] of rules) {
      mkdirSync(dirname(join(dir, p)), { recursive: true });
      writeFileSync(join(dir, p), execFileSync("git", ["--git-dir", repo, "cat-file", "blob", blob], { maxBuffer: 1 << 26 }));
    }
    const r = spawnSync("git", ["-C", dir, "check-ignore", "--no-index", "--stdin", "-z"], { input: `${paths.join("\0")}\0`, maxBuffer: 1 << 30 });
    if (r.status === 1) return [];
    if (r.status !== 0) throw new Error(`git check-ignore exit ${r.status}: ${String(r.stderr).slice(0, 300)}`);
    return String(r.stdout).split("\0").filter(Boolean);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

/** Sizes of many blobs in one `--batch-check` call: id -> bytes (missing -> absent). */
export function blobSizes(repo, ids) {
  const sizes = new Map();
  const unique = [...new Set(ids)].filter((id) => id && id !== ZERO);
  for (let i = 0; i < unique.length; i += 50_000) {
    const out = git(repo, ["cat-file", "--batch-check"], unique.slice(i, i + 50_000).join("\n") + "\n");
    for (const line of out.split("\n")) {
      const [id, type, size] = line.split(" ");
      if (type === "blob") sizes.set(id, Number(size));
    }
  }
  return sizes;
}

/** Git's blob id of `bytes`: how a replayed file is compared with the oracle. */
export function blobId(bytes) {
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

/**
 * Brings `dir` to `commit` with one working tree that moves forward range by
 * range: git rewrites only the files that differ, so a range costs its diff.
 */
export function checkout(repo, dir, commit) {
  mkdirSync(dir, { recursive: true });
  execFileSync("git", ["--git-dir", repo, "--work-tree", dir, "checkout", "-f", "-q", "--detach", commit], { stdio: "inherit" });
}

/**
 * File contents by blob id from one `git cat-file --batch` process, with a
 * small LRU of recent blobs (a file written by several steps is read once).
 */
export class BlobCache {
  constructor(repo, { maxBytes = 64 << 20 } = {}) {
    this.child = spawn("git", ["--git-dir", repo, "cat-file", "--batch"], { stdio: ["pipe", "pipe", "inherit"] });
    this.pending = [];
    this.buf = Buffer.alloc(0);
    this.lru = new Map();
    this.bytes = 0;
    this.maxBytes = maxBytes;
    this.child.stdout.on("data", (chunk) => { this.buf = Buffer.concat([this.buf, chunk]); this.drain(); });
  }

  drain() {
    while (this.pending.length) {
      const nl = this.buf.indexOf(10);
      if (nl < 0) return;
      const header = this.buf.subarray(0, nl).toString();
      const [id, type, size] = header.split(" ");
      const p = this.pending[0];
      if (type === "missing") { this.buf = this.buf.subarray(nl + 1); this.pending.shift(); p.reject(new Error(`blob ${id} missing`)); continue; }
      const n = Number(size);
      if (this.buf.length < nl + 1 + n + 1) return;
      const body = Buffer.from(this.buf.subarray(nl + 1, nl + 1 + n));
      this.buf = this.buf.subarray(nl + 1 + n + 1);
      this.pending.shift();
      if (type !== "blob") { p.reject(new Error(`${id} is a ${type}`)); continue; }
      this.remember(id, body);
      p.resolve(body);
    }
  }

  remember(id, body) {
    if (body.length > this.maxBytes / 4) return;
    this.lru.set(id, body);
    this.bytes += body.length;
    for (const [k, v] of this.lru) {
      if (this.bytes <= this.maxBytes) break;
      this.lru.delete(k);
      this.bytes -= v.length;
    }
  }

  /** The bytes of blob `id`. */
  get(id) {
    const hit = this.lru.get(id);
    if (hit) { this.lru.delete(id); this.lru.set(id, hit); return Promise.resolve(hit); }
    return new Promise((resolve, reject) => {
      this.pending.push({ resolve, reject });
      this.child.stdin.write(id + "\n");
    });
  }

  close() { this.child.stdin.end(); }
}
