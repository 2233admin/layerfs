# #364 hot spot 4 · a difference too large to plan pages in fixed work

> **Status:** Current fix record, 2026-10-20. Branch `issue364-item4`, stacked on item 3
> (item 3 is on main). Code path only; no format change. Design 8 and
> the plan bound are untouched.

| | |
| --- | --- |
| Trigger | #364 item 4. Since range 16, `branch.diff_commits` over the checkpoint verify costs 1.3–1.6 ms per listed entry against 0.11 ms at range 15. Range 20: 316 calls of >64 entries, p50 298 ms and 3,444 statements a call, 1.43 ms per entry; about 70 s per verify ([range 20](../ranges/range-020.md)). Range 15's baseline is 15.0 ms a call |
| Owner/liaison scope | "Root-cause it with the same binary … Aim for a fixed number of statements per page … Propose a fix that leaves design 8 alone." Judged on whole-call time under the 5 ms floor |
| Kind | code path |
| Commits | `d730091272` harness (per-page lines), `21e5cfebba` fix, on origin/main `e5c7aaae05`. Measured and tested as `83b0c1f99b` and `29478620bb`, the same code before a docs-only rebase |
| Binaries | `relink_commit` test binary, release, pinned image `378b799ef433`: old `83b0c1f99b` (SHA-256 `2d8957be…`), new `29478620bb` (`9aace6b6…`), separate target directories |
| Regression tests | new `layerfs-content/tests/compare_full_resume.rs` (fails on the old listing), new `layerfs-store-service/tests/kept_plans.rs` |
| Production LOC | 103,921 → 103,930 (delta +9), `tools/production_loc.py --root`, first parent vs committed tree. Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812) |

## Root cause

`diff_commits` first asks `Plan::make` for the changed entries. This is the
page-skipping difference of the two inode tables, plus each changed inode's
recorded bindings. It gives up and answers `None` when more than
`MAXIMUM_CHANGED` (65,536) inodes differ, and the difference then takes the
full walk of both trees.

Range 16's relink gives every file under `node_modules` a new serial. The two
roots therefore differ in every relinked inode twice (removed on the left,
added on the right): 76,270 for the 38,135-file harness relink, and more in
the range. Range 15's diffs stayed under the bound and were planned.

The plan cache (`store-service` `read/plans.rs`, #352 F-012) kept only plans.
So every page of an unplanned difference ran `Plan::make` again: it read both
inode tables until 65,536 differences, then gave up. That is about 3,200 of
each page's statements, the same on every page. A second, smaller cost was
also there: a resumed full walk listed each directory on the cursor's path
from its first name.

With the same old binary:
- the 10k relink (20,000 changed inodes, planned) lists at 0.244 ms per entry, its later pages at 120–320 statements;
- the full relink (76,270, unplanned) lists at 1.545 ms per entry, every page at about 3,200 statements.

Pages 26 to 201 all cost about 3,200 statements and 270–280 ms, so the cost
does not follow the page's position: it is the re-planning repeated on every
page.

## Fix

1. **`read/plans.rs`.** The cache keeps `Option<Arc<Plan>>`. A difference that takes the full walk keeps `None` like a plan, under the same 4-entry LRU. Its later pages walk at once, and only the first page pays the failed plan.
2. **`compare/changes.rs`.** `ChangeWalk::full` takes the cursor's first component, as `ChangeWalk::planned` already did. A listed directory on the cursor's path finds that name by lookup (one per side) and lists after it, so a page does not re-read the windows before its cursor.

The pairs, their order and every answer are unchanged.

Both pieces change existing code; nothing new was needed. The cache already
existed for plans, and `lookup` and `list_after` are the walk's own reads.

## Tests

- **`compare_full_resume.rs`.** Two 600-file directories whose files all have new serials.
  - A full walk resumed after four cursors lists exactly the next 50 pairs of the uninterrupted walk.
  - The reads made before a page's first pair stay within 4 of the first cursor's.
  - With the old listing it fails: 32 reads after `/d/f0098` against 22 after `/d/f0000`.
- **`kept_plans.rs`.** A full-walk answer is found again like a plan and let go least recently used.
- No test was deleted and no assertion changed.

## Checks

- **Host** (macOS, `cargo +1.85.1`, each run under a 120 s alarm):
  - content and store-service suites (67 binaries) pass;
  - Clippy `-D warnings --all-targets` on content, store-service and api is clean.
- **Linux** (pinned image, `-j 6`): the api diff tests (`sdk_diff_pages`, `sdk_diff_size`, `sdk_diff_entries`, `sdk_compare`, `history_diff_oracle`, `sdk_method_golden`, `method_refusal_order`) and the content and store-service binaries: 101 test binaries of api, content and store-service at `29478620bb`, all pass.

## Performance, old vs new

Linux, pinned image, one sample per arm, Disposable/WAL/OFF,
`LAYERFS_CONSTRUCTION_WORKERS=1`.

**The harness.** `layerfs-api/tests/relink_commit.rs` forks the r015 head and does the following:
1. relinks every one-link regular file under `node_modules`;
2. commits, relinks again and commits, with times kept;
3. pages `branch.diff_commits` between the two Commits, 200 entries a page, in one process.

| Relink | Arm | Load (1 min) | Pages | Entries | Diff ms | Statements | Per page | ms per entry |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| full (38,135 files, unplanned) | old | 10.74 | 208 | 38,135 | 58,899.6 | 690,921 | 3,322 | 1.545 |
| | new | 9.14 | 208 | 38,135 | **3,809.0** | **52,660** | **253** | **0.100** |
| 10k (planned) | old | 10.30 | 53 | 10,000 | 2,436.2 | 87,215 | 1,646 | 0.244 |
| | new | 8.53 | 53 | 10,000 | 2,440.9 | 87,215 | 1,646 | 0.244 |

**Per page, full relink:**

| Page | Old ms / statements | New ms / statements |
| --- | --- | --- |
| 1 | 297.9 / 5,141 | 302.0 / 5,141 |
| 26 | 272.8 / 3,216 | 7.0 / 96 |
| 76 | 280.4 / 3,229 | 10.9 / 146 |
| 151 | 282.9 / 3,407 | 18.4 / 317 |
| 208 (last) | 437.3 / 5,298 | 148.5 / 2,284 |

- **Unplanned difference** (the range-16-to-20 class): 58.9 s → 3.8 s (−94%), and per page 3,322 → 253 statements.
  - The first page still pays the failed plan once (about 300 ms).
  - The last page walks the unchanged rest of both trees to prove there is nothing after it.
  - Pages in between list 200 entries in 7–18 ms.
  - The two Commits are identical in both arms (same roots, statements and bytes), and both arms list the same 38,135 entries over 208 pages.
- **Planned difference:** the same statements in both arms (87,215), as expected. The fix does not touch it.
- **Range estimate.** For range 20's verify (316 pages, about 70 s), the same per-page drop would give about 6 s (18 ms a page on average). This is an estimate, not a range run.

## Limits

- The kept answer lives in the process that serves the pages, as plans already did (F-012). A verify whose pages are served by separate processes would pay the failed plan on every page.
- A planned difference's first page is unchanged. On the 10k relink it is the plan itself: 1.0 s and 76,355 statements.
- One sample per arm on a loaded host (8.5–10.7).

Receipts in this session's scratch:
- `out/m4/{old,new}-{full,10k}.txt`: each with its load and QUIET state;
- `out/i4build-*.txt`: build logs and binary SHA-256;
- `out/i4-*.txt`: test and Clippy runs.
