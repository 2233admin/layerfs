// One call through the native binding. The binding resolves `{ value }` or
// `{ refused }`; a refusal becomes a LayerFSError. Nothing is retried.
import { native } from "./native.js";
import { LayerFSError } from "./errors.js";

/** Runs one operation once and returns its value or throws its refusal. */
export async function invoke(op, args) {
  const answer = await native().call(op, args);
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
