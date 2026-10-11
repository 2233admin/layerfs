# Issue 318 ledger: benchmark integration and a new baseline

> **Status:** Dated working record; not release evidence or a product contract.

Append-only. One entry a phase exit and one a family table. Branch
`issue318-benchmark-baseline`, local and unpushed, cut from
`issue316-fsb-rescue` (`e52b3c185`). The control of this rollout is fs-bench-pro
iteration 1 on `main` (`8f911fe6b`), recorded in
[ITERATION-1-COMPLETION.md](../../benchmark/fs-bench-pro/ITERATION-1-COMPLETION.md).
The assignment is [HANDOFF-BASELINE-PROMPT.md](HANDOFF-BASELINE-PROMPT.md).

Fixed for every entry: global Store Disposable/WAL/synchronous=OFF, overlay
MEMORY/OFF/EXCLUSIVE, `LAYERFS_CONSTRUCTION_WORKERS=1`, host cargo
`+1.85.1 --locked`, pinned image
`sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6`.
Durable is `NOT_RUN — disabled by owner until explicit reauthorization`.
Timings are single diagnostic samples on a shared machine.

Production LOC lines: scope active core; reference absent (retired R9c; last
counted 65,417 at tree 498dd1917812). Method: `count_absent_aware.py staged`,
pinned `tools/production_loc.py` SHA-256
`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`.

## Phase A — merge, 2026-10-11, commit `95706164c`

### The merge

| Commit | Subject | Production LOC |
| --- | --- | --- |
| `95706164c` | Merge main (`8f911fe6b`) into issue318-benchmark-baseline | 81714 -> 81718 (delta +4) |

- First parent `e52b3c185`, second parent `8f911fe6b`. The +4 is `main`'s
  Disposable startup fix in `layerfs-persistence`
  (`backend/sqlite/profile.rs`); no product file was changed on both sides.
- **One conflict, `engine/recipes/edit_model.rs`.** `main`'s side was taken.
  `main` does **not** already do what branch commit `a95414ac5` did: its
  `entries()` still generates and hashes the whole expected file of
  `edit_canonical_chunk_count`, and its timed writer called it. So the
  branch's change was re-applied on `main`'s side: `descriptors()` builds the
  tree, `entries()` adds the canonical final-digest check, and the timed
  `apply` of `writers/edit.rs` calls `descriptors()`. Preparation, the
  writer's verify mode and the oracle still call `entries()`.
  `writers/edit.rs` merged by itself and differs from `main` in that one call.
- **Consequence for the comparison:** these two files are the only harness
  source that differs from iteration 1. The command (exec) time of the
  canonical family is therefore not comparable with the control; its
  requests, writer jobs, statements, storage and proof are.

### Checks at `95706164c`

Host, built with `--no-run` first, every command under a 118 s wall stop:

| Package | Targets | Passed | Failed | Ignored | Wall |
| --- | --- | --- | --- | --- | --- |
| layerfs-content | 57 | 458 | 0 | 2 | 12 s |
| layerfs-overlay | 35 | 152 | 0 | 0 | 15 s |
| layerfs-persistence | 29 | 122 | 0 | 0 | 29 s |
| layerfs-fuse | 5 | 24 | 0 | 0 | 1 s |
| layerfs-workspace | 32 | 177 | 0 | 0 | 40 s |
| layerfs-daemon | 82 | 157 | 3 | 2 | 108 s |

- **Daemon, 3 failed, as observed; none is a regression of the merge:**
  - `complete_installed_roots::huge_native_namespace_is_complete_after_install`:
    `explicit closed preparation for clone setup`. Unrun proof; its input was
    not made.
  - `host_handoff::macos_init_handoff_to_linux_daemon_has_no_host_data_path`:
    `explicit build-listed Linux binary: NotPresent`. Unrun proof.
  - `r4_9_driver_causes::r4_9_an_engine_refusal_of_each_provider_call_is_definite_at_the_driver`:
    `AlreadyExists` on the fixture folder both tests of that target make.
    Diagnosed from the source as that collision, then run once on one thread:
    2 passed.
- **The daemon package took 108 s of its 118 s stop.** It still fits; it is
  the command closest to the ceiling.
- **Both `e2_startup` daemon targets build after the merge** (the test target
  `e2_startup_receipts` and the example `e2_startup`), and the package was
  tested whole, 82 targets.
- **Clippy `-D warnings`, all targets:** every package of the workspace
  except `layerfs-project`, clean; `layerfs-project` library, binaries and
  tests, clean. **Three `layerfs-project` examples do not compile**
  (`cause_namespace`, `benchmark_history`, `verify_history`): they include
  source files under `core/benchmark/fs-bench-pro-storage-content/`, a folder
  that is not tracked on `main` or on this branch. Left as found.
- **Formatting:** `cargo fmt --all -- --check`, clean.
- **Guard:** `check_product_boundary.py` PASS over 683 production files; its
  50 self-tests pass.
- **Harness, for the two changed files:** `test_edit_writer.py` against the
  sealed build, 8 pass. The Rust model tests `edit_model_m1` (24),
  `edit_model_context` (26) and `edit_model_boundary_alias` (22) pass. Three
  of the context tests need a writer, a recipe binary and a fresh output
  folder; a first run without them failed on the missing inputs and is not a
  result.

Linux, pinned image, own target folder, repository bound read-only, source
bytes checked inside the container before each build:

| Target | Tests | Result |
| --- | --- | --- |
| daemon `recognizer` | 1 | pass |
| daemon `native_mutation` | 4 | pass |
| daemon `mounted_store_read` | 2 | pass |
| daemon `mounted_execute` | 5 | pass |
| daemon `mounted_commit` | 7 | pass |
| daemon `mounted_recognizer` | 2 | pass |
| daemon `native_coherence` | 6 | pass |
| Workspace `recognize` | 8 | pass |

- Mount targets ran with the FUSE device and one test thread.
  `mounted_recognizer` includes the process started outside the Exec API
  (`an_outside_process_shifts_two_tails_and_its_writes_become_pieces`).
- **Two Linux build commands failed before any test:** the first, with the
  default job count, had its linker killed (`ld terminated with signal 9`);
  the Docker VM has 4 GB of memory and held 38 running containers of earlier
  runs. The second, with three jobs and every daemon and Workspace test
  target, reached its 290 s stop while compiling. The third built only the
  eight targets above in 53 s. The other Linux test targets of the daemon
  were not built or run at this entry.
- **Durable:** `NOT_RUN — disabled by owner until explicit reauthorization`.

### Storage before the run

- Host volume: 238 GiB free of 926 GiB.
- Docker (`docker system df`): images 21.5 GB, containers 12.9 GB (38, all
  running), volumes 69.1 GB (413, of which 39 in use), build cache 4.8 GB.
  Inside the VM: 98 GB free of 196 GB, 4 GB of memory.
- All 413 volumes and 38 containers were made before this run and are listed
  by name in the worktree's ignored folder, so that nothing of theirs is ever
  removed by this run.

### The driver

`core/docs/issues/318/tools/step.py` extends the storage-rule driver of issue
316 to every family. The harness engine is unchanged and is used through
`bench.py`.

- One original a case under `issue318-originals/`; the exact-count cells use
  the two shared recipes `empty` and `big64m`.
- After a sample, whatever its status: every `layerfs-fsb-sample-*` volume
  named in the sample's own records, the containers on those volumes, and the
  exported and normalized Stores (`graph-store`, `census-store`) are removed.
  The sample's sealed manifest is checked in full first, and each removed
  manifest entry is recorded with its sealed hash in `payload-cleanup.json`.
- `step.py report` calls the engine's own report code. The engine checks
  every sealed file again when it loads a run; for exactly the entries the
  driver recorded as removed after a full check, that second check is
  answered from the record. Nothing else of the report differs from
  `bench.py report`.
- The working copy of the driver is kept in the ignored target folder while a
  family is being sampled, because a commit inside a family breaks that
  family's run registration; the committed copy is refreshed between
  families.

### Decisions by agent, pending owner review

1. The descriptor split of `a95414ac5` was re-applied (above), as the handoff
   directs when `main` does not do the same.
2. The CSVs are produced by the engine's report code called from the driver,
   not by a bare `bench.py report`, because the storage rule removes sealed
   files the bare command would look for.
3. A family's originals are removed when the family has finished, so the
   disk holds one family's inputs at a time.
4. A case whose control sample or preparation ended at iteration 1's 120 s
   outer stop gets one call of its own with a 300 s stop, which the handoff
   allows for a step that cannot fit. The control row stays what it was.

### What failed or was not done in phase A

- The three daemon host tests and the three `layerfs-project` examples above.
- Linux test targets other than the eight listed.
- The checklist item "driver drives every family" is shown family by family
  in phase C, at each family's first sample.

## Phase B — tests before the benchmark, 2026-10-11

