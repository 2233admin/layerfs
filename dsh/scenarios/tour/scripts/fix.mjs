// Fix the lint error inside the Workspace, then build and test again.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const NOTES = ".layerfs-demo/tour.json";
const notes = () => JSON.parse(readFileSync(NOTES, "utf8"));
const keep = (values) => { mkdirSync(".layerfs-demo", { recursive: true }); writeFileSync(NOTES, JSON.stringify(values)); };
const { LayerFS, isRefusal } = await import(process.env.DSH_LAYERFS_SDK);
const lf = new LayerFS(process.env.DSH_LAYERFS_PROJECT);
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
};
try {
  const { sb, path } = notes();
  await run(sb, path, "sed -i \"s/We're/We\\&apos;re/\" app/about/page.tsx && grep h1 app/about/page.tsx");
  await run(sb, path, "sh build.sh");
  await run(sb, path, "sh test.sh");
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
