// @dsh-layerfs/mock: the LayerFS mock model, a Cordis function plugin for
// demos and keyless end-to-end runs. It registers the "layerfs-mock" LLM
// provider with one model per scenario folder; pick one in the model picker.
// Only the dsh-layerfs-demo bundle loads it.
import { fileURLToPath } from "node:url";
import { LlmAdapter } from "@deepseek-ai/dsh-llm";
import z from "@deepseek-ai/schemastery";
import { createAdapter, PROVIDER } from "./adapter.js";
import { loadScenarios } from "./scenario.js";

export const name = "layerfs-mock";
export const inject = ["llm"];
export const Config = z.object({
  scenarios: z.string().description("Folder of scenario folders (default: the scenarios folder of this checkout)"),
  typingMs: z.natural().max(1000).default(18).description("Pause between streamed words, in milliseconds"),
});

export function apply(ctx, config) {
  const dir = config.scenarios || fileURLToPath(new URL("../../../scenarios/", import.meta.url));
  // an invalid scenario stops the plugin with the step at fault named
  const scenarios = loadScenarios(dir);
  const adapter = createAdapter(LlmAdapter, scenarios, { typingMs: config.typingMs });
  ctx.effect(() => ctx.llm.registerAdapter([PROVIDER], adapter), "layerfs-mock: model");
}
