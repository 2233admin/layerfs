// The demo stories' tool calls, after the simulation engine's terminals (dsh/sim/demo.js):
// each export is one line typed at a terminal there, made of the same SDK
// calls, and prints what the terminal printed. A scenario step's bash `run`
// imports this file and awaits these in order (scenario.js).
//   history("fork checkout" | "fork header from C4" | "merge a b as c" | "publish b")
//   fs(branch, "write" | "edit" | "mkdir" | "blame", path, ...)   one Commit (or a read)
//   open(as, branch), split(from, as)        a Workspace terminal: a new Workspace of
//                                            the Branch, or a second one of `from`'s
//                                            (LayerFS places each in one of the
//                                            project's Sandboxes, #373)
//   term(as, line)   "commit [--force]", "unmount [--discard]", "stop", or a shell
//                    line (a trailing & starts a background process)
//   sandbox(branch)  prints that LayerFS places the Branch's agents' Workspaces
//   call(agent, branch, line, { type, run }?)   an agent's Bash tool call: a
//                    Workspace of its own of the Branch, mounted, run,
//                    committed and unmounted; after a Conflict it is kept and the
//                    agent's next call runs in it; a trailing & keeps it for the
//                    server, and "stop" ends the server. It takes the original's
//                    typing and running time.
//   closeAll()       prints that the Sandboxes close themselves when idle
// What a later call needs (a terminal's Workspace, an agent's kept one, C<n>
// labels) is kept under the project's LayerFS home entry, which is removed
// with the project.
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const project = process.env.DSH_LAYERFS_PROJECT;
if (!project) { console.log("no LayerFS project in this conversation"); process.exit(1); }
const { LayerFS, isRefusal } = await import(process.env.DSH_LAYERFS_SDK);
const lf = new LayerFS(project);
let operator;
const op = () => (operator ??= import(process.env.DSH_LAYERFS_OPERATOR).then(({ LayerFSOperator }) => new LayerFSOperator(lf)));

// ------------------------------------------------------------------ notes
const NOTES = join(process.env.DSH_LAYERFS_HOME, project, "demo-notes");
const note = (key) => { try { return JSON.parse(readFileSync(join(NOTES, `${key}.json`), "utf8")); } catch { return null; } };
function keep(key, value) {
  const file = join(NOTES, `${key}.json`);
  if (value === null) return rmSync(file, { force: true });
  mkdirSync(NOTES, { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify(value));
  renameSync(`${file}.tmp`, file);
}
/** C<n>: the n-th Commit these calls made, by time, as History numbers them. */
function label(id, time = Date.now()) {
  if (!id) return "?";
  if (!String(id).startsWith("12")) return "a Layer of main"; // not a Commit id
  const dir = join(NOTES, "commits");
  mkdirSync(dir, { recursive: true });
  try { time = Number(readFileSync(join(dir, id), "utf8")); } catch { writeFileSync(join(dir, id), String(time)); }
  const all = readdirSync(dir).filter((f) => !f.endsWith(".tmp")).map((f) => [Number(readFileSync(join(dir, f), "utf8")), f]);
  return `C${all.filter(([t, f]) => t < time || (t === time && f <= id)).length}`;
}
function idOf(ref) {
  const n = /^C(\d+)$/.exec(ref)?.[1];
  if (!n) return ref;
  const dir = join(NOTES, "commits");
  const all = readdirSync(dir).map((f) => [Number(readFileSync(join(dir, f), "utf8")), f]).sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]));
  return all[n - 1]?.[1] ?? ref;
}
const committed = (r) => label(r.commit?.id ?? r.head, r.commit?.time);

// ------------------------------------------------------------------ calls
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Busy without processes: another agent is changing LayerFS right now. Wait and try again.
async function settle(call) {
  for (let attempt = 1; ; attempt++) {
    try { return await call(); } catch (error) {
      if (!isRefusal(error, "Busy") || error.detail?.processes?.length || attempt === 8) throw error;
      await sleep(750 * attempt);
    }
  }
}
/** Runs a terminal line: a refusal is printed as the terminal did, anything else fails the call. */
async function line(work) {
  try { return await work(); } catch (error) {
    if (!error.code) { console.log(`✕ ${error.message}`); process.exitCode = 1; return null; }
    refused(error);
    return null;
  }
}
function refused(error) {
  console.log(`✕ ${String(error.message).startsWith(error.code) ? error.message : `${error.code}: ${error.message}`}`);
  for (const c of error.detail?.conflicts ?? []) {
    console.log(`  ${c.path}`);
    for (const h of c.hunks ?? []) {
      for (const t of h.ours ?? []) console.log(`    ours   ${h.line ?? ""}: ${t.trim()}`);
      for (const t of h.theirs ?? []) console.log(`    theirs ${h.line ?? ""}: ${t.trim()}`);
    }
  }
}
const abs = (path) => (path.startsWith("/") ? path : `/${path}`);
const lwwLines = (lww) => { if (lww?.length) console.log(`  last writer won ${lww.length} path(s): ${lww.slice(0, 4).map((x) => x.path ?? x).join(", ")}${lww.length > 4 ? ", …" : ""}`); };

