// project.list_overwritten: the Layers one publication overwrote, newest first.
import { page } from "../client.js";
export function list_overwritten(client, layer, pageSize = 50, pagePos = 0) {
  return client.call("project.list_overwritten", { layer, ...page(pageSize, pagePos) });
}
