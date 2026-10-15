// The LayerFS JavaScript SDK. The client is lazy: construction does no I/O,
// calls name their Branch, and Sandbox calls take the Sandbox (or its id).
// Calls that are not about a Workspace reach the Store through one service
// Sandbox, created on the first such call unless `sandbox` names one.
import { invokeClient } from "./client.js";
import { LayerFSError } from "./errors.js";
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
import { status } from "./sandbox/status.js";
import { unmount } from "./sandbox/unmount.js";

export { LayerFSError, isRefusal, CODES } from "./errors.js";

const bind = (client, methods) =>
  Object.fromEntries(Object.entries(methods).map(([name, method]) => [name, async (...args) => method(client, ...args)]));

export class LayerFS {
  /** Selects a project without filesystem, native addon or network I/O. */
  constructor(projectName) {
    if (typeof projectName !== "string" || !/^[a-z0-9](?:[a-z0-9_.-]{0,61}[a-z0-9])?$/.test(projectName)) {
      throw new LayerFSError("InvalidInput", "a project name is required", null);
    }
    this.projectName = projectName;
    const env = process.env;
    this.options = {
      home: env.LAYERFS_HOME,
      deploy: {
        docker: env.LAYERFS_DOCKER,
        image: env.LAYERFS_IMAGE,
        volume: env.LAYERFS_VOLUME,
        daemon: env.LAYERFS_DAEMON,
      },
    };
    this.sandboxes = new Set();
    this.serviceSandbox = null;
    this.fs = bind(this, fsMethods);
    this.project = bind(this, { init, list_branches });
    this.branch = bind(this, { list_commits, diff_commits, diff_branches, fork, merge, publish });
    this.sandbox = bind(this, { create, close, mount, exec, status, commit, unmount });
  }

  /** The Sandbox that serves Store calls, created once on first use. */
  service() {
    this.serviceSandbox ??= invokeClient(this, "sandbox.service", {}).then((value) => { this.sandboxes.add(value.id); return value.id; });
    return this.serviceSandbox;
  }

  /** One SDK call through the service Sandbox. */
  async call(method, args) {
    if (method.startsWith("operator.")) throw new LayerFSError("UnknownMethod", "use @layerfs/sdk/operator", null);
    const sandbox = await this.service();
    return invokeClient(this, method, { ...args, sandbox });
  }

}
