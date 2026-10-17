// Converts a recorded application run into a replayed Live demo (issue #347):
//   node dsh/tools/import-run.mjs <format> <id> <store.json> key=value…
// <format> names the record's reader in import/ (shop, depot, crew); <store.json>
// is what restore-store.mjs printed for a restored copy of the run's stopped
// Store. Writes dsh/scenarios/<id>/: scenario.json, run/NNN.json (one per kept
// step), seed.json (the original Init's imported folder) and final.json (the
// tracked files of the recorded final main, and the recorded history for the
// order checks). The conversion formula is SPEC.md's (core/docs/issues/347).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, lstatSync, readlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { variesOf } from "./checks/gates.mjs";
import { historyOf } from "./checks/history.mjs";
import { readAll, trackedChanges, trackedHashes, trackedTree } from "./checks/tree.mjs";

const FORMATS = {
  shop: { read: async (i) => (await import("./import/shop.mjs")).readShop(i), title: "Shop", order: 7, blurb: "a builder agent's recorded run of a small web shop, from skeleton to admin page, over six milestones", target: 60, inputs: ["trace", "builder", "seed"] },
  depot: { read: async (i) => (await import("./import/depot.mjs")).readDepot(i), title: "Depot", order: 8, blurb: "a builder agent's recorded run of a Rust inventory service and its browser client", target: 240, inputs: ["receipts", "seed"] },
  crew: { read: async (i) => (await import("./import/crew.mjs")).readCrew(i), title: "Crew", order: 9, blurb: "a lead and its crew of agents building one application together, on Branches of their own", target: 480, inputs: ["steps", "archives", "seed"] },
};
const IMAGE = "sha256:091f785ba7d5d036dfa350e8fd69ee1fcd2d8320c3706841c8c95e6411eee9d2";
const WRITES = new Set(["fs.apply", "fs.write", "fs.edit", "fs.mkdir", "fs.rm", "fs.cp", "fs.mv"]);
const HISTORY = new Set(["branch.fork", "branch.merge", "branch.publish"]);
const WORKSPACE = new Set(["sandbox.mount", "sandbox.exec", "sandbox.commit", "sandbox.unmount"]);
const LIFE = new Set(["sandbox.create", "sandbox.close"]);
const OUTPUT_LINES = 12, OUTPUT_BYTES = 2048;

const [format, id, storeFile, ...rest] = process.argv.slice(2);
const kind = FORMATS[format];
if (!kind || !id || !storeFile) {
  console.error(`usage: import-run.mjs <${Object.keys(FORMATS).join("|")}> <id> <store.json> key=value…`);
  process.exit(2);
}
const inputs = Object.fromEntries(rest.map((pair) => [pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1)]));
for (const key of kind.inputs) if (!inputs[key]) throw new Error(`${format} needs ${key}=…`);
const out = fileURLToPath(new URL(`../scenarios/${id}/`, import.meta.url));

const store = JSON.parse(readFileSync(storeFile, "utf8"));
Object.assign(process.env, store.env);
const { LayerFS } = await import(store.sdk);
const { LayerFSOperator } = await import(new URL("../operator/index.js", `file://${store.sdk}`).href);
const lf = new LayerFS(store.project), operator = new LayerFSOperator(lf);

const fail = (message) => { throw new Error(`import-run ${id}: ${message}`); };
const kindOf = (call) => (call.ok === false ? call.code : call.kind ?? "ok");

