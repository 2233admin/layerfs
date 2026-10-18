# Range 011 a1 · a listing looks its entries up together, through one memo

| | |
| --- | --- |
| Trigger | `p2-main-c` range 11 attempt 1 (daemon `58a60046`, addon `799e3ca6`), over ranges 9–11: Scaling `list_largest` per entry, depth exponent 0.782 (threshold < 0.15); Counters `list_largest.statements` per entry, depth exponent 1.834 (threshold < 0.05) |
| Playbook step | D3 (work per entry grows with the tree, not with the entry) |
| Kind | 1 forward-only (REBUILD.md): read path only |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | **passed**: a range-4 fork of `p1-pilot-b` written by `511dceed`, read by daemon `0cc2a732` (addon `799e3ca6`), passes the whole-tree proof checkpoint (530 files) with `dsh/tools/history/compat.mjs` |
| Binaries | daemon `58a60046…` → `0cc2a732c2506966e8182e0bf6cdfb88bf3252a1e5d3b8056f4749166782f042`, kept in `core/target/issue352/daemon-0cc2a732/`. Addon unchanged: `799e3ca6…` |
| Commits | the commit that adds this file, on branch `dsh-352-f011`. Regression test `core/crates/layerfs-daemon/tests/sdk_list_entries.rs` |
| Recovery | (lead) fork `p2-main-c`'s range-9 snapshot, fast-forward range 10, and rerun range 11 measured on daemon `0cc2a732` |

## Diagnosis

The probe lists the same directory at every range,
`examples/acp-agent/tests/snapshots`, with 34, 35 and 38 entries. Its
identity is stable. The cost per entry grew:

| Range | Entries | Statements | Statements per entry | Rows | Blob reads |
| --- | --- | --- | --- | --- | --- |
| 9 | 34 | 564 | 16.6 | 3,225 | 441 |
| 11 | 38 | 924 | 24.3 | 3,741 | 789 |

These are the original values, reproduced exactly on forks of the range-9
and range-11 snapshots.

**Cause.** `sdk/reads.rs` `list` (at `a363e7fa8`) looked each listed entry
up separately with `TreeTable::value`. Every lookup descended the inode table
from its root page, and the Store's object cache is 64 KiB. So each entry
re-read every upper level of the inode table, and the delta chain of each
level. The table grows with the tree, so the per-entry work grew with depth.
This is the defect F-012 fixed for comparisons.

**Not only the chain cycle.** Most of the growth is these re-reads; F-016's
periodic chain position is a smaller part (see the residual below).

## Old and new design

- **Old:** one inode-table descent per listed entry, uncached. The cost per
  entry was O(table levels × chain depth), re-paid for every entry.
- **New:** `list` reads through one `compare::memo::Memo` for the call (the
  F-012 memo, at most 256 objects, emptied when full). It looks up each
  page's entries together with `TreeTable::values` (`lookup_many`): one
  descent per level for the whole page. Upper pages are read once per call,
  and an entry costs its share of the leaves.

## Proof

`sdk_list_entries.rs`, written first. It lists the same 40-entry directory in
a 400-file and a 30,040-file tree. It asserts that the larger tree costs at
most 16 more statements and 8 more objects.

| Tree | Old: objects / statements | New: objects / statements |
| --- | --- | --- |
| 400 files | 87 / 411 | 10 / 63 |
| 30,040 files | 129 / 540 | 12 / 72 |

The old code failed (+129 statements); the new code passes.

Other checks:
- `sdk_compare`, `sdk_grep_reads`, `sdk_branch_count` and `sdk_mount_lookup`
  pass.
- Clippy `-D warnings` is clean.

## Performance, old vs new

Setup: the `list_largest` call (`fs.list` of the probe directory, page 1000)
on forks of `p2-main-c`'s range-9 and range-11 snapshots, one fork per arm. A
warm call came first, then the measured call. Each fork used a fresh daemon
on a just-restored Store file.

| Snapshot | Old `58a60046`: statements / per entry / VM steps / blob reads | New `0cc2a732`: statements / per entry / VM steps / blob reads |
| --- | --- | --- |
| range 9 (34 entries) | 564 / 16.6 / 31,339 / 441 | 210 / 6.2 / 11,359 / 168 |
| range 11 (38 entries) | 924 / 24.3 / 38,475 / 789 | 273 / 7.2 / 13,407 / 225 |

**Residual: +16% per entry from range 9 to 11.** It is the leaf pages and
their metadata delta chains. This directory is rewritten in most ranges, so
its pages' chain positions cycle with the cap of 8 (the F-016 effect). That
is bounded, so it is a gate matter for the builder, not a product defect.
Two same-binary points cannot fit the period; judge it on the rerun.

Storage is unchanged.

## Cost

- At most 256 cached objects per `fs.list` call.
- Production LOC 96,469 → 96,477 (+8).

## Left open: S1 `fs.apply` ≤8 KiB 20.11× (commit phase, range 11)

This is not caused by the listing, and not mainly by merges. Summed over the
range's `fs.apply` Commits:

| Phase | Range 10 (52 Commits) | Range 11 (87 Commits) |
| --- | --- | --- |
| construct | 1.36 s | 5.46 s |
| merge | 0.84 s (18 merged) | 0.60 s (21 merged) |

The tail is the captured namespace `update` phase on one Branch,
`r011-1-packages-workflow`: 378 and 331 ms for two-change applies. Construct
p50 is still 8.6 ms. It looks like an update whose cost follows a large
directory's size, which needs its own diagnosis. It is recorded as a watch in
OPTIMIZATIONS.md, and the baseline class is thin (F-024).
