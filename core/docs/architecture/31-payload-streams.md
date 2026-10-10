# Payload layers and canonical zero runs

> **Status:** Current general guide. Implemented S5 work after `f5558fc22`;
> release, native FUSE and integrated Commit qualification remain separate.

R7 update, 2026-10-09 (schema 26): a payload row may hold several whole
cells, up to 32 KiB inside one aligned slot. Whole cells of a write become
or overwrite such rows, a shrink cuts the row that holds its boundary, and
the statement counts and page figures below describe one cell per row. The
current rules and numbers are in
[the daemon overlay note](19-daemon-overlay.md).

Issue 316 update, 2026-10-11 (source `8c1993f4a`): the read job copies a dense
row over bytes no higher layer decided as one slice, and marks a wholly
inherited window with one fill. Workspace moves inherited bytes into a window
one run at a time. The composed bytes and the inherited bitmap are unchanged.

Issue 316 update, 2026-10-11 (Workspace read of reference ranges): the
composed read copies, after the inherited range, the bytes of each reference
range of the plan from the committed content the range names, at its source
offset ([`BaseView::content`](../../crates/layerfs-workspace/src/base/view.rs):
one authenticated root object, then the same bounded range read, through the
operation's client and so the same object cache and read lanes as an
inherited read). Ranges never overlap; only bytes whose `referenced` bit is
set are copied from a range. Consecutive ranges of one source
share one opened root. A range beyond the end of its source is an error,
never zeros. A native window with a reference range is not answered from the
visit: it needs the base like an inherited byte. Read replies are charged for
the mask and the ranges (`reference_bytes`: one bit a byte and one range a
cell). `Operation::Write` carries claims
with its bytes (`WriteData::claimed`); a write that resolves its own offset
(append) or is clipped (mapped store) drops them. No request path supplies a
claim in this phase.

Issue 316 update, 2026-10-11 (overlay schema 33): reference pieces.
A compound job's write may carry claims: ranges of its window whose bytes the
caller established to equal committed content of one immutable root
(`Changes::claims`, at most 18 ranges, in file order, none overlapping). The
engine trusts a claim and verifies only its shape.
[Piece rows](../../crates/layerfs-overlay/src/payload/pieces/rows.rs) own the
rules:

- **Whole cells only.** A claimed range is trimmed inward to cell boundaries.
  Its whole cells become one row of `payload_reference`; its ragged edges and
  every unclaimed byte of the window are stored as cells, as an unclaimed
  write stores them.
- **A claim replaces cells.** Cells of the same layer inside the claimed cells
  are deleted in the same transaction, and a live wide row that crosses an
  edge keeps its cells outside. An older piece gives up the range and keeps
  what it names before and after it. No byte is held twice.
- **One row per run.** When the piece that ends at the claim, or already
  covers its start, names the same source at the matching offset, that row is
  extended. Otherwise a row is inserted.
- **Cells win inside a layer.** An unclaimed write never reads, trims or
  splits a piece. Composition applies a layer's cells, then its live pieces
  to the bytes still undecided, then the cutoff.
- **Rows never overlap, live or stale.** A piece is stale by its first byte
  and its stamp, with the staircase test of a payload row.
- **Shrink.** The piece that crosses the new size is cut to end at it, by one
  statement, and keeps its stamp; later pieces become stale through the same
  staircase step as later cells. This is the one case of a piece that does
  not end on a cell boundary.
- **Earlier bytes.** Only the first range of a job may start before its
  window, by at most 32 KiB: those bytes were stored by an earlier job. That
  part is honoured only when the claim names the row's content sequence, the
  revision of that earlier job's publication, and the row has not been
  written since. Otherwise the claim starts at the window.

A read plan reports pieces as `LocalRead::references` and `referenced`. A
range is a run of a piece's cells, clipped to the window, in which the piece
supplies at least one byte. A piece decides every byte of its cells that
nothing newer decided, so no two ranges share a cell: a window of 128 KiB
holds at most 33. `referenced` is one bit per window byte, in the form of the
inherited mask: set for a byte that the one range holding it supplies, clear
inside a range for a byte a cell decided. A reply therefore grows by one
eighth of the window and at most 33 ranges, never by a byte per byte. Both
are empty for a file without pieces, and then no piece statement runs: the
layer rows carry the flag. The caller reads each range from committed
content at its source offset. The statements are a cover seek (the last row
at or before a byte), a window seek with a literal limit, an insert, a length
update, a range delete that returns its rows, and the shrink cut; each is one
seek of the primary key.

Pieces follow the existing lifecycles of their layer; none is new.

| Path | What happens to pieces | Bound of one step |
| --- | --- | --- |
| Shrink | The crossing piece is cut in the shrink's own job. Maintenance kind 12, queued by a shrink of a layer that holds pieces, deletes the stale ones beyond the boundary | 64 rows read, each stale one deleted |
| Generation retirement after install | A fifth phase deletes the generation's pieces in key order, skipping a layer an orphan still reads | 64 rows |
| Last unlink with no owner; a layer an orphan released | After the layer's cells, its pieces are dropped lowest first | one statement, at most 64 rows |
| Orphan with no owner left | The same for the orphan's own layer | one statement, at most 64 rows |
| Failed capture (fold); orphan migration | After the lower layer's cells have moved, its pieces move into the layer above, [one fragment a step](../../crates/layerfs-overlay/src/payload/pieces/moves.rs) | at most three rows read and three changed |
| Terminal reclaim | [A twelfth table](25-terminal-reclaim.md) | 64 rows, one delete |

