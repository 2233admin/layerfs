// VERIFICATION section C: inspect and UI support.
import { check, mount, note, sh, unmount } from "./lib.mjs";

const branch = "feature";

async function start(ctx, files) {
  await ctx.layerfs.project.init(ctx.source, { name: "website" });
  await ctx.layerfs.branch.fork(branch);
  const c1 = await ctx.layerfs.fs.apply(Object.entries(files).map(([path, content]) => ({ kind: "write", path, content })), { branch });
  const sandbox = await ctx.layerfs.service();
  return { c1: c1.head, sandbox };
}

const snap = (ctx, since) => ctx.layerfs.inspect.snapshot({ since });
const workspaces = (s) => s.sandboxes.flatMap((sb) => sb.workspaces);
const byPath = (s, path) => workspaces(s).find((w) => w.directory === path);
const headOf = (s, name) => (s.branches.find((b) => b.name === name) || {}).head;
const commitOf = (s, id) => s.commits.find((c) => c.id === id);

export const C = {
  async C1(ctx) {
    const s = await start(ctx, { "/x.txt": "x\n", "/y.txt": "y\n" });
    const a = await mount(ctx, s.sandbox, branch);
    const b = await mount(ctx, s.sandbox, branch);
    let view = await snap(ctx);
    check(ctx, "mounted: both Workspaces at C1", byPath(view, a.path).base === s.c1 && byPath(view, b.path).base === s.c1 && headOf(view, branch) === s.c1, workspaces(view));
    await sh(ctx, a, "echo a > x.txt");
    await sh(ctx, b, "echo b > y.txt");
    const ca = await ctx.layerfs.sandbox.commit(a.sandbox, a.path);
    view = await snap(ctx);
    check(ctx, "after A: head and parent", headOf(view, branch) === ca.head && commitOf(view, ca.head).parent === s.c1, commitOf(view, ca.head));
    check(ctx, "after A: A's base moved, B's did not", byPath(view, a.path).base === ca.head && byPath(view, b.path).base === s.c1);
    const cb = await ctx.layerfs.sandbox.commit(b.sandbox, b.path);
    view = await snap(ctx);
    check(ctx, "after B: head, parent, no second parent", headOf(view, branch) === cb.head && commitOf(view, cb.head).parent === ca.head && commitOf(view, cb.head).secondParent === null, commitOf(view, cb.head));
    check(ctx, "after B: B's base is the head", byPath(view, b.path).base === cb.head);
    await ctx.layerfs.branch.fork("other");
    const co = await ctx.layerfs.fs.write("/z.txt", "z\n", { branch: "other" });
    const merged = await ctx.layerfs.branch.merge(branch, "other", { name: "c" });
    view = await snap(ctx);
    const mc = commitOf(view, merged.head);
    check(ctx, "after merge: Commit with second parent", mc && mc.parent === cb.head && mc.secondParent === co.head && headOf(view, "c") === merged.head, mc);
    const published = await ctx.layerfs.branch.publish({ branch: "c" });
    view = await snap(ctx);
    check(ctx, "after publish: main's Layer", view.layers[0].id === published.publishedLayer.id && view.layers[0].sourceCommit === merged.head && view.layers[0].sourceBranch === "c" && headOf(view, "main") === null && view.branches[0].base === published.publishedLayer.id, view.layers[0]);
    await unmount(ctx, a, { discard: true });
    view = await snap(ctx);
    check(ctx, "after unmount: Workspace gone", !byPath(view, a.path) && byPath(view, b.path), workspaces(view).map((w) => w.directory));
  },

  async C2(ctx) {
    const s = await start(ctx, { "/x.txt": "x\n" });
    let previous = await snap(ctx);
    const same = await snap(ctx, previous.version);
    check(ctx, "unchanged when nothing changed", same.kind === "unchanged" && same.version === previous.version, same);
    const step = async (name, action) => {
      const result = await action();
      const next = await snap(ctx, previous.version);
      check(ctx, `new version after ${name}`, next.kind === "ok" && next.version !== previous.version, next.version);
      const again = await snap(ctx, next.version);
      check(ctx, `unchanged right after ${name}`, again.kind === "unchanged", again.kind);
      previous = next;
      return result;
    };
    const ws = await step("mount", () => mount(ctx, s.sandbox, branch));
    await sh(ctx, ws, "echo 2 > x.txt");
    await step("commit", () => ctx.layerfs.sandbox.commit(ws.sandbox, ws.path));
    await ctx.layerfs.branch.fork("other");
    await step("fs write", () => ctx.layerfs.fs.write("/o.txt", "o\n", { branch: "other" }));
    await step("merge", () => ctx.layerfs.branch.merge(branch, "other", { name: "c" }));
    await step("publish", () => ctx.layerfs.branch.publish({ branch: "c" }));
    await step("unmount", () => unmount(ctx, ws));
  },

  async C3(ctx) {
    const s = await start(ctx, { "/x.txt": "x\n" });
    const a = await mount(ctx, s.sandbox, branch);
    const b = await mount(ctx, s.sandbox, branch);
    const before = await ctx.layerfs.sandbox.status(b.sandbox, b.path);
    check(ctx, "not stale before", before.headMovedSinceMount === false, before);
    await sh(ctx, a, "echo a > x.txt");
    const ca = await ctx.layerfs.sandbox.commit(a.sandbox, a.path);
    const stale = await ctx.layerfs.sandbox.status(b.sandbox, b.path);
    check(ctx, "older Workspace is stale", stale.headMovedSinceMount === true && stale.branchHead === ca.head && stale.base === s.c1, stale);
    const fresh = await ctx.layerfs.sandbox.status(a.sandbox, a.path);
    check(ctx, "committing Workspace is not", fresh.headMovedSinceMount === false, fresh);
    const view = await snap(ctx);
    check(ctx, "snapshot shows the same flag", byPath(view, b.path).headMovedSinceMount === true && byPath(view, a.path).headMovedSinceMount === false);
  },

  async C4(ctx) {
    const s = await start(ctx, { "/x.txt": "x\n" });
    const ws = await mount(ctx, s.sandbox, branch);
    const started = await sh(ctx, ws, "sleep 60", { background: true });
    const listed = await ctx.layerfs.sandbox.list_processes(s.sandbox);
    const found = listed.items.find((p) => p.id === started.process);
    check(ctx, "lists the process it started", found && found.status === "running" && found.path === ws.path && found.command === "sleep 60", listed.items);
    const stopped = await ctx.layerfs.sandbox.cancel(s.sandbox, started.process);
    check(ctx, "cancels it", stopped.kind === "Stopped", stopped);
    const after = (await ctx.layerfs.sandbox.list_processes(s.sandbox)).items.find((p) => p.id === started.process);
    check(ctx, "listed as stopped", after && after.status !== "running", after);
    // Live members only: the container's first process is the daemon, which does
    // not reap orphans, so a stopped member can remain as a zombie.
    const live = await sh(ctx, ws, "cat /proc/[0-9]*/stat 2>/dev/null | grep -c ' (sleep) [^Z] '");
    check(ctx, "the process group is gone", live.stdout.trim() === "0", live.stdout);
    const zombies = await sh(ctx, ws, "cat /proc/[0-9]*/stat 2>/dev/null | grep -c ' (sleep) Z '");
    note(ctx, `zombie sleep processes left unreaped in the Sandbox: ${zombies.stdout.trim()}`);
    const view = await snap(ctx);
    const keys = workspaces(view).flatMap((w) => Object.keys(w));
    check(ctx, "the daemon holds no process record", !keys.some((k) => /process|pid|command/i.test(k)), [...new Set(keys)]);
  },

  async C5(ctx) {
    await ctx.layerfs.project.init(ctx.source, { name: "website" });
    await ctx.layerfs.branch.fork(branch);
    const one = await ctx.layerfs.fs.write("/f.txt", "one\ntwo\nthree\n", { branch, agent: "alice", call: "c1" });
    const two = await ctx.layerfs.fs.edit("/f.txt", { oldText: "two", newText: "TWO" }, { branch, agent: "bob", call: "c2" });
    const blame = await ctx.layerfs.fs.blame("/f.txt", { branch });
    const rows = blame.lines.map((l) => [l.n, l.text, l.commit === one.head ? "one" : l.commit === two.head ? "two" : l.commit, l.agent]);
    check(ctx, "each line names its Commit and agent", JSON.stringify(rows) === JSON.stringify([[1, "one", "one", "alice"], [2, "TWO", "two", "bob"], [3, "three", "one", "alice"], [4, "", "one", "alice"]]), rows);
    note(ctx, "Like the simulator, every newline ends a line, so a final newline shows an empty last line.");
    check(ctx, "origins carry attribution", blame.origins.some((o) => o.agent === "bob" && o.call === "c2" && o.via === "fs"), blame.origins);
    const readme = await ctx.layerfs.fs.blame("/README.md", { branch });
    check(ctx, "Init's lines name the first Layer", readme.lines.every((l) => readme.origins.some((o) => o.id === l.commit && o.kind === "layer" && o.via === "project.init")), readme.origins);
  },
};
