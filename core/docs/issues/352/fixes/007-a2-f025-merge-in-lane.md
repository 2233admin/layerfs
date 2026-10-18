# Range 007 a2 · F-025 · Commits queue behind in-lane merges whose path search walks the tree

> Opened by the owner's liaison on owner direction, 2026-10-18 ("treat it very
> seriously"). Diagnosis by two read-only studies (trace and code) plus the
> liaison's own checks; every number below is from the stored traces, nothing
> was played. The fixer owns the fixes and completes every row marked
> *pending*. This is a **product finding with a growing series**, not a watch
> to wait out: it is open until fix 1 is proved and measured.

| | |
| --- | --- |
| Trigger | Range 7 attempt 2 (daemon `c25119ac`): Speed `fs.write` ≤512 KiB 11.87× baseline p95 in the commit phase (watch). The same tail runs through every write size and `fs.rm` (9.69× r8, 11.84× r9), and keeps growing on daemon `58a60046` (ranges 9a2–11, below). BUGS.md F-025 |
| Playbook step | D6 (time outside the operation: waits behind other Commits' lane) and D3 (a cost growing with tree size: the merge path search) |
| Kind | 1 forward-only (REBUILD.md) for fixes 1–4: code paths only, Store format unchanged. Fix 4's optional `content_signature(stamp)` index is **not** proposed (it would change the stored schema definition) |
| Old Stores | open unchanged |
| Old data | still read as before |
| Compatibility test | fix 0: **passed**. A fresh fork of `p2-main-c`'s range-11 snapshot (written by `58a60046`) passes `compat.mjs` range 11 on daemon `bd6fbeee`: 1,057 files, 296 ids, paths ok. Fixes 1–4: *pending* |
| Binaries | daemon `58a60046…` (and the evidence from `c25119ac…`) → fix 0: `bd6fbeee08156326895e16c1e0a688854f004231d55e0c359ea7ec8af256972a`, kept in `core/target/issue352/daemon-bd6fbeee/` (addon unchanged, `799e3ca6`). Fix 1: daemon `dbf906df…`, addon `59f7f8dd…` (below). Fixes 2–4: *pending* |
| Commits | fix 0: the commit that adds its section below, on branch `dsh-352-f025-fix0`. Fixes 1–4: *pending* |
| Regression tests | fix 0: `core/crates/layerfs-daemon/tests/sdk_timing_coverage.rs` (moved to `layerfs-store-service` by F-020). Fix 1: `layerfs-store-service/tests/sdk_merge_paths.rs` (bound) and `history_diff_oracle.rs` (naming equals the walk). Others *pending*, listed under Proof |
| Recovery | fork the newest good `p2-main-c` snapshot; rerun the range that trips next (or the next unplayed range) measured on the new daemon. No rebuild |
| Order | **fix 1 first** (the cause that grows), then 2, 3, 4. Each lands, is proved, and is measured old vs new before the next |

## Evidence

### The tail is merges in the lane, not slow writes

A Commit whose Branch head moved since its base merges at publish inside the
publication lane (F-008's design). Writes split by whether they merged
(client ms, p50 / p95):

| Run | Daemon | Merged writes | Merged p50 / p95 | `merge.paths` p50 / p95 | Unmerged writes | Unmerged p50 / p95 |
| --- | --- | --- | --- | --- | --- | --- |
| baseline r4 (`rb-p2-c25119ac-5baa0f5d`) | `c25119ac` | 35 of 619 (6%) | 88.9 / 162.4 | — | 584 | 11.5 / 50.8 |
| r8 (`p2-main-b`) | `c25119ac` | 132 of 662 (20%) | 167.5 / 337.3 | — | 530 | 15.6 / 128.0 |
| r9 (`p2-main-b`) | `c25119ac` | 117 of 405 (29%) | 146.5 / 310.8 | — | 288 | 15.8 / 148.5 |
| r9 a2 (`p2-main-c`) | `58a60046` | 123 of 405 (30%) | 165.0 / 321.0 | 28.6 / 109.8 | 282 | 14.6 / 128.1 |
| r10 (`p2-main-c`) | `58a60046` | 106 of 355 (30%) | 152.0 / 352.4 | 44.8 / 119.5 | 249 | 15.4 / 162.8 |
| r11 (`p2-main-c`) | `58a60046` | 181 of 783 (23%) | **240.3 / 399.3** | **56.1 / 150.1** | 602 | 20.8 / **271.4** |

(Liaison's check, `fs.write` lines with a `merge` timing node.)

Unmerged writes that **no merge overlaps in time** stay at baseline (p50 / p95:
baseline 11–12 / 16–17 ms; r7a2–r9 13–14 / 19–24 ms). Unmerged writes that a
merge overlaps take 19–23 / 81–118 ms in the baseline and 30–40 / 146–217 ms at
r7a2–r9 (trace study). The 3 ms of growth in isolated writes over nine ranges
is small (below).

### Where the waiting is

For the slowest 5% of writes (mean ms, r8 / r9): producer 75 / 94, construct
112 / 81, merge 53 / 54 (of which `merge.paths` 51 / 52), lane 33 / 25, begin
23 / 30. Finish, logical.count, validate, publish and install are ≤2 ms on 14
of the top 15 calls. In-lane merge time per second of wall time: baseline
122–235 ms/s, r5–r7a1 25–90 ms/s, r7a2–r9 **407–440 ms/s**; about 99% of it is
`merge.paths`.

Why waiting spreads beyond the lane holder (code study, to be confirmed by the
fixer): the writer `Session` is one connection behind a FIFO admission queue
(`layerfs-persistence` `admission.rs`); every writer transaction, reads
included, enters it, and `hold_lane` keeps the turn for the whole lane span
(`layerfs-daemon/src/store/commit.rs:152` to after `publish` at `:313`). So
while one Commit merges in the lane, every other Commit's writer reads in
`producer`, `begin` and `construct` wait.

### Why merges became frequent

21–46% of fs.* Commits overlap another Commit on the same Branch in every
range. On the old route (one control connection per Sandbox) calls were
serialized in the client, so merges were ~1%. F-017's pool lets them meet in
the daemon, so merges are 20–30%. RESULTS.md already accepted the rise in
in-lane merges as F-017's cost. **That concurrency is the agents' real
behaviour and stays**; the fix is making a merge cheap and short in the lane,
never re-serializing clients.

### Why each merge costs more as the tree grows (the growing cause)

`merge.paths` (`layerfs-content/src/merge/entry.rs:44`) runs
`decide::candidates` (`merge/decide.rs:130`), which takes the changed inodes
from `inode_changes` and then names them with **two breadth-first walks from
the root**, `locate(reader, &ours, …)` and `locate(reader, &base, …)`
(`decide.rs:147-148`; `compare/tree.rs:233`). `locate` lists directory after
directory, breadth first, until every wanted serial is found, bounded only by
`MAXIMUM_MERGE_PATHS` = 2^18. Its cost is every directory at a depth shallower
than the deepest changed inode, so it grows with the tree's directory count,
not with the change. Measured: `merge.paths` correlates with path depth (r 0.72);
p50 by depth d3/d4/d5/d6 is 12/27/51/48 ms in the baseline and 15/33/66/110 ms
at r9; and on `58a60046` its p50 doubles from r9a2 to r11 (28.6 → 56.1 ms).

The same search likely explains the `branch.merge` watch at range 10 (64.69×,
thin baseline): the fixer checks it with the same probe.

### Small fixed costs per call (code study, unmeasured)

- Each SDK file call opens a **new read-only SQLite connection** for its
  private Workspace's bind (PRAGMAs, schema checks, cold cache): about 1.2–1.5 ms
  p50, flat.
- Each SDK file call builds a **new Storage producer** (`store/producer.rs:21`;
  the kept handle never applies to a one-call private Workspace), so `begin`
  reloads the signature ring: `SELECT … FROM content_signature ORDER BY stamp
  LIMIT 8193` (`metadata_signatures.rs:10`), a scan plus sort on the writer,
  growing with saved objects up to 8,192 rows.
- Isolated writes grew only from fullscan_steps 268 → 619 and vm_steps 9.1k →
  14.9k from baseline to r9 (+0.4 ms): real but small.

### Measurement notes

- The ≤512 KiB baseline class has 3 / 3 / 8 calls in ranges 2–4, so its "p95"
  is a single call; 11.87× is inflated, although the tail is real. The gate's
  treatment of thin classes belongs to F-024 (lead's decision, below).
- 3–5% of slow calls carry 50–175 ms outside the daemon's timing tree with
  ≤13 ms of queue (for example r8 `#209`, 175 ms). Unattributed: fix 0 below.
- `sql` counters on overlapping calls are daemon-wide deltas over the call's
  window, so they include other calls' work; use them only on isolated calls.

## Owner direction 2026-10-18: concurrency model and priorities

One global database with one writer at a time is the design
([Store concurrency model](../../../architecture/83-store-concurrency-model.md)).
Real agents' tool calls are seconds apart, so concurrent Commits are expected
to be uncommon; the replay's back-to-back play makes them frequent. Hence:

| Fix | Status | Why |
| --- | --- | --- |
| 0 · timing | done (`de9d46d48`) | — |
| 1 · merge path naming by change size | **first, required** | a scaling defect inside the lane that hurts every merge, real ones included; grows with tree size |
| 4 · fixed per-call costs | **kept, small** | paid by every call, contended or not; built in F-020's code |
| 2 · narrower lane | **deferred** | mainly a contention optimization; revisit only if the uncontended series or the lane hold per Commit needs it after fix 1 |
| 3 · reads off the writer queue | **deferred** | same; F-018 already moved the important reads off |

**Closing F-025:** fix 1's proof and old-vs-new table on the uncontended and
contended series (SPEC §5 note of the same date): `merge.paths` flat against
tree size, merged-Commit lane hold back to a few milliseconds, uncontended
`fs.write`/`fs.rm` at baseline. The earlier `fs.write` ≤512 KiB 11.87× and
`fs.rm` 9.69–11.84× watches are read on the uncontended series; their
contended tail is this finding's, not a separate defect.

## Fixes

### Fix 0 · Timing coverage (diagnostic, before fix 1)

Add timer nodes for the untraced spans of a file call (the admission wait in
each writer transaction, overlay template copy and open, reader open) so the
50–175 ms gaps are attributed. Code path only.

#### Fix 0 · result (done, daemon `bd6fbeee`)

**What changed (code paths only, Store format unchanged).**

- Every span of an SDK file call is a timing root: `files.resolve` (project
  and Branch lookups), `files.bind`, `files.change` (the overlay changes),
  `commit` and `files.close`.
- The bind has nested roots for the reader open (`bind.reader`), the Branch
  snapshot, the root check and the overlay open (`bind.overlay`).
- A traced request reports its observation's own spans, `observe.before` and
  `observe.after` (counter snapshots and diagnostic records).
- Waiting is a node below the phase that waited. A thread's time queued for
  the Store writer's admission (`wait.writer`), a read-only connection's
  admission (`wait.reader`) or the shared read session's lock
  (`wait.read_session`) is added to a per-thread total
  (`layerfs_telemetry::timer::waits`). Each phase and root reports what it
  waited and no inner span already reported, when at least 50 µs. An
  uncontended entry records nothing.
- Untraced calls create no nodes; the per-thread total costs one addition
  per actual wait.

**Proof.** `sdk_timing_coverage.rs`, written first; it failed on the old code
(`no files.resolve root`). Another thread holds the publication lane for
400 ms while an `fs.apply` runs traced. The test asserts the five roots, at
most 25 ms of the call outside them, and `wait.writer` nodes of at least
200 ms. Also: the daemon, persistence and telemetry suites pass, except
`host_handoff` (needs Docker inside the test) and
`huge_kernel_namespace_is_complete_after_install` (needs
`LAYERFS_Q1_PREPARED`), both environmental. Clippy `-D warnings` is clean.

**Old vs new.** A probe (`core/target/f009/diag/f025-probe.mjs`, in the
fixer's worktree): on a fork of `p2-main-c`'s range-11 snapshot, fork one
Branch from `main`, one warm write, then six concurrent writers (the addon's
six control connections) write 20 new 16-byte files each into existing
directories at depths 1–4. One sample per arm, each on its own fresh fork
(`f025-0-old`, `f025-0-new`), addon `799e3ca6`.

| Measure (120 writes; 119 merged in both arms) | Old `58a60046` | New `bd6fbeee` |
| --- | --- | --- |
| client ms p50 / p95 / max | 206.7 / 344.4 / 402.7 | 208.1 / 356.3 / 430.0 |
| outside `files.bind` + `commit` (minus client queue), p50 / p95 / max | 47.6 / 66.4 / 104.3 | 46.5 / 81.2 / 143.7 |
| outside every root, p50 / p95 / max | same as above | **2.2 / 4.2 / 7.6** |
| `files.change` p50 / p95 / max | not timed | 38.8 / 73.7 / 131.2 |
| `observe.after` p50 / p95 | not timed | 2.1 / 3.9 |
| `files.resolve`, `files.close` p50 | not timed | 0.0, 0.3 |

Latency is unchanged within one sample. Mean `wait.writer` per write on the
new daemon, by where it waited:

| Where | ms |
| --- | --- |
| `commit/construct/captured.namespace` | 100.3 |
| `files.change` (the gap) | 29.1 |
| `commit/begin` | 13.5 |
| `commit/producer` | 10.7 |
| `commit/lane` | 7.1 |
| total, of ~208 ms p50 per write | 160.7 |

**What it shows.**

- The untraced 50–175 ms was `files.change`. Almost all of it (29.1 of
  33.8 ms mean) is waiting for the writer. A new file in a fresh private
  Workspace reserves inode serials (`history.reserve_inodes`, a writer
  transaction), and that queues behind the lane holder.
- In this load a write spends three quarters of its time queued for the
  writer, and the largest share is construct's Save work. That confirms the
  code study's spreading mechanism.
- Merges in the lane hold the writer for 27.3 ms per write on average
  (`merge`, 119 of 120 merged): about 3.2 s of the probe's 6.2 s wall time.
- This is the input to fix 1 (a shorter merge), fix 3 (construct's reads off
  the queue) and fix 4 (the serial reservation per create).

**Cost.** Production LOC 96,477 → 96,596 (+119): the timing roots, the
per-thread wait totals, and `files.rs` split into resolve, change and close.
No storage change.

**Process note.** The first `compat.mjs` attempt passed git commit ids where
it takes LayerFS heads (`NoSuchBranch`, nothing played). The second, with
`p2-main-c`'s range-10 and range-11 heads, is the result above.

### Fix 1 · Merge names changed paths by a top-down difference (first)

- **Old design:** `candidates` finds changed serials, then names them with two
  breadth-first walks of the whole tree from the root (O(directories above the
  deepest change), on both base and ours), inside the lane.
- **New design:** produce paths during the difference itself: descend from the
  root only into directories whose content root differs between base and ours
  (the same top-down, page-skipping walk F-003 / F-019 use for `diff_commits`),
  carrying the path as it descends. Every changed inode is named on the way
  down; nothing unchanged is listed. Hard links or a serial reached under two
  names keep the current rule (first path), stated in the test.
- **Bound:** O(changed entries × depth) directory pages, independent of tree
  size and of the number of unchanged directories.
- **Must not change:** merge results. Same candidates, picks, conflicts and
  merged root for every input.
- **Expected:** `merge.paths` from 29–56 ms p50 toward a few ms; the lane hold of
  a merging Commit shrinks by the same, and the waits it causes shrink with it.

#### Fix 1 as built (fixer, `3dff9c5cb`, branch `dsh-352-f025-fix1-topdown`)

- **How the changed inodes are named.** `candidates`
  (`layerfs-content/src/merge/decide.rs`) names them with
  `compare::name_from_hints` (`compare/named.rs`). This uses the same recorded
  bindings as the F-003 change walk (`Plan::make`):
  - each changed inode's `(parent, name)` hints are checked against the tree
    and climbed to the root, with no directory listed;
  - it takes the path `locate` would reach first (fewest components, then
    name order), so a hard link or a serial with two names keeps the
    first-path rule;
  - if any inode's bindings are incomplete, or the depth or path bounds are
    passed, the answer is `None` and `locate` runs as before.
- **Wiring.** `CatalogHints` moved to `layerfs-store-service/src/store/hints.rs`
  and is passed to both merge sites (Commit merge-at-publish and
  `branch.merge`). A catalog failure answers with its own cause.
- **The bound measured.** One file changed at depth 6, merged beside 20, 200
  and 2,000 directories: 198, 216 and 234 statements. Each lookup in the climb
  gains one B-tree level per 10×, so growth is logarithmic. The breadth-first
  walk took 225, 852 and 7,584. So the bound is O(changed × depth) lookups,
  each O(log tree), and no listings. The spec's "independent of tree size" is
  met for directory listings, not for B-tree page reads.
- **Binaries.** The daemon runs Workspace Commits through store-service's
  `commit_merge`, and the SDK runs `branch.merge` and merge-at-publish
  in-process, so fix 1 changes both:
  - daemon `dbf906df0bcd956b9f2c9ca6df3c63e88404b521904cd148b50ac44de08ce24e`
    (`core/target/issue352/daemon-dbf906df/`);
  - Linux addon `59f7f8dd9e0214bf9d4257e20c868eb0a6c482cb02047386d0f43d35130f51e8`
    (`sdk-linux-59f7f8dd/`).
  Both are built from `3dff9c5cb`, warm on the `layerfs-issue352-cargo-target`
  volume (32 s and 17 s). `compat.mjs`, the recorded-merge replay and the
  old vs new table wait for "lane idle". Overlap, declared: the two builds ran
  03:22:31–03:23:57Z, as ranges 13–14 began.

### Fix 2 · Narrow the publication lane

- **Old design:** the lane is held from `lane` through merge, finish,
  logical.count, bindings, validate and publish.
- **New design:** `validate` (a `checked_base` on the control reader) runs
  before the lane against the base it will publish over, with only the head
  check repeated in the lane; `logical.count` and `bindings` move out where the
  merge does not change their input (an unmerged Commit), or bindings fold into
  the `commit_branch` transaction. Merge and publish stay inside the lane.
- **Bound:** an unmerged Commit's lane hold from ~5 ms toward ~1 ms.
- **Constraint:** the merge writes into the same Save, so finish stays in the
  lane for merging Commits unless a second Save is introduced (not proposed).

### Fix 3 · Save's read-only lookups off the writer admission queue

- **Old design:** the ring read, Save locates and object reads are writer
  transactions in the FIFO queue, so they wait for any lane holder.
- **New design:** they run on a read session (the F-018 pattern), with
  visibility of this Save's own published waves (WAL commits make them
  visible to a later read transaction). Writes stay on the writer.
- **Bound:** a Commit's reads no longer wait for other Commits' lanes.

### Fix 4 · Fixed per-call costs

- Keep one idle daemon-wide producer `Storage` for SDK file calls (one Save per
  handle at a time, a failed Save invalidates it as today): no ring reload in
  the steady state.
- Reuse a pooled read connection for SDK private Workspaces instead of opening
  one per call, preserving per-Workspace failure custody and quarantine.
- Optional: a daemon serial pool for SDK creates (one write transaction and 63
  wasted serials per create today).
- **Must be built in the code that F-020 moves into `layerfs-store-service`,** so
  the in-process SDK gets it too. Coordinate with the F-020 branch
  (`dsh-352-f020`); the lead merges.

### Not proposed

- Serializing SDK calls in the client or per Branch: hides the agents' real
  concurrency.
- Any retry, busy handler, longer admission deadline or extra construction
  worker.
- A schema change for the ring index.

## For the lead to decide

**The thin baseline class (F-024).** The ≤512 KiB write class has 3 / 3 / 8
baseline calls, and the `branch.merge` 17–64 entries class has one. Decide how
the gate treats such a class (F-024's `BASELINE_MIN_N`, pooling with a
neighbouring class, or re-measuring the baseline with enough calls), apply it
the same way to every class, record it in RESULTS.md's decision log, and never
use it to close this finding: F-025 is closed by fix 1's proof and the old vs
new table, not by a gate change.

## Proof

*pending*, each command ≤120 s:
1. **Merge equivalence:** every merge recorded in r7a2–r11 (inputs from the
   traces: base, ours, theirs roots), plus synthetic deep and wide trees,
   merged by the old and new `candidates`: identical candidate sets, picks,
   conflicts and merged roots.
   - **Fix 1, synthetic (done):** `history_diff_oracle.rs` covers 3 seeds ×
     120 random-history diffs, with writes, edits, removals, renames, copies,
     forks and merges. Every inode changed on both sides (882) is named alike
     by `name_from_hints` and `locate` in both trees. The hints were complete
     every time. `candidates` depends on the trees only through those names,
     so its candidate set, and the picks, conflicts and merged root that
     follow, are unchanged.
   - **Recorded merges (pending):** the Store is Linux-only, so this waits for
     the Docker clear.
2. **Bound test:** a merge of one changed file at depth 6, on trees of 1×, 10×
   and 100× the directory count: `merge.paths` directory listings equal across
   tree sizes (counter, not time).
   - **Fix 1 (done):** `sdk_merge_paths.rs` measures statements, because the
     merge's listings have no counter of their own. With 20, 200 and 2,000
     directories it gives 198, 216 and 234 statements.
   - The bound allows at most +24 per 10× (one B-tree level per climb lookup),
     and 100× must stay within 125% of 1×.
   - Revert check: with naming forced back to `locate`, the counts are 225,
     852 and 7,584, and the test fails.
3. **Lane hold (fix 2):** an unmerged Commit's lane span excludes validate; a
   concurrent Commit's head refusal still behaves as F-008.
4. **Reads off the writer (fix 3):** during a held lane, another Commit's Save
   reads complete without waiting for it (barrier-ordered, bounded).
5. **Compatibility:** `compat.mjs` on the newest `p2-main-c` snapshot.

## Performance, old vs new

Same snapshot fork, same cache state, one sample per case; each column
labeled with its binaries. *pending*.

| Measure | Snapshot | Cache | Old (`58a60046`) | New | Change |
| --- | --- | --- | --- | --- | --- |
| `merge.paths` p50 / p95, by depth d3–d6 | | | | | |
| merged fs.write p50 / p95 | | | | | |
| unmerged fs.write overlapped by a merge, p50 / p95 | | | | | |
| unmerged fs.write, isolated, p50 / p95 | | | | | |
| fs.rm 1 file p50 / p95 | | | | | |
| branch.merge p50 / p95 by entries | | | | | |
| lane hold per Commit, merged / unmerged | | | | | |
| in-lane merge ms per wall second | | | | | |
| writer statements, vm_steps, fullscan_steps (isolated calls) | | | | | |

Counter exponents of `merge.paths` against tree directory count: before →
after (*pending*). Storage: unchanged expected; stated after measuring.

## Cost of the fixes

*pending* (for example: memory of a kept producer and pooled reader, extra
read transactions in fix 3).

## Left open

- Merge frequency itself (20–30% of fs.* Commits) is accepted as real
  concurrency; revisit only if fixes 1–3 leave merged Commits above 2× an
  unmerged one.
