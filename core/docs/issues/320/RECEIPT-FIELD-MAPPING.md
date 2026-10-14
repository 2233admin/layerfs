# Issue 320: fs-bench-pro receipt fields for the metrics table

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Written 2026-10-13 for product tree `ff47933c44f6` (branch `perf-experiments`).

The [benchmark instruction](../../../../docs/general/benchmark_instruction.md)
names its metrics by the fields of the older R7 cell receipt. An fs-bench-pro
Workspace receipt (`fs-bench-pro-workspace-family-v1`) carries the same daemon
observations in another layout. This table maps one to the other. The reader
[`tools/receipt_metrics.py`](tools/receipt_metrics.py) implements it; the array
orders are the ones pinned in
[`cluster-two/cells/counts.py`](../../../benchmark/cluster-two/cells/counts.py)
and the [diagnostics schema](../../architecture/70-daemon-application-startup-control.md).

## The measured interval

Every daemon counter is cumulative. A receipt keeps one snapshot per control
call (mount, each Commit, Status, unmount), each tagged with the control channel
and the call number. A metric is the difference of the snapshot at the interval's
last call and at its first.

| Receipt layout | First call | Last call |
| --- | --- | --- |
| One Workspace: `phase_counts` is a list | `phase_counts[0].before_identity` | `phase_counts[0].end_identity` |
| Several Workspaces: `phase_counts` is an object | `phase_counts.endpoints.before.identities[0]` | `phase_counts.endpoints.end.identities[-1]` |

The interval covers command and Commit together. The receipt has no snapshot
between a command and its Commit, so counts cannot be split by phase. Owner
classes split them in practice: Capture and OperationRecord jobs belong to
Commit, Mutation jobs to commands.

## Mapping

| Metric of the instruction | fs-bench-pro receipt field | Notes |
| --- | --- | --- |
| Row status, verifier, custody, cleanup | `status`, `functional_status`, `proof_status`, `custody`, `cleanup` | `status` is the timing eligibility; a row passes only on `functional_status` and `proof_status` |
| Phase wall time | `phases.command_ns`, `commit_ns`, `mount_ns`, `unmount_ns` | Sums over steps; for several Workspaces they are sums across Workspaces |
| Elapsed time of a concurrent case | `performance_external_wall_ns` | Absent for one Workspace |
| Launch spans of each command | `runtime.events.jsonl`: `exec_created`, `exec_start`, `streams`, `exec_status`, `command` | Beside the receipt; one row per command |
| Headline counts | `counts.requests`, `owner_jobs`, `statements` | Statements are executions of the foreground families, the observer's own Status work subtracted |
| Requests per opcode | `phase_counts[0].raw.opcodes.by_opcode` (39 values, `Opcode` order) | Several Workspaces: only `phase_counts.kernel_connections[].requests` |
| Request disposition | `phase_counts[0].raw.opcodes.disposition` | |
| Owner jobs per class | `phase_counts[0].adjusted.completed` | Raw: `observations.owner_work` values 14 to 19 |
| Owner queue wait and service per class | `observations.owner_work` values 20 to 25 and 26 to 31 | Class order Read, Mutation, Capture, Lifecycle, OperationRecord, Source |
| Admitted, queued, peak queued | `observations.owner_work` values 0, 5, 6 | Peak is a lifetime gauge, never subtracted |
| Maintenance jobs, rows, bytes, time | `observations.owner_work` values 9, 10, 12, 13 | |
| Statements per family | `observations.statement_work`, `section` 2 (foreground) and 3 (maintenance), `index` = `StatementKind` | 17 values: attempts, executions, rows returned, rows changed, direct rows changed, blob bytes, value bytes, VM steps, full-scan steps, sorts, auto-index rows, re-prepares, bound bytes, SQL bytes, two memory samples, elapsed ns |
| Write transactions | Commit family `attempts` | Each has one Begin and one free-list read in the Startup family |
| Dispatch | `observations.mount_work` (13 values), `dispatch_work` (10 values) | Steps minus completed, and wakes, show hand-offs |
| Store reader | `observations.reader_work`: grants value 9, queue wait value 10 | |
| Store demands | `observations.store_work`: object batches, object ids, length batches, length ids, serial reservations | |
| Immutable cache | `observations.cache_work`: hits, misses, upstream batches, authenticated bytes, evictions | |
| Construction of each Commit | `observations.construction_work` (31 values a Commit) | Per-call arrays, summed over the Commits |
| Storage read and save of each Commit | `observations.storage_diagnostics` (42 values a Commit) | Per-call arrays, summed |
| Content work of each Commit | `observations.content_diagnostics`, sections 17 to 23 | |
| Global Store SQL | `observations.global_sql_work`, section 13 (writer) and 14 (each reader) | 27 scalars, then seven statement phases and seven Commit phases as (calls, wall ns) |
| Stored rows, pages, allocation | `observations.stored_counts`, `resource_diagnostics`, `cleanup_debt` | |
| Store and overlay bytes | `observations.store_logical_bytes`, `store_allocated_bytes`, `overlay_logical_bytes`, `overlay_allocated_bytes` | Overlay allocated bytes include the fixed 256 MiB reservation |
| Daemon peak resident memory | `observations.daemon_vmhwm_bytes` | Lifetime peak of the daemon process |

## Not in the receipt

- A split of daemon counts between command and Commit.
- Requests per opcode for a case with several Workspaces.
- Payload copy counters (sections 4 and 5) and per-thread CPU time.
- Any daemon counter for `init_namespace`, which runs on the host with no daemon.
- A passthrough or native arm. The native floor of two cases is the one-off in
  [NATIVE-DIAGNOSTIC.md](NATIVE-DIAGNOSTIC.md).

## Run-to-run variation seen in retained receipts

These differ between two samples of identical product source, so they are not
evidence of a change:

- Foreground Inode statements and maintenance Reclaim statements, by the number
  of empty orphan-inode probes (164 SQL bytes, 16 bound bytes, 12 VM steps, no
  row). The probe runs while the engine still holds an orphan row, and
  maintenance decides when the last one goes. One or two in a cell; 21 in the
  tier 1 case, which unlinks 2,160 files.
- Store logical bytes of a case with many Commits, by a few pages (tier 1:
  114,401,280 and 114,438,144 with equal counts). Pack bytes written differ by
  about one byte a Commit.
- With several Workspaces: Read and Mutation jobs and the Workspace, Inode and
  Lease families (see the setup entry of [PROGRESS.md](PROGRESS.md)).
