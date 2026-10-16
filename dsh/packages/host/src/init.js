// "Init LayerFS": imports a folder as a new LayerFS project on its own
// Docker volume and binds it to the dsh workspace folder.
import { execFile } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { basename, isAbsolute, join } from "node:path";
import { promisify } from "node:util";
import { missingDeployment } from "./config.js";
import { clientFor, release } from "./layerfs-client.js";

const run = promisify(execFile);
const NAME = /^[a-z0-9](?:[a-z0-9_.-]{0,61}[a-z0-9])?$/;

const refuse = (code, message) => Object.assign(new Error(message), { code });

/** A project name from a folder name: lowercase, the SDK's alphabet, at most 63 characters. */
export function nameFrom(folder) {
  const base = basename(folder).toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "").slice(0, 63);
  return NAME.test(base) ? base : "project";
}

/** The first free name: `base`, then `base-2`, `base-3`, … */
function freeName(base, taken, home) {
  for (let i = 1; ; i++) {
    const name = i === 1 ? base : `${base.slice(0, 60)}-${i}`;
    if (!taken.has(name) && !existsSync(join(home, name))) return name;
  }
}

/**
 * Imports `source` (default: the workspace folder) as a LayerFS project and
 * binds it to `folder`. One attempt; a failure leaves no binding, and the
 * volume it made is removed.
 * @param {object} spec resolved Host settings
 * @param {import("./binding.js").BindingStore} bindings
 * @param {{ folder: string, source?: string, name?: string }} request
 */
export async function initProject(spec, bindings, { folder, source = folder, name }) {
  const missing = missingDeployment(spec);
  if (missing.length) throw refuse("not-configured", `LayerFS is not configured: set ${missing.join(" and ")} for layerfs-host in the profile patch`);
  for (const path of [folder, source]) {
    if (!isAbsolute(path) || !existsSync(path) || !statSync(path).isDirectory()) throw refuse("invalid-folder", `${path} is not an absolute directory`);
  }
  if (name !== undefined && !NAME.test(name)) throw refuse("invalid-name", "a project name is 1-63 lowercase letters, digits, _ . - and starts and ends alphanumeric");
  const project = { name: name ?? freeName(nameFrom(source), bindings.allNames(), spec.home), source, volume: "", created: Date.now() };
  if (bindings.allNames().has(project.name) || existsSync(join(spec.home, project.name))) throw refuse("name-taken", `a LayerFS project named ${project.name} exists`);
  project.volume = `dsh-layerfs-${project.name}-${project.created.toString(36)}`;
  const docker = ["-H", `unix://${spec.docker}`];
  await run("docker", [...docker, "volume", "create", project.volume]);
  let client;
  try {
    client = await clientFor(spec, project);
    await client.layerfs.project.init(source);
  } catch (error) {
    if (client) await release(client).catch(() => {});
    await run("docker", [...docker, "volume", "rm", project.volume]).catch(() => {});
    throw error;
  }
  await release(client);
  bindings.addProject(folder, project);
  return project;
}
