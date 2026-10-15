// `sandbox.close`: stops and deletes the container; refused while Workspaces are mounted.
import { invoke, sandboxId } from "../client.js";

/** `sandbox.close(sandbox)`: `{ kind: "Closed" }`; `MountsActive`, `Busy`. */
export async function close(client, sandbox) {
  const id = sandboxId(sandbox);
  const value = await invoke("sandbox.close", { sandbox: id });
  client.sandboxes.delete(id);
  return value;
}
