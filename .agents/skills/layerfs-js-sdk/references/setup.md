# Setup

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill.

## What must already exist

Whoever launches you (the orchestrator) prepares these. Check them before step one,
and stop and report if one is missing; don't build them yourself.

| Item | Where | Check |
| --- | --- | --- |
| Docker engine, local Unix socket | `docker context inspect` | `docker info` succeeds |
| Linux daemon executable | path in `LAYERFS_DAEMON` | the file exists |
| Host native addon | `<repo>/sdk/js/native/layerfs.node`, or `LAYERFS_NATIVE` | the file exists |
| Runtime image | exact `sha256:` digest in `LAYERFS_IMAGE` | `docker image inspect "$LAYERFS_IMAGE"` |
| Shared volume | name in `LAYERFS_VOLUME` | `docker volume inspect "$LAYERFS_VOLUME"` |
| Node 20 or later | host | `node --version` |

## Environment

The client reads these when `new LayerFS(name)` runs, so export them in the shell
before each `node` command, or once for the whole session.

| Variable | Meaning |
| --- | --- |
| `LAYERFS_HOME` | Absolute private directory (mode 0700) for discovery records. Every process of one run must use the same value; that's how a later process finds your Sandboxes. |
| `LAYERFS_DOCKER` | Docker Engine Unix socket (the path after `unix://` in `docker context inspect`). |
| `LAYERFS_IMAGE` | Runtime image digest, `sha256:…`. |
| `LAYERFS_VOLUME` | The Docker volume your project's daemons share. |
| `LAYERFS_DAEMON` | Host path to the Linux daemon executable. |
| `LAYERFS_NATIVE` | Optional addon path. |
| `LAYERFS_TRACE`, `LAYERFS_TRACE_STEP` | Trace file and step label; see [tracing](tracing.md). |

Only the Disposable Store profile exists; there's nothing to select.

## Run folder

Work from a run folder on the host, given to you by the orchestrator, for example:

```
run/
  package.json        depends on the SDK checkout
  state.json          Sandbox id, mount path, Branch: whatever later steps need
  steps/              one script per step, numbered, kept
    001-init.mjs
    002-fork.mjs
  logs/               exec stdout/stderr you saved, build and test output
```

Link the SDK from the checkout once, so scripts can `import "@layerfs/sdk"`.
`LAYERFS_REPO` here is the LayerFS checkout path the orchestrator gives you; the SDK
itself doesn't read it.

```bash
cd run
npm init -y >/dev/null
npm pkg set type=module
npm install --no-audit --no-fund "file:$LAYERFS_REPO/sdk/js"
```

`file:` makes a symlink to the checkout. The SDK finds its addon through its real
path, so the symlink needs nothing else.

## A step script

Every step is a small module run once with `node`. It reads `state.json`, does its
calls, prints a JSON result, saves state, and exits non-zero on a refusal.

```js
// steps/005-mount.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { LayerFS } from "@layerfs/sdk";

const state = JSON.parse(readFileSync("state.json", "utf8"));
const layerfs = new LayerFS(state.project);
try {
  const ws = await layerfs.sandbox.mount(state.sandbox, state.branch);
  state.path = ws.path;
  writeFileSync("state.json", JSON.stringify(state, null, 2));
  console.log(JSON.stringify({ ok: true, path: ws.path, base: ws.base }));
} catch (error) {
  console.log(JSON.stringify({ ok: false, code: error.code, message: error.message, detail: error.detail }));
  process.exit(1);
}
```

Run it with the step label:

```bash
LAYERFS_TRACE_STEP="005 mount feature" node steps/005-mount.mjs
```

For a quick one-off read, `node --input-type=module -e '…'` also works; top-level
`await` is allowed there.

## Project and Sandbox lifecycle

```js
const layerfs = new LayerFS("shop");               // 1–63 chars: a-z 0-9 _ - . ; no I/O yet
await layerfs.project.init("/abs/path/to/source"); // once per project; copies the folder into the Store
await layerfs.branch.fork("feature");              // from main by default
const id = await layerfs.sandbox.create();         // save it in state.json
// … mount / exec / commit / unmount, many times …
await layerfs.sandbox.close(id);                   // refused with MountsActive while anything is mounted
```

- `init` happens once. Later processes with the same `LAYERFS_HOME` find the project
  without it.
- Store calls (`fs.*`, `branch.*`) go through a service Sandbox that the client creates
  on first use and later processes reuse. You don't manage it.
- Start a new project from a small skeleton folder the orchestrator gives you. The
  SDK verification harness inits a copied fixture with a `.git/HEAD` added
  (`sdk/js/test/verify/lib.mjs`); follow the same shape.
