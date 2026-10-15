// `sandbox.commit`: one Commit of the Workspace. A moved head is merged first;
// a conflict commits nothing, writes markers and keeps the Workspace on the head.
import { invoke, sandboxId } from "../client.js";

/**
 * `sandbox.commit(sandbox, path, { force?, agent?, call? })`: `Committed | UpToDate`,
 * with `merged` after a merge; throws `Conflict` or `HeadMoved`.
 */
export function commit(client, sandbox, path, { force, agent, call } = {}) {
  return invoke("sandbox.commit", { sandbox: sandboxId(sandbox), path, force, agent, call });
}
