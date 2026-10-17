# F-005 (range 004, dev run) · changed chunks get the old chunk they overlap as delta base

| | |
| --- | --- |
| Trigger | BUGS.md F-005: range 4's chunk depth histogram is [0: 906], and [0: 2,419] since Init. Every chunk object is stored FULL. Not a gate trip, so there is no measured attempt and no `finding-NNN.aK.json` |
| Kind | 1 forward-only (REBUILD.md): new chunks carry a different advisory base, and Storage's existing PREFIX records store them. Chunk identities, mapping trees and the Store format are unchanged |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before. Old FULL chunks are read as FULL. New PREFIX chunks use the record kind Storage already reads |
| Compatibility test | **passed** with the batch's final daemon `71001f65`: range-4 fork written by `511dceed`, whole-tree proof checkpoint ok (530 files) (REBUILD.md §4; run recorded in [the F-011 record](002-a1-f011-binding-hint-migration.md#compatibility)) |
| Playbook step | D5 (wiring defect: the selector only uses a base its caller offers) |
| Fix kind (SPEC §6) | code path in Content's localized edit route |
| Binaries | old daemon `ed66aa0d…` (F-001; chunk path identical to `511dceed`) → new daemon `cbfa5e7f908b3e870167192fe7ea77d1b154a1ce3cd4aba5bbfb760ee676b051`, kept in `core/target/issue352/daemon-cbfa5e7f/`. SDK addon unchanged: `3da0f665…` |
| Commits | the commit that adds this file. Regression test: `core/crates/layerfs-daemon/tests/sdk_chunk_deltas.rs` |
| Recovery | fork the newest snapshot. Chunks stored FULL before the fix stay FULL; only new chunks change |

## Old design

`replace_chunked` (`layerfs-content/src/file/edit/apply.rs:363-477` at `b8d3d4646`):

1. Split the stored mapping at each edit into left, removed and right.
2. Scan only the replacement into new chunks.
3. Concatenate the three parts.

Every new chunk of the scan was offered the same base: the rightmost payload of
`left`, the old chunk just before the edit (`rightmost_payload`, line 479).

The overlay hands an `fs.write` or a Workspace Commit its changed byte ranges
in 65,519-byte pieces. So a 100-byte insert at offset 1,000 becomes one edit
that replaces `[0, 1 MiB)` with shifted bytes. Content-defined chunking
resynchronises after a few chunks, and those later chunks match stored ones.
The chunks that really changed were still offered either nothing (no `left`) or
an old chunk at another position.

Storage's chunk selector considers only the first offered base
(`layerfs-storage/src/encoding/delta/select.rs:383-390`). The result was FULL,
or a trial that lost.

## New design

New `layerfs-content/src/file/mapping/align.rs` defines `Aligner`, which
relates old and new byte ranges. It walks the base mapping forward once and
holds at most 128 old extents and one mapping page at a time.

- **Anchors.** Each edit's start is an anchor: new position `start` follows the
  same bytes as old position `start − (net growth of earlier edits)`. Any new
  chunk whose id equals an old payload re-anchors the alignment at that old
  chunk, and gets no hint because it is already stored.
- **Overlap.** Each other new chunk is offered the old payload that shares the
  most bytes with its range, measured through the current alignment.
- **Neighbour fallback.** When no old payload overlaps, the chunk is offered
  the successor of the nearest unchanged neighbour, or the neighbour itself at
  the end of the file.
- **Repeated zero runs** take the same hint. The overlap is measured over the
  run's first chunk only, so a long hole never walks the base it spans.

The aligner reads mapping pages through the edit operation's page memo
(`Engine::read_page`). A page the split already read is not read again: the
pinned page counts dropped (`edit_localized` 6 → 5, `edit_reference` 20 → 18),
because the `rightmost_payload` walk is gone.

The scan shares the engine between the sink and the hint through `SharedSink`,
a `RefCell` borrow per call. The hint is added in these places:

- `ExtentBuilder::push_chunk_hinted` and `push_repeated_chunk_hinted`.
- `chunk_runs::Hint`.
- `construct_runs` and `stream_combined` keep `no_hint`.

Hints carry the `ReusedRange` provenance. A hint is advisory and changes no
identity: edited roots are byte-equal to before (`edit_reference` root pin).

`layerfs-daemon/src/sdk/mutation.rs`: an inline `fs.write` body is written one
record-sized piece at a time (`put`). The host test's 1 MiB inline write was
refused `Invalid` as a single `Operation::Write`. Equal pieces are skipped as
before.

