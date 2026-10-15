// Per-call trace checks over a stand-in binding; each case is one command:
//   node sdk/js/test/trace.mjs on|off|failure
// No Docker, Store or daemon is used.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const FAKE = fileURLToPath(new URL("./fixture/fake-native.cjs", import.meta.url));
Object.assign(process.env, {
  LAYERFS_NATIVE: FAKE, LAYERFS_HOME: "/private/trace-home", LAYERFS_DOCKER: "/fake.sock",
  LAYERFS_IMAGE: "fake-image", LAYERFS_VOLUME: "fake-volume", LAYERFS_DAEMON: "/fake/daemon",
});
delete process.env.LAYERFS_TRACE;
delete process.env.LAYERFS_TRACE_STEP;
const { LayerFS } = await import("@layerfs/sdk");
const { LayerFSOperator } = await import("@layerfs/sdk/operator");

const BIG = "x".repeat(10000);
/** Every SDK group once, plus one refusal; returns each call's value or code. */
async function script(client) {
  const op = new LayerFSOperator(client);
  const steps = [
    () => client.project.init("/src/website"),
    () => client.project.list_branches(),
    () => client.fs.read("main", "/README.md", 1, 20),
    () => client.fs.list("main", "/"),
    () => client.fs.stat("main", "/README.md"),
    () => client.fs.grep("main", "TODO"),
    () => client.fs.glob("main", "**/*.js"),
    () => client.fs.diff_files("main", "/a", "feature", "/a"),
    () => client.fs.blame("main", "/README.md"),
    () => client.fs.write("feature", "/big.txt", BIG, "Write big"),
    () => client.fs.edit("feature", "/big.txt", "xx", "yy"),
    () => client.fs.apply("feature", [{ op: "write", path: "/a", content: BIG }, { op: "rm", path: "/b" }]),
    () => client.fs.mkdir("feature", "/dir"),
    () => client.fs.rm("feature", "/dir"),
    () => client.fs.cp("feature", "/a", "/c"),
    () => client.fs.mv("feature", "/c", "/d"),
    () => client.branch.fork("feature"),
    () => client.branch.list_commits("feature"),
    () => client.branch.diff_commits("a", "b"),
    () => client.branch.diff_branches("main", "feature"),
    () => client.branch.merge("main", "feature", "merged"),
    () => client.branch.publish("feature"),
    () => client.sandbox.create(),
    () => client.sandbox.mount("sb_fake", "feature"),
    () => client.sandbox.exec("sb_fake", "/workspaces/w1", "npm test"),
    () => client.sandbox.status("sb_fake", "/workspaces/w1"),
    () => client.sandbox.commit("sb_fake", "/workspaces/w1", { message: "Save" }),
    () => client.sandbox.unmount("sb_fake", "/workspaces/w1"),
    () => client.sandbox.close("sb_fake"),
    () => client.fs.read("main", "/missing"),
    () => op.store.stats(),
    () => op.store.commits("feature"),
    () => op.files.stats("main", "/README.md"),
    () => op.files.history("main", "/README.md"),
    () => op.workspace.overlay("sb_fake", "/workspaces/w1"),
    () => op.workspace.changes("sb_fake", "/workspaces/w1"),
    () => op.inspect.snapshot(),
    () => op.process.start("sb_fake", "/workspaces/w1", "npm run dev"),
    () => op.process.list("sb_fake"),
    () => op.process.cancel("sb_fake", "p1"),
  ];
  const results = [];
  for (const step of steps) results.push(await step().then((value) => ({ value }), (error) => ({ code: error.code })));
  return results;
}

