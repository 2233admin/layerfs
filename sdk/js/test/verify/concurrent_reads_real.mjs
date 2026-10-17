// Reads do not wait behind another call's Commit (#352 F-017): while one
// fs.write of 64 MiB commits, four readers keep reading a 1 KiB file through
// the same Sandbox, and each read stays near its solo latency. With one
// shared control connection per Sandbox, every read waited for the write.
// No sleeps: the readers run until the write's Promise settles.
//   LAYERFS_DAEMON=<linux daemon> LAYERFS_IMAGE=<digest> node sdk/js/test/verify/concurrent_reads_real.mjs
import assert from "node:assert/strict";
import { setup, teardown } from "./lib.mjs";

const ctx = await setup("concurrent-reads", { project: `crr-${Date.now().toString(36)}` });
const { layerfs } = ctx;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
try {
  await layerfs.project.init(ctx.source);
  await layerfs.branch.fork("lane");
  await layerfs.fs.write("lane", "/small.txt", "r".repeat(1023) + "\n");
  const read = async () => {
    const t0 = performance.now();
    const page = await layerfs.fs.read("lane", "/small.txt", 1, 1);
    assert.equal(page.text.length, 1024);
    return performance.now() - t0;
  };
  const solo = [];
  for (let i = 0; i < 10; i++) solo.push(await read());

  const bytes = Buffer.alloc(64 << 20);
  for (let i = 0; i < bytes.length; i += 4) bytes.writeUInt32LE((i * 2654435761) >>> 0, i);
  let writing = true;
  const started = performance.now();
  const write = layerfs.fs.write("lane", "/big.bin", bytes).finally(() => { writing = false; });
  const during = [];
  const reader = async () => {
    while (writing) {
      const ms = await read();
      if (writing) during.push(ms);
    }
  };
  await Promise.all([write, reader(), reader(), reader(), reader()]);
  const writeMs = performance.now() - started;
  const soloMs = median(solo), duringMs = median(during);
  console.log(`concurrent reads: write ${writeMs.toFixed(0)} ms, ${during.length} reads during it, read p50 solo ${soloMs.toFixed(1)} ms, during ${duringMs?.toFixed(1)} ms`);
  assert.ok(during.length >= 20, `only ${during.length} reads finished while the ${writeMs.toFixed(0)} ms write ran: reads wait behind it`);
  assert.ok(duringMs <= Math.max(5 * soloMs, soloMs + 50), `read p50 ${duringMs.toFixed(1)} ms during the write against ${soloMs.toFixed(1)} ms solo`);
} finally {
  const problems = await teardown(ctx);
  if (problems.length) console.error("teardown:", problems);
}
