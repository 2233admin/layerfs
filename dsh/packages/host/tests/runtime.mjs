// Sandbox management reads and actions (runtime.js) on the simulator, without
// Docker: a project's Sandboxes with their Workspaces, the guards on its
// actions, and the All projects overview when Docker does not answer.
//   node dsh/packages/host/tests/runtime.mjs
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "dsh-layerfs-runtime-"));
const home = join(dir, "home");
const FOLDER = fileURLToPath(new URL("../../../demo-workspace", import.meta.url));
const NAME = "runtime-test";

try {
  const { resolveConfig } = await import("../src/config.js");
  const { BindingStore } = await import("../src/binding.js");
  const { TreeReader } = await import("../src/trees.js");
  const { initProject } = await import("../src/init.js");
  const { deploymentEnv } = await import("../src/layerfs-client.js");
  const { overview, projectAction, projectRuntime, LEFT_MS } = await import("../src/runtime.js");

  // Docker is a socket nobody listens on: the overview reports it down and still reads simulated projects
  const spec = { ...resolveConfig({ home }, { dir }), docker: join(dir, "no-docker.sock") };
  const bindings = new BindingStore(spec.stateDir);
  const project = await initProject(spec, bindings, { folder: FOLDER, name: NAME, backend: "sim" }, () => {});
  for (const [name, value] of Object.entries(deploymentEnv(spec, project))) process.env[`LAYERFS_${name}`] = value;
  const { LayerFS } = await import("../src/sim/sdk.js");
  const lf = new LayerFS(NAME);
  await lf.branch.fork("feature");
  const ws = await lf.workspace.mount("feature");
  await lf.workspace.exec(ws, "echo new > note.txt");

  const busy = new Set(), mountedAt = Date.now() - LEFT_MS - 1000;
  const collector = { busyOf: () => busy, mountsOf: () => ({ [`${ws.sandbox}\n${ws.path}`]: { agent: "agent-a", at: mountedAt, lastAt: mountedAt } }) };
  const trees = new TreeReader(spec);

  // the Workspace, with who mounted it, its uncommitted change and how long it sat
  const r = await projectRuntime(trees, collector, project);
  assert.equal(r.sandboxes.length, 1);
  const [w] = r.sandboxes[0].workspaces;
  assert.equal(w.path, ws.path);
  assert.equal(w.branch, "feature");
  assert.equal(w.agent, "agent-a");
  assert.ok(w.uncommitted > 0, "the exec's file is uncommitted");
  assert.ok(w.idleMs >= LEFT_MS);
  assert.equal(w.level, "degraded", "left with uncommitted changes past LEFT_MS");
  assert.equal(r.sandboxes[0].capacity, 16);

  // a call in flight in the Workspace refuses every action on it; discard needs its path as confirm
  busy.add(`${ws.sandbox}\n${ws.path}`);
  await assert.rejects(projectAction(trees, collector, project, { action: "discard", sandbox: ws.sandbox, path: ws.path, confirm: ws.path }), { code: "busy" });
  assert.equal((await projectRuntime(trees, collector, project)).sandboxes[0].workspaces[0].level, "ok", "a busy Workspace is not flagged");
  busy.clear();
  await assert.rejects(projectAction(trees, collector, project, { action: "discard", sandbox: ws.sandbox, path: ws.path }), { code: "not-confirmed" });
  await assert.rejects(projectAction(trees, collector, project, { action: "unmount", sandbox: ws.sandbox, path: ws.path }), { code: "Dirty" });
  await assert.rejects(projectAction(trees, collector, project, { action: "reboot" }), { code: "invalid-action" });
  await projectAction(trees, collector, project, { action: "discard", sandbox: ws.sandbox, path: ws.path, confirm: ws.path });
  assert.deepEqual((await projectRuntime(trees, collector, project)).sandboxes.flatMap((s) => s.workspaces), []);

  // the overview: Docker down, the simulated project read anyway
  const all = await overview(spec, bindings, trees, collector);
  assert.equal(all.engine.level, "down");
  assert.equal(all.level, "down");
  assert.equal(all.projects.length, 1);
  assert.equal(all.projects[0].name, NAME);
  assert.equal(all.projects[0].simulated, true);
  assert.deepEqual(all.leftovers, []);
  // an older Sandbox the startup cleanup kept shows as a running leftover
  spec.migration = { kept: [{ sandbox: "shop_service", container: "layerfs-shop_service", workspaces: 1, reason: "1 mounted Workspace" }] };
  const kept = (await overview(spec, bindings, trees, collector)).leftovers;
  assert.equal(kept.length, 1);
  assert.equal(kept[0].name, "layerfs-shop_service");
  assert.equal(kept[0].running, true);
  await trees.dispose();
  console.log("runtime: ok");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
