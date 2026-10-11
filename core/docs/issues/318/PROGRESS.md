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
