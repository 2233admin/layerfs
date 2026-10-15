// sandbox.status: one positional SDK operation.
import { invokeClient, sandboxId } from "../client.js";
export function status(client, sandbox, path) {
  return invokeClient(client, "sandbox.status", { sandbox: sandboxId(sandbox), path });
}
