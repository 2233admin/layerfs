// Records tests/fixtures/real-trace.jsonl and its expectation from a real
// run on a fresh Disposable Store: one agent script (step "matrix.sh") that
// forks, mounts, commits, runs a background process, writes through fs,
// merges, publishes and closes its Sandbox. The expectation is what LayerFS
// reports at the end (Branch heads, main's Layer, Sandboxes).
//   LAYERFS_DAEMON=<linux daemon> node dsh/packages/model/tests/record-trace.mjs
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setup, teardown, mount, sh, unmount } from "../../../../sdk/js/test/verify/lib.mjs";

const FIX = new URL("./fixtures/", import.meta.url).pathname;
const trace = join(FIX, "real-trace.jsonl");
rmSync(trace, { force: true });
for (const name of ["LAYERFS_TRACE", "LAYERFS_TRACE_STEP", "LAYERFS_TRACE_START"]) delete process.env[name];
Object.assign(process.env, { DSH_LAYERFS_TRACE: trace, DSH_LAYERFS_TRACE_START: "1", DSH_LAYERFS_TRACE_STEP: "matrix.sh" });
const project = "website";
const ctx = await setup("trace", { project });
const { layerfs, operator } = ctx;
let expect;
try {
  await layerfs.project.init(ctx.source);
  await layerfs.branch.fork("feature");
  const box = await layerfs.sandbox.create();
  const ws = await mount(ctx, box, "feature");
  await sh(ctx, ws, "mkdir -p app && printf 'hero\\n' > app/hero.txt");
  await layerfs.sandbox.commit(box, ws.path, { message: "add hero" });
  const proc = await sh(ctx, ws, "sleep 30", { background: true });
  await operator.process.cancel(box, proc.process);
  await unmount(ctx, ws);
  await layerfs.branch.fork("try", "feature");
  await layerfs.fs.write("try", "/app/theme.css", ":root{}\n", "warm theme");
  await layerfs.fs.read("try", "/app/theme.css");
  await layerfs.branch.merge("feature", "try", "release", "join");
  await layerfs.branch.publish("release");
  await layerfs.sandbox.close(box);
  const { items } = await layerfs.project.list_branches();
  const snap = await operator.inspect.snapshot();
  const main = snap.branches.find((b) => b.name === "main");
  expect = {
    project, step: "matrix.sh",
    branches: Object.fromEntries(items.filter((b) => b.name !== "main").map((b) => [b.name, b.head ?? null])),
    mainLayer: main.base,
    sandboxes: [[box, true]],
    minNodes: 5,
  };
} finally {
  layerfs.options.trace = undefined; // teardown is the recorder's, not the agent's
  const problems = await teardown(ctx);
  if (problems.length) console.error(problems);
}
// The trace names no host paths but the Init source: keep the fixture portable.
const text = readFileSync(trace, "utf8").replaceAll(ctx.source, "/src/website");
writeFileSync(trace, text);
writeFileSync(join(FIX, "real-trace.expect.json"), JSON.stringify(expect, null, 1) + "\n");
console.log(`recorded ${text.trimEnd().split("\n").length} lines`);
