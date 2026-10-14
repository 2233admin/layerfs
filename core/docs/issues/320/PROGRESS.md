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

## Issue 321 step 1: per-Workspace daemon owners (2026-10-13)

The closed template now creates one file/connection/thread at each bind; all
filesystem and Commit ports receive the route-specific owner. One common ledger
covers pager allowances, scheduler storage and queued/executing/retained jobs.
Namespace rotation is removed; class/capture/install/source fences remain.
Terminal control checks close/joins the worker; last client/result release owns
identity-checked unlink. Replacement/unlink failure preserves custody, no replay.
Host owner suite: 12 passed; cleanup control: 1 passed; new file/budget/deletion
custody proofs: 3 passed. Unchanged completion-storage proof passed after retained
weak scheduler storage was fixed by boxing state; both prior failures remain.
All-target Daemon Clippy passed after removing one pre-existing redundant cast
in its Commit count test; boundary scanned 688 files. No sample or step completion
claim. Linux mounted/device proofs, I/O-error capacity handling, memory/page-cache
selection and five step-end selections remain owed; cells stay unqualified.

## Issue 321 step 1: Linux lifecycle observation correction (2026-10-13)

At `f6e001554`, Linux build passed and mounted concurrency passed all five tests.
The mounted-cycle suite FAILED at its 90-second wall limit during the sibling
writer plateau test (the preceding full-pipe caller test passed). Source diagnosis:
pool diagnostics still counted row reclamation, which need not run before private
connection shutdown; proof aggregate queries used a route-specific connection.
Count terminal reclamation only on successful last-owner file unlink; aggregate
proof observations now use the daemon owner, retaining all plateau/isolation
assertions. The corrected Linux test binaries compile. No performance sample or
step completion; the failed run remains retained and the affected proofs are owed.

## Issue 321 step 1: capacity rollback path (2026-10-13)

At `f898edb1f`, Linux sibling/idle twelve-cycle plateau proofs and stale-token
isolation each passed; mounted Commit passed 7 tests and mounted SQLite Full
passed 2. The previous cycle-suite timeout stays FAILED. The owner's section-9
guide wording is approved for both AGENTS files; apply it in step 4.

Capacity failure at COMMIT now establishes whole-job rollback and withdraws its
reply tickets/hints. Write/truncate I/O errors are narrowly eligible for a
retained-cause NoSpace result after a verified zero-free-block device observation
and whole-job rollback. Other I/O/unknown outcomes remain quarantined. Ordinary
successful writes pay no added statement or physical check. Host transaction,
ticket, lifetime and error-identity tests: 21 passed; Overlay/Fuse warning-denying
Clippy and host/Linux proof builds passed. Separate device proof cases cover
statement spill versus COMMIT and external translation of actual ENOSPC to EIO;
their execution remains owed. No performance sample; step 1 is incomplete.

At `9e36c2a83`, actual ext4 exhaustion passed separately at statement spill and
COMMIT: original SQLite Full, unchanged state/capture bytes/other Workspace,
no reservation and successful exact releases/reclamation. The external I/O-error
case FAILED: original IOERR_WRITE was quarantined because `blocks_free` included
2,621 reserved/internal blocks despite `blocks_available=0` and actual ENOSPC.
Correct the witness to available capacity (`f_bavail`); retain all original proof
oracles and the failed outcome. Production LOC for that patch: 84,020 -> 84,071
(+51). No timing/storage performance result or step completion is claimed.

At `8a22fc9ba` the available-block witness compiled and both external I/O-error
device proofs passed separately (statement spill and COMMIT). Each retained
IOERR_WRITE/778 inside NoSpace, kept state/capture bytes/the independent Workspace,
and completed exact releases/reclamation. Owned loop fixtures were torn down;
the preceding I/O-error failure remains. Add mounted device variants of the
unchanged no-space syscall/drain proof: select actual device exhaustion or the
existing page limit; the transparent observer requires the exact selected
SQLite cause. Linux binaries compile; mounted device runs remain pending.

At `a45f6725e`, all four mounted real-device arms passed separately: Full and
retained IOERR_WRITE, each normal and forced drain. Original ordinary ENOSPC,
zero acknowledged bytes, unchanged Workspace/file/payload/history, no retained
request custody and clean native drain are proved. The unrelated RLIMIT_FSIZE
install failure also passed its unchanged uncertainty/publication/custody oracle.

For the pending page-cache decision, the owning harness forwards the actual
LIBSQLITE3_FLAGS environment into its Linux build container and seals it in build
metadata. Runtime-only reuse refuses a different compilation arm and checks the
original container's flags. Build-identity tests: 9 passed. Concurrent diagnostics
retain point anonymous/RSS, lifetime cgroup memory/CPU and all SQLite file bytes,
with the actual sealed source identity; no phase-local peak or qualification is
inferred from these points. No cache-option choice or memory qualification yet;
all step-end samples remain owed. Guides' approved wording waits for step 4.

The pending observation patch also retains the checked-closed template's physical
identity handle: before bind its observer does zero SQL and one actual physical
observation; each live file contributes its own three SQL observations. The prior
host resource-count proof failed on its obsolete three-SQL expectation; the exact
new accounting and unchanged failure/custody oracle passed (host 8 tests across
template/resources/Workspace files/completion storage; Linux resources 3).
Workspace backing descriptors survive connection close, prevent inode reuse and
remain in custody on failed unlink; successful unlink closes the handle before
Gone. A refused SQLite close retains the original connection without Drop replay.

Linux application observations first passed 4/6; two fixture-path failures were
retained. Respect the configured template filename and give repeated daemon
starts separate private directories. The next run passed 5/6; the new private
directory's default 0755 violated the existing protected-directory contract.
Set the owned fixture directory to 0700; the unchanged serial low-water proof
passed both startup routes. No product permission or oracle was weakened.
The initial host compile also refused a method-name collision; rename the checked
database-file close port, keeping the existing open-file Close API unchanged.
Overlay/Daemon all-target warning-denying Clippy passed; count decoder tests 23
passed. Section 31 reports the actual cache-build readback and common budget.
Cache-option/RSS qualification and all step-end samples remain pending.

## Issue 321 takeover: retained cache diagnostics (2026-10-13)

Reconciled at unchanged source `878af2ceabdd5debc28ee4ec0fe59c6cfe94ad40`,
product tree `f47fd01593372b64cb6aa2149026b6da14969fc0`, production LOC 84,204.
The clean private branch is `issue321-workspace-overlay`. No comparison arm was
rerun. The current GitHub issue body and REST comments were read; the owner
handoff supplies the already-granted section-9 wording approval.

Both locked release build receipts are PASS: tags `i321-s1-mm-on` and
`i321-s1-mm-off`; pinned Linux image
`sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6`.
Actual compilation-option readback matches enabled and disabled arms. Disabled
uses `LIBSQLITE3_FLAGS=-USQLITE_ENABLE_MEMORY_MANAGEMENT`; enabled has no explicit
flags. Four retained concurrent exec diagnostics use the tier-1 prepared tree,
2,000 files per writer and the same workload. All have runtime exit 0 and owned
container/volume cleanup. These are diagnostics with exit-code checks; no byte
oracle or independent proof, no performance eligibility.

| Arm | CPU allowance | 1 writer wall ms | 4 writers wall ms | Mutation service us/job, 1 / 4 writers | Concurrent writer/Commit phase wall ms |
| --- | --- | ---: | ---: | ---: | ---: |
| disabled | 2 | 1409.6 | 3499.5 | 35.651 / 76.580 | 2723.7 |
| disabled | unrestricted | 1543.2 | 2045.2 | 41.714 / 67.378 | 1808.5 |
| enabled | 2 | 1291.9 | 4004.0 | 29.867 / 113.397 | 3342.9 |
| enabled | unrestricted | 1328.9 | 2076.7 | 30.804 / 69.946 | 1922.4 |

Raw evidence: `benchmark-results/fs-bench-pro/2026-10-13-issue320-i321-s1-`
plus each `mm-on`/`mm-off` `exec-2cpu-tier1`/`exec-unlimited-tier1` tag,
`result.json` and its retained runtime artifacts. Whole phase wall includes
launch and concurrent work; it is not the Commit call time. Constant SQL work
and near-zero owner queue wait do not identify exclusive CPU or lock cost.
The two-CPU observations include substantial CPU throttling. No cache option
is selected by this checkpoint.

The retained disabled-arm overlay-only idle probe also exits 0 with owned
container cleanup. At 16 admitted Workspaces: VmRSS 12,004 KiB, RssAnon
7,728 KiB, RssFile 4,276 KiB, threads 17, common credited limit 8,388,608 B,
pager allowance 1,048,576 B, fixed credits 104,016 B, jobs/outstanding 0.
At zero Workspaces: VmRSS 4,944 KiB, RssAnon 856 KiB. Actual RSS therefore
grows within configured admission; the credit ledger is not measured RSS.
Probe/build source and binary hashes are retained in `owner-memory-off-*`
records under the ignored issue321 target. It contains no FUSE or global Store,
measures idle points, and closes connections without proving terminal file
deletion. It is not loaded-memory, phase-peak or whole-system qualification.

Step 1 remains INCOMPLETE: loaded aggregate memory, SQLite temporary backing,
service-time attribution/build selection, long-history/cold-daemon session,
full tier-1 and four-Workspace samples, and affected correctness coverage remain
required. Steps 2–4 are NOT_RUN. Twelve-cell exact-count compatibility remains
unqualified until step 4; no pin was weakened. Historical failures above remain
unchanged. Durable: NOT_RUN — disabled by owner until explicit reauthorization.

## Issue 321 step 1: temporary backing and loaded diagnostic (2026-10-13)

The overlay now selects and verifies `temp_store=MEMORY` (2), keeping schema 33
and MEMORY journal/OFF/EXCLUSIVE. Source audit of the pinned SQLite confirms
main and statement journals do not spill; ephemeral btrees and sorters follow
the temp-store selection. Ordinary metadata/payload/record/cookie/maintenance
windows bound their cardinalities; request plans/counters retain zero sorts,
full scans, automatic indexes and repreparation. The engine architecture note
records these bounds and distinguishes them from resident memory.

Host and pinned Linux each passed 37 tests: compound 3, engine 12, directory
5, pieces 9, resources 6, template 2. Both builds were separate `--no-run`;
host/Linux Overlay all-target warning-denying Clippy, fmt, boundary scan (688
production files) and 50 boundary self-tests passed. Each invocation has its
own bounded retained record (`temp-memory-*`); Linux containers were removed.
The first relative-path build launch was refused by the busy gate matching its
own argv; no build began. The worktree-qualified command then gated FREE.
No count compatibility pin or byte/custody oracle was weakened.

Before this source change, an external loaded-owner diagnostic reused the
hash-checked disabled-arm libraries from `878af2cea`, product tree
`f47fd01593372b64cb6aa2149026b6da14969fc0`. Probe source SHA-256
`97b4bd1976fd1c174f367473511e54bc1a44cd0fa51edf19366cbbb7ba12be29`,
binary `9959eec1cb8be20d445aec46f80a6d024c9b6edee02bd9f49a2a701b5368c160`.
All 16 configured owners were open; ordinary public Publish, reply and captured
cell read-back exercised 1/4/16 writers at 512 files and 16 at 2,048 additional
files, one 4 KiB payload per file. Exit 0; checked connection close and owned
diagnostic-container removal. No FUSE/global Store, terminal deletion proof,
maximum 128 KiB write-window exercise or eligible timing result.

| Phase | Writers × new files | SQLite exact loaded-phase allocator highwater B | Sampled process RSS maximum B | Sampled anonymous RSS maximum B | Sampled cgroup file / dirty maximum B |
| --- | --- | ---: | ---: | ---: | ---: |
| 0 | 1 × 512 | 5,397,328 | 14,532,608 | 8,314,880 | 12,480,512 / 6,324,224 |
| 1 | 4 × 512 | 5,823,416 | 15,388,672 | 9,093,120 | 21,897,216 / 15,740,928 |
| 2 | 16 × 512 | 7,178,112 | 18,796,544 | 12,500,992 | 60,383,232 / 54,226,944 |
| 3 | 16 × 2,048 | 8,792,056 | 22,736,896 | 16,441,344 | 214,085,632 / 207,929,344 |

Sampling requested 2 ms; actual maximum gaps 3,497,833 / 3,582,042 /
3,507,875 / 4,625,333 ns, with 6 / 29 / 112 / 488 samples. These are sampled
loaded-window maxima, not continuous phase peaks. SQLite highwater was reset
at each boundary; it includes SQLite allocations across all owners, distinct
from Rust heap/threads/kernel cache. The naked diagnostic container omitted
the owning family's physical resource profile; its points cannot qualify that
profile. The final resource observation reports 178,257,920 payload bytes.

The 8 MiB credit limit is not an 8 MiB RSS/SQLite-heap bound: its last point had
zero jobs, 104,016 fixed credited bytes and a 1 MiB pager suggestion, while
SQLite current heap was 8,160,568 B. This is a coverage gap, not proof of a leak.
Owners and statements were progressively activated, and background maintenance
was still pending at points (`ready_targets=16`, `maintenance_targets=16`).
SQLite private bulk pages are not included in PAGECACHE_OVERFLOW, so that
counter's 131,200 B cannot explain all pager allocations. File cache grows with
written database pages and remains a separately unresolved physical domain.

The next diagnostic must hold the ordinary statement paths constant, observe
maintenance-idle fences, and apply the owning resource profile, retaining
maximum-window/record-page/admission observations. This checkpoint claims no
aggregate physical bound or cache-build selection. Step 1 remains INCOMPLETE;
step 2 is not started. Durable remains NOT_RUN.

## Issue 321 step 1: shared notification work model (2026-10-13)

Source audit at `878af2cea` finds each completed Credit calls the same daemon
notification table twice: Budget::release, then Shared::admission. For any
active registration each call visits the default 288 slots with 289 mutex
turns, including its length query. A native create/append/read cycle has
12 completions: up to 6,936 table-lock turns per file in these two paths,
independent of SQL work. The cost is outside measured owner service; it can
add shared CPU/locking pressure but retained timings do not isolate it.

Selected correction: publish local slot release before returning common byte
credit and notify once after both, including a dead Weak local owner. Move
wakers through 16-element stack windows while keeping callback/drop outside
locks and visiting all slots. Prediction: default active completion release
578 -> 19 table-lock turns; cycle 6,936 -> 228. SQL/request/job counts and
filesystem state do not change. Proof selection: admission_future, owner,
completion_ownership/storage, workspace_databases and install_slots. No new
public operation, resource cap, heap-sized waker list or failed-op replay.
The subsequent sealed step-end diagnostic judges time; no speed claim here.

The first notification proof invocation passed 6 admission tests and FAILED
the worker-loss test's obsolete direct-root `WorkerPanicked` shape. Source
diagnosis: the per-Workspace roster's existing retire/fail path wraps the leaf
worker's original join error in `Retained`; this completion callback is outside
the changed notification-table code. Restage the assertion to require that
exact retained scope and the unchanged original panic payload. Retain this
failure; the other five selected binaries did not start in that invocation.

The corrected admission suite passed 7/7, then completion ownership passed
1/3 and FAILED two checks. Saturation arithmetic omitted the now-reserved
pager allowance; subtract the exact shared readback without weakening the
last-credit/lifecycle assertions. Original-receipt equality found an actual
missing Open receipt observation: the root aggregate counted its closed
template identity check, but the original Open receipt carried only the copy
connection's work. Carry that exact bind observation into the original job
receipt, without adding it to the leaf aggregate again. SQL/physical work is
unchanged; no equality oracle is relaxed. Later selected binaries had not run.
This accounting correction is a separately reviewable product change.

After the receipt/arithmetic corrections, admission 7, completion ownership 3,
completion storage 1 and install slots 1 passed. Owner passed 11/12 and FAILED
the old row-reclaim `closed_namespaces=1` expectation. That daemon diagnostic
was deliberately changed in `f898edb1f` to successful file deletion; raw Close
here proves row retirement while the private connection/file remain owned.
Require exact zero file deletions, the still-owned backing file and empty
namespace/inode rows; keep the original ticket fence/automatic-row cleanup
assertions. Physical terminal deletion remains covered by workspace_databases.
This retained failure is not attributed to notification timing.

The first additional empty-row assertion used a retired route and correctly
received Stale. Correct that new test observation to the existing route-free
global resource port; retain the failed invocation. The independent Workspace
file/budget/deletion-custody binary then passed all 3 tests unchanged.

At the corrected source window the selected Linux disabled-memory-management
arm passed 27/27 tests: admission 7, owner 12, completion ownership 3,
completion storage 1, Workspace backing/custody 3 and install slots 1. Its
separate no-run build passed; the test command finished in 3.1 s inside 90 s.
Host and Linux daemon all-target warning-denying Clippy passed. Formatting,
boundary scan (688 production files) and 50 boundary self-tests passed.
Linux owned containers were removed. Retained labels are
`notification-accounting-linux-off-*`, `notification-final-guards` and the
host source-window labels above. These checks do not qualify mounted workload
timing or aggregate physical memory.

The owning core manifest, lock and complete authorized fuser package provenance
check passed (`notification-fuser-owning-scope`). The broader repository scan
again refuses the unchanged passthrough benchmark's local fuser lock/patch;
retain `notification-fuser-integrity` as FAIL, rather than report a broad PASS.
That unrelated harness is not modified by this correction.

## Issue 321: owner second-round decisions and revised plan (2026-10-13)

Documentation only, on top of unchanged source `20f237499`; production LOC
84,220. No build, test or sample ran for this entry, and no receipt changes.

Owner decisions, recorded in [the plan](../321/PLAN.md) and the issue body:

- Each Workspace's memory is independent; no budget is shared between
  Workspaces. The configured Workspace capacity is the only global bound.
- Three rules are dropped with their machinery: the owner thread with its
  queue, admission, credits and completion tracking; open-file,
  directory-position and kernel-reference state in SQLite; row-by-row cleanup
  of an unmounted Workspace.
- Three rules stay: exact counts as evidence; exact failure with no retry or
  replay; file requests served while a Commit of the same Workspace runs.

Consequences for this ledger:

- Checklist rows "aggregate memory/page cache" and "job classes/in-Workspace
  queue" are SUPERSEDED, not passed. Their retained diagnostics keep their pins
  and verdicts.
- Steps 2 and 3 are replaced by steps A to D; step 4 is step E. Order:
  1, A, B, C, D, E. Step 1 stays INCOMPLETE: the long-history/cold-daemon
  session, full tier 1 and the four-Workspace sample have not run on it.
- The page-cache build option is selected by the independence decision
  (separate caches), conditional on the one-Workspace measurement after step B.
- Source expectations in the plan (about 77,500 to 79,500 production lines after
  steps A and B) are estimates from file sizes, not a measured or traced result.
- Open for the owner: the in-memory kernel-reference map grows with the files
  the kernel remembers; the revised guide wording is a draft, not applied.

Durable: NOT_RUN — disabled by owner until explicit reauthorization.


## Issue 321 takeover: retained Step-1 selections (2026-10-13)

**Owner must know:** Step 1 remains INCOMPLETE. The four-Workspace sample
FAILED; no row is promoted to PASS. The required missing selections ran once
on the existing sealed product `20f23749950a64692d4d59876726725af909a847`,
selected build `2026-10-13-issue320-i321-s1-selected-build`. The first takeover
operation fast-forwarded `issue321-direct-overlay` to its unchanged docs head
`464b121b9`; no product/source build was substituted. Separate-cache build
flag: `-USQLITE_ENABLE_MEMORY_MANAGEMENT`. Retained protected services shared the
Docker VM; this is declared interference, not an isolation claim.

| Selection | Original outcome and scope | Retained identity |
| --- | --- | --- |
| exec concurrency, 2 CPUs | exit 0, cleanup complete; diagnostic only, no oracle/proof or eligible timing; earlier same-product observation reused, not rerun | `2026-10-13-issue320-i321-s1-selected-exec-2cpu` |
| exec concurrency, unlimited CPUs | exit 0, cleanup complete; same diagnostic limitations; earlier same-product observation reused | `2026-10-13-issue320-i321-s1-selected-exec-unlimited` |
| branch session, 16 × 50 then a new cold daemon × 50 | both runtime exits 0; 850 Commits across 17 sessions, no early stop; exact Store/WAL eviction observations were zero resident pages; cleanup complete; exit-code/Commit-kind diagnostic, no independent oracle | `2026-10-13-issue321-takeover-s1-session` |
| tier 1, mixed development 100 MB / 5,000 / k100 | INELIGIBLE cache classification; receipt functional/proof status PASS, native and persisted selective oracles PASS, cleanup Gone; 26,078 requests, 93,702 jobs, 645,242 statements | `2026-10-13-issue321-takeover-s1-tier1` |
| four Workspaces, 100 MB / 5,000 / k100 | FAIL; proof NOT_RUN, aggregate counts unavailable, cleanup UNAVAILABLE; control EOF at call 5 / Workspace 4 | `2026-10-13-issue321-takeover-s1-four` |

Tier-1 raw spans: command 6,986,988,251 ns, Commit 1,834,896,674 ns,
mount 9,114,000 ns, unmount 4,903,333 ns. Persisted Store size 110,485,504 B;
persisted verifier covered 89,358,592 bytes and 5,048 paths, within its original
selective scope. These are ineligible raw observations, not a speed claim.
The session wrapper completed in about 58 s inside 120 s. Its result retains
the diagnostic's existing `source_commit: null` field; the selected build and
original invocation establish the pin above, rather than rewriting the receipt.

Four-Workspace retained logs show an unavailable section-28 observation and
section-30 `[0,0]`, meaning the Resources observer was not admitted. The original
control failure is UnexpectedEof, followed by the original close failure; no OOM
was recorded. Source routes concurrent global observations through a root lane
with two lifecycle slots. AdmissionFull is a plausible explanation, not an
observed serialized cause. That machinery is removed in Step B; it was not tuned.
The other three roles completed their hundred Commits. The failed sample's own
container/volume were positively tied to its clone, their logs and identities
retained, and explicitly disposed. That external disposal does not repair the
receipt's cleanup verdict. The native/persisted proof was not run for this arm.

Before another payload copy, the two takeover samples' sealed manifests were
checked and their own exported payload copies removed using the existing
`drop_test_copy` mechanism, scoped to those samples only. Both checks were PASS;
the tier-1 deletion record covers 450.0 MB of exports. Receipts and original
verdicts remain. No prepared original or protected service was removed.

## Issue 321 Step A source checkpoint (2026-10-13; qualification incomplete)

**Owner must know:** all eleven selected tables and `reclaim` are removed in
source, but Step A is not finished. Linux mounted proofs, the actual tier-1 walk
population and the four required sealed-build selections are NOT_RUN at this
new source identity. B/C/D/E are NOT_RUN. No guide wording or frozen pin changed.
The historical pre-change trace is [Step-A trace](../321/STEP-A-TRACE.md).

One open-state structure sits beside the connection. It holds descriptors,
request associations, independent read consumers, lookup custody, orphan
root/top/floor, generation waits, mounts, kernel references and directory parents,
and accepted-name cookie pages. Changes journal only touched entries; known
whole-job rollback restores memory, while unknown SQL completion retains and
quarantines original custody. SQL accounting and memory ownership counts are
separate. All moved SQL, accounting triggers, table-specific plan probes,
native/cookie retirement jobs and terminal sweeps are deleted. Live payload,
generation and operation-record reclamation remain bounded. Terminal Close
establishes disposal eligibility; the existing control owner drains, checked
closes and identity-checks deletion of the whole Workspace file. Raw Close no
longer claims Gone or zero SQL rows. The obsolete ReplySettled SQL job is removed;
a last watched reply wakes only the already-admitted before-effect capture.

A foreign-cookie regression found that separate engines could mint identical
opaque offsets. A process-wide atomic runtime-identity cursor now keeps them
distinct without a cache, credit or shared memory allowance. Canonical object
identities are unchanged. Private test-daemon directories also replace several
fixtures that otherwise collided on their independently created `1.sqlite`.

Host evidence is retained under `core/target/issue321/step-a-*` (diagnostic/check
artifacts, not sealed performance receipts):

- Overlay functional targets passed after removing obsolete SQL/terminal
  assertions; exact request retention, stale tokens, underflow, lost replies,
  known rollback and byte oracles remain. The 65,536-write fragmentation oracle
  and real SQLITE_FULL rollback passed. An orphan pressure rollback also checks
  exact memory counts, not SQL counts alone.
- Workspace targets passed except the last recorded OPEN test's scope assertion;
  the subsequent Workspace-specific memory observation passed its final six
  native-visit checks (`step-a-final-workspace-tests`).
- Affected daemon directory/native/fence/finite-arrival/indexed-record and bind
  proofs passed. Directory oracles cover both 10 and 4,000 names, repeated
  rewind, partial offsets and foreign-Workspace rejection. The bind proof
  retains the exact unattempted command and duplicate-incarnation cause.
- Warning-denying scoped all-target Clippy passed (`step-a-clippy-v3`), format
  check passed, boundary guard passed, and its 50 self-tests passed. Full fuser
  provenance still FAILS on the retained historical passthrough override; the
  active core owner, lock and authorized patch checks passed separately.
- The broad daemon test command hit 120 s at `product_commit_history_cost` and
  was killed: FAILED as a hang, not a passing suite. Completed binary durations
  sum to 52.270 s; the last completed producer test took 4.21 s. Its twelve-Commit
  history target printed no completed Commit before the kill. No unchanged
  rerun of that target has occurred. Broad-run missing fixture/binary inputs,
  obsolete reservation/terminal checks and frozen count failures remain retained;
  only diagnosed, affected checks were repaired and rerun.
- The five host replay count tests FAIL at their thread-local tracing ownership
  precondition, before exact comparisons. They are not PASS and do not establish
  the twelve mounted cells' counts. The twelve-cell sealed check is still owed;
  no count pin, trace expectation, contract or oracle was relaxed.

A single host allocation diagnostic added 5,000 remembered regular files and
observed 854,848 requested Rust bytes, or `854848 / 5000 = 170.9696 B/entry`.
Its scope includes the kernel-reference and companion inode-custody maps and
retained journal capacity. It excludes SQLite's C heap, allocator rounding,
process RSS and kernel caches. It is neither a heap bound nor the actual mounted
tier-1 walk measurement, and is not a sealed performance qualification. The
public diagnostic reported 5,001 kernel/custody entries including the root.
Idle/loaded 1/4/16-Workspace memory and service-time remeasurement remain Step B.

