// `fs.mv`: one Commit moving a path.

/** `fs.mv(from, to, { branch, agent, call } = {})` */
export function mv(client, from, to, { branch, agent, call } = {}) {
  return client.call("fs.mv", { from, to, branch, agent, call });
}
