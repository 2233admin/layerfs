# Range 007 a1 · F-020 · Store calls open the Store in-process (direct route)

> Opened by the owner's liaison on owner direction, 2026-10-18; the fixer
> completes every row marked *pending* as the steps land. Implementation:
> [DIRECT_STORE_IMPL.md](../DIRECT_STORE_IMPL.md); decision and safety
> condition: [DIRECT_STORE.md](../DIRECT_STORE.md).

| | |
| --- | --- |
| Trigger | Owner direction after F-017/F-018 (range 7, attempt 1): Store calls must not depend on a Sandbox. Evidence: `rb-p2-c25119ac-5baa0f5d` range 4, fs.read 4.48 ms p50 at the client vs 0.12 ms traced daemon work; fs.write 11.69 ms vs 5.99 ms (DIRECT_STORE_IMPL.md §1) |
| Playbook step | D6 (time outside the operation: the control round trip) |
| Kind | 1 forward-only (REBUILD.md): Store calls move in-process, crate boundary; Store format unchanged |
| Old Stores | open unchanged |
| Old data | still read as before |
| Compatibility test | *pending*: the in-process SDK opens the newest `p2-main` snapshot written by daemon `c25119ac` and passes `compat.mjs` |
| Binaries | daemon `c25119ac…`, addon `5baa0f5d…` → daemon `6d467539…`, Linux addon `sdk-linux-63f4b50e…` (both release, built at `c6a00cd42` in the pinned image `378b799e…`; `core/target/issue352/daemon-6d467539/`, `sdk-linux-63f4b50e/`) |
| Commits | `7d88e7564` steps 1–3 in one commit (the rebase onto fix 0 squashed them; one LOC line, labeled relocation): Production LOC 96,596 → 96,581 (delta −15), daemon 14,515 → 5,912, new `layerfs-store-service` 8,767, `layerfs-api` 2,182 → 1,801, sdk native 1,896 → 2,074, sdk JS 467 → 491. `c6a00cd42` test-only (delta 0) |
| Regression tests | *pending*: `direct_locking_real.mjs`, the refusal test, `direct_equivalence_real.mjs` (against the old binaries) |
| Tests deleted | Owner: delete, do not convert. `layerfs-daemon/tests/`: `concurrent_commits.rs`, `history_ancestry_oracle.rs`, `history_diff_oracle.rs`, `sdk_branch_count.rs`, `sdk_chunk_deltas.rs`, `sdk_compare.rs`, `sdk_diff_entries.rs`, `sdk_diff_pages.rs`, `sdk_diff_size.rs`, `sdk_grep_reads.rs`, `sdk_history_depth.rs`, `sdk_list_entries.rs`, `sdk_mount_lookup.rs`, `sdk_project_count.rs`, `sdk_reads_during_publish.rs`, `sdk_timing_coverage.rs`, `support/sdk_compare.rs`. `layerfs-api/tests/sdk_admission.rs`; in `layerfs-api/tests/observed_control.rs` the two `branches_*` tests. `sdk/js/test/service-selection.mjs`, `test/verify/concurrent_reads_real.mjs`, `test/verify/fs_write_large_real.mjs`. Converted (surviving behavior, not old route): `mounted_commit` `Rig::history` and `mounted_cycles` fork read through the rig's own Store handle (`c6a00cd42`) |
| Recovery | no rebuild. After the proofs, re-measure the P2 baseline on the in-process SDK (ranges 0–4, fork of the range-4 snapshot, a new series), then continue `p2-main` from the next unplayed range |

## Old design

Every SDK Store call (fs, branch, project, operator) goes from the addon over
a control connection (`sdk/js/native/src/pool.rs`, `dispatch.rs`) into the
daemon in the agent's or the service Sandbox, which runs it in
`layerfs-daemon/src/sdk/` against the Store it opened. The Sandbox
contributes nothing to these calls; the round trip, framing and the
container crossing cost about 4–6 ms per call (step 0 attributes it).

## New design

The Store-call implementation moves into `layerfs-store-service`, used by
the addon; the daemon keeps using its `store/` and `overlay/` for Workspace
Commits. On Linux, with the Store on a local filesystem the daemons share, the addon opens the Store in-process (Disposable, explicitly)
and calls the same dispatch. Elsewhere Store calls fail `Unsupported`. The
daemon stops serving Store calls; it keeps Workspace calls only. One route, no
fallback, one attempt.

Cost: one more live opener of the Store (its writer admission shared with the
daemons), one private overlay file per write in the runner's temp directory
(as in the daemon), and the relocation (*pending*: LOC lines).

## Step 0 attribution

*pending*: per method, round trip vs encoding vs untraced daemon work.

## Proof

### Steps 1–3: build and surviving suites (at `c6a00cd42`)

- Linux test build in the pinned image, `cargo test --locked -j 2 -p
  layerfs-daemon -p layerfs-store-service -p layerfs-api --no-run`: pass. The
  first attempt at `-j` default ended with `ld terminated with signal 9`
  (the linker ran out of memory with parallel links; no compile error);
  `-j 2` built every target.
