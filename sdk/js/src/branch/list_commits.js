// `branch.list_commits`: one page, newest first: `{ items: Commit[], nextCursor }`.

/** `branch.list_commits({ branch, cursor } = {})` */
export function list_commits(client, { branch, cursor } = {}) {
  return client.call("branch.list_commits", { branch, cursor });
}
