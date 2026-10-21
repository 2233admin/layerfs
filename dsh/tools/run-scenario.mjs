// Plays a scenario headlessly against Live LayerFS, without dsh web or the mock
// model, for development runs (issue #347):
//   node dsh/tools/run-scenario.mjs <scenario> --out <dir> [--pace] [--keep] [--wait <s>]
// It Inits a new project from the scenario's seed (else the demo workspace),
// then runs every agent's steps as the mock model would hand them to dsh: a
// bash step runs its command with the environment the Host gives a bound
// session; `subagent` starts a child, whose turn runs until its reply;
// `send_message` starts the child's next turn; a reply with `until` waits for
// those children's turns to end. Agents run at the same time. Pauses are
// skipped unless --pace: order comes only from those waits, never from time.
// The first failed bash call stops the run. Then the gates run (checks/gates.mjs;
// closed waits up to --wait seconds, default 150, for the Sandboxes to close)
// and <out>/<run>/receipt.json records everything. The project and its volume
// are removed afterwards unless --keep.
import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadScenario } from "../packages/mock/src/scenario.js";
import { seedFolder } from "../packages/mock/src/seed.js";
import { expectedOutcomes, finalTreeFailures, openContainers, orderFailures, volumeContainers } from "./checks/gates.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const id = args[0], outDir = option("--out"), waitS = Number(option("--wait") ?? 150);
if (!id || !outDir) { console.error("usage: run-scenario.mjs <scenario> --out <dir> [--pace] [--keep] [--wait <s>]"); process.exit(2); }

const repo = fileURLToPath(new URL("../../", import.meta.url));
const scenarioDir = fileURLToPath(new URL(`../scenarios/${id}`, import.meta.url));
const scenario = loadScenario(scenarioDir);
const stamp = Date.now().toString(36);
const project = `run-${id}-${stamp}`, volume = `lfs-run-${id}-${stamp}`;
const runDir = resolve(outDir, project), home = resolve(outDir, "home"), traces = join(runDir, "traces");
mkdirSync(traces, { recursive: true });
mkdirSync(home, { recursive: true, mode: 0o700 });
const sdk = pathToFileURL(join(repo, "sdk/js/src/index.js")).href;
const deploy = {
  HOME: home, DOCKER: "/var/run/docker.sock", IMAGE: scenario.image ?? process.env.LAYERFS_IMAGE,
  VOLUME: volume, DAEMON: join(repo, "core/target/cluster2-linux/release/layerfs-daemon"),
};
const receipt = { scenario: id, project, volume, image: deploy.IMAGE, daemon: deploy.DAEMON, pace: flag("--pace"), started: new Date().toISOString(), steps: [], gates: {} };
const log = (text) => { console.log(text); appendFileSync(join(runDir, "run.log"), `${text}\n`); };
const save = () => writeFileSync(join(runDir, "receipt.json"), JSON.stringify(receipt, null, 1));

// ------------------------------------------------------------------ Init
const source = scenario.seed ? seedFolder(scenario.seed, resolve(outDir, "seeds"), id) : scenario.fixture;
for (const [k, v] of Object.entries(deploy)) process.env[`LAYERFS_${k}`] = v;
process.env.LAYERFS_CONSTRUCTION_WORKERS = "1";
const { LayerFS } = await import(sdk);
const { LayerFSOperator } = await import(pathToFileURL(join(repo, "sdk/js/operator/index.js")).href);
execFileSync("docker", ["volume", "create", volume], { stdio: "ignore" });
const t0 = Date.now();
await new LayerFS(project).project.init(source);
log(`Init ${project} from ${source} · ${Date.now() - t0} ms`);

// ------------------------------------------------------------------ agents
const env = (agent, step) => ({
  ...process.env,
  DSH_LAYERFS_PROJECT: project, DSH_LAYERFS_SDK: sdk,
  DSH_LAYERFS_OPERATOR: pathToFileURL(join(repo, "sdk/js/operator/index.js")).href,
  ...Object.fromEntries(Object.entries(deploy).map(([k, v]) => [`DSH_LAYERFS_${k}`, v])),
  DSH_LAYERFS_TRACE: join(traces, `${agent}.jsonl`), DSH_LAYERFS_TRACE_STEP: step, DSH_LAYERFS_TRACE_START: "1",
  LAYERFS_CONSTRUCTION_WORKERS: "1",
});
const running = new Set();
let failed = null, calls = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function bash(agent, step) {
  const label = `call-${String(++calls).padStart(4, "0")}`, started = Date.now();
  const timeout = step.call.args.timeoutMs ?? 120_000;
  return new Promise((done) => {
    const child = spawn("bash", ["-c", step.call.args.command], { cwd: runDir, env: env(agent, label), stdio: ["ignore", "pipe", "pipe"] });
    running.add(child);
    let out = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { out += d; });
    const timer = setTimeout(() => child.kill("SIGKILL"), timeout);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      running.delete(child);
      const entry = { agent, at: step.at, label, description: step.call.args.description, exit: code, signal, ms: Date.now() - started };
      receipt.steps.push(entry);
      writeFileSync(join(runDir, `${label}.out`), out);
      log(`${agent} ${label} ${step.call.args.description} · exit ${code ?? signal} · ${entry.ms} ms`);
      if (code !== 0) log(out.split("\n").slice(-15).join("\n"));
      done(code === 0);
    });
  });
}

