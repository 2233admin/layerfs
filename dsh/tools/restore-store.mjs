// Restores a copy of a recorded run's stopped Store into a disposable LayerFS
// home and Docker volume, so import-run.mjs can read it through the SDK. The
// evidence originals are only read: the Store files are copied first.
//   node dsh/tools/restore-store.mjs <id> <folder with global/store.sqlite> <work dir> <project>
// Writes <work dir>/<id>/{home,vol}, makes the volume lfs347-src-<id>, and
// prints the environment for the reader SDK as JSON.
//
// The recorded Stores predate bb8fe890f (Init statistics added seven columns to
// store_totals), so today's daemon refuses them as Malformed. They are read with
// the product built at that commit's parent (LAYERFS_READER: a checkout of it
// with its SDK addon and Linux daemon built). A run's own project.record is
// private discovery material and is not always retained, so the record is made
// by sdk/js/native/examples/restore_record.rs from the Store's catalog binding.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const [id, source, work, project] = process.argv.slice(2);
const reader = process.env.LAYERFS_READER;
if (!id || !source || !work || !project || !reader) {
  console.error("usage: LAYERFS_READER=<checkout> restore-store.mjs <id> <folder with global/> <work dir> <project>");
  process.exit(2);
}
// RESTORE_IMAGE and RESTORE_VOLUME override the #347 defaults (#352 names its volumes layerfs-issue352-*)
const IMAGE = process.env.RESTORE_IMAGE || "sha256:091f785ba7d5d036dfa350e8fd69ee1fcd2d8320c3706841c8c95e6411eee9d2";
const RECORD = resolve(new URL("../../core/target/debug/examples/restore_record", import.meta.url).pathname);
const root = resolve(work, id), home = join(root, "home"), vol = join(root, "vol", "global");
if (existsSync(root)) throw new Error(`${root} exists; restore into a new folder`);
mkdirSync(join(home, project), { recursive: true, mode: 0o700 });
mkdirSync(vol, { recursive: true });
for (const file of readdirSync(join(source, "global"))) {
  if (/^store\.sqlite(-wal|-shm)?$/.test(file)) copyFileSync(join(source, "global", file), join(vol, file));
}

// immutable: the copy is in WAL mode, and a read-only open would need to make its -shm
const sql = (query) => execFileSync("sqlite3", [`file:${join(vol, "store.sqlite")}?mode=ro&immutable=1`, query], { encoding: "utf8" }).trim();
const binding = sql("select hex(binding_key) from history_meta");
const stack = sql("select hex(layer_stack_id) from layer_stack");
const branch = sql("select hex(branch_id) from branch where name='main'");
const genesis = sql("select hex(root_id) from layer where parent_layer_id is null");
// the record says the Store is installed, so its sealed file is never read
execFileSync(RECORD, [home, project, binding, stack, branch, genesis, "1", "3.51.0", "3.51.0"], { stdio: ["ignore", "ignore", "inherit"] });

const volume = process.env.RESTORE_VOLUME || `lfs347-src-${id}`;
execFileSync("docker", ["volume", "create", volume], { stdio: "ignore" });
execFileSync("docker", ["run", "--rm", "-v", `${volume}:/v`, "-v", `${join(root, "vol")}:/src:ro`, "--entrypoint", "sh", IMAGE, "-c", "cp -R /src/. /v/ && chown -R 0:0 /v && chmod 755 /v && chmod 700 /v/global && chmod 600 /v/global/*"], { stdio: "inherit" });

console.log(JSON.stringify({
  project,
  sdk: join(reader, "sdk/js/src/index.js"),
  env: {
    LAYERFS_HOME: home,
    LAYERFS_VOLUME: volume,
    LAYERFS_IMAGE: IMAGE,
    LAYERFS_DAEMON: join(reader, "core/target/cluster2-linux/release/layerfs-daemon"),
    LAYERFS_NATIVE: join(reader, "sdk/js/native/layerfs.node"),
    LAYERFS_CONSTRUCTION_WORKERS: "1",
  },
}, null, 2));
