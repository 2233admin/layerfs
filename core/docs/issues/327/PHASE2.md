# #327 Phase 2: verification against the real daemon and unit suites

> **Status:** Dated planning checkpoint (2026-10-15); not release evidence or a
> product contract. Tracking: [issue #327](https://github.com/Ephemeral-AI-Lab/layerfs/issues/327).
> Records the [VERIFICATION](VERIFICATION.md) A–C results and the unit-suite pass
> for the [SPEC](SPEC.md) implementation. These are correctness checks. No timing
> below is a performance claim.

## Identity

| Item | Value |
| --- | --- |
| Commit | `10e5991c4` (tree `7e14b7cd1d95`), branch `sdk-sim-terminals` |
| Linux daemon | `core/target/issue327/layerfs-daemon`, sha256 `9ed262055417a20509e87949ae1def6de9493c125f44a8bcf8518672445f6898`, release build in the pinned image |
| Build image | `sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6` |
| Node addon | `sdk/js/native/layerfs.node` (debug `layerfs-node`), sha256 `652d34d6c855fb6c…` |
| Store profile | Disposable / WAL / `synchronous=OFF`; Durable not executed |
| Construction | `LAYERFS_CONSTRUCTION_WORKERS=1` |

## A, B and C against the real daemon

Each case is its own command with a 120 s wall cap. Every command ran
sequentially, with one case per command:

```bash
python3 tmo.py 120 node sdk/js/test/verify/run.mjs <case>
```

`tmo.py` is a wall-timeout wrapper that kills the process group at the limit.
Each case gets a fresh Docker volume, a fresh Init of the offline fixture
(`sdk/js/test/fixture/website`) and its own Sandboxes. Teardown always runs.
Receipts are under `core/target/issue327/verify/` and record the commit, dirty
paths, daemon sha256 and image.

| Case | Result | Time | Receipt | Note |
| --- | --- | --- | --- | --- |
| A1 | PASS | 2.0 s | `a1-mv95do1r` | |
| A2 | PASS | 1.8 s | `a2-mv95du4t` | |
| A3 | PASS | 1.8 s | `a3-mv95dw16` | |
| A4 | PASS | 1.8 s | `a4-mv95e7je` | |
| A5 | PASS | 1.8 s | `a5-mv95edqx` | |
| A6 | PASS | 4.1 s | `a6-mv95eiuo` | |
| A7 | PASS | 2.4 s | `a7-mv95eqrw` | |
| A8 | PASS | 2.6 s | `a8-mv95ex7i` | |
| A9 | **FAIL** | 1.9 s | `a9-mv95f578` | Known gap: the binding keeps Sandboxes per process. A second process gets `NoSuchSandbox` for the same id. Owner item 1. |
| B1 | PASS | 1.8 s | `b1-mv95fale` | |
| B2 | PASS | 2.0 s | `b2-mv95fhkm` | |
| B3 | PASS | 1.9 s | `b3-mv95fno1` | |
| B4 | PASS | 1.9 s | `b4-mv95ftrq` | |
| B5 | PASS | 2.0 s | `b5-mv95g0cg` | |
| B6 | PASS | 1.9 s | `b6-mv95g6em` | |
| B7 | SKIP (JS) | 0.2 s | `b7-mv95gec1` | No SDK-level hook holds a Commit between merge and publish. The daemon test `mounted_parallel_commits` covers the publish-time race (see below). |
| B8 | PASS | 1.9 s | `b8-mv95gkbc` | |
| B9 | PASS | 2.1 s | `b9-mv95gq3f` | Outcome only. Resident memory during the 1.6 MB merge was not measured. |
| B10 | PASS | 2.7 s | `b10-mv95gyi0` | |
| B11 | PASS | 1.8 s | `b11-mv95h5ev` | |
| B12 | PASS | 1.8 s | `b12-mv95hhk5` | |
| B13 | PASS | 1.8 s | `b13-mv95ho8n` | |
| B14 | PASS | 1.8 s | `b14-mv95hyj5` | |
| B15 | PASS | 1.8 s | `b15-mv95i4q9` | |
| B16 | PASS | 2.0 s | `b16-mv95ibjx` | |
| C1 | PASS | 1.9 s | `c1-mv95ikz9` | |
| C2 | PASS | 1.9 s | `c2-mv95iru5` | |
| C3 | PASS | 1.8 s | `c3-mv95iyph` | Exercises the Status change in `818c03639` |
| C4 | PASS | 2.0 s | `c4-mv95j5cb` | One cancelled `sleep` remains a zombie: the Sandbox's first process is the daemon, which does not reap orphans. Owner item 2. |
| C5 | PASS | 1.8 s | `c5-mv95jci3` | A final newline shows an empty last line, as in the simulator |

Totals: 28 PASS, 1 FAIL (A9), 1 SKIP (B7). The same cases ran at `a0946dbff` before
the Status fix, with the same outcomes. D (UI integration) is Phase 3.

### Defects the cases found and fixed

| Case | Defect | Fix |
| --- | --- | --- |
| A1 | The controller's reply check had no arm for SDK answers | `2e8266b3e` |
| B10 | After a merged install, B saw stale `.next` entries (ENOENT, then EIO), and unmount was retained | `1543b86dc`: entry and inode invalidation before the Commit answers ([FUSE contract](../303/fuse.md) §4) |
| A7, C4 | Cancel reported `stopping` because `kill -0` sees zombies | `bf37ee80c`: liveness via `/proc` state |
| unit (`mount_control`) | Status read the Branch head from the Store (+5 SQL statements) | `818c03639`: the binding reads the head with a separate History request |

## Unit suites

Each crate ran in its own command with a 120 s cap. Linux runs used the pinned
image with `/dev/fuse`, `SYS_ADMIN` and `apparmor=unconfined`, with one container
per daemon test target.

| Crate | Host | Linux |
| --- | --- | --- |
| layerfs-content | 59 targets, 468 passed, 2 ignored | not run (no Linux-only tests) |
| layerfs-storage | 18 targets, 57 passed | not run (no Linux-only tests) |
| layerfs-persistence | 26 targets, 100 passed | 78 passed |
| layerfs-project | 9 targets, 19 passed | 18 passed |
| layerfs-history + layerfs-telemetry | 15 targets, 43 passed | telemetry 43 passed |
| layerfs-overlay | 14 targets, 55 passed | 55 passed, 1 ignored (owned directory) |
| layerfs-workspace | 28 targets, 167 passed | not run (no Linux-only tests) |
| layerfs-sandbox | 4 targets, 15 passed | not run |
| layerfs-bridge | 6 targets, 20 passed | not run |
| layerfs-api | 5 targets, 15 passed | not run |
| layerfs-fuse | 4 targets, 3 passed | 6 passed |
| layerfs-daemon | 49 targets, 33 passed, 1 ignored | lib + 46 targets, all pass |
| layerfs-node | 0 tests (exercised by A–C) | — |

Nothing failed at the final commit. Two Linux targets passed only when isolated.
Both are harness sensitivities that existed before #327:

- `forced_unavailable` needs a container where no earlier target mounted fusectl.
- `fp2_negotiation_flags` needs `--test-threads=1`. It counts process-wide
  `fuser-` threads, so with its three tests running in parallel it saw 6 instead of 2.

**Not run (preconditions):**

- `complete_installed_roots::huge_kernel_namespace_is_complete_after_install` needs
  a closed preparation (`LAYERFS_Q1_PREPARED`).
- `macos_init_handoff_to_linux_daemon_has_no_host_data_path` needs
  `LAYERFS_INSTALL_DAEMON_BINARY`. Its Linux role is `#[ignore]`d.
- `mounted_sqlite_full` device cases need an owned ext4 device.

### Tests deleted, converted and fixed

Deleted because they test removed behaviour:

- **Staging.**
  - persistence `atomic_publication`, `history_conditional_updates`,
    `history_history_pages`, `history_lifecycle` and `history_reopen`.
  - In `history_remediation`: three stage-based tests, plus the derived-provenance
    collision test. Commit ids now carry Branch and via, so its premise is gone.
- **Overwrite-on-stale.**
  - daemon `shared_processes` with its two support files.
  - `mount_control::kernel_mount_commit_status_fork_history_and_terminal_unmount`.
  - `store_commit::committed_up_to_date_overwrite_and_new_bind_preserve_exact_roots`.
  - `mounted_install` R5-4 (`a_later_commit_overwrites_the_branch_head_…`).
  - The last step of `mounted_cycles` FP-24. A stale Commit there is now a refused
    Conflict.
  - The last step of `mounted_concurrency` R6-3. A stale Commit there now merges.
  - The rest of FP-24 and R6-3 is kept and passes.

Converted: `mounted_parallel_commits`. Two Workspaces of one Branch commit while an
external flock holds Store admission. Both read the head before admission:

- One publishes its exact captured tree.
- The other is answered `HeadMoved` once, with nothing published. There is no
  overwrite and no second merge.

This covers B7's single-attempt rule at the daemon. It does not hold a Commit
after a merge that changed the tree.

Fixed for kept behaviour (shapes only):

- `CommitControl`/`UnmountControl` requests (plain unmount sends `discard: true`).
- `CommitOutcome::Committed { record, displaced }`.
- `Option` history in `CommitSuccess` (`None` is Conflict).
- History forwarding wrappers moved from `stage_*` to `commit_branch`,
  `merge_base`, `is_ancestor` and `merge_branch`.
- 11 tables in place of 12.
- `WorkspaceStatus` without `current_head`.
- The project history double and examples.

The commit messages of `f1284ed5a` and `10e5991c4` list each test.

## Commits

| Commit | Change | Production LOC |
| --- | --- | --- |
| `2e8266b3e` | (11) SDK answers in the reply check | 84,648 → 84,649 (+1) |
| `1543b86dc` | (12) kernel invalidation after a merged install | 84,649 → 84,807 (+158) |
| `bf37ee80c` | (13) binding commands, Busy unmount, process liveness | 84,807 → 84,833 (+26) |
| `a0946dbff` | (14) offline fixture and A–C driver | 84,833 → 84,833 (0) |
| `818c03639` | (15) Status issues no Store SQL | 84,833 → 84,814 (−19) |
| `f1284ed5a` | (16) persistence, project, bridge, api tests | 84,814 → 84,814 (0) |
| `10e5991c4` | (17) daemon tests | 84,814 → 84,814 (0) |

LOC is counted with the pinned `tools/production_loc.py` (sha256 `fff3777a…`) on
Git archives of the parent and the staged tree. The JS package counts as production.

## Open items for the owner

1. **A9, cross-process Sandbox ids.** The binding's Sandbox registry is
   per-process. Making a second process work with the id alone needs a
   control channel that the id can locate, such as a daemon-held socket per
   Sandbox. This is a design decision.
2. **Zombie reaping.** The Sandbox's first process is the daemon. Cancelled
   background processes stay as zombies, and liveness ignores them. Options:
   an init (for example `--init`) in the Sandbox container, or reaping in the
   daemon.
3. **Kernel requests on replaced inodes.** After an install, a request from a
   process holding a vanished inode is retained and makes the mount terminal.
   This is the existing FUSE policy. It is reported here, not changed.
4. **Phase 1 deviations from SPEC.**
   - A conflict installs the local base.
   - SDK calls use one generic channel.
   - The LIMIT was raised.
   - Tree diffs, blame and Dirty have fixed caps.
   - `mount` returns an object.
   - The package is plain JS.
5. **Historical registry entries.** Files under `core/benchmark/cluster-two/registry`
   still name the deleted `shared_processes` target.
6. **Benchmark harness tests.** The tests under `core/benchmark/fs-bench-pro/runtime/tests`
   (outside the workspace) still use `stage_and_commit`. They were not built.
7. **B9 memory.** B9 checks outcomes only. A resident-memory bound for large merges
   needs a measurement campaign.
