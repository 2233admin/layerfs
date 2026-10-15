# @layerfs/sdk

> **Status:** Current general guide. Issue #327 implementation in progress;
> not a released contract. Historical correctness results retain their identities
> in [Phase 2](../../core/docs/issues/327/PHASE2.md) and
> [Phase 3](../../core/docs/issues/327/PHASE3.md).

JavaScript is the public SDK. The package calls the internal Rust `layerfs-api`
library through the owner-approved napi-rs addon. The
[29-method standard](https://github.com/Ephemeral-AI-Lab/layerfs/blob/5321d6de320dcbd41402db9cb41aa36bceabdf4c/core/docs/issues/327/SDK-STANDARD.md)
is the target; ordinary method arguments, messages, bounded reads, numeric paging,
recursive operations and persistent discovery still require migration.

## Configuration and construction

```js
import { LayerFS } from "@layerfs/sdk";
const layerfs = new LayerFS("website");
```

Construction selects a project and reads deployment strings from the environment.
It performs no filesystem, addon or network I/O. Project names are a nonempty
ASCII alphanumeric first character followed by alphanumerics, `_`, `-` or `.`;
path separators and traversal are refused. Initialization and Sandbox creation
remain explicit. A lazy service Sandbox serves Store methods.

| Variable | Meaning |
| --- | --- |
| `LAYERFS_HOME` | Host directory for sealed provisioning Stores; required for Init. Persistent authorized discovery is not yet implemented. |
| `LAYERFS_DOCKER` | Local Docker Engine Unix socket path; defaults to `/var/run/docker.sock`. |
| `LAYERFS_IMAGE` | Exact runtime image digest (`sha256:...`); required for Sandbox creation. |
| `LAYERFS_VOLUME` | Existing named local VM volume shared by the project's daemons; required for Sandbox creation. |
| `LAYERFS_DAEMON` | Host path to the built Linux daemon executable; required for Sandbox creation. |
| `LAYERFS_NATIVE` | Optional addon path; otherwise `native/layerfs.node`. Loaded on first invocation. |

The client retains its constructor's deployment selection. Configuration errors
are refused when an operation needs the corresponding resource. No I/O in the
constructor means discovery and connection happen on demand; it does not mean
Init will run automatically. The native registry remains process-local until
[A6](../../core/docs/issues/327/A6-INVESTIGATION-20261015.md) is implemented.

## Internal operator

```js
import { LayerFSOperator } from "@layerfs/sdk/operator";
const operator = new LayerFSOperator(layerfs);
const snapshot = await operator.inspect.snapshot();
```

This subpath is internal UI/runtime machinery and is not exported from the main
entry point. Its currently implemented methods are `inspect.snapshot(since?)`,
`process.list(sandbox)` and `process.cancel(sandbox, process)`. Store/file sizes,
file history and Workspace change pages remain in the implementation plan.
Public JS/native/Rust/daemon dispatch refuses operator names; the operator has
its own native `operatorCall` and Rust `operator::call` tables. The public client
has no `inspect`, `sandbox.list_processes` or `sandbox.cancel` method.

Process listing/cancellation uses the native Sandbox executor's own records.
The filesystem daemon supervises no commands. These records currently live in
one Node process; they do not provide cross-process control or restart recovery.
Commands return exit status/stdout/stderr at completion, with the first 1 MiB
of each stream retained and truncation disclosed. Zombie reaping and the existing
replaced-inode FUSE policy are deferred by the owner. HTTP belongs only to the
local demo server.

## Native builds

Run on the actual macOS or Linux machine/container that will load the addon:

```sh
npm --prefix sdk/js run build:native
```

The script runs `cargo +1.85.1 build --offline --locked --release -p layerfs-node`
from the repository root, retaining `.cargo/config.toml` ARM64 inputs. It copies
macOS `liblayerfs_node.dylib` or Linux `liblayerfs_node.so` to `native/layerfs.node`.
`-- --debug` selects a dev build. It needs Rust 1.85.1 and the locked packages in
the local Cargo cache. No dependency is added by the build. Unsupported hosts and
cross-target environment overrides are refused explicitly.

`CARGO_TARGET_DIR` may select a directory inside this worktree. Set
`LAYERFS_NATIVE_OUTPUT` to save a separate platform artifact, then select it with
`LAYERFS_NATIVE` when loading. Keep Linux artifacts separate from the host addon.
Explicit `RUSTFLAGS` must repeat the repository ARM64 profile.

Every Store execution explicitly uses Disposable/WAL/synchronous=OFF. Durable
execution is NOT_RUN — disabled by owner until explicit reauthorization. One
attempted operation; no automatic retry or replay after an uncertain reply.
