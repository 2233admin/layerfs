// `branch.diff_branches`: path-level changes between two Branches or main.

/** `branch.diff_branches({ from, to, cursor } = {})` */
export function diff_branches(client, { from, to, cursor } = {}) {
  return client.call("branch.diff_branches", { from, to, cursor });
}
