// Two Branches, two Workspaces: LayerFS places both in one Sandbox, which has room for 16.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
// notes between this agent's bash calls, outside the workspace folder (Init would import them)
const NOTES_DIR = join(dirname(dirname(process.env.DSH_LAYERFS_TRACE)), "demo-notes", process.env.DSH_LAYERFS_PROJECT);
const NOTES = join(NOTES_DIR, "sandbox.json");
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
const run = async (ws, command) => {
  const r = await lf.workspace.exec(ws, command);
  console.log(`$ ${command}  → ${r.kind}\n${r.stdout}${r.stderr}`.trimEnd());
  return r;
};
try {
  show("fork docs", await settle(() => lf.branch.fork("docs")));
  show("fork site", await settle(() => lf.branch.fork("site")));
  const docs = await lf.workspace.mount("docs");
  const site = await lf.workspace.mount("site");
  console.log(`docs at Sandbox ${docs.sandbox} ${docs.path}, site at Sandbox ${site.sandbox} ${site.path}`);
  keep({ docs, site });
  await run(docs, "mkdir -p docs && cp README.md docs/guide.md && sed -i 's/Website/Guide/' docs/guide.md && cat docs/guide.md");
  await run(site, "sh install.sh");
  await run(site, "test -f docs/guide.md && echo 'site sees docs/guide.md' || echo 'site cannot see docs/guide.md: separate overlays'");
} finally {
  await lf.close();
}
