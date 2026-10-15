// `fs.list`: one window of a directory: `{ items: { name, path, type, inode }[], nextCursor }`.

/** `fs.list(path = "/", { branch, commit, cursor } = {})` */
export function list(client, path = "/", { branch, commit, cursor } = {}) {
  return client.call("fs.list", { path, branch, commit, cursor });
}
