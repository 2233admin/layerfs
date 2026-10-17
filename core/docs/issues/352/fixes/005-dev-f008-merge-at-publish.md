# F-008 (range 005, P2 dev run) · a stale Commit merges at publication

| | |
| --- | --- |
| Trigger | P2 dev run `p2-dev` (builder) and fork `diag-f008-old` (fixer): range 005 stopped, `sandbox.commit` answered `HeadMoved` where the plan has `Committed` (r005.s0051, r005.s0048). Stop class. No measured attempt, so no `finding-NNN.aK.json` |
| Kind | 1 forward-only (REBUILD.md) |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | **passed** with the batch's final daemon `71001f65`: range-4 fork written by `511dceed`, whole-tree proof checkpoint ok (530 files) (REBUILD.md §4; run recorded in [the F-011 record](002-a1-f011-binding-hint-migration.md#compatibility)) |
| Playbook step | D1 (step outcome differs from the plan) |
| Fix kind (SPEC §6) | code path (no Store format change) |
| Binaries | old daemon `511dceed…` → new daemon `18ab5415c7ea59a59ac7adc8a410bdfed141d6e15f0fe42721cfa8bb36cd421f` (kept in `core/target/issue352/daemon-18ab5415/`); SDK addon unchanged `506b646f7d0a…` |
| Commits | the commit that adds this file; regression tests `core/crates/layerfs-daemon/tests/concurrent_commits.rs` (host and Linux), converted `mounted_parallel_commits.rs` (Linux) |
| Recovery | fork newest snapshot (range 4); rerun range 5: fork of snapshot range 4 (`p1-pilot-b`), phase p2, play range 5 with no `--serialize-commits` |

## Old design

`core/crates/layerfs-daemon/src/store/commit.rs` (at `bfe16ad16`): after
construction the Commit read the Branch head (phase `head`), merged its candidate
with that head when it had moved, finished the Save, counted, recorded bindings,
validated, and only then published with `commit_branch` against the head it had
read. Each step was its own short Store job, so another agent's publication could
land between the head read and the publish; History then refused the stale
expected head (`layerfs-persistence/src/history/commit.rs:94`, `HeadMoved`). The
fs write path (`via == Files`) refused any moved head outright before merging.
P2 runs several agents per lane, so a 5-agent range met this window within ~50
steps.

## New design

One attempt whose publication is itself the merge against the head current at
publication. The Commit takes the Store's **publication lane** after construction
and holds it through head read, merge, Save finish, count, bindings, validation
and `commit_branch`; it drops it right after the publication (the local install
follows outside it).

- `layerfs-persistence/src/backend/sqlite/lane.rs` (new, Persistence: the lane is
  the Store session's existing admission turn plus the Linux cooperative writer
  lock, both Persistence-owned). `Session::hold_lane` waits (readiness, bounded by
  the existing 2 s admission window) for the turn and the writer lock and keeps
  them for the calling thread.
- `admission.rs`: the holder thread's own SQL work enters as a nested turn instead
  of queueing behind itself; every other caller of this process queues.
  `transaction.rs`: nested write jobs do not take the writer lock again. Each job
  is still its own SQLite transaction with one attempt.
- `layerfs-history` `HistoryCatalog::publish_lane` (default: an empty hold) and
  `PublishLane`; Persistence implements it.
- `layerfs-daemon` `store/commit.rs`: takes the lane before `head`; the
  `via == Files` refusal is removed, so fs writes merge the same way.
  `sdk/files.rs`: a conflicted fs merge is the `Conflict` refusal
  (`detail.conflicts`, `detail.head`), nothing committed, private overlay closed.

Outcomes: different paths → `Committed` with a merge; the same path → `Conflict`;
`HeadMoved` remains only where the lane cannot help (a Branch base change, or a
publisher outside the lane). No catch-and-retry, no loop, no per-lane
serialization in product or player code.

Not one SQLite transaction: the Save's pack writes are already their own jobs,
and folding them into the History transaction would move Storage's publication
into Persistence's History unit. The lane gives the property the plan needs (no
other publication between the head read and the publish) with the existing
units.

### Contract change, stated exactly

