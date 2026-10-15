// `fs.diff_files`: two files compared: `Equal | Text | Binary`, with hunks.

/** `fs.diff_files({ left, right }, { branch } = {})` */
export function diff_files(client, { left, right }, { branch } = {}) {
  return client.call("fs.diff_files", { left, right, branch });
}
