// The tracked files of a saved snapshot and their SHA-256, read through the
// SDK: what import-run.mjs writes to a scenario's final.json and what the
// final-tree check compares a run's main with. A tracked path is one the
// project's own .gitignore files do not exclude (Git decides, with
// `git check-ignore --no-index` over a scratch repository holding only those
// files); .git itself is never tracked. Ignored folders are not walked.
// A file is read in fs.read windows, and its SHA-256 is that of the text,
// which must have exactly the file's size; anything else (a binary file, a
// line too long for one reply) is reported as a problem, not hashed.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/** Every entry of `dir` in `ref`, page by page. */
export async function listAll(lf, ref, dir) {
  const items = [];
  for (let pos = 0; ;) {
    const page = await lf.fs.list(ref, dir, 1000, pos);
    items.push(...page.items);
    if (!page.hasMore) return items;
    pos += page.items.length;
  }
}

/** A file's whole text in `ref`, window by window: { text, size } or { problem }. */
export async function readAll(lf, ref, path) {
  let text = "", line = 1, size = 0;
  for (;;) {
    let r;
    try { r = await lf.fs.read(ref, path, line); } catch (error) {
      if (error.code === "Binary") return { problem: "binary" };
      throw error;
    }
    if (r.lineTruncated) return { problem: "a line longer than one reply" };
    text += r.text;
    size = r.size;
    if (r.nextLine == null) break;
    line = r.nextLine;
  }
  if (Buffer.byteLength(text) !== size) return { problem: `read ${Buffer.byteLength(text)} of ${size} bytes` };
  return { text, size };
}

/**
 * The tracked files of `ref` with their SHA-256 (symlinks: "symlink").
 * @returns {Promise<{ files: Record<string, string>, problems: Record<string, string> }>}
 */
export async function trackedHashes(lf, ref) {
  const scratch = mkdtempSync(join(tmpdir(), "lfs-ignore-"));
  const files = {}, problems = {};
  try {
    execFileSync("git", ["init", "-q", scratch]);
    const dirs = ["/"];
    while (dirs.length) {
      const dir = dirs.shift();
      const items = (await listAll(lf, ref, dir)).filter((item) => item.name !== ".git");
      const ignore = items.find((item) => item.name === ".gitignore" && item.type === "file");
      if (ignore) {
        const read = await readAll(lf, ref, ignore.path);
        if (read.problem) throw new Error(`${ignore.path}: ${read.problem}`);
        const target = join(scratch, ignore.path);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, read.text);
      }
      const ignored = ignoredOf(scratch, items.map((item) => item.path.slice(1) + (item.type === "dir" ? "/" : "")));
      for (const item of items) {
        if (ignored.has(item.path.slice(1) + (item.type === "dir" ? "/" : ""))) continue;
        if (item.type === "dir") dirs.push(item.path);
        else if (item.type === "symlink") files[item.path] = "symlink";
        else {
          const read = await readAll(lf, ref, item.path);
          if (read.problem) problems[item.path] = read.problem;
          else files[item.path] = createHash("sha256").update(read.text).digest("hex");
        }
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  return { files: sortKeys(files), problems };
}

/** Which of `paths` (relative, folders ending in /) the scratch repository's .gitignore files exclude. */
export function ignoredOf(scratch, paths) {
  if (!paths.length) return new Set();
  let out = "";
  try {
    out = execFileSync("git", ["-C", scratch, "check-ignore", "--no-index", "-z", "--stdin"], { input: paths.join("\0") + "\0", encoding: "utf8" });
  } catch (error) {
    // exit 1: none of the paths is ignored
    if (error.status !== 1) throw error;
    out = error.stdout ?? "";
  }
  return new Set(out.split("\0").filter(Boolean));
}

const sortKeys = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
