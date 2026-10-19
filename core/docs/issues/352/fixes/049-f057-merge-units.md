# #352 F-057 · merge units for `branch.merge`

> **Status:** Current fix record, 2026-10-20. Branch `f057-merge-units`. Built per
> the owner-approved [design](../F057_MERGE_UNITS.md) and its §10 decisions. A
> code path and an SDK argument; one persisted fact (the unit list), with no
> schema change.

| | |
| --- | --- |
| Trigger | #352 F-057: a dependency tree such as `node_modules` merged path by path can mix two installs. The owner chose option B: caller-declared units, each taken whole from the side with the later write |
| Owner/liaison scope | "build F-057 merge units … `branch.merge` takes `units` … A merge without `units` must give byte-identical roots to today's on the recorded merge fixtures. Workspace Commit merges are unchanged in v1. Tests per §9." |
| Kind | code path · SDK argument and result fields · a persisted Commit fact (no schema change) |
| Commits | implementation, tests and docs; this record; the measurement harness (`replay_merges` units arm, two timing children); on origin/main `2ecf044d8e` |
| Regression tests | new `layerfs-content/tests/merge_units.rs` (4), new `layerfs-api/tests/merge_units.rs` (13); `sdk_method_golden` transcript gains `units`/`unitsTruncated` on its two merge lines |
| Production LOC | 103,930 → 104,625 over two commits, `tools/production_loc.py --root`, first parent vs committed tree: implementation 103,930 → 104,619 (+689: core 95,241 → 95,928, sdk 2,641 → 2,643, dsh 6,048 unchanged); harness commit 104,619 → 104,625 (+6, the two timing children); this record's commit 0. Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812) |

## Design as built

`merge_roots` is untouched. Units run before it, in the merge's Save, and
`merge_roots` then runs on the possibly reverted roots.

1. **Admission** (`Units::new`, called first in `branch::merge`). A malformed pattern
   (empty, a comment, an empty component, a control character), a unit
   without a positive pattern, and an empty or repeated name are refused
   `InvalidInput`, the codebase's invalid-argument refusal, before any work.
   The API parses `units` as a list of patterns or `{ name, patterns }`.
2. **Classify** (`unit_changes`, content `merge/units.rs`). For each side, a
   `ChangeWalk` of base against that side, planned from the Catalog's binding
   hints and otherwise full, counts per unit:
   - the paths the side changed: added, deleted, kind, file or symlink content, metadata;
   - their latest mtime; a deletion takes its nearest surviving parent's.

   A new serial with the same kind, content and metadata is no change, so a
   relink is none. A directory whose listing changed is a change only when its
   own metadata (its mtime) changed. State: one count and one time per unit
   and side.
3. **Decide** (`decide_units`). A unit both sides changed is kept from the side
   with the later write, ours on a tie.
4. **Revert** (`revert_units`, content `merge/revert.rs`). A side that lost a
   unit is rewritten with the base's entries at every path of its lost units:
   - It uses the merge plan's records (`build::Plan`, `ChangeWriter`) and one
     backed update of that side, the merge's own route.
   - A base directory the side lacks is rebuilt from its base listing.
   - One the side moved out of the unit is rebuilt under a fresh serial
     beside the move.
   - A restored file keeps its base serial. If the side also binds it outside
     the unit, it is a cross link: the unit's value is set on the one serial.
   - The revert uses its own merge-records scope.
5. **Merge.** `merge_roots` on the reverted roots, unchanged. `decide_from` stays
   ours. Logical size and recorded bindings are counted from the original
   left root, as before.

**Result.** Clean, conflict and fast-forward results carry `units` (decided
units only: `unit`, `kept`, `keptTime` in RFC 3339 UTC, `changedOurs`,
`changedTheirs`, `dropped`, `crossLinks`) and `unitsTruncated` (16 KiB
window, as `lww`).

**Record.** `CommitMeta.units` keeps the unit list the merge ran with:
- It is stored after the LWW decisions in the existing `lww` blob, behind a
  `0xFFFFFFFF` marker that no path length can take. Older blobs read as no
  units.
- It is outside Commit identity, like `lww`.
- `branch.list_commits` shows it as `units` only when present, so Commit
  values without units are unchanged.
- The control wire omits it, as it omits the decisions.

**SDK.** The JS SDK's `branch.merge(a, b, name, message?, units?)` passes
`units` through. The dsh host binding is left to the #352 switch-over.

