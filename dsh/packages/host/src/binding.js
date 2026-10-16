// Project bindings: which LayerFS projects each dsh workspace folder has,
// which one each root session uses, and the names of the agents seen. One
// JSON file under the state directory, replaced atomically on every change.
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @typedef {object} Project
 * @property {string} name LayerFS project name (also its LayerFS home entry)
 * @property {string} source the folder Init imported
 * @property {string} volume Docker volume holding the project's Store
 * @property {number} created Unix epoch milliseconds
 */

export class BindingStore {
  /** @param {string} stateDir */
  constructor(stateDir) {
    this.file = join(stateDir, "bindings.json");
    this.data = existsSync(this.file) ? JSON.parse(readFileSync(this.file, "utf8")) : { version: 1, workspaces: {}, sessions: {}, agents: {} };
  }

  save() {
    const tmp = `${this.file}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.data, null, 1) + "\n");
    renameSync(tmp, this.file);
  }

  /** @param {string} folder @returns {{ projects: Project[], lastUsed: string|null }} */
  workspace(folder) {
    const w = this.data.workspaces[folder];
    return w ? { projects: w.projects, lastUsed: w.lastUsed ?? null } : { projects: [], lastUsed: null };
  }

  /** Every project name bound anywhere: names are unique per LayerFS home. */
  allNames() {
    return new Set(Object.values(this.data.workspaces).flatMap((w) => w.projects.map((p) => p.name)));
  }

  /** @param {string} folder @param {Project} project */
  addProject(folder, project) {
    const w = (this.data.workspaces[folder] ||= { projects: [], lastUsed: null });
    w.projects.push(project);
    w.lastUsed = project.name;
    this.save();
  }

  /** @param {string} folder @param {string} name @returns {Project|null} */
  project(folder, name) {
    return this.workspace(folder).projects.find((p) => p.name === name) ?? null;
  }

  /** The session's own choice: { project, locked, folder }, or null before one is made. */
  session(rootId) {
    return this.data.sessions[rootId] ?? null;
  }

  /**
   * The project a root session uses: its choice, else the only project of
   * its folder, else the folder's most recently used one. Null when the
   * folder has no project (a session without LayerFS).
   * @param {string} rootId @param {string|undefined} folder @returns {Project|null}
   */
  projectFor(rootId, folder) {
    const chosen = this.session(rootId);
    if (chosen) return chosen.project ? this.project(chosen.folder ?? folder, chosen.project) : null;
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
