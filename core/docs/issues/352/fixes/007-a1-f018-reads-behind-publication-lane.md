# Range 007 a1 · F-018 · SDK reads stop queueing behind a Commit's publication lane

| | |
| --- | --- |
| Trigger | The lead did not accept F-017's p95 rise without attribution: `fs.read` 43 → 93 ms, `sandbox.commit` 93 → 133 ms. Approved diag plays of range 8 per addon, with the Docker VM's CPU sampled. BUGS.md F-018 |
| Playbook step | D6 (time outside the operation: a wait on a lock the read does not need) |
| Kind | 1 forward-only (REBUILD.md): daemon and persistence code paths only |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | **passed**: a range-4 fork of `p1-pilot-b` written by `511dceed`, read by daemon `c25119ac` through addon `5baa0f5d`, passes the whole-tree proof checkpoint (530 files) with `dsh/tools/history/compat.mjs` |
| Binaries | daemon `361bb09e…` (kept in `core/target/issue352/daemon-361bb09e/`) → `c25119ace6ae9a10d6e67618b114c031676e5065680db4e47ab0beb3a1759031`, kept in `core/target/issue352/daemon-c25119ac/`. An intermediate daemon with only cause 1 fixed, `f1fb9f49`, is kept in `core/target/issue352/daemon-f1fb9f49/`. SDK addon `5baa0f5d` unchanged |
| Commits | the commit that adds this file. Regression tests: `core/crates/layerfs-daemon/tests/sdk_reads_during_publish.rs` and `core/crates/layerfs-persistence/tests/diagnostics_during_lane.rs` |
| Recovery | fork the `p2-main` range-7 snapshot onto daemon `c25119ac` and addon `5baa0f5d`, then rerun range 7 measured as attempt 2 with the corrected gate (F-016) |

## Attribution (range 8, diag runs kept)

The runs below were all played on fresh forks of the `p2-main` range-7
snapshot. Their folders are kept until the lead accepts the result:
`~/lfs-history/runs/diag-f017c-old`, `diag-f017c-new`, `diag-f018` and
`diag-f018b`. Each folder holds its trace, metrics, a `cpu.log` sampled once a
second from inside a container, and the analysis scripts (`f017-tail.mjs`,
`f017-lane.mjs`).

- **CPU is not the cause.** The VM has 8 CPUs. Busy CPU had a p50 of 22–28%
  and a maximum of 50% in every arm, and iowait stayed at or below 2.2%.
- **Not the client.** For the slowest reads on the new addon, connection
  wait was 0 ms and thread queueing 0.2–1.4 ms. Daemon phases recorded about
  1 ms, and the reader transaction 1–15 ms. 90–100 ms of each call was
  unattributed.
- **The held publication lane.** A Commit (`sandbox.commit` or `fs.write`)
  holds the writer Session's admission from `lane` through `install`,
  including any merge with a moved head. 10 of the 11 tail reads overlapped a
  held lane for almost all of their unattributed time. The 11th is the cold
  first `fs.grep`, with 93 ms in its reader transaction. Reads that overlapped
  no held lane had p95 14.8 ms, against 100 ms for those that did. Two causes
  made reads wait for the lane:
  1. **Lookups on the writer session.** The SDK resolved projects, Branches,
     Commits and Layers through `store.history()`, the writer session. They
     queued in its FIFO admission behind the lane. This affects untraced
     calls too, and a lane held for more than 2 s made reads fail `Busy`.
  2. **Counters on the writer session.** A traced call reads the writer's and
     readers' SQL counters before and after its operation.
     `Session::diagnostics` entered the same admission, so every traced call
     waited for the lane. The replay always traces.
