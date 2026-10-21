// `sandbox.create`: one named container with its daemon, bound to one project
// and running the image it names, ready for mounts.
import { LayerFSError } from "../errors.js";
import { deployment, invoke } from "../client.js";

/**
 * `sandbox.create(name, project, image)`: the Sandbox `name` (unique in this
 * LayerFS home), bound to `project` and running the image digest `image`.
 * Returns its name. Its container is `<prefix><project>-<name>`, labelled
 * with its role, project and name. The project's volume comes from this
 * client's deployment, so `project` must be this client's.
 */
export async function create(client, name, project, image) {
  if (project !== client.projectName) {
    throw new LayerFSError("InvalidInput", `this client is for project ${client.projectName}; create a Sandbox of ${project} with a client of ${project}`, null);
  }
  const value = await invoke("sandbox.create", { name, project, image, home: client.options.home, deploy: deployment(client.options.deploy, false) }, client.options);
  client.sandboxes.add(value.id);
  return value.id;
}
