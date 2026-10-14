# Step A: open-state source trace

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Source: `464b121b9` (product unchanged from `20f237499`).
> Trace before implementation, 2026-10-13. No table has moved yet.

Issue #321 governs the changes below. All eleven tables can leave SQLite,
but two descriptions in the planning table need more detail: an orphan is
more than a flag, and an independently acquired request can outlive its job.
Neither requires an owner decision or a different memory policy.

| Table | Source path and transitions | Disposition and required memory state |
| --- | --- | --- |
| `file_custody` | `lifetime/file_owners.rs` increments and decrements opens, lookup owners and readers; `lifetime/orphan.rs` tests holders/users at final unlink; `maintenance/orphan.rs` deletes empty custody. Native CREATE combines open and lookup acquisition in `lifetime/native_mutation.rs`. | Move. Keep exact per-inode reference counts. Kernel lookup count and file opens remain distinct; the root's implicit reference is independent of explicit `nlookup`. Last release still schedules bounded live payload retirement. |
| `file_handle` | `lifetime/file_owners.rs` retains, observes, checks and closes non-native descriptors; `lifetime/native_file.rs` binds mount/request/serial/access mode; native visit/effect acquires before reply. `maintenance/native.rs` retires undeliverable RELEASE owners after native drain. | Move. Index both minted handle and original request, retaining access mode and exact mount association. A lost reply does not release a successfully acquired handle. Drained native revocation ends kernel ownership; it is not a guessed RELEASE. |
| `file_read` | `lifetime/file_owners.rs` acquires a reader and its class-1 `base_source`, increments `workspace.base_readers`, and holds a kind-5 lease; release removes all three after the consumer is fenced. `Workspace::read_file` may acquire immutable bytes outside the owner turn. Native visit reads already use an owned bounded value and create no reader row. | Move the original request/reader association. The plan's “nothing” is correct for native visits, but not for the separate public descriptor-read port: its exact reader survives a job and descriptor close. Preserve its source/install fence, consumer custody and lost-reply observation in memory; do not remove them with the table. |
| `lookup_owner` | `lifetime/lookup.rs` retains and observes non-native lookup custody, allows independently acquired read windows, and releases exactly once. `lifetime/close.rs` includes it in terminal eligibility. | Move minted owner, request and serial. It is separate from the native kernel reference map. |
| `orphan` | `lifetime/orphan.rs` records immutable root and lower top/floor at final unlink; `namespace/inode.rs`, `payload/stream.rs`, native and descriptor reads consult it. `maintenance/orphan.rs` migrates a lower cell or piece and advances the bounds, or retires payload after the last owner. | Move. An inode entry needs `root`, `top` and `floor`, not just an orphan boolean. Retain the backed `gen=-1` inode/payload/shrink/reference rows and their existing bounded migration algorithm. Captured generations and retained readers must still fence transfer. |
| `orphan_wait` | `maintenance/orphan.rs` records a captured/generation hold. `maintenance/source_wait.rs` wakes at most 64 serials per turn when that source releases. `lifetime/orphan.rs` removes an exact wait on lower-layer release. | Move the generation-to-orphan wait index. Preserve bounded wake windows; a generation release must not scan all open state or wake all its serials under one lock hold. |
| `native_mount` | `lifetime/native.rs` mints one mount and implicit root reference, checks identity/revocation, and revokes after detach/drain. Native visit fences join it to Workspace state. `maintenance/native.rs` performs terminal native row disposal. | Move the exact mount identity, root and revocation state next to the connection. Native revocation must follow the existing drain proof. Remove the SQL native-retirement job, not the drain. |
| `native_lookup` | `lifetime/native.rs` acquires/increments a reference before a positive reply, validates FORGET and prevents underflow. `lifetime/native_visit.rs` checks kernel custody before metadata/data/mutation. `maintenance/native.rs` removes drained references. | Move one kernel entry per remembered inode, retaining explicit count, implicit-root bit and minted ownership identity. No map-size cap; measure actual allocation per entry and tier-1 walk population. |
| `native_parent` | `lifetime/native_directory.rs` records a kernel-known directory's parent; `native_directory_read.rs` supplies `..`; `native_mutation.rs` follows ancestry. `namespace/compound.rs` updates a moved directory's parent atomically. The SQL FK deletes the parent when custody ends. | Merge parent into kernel/open directory state. Preserve the parent through an open directory whose lookup was forgotten. Update it in the same atomic job as a directory move and remove it only after its last owner. No unrelated inode scan. |
| `native_directory` | `lifetime/native_directory.rs` retains request/serial/handle, validates RELEASEDIR, then deletes small cookie sets or marks a larger handle closed for maintenance. `lifetime/native_visit.rs` fences directory operations and returns the cookie floor. | Move the open directory and exact original request association. Preserve parent and floor. Remove its SQL cleanup job; account actual memory disposal separately from payload cleanup. |
| `native_cookie` | `lifetime/native_cookie.rs` offers fresh numbers without acquisition; publication validates ordered accepted names, records the page, and advances floor on rewind. `native_directory_read.rs` resolves only published offsets. `maintenance/native_directory.rs` deletes closed pages in bounded turns. | Move accepted-name pages and their offset/after-name indexes into directory state. An offer is not a published offset. Retain stale-offset, rewind, partial reply and lost-send semantics; no directory-size cap and no resident full namespace listing. |

All eleven have accounting triggers in `sql/accounting.sql`; they also occur
in native fences, lifetime/cookie query-plan diagnostics and terminal-held
checks. Remove those statements and triggers with the moves. Publish exact
memory ownership counts as memory observations, not fictional SQL rows or zero
values for deleted machinery. Keep real database statement/storage counters.

`reclaim` has two uses. `lifetime/close.rs` queues the terminal namespace cursor
that `maintenance/reclaim.rs` walks. `lifetime/generation.rs` also inserts a
generation marker at known install, while `maintenance/garbage.rs` deletes that
marker when the separate `maintenance` RETIRE item finishes. The latter marker
does not drive live retirement: the maintenance item does. Remove both uses,
the table/index/accounting and terminal deletion. Preserve live maintenance.

Memory changes that accompany SQL publication need per-job undo of only the
touched entries. Restore them only after a known whole-job rollback, including
capacity failure at COMMIT. Unknown SQL completion quarantines the Workspace
and retains original memory/SQL custody; it must not guess a rollback. Never
clone an entire open-state map to make one mutation atomic.

Unmount must retain the existing native/request/Store/control fences and checked
database close. Its final physical action is identity-checked deletion of the
Workspace file after the last owner releases. It does not visit payload or
namespace rows, and it does not delete committed global history.

Verification selection: exact descriptor/request/lookup and orphan lifetimes,
FORGET/release underflow and stale ownership, directory rewind/partial replies,
directory parent moves with retained handles, known rollback/NoSpace and lost
reply custody, independent Workspace deletion and Linux mounted drain/Commit/
writers. Counts are evidence; the twelve frozen count cells stay failing until
Step E re-pins them. No proof assertion is weakened by this trace.