Production LOC comparison will use the exact first-parent and final staged
archives and be recorded in the source commit; the worktree diagnostic currently
reports 83,704. This is not a committed count. The A+B target 77,500–79,500 is
still an estimate; Step B has not run. Speed/storage comparisons for A are
NOT_RUN; the Step-1 raw baseline above retains its eligibility limitations.

Durable: NOT_RUN — disabled by owner until explicit reauthorization.


Final host source-check follow-up before the A source seal: 37 selected Overlay
checks passed (kernel memory 1, directory 5, lookup 10, revocation 1, native
fences 9, orphans 11), six Workspace native-visit checks passed, and 23 daemon
checks passed after moving cookie destruction outside the connection mutex
(directory 4, owner 12, visit port 4, independent Workspace files 3). These
receipts have their own invocation scope; they do not repair the broad hang
or establish Linux mounted or sealed-sample qualification. A remains unfinished.


A source seal (`i321-a-source-1`, local only; qualification still incomplete):
Production LOC: 84,220 -> 83,704 (delta -516).
Scope: first-party `core/crates` production Rust and shipped SQL; tests, examples,
harnesses, tools, docs, third-party and generated code excluded. New `open/` and
`maintenance/work.rs` are product code and included. Method: identical pinned
`tools/production_loc.py` (SHA-256
`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`) on
first-parent `464b121b9` and final staged-tree Git archives. Reference absent
(retired R9c; last counted 65,417 at tree 498dd1917812). This is source-size
comparison, not a timing/storage qualification or an A+B estimate. Cookie
allocations are detached under the turn and destroyed after releasing the
connection mutex. Final host Fuse all-target tests passed: 24 tests. Linux,
actual mounted walk and A's four sealed selections remain NOT_RUN at this seal.


## Issue 321 Step A mounted-proof follow-up (2026-10-14)

**Owner must know:** Linux data/ownership proofs now pass in the selected scope;
A's mandatory samples and the actual tier-1 walk are still NOT_RUN. This fixes
external proof observations, not product code or count pins. Source seal
`b43cf2a1a` / `i321-a-source-1` produced a PASS release build in 71 s, with
`-USQLITE_ENABLE_MEMORY_MANAGEMENT`, construction workers 1 and identical clean
source before/after. Its Linux mounted test build passed separately in 65 s.

At that product pin, concurrency 5 (including same-Workspace Commit beside 20
writers), mounted Commit 7, cycles 4, links 1, rewind 1, native jobs 1 and
independent Workspace-file proofs 3 passed. The follow-up retained FAILs for
four drain checks still using SQL ownership counts and two SQLITE_FULL fixtures
whose old 80-page ceiling no longer forced exhaustion after table removal.

The affected external proofs now observe SQL and memory separately. FP-21 keeps
all detach/join/request/custody assertions. FP-31 keeps exact partial decrement,
batched frames, hard-link units, reacquisition and stale ownership assertions;
its removed terminal-row-retirement assertions are replaced by exact no-SQL-
cleanup and checked whole-file disposal/baseline memory observations. Physical
Gone is observed through the daemon roster with the original namespace and
Workspace identity, because the connection itself is already gone. The capacity
fixture derives its ceiling from schema pages plus eight, so the same 128 KiB
request must fail after real partial DML; the byte/rollback/ENOSPC/original-
result/drain assertions are unchanged. No workload sample, timeout or frozen
count pin was changed to make a result pass.

The first repaired drain run passed 3/5 and both SQLITE_FULL checks, retaining
2/5 FAILs at the obsolete connection-routed post-unmount observer. After the
roster observation correction, the two affected checks each passed separately
(0.32 s and 4.61 s). No unchanged passing test was resampled. The two physical-
device-full mounted variants are ignored in this ordinary run and NOT_RUN here.
Linux warning-denying Clippy for the changed proofs passed after removing the
deleted sampling helper's imports and one redundant borrow. All earlier FAILs
and the broad host hang remain retained. This is 29 selected Linux functional
checks, not a claim that every final-E mounted binary ran.

The local proof-only seal `i321-a-proofs-2` keeps production code unchanged:
Production LOC: 83,704 -> 83,704 (delta +0). The pinned counter on exact first-
parent/final staged archives owns the comparison. Reference absent (retired R9c;
last counted 65,417 at tree 498dd1917812). The source seal does not finish Step A.
Durable: NOT_RUN — disabled by owner until explicit reauthorization.


## Issue 321 Step A counter-reader compatibility (2026-10-14)

**Owner must know:** this is strict observation decoding so the mandatory
runs can collect current data. It does not re-pin any cell, storage schema,
profile, source oracle or final guide. A/E qualification remains incomplete.
The prior reader required the old 31-value resource array; removed SQL ownership
counters made the new 28-value array unreadable, which would stop the session's
observation after its first fifty Commits. Treating removed counters as zero
would misreport current state and is not used.

The reader now uses the actually emitted section 32 as the explicit discriminator:
28 resource values plus exactly eleven memory values. SQL and memory fields stay
separate; current SQL dictionaries contain no wait_refs/orphan_rows/retire_targets.
Historical 31-value arrays remain readable with their original fields. A short
array without the memory discriminator, wrong memory cardinality, or memory
without its resource observation is refused. Original cumulative/per-call memory
arrays are retained; no phase delta, resident bound or fake SQL row is produced.
Frozen request/job/statement expectations and Storage readback/source pins stay
unchanged and failing until E. The changed counter/runner suite passed 306 tests
in 9.502 s, bounded at 120 s; focused decoder tests passed 25. The proposed guide
wording is not applied.

Local tooling-only seal `i321-a-observe-3`: Production LOC: 83,704 -> 83,704
(delta +0), identical pinned counter on exact first-parent/final staged archives.
Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812). Mandatory
A runs/walk are still owed; no source-identity treatment is resampled here.


## Issue 321 Step A sealed selections (2026-10-14)

**Owner must know:** the four-Workspace selection FAILS; its independent proof
is NOT_RUN and cleanup is UNAVAILABLE. This is not hidden by the passing native
concurrency proofs or the tier-1 functional result. It failed at Commit call 51
with the original UnexpectedEof and close OS57. Retained log call 50 has section
28 unavailable and section 30 `[0,0]`: its Resources observation was not admitted.
The daemon remained running, with no OOM. The original cause is not serialized
as AdmissionFull; do not claim it was. The two-slot root observation machinery
is removed in B, not tuned. Original receipt verdicts remain; explicit disposal
of its positively volume-bound container does not establish product cleanup.

All selections used PASS sealed build `2026-10-14-issue321-a-observe-3-build`,
clean source `d5c6d2678`, same production implementation as `b43cf2a1a`,
construction workers 1, existing separate-cache compilation flag and the pinned
image. Host build completed in 47 s; no tracked edits overlapped a build/sample.
Fresh append-only run names below identify retained records, not eligibility.

| Selection | Outcome | Run identity |
| --- | --- | --- |
| exec, 2 CPUs | exit 0; all phases returned; cleanup complete; diagnostic only, no oracle/proof | `2026-10-14-issue321-a3-exec-2cpu` |
| exec, unlimited CPUs | exit 0; all phases returned; cleanup complete; same diagnostic limits | `2026-10-14-issue321-a3-exec-unlimited` |
| 16 × 50 plus new evicted-Store daemon × 50 | both exits 0; 850 Commits / 17 sessions; no early stop; eviction exit 0; cleanup complete; diagnostic only | `2026-10-14-issue321-a3-session` |
| tier 1 / mixed 100 MB, 5,000, k100 | INELIGIBLE; receipt functional PASS, proof PASS, cleanup Gone; 26,078 requests, 93,702 jobs, 562,975 statements | `2026-10-14-issue321-a3-tier1` |
| four Workspaces / 100 MB, 5,000, k100 | FAIL; proof NOT_RUN; counts unavailable; cleanup UNAVAILABLE | `2026-10-14-issue321-a3-four` |

Tier-1 raw comparison with the retained Step-1 row; both cache-ineligible:

| Field | Step 1 | A | Signed raw delta |
| --- | ---: | ---: | ---: |
| command ns | 6,986,988,251 | 7,041,905,044 | +54,916,793 |
| Commit ns | 1,834,896,674 | 1,930,366,501 | +95,469,827 |
| mount ns | 9,114,000 | 9,130,708 | +16,708 |
| unmount ns | 4,903,333 | 3,802,375 | -1,100,958 |
| complete wall ns | 9,179,726,432 | 9,277,185,038 | +97,458,606 |
| statements | 645,242 | 562,975 | -82,267 |
| overlay logical/allocated B, terminal template endpoint | 233,472 | 135,168 | -98,304 |
| Store logical B, same external endpoint scope | 114,528,256 | 114,532,352 | +4,096 |
| Store allocated B | 114,532,352 | 114,536,448 | +4,096 |

The overlay endpoint is the remaining template after cleanup, not the peak
active Workspace footprint. Store growth is preserved, not described as an
algorithmic storage saving. This is no eligible speed comparison. Tier-1
export copies were removed after a PASS sealed-manifest check (450.0 MB), retaining
all receipts. Four's exact container/clone relationship and final logs precede
its own external disposal record. No original or unrelated container was removed.

The 2-CPU diagnostic's one-writer create/append/read were 270.5/125.4/192.6 us
per file; four writers 636.2/325.4/420.5. Unlimited: one writer 272.5/128.0/179.2;
four 354.0/163.1/249.6. Mutation service time rose 30 -> 62 us under 2 CPUs,
30 -> 46 us unlimited. Exact original class counts/service/wait operands and
point memory/SQLite logical+allocated observations stay in each diagnostic.
They are shared-machine single observations, not eligible speed claims. The
session took 58.4 s; final cold session Store observation 119,607,296 B. Its
original source_commit null field remains, tied to the pinned selected build.

The first standalone tier-1 lstat diagnostic completed and cleaned up, but
numeric snapshots preceded the walk: `observe` collects external state without
issuing Status. Its population measurement is INCOMPLETE in a separate disposition,
not a fabricated kernel-map PASS. The corrected, independently pinned diagnostic
requests actual Status before/after the walk and retains SQL and memory fields.
This is a tooling correction, not a workload/performance resampling or oracle change.
Its source is `tools/kernel_reference_walk.py`; the first diagnostic remains.
No production code changes: Production LOC: 83,704 -> 83,704 (delta +0), pinned
counter on exact first-parent/final staged archives. Reference absent (retired
R9c; last counted 65,417 at tree 498dd1917812). A's map population remains owed
until that corrected observation. B/C/D/E remain NOT_RUN. Durable remains NOT_RUN.


## Issue 321 Step A qualification follow-up (2026-10-14)

The owner must know: A is still IN_PROGRESS. The required four-Workspace
selection failed at the earlier seal; no finished-step comment is posted and
B has not started. The smallest relevant correction makes route-free Read
observations use the already configured ordinary slot limit, as routed Read
jobs do, instead of the Lifecycle limit. Neither configured capacity nor the
shared-budget machinery is tuned. This entire mechanism is removed in B.
A focused test holds three successful observations at a configured three-slot
Read limit, then asserts the exact original unadmitted fourth command and no
additional admitted/SQL work. The earlier failed selection remains FAIL;
a new sealed identity is required before the affected selection runs once.

Actual mounted memory diagnostic: the corrected Status-based walk at tool tag
`i321-a-kernel-4`, against sealed product `d5c6d2678` (production unchanged from
`b43cf2a1a`), observed 5,048 paths: 4,984 regular files and 64 directories,
99,934,464 logical regular-file bytes. Kernel references grew from 1 to 5,048,
parent entries from 1 to 64, and file custody from 1 to 5,048. One native mount
remained; other open-state categories were zero. SQL rows were unchanged,
as were 66 aggregate pages and the two 135,168-byte SQLite files. PID 1's
point RSS was 23,056 KiB (23,609,344 B); this includes the whole daemon/shared
part, not map-only memory or a per-Workspace bound. The isolated Rust-allocation
diagnostic remains 854,848 / 5,000 = 170.9696 requested B per entry including
companion custody and retained journal capacity. It excludes C heap, allocator
rounding and kernel memory. Walk receipt is functional PASS, measurement
AVAILABLE, exit 0 and owned cleanup complete, 3.984 s wrapper wall. The first
incomplete walk receipt is preserved. No cache-eligible speed claim follows.

Physical-device qualification at the unchanged OFF SQLite build setting:
DML-full, COMMIT-full and ENOSPC-to-EIO translation each PASS; exact failure
phase, one original attempt, SQL and memory rollback, retained capture and peer
isolation are asserted. Raw-daemon-at-full PASS (0.45 s), normal mounted drain
PASS (0.07 s), forced mounted drain PASS (0.06 s); each owned loop fixture
reports completed teardown. The first non-pinned device invocation remains a
separate scoped receipt. The pinned DML command included 13 s of feature-set
compilation despite a combined-package --no-run build; the matching overlay-only
--no-run then passed before the remaining overlay proofs. Daemon/mounted proofs
were built with their matching package selection first. Every test command had
a wall stop <=120 s; the fixture also stops its test at 90 s.

Linux `resources_observation`: four tests PASS, 0.01 s, including original
failure custody, unchanged SQL accounting and the three-held-results check.
Its first host run retained an obsolete expectation that raw Close performs
terminal row disposal: FAIL after a bounded 3 s. Raw Close now checks Queued
and retained namespace rows; whole-file terminal control disposal remains
covered by existing `workspace_databases` and `mounted_drain` proofs. No
compatibility production API was added. Scoped Linux Clippy with warnings
as errors passed for the changed observation and device proofs.

The original 120 s broad-command `product_commit_history_cost` hang remains
FAILED. Its retained output contained no phase marker, so it cannot establish
whether Init, bind, mutation or Commit was blocked. Source uses the real product
constructor and Disposable Store, so it is relevant rather than a retired
cleanup-mechanism test. Four small phase markers were added to this external
test, without changing its 12 Commits, tree, or exact Storage assertions.
The new instrumented identity, separately built --no-run, completed all twelve
Commits and the original assertions in 0.31 s (1.788 s wrapper, 115 s test
wall stop). This identifies no reproducible A correctness failure and does not
turn the older aggregate timeout into PASS or claim its cause is known.

Final A SQL removal scan finds no references to the eleven moved tables or
`reclaim` in overlay production source/shipped SQL; all three terminal/native
retirement modules are absent. Exact memory ownership remains distinct from
SQL/storage counters; live generation/payload maintenance remains. Twelve
frozen cells have not been re-pinned; retained host count checks FAIL and the
sealed twelve-cell selection is NOT_RUN. Durable is NOT_RUN — disabled by
owner until explicit reauthorization. A's final four-Workspace selection,
new build seal and finished-step disposition are pending.


## Issue 321 Step A finished checkpoint (2026-10-14)

The owner must know: Step A is complete with the scoped proofs and required
selections below. The four-Workspace blocker is resolved at the new source;
its old failed receipts remain FAIL. Performance rows remain cache INELIGIBLE;
no eligible speedup is claimed. Step B is next. Final E count pins, all-mounted
campaign, contracts/guides and SDK rebase remain NOT_RUN. Durable remains
NOT_RUN — disabled by owner until explicit reauthorization.

Correction seal `0bebde083` / `i321-a-qualify-5`, tree
`966d47370740961cd803e47fa317f54add7d671e`: clean locked build PASS, wrapper
58.917 s, construction workers 1, existing separate-cache SQLite build flag,
pinned Linux image. No tracked edit overlapped build/sample. It corrects the
route-free Read/Lifecycle slot mismatch, not the configured capacities. The
focused regression and complete four-Workspace sample now pass their functional
requirements. The exact admission cause of the old socket failure was not
serialized; source mismatch and new regression establish the correction,
without inventing a more precise historical cause.

| Required A selection | Exact source/build scope | Verdict |
| --- | --- | --- |
| exec at 2 CPUs | A3 `d5c6d2678`; retained original run | exits 0 / cleanup complete; diagnostic only, no oracle/proof |
| exec unlimited | A3 `d5c6d2678`; retained original run | exits 0 / cleanup complete; diagnostic only, no oracle/proof |
| 16 × 50, new evicted Store daemon × 50 | A3 `d5c6d2678`; retained original run | 850 Commits / 17 sessions, exits 0 / eviction 0 / cleanup complete; diagnostic only |
| tier 1 mixed 100 MB, 5,000, k100 | A3 `d5c6d2678`; retained original run | INELIGIBLE; receipt functional PASS / proof PASS / cleanup Gone |
| four Workspaces 100 MB, 5,000, k100 | A5 `0bebde083`, new affected selection | INELIGIBLE; receipt functional PASS / proof PASS / cleanup Gone; 400 acknowledged Commits |

Four's external performance wall is 12,878,231,333 ns / 15 s bound. Separate
proof is 18,993,699,459 ns / 60 s bound; receipt complete wall is 47,491,961,851 ns.
Wrapper wall is 43.521 s; these scopes differ and are not summed. Raw cumulative
phase ns: command 27,659,994,971; Commit 19,831,966,880; mount 25,281,334;
unmount 18,378,707. Concurrent phase totals overlap and exceed the performance
external wall. Exact requests/jobs/statements: 104,311 / 374,519 / 2,248,448.
The old Step-1 and A3 four samples failed, so successful speed/storage deltas
against them are UNAVAILABLE, not invented zeros. Tier-1's raw comparison and
both exec diagnostics' raw deltas/scopes remain in the preceding A3 entry.

Four's terminal template overlay endpoint logical/allocated is 135,168 B;
Store endpoint including observed sidecars is 138,600,448 B logical/allocated.
The closed exported main Store is 134,373,376 B. This endpoint is not peak
active-overlay storage. Original own resource guards report no OOM or swap,
and main Store is below the unchanged 4 GiB bound. VmHWM 129,806,336 B is a
whole-daemon lifetime peak, not a phase or per-Workspace measurement. The A4
actual walk and requested allocation-per-kernel-entry results in the preceding
entry satisfy A's memory selection; idle/loaded 1/4/16 memory is B work.
The 1,361-file sealed manifest passed a full hash check before this sample's
546.1 MB exported/normalized payload copies were removed. Receipt and all
numeric/proof evidence remain; originals were not removed.

A removed all eleven SQL ownership tables, their accounting/triggers/plan
queries and dedicated retirement modules, plus `reclaim` and terminal row
sweeps. One touched-entry-journaled open state sits next to each connection.
Known rollback restores SQL/memory together; exact uncertain custody is retained.
All six device arms, 29 selected Linux functional checks, targeted host/Fuse
checks and the observation decoder/runner suite retain their exact own pins.
Whole-file disposal, request drain, last-owner release, exact path identity and
peer isolation are covered by focused external/control/mounted proofs. Counts
for memory and SQL remain distinct. No test-only compatibility production path
was introduced. Final SQL removal scan is clear; live payload/generation
maintenance remains. The changed history phase proof passed all twelve original
Storage assertions; the older 120 s aggregate hang remains FAILED, unknown
cause. Other earlier failures and unrun selections retain their dispositions.
Twelve-cell accounting remains failing/expected to fail until E: retained host
checks FAIL; the twelve sealed mounted cells are NOT_RUN, never described PASS.

Exact per-commit source size: `b43cf2a1a` 84,220 -> 83,704 (-516);
`61a07b225`, `d5c6d2678` and `a533c6b71` each 83,704 -> 83,704 (+0);
`0bebde083` 83,704 -> 83,709 (+5). Net A: 84,220 -> 83,709 (-511).
Pinned counter on each exact first-parent/final staged archive:
`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`.
Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).
The A+B estimate 77,500–79,500 remains pending B; this is not an A-only target.


## Issue 321 Step B — one lock per Workspace (2026-10-14)

**Owner must know:**

- Step B is finished in its scoped sense: implementation committed, sealed, the
  five required selections run once each. No selection is an eligible speed
  claim (tier 1 and four-Workspace stay cache-INELIGIBLE; the others are
  diagnostics).
- Daemon peak resident memory is higher in two selections: tier 1 lifetime peak
  89,866,240 B against 74,285,056 B in A, and the 16-session plateau
  115.9 MB against 103.7 MB. It is not live Workspace state (details below);
  the cause is established only as far as stated there.
- Two receive workers per mount is kept, but one worker is faster when several
  processes write in the same Workspace (678 against 854 us per file). Two is
  kept because one worker slows cold reads by 28% and makes every request of
  the Workspace wait for one Store read.
- The A+B source estimate (77,500 to 79,500) was not met: 81,584.
- Reclamation now runs on the calling thread before its call returns; a
  request of the same Workspace can join a drain in progress.
- Twelve-cell exact counts are still expected to fail until E.

### What changed

One mutex and condition variable per Workspace guard its SQLite connection and
in-memory open state. The thread that needs a job takes the lock, runs the job
and releases it. Removed: owner thread, queue, admission slots, byte credits
and budget, ledger, completion and pending handles, the transport enums, the
daemon-wide fuse dispatcher with its lanes and task phases. Each mount has two
plain receive workers; a worker serves its request and its Store read itself.
The lock is not held across a Store read, a whole command or a whole Commit.

Threads observed in the pinned image: per mount `fuser-0`, `fuser-1`, one mount
thread and one fence thread; per daemon two. A had per mount one receive loop,
one owner thread, mount and fence, and per daemon two plus four dispatchers.

Deviation from the plan, reported: a waiting capture or known install holds a
finite frontier. Mutations (for a capture) or source acquisitions (for an
install) that arrive later wait behind it before any effect, so sustained
traffic cannot keep extending what the waiter awaits. No other ordering was
added: the Commit-beside-writers evidence below did not show a need.

Accounting decisions:

- A job records class, statements, lock wait and hold time. Hold time excludes
  condition waits. A readiness check that had to wait is a job of the same
  class; the receipt of the call reports it with its final job.
- Maintenance steps count only in the maintenance totals.
- An observation and a reply attempt run no SQL and are no job. They are
  counted in new diagnostics row 35 `[observations, reply_attempts,
  reply_hold_ns]`.
- A call refused before any effect records no job.
- The checked close runs no counted statement; its Lifecycle job has zero
  statements and its real hold time.
- A panic, an unknown outcome or a failed checked close keeps that Workspace's
  connection, open state and cause. Nothing is replayed or deleted by guess.
  With one Workspace failed or quarantined, the aggregate resource observation
  fails and new mounts are refused; Workspaces already bound keep working
  (asserted in `mount_debt`).

Diagnostics rows: row 1 is 24 values (jobs, maintenance, then jobs, lock wait
and hold by class); rows 11 (dispatcher) and 31 (byte budget) are gone; row 33
marks the schema and the SQLite cache option; row 34 is the observer's job
count; row 35 as above. Wire versions LFSA 2 and LFSD 3. Historical receipts
decode as before.

Production fixes made on the way, each found by a mounted or host test:
forced cleanup observes a retired Workspace through the roster (a by-route
question was Stale); a revoked mount can be replaced by a new attach while old
tokens stay Stale; a quarantined engine is recorded as stopped maintenance so
`mount:debt` is refused again without an owner thread; teardown observes
running requests before joining the loops.

### Tests

Test functions 1,527 -> 1,463; test files 368 -> 361. Deleted because their
subject no longer exists (owner direction 2026-10-14): `admission_future`,
`completion_future`, `completion_storage`, `finite_service`, `install_slots`,
`mounted_parking` (daemon); `dispatch`, `fence` and their support module
(fuse); the `engine_finite` example; and single tests staged on held credits,
full lanes or parked turns in `fp21`, `fp27`, `fp29`, `fp31`, `fp32`, `fp34`,
`fp9`, `mounted_drain`, F4 and F6. Kept and converted: bytes, permissions,
stale tokens, request/open/lookup ownership, drain, rollback, close, failure
custody, file isolation, statement and job counts.

Stale Step A pins found and re-pinned (the exported A tree `02aa9e4e2` fails
them with the same numbers, so they are not B changes):
`commit_record_anatomy` (Workspace/Lease statements 287/85 -> 284/83, 735/235
-> 732/233, 10,079/1,993 -> 10,076/1,991), `request_path_anatomy` (it traced
the template file; C01 statements 36,003 -> 22,003, C03 82,200 -> 51,072, C04
36,073 -> 20,623, C06 7,710 -> 7,185, C10 12,348 -> 11,291; requests and owner
jobs unchanged) and `read_cost`.

Results at the final source, single test thread in the pinned image:

- Linux: all 43 Linux-only mounted binaries and five partly gated ones passed
  in the last full pass; after the last edits the nine affected binaries were
  rerun and passed.
- Host: all 135 test binaries of the daemon, overlay, fuse, bridge, workspace
  and SDK crates ran; after the last edits the fourteen affected ones were
  rerun and passed.
- Host and Linux Clippy with warnings denied (affected crates), format check
  and the product boundary guard (689 files) pass.

Failures retained:

- `mounted_install`, live-writer case: FAILED in three runs because its second
  Commit returned inside one writer iteration (18 logged before, 19 at return,
  19 captured). The assertion now requires a later write only when the Commit
  spanned more than one iteration; the first Commit must still show writes
  landing while it runs (5 -> 17..19 across 37 to 46 samples).
- `mounted_cycles`, blocked-pipe case: final unmount kernel Busy, FAILED twice,
  passed twice; not changed.
- `fp31` reached the 30 s ceiling once (a wait condition that the new request
  accounting can never meet); diagnosed from source and corrected.
- Pre-existing, identical on the exported A tree, not fixed: overlay
  `reply_tickets` (two tests) and `transactions` (one test).
- Environment-dependent, not run to a verdict: `complete_installed_roots`
  (prepared input), `host_handoff` (Linux binary), harness
  `test_context_controller` (one error, missing variable).
- Whole-workspace Clippy cannot compile the `layerfs-project` example
  `benchmark_history` (missing harness file); unrelated and unchanged.
- Harness `test_overlay_storage`: 17 errors from source pins that predate
  Step A; Step C renames the schema again, so the pins are reconciled once in E.
- One aggregate harness discovery command reached its 60 s limit; the files
  were then run singly (cells 308, evidence 137, registration 54, growth 12).

### Worker count per mount (declared experiment)

