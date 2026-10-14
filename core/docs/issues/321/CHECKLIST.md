# Issue 321 checklist and evidence map

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Takeover 2026-10-13 at `878af2cea`; local branch `issue321-workspace-overlay`.
> Revised 2026-10-13 at `20f237499` for the owner's second-round decisions:
> steps 2 and 3 are replaced by steps A to D of the [plan](PLAN.md).

The GitHub checklist governs completion; [PLAN.md](PLAN.md) mirrors the issue
body. Implemented rows below describe source, not a claim that final
qualification ran at the newest identity. Existing receipts retain their own
source/build pins. Steps proceed in order: 1, A, B, C, D, E.

## Step 1

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| empty template before readiness | implemented | overlay/workspaces.rs; database/startup.rs; template receipts; current source coverage to reconcile |
| copy/open connection and thread at mount | implemented | overlay/workspaces.rs; owner.rs; workspace-files and mounted concurrency receipts |
| close/delete after last owner | implemented | overlay/backing.rs; workspaces.rs; retained-files and mounted drain/device receipts |
| route every job/observation | implemented | overlay/workspaces.rs; control registry/cleanup; owner/resources/application receipts |
| reservation removed | implemented | database/physical.rs; connection.rs; reservation/device proofs |
| full-device rollback/no-space including I/O | implemented | connection.rs; physical.rs; device and four mounted arms at their pins |
| aggregate memory/page cache | SUPERSEDED | owner 2026-10-13: no budget shared between Workspaces; overlay/budget.rs is removed in step B; retained idle and loaded diagnostics keep their pins |
| job classes/in-Workspace queue | SUPERSEDED | owner 2026-10-13: queue, credits and admission are removed in step B; classes remain as counters only |
| service-time cause | INCOMPLETE; moved to step B | re-measure after the queue and credit code is removed; retained counters and the notification work model keep their pins |
| page-cache option selection | SELECTED BY DECISION; moved to step B | separate page caches follow from independent Workspace memory, unless one Workspace alone slows beyond run-to-run difference; retained enabled/disabled builds; memory still needed |
| SQLite temporary data in memory | implemented | database/profile.rs (`temp_store=MEMORY`, `1285ebf6c`); host and Linux engine tests at that pin |
| distinct ordinary identities | implemented | workspaces.rs; startup allocator; template and workspace-files proofs |

## Step A — open state in memory, unmount deletes the file

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| trace the eleven tables; move the ones that hold | COMPLETE A | [pre-change trace](STEP-A-TRACE.md); all eleven moved |
| one in-memory open-state structure per Workspace | COMPLETE A | open/ next to Overlay connection; touched-entry undo |
| remove moved tables, statements, triggers, cleanup jobs, plan diagnostics, typed jobs | COMPLETE A | SQL/schema/accounting and dedicated native/cookie retirement deleted; real filesystem jobs still use the owner until B |
| remove `reclaim` and terminal row cleanup | COMPLETE A | raw close retains rows; control closes/deletes whole file |
| bytes per kernel-reference entry; map size after the tier-1 walk | MEASURED; diagnostic scope | 854,848 requested Rust B / 5,000 = 170.9696 B/entry; actual walk 5,048 kernel / 64 parent entries, unchanged SQL/pages/files; whole-daemon point RSS 23,056 KiB; no hard bound |

## Step B — one lock per Workspace

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| one lock around connection and open state; caller runs the job | COMPLETE B | overlay/owner.rs, state.rs, workspaces.rs; finite-frontier wait is a reported deviation |
| remove owner thread, queue, admission, credits, ledger, completion tracking | COMPLETE B | deleted modules and their tests; 83,709 -> 81,584 |
| plain workers per mount replace the daemon-wide dispatcher; threads reported | COMPLETE B; two workers kept by a declared experiment | fuse dispatch/requests.rs; arms 1/2/4, write and read treatments; per mount: two receive workers, mount, fence |
| separate SQLite page caches | COMPLETE B | `.cargo/config.toml`; paired tier 1: command -0.5%, Commit -2.7% against one shared cache |
| idle and loaded memory at 1, 4 and 16 Workspaces | MEASURED; diagnostic scope | threads 6/18/66; idle 12,088/28,480/36,648 KiB; loaded 13,780/32,248/48,676 KiB; higher lifetime peak across sequential mounts recorded, cause not fully established |
| service-time cause re-measured | MEASURED; diagnostic scope | Mutation hold 26 -> 44 us from one to four Workspaces without CPU limit (A service 30 -> 46): the growth is not caused by the queue or owner thread |

