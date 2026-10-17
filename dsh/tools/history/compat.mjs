#!/usr/bin/env node
// REBUILD.md §4 compatibility test (#352): a Store written by an older binary
// opens and reads correctly with `daemon`. Run it on a diag fork of a snapshot
// that the older binary wrote (run.mjs fork). It plays range k's proof
// checkpoint with the whole tree: the changed paths, then every file's blob
// id and mode, compared with git at the range's checkpoint.
//   node dsh/tools/history/compat.mjs <run dir> <daemon> <k> <head of range k-1> <head of range k>
// The snapshot already holds the original checkpoint's chk-* Branches, so this
// test's check Branches are named compat-chk-*. Prints one JSON line and exits
// 1 when the checkpoint fails.
import { Run, verify, teardown } from "./lib.mjs";

const [dir, daemon, range, prevHead, head] = process.argv.slice(2);
if (!head) {
  console.error("usage: compat.mjs <run dir> <daemon> <k> <head of range k-1> <head of range k>");
  process.exit(2);
}
const run = new Run(dir);
run.manifest.env.LAYERFS_DAEMON = daemon;
await run.client();
const rename = (b) => (typeof b === "string" && b.startsWith("chk-") ? `compat-${b}` : b);
const { branch, sandbox } = run.lf;
const fork = branch.fork.bind(branch);
const mount = sandbox.mount.bind(sandbox);
branch.fork = (b, ...rest) => fork(rename(b), ...rest);
sandbox.mount = (sb, b, ...rest) => mount(sb, rename(b), ...rest);
const k = Number(range);
const started = performance.now();
let proof;
try {
  proof = await verify(run, k, {
    prevHead, head, layer: run.state.layer, prevCommit: run.plan(k - 1).checkpoint, full: true,
  });
} finally {
  await teardown(run);
}
const brief = (x) => x && Object.fromEntries(Object.entries(x).filter(([, v]) => !Array.isArray(v) || v.length < 5));
console.log(JSON.stringify({
  daemon, range: k, ok: proof.ok, ms: Math.round(performance.now() - started),
  paths: brief(proof.paths), ids: brief(proof.ids), tree: brief(proof.tree),
}));
process.exit(proof.ok ? 0 : 1);
