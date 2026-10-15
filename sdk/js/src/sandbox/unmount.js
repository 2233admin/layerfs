// `sandbox.unmount`: refused while uncommitted changes exist, unless discarded.
import { invoke, sandboxId } from "../client.js";

/** `sandbox.unmount(sandbox, path, { discard? })`: `{ kind: "Unmounted" }`; throws `Dirty`, `Busy`. */
export function unmount(client, sandbox, path, { discard } = {}) {
  return invoke("sandbox.unmount", { sandbox: sandboxId(sandbox), path, discard });
}
