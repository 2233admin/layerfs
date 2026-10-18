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

Step 6 (2026-10-18), at `a2169f652` (branch rebased on `280ed3d6d` for the
F-028 apply fix). Two forks of the same `p2-main-c` range-11 snapshot
(`9f82a5ed…`), one measured range-12 play each, both inside the runner-like
container (`core/target/f020/incontainer.sh`, `layerfs-352-runtime:node24`,
default bridge, `LAYERFS_DAEMON_HOST=host.docker.internal`), Sandbox image
`d3773b4e`, Disposable profile, one sample per arm.

- Old `f025-f020-s6b-old`: daemon `c25119ac`, Linux addon `7df89707` and
  SDK JS from `a5a0915cd` (the source of macOS addon `5baa0f5d`, which is not
  loadable on Linux) plus only the connect-host change. Daemon route.
- New `f025-f020-s6b-new`: daemon `6d467539`, addon `7ec591f1`, worktree SDK
  JS. In-process route.

Both checkpoints ok (diff_commits plus a full compareTree), verdict watch on
both. Series use the runner's own classing (`readTrace`/`markContention`,
`adb6dbb83`): contended means a Commit or merge overlaps the call. ms is
p50 / p95; SQL is the statements p50 per call (the call's connection-window
counters).

| Op | Series | n old/new | Old ms | New ms | SQL old → new |
| --- | --- | --- | --- | --- | --- |
| fs.read | uncontended | 9/11 | 6.57 / 9.43 | 2.81 / 3.32 | 168 → 171 |
| fs.read | contended | 33/31 | 5.96 / 9.24 | 2.89 / 4.41 | 237 → 271 |
| fs.write | uncontended | 195/179 | 12.26 / 16.65 | 9.30 / 14.58 | 523 → 553 |
| fs.write | contended | 427/443 | 16.19 / 71.19 | 12.88 / 46.30 | 937 → 1072 |
| fs.list | uncontended | 8/11 | 6.70 / 9.83 | 2.73 / 3.82 | 279 → 177 |
| fs.list | contended | 33/30 | 7.96 / 14.31 | 2.70 / 4.50 | 392 → 255 |
| fs.stat | uncontended | 5/8 | 5.27 / 8.27 | 1.90 / 2.70 | 111 → 114 |
| fs.stat | contended | 34/31 | 5.58 / 13.41 | 2.46 / 3.52 | 195 → 204 |
| fs.grep | uncontended | 6/8 | 7.86 / 16.28 | 4.98 / 18.83 | 366 → 264 |
| fs.grep | contended | 34/32 | 9.57 / 70.79 | 5.55 / 69.37 | 535 → 594 |
| fs.apply | uncontended | 6/10 | 11.46 / 13.89 | 9.68 / 14.05 | 267 → 819 |
| fs.apply | contended | 45/41 | 15.27 / 23.11 | 13.56 / 167.57 | 754 → 1000 |
| branch.fork | uncontended | 7/7 | 3.35 / 3.80 | 0.61 / 1.62 | 16 → 16 |
| branch.merge | uncontended | 3/3 | 275.0 / 275.0 | 286.1 / 286.1 | 7294 → 7294 |
| branch.publish | uncontended | 1/1 | 6.40 | 5.51 | 753 → 753 |

No merge, fork or publish call was contended in either arm.

Store after range 12: file 38,203,392 → 38,240,256 B (+36,864, +0.10%);
stored 22,093,975 → 22,093,613 (−362); metadata 28,283,521 → 28,320,642
(+37,121); logical and changed bytes equal within 21,702 B of 39.9 GB;
commits 8,519, layers 10 and Branches 64 on both.

Workspace calls: every method's count and outcomes are identical (mount 68,
exec 153 exit 0, commit 32 Committed / 31 UpToDate / 1 Conflict, unmount 68,
fs.write 620 Committed / 2 UpToDate). The only difference is
`sandbox.service` (7 calls, old only): the Sandbox the daemon route needed
for Store calls, which this change removes.

**Against DIRECT_STORE_IMPL §4:**

| Criterion | Result |
| --- | --- |
| Read p50 lower | met: read 6.08 → 2.84 ms; stat 5.58 → 2.43; list 7.34 → 2.73 (all calls) |
| Write p50 not higher | met: 14.73 → 11.81 ms (all), 12.26 → 9.30 uncontended |
| Workspace calls unchanged | met |
| SQL per call equal | met where the counters are the call's own; **missed** in the aggregate rows |
| Store bytes equal | **missed**, +0.10% file bytes (metadata) |

Diagnosis of the two misses (receipts `core/target/f020/s6b-*.txt|json`):

1. The SQL counters are the shared connection's work during the call's
   window, so they include work from overlapping calls. Paired across arms
   by step, method and index, and limited to calls that no other call
   overlaps, every pair is equal: fork 7/7, merge 3/3, publish 1/1, rm 2/2,
   diff_commits 2/2. Writes are 86/99 equal, mean 517.7 → 516.7; the 13
   that differ are reconcile writes (±3–48 statements). No read, list,
   stat, grep or apply call ran fully alone in either arm. The old arm also
   lacks three product fixes between `a5a0915cd` and F-020's base: F-022
   (bind by name), F-026 (list memo; list SQL −35% is that fix) and F-025
   fix 0 (timing spans). Its rows are not F-020 alone.
