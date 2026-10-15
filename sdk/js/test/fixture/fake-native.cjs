// A stand-in native binding for trace checks: no Docker, Store or daemon.
// Every call resolves like the real binding; a path "/missing" is refused.
const commit = { id: "c0ffee", logical: 120, newCanonical: 40, newStored: 30, newMetadata: 8 };
const answer = (op, args) => {
  if (args.path === "/missing") return { refused: { code: "NoSuchPath", message: "/missing does not exist", detail: null } };
  if (op === "sandbox.service" || op === "sandbox.create") return { value: { kind: "Ready", id: "sb_fake" } };
  if (op === "sandbox.mount") return { value: { path: "/workspaces/w1" } };
  if (op === "sandbox.commit") return { value: { kind: "Committed", head: commit.id, commit } };
  if (/^fs\.(write|edit|apply|mkdir|rm|cp|mv)$/.test(op)) return { value: { commit } };
  if (op === "operator.inspect.snapshot") return { value: { version: "1", workspaces: [] } };
  if (op === "operator.store.stats") return { value: { dedupe: "2", compression: null } };
  return { value: { items: [], hasMore: false } };
};
exports.calls = [];
exports.call = async (op, args) => (exports.calls.push(op), answer(op, args));
exports.operatorCall = async (op, args) => (exports.calls.push(op), answer(op, args));
