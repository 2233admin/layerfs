#!/usr/bin/env node
// The replay's tests: cheap unit tests only (#352 SPEC §2, Tests).
// selectTests picks a range's candidate files by path and content; the
// calibration (calibrate-tests.mjs) runs each once natively, outside
// LayerFS, and chooseRun keeps the fast ones that pass there; in LayerFS
// each must then give its native result (compareResults).
//   node dsh/tools/history/unit-tests.mjs probe <file>…
// runs each file alone with vitest (10 s each, no retry) in the current
// folder and prints one JSON line per file: { path, status, ms }. The
// calibration runs it inside the runtime image, with the network off.
import { spawnSync } from "node:child_process";

/** Where a range's packages keep unit tests, and what a test file is called. */
const TEST_DIR = /(^|\/)(tests?|__tests__)\//;
const TEST_FILE = /\.(spec|test)\.[cm]?[jt]sx?$/;

/** Paths never run: a browser, Electron, the native addon, SSH, a real sandbox, or a heavy suite. */
export const DENY_PATHS = [
  /^apps\/desktop\//,
  /^apps\/web\/tests\//,
  /(^|\/)(e2e|bench|benchmarks?|perf|stress|snapshots?|__snapshots__)(\/|$)/,
  /\.(e2e|bench|perf|stress)\.[cm]?[jt]sx?$/,
  /^native\//,
  /^packages\/ssh\//,
  /^packages\/sandbox\//,
];

