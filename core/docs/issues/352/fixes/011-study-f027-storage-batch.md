# Range 011 study · F-027 · Storage batch: sized pack directories, inline mode and mtime, inode-branch deltas

> Opened by the owner's liaison on owner direction, 2026-10-18. The fixer
> completes every row marked *pending*, item by item. Spec:
> [STORAGE_BATCH_SPEC.md](../STORAGE_BATCH_SPEC.md); evidence:
> [STORAGE_STUDY.md](../STORAGE_STUDY.md) §2 and §6,
> `~/lfs-history/evidence/storage-study-20261018/` (B, D).

| | |
| --- | --- |
| Trigger | Owner direction from STORAGE_STUDY (not a tripped gate): about a third of the range-11 Store is overhead. Items 1–3 approved and batched before P3 (RESULTS.md `98005f379`, `70afdb17b`; owner approval of item 2 in STORAGE_STUDY §6) |
| Playbook step | D5 (storage per Commit by role) |
| Kind | 1 forward-only (REBUILD.md) for all three; item 2 changes the Content grammar for rewritten rows, readers accept both |
| Old Stores | open unchanged |
| Old data | still read as before (old pack versions, root-form attributes, full branches) |
| Compatibility test | *pending*, per item: the newest P2 snapshot written by the old daemon reads with the new one and passes `compat.mjs`, then a Commit on it mixes forms and still passes |
| Binaries | *pending*, one daemon id per item (base: the daemon after F-020 and F-025) |
| Commits | *pending*, one per item, each with its production LOC line |
| Regression tests | *pending*, per STORAGE_BATCH_SPEC §3–§5 |
| Recovery | fork the newest good snapshot onto each new daemon; no rebuild; one P3 re-baseline after item 3 (the lead's call) |
| Order | item 1 → item 2 → item 3, each proved, measured and merged before the next |

## Old design

1. **Pack directories:** written pack versions reserve 16 directory slots
   (280 B ordinary/chunk, 88 B whole-file); each pack holds one group, so the
   reservation is stored zeros: 4.98 MB, 14.5% at r011
   (`layerfs-storage/src/pack/layout.rs`).
2. **Attributes:** mode and mtime (16 B) stored as a Chunk, ExtentLeaf and
   FileState under an AttributeLeaf, plus their own chunk pack, referenced by
   a 32 B attribute root (`layerfs-content/src/filesystem/attributes/`); 8,015
   of 8,271 "chunks" at r011 are mtimes; ~16.5–19% of the Store.
3. **Inode branches:** stored whole on every Commit
   (`encoding/delta/select.rs` ~327–345); ~0.53 B per live inode per Commit, a
   full child branch per Commit once the table has two levels (P3).

## New design

1. Pack versions with the directory sized to the group count at seal.
2. An inline inode-value form carrying the portable attributes; row-level
   form; semantic equality where forms meet; readers accept both.
3. Inode branches take the copy/insert delta that inode leaves use, within the
   chain cap of 8 and the per-chain budget, decoded once per call.

Details, invariants and proofs: STORAGE_BATCH_SPEC.md §3–§6.

## Proof

*pending*, per item: the item's tests (spec §3–§5), the boundary and merge
proofs for item 2, the synthetic P3 check for item 3, and the no-sacrifice
probes (spec §6: checkpoints, deduplication, compression, localized edit,
delta use, defect signatures); each with command, duration and result.

## Performance and storage, old vs new

Same snapshot forks, same cache state, one sample per case; columns labeled
with binaries. *pending*.

| Measure | Snapshot | Cache | Old | Item 1 | Item 2 | Item 3 | Simulated |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Store on disk (MiB) at r011-equivalent | | | 32.8 | | | | 27.9 / 22.5 / 19.2 |
| Bytes per small Commit (KB) | | | ~5.1 | | | | — / — / ~3.0 |
| Packs per Commit | | | 2.9 | | | | — / ~2 / ~2 |
| Objects per Commit | | | ~9.4 | | | | — / ~5 / ~5 |
| InodeBranch bytes per Commit, synthetic P3 fork (KB) | | | | | | | — / — / 0.1–0.3 |
| `fs.write` p50 / p95 | | | | | | | |
| `fs.read`, `fs.stat`, `fs.list` p50 / p95 | | | | | | | |
| `branch.merge`, `diff_commits` p50 / p95 | | | | | | | |
| `sandbox.mount`, one-shot Commit p50 / p95 | | | | | | | |
| FUSE getattr/lookup per exec | | | | | | | |
| Whole-file delta hit rate | | | 0.87–0.93 | | | | |
| Localized edit, 1 MiB vs 16 MiB file (stored bytes, statements) | | | | | | | equal |

## Cost of the fix

*pending*: for example the one-time full rewrite of a leaf when it first
changes form (item 2), branch chain decodes per lookup (item 3), two inode
forms to support forever (item 2).

## Left open

- Item 4 (shared metadata dictionary) and the other sub-10% items are out of
  this batch (spec §10).
