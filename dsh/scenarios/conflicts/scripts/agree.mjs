// The merge conflict is mine: resolve it on a working fork, then merge and publish.
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
  show("fork header-fix from header", await settle(() => lf.branch.fork("header-fix", "header")));
  show("take feature's title on header-fix", await lf.fs.edit("header-fix", "/app/page.tsx", "Hello LayerFS", "Welcome home", "agree on the title"));
  show("merge feature + header-fix into release", await lf.branch.merge("feature", "header-fix", "release", "release"));
  show("publish release", await settle(() => lf.branch.publish("release")));
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
