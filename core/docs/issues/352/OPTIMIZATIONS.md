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

## Watch

- **Chain position residue (007.a1).** A 2 KiB `fs.read` alone on a fork costs
  2.6 ms at range 5 and 3.8 ms at range 7, following the file's metadata delta
  chain position, bounded by the cap of 8. This is input to the delta-depth
  re-read at milestone 50; no change before it.
- **In-daemon p95 tail after F-017 (007.a1).** With calls no longer queued in
  the client, reads during Commits and overlapping Commits wait inside the
  daemon. This is not attributed yet: candidates are the per-call refresh Status
  exchanges, Workspace locks and the Store writer. Judge it on the range-7
  attempt-2 rerun.
