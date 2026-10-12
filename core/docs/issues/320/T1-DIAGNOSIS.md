# Issue 320: tier 1 diagnosis

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Written 2026-10-13 for product tree `ff47933c44f6` (branch `perf-experiments`).
> Nothing here is a measured improvement. Predictions are stated before any fix.

Case: `v016-mixed-development-100mb-5000-k100-v1`, 100 steps, each one command
and one Commit. "Receipt" is its "before" sample of 2026-10-13, read with
[`tools/receipt_metrics.py`](tools/receipt_metrics.py). Timing rows are
`INELIGIBLE` single observations on a shared machine; counts are exact.

## 1. Where a step's time is

| Part of one step | Time | Source |
| --- | ---: | --- |
| Command, mounted | 76.2 ms | Receipt |
| Same command on a plain directory, no LayerFS | 75.3 ms | [Native diagnostic](NATIVE-DIAGNOSTIC.md) |
| Launching an empty program or shell | 38 to 44 ms | Native diagnostic |
| Commit | 36.7 ms | Receipt |
| of it: owner service of Commit-only job classes | 11.2 ms | OperationRecord 8.9, Lifecycle 2.2, Capture 0.1 |
| of it: transactions on the global Store writer | 9.7 ms | 332 transactions, 1,165 statements |
| of it: not split by the receipt | about 15.8 ms | Content construction, Storage encoding, History, install, job hand-offs |

The command is at its native floor: 0.9 ms above a plain directory, inside the
one-sample spread. Launch is 50 to 58% of it. **Commit is what filesystem work
can still lower in this case.**

## 2. The Commit model

Counts for one Commit, means over the 100 Commits of the receipt.

| What | Count | Model |
| --- | ---: | --- |
| Captured rows | 54.8 inode, 35.4 entry | The step's change |
| Operation-record owner jobs | 1,555 | 297 from the namespace producer; about 1,258 from Content's indexed edit state and the 27 constructed files, one key or one key window a job |
| Statements of those jobs | 3.6 a job | One Workspace liveness check, one Lease check, 1.6 record statements; a writing job adds Begin, a free-list read and Commit |
| Global Store transactions | 332.1 | 51.4 locator batches + 137.9 catalogue queries + 137.8 pack reads + policy, hint table, reservation, publication, History |
| Pack reads | 12 at Commit 1, 246 at Commit 100 | Grows 2.3 a Commit; 13,775 in all, 77.6 MB read |
| Catalogue queries | 102 at Commit 1, 148 at Commit 100 | One for each pooled value group the Commit's base leaves reference |
| Rows returned by Store statements | 6,601 | About 6,000 are the content-hint table read by each new producer (inferred, not counted separately) |

The Store model reproduces the receipt: 51.4 + 137.9 + 137.8 + 5 = 332.1
transactions a Commit against 33,211 in 100 Commits.

A new count test,
[`product_commit_history_cost`](../../../crates/layerfs-daemon/tests/product_commit_history_cost.rs),
commits twelve equal changes (4 inode rows, 1 entry row) from one Workspace
without a mount. At this tree a Commit's Store reads grow with the Commits
before it:

| Count of one Commit | Commit 1 | Commit 4 | Commit 8 | Commit 12 |
| --- | ---: | ---: | ---: | ---: |
| Pack reads | 9 | 17 | 30 | 41 |
| Catalogue queries | 12 | 24 | 40 | 53 |
| Locator batches | 10 | 22 | 38 | 33 |
| Locator misses | 50 | 62 | 78 | 72 |
| Policy reads / hint-table reads | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |

A cost of an operation that grows with operations already done is the pattern
the handbook rejects (section 6, step 5).

## 3. Cause sentences

**C1, group A (launch).** A step's command costs 76.2 ms mounted and 75.3 ms
on a plain directory, and 38 to 44 ms of either is the container engine
starting a process, so no filesystem change can lower it. Owner decision 1
applies: a [launcher proposal](proposals/LAUNCHER.md) is written; none is built.

**C2, group I (a new producer for each Commit).** Each Commit makes a new
Storage producer handle, so it reads the policy row and the whole content-hint
table again and asks the catalogue once for every pooled value group its base
leaves reference: 137.9 catalogue queries a Commit, each a sorted statement
(13,693 sorts in 100 Commits), and 6,601 returned rows a Commit.
*Predicted, tier 1 receipt:* Storage catalogue queries 13,793 to about 600;
Store sorts 13,693 to about 600; Store transactions 33,211 to about 19,500;
policy reads 100 to 1; hint-table reads 100 to 1; returned rows 660,113 to
under 100,000. *Predicted, count test at Commit 12:* catalogue queries 53 to 5,
locator batches 33 to 10, locator misses 72 to 36, policy and hint-table reads
1 to 0. Pack reads are not predicted to move.

