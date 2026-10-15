# #327 implementation plan: SDK standard, operator surface and statistics

> **Status:** Implemented plan and source map; target LayerFS 0.1.7; not release evidence.
> Dated 2026-10-15. Tracking: [issue #327](https://github.com/Ephemeral-AI-Lab/layerfs/issues/327),
> [#328](https://github.com/Ephemeral-AI-Lab/layerfs/issues/328) (the revised SDK standard) and
> [#329](https://github.com/Ephemeral-AI-Lab/layerfs/issues/329) (the decisions this plan depends on).

## 1. Authority and scope

This plan describes how to take the current implementation to the revised
[public JavaScript SDK standard](https://github.com/Ephemeral-AI-Lab/layerfs/blob/5321d6de320dcbd41402db9cb41aa36bceabdf4c/core/docs/issues/327/SDK-STANDARD.md).
It also covers the operator surface, Store statistics and timing that the UI
needs. The standard governs the public API. #329 decisions were delegated and recorded; dated receipts establish checked scope.

The original plan basis is `daacdb13c`. The latest implementation evidence is the dated Phase 5 checkpoint;
[PHASE4-20261015.md](PHASE4-20261015.md) remains the foundation receipt.
The branch remains local and unpushed. The [decision record](DECISIONS-20261015.md)
records delegated judgment and the owner's explicit deferrals.
- [PHASE2.md](PHASE2.md) records the A–C verification against the real daemon.
- [PHASE3.md](PHASE3.md) records the live UI (D1–D6) and the UI previews made since.
- The [SPEC](SPEC.md) stays the architectural and UI-integration background where
  the standard does not supersede it.
- [VERIFICATION](VERIFICATION.md) is migrated to the standard.

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

Changes from the pre-standard SDK:
- **Removed:** the `agent` and `call` parameters, `remove`, `inspect.snapshot`, `list_processes`, `cancel`, the harness exports, and options objects on ordinary methods.
- **Unchanged:** current file size is `fs.stat(...).size` in the public SDK.

## 3. Operator surface

UI and diagnostic views live behind an internal entry point, `@layerfs/sdk/operator`.
It uses the same `{group}/{method}` layout and positional paging. The public root
entry point does not export it, and a public call cannot reach it.

| Group | Method | Returns |
| --- | --- | --- |
| `store` | `stats()` | `{ logical, canonical, stored, metadata, file, free, dedupe, compression }` |
| | `commits(branch, pageSize?, pagePos?)` | Per Commit, newest first: `{ commit, logical, newCanonical, newStored, newMetadata }` |
| `files` | `stats(ref, path)` | `{ size, revisions, logical, canonical, stored, metadata }`; `revisions` is exact up to a limit, otherwise reported as more than the limit |
| | `history(ref, path, pageSize?, pagePos?)` | Revisions newest first: `{ commit, change, size, object, newCanonical, newStored }` |
| `workspace` | `overlay(sandbox, path)` | `{ inodes, entries, payload, metadata, changes: { added, modified, removed } }` |
| | `changes(sandbox, path, pageSize?, pagePos?)` | Changed paths and the paths that still hold conflict markers |
| `process` | `start(sandbox, path, command)`, `list(sandbox)`, `cancel(sandbox, process)` | The Sandbox's processes; Stopped |
| `inspect` | `snapshot(since?)` | The UI read model, including `store.stats` and each Workspace's overlay |

Where each part lives:
- **Rust.** Operator methods are in `layerfs-api/src/operator/` with their own `operator::call()`, and in `layerfs-daemon/src/operator/` with their own dispatch.
- **Method names.** Operator names are `operator.<group>.<method>`. Public dispatch refuses them at every layer: `layerfs-api`'s `call()`, the daemon's `sdk/` dispatch and the native `call()`.
- **Process control.** `process.start`, `process.list` and `process.cancel` stay in the native binding's executor (`sdk/js/native/src/exec.rs`). The Sandbox, or an external executor, owns command launch and cancellation, and the filesystem daemon supervises no commands.
- **HTTP.** HTTP is not a product surface. The demo server in `sdk_sim/server/` maps `/api/{sdk|operator}/{group}/{method}` onto the two method tables: GET with query parameters for reads, POST `{ "args": [...] }` for anything that changes state. This respects the rule against reviving a host data-path server. A remote or multi-user operator API would be a separate product decision.

## 4. Statistics and timing

All sizes are bytes.

| Term | Meaning |
| --- | --- |
| logical | regular-file sizes across immutable Commit and Layer states, counting hardlink paths |
| canonical | bytes of distinct canonical objects, after CAS dedupe, chunking and framing |
| stored | physical bytes after compression and delta encoding (`pack.length`) |
| metadata | metadata-domain pack bodies plus occupied SQLite bytes outside all pack bodies |
| file / free | logical database pages / reusable pages in bytes; file includes pages currently in WAL, not separate WAL allocation |
| dedupe | `logical / canonical` |
| compression | `canonical / stored` |

Sources:
- **Store totals and per-Commit counters.** Recorded at each publication. Each Save already knows which objects it reused and which it wrote, and `object_location.canonical_length` and `pack.length` already exist. Keeping totals avoids a full scan per request. This is a Store format change and belongs to the same migration as messages (section 6).
- **Per-file revisions and sizes.** A paged walk along first parents that compares the file's object id; current size is `fs.stat`.
- **Per-file stored bytes.** These need a per-path table, which comes later. Until then, `newCanonical` and `newStored` for a file are `null`.
- **Overlay.** The overlay's existing `StoredCounts` and the Dirty listing.
- **Timing.** Measured by the UI server around each call: the SDK call, the refresh and the HTTP round trip. It is shown as a diagnostic and is not an SDK method or a measurement under the measurement policy.

## 5. Implemented source layout

Pinned product source is `ce41af000` (unchanged by subsequent demo/test/docs
commits). Counts below are the `prod` column from `tools/production_loc.py --files`
on that exact staged/committed production export (`v5-staged`). Tests, examples,
build scripts and sdk_sim are outside production LOC. No planned files are
required merely because an older proposal named them.

`layerfs-api` — complete src scope:

```text
core/crates/layerfs-api/src/                                        [1981]
  lib.rs                                                                22
  base/                                                             [723]
    control.rs                                                         230
    failure.rs                                                          51
    install.rs                                                         147
    install_types.rs                                                    44
    internal.rs                                                        143
    mod.rs                                                               8
    recovery.rs                                                         52
    sdk.rs                                                              48
  branch/                                                           [92]
    diff_branches.rs                                                     6
    diff_commits.rs                                                      6
    fork.rs                                                             28
    list_commits.rs                                                     28
    merge.rs                                                             6
    mod.rs                                                              12
    publish.rs                                                           6
  fs/                                                               [112]
    apply.rs                                                             6
    blame.rs                                                             6
    cp.rs                                                                6
    diff_files.rs                                                        6
    edit.rs                                                              6
    glob.rs                                                              6
    grep.rs                                                              6
    list.rs                                                              6
    mkdir.rs                                                             6
    mod.rs                                                              28
    mv.rs                                                                6
    read.rs                                                              6
    rm.rs                                                                6
    stat.rs                                                              6
    write.rs                                                             6
  operator/                                                         [31]
    call.rs                                                             21
    mod.rs                                                               3
    inspect/                                                        [7]
      mod.rs                                                             2
      snapshot.rs                                                        5
  project/                                                          [197]
    init.rs                                                            161
    list_branches.rs                                                    30
    mod.rs                                                               6
  sandbox/                                                          [804]
    close.rs                                                            36
    commit.rs                                                           41
    create.rs                                                          333
    exec.rs                                                             39
    mod.rs                                                              20
    mount.rs                                                           117
    status.rs                                                           15
    unmount.rs                                                          51
    values.rs                                                          152
```

`layerfs-daemon` — partial src scope, operator/sdk files only:

```text
core/crates/layerfs-daemon/src/                                     [3458]
  operator/                                                         [812]
    dispatch.rs                                                         22
    files.rs                                                           175
    inspect.rs                                                         237
    mod.rs                                                               7
    store.rs                                                            67
    workspace.rs                                                       304
  sdk/                                                              [2646]
    args.rs                                                            169
    blame.rs                                                           249
    branch.rs                                                          470
    compare.rs                                                         291
    dispatch.rs                                                         45
    edit.rs                                                            113
    files.rs                                                           187
    mod.rs                                                              14
    mutation.rs                                                        202
    reads.rs                                                           234
    recursive.rs                                                       277
    snapshot.rs                                                        173
    window.rs                                                          222
```

`layerfs-node` — complete native src:

```text
sdk/js/native/src/                                                  [1345]
  convert.rs                                                            87
  discovery.rs                                                         397
  dispatch.rs                                                           85
  exec.rs                                                              253
  job.rs                                                                48
  lib.rs                                                                19
  project.rs                                                            86
  registry.rs                                                           78
  sandbox.rs                                                           292
```

`@layerfs/sdk` — public and internal JavaScript only (native counted above):

```text
sdk/js/                                                             [317]
  operator/                                                         [56]
    index.js                                                            25
    inspect/                                                        [23]
      snapshot.js                                                       23
    process/                                                        [8]
      cancel.js                                                          4
      list.js                                                            4
  src/                                                              [261]
    client.js                                                           50
    errors.js                                                           17
    index.js                                                            54
    native.js                                                           11
    branch/                                                         [22]
      diff_branches.js                                                   4
      diff_commits.js                                                    4
      fork.js                                                            3
      list_commits.js                                                    4
      merge.js                                                           4
      publish.js                                                         3
    fs/                                                             [66]
      apply.js                                                           4
      blame.js                                                           3
      cp.js                                                              4
      diff_files.js                                                      3
      edit.js                                                            4
      glob.js                                                            4
      grep.js                                                            4
      index.js                                                          14
      list.js                                                            4
      mkdir.js                                                           4
      mv.js                                                              4
      read.js                                                            3
      rm.js                                                              4
      stat.js                                                            3
      write.js                                                           4
    project/                                                        [8]
      init.js                                                            4
      list_branches.js                                                   4
    sandbox/                                                        [33]
      close.js                                                           7
      commit.js                                                          4
      create.js                                                          6
      exec.js                                                            4
      mount.js                                                           4
      status.js                                                          4
      unmount.js                                                         4
```

## 6. Implementation and acceptance disposition

The Store format, messages/history facts, 29-method public table, operator
methods, private cross-process discovery and UI table migration are implemented.
The [counter screen](COUNTER-SCREEN-20261015.md) preserves v2/v3/v4 FAIL and the
v5 PASS that permits retention. The [current SPEC](SPEC.md) and
[SDK implementation guide](../../../../sdk/js/README.md) own concrete boundaries.

The dated Phase 5 checkpoint records source/binary identities and every selected
check, including failures and corrections. S328 and XPROCESS are new proofs;
A9 retains its historical FAIL/open status. Zombie reaping and replaced-inode
FUSE policy remain deferred by the owner. B7 remains an explicit deterministic
race-proof gap rather than a guessed PASS. Durable is NOT_RUN — disabled until
explicit owner reauthorization. There is no push, PR or release admission.

## 7. Decisions and order

The owner delegated A1/A2/A5/A6/Store choices with "no need to ask, do your best
judgement", then authorized completion without further questions. Selected
contracts and explicit deferrals are in [DECISIONS](DECISIONS-20261015.md).
Store/history and counter verification preceded final SDK/operator, cross-process
and UI acceptance. Historical Phase 2/3/4 checkpoints retain their original scope.
