#!/usr/bin/env node
// #359 cost model: one case per command, native and LayerFS arms, counters per arm.
//   node dsh/tools/history/cost.mjs list
//   node dsh/tools/history/cost.mjs prepare  --binary <id>     (once: golden → prepared golden)
//   node dsh/tools/history/cost.mjs native   --binary <id>     (once: the native tree volume)
//   node dsh/tools/history/cost.mjs case <id> --binary <id> [--label diagnostic|measured]
//   node dsh/tools/history/cost.mjs case <id> --binary <id> --daemon fresh|warm --label <l>   (#359 warm daemon)
//
// Host side: every sample gets its own folder under ~/lfs-history/runs/issue359/samples
// (refused if it exists: outputs are append-only), a fresh byte clone of the prepared
// golden Store volume, a fresh LayerFS home and a fresh Sandbox (fresh daemon), and
// runs in its own runner container. The inner side (`inner`, in the runner) plays the
// case and saves the daemon log before closing the Sandbox; the host decodes the
// observation records and writes sample.json, then appends the ledger line.
//
// Arms. native: the same command, same container and image, run in /tmp/native/w, a
// native copy (from the read-only native volume) of exactly the tree LayerFS serves;
// its page cache holds the tree after the copy (declared). cold: the first run in a
// fresh one-shot Workspace on a fresh daemon. steady: the same Workspace, run again.
// The Store file is resident in the VM page cache after the clone for every arm
// (declared, not controlled). Wall time is measured inside the container around the
// command alone (date +%s%N), so the exec launch is outside both arms; the exec's
// trace time is kept beside it. Counters per arm: the daemon's cumulative records at
// a traced status before and after the arm, subtracted; Commit, mount, unmount and
// SDK calls carry their own traced telemetry.
//
// --daemon (#359 warm daemon; absent = the behaviour above). LayerFS part only, names
// `layerfs-issue359-warm-*`, and the daemon's VmRSS/VmHWM read from /proc after each
// step (an extra exec outside the step's counters). fresh: the cold and steady arms on
// a daemon that has served no Workspace (no native setup mount). warm: Workspace W1
// mounts, runs the case's non-steady steps once and unmounts discarded (unmeasured
// warm-up); a fresh Workspace W2 on the same Branch and daemon then runs them once:
// arm `warm-daemon`. It is its own arm and never credits or replaces cold.
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { appendFileSync, chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { HISTORY, REPO, sdkJsFacts, sha256 } from "./lib.mjs";
import { STORE_MOUNT } from "./closure.mjs";

const ROOT = join(HISTORY, "runs", "issue359");
const SOURCE_RUN = join(HISTORY, "runs", "dev352-p3p");
const GOLDEN = "layerfs-issue359-dev"; // byte copy of layerfs-issue352-dev352-p3p (range 18 clean)
// GOLDEN + the setup branches below; COST_PREPARED names another prepared golden (#359, owner 2026-10-19:
// the Root-form layerfs-issue359-prep is retired for new samples; each manifest records `from`)
const PREPARED = process.env.COST_PREPARED ?? "layerfs-issue359-prep";
const NATIVE = "layerfs-issue359-native"; // the head tree as native files
const PNPM = "layerfs-issue352-pnpm-store"; // read-only, as INSTALLS §3.1
const IMAGE_TAG = "layerfs-352-runtime:node24";
const NATIVE_MOUNT = "/native-src";
const NATIVE_DIR = "/tmp/native/w";
const STORE_PATH = "/layerfs-store/global/store.sqlite";
const BINARIES = {
  "57141b57": { daemon: "/Users/yifanxu/Ephemeral-AI-Lab/layerfs/core/target/issue352/daemon-57141b57/layerfs-daemon", addon: "/Users/yifanxu/Ephemeral-AI-Lab/layerfs/core/target/issue352/sdk-linux-438bae05/layerfs.node" },
};
for (const f of (() => { try { return JSON.parse(readFileSync(join(ROOT, "binaries.json"), "utf8")); } catch { return []; } })()) BINARIES[f.id] = f;

const state = JSON.parse(readFileSync(join(SOURCE_RUN, "state.json"), "utf8"));
const closure = (kind, range = 17) => state.closureChain.find((e) => e.range === range && e.kind === kind)?.command;
export const LAYERS = { r14: "323dadcb811d91cd5a375f27e9fd5b2b91a9e5d3e1b9cb062cfccf9efff912ef22", ...Object.fromEntries(Object.entries(state.layers).map(([k, v]) => [`r${k}`, v])) };
const HEAD = LAYERS.r17;

// ---------------------------------------------------------------- cases
// kind exec: `cmd` runs in the Workspace (and natively unless native: false); arms lists
// what runs in order in ONE Workspace: cold, steady, or named follow-on steps.
// cmp: how native and LayerFS outputs must agree (sorted | exact | exit | none).
const SH = (s) => s;
const REQUIRE = `node -e "const p=require('./package.json');let n=0;for(const d of Object.keys({...p.dependencies,...p.devDependencies})){try{require.resolve(d+'/package.json');n++}catch{}}console.log(n)"`;
const install = () => closure("incremental-install");
export const CASES = {
  // exec over committed content
  "vitest": { group: "exec", ref: HEAD, cmd: () => closure("test"), cmp: "exit" },
  "tsc-b": { group: "exec", ref: HEAD, cmd: () => closure("build"), cmp: "sorted" },
  "pnpm-reinstall": { group: "exec", ref: HEAD, cmd: install, cmp: "exit" },
  "pnpm-first": { group: "exec", ref: "nonm", cmd: install, cmp: "exit", arms: ["cold"], nativeRef: "nonm", commitAfter: "commit-after-install" },
  "node-require": { group: "exec", ref: HEAD, cmd: () => REQUIRE, cmp: "exact" },
  // walks and search
  "find": { group: "walk", ref: HEAD, cmd: () => "find .", cmp: "sorted" },
  "ls-r": { group: "walk", ref: HEAD, cmd: () => "ls -R", cmp: "none" },
  "grep-r": { group: "walk", ref: HEAD, cmd: () => "grep -r -l -I -s layerfs . || true", cmp: "sorted" },
  "du-s": { group: "walk", ref: HEAD, cmd: () => "du -s --apparent-size -B1 .", cmp: "none" },
  // tree creation and removal
  "cp-rm-nm": { group: "tree", ref: HEAD, steps: [["cp", "cp -a node_modules .cost-nm"], ["rm-created", "rm -rf .cost-nm"]], cmp: "exit" },
  "rm-rf-nm": { group: "tree", ref: HEAD, steps: [["rm-committed", "rm -rf node_modules"]], cmp: "exit" },
  // git over FUSE
  "git": { group: "git", ref: "git", nativeExtra: ".git", steps: [["status-cold", "git status --porcelain"], ["status-steady", "git status --porcelain"], ["add", "echo cost359 >> README.md && git add -A"], ["commit", "git -c user.name=c -c user.email=c@c commit -q -m c && git rev-parse HEAD^{tree}"]], cmp: "exact" },
  // Workspace lifecycle
  "first-stat": { group: "lifecycle", ref: HEAD, cmd: () => "stat -c '%s %Y %a' package.json", cmp: "none" },
  "first-stat-deep": { group: "lifecycle", ref: HEAD, cmd: () => "stat -c '%s %Y %a' node_modules/.pnpm/@antfu+install-pkg@1.1.0/node_modules/@antfu/install-pkg/package.json", cmp: "none" },
  "first-open": { group: "lifecycle", ref: HEAD, cmd: () => "head -c 64 package.json", cmp: "exact" },
  "small-commit": { group: "lifecycle", ref: HEAD, steps: [["edit", "echo cost359 >> README.md"]], commit: true, native: false },
  "merge": { group: "lifecycle", kind: "merge", ref: HEAD },
  // SDK calls (in-process Store; #354 owns their implementation)
  "sdk-read": { group: "sdk", kind: "sdk", ref: HEAD, call: (lf, b) => lf.fs.read(b, "/README.md", 1, 50) },
  "sdk-list": { group: "sdk", kind: "sdk", ref: HEAD, call: (lf, b) => lf.fs.list(b, "/", 50, 0) },
  "sdk-glob": { group: "sdk", kind: "sdk", ref: HEAD, call: (lf, b) => lf.fs.glob(b, "**/*.json", "/packages", 50, 0) },
  "sdk-grep": { group: "sdk", kind: "sdk", ref: HEAD, call: (lf, b) => lf.fs.grep(b, "layerfs", "/", 50, 0) },
  // scaling probes: folder size, tree size, history depth
  ...Object.fromEntries([100, 1000, 10000].flatMap((n) => [
    [`folder-${n}-ls`, { group: "scale-folder", ref: "folders", nativeExtra: ".cost", cmd: () => `ls -l .cost/d${n} | wc -l`, cmp: "exact" }],
    [`folder-${n}-stat`, { group: "scale-folder", ref: "folders", nativeExtra: ".cost", cmd: () => `stat -c %s .cost/d${n}/f${n / 2}`, cmp: "exact" }],
  ])),
  ...Object.fromEntries(["r14", "r17"].flatMap((r) => [
    [`tree-${r}-first-stat`, { group: "scale-tree", ref: LAYERS[r], cmd: () => "stat -c %s package.json", cmp: "none", native: false }],
    [`tree-${r}-find`, { group: "scale-tree", ref: LAYERS[r], cmd: () => "find . | wc -l", cmp: "none", native: false }],
    [`tree-${r}-small-commit`, { group: "scale-tree", ref: LAYERS[r], steps: [["edit", "echo cost359 >> README.md"]], commit: true, native: false }],
  ])),
  ...Object.fromEntries(["r15", "r16", "r17"].map((r) => [`depth-${r}-first-stat`, { group: "scale-depth", ref: LAYERS[r], cmd: () => "stat -c %s pnpm-workspace.yaml", cmp: "none", native: false }])),
};

// The setup branches `prepare` adds to the prepared golden (each one setup Commit).
const PREP = {
  nonm: "find . -name node_modules -prune -exec rm -rf {} +",
  folders: [100, 1000, 10000].map((n) => `mkdir -p .cost/d${n} && (cd .cost/d${n} && seq 1 ${n} | sed 's/^/f/' | xargs touch)`).join(" && "),
  git: "git init -q && git add -A && git -c user.name=c -c user.email=c@c commit -q -m base",
};

// ---------------------------------------------------------------- host side
const docker = (args, opts = {}) => execFileSync("docker", args, { encoding: "utf8", maxBuffer: 1 << 26, ...opts }).trim();
const opt = (args, name, dflt = null) => { const i = args.indexOf(name); return i < 0 ? dflt : args[i + 1]; };
const ledger = (entry) => { mkdirSync(ROOT, { recursive: true }); appendFileSync(join(ROOT, "ledger.jsonl"), `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`); };
const nextSeq = () => { try { return readFileSync(join(ROOT, "ledger.jsonl"), "utf8").split("\n").filter(Boolean).length + 1; } catch { return 1; } };
const cloneVolume = (from, to) => {
  docker(["volume", "create", to]);
  docker(["run", "--rm", "--name", `${to}-clone`, "-v", `${from}:/src:ro`, "-v", `${to}:/dst`, "--entrypoint", "sh", IMAGE_TAG, "-c", "cp -a /src/. /dst/"]);
};

function identities(binary) {
  const b = BINARIES[binary];
  if (!b) throw new Error(`unknown binary ${binary} (known: ${Object.keys(BINARIES).join(", ")})`);
  return {
    binary, daemon: sha256(b.daemon), addon: sha256(b.addon), sdkJs: sdkJsFacts(join(REPO, "sdk/js")),
    image: docker(["image", "inspect", "--format", "{{.Id}}", IMAGE_TAG]),
    source: execFileSync("git", ["-C", REPO, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    dirty: execFileSync("git", ["-C", REPO, "status", "--porcelain", "dsh/tools/history"], { encoding: "utf8" }).trim() !== "",
    harness: sha256(join(REPO, "dsh/tools/history/cost.mjs")),
  };
}

/** Runs `inner` in a runner container over `volume`; resolves with its exit code. */
function runInner(name, volume, home, binary, args, out) {
  const b = BINARIES[binary];
  const imageId = docker(["image", "inspect", "--format", "{{.Id}}", IMAGE_TAG]);
  const hostSocket = docker(["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"]).replace(/^unix:\/\//, "");
  const gitCommon = resolve(REPO, execFileSync("git", ["-C", REPO, "rev-parse", "--git-common-dir"], { encoding: "utf8" }).trim());
  const env = {
    LAYERFS_HOME: home, LAYERFS_DOCKER: "/var/run/docker.sock", LAYERFS_IMAGE: imageId, LAYERFS_VOLUME: volume,
    LAYERFS_DAEMON: b.daemon, LAYERFS_NATIVE: b.addon, LAYERFS_CONTAINER_PREFIX: `${name}-`, LAYERFS_CONSTRUCTION_WORKERS: "1",
    LAYERFS_STORE_PATH: STORE_PATH, LAYERFS_DAEMON_HOST: "host.docker.internal", LFS_HISTORY: HISTORY, HOME: process.env.HOME,
    PATH: `${join(REPO, "dsh/tools/history/runner")}:/usr/local/bin:/usr/bin:/bin`,
  };
  const mounts = ["-v", `${REPO}:${REPO}`, "-v", `${HISTORY}:${HISTORY}`, "-v", `${volume}:/layerfs-store`,
    "-v", `/Users/yifanxu/Ephemeral-AI-Lab/layerfs/core/target/issue352:/Users/yifanxu/Ephemeral-AI-Lab/layerfs/core/target/issue352:ro`,
    "--mount", `type=bind,src=${gitCommon},dst=${gitCommon},readonly`,
    // #359 warm daemon: a registered binary pinned outside this checkout is mounted read-only where it lies
    ...[...new Set([b.daemon, b.addon].map((f) => resolve(f, "..")))].filter((d) => !d.startsWith(`${REPO}/`) && !d.startsWith("/Users/yifanxu/Ephemeral-AI-Lab/layerfs/core/target/issue352/")).flatMap((d) => ["--mount", `type=bind,src=${d},dst=${d},readonly`]),
    "-v", "/var/run/docker.sock:/var/run/docker.sock", ...(hostSocket !== "/var/run/docker.sock" ? ["-v", `/var/run/docker.sock:${hostSocket}`] : [])];
  const argv = ["run", "--rm", "--name", name, "--init", ...mounts, ...Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]),
    "-w", REPO, "--entrypoint", "node", imageId, join(REPO, "dsh/tools/history/cost.mjs"), "inner", ...args, "--out", out];
  return new Promise((resolve) => spawn("docker", argv, { stdio: "inherit" }).on("exit", (code) => resolve(code ?? 1)));
}

function freshHome(dir) {
  // the SDK requires a private home, as the source run's (0700 folders, 0600 records)
  mkdirSync(join(dir, "home", "dsh"), { recursive: true, mode: 0o700 });
  for (const f of ["project.record", "ownership.lock"]) copyFileSync(join(SOURCE_RUN, "home", "dsh", f), join(dir, "home", "dsh", f));
  for (const [p, m] of [["home", 0o700], ["home/dsh", 0o700], ["home/dsh/project.record", 0o600], ["home/dsh/ownership.lock", 0o600]]) chmodSync(join(dir, p), m);
  return join(dir, "home");
}

async function hostCase(id, args) {
  if (!CASES[id]) throw new Error(`no case ${id}`);
  const binary = opt(args, "--binary"), label = opt(args, "--label", "diagnostic"), daemon = opt(args, "--daemon"), part = daemon ? "lfs" : opt(args, "--part", "all");
  if (!["all", "native", "lfs"].includes(part)) throw new Error(`--part ${part}: all | native | lfs`);
  if (daemon && !["fresh", "warm"].includes(daemon)) throw new Error(`--daemon ${daemon}: fresh | warm`);
  const ids = identities(binary), seq = nextSeq();
  const name = `layerfs-issue359-${daemon ? "warm-" : ""}s${String(seq).padStart(3, "0")}`;
  const out = join(ROOT, "samples", `${name.slice(17)}-${id}${part === "all" ? "" : `-${part}`}-${label}`);
  if (existsSync(out)) throw new Error(`${out} exists: outputs are append-only`);
  mkdirSync(out, { recursive: true });
  const t0 = Date.now();
  cloneVolume(PREPARED, name);
  const home = freshHome(out);
  writeFileSync(join(out, "manifest.json"), JSON.stringify({ case: id, part, label, seq, daemon, volume: name, from: PREPARED, ids, load: (await import("node:os")).loadavg(), at: new Date().toISOString() }, null, 1));
  ledger({ seq, case: id, part, label, event: "start", volume: name, out });
  const native = CASES[id].native !== false && !CASES[id].kind && part !== "lfs";
  if (native && !nativeExists()) throw new Error(`case ${id} has a native arm and ${NATIVE} does not exist: run \`cost.mjs native\` first`);
  const code = await runInner(name, name, home, binary, ["case", id, "--native", native ? "yes" : "no", "--part", part, ...(daemon ? ["--daemon", daemon] : [])], out);
  const decoded = spawnSync("python3", [join(REPO, "tools/decode_observations.py"), join(out, "daemon.log"), "--trace", join(out, "trace.jsonl")], { encoding: "utf8", maxBuffer: 1 << 28 });
  writeFileSync(join(out, "daemon.jsonl"), decoded.stdout ?? "");
  let summary = null;
  try { summary = summarize(out); writeFileSync(join(out, "sample.json"), JSON.stringify(summary, null, 1)); } catch (e) { writeFileSync(join(out, "summarize-error.txt"), String(e.stack ?? e)); }
  docker(["volume", "rm", name]);
  ledger({ seq, case: id, part, label, event: "end", exit: code, ms: Date.now() - t0, volume: name, removed: true, out, verdict: summary?.verdict ?? "INCOMPLETE" });
  return code;
}

/** One-time setup (recorded): GOLDEN cloned to PREPARED, then one setup Commit per PREP branch. */
async function hostPrepare(args) {
  const binary = opt(args, "--binary"), out = join(ROOT, "setup", `prepare-${Date.now()}`);
  mkdirSync(out, { recursive: true });
  cloneVolume(GOLDEN, PREPARED);
  writeFileSync(join(out, "manifest.json"), JSON.stringify({ ids: identities(binary), from: GOLDEN, to: PREPARED, prep: PREP }, null, 1));
  ledger({ event: "prepare", volume: PREPARED, out });
  return runInner("layerfs-issue359-prepare", PREPARED, freshHome(out), binary, ["prepare"], out);
}

/** One-time setup: the head tree (and the nonm tree) copied out of a Workspace into NATIVE. */
async function hostNative(args) {
  const binary = opt(args, "--binary"), out = join(ROOT, "setup", `native-${Date.now()}`);
  mkdirSync(out, { recursive: true });
  const name = "layerfs-issue359-native-src";
  cloneVolume(PREPARED, name);
  const inner = runInner(name, name, freshHome(out), binary, ["native"], out);
  // the inner side copies each tree to /tmp/nat/<ref> in its Sandbox, then waits for `done`
  while (!existsSync(join(out, "ready")) && !existsSync(join(out, "failed"))) await new Promise((r) => setTimeout(r, 1000));
  if (existsSync(join(out, "ready"))) {
    const container = readFileSync(join(out, "ready"), "utf8").trim();
    docker(["volume", "create", NATIVE]);
    docker(["create", "--name", "layerfs-issue359-native-fill", "-v", `${NATIVE}:/dst`, IMAGE_TAG]);
    execFileSync("sh", ["-c", `docker cp ${container}:/tmp/nat/. - | docker cp - layerfs-issue359-native-fill:/dst`], { stdio: "inherit" });
    docker(["rm", "layerfs-issue359-native-fill"]);
    writeFileSync(join(out, "done"), "");
  }
  const code = await inner;
  docker(["volume", "rm", name]);
  ledger({ event: "native", volume: NATIVE, out, exit: code });
  return code;
}

// ---------------------------------------------------------------- inner side (runner)
async function client(out) {
  const { LayerFS } = await import(join(REPO, "sdk/js/src/index.js"));
  const lf = new LayerFS("dsh", { trace: join(out, "trace.jsonl") });
  const label = (step) => { lf.options.traceStep = step; };
  return { lf, label };
}

async function sandbox(lf, volumes) {
  const image = process.env.LAYERFS_IMAGE;
  return lf.sandbox.create("c", "dsh", image, { volumes });
}

/** The container log of Sandbox `sb`, saved before it is closed (sandbox.close deletes it). */
async function saveLog(out, home, sb) {
  const { api } = await import(join(REPO, "dsh/tools/history/runner/docker-shim.mjs"));
  const id = readFileSync(join(home, "_sandboxes", sb, "container"), "utf8").trim();
  const r = await api("GET", `/containers/${id}/logs?stdout=1&stderr=1`, null, { raw: true });
  const parts = [];
  for (let at = 0, b = r.body; at + 8 <= b.length;) { const n = b.readUInt32BE(at + 4); parts.push(b.subarray(at + 8, at + 8 + n)); at += 8 + n; }
  writeFileSync(join(out, "daemon.log"), Buffer.concat(parts));
}

/** One timed command: in-container wall ns around the command alone, exit, output digest and size. */
const timed = (dir, cmd, cmp) => [
  `cd ${dir} && rm -f /tmp/cost.out /tmp/cost.err && s=$(date +%s%N)`,
  `( ${cmd} ) >/tmp/cost.out 2>/tmp/cost.err; rc=$?; e=$(date +%s%N)`,
  `d=$(${cmp === "sorted" ? "LC_ALL=C sort" : "cat"} /tmp/cost.out | sha256sum | cut -c1-64)`,
  `printf '__COST %s %s %s %s\\n' $((e-s)) $rc $d $(stat -c %s /tmp/cost.out); head -c 2048 /tmp/cost.out; tail -c 2048 /tmp/cost.err >&2`,
].join("; ");
const parse = (r) => {
  const m = /__COST (\d+) (\d+) ([0-9a-f]{64}) (\d+)/.exec(r.stdout ?? "");
  return m ? { ns: Number(m[1]), exit: Number(m[2]), digest: m[3], bytes: Number(m[4]), head: r.stdout.slice(m.index + m[0].length + 1, m.index + m[0].length + 513), stderr: String(r.stderr ?? "").slice(-1024) } : { error: "no __COST line", stdout: String(r.stdout ?? "").slice(-1024), stderr: String(r.stderr ?? "").slice(-1024), exitCode: r.exitCode };
};

async function inner(args) {
  const out = opt(args, "--out"), what = args[0];
  const { lf, label } = await client(out);
  const home = process.env.LAYERFS_HOME, arms = [];
  const record = (arm) => { arms.push(arm); writeFileSync(join(out, "arms.json"), JSON.stringify(arms, null, 1)); };
  const volumes = [{ volume: PNPM, target: STORE_MOUNT }, ...(what === "case" && opt(args, "--native") === "yes" ? [{ volume: NATIVE, target: NATIVE_MOUNT }] : [])];
  let sb = null;
  const mounted = new Set();
  try {
    label("setup.create");
    sb = await sandbox(lf, volumes);
    const mount = async (branch, step) => { label(step); const ws = await lf.sandbox.mount(sb, branch); mounted.add(ws); return ws; };
    const unmount = async (ws, step, discard = true) => { label(step); await lf.sandbox.unmount(sb, ws, discard); mounted.delete(ws); };
    const status = async (ws, step) => { label(step); return lf.sandbox.status(sb, ws); };
    const exec = async (ws, cmd, step) => { label(step); return lf.sandbox.exec(sb, ws, cmd); };
    const fork = async (name, ref, step) => { label(step); await lf.branch.fork(name, ref); return name; };
    if (what === "prepare") {
      for (const [name, cmd] of Object.entries(PREP)) {
        await fork(name, HEAD, `prep.${name}.fork`);
        const ws = await mount(name, `prep.${name}.mount`);
        const r = await exec(ws, cmd, `prep.${name}.exec`);
        if (r.exitCode !== 0) throw new Error(`prep ${name} exited ${r.exitCode}: ${String(r.stderr).slice(-500)}`);
        label(`prep.${name}.commit`);
        const c = await lf.sandbox.commit(sb, ws, `issue359 setup ${name}`);
        await unmount(ws, `prep.${name}.unmount`, false);
        record({ prep: name, commit: c?.kind ?? null });
      }
    } else if (what === "native") {
      for (const ref of ["head", "nonm"]) {
        const ws = await mount(ref === "head" ? await fork("native-head", HEAD, "native.fork") : "nonm", `native.${ref}.mount`);
        const r = await exec(ws, `mkdir -p /tmp/nat/${ref} && cp -a . /tmp/nat/${ref}/ && find /tmp/nat/${ref} | wc -l`, `native.${ref}.copy`);
        if (r.exitCode !== 0) throw new Error(`native copy ${ref} exited ${r.exitCode}: ${String(r.stderr).slice(-500)}`);
        record({ native: ref, entries: String(r.stdout).trim() });
        await unmount(ws, `native.${ref}.unmount`);
      }
      writeFileSync(join(out, "ready"), readFileSync(join(home, "_sandboxes", sb, "container"), "utf8").trim());
      while (!existsSync(join(out, "done"))) await new Promise((r) => setTimeout(r, 1000));
    } else {
      await playCase(CASES[args[1]], args[1], { lf, sb, label, mount, unmount, status, exec, fork, record, part: opt(args, "--part", "all"), daemon: opt(args, "--daemon") });
    }
  } catch (error) {
    record({ error: String(error?.stack ?? error), code: error?.code ?? null });
    if (what === "native") writeFileSync(join(out, "failed"), String(error));
    process.exitCode = 1;
  } finally {
    for (const ws of mounted) { try { label("teardown.unmount"); await lf.sandbox.unmount(sb, ws, true); } catch (e) { record({ teardown: String(e) }); } }
    if (sb) { try { await saveLog(out, home, sb); } catch (e) { record({ log: String(e) }); } label("teardown.close"); await lf.sandbox.close(sb).catch((e) => record({ close: String(e) })); }
    await lf.close();
  }
}
const nativeExists = () => { try { docker(["volume", "inspect", NATIVE]); return true; } catch { return false; } };

const RSS = "for p in /proc/[0-9]*; do [ \"$(cat $p/comm 2>/dev/null)\" = layerfs-daemon ] && grep -E '^(VmRSS|VmHWM)' $p/status; done";
// #359 daemon memory after unmount: status, smaps_rollup, fd targets by folder, FUSE mounts and anonymous
// mappings (glibc arenas show as anonymous mappings; the allocator has no external statistics).
const PROBE = [
  "for p in /proc/[0-9]*; do [ \"$(cat $p/comm 2>/dev/null)\" = layerfs-daemon ] || continue",
  "grep -E '^(VmRSS|VmHWM|RssAnon|RssFile|Threads):' $p/status; grep -E '^(Rss|Pss_Anon|Pss_File|Anonymous|Swap):' $p/smaps_rollup",
  "echo \"Fds: $(ls $p/fd | wc -l)\"; echo \"FuseMounts: $(grep -c ' - fuse' $p/mountinfo)\"; echo \"AnonMaps: $(awk 'NF==5' $p/maps | wc -l)\"",
  "for f in $p/fd/*; do readlink $f; done | sed -E 's#^(/[^/]+/[^/]+/.*)/[^/]*$#\\1/#; s#:\\[[0-9]+\\]#:#' | sort | uniq -c | sed 's/^ */Fd /'; done",
].join("; ");
const probeOf = (text) => {
  const v = {}, fds = {};
  for (const l of String(text).split("\n")) {
    const m = /^(\w+):\s+(\d+)/.exec(l); if (m) { v[m[1]] = Number(m[2]); continue; }
    const f = /^Fd (\d+) (.*)$/.exec(l); if (f) fds[f[2]] = Number(f[1]);
  }
  return { ...v, fds };
};
/** Runs PROBE in Sandbox `sb`'s container (no Workspace needed, so it can run after unmount); privileged, as smaps and fd links need ptrace access. */
async function daemonProbe(home, sb) {
  const { api, demux } = await import(join(REPO, "dsh/tools/history/runner/docker-shim.mjs"));
  const id = readFileSync(join(home, "_sandboxes", sb, "container"), "utf8").trim();
  const e = await api("POST", `/containers/${id}/exec`, { AttachStdout: true, AttachStderr: true, Tty: false, Privileged: true, Cmd: ["sh", "-c", PROBE] });
  const r = await api("POST", `/exec/${e.body.Id}/start`, { Detach: false, Tty: false }, { raw: true });
  return { at: new Date().toISOString(), ...probeOf(demux(r.body).stdout.toString("utf8")) };
}
const rssOf = (r) => Object.fromEntries([...String(r.stdout ?? "").matchAll(/^(VmRSS|VmHWM):\s+(\d+) kB/gm)].map((m) => [m[1] === "VmRSS" ? "rssKb" : "hwmKb", Number(m[2])]));

async function playCase(c, id, { lf, label, mount, unmount, status, exec, fork, record, sb, part, daemon }) {
  const branch = await fork(`cost-${id}`, c.ref, "fork");
  if (c.kind === "sdk") {
    for (const arm of ["cold", "steady"]) { label(`${arm}.sdk`); const v = await c.call(lf, branch); record({ arm, step: `${arm}.sdk`, items: v?.items?.length ?? null, kind: v?.kind ?? null }); }
    return;
  }
  if (c.kind === "merge") {
    const a = await fork(`cost-merge-a`, c.ref, "merge.fork-a"), b = await fork(`cost-merge-b`, c.ref, "merge.fork-b");
    label("merge.write-a"); await lf.fs.write(a, "/cost359-a.txt", "a\n", "a");
    label("merge.write-b"); await lf.fs.write(b, "/cost359-b.txt", "b\n", "b");
    label("merge.merge"); const m = await lf.branch.merge(a, b, "cost-merge-out", "merge");
    record({ arm: "cold", step: "merge.merge", kind: m?.kind ?? null });
    return;
  }
  const steps = c.steps ?? (c.arms ?? ["cold", "steady"]).map((arm) => [arm, c.cmd()]);
  // native arm first, in a setup Workspace of its own, unmounted before the measured mount
  if (c.native !== false && part !== "lfs") {
    const ws0 = await mount(branch, "native.mount");
    const src = c.nativeRef === "nonm" ? "nonm" : "head";
    // nativeExtra: the git/folders setup branches are the head tree plus one folder; it comes from the setup Workspace (untimed)
    const prep = await exec(ws0, `rm -rf /tmp/native && mkdir -p ${NATIVE_DIR} && cp -a ${NATIVE_MOUNT}/${src}/. ${NATIVE_DIR}/${c.nativeExtra ? ` && cp -a ${c.nativeExtra} ${NATIVE_DIR}/` : ""}`, "native.copy");
    if (prep.exitCode !== 0) throw new Error(`native copy exited ${prep.exitCode}: ${String(prep.stderr).slice(-300)}`);
    for (const [step, cmd] of steps) { const r = await exec(ws0, timed(NATIVE_DIR, cmd, c.cmp), `native.${step}`); record({ arm: "native", step, ...parse(r) }); }
    await unmount(ws0, "native.unmount");
  }
  if (part === "native") return;
  const steady = (step) => step === "steady" || step.endsWith("-steady");
  const run = daemon === "warm" ? steps.filter(([step]) => !steady(step)) : steps;
  if (daemon === "warm") {
    const w1 = await mount(branch, "warm.w1.mount");
    for (const [step, cmd] of run) { const r = await exec(w1, timed(".", cmd, c.cmp), `warm.w1.${step}.exec`); record({ arm: "warm-w1", step, ...parse(r) }); }
    await unmount(w1, "warm.w1.unmount");
  }
  const rss = async (ws, step) => (daemon ? { daemonMem: rssOf(await exec(ws, RSS, `lfs.${step}.rss`)) } : {});
  const ws = await mount(branch, "lfs.mount");
  for (const [step, cmd] of run) {
    await status(ws, `lfs.${step}.before`);
    const r = await exec(ws, timed(".", cmd, c.cmp), `lfs.${step}.exec`);
    await status(ws, `lfs.${step}.after`);
    record({ arm: daemon === "warm" ? "warm-daemon" : steady(step) ? "steady" : "cold", step, ...parse(r), ...(await rss(ws, step)) });
  }
  if (c.commit || c.commitAfter) {
    label("lfs.commit"); const v = await lf.sandbox.commit(sb, ws, `issue359 ${id}`);
    record({ arm: daemon === "warm" ? "warm-daemon" : "cold", step: c.commitAfter ?? "commit", kind: v?.kind ?? null, ...(await rss(ws, "commit")) });
  }
  await unmount(ws, "lfs.unmount", !(c.commit || c.commitAfter));
}

// ---------------------------------------------------------------- summary (host)
const traceLines = (file) => readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((l) => l.phase !== "start");
const num = (o) => Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => typeof v === "number"));
const sub = (a, b) => Object.fromEntries(Object.keys(num(b)).map((k) => [k, (b[k] ?? 0) - (a?.[k] ?? 0)]));
/** Sums a decoded call's per-reader sections (live readers and the closed sum) into one. */
const readers = (sections, prefix) => Object.entries(sections).filter(([k, v]) => k.startsWith(`${prefix}.`) && v).reduce((acc, [, v]) => { for (const [k, x] of Object.entries(num(v))) acc[k] = (acc[k] ?? 0) + x; return acc; }, {});
const SECTIONS = ["owner", "store_readers", "immutable_cache", "writer_sql", "kernel_opcodes", "kernel_work", "owner_lock_holds"];
const view = (g) => ({ ...Object.fromEntries(SECTIONS.map((s) => [s, num(g.sections[s])])), reader_sql: readers(g.sections, "reader_sql"), reader_storage: readers(g.sections, "reader_storage") });
const sqlOf = (line) => (line?.daemon ?? []).reduce((acc, d) => { for (const grp of ["writer", "readers"]) for (const [k, v] of Object.entries(num(d.sql?.[grp]))) acc[`${grp}.${k}`] = (acc[`${grp}.${k}`] ?? 0) + v; return acc; }, {});

