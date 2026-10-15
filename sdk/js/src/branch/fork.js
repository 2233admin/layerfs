// `branch.fork`: a new Branch at a Branch, main, or a Commit or Layer id; metadata only.

/** `branch.fork(name, { from = "main" } = {})` */
export function fork(client, name, { from = "main" } = {}) {
  return client.call("branch.fork", { name, from });
}
