// While the build runs: an fs write to docs, and the refusals that keep teardown explicit.
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
const refused = async (what, call, code) => {
  try { show(what, await call()); } catch (error) {
    if (!isRefusal(error, code)) throw error;
    console.log(`${what} → refused ${error.code}: ${error.message.replace(/^\w+: /, "")}`);
  }
};
try {
  const { sb, site } = notes();
  show("fs.write CHANGELOG.md on docs (docs is mounted)", await lf.fs.write("docs", "/CHANGELOG.md", "- docs guide\n", "changelog"));
  await refused("close the Sandbox", () => lf.sandbox.close(sb), "MountsActive");
  await refused("unmount site while it builds", () => lf.sandbox.unmount(sb, site), "Busy");
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
