// The LayerFS JavaScript SDK. The client is lazy: construction does no I/O,
// calls name their Branch, and Sandbox calls take the Sandbox (or its id).
// Calls that are not about a Workspace reach the Store through one service
// Sandbox, created on the first such call unless `sandbox` names one.
import { deployment, invoke, invokeClient } from "./client.js";
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
  /** Selects a project without filesystem, native addon or network I/O.
   * `options.trace` names a per-call trace file (overrides LAYERFS_TRACE,
   * then DSH_LAYERFS_TRACE); `options.traceStep` labels its lines
   * (overrides LAYERFS_TRACE_STEP, then DSH_LAYERFS_TRACE_STEP). Deployment
   * settings read LAYERFS_HOME, _DOCKER, _IMAGE, _VOLUME and _DAEMON, each
   * else its DSH_LAYERFS_ twin. */
  constructor(projectName, options = {}) {
    if (typeof projectName !== "string" || !/^[a-z0-9](?:[a-z0-9_.-]{0,61}[a-z0-9])?$/.test(projectName)) {
      throw new LayerFSError("InvalidInput", "a project name is required", null);
    }
    this.projectName = projectName;
    // Each LAYERFS_ setting falls back to its DSH_LAYERFS_ twin, the only
    // names deepseek-harness may set in a bash call's environment.
    const env = (name) => process.env[`LAYERFS_${name}`] || process.env[`DSH_LAYERFS_${name}`] || undefined;
    this.options = {
      home: env("HOME"),
      trace: options.trace ?? env("TRACE"),
      traceStep: options.traceStep,
      deploy: {
        docker: env("DOCKER"),
        image: env("IMAGE"),
        volume: env("VOLUME"),
        daemon: env("DAEMON"),
      },
    };
    this.sandboxes = new Set();
    this.serviceSandbox = null;
    this.fs = bind(this, fsMethods);
    this.project = bind(this, { init, list_branches });
    this.branch = bind(this, { list_commits, diff_commits, diff_branches, fork, merge, publish });
    this.sandbox = bind(this, { create, close, mount, exec, status, commit, unmount });
  }

  /**
   * The Sandbox that serves Store calls, created once on first use. A refused
   * creation is not kept, so the caller's next call is a new attempt.
   */
  service() {
    this.serviceSandbox ??= invoke("sandbox.service", { project: this.projectName, home: this.options.home, deploy: deployment(this.options.deploy) }, this.options).then(
      (value) => { this.sandboxes.add(value.id); return value.id; },
      (error) => { this.serviceSandbox = null; throw error; },
    );
    return this.serviceSandbox;
  }

  /** One SDK call through the service Sandbox. */
  async call(method, args) {
    if (method.startsWith("operator.")) throw new LayerFSError("UnknownMethod", "use @layerfs/sdk/operator", null);
    const sandbox = await this.service();
    return invokeClient(this, method, { ...args, sandbox });
  }

}
