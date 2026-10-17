// fs.write of files far above one control record (#352 F-001): a 1 MiB text
// file and a 64 MiB binary file round-trip byte for byte, an unchanged rewrite
// is UpToDate, and the daemon's peak memory does not grow with the file.
//   LAYERFS_DAEMON=<linux daemon> LAYERFS_IMAGE=<digest> node sdk/js/test/verify/fs_write_large_real.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { containerOf, setup, teardown } from "./lib.mjs";

const ctx = await setup("fs-write-large", { project: `fwl-${Date.now().toString(36)}` });
const { layerfs } = ctx;
const peakKb = (sandbox) => Number(/VmHWM:\s+(\d+)/.exec(execFileSync("docker", ["exec", containerOf(sandbox), "cat", "/proc/1/status"], { encoding: "utf8" }))[1]);
try {
  await layerfs.project.init(ctx.source);
  await layerfs.branch.fork("lane");
  const service = await layerfs.service();

  // 1 MiB of text lines, read back through fs.read windows.
  const text = Array.from({ length: 16384 }, (_, i) => `line ${String(i).padStart(6, "0")} ${"x".repeat(51)}\n`).join("");
  assert.equal(Buffer.byteLength(text), 1 << 20);
  assert.equal((await layerfs.fs.write("lane", "/big.txt", text)).kind, "Committed");
  let read = "", line = 1;
  for (;;) {
    const page = await layerfs.fs.read("lane", "/big.txt", line);
    read += page.text;
    if (!page.nextLine) break;
    line = page.nextLine;
  }
  assert.equal(read, text, "1 MiB text round-trips");
  assert.equal((await layerfs.fs.write("lane", "/big.txt", text)).kind, "UpToDate", "an equal rewrite changes nothing");

  // 64 MiB of bytes, checked by its hash in a Workspace.
  const before = peakKb(service);
  const bytes = Buffer.alloc(64 << 20);
  for (let i = 0; i < bytes.length; i += 4) bytes.writeUInt32LE((i * 2654435761) >>> 0, i);
  assert.equal((await layerfs.fs.write("lane", "/big.bin", bytes)).kind, "Committed");
  const growthMb = (peakKb(service) - before) / 1024;
  const box = await layerfs.sandbox.create("fwl-box", layerfs.projectName, ctx.deploy.image);
  const ws = await layerfs.sandbox.mount(box, "lane");
  ctx.mounts.push({ sandbox: box, path: ws, branch: "lane" });
  const sum = await layerfs.sandbox.exec(box, ws, "sha256sum big.bin | cut -c1-64; stat -c %s big.bin");
  assert.equal(sum.exitCode, 0, sum.stderr);
  const [hash, size] = sum.stdout.trim().split("\n");
  assert.equal(Number(size), bytes.length);
  assert.equal(hash, createHash("sha256").update(bytes).digest("hex"), "64 MiB round-trips");
  console.log(`fs write large: ok (daemon peak growth ${growthMb.toFixed(1)} MiB for a 64 MiB write)`);
  assert.ok(growthMb < 32, `daemon peak memory grew ${growthMb.toFixed(1)} MiB for a 64 MiB write`);
} finally {
  const problems = await teardown(ctx);
  if (problems.length) console.error("teardown:", problems);
}
