// `fs.write`: one Commit writing a file; `content` is text or a Buffer.

/** `fs.write(path, content, { branch, agent, call } = {})` */
export function write(client, path, content, { branch, agent, call } = {}) {
  const body = typeof content === "string" ? { content } : { bytes: content };
  return client.call("fs.write", { path, ...body, branch, agent, call });
}