/** One agent: its turns, as the mock model hands out its steps. */
function agentOf(name) {
  const steps = scenario.agents[name];
  const state = { name, index: 0, turn: null, wake: null };
  state.runTurn = () => {
    let end;
    state.turn = new Promise((r) => { end = r; });
    (async () => {
      while (!failed && state.index < steps.length) {
        const step = steps[state.index++];
        if (flag("--pace") && step.delay) await sleep(step.delay);
        if (step.kind === "reply") {
          if (step.until.length) { await Promise.all(step.until.map((c) => agents.get(c).turn)); continue; }
          break; // the turn ends; a child's next starts with a message
        }
        const { name: tool, args: a } = step.call;
        if (tool === "bash") { if (!(await bash(name, step))) failed ??= `${step.at} (${a.description}) failed`; }
        else if (tool === "subagent") { const child = agentOf(step.call.child); agents.set(step.call.child, child); child.runTurn(); }
        else if (tool === "send_message") agents.get(step.call.refs.agent_id.agent).runTurn();
        else throw new Error(`${step.at}: ${tool} is not played headlessly`);
      }
      end();
    })().catch((error) => { failed ??= String(error); end(); });
    return state.turn;
  };
  return state;
}
const agents = new Map([["root", agentOf("root")]]);
const t1 = Date.now();
await agents.get("root").runTurn();
// children still in a turn finish it (a failure stops them at their next step)
await Promise.all([...agents.values()].map((a) => a.turn));
for (const child of running) child.kill("SIGKILL");
receipt.played = { ms: Date.now() - t1, failed, steps: [...agents.values()].map((a) => ({ agent: a.name, done: a.index, of: scenario.agents[a.name].length })) };
log(failed ? `STOPPED: ${failed}` : `played every step in ${Date.now() - t1} ms`);
save();

// ------------------------------------------------------------------ gates
const lines = (agent) => {
  const file = join(traces, `${agent}.jsonl`);
  return existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((l) => l.phase !== "start") : [];
};
const gate = (name, failures, extra = {}) => {
  receipt.gates[name] = { pass: failures.length === 0, failures, ...extra };
  log(`${failures.length ? "FAIL" : "PASS"} ${name}${failures.length ? `\n  ${failures.slice(0, 20).join("\n  ")}` : ""}`);
};
gate("finished", failed ? [failed] : [...agents.values()].filter((a) => a.index < scenario.agents[a.name].length).map((a) => `${a.name} stopped at ${a.index} of ${scenario.agents[a.name].length}`));
const expected = expectedOutcomes(scenario, lines);
gate("expected", expected.failures, { notes: expected.notes });
const finalFile = join(scenarioDir, "final.json");
if (existsSync(finalFile)) {
  const final = JSON.parse(readFileSync(finalFile, "utf8"));
  const lf = new LayerFS(project);
  try {
    gate("order", await orderFailures(final, lf, new LayerFSOperator(lf)));
    const tree = await finalTreeFailures(final, lf);
    gate("final tree", tree.failures, { files: tree.files, varies: tree.varies });
  } finally {
    await lf.close();
  }
}
// readiness wait: each Sandbox closes itself two minutes after its last Workspace is unmounted
let open = openContainers(volume);
for (const until = Date.now() + waitS * 1000; open.length && Date.now() < until; open = openContainers(volume)) await sleep(2000);
gate("closed", open.map((c) => `${c} still uses ${volume}`));
receipt.ended = new Date().toISOString();
receipt.pass = Object.values(receipt.gates).every((g) => g.pass);
save();
log(`${receipt.pass ? "PASS" : "FAIL"} ${id} · receipt ${join(runDir, "receipt.json")}`);
if (!flag("--keep") && openContainers(volume).length === 0) {
  // the run's Sandboxes closed themselves; their stopped containers go with the volume
  const stopped = volumeContainers(volume).map((line) => line.split(" ")[0]);
  if (stopped.length) execFileSync("docker", ["rm", ...stopped], { stdio: "ignore" });
  execFileSync("docker", ["volume", "rm", volume], { stdio: "ignore" });
  rmSync(join(home, project), { recursive: true, force: true });
  log(`removed ${project} and ${volume}`);
}
process.exit(receipt.pass ? 0 : 1);
