// A P3 range in two commands (lead 2026-10-18; SCRIPTS.md §14): with git on, a
// range no longer fits one 118 s command. `play --until lanes` plays the fork,
// the seed and the agents (lane git included) and saves the range context;
// `play --resume` continues with the merges, the lead's git, the closure, the
// publish and the checks. Nothing is replayed or warmed: the resume reads the
// saved context, the call log and the tooling laps, and appends to the same
// trace file. The saved context pins the binaries; a resume under others is
// refused. A failure in either half leaves the run dirty (no auto-resume).
import { existsSync, readFileSync, rmSync, statSync, truncateSync } from "node:fs";
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
  const { p2, held, trees, base, merged, tries, published, played, steps, git, laneLocks, ...rest } = ctx;
  return {
    ...rest,
    trees: [...trees].map(([lane, t]) => [lane, [...t.files]]),
    base: entries(base), merged: entries(merged), tries: entries(tries), published: [...(published ?? [])], played: entries(played), steps: entries(steps),
    // plain-JSON git counters (lanes, timings, guard, lane trees) travel as they are; the per-lane locks are rebuilt empty
    git: git ? { ...Object.fromEntries(Object.entries(git).filter(([key]) => !["dates", "locks"].includes(key))), dates: entries(git.dates), lead: git.lead ?? null } : null,
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

/**
 * The final command's steps (step 4, ranges 21–30): `--until repair` stops after the consolidation, closure and
 * publish ("published"), `--until verified` after the checkpoint check ("verified"); `--resume` goes on from either.
 * A kill inside a later step resumes at that step: the trace is cut back to its length at the save, so the killed
 * step's lines are dropped, and nothing before the save runs again.
 */
export const LATE_STAGES = new Set(["published", "verified"]);

/** Any value as JSON with its Maps, Sets and Trees kept (the context after the consolidation). */
export const encodeLate = (v) => JSON.parse(JSON.stringify(v, (key, x) => (x instanceof Tree ? { __tree: [...x.files] } : x instanceof Map ? { __map: [...x] } : x instanceof Set ? { __set: [...x] } : x)));
export const decodeLate = (v) => JSON.parse(JSON.stringify(v), (key, x) => (x && typeof x === "object" && !Array.isArray(x) ? ("__tree" in x ? new Tree(new Map(x.__tree)) : "__map" in x ? new Map(x.__map) : "__set" in x ? new Set(x.__set) : x) : x));

/** The late context back: held Workspaces gone, git's per-lane locks empty, `p2` rebuilt from the plan. */
export function lateCtxFromJson(j, rebuildP2) {
  const ctx = decodeLate(j);
  return { ...ctx, p2: rebuildP2(ctx.base), held: new Map(), ...(ctx.git ? { git: { ...ctx.git, locks: new Map() } } : {}) };
}

/** Saves the first half: the context, the run's call log and tally, the laps and facts the second half needs. */
export function saveHalf(run, k, half) {
  const late = LATE_STAGES.has(half.stage);
  if (late && half.ctx.held?.size) throw new Error(`${half.ctx.held.size} held Workspaces are still mounted at ${half.stage}`);
  const { p2, held, ...ctx } = half.ctx;
  const traceBytes = half.traceFile && existsSync(half.traceFile) ? statSync(half.traceFile).size : null;
  writeJson(halfFile(run, k), { range: k, savedAt: new Date().toISOString(), binary: pinned(run.manifest.env), ...half, ...(late ? { published: encodeLate(half.published ?? null), proof: encodeLate(half.proof ?? null) } : {}),
    ctx: late ? encodeLate(ctx) : ctxToJson(half.ctx), traceBytes, sink: { seq: run.sink.seq, log: run.sink.log }, calls: run.tally.calls });
}

/** Cuts the trace back to its length at the save (a killed later step's lines go; nothing else changes). */
export function cutTrace(h) {
  if (h.traceFile && h.traceBytes != null && existsSync(h.traceFile) && statSync(h.traceFile).size > h.traceBytes) { truncateSync(h.traceFile, h.traceBytes); return true; }
  return false;
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
