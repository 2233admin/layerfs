// Sandbox management for the LayerFS page (#373): what runs, and the few
// actions on it.
//   one project   its Sandboxes from one inspect.snapshot (which starts none),
//                 each mounted Workspace with its Branch, uncommitted changes,
//                 background processes, and who mounted it (the agents' traces)
//   all projects  Docker, the Store container, free disk, and each project's
//                 Sandbox containers from one `docker ps`
// A read starts nothing. An action is one SDK or Docker call, never repeated;
// one that would cut off an agent's call running in that Workspace is refused.
import { execFile } from "node:child_process";
import { readFileSync, statfsSync } from "node:fs";
import { connect } from "node:net";
import { promisify } from "node:util";
import { buildOf, ensureBox, storeFile, VOLUMES } from "./box.js";
import { isSim } from "./layerfs-client.js";
import { frame, readFrames } from "./port/frames.mjs";

const run = promisify(execFile);
/** Workspaces one Sandbox's daemon admits (the SDK's daemon setup, `namespaces`). */
export const CAPACITY = 16;
/** A Workspace with uncommitted changes and no call for this long is flagged. */
export const LEFT_MS = 10 * 60_000;
const DOCKER_MS = 5_000, PING_MS = 1_000;
const RANK = { down: 0, degraded: 1, ok: 2 };

const docker = (spec, ...args) => run("docker", ["-H", `unix://${spec.docker}`, ...args], { timeout: DOCKER_MS }).then((r) => r.stdout.trim());
const key = (sandbox, path) => `${sandbox}\n${path}`;
const worst = (levels) => levels.reduce((a, b) => (RANK[b] < RANK[a] ? b : a), "ok");
const refuse = (status, code, message) => Object.assign(new Error(message), { status, code });

/** One project's Sandboxes, as its Sandboxes tab draws them. */
export function projectRuntime(trees, collector, project, now = Date.now()) {
  return trees.use(project, async ({ operator }) => {
    const snap = await operator.inspect.snapshot();
    const processes = (await operator.process.list()).items ?? [];
    const busy = collector.busyOf(project.name), mounts = collector.mountsOf(project.name);
    const sandboxes = (snap.sandboxes ?? []).map((sb) => {
      const workspaces = sb.workspaces.filter((w) => w.mounted && w.directory).map((w) => {
        const by = mounts[key(sb.id, w.directory)], inUse = busy.has(key(sb.id, w.directory));
        const uncommitted = w.dirty ? Math.max(w.dirty.inodes, w.dirty.entries) : 0;
        const idleMs = by && !inUse ? Math.max(0, now - by.lastAt) : null;
        return {
          path: w.directory, branch: w.branch ?? null, activity: w.activity ?? null, uncommitted,
          stale: w.headMovedSinceMount === true, pendingMerge: !!w.pendingMerge,
          agent: by?.agent ?? null, mountedAt: by?.at ?? null, idleMs, busy: inUse,
          processes: processes.filter((p) => p.sandbox === sb.id && p.path === w.directory).map(({ id, command, status }) => ({ id, command, status })),
          // left with uncommitted changes: worth a look, never acted on by itself
          level: uncommitted && idleMs !== null && idleMs >= LEFT_MS ? "degraded" : "ok",
        };
      });
      const full = workspaces.length >= CAPACITY;
      return { id: sb.id, name: sb.name ?? null, capacity: CAPACITY, workspaces, level: worst([full ? "degraded" : "ok", ...workspaces.map((w) => w.level)]) };
    });
    const gone = (snap.gone ?? []).map(({ id, name }) => ({ id, name: name ?? null }));
    return { project: project.name, simulated: isSim(project), sandboxes, gone, level: worst([...sandboxes.map((s) => s.level), gone.length ? "degraded" : "ok"]) };
  });
}

