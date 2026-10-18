#!/usr/bin/env node
// A range's closure from P3 on (INSTALLS.md, SPEC §2): a real `pnpm install`
// inside the Workspace from a pnpm store outside it, `tsc -b` of the changed
// packages, the calibrated unit tests; each a one-shot exec with its own
// Commit. And the node_modules oracle: the tree a native install of the same
// lockfile makes in the same image, network off.
//   node dsh/tools/history/closure.mjs check-plan --repo <dsh.git> --plan <dir>
//   node dsh/tools/history/closure.mjs oracle --repo <dsh.git> --plan <dir> --range k --image I --volume V
// check-plan lists the ranges whose plan install flag differs from git (an
// install input changed). oracle writes ~/lfs-history/oracle/node_modules/<lockfile blob>.json
// once per lockfile (a cached one is kept): pnpm's exit status and output
// (timing removed) and the installed tree as digests per package folder.
//
// Store access (decided 2026-10-18 from native runs, range 15, pnpm 11.7.0):
// pnpm cannot install from a read-only store directly. Its store index
// (v11/index.db) is SQLite opened read-write in WAL mode ("unable to open
// database file" on a read-only mount), and offline it asks the registry
// unless its cache holds the lockfile's verification record
// (lockfile-verified.jsonl, written by the fetch). So each install gets a
// private writable layer in the Sandbox's /tmp, outside the Workspace
// (INSTALLS §3.2): a copy of the index (15 MB at 81 lockfiles) and of the
// verification records (73 KB), with links to the read-only package files
// and registry metadata. Nothing is written to the store volume. Measured:
// exit 0, "Done in 3.8s", --network none.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { lsTree } from "./git.mjs";
import { compareResults, packageOf, parseVitestJson, vitestCommand } from "./unit-tests.mjs";

const pad = (n) => String(n).padStart(3, "0");
const quote = (t) => `'${String(t).replaceAll("'", "'\\''")}'`;

/** Where the store volume is mounted in a Sandbox: outside /workspaces and /layerfs-*. */
export const STORE_MOUNT = "/pnpm-store";
/**
 * The Sandbox's read-only volumes for P3 (INSTALLS §3.1): the argument
 * `sandbox.create` takes once the product change for read-only volume mounts
 * lands (`{ volumes }`; not in sdk/ today). setup() passes it for a closure phase.
 */
export const sandboxVolumes = (volume) => ({ volumes: [{ volume, target: STORE_MOUNT, readOnly: true }] });
/** A file whose change makes a range install (INSTALLS §1: package.json or the lockfile; the workspace and .npmrc steer the same install). */
export const INSTALL_INPUT = /(^|\/)(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|\.npmrc)$/;
export const installInputsChanged = (paths) => paths.some((p) => INSTALL_INPUT.test(p) && !p.includes("node_modules/"));

/** The private writable store and cache in /tmp over the read-only store (see the header). */
export const storeSetup = (store = STORE_MOUNT) => [
  "mkdir -p /tmp/pnpm-cache /tmp/pnpm-store",
  `for d in ${store}/.cache/*/; do ln -sfn "\${d%/}" /tmp/pnpm-cache/; done`,
  `cp ${store}/.cache/lockfile-verified.jsonl /tmp/pnpm-cache/`,
  `for v in ${store}/v*/; do v=\${v%/}; n=\${v##*/}; mkdir -p /tmp/pnpm-store/$n && cp "$v/index.db" /tmp/pnpm-store/$n/ && ln -sfn "$v/files" /tmp/pnpm-store/$n/files; done`,
].join(" && ");
/** The install (INSTALLS §1); `clean` at milestones removes node_modules first. */
export function installCommand({ store = STORE_MOUNT, clean = false } = {}) {
  const install = "pnpm install --offline --frozen-lockfile --store-dir /tmp/pnpm-store --cache-dir /tmp/pnpm-cache --ignore-scripts";
  return `${storeSetup(store)} && ${clean ? "rm -rf node_modules && " : ""}${install}`;
}
export const buildCommand = (packages) => `./node_modules/.bin/tsc -b ${packages.map(quote).join(" ")}`;

/**
 * The closure steps of one range, in order: install (first, incremental where
 * an install input changed, clean at a milestone), build of the changed
 * packages that have a tsconfig.json, then the calibrated tests.
 * @param {{ changed: string[], packages: Set<string>, tsconfigs: Set<string>, milestone: boolean, installed: boolean, run: string[] }} r
 */