**Unchanged.** Without `units`, or with units that decide nothing, the merge
inputs are today's exactly, so the roots are byte-identical. Workspace
Commit merges take no units.

## Definitions this build fixed

- **`crossLinks`.** It counts restored file serials that the losing side also binds outside the unit:
  - a serial the side moved out of the unit, counted when the reverted tree binds it more often than the base does (a move inside the unit is reverted too, so it is not counted);
  - a serial the side changed in place while bound more than once.
- **The root directory** is in no unit.
- **A unit's own directory counts as a changed path** when its mtime moved, because adding or removing a name moves it. So `changedOurs` for "edit `nm/a`, add `nm/new`" is 3.

## Tests

`layerfs-content/tests/merge_units.rs`:
- admission refusals;
- unit coverage, below-matches, first-listed overlap and negation;
- a relink of 20 files under the unit counts no change;
- `decide_units` keeps ours on a tie and lists only both-changed units.

`layerfs-api/tests/merge_units.rs`, through `branch.merge`:

| §9 case | Test |
| --- | --- |
| §4 rows: unchanged, one side, both sides | `a_unit_one_side_changed_merges_as_today` (roots identical to no-units), `a_unit_both_sides_changed_comes_whole_from_the_later_side` (unit view equals theirs; outside edits merged) |
| tie keeps ours | `ours_is_kept_on_a_tie` (Workspace writes at 123 s on both sides) |
| deletion and kind change at the root | `deleting_or_retyping_the_unit_root_is_a_change` (three cases) |
| rename in, out and within | `renames_across_and_within_a_unit`, `a_directory_moved_out_of_a_lost_unit_is_restored_beside_its_move` |
| two patterns in one unit | `two_patterns_make_one_unit` (and as two units, both stand) |
| overlap, first listed wins | `overlapping_units_belong_to_the_first_listed` |
| cross-boundary hard link | `a_hard_link_across_the_boundary_takes_the_units_value` |
| identity-only relink | content test above |
| precedence | `a_unit_both_sides_changed…` (a text conflict without units, none with), `units_come_before_lww_rules_which_still_apply_outside` |
| result fields, truncation, record | `a_unit_both_sides_changed…` (fields, record via `list_commits`), `a_long_unit_list_is_truncated_by_its_byte_window` |
| admission | `malformed_units_are_refused_before_any_work` |
| golden | `units_that_decide_nothing_leave_the_root_byte_identical`; `MERGE_ORACLE` lines of `merge_root_oracle` equal between origin/main `bd8e545246` and this branch (below) |

No test was deleted and no assertion was weakened. The method golden changed
only by the two added keys on its two merge lines (checked line by line).

## Checks

- **Host** (macOS, `cargo +1.85.1`, `-j 2`, each binary under a 110 s alarm
  from its crate directory): all 147 test binaries of `layerfs-content`,
  `layerfs-history`, `layerfs-persistence`, `layerfs-bridge`,
  `layerfs-store-service` and `layerfs-api` pass, at the pre-rebase identity
  `c30f46f254` (the rebase onto `c0c7286491` brought README and test-only
  changes). Clippy `--all-targets -D warnings` on the same six crates is clean.
  The JS SDK's `test/trace.mjs` passes in all eight modes.
- **Byte identity without units** (the recorded merge fixtures). `replay_merges`
  replays all 42 `branch.merge` Commits of the range-15 Store (host copy,
  binding `54E0B6DC…`):
  - debug host binaries of origin/main `bd8e545246` and of this branch print the same 42 `REPLAY_MERGE` lines byte for byte;
  - all 42 are Merged, and 20 equal the recorded root, as at fix 041.

  `merge_root_oracle` is not used for this: its roots differ run to run on one
  build, because its fixtures carry the wall-clock time.
- **Linux** (pinned image `layerfs-307-fuser-patch-clippy:1.85.1`, `-j 6`, own volumes `layerfs-issue364-*`), at the code of the harness commit:
  - all 149 test binaries of the same six crates pass, each from its crate directory under a 110 s timeout;
  - Clippy `--all-targets -D warnings` on the six crates is clean.

  The first 120 binaries ran in QUIET gaps. On the user's instruction the
  rest, Clippy and the measurement ran while the ranges 21–30 run held QUIET,
  so they overlap its range commands as concurrent load. Clippy and the
  release harness build ran at `-j 6` while QUIET existed (about 15 s and
  41 s), before the rule that builds use `-j 2` under QUIET was set.

