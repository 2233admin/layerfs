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
