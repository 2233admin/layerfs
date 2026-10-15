// One Bash tool call: mount (or reuse the Workspace kept after a conflict) →
// exec → commit → unmount. Each phase is its own method so tests and the UI
// can drive them separately. Nothing is retried: a refused phase is reported
// and the Workspace is kept for the agent's next call.
import { Sandboxes } from "./sandboxes.js";
import { toolResult } from "./result.js";

/** Refusals a commit or unmount reports instead of throwing. */
const KEPT_ON = new Set(["Conflict", "HeadMoved"]);
const STAYS_ON = new Set(["Dirty", "Busy"]);

export class ToolCalls {
  constructor(layerfs, sandboxes = new Sandboxes(layerfs)) {
    this.layerfs = layerfs;
    this.sandboxes = sandboxes;
    this.kept = new Map();
  }

  static key(branch, agent) {
    return `${agent ?? ""}@${branch}`;
  }

  /** The kept Workspace of this agent on `branch`, else a new mount. */
  async mount({ branch, agent }) {
    const kept = this.kept.get(ToolCalls.key(branch, agent));
    if (kept) return { ...kept, kept: true };
    const sandbox = await this.sandboxes.forBranch(branch);
    const mounted = await this.layerfs.sandbox.mount(sandbox, { branch });
    return { sandbox, path: mounted.path, branch, agent, kept: false, mounted };
  }

  exec(workspace, command, options) {
    return this.layerfs.sandbox.exec(workspace.sandbox, workspace.path, command, options);
  }

  /** `{ commit }`, or `{ refusal }` for Conflict and HeadMoved, which keep the Workspace. */
  async commit(workspace, { agent, call } = {}) {
    try {
      return { commit: await this.layerfs.sandbox.commit(workspace.sandbox, workspace.path, { agent, call }) };
    } catch (error) {
      if (!KEPT_ON.has(error.code)) throw error;
      this.keep(workspace);
      return { refusal: error };
    }
  }

  /** `{ kind: "Unmounted" }`, or the Dirty or Busy refusal, which keep the Workspace mounted. */
  async unmount(workspace) {
    try {
      const value = await this.layerfs.sandbox.unmount(workspace.sandbox, workspace.path);
      this.kept.delete(ToolCalls.key(workspace.branch, workspace.agent));
      return value;
    } catch (error) {
      if (!STAYS_ON.has(error.code)) throw error;
      this.keep(workspace);
      return { kind: error.code, message: error.message, detail: error.detail };
    }
  }

  keep(workspace) {
    const { sandbox, path, branch, agent } = workspace;
    this.kept.set(ToolCalls.key(branch, agent), { sandbox, path, branch, agent });
  }

  /** The whole tool call; returns the result envelope. */
  async run({ branch, agent, call, command }) {
    const workspace = await this.mount({ branch, agent });
    const exec = await this.exec(workspace, command);
    const { commit, refusal } = await this.commit(workspace, { agent, call });
    const unmount = refusal ? null : await this.unmount(workspace);
    const kept = this.kept.has(ToolCalls.key(branch, agent));
    return toolResult({ exec, commit, refusal, unmount, workspace: { ...workspace, kept } });
  }
}