const dir = mkdtempSync(join(tmpdir(), "layerfs-trace-"));
const file = join(dir, "trace.jsonl");
const selected = process.argv[2];
try {
  if (selected === "on") {
    const reference = await script(new LayerFS("website"));
    const native = (await import(FAKE)).default;
    const before = native.calls.length;
    assert.ok(native.observed.every((scope) => scope === null), "untraced calls carry no scope");
    process.env.LAYERFS_TRACE = file;
    const traced = await script(new LayerFS("website"));
    assert.deepEqual(traced, reference, "tracing changes no value or refusal");
    const lines = readFileSync(file, "utf8").trimEnd().split("\n").map((line) => JSON.parse(line));
    assert.equal(lines.length, native.calls.length - before, "one line per native call");
    assert.deepEqual(lines.map((line) => line.method), native.calls.slice(before));
    for (const line of lines) {
      assert.equal(line.layerfs_trace, 1);
      assert.match(line.id, /^[0-9a-f]{8}-\d+$/);
      assert.ok(Number.isFinite(line.ms) && line.ms >= 0);
      assert.ok(!Number.isNaN(Date.parse(line.start)));
      assert.equal(typeof line.ok, "boolean");
      assert.equal(line.args.deploy, undefined);
      assert.equal(line.args.home, undefined);
      assert.match(line.scope, /^[0-9a-f]{64}$/);
      assert.equal(line.args.observe, undefined);
    }
    assert.deepEqual(lines.map((line) => line.scope), native.observed.slice(before), "the binding got each line's scope");
    assert.equal(new Set(lines.map((line) => line.id)).size, lines.length);
    const groups = new Set(lines.map((line) => line.method.replace(/^operator\./, "operator:").split(".")[0]));
    for (const group of ["project", "fs", "branch", "sandbox", "operator:store", "operator:files", "operator:workspace", "operator:inspect", "operator:process"]) assert.ok(groups.has(group), group);
    const write = lines.find((line) => line.method === "fs.write");
    assert.deepEqual(write.args, { branch: "feature", path: "/big.txt", contentBytes: 10000, message: "Write big", sandbox: "sb_fake" });
    assert.equal(write.commit, "c0ffee");
    assert.deepEqual(write.sizes, { logical: 120, newCanonical: 40, newStored: 30, newMetadata: 8 });
    const apply = lines.find((line) => line.method === "fs.apply");
    assert.equal(apply.args.changes, 2);
    assert.equal(apply.args.changeBytes, 10000);
    assert.ok(!readFileSync(file, "utf8").includes("xxxx"), "no file contents in the trace");
    const commit = lines.find((line) => line.method === "sandbox.commit");
    assert.equal(commit.kind, "Committed");
    assert.equal(commit.commit, "c0ffee");
    const [tree] = commit.daemon[0].timing;
    assert.equal(tree.name, "commit");
    assert.equal(tree.ms, 2.5);
    assert.deepEqual(tree.children.map((child) => child.name), ["capture", "construct"]);
    assert.equal(tree.children[1].children[0].name, "captured.namespace");
    assert.equal(commit.daemon[0].storage.pack_write_bytes, 4096);
    assert.equal(commit.daemon[0].construction.files_constructed, 1);
    const refused = lines.find((line) => line.args.path === "/missing");
    assert.equal(refused.ok, false);
    assert.equal(refused.code, "NoSuchPath");
    assert.match(refused.message, /does not exist/);
    // Every publishing call names its Commit; other calls name none.
    assert.equal(lines.find((line) => line.method === "branch.merge").commit, "m3rge");
    const publish = lines.find((line) => line.method === "branch.publish");
    assert.deepEqual([publish.commit, publish.layer], ["pub1", "lay1"]);
    const rm = lines.find((line) => line.method === "fs.rm");
    assert.deepEqual([rm.kind, rm.commit], ["UpToDate", "h3ad"]);
    const PUBLISHING = ["fs.write", "fs.edit", "fs.apply", "fs.mkdir", "fs.rm", "fs.cp", "fs.mv", "sandbox.commit", "branch.merge", "branch.publish"];
    for (const line of lines) assert.equal("commit" in line, PUBLISHING.includes(line.method) && line.ok, line.method);
    // Unset, no line has a step.
    assert.ok(lines.every((line) => !("step" in line)));
    // The step label is read at each call, bounded, and the option wins.
    const stepped = join(dir, "step.jsonl");
    const labelled = new LayerFS("website", { trace: stepped });
    for (const label of ["install deps", "s".repeat(300), undefined, ""]) {
      if (label === undefined) delete process.env.LAYERFS_TRACE_STEP; else process.env.LAYERFS_TRACE_STEP = label;
      await labelled.project.list_branches();
    }
    labelled.options.traceStep = "option step";
    process.env.LAYERFS_TRACE_STEP = "environment step";
    await labelled.project.list_branches();
    delete process.env.LAYERFS_TRACE_STEP;
    const steps = readFileSync(stepped, "utf8").trimEnd().split("\n").map((line) => JSON.parse(line)).filter((line) => line.method === "project.list_branches").map((line) => line.step);
    assert.deepEqual(steps, ["install deps", `${"s".repeat(200)}…`, undefined, undefined, "option step"]);
    // The client option overrides the environment.
    const other = join(dir, "option.jsonl");
    await new LayerFS("website", { trace: other }).project.list_branches();
    assert.equal(readFileSync(other, "utf8").trimEnd().split("\n").length, 2);
  } else if (selected === "off") {
    // A step label alone traces nothing.
    process.env.LAYERFS_TRACE_STEP = "unused step";
    const results = await script(new LayerFS("website"));
    assert.equal(results.at(29).code, "NoSuchPath");
    assert.equal(existsSync(file), false);
    assert.deepEqual(readdirSync(dir), []);
  } else if (selected === "failure") {
    // A trace path that cannot be written leaves every result unchanged.
    const reference = await script(new LayerFS("website"));
    const traced = await script(new LayerFS("website", { trace: join(dir, "absent/dir/trace.jsonl") }));
    assert.deepEqual(traced, reference);
  } else {
    console.error("usage: trace.mjs on|off|failure");
    process.exit(2);
  }
  console.log(`PASS trace ${selected}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

