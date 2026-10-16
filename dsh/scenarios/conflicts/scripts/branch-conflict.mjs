// Conflict 2, Branch against Branch: header changes the same line on its own Branch.
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
  const history = (await lf.branch.list_commits("feature")).items.map((c) => c.message ?? c.id.slice(0, 12));
  console.log(`feature history, newest first: ${history.join(" | ")}`);
  show("fork header", await settle(() => lf.branch.fork("header")));
  show("edit the title on header", await lf.fs.edit("header", "/app/page.tsx", "Hello world", "Hello LayerFS", "title: Hello LayerFS"));
  try {
    await lf.branch.merge("feature", "header", "release", "release");
  } catch (error) {
    if (!isRefusal(error, "Conflict")) throw error;
    console.log(`merge feature + header → refused Conflict; nothing was created`);
    for (const c of error.detail?.conflicts ?? []) {
      for (const h of c.hunks ?? []) console.log(`  ${c.path} line ${h.line}: feature has ${h.ours.join(" ").trim()}, header has ${h.theirs.join(" ").trim()}`);
    }
  }
} finally {
  if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => settle(() => lf.sandbox.close(id))).catch(() => {});
}
