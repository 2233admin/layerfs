// sandbox.status: one positional SDK operation; the Branch head is read in
// this process's Store.
import { invokeClient, sandboxId } from "../client.js";
export async function status(client, sandbox, path) {
  await client.store();
  return invokeClient(client, "sandbox.status", { sandbox: sandboxId(sandbox), path });
}
