# Pack directories sized to their groups (F-027 item 1)

| | |
| --- | --- |
| Trigger | OPTIMIZATIONS.md F-027, binding spec [STORAGE_BATCH_SPEC.md](../STORAGE_BATCH_SPEC.md) §3 item 1. The tight versions (18, 19, 20) reserve 16 directory slots; every Save seals its packs whole, so the unused slots are stored zeros |
| Playbook step | storage batch item 1 (owner-approved 2026-10-18) |
| Kind | 1 forward-only (REBUILD.md): new pack versions are written; every older version stays readable |
| Old Stores | read unchanged; old packs keep their reserved slots (not rewritten) |
| Old data | not migrated |
| Compatibility test | `compat.mjs` range 14 with daemon `20b7fde1` on a fork of `p2-main-f` range 14 (written by `57141b57`): ok, 380 git paths, 366 ids, 1,261 files. Mixed Store: the new arm's range-14 play Commits sized packs into a Store of tight packs; its proof checkpoint is ok |
| Binaries | daemon `128a959c` → `20b7fde1fae737296810decd6f9e8e9b177a7edc0b56ca4d79052b66373377c5` (`core/target/issue352/daemon-20b7fde1/`); addon `74d08425` → `c41ae8c5` (`core/target/issue352/sdk-linux-c41ae8c5/`); both from `925567e59`, 51.5 s warm |
| Commits | `925567e59` on branch `dsh-352-f027-item1` |
| Regression test | `layerfs-storage/tests/physical_formats.rs` `written_packs_size_their_directory_to_their_groups`, plus the sized versions in the offset and recognition matrices; `layerfs-persistence/tests/sqlite_pack_selection.rs` expects the sized body offset |
| Recovery | none needed: readers dispatch on the version |

## Invariant checked first

No path appends a group to a pack after seal. Packs are assembled whole in
`save/seal.rs` `place` (`assemble_consuming`) and inserted whole into `pack`
(an `UPDATE` trigger refuses changes); locators are
`(pack, group, record)` with no byte offset. So no path keeps writing a tight
version.

## Change

`layerfs-storage/src/pack/layout.rs` and `assemble.rs`:

- New versions 23 (whole-file), 24 (ordinary) and 25 (chunk), written by
  `PackLane::version()`. 21 and 22 belonged to the retired pooled value-group
  lane and stay refused, so the spec's example numbers were not reused.
  Singleton keeps 16 (one slot, no waste).
- The directory is `group_count` entries: `sized_body_offset(lane, n) =
  24 + entry_len × n`. `assembled_length`, `assemble`, `assemble_consuming`
  and `write_control_and_directory` use it.
- `parse_control_header` takes the sized versions with a count limit of 16 and
  the body offset from the header's group count. All older versions keep
  their own offsets.
- Placement stays conservative at the reserved width: `append_fits`, the seal
  queue budget, the `encoding/full.rs` contribution and
  `WHOLE_FILE_GROUP_BODY_LIMIT`. A sized pack is never longer, so every fit
  decision stays safe; pack boundaries are unchanged (both arms wrote the
  same 3,452 packs). Persistence (`unit_layout.rs`, `units_read.rs`) reads
  through `parse_header` and needed no change.

## Proof

- `physical_formats`: every lane but singleton writes its sized version; with
  1, 2 and 16 groups the body offset is `24 + entry × n`, the pack is exactly
  offset plus body (zero reserved bytes), each group view starts after its
  predecessor and the views end at the pack's end, and the consuming assembly
  is byte-identical. Old and sized versions parse at their own offsets; 17
  groups is refused for tight and sized versions; 21 and 22 stay refused.
- Sealed-file count (`core/target/f027/reserved.py`, per version from the pack
  headers): the new arm's 3,452 range-14 packs are all versions 23–25 with
  0 reserved bytes.
- Revert check: with the old writer (tight versions, reserved region) the new
  `physical_formats` test and `sqlite_pack_selection` (280 vs 40) fail.
- Suites (host, `+1.85.1`): layerfs-storage 13.6 s, layerfs-persistence
  12.9 s, layerfs-store-service 75.3 s, layerfs-project 27.9 s,
  layerfs-workspace 26.3 s, layerfs-history 10.1 s: all pass.
  layerfs-daemon 55.5 s: all pass except the two env-gated tests already
  accepted as a test-design item (`huge_kernel` needs `LAYERFS_Q1_PREPARED`,
  `macos_init_handoff` needs `LAYERFS_INSTALL_DAEMON_BINARY`). Clippy clean on
  storage and persistence. No test deleted.
