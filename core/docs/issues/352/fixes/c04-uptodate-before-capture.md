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

## Callers of `CommitSuccess.capture` (liaison condition 1)

`capture` is `None` only for this answer. Every reader at `140951351` and
later:

| Reader | Handling |
| --- | --- |
| `store-service store/commit.rs` | Builds the value: `retained.capture`, which the shortcut leaves `None`. |
| `store-service store/settle.rs` | Reads `CommitFailure.capture`, a different type that was already an `Option`. Unchanged. |
| daemon control reply (`control/operations.rs`, `control/types.rs`) | Carries `CommitSuccess` whole and never reads `capture`. The reply is built from `history`. |
| daemon telemetry and trace | Never read `capture`. Phases are timed by name (`uptodate.state` and `uptodate.head` are new). |
| SDK (`sdk/js/native`), operator, `examples/store_accounting` | Never read `capture`. |
| `daemon tests/mounted_commit_failures.rs` | An explicit `let Some(capture) = … else { panic!(…) }`: a Committed answer always captured. |
| `daemon tests` `store_commit`, `mount_control`, `support/mounted_commit.rs` | `is_none()` / `is_some()` assertions. |

No product code unwraps it.

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

## In-flight and orphan cases (liaison condition 2)

The state is read by one owner job under the Workspace's lock, the same lock
every overlay mutation job holds. There are three cases:

- **A published mutation.** It is counted. Each namespace or data job writes
  its rows, calls `put_inode` (so a data write always has an active inode
  row), and calls `settle(…)` within one atomic job. `settle` updates the
  dirty counters and issues the reply ticket together
  (`overlay namespace/inode.rs` `settle`, `namespace/compound.rs`). So a
  mutation whose reply has not been sent yet already has non-zero counters,
  and the shortcut is refused.
- **A mutation mid-job.** It cannot be observed half-done: the state job runs
  wholly before or wholly after it.
  - Before: it is a later mutation. The normal path treats it the same way,
    because capture seals only published rows.
  - After: it is counted, as in the first case.
- **A request not yet at the owner** (in the kernel or the FUSE queue). It is
  published after the state read, so it is a later mutation for this Commit,
  exactly as for a capture.

A mutation that changes no row leaves nothing to commit, so UpToDate is
true.

The shortcut does not check pending reply tickets directly. No owner call
exposes them without editing the RCA agent's `store-service overlay/*`. They
imply non-zero counters, as shown above. The full path's capture waits for
tickets (`Readiness::Capture`) only to order replies, not to find changes.

**Orphans** (unlinked, still-open files):
- An orphan created since the installed floor keeps its active inode row
  (`nlink` 0), so it is counted.
- An orphan of an earlier generation is held only for its readers. It is not
  a change to the namespace, and the full path would not commit it either.
- `base_readers` counts readers, not changes.

**Test:** `store_commit::a_mutation_racing_an_unchanged_commit_is_never_lost`.
- Setup: 16 rounds. In each round a thread writes while the product
  `commit_captured` runs, the two started together by a barrier.
- Each round accepts only three outcomes:
  - a shortcut UpToDate, after which the next Commit is `Committed`;
  - a `Committed` that captured the write;
  - an UpToDate that captured, after which the next Commit publishes the write.
- After every round, a further Commit must be the shortcut. That proves
  nothing is left uncommitted.
- At the end, a fresh bind reads the last write.
- Host result: pass. All 16 rounds took the shortcut, with the state read
  before the write. The test does not sleep to force the other order; the
  captured order is covered by
  `captured_rows_or_a_moved_head_never_take_the_uptodate_shortcut`.

## A moved head (liaison condition 3)

**If the head moved, the full path runs.** The shortcut answers only when the
head and base layer read outside the lane equal the bound ones. In that case:
- the Workspace's base stays the bound H0, and H0 is the head at the read;
- nothing is captured, saved, published or installed;
- the binding does not change.

When the head has moved, even a Workspace with no changes takes the normal
path. It merges an empty candidate into the head and installs the head, so
the Workspace follows it. Answering UpToDate there would leave the Workspace
on H0 while reporting the new head as its state.

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
| `store_commit::a_mutation_racing_an_unchanged_commit_is_never_lost` (16 barrier-started rounds; see "In-flight and orphan cases") | pass (no shortcut exists) | pass |
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
- `store_commit`: 10/10;
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