/** Contents never run: a browser driver, Electron, vitest's browser mode, or snapshot recording. */
export const DENY_CONTENT = [
  /(from\s+|import\s*\(\s*|require\s*\(\s*)['"](playwright(-core)?|@playwright\/[^'"]+|puppeteer(-core)?|selenium-webdriver|webdriverio|electron|@vitest\/browser[^'"]*)['"]/,
  /\bDSH_SNAPSHOT\b/,
];

export const CAP = { range: { ms: 60_000, files: 30 }, milestone: { ms: 300_000, files: 200 }, fileTimeoutMs: 10_000 };

/** The folder of the nearest package.json above `path` in `state`, or null (the root's is not a package here). */
export function packageOf(path, packages) {
  for (let dir = path; dir.includes("/");) {
    dir = dir.slice(0, dir.lastIndexOf("/"));
    if (packages.has(dir)) return dir;
  }
  return null;
}

/**
 * A range's candidate unit test files (SPEC §2, Tests, steps 1–3).
 * @param {Map<string, { mode: string, blob: string }>} state the checkpoint's tree
 * @param {string[]} changed the paths the range changed
 * @param {boolean} milestone take every package's tests
 * @param {(blob: string) => Promise<Buffer>} read a blob's bytes
 * @returns {Promise<{ tier: string, candidates: number, files: string[], dropped: { path: string[], content: string[] } }>}
 */
export async function selectTests({ state, changed, milestone, read }) {
  const packages = new Set([...state.keys()].filter((p) => p.endsWith("/package.json")).map((p) => p.slice(0, -"/package.json".length)));
  const wanted = milestone ? packages : new Set(changed.map((p) => packageOf(p, packages)).filter(Boolean));
  const candidates = [...state].filter(([path, e]) => e.mode !== "120000" && TEST_FILE.test(path) && TEST_DIR.test(path) && wanted.has(packageOf(path, packages))).map(([path]) => path).sort();
  const dropped = { path: [], content: [] }, files = [];
  for (const path of candidates) {
    if (DENY_PATHS.some((r) => r.test(path))) { dropped.path.push(path); continue; }
    const text = (await read(state.get(path).blob)).toString("utf8");
    if (DENY_CONTENT.some((r) => r.test(text))) { dropped.content.push(path); continue; }
    files.push(path);
  }
  return { tier: milestone ? "milestone" : "range", candidates: candidates.length, files, dropped };
}

/**
 * The files a range runs in LayerFS (step 5): those that passed natively,
 * fastest first, within the tier's time and file cap; the rest are skipped
 * with their reason.
 * @param {{ path: string, status: "pass" | "fail" | "timeout", ms: number }[]} native
 */
export function chooseRun(native, tier) {
  const cap = CAP[tier === "milestone" ? "milestone" : "range"];
  const run = [], skipped = [];
  let total = 0;
  for (const r of [...native].sort((a, b) => a.ms - b.ms || (a.path < b.path ? -1 : 1))) {
    if (r.status !== "pass") skipped.push({ path: r.path, reason: r.reason ?? `native ${r.status}` });
    else if (run.length >= cap.files || total + r.ms > cap.ms) skipped.push({ path: r.path, reason: "over the cap" });
    else { run.push(r.path); total += r.ms; }
  }
  return { run: run.sort(), skipped, nativeMs: total };
}

/** The command a range's one-shot Workspace runs: its chosen files, one vitest run, per-file results as JSON. */
export function vitestCommand(files, timeoutS = 600, { compact = false } = {}) {
  const q = (t) => `'${t.replaceAll("'", "'\\''")}'`;
  // HOME=/tmp on both sides: the SDK's Sandbox exec sets it (sdk/js/native/src/exec.rs, uid 501 has no
  // passwd entry), so a native replay under root's /root judged a different environment (r027 a1, fs-sandbox.spec).
  const run = `CI=1 HOME=/tmp timeout ${timeoutS} ./node_modules/.bin/vitest run --reporter=json`;
  if (!compact) return `${run} ${files.map(q).join(" ")}`;
  // r027 a1: the full report of 204 files passed the Sandbox's stdout cap (~1 MiB) and arrived cut.
  // Written to a file outside the Workspace, it is printed back as only what the readers use.
  const f = "/tmp/lfs352-vitest-$$.json";
  return `${run} --outputFile=${f} ${files.map(q).join(" ")} >/dev/null; s=$?; node -e '${COMPACT_REPORT}' ${f}; rm -f ${f}; exit $s`;
}

/** Prints vitest's JSON report at argv[1] keeping per-file name/status/message and each failed test's first message (pure JS, no quotes). */
const COMPACT_REPORT = "const r=JSON.parse(require(`fs`).readFileSync(process.argv[1],`utf8`));const cut=(m)=>String(m??``).slice(0,2000);console.log(JSON.stringify({testResults:r.testResults.map((t)=>({name:t.name,status:t.status,message:cut(t.message),assertionResults:(t.assertionResults??[]).filter((x)=>x.status===`failed`).slice(0,3).map((x)=>({status:x.status,fullName:x.fullName,failureMessages:(x.failureMessages??[]).slice(0,1).map(cut)}))}))}))";

/** Per-file results from vitest's JSON reporter: path (relative to `root`) -> pass | fail. */
export function parseVitestJson(stdout, root) {
  const start = stdout.indexOf("{");
  const report = JSON.parse(stdout.slice(start));
  const prefix = root.endsWith("/") ? root : `${root}/`;
  return new Map(report.testResults.map((t) => [t.name.startsWith(prefix) ? t.name.slice(prefix.length) : t.name, t.status === "passed" ? "pass" : "fail"]));
}

/** LayerFS's results against the native ones: every chosen file must pass, as it did natively. */
export function compareResults(run, actual) {
  const differ = run.filter((path) => actual.get(path) !== "pass").map((path) => ({ path, native: "pass", layerfs: actual.get(path) ?? "missing" }));
  return { run: run.length, equal: run.length - differ.length, differ };
}

function probe(files) {
  for (const path of files) {
    const t0 = Date.now();
    const r = spawnSync("./node_modules/.bin/vitest", ["run", path], { env: { ...process.env, CI: "1" }, timeout: CAP.fileTimeoutMs, stdio: "ignore" });
    const status = r.error?.code === "ETIMEDOUT" || r.signal ? "timeout" : r.status === 0 ? "pass" : "fail";
    console.log(JSON.stringify({ path, status, ms: Date.now() - t0 }));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, ...files] = process.argv.slice(2);
  if (cmd !== "probe") { console.error("usage: unit-tests.mjs probe <file>…"); process.exit(2); }
  probe(files);
}
