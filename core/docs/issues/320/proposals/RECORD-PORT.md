# Issue 320 proposal P2: a batched operation-record port

> **Status:** Proposal for the owner; not selected, not built, not a contract.
> Written 2026-10-13. It changes interfaces between crates, so nothing is
> committed for it.

## What was measured

Tier 1 case, "before" receipt, means over 100 Commits; the four-Workspace
figures are from the sample at `56a6424e1`.

| Measure, one Commit | One Workspace | Four Workspaces |
| --- | ---: | ---: |
| Captured rows | 90 | 90 |
| Operation-record owner jobs | 1,555 | 1,555 |
| of them: the namespace producer's own | 297 | 297 |
| of them: Content's indexed edit state and file construction | about 1,258 | about 1,258 |
| Owner service of record jobs | 8.9 ms | not split by class here |
| Owner queue wait, all classes, per Commit and command | 0.5 ms | 60 ms |
| Commit time | 36.7 ms, 29.0 ms after T1 batch 1 | 163 ms, 109 ms after T1 batch 1 |

Each record job is one round trip from the Commit thread to the owner thread
and one transaction: a Workspace liveness check, a Lease check and one or two
record statements; a writing job adds Begin, a free-list read and Commit.

## Cause

Content keeps the working sets of a streamed update (dropped, unreachable,
contents, touched and work rows, validation marks) in an indexed backing so
that a Commit of any size needs bounded memory. The backing trait answers one
key at a time (`contains`, `get`), applies one change set at a time (`apply`)
and lists one key window at a time. The Workspace adapter turns every call into
one owner job. So a Commit makes about 17 sequential owner round trips for each
captured row, whatever its size.

With one Workspace a round trip costs its service. With four, every round trip
also waits behind the other Workspaces' jobs on the one owner: queue wait goes
from 0.5 ms to 60 ms a step while service does not change. **The number of
sequential round trips a Commit makes is what multiplies the waiting**, so this
proposal is also the main candidate for the tier 2 cause "Commits wait across
Workspaces".

## What is proposed

Let one owner job answer several record questions.

- **Content to Workspace** (`IndexedEditBacking`): add calls that take a
  bounded list of keys and return their answers in order, and let the streamed
  update ask for the keys of one input page together. Single-key calls remain
  for callers that have one key.
- **Workspace to daemon** (`OverlayOperationRecords`): add one bounded
  multi-key read and keep the existing apply, which already takes a list.
- **Overlay**: one statement per key inside one transaction, with one Workspace
  check and one Lease check for the job. Nothing new is stored and no schema
  element is added.

Bounds stay explicit: a list is limited by the existing page window (64 rows)
and by the record byte limit, so no job grows with the Commit. One attempted
operation, no retry; a failed job fails the Commit as today.

## Expected effect, not measured

Counts only, from the model: if the keys of one 64-row page are asked together,
the 1,258 jobs of a 90-row Commit become a few tens. Nothing is claimed for
time; the first step would be a counting provider in a daemon test that splits
the 1,258 jobs by call kind, which this run has not built.

## What the owner would decide

1. Whether the two traits may gain batched calls (interfaces between Content,
   Workspace and the daemon).
2. Whether Content's streamed update may group its questions by input page,
   which reorders reads but not results.
3. Which proofs gate it: the Content update suites, `captured_commit`,
   `product_commit_cost`, and the mounted concurrency and install binaries.

## Not proposed

A cache of record answers inside the Workspace adapter. It would cut the same
jobs without an interface change, but it is a private mutable mirror of state
the overlay owns, which the handbook excludes as a fix.
