// Start the slow site build as a Sandbox process and wait for it here; as a
// background bash job, this leaves the agent free while the build runs.
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
const run = async (sb, path, command) => {
  const r = await lf.sandbox.exec(sb, path, command);
  console.log(`$ ${command}  → ${r.kind}\n${r.stdout}${r.stderr}`.trimEnd());
  return r;
};
const { LayerFSOperator } = await import(process.env.DSH_LAYERFS_OPERATOR);
try {
  const { sb, site } = notes();
  const op = new LayerFSOperator(lf);
  const build = await op.process.start(sb, site, "sh build.sh --slow");
  console.log(`start sh build.sh --slow → ${build.kind} (${build.process})`);
  for (let status = "running"; status === "running"; ) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    status = (await op.process.list(sb)).items.find((p) => p.id === build.process)?.status ?? "gone";
    if (status !== "running") console.log(`build ${status}`);
  }
  await run(sb, site, "cat .next/BUILD_ID && ls .next/server/app");
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
