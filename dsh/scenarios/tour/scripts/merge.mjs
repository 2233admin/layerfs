// Merge first to keep both: merge never changes its inputs.
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
const names = async (ref) => (await lf.fs.list(ref, "/app")).items.map((i) => i.path.split("/").pop()).join(" ");
try {
  show("merge feature-home + late into both", await lf.branch.merge("feature-home", "late", "both", "keep both"));
  show("publish both", await lf.branch.publish("both"));
  console.log(`main /app now: ${await names("main")}`);
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
