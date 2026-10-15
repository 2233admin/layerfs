// `branch.diff_commits`: path-level changes between two Commits.

/** `branch.diff_commits({ from, to, cursor } = {})` */
export function diff_commits(client, { from, to, cursor } = {}) {
  return client.call("branch.diff_commits", { from, to, cursor });
}
