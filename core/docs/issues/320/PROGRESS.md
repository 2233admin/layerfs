# Issue 320: optimization ledger

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Ledger of the exec and Commit optimization run on branch `perf-experiments`,
> opened 2026-10-13. Every time below is one sample on a shared 8-CPU, 4-GB
> container VM used by a second agent and unrelated containers. Every timing row
> is `INELIGIBLE` in its receipt; counts and storage are the evidence.

Rules of the run: issue 320 and the
[benchmark instruction](../../../../docs/general/benchmark_instruction.md).
One entry per iteration; receipts are append-only under the git-ignored result
folder and are named here by tag and case. Global Store profile
Disposable/WAL/OFF; `LAYERFS_CONSTRUCTION_WORKERS=1`; Durable:
`NOT_RUN — disabled by owner until explicit reauthorization`.

Companion documents: [receipt field mapping](RECEIPT-FIELD-MAPPING.md),
[native diagnostic](NATIVE-DIAGNOSTIC.md), [refreshed candidate list](CANDIDATES.md),
[T1 diagnosis](T1-DIAGNOSIS.md). Proposals for the owner:
[launcher](proposals/LAUNCHER.md), [batched record port](proposals/RECORD-PORT.md),
[pooled value reads](proposals/POOLED-VALUE-READS.md).

## Setup (2026-10-13)

Worktree on `perf-experiments`, cut from `95477b127`, with its own measurement
lock and Cargo targets. Commit `196c70fba` adds only a read-only receipt reader;
its product tree `ff47933c44f6` is the tree of `95477b127` and of the Stage 1
gate identity `cdf115c67`. Tag `before`: one sealed release build, then one
sample each of the twelve cells and the six selected cases, no retry. Every
proof PASS, every functional check PASS where a receipt has one, every timing
row INELIGIBLE, every cleanup known. Counts equal the #319 terminal run except
in the two rows explained under the table. The native diagnostic ran once
([record](NATIVE-DIAGNOSTIC.md)): an empty launch costs 38 to 44 ms, the tier 1
step is 76.2 ms mounted and 75.3 ms on a plain directory, the history step
42.2 ms mounted and 46.4 ms plain. Launch is more than half of a step, and the
command time of both cases is at its native floor; Commit is what remains.
Verdict: setup complete. Next: the T1 cost model of one Commit.

| Case | Requests | Owner jobs | Statements | Against the terminal run | Store logical bytes, difference |
| --- | ---: | ---: | ---: | --- | ---: |
| Twelve cells (below) | | | | equal in all twelve | |
| Tier 1 mixed development | 26,078 | 201,510 | 1,084,581 | statements +21 | +36,864 |
| History hotset 100 | 741 | 9,473 | 44,236 | equal | +24,624 |
| Four Workspaces | 104,311 | 803,666 | 4,352,051 | owner jobs +122, statements -616 | +1,241,088 |
| Prepend on 500 MiB | 16,011 | 16,212 | 200,970 | equal | 0 |
| Namespace 100,000 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | Init has no daemon counters | -53,248 |
| Local snapshot 25,000 | 177,581 | 1,403,960 | 6,747,991 | equal | +4,120 |

- **Tier 1, +21 statements.** All 21 are empty orphan-inode probes of the
  foreground Inode family (164 SQL bytes, 16 bound bytes, 12 VM steps, no row
  each); maintenance Reclaim has 22 fewer. The known effect of issue 320
  section 10, at the scale of a case that unlinks 2,160 files.
- **Four Workspaces.** Read +98 and Mutation +24 jobs; Workspace +122, Inode -514
  and Lease -224 statements. The shared immutable cache is at its allowance in
  both runs and its eviction order follows how the Workspaces interleave: misses
  +67, length batches +32, reader grants +186, evictions +102. A visit that
  misses runs again after its base read. Inferred from counters; T2 models it.
- **Store bytes** vary by pages between samples of unchanged source wherever a
  case has many Commits; the retained terminal and gate receipts differ from
  each other the same way. Storage verdicts allow for that spread.

