# Phase9 retained count profiles

> Status: Dated count-only diagnostic; no clean-run or release qualification.

These profiles reuse immutable receipts at product tree `b99f79e3dd972ebd6bbd1db2fc2626d08a289e19`. All owning statuses remain unchanged. No timings are compared. The table uses exact before-mount to Commit-reply endpoints, excluding the following Status: one owner job and one SQL statement are removed from each original reported interval. Original totals remain in JSON. Commit-only SQL attribution stays unavailable because the preceding numeric snapshot also precedes the command. Exact operands, identities and receipt/log hashes are in [JSON](checks/phase9-profiles.json).

Decided by agent, pending owner review: retain the three profiles and do not optimize before the phase8 environment gate.

| Case | Original status | Command+Commit requests | Owner jobs | OperationRecord jobs | SQL statements | Logical Overlay read bytes | Per-Commit producer records |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dedup-workspace-exact-500 | INELIGIBLE | 7014 | 46768 | 22184 | 282012 | 524288000 | 9647 |
| dedup-workspace-unique-500 | FAIL | 7014 | 46768 | 22184 | 282012 | 524288000 | 9647 |
| delete-middle-4k-on-1mib-ops-1 | INELIGIBLE | 24 | 156 | 118 | 933 | 8192 | 42 |
| replace-shrink-middle-4k-to-2k-on-1mib-ops-1 | INELIGIBLE | 24 | 187 | 147 | 1089 | 14336 | 42 |
| delete-middle-4k-on-10mib-ops-1 | INELIGIBLE | 132 | 507 | 361 | 3896 | 8192 | 42 |
| replace-shrink-middle-4k-to-2k-on-10mib-ops-1 | INELIGIBLE | 132 | 736 | 588 | 4716 | 14336 | 42 |
| delete-middle-4k-on-100mib-ops-1 | INELIGIBLE | 1212 | 2660 | 1426 | 26165 | 16384 | 42 |
| replace-shrink-middle-4k-to-2k-on-100mib-ops-1 | INELIGIBLE | 1212 | 1859 | 629 | 19311 | 14336 | 42 |
| delete-middle-4k-on-500mib-ops-1 | INELIGIBLE | 6012 | 13246 | 7200 | 127501 | 40960 | 42 |
| replace-shrink-middle-4k-to-2k-on-500mib-ops-1 | INELIGIBLE | 6012 | 6789 | 759 | 83979 | 22528 | 42 |

The 500-file exact/unique rows have the same request, owner, SQL and namespace-producer counts. Their original Commit-associated storage diagnostics differ: exact reports payload reads of 465,521,758B and pack writes of 8,062B; unique reports 331 B and 526,202,182B respectively. Exact same-scope foreground payload endpoints independently report 524,288,000 logical local-copy read bytes for each row; this is a measured counter difference, not an assumption from submitted bytes. All seven payload counters pass monotonicity/saturation checks, and exact Resources observer payload costs are subtracted (zero for these intervals). These remain named counts from the original schema, with physical cache/IO and residency qualification outside this profile.

Per-file CDC chunking and hashing byte counts are unavailable: exported Content sections17-23 describe namespace/tree work, not the ConstructedFile counters. The 500-file rows and 9,647 producer record jobs are separate observations and do not supply those missing byte counters. Original schema/adapter source hashes are pinned in JSON. Every single-file edit above reports 42 namespace producer record jobs. OperationRecord service jobs cover a larger command+Commit interval and are a distinct counter. The size series does not establish a query plan or a cause from elapsed time. No original EXPLAIN receipt exists, so query-plan/optimization qualification is unavailable.

Hotset 500 retains 377 successful ordinary commands and 377 Commit acknowledgements. The facade recorded 380 successful control sends/replies: one Hello, two mount controls and 377 Commit controls; commands contributed zero filesystem-control records. Step 378 reached exec_start without a command result or Commit acknowledgement. The remaining 123 declared steps remain unacknowledged. No daemon numeric logs were retained, so SQL, OperationRecord and construction counts are unavailable; none are inferred from nearby runs.
