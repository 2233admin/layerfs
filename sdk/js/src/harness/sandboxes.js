// One shared Sandbox per Branch: agents on a Branch share one daemon and each
// tool call gets its own Workspace in it.

export class Sandboxes {
  constructor(layerfs) {
    this.layerfs = layerfs;
    this.byBranch = new Map();
  }

  /** The Sandbox serving `branch`, created on first use. */
  forBranch(branch) {
    if (!this.byBranch.has(branch)) this.byBranch.set(branch, this.layerfs.sandbox.create());
    return this.byBranch.get(branch);
  }

  /** Closes every Sandbox once; returns each one's outcome, refusals included. */
  async closeAll() {
    const outcomes = [];
    for (const [branch, pending] of this.byBranch) {
      try {
        const sandbox = await pending;
        outcomes.push({ branch, sandbox: sandbox.id, ...(await this.layerfs.sandbox.close(sandbox)) });
      } catch (error) {
        outcomes.push({ branch, refused: error.code ?? "Failed", message: error.message });
      }
    }
    this.byBranch.clear();
    return outcomes;
  }
}
