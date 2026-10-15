// The LayerFS JavaScript SDK. The client is lazy: construction does no I/O,
// calls name their Branch, and Sandbox calls take the Sandbox (or its id).
// Calls that are not about a Workspace reach the Store through one service
// Sandbox, created on the first such call unless `sandbox` names one.
import { invoke } from "./client.js";
import * as fsMethods from "./fs/index.js";
import { init } from "./project/init.js";
import { list_branches } from "./project/list_branches.js";
import { diff_branches } from "./branch/diff_branches.js";
import { diff_commits } from "./branch/diff_commits.js";
import { fork } from "./branch/fork.js";
import { list_commits } from "./branch/list_commits.js";
import { merge } from "./branch/merge.js";
import { publish } from "./branch/publish.js";
import { close } from "./sandbox/close.js";
import { commit } from "./sandbox/commit.js";
import { create } from "./sandbox/create.js";
import { exec } from "./sandbox/exec.js";
import { mount } from "./sandbox/mount.js";
import { cancel, list_processes } from "./sandbox/processes.js";
import { status } from "./sandbox/status.js";
import { unmount } from "./sandbox/unmount.js";
import { snapshot } from "./inspect/snapshot.js";

export { LayerFSError, isRefusal, CODES } from "./errors.js";

const bind = (client, methods) =>
  Object.fromEntries(Object.entries(methods).map(([name, method]) => [name, (...args) => method(client, ...args)]));

export class LayerFS {
  /**
   * @param {{ project?: string, sandbox?: string, home?: string,
   *   deploy?: { docker?: string, image?: string, volume?: string, daemon?: string } }} options
   */
  constructor(options = {}) {
    this.options = options;
    this.projectName = options.project;
    this.sandboxes = new Set();
    this.serviceSandbox = options.sandbox ? Promise.resolve(options.sandbox) : null;
    this.fs = bind(this, fsMethods);
    this.project = bind(this, { init, list_branches });
    this.branch = bind(this, { list_commits, diff_commits, diff_branches, fork, merge, publish });
    this.sandbox = bind(this, { create, close, mount, exec, status, commit, unmount, list_processes, cancel });
    this.inspect = bind(this, { snapshot });
  }

  /** The Sandbox that serves Store calls, created once on first use. */
  service() {
    this.serviceSandbox ??= create(this).then((sandbox) => sandbox.id);
    return this.serviceSandbox;
  }

  /** One SDK call through the service Sandbox. */
  async call(method, args) {
    const sandbox = await this.service();
    return invoke(method, { ...args, project: this.projectName, sandbox });
  }

  /**
   * The operator read model: history from the service Sandbox and the
   * Workspaces of every Sandbox this client created. `since` is the version
   * of an earlier answer.
   */
  async snapshot(since) {
    const service = await this.service();
    const ids = [...new Set([service, ...this.sandboxes])];
    const answers = await Promise.all(ids.map((sandbox) => invoke("inspect.snapshot", { project: this.projectName, sandbox })));
    const version = answers.map((answer) => answer.version).join(".");
    if (since === version) return { kind: "unchanged", version };
    const history = answers[0];
    return {
      kind: "ok",
      version,
      project: history.project,
      branches: history.branches,
      commits: history.commits,
      more: history.more,
      layers: history.layers,
      moreLayers: history.moreLayers,
      sandboxes: ids.map((id, index) => ({
        id,
        status: "Ready",
        workspaces: answers[index].workspaces.map((workspace) => ({ ...workspace, path: workspace.directory })),
      })),
    };
  }
}