try {
  const record = await kind.read(inputs);
  const history = await historyOf(lf, operator);
  const commits = new Map();
  for (const branch of await lfAll((s, p) => lf.project.list_branches(s, p))) {
    if (branch.name === "main") continue;
    for (const c of await lfAll((s, p) => lf.branch.list_commits(branch.name, s, p))) commits.set(c.id, c);
  }

  // the agents' own Sandboxes: those a Workspace was mounted in
  const agentBoxes = new Set();
  for (const step of record.steps) for (const c of step.calls) if (c.method === "sandbox.mount") agentBoxes.add(c.args.sandbox);
  // each mount's Workspace path: a Sandbox numbers its Workspaces in mount order
  const mountPaths = new Map();
  for (const box of agentBoxes) {
    const all = record.steps.flatMap((s) => s.calls).filter((c) => c.args.sandbox === box);
    const paths = [...new Set(all.map((c) => c.args.path).filter(Boolean))].sort((a, b) => num(a) - num(b));
    const mounts = all.filter((c) => c.method === "sandbox.mount");
    if (paths.length !== mounts.length) fail(`Sandbox ${box}: ${mounts.length} mounts but ${paths.length} Workspace paths`);
    mounts.forEach((m, i) => mountPaths.set(m, paths[i]));
  }

  const dropped = new Set(), optional = new Set(), kept = [], notes = [], extras = [], wsBranch = new Map();
  const lastEnd = new Map(), trees = new Map();
  const treeOf = (ref) => { if (!trees.has(ref)) trees.set(ref, trackedTree(lf, ref)); return trees.get(ref); };
  for (const step of record.steps) {
    const calls = [];
    for (const call of step.calls) {
      const m = call.method;
      if (m === "project.init") { lastEnd.set(step.agent, call.start + call.ms); continue; }
      if (WRITES.has(m)) {
        if (call.ok === false) fail(`${step.label}: a refused ${m} is not replayed yet`);
        const changes = await changesOf(call.commit, commits, treeOf);
        if (!changes.length) { dropped.add(call.commit); notes.push(`${step.label}: ${m} ${short(call.commit)} has no tracked content change; dropped`); continue; }
        calls.push({ op: "write", branch: call.args.branch, message: call.args.message ?? null, changes, commit: call.commit, expect: `fs.apply:${kindOf(call)}` });
      } else if (HISTORY.has(m)) {
        const a = call.args;
        if (m === "branch.fork") calls.push({ op: "fork", name: a.name, from: refOf(a.from ?? "main", history.ids), expect: `${m}:${kindOf(call)}` });
        if (m === "branch.merge") calls.push({ op: "merge", a: a.branch, b: a.with, name: a.name, message: a.message ?? null, expect: `${m}:${kindOf(call)}` });
        if (m === "branch.publish") calls.push({ op: "publish", branch: a.branch, commit: a.commit ? refOf(a.commit, history.ids) : null, expect: `${m}:${kindOf(call)}` });
      } else if (LIFE.has(m)) {
        if (m === "sandbox.close" && !agentBoxes.has(call.args.sandbox)) continue; // the service Sandbox; each call closes its own
        calls.push({ op: m === "sandbox.create" ? "create" : "close", expect: `${m}:${kindOf(call)}` });
      } else if (WORKSPACE.has(m)) {
        const ws = m === "sandbox.mount" ? mountPaths.get(call) : call.args.path;
        if (m === "sandbox.mount") { wsBranch.set(`${call.args.sandbox} ${ws}`, call.args.branch); calls.push({ op: "mount", branch: call.args.branch, ws, expect: `${m}:${kindOf(call)}` }); }
        if (m === "sandbox.unmount") calls.push({ op: "unmount", ws, discard: call.args.discard === true, expect: `${m}:${kindOf(call)}` });
        if (m === "sandbox.exec") calls.push(execOf(step, call, ws, notes));
        if (m === "sandbox.commit") {
          let expect = `${m}:${kindOf(call)}`;
          if (call.ok && call.kind === "Committed" && call.commit && await generatedOnly(call.commit, commits, treeOf)) {
            expect = `${m}:Committed|UpToDate`;
            optional.add(call.commit);
          }
          // a recorded UpToDate may come back Committed when the command touched
          // only generated files (cargo's cache tracker writes last-use times
          // only once enough wall time has passed); replay.mjs and the order
          // check verify that such a Commit changes no tracked file
          const generated = call.ok && call.kind === "UpToDate";
          if (generated) {
            expect = `${m}:UpToDate|Committed`;
            extras.push({ branch: wsBranch.get(`${call.args.sandbox} ${ws}`), message: call.args.message ?? null, head: call.commit ?? null });
          }
          calls.push({ op: "commit", ws, message: call.args.message ?? null, force: call.args.force === true, commit: call.commit ?? null, expect, ...(generated ? { generated: true } : {}) });
        }
      }
      // reads, sandbox.service, status and operator calls are dropped
    }
    const end = Math.max(...step.calls.map((c) => c.start + c.ms));
    if (!calls.length) continue;
    const start = Math.min(...step.calls.map((c) => c.start));
    const gap = Math.max(0, start - (lastEnd.get(step.agent) ?? start));
    lastEnd.set(step.agent, end);
    kept.push({ step, calls, gap, ms: Math.round(end - start) });
  }

  // Every replayed Store call goes through its agent's own Sandbox: the service
  // Sandbox is shared with the Host's reads, whose discovery lock would refuse
  // one of them as Busy depending on timing. So an agent's recorded create
  // that comes after its first Store call moves to just before that call.
  for (const agent of new Set(kept.map((s) => s.step.agent))) {
    const mine = kept.filter((s) => s.step.agent === agent);
    const at = (pred) => { for (const s of mine) { const i = s.calls.findIndex(pred); if (i >= 0) return { s, i }; } return null; };
    const first = at((c) => ["fork", "merge", "publish", "write"].includes(c.op)), create = at((c) => c.op === "create");
    if (!first) continue;
    if (!create) fail(`${agent} makes Store calls but never creates a Sandbox`);
    if (kept.indexOf(create.s) < kept.indexOf(first.s) || (create.s === first.s && create.i < first.i)) continue;
    const [call] = create.s.calls.splice(create.i, 1);
    first.s.calls.splice(first.s.calls.indexOf(first.s.calls[first.i]), 0, call);
    notes.push(`${agent}: its Sandbox is created before its first Store call (${first.s.step.label}), not at ${create.s.step.label}`);
    if (!create.s.calls.length) kept.splice(kept.indexOf(create.s), 1);
  }
  for (const s of kept) {
    const close = s.calls.findIndex((c) => c.op === "close");
    const after = kept.slice(kept.indexOf(s)).flatMap((x) => (x === s ? x.calls.slice(close + 1) : x.calls)).filter((c) => s.step.agent && ["fork", "merge", "publish", "write"].includes(c.op));
    if (close >= 0 && after.length && kept.some((x) => x.step.agent === s.step.agent && x.calls.includes(after[0]))) fail(`${s.step.agent} makes Store calls after closing its Sandbox`);
  }

  // pauses: clamp(gap × k, 400, 3000), k chosen so they sum to the target thinking time
  const target = kind.target * 1000, pause = (k, gap) => Math.round(Math.min(3000, Math.max(400, gap * k)));
  let lo = 0, hi = 1;
  while (kept.reduce((n, s) => n + pause(hi, s.gap), 0) < target && hi < 1e6) hi *= 2;
  for (let i = 0; i < 60; i++) { const k = (lo + hi) / 2; if (kept.reduce((n, s) => n + pause(k, s.gap), 0) < target) lo = k; else hi = k; }

  if (existsSync(out)) rmSync(out, { recursive: true });
  mkdirSync(join(out, "run"), { recursive: true });
  const root = [];
  kept.forEach((s, i) => {
    const n = String(i + 1).padStart(3, "0");
    const execs = s.calls.filter((c) => c.op === "exec"), writes = s.calls.filter((c) => c.op === "write");
    const file = {
      step: s.step.label, agent: s.step.agent,
      kind: execs.length ? "replay" : writes.length ? "write" : "history",
      branch: s.calls.find((c) => c.branch)?.branch ?? null,
      writes: writes.length ? Object.fromEntries(writes.flatMap((w) => w.changes.map((c) => [c.path, c.op === "write" ? c.content : c.op === "rm" ? null : "<dir>"]))) : null,
      command: execs[0]?.command ?? null, exit: execs[0]?.exit ?? null, output: execs[0]?.output ?? null,
      ms: s.ms, expect: s.calls.map((c) => c.expect), calls: s.calls,
    };
    writeFileSync(join(out, "run", `${n}.json`), JSON.stringify(file, null, 1) + "\n");
    const inner = execs.reduce((t, c) => t + (innerTimeout(c.command) ?? 110), 0);
    root.push({ pause: pause(hi, s.gap) });
    root.push({
      bash: { description: s.step.label, run: [["step", id, n]], ...(inner ? { timeoutMs: (inner + 60) * 1000 } : {}) },
      expect: file.expect, phase: phaseOf(s.step.label),
    });
  });

  // the recorded history without the dropped Commits; an optional one may be missing
  const recorded = { branches: {}, layers: history.layers };
  const byRef = new Map([...history.ids].map(([cid, ref]) => [ref, cid]));
  for (const [branch, b] of Object.entries(history.branches)) {
    recorded.branches[branch] = {
      forkedFrom: b.forkedFrom,
      commits: b.commits.map((c, i) => ({ ...c, id: byRef.get(`${branch}#${i}`) }))
        .filter((c) => !dropped.has(c.id))
        .map(({ id: cid, ...c }) => (optional.has(cid) ? { ...c, optional: true } : c)),
    };
  }
  if (dropped.size) notes.push(`history: ${dropped.size} dropped Commit(s) are left out of the order checks`);
  // where a run may hold an extra generated-only Commit: after the head the recorded UpToDate saw
  for (const e of extras) {
    const branch = recorded.branches[e.branch] ?? fail(`an UpToDate Commit on ${e.branch}, which is not in the history`);
    const ref = e.head && history.ids.get(e.head);
    const k = ref?.startsWith(`${e.branch}#`) ? Number(ref.slice(e.branch.length + 1)) : -1;
    const after = history.branches[e.branch].commits.slice(0, k + 1).filter((_, i) => !dropped.has(byRef.get(`${e.branch}#${i}`))).length - 1;
    (branch.extras ??= []).push({ after, message: e.message });
  }
  // main's files hashed by their bytes, in a Workspace of a Sandbox of the converter's own
  const hasher = await lf.sandbox.create(`${store.project}-import`.slice(0, 63), store.project, store.env.LAYERFS_IMAGE);
  let final;
  try { final = await trackedHashes(new LayerFS(store.project, { sandbox: hasher }), hasher); } finally { await lf.sandbox.close(hasher); }
  writeFileSync(join(out, "final.json"), JSON.stringify({ main: final.files, varies: variesOf(final.files), history: recorded }, null, 1) + "\n");
  writeFileSync(join(out, "seed.json"), JSON.stringify(seedOf(inputs.seed), null, 1) + "\n");
  const scenario = {
    type: "layerfs-mock-scenario", version: 2, title: kind.title, order: kind.order, speed: 1,
    blurb: record.blurb ?? `Replays ${kind.blurb}. Every recorded write is applied and every recorded command runs again in a Workspace.`,
    live: true, image: IMAGE, seed: "seed.json", lib: "../shared/replay.mjs",
    agents: { root, ...(record.agents ?? {}) },
  };
  writeFileSync(join(out, "scenario.json"), JSON.stringify(scenario, null, 1) + "\n");
  for (const note of notes) console.log(note);
  console.log(`${id}: ${kept.length} steps, ${kept.reduce((n, s) => n + s.calls.filter((c) => c.op === "exec").length, 0)} commands, pauses ${Math.round(kept.reduce((n, s) => n + pause(hi, s.gap), 0) / 1000)} s, ${Object.keys(final.files).length} tracked files on main`);
} finally {
  for (const sandbox of [...lf.sandboxes]) await lf.sandbox.close(sandbox);
}