2. Concurrent plays interleave differently: merge-at-publish ran 9 times
   in the old arm and 10 in the new. Merges, ids and tree nodes then differ,
   and so do metadata bytes. The serial equivalence proof (step 5, `r11b`)
   has equal Store rows and equal used bytes, 34,455,552 on both.
3. The contended apply p95 (23 → 168 ms) and the write p95 tail are time
   spent queued for the writer or the lane behind a merge (~280 ms), not
   route work. Without wait.writer, lane and begin: write p50/p95 13.73 /
   30.43 → 9.47 / 15.93 ms; apply 13.86 / 21.71 → 9.79 / 15.11. The new play
   runs faster (play 8,239 → 7,401 ms), so more calls queue behind the same
   merges: 15 writes vs 7 and 5 applies vs 1 wait over 50 ms. Lane time
   belongs to F-025 fix 1 (merge path naming by change size).

Playbook finding (fixer): on a concurrent play, "SQL per call equal" and
"Store bytes equal" cannot be judged from aggregates. Judge them from
isolated pairs and from the serial equivalence sequence, and build the old
arm from F-020's parent so the comparison is F-020 alone. Neither attempt
reached optimize or stop, so no `finding-NNN.aK.json` is due.

Kept until the table is accepted: volumes `layerfs-issue352-f025-f020-s6b-{old,new}`,
`-s6-{old,new}` (the F-028 stop at `r012.s0021`, before the rebase),
`-compat9` and `layerfs-issue352-f020-eq-r11{,b,c}-{A,B}`.

## Layout as built

At `a2169f652`, production LOC by `tools/production_loc.py --files`. The
crates and SDK native module F-020 created or changed; tests live under each
crate's `tests/` and are not counted. The daemon keeps its Workspace-only
service and the remaining ports.

```
layerfs-store-service/src/        [8767]  (new crate; Store code moved from layerfs-daemon)
  bootstrap.rs                       209
  kernel_guard.rs                     49  (new: refuses bind mount and tmpfs)
  lib.rs                              17
  store_service.rs                   158  (new: StoreService, open_direct)
  telemetry.rs                       323  (moved from layerfs-daemon)
  operator/                        [512]
    files.rs                         175
    inspect.rs                       237
    mod.rs                            19
    store.rs                          81
  overlay/                        [2035]
    backing.rs                       118
    captured_namespace_port.rs        67
    captured_run_port.rs              39
    file_port.rs                      39
    kernel_operations.rs             119
    lifetime_operations.rs           123
    mod.rs                            13
    operation_record_port.rs         105
    owner.rs                         592
    read_operations.rs               172
    read_port.rs                      88
    scopes.rs                         72
    state.rs                          93
    workspaces.rs                    395
  sdk/                            [3048]
    args.rs                          159
    blame.rs                         248
    body.rs                          104
    branch.rs                        523
    compare.rs                       414
    dispatch.rs                       49
    edit.rs                          113
    files.rs                         227
    mod.rs                            17
    mutation.rs                      237
    plans.rs                          26
    reads.rs                         242
    recursive.rs                     277
    snapshot.rs                      166
    window.rs                        246
  service/                          [79]
    mod.rs                             4
    observations.rs                    9
    owner_work.rs                     51
    results.rs                         7
    startup.rs                         8
  store/                          [2337]
    bind.rs                          126
    captured.rs                      236
    commit.rs                        337
    commit_merge.rs                  198
    commit_types.rs                  209
    hints.rs                          46
    mod.rs                            31
    open.rs                          150
    operation.rs                      74
    ports.rs                         204
    producer.rs                       70
    read_handle.rs                   176
    read_service.rs                  287
    recognizer.rs                     94
    settle.rs                         27
    statistics.rs                     14
    types.rs                          58

sdk/js/native/src/    [1525]  (partial: files F-020 changed)
  direct.rs              165  (new: in-process Store route)
  discovery.rs           496
  dispatch.rs             97
  job.rs                  83
  lib.rs                  30
  pool.rs                144  (daemon host)
  sandbox.rs             431
  trace.rs                79
```

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
- **Known break, left for the owner (direction 2026-10-18: do not touch,
  build or run fs-bench-pro):** `core/benchmark/fs-bench-pro/runtime` no
  longer compiles against this API. Call sites:
  `src/session.rs:582` (`ProjectApi::new().fork`), `src/session.rs:628`
  (`ProjectApi::new().commits`), `src/session.rs:8/97/118` (`ForkRequest`
  imports and builder for the daemon fork), and the `SandboxCreate` literal
  at `src/runtime.rs:74` (no `connect_host`). Its `tests/session_protocol.rs`
  fork/history parse tests depend on the same session code. A compile fix
  was made and then dropped from the branch (local ref
  `f020-fsbench-cancelled-3c56bdb09`); `a2169f652` removes the one line the
  daemon-host commit had added there. fs-bench-pro is not a member of the
  core workspace, whose build passes (host +1.85.1 at `a2169f652`, 50 s;
  Linux at the same product source, 15 m 25 s with `-j 2`, over the 2-minute
  command limit, reported). `core/benchmark/deepseek-sdk-experiment` was already
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
