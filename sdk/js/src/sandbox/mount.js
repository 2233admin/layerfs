// sandbox.mount: one positional SDK operation; the new Workspace's path. The
// Branch is found by name in this process's Store; the daemon binds its id.
import { invokeClient, sandboxId } from "../client.js";
export async function mount(client, sandbox, branch) {
  await client.store();
  return (await invokeClient(client, "sandbox.mount", { sandbox: sandboxId(sandbox), branch })).path;
}
