// The LayerFS JavaScript SDK. The client is lazy: construction does no I/O,
// calls name their Branch, and Sandbox calls take the Sandbox (or its id).
// Calls that are not about a Workspace (fs, branch, project) run in this
// process against the installed Store at `storePath` (Linux only, #352
// F-020); there is no other route. `close()` releases the Store.
import { deployment, invoke, invokeClient, sandboxId, storeClose, storeOpen } from "./client.js";
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
   * else its DSH_LAYERFS_ twin; LAYERFS_CONTAINER_PREFIX (default
   * `layerfs-`) names every container this client creates
   * `<prefix><project>-<Sandbox>`.
   * `options.daemonHost` (else LAYERFS_DAEMON_HOST) is the host this process
   * dials for a daemon's port, published on the Docker host's 127.0.0.1 only;
   * set it when the client runs in a container (`host.docker.internal` on
   * Docker Desktop). Unset, the client dials 127.0.0.1.
   * `options.storePath` (else LAYERFS_STORE_PATH) is the installed Store
   * file this client's Store calls open in this process; it must be on a
   * local Linux filesystem the daemons share, or the calls fail
   * `Unsupported`. `options.sandbox` selects an existing Sandbox for the
   * operator read model. `options.storePolicy` ({ smallFileThreshold, wholeFileDepth,
   * chunkDepth, metadataDepth }) is the Store policy `project.init` records
   * instead of the default. */
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
        ...(env("CONTAINER_PREFIX") ? { containerPrefix: env("CONTAINER_PREFIX") } : {}),
        ...((options.daemonHost ?? env("DAEMON_HOST")) ? { daemonHost: options.daemonHost ?? env("DAEMON_HOST") } : {}),
      },
      storePolicy: options.storePolicy,
      storePath: options.storePath ?? env("STORE_PATH"),
    };
    this.storeOpened = null;
    const selected = options.sandbox === undefined ? null : sandboxId(options.sandbox);
    this.sandboxes = new Set(selected ? [selected] : []);
    this.serviceSandbox = selected ? Promise.resolve(selected) : null;
    this.fs = bind(this, fsMethods);
    this.project = bind(this, { init, list_branches });
    this.branch = bind(this, { list_commits, diff_commits, diff_branches, fork, merge, publish });
    this.sandbox = bind(this, { create, close, mount, exec, status, commit, unmount });
  }

  /**
   * The selected Sandbox, or an automatic service created once on first use.
   * A refused creation is not kept, so the caller's next call is a new attempt.
   */
  service() {
    this.serviceSandbox ??= invoke("sandbox.service", { project: this.projectName, home: this.options.home, deploy: deployment(this.options.deploy) }, this.options).then(
      (value) => { this.sandboxes.add(value.id); return value.id; },
      (error) => { this.serviceSandbox = null; throw error; },
    );
    return this.serviceSandbox;
  }

  /** Opens this client's Store in this process once; a refused open is not
   * kept, so the next call is a new attempt. */
  store() {
    if (!this.options.storePath) throw new LayerFSError("InvalidInput", "Store calls need options.storePath (LAYERFS_STORE_PATH)", null);
    this.storeOpened ??= storeOpen(this).catch((error) => { this.storeOpened = null; throw error; });
    return this.storeOpened;
  }

  /** One Store call in this process. */
  async call(method, args) {
    if (method.startsWith("operator.")) throw new LayerFSError("UnknownMethod", "use @layerfs/sdk/operator", null);
    await this.store();
    return invokeClient(this, method, args);
  }

  /** Releases this client's Store; the process's last client closes it. */
  async close() {
    const opened = this.storeOpened;
    this.storeOpened = null;
    if (!opened) return;
    if (await opened.then(() => true, () => false)) await storeClose(this);
  }
}
