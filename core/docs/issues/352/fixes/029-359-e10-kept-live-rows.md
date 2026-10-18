# #359 · E10: a row kept live for an mtime-only change is not counted dirty

| | |
| --- | --- |
| Trigger | Record 022 follow-up. `keep_live_row` (§4.8 option A) counted its carried row as one dirty inode. Liaison 2026-10-19: E10 approved as proposed. It is a journaled `kept_live` set; every active-row writer of a kept serial clears it and counts dirty +1; Capture clears it. No schema or format change. It goes on `issue359-impl` without c04, and comes before the rm -rf prototypes, because it fixes a correctness bug |
| Kind | code path only (overlay). No schema, format or telemetry shape change |
| Bug | **BUGS.md F-048**: after an mtime-only Commit, an Unmount without `discard` was refused |
| Commit | `9bee52d27` on local branch `issue359-impl` (not pushed) |
| Production LOC | 98479 → 98500 (+21) |
| Status | fixed; verified by tests and revert checks. The c04 interplay was verified once on a scratch branch, since deleted. No performance sample: the change adds an in-memory map check to inode row writes and changes no request, statement or transaction count |

## Problem

`keep_live_row` carries a captured row into the active generation so the
mount keeps its own mtime (§4.8 option A, record 022). It counted that row
with `dirty_counts(1, 0)`. Two consequences:

- `control/dirty.rs` reads `dirty_inodes`. After an mtime-only Commit, an
  Unmount without `discard` answered `Dirty { paths: ["/src/main.rs"],
  inodes: 1 }`. This is a real refusal of a clean Workspace: §4.8 says the
  live time ends at unmount and is not an uncommitted change. Filed as
  **F-048**.
- c04's UpToDate shortcut needs `dirty_inodes == 0`, so it could never
  apply after an mtime-only Commit.

Not counting the carried row raises the opposite risk. A carried row is
already active, so `put_inode_domain` reports a later write of that serial
as "no row added", and nothing counts it. With c04, that write would be
answered UpToDate and lost. So every writer must count a kept serial.

## Change

- `OpenState.kept_live: JournalMap<i64, ()>` (`open/kernel.rs`). It is
  committed and rolled back with every atomic job, beside `orphans`. It
  lives in daemon memory with the rest of the open state. Its size is the
  number of serials carried for mtime-only changes since the last Capture.
- `keep_live_row` (`namespace/inode.rs`) puts the serial in the set instead
  of counting it. The revision bump is unchanged.
- `Overlay::unkeep(serial)` removes a kept serial and reports whether it was
  kept. Each writer calls it, then counts the serial once.
- `Capture` (`lifetime/generation.rs`) clears the set. The kept rows freeze
  with the captured generation, and construction carries them again.

### Every writer of an active row (the proof list)

Missing a writer here means a lost edit under c04. Sources at `9bee52d27`.

| # | Writer of an active-generation row | Path to the row | Counts a kept serial |
| --- | --- | --- | --- |
| 1 | `put_inode_domain` (`namespace/inode.rs`): the only INSERT/UPDATE of an active `fs_inode` row | — | yes: `(!active && !orphan) \|\| unkeep` |
| 2 | Compound job (`namespace/compound.rs` `apply_checked`): every inode in `changes.inodes` | `put_inode_domain` | via 1 |
| 3 | Payload cell (`changes.cell`): `put_cell` on the layer of the same serial | `layer(serial)` from `put_inode_domain`; ownership pre-checked in `check_changes` ("compound cell owner") | via 1 |
| 4 | Data write (`changes.write`): `write_cells` or `write_claimed` (pieces: `put_piece`) | the same `layer(serial)`; ownership pre-checked ("compound write window") | via 1 |
| 5 | Truncate and extend: the new size in `put_inode_domain` (`shrink` below the old size) | inside 1 | via 1 |
| 6 | setattr (mode, times), link, unlink, rename and every other namespace job: final inode values in `changes.inodes` | `put_inode_domain` | via 1 |
| 7 | First-path `publish` (`namespace/inode.rs`): inode, optional name, optional cell | `put_inode`, then `put_cell` on its layer | via 1 |
| 8 | `keep_live_row` itself | `put_inode`, before the serial is kept; it returns early when the row is already active | not applicable |
| 9 | Consolidation of a failed capture into an existing active row (`lifetime/composition.rs`): `transfer_row`, `transfer_piece` and the `inherited_cutoff` UPDATE on the active top | the active top, not `put_inode_domain` | yes: `unkeep`, then `dirty_counts(1, 0)` |
| 10 | Consolidation when no active row exists | `put_inode`, then `dirty_counts(1, 0)` | counted already |
| 11 | Orphan domain (generation −1): `lifetime/orphan.rs` INSERT, `maintenance/orphan.rs` transfers and deletes | not an active row; a kept serial is a row of the view | not applicable |
| 12 | Directory entries (`fs_entry`): `bind_name`, `DIRECTORY_ENTRY_PUT/DROP` | counted by `dirty_directory_entries`, which `kept_live` does not touch | not applicable |
| 13 | Garbage and retirement (`maintenance/garbage.rs`): deletes rows of retired generations | never the active generation | not applicable |

