// `fs.apply`: one Commit for every change, each `{ kind, ... }`.

/** `fs.apply(changes, { branch, agent, call } = {})` */
export function apply(client, changes, { branch, agent, call } = {}) {
  return client.call("fs.apply", { changes, branch, agent, call });
}
