# Issue 320: tiers 2 and 3, preliminary reading of the receipts

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Written 2026-10-13 while no sample could run (the other worktree was running
> its gate tier). It is not the T2 or T3 diagnosis: those stages start only
> after the T1 stage end, and their cause sentences will be restated then
> against samples at the current identity. Nothing here selects or builds anything.

Sources: the "before" receipts at `196c70fba` and the two samples at
`56a6424e1` (tier 1 case and four Workspaces). All timing rows are `INELIGIBLE`
single observations. The unit is a step for the first two cases, a request for
the prepend and a file for the snapshot.

## Tier 2: remaining step cost (`dedup-history-hotset-100`, "before")

| One step | Value |
| --- | ---: |
| Command, mounted / plain directory / empty launch | 42.2 ms / 46.4 ms / 38 to 44 ms |
| Requests and owner service of the whole step | 7.4 requests, 1.2 ms |
| Commit | 8.2 ms |
| of it: Store transactions | 120, 2.0 ms |
| of it: pack reads | 71 on average, 6 at Commit 1 and 121 at Commit 100 |
| of it: record jobs | 69 |

The command is launch (proposal P1). The Commit has the two Store costs that
T1 batch 1 and proposal P3 address; the case has not been sampled since that
batch. About 5.5 ms of each Commit is in neither owner service nor Store
transactions. Each timed Commit also carries the observation the harness asks
for (one resources job and up to 64 diagnostic records written before the
reply); its share is not measured.

## Tier 2: Commits waiting across Workspaces (four Workspaces at `56a6424e1`)

| One step | One Workspace | Four Workspaces |
| --- | ---: | ---: |
| Command time | 80.9 ms | 97.1 ms |
| Commit time | 29.0 ms | 108.6 ms |
| Record jobs: service / queue wait | 9.3 ms / 0.2 ms | 13.8 ms / 30.8 ms |
| Record job, each: service / wait | 6.0 µs / 0.1 µs | 8.9 µs / 19.8 µs |
| Lifecycle jobs: wait (each) | 0.2 ms (3.6 µs) | 8.3 ms (140 µs) |
| Read and Mutation jobs: wait | 0.3 ms | 21.1 ms |
| Store transaction time | 3.8 ms | 9.7 ms |
| Peak jobs queued | 2 | 9 |
| Container CPU limit | 2 | 2 |

- **Waiting on the one owner.** A Commit makes 1,555 sequential record round
  trips. Alone each starts at once; with four Workspaces each waits about two
  jobs' service, 30.8 ms a Commit. The queue is never long (peak 9), so
  ordering alone cannot remove this; fewer round trips can
  ([proposal P2](proposals/RECORD-PORT.md)).
- **Commands wait behind Commits.** Read and Mutation jobs wait 21 ms a step,
  which is most of the 16 ms a command step loses with four Workspaces.
- **The Store writer** was 64.9 ms of transaction time a Commit before T1
  batch 1 and is 9.7 ms after it.
- **About 43 ms a Commit is in none of these.** The four Workspaces' writers,
  Commit threads, the owner and the request workers share a container limited
  to 2 CPUs while 3.7 workloads run at once on average (82.3 s of command and
  Commit time in 22.1 s elapsed). The receipt has no CPU time, so this share is
  inferred, not measured.

Nothing in this list is a candidate that needs no owner decision.

## Tier 3: length-changing edit (prepend on 500 MiB, "before")

16,011 requests: 8,000 reads and 8,001 writes of 64 KiB, 0.27 ms a request.

| Part | Value |
| --- | ---: |
| Owner service | 537 ms of 4,281 ms: Mutation 457 ms (57 µs a write), Read 77 ms |
| Statements a write / a read | 23 (16 Payload, 2 Inode, 2 Workspace, Begin, free-list read, Commit) / 2 |
| Base reads | 8,227 Store batches, 27,221 objects, 526 MB authenticated; 27,220 evictions |
| Outside the owner | 3,750 ms: base decode and authentication, 1 GB through the kernel, the tool |

The 16 Payload statements for one 64 KiB write (two 32 KiB rows) are the
count to model first. The plain-directory floor of this command was not
measured; without it the 3,750 ms cannot be split.

## Tier 3: many small files (25,000 one-byte files, "before")

| One file | Command | Commit |
| --- | ---: | ---: |
| Time | 0.44 ms | 0.33 ms |
| Requests | 7.1 | |
| Owner jobs | 4.1 Mutation, 6.2 Read, 1.0 Lifecycle | 44.8 record |
| Owner service | 180 µs | 249 µs |

| Statement family, one file | Statements | Time |
| --- | ---: | ---: |
| OperationRecord | 78.2 | 104 µs |
| Workspace | 67.4 | 85 µs |
| Lease | 58.2 | 42 µs |
| Inode, DirectoryEntry, Payload, Capture | 29.5 | 56 µs |
| Begin, free-list read, Commit | 36.7 | 51 µs |

- Record jobs are 75% of the Commit (6.2 s of 8.3 s): 19.4 a file from the
  namespace producer and 25.4 from Content and file construction. Proposal P2.
- The two fence statements of each job are 125 of a file's 270 statements and
  3.2 s of the case's 19.2 s. A record read is three statements (Workspace,
  Lease, record); a record write is six (Begin, free-list read, Workspace,
  Lease, record, Commit). Carrying both checks in the record statement would
  make them one and four. Predicted, if built: statements a file 270 to about
  180; time not predicted, expected under 10%.
- A write transaction's Commit statement costs 3.4 µs, 12.2 times a file.

## Tier 3: namespace Init (100,000 files, "before")

7,256 ms on the host, 73 µs a file, no daemon and no counters in the receipt.
The reference is 4.40 s (v0.1.5). Nothing can be modelled from this receipt;
the first step of the stage is to read Init's own work counters from the
library in a count test.
