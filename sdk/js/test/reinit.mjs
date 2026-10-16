// A project is its home entry: Init refuses a name whose entry exists, and
// once that entry is removed the same process initializes the name again.
// Real native binding, Disposable Store, no Docker or daemon:
//   node sdk/js/test/reinit.mjs
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const work = mkdtempSync(join(tmpdir(), "layerfs-reinit-"));
try {
  const source = join(work, "website");
  mkdirSync(source);
  writeFileSync(join(source, "README.md"), "Hello\n");
  process.env.LAYERFS_HOME = join(work, "home");
  const { LayerFS } = await import("@layerfs/sdk");
  const layerfs = new LayerFS("website");

  const first = await layerfs.project.init(source);
  assert.equal(first.kind, "Initialized");
  await assert.rejects(layerfs.project.init(source), { code: "Exists", message: "Exists: project website already initialized" });

  rmSync(join(work, "home", "website"), { recursive: true });
  const again = await layerfs.project.init(source);
  assert.equal(again.kind, "Initialized");
  assert.ok(existsSync(again.store));
  await assert.rejects(new LayerFS("website").project.init(source), { code: "Exists" });
} finally {
  rmSync(work, { recursive: true, force: true });
}
console.log("reinit: ok");