- Linux, each target in its own container (`core/target/f020/run-linux-test.sh`,
  115 s alarm; results `core/target/f020/linux-results.txt`): 55 targets, all
  pass except these, none caused by F-020:
  - `complete_installed_roots::huge_kernel_namespace_is_complete_after_install`:
    needs `LAYERFS_Q1_PREPARED` (explicit precondition; unrun, as recorded before).
  - `mounted_commit::r5_8_…` and `r5_5_install_survival::r5_5_a_commit_at_each_parked_step_…`:
    the history page returns 3 records where the test expects 5. The old
    binaries (`layerfs-f009` build, fix 0 source) fail the same assertion
    lines, so this is pre-existing, not F-020. Finding left open below.
  - `kernel_mutation::write_append_…` (and once `mounted_install::a_directory_of_more_than_one_name_window_is_listed`):
    the terminal unmount gets `Busy` from the kernel (plain `umount2` EBUSY).
    Labeled count-driven diagnosis, full target in fresh containers: old
    binary 1/6 Busy, new 3/6; the test alone 0/6 old and 0/6 new, and 0/20 each
    when repeated in one container. Pre-existing race between the target's
    parallel tests in one process; the counts are too small to call a rate
    change. Finding left open below.
- Host (macOS) `cargo +1.85.1 test --locked` for the three crates: pass except
  `host_handoff` (needs `LAYERFS_INSTALL_DAEMON_BINARY`; unrun, as before).
  `kernel_guard` passes on both: macOS refuses `Unsupported` naming Linux;
  Linux refuses `/dev/shm` (tmpfs) naming "ext4, xfs or btrfs", the Store
  bytes unchanged and no template created.
- SDK JS: `test/trace.mjs` all 8 cases on the host (fake native);
  `test/reinit.mjs`, `test/packaging.mjs lazy` and `dispatch` in
  `layerfs-352-runtime:node24` with the new Linux addon: pass.

### Step 5

*pending*: locking, refusal, equivalence, compatibility; each with its
command, duration and result.

## Performance, old vs new

Same snapshot fork, same cache state, one sample per case; each series labeled
with its binaries.

| Measure | Snapshot | Cache | Old binaries (`c25119ac`/`5baa0f5d`) | In-process (*pending*) | Change |
| --- | --- | --- | --- | --- | --- |
| fs.read p50 / p95 | | | | | |
| fs.stat p50 / p95 | | | | | |
| fs.list p50 / p95 | | | | | |
| fs.grep p50 / p95 | | | | | |
| fs.write p50 / p95 | | | | | |
| fs.apply p50 / p95 | | | | | |
| branch.fork p50 | | | | | |
| branch.merge p50 | | | | | |
| branch.publish p50 | | | | | |
| SQL statements per call (each method) | | | | | |
| Store bytes after the equivalence sequence | | | | | |

## Layout as built

*pending*: the vertical listing at the final commit, replacing
DIRECT_STORE_IMPL.md §5.

## Decisions (fixer, recorded)

- `operator.inspect.snapshot` stays a daemon call: it reads that daemon's
  Workspaces, not the Store. `operator.workspace.overlay` and
  `operator.workspace.changes` likewise. Every other operator call runs in
  the SDK's process.
- The daemon answers a Store method `UnknownMethod` ("Store calls are not
  served by the daemon; they run in the SDK's process"); the control records
  `Fork`, `Branches` and `History` are refused `Invalid`. The bridge keeps the
  record types (wire compatibility); the connection still drains a refused
  call's declared bodies.
- The daemon's `Service` holds no `StoreService`; the daemon keeps its own
  Store handle for Workspace Commits.
- `LAYERFS_STORE_PATH` is the environment twin of `storePath`. One
  `StoreService` per Store path per process, opened by the first client and
  closed at the process's last `client.close()`; its private overlays live in
  `layerfs-store-<pid>-<n>` in the temp directory and go with it.

## New-file inode reservation (F-025 scope, designed here once)

Today each SDK file-changing call builds a private Workspace whose serial
ranges start empty, so its first new inode calls `history.reserve_inodes`, a
Store writer transaction that queues behind a Commit holding the publication
lane (fix 0: 29 ms of `files.change` under the 6-writer probe). The daemon's
mounted Workspaces already refill early (`SERIAL_REFILL` 1,024, low water) and
do not show it.

Design, for F-025 fix 3 in `layerfs-store-service` (the route this fix
creates, so it is designed once):

- `StoreService` owns one serial pool per scope, a `Mutex<Vec<(next, end)>>`
  of ranges reserved from the catalog in blocks of `POOL_BLOCK` serials.
  `StorePorts`' `InodeSerials` takes `SERIAL_REFILL` serials from the pool
  under that mutex (memory only, no Store work).
- The pool is refilled inside a writer transaction that already runs: the
  Commit's publication transaction reserves one more block when the pool is
  below its low water. A write therefore never opens a writer transaction to
  number its inodes, except when the pool is empty (the first write of a
  process, or a burst that exhausts it before a publish). That one case makes
  one `reserve_inodes` call, as today.
- Bounded and single-attempt: one block per publish at most, no retry, no
  worker. Serials stay consumed whether used or not, as today; the 63-bit
  space is not a practical limit.
- Proof: the 6-writer probe shows the reservation's `wait.*` node near 0
  while merges run; a unit test shows two concurrent writes under a held
  publication lane take serials without a writer wait.

## Left open

- None from the route choice: the owner chose one route, Linux only, and
  root AGENTS.md records it (2026-10-18). An SDK process on macOS gets
  `Unsupported` for Store calls; the dsh web app must run in a Linux container
  to use them.
- Pre-existing, not F-020 (above): the 3-record history page in `r5_8` and
  `r5_5` (`CommitRecord::MAXIMUM_ENCODED_BYTES` against the 16 KiB result
  budget is the first place to look); the parallel-test unmount `Busy` race in
  `kernel_mutation` and `mounted_install`.
- The deleted daemon SDK tests included regression tests of earlier fixes
  (`sdk_reads_during_publish` F-018, `sdk_timing_coverage` fix 0). Per the
  owner they were deleted, not converted; step 5's equivalence covers the
  behavior, and the lead may want new tests over `layerfs-store-service`.
