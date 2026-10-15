# Writing SDK scripts

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Example outputs
> show the shape read from source and are not yet captured from a live run. Ids are 66
> hex characters, shortened here as `"9f3c…"`.

You drive LayerFS with small Node scripts, one per step, run from the shell. This page
covers what every script shares: environment, the script template, the rules, how the
methods fit together, and a complete worked example. What each method takes, returns
and refuses is in its [method page](#method-pages).

## 1. Before you start

Whoever deploys LayerFS for you prepares these. Check them once; if one is missing,
stop and report it rather than building it yourself.

| Item | Check |
| --- | --- |
| Docker engine on a local Unix socket | `docker info` succeeds |
| Linux daemon executable, path in `LAYERFS_DAEMON` | `test -x "$LAYERFS_DAEMON"` |
| Host native addon, `<repo>/sdk/js/native/layerfs.node` or `LAYERFS_NATIVE` | the file exists |
| Runtime image, exact `sha256:` digest in `LAYERFS_IMAGE` | `docker image inspect "$LAYERFS_IMAGE"` |
| Shared volume, name in `LAYERFS_VOLUME` | `docker volume inspect "$LAYERFS_VOLUME"` |
| Node 20 or later | `node --version` |

The client reads the environment when `new LayerFS(name)` runs. Export it once for the
session:

| Variable | Meaning |
| --- | --- |
| `LAYERFS_HOME` | Absolute private directory (mode 0700) for discovery records. **Every process of one run uses the same value**: that's how a later script finds your project and Sandboxes |
| `LAYERFS_DOCKER` | Docker Engine Unix socket (the path after `unix://` in `docker context inspect`) |
| `LAYERFS_IMAGE` | Runtime image digest, `sha256:…` |
| `LAYERFS_VOLUME` | The Docker volume your project's daemons share |
| `LAYERFS_DAEMON` | Host path to the Linux daemon executable |
| `LAYERFS_NATIVE` | Optional addon path |

## 2. Run folder

```
run/
  package.json        links the SDK
  state.json          what later steps need: project, Branch, Sandbox id, mount path
  steps/              one script per step, numbered, never edited after it ran
    001-start.mjs
    002-scaffold.mjs
  logs/               saved exec output: install, build, test
```

Link the SDK once, so scripts can `import "@layerfs/sdk"` (`LAYERFS_REPO` is the LayerFS
checkout you were given; the SDK doesn't read it):

```bash
mkdir -p run/steps run/logs && cd run
npm init -y >/dev/null && npm pkg set type=module
npm install --no-audit --no-fund "file:$LAYERFS_REPO/sdk/js"
echo '{ "project": "shop" }' > state.json
```

## 3. The step-script template

Every step script has the same frame. Only the part marked `// the step` changes.

```js
// steps/NNN-what.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { LayerFS, isRefusal } from "@layerfs/sdk";

const state = JSON.parse(readFileSync("state.json", "utf8"));
const layerfs = new LayerFS(state.project);
const save = () => writeFileSync("state.json", JSON.stringify(state, null, 2));
const done = (result) => { console.log(JSON.stringify({ ok: true, ...result })); };

try {
  // the step
  done({});
} catch (error) {
  if (!error.code) throw error;            // not a LayerFS refusal: a bug in this script
  console.log(JSON.stringify({ ok: false, code: error.code, message: error.message, detail: error.detail }));
  process.exit(1);
}
```

Why each part is there:

- **One JSON line out.** You read the result of every step the same way, and the run
  folder doubles as a log.
- **`save()` right after a call that creates something** (a Sandbox id, a mount path),
  before anything else can fail, so the next step can clean it up.
- **Refusals exit 1.** A refusal is a `LayerFSError` with a stable `code`; anything
  without a `code` is a bug in your script and is re-thrown.
- **A failing command is not a refusal.** `sandbox.exec` returns normally with a
  non-zero `exitCode`; check it yourself and exit 2, so you can tell the two apart.

Run a step with `node steps/NNN-what.mjs`. For a quick look,
`node --input-type=module -e '…'` also works (top-level `await` is allowed).

## 4. Rules for every script

1. **Under 2 minutes per command.** `sandbox.exec` has no timeout: wrap long commands
   inside it, `timeout 110 npm test`.
2. **One attempt.** Never resend a refused call unchanged. Read the `code`, look at the
   state if you need to, then decide. A corrected call after a definite refusal is a new
   decision, not a retry.
3. **`Unknown` or `Failed` means stop.** The outcome is uncertain. Don't resend. Inspect
   with `branch.list_commits` and `fs.read`, write down what you find, and continue only
   if the state is clear.
4. **One script at a time per Sandbox.** A second process using the same Sandbox at
   once gets `Busy`.
5. **No restart recovery.** If a Sandbox's container dies, its mounts are gone. Report
   it; don't recreate state silently.
6. **Messages:** every write and Commit gets a short message, at most 4096 bytes of
   UTF-8 (newline and tab allowed).
7. **Clean up:** commit or discard, unmount every Workspace, then close the Sandboxes
   you created.

## 5. How the methods fit together

**Two ways to change files.** Use both:

| Route | Use for | History |
| --- | --- | --- |
| `fs.*` on a Branch (no Workspace) | Writing and editing source: scaffolding, edits, moves | Each call publishes one Commit; `fs.apply` publishes a batch as one |
| A Workspace: `sandbox.mount` → `sandbox.exec` → `sandbox.commit` | Anything a program does: install, build, test, format, codegen | `sandbox.commit` captures **everything** changed: lockfiles, `node_modules`, build output, caches |

**A Workspace shows the Branch as it was at mount.** An `fs.*` write afterwards isn't
visible in it; tests you run there still see the old files. So the default step loop
mounts fresh after editing:

```
fs.apply / fs.edit on your Branch       source edits, one Commit
  → sandbox.mount(id, branch)           fresh view of the new head
  → sandbox.exec … test / build         check exitCode
  → sandbox.commit                      captures generated files
  → sandbox.unmount                     discard if the step failed
  → branch.publish(branch)              milestones only
```

Mounting is cheap: it doesn't copy or scan the tree. A long-lived Workspace across
several steps is fine too, as long as you make edits **inside** it (through `exec`)
while it's mounted; see [sandbox.exec](methods/sandbox.md).

**Install dependencies once,** in their own step, and commit. Later Workspaces mount
with `node_modules` already in the Branch.

**`main` changes only through `branch.publish`,** which replaces `main`'s view with your
Commit. Publish at milestones, and merge `main` in first if someone else may have
published (see [branch.publish](methods/branch.md)).

## 6. Worked example

A small Node project from an empty skeleton to a published, verified `main`. Each block
is the `// the step` part of the template.

**Skeleton** (shell, once): a folder with a `README.md` and a `.git/HEAD`, the shape
the SDK's own test harness uses.

```bash
mkdir -p /work/shop-skeleton/.git
printf 'ref: refs/heads/main\n' > /work/shop-skeleton/.git/HEAD
printf '# Shop\n' > /work/shop-skeleton/README.md
```

**001-start**: create the project, a Branch and a Sandbox.

```js
await layerfs.project.init("/work/shop-skeleton");
await layerfs.branch.fork("work");
state.branch = "work";
state.sandbox = await layerfs.sandbox.create();
save();
done({ sandbox: state.sandbox });
```
```json
{ "ok": true, "sandbox": "sb_7a1c…" }
```

**002-scaffold**: many files, one Commit. Parent folders must exist first.

```js
const files = {
  "/package.json": JSON.stringify({ name: "shop", type: "module", scripts: { test: "node --test" } }, null, 2) + "\n",
  "/src/cart.js": "export const total = (items) => items.reduce((s, i) => s + i.price * i.qty, 0);\n",
  "/test/cart.test.js": "import { test } from 'node:test';\nimport assert from 'node:assert';\nimport { total } from '../src/cart.js';\ntest('total', () => assert.equal(total([{ price: 2, qty: 3 }]), 6));\n",
};
const dirs = [...new Set(Object.keys(files).map((p) => p.slice(0, p.lastIndexOf("/"))).filter(Boolean))];
const r = await layerfs.fs.apply(state.branch, [
  ...dirs.map((path) => ({ op: "mkdir", path })),
  ...Object.entries(files).map(([path, content]) => ({ op: "write", path, content })),
], "scaffold: package, cart, first test");
done({ kind: r.kind, head: r.head });
```

**003-install**: once, committed with the lockfile.

```js
const ws = await layerfs.sandbox.mount(state.sandbox, state.branch);
state.path = ws.path; save();
const run = await layerfs.sandbox.exec(state.sandbox, ws.path, "timeout 110 npm install --no-audit --no-fund 2>&1", "npm install");
mkdirSync("logs", { recursive: true });
writeFileSync("logs/003-install.txt", run.stdout + run.stderr);
if (run.exitCode !== 0) {
  await layerfs.sandbox.unmount(state.sandbox, ws.path, { discard: true });
  delete state.path; save();
  console.log(JSON.stringify({ ok: false, exitCode: run.exitCode }));
  process.exit(2);
}
const c = await layerfs.sandbox.commit(state.sandbox, ws.path, { message: "deps: npm install" });
await layerfs.sandbox.unmount(state.sandbox, ws.path);
delete state.path; save();
done({ kind: c.kind, head: c.head });
```

**004-test**: same shape as 003 with `timeout 110 npm test 2>&1`. If it fails, read
`logs/004-test.txt`, fix the source with `fs.edit`/`fs.apply` in a new step, and run a
new test step (`006-test.mjs`): the fix moved the Branch, so the next mount sees it.

**007-publish**: a milestone.

```js
const p = await layerfs.branch.publish(state.branch);
done({ kind: p.kind, skipped: p.overwrote ?? [] });
```
```json
{ "ok": true, "kind": "Added", "skipped": [] }
```

**008-verify**: check `main` as a newcomer would, without creating history.

```js
await layerfs.branch.fork("verify-1", "main");
const ws = await layerfs.sandbox.mount(state.sandbox, "verify-1");
const run = await layerfs.sandbox.exec(state.sandbox, ws.path, "timeout 110 npm test 2>&1", "verify main");
writeFileSync("logs/008-verify.txt", run.stdout + run.stderr);
await layerfs.sandbox.unmount(state.sandbox, ws.path, { discard: true });
if (run.exitCode !== 0) { console.log(JSON.stringify({ ok: false, exitCode: run.exitCode })); process.exit(2); }
done({ verified: true });
```

**009-finish**: close what you created.

```js
await layerfs.sandbox.close(state.sandbox);
delete state.sandbox; save();
done({});
```

## 7. When a refusal arrives

Find the code, then open the method you called for what it means there.

| Code | Most often from | Page |
| --- | --- | --- |
| `Conflict` | `sandbox.commit`, `branch.merge` | [sandbox](methods/sandbox.md), [branch](methods/branch.md) |
| `Dirty` | `sandbox.unmount` | [sandbox](methods/sandbox.md) |
| `Busy` | any Sandbox call while another process uses it; `unmount` with a background job | [sandbox](methods/sandbox.md) |
| `MountsActive`, `NotMounted`, `NoSuchSandbox` | `sandbox.*` | [sandbox](methods/sandbox.md) |
| `HeadMoved`, `ReadOnly`, `Exists`, `NotEmpty`, `NoMatch`, `AmbiguousMatch` | `fs.*` writes | [fs writes](methods/fs-write.md) |
| `NoSuchPath`, `IsDirectory`, `NotDirectory`, `NotText` | `fs.*` | [fs reads](methods/fs-read.md), [fs writes](methods/fs-write.md) |
| `NameTaken`, `ReservedName`, `NoCommit`, `NoMergeBase`, `NoSuchBranch`, `NoSuchCommit` | `branch.*` | [branch](methods/branch.md) |
| `Exists`, `NoSuchProject` | `project.*` | [project](methods/project.md) |
| `TooLarge`, `InvalidInput` | any | read `message`; fix the arguments |
| `Unknown`, `Failed` | any | Stop: rule 3 above |

`CODES` (exported by the SDK) lists the codes callers are expected to handle; `Unknown`
and `Failed` are deliberately not in it. `isRefusal(error, "Dirty")` tests for one.

## Method pages

| Group | Page |
| --- | --- |
| `project.init`, `project.list_branches` | [project](methods/project.md) |
| `fs.read`, `list`, `stat`, `grep`, `glob`, `diff_files`, `blame` | [fs reads](methods/fs-read.md) |
| `fs.write`, `edit`, `apply`, `mkdir`, `rm`, `cp`, `mv` | [fs writes](methods/fs-write.md) |
| `branch.fork`, `list_commits`, `diff_commits`, `diff_branches`, `merge`, `publish` | [branch](methods/branch.md) |
| `sandbox.create`, `mount`, `exec`, `status`, `commit`, `unmount`, `close` | [sandbox](methods/sandbox.md) |
