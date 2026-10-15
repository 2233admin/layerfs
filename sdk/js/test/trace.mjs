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
    }
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
    const refused = lines.find((line) => line.args.path === "/missing");
    assert.equal(refused.ok, false);
    assert.equal(refused.code, "NoSuchPath");
    assert.match(refused.message, /does not exist/);
    // The client option overrides the environment.
    const other = join(dir, "option.jsonl");
    await new LayerFS("website", { trace: other }).project.list_branches();
    assert.equal(readFileSync(other, "utf8").trimEnd().split("\n").length, 2);
  } else if (selected === "off") {
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

