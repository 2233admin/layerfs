// footer: fork footer from main, write app/footer.tsx with fs, then test the Branch in a Workspace.
const { LayerFS, isRefusal } = await import(process.env.DSH_LAYERFS_SDK);
const project = process.env.DSH_LAYERFS_PROJECT;
const lf = new LayerFS(project);
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
const run = async (ws, command) => {
  const r = await lf.workspace.exec(ws, command);
  console.log(`$ ${command}  → ${r.kind}\n${r.stdout}${r.stderr}`.trimEnd());
  return r;
};
try {
  show("fork footer", await settle(() => lf.branch.fork("footer")));
  show("write app/footer.tsx", await lf.fs.write("footer", "/app/footer.tsx", "export const Footer = () => <footer>© 2026</footer>;\n", "add app/footer.tsx"));
  const ws = await lf.workspace.mount("footer");
  console.log(`mount footer → Sandbox ${ws.sandbox} ${ws.path}`);
  await run(ws, "sh test.sh && ls app");
  show("unmount", await lf.workspace.unmount(ws));
  const [head] = (await lf.branch.list_commits("footer")).items;
  console.log(`ready: Branch footer at Commit ${head.id.slice(0, 12)}`);
} finally {
  await lf.close();
}
