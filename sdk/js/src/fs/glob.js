// `fs.glob`: paths matching a `/.lww`-syntax pattern: `{ items: string[], nextCursor }`.

/** `fs.glob(pattern, { branch, commit, path = "/", cursor } = {})` */
export function glob(client, pattern, { branch, commit, path = "/", cursor } = {}) {
  return client.call("fs.glob", { pattern, branch, commit, path, cursor });
}
