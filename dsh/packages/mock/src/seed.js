// A replayed demo's seed: the folder its recorded run's Init imported, kept
// in the scenario as seed.json (dsh/tools/import-run.mjs writes it) because
// Git cannot hold some of it (a `.git` folder) and it keeps exact modes. Play
// Inits the demo's project from the folder seedFolder() writes it to:
//   { format: "layerfs-demo-seed", version: 1, sha256, entries: { "/path":
//     { type: "dir", mode } | { type: "file", mode, text | base64 } | { type: "symlink", target } } }
// The folder is <dir>/<scenario>-<first 12 of sha256>, written once; a
// second call finds it complete by the marker file beside it.
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * @param {string} file the scenario's seed.json
 * @param {string} dir where seed folders are kept
 * @param {string} name the scenario's id
 * @returns {string} the seed folder
 */
export function seedFolder(file, dir, name) {
  const seed = JSON.parse(readFileSync(file, "utf8"));
  if (seed.format !== "layerfs-demo-seed" || seed.version !== 1 || typeof seed.sha256 !== "string") throw new Error(`${file} is not a demo seed`);
  const folder = join(dir, `${name}-${seed.sha256.slice(0, 12)}`), done = `${folder}.done`;
  if (existsSync(done)) return folder;
  const temp = `${folder}.${process.pid}.tmp`;
  rmSync(temp, { recursive: true, force: true });
  mkdirSync(temp, { recursive: true, mode: 0o755 });
  const entries = Object.entries(seed.entries);
  for (const [path, entry] of entries) {
    if (!path.startsWith("/") || path.split("/").includes("..")) throw new Error(`${file}: ${path} is not a path in the seed`);
    const target = join(temp, path);
    mkdirSync(dirname(target), { recursive: true });
    if (entry.type === "dir") mkdirSync(target, { recursive: true });
    else if (entry.type === "symlink") symlinkSync(entry.target, target);
    else if (entry.type === "file") writeFileSync(target, entry.base64 !== undefined ? Buffer.from(entry.base64, "base64") : entry.text);
    else throw new Error(`${file}: ${path} has type ${entry.type}`);
  }
  // modes last, deepest first, so a read-only folder does not stop its own writes
  for (const [path, entry] of entries.sort(([a], [b]) => b.length - a.length)) if (entry.type !== "symlink") chmodSync(join(temp, path), entry.mode);
  rmSync(folder, { recursive: true, force: true });
  renameSync(temp, folder);
  writeFileSync(done, `${seed.sha256}\n`);
  return folder;
}
