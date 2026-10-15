// `fs.blame`: each line with the Commit (and agent) that last changed it.

/** `fs.blame(path, { branch, commit, fromLine } = {})` */
export function blame(client, path, { branch, commit, fromLine } = {}) {
  return client.call("fs.blame", { path, branch, commit, fromLine });
}
