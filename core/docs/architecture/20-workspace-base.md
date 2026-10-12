# Workspace immutable base access

> **Status:** Current general guide.

Implemented source: the S3 checkpoint on local main following `f2a381119`, for
[tracker #307](https://github.com/Ephemeral-AI-Lab/layerfs/issues/307). This is an
initial active library, not complete Workspace or S3 install/lease qualification.

The replacement [Workspace](../../crates/layerfs-workspace/src/workspace/state.rs)
binds a checked canonical filesystem root to one overlay route. `BaseView::open`
acquires one root through public `FilesystemRead` and checks allocation scope;
it does not enumerate paths or reconstruct payload. `Workspace::open` then
creates bounded logical state in the already initialized overlay. No special
empty-base branch exists. Runtime root/Branch authority and native mount readiness
remain separate future integration work.

[BaseView](../../crates/layerfs-workspace/src/base/view.rs) uses current public content
APIs for child/inode lookup, directory listing, portable metadata and symlink
targets. Its file range plan opens public `FileView`, clamps EOF, retains that
immutable file root/classification and streams to a caller sink. The 128 KiB read
window limits one request, not file length. A retained plan remains on its old
root when a new BaseView binds another root; actual overlay install/reader lease
integration is still outstanding. Global cluster one currently has no content GC;
this pointer retention is not a future distributed retention lease.

[CanonicalClient](../../crates/layerfs-workspace/src/base/client.rs) reauthenticates
returned canonical bytes against exact object IDs, checks demand cardinality and
canonical-object/window limits, and restores demand order. Cache locks are released
before upstream calls and authentication. There is no retry or error substitution.
The upstream public provider must enforce its own authority/allocation contract
before returning a batch; the client cannot undo upstream allocation. Authenticated
runtime framing/admission is S9/P1 work, not established by this library seam.

The [cache](../../crates/layerfs-workspace/src/base/cache.rs) keys immutable object IDs,
never a mutable path/serial. Bounded standard maps track values and recency; there
is no authoritative namespace mirror. An object larger than the cache allowance
bypasses retention and stays readable. Cache hits check remaining demand allowance
before cloning. Charges include canonical bytes plus 256 bytes of bookkeeping per
entry; this is logical cache admission, not measured RSS or exact allocator bytes.
The source, result window, cache copies and operation-owned FileView have separate
lifetimes and costs. Demand count is <=4096, canonical object <=16 MiB and logical
batch <=32 MiB; continuing operations use further windows.

Root binding performs one object read. Point/list/read cost follows the canonical
trees' visited paths/returned names/demanded extents, with real authentication and
copy work. Cache lookup/recency maintenance is O(log E), where E is admitted cache
entries; total eviction work charges evicted entries and copied bytes. Metadata
currently classifies regular-file roots to derive length; small whole-file roots
can require their payload. P5's cheap runtime length lookup remains open. No cold
latency, native buffer or aggregate resident-bound claim is made.

The external [tests](../../crates/layerfs-workspace/tests/base.rs) build actual
file/attribute/symlink/filesystem objects through public constructors, including
regular-file aliases and `.git`, ignored dependency/cache/output paths. They check
single-object binding, pagination, maximum portable timestamps, sticky directory
mode, EOF, missing-path distinctions, exact cache identity/eviction and a retained
read across a newly constructed root. This is small deterministic correctness
coverage, not the full development fixture or real authenticated Store/runtime.

The previous excluded Workspace implementation was temporarily preserved at
`core/crates/layerfs-workspace-legacy/`, as allowed by the implementation plan,
with unchanged source bytes and a renamed package manifest. It was excluded and
supplied no active dependency, include or fallback. R7-retire removed that
directory on 2026-10-10 as retirement, 26,835 production lines, after its
[coverage audit](../issues/307/checks/r7-retire-20261010/16-layerfs-workspace-legacy.md)
and by owner authorization; its last source is at `eeeffb6b5`. Its private page
backing was already removed from the product by owner requirement. Its pinned
read-only views have no active replacement: 303/08 O-10 is deferred, and a
kept feature needs a new design on the SQLite overlay. Root `crates/` remains
independently retained until its own qualified retirement.

The same checkpoint corrects the initial overlay metadata schema to version 2:
separate signed seconds plus nanoseconds preserve the canonical timestamp range,
and kind-checked modes preserve directory sticky bits. There is no disposable
database reopen/migration API; startup creates fresh state and reads back schema
identity. Exact nested rollback errors are preserved in uncertain custody.

Remaining: base/overlay merge, mutable operations, install/read leases, orphan/
failure composition, fair service/reclamation, authenticated runtime and canonical
Commit construction, actual mounted daemon/Exec and required qualification.

## Prepared install checkpoint (#307)

The S3 slice after `8e2976e4e` adds a scope-checked prepared next base and a
paired one-attempt engine/Workspace binding transition. `Workspace::base()` now
returns a retained BaseView through WorkspaceResult, releasing the binding lock
before content I/O. Old plans survive actual install; refusal returns original
error plus prepared custody. See [prepared install](27-prepared-base-install.md)
and [S3 exit audit](../issues/307/S3-EXIT-AUDIT.md). Effective namespace merge and
P5 stat/runtime integration remain unfinished; the earlier source pins are unchanged.

## S3 completion reconciliation

The completion after `bdc6ed4af` adds effective source-qualified read/ordered-name
composition, actual paired actor install, original unattempted-command custody and
owning SDK stat lengths. See [effective base view](29-effective-base-view.md) and
[S3 exit audit](../issues/307/S3-EXIT-AUDIT.md). Earlier limitations/evidence above
retain their source scope; native/logical runtime transport, mutable byte semantics
and aggregate resource acceptance remain unfinished.

## Immutable stat inode reuse (#319)

`BaseView::stat_with_lengths` resolves the inode-table path once, then passes
that exact immutable inode value's metadata root and kind to the existing
public typed attribute reader. It retains all portable mode/mtime validation
and the explicit owning file-length port; symlink and directory handling stay
on the same current Content interfaces. It does not re-resolve the serial solely
to read metadata, retain a metadata mirror, or raise cache admission bounds.
The external eight-inode count diagnostic observes nine canonical lookups per
resident regular-file stat rather than ten, with unchanged metadata, length,
misses, upstream demands and remembered-length count. This is an operation-work
count, not a cold-latency or SQLite performance claim.

Named base facts now retain the Resolved child that the existing public child
lookup authenticated, and pass that value to the private stat implementation.
Portable metadata and owning lengths still use their existing ports. Symlink
stat uses the same kind-checked SymlinkTarget decoder on the already resolved
content root, preserving no-follow and target framing/limits. Serial-only stat
resolves once and delegates. An external zero-cache named-file count is13 ->11
canonical acquisitions, with one owning length call; named symlink15 ->12.
No owner-job, SQLite, cold-latency, memory-residency or benchmark claim follows
from these source counts. No public API or cache admission changes.

## Lookups start at the retained root (#320)

`BaseView` keeps the filesystem root it decoded and checked at `open`. Its
`inode`, `child`, `list`, `readlink` and child-directory count now start at
that root's inode table with the same public Content readers
(`inode::lookup`, `inode::lookup_many`, `directory::read::lookup_counted`,
`list_after`) instead of building a `FilesystemRead`, which acquired and
decoded the root object again on every call. The root is immutable and named
by its identity, so the answers are the same. One base lookup makes one fewer
cache acquisition: on the eight-inode fixture inode 2 to 1, child 4 to 3,
stat of a file 9 to 8, stat of a symlink 10 to 9, readlink 3 to 2, list 3 to
2, and a named file with no cache 11 to 10 canonical objects. Objects asked of
the Store, bytes, lengths and bounds are unchanged. A memory-only client no
longer needs the root object itself resident to answer from resident pages.
The root object is no longer touched by lookups, so it ages like any other
entry; `open` and a rebind still acquire it. These are counts on the host,
not a timing or mounted claim.

## Portable mode and mtime are remembered by metadata root (#320)

A base stat needs the portable mode and mtime of the inode's metadata root.
The canonical format stores each of the two as a small file of its own, so
decoding them acquires seven objects: the attribute page, then a file state,
a mapping leaf and a payload for each value. The answer is a pure function of
the immutable metadata root and the inode kind it was checked against.
`CanonicalClient::portable` therefore remembers the decoded, checked answer in
the shared cache owner under exactly that root and kind, as a file length is
already remembered under its content root: charged 272 bytes to the same
allowance, evicted in the same least-recently-used order, shared by every
Workspace of the daemon, never keyed by path, branch or Workspace. The first
stat reads and authenticates the same seven objects as before; a failed read
remembers nothing; an evicted answer costs the same reads again. With an
allowance too small for one entry nothing is remembered. A hit grants no
authority: the caller still needs its own authenticated inode value to name
the root. `ClientWork` reports the entries held (`portable_metadata`) and the
decodes made (`portable_metadata_reads`). Resident stat of a file on the
eight-inode fixture: 8 acquisitions to 1; of a symlink 9 to 2. Objects asked
of the Store on first touch are unchanged. Each remembered answer adds its
272-byte charge, so a full cache evicts somewhat more: see the measured
counts in [issue 320](../issues/320/SHARED-CACHE.md). Host counts, not a
timing or mounted claim.
