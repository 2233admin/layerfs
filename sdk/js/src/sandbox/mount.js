// sandbox.mount: one positional SDK operation.
import { invokeClient, sandboxId } from "../client.js";
export function mount(client, sandbox, branch) {
  return invokeClient(client, "sandbox.mount", { sandbox: sandboxId(sandbox), branch });
}
