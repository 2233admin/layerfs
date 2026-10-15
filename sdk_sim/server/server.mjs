// Local server for the live UI backend (SPEC section 4.4). The browser cannot
// load the native binding, so this process runs the JS SDK and exposes it,
// with the mirror of `inspect.snapshot`, over HTTP on 127.0.0.1:
//
//   GET  /tui.html?backend=live   the UI (any file of sdk_sim/)
//   POST /api/reset               close the current project, Init a fresh one
//   POST /api/call  {name, args}  one call: { outcome, state }
//   GET  /api/state?since=v       { state } or { unchanged: true }
//   POST /api/tree  {root}        a saved root's files, for the Files pane
//   POST /api/close               close the project (volume and Sandboxes)
//
// Usage: node sdk_sim/server/server.mjs [port]   (default 8327)
// Calls run one at a time, in arrival order.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { Session } from "./session.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

export function startServer({ port = 8327, host = "127.0.0.1", log = () => {} } = {}) {
  let session = null, queue = Promise.resolve(), resets = 0;
  // One operation at a time; a failed one does not block the next.
  const serial = (job) => {
    const run = queue.then(job, job);
    queue = run.catch(() => {});
    return run;
  };
  const need = () => {
    if (!session) throw Object.assign(new Error("no project: POST /api/reset first"), { status: 409 });
    return session;
  };
  const api = {
    "POST /api/reset": () => serial(async () => {
      if (session) await session.close();
      session = null;
      resets++;
      session = await Session.open(resets === 1 ? "website" : `website-${resets}`);
      return { state: session.state() };
    }),
    "POST /api/call": (body) => serial(async () => {
      const s = need();
      const outcome = await s.call(body.name, body.args || {});
      log(`${body.name} → ${outcome.code}`);
      return { outcome, state: s.state() };
    }),
    "GET /api/state": (_, query) => serial(async () => {
      const s = need();
      await s.refresh();
      const state = s.state();
      return query.get("since") === String(state.version) ? { unchanged: true, version: state.version } : { state };
    }),
    "POST /api/tree": (body) => serial(async () => ({ tree: await need().tree(body.root) })),
    "POST /api/close": () => serial(async () => {
      const problems = session ? await session.close() : [];
      session = null;
      return { closed: true, problems };
    }),
  };
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const send = (status, body, type = "application/json") => {
      response.writeHead(status, { "content-type": type, "cache-control": "no-store" });
      response.end(type === "application/json" ? JSON.stringify(body) : body);
    };
    try {
      const route = api[`${request.method} ${url.pathname}`];
      if (route) {
        let raw = "";
        for await (const chunk of request) raw += chunk;
        return send(200, await route(raw ? JSON.parse(raw) : {}, url.searchParams));
      }
      if (request.method !== "GET") return send(405, { error: "method not allowed" });
      if (url.pathname === "/") {
        response.writeHead(302, { location: "/tui.html?backend=live" });
        return response.end();
      }
      const file = normalize(join(ROOT, url.pathname));
      if (!file.startsWith(ROOT) || file.includes(`${ROOT}/server`) || !TYPES[extname(file)]) return send(404, { error: "not found" });
      return send(200, await readFile(file), TYPES[extname(file)]);
    } catch (error) {
      if (error.code === "ENOENT") return send(404, { error: "not found" });
      log(`error: ${error.message}`);
      return send(error.status || 500, { error: error.message, code: error.code ?? null });
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve({
    server, port: server.address().port,
    async stop() {
      await serial(async () => { if (session) await session.close(); session = null; });
      await new Promise((done) => server.close(done));
    },
  })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 8327);
  const running = await startServer({ port, log: (line) => console.log(line) });
  console.log(`LayerFS live UI: http://127.0.0.1:${running.port}/tui.html?backend=live`);
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, async () => {
    console.log("closing the project…");
    await running.stop();
    process.exit(0);
  });
}
