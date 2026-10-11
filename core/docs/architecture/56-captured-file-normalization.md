# Captured final-state file normalization

Terminology update2026-10-07: the current API/SQL names below use overlay
schema16. Earlier algorithm and proof pins retain their original scope; see
[the naming checkpoint](../issues/307/PRE-S8-TERMINOLOGY-20261007.md).

> **Status:** Current general guide. Source implementation after checkpoint
> `71a3a24b8`; fourteen actual-Owner cases pass on host and Linux in the
> [captured-file/reducer checkpoint](../issues/307/CAPTURED-FILE-REDUCER-20261007.md).
> Namespace reduction, release resolution, complete root qualification and
> integrated Commit remain open.

Issue 316 update, 2026-10-11 (source `8c1993f4a`): preparation runs a
[shapes-only cursor](55-captured-sparse-run-cursor.md), so it reads no payload
for dense rows of the newest layer; the construction source still reads each
replacement byte once. Preparation no longer visits bytes beyond the surviving
base (the smaller of the base and final lengths): they are one trailing insert
whatever they hold, and the construction source still refuses an inherited
byte there. A new file therefore has zero normalization steps. A cached
normalized edit is returned without reading the sealed context again; the
context is checked before every read of the records, before the first run of a
new-file stream and before its End. Where the text below says that source
lookup rechecks the sealed context, that now applies to a lookup that reads a
record.

Issue 316 update, 2026-10-11 (reference pieces, overlay schema 33): the final
changes of a file are an
[edit script](../../crates/layerfs-workspace/src/construction/captured/script.rs).
One forward pass with constant state reads the captured spans in file order.
A span is retained when its bytes are bytes of the file's own committed base
at or after the base cursor: inherited bytes, or a `Reference` step (or a
reference range of a window) whose root is that base. Every other span is new
bytes. New bytes wait until the next retained span, which closes them and the
base bytes it skipped into one `Edit::new(start, start + skipped, new)`. An
edit is in the coordinates of the result so far, so its start is its own
offset in the final file, and the construction source reads its replacement
there. The end of the file closes what is pending and removes the base bytes
not consumed.

| Final file | Sealed edits |
| --- | --- |
| A piece equal to the base at its own offset | none; the root is the base root |
| `k` new bytes at `p`, then the base from `p` | `insert(p, k)` |
| The base from `p + d` at `p` | `delete(p, p + d)` |
| Both, apart | one edit each, each at its final offset |
| A reference behind the base cursor, or to another root | an edit that covers it; its bytes are read from committed content |

- **What cannot be retained is read.** A reference to another committed root,
  and the part of a reference or of inherited bytes that lies behind the base
  cursor, are new bytes. The construction source reads them from committed
  content by root and offset through the operation's client and offers them
  as new bytes: correct for any source, and linear in those bytes.
  `CapturedFileWork::committed_bytes` counts them.
- **A file without pieces keeps its edits.** A unit of the cursor says whether
  the file holds pieces (`CapturedRunReply::referenced`). Without them the
  pass stops at the surviving base as before and seals the same records: an
  equal-length overwrite for each changed run and one trailing insert or
  delete. With them it visits the file to its end, because a piece beyond the
  surviving base may name base bytes that no earlier edit consumed (an insert
  longer than the tail it moves).
- **Context version 2.** The sealed context records whether the edits are a
  script. A script edit is checked for a start not after its end, a
  replacement within the final length and a nonempty change; the edits of a
  file without pieces keep their exact checks. Edit records are unchanged.

Issue 319 update, 2026-10-11: ordinary shifted writes can prove whole chunks
while leaving copied chunk fragments and ragged cell edges literal. For a file
with pieces and a larger final size, preparation authenticates bounded edges
of provisional edits that change length or follow a length change. It compares at most two maximum chunks
(64 KiB) at each end against the corresponding immutable base range, retains
exactly equal prefix/suffix bytes, and seals the shortened edit. Comparison
stops at a mismatching byte. The original provisional length deltas translate
final offsets to base offsets; trimming preserves those deltas. Pure inserts,
pure deletes, final-size shrink or no-growth, in-place scripts without a shift
and files without pieces keep
their existing path.

The [edge adapter](../../crates/layerfs-workspace/src/construction/captured/edges.rs)
uses the retained base FileView and independent bounded captured cursors before
the construction source exists. It holds two fixed 64 KiB byte buffers, never a
complete replacement. Longer edits remain valid and stream through Content;
this limit bounds comparison work, not supported edit or file size. Authenticated
base/payload reads and cursor jobs are real preparation work. This is an explicit
exception to the earlier shapes-only payload rule for shifted file edges.
Nothing creates or changes reference pieces during construction, and unchanged
bytes keep their payload identity and source offset through Content's existing
mapping slice/split algorithm. CDC, edit-record encoding and context version
remain unchanged. A read failure ends the same original attempt and retains its
custody; no equality guess, alternate provider or retry is introduced.

