# Issue 321 checklist and evidence map

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Takeover 2026-10-13 at `878af2cea`; local branch `issue321-workspace-overlay`.

The GitHub checklist governs completion. Implemented rows below describe source,
not a claim that final qualification ran at the newest identity. Existing receipts
retain their own source/build pins. Steps proceed in order. Temporary backing is
also a step-1 obligation; `temp_store=FILE` remains unresolved at takeover.

## Step 1

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| empty template before readiness | implemented | overlay/workspaces.rs; database/startup.rs; template receipts; current source coverage to reconcile |
| copy/open connection and thread at mount | implemented | overlay/workspaces.rs; owner.rs; workspace-files and mounted concurrency receipts |
| close/delete after last owner | implemented | overlay/backing.rs; workspaces.rs; retained-files and mounted drain/device receipts |
| route every job/observation | implemented | overlay/workspaces.rs; control registry/cleanup; owner/resources/application receipts |
| reservation removed | implemented | database/physical.rs; connection.rs; reservation/device proofs |
| full-device rollback/no-space including I/O | implemented | connection.rs; physical.rs; device and four mounted arms at their pins |
| aggregate memory/page cache | INCOMPLETE | overlay/budget.rs; profile.rs; idle point and four diagnostics only |
| job classes/in-Workspace queue | implemented | overlay/queue.rs; owner/finite-service coverage to reconcile |
| service-time cause | INCOMPLETE | owner service / SQLite / CPU; retained counters; source model ongoing |
| page-cache option selection | INCOMPLETE | LIBSQLITE3_FLAGS/runtime compile options; retained enabled/disabled builds; memory needed |
| distinct ordinary identities | implemented | workspaces.rs; startup allocator; template and workspace-files proofs |

## Step 2

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| remove Workspace columns | NOT_RUN |  |
| selected table names | NOT_RUN |  |
| trace/apply valid merges | NOT_RUN |  |
| drop terminal reclaim/row cleanup | NOT_RUN |  |
| schema bump/no migration | NOT_RUN |  |

## Step 3

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| review accounting triggers | NOT_RUN |  |
| consolidate in-flight holders/statements | NOT_RUN |  |
| remove repeated attributes | NOT_RUN |  |
| reduce write frame | NOT_RUN |  |
| reduce Commit jobs/new file | NOT_RUN |  |
| Commit yields to same-Workspace requests | NOT_RUN |  |

## Step 4

| Checklist item | Disposition | Source/evidence |
| --- | --- | --- |
| twelve exact-count pins | NOT_RUN |  |
| all Linux mounted proof binaries | NOT_RUN |  |
| harness schema/profile compatibility | NOT_RUN |  |
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
