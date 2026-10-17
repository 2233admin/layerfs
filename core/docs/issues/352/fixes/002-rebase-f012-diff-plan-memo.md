# F-012 (range 002, p1-rebase) · a paged difference plans once, and lookups stop re-reading B-tree pages

| | |
| --- | --- |
| Trigger | BUGS.md F-012: in the builder's re-baseline `p1-rebase` (daemon `71001f65`), the checkpoint `diff_commits` cost per entry 0.44 → 0.72 → 1.00 ms over ranges 0–2, depth exponent 0.80 (optimize at range 2). The lead's review: SPEC §4 lets `diff_commits` grow only with its changed entries, flat in tree size and depth. No measured attempt, so no `finding-NNN.aK.json` |
| Kind | 1 forward-only (REBUILD.md): read path only |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | **passed**: a range-4 fork written by `511dceed`, read by `361bb09e`, passes the whole-tree proof checkpoint (530 files, 283 blob ids, 285 changed paths) with `dsh/tools/history/compat.mjs` |
| Playbook step | D3 (work per call grows with something other than its own input) |
| Binaries | daemon `71001f65…` (kept in `core/target/issue352/daemon-71001f65/`) → `361bb09e1d9465ab47e93d1ae98226e62018aad71340140500bbcebb1fde41f4`, kept in `core/target/issue352/daemon-361bb09e/`. SDK addon unchanged: `3da0f665…` |
| Commits | the commit that adds this file. Regression tests: `core/crates/layerfs-daemon/tests/sdk_diff_entries.rs`. `sdk_diff_size.rs` pin updated |
| Recovery | fork the newest snapshot. The builder re-baselines the checkpoint rows on the new daemon |

## Diagnosis (counters)

History depth is not the cause. The five `p1-rebase` checkpoint pairs were
replayed on one fork at depth 3,497 and reproduce their original counters,
taken at depths 571–2,611:

| Range | Statements, original | Statements, replay at depth 3,497 |
| --- | --- | --- |
| 1 | 17,532 | 17,646 |
| 3 | 27,462 | 27,624 |

There are two causes:

1. **Every page planned the whole difference.** `ChangeWalk::plan`, at
   `layerfs-content/src/compare/changes.rs` at `dca67ccd7`, runs on every call.
   It takes the inode-table difference, then the bindings and path lookups of
   every changed inode. A cursor page then skipped to its position. So a k-page
   difference cost k plans: range 3's 3 pages cost about 26k statements each.
2. **Each lookup re-read its B-tree from the root.** `TreeTable::value` and
   `lookup` descend the inode table and the directory from the root page on
   every call, and the comparison had no memo. A changed entry costs several
   lookups (its value, each binding checked against the tree, its parents), and
   each one re-read every upper level. Statements per entry therefore tracked
   the trees' size: about 0.25 × tree files at every range. This is
   tree-proportional work, not the entries' own ancestors.

## New design

- **Memo.** New `layerfs-content/src/compare/memo.rs` defines `Memo`, a bounded
  object memo for one call: at most `MEMO_PAGES` = 256 objects, emptied
  wholesale when full. The plan and the walk read through it. Upper B-tree
  pages are read once per call, and a lookup's own cost is its leaf. A reset
  only re-reads; it never changes an answer.
- **Plan reuse.** `compare::Plan` now holds the changed entries (per side,
  directory serial → names on a path to a changed inode). `Plan::make` builds
  it; `ChangeWalk::planned(…, plan, from)` walks it. `ChangeWalk::plan` is
  replaced by these. The daemon keeps the 4 most recently used plans in
  `layerfs-daemon/src/sdk/plans.rs`, keyed by the two root ids. A plan depends
  only on two immutable roots, so it is reused by every later page.
- **Resume inside directories.** `ChangeWalk::enter_from(pair, from)` lets a
  resumed page enter each directory on the cursor's path, root included, with
  only the names at or after the cursor's component. A later page no longer
  reads the values of the names earlier pages listed in that directory.

### Choice and why

Of the lead's two options, I kept a bounded plan, carried in daemon memory, not
in the cursor:

- **Not in the cursor.** The cursor stays a path. A plan in the cursor would
  grow with the difference, in every request and reply.
- **No path-ordered resume.** A changed inode's path is only known by climbing
  its recorded bindings, and the store has no index from a path position to the
  changes below it. So a resume from a path cannot skip the plan: it would
  rebuild it, which is the defect.
