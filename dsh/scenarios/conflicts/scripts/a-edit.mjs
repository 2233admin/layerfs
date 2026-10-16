// a: mount feature in a Sandbox of its own and change the page title; commit later.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
// notes between this agent's bash calls, outside the workspace folder (Init would import them)
const NOTES_DIR = join(dirname(dirname(process.env.DSH_LAYERFS_TRACE)), "demo-notes", process.env.DSH_LAYERFS_PROJECT);
const NOTES = join(NOTES_DIR, "a.json");
const notes = () => JSON.parse(readFileSync(NOTES, "utf8"));
const keep = (values) => { mkdirSync(NOTES_DIR, { recursive: true }); writeFileSync(NOTES, JSON.stringify(values)); };
const { LayerFS, isRefusal } = await import(process.env.DSH_LAYERFS_SDK);
const project = process.env.DSH_LAYERFS_PROJECT;
const lf = new LayerFS(project);
const show = (what, value) => console.log(`${what} → ${value.kind}`);
// Busy: another agent is changing LayerFS right now. Wait and try again.
const settle = async (call) => {
  for (let attempt = 1; ; attempt++) {
    try { return await call(); } catch (error) {
      if (!isRefusal(error, "Busy") || attempt === 8) throw error;
      await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
    }
  }
};
const run = async (sb, path, command) => {
  const r = await lf.sandbox.exec(sb, path, command);
  console.log(`$ ${command}  → ${r.kind}\n${r.stdout}${r.stderr}`.trimEnd());
  return r;
};
try {
  const sb = await settle(() => lf.sandbox.create(`${project}-a`, project, process.env.DSH_LAYERFS_IMAGE));
  const ws = await lf.sandbox.mount(sb, "feature");
  console.log(`mount feature → ${ws} (Sandbox ${sb})`);
  keep({ sb, path: ws });
  await run(sb, ws, "sed -i 's/Hello world/Home/' app/page.tsx && sed -i '1s/.*/# Website (with navigation)/' README.md && grep h1 app/page.tsx");
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
