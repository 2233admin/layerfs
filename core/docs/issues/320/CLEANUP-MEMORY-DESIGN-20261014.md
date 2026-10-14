# Cleanup memory-placement review

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Source: `f2960b0bb`, 2026-10-14. No runtime sample or test accompanies this review.

The #320 handoff proposes moving `cleanup_task` to a journaled memory list,
while requiring automatic bounded reclamation during live activity and exact
failure custody. It also directs tracing each move, recording any that does
not hold and leaving it. The current decision is to retain this backed table.
The six-table goal therefore has an explicit one-table gap, not a completed cut.

The table is not only an in-flight owner roster. It holds cleanup debt and its
phase/keyset cursors. [schedule_shrink](../../../crates/layerfs-overlay/src/maintenance/garbage.rs)
queues separate STALE/STEPS and optional STALE_PIECES targets per inode and
generation. [orphan/serial retirement](../../../crates/layerfs-overlay/src/maintenance/orphan.rs)
and operation-record release queue other targets. Its ready and generation
indexes avoid repeatedly scanning held populations. The number of targets can
grow with mutation/deletion debt, rather than only with active request owners.

The [daemon maintenance loop](../../../crates/layerfs-daemon/src/overlay/owner.rs)
stores an original failed step in `maintenance_error`, and subsequent automatic
maintenance returns before attempting another step. Foreground job admission
checks stopping, connection absence and `failure`; it does not reject all
existing-Workspace mutations because `maintenance_error` is present. Those
mutations may enqueue new per-inode targets. New-mount admission has its own
maintenance-debt refusal, which does not bound an existing Workspace's backlog.

Replacing this queue with a resident list or several resident indexes would
make memory grow with that stopped backlog. A fixed entry cap would instead
introduce a new mutation/debt refusal. Neither follows from ephemeral lifetime:
the overlay database also lives only until daemon teardown. No bound tying all
cleanup targets to active owners has been established, so this move is not made.

The exact attempt and custody rule remains:

1. A waiting/held target is eligible work that has not executed its next step;
   a release wakeup changes readiness, not the outcome of an earlier attempt.
2. One admitted cleanup step runs once. Known failure rolls back its SQL cursor,
   row effects and journaled runtime changes. The original error is retained;
   automatic maintenance stops rather than replaying that failed operation.
3. Unknown SQL or rollback outcomes quarantine the connection and retain exact
   attempted state and both causes when applicable. No guessed cursor advance,
   deletion or success is permitted.
4. Healthy eligible work continues in bounded turns, including idle/live service.
   Exact capture/base/orphan/operation owners still gate retirement. Terminal
   unmount owns checked close and file disposal; global history is unaffected.

A future removal would need an indexed, backed representation of eligible debt
using existing filesystem state, with fixed resident cursor windows and proof
that work and memory do not grow with unrelated or stopped debt. Copying these
rows into another table/file or moving their implementation into a tool is not
simplification. The current schema/queue stays until such a design removes actual
redundancy without changing failure admission or inventing retry semantics.