## Proof

`sdk_chunk_deltas.rs` (host, 0.2 s) uses a 1 MiB pseudo-random file on its own
Branch per case, then rewrites it through `fs.write`:

1. An append that resembles the file's end.
2. A 100-byte insert at offset 1,000.
3. A 50-byte overwrite at 512 KiB.

Each case asserts that the change stored at least one chunk delta, at most one
FULL chunk (every `fs.write` Commit stores one 12-byte chunk outside the file),
and fewer than 8 KiB.

| Case | Old (HEAD + inline pieces): FULL / delta / stored bytes | New |
| --- | --- | --- |
| append 3,000 B | 1 / 1 / 3,108 | 1 / 1 / 3,108 |
| insert 100 B at 1,000 | 4 / 0 / 36,605 | 1 / 3 / 3,517 |
| overwrite 50 B at 512 KiB | 2 / 1 / 25,230 | 1 / 2 / 4,367 |

Old code fails the insert case: no changed chunk is a delta. The append already
passed, because the old base of an end-of-file edit was the last old chunk.

Other checks:

- `layerfs-content`: all targets pass, with the three updated pins (overwrite
  nodes 6 → 5, interior join 20 → 18, sparse-insert provenance
  `UnchangedPrefix` → `ReusedRange`).
- `layerfs-storage`: all pass.
- `layerfs-daemon` host: all pass except two that need prepared inputs or a
  Linux binary (`complete_installed_roots`, `install_docker`), which fail the
  same way before the change.
- Clippy `-D warnings` is clean on `layerfs-content` and `layerfs-daemon`.

## Performance and storage, old vs new

Setup: fork of `p1-pilot-b`'s range-4 snapshot, written by `511dceed`. Each
binary ran on its own fresh fork; the first try shared one fork, and its second
binary deduplicated every chunk. One sample per case. The base write is a
1 MiB new file, then the rewrite. Rows are the rewrite's Commit (daemon trace).
Old is `ed66aa0d`, new is `cbfa5e7f`.

| Case | Chunk depths old → new | PREFIX chosen / trials | Stored bytes | Canonical bytes | `fs.write` ms | SQL statements |
| --- | --- | --- | --- | --- | --- | --- |
| append | [1, 1] → [1, 1] | 1/1 → 1/1 | 3,528 → 3,528 | 11,457 → 11,457 | 30.4 → 28.7 | 530 → 530 |
| insert | [4] → [1, 3] | 0/0 (1 absent, 1 ineligible) → 3/3 | 37,029 → 3,941 (−89%) | 42,056 → 42,056 | 19.8 → 20.7 | 332 → 332 |
| overwrite | [2, 1] → [1, 2] | 1/2 (1 lost) → 2/2 | 25,649 → 4,785 (−81%) | 31,602 → 31,602 | 19.0 → 27.0 | 750 → 753 |

Delta share of the file's changed chunks (one FULL per Commit is the
non-file chunk):

| Case | Old | New |
| --- | --- | --- |
| append | 1/1 | 1/1 |
| insert | 0/3 | 3/3 |
| overwrite | 1/2 | 2/2 |

The 1 MiB base writes are unchanged: 54, 59 and 56 FULL. A new file has no base.

Speed is unchanged within one sample's noise. The overwrite case is +8 ms with
the same statements (+3) and the same trial count, so the cost is two delta
encodings instead of one encoding and one loss. A PREFIX chunk read decodes
against its base. The depth cap of 8 still bounds a chain.

## Cost of the fix

- Mapping pages for the walk, served from the edit's page memo.
- At most 128 old extents (48 bytes each) in memory.
- One base acquisition per hinted chunk at save. That is Storage's existing
  trial; the old code already paid it whenever it offered a base.
- Chunk chains now exist: re-read the SPEC §8 delta-depth decision.

## Compatibility

REBUILD.md §4: the batch's final daemon `71001f65` (after F-011) opened a
range-4 snapshot fork written by `511dceed` and passed the full proof
checkpoint: 285 changed paths, 283 blob ids and the whole tree of 530 files
matched git. The run is recorded in [the F-011 record](002-a1-f011-binding-hint-migration.md#compatibility).

## Left open

- Files built by `construct_runs` get no base: new files, and paths replaced
  through a new inode (rename into place). Offering the replaced path's old
  version there needs the captured base path lookup. That is a separate change.
- `stream_combined` (a whole-file base edited into a chunked file) still offers
  none. That is the deferred cross-role pair.
