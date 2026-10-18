// The Store-call sequence of the F-020 equivalence proof (#352 step 5.3): every
// Store method the SDK exposes, errors included, on a fork of the `dsh`
// snapshot. Both arms run exactly this; `normalize` removes what differs by
// time alone (Commit ids, timestamps, durations), so equal outputs mean equal
// answers. Each call is made once.
export async function sequence(lf, op) {
  const out = [];
  const step = async (name, call) => {
    try {
      out.push({ name, value: await call() });
    } catch (e) {
      out.push({ name, refused: e.code ?? String(e), message: e.message });
    }
  };
  const B = "eq-work", C = "eq-other";
  await step("branch.fork", () => lf.branch.fork(B, "main"));
  await step("branch.fork other", () => lf.branch.fork(C, "main"));
  await step("branch.fork exists", () => lf.branch.fork(B, "main"));
  await step("project.list_branches", () => lf.project.list_branches(1000, 0));
  await step("fs.read", () => lf.fs.read(B, "/README.md", 1, 20));
  await step("fs.read missing", () => lf.fs.read(B, "/no/such/file"));
  await step("fs.stat", () => lf.fs.stat(B, "/docs"));
  await step("fs.list", () => lf.fs.list(B, "/", 1000, 0));
  await step("fs.list docs", () => lf.fs.list(B, "/docs", 50, 0));
  await step("fs.glob", () => lf.fs.glob(B, "**/*.md", "/docs", 50, 0));
  await step("fs.grep", () => lf.fs.grep(B, "LayerFS|harness", "/docs", 50, 0));
  await step("fs.blame", () => lf.fs.blame(B, "/README.md", 1));
  await step("fs.mkdir parent", () => lf.fs.mkdir(B, "/eq", "eq parent"));
  await step("fs.mkdir parent other", () => lf.fs.mkdir(C, "/eq", "eq parent other"));
  await step("fs.write no parent", () => lf.fs.write(B, "/none/one.txt", "x\n", "eq no parent"));
  await step("fs.write", () => lf.fs.write(B, "/eq/one.txt", "one\ntwo\nthree\n", "eq write"));
  await step("fs.write main", () => lf.fs.write("main", "/eq/main.txt", "x\n", "eq main"));
  await step("fs.edit", () => lf.fs.edit(B, "/eq/one.txt", "two", "TWO", "eq edit"));
  await step("fs.edit missing text", () => lf.fs.edit(B, "/eq/one.txt", "absent", "x", "eq edit miss"));
  await step("fs.apply", () => lf.fs.apply(B, [{ op: "write", path: "/eq/applied.txt", content: "applied\n" }, { op: "mkdir", path: "/eq/dir" }], "eq apply"));
  await step("fs.mkdir", () => lf.fs.mkdir(B, "/eq/made", "eq mkdir"));
  await step("fs.cp", () => lf.fs.cp(B, "/eq/one.txt", "/eq/copy.txt", "eq cp"));
  await step("fs.mv", () => lf.fs.mv(B, "/eq/copy.txt", "/eq/moved.txt", "eq mv"));
  await step("fs.rm", () => lf.fs.rm(B, "/eq/applied.txt", "eq rm"));
  await step("fs.rm missing", () => lf.fs.rm(B, "/eq/none.txt", "eq rm miss"));
  await step("fs.diff_files", () => lf.fs.diff_files(B, "/eq/one.txt", B, "/eq/moved.txt"));
  await step("fs.write other", () => lf.fs.write(C, "/eq/other.txt", "other\n", "eq other"));
  await step("fs.write other conflict", () => lf.fs.write(C, "/eq/one.txt", "theirs\n", "eq conflict side"));
  const commits = await lf.branch.list_commits(B, 50, 0).catch(() => ({ items: [] }));
  out.push({ name: "branch.list_commits", value: commits });
  const [newest, older] = commits.items ?? [];
  await step("branch.diff_commits", () => lf.branch.diff_commits(older?.id, newest?.id, 50, 0));
  await step("branch.diff_branches", () => lf.branch.diff_branches("main", B, 50, 0));
  await step("branch.diff_branches paths", () => lf.branch.diff_branches("main", B, 50, 0, { hunks: false }));
  await step("branch.merge conflict", () => lf.branch.merge(B, C, "eq-merged", "eq merge"));
  await step("fs.rm conflict side", () => lf.fs.rm(C, "/eq/one.txt", "eq unconflict"));
  await step("branch.merge", () => lf.branch.merge(B, C, "eq-merged2", "eq merge"));
  await step("branch.publish", () => lf.branch.publish("eq-merged2"));
  await step("fs.read published", () => lf.fs.read("main", "/eq/one.txt"));
  await step("operator.store.stats", () => op.store.stats());
  await step("operator.store.commits", () => op.store.commits(B, 50, 0));
  await step("operator.files.stats", () => op.files.stats(B, "/eq/one.txt"));
  await step("operator.files.history", () => op.files.history(B, "/eq/one.txt", 50, 0));
  return out;
}

const ID = /\b[0-9a-f]{34,66}\b|(?<=@)[0-9a-f]{12}\b/g;
/** Compressed sizes: metadata carries mtimes, so they vary by a few bytes
 * from run to run of the same binaries (old against old shows the same). */
export const SIZES = new Set(["newStored", "newMetadata", "stored", "metadata", "file", "compression"]);
const TIME = new Set(["time", "timestamp", "created", "committed", "at", "ms", "elapsedMs", "mtime", "ctime", "modified", "date", "sealMs"]);

/** Replaces ids by their order of first appearance and drops time fields;
 * `masked` also drops the compressed sizes. */
export function normalize(out, masked = false) {
  const seen = new Map();
  const id = (s) => s.replace(ID, (m) => {
    if (!seen.has(m)) seen.set(m, `#${seen.size}`);
    return seen.get(m);
  });
  const walk = (v) => {
    if (typeof v === "string") return id(v);
    if (typeof v === "bigint") return String(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      if (Buffer.isBuffer(v) || v instanceof Uint8Array) return `bytes:${v.length}`;
      return Object.fromEntries(Object.entries(v).filter(([k]) => !TIME.has(k) && !(masked && SIZES.has(k))).map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return walk(out);
}
