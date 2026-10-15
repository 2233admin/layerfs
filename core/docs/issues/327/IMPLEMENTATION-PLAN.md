# #327 implementation plan: SDK standard, operator surface and statistics

> **Status:** Proposal; target LayerFS 0.1.7; not a released contract.
> Dated 2026-10-15. Tracking: [issue #327](https://github.com/Ephemeral-AI-Lab/layerfs/issues/327),
> [#328](https://github.com/Ephemeral-AI-Lab/layerfs/issues/328) (the revised SDK standard) and
> [#329](https://github.com/Ephemeral-AI-Lab/layerfs/issues/329) (the decisions this plan depends on).

## 1. Authority and scope

This plan describes how to take the current implementation to the revised
[public JavaScript SDK standard](https://github.com/Ephemeral-AI-Lab/layerfs/blob/5321d6de320dcbd41402db9cb41aa36bceabdf4c/core/docs/issues/327/SDK-STANDARD.md).
It also covers the operator surface, Store statistics and timing that the UI
needs. The standard governs the public API. #329 holds the open decisions,
and where a decision is still open this plan gives only a proposal. Nothing
here claims that a capability exists or has been checked.

The original plan basis is `daacdb13c`. The current implementation checkpoint
is [PHASE4-20261015.md](PHASE4-20261015.md), with product at `3fb73808c`.
The branch remains local and unpushed. The [decision record](DECISIONS-20261015.md)
records delegated judgment and the owner's explicit deferrals.
- [PHASE2.md](PHASE2.md) records the A–C verification against the real daemon.
- [PHASE3.md](PHASE3.md) records the live UI (D1–D6) and the UI previews made since.
- The [SPEC](SPEC.md) stays the architectural and UI-integration background where
  the standard does not supersede it.
- [VERIFICATION](VERIFICATION.md) has to be migrated to the standard (section 7).

## 2. Public SDK

Exactly four groups and 29 methods. All are Promise-returning and positional,
with `pageSize = 50` and `pagePos = 0` on paged calls. `new LayerFS(projectName)`
performs no I/O.

| Group | Methods |
| --- | --- |
| `project` | `init(sourcePath)`, `list_branches(pageSize?, pagePos?)` |
| `fs` reads | `read(ref, path, startLine?, endLine?)`, `list(ref, path?, pageSize?, pagePos?)`, `stat(ref, path)`, `grep(ref, pattern, path?, pageSize?, pagePos?)`, `glob(ref, pattern, path?, pageSize?, pagePos?)`, `diff_files(leftRef, leftPath, rightRef, rightPath)`, `blame(ref, path, fromLine?)` |
| `fs` writes | `write`, `edit`, `apply`, `mkdir`, `rm`, `cp`, `mv`, each taking `branch` first and an optional `message` last |
| `branch` | `fork(name, fromRef?)`, `list_commits(branch, pageSize?, pagePos?)`, `diff_commits(from, to, pageSize?, pagePos?)`, `diff_branches(from, to, pageSize?, pagePos?)`, `merge(a, b, name, message?)`, `publish(branch, commit?)` |
| `sandbox` | `create()`, `mount(sandbox, branch)`, `exec(sandbox, path, command, message?)`, `status(sandbox, path)`, `commit(sandbox, path, { message?, force? })`, `unmount(sandbox, path, { discard? })`, `close(sandbox)` |

Compared with today's SDK:
- **Removed:** the `agent` and `call` parameters, `remove`, `inspect.snapshot`, `list_processes`, `cancel`, the harness exports, and options objects on ordinary methods.
- **Unchanged:** current file size is `fs.stat(...).size` in the public SDK.

## 3. Operator surface

UI and harness views live behind an internal entry point, `@layerfs/sdk/operator`.
It uses the same `{group}/{method}` layout and positional paging. The public
package does not export it, and a public call cannot reach it.

| Group | Method | Returns |
| --- | --- | --- |
| `store` | `stats()` | `{ logical, canonical, stored, metadata, file, free, dedupe, compression }` |
| | `commits(branch, pageSize?, pagePos?)` | Per Commit, newest first: `{ commit, logical, newCanonical, newStored, newMetadata }` |
| `files` | `stats(ref, path)` | `{ size, revisions, logical, canonical, stored, metadata }`; `revisions` is exact up to a limit, otherwise reported as more than the limit |
| | `history(ref, path, pageSize?, pagePos?)` | Revisions newest first: `{ commit, change, size, object, newCanonical, newStored }` |
| `workspace` | `overlay(sandbox, path)` | `{ inodes, entries, payload, metadata, changes: { added, modified, removed } }` |
| | `changes(sandbox, path, pageSize?, pagePos?)` | Changed paths and the paths that still hold conflict markers |
| `process` | `list(sandbox)`, `cancel(sandbox, process)` | The Sandbox's processes; Stopped |
| `inspect` | `snapshot(since?)` | The UI read model, including `store.stats` and each Workspace's overlay |

Where each part lives:
- **Rust.** Operator methods are in `layerfs-api/src/operator/` with their own `operator::call()`, and in `layerfs-daemon/src/operator/` with their own dispatch.
- **Method names.** Operator names are `operator.<group>.<method>`. Public dispatch refuses them at every layer: `layerfs-api`'s `call()`, the daemon's `sdk/` dispatch and the native `call()`.
- **Process control.** `process.list` and `process.cancel` stay in the native binding's executor (`sdk/js/native/src/exec.rs`). The Sandbox, or an external executor, owns command launch and cancellation, and the filesystem daemon supervises no commands.
- **HTTP.** HTTP is not a product surface. The demo server in `sdk_sim/server/` maps `/api/{sdk|operator}/{group}/{method}` onto the two method tables: GET with query parameters for reads, POST `{ "args": [...] }` for anything that changes state. This respects the rule against reviving a host data-path server. A remote or multi-user operator API would be a separate product decision.

## 4. Statistics and timing

All sizes are bytes.

| Term | Meaning |
| --- | --- |
| logical | file bytes as written, counted every place a file appears |
| canonical | bytes of distinct canonical objects, after CAS dedupe, chunking and framing |
| stored | physical bytes after compression and delta encoding (`pack.length`) |
| metadata | namespace, inode and directory objects, history records and indexes |
| dedupe | `logical / canonical` |
| compression | `canonical / stored` |

Sources:
- **Store totals and per-Commit counters.** Recorded at each publication. Each Save already knows which objects it reused and which it wrote, and `object_location.canonical_length` and `pack.length` already exist. Keeping totals avoids a full scan per request. This is a Store format change and belongs to the same migration as messages (section 6).
- **Per-file revisions and sizes.** A paged walk along first parents that compares the file's object id; current size is `fs.stat`.
- **Per-file stored bytes.** These need a per-path table, which comes later. Until then, `newCanonical` and `newStored` for a file are `null`.
- **Overlay.** The overlay's existing `StoredCounts` and the Dirty listing.
- **Timing.** Measured by the UI server around each call: the SDK call, the refresh and the HTTP round trip. It is shown as a diagnostic and is not an SDK method or a measurement under the measurement policy.

## 5. Source layout

Production LOC from `tools/production_loc.py --files` at `3fb73808c`, including
`sdk/js/operator/`. Counts use Git snapshots, not working-tree totals. Tests and
build scripts are excluded. API and SDK listings include every existing product
file; the daemon listing is partial, covering the control/operator dispatch files.
Planned files contribute no subtotal. `native/src/discovery.rs` is conditional,
not a scaffolding requirement. Tests live under each package's `tests/` or
`sdk/js/test/`.

`layerfs-api`:

```text
core/crates/layerfs-api/src/               [1930]
  lib.rs                                       22
  base/                                     [709]
    mod.rs                                      8
    control.rs                                221
    failure.rs                                 51
    install.rs                                142
    install_types.rs                           44
    internal.rs                               143
    recovery.rs                                52
    sdk.rs                                     48
  branch/                                    [92]
    mod.rs                                     12
    diff_branches.rs                            6
    diff_commits.rs                             6
    fork.rs                                    28
    list_commits.rs                            28
    merge.rs                                    6
    publish.rs                                  6
  fs/                                       [112]
    mod.rs                                     28
    apply.rs                                    6
    blame.rs                                    6
    cp.rs                                       6
    diff_files.rs                               6
    edit.rs                                     6
    glob.rs                                     6
    grep.rs                                     6
    list.rs                                     6
    mkdir.rs                                    6
    mv.rs                                       6
    read.rs                                     6
    remove.rs                                   6  (rename to rm.rs remains)
    stat.rs                                     6
    write.rs                                    6
  operator/                                  [22]
    mod.rs                                      3
    call.rs                                    12  (separate operator admission)
    files/                                 —   new
      mod.rs                                —   new
      history.rs                            —   new
      stats.rs                              —   new
    inspect/                                  [7]
      mod.rs                                    2
      snapshot.rs                               5
    store/                                 —   new
      mod.rs                                —   new
      commits.rs                            —   new
      stats.rs                              —   new
    workspace/                             —   new
      mod.rs                                —   new
      changes.rs                            —   new
      overlay.rs                            —   new
  project/                                  [197]
    mod.rs                                      6
    init.rs                                   161
    list_branches.rs                           30
  sandbox/                                  [776]
    mod.rs                                     20
    close.rs                                   36
    commit.rs                                  42
    create.rs                                 322
    exec.rs                                    39
    mount.rs                                   99
    status.rs                                  15
    unmount.rs                                 51
    values.rs                                 152
```

`sdk/js`:

```text
sdk/js/                                    [1086]
  native/                                   [815]
    src/                                    [815]
      lib.rs                                   18
      convert.rs                               87
      discovery.rs                          —   cond.  (conditional; A6 investigation first)
      dispatch.rs                              62
      exec.rs                                 212
      job.rs                                   48
      project.rs                               86
      registry.rs                              63
      sandbox.rs                              239
  operator/                                  [38]
    index.js                                   12  (internal entry point)
    files/                                 —   new
      history.js                            —   new
      stats.js                              —   new
    inspect/                                 [18]
      snapshot.js                              18
    process/                                  [8]
      cancel.js                                 4
      list.js                                   4
    store/                                 —   new
      commits.js                            —   new
      stats.js                              —   new
    workspace/                             —   new
      changes.js                            —   new
      overlay.js                            —   new
  src/                                      [233]
    client.js                                  34
    errors.js                                  17
    index.js                                   54
    native.js                                  11
    branch/                                  [18]
      diff_branches.js                          3
      diff_commits.js                           3
      fork.js                                   3
      list_commits.js                           3
      merge.js                                  3
      publish.js                                3
    fs/                                      [57]
      apply.js                                  3
      blame.js                                  3
      cp.js                                     3
      diff_files.js                             3
      edit.js                                   3
      glob.js                                   3
      grep.js                                   3
      index.js                                 14
      list.js                                   3
      mkdir.js                                  3
      mv.js                                     3
      read.js                                   3
      remove.js                                 3  (rename to rm.js remains)
      stat.js                                   3
      write.js                                  4
    project/                                  [9]
      init.js                                   6
      list_branches.js                          3
    sandbox/                                 [33]
      close.js                                  7
      commit.js                                 4
      create.js                                 6
      exec.js                                   4
      mount.js                                  4
      status.js                                 4
      unmount.js                                4
```

`layerfs-daemon` (partial):

```text
core/crates/layerfs-daemon/src/            [662]
  lib.rs                                       18
  control/                                  [381]
    inspect.rs                                 65
    operations.rs                             316
  operator/                                 [218]
    mod.rs                                      4
    dispatch.rs                                12
    files.rs                                —   new
    inspect.rs                                202
    store.rs                                —   new
    workspace.rs                            —   new
  sdk/                                       [45]
    mod.rs                                     10
    dispatch.rs                                35
```

The daemon's `sdk/snapshot.rs` stays in public read implementation; it resolves
an immutable selected view and is distinct from the operator read model.
The old public inspect and process methods and `sdk/js/src/harness/` are removed.

## 6. Remaining work

The work beyond the API refactor, the operator surface, statistics and timing:

1. **Product behaviour.**
   - Opening a project and a Sandbox from another process (#329 A6, VERIFICATION A9): persisted records, a second process's control connection to a running Sandbox daemon, its authorization, and what happens to the per-process service Sandbox and process records. Recovery after a daemon or container restart stays out of scope and is stated as such.
   - Bounded text reads and blame (A2).
   - `fs.apply` grammar (A3).
   - `cp`, `mv`, `rm` and `mkdir`: recursive by default, exact destinations, refusals for an existing destination, a type clash or an overlap, symlinks handled as symlinks, hardlink groups and metadata kept, built in bounded and streamed form (A4).
   - Offset paging with stable order and documented admission limits (A5).
   - Paged changed paths and conflict paths in `status` (B3). This replaces today's fixed caps on Dirty, diffs and blame.
   - Proof that a Commit captures writes from a process started outside `exec`.
2. **Store format, one migration.**
   - Messages replace `agent` and `call`, and Commit identity changes (A1).
   - History facts: fork source, merged-from Layer, newer-write-wins decisions, displaced heads (B4).
   - Per-Commit size counters and Store totals (D).
   - Proposal: a new record and identity version (for example `layerfs/commit/v3`) with no migration of old Disposable Stores, since 0.1.7 is unreleased. Durable code keeps compiling and is not run.
3. **Proof and measurement.**
   - Migrate VERIFICATION.md to the 29 methods and the operator, keeping old receipts. Add cases for messages, paging defaults and offsets, line endpoints and truncation, recursive operations and symlinks, cross-process use, the migration and the counters. Each case is one command under 120 s.
   - A speed and storage screen for the counters, which run inside the publication transaction.
   - Resident memory for large merges (B9, not yet measured).
   - Rerun the D stories live.
4. **Open items carried from Phase 2.**
   - Zombie reaping in the Sandbox: an init in the container, or reaping in the daemon.
   - Kernel requests on replaced inodes (current FUSE policy).
   - The Phase 1 deviations to reconcile with the standard: a conflict installs the local base, one generic channel, the raised limit, fixed caps, `mount` returning an object.
   - Registry references to the deleted `shared_processes` test.
   - Benchmark harness tests that still call `stage_and_commit`.
5. **Packaging.**
   - The environment variables the constructor reads (home, Docker socket, image, daemon).
   - Native addon builds for the macOS host and Linux.
   - `package.json` exports for `@layerfs/sdk` and `@layerfs/sdk/operator`.
6. **UI server.**
   - Move to the new API and the operator, and drop the reconstruction code (fork points, merge details, the marker grep).
   - Keep agent attribution as the server's own records.
   - Generate the HTTP routes from the method tables.
   - Read mounted Workspaces through `exec` (B2).
   - Handle a stopped server without logging a failed poll every 3 s.
7. **Docs and release.**
   - Note in SPEC where the standard supersedes it.
   - Update the SDK README and API docs, the architecture docs the Store change touches, and the CAS handbook if counters are added.
   - Follow the release-policy steps for 0.1.7.

## 7. Order and decisions

The owner authorized agent judgment for A1, A2, A5, A6 and Store compatibility.
The selected contracts are in [DECISIONS-20261015.md](DECISIONS-20261015.md);
they are no longer waiting for an owner response. Reaping and replaced-inode
policy are explicitly deferred. Implementation and qualification remain open.

The other items have proposals that can be taken as defaults.

Order:
1. **Foundation completed at `3fb73808c`.** [A6 investigation](A6-INVESTIGATION-20261015.md), retained-oracle fixture cleanup, archived registry notice, environment configuration, macOS/Linux addon builds, and operator snapshot/process separation. The two failed harness checks remain failures; see Phase 4. Statistics and persistent discovery are still open.
2. **After A1, B4 and D.** The Store migration (item 6.2), first, because it is the riskiest change and the others build on it.
3. **After A2 and A5.** The public API migration (section 2), then `status` and the operator (sections 3 and 4).
4. **Cross-process,** from the investigation's result.
5. **Per-file history,** the UI server migration and the VERIFICATION migration, then the live D stories again.

## 8. UI preview already in `sdk_sim`

Commits 22–24 on the branch preview this plan in the simulator UI (`sdk_sim/tui.html`):
- per-command timing;
- a Store footer under the fs terminal with dedupe and compression rates;
- an overlay footer on each Workspace terminal;
- per-file statistics and a History tab in the Files pane.

Live mode shows real timing, overlay row counts and per-file revisions and sizes from fs reads. Stored bytes and metadata show as not reported. The simulator's numbers are labelled estimates:
- dedupe is whole-file only;
- deflate stands in for zstd, with no deltas;
- metadata uses fixed per-entry sizes.

The preview is demo tooling and not evidence of a product capability.
