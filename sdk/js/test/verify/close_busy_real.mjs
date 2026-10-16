// Close under a held project lock, on a Disposable Store: a named Sandbox
// closes and frees its name, since it has no record in the project; the
// service Sandbox is refused Busy with its container and record intact,
// and closes once the lock is released.
//   LAYERFS_DAEMON=<linux daemon> node sdk/js/test/verify/close_busy_real.mjs
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { containerOf, refusal, setup, teardown } from "./lib.mjs";

const ctx = await setup("close-busy", { project: `close-busy-${Date.now().toString(36)}` });
const { layerfs } = ctx;
const home = process.env.LAYERFS_HOME;
const running = (container) => spawnSync("docker", ["inspect", container], { stdio: "ignore" }).status === 0;
// another process holds the project's discovery lock, as a concurrent create does
const hold = () => new Promise((resolve) => {
  const child = spawn("python3", ["-c", "import fcntl,sys;f=open(sys.argv[1],'a');fcntl.flock(f,fcntl.LOCK_EX);print('held',flush=True);sys.stdin.read()", join(home, layerfs.projectName, "ownership.lock")], { stdio: ["pipe", "pipe", "inherit"] });
  child.stdout.once("data", () => resolve(child));
});
try {
  await layerfs.project.init(ctx.source);
  const box = await layerfs.sandbox.create("busy-box", layerfs.projectName, ctx.deploy.image);
  const service = await layerfs.service();
  const boxContainer = containerOf(box), serviceContainer = containerOf(service);
  const holder = await hold();
  try {
    assert.equal((await layerfs.sandbox.close(box)).kind, "Closed", "a named Sandbox closes while the project is locked");
    assert.ok(!existsSync(join(home, "_sandboxes", box)), "its name is free");
    assert.ok(!running(boxContainer), "its container is gone");
    const busy = await refusal(layerfs.sandbox.close(service));
    assert.equal(busy.code, "Busy", "the service Sandbox needs the project lock");
    assert.ok(running(serviceContainer) && existsSync(join(home, "_sandboxes", service, "sandbox.record")), "a Busy close removed nothing");
  } finally { holder.stdin.end(); holder.kill(); }
  assert.equal((await layerfs.sandbox.close(service)).kind, "Closed", "the retry closes it");
  assert.ok(!existsSync(join(home, "_sandboxes", service)) && !running(serviceContainer));
  assert.equal(await layerfs.sandbox.create("busy-box", layerfs.projectName, ctx.deploy.image), "busy-box", "the freed name is created again");
  console.log("close busy: ok");
} finally {
  const problems = await teardown(ctx);
  if (problems.length) console.error("teardown:", problems);
}
