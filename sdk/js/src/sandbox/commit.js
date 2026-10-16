// sandbox.commit: one positional SDK operation on one Workspace.
import { invokeClient, sandboxId, checkedMessage } from "../client.js";
export function commit(client, sandbox, path, message, force = false) {
  return invokeClient(client, "sandbox.commit", { sandbox: sandboxId(sandbox), path, message: checkedMessage(message), force });
}
