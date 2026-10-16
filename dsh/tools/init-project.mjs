// Runs the Host plugin's "Init LayerFS" outside dsh: imports a folder as a
// LayerFS project and binds it to a dsh workspace folder in a profile's
// state directory. For setting up end-to-end runs.
//   node dsh/tools/init-project.mjs <profile dir> <workspace folder> <image> <daemon> [source] [name]
import { resolveConfig } from "../packages/host/src/config.js";
import { BindingStore } from "../packages/host/src/binding.js";
import { initProject } from "../packages/host/src/init.js";

const [profileDir, folder, image, daemon, source, name] = process.argv.slice(2);
if (!profileDir || !folder || !image || !daemon) {
  console.error("usage: init-project.mjs <profile dir> <workspace folder> <image> <daemon> [source] [name]");
  process.exit(2);
}
const spec = resolveConfig({ image, daemon }, { dir: profileDir });
const bindings = new BindingStore(spec.stateDir);
const project = await initProject(spec, bindings, { folder, source: source || folder, name });
console.log(JSON.stringify({ project, stateDir: spec.stateDir, home: spec.home, traceDir: spec.traceDir }));
