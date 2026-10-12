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
[native diagnostic](NATIVE-DIAGNOSTIC.md), [refreshed candidate list](CANDIDATES.md).

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
