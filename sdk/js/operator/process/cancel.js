// One cancellation attempt by the native Sandbox executor.
import { invokeOperator, sandboxId } from "../../src/client.js";
export function cancel(client, sandbox, process) {
  return invokeOperator("operator.process.cancel", { project: client.projectName, sandbox: sandboxId(sandbox), process });
}
