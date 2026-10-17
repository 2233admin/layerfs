# F-010 (P2 dev ranges 5–7) · checkpoint diff_commits pages resume and skip hunks

| | |
| --- | --- |
| Trigger | Builder's P2 dev ranges 7–11 gated optimize: checkpoint `diff_commits` pages return ~20–27 entries; page 0 grew 127 → 213 ms (401k → 703k VM steps) from range 5 to 7; per entry 3.3 → 6.5 → 13.0 ms; later pages skip from the start again. No measured attempt |
| Kind | 1 forward-only (REBUILD.md) |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | **passed** with the batch's final daemon `71001f65`: range-4 fork written by `511dceed`, whole-tree proof checkpoint ok (530 files) (REBUILD.md §4; run recorded in [the F-011 record](002-a1-f011-binding-hint-migration.md#compatibility)). This fix's own probe already read the range-4 fork's Commits with daemon `d897ab71` |
| Playbook step | D3 (per-page cost grows with page position and with file contents) |
| Fix kind (SPEC §6) | code path, plus an optional SDK argument (no Store format change) |
| Binaries | daemon `18ab5415…` (diff code unchanged since `511dceed`) → `d897ab71555469d9d3bc48d6ae49bbafc4f416be3489edbd4df9c53c3d88ce77` (kept in `core/target/issue352/daemon-d897ab71/`; the committed source differs from it only by rustfmt) |
| Commits | the commit that adds this file; regression test `core/crates/layerfs-daemon/tests/sdk_diff_pages.rs` |
| Recovery | fork newest snapshot; the player's checkpoint adopts `{ cursor, hunks: false }` (builder) |

## Old design

`core/crates/layerfs-daemon/src/sdk/compare.rs` (at `bda03912b`) `emit` paged by
offset. Every page re-planned the change walk, then walked and skipped the first
`pos` changes again (`seen < pos`). Page k paid for all earlier pages.

Each Modified text file was listed with line hunks: both whole versions read and
line-diffed (`snapshot::text`, `line_diff`). A page filled the 48 KiB reply budget
with hunks after ~10–57 entries. The checkpoint asks for 1,000 per page but only
uses paths, kinds and the entries' facts.

Per call, the change plan (`ChangeWalk::plan`: inode-table difference and each
changed inode's bindings to the root) is ~17k statements on the range-4 checkpoint
(342 changes). It is O(changed × depth) and paid on every page.

## New design

- **Cursor.** Each page answers `nextCursor`, the last path it listed. Passing it
  back as `cursor` resumes the walk: pairs at or before it in component order are
  passed over, and only directories on the cursor's path are entered. Subtrees that
  earlier pages finished are never re-entered. `pagePos`/`nextPagePos` keep working
  unchanged.
- **`hunks: false`.** Lists changes without line hunks (`hunks: null`,
  `hunksOmitted: false`). No file contents are read. A page fills by paths, about
  240 entries per 48 KiB.
- SDK: `branch.diff_commits(from, to, pageSize?, pagePos?, { cursor?, hunks? }?)`,
  same for `diff_branches`, documented in the SDK README.

Per page: one change plan (O(changed)) plus that page's own items. With
`hunks: false`, a checkpoint of a few hundred changes is one or two pages.

## Proof

`sdk_diff_pages.rs` (host, 120 Modified files of 60 lines each):

- Cursor pages list every change once, in path order. Statements per page are
  flat: 6,036 / 5,988 / 6,069 / 5,457, and the test requires the last page to be
  ≤ 1.25 × the first.
- One `hunks: false` page lists all 120 paths with `hunks: null`.

On the old code both fail: no `nextCursor`, and 34 entries on the page instead
of 120. Also passing: `sdk_diff_size`, `history_diff_oracle`, `sdk_compare` and
`sdk_grep_reads`.

## Performance, old vs new

Range-4 checkpoint diff: `diff_commits(range-3 head, range-4 head, 1000, …)` on a
fork of snapshot range 4, fresh service daemon, traced, one sample each.

| Measure | Snapshot | Cache | Old (offset, hunks) `18ab5415` | New cursor, hunks `d897ab71` | New cursor, `hunks: false` `d897ab71` |
| --- | --- | --- | --- | --- | --- |
| Pages for 342 changes | range-4 fork | warm service daemon (same process, sequential) | 12 | 12 | 2 |
| Total ms | same | same | 2,541 | 2,189 (−14%) | 411 (−84%) |
| Total statements | same | same | 255,939 | 214,671 (−16%) | 40,800 (−84%) |
| Total VM steps | same | same | 8.52 M | 7.25 M (−15%) | 1.39 M (−84%) |
| Page 0 → last page statements | same | same | 18,282 → 24,438 | 17,298 → 17,616 | 21,789 → 19,011 |
| Page 0 → last page ms | same | same | 180 → 236 | 176 → 176 | 225 → 186 |

The old column was taken on the same daemon, `d897ab71`, through the offset
path, which is the old code path and still supported. The first sample of the
same probe on `18ab5415` gave the same page shape: page 0 186 ms / 596k VM steps.

Counter exponents: before, per-page statements grew with page position; after,
they are flat in position. Per call it is O(changed) for the plan, plus the page's
items.

## Cost of the fix

- One extra reply field (`nextCursor`, at most one path).
- Path comparisons for pairs at or before the cursor.
- `hunks: false` changes nothing for callers that leave it unset.

## Left open

- The change plan is still paid once per page: ~17k statements for 342 changes,
  dominated by the binding lookups up to the root. With `hunks: false` that is one
  or two plans per checkpoint.
- **Player change (builder):** `lib.mjs verify()` should call
  `diff_commits(prevHead, head, 1000, pos, { cursor, hunks: false })` and carry
  `cursor = page.nextCursor`.
