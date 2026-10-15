// VERIFICATION section B: Commit, merge and conflict. Concurrency is forced by
// phase order (mount A, mount B, commit A, commit B), never by sleeps.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { REPO, check, mount, note, refusal, sh, unmount } from "./lib.mjs";

const branch = "feature";

/** Init, fork `feature`, one Commit C1 of `files`, a Sandbox and mounts A and B at C1. */
async function prepare(ctx, files) {
  await ctx.layerfs.project.init(ctx.source, { name: "website" });
  await ctx.layerfs.branch.fork(branch);
  const c1 = await ctx.layerfs.fs.apply(Object.entries(files).map(([path, content]) => ({ kind: "write", path, content })), { branch });
  const sandbox = await ctx.layerfs.service();
  const a = await mount(ctx, sandbox, branch);
  const b = await mount(ctx, sandbox, branch);
  check(ctx, "A and B mount at C1", a.mounted.base === c1.head && b.mounted.base === c1.head, [a.mounted.base, b.mounted.base, c1.head]);
  return { c1: c1.head, sandbox, a, b };
}

const commit = (ctx, ws, options) => ctx.layerfs.sandbox.commit(ws.sandbox, ws.path, options);
const status = (ctx, ws) => ctx.layerfs.sandbox.status(ws.sandbox, ws.path);
const read = async (ctx, path, at = branch) => (await ctx.layerfs.fs.read(path, { branch: at })).text;
const heads = async (ctx) => Object.fromEntries((await ctx.layerfs.project.list_branches()).items.map((i) => [i.name, i.head]));

async function write(ctx, ws, path, text) {
  const quoted = `$'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}'`;
  const done = await sh(ctx, ws, `printf '%s' ${quoted} > ${path}`);
  if (done.exitCode !== 0) throw new Error(`write ${path}: ${done.stderr}`);
}

/** B3's state: A and B change the same line; A commits; B is refused with Conflict. */
async function conflicted(ctx) {
  const s = await prepare(ctx, { "/f.txt": "start\nline\nend\n" });
  await write(ctx, s.a, "f.txt", "start\nalpha\nend\n");
  await write(ctx, s.b, "f.txt", "start\nbeta\nend\n");
  const ha = await commit(ctx, s.a);
  const refused = await refusal(commit(ctx, s.b));
  return { ...s, ha: ha.head, refused };
}

/** Two Branches forked from main; `a` and `b` each write `files`. */
async function sides(ctx, a, b) {
  await ctx.layerfs.project.init(ctx.source, { name: "website" });
  await ctx.layerfs.branch.fork("a");
  await ctx.layerfs.branch.fork("b");
  const ha = await ctx.layerfs.fs.apply(Object.entries(a).map(([path, content]) => ({ kind: "write", path, content })), { branch: "a" });
  const hb = await ctx.layerfs.fs.apply(Object.entries(b).map(([path, content]) => ({ kind: "write", path, content })), { branch: "b" });
  return { ha: ha.head, hb: hb.head };
}

