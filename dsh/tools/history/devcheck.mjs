// The development checks (owner 2026-10-18) of one played range, as their own
// command after its publish (SCRIPTS.md: a departure from the in-range checks,
// for the 120 s command rule; it no longer changes the node_modules chain):
//   node dsh/tools/history/run.mjs devcheck --run <dev run> --range k
// On a fork of the published main (`dev-r<k>`), each in a one-shot Workspace
// with its own Commit (playClosure):
// - reinstall-check: a clean reinstall of the unchanged lockfile, compared with
//   the clean native oracle; its Commit's new metadata and stored bytes;
// - rebuild: `tsc -b --verbose` of the range's built packages, which must find
//   nothing to build (or what a native rerun finds, design 8).
// Writes metrics/devcheck-<k>.json; the trace goes to trace/devcheck-<k>.jsonl.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { installCommand, judgeDevChecks, LISTER_VERSION, playClosure, rebuildCommand } from "./closure.mjs";
import { expectCall, Mismatch, readTrace, setup } from "./lib.mjs";
import { pad } from "./steps.mjs";
import { lsTree } from "./git.mjs";
import { nodeOf } from "./nodeconfig.mjs";
import { reinstallOracleFile } from "./nodeproof.mjs";

/** The checks a range's closure calls for: a reinstall after an install, a rebuild after a build. */
export function devSteps(closure) {
  const steps = [];
  if (closure?.steps?.some((k) => /install/.test(k))) steps.push({ kind: "reinstall-check", command: installCommand({ clean: true }) });
  const build = closure?.rows?.find((r) => r.kind === "build");
  if (build?.packages?.length) steps.push({ kind: "rebuild", command: rebuildCommand(build.packages), packages: build.packages });
  return steps;
}

/** The latest attempt's metrics of range k. */
function rangeMetrics(dir, k) {
  const files = readdirSync(dir).filter((f) => new RegExp(`^range-${pad(k)}\\.a\\d+\\.json$`).test(f)).sort((a, b) => Number(a.match(/\.a(\d+)\./)[1]) - Number(b.match(/\.a(\d+)\./)[1]));
  if (!files.length) throw new Mismatch(`range ${k} has no metrics in ${dir}`);
  return JSON.parse(readFileSync(join(dir, files.at(-1)), "utf8"));
}

export async function devcheck(run, k) {
  if (run.manifest.label !== "dev") throw new Mismatch(`devcheck runs on dev runs only (run ${run.manifest.run} is ${run.manifest.label})`);
  if (run.state.dirty != null || run.state.next !== k + 1) throw new Mismatch(`run ${run.manifest.run} stands at range ${run.state.next}${run.state.dirty != null ? `, dirty at ${run.state.dirty}` : ""}; devcheck needs range ${k} published and clean`);
  // a fast dev range has no metrics; its closure steps and rows are in fast/range-k.json
  const fast = join(run.dir, "fast", `range-${pad(k)}.json`);
  const m = existsSync(run.manifest.outputs.metrics) && readdirSync(run.manifest.outputs.metrics).some((f) => f.startsWith(`range-${pad(k)}.a`)) ? rangeMetrics(run.manifest.outputs.metrics, k) : JSON.parse(readFileSync(fast, "utf8"));
  const steps = devSteps(m.closure);
  const out = { range: k, run: run.manifest.run, at: new Date().toISOString(), steps: steps.map((s) => s.kind) };
  if (!steps.length) return out;
  const plan = run.plan(k), lock = lsTree(run.repo, plan.checkpoint).files.get("pnpm-lock.yaml")?.blob ?? null;
  const cleanFile = join(run.manifest.oracle, "node_modules", `${lock ?? ""}.json`);
  const traceFile = join(run.dir, "trace", `devcheck-${pad(k)}.jsonl`);
  mkdirSync(join(run.dir, "trace"), { recursive: true });
  if (!run.lf) await run.client();
  run.traceTo(traceFile, `r${pad(k)}`);
  const sb = await setup(run), branch = `dev-r${pad(k)}`;
  run.label(`r${pad(k)}.devcheck-fork`);
  await expectCall(run, `r${pad(k)} devcheck fork`, () => run.lf.branch.fork(branch, run.state.layer), "Forked");
  const roots = [...new Set([...(run.state.closureChain ?? []).map((e) => e.root), ...(run.state.closureRoots ?? [])].filter(Boolean))];
  const rows = await playClosure(run, k, steps, { sb, branch, expectCall, Mismatch, roots });
  let cleanOracle = null;
  if (steps.some((s) => s.kind === "reinstall-check")) {
    // Node on: the reinstall runs on the published main with its build output, so its oracle is the native clean
    // reinstall on top of the repair's chain (nodeproof.mjs reinstall), not a fresh checkout's clean install
    const onTop = nodeOf(run.manifest).on ? reinstallOracleFile(run.manifest.outputs.metrics, k) : null;
    const file = onTop ?? cleanFile;
    if ((!onTop && !lock) || !existsSync(file)) throw new Mismatch(`range ${k}: no ${onTop ? "on-top reinstall" : "clean node_modules"} oracle ${file}${onTop ? " (nodeproof.mjs reinstall first)" : ""}`);
    cleanOracle = JSON.parse(readFileSync(file, "utf8"));
    if (cleanOracle.listerVersion !== LISTER_VERSION) throw new Mismatch(`range ${k}: the ${onTop ? "on-top reinstall" : "clean"} oracle predates lister version ${LISTER_VERSION}`);
    if (cleanOracle.exit !== 0) throw new Mismatch(`range ${k}: the native reinstall exited ${cleanOracle.exit}`);
    out.reinstallOracle = { kind: onTop ? "on-top" : "clean", file, key: cleanOracle.key ?? null };
  }
  run.traceTo(null);
  const t = readTrace(traceFile, run.sink.log);
  const sizes = (kind) => t.all.find((l) => l.method === "sandbox.commit" && l.step === `r${pad(k)}.${kind}`)?.sizes ?? null;
  Object.assign(out, judgeDevChecks(k, rows, { cleanOracle, Mismatch }));
  if (out.reinstallCheck) Object.assign(out.reinstallCheck, { newMetadata: sizes("reinstall-check")?.newMetadata ?? null, newStored: sizes("reinstall-check")?.newStored ?? null });
  mkdirSync(run.manifest.outputs.metrics, { recursive: true });
  writeFileSync(join(run.manifest.outputs.metrics, `devcheck-${pad(k)}.json`), `${JSON.stringify(out, null, 1)}\n`);
  return out;
}
