# #364 hot spot 1 · `branch.merge` of lanes with `node_modules`

> **Status:** Current fix record, 2026-10-19. Branch `issue364-item1`, on
> origin/main `9622faee50` (first measured on `issue364-hotspots` off `654b1ffc6a`). Code paths only; the Store format is unchanged.

| | |
| --- | --- |
| Trigger | Range 15 a4 ([BASELINE_R15.md](../BASELINE_R15.md) §2, §7; issue #364 item 1). `branch.merge` with a new Commit: 1,897 ms p50 (3.73× base, n = 2), 106,913 statements, 8,767,630 VM steps, 13,332 full-scan steps per call |
| Playbook step | D1 (SQL work per call), then a CPU profile of the recorded merge |
| Kind | code path. No schema, table or format change |
| Old Stores | open unchanged |
| Binaries | measured with the `replay_merges` test binary, release, built in the pinned build image `378b799ef433`: old from `654b1ffc6a`, new from this branch. Daemon and addon unchanged in this step |
| Regression tests | `layerfs-persistence/tests/merge_records.rs` (`key_windows_read_the_primary_key_without_a_scan`, `a_merge_past_the_resident_bound_answers_as_a_resident_one`, adapted resident cases), `layerfs-storage/tests/save_resolved_reads.rs` (both cases), `layerfs-storage/tests/logical_size_lengths.rs` (adapted) |
| Production LOC | 103,058 → 103,127 (delta +69), `tools/production_loc.py --root`, first parent vs committed tree |

## How it was found

The recorded merge was replayed on a byte copy of the range-15 snapshot
(`~/lfs-history/snapshots/range-015.p3-main-d.json`, rebuilt from its blocks,
sha256 checked) with `layerfs-api/tests/replay_merges.rs`, which forks each
recorded merge's two parents and merges them again. It now takes
`LAYERFS_355_REPLAY_ONLY` (Commit id prefixes) and prints `REPLAY_WORK` (ms and
the writer's SQL counters) per merge. The old build reproduced the trace
exactly: 106,809 writer statements, 13,332 full-scan steps, 31,029 sorts, and
the recorded root.

A diagnostic build (per-statement counters, object read counts; not
committed) and a host CPU profile (`sample`) split the call:

| Where | Share | Cause |
| --- | --- | --- |
| Merge records (`merge_record` rows) | 88,000 of 106,809 statements | 45,469 upserts, 28,084 one-key reads (each with a sort), 2,792 window reads, 11,482 deletes: the merge's private working state, written to and read back from the Store file |
| Object reads | ~45% of CPU | 48,897 object resolves of only 2,444 distinct objects: each re-walked the delta chain, decompressed and re-hashed (BLAKE3) |
| Logical size | ~18% of CPU | `logical_size_after` opened every changed file's root (`FileView::open`), where a Commit already asks the catalogue for lengths |
| Full-scan steps | 13,332 (265 calls) | `KEYS_AFTER`/`KEYS_EXCLUDING` materialized a ≤64-key subquery, then scanned and sorted it (`EXPLAIN QUERY PLAN`: `MATERIALIZE r`, `SCAN r LEFT-JOIN`). Not a table walk, but every call paid a scan and a sort |

## Changes

1. **Key windows read the primary key.** `merge_records.rs`: the owner row
   joins `merge_record` on `(operation, kind, key)` with `ORDER BY r.key LIMIT
   64`. Plan: `SEARCH o USING INTEGER PRIMARY KEY`, `SEARCH r USING PRIMARY KEY
   (operation=? AND kind=? AND key>?)`; no materialization, no sort. Same
   answers: no owner gives no row, no keys give one NULL row.
2. **A merge's records stay resident up to `RESIDENT_BYTES` (8 MiB).** The
   same bound the merge's own held spill already has (#355 `HELD_BYTES`).
   While under it every record is in memory and none in the file. Reads,
   guards and key windows run no statement, and a deletion just drops the
   record. Past the bound, all records go to the file in one write
   transaction and the old buffered design takes over. The owner row, the
   lease refresh and `end` are unchanged. A resident merge whose owner was
   swept keeps its records, but cannot flush or end (`Missing`), as before.
   Range 15's largest merge peaked at 2.5 MB of live records.
3. **A Save keeps what it resolved** (`layerfs-storage/src/save/resolved.rs`,
   bound `SAVE_RESOLVED_CACHE_BYTES` = 4 MiB, least recently read released
   first). An object's identity is the hash of its bytes, and a kept value was
   authenticated when first resolved, so a hit returns exactly what a new
   resolve would. Pending objects are still answered from the batch first. One
   cache per open Save, dropped with it.
4. **The merge counts logical size from catalogue lengths**
   (`layerfs-store-service/src/history/branch.rs`), as a Commit does
   (`logical_size_after_with` + `Reader::file_lengths`). The per-file payload
   route `logical_size_after` had no other caller and is removed.

Not changed: the merge's decisions and its last-writer-wins rule. F-057
(newest-wins over pnpm state) is a separate product question.

## Proof

- `key_windows_read_the_primary_key_without_a_scan`: windows over records in
  the file take 0 full-scan steps and 0 sorts. On the old statements it fails
  (98 full-scan steps).
- `records_are_private_guarded_and_removed`: a resident merge's reads, guards
  and windows run no statement and leave no row in the file. Its work is 0
  reads and 2 writes (owner, end). Past `RESIDENT_BYTES` every record is in
  the file, then the buffer flushes as before.
- `open_sweeps_only_idle_owners`: a swept owner's file records are gone and
  its reads fail. A swept resident merge cannot end.
- `a_save_reads_an_object_it_resolved_without_acquiring_its_pack_again`: 3 MiB
  of objects read twice in one Save. The second pass acquires 0 packs; without
  the cache it acquires 28, the same as the first pass.
- **Past the 8 MiB bound a merge falls back to the backed rows, and nothing
  caps its size.** `a_merge_past_the_resident_bound_answers_as_a_resident_one`
  pushes one merge past `RESIDENT_BYTES`, so every later call reads and writes
  `merge_record` rows, and keeps a second merge resident. Both then run the
  same 3,000 mixed calls: puts, guarded replacements and deletions, refused
  guards, value reads, membership and both key windows. Every answer is equal,
  and so are the final records read as whole windows. The backed merge used
  the file (reads and flushes > 0); the resident one read no row. A merge
  reaches its records only through this interface (`IndexedEditBacking`), so
  equal answers give an equal merge.
- **The 4 MiB Save cache releases, never refuses.**
  `past_its_bound_the_resolved_cache_releases_the_least_recently_read`: 12 MiB
  (three times the bound) read twice in order in one Save. Every read returns
  the object's bytes; the second pass acquires packs again, because each
  object was released before its next read.
- `logical_size_lengths`: catalogue lengths equal the after tree counted from
  its file roots, for every file representation.
- **Recorded merges:** all 42 `branch.merge` Commits in the range-15 Store
  (ranges 5–15, probes included) were merged again by the old and the new
  build. All 42 were Merged with byte-identical results on both, on Linux and
  on the host. 20 equal the recorded root; the others took fresh serials, whose
  allocator has moved since (expected, see the test's header).

Checks at the rebased identity (on origin/main `9622faee50`): Linux, pinned
build image, the 155 test binaries of `layerfs-content`, `layerfs-storage`,
`layerfs-persistence`, `layerfs-store-service` and `layerfs-api` pass, each
from its crate directory under a 110 s timeout, built with `-j 2` while
`~/lfs-history/QUIET` existed; Clippy `--all-targets -D warnings` on the same
five crates is clean on Linux. Host: the same packages' test binaries passed
before the rebase (160), and the two new tests pass on the host.

Runner setup, not product failures: on the host, three test binaries failed
at the first attempt because of how they were started, and passed once
started as the test runner does. They were run once more, not retried for a
pass. `sandbox_operations` and `serverless_store`: `path must be shorter than
SUN_LEN` (the session's long TMPDIR made a Unix socket path too long;
rerun with `TMPDIR=/tmp/l364`). `filesystem_attributes`: `sealed attribute
fixture: NotFound` (started outside its crate directory, so its relative
fixture path did not resolve; rerun from the crate directory).

## Performance, old vs new

Linux, pinned build image, one sample per arm, each on its own fresh copy of
the range-15 snapshot (the test copies it before opening). Cold process per
arm. Host 1-minute load 15.0 (old) and 14.4 (new), from other sessions; ranges
16–20 were playing.

| Merge (recorded Commit) | Arm | ms | Statements | VM steps | Full-scan steps | Sorts |
| --- | --- | --- | --- | --- | --- | --- |
| r015-main-1 + r015-2-docs-rfc (`12cfeb22`) | old | 2,056.5 | 106,809 | 8,582,928 | 13,332 | 31,029 |
| | new | **436.0** | **9,957** | **623,665** | **0** | **0** |
| r015-main-2 + r015-3-packages-core (`12b59d55`) | old | 2,982.2 | 131,058 | 11,231,495 | 18,322 | 35,048 |
| | new | **492.5** | **10,533** | **714,483** | **0** | **0** |
| All 42 recorded merges (sum) | old | 6,484 | 299,614 | 23,208,603 | 38,626 | — |
| | new | 1,581 | 38,424 | 2,371,776 | 0 | — |
| 18 small merges (< 1,000 statements), median | old | 6.65 | 186.5 | — | — | — |
| | new | 4.45 | 155.5 | — | — | — |

The first row is range 15's 1,897 ms call (trace: 106,892 writer statements,
13,332 full-scan steps). The p50 of the two new-Commit merges goes from
2,056 to 436 ms (4.7×). Old and new receipts are kept in this session's
scratch (`linux-hs1-{old,new}.txt`, `linux-hs1-all-{old,new}.txt`).

Storage: no change to what a merge writes (identical merged roots). Memory:
up to 8 MiB of records per running merge and 4 MiB of resolved objects per
open Save, both bounded and released with their operation.

## What is left in the merge

About 0.45 s per node_modules merge, spread over the content engine: name
batches and directory lookups in the decide pass (~40%), the update's build
(~20%), the logical-size diff walk and length reads (~20%), and recording new
binding hints (~10%). None of it is a scan or a per-entry SQL round trip.
