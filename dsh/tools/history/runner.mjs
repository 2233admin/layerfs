#!/usr/bin/env node
// The #352 runner container (DIRECT_STORE.md §3.1, DIRECT_STORE_IMPL.md step 4):
//   node dsh/tools/history/runner.mjs -- <run.mjs arguments>
// runs `run.mjs` in `layerfs-issue352-runner`, a Linux container from the
// runtime image (Node 24). Store calls run in that process (F-020): the run's
// Store volume (layerfs-issue352-<run id>) is mounted at /layerfs-store, as in
// every Sandbox, and LAYERFS_STORE_PATH names the file there. There is one
// route; run.mjs refuses Store commands anywhere else. It mounts the checkout
// and ~/lfs-history at their host paths (the SDK hands those paths to Docker
// for Sandboxes, so they must mean the same thing inside and out), the SDK
// JavaScript folder given with --sdk when it lies outside the checkout
// (read-only), and the Docker socket (at /var/run/docker.sock and at the host
// context's path, which run manifests name). `docker` inside is
// runner/docker-shim.mjs over the Engine API. It shares the Docker VM's
// network: a Sandbox's daemon port is published on 127.0.0.1 there, which the
// SDK connects to (on the default bridge that address is the runner itself,
// and Sandbox create failed ConnectionRefused). The runner's image id is passed
// in (LAYERFS_RUNNER_IMAGE) and recorded in every metrics file beside the
// daemon, addon and Sandbox image ids. A run played here needs a Linux addon
// (`--addon` on new/fork); the binary guard refuses any other.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { HISTORY, REPO } from "./lib.mjs";
import { options, rebaselineId, STORE_PATH } from "./run.mjs";

export const RUNNER = "layerfs-issue352-runner";
export const RUNNER_IMAGE = "layerfs-352-runtime:node24";

/** The run a run.mjs command acts on, whose Store volume the runner mounts (null: none). */
export function runOf(args) {
  const [cmd, ...rest] = args, o = options(rest);
  return o.run ?? (cmd === "rebaseline" && o.phase && o.daemon ? rebaselineId(o) : null);
}

/** The `docker run` arguments of the runner (pure, for the tests). */
export function runnerArgs({ imageId, hostSocket, args, run = runOf(args), sdk = null, home = process.env.HOME, repo = REPO, history = HISTORY }) {
  const socketMounts = ["/var/run/docker.sock", ...(hostSocket && hostSocket !== "/var/run/docker.sock" ? [hostSocket] : [])].flatMap((p) => ["-v", `/var/run/docker.sock:${p}`]);
  const store = run ? ["-v", `layerfs-issue352-${run}:/layerfs-store`] : [];
  const sdkMount = sdk && !sdk.startsWith(`${repo}/`) ? ["-v", `${sdk}:${sdk}:ro`] : [];
  return ["run", "--rm", "--name", RUNNER, "--init", "--network", "host",
    "-v", `${repo}:${repo}`, "-v", `${history}:${history}`, ...store, ...sdkMount, ...socketMounts,
    "-e", `HOME=${home}`, "-e", `LFS_HISTORY=${history}`, "-e", `PATH=${join(repo, "dsh/tools/history/runner")}:/usr/local/bin:/usr/bin:/bin`,
    "-e", `LAYERFS_STORE_PATH=${STORE_PATH}`, "-e", `LAYERFS_RUNNER_IMAGE=${imageId}`, "-e", `LAYERFS_RUNNER=${RUNNER}`,
    "-e", "GIT_CONFIG_COUNT=1", "-e", "GIT_CONFIG_KEY_0=safe.directory", "-e", "GIT_CONFIG_VALUE_0=*",
    "-w", repo, "--entrypoint", "node", imageId, join(repo, "dsh/tools/history/run.mjs"), ...args];
}

function main(argv) {
  const at = argv.indexOf("--");
  const args = at < 0 ? argv : argv.slice(at + 1);
  if (!args.length || (at > 0)) { console.error("usage: runner.mjs -- <run.mjs arguments>"); return 2; }
  const o = options(args.slice(1));
  // a run's SDK folder: --sdk on new/fork/rebaseline, else the run's recorded one
  const recorded = o.run ? (() => { try { return JSON.parse(readFileSync(join(HISTORY, "runs", o.run, "run.json"), "utf8")).env.LAYERFS_SDK_JS; } catch { return null; } })() : null;
  const sdk = o.sdk ? resolve(o.sdk) : recorded;
  const imageId = execFileSync("docker", ["image", "inspect", "--format", "{{.Id}}", RUNNER_IMAGE], { encoding: "utf8" }).trim();
  const hostSocket = execFileSync("docker", ["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"], { encoding: "utf8" }).trim().replace(/^unix:\/\//, "");
  return spawnSync("docker", runnerArgs({ imageId, hostSocket, args, sdk }), { stdio: "inherit" }).status ?? 1;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main(process.argv.slice(2)));