A rename writes names and the parent directories' rows, not the moved
file's row. A kept file that is only renamed therefore keeps its base row
in history, as §4.8 specifies, and the Commit is still taken (its name rows
count). The c04 run below checks this case.

## Tests (on `issue359-impl`)

New `layerfs-overlay` `tests/kept_live.rs`:

| Test | Checks | Revert check |
| --- | --- | --- |
| `a_kept_row_is_not_counted_dirty` | `dirty_inodes` stays 0 after keeping a file row and a directory row | old `keep_live_row` (counts dirty): fails |
| `every_writer_of_a_kept_serial_counts_it_once` | each case from a fresh engine. Ten writers, each counting `(inodes, entries)`: write (1,0), truncate (1,0), extend (1,0), chmod (1,0), touch (1,0), payload cell (1,0), link (1,1), rename in the kept directory (1,2), unlink of the file in the kept directory (2,1), first-path publish with a cell (1,0) | `put_inode_domain` without `unkeep`: **all ten** count 0 inodes. Old `keep_live_row`: nine count 2 |
| `a_kept_serial_is_counted_once_and_others_as_before` | two writes of the kept serial count 1; a created serial counts 1 more | `put_inode_domain` without `unkeep`: fails |
| `a_failed_job_restores_the_kept_set` | a compound job writes the kept file, then fails inserting a `created` serial that already has an active row. Nothing is counted, and the next writer of the kept file counts it | `kept_live` not rolled back: fails |
| `folding_a_failed_capture_into_a_kept_row_counts_it` | after `resolve_failed_capture` and maintenance, the fold counts both kept rows (`dirty_inodes` 2) | consolidation without `unkeep`: fails (0) |

New `layerfs-daemon` `mounted_commit`
`an_unmount_without_discard_succeeds_after_an_mtime_only_commit`:

- `touch -d` beside a real edit, then a Commit, then an UpToDate Commit;
- `Unmount { discard: false }` answers `Unmounted`, and the mount entry is
  gone;
- revert check (old `keep_live_row`): `Dirty { paths: ["/src/main.rs"],
  inodes: 1, entries: 0 }`.

