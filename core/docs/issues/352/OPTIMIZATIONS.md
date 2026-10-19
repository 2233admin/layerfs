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
| 013.a1 | D0 | `oneshot_mount_exec` time exponent 2.30, every SQL counter flat: no product change. The growth is the Sandbox's `exec true` launch (33 → 62 ms, zero FUSE requests); fresh-daemon spreads overlap (18–62 vs 24–47 ms). The probe is split (builder `08de4f038`) | — | [oneshot_mount_exec grew in exec launch, not in LayerFS](fixes/013-a1-oneshot-exec-launch.md) |
| 015.a4 (#364 item 1) | D1 | `branch.merge` new Commit, recorded-merge replay on the r015 snapshot, Linux, old → new: 2,056 → 436 ms, statements 106,809 → 9,957, VM steps 8.58 M → 0.62 M, full-scan steps 13,332 → 0, sorts 31,029 → 0 (second merge 2,982 → 493 ms). Merge records stay resident ≤ 8 MiB, a Save keeps resolved objects ≤ 4 MiB, key windows read the primary key, logical size from catalogue lengths. 42/42 recorded merges identical old vs new | this commit | [Merge records, repeated object reads and a materialized key window](fixes/041-364-merge-records-and-reads.md) |

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
  **Item 1 done** (`925567e59`, daemon `20b7fde1`, addon `c41ae8c5`): pack
  versions 23/24/25 write a directory of exactly the pack's groups. Range 14
  from the `p2-main-e` range-13 fork, one sample per arm: Store growth
  6,057,984 → 4,804,608 B (−20.7%), new packs' reserved bytes 632,640 → 0.
  Old packs keep 11.6% of the Store as reserved bytes. Speed within 1.1×
  except p95 watches on fs.read, fs.list and sandbox.mount (1.14–1.15, flat
  counters, load ~13). [fixes/014-f027-item1-sized-pack-directories.md](fixes/014-f027-item1-sized-pack-directories.md).
  **Item 3 done** (`7ac7343c7`, daemon `3dad6f79`, addon `43c96012`, on
  branch `claude/issue360-item3-branch-deltas-72ecad`):
  - Change: an `InodeBranch` is stored as a COPY/INSERT program against its
    predecessor, under the metadata cap of 8 and the chain budgets; a refused
    base stores whole. Old Stores read unchanged (compat range 14 ok).
  - Synthetic P3, 100 `fs.write` Commits on a 53k-entry tree: InodeBranch
    2,894 → 338 B per Commit (−88%), pack bytes −80%, Store growth −20%.
    Decoded views are identical.
  - Lookup bound holds (one chain per branch level).
  - Speed, cache state enforced: 0.85–1.04× on FUSE operations, Commit and
    merge; SDK `fs.read` cold 1.25× (single sample). Statements +5–30% on
    cold reads and writes.
  - Accepted under AGENTS §3.9. The lead's p95 condition is not established
    from one sample per case, and the r011 storage gate was not run.
  - Integrated (`01dc7eefa`, `a76b4ac33`): built on F-036 (bases found with
    `base_location`) and F-043. Reference closure, chronology under two
    concurrent Saves, and one chain per demanded branch page in a merge are
    shown by test; M1 equivalence with a delta-form side passes on
    `issue360-i3-m1-equiv`.
  - Record: [fixes/030-f027-item3-inode-branch-deltas.md](fixes/030-f027-item3-inode-branch-deltas.md).
- **Record 034 · S1 and O1 (owner via the liaison, 2026-10-19).** Three
  commits on `claude/issue352-s1-o1-034`, one sample each, no format change:
  - O1-a `13522bf39`: a Commit's logical size comes from catalogue lengths.
    On pnpm-first, writer statements went 103,770 → 66,173, locates
    44,159 → 9,759, payload reads −45 MB, and Commit minus construct
    1.74 → 0.60 s.
  - S1-a `6b47dbd26`: the candidate ring is read in slot order and sorted
    in memory. On small-commit, `begin` went 6.76 → 3.26 ms and the sort
    is gone.
  - S1-b `4469e20a7`: the ring loads at its first use. On small-commit,
    `begin` went 3.26 → 0.11 ms, the ring read is gone, and daemon
    Commit went 13.78 → 6.41 ms over the three fixes.
  - O1-b (bindings, −0.1 to −0.2 s) and O1-c (Save-internal, under
    −0.1 s) were skipped by approval.
  - Record: [fixes/034-s1-o1-commit-begin-and-logical-count.md](fixes/034-s1-o1-commit-begin-and-logical-count.md).
