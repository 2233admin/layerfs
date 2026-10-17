// Concurrent mounts and unmounts of different Workspaces in one Sandbox
// (#352 F-009): every call answers for its own Workspace; none is refused
// because a sibling call of the same process is between its daemon step and
// its record step.
//   LAYERFS_DAEMON=<linux daemon> LAYERFS_IMAGE=<digest> node sdk/js/test/verify/concurrent_unmount_real.mjs
import assert from "node:assert/strict";
import { setup, teardown } from "./lib.mjs";

const ctx = await setup("concurrent-unmount", { project: `cu-${Date.now().toString(36)}` });
const { layerfs } = ctx;
const outcome = (results) => results.map((r) => (r.status === "fulfilled" ? "ok" : `${r.reason?.code}: ${r.reason?.message}`));
try {
  await layerfs.project.init(ctx.source);
  await layerfs.branch.fork("lane");
  const box = await layerfs.sandbox.create("cu-box", layerfs.projectName, ctx.deploy.image);
  for (let round = 0; round < 3; round++) {
    const mounted = await Promise.allSettled([0, 1, 2].map(() => layerfs.sandbox.mount(box, "lane")));
    assert.deepEqual(outcome(mounted), ["ok", "ok", "ok"], `round ${round}: concurrent mounts`);
    const paths = mounted.map((r) => r.value);
    ctx.mounts.push(...paths.map((path) => ({ sandbox: box, path, branch: "lane" })));
    const unmounted = await Promise.allSettled(paths.map((path) => layerfs.sandbox.unmount(box, path, true)));
    assert.deepEqual(outcome(unmounted), ["ok", "ok", "ok"], `round ${round}: concurrent unmounts`);
    ctx.mounts = ctx.mounts.filter((m) => !paths.includes(m.path));
  }
  console.log("concurrent unmount: ok");
} finally {
  const problems = await teardown(ctx);
  if (problems.length) console.error("teardown:", problems);
}
