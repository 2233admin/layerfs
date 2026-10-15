// One call through the native binding. The binding resolves `{ value }` or
// `{ refused }`; a refusal becomes a LayerFSError. Nothing is retried.
import { native } from "./native.js";
import { LayerFSError } from "./errors.js";

/** Runs one operation once and returns its value or throws its refusal. */
export async function invoke(op, args) {
  if (op.startsWith("operator.")) throw new LayerFSError("UnknownMethod", "operator methods require the operator entry point", null);
  return outcome(await native().call(op, args));
}

export async function invokeOperator(op, args) {
  return outcome(await native().operatorCall(op, args));
}

function outcome(answer) {
  if (answer.refused) {
    const { code, message, detail } = answer.refused;
    throw new LayerFSError(code, message, detail);
  }
  return answer.value;
}

/** The Sandbox id of a Sandbox value or id. */
export function sandboxId(sandbox) {
  const id = typeof sandbox === "string" ? sandbox : sandbox && sandbox.id;
  if (!id) throw new LayerFSError("InvalidInput", "a Sandbox or its id is required", null);
  return id;
}

/** Deployment settings from the client options, else the environment. */
export function deployment(options = {}) {
  const env = process.env;
  const deploy = {
    docker: options.docker ?? env.LAYERFS_DOCKER ?? "/var/run/docker.sock",
    image: options.image ?? env.LAYERFS_IMAGE,
    volume: options.volume ?? env.LAYERFS_VOLUME,
    daemon: options.daemon ?? env.LAYERFS_DAEMON,
  };
  for (const [name, value] of Object.entries(deploy)) {
    if (!value) throw new LayerFSError("InvalidInput", `deploy.${name} is not configured (LAYERFS_${name.toUpperCase()})`, null);
  }
  return deploy;
}

/** One client's deployment selection, including cross-process discovery home. */
export function invokeClient(client, op, args) {
  return invoke(op, { ...args, project: client.projectName, home: client.options.home, deploy: client.options.deploy });
}

export function page(pageSize = 50, pagePos = 0) {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 1000 || !Number.isSafeInteger(pagePos) || pagePos < 0) {
    throw new LayerFSError("InvalidInput", "pageSize must be 1..1000 and pagePos a nonnegative safe integer", null);
  }
  return { pageSize, pagePos };
}

export function checkedMessage(message) {
  if (message === undefined) return undefined;
  if (typeof message !== "string" || Buffer.byteLength(message) > 4096 || [...message].some((c) => (c.codePointAt(0) < 32 && c !== "\n" && c !== "\t") || (c.codePointAt(0) >= 127 && c.codePointAt(0) <= 159) || (c.codePointAt(0) >= 0xd800 && c.codePointAt(0) <= 0xdfff))) {
    throw new LayerFSError("InvalidInput", "message must be UTF-8, at most 4096 bytes, with no controls except newline/tab", null);
  }
  return message;
}
