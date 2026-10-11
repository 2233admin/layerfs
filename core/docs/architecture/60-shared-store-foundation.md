# Shared Store platform, contention and seal

> **Status:** Current general guide.
> Source update after `122b8c1b3`, 2026-10-08; provider implementation,
> not daemon/control/Exec integration or performance qualification.

[`Handles`](../../crates/layerfs-persistence/src/store/handles.rs) opens one
validated session on macOS or Linux. macOS links system SQLite; Linux enables
`bundled` on the existing pinned rusqlite dependency. The database remains
distinct from every daemon's local overlay.

Disposable/WAL/OFF is the sole authorized execution profile until the owner
explicitly reauthorizes Durable. Retained Durable code selects FULL, with full
synchronization on macOS; it may compile but must not execute. Disposable
supplies no kernel/VM-crash guarantee.
Identities are `sqlite-wal-full-v2` and `sqlite-wal-off-v2`. Shared creation selects WAL;
open reads and verifies it without conversion. Existing memory-journal Stores
are refused. Profile selection across processes is a provisioning fact rather
than a persisted cross-profile lock. Page size4096, foreign keys1, checkpoint
interval1000, journal limit4194304, cache−2048, mmap0, temporary storage2,
DEFENSIVE and checked busy timeout 0 are retained.

The connection applies the selected `synchronous` and `fullfsync` settings
before page/acquisition setup, WAL selection or schema creation. Selecting WAL
on a new file can itself write the main file and rollback journal; validating
OFF after that transition cannot establish Disposable startup behavior. The
external [Disposable VFS regression](../../crates/layerfs-persistence/tests/disposable_startup_sync.rs)
delegates actual SQLite VFS operations and checks that public create, Save,
seal and writable reopen issue no `xSync` calls across all three layouts with
and without acquisition tables. Its separate non-Store control proves the
observer forwards and counts `xSync`. This is a persistence profile correction,
with no new performance qualification or change to existing receipt verdicts.

Owner supersession 2026-10-12 for issue #319 requires concurrent Workspaces to
keep independent Commit state while sharing short atomic Store transactions.
Every mutation still makes one `BEGIN IMMEDIATE` attempt with busy timeout 0.
Busy/Locked/Protocol lock codes retain typed `Busy` through Persistence, Storage
and History: no body, transaction or rollback follows a refused begin.

Before SQL, each session admits one caller through a FIFO connection turn.
Read, write and diagnostic access share a two-second admission deadline; at
most 1,024 pending u64 tickets hold 8,192 bytes of ticket data plus container
metadata. Full admission returns Capacity before SQL. An expired waiter removes
its ticket and returns Busy; later callers remain runnable. This is a bounded
concurrent-admission resource, independent of total files, bytes, Saves or
Workspace lifetime. SQL counters are unchanged by admission itself.

