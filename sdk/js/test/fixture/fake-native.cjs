// A stand-in native binding for trace checks: no Docker, Store or daemon.
// Every call resolves like the real binding; a path "/missing" is refused.
const commit = { id: "c0ffee", logical: 120, newCanonical: 40, newStored: 30, newMetadata: 8 };
const answer = (op, args) => {
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
  if (op === "operator.inspect.snapshot") return { value: { version: "1", workspaces: [] } };
  if (op === "operator.store.stats") return { value: { dedupe: "2", compression: null } };
  return { value: { items: [], hasMore: false } };
};
// A traced call (args.observe) gets daemon telemetry like the real binding:
// flat timing nodes [name, parent, us, outcome, incomplete].
const telemetry = (op) => [{
  timing: { nodes: [["commit", -1, 2500, "ok", false], ["capture", 0, 400, "ok", false], ["construct", 0, 1500, "ok", false], ["captured.namespace", 2, 1400, "ok", false]], omitted: 0 },
  ...(op === "sandbox.commit" ? { storage: { pack_write_bytes: 4096 }, construction: { files_constructed: 1 } } : {}),
}];
exports.calls = [];
exports.observed = [];
const traced = (op, args) => {
  exports.calls.push(op);
  exports.observed.push(args.observe ?? null);
  const plain = answer(op, args);
  return args.observe ? { ...plain, telemetry: telemetry(op) } : plain;
};
exports.call = async (op, args) => traced(op, args);
exports.operatorCall = async (op, args) => traced(op, args);
