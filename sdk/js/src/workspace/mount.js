// workspace.mount: a new Workspace of a Branch, placed by LayerFS in one of
// the project's Sandboxes (the lowest-numbered running one with a free slot,
// else a new one, started with the client's deployment). The Branch is found
// by name in this process's Store; the daemon binds its id. Returns the
// Workspace, `{ sandbox, path }`.
import { deployment, invokeClient } from "../client.js";
export async function mount(client, branch) {
  await client.store();
  const value = await invokeClient(client, "workspace.mount", { branch, deploy: deployment(client.options.deploy) });
  return { sandbox: value.sandbox, path: value.path };
}
