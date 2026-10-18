# #355 — Merge at scale: fix notes

> **Status:** Fix record, written step by step on branch
> `claude/issue353-lineage-cap-ec7c49` (on top of #353). Owner decisions of
> 2026-10-18 govern. Measured figures are added with their receipts; nothing
> here is a measurement until it says so.

## Summary of decisions and commits (2026-10-18)

| Step | Commit | Decision | Production LOC |
| --- | --- | --- | --- |
| (a) A3 shown | `418819bd4` | a 70,000-file move was refused (`ordering backing`) past the in-memory build budget | 97,600 -> 97,600 (0)¹ |
| (b) Store scratch table | `e4c74f7c3` | merge state lives in the global Store's `merge_operation` / `merge_record` rows, owner-checked; no second database | 88,102 -> 88,851 (+749) |
| (b) Two-stage Commit merge | `e4c74f7c3` | heavy merge before the lane; inside it, only what landed since, bounded by `LANE_MERGE_PATHS` (1,024) | (same commit) |
| (c) Lane holds only the publish | `d472edef8` | Save finish, counts and hints move before the lane | 88,851 -> 88,882 (+31) |
| (c) Smaller-side building | — | dropped (owner): stage 1 names from ours and builds on theirs, so results stay identical | — |
| Batching | `b7d79b001` | record jobs go through a 256 KiB write-back buffer and windowed reads | 88,882 -> 88,972 (+90) |
| (e) F-041 | `d2fda2593` | a truthful `truncated` flag on a bounded list (not paging) | 88,972 -> 88,971 (−1) |
| (d) No path cap | `16a19429a` | sorted runs, a 16-way stream, ancestor stacks; 8 MiB held, then records | 88,971 -> 90,391 (+1,420) |
| #360 analysis | `40a713349` | strict `same_value` kept; proof stated for integration | 90,391 -> 90,391 (0) |
| Records and publish timing | `5d37e1a3c` | `branch.merge.publish` timed; docs, receipts | 90,391 -> 90,392 (+1) |
| M1 merge by serial | `9f0756466` | walk `from`'s changed serials, not candidate paths ([M1](#m1-merge-by-serial-owner-decision-2026-10-18)) | 90,392 -> 90,859 (+467) |
| M1 notes and samples | `f277f54e8` | equivalence, differences, old-vs-M1 timing | 90,859 -> 90,859 (0) |
| M1 (b) both directions | `05aca99a0` | a deletion against a move with an edit conflicts whichever side deleted | 90,859 -> 90,881 (+22) |
| M1 owner decisions | this commit | (a), (b), (c) approved; corpus scope; #360 note | 90,881 -> 90,881 (0) |

¹ Scope core+sdk+dsh; from `e4c74f7c3` on, core only (the pinned counter's
scope). The scopes are not comparable.

Deleted tests: none in any step.

**Where the brief was silent** (owner rule: results identical, lane work
independent of tree size, least new code, no cap):
- The written-path list stays bounded with a flag, not paged.
- `HELD_BYTES` is a constant 8 MiB, not tuned.
- The in-lane step keeps the resident route, bounded by `LANE_MERGE_PATHS`.
- The publish hold is measured by a timing phase, not a new counter in
  persistence.

## (a) A3 shown (`418819bd4`)

`tests/sdk_merge_scale.rs` moved a directory of 70,000 empty files on one
side and changed another file on the other. Before (b) the SDK merge was
refused `ResourceUnavailable { what: "ordering backing" }`: the merged root
was built on the in-memory update route without an ordering backing, and the
moved directory's new subtree did not fit its default budget.

## (b) The merged root is built on the backed route, over Store scratch rows

**Owner decision (2026-10-18).** The merge build's working state lives in a
scratch table in the global Store. No temp files, no second database and no
Workspace overlay. One path serves the SDK merge and the merge at Commit.

**What changed**

- `merge_roots` takes the caller's `IndexedConstructionBacking` and builds the
  merged root with `update_filesystem_streamed_backed`, the route Workspace
  Commit construction uses. The decided plan rows are a streamed source
  (`merge/rows.rs`); validation, topology and reference state go to the
  records, so no resident topology or ordering budget refuses the build.
- `layerfs-persistence` adds `MergeScratch` / `MergeRecords`
  (`storage/merge_records.rs`) over two tables (`sql/sqlite/merge_scratch.sql`):
  `merge_operation(operation, token, touched)` and
  `merge_record(operation, kind, key, value)`.
- `Store::merge_records` registers one merge, runs it, and removes its rows
  whether it succeeded, failed or was refused. Both callers use it
  (`sdk/branch.rs`, `store/commit_merge.rs`).
- **Two-stage merge at Commit (owner decision 2026-10-18; options "refuse
  `HeadMoved`" and "merge inside the lane" declined).** `store/commit.rs`:
  1. Before the lane, the head `H0` is read and the candidate merged with it
     (`merge_candidate`): paths named from the Workspace's changes, the result
     built on `H0` with merge records. All scratch writes happen here.
  2. In the lane the head is read again. If it is still `H0`, the result is
     published. If it moved to `H1`, `merge_in_lane` merges only the
     `H0`→`H1` changes into the result already built: a three-way merge with
     base `H0`, ours = that result, theirs = `H1`, its paths named from the
     `H0`→`H1` changes (`MergeInput::decide_from = Theirs`) and the result
     built on ours, in memory, with no merge records. Labels and `.lww` rules
     are the same as stage 1. The step's work grows with what landed in
     between, never with the tree.
  3. More than `LANE_MERGE_PATHS` (1,024) paths to decide is refused before
     any decision: `CommitError::LaneMerge { paths, limit }`, counted in
     `MergeCounters::lane_refused`; nothing is published and the Workspace
     keeps its changes. The whole merge is never re-run (no retries) and no
     large merge runs in the lane.
  4. A conflict in the step follows the ordinary rules: nothing is published,
     the merge with markers is installed locally and the binding moves to
     `H1`. A conflicted stage 1 publishes nothing, so it takes no step.
  `MergeReport::lane_paths` reports the step's decided paths;
  `MergeCounters` counts `lane_steps`, `lane_paths` and `lane_refused`.
  F-008's tests (`layerfs-daemon/tests/concurrent_commits.rs`) pass
  unchanged.
- Content side: `MergeInput` gains `decide_from` (whose changes name the
  paths; the result is built on the other side) and `bound` (refused
  `BoundedCapacityExceeded { what: "merge.bound" }` past it). `merge_roots`
  takes optional records; without them the merged root is built on the
  resident update route under its own budgets. Building on ours restates the
  picks (`build::onto_ours`) and revival treats an unpicked path as the build
  side's.

**Store change: kind 2 (additive).** `Session::add_merge_scratch` adds the two
tables to a Store written before them when its recorded schema is exactly the
earlier one, and records the new schema source; nothing existing is
rewritten. `add_binding_hints` and `add_lineage` now compare against the
schema without the merge tables as well. Read-only opens do not migrate.

**Ownership and cleanup**

- Every merge has an owner row with a random 16-byte token. Each read checks
  the owner and token in the same statement (the owner drives a `LEFT JOIN`, as
  the acquisition reads do), and each write checks them in the same
  transaction. A missing owner is `Missing`, never "record absent".
- The first failure ends a merge's record calls; `Store::merge_records`
  returns it beside the merge result, so the refusal names the persistence
  cause.
- `end` removes the merge's rows 4,096 per write transaction, then its owner.
- A writable open sweeps owners that made no call for `MERGE_LEASE`
  (10 minutes); a live merge refreshes its owner after 60 s without one. The
  sweep first revokes the token (one transaction), then removes rows a window
  at a time, then the owner. A merge that resumes after its sweep fails
  `Missing`. Several processes open the Store at once, so an open never removes
  a live merge's rows.

**Writer holds.** Every write transaction (registration, each guarded batch of
at most 64 records, refreshes and removal) is a separate short job through the
Store's one writer, outside the lane. `MergeRecordsWork` counts reads, writes,
total writer hold and the longest hold; `Store::merge_record_work` sums them
over the Store's merges. Measured figures: see the measurement section below
once recorded.

**Tests**

- `layerfs-persistence/tests/merge_records.rs`: records are per merge; guarded
  batches apply whole or not at all; key windows; `end` removes rows; a
  writable open sweeps only an idle owner, and that owner's later calls fail.
- `layerfs-store-service/tests/sdk_merge_scale.rs`: the A3 move of 100,000
  files (past the former 65,536-entry build budget, under the 262,144 path
  cap that (d) removes) merges, the merged tree holds the moved files and the
  other side's change, and no scratch rows remain; a conflicted merge also
  leaves none. The 2× and 10× runs need (d): at 2× (131,072 files) the merge
  names 262,144 candidate paths and is refused `merge.paths`.
- `layerfs-daemon/tests/lane_merge.rs`: a Commit held at the lane while
  another Commit lands is merged in the lane and publishes all three files; a
  conflicting landing gives the ordinary Conflict reply and publishes nothing;
  a landing of 1,025 files is refused `LaneMerge`, counted, and publishes
  nothing.
- Schema tests updated for the two tables: `sqlite_publication.rs` (19
  tables), `old_format_open.rs`, `lineage_backfill.rs`.

## (c) The lane holds only the publish and the in-lane step

Watch-out S2 risk 1: a Commit's merge and everything that grows with the
Commit used to run inside the publication lane. After (b) the merge itself
is before the lane; (c) moves the rest out (`store/commit.rs`):

- Before the lane: the Save's `finish`, the head's logical size, the
  Commit's logical count (`logical_size_after` from the head merged with) and
  the binding hints (`record_new_bindings`).
- In the lane: the head read, and only when it moved again the in-lane
  step. That step has its own small Save, and its logical count and hints
  cover only the step's change to the result (`root` → stepped root), so the
  lane's work follows what landed in between. Then validation of the final
  root (one root inode lookup and a rebind), the atomic publish, and the drop
  of the lane.

**Smaller side.** The issue asks for candidates named from the side with
fewer changes. With the two-stage merge the lane already works from the
smaller side by construction: the in-lane step names its paths from the
`H0`→`H1` changes only. The stage before the lane still names paths from
the Workspace's changes and builds on the head. Choosing the smaller side
there would build the result on ours when theirs is larger, which assigns
serials differently and so changes the merged root's identity; that would
break "results equal to today's below the caps" (the 35 recorded replay
merges compare roots). It is left as is, and it runs outside the lane.

**Test.** `lane_merge.rs::the_lane_hold_follows_what_landed_not_the_commit`:
a 1,000-file Workspace Commit and a one-file Commit, each with one file
landing before its lane, hold the lane for about the same statements.

## (e) The written-path list says when it is incomplete (F-041)

A conflicted Commit lists the paths the merge changed in the Workspace,
at most 4,096 (`WRITTEN_PATHS`, from `root_changes`). `root_changes` reported
when it stopped early, but `merge_stage` dropped that flag and the daemon
replied `truncated: false` for every conflict, so a list cut at 4,096 claimed
to be complete.

- `MergeReport::written_truncated` carries `root_changes`' flag
  (`store/commit_merge.rs`); the in-lane step's report replaces the first
  stage's `written` and its flag together.
- The daemon's conflict reply sets `truncated` from it
  (`layerfs-daemon/src/control/operations.rs`). The bridge already ORs its own
  frame cuts into the flag (`put_report`), and the API passes it through as
  `truncated`, so every adapter keeps it.
- `root_changes` flags a list that reaches exactly the bound as truncated too:
  conservative, never a false claim of completeness.
- The other lists in the reply are complete: conflicts and `.lww` decisions
  are whole, the pending conflicted paths and the marker list are whole.

The list stays bounded (a paged, uncapped list was the alternative); the flag
is the settled contract.

**Tests.** `layerfs-daemon/tests/merge_report.rs`: a conflict with 11
changed paths lists all 11 with `truncated` false; one with 4,197 lists at
most 4,096 with `truncated` true. The second fails before this change
(checked by reverting the three product files).

## Batched record jobs (before (d))

The backed build asked its records one key or one guarded batch at a time,
and each was its own Store job: about 12 reads and one write transaction per
moved entry in A3. `MergeRecords` (`storage/merge_records.rs`) now:

- applies guarded batches to a write-back buffer of at most `BUFFER_BYTES`
  (256 KiB of keys and values). Guards are checked against the buffer, then
  the file, so a batch still applies whole or not at all;
- flushes the buffer in one owner-checked write transaction when it is full,
  before every key window (`first_keys`, `keys_after`) and never inside the
  lane; `end` drops the buffer and removes the file rows as before;
- answers `get`, `contains` and `get_many` from the buffer first and the rest
  of a window of up to 64 keys in one owner-checked statement (a `VALUES`
  join), instead of one statement per key;
- counts keys read, buffer hits, batches, changes and flushes in
  `MergeRecordsWork`.

Memory stays bounded by the buffer; nothing is held across merges. The
ownership rules are unchanged: a flush or read of a removed owner fails
`Missing`.

**A3, 100,000 moved files, one diagnostic run each (macOS, not a window):**

| | Before | After |
| --- | --- | --- |
| Record read statements | 1,206,308 | 228,312 (1,701,638 keys, 98,441 from the buffer) |
| Record write transactions | 104,824 | 1,692 (1,641 flushes) |
| Writer hold, total / longest | 5.16 s / 8.3 ms | 1.38–2.46 s / 9.8–93.6 ms |
| Session statements | 2,676,603 | 790,750 |
| SDK merge | 47.3 s | 30.8–42.8 s |

The longest flush hold varied between runs (9.8 ms and 93.6 ms with the same
buffer); a 256 KiB flush is about 300 changes. A temporary trace of one run
split the 30.5 s `branch.merge` into `merge.paths` 0.36 s, deciding the
200,000 candidate paths 20.9 s (about 105 µs a path: per-path lookups in three
trees and a resident cache of every resolved path), revival 0.05 s, and the
build 8.9 s of which `merge.update` 5.6 s. Deciding is now the main cost per
entry; (d) replaces the per-path resolution with a sorted walk, which is also
what bounds its memory.

## (d) No merge path cap; memory bounded by sorted runs

`MAXIMUM_MERGE_PATHS` (262,144 decided paths) is removed. The merge's working
state no longer grows in memory with the number of paths; it is records in the
merge's Store scratch rows (`merge_record`, owner-checked as in (b)), with at
most `HELD_BYTES` (8 MiB) of them held in memory first.

- **Candidates** (`merge/candidates.rs`): the changed inodes are named a
  window of 4,096 at a time (hints, then `locate`). The paths go into sorted
  runs of 60 KiB chunks, merged 16 at a time with duplicates dropped
  (`spill.rs`: `Sorter`, `Merge`). The subtree walk under a bound or unbound
  name is a spilled stack. A caller `bound` (the in-lane step) is still checked
  and refused past it.
- **Decisions** (`merge/entry.rs`, `decide.rs`): one path at a time in path
  order, into a decided run that also carries the `into` side's entry. A
  decided path with decided paths below it is also a point record keyed by
  the blake3 of its path. The ancestors are a stack of string prefixes: every
  key between P and X has P as a prefix when P prefixes X. Text written by a
  decision is spilled as text records. Its file is constructed only at build,
  so a path revival drops stores no object. The resolver's per-side cache is
  cleared at 65,536 entries.
- **Revival** (`merge/revive.rs`): walks the decided run from the last path
  to the first, replaying the resident version's last-in-first-out order
  exactly. It holds only picks that prefix the visited path (bounded by path
  length) and writes a run of the picks it changed or added.
- **Build** (`merge/build.rs`, `rows.rs`): reads the decided run and
  revival's run in path order with a stack of open directories. The plan rows
  are point records: per-parent chunks of changed names with a first-name
  index, values, and fresh and assigned serials. A fixed 1 MiB Bloom filter
  skips most assignment lookups. `update_filesystem_streamed_backed` reads
  them through memos of the current header, chunk and fresh-serial window.
- A consumed run chunk is released at once. Spilled kinds are flagged, so a
  key of a kind that never spilled needs no read.

Results are unchanged:
- The 35 recorded replay merges (`replay_merges.rs`, the replay Store copy)
  re-merge to exactly their recorded roots: 35/35.
- The 13 rule cases (`merge_root_oracle.rs`) end merged or refused as under
  pre-(d) `d2fda2593`. Their roots carry wall-clock mtimes, so only the
  outcomes are compared. The case "directory-becomes-file" merges under both
  builds: the path below a parent that stays a file is dropped.
- The 35,000-move A3 fixture merges to the same root under pre-(d) and (d)
  (`e6cd2050…33d4dd`).

**Smaller side: dropped (owner, 2026-10-18).** Stage 1 keeps naming paths from
ours and building on theirs, as recorded in (c). Building on the smaller side
would change merged roots' serials.

**Fixtures (AGENTS §2).** `prepare_a3_fixtures` (ignored, setup) writes two
closed Stores once into `LAYERFS_355_FIXTURES`; each test clones an
independent writable copy (`installed::Fixture::cloned`) and merges only, so
the timed test stays under 120 s. Built at the uncommitted (d) tree on
`d2fda2593`:

| Fixture | Moved files (candidate paths) | Bytes | sha256 | Prepare |
| --- | --- | --- | --- | --- |
| `a3-35000.sqlite` | 35,000 (~70k) | 16,842,752 | `9b4031b5…eb` | 9.2 s |
| `a3-135000.sqlite` | 135,000 (~270k, past the former cap) | 64,454,656 | `9da22a13…de` | 45 s |

**Diagnostic runs (one each, macOS, release, not window samples):**

| Case | Merge | Record reads | Write transactions | Writer hold total / longest | Statements |
| --- | --- | --- | --- | --- | --- |
| 35k, pre-(d) | 10.9 s | 79,930 | — | — / 51 ms | — |
| 35k, (d) | 11.0 s | — | — | 0.47 s / 7.6 ms | — |
| 135k, (d) | 66.6 s | 391,828 | 2,418 | 7.75 s / 168 ms | 1,235,821 |

Pre-(d) refuses the 135k case at the cap. The 135k merge's root is
`176c8969…b3`.

## Old vs new, and (d) at 70k and 270k paths (diagnostic, 2026-10-18)

One sample per arm, run back to back. There are no go windows any more (root
AGENTS.md §4). These are diagnostics, not gate receipts: macOS host,
Disposable, release test binaries, `LAYERFS_CONSTRUCTION_WORKERS=1`. Receipts
are in [receipts/](receipts/): binary sha256, load and peak memory.

- **Declared interference.** 1-minute load before each arm: 7.34, 6.72, 6.95,
  5.01 and 5.40. No other worktree's cargo, rustc or test process was above
  1% CPU at any arm's start. #354 and the #359/#360 RCA agent were active in
  other worktrees during the session.
- **Fixtures (AGENTS §2).** `prepare_a3_fixtures` built
  `a3-100000.sqlite` once: 47,800,320 B, sha256 `3692e875…5be0`, 27.8 s. It
  keeps an existing fixture, so the 35k and 135k ones above are unchanged.
- **Same input.** Every arm merged an independent copy of the same fixture.
  The old and new binaries are their commits' product with this branch's
  `sdk_merge_scale.rs` and test support copied in (test code only).
- **Measures.** "History writes" are the writer transactions other than the
  merge records' own: binding hints, serial reservations and the publish. The
  publish's own write is timed as `branch.merge.publish`, added for this
  measurement; it is the merge's only hold of the history writer.

**Batching: the 100,000-move A3 merge (about 200k candidate paths).**

| | Old `d472edef8` | New `d2fda2593` | (d) `16a19429a` |
| --- | ---: | ---: | ---: |
| SDK merge | 37.28 s | 30.47 s | 49.06 s |
| Time per moved file | 0.373 ms | 0.305 ms | 0.491 ms |
| Record read statements | 1,206,308 | 228,312 | 277,321 |
| Record write transactions | 104,824 | 1,692 | 1,776 |
| Record writer hold, total / longest | 4.58 s / 33.5 ms | 1.20 s / 13.4 ms | 5.31 s / 150.8 ms |
| History writes (count / total hold) | 30 / 1.02 s | 30 / 0.98 s | 30 / 1.08 s |
| Session statements | 2,676,603 | 790,750 | 889,635 |
| Peak RSS | 366.1 MB | 366.2 MB | 134.7 MB |
| Merged root | `1462f053…44c3` | `1462f053…44c3` | `1462f053…44c3` |

Batching cuts the time by 18%, write transactions by 98% and the total record
hold by 74%, and the root is the same in all three arms. (d) costs 61% more
time than batching alone, in exchange for 63% less peak memory and no cap.
The longest record hold grows from 13 ms to 151 ms: still 13× inside the 2 s
admission window, but larger. The likely cause is that spilled chunks make
each 256 KiB flush touch more pages against the 2 MiB page cache; a WAL
auto-checkpoint may also land in one flush. Neither cause is verified.

**(d): memory flat from 70k to 270k candidate paths.**

| Moved files (candidate paths) | 35,000 (~70k) | 135,000 (~270k, past the former cap) |
| --- | ---: | ---: |
| SDK merge | 10.84 s | 66.32 s |
| Time per moved file | 0.310 ms | 0.491 ms |
| Peak RSS (whole process) | 140.2 MB | 134.9 MB |
| Publish write (`branch.merge.publish`), the merge's lane hold | 0.82 ms | 1.16 ms |
| Record write transactions; total / longest hold | 597; 0.45 s / 8.8 ms | 2,418; 7.68 s / 169.3 ms |
| History writes (count / total hold) | 14 / 0.34 s | 38 / 1.38 s |
| Merged root | `e6cd2050…33d4dd` (same as pre-(d)) | `176c8969…79b3` |

Pre-(d) refuses the 135k case at the cap. Memory does not grow with the
paths. The publish hold stays about 1 ms, and nothing tree-sized runs inside
it.

Most history writes are binding hints in transactions of at most 4,096 rows.
They are written before the publish, not inside it.

**Gaps.**
- The conflict and `.lww` lists stay resident. They grow with conflicts, not
  with paths.
- Compare's per-directory listing and `locate`'s queue stay resident.
- The in-lane step's resident route is not checked by an oracle.
- Time per moved file grows once the state outgrows the 8 MiB held layer:
  0.31 ms at 35k, 0.49 ms at 100k and 135k. `HELD_BYTES` was not tuned to the
  fixtures (no benchmark fitting); a larger constant budget is an owner choice.
- The longest record hold at 270k paths is 169 ms (see above).
- Linux proofs are not run.

## #360 mixed metadata forms and the merge's serial reuse (analysis, no change)

#360 (`8aed51d60`, `c4d9893e7`, not on this branch) lets an inode value's
metadata be an inline mode and mtime or a metadata root. `same_value` stays a
byte comparison, and `inode_changes` and `root_changes` move to the decoded
`same_inode`. On this branch `metadata_root` is always an `ObjectId`, so
equal metadata has one form. Strict and decoded equality agree here, and
nothing is changed.

After integration, the merge build's three strict checks can see two forms
of equal metadata:

1. `onto_ours`' `held`: same serial, different form. `Keep` becomes `Take` of
   theirs' entry. `assign` keeps the serial if it has one binding in ours.
   Otherwise it gives a fresh serial, which splits a hard-link group whose
   value is unchanged.
2. `assign`'s `given.find`: two paths of one source serial that pick the same
   metadata from different sides get two serials, which also splits a
   hard-link group.
3. `assign`'s `Some(held) if same_value`: a value equal to the `into` side's
   but in the other form loses the "theirs already holds it" reuse. It falls
   back to the one-binding rule or a fresh serial.

None of these breaks "one serial carries one value": a fresh serial is always
safe. The results are a different root identity and spurious delete/add
pairs in diffs. Candidates also change after integration: a form-only change
in ours is no longer a candidate, because `inode_changes` uses `same_inode`.

Before any edit, prove equivalence on the integrated tree:
- an old-form base;
- one side rewrites a hard-linked file inline with equal mode and mtime;
- the other side changes something unrelated;
- assert the merged root keeps both links on one serial, and that its decoded
  view equals a strict-form merge's view.

The likely change is a decoded comparison (`same_inode`) in the three sites,
with the written value taken from the pick. It needs a reader in `assign`.
It belongs to whoever integrates #353/#355 with #360.

## Measurements so far (one sample each, Disposable, macOS host, not quiet-window receipts)

Lane holds are timed by the test's catalog wrapper from `publish_lane`
returning to the hold's drop, with the writer session's statements over it.

| Case | Figure |
| --- | --- |
| Small SDK merge (`sdk_merge_paths`, trees of 20/200/2,000 dirs) | 13 record reads, 5 write transactions, ~0.45 ms total writer hold, max ~0.2 ms; constant across tree sizes |
| A3, 100,000 moved files (SDK merge) | merge 47.3 s; 1,206,308 record reads; 104,824 write transactions; writer hold 5.16 s total, max 8.3 ms; 2,676,603 statements |
| Lane hold, Commit with head unmoved (`lane_merge.rs`, after (c)) | 0.97 ms, 15 writer statements |
| Lane hold, head moved by one Commit (2 paths in the lane step) | 2.47 ms, 105 writer statements |
| Lane hold, 1-file vs 1,000-file Workspace Commit, one file landed | 2.64 ms / 105 vs 3.77 ms / 108 statements |

The A3 figure is the backed route's cost per moved entry (~12 record reads
and ~1 write transaction each, ~0.47 ms); before (b) the same merge was
refused. It is a finding for (d) and the 50k/300k measurements, not a gate.

## M1: merge by serial (owner decision 2026-10-18)

**Decision.** The merge walks changed inode serials instead of candidate
paths. The owner approved two semantic changes up front: merged root ids may
differ from before, and a move on one side plus an edit inside the moved
directory on the other now merges, with the edit following the serial.
Differences (a), (b) and (c) below were found by the equivalence work and
approved by the owner on 2026-10-18, as implemented (via the liaison). The two-stage
Commit merge, the scratch records, bounded memory and the absence of caps
are kept. The algorithm is described in
[81-compare-and-merge](../../architecture/81-compare-and-merge.md#merge).

**Design choices where the brief was silent** (owner rule: results identical,
lane work independent of tree size, least new code, no cap):
- The walk is one-sided, over `inode_changes(base, from)`, with `into`'s value
  read by point lookup in windows of 256. `from` is ours for a Branch merge
  and for Commit stage 1, theirs for the in-lane step, so that step walks only
  what landed after stage 1. `into`'s own changes are never walked.
- A directory changed on both sides is merged by name over
  `binding_changes(base, from)` plus `into`'s point lookups. The result keeps
  the old decider (`decide.rs`, now given entries instead of paths), so file
  rules, `/.lww`, marker text and conflict kinds are unchanged.
- Metadata merges by value: a one-sided change is kept (difference (a)
  below). When both sides changed a directory's metadata, theirs is kept, as
  before.
- A file renamed differently on both sides keeps both names on the one
  serial (two links), as the old merge did.
- A directory renamed differently on both sides, and crossed moves that would
  put a directory inside itself, are `type` conflicts that cancel `from`'s
  move (difference (c) below).
- A serial new on `from` that loses a collision is left unbound with its new
  subtree, so no inode without a binding is written.
- Paths are named only for decisions, deletions against a change below and
  revived parents, from recorded bindings when the Catalog has them, else by
  `locate`.
- `LANE_MERGE_PATHS` keeps its name and value (1,024); it now counts changed
  serials decided.
- Value equality stays strict, as in the #360 note above: a serial counts as
  unchanged only when its value is byte-identical. Under #360's mixed metadata
  forms, a value equal in meaning but different in form is seen as changed.
  That costs a decision, never a wrong content result; a form-only metadata
  change on one side is kept in that side's form.

**Semantic differences (old `5d37e1a3c` vs M1, decoded views).** Each has a
test in `merge_by_serial.rs` (`mbs::`) or `merge_root_oracle.rs` (oracle case)
that fails on the old merge and passes on M1.

| Case | Old | M1 | Class | Test |
| --- | --- | --- | --- | --- |
| move on one side, edit inside on the other | `delete/modify` conflict | merged, the edit at the new path | approved up front | `mbs::an_edit_follows_a_moved_directory`, `..._move_into_a_directory`, oracle `move-and-edit-inside` |
| metadata changed only by one side (file mode, directory mtime) | dropped (base's kept) | kept | (a), owner-approved | `mbs::a_one_sided_mode_change_is_kept`; the r14 replay's mtime lines |
| one side deletes a directory, the other moves it and edits inside | merged silently, the moved copy kept | `modify/delete` conflict on the edited file, whichever side deleted | (b), owner-approved | `mbs::a_deleted_directory_against_a_move_and_edit_conflicts` |
| directory renamed differently on both sides | `/left` and `/right`, files hard-linked across both | `type` conflict | (c), owner-approved | `mbs::a_directory_renamed_on_both_sides_conflicts` |

(a) and #360: under #360 item 2 a directory whose entries did not change keeps
its base row, mtime included (spec §4.8), and an mtime-only change is not a
change at Commit. After #353/#355 is integrated with #360, most class-(a)
mtime-only differences will therefore never reach a merge; the mode change
still does, and its test covers it.

(c) stands by owner decision: reproducing the old result needs fresh serials
for the whole subtree, which makes the work grow with the subtree.

(b) had first been one-sided: deleting on ours conflicted, but deleting on
theirs resurrected ours' moved subtree with the edit, as before. A file `from`
edited inside a subtree it resurrects is now decided as a deletion against an
edit, so both directions conflict alike. A deletion against a move alone still
keeps the moved directory both ways, as before
(`mbs::a_deleted_directory_against_a_move_keeps_the_moved_directory`, which
passes on both arms).

**Old-merge bugs M1 fixes.**

| Bug | Old | M1 | Test |
| --- | --- | --- | --- |
| data loss: one side deletes a directory, the other adds a file in it | the added file is lost | the directory survives with the add | oracle `revive-deleted-parent`, `mbs::a_deleted_directory_against_an_add_below_keeps_only_the_add` |
| data loss: crossed moves `/d1 -> /d2/d1`, `/d2 -> /d1/d2` | merged, `/d2/c.txt` lost | `type` conflict | `mbs::crossed_moves_that_would_make_a_cycle_conflict` |
| a hard-linked file edited on one side | the link group splits | the group stays | `mbs::hard_links_keep_their_group_across_a_one_sided_edit` |

**Equivalence by decoded view.** A view lists each path with its kind,
content id, mode, mtime and hard-link group
([`support/view.rs`](../../crates/layerfs-store-service/tests/support/view.rs)).
- Replay corpus: every recorded merge. History is append-only, so the r14
  Store holds all ranges' Commits (10,612, r7a2–r14 included); exactly 35 have
  a `second_parent_id`, the same 35 as `via=3`, and Layers record no merges.
  Each is replayed from its recorded base, ours and theirs. All 35 merge under
  M1. 22 merges differ from old, in 116 lines, all class
  (a): a directory mtime only ours changed. There are no content, presence,
  kind, mode or link differences.
- `merge_root_oracle` (13 rule cases): two differences, the approved move+edit
  and the fixed `revive-deleted-parent` data loss.
- New `merge_by_serial.rs` (13 cases: move+edit, move into a directory,
  rename/rename of a file and of a directory, crossed moves, delete against an
  edit, an add, a move and a move with an edit below, hard links edited,
  removed and both, one-sided chmod). All pass on M1; 8 fail on old, as
  classified above.
- Suites: content, persistence, store-service, daemon and API (169 test
  binaries at the final (b) change, each under a 120 s alarm, run from its
  crate) pass. The two failures are environmental, as at
  `5d37e1a3c`: `huge_kernel_namespace_is_complete_after_install` needs
  `LAYERFS_Q1_PREPARED` and `host_handoff` needs Docker. F-008's
  `concurrent_commits` is unchanged and passes. Clippy `+1.85.1` is clean;
  the product-boundary guard reports the same 16 violations as HEAD.
- **Bug found and fixed on the way.** A new file decided at an add/add name
  collision lost its marker value: the Emit pass wrote `from`'s own value over
  it. `merge_report`'s written-path list caught it (Branch merges with a
  conflict refuse, so the views could not). `emit_change` now skips a new
  file whose entry a decision already assigned (`Plan::assigned`).
- `sdk_merge_paths`: the assertion that a merge names at least one inode
  described the path route. It is replaced by the stronger M1 property that
  the merge names none.

**Timing (diagnostic, one sample per arm, 2026-10-18).** Sampled at
`9f0756466`; the later (b) change touches only files inside a resurrected
subtree, which no timed case has, so the samples were not repeated. Disposable, macOS
host, release `sdk_merge_scale`, `LAYERFS_CONSTRUCTION_WORKERS` unset (the
merge has one producer). Declared interference: 1-minute load 7.5–11.8 from
other worktrees' builds and tests; `fseventsd` and `mds_stores` were busy in
every sample. The old A3 rows reuse the (d) receipts committed at
`5d37e1a3c` (same fixtures and code, not resampled); the other old rows are
new samples of the same `5d37e1a3c` code with the M1 harness.

| Case | Arm | Merge | Statements | Record writes, longest | History writes | Publish | Peak RSS | Changed serials (left, right) |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: | --- |
| A3 35k | old | 10.84 s | 277,396 | 597, 8.8 ms | 338 ms | 0.82 ms | 140.2 MB | — |
| A3 35k | M1 | 23 ms | 250 | 5, 0.11 ms | 18 ms | 0.77 ms | 30.8 MB | (1, 1) |
| A3 100k | old | 49.06 s | 889,635 | 1,776, 150.8 ms | 1,080 ms | — | 134.7 MB | — |
| A3 100k | M1 | 33 ms | 250 | 5, 0.16 ms | 26 ms | 0.73 ms | 31.3 MB | (1, 1) |
| A3 135k | old | 66.32 s | 1,235,821 | 2,418, 169.3 ms | 1,377 ms | 1.16 ms | 134.9 MB | — |
| A3 135k | M1 | 32 ms | 250 | 5, 0.11 ms | 28 ms | 0.48 ms | 31.8 MB | (1, 1) |
| deep tree, 1,000 dirs × 100 files | old | 34.70 s | 1,010,794 | 4,302, 112.4 ms | 1,092 ms | 0.83 ms | 157.6 MB | (1, 1) |
| deep tree | M1 | 27 ms | 247 | 5, 0.10 ms | 23 ms | 0.61 ms | 31.7 MB | (1, 1) |
| 100k moved into `/nest` | old | 50.53 s | 888,937 | 1,778, 169.3 ms | 893 ms | 0.63 ms | 145.6 MB | (2, 1) |
| 100k moved into `/nest` | M1 | 6 ms | 296 | 5, 0.09 ms | 2 ms | 0.21 ms | 38.8 MB | (2, 1) |
| both sides edit 1,000 of 100k moved files | old | refused after 46.09 s (1,000 `delete/modify`) | 636,993 | 354, 137.2 ms | 982 ms | — | 136.9 MB | — |
| both sides edit 1,000 of 100k moved files | M1 | 552 ms | 15,920 | 5, 3.2 ms | 260 ms | 0.88 ms | 37.2 MB | (1001, 1001) |

Merge time and statements are flat in the file count (35k to 135k) and
follow the changed serials instead: a move changes one serial on its side.
Peak RSS is the test process, fixture clone included. The receipts are in
[`receipts/`](receipts/) (`m1-*.txt`, `old-*.txt`; `m1-a3-100k-harness-failed.txt`
is a harness failure after the merge, before the fix to the sources lookup,
kept as run and not counted as a sample). Fixtures: `deep-1000x100.sqlite`
(sha256 `1b5513cc…`), `both-100000.sqlite` (`9cc4a8cd…`) and the reused
`a3-*.sqlite`, prepared by `prepare_m1_*_fixture` and `prepare_a3_fixtures`.

**Production LOC.** Scope: core first-party product, counted with
`core/tools/production_loc.py --root` on `git archive` of each tree. The
earlier rows of this record before `e4c74f7c3` used the core+sdk+dsh scope;
from `e4c74f7c3` on, and for M1, core only. The scopes are not comparable.
Since R9c the reference scope is absent (retired R9c; last counted 65,417 at
tree 498dd1917812).

Deleted tests: none. `candidates.rs` and `revive.rs` (the path route) are
deleted; they held no tests.
