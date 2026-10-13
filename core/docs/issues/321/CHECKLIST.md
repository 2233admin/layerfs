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
| trace the eleven tables; move the ones that hold | IN_SOURCE; qualification owed | [pre-change trace](STEP-A-TRACE.md); all eleven moved |
| one in-memory open-state structure per Workspace | IN_SOURCE; qualification owed | open/ next to Overlay connection; touched-entry undo |
| remove moved tables, statements, triggers, cleanup jobs, plan diagnostics, typed jobs | IN_SOURCE; final removal audit owed | SQL/schema/accounting and dedicated native/cookie retirement deleted; real filesystem jobs still use the owner until B |
| remove `reclaim` and terminal row cleanup | IN_SOURCE; mounted disposal qualification owed | raw close retains rows; control closes/deletes whole file |
| bytes per kernel-reference entry; map size after the tier-1 walk | DIAGNOSTIC ONLY; walk NOT_RUN | 854,848 requested Rust B / 5,000 = 170.9696 B/entry, kernel+custody maps/journals; no RSS/SQLite C-heap bound |

## Step B — one lock per Workspace

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| one lock around connection and open state; caller runs the job | NOT_RUN |  |
| remove owner thread, queue, admission, credits, ledger, completion tracking | NOT_RUN |  |
| plain workers per mount replace the daemon-wide dispatcher; threads reported | NOT_RUN |  |
| separate SQLite page caches | NOT_RUN |  |
| idle and loaded memory at 1, 4 and 16 Workspaces | NOT_RUN |  |
| service-time cause re-measured | NOT_RUN |  |

## Step C — table revision of what remains

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| remove Workspace columns | NOT_RUN |  |
| selected table names | NOT_RUN |  |
| trace/apply the record-table merge | NOT_RUN |  |
| schema bump/no migration | NOT_RUN |  |

## Step D — fewer statements and round trips

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| review accounting triggers | NOT_RUN |  |
| remove repeated attributes | NOT_RUN |  |
| reduce write frame | NOT_RUN |  |
| reduce Commit jobs/new file | NOT_RUN |  |

## Step E — re-qualify once

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| twelve exact-count pins | NOT_RUN |  |
| all Linux mounted proof binaries | NOT_RUN |  |
| harness schema/profile/receipt-field compatibility | NOT_RUN |  |
| contracts/cache/architecture/guides | NOT_RUN |  |
| selected/held-out samples | NOT_RUN |  |
| rebase SDK baseline/recompute LOC | NOT_RUN |  |
| ledger results | IN_PROGRESS |  |

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
