# Range 002 a1 · Project lookup paged through every stack

| | |
| --- | --- |
| Trigger | Not a gate trip; left open in the [fork record](002-a1-fork-branch-count.md). Every SDK call resolves its project through `args::project`, which grew with the projects in a Store (control arms, forks of a project). |
| Playbook step | D4 (rows returned per call grow with an unrelated count) |
| Kind | code path (uses the existing unique `layer_stack_names` index; no schema change) |
| Binaries | old daemon `b9c332b79bc5…58bfc` → new daemon `511dceeda1b5…7ad0` |
| Commits | fix `bcb52a1f4`, regression test `core/crates/layerfs-daemon/tests/sdk_project_count.rs` |
| Recovery | shipped with the [diff_commits fix](002-a1-diff-commits-change-walk.md): fast rebuild of ranges 0–1 into `p1-pilot-b`, range 2 measured |

## Old design

`core/crates/layerfs-daemon/src/sdk/args.rs` at `c511e6bcf`: `project()` (`:90`)
paged through `layer_stacks` in name order, `MAXIMUM_PAGE_RECORDS` at a time,
until a stack's name matched. Its cost was O(projects in the Store) on every SDK
call.

## New design

`HistoryCatalog::layer_stack_named(name)` (the default pages, for other
providers); Persistence answers with one indexed statement
(`layerstack_stack_by_name.sql` on the unique name index). `args::project`
calls it. Bound: O(1) in project count. +18 production lines.

## Proof

`sdk_project_count`: an `fs.stat` does the same SQL statements and rows with 1
and 600 projects (failed before: 24 statements / 10 rows → 48 / 621; now 24 / 10
at both).

## Performance, old vs new

The replay Store has one project, so its probes do not move: the old and new
statements are equal on every probe, apart from the diff_commits, merge and
Commit changes in the [diff_commits record](002-a1-diff-commits-change-walk.md).
The test's counters are the comparison.

| Probe / measure | Snapshot | Cache | Old | New | Change |
| --- | --- | --- | --- | --- | --- |
| `fs.stat` statements / rows, 1 project | test Store | warm test fixture | 24 / 10 | 24 / 10 | 0 |
| `fs.stat` statements / rows, 600 projects | test Store | warm test fixture | 48 / 621 | 24 / 10 | −50% / −98% |

## Left open

Nothing.
