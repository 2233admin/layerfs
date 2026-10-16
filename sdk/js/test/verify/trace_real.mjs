// One real trace check on a Disposable Store: with only the DSH_ names set,
// a fork, mount, exec, background process, commit and merge write start and
// end lines that carry their result ids and no file content.
//   LAYERFS_DAEMON=<linux daemon> node sdk/js/test/verify/trace_real.mjs <trace file>
import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { setup, teardown, mount, sh, unmount } from "./lib.mjs";

const file = process.argv[2];
if (!file) throw new Error("usage: trace_real.mjs <trace file>");
rmSync(file, { force: true });
for (const name of ["LAYERFS_TRACE", "LAYERFS_TRACE_STEP", "LAYERFS_TRACE_START"]) delete process.env[name];
Object.assign(process.env, { DSH_LAYERFS_TRACE: file, DSH_LAYERFS_TRACE_START: "1", DSH_LAYERFS_TRACE_STEP: "call_real" });
const ctx = await setup("trace", { project: `trace-${Date.now().toString(36)}` });
const { layerfs } = ctx;
let problems = [];
try {
  await layerfs.project.init(ctx.source);
  await layerfs.branch.fork("feature");
  const sandbox = await layerfs.sandbox.create("trace-box", layerfs.projectName, ctx.deploy.image);
  const ws = await mount(ctx, sandbox, "feature");
  await sh(ctx, ws, "printf 'SECRET-%s\\n' CONTENT > note.txt && cat note.txt; exit 3").catch(() => {});
  const proc = await sh(ctx, ws, "sleep 30", { background: true });
  await ctx.operator.process.cancel(sandbox, proc.process);
  await layerfs.sandbox.commit(sandbox, ws.path, "Add note");
  await unmount(ctx, ws);
  await layerfs.branch.fork("other");
  await layerfs.fs.write("other", "/other.txt", "SECRET-CONTENT\n", "Other");
  await layerfs.branch.merge("feature", "other", "joined", "Join");
} finally {
  problems = await teardown(ctx);
}
const text = readFileSync(file, "utf8");
const lines = text.trimEnd().split("\n").map((line) => JSON.parse(line));
const end = (method) => lines.find((line) => line.phase === "end" && line.method === method);
for (const line of lines) assert.equal(line.step, "call_real");
assert.equal(lines.filter((l) => l.phase === "start").length, lines.filter((l) => l.phase === "end").length);
assert.ok(!text.includes("SECRET-CONTENT"), "no file content or exec output");
const fork = end("branch.fork");
assert.equal(fork.branch, "feature");
assert.match(fork.base, /^[0-9a-f]{64,}$/);
const create = end("sandbox.create");
assert.equal(create.sandbox, "trace-box");
const mounted = end("sandbox.mount");
assert.equal(mounted.sandbox, create.sandbox);
assert.match(mounted.path, /^\//);
assert.equal(mounted.branch, "feature");
assert.match(mounted.baseLayer, /^[0-9a-f]{64,}$/);
assert.equal(end("sandbox.exec").exitCode, 3);
assert.match(end("operator.process.start").process, /^proc_/);
const merge = end("branch.merge");
assert.equal(merge.branch, "joined");
assert.equal(merge.head, merge.commit);
console.log(JSON.stringify({ lines: lines.length, problems, fork: { branch: fork.branch, base: fork.base.slice(0, 12), head: fork.head }, create: create.sandbox, mount: { sandbox: mounted.sandbox, path: mounted.path, base: mounted.base, baseLayer: mounted.baseLayer.slice(0, 12) }, exitCode: end("sandbox.exec").exitCode, process: end("operator.process.start").process, merge: { branch: merge.branch, head: merge.head?.slice(0, 12) } }, null, 1));
console.log("PASS trace real");