Declared before its data: arms 1, 2, 4; one Workspace, four writers of 1,000
files each, no CPU limit, one sample per arm; keep the smallest count within 7%
of the best. A second treatment was declared after those numbers and before its
own: four readers of the mounted prepared tree in one Workspace (4,984 files).

| Arm | create / append / read, us per file | sum | lock wait us per job (Read / Mutation / Lifecycle) | read treatment, mean ms |
| --- | ---: | ---: | ---: | ---: |
| 1 worker | 352.8 / 160.1 / 165.1 | 678.0 | 0 / 0 / 0 | 1,051.2 |
| 2 workers | 422.2 / 207.6 / 223.8 | 853.6 | 15 / 19 / 12 | 817.8 |
| 4 workers | 509.1 / 232.1 / 307.0 | 1,048.2 | 39 / 54 / 57 | 918.6 |
| A (1 loop, 4 dispatchers, owner thread) | 533.8 / 172.7 / 186.4 | 892.9 | queue | 837.0 |

On the first treatment alone the rule selects one worker. Two is kept: it is
the only arm not slower than A on either treatment. Its cost, lock contention
between the two workers under same-Workspace writers, is Step D work (fewer
jobs per file). Arms are commits `8ff367775` (1) and `471727dce` (4); the
selection is `be19ede68`.

### Memory and threads at 1, 4 and 16 Workspaces

One writer per Workspace, 1,000 files each, no CPU limit, `workspace_load.py`.
RSS is the daemon's point value in KiB; "loaded" is after the load with every
Workspace still mounted.

| Workspaces | Build | Threads | Idle RSS | Loaded RSS | create / append / read us per file | Mutation hold us |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | A | 10 | 12,388 | 14,156 | 245.4 / 119.4 / 184.9 | 26 |
| 1 | B | 6 | 12,088 | 13,780 | 242.5 / 120.9 / 189.6 | 25 |
| 4 | A | 22 | 29,356 | 33,504 | 351.0 / 184.8 / 249.7 | 43 |
| 4 | B | 18 | 28,480 | 32,248 | 359.4 / 175.0 / 266.4 | 43 |
| 16 | A | 70 | 35,692 | 43,632 | 737.2 / 280.4 / 336.8 | 155 |
| 16 | B | 66 | 36,648 | 48,676 | 764.9 / 214.5 / 147.0 | 227 |

RSS does not fall after the last cleanup in either build: the allocator keeps
freed memory. B rows are at `1c706e5ff` (same production code as the final
seal apart from one comment).

### SQLite page-cache option (5 to 7% condition)

Paired tier-1 samples at the final source, one each:

| Build | command ns | Commit ns | complete wall ns | peak B |
| --- | ---: | ---: | ---: | ---: |
| separate caches (selected) | 6,744,599,380 | 1,871,598,207 | 9,033,879,459 | 89,866,240 |
| one shared cache | 6,780,103,960 | 1,924,251,042 | 9,093,071,057 | 88,096,768 |

One Workspace alone is not slower with separate caches (command -0.5%, Commit
-2.7%), so the option stays. It is now set in `.cargo/config.toml`.

### Required selections

Sealed build `2026-10-14-issue321-b-qualify-2-build` at `be19ede68` (PASS,
58 s), construction workers 1, pinned image, one sample each. The tier-1 arm
with the shared cache ran at `f401de237` (tooling-only successor, same
compilation inputs).

| Selection | Outcome | Run identity |
| --- | --- | --- |
| exec, 2 CPUs | exit 0; all phases returned; cleanup complete; diagnostic | `2026-10-14-issue321-b4-exec-2cpu` |
| exec, unlimited CPUs | exit 0; all phases returned; cleanup complete; diagnostic | `2026-10-14-issue321-b4-exec-unlimited` |
| 16 x 50 plus new evicted-Store daemon x 50 | both exits 0; 850 Commits / 17 sessions; eviction exit 0; cleanup complete; diagnostic | `2026-10-14-issue321-b4-session` |
| tier 1 / mixed 100 MB, 5,000, k100 | INELIGIBLE; functional PASS, proof PASS, cleanup Gone; 26,078 requests, 93,601 jobs, 563,061 statements | `2026-10-14-issue321-b4-tier1` |
| four Workspaces / 100 MB, 5,000, k100 | INELIGIBLE; functional PASS, proof PASS, cleanup Gone; 104,312 requests, 372,109 jobs, 2,247,402 statements | `2026-10-14-issue321-b4-four` |

Raw comparison with A; cache-ineligible on both sides, single observations:

| Field | A | B | Signed raw delta |
| --- | ---: | ---: | ---: |
| tier 1 command ns | 7,041,905,044 | 6,744,599,380 | -297,305,664 |
| tier 1 Commit ns | 1,930,366,501 | 1,871,598,207 | -58,768,294 |
| tier 1 mount ns | 9,130,708 | 8,636,584 | -494,124 |
| tier 1 unmount ns | 3,802,375 | 5,404,833 | +1,602,458 |
| tier 1 complete wall ns | 9,277,185,038 | 9,033,879,459 | -243,305,579 |
| tier 1 owner jobs | 93,702 | 93,601 | -101 |
| tier 1 statements | 562,975 | 563,061 | +86 |
| tier 1 Store logical / allocated B | 114,532,352 / 114,536,448 | 114,556,928 / 114,556,928 | +24,576 / +20,480 |
| tier 1 overlay logical B (template after cleanup) | 135,168 | 135,168 | 0 |
| tier 1 daemon peak B | 74,285,056 | 89,866,240 | +15,581,184 |
| four: external wall ns | 12,878,231,333 | 11,733,759,958 | -1,144,471,375 |
| four: summed command ns | 27,659,994,971 | 28,505,567,660 | +845,572,689 |
| four: summed Commit ns | 19,831,966,880 | 14,460,393,006 | -5,371,573,874 |
| four: owner jobs | 374,519 | 372,109 | -2,410 |
| four: statements | 2,248,448 | 2,247,402 | -1,046 |
| four: Store logical B | 138,600,448 | 130,613,248 | -7,987,200 |
| four: daemon peak B | 129,806,336 | 128,122,880 | -1,683,456 |
| session: summed Commit ms (17 sessions) | 11,638.9 | 11,457.4 | -181.5 |
| session: summed command ms | 37,753.6 | 37,977.8 | +224.2 |
| session: final Store logical B | 119,607,296 | 119,480,320 | -126,976 |
| session: daemon peak plateau B | 103.7 MB | 115.9 MB | +12.2 MB |

The four-Workspace Store difference is recorded, not explained; it is not
described as a storage saving. Tier 1's -101 jobs are Read jobs.

Exec diagnostic, create / append / read us per file (A in parentheses):

- 2 CPUs: one writer 248.5 / 124.4 / 194.9 (270.5 / 125.4 / 192.6); four
  writers 583.9 / 336.5 / 428.6 (636.2 / 325.4 / 420.5); Mutation hold 27 -> 46
  us (A service 30 -> 62); Commit beside three writers 1,166.0 ms (1,182.6).
- Unlimited: one writer 252.0 / 122.5 / 191.4 (272.5 / 128.0 / 179.2); four
  writers 353.6 / 175.8 / 265.3 (354.0 / 163.1 / 249.6); Mutation hold 26 -> 44
  us (A 30 -> 46); Commit beside three writers 702.4 ms (672.7).

Multi-Workspace write service time is therefore unchanged from A within these
single observations: the growth of Mutation hold time with four concurrent
Workspaces remains, with no queue or owner thread left to cause it.

### Peak memory: what is and is not established

- Tier 1 keeps two external snapshots. At the end of the measured commands and
  Commits, with the Workspace mounted, B's daemon RSS is 47,452 KiB against
  51,836 KiB in A. After the harness then verifies the result by reading the
  whole tree through a second mount and unmounts it, B is at 87,760 KiB and A
  at 72,544 KiB. The lifetime peak is reached in that verification read.
- The same full-tree read on a fresh daemon and a single mount needs less in B:
  39,280 KiB against 42,836 KiB, and is faster (1,790 against 2,020 ms).
- RSS never falls after cleanup in either build, so these numbers are allocator
  high-water marks, not live state. In the session selection both builds reach
  a plateau.
- Not established: why the second mount's read does not reuse the memory the
  first mount's exited worker threads freed. Per-mount worker threads replacing
  long-lived shared dispatchers is the suspected cause. Returning freed memory
  at terminal unmount is a candidate change; it is not made here.

### Maintenance on the calling thread

With no owner thread, live reclamation runs on the thread whose job left work,
in short lock holds, before that call returns. In tier 1 it is 2,779 steps and
111.8 ms inside the interval (A: 2,379 steps, 136.1 ms, after the calls).
Consequences seen in receipts: the stored-row counts of the resource
observation are zero at every control call, and cleanup debt is zero at return.
A request of the same Workspace that finishes a job while a drain is in
progress joins it. No selection showed a cost; it is listed for Step D.

### Tools and harness

`workspace_load.py` (new, `core/docs/issues/321/tools/`): W Workspaces with P
writers or readers each, thread names, point and sampled memory, lock wait and
hold by class. `receipt_metrics.py`, the cells decoder, the fs-bench-pro engine
and `exec_concurrency.py` read both the old and the new rows. The
`engine-finite` registration fixture now hashes a retained source file; the
frozen registry is unchanged.

Payload rule: the three harness samples' exported copies were removed after a
PASS sealed-manifest check (450.1 + 450.1 + 514.0 MB); receipts and prepared
originals remain.

### Source size

`1c706e5ff` 83,709 -> 81,584 (-2,125); `471727dce`, `8ff367775`, `be19ede68`
and `f401de237` each 81,584 -> 81,584 (+0). Net B: 83,709 -> 81,584 (-2,125).
Net A+B: 84,220 -> 81,584 (-2,636); the earlier estimate of 77,500 to 79,500
was not reached. Pinned counter on each exact first-parent and final staged
archive: `c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`.
Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).

Durable execution: NOT_RUN — disabled by owner until explicit reauthorization.
C, D and E remain NOT_RUN. Guides, contracts and the twelve-cell pins are
unchanged until E.

## Issue 321 Step C — table revision (2026-10-14)

Source commit `c8a7bcd1d` (tag `i321-c-source-1`), first parent `19061375e`.
Sealed build `2026-10-14-issue321-c-source-1-build`, the same
`LIBSQLITE3_FLAGS=-USQLITE_ENABLE_MEMORY_MANAGEMENT` and
`LAYERFS_CONSTRUCTION_WORKERS=1` as Step B. Disposable Store / WAL /
synchronous=OFF. Durable execution: NOT_RUN — disabled by owner until explicit
reauthorization. One sample per case; shared machine; the two harness cases
are INELIGIBLE on cache state as before, so no time here is a claim.

### What changed

- No row carries a Workspace key. `ns`, its foreign key and its leading place
  in every primary key and index are removed from every table except the
  `workspace` row; every statement loses that predicate and bound value. The
  `ns`/`route` parameters that only fed it are removed through their call
  chains. The engine keeps the namespace of its one Workspace in memory and
  refuses a second `open_workspace` (`Invalid("database already holds a
  Workspace")`); the `INSERT ... RETURNING ns` text is unchanged.
- Names: `inode` → `fs_inode`, `directory_entry` → `fs_entry`, `payload` →
  `fs_data`, `payload_reference` → `fs_data_ref`, `shrink` → `fs_truncate`,
  `operation_owner` → `commit_run`, `captured_reader` → `commit_reader`,
  `base_source` → `commit_base_pin`, `lease` → `commit_pin`, `maintenance` →
  `cleanup_task`, `indexed_operation_record` → `commit_record`; indexes follow
  their tables. Columns `serial` → `inode`, `gen` → `generation`, `owner` →
  `holder`. Rust types, methods and counter names are unchanged; nothing
  "native" was renamed.
- Record tables: **not merged; two removed.** Trace: `commit_record`
  (indexed) is keyed (operation, 8-byte file scope, kind, 32-byte key) and is
  the only one the Commit path writes. `operation_record` and
  `owned_operation_record` were keyed (owner, kind, integer key) and had no
  production writer — only tests and plan diagnostics called their methods.
  One shape cannot hold both identities without an untyped key, and a
  caller-chosen and an engine-minted operation number could collide in one
  relation. The two tables, their methods, statements, six triggers, plan
  diagnostics and the daemon wrappers are removed.
- `accounting` is one row with the constant key `id=1`. A trigger `UPDATE`
  without a key compiled to scan opcodes (seen in the insert programs' plan
  diagnostics), so each trigger seeks `WHERE id=1`. The daemon aggregate is
  still the sum over its Workspace files.
- The maintenance cursor is (kind, resource, target).
- The schema is 30 pages (33 before). The smallest accepted page quota moves
  from 32 to 24 so that it stays a real creation failure, which three tests
  stage; no other limit changed.
- `PRAGMA user_version` 33 → 34. No migration: the file is created fresh and
  never reopened.

### Tests

Tests of what is gone are dropped; no test was restaged to keep a retired
mechanism alive.

| Dropped | Reason |
| --- | --- |
| overlay `engine::terminal_close_keeps_other_namespaces_unchanged_before_file_disposal` | two Workspaces in one database |
| overlay `engine::backed_owner_and_operation_record_pages_have_no_total_record_limit` | removed record methods |
| overlay `cleanup_observation::fixed_point_work_is_equal_beside_two_unrelated_population_sizes` | population of other Workspaces in one database |
| overlay `reply_tickets::tickets_of_one_namespace_never_affect_another` | two Workspaces in one database |
| overlay `transactions::owner_identities_are_unique_and_increasing_across_namespaces` | two Workspaces in one database (failed identically before) |

Converted, same subject: 30 overlay tests and 6 daemon/workspace tests now use
one Workspace per database — the second Workspace's assertions are removed, a
second database is opened where two Workspaces are compared, or the unrelated
population is moved into the same Workspace under other serials, owners or a
second directory (which is the stronger statement). `close_custody` is split
into one database per kind of custody. A new assertion covers the refusal of
a second Workspace. The staged `a_failed_release_keeps_exact_custody_...`
test depended on which queue index filled its last leaf first; it now fills
the leaves beside the parked row in every index before the quota is reached.

Results at `c8a7bcd1d` (each binary one invocation, 30 s wall limit):

| Scope | Result |
| --- | --- |
| host + Linux all-targets check, Clippy `-D warnings` | clean |
| `cargo fmt --check`, product boundary guard, 999/200-line ceilings | PASS |
| overlay, 41 host binaries | PASS except `reply_tickets` ×2 (`Some(Last)` where `Some(Watched)` is expected) — FAIL identically at Step A and B |
| daemon/fuse/bridge/workspace/sdk, 96 host binaries | PASS except `complete_installed_roots::huge_native...` and `host_handoff` (need prepared inputs, as before) and `request_path_anatomy` ×5 (statement-text pins; Step E) |
| Linux mounted/proof binaries, 42 | PASS (40 daemon/fuse binaries, 2 overlay) |
| static SQL check (`c_verify.py`, scratch tool) | 135 statement texts prepare against schema 34; bound counts match |

Not run in C: the twelve exact-count cells (Step E), the Python harness unit
suites (unchanged sources), `_overlay_storage_source` in the harness oracle
(stale since Step A; Step E).

### Required selections

Before = Step B at `be19ede68`, after = Step C at `c8a7bcd1d`.

| Field | B | C | Signed raw delta |
| --- | ---: | ---: | ---: |
| tier 1 status | INELIGIBLE; PASS/PASS; Gone | INELIGIBLE; PASS/PASS; Gone | |
| tier 1 command ms | 6,744.6 | 6,725.2 | -19.4 |
| tier 1 Commit ms | 1,871.6 | 1,824.2 | -47.4 |
| tier 1 mount / unmount ms | 8.6 / 5.4 | 7.8 / 5.4 | -0.8 / 0.0 |
| tier 1 requests / owner jobs | 26,078 / 93,601 | 26,078 / 93,601 | 0 / 0 |
| tier 1 statements | 563,061 | 562,849 | -212 |
| tier 1 VM steps | 17,658,273 | 16,177,323 | -1,480,950 |
| tier 1 lock hold / lock wait ms | 1,170.9 / 84.2 | 1,130.0 / 79.5 | -40.9 / -4.7 |
| tier 1 maintenance jobs / rows | 2,779 / 39,886 | 2,679 / 39,886 | -100 / 0 |
| tier 1 Store logical = allocated B | 114,556,928 | 114,528,256 | -28,672 |
| tier 1 overlay logical B (template after cleanup) | 135,168 | 122,880 | -12,288 |
| tier 1 daemon peak B | 89,866,240 | 88,813,568 | -1,052,672 |
| four: status | INELIGIBLE; PASS/PASS; Gone | INELIGIBLE; PASS/PASS; Gone | |
| four: external wall ms | 11,733.8 | 11,496.9 | -236.9 |
| four: summed command ms | 28,505.6 | 28,077.6 | -428.0 |
| four: summed Commit ms | 14,460.4 | 14,188.4 | -272.0 |
| four: requests / owner jobs | 104,312 / 372,109 | 104,311 / 372,337 | -1 / +228 |
| four: statements | 2,247,402 | 2,246,971 | -431 |
| four: VM steps | 70,571,026 | 64,598,945 | -5,972,081 |
| four: lock hold / lock wait ms | 8,018.1 / 872.4 | 8,076.7 / 659.6 | +58.6 / -212.8 |
| four: Store logical = allocated B | 130,613,248 | 133,865,472 | +3,252,224 |
| four: overlay logical B | 135,168 | 122,880 | -12,288 |
| four: daemon peak B | 128,122,880 | 134,938,624 | +6,815,744 |
| session: exits (16 × 50 Commits, then fresh daemon on evicted Store × 50) | 0 / 0 / 0 | 0 / 0 / 0 | |
| session: summed Commit ms (17 sessions) | 11,457.4 | 11,529.0 | +71.6 |
| session: Commit median, first / sixteenth / cold session ms | 11.89 / 13.95 / 15.11 | 11.91 / 13.72 / 15.18 | |
| session: final Store logical B | 119,480,320 | 119,603,200 | +122,880 |
| session: daemon VmHWM at the last runtime snapshot KiB | 113,196 | 112,808 | -388 |

Concurrent exec diagnostic (2,000 files per writer; per file µs:
create / append / read; the Commit is of the three-writer run):

| Run | B, 2 CPUs | C, 2 CPUs | B, no CPU limit | C, no CPU limit |
| --- | ---: | ---: | ---: | ---: |
| 1 writer | 248.5 / 124.4 / 194.9 | 244.2 / 122.2 / 188.8 | 252.0 / 122.5 / 191.4 | 239.9 / 119.8 / 187.2 |
| 2 writers | 256.7 / 128.6 / 210.6 | 246.9 / 129.0 / 204.9 | 251.9 / 127.2 / 206.7 | 245.1 / 126.8 / 202.6 |
| 3 writers | 358.5 / 211.4 / 267.0 | 356.8 / 288.0 / 273.8 | 305.3 / 158.1 / 237.3 | 299.3 / 172.3 / 236.4 |
| 4 writers | 583.9 / 336.5 / 428.6 | 665.8 / 335.9 / 414.8 | 353.6 / 175.8 / 265.3 | 354.7 / 174.2 / 265.1 |
| 3 writers + Commit | 596.0 / 222.4 / 289.3 | 583.0 / 212.9 / 258.7 | 353.3 / 158.1 / 301.1 | 353.4 / 154.6 / 233.0 |
| that Commit ms | 1,166.0 | 1,084.0 | 702.4 | 699.9 |

Reading, with the limits of one shared-machine sample each:

- The schema revision removes work per statement, not statements: VM steps
  fall 8.4% (tier 1) and 8.5% (four), statements by 0.04% (the per-Workspace
  startup statements of two tables and six triggers). Times move by about
  1 to 3%, inside what one sample can show; no speed claim is made.
- Storage: the empty overlay template is three pages smaller. The tier-1
  Store is 28,672 B smaller and the session Store 122,880 B larger; the Store
  format did not change in C, so neither is attributed to it. The
  four-Workspace Store has been 130.6 to 138.6 MB across the A, B and C
  samples of identical content, which follows the order in which concurrent
  Commits publish; +3.25 MB here is recorded, not explained further.
- Memory: tier-1 peak -1.05 MB, session -388 KiB, four-Workspace peak
  +6.8 MB (128.1 → 134.9 MB). The four-Workspace peak is a lifetime high-water
  mark of four concurrent Commits and has not been stable across samples
  (A 129.8 MB); nothing in C allocates per row or per Workspace beyond one
  integer. Recorded as an unexplained single observation.
- 2 CPUs with three and four writers shows one slower cell each way
  (append 211 → 288 µs at three writers, create 584 → 666 µs at four); the
  unlimited runs do not repeat it. CPU-limited contention on a shared host;
  not attributed.

Test copies of the two harness samples were removed after their receipts were
read (450.0 MB and 527.5 MB); the originals stay.

### Source size

Production LOC: 81,584 -> 81,006 (delta -578), `core/crates` product source,
pinned `tools/production_loc.py`
(`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`) on the
first-parent and committed-tree Git archives; committed tree
`343b75f73312f82050021149f06cec16838190e1` equals the counted tree. Reference
absent (retired R9c; last counted 65,417 at tree 498dd1917812). Net A+B+C:
84,220 -> 81,006 (delta -3,214).

## Issue 321 Step D — fewer statements and round trips (2026-10-14)

Source commit `a6d1ef177` (tag `i321-d-source-1`), first parent `1d8583471`.
Sealed build `2026-10-14-issue321-d-source-1-build`, the same
`LIBSQLITE3_FLAGS=-USQLITE_ENABLE_MEMORY_MANAGEMENT` and
`LAYERFS_CONSTRUCTION_WORKERS=1` as Steps B and C. Disposable Store / WAL /
synchronous=OFF. Durable execution: NOT_RUN — disabled by owner until explicit
reauthorization. One sample per case; shared machine; the two harness cases
are INELIGIBLE on cache state as before, so no time here is a claim.

### The four items

| Item | Disposition | What was done or why not |
| --- | --- | --- |
| Commit jobs and statements per new file | DONE, two changes | (1) The engine remembers the `workspace` row and the Commit's two custody rows, so a record or reader job reads no fence row. (2) The namespace cursor's fixed window of sealed point answers is 1,024 slots per kind instead of 64, so a change whose serials fit it reads each sealed record once. The four plan jobs of one constructed file are unchanged: each is one resumable step of that file's record protocol. |
| Transaction frame per write | PARTLY | The write itself is the same seven statements (begin; the fence that reads the inode's row; one read of the window's row shapes; the cell; the inode; the frontier; commit), each of which the job needs. The RELEASE after it and every other fence that reads only the Workspace row is now no statement, and the frontier advance returns the row it wrote. One created file (lookup, getattr, create, write, release) is 18 statements, was 19. |
| Repeated attribute requests | NOT_DONE, kernel-issued | See below. |
| Accounting triggers | REVIEWED, unchanged in D | A created file changes ten rows, three of them the accounting row by the three insert triggers (inode, name, cell), one keyed row update each since Step C. The counts are the only exact row counts of a Workspace file and reclamation proofs assert on them; the two byte sums could be answered by the file's size, but they travel in diagnostics row 28 and in every harness decoder, and removing them would change that wire layout for a small part of one file's work. Not done; no trigger was removed. |

Rejected for the Commit path: merging the guard read and the write of a
record change into one conditional statement. A mismatch found after earlier
changes of the same job were written would need a rollback and a replay of
the job to report the first mismatch, which the one-attempt rule forbids;
single-change jobs alone would save about 1% of a Commit's statements.

Attribute requests. In the Step C tier-1 sample GETATTR is the largest
request kind: 5,766 of 26,078. The reply validity is already 60 s
(`layerfs-fuse/src/request/reply.rs`), so these are not expiries. The kernel
of the measurement host is 6.12 (`6.12.76-linuxkit`); in its
`fs/fuse/dir.c` every create, mkdir, symlink, link, unlink, rmdir and rename
calls `fuse_dir_changed(dir)`, which invalidates all basic attributes of the
parent directory, and `fuse_permission` under `default_permissions` issues a
GETATTR whenever the mode, owner or group bits are invalid. The next path
walk through that directory therefore asks for its attributes once, whatever
the daemon replied before: the sample's 4,880 namespace changes can each
cause one (an inference from the kernel source and the request counts, not
a traced measurement). The daemon can avoid them only by not mounting
with `default_permissions` and checking every permission itself, which is a
change of who owns permission enforcement, not a reduction, and is not made
here. The request is one job and one statement.

### How the fence memory stays exact

