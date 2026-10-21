// The main agent publishes footer-2, then checks main.
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
  show("publish footer-2", await settle(() => lf.branch.publish("footer-2")));
  const files = (await lf.fs.list("main", "/app")).items.map((i) => i.path.split("/").pop());
  console.log(`main /app: ${files.join(" ")}`);
} finally {
  await lf.close();
}