/** Every project's Sandboxes and the shared parts, as the All projects page draws them. */
export async function overview(spec, bindings, trees, collector) {
  const engine = await engineState(spec);
  const containers = engine.level === "ok" ? await containersOf(spec) : [];
  const store = spec.box ? await storeState(spec, engine) : null;
  const disk = { host: freeBytes(spec.home), vm: store?.level === "ok" ? await vmFree(spec) : null };
  const projects = bindings.projects(), known = new Set(projects.map((p) => p.name));
  const cards = await Promise.all(projects.map(async (p) => {
    const own = containers.filter((c) => c.project === p.name);
    const card = { name: p.name, simulated: isSim(p), containers: own.length, sandboxes: [], workspaces: 0, level: "ok", note: null };
    // a project with nothing running is read from Docker alone: no client, no Store opened
    if (!own.some((c) => c.running) && !card.simulated) return card;
    try {
      const r = await projectRuntime(trees, collector, p);
      card.sandboxes = r.sandboxes.map((s) => ({ id: s.id, name: s.name, used: s.workspaces.length, capacity: s.capacity, level: s.level }));
      card.workspaces = r.sandboxes.reduce((n, s) => n + s.workspaces.length, 0);
      card.level = r.level;
      const left = r.sandboxes.flatMap((s) => s.workspaces).filter((w) => w.level !== "ok");
      card.note = r.gone.length ? `${r.gone.length} Sandbox${r.gone.length === 1 ? "" : "es"} gone` : left.length ? `${left.length} Workspace${left.length === 1 ? "" : "s"} left with uncommitted changes` : null;
    } catch (error) {
      card.level = "down";
      card.note = error.message;
    }
    return card;
  }));
  cards.sort((a, b) => RANK[a.level] - RANK[b.level] || b.workspaces - a.workspaces || a.name.localeCompare(b.name));
  // a Sandbox container of no project of this home, or one left stopped
  const leftovers = containers.filter((c) => !known.has(c.project) || !c.running).map(({ name, project, running, status }) => ({ name, project, running, status }));
  // older Sandboxes the startup cleanup kept because they may hold work (migrate.js): yours to commit or discard, then remove
  for (const k of spec.migration?.kept ?? [])
    if (!leftovers.some((l) => l.name === k.container)) leftovers.push({ name: k.sandbox, project: "", running: true, status: `older Sandbox (container ${k.container.slice(0, 12)}), kept: ${k.reason}` });
  const sandboxes = cards.reduce((n, c) => n + c.sandboxes.length, 0), workspaces = cards.reduce((n, c) => n + c.workspaces, 0);
  return {
    level: worst([engine.level, store?.level ?? "ok", leftovers.length ? "degraded" : "ok"]),
    engine, store, disk, projects: cards, leftovers, totals: { projects: cards.length, sandboxes, workspaces },
  };
}

/** One action on a project's Workspace or process: unmount, discard (unmount dropping its changes) or stop. */
export async function projectAction(trees, collector, project, body) {
  const { action } = body;
  if (action === "unmount" || action === "discard") {
    const { sandbox, path } = body;
    if (typeof sandbox !== "string" || typeof path !== "string") throw refuse(400, "invalid-workspace", "a Workspace is { sandbox, path }");
    if (collector.busyOf(project.name).has(key(sandbox, path))) throw refuse(409, "busy", `an agent's call is running in ${path}; wait for it to end`);
    if (action === "discard" && body.confirm !== path) throw refuse(400, "not-confirmed", `confirm with the Workspace's path, ${path}`);
    return trees.use(project, ({ layerfs }) => layerfs.workspace.unmount({ sandbox, path }, action === "discard"));
  }
  if (action === "stop") {
    if (typeof body.process !== "string") throw refuse(400, "invalid-process", "a process is its id");
    return trees.use(project, ({ operator }) => operator.process.cancel(body.process));
  }
  throw refuse(400, "invalid-action", "the action is unmount, discard or stop");
}

/** Starts the Store container when it is stopped or missing; a running one is left alone. */
export async function startStore(spec) {
  if (!spec.box) throw refuse(409, "no-store", "this Host runs no Store container (Linux runs Store calls in-process)");
  const state = await storeState(spec, await engineState(spec));
  if (state.state === "running") throw refuse(409, "running", state.answering ? "layerfs-store is running and answering" : "layerfs-store runs but does not answer; restarting it is not offered yet");
  if (state.state === "unknown") throw refuse(409, "no-docker", "Docker does not answer; start Docker first");
  await ensureBox(spec);
  return storeState(spec, await engineState(spec));
}

