// One internal read model: the project's history, read from its Store in this
// process, and the Workspaces of each of the client's Sandboxes that is
// running. A read starts no Sandbox: with none running `sandboxes` is empty,
// and a known Sandbox whose container is gone or stopped is listed in `gone`
// with its refusal's detail.
import { invokeOperator, sandboxArgs } from "../../src/client.js";

/** The client's service Sandbox, or one created before: null when there is none. */
export const serviceOf = (client) => client.serviceSandbox
  ?? invokeOperator("operator.sandbox.service", { project: client.projectName, home: client.options.home }, client.options).then((value) => value?.id ?? null);

/** One Sandbox's Workspaces with their overlays, or `null` when it is not running. */
async function live(client, sandbox) {
  let answer;
  try {
    answer = await invokeOperator("operator.inspect.snapshot", sandboxArgs(client, sandbox), client.options);
  } catch (error) {
    if (error?.code === "NoSuchSandbox") return { gone: error.detail ?? null };
    throw error;
  }
  await Promise.all(answer.workspaces.filter((w) => w.mounted && w.directory).map(async (workspace) => {
    workspace.overlay = await invokeOperator("operator.workspace.overlay", { ...sandboxArgs(client, sandbox), path: workspace.directory }, client.options);
  }));
  return { answer };
}

export async function snapshot(client, since) {
  await client.store();
  const history = await invokeOperator("operator.inspect.history", { project: client.projectName, home: client.options.home, storePath: client.options.storePath }, client.options);
  const service = await serviceOf(client);
  const ids = [...new Set([...(service ? [service] : []), ...client.sandboxes])];
  const reads = await Promise.all(ids.map((sandbox) => live(client, sandbox)));
  const version = [history.version, ...reads.map((read, index) => read.answer?.version ?? `gone-${ids[index]}`)].join(".");
  if (since === version) return { kind: "unchanged", version };
  return {
    kind: "ok", version, project: history.project, store: history.store,
    branches: history.branches, moreBranches: history.moreBranches, commits: history.commits, more: history.more,
    layers: history.layers, moreLayers: history.moreLayers,
    sandboxes: ids.flatMap((id, index) => reads[index].answer ? [{
      id, status: "Ready",
      workspaces: reads[index].answer.workspaces.map((workspace) => ({ ...workspace, path: workspace.directory })),
    }] : []),
    gone: ids.flatMap((id, index) => reads[index].answer ? [] : [{ id, detail: reads[index].gone }]),
  };
}