A moved fragment is the leading part of the lowest lower piece that the
composed view still reads from it: below both the lower size and the upper
cutoff, and up to the next piece the upper layer holds itself. Bytes an upper
piece already decides, and bytes beyond that limit, are dropped from the lower
piece, never copied. The step's work does not depend on the length of a piece.
A lower payload row is no longer moved or merged over cells that a live upper
piece holds: the upper layer decides those bytes first.

One engine-wide flag records whether a piece row was ever written; it is set
before the only insert and restored when a job fails. While it is false the
retirement, orphan and terminal paths issue no piece statement, so an engine
without pieces runs the statements it ran at schema 32.

The selected [payload derivation](../issues/307/S5-PAYLOAD-CONTRACT.md) describes
schema v8. Each live inode generation has a lower-view cutoff, shrink epoch and
indexed shrink staircase. Cells store bytes only through their last valid byte;
NULL validity means every stored byte is valid. A partial cell carries a trimmed
bit mask. [Cell normalization](../../crates/layerfs-overlay/src/payload/cells.rs),
[layers/shrink](../../crates/layerfs-overlay/src/payload/layers.rs) and
[window operations](../../crates/layerfs-overlay/src/payload/stream.rs) own these rules.

Workspace exposes `Write { serial, position: At|End, data: WriteData }`, size
changes in `SetAttributes`, and `SourceView::read`. Append selects the current
EOF inside the owner job. Data, validity, inode size/mtime and the publication
ticket change in one transaction. Data is a shared owned byte slice, with debug
output limited to its length. One write/read window is at most 128 KiB; larger
files and flows use successive windows. No write copies base payload upward.

A full-cell overwrite is one upsert; each partial edge is one cell seek/merge
and upsert. At most 33 cells intersect a request. Shrink eagerly trims one edge,
lowers the lower-view cutoff, and records one staircase step after a binary
search. It neither deletes nor walks discarded cells. Regrow never resurrects
discarded local or inherited bytes. A hole has no cell rows. Captures preserve
exact sealed bytes/cutoffs; known install replaces the lower view with its exact
canonical equivalent without rewriting later layers.

The read job composes one bounded local window and an inherited-byte bitmap.
Workspace demands one covering canonical range outside SQL, even when thousands
of gaps need base bytes. `cell`/`captured_cell` are raw stored observations;
`source_read`/`captured_read` provide the effective view, including staleness.

Per write, work is O(request bytes + touched cells times indexed key work), plus
O(log shrink height) for stale partial edges. Read costs actual window bytes per
live layer and indexed cell/staircase work. S5 alone does not bound layer depth
across failed captures or reclaim stale cells/abandoned steps; S6 owns both.
S6 now provides [bounded live composition and independent custody](33-independent-custody.md).
Positive zero-reference tombstones prevent fall-through until install; descriptor
writes require exact open authority and use the independent orphan domain.
Symlinks retain one format-bounded target window; [S6 composed readlink](34-name-and-lookup-custody.md)
follows its effective layers and independent lookup/request custody.

`construct_runs`, `FileRuns`, `FileRun` and `RunConstruction` belong to content.
The [zero-run derivation](../issues/307/S5-HOLE-CONTRACT.md) preserves the frozen
32 KiB zero CDC period and existing canonical codecs. A bounded threshold probe
chooses whole-file representation; chunked holes scan a boundary chunk and tail,
then reuse complete chunks and mapping subtrees. The existing unfinished-page
lookahead/final partition produces the same root as ordinary streaming.
Worst-case run work is O(chunk bytes + unfinished capacity times tree height),
with logarithmic height and bounded resident boundary pages. Actual data still
costs its bytes. Source/consumer failures stop the one attempt, and synchronous
child-before-parent acceptance retains downstream backpressure. The consumer
owns accepted canonical objects; storage completion still requires Save finish.

Retained evidence is [S5 checks](../issues/307/checks/s5-payload/). On macOS,
65,536 alternating one-byte writes do not increase a full-window overwrite:
45 statements/2,752 VM steps/36 changed rows, matching an unfragmented file.
Shrink discarding 2 versus 2,048 cells has identical 16 statements. The tiny-file
fixture reports 184 allocated bytes per 100-byte file; dense cells use 1.133
pages per cell. These are shared allocation deltas, not exclusive per-row pages.
A one-byte append replaces at most one 4096-byte cell. Payload bind/copy work is
request bytes plus at most two edge cells, masks and framing. SQLite additionally
copies/buffers pages and rollback journal; exact journal/dirty-byte and aggregate
pager/OS-cache peaks are unavailable through the current safe driver diagnostics
and remain S7 observations, not invented zeros or a bounded-RSS claim.

Complete real-owner profiles include source acquisition/release, every semantic
round, publication, reply-attempt release and the post-observation route seek.
They retain original failed/confounded cases. Reply credits cover the admitted
result; the Workspace port clones a read result before releasing those credits,
and base reads plus caller sinks have separate custody. Native reply/kernel and
aggregate output credits remain S8. P3's resident deferred-edit refusal remains
explicitly assigned to backed S10 editing; S5 does not claim its removal or
integrated sparse Commit acceptance.
