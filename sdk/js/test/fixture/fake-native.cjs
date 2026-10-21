// A stand-in native binding for trace checks: no Docker, Store or daemon.
// Store calls name the client's storePath; Sandbox calls their Sandbox.
// Every call resolves like the real binding; a path "/missing" is refused, and
// so are the next `busyServices` service Sandbox creations (Busy). `service`
// is the project's existing service Sandbox (null for none).
const commit = { id: "c0ffee", logical: 120, newCanonical: 40, newStored: 30, newMetadata: 8 };
const answer = (op, args) => {
  if (op === "sandbox.service" && exports.busyServices > 0) {
    exports.busyServices -= 1;
    return { refused: { code: "Busy", message: "another process owns this discovery mutation", detail: null } };
  }
  if (args.path === "/missing") return { refused: { code: "NoSuchPath", message: "/missing does not exist", detail: null } };
  if (op === "sandbox.service" || op === "sandbox.create") return { value: { kind: "Ready", id: "sb_fake" } };
  if (op === "sandbox.mount") return { value: { kind: "Mounted", path: "/workspaces/w1", branch: args.branch, base: "b4se", baseLayer: "lay0", root: "r00t" } };
  if (op === "sandbox.exec") return { value: { kind: "exit:3", exitCode: 3, stdout: "x".repeat(5000), stderr: "", truncated: false } };
  if (op === "operator.process.start") return { value: { kind: "running", process: "proc_1", command: args.command } };
  if (op === "sandbox.commit") return { value: { kind: "Committed", head: commit.id, commit } };
  if (op === "fs.rm") return { value: { kind: "UpToDate", head: "h3ad" } };
  if (op === "branch.merge") return { value: { kind: "Merged", branch: args.name, head: "m3rge", root: "r00t" } };
  if (op === "branch.publish") return { value: { kind: "Added", source: { branch: "feature", commit: "pub1" }, publishedLayer: { id: "lay1" } } };
  if (op === "branch.fork") return { value: { kind: "Forked", branch: args.name, base: "lay0", head: "not-a-publication" } };
  if (/^fs\.(write|edit|apply|mkdir|cp|mv)$/.test(op)) return { value: { commit } };
  if (op === "operator.sandbox.service") return { value: exports.service ? { id: exports.service } : null };
  if (op === "operator.inspect.history") return { value: { kind: "ok", version: "h1", project: "website", branches: [], commits: [], more: {}, layers: [], workspaces: [] } };
  if (op === "operator.inspect.snapshot") return { value: { version: "1", workspaces: [] } };
  if (op === "operator.store.stats") return { value: { dedupe: "2", compression: null } };
  return { value: { items: [], hasMore: false } };
};
// A traced call (args.observe) gets daemon telemetry like the real binding:
// flat timing nodes [name, parent, us, outcome, incomplete], per-call SQL work,
// and the Workspace's FUSE opcode counts on status and unmount.
const telemetry = (op) => [{
  timing: { nodes: [["commit", -1, 2500, "ok", false], ["capture", 0, 400, "ok", false], ["construct", 0, 1500, "ok", false], ["captured.namespace", 2, 1400, "ok", false]], omitted: 0 },
  sql: { writer: { statements: 3, fullscan_steps: 0 }, readers: { statements: 2, vm_steps: 40 } },
  ...(op === "sandbox.status" || op === "sandbox.unmount" ? { fuse: { lookup: 5, getattr: 7, served: 12 } } : {}),
  ...(op === "sandbox.commit" ? { storage: { pack_write_bytes: 4096 }, construction: { files_constructed: 1 } } : {}),
}];
exports.calls = [];
exports.observed = [];
exports.deploys = [];
exports.args = [];
exports.busyServices = 0;
exports.service = "sb_fake";
const traced = (op, args) => {
  exports.calls.push(op);
  exports.observed.push(args.observe ?? null);
  if (args.deploy) exports.deploys.push(args.deploy);
  exports.args.push(args);
  const plain = answer(op, args);
  return args.observe ? { ...plain, telemetry: telemetry(op) } : plain;
};
exports.stores = [];
// The in-process Store (#352 F-020): opened once per client, never traced.
exports.storeOpen = async (args) => { exports.stores.push(["open", args.storePath]); return { value: { clients: 1 } }; };
exports.storeClose = async (args) => { exports.stores.push(["close", args.storePath]); return { value: { clients: 0 } }; };
exports.call = async (op, args) => traced(op, args);
exports.operatorCall = async (op, args) => traced(op, args);
