// The bash environment of a session bound to a LayerFS project: the SDK
// entry, the project name, its deployment and the calling agent's trace
// file. dsh rebuilds the DSH_* namespace for every bash call, so these
// values always describe the agent that runs the command.
import { deploymentEnv } from "./layerfs-client.js";
import { appendProject } from "./records.js";

const VARIABLES = {
  DSH_LAYERFS_PROJECT: "LayerFS project of this conversation; pass it to new LayerFS(...)",
  DSH_LAYERFS_SDK: "file URL of the LayerFS JavaScript SDK; import it from Node scripts",
  DSH_LAYERFS_HOME: "LayerFS home the SDK reads its project and Sandbox records from",
  DSH_LAYERFS_DOCKER: "Docker Engine socket the SDK starts Sandboxes through",
  DSH_LAYERFS_IMAGE: "Runtime image digest of LayerFS Sandboxes",
  DSH_LAYERFS_VOLUME: "Docker volume holding this project's Store",
  DSH_LAYERFS_DAEMON: "Host path of the LayerFS daemon Sandboxes run",
  DSH_LAYERFS_TRACE: "File the SDK appends one line per call to",
  DSH_LAYERFS_TRACE_STEP: "Label of this bash call on the SDK's trace lines",
  DSH_LAYERFS_TRACE_START: "1: the SDK also writes a line when each call starts",
};

/**
 * @param {object} ctx plugin context (ctx.sessions)
 * @param {object} spec resolved Host settings
 * @param {import("./binding.js").BindingStore} bindings
 * @param {import("./collector.js").Collector} collector
 */
export function contributor(ctx, spec, bindings, collector) {
  return {
    name: "layerfs",
    variables: Object.fromEntries(Object.entries(VARIABLES).map(([key, description]) => [key, { description }])),
    resolve(execution) {
      const session = execution.agent && execution.agent.session;
      if (!session) return {};
      const agent = collector.agentOf(session);
      const project = bindings.projectFor(agent.root, agent.cwd);
      if (!project) return {};
      const before = bindings.session(agent.root);
      bindings.lock(agent.root, project.name, agent.cwd);
      if (!before || !before.locked) {
        const root = ctx.sessions.get(agent.root);
        if (root) appendProject(root, { project: project.name, folder: agent.cwd, volume: project.volume });
      }
      const deploy = deploymentEnv(spec, project);
      return {
        DSH_LAYERFS_PROJECT: project.name,
        DSH_LAYERFS_SDK: spec.sdk,
        ...Object.fromEntries(Object.entries(deploy).filter(([, v]) => v).map(([k, v]) => [`DSH_LAYERFS_${k}`, v])),
        DSH_LAYERFS_TRACE: collector.track(agent, project),
        DSH_LAYERFS_TRACE_STEP: String(execution.rootCallId ?? execution.callId),
        DSH_LAYERFS_TRACE_START: "1",
      };
    },
  };
}