export const history = (text) => line(async () => {
  const words = text.trim().split(/\s+/), [verb] = words;
  if (verb === "fork") {
    const [, name, from, ref] = words;
    const r = await settle(() => (from === "from" ? lf.branch.fork(name, idOf(ref)) : lf.branch.fork(name)));
    console.log(`✓ fork ${r.branch ?? name} from ${ref ?? "main"}`);
  } else if (verb === "merge") {
    const [, a, b, as, name] = words;
    if (as !== "as") throw new Error("usage: merge <a> <b> as <name>");
    const r = await settle(() => lf.branch.merge(a, b, name));
    console.log(`✓ merge ${a} + ${b} → ${name} · ${r.fastForward ? "fast-forward to" : "first Commit"} ${label(r.head)}`);
    lwwLines(r.lww);
  } else if (verb === "publish") {
    const r = await settle(() => lf.branch.publish(words[1]));
    console.log(r.kind === "Added" ? `✓ publish ${words[1]} → main · a new Layer${r.overwrote?.length ? ` · overwrote ${r.overwrote.length} Layer(s) of main` : ""}` : `= ${r.kind}`);
  } else throw new Error(`history: fork, merge or publish, not ${verb}`);
});

export const fs = (branch, verb, path, ...rest) => line(async () => {
  const p = abs(path);
  if (verb === "blame") {
    const r = await lf.fs.blame(branch, p);
    let last = null;
    for (const l of r.lines) {
      const who = l.commit === last ? "·" : String(l.commit).startsWith("12") ? `${label(l.commit)} ${l.message ?? ""}`.trim() : "init";
      last = l.commit;
      console.log(`${who.padEnd(28).slice(0, 28)} ${String(l.n).padStart(3)} │ ${l.text}`);
    }
    return console.log(`from ${r.versions} saved version(s) · fs.blame`);
  }
  const message = `${verb} ${p}`;
  const r = await settle(() => (verb === "write" ? lf.fs.write(branch, p, rest[0], message)
    : verb === "edit" ? lf.fs.edit(branch, p, rest[0], rest[1], message)
    : verb === "mkdir" ? lf.fs.mkdir(branch, p, message)
    : Promise.reject(new Error(`fs: write, edit, mkdir or blame, not ${verb}`))));
  console.log(r.kind === "Committed" ? `✓ ${verb} ${p} · ${committed(r)} on ${branch}` : `= ${r.kind}`);
});

// ------------------------------------------------------------------ Sandbox terminals
const termOf = (as) => { const t = note(`term-${as}`); if (!t) throw new Error(`no terminal ${as}`); return t; };
/** A new Workspace of `branch`, `{ sandbox, path }`: LayerFS places it in one of the project's Sandboxes. */
const mount = (branch) => settle(() => lf.workspace.mount(branch));
/** A note's Workspace, as the SDK takes it. */
const wsOf = (t) => ({ sandbox: t.sandbox, path: t.path });

export const open = (as, branch) => line(async () => {
  const ws = await mount(branch);
  keep(`term-${as}`, { ...ws, branch, ran: [] });
  console.log(`● ${as}: Sandbox ${ws.sandbox} · mount ${branch} → ${ws.path}`);
});

export const split = (from, as) => line(async () => {
  const { branch } = termOf(from);
  const ws = await mount(branch);
  keep(`term-${as}`, { ...ws, branch, ran: [] });
  console.log(`● ${as}: a second Workspace of ${branch} · Sandbox ${ws.sandbox} → ${ws.path}`);
});

export const term = (as, text) => line(async () => {
  const t = termOf(as), cmd = text.trim(), [verb, flag] = cmd.split(/\s+/);
  if (verb === "commit") {
    const r = await commit(wsOf(t), t.ran.length ? `${as}: ${t.ran.join("; ")}` : `${as}: commit`, flag === "--force");
    if (!r.refused) keep(`term-${as}`, { ...t, ran: [] });
  } else if (verb === "unmount") {
    await settle(() => lf.workspace.unmount(wsOf(t), flag === "--discard"));
    keep(`term-${as}`, null);
    console.log(`✓ unmounted ${t.path} · ${as} closed`);
  } else if (verb === "stop") {
    for (const id of t.processes ?? []) {
      const r = await (await op()).process.cancel(id);
      console.log(`■ ${id} ${r.status}`);
    }
    keep(`term-${as}`, { ...t, processes: [] });
  } else {
    const r = await shell(wsOf(t), cmd);
    keep(`term-${as}`, { ...t, ran: [...t.ran, cmd], processes: [...(t.processes ?? []), ...(r.process ? [r.process] : [])] });
  }
});

