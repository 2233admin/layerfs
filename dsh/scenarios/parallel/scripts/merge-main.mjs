// footer: main moved since footer was forked. Publish overwrites, so bring main in
// on a new Branch; merge never changes its inputs.
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
  const m = await settle(() => lf.branch.merge("footer", "main", "footer-2", "bring in the header"));
  console.log(`merge footer + main into footer-2 → ${m.kind}`);
  const files = (await lf.fs.list("footer-2", "/app")).items.map((i) => i.path.split("/").pop());
  console.log(`footer-2 /app: ${files.join(" ")}`);
} finally {
  await lf.close();
}
