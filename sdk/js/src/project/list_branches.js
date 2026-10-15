// `project.list_branches`: every Branch with its base and head, main first.

/** `project.list_branches()` */
export function list_branches(client) {
  return client.call("project.list_branches", {});
}
