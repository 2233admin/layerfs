// `branch.merge`: Branch `name` from `a` and `b`: fast-forward or one merge Commit; a conflict creates nothing.

/** `branch.merge(a, b, { name, agent } = {})` */
export function merge(client, a, b, { name, agent } = {}) {
  return client.call("branch.merge", { branch: a, with: b, name, agent });
}
