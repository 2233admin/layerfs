// LayerFS SDK clients the Host uses for a project: Init, and the project
// state the views draw (inspect.snapshot through the model's mirror). The
// SDK captures its deployment from the environment at construction, so the
// project's settings are set for that synchronous step only. A simulated
// project (backend "sim") has a client of the simulator instead (sim/).
import { Mirror } from "@dsh-layerfs/model/mirror.js";
import { DAEMON_HOST, storePathOf } from "./box.js";
import { simClient } from "./sim/client.js";

export const isSim = (project) => project.backend === "sim";

/** The environment one project's SDK client and its agents' bash calls use. */
export function deploymentEnv(spec, project) {
  // the SDK asks for every deployment setting and, for Store calls, a Store
  // path (#352 F-020); a simulated project uses none of them
  if (isSim(project)) return { HOME: spec.home, DOCKER: "sim", IMAGE: "sim", DAEMON: "sim", VOLUME: project.volume, STORE_PATH: "sim" };
  return {
    HOME: spec.home,
    DOCKER: spec.docker,
    IMAGE: project.image ?? spec.image ?? "",
    DAEMON: spec.daemon ?? "",
    VOLUME: project.volume,
    // the Store in the volume, under Docker's volume directory: Import
    // installs it there and Store calls open it
    STORE_PATH: storePathOf(project.volume),
    // the project's Sandboxes are <prefix><project>-<n>
    CONTAINER_PREFIX: spec.prefix,
    // macOS: the calls run in the Store container, which sees that directory and
    // Sandbox daemons at the Docker host
    ...(spec.box ? { DAEMON_HOST, STORE_CONTAINER: spec.box, BUNDLE: spec.bundle } : {}),
  };
}

/** Constructs a LayerFS client and operator for one project. */
export async function clientFor(spec, project) {
  if (isSim(project)) return simClient(spec.home, project.name);
  const { LayerFS } = await import(spec.sdk);
  const { LayerFSOperator } = await import(spec.operator);
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

/** Releases a Host client: its Store. The project's Sandboxes close themselves when idle (#373). */
export async function release({ layerfs }) {
  await layerfs.close?.();
}

/**
 * The project as the views draw it: the mirror of one inspect.snapshot.
 * History comes from the Store and Workspaces from the project's running
 * Sandboxes, found from their records, so reading starts no Sandbox; one
 * found stopped (closed when idle) is reclaimed by the listing and not
 * drawn. A Sandbox the listing found running but whose snapshot then found
 * gone is drawn closed. Read through the Host's shared client for the
 * project (TreeReader.use).
 * @param {object} client a project's client
 */
export async function stateOf(client) {
  const snap = await olderCommits(client.layerfs, await client.operator.inspect.snapshot());
  const m = new Mirror();
  m.project = snap.project;
  const boxes = [
    ...(snap.sandboxes || []).map((x) => ({ label: m.label("sb", x.id), real: x.id, closed: false, workspaces: {}, processes: [] })),
    ...(snap.gone || []).map((x) => ({ label: m.label("sb", x.id), real: x.id, closed: true, workspaces: {}, processes: [] })),
  ];
  m.absorb(snap, boxes);
  return { s: { ...m.s, roots: {} }, labels: Object.fromEntries(m.toLabel) };
}

/**
 * The snapshot holds only each Branch's newest Commits (a few per Branch, to
 * fit one answer) and names in `more` every Branch it cut short; the rest come
 * from branch.list_commits, so History shows every Commit and links each to
 * its parent. A Commit another Branch already listed comes once.
 */
async function olderCommits(layerfs, snap) {
  const cut = Object.keys(snap.more || {});
  if (!cut.length) return snap;
  const commits = [...snap.commits], seen = new Set(commits.map((c) => c.id));
  for (const branch of cut) {
    for (let pos = 0; pos !== null;) {
      const page = await layerfs.branch.list_commits(branch, LIST_PAGE, pos);
      for (const c of page.items) if (!seen.has(c.id)) { seen.add(c.id); commits.push(c); }
      pos = page.hasMore ? page.nextPagePos : null;
    }
  }
  return { ...snap, commits, more: {} };
}
const LIST_PAGE = 50;