- Non-sacrifice (§6): dedup, compression, delta and localized-edit paths are
  untouched (only the directory width changes); the checkpoint after the
  played range is ok on the new daemon.

## Performance, old vs new

Both arms forked from the **`p2-main-e` range-13 snapshot** (the Store
`p2-main-f` started from) and played range 14 once, measured. Old: daemon
`128a959c`, addon `74d08425`. New: daemon `20b7fde1`, addon `c41ae8c5`.
Quiet window from 07:04Z. Host 1-min load at the start of each play: old
13.23 (07:06:48Z), new 13.57 (07:07:14Z). Both checkpoints ok.

### Storage

| Measure | Old | New | Change |
| --- | --- | --- | --- |
| Store file before the range | 42,627,072 | 42,627,072 | |
| Store file after the range | 48,685,056 | 47,431,680 | −2.6% |
| Store file growth over range 14 | 6,057,984 | 4,804,608 | **−20.7%** (−1,253,376 B) |
| New packs | 3,452 | 3,452 | |
| New pack bytes | 3,348,895 | 2,719,050 | −18.8% |
| Reserved directory bytes in new packs | 632,640 | 0 | |

The file shrinks by more than the reserved bytes because smaller pack rows
fill fewer overflow pages. **Remaining gap:** old packs are not rewritten.
At range 14 they still hold 5,650,708 reserved bytes, 11.6% of the 48.7 MB
Store; only a fresh history (or a rewrite, not in scope) recovers it.

### Speed (ms; statements p50)

| Method | n | p50 old → new | p95 old → new | p50 ratio | p95 ratio | statements p50 |
| --- | --- | --- | --- | --- | --- | --- |
| fs.write | 982 | 17.9 → 17.53 | 38.01 → 37.52 | 0.98 | 0.99 | 1421 → 1343 |
| sandbox.commit | 144 | 12.19 → 11.29 | 35.15 → 31.14 | 0.93 | 0.89 | 173 → 185 |
| fs.apply | 94 | 18.87 → 16.08 | 40.42 → 34.95 | 0.85 | 0.86 | 1126 → 1227 |
| fs.rm | 36 | 27.22 → 23.82 | 48.98 → 51.81 | 0.88 | 1.06 | 2136 → 1442 |
| fs.read | 87 | 2.92 → 3.14 | 6.65 → 7.6 | 1.08 | 1.14 | 240 → 234 |
| fs.stat | 89 | 2.34 → 2.46 | 5.56 → 5.72 | 1.05 | 1.03 | 172 → 190 |
| fs.list | 98 | 3.41 → 3.17 | 7.93 → 9.02 | 0.93 | 1.14 | 240 → 243 |
| fs.grep | 97 | 8.71 → 8.53 | 447.79 → 452.27 | 0.98 | 1.01 | 646 → 647 |
| fs.glob | 90 | 4.79 → 4.83 | 43.4 → 46.95 | 1.01 | 1.08 | 348 → 391 |
| fs.diff_files | 88 | 4.45 → 5.12 | 8.54 → 13.94 | 1.15 | 1.63 | 358 → 421 |
| branch.merge | 9 | 9.8 → 9.84 | 342.24 → 346 | 1.00 | 1.01 | 254 → 254 |
| branch.diff_commits | 7 | 1.42 → 1.39 | 42.29 → 42.95 | 0.98 | 1.02 | 75 → 75 |
| sandbox.mount | 152 | 12.04 → 12.14 | 24.21 → 27.89 | 1.01 | 1.15 | 57 → 57 |
| sandbox.unmount | 152 | 8.46 → 8.7 | 13.67 → 12.75 | 1.03 | 0.93 | 0 → 0 |
| sandbox.exec | 292 | 42.01 → 41.49 | 95.56 → 96.35 | 0.99 | 1.01 | 0 → 0 |

Produced by `core/target/f027/speed-table.mjs` over the two
`range-014.a1.jsonl` traces.

**Watch, not regression (lead, under the owner's time-gate method):** the key
operations fs.read, fs.list and sandbox.mount trip p95 > 1.1× (1.14, 1.14,
1.15). Each is a one-sample, time-only trip at load ~13 with flat counters
and equal statement p50s (240 → 234, 240 → 243, 57 → 57); the change only
shortens the prefix a reader parses. Not resampled; rechecked at the item-11
P3 baseline with 5 samples. fs.diff_files (not a key operation) moved with
its statement count (358 → 421), which differs with the run's merge
interleaving, as fs.rm's does in the other direction.

## Left open

- Old packs keep their reservation (11.6% of the Store at range 14).
- The three p95 watches above, rechecked at the item-11 P3 baseline.