- The owner's overwrite-only decision (K34/O-25,
  [307](../../307/BRANCH-OVERWRITE-DECISION-20261007.md); `core/AGENTS.md`
  "Branch Commit overwrites the head") was already superseded for non-forced
  Commits by #327 (`accaa5e1c`, 2026-10-15: merge-on-commit, conflict install,
  `force` keeps the overwrite). This fix does not touch `force` and does not
  bring back overwrite.
- What changes is #327 VERIFICATION B7 ("the head moves after B's merge and
  before its publish → B returns `HeadMoved`; it does not merge again"). That
  window is now closed: no publication can land between B's merge and its
  publish, so B7's arrangement cannot happen. B7's one-attempt rule still holds:
  B merges once and never merges again.
- fs writes used to refuse a moved head before merging. They now merge like
  `sandbox.commit` (SDK README, fs section).
- Why the replay needs it: in SPEC §2's conflicts table, "Stale-Workspace clean
  merge" expects `Committed`, and "Same-lane Commit Conflict" expects `Conflict`.
  With several agents per lane, any of their Commits can be stale at publication;
  under the old design a planned clean merge failed whenever a third publication
  landed in the window (the r005 stops).
- `core/AGENTS.md`'s Branch Commit sentence predates #327 and is left to the owner.

## Proof

`concurrent_commits.rs` (host 0.07 s, Linux 0.12 s; barriers, no sleeps):

1. Four Workspaces bound to one head create different files and commit at once:
   all publish, and the lane has every file.
2. Two Workspaces create the same file: exactly one publishes, one `Conflict`,
   and the lane holds the winner's bytes.
3. Eight concurrent `fs.write` calls of different files: all `Committed`.

At `bfe16ad16` (old) all three fail with `HeadMoved` (at Construct for fs, at
Publish for Workspaces). `mounted_parallel_commits` (Linux, real FUSE, a real
external flock holding the Store's writer lock while both Commits start) now
expects both published, one exactly its captured tree and one the merge holding
both files, and both live installs follow. Its old expectation (`HeadMoved` once)
was B7's.

Checks run: host `layerfs-persistence` + `layerfs-history` (28 targets, 100
passed), 17 host daemon targets (49 passed), Linux `mounted_parallel_commits`,
`concurrent_commits`, `mounted_concurrency`, `mounted_cycles`,
`mounted_serial_admission`, `r5_1_actual_daemon_commit` pass; `mounted_commit`
r5_8 fails as recorded pre-existing (LESSONS). Clippy `-D warnings` clean on the
three crates.

## Performance, old vs new

Range 5 of P2 on forks of snapshot range 4, one sample each, fresh daemons, dev
label (traced). The old run stopped, so its numbers cover only the steps before
the stop.

| Measure | Snapshot | Cache | Old `511dceed` | New `18ab5415` | Change |
| --- | --- | --- | --- | --- | --- |
| Range outcome | range-4 fork | fresh daemon | STOP r005.s0048 `HeadMoved` | checkpoint ok, verdict watch | fixed |
| `sandbox.commit` outcomes | same | same | 37 Committed, 44 UpToDate, 1 Conflict, 1 HeadMoved | 58 Committed, 59 UpToDate, 1 Conflict | — |
| `sandbox.commit` p50 / p95 ms | same | same | 12.56 / 32.29 (n 83, partial) | 12.62 / 41.87 (n 117) | +0.5% / +30% |
| `fs.write` p50 / p95 ms | same | same | 17.33 / 31.08 (n 307, partial) | 14.34 / 34.89 (n 504) | −17% / +12% |
| SQL statements per `sandbox.commit` | same | same | 167 | 182 | +9% |

Storage: unchanged (no format or written-data change).

## Cost of the fix

- Publications in one Store are ordered through the lane: a Commit waits while
  another holds it. The hold covers merge, Save finish, count, bindings and
  validation, not construction.
- Other SQL work of the same daemon (FUSE reads of the shared Store session) also
  waits during a hold. Above 2 s it would be refused `Busy` (the existing window);
  not seen in range 5.
- p95 Commit latency +30% on the one range sampled. Partly the wait: the new run
  also ran 41% more Commits concurrently.

## Left open

- A hold longer than the 2 s admission window, from a very large merge, would make
  waiters `Busy`.
- `core/AGENTS.md`'s overwrite sentence and #327 B7's row are the owner's to
  restate.
