// Replayed steps of a recorded run (issue #347): a scenario step's bash `run`
// is ["step", <scenario>, "NNN"], and step() makes the SDK calls of
// scenarios/<scenario>/run/NNN.json in their recorded order:
//   fork, merge, publish          the Branch calls, with the recorded arguments
//   write                         one fs.apply with the recorded Commit's changes
//   create, close                 the agent's own Sandbox
//   mount, exec, commit, unmount  a Workspace in it; exec runs the recorded
//                                 command verbatim ($PWD is the Workspace)
// Each call's outcome must be the recorded one (`expect`; "a|b" allows
// either), and each command's exit code the recorded one. The first call that
// differs ends the step with exit code 1, which stops the demo there: a run
// is never patched up. Nothing waits or retries; order between agents comes
// from the scenario's own waits.
// What later steps need (the agent's Sandbox, its mounted Workspaces by
// their recorded path) is kept under the project's LayerFS home entry,
// which is removed with the project.
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const project = process.env.DSH_LAYERFS_PROJECT;
if (!project) { console.log("no LayerFS project in this conversation"); process.exit(1); }
const { LayerFS } = await import(process.env.DSH_LAYERFS_SDK);

const NOTES = join(process.env.DSH_LAYERFS_HOME, project, "demo-notes");
const note = (key) => { try { return JSON.parse(readFileSync(join(NOTES, `${key}.json`), "utf8")); } catch { return null; } };
function keep(key, value) {
  const file = join(NOTES, `${key}.json`);
  if (value === null) return rmSync(file, { force: true });
  mkdirSync(NOTES, { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify(value));
  renameSync(`${file}.tmp`, file);
}

class Mismatch extends Error {}
const outcome = (value) => (value?.kind ?? "ok");
// create and mount answer only the Sandbox's name or the Workspace's path, and only when Ready or Mounted
const ANSWERED = { "sandbox.create": "Ready", "sandbox.mount": "Mounted" };
const allowed = (expect, got) => expect.slice(expect.indexOf(":") + 1).split("|").includes(got);
/** Runs one SDK call and checks its outcome against the record. */
async function expectCall(call, method, work) {
  let value, got;
  try { value = await work(); got = method === "sandbox.exec" ? `exit:${value.exitCode}` : ANSWERED[method] ?? outcome(value); } catch (error) {
    if (!error.code) throw error;
    got = error.code;
    value = { refused: error };
  }
  const want = call.expect;
  if (want && !(want.startsWith(`${method}:`) && allowed(want, got))) {
    if (value?.refused) console.log(`✕ ${value.refused.message}`);
    throw new Mismatch(`${method} answered ${got}; the record has ${want.slice(method.length + 1)}`);
  }
  return value;
}

const tail = (text, lines = 12) => String(text ?? "").trimEnd().split("\n").slice(-lines).join("\n");
const short = (id) => String(id ?? "").slice(0, 12);

/** A recorded ref ("main", "orders#2", "L3") as this run's id. */
async function resolveRef(lf, ref) {
  if (ref === "main" || ref == null) return ref ?? undefined;
  const [, branch, index] = /^(.+)#([0-9]+)$/.exec(ref) ?? [];
  if (!branch) throw new Mismatch(`cannot name ${ref} in this run`);
  const items = [];
  for (let pos = 0; ;) { const page = await lf.branch.list_commits(branch, 1000, pos); items.push(...page.items); if (!page.hasMore) break; pos += page.items.length; }
  const b = (await lf.project.list_branches(1000, 0)).items.find((x) => x.name === branch);
  const cut = items.findIndex((c) => c.id === b?.forkedFrom);
  const own = (cut < 0 ? items : items.slice(0, cut)).reverse();
  if (!own[Number(index)]) throw new Mismatch(`${branch} has no Commit ${index} yet`);
  return own[Number(index)].id;
}

export async function step(scenario, number) {
  const file = new URL(`../${scenario}/run/${number}.json`, import.meta.url);
  const run = JSON.parse(readFileSync(file, "utf8"));
  const agent = run.agent, boxKey = `sandbox-${agent}`, wsKey = `workspaces-${agent}`;
  const own = note(boxKey);
  // the agent's own Sandbox serves its Store calls once it has one
  let lf = own ? new LayerFS(project, { sandbox: own }) : new LayerFS(project);
  const first = lf;
  const workspaces = note(wsKey) ?? {};
  try {
    for (const call of run.calls) {
      const ws = call.ws ? workspaces[call.ws] : null;
      if (call.ws && call.op !== "mount" && !ws) throw new Mismatch(`no Workspace ${call.ws} is mounted`);
      switch (call.op) {
        case "fork": {
          const from = await resolveRef(lf, call.from);
          await expectCall(call, "branch.fork", () => (from === undefined || from === "main" ? lf.branch.fork(call.name) : lf.branch.fork(call.name, from)));
          console.log(`✓ fork ${call.name} from ${call.from}`);
          break;
        }
        case "merge": {
          const r = await expectCall(call, "branch.merge", () => lf.branch.merge(call.a, call.b, call.name, call.message ?? undefined));
          console.log(`✓ merge ${call.a} + ${call.b} → ${call.name} · ${outcome(r)}`);
          break;
        }
        case "publish": {
          const commit = call.commit ? await resolveRef(lf, call.commit) : undefined;
          const r = await expectCall(call, "branch.publish", () => (commit ? lf.branch.publish(call.branch, commit) : lf.branch.publish(call.branch)));
          console.log(`✓ publish ${call.branch} → main · ${outcome(r)}`);
          break;
        }
        case "write": {
          const r = await expectCall(call, "fs.apply", () => lf.fs.apply(call.branch, call.changes, call.message ?? undefined));
          console.log(`✓ ${call.changes.length} change(s) on ${call.branch} · ${outcome(r)} ${short(r.commit?.id ?? r.head)}`);
          break;
        }
        case "create": {
          const name = `${project}-${agent}`.slice(0, 63).replace(/[^a-z0-9]+$/, "");
          const id = await expectCall(call, "sandbox.create", () => lf.sandbox.create(name, project, process.env.DSH_LAYERFS_IMAGE));
          keep(boxKey, id);
          lf = new LayerFS(project, { sandbox: id });
          console.log(`● Sandbox ${name}`);
          break;
        }
        case "close": {
          const id = note(boxKey);
          if (!id) throw new Mismatch("the agent has no Sandbox to close");
          await expectCall(call, "sandbox.close", () => lf.sandbox.close(id));
          keep(boxKey, null);
          console.log(`✓ closed ${id}`);
          break;
        }
        case "mount": {
          const id = note(boxKey);
          if (!id) throw new Mismatch("the agent has no Sandbox to mount in");
          const r = await expectCall(call, "sandbox.mount", () => lf.sandbox.mount(id, call.branch));
          const path = r;
          workspaces[call.ws] = { sandbox: id, path };
          keep(wsKey, workspaces);
          console.log(`⟳ mount ${call.branch} → ${path}`);
          break;
        }
        case "exec": {
          console.log(`$ ${call.command.length > 300 ? `${call.command.slice(0, 300)}…` : call.command}`);
          const r = await expectCall(call, "sandbox.exec", () => lf.sandbox.exec(ws.sandbox, ws.path, call.command, call.message ?? undefined));
          const out = tail(`${r.stdout ?? ""}${r.stderr ?? ""}`);
          if (out) console.log(out);
          console.log(`[exit ${r.exitCode}] (recorded exit ${call.exit})`);
          break;
        }
        case "commit": {
          const r = await expectCall(call, "sandbox.commit", () => lf.sandbox.commit(ws.sandbox, ws.path, call.message ?? undefined, call.force));
          console.log(`✓ commit · ${outcome(r)} ${r.commit ? short(r.commit.id) : ""}${r.merged ? " · merged with the head" : ""}`);
          break;
        }
        case "unmount": {
          await expectCall(call, "sandbox.unmount", () => lf.sandbox.unmount(ws.sandbox, ws.path, call.discard));
          delete workspaces[call.ws];
          keep(wsKey, Object.keys(workspaces).length ? workspaces : null);
          console.log(`  unmounted ${ws.path}`);
          break;
        }
        default: throw new Error(`unknown call ${call.op}`);
      }
    }
  } catch (error) {
    if (!(error instanceof Mismatch)) throw error;
    console.log(`✕ ${run.step}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // the converter puts an agent's create before its first Store call, so
    // the service Sandbox is never started here; if it was, that is a fault
    if (!own && first.serviceSandbox) {
      console.log("✕ a call went through the project's service Sandbox");
      process.exitCode = 1;
    }
  }
}