export const B = {
  async B1(ctx) {
    const s = await prepare(ctx, { "/x.txt": "x\n" });
    await write(ctx, s.a, "x.txt", "x2\n");
    const done = await commit(ctx, s.a);
    check(ctx, "Committed", done.kind === "Committed", done);
    check(ctx, "no merged field", done.merged === null, done.merged);
    check(ctx, "parent is C1", done.commit.parent === s.c1, done.commit);
    check(ctx, "Branch head is the Commit", (await heads(ctx))[branch] === done.head);
  },

  async B2(ctx) {
    const s = await prepare(ctx, { "/x.txt": "x\n", "/y.txt": "y\n" });
    await write(ctx, s.a, "x.txt", "x-from-a\n");
    await write(ctx, s.b, "y.txt", "y-from-b\n");
    const a = await commit(ctx, s.a);
    const b = await commit(ctx, s.b);
    check(ctx, "A Committed", a.kind === "Committed", a);
    check(ctx, "B Committed", b.kind === "Committed", b);
    check(ctx, "B merged { from: C1, head: A }", b.merged && b.merged.from === s.c1 && b.merged.head === a.head, b.merged);
    check(ctx, "B's parent is A's Commit", b.commit.parent === a.head, b.commit);
    check(ctx, "head has both changes", (await read(ctx, "/x.txt")) === "x-from-a\n" && (await read(ctx, "/y.txt")) === "y-from-b\n");
    const st = await status(ctx, s.b);
    check(ctx, "B's base is the new head", st.base === b.head && st.headMovedSinceMount === false, st);
    const seen = await sh(ctx, s.b, "cat x.txt");
    check(ctx, "B's Workspace sees A's change", seen.stdout === "x-from-a\n", seen.stdout);
  },

  async B3(ctx) {
    const s = await conflicted(ctx);
    check(ctx, "B refused with Conflict", s.refused && s.refused.code === "Conflict", s.refused && s.refused.message);
    const detail = s.refused ? s.refused.detail : {};
    check(ctx, "conflict names f.txt", detail.conflicts && detail.conflicts.length === 1 && detail.conflicts[0].path === "/f.txt" && detail.conflicts[0].kind === "content", detail.conflicts);
    check(ctx, "markers not yet present before", detail.markers === false, detail.markers);
    check(ctx, "head is still A's Commit", (await heads(ctx))[branch] === s.ha);
    const file = (await sh(ctx, s.b, "cat f.txt")).stdout;
    const blocks = file.split("\n").filter((l) => l.startsWith("<<<<<<<")).length;
    check(ctx, "one marker block with both lines", blocks === 1 && file.includes("alpha") && file.includes("beta") && file.includes("=======") && file.includes(">>>>>>>"), file);
    const st = await status(ctx, s.b);
    check(ctx, "B's base is A's Commit", st.base === s.ha, st);
  },

  async B4(ctx) {
    const s = await conflicted(ctx);
    const again = await refusal(commit(ctx, s.b));
    check(ctx, "Conflict { markers }", again && again.code === "Conflict" && again.detail.markers === true, again && again.detail);
    check(ctx, "nothing committed", (await heads(ctx))[branch] === s.ha);
  },

  async B5(ctx) {
    const s = await conflicted(ctx);
    await write(ctx, s.b, "f.txt", "start\nbeta\nend\n");
    const done = await commit(ctx, s.b);
    check(ctx, "Committed", done.kind === "Committed", done);
    check(ctx, "a normal Commit on the head", done.commit.parent === s.ha && done.commit.secondParent === null && done.merged === null, done.commit);
    check(ctx, "head holds the resolution", (await read(ctx, "/f.txt")) === "start\nbeta\nend\n");
  },

  async B6(ctx) {
    const s = await prepare(ctx, { "/x.txt": "x\n" });
    await write(ctx, s.a, "x.txt", "changed\n");
    await sh(ctx, s.a, "mkdir -p out && echo 1 > out/new.txt");
    const dirty = await refusal(unmount(ctx, s.a));
    check(ctx, "Dirty", dirty && dirty.code === "Dirty", dirty && dirty.message);
    const changed = dirty ? dirty.detail.changed : [];
    check(ctx, "lists the paths", changed.includes("/x.txt") && changed.some((p) => p.startsWith("/out")), changed);
    check(ctx, "still mounted after Dirty", (await status(ctx, s.a)).kind === "ok");
    const done = await unmount(ctx, s.a, { discard: true });
    check(ctx, "discard unmounts", done.kind === "Unmounted", done);
    check(ctx, "head unchanged", (await heads(ctx))[branch] === s.c1);
  },

  async B7(ctx) {
    ctx.skip = "no product hook pauses a Commit between its merge and its publish; forcing the race would need sleeps, which the ground rules forbid";
  },

  async B8(ctx) {
    const s = await prepare(ctx, { "/x.txt": "x\n", "/y.txt": "y\n" });
    await write(ctx, s.a, "x.txt", "x-from-a\n");
    await write(ctx, s.b, "y.txt", "y-from-b\n");
    const a = await commit(ctx, s.a);
    const b = await commit(ctx, s.b, { force: true });
    check(ctx, "force Committed", b.kind === "Committed", b);
    check(ctx, "displaced head reported", b.displacedHead === a.head, b.displacedHead);
    check(ctx, "no merge", b.merged === null, b.merged);
    check(ctx, "head is B's tree only", (await read(ctx, "/x.txt")) === "x\n" && (await read(ctx, "/y.txt")) === "y-from-b\n");
  },

  async B9(ctx) {
    const s = await prepare(ctx, { "/x.txt": "x\n" });
    // Base files made in a Workspace: a text file above the 1 MiB text bound and a binary file.
    const made = await sh(ctx, s.a, "yes 'a line of text' | head -c 1600000 > big.txt && head -c 8192 /dev/urandom > bin.dat");
    check(ctx, "base files made", made.exitCode === 0, made.stderr);
    const c2 = await commit(ctx, s.a);
    const a = await mount(ctx, s.sandbox, branch);
    const b = await mount(ctx, s.sandbox, branch);
    await sh(ctx, a, "sed -i '1s/.*/ours/' big.txt && printf 'A' >> bin.dat");
    await sh(ctx, b, "sed -i '1s/.*/theirs/' big.txt && printf 'B' >> bin.dat");
    const ca = await commit(ctx, a);
    const refused = await refusal(commit(ctx, b));
    const kinds = refused ? Object.fromEntries(refused.detail.conflicts.map((c) => [c.path, c.kind])) : {};
    check(ctx, "Conflict", refused && refused.code === "Conflict", refused && refused.message);
    check(ctx, "big text file conflicts whole", kinds["/big.txt"] === "binary", kinds);
    check(ctx, "binary file conflicts whole", kinds["/bin.dat"] === "binary", kinds);
    check(ctx, "head is A's Commit", c2.kind === "Committed" && (await heads(ctx))[branch] === ca.head);
    note(ctx, "Resident memory during the 1.6 MB merge was not measured; this run checks the outcome only.");
  },

  async B10(ctx) {
    const s = await prepare(ctx, { "/.lww": "%include .gitignore\n" });
    // Each build writes a new BUILD_ID; each Workspace also writes its own trace.
    const ba = await sh(ctx, s.a, "npm ci && npm run build && echo a > .next/trace");
    const bb = await sh(ctx, s.b, "npm ci && npm run build && echo b > .next/trace");
    check(ctx, "both build", ba.exitCode === 0 && bb.exitCode === 0, [ba.stderr, bb.stderr]);
    const a = await commit(ctx, s.a);
    let b;
    try { b = await commit(ctx, s.b); } catch (error) { b = error; }
    check(ctx, "A Committed", a.kind === "Committed", a);
    check(ctx, "B merges without conflict", b && b.kind === "Committed" && b.merged, b && (b.kind ?? `${b.code} ${b.message}`));
    const lww = b && b.lww ? b.lww : [];
    const trace = lww.find((d) => d.path === "/.next/trace");
    check(ctx, "the newer write is kept and reported", trace && trace.kept === "ours" && trace.rule === ".next", lww);
    check(ctx, "every decision is from the included .gitignore", lww.length > 0 && lww.every((d) => d.rule === ".next" || d.rule === "node_modules"), lww.map((d) => `${d.rule} ${d.path}`));
    check(ctx, "head holds B's trace", (await read(ctx, "/.next/trace")) === "b\n");
    const after = await sh(ctx, s.b, "cat .next/trace .next/BUILD_ID && ls .next");
    check(ctx, "B's Workspace reads the merged base", after.exitCode === 0 && after.stdout.startsWith("b\nb1"), after);
    const done = await unmount(ctx, s.b);
    check(ctx, "B unmounts cleanly", done.kind === "Unmounted", done);
  },

  async B11(ctx) {
    await ctx.layerfs.project.init(ctx.source, { name: "website" });
    await ctx.layerfs.branch.fork("a");
    const a1 = await ctx.layerfs.fs.write("/one.txt", "1\n", { branch: "a" });
    await ctx.layerfs.branch.fork("b", { from: a1.head });
    const a2 = await ctx.layerfs.fs.write("/two.txt", "2\n", { branch: "a" });
    const merged = await ctx.layerfs.branch.merge("a", "b", { name: "c" });
    check(ctx, "Merged { fastForward }", merged.kind === "Merged" && merged.fastForward === true, merged);
    check(ctx, "c points at a's head", merged.head === a2.head && (await heads(ctx)).c === a2.head);
    const { items } = await ctx.layerfs.branch.list_commits({ branch: "c" });
    check(ctx, "no new Commit", items[0].id === a2.head && items.length === 2, items.map((c) => c.id));
  },

  async B12(ctx) {
    const s = await sides(ctx, { "/left.txt": "L\n" }, { "/right.txt": "R\n" });
    const merged = await ctx.layerfs.branch.merge("a", "b", { name: "c" });
    check(ctx, "Merged, not fast-forward", merged.kind === "Merged" && merged.fastForward === false, merged);
    const { items } = await ctx.layerfs.branch.list_commits({ branch: "c" });
    check(ctx, "one new Commit with two parents", items[0].id === merged.head && items[0].parent === s.ha && items[0].secondParent === s.hb && items[0].via === "merge", items[0]);
    check(ctx, "c has both files", (await read(ctx, "/left.txt", "c")) === "L\n" && (await read(ctx, "/right.txt", "c")) === "R\n");
    const h = await heads(ctx);
    check(ctx, "a and b unchanged", h.a === s.ha && h.b === s.hb, h);
  },

  async B13(ctx) {
    await sides(ctx, { "/f.txt": "start\nalpha\nend\n" }, { "/f.txt": "start\nbeta\nend\n" });
    const refused = await refusal(ctx.layerfs.branch.merge("a", "b", { name: "c" }));
    check(ctx, "Conflict", refused && refused.code === "Conflict", refused && refused.message);
    const conflicts = refused && refused.detail ? refused.detail.conflicts : [];
    const lines = conflicts.flatMap((c) => c.hunks.flatMap((h) => [...h.ours, ...h.theirs]));
    check(ctx, "lists the file with both lines", conflicts.length === 1 && conflicts[0].path === "/f.txt" && lines.includes("alpha") && lines.includes("beta"), conflicts);
    check(ctx, "no Branch c", !("c" in (await heads(ctx))));
  },

  async B14(ctx) {
    await sides(ctx, { "/f.txt": "start\nalpha\nend\n" }, { "/f.txt": "start\nbeta\nend\n" });
    const first = await refusal(ctx.layerfs.branch.merge("a", "b", { name: "c" }));
    check(ctx, "first merge conflicts", first && first.code === "Conflict");
    await ctx.layerfs.fs.write("/f.txt", "start\nalpha\nend\n", { branch: "b" });
    const merged = await ctx.layerfs.branch.merge("a", "b", { name: "c" });
    check(ctx, "Merged", merged.kind === "Merged", merged);
    check(ctx, "c exists", (await heads(ctx)).c === merged.head);
    check(ctx, "c has the agreed line", (await read(ctx, "/f.txt", "c")) === "start\nalpha\nend\n");
  },

  async B15(ctx) {
    await sides(ctx, { "/left.txt": "L\n" }, { "/right.txt": "R\n" });
    await ctx.layerfs.branch.fork("late");
    await ctx.layerfs.fs.write("/late.txt", "late\n", { branch: "late" });
    const merged = await ctx.layerfs.branch.merge("a", "b", { name: "c" });
    const before = (await ctx.layerfs.project.list_branches()).items[0].base;
    const added = await ctx.layerfs.branch.publish({ branch: "c" });
    check(ctx, "Added", added.kind === "Added" && added.source.commit === merged.head && added.basedOn === before && added.overwrote.length === 0, added);
    const main = (await ctx.layerfs.project.list_branches()).items[0].base;
    check(ctx, "main's head is the new Layer", main === added.publishedLayer.id && added.publishedLayer.parent === before, { main, layer: added.publishedLayer });
    const again = await ctx.layerfs.branch.publish({ branch: "c" });
    check(ctx, "UpToDate", again.kind === "UpToDate" && again.layer === added.publishedLayer.id, again);
    const late = await ctx.layerfs.branch.publish({ branch: "late" });
    check(ctx, "Added with overwrote", late.kind === "Added" && late.basedOn === before && JSON.stringify(late.overwrote) === JSON.stringify([added.publishedLayer.id]), late);
    const onMain = await refusal(ctx.layerfs.fs.read("/left.txt", { branch: "main" }));
    check(ctx, "main is late's tree (overwrite)", onMain && onMain.code === "NoSuchPath" && (await read(ctx, "/late.txt", "main")) === "late\n");
  },

  async B16(ctx) {
    const s = await prepare(ctx, { "/x.txt": "x\n" });
    await write(ctx, s.a, "x.txt", "x2\n");
    const done = await commit(ctx, s.a);
    check(ctx, "Commit with an expected head only", done.kind === "Committed");
    const sealed = join(ctx.work, "home/website/sealed.sqlite");
    const tables = (path) => execFileSync("sqlite3", [`file:${path}?immutable=1`, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"], { encoding: "utf8" }).trim().split("\n");
    const sealedTables = tables(sealed);
    check(ctx, "sealed Store has no workspace_stage", !sealedTables.some((t) => t.includes("stage")), sealedTables);
    // The installed Store and the daemon overlay, copied out of the running Sandbox read-only.
    const out = mkdtempSync(join(tmpdir(), "layerfs-327-b16-"));
    const container = s.sandbox.replace(/^sb_/, "");
    try {
      execFileSync("docker", ["cp", `${container}:/layerfs-store/global/store.sqlite`, join(out, "store.sqlite")]);
      execFileSync("docker", ["cp", `${container}:/layerfs-local/overlay/overlay.sqlite`, join(out, "overlay.sqlite")]);
      const store = tables(join(out, "store.sqlite"));
      const overlay = tables(join(out, "overlay.sqlite"));
      check(ctx, "installed Store has no stage table", !store.some((t) => t.includes("stage")), store);
      check(ctx, "overlay has no stage table", !overlay.some((t) => t.includes("stage")), overlay);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
    // Product source only; tests that still name the old API are the unit-suite step's.
    const pattern = "stage_?token|StageToken|workspace_stage|Stage(Request|Reply|Control|Record)|stage_changes|commit_staged";
    let grep = "";
    try {
      grep = execFileSync("git", ["-C", REPO, "grep", "-n", "-i", "-E", pattern, "--", "core/crates/*/src/**", "sdk/js/src/**", "sdk/js/native/src/**"], { encoding: "utf8" }).trim();
    } catch (error) {
      if (error.status !== 1) throw error; // 1: no match
    }
    check(ctx, "no stage token in the protocol or schema", grep === "", grep.split("\n").slice(0, 20));
  },
};
