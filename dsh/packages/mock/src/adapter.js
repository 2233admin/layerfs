// The "layerfs-mock" provider: an explicit mock model, one model per
// scenario ("LayerFS mock · <title>"), picked like any other model. Its
// answers are the scenario's steps; dsh's own agent loop and tools run every
// call. A subagent starts on its parent's model, so children get the same
// scenario and answer as the agent their prompt names.
import { randomUUID } from "node:crypto";
import { agentOf, nextReply, offeredTools } from "./plan.js";

export const PROVIDER = "layerfs-mock";

/**
 * @param {typeof import("@deepseek-ai/dsh-llm").LlmAdapter} Base dsh's adapter class
 * @param {Map<string, object>} scenarios compiled scenarios by model id
 * @param {{ typingMs?: number }} [options] pause between streamed words
 */
export function createAdapter(Base, scenarios, { typingMs = 18 } = {}) {
  class LayerFsMockAdapter extends Base {
    providerInfo(provider) { return { id: provider, name: "LayerFS mock" }; }

    listModels(provider) {
      return Promise.resolve([...scenarios.values()].map((s) => model(provider, s)));
    }

    resolveModel(provider, id) {
      const scenario = scenarios.get(id);
      return Promise.resolve(scenario ? model(provider, scenario) : { provider, id, name: `LayerFS mock · ${id} (no such scenario)`, inputModalities: ["text"] });
    }

    async *stream(options) {
      const { signal } = options;
      try {
        const scenario = scenarios.get(options.model);
        if (!scenario) return yield failure(`no mock scenario named ${options.model}; scenarios: ${[...scenarios.keys()].join(", ") || "none"}`, "MOCK_NO_SCENARIO");
        const offered = offeredTools(options);
        // dsh's own requests without tools (a session title): the scenario's title
        if (!offered.size) return yield* text(scenario.title, 0, signal);
        const agent = agentOf(scenario, options.messages ?? []);
        const reply = nextReply(scenario, agent, options.messages ?? []);
        if (reply.kind === "error") return yield failure(`LayerFS mock (${scenario.name}, ${agent}): ${reply.message}`, "MOCK_SCENARIO_STOPPED");
        await sleep(reply.delay, signal);
        if (reply.kind === "text") return yield* text(reply.text, typingMs, signal);
        const missing = reply.calls.map((c) => c.name).filter((n) => !offered.has(n));
        if (missing.length) return yield failure(`LayerFS mock (${scenario.name}, ${agent}): ${reply.step} calls ${missing.join(", ")}, which this agent's preset does not offer`, "MOCK_TOOL_NOT_OFFERED");
        let index = 0;
        if (reply.say) yield* words(index++, reply.say, typingMs, signal);
        for (const call of reply.calls) {
          yield { type: "block-start", index, blockType: "tool-call" };
          yield { type: "block-end", index, block: { type: "tool-call", id: `lfsmock_${randomUUID()}`, name: call.name, arguments: JSON.stringify(call.args) } };
          index++;
        }
        yield { type: "finish", reason: { kind: "tool-calls" } };
      } catch (error) {
        if (signal?.aborted) return yield { type: "finish", reason: { kind: "aborted", failure: { message: "mock request aborted", code: "ABORTED" } } };
        yield failure(error instanceof Error ? error.message : String(error), "MOCK_FAILED");
      }
    }
  }
  return new LayerFsMockAdapter();
}

const model = (provider, scenario) => ({
  provider,
  id: scenario.name,
  name: `LayerFS mock · ${scenario.title}`,
  description: `Scripted, not a language model. ${scenario.description}`.trim(),
  inputModalities: ["text"],
});

const failure = (message, code) => ({ type: "finish", reason: { kind: "error", failure: { message, code } } });

async function* text(value, typingMs, signal) {
  yield* words(0, value, typingMs, signal);
  yield { type: "finish", reason: { kind: "stop" } };
}

/** One text block, streamed a word at a time so a demo reads like a model typing. */
async function* words(index, value, typingMs, signal) {
  yield { type: "block-start", index, blockType: "text" };
  for (const piece of value.match(/\S+\s*/g) ?? [value]) {
    yield { type: "text-delta", index, text: piece };
    await sleep(typingMs, signal);
  }
  yield { type: "block-end", index, block: { type: "text", text: value } };
}

function sleep(ms, signal) {
  if (signal?.aborted) return Promise.reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
  if (!ms) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const done = () => { signal?.removeEventListener("abort", stop); resolve(); };
    const timer = setTimeout(done, ms);
    const stop = () => { clearTimeout(timer); reject(Object.assign(new Error("aborted"), { name: "AbortError" })); };
    signal?.addEventListener("abort", stop, { once: true });
  });
}
