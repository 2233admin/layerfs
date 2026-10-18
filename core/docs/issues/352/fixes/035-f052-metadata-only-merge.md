# F-052 · a chmod is lost when the other side edits the same file

| | |
| --- | --- |
| Trigger | Owner, 2026-10-19: a metadata-only change (chmod or touch) on one side and a content edit of the same file on the other must merge to the edited content with the changed mode, without a conflict |
| Kind | code path (merge decision). No data written differently except the merged value's metadata; no Store format change |
| Base | staging `d679c84ee` (`claude/dsh-352-integration-c98eb1`) |
| Commits | `b9d775734` (failing test); `6c66519aa` (fix, test corrections, docs); `e55b1ebed` (this record); its renumbering commit. The pushed messages of `b9d775734`, `6c66519aa` and `e55b1ebed` say F-051: the number was already taken (a kernel_coherence flake), and the bug is F-052. Branch `claude/issue353-metadata-merge` |
| Regression test | `layerfs-store-service/tests/merge_metadata_only.rs` (6 tests) |
| Recovery | none: merges are recomputed per call; no stored result is wrong in place |

## Old design

`merge/serial.rs` `result_value` merged a serial's metadata as one value.
When both sides' metadata differed from the base, it kept the decided
entry's metadata whole. A content edit always moves the mtime, so an edit on
one side and a chmod on the other both "changed the metadata". The decided
entry was the edit (the only content change), so its mode, the base mode,
won and the chmod was dropped without a conflict. The same held for a
hard-linked file (one serial, chmod through one name, edit through the
other) and for both stored metadata forms of #360 item 2.

Modes changed differently on both sides were also merged silently: the
decided entry's mode was kept and nothing was reported.

## New design

`merge/metadata.rs` `merged_metadata` (called from `result_value` when base,
`from` and `into` all hold the serial with one kind):
- When one side's metadata equals the base by value (`same_inode`, so a
  root-form and an inline-form copy of equal metadata are equal), the other
  side's is taken, as before.
- Otherwise mode and mtime merge separately, three-way each: a field one
  side changed takes that side's value; a field both changed takes the
  decided entry's.
- A file whose mode both sides changed to different modes is a `mode`
  conflict (new `ConflictKind::Mode`, wire string `"mode"`, bridge index 8).
  The decided entry's mode is kept: ours for a Branch merge, the Workspace's
  for a Commit, as for `binary`. Directories keep the existing rule (theirs
  kept, no conflict); a directory has no path at that point and is never a
  decision.
- The merged metadata reuses a stored form that already holds it (the
  decided entry's, then either side's). Otherwise it is written in the
  decided entry's form: inline as `InodeMetadata::Inline`, root form through
  `portable_root` over the decided root, which keeps its other attribute
  keys.

**mtime rule.** The edit's mtime is the newer change and is kept along with
the chmod. A touch (mtime only) against an edit takes the edit's mtime when
both moved it, the touch's when the edit kept the base mtime. An mtime-only
Workspace change is UpToDate at Commit (§4.8, record 022), so a touch reaches
a merge only through a Branch whose recorded value carries it; the test
`an_mtime_only_change_is_no_change_at_commit` pins that.

## Test

`merge_metadata_only.rs`. One side chmods `0644 → 0600`, the other rewrites
the file. Each case runs four routes:
- the SDK merge in both orientations;
- a Workspace Commit that merges with a moved head, both ways (the Workspace
  chmods while the head takes the edit, and the reverse).

Each route checks the content, `mode=600`, the edit's mtime and no conflict.

| Test | Stored form |
| --- | --- |
| `a_chmod_survives_a_content_edit_of_a_root_form_file` | root form, from `merge-forms-root.sqlite` |
| `a_chmod_survives_a_content_edit_of_an_inline_file` | inline form (written by this build) |
| `a_chmod_survives_a_content_edit_in_delta_stored_branches` | 400 files; asserts `branch_delta_applies ≥ 1` |
| `a_chmod_through_one_link_survives_an_edit_through_the_other` | `/h/one` and `/h/two`, one serial; checks both names |
| `chmods_to_different_modes_on_both_sides_conflict` | `0600` against `0700`: SDK both ways refuse with kind `mode`; the Commit reports `ConflictKind::Mode` |
| `an_mtime_only_change_is_no_change_at_commit` | UpToDate |

**Observed at `b9d775734` (old code):** 5 of 6 fail.
- The four chmod tests fail at the first route, `sdk-ce`, with `mode=644`:
  the chmod is lost.
- The both-chmod test merges without a conflict.
- The mtime test passes.

**After the fix:** 6 of 6 pass. Two test corrections went into the fix
commit, neither weakening an assertion:
- The two Commit routes used one Workspace id (83) in one Store. The second
  bind is refused with "duplicate incarnation", which the old code never
  reached. They now use 83 and 89.
- The both-chmod test now also asserts the conflict kind (`mode`).

## Results

- **Corpus.** The 35-merge replay (r14 Store, `replay_merges`) merges all
  35. 140 of 140 view files are byte-identical to the M1 × #360 set
  (`issue353-m1-360-equiv` `58329939b`, itself identical to the M1 set). No
  corpus merge has a serial where one side changed only the mode and the
  other only the mtime, so no result changed.
- **Suites.** content, persistence, bridge, store-service and daemon: 183 of
  185 test binaries pass. The two failures are the recorded environment
  ones: `huge_kernel_namespace` (needs `LAYERFS_Q1_PREPARED`) and
  `host_handoff` (needs the Linux binary).
- **Clippy.** `+1.85.1 --all-targets -D warnings` on content, bridge,
  store-service and daemon: clean.
- **Production LOC.** 102,246 → 102,319 (+73; core 93,559 → 93,632); counted with root
  `tools/production_loc.py --root` over `core/crates`, `sdk/js` and
  `dsh/packages` at both snapshots.
