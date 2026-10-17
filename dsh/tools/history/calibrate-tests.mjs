#!/usr/bin/env node
// Runs each range's candidate unit tests once natively, outside LayerFS, and
// records which the range runs (#352 SPEC §2, Tests, steps 4–5):
//   node dsh/tools/history/calibrate-tests.mjs --repo <dsh.git> --plan <dir> --image I
//     --pnpm-store <volume> [--checkout <dir>] [--from N] [--to M]
// For each range in order it moves the one working tree to the checkpoint
// (oracle.mjs checkout), installs node_modules from the offline pnpm store
// when the range installs or nothing is installed yet, and runs every
// candidate file alone in the runtime image with the network off
// (unit-tests.mjs probe). It writes <plan>/tests-NNN.json beside the plan,
// which stays as written: { range, image, candidates, native, run, skipped,
// nativeMs }. One attempt per range; a range whose install fails stops the
// calibration.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkout } from "./git.mjs";
import { chooseRun } from "./unit-tests.mjs";

const here = dirname(fileURLToPath(import.meta.url));
/** The install both the calibration and the replay run (SPEC §2, Ignored files): offline, from the pnpm store, no install scripts. */
export const INSTALL = "pnpm install --offline --frozen-lockfile --store-dir /pnpm-store --ignore-scripts";
const pad = (n) => String(n).padStart(3, "0");

/** The docker arguments of one container on the working tree, offline unless `network` is given. */
export function dockerArgs({ image, tree, store, network = "none", command }) {
  return ["run", "--rm", "--network", network, "-v", `${tree}:/w`, "-v", `${here}:/t:ro`, ...(store ? ["-v", `${store}:/pnpm-store`] : []), "-w", "/w", "--entrypoint", "sh", image, "-c", command];
}

/** Parses the probe's JSON lines. */
export const parseProbe = (stdout) => stdout.split("\n").filter((l) => l.startsWith("{")).map((l) => JSON.parse(l));

function main() {
  const args = process.argv.slice(2);
  const opt = (n, d = null) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
  const repo = opt("--repo"), planDir = opt("--plan"), image = opt("--image"), store = opt("--pnpm-store");
  if (!repo || !planDir || !image || !store) {
    console.error("usage: calibrate-tests.mjs --repo <dsh.git> --plan <dir> --image I --pnpm-store <volume> [--checkout <dir>] [--from N] [--to M]");
    process.exit(2);
  }
  const tree = resolve(opt("--checkout", join(process.env.HOME, "lfs-history", "checkout")));
  const summary = JSON.parse(readFileSync(join(planDir, "plan.json"), "utf8"));
  const from = Number(opt("--from", "0")), to = Number(opt("--to", String(summary.ranges.length - 1)));
  for (let k = from; k <= to; k++) {
    const plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    const tests = plan.closure.tests;
    if (!tests || typeof tests !== "object") throw new Error(`range ${k}: plan v${summary.version} has no test selection; regenerate the plan`);
    const t0 = Date.now();
    checkout(repo, tree, plan.checkpoint);
    if (plan.closure.install || !existsSync(join(tree, "node_modules"))) {
      // the pnpm store was filled once with `pnpm fetch` (SPEC §2, Speed-ups 4), so the install needs no network
      execFileSync("docker", dockerArgs({ image, tree, store, command: INSTALL }), { stdio: "inherit" });
    }
    const native = tests.files.length
      ? parseProbe(execFileSync("docker", dockerArgs({ image, tree, command: `node /t/unit-tests.mjs probe ${tests.files.map((f) => `'${f.replaceAll("'", "'\\''")}'`).join(" ")}` }), { encoding: "utf8", maxBuffer: 1 << 26 }))
      : [];
    const chosen = chooseRun(native, tests.tier);
    const file = join(planDir, `tests-${pad(k)}.json`);
    writeFileSync(`${file}.tmp`, JSON.stringify({ range: k, image, checkpoint: plan.checkpoint, candidates: tests.candidates, dropped: tests.dropped, native, ...chosen }, null, 1));
    renameSync(`${file}.tmp`, file);
    console.log(`range ${k}: ${chosen.run.length} of ${tests.files.length} run (${chosen.nativeMs} ms native), ${chosen.skipped.length} skipped, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
