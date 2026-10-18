# #359 · §4.8 option (A): an mtime-only change stays live until unmount

| | |
| --- | --- |
| Trigger | STORAGE_BATCH_SPEC.md §4 design 8 ("§4.8", owner decision 2026-10-18): "The live Workspace still shows its own mtime until unmount; after a remount the committed mtime is what is seen." Liaison 2026-10-18: implement option (A), already an owner decision. Pre-existing failures: RCA §10.2 (`mounted_install`, two tests at `ee7e0fc51`) |
| Kind | code path only (overlay, Workspace construction, owner port). No format change, no schema change |
| Commit | on local branch `issue359-impl` (not pushed); this record lands with it |
| Status | implemented; verified by the tests below. No performance sample: the change runs only for mtime-only rows at Capture |

## Problem

#360 item 2 implemented the committed half of §4.8. Construction keeps the
inode's base row when only the mtime changed (`inodes.rs`, `value()` and
`unchanged()`), so history holds the base time. The live half was missing.
After the install, the mount's overlay row for that inode had been folded
away. The mount then showed the base time, through `lstat` and through the
kernel's cached attributes alike, which disagreed (R5-5a's `lstat`/forced
pair). §4.8 says the live view keeps its own time until unmount.

## Change

- `Overlay::keep_live_row` (`layerfs-overlay/src/namespace/inode.rs`), in one
  atomic job:
  - it checks the captured reader and reads the serial's row in the captured
    generation;
  - if the row is not already active, it writes it into the active
    generation through `put_inode`, as a first active row. Its cutoff is then
    the lower size, so every byte falls through to the layer below;
  - it bumps the revision and counts one dirty inode.

  The install then folds the captured generation into the base, and the
  mount still sees its live row on top.
- `CapturedNamespace::keep_live_row` port (`layerfs-workspace`), the Overlay
  impl delegates, and the owner client sends one General job
  (`layerfs-store-service/src/overlay/captured_namespace_port.rs`).
- Construction (`construction/namespace/inodes.rs`): `unchanged()` now
  returns the kept base metadata. When `value()` keeps the base row and the
  live mtime differs, it calls `keep_live_row`, and counts
  `work.live_rows_kept` when a row was carried.
- `outcome.rs`: the new work counter `live_rows_kept`. It is not yet in daemon
  telemetry.

Behaviour, matching option (A):

- The install keeps mtime-only rows active.
- History and fresh mounts show the base mtime.
- A later Commit with nothing else changed stays UpToDate.
- No invalidation is sent: the kernel already shows the live time.
- A later real change (bytes, kind, mode, target or entries) commits the live
  mtime it carries.

Cost: each Capture freezes the active generation, so a kept row is in the
captured generation at the next Commit, and construction carries it once
more. A row is re-carried until unmount or a real change. That is one owner
job and one row write per mtime-only path per Commit. It grows with the paths
touched that way, not with tree size, and it runs in construction, not in the
publication lane.

## Tests changed, and which half of §4.8 each checks

"Live" means the same mount keeps its own mtime. "Committed" means history and
a fresh mount show the base mtime.

| Test | Change | Half |
| --- | --- | --- |
| `mounted_install` R5-5a (`retained_descriptors_and_kernel_caches_are_unchanged_by_install`) | published root and fresh mount compare against `committed_view` of the base; same-mount expectations keep the touched times; the `lstat`/forced pair must agree (both 0 changes) | both |
| `mounted_install` r5-5b (`writes_during_a_commit_stay_live_and_reach_the_next_commit_fifty_to_a_directory`) | published root compares against `committed_view` over that Commit's stored root | committed |
| `mounted_commit` r5_1 | published root, fresh mount and `assert_kernel` use `committed`; the same mount keeps `expected` | both |
| `mounted_commit` r5_8 | a rolling committed view per round (round 2 has `touch -d`); the same mount keeps its own times | both |
| `mounted_commit` `an_mtime_only_edit_stays_live_and_a_later_real_change_commits_its_time` (new) | `touch -d` beside a real edit: history keeps the base time, the mount the touched time; then `chmod 0600` publishes `(0o600, touched time)`; a fresh mount equals that root | both, plus the edge |
| `r5_5_install_survival` (all four) | committed views with inode maps; the atime loop expects the committed time for mtime-only paths | both |
| `layerfs-workspace` `captured_namespace_holds` (created, held, unlinked) | the root (an mtime-only change) is kept live (`live_rows_kept` 1); the next Capture reads that one row, builds nothing, keeps the base identity and carries the row again (`(inode_rows, entry_rows)` `(0, 0)` → `(1, 0)`) | live |

