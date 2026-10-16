// Serve the site in the background, then try to unmount while it runs.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
// notes between this agent's bash calls, outside the workspace folder (Init would import them)
const NOTES_DIR = join(dirname(dirname(process.env.DSH_LAYERFS_TRACE)), "demo-notes", process.env.DSH_LAYERFS_PROJECT);
const NOTES = join(NOTES_DIR, "tour.json");
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
const { LayerFSOperator } = await import(process.env.DSH_LAYERFS_OPERATOR);
try {
  const { sb, path } = notes();
  const server = await new LayerFSOperator(lf).process.start(sb, path, "sh serve.sh");
  console.log(`start sh serve.sh → ${server.kind} (${server.process})`);
  keep({ sb, path, server: server.process });
  try {
    await lf.sandbox.unmount(sb, path);
  } catch (error) {
    if (!isRefusal(error, "Busy")) throw error;
    console.log(`unmount → refused ${error.code}: a process still runs in the Workspace`);
  }
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
