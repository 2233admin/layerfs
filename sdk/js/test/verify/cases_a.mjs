// VERIFICATION section A: the JS package against the real daemon.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { check, mount, note, refusal, sh, unmount } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

async function init(ctx) {
  return ctx.layerfs.project.init(ctx.source);
}

/** fork feature, then seven writes; returns the Commit ids oldest first. */
async function writes(ctx) {
  const fs = ctx.layerfs.fs;
  const branch = "feature";
  await ctx.layerfs.branch.fork(branch);
  const results = [
    await fs.write(branch, "/notes.txt", "one\n"),
    await fs.edit(branch, "/notes.txt", "one", "two"),
    await fs.apply(branch, [{ op: "write", path: "/a.txt", content: "a\n" }, { op: "write", path: "/b.txt", content: "b\n" }]),
    await fs.mkdir(branch, "/docs"),
    await fs.cp(branch, "/a.txt", "/docs/a.txt"),
    await fs.mv(branch, "/b.txt", "/docs/b.txt"),
    await fs.rm(branch, "/a.txt"),
  ];
  return results;
}

export const A = {
  async A1(ctx) {
    check(ctx, "no Sandbox before the first call", ctx.layerfs.sandboxes.size === 0 && ctx.layerfs.serviceSandbox === null);
    const value = await init(ctx);
    check(ctx, "Initialized", value.kind === "Initialized", value);
    check(ctx, "Init needs no Sandbox", ctx.layerfs.sandboxes.size === 0);
    const { items } = await ctx.layerfs.project.list_branches();
    check(ctx, "main has the first Layer", items[0].name === "main" && items[0].base === value.layer, items);
    check(ctx, "no other Branch (Init's own is hidden)", items.length === 1, items.map((i) => i.name));
  },

  async A2(ctx) {
    const init0 = await init(ctx);
    const results = await writes(ctx);
    check(ctx, "every write is Committed", results.every((r) => r.kind === "Committed"), results.map((r) => r.kind));
    const heads = results.map((r) => r.head);
    check(ctx, "each write is a new Commit", new Set(heads).size === heads.length);
    const { items } = await ctx.layerfs.branch.list_commits("feature");
    check(ctx, "seven Commits on feature (apply is one)", items.length === 7, items.length);
    check(ctx, "Commits are via fs", items.every((c) => c.via === "fs"), items.map((c) => c.via));
    check(ctx, "parents chain the writes", items.every((c, i) => i === items.length - 1 ? c.parent === null : c.parent === items[i + 1].id));
    const listed = await ctx.layerfs.project.list_branches();
    check(ctx, "main unchanged", listed.items[0].base === init0.layer);
    const onMain = await refusal(ctx.layerfs.fs.read("main", "/notes.txt"));
    check(ctx, "main has no notes.txt", onMain && onMain.code === "NoSuchPath", onMain && onMain.code);
    const readOnly = await refusal(ctx.layerfs.fs.write("main", "/x", "x"));
    check(ctx, "main is read-only", readOnly && readOnly.code === "ReadOnly");
  },

  async A3(ctx) {
    await init(ctx);
    const results = await writes(ctx);
    const fs = ctx.layerfs.fs;
    const now = await fs.read("feature", "/notes.txt");
    check(ctx, "head bytes", now.text === "two\n", now.text);
    const then = await fs.read(results[0].head, "/notes.txt");
    check(ctx, "older Commit bytes", then.text === "one\n", then.text);
    const list = await fs.list("feature", "/");
    const names = list.items.map((i) => `${i.name}:${i.type}`);
    check(ctx, "list", names.includes("notes.txt:file") && names.includes("docs:dir") && !names.includes("a.txt:file"), names);
    const stat = await fs.stat("feature", "/docs/b.txt");
    check(ctx, "stat", stat.type === "file" && stat.size === 2, stat);
    const grep = await fs.grep("feature", "two", "/");
    check(ctx, "grep", grep.items.length === 1 && grep.items[0].path === "/notes.txt" && grep.items[0].line === 1, grep.items);
    const glob = await fs.glob("feature", "docs/*.txt", "/");
    check(ctx, "glob", JSON.stringify(glob.items) === JSON.stringify(["/docs/a.txt", "/docs/b.txt"]), glob.items);
    const missing = await refusal(fs.read("feature", "/missing"));
    check(ctx, "NoSuchPath", missing && missing.code === "NoSuchPath");
    const dir = await refusal(fs.read("feature", "/docs"));
    check(ctx, "IsDirectory", dir && dir.code === "IsDirectory");
  },

  async A4(ctx) {
    await init(ctx);
    const results = await writes(ctx);
    const fs = ctx.layerfs.fs;
    const same = await fs.diff_files("feature", "/docs/a.txt", "feature", "/docs/a.txt");
    check(ctx, "Equal", same.kind === "Equal" && same.contentEqual && same.sameInode, same);
    const text = await fs.diff_files(results[0].head, "/notes.txt", "feature", "/notes.txt");
    const ops = text.hunks.map((h) => `${h.op}${h.text}`);
    check(ctx, "Text with hunks", text.kind === "Text" && ops.includes("-one") && ops.includes("+two"), ops);
    const commits = await ctx.layerfs.branch.diff_commits(results[0].head, results[6].head);
    const kinds = Object.fromEntries(commits.items.map((i) => [i.path, i.kind]));
    check(ctx, "diff_commits kinds", JSON.stringify(kinds) === JSON.stringify({ "/docs": "Added", "/docs/a.txt": "Added", "/docs/b.txt": "Added", "/notes.txt": "Modified" }), kinds);
    const branches = await ctx.layerfs.branch.diff_branches("main", "feature");
    const added = branches.items.filter((i) => i.kind === "Added").map((i) => i.path);
    check(ctx, "diff_branches", branches.items.every((i) => i.kind === "Added") && added.includes("/notes.txt") && added.includes("/docs/b.txt"), branches.items.map((i) => `${i.kind} ${i.path}`));
  },

  async A5(ctx) {
    await init(ctx);
    const results = await writes(ctx);
    const forked = await ctx.layerfs.branch.fork("try", results[2].head);
    check(ctx, "Forked at C3", forked.kind === "Forked" && forked.head === results[2].head, forked);
    const { items } = await ctx.layerfs.branch.list_commits("try");
    check(ctx, "metadata only: no new Commit", items.length === 3 && items[0].id === results[2].head, items.map((c) => c.id));
    const read = await ctx.layerfs.fs.read("try", "/b.txt");
    check(ctx, "try sees C3's files", read.text === "b\n");
  },

  async A7(ctx) {
    await init(ctx);
    await ctx.layerfs.branch.fork("feature");
    const sandbox = await ctx.layerfs.service();
    const ws = await mount(ctx, sandbox, "feature");
    const ready = await sh(ctx, ws, "npm ci && npm run build");
    check(ctx, "install and build", ready.exitCode === 0, ready.stdout + ready.stderr);
    const started = await sh(ctx, ws, "npm run start", { background: true });
    check(ctx, "running", started.kind === "running", started);
    const busy = await refusal(ctx.layerfs.sandbox.unmount(sandbox, ws.path));
    check(ctx, "Busy while it runs", busy && busy.code === "Busy", busy && busy.message);
    const stopped = await ctx.operator.process.cancel(sandbox, started.process);
    check(ctx, "Stopped", stopped.kind === "Stopped" && stopped.status === "stopped", stopped);
    const dirty = await refusal(ctx.layerfs.sandbox.unmount(sandbox, ws.path));
    const changed = dirty?.detail?.changed ?? [];
    check(ctx, "Dirty after cancel", dirty && dirty.code === "Dirty", dirty && dirty.message);
    check(ctx, "Dirty lists the build output", changed.includes("/.next") || changed.some((p) => p.startsWith("/.next")), changed);
    const done = await unmount(ctx, ws, { discard: true });
    check(ctx, "Unmounted with discard", done.kind === "Unmounted", done);
  },

  async A8(ctx) {
    await init(ctx);
    await ctx.layerfs.branch.fork("feature");
    const sandbox = await ctx.layerfs.service();
    const one = await mount(ctx, sandbox, "feature");
    const two = await mount(ctx, sandbox, "feature");
    const built = await sh(ctx, one, "npm ci && npm run build");
    check(ctx, "build in Workspace 1", built.exitCode === 0, built.stdout + built.stderr);
    const server = await sh(ctx, one, "npm run start", { background: true });
    check(ctx, "server running", server.kind === "running", server);
    // Bounded readiness wait for the listener, inside the one command.
    const got = await sh(ctx, two, "for i in $(seq 50); do curl -s localhost:3000/ && exit 0; sleep 0.1; done; exit 7");
    check(ctx, "Workspace 2 reaches the server", got.exitCode === 0 && got.stdout.includes("Hello world"), got);
    await ctx.operator.process.cancel(sandbox, server.process);
  },

  async A9(ctx) {
    await init(ctx);
    await ctx.layerfs.branch.fork("feature");
    const sandbox = await ctx.layerfs.service();
    const ws = await mount(ctx, sandbox, "feature");
    const here = await ctx.layerfs.sandbox.status(sandbox, ws.path);
    check(ctx, "first process uses the id", here.kind === "ok");
    const script = `import { LayerFS } from ${JSON.stringify(join(HERE, "../../src/index.js"))};
      const l = new LayerFS("website");
      try { const s = await l.sandbox.status(${JSON.stringify(sandbox)}, ${JSON.stringify(ws.path)}); console.log(JSON.stringify({ ok: s.kind })); }
      catch (e) { console.log(JSON.stringify({ refused: e.code, message: e.message })); }`;
    const out = execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8", timeout: 30000 });
    const other = JSON.parse(out.trim());
    check(ctx, "second process uses the same id", other.ok === "ok", other);
    note(ctx, "Historical A9 FAIL remains in Phase 2. Current comprehensive reopening proof is XPROCESS; this narrow status probe does not close that historical row.");
  },
};

