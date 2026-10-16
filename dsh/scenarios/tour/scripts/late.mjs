// late was forked before the publish. Publishing it overwrites main.
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
  show("write app/late.tsx on late", await lf.fs.write("late", "/app/late.tsx", "export const Late = () => null;\n", "late page"));
  console.log(`main /app before: ${await names("main")}`);
  show("publish late", await lf.branch.publish("late"));
  console.log(`main /app after:  ${await names("main")}   (about/ is gone: late never had it)`);
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
