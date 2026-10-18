// #352 INSTALLS: `sandbox.create(name, project, image, { volumes })` mounts an
// existing volume read-only outside every Workspace (a shared pnpm store).
//
//   node sdk/js/test/verify/read_only_volume_real.mjs outer <daemon> <addon> <image>
//
// `outer` (on the Docker host) makes a fresh Store volume and a store volume
// holding one marker file, then runs `inner` twice in the runtime image, each in
// its own container sharing one LAYERFS_HOME:
//   create  - creates the Sandbox with the store at /pnpm-store, forks, mounts
//             and checks inside the Workspace: the marker is readable; a write
//             into the store fails EROFS; a hard link store -> Workspace and
//             Workspace -> store each fail EXDEV; then Commits the Workspace.
//   reopen  - a new process reopens the Sandbox from its record (the inspection
//             must expect the same read-only mount), checks again, unmounts and
//             closes it.
// It then checks the store volume is unchanged and removes the containers its
// runs named, both volumes and the home. One attempt per step; nothing retried.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { docker, inRuntime, REPO, STORE_PATH } from "./container.mjs";

const TARGET = "/pnpm-store";
// node in the Sandbox: each check's outcome as `NAME result`, errno codes exact.
const PROBE = `node -e '
const fs = require("fs");
const t = (name, f) => { try { f(); console.log(name, "ok"); } catch (e) { console.log(name, e.code); } };
console.log("READ", fs.readFileSync("${TARGET}/marker", "utf8").trim());
t("WRITE", () => fs.writeFileSync("${TARGET}/new", "x"));
t("LINK_IN", () => fs.linkSync("${TARGET}/marker", "linked-marker"));
t("LINK_OUT", () => fs.linkSync("README.md", "${TARGET}/linked-readme"));
t("SYMLINK", () => fs.symlinkSync("${TARGET}/marker", "store-link"));
console.log("VIA_SYMLINK", fs.readFileSync("store-link", "utf8").trim());
'`;

function expectProbe(out) {
  assert.match(out, /READ store marker 352/, out);
  assert.match(out, /WRITE EROFS/, out);
  assert.match(out, /LINK_IN EXDEV/, out);
  assert.match(out, /LINK_OUT EXDEV/, out);
}

async function inner([phase, volume]) {
  const { LayerFS } = await import("../../src/index.js");
  const layerfs = new LayerFS("site", { storePath: STORE_PATH });
  const image = process.env.LAYERFS_IMAGE;
  const saved = join(process.env.LAYERFS_HOME, "workspace.path");
  try {
    if (phase === "create") {
      const source = mkdtempSync(join(tmpdir(), "layerfs-ro-"));
      writeFileSync(join(source, "README.md"), "workspace file\n");
      await layerfs.project.init(source);
      assert.equal(await layerfs.sandbox.create("box", "site", image, { volumes: [{ volume, target: TARGET, readOnly: true }] }), "box");
      await layerfs.branch.fork("work", "main");
      const path = await layerfs.sandbox.mount("box", "work");
      writeFileSync(saved, path);
      const ran = await layerfs.sandbox.exec("box", path, PROBE);
      const out = JSON.stringify(ran);
      console.log(`CREATE ${out.slice(0, 600)}`);
      expectProbe(out);
      assert.match(out, /SYMLINK ok/, out);
      assert.match(out, /VIA_SYMLINK store marker 352/, out);
      const commit = await layerfs.sandbox.commit("box", path, "symlink into the read-only store");
      console.log(`COMMIT ${JSON.stringify(commit).slice(0, 300)}`);
      // a writable or misplaced volume is refused before any container exists
      for (const bad of [{ volume, target: TARGET, readOnly: false }, { volume, target: "/workspaces/x" }, { volume, target: "/tmp/store" }]) {
        let refused = null;
        try { await layerfs.sandbox.create("bad", "site", image, { volumes: [bad] }); } catch (e) { refused = e; }
        assert.ok(refused, JSON.stringify(bad));
        console.log(`REFUSED ${JSON.stringify(bad)} ${refused.code}`);
      }
      rmSync(source, { recursive: true, force: true });
      console.log("CREATE ok");
    } else {
      const path = readFileSync(saved, "utf8");
      const ran = await layerfs.sandbox.exec("box", path, PROBE.replace('t("SYMLINK"', '0 && t("SYMLINK"'));
      const out = JSON.stringify(ran);
      console.log(`REOPEN ${out.slice(0, 600)}`);
      expectProbe(out);
      await layerfs.sandbox.unmount("box", path, true);
      await layerfs.sandbox.close("box");
      console.log("REOPEN ok");
    }
  } finally {
    await layerfs.close?.().catch(() => {});
  }
}

function outer([daemon, addon, image]) {
  assert.ok(daemon && addon && image, "usage: outer <daemon> <addon> <image digest>");
  const stamp = `installs-ro-${Date.now().toString(36)}`;
  const volume = `layerfs-issue352-${stamp}`;
  const store = `layerfs-issue352-${stamp}-pnpm`;
  const home = join(REPO, "core/target/f020", `${stamp}-home`);
  mkdirSync(home, { recursive: true });
  const results = [];
  let after = "";
  try {
    for (const v of [volume, store]) assert.equal(docker(["volume", "create", v]).status, 0);
    const seed = docker(["run", "--rm", "-v", `${store}:/s`, "--entrypoint", "sh", image, "-c", "echo 'store marker 352' > /s/marker && chmod -R a+rX /s"]);
    assert.equal(seed.status, 0, seed.stderr);
    for (const phase of ["create", "reopen"]) {
      const r = inRuntime({ script: fileURLToPath(import.meta.url), args: [phase, store], daemon, addon, image, volume, prefix: `${stamp}-`, env: { LAYERFS_HOME: home }, timeout: 55_000 });
      results.push({ phase, ...r });
      if (r.status !== 0) break;
    }
    after = docker(["run", "--rm", "-v", `${store}:/s:ro`, "--entrypoint", "sh", image, "-c", "ls -A /s"]).stdout.trim();
  } finally {
    const left = docker(["ps", "-aq", "--filter", `name=^${stamp}-`]).stdout.trim().split("\n").filter(Boolean);
    if (left.length) docker(["rm", "-f", ...left]);
    docker(["volume", "rm", volume, store]);
    rmSync(home, { recursive: true, force: true });
  }
  for (const r of results) console.log(`== ${r.phase} exit ${r.status}\n${r.out.split("\n").slice(-12).join("\n")}`);
  assert.deepEqual(results.map((r) => r.status), [0, 0], "both phases pass");
  assert.equal(after, "marker", "nothing was written into the store volume");
  console.log("read-only volume: ok");
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === "inner") await inner(rest);
else outer(rest);
