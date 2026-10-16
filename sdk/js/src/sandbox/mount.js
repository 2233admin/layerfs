// sandbox.mount: one positional SDK operation; the new Workspace's path.
import { invokeClient, sandboxId } from "../client.js";
export async function mount(client, sandbox, branch) {
  return (await invokeClient(client, "sandbox.mount", { sandbox: sandboxId(sandbox), branch })).path;
}
