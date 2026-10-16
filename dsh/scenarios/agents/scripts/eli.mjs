// eli on search: write the tokenizer with fs, then test the Branch in a Sandbox.
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
const run = async (sb, path, command) => {
  const r = await lf.sandbox.exec(sb, path, command);
  console.log(`$ ${command}  → ${r.kind}\n${r.stdout}${r.stderr}`.trimEnd());
  return r;
};
// A close that answered Busy may already have happened: report what LayerFS says and go on.
const close = async (sb) => {
  try { show("close the Sandbox", await settle(() => lf.sandbox.close(sb))); } catch (error) {
    console.log(`close the Sandbox → ${error.code ?? "error"}: ${error.message}`);
  }
};
try {
  const tokenizer = "export const tokenize = (s) => s.toLowerCase().split(' ');\n";
  show("mkdir lib and write lib/tokenize.ts", await settle(() => lf.fs.apply("search", [{ op: "mkdir", path: "/lib" }, { op: "write", path: "/lib/tokenize.ts", content: tokenizer }], "tokenizer")));
  const sb = await settle(() => lf.sandbox.create(`${project}-eli`, project, process.env.DSH_LAYERFS_IMAGE));
  const ws = await lf.sandbox.mount(sb, "search");
  console.log(`mount search → ${ws}`);
  await run(sb, ws, "ls lib && sh test.sh");
  show("unmount", await lf.sandbox.unmount(sb, ws, true));
  await close(sb);
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