- **Bound.** A plan was already resident for the length of each page, bounded
  by `MAXIMUM_CHANGED` (65,536) changed inodes. Beyond that the difference takes
  the full walk and keeps no plan. Keeping it costs at most 4 such plans, a
  constant independent of the difference. Nothing caps the difference: a plan
  that was let go is rebuilt by the page that needs it.

## Proof

`sdk_diff_entries.rs`, written first. It runs in 13 s on the new code.

1. **Same changes, small and large tree.** 100 changed files, 1 added and 1
   removed (103 entries), in `/src/a/c0..c4`. The small tree has 10 unchanged
   sibling directories of 30 files (400 files); the large tree has 1,000
   (30,100 files). The test asserts equal entries, objects within 32,
   statements within 128 and rows within 512.

   | Tree | Old: objects / statements / rows | New: objects / statements / rows |
   | --- | --- | --- |
   | 400 files | 913 / 4,197 / 19,248 | 21 / 477 / 609 |
   | 30,100 files | 1,176 / 5,685 / 14,736 | 31 / 549 / 802 |

   Old fails on objects (+263) and statements (+1,488).
2. **Pages of 20 through 100 and 2,000 changed files.** The test asserts that a
   later page costs no more than an early one and does not grow with the
   difference's size.

   | Changed files | Old: page 1 / later pages mean | New: page 1 / later pages mean |
   | --- | --- | --- |
   | 100 | 4,476 / 4,461 | 393 / 72 |
   | 2,000 | 74,451 / 74,375 (100 pages, 7.4 M statements in total) | 6,978 / 77 (14,667 in total) |

   Old fails the size assertion.

**The old-code run of this test took 184 s and broke the 2-minute test
ceiling.** The 115 s alarm killed `cargo` but not its test child. Every later
test ran under `core/target/issue352/t115.pl`, which kills the whole process
group.

`sdk_diff_size` used to pin exactly 36 objects for a one-file difference at 300
and 3,000 files. It now reads 10 and 11: each page is read once, and the taller
tree has one more level. The pin now allows one level.

Other checks:
- `history_diff_oracle`, `sdk_diff_pages`, `concurrent_commits` and
  `sdk_chunk_deltas` pass.
- All `layerfs-content` targets pass.
- All `layerfs-daemon` host targets pass except `complete_installed_roots` and
  `install_docker`, which need prepared inputs or a Linux binary and fail as
  before.
- Clippy `-D warnings` is clean.

## Performance, old vs new

Setup: the `p1-rebase` checkpoint pairs on one fork of its range-4 snapshot,
paged with `{cursor, hunks:false}`. Each binary ran in a fresh daemon. Values
are summed over all pages; per entry is statements ÷ changed entries.

| Range | Entries / pages | ms old → new | Statements old → new | Per entry old → new | Rows old → new |
| --- | --- | --- | --- | --- | --- |
| 0 | 327 / 2 | 213.7 → 19.1 | 22,593 → 1,848 | 69.1 → 5.7 | 68,037 → 1,364 |
| 1 | 240 / 1 | 174.4 → 14.1 | 17,646 → 1,503 | 73.5 → 6.3 | 53,578 → 1,290 |
| 2 | 208 / 1 | 194.3 → 14.6 | 18,789 → 1,512 | 90.3 → 7.3 | 59,528 → 1,446 |
| 3 | 676 / 3 | 733.5 → 42.2 | 79,434 → 4,431 | 117.5 → 6.6 | 229,298 → 4,712 |
| 4 | 342 / 2 | 401.6 → 29.6 | 41,058 → 2,742 | 120.1 → 8.0 | 137,107 → 3,357 |

Per-entry statements as a share of tree files:

- Old: about 0.25 at every range (0.27, 0.24, 0.24, 0.27, 0.23), which is
  tree-proportional.
- New: 0.022, 0.020, 0.019, 0.015, 0.015, falling while the tree doubles.

The residual 5.7–8.0 statements per entry follow each range's own entries:
paths, ancestor directories and the B-tree level each lookup's leaf is on.

Storage is unchanged.

## Cost of the fix

- Up to 256 cached objects per call.
- Up to 4 kept plans in the daemon, each within `MAXIMUM_CHANGED`.
- The plan cache is process-wide and keyed by content-addressed roots, so
  equal roots share a plan.

## Left open

- A difference that falls back to the full walk still lists whole directories,
  and a resumed full-listing frame re-lists from the start. That route covers
  more than 65,536 changed inodes or missing hints.
