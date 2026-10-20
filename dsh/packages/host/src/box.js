// The LayerFS box of ported Live projects (macOS; port/binding.js): one
// long-lived Linux container that only hosts processes. Each binding call of a
// ported SDK runs `node port/run.mjs` in it with docker exec; that process
// opens the project's Store under Docker's volume directory and exits, so the
// box holds nothing between calls. It mounts only what the calls use, each at
// its own path so a path means the same inside as outside, for Docker too: the
// Docker socket, Docker's volume directory (inside Docker's VM), the LayerFS
// home (writable), the LayerFS build and port/ (read-only). Never a broad host
// folder: Docker Desktop forwards every file event under a shared folder into
// its VM, and sharing /Users stalled it (2026-10-20). Init, the one call that
// reads a source folder, runs in its own container with that folder (binding.js).
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
export const VOLUMES = "/var/lib/docker/volumes";
export const PORT = dirname(fileURLToPath(new URL("./port/run.mjs", import.meta.url)));
/** Where a box process reaches a daemon's loopback-published port: the Mac. */
export const DAEMON_HOST = "host.docker.internal";

/** `docker run` mounts and settings of a ported call's process: in the box, or Init's own. */
export const callMounts = ({ home, bundle }) => [
  "-v", "/var/run/docker.sock:/var/run/docker.sock", "-v", `${VOLUMES}:${VOLUMES}`,
  "-v", `${home}:${home}`, "-v", `${bundle}:${bundle}:ro`, "-v", `${PORT}:${PORT}:ro`,
  "-e", `LAYERFS_NATIVE=${join(bundle, "layerfs.node")}`,
];

/** Where a ported call opens the Store of the project volume `volume`. */
export const storePathOf = (volume) => `${VOLUMES}/${volume}/_data/global/store.sqlite`;

/** The box's name: one per LayerFS home and build, so a new build gets a new box. */
export const boxName = (home, bundle) => `dsh-layerfs-box-${createHash("sha256").update(`${home}\n${bundle}`).digest("hex").slice(0, 12)}`;

let starting = null;
/** Starts the box unless it runs; one start at a time. */
export function ensureBox(spec) {
  starting ??= start(spec).finally(() => { starting = null; });
  return starting;
}

async function start(spec) {
  const docker = ["-H", `unix://${spec.docker}`];
  const state = await run("docker", [...docker, "inspect", "-f", "{{.State.Running}}", spec.box]).then((r) => r.stdout.trim(), () => null);
  if (state === "true") return;
  if (state === "false") { await run("docker", [...docker, "start", spec.box]); return; }
  await run("docker", [...docker, "run", "-d", "--pull", "never", "--name", spec.box, "--init", "--label", "dsh-layerfs.box=1",
    ...callMounts(spec), "--entrypoint", "sleep", spec.image, "infinity"]);
}
