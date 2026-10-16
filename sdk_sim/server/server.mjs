// Local server for the live UI backend (SPEC section 4.4). The browser cannot
// load the native binding, so this process runs the JS SDK and exposes it,
// with the mirror of `inspect.snapshot`, over HTTP on 127.0.0.1:
//
//   GET  /tui.html?backend=live   the UI (any file of sdk_sim/)
//   GET  /dsh/packages/model/…    the view model the dsh preview imports
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
const REPO = join(ROOT, "..");
const MODEL = join(REPO, "dsh/packages/model");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jsonl": "application/x-ndjson" };

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
      const table = /^\/api\/(sdk|operator)\/([a-z]+)\/([a-z_]+)$/.exec(url.pathname);
      if (table) {
        const [,surface,group,method] = table;
        const reads = new Set(["list_branches","list_commits","diff_commits","diff_branches","read","list","stat","grep","glob","diff_files","blame","status","stats","commits","history","overlay","changes","snapshot"]);
        const expected = reads.has(method) ? "GET" : "POST";
        if (request.method !== expected) return send(405,{error:`${method} requires ${expected}`});
        let raw="";for await (const chunk of request) {raw+=chunk;if(raw.length>1024*1024) return send(413,{error:"request too large"});}
        const args=expected==="GET" ? JSON.parse(url.searchParams.get("args")||"[]") : JSON.parse(raw||"{}").args;
        if(url.searchParams.get("ui")==="1") return send(200,await serial(async()=>{const s=need();const outcome=await s.uiCall(surface,group,method,args,url.searchParams.get("view"));return {outcome,state:s.state()};}));
        return send(200,await serial(async()=>{const s=need();const answer=await s.table(surface,group,method,args);if(url.searchParams.get("labels")==="1")answer.value=s.m.ids(answer.value);return answer;}));
      }
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
      const model = url.pathname.startsWith("/dsh/packages/model/");
      const file = normalize(join(model ? REPO : ROOT, url.pathname));
      const inside = model ? file.startsWith(`${MODEL}/`) : file.startsWith(ROOT) && !file.includes(`${ROOT}/server`);
      if (!inside || !TYPES[extname(file)]) return send(404, { error: "not found" });
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
