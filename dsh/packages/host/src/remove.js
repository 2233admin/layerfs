// Removes a LayerFS project: what Init made, in reverse. One attempt, no
// retry. It refuses while a running container (a Sandbox) still uses the
// project's volume; it never stops one. Stopped containers on the volume,
// left by failed starts, are removed with it. The Host's own cached client is released first.
// The workspace folder, session transcripts and line journals are untouched;
// sessions that used the project have no LayerFS project afterwards. The home
// entry is the LayerFS project, so deleting it frees the name for Init at once.
// A simulated project has no container or volume: its background processes
// are stopped and its home entry deleted.
import { execFile } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { promisify } from "node:util";
import { isSim } from "./layerfs-client.js";
import { stopProcesses } from "./sim/binding.js";

const execute = promisify(execFile);
/** Container states that hold the volume but run nothing: what a failed start leaves. */
const STOPPED = new Set(["created", "exited", "dead"]);
const refuse = (code, message, status = 409) => Object.assign(new Error(message), { code, status });

/**
 * @param {object} spec resolved Host settings
 * @param {import("./binding.js").BindingStore} bindings
 * @param {import("./trees.js").TreeReader} trees
 * @param {string} name the project
 * @param {(file: string, args: string[]) => Promise<{ stdout: string }>} [run] runs docker
 * @returns {Promise<{ removed: string, volume: string }>}
 */
export async function removeProject(spec, bindings, trees, name, run = execute) {
  const project = bindings.byName(name);
  if (!project) throw refuse("not-found", `no LayerFS project named ${name}`, 404);
  const home = join(spec.home, project.name), inside = relative(spec.home, home);
  if (!inside || inside.startsWith("..") || inside.includes("/")) throw refuse("invalid-name", `${project.name} is not a project name`);
  await trees.forget(project.name);
  if (isSim(project)) {
    stopProcesses(spec.home, project.name);
    if (existsSync(home)) rmSync(home, { recursive: true, force: true });
    bindings.remove(project.name);
    return { removed: project.name, volume: project.volume };
  }
  const docker = ["-H", `unix://${spec.docker}`];
  const { stdout } = await run("docker", [...docker, "ps", "-a", "--filter", `volume=${project.volume}`, "--format", "{{.ID}} {{.State}}"]);
  const containers = stdout.split("\n").filter(Boolean).map((line) => line.split(" "));
  const users = containers.filter(([, state]) => !STOPPED.has(state)).length;
  if (users) throw refuse("busy", `${users} container${users === 1 ? "" : "s"} still use${users === 1 ? "s" : ""} ${project.volume}; close the project's Sandboxes first`);
  // stopped containers on the volume are left by failed starts; the name was confirmed, so they go with it
  const stopped = containers.map(([id]) => id);
  if (stopped.length) await run("docker", [...docker, "rm", ...stopped]);
  await run("docker", [...docker, "volume", "rm", project.volume]);
  if (existsSync(home)) rmSync(home, { recursive: true, force: true });
  bindings.remove(project.name);
  return { removed: project.name, volume: project.volume };
}
