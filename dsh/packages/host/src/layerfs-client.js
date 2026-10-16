// LayerFS SDK clients the Host uses for a project: Init, and the project
// state the views draw (inspect.snapshot through the model's mirror). The
// SDK captures its deployment from the environment at construction, so the
// project's settings are set for that synchronous step only. A simulated
// project (backend "sim") has a client of the simulator instead (sim/).
import { Mirror } from "@dsh-layerfs/model/mirror.js";
import { simClient } from "./sim/client.js";

export const isSim = (project) => project.backend === "sim";

/** The environment one project's SDK client and its agents' bash calls use. */
export function deploymentEnv(spec, project) {
  // the SDK asks for every deployment setting; a simulated project uses none
  if (isSim(project)) return { HOME: spec.home, DOCKER: "sim", IMAGE: "sim", DAEMON: "sim", VOLUME: project.volume };
  return {
    HOME: spec.home,
    DOCKER: spec.docker,
    IMAGE: spec.image ?? "",
    DAEMON: spec.daemon ?? "",
    VOLUME: project.volume,
  };
}

/** Constructs a LayerFS client and operator for one project. */
export async function clientFor(spec, project) {
  if (isSim(project)) return simClient(spec.home, project.name);
  const { LayerFS } = await import(spec.sdk);
  const { LayerFSOperator } = await import(new URL("../operator/index.js", spec.sdk).href);
  const env = deploymentEnv(spec, project), saved = {};
  for (const [name, value] of Object.entries(env)) { saved[name] = process.env[`LAYERFS_${name}`]; process.env[`LAYERFS_${name}`] = value; }
  try {
    const layerfs = new LayerFS(project.name);
    return { layerfs, operator: new LayerFSOperator(layerfs) };
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[`LAYERFS_${name}`];
      else process.env[`LAYERFS_${name}`] = value;
    }
  }
}

/** Closes every Sandbox a Host client opened (its service Sandbox). */
export async function release({ layerfs }) {
  for (const id of [...layerfs.sandboxes]) await layerfs.sandbox.close(id);
}

/**
 * The project as the views draw it: the mirror of one inspect.snapshot, with
 * the Sandboxes the traced calls created (ids from the trace lines). Read
 * through the Host's shared client for the project (TreeReader.use), so the
 * Host does not start and close a service Sandbox per read.
 * @param {object} client a project's client @param {string[]} sandboxes real Sandbox ids
 */
export async function stateOf(client, sandboxes) {
  const snap = await client.operator.inspect.snapshot();
  const m = new Mirror(), boxes = [];
  for (const real of sandboxes) {
    const listed = (snap.sandboxes || []).find((x) => x.id === real);
    boxes.push({ label: m.label("sb", real), real, closed: !listed, workspaces: {}, processes: [] });
  }
  m.absorb(snap, boxes);
  return { s: { ...m.s, roots: {} }, labels: Object.fromEntries(m.toLabel) };
}