export function summarize(out) {
  const arms = JSON.parse(readFileSync(join(out, "arms.json"), "utf8"));
  const lines = traceLines(join(out, "trace.jsonl"));
  const byStep = (s) => lines.filter((l) => String(l.step ?? "").replace(/#\d+$/, "") === s);
  const daemon = existsSync(join(out, "daemon.jsonl")) ? readFileSync(join(out, "daemon.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
  const byTrace = new Map(daemon.filter((g) => g.trace).map((g) => [g.trace, g]));
  const rows = arms.map((a) => {
    if (!a.step) return a;
    const exec = a.arm === "warm-w1" ? byStep(`warm.w1.${a.step}.exec`)[0] : byStep(`${a.arm === "native" ? "native" : "lfs"}.${a.step}.exec`)[0] ?? byStep(`native.${a.step}`)[0];
    const row = { ...a, execMs: exec?.ms ?? null };
    if (a.arm !== "native" && a.arm !== "warm-w1") {
      const [before, after] = [byStep(`lfs.${a.step}.before`)[0], byStep(`lfs.${a.step}.after`)[0]];
      const gb = before && byTrace.get(before.id), ga = after && byTrace.get(after.id);
      if (gb && ga) { const vb = view(gb), va = view(ga); row.counters = Object.fromEntries(Object.keys(va).map((k) => [k, sub(vb[k], va[k])])); } else row.counters = null;
      const direct = byStep(a.step === "commit" || a.step === "commit-after-install" ? "lfs.commit" : a.step.startsWith("merge") ? "merge.merge" : `${a.arm}.sdk`)[0];
      if (direct && !exec) Object.assign(row, { ms: direct.ms, ok: direct.ok, sql: sqlOf(direct), storage: direct.daemon?.find((d) => d.storage)?.storage ?? null, construction: direct.daemon?.find((d) => d.construction)?.construction ?? null, timing: direct.daemon?.map((d) => d.timing) ?? null });
    }
    return row;
  });
  const calls = Object.fromEntries(["lfs.mount", "lfs.unmount", "native.mount", "setup.create", "warm.w1.mount", "warm.w1.unmount"].map((s) => [s, byStep(s).map((l) => ({ ms: l.ms, ok: l.ok, sql: sqlOf(l), timing: l.daemon?.map((d) => d.timing) ?? null }))]));
  const manifest = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8"));
  // sorted | exact: digest and exit must agree; exit | none: exit only (none = output legitimately differs, e.g. sizes)
  const cmp = CASES[manifest.case]?.cmp ?? "none";
  const native = rows.filter((r) => r.arm === "native"), lfs = rows.filter((r) => r.arm && r.arm !== "native" && r.arm !== "warm-w1");
  // a split part (--part native|lfs) holds one side only: agreement is checked across parts by `table`
  const agree = (manifest.part ?? "all") !== "all" ? [] : native.map((n) => { const l = lfs.find((r) => r.step === n.step); return { step: n.step, digest: !!(l && l.digest === n.digest), exit: !!(l && l.exit === n.exit) }; });
  const mismatch = agree.some((a) => !a.exit || (["sorted", "exact"].includes(cmp) && !a.digest));
  const failed = rows.some((r) => r.error) || rows.some((r) => r.exit != null && r.exit !== 0);
  return { out, manifest, cmp, rows, calls, agree, verdict: failed ? "FAILED" : mismatch ? "MISMATCH" : rows.some((r) => r.step && r.arm !== "native" && r.arm !== "warm-w1" && r.counters === null && r.execMs != null) ? "INCOMPLETE" : "COMPLETE" };
}

// ---------------------------------------------------------------- table (host)
/** One row per case and arm from the newest sample of each case/part with `label` and `binary`. */
export function table(label, binary) {
  const picked = new Map();
  for (const l of readFileSync(join(ROOT, "ledger.jsonl"), "utf8").split("\n").filter(Boolean).map((x) => JSON.parse(x))) {
    if (l.event !== "end" || l.label !== label || !existsSync(join(l.out, "sample.json"))) continue;
    const s = JSON.parse(readFileSync(join(l.out, "sample.json"), "utf8"));
    if (s.manifest.ids.binary === binary) picked.set(`${l.case}/${l.part ?? "all"}`, s);
  }
  const rows = [];
  for (const [id, c] of Object.entries(CASES)) {
    // a case run split (native + lfs parts) supersedes an earlier whole-case sample of the same label
    const split = ["native", "lfs"].map((p) => picked.get(`${id}/${p}`)).filter(Boolean);
    const parts = split.length ? split : [picked.get(`${id}/all`)].filter(Boolean);
    if (!parts.length) { rows.push({ case: id, group: c.group, verdict: "NOT_RUN" }); continue; }
    const all = parts.flatMap((s) => s.rows.filter((r) => r.arm));
    const verdicts = parts.map((s) => s.verdict);
    const nat = Object.fromEntries(all.filter((r) => r.arm === "native").map((r) => [r.step, r]));
    for (const r of all.filter((x) => x.arm !== "native" && x.arm !== "warm-w1")) {
      const n = nat[r.step], k = r.counters ?? {}, g = (s, f) => k[s]?.[f] ?? null;
      const sql = r.sql ?? {};
      const agrees = !n ? null : n.exit === r.exit && (!["sorted", "exact"].includes(c.cmp) || n.digest === r.digest);
      rows.push({
        case: id, group: c.group, arm: r.arm, step: r.step, verdict: verdicts.includes("FAILED") ? "FAILED" : agrees === false ? "MISMATCH" : verdicts.every((v) => v === "COMPLETE" || v === "MISMATCH") ? "COMPLETE" : verdicts.join("+"),
        nativeMs: n?.ns != null ? n.ns / 1e6 : null, ms: r.ns != null ? r.ns / 1e6 : r.ms ?? null,
        ratio: n?.ns && r.ns ? r.ns / n.ns : null,
        statements: g("reader_sql", "statements") ?? sql["readers.statements"] ?? null, writerStatements: g("writer_sql", "statements") ?? sql["writer.statements"] ?? null,
        vmSteps: g("reader_sql", "vm_steps") ?? sql["readers.vm_steps"] ?? null, fullscan: g("reader_sql", "fullscan_steps") ?? sql["readers.fullscan_steps"] ?? null,
        transactions: g("reader_sql", "transactions") ?? sql["readers.transactions"] ?? null, blobBytes: g("reader_sql", "blob_read_bytes") ?? sql["readers.blob_read_bytes"] ?? null,
        packBytes: g("reader_storage", "pack_read_bytes"), packReads: g("reader_storage", "read_pack_selections"), locate: g("reader_storage", "locate"),
        readerRequests: g("store_readers", "requests"), cacheHits: g("immutable_cache", "cache_hits"), cacheMisses: g("immutable_cache", "cache_misses"),
        rssKb: r.daemonMem?.rssKb ?? null, hwmKb: r.daemonMem?.hwmKb ?? null,
        lookup: g("kernel_opcodes", "lookup"), lookupMissing: g("kernel_opcodes", "lookup_missing"), getattr: g("kernel_opcodes", "getattr"),
        readdir: g("kernel_opcodes", "readdir"), read: g("kernel_opcodes", "read"), served: g("kernel_opcodes", "served"), servedNs: g("kernel_opcodes", "served_ns"),
        ownerJobs: g("owner", "jobs"), ownerWaitNs: g("owner", "lock_wait_ns_general"), ownerHoldNs: g("owner", "hold_ns_general"),
        samples: parts.map((s) => s.out.split("/").pop()),
      });
    }
  }
  return rows;
}

// ---------------------------------------------------------------- serial (#359 warm daemon, record 031)
// One daemon, one Store clone, several cases one after another, each in its own fresh
// Workspace (mount, run its non-steady steps once, RSS, unmount discarded). The Sandbox
// outlives each command, so every case is its own command under the 2-minute rule:
//   cost.mjs serial open --binary <id> --label <l>     (clone, home, Sandbox; prints the folder)
//   cost.mjs serial case <id> --out <folder>           (one case in a fresh Workspace)
//   cost.mjs serial close --out <folder>               (daemon log, close, decode, summary)
// No case may Commit: a LayerFS Commit would move the base the later cases read.
async function hostSerial([what, ...args]) {
  if (what === "open") {
    const binary = opt(args, "--binary"), label = opt(args, "--label"), ids = identities(binary), seq = nextSeq();
    const name = `layerfs-issue359-warm-s${String(seq).padStart(3, "0")}`, out = join(ROOT, "samples", `${name.slice(17)}-serial-${label}`);
    if (existsSync(out)) throw new Error(`${out} exists: outputs are append-only`);
    mkdirSync(out, { recursive: true });
    cloneVolume(PREPARED, name);
    const home = freshHome(out);
    writeFileSync(join(out, "serial.json"), JSON.stringify({ seq, label, volume: name, binary, home, cases: [] }, null, 1));
    writeFileSync(join(out, "manifest.json"), JSON.stringify({ serial: true, label, seq, volume: name, from: PREPARED, ids, load: (await import("node:os")).loadavg(), at: new Date().toISOString() }, null, 1));
    ledger({ seq, case: "serial", label, event: "start", volume: name, out });
    const code = await runInner(`${name}-open`, name, home, binary, ["serial", "open"], out);
    console.log(out);
    return code;
  }
  const out = opt(args, "--out"), st = JSON.parse(readFileSync(join(out, "serial.json"), "utf8"));
  if (what === "case") {
    const id = args[0], pos = st.cases.length + 1;
    if (!CASES[id] || CASES[id].kind || CASES[id].commit || CASES[id].commitAfter) throw new Error(`serial case ${id}: exec cases without a Commit only`);
    st.cases.push({ id, pos, load: (await import("node:os")).loadavg(), at: new Date().toISOString() });
    writeFileSync(join(out, "serial.json"), JSON.stringify(st, null, 1));
    return runInner(`${st.volume}-c${pos}`, st.volume, st.home, st.binary, ["serial", "case", id, "--pos", String(pos)], out);
  }
  if (what === "repeat") {
    const id = args[0], n = opt(args, "--n"), pos = st.cases.length + 1;
    if (!CASES[id] || CASES[id].kind || CASES[id].commit || CASES[id].commitAfter || !(Number(n) > 0)) throw new Error(`serial repeat ${id} --n <count>: exec cases without a Commit only`);
    st.cases.push({ id, pos, repeat: Number(n), load: (await import("node:os")).loadavg(), at: new Date().toISOString() });
    writeFileSync(join(out, "serial.json"), JSON.stringify(st, null, 1));
    return runInner(`${st.volume}-c${pos}`, st.volume, st.home, st.binary, ["serial", "repeat", id, "--n", n, "--pos", String(pos)], out);
  }
  if (what === "close") {
    const code = await runInner(`${st.volume}-close`, st.volume, st.home, st.binary, ["serial", "close"], out);
    const traces = ["open", ...st.cases.map((c) => `${c.pos}`)].map((t) => join(out, `trace-${t}.jsonl`)).filter(existsSync);
    writeFileSync(join(out, "trace.jsonl"), traces.map((f) => readFileSync(f, "utf8")).join(""));
    const decoded = spawnSync("python3", [join(REPO, "tools/decode_observations.py"), join(out, "daemon.log"), "--trace", join(out, "trace.jsonl")], { encoding: "utf8", maxBuffer: 1 << 28 });
    writeFileSync(join(out, "daemon.jsonl"), decoded.stdout ?? "");
    let summary = null;
    try { summary = summarizeSerial(out, st); writeFileSync(join(out, "sample.json"), JSON.stringify(summary, null, 1)); } catch (e) { writeFileSync(join(out, "summarize-error.txt"), String(e.stack ?? e)); }
    docker(["volume", "rm", st.volume]);
    ledger({ seq: st.seq, case: "serial", label: st.label, event: "end", exit: code, volume: st.volume, removed: true, out, order: st.cases.map((c) => c.id), verdict: summary?.verdict ?? "INCOMPLETE" });
    return code;
  }
  throw new Error(`serial ${what}: open | case | repeat | close`);
}

async function innerSerial(args, out) {
  const what = args[0], home = process.env.LAYERFS_HOME, pos = opt(args, "--pos");
  const { LayerFS } = await import(join(REPO, "sdk/js/src/index.js"));
  const at = what === "case" || what === "repeat" ? pos : what;
  const lf = new LayerFS("dsh", { trace: join(out, `trace-${at}.jsonl`) });
  const label = (step) => { lf.options.traceStep = step; };
  const arms = [], record = (a) => { arms.push(a); writeFileSync(join(out, `arms-${at}.json`), JSON.stringify(arms, null, 1)); };
  let sb = existsSync(join(out, "sandbox")) ? readFileSync(join(out, "sandbox"), "utf8").trim() : null, ws = null;
  try {
    if (what === "open") {
      label("setup.create");
      sb = await sandbox(lf, [{ volume: PNPM, target: STORE_MOUNT }]);
      writeFileSync(join(out, "sandbox"), sb);
    } else if (what === "case") {
      const id = args[1], c = CASES[id];
      label("fork"); const branch = `cost-${id}-p${pos}`; await lf.branch.fork(branch, c.ref);
      label("lfs.mount"); ws = await lf.sandbox.mount(sb, branch);
      const steps = (c.steps ?? (c.arms ?? ["cold", "steady"]).map((arm) => [arm, c.cmd()])).filter(([s]) => s !== "steady" && !s.endsWith("-steady"));
      for (const [step, cmd] of steps) {
        label(`lfs.${step}.before`); await lf.sandbox.status(sb, ws);
        label(`lfs.${step}.exec`); const r = await lf.sandbox.exec(sb, ws, timed(".", cmd, c.cmp));
        label(`lfs.${step}.after`); await lf.sandbox.status(sb, ws);
        label(`lfs.${step}.rss`); const m = rssOf(await lf.sandbox.exec(sb, ws, RSS));
        record({ arm: "serial", case: id, pos: Number(pos), step, ...parse(r), daemonMem: m });
      }
      label("lfs.unmount"); await lf.sandbox.unmount(sb, ws, true); ws = null;
      record({ arm: "serial", case: id, pos: Number(pos), afterUnmount: await daemonProbe(home, sb) });
    } else if (what === "repeat") {
      // one case n times, each in a fresh Workspace on this daemon, the probe after each unmount
      const id = args[1], c = CASES[id], n = Number(opt(args, "--n"));
      record({ arm: "repeat", case: id, pos: Number(pos), i: 0, afterUnmount: await daemonProbe(home, sb) });
      for (let i = 1; i <= n; i++) {
        label(`r${i}.fork`); const branch = `cost-${id}-p${pos}-r${i}`; await lf.branch.fork(branch, c.ref);
        label(`r${i}.mount`); ws = await lf.sandbox.mount(sb, branch);
        const steps = (c.steps ?? (c.arms ?? ["cold", "steady"]).map((arm) => [arm, c.cmd()])).filter(([s]) => s !== "steady" && !s.endsWith("-steady"));
        const runs = [];
        for (const [step, cmd] of steps) { label(`r${i}.${step}.exec`); runs.push({ step, ...parse(await lf.sandbox.exec(sb, ws, timed(".", cmd, c.cmp))) }); }
        label(`r${i}.unmount`); await lf.sandbox.unmount(sb, ws, true); ws = null;
        record({ arm: "repeat", case: id, pos: Number(pos), i, runs: runs.map(({ head, ...r }) => r), afterUnmount: await daemonProbe(home, sb) });
      }
    } else if (what === "close") {
      await saveLog(out, home, sb);
      label("teardown.close"); await lf.sandbox.close(sb);
    }
  } catch (error) {
    record({ error: String(error?.stack ?? error), code: error?.code ?? null });
    if (ws) { try { label("teardown.unmount"); await lf.sandbox.unmount(sb, ws, true); } catch (e) { record({ teardown: String(e) }); } }
    process.exitCode = 1;
  } finally {
    await lf.close();
  }
}

/** Per case and step: the same before/after counter subtraction as `summarize`, within that case's trace. */
export function summarizeSerial(out, st) {
  const daemon = readFileSync(join(out, "daemon.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const byTrace = new Map(daemon.filter((g) => g.trace).map((g) => [g.trace, g]));
  const rows = [];
  for (const c of st.cases) {
    const lines = existsSync(join(out, `trace-${c.pos}.jsonl`)) ? traceLines(join(out, `trace-${c.pos}.jsonl`)) : [];
    const byStep = (s) => lines.filter((l) => String(l.step ?? "").replace(/#\d+$/, "") === s);
    const arms = existsSync(join(out, `arms-${c.pos}.json`)) ? JSON.parse(readFileSync(join(out, `arms-${c.pos}.json`), "utf8")) : [{ error: "no arms" }];
    for (const a of arms) {
      if (a.afterUnmount) {
        // the daemon's own Unmount record (written after the Workspace's reader and overlay closed);
        // sandbox.status needs a Workspace path, so there is no status call after the unmount
        const g = byStep(a.arm === "repeat" ? `r${a.i}.unmount` : "lfs.unmount")[0], gs = g && byTrace.get(g.id)?.sections;
        rows.push({ ...a, cache: gs?.immutable_cache ?? null, readers: gs?.store_readers ?? null, kernelMount: gs?.kernel_mount ?? null });
        continue;
      }
      if (!a.step) { rows.push({ case: c.id, pos: c.pos, ...a }); continue; }
      const [b, f] = [byStep(`lfs.${a.step}.before`)[0], byStep(`lfs.${a.step}.after`)[0]];
      const gb = b && byTrace.get(b.id), ga = f && byTrace.get(f.id);
      const counters = gb && ga ? Object.fromEntries(Object.keys(view(ga)).map((k) => [k, sub(view(gb)[k], view(ga)[k])])) : null;
      rows.push({ ...a, execMs: byStep(`lfs.${a.step}.exec`)[0]?.ms ?? null, mountMs: byStep("lfs.mount")[0]?.ms ?? null, cacheAfter: ga?.sections?.immutable_cache ?? null, counters });
    }
  }
  const failed = rows.some((r) => r.error || (r.exit != null && r.exit !== 0) || (r.runs ?? []).some((x) => x.error || x.exit !== 0));
  return { out, order: st.cases.map((c) => c.id), cases: st.cases, rows, verdict: failed ? "FAILED" : rows.some((r) => r.step && !r.counters) ? "INCOMPLETE" : "COMPLETE" };
}

// ---------------------------------------------------------------- main
async function main(argv) {
  const [cmd, ...args] = argv;
  if (cmd === "list") { for (const [id, c] of Object.entries(CASES)) console.log(`${id}\t${c.group}\t${c.kind ?? "exec"}`); return 0; }
  if (cmd === "prepare") return hostPrepare(args);
  if (cmd === "native") return hostNative(args);
  if (cmd === "case") return hostCase(args[0], args.slice(1));
  if (cmd === "table") { console.log(JSON.stringify(table(opt(args, "--label", "diagnostic"), opt(args, "--binary")), null, 1)); return 0; }
  if (cmd === "summarize") { console.log(JSON.stringify(summarize(args[0]), null, 1)); return 0; }
  if (cmd === "serial") return hostSerial(args);
  if (cmd === "inner" && args[0] === "serial") { await innerSerial(args.slice(1), opt(args, "--out")); return process.exitCode ?? 0; }
  if (cmd === "inner") { await inner(args); return process.exitCode ?? 0; }
  console.error("usage: cost.mjs list | prepare --binary <id> | native --binary <id> | case <id> --binary <id> [--label diagnostic|measured] | summarize <dir>");
  return 2;
}
if (import.meta.url === `file://${process.argv[1]}`) process.exit(await main(process.argv.slice(2)));
