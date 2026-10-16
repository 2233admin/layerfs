// A Sandbox creation the binding refuses for a missing deployment input
// leaves no creation intent: the next creation with the full deployment
// succeeds. The client resolves the deployment before the binding, so the
// binding is called directly here.
//   LAYERFS_DAEMON=<linux daemon> node sdk/js/test/verify/create_intent_real.mjs
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { invoke } from "../../src/client.js";
import { refusal, setup, teardown } from "./lib.mjs";

const ctx = await setup("intent", { project: `intent-${Date.now().toString(36)}` });
const { layerfs } = ctx;
let problems = [];
try {
  await layerfs.project.init(ctx.source);
  const { docker, ...partial } = ctx.deploy;
  for (const op of ["sandbox.create", "sandbox.service"]) {
    const refused = await refusal(invoke(op, { name: "intent-box", image: ctx.deploy.image, project: layerfs.projectName, home: layerfs.options.home, deploy: partial }, {}));
    assert.equal(refused?.code, "InvalidInput", op);
    assert.ok(!existsSync(join(layerfs.options.home, layerfs.projectName, "create.intent")), `${op}: no creation intent`);
  }
  assert.equal(await layerfs.sandbox.create("intent-box", layerfs.projectName, ctx.deploy.image), "intent-box");
} finally {
  problems = await teardown(ctx);
}
assert.deepEqual(problems, []);
console.log("create intent: ok");
