// Prepares a workspace folder for a LayerFS mock demo: copies the scenario's
// fixture into it (existing files are kept) and prints how to run it.
//   node dsh/tools/demo.mjs                      list the demos
//   node dsh/tools/demo.mjs <scenario> <folder>  copy the fixture into folder
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadScenarios } from "../packages/mock/src/scenario.js";

const scenarios = loadScenarios(fileURLToPath(new URL("../scenarios/", import.meta.url)));
const [name, folder] = process.argv.slice(2);
if (!name) {
  for (const [id, s] of scenarios) console.log(`${id.padEnd(10)} ${s.title}: ${s.blurb}`);
  process.exit(0);
}
const scenario = scenarios.get(name);
if (!scenario || !folder) {
  console.error(`usage: demo.mjs <${[...scenarios.keys()].join("|")}> <workspace folder>`);
  process.exit(2);
}
const target = resolve(folder);
mkdirSync(target, { recursive: true });
if (scenario.fixture) cpSync(scenario.fixture, target, { recursive: true, force: false, errorOnExist: false });
console.log(`${scenario.title}: ${target} holds the fixture${existsSync(resolve(target, ".git")) ? " (and its own .git)" : ""}.
In dsh, with the dsh-layerfs-demo bundle installed:
  1. Add ${target} as a workspace, and Import it as a LayerFS project (the LayerFS chip or page).
  2. New session there: preset "LayerFS × DSH minimalist", model "LayerFS mock · ${scenario.title}", the new project.
  3. Send any message; the mock runs ${Object.keys(scenario.agents).length} agent(s): ${Object.keys(scenario.agents).join(", ")}.
  4. Check it: node dsh/tools/check-demo.mjs '<dsh web URL with ?token=…>' <session id> ${name}`);