Support code: `namespace_model::inode_numbers` (an `lstat` walk) and
`namespace_model::committed_view`. `committed_view` matches inodes by number.
An inode counts as the same when everything but mtime equals the base, and a
directory must also have the same bindings. Same inodes take the base's mtime.
The counting wrappers in `layerfs-workspace/tests/producer` and
`layerfs-daemon/tests/support/record_counts.rs` delegate `keep_live_row`.

### Also fixed: two history assertions read one page

`r5_8` ("five records, newest first") and the `r5_5` steps test ("one record
per position") read one History page and expected every Commit in it. Since
#327 (`a7db61fb3`, `555e85d89`, 2026-10-15) a `CommitRecord` encodes at up to
4,510 bytes. A page holds at most (16,384 − 176) / 4,510 = 3 records, whatever
`limit` asks. Both tests had been wrong since #327, hidden behind their
earlier mtime failure. The new `Rig::newest(count)` helper
(`tests/support/mounted_commit.rs`) follows the continuation; no assertion
was weakened.

## Proof

All runs used the pinned image, the Disposable Store and
`LAYERFS_CONSTRUCTION_WORKERS=1`, with each command ≤120 s.

- `layerfs-overlay` + `layerfs-workspace`: 226 passed, 0 failed.
  `layerfs-store-service`: 39 passed.
- `layerfs-daemon` targets, all pass:

  | Target | Passed |
  | --- | ---: |
  | `mounted_install` | 4 |
  | `mounted_commit` | 8 |
  | `r5_5_install_survival` | 4 |
  | `kernel_coherence` | 6 |
  | `kernel_mutation` | 2 |
  | `kernel_custody` | 2 |
  | `mounted_links` | 1 |
  | `mounted_cycles` | 4 |
  | `r5_1_actual_daemon_commit` | 1 |
  | `host_install` | 3 |
  | `mounted_rewind` | 1 |
  | `mounted_patterns` | 1 |
  | `mounted_parallel_commits` | 1 |
  | `store_commit` | 7 |
  | `mounted_execute` | 1 |
  | `negative_entries` | 2 |
  | `mounted_listing_reads` | 1 |
  | `mounted_drain` | 1 |
  | `mounted_concurrency` | 5 |
  | `mounted_serial_admission` | 4 |
  | `workspace_databases` | 2 |
  | `r5_9_dirty_mapping` | 1 |
  | `installed_store` | 3 |
  | `r5_10_producer_profile` | 1 |
  | `mounted_commit_failures` | 4 |
  | `mount_control` | 9 |
  | `fp27_reader_health` | 1 |

- R5-5a: 0 differences on the same mount, `lstat_changes=0`,
  `forced_stat_changes=0`.
- clippy (`-D warnings`, all targets) on overlay, workspace, store-service
  and daemon is clean. rustfmt is clean.

Not run:

- `complete_installed_roots` `huge_kernel_namespace_is_complete_after_install`:
  `NOT_RUN`, because it needs the explicit `LAYERFS_Q1_PREPARED` input, which
  this run did not prepare. The other 3 in that target pass.
- `concurrent_commits` stays as #352 F-020 left it.
- fs-bench-pro is frozen.

Intermittent, preserved:

- **Unmount `unwrap` at `tests/support/mounted.rs:133`** (`try_unmount`
  returned an error):
  - once in `mounted_commit` `r5_9_stores_through_shared_mappings_…`, in a
    run where `r5_8` panicked in the same process;
  - once in `mounted_cycles`
    `a_caller_blocked_on_a_full_pipe_neither_blocks_commit_nor_is_touched_by_unmount`.

  Each passed on one diagnostic rerun, and the next full runs of both targets
  passed. The error text was not captured; the run script now keeps it.
  Both tests leave a process or mapping alive across the unmount. Host load
  was 4.7–8. Not attributed to this change. Filed as **BUGS.md F-046** (open,
  owner unassigned); a rerun pass is not evidence of a pass.
- **r5-5b-50 precondition** ("no write was seen between capture and return"):
  failed once and passed on one diagnostic rerun. This is a timing
  precondition of the test, recorded earlier in this work.

## Production LOC

98432 → 98479 (+47). `tools/production_loc.py --root` on `git archive` of
the parent and of the staged tree: core 89750 → 89797, sdk 2635, dsh 6047,
and reference absent (retired R9c; last counted 65,417 at tree
`498dd1917812`).