## Step C — table revision of what remains

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| remove Workspace columns | COMPLETE C | `c8a7bcd1d`; no `ns` outside the `workspace` row; a second Workspace per database is refused; `ns`/`route` plumbing removed |
| selected table names | COMPLETE C | eleven tables, their indexes and three columns renamed; Rust names unchanged; [terminology](../../architecture/64-overlay-terminology.md) |
| trace/apply the record-table merge | COMPLETE C; not merged, reason recorded | one shape cannot serve integer and (scope, kind, 32-byte) keys; the two integer-keyed tables had no production writer and are removed; `commit_record` remains |
| schema bump/no migration | COMPLETE C | `user_version` 34; created fresh, never reopened; quota floor 32 -> 24 because the schema is 30 pages |

## Step D — fewer statements and round trips

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| review accounting triggers | COMPLETE D; reviewed, unchanged | three insert triggers per created file, one keyed row update each since C; counts are the exact row counts reclamation proofs assert on, and the two byte sums travel in diagnostics row 28 and the harness decoders; no trigger removed |
| remove repeated attributes | NOT_DONE D; kernel-issued | reply validity is already 60 s; the 6.12 kernel invalidates a parent directory's attributes on every namespace change and `default_permissions` refreshes them (GETATTR 5,766 of 26,078 tier-1 requests); avoiding it means the daemon enforcing permissions itself |
| reduce write frame | COMPLETE D; partly | the write's seven statements are each needed and unchanged; RELEASE and every fence that reads only the Workspace row issue no statement; one created file 19 -> 18 statements |
| reduce Commit jobs/new file | COMPLETE D | engine memory of the `workspace`, `commit_run` and `commit_reader` fence rows; 1,024-slot cursor answer window; anatomy large case 41,931 -> 25,941 statements and 8,085 -> 4,938 record jobs; the four plan jobs per file are unchanged |

## Step E — re-qualify once

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| twelve exact-count pins | COMPLETE E | five host replays restaged and 5/5; cell gate restaged from the final-source request model (REQUEST-PATH section 10): ten exact, C03 a range in steps of two, C12 a labelled estimate; all twelve cells reproduce at `2c11fe8aa`; the twelve samples taken before the restage are retained FAIL |
| all Linux mounted proof binaries | COMPLETE E; 7 tests NOT_RUN | 43 of 43 binaries exit 0 at `21a789a14`, 106 tests pass, 0 fail; 7 ignored tests need an owned device or filesystem fixture and keep their own pins |
| harness schema/profile/receipt-field compatibility | COMPLETE E; 6 unit tests NOT_RUN | storage oracle for one file per Workspace (ran PASS in the footprint sample); overlay bytes sum every overlay file; retired scheduler/credit observations exact; cells suite 315 pass; six engine/families unit tests need native build inputs absent here; shared-input order dependency of the rebased harness worked around, not fixed |
| contracts/cache/architecture/guides | COMPLETE E | root guide carries PLAN section 11; core guide, owner and overlay architecture guides, #303 engine/FUSE/index contracts and the general cache, view and queue guides state the implemented model and label the superseded text; queue-scheduling guide archived |
| selected/held-out samples | COMPLETE E; all INELIGIBLE | twelve cells, six selected and six unselected cases, one sample each at `2c11fe8aa`: every functional and proof PASS, every cleanup known, every timing INELIGIBLE; exec diagnostics and session exit 0 |
| rebase SDK baseline/recompute LOC | COMPLETE E | `sdk-refactor` revalidated at `9fe542e3b`; 87 commits rebased without conflict, product source identical; staged-tree lines rewritten and checked; LOC 82,762 (base) -> 81,054 (tip) |
| ledger results | COMPLETE E | [#320 ledger, Step E](../320/PROGRESS.md#issue-321-step-e--re-qualify-once-2026-10-14) |

## Required selections

Each step requires the two concurrent diagnostics, 16 × 50 Commit cold-daemon
session, full tier 1, and four Workspaces. At takeover only the two diagnostics
have retained observations, in each cache build arm; they satisfy no full-case
selection. Final selections additionally include history hotset, the three tier-3
cases and six fixed unselected cases from the handoff. No unchanged arm reruns.

SDK baseline observed at takeover: `9fe542e3b340f4b5daa17636880afd6b1b32c290`.
Revalidate before private rebase. Source counter SHA-256:
`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`.
Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).


