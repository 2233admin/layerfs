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
