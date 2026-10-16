// The /layerfs route on the Host's web server. Every request first passes
// Connection's Host/Origin checks and browser authentication, like /api.
//   GET  /layerfs/status                      configuration and SDK location
//   GET  /layerfs/workspace?folder=<abs>      the folder's projects
//   POST /layerfs/init {folder, source?, name?}   Init LayerFS
//   GET  /layerfs/session/<id>                the root session's project, agents and trace lines
//   POST /layerfs/session/<id>/project {project}  choose the project (null: none) until locked; answers as GET
//   GET  /layerfs/session/<id>/state          the project as LayerFS reports it
//   GET  /layerfs/session/<id>/tree?ref=<id>  a saved Commit's or Layer's files (bounded)
//   GET  /layerfs/projects                    every project and the folder it is attached to
//   GET  /layerfs/project/<name>/state        the project as LayerFS reports it, with who made each node
//   GET  /layerfs/project/<name>/tree?ref=<id>  as the session's tree route
//   POST /layerfs/project/<name>/attach {folder}  attach to a workspace folder (null: detach)
//   POST /layerfs/project/<name>/remove {confirm}  remove it (confirm: its name); see remove.js
import { missingDeployment } from "./config.js";
import { initProject } from "./init.js";
import { projectState } from "./layerfs-client.js";
import { removeProject } from "./remove.js";
import { isSavedId } from "./trees.js";

const PREFIX = "/layerfs";
const MAX_BODY = 64 * 1024;

const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
};

async function readJson(req) {
  let size = 0, text = "";
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("request body too large"), { status: 413 });
    text += chunk;
  }
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error("request body is not JSON"), { status: 400 }); }
}

/**
 * Registers the route; its disposer runs with the plugin fiber.
 * @param {object} ctx plugin context with webServer and connection
 */
export function registerRoutes(ctx, { spec, bindings, collector, trees }) {
  const sessionView = (id) => {
    const session = ctx.sessions.get(id);
    const agent = session ? collector.agentOf(session) : { id, root: bindings.agent(id)?.root ?? id, cwd: undefined };
    // a Session that is not loaded has no header here; its choice keeps the folder
    const choice = bindings.session(agent.root), folder = agent.cwd ?? choice?.folder ?? null;
    const project = bindings.projectFor(agent.root, folder);
    return { session: id, root: agent.root, folder, choice, project, choices: folder ? bindings.workspace(folder) : { projects: [], lastUsed: null } };
  };
  const sendTree = async (res, project, ref) => {
    if (!isSavedId(ref)) return send(res, 400, { code: "invalid-ref", message: "ref must be a saved Commit or Layer id" });
    return send(res, 200, await trees.read(project, ref));
  };
  const handler = async (req, res) => {
    const rejection = ctx.connection.requestRejection(req);
    if (rejection !== undefined) { res.statusCode = rejection; res.end(); return; }
    const url = new URL(String(req.url), "http://localhost"), parts = url.pathname.slice(PREFIX.length).split("/").filter(Boolean);
    try {
      if (req.method === "GET" && parts[0] === "status" && parts.length === 1)
        return send(res, 200, { configured: missingDeployment(spec).length === 0, missing: missingDeployment(spec), sdk: spec.sdk, traceDir: spec.traceDir, home: spec.home });
      if (req.method === "GET" && parts[0] === "workspace" && parts.length === 1) {
        const folder = url.searchParams.get("folder");
        if (!folder) return send(res, 400, { code: "invalid-folder", message: "folder is required" });
        return send(res, 200, bindings.workspace(folder));
      }
      if (req.method === "POST" && parts[0] === "init" && parts.length === 1) {
        const body = await readJson(req);
        const project = await initProject(spec, bindings, { folder: body.folder, source: body.source || body.folder, name: body.name || undefined });
        return send(res, 200, { project });
      }
      if (req.method === "GET" && parts[0] === "projects" && parts.length === 1) return send(res, 200, { projects: bindings.projects() });
      if (parts[0] === "project" && parts.length === 3) {
        const project = bindings.byName(decodeURIComponent(parts[1]));
        if (!project) return send(res, 404, { code: "not-found", message: `no LayerFS project named ${decodeURIComponent(parts[1])}` });
        if (req.method === "GET" && parts[2] === "state") return send(res, 200, { ...(await projectState(spec, project, [])), ...collector.nodesOf(project.name) });
        if (req.method === "GET" && parts[2] === "tree") return sendTree(res, project, url.searchParams.get("ref"));
        if (req.method === "POST" && parts[2] === "attach") {
          const body = await readJson(req);
          if (body.folder !== null && typeof body.folder !== "string") return send(res, 400, { code: "invalid-folder", message: "folder is a path or null" });
          return send(res, 200, { project: bindings.attach(project.name, body.folder) });
        }
        if (req.method === "POST" && parts[2] === "remove") {
          const body = await readJson(req);
          if (body.confirm !== project.name) return send(res, 400, { code: "not-confirmed", message: `confirm with the project's name, ${project.name}` });
          return send(res, 200, await removeProject(spec, bindings, trees, project.name));
        }
      }
      if (parts[0] === "session" && parts.length >= 2) {
        const view = sessionView(decodeURIComponent(parts[1]));
        const full = (v) => ({ ...v, ...collector.snapshot(v.root) });
        if (req.method === "GET" && parts.length === 2) return send(res, 200, full(view));
        if (req.method === "POST" && parts[2] === "project" && parts.length === 3) {
          const body = await readJson(req);
          if (!view.folder) return send(res, 409, { code: "no-folder", message: "this session has no workspace folder" });
          const taken = bindings.choose(view.root, view.folder, body.project ?? null);
          return taken ? send(res, 200, full(sessionView(view.root))) : send(res, 409, { code: "locked", message: "the session's project is fixed once an agent has used it" });
        }
        if (req.method === "GET" && parts[2] === "state" && parts.length === 3) {
          if (!view.project) return send(res, 404, { code: "no-project", message: "this session has no LayerFS project" });
          return send(res, 200, await projectState(spec, view.project, collector.sandboxesOf(view.root)));
        }
        if (req.method === "GET" && parts[2] === "tree" && parts.length === 3) {
          if (!view.project) return send(res, 404, { code: "no-project", message: "this session has no LayerFS project" });
          return sendTree(res, view.project, url.searchParams.get("ref"));
        }
      }
      return send(res, 404, { code: "not-found", message: `no route ${req.method} ${url.pathname}` });
    } catch (error) {
      return send(res, error.status || (error.code ? 409 : 500), { code: error.code || "failed", message: error.message });
    }
  };
  ctx.effect(() => ctx.webServer.register({ kind: "prefix", path: PREFIX, handler }), `layerfs-host: ${PREFIX}`);
}
