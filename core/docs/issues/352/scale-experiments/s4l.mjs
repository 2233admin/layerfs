// #352 scale experiments S4 (two-sided install merge) and S3 (install while
// another Workspace commits), crazy_work_load_watch_out.md. Runs inside the
// scale runner container (Linux, Store in this process, F-020). Stages, one
// command each (2-minute rule): prep | play | merge | close.
// Base: dev352-p3h's range-015 snapshot (range 15's checkpoint, node_modules
// installed), restored into volume layerfs-issue352-scale-s4. Correctness
// only: every outcome is printed; nothing is retried.
import { appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "/Users/yifanxu/lfs-history/scale-experiments/s4l";
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
} else if (stage === "lww-prep") {
  // owner 2026-10-18: the two-sided merge with /.lww built from every dsh .gitignore (gen-lww.mjs), committed on the base.
  // The range-15 snapshot is gone, so the base is range 14's checkpoint (p2-main-f) taken to range 15's tree by fs.apply (gen-r15.mjs).
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const d = JSON.parse(readFileSync(join(DIR, "r15-changes.json"), "utf8"));
  await attempt("fork s4l-base", () => lf.branch.fork("s4l-base", "main"));
  for (let i = 0; i < d.changes.length; i += 100) {
    await attempt(`apply r15 changes ${i}..${Math.min(i + 100, d.changes.length) - 1}`, () => lf.fs.apply("s4l-base", d.changes.slice(i, i + 100), `s4l base: range 15 tree ${i}`));
  }
  let same = 0, wrong = [];
  for (const e of d.expect) {
    let text = null;
    try { const r = await lf.fs.read("s4l-base", e.path, 1, 1000000); if (r.truncated) { wrong.push({ path: e.path, why: "truncated read" }); continue; } text = r.text; } catch (err) { text = null; if (e.blob) { wrong.push({ path: e.path, why: err?.code }); continue; } }
    if (!e.blob) { if (text === null) same++; else wrong.push({ path: e.path, why: "still present" }); continue; }
    const b = Buffer.from(text, "utf8"), h = createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex");
    if (h.startsWith(e.blob)) same++; else wrong.push({ path: e.path, why: "blob differs" });
  }
  log({ label: "range 15 tree check (changed paths)", checked: d.expect.length, same, wrong: wrong.length, wrongSample: wrong.slice(0, 10) });
} else if (stage === "lww-play") {
  // liaison 2026-10-18 after F-036: Sandbox a only, installs committed one after the other, different mount roots
  await attempt("fork s4l-c", () => lf.branch.fork("s4l-c", "s4l-base"));
  await attempt("fork s4l-d", () => lf.branch.fork("s4l-d", "s4l-base"));
  await attempt("create sandbox a", () => lf.sandbox.create("a", "dsh", process.env.LAYERFS_IMAGE, vol));
  const hold = await attempt("mount a placeholder (s4l-base)", () => lf.sandbox.mount("a", "s4l-base"));
  const wc = await attempt("mount c", () => lf.sandbox.mount("a", "s4l-c"));
  await exec("a", wc, "c install", install);
  await attempt("commit c", () => lf.sandbox.commit("a", wc, "s4l c install"));
  const wd = await attempt("mount d", () => lf.sandbox.mount("a", "s4l-d"));
  await exec("a", wd, "d install", install);
  await attempt("commit d", () => lf.sandbox.commit("a", wd, "s4l d install"));
  await attempt("unmount c", () => lf.sandbox.unmount("a", wc, false));
  await attempt("unmount d", () => lf.sandbox.unmount("a", wd, false));
  await attempt("unmount placeholder", () => lf.sandbox.unmount("a", hold, true));
} else if (stage === "lww-merge") {
  const v = await attempt("merge s4l-c with s4l-d (lww)", () => lf.branch.merge("s4l-c", "s4l-d", "s4l-m", "s4 two-sided install merge with /.lww"));
  writeFileSync(join(DIR, "lww-merge-value.json"), JSON.stringify(v?.refused ? { code: v.refused.code, message: v.refused.message, detail: v.refused.detail ?? null } : v, null, 1));
  // which side each state file took: compare the merged text with each side's
  for (const f of ["/node_modules/.modules.yaml", "/node_modules/.pnpm-workspace-state-v1.json", "/node_modules/.bin/eslint", "/node_modules/.bin/tsc", "/node_modules/.bin/vitest"]) {
    const t = {};
    for (const b of ["s4l-c", "s4l-d", "s4l-m"]) { try { t[b] = (await lf.fs.read(b, f, 1, 100000)).text; } catch (e) { t[b] = `!${e?.code}`; } }
    log({ label: `side ${f}`, mEqualsC: t["s4l-m"] === t["s4l-c"], mEqualsD: t["s4l-m"] === t["s4l-d"], cEqualsD: t["s4l-c"] === t["s4l-d"], roots: Object.fromEntries(Object.entries(t).map(([b, s]) => [b, [...new Set(String(s).match(/\/workspaces\/\d+/g) ?? [])]])) });
  }
} else if (stage === "lww-install") {
  // the merged result: its tree as merged (lister vs the native oracle), then pnpm install, then the lister again
  const { listerCommand, parseLister, compareInstalled } = await import(join(HIST, "closure.mjs"));
  const { readFileSync } = await import("node:fs");
  const oracle = JSON.parse(readFileSync(join(DIR, "oracle-4e0a2af9.json"), "utf8"));
  const ws = await attempt("mount s4l-m", () => lf.sandbox.mount("a", "s4l-m"));
  await exec("a", ws, "pwd", "pwd");
  for (const when of ["as merged", "after install"]) {
    if (when === "after install") await exec("a", ws, "install in merged result", install);
    const r = await lf.sandbox.exec("a", ws, listerCommand());
    const p = parseLister(r.stdout);
    const cmp = compareInstalled(oracle, p.groups ?? p);
    log({ label: `lister ${when}`, exitCode: r.exitCode, truncated: r.truncated, normalized: p.normalized ?? null, ok: cmp.ok, groups: cmp.groups, missing: cmp.missing.length, extra: cmp.extra.length, differ: cmp.differ.length, differSample: cmp.differ.slice(0, 12) });
  }
  await attempt("commit merged-result install", () => lf.sandbox.commit("a", ws, "s4l install in merged result"));
  await attempt("unmount s4l-m", () => lf.sandbox.unmount("a", ws, false));
} else if (stage === "r15-check") {
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const d = JSON.parse(readFileSync(join(DIR, "r15-changes.json"), "utf8"));
  let same = 0, wrong = [];
  for (const e of d.expect) {
    let text = null;
    try { const r = await lf.fs.read("s4l-base", e.path, 1, 1000000); if (r.truncated) { wrong.push({ path: e.path, why: "truncated read" }); continue; } text = r.text; } catch (err) { text = null; if (e.blob) { wrong.push({ path: e.path, why: err?.code }); continue; } }
    if (!e.blob) { if (text === null) same++; else wrong.push({ path: e.path, why: "still present" }); continue; }
    const b = Buffer.from(text, "utf8"), h = createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex");
    if (h.startsWith(e.blob)) same++; else wrong.push({ path: e.path, why: "blob differs" });
  }
  log({ label: "range 15 tree check (changed paths)", checked: d.expect.length, same, wrong: wrong.length, wrongSample: wrong.slice(0, 10) });
} else if (stage === "r15-sizes") {
  const { readFileSync } = await import("node:fs");
  const d = JSON.parse(readFileSync(join(DIR, "r15-changes.json"), "utf8"));
  const out = [];
  for (const e of d.expect.filter((x) => x.blob)) {
    const r = await lf.fs.read("s4l-base", e.path, 1, 1000000);
    if (!r.truncated) continue;
    const st = await lf.fs.stat("s4l-base", e.path);
    out.push({ path: e.path, size: st.size });
  }
  writeFileSync(join(DIR, "lww", "r15-truncated-sizes.json"), JSON.stringify(out, null, 1));
  log({ label: "truncated-read sizes", n: out.length });
} else if (stage === "read-diag") {
  const r = await lf.fs.read("s4l-base", "/AGENTS.md", 1, 1000000);
  const st = await lf.fs.stat("s4l-base", "/AGENTS.md").catch((e) => ({ refused: e?.code }));
  const { createHash } = await import("node:crypto"); const b = Buffer.from(r.text, "utf8");
  log({ label: "hash diag", bytes: b.length, sha: createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex") });
  log({ label: "read diag", keys: Object.keys(r), size: r.size, textLen: r.text.length, head: r.text.slice(0, 160), tail: JSON.stringify(r.text.slice(-60)), stat: st });
} else if (stage === "lww-diag") {
  // control: the single-side install s4l-c against the oracle; then where the merged-and-reinstalled result still differs
  const { listerCommand, parseLister, compareInstalled } = await import(join(HIST, "closure.mjs"));
  const { readFileSync } = await import("node:fs");
  const oracle = JSON.parse(readFileSync(join(DIR, "oracle-4e0a2af9.json"), "utf8"));
  const wc = await attempt("mount s4l-c", () => lf.sandbox.mount("a", "s4l-c"));
  const rc = await lf.sandbox.exec("a", wc, listerCommand());
  const cc = compareInstalled(oracle, parseLister(rc.stdout).groups);
  log({ label: "control lister s4l-c", root: (await lf.sandbox.exec("a", wc, "pwd")).stdout.trim(), normalized: parseLister(rc.stdout).normalized, ok: cc.ok, missing: cc.missing.length, extra: cc.extra.length, differ: cc.differ.length, differSample: cc.differ.slice(0, 8) });
  await attempt("unmount s4l-c", () => lf.sandbox.unmount("a", wc, true));
  const wm = await attempt("mount s4l-m", () => lf.sandbox.mount("a", "s4l-m"));
  await exec("a", wm, "stale roots in merged result", "pwd; grep -rlI --exclude-dir=.git -e /workspaces/2 -e /workspaces/3 node_modules packages/*/node_modules apps/*/node_modules 2>/dev/null | awk '{n++; if (n<=12) print} END {print \"files with a stale root:\", n+0}'; grep -rlI -e /workspaces/2 -e /workspaces/3 node_modules 2>/dev/null | sed -E 's#.*/node_modules/##' | awk -F/ '{print $1}' | sort | uniq -c | sort -rn | head");
  await exec("a", wm, "modules.yaml vs c", "grep -n 'prunedAt\\|virtualStoreDir\\|storeDir\\|/workspaces' node_modules/.modules.yaml | head -20");
  await attempt("unmount s4l-m", () => lf.sandbox.unmount("a", wm, true));
} else if (stage === "unmount-left") {
  await attempt("unmount /workspaces/6 (discard)", () => lf.sandbox.unmount("a", "/workspaces/6", true));
} else if (stage === "close") {
  for (const s of ["a"]) await attempt(`close sandbox ${s}`, () => lf.sandbox.close(s));
} else { console.error("usage: s4.mjs prep|play|merge|play2|merge2|close"); process.exit(2); }
await lf.close?.();
