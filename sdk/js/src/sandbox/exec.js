// `sandbox.exec`: one shell command in a mounted Workspace, its output at the
// end. The Sandbox runtime owner runs it; the daemon only serves the files.
import { invoke, sandboxId } from "../client.js";

/**
 * `sandbox.exec(sandbox, path, command, { background? })`:
 * `{ kind: "exit:N", exitCode, stdout, stderr }`, or `{ kind: "running", process }`.
 */
export function exec(client, sandbox, path, command, { background = false } = {}) {
  return invoke("sandbox.exec", { sandbox: sandboxId(sandbox), path, command, background });
}
