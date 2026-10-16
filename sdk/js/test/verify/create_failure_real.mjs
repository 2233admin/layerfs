// A Sandbox create that fails before anything reaches the Store volume
// removes the container it made and its creation intent, and reports the
// original failure; the next create of the same project works. A creation
// whose process ended mid-way stays refused with a message saying what to do.
// A test daemon that exits at once stands in for one that refuses its Store.
//   LAYERFS_DAEMON=<linux daemon> node sdk/js/test/verify/create_failure_real.mjs
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { invoke } from "../../src/client.js";
import { containerOf, refusal, setup, teardown } from "./lib.mjs";

const ctx = await setup("failure", { project: `failure-${Date.now().toString(36)}` });
const { layerfs } = ctx;
const home = layerfs.options.home;
const project = layerfs.projectName;
const intent = join(home, project, "create.intent");
const daemon = (name, body) => {
  const path = join(ctx.work, name);
  writeFileSync(path, `#!/bin/sh\n${body}\n`, { mode: 0o755 });
  return path;
};
const exiting = daemon("exiting-daemon", 'echo "test daemon: refusing the Store" >&2\nexit 1');
const silent = daemon("silent-daemon", "exec sleep 600");
const onVolume = () => execFileSync("docker", ["ps", "-aq", "--no-trunc", "--filter", `volume=${ctx.volume}`], { encoding: "utf8" }).split("\n").filter(Boolean);
const args = (op, name, executable) => ({ ...(op === "sandbox.create" ? { name, image: ctx.deploy.image } : {}), project, home, deploy: { ...ctx.deploy, daemon: executable } });

/** One create with the exiting daemon: refused, and nothing of it is left. */
async function failsClean(op, name) {
  const before = onVolume();
  const refused = await refusal(invoke(op, args(op, name, exiting), {}));
  assert.equal(refused?.code, "Failed", `${op}: ${refused?.message}`);
  assert.match(refused.message, /stopped at Listener/, op);
  assert.ok(refused.detail?.container, `${op}: names its container`);
  assert.equal(refused.detail.removed, true, `${op}: container removed`);
  assert.ok(!existsSync(intent), `${op}: no creation intent`);
  const id = op === "sandbox.create" ? name : `_service.${project}`;
  assert.ok(!existsSync(join(home, "_sandboxes", id)), `${op}: its name is free`);
  assert.ok(!existsSync(join(home, project, "service.record")), `${op}: no service record`);
  assert.deepEqual(onVolume(), before, `${op}: no container left on the volume`);
}

let problems = [];
try {
  await layerfs.project.init(ctx.source);
  // The project's first Sandbox: nothing is installed yet.
  await failsClean("sandbox.service", null);
  await failsClean("sandbox.create", "box-b");
  assert.equal(await layerfs.sandbox.create("box-a", project, ctx.deploy.image), "box-a");
  const kept = containerOf("box-a");
  // A later Sandbox opens the installed Store; its daemon refuses it.
  await failsClean("sandbox.create", "box-b");

  // A creating process that ends mid-way leaves an intent whose outcome is unknown.
  const child = spawn(process.execPath, ["--input-type=module", "-e", `
    import { invoke } from ${JSON.stringify(new URL("../../src/client.js", import.meta.url).href)};
    await invoke("sandbox.create", JSON.parse(process.env.ARGS), {});`], {
    env: { ...process.env, ARGS: JSON.stringify(args("sandbox.create", "box-c", silent)) }, stdio: "ignore",
  });
  const deadline = Date.now() + 20_000;
  while (!(existsSync(intent) && onVolume().length > 1) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 100));
  child.kill("SIGKILL");
  await new Promise((r) => child.exitCode !== null || child.signalCode ? r() : child.once("exit", r));
  assert.ok(existsSync(intent), "the interrupted create left its intent");
  const unknown = await refusal(layerfs.sandbox.create("box-d", project, ctx.deploy.image));
  assert.equal(unknown?.code, "Unknown", unknown?.message);
  for (const part of ["creation of Sandbox box-c began and never finished", `docker ps -a --filter volume=${ctx.volume}`, `then delete ${intent}`]) {
    assert.ok(unknown.message.includes(part), `refusal names: ${part}\n${unknown.message}`);
  }
  assert.ok(!unknown.message.includes("new volume"), "the Store is installed: the volume stays");
  // Resolved as the refusal says: its container removed, then its intent.
  const left = onVolume().filter((id) => id !== kept);
  assert.equal(left.length, 1, "the interrupted create's container");
  execFileSync("docker", ["rm", "-f", ...left], { stdio: "ignore" });
  rmSync(intent);
  assert.equal(await layerfs.sandbox.create("box-d", project, ctx.deploy.image), "box-d");
} finally {
  problems = await teardown(ctx);
}
assert.deepEqual(problems, []);
console.log("create failure: ok");
