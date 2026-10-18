// A client in a container reaches its Sandbox's daemon through the configured
// host (#352 F-020, lead decision 2026-10-18). Each daemon publishes its port
// on the Docker host's 127.0.0.1 only; a container does not share that
// loopback, so the client dials LAYERFS_DAEMON_HOST (host.docker.internal on
// Docker Desktop). The publish and its check are unchanged.
//
//   node sdk/js/test/verify/daemon_host_real.mjs outer <daemon> <addon> <image>
//
// `outer` (on the Docker host) makes a fresh volume and runs `inner` twice in
// the runtime image, each in its own container with the Docker socket and the
// volume at /layerfs-store: once with LAYERFS_DAEMON_HOST set (create, mount,
// exec, unmount and close must succeed) and once without it (the control: the
// create must fail to connect). Then it removes every container its runs
// named and the volume. One attempt per step; nothing is retried.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../../..");
const RUNTIME = "layerfs-352-runtime:node24";
const STORE = "/layerfs-store/global/store.sqlite";
const HOST = "host.docker.internal";

async function inner(mode) {
  const { LayerFS } = await import("../../src/index.js");
  const work = mkdtempSync(join(tmpdir(), "layerfs-host-"));
  const source = join(work, "site");
  mkdirSync(source);
  writeFileSync(join(source, "README.md"), "hello from the host test\n");
  process.env.LAYERFS_HOME = join(work, "home");
  const layerfs = new LayerFS("site", { storePath: STORE });
  const image = process.env.LAYERFS_IMAGE;
  try {
    await layerfs.project.init(source);
    if (mode === "loopback") {
      let refused = null;
      try {
        await layerfs.sandbox.create("box", "site", image);
      } catch (error) {
        refused = error;
      }
      assert.ok(refused, "without the host the create must not reach the daemon");
      console.log(`CONTROL refused ${refused.code}: ${refused.message.slice(0, 200)}`);
      return;
    }
    assert.equal(await layerfs.sandbox.create("box", "site", image), "box");
    // main changes only through publish and is never mounted; a fork is.
    await layerfs.branch.fork("work", "main");
    const path = await layerfs.sandbox.mount("box", "work");
    const ran = await layerfs.sandbox.exec("box", path, "cat README.md");
    assert.equal(ran.exitCode ?? ran.exit_code ?? ran.code, 0, JSON.stringify(ran));
    assert.match(JSON.stringify(ran), /hello from the host test/);
    await layerfs.sandbox.unmount("box", path, true);
    await layerfs.sandbox.close("box");
    console.log(`HOST ok through ${process.env.LAYERFS_DAEMON_HOST}`);
  } finally {
    await layerfs.close?.().catch(() => {});
    rmSync(work, { recursive: true, force: true });
  }
}

function outer([daemon, addon, image]) {
  assert.ok(daemon && addon && image, "usage: outer <daemon> <addon> <image digest>");
  const stamp = `f020-host-${Date.now().toString(36)}`;
  const volume = `layerfs-issue352-${stamp}`;
  const docker = (args, options = {}) => spawnSync("docker", args, { encoding: "utf8", ...options });
  execFileSync("docker", ["volume", "create", volume], { stdio: "ignore" });
  const results = [];
  try {
    for (const mode of ["host", "loopback"]) {
      const prefix = `${stamp}-${mode}-`;
      const env = { LAYERFS_DOCKER: "/var/run/docker.sock", LAYERFS_IMAGE: image, LAYERFS_VOLUME: volume, LAYERFS_DAEMON: daemon, LAYERFS_NATIVE: addon, LAYERFS_CONTAINER_PREFIX: prefix, LAYERFS_CONSTRUCTION_WORKERS: "1", ...(mode === "host" ? { LAYERFS_DAEMON_HOST: HOST } : {}) };
      const run = docker(["run", "--rm", "--name", `layerfs-issue352-${prefix}client`, "-v", `${REPO}:${REPO}`, "-v", `${dirname(daemon)}:${dirname(daemon)}:ro`, "-v", `${dirname(addon)}:${dirname(addon)}:ro`, "-v", "/var/run/docker.sock:/var/run/docker.sock", "-v", `${volume}:/layerfs-store`, ...Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]), "-w", REPO, "--entrypoint", "node", RUNTIME, fileURLToPath(import.meta.url), "inner", mode], { timeout: 55_000 });
      results.push({ mode, status: run.status, out: (run.stdout + run.stderr).trim().split("\n").slice(-6).join("\n") });
      // Containers this run named, whatever their state: the test's own.
      const left = docker(["ps", "-aq", "--filter", `name=^${prefix}`]).stdout.trim().split("\n").filter(Boolean);
      if (left.length) docker(["rm", "-f", ...left]);
    }
  } finally {
    docker(["volume", "rm", volume]);
  }
  for (const r of results) console.log(`== ${r.mode} exit ${r.status}\n${r.out}`);
  assert.equal(results[0].status, 0, "the client reaches the daemon through the configured host");
  assert.equal(results[1].status, 0, "the control run itself completes");
  assert.match(results[1].out, /CONTROL refused/);
  console.log("daemon host: ok");
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === "inner") await inner(rest[0]);
else outer(rest);
