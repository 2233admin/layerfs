// Process control remains in the native Sandbox executor.
import { invokeOperator, sandboxId } from "../../src/client.js";
export function list(client, sandbox) {
  return invokeOperator("operator.process.list", { project: client.projectName, sandbox: sandboxId(sandbox) });
}
