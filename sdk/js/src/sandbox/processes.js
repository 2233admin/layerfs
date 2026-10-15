// Background processes, kept by the Sandbox runtime owner (this binding), not
// the daemon. Operator and harness use only; not agent-facing.
import { invoke, sandboxId } from "../client.js";

/** `{ items: { id, path, command, status }[] }`. */
export function list_processes(client, sandbox) {
  return invoke("sandbox.list_processes", { sandbox: sandboxId(sandbox) });
}

/** Stops one background process group: `{ kind: "Stopped", status }`. */
export function cancel(client, sandbox, process) {
  return invoke("process.cancel", { sandbox: sandboxId(sandbox), process });
}
