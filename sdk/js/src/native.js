// Loads the native binding: LAYERFS_NATIVE, else native/layerfs.node.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let binding = null;

/** The loaded binding; loading is deferred to the first call. */
export function native() {
  if (!binding) {
    const path = process.env.LAYERFS_NATIVE || fileURLToPath(new URL("../native/layerfs.node", import.meta.url));
    binding = require(path);
  }
  return binding;
}
