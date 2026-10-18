// A P3 range in two commands (lead 2026-10-18; SCRIPTS.md §14): with git on, a
// range no longer fits one 118 s command. `play --until lanes` plays the fork,
// the seed and the agents (lane git included) and saves the range context;
// `play --resume` continues with the merges, the lead's git, the closure, the
// publish and the checks. Nothing is replayed or warmed: the resume reads the
// saved context, the call log and the tooling laps, and appends to the same
// trace file. The saved context pins the binaries; a resume under others is
// refused. A failure in either half leaves the run dirty (no auto-resume).
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { binaries, writeJson } from "./lib.mjs";
import { pad, Tree } from "./steps.mjs";

export const halfFile = (run, k) => join(run.dir, `half-${pad(k)}.json`);

/** The binary ids a half pins: daemon, native addon, SDK JavaScript, Sandbox image. */
export const pinned = (env) => { const b = binaries(env); return { daemon: b.daemon, sdk: b.sdk, sdkJs: b.sdkJs?.sha256 ?? null, image: b.image }; };

const entries = (m) => (m ? [...m] : null);

/** The range context as JSON: lane trees and maps as entries; held Workspaces must be gone. */
export function ctxToJson(ctx) {
  if (ctx.held?.size) throw new Error(`${ctx.held.size} held Workspaces are still mounted; a range cannot stop halfway with them`);
  const { p2, held, trees, base, merged, tries, published, played, steps, git, ...rest } = ctx;
  return {
    ...rest,
    trees: [...trees].map(([lane, t]) => [lane, [...t.files]]),
    base: entries(base), merged: entries(merged), tries: entries(tries), published: [...(published ?? [])], played: entries(played), steps: entries(steps),
    git: git ? { dates: entries(git.dates), lane: git.lane, seed: git.seed, lead: git.lead ?? null } : null,
  };
}

/** The range context back; `p2` is rebuilt from the plan as startRange built it. */
export function ctxFromJson(j, rebuildP2) {
  const base = new Map(j.base);
  return {
    ...j,
    base, p2: rebuildP2(base), held: new Map(),
    trees: new Map(j.trees.map(([lane, files]) => [lane, new Tree(new Map(files))])),
    merged: new Map(j.merged), tries: new Map(j.tries), published: new Set(j.published), played: new Map(j.played), steps: new Map(j.steps),
    git: j.git ? { ...j.git, dates: new Map(j.git.dates), locks: new Map() } : null,
  };
}

/** Saves the first half: the context, the run's call log and tally, the laps and facts the second half needs. */
export function saveHalf(run, k, half) {
  writeJson(halfFile(run, k), { range: k, savedAt: new Date().toISOString(), binary: pinned(run.manifest.env), ...half, ctx: ctxToJson(half.ctx), sink: { seq: run.sink.seq, log: run.sink.log }, calls: run.tally.calls });
}

/**
 * The saved first half of range k, checked: the run stands halfway at k and
 * the binaries are the pinned ones. Returns the saved object or the refusal.
 */
export function loadHalf(run, k) {
  if (run.state.halfway !== k) return { refused: `run ${run.manifest.run} is not halfway through range ${k} (halfway: ${run.state.halfway ?? "none"})` };
  const f = halfFile(run, k);
  if (!existsSync(f)) return { refused: `no saved first half ${f}` };
  const h = JSON.parse(readFileSync(f, "utf8")), now = pinned(run.manifest.env);
  const differ = Object.keys(h.binary).filter((key) => h.binary[key] !== now[key]);
  if (differ.length) return { refused: `the binaries differ from the first half's: ${differ.map((key) => `${key} ${now[key]} (saved ${h.binary[key]})`).join("; ")}` };
  return h;
}

export const dropHalf = (run, k) => rmSync(halfFile(run, k), { force: true });
