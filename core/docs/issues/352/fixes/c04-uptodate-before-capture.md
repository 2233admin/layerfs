# c04 · UpToDate before capture: an unchanged Workspace skips capture, Save, lane and install

> **Status:** implemented on branch `issue352-uptodate` (correctness lane,
> 2026-10-18), cut from `claude/issue353-lineage-cap-ec7c49` at `d37821838`.
> Not merged; integration is the owner's decision. Kind 1 (no format change).

## Change

Before this change, a Commit of an unchanged Workspace ran the whole path:
- capture (seal the active generation);
- open the producer;
- begin a Save;
- construct (a full walk of an empty capture);
- read the head;
- the logical count;
- finish;
- the binding hints;
- the publication lane, then a second head read;
- validate (`checked_base`, `prepare_base_install`);
- `commit_branch`, which answers `UpToDate`;
- install the same root.

`BoundWorkspace::commit_admitted` (`store-service store/commit.rs`) now
answers first, when all of these hold:

| Condition | Source |
| --- | --- |
| no inode row and no name row in the active generation | `WorkspaceState.dirty_inodes == 0 && dirty_directory_entries == 0` |
| no capture in flight and no failed capture still folding | `captured.is_none() && consolidating.is_none()` |
| the overlay's base is the bound local root | `state.base_root == local` |
| no installed conflicted merge pending | `pending_conflicts().is_none()` |
| the Branch head and base layer equal the bound ones | one `branch_snapshot` read, outside the lane |

It answers `CommitOutcome::UpToDate { head, root }` with the head and root it
just read, and does nothing else:
- no capture, producer or Save;
- no lane;
- no install;
- the binding is not changed.