async function lfAll(read) {
  const items = [];
  for (let pos = 0; ;) { const page = await read(1000, pos); items.push(...page.items); if (!page.hasMore) return items; pos += page.items.length; }
}
function num(path) { return Number(String(path).split("/").pop()); }
function short(cid) { return String(cid).slice(0, 12); }
function refOf(ref, ids) { return ref === "main" ? "main" : ids.get(ref) ?? fail(`unknown ref ${ref}`); }
function phaseOf(label) { return label.replace(/^[0-9]+[-\s]*/, "").replace(/[-:].*$/, "").trim() || null; }
function innerTimeout(command) { const m = /\btimeout\s+(?:-[a-zA-Z]+\s+\S+\s+)*([0-9]+)/.exec(command ?? ""); return m ? Number(m[1]) : null; }

/** The exec call of a recorded command: verbatim, the recorded Workspace path made $PWD. */
function execOf(step, call, ws, notes) {
  const path = call.args.path, command = String(call.command ?? call.args.command);
  if (command.endsWith("…")) fail(`${step.label}: the record has only a shortened command`);
  const replaced = command.replace(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![0-9])`, "g"), "$PWD");
  if (/\/(Users|private|var\/folders|home)\//.test(replaced)) fail(`${step.label}: the command names a host path`);
  const inner = innerTimeout(replaced);
  if (inner === null) {
    if (call.ms > 10_000) fail(`${step.label}: a command without an inner timeout ran ${Math.round(call.ms)} ms`);
    notes.push(`${step.label}: a command without an inner timeout (recorded ${Math.round(call.ms)} ms); the bash call's own timeout bounds it`);
  } else if (inner > 110) fail(`${step.label}: inner timeout ${inner} s is over 110 s`);
  const exit = /^exit:(-?[0-9]+)$/.exec(call.kind ?? "")?.[1];
  if (call.ok === false || exit === undefined) fail(`${step.label}: exec ended ${kindOf(call)}`);
  const lines = String(call.output ?? "").trimEnd().split("\n").slice(-OUTPUT_LINES).join("\n");
  return { op: "exec", ws, command: replaced, message: call.args.message ?? null, exit: Number(exit), output: Buffer.from(lines).subarray(-OUTPUT_BYTES).toString(), ms: Math.round(call.ms), expect: `sandbox.exec:exit:${exit}` };
}