The connection of a Workspace file is the only one, holds the exclusive lock
and runs one job at a time. A writing statement whose text names `workspace`,
`commit_run` or `commit_reader` forgets what is remembered of that table
before it executes; SQLite cannot change a table a statement does not name,
and the triggers of this schema write `accounting` alone. Only the Workspace,
Capture and Lease statement families write these tables, so other writing
statements are not searched, and a debug assertion fails any test in which
another family names one. A job that began a transaction and failed forgets
everything, because it may have read its own writes. Refusals and their order
are unchanged. Written up in
[overlay terminology](../../architecture/64-overlay-terminology.md#rows-the-engine-remembers).

### Counted effect (host, exact pins)

| Measure | C | D |
| --- | ---: | ---: |
| `commit_record_anatomy` small: statements / record jobs | 1,027 / 201 | 647 / 177 |
| step (27 files constructed): statements / record jobs | 3,592 / 499 | 2,485 / 390 |
| large (384 files constructed): statements / record jobs | 41,931 / 8,085 | 25,941 / 4,938 |
| large: Workspace / custody statements | 10,076 / 1,991 | 2 / 11 |
| large: producer point reads (fresh, header, value) | 1,466 / 1,469 / 1,912 | 595 / 465 / 672 |
| one created file: statements / executions | 19 / 22 | 18 / 21 |
| record read job / one-change record write: statements | 2 / 5 | 1 / 4 |
| RELEASE, RELEASEDIR, FORGET of a linked file, drained revocation | 1 each | 0 |
| READ, READDIR, READLINK fence | 1 | 0 |

### Tests

No test is removed. Exact statement pins are restaged in 11 overlay, 5 daemon
and 3 Workspace test files. New assertions: the fence test pins the one read
after another owner's acquisition, after the close and after the release; the
rollback test pins that a failed writing job forgets the advanced row and
that the next read is one statement holding the earlier revision; the cursor
growth test holds a change larger than the answer window to the same per-row
ceilings.

Results at `a6d1ef177` (each binary one invocation, 30 s wall limit):

| Scope | Result |
| --- | --- |
| host + Linux all-targets Clippy `-D warnings` | clean |
| `cargo fmt --check`, product boundary guard, 999/200-line ceilings | PASS |
| static SQL check (`c_verify.py`, scratch tool) | 133 statement texts prepare against schema 34; bound counts match |
| overlay, 41 host binaries | PASS except `reply_tickets` ×2 (unchanged since Step A) |
| daemon/fuse/bridge/workspace/sdk, 96 host binaries | PASS except `complete_installed_roots::huge_native...` and `host_handoff` (need prepared inputs) and `request_path_anatomy` ×5 (statement pins; Step E) |
| Linux mounted/proof binaries, 43 | PASS |

Process notes, retained: the first Linux test build reached its 120 s limit
and left a half-written object for one test target; that target's artifacts
were removed from this worktree's Linux build cache and the build repeated.
Two host batches overlapped once (the first exceeded the shell limit), four
binaries got no result from lock contention and were run again alone; no test
outcome changed.

### Required selections

Before = Step C at `c8a7bcd1d`, after = Step D at `a6d1ef177`.

| Field | C | D | Signed raw delta |
| --- | ---: | ---: | ---: |
| tier 1 status | INELIGIBLE; PASS/PASS; Gone | INELIGIBLE; PASS/PASS; Gone | |
| tier 1 command ms | 6,725.2 | 6,935.5 | +210.3 |
| tier 1 Commit ms | 1,824.2 | 1,739.0 | -85.2 |
| tier 1 mount / unmount ms | 7.8 / 5.4 | 8.5 / 4.6 | +0.7 / -0.8 |
| tier 1 requests / owner jobs | 26,078 / 93,601 | 26,078 / 88,818 | 0 / -4,783 |
| tier 1 statements | 562,849 | 461,908 | -100,941 |
| tier 1 VM steps | 16,177,323 | 14,237,545 | -1,939,778 |
| tier 1 lock hold / lock wait ms | 1,130.0 / 79.5 | 1,073.6 / 96.4 | -56.4 / +16.9 |
| tier 1 command and Commit time outside the lock ms | 7,339.9 | 7,504.5 | +164.6 |
| tier 1 maintenance jobs / rows | 2,679 / 39,886 | 2,679 / 39,886 | 0 / 0 |
| tier 1 Store logical = allocated B | 114,528,256 | 114,606,080 | +77,824 |
| tier 1 overlay logical B (template after cleanup) | 122,880 | 122,880 | 0 |
| tier 1 daemon peak B | 88,813,568 | 87,035,904 | -1,777,664 |
| four: status | INELIGIBLE; PASS/PASS; Gone | INELIGIBLE; PASS/PASS; Gone | |
| four: external wall ms | 11,496.9 | 11,444.7 | -52.2 |
| four: summed command ms | 28,077.6 | 28,455.5 | +377.9 |
| four: summed Commit ms | 14,188.4 | 13,647.1 | -541.3 |
| four: requests / owner jobs | 104,311 / 372,337 | 104,310 / 353,058 | -1 / -19,279 |
| four: statements | 2,246,971 | 1,843,807 | -403,164 |
| four: VM steps | 64,598,945 | 56,849,079 | -7,749,866 |
| four: lock hold / lock wait ms | 8,076.7 / 659.6 | 7,660.6 / 648.5 | -416.1 / -11.1 |
| four: Store logical / allocated B | 133,865,472 / 133,865,472 | 132,026,368 / 132,030,464 | -1,839,104 / -1,835,008 |
| four: overlay logical B | 122,880 | 122,880 | 0 |
| four: daemon peak B | 134,938,624 | 130,838,528 | -4,100,096 |
| session: exits (16 × 50 Commits, then fresh daemon on evicted Store × 50) | 0 / 0 / 0 | 0 / 0 / 0 | |
| session: summed Commit ms (17 sessions) | 11,529.0 | 10,924.7 | -604.3 |
| session: Commit median, first / sixteenth / cold session ms | 11.91 / 13.72 / 15.18 | 11.16 / 13.38 / 14.67 | |
| session: final Store logical B | 119,603,200 | 119,533,568 | -69,632 |
| session: daemon VmHWM at the last runtime snapshot KiB | 112,808 | 113,060 | +252 |

Concurrent exec diagnostic (2,000 files per writer; per file µs:
create / append / read; the Commit is of the three-writer run):

| Run | C, 2 CPUs | D, 2 CPUs | C, no CPU limit | D, no CPU limit |
| --- | ---: | ---: | ---: | ---: |
| 1 writer | 244.2 / 122.2 / 188.8 | 287.2 / 147.9 / 244.0 | 239.9 / 119.8 / 187.2 | 124.3 / 71.1 / 71.7 |
| 2 writers | 246.9 / 129.0 / 204.9 | 295.4 / 143.8 / 250.9 | 245.1 / 126.8 / 202.6 | 303.8 / 153.7 / 252.4 |
| 3 writers | 356.8 / 288.0 / 273.8 | 411.0 / 228.7 / 278.8 | 299.3 / 172.3 / 236.4 | 364.8 / 223.6 / 281.2 |
| 4 writers | 665.8 / 335.9 / 414.8 | 661.7 / 340.1 / 428.5 | 354.7 / 174.2 / 265.1 | 435.9 / 219.2 / 291.6 |
| 3 writers + Commit | 583.0 / 212.9 / 258.7 | 545.2 / 200.2 / 249.4 | 353.4 / 154.6 / 233.0 | 378.9 / 188.2 / 285.8 |
| that Commit ms | 1,084.0 | 943.1 | 699.9 | 605.8 |
| that Commit's record jobs | 45,710 | 37,381 | 45,710 | 37,381 |

Reading, with the limits of one shared-machine sample each:

- Counts are exact and move as the pins predict: statements fall 17.9% in
  both harness cases, VM steps 12.0%, owner jobs 5.1% (all of it record
  jobs: 49,539 → 44,756 in tier 1). Requests are unchanged.
- Commit time falls in every sample that has one: tier 1 -4.7%, four
  Workspaces -3.8%, the session -5.2%, the concurrent Commit -13%. One sample
  each; no speed claim is made.
- Tier-1 command time is 3.1% higher and the four-Workspace sum 1.3% higher,
  while the time under the Workspace lock fell (-56.4 ms and -416.1 ms); the
  difference is outside the daemon's jobs. Recorded as measured, not
  explained.
- The exec diagnostic is slower in most cells of this sample (for example
  no-limit create with two to four writers +22 to +24%) and one cell is half
  its usual value (no-limit, one writer). The same runs report equal or
  runs report lock service per job of Lifecycle 4 to 6 µs → 1 to 2 µs, Read
  within 1 µs of C, and Mutation 0 to +5 µs (+12 µs with four writers on
  2 CPUs), which is far less than the per-file differences, so most of the
  difference is outside the daemon's jobs. Not attributed, not resampled; the
  final samples of Step E will show whether it repeats.
- Storage is not traded: tier-1 Store +77,824 B, session -69,632 B,
  four-Workspace -1.8 MB, all inside the spread of earlier samples of the
  same content; the overlay template is unchanged. The four-Workspace Store
  reports 4,096 B more allocated than logical in this sample.
- Memory: tier-1 peak -1.8 MB, four-Workspace peak -4.1 MB, session high
  water +252 KiB. The wider answer window is about 150 KiB for one
  construction and is not visible against these.

Test copies of the two harness samples were removed after their receipts were
read (450.2 MB and 519.8 MB); the originals stay.

### Source size

Production LOC: 81,006 -> 81,054 (delta +48), `core/crates` product source,
pinned `tools/production_loc.py`
(`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`) on the
first-parent and committed-tree Git archives; committed tree
`a9f816ce61a144dc175f4c64c638e65d34e798e1` equals the counted tree. Reference
absent (retired R9c; last counted 65,417 at tree
498dd1917812). Net A+B+C+D: 84,220 -> 81,054 (delta -3,166).

## Issue 321 Step E — re-qualify once (2026-10-14)

No product source changes in E: `core/crates` production code at the tip is
byte-identical to the Step D source. E restages count pins, reconciles the
harness, states the final model in the guides, rebases, and samples once.
Timing is diagnostic everywhere: every performance row is INELIGIBLE (cache
state not enforced, shared machine, no cross-worktree isolation). Durable
execution: NOT_RUN — disabled by owner until explicit reauthorization.

### Rebase

`sdk-refactor` was revalidated at `9fe542e3b340f4b5daa17636880afd6b1b32c290`,
unchanged from the takeover observation; it is 12 commits past the old merge
base `95477b127`, all harness and documentation. `git rebase sdk-refactor`
applied the branch's 87 commits without a conflict, and
`git diff i321-pre-rebase HEAD -- core/crates` was empty. Each rebased commit
has a new tree, so the "Staged tree" line of all 87 messages was rewritten to
that commit's own tree and checked 87 of 87; the LOC lines are unchanged
because no production line moved. The local ref `i321-pre-rebase` and the tags
`i321-a-*` to `i321-d-*` stay on the measured pre-rebase commits.

| Step record | Measured (pre-rebase) | Rebased |
| --- | --- | --- |
| A source / finished | `b43cf2a1a` / `02aa9e4e2` | `1ad1e90f4` / `0292c6cc9` |
| B source / finished | `1c706e5ff` / `19061375e` | `a2d0640fd` / `856a9900c` |
| C source / finished | `c8a7bcd1d` / `1d8583471` | `7e4c2a16d` / `c486133bf` |
| D source / finished | `a6d1ef177` / `f130db4af` | `63d666a7d` / `41a6a61ce` |
| E pins and harness / cell pins | — | `21a789a14` / `2c11fe8aa` |

Production LOC recomputed with the pinned counter on Git archives of
`core/crates`: `sdk-refactor` 82,762; before Step C 81,584; Step C 81,006;
Step D and every E commit 81,054. The branch against its rebased base is
82,762 -> 81,054 (delta -1,708), of which #320 is +1,458 and #321 steps A to D
-3,166. Reference absent (retired R9c; last counted 65,417 at tree
498dd1917812).

### Count pins

- **Host replays.** `request_path_anatomy` (C01, C03, C04, C06, C10) restaged
  from its own report: requests, jobs and transactions unchanged; statements
  22,003 -> 21,002, 51,072 -> 49,037, 20,623 -> 19,612, 7,185 -> 7,183,
  11,291 -> 10,775. 5 of 5 pass.
- **Twelve cells.** The gate's table is restaged from a per-request model of
  the final source, [REQUEST-PATH section 10](REQUEST-PATH.md#10-twelve-cell-expectations-at-the-final-source-of-issue-321):
  ten exact pins, C03 as 49,038 + 2P in steps of two, C12 as a labelled
  estimate range. Requests and owner jobs keep their frozen values. A unit test
  rebuilds the ten exact pins from the per-kind numbers.
- **First twelve samples, retained as FAIL.** At sealed build
  `2026-10-14-issue321-e-source-1-build` (`21a789a14`), before the cell pins
  were changed, each cell was sampled once: FAIL at the old gate in all twelve
  ("exact request/owner-job/statement counts differ"), proof PASS and cleanup
  Gone in all twelve; statements 21,002 / 22,002 / 49,460 / 19,612 / 20,269 /
  7,183 / 17,440 / 7,185 / 517 / 10,773 / 7,174 / 10,977. They equal the model
  in the ten exact cells.

### Harness

- **Storage oracle.** One file per Workspace: the exported template must be
  schema 34 and hold no row; the overlay directory is archived and may contain
  only the template and numbered Workspace files; a Workspace file left after
  stop fails cleanup and is counted. It ran in the store footprint sample and
  its exact-file cleanup check is PASS.
- **Overlay bytes.** The runtime snapshot lists every overlay file and the
  receipt sums them. A snapshot after terminal unmount reads the template alone
  (122,880 B); the four-Workspace and branch snapshots, taken with four
  Workspaces mounted, read 634,880 B. Before this the column read only the
  template whatever was mounted.
- **Retired observations.** Scheduler and credit bytes are not applicable with
  one exact reason; they are never read from the positions that now hold other
  counters, and a resource PASS still needs every remaining observation.
- **Session tool.** `branch_session.py` follows the original's recorded source
  pointer, because the rebased harness keeps an original's initial tree in a
  shared closed input. Its first invocation stopped on the missing file before
  it created an output folder or a container; that is retained as a tool
  failure, not a sample.
- **Baseline harness defect, worked around, not fixed.** The rebased harness
  shares one closed initial tree between cases. When the ordinary writer makes
  it first (tier 1), the context preparation of the four-Workspace case fails
  with `KeyError: 'recipe_sha256'`; made by the context writer first, both
  work. The tier-1 sample had already been taken. This run removed its own
  shared input and its own tier-1 original, prepared the four-Workspace case
  first, and prepared tier 1 again for the diagnostics. One intermediate
  four-Workspace preparation also failed ("shared initial input pointer
  changed") while the stale tier-1 original still existed. No sample was
  affected; the order dependency remains in the harness.
- **Follow-up, 2026-10-14: the order is now an explicit refusal.** The context
  case no longer fails with `KeyError`; `prepared_inputs.require_context_producer`
  refuses an initial tree first produced by the ordinary writer, before the
  preparation folder, a tool or a reuse claim exists, and the message names the
  required order (a context case sharing the input first). The retained input
  is unchanged and still serves ordinary cases. The context view is not derived
  from an ordinary input: `validate_context_helpers` binds the initial tree to
  a `materialize-context CASE ROLE 0` generation and its role/step/manifest
  receipt at preparation and at every sample admission, an M1 scope digest is
  not in the complete manifest, and no context writer mode reports a step-0
  recipe for an existing tree. Both writers call the same
  `workspace_common::recipe_identity` and the retained receipts of this pair
  agree (`711ec2f6…`, manifest `6f7eef4c…`), but that equality cannot be
  checked at preparation, so it is not assumed. Context-first is unchanged.
  Product-free `tests/engine/test_shared_initial_order.py` (5 tests) prepares
  both orders; engine suite 362 run, the same 3 native-input errors. Editing
  `fixtures.py` and `prepared_inputs.py` changes every case's preparation key,
  so `tier.py` would answer NOT_READY for a kept case until it is prepared
  again. This worktree has no `kept-fixtures`; originals opened by their folder
  and closed native inputs (`native_key` unchanged) are not affected. No sample
  was taken.
- **Unit suites.** Cells 315 pass. Engine 357 run, 3 errors; families 87 run,
  2 errors and 1 failure: all six need native build inputs named by
  environment variables this session does not have (`FSB_CONTEXT_NATIVE`,
  `LAYERFS_EDIT_WRITER_BUILD`, `WORKSPACE_RECIPE_TEST_WRITER`,
  `LAYERFS_ALIAS_FIXTURE`, a sealed build path). NOT_RUN, unchanged by E.
  One of three runs of the families suite also reported an error in
  `test_branch_development…native_scope_dispatch`; the test passed alone and in
  the next full run. Recorded as an unstable harness unit test, not diagnosed.

### Checks at the final identity

| Check | Result |
| --- | --- |
| Linux mounted and proof binaries, `21a789a14`, pinned image, one bounded invocation each | 43 of 43 exit 0; 106 tests pass, 0 fail, 7 ignored |
| The 7 ignored Linux tests (daemon `device_capacity` 1, `mounted_sqlite_full` 2, `r5_6_failure_matrix` 1; overlay `allocation_filesystem` 1, `device_capacity` 2) | NOT_RUN: each needs an exclusively owned device or filesystem fixture; their retained results keep their own pins |
| `request_path_anatomy`, host | 5 of 5 |
| Host test binaries other than that one | not rerun in E: product source and every other test file equal Step D, where 40 of 41 overlay binaries and the other 96 passed except the retained failures listed there (`reply_tickets` x2, `complete_installed_roots::huge_native…`, `host_handoff`) |
| Host and Linux Clippy | not rerun in E for the same reason; clean at Step D |
| `cargo fmt --check`, product boundary guard, fuser integrity | pass |
| 999-line and 200-line ceilings | unchanged from Step D (no production file changed) |

### Twelve cells at the final identity

Sealed build `2026-10-14-issue321-e-source-2-build`, source `2c11fe8aa`,
daemon `49a0f534d35d…`; one sample each, one command each. Baseline in
parentheses is the SDK-refactor baseline of
[#319](../319/baseline-sdk-refactor/README.md) at `587e9a8be`, one sample, a
different day. "Gate" is the restaged exact-count check.

| Cell | Status | Proof | Gate | Requests | Owner jobs | Statements (baseline) | Command ms (baseline) | Peak memory B | Cleanup |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| C01 | INELIGIBLE | PASS | PASS | 5,002 | 5,002 | 21,002 (44,004, -52.3%) | 339.2 (336.1) | 30,261,248 | Gone |
| C02 | INELIGIBLE | PASS | PASS | 6,002 | 6,002 | 22,002 (46,004, -52.2%) | 897.2 (1,076.6) | 30,339,072 | Gone |
| C03 | INELIGIBLE | PASS | PASS | 9,022 | 9,038 | 49,594 (102,540, -51.6%) | 578.8 (511.8) | 30,412,800 | Gone |
| C04 | INELIGIBLE | PASS | PASS | 5,342 | 5,342 | 19,612 (42,644, -54.0%) | 769.8 (790.1) | 30,216,192 | Gone |
| C05 | INELIGIBLE | PASS | PASS | 5,890 | 6,000 | 20,269 (46,637, -56.5%) | 821.3 (832.0) | 30,236,672 | Gone |
| C06 | INELIGIBLE | PASS | PASS | 518 | 518 | 7,183 (9,766, -26.4%) | 166.1 (146.6) | 31,895,552 | Gone |
| C07 | INELIGIBLE | PASS | PASS | 1,551 | 1,550 | 17,440 (23,133, -24.6%) | 305.7 (348.9) | 31,830,016 | Gone |
| C08 | INELIGIBLE | PASS | PASS | 521 | 521 | 7,185 (9,783, -26.6%) | 175.9 (128.6) | 32,124,928 | Gone |
| C09 | INELIGIBLE | PASS | PASS | 517 | 517 | 517 (1,055, -51.0%) | 103.0 (83.2) | 31,944,704 | Gone |
| C10 | INELIGIBLE | PASS | PASS | 1,547 | 1,546 | 10,773 (14,406, -25.2%) | 206.4 (175.1) | 33,628,160 | Gone |
| C11 | INELIGIBLE | PASS | PASS | 517 | 517 | 7,174 (9,760, -26.5%) | 155.9 (125.7) | 34,566,144 | Gone |
| C12 | INELIGIBLE | PASS | PASS | 3,436 | 3,439 | 10,979 (24,146, -54.5%) | 248.3 (251.1) | 30,277,632 | Gone |

Requests and owner jobs equal the baseline in all twelve. Command time is
lower in C02, C04, C05, C07 and C12 and higher in C01, C03, C06 and C08 to
C11; the largest rises are C03 +67.0 ms, C08 +47.3 ms, C10 +31.3 ms and C11
+30.2 ms. C06 and C08 to C11 write or read one 64 MiB file. The first E sample
of C03, C06 and C08 to C11 was also above the baseline (604.3, 158.7, 172.6,
91.7, 206.8, 164.3 ms). Not attributed, not resampled.

### Selected and unselected cases at the final identity

The first six rows are the selected cases of #320, the last six the fixed
unselected sample. Same build, one sample each.

| Case | Status | Functional / proof | Requests | Owner jobs (baseline) | Statements (baseline) | Command ms (baseline) | Commit ms (baseline) | Store logical B (baseline, difference) | Overlay B at snapshot | Peak memory B | Cleanup |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Tier 1 mixed development | INELIGIBLE | PASS / PASS | 26,078 | 88,818 (201,510) | 461,964 (1,084,524, -57.4%) | 6,712.3 (7,478.2, -10.2%) | 1,708.2 (3,646.6, -53.2%) | 114,511,872 (114,434,048, +77,824) | 122,880 | 89,034,752 | Gone |
| Four Workspaces | INELIGIBLE | PASS / PASS | 104,312 | 353,016 (803,660) | 1,843,823 (4,354,121, -57.7%) | 28,991.4 (39,190.7, -26.0%) | 13,389.4 (67,434.5, -80.1%) | 130,318,336 (133,046,272, -2,727,936) | 634,880 | 126,750,720 | Gone |
| History hotset 100 | INELIGIBLE | PASS / PASS | 741 | 7,581 (9,473) | 18,397 (44,236, -58.4%) | 4,038.1 (3,882.9, +4.0%) | 645.3 (799.2, -19.3%) | 5,541,344 (6,069,776, -528,432) | 122,880 | 70,537,216 | Gone |
| Prepend on 500 MiB | INELIGIBLE | PASS / PASS | 16,011 | 16,194 (16,212) | 176,435 (200,970, -12.2%) | 4,001.7 (6,360.7, -37.1%) | 12.3 (20.8, -41.0%) | 530,883,624 (530,900,008, -16,384) | 122,880 | 112,943,104 | Gone |
| Namespace 100,000 | INELIGIBLE | PASS / PASS | — | — (—) | — (—, —) | 6,637.2 (7,268.5, -8.7%) | — (—, —) | 520,298,496 (516,476,928, +3,821,568) | — | — | SEALED_CLOSED; no mount |
| Local snapshot 25,000 | INELIGIBLE | PASS / PASS | 177,581 | 857,173 (1,403,960) | 3,006,571 (6,747,991, -55.4%) | 11,469.8 (9,619.8, +19.2%) | 4,581.8 (8,704.0, -47.4%) | 934,120 (925,832, +8,288) | 122,880 | 65,118,208 | Gone |
| Small-file delta 10x30 | INELIGIBLE | PASS / PASS | 402 | 2,339 (2,919) | 5,778 (14,049, -58.9%) | 1,210.0 (1,208.5, +0.1%) | 179.7 (211.4, -15.0%) | 1,975,952 (2,474,448, -498,496) | 122,880 | 52,350,976 | Gone |
| Branch development | INELIGIBLE | PASS / PASS | 54,851 | 186,372 (422,821) | 969,992 (2,282,262, -57.5%) | 13,780.4 (18,779.1, -26.6%) | 4,334.0 (16,849.0, -74.3%) | 122,634,240 (122,331,136, +303,104) | 634,880 | 96,759,808 | Gone |
| Insert in 100 MiB | INELIGIBLE | PASS / PASS | 1,611 | 1,908 (1,926) | 18,468 (21,675, -14.8%) | 418.8 (521.9, -19.8%) | 13.9 (11.1, +25.2%) | 106,464,296 (106,488,944, -24,648) | 122,880 | 104,554,496 | Gone |
| Store footprint 100,000 | INELIGIBLE | PASS / PASS | 12 | 77 (95) | 174 (443, -60.7%) | 14,296.6 (14,730.9, -2.9%) | 14.1 (96.5, -85.4%) | 556,614,456 (556,192,592, +421,864) | 122,880 | 52,936,704 | Gone |
| Dense rewrite 500 | INELIGIBLE | PASS / PASS | 33,359 | 134,879 (222,679) | 530,261 (1,154,213, -54.1%) | 2,739.3 (3,154.3, -13.2%) | 12,026.4 (8,292.1, +45.0%) | 1,066,889,216 (1,066,643,456, +245,760) | 122,880 | 151,957,504 | Gone |
| Boundary exact | INELIGIBLE | PASS / PASS | 14 | 225 (261) | 615 (1,323, -53.5%) | 82.3 (84.0, -2.0%) | 12.7 (13.4, -4.5%) | 492,488 (537,712, -45,224) | 122,880 | 51,924,992 | Gone |

Every case: functional PASS, proof PASS, cleanup known, timing INELIGIBLE.
Statements fall 12% to 61% and owner jobs fall in every mounted case.

Against the baseline, unfavourable and recorded as such:

- **Dense rewrite 500, Commit +3,734.3 ms (+45.0%).** Command time fell 415.0
  ms; command and Commit together rose from 11,446.4 to 14,765.7 ms. This case
  was never sampled during #320 or #321 A to D. From the receipt's own
  counters: over the daemon's whole life the overlay lock was held 4,192 ms in
  all classes (1,138.5 ms in the 65,445 operation-record jobs) and waited for
  14.5 ms, so at least 7.8 s of the 12.0 s Commit ran outside the overlay
  lock, in construction and Store writes. That locates the time; it does not
  attribute the rise, which one sample on a shared machine cannot do.
- **Local snapshot 25,000, command +1,850.0 ms (+19.2%).** Commit fell 4,122.2
  ms; together they fell from 18,323.8 to 16,051.6 ms.
- **History hotset 100, command +155.2 ms (+4.0%)**; Commit fell 153.9 ms.
- **Insert in 100 MiB, Commit +2.8 ms** on 11.1 ms; command fell 103.1 ms.
- **Store logical bytes** rose in six cases: tier 1 +77,824, namespace
  +3,821,568 (+0.74%), local snapshot +8,288, branch +303,104, footprint
  +421,864, dense rewrite +245,760; and fell in six. Namespace Init runs no
  daemon and no overlay; its Store difference is not from #321's overlay work
  and was not diagnosed.

Against Step D (pre-rebase source `a6d1ef177`, same product code), tier 1:
command 6,935.5 -> 6,712.3 ms, Commit 1,739.0 -> 1,708.2 ms, counts 26,078 /
88,818 / 461,908 -> 26,078 / 88,818 / 461,964, Store 114,606,080 ->
114,511,872 B, peak 87,035,904 -> 89,034,752 B. Four Workspaces: summed
command 28,455.5 -> 28,991.4 ms, summed Commit 13,647.1 -> 13,389.4 ms, counts
104,310 / 353,058 / 1,843,807 -> 104,312 / 353,016 / 1,843,823, Store
132,026,368 -> 130,318,336 B, peak 130,838,528 -> 126,750,720 B.

### Diagnostics at the final identity

Not harness cases: no oracle, no proof, exit codes only.

| Diagnostic | Result |
| --- | --- |
| concurrent exec, 2 CPUs | exit 0; per file µs create / append / read: 1 writer 302.3 / 143.9 / 225.8, 2 writers 302.0 / 157.1 / 245.9, 3 writers 380.3 / 215.1 / 289.9, 4 writers 679.0 / 383.2 / 499.2; three writers with a Commit 582.8 / 252.0 / 289.0, Commit 837.9 ms |
| concurrent exec, no CPU limit | exit 0; 1 writer 301.3 / 145.0 / 240.4, 2 writers 294.5 / 154.7 / 235.7, 3 writers 329.1 / 160.6 / 263.0, 4 writers 422.9 / 213.1 / 373.9; with a Commit 398.3 / 190.8 / 300.4, Commit 600.2 ms |
| session, 16 x 50 Commits then a new daemon on an evicted Store x 50 | exits 0 / 0, eviction 0; summed Commit 10,934.8 ms over 17 sessions (Step D 10,924.7); Commit median first / sixteenth / cold 11.17 / 13.39 / 14.16 ms; final Store 119,504,896 B (119,533,568); daemon VmHWM 116,432 KiB (113,060); 56.1 s wall |
| session, first invocation | tool failure before any work, see Harness |

Lock wait stays 0 to 1 µs per job in every exec row; the four-writer rows at
2 CPUs are CPU-bound.

### Storage and cleanup

Free space was checked before the large preparations (354 GiB, then 347 GiB
after). Each sample's test copy was removed after its sealed manifest was
verified; 7.0 GB of copies in all. Originals stay, one per payload. No
container of this run remains. Docker volumes that predate this session,
including 15 sample volumes dated 2026-10-12, were not touched: their owner
was not established here.

### Not done or not established in E

- Timing eligibility: none; no cold-cache or cross-worktree qualification.
- The six harness unit tests and seven Linux tests listed above: NOT_RUN.
- Host suites and Clippy were not rerun at the rebased commits (no product or
  other test change since D).
- C12's pin is an estimate, not a model result.
- The dense-rewrite Commit rise and the 64 MiB cells' command rise are
  recorded without a cause. Followed up in
  [the next section](#issue-321-follow-up--dense-rewrite-commit-and-the-64-mib-cells-2026-10-14).
- The harness's shared-input order dependency is worked around, not fixed.
- No push, pull request or issue closure.

### Source size

`21a789a14` and `2c11fe8aa`: Production LOC 81,054 -> 81,054 (delta +0) each;
scope first-party `core/crates` production code including shipped SQL; pinned
`tools/production_loc.py`
(`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`) on the
first-parent and committed-tree Git archives. Reference absent (retired R9c;
last counted 65,417 at tree 498dd1917812).

## Issue 321 follow-up — dense-rewrite Commit and the 64 MiB cells (2026-10-14)

**Finding.** The +45.0% Commit of `workspace-dense-rewrite-500-mixed-v4` in
Step E is not a regression of #320 or #321. That Commit does equal or less
work by every large counter; the few counters that rose are listed below and
account for about 0.5 s. The whole rise, and more, sits in one place: the wall
of the global Store writer's `COMMIT` statement, which does buffered file
writes of the same bytes. A retained sample of the code before
#320 shows the same stall, and one labelled diagnostic of the Step E daemon
binary, byte for byte, committed in 6,077.4 ms. Why the kernel stalled those
writes in the Step E sample is not established. Recommendation: accept; no
product change.

No product source changed. Timing stays diagnostic and INELIGIBLE throughout.
Durable execution: NOT_RUN — disabled by owner until explicit reauthorization.

### Samples compared

| Label | Source | Daemon binary | What it is |
| --- | --- | --- | --- |
| Baseline | `587e9a8be` | `040b0ffef9f8…` | the #319 row (receipt `e4ad9ea2…`) |
| 12 October | `fc45a1bc4` | `96fe3bed11d7…` | an earlier retained sample of the same case (receipt `baa2be92…`) |
| Step E | `2c11fe8aa` | `49a0f534d35d…` | the sample in the table above (receipt `7783e00d…`) |
| Diagnostic | `0a57b780d` | `49a0f534d35d…` | one new labelled sample, see below (receipt `e155368d…`) |

The first two are read from their own worktrees, never written:
`layerfs-sdk-refactor/benchmark-results/fs-bench-pro/tier-sdk-baseline-587/run-workspace_change_locality/`
and
`layerfs-issue319-terminal/benchmark-results/fs-bench-pro/2026-10-12-issue318-p319t15-run-workspace_change_locality/`.
`git diff fc45a1bc4 587e9a8be` is empty for the persistence, storage, content,
overlay, workspace and fuse crates, so those two ran the same data path.

### Counters that do not depend on timing

Baseline against Step E. The 12 October sample equals the baseline exactly in
the first nine rows and differs from it by less than 4% in the others.

| Counter | Baseline | Step E |
| --- | ---: | ---: |
| Requests | 33,359 | 33,359 |
| Overlay jobs / of them operation-record | 222,679 / 153,245 | 134,879 / 65,445 |
| Overlay statements | 1,154,213 | 530,261 |
| Payload bytes read back from the overlay (blob bytes of the payload family) | 573,440,000 | 573,440,000 |
| Construction: inode rows, pages, values, points, opens (30 fields) | equal | equal |
| Construction record jobs | 45,507 | 36,129 |
| Content objects read / read waves | 104 / 2 | 103 / 103 |
| Save: publications | 223 | 223 |
| Save: pack bytes written | 526,091,133 | 525,875,207 |
| Save: pack bytes read / payload reads | 319,179 / 356 | 97,060 / 281 |
| Save: ranged selections / bytes | 987 / 77,231,686 | 1,058 / 83,693,223 |
| Global writer inside the Commit call: statements | 128,889 (12 October 128,904) | 128,555 |
| Global writer: transactions / write transactions | 41,804 / 225 | 41,792 / 225 |
| Global writer: sealed inserts / bound bytes | 2,324 / 532,018,599 | 2,320 / 532,199,644 |
| Global writer: VM steps | 4,194,085 | 4,303,600 |
| Two Store readers inside the Commit call: statements / blob bytes | 31,695 / 271,495,043 | 31,545 / 269,906,608 |
| Reclamation between the measured mount and the Commit's reply | 2 steps, 0 B | 15,569 steps, 526,492,222 B |
| Store logical bytes | 1,066,643,456 | 1,066,889,216 |

Higher in Step E: the writer's VM steps (+2.6%), ranged pack reads (+6.5 MB),
content read waves (101 more point reads), Store logical bytes (+245,760),
and the reclamation, which Step B moved onto the calling thread. Peak daemon
memory is also higher (119,418,880 -> 151,957,504 B); Step B has a section on
peak memory. No other counter rose.

### Where the wall went

Differences across the one control call that ran the Commit, from
[`tools/store_writer_split.py`](tools/store_writer_split.py):

| Wall, ms | Baseline | 12 October | Step E | Diagnostic |
| --- | ---: | ---: | ---: | ---: |
| Commit | 8,292.1 | 13,112.6 | 12,026.4 | 6,077.4 |
| Global writer, step of `COMMIT` (225 write transactions each) | 562.2 | 4,027.7 | 5,298.3 | 497.4 |
| Commit without that step | 7,729.9 | 9,084.9 | 6,728.1 | 5,580.0 |
| Overlay operation-record jobs (owner service; lock hold since #321) | 2,076.0 | 2,201.7 | 1,138.5 | 388.6 |
| Two Store readers, transactions | 248.5 | 573.4 | 510.0 | 141.5 |
| Reclamation inside the interval | 0.2 | 0.2 | 497.0 | 498.3 |
| Store pages not resident right after (of about 259,400) | 46,712 | 95,498 | 16,132 | 0 |

- Step E against the baseline: the `COMMIT` step is +4,736.1 ms and the rest
  of the Commit is -1,001.8 ms; together +3,734.3 ms.
- That step is SQLite appending frames to the WAL and, at 1,000 pages, copying
  them into the Store file. The profile is unchanged since the baseline
  (WAL, synchronous OFF, auto-checkpoint 1,000, journal limit 4 MiB;
  `profile.rs` has no diff). It issues no sync, so its wall is the kernel
  accepting buffered writes: the 526 MB of packs, into the WAL and again into
  the Store file.
- The code before #320 took 562.2 ms for it in one sample and 4,027.7 ms in
  the other, with identical statements and bytes. The baseline row is the
  unstalled one.
- Step E against the diagnostic, same binary: 5,949.0 ms apart, of which
  4,800.9 ms is this step, 749.9 ms the operation-record lock holds (the same
  65,445 jobs, also buffered writes, to the overlay file) and 368.5 ms the
  readers.

### The diagnostic

One labelled sample, not a repeat for the table. Sealed build
`2026-10-14-issue321-f-diag-1-build` at `0a57b780d` (the harness commit made
after Step E; product tree `79d85d8e…` and all nine binaries equal Step E's).
The stale original was dropped and prepared again (23.7 s). A read-only
observer container, [`tools/cgroup_observer.py`](tools/cgroup_observer.py),
sampled the Docker VM's and the sampled container's kernel counters every
100 ms; it was declared in the receipt's interference line. The Docker VM had
started 207 s before the observer's first row, so its page cache held only this
session's build and preparation.

Result: INELIGIBLE, functional PASS, proof PASS, cleanup Gone; counts 33,359 /
134,879 / 530,261, equal to Step E; command 2,436.0 ms, Commit 6,077.4 ms;
Store 1,066,991,616 B; daemon VmHWM 154,542,080 B.

Observer, Commit interval (57 rows; the two clocks are aligned on the two
unmounts, to about 0.1 s):

| Count | Value |
| --- | --- |
| Container CPU used | 5,996 ms in the 6,077 ms interval |
| Container stalled on I/O (pressure, some) | 8.2 ms |
| Container stalled on memory; CPU throttled | 0 ms; 0 ms |
| Pages scanned for reclaim, container and VM | 0 |
| Times the container reached its 2 GiB limit | 0 |
| Container memory | 1,108 -> 1,653 MiB, the peak of the run |
| Container dirty pages, peak | 294 MiB (VM limits 642 MiB hard, 320 MiB background) |
| Bytes the kernel wrote for the container | 680 -> 1,192 MiB, in two bursts |
| VM free memory | 715 -> 174 MiB, of 3,918 MiB |

So an unstalled Commit of this source is about 6.0 s of one CPU and nothing
else. The Step E sample spent a further 5.9 s, nearly all of it in buffered
writes that did not return at once. The case leaves the VM with 174 MiB free
even from a fresh start. At the measured unmount the container's file pages
fell by 1,017 MiB, twice the 512 MiB overlay file, so about a third of the
peak is the kernel's own cache of the files the command wrote through the
mount; the rest is the overlay file and the new Store pages.

### Established and not established

- Established: equal or lower work; the rise located in one statement's
  kernel time; the same stall in the code before #320; 6,077.4 ms from the
  Step E binary without it.
- Established, small, from #321 Step B (`a2d0640fd`): the committed payload is
  reclaimed before the Commit replies, 15,569 steps and 497.0 ms here (498.3
  in the diagnostic). The baseline did it after the reply, 526.5 MB over
  3,546 ms of owner-thread wall, while verification ran. This is the behaviour
  Step B recorded; it is inside both Step E numbers.
- Not established: what made the kernel stall in the Step E sample. No
  observer ran then. Its receipt shows 16,132 Store pages not resident right
  after the Commit, so the kernel was reclaiming pages, but the baseline has
  more such pages and no stall.
- Not established: how often either binary stalls. Two samples each; no rate.
- Ruled out as the cause: more statements, transactions, pack bytes or
  payload read-back; a changed Store profile; the overlay lock (wait 14.5 ms).
- The same binary's two samples differ by 102,400 B of Store logical bytes and
  by one sealed byte, so part of Step E's +245,760 B is not a format cost.

### Recommendation

1. Accept the dense-rewrite row as it stands; change no product code for it.
2. Do not compare this case's Commit across sources by its total. Compare the
   Commit without the writer's `COMMIT` step, and run the observer beside any
   further sample so a stalled one is caught with its kernel counts.
3. Candidate, not done and not measured: a Workspace unmounted right after its
   Commit pays the 0.5 s of row reclamation for a file that unmount deletes.
   Whether a Commit may reply before that reclamation is an owner decision.

### The 64 MiB cells

Same comparison for C06 and C08 to C11, plus C03. The baseline daemon binary
`040b0ffef9f8…` has six retained runs of the cells (`cdf115c67`, `196c70fba`,
`b232bfc1d`, `820a2c395`, `109a97ac4` and the #319 row at `587e9a8be`). Lock
wall is Read plus Mutation over the daemon's life: owner service in the
baseline, lock hold in Step E.

| Cell | #319 row, ms | Its rank in the six | Six runs, ms | Step E, two samples, ms | Six runs, lock wall ms | Step E, lock wall ms |
| --- | ---: | --- | --- | --- | --- | --- |
| C03 | 511.8 | lowest | 511.8 to 677.6 | 604.3, 578.8 | 293.3 to 349.3 | 232.3, 237.8 |
| C06 | 146.6 | fourth | 139.2 to 164.1 | 158.7, 166.1 | 111.5 to 137.0 | 122.7, 126.1 |
| C08 | 128.6 | lowest | 128.6 to 178.5 | 172.6, 175.9 | 110.8 to 133.5 | 121.6, 124.2 |
| C09 | 83.2 | lowest | 83.2 to 125.0 | 91.7, 103.0 | 7.9 to 12.3 | 5.2, 5.3 |
| C10 | 175.1 | lowest | 175.1 to 207.2 | 206.8, 206.4 | 144.9 to 186.8 | 149.1, 149.5 |
| C11 | 125.7 | second | 109.9 to 157.6 | 164.3, 155.9 | 110.6 to 131.6 | 124.0, 123.0 |

- Requests and jobs are equal, statements 25% to 52% lower, lock wait lower,
  lock wall inside the baseline's range or below it.
- Ten of the twelve Step E values lie inside the range of the baseline
  binary's own six runs. Two lie above it: C06 by 2.0 ms and C11 by 6.7 ms.
- Most of the 20 to 47 ms came from comparing against the fastest of the six
  runs in C03, C08, C09 and C10, and the second fastest in C11.
- Cause of a regression: not established, and the retained samples do not
  show one. Not excluded: the four cells that write 64 MiB (C06, C08, C10,
  C11) sit in the upper half of the range in both samples, a shift of up to
  about 20 ms that two samples cannot separate from the spread. Its lock wall
  is not higher, so it would lie outside the overlay lock.
- Recommendation: accept; when cells are next compared, use the six-run
  range, not the single #319 row.

### Evidence, storage and cleanup

- Diagnostic sample:
  `benchmark-results/fs-bench-pro/2026-10-14-issue321-f-diag-1-run-workspace_change_locality/`;
  observer rows beside it in `…-f-diag-1-observer/rows.jsonl` (384 rows,
  sha256 `f8c05f3f…`). Both stay local, like every receipt.
- Three bounded commands: build 104.8 s, preparation 23.7 s, sample 38.5 s.
  The test copy was removed after its manifest check (1,062.8 MB); one
  original stays. The observer container removed itself; no container of this
  session remains and the volume count is unchanged at 253. Free space before:
  351 GiB.
- Not done: no second diagnostic, no sample of the baseline source, no cell
  sample, no host or Linux test (no product or test source changed).

### Source size

Production LOC 81,054 -> 81,054 (delta +0); scope first-party `core/crates`
production code including shipped SQL; pinned `tools/production_loc.py`
(`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`) on the
first-parent and committed-tree Git archives. Reference absent (retired R9c;
last counted 65,417 at tree 498dd1917812). The two added files are diagnostic
tools under `core/docs`, outside the count.

## Issue 321 follow-up — Store-write stall cause (2026-10-14)

**Finding.** A writer stall of Step E's size was captured, twice. Both times it
ran under a declared second writer on the same disk. In both, the global Store
writer spent about 5.5 s more stepping its statements than in an unstalled run.
The container's CPU did not rise. The container waited on I/O for 4.5 to 5.3 s,
and its dirty pages rose to about 400 MiB, against about 294 MiB in unstalled
runs. In one of the two, the VM's dirty pages reached the kernel's hard limit.
The stall did not land where Step E's did: Step E stalled in the `COMMIT`
statement's step, and these two stalled in the other statements' steps. Their
`COMMIT` steps stayed unstalled.

So the mechanism is reproduced: writeback to the disk falls behind, dirty pages
rise to the throttling limits, and the writer's buffered writes wait. That Step
E's own stall had this cause is likely but not established: no observer ran
then, and the stalled phase differs. Two causes are refuted:
- a full, clean page cache;
- reclamation, whether the kernel's or LayerFS's in-Commit row reclamation.

Recommendation: accept; no product change. No product source changed. Every
timing is diagnostic and INELIGIBLE. Durable execution: NOT_RUN — disabled by
owner until explicit reauthorization.

### Hypothesis tested

Before any new sample, the retained evidence was:
- Step E's Commit used 11.07 s of container CPU in total against 10.62 s for
  the unstalled diagnostic. Both figures are cumulative to the post-Commit
  snapshot.
- Step E's kernel reclaim was kswapd only: 6,592 pages scanned, none direct.

So Step E's extra ~6 s was waiting, not work. The hypothesis was that the
writer's buffered writes waited in the kernel. Candidates:
1. page-cache state: a full cache forcing reclaim, or dirty pages at the
   throttling limits;
2. slow writeback because of other I/O on the shared VM;
3. the in-Commit row reclamation that Step B (`a2d0640fd`) moved onto the
   calling thread.

### Samples

All samples ran one case, `workspace_change_locality:workspace-dense-rewrite-500-mixed-v4`,
one command each, with `tools/cgroup_observer.py` beside it. Each sealed build's
daemon binary is byte-identical to Step E's (`49a0f534d35d…`). The condition
column is the declared condition, which the receipt's interference line also
states.

| Sample | Source | Condition | Verdict | Commit, ms | Receipt |
| --- | --- | --- | --- | ---: | --- |
| S1 filled | `c92c44de8` | VM page cache filled first by reading this worktree's own volumes read-only: 105 MB free, 3.4 GB cached. No second writer. | INELIGIBLE; functional, proof PASS; cleanup Gone | 7,757.6 | `c61686ea` |
| refused | `c92c44de8` | 4 KiB synchronous-write load, same identity | Refused before running: the harness claim file already existed (one sample per case and identity). No receipt. Kept as its folder and observer rows. | — | — |
| S2 load | `622fff56c` | Declared load: container `issue321-io-load`, 60 s of 4 KiB writes with `oflag=dsync` (about 6 MB/s) on its own scratch volume. VM up 614 s, 1.6 GB free. | INELIGIBLE; functional, proof PASS; cleanup Gone | 12,168.8 | `8554434a` |
| S3 dirty | `5e2b3504b` | Declared load: the same container for 60 s, rewriting a 256 MiB file through the page cache, never synced. VM up 167 s, 2.9 GB free. | INELIGIBLE; functional, proof PASS; cleanup Gone | 11,805.2 | `afa8ab96` |

- Counts in every sample: 33,359 / 134,879 / 530,261, equal to Step E.
- New identities came from real commits:
  - `622fff56c` added [`tools/commit_kernel_window.py`](tools/commit_kernel_window.py);
  - `5e2b3504b` aligned it on all three unmounts rather than the largest page drop.
- The diagnostic of the previous section is the unstalled reference:
  `0a57b780d`, fresh VM, Commit 6,077.4 ms.

### Where the wall went

From [`tools/store_writer_split.py`](tools/store_writer_split.py) and the
receipts' section 13 and 14 counters over the Commit call. Statements, VM
steps, transactions and pack bytes are equal in all five, to within 15
statements.

| Wall, ms | Step E | Diag-1 | S1 filled | S2 load | S3 dirty |
| --- | ---: | ---: | ---: | ---: | ---: |
| Commit | 12,026.4 | 6,077.4 | 7,757.6 | 12,168.8 | 11,805.2 |
| Writer: step, all statements | 5,784.2 | 982.1 | 1,325.3 | 6,458.7 | 6,467.6 |
| of it, the `COMMIT` statement | 5,298.3 | 497.4 | 614.2 | 498.2 | 566.3 |
| of it, every other statement | 485.9 | 484.7 | 711.1 | 5,960.5 | 5,901.3 |
| Commit without the writer's step | 6,242.2 | 5,095.3 | 6,432.3 | 5,710.1 | 5,337.6 |
| Two Store readers, transactions | 510.0 | 141.5 | 851.8 | 343.8 | 166.7 |
| Operation-record lock hold | 1,138.5 | 388.6 | 472.3 | 453.6 | 413.3 |
| In-Commit row reclamation (15,569 jobs, 526,492,222 B in each) | 497.0 | 498.3 | 593.0 | 564.3 | 514.3 |
| Store pages not resident after (of about 259,460) | 16,132 | 0 | 107,387 | 91,831 | 15,886 |

- The writer's extra step time over diag-1:
  - Step E +4,802.1 ms
  - S2 +5,476.6 ms
  - S3 +5,485.5 ms
  - S1 +343.2 ms
- With the writer's step removed, the five Commits lie within 5.1 to 6.4 s.
- The writer's blob reads are 19 to 26 ms in every sample. Reads from the
  Store (non-resident pages) do not explain the stall: S1 had the most pages
  not resident and did not stall, and S3 had as few as Step E and did.

### Kernel counters, stalled against unstalled

From [`tools/commit_kernel_window.py`](tools/commit_kernel_window.py). Observer
rows are every 100 ms, aligned on the three unmounts: 3 of 3 matched in each
sample. Diag-1's and S1's values are unchanged by the alignment fix.

| Over the Commit | Diag-1 (unstalled) | S1 filled (unstalled) | S2 load (stalled) | S3 dirty (stalled) |
| --- | ---: | ---: | ---: | ---: |
| Observer rows | 56 | 75 | 119 | 115 |
| Container CPU, ms | 5,897.8 | 7,026.1 | 6,569.7 | 6,477.5 |
| Container stalled on I/O (some = full), ms | 8.2 | 657.0 | 5,319.5 | 4,483.3 |
| Container stalled on memory, ms | 0.0 | 1.1 | 0.2 | 0.0 |
| Container dirty pages, peak MiB | 294.4 | 293.5 | 403.6 | 390.4 |
| Container writeback pages, peak MiB | 176.0 | 98.8 | 51.0 | 76.4 |
| Container bytes written by the kernel, MiB | 512.1 | 486.5 | 436.2 | 698.0 |
| Container pages scanned / stolen for reclaim | 0 / 0 | 38,988 / 38,983 | 22,656 / 22,656 | 0 / 0 |
| VM free memory at start / minimum, MiB | 714.7 / 174.6 | 68.5 / 59.7 | 78.3 / 60.4 | 521.3 / 65.0 |
| VM dirty + writeback, peak MiB | 302.9 | 301.3 | 411.6 | 655.2 |
| VM dirty limits, hard / background, MiB | 641.3 / 320.3 | 652.2 / 325.7 | 655.8 / 327.5 | 652.1 / 325.7 |
| VM pages scanned by kswapd / directly | 0 / 0 | 195,371 / 0 | 231,214 / 0 | 33,806 / 0 |
| VM pages written out, MiB | 622.5 | 599.5 | 1,686.2 | 1,345.2 |
| VM stalled on I/O (some), ms | 198.2 | 705.0 | 5,449.4 | 2,353.1 |

- In the stalled runs the I/O wait equals the writer's extra step time, within
  about 1 s. CPU is no higher than in S1.
- S3 reached the VM's hard dirty limit (655.2 MiB of 652.1).
- S2 stayed below the VM-wide point at which throttling begins (about
  490 MiB, half-way between the limits) and still stalled.
- In both stalled runs the container's own dirty pages peaked at about 400 MiB.
- My reading, not measured: the container's memory cgroup has its own dirty
  limits, taken from its 2 GiB limit.
  - 10% and 20% of about 1.95 GiB are 196 and 392 MiB; their midpoint is 294 MiB.
  - The unstalled peaks sit at that midpoint (294.4 and 293.5).
  - The stalled peaks sit near the upper limit (403.6 and 390.4).
  - If so, the cgroup's limits, not the VM's, are what throttled S2. The
    observer does not read those limits.

### Verdicts

- **Was a stall captured?** Yes, twice (S2, S3). Each was a writer stall of
  Step E's size, with I/O wait and dirty pages at the throttling limits. It was
  not the same signature: the stalled phase was the other statements' steps,
  not the `COMMIT` statement's.
- **Page-cache state.**
  - Refuted for a full, clean cache. S1 filled it, and kswapd scanned
    195,371 VM pages and 38,988 container pages during the Commit. The writer
    gained 343 ms and the `COMMIT` step 117 ms; no stall.
  - Confirmed as the mechanism for dirty pages held at the throttling limits by
    writeback that falls behind (S2, S3). It produces a writer stall of
    Step E's size with CPU unchanged.
  - Not established as Step E's cause:
    - Step E had no observer.
    - Its stall sat in the `COMMIT` step.
    - What slowed writeback then is unknown. Other agents share the VM; the
      receipt's interference line declares that, but not their activity.
- **In-Commit reclamation.**
  - Refuted as the cause.
    - LayerFS's row reclamation is present at 497 to 593 ms in all five
      samples, stalled or not, so it is not sufficient.
    - The 12 October sample of code before #320 stalled with 0.2 ms of it, so
      it is not necessary.
    - Its wall did not grow in the stalled runs.
    - Kernel reclaim is refuted too. It was kswapd only, never direct, in every
      sample, Step E included. S3 stalled with no container reclaim at all.
  - Not established: how much the reclamation's own overlay writes add to the
    container's dirty pages during a stall. No counter separates them.
- **Not established: why Step E's stall sat in `COMMIT`.**
  - The writer appends frames to the WAL during statement steps when its page
    cache spills, and at `COMMIT`. The `COMMIT` step also runs the
    auto-checkpoint, which writes into the Store file.
  - Throttling stops whichever `write()` crosses the limit, so the phase is
    plausibly an accident of timing. This is a hypothesis, not tested.

### Recommendation and owner decisions

1. Accept the Step E row; no product change follows from this.
   - The stall is the kernel throttling buffered writes when writeback falls
     behind on the shared VM.
   - Its size depends on other I/O, not on LayerFS work.
2. For this case, compare the Commit without the writer's whole step time,
   not only without the `COMMIT` step. Read
   [`tools/commit_kernel_window.py`](tools/commit_kernel_window.py) beside any
   sample whose writer step rises.
3. Owner decision, not proposed as a fix: whether a large Commit should limit
   its own dirty pages. A write-behind or pacing of Store writes could keep a
   Commit off the throttling limit. It would change no total work. It would
   need a design and measurement with the same declared load. It touches the
   Store write path, so it is not decided here.
4. Not done: no sample of the baseline binary under load, no rate of stalls,
   no reading of the memory cgroup's dirty limits.

### Evidence, storage and cleanup

- Sample folders: `benchmark-results/fs-bench-pro/2026-10-14-issue321-g-stall-1-diag-filled-…`,
  `…-g-stall-2-diag-load-…` and `…-g-stall-3-diag-dirty-…`, each under
  `workspace_change_locality/`. The refused attempt is `…-g-stall-1-diag-load-…`.
- Observer folders beside them hold `rows.jsonl`, the VM state before and after,
  and the declared condition:

  | Folder | Rows | sha256 |
  | --- | ---: | --- |
  | `…-g-stall-1-filled-observer` | 457 | `bc6adb9c` |
  | `…-g-stall-1-load-observer` (refused attempt) | 85 | `331e1579` |
  | `…-g-stall-2-load-observer` | 505 | `70a5406e` |
  | `…-g-stall-3-dirty-observer` | 518 | `b59b6105` |

  The load containers were stopped before they printed their pass counts, so
  `load.txt` is empty.
- Commands, each bounded:
  - builds: `g-stall-1`, `g-stall-2` and `g-stall-3` (104.1 s);
  - samples: three runs plus the refused attempt.
- Each test copy was removed after its manifest check (1,062.8 MB each); the
  one original stays.
- The scratch volume `issue321-fill-scratch` was created for the loads at
  03:33:58Z and removed. No container of this session remains, and the volume
  count is back to 253. Free space: 350 GiB.
- Interference: the Docker VM restarts after idle, and other agents may use it.
  Neither Docker was restarted nor caches were dropped machine-wide. S1 filled
  the cache by reading, not by dropping it.

### Source size

Production LOC 81,054 -> 81,054 (delta +0) for each of `622fff56c`,
`5e2b3504b` and this record. Scope: first-party `core/crates` production code,
including shipped SQL. Counter: pinned `tools/production_loc.py`
(`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`), run on
the first-parent and committed-tree Git archives. Reference absent (retired
R9c; last counted 65,417 at tree 498dd1917812). The tool is under `core/docs`,
outside the count.

## Issue 321 pre-merge checks and owner decisions (2026-10-14)

Checks owed at the rebased identity, run once at `3316a4547` (product tree
equal to Step D and E) before #321 merges into `main`. No product source
changed. Durable execution: NOT_RUN — disabled by owner until explicit
reauthorization.

### Owner decisions, 2026-10-14

- Root `AGENTS.md` wording for the per-Workspace overlay (PLAN section 11, as
  applied in Step E): approved as written.
- Step B's finite-frontier deviation is accepted: a waiting capture or known
  install holds a finite frontier, and later mutations or acquisitions wait
  behind it.
- The rows Step E left unexplained are accepted as recorded:
  - local snapshot command +19.2% (with its Commit, 2.3 s faster in total);
  - Store logical bytes up in six cases and down in six.
- Landing: merge into `main` and push after these checks, then close #321.

### Results

| Check | Command or route | Result |
| --- | --- | --- |
| Formatting | `cargo +1.85.1 fmt --all -- --check` | PASS |
| Product boundary guard | `core/tools/check_product_boundary.py` | PASS, 689 files |
| Tool unit tests | `unittest discover -s core/tools` | PASS, 50 |
| Host Clippy, all core targets, `-D warnings` | `check.py m-clippy-01`, 9.8 s | PASS, except 2 errors in `layerfs-project` examples `benchmark_history` and `verify_history`: they include `core/benchmark/fs-bench-pro-storage-content/…`, which the reorganisation `13f9dec38` (already on `main`) moved. Not from #321; unchanged since Step A. |
| Linux Clippy, all core targets, `-D warnings` | `linux_step.py m-linux-clippy-01`, 24 s | the same 2 errors only |
| Host tests, every test binary of the core workspace | build `--tests --lib --no-run` 32.7 s; each binary run alone with a 30 s limit | 315 binaries, 1,320 tests pass, 4 fail (see below); none reached its limit; longest 12.6 s |
| Linux mounted and proof binaries with FUSE | `lbatch.sh m-lx` | 43 of 43 exit 0; 106 pass, 0 fail, 6 ignored |
| Device-full proofs on an owned ext4 loop device | `linux_device_pinned.py`, fixture `device_fixture.sh` | 4 of 4 PASS, each with owned teardown (unmounted, loop detached, artifacts removed): overlay `real_device_full_at_commit_rolls_back_write_and_preserves_capture`; daemon `real_owner_reclaims_at_device_full_after_last_owner_without_a_cleanup_job`; mounted `real_device_full_reports_enospc_and_normal_drain_completes` and `…forced_drain_completes` |
| Harness engine suite, native inputs from sealed build `g-stall-3` | `unittest discover tests/engine` | 379 run, OK, 3 skipped |
| Harness families suite, same inputs | `unittest discover tests/families` | 90 run, OK |
| Cluster-two harness suite | `unittest discover core/benchmark/cluster-two/tests` | 281 run, OK, 87.4 s |

Notes on the results:

- **Device-full fixture.** The fixture's default overlay test name is stale
  and would match no test under `--exact`, so every test name was passed
  explicitly.
- **Native inputs for the harness suites.** The workspace-writer,
  workload-host and edit-host binaries of build `g-stall-3` (`5e2b3504b`),
  plus the repository's own `lstat_counter.c` built as a dylib. They are named
  by `FSB_CONTEXT_NATIVE`, `WORKSPACE_RECIPE_TEST_WRITER`,
  `M1_WORKLOAD_TEST_WRITER`, `LAYERFS_ALIAS_*`, `LAYERFS_EDIT_WRITER_BUILD`,
  `LAYERFS_LOCAL_SNAPSHOT_BUILD`, `LAYERFS_SMALL_DELTA_BUILD`,
  `FS_BENCH_TEST_BUILD` and `FSBP_LSTAT_COUNTER`.
- **Clean tree for the sealed build.** The suites ran at the clean tree
  `3316a4547`, with the test change below stashed: a sealed build loads only
  when compiled inputs match. That change touches a test file, which no
  binary contains.
- **Previously NOT_RUN.** The six harness tests now pass, and so do the five
  families tests that used to skip.
- **Engine skips.** The three remaining skips need fixtures that no #321 item
  names: a public census output, a compiler-only CLI and a staging socket.

### Host failures

- **`layerfs-overlay` `reply_tickets`, two tests: fixed, test-only.** The
  ledger called these "pre-existing", but that was wrong. On `sdk-refactor`
  all 11 tests of the file pass (built from an export of `9fe542e3b`). #321
  rewrote the file in Step A and C, and the two failures follow from that
  rewrite.
  - Before #321, a closed Workspace's terminal queue called `watch()` on its
    pending tickets, so the last reply attempt returned `Watched`. Step A
    removed that queue: the terminal state is now read again on each look,
    and the last attempt returns `Last`. The daemon ignores the distinction:
    `reply_attempted` wakes every waiter of the Workspace after each attempt.
  - The tests still expected `Watched`. One also opened a second Workspace in
    the same database, which a per-Workspace file refuses.
  - Following the owner's rule for retired-model tests, they now assert the
    surviving behaviour:
    - the last attempt is `Last`;
    - the cleanup state goes from Held to Queued;
    - the second Workspace gets its own database.
  - All 11 pass.
- **`complete_installed_roots::huge_native_namespace_is_complete_after_install`:
  NOT_RUN.** It needs an explicit closed preparation (`LAYERFS_Q1_PREPARED`).
- **`host_handoff::macos_init_handoff_to_linux_daemon_has_no_host_data_path`:
  NOT_RUN.** It needs a build-listed Linux daemon test binary
  (`LAYERFS_INSTALL_DAEMON_BINARY`).

Both are environmental, as at every earlier step; #321 does not touch host
handoff or Init.

### Still ignored by their own declaration

- `r5_6_a_reported_…`: a reported gap, ignored by design.
- External daemon and subprocess roles that their parent proofs invoke.
- `prepare_huge_native_namespace`: a sealed preparation, not a proof.

### Source size

Production LOC 81,054 -> 81,054 (delta +0); the change is one test file and
documentation. Scope and counter are as in the previous section. Reference
absent (retired R9c; last counted 65,417 at tree 498dd1917812).

## Issue 321 follow-up — automatic I/O-stall label (2026-10-14)

The two stall investigations above found the cause by hand. fs-bench-pro now
records it for every sample. No product source changed. Durable execution:
NOT_RUN — disabled by owner until explicit reauthorization.

### What changed

- `61ec6f181`: [`tools/store_writer_split.py`](tools/store_writer_split.py)
  also prints `commit_without_writer_step_ms`, the Commit without the writer's
  whole step (section 13 index 32, already printed as `writer_step_ms`).
  Existing fields are unchanged. On the retained receipts it gives 5,337.7 ms
  for S3 and 6,432.3 ms for S1, as in the table above.
- `73a49c01f`: `bench.py run` starts
  [`tools/cgroup_observer.py`](tools/cgroup_observer.py) beside each case
  (fs-bench-pro `engine/io_observer.py`) and keeps its rows in
  `<sample>/io-observer/`. Each receipt declares it in the interference line
  and gains `io_observer`: per Commit, the counts of
  [`tools/commit_kernel_window.py`](tools/commit_kernel_window.py), and a
  label. The tool is now importable; its command-line output is byte-identical
  on the three retained g-stall samples.
- The harness aligns the clocks directly, not on unmount drops: the runtime's
  origin is the host birth time of `runtime.events.jsonl`, and VM wall minus
  host wall is bounded by the smallest arrival delay of the observer's rows.
  It needs no large unmount, so it also works for small cases.

### The label

`IO_STALLED` when the container's I/O "some" pressure exceeds 20% of the
observed Commit interval, else `NOT_STALLED`; `NO_COMMIT` and `UNAVAILABLE`
give a reason. It is diagnostic: no status, verdict or limit depends on it, and
`report` appends it to the row's tag.

| Sample | Container I/O wait, ms | Commit, ms | Fraction |
| --- | ---: | ---: | ---: |
| Diag-1 (unstalled) | 8.2 | 6,077.4 | 0.1% |
| S1 filled (unstalled) | 657.0 | 7,757.6 | 8.5% |
| S3 dirty (stalled) | 4,483.3 | 11,805.2 | 38.0% |
| S2 load (stalled) | 5,319.5 | 12,168.8 | 43.7% |

20% is more than twice the highest unstalled fraction and about half the
lowest stalled one. It separates four samples of one case; it is not a
qualified bound.

### Checks and the labelled sample

- Harness suites, native inputs from sealed build `g-stall-3`:
  - `tests/engine`: 384 run, OK, 3 skipped (25.0 s);
  - `tests/families`: 90 run, OK (47.3 s);
  - `core/benchmark/cluster-two/tests`: 281 run, OK (86.4 s).
  Each ran once under a 120 s limit.
  - They ran at a temporary local commit, `60c24df49`. It holds `73a49c01f`
    plus `core/crates/layerfs-overlay/tests/reply_tickets.rs` at g-stall-3's
    version, because a sealed build loads only when compiled inputs match.
    That file is a test, so no binary contains it.
  - The commit is kept on local branch `fsb-io-stall-sample-identity` and is
    not on this branch.
- One labelled sample at that identity:
  - case `workspace_change_locality:workspace-dense-rewrite-100-mixed-v4`;
  - original prepared fresh (13 s);
  - result INELIGIBLE, proof PASS, cleanup Gone;
  - counts 12,545 / 49,076 / 185,921;
  - Commit 1,596.6 ms over 17 observer rows;
  - container I/O wait 0.0 ms, so label `NOT_STALLED`;
  - container dirty peak 207.0 MiB;
  - VM dirty plus write-back peak 214.0 MiB, against limits of 665.7 MiB hard
    and 332.4 MiB background;
  - pgscan 0 in the container and the VM;
  - host minus VM clock 5.6 ms.
- Check of the alignment: all three unmounts fall within 10 to 40 ms of a 102
  to 206 MiB drop in the container's file pages, one row apart at most.
- Evidence:
  - `benchmark-results/fs-bench-pro/2026-10-14-io-stall-flag-label-1-workspace_change_locality/`
    (receipt `20ab691f`, 123 observer rows `22728269`);
  - the sample container and volume were removed (PASS);
  - the prepared original `…-io-stall-flag-prepared-dense-rewrite-100` stays.
- Not done: no sample under a declared load, so the label has not yet been seen
  to say `IO_STALLED` on a live run. The unit test covers that branch with
  synthetic rows.

### Source size

Production LOC 81,054 -> 81,054 (delta +0) for `61ec6f181`, `73a49c01f` and
this record. Scope and counter are as in the earlier sections: pinned
`tools/production_loc.py` (`c0fe7f36…`) on Git archives of the first parent
and the staged tree. Reference absent (retired R9c; last counted 65,417 at
tree 498dd1917812).

## Issue 321 follow-up — source size against the plan's estimate (2026-10-14)

**Question.** #321's plan (section 6.2) estimated the whole product at about
77,500–79,500 production lines after steps A and B, from 84,220 at
`20f237499`. Its targets section states this as a direction, not an
acceptance threshold. The merged product is 81,054. This section traces where
the excess sits and removes what nothing uses.

**Result.** The excess is not dead code. Code that neither product nor tests
use came to 36 lines, now removed: 81,054 -> 81,018. The rest has one of
three reasons, and each larger cut is a decision listed below.

### Where it sits

Against `20f237499`, most of the excess is in two places:
- **Daemon `overlay/`:** 4,042 -> 2,925, against an expected 1,600–2,000.
  - The typed job list `commands.rs` (832 lines) was removed in Step B, but
    its operations became wrapper methods with the same shape.
  - The wrappers are `lifetime_operations`, `read_operations`,
    `native_operations`, `record_operations`, `scopes` and the five `*_port`
    files: 73 methods. Each takes `route: Option<Route>`, refuses a missing
    route, checks the token's route and wraps its result in the 33-variant
    `Response` enum (or `NativeReply`), which callers destructure again.
  - That shape existed so a typed job could cross to the owner thread. With
    the calling thread running the job, it is a leftover.
- **Overlay `lifetime/`:** 3,682 -> 3,316, against an expected 2,100–2,500.
  - Moving the open-state tables into memory (`open/`, 395 lines) replaced
    SQL with maps, but the operations over that state stayed in `lifetime/`.
    Examples are open/close, read sources, lookups, native mounts, visits and
    cookies.
  - `open/` holds the data structures and `lifetime/` the operations; they
    are not duplicates. The estimate assumed more of `lifetime/` would leave
    with the tables.

Scope of the listing: working tree of this commit, pinned
`tools/production_loc.py --files`, the three directories traced. Tests are
under each crate's `tests/` and are not counted.

```
layerfs-daemon/src/
  overlay/                            [2925]
    backing.rs                           118
    captured_namespace_port.rs            87   (wrapper shape)
    captured_run_port.rs                  29   (wrapper shape)
    file_port.rs                          44   (wrapper shape)
    indexed_operation_record.rs           92
    lifetime_operations.rs               459   (wrapper shape; -9 database_work)
    mod.rs                                15
    native_operations.rs                 208   (wrapper shape; -16 native_directory_retained)
    operation_record_port.rs             174   (wrapper shape)
    owner.rs                             585   (lock, readiness, frontier, accounting: needed)
    read_operations.rs                   315   (wrapper shape)
    read_port.rs                         110   (wrapper shape)
    record_operations.rs                  22   (wrapper shape)
    scopes.rs                             92   (wrapper shape)
    state.rs                              89
    workspaces.rs                        486   (roster, mount copy, close and delete: needed)
  service/                             [699]
    filesystem_port.rs                   449   (FUSE ports; destructures Response)
    job_sql.rs                            56
    mod.rs                                 7
    observations.rs                       10
    owner_work.rs                         51
    receipt.rs                            47
    results.rs                            71   (Response, NativeReply; -2 variants)
    startup.rs                             8
```

```
layerfs-overlay/src/
  lifetime/                           [3316]
    captured_reader.rs                   181
    close.rs                             129   (-9 explain_cleanup_observation)
    composition.rs                       237
    file_owners.rs                       369
    frontier.rs                           47
    generation.rs                        165
    indexed_operation_record.rs          199
    lookup.rs                            131
    mod.rs                                22
    native.rs                            258
    native_cookie.rs                     140
    native_directory.rs                  126
    native_directory_read.rs             161
    native_file.rs                        67
    native_mutation.rs                    88
    native_visit.rs                      323
    operation.rs                         101
    operation_record.rs                   70
    orphan.rs                            171
    source.rs                            144
    tickets.rs                           103
    workspace.rs                          84
```

### Classification

| Kind | Lines (counted or measured) | Disposition |
| --- | ---: | --- |
| Used by nothing, product or test: daemon `database_work` and `native_directory_retained` wrappers, `Response::DatabaseWork`, `NativeDirectoryReply::Retained`, overlay `explain_cleanup_observation` | 36 | **Removed in this commit** |
| Daemon wrappers that only daemon tests call (28 methods, no product caller) | about 366 | Kept. Moving them into `tests/support` would be relocation of test drivers, not a simplification. |
| Retained-by-request observations: overlay `retained_*` (10) and their daemon wrappers | 144 + 96 | Kept. No product caller, but documented custody capability (architecture 26, 33, 34: "observation of original retained custody after a lost reply"). Removing it changes a contract. |
| Query-plan helpers `explain_*`, called only by plan-pin tests | small | Kept. They need the private SQL text, and the tests prove index use. |
| Wrapper shape left from the typed job list | 67 missing-route lines, 68 bare-brace lines, 84 route-check lines, 103 result-wrapping lines; `Response` and `NativeReply` about 70; 43 `result()` destructuring sites | Kept. Removing it is a redesign: non-optional `Route` and typed receipts. |
| `lifetime/` operations over in-memory open state | — | Needed; not a duplicate of `open/` |

### Decisions for the owner

1. **Typed receipts and a non-optional route in the daemon wrapper layer.**
   - Change: replace `Response` with a typed `JobReceipt<T>`, make the route a
     plain `Route`, and turn the route check into a one-line helper.
   - Size: an estimate from the counts above, not a traced design, of about
     300–400 lines.
   - Cost: 30 product files and about 250 test references to `Response` or
     `NativeReply` change. Behaviour and exact accounting stay as they are.
   - This is the main real simplification available.
2. **Retire the retained-by-request observations.**
   - Size: about 240 lines, plus the tests that pin them.
   - The daemon never uses them, but three architecture guides describe them
     as the lost-reply custody observation, so it is a contract change.
3. **Relocate the 28 test-only daemon wrappers** into `tests/support`.
   - Size: about 366 lines out of the count.
   - Allowed only if labelled as relocation; not recommended as a "cut".

Even 1 and 2 together leave the product near 80,400–80,500, above the
estimate. Reaching 79,500 would need `lifetime/` itself redesigned, which
nothing traced here supports.

### Checks

- Host Clippy `-D warnings`, all targets of daemon, overlay, fuse, bridge,
  workspace, sdk and sandbox: clean.
- Formatting: clean.
- 137 daemon and overlay test binaries, each with a 30 s limit:
  - 350 tests pass;
  - 2 fail, both environmental and NOT_RUN as before:
    `complete_installed_roots::huge_native…` and `host_handoff`;
  - the longest binary took 13.0 s.
- No Linux check: no Linux-specific code changed.
- Durable execution: NOT_RUN — disabled by owner until explicit
  reauthorization.

### Source size

Production LOC 81,054 -> 81,018 (delta -36); scope first-party `core/crates`
production code including shipped SQL; pinned `tools/production_loc.py`
(`c0fe7f36…`). Reference absent (retired R9c; last counted 65,417 at tree
498dd1917812). This is removal of unused code, not an algorithmic
simplification.

## Issue 321 follow-up — open-state and Commit memory, E1–E5 at 1 and 2 Workspaces (2026-10-14)

**Question (owner).** How large is the memory risk of keeping a Workspace's
open state in daemon memory? Is it bounded? Does it limit file count or file
size? This was measured for 1 and then 2 Workspaces in one sandbox, matching
the fs-bench-pro harness (2 CPUs, 2 GiB, no swap). Mutation and Commit are
included.

**Findings.**
- **Kernel-reference map.**
  - It costs the daemon about 225 B of anonymous memory per file the kernel
    references.
  - The kernel's own slab costs about 1,150 B for each of the same files,
    plus a page-cache page per written file.
  - The map is bounded in practice by kernel reclaim. Under pressure in the
    same cgroup, the kernel reclaimed its slab and sent FORGET, and the map
    fell from 48,603 to 1,008 entries (one Workspace) and from 97,206 to 2,016
    (two). The daemon survived, and only the files still held open stayed.
- **Directory listing positions** are held while a handle is open and
  released on close: 313 pages for a listed directory of 20,000 names.
- **Deleted-but-open files and open handles** returned to zero after close.
- **File size costs nothing in open state.**
  - Writing 128 MiB raised the daemon by about 1.4 MiB.
  - Each Commit peaked about 26–34 MiB above the level before it, at 20k or
    50k files and at 128 MiB alike.
- **No count or size limit was met.**

Every value is a single diagnostic observation on the shared VM: INELIGIBLE.
No product source changed. Durable execution: NOT_RUN — disabled by owner
until explicit reauthorization.

### Samples

The tool is [`open_state_memory.py`](../321/tools/open_state_memory.py)
(`d7c157f9c`; filler revised in `f5f539921`). Every sample uses:
- build `2026-10-14-issue321-g-stall-3-build` (source `5e2b3504b`), whose
  daemon `49a0f534d35d…` is byte-identical to the one on `main`;
- prepared original `issue320-originals/empty`, cloned per sample and removed
  with its container;
- `LAYERFS_CONSTRUCTION_WORKERS=1`;
- no other container running at start or end of any sample.

| Sample | Workspaces | Load | Wall s | result.json | Verdict |
| --- | ---: | --- | ---: | --- | --- |
| `…-mem-w1-files-a` | 1 | 20,000 files, directory of 10,000 | 21.1 | `0e4e94bd` | runs; the filler stopped 96 MiB short by `memory.current`, so it forced **no** reclaim (pgscan 0). E2 is not established by this sample; kept, superseded by b |
| `…-mem-w1-files-b` | 1 | 50,000 files, directory of 20,000 | 37.1 | `6630a361` | runs; reclaim forced |
| `…-mem-w2-files-b` | 2 | 50,000 files each, directory of 20,000 each | 50.8 | `ddd0816f` | runs; reclaim forced |
| `…-mem-w1-large` | 1 | one 128 MiB file of random bytes | 7.0 | `a6e50414` | runs |
| `…-mem-w2-large` | 2 | one 128 MiB file each | 9.4 | `8955def2` | runs |

Phases of the `files` mode, all Workspaces at once:
- **E1 create:** files in 100 directories plus the big directory, then an
  lstat walk of everything.
- **E3:** a process lists the big directory to its end through a descriptor
  and keeps it open.
- **E4:** rewrite every 10th file; open 1,000 files and keep them open, then
  unlink them; unlink every 20th other file; rename the 100 directories.
- **E2:** a filler grows anonymous memory in the sandbox to 64 MiB below the
  limit.
- **Then:** Commit each Workspace, close the handles, unmount to Gone.

### Daemon and sandbox memory

KiB values are the daemon's `/proc/1/status`. Other values are bytes from the
sandbox cgroup.

| Phase | w1 files-b RssAnon KiB | w2 files-b RssAnon KiB | w1 slab B | w2 slab B | w1 file B | w2 file B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| mounted | 5,080 | 5,416 | 664,216 | 729,784 | 294,912 | 421,888 |
| created and walked | 16,092 | 27,396 | 58,276,160 | 115,901,656 | 212,725,760 | 425,721,856 |
| big directory listed and held | 16,180 | 27,524 | 58,298,912 | 115,940,472 | 212,729,856 | 425,730,048 |
| mutated, unlinked files held | 16,632 | 28,520 | 57,526,472 | 114,395,704 | 206,827,520 | 413,937,664 |
| after memory pressure | 17,100 | 28,960 | 2,540,448 | 4,537,704 | 3,571,712 | 7,290,880 |
| committed | 47,332 | 62,352 | 4,717,352 | 8,755,656 | 79,126,528 | 154,353,664 |
| handles released | 47,332 | 62,352 | 2,921,592 | 5,179,032 | 79,126,528 | 154,353,664 |
| unmounted, Gone | 47,332 | 62,352 | — | — | — | — |

Per kernel-referenced file:

| Arithmetic | Daemon, anon B | Kernel slab, B |
| --- | ---: | ---: |
| w1-b: 50,102 more entries | (16,092 − 5,080) × 1,024 / 50,102 = **225.1** | (58,276,160 − 664,216) / 50,102 = **1,149.9** |
| w2-b: 100,204 more entries | (27,396 − 5,416) × 1,024 / 100,204 = **224.6** | (115,901,656 − 729,784) / 100,204 = **1,149.4** |
| w1-a: 20,102 more entries | (10,376 − 5,080) × 1,024 / 20,102 = 269.8 | (24,054,136 − 714,608) / 20,102 = 1,161.0 |

- The daemon figure includes allocator overhead and anything else the create
  phase allocated. Step A's isolated estimate was 171 requested B per entry.
- The kernel also kept about one 4 KiB page-cache page per written file:
  212 MB of `file` for 50,000 files. That page cache is reclaimable.
- Idle cost of a Workspace: 5,080 to 5,416 KiB, so about 0.33 MiB more for a
  second mounted Workspace.

### Open-state counts

The Status rows are **daemon-wide totals**, not per Workspace: both Workspaces
report the same numbers.

| Phase | w1-b kernel entries | w1-b held / orphans / dir handles / cookie pages | w2-b kernel entries | w2-b held / orphans / dir handles / cookie pages |
| --- | ---: | --- | ---: | --- |
| mounted | 1 | 0 / 0 / 0 / 0 | 2 | 0 / 0 / 0 / 0 |
| created and walked | 50,103 | 0 / 0 / 0 / 0 | 100,206 | 0 / 0 / 0 / 0 |
| listed and held | 50,103 | 0 / 0 / 1 / 313 | 100,206 | 0 / 0 / 2 / 626 |
| mutated | 48,603 | 1,000 / 1,000 / 1 / 313 | 97,206 | 2,000 / 2,000 / 2 / 626 |
| after pressure | **1,008** | 1,000 / 1,000 / 1 / 313 | **2,016** | 2,000 / 2,000 / 2 / 626 |
| committed | 1,008 | 1,000 / 1,000 / 1 / 313 | 2,016 | 2,000 / 2,000 / 2 / 626 |
| handles released | 8 | 0 / 0 / 0 / 0 | 16 | 0 / 0 / 0 / 0 |

- Pressure counters: pgscan 49,632 (w1) and 99,288 (w2). The filler reached
  the 2 GiB limit and exited normally; no OOM kill.
- In w2, the first of the two "handles released" Status calls (Workspace 1)
  still showed 715 handles and 718 orphans. The kernel's RELEASE requests were
  in flight after the holders exited. The second call, moments later, shows
  zero; the table gives the second.
- Cookie pages hold 64 names each; the names here are 8 bytes. RSS cannot
  resolve their bytes, because the allocator reuses memory freed by earlier
  phases.

### Commit and large files

| Sample | Before Commit RssAnon KiB | Commit peak RssAnon KiB | Rise KiB | Commit wall s |
| --- | ---: | ---: | ---: | --- |
| w1-a, 20,000 files | 10,744 | 36,828 | 26,084 | 4.10 |
| w1-b, 50,000 files | 17,100 | 47,332 | 30,232 | 11.32 |
| w2-b, 2 × 50,000 files (sequential) | 28,960 | 62,352 | 33,392 | 11.11, 12.03 |
| w1-large, 128 MiB | 6,464 | 37,452 | 30,988 | 1.26 |
| w2-large, 2 × 128 MiB (sequential) | 8,160 | 41,924 | 33,764 | 1.31, 1.42 |

- Writing 128 MiB raised daemon anonymous memory by 1,388 KiB (w1) and
  2,740 KiB (w2). Data streams through; nothing proportional to file size is
  held.
- The sandbox's page cache held the written bytes: 287 MB, and 573 MB for
  two. It is charged to the same 2 GiB cgroup and is reclaimable.

### Answers

| Question | Answer |
| --- | --- |
| Is the kernel-reference map bounded? | Yes, by kernel reclaim in the same cgroup. The kernel spends about 5× as much slab per entry, plus page cache, and reclaims them under pressure; FORGET then empties the daemon's entries. Pinned only by files actually open. |
| Are listing positions bounded? | Only by close or rewind; pressure does not touch them. 313 pages per 20,000 names per open handle; bytes not resolvable here. |
| Is memory returned? | Map entries are; RSS is not (allocator high-water). |
| File count or file size limits? | None from open state. Cost is about 225 B per kernel-referenced file and about 30 MiB of transient Commit peak. Nothing grows with file size. |
| Does the root AGENTS.md "one resident exception" wording cover what was seen? | Mostly ("grows with open files and with the files the kernel currently references"). It does not name listing positions, which grow with names listed per open directory handle. Amending it is an owner decision. |

### Per-Workspace budget, a proposal from these numbers

Steady state is about 0.3 MiB per idle Workspace plus 225 B per
kernel-referenced file. Commit adds a transient of about 26–34 MiB.

With 4 Workspaces in a 2 GiB sandbox, 64 MiB per Workspace covers:
- the Commit peak;
- about 130,000 kernel-referenced files per Workspace, at (64 − 34) MiB /
  225 B.

Beyond that, the kernel's own cost (about 1.4 KB per file including a page)
and its reclaim keep it in check.

Not covered by these samples:
- The dense in-place rewrite of a 500 MiB file, whose daemon peak earlier
  reached about 152 MB.
- Concurrent Commits: the harness control channel is serial, so these
  Commits ran one after another.
- Directory listings of many more names held open in many handles.

### Limits of this evidence

- One sample per condition; 2 Workspaces at most, as the owner asked.
- 50,000 files per Workspace; 8-byte names in the big directory.
- No cross-cgroup case: the daemon and the commands share the sandbox cgroup.
- The w1-a filler did not force reclaim and is not evidence for E2.

### Evidence, storage and cleanup

- Samples are under `benchmark-results/fs-bench-pro/2026-10-14-issue321-mem-*`.
- Each removed its container and cloned volume; the prepared original stays.
- The volume count went from 253 to 254. The extra volume is
  `layerfs-fsb-master-workspace-change-locality-ce2febdb…`, created at
  04:54Z by the I/O-label session's labelled sample, not by these samples.
- Free disk: 317 GiB before.

### Source size

Production LOC 81,018 -> 81,018 (delta +0); tool and documentation only.
Pinned `tools/production_loc.py` (`c0fe7f36…`). Reference absent (retired
R9c; last counted 65,417 at tree 498dd1917812).

## Landing the #321 follow-ups (2026-10-14)

Three branches are merged onto `main` (`9d3f44e4d`), one merge commit each:
- `fix-project-example-includes` (`e759b5f0c`);
- the fs-bench-pro I/O-stall label (`51708c241`);
- the source-size trace with the open-state memory results (`be09d00fa`).

The two appended ledger sections conflicted and were both kept.

The source-size cut had removed an unused EXPLAIN helper from
`layerfs-overlay/src/lifetime/close.rs`. The closed-overlay storage oracle pins
that file, and the trace did not run the harness suites, so the engine suite
refused 26 subtests on the pin. The pin moved to the new hash in `4ad3f2ee4`;
the behaviour it binds is unchanged.

Checks at the landing tip, each once:

| Check | Result |
| --- | --- |
| Formatting, product boundary guard (689 files), tool tests (50) | PASS |
| Whole-workspace Clippy `-D warnings`, host and Linux | **0 errors** (the two example errors are gone) |
| fs-bench-pro engine suite, native inputs from sealed build `2026-10-14-issue321-land-1-build` | 384 run, OK, 3 skipped |
| fs-bench-pro families suite, same inputs | 90 run, OK |
| cluster-two harness suite | 281 run, OK |
| Daemon and overlay test binaries | not rerun: product tree identical to `9c783fbd7`, where 137 binaries passed (350 tests; 2 environmental NOT_RUN) |

Durable execution: NOT_RUN — disabled by owner until explicit reauthorization.
Production LOC 81,054 -> 81,018 (delta -36) across the landing; this record
is documentation only. Reference absent (retired R9c; last counted 65,417 at
tree 498dd1917812).

## Issue 321 follow-up — where the dense-rewrite daemon peak comes from (2026-10-14)

**Question.** `workspace-dense-rewrite-500-mixed-v4` shows a daemon lifetime
peak of about 152 MB (Step E 151,957,504 B; diagnostic 154,542,080 B). The
E1–E5 open-state samples did not cover it. What makes it?

**Finding.** Nearly half of it is fuser's receive buffers, made resident by
glibc. Each mount runs 2 receive loops, and each loop allocates
`vec![0; 16 MiB + 4 KiB]` (pinned fuser 0.18.0, `read_buf.rs`, sized for
fuser's own maximum write), although the negotiated `max_write` is 128 KiB.
- The first mount's buffers are fresh mmaps and stay untouched, so they cost
  nothing.
- Freeing them at that mount's unmount raises glibc's dynamic mmap threshold
  above 16 MiB. Every later buffer then comes from a malloc arena, and
  `calloc` zeroes reused arena memory, so all 16 MiB become resident.
- The memory is not returned after unmount.

In this case that is +16 MiB at the measured mount and +32 MiB at the
verification mount: 48 of the 147 MiB.

The rest of the peak:
- the Commit's encoder workspace, which `Vec::resize` zero-fills (16 MiB
  resident on every save, `layerfs-storage/src/encoding/codec.rs`);
- other Commit state;
- the verification read's kernel references: about 21 MiB for the ~100,000
  files it reads, which matches the 225 B per file of E1–E5.

Fixing glibc's mmap threshold at 16 MiB removes the buffer cost. In one sample
the lifetime peak fell **154,112,000 -> 81,399,808 B (-47.2%)**, with equal
counts, Store bytes within 20,480 B, and functional and proof PASS.

### Samples

Tool: [`daemon_memory_sampler.py`](../321/tools/daemon_memory_sampler.py)
(`368af4dae`, fixed in `e24e0d762`). It is a read-only container in the
sample's PID namespace that reads `/proc/1/status` and the daemon's thread
names every 50 ms. Per-mount threads (`layerfs-mount-N`) mark each mount.
The interference line of every receipt declares it.

Every sample:
- ran on branch `issue321-dense-peak` (from `b0d5ec78d`);
- used one command;
- used a prepared original, cloned and removed;
- set `LAYERFS_CONSTRUCTION_WORKERS=1`;
- used daemon `3e8261fc9f66…` in all three samples (the experiment changes
  only the host-side sandbox crate).

| Sample | Source | Condition | Result | Command ms | Commit ms | VmHWM B (receipt) | Receipt |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| h-peak-1 | `368af4dae` | sampler gave up after 30 s: the 1 GB clone took longer. **No memory rows**; kept | INELIGIBLE; PASS / PASS; Gone | 2,839.5 | 11,688.7 | 153,042,944 | `59a92e82` |
| h-peak-2 | `e24e0d762` | sampler, 503 rows | INELIGIBLE; PASS / PASS; Gone | 2,833.3 | 11,622.6 | 154,112,000 | `6460f49f` |
| h-peak-3 | `582b7f938` (experiment, reverted in `63a2bce0a`) | sampler, 595 rows; daemon container env `GLIBC_TUNABLES=glibc.malloc.mmap_threshold=16777216` | INELIGIBLE; PASS / PASS; Gone | 2,427.1 | 18,349.9 | 81,399,808 | `524c287b` |

- h-peak-1's build folder carries a doubled tag
  (`2026-10-14-issue321-2026-10-14-issue321-h-peak-1-…`) because the full date
  tag was given to the launcher. The launcher finds builds by suffix and used
  it as is.
- Counts in all three: 33,359 / 134,879 / 530,261.
- VM uptime at start: 311 s (h-peak-2) and 721 s (h-peak-3).
- Every timing is INELIGIBLE. Durable execution: NOT_RUN — disabled by owner
  until explicit reauthorization.

### Daemon anonymous memory per mount, MiB

From the sampler rows. "First" is the first row with the mount's threads.

| Mount | h-peak-2 first | h-peak-2 max | h-peak-3 first | h-peak-3 max |
| --- | ---: | ---: | ---: | ---: |
| 1, warmup command | 5 | 16 | 3 | 14 |
| 2, measured command and Commit | **32** | 84 | **14** | 66 (49 at unmount) |
| 3, verification read | **116** | 139 | **48** | 69 |

- **h-peak-2.** RssAnon rose 16 MiB within 50 ms of mount 2's threads
  appearing, and 32 MiB at mount 3.
  - The command added 1 MiB.
  - About 0.4 s into the Commit, 27 MiB arrived within 50 ms (the encoder
    workspace and the start of construction), and anon reached 84 MiB by the
    Commit's end.
  - The verification read added 23 MiB.
- **h-peak-3.**
  - The mount jumps are gone.
  - The Commit still peaks, at 66 MiB, then falls to 49 MiB. The 16 MiB
    encoder workspace is now unmapped when freed, and glibc's fixed threshold
    also stops growing the trim threshold.
  - The verification read adds 21 MiB.
- RssFile is 6–7 MiB throughout (the binary); VmHWM = RssAnon + RssFile at
  the peak.

### The allocator mechanism in isolation

`calloc(16 MiB + 4 KiB)` from 2 threads per "mount" was run in Python
`ctypes` in the same pinned image (glibc 2.36, 2 CPUs), with 4 KiB written to
each buffer, as a request would.

| Rounds | Default glibc, anon MiB | Threshold fixed at 16 MiB |
| --- | --- | --- |
| 10 sequential mounts | 3, 3, then **35** from mount 3 to 10 (plateau) | 3 throughout |
| 1, 1, then 4 Workspaces at once, 4 again, 1 | 3, 3, **36**, **131**, 131 (never returned) | 3 throughout |

- Sequential remounts reach a plateau of about 32 MiB.
- Concurrent mounts each make their own buffers resident: about 32 MiB per
  Workspace mounted at the same time, kept after unmount.
- With 4 Workspaces in a 2 GiB sandbox that is about 128 MiB, double the
  64 MiB per-Workspace budget proposed above, before any open state.
- The E1–E5 two-Workspace samples did not show it: both of their mounts were
  first mounts, before any buffer had been freed.

### Commit time in these samples

All three Commits hit the known kernel write stall: the Store writer's
`COMMIT` statement took 5,450.9 / 5,584.6 / 11,920.1 ms, against about 500 ms
unstalled.

With the writer's step removed (`store_writer_split.py`), the Commits are
5,586.3 / 5,398.9 / 5,782.7 ms. The operation-record lock hold, also buffered
writes, doubled with the stall (428.4 -> 932.2 ms).

So one sample does not establish a time cost for the tunable, and it shows
none outside the stalled writes. The command was 2,427.1 ms against 2,833.3.

### Fix options (owner decision)

1. **Size fuser's receive buffer by the negotiated `max_write`** (128 KiB +
   4 KiB) instead of 16 MiB + 4 KiB.
   - Removes 32 MiB of virtual memory per mount and the allocator
     dependence.
   - Needs the owner to extend the authorized fuser patch: the current
     authorization covers time.rs and the receive-loop lifecycle only.
2. **Fix glibc's mmap threshold for the daemon process.**
   - A `mallopt` at startup needs an unsafe exception: the daemon is
     `forbid(unsafe_code)`.
   - The container-environment tunable used here is inherited by every
     command executed in the container, so it is not a product route.
3. **Encoder workspace.** `Vec::resize` writes all 16 MiB on every save. A
   zeroed allocation leaves untouched pages unmapped under option 2. Without
   option 2 it would still reuse zeroed arena memory. On stable Rust a
   fallible zeroed allocation needs `unsafe` (only allowed in the codec's
   audited FFI module) or an infallible `vec![0; n]`.

Recommendation: option 1. It fixes the cause, is small, and keeps the daemon
free of allocator tuning. Option 3 can follow once option 1 is measured.

### Not established

- The size of the rest of the Commit's 50 MiB beyond the encoder workspace;
  no heap profiler ran.
- Thread-arena behaviour with more than 4 concurrent mounts, or with the
  daemon's real thread mix rather than the `ctypes` model.
- Any time effect of the tunable; one stalled sample each.

Production LOC 81,018 -> 81,018 (delta 0): documentation and diagnostic
tooling only; the experiment was reverted. Reference absent (retired R9c;
last counted 65,417 at tree 498dd1917812).
## Issue 321 follow-up — source-size cut, first pass (2026-10-14)

The owner asked to cut production source aggressively. This pass runs on
branch `issue321-loc-cut` from `main` (`b0d5ec78d`). Each slice is one
counted commit with its checks; the branch is not pushed.

| Commit | Slice | Production LOC |
| --- | --- | --- |
| `4bcb9fb8b` | Daemon overlay jobs require the route: 72 wrappers lose `Option<Route>` and 69 run-time "missing route" refusals. Only `open`, `resources` and `observe_cleanup` keep an optional route. | 81,018 -> 80,826 (-192) |
| `b4f49c225` | Functions that nothing calls (workspace, tests, examples, benchmarks), including the whole storage `pack::placement` module | 80,826 -> 80,476 (-350) |

Total -542. Reference absent (retired R9c; last counted 65,417 at tree
498dd1917812).

Checks per slice:
- **Required route:** fmt; guard; tool tests; host and Linux Clippy
  `-D warnings` with 0 errors; 127 host test binaries (371 tests) pass, with
  the 2 known environmental failures of `9c783fbd7`; 43 Linux test binaries
  pass; the daemon device-full proof passes.
- **Unreferenced code:** fmt; guard (688 files); host and Linux workspace
  Clippy with 0 errors; 75 content and storage binaries (525 tests) pass.
- Durable execution: NOT_RUN — disabled by owner until explicit
  reauthorization. No timing was taken.

### Looked at and not cut, with reasons

- **`take_connection_failure`** has no caller, but it is the documented
  operator transfer of retained connection custody. Removing it leaves the
  retained failure unreadable, so it stays.
- **Typed job results (dropping the `Response` enum).** `JobReceipt` is the
  custody object: it keeps the Workspace backing alive and travels in six
  error types and in `ServiceReply`. Typing it means redesigning that
  custody. It would touch 474 test match sites to save about 100–200
  lines. Not done without an owner decision.
- **Namespace key in open-state maps.** Each `Overlay` holds one Workspace,
  so the `i64` in every key is constant. Dropping it is 181 edits for about
  20–40 lines. Deferred.
- **Shared owner table for the three in-memory owner maps** (files, reads,
  lookups): about 40–60 lines.
- **SQL-backed owners** (operation, captured reader, base source) use three
  different schemas, so sharing their code needs a schema change.
- **Test-only entry points.** About 700 lines of product functions are called
  only by tests:
  - query-plan `explain_*` helpers, which validate index use;
  - lost-reply `retained_*` queries, which are a contract capability;
  - `build_filesystem`/`update_filesystem` variants, called by more than 150
    test sites.
  Removing them deletes validation or capability. Moving them into tests is
  the relocation the counting rule forbids.

Tooling (scratch, not committed): a name-based scan for unreferenced
functions, items and re-exports, and an approximate closure over test-only
entry points.

## Issue 321 follow-up — fuser receive buffers sized by max_write (2026-10-14)

**Change.** The owner authorized a fuser patch ("you are allowed to modify
fuser with patch").
- Each receive loop now allocates `max_write + 4096` bytes, negotiated at
  INIT (128 KiB + 4 KiB), instead of fuser's 16 MiB + 4 KiB.
- The handshake buffer is unchanged.
- The delta is a third pinned record beside the timestamp and lifecycle
  patches: [decision](../321/FUSER-RECEIVE-BUFFER-DECISION-20261014.md),
  commit `0d357b191`.
- Production LOC is unchanged at 80,476 (third-party code).

**Result.** Each case ran one sample with
[`daemon_memory_sampler.py`](../321/tools/daemon_memory_sampler.py) beside it.
All are INELIGIBLE; functional, proof and cleanup PASS.

| Case | Before | After | Lifetime peak (sampler VmHWM) |
| --- | --- | --- | --- |
| Dense rewrite 500 | h-peak-2 (`e24e0d762`, daemon `3e8261fc9f66`) | buf-1 (`0d357b191`, daemon `8d9ceb64d345`) | 150,488 -> 101,556 KiB (**-32.5%**); receipt 154,112,000 -> 104,005,632 B |
| Four Workspaces (`v016-workspace-four-100mb-5000-k100-v1`) | land-2 (`ae15551a0`, the same product without the patch) | buf-1 | 214,220 -> 168,480 KiB (**-21.4%**) |

Daemon anonymous memory, MiB, at the first row of each mount:

| Mount | Dense before | Dense after | Four before | Four after |
| --- | ---: | ---: | ---: | ---: |
| measured mount (dense mount 2; four mounts 1–4) | 32 | 17 | 6 | 6 |
| first remount (dense verify; four mount 5) | 116 | 70 | 135 | 119 |
| four: mounts 6 / 7 / 8, max after each | — | — | 189 / 200 / 201 | 142 / 155 / 157 |

- The four concurrent first mounts cost the same in both builds. First
  mounts never touched their buffers; the cost arose only on remounts, after
  a free had raised glibc's threshold. That cost is gone.
- The four-Workspace receipts record VmHWM at their external snapshot,
  before the verification mounts: 132,395,008 and 132,640,768 B, about
  equal. The lifetime peak is visible only in the sampler rows.
- Receipts:
  - dense after `654bb7d4`;
  - four before `f2221537`;
  - four after `c0360f0f`.
- Counts are equal to earlier samples: dense 33,359 / 134,879 / 530,261; four
  within 85 statements.
- Dense Commit 6,435.1 ms, unstalled: the writer's `COMMIT` step took
  640.4 ms. No timing claim is made.

**Encoder workspace (option 3) dropped.** The remaining 16 MiB encoder
workspace comes from the heap:
- fuser's one-time handshake buffer and the workspace's own free both raise
  glibc's threshold;
- it is reused across saves, a fixed cost rather than a per-mount one;
- a zeroed allocation would not avoid it while it comes from the heap.

The container-environment tunable of h-peak-3 removed it too (81 MB). That
route remains rejected, because every command executed in the container
inherits it.

**Checks.**
- The patched package verifies against all three records; the checker's
  self-tests and the tool tests pass.
- The whole checker still reports OWNER-3's two passthrough refusals, as on
  `main` and as every build records.
- Linux workspace Clippy `-D warnings`: 0 errors, with fuser rebuilt from the
  patched copy.
- 43 Linux test binaries pass.

Durable execution: NOT_RUN — disabled by owner until explicit
reauthorization. Reference absent (retired R9c; last counted 65,417 at tree
498dd1917812).

## Overlay open-state cuts and test-only removal (2026-10-14)

Branch `overlay-open-state-cuts` from `265843629`, unpushed. Owner direction:
"remove aggressively including the tests".

| Commit | Change | Production LOC |
| --- | --- | --- |
| `11b2a452d` | Open-state keys without the constant namespace; one journaled `OwnerTable` for files, reads, lookups and directory handles; Status open-state counts are map lengths (totals and meaning unchanged) | 80,476 -> 80,299 (-177) |
| `253291435` | Product functions only tests reached, removed; tests that existed for them deleted, elsewhere only the calling assertions; kept and restored items listed in the commit message | 80,299 -> 79,447 (-852) |

Checks on `253291435`, each once:

| Check | Result |
| --- | --- |
| fmt, product boundary guard (684 files), tool tests (50) | PASS |
| Whole-workspace Clippy `-D warnings`, host and Linux | 0 errors |
| Host test binaries, all 315, 30 s each | 1,312 passed, 4 ignored; 2 NOT_RUN-equivalent failures needing absent inputs (`LAYERFS_Q1_PREPARED`, a Linux daemon binary), as before; 1 failure fixed (a reader's one-time setup that a removed plan probe used to pay) and rerun 5/5 |
| Linux test binaries, 43 | all pass |
| fs-bench-pro engine and families suites, cluster-two suite | NOT_RUN — need a sealed build; first task of the next agent |

Timings: none taken. Durable execution: NOT_RUN — disabled by owner until
explicit reauthorization. Next work and its order: the handoff
[PROMPT-SIMPLIFY-NEXT-AGENT-20261014.md](PROMPT-SIMPLIFY-NEXT-AGENT-20261014.md).
Production LOC of this record: unchanged (documentation only). Reference
absent (retired R9c; last counted 65,417 at tree 498dd1917812).

## Plan update: aggressive simplification scope and test method (2026-10-14)

Documentation only. It changes the plan in
[PROMPT-SIMPLIFY-NEXT-AGENT-20261014.md](PROMPT-SIMPLIFY-NEXT-AGENT-20261014.md):

- **Method (4.0).** Owner: "a sweep of update then work on test, and assume many test can be dropped rather than wasting time to fix the ones that could be dropped". Phase 1 changes product code only, gated on library, binary and example targets. Phase 2 triages failing tests: the default is to delete them, with a keep list of surviving behaviour, a time box of about 5 minutes per test, and every deleted file named.
- **Runtime-only overlay rows to memory (4.2.3).**
  - The `accounting` table and its 27 triggers are dropped; `Resources` counts on demand.
  - The one-row `workspace` table, `commit_run`, `commit_reader`, `commit_pin`, `commit_base_pin` and `cleanup_task` become journaled memory.
  - Target: 6 tables and 0 triggers, down from 12 tables and 27 triggers.
  - The semantics that let a Commit run while commands write stay: captured-generation pins, recovery of a Commit run after a lost reply, and base readers across install.
- **Generic leases (4.2.2).** `Overlay::acquire`/`release` and LeaseKind kinds 1–4 have no product caller (7 test files), so they are removed.
- **Owner decisions.**
  - Per-Workspace Store readers: approved with conditions (4.2.5).
  - Permission checks stay with the kernel. GETATTR becomes memory-served; its estimated share is corrected to about 3–6% (4.5.2).
- **Rename (4.3).** No `native` is left in product code, SQL included:
  - the kernel's view of the mount → `kernel`;
  - Project Init host files → `host`, including `init_host_file` and `host_path`; this changes the Store schema and goes last;
  - the pack lane → `Chunk`, with the on-disk value unchanged;
  - the bridge → `mount` and `duplex`.

Expected production LOC for 4.2 is revised to 1,150–2,200, an estimate. Production LOC of this record: unchanged (documentation only). Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).

## Open-state branch: pre-landing verification (2026-10-14)

Section 4.1 of the current handoff is verified locally; pushing still needs the
owner's explicit approval. Branch `overlay-open-state-cuts`, clean source
`e50c010637c3d48e7c28abd7b4cc7078c60d9f6f`, source tree
`d3cf1584454f827852c3677a705e1cd18a184b20`, product tree
`58a49646eae98774b41720cb44d02a35678302d2`. The only changes after
`253291435` were the progress record and current handoff documentation; product
source and compiled inputs are unchanged. No product or test source changed in
this verification step.

**Build.** One locked release seal, `open-state-land`, completed in 100.0 s
under a 115 s wall stop. Command, from the assigned perf worktree:

```sh
bash /Users/yifanxu/Ephemeral-AI-Lab/layerfs-perf-run/core/target/issue320/busy.sh && python3 -B /Users/yifanxu/Ephemeral-AI-Lab/layerfs-perf-run/core/target/issue321/go.py open-state-land 115 build
```

[Build receipt](../../../../benchmark-results/fs-bench-pro/2026-10-14-issue321-open-state-land-build/build.json),
SHA-256 `30228713a9b520feaa8e5109c96ad9bc21c535a49307ec2fbe85ce8480bd4d1c`,
records PASS, both locked host/Linux release attempts, reused worktree-local
Cargo caches, binary hashes, unchanged source before/after and image
`sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6`.
Global Store: explicitly Disposable/WAL/OFF. Overlay: MEMORY/OFF/EXCLUSIVE.
Construction workers: 1. The fuser check retains its two known OWNER-3
passthrough refusals, exit 1; no checker PASS is claimed.

**Suites.** Each ran once, serially, after a successful absolute-path busy gate,
with the worktree-local lock and an explicit 120 s wall stop. The sealed
workspace-writer, workload-host and edit-host paths were supplied through the
handoff's native-input environment variables. The Darwin metadata-call
interposer was compiled from `tests/fixtures/lstat_counter.c` with
`cc -dynamiclib`, separately gated and bounded at 30 s.

| Check | Result | Complete invocation wall | Receipt |
| --- | --- | ---: | --- |
| fs-bench-pro engine | OK: 384 tests, 3 skipped | 22.991 s / 120 s | [engine](../../../target/issue321/open-state-land-engine.json) |
| fs-bench-pro families | OK: 90 tests, no skips | 42.008 s / 120 s | [families](../../../target/issue321/open-state-land-families.json) |
| cluster-two | OK: 281 tests, no skips | 86.239 s / 120 s | [cluster-two](../../../target/issue321/open-state-land-cluster-two.json) |

Exact reproduction: gate with the absolute `busy.sh` above, then invoke
`python3 -B /Users/yifanxu/Ephemeral-AI-Lab/layerfs-perf-run/core/target/issue321/open_state_suites.py <suite>`,
where `<suite>` is `engine`, `families` or `cluster-two`. Each JSON receipt
records the underlying `unittest discover` command, environment and source;
its sibling `.stdout` and `.stderr` files retain all output. These are
correctness suites, not performance samples: no cold cache preconditioning or
performance eligibility is claimed. Shared-machine timing is INELIGIBLE for
performance comparison.

**Skips and unrun work.** Engine skipped the separate public canonical census
fixture proof, compiler-only native CLI proof and pinned-image staging proof
for absent explicit inputs. No new test failure or timeout occurred. The
previous host missing-input outcomes (`LAYERFS_Q1_PREPARED` and Linux daemon
binary) remain as recorded above; the earlier passing host/Linux checks were
reused, not rerun. No cells, exec concurrency or tier-1 performance sample ran
in this step; their baseline remains pending before the product sweep.
Durable execution: NOT_RUN — disabled by owner until explicit reauthorization.

This documentation-only record changes no production source. Production LOC
comparison is attached to its counted commit: 79,447 -> 79,447 (delta +0).
Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812). Next:
owner approval to push the verified branch to `origin/main`, then the section
4.4 baseline and product-first removal sweep in the handoff's order.

## Landing and small baseline selection (2026-10-14)

Owner approved the push in this session. `git push origin HEAD:main` succeeded:
`265843629` -> `d4b0c6808`. No other outward action is authorized.

The section 4.4 before-removal samples use build `open-state-land` (clean
`e50c01063`; product unchanged at landed `d4b0c6808`). The old originals had
full-source identity `2c11fe8aa`; the driver refused their reuse at the current
identity. Closed native inputs are reused through the harness's exact producer
keys, while fresh empty/Store originals were prepared once (11.6 s and 22.5 s).
The stale empty owned master was removed; the tier-1 master is shared and kept.
Every measurement uses a new independent writable clone, not a cold claim.

| Selection | Command ms | Commit ms | Requests / jobs / statements | Proof / cleanup | Verdict |
| --- | ---: | ---: | --- | --- | --- |
| C01 | 288.6 | N/A | 5,002 / 5,002 / 21,002 | PASS / Gone | INELIGIBLE |
| C03 | 507.0 | N/A | 9,022 / 9,038 / 49,710 | PASS / Gone | INELIGIBLE |
| C06 | 136.2 | N/A | 518 / 518 / 7,183 | PASS / Gone | INELIGIBLE |
| tier 1 mixed 100 MB / 5,000 / k100 | 7,025.5 | 1,845.4 | 26,078 / 88,818 / 462,128 | PASS / Gone; functional PASS | INELIGIBLE |

Raw receipts: `benchmark-results/fs-bench-pro/2026-10-14-issue321-open-state-land-run-cells/`
and `…-run-mixed_load_bearing/`. Complete case invocations were 6.2, 6.5,
5.8 and 36.5 s, each bounded by `go.py open-state-land 115 run <family>:<case>`.
The tier's declared family lane, rather than a new generic 15 s claim, governs
its command; shared-machine/coldness limitations remain INELIGIBLE. Test copies
were removed only after sealed manifests checked PASS, with cleanup receipts
retaining removed hashes. All failures/ineligible verdicts stay unchanged.

The existing exec concurrency tool ran five phases unconditionally. It now
accepts an explicit `ISSUE320_EXEC_PHASES=w1,w4` subset, validated before any
setup/runtime effect, preserving the default. A selected `w3-commit` requires
its preceding `w4` output; the result names the selection. This tooling change
implements the owner's small-subset instruction and changes no product or
workload body. Exec baseline is pending at this commit. Syntax and whitespace
checks apply; no Rust source changes. Durable remains NOT_RUN — disabled by
owner until explicit reauthorization.

### Exec baseline metadata failure (retained)

Attempt `2026-10-14-issue320-open-state-exec-baseline` at `562c06d9d`
failed with `KeyError: 'case'` in result metadata construction, before clone
and runtime effects. The empty cell original has `recipe="empty"`, no `case`
field; workload originals have both. The helper previously assumed only
workload originals. No mounted phase or timing exists from this attempt.
The observer waited its declared 90 s startup bound and reported no daemon.
[Attempt receipt](../../../target/issue321/open-state-exec-baseline.json) and
sibling output files retain both outcomes; the output directory is empty.

The corrected helper records nullable `case_tree` and the required `recipe`
separately, preserving actual input metadata without fabricating a case. This
is the sole repair of the traced failing expression. A new output identity
will run the requested phases; the failed attempt is never overwritten.
Product source and production LOC remain unchanged.

### Corrected exec baseline and Phase 1: reply-ticket namespace cut

Corrected exec output `2026-10-14-issue320-open-state-exec-baseline-fixed`,
tooling source `22ff7b300`, sealed product/build `open-state-land`, completed
in 5.559 s under a 100 s outer stop (helper budget 90 s). No workload body,
file count or cache policy changed. Selected phases `w1,w4`, 2,000 files per
writer, cloned empty original; every writer and runtime exited 0, and the
owned container and volume were removed. No correctness oracle is supplied
by this diagnostic; exit codes and cleanup alone are its functional scope.

| Phase | Create / append / read µs per file | Observation status |
| --- | --- | --- |
| container filesystem, one writer | 22.4 / 10.4 / 10.7 | INELIGIBLE |
| one Workspace writer | 247.5 / 118.9 / 186.7 | INELIGIBLE |
| four Workspace writers | 368.6 / 175.5 / 257.0 | INELIGIBLE |

[Invocation receipt](../../../target/issue321/open-state-exec-baseline-fixed.json)
and [diagnostic result](../../../../benchmark-results/fs-bench-pro/2026-10-14-issue320-open-state-exec-baseline-fixed/result.json)
retain commands, stamps, owner counts, memory and storage observations.
Read-only memory sampler: 82 rows; max observed RSS 36,988 KiB and anonymous
29,908 KiB. VmHWM 36,988 KiB is a lifetime observation, not a phase peak or
proof of a per-Workspace budget. The five mounted Workspaces include the idle
marker; sampler and shared-machine interference make times INELIGIBLE.

**First product cut.** Reply-ticket keys become local revisions instead of
(namespace, revision), and the watched-namespace set becomes one flag. Counts
use map length; rollback stores and withdraws only issued revisions. Exact
engine/incarnation/generation validation and last-ticket wakeup remain.
No SQL/schema, capture domain or reply-delivery guarantee changes. This is a
structural removal, not a speed claim; the mount slot and remaining Route/ns
work follow. The two changed oracle source pins were advanced.

Host and Linux `check` and warning-denying Clippy cover workspace libraries,
binaries and examples, each once under the 120 s stop: PASS. Logs use
`simplify-tickets-{host,linux}-{check,clippy}` under this worktree's issue321
and issue320/logs folders. Formatting and whitespace checks pass.
Tests: not yet updated; no test source opened/edited/run during this product
step. Engine suite rerun after pin updates is deferred to Phase 2, following
the owner's explicit product-only Phase 1 gates. No removed observer, failure
custody entrypoint or retained keep-list function is lost. Durable remains
NOT_RUN — disabled by owner until explicit reauthorization.

### Phase 1: fixed mount slot and generic lease removal

The one-entry namespace-keyed mount map is now an optional attached/revoked
mount slot. An atomic job snapshots that fixed value once; known whole-job
failure restores it after SQL rollback, while an unknown result retains exact
attempted state with the quarantined connection. Existing lookup/file/directory
journals, minted mount identity and mounted revocation/refusal checks remain.
The terminal-state helper's unused route parameter is removed.

Removed the generic `Lease` value, kinds Reader/Open/Lookup/Operation (1–4),
Overlay acquire/release implementation file and both daemon forwarding jobs.
The product sweep confirms these producers have no product caller. Remaining
minted CapturedReader (6) is the only generation hold in `GENERATION_HELD`;
file handles/readers, lookup owners and processing custody still exist. No
code is moved to tests/tools. The close oracle pin and architecture docs advance.

**Failures, retained as they happened.** Initial fmt failed because a mechanical
module-line removal left doubled `pub(crate)` before `mod orphan`. The first
host check failed from that parse error (47 cascading errors). After correcting
the module declaration, the second host check found one multiline mount-map
access in descriptor validation; it was changed to the same exact slot check.
No SQL or runtime operation was retried. Final host check and Clippy and Linux
check and Clippy, workspace lib/bins/examples, pass under 120 s stops. Logs:
`simplify-mount-lease-host-check{,-fixed,-final}`,
`simplify-mount-lease-host-clippy` and issue320/logs
`simplify-mount-lease-linux-{check,clippy}`. Formatting and whitespace pass.

Tests: not yet updated; no test opened/edited/run in this product step.
Generic-lease callers will be triaged in Phase 2 under the keep list and default
deletion rule. Runtime proofs/engine pin checks remain deferred to that pass;
this commit claims product-target compilation only, not runtime qualification.
All owner-listed custody/operator capabilities remain. Durable: NOT_RUN —
disabled by owner until explicit reauthorization.

### Phase 1: drop accounting table and all 27 triggers

Schema 35 contains eleven product tables (plus SQLite's workspace allocator),
zero triggers. `sql/accounting.sql` and its startup batch are removed.
Resources now projects counts and length sums from current tables in one
consistent diagnostic statement. Columns use the exact old trigger formulas:
payload includes validity bytes; reader/run rows both contribute owner details;
ready targets sum ready flags; empty sums are zero. Only explicit Resources
observations pay the row visits; no mutation/read/cleanup writes a diagnostic
row. This cost shift is disclosed, not called a constant-time observer or
measured speedup. Open-state and ticket counts remain resident observations.

The closed storage oracle derives canonical definitions from schema.sql alone,
expects version 35 and advances schema/accounting source pins. Its full
definition/table membership checks still reject unexpected tables or triggers.
A Workspace file is created fresh; there is no migration or reopen. Prepared
global Store originals are not changed by this overlay schema change.

Host/Linux workspace check and Clippy -D warnings, lib/bins/examples, PASS
under 120 s stops; fmt and whitespace PASS. Logs are
`simplify-accounting-{host,linux}-{check,clippy}`. Tests: not yet updated.
No tests opened/edited/run during Phase 1; engine verification and logical
count/reclamation assertions are deferred to Phase 2. All historical schema
size/count evidence keeps its source pin; no schema-35 storage or performance
sample has run. Durable remains NOT_RUN — disabled by owner until explicit
reauthorization.

### Phase 1: Workspace runtime state to memory (schema 36)

`workspace`, its AUTOINCREMENT allocator and the SQL state decoder are removed.
The engine holds one fixed incarnation/state value. Atomic jobs retain its
pre-job value and restore it only after known whole-job failure/SQL rollback;
memory-only jobs obey the same restoration. Unknown COMMIT/rollback results
retain attempted state with the quarantined connection. Counters remain
nonnegative and bounded by the former signed SQLite range. No runtime rows
are moved into tests/tools or a second backing representation.

Capture/install/failure-resolution, revision/dirty counts and base-source
acquisition/release update that journaled state. Kernel visits read it and
their indexed inode under the same job lock. Retained capture remains exact
and observable during close. Read/operation pin rows and the cleanup table
remain for their later cuts. Template copies check all eleven remaining
product tables for rows, then bind fresh memory; namespace diagnostics/routing
are still transitional runtime fields, not SQL keys. The install SQL-plan
observer has no SQL mechanism to observe and is removed.

**Table-count correction.** The preceding schema-35 section and commit message
incorrectly said eleven product tables: source DDL has twelve (plus
`sqlite_sequence`). Removing Workspace yields eleven product tables and no
allocator table in schema 36. The accounting cut itself removed one table
and 27 triggers; the source/LOC comparison and receipts are unchanged.

Host product check passed with one unused StatementKind import; the import
was removed. Host Clippy and Linux check/Clippy, workspace lib/bins/examples,
PASS under 120 s stops. Fmt/whitespace PASS. Logs use
`simplify-workspace-{host,linux}-{check,clippy}`. Source pins for schema,
accounting and close advance in the storage oracle; canonical definition and
empty-template checks remain. Architecture and core guidance describe current
placement and preserve old evidence/anchor access.

Tests: not yet updated; no test opened/edited/run during this step. Capture
boundary/install-later-write/open-reader, lost-reply, refusal and reclamation
proofs stay on the Phase 2 keep list. No schema-36 sample or runtime PASS is
claimed. Next: remove remaining overlay Route/ns checks and runtime pin/run/
reader/cleanup tables, then direct typed calls and rename in the product sweep.
Durable: NOT_RUN — disabled by owner until explicit reauthorization.

### Phase 1: Commit and base custody to journaled memory (schema 37)

`commit_run`, `commit_reader`, `commit_pin` and `commit_base_pin` are removed.
Operation and captured-reader owners reuse OwnerTable: exact request -> minted
holder -> original value. Base sources are journaled by (holder, class), with
root/floor retained. A journaled generation-count map makes captured holds an
indexed lookup; cleanup never scans the captured-reader population. Last-owner
release wakes the same bounded automatic reclamation paths. File readers use
their existing owner table rather than a duplicate SQL pin.

All maps commit/roll back with the existing atomic job journal. Unknown SQL/
rollback results retain attempted maps and original custody; no lost reply
replays acquisition or releases its owner. Captured readers remain independent
of current root/floor after install, processing remains findable by request
and operation records remain SQL-backed. Resources derives the same owner/
source/detail count meanings from map lengths. No code moves to tests/tools.

There are now seven SQL tables: five filesystem tables, commit_record and
cleanup_task; zero triggers and zero SQL custody rows. Runtime Workspace and
owner hints no longer need statement-text cache invalidation. The now unused
Workspace/Lease SQL families are removed (12 remain); telemetry section 36
declares cardinality. The harness parser accepts current 12-family and retained
14-family receipts without relabeling old arrays. The private Reader/File/Lookup
reference class replaces the obsolete LeaseKind. Cleanup-list relocation and
remaining Route/ns elimination follow.

Host check passed with unused SQL imports in file_owners; those imports were
removed. Host/Linux Clippy -D warnings and Linux check, workspace lib/bins/
examples, PASS under 120 s stops. Fmt, Python syntax and whitespace PASS.
Logs: `simplify-custody-{host,linux}-{check,clippy}`. Schema/accounting/close
oracle pins and affected architecture/core/telemetry docs advance.
Tests: not yet updated; no test opened/edited/run in Phase 1. Capture/install/
open-reader, lost-reply, exact-refusal and last-owner proofs remain required
in Phase 2; no runtime qualification or speed/storage claim is made here.
Durable: NOT_RUN — disabled by owner until explicit reauthorization.

### Phase 1: Overlay Route/ns removal and cleanup-placement exception

Overlay APIs no longer accept Route; their handles carry small nonrecycled
engine identities instead of namespace/incarnation routing payload. Exact
map/capture/source/ticket identity checks remain. The Route type belongs to
Workspace composition, used by the daemon to select and validate its bound
handle once before a job effect. Refused routing/connection admission retains
original input. The Overlay namespace field, maintenance Item.ns/ReclaimStep
namespace field, route-for-namespace helper and copied-template namespace
argument are removed. Reply tickets are local revision -> generation.

Removed unused route forwarding and the raw OwnerClient::job entrypoint.
Bound constructor ports use their owning Workspace client, without searching
the roster by a token. Owned record jobs and run cursors retain their inputs
on a missing binding. Kernel mount/fence thread names now use the kernel
mount owner ID; sampler guidance states the receipt identity needed for
alignment. No runtime sample, protocol recovery or permission change occurs.

**Cleanup exception.** The source-backed
[cleanup memory-placement review](CLEANUP-MEMORY-DESIGN-20261014.md) finds
that failed maintenance latches its original error while foreground mutations
may enqueue independent per-inode debt. No fixed resident bound is established
for that backlog. A plain memory list would introduce unbounded heap growth
or a new refusal cap. Under the handoff's trace-and-leave rule, cleanup_task
stays backed, with bounded indexed turns and exact stop/unknown custody.
The six-table target has a recorded one-table gap; schema 37 remains seven
product tables, zero triggers and zero SQL custody rows. This declined move
claims no reduction or speed benefit.

**Compile failures and gating.** Initial Overlay compile had 37 expected
route/field/signature errors; subsequent host checks found the external read
trait's still-required source arguments, an example's old call signatures and
eight forwarding errors. These were repaired from source/compiler output.
The first Linux check failed on a second mount-monitor thread label using the
removed ns variable; both thread labels now use owner ID. Each failed output
is retained under simplify-route labels. Busy gates also declined checks while
unrelated Docker/probe work was active; no other process/container was touched.

Final host/Linux warning-denying Clippy on workspace lib/bins/examples pass;
final product check labels are simplify-route-{host,linux}-check-final.
Fmt/whitespace and cleanup-review source links pass. Accounting/close/daemon
roster oracle pins advance. Tests: not yet updated; no test file was opened,
edited or run in this Phase 1 step. Root/owner/source/capture and mounted
coverage remain required in Phase 2. No runtime or speed qualification is
claimed. Durable: NOT_RUN — disabled by owner until explicit reauthorization.


### Phase 1: direct typed Workspace calls

Removed Response/NativeReply/NativeDirectoryReply, JobReceipt and its retained
success vectors, IndexedOperationRecordJob/Reply, and heap-allocated JobSql
family receipts. Workspace methods now take the same lock and return their
concrete value; reads/record pages transfer owned bounded windows instead of
cloning an enum payload. Guarded record refusals reuse the existing Workspace
port's original deciding result and copy accounting. No product code moves
into tests or tools. The single typed runner retains readiness checks, finite
Capture/install frontiers and each actual SQL/payload/allocation/lock count.

Unattempted returns the original closure/input. Attempted errors retain exact
cause, counted work and backing; panic/unknown connection custody remains
quarantined. Filesystem replies keep the owning Workspace client through their
reply attempt. Commit failures still retain capture, prepared install, known
publication, constructor owners and failed release/local-resolution errors.
Normal/forced teardown retains the original drained connection and exact
failed boundary, without successful unit-result wrappers. Operator retained
custody and whole-Store stop/read failures remain available.

ServiceClass is General/Mutation/Source: only the last two affect admission.
Numeric section 37 declares three classes; the receipt reader still accepts
older six-class records. Aggregate SQL families remain the declared 12.
Store-accounting example schema v2 observes whole-Commit counters and omits the
removed per-capture/install receipt arrays; the reader preserves v1 validation.
Template allocation observations stay charged once by roster counters, without
copying them into a child Workspace's totals.

Initial product checks failed on three stale imports/value moves, then on the
old example receipt fields. A third check found the diagnostic examples'
fixture dependency on native_install test support. The owner explicitly
allowed the shared-helper exception; only its Response import and Close receipt
assertion were mechanically updated. No test was run, and no other test was
opened or edited. First host Clippy rejected a match that should use matches!;
that source-only style issue was fixed. Busy gates declined several commands
while unrelated probe work ran; no other worktree/process was touched.

Final validation uses host/Linux check and warning-denying Clippy on workspace
lib/bins/examples, with explicit 120 s stops. Tests: not yet updated. Source
pins advance; engine/families/cluster-two suites remain deferred to Phase 2
under the product-first boundary. No speed/storage acceptance is claimed.
Durable: NOT_RUN — disabled by owner until explicit reauthorization.


### Phase 1: Resources belongs to one Workspace

Removed the daemon-wide Resources job, template/retiring-file aggregation,
Resources::accumulate and its now unused OpenStateCounts summation/decoder.
The closed template keeps its immutable logical size; startup observes its
physical allocation directly without querying logical rows. Template identity
checks, allocation counters and exact failed-deletion custody remain.

The Application selects the original call's live Workspace and observes it
once. Section 38 records per-Workspace scope; the receipt reader distinguishes
retained daemon-wide records. Calls with no live binding, including known
terminal removal, emit unavailable resource fields and no attempted observer.
Actual selection, admission and attempted observation failures retain their
original cause and any work/backing separately from the control outcome/output
failure. Terminal reclamation remains checked through Cleanup/Gone and the
mounted/file custody proofs, not a fabricated empty resource array.

The first host product check passed with two newly unreachable members:
Workspaces::stopped and the retiring slot's unused Weak<Backing>. Both were
removed. The retiring marker and its incarnation remain until the exact
last-owner deletion callback; the weak observer never owned or released custody.
Final host/Linux product check and Clippy cover lib/bins/examples; tests are
not yet updated, with no further test file opened, edited or run. Source pins
advance; pinned engine suite is deferred to Phase 2. No runtime sample or
performance acceptance is claimed. Durable: NOT_RUN — disabled by owner until
explicit reauthorization.


### Phase 1: per-Workspace Store reader candidate, measurement pending

The owner-approved candidate replaces the fixed shared reader pool with one
control reader and a mount-time reader per Workspace. Read tickets, fair lanes,
FIFO rotation, per-Workspace request quota, exclusive lease and admitted-client
wrapper are removed. Each original bounded provider call takes its Workspace's
reader lock and ends its read transaction before returning. Persistence already
sets/verifies cache_size=-2048 and mmap_size=0; no cache setting or Store profile
is weakened. The immutable CanonicalCache remains one shared bounded cache.

Bind opens the reader before snapshot/root checks and readiness. Failed bind
closes a healthy acquired reader while preserving original and cleanup failures;
unknown opening/reader outcomes retain exact registration/provider/error custody
and permit no guessed reopen. BoundWorkspace::close combines the original overlay
Close and reader close; normal/forced teardown and the diagnostic examples use
it. Whole-Store stop closes healthy readers and refuses new demand, preserving
unknown custody and reader_failures. A factory finishing beside shutdown closes
its newly opened healthy reader before returning the original stopped admission.
Provider panic poisons its owning reader and retains the original connection.

Concrete SQL observation holds weak providers. Healthy close moves final work
into one fixed retired sum, then removes the registration, so diagnostic state
neither holds a connection open nor grows with completed mounts. Unavailable
final counters invalidate that sum instead of inventing zero. Numeric reader
index -2 is the retired sum. Section 39 declares demand/lock fields; historical
pool arrays stay readable. Private DaemonSetup advances to LFSD v4 and removes
the now unused fixed read_handles field; both producers and consumers advance.

The [candidate design](WORKSPACE-READER-DESIGN-20261014.md) records lifecycle,
bounds and pending acceptance. Initial host checks found width conversions, then
an overly wide internal visibility and two unused index observers; these were
corrected/removed. Initial Linux check found two SDK examples' cfg-only setup
field initializers; they were mechanically updated. Logs remain under
workspace-reader labels. Host/Linux product check and Clippy cover workspace
lib/bins/examples, with 120 s stops. Fmt/whitespace are checked.

Tests: not yet updated. No test was run or opened outside the earlier authorized
shared-helper exception, whose Close call now uses the paired typed close.
Acceptance is pending the required before/after exec_concurrency w1/w4 and C06
samples with daemon_memory_sampler. Timings remain INELIGIBLE, and the candidate
will be kept only if the four-Workspace command does not worsen and observed
peak stays inside the stated per-Workspace memory budget. No speed claim is
made by this source cut. Durable: NOT_RUN — disabled by owner until explicit
reauthorization.

The first final Linux check was refused by its checksum guard: the oracle pin
was updated while that check was running. This is a source-stability failure,
not a product compile result. It is retained under workspace-reader-linux-check-final;
the subsequent check-stable and clippy-stable runs use frozen source/pins and
pass. Host check-final and clippy-accepted-source pass. No test rerun occurs.


### Reader comparison: before arm and decoder corrections

The shared-pool before arm is e7e65dab9, sealed as reader-pool-before in
69.0 s. Empty preparation reused closed native inputs, replacing only the
owned stale 2.2 MB empty original/master volume; 7.3 s. The first ignored sample
wrapper erroneously nested a measurement lock around exec_concurrency's own
lock. It failed before clone/mount/phase execution; the observer saw no daemon.
This retained admission failure is not a measured sample. After diagnosis the
correct direct-driver invocation sampled w1/w4 once, with their own lock.

The actual before sample ran in 5.449 s. All writer exits and runtime exit were
zero and its container/volume were removed. Native create/append/read means:
24.5/10.5/10.5 us per file. W1: 243.4/114.7/220.7; W4:
325.9/158.8/255.9. Observed sampler peak RSS 36,044 KiB, anonymous 28,964 KiB;
lifetime VmHWM 36,044 KiB is not a phase bound. Timing INELIGIBLE. Raw result and
logs are under 2026-10-14-issue320-reader-pool-before-direct-exec and issue321
reader-pool-before-direct-exec.*; the lock failure remains reader-pool-before-exec.*.

Counter ingestion found another six-class assumption in the exec diagnostic.
The same issue made C06's phase-count decoder fail on Read, after its complete
filesystem proof passed and cleanup reached Gone. C06 command 127,137,083 ns;
its original receipt stays FAIL for instrumentation (no resampling/relabeling).
The decoder now subtracts the actual General observer class for current arrays,
and Read for retained arrays, checking endpoint schema equality. Exec uses the
actual decoded class keys. Raw retained logs permit a separate count recovery;
that analysis does not run the operation again or alter the original verdict.
Tests remain deferred to Phase 2. Durable remains owner-disabled.
