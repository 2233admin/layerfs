# Store readers owned by Workspaces

Status: reintroduction authorized by the owner's superseding 2026-10-14
10% time/RSS allowances. The earlier candidate rejection and pool restoration
remain historical outcomes under the old condition, recorded below and in
PROGRESS.md. Shared-machine timings remain INELIGIBLE. The architecture is
authorized; final runtime correctness and eligible performance qualification
remain pending.


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

Historical acceptance under the old condition failed: four-Workspace phase wall rose from 1552.4 to 1575.4 ms
(+1.48%) in the one diagnostic sample. Observed RSS rose 36044 to 39556 KiB,
below the proposed 64 MiB per-Workspace allowance, but the time condition fails.
The retained pool therefore remains. The candidate is retained only if four-Workspace command
time does not worsen and observed peak memory stays within the per-Workspace
budget. No synthetic low-memory or zero-copy claim follows from the code cut.


## Superseding owner decision and current qualification

The owner prefers per-Workspace readers for simpler ownership and lifecycle.
The existing matched four-Workspace diagnostic comparison satisfies both new
independent allowances: phase wall 1575.4 <= 1552.4 * 1.10 = 1707.64 ms;
observed peak daemon RSS 39556 <= 36044 * 1.10 = 39648.4 KiB. Exactly 10%
is acceptable. One metric cannot offset a failure in the other. These observations
authorize reintroduction; they do not become eligible evidence or a speed claim.

The current implementation adapts the candidate to the kernel API rename and
the removal of unused forwarding methods. Repeated/concurrent whole-Store stop
admits one shutdown only, preventing duplicate retired work accounting. Healthy
failed-bind readers close, mounted drain precedes Close, and unknown/poisoned
readers remain in exact custody. Diagnostic references are weak and cannot hold
a healthy connection open after terminal unmount.

Phase 2 must qualify frequent fresh mounts (real connection-open bootstrap cost),
sustained same-mount calls and Commits (short serialized provider demands),
multiple mounted Workspaces (connections and caches scale with mount count),
and normal/forced unmount, failed bind, shutdown races and failure custody.
The 2 MiB cache and mmap-off verification are retained; neither proves total RSS
bounds. Existing absolute limits and functional requirements remain binding.
Reuse unaffected receipts; new measurements need an affected final implementation
or newly scoped qualification, matched workload/count/cache/source/build/limits,
and independent time/RSS comparisons. No unchanged resampling is authorized.


## Final reader identity correction (2026-10-15)

Phase 2 lifecycle review found that resolving a reader by Workspace ID on every
demand could let a retained old client borrow a later bind's reader when that
public ID was reused after Close. StorePorts now binds the already opened
ReadSession once; fresh operation custody keeps that same session identity.
Close clears its healthy connection even while clients retain the session.
An old client cannot select the replacement reader. Each demand still checks
whole-Store stopped admission before its short session lock; no connection opens
or transaction survives that demand. One shared immutable cache remains Store-owned.

New public lifecycle proofs cover fresh mounts with retained clients/diagnostics,
failed bind, reader unknown/poison custody and a bind racing Store shutdown.
Mounted request draining and sustained concurrent calls/Commits remain in the
surviving Linux proofs. No new performance sample was run; specifically gated
benchmark-original preparation and eligible performance qualification remain pending.
