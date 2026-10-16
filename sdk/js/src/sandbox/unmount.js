// sandbox.unmount: one positional SDK operation on one Workspace.
import { invokeClient, sandboxId } from "../client.js";
export function unmount(client, sandbox, path, discard = false) {
  return invokeClient(client, "sandbox.unmount", { sandbox: sandboxId(sandbox), path, discard });
}