`CapturedFileWork::edge_windows` counts successful comparison windows,
`edge_read_bytes` counts logical bytes acquired from both sources, and
`edge_retained_bytes` counts bytes preserved by trimming. These do not claim
physical IO, cache misses, or total operation residency. Successful namespace
construction accumulates those three observations as `file_edge_windows`,
`file_edge_read_bytes` and `file_edge_retained_bytes`; failures retain the file's
own counters and original cause. Captured byte-window calls made here count as
normalization steps, while ordinary construction source calls keep their own
counter. The external daemon `captured_edge_retention` target exercises only
ordinary truncation and recognized writes, compares full live/fresh-root bytes,
and observes exact persisted payload/source mappings including partial chunks.
Its test scope includes unaligned middle insertion, prepend, replace-grow,
changed copied edge bytes and a larger input. Verification outcomes are recorded
in the owning issue ledger rather than inferred from this source description.

The external test `captured_piece_edits` writes pieces through the ordinary
Workspace write with claims, compares the live and the sealed view with the
final bytes, and checks the sealed records, the committed bytes and the
byte-source canonical root for each row above. An insert in the middle seals
one edit with the same 4 normalization steps, 1 source step and 5 rows over a
1 MiB and a 6 MiB base; object reads were 4 and 7. Only tests create a piece
in this phase.

`CapturedFileEdits::prepare(workspace, provider, reader, serial, records_scope)`
selects one regular file in an actual retained capture. It accepts no declared
file root, base length or final length. The Workspace route must equal the exact
reader route and the actual record owner's route before any provider job. The
adapter obtains the Workspace's operation-scoped BaseView outside its lock. If
known install advanced that binding, it rebinds only the retained reader's root
through the same authorized client. A failed/poisoned binding, root/provider
refusal or scope mismatch ends preparation without an alternate provider.

The immutable serial point must resolve under that authenticated filesystem
root and be a regular file. Only `ContentError::PathNotFound` establishes logical
base absence. Missing objects, denied visibility, identity errors, malformed
objects and unavailable cheap-length facts never establish newness. An existing
file keeps one FileView acquired/classified once, checked against the owning
FileLengths fact. The captured local inode supplies the actual final size and
live kind. Its creation generation is checked against this reader's retained
installed floor; a fresh local serial cannot silently replace an immutable one,
and an old local serial cannot use logical absence as a new-file substitute.

## Final changes and bounded records

Preparation consumes one forward CapturedRunCursor under the exact original
reader/root/generation/floor. It retains one pending Window or Gap and scalar
interval state. Continue requires actual private metadata seek advancement,
stable initialized layer identities and nonretreating probes/lookahead through
the owning cursor's progress predicate. A claimed row count alone establishes
no progress; unchanged or restarted continuations refuse without an iteration cap.
Data Vec capacity is checked against 4,096 bytes and inherited Vec capacity
against 512 bytes before a returned Window becomes pending, independently of
their logical lengths. Provider allocation before return remains its own scope.
Window mask bits determine local versus inherited bytes; adjacent
locally decided Data and Zero spans coalesce across cells. Surviving immutable
bytes are overwritten by equal-length final ranges. A size change has one
separate trailing deletion or extension, split at authenticated base EOF.
Chronological writes are never replayed. An inherited span below base EOF remains
retained; inherited positions at/above that EOF are authoritative logical zeros,
including Window mask holes whose underlying data bytes have no authority.

The private raw domains are `0x43460000` for attempt context and `0x43460001` for
numbered edit rows. A Missing-guarded context binds version/sealed state, actual
reader owner/floor/route namespace/generation/revision, file scope, serial,
authenticated filesystem root/scope/profile, file mapping profile, optional
original file root, base/final lengths and exact edit count. None has a separate
presence bit. The local context is neither runtime authority nor a certificate
of root reachability or topology.

Every edit row is 25 bytes: version 1 and three big-endian u64 values for start,
end and replacement length. Keys retain the complete numbered identity in the
first eight bytes of the 32-byte key. Batches contain at most 64 descriptors;
the existing owning record adapter checks actual outer and nested capacities
against its 65,536-byte envelope. Returned raw point Vec capacity also must fit
that existing envelope before context/edit decoding or exposure to the Content
backing adapter. The final context is sealed by an exact-byte guard only after
all records succeed. No complete edit vector, operation records-key scan
or alternate tree algorithm is introduced. Source lookup rechecks the sealed
context, reads an exact numbered row and retains only one edit cache entry.
The caller preserves exclusive/stable ownership of these private records during
the prepared operation; short guarded jobs do not make the entire constructor
one SQL transaction or a snapshot of concurrent caller mutations.

