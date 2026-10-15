# sandbox methods

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Fields are
> read from source on `main`; example outputs show the shape and are not yet captured
> from a live run. Ids are 66 hex characters, shortened here as `"9f3c…"`.

A Sandbox is one container with one LayerFS daemon. A Workspace is a complete, writable
view of a Branch mounted inside it, where ordinary commands run. Snippets are the
`// the step` part of the [script template](../scripts.md#3-the-step-script-template),
with `state.sandbox`, `state.branch` and (when mounted) `state.path` in `state.json`.

**Shared rules**

- The Sandbox id is persistent: any later process with the same `LAYERFS_HOME` can use
  it and its mount paths.
- One operation at a time per Sandbox. A second process using it at once gets `Busy`.
- No restart recovery: if the container dies, its Workspaces are gone. Stop and report.

## `sandbox.create()`

Starts a Sandbox and waits until it's ready.

**Returns:** the Sandbox id, a string such as `"sb_7a1c…"`.

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `InvalidInput` | A `LAYERFS_*` deployment variable is missing | Check the environment ([scripts](../scripts.md#1-before-you-start)) |
| `Unknown`, `Failed` | Creation is uncertain or failed | Stop and report; don't create another |

```js
state.sandbox = await layerfs.sandbox.create();
save();                                   // save before anything else can fail
```

## `sandbox.mount(id, branch)`

Mounts a Workspace showing the Branch head at this moment. Doesn't scan or copy the tree.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string | yes | Sandbox id |
| `branch` | string | yes | Branch to mount. Not `main`: fork a Branch from it |

**Returns:** `{ kind: "Mounted", path, branch, base, baseLayer, root, workspace,
namespace, sandbox }`. Pass `path` to `exec`, `status`, `commit` and `unmount`. `base`
is the Commit it shows.

**Refusals:** `NoSuchBranch` (fork first), `NoSuchSandbox`, `Busy`.

```js
const ws = await layerfs.sandbox.mount(state.sandbox, state.branch);
state.path = ws.path; save();
```
```json
{ "kind": "Mounted", "path": "/layerfs/w/3", "branch": "work", "base": "9f3c…", "sandbox": "sb_7a1c…", "…": "…" }
```

**Notes:** the view doesn't follow the Branch. After an `fs.*` write on the same Branch,
mount again to see it (or let the next `sandbox.commit` merge it in).

## `sandbox.exec(id, path, command, message?)`

Runs one shell command in a mounted Workspace and waits for it to end.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string | yes | Sandbox id |
| `path` | string | yes | Workspace path from `mount` |
| `command` | string | yes | Run with `bash -c`; the working directory is the Workspace root; `HOME=/tmp` |
| `message` | string | no | Labels the run; at most 4096 bytes; creates no history |

**Returns**

| Field | Type | Meaning |
| --- | --- | --- |
| `kind` | string | `"exit:<code>"` |
| `exitCode` | number | The command's exit code. Non-zero is **not** a refusal |
| `stdout`, `stderr` | string | First 1 MiB of each stream |
| `truncated` | boolean | True if either stream went beyond 1 MiB |
| `message` | string \| null | Your message, echoed |

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `NotMounted` | `path` isn't mounted in this Sandbox | Use the `path` saved from `mount` |
| `NoSuchSandbox` | Wrong id, or a different `LAYERFS_HOME` | Check both; don't create a replacement silently |
| `Busy` | Another process is using this Sandbox | Run steps one after another |
| `Unknown` | The exit code isn't known | Stop: the command may or may not have run |

**Limits**

- No timeout: put `timeout 110` inside the command.
- Waits until everything holding its output has ended, including background jobs.
- Keeps the first 1 MiB per stream; redirect bigger output to a file in `/tmp`.
- Files the command writes are in the Workspace and get committed; keep scratch files
  in `/tmp`.

**Run a check and keep its output**

```js
const run = await layerfs.sandbox.exec(state.sandbox, state.path, "timeout 110 npm test 2>&1", "cart tests");
mkdirSync("logs", { recursive: true });
writeFileSync("logs/012-test.txt", run.stdout + run.stderr);
if (run.exitCode !== 0) {
  console.log(JSON.stringify({ ok: false, exitCode: run.exitCode, tail: run.stdout.slice(-2000) }));
  process.exit(2);
}
```
```json
{ "kind": "exit:1", "exitCode": 1, "stdout": "✖ total (2.1ms)\n…", "stderr": "", "message": "cart tests", "truncated": false }
```

**Big output:** write it to `/tmp` and read the end in a second call.

```js
await layerfs.sandbox.exec(state.sandbox, state.path, "timeout 110 npm run build >/tmp/build.log 2>&1; echo $? >/tmp/build.code", "build");
const tail = await layerfs.sandbox.exec(state.sandbox, state.path, "cat /tmp/build.code; tail -n 60 /tmp/build.log", "build log");
```

**Smoke-test a server:** start, probe and stop in **one** call. Send the server's output
to `/tmp`, so it doesn't hold `exec` open or land in the Workspace.

```js
const cmd = [
  "timeout 60 bash -c '",
  "node src/server.js >/tmp/server.log 2>&1 & pid=$!;",
  "sleep 2;",
  "node -e \"fetch(\\\"http://127.0.0.1:3000/health\\\").then(r => { console.log(r.status); process.exit(r.ok ? 0 : 1) }).catch(e => { console.error(e.message); process.exit(1) })\";",
  "s=$?; kill $pid; cat /tmp/server.log; exit $s'",
].join(" ");
const run = await layerfs.sandbox.exec(state.sandbox, state.path, cmd, "smoke test");
```

**Write a file inside a mounted Workspace:** only when this Workspace must see the
change before its next Commit; otherwise use `fs.*` and mount again. Pass the content as
base64 to avoid shell quoting (command lines have an OS length limit).

```js
const content = "export const TAX = 0.08;\n";
const b64 = Buffer.from(content).toString("base64");
const cmd = `node -e "require('fs').writeFileSync(process.argv[1], Buffer.from(process.argv[2], 'base64'))" src/tax.js ${b64}`;
const run = await layerfs.sandbox.exec(state.sandbox, state.path, cmd, "write src/tax.js");
```

## `sandbox.status(id, path)`

Describes a mounted Workspace without reading the Store.

**Returns**

| Field | Meaning |
| --- | --- |
| `base` | Commit the Workspace is based on |
| `branchHead` | The Branch's current head |
| `headMovedSinceMount` | True if a Commit now would merge first |
| `activity` | The daemon's activity state for the Workspace |
| `overlay` | `{ inodes, entries, pendingMerge }`: changed files and directory entries |
| `branch` | Branch name |

**Refusals:** `NotMounted`, `NoSuchSandbox`, `Busy`.

```js
const s = await layerfs.sandbox.status(state.sandbox, state.path);
if (s.headMovedSinceMount) console.log("the next commit will merge with", s.branchHead);
```
```json
{ "kind": "ok", "base": "9f3c…", "branchHead": "9f3c…", "headMovedSinceMount": false, "overlay": { "inodes": 214, "entries": 37, "pendingMerge": false }, "branch": "work", "…": "…" }
```

## `sandbox.commit(id, path, { message?, force? }?)`

Saves everything changed in the Workspace as one Commit on its Branch. If the Branch
moved since the mount, it merges first. The Workspace stays mounted.

| Option | Meaning |
| --- | --- |
| `message` | Commit message |
| `force` | Overwrite a newer head with this Workspace's view instead of merging. Drops the other changes; avoid |

**Returns**

| `kind` | Fields | Meaning |
| --- | --- | --- |
| `"Committed"` | `head`, `commit`, `displacedHead`, `merged`, `lww` | New Commit. `merged` is `{ from, head }` when a merge ran, else `null`. `lww` lists files decided last-writer-wins |
| `"UpToDate"` | `head`, `root`, `merged`, `lww` | Nothing changed; no Commit |

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `Conflict` | The merge with the moved head overlaps. Markers are written into the Workspace; nothing is committed | Resolve inside the Workspace (below) |
| `NotMounted`, `Busy`, `HeadMoved` | As elsewhere | Check the path; run steps one at a time; commit again after a look at `status` |

```js
const c = await layerfs.sandbox.commit(state.sandbox, state.path, { message: "deps: npm install" });
```
```json
{ "kind": "Committed", "head": "c41d…", "commit": { "id": "c41d…", "message": "deps: npm install", "…": "…" }, "displacedHead": "9f3c…", "merged": null, "lww": [] }
```

**Resolve a `Conflict`**

1. `error.detail.conflicts` lists the files as `{ path, kind, blocks, hunks }`;
   `detail.written` lists the paths the merge changed in the Workspace. Nothing was
   committed.
2. Markers are Git-style: `<<<<<<< `, `=======`, `>>>>>>> `. Look at them **in the
   Workspace**, not with `fs.read` (the Branch doesn't have them).
3. Write the resolved file **in the Workspace**
   ([write a file inside a mounted Workspace](#sandboxexecid-path-command-message)).
4. Commit again. While markers remain, Commit refuses with `Conflict` and
   `detail.markers: true`.

```js
try {
  await layerfs.sandbox.commit(state.sandbox, state.path, { message: "cart: totals" });
} catch (error) {
  if (!isRefusal(error, "Conflict")) throw error;
  for (const { path, kind, blocks } of error.detail.conflicts) {
    console.log(path, kind, blocks);
    const show = await layerfs.sandbox.exec(state.sandbox, state.path, `grep -n -e '^<<<<<<< ' -e '^=======' -e '^>>>>>>> ' '.${path}'`, "find markers");
    console.log(path, show.stdout);
  }
  process.exit(1);                         // resolve in the next step, then commit again
}
```

To give up on the Workspace's changes instead: unmount with `{ discard: true }` and
mount the current head.

## `sandbox.unmount(id, path, { discard? }?)`

Unmounts a Workspace.

| Option | Meaning |
| --- | --- |
| `discard` | Drop uncommitted changes instead of refusing |

**Returns:** `{ kind: "Unmounted" }`.

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `Dirty` | Uncommitted changes; `detail.changed` lists paths | Commit them, or unmount with `{ discard: true }` |
| `Busy` | A background process still runs there, or another process uses the Sandbox | Stop it, or wait for the other process |
| `NotMounted` | Already unmounted, or the wrong path | Check `state.path` |

```js
await layerfs.sandbox.unmount(state.sandbox, state.path);
delete state.path; save();
```

## `sandbox.close(id)`

Stops and deletes the Sandbox container. The project and its history are unaffected.

**Returns:** `{ kind: "Closed", id }`.

**Refusals:** `MountsActive` (unmount every Workspace first), `Busy`, `NoSuchSandbox`.
