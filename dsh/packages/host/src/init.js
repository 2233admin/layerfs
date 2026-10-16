// "Init LayerFS": imports a folder as a new LayerFS project on its own
// Docker volume and binds it to the dsh workspace folder.
import { execFile } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { lstat, opendir } from "node:fs/promises";
import { basename, isAbsolute, join } from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { promisify } from "node:util";
import { missingDeployment } from "./config.js";
import { clientFor, release } from "./layerfs-client.js";

const run = promisify(execFile);
const NAME = /^[a-z0-9](?:[a-z0-9_.-]{0,61}[a-z0-9])?$/;
const WATCH_MS = 250;

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
 * Counts what Init will import, before it starts: every entry under `source`
 * (no ignore rules, links not followed, as Init itself reads it) and the
 * bytes of its regular files. `report` sees the running counts.
 * @returns {Promise<{ entries: number, files: number, bytes: number }>}
 */
export async function scanSource(source, report = () => {}) {
  const counts = { entries: 1, files: 0, bytes: 0 }, dirs = [source];
  while (dirs.length) {
    const dir = dirs.pop();
    for await (const entry of await opendir(dir)) {
      counts.entries++;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) dirs.push(path);
      else if (entry.isFile()) { counts.files++; counts.bytes += (await lstat(path)).size; }
    }
    report({ ...counts });
  }
  return counts;
}

/**
 * Checks an Init request and names its project, without changing anything.
 * @param {object} spec resolved Host settings
 * @param {import("./binding.js").BindingStore} bindings
 * @param {{ folder: string, source?: string, name?: string }} request
 * @param {Set<string>} [pending] names of Inits still running
 */
export function prepareInit(spec, bindings, { folder, source = folder, name }, pending = new Set()) {
  const missing = missingDeployment(spec);
  if (missing.length) throw refuse("not-configured", `LayerFS is not configured: set ${missing.join(" and ")} for layerfs-host in the profile patch`);
  for (const path of [folder, source]) {
    if (!isAbsolute(path) || !existsSync(path) || !statSync(path).isDirectory()) throw refuse("invalid-folder", `${path} is not an absolute directory`);
  }
  if (name !== undefined && !NAME.test(name)) throw refuse("invalid-name", "a project name is 1-63 lowercase letters, digits, _ . - and starts and ends alphanumeric");
  if (name !== undefined && bindings.retired.has(name)) throw refuse("name-retired", `${name} was removed while dsh runs; restart dsh to use the name again, or choose another`);
  const taken = new Set([...bindings.allNames(), ...pending, ...bindings.retired]);
  const project = { name: name ?? freeName(nameFrom(source), taken, spec.home), source, volume: "", created: Date.now() };
  if (taken.has(project.name) || existsSync(join(spec.home, project.name))) throw refuse("name-taken", `a LayerFS project named ${project.name} exists`);
  project.volume = `dsh-layerfs-${project.name}-${project.created.toString(36)}`;
  return { folder, project };
}

/**
 * Runs a prepared Init: counts the source, makes the volume, imports the
 * source (LayerFS's Host Init, which seals the Store under the LayerFS home;
 * the project's first Sandbox installs it into the volume) and binds the
 * project to `folder`. `report` sees each step (scan, volume, import) and,
 * while LayerFS imports, its counts as `imported`. One attempt; a failure
 * leaves no binding, and the volume it made is removed.
 */
export async function runInit(spec, bindings, { folder, project }, report = () => {}) {
  report({ step: "scan" });
  const totals = await scanSource(project.source, (counts) => report({ scanned: counts }));
  report({ step: "volume", totals });
  const docker = ["-H", `unix://${spec.docker}`];
  await run("docker", [...docker, "volume", "create", project.volume]);
  report({ step: "import" });
  let client;
  try {
    client = await clientFor(spec, project);
    await watching(client, report, () => client.layerfs.project.init(project.source));
  } catch (error) {
    if (client) await release(client).catch(() => {});
    await run("docker", [...docker, "volume", "rm", project.volume]).catch(() => {});
    throw error;
  }
  await release(client);
  bindings.addProject(folder, project);
  return project;
}

/**
 * Runs `init`, reading its counts (operator project.progress) every WATCH_MS
 * until it ends. One read at a time; a failed read stops the counts, not Init.
 */
export async function watching(client, report, init) {
  let running = true;
  const watch = (async () => {
    while (running) {
      const counts = await client.operator.project.progress().catch(() => (running = false, null));
      if (counts && running) report({ imported: counts });
      if (running) await pause(WATCH_MS);
    }
  })();
  try {
    return await init();
  } finally {
    running = false;
    await watch;
  }
}

/** Imports `source` (default: the workspace folder) as a LayerFS project bound to `folder`. */
export const initProject = (spec, bindings, request, report) => runInit(spec, bindings, prepareInit(spec, bindings, request), report);
