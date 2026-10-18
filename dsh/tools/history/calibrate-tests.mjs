#!/usr/bin/env node
// Runs each range's candidate unit tests once natively, outside LayerFS, and
// records which the range runs (#352 SPEC §2, Tests, steps 4–5):
//   node dsh/tools/history/calibrate-tests.mjs --repo <dsh.git> --plan <dir> --image I
// (I: the replay's runtime image id, SPEC §2, Runtime image)
//     --pnpm-store <volume> [--checkout <dir>] [--from N] [--to M] [--fetch] [--store-policy verified|release-age-off]
// For each range in order it moves the one working tree to the checkpoint
// (oracle.mjs checkout), installs node_modules from the offline pnpm store
// when the range installs or nothing is installed yet, and runs every
// candidate file alone in the runtime image with the network off
// (unit-tests.mjs probe). `--fetch` first runs `pnpm fetch` (network on) for a
// range that installs. A checkpoint with no pnpm lockfile (range 0 uses yarn)
// installs nothing and skips its files with that reason. It writes <plan>/tests-NNN.json beside the plan,
// which stays as written: { range, image, candidates, native, run, skipped,
// nativeMs }. One attempt per range; a range whose install fails stops the
// calibration. `--max-files M` probes at most M not-yet-probed files per
// command so a large range fits the command wall: the probed results wait in
// <plan>/tests-NNN.partial.json, the next command probes the rest, and the
// range's file is written once every candidate has a result.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkout } from "./git.mjs";
import { chooseRun } from "./unit-tests.mjs";
import { installCommand, STORE_MOUNT } from "./closure.mjs";

const here = dirname(fileURLToPath(import.meta.url));
/**
 * The install both the calibration and the replay run (SPEC §2, Ignored
 * files; INSTALLS §1): offline, from the read-only pnpm store, no install
 * scripts (closure.mjs installCommand). pnpm 11 checks the lockfile against
 * its supply-chain policies from cached registry metadata, so the metadata
 * cache lives on the store volume; without it an offline install still asks
 * the registry and hangs.
 */
export const INSTALL = installCommand();
/** Fills the store and the metadata cache for the checkout's lockfile; the one step with the network. */
export const FETCH = "pnpm fetch --store-dir /pnpm-store --cache-dir /pnpm-store/.cache --ignore-scripts";
/** Why a checkpoint has no offline install, or null: only pnpm projects have one (range 0 is yarn's). */
export function noInstall(tree) {
  return existsSync(join(tree, "pnpm-lock.yaml")) ? null : "no pnpm-lock.yaml (not a pnpm project at this commit): no offline install";
}
const pad = (n) => String(n).padStart(3, "0");

/**
 * The docker arguments of one named container on the working tree, offline
 * unless `network` is given (the fetch). The store is read-only offline. The
 * name makes a second container refuse to start while a killed run's one is
 * still there, instead of two writing the tree.
 */
export function dockerArgs({ image, tree, store, network = "none", command, name = "layerfs-issue352-calibrate" }) {
  const mount = store ? ["-v", `${store}:${STORE_MOUNT}${network === "none" ? ":ro" : ""}`] : [];
  return ["run", "--rm", "--name", name, "--network", network, "-v", `${tree}:/w`, "-v", `${here}:/t:ro`, ...mount, "-w", "/w", "--entrypoint", "sh", image, "-c", command];
}

/**
 * The files still to probe and the results kept from earlier commands for
 * one range (`--max-files`): `partial` holds the earlier probes of this
 * checkpoint; a partial file of another checkpoint is ignored.
 */
export function nextSlice(files, partial, checkpoint, max) {
  const kept = partial && partial.checkpoint === checkpoint ? partial.native : [];
  const done = new Set(kept.map((r) => r.path));
  const rest = files.filter((f) => !done.has(f));
  return { kept, todo: max ? rest.slice(0, max) : rest, left: max ? Math.max(0, rest.length - max) : 0 };
}

