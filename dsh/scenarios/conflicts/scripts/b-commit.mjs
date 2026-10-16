// b: has feature moved since the mount? Then commit: the same line changed on both sides.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
// notes between this agent's bash calls, outside the workspace folder (Init would import them)
const NOTES_DIR = join(dirname(dirname(process.env.DSH_LAYERFS_TRACE)), "demo-notes", process.env.DSH_LAYERFS_PROJECT);
const NOTES = join(NOTES_DIR, "b.json");
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
  const { sb, path } = notes();
  const status = await lf.sandbox.status(sb, path);
  console.log(`status → head moved since mount: ${status.headMovedSinceMount}`);
  try {
    await lf.sandbox.commit(sb, path, "title: Welcome");
  } catch (error) {
    if (!isRefusal(error, "Conflict")) throw error;
    console.log(`commit → refused Conflict: ${(error.detail?.conflicts ?? []).map((c) => c.path).join(", ")}`);
    console.log(`applied from the head: ${(error.detail?.written ?? error.detail?.applied ?? []).join(", ") || "(see the Workspace)"}`);
  }
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