## Performance, without and with units

Linux, pinned image, release `replay_merges` (`686cee0967ab0be6`, SHA-256
`bed673a4…`), one sample per arm on a fresh copy of the r015 Store, all 42
recorded `branch.merge` Commits, Disposable/WAL/OFF,
`LAYERFS_CONSTRUCTION_WORKERS=1`. 1-minute load 10.98 (without) and 10.90
(with); QUIET held by ranges 21–30 during both.

- **Arms.** "Without" passes no `units`. This is main's path: an empty list skips the units step, and the 42 roots equal main's (byte identity above). "With" passes `node_modules` and `build` (`packages/*/*/lib`, `**/tsconfig.tsbuildinfo`).
- **Columns.** "Classify" and "revert" are the units step's two timing children. Whole-call ms and statements come from the harness: wall time and writer statements.

**The two merges that decide units** (both carry `node_modules` on both sides):

| Merge | Arm | ms | Statements | Classify ms | Revert ms | Unit decisions (changed ours / theirs → kept, dropped) | Stored bytes (canonical/stored/metadata) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 35 | without | 442.3 | 10,102 | — | — | — | 0/0/0 |
| | with | 761.0 | 61,178 | 370.0 | 199.2 | node_modules 5,480 / 238 → theirs, 5,480 dropped; build 7 / 303 → theirs, 7 dropped | 256,718/16,441/16,441 |
| 36 | without | 497.7 | 10,678 | — | — | — | 0/0/0 |
| | with | 971.6 | 60,542 | 440.5 | 120.5 | node_modules 5,480 / 238 → ours, 238 dropped; build 309 / 380 → ours, 380 dropped | 532,077/39,358/39,358 |

- **The cost on these two.** The units step adds 319 and 474 ms and about 50,000 statements. Most of it is classification: two walks of 5,700+ changed paths, each named through the binding hints, and an mtime read per changed path. The revert-to-base step is 120–199 ms. The merge itself on the reverted inputs is not slower.
- **Why stored bytes are 0 without units.** The replay Store already holds the recorded merge results, so the without arm writes nothing new. The with arm's bytes are its new result plus the reverted side's own tree (see Limits).

**The 40 merges that decide nothing:**
- Classification still runs on both sides. It adds a median of 4.9 ms per merge, a maximum of 27.1 ms on merge 29, and 25–2,232 statements.
- 20 of the 40 add more than 5 ms. All 20 are mid-size merges (675–1,033 statements without units).
- Their roots and stored bytes equal the without arm's.

| Total (42 merges) | ms | Statements |
| --- | --- | --- |
| without | 1,566.1 | 42,048 |
| with | 2,657.4 | 170,522 |

**Judged against the 5 ms floor**, units cost more than today:
- **Merges that decide a unit:** 0.3–0.5 s more on a big `node_modules`, as the liaison expected. About 70% of that is classification, not the revert.
- **Merges that decide nothing:** 5–27 ms more on mid-size merges. This applies only to a call that passes `units`; a merge without units is unchanged.

A possible next step, not built: classify one side first and skip the other
when that side changed no unit. That removes the second walk wherever only
one side touches the units.

Receipts: this session's scratch `out/f057/m/{plain,units,build}.txt`,
Linux test summaries `out/f057/lx/sum-g-*.txt`, Clippy `out/f057/lx/clippy.txt`.

## Limits

- **Orphan objects.** A reverted side's own new objects (rebuilt directories, the reverted root) are written into the merge's Save. They stay there when the merged root does not use them.
- **Full walks.** Classify and revert each walk the whole trees when a side changed more than `MAXIMUM_CHANGED` (65,536) inodes or bindings are missing. A relink of a large `node_modules` is that case, and costs one full walk per side.
- **Restored beside the move.** A directory the losing side moved out of a lost unit is restored under a fresh serial beside the move. The moved copy stays outside the unit, so the merge keeps both.
- **Classification costs every merge that names units.** A merge that names units classifies both sides even when it decides nothing. On the recorded merges that costs a median of 4.9 ms and up to 27 ms (below).

## Addendum 1 · cutting the units step (2026-10-20)

The liaison asked to cut the units step before the #352 switch-over:
- a merge with units that decides nothing should cost under 5 ms more;
- the `node_modules` merges should come down as far as cheaply possible.

**Where the time goes.** Host release run of merges 29, 35 and 36, with diagnostics not kept:

