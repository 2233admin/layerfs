// `fs.cp`: one Commit copying a path.

/** `fs.cp(from, to, { branch, recursive, agent, call } = {})` */
export function cp(client, from, to, { branch, recursive, agent, call } = {}) {
  return client.call("fs.cp", { from, to, branch, recursive, agent, call });
}