## Takeover checkpoint, 2026-10-13

Step 1 remains INCOMPLETE. Retained selections at sealed product `20f237499`:
2-CPU and unlimited-CPU diagnostics reused (exit 0; no oracle/proof); 16 × 50
plus a new evicted-Store daemon × 50 session exit 0 (diagnostic only); tier 1
INELIGIBLE with receipt proof PASS and cleanup Gone; four-Workspace FAIL, proof
NOT_RUN and cleanup UNAVAILABLE. The latter's own resources were explicitly
removed after retained identity/log checks. That does not change its verdict.
See [takeover and A checkpoint](../320/PROGRESS.md#issue-321-takeover-retained-step-1-selections-2026-10-13).

Step A is not finished: sealed build, Linux mounted/byte proofs, actual tier-1
walk and all four required selections at its new pin remain owed. Broad host
check failures, including the 120 s hang, remain retained. Five host replay
count checks FAIL before comparison; the twelve sealed cells are not yet run.
No count pin or guide has changed. B/C/D/E remain NOT_RUN. No checkpoint has
been posted as a finished Step A.


A source seal: local tag `i321-a-source-1`; Production LOC: 84,220 -> 83,704
(delta -516), exact first-parent/final staged archives with the pinned counter.
Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).
This is a source checkpoint, not finished-Step qualification. The A+B estimate
remains pending B. Final targeted Workspace native checks and 24 host Fuse
checks passed; the broader failed receipts retain their original dispositions.


2026-10-14 proof follow-up: 29 selected Linux checks passed, with original
failed runs retained; the external drain/capacity fixtures were repaired for
memory ownership, physical file disposal and the smaller schema. Local
`i321-a-proofs-2` changes tests/docs only; Production LOC: 83,704 -> 83,704
(delta +0), same archive counter. No final count pin changed. The actual tier-1
walk, mandatory A selections and physical-device-full variants remain owed.
A is IN_PROGRESS; B/C/D/E remain NOT_RUN.


2026-10-14 intermediate observation reader: `i321-a-observe-3`, tests/tooling/docs
only, Production LOC: 83,704 -> 83,704 (delta +0). Strict section-32 memory and
section-28 SQL decoding passed the 306-test counter/runner suite; it supports
current observations without synthesizing removed SQL counters. Historical
arrays keep their original shape. Twelve-cell and Storage pins remain unchanged;
final E repinning/compatibility/guide work is NOT_RUN. Mandatory A runs follow
this clean source seal; A is still IN_PROGRESS.


A sealed selections at `d5c6d2678`: both exec diagnostics and the 850-Commit
session completed/cleaned up (no oracle/proof); tier 1 INELIGIBLE with receipt
functional/proof PASS and cleanup Gone; four-Workspace FAIL, proof NOT_RUN,
cleanup UNAVAILABLE. Exact failure retained; owned external disposal does not
change its verdict. Speed/storage operands and deltas are in the #320 ledger.
The first standalone walk lacks post-walk numeric counts: population INCOMPLETE.
A corrected Status-based diagnostic is pinned separately; no A benchmark is
retried and no final E count/Storage pin is changed. A remains IN_PROGRESS.