/** Removes the stopped leftover containers named in `names`; one `docker rm` each, a running one refused. */
export async function cleanLeftovers(spec, bindings, names) {
  if (!Array.isArray(names) || !names.length || names.some((n) => typeof n !== "string")) throw refuse(400, "invalid-names", "names lists the leftover containers to remove");
  const known = new Set(bindings.projects().map((p) => p.name));
  const left = new Map((await containersOf(spec)).filter((c) => !known.has(c.project) || !c.running).map((c) => [c.name, c]));
  const results = [];
  for (const name of names) {
    const c = left.get(name);
    if (!c) { results.push({ name, ok: false, message: "not a leftover of this home" }); continue; }
    if (c.running) { results.push({ name, ok: false, message: "still running; stop it first" }); continue; }
    try { await docker(spec, "rm", name); results.push({ name, ok: true }); } catch (error) { results.push({ name, ok: false, message: error.stderr?.trim() || error.message }); }
  }
  return { results };
}

async function engineState(spec) {
  try { return { level: "ok", version: await docker(spec, "version", "--format", "{{.Server.Version}}") }; } catch (error) { return { level: "down", error: error.stderr?.trim() || error.message }; }
}

/** This home's Sandbox containers (named `<prefix><project>-<n>`), running or not. */
async function containersOf(spec) {
  const out = await docker(spec, "ps", "-a", "--filter", "label=layerfs.role=sandbox", "--format", "{{.Names}}\t{{.State}}\t{{.Status}}\t{{.Label \"layerfs.project\"}}\t{{.Label \"layerfs.sandbox\"}}");
  return out.split("\n").filter(Boolean).map((row) => {
    const [name, state, status, project, sandbox] = row.split("\t");
    return { name, running: state === "running", status, project, sandbox };
  }).filter((c) => c.name.startsWith(spec.prefix));
}

async function storeState(spec, engine) {
  if (engine.level !== "ok") return { level: "down", state: "unknown", name: spec.box };
  let row;
  try { row = await docker(spec, "inspect", "-f", '{{.State.Running}}\t{{index .Config.Labels "layerfs.build"}}\t{{.State.StartedAt}}', spec.box); } catch { return { level: "down", state: "missing", name: spec.box }; }
  const [running, build, startedAt] = row.split("\t"), expected = buildOf(spec.bundle);
  if (running !== "true") return { level: "down", state: "stopped", name: spec.box, build };
  const answering = await ping(spec.home);
  return { level: !answering ? "down" : build !== expected ? "degraded" : "ok", state: "running", name: spec.box, build, expected, startedAt, answering };
}

/** Whether the Store container's worker answers a ping within PING_MS. */
function ping(home) {
  let file;
  try { file = JSON.parse(readFileSync(storeFile(home), "utf8")); } catch { return Promise.resolve(false); }
  return new Promise((resolve) => {
    const socket = connect({ host: "127.0.0.1", port: file.port }, () => socket.write(Buffer.concat([frame({ secret: file.secret }), frame({ id: 1, fn: "ping" })])));
    const done = (value) => { clearTimeout(timer); socket.destroy(); resolve(value); };
    const timer = setTimeout(() => done(false), PING_MS);
    readFrames(socket, (value) => { if (value?.id === 1) done(value.answer?.value === "ready"); }, () => done(false));
    socket.on("error", () => done(false));
    socket.on("close", () => done(false));
  });
}

function freeBytes(path) {
  try { const s = statfsSync(path); return s.bavail * s.bsize; } catch { return null; }
}

/** Free bytes of Docker's volume disk, as the Store container sees it. */
async function vmFree(spec) {
  try {
    const out = await docker(spec, "exec", spec.box, "df", "-kP", VOLUMES);
    const kb = Number(out.split("\n").pop().trim().split(/\s+/)[3]);
    return Number.isFinite(kb) ? kb * 1024 : null;
  } catch { return null; }
}