export function closureSteps({ changed, packages, tsconfigs, milestone, installed, run = [], store = STORE_MOUNT }) {
  const steps = [];
  if (milestone && installed) steps.push({ kind: "clean-install", command: installCommand({ store, clean: true }) });
  else if (!installed) steps.push({ kind: "install", command: installCommand({ store }) });
  else if (installInputsChanged(changed)) steps.push({ kind: "incremental-install", command: installCommand({ store }) });
  const built = [...new Set(changed.map((p) => packageOf(p, packages)).filter((d) => d && tsconfigs.has(d)))].sort();
  if (built.length) steps.push({ kind: "build", command: buildCommand(built), packages: built });
  if (run.length) steps.push({ kind: "test", command: vitestCommand(run), files: run });
  return steps;
}

/**
 * Plays the steps in the range's Workspace, each exec followed by its own
 * Commit. A non-zero install or build exit, or a test that does not give its
 * native pass, is a stop finding (Mismatch); nothing is retried.
 */
export async function playClosure(run, k, steps, { sb, ws, expectCall, Mismatch }) {
  const out = [];
  for (const s of steps) {
    const label = `r${pad(k)}.${s.kind}`;
    run.label(label);
    const t0 = Date.now();
    const r = await expectCall(run, `${label} exec`, () => run.lf.sandbox.exec(sb, ws, s.command));
    const row = { kind: s.kind, exitCode: r.exitCode, ms: Date.now() - t0 };
    if (s.kind === "test") {
      const root = String((await run.lf.sandbox.exec(sb, ws, "pwd")).stdout).trim();
      row.results = compareResults(s.files, parseVitestJson(String(r.stdout), root));
    }
    row.commit = (await expectCall(run, `${label} commit`, () => run.lf.sandbox.commit(sb, ws, label), "Committed|UpToDate"))?.kind;
    out.push(row);
    if (s.kind !== "test" && r.exitCode !== 0) throw new Mismatch(`${label} exited ${r.exitCode}: ${String(r.stderr ?? r.stdout ?? "").slice(-300)}`);
    if (row.results?.differ.length) throw new Mismatch(`${label}: ${row.results.differ.length} file(s) differ from native`);
  }
  return out;
}

/**
 * Lists the installed tree: every entry under a node_modules folder (lstat,
 * symlink targets, git blob ids), one JSON line per package folder
 * ({ g, n, digest }); with folder names as arguments, their entry lines.
 * A package folder is the path through the first node_modules and its next
 * name (two for a scope or `.pnpm`): `.pnpm/<pkg>@<v>` holds the package and
 * its dependency links.
 */
export const LISTER = `const fs=require("fs"),c=require("crypto");const full=new Set(process.argv.slice(1));const groups=new Map();const groupOf=(p)=>{const s=p.split("/");const i=s.indexOf("node_modules");let j=i+1;if(s[j]===".pnpm"||(s[j]||"").startsWith("@"))j++;return s.slice(0,Math.min(j+1,s.length)).join("/")};const add=(p,line)=>{const g=groupOf(p);let e=groups.get(g);if(!e)groups.set(g,e=[]);e.push(line)};const blob=(p,n)=>{const h=c.createHash("sha1");h.update("blob "+n+"\\0");h.update(fs.readFileSync(p));return h.digest("hex")};const walk=(d,nm)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=d==="."?e.name:d+"/"+e.name;if(p===".git"||p===".lfs-probe")continue;const inNm=nm||e.name==="node_modules";const s=fs.lstatSync(p);const m=(s.mode&0o7777).toString(8);if(s.isSymbolicLink()){if(inNm)add(p,"l "+m+" "+fs.readlinkSync(p)+" "+p)}else if(s.isDirectory()){if(inNm&&e.name!=="node_modules")add(p,"d "+m+" - "+p);walk(p,inNm)}else if(inNm)add(p,"f "+m+" "+blob(p,s.size)+" "+p)}};walk(".",false);for(const g of [...groups.keys()].sort()){const ls=groups.get(g).sort();if(full.size){if(full.has(g))for(const l of ls)process.stdout.write(l+"\\n");continue}process.stdout.write(JSON.stringify({g,n:ls.length,digest:c.createHash("sha256").update(ls.join("\\n")).digest("hex")})+"\\n")}`;
export const listerCommand = (groups = []) => `node -e ${quote(LISTER)} ${groups.map(quote).join(" ")}`;

/** pnpm's output without what varies run to run: progress lines and durations. */
export const normalizeOutput = (text) => String(text).split("\n").filter((l) => !/^Progress: /.test(l)).map((l) => l.replace(/Done in [\d.ms ]+using/, "Done in <t> using")).join("\n").trim();