Product source is unchanged (the merge's). Two test targets were added to
`core/crates/layerfs-daemon/tests/`:

- `recognizer_patterns.rs`, 9 tests, host and Linux: writes through the
  request port over a real Disposable Store and the real local owner, no
  mount. Each pattern is compared with an independent model three times
  (live view, published root from a fresh bind, live view after install).
- `mounted_patterns.rs`, 1 test, Linux with the FUSE device: a process started
  outside the daemon shifts a tail, then writes of 1 to 8,191 bytes and
  stores through a shared mapping go over the file's pieces; compared with a
  native replay, daemon READs, the published root and a fresh mount.

**Every test passes: no wrong byte, no refused request, no stale piece in a
read.** Host: 9 passed in 4.0 s. Linux: 9 passed in 16.8 s and the mounted
test in 0.4 s (run before a formatting-only change of the two files).
Formatting and Clippy `-D warnings` on all daemon targets are clean.

Whether a pattern is recognized, as observed (one run, host; `claimed` is what
the recognizer claimed of the bytes written, `rows` the piece rows and
`stored` the payload bytes the overlay then held):

| Pattern | Written | Claimed | Rows | Stored | Recognized |
| --- | ---: | ---: | ---: | ---: | --- |
| Truncate to zero, whole file written again, same content (3 MiB) | 3,145,728 | 3,195,304 | 1 | 0 | yes |
| Truncate to zero, whole file written again with a 4 KiB insert | 3,149,824 | 3,154,815 | 2 | 45,056 | yes |
| New file written and renamed over a file with unpublished pieces | 3,145,728 | 0 | 0 | 3,145,728 | no (new file) |
| New file written and renamed over a file with committed pieces | 2,097,152 | 0 | 0 | 2,097,152 | no (new file) |
| Blocks of the unchanged file in a scattered order, some edited | 3,145,728 | 2,178,568 | 48 | 1,159,168 | partly |
| Shifted tail whose blocks arrive in a scattered order | 2,100,927 | 381,226 | 23 | 1,835,520 | mostly not |
| 200 KiB file: shifted tail | 188,305 | 167,591 | 1 | 29,184 | yes |
| The same file cut to 96 KiB with its pieces, committed, grown back | 110,592 | 0 | 0 | 110,592 | no (base under the threshold) |
| Delete after the regrowth was committed | 180,113 | 185,132 | 1 | 4,608 | yes |
| 100 KiB file grown to 300 KiB, committed, then shifted | 301,049 | 303,083 | 1 | 8,704 | yes |
| Insert of 64 KiB, written forward (16 MiB file) | 15,793,399 | 15,916,669 | 1 | 135,680 | yes |
| Delete of 64 KiB | 14,675,743 | 14,890,220 | 1 | 4,608 | yes |
| Insert of 64 KiB, grown in place from the end backward | 13,696,925 | 14,047,768 | 2 | 107,008 | yes |
| Insert of 1 MiB, forward | 16,776,439 | 0 | 0 | 16,777,728 | **no** |
| Delete of 1 MiB | 14,675,743 | 0 | 0 | 14,676,480 | **no** |
| Insert of 1 MiB, backward | 14,679,965 | 0 | 0 | 14,680,576 | **no** |
| Insert of 10 MiB, forward | 26,213,623 | 0 | 0 | 26,214,912 | **no** |
| Delete of 10 MiB | 14,675,743 | 0 | 0 | 14,676,480 | **no** |
| Insert of 10 MiB, backward | 24,117,149 | 0 | 0 | 24,117,760 | **no** |
| Nine writes of 1 to 8,191 bytes over a file with pieces | 0 claimed, by design | 0 | 1 | 56,709 | not examined |
| A delete over committed pieces (later Commit, same Workspace) | 2,359,197 | 2,354,466 | 4 | 82,432 | yes |
| A second shift over the unpublished pieces of the first | 2,764,795 | 0 | 4 | 2,765,312 | **no** |
| A second Workspace: backward shift over the committed result | 2,113,535 | 2,128,756 | 2 | 57,856 | yes |
| Mounted: 4 KiB insert by `dd`, tail moved 64 KiB a request | 1,576,183 | 1,595,928 | 1 | 25,088 | yes |
| Mounted: six writes under 8 KiB over the pieces | — | 0 | 1 | 46,513 | not examined |
| Mounted: stores through a shared mapping, written back by `msync`, including 256 KiB of the tail stored again unchanged | — | 0 | 1 | 333,233 | **no** |

(`claimed` can exceed `written` by the few bytes a claim reaches back.)

Recorded results, not failures:

- **A shift of 1 MiB or 10 MiB is not recognized in any direction**; 64 KiB
  is. The moved tail is stored in full. No benchmark case has such a shift.
- **A second shift over a file whose first shift is not yet committed is not
  recognized**: the second tail is stored in full. After a Commit it is.
- **Bytes the kernel writes back from its page cache are not claimed**, also
  when they equal what the file already has.
- **A new file renamed over an old one is never recognized**; the issue lists
  that as outside this rollout.
- A scattered order loses most claims of a shifted tail and about a third of
  an in-place rewrite.

No product bug was found before the baseline.

## Phase C — the twelve exact-count cells, tag `b1`, sampled at `d4d29ceb4`

Baseline source for the whole of phase C: commit `d4d29ceb4` (the merge plus
the phase B tests; production source is the merge's, 81,718 LOC). Build
sealed once for tag `b1`; the daemon binary's SHA-256 is the same as the one
built at the merge commit (`0215455c9d57…`). Commits between families change
only this ledger, the driver copy and generated CSVs.

Every row of phase C is sampled with the interference declared (leftover
daemon containers of earlier runs share the 4 GB Docker VM), so a completed
row's status is `INELIGIBLE`, never `PASS`; `functional` and `proof` are the
receipt's own fields.

| Cell | Original requests / jobs / statements | Iteration 1 | This run | Equal to original | Status / proof / cleanup |
| --- | --- | --- | --- | --- | --- |
| C01 | 5002 / 5002 / 44004 | 5002 / 5002 / 44004 | 5002 / 5002 / 44004 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C02 | 6002 / 6002 / 46004 | 6002 / 6002 / 46004 | 6002 / 6002 / 46004 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C03 | 9022 / 9038 / 102540 | 9022 / 9038 / 102540 | 9022 / 9038 / 102540 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C04 | 5342 / 5342 / 42644 | 5342 / 5342 / 42644 | 5342 / 5342 / 42644 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C05 | 5890 / 6000 / 46637 | 5890 / 6000 / 46637 | 5890 / 6000 / 46637 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C06 | 518 / 518 / 9766 | 518 / 518 / 9766 | 518 / 518 / 9766 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C07 | 1551 / 1550 / 23133 | 1551 / 1550 / 23133 | 1551 / 1550 / 23133 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C08 | 521 / 521 / 9783 | 521 / 521 / 9783 | 521 / 521 / 9783 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C09 | 517 / 517 / 1055 | 517 / 517 / 1055 | 517 / 517 / 1055 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C10 | 1548 / 1547 / 14408 | 1547 / 1546 / 14406 | 1547 / 1546 / 14406 | **no** | FAIL / PASS / Gone + KnownStop |
| C11 | 517 / 517 / 9760 | 517 / 517 / 9760 | 517 / 517 / 9760 | yes | INELIGIBLE / PASS / Gone + KnownStop |
| C12 | 3436 / 3439 / 24146 | 3436 / 3439 / 24145 | 3436 / 3439 / 24146 | yes | INELIGIBLE / PASS / Gone + KnownStop |

- **11 of 12 triples equal the original; 11 of 12 equal iteration 1's.**
- **C10 is FAIL**, `stage 0.4 exact request/owner-job/statement counts
  differ`: one READ fewer than the original, the same triple iteration 1
  recorded. Its functional proof passed.
- **C12 differs from iteration 1 by one statement and equals the original**
  (24146). Iteration 1 attributed its 24145 to one conditional orphan-inode
  probe during reclamation; this sample has the probe. Not a product change:
  the count depends on interleaving, as iteration 1's ledger says.
- The reference-piece work changes no count of the twelve cells.
- **Storage after the cells:** every sample's clone volume and container
  removed (12 of 12, sealed manifest whole before removal). Docker holds two
  volumes more than before the run, the masters of the two originals
  (`empty`, `big64m`, 67 MB on disk). Result folder 191 MB including 163 MB
  left by issue 316's tags. Host 226 GiB free; `docker system df`: images
  21.51 GB, containers 12.85 GB, volumes 69.07 GB, build cache 4.84 GB.
- CSVs: `core/benchmark/cluster-two/baselines/2026-10-11-d4d29ceb4/`, beside
  iteration 1's two cell folders.

## Phase C — batch 1, `init_namespace`, tag `b1`, sampled at `1fbd41266`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| namespace-100-compact-v3 | INELIGIBLE | PASS | PASS | - | - | - | - | 5255168 -> 5263360 | 58.9 -> 55.2 | - -> - |
| namespace-1000-compact-v3 | INELIGIBLE | PASS | PASS | - | - | - | - | 20619264 -> 20611072 | 163.8 -> 193.8 | - -> - |
| namespace-10000 | INELIGIBLE | PASS | PASS | - | - | - | - | 305696768 -> 305750016 | 2137.6 -> 2197.0 | - -> - |
| namespace-100000 | INELIGIBLE | PASS | PASS | - | - | - | - | 516333568 -> 516562944 | 7931.8 -> 8035.9 | - -> - |

- 4 of 4: functional PASS, proof PASS, sealed and closed, as in iteration 1.
  No daemon, mount or overlay is involved (host Init), so there are no
  request counts; the Store sizes are equal to iteration 1's.
- Status is INELIGIBLE for the family's own reason (`setup generated/wrote/read
  all native bytes; source warmth retained; no cold admission claimed`), as in
  iteration 1.
- First sample measured for leftovers: no Docker volume or container; the
  sample keeps the Store it built (`store.sqlite`) beside its receipt. The
  driver was extended to remove that file as the test copy (20.6, 305.8 and
  516.6 MB removed for the three larger cases; the 5.6 MB of the first case
  was sampled before the extension and is left in place).

- Storage after the family: 0 Docker volumes more than before the run
  (0 of them masters of current originals, 0 unexplained),
  0 containers more; originals 1182 MB, result folder
  198 MB; host 225 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.06GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-1fbd41266/init_namespace/`.

**Correction to the `init_namespace` entry above:** the Store sizes are not
equal to iteration 1's. They differ by −8,192 to +229,376 bytes of 5 to 516 MB
(table column `Store logical B`). Init keeps its parallel construction
profile, and the file's page count is not fixed across runs; no cause beyond
that was looked for.

## Phase C — batch 1, `payload_create_read`, tag `b1`, sampled at `7bd91e498`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| payload-create-1m-compact-v2 | INELIGIBLE | PASS | PASS | 22 | 241 -> 177 | 1178 -> 922 | 1294336 -> 1298432 | 1411992 | 41.6 -> 35.3 | 17.6 -> 16.4 |
| payload-create-10m-compact-v2 | INELIGIBLE | PASS | PASS | 94 | 1177 -> 537 | 6290 -> 3730 | 10895360 -> 10899456 | 12738560 | 67.1 -> 65.7 | 104.4 -> 81.6 |
| payload-create-100m | INELIGIBLE | PASS | PASS | 814 | 10537 -> 4137 | 57410 -> 31810 | 106856448 -> 106860544 | 109649920 -> 109645824 | 232.7 -> 233.9 | 903.7 -> 1421.0 |
| payload-create-500m | INELIGIBLE | PASS | PASS | 4014 | 52137 -> 20137 | 284610 -> 156610 | 533385216 -> 533389312 | 534945792 -> 534966272 | 1087.7 -> 1019.2 | 8237.9 -> 6309.2 |
| payload-random-read-1-compact-v2 | INELIGIBLE | PASS | PASS | 6 | 52 | 236 | 229376 -> 233472 | 1327496 | 45.3 -> 40.2 | 10.0 -> 9.3 |
| payload-random-read-10-compact-v2 | INELIGIBLE | PASS | PASS | 15 | 61 | 254 | 229376 -> 233472 | 10887584 | 49.8 -> 49.3 | 10.6 -> 8.3 |
| payload-random-read-100 | INELIGIBLE | PASS | PASS | 105 | 151 | 434 | 229376 -> 233472 | 530792864 | 48.1 -> 49.7 | 8.9 -> 8.9 |
| payload-random-read-500 | INELIGIBLE | PASS | PASS | 503 | 550 | 1232 | 229376 -> 233472 | 530792864 | 203.6 -> 158.9 | 7.5 -> 8.9 |

- 8 of 8: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE (`class B source demands or own-write cold
  backing precondition unavailable`), as in iteration 1.
- **Requests are equal in all 8 cases.**
- **Writer jobs and statements are lower in the four create cases, by exactly
  one job and four statements a 16 KiB cell written** (64 / 640 / 6,400 /
  32,000 jobs for 1 / 10 / 100 / 500 MiB). This is not the reference-piece
  work: it is branch commit `8c1993f4a` ("read captured payload once at
  Commit and compose windows by run", +178 production LOC), which is on
  `issue316-fsb-rescue` before the piece phases and was never on `main`.
  The four read cases write nothing and are equal.
- **Overlay logical bytes are 4,096 higher in all 8 cases**: one more page in
  the empty overlay database, from the piece table of overlay schema 33.
- Store logical bytes differ in two cases (−4,096 of 110 MB, +20,480 of
  535 MB); not explained further.
- Commit time of `payload-create-100m` is 903.7 -> 1421.0 ms and of
  `payload-create-500m` 8237.9 -> 6309.2 ms; single samples on a shared
  machine, not judged.
- First sample measured for leftovers: the harness removes a completed
  sample's volume and container itself; the driver removed the exported and
  normalized Stores (1.3 MB to 530.7 MB a sample). Nothing else remained.

- Storage after the family: 4 Docker volumes more than before the run
  (4 of them masters of current originals, 0 unexplained),
  0 containers more; originals 3197 MB, result folder
  227 MB; host 223 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.61GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-7bd91e498/payload_create_read/`.

## Phase C — batch 1, `tiny_file_churn`, tag `b1`, sampled at `22250a5eb`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tiny-create-1-compact-v2 | INELIGIBLE | PASS | PASS | 16 | 140 | 645 | 229376 -> 233472 | 1405656 | 46.8 -> 49.2 | 10.6 -> 11.2 |
| tiny-create-10-compact-v2 | INELIGIBLE | PASS | PASS | 115 | 956 -> 938 | 4452 -> 4380 | 266240 -> 270336 | 11084912 -> 11072552 | 45.9 -> 49.7 | 18.0 -> 17.9 |
| tiny-create-100-mixed-v4 | INELIGIBLE | PASS | PASS | 736 | 5745 -> 5565 | 27408 -> 26688 | 548864 -> 552960 | 106945928 -> 106908968 | 91.5 -> 91.6 | 51.0 -> 49.4 |
| tiny-create-500-mixed-v4 | INELIGIBLE | PASS | PASS | 3496 | 28841 -> 27941 | 134888 -> 131288 | 1847296 | 534873568 -> 535027064 | 246.7 -> 263.7 | 202.2 -> 194.1 |
| tiny-stat-1-compact-v2 | INELIGIBLE | PASS | PASS | 4 | 51 | 249 | 229376 -> 233472 | 1347976 | 39.6 -> 43.8 | 11.4 -> 10.4 |
| tiny-stat-10-compact-v2 | INELIGIBLE | PASS | PASS | 22 | 69 | 501 | 262144 -> 266240 | 10985888 -> 10981792 | 54.5 -> 44.5 | 10.6 -> 10.4 |
| tiny-stat-100-mixed-v4 | INELIGIBLE | PASS | PASS | 112 | 159 | 1671 | 389120 -> 393216 | 107327904 -> 107344288 | 53.8 -> 62.6 | 11.4 -> 11.3 |
| tiny-stat-500-mixed-v4 | INELIGIBLE | PASS | PASS | 512 | 559 | 6871 | 598016 -> 602112 | 532681120 -> 532672928 | 116.1 -> 109.4 | 14.5 -> 11.6 |
| tiny-unlink-1-compact-v2 | INELIGIBLE | PASS | PASS | 12 | 122 | 594 | 229376 -> 233472 | 1372696 -> 1376816 | 52.4 -> 42.0 | 14.0 -> 12.0 |
| tiny-unlink-10-compact-v2 | INELIGIBLE | PASS | PASS | 75 | 608 | 3301 | 262144 -> 266240 | 11018848 -> 11010632 | 42.5 -> 51.4 | 17.2 -> 15.7 |
| tiny-unlink-100-mixed-v4 | INELIGIBLE | PASS | PASS | 435 | 3035 | 17991 | 389120 -> 393216 | 107435168 -> 107496728 | 73.6 -> 88.8 | 33.8 -> 33.4 |
| tiny-unlink-500-mixed-v4 | INELIGIBLE | PASS | PASS | 2035 | 13939 | 83655 | 565248 -> 569344 | 532792048 -> 532718248 | 203.3 -> 181.8 | 95.6 -> 98.0 |
| tiny-bulk-create-1-compact-v2 | INELIGIBLE | PASS | PASS | 1429 | 15063 -> 14865 | 65179 -> 64387 | 1495040 -> 1499136 | 1426280 -> 1430376 | 134.6 -> 133.6 | 99.3 -> 92.5 |
| tiny-bulk-create-10-compact-v2 | INELIGIBLE | PASS | PASS | 4651 | 43140 -> 41160 | 196321 -> 188401 | 11735040 -> 11743232 | 13705216 | 346.9 -> 364.8 | 357.9 -> 323.5 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE | PASS | PASS | 8709 | 80032 -> 71650 | 375318 -> 341790 | 108724224 -> 108732416 | 111820800 -> 111812608 | 365.2 -> 719.0 | 1432.5 -> 1213.1 |
| tiny-bulk-create-500-mixed-v3 | INELIGIBLE | PASS | PASS | 39665 | 351248 -> 310090 | 1669693 -> 1505061 | 541491200 -> 541523968 | 536412160 -> 536420352 | 3177.4 -> 3147.8 | 10195.0 -> 13536.6 |
| tiny-bulk-delete-1-compact-v2 | INELIGIBLE | PASS | PASS | 1145 | 9966 | 53086 -> 53092 | 348160 -> 352256 | 1422088 -> 1426184 | 133.2 -> 115.5 | 67.7 -> 63.7 |
| tiny-bulk-delete-10-compact-v2 | INELIGIBLE | PASS | PASS | 3012 | 22772 | 129867 -> 129868 | 634880 -> 643072 | 11039520 -> 11043640 | 268.9 -> 286.1 | 126.1 -> 133.8 |
| tiny-bulk-delete-100-mixed-v3 | INELIGIBLE | PASS | PASS | 4987 | 36093 | 210354 -> 210352 | 913408 -> 925696 | 107774848 -> 107778944 | 444.3 -> 439.7 | 203.1 -> 199.3 |
| tiny-bulk-delete-500-mixed-v3 | INELIGIBLE | PASS | PASS | 21187 | 146056 | 872798 -> 872801 | 3248128 -> 3276800 | 533111632 -> 532849488 | 1756.7 -> 1761.9 | 782.4 -> 780.4 |

- 20 of 20: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE (class B precondition), as in iteration 1.
- **Requests are equal in all 20 cases.**
- **Writer jobs are equal in 13 cases and lower in the 7 create cases** (by 18
  to 41,158), with four statements fewer a job: the Commit of branch commit
  `8c1993f4a` reads a file's captured cells once a run instead of once a
  cell. The same cause as in `payload_create_read`; not the piece work.
- **Statements differ by −2 to +6 in the four bulk-delete cases with equal
  jobs.** Unlinks trigger last-owner reclamation, whose conditional probes
  depend on interleaving (iteration 1's ledger, cell C12). Not explained
  beyond that.
- **Overlay logical bytes are 4,096 to 32,768 higher in 19 cases** (schema 33
  adds the piece table and its index pages), equal in one.
- Store logical bytes differ in 17 cases by at most 0.15 MB of up to 535 MB.
- `tiny-bulk-create-500-mixed-v3`, which the issue 316 driver had stopped at
  its own budget, completed here in a call of its own: 46 s for the whole
  sample, exec 3,148 ms, Commit 13,537 ms (iteration 1: 3,187 and 9,862 ms).
- A sample floor of 45 s instead of 75 s was used for the small cases of this
  family, whose control samples ended within 35 s; no sample was stopped.

- Storage after the family: 14 Docker volumes more than before the run
  (14 of them masters of current originals, 0 unexplained),
  0 containers more; originals 6955 MB, result folder
  276 MB; host 218 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=71.02GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-22250a5eb/tiny_file_churn/`.

## Phase C — batch 1, `namespace_mutation`, tag `b1`, sampled at `d971225f6`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| namespace-subtree-relocate-delete-1-compact-v2 | INELIGIBLE | PASS | PASS | 129 | 890 | 5287 -> 5286 | 245760 -> 249856 | 938736 | 48.6 -> 47.9 | 14.8 -> 16.9 |
| namespace-subtree-relocate-delete-10-compact-v2 | INELIGIBLE | PASS | PASS | 1092 | 7581 | 45196 | 380928 -> 385024 | 1483504 -> 1495840 | 130.3 -> 132.7 | 51.4 -> 52.8 |
| namespace-subtree-relocate-delete-100-mixed-v4 | INELIGIBLE | PASS | PASS | 832 | 5738 | 34262 -> 34260 | 360448 -> 364544 | 106984296 -> 106959648 | 91.4 -> 104.5 | 45.5 -> 47.2 |
| namespace-subtree-relocate-delete-500-mixed-v4 | INELIGIBLE | PASS | PASS | 4072 | 27726 | 166750 | 802816 -> 811008 | 534258584 -> 534336336 | 387.2 -> 383.6 | 173.0 -> 171.4 |

- 4 of 4: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE (class B precondition), as in iteration 1.
- **Requests and writer jobs are equal in all 4 cases.** Statements are equal
  in 2 and lower by 1 and 2 in the other two (reclamation probes after the
  deletes, as in the bulk-delete cases of `tiny_file_churn`).
- Overlay logical bytes are 4,096 or 8,192 higher (schema 33); Store logical
  bytes differ in 3 cases by at most 0.08 MB.
- This closes batch 1: 36 of 36 cases functional PASS and proof PASS, as in
  iteration 1; no request count changed.

- Storage after the family: 4 Docker volumes more than before the run
  (4 of them masters of current originals, 0 unexplained),
  0 containers more; originals 1870 MB, result folder
  284 MB; host 224 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.71GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-d971225f6/namespace_mutation/`.

## Phase C — batch 2, `edit_length_preserving`, tag `b1`, sampled at `7928b05fd`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| overwrite-head-4k-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 127 -> 122 | 622 -> 606 | 237568 -> 241664 | 1381056 | 41.0 -> 41.8 | 11.8 -> 10.4 |
| overwrite-head-4k-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 258 -> 253 | 1327 -> 1311 | 258048 -> 262144 | 10965864 | 39.4 -> 43.7 | 13.2 -> 12.1 |
| overwrite-head-4k-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 258 -> 253 | 1327 -> 1311 | 274432 -> 278528 | 106460104 | 38.3 -> 42.0 | 12.4 -> 13.3 |
| overwrite-head-4k-on-500mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 357 -> 352 | 1840 -> 1824 | 290816 -> 294912 | 530895864 | 53.1 -> 48.2 | 18.5 -> 22.4 |
| overwrite-middle-4k-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 152 -> 145 | 762 -> 740 | 241664 -> 245760 | 1381056 | 36.3 -> 35.8 | 9.6 -> 12.4 |
| overwrite-middle-4k-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 395 -> 388 | 2037 -> 2015 | 270336 -> 274432 | 10974104 -> 10978224 | 34.0 -> 37.8 | 13.6 -> 14.6 |
| overwrite-middle-4k-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 413 -> 406 | 2145 -> 2123 | 286720 -> 290816 | 106468344 | 41.7 -> 42.7 | 15.1 -> 15.7 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 459 -> 452 | 2397 -> 2375 | 299008 -> 303104 | 530899984 | 34.1 -> 39.7 | 27.1 -> 24.3 |
| overwrite-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 129 -> 123 | 627 -> 608 | 237568 -> 241664 | 1381056 | 49.2 -> 33.5 | 9.4 -> 10.9 |
| overwrite-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 230 -> 224 | 1158 -> 1139 | 245760 -> 249856 | 10978224 -> 10965864 | 31.5 -> 42.8 | 11.4 -> 13.0 |
| overwrite-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 230 -> 224 | 1158 -> 1139 | 253952 -> 258048 | 106435384 -> 106447744 | 44.6 -> 35.5 | 12.6 -> 10.9 |
| overwrite-tail-4k-on-500mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 324 -> 318 | 1650 -> 1631 | 286720 -> 290816 | 530912344 -> 530924704 | 34.5 -> 44.2 | 16.9 -> 25.4 |

- 12 of 12: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE (class B precondition), as in iteration 1.
- **Requests are equal in all 12 cases** (10 or 11).
- **Writer jobs are lower by 5 to 7 and statements by 16 to 22 in every
  case**, the same amount at every file size. Both branch-side changes act
  at Commit here (`8c1993f4a`, and the piece work's edit script); no control
  sample separates them. An in-place 4 KiB overwrite makes no piece.
- Overlay logical bytes are 4,096 higher in all 12 (schema 33). Store logical
  bytes differ in 4 cases by about 12 KB or less.
- Exec stays between 33 and 48 ms and Commit between 10 and 25 ms at every
  size, as in iteration 1.

- Storage after the family: 4 Docker volumes more than before the run
  (4 of them masters of current originals, 0 unexplained),
  0 containers more; originals 4418 MB, result folder
  305 MB; host 221 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.71GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-7928b05fd/edit_length_preserving/`.

## Phase C — batch 2, `edit_length_changing`, tag `b1`, sampled at `c7f283e6e`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| insert-middle-4k-on-1mib-ops-1 | FAIL | FAIL -> - | FAIL | 27 | 237 -> 212 | 1194 -> 1227 | 782336 -> 286720 | 1426376 -> 1405776 | 53.7 -> 42.7 | 18.8 -> 12.6 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL -> - | FAIL | 171 | 1292 -> 867 | 6711 -> 5522 | 5656576 -> 307200 | 11044144 -> 11002944 | 82.5 -> 73.8 | 54.9 -> 15.6 |
| insert-middle-4k-on-100mib-ops-1 | FAIL | FAIL -> - | FAIL | 1611 | 9853 -> 2362 | 51568 -> 23775 | 54333440 -> 323584 | 106748504 -> 106513664 | 669.8 -> 472.1 | 476.2 -> 18.2 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL -> - | FAIL | 8011 | 36533 -> 8938 | 189492 -> 104641 | 268427264 -> 405504 | 531958848 -> 530978288 | 3183.5 -> 2184.5 | 2794.7 -> 25.1 |
| delete-middle-4k-on-1mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 24 | 246 -> 157 | 1393 -> 934 | 778240 -> 258048 | 1418136 -> 1376936 | 41.6 -> 40.4 | 14.4 -> 12.0 |
| delete-middle-4k-on-10mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 132 | 1465 -> 508 | 8854 -> 3897 | 5701632 -> 278528 | 11015304 -> 10969984 | 71.9 -> 61.8 | 58.8 -> 13.9 |
| delete-middle-4k-on-100mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 1212 | 10029 -> 2661 | 64898 -> 26166 | 54697984 -> 339968 | 106645504 -> 106517784 | 629.9 -> 406.4 | 444.4 -> 29.6 |
| delete-middle-4k-on-500mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 6012 | 49266 -> 13247 | 318697 -> 127502 | 272486400 -> 479232 | 532008264 -> 531143064 | 3266.8 -> 2043.7 | 3114.7 -> 92.1 |
| append-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 116 -> 110 | 554 -> 535 | 237568 -> 241664 | 1381056 | 34.9 -> 40.3 | 9.6 -> 11.3 |
| append-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 139 -> 133 | 677 -> 658 | 237568 -> 241664 | 10965864 | 33.7 -> 38.6 | 9.7 -> 12.8 |
| append-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 139 -> 133 | 677 -> 658 | 245760 -> 249856 | 106439504 -> 106435384 | 45.3 -> 49.9 | 11.1 -> 12.7 |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | PASS | 11 | 179 -> 173 | 899 -> 880 | 258048 -> 262144 | 530875288 | 37.4 -> 48.2 | 12.1 -> 21.3 |
| prepend-head-4k-on-1mib-ops-1 | FAIL | FAIL -> - | FAIL | 43 | 305 -> 196 | 1544 -> 1233 | 1314816 -> 299008 | 1418136 -> 1405776 | 60.6 -> 59.1 | 18.8 -> 14.4 |
| prepend-head-4k-on-10mib-ops-1 | FAIL | FAIL -> - | FAIL | 331 | 2039 -> 757 | 10620 -> 6152 | 11051008 -> 303104 | 10986464 -> 10998824 | 156.3 -> 130.5 | 93.7 -> 13.8 |
| prepend-head-4k-on-100mib-ops-1 | FAIL | FAIL -> - | FAIL | 3211 | 18905 -> 3637 | 99042 -> 42130 | 108425216 -> 311296 | 106497184 | 1284.9 -> 865.7 | 983.8 -> 14.2 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL -> - | FAIL | 16011 | 69638 -> 16582 | 363959 -> 202834 | 536563712 -> 344064 | 530945328 -> 530970048 | 7247.9 -> 4920.4 | 5373.4 -> 20.0 |
| replace-grow-middle-2k-to-4k-on-1mib-ops-1 | FAIL | FAIL -> - | FAIL | 28 | 241 -> 244 | 1241 -> 1433 | 782336 -> 294912 | 1426376 -> 1409896 | 45.8 -> 48.2 | 14.1 -> 14.0 |
| replace-grow-middle-2k-to-4k-on-10mib-ops-1 | FAIL | FAIL -> - | FAIL | 172 | 1296 -> 1376 | 6974 -> 8252 | 5656576 -> 331776 | 11040024 -> 11015304 | 94.0 -> 74.6 | 63.7 -> 21.1 |
| replace-grow-middle-2k-to-4k-on-100mib-ops-1 | FAIL | FAIL -> - | FAIL | 1612 | 9857 -> 2624 | 53991 -> 27897 | 54333440 -> 335872 | 106748504 -> 106526024 | 666.2 -> 490.0 | 455.0 -> 22.0 |
| replace-grow-middle-2k-to-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL -> - | FAIL | 8012 | 36534 -> 8939 | 189499 -> 104658 | 268423168 -> 409600 | 531967064 -> 530986504 | 3399.6 -> 2406.6 | 2807.8 -> 27.6 |
| replace-shrink-middle-4k-to-2k-on-1mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 24 | 228 -> 188 | 1252 -> 1090 | 774144 -> 258048 | 1414016 -> 1381056 | 50.6 -> 43.8 | 15.5 -> 11.5 |
| replace-shrink-middle-4k-to-2k-on-10mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 132 | 1231 -> 737 | 7057 -> 4717 | 5623808 -> 282624 | 11031784 -> 10978224 | 79.9 -> 55.0 | 53.1 -> 16.8 |
| replace-shrink-middle-4k-to-2k-on-100mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 1212 | 7635 -> 1860 | 46541 -> 19312 | 53862400 -> 299008 | 106633144 -> 106484824 | 673.0 -> 436.6 | 443.1 -> 19.1 |
| replace-shrink-middle-4k-to-2k-on-500mib-ops-1 | INELIGIBLE | FAIL -> PASS | FAIL -> PASS | 6012 | 37272 -> 6790 | 226740 -> 83980 | 268226560 -> 344064 | 532000024 -> 530932944 | 2852.1 -> 1977.1 | 2744.1 -> 24.0 |
| truncate-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 110 -> 106 | 533 -> 521 | 233472 -> 237568 | 1376936 | 37.5 -> 40.8 | 9.9 -> 10.2 |
| truncate-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 174 -> 170 | 893 -> 881 | 237568 -> 241664 | 10941144 | 46.8 -> 40.8 | 12.2 -> 12.1 |
| truncate-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 174 -> 170 | 893 -> 881 | 245760 -> 249856 | 106439504 -> 106447744 | 45.4 -> 49.4 | 12.0 -> 12.0 |
| truncate-tail-4k-on-500mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 220 -> 216 | 1145 -> 1133 | 253952 -> 258048 | 530879384 | 47.1 -> 58.6 | 17.6 -> 16.7 |
| zero-extend-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 116 -> 110 | 554 -> 535 | 237568 -> 241664 | 1376936 | 44.1 -> 45.3 | 11.4 -> 12.4 |
| zero-extend-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 139 -> 133 | 677 -> 658 | 237568 -> 241664 | 10965864 -> 10969984 | 46.8 -> 50.5 | 12.6 -> 12.7 |
| zero-extend-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 11 | 139 -> 133 | 677 -> 658 | 245760 -> 249856 | 106443624 | 42.0 -> 42.7 | 12.2 -> 11.9 |
| zero-extend-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | PASS | 11 | 179 -> 173 | 899 -> 880 | 258048 -> 262144 | 530887648 | 43.4 -> 38.6 | 12.4 -> 13.9 |

Failure texts, as recorded:

- `insert-middle-4k-on-1mib-ops-1`: independent-graph failed with exit 1
- `insert-middle-4k-on-10mib-ops-1`: independent-graph failed with exit 1
- `insert-middle-4k-on-100mib-ops-1`: independent-graph failed with exit 1
- `insert-middle-4k-on-500mib-result-capped-v2-ops-1`: independent-graph failed with exit 1
- `prepend-head-4k-on-1mib-ops-1`: independent-graph failed with exit 1
- `prepend-head-4k-on-10mib-ops-1`: independent-graph failed with exit 1
- `prepend-head-4k-on-100mib-ops-1`: independent-graph failed with exit 1
- `prepend-head-4k-on-500mib-result-capped-v2-ops-1`: independent-graph failed with exit 1
- `replace-grow-middle-2k-to-4k-on-1mib-ops-1`: independent-graph failed with exit 1
- `replace-grow-middle-2k-to-4k-on-10mib-ops-1`: independent-graph failed with exit 1
- `replace-grow-middle-2k-to-4k-on-100mib-ops-1`: independent-graph failed with exit 1
- `replace-grow-middle-2k-to-4k-on-500mib-result-capped-v2-ops-1`: independent-graph failed with exit 1

- **20 of 32 are functional PASS and proof PASS (iteration 1: 12); 12 are
  FAIL (iteration 1: 20).** This is the expected difference: the 8 delete and
  replace-shrink cases, FAIL in iteration 1 on the payload-retention check,
  now pass every check, and their mounts end Gone with KnownStop. The 12
  append, truncate and zero-extend cases pass as before.
- **The 12 FAIL rows are the insert, prepend and replace-grow cases at all
  four sizes.** Receipt text of each: `independent-graph failed with exit 1`;
  the check's own output: `persisted edit lost an original untouched payload
  object`. Their mounts ended Gone with KnownStop, and the full byte, inode,
  root and mapping checks before the retention check passed. How this check
  is judged for a shifted file is with the owner (O-6); nothing was changed.
- **Requests are equal in all 32 cases.**
- **Overlay logical bytes of the 20 shift cases are 258,048 to 479,232 at
  every size** (iteration 1: 774,144 at 1 MiB up to 536,563,712 for the
  500 MiB prepend). The moved tail is no longer stored.
- **Writer jobs and statements are lower in 29 cases.** Three are higher:
  `replace-grow` at 1 MiB (241 -> 244 jobs, 1241 -> 1433 statements) and at
  10 MiB (1296 -> 1376, 6974 -> 8252), and `insert` at 1 MiB in statements
  only (1194 -> 1227). At 100 and 500 MiB the same edits are lower by a
  factor of about four in jobs.
- **Commit, diagnostic:** 12 to 28 ms for insert, prepend, replace-grow and
  replace-shrink at every size (iteration 1: up to 5,373 ms). **The delete's
  Commit still follows the file size: 12.0, 13.9, 29.6, 92.1 ms** (open item
  of issue 316, phase D).
- **Exec, diagnostic:** still follows the file size (the writer moves the
  whole tail): 2.0 to 4.9 s at 500 MiB, against 2.9 to 7.2 s in iteration 1.
- The test copy of every FAIL sample (clone volume and stopped container,
  which the harness keeps) was removed by the driver: 12 volumes, 12
  containers, each matched to its sample by the volume name in its records.

- Storage after the family: 6 Docker volumes more than before the run
  (6 of them masters of current originals, 0 unexplained),
  0 containers more; originals 11754 MB, result folder
  361 MB; host 213 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=70.78GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-c7f283e6e/edit_length_changing/`.

## Phase C — batch 2, `edit_length_changing_capped`, tag `b1`, sampled at `716ab3743`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| insert-middle-4k-input-524283904b-result-500mib-ops-1-capped-v1 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |
| append-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1 | INELIGIBLE | PASS | PASS | 11 | 179 -> 173 | 899 -> 880 | 258048 -> 262144 | 530875288 | 37.2 -> 43.0 | 13.1 -> 16.1 |
| prepend-head-4k-input-524283904b-result-500mib-ops-1-capped-v1 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |
| replace-grow-middle-2k-to-4k-input-524285952b-result-500mib-ops-1-capped-v1 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |
| zero-extend-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1 | INELIGIBLE | PASS | PASS | 11 | 179 -> 173 | 899 -> 880 | 258048 -> 262144 | 530887648 | 41.4 -> 36.5 | 30.4 -> 13.3 |

Failure texts, as recorded:

- `insert-middle-4k-input-524283904b-result-500mib-ops-1-capped-v1`: original event wall stop: command
- `prepend-head-4k-input-524283904b-result-500mib-ops-1-capped-v1`: original event wall stop: command
- `replace-grow-middle-2k-to-4k-input-524285952b-result-500mib-ops-1-capped-v1`: original event wall stop: command

- **2 of 5 are functional PASS and proof PASS, 3 are FAIL with proof NOT_RUN,
  exactly as in iteration 1.** The three FAIL rows are the insert, prepend
  and replace-grow of a 500 MiB result; receipt text of each: `original event
  wall stop: command`. The family's 2 s limit for the edit command expired
  while the writer was moving the tail; no Commit, proof, End or KnownStop
  followed, so the rows have no counts, storage or phase times. The limit is
  with the owner (O-9); nothing was changed.
- For scale, the same three edits without the 2 s limit, in
  `edit_length_changing` above, took 2,185, 4,920 and 2,407 ms of exec.
- The two passing cases (append and zero-extend) equal iteration 1 in
  requests; writer jobs and statements are lower by 5 and 16, overlay logical
  bytes 4,096 higher, as in the other edit families.
- A sample ended by the limit leaves its daemon container running on the
  sample's volume. The driver stopped and removed the three containers and
  their volumes, each matched by the volume name in the sample's own records.

- Storage after the family: 2 Docker volumes more than before the run
  (2 of them masters of current originals, 0 unexplained),
  0 containers more; originals 6056 MB, result folder
  366 MB; host 219 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=70.13GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-716ab3743/edit_length_changing_capped/`.

## Phase C — batch 2, `small_file_delta_smoke`, tag `b1`, sampled at `3e238d364`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| small-file-delta-10x30-v1 | INELIGIBLE | PASS | PASS | 402 | 3142 -> 2919 | 14764 -> 14049 | 286720 -> 290816 | 2412624 -> 2474448 | 1289.5 -> 1419.7 | 236.5 -> 226.7 |

- 1 of 1: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE, as in iteration 1.
- Requests are equal (402). Writer jobs 3142 -> 2919 and statements 14764 ->
  14049 (branch-side Commit changes, as in the other edit families); overlay
  logical bytes 4,096 higher.

- Storage after the family: 5 Docker volumes more than before the run
  (5 of them masters of current originals, 0 unexplained),
  0 containers more; originals 4438 MB, result folder
  393 MB; host 221 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.71GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-3e238d364/small_file_delta_smoke/`.

## Phase C — batch 2, `edit_canonical_chunk_count`, tag `b1`, sampled at `a9dcfe107`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| overwrite-fixed-64k-chunk-count-preserve-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 154 -> 144 | 771 -> 738 | 299008 -> 303104 | 1442856 | 43.5 -> 32.7 | 11.5 -> 11.5 |
| overwrite-fixed-64k-chunk-count-preserve-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 357 -> 347 | 1854 -> 1821 | 327680 -> 331776 | 11048264 | 91.9 -> 41.2 | 16.2 -> 14.0 |
| overwrite-fixed-64k-chunk-count-preserve-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 357 -> 347 | 1854 -> 1821 | 335872 -> 339968 | 106538384 -> 106542504 | 556.7 -> 41.8 | 16.5 -> 14.1 |
| overwrite-fixed-64k-chunk-count-preserve-on-500mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 504 -> 494 | 2613 -> 2580 | 372736 -> 376832 | 530974144 | 2801.0 -> 39.5 | 61.2 -> 23.4 |
| overwrite-fixed-64k-chunk-count-increase-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 154 -> 144 | 771 -> 738 | 299008 -> 303104 | 1442856 | 42.6 -> 47.5 | 12.4 -> 12.7 |
| overwrite-fixed-64k-chunk-count-increase-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 357 -> 347 | 1854 -> 1821 | 327680 -> 331776 | 11031784 -> 11035904 | 102.8 -> 54.7 | 14.8 -> 17.5 |
| overwrite-fixed-64k-chunk-count-increase-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 357 -> 347 | 1854 -> 1821 | 335872 -> 339968 | 106538384 | 555.3 -> 38.4 | 17.5 -> 14.3 |
| overwrite-fixed-64k-chunk-count-increase-on-500mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 504 -> 494 | 2613 -> 2580 | 372736 -> 376832 | 530978264 | 2620.6 -> 47.4 | 18.5 -> 22.4 |
| overwrite-fixed-64k-chunk-count-decrease-on-1mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 154 -> 144 | 771 -> 738 | 299008 -> 303104 | 1376936 | 53.7 -> 32.7 | 13.2 -> 11.7 |
| overwrite-fixed-64k-chunk-count-decrease-on-10mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 357 -> 347 | 1854 -> 1821 | 327680 -> 331776 | 10957624 -> 10961744 | 94.7 -> 43.0 | 13.5 -> 17.0 |
| overwrite-fixed-64k-chunk-count-decrease-on-100mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 357 -> 347 | 1854 -> 1821 | 335872 -> 339968 | 106451864 | 562.1 -> 43.5 | 14.1 -> 13.9 |
| overwrite-fixed-64k-chunk-count-decrease-on-500mib-ops-1 | INELIGIBLE | PASS | PASS | 10 | 504 -> 494 | 2613 -> 2580 | 372736 -> 376832 | 530912344 | 2675.4 -> 49.4 | 16.5 -> 20.8 |

- 12 of 12: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE (class B precondition), as in iteration 1.
- **Requests are equal in all 12 cases** (10). Writer jobs are lower by 10
  and statements by 33 in every case; overlay logical bytes are 4,096 higher.
- **Exec is 33 to 55 ms at every size, against 43 ms to 2,801 ms in iteration
  1. This is the harness difference recorded in phase A, not the product:**
  iteration 1's timed writer generated and hashed the whole expected file
  for this family's final-digest check; here that check runs in preparation,
  the writer's verify mode and the oracle only. The daemon served the same 10
  requests in both. The exec column of this family must not be compared
  with the control.
- Commit is 11.5 to 23.4 ms at every size (iteration 1: 11.5 to 61.2 ms).
- This closes batch 2: 62 cases, 47 functional and proof PASS (iteration 1:
  39), 12 retention failures (20), 3 capped-limit failures (3).

- Storage after the family: 5 Docker volumes more than before the run
  (5 of them masters of current originals, 0 unexplained),
  0 containers more; originals 4438 MB, result folder
  393 MB; host 221 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.71GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-3e238d364/edit_canonical_chunk_count/`.

**Correction to the `edit_canonical_chunk_count` heading above:** its samples
were registered and taken at `3e238d364`, not `a9dcfe107`; the latter is the
ledger commit of `small_file_delta_smoke`, made between the last sample and
this entry. Product and harness source are the same at both. Later headings
take the commit from the family's run registration.

## Phase C — batch 3, `directory_construction_traversal`, tag `b1`, sampled at `6ede5b271`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| directory-construct-1-compact-v2 | INELIGIBLE | PASS | PASS | 16 | 171 | 761 | 229376 -> 233472 | 1405656 -> 1401560 | 42.1 -> 44.1 | 16.0 -> 12.3 |
| directory-construct-10-compact-v2 | INELIGIBLE | PASS | PASS | 448 | 3683 | 17261 | 286720 -> 290816 | 11047880 -> 11043760 | 68.7 -> 73.9 | 29.6 -> 29.7 |
| directory-construct-100-mixed-v4 | INELIGIBLE | PASS | PASS | 4408 | 49675 | 210008 | 831488 -> 839680 | 106744264 -> 106760624 | 247.5 -> 309.1 | 286.9 -> 262.4 |
| directory-construct-500-mixed-v4 | INELIGIBLE | PASS | PASS | 22008 | 248100 | 1048680 | 3153920 -> 3170304 | 536080384 -> 536039424 | 1224.5 -> 1439.7 | 1513.1 -> 1287.0 |
| directory-metadata-scan-1-compact-v2 | INELIGIBLE | PASS | PASS | 720 | 900 | 7397 | 229376 -> 233472 | 1347976 | 100.1 -> 91.5 | 8.7 -> 12.2 |
| directory-metadata-scan-10-compact-v2 | INELIGIBLE | PASS | PASS | 1219 | 1412 | 13736 | 262144 -> 266240 | 10957216 -> 10961312 | 176.2 -> 165.3 | 10.9 -> 11.5 |
| directory-metadata-scan-100-mixed-v4 | INELIGIBLE | PASS | PASS | 2744 | 2962 | 33526 | 372736 -> 376832 | 106410400 -> 106389920 | 431.1 -> 361.1 | 10.9 -> 9.7 |
| directory-metadata-scan-500-mixed-v4 | INELIGIBLE | PASS | PASS | 5864 | 6142 | 73786 | 589824 -> 593920 | 532005256 -> 531743136 | 828.8 -> 775.1 | 11.0 -> 12.4 |
| directory-content-scan-1-compact-v2 | INELIGIBLE | PASS | PASS | 871 | 1050 | 8247 | 229376 -> 233472 | 1347976 | 107.2 -> 106.9 | 8.1 -> 8.8 |
| directory-content-scan-10-compact-v2 | INELIGIBLE | PASS | PASS | 2720 | 3552 | 23516 | 262144 -> 266240 | 10957216 -> 10961312 | 414.1 -> 368.9 | 7.4 -> 11.9 |
| directory-content-scan-100-mixed-v4 | INELIGIBLE | PASS | PASS | 9144 | 11503 | 72608 | 372736 -> 376832 | 106410400 -> 106389920 | 1292.3 -> 1361.3 | 11.7 -> 10.6 |
| directory-content-scan-500-mixed-v4 | INELIGIBLE | PASS | PASS | 24063 | 29497 | 175496 | 589824 -> 610304 | 532005256 -> 531743136 | 5308.4 -> 5032.9 | 16.3 -> 15.3 |

- 12 of 12: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE, as in iteration 1.
- **Requests, writer jobs and statements are equal in all 12 cases.**
- Overlay logical bytes are 4,096 to 20,480 higher (schema 33). Store logical
  bytes differ by small amounts in some cases (table).

- Storage after the family: 8 Docker volumes more than before the run
  (8 of them masters of current originals, 0 unexplained),
  0 containers more; originals 5024 MB, result folder
  419 MB; host 220 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=70.37GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-6ede5b271/directory_construction_traversal/`.

## Phase C — batch 3, `git_tool_workflow`, tag `b1`, sampled at `082fa6202`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| git-tool-1-compact-v2 | INELIGIBLE | PASS | PASS | 5895 | 7423 -> 7400 | 45762 -> 45673 | 299008 -> 303104 | 1516464 -> 1512344 | 410.8 -> 374.6 | 17.7 -> 16.1 |
| git-tool-10-compact-v2 | INELIGIBLE | PASS | PASS | 9394 | 12330 -> 12271 | 75496 -> 75281 | 401408 -> 405504 | 4875688 -> 4888000 | 731.6 -> 682.3 | 28.0 -> 24.5 |
| git-tool-100-mixed-v4 | INELIGIBLE | PASS | PASS | 51386 | 69392 -> 68977 | 416614 -> 415104 | 1490944 -> 1495040 | 64759408 -> 64562848 | 4353.6 -> 3672.8 | 112.0 -> 100.5 |
| git-tool-500-mixed-v4 | INELIGIBLE | PASS | PASS | 118176 -> 118171 | 193539 -> 191583 | 1079116 -> 1071969 | 4886528 -> 4894720 | 80558592 -> 80583480 | 9939.8 -> 9721.3 | 414.4 -> 382.7 |

- 4 of 4: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1. Status INELIGIBLE, as in iteration 1.
- **Requests are equal in 3 cases and 5 lower of 118,176 in
  `git-tool-500-mixed-v4`.** The workload is Git itself, 118 thousand kernel
  requests; iteration 1 records that kernel batching can change the totals of
  a correct ordinary workload. No per-request trace was taken; not explained
  further and not sampled again.
- Writer jobs are lower by 23 to 1,956 and statements by 89 to 7,147
  (branch-side Commit changes: files of more than one cell are read once a
  run). Overlay logical bytes 4,096 or 8,192 higher.

- Storage after the family: 5 Docker volumes more than before the run
  (5 of them masters of current originals, 0 unexplained),
  0 containers more; originals 834 MB, result folder
  436 MB; host 225 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.21GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-082fa6202/git_tool_workflow/`.

## Phase C — batch 3, `local_snapshot`, tag `b1`, sampled at `082fa6202`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| local-snapshot-create-25000-onebyte-v1 | INELIGIBLE | PASS | PASS | 177581 | 1456520 -> 1403960 | 6956183 -> 6747991 | 28672000 -> 28934144 | 921712 -> 917592 | 15246.5 -> 11224.0 | 9002.0 -> 8130.1 |

- 1 of 1: functional PASS, proof PASS, mount Gone with KnownStop, as in
  iteration 1's authoritative sample. Status INELIGIBLE, as there.
- Requests are equal (177,581). Writer jobs 1,456,520 -> 1,403,960 and
  statements 6,956,183 -> 6,747,991; overlay logical bytes 28,672,000 ->
  28,934,144.
- Exec 15,246 -> 11,224 ms and Commit 9,002 -> 8,130 ms, single samples. The
  case's declared limit was recorded as exceeded in iteration 1; see the
  committed CSV for this run's limit status.

- Storage after the family: 5 Docker volumes more than before the run
  (5 of them masters of current originals, 0 unexplained),
  0 containers more; originals 834 MB, result folder
  436 MB; host 225 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.21GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-082fa6202/local_snapshot/`.

**Addition to the `local_snapshot` entry above:** this run's complete wall is
19,523 ms against the declared 15,000 ms, `EXCEEDED`, as in iteration 1.
Recorded, not judged.

## Phase C — batch 3, `workspace_change_locality`, tag `b1`, sampled at `7fb3b06a7`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-clean-commit-1-compact-v2 | INELIGIBLE | PASS | PASS | 0 | 47 | 204 | 229376 -> 233472 | 1343880 -> 1347976 | 0.0 -> 0.0 | 7.9 -> 9.4 |
| workspace-clean-commit-10-compact-v2 | INELIGIBLE | PASS | PASS | 0 | 47 | 204 | 262144 -> 266240 | 10953120 -> 10957216 | 0.0 -> 0.0 | 9.6 -> 11.9 |
| workspace-clean-commit-100-mixed-v4 | INELIGIBLE | PASS | PASS | 0 | 47 | 204 | 344064 -> 348160 | 106430880 -> 106406304 | 0.0 -> 0.0 | 11.5 -> 9.8 |
| workspace-clean-commit-500-mixed-v4 | INELIGIBLE | PASS | PASS | 0 | 47 | 204 | 540672 -> 544768 | 532062600 -> 531763616 | 0.0 -> 0.0 | 11.1 -> 13.4 |
| workspace-fixed-move-1-compact-v2 | INELIGIBLE | PASS | PASS | 16 | 151 | 700 | 229376 -> 233472 | 1393320 -> 1397416 | 42.9 -> 45.9 | 9.9 -> 11.6 |
| workspace-fixed-move-10-compact-v2 | INELIGIBLE | PASS | PASS | 16 | 151 | 700 | 262144 -> 266240 | 11014920 -> 11031376 | 38.7 -> 46.5 | 11.0 -> 13.1 |
| workspace-fixed-move-100-mixed-v4 | INELIGIBLE | PASS | PASS | 16 | 151 | 700 | 344064 -> 348160 | 106488560 -> 106476344 | 40.0 -> 36.3 | 14.4 -> 15.5 |
| workspace-fixed-move-500-mixed-v4 | INELIGIBLE | PASS | PASS | 16 | 151 | 700 | 540672 -> 544768 | 532136760 -> 531833656 | 40.1 -> 42.0 | 20.7 -> 27.7 |
| workspace-distributed-sdk-edit-1-compact-v2 | INELIGIBLE | PASS | PASS | 12 | 99 -> 94 | 460 -> 444 | 233472 -> 237568 | 1401560 -> 1405656 | 47.2 -> 42.8 | 9.5 -> 11.5 |
| workspace-distributed-sdk-edit-10-compact-v2 | INELIGIBLE | PASS | PASS | 75 | 468 -> 418 | 2359 -> 2199 | 286720 -> 290816 | 11089080 -> 11076696 | 41.4 -> 46.1 | 17.9 -> 15.7 |
| workspace-distributed-sdk-edit-100-mixed-v4 | INELIGIBLE | PASS | PASS | 745 | 4613 -> 4113 | 23126 -> 21526 | 786432 -> 790528 | 107312560 -> 107292104 | 110.4 -> 100.5 | 92.8 -> 77.8 |
| workspace-distributed-sdk-edit-500-mixed-v4 | INELIGIBLE | PASS | PASS | 3160 | 22874 -> 20374 | 108197 -> 100197 | 3039232 -> 3043328 | 537787920 -> 537800704 | 283.5 -> 184.7 | 355.8 -> 326.3 |
| workspace-dense-rewrite-1-compact-v2 | INELIGIBLE | PASS | PASS | 437 | 2347 -> 1950 | 12794 -> 11504 | 1351680 -> 1359872 | 2505720 -> 2509816 | 83.5 -> 82.9 | 47.1 -> 44.6 |
| workspace-dense-rewrite-10-compact-v2 | INELIGIBLE | PASS | PASS | 3146 | 24721 -> 20751 | 116903 -> 104003 | 11501568 -> 11509760 | 25624576 | 283.9 -> 297.5 | 396.1 -> 333.7 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE | PASS | PASS | 12545 | 102001 -> 84438 | 482758 -> 424874 | 109719552 -> 109760512 | 213618688 -> 213622784 | 1185.4 -> 1096.1 | 2540.7 -> 2236.7 |
| workspace-dense-rewrite-500-mixed-v4 | FAIL | PASS -> - | PASS -> NOT_RUN | 33359 -> - | 282059 -> - | 1353145 -> - | 541495296 -> - | 1066713088 -> - | 3630.1 -> 3321.7 | 11498.8 -> 16234.7 |

Failure texts, as recorded:

- `workspace-dense-rewrite-500-mixed-v4`: original operation not sent after expired wall stop: cleanup

- **15 of 16 are functional PASS and proof PASS, mount Gone with KnownStop
  (iteration 1: 16). `workspace-dense-rewrite-500-mixed-v4` is FAIL with
  proof NOT_RUN; it passed in iteration 1. This is a new failure.**
  - Receipt text: `original operation not sent after expired wall stop:
    cleanup`.
  - From the sample's own events: the command ended after 3,322 ms, the
    Commit after 16,235 ms (iteration 1: 3,630 and 11,499 ms), the unmount
    took 13 ms. Then 588 read-only cleanup observations over the harness's
    5 s allowance all report the measured Workspace's state as `Queued`; it
    never reached `Gone`, so the harness stopped before its proof. No count
    or storage observation was collected.
  - Not sampled again. Classified in phase D: the question is why the
    automatic reclamation of 541 MB of overlay payload did not start within
    5 s of the unmount here when it finished inside that time in iteration 1.
    The two 500 MiB create cases of batch 1 (533 and 541 MB of overlay)
    reached `Gone` inside the same allowance at this source.
  - The driver removed the sample's volume and its still-running container.
- **Requests are equal in all 15 completed cases.** Writer jobs and
  statements are equal in the 8 clean-commit and fixed-move cases and lower
  in the 7 completed sdk-edit and dense-rewrite cases (5 to 17,563 jobs;
  branch-side Commit changes). Overlay logical bytes 4,096 to 40,960 higher.
- Commit of `dense-rewrite-100` is 2,541 -> 2,237 ms.
- This closes batch 3: 33 cases, 32 functional and proof PASS (iteration 1:
  33), 1 new FAIL.

- Storage after the family: 4 Docker volumes more than before the run
  (4 of them masters of current originals, 0 unexplained),
  0 containers more; originals 5672 MB, result folder
  469 MB; host 220 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.72GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-7fb3b06a7/workspace_change_locality/`.

## Phase C — batch 4, `file_size_transition`, tag `b1`, sampled at `51830f569`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v016-boundary-small-control-v1 | INELIGIBLE | PASS | PASS | 14 | 192 -> 181 | 857 -> 823 | 229376 -> 233472 | 394304 | 82.2 -> 108.7 | 16.4 -> 17.2 |
| v016-boundary-below-v1 | INELIGIBLE | PASS | PASS | 14 | 194 -> 182 | 865 -> 828 | 229376 -> 233472 | 789080 | 93.6 -> 94.2 | 21.1 -> 20.6 |
| v016-boundary-exact-v1 | INELIGIBLE | PASS | PASS | 14 | 272 -> 261 | 1357 -> 1323 | 229376 -> 233472 | 529472 | 82.5 -> 90.4 | 18.1 -> 18.3 |
| v016-boundary-above-v1 | INELIGIBLE | PASS | PASS | 14 | 272 -> 261 | 1357 -> 1323 | 229376 -> 233472 | 529472 | 71.4 -> 99.9 | 14.5 -> 18.6 |
| v016-boundary-large-control-v1 | INELIGIBLE | PASS | PASS | 14 | 272 -> 261 | 1357 -> 1323 | 233472 -> 237568 | 1463408 | 83.4 -> 79.7 | 19.8 -> 19.6 |
| v016-boundary-roundtrip-v1 | INELIGIBLE | PASS | PASS | 26 | 407 -> 386 | 1900 -> 1836 | 233472 -> 237568 | 727280 | 185.9 -> 177.6 | 30.8 -> 32.4 |
| v016-boundary-alias-roundtrip-v1 | FAIL | FAIL -> - | FAIL | - | - | - | - | - | 241.1 -> 241.5 | 30.9 -> 41.1 |

Failure texts, as recorded:

- `v016-boundary-alias-roundtrip-v1`: original command exit is not known zero: 1

- **6 of 7 are functional PASS and proof PASS, mount Gone with KnownStop; 1 is
  FAIL, exactly as in iteration 1.**
- `v016-boundary-alias-roundtrip-v1` is FAIL with proof FAIL; receipt text
  `original command exit is not known zero: 1`, the same text iteration 1
  recorded (the frozen alias save helper changes the parent directory's mtime
  and the frozen verifier requires the fixture's). No counts were collected.
  The driver removed its volume and container.
- This family crosses the 128 KiB chunk threshold by truncate-and-rewrite and
  by atomic save. Its six completed cases pass every byte check with the
  piece work in place.
- **Requests are equal in the 6 completed cases** (14 or 26). Writer jobs are
  lower by 11 to 21 and statements by 34 to 64; overlay logical bytes 4,096
  higher.

- Storage after the family: 6 Docker volumes more than before the run
  (6 of them masters of current originals, 0 unexplained),
  0 containers more; originals 91 MB, result folder
  480 MB; host 226 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.07GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-51830f569/file_size_transition/`.

## Phase C — batch 4, `dedup_branch_history`, tag `b1`, sampled at `de6e61269`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dedup-history-distributed-1 | INELIGIBLE | PASS | PASS | 10 | 102 -> 95 | 466 -> 445 | 245760 -> 249856 | 1434304 -> 1430208 | 49.6 -> 47.4 | 11.1 -> 10.9 |
| dedup-history-distributed-10 | INELIGIBLE | PASS | PASS | 68 | 971 -> 901 | 4395 -> 4182 | 245760 -> 249856 | 2180024 -> 2196528 | 453.1 -> 471.1 | 70.9 -> 77.3 |
| dedup-history-distributed-100 | INELIGIBLE | PASS | PASS | 633 | 9623 -> 8922 | 43407 -> 41276 | 245760 -> 249856 | 6110928 -> 6094472 | 4063.1 -> 4801.4 | 789.1 -> 872.7 |
| dedup-history-distributed-500 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 17352.2 | - -> 4169.1 |
| dedup-history-hotset-1 | INELIGIBLE | PASS | PASS | 11 | 108 -> 100 | 496 -> 471 | 245760 -> 249856 | 1434304 -> 1442568 | 53.7 -> 49.4 | 12.1 -> 9.3 |
| dedup-history-hotset-10 | INELIGIBLE | PASS | PASS | 201 | 1273 -> 1193 | 6776 -> 6526 | 245760 -> 249856 | 2159424 -> 2175928 | 536.4 -> 488.7 | 80.7 -> 81.4 |
| dedup-history-hotset-100 | INELIGIBLE | PASS | PASS | 741 | 10273 -> 9473 | 46736 -> 44236 | 245760 -> 249856 | 6106760 -> 6069752 | 4607.4 -> 4793.8 | 915.0 -> 898.9 |
| dedup-history-hotset-500 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 17896.7 | - -> 4153.6 |
| dedup-history-recurring-1 | INELIGIBLE | PASS | PASS | 10 | 104 -> 96 | 479 -> 453 | 278528 -> 282624 | 1483744 -> 1492008 | 25.8 -> 50.1 | 12.2 -> 11.7 |
| dedup-history-recurring-10 | INELIGIBLE | PASS | PASS | 55 | 960 -> 880 | 4306 -> 4046 | 278528 -> 282624 | 1817464 -> 1825728 | 387.2 -> 451.1 | 64.2 -> 73.4 |
| dedup-history-recurring-100 | INELIGIBLE | PASS | PASS | 505 | 9510 -> 8710 | 42556 -> 39956 | 278528 -> 282624 | 5348304 -> 5352448 | 3599.7 -> 4689.3 | 637.6 -> 665.4 |
| dedup-history-recurring-500 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 17649.6 | - -> 2493.7 |
| dedup-history-metadata-1 | INELIGIBLE | PASS | PASS | 8 | 86 | 390 | 245760 -> 249856 | 1434304 -> 1438448 | 47.8 -> 46.2 | 12.3 -> 10.7 |
| dedup-history-metadata-10 | INELIGIBLE | PASS | PASS | 35 | 798 | 3569 | 245760 -> 249856 | 1768024 -> 1772168 | 446.4 -> 472.1 | 71.3 -> 69.4 |
| dedup-history-metadata-100 | INELIGIBLE | PASS | PASS | 305 | 7908 | 35339 | 245760 -> 249856 | 5327704 -> 5294768 | 4408.4 -> 4674.5 | 639.1 -> 635.4 |
| dedup-history-metadata-500 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 17380.3 | - -> 2420.3 |
| dedup-history-unrelated-1 | INELIGIBLE | PASS | PASS | 2206 | 10450 -> 9426 | 52021 -> 48741 | 1548288 -> 1552384 | 2649704 -> 2649728 | 287.7 -> 249.0 | 105.8 -> 88.8 |
| dedup-history-unrelated-10 | INELIGIBLE | PASS | PASS | 19027 | 100279 -> 90039 | 476416 -> 443616 | 1548288 -> 1552384 | 15855616 -> 15851520 | 2056.8 -> 2011.3 | 945.9 -> 870.3 |
| dedup-history-unrelated-100-mixed-v2 | INELIGIBLE | PASS | PASS | 6315 | 56515 -> 44715 | 269052 -> 229852 | 1306624 -> 1310720 | 109027328 -> 110096384 | 4958.0 -> 5457.9 | 2375.4 -> 2224.3 |
| dedup-history-unrelated-500-mixed-v2 | FAIL | FAIL -> - | NOT_RUN | - | - | - | - | - | - -> 19084.1 | - -> 9147.5 |
| v016-history-large-hotset-k10-v1 | INELIGIBLE | PASS | PASS | 59 | 1341 -> 1281 | 6658 -> 6470 | 241664 -> 245760 | 3711664 -> 3761104 | 450.0 -> 501.8 | 92.0 -> 81.0 |
| v016-history-large-hotset-k100-v1 | INELIGIBLE | PASS | PASS | 539 | 13139 -> 12539 | 65204 -> 63336 | 241664 -> 245760 | 7175648 | 4409.1 -> 4660.0 | 696.2 -> 698.7 |
| v016-history-namespace-inode-k10-v1 | INELIGIBLE | PASS | PASS | 162 | 1688 -> 1660 | 8014 -> 7914 | 237568 -> 241664 | 3711640 -> 3744600 | 470.4 -> 477.1 | 87.9 -> 79.2 |
| v016-history-namespace-inode-k100-v1 | INELIGIBLE | PASS | PASS | 1530 | 16761 -> 16481 | 79337 -> 78337 | 237568 -> 241664 | 7409312 -> 7396976 | 4587.9 -> 4752.6 | 790.0 -> 761.6 |
| v016-history-boundary-cycle-k10-v1 | INELIGIBLE | PASS | PASS | 115 | 1472 -> 1367 | 7083 -> 6763 | 233472 -> 237568 | 3530384 | 446.3 -> 485.9 | 73.3 -> 78.2 |
| v016-history-boundary-cycle-k100-v1 | INELIGIBLE | PASS | PASS | 1105 | 14612 -> 13562 | 70308 -> 67108 | 233472 -> 237568 | 7192056 -> 7192032 | 4297.4 -> 4814.2 | 690.3 -> 700.6 |

Failure texts, as recorded:

- `dedup-history-distributed-500`: original event wall stop: command
- `dedup-history-hotset-500`: original edit/Commit/End group watchdog expired
- `dedup-history-recurring-500`: original edit/Commit/End group watchdog expired
- `dedup-history-metadata-500`: original event wall stop: command
- `dedup-history-unrelated-500-mixed-v2`: Command '['docker', '--host', 'unix:///Users/yifanxu/.docker/run/docker.sock', 'exec', '--user', '0:0', '2ba3be9bb868775f1a7610cca96eecdff68d3a88d9b3cbcca0c1a82bfa3d75ca', 'python3', '-B', '-c', "import json\nfrom pathlib import Path\nstore=Path('/layerfs-store/global/store.sqlite').stat()\nevents=d

- **21 of 26 are functional PASS and proof PASS, mount Gone with KnownStop; 5
  are FAIL with proof NOT_RUN: the same 21 and the same 5 as in iteration 1.**
- **The 5 FAIL rows are the 500-step schedules.** Each case declares a 120 s
  performance hard watchdog for its whole schedule; all five reached it with
  358 to 392 of their 500 Commits acknowledged (distributed 373, hotset 392,
  recurring 389, metadata 390, unrelated 358). Receipt texts, as recorded:
  `original event wall stop: command` (distributed, metadata), `original
  edit/Commit/End group watchdog expired` (hotset, recurring), and for
  `unrelated` a resource observation that `timed out after 0.008…seconds`,
  which is the same stop met inside an observer call. No count, storage,
  proof, End or KnownStop followed.
  - Iteration 1 recorded these five as stopped by its fixed outer 120 s
    ceiling with no complete receipt. Here each ran in a call of its own with
    a 200 or 300 s outer stop (decision 4 of phase A), so the case's own
    watchdog ended it and a receipt exists. The outcome is the same FAIL.
  - A 100-step schedule of this family takes 40 to 49 s as a whole sample.
  - The driver removed the five volumes and their running containers.
- **Requests are equal in all 21 completed cases.** Writer jobs and
  statements are equal in the 3 metadata cases and lower in the other 18
  (7 to 11,800 jobs). Overlay logical bytes are 4,096 higher in all 21.
- **Store logical bytes: `dedup-history-unrelated-100-mixed-v2` is 1,069,056
  bytes larger (109,027,328 -> 110,096,384, +1.0%).** The other 20 differ by
  at most 50 KB in either direction. Not explained here; listed for phase D.
- First sample measured for leftovers: a history sample keeps per-step
  evidence (10 to 12 MB for 100 or more steps) and its exported Stores; the
  driver removed the Stores (5 to 436 MB a sample), nothing else remained.

- Storage after the family: 5 Docker volumes more than before the run
  (5 of them masters of current originals, 0 unexplained),
  0 containers more; originals 810 MB, result folder
  748 MB; host 225 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.08GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-de6e61269/dedup_branch_history/`.

## Phase C — batch 4, `mixed_load_bearing`, tag `b1`, sampled at `fd2da7385`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| agent-episodes-1-compact-v2 | INELIGIBLE | PASS | PASS | 95 | 461 -> 450 | 2367 -> 2328 | 258048 -> 262144 | 1467312 | 42.8 -> 47.6 | 13.1 -> 12.6 |
| agent-episodes-10-compact-v2 | INELIGIBLE | PASS | PASS | 833 | 3349 -> 3239 | 18118 -> 17728 | 528384 -> 532480 | 11491352 -> 11495448 | 99.1 -> 106.8 | 30.4 -> 32.2 |
| agent-episodes-100 | INELIGIBLE | PASS | PASS | 8213 | 37158 -> 36058 | 190372 -> 186472 | 3268608 -> 3280896 | 86206552 -> 86144872 | 662.9 -> 617.6 | 275.6 -> 266.3 |
| agent-episodes-500 | INELIGIBLE | PASS | PASS | 41013 | 186571 -> 181071 | 952225 -> 932697 | 15392768 -> 15437824 | 95055872 -> 95047680 | 3084.9 -> 3704.4 | 1298.8 -> 1079.4 |
| v016-mixed-development-100mb-5000-k10-v1 | FAIL | FAIL -> - | FAIL | - | - | - | - | - | 822.1 -> 781.6 | 351.1 -> 341.5 |
| v016-mixed-development-100mb-5000-k100-v1 | FAIL | FAIL -> - | FAIL | - | - | - | - | - | 7500.9 -> 8342.2 | 4083.4 -> 3925.6 |
| v016-mixed-development-500mb-30000-k10-v1 | FAIL | FAIL -> - | FAIL | - | - | - | - | - | 1266.3 -> 1338.3 | 695.0 -> 689.6 |
| v016-mixed-development-500mb-30000-k100-v1 | FAIL | FAIL -> - | FAIL | - | - | - | - | - | 13393.7 -> 13581.2 | 7302.7 -> 7333.5 |
| v016-mixed-exhaustive-100mb-5000-k100-v1 | FAIL | FAIL -> - | FAIL | - | - | - | - | - | - -> 8647.6 | - -> 4082.7 |
| v016-mixed-exhaustive-500mb-30000-k100-v1 | FAIL | NOT_RUN -> - | NOT_RUN | - | - | - | - | - | - -> 13566.3 | - -> 7155.0 |

Failure texts, as recorded:

- `v016-mixed-development-100mb-5000-k10-v1`: original command exit is not known zero: 1
- `v016-mixed-development-100mb-5000-k100-v1`: original command exit is not known zero: 1
- `v016-mixed-development-500mb-30000-k10-v1`: original command exit is not known zero: 1
- `v016-mixed-development-500mb-30000-k100-v1`: original command exit is not known zero: 1
- `v016-mixed-exhaustive-100mb-5000-k100-v1`: original command exit is not known zero: 1
- `v016-mixed-exhaustive-500mb-30000-k100-v1`: Command '['docker', '--host', 'unix:///Users/yifanxu/.docker/run/docker.sock', 'exec', '--user', '0:0', '166cc6dbc8f6d7da60f1753e0225fd04f787698908fbfb8ff30d67c7c0f2abdf', 'python3', '-B', '-c', "import json\nfrom pathlib import Path\nstore=Path('/layerfs-store/global/store.sqlite').stat()\nevents=d

Ten cases: 4 completed with functional PASS and proof PASS, 6 FAIL. Iteration 1: 4 PASS, 5 FAIL, 1 NOT_RUN.

- The four `agent-episodes` cases: requests equal the control (95; 833; 8,213; 41,013). Writer jobs are lower
  by 11, 110, 1,100 and 5,500 and statements by 39, 390, 3,900 and 19,528. Overlay logical bytes are higher by
  4,096 to 45,056 B. Store logical bytes: equal for 1 episode, +4,096 B for 10, −61,680 B for 100, −8,192 B
  for 500.
- The five failures `v016-mixed-development-*` (four) and `v016-mixed-exhaustive-100mb-5000-k100-v1` are the
  control's failures: every command and Commit was acknowledged, then the fresh-mount check ended with
  `original M1 declared file metadata differs: d000/f00054` (100 MB) or `d003/f00004` (500 MB). Iteration 1
  records these two paths and classifies the row as H-17, a frozen workload and check that set a file's
  mtime before writing it. The receipt's failure text is `original command exit is not known zero: 1`, so
  counts and sizes are not recorded for them. Nothing was changed.
- `v016-mixed-exhaustive-500mb-30000-k100-v1`: iteration 1 has NOT_RUN because its preparation reached 120 s.
  Here the preparation ran in one call with the 300 s extreme-case stop (reason: the control's 120 s stop;
  it took 265.7 s and made a 10.7 GB original). The sample ran in one 300 s call. It is a verification-only
  case: the 100 commands took 13,566 ms and 99 of 100 after-Commit records are complete (Commit 7,155 ms)
  when the harness's own 120 s ceiling for this case (`owner_test_ceiling_ms`) was reached at a Store size
  readback, 121.2 s into the call. Status FAIL, proof NOT_RUN, cleanup UNAVAILABLE. The driver then removed
  the sample's volume and container. Not rerun.
- Decided by agent: the first preparation of `v016-mixed-exhaustive-100mb-5000-k100-v1` was cut by what was
  left of a shared 118 s call (63 s), after `prepared.json` and before the harness sealed the folder with
  `manifest.json`. The harness refuses such a folder, so the driver now treats a missing `manifest.json` as
  incomplete, removed the folder (2,138.7 MB) and prepared it again in a call of its own (70.8 s). The
  driver also starts a preparation only with 60 s of its call left. No sample was taken from the partial
  folder.
- exec and Commit times are diagnostic only (interference declared); they are within about 20% of the
  control in both directions.

- Storage after the family: 5 Docker volumes more than before the run
  (5 of them masters of current originals, 0 unexplained),
  0 containers more; originals 16086 MB, result folder
  790 MB; host 209 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.77GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-fd2da7385/mixed_load_bearing/`.

## Phase C — batch 5, `branch_development`, tag `b1`, sampled at `325ed0053`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v016-branch-mixed-100mb-5000-k10-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 787.9 | - -> 328.1 |
| v016-branch-mixed-100mb-5000-k100-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 788.5 | - -> 322.1 |
| v016-branch-mixed-500mb-30000-k10-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 1290.8 | - -> 627.5 |
| v016-branch-mixed-500mb-30000-k100-v1 | FAIL | NOT_RUN -> FAIL | NOT_RUN | - | - | - | - | - | - -> 1340.2 | - -> 663.0 |
| v016-branch-convergent-content-v1 | INELIGIBLE | PASS | PASS | - -> 162 | - -> 2664 | - -> 12058 | 229376 -> 233472 | 4655120 -> 4659240 | 1178.9 -> 1274.3 | 212.9 -> 200.2 |
| v016-branch-fork-descendant-v1 | INELIGIBLE | PASS | PASS | - -> 216 | - -> 3566 | - -> 16113 | 229376 -> 233472 | 6138320 -> 6142440 | 1586.8 -> 1675.4 | 292.1 -> 290.6 |

Failure texts, as recorded:

- `v016-branch-mixed-100mb-5000-k10-v1`: original runtime failure: original_failure=original concurrent round failure original external command exit: ExecInspection { container: ContainerId("bb13ec24a6be9271216499ab8fe599f83db469f71620d9a031c1a575e7274520"), exec: ExecId("e4729e512f5fbf9e20ca6ee82d673852ff4fdbb6af270a06616a603bc0a6f07c"), 
- `v016-branch-mixed-100mb-5000-k100-v1`: original runtime failure: original_failure=original concurrent round failure original external command exit: ExecInspection { container: ContainerId("fe1b4d17946caeb48c1b752066a0bf6aa60e8e650ef33ff89dcfa6079cdb4119"), exec: ExecId("89ec5a5dbf7fc1971a5754dfb1d8243fcfc1673c5913193312ff909861832ea9"), 
- `v016-branch-mixed-500mb-30000-k10-v1`: original runtime failure: original_failure=original concurrent round failure SDK operation: Remote(ControlRefusal { code: Busy, phase: "Commit Begin", moved: None, published: None, detail: "Store busy before effect" }); no replay or automatic teardown
- `v016-branch-mixed-500mb-30000-k100-v1`: original runtime failure: original_failure=original concurrent round failure SDK operation: Remote(ControlRefusal { code: Busy, phase: "Commit Begin", moved: None, published: None, detail: "Store busy before effect" }); no replay or automatic teardown

Six cases: 2 completed with functional PASS and proof PASS, 4 FAIL. Iteration 1: 2 PASS, 3 FAIL, 1 NOT_RUN.

- `v016-branch-convergent-content-v1` and `v016-branch-fork-descendant-v1`: requests 162 and 216, writer
  jobs 2,664 and 3,566, statements 12,058 and 16,113. The control CSV has no counts for these two rows, so
  they are not compared. Overlay logical bytes +4,096 B and Store logical bytes +4,120 B on both.
- `v016-branch-mixed-100mb-5000-k10-v1` and `-k100-v1`: `original concurrent round failure original external
  command exit … exit_code: Some(1)`. Iteration 1 records these two as a child's first creating write
  returning EAGAIN under concurrent access.
- `v016-branch-mixed-500mb-30000-k10-v1`: `original concurrent round failure SDK operation:
  Remote(ControlRefusal { code: Busy, phase: "Commit Begin", … detail: "Store busy before effect" })`, the
  control's failure text for this case.
- `v016-branch-mixed-500mb-30000-k100-v1`: iteration 1 has NOT_RUN because its preparation reached 120 s.
  Here the preparation ran in one call with the 300 s extreme-case stop and took 118.8 s. The sample then
  failed with the same `Commit Begin` Busy refusal as the k10 case. This is a new sampled outcome, not a
  new kind of failure.
- All four failures end before the proof (proof NOT_RUN, cleanup UNAVAILABLE); the driver removed each
  sample's volume and container afterwards. Which child was refused and how many Commits were acknowledged
  before it was not compared with the control. Iteration 1's decision 55 classifies both refusals as the
  current contract's refusal before effect met by a workload that requires every concurrent operation to
  succeed. Nothing was changed.
- exec and Commit times are diagnostic only (interference declared).

- Storage after the family: 3 Docker volumes more than before the run
  (3 of them masters of current originals, 0 unexplained),
  0 containers more; originals 5458 MB, result folder
  817 MB; host 220 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.68GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-325ed0053/branch_development/`.

## Phase C — batch 5, `multi_workspace_development`, tag `b1`, sampled at `fb3c4d3f8`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v016-workspace-mixed-100mb-5000-k10-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |
| v016-workspace-mixed-100mb-5000-k100-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |
| v016-workspace-mixed-500mb-30000-k10-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |
| v016-workspace-mixed-500mb-30000-k100-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |
| v016-workspace-four-100mb-5000-k100-v1 | FAIL | FAIL | NOT_RUN | - | - | - | - | - | - -> 0.0 | - -> 0.0 |

Failure texts, as recorded:

- `v016-workspace-mixed-100mb-5000-k10-v1`: original runtime failure: original_failure=original concurrent round failure original external command exit: ExecInspection { container: ContainerId("c0897cfabf4bbd8db9ded35bd2c7c38a0c509dde37b5c13a208029495eb953e0"), exec: ExecId("4279fdd49b667a4026ada9833a0f929c3b7eeb0ad4f4da90321068f743f3557f"), 
- `v016-workspace-mixed-100mb-5000-k100-v1`: original runtime failure: original_failure=original concurrent round failure original external command exit: ExecInspection { container: ContainerId("ca2ea9d8cb5e1f32f04d932c2ae18049594d4287e01773c883ec89c53e773146"), exec: ExecId("db96f10dd3fca012bf14bc48034b60d736a30819b06bdd21e48ae5d1e73fd156"), 
- `v016-workspace-mixed-500mb-30000-k10-v1`: original runtime failure: original_failure=original concurrent round failure original external command exit: ExecInspection { container: ContainerId("dc258b304a8e90412733c46970e23ac3afa9aa869f973b441107aa4895a2a0cb"), exec: ExecId("c39fd2778bf5c0f072d88a5da5047d865a20c77fa981c65c1c1b8af908031c72"), 
- `v016-workspace-mixed-500mb-30000-k100-v1`: original runtime failure: original_failure=original concurrent round failure original external command exit: ExecInspection { container: ContainerId("2d3703a871cbf321bbd4368b761d1371fbb792ace5d70db880a583972b2670f7"), exec: ExecId("e093fb31cf66f8dda7c85f4a06965a3f10c0598fab6422d51baec2e4d0018e71"), 
- `v016-workspace-four-100mb-5000-k100-v1`: original runtime failure: original_failure=original concurrent round failure original external command exit: ExecInspection { container: ContainerId("3e4958eed551819b7cc2017502203d32260c95ca1a880df638f1413711200c14"), exec: ExecId("3ccb888207a9941086e00a89d436f13ea3669ae19646c19267006237a24d739c"),

Five cases, all FAIL (functional FAIL, proof NOT_RUN), as in iteration 1.

- Every sample ended in its first concurrent round: one worker's command exited 1, and its retained
  standard error is `fs-benchmark-workload: stage 1 cycle 1: Resource temporarily unavailable (os error 11)`.
  The receipt text is `original concurrent round failure original external command exit … exit_code: Some(1)`.
- Iteration 1 records the same EAGAIN on a stage 1 creating write for three of the five cases and a
  `Commit Begin` Busy refusal for the other two (`v016-workspace-mixed-100mb-5000-k100-v1`,
  `v016-workspace-mixed-500mb-30000-k10-v1`). Here those two also ended on the EAGAIN. Both are the
  refusal before effect that iteration 1's decision 55 describes; which one a sample meets first depends on
  timing between the workers. How many Commits each worker had acknowledged was not compared.
- No counts, sizes or exec and Commit times are recorded for a sample that ends this way; cleanup is
  UNAVAILABLE. The driver removed each sample's volume and container afterwards. Nothing was changed.

- Storage after the family: 2 Docker volumes more than before the run
  (2 of them masters of current originals, 0 unexplained),
  0 containers more; originals 4713 MB, result folder
  828 MB; host 221 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.68GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-fb3c4d3f8/multi_workspace_development/`.

## Phase C — batch 5, `historical_access`, tag `b1`, sampled at `a8a3ff2de`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v016-access-boundary-before-v1 | PASS | PASS | PASS | - | - | - | - -> 233472 | - -> 3084392 | - -> 116.5 | - -> 0.0 |
| v016-access-boundary-after-v1 | PASS | PASS | PASS | - | - | - | - -> 233472 | - -> 3084392 | - -> 110.6 | - -> 0.0 |
| v016-access-inode-before-v1 | PASS | PASS | PASS | - | - | - | - -> 233472 | - -> 3543144 | - -> 87.0 | - -> 0.0 |
| v016-access-inode-after-v1 | PASS | PASS | PASS | - | - | - | - -> 233472 | - -> 3543144 | - -> 95.1 | - -> 0.0 |
| v016-access-fork-point-v1 | PASS | PASS | PASS | - | - | - | - -> 233472 | - -> 3137640 | - -> 87.3 | - -> 0.0 |
| v016-access-divergent-head-v1 | PASS | PASS | PASS | - | - | - | - -> 233472 | - -> 3465320 | - -> 92.5 | - -> 0.0 |

Six cases; every receipt has status PASS, functional PASS and proof PASS, as in iteration 1.

- These are verification-only cases (no timed performance sample, no Commit), so the harness records PASS
  rather than the INELIGIBLE it gives a timed sample with interference declared. Requests, writer jobs and
  statements are UNAVAILABLE in the receipts and absent from the control CSV.
- Overlay logical bytes are 233,472 B in all six and Store logical bytes 3,084,392 to 3,543,144 B. The
  control CSV has no sizes for these rows, so the 30 entries the comparison lists as differences are values
  with nothing to compare against, not changes.
- The exec column is the read command of the check, 87 to 117 ms; diagnostic only.
- Each preparation took 15 to 59 s; four of the six needed a call of their own under the driver's rule that
  a preparation starts only with 60 s left.

- Storage after the family: 12 Docker volumes more than before the run
  (12 of them masters of current originals, 0 unexplained),
  0 containers more; originals 489 MB, result folder
  845 MB; host 225 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.1GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-a8a3ff2de/historical_access/`.

## Phase C — batch 6, `dedup_cdc_locality`, tag `b1`, sampled at `eab848c1c`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dedup-cdc-overwrite-1 | INELIGIBLE | PASS | PASS | - | - | - | - | 1253376 | 18.9 -> 25.3 | - -> - |
| dedup-cdc-overwrite-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 1445888 | 25.7 -> 32.2 | - -> - |
| dedup-cdc-overwrite-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 3493888 -> 3489792 | 164.8 -> 114.5 | - -> - |
| dedup-cdc-overwrite-500 | INELIGIBLE | PASS | PASS | - | - | - | - | 12107776 -> 12095488 | 384.0 -> 418.0 | - -> - |
| dedup-cdc-insert-1 | INELIGIBLE | PASS | PASS | - | - | - | - | 1265664 | 18.3 -> 25.3 | - -> - |
| dedup-cdc-insert-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 1720320 | 26.2 -> 35.7 | - -> - |
| dedup-cdc-insert-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 4952064 -> 4947968 | 105.4 -> 128.7 | - -> - |
| dedup-cdc-insert-500 | INELIGIBLE | PASS | PASS | - | - | - | - | 15482880 -> 15495168 | 459.6 -> 455.4 | - -> - |
| dedup-cdc-delete-1 | INELIGIBLE | PASS | PASS | - | - | - | - | 1347584 | 18.5 -> 23.1 | - -> - |
| dedup-cdc-delete-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 1773568 | 29.2 -> 38.2 | - -> - |
| dedup-cdc-delete-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 4403200 -> 4395008 | 117.0 -> 120.6 | - -> - |
| dedup-cdc-delete-500 | INELIGIBLE | PASS | PASS | - | - | - | - | 13295616 -> 13279232 | 520.4 -> 454.6 | - -> - |
| dedup-cdc-common-body-1 | INELIGIBLE | PASS | PASS | - | - | - | - | 1519616 | 20.7 -> 26.4 | - -> - |
| dedup-cdc-common-body-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 4251648 | 41.5 -> 48.4 | - -> - |
| dedup-cdc-common-body-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 30687232 -> 30695424 | 214.1 -> 282.3 | - -> - |
| dedup-cdc-common-body-500 | INELIGIBLE | PASS | PASS | - | - | - | - | 148209664 -> 148242432 | 1155.3 -> 1092.9 | - -> - |
| dedup-cdc-scattered-1 | INELIGIBLE | PASS | PASS | - | - | - | - | 2301952 | 23.8 -> 28.7 | - -> - |
| dedup-cdc-scattered-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 11853824 -> 11849728 | 68.3 -> 89.6 | - -> - |
| dedup-cdc-scattered-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 107364352 | 608.9 -> 665.0 | - -> - |
| dedup-cdc-scattered-500 | FAIL | FAIL -> - | FAIL | - | - | - | - | 531984384 -> 531935232 | 3063.7 -> 3009.4 | - -> - |
| dedup-cdc-boundaries-proof | PASS | PASS | PASS | - | - | - | - | - -> 479232 | - -> 22.9 | - -> - |

Failure texts, as recorded:

- `dedup-cdc-scattered-500`: original event wall stop: verify

Twenty-one cases: 20 completed with functional PASS and proof PASS, 1 FAIL, as in iteration 1.

- This family runs Project Init on native trees and measures Store size; requests, writer jobs, statements
  and overlay sizes do not apply and there is no Commit. `dedup-cdc-boundaries-proof` is verification-only
  and its receipt has status PASS; the other 19 completed rows are INELIGIBLE (interference declared).
- Store logical bytes: equal to the control in 9 cases; 11 differ by −49,152 to +32,768 B, each under 0.3%
  of the case's Store (largest: `dedup-cdc-scattered-500` −49,152 B of 531,984,384 B; `dedup-cdc-common-body-500`
  +32,768 B of 148,209,664 B). `dedup-cdc-boundaries-proof` records 479,232 B; the control CSV has no size
  for it.
- `dedup-cdc-scattered-500`: `original event wall stop: verify`. The measured Init completed (3,009 ms); the
  check's cumulative 41 s work allowance ended during the fresh mounted native comparison (41,009.7 ms
  recorded), the control's failure for this case (41,005.1 ms there). Proof FAIL, cleanup UNAVAILABLE; the
  driver removed the sample's volume and two containers afterwards.
- exec is the Init command, diagnostic only (interference declared).

Storage, decided by agent: the cleanup change made after batch 4 (unlink an original's files in pieces a
call can stop between) removed the nested claim files that name an original's volumes before reading
them. After `historical_access` this left 12 volumes of this run (six history masters and the six
producer masters its preparations made, all created during those preparations, none in the pre-run list,
none used by a container). They were removed by name and the driver now keeps the volume names before it
unlinks anything. The check after that shows no volume or container of this run.

- Storage after the family: 0 Docker volumes more than before the run
  (0 of them masters of current originals, 0 unexplained),
  0 containers more; originals 3129 MB, result folder
  1006 MB; host 223 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.06GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-eab848c1c/dedup_cdc_locality/`.

## Phase C — batch 6, `dedup_cross_file`, tag `b1`, sampled at `67494a503`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dedup-cross-file-anchor-1 | INELIGIBLE | PASS | PASS | - | - | - | - | 1232896 | 20.6 -> 21.3 | - -> - |
| dedup-cross-file-unique-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 10797056 -> 10788864 | 73.7 -> 92.4 | - -> - |
| dedup-cross-file-unique-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 106270720 -> 106299392 | 593.0 -> 658.1 | - -> - |
| dedup-cross-file-unique-500 | INELIGIBLE | PASS | PASS | - | - | - | - | 530804736 -> 530841600 | 2690.4 -> 2928.7 | - -> - |
| dedup-cross-file-identical-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 1232896 | 44.1 -> 29.9 | - -> - |
| dedup-cross-file-identical-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 1236992 | 79.8 -> 87.2 | - -> - |
| dedup-cross-file-identical-500 | INELIGIBLE | PASS | PASS | - | - | - | - | 1236992 | 314.4 -> 333.7 | - -> - |
| dedup-cross-file-mixed-10 | INELIGIBLE | PASS | PASS | - | - | - | - | 7614464 -> 7606272 | 57.0 -> 75.7 | - -> - |
| dedup-cross-file-mixed-100 | INELIGIBLE | PASS | PASS | - | - | - | - | 79769600 -> 79806464 | 742.1 -> 522.9 | - -> - |
| dedup-cross-file-mixed-500 | INELIGIBLE | PASS | PASS | - | - | - | - | 398168064 -> 398204928 | 2411.4 -> 2230.2 | - -> - |

Ten cases; all completed with functional PASS and proof PASS, as in iteration 1. Every row is INELIGIBLE
(interference declared).

- This family runs Project Init on native trees; requests, writer jobs, statements and overlay sizes do not
  apply and there is no Commit.
- Store logical bytes: equal to the control in the anchor case and the three `identical` cases; the three
  `unique` and three `mixed` cases differ by −8,192 B (both 10 MiB cases), +28,672 B (`unique-100`) and
  +36,864 B (`unique-500`, `mixed-100`, `mixed-500`), at most 0.11% of the case's Store. The cause was not
  examined in phase C; it goes to phase D's list with the same small differences in `init_namespace` and
  `dedup_cdc_locality`.
- exec is the Init command, diagnostic only.

Correction to the `dedup_cdc_locality` section above: its Store sizes are equal to the control in 10 cases
and differ in 10 (−49,152 to +32,768 B); the eleventh entry the comparison counted is
`dedup-cdc-boundaries-proof`, which has no control value. The section's "equal in 9, 11 differ" is wrong.

- Storage after the family: 0 Docker volumes more than before the run
  (0 of them masters of current originals, 0 unexplained),
  0 containers more; originals 1861 MB, result folder
  1080 MB; host 224 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.06GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-67494a503/dedup_cross_file/`.

## Phase C — batch 6, `dedup_workspace_reuse`, tag `b1`, sampled at `a142e9478`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dedup-workspace-exact-1-compact-v2 | FAIL | PASS -> - | PASS -> FAIL | 28 | 250 -> 186 | 1237 -> 981 | 1294336 -> 1298432 | 1376912 | 39.4 -> 51.6 | 19.1 -> 18.2 |
| dedup-workspace-exact-10-compact-v2 | FAIL | PASS -> - | PASS -> FAIL | 154 | 1519 -> 879 | 8167 -> 5607 | 10907648 -> 10911744 | 10953480 -> 10957624 | 63.9 -> 75.0 | 86.6 -> 82.8 |
| dedup-workspace-exact-100 | FAIL | PASS -> - | PASS -> FAIL | 1414 | 15408 -> 9008 | 81076 -> 55476 | 106942464 -> 106946560 | 136209304 -> 136205208 | 246.6 -> 268.1 | 1110.8 -> 670.2 |
| dedup-workspace-exact-500 | FAIL | FAIL -> - | FAIL | 7014 | 78769 -> 46769 | 410013 -> 282013 | 533868544 -> 533876736 | 136242264 -> 136267008 | 888.8 -> 1209.7 | 5194.1 -> 3877.0 |
| dedup-workspace-local-1-compact-v2 | FAIL | PASS -> - | PASS -> FAIL | 28 | 250 -> 186 | 1237 -> 981 | 1294336 -> 1298432 | 1409872 | 50.3 -> 51.4 | 21.7 -> 18.2 |
| dedup-workspace-local-10-compact-v2 | FAIL | PASS -> - | PASS -> FAIL | 154 | 1519 -> 879 | 8167 -> 5607 | 10907648 -> 10911744 | 11200680 -> 11192464 | 68.4 -> 75.4 | 106.1 -> 81.7 |
| dedup-workspace-local-100 | FAIL | PASS -> - | PASS -> FAIL | 1414 | 15408 -> 9008 | 81076 -> 55476 | 106942464 -> 106946560 | 139760744 -> 139913208 | 259.7 -> 267.4 | 1048.6 -> 684.4 |
| dedup-workspace-local-500 | FAIL | FAIL -> - | FAIL | 7014 | 78769 -> 46769 | 410013 -> 282013 | 533868544 -> 533876736 | 151089152 | 1166.8 -> 1290.8 | 5120.9 -> 4063.7 |
| dedup-workspace-unique-1-compact-v2 | FAIL | PASS -> - | PASS -> FAIL | 28 | 250 -> 186 | 1237 -> 981 | 1294336 -> 1298432 | 2485192 | 43.3 -> 55.1 | 18.7 -> 17.8 |
| dedup-workspace-unique-10-compact-v2 | FAIL | PASS -> - | PASS -> FAIL | 154 | 1519 -> 879 | 8167 -> 5607 | 10907648 -> 10911744 | 23273472 -> 23269376 | 67.3 -> 79.4 | 99.7 -> 84.8 |
| dedup-workspace-unique-100 | FAIL | PASS -> - | PASS -> FAIL | 1414 | 15408 -> 9008 | 81076 -> 55476 | 106942464 -> 106946560 | 245587968 -> 245567488 | 280.6 -> 282.7 | 1108.6 -> 819.2 |
| dedup-workspace-unique-500 | FAIL | FAIL -> - | FAIL | 7014 | 78769 -> 46769 | 410013 -> 282013 | 533868544 -> 533876736 | 670679040 -> 670691328 | 1258.1 -> 1232.4 | 16119.2 -> 18053.4 |
| dedup-workspace-unique-1-base128-v3 | FAIL | PASS -> - | PASS -> FAIL | 28 | 250 -> 186 | 1237 -> 981 | 1294336 -> 1298432 | 137519464 -> 137507128 | 46.5 -> 45.2 | 24.2 -> 20.6 |
| dedup-workspace-unique-10-base128-v3 | FAIL | PASS -> - | PASS -> FAIL | 154 | 1519 -> 879 | 8167 -> 5607 | 10907648 -> 10911744 | 148504576 -> 148500480 | 72.1 -> 78.1 | 100.3 -> 86.0 |

Failure texts, as recorded:

- `dedup-workspace-exact-1-compact-v2`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-exact-10-compact-v2`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-exact-100`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-exact-500`: Command '['docker', '--host', 'unix:///Users/yifanxu/.docker/run/docker.sock', 'cp', '9fe255b48dd67604088b63c68b06604dd3a527fcbd442c3c39cdf2c0640663e3:/layerfs-local/overlay/overlay.sqlite', '/Users/yifanxu/Ephemeral-AI-Lab/layerfs-issue316/benchmark-results/fs-bench-pro/2026-10-11-issue318-b1-run-d
- `dedup-workspace-local-1-compact-v2`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-local-10-compact-v2`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-local-100`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-local-500`: Command '['docker', '--host', 'unix:///Users/yifanxu/.docker/run/docker.sock', 'cp', '02884ad4e854eed26e352afc70edde992e97b1b258be9e755e04a2d074686482:/layerfs-local/overlay/overlay.sqlite', '/Users/yifanxu/Ephemeral-AI-Lab/layerfs-issue316/benchmark-results/fs-bench-pro/2026-10-11-issue318-b1-run-d
- `dedup-workspace-unique-1-compact-v2`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-unique-10-compact-v2`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-unique-100`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-unique-500`: Command '['/Users/yifanxu/Ephemeral-AI-Lab/layerfs-issue316/benchmark-results/fs-bench-pro/binary-archive/ba6cf187f8bb3ca168c44e6bcd02462e315ed71575613208af6a3c49eef54400/layerfs-r7-runtime', 'verify-workspace', '--socket', '/Users/yifanxu/.docker/run/docker.sock', '--volume', 'layerfs-fsb-sample-a2
- `dedup-workspace-unique-1-base128-v3`: closed overlay authoritative schema/accounting source pin changed
- `dedup-workspace-unique-10-base128-v3`: closed overlay authoritative schema/accounting source pin changed

Fourteen cases, all FAIL. Iteration 1: 11 PASS, 3 FAIL. Eleven rows are new failures; their cause is a
check in the harness, not a result of the product.

- The 11 cases that passed in iteration 1 (every 1, 10 and 100 MiB case and both `base128` cases) end with
  `closed overlay authoritative schema/accounting source pin changed`. The harness's closed-overlay
  accounting check carries SHA-256 pins of six product files (the overlay's `schema.sql` and
  `accounting.sql`, three overlay source files and the bridge control types) taken at iteration 1's source.
  The merged source has the reference-piece schema, so the pins do not match and the check stops before it
  reads anything. Mount, command, Commit, cleanup (Gone) and custody (KNOWN_STOP) completed in all 11, and
  their counts and sizes are recorded. The check was not changed in phase C; it is the first item this
  family adds to phase D.
- The three 500 MiB cases fail as in iteration 1: `dedup-workspace-exact-500` and `-local-500` when the
  closed overlay export met the end of the check's 41 s work allowance (2.8 s and 2.4 s left), and
  `dedup-workspace-unique-500` when the allowance ended in the final check command. For `unique-500` the
  complete wall is 19,640 ms against the declared 15,000 ms (17,486 ms in the control).
- Requests equal the control in all 14 (28; 154; 1,414; 7,014). Writer jobs are lower by 64, 640, 6,400 and
  32,000 (one a 16 KiB cell written) and statements by 256, 2,560, 25,600 and 128,000 (four a cell).
- Overlay logical bytes: +4,096 B in the 1, 10 and 100 MiB cases, +8,192 B in the 500 MiB cases. Store
  logical bytes: equal in 4 cases, the other 10 differ by −20,480 to +152,464 B (largest:
  `dedup-workspace-local-100`, 139,760,744 -> 139,913,208 B, +0.11%).
- Commit, diagnostic only: 100 MiB cases 1,049–1,111 ms -> 670–819 ms; `exact-500` 5,194 -> 3,877 ms,
  `local-500` 5,121 -> 4,064 ms, `unique-500` 16,119 -> 18,053 ms.
- Storage, decided by agent: a sample of this family keeps `pristine-store.sqlite` and
  `closed-overlay.sqlite` beside its receipt (up to 136 MB and 107 MB). They are whole copies of payload, so
  the driver now removes them with the exported Stores and records each in the sample's cleanup record
  with its manifest digest; the 11 samples taken before the change were cleaned the same way.

- Storage after the family: 3 Docker volumes more than before the run
  (3 of them masters of current originals, 0 unexplained),
  0 containers more; originals 4255 MB, result folder
  1110 MB; host 221 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.21GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-a142e9478/dedup_workspace_reuse/`.

## Phase C — batch 6, `store_footprint`, tag `b1`, sampled at `7230d1133`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| store-footprint-unique-100000 | FAIL | FAIL -> - | FAIL | 12 | 102 -> 95 | 464 -> 443 | 229376 -> 233472 | 516735848 -> 516653928 | 7540.0 -> 7136.1 | 97.6 -> 124.3 |
| store-footprint-metadata-cardinality-100000 | FAIL | FAIL -> - | FAIL | 12 | 102 -> 95 | 464 -> 443 | 229376 -> 233472 | 556090216 -> 556188520 | 14022.9 -> 15191.1 | 176.1 -> 136.4 |
| store-footprint-large-object-500m | FAIL | PASS -> - | PASS -> FAIL | 12 | 287 -> 281 | 1500 -> 1482 | 258048 -> 262144 | 506352584 -> 506344320 | 2438.3 -> 2832.9 | 16.5 -> 16.1 |
| store-footprint-unique-100-low-v1 | FAIL | PASS -> - | PASS -> FAIL | 12 | 102 -> 95 | 464 -> 443 | 229376 -> 233472 | 5411592 -> 5415688 | 87.8 -> 103.1 | 11.3 -> 14.3 |
| store-footprint-metadata-cardinality-100-low-v1 | FAIL | PASS -> - | PASS -> FAIL | 12 | 102 -> 95 | 464 -> 443 | 229376 -> 233472 | 5452504 -> 5452480 | 90.2 -> 103.6 | 9.2 -> 17.8 |
| store-footprint-large-object-10m-low-v1 | FAIL | PASS -> - | PASS -> FAIL | 12 | 152 -> 146 | 771 -> 753 | 237568 -> 241664 | 10474344 -> 10470224 | 104.9 -> 126.0 | 10.7 -> 13.2 |

Failure texts, as recorded:

- `store-footprint-unique-100000`: original frozen verification hard watchdog expired
- `store-footprint-metadata-cardinality-100000`: Command '['/Users/yifanxu/Ephemeral-AI-Lab/layerfs-issue316/benchmark-results/fs-bench-pro/binary-archive/ba6cf187f8bb3ca168c44e6bcd02462e315ed71575613208af6a3c49eef54400/layerfs-r7-runtime', 'verify-footprint', '--socket', '/Users/yifanxu/.docker/run/docker.sock', '--volume', 'layerfs-fsb-sample-32
- `store-footprint-large-object-500m`: closed overlay authoritative schema/accounting source pin changed
- `store-footprint-unique-100-low-v1`: closed overlay authoritative schema/accounting source pin changed
- `store-footprint-metadata-cardinality-100-low-v1`: closed overlay authoritative schema/accounting source pin changed
- `store-footprint-large-object-10m-low-v1`: closed overlay authoritative schema/accounting source pin changed

Six cases, all FAIL. Iteration 1: 4 PASS, 2 FAIL. Four rows are new failures with the cause recorded for
`dedup_workspace_reuse`: a harness check pinned to iteration 1's overlay schema files.

- `store-footprint-large-object-500m` and the three `-low-v1` cases end with `closed overlay authoritative
  schema/accounting source pin changed`. Mount, command, Commit, cleanup (Gone) and custody (KNOWN_STOP)
  completed and their counts and sizes are recorded.
- `store-footprint-unique-100000`: `original frozen verification hard watchdog expired`; the check's work
  took 41,282 ms. Complete wall 14,050 ms against the declared 15,000 ms (15,687 ms in the control, which
  exceeded it).
- `store-footprint-metadata-cardinality-100000`: the typed check command timed out with 30.4 s of the 41 s
  allowance left to it (28.6 s in the control). Complete wall 22,655 ms against the declared 15,000 ms
  (21,638 ms in the control). Both are the control's failures.
- Requests are 12 in all six, as in the control. Writer jobs are lower by 6 or 7 and statements by 18 or
  21. Overlay logical bytes +4,096 B in all six.
- Store logical bytes differ in all six by −81,920 to +98,304 B (largest: `metadata-cardinality-100000`
  556,090,216 -> 556,188,520 B, +0.018%; `unique-100000` 516,735,848 -> 516,653,928 B, −0.016%).
- exec is the import command, diagnostic only (interference declared).
- Storage, decided by agent: a sample of this family keeps `footprint-typed.sqlite` (506 MB for the 500 MiB
  case) among its retained command output. It is a whole copy of the payload, so the driver now removes
  it with the other Store copies and records it in the cleanup record with its manifest digest; the four
  samples taken before the change were cleaned the same way.

- Storage after the family: 0 Docker volumes more than before the run
  (0 of them masters of current originals, 0 unexplained),
  0 containers more; originals 2205 MB, result folder
  1120 MB; host 223 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.06GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-7230d1133/store_footprint/`.

## Phase C — batch 6, `repository_history`, tag `b1`, sampled at `46a0e620c`

Iteration 1's value is left of each arrow, this run's right; one value means
equal. Times are single diagnostic samples.

| case | status | functional | proof | requests | writer jobs | statements | overlay logical B | Store logical B | exec ms | Commit ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| deepseek-full | not sampled | NOT_RUN -> - | NOT_RUN -> - | - | - | - | - | - | - -> - | - -> - |
| deepseek-stride3 | FAIL (no receipt) | FAIL -> - | NOT_RUN -> - | - | - | - | - | - | - -> - | - -> - |
| deepseek-stride10 | FAIL (no receipt) | FAIL -> - | NOT_RUN -> - | - | - | - | - | - | - -> - | - -> - |

Three cases; none produced a receipt. Iteration 1: `deepseek-full` NOT_RUN, the two stride cases FAIL with
proof NOT_RUN.

- Decided by agent: this family declares that a 120 s external wall stop governs every invocation, with no
  timeout increase. The 300 s extreme-case allowance was therefore not used here; each preparation and each
  sample had one call with a 118–119 s stop.
- `deepseek-stride10` (17 checkpoints): prepared in 48.1 s. The sample reached the stop with 16 commands
  and 15 Commits acknowledged (commands 42.8 s, Commits 28.2 s in total; the rest of the wall is the copy
  of each checkpoint into the container and the clone of the 891 MB original before the first command).
  Iteration 1 records all 17 Commits acknowledged before its stop and no final receipt.
- `deepseek-stride3` (53 checkpoints): prepared in 107.9 s. The sample reached the stop with 22 commands
  and 22 Commits acknowledged. Iteration 1's sample failed earlier, in the 15 s copy before any command.
- `deepseek-full` (157 checkpoints): the preparation reached the stop at 119 s with 2,169 MB written and
  no sealed original, as in iteration 1. Not sampled; the partial folder was removed with the others.
- The harness wrote no receipt, status or count for any of the three, so the table has only labels. The
  event record of each stride sample ends with a `failed` line (`Channel(CloseFailed … UnexpectedEof …)` for
  stride10, `Broken pipe` for stride3) written three seconds after the stop: the wall stop ended the harness
  but not its runtime child, and the driver then removed the sample's container under it. That line is an
  effect of the stop and the cleanup, not a result of the product. No leftover process was found.
- Per-Commit time in stride10 grows through the run, 165 ms for the first to 4,374 ms for the fifteenth;
  diagnostic only (interference declared), listed for phase D.

- Storage after the family: 2 Docker volumes more than before the run
  (2 of them masters of current originals, 0 unexplained),
  0 containers more; originals 5611 MB, result folder
  1155 MB; host 220 GiB free; `docker system df`: Images=21.51GB, Containers=12.85GB, Local Volumes=69.07GB, Build Cache=4.843GB.
- CSVs: `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-46a0e620c/repository_history/`.
