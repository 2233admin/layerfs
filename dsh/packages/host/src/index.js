// @dsh-layerfs/host: the Host half of LayerFS × DSH, a Cordis function
// plugin that uses only public dsh services.
//   ctx.shellEnv     a contributor gives bash calls in sessions bound to a
//                    project the SDK's DSH_LAYERFS_* settings and a trace file
//   ctx.sessions     each traced call becomes a plugin:layerfs/call record in
//                    the calling agent's own Session (subagents included)
//   session/event    a subagent's descriptor names it
//   ctx.webServer    the /layerfs route, behind ctx.connection's checks
//                    (only where a web server runs: Web and Desktop)
import { BindingStore } from "./binding.js";
import { Collector } from "./collector.js";
import z from "@deepseek-ai/schemastery";
import { resolveConfig } from "./config.js";
import { contributor } from "./env.js";
import { registerRoutes } from "./route.js";

export const name = "layerfs-host";
export const inject = ["shellEnv", "sessions"];
/** Host settings; see config.js for each field. */
export const Config = z.object({
  image: z.string().description("LayerFS runtime image digest (sha256:…) that Sandboxes run"),
  daemon: z.string().description("Host path of the built Linux layerfs-daemon"),
  docker: z.string().description("Local Docker Engine Unix socket"),
  home: z.string().description("LayerFS home for discovery records (default: <temp>/dsh-layerfs/home)"),
  stateDir: z.string().description("Project bindings and agent names (default: <profile>/dsh-layerfs)"),
  traceDir: z.string().description("Per-agent SDK trace files (default: <temp>/dsh-layerfs/traces)"),
  pollMs: z.natural().min(50).max(10_000).default(400).description("How often trace files are read, in milliseconds"),
});

/**
 * @param {object} ctx plugin context
 * @param {import("./config.js").Config} config
 */
export function apply(ctx, config) {
  const spec = resolveConfig(config, ctx.get("profileContext"));
  const bindings = new BindingStore(spec.stateDir);
  const collector = new Collector(ctx, spec, bindings);
  ctx.effect(() => ctx.shellEnv.register(contributor(ctx, spec, bindings, collector)), "layerfs-host: bash environment");
  ctx.effect(() => collector.start(), "layerfs-host: trace collection");
  ctx.on("session/event", (session, event) => collector.observe(session, event));
  ctx.inject(["webServer", "connection"], (child) => registerRoutes(child, { spec, bindings, collector }));
}
