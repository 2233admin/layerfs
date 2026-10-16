// A scripted model for keyless end-to-end runs of dsh with the dsh-layerfs
// bundle: a Messages-compatible HTTP/SSE endpoint whose answers come from a
// scenario module, chosen per conversation from its first user message.
//   node dsh/tools/script-model.mjs <port> <scenario.mjs> [log.jsonl]
// Point dsh at it with DEEPSEEK_BASE_URL=http://127.0.0.1:<port>/v1 and any
// DEEPSEEK_API_KEY. A scenario exports respond({ first, turn, results, tools })
// returning { text } or { tools: [{ name, input }] }.
import { appendFileSync } from "node:fs";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const [port = "8790", scenarioPath, log] = process.argv.slice(2);
if (!scenarioPath) { console.error("usage: script-model.mjs <port> <scenario.mjs> [log.jsonl]"); process.exit(2); }
const scenario = await import(pathToFileURL(resolve(scenarioPath)).href);
let calls = 0;

const textOf = (content) => typeof content === "string" ? content : (content || []).map((b) => b.type === "text" ? b.text : "").join("");
const sse = (res, type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);

function answer(res, reply) {
  res.writeHead(200, { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache", connection: "keep-alive" });
  sse(res, "message_start", { message: { id: `msg_${++calls}`, type: "message", role: "assistant", model: "script-model", content: [], usage: { input_tokens: 10, output_tokens: 0 } } });
  let index = 0;
  if (reply.text) {
    sse(res, "content_block_start", { index, content_block: { type: "text", text: "" } });
    sse(res, "content_block_delta", { index, delta: { type: "text_delta", text: reply.text } });
    sse(res, "content_block_stop", { index });
    index++;
  }
  for (const tool of reply.tools || []) {
    sse(res, "content_block_start", { index, content_block: { type: "tool_use", id: `call_${calls}_${index}`, name: tool.name, input: {} } });
    sse(res, "content_block_delta", { index, delta: { type: "input_json_delta", partial_json: JSON.stringify(tool.input) } });
    sse(res, "content_block_stop", { index });
    index++;
  }
  sse(res, "message_delta", { delta: { stop_reason: reply.tools && reply.tools.length ? "tool_use" : "end_turn", stop_sequence: null }, usage: { output_tokens: 5 } });
  sse(res, "message_stop", {});
  res.end();
}

createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (req.method !== "POST" || !req.url.endsWith("/messages")) { res.writeHead(404); return res.end(); }
  const request = JSON.parse(body), messages = request.messages || [];
  const first = textOf((messages.find((m) => m.role === "user") || {}).content);
  const turn = messages.filter((m) => m.role === "assistant").length;
  const last = messages[messages.length - 1] || {};
  const results = Array.isArray(last.content) ? last.content.filter((b) => b.type === "tool_result").map((b) => textOf(b.content)) : [];
  const tools = (request.tools || []).map((t) => t.name);
  const reply = scenario.respond({ first, turn, results, tools, request });
  if (log) appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), first: first.slice(0, 120), turn, tools, results: results.map((r) => r.slice(0, 400)), reply, ...(calls === 0 ? { schemas: request.tools } : {}) }) + "\n");
  answer(res, reply);
}).listen(Number(port), "127.0.0.1", () => console.log(`script-model on http://127.0.0.1:${port}/v1 (${scenarioPath})`));