2026-10-14 qualification follow-up: corrected mounted walk functional PASS,
measurement AVAILABLE at `i321-a-kernel-4` tool / `d5c6d2678` build. Six pinned
physical-device arms PASS (DML, COMMIT, translated EIO, raw daemon, normal and
forced mounted drain), with owned teardown. Four Linux resource observations
and scoped warning-denying Clippy PASS. SQL removal audit finds no remaining
references to moved tables or terminal retirement modules. The original 120 s
history-cost hang stays FAILED; the new phase-instrumented external test passed
all twelve unchanged Storage assertions in 0.31 s, cause of the old timeout
unknown. One obsolete raw-Close row-disposal expectation failed and was replaced
with Queued/retained-row checks; real terminal control disposal uses existing
proofs. A narrow route-free Read-slot mismatch is corrected without changing
configured capacities. A new seal and one affected four-Workspace selection
are pending. Earlier passing treatments are reused at exact pins; no final
cell pin, guide or contract is weakened. A remains IN_PROGRESS; B NOT_RUN.


2026-10-14 finished Step A: `0bebde083` / `i321-a-qualify-5` sealed build PASS
(58.917 s wrapper), narrow Read-slot correction. The affected four-Workspace
selection completed 400 Commits: INELIGIBLE overall, functional PASS, proof PASS,
cleanup Gone. 104,311 requests / 374,519 jobs / 2,248,448 statements;
performance external wall 12,878,231,333 ns (15 s bound), proof 18,993,699,459 ns
(60 s bound). No comparable successful Step-1 four result exists; its failures
remain FAIL. Existing A3 exec/session/tier-1 selections and A4 walk are reused
at their exact pins. Their complete dispositions are in the #320 ledger.
All 1,361 sealed sample files were hash-verified before scoped payload removal
(546.1 MB); prepared originals remain. No unchanged passing treatment reran.
A is COMPLETE in its scoped implementation/qualification sense; no eligible
speed claim or final twelve-cell count qualification is made. Twelve-cell exact
accounting stays failing/expected to fail until E: retained host checks FAIL,
sealed twelve-cell sample NOT_RUN. Broad failures retain original verdicts.
Production LOC: 83,704 -> 83,709 (delta +5) for the correction; net A 84,220 ->
83,709 (delta -511), exact archive counter and reference-absent scope. B begins
next; C/D/E NOT_RUN. Guides and contracts remain unchanged until E.