| Part | Share or size |
| --- | --- |
| Building each side's change plan (`Plan::make`) | 80–95% of classification |
| — the inode-table difference | about half of the plan |
| — verifying each changed inode's recorded bindings against the tree (directory lookups) | most of the rest |
| — the catalog hint queries | small |
| The walk and the unit pattern match | 1–35 ms |
| mtime reads | ≤ 0.2 ms, even over 5,480 changed paths |

The liaison's three items, against that profile:
1. **mtimes only for two-sided units:** would save at most 0.2 ms. Not built.
2. **Ours first:** built. Ours is classified first. When ours changed no unit, no unit can be two-sided, so theirs is not classified at all. Theirs is still classified whenever ours changed a unit, because its latest write decides.
3. **Revert only where needed:** already true. Only a side that lost a two-sided unit is reverted, only inside those units. A merge with no two-sided unit writes no reverted tree: its stored bytes equalled main's on all 40 such merges in both samples.

**Measurement.** Linux, pinned image, release `replay_merges` (SHA-256
`f83eac3c…`, built at `-j 2` under QUIET), one sample per arm on a fresh copy
of the r015 Store, the same 42 merges and units. 1-minute load 13.9–14.2,
with QUIET held by ranges 21–30.

| | Before (first sample) | After |
| --- | --- | --- |
| Extra ms on the 40 merges that decide nothing: median / max | 4.9 / 27.1 | **1.8 / 18.4** |
| Of those, above 5 ms | 20 | **15** |
| Extra statements on those 40 | 25–2,232 | 12–1,692 |
| Median classification ms on those 40 | 14.2 | 5.8 |
| Merge 35, without → with units (ms) | 442 → 761 | 409 → 837 |
| Merge 36, without → with units (ms) | 498 → 972 | 457 → 942 |
| Total, 42 merges, without → with units (ms) | 1,566 → 2,657 | 1,419 → 2,502 |

- Merges 35 and 36 change `node_modules` on both sides, so both sides are classified as before: classify 463 / 424 ms, revert 193 / 112 ms.
- **Not met:** under 5 ms on every merge that decides nothing. The 15 that still exceed it are merges where ours changed a unit (theirs is then classified too), or where ours alone has enough changed inodes.

**What remaining cuts need.** Each needs a decision before it is built:
- **Name changed inodes from recorded bindings without verifying them.** Bindings are recorded for every saved tree and never removed, so an inode none of whose recorded ancestries touches a unit cannot be in one. This holds only where every binding of both trees was recorded, which a Store older than the binding table may not satisfy.
- **Share the base → ours difference with `merge_roots`,** which already computes it.

**Checks.**
- Host: the api merge suites (`merge_units`, `sdk_method_golden`, `merge_by_serial`, `merge_root_oracle`, `merge_metadata_only`, `merge_mixed_forms`, `sdk_merge_paths`) pass, and Clippy on store-service and api is clean.
- Linux, `-j 2` under QUIET: the 46 test binaries of store-service and api pass, and Clippy is clean.
- No test added: skipping theirs changes no result, only the work.

Receipts: this session's scratch `out/f057/m2/`, `out/f057/lx2/`.

## Addendum 2 · the residual cost is accepted (2026-10-20)

A second host profile, release, merges 29 and 35, diagnostics not kept:
- **Locate and verify.** The remaining cost of classifying one side is locating its changed inodes: verifying each one's recorded binding in its parent directory, mostly cold directory pages. It takes 95 ms for 325 inodes on merge 29 and 449 ms for 6,648 on merge 35. `merge_roots` never reads these pages for a change only one side made.
- **Sharing the difference saves nothing.** `merge_roots`'s own base → ours inode difference costs 0.1–0.8 ms. The same difference inside classification costs 56–133 ms only because it runs first and pays the cold inode-page reads; repeated warm, 6,648 inodes take 2.3 ms. Sharing would move the cold reads, not remove them.
- **Unverified bindings were rejected.** Recorded bindings are global across Branches and may be stale or, on older Stores, incomplete. Trusting them could name a path wrongly without notice.

**Decision** (liaison, under owner delegation): accept `74b443672b` as is (median +1.8 ms, max +18.4 ms on merges that decide no unit) and stop optimizing. Units are opt-in, and where they apply they replace a relink and rebuild that cost seconds.

**Possible future change, not planned:** units given as directory paths instead of globs. Membership would then follow from paths the walk already holds, with no naming of one-sided changes.

