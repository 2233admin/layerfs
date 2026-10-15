// branch.diff_branches: one positional SDK operation.
import { page } from "../client.js";
export function diff_branches(client, fromBranch, toBranch, pageSize = 50, pagePos = 0) {
  return client.call("branch.diff_branches", { from: fromBranch, to: toBranch, ...page(pageSize, pagePos) });
}
