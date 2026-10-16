// ben on checkout: cart page; lint in the build.
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
// Commit; if the same line changed on the head, keep both build flags and commit again.
const commit = async (sb, path, message) => {
  try {
    const c = await lf.sandbox.commit(sb, path, message);
    console.log(`commit → ${c.kind}${c.merged ? " (merged with the head)" : ""}${c.lww?.length ? `, last writer won ${c.lww.length} path(s)` : ""}`);
  } catch (error) {
    if (!isRefusal(error, "Conflict")) throw error;
    console.log(`commit → refused Conflict: ${(error.detail?.conflicts ?? []).map((c) => c.path).join(", ")}`);
    await run(sb, path, `sed -i "/^<<<<<<< /d; /^=======$/,/^>>>>>>> /d" package.json && sed -i "s/sh build.sh --[a-z]*\\"/sh build.sh --lint --profile\\"/" package.json && grep build package.json`);
    show("commit", await lf.sandbox.commit(sb, path, `${message}; keep both build flags`));
  }
};
// A close that answered Busy may already have happened: report what LayerFS says and go on.
const close = async (sb) => {
  try { show("close the Sandbox", await settle(() => lf.sandbox.close(sb))); } catch (error) {
    console.log(`close the Sandbox → ${error.code ?? "error"}: ${error.message}`);
  }
};
try {
  const sb = await settle(() => lf.sandbox.create(`${project}-ben`, project, process.env.DSH_LAYERFS_IMAGE));
  const ws = await lf.sandbox.mount(sb, "checkout");
  console.log(`mount checkout → ${ws}`);
  await run(sb, ws, `mkdir -p app/cart && cp app/page.tsx app/cart/page.tsx && sed -i "s/Hello world/Cart/" app/cart/page.tsx && sed -i 's/\\("build": "sh build.sh[^"]*\\)"/\\1 --lint"/' package.json && grep build package.json`);
  await commit(sb, ws, "cart page; lint in the build");
  show("unmount", await lf.sandbox.unmount(sb, ws));
  await close(sb);
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