## One consuming construction and original custody

`construct(self, policy, capacities, consumer, scope)` consumes the plan once.
The caller supplies its actual Store-derived policy; there is no default-policy
fallback. Existing files use Content's borrowed FileView/indexed source entrypoint
and the unchanged comparison/canonical edit driver. The fallible replacement
length is an actual indexed fact rather than a zero-on-error declaration. A true
new file uses ordinary `construct_runs` with no fabricated immutable base.

The replacement source keeps forward metadata lookahead when skipping retained
intervals. It may create one new cursor for the planned backwards transition
from comparison to construction. A further backwards pass refuses, and no reset
is permitted after any error. Inherited bytes requested inside a changed range
below immutable EOF refuse; they are not fetched through a second base read.
Source Data/Zero windows preserve the existing Scanner and canonical boundaries.
Localized file roots are compared with the byte EditSource route over independently
expected edit ranges; they are not promised equal to a complete fresh constructor
which chooses new CDC boundaries for all bytes.

One RefCell owner contains the IndexedConstructionRecords used by the sequence,
source and backed edit engine. Borrows last only for their short methods and do
not span a consumer callback. Every method checks the first original adapter or
record failure before another job. A deciding record Completion/unattempted
command remains in record custody; original captured read failures remain in
adapter custody. Content/source/consumer errors preserve their exact typed cause.
Already accepted children remain with the consumer after a later failure, with
no final-root success inference or resend.

Preparation failure returns CapturedFileCustody. A consuming construction returns
CapturedFileAttempt with its result and the same custody. That custody retains
the original reader, operation/file record scope, BaseView/client, classified
FileView when valid, work and first errors. BindingPoisoned before base acquisition
retains no invented BaseView. The client continues to own its underlying runtime
port errors. Drop acquires/releases no reader or operation and runs no cleanup;
the application completes real Save/transport/publication fences before explicit
last-owner release.

Known install and logical close preserve actual captured reads. Mutable indexed
record jobs still require the live Workspace. Preparation after close therefore
retains the original Closed Completion; construction that needs more mutable
edit state also cannot claim success merely because the reader remains valid.

## Work, verification and remaining scope

CapturedFileWork counts actual normalization/source calls, successful returned
metadata/stale rows, exact sealed edits, planned resets and successfully retained
classifications. Failed original SQL work stays in its provider Completion; the
successful-row counters do not declare that failed work zero. Existing record
conversion/reply counters keep their separate domains. Pending byte/mask windows,
FileView canonical bytes, record descriptors and provider/consumer copies are
actual retained storage. These observations describe no whole-operation heap,
pager/OS-cache residency, physical I/O, sustainable rate or eligible debt.

The external Workspace tests use a real OwnerClient and authenticated memory
objects. Independent final-byte models cover overlapping writes, shrink/regrow,
growth, true new files, same-byte no-op, many edits and canonical byte-route
equivalence. A logical zero fixture above 4 GiB compares its expected complete
zero-run root without a file-sized allocation. Retained reads after install/close,
original context/retired-reader/closed/provider/length failures, inherited gap/
window EOF composition, oversized retained window/record capacities, unchanged/
restarted continuations and accepted-child/final-root refusal have focused cases.
The [original host receipt](../issues/307/checks/captured-reducer-20261007/16-captured-workspace-daemon-bodies.json)
retains thirteen captured passes and one failure, plus three passing Daemon cursor
cases. The failed growth/new-file fixture requested a second Capture after reader
release; actual CaptureInFlight correctly refused because release did not resolve
the first capture. The corrected body uses both already-mutated files under the
same reader and operation owner with disjoint file scopes, retains both original
custodies through construction/oracles, then releases each owner once. Only that
failed body reruns in [receipt 18](../issues/307/checks/captured-reducer-20261007/18-shared-frontier-failed-body-corrected.json);
the thirteen unchanged passes are reused. The
[Linux combined receipt](../issues/307/checks/captured-reducer-20261007/22-linux-existing-bodies.json)
records all fourteen captured cases and the three Daemon cursor cases passing.
Original external build failures 07 and 12 also remain in the checkpoint; their
API-path/Timing-wrapper repairs change no product behavior or inner failure custody.

Per-directory typed normalization, grouped validator/addition/graph and alias
state, complete contextual topology/root qualification, one actual Save producer,
conditional history publication, known-install/unknown custody and full native
Commit/Exec/kernel integration remain engineering work. The selected
[P13 reference/touched/zero-release backing](53-backed-filesystem-serial-state.md)
is implemented separately, retaining its rebuilt/released-child refusal and
same-Save capability integration obligations. No E/Q numerical gate or performance
sample follows from these components; all prospective E1 samples retain NOT_RUN
and qualification remains NOT_EVALUATED.
