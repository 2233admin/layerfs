// The native binding of a ported Live project (macOS only; the owner's
// exception of 2026-10-20 to the Direct Store rule, AGENTS.md). The real SDK
// runs in this process; each binding call runs as one process in the LayerFS
// box, a Linux container (box.js): `docker exec … node run.mjs` loads the real
// Linux binding there, makes the call, prints its answer and exits. Nothing is
// held between calls. When this process has opened its Store (the SDK does
// before every Store call), that process opens it too before the call.
import { execFile, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { deserialize, serialize } from "node:v8";
import { DAEMON_HOST, callMounts } from "../box.js";

const RUN = fileURLToPath(new URL("./run.mjs", import.meta.url));
/** Stores this process has opened, by path, with their clients. */
const opened = new Map();
const setting = (name) => process.env[`LAYERFS_${name}`] || process.env[`DSH_LAYERFS_${name}`];
const refused = (code, message) => ({ refused: { code, message, detail: null } });

/**
 * One binding call in Linux: its answer, `{ value }` or `{ refused }`. It runs
 * in the box, except Init, which reads its source folder: Init runs in its own
 * container with that folder mounted read-only, so the box shares no host
 * folder beyond the ones every call uses (box.js).
 */
function inBox(fn, op, args) {
  const box = setting("BOX"), bundle = setting("BUNDLE");
  if (!box || !bundle) return Promise.resolve(refused("Unsupported", "no LayerFS box is set (DSH_LAYERFS_BOX, DSH_LAYERFS_BUNDLE): Store calls run only in Linux"));
  // the call's LayerFS settings go with it; Linux has its own binding
  const env = Object.keys(process.env).filter((k) => /^(DSH_)?LAYERFS_/.test(k) && !k.endsWith("_NATIVE")).flatMap((k) => ["-e", k]);
  // Init's container runs the box's image, which the build was made for (the
  // project's Sandboxes may run another)
  const where = op === "project.init"
    ? boxImage(box).then((image) => ["run", "--rm", "-i", "--init", "--pull", "never", ...callMounts({ home: args.home, bundle }), "-v", `${args.path}:${args.path}:ro`, ...env, "--entrypoint", "node", image, RUN])
    : Promise.resolve(["exec", "-i", ...env, box, "node", RUN]);
  return where.then((where) => new Promise((resolve, reject) => {
    const child = spawn("docker", where, { stdio: ["pipe", "pipe", "inherit"] });
    const out = [];
    child.stdout.on("data", (chunk) => out.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const bytes = Buffer.concat(out);
      if (code === 0 && bytes.length) {
        const answer = deserialize(bytes);
        return answer.thrown ? reject(new Error(answer.thrown)) : resolve(answer);
      }
      // 125 and up: docker could not start the process, so the call did not run
      resolve(code >= 125
        ? refused("Failed", `the LayerFS box ${box} did not run ${op} (docker ${where[0]} exit ${code})`)
        : refused("Unknown", `${op} in the LayerFS box ${box} ended without an answer (exit ${code}): check the project before going on`));
    });
    // a call to a named Sandbox (the operator's) carries no deployment, and the
    // Linux binding takes the daemon's host only from one: give it the box's
    const daemonHost = args.deploy?.daemonHost ?? DAEMON_HOST;
    child.stdin.end(serialize({ fn, op, args: { ...args, deploy: { ...args.deploy, daemonHost } }, open: opened.has(args.storePath) }));
  }), () => refused("Failed", `the LayerFS box ${box} is not there to run ${op}`));
}

/** The image the box runs. */
function boxImage(box) {
  return new Promise((resolve, reject) => execFile("docker", ["container", "inspect", "-f", "{{.Image}}", box], (error, out) => (error ? reject(error) : resolve(out.trim()))));
}

export const call = (op, args) => inBox("call", op, args);
export const operatorCall = (op, args) => inBox("operatorCall", op, args);

/** The Store opens in each call's process; here only its clients are counted. */
export async function storeOpen({ storePath }) {
  opened.set(storePath, (opened.get(storePath) ?? 0) + 1);
  return { value: null };
}
export async function storeClose({ storePath }) {
  const left = (opened.get(storePath) ?? 1) - 1;
  if (left > 0) opened.set(storePath, left); else opened.delete(storePath);
  return { value: null };
}

/** run.mjs returns a spooled exec's output whole, so no spool outlives its process. */
export async function execOutput() {
  return refused("Failed", "a ported exec's output arrives whole; there is no spool to read");
}
