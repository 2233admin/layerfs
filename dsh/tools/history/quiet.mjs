// The QUIET lock (#352, ranges 16–20 rule; step 4 of ranges 21–30): while
// ~/lfs-history/QUIET exists, other sessions keep off Docker. The harness
// holds it itself for a whole attempt: every play, calibrate and proofs command
// takes it (or keeps the one its run holds), a command that fails releases it
// (the attempt is over), and control.mjs, the attempt's last step, releases it.
//   node dsh/tools/history/quiet.mjs status | release --run <id>
// It also holds the harness hash (Docker share staleness): runner.mjs hashes
// the harness files on the host and run.mjs refuses to start inside the
// container when its view of them differs.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const quietFile = (history = process.env.LFS_HISTORY ?? join(process.env.HOME, "lfs-history")) => join(history, "QUIET");

/** The holder, or null when nobody holds it (an empty file from an older helper reads as an unnamed holder). */
export function quietHolder(file = quietFile()) {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return { run: null }; }
}

/** Takes QUIET for `run` (kept when that run already holds it). Refused when another run holds it. */
export function holdQuiet(run, what, file = quietFile()) {
  const h = quietHolder(file);
  if (h && h.run && h.run !== run) return { ok: false, why: `QUIET is held by run ${h.run} (${h.what ?? "?"}, since ${h.since ?? "?"})` };
  writeFileSync(file, JSON.stringify({ run, what, since: h?.since ?? new Date().toISOString(), at: new Date().toISOString(), pid: process.pid }));
  return { ok: true };
}

/** Releases QUIET if `run` holds it (or an unnamed holder does). */
export function releaseQuiet(run, file = quietFile()) {
  const h = quietHolder(file);
  if (!h || (h.run && h.run !== run)) return false;
  rmSync(file, { force: true });
  return true;
}

/** One sha256 over the harness's own files (name and bytes, sorted), as the host and the container each see them. */
export function harnessHash(dir = here) {
  const h = createHash("sha256");
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".mjs")).sort()) h.update(`${f}\0`).update(readFileSync(join(dir, f))).update("\0");
  return h.digest("hex");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, , run] = process.argv.slice(2);
  if (cmd === "status") console.log(JSON.stringify(quietHolder()));
  else if (cmd === "release" && run) console.log(releaseQuiet(run) ? "released" : "not held by this run");
  else { console.error("usage: quiet.mjs status | release --run <id>"); process.exit(2); }
}
