// Host plugin configuration and its resolution into absolute settings.
import { mkdirSync, realpathSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @typedef {object} Config
 * @property {string} [image] LayerFS runtime image digest (`sha256:…`) Sandboxes run; Init refuses without it.
 * @property {string} [daemon] Host path of the built Linux layerfs-daemon; Init refuses without it.
 * @property {string} [docker] Local Docker Engine Unix socket.
 * @property {string} [home] LayerFS home for discovery records, shared by the Host and agents' bash calls.
 * @property {string} [stateDir] Directory for project bindings and agent names.
 * @property {string} [traceDir] Directory for per-agent SDK trace files; bash calls must be able to write it.
 * @property {number} [pollMs] Interval at which trace files are read for new lines.
 */

/**
 * @typedef {object} Spec
 * @property {string|null} image
 * @property {string|null} daemon
 * @property {string} docker
 * @property {string} home
 * @property {string} stateDir
 * @property {string} traceDir
 * @property {number} pollMs
 * @property {string} sdk file URL of the LayerFS JavaScript SDK entry
 * @property {string} operator file URL of the SDK's operator entry
 */

/**
 * Resolves configured values and defaults into one absolute specification.
 * The LayerFS home and trace files default to the host temp area, which the
 * bash sandbox's workspace-write mode may write; bindings default to the
 * profile directory.
 * @param {Config} config
 * @param {{ dir: string } | undefined} profile the launcher's profile, when present
 * @returns {Spec}
 */
export function resolveConfig(config, profile) {
  const temp = join(realpathSync(tmpdir()), "dsh-layerfs");
  const spec = {
    image: config.image || null,
    daemon: config.daemon || null,
    docker: config.docker || "/var/run/docker.sock",
    home: config.home || join(temp, "home"),
    stateDir: config.stateDir || join(profile ? profile.dir : join(homedir(), ".dsh"), "dsh-layerfs"),
    traceDir: config.traceDir || join(temp, "traces"),
    pollMs: config.pollMs ?? 400,
    sdk: import.meta.resolve("@layerfs/sdk"),
    operator: import.meta.resolve("@layerfs/sdk/operator"),
  };
  for (const dir of [spec.stateDir, spec.traceDir]) mkdirSync(dir, { recursive: true });
  mkdirSync(spec.home, { recursive: true, mode: 0o700 });
  return spec;
}

/** Deployment settings Init and bash calls need that are not configured. */
export const missingDeployment = (spec) => ["image", "daemon"].filter((name) => !spec[name]);

/** The SDK entry as a path, for Node imports in the Host. */
export const sdkPath = (spec) => fileURLToPath(spec.sdk);
