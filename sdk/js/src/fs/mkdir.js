// `fs.mkdir`: one Commit creating a directory.

/** `fs.mkdir(path, { branch, recursive, agent, call } = {})` */
export function mkdir(client, path, { branch, recursive, agent, call } = {}) {
  return client.call("fs.mkdir", { path, branch, recursive, agent, call });
}
