# @layerfs/sdk

> **Status:** Implemented for #327 steps 9 and 10. Not yet verified against a
> real daemon (VERIFICATION A–C run in Phase 2). No timing claim.

The JavaScript SDK is the only public LayerFS SDK. It calls the internal Rust
library [`layerfs-api`](../../core/crates/layerfs-api/src/lib.rs) through a Node
addon built with napi-rs (owner approval 2026-10-15).

```js
import { LayerFS } from "@layerfs/sdk";
const layerfs = new LayerFS({ project: "website" }); // no I/O until the first call
await layerfs.project.init("./website", { name: "website" });
await layerfs.branch.fork("feature", { from: "main" });
await layerfs.fs.write("/README.md", "# Website\n", { branch: "feature" });
const sandbox = await layerfs.sandbox.create();
const { path } = await layerfs.sandbox.mount(sandbox, { branch: "feature" });
await layerfs.sandbox.exec(sandbox, path, "npm ci");
await layerfs.sandbox.commit(sandbox, path, { agent: "a1", call: "t1" });
await layerfs.sandbox.unmount(sandbox, path);
```

## Layout

```
sdk/js/
  native/            Rust addon crate `layerfs-node` (core workspace member)
    src/lib.rs       one exported `call(op, args)` and its method table
    src/convert.rs   JavaScript values ↔ SDK values
    src/job.rs       one operation on the worker pool, resolved `{ value }` or `{ refused }`
    src/project.rs   project.init: host Init into a sealed Disposable Store
    src/sandbox.rs   Sandbox create/close, mount, status, commit, unmount
    src/exec.rs      commands, background processes and cancel (runtime owner)
    src/registry.rs  this process's projects and Sandboxes
  src/
    index.js         LayerFS client (lazy) and the method groups
    client.js        invoke, deployment settings
    errors.js        LayerFSError with a stable `code`
    project/ fs/ branch/ sandbox/ inspect/   one file per method
    harness/         tool_call.js, sandboxes.js, result.js
```

## Behaviour

- **Lazy client.** Construction does no I/O. Calls name their Branch; Sandbox
  calls take the Sandbox or its id. Store calls (`fs`, `branch`, `project`,
  `inspect`) go through one service Sandbox, created on the first such call
  unless the `sandbox` option names one. A failed create is not repeated by the
  same client.
- **Refusals.** Every refusal is a `LayerFSError` whose `code` decides
  (`Conflict`, `HeadMoved`, `Dirty`, `Busy`, `NoSuchPath`, ...). Nothing is
  retried.
- **Deployment.** `deploy: { docker, image, volume, daemon }`, else
  `LAYERFS_DOCKER`, `LAYERFS_IMAGE` (a `sha256:` digest), `LAYERFS_VOLUME`
  (created beforehand) and `LAYERFS_DAEMON` (the Linux daemon executable).
  `home` or `LAYERFS_HOME` holds sealed Stores. `LAYERFS_NATIVE` overrides the
  addon path.
- **Init.** The Store is Disposable. Init's first Branch is named `main` and is
  never shown: `main` is the line of Layers.
- **Commands.** `sandbox.exec` runs `bash -lc <command>` as the Sandbox's command
  identity in the Workspace and returns `{ exitCode, stdout, stderr }` at the end
  (no streaming; the first 1 MiB of each stream is kept). A background command
  runs in its own session with output in `/tmp/layerfs-<process>.log`. The Engine
  has no per-exec cancel, so `cancel` signals the process group from a second
  command and waits up to 5 s for it to go.
- **Inspect.** `inspect.snapshot({ since })` joins history from the service
  Sandbox with the Workspaces of every Sandbox this client created.

## Limits

- The binding keeps projects and Sandboxes in its own process. Another process
  cannot yet use a Sandbox by id alone (VERIFICATION A9).
- A project must be initialized by the process that creates its Sandboxes.

## Build

```bash
npm run build:native
```
