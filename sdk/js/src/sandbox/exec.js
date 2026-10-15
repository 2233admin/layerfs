// sandbox.exec: one positional SDK operation.
import { invokeClient, sandboxId, checkedMessage } from "../client.js";
export function exec(client, sandbox, path, command, message) {
  return invokeClient(client, "sandbox.exec", { sandbox: sandboxId(sandbox), path, command, message: checkedMessage(message) });
}