/** A shell line in Workspace `ws`: exec, or a background process for a trailing &. */
async function shell(ws, cmd) {
  console.log(`$ ${cmd}`);
  const background = /&\s*$/.test(cmd);
  if (background) {
    const r = await (await op()).process.start(ws, cmd.replace(/&\s*$/, "").trim());
    console.log(`● ${r.process} running · ${ws.path} stays mounted while it runs`);
    return r;
  }
  const r = await lf.workspace.exec(ws, cmd);
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trimEnd();
  if (out) console.log(out);
  console.log(`[exit ${r.exitCode}]`);
  return r;
}

/** Commit, printed as the terminals did: a stale Workspace merges with the head first; a Conflict is returned as { refused }. */
async function commit(ws, message, force = false) {
  let r;
  try { r = await settle(() => lf.workspace.commit(ws, message, force)); } catch (error) {
    if (!isRefusal(error, "Conflict")) throw error;
    refused(error);
    console.log(error.detail?.markers ? "  remove every <<<<<<< ======= >>>>>>> block, then commit" : `  nothing committed · the merge is written into ${ws.path} with markers`);
    return { refused: error };
  }
  if (r.kind !== "Committed") { console.log("= nothing to commit"); return r; }
  console.log(`✓ commit ${committed(r)}${r.merged ? ` · was stale on ${label(r.merged.from)}, merged with the head ${label(r.merged.head)}` : ""}`);
  lwwLines(r.lww);
  return r;
}

// ------------------------------------------------------------------ agents
export const sandbox = (branch) => line(async () => {
  console.log(`● ${branch}: each agent call mounts a Workspace of its own; LayerFS places it in the project's Sandboxes`);
});

// When the original's calls ran (dsh/sim/demo.js schedule): typing, then running.
// LAYERFS_DEMO_FAST=1 (development runs) skips both: order comes from the
// scenario's waits, never from time.
const FAST = process.env.LAYERFS_DEMO_FAST === "1";
const RUN = [[/install\.sh/, 2600], [/build\.sh/, 2000], [/test\.sh/, 1300], [/&\s*$/, 700], [/^(cat|ls|curl)/, 450]];
const runMs = (cmd) => (RUN.find(([re]) => re.test(cmd)) ?? [0, 650])[1];
const typeMs = (cmd) => Math.min(1100, 260 + cmd.length * 6);

export const call = (agent, branch, text, timing = {}) => line(async () => {
  const st = note(`agent-${agent}`) ?? {}, cmd = text.trim();
  if (cmd === "stop") {
    if (!st.server) return console.log("no background process to stop");
    const { sandbox: sb, path, processes } = st.server;
    for (const id of processes) await (await op()).process.cancel(id);
    await settle(() => lf.workspace.unmount({ sandbox: sb, path }, true));
    keep(`agent-${agent}`, { ...st, server: null });
    return console.log(`■ stopped · unmounted ${path} · its uncommitted dev cache discarded`);
  }
  let ws = st.sticky;
  if (ws) console.log(`⟳ ${ws.path} · kept after the conflict`);
  else {
    ws = await mount(branch);
    console.log(`⟳ mount ${branch} → ${ws.path}`);
  }
  if (!FAST) await sleep(timing.type ?? typeMs(cmd));
  const started = Date.now(), r = await shell(ws, cmd);
  if (r.process) return keep(`agent-${agent}`, { ...st, sticky: null, server: { ...ws, processes: [r.process] } });
  if (!FAST) await sleep((timing.run ?? runMs(cmd)) - (Date.now() - started));
  const c = await commit(ws, `${agent}: ${cmd}`);
  if (c.refused) {
    keep(`agent-${agent}`, { ...st, sticky: ws });
    return console.log("  this Workspace is kept: the next call runs in it");
  }
  if (st.sticky) keep(`agent-${agent}`, { ...st, sticky: null });
  await settle(() => lf.workspace.unmount(ws));
  console.log(`  unmounted ${ws.path}`);
});

export const closeAll = () => line(async () => {
  console.log("✓ nothing to close: each Sandbox closes itself 2 minutes after its last Workspace is unmounted");
});
