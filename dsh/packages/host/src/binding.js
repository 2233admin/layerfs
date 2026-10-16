// Project bindings: the LayerFS projects, the dsh workspace folder each is
// attached to (at most one; a project may be detached), which project each
// root session uses, and the names of the agents seen. One JSON file under
// the state directory, replaced atomically on every change.
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @typedef {object} Project
 * @property {string} name LayerFS project name (also its LayerFS home entry)
 * @property {string} source the folder Init imported
 * @property {string} volume Docker volume holding the project's Store
 * @property {number} created Unix epoch milliseconds
 * @property {string|null} folder the workspace folder it is attached to, or null
 */

/** Version 1 kept each folder's projects in the folder; version 2 keeps projects by name. */
function upgrade(data) {
  if (data.version !== 1) return data;
  const projects = {}, workspaces = {};
  for (const [folder, w] of Object.entries(data.workspaces)) {
    for (const p of w.projects) projects[p.name] = { ...p, folder };
    workspaces[folder] = { lastUsed: w.lastUsed ?? null };
  }
  return { ...data, version: 2, projects, workspaces };
}

export class BindingStore {
  /** @param {string} stateDir */
  constructor(stateDir) {
    this.file = join(stateDir, "bindings.json");
    this.data = existsSync(this.file) ? upgrade(JSON.parse(readFileSync(this.file, "utf8"))) : { version: 2, projects: {}, workspaces: {}, sessions: {}, agents: {} };
    /**
     * Names removed while this Host runs. The SDK's native binding remembers
     * each name it initialized until the process ends, so Init does not take
     * them again before dsh restarts. Not saved.
     */
    this.retired = new Set();
  }

  save() {
    const tmp = `${this.file}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.data, null, 1) + "\n");
    renameSync(tmp, this.file);
  }

  /** @param {string} folder @returns {{ projects: Project[], lastUsed: string|null }} */
  workspace(folder) {
    const lastUsed = this.data.workspaces[folder]?.lastUsed ?? null;
    return { projects: this.projects().filter((p) => p.folder === folder), lastUsed };
  }

  /** @returns {Project[]} every project, attached or not, oldest first */
  projects() {
    return Object.values(this.data.projects).sort((a, b) => a.created - b.created);
  }

  /** Every project name: names are unique per LayerFS home. */
  allNames() {
    return new Set(Object.keys(this.data.projects));
  }

  /** Adds a project attached to a folder. @param {string} folder @param {Omit<Project, "folder">} project */
  addProject(folder, project) {
    this.data.projects[project.name] = { ...project, folder };
    (this.data.workspaces[folder] ||= { lastUsed: null }).lastUsed = project.name;
    this.save();
  }

  /** A project attached to a folder. @param {string} folder @param {string} name @returns {Project|null} */
  project(folder, name) {
    const p = this.byName(name);
    return p && p.folder === folder ? p : null;
  }

  /** @param {string} name @returns {Project|null} */
  byName(name) {
    return Object.hasOwn(this.data.projects, name) ? this.data.projects[name] : null;
  }

  /**
   * Attaches a project to a workspace folder, as that folder's most recently
   * used project, or detaches it (null). Sessions that already use it keep it.
   * @param {string} name @param {string|null} folder @returns {Project}
   */
  attach(name, folder) {
    const p = this.byName(name);
    if (!p) throw Object.assign(new Error(`no LayerFS project named ${name}`), { code: "not-found", status: 404 });
    if (p.folder && this.data.workspaces[p.folder]?.lastUsed === name) this.data.workspaces[p.folder].lastUsed = null;
    p.folder = folder;
    if (folder) (this.data.workspaces[folder] ||= { lastUsed: null }).lastUsed = name;
    this.save();
    return p;
  }

  /** The session's own choice: { project, locked, folder }, or null before one is made. */
  session(rootId) {
    return this.data.sessions[rootId] ?? null;
  }

  /**
   * The project a root session uses: its choice (kept when the project is
   * later detached), else the only project of its folder, else the folder's
   * most recently used one. Null when the folder has no project (a session
   * without LayerFS).
   * @param {string} rootId @param {string|undefined} folder @returns {Project|null}
   */
  projectFor(rootId, folder) {
    const chosen = this.session(rootId);
    if (chosen) return chosen.project ? this.byName(chosen.project) : null;
    if (!folder) return null;
    const { projects, lastUsed } = this.workspace(folder);
    return projects.length === 1 ? projects[0] : projects.find((p) => p.name === lastUsed) ?? null;
  }

  /**
   * Chooses a session's project (null: no LayerFS). Refused once locked.
   * @returns {boolean} whether the choice was taken
   */
  choose(rootId, folder, name) {
    const current = this.session(rootId);
    if (current && current.locked) return false;
    if (name !== null && !this.project(folder, name)) throw Object.assign(new Error(`no LayerFS project ${name} in ${folder}`), { code: "not-found" });
    this.data.sessions[rootId] = { project: name, locked: false, folder };
    if (name !== null) this.data.workspaces[folder].lastUsed = name;
    this.save();
    return true;
  }

  /**
   * Forgets a removed project: no folder uses it, and sessions that chose it
   * have no project (a later project of the same name is not theirs).
   * @param {string} name
   */
  remove(name) {
    delete this.data.projects[name];
    this.retired.add(name);
    for (const w of Object.values(this.data.workspaces)) if (w.lastUsed === name) w.lastUsed = null;
    for (const choice of Object.values(this.data.sessions)) if (choice.project === name) choice.project = null;
    this.save();
  }

  /** Locks a session's project at its first LayerFS-bound bash call. */
  lock(rootId, name, folder) {
    const current = this.session(rootId);
    if (current && current.locked) return;
    this.data.sessions[rootId] = { project: name, locked: true, folder };
    this.save();
  }

  /** @param {string} sessionId @returns {{ root: string, name: string }|null} */
  agent(sessionId) {
    return this.data.agents[sessionId] ?? null;
  }

  /** Records an agent's root session and display name. */
  setAgent(sessionId, root, name) {
    const known = this.data.agents[sessionId];
    if (known && known.root === root && known.name === name) return;
    this.data.agents[sessionId] = { root, name };
    this.save();
  }

  /** Agents of one root session, as { id: name }. */
  agentsOf(rootId) {
    return Object.fromEntries(Object.entries(this.data.agents).filter(([, a]) => a.root === rootId).map(([id, a]) => [id, a.name]));
  }
}
