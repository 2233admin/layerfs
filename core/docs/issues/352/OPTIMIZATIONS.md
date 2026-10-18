# #352 — Optimizations

> **Status:** Current, kept by the lead and the fixer. One entry per optimize
> finding: playbook step, the counter with its exponent before and after, the fix
> commit, and the old-vs-new probe table on the same snapshots.

| Range.attempt | Step | Counter: exponent before → after | Fix commit | Record |
| --- | --- | --- | --- | --- |
| 002.a1 | D4 | `fork.returned_rows` 0.622 → 0 (gate 0.768) | `e65ce83f0` | [Branch lookup read every Branch](fixes/002-a1-fork-branch-count.md) |
| 002.a1 | D5 | `merge.statements` 0.698 → 0.008 (gate 0.737) | `3f127ee3e` | [Merge base and ancestry walked the whole history](fixes/002-a1-merge-ancestry.md) |
| 002.a1 | D2 | `grep_tree` statements per tree byte −0.003 → −0.047 (gate raw depth 0.73) | `92e94d2ef`, gate `025a3676e` | [Grep re-read each root; gate fit per tree byte](fixes/002-a1-grep-tree-chain-reads.md) |
| 002.a1 | D3 | `diff_commits.vm_steps` 0.592 → 0.079, statements 0.475 → 0.070 (F-003, not a gate trip) | `49499abac` | [diff_commits walked both whole trees; Store format `binding_hint`](fixes/002-a1-diff-commits-change-walk.md) |
| 002.a1 | D4 | `fs.stat` rows 1 → 600 projects: 10 → 621 before, 10 → 10 after (test; replay has one project) | `bcb52a1f4` | [Project lookup paged through every stack](fixes/002-a1-project-lookup.md) |
| 007.a1 | D1 | `list_small` depth exponent 1.67, statements 3.252: no product change. The cost cycles with the metadata delta cap (blobs 60 → 228, +24 per Commit, reset every 8; 20-Commit series). The gate attribution is F-016 (builder) | — | [list_small is bounded and periodic](fixes/007-a1-list-small-chain-period.md) |
| 007.a1 | D6 | F-017, range-8 play on the range-7 fork, old → new addon: `fs.read` p50 25.0 → 6.6 ms, `fs.grep` 32.2 → 12.4, `sandbox.commit` 14.4 → 13.4; client connection wait p95 0 ms. Cost: p95 `fs.read` 43 → 93, `sandbox.commit` 93 → 133 (Commit `begin` p95 26 → 69) | this commit | [Concurrent SDK calls take separate control connections](fixes/007-a1-f017-control-connections.md) |
| 007.a1 | D6 | F-018, range-8 play on the range-7 fork, daemon `361bb09e` → `c25119ac` (addon `5baa0f5d`): `fs.read` p95 96.1 → 9.7 ms, `fs.stat` 46.6 → 7.1, `fs.grep` 100.1 → 63.6, all reads 90.4 → 24.9. Cost: span 14.8 → 17.1 s, in-lane merges 132 → 193 | this commit | [Reads stop queueing behind the publication lane](fixes/007-a1-f018-reads-behind-publication-lane.md) |
| 009.a1 | D4 | `oneshot_mount_exec.vm_steps` 0.971 → 0 (`p2-main-b` r7/r9 forks: 1,923/2,331 → 1,140/1,140 VM steps); a mount looked its Branch up by listing every Branch | this commit | [A mount finds its Branch by name](fixes/009-a1-mount-branch-lookup.md) |
| 011.a1 | D3 | `list_largest.statements` per entry 16.6 → 6.2 (r9) and 24.3 → 7.2 (r11) on `p2-main-c` forks; each listed entry re-read the inode table's upper levels. Residual +16% per entry r9 → r11 is the leaves' chain position (F-016 effect, bounded) | this commit | [A listing looks its entries up together](fixes/011-a1-list-entry-lookups.md) |

## Watch

- **Chain position residue (007.a1).** A 2 KiB `fs.read` alone on a fork costs
  2.6 ms at range 5 and 3.8 ms at range 7, following the file's metadata delta
  chain position, bounded by the cap of 8. This is input to the delta-depth
  re-read at milestone 50; no change before it.
- **In-daemon p95 tail after F-017 (007.a1).** Attributed and fixed as F-018:
  reads waited for a Commit's held publication lane.
- **Merges inside the publication lane (007.a1, F-017/F-018).** Concurrent
  Commits find moved heads and merge inside the single writer's lane: 53 →
  132 → 193 merges and 1.6 → 4.4 → 7.3 s per range-8 play. Span 15.7 → 14.8 →
  17.1 s. Moving merge work out of the lane is a design question for the
  lead. Judge span and merges per range on the rerun.
- **`fs.rm` Commit phase (009.a1 S1).** 9.69× → 11.84× baseline. It is in-lane
  merges: `fs.rm` calls that merged went 4 of 23 → 16 of 26 → 13 of 13 over
  ranges 7–9, and merge p50 is 35 ms at range 9. This is the same cause as the
  in-lane merge watch above.

- **`fs.apply` ≤8 KiB construct tail (011.a1 S1).** 20.11× baseline at range
  11. Construct totals 1.36 s → 5.46 s (ranges 10 → 11); the tail is the
  captured namespace `update` phase on one Branch (378 and 331 ms for
  two-change applies), not merges. It needs its own diagnosis; the baseline
  class is thin (F-024).
- **F-027 · storage batch (STORAGE_STUDY §6 items 1–3, owner-approved,
  2026-10-18).** Sized pack directories (−14.8%), mode and mtime in the inode
  value (−16.5%), inode-branch deltas (−9.5% at r011, the main P3 item):
  32.8 → ~19.2 MiB simulated at r011, ~1.95 GiB instead of 3.37 GiB forecast
  at r201. Kind 1, readers accept both forms. Owner: the fixer, after F-020 and
  F-025's fixes, before P3; items in order 1 → 2 → 3, each proved and
  measured. Spec: [STORAGE_BATCH_SPEC.md](STORAGE_BATCH_SPEC.md); record:
  [fixes/011-study-f027-storage-batch.md](fixes/011-study-f027-storage-batch.md).
