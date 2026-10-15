// `project.init`: host Project Init of a complete directory into a sealed,
// Disposable Store. main gets its first Layer; the first Sandbox installs the
// Store into the shared volume.
import { invoke } from "../client.js";

/** `project.init(path, { name })`: `{ kind: "Initialized", project, layer, root }`. */
export async function init(client, path, { name = client.projectName } = {}) {
  const value = await invoke("project.init", { path, name, home: client.options.home });
  client.projectName ??= value.project;
  return value;
}