/** A write Commit's tracked changes, from the Store: what its fs.apply replays. */
async function changesOf(commitId, commits, treeOf) {
  const commit = commits.get(commitId) ?? fail(`no Commit ${commitId} in the Store`);
  const items = await trackedChanges(lf, commit, treeOf);
  const removed = items.filter((i) => i.kind === "Removed").map((i) => i.path);
  const top = removed.filter((p) => !removed.some((q) => q !== p && p.startsWith(`${q}/`)));
  const changes = [];
  for (const i of items.filter((i) => i.kind === "Added" && i.type === "dir").sort((x, y) => x.path.length - y.path.length)) changes.push({ op: "mkdir", path: i.path });
  for (const i of items) {
    if (i.kind === "Removed" || i.type === "dir") continue;
    if (i.type !== "file") fail(`${i.path}: a ${i.type} write is not replayed yet`);
    const read = await readAll(lf, commitId, i.path);
    if (read.problem) fail(`${i.path} at ${short(commitId)}: ${read.problem}`);
    changes.push({ op: "write", path: i.path, content: read.text });
  }
  for (const path of top) changes.push({ op: "rm", path });
  return changes;
}

/** Whether every change a command's Commit made is to a path .gitignore excludes. */
async function generatedOnly(commitId, commits, treeOf) {
  const commit = commits.get(commitId);
  return commit ? (await trackedChanges(lf, commit, treeOf)).length === 0 : false;
}

/** The original Init's imported folder as data: every entry, its mode and its content. */
function seedOf(folder) {
  const entries = {};
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name), rel = `/${relative(folder, path)}`, st = lstatSync(path);
      if (st.isSymbolicLink()) entries[rel] = { type: "symlink", target: readlinkSync(path) };
      else if (st.isDirectory()) { entries[rel] = { type: "dir", mode: st.mode & 0o7777 }; walk(path); }
      else {
        const bytes = readFileSync(path), text = bytes.toString("utf8");
        entries[rel] = Buffer.from(text).equals(bytes) ? { type: "file", mode: st.mode & 0o7777, text } : { type: "file", mode: st.mode & 0o7777, base64: bytes.toString("base64") };
      }
    }
  };
  if (!statSync(folder).isDirectory()) fail(`seed ${folder} is not a folder`);
  walk(folder);
  return { format: "layerfs-demo-seed", version: 1, sha256: createHash("sha256").update(JSON.stringify(entries)).digest("hex"), entries };
}