/** Parses the probe's JSON lines. */
export const parseProbe = (stdout) => stdout.split("\n").filter((l) => l.startsWith("{")).map((l) => JSON.parse(l));

function main() {
  const args = process.argv.slice(2);
  const opt = (n, d = null) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
  const repo = opt("--repo"), planDir = opt("--plan"), image = opt("--image"), store = opt("--pnpm-store");
  if (!repo || !planDir || !image || !store) {
    console.error("usage: calibrate-tests.mjs --repo <dsh.git> --plan <dir> --image I --pnpm-store <volume> [--checkout <dir>] [--from N] [--to M] [--fetch] [--max-files M]");
    process.exit(2);
  }
  const tree = resolve(opt("--checkout", join(process.env.HOME, "lfs-history", "checkout")));
  const summary = JSON.parse(readFileSync(join(planDir, "plan.json"), "utf8"));
  const from = Number(opt("--from", "0")), to = Number(opt("--to", String(summary.ranges.length - 1)));
  const max = Number(opt("--max-files", "0"));
  // NODE_RULE §11 a: the run's store policy (owner decision pending); the plan's own default keeps dsh's
  const install = installCommand({ policy: opt("--store-policy", "verified") });
  for (let k = from; k <= to; k++) {
    const plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    const tests = plan.closure.tests;
    if (!tests || typeof tests !== "object") throw new Error(`range ${k}: plan v${summary.version} has no test selection; regenerate the plan`);
    const t0 = Date.now();
    checkout(repo, tree, plan.checkpoint);
    const blocked = noInstall(tree);
    if (!blocked && (plan.closure.install || !existsSync(join(tree, "node_modules")))) {
      // `--fetch` fills the store from this lockfile first (the network's one use);
      // the install itself is offline (SPEC §2, Speed-ups 4)
      if (args.includes("--fetch")) execFileSync("docker", dockerArgs({ image, tree, store, network: "bridge", command: FETCH }), { stdio: "inherit" });
      execFileSync("docker", dockerArgs({ image, tree, store, command: install }), { stdio: "inherit" });
    }
    const file = join(planDir, `tests-${pad(k)}.json`), partialFile = join(planDir, `tests-${pad(k)}.partial.json`);
    const slice = nextSlice(tests.files, existsSync(partialFile) ? JSON.parse(readFileSync(partialFile, "utf8")) : null, plan.checkpoint, max);
    const probed = blocked ? slice.todo.map((path) => ({ path, status: "skipped", reason: blocked, ms: 0 }))
      : slice.todo.length
      ? parseProbe(execFileSync("docker", dockerArgs({ image, tree, command: `node /t/unit-tests.mjs probe ${slice.todo.map((f) => `'${f.replaceAll("'", "'\\''")}'`).join(" ")}` }), { encoding: "utf8", maxBuffer: 1 << 26 }))
      : [];
    const byPath = new Map([...slice.kept, ...probed].map((r) => [r.path, r]));
    if (slice.left) {
      writeFileSync(`${partialFile}.tmp`, JSON.stringify({ range: k, checkpoint: plan.checkpoint, native: [...byPath.values()] }, null, 1));
      renameSync(`${partialFile}.tmp`, partialFile);
      console.log(`range ${k}: ${byPath.size} of ${tests.files.length} probed, ${slice.left} left (run again), ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      return;
    }
    const native = tests.files.map((f) => byPath.get(f)).filter(Boolean);
    const chosen = chooseRun(native, tests.tier);
    writeFileSync(`${file}.tmp`, JSON.stringify({ range: k, image, checkpoint: plan.checkpoint, install: blocked ? null : install, candidates: tests.candidates, dropped: tests.dropped, native, ...chosen }, null, 1));
    renameSync(`${file}.tmp`, file);
    if (existsSync(partialFile)) unlinkSync(partialFile);
    console.log(`range ${k}: ${chosen.run.length} of ${tests.files.length} run (${chosen.nativeMs} ms native), ${chosen.skipped.length} skipped, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
