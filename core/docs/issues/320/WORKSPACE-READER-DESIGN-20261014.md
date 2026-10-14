# Store readers owned by Workspaces

Status: measured and rejected candidate under the owner-approved #320 reader
conditions. The pool is restored. The comparison used the one- and four-Workspace concurrency samples and C06 with the memory
sampler. Baseline receipts are recorded in PROGRESS.md. Shared-machine timings
remain INELIGIBLE; raw regression diagnostics are still grounds to keep the pool.

Concrete bootstrap opens one control reader and retains a read-only opening port.
Bind invokes that port once before its snapshot/root checks and before readiness.
The new reader belongs to that Workspace until terminal unmount. Opening never
happens on a filesystem request, and neither an opening nor a failed demand is
retried. A failed bind closes a healthy acquired reader; uncertain reader custody
stays retained with the original failure. The control reader serves explicit
unscoped history/construction work, rather than borrowing another Workspace's
reader.

Each bounded provider demand takes its Workspace reader lock, reads, and drops
its read transaction before returning. A request or a CanonicalClient holds no
SQLite transaction or exclusive reader lease across asynchronous steps. There
are no fair lanes, request tickets, FIFO rotation, queue credits or per-Workspace
request quotas. Workspaces remain independent; concurrent demands in one
Workspace serialize only their own short provider calls. Persistence already
sets and verifies cache_size=-2048 and mmap_size=0 on each opened connection.
The shared immutable cache remains one Store-owned bounded cache.

Terminal unmount drains the mounted requests, performs the overlay Close, then
closes that Workspace's healthy reader and removes its registration. Existing
client handles thereafter refuse provider demands. Unknown/poisoned provider
outcomes retain the original reader and error outside service; Close never
converts that state to a clean drain. Whole-Store stop, stopped admission and
operator reader-failure observation remain explicit. Numeric diagnostics report
actual active/retained readers and demand/lock work; removed scheduler counters
are unavailable in current receipts, while historical layouts remain readable.

Acceptance failed: four-Workspace phase wall rose from 1552.4 to 1575.4 ms
(+1.48%) in the one diagnostic sample. Observed RSS rose 36044 to 39556 KiB,
below the proposed 64 MiB per-Workspace allowance, but the time condition fails.
The retained pool therefore remains. The candidate is retained only if four-Workspace command
time does not worsen and observed peak memory stays within the per-Workspace
budget. No synthetic low-memory or zero-copy claim follows from the code cut.
