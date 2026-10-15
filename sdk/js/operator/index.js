// Internal UI/runtime surface. Import explicitly from @layerfs/sdk/operator.
import { snapshot } from "./inspect/snapshot.js";
import { list } from "./process/list.js";
import { cancel } from "./process/cancel.js";

export class LayerFSOperator {
  constructor(client) {
    this.inspect = { snapshot: (since) => snapshot(client, since) };
    this.process = {
      list: (sandbox) => list(client, sandbox),
      cancel: (sandbox, process) => cancel(client, sandbox, process),
    };
  }
}