**C3, group I (pooled values scattered by Commit).** A Save writes the fresh
inode values of each changed leaf as one small group, and each Commit's groups
go to that Commit's own pack, so reading a leaf costs one pack read for every
earlier Commit that changed a row of it: 12 pack reads at Commit 1 and 246 at
Commit 100, 137.8 a Commit on average. The count test shows 9 to 41 over
twelve equal Commits and it does not move when the producer handle is kept.
The same reads are owed by any reader of such a leaf; that was not measured.
No prediction yet: the candidates differ in what they change (section 4).

**C4, group H (one owner job a record key).** One Commit runs 1,555
operation-record jobs for 90 captured rows, about 17 a row, and each is its own
transaction with a Workspace check and a Lease check; their service is 8.9 ms
of a 36.7 ms Commit. About 1,258 of them are Content's indexed edit state
calling the record port one key at a time. Fewer jobs needs a wider record
port, which is an interface between crates: proposal only.

**C5, group E (two fence statements a job).** Every owner job runs a Workspace
liveness statement and most a Lease statement: 244,917 and 221,383 of the
receipt's foreground statements (47%), 575 ms of statement time in the run.
This is an observation with a count, not yet a cause with a prediction: whether
the two checks can be carried by the job's own statement without weakening the
fence has not been modelled from source.

## 4. Ranked candidates

| Rank | Candidate | Cause | Predicted counter | Needs the owner |
| ---: | --- | --- | --- | --- |
| 1 | Keep the Storage producer handle of a bound Workspace between its Commits; a Commit that fails drops it | C2 | As in C2 | No interface, format, profile, contract or threshold changes. See the note below |
| 2 | Acquire the packs of one pooled leaf's value groups in one Store read | C3 | Pack-read transactions fall, bytes do not; number set by the count test before the edit | No, if the existing batched body read serves it inside Storage; otherwise proposal |
| 3 | Carry the Workspace and Lease checks in the job's own statement | C5 | To be set after the source model | No, if the fence is kept exactly |
| 4 | Read-compare before patching stored inode metadata | Handbook H | Record applies of 9.6 patched inodes a Commit; under 2% of record jobs | No |
| 5 | Reuse one engine connection for the create and inspect requests of a command | Handbook A | Connections a command 3 to 2; no receipt counter; about 2 ms of 76 | No |
| P1 | In-container launcher | C1 | Launch 38 to 44 ms a command | Yes: [proposal](proposals/LAUNCHER.md) |
| P2 | Batched record port between Content, Workspace and the daemon | C4 | Record jobs 1,555 a Commit | Yes: crate interfaces. Proposal to follow with a per-kind job count |
| P3 | Keep decoded pooled value groups on the producer handle, or regroup a leaf's values when it is rewritten | C3 | Pack reads 137.8 a Commit | Yes: a cache lifetime, or a physical encoding policy with a storage cost |
| P4 | Ordering between Commit jobs and filesystem jobs | Tier 2 | Owner queue wait with four Workspaces | Yes; belongs to stage T2 |

**Note on rank 1.** The rules exclude "a longer cache lifetime" as a fix. Rank 1
keeps one handle per bound Workspace alive between Commits, so the bounded
indexes that Storage already defines per handle (8,192 content hints, 131,072
pooled-value candidates, 4,096 locators and value-group rows) are no longer
rebuilt from the Store by every Commit. No bound is raised and nothing is kept
that a completed Save did not seed; a failed Commit drops the handle. It is
read here as removing a rebuild that grows with history, which the Storage
architecture describes ("only a completed save can seed the shared in-memory
indexes"), not as lengthening a lifetime to hide work. It stays on this private
branch and is reverted if the owner reads the rule otherwise. Its known side
effect: a kept handle does not see pooled groups that another Workspace
publishes below its own cursor, which can cost a duplicate 73-byte value, never
a lost one; the four-Workspace sample will state pooled reuse and Store bytes.

## 5. What the diagnosis does not establish

- The 15.8 ms a Commit outside owner service and Store transactions is not split.
- The 1,258 record jobs of Content's edit state are not split by kind; that
  needs a counting provider in a daemon test and belongs to proposal P2.
- No time is predicted for any candidate. Counts decide; time is reported when
  it moves by more than about 10%.
- Candidates 1 to 5 together are not expected to close the gap to the v0.1.6
  reference (7.42 s for command and Commit; this sample 11.29 s), because the
  command part alone is 7.62 s at its native floor.
