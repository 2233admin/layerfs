// header: fork header from main, write app/header.tsx with fs, then test the Branch in a Workspace.
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
  show("fork header", await settle(() => lf.branch.fork("header")));
  show("write app/header.tsx", await lf.fs.write("header", "/app/header.tsx", "export const Header = () => <header>LayerFS</header>;\n", "add app/header.tsx"));
  const ws = await lf.workspace.mount("header");
  console.log(`mount header → Sandbox ${ws.sandbox} ${ws.path}`);
  await run(ws, "sh test.sh && ls app");
  show("unmount", await lf.workspace.unmount(ws));
  const [head] = (await lf.branch.list_commits("header")).items;
  console.log(`ready: Branch header at Commit ${head.id.slice(0, 12)}`);
} finally {
  await lf.close();
}
