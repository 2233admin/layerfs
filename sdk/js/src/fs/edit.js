// `fs.edit`: one Commit replacing `oldText` (every match with `all`).

/** `fs.edit(path, { oldText, newText, all }, { branch, agent, call } = {})` */
export function edit(client, path, { oldText, newText, all }, { branch, agent, call } = {}) {
  return client.call("fs.edit", { path, oldText, newText, all, branch, agent, call });
}
