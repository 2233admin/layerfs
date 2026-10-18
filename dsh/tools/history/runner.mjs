#!/usr/bin/env node
// The #352 runner container (DIRECT_STORE.md §3.1, DIRECT_STORE_IMPL.md step 4):
//   node dsh/tools/history/runner.mjs [--route daemon|direct] -- <run.mjs arguments>
// runs `run.mjs` in `layerfs-issue352-runner`, a Linux container from the
// runtime image (Node 24), so the SDK shares the daemons' kernel. It mounts
// the checkout and ~/lfs-history at their host paths (the SDK hands those paths
// to Docker for Sandboxes, so they must mean the same thing inside and out) and
// the Docker socket (at /var/run/docker.sock and at the host context's path,
// which run manifests name). `docker` inside is runner/docker-shim.mjs over the
// Engine API. The route is explicit: LAYERFS_ROUTE (default daemon); run.mjs
// refuses a measured range when it is not the run's recorded route, and refuses
// `direct` until F-020 lands. The runner's image id is passed in
// (LAYERFS_RUNNER_IMAGE) and recorded in every metrics file beside the daemon,
// addon and Sandbox image ids. A run played here needs a Linux addon
// (`--addon` on new/fork); the binary guard refuses any other.
import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";
import { HISTORY, REPO } from "./lib.mjs";

export const RUNNER = "layerfs-issue352-runner";
export const RUNNER_IMAGE = "layerfs-352-runtime:node24";
export const ROUTES = ["daemon", "direct"];

/** The `docker run` arguments of the runner (pure, for the tests). */
export function runnerArgs({ imageId, hostSocket, route, args, home = process.env.HOME, repo = REPO, history = HISTORY }) {
  const socketMounts = ["/var/run/docker.sock", ...(hostSocket && hostSocket !== "/var/run/docker.sock" ? [hostSocket] : [])].flatMap((p) => ["-v", `/var/run/docker.sock:${p}`]);
  return ["run", "--rm", "--name", RUNNER, "--init",
    "-v", `${repo}:${repo}`, "-v", `${history}:${history}`, ...socketMounts,
    "-e", `HOME=${home}`, "-e", `LFS_HISTORY=${history}`, "-e", `PATH=${join(repo, "dsh/tools/history/runner")}:/usr/local/bin:/usr/bin:/bin`,
    "-e", `LAYERFS_ROUTE=${route}`, "-e", `LAYERFS_RUNNER_IMAGE=${imageId}`, "-e", `LAYERFS_RUNNER=${RUNNER}`,
    "-e", "GIT_CONFIG_COUNT=1", "-e", "GIT_CONFIG_KEY_0=safe.directory", "-e", "GIT_CONFIG_VALUE_0=*",
    "-w", repo, "--entrypoint", "node", imageId, join(repo, "dsh/tools/history/run.mjs"), ...args];
}

function main(argv) {
  const at = argv.indexOf("--");
  const own = at < 0 ? [] : argv.slice(0, at), args = at < 0 ? argv : argv.slice(at + 1);
  const route = own[own.indexOf("--route") + 1] && own.includes("--route") ? own[own.indexOf("--route") + 1] : "daemon";
  if (!ROUTES.includes(route) || !args.length) { console.error("usage: runner.mjs [--route daemon|direct] -- <run.mjs arguments>"); return 2; }
  const imageId = execFileSync("docker", ["image", "inspect", "--format", "{{.Id}}", RUNNER_IMAGE], { encoding: "utf8" }).trim();
  const hostSocket = execFileSync("docker", ["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"], { encoding: "utf8" }).trim().replace(/^unix:\/\//, "");
  return spawnSync("docker", runnerArgs({ imageId, hostSocket, route, args }), { stdio: "inherit" }).status ?? 1;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main(process.argv.slice(2)));