2026-10-14 finished Step B: source `1c706e5ff`, worker-count arms `471727dce`
and `8ff367775`, selection `be19ede68` / `i321-b-qualify-2`, tooling
`f401de237`; sealed build PASS (58 s). One lock per Workspace with the calling
thread running each job; owner thread, queue, admission, credits, budget,
completion handles and the daemon-wide dispatcher are removed with their tests
(1,527 -> 1,463 test functions). Required selections, one sample each: both
exec diagnostics and the 850-Commit session exit 0 with cleanup complete;
tier 1 INELIGIBLE with functional/proof PASS and Gone (26,078 requests /
93,601 jobs / 563,061 statements; command 6,744,599,380 ns, Commit
1,871,598,207 ns); four Workspaces INELIGIBLE with functional/proof PASS and
Gone (104,312 / 372,109 / 2,247,402; external wall 11,733,759,958 ns).
Recorded against B: tier-1 daemon lifetime peak 89,866,240 B (A 74,285,056)
and session plateau 115.9 MB (A 103.7 MB), reached while a second mount reads
the tree, not during the measured interval; one worker per mount is faster for
same-Workspace writers but slower for cold reads; the A+B estimate was not
reached (81,584). Retained failures and intermittent mounted cases are listed
in the [#320 ledger](../320/PROGRESS.md#issue-321-step-b--one-lock-per-workspace-2026-10-14).
Production LOC: 83,709 -> 81,584 (delta -2,125) for B; net A+B 84,220 ->
81,584 (delta -2,636), exact archive counter and reference-absent scope.
Twelve-cell exact accounting stays failing/expected to fail until E; guides
and contracts are unchanged until E. C begins next; D/E NOT_RUN.

Step C finished 2026-10-14 at `c8a7bcd1d` (LOC 81,584 -> 81,006, delta -578).
Selections, one sample each on build `2026-10-14-issue321-c-source-1-build`:
exec at 2 CPUs and without a CPU limit exit 0; session 16 x 50 Commits plus a
fresh daemon on the evicted Store exit 0 (summed Commit 11,529.0 ms; B
11,457.4); tier 1 INELIGIBLE with functional/proof PASS and Gone (26,078 /
93,601 / 562,849; command 6,725.2 ms, Commit 1,824.2 ms; VM steps -8.4%);
four Workspaces INELIGIBLE with functional/proof PASS and Gone (104,311 /
372,337 / 2,246,971; external wall 11,496.9 ms; VM steps -8.5%). Recorded
against C: four-Workspace daemon peak 134,938,624 B (B 128,122,880) and
four-Workspace Store +3,252,224 B, both single observations of a quantity that
varied across the A/B/C samples; two CPU-limited exec cells slower. Five
overlay tests of two Workspaces in one database or of the removed record
methods are dropped; the rest are converted. Details and retained failures:
[#320 ledger](../320/PROGRESS.md#issue-321-step-c--table-revision-2026-10-14).
Twelve-cell exact accounting and the harness storage oracle stay for E.
D begins next; E NOT_RUN.

Step D finished 2026-10-14 at `a6d1ef177` (LOC 81,006 -> 81,054, delta +48).
Selections, one sample each on build `2026-10-14-issue321-d-source-1-build`:
exec at 2 CPUs and without a CPU limit exit 0; session 16 x 50 Commits plus a
fresh daemon on the evicted Store exit 0 (summed Commit 10,924.7 ms; C
11,529.0); tier 1 INELIGIBLE with functional/proof PASS and Gone (26,078 /
88,818 / 461,908; command 6,935.5 ms, Commit 1,739.0 ms; statements -17.9%,
VM steps -12.0%); four Workspaces INELIGIBLE with functional/proof PASS and
Gone (104,310 / 353,058 / 1,843,807; external wall 11,444.7 ms; summed Commit
13,647.1 ms). Recorded against D: tier-1 command time +210.3 ms and the
four-Workspace summed command time +377.9 ms while lock hold fell; most exec
diagnostic cells slower in this sample with lock service per job equal or
within a few µs; neither attributed nor resampled. Attribute requests are not
reduced (kernel-issued) and no accounting trigger is removed; both reasons are
in the
[#320 ledger](../320/PROGRESS.md#issue-321-step-d--fewer-statements-and-round-trips-2026-10-14).
No test is removed in D. Twelve-cell exact accounting, the `request_path`
pins and the harness storage oracle stay for E. E begins next.

## Step E finished, 2026-10-14

Rebased onto `sdk-refactor` `9fe542e3b` (measured pre-rebase commits kept at
`i321-pre-rebase` and the `i321-a-*` to `i321-d-*` tags). No product source
changed in E; Production LOC 81,054 at every E commit, 82,762 at the rebased
base. Sealed build `2026-10-14-issue321-e-source-2-build` at `2c11fe8aa`.

One sample each: twelve cells INELIGIBLE with proof PASS, the restaged count
gate PASS and cleanup Gone; six selected and six unselected cases INELIGIBLE
with functional and proof PASS and cleanup known. Against the SDK-refactor
baseline statements fall 12% to 61% and owner jobs fall in every mounted case;
requests and owner jobs of the twelve cells are equal. Tier 1: command 7,478.2
-> 6,712.3 ms, Commit 3,646.6 -> 1,708.2 ms. Four Workspaces: summed command
39,190.7 -> 28,991.4 ms, summed Commit 67,434.5 -> 13,389.4 ms.

Recorded against E and not attributed: dense rewrite 500 Commit 8,292.1 ->
12,026.4 ms (+45.0%), a case first sampled in E; local snapshot command
+19.2% with Commit -47.4%; six cells' command time above the baseline, the
largest C03 +67.0 ms; Store logical bytes up in six cases and down in six.
Retained: the twelve cell samples FAIL at the old gate before the restage; one
session-tool failure before any work; two preparation failures from the
rebased harness's shared-input order dependency. NOT_RUN: seven Linux tests
that need a device fixture, six harness unit tests that need native build
inputs, host suites and Clippy at the rebased commits (no product change since
D), Durable execution (disabled by owner until explicit reauthorization). No
timing is eligible. No push, pull request or issue closure.