/** An installed tree (lister lines) against the oracle: package folders missing, extra or differing. */
export function compareInstalled(oracle, actualLines) {
  const want = new Map(oracle.groups.map((g) => [g.g, g])), got = new Map(actualLines.map((g) => [g.g, g]));
  const missing = [...want.keys()].filter((g) => !got.has(g)), extra = [...got.keys()].filter((g) => !want.has(g));
  const differ = [...want.keys()].filter((g) => got.has(g) && got.get(g).digest !== want.get(g).digest);
  return { ok: !missing.length && !extra.length && !differ.length, groups: want.size, missing, extra, differ };
}

/** Ranges whose plan install flag (plan-range.mjs) differs from git: an install input changed or not. */
export function checkPlan(repo, planDir) {
  const summary = JSON.parse(readFileSync(join(planDir, "plan.json"), "utf8"));
  const out = [];
  let prev = null;
  for (let k = 0; k < summary.ranges.length; k++) {
    const plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    const changed = prev ? execFileSync("git", ["--git-dir", repo, "diff", "--name-only", prev, plan.checkpoint], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\n").filter(Boolean) : [];
    const git = prev ? installInputsChanged(changed) : true;
    if (Boolean(plan.closure?.install) !== git) out.push({ range: k, plan: Boolean(plan.closure?.install), git, inputs: changed.filter((p) => INSTALL_INPUT.test(p)).slice(0, 5) });
    prev = plan.checkpoint;
  }
  return out;
}

/** The native install of one checkpoint's tree in the image (network off, read-only store): exit, output, lister groups. */
export function nativeInstall({ repo, commit, image, volume, name = "layerfs-issue352-oracle" }) {
  const script = `mkdir /w && tar -x -C /w && cd /w && (${installCommand()}) > /tmp/o 2>&1; echo "@@exit $?"; sed 's/^/@@out /' /tmp/o; ${listerCommand()}`;
  const archive = execFileSync("git", ["--git-dir", repo, "archive", commit], { maxBuffer: 1 << 30 });
  const t0 = Date.now();
  const r = spawnSync("docker", ["run", "--rm", "-i", "--name", name, "--network", "none", "-v", `${volume}:${STORE_MOUNT}:ro`, "--entrypoint", "sh", image, "-c", script], { input: archive, encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`native install container exited ${r.status}: ${String(r.stderr).slice(-300)}`);
  const lines = r.stdout.split("\n");
  return {
    exit: Number(/^@@exit (\d+)/.exec(lines.find((l) => l.startsWith("@@exit")) ?? "")?.[1] ?? NaN),
    output: normalizeOutput(lines.filter((l) => l.startsWith("@@out ")).map((l) => l.slice(6)).join("\n")),
    groups: lines.filter((l) => l.startsWith("{")).map((l) => JSON.parse(l)),
    ms: Date.now() - t0,
  };
}

function main() {
  const args = process.argv.slice(2);
  const opt = (n, d = null) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
  const repo = opt("--repo"), planDir = opt("--plan");
  if (args[0] === "check-plan" && repo && planDir) {
    const rows = checkPlan(repo, planDir);
    for (const r of rows) console.log(JSON.stringify(r));
    console.log(rows.length ? `${rows.length} range(s) differ` : "plan install flags match git");
    return;
  }
  if (args[0] === "oracle" && repo && planDir && opt("--image") && opt("--volume")) {
    const k = Number(opt("--range")), plan = JSON.parse(readFileSync(join(planDir, `range-${pad(k)}.json`), "utf8"));
    const lock = lsTree(repo, plan.checkpoint).files.get("pnpm-lock.yaml");
    if (!lock) { console.log(`range ${k}: no pnpm-lock.yaml, no oracle`); return; }
    const dir = join(process.env.HOME, "lfs-history", "oracle", "node_modules"), file = join(dir, `${lock.blob}.json`);
    if (existsSync(file)) { console.log(`cached ${file}`); return; }
    // pnpm 11's store index is SQLite: a read-only open fails ("unable to open database file") while a fetch writes the store
    if (existsSync(join(process.env.HOME, "lfs-history", "fetch", "pending.json"))) { console.error("a pnpm fetch batch is pending; the oracle needs a quiescent store"); process.exit(1); }
    mkdirSync(dir, { recursive: true });
    const n = nativeInstall({ repo, commit: plan.checkpoint, image: opt("--image"), volume: opt("--volume") });
    writeFileSync(`${file}.tmp`, JSON.stringify({ lockfile: lock.blob, range: k, checkpoint: plan.checkpoint, image: opt("--image"), install: installCommand(), ...n }, null, 1));
    renameSync(`${file}.tmp`, file);
    console.log(JSON.stringify({ file, exit: n.exit, groups: n.groups.length, entries: n.groups.reduce((a, g) => a + g.n, 0), ms: n.ms }));
    return;
  }
  console.error("usage: closure.mjs check-plan --repo R --plan P | oracle --repo R --plan P --range k --image I --volume V");
  process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
