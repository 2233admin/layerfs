// The move to #373's layout, when the Host starts (no dsh run is live then).
// Sandboxes of the older kinds (each project's service Sandbox and named
// ones, records under <home>/_sandboxes/) are disposable: their containers
// are removed, then their records, and each project's service.record. Stores
// are untouched. One attempt each; a container Docker could not remove keeps
// every record, logged, for the next start.
import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

/** @param {object} spec resolved Host settings @param {(file: string, args: string[]) => Promise<unknown>} [run] runs docker */
export async function migrate(spec, run = execute, warn = console.warn) {
  const root = join(spec.home, "_sandboxes");
  if (existsSync(root)) {
    let kept = false;
    for (const entry of readdirSync(root)) {
      let container = null;
      try { container = readFileSync(join(root, entry, "container"), "utf8").trim(); } catch { /* claimed, never started */ }
      if (!container) continue;
      await run("docker", ["-H", `unix://${spec.docker}`, "rm", "-f", container]).catch((error) => {
        if (/No such container/i.test(String(error?.stderr ?? error?.message))) return;
        kept = true;
        warn(`layerfs: could not remove the older Sandbox ${entry} (${container}): ${error.message}`);
      });
    }
    if (kept) return;
    rmSync(root, { recursive: true, force: true });
  }
  for (const entry of readdirSync(spec.home)) {
    const dir = join(spec.home, entry);
    if (statSync(dir).isDirectory()) rmSync(join(dir, "service.record"), { force: true });
  }
}
