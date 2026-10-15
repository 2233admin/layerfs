// `fs.grep`: literal matches per line: `{ items: { path, line, text }[], nextCursor }`.

/** `fs.grep(pattern, { branch, commit, path = "/", cursor } = {})` */
export function grep(client, pattern, { branch, commit, path = "/", cursor } = {}) {
  return client.call("fs.grep", { pattern, branch, commit, path, cursor });
}
