// `fs.remove`: one Commit removing a path.

/** `fs.remove(path, { branch, recursive, agent, call } = {})` */
export function remove(client, path, { branch, recursive, agent, call } = {}) {
  return client.call("fs.remove", { path, branch, recursive, agent, call });
}