The state is read with the existing `OwnerClient::state` job (one in-memory
read, under the Workspace's lock). The overlay is not changed.

If any condition fails, the Commit continues on the unchanged full path.

`CommitSuccess.capture` becomes `Option<Capture>`, which is `None` for this
answer. `saved` and `storage` are zero. `namespace` is `None`, since no
constructor ran.

## Why "no rows above the installed floor" is exact

The dirty counters are the overlay's own count of rows in the active
generation:
- a mutation that adds an inode or name row calls `settle(…)` or
  `dirty_counts(…)` (`overlay namespace/inode.rs`, `lifetime/composition.rs`);
- dropping a name row in the active generation subtracts it;
- capture resets both counters as it seals the generation.

The daemon's `dirty` report (`daemon control/dirty.rs`) uses the same test to
report a clean Workspace. Every content change writes an inode row, because
size and mtime change. A failed capture's rows sit in a generation that is
neither active nor installed until FOLD moves them back. The shortcut
therefore requires `consolidating.is_none()` and `captured.is_none()`, so
those rows can never be missed.

## Race argument

The answer reads two things at different moments:
- t1: the overlay state, one atomic owner job;
- t2: the Branch head, one read outside the lane.

The head can move after t2, and the Workspace can change after t1.

1. **Changes after t1.** The full path behaves the same way: Commit captures
   the published frontier at its capture point, and anything published later
   is a later mutation that the next Commit takes. Here t1 plays the part of
   the capture point. A mutation published before t1 is in the counters, so
   no shortcut is taken. Admission (`committing`) stops a second Commit on
   the same Workspace, which is the only thing that resets the counters
   between t1 and t2.
2. **The head moves after t2.** The full path also reads the head and then
   publishes against it. Its answer is true at the moment it publishes, and
   any later Commit by another Workspace is ordered after it. Here the answer
   is fixed at t2:
   - the Workspace's content is the bound root, by step 1;
   - the head is the bound head, read at t2;
   - so the Branch describes the Workspace at t2.

   This is exactly what `commit_branch` would answer for an empty candidate
   published at t2: `UpToDate`, with no record. A head that moves after t2 is
   a later Commit. The next Commit of this Workspace then sees a moved head,
   does not take the shortcut, and merges as before.
3. **The head moved before t2.** The shortcut is refused. The full path runs
   and follows the head (merge and install), as before. This is tested.
4. **Unchanged content with rows.** For example, a file rewritten with its
   own bytes. The counters are not zero, so the full path runs and
   `commit_branch` decides, as before. The shortcut never reports `UpToDate`
   when any row exists.

Nothing is retried, and no lock is added.

## Tests

| Test | Without the shortcut | With it |
| --- | --- | --- |
| `store_commit::an_unchanged_workspace_answers_uptodate_without_capture_or_save` (constructor `unreachable!()`; `UpToDate` with the bound head and root; no capture; zero Save; binding unchanged; the next change still Commits) | **FAIL** (the constructor ran) | pass |
| `store_commit::captured_rows_or_a_moved_head_never_take_the_uptodate_shortcut` (rows give a constructor run, a capture and `Committed`; a clean Workspace whose head another Workspace moved still captures and follows the head) | pass | pass |

Adapted tests, with the reason and what each now asserts:
- `store_commit::a_held_producer_…`: holds a producer, so it first writes a
  change. Before, it held a constructor on a clean Workspace.
- `mount_control::product_control_commit_…_is_then_up_to_date`: the unchanged
  repeat now asserts no constructor, no capture and a zero Save. Before, it
  asserted that both owners were released by a constructor run.
- `support/mounted_commit.rs::Rig::up_to_date`: a Commit that captured keeps
  the full `receipt` check. One that did not capture asserts no constructor
  and a zero Save.
- `forced_producers::fp32` (caller-constructor case): rewrites `README.md`
  with its own bytes, so the held constructor has a capture. Its outcome check
  is unchanged.
- `mounted_commit_failures.rs:754`: `capture` is now an `Option`.

No assertion was weakened, and no test was deleted.

**F-008 `concurrent_commits`** (unchanged): Linux 3/3 pass.

### Linux results (pinned image `378b799ef433`)

All of the following pass:
- `store_commit`: 9/9;
- `mount_control`: 9/9;
- `mounted_commit_failures`: 4/4;
- `r5_1_actual_daemon_commit`: 1/1;
- `forced_producers`: 4/4;
- `kernel_application`: 1/1;
- `mounted_cycles`: 4/4.

`mounted_commit` 6/7 and `r5_5_install_survival` 3/4 fail only at their
`rig.history()` page assertions (`mounted_commit.rs:638`,
`r5_5_install_survival.rs:858`). Their `up_to_date` calls pass. This is the
pre-existing single-page defect of `Rig::history`. It is fixed by c02
(`bb19d9d7d`, branch `claude/issue352-correctness-644bbc`), which is not on this
branch's base. With c02 the same suites passed 7/7 and 4/4.

Host: `store_commit` 9/9. `cargo check --workspace --tests` is clean.

## Timing (diagnostic; one sample per arm)

An in-process probe uses `store_commit`'s fixture: a real Store (Disposable),
a real owner, release build, and Linux in the pinned image. It times
`commit()` alone. The probe source is
`~/lfs-history/runs/issue352c-uptodate/zz_uptodate_timing.rs`; it is not
committed. The old arm is the same tree with the shortcut block removed. Host
load was 5.5–6.1 for all four runs, with other lanes' containers running.

| Case | Old | New |
| --- | --- | --- |
| unchanged Commit, first after bind | 4,247 µs | **50 µs** |
| changed Commit, after that Commit | 1,332 µs | 7,623 µs (confounded: see below) |
| changed-first case: first changed Commit after bind | 6,492 µs | 5,157 µs |
| changed-first case: second changed Commit | 964 µs | 1,324 µs |

How to read it:
- **The unchanged case is the target.** It drops from 4.2 ms to 0.05 ms, an
  85× improvement.
- The "after that Commit" row is confounded. In the old arm, the unchanged
  Commit opened the producer and the changed Commit reused it. In the new arm,
  the unchanged Commit opens nothing, so the changed Commit pays the producer
  open. This is order, not cost, and is why the changed-first case was run as
  a separate case.
- What the shortcut adds to a changed Commit is the one `state` job; the head
  read is not done unless the Workspace is clean. The whole unchanged answer,
  `state` job plus head read, took 50 µs in the same probe. That bounds the
  added cost. The 964 → 1,324 µs difference of single samples at load ~6 is
  not attributable to it. No speed claim is made for changed Commits.

Binaries (`sha256`, in `old.txt`, `new.txt` and `changed-first-*.txt`):
- `zz-old` `fe6762bf…`
- `zz-new` `68689d41…`
- `zz2-old` `1b37eeab…`
- `zz2-new` `b5024041…`

Storage: unchanged. The shortcut writes nothing, and a changed Commit stores
exactly what it did before.

## Not done

- No mounted replay range or `dsh` Commit-rate measurement.
- The daemon's per-tool-call Commit cadence would gain most from this change,
  because an agent's read-only calls Commit nothing. That gain is not measured.
