#!/usr/bin/env node
// Replays one planned apply step's Sandbox script on a scratch folder that
// holds the lane's expected files, and checks what the Commit would see
// (#352 F-028): an apply whose files all equal the lane's tree must leave
// every byte, mode and mtime as it was, and its expected outcome is UpToDate.
//   node dsh/tools/history/check-apply.mjs --plan <dir> --repo <dsh.git> --step r012.s0021
// The expected tree is the plan's record of each file's previous blob
// (`prev`; the mode is the step's unless `modeChange`). The script is built
// exactly as the player builds it (route, placeEntries, sandboxCommands) and
// run by sh; nothing touches LayerFS. Prints one JSON verdict; exits 1 when
// the script changes a file the step does not change, or when an expected
// change is missing.
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { blobId } from "./git.mjs";
import { placeEntries, route, sameAsTree, sandboxCommands, sandboxExpect, Tree } from "./steps.mjs";

const OLD = new Date("2000-01-01T00:00:00Z");

/** The step's files on the lane's expected tree, from the plan's `prev` records. */
export function expectedTree(step) {
  const t = new Tree();
  for (const f of step.files) if (f.prev) t.set(f.path, { mode: f.modeChange ? (f.mode === "100755" ? "100644" : "100755") : f.mode, blob: f.prev, size: null });
  return t;
}

/** What one file looks like on disk: blob id, mode and mtime in ms, or null when absent. */
function state(root, path) {
  const p = join(root, path);
  if (!existsSync(p) && !lstatSync(p, { throwIfNoEntry: false })) return null;
  const s = lstatSync(p);
  const bytes = s.isSymbolicLink() ? Buffer.from(execFileSync("readlink", [p], { encoding: "utf8" }).trimEnd()) : readFileSync(p);
  return { blob: blobId(bytes), mode: s.isSymbolicLink() ? "120000" : s.mode & 0o111 ? "100755" : "100644", mtimeMs: s.mtimeMs };
}

/** Replays `step` (a plan step) in a scratch folder; `blob(id)` returns a blob's bytes. */
export function checkApply(step, blob, root = mkdtempSync(join(tmpdir(), "lfs352-apply-"))) {
  const tree = expectedTree(step);
  const ws = join(root, "ws");
  mkdirSync(ws, { recursive: true });
  for (const [path, e] of tree.files) {
    const p = join(ws, path);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, blob(e.blob));
    chmodSync(p, e.mode === "100755" ? 0o755 : 0o644);
    utimesSync(p, OLD, OLD);
  }
  const before = new Map(step.files.map((f) => [f.path, state(ws, f.path)]));
  const { sandbox } = route(step.files, tree, { all: true });
  const bytes = sandbox.map((f) => (f.op === "rm" || sameAsTree(f) ? null : blob(f.blob)));
  for (const c of sandboxCommands(placeEntries(sandbox, bytes), join(root, "scratch"))) execFileSync("sh", ["-c", c], { cwd: ws });
  const files = step.files.map((f) => {
    const was = before.get(f.path), now = state(ws, f.path);
    const unchanged = !!was && !!now && was.blob === now.blob && was.mode === now.mode && was.mtimeMs === now.mtimeMs;
    const wanted = (f.expect ?? "Committed") === "UpToDate";
    const right = f.op === "rm" ? !now : !!now && now.blob === f.blob && now.mode === f.mode;
    return { path: f.path, expect: f.expect ?? "Committed", same: sandbox.some((x) => x.path === f.path && sameAsTree(x)), unchanged, ok: right && (!wanted || unchanged) };
  });
  rmSync(root, { recursive: true, force: true });
  return { step: step.id, expect: sandboxExpect(sandbox), files, ok: files.every((f) => f.ok) };
}

function main() {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  const planDir = opt("--plan"), repo = opt("--repo"), id = opt("--step");
  if (!planDir || !repo || !/^r\d{3}\.s\d+$/.test(id ?? "")) { console.error("usage: check-apply.mjs --plan <dir> --repo <dsh.git> --step rNNN.sNNNN"); process.exit(2); }
  const plan = JSON.parse(readFileSync(join(planDir, `range-${id.slice(1, 4)}.json`), "utf8"));
  const step = plan.steps.find((s) => s.id === id);
  if (!step || step.kind !== "apply") { console.error(`${id}: no apply step of that id in the plan`); process.exit(2); }
  const blob = (b) => execFileSync("git", ["--git-dir", repo, "cat-file", "blob", b], { maxBuffer: 1 << 30 });
  const verdict = checkApply(step, blob);
  console.log(JSON.stringify(verdict, null, 1));
  process.exit(verdict.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
