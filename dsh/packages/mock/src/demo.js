// The /layerfs-demo route on the Host's web server, behind ctx.connection's
// checks like /layerfs. The client's demo strip reads it to play a scenario
// in its own Session of the demo workspace:
//   GET  /layerfs-demo                     the workspace folder, the preset,
//                                          the run and intro messages, and each
//                                          demo with its Session and its latest
//                                          run (see progress.js)
//   GET  /layerfs-demo/<id>                one demo, as in the list
//   POST /layerfs-demo/<id>/session {sessionId}   the demo's Session from now on
//   POST /layerfs-demo/<id>/speed {speed}         how fast the mock plays it
//                                          from now on: 1, 2, 4 or 0 (Max), pace.js
// A demo's Session is kept in <stateDir>/sessions.json; Replay replaces it.
// A demo with checkpoints (#352) lists them, each with when the latest run
// reached it (progress.js keeps them in <stateDir>/checkpoints/).
// A replayed run's demo (issue #347) also carries `live` (Live LayerFS only),
// its Sandboxes' `image`, and `seed`, the folder its project is Inited from:
// its seed.json written out under <stateDir>/seeds (seed.js).
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { seedFolder } from "./seed.js";

const PREFIX = "/layerfs-demo";
const MAX_BODY = 4 * 1024;

const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
};

async function readJson(req) {
  let text = "";
  for await (const chunk of req) {
    text += chunk;
    if (text.length > MAX_BODY) throw Object.assign(new Error("request body too large"), { status: 413 });
  }
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error("request body is not JSON"), { status: 400 }); }
}

/** Each demo's Session id, one JSON file written whole. */
class SessionFile {
  constructor(dir) {
    this.dir = dir;
    this.file = join(dir, "sessions.json");
  }
  read() {
    try { return JSON.parse(readFileSync(this.file, "utf8")); } catch (error) {
      if (error.code === "ENOENT") return {};
      throw error;
    }
  }
  set(id, sessionId) {
    const all = { ...this.read(), [id]: sessionId };
    mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    writeFileSync(`${this.file}.tmp`, JSON.stringify(all, null, 2));
    renameSync(`${this.file}.tmp`, this.file);
    return all;
  }
}

/**
 * Registers the route; its disposer runs with the plugin fiber.
 * @param {object} ctx plugin context with webServer and connection
 * @param {{ scenarios: Map<string, object>, progress: import("./progress.js").Progress, pace: import("./pace.js").Pace, workspace: string, stateDir: string, preset: string, provider: string, prompt: string, intro: string }} demo
 */
export function registerDemoRoutes(ctx, { scenarios, progress, pace, workspace, stateDir, preset, provider, prompt, intro }) {
  const sessions = new SessionFile(stateDir), seeds = new Map();
  // written once, at the first read; a seed that cannot be written is the demo's error
  const seedOf = (id, scenario) => {
    if (!scenario.seed) return { seed: null };
    if (!seeds.has(id)) {
      try { seeds.set(id, { seed: seedFolder(scenario.seed, join(stateDir, "seeds"), id) }); } catch (error) { seeds.set(id, { seed: null, seedError: error.message }); }
    }
    return seeds.get(id);
  };
  const view = (id, scenario, saved) => ({
    id, title: scenario.title, blurb: scenario.blurb ?? null, agents: Object.keys(scenario.agents), speed: pace.get(id),
    live: scenario.live === true, image: scenario.image ?? null, ...seedOf(id, scenario),
    sessionId: saved[id] ?? null, run: progress.get(id), checkpoints: progress.checkpoints(id),
  });
  const handler = async (req, res) => {
    const rejection = ctx.connection.requestRejection(req);
    if (rejection !== undefined) { res.statusCode = rejection; res.end(); return; }
    const url = new URL(String(req.url), "http://localhost"), parts = url.pathname.slice(PREFIX.length).split("/").filter(Boolean);
    try {
      if (req.method === "GET" && parts.length === 0) {
        const saved = sessions.read();
        return send(res, 200, { workspace, preset, provider, prompt, intro, demos: [...scenarios].map(([id, s]) => view(id, s, saved)) });
      }
      const id = decodeURIComponent(parts[0] ?? ""), scenario = scenarios.get(id);
      if (!scenario) return send(res, 404, { code: "not-found", message: `no demo named ${id}` });
      if (req.method === "GET" && parts.length === 1) return send(res, 200, view(id, scenario, sessions.read()));
      if (req.method === "POST" && parts[1] === "session" && parts.length === 2) {
        const body = await readJson(req);
        if (typeof body.sessionId !== "string" || !body.sessionId) return send(res, 400, { code: "invalid-session", message: "sessionId is required" });
        return send(res, 200, view(id, scenario, sessions.set(id, body.sessionId)));
      }
      if (req.method === "POST" && parts[1] === "speed" && parts.length === 2) {
        pace.set(id, (await readJson(req)).speed);
        return send(res, 200, view(id, scenario, sessions.read()));
      }
      return send(res, 404, { code: "not-found", message: `no route ${req.method} ${url.pathname}` });
    } catch (error) {
      return send(res, error.status || 500, { code: error.code || "failed", message: error.message });
    }
  };
  ctx.effect(() => ctx.webServer.register({ kind: "prefix", path: PREFIX, handler }), `layerfs-mock: ${PREFIX}`);
}
