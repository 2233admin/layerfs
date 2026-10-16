// Write code through fs: each write is a Commit on feature-home, no Sandbox.
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
const ABOUT = `export default function About() {
  return (
    <main>
      <h1>We're building with LayerFS</h1>
    </main>
  );
}
`;
try {
  show("edit app/page.tsx", await lf.fs.edit("feature-home", "/app/page.tsx", "Hello world", "Welcome to LayerFS", "headline"));
  show("mkdir app/about", await lf.fs.mkdir("feature-home", "/app/about"));
  show("write app/about/page.tsx", await lf.fs.write("feature-home", "/app/about/page.tsx", ABOUT, "about page"));
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
