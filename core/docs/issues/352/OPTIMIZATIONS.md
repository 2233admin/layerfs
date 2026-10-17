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
