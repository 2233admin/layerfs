// project.init: one positional SDK operation.
import { invokeClient } from "../client.js";
export function init(client, sourcePath) {
  return invokeClient(client, "project.init", { path: sourcePath, name: client.projectName });
}