| Cell | Requests | Owner jobs | Statements | Command ms |
| --- | ---: | ---: | ---: | ---: |
| C01 | 5,002 | 5,002 | 44,004 | 332.7 |
| C02 | 6,002 | 6,002 | 46,004 | 850.5 |
| C03 | 9,022 | 9,038 | 102,540 | 548.4 |
| C04 | 5,342 | 5,342 | 42,644 | 717.0 |
| C05 | 5,890 | 6,000 | 46,637 | 773.3 |
| C06 | 518 | 518 | 9,766 | 140.8 |
| C07 | 1,551 | 1,550 | 23,133 | 268.7 |
| C08 | 521 | 521 | 9,783 | 143.6 |
| C09 | 517 | 517 | 1,055 | 99.5 |
| C10 | 1,547 | 1,546 | 14,406 | 180.4 |
| C11 | 517 | 517 | 9,760 | 109.9 |
| C12 | 3,436 | 3,439 | 24,146 | 242.9 |

### "Before" tables

The unit of work is a step (one command and one Commit) for the first three
cases, a request for the prepend, and a file for Init and the snapshot.

`v016-mixed-development-100mb-5000-k100-v1`, 100 units; before at `196c70fba`

| Measure | Before |
| --- | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 7,616.2 ms; 76.16 ms/unit |
| Commit time, total and per unit | 3,670.3 ms; 36.70 ms/unit |
| Elapsed time (concurrent cases) | n/a |
| Mount / unmount time | 7.3 ms; 0.07 ms/unit / 3.8 ms; 0.04 ms/unit |
| Requests, by opcode | 26,078: Getattr 5,766, Lookup 4,384, Release 3,260, Write 2,730, Forget 2,252, Unlink 2,160, Create 2,000, Open 1,260 |
| Owner jobs, by class | 201,510: Capture 200, Lifecycle 5,941, Mutation 9,665, OperationRecord 155,483, Read 30,221 |
| Statements / executions / VM steps | 1,084,581 / 1,084,884 raw executions / 27,338,518 VM steps |
| Owner service time / queue wait | 1,940.4 ms / 54.3 ms |
| Command and Commit time outside the owner | 9,291.8 ms |
| Store reader grants and batches | 4,818 grants; 8,995 batches |
| Maintenance jobs during the interval | 2,379 jobs, 39,886 rows |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | 0 / 0 / 0 / 0 |
| Store logical / allocated bytes | 114,438,144 / 114,438,144 |
| Overlay logical / allocated bytes | 659,456 / 269,094,912 |
| Daemon peak memory | 87,928,832 |

`dedup-history-hotset-100`, 100 units; before at `196c70fba`

| Measure | Before |
| --- | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 4,215.4 ms; 42.15 ms/unit |
| Commit time, total and per unit | 823.6 ms; 8.24 ms/unit |
| Elapsed time (concurrent cases) | n/a |
| Mount / unmount time | 8.3 ms; 0.08 ms/unit / 2.9 ms; 0.03 ms/unit |
| Requests, by opcode | 741: Setattr 200, Write 200, Lookup 139, Open 100, Release 100, Getattr 1, Flush 1 |
| Owner jobs, by class | 9,473: Capture 200, Lifecycle 501, Mutation 400, OperationRecord 6,900, Read 1,472 |
| Statements / executions / VM steps | 44,236 / 44,539 raw executions / 1,040,619 VM steps |
| Owner service time / queue wait | 123.7 ms / 20.0 ms |
| Command and Commit time outside the owner | 4,895.2 ms |
| Store reader grants and batches | 632 grants; 534 batches |
| Maintenance jobs during the interval | 1,300 jobs, 1,100 rows |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | 0 / 0 / 0 / 0 |
| Store logical / allocated bytes | 6,115,000 / 6,115,328 |
| Overlay logical / allocated bytes | 249,856 / 268,685,312 |
| Daemon peak memory | 48,029,696 |

`v016-workspace-four-100mb-5000-k100-v1`, 400 units; before at `196c70fba`

| Measure | Before |
| --- | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 38,292.0 ms; 95.73 ms/unit |
| Commit time, total and per unit | 65,203.3 ms; 163.01 ms/unit |
| Elapsed time (concurrent cases) | 27,087.1 ms |
| Mount / unmount time | 23.0 ms; 0.06 ms/unit / 15.3 ms; 0.04 ms/unit |
| Requests, by opcode | 104,311: per connection: 26,078, 26,078, 26,077, 26,078 |
| Owner jobs, by class | 803,666: Read 119,115, Mutation 38,457, Capture 800, Lifecycle 23,783, OperationRecord 621,932 |
| Statements / executions / VM steps | 4,352,051 / 4,353,323 raw executions / 109,522,354 VM steps |
| Owner service time / queue wait | 11,534.4 ms / 19,002.4 ms |
| Command and Commit time outside the owner | 72,958.5 ms |
| Store reader grants and batches | 15,482 grants; 34,176 batches |
| Maintenance jobs during the interval | 9,509 jobs, 161,749 rows |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | 0 / 0 / 0 / 0 |
| Store logical / allocated bytes | 132,616,192 / 132,616,192 |
| Overlay logical / allocated bytes | 1,912,832 / 270,348,288 |
| Daemon peak memory | 191,225,856 |