- **Commits.** The writer's own work per Commit, `commit − begin − lane`,
  totalled 1,462 ms on the old addon and 1,583 ms on the new one. With F-017,
  Commits overlap, so more of them find a moved head and merge inside the
  lane:

  | Run | Merges in the lane | Merge ms |
  | --- | --- | --- |
  | old addon | 53 | 1,568 |
  | new addon | 132 | 4,446 |
  | F-018 | 193 | 7,271 |

  The held-lane p95 went 5.3 → 62 → 80 ms. The Commit tail is queueing at
  the single writer plus merges in the lane: Commits serialize by design
  (F-008, merge at publish).

## New design

1. `Store::published(lookup)` runs a history lookup on the control reader's
   read-only session, under that reader's admission, stop and failure custody
   (`store/open.rs`, `store/read_handle.rs`). In `sdk/args.rs`, `project`,
   `branch`, `commit` and `layer` use it. A read sees what is published when
   it runs. Commits still read and publish their head inside the lane on the
   writer session.
2. `Session::diagnostics` (`layerfs-persistence` `backend/sqlite/connection.rs`)
   reads the counters under the state lock alone. A lane owns the admission
   between its transactions, and a counter read runs no SQL. The state lock is
   held for one transaction at a time, never for a whole lane.

## Proof

Both regression tests were written first, and both failed on the old code:

- **`sdk_reads_during_publish`.** It holds the lane for 3 s and makes four
  reads. The old code failed with `fs.read` refused `Busy` after 2 s; the new
  code passes in 3.05 s.
- **`diagnostics_during_lane`.** It holds the lane and reads the writer's
  counters. The old code failed `Busy` after 2 s; the new code passes.

Other checks:
- All `layerfs-persistence` tests pass.
- These `layerfs-daemon` tests pass: `sdk_compare`, `sdk_branch_count`,
  `sdk_project_count`, `sdk_diff_pages`, `sdk_diff_size`, `sdk_diff_entries`,
  `sdk_grep_reads`, `sdk_history_depth`, `sdk_chunk_deltas`,
  `history_diff_oracle`, `concurrent_commits`, `store_commit`,
  `store_reader_lifecycle` and `telemetry_recording`.
- Clippy `-D warnings` is clean for both crates.
- A first version kept a clone of the control reader's history in `Store`.
  `store_reader_lifecycle` failed because the clone kept the control reader's
  connection open after `stop_reads`. I diagnosed it from source before any
  rerun and replaced the clone with the session route above.

## Performance, old vs new

Setup: range 8 played once per arm, each on a fresh fork of the range-7
snapshot, with addon `5baa0f5d`.

| Call | p50: `361bb09e` → `c25119ac` (ms) | p95: `361bb09e` → `c25119ac` (ms) |
| --- | --- | --- |
| fs.read | 6.9 → 5.7 | 96.1 → 9.7 |
| fs.stat | 6.1 → 5.0 | 46.6 → 7.1 |
| fs.list | 8.2 → 6.5 | 25.2 → 15.2 |
| fs.grep | 13.3 → 9.8 | 100.1 → 63.6 |
| All 213 reads | — | 90.4 → 24.9 |
| sandbox.commit | 16.5 → 19.9 | 129.7 → 126.5 |

Against the old addon (`3da0f665`, daemon `361bb09e`), `fs.read` p95 is 57.4 →
9.7 ms.

An intermediate daemon `f1fb9f49` fixed only cause 1. Its traced reads still
waited: `fs.read` p95 34.9 ms, all reads 88.0 ms. Cause 2 dominated the
replay's traces.

**Cost.** The play span went 14.8 → 17.1 s, and in-lane merges went 132 →
193 (merge time 4.4 → 7.3 s). Agents no longer stall on reads, so their
Commits overlap more and find moved heads. These are single samples. The
writer's own work is unchanged at 1,433 ms. Storage is unchanged.

## Left open

- **Merges inside the lane.** They grow with Commit concurrency and are
  serialized. Moving merge work out of the lane, then re-checking the head
  inside it, is a design change for the lead. Watch: span and merges per
  range on the rerun.
- **Process-wide SQL counters.** A call's SQL counters are deltas of
  process-wide totals. Under concurrency they include other calls' work.
