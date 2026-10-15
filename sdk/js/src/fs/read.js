// `fs.read`: one window of a file at a Branch, Commit or Layer: `{ snapshot, root, path, inode, size, offset, text | bytes, nextOffset }`.

/** `fs.read(path, { branch, commit, offset } = {})` */
export function read(client, path, { branch, commit, offset } = {}) {
  return client.call("fs.read", { path, branch, commit, offset });
}
