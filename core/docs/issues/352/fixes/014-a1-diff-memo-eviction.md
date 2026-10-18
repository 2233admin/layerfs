# Range 014 a1 · the checkpoint diff's memo emptied wholesale past 256 objects

| | |
| --- | --- |
| Trigger | Counters: `branch.diff_commits` checkpoint statements per entry or changed directory 7.27, 7.00, 6.65, 8.99 over ranges 11–14 (per changed entry 10.35, 10.39, 10.18, 13.71); tree files exponent 1.143 (optimize). Run p2-main-e, daemon `6d467539`, addon `7ec591f1` |
| Playbook step | D3 (a cost growing with something other than the change), found from counters on a fork |
| Kind | 1 forward-only (REBUILD.md): code path only, Store format unchanged |
| Old Stores | open unchanged |
| Old data | still read as before |
| Compatibility test | not applicable beyond the suites: the memo holds objects read in one call and writes nothing, and the same Store is read by old and new addons in the table below |
| Binaries | daemon `6d467539`, addon `7ec591f1` → daemon `a2926cf2c3367998acc73799abaa6ed5fc9ca135c8e23229a289559cc7c5d614`, addon `7b90b9fb3cf7cab17905943bbeb04913c62832e6dad10c0b1fc82d211271c60b` (built from `d85bfdf50`; copied to `core/target/issue352/` after the measurement window) |
| Commits | fix `d85bfdf50` on branch `dsh-352-014a1`; regression test `core/crates/layerfs-content/tests/compare_memo.rs` |
| Recovery | fork p2-main-e range 13, rerun range 14 measured on the new binaries (lead) |

## Diagnosis

### The measured series mixed cache state

The checkpoint diff runs after the play, on whatever the play left warm. In
range 13 it paid 48% of its cold reader work, and in range 14 70% (measured
reader statements 1,422 and 4,026, against 2,973 and 5,754 cold, below). So
the cold series on one fork is the input below, not the measured one.

### Cold, on one fork

Fork `f009-d014b` of p2-main-e's range-13 snapshot, with range 14
fast-replayed. Each range's checkpoint diff (its `from` and `to` heads) ran
once in a fresh SDK process: daemon `6d467539`, addon `59f7f8dd`
(`dsh-352-f025-fix1-topdown`; its diff code is that of `7ec591f1`, with
`CatalogHints` moved). Receipts are under `core/target/f009/` in the fixer's
worktree (`d014-diff-r1{1,2,3,4}*.json`, `d014-cold-series.txt`,
`d014-memo-ab.txt`, `d014-parents.txt`).

| Range | Entries | Changed ancestors | Writer (hint) statements | Reader statements | Blob reads | Statements per unit | Readers per unit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | 335 | 142 | 1,326 | 3,390 | 2,097 | 9.89 | 7.11 |
| 12 | 310 | 150 | 1,230 | 3,330 | 2,055 | 9.91 | 7.24 |
| 13 | 249 | 132 | 1,113 | 2,973 | 1,839 | 10.72 | 7.80 |
| 14 | 427 | 224 | 1,827 | 5,754 | 3,933 | 11.65 | 8.84 |

A unit is a changed entry or a changed ancestor directory (F-019's basis).

### What it is not

- **Not chain position (F-016 / F-023).** The Store's mean metadata
  delta-chain position is 3.81, 3.80, 3.83 and 3.82 over ranges 11–14. New
  metadata objects average 3.7–3.9.
- **Not the hints.** The writer statements are the plan's hint lookups:
  three statements and one row per changed inode. Per entry they are 3.96,
  3.97, 4.47 and 4.28, with 0.33 rows per statement in every range.
- **Not composition (F-019).** Mean path depth falls (4.38 → 4.20). The
  changed entries' parent directories hold 2.28, 2.49, 2.73 and 2.57 entries
  per changed entry, which is small and flat.

### What it is

`compare::Memo` held at most `MEMO_PAGES` (256) objects and emptied
wholesale when full. The same four diffs, rerun with a diagnostic addon
whose bound was raised to 2^20 (not committed):

| Range | Readers, memo 256 | Readers, no practical bound | Blob reads, 256 / unbounded | Statements per unit, 256 / unbounded |
| --- | --- | --- | --- | --- |
| 11 | 3,390 | 3,390 | 2,097 / 2,097 | 9.89 / 9.89 |
| 12 | 3,330 | 3,330 | 2,055 / 2,055 | 9.91 / 9.91 |
| 13 | 2,973 | 2,973 | 1,839 / 1,839 | 10.72 / 10.72 |
| 14 | 5,754 | 4,248 | 3,933 / 2,649 | 11.65 / 9.33 |

Ranges 11–13 never fill the memo. Range 14's diff touches more than 256
objects, so after each reset every lookup re-reads the inode and directory
B-trees' upper pages: 1,506 more reader statements. Without the resets,
range 14 costs 9.33 per unit, less than any earlier range. The trigger
follows the size of one diff, not the tree or the history. It is a cliff at
256 objects that a larger diff reaches as the project grows.

## Old design

`Memo::serve` (`layerfs-content/src/compare/memo.rs`) cleared the whole map
when a batch of misses would take it past `MEMO_PAGES`. Every object was
lost, including the upper pages that the next descent needs first.

## New design

The memo keeps the same bound of 256 objects, so its memory is unchanged.
Each held object records the demand that used it last. When a batch of
misses would pass the bound, the least recently used objects are evicted
first: one sort of at most 256 entries per such batch. The upper pages serve
every descent, so they are always recent and stay. A re-read after an
eviction is still correct.

## Proof

- **`compare_memo.rs`:** a counting provider serves 1,024 distinct leaves,
  each under one shared root page and one shared inner page.
  - The shared pages are read once.
  - The first leaves are evicted, then read again with the same bytes.
  - The newest leaf is still held.
  - Revert check: with the wholesale empty, the shared pages are read 5 times
    and the test fails (`core/target/f009/revert-014a1-memo.txt`).
- The store-service suite passes 25/25, and `clippy -D warnings` is clean on
  `layerfs-content`.

## Performance, old vs new

The four cold diffs on fork `f009-d014b` (p2-main-e r13 + r14 fast), each in
a fresh SDK process, one sample per case. Addon `7ec591f1` (old) against
`7b90b9fb` (new): the memo is the only difference. Receipt:
`core/target/f009/d014-proof.txt`.

| Measure | Snapshot | Cache | Old (`7ec591f1`) | New (`7b90b9fb`) | Change |
| --- | --- | --- | --- | --- | --- |
| range-14 checkpoint diff reader statements | f009-d014b | fresh SDK process | 5,754 | 4,743 | −1,011 (−17.6%) |
| range-14 checkpoint diff blob reads | same | same | 3,933 | 3,072 | −861 (−21.9%) |
| range-14 statements per unit | same | same | 11.65 | 10.09 | −13.4% |
| ranges 11 / 12 / 13 reader statements | same | same | 3,390 / 3,330 / 2,973 | 3,390 / 3,330 / 2,973 | equal (no eviction) |
| writer (hint) statements, ranges 11–14 | same | same | 1,326 / 1,230 / 1,113 / 1,827 | equal | 0 |

The new cold series per unit is 9.89, 9.91, 10.72 and 10.09. The bounded
memo recovers 1,011 of the 1,506 statements that an unbounded one saves; the
rest are leaves that a 256-object bound cannot keep. No storage change.

## Left open

- `fs.list` and `fs.grep` (`sdk/reads.rs`) use the same memo, so they gain
  the same eviction. No change was measured there.
- None of DEFER.md's items is touched.