`prepend-head-4k-on-500mib-result-capped-v2-ops-1`, 16011 units; before at `196c70fba`

| Measure | Before |
| --- | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 4,280.5 ms; 0.27 ms/unit |
| Commit time, total and per unit | 13.0 ms; 0.00 ms/unit |
| Elapsed time (concurrent cases) | n/a |
| Mount / unmount time | 6.2 ms; 0.00 ms/unit / 16.7 ms; 0.00 ms/unit |
| Requests, by opcode | 16,011: Write 8,001, Read 8,000, Setattr 5, Lookup 1, Getattr 1, Open 1, Flush 1, Release 1 |
| Owner jobs, by class | 16,212: Capture 2, Lifecycle 6, Mutation 8,007, OperationRecord 186, Read 8,011 |
| Statements / executions / VM steps | 200,970 / 200,976 raw executions / 7,888,982 VM steps |
| Owner service time / queue wait | 536.6 ms / 7.0 ms |
| Command and Commit time outside the owner | 3,749.9 ms |
| Store reader grants and batches | 8,005 grants; 8,227 batches |
| Maintenance jobs during the interval | 15 jobs, 22 rows |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | 0 / 0 / 0 / 0 |
| Store logical / allocated bytes | 530,900,008 / 530,907,136 |
| Overlay logical / allocated bytes | 294,912 / 268,701,696 |
| Daemon peak memory | 86,949,888 |

`namespace-100000`, 100000 units; before at `196c70fba`

| Measure | Before |
| --- | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 7,255.8 ms; 0.07 ms/unit |
| Commit time, total and per unit | n/a |
| Elapsed time (concurrent cases) | n/a |
| Mount / unmount time | n/a / n/a |
| Requests, by opcode | UNAVAILABLE (no daemon counters) |
| Owner jobs, by class | UNAVAILABLE (no daemon counters) |
| Statements / executions / VM steps | UNAVAILABLE (no daemon counters) |
| Owner service time / queue wait | UNAVAILABLE (no daemon counters) |
| Command and Commit time outside the owner | UNAVAILABLE (no daemon counters) |
| Store reader grants and batches | UNAVAILABLE (no daemon counters) |
| Maintenance jobs during the interval | UNAVAILABLE (no daemon counters) |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | UNAVAILABLE (no daemon counters) |
| Store logical / allocated bytes | 516,280,320 / 516,280,320 |
| Overlay logical / allocated bytes | n/a |
| Daemon peak memory | UNAVAILABLE |

`local-snapshot-create-25000-onebyte-v1`, 25000 units; before at `196c70fba`

| Measure | Before |
| --- | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 10,926.3 ms; 0.44 ms/unit |
| Commit time, total and per unit | 8,280.0 ms; 0.33 ms/unit |
| Elapsed time (concurrent cases) | n/a |
| Mount / unmount time | 7.3 ms; 0.00 ms/unit / 23.4 ms; 0.00 ms/unit |
| Requests, by opcode | 177,581: Setattr 51,030, Write 25,512, Release 25,512, Getattr 25,001, Lookup 25,000, Create 25,000, Open 512, Opendir 6 |
| Owner jobs, by class | 1,403,960: Capture 6, Lifecycle 25,531, Mutation 101,543, OperationRecord 1,120,661, Read 156,219 |
| Statements / executions / VM steps | 6,747,991 / 6,748,003 raw executions / 169,088,921 VM steps |
| Owner service time / queue wait | 10,725.1 ms / 545.6 ms |
| Command and Commit time outside the owner | 7,935.6 ms |
| Store reader grants and batches | 1,284 grants; 982 batches |
| Maintenance jobs during the interval | 5,421 jobs, 253,599 rows |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | 0 / 0 / 0 / 0 |
| Store logical / allocated bytes | 929,952 / 933,888 |
| Overlay logical / allocated bytes | 28,934,144 / 297,369,600 |
| Daemon peak memory | 49,557,504 |

## T1 diagnosis (2026-10-13)

