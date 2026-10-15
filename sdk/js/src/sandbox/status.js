// `sandbox.status`: the Workspace's base, the Branch head now and its changes.
import { invoke, sandboxId } from "../client.js";

/** `sandbox.status(sandbox, path)`: `{ base, branchHead, headMovedSinceMount, overlay }`. */
export function status(client, sandbox, path) {
  return invoke("sandbox.status", { sandbox: sandboxId(sandbox), path });
}
