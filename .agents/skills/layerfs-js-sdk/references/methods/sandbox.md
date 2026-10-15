# sandbox methods

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Examples were
> captured live in issue #334 Phase A at `b30e4fb8f`. Opaque IDs are shortened;
> the full replies and trace are in `core/target/issue334/phase-a/`.

A Sandbox is one container with one LayerFS daemon. A Workspace is a complete, writable
view of a Branch mounted inside it, where ordinary commands run. **Use the Sandbox for
Bash commands** (install, build, test, run, generators, changes across many files);
every file a command changes is recorded at the Commit. For one small read or edit,
[`fs.*`](fs-read.md) is cheaper. Examples follow
[SKILL.md](../../SKILL.md#one-script-for-each-group): `layerfs` is the client, `id` a
Sandbox id and `ws` a mounted Workspace (`ws.path`) of the Branch `"work"`.

**Shared rules**

- The Sandbox id is persistent: any later process with the same `LAYERFS_HOME` can use
  it and its mount paths.
- One operation at a time per Sandbox. A second process using it at once gets `Busy`.
- No restart recovery: if the container dies, its Workspaces are gone. Stop and report.

## Workspaces

The same model as [How an agent works in LayerFS](../../SKILL.md#how-an-agent-works-in-layerfs),
from the Sandbox's side:

- **Each mount is a new Workspace.** `mount` returns a fresh `path` (such as
  `/workspaces/3`) and a `workspace` id. The `path` is the Workspace's handle: pass it
  to `exec`, `status`, `commit` and `unmount`. Two mounts of one Branch are two separate
  Workspaces, each with its own uncommitted changes. Keep the `path` from the result;
  never build one yourself, and never use one after its unmount.
- **A Workspace per Bash call is the default:** mount, exec, commit, unmount. Mounting
  doesn't copy or scan the tree, so it's cheap; the Commit then holds exactly what that
  call changed.
- **Longer and parallel work is supported.** Keep a Workspace mounted across several
  `exec` calls and commit at any point, or mount several at once in one Sandbox, on one
  Branch or several.
- **Commands use relative paths.** `exec` starts at the Workspace root: write
  `npm test` or `cat src/cart.js`, never the mount path. The path changes with every
  mount, and one written into a file would be committed with it.
- **The view is fixed at mount.** It shows the Branch as it was then and doesn't follow
  later Commits. `commit` merges in what moved; to *see* it, mount a new Workspace.
- **Everything in it is committed:** sources, `.git`, `node_modules`, build output and
  caches. Scratch files belong in `/tmp`, which is outside the Workspace.

One Bash call as one Workspace:

```js
const ws = await layerfs.sandbox.mount(id, "work");                  // a NEW Workspace with a new path
const run = await layerfs.sandbox.exec(id, ws.path, "timeout 110 npm test 2>&1", "step 12");
await layerfs.sandbox.commit(id, ws.path, { message: `step 12: npm test (exit ${run.exitCode})` });
await layerfs.sandbox.unmount(id, ws.path);                          // ws.path is now invalid
```

## `sandbox.create()`

Starts a Sandbox and waits until it's ready.

**Returns:** the Sandbox id, a string such as `"sb_7a1c…"`.

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `InvalidInput` | A `LAYERFS_*` deployment variable is missing | Check the environment ([SKILL.md](../../SKILL.md#connect-to-a-project)) |
| `Unknown`, `Failed` | Creation is uncertain or failed | Stop and report; don't create another |

```js
const id = await layerfs.sandbox.create();   // keep it: later processes can reuse it
// each sandbox.mount(id, …) in it creates a new Workspace with its own path
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
const ws = await layerfs.sandbox.mount(id, "work");   // a NEW Workspace with a new path: use ws.path, never hard-code it
```
```json
{
  "kind": "Mounted",
  "path": "/workspaces/1",
  "workspace": "f4282e27124e…",
  "namespace": 1,
  "branch": "work",
  "base": "125d54ec6a82…",
  "baseLayer": "32a35edb1f9f…",
  "root": "024fffcbc8bc…",
  "sandbox": "sb_256f47dd8daa0d3573e96be4d6ba3f392ee71b97f854341f95c7bacbb4465ee1"
}
```

**Notes:** every call mounts a new Workspace with its own `path`, even on the same
Branch (see [Workspaces](#workspaces)). The view doesn't follow the Branch: after an
`fs.*` write on the same Branch, mount again to see it (or let the next `sandbox.commit`
merge it in).

## `sandbox.exec(id, path, command, message?)`

Runs one shell command in a mounted Workspace and waits for it to end.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string | yes | Sandbox id |
| `path` | string | yes | Workspace path from `mount` |
| `command` | string | yes | Run with `bash -c`; the working directory is the Workspace root, so use relative paths (`src/cart.js`), never the mount path; `HOME=/tmp` |
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

**Run a check and report its output**

```js
// ws.path: from sandbox.mount. Every mount creates a new Workspace with a new path; never hard-code one.
const run = await layerfs.sandbox.exec(id, ws.path, "timeout 110 npm test 2>&1", "cart tests");
console.log(JSON.stringify(run, null, 2));
const saved = await layerfs.sandbox.commit(id, ws.path, { message: `step 12: npm test (exit ${run.exitCode})` });
console.log(saved.kind);                  // "UpToDate" when the command changed nothing
```
```json
{
  "kind": "exit:0",
  "exitCode": 0,
  "stdout": "\n> test\n> node --test\n\nTAP version 13\n# Subtest: cart\nok 1 - cart\n  ---\n  duration_ms: 0.433125\n  type: 'test'\n  ...\n# Subtest: cart-api\nok 2 - cart-api\n  ---\n  duration_ms: 0.453209\n  type: 'test'\n  ...\n# Subtest: loads\nok 3 - loads\n  ---\n  duration_ms: 0.533125\n  type: 'test'\n  ...\n1..3\n# tests 3\n# suites 0\n# pass 3\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n# duration_ms 56.672166\n",
  "stderr": "",
  "message": "cart tests",
  "truncated": false
}
```

Commit whatever the command did, failure or not, so the step is recorded. If
`exitCode` isn't 0, read the failing output and the code it points at before you
decide what to change.

**Big output:** write it to `/tmp` and read the end in a second call.

```js
// ws.path: from sandbox.mount. Every mount creates a new Workspace with a new path; never hard-code one.
await layerfs.sandbox.exec(id, ws.path, "timeout 110 npm run build >/tmp/build.log 2>&1; echo $? >/tmp/build.code", "build");
const tail = await layerfs.sandbox.exec(id, ws.path, "cat /tmp/build.code; tail -n 60 /tmp/build.log", "build log");
```

**Smoke-test a server:** start, probe and stop in **one** call. Send the server's output
to `/tmp`, so it doesn't hold `exec` open or land in the Workspace.

```js
// ws.path: from sandbox.mount. Every mount creates a new Workspace with a new path; never hard-code one.
const cmd = [
  "timeout 60 bash -c '",
  "node src/main.js >/tmp/server.log 2>&1 & pid=$!;",
  "sleep 2;",
  "node -e \"fetch(\\\"http://127.0.0.1:3000/health\\\").then(r => { console.log(r.status); process.exit(r.ok ? 0 : 1) }).catch(e => { console.error(e.message); process.exit(1) })\";",
  "s=$?; kill $pid; cat /tmp/server.log; exit $s'",
].join(" ");
const run = await layerfs.sandbox.exec(id, ws.path, cmd, "smoke test");
```

**Write a file inside a mounted Workspace:** only when this Workspace must see the
change before its next Commit; otherwise use `fs.*` and mount again. Pass the content as
base64 so the shell doesn't reinterpret it (command lines have an OS length limit, so
use this for files up to a few tens of KiB).

```js
// ws.path: from sandbox.mount. Every mount creates a new Workspace with a new path; never hard-code one.
const content = "export const TAX = 0.08;\n";
const b64 = Buffer.from(content).toString("base64");
const run = await layerfs.sandbox.exec(id, ws.path, `printf '%s' ${b64} | base64 -d > src/tax.js`, "write src/tax.js");
if (run.exitCode !== 0) console.log(run.stderr);
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
// ws.path: from sandbox.mount. Every mount creates a new Workspace with a new path; never hard-code one.
const s = await layerfs.sandbox.status(id, ws.path);
if (s.headMovedSinceMount) console.log("the next commit will merge with", s.branchHead);
```
```json
{
  "kind": "ok",
  "base": "123648aa594a…",
  "baseLayer": "32a35edb1f9f…",
  "branchHead": "123648aa594a…",
  "headMovedSinceMount": false,
  "activity": "Idle",
  "overlay": {
    "inodes": 0,
    "entries": 0,
    "pendingMerge": false
  },
  "branch": "work"
}
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
| `"Committed"` | `head`, `commit`, `displacedHead`, `merged`, `lww` | New Commit. `merged` is `{ from, head }` when a merge ran, else `null`. `lww` lists files decided last-writer-wins by the head's [`/.lww`](../rules/lww.md), each `{ path, kept, deleted, rule }` |
| `"UpToDate"` | `head`, `root`, `merged`, `lww` | Nothing changed; no Commit |

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `Conflict` | The merge with the moved head overlaps. Markers are written into the Workspace; nothing is committed | See [resolving conflicts](../rules/conflicts.md#commit-conflicts) |
| `NotMounted`, `Busy`, `HeadMoved` | As elsewhere | Check the path; run steps one at a time; commit again after a look at `status` |

```js
// ws.path: from sandbox.mount. Every mount creates a new Workspace with a new path; never hard-code one.
const c = await layerfs.sandbox.commit(id, ws.path, { message: "deps: npm install" });
```
```json
{
  "kind": "Committed",
  "head": "122215f69eba…",
  "commit": {
    "id": "122215f69eba…",
    "branch": null,
    "parent": "12df71934c6f…",
    "secondParent": null,
    "base": "32a35edb1f9f…",
    "root": "caf388018578…",
    "via": "exec",
    "message": "A: resolved both changes",
    "mergedFrom": null,
    "time": 1792085429866,
    "logical": 2478,
    "newCanonical": 2849,
    "newStored": 1204,
    "newMetadata": 783,
    "displaced": null,
    "lww": [],
    "lwwTruncated": false
  },
  "displacedHead": null,
  "merged": null,
  "lww": []
}
```

**When Commit reports a `Conflict`:** nothing was committed, and the conflicted files in
the Workspace now hold markers. Read both sides before changing anything. Fixing the
files, ruling generated ones in `/.lww`, and overwriting with `force` are covered,
scenario by scenario, in [resolving conflicts](../rules/conflicts.md#commit-conflicts).

## `sandbox.unmount(id, path, { discard? }?)`

Unmounts a Workspace.

| Option | Meaning |
| --- | --- |
| `discard` | Drop uncommitted changes instead of refusing |

**Returns:** `{ kind: "Unmounted" }`.

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `Dirty` | Uncommitted changes; `detail.changed` lists paths | Commit them, so the step is recorded; discard only a Workspace you're abandoning |
| `Busy` | A background process still runs there, or another process uses the Sandbox | Stop it, or wait for the other process |
| `NotMounted` | Already unmounted, or the wrong path | Use the `path` from `mount` |

```js
// ws.path: from sandbox.mount. Every mount creates a new Workspace with a new path; never hard-code one.
await layerfs.sandbox.unmount(id, ws.path);
```

## `sandbox.close(id)`

Stops and deletes the Sandbox container. The project and its history are unaffected.

**Returns:** `{ kind: "Closed", id }`.

**Refusals:** `MountsActive` (unmount every Workspace first), `Busy`, `NoSuchSandbox`.

When `LAYERFS_TRACE` is set, preserve the daemon log **before** this call: on the
host, save `docker logs <container-id> > <run>/daemon-<container-id>.log 2>&1`,
where `<container-id>` is the Sandbox id with `sb_` removed and `<run>` is the
folder containing `LAYERFS_TRACE`. Closing deletes the container and its log.
This is diagnostic collection; project reads and changes still use the SDK.
