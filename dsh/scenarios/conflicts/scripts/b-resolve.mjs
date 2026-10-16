// b: keep one title that says both, drop the markers, commit on the new head.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const NOTES = ".layerfs-demo/b.json";
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
  return r;
};
// A close that answered Busy may already have happened: report what LayerFS says and go on.
const close = async (sb) => {
  try { show("close the Sandbox", await settle(() => lf.sandbox.close(sb))); } catch (error) {
    console.log(`close the Sandbox → ${error.code ?? "error"}: ${error.message}`);
  }
};
try {
  const { sb, path } = notes();
  await run(sb, path, "sed -i '/<h1>Home<\\/h1>/d; /^<<<<<<<\\|^=======\\|^>>>>>>>/d; s/<h1>Welcome</<h1>Welcome home</' app/page.tsx && cat app/page.tsx");
  show("commit", await lf.sandbox.commit(sb, path, "title: Welcome home"));
  show("unmount", await lf.sandbox.unmount(sb, path));
  await close(sb);
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