No product change. The Commit of the tier 1 case was modelled from source until
the Store side reproduced the receipt: 51.4 locator batches, 137.9 catalogue
queries and 137.8 pack reads a Commit plus five fixed reads give the 332.1 Store
transactions a Commit that the receipt counts. Five cause sentences and a ranked
candidate list are in [T1-DIAGNOSIS.md](T1-DIAGNOSIS.md); the launcher proposal
owner decision 1 asks for is [proposals/LAUNCHER.md](proposals/LAUNCHER.md).
A count test was written first, `product_commit_history_cost` (twelve equal
Commits from one Workspace, no mount). Run once on the host at this tree it
shows the Store reads of a Commit growing with the Commits before it: pack reads
9 to 41, catalogue queries 12 to 53, locator misses 50 to 72. It asserts only
that each Commit captures the same rows; exact counts are staged with the fix.
Checks: host build and one host run of the new test, PASS in under 1 s.
Verdict: diagnosis complete; the owner is asked for targets. Candidates 1 to 5
need no owner decision and continue; P1 to P4 are proposals.
Remains a Commit: 1,555 record jobs, 332 Store transactions, 36.7 ms.

## T1 batch 1: keep the producer between Commits (2026-10-13)

Cause C2: each Commit made a new Storage producer handle and read the policy
row, the content-hint table and the value-group catalogue again. Change: a
bound Workspace keeps the handle of its last completed Commit; a Commit that
does not complete drops it. Commit `56a6424e1`, tag `t1a`, one sealed build.
Decisions used: none; question 4 of the T1 diagnosis checkpoint is open.
Checks: count test restaged, PASS. One sample each of the tier 1 case, the
twelve cells and the four-Workspace case: every proof PASS, every functional
check PASS where a receipt has one, every timing row INELIGIBLE. Host daemon
suite: 89 binaries PASS, the 2 known unrun-precondition binaries FAILED as
before (`complete_installed_roots`, `host_handoff`). fmt and Clippy clean.
Linux, one target a container: `mounted_concurrency` 5, `mounted_parking` 4,
`finite_service` 1 and `install_slots` 1 tests PASS. Boundary guard PASS.
Verdict: kept. Every predicted counter moved as predicted or further, storage
is not worse, and the twelve cells are count-equal to "before".
Remains a Commit of the tier 1 case: 1,555 record jobs, 94 Store transactions,
73 pack reads (12 at Commit 1, 98 at Commit 100), 29.0 ms.

Prediction against result, tier 1 case, 100 Commits:

| Counter | Before | Predicted | After |
| --- | ---: | ---: | ---: |
| Storage catalogue queries | 13,793 | about 600 | 620 |
| Store statements that sort | 13,693 | about 600 | 421 |
| Policy reads / hint-table reads | 100 / 100 | 1 / 1 | 1 / 1 |
| Store transactions | 33,211 | about 19,500 | 9,395 |
| Store returned rows | 660,113 | under 100,000 | 30,958 |
| Store full-scan steps | 553,786 | not predicted | 4,900 |
| Locator batches / misses | 5,140 / 37,224 | lower, not predicted | 1,193 / 15,840 |
| Pack reads | 13,775 | not predicted to move | 7,277 |
| Pack bytes read | 77,637,638 | not predicted | 55,552,104 |
| Pooled groups written / pack bytes written | 323 / 7,291,523 | equal | 323 / 7,291,238 |

Two predictions were wrong on the low side. Transactions fell further because
locator batches and pack reads fell too. Pack reads fell because the rebuild of
the pooled-value index read every group of the window, not only the groups the
Commit's leaves reference; the count test's small tree hid that, since its
Commits read the same groups anyway (inferred from `sync_range`, not counted
separately). Cause C3 remains: pack reads still grow from 12 to 98.

Command time moved 7,616 to 8,094 ms (+6.3%) with identical requests, jobs and
opcodes; that is inside the one-sample spread and is not attributed. Commit
time moved 3,670 to 2,902 ms (-20.9%), more than the spread. Daemon peak
memory fell from 87.9 MB to 74.9 MB.

`v016-mixed-development-100mb-5000-k100-v1`, 100 units; before at `196c70fba`; after at `56a6424e1`

