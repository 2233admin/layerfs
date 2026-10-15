// branch.diff_commits: one positional SDK operation.
import { page } from "../client.js";
export function diff_commits(client, fromCommit, toCommit, pageSize = 50, pagePos = 0) {
  return client.call("branch.diff_commits", { from: fromCommit, to: toCommit, ...page(pageSize, pagePos) });
}
