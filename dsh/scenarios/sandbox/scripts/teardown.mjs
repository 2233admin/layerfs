// Teardown: commit docs (it merges with the fs write), then unmount and close.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
// notes between this agent's bash calls, outside the workspace folder (Init would import them)
const NOTES_DIR = join(dirname(dirname(process.env.DSH_LAYERFS_TRACE)), "demo-notes", process.env.DSH_LAYERFS_PROJECT);
const NOTES = join(NOTES_DIR, "sandbox.json");
const notes = () => JSON.parse(readFileSync(NOTES, "utf8"));
const keep = (values) => { mkdirSync(NOTES_DIR, { recursive: true }); writeFileSync(NOTES, JSON.stringify(values)); };
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
try {
  const { sb, docs, site } = notes();
  const c = await lf.sandbox.commit(sb, docs, "docs guide");
  console.log(`commit docs → ${c.kind}${c.merged ? " (merged with the head first)" : ""}`);
  show("unmount docs", await lf.sandbox.unmount(sb, docs));
  try {
    await lf.sandbox.unmount(sb, site);
  } catch (error) {
    if (!isRefusal(error, "Dirty")) throw error;
    console.log(`unmount site → refused Dirty: ${(error.detail?.changed ?? []).slice(0, 4).join(", ")}`);
  }
  show("unmount site, discarding the build output", await lf.sandbox.unmount(sb, site, true));
  show("close the Sandbox", await settle(() => lf.sandbox.close(sb)));
  show("fs.write README.md on docs", await lf.fs.write("docs", "/README.md", "# Website docs\n", "docs readme"));
  const files = (await lf.fs.list("docs", "/")).items.map((i) => i.path.split("/").pop());
  console.log(`docs /: ${files.join(" ")}`);
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