The Capture clear changes no count: a stale entry only repeats a count
that the row's insert makes anyway. It bounds the resident set, and is
covered by source, not by a test. `OpenStateCounts` is unchanged, because
its fixed `values()` order is read by daemon telemetry (#333).

## c04 interplay, once, on a scratch branch

| | |
| --- | --- |
| Branch | `e10-c04-scratch`: `issue359-impl` `9bee52d27` + `140951351` (as `67f7ce52c`) + `7238e4551` (as `6e51ffee7`), both clean cherry-picks, + `75bfde677` (the scratch test below). Head `75bfde677`. Local only, never pushed, **deleted** after the run |
| Production LOC | 98500 → 98533 (+33, c04's own) |

The c04 tests, run once:

| Target | Result |
| --- | --- |
| `store_commit` | 10 of 10, including `an_unchanged_workspace_answers_uptodate_without_capture_or_save`, `captured_rows_or_a_moved_head_never_take_the_uptodate_shortcut` and `a_mutation_racing_an_unchanged_commit_is_never_lost` |
| `concurrent_commits` | 3 of 3 |
| `mounted_commit_failures` | 4 of 4 |
| `mount_control` | 9 of 9 |
| `forced_producers` | 4 of 4 |
| `mounted_commit` | 8 of 10 (below) |

The two `mounted_commit` failures:

- `r5_9_stores_through_shared_mappings_are_committed_once_written_back`:
  the F-046 Busy unmount at `support/mounted.rs:133` (`unmount:kernel`,
  "kernel reported the mount busy; no terminal effect"). This is its fourth
  occurrence, and it is not rerun as a pass.
- `e10_c04_a_kept_row_takes_the_shortcut_and_every_later_writer_is_committed`
  (scratch test): **a wrong expectation in the test, not a product fault.**
  It compared each published root with the live view. In the `rename`
  round, the kept file's mtime is not written by `mv`, so history keeps its
  base time, as §4.8 specifies: 2 differing paths, both mtime only
  (`src/hard.rs` and `src/moved.rs`, one inode). The test was corrected to
  compare against `committed_view`, and the corrected test was run once:
  **passed**, with all six writers committed after the shortcut.

The scratch test, per writer:

1. `touch -d` the file;
2. a Commit that is UpToDate and keeps the row;
3. a second Commit, which must answer UpToDate **with no capture**;
4. the writer: append, `truncate -s 3`, `chmod 0600`, `ln`, `mv`, `rm`;
5. a Commit that must publish, with its parent and its root equal to the
   committed view.

**Revert check under c04:** `put_inode_domain` without `unkeep`. The first
writer (append) was answered by the shortcut ("append: the product
constructor did not run"). That is the lost edit the writer list guards
against.

Source of the scratch test, kept for integration with c04 (it needs
`CommitSuccess.capture: Option<Capture>` from `140951351`):

```rust

/// E10 with c04 (scratch branch only): a row kept for an mtime-only change
/// lets the next Commit answer UpToDate before capture, and each writer of
/// that file afterwards is committed, never answered by the shortcut. Each
/// root equals the committed view: a writer that does not write the file's
/// row (rename) leaves its mtime-only part out of history (§4.8).
#[test]
fn e10_c04_a_kept_row_takes_the_shortcut_and_every_later_writer_is_committed() {
    let rig = Rig::new("e10-c04");
    let ready = rig.mount(1);
    let mount = root(&ready);
    let writers = [
        ("append", "src/main.rs", "printf 'more\\n' >> src/main.rs"),
        ("truncate", "src/main.rs", "truncate -s 3 src/main.rs"),
        ("chmod", "src/main.rs", "chmod 0600 src/main.rs"),
        ("link", "src/main.rs", "ln src/main.rs src/hard.rs"),
        ("rename", "src/main.rs", "mv src/main.rs src/moved.rs"),
        ("unlink", "src/moved.rs", "rm src/moved.rs"),
    ];
    let mut head = None;
    let mut committed = rig.base.clone();
    for (round, (what, path, script)) in writers.iter().enumerate() {
        let touch = format!("touch -d '2003-03-0{} 03:03:03.3 UTC' {path}", round + 1);
        passed(&bash_in(COMMAND, mount, &touch), "an mtime-only edit");
        rig.up_to_date(ready.token, &format!("{what}: the mtime-only Commit"));
        let done = rig.commit(ready.token).unwrap();
        assert!(
            done.commit.as_ref().unwrap().capture.is_none(),
            "{what}: the kept row alone takes the shortcut"
        );
        assert!(
            matches!(
                done.reply,
                layerfs_bridge::control::Reply::Committed(
                    layerfs_history::CommitOutcome::UpToDate { .. }
                )
            ),
            "{what}: {:?}",
            done.reply
        );
        let before = model::inode_numbers(mount);
        passed(&bash_in(COMMAND, mount, script), what);
        let record = rig.committed(ready.token, what);
        if head.is_some() {
            assert_eq!(record.parent, head, "{what}");
        }
        head = Some(record.id);
        let published = rig.published(record.root);
        let expected =
            model::committed_view(&host(mount), &model::inode_numbers(mount), &committed, &before);
        assert_same(&expected, &published, what);
        committed = published;
    }
    println!("E10-C04 writers={} all committed after the shortcut", writers.len());
    rig.unmount(&ready);
    rig.finish();
}
```

## Checks on `issue359-impl` at `9bee52d27`

All runs used the pinned image, the Disposable Store and
`LAYERFS_CONSTRUCTION_WORKERS=1`, each command ≤120 s, with the test
binaries built first.

- `layerfs-overlay` + `layerfs-workspace` + `layerfs-store-service`: 270
  passed, 0 failed (265 before, plus 5 new).
- `layerfs-daemon`: 30 targets, all passing in full:

  | Target | Passed |
  | --- | ---: |
  | `mounted_commit` | 9 |
  | `mounted_install` | 4 |
  | `r5_5_install_survival` | 4 |
  | `kernel_coherence` | 6 |
  | `kernel_mutation` | 2 |
  | `kernel_custody` | 2 |
  | `mounted_links` | 1 |
  | `mounted_cycles` | 4 |
  | `r5_1_actual_daemon_commit` | 1 |
  | `host_install` | 3 |
  | `mounted_rewind` | 1 |
  | `mounted_patterns` | 1 |
  | `mounted_parallel_commits` | 1 |
  | `store_commit` | 7 |
  | `mounted_execute` | 1 |
  | `negative_entries` | 2 |
  | `mounted_listing_reads` | 1 |
  | `mounted_drain` | 1 |
  | `mounted_concurrency` | 5 |
  | `mounted_serial_admission` | 4 |
  | `workspace_databases` | 2 |
  | `r5_9_dirty_mapping` | 1 |
  | `installed_store` | 3 |
  | `r5_10_producer_profile` | 1 |
  | `mounted_commit_failures` | 4 |
  | `mount_control` | 9 |
  | `fp27_reader_health` | 1 |
  | `mounted_failure_scope` | 2 |
  | `fp31_forget_underflow` | 2 |
  | `kernel_mount` | 3 |

- clippy `-D warnings` (overlay and daemon, all targets) is clean, and
  rustfmt is clean.
- No test was deleted.

## Supersedes

Record 022's "it bumps the revision and counts one dirty inode", and its
`captured_namespace_holds` reading. The row is still carried and re-carried
each Commit; it is no longer counted dirty.

## Production LOC

98479 → 98500 (+21) for `9bee52d27`. `tools/production_loc.py --root` on
`git archive` of the parent and the committed tree: core 89797 → 89818,
sdk 2635, dsh 6047, reference absent (retired R9c; last counted 65,417 at
tree `498dd1917812`). This record is docs only: 98500 → 98500 (delta 0).
