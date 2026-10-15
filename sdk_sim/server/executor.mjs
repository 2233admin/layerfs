// Commands in mounted Workspaces through `sandbox.exec`. The daemon supervises
// no command: this server, as the Sandbox runtime owner's client, keeps the
// background processes it started and answers list and cancel itself
// (SPEC section 4.2). It also tracks conflict markers in a Workspace after a
// Conflict: a cheap `grep` after each command there, until a Commit succeeds.

const MARKER = "^<<<<<<< ";

export class Executor {
  constructor(layerfs, operator) {
    this.layerfs = layerfs;
    this.operator = operator;
  }

  /** One command to its end, or started in the background. */
  async exec(box, path, command, background) {
    const value = await this.layerfs.sandbox.exec(box.real, path, command, { background });
    const ws = box.workspaces[path];
    if (ws && ws.markers.length) ws.markers = await this.markers(box, path, ws.markers);
    return value;
  }

  /** Of `paths`, the files that still hold a conflict block. */
  async markers(box, path, paths) {
    const quoted = paths.map((p) => `'.${p.replace(/'/g, "'\\''")}'`).join(" ");
    const found = await this.layerfs.sandbox.exec(box.real, path, `grep -l -e '${MARKER}' -- ${quoted} 2>/dev/null; true`);
    const hit = new Set(found.stdout.split("\n").filter(Boolean).map((p) => p.replace(/^\./, "")));
    return paths.filter((p) => hit.has(p));
  }

  async list(box) {
    const { items } = await this.operator.process.list(box.real);
    return items;
  }

  cancel(box, process) {
    return this.operator.process.cancel(box.real, process);
  }
}
