# #355 — Merge at scale: fix notes

> **Status:** Fix record, written step by step on branch
> `claude/issue353-lineage-cap-ec7c49` (on top of #353). Owner decisions of
> 2026-10-18 govern. Measured figures are added with their receipts; nothing
> here is a measurement until it says so.

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
