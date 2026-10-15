// `branch.publish`: one new main Layer holding the Branch head (or `commit`), with `overwrote`.

/** `branch.publish({ branch, commit } = {})` */
export function publish(client, { branch, commit } = {}) {
  return client.call("branch.publish", { branch, commit });
}
