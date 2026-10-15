// `fs.stat`: `{ snapshot, path, type, inode, size }`.

/** `fs.stat(path, { branch, commit } = {})` */
export function stat(client, path, { branch, commit } = {}) {
  return client.call("fs.stat", { path, branch, commit });
}
