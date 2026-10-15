// One internal read model over the client's current service and Sandboxes.
import { invokeOperator } from "../../src/client.js";

export async function snapshot(client, since) {
  const service = await client.service();
  const ids = [...new Set([service, ...client.sandboxes])];
  const answers = await Promise.all(ids.map((sandbox) => invokeOperator("operator.inspect.snapshot", { project: client.projectName, sandbox })));
  const version = answers.map((answer) => answer.version).join(".");
  if (since === version) return { kind: "unchanged", version };
  const history = answers[0];
  return {
    kind: "ok", version, project: history.project,
    branches: history.branches, commits: history.commits, more: history.more,
    layers: history.layers, moreLayers: history.moreLayers,
    sandboxes: ids.map((id, index) => ({
      id, status: "Ready",
      workspaces: answers[index].workspaces.map((workspace) => ({ ...workspace, path: workspace.directory })),
    })),
  };
}
