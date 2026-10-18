// #352 scale experiments S4 (two-sided install merge) and S3 (install while
// another Workspace commits), crazy_work_load_watch_out.md. Runs inside the
// scale runner container (Linux, Store in this process, F-020). Stages, one
// command each (2-minute rule): prep | play | merge | close.
// Base: dev352-p3h's range-015 snapshot (range 15's checkpoint, node_modules
// installed), restored into volume layerfs-issue352-scale-s4. Correctness
// only: every outcome is printed; nothing is retried.
import { appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "/Users/yifanxu/lfs-history/scale-experiments/s4";
const SDK = "/Users/yifanxu/Ephemeral-AI-Lab/layerfs-352-scale/sdk/js";
const HIST = "/Users/yifanxu/Ephemeral-AI-Lab/layerfs-352-scale/dsh/tools/history";
const { LayerFS } = await import(join(SDK, "src/index.js"));
const { installCommand, sandboxVolumes } = await import(join(HIST, "closure.mjs"));
const STORE = "/pnpm-store";
const stage = process.argv[2];
const log = (o) => { const line = JSON.stringify({ t: new Date().toISOString(), stage, ...o }); console.log(line); appendFileSync(join(DIR, "receipts.jsonl"), line + "\n"); };
const lf = new LayerFS("dsh", { trace: join(DIR, `trace-${stage}.jsonl`) });
const vol = sandboxVolumes("layerfs-issue352-pnpm-store");
const tail = (s, n = 1500) => { s = String(s ?? ""); return s.length > n ? "…" + s.slice(-n) : s; };
async function attempt(label, work) {
  const t0 = Date.now();
  try { const v = await work(); log({ label, ok: true, ms: Date.now() - t0, kind: v?.kind, value: v }); return v; }
  catch (e) { log({ label, ok: false, ms: Date.now() - t0, code: e?.code, message: String(e?.message ?? e).slice(0, 2000), detail: e?.detail ?? null }); return { refused: e }; }
}
async function exec(sb, ws, label, cmd) {
  const t0 = Date.now();
  try {
    const r = await lf.sandbox.exec(sb, ws, cmd);
    const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
    log({ label, ok: true, ms: Date.now() - t0, exitCode: r.exitCode, truncated: r.truncated, eagain: /EAGAIN|Resource temporarily unavailable/i.test(out), eio: /\bEIO\b|input\/output error/i.test(out), stdoutTail: tail(r.stdout), stderrTail: tail(r.stderr) });
    return r;
  } catch (e) { log({ label, ok: false, ms: Date.now() - t0, code: e?.code, message: String(e?.message ?? e).slice(0, 2000) }); return null; }
}
const install = installCommand({ store: STORE });

if (stage === "prep") {
  // the base without node_modules: range 15's tree, node_modules removed and committed
  await attempt("create s4-base sandbox", () => lf.sandbox.create("base", "dsh", process.env.LAYERFS_IMAGE, vol));
  await attempt("fork s4-base", () => lf.branch.fork("s4-base", "main"));
  const ws = await attempt("mount s4-base", () => lf.sandbox.mount("base", "s4-base"));
  await exec("base", ws, "count node_modules", "find node_modules -maxdepth 0 -type d | wc -l; ls node_modules | wc -l; ls node_modules/.bin | wc -l");
  await exec("base", ws, "rm -rf node_modules", "rm -rf node_modules; echo rm-exit=$?");
  await attempt("commit s4-base", () => lf.sandbox.commit("base", ws, "s4 base: no node_modules"));
  await attempt("unmount s4-base", () => lf.sandbox.unmount("base", ws, false));
  await attempt("close base sandbox", () => lf.sandbox.close("base"));
} else if (stage === "play") {
  await attempt("fork s4-a", () => lf.branch.fork("s4-a", "s4-base"));
  await attempt("fork s4-b", () => lf.branch.fork("s4-b", "s4-base"));
  await attempt("create sandbox a", () => lf.sandbox.create("a", "dsh", process.env.LAYERFS_IMAGE, vol));
  await attempt("create sandbox b", () => lf.sandbox.create("b", "dsh", process.env.LAYERFS_IMAGE, vol));
  const wb = await attempt("mount b", () => lf.sandbox.mount("b", "s4-b"));
  await exec("b", wb, "b install (alone)", install);
  // S3: A's install runs while B's install Commit is constructing and publishing (another daemon, same Store)
  const wa = await attempt("mount a", () => lf.sandbox.mount("a", "s4-a"));
  log({ label: "S3 overlap start" });
  await Promise.all([
    exec("a", wa, "a install (during b commit)", install),
    attempt("commit b (during a install)", () => lf.sandbox.commit("b", wb, "s4 b install")),
  ]);
  log({ label: "S3 overlap end" });
  await attempt("commit a", () => lf.sandbox.commit("a", wa, "s4 a install"));
  await exec("a", wa, "a pwd", "pwd");
  await attempt("unmount a", () => lf.sandbox.unmount("a", wa, false));
  await attempt("unmount b", () => lf.sandbox.unmount("b", wb, false));
} else if (stage === "merge") {
  const v = await attempt("merge s4-a with s4-b", () => lf.branch.merge("s4-a", "s4-b", "s4-m", "s4 two-sided install merge"));
  writeFileSync(join(DIR, "merge-value.json"), JSON.stringify(v?.refused ? { code: v.refused.code, message: v.refused.message, detail: v.refused.detail ?? null } : v, null, 1));
} else if (stage === "play2") {
  // variant: the two installs at different mount paths (/workspaces/2 vs /workspaces/1), as a shared Sandbox pool gives
  await attempt("fork s4-c", () => lf.branch.fork("s4-c", "s4-base"));
  await attempt("fork s4-d", () => lf.branch.fork("s4-d", "s4-base"));
  const hold = await attempt("mount a placeholder (s4-base)", () => lf.sandbox.mount("a", "s4-base"));
  const wc = await attempt("mount c", () => lf.sandbox.mount("a", "s4-c"));
  const wd = await attempt("mount d", () => lf.sandbox.mount("b", "s4-d"));
  await Promise.all([exec("a", wc, "c install", install), exec("b", wd, "d install", install)]);
  await Promise.all([attempt("commit c", () => lf.sandbox.commit("a", wc, "s4 c install")), attempt("commit d", () => lf.sandbox.commit("b", wd, "s4 d install"))]);
  await attempt("unmount c", () => lf.sandbox.unmount("a", wc, false));
  await attempt("unmount d", () => lf.sandbox.unmount("b", wd, false));
  await attempt("unmount placeholder", () => lf.sandbox.unmount("a", hold, true));
} else if (stage === "merge2") {
  const v = await attempt("merge s4-c with s4-d", () => lf.branch.merge("s4-c", "s4-d", "s4-m2", "s4 two-sided install merge, different roots"));
  writeFileSync(join(DIR, "merge2-value.json"), JSON.stringify(v?.refused ? { code: v.refused.code, message: v.refused.message, detail: v.refused.detail ?? null } : v, null, 1));
} else if (stage === "diff2" || stage === "diff1") {
  // every path that differs between the two installed Branches (the conflict candidates; both sides added node_modules)
  const [x, y] = stage === "diff2" ? ["s4-c", "s4-d"] : ["s4-a", "s4-b"];
  const rows = []; let cursor;
  for (let i = 0; i < 200; i++) {
    const p = await lf.branch.diff_branches(x, y, 500, 0, { hunks: false, ...(cursor ? { cursor } : {}) });
    for (const e of p.items ?? []) rows.push({ path: e.path, kind: e.kind, type: e.type });
    cursor = p.nextCursor; if (!p.hasMore || !cursor) break;
  }
  writeFileSync(join(DIR, `${stage}-paths.json`), JSON.stringify(rows, null, 1));
  log({ label: `${stage} ${x} vs ${y}`, ok: true, paths: rows.length });
} else if (stage === "peek") {
  // the state files on each side, and which .bin shims differ in content (grep for each side's install root)
  for (const b of ["s4-a", "s4-b", "s4-c", "s4-d"]) {
    for (const f of ["/node_modules/.modules.yaml", "/node_modules/.pnpm-workspace-state-v1.json"]) {
      const r = await attempt(`read ${b} ${f}`, () => lf.fs.read(b, f, 1, 100000));
      const text = JSON.stringify(r);
      log({ label: `facts ${b} ${f}`, prunedAt: /prunedAt[^,]*/.exec(text)?.[0] ?? null, lastValidated: /lastValidatedTimestamp[^,]*/.exec(text)?.[0] ?? null, roots: [...new Set(text.match(/\/workspaces\/\d+/g) ?? [])] });
    }
  }
} else if (stage === "close") {
  for (const s of ["a", "b"]) await attempt(`close sandbox ${s}`, () => lf.sandbox.close(s));
} else { console.error("usage: s4.mjs prep|play|merge|play2|merge2|close"); process.exit(2); }
await lf.close?.();
