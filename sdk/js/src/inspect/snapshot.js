// `inspect.snapshot`: the operator read model; `{ kind: "unchanged" }` while `since` is current.

/** `inspect.snapshot({ since } = {})` */
export function snapshot(client, { since } = {}) {
  return client.snapshot(since);
}