| Measure | Before | After |
| --- | ---: | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 7,616.2 ms; 76.16 ms/unit | 8,094.2 ms; 80.94 ms/unit |
| Commit time, total and per unit | 3,670.3 ms; 36.70 ms/unit | 2,902.0 ms; 29.02 ms/unit |
| Elapsed time (concurrent cases) | n/a | n/a |
| Mount / unmount time | 7.3 ms; 0.07 ms/unit / 3.8 ms; 0.04 ms/unit | 7.2 ms; 0.07 ms/unit / 5.3 ms; 0.05 ms/unit |
| Requests, by opcode | 26,078: Getattr 5,766, Lookup 4,384, Release 3,260, Write 2,730, Forget 2,252, Unlink 2,160, Create 2,000, Open 1,260 | 26,078: Getattr 5,766, Lookup 4,384, Release 3,260, Write 2,730, Forget 2,253, Unlink 2,160, Create 2,000, Open 1,260 |
| Owner jobs, by class | 201,510: Capture 200, Lifecycle 5,941, Mutation 9,665, OperationRecord 155,483, Read 30,221 | 201,510: Capture 200, Lifecycle 5,941, Mutation 9,665, OperationRecord 155,483, Read 30,221 |
| Statements / executions / VM steps | 1,084,581 / 1,084,884 raw executions / 27,338,518 VM steps | 1,084,503 / 1,084,806 raw executions / 27,337,583 VM steps |
| Owner service time / queue wait | 1,940.4 ms / 54.3 ms | 2,203.1 ms / 72.1 ms |
| Command and Commit time outside the owner | 9,291.8 ms | 8,721.0 ms |
| Store reader grants and batches | 4,818 grants; 8,995 batches | 4,818 grants; 8,995 batches |
| Maintenance jobs during the interval | 2,379 jobs, 39,886 rows | 2,379 jobs, 39,886 rows |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| Store logical / allocated bytes | 114,438,144 / 114,438,144 | 114,405,376 / 114,405,376 |
| Overlay logical / allocated bytes | 659,456 / 269,094,912 | 659,456 / 269,094,912 |
| Daemon peak memory | 87,928,832 | 74,936,320 |

Four Workspaces (`v016-workspace-four-100mb-5000-k100-v1`), sampled at the same
identity because it is the case where a kept handle meets other publishers:

| Counter, 400 Commits | Before | After |
| --- | ---: | ---: |
| Storage catalogue queries | 55,874 | 2,480 |
| Pack reads (last Commit) | 177,152 (877) | 32,027 (104) |
| Pack bytes read | 694,834,623 | 218,040,719 |
| Store transactions / statements | 255,288 / 834,088 | 40,512 / 136,394 |
| Store transaction time, summed | 25,948 ms | 3,889 ms |
| Pooled groups written / pack bytes written | 1,292 / 23,146,992 | 1,292 / 21,448,117 |

Pooled reuse is equal (1,292 groups) and the Store is smaller, so the side
effect named in the diagnosis (a duplicate value when another Workspace
publishes below a kept cursor) did not occur in this sample. Overlay logical
bytes are 49,152 higher (1,912,832 to 1,961,984) with the single-Workspace
overlay equal; this change writes nothing to the overlay, so it is recorded as
unexplained and watched in stage T2.

`v016-workspace-four-100mb-5000-k100-v1`, 400 units; before at `196c70fba`; after at `56a6424e1`

| Measure | Before | After |
| --- | ---: | ---: |
| Functional / proof status | PASS / PASS (INELIGIBLE) | PASS / PASS (INELIGIBLE) |
| Command time, total and per unit | 38,292.0 ms; 95.73 ms/unit | 38,850.3 ms; 97.13 ms/unit |
| Commit time, total and per unit | 65,203.3 ms; 163.01 ms/unit | 43,451.2 ms; 108.63 ms/unit |
| Elapsed time (concurrent cases) | 27,087.1 ms | 22,079.4 ms |
| Mount / unmount time | 23.0 ms; 0.06 ms/unit / 15.3 ms; 0.04 ms/unit | 21.6 ms; 0.05 ms/unit / 18.7 ms; 0.05 ms/unit |
| Requests, by opcode | 104,311: per connection: 26,078, 26,078, 26,077, 26,078 | 104,312: per connection: 26,078, 26,078, 26,078, 26,078 |
| Owner jobs, by class | 803,666: Read 119,115, Mutation 38,457, Capture 800, Lifecycle 23,783, OperationRecord 621,932 | 803,442: Read 118,913, Mutation 38,435, Capture 800, Lifecycle 23,783, OperationRecord 621,932 |
| Statements / executions / VM steps | 4,352,051 / 4,353,323 raw executions / 109,522,354 VM steps | 4,355,725 / 4,356,997 raw executions / 109,544,563 VM steps |
| Owner service time / queue wait | 11,534.4 ms / 19,002.4 ms | 11,001.5 ms / 24,148.4 ms |
| Command and Commit time outside the owner | 72,958.5 ms | 47,151.7 ms |
| Store reader grants and batches | 15,482 grants; 34,176 batches | 15,139 grants; 34,008 batches |
| Maintenance jobs during the interval | 9,509 jobs, 161,749 rows | 9,393 jobs, 161,754 rows |
| Scans / sorts / auto-indexes / re-prepares (overlay, foreground) | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| Store logical / allocated bytes | 132,616,192 / 132,616,192 | 130,990,080 / 130,990,080 |
| Overlay logical / allocated bytes | 1,912,832 / 270,348,288 | 1,961,984 / 270,397,440 |
| Daemon peak memory | 191,225,856 | 140,541,952 |

