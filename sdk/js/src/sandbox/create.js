// `sandbox.create`: one container with its daemon, ready for mounts.
import { deployment, invoke } from "../client.js";

/** `sandbox.create()`: an opaque persistent Sandbox id. */
export async function create(client) {
  const value = await invoke("sandbox.create", { project: client.projectName, home: client.options.home, deploy: deployment(client.options.deploy) });
  client.sandboxes.add(value.id);
  return value.id;
}
