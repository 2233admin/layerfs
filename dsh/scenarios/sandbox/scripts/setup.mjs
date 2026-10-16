// Two Branches, one Sandbox, two Workspaces: docs at /workspaces/1, site at /workspaces/2.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const NOTES = ".layerfs-demo/sandbox.json";
const notes = () => JSON.parse(readFileSync(NOTES, "utf8"));
const keep = (values) => { mkdirSync(".layerfs-demo", { recursive: true }); writeFileSync(NOTES, JSON.stringify(values)); };
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
  show("fork docs", await settle(() => lf.branch.fork("docs")));
  show("fork site", await settle(() => lf.branch.fork("site")));
  const sb = await settle(() => lf.sandbox.create(`${project}-docs-site`, project, process.env.DSH_LAYERFS_IMAGE));
  const docs = await lf.sandbox.mount(sb, "docs");
  const site = await lf.sandbox.mount(sb, "site");
  console.log(`Sandbox ${sb}: docs at ${docs}, site at ${site}`);
  keep({ sb, docs: docs, site: site });
  await run(sb, docs, "mkdir -p docs && cp README.md docs/guide.md && sed -i 's/Website/Guide/' docs/guide.md && cat docs/guide.md");
  await run(sb, site, "sh install.sh");
  await run(sb, site, "test -f docs/guide.md && echo 'site sees docs/guide.md' || echo 'site cannot see docs/guide.md: separate overlays'");
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
