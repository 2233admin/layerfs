// #352 F-029: a call that names a mount finds it in this process's mount table
// and asks the daemon nothing about the Sandbox's other mounts.
//
//   node sdk/js/test/verify/exec_mount_lookup_real.mjs outer <daemon> <addon> <image>
//
// `outer` (on the Docker host) makes a fresh Store volume and runs `inner` in
// the runtime image. Process A creates a Sandbox and mounts four Workspaces,
// then traces one `sandbox.exec`: its trace line carries no daemon exchange
// (before F-029 it carried one status exchange per mount). A child process
// sharing LAYERFS_HOME mounts a fifth Workspace and unmounts one of A's. A then
// execs in the fifth (found from the shared records), is refused NotMounted in
// the one the child removed, and still execs in the others. One attempt per
// step; nothing retried.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { docker, inRuntime, REPO, STORE_PATH } from "./container.mjs";

const MOUNTS = 4;

async function inner([phase]) {
  const { LayerFS } = await import("../../src/index.js");
  const home = process.env.LAYERFS_HOME;
  const trace = join(home, "exec.trace.jsonl");
  const layerfs = new LayerFS("site", { storePath: STORE_PATH, trace });
  const shared = join(home, "paths.json");
  if (phase === "child") {
    const paths = JSON.parse(readFileSync(shared, "utf8"));
    const fifth = await layerfs.sandbox.mount("box", "work");
    await layerfs.sandbox.unmount("box", paths[1], true);
    writeFileSync(shared, JSON.stringify([...paths, fifth]));
    console.log("CHILD ok");
    return;
  }
  const source = mkdtempSync(join(tmpdir(), "layerfs-f029-"));
  writeFileSync(join(source, "README.md"), "workspace file\n");
  await layerfs.project.init(source);
  rmSync(source, { recursive: true, force: true });
  await layerfs.sandbox.create("box", "site", process.env.LAYERFS_IMAGE);
  await layerfs.branch.fork("work", "main");
  const paths = [];
  for (let i = 0; i < MOUNTS; i++) paths.push(await layerfs.sandbox.mount("box", "work"));
  rmSync(trace, { force: true });
  assert.equal((await layerfs.sandbox.exec("box", paths[0], "cat README.md")).exitCode, 0);
  await layerfs.sandbox.status("box", paths[0]);
  const lines = readFileSync(trace, "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((l) => l.phase === "end");
  const exec = lines.find((l) => l.method === "sandbox.exec");
  const status = lines.find((l) => l.method === "sandbox.status");
  // the status call shows what one daemon exchange looks like in the trace
  assert.ok((status.daemon ?? []).length >= 1, `status carries its exchange: ${JSON.stringify(status).slice(0, 300)}`);
  assert.equal((exec.daemon ?? []).length, 0, `exec asks the daemon nothing: ${JSON.stringify(exec.daemon)?.slice(0, 300)}`);
  console.log(`EXEC daemon exchanges ${(exec.daemon ?? []).length} with ${MOUNTS} mounts; status ${status.daemon.length}`);

  writeFileSync(shared, JSON.stringify(paths));
  const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "inner", "child"], { encoding: "utf8", timeout: 40_000 });
  console.log((child.stdout + child.stderr).trim());
  assert.equal(child.status, 0, "the child process passes");
  const all = JSON.parse(readFileSync(shared, "utf8"));
  const fifth = all[MOUNTS];
  assert.equal((await layerfs.sandbox.exec("box", fifth, "cat README.md")).exitCode, 0, "a mount another process made");
  let refused = null;
  try { await layerfs.sandbox.exec("box", paths[1], "true"); } catch (e) { refused = e; }
  assert.equal(refused?.code, "NotMounted", `a mount another process removed: ${refused?.message}`);
  for (const path of [paths[0], paths[2], paths[3]]) assert.equal((await layerfs.sandbox.exec("box", path, "true")).exitCode, 0);
  for (const path of [paths[0], paths[2], paths[3], fifth]) await layerfs.sandbox.unmount("box", path, true);
  await layerfs.sandbox.close("box");
  console.log("MAIN ok");
}

function outer([daemon, addon, image]) {
  assert.ok(daemon && addon && image, "usage: outer <daemon> <addon> <image digest>");
  const stamp = `f029-${Date.now().toString(36)}`;
  const volume = `layerfs-issue352-${stamp}`;
  const home = join(REPO, "core/target/f009", `${stamp}-home`);
  mkdirSync(home, { recursive: true });
  chmodSync(home, 0o700); // LAYERFS_HOME must be private
  let r;
  try {
    assert.equal(docker(["volume", "create", volume]).status, 0);
    r = inRuntime({ script: fileURLToPath(import.meta.url), args: ["main"], daemon, addon, image, volume, prefix: `${stamp}-`, env: { LAYERFS_HOME: home }, timeout: 90_000 });
  } finally {
    const left = docker(["ps", "-aq", "--filter", `name=^${stamp}-`]).stdout.trim().split("\n").filter(Boolean);
    if (left.length) docker(["rm", "-f", ...left]);
    docker(["volume", "rm", volume]);
    rmSync(home, { recursive: true, force: true });
  }
  console.log(`== exit ${r.status}\n${r.out.split("\n").slice(-30).join("\n")}`);
  assert.equal(r.status, 0, "the run passes");
  assert.match(r.out, /MAIN ok/);
  console.log("exec mount lookup: ok");
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === "inner") await inner(rest);
else outer(rest);
