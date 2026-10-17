# Range 002 a1 · Branch lookup read every Branch of the project

| | |
| --- | --- |
| Trigger | Counters: `fork.returned_rows` depth exponent 0.768 (threshold < 0.05), [range-002.md](../ranges/range-002.md) |
| Playbook step | D4 (rows per call against the Branch count), confirmed by D2 |
| Kind | code path |
| Binaries | old daemon `0ef24121723a…4c404` → new daemon `b9c332b79bc5…58bfc` |
| Commits | fix `e65ce83f0`, regression test `core/crates/layerfs-daemon/tests/sdk_branch_count.rs` |
| Recovery | fork of snapshot `range-001` into `p1-pilot-a2`, rerun range 2 measured as attempt 2 |

## Old design

The SDK named Branches by name and resolved a name by paging through every
Branch of the stack until one matched:
`core/crates/layerfs-daemon/src/sdk/args.rs:118` (`args::branch`), with
`store.history().branches(stack.id, &page)` at `args.rs:128`, 128 rows a page.
`branch.fork` calls it for its NameTaken check
(`core/crates/layerfs-daemon/src/sdk/branch.rs:169`); a new name is absent, so
the scan always read every Branch. Every other call that names a Branch
(`fs.*` on a Branch, `list_commits`, `merge`, `publish`, `diff_branches`) paid
the same scan until its Branch came up in name order.

The SDK cannot delete a Branch, and the replay adds about seven per range (lane,
check and probe Branches), so the cost grew with the replay's length: the fork
probe returned 12 → 19 → 26 rows over ranges 0–2, and `list_commits` 58 → 65 → 72.
At 202 ranges (~1,400 Branches) every Branch-named call would read ~1,400 rows.

## New design

`HistoryCatalog::branch_named(stack, name)`
(`core/crates/layerfs-history/src/contract/catalog.rs`), implemented in
`core/crates/layerfs-persistence/src/history/branch.rs` with one query
(`sql/sqlite/queries/history/branch_branch_by_name.sql`) over the existing
unique index `branch_names (layer_stack_id, name)`. `args::branch` uses it.
Bound: one indexed row per lookup, O(1) in the Branch count. No schema change
(the index already existed); +20 production lines.

## Proof

`sdk_branch_count::fork_and_branch_reads_are_independent_of_branch_count`:
a fork and an `fs.stat` on a named Branch do the same SQL statements and rows
with 10 and with 1,000 Branches. Before the fix it failed: fork 17 statements /
19 rows at 10 Branches, 77 / 1,046 at 1,000. After: 16 / 7 at both.

## Performance, old vs new

The range probes on forks of the pilot snapshots, one sample per case and
binary. Cache: a fresh daemon (new service container) on a Store file just
restored from the snapshot, the same for both binaries. Diagnostic runs
(`diag-rN-old`, `diag-rN-new`), not range results.

| Probe / measure | Snapshot | Cache | Old | New | Change |
| --- | --- | --- | --- | --- | --- |
| fork rows | range-000 | fresh daemon | 16 | 7 | −56% |
| fork rows | range-001 | fresh daemon | 23 | 7 | −70% |
| fork rows | range-002 | fresh daemon | 30 | 7 | −77% |
| fork VM steps | range-002 | fresh daemon | 548 | 272 | −50% |
| list_commits rows | range-002 | fresh daemon | 72 | 50 | −31% |
| fork ms | range-002 | fresh daemon | 2.38 | 4.07 | +71% (one sample; counters fell) |

Counter exponents against depth over the three snapshots, before → after:
`fork.returned_rows` 0.622 → 0, `fork.vm_steps` 0.360 → 0,
`list_commits.returned_rows` 0.212 → 0, `list_commits.vm_steps` 0.113 → 0.
(The gate's 0.768 came from the in-run pilot values on the old binary.)

Storage untouched: one more query over an existing index.

## Left open

- `args::project` resolves the project by paging through every stack the same
  way. It grows with the number of projects in a Store, not with history; one
  project here, so it was left and is noted for a later fix.
- The SDK still cannot delete a Branch; Branch rows grow by ~7 a range, now
  without a per-call cost.
