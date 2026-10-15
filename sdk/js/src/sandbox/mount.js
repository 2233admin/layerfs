// `sandbox.mount`: a complete mutable Workspace of a Branch head.
import { invoke, sandboxId } from "../client.js";

/** `sandbox.mount(sandbox, { branch })`: `{ kind: "Mounted", path, base, root }`. */
export function mount(client, sandbox, { branch }) {
  return invoke("sandbox.mount", { sandbox: sandboxId(sandbox), project: client.projectName, branch });
}