On Linux, a writable transaction also acquires an exclusive advisory flock of
an independently opened description of the existing Store parent directory,
within that same deadline. It never opens an additional descriptor to the main,
WAL or SHM files. Closing any main-file descriptor outside SQLite can cancel all
of that process's POSIX locks on that inode; SQLite documents this
[lock-corruption hazard](https://www.sqlite.org/howtocorrupt.html#_posix_advisory_locks_canceled_by_a_separate_thread_doing_close_).
The directory inode is a coarse coordination key: multiple Store files in the
same directory share the short transaction lane. A relative bare filename uses
`.`. No sidecar is created. Existing Store placement requires stable names and
parent directory authority; renamed/reparented active stores are not qualified.
Nonblocking lock polling is readiness before the single BEGIN, not transaction
replay. Separate handles and daemons on the same local named VM volume share
this kernel admission. The lock covers one atomic transaction through its
known COMMIT or definite ROLLBACK, never a Save, construction or whole Commit.
FIFO is provided within a session; cross-session/process polling has no FIFO or
starvation guarantee and may expire before effect. An uncooperative SQLite
writer still produces the original exact Busy at BEGIN.

macOS has the local session FIFO only. Its flock interacts with SQLite's
open-file locking, so no main-file flock, extra sidecar or cross-session/process
coordination is introduced there; a separate macOS writer retains exact SQLite
Busy. Host Init remains sole-owner. The Linux admission scope requires a local
filesystem with independent flock/fcntl semantics, as does the existing shared
Store placement contract; host shares and network filesystems are unsupported.

The two-second deadline is an agent decision pending owner review, using the
retained 46,750 ns serial transaction upper observation and 9,558,915 ns
three-transaction Commit upper observation, with room for peers, large
publications and VM interference. These inclusive observations are not exclusive lock maxima or
performance qualification. Historical refusals remain failed.

Definite failures retain existing rollback handling. Unknown outcomes and
poisoned unwinds retain the advisory owner with the quarantined session until
SQLite connection teardown, which precedes advisory release. Known release is
checked explicitly; a release failure retains ownership and returns uncertainty.
Linux sole-owner seal also owns admission during checkpoint and checked close;
macOS seal is unchanged. Separate reader sessions take WAL snapshots without
global writer admission. No caller retries a failed SQL operation.

The old macOS allocation/extent-release owner, associated counters/result
fields and public checkpoint API are removed. Host `Handles::seal` consumes
its handles, refuses retained provider ownership, takes the sole session,
checkpoints TRUNCATE once, checks close, and verifies that no WAL/SHM/journal
sidecars remain. It returns file path/bytes, provisioning profile and the
linked SQLite version. A failure causes no guessed deletion or retry. New
openers must be excluded by the provisioning lifecycle through handoff.

The [owner-selected seal correction](../../../docs/roadmap/0.1/0.1.7/macos-seal-allocation-stride1-20261007.md)
adds one narrow macOS completion step after checked SQLite close and sidecar
absence. If physical allocation exceeds logical length, the safe, already
locked nix0.31.3 `F_TRANSFEREXTENTS` API transfers unused extents beyond EOF to
an exclusively created empty sibling, then closes and removes that sibling.
The original file is never replaced or copied. Regular-file, single-link,
device/inode and length checks fence the operation; symlinks/hard links are
refused. Transfer or temporary-close uncertainty retains the owned sibling;
cleanup failures remain uncertain, without a second attempt. No preallocation,
vacuum, payload scan, persistent allocation owner or new unsafe boundary is
introduced. Linux has no extent-transfer step. The shared daemon Store stays
open and does not run this sole-owner host seal operation.

Apple's SQLite keeps persistent WAL by default. The
[owner-approved wrapper](../issues/307/SEAL-PERSIST-WAL-DECISION-20261007.md)
sets this file-control flag to0 and reads it back, only in the macOS seal path.
One audited FFI module is allowed; all other Persistence modules remain covered
by the unsafe-code boundary. Linux's path is unchanged by this exception.

The macOS system SQLite 3.51.0 cannot start a read-only connection to a freshly
sealed WAL file with absent sidecars (raw SQLite returns code14/CANTOPEN).
A writable opener creates the runtime sidecars first. The daemon's required
startup order is therefore write handle then read set; no read-only-to-writable
fallback exists. Read-only operations remain refused before mutation. Seal is
host provisioning, never a daemon maintenance or Commit operation.

Acquisition and bounded page reclamation remain host Init facilities. Their
abandoned-operation model is not safe for multiple independent importers and
is not exposed through daemon Store ports. No collection runs under writers.
Save reservation batching and combined stage/publication remain F8. Physical
Store placement requires local kernel locking/shared memory: a named VM volume
or container-local disk, never the repository host share.

[F1–F4 receipts](../issues/307/PRE-S8-F1-F4-20261007.md) cover Disposable
functional checks and retained failures. New Durable execution stays disabled
until explicit owner reauthorization.
Historical allocation/speed results keep their original profiles and verdicts;
mechanism retirement supplies no speed or storage improvement claim.

## WAL throughout and the accepted host Init baseline

The [owner supersession](../issues/307/PRE-S8-WAL-BASELINE-DECISION-20261007.md)
keeps WAL throughout both Init and Commit. The private MEMORY creation and
promotion path is removed, while ordinary checkpoint/close seal and its
approved macOS file-control wrapper remain. The existing198720291ns host
Disposable1000 observation is the accepted baseline for its exact scope.
Its original1.10× comparison against retained155291459ns MEMORY evidence
remains FAIL; there is no new speedup, matched pair, Commit latency or complete
resource claim. All raw receipts and the withdrawn private-route history remain.

Both operations reuse canonical construction, Storage Save and WAL/history
implementation with separately owned input and mutable producer state. Each
Storage handle permits one active Save; concurrent producers use separate
handles over the same Store. No mutex spans a whole Commit, and Commit never
runs Init acquisition/abandoned-operation cleanup. These concurrency and
publication obligations still require their own proof.
