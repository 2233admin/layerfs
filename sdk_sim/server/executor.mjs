// Commands in mounted Workspaces through `sandbox.exec`. The daemon supervises
// no command: this server, as the Sandbox runtime owner's client, keeps the
// background processes it started and answers list and cancel itself
// (SPEC section 4.2). It also tracks conflict markers in a Workspace after a
// Conflict: a cheap `grep` after each command there, until a Commit succeeds.

export class Executor {
  constructor(layerfs, operator) {
    this.layerfs = layerfs;
    this.operator = operator;
  }

  /** One command to its end, or started in the background. */
  async exec(box, path, command, background) {
    return background ? this.operator.process.start(box.real, path, command) : this.layerfs.sandbox.exec(box.real, path, command);
  }

  async list(box) {
    const { items } = await this.operator.process.list(box.real);
    return items;
  }

  cancel(box, process) {
    return this.operator.process.cancel(box.real, process);
  }
}
