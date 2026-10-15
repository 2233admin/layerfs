# Depot diagnostic tables

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

The tables derive from the closed campaign traces, public Branch histories,
operator counters and preserved daemon observations. [SOURCES.json](SOURCES.json)
pins each copied table to its external original and SHA256. The corresponding
`analysis-inputs.json` pins the exact analysis source and input bytes. Raw command
receipts, full traces, decoded records, phase events and stopped Store exports
remain under the external evidence root named in [RESULTS.md](../RESULTS.md).

| Run | Steps | Methods | Observed phases | Commit Saves | Kernel maxima | Publications |
| --- | --- | --- | --- | --- | --- | --- |
| Phase A | [CSV](phase-a-steps.csv) | [CSV](phase-a-methods.csv) | [CSV](phase-a-phases.csv) | [CSV](phase-a-commits.csv) | [CSV](phase-a-kernel-observed-maxima.csv) | [CSV](phase-a-publications.csv) |
| Builder 1 | [CSV](builder1-steps.csv) | [CSV](builder1-methods.csv) | [CSV](builder1-phases.csv) | [CSV](builder1-commits.csv) | [CSV](builder1-kernel-observed-maxima.csv) | [CSV](builder1-publications.csv) |
| Builder 2 | [CSV](builder2-steps.csv) | [CSV](builder2-methods.csv) | [CSV](builder2-phases.csv) | [CSV](builder2-commits.csv) | [CSV](builder2-kernel-observed-maxima.csv) | [CSV](builder2-publications.csv) |

`steps.csv` groups completed SDK trace records by their original step label.
`observed_trace_span_ms` spans the earliest start through the latest returned
call in that group; it is not a host-command timer or a sum of nested spans.
The full command ledgers preserve host/Sandbox commands and process exits.

`methods.csv` reports every observed method, including failures: count, median,
nearest-rank p95 and maximum milliseconds. Public SDK, internal `sandbox.service`
and operator methods are separate categories. A failing process can be returned
by a successful SDK call; SDK failures and nonzero process exits are separate.
`sandbox.service` includes explicit and automatic helper use; the trace does not
separate those two reasons. Daemon exchanges are not extra public SDK calls.

`phases.csv` aggregates observed daemon timing nodes by full path. Parent/child
spans overlap; never add them. Bounded trace omission counts remain in each
summary. A failed transport reply can lack inline phase timing even when its
separately saved daemon observations join successfully.

`commits.csv` deduplicates the operator Save counters by Commit identity and
checks public-history agreement. Cumulative columns start at the separately
observed initial Store totals; metadata accumulation uses only metadata pack
bodies. The summary preserves any gap to final totals. Logical tree bytes per
Commit and logical Store bytes summed across every Commit and Layer are distinct.
The Builder 1 [export reconciliation](builder1-export-reconciliation.json) checks
all 76 unique Commit rows and seven Layers against the read-only restored Store;
[layers.csv](builder1-layers.csv) preserves those publication records.
The independent Builder 2 [reconciliation](builder2-export-reconciliation.json)
checks all 75 unique Commits and seven Layers; its
[Layer table](builder2-layers.csv) retains all publication records.
The independent Builder 2 [reconciliation](builder2-export-reconciliation.json)
checks all 75 unique Commits and seven Layers; its
[Layer table](builder2-layers.csv) retains all publication records.

Kernel maxima are per daemon and mount owner at observed control boundaries.
Opcode frame counts, disposal counts, FORGET ownership units and WRITE store
units are different quantities; they must not be added as one request count.
These are not OS syscall totals or exact per-Exec attribution. The first delta
and absent sections are unavailable. Emission order comes from a complete
preserved stderr stream per daemon, verified against shorter duplicate prefixes;
connection-local call numbers do not establish global order. Maxima alone do not
prove final-event completeness.

All observations are diagnostic, with tracing enabled, unknown OS cache state
and declared host archival activity. The builders implement different programs
and histories. No latency ranking, cold-cache, resident-memory, release or
power-loss claim follows from these tables.

## Additional Builder 2 census and operation detail

The [Builder 2 detail section](../RESULTS.md#builder-2-file-data-encoding-and-operation-detail)
separates the original independent run from the later read-only final-Commit
census. Derived tables retain [authored files](builder2-detail-authored-files.csv),
[directory sizes](builder2-detail-filesystem-groups.csv),
[operation groups and Commit outcomes](builder2-detail-operation-groups.csv),
[bulk-save outliers](builder2-detail-bulk-save-outliers.csv),
[kernel maxima sums](builder2-detail-kernel-maxima-sums.json),
[summary](builder2-detail-detail-summary.json) and
[input hashes](builder2-detail-analysis-inputs.json). The census changed no
Store counters or application data and created no new Commit.
