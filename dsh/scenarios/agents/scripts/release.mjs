// The main agent merges both Branches into release and publishes it.
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
  const m = await settle(() => lf.branch.merge("checkout", "search", "release", "release: checkout and search"));
  console.log(`merge checkout + search into release → ${m.kind}${m.lww?.length ? `, last writer won ${m.lww.length} path(s)` : ""}`);
  show("publish release", await settle(() => lf.branch.publish("release")));
  const pages = (await lf.fs.list("main", "/app")).items.map((i) => i.path.split("/").pop());
  console.log(`main /app: ${pages.join(" ")}`);
  const pkg = await lf.fs.read("main", "/package.json");
  console.log(`main build script: ${pkg.text.match(/"build": "[^"]*"/)?.[0]}`);
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
