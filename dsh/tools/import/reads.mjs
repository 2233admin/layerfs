// What import-run.mjs reads from a recorded Store (issue #350), cached on disk:
// the history, each Commit's tracked changes and contents, and main's file
// hashes. Reading them through the SDK takes about ten minutes for Crew; the
// cache makes a re-import take seconds. The cache is keyed by the SHA-256 of
// the restored Store's files and of the code that derives these values (this
// file, checks/history.mjs and checks/tree.mjs), so a different Store or
// reader never hits it. It lives outside the repository (`cache=<dir>`);
// without one nothing is cached.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { historyOf } from "../checks/history.mjs";
import { readAll, trackedChanges, trackedHashes, trackedTree } from "../checks/tree.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const READER = ["import/reads.mjs", "checks/history.mjs", "checks/tree.mjs"].map((f) => join(here, "..", f));

/**
 * @param {object} store what restore-store.mjs printed
 * @param {string | undefined} cacheDir where the cache lives, or nothing
 * @param {() => { lf: object, operator: object }} open the reader SDK client, made only on a miss
 */
export async function storeReads(store, cacheDir, open) {
  let file = null, data = {}, dirty = false, client = null;
  if (cacheDir) {
    const hash = createHash("sha256");
    // restore-store.mjs puts the Store beside the home: <work>/<id>/{home,vol/global}
    const global = join(dirname(store.env.LAYERFS_HOME), "vol", "global");
    for (const name of ["store.sqlite", "store.sqlite-wal"]) if (existsSync(join(global, name))) hash.update(name).update(readFileSync(join(global, name)));
    for (const path of READER) hash.update(path.slice(dirname(here).length)).update(readFileSync(path));
    file = join(cacheDir, `${hash.digest("hex")}.json`);
    if (existsSync(file)) data = JSON.parse(readFileSync(file, "utf8"));
  }
  const sdk = () => (client ??= open());
  const cached = async (key, compute) => {
    if (!(key in data)) { data[key] = await compute(); dirty = true; }
    return data[key];
  };
  const trees = new Map(), treeOf = (ref) => { if (!trees.has(ref)) trees.set(ref, trackedTree(sdk().lf, ref)); return trees.get(ref); };

  const raw = await cached("history", async () => {
    const h = await historyOf(sdk().lf, sdk().operator);
    return { branches: h.branches, layers: h.layers, ids: [...h.ids], items: [...h.items] };
  });
  const history = { branches: raw.branches, layers: raw.layers, ids: new Map(raw.ids), items: new Map(raw.items) };
  const commits = new Map(await cached("commits", async () => {
    const { lf } = sdk(), out = [];
    for (const branch of await pages((s, p) => lf.project.list_branches(s, p))) {
      if (branch.name === "main") continue;
      for (const c of await pages((s, p) => lf.branch.list_commits(branch.name, s, p))) out.push([c.id, c]);
    }
    return out;
  }));
  /** A Commit's tracked changes: path, kind (Added, Modified, Removed) and type. */
  const tracked = (id) => cached(`tracked ${id}`, async () => {
    const commit = commits.get(id);
    return commit ? (await trackedChanges(sdk().lf, commit, treeOf)).map(({ path, kind, type }) => ({ path, kind, type })) : null;
  });
  /** A tracked file's text at a Commit, or the reader's problem with it. */
  const text = (id, path) => cached(`text ${id} ${path}`, async () => readAll(sdk().lf, id, path));
  /** main's tracked files by their bytes' SHA-256, hashed in a Workspace of the reader's own. */
  const final = () => cached("final", async () => trackedHashes(sdk().lf));
  const save = () => {
    if (!file || !dirty) return;
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(`${file}.tmp`, JSON.stringify(data));
    renameSync(`${file}.tmp`, file);
  };
  return { history, commits, tracked, text, final, save, close: async () => { if (client) await client.lf.close(); } };
}

async function pages(read) {
  const items = [];
  for (let pos = 0; ;) { const page = await read(1000, pos); items.push(...page.items); if (!page.hasMore) return items; pos += page.items.length; }
}
