// @dsh-layerfs/mock: the LayerFS mock model, a Cordis function plugin for
// demos and keyless end-to-end runs. It registers the "layerfs-mock" LLM
// provider with one model per scenario folder; pick one in the model picker.
// Where a web server runs, it also serves /layerfs-demo (demo.js), which the
// client's demo strip uses to play each scenario in its own Session of the
// demo workspace. Only the dsh-layerfs-demo bundle loads it.
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LlmAdapter } from "@deepseek-ai/dsh-llm";
import z from "@deepseek-ai/schemastery";
import { createAdapter, PROVIDER } from "./adapter.js";
import { registerDemoRoutes } from "./demo.js";
import { Pace } from "./pace.js";
import { Progress } from "./progress.js";
import { loadScenarios } from "./scenario.js";

export const name = "layerfs-mock";
export const inject = ["llm"];
export const Config = z.object({
  scenarios: z.string().description("Folder of scenario folders (default: the scenarios folder of this checkout)"),
  typingMs: z.natural().max(1000).default(18).description("Pause between streamed words, in milliseconds"),
  fast: z.boolean().description("Development runs: no typing and no scenario pauses (default: LAYERFS_DEMO_FAST=1 in the environment)"),
  workspace: z.string().description("Demo workspace folder, each Init's source (default: the demo-workspace folder of this checkout)"),
  stateDir: z.string().description("Each demo's Session (default: <profile>/dsh-layerfs-demo)"),
  preset: z.string().default("layerfs-dsh-minimalist").description("Agent preset of the demo Sessions"),
  prompt: z.string().default("Run the demo.").description("The message that starts a run"),
  intro: z.string().default("What does this demo show?").description("The question a demo Session opens with before its first run"),
});

export function apply(ctx, config) {
  const dir = config.scenarios || fileURLToPath(new URL("../../../scenarios/", import.meta.url));
  // an invalid scenario stops the plugin with the step at fault named
  const scenarios = loadScenarios(dir);
  const profile = ctx.get("profileContext");
  const stateDir = config.stateDir || join(profile ? profile.dir : join(homedir(), ".dsh"), "dsh-layerfs-demo");
  // each demo's checkpoint journal (#352), so reached checkpoints outlive a restart
  const progress = new Progress(scenarios, join(stateDir, "checkpoints"));
  const pace = new Pace(scenarios);
  const fast = config.fast ?? process.env.LAYERFS_DEMO_FAST === "1";
  const adapter = createAdapter(LlmAdapter, scenarios, { typingMs: config.typingMs, fast, progress, intro: config.intro, pace });
  ctx.effect(() => ctx.llm.registerAdapter([PROVIDER], adapter), "layerfs-mock: model");
  const demo = {
    scenarios, progress, pace, provider: PROVIDER, preset: config.preset, prompt: config.prompt, intro: config.intro,
    workspace: config.workspace || fileURLToPath(new URL("../../../demo-workspace", import.meta.url)),
    stateDir,
  };
  ctx.inject(["webServer", "connection"], (child) => registerDemoRoutes(child, demo));
}
