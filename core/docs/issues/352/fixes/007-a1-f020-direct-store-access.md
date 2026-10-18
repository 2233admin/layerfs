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
| Compatibility test | pass: the direct route opens `p2-main-b` range 9 (newest snapshot daemon `c25119ac` wrote) and passes range 9's whole-tree checkpoint with `compat.mjs` (below) |
| Binaries | daemon `c25119ac…`, addon `5baa0f5d…` → daemon `6d467539…`, Linux addon `sdk-linux-7ec591f1…` (with the configured daemon host; `sdk-linux-63f4b50e…` was steps 1–3) (both release, built at `c6a00cd42` in the pinned image `378b799e…`; `core/target/issue352/daemon-6d467539/`, `sdk-linux-63f4b50e/`) |
| Commits | `bceb54b90` steps 1–3 in one commit (the rebase onto fix 0 squashed them; one LOC line, labeled relocation): Production LOC 96,596 → 96,581 (delta −15), daemon 14,515 → 5,912, new `layerfs-store-service` 8,767, `layerfs-api` 2,182 → 1,801, sdk native 1,896 → 2,074, sdk JS 467 → 491. `9d23d0d81` test-only (delta 0); `63fe450ec` moved regression tests (delta 0); `6f9d44bc8` configured daemon host: Production LOC 96,581 → 96,617 (delta +36: `layerfs-api` +21, sdk native +12, sdk JS +3). Ids after the rebase onto `4323849d7` (the base's changes are tooling; LOC lines unchanged) |
| Regression tests | `sdk/js/test/verify/direct_locking_real.mjs`, `direct_refusal_real.mjs`, `direct_equivalence_real.mjs` (with `equivalence_sequence.mjs`), `daemon_host_real.mjs`; `core/crates/layerfs-store-service/tests/kernel_guard.rs` and the moved tests |
| Tests deleted | Owner: delete tests that drive Store calls through the daemon; tests of surviving behavior move with their code (lead correction, 2026-10-18). **Deleted outright:** `layerfs-daemon/tests/support/sdk_compare.rs` (the control-route harness), `layerfs-api/tests/sdk_admission.rs`, the two `branches_*` tests in `layerfs-api/tests/observed_control.rs`, `sdk/js/test/service-selection.mjs`, `sdk/js/test/verify/concurrent_reads_real.mjs`, `sdk/js/test/verify/fs_write_large_real.mjs`. **Moved to `layerfs-store-service/tests/`** (direct route: `sdk::dispatch` over a `StoreService`, harness `tests/support/sdk.rs`): `history_ancestry_oracle`, `history_diff_oracle`, `sdk_branch_count`, `sdk_chunk_deltas`, `sdk_compare`, `sdk_diff_entries`, `sdk_diff_pages`, `sdk_diff_size`, `sdk_grep_reads`, `sdk_history_depth`, `sdk_list_entries`, `sdk_mount_lookup`, `sdk_project_count`, `sdk_reads_during_publish`, `sdk_timing_coverage`. **Kept in the daemon:** `concurrent_commits` (daemon Workspace Commits, SDK calls in-process over the same Store). Converted: `mounted_commit` `Rig::history` and `mounted_cycles` fork read through the rig's Store handle (`9d23d0d81`). |
| Revert checks | Each guard fails with its fix reverted (temporarily, restored from Git; host, 115 s alarm; receipts `core/target/f020/revert-*.txt`): F-018 `sdk_reads_during_publish` with `Store::published` answering through the writer catalog: the read is refused after the 2 s writer admission window. Fix 0 `sdk_timing_coverage` without the `files.close` root: "no files.close root". F-022 `sdk_mount_lookup` with the name index bypassed: the name lists 11 Branches. F-012 `sdk_diff_entries` with plan reuse off: `a_paged_difference_plans_once` fails. F-026 `sdk_list_entries` with one uncached descent per entry: 411 → 540 statements, over the bound. F-008 `concurrent_commits` with a moved head refused: all 3 fail. F-010 `sdk_diff_pages`: the moved test **passed** a faithful revert (walk from the start, passing over listed pairs; its 25% bound is loose next to a page's own hunk cost at 120 changes), so `cursor_pages_without_hunks_pay_for_their_own_entries` was added (1,440 changes, paths only): fixed pages after the first cost 171, 171, 171, 162, 66 statements; reverted 252, 360, 468, 567, 567, failing at page 2 |
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
(as in the daemon), and the relocation (LOC lines in the Commits row: steps 1–3 −15 overall as a relocation; the configured daemon host +36).

## Step 0 attribution

Lead: use what exists. From `f020-diag0` (fork of `rb-p2-c25119ac-5baa0f5d`
range 3, range 4 played on the old route, trace
`~/lfs-history/runs/f020-diag0/trace/range-004.a1.jsonl`), client p50 vs the
p50 of the daemon's timing roots for the same calls, and the p50 of their
difference (time outside every daemon root: control round trip, framing,
encoding and connection queueing):

| Method | n | Client p50 ms | Daemon roots p50 ms | Outside p50 ms |
| --- | --- | --- | --- | --- |
| fs.read | 62 | 4.81 | 2.03 | 2.90 |
| fs.stat | 52 | 4.46 | 1.61 | 2.83 |
| fs.list | 59 | 5.94 | 2.82 | 2.68 |
| fs.grep | 61 | 5.93 | 2.60 | 3.01 |
| fs.glob | 57 | 5.41 | 2.00 | 3.11 |
| fs.diff_files | 31 | 6.96 | 3.51 | 2.51 |
| branch.fork | 11 | 2.24 | 0.16 | 2.01 |

Writes (`fs.write`, `fs.apply`, `fs.rm`) show roots summing above the client
time (nested roots), so their outside share is not separable from this trace;
the step 6 comparison measures them directly.

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

### Step 5 (at `6f9d44bc8`; daemon `6d467539`, addon `7ec591f1`, Sandbox image `d3773b4e`, client in `layerfs-352-runtime:node24`)

Each command one sample, under its 118 s alarm; logs in `core/target/f020/`.

1. **Locking**, `direct_locking_real.mjs outer` (4 s, pass). Two daemons
   in two Sandboxes on one volume plus the in-process SDK, publishes started
   together: two daemon Commits to `shared`, one each to `lane-a`/`lane-b`,
   two direct writes to `shared` (one to the path a daemon Commit also
   writes), one to `lane-c`, a merge. Outcomes: 7 published, `direct.same`
   refused `Conflict` ("the head moved and 1 path(s) conflict"); every
   Branch gained exactly one Commit per published call; every Branch's tree
   equals the serial oracle; 36 reads during publication, none refused, max
   3 ms; `PRAGMA integrity_check` = ok after every opener closed.
2. **Refusal**, `direct_refusal_real.mjs outer` (1 s, pass). In the
   container a Store path on a Docker Desktop bind mount (`0x6a656a63`) and
   on tmpfs are refused `Unsupported`, bytes unchanged, no overlay directory.
   macOS: `kernel_guard.rs` (host, pass).
3. **Equivalence**, `direct_equivalence_real.mjs` on forks of `p2-main-c`
   range 11 (sha256 `9f82a5ed…`): old arm on the host (daemon `c25119ac`,
   addon `5baa0f5d`, the parent's SDK JS, 10.2 s), new arm in-process (11 s).
   41 steps covering every Store method, errors included (`NameTaken`,
   `NoSuchPath`, `ReadOnly`, `NoMatch`, `Conflict`): replies equal after ids
   and times are normalized and compressed sizes masked; Store row counts
   equal in every table; Store used bytes equal (34,455,552); integrity ok on
   both. Compressed sizes differ old→new in 26 fields by at most 5 bytes;
   a control (old arm again on a third fork, `r11c`) differs old→old in 50
   fields by up to 4,096 bytes (metadata carries mtimes). The first attempt
   (`r11`) wrote under a missing `/eq` and is kept as a record; the
   sequence now makes `/eq` first.
4. **Compatibility**, fork `f025-f020-compat9` of `p2-main-b` range 9
   (sha256 `cc3983db…`, written by `c25119ac`) and `compat.mjs` range 9 on
   the direct route (4 s, pass): paths 207 git / 209 LayerFS, 2 metadata-only
   (`docs/rfc/README.md`, `packages/README.md`); 207 ids checked; whole tree
   860 files, no missing, extra, content or mode difference.
5. **Surviving suites**: above (steps 1–3), plus the moved tests on the host.

Harness notes: `run.mjs fork` and `compat.mjs` ran in
`core/target/f020/incontainer.sh`, the runtime image on the bridge network
with the Docker shim, `LAYERFS_RUNNER` and `LAYERFS_STORE_PATH` set as the
runner sets them. The builder's runner could not fork from this worktree:
it mounts only the checkout, and a worktree's `.git` points into the main
repository's (mounted read-only here).

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
- `core/benchmark/fs-bench-pro/runtime` no longer compiles: it calls
  `ProjectApi::fork` and `ProjectApi::commits`, removed in step 1 with the
  daemon Store route. `core/benchmark/deepseek-sdk-experiment` was already
  broken at the parent (`layerfs_history::CommitStagedOutcome`). Both are
  outside the workspace; their own lockfiles are also stale.
- The builder's runner uses `--network host`; the owner excluded Docker
  Desktop host networking. `LAYERFS_DAEMON_HOST=host.docker.internal` on the
  default bridge works (`daemon_host_real.mjs`).
- Pre-existing, not F-020 (above): the 3-record history page in `r5_8` and
  `r5_5` (`CommitRecord::MAXIMUM_ENCODED_BYTES` against the 16 KiB result
  budget is the first place to look); the parallel-test unmount `Busy` race in
  `kernel_mutation` and `mounted_install`.
- The kernel_mutation `Busy` (old 1/6, new 3/6) is a watch: existing race,
  not F-020 (lead, 2026-10-18).