Twelve cells at `56a6424e1`: requests, owner jobs and statements equal the
"before" sample in all twelve; every proof PASS.

Not run at this identity: the overlay, workspace and fuse suites (their source
is unchanged), Clippy in Linux, and the other mounted daemon binaries; they
belong to the hand-back at the close. One overlap is recorded: a preparation of
this run (24 s, tag `t1a`, the tier 1 original) started while a build of the
other worktree had just begun, because the busy check printed its result but
did not stop the command. The check now gates by exit status. No sample of
either worktree was running.

## Hold before the T1 stage end (2026-10-13)

No product change and no sample. After batch 1 the other worktree ran its gate
tier one case after another, and its baseline tiers follow; under the rules of
this run nothing was started beside it. The T1 stage end (the four remaining
selected cases, the six unselected cases and one off-benchmark run at
`56a6424e1`) is therefore still owed, and stage T2 has not started. Meanwhile
the receipts already held were read for tiers 2 and 3:
[T2-T3-PRELIMINARY.md](T2-T3-PRELIMINARY.md). It finds no tier 2 candidate
that needs no owner decision (launch is P1; waiting on the one owner is P2),
and for tier 3 one count to model first (16 Payload statements for a 64 KiB
write) and one fence candidate (two of three statements of every record read).
Verdict: waiting for the machine; nothing is claimed for T2 or T3.
Later the same day the other worktree began its baseline build. From that
point no build, test or sample of this run starts until its baseline is
committed on `sdk-refactor`. Then, in order: rebase onto it, one sealed build,
the six selected cases once, and the T1 stage end at that identity.

## Issue 321 step 1: reservation removal (2026-10-13)

Owner handoff selects #321 over the earlier T1 hold; base `06be791ea`, local only.
The pre-code design is issue #321 comment 6138410697. Source audit: command
mutations/lifetimes validate one route; each maintenance turn selects one namespace.
Global resources is a read-only aggregate, to be routed across separate owners.
This first patch deletes reservation primitives and the pre-write freelist/capacity
check; physical observations remain diagnostic. Existing job SQL text is unchanged.
Host startup/cost/resource tests: 12 passed. Initial transaction test run: 4 passed,
2 failed on obsolete admission counters; corrected exact counters: all 6 passed.
Host Overlay/Fuse all-target build, warning-denying Clippy, formatting, boundary
scan (685 source files) and 50 guard self-tests passed. Bounded checks retained
as reservation-* records; no performance sample. Linux/full-device/mounted proofs,
I/O-error no-space classification, per-Workspace routing and shared budget are not
run/completed yet. Exact-count cells remain unqualified until step 4.
Durable: NOT_RUN — disabled by owner until explicit reauthorization.

## Issue 321 step 1: template engine seam (2026-10-13)

Built the independent copy/open and checked-close ports over schema 33, keeping
all existing job statement text and canonical formats. Two template tests passed:
ordinary namespaces 1/2 and engine isolation, unchanged closed template bytes,
existing-copy refusal and no sidecars. Locked host test build and warning-denying
Overlay Clippy passed; no measurement or daemon integration completion is claimed.
The reservation patch is `1bf04d038`, production LOC 83,042 -> 82,884 (-158).
The next patch supplies daemon template ownership, per-Workspace routing/threads,
shared credits/pager allowance and last-owner deletion. Linux device I/O-error
proof and all step-end selections remain owed. Durable execution is NOT_RUN.
