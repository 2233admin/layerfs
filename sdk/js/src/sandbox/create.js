// `sandbox.create`: one container with its daemon, ready for mounts.
import { deployment, invoke } from "../client.js";

/** `sandbox.create()`: `{ id, container }`. */
export async function create(client) {
  const value = await invoke("sandbox.create", { project: client.projectName, deploy: deployment(client.options.deploy) });
  client.sandboxes.add(value.id);
  return { id: value.id, container: value.container };
}
