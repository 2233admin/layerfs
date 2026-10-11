# Reference pieces: implementation plan

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Draft for owner review, 2026-10-11, for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). Source read at
`79ffe99a0`. Phase 1 is implemented at `707a7c675` (section 13 and the
[ledger](PROGRESS.md)); phases 2 and 3 are not. It follows the
[rules and guidelines](PIECE-STRUCTURE-GUIDELINES.md), the
[cache inventory](CACHE-INVENTORY.md) and the
[requirements note](LOCALIZED-EDIT-REQUIREMENTS.md).

What is established and what is not:

| Kind | Content |
| --- | --- |
| Measured | The edit-engine counts in section 4.3 (one external test, in-memory providers) and the benchmark receipts cited in section 11 (single diagnostic samples) |
| Read from source | Every statement about current behaviour; file and line evidence is in the four study reports summarised here |
| Proposed | Everything else. Expected gains are estimates and are labelled so |

Every part is split into **exec** (the command phase: WRITE, READ and SETATTR
requests) and **Commit**.

## 1. Summary

A file range in the overlay gains a fourth kind, the **reference piece**: a row
that says "these bytes are committed content of this file, starting at source
offset S". It holds no bytes.

- **Exec.** While a WRITE request is still in its own request task, a
  recognizer checks whether the incoming bytes are chunks the committed file
  already has. Matching bytes become a reference piece; all other bytes are
  stored as cells exactly as today.
- **Commit.** Captured pieces become a short edit script (`insert`, `delete`,
  `replace`) for the existing Content edit engine, which rebuilds one path of
  the file tree and reuses every untouched subtree by id.

Result for a command that rewrites unchanged bytes: overlay storage and Commit
work stop depending on file size. Exec stays proportional to the bytes the
program submits, with less work per byte (section 6.4).

### 1.1 What is localized and what is not

A 4 KiB insert into a 500 MiB file, three ways:

| | What crosses the mount | Overlay holds | Commit |
| --- | --- | --- | --- |
| SDK range edit (removed 2026-09-26) | 1 request, 4 KiB | 4 KiB | splice |
| Ordinary program, today | about 8,000 requests, 500 MiB | 268 MB | reads back 250 MiB |
| Ordinary program, this plan | about 8,000 requests, 500 MiB | 4 KiB and one row | splice |

The removed routes delivered the instruction ("insert here"). An ordinary
program can only deliver the result: the file interface has bytes at numbered
positions and no insert call, so the program reads the tail and writes it back
at the new positions, one buffer at a time (250 MiB in 64 KiB steps is 4,000
reads and 4,000 writes). This plan lets LayerFS work the instruction out from
the result. It makes the last two columns independent of file size. The first
column is the program's own work and stays.

Where this matters: large files rewritten with mostly unchanged content. A
typical save of a small source file rewrites the whole file in one or two
requests, and files below the whole-file threshold (128 KiB by default) are one
object with nothing to splice. Those cases gain nothing and need nothing.

## 2. Architecture

```
EXEC                                                          one WRITE request
┌─────────┐ write() ┌────────────┐ WRITE ┌───────────────────────────────────┐
│ program │────────▶│ kernel FUSE│──────▶│ request task (not the SQL writer) │
└─────────┘         └────────────┘       │  recognizer:                      │
                                         │   1 next chunk id + length  ◀─────┼── tree pages
                                         │   2 hash incoming bytes           │   (object cache)
                                         │   3 equal id → claim              │
                                         └──────────────┬────────────────────┘
                                          bytes + claims│
                                         ┌──────────────▼────────────────────┐
                                         │ overlay writer job (short)        │
                                         │  claimed range → extend one piece │
                                         │  other bytes   → cells, as today  │
                                         └──────────────┬────────────────────┘
                                                        ▼
                              overlay.sqlite:  payload (cells) + payload_reference (pieces)

  READ: compose cells over pieces over lower layers; a piece range is read from
        committed content at its source offset, through the shared object cache.

COMMIT                                                         one captured file
  captured reader ──▶ steps: Window | Gap | Reference
        │
        ▼
  script: one forward pass  ──▶  Edit::insert / delete / replace   (few records)
        │
        ▼
  Content edit engine (unchanged) ──▶ new chunk(s) + one tree path ──▶ Save
        untouched subtrees are named by id, never read, never offered
```

### Demonstration: insert 4 KiB at the middle of a 500 MiB file

The writer is the benchmark's ordinary program: it moves the second half 4 KiB
later in 64 KiB `pread`/`pwrite` pairs, then writes the 4 KiB.

| Step | Exec | Overlay after the step |
| --- | --- | --- |
| 1 | Writes carrying moved bytes arrive. The recognizer finds a chunk boundary, hashes the next chunk-length bytes, and the id equals the next chunk of the committed tree. | One piece: "from file offset F, committed bytes from S" |
| 2 | Each further write continues the same run. The tail of a request that ends inside a chunk is stored as cells and remembered; the next request completes the chunk and the piece is extended over those cells. | Still one piece, now longer; at most one chunk of cells in flight |
| 3 | The 4 KiB of new bytes match nothing. | One 4 KiB cell row beside the piece |
| 4 | — | About 4 KiB to one chunk of cells and one piece, where today it holds 268 MB |

| Step | Commit | Work |
| --- | --- | --- |
| 5 | The captured reader returns: inherited to the middle, 4 KiB local, one reference to the end. | 3 steps, where today it is about 8,000 windows |
| 6 | The script is `Edit::insert(middle, 4096)`. | 1 record |
| 7 | The edit engine splices. Measured at 512 MiB: reads 7 small objects (about 26 KiB), offers 9 (about 30 KiB), reads no file bytes. | Independent of file size except tree height |

## 3. Exec design

### 3.1 Recognizer

It runs in the request task before the first overlay visit, behind one new
request port. The claim "these bytes equal committed content at S" depends
only on immutable content and the request's own bytes, so it needs no overlay
state and does not hold the single SQL writer.

- **Gate.** No work unless the file has a committed, chunked base (at least
  the Store's whole-file threshold, 128 KiB by default) and the write is at
  least one minimum chunk (8 KiB) or continues an active run.
- **Continue.** The committed tree gives the next extent's chunk id and
  length `L`. The recognizer hashes the next `L` incoming bytes with Content's
  chunk identity and compares ids. Equal: the claim grows by `L`.
- **Search.** With no active run it scans incoming bytes for content-defined
  cut candidates, then tries the next few committed extents whose length fits
  between candidates. It stops after a fixed number of unmatched bytes per
  file, so new content pays a bounded cost.
- **Carry.** A request usually ends inside a chunk. Those bytes are published
  as cells by this request and kept in the recognizer slot. The next
  sequential request completes the chunk; the writer job then extends the
  piece over those cells, but only if the file's content sequence (3.2) shows
  nothing changed in between.
- **Edges.** A partial chunk at the edge of an edit is compared by bytes
  against at most one fetched chunk. If it is not available the edge stays as
  cells.
- **Misses are safe.** An extent that is a slice of a chunk (left by an
  earlier incremental edit), a non-sequential write, an evicted slot or a
  stale sequence all store bytes as today.

### 3.2 Writer job

The write carries its bytes, the claims and the expected content sequence.

- **Claims are cell-aligned.** A claim is trimmed inward to 4 KiB cell
  boundaries; the ragged edges are stored as cells from the request's own
  bytes. Pieces therefore never share a cell with a validity mask of their own.
- **Cells win inside a layer.** Composition applies a layer's cells first and
  its pieces to what is still undecided. An ordinary write never looks at,
  trims or splits a piece. This keeps small in-place edits on today's path.
- **A claim replaces cells.** Cells of the same layer inside a claimed range
  are deleted in the same transaction, and an older piece in that range is
  trimmed. Bytes are never held twice.
- **Content sequence.** Each write and truncate advances a per-file counter in
  the inode row, which every write already rewrites. A claim over bytes an
  earlier request stored is honoured only when the counter is unchanged.
- **Per-file flag.** The inode row records whether the file has any piece.
  Files without one skip every piece lookup.

### 3.3 Read

`compose_layers` returns, with the bytes it decided, a bounded list of
reference ranges. Pieces are cell-aligned, so a 128 KiB window holds at most
32. Workspace reads each range from committed content at its source offset,
through the same object cache and fair read lanes as inherited reads. A read
past the source's end is an error, never zeros.

### 3.4 Truncate and lifecycle

- Truncate cuts the piece that crosses the new size, deletes pieces that start
  in the boundary cell, and leaves later pieces to the existing shrink epoch.
- Pieces follow the existing paths: generation retirement after install,
  last-owner release, orphan migration, failed-capture fold, terminal reclaim.
- Moving a long piece between layers happens in bounded steps. This is the
  most intricate new code and has no existing analogue.
- Pieces do not survive a daemon restart, because the overlay never does.

## 4. Commit design

### 4.1 Captured step

`captured_run_step` gains `Reference { offset, length, root, source_offset,
next }`. It is emitted when the newest layer that decides the cursor position
does so by a live piece and no newer layer covers it with a cell.

### 4.2 Edit script

One forward pass with constant resident state. `b` is the next unconsumed
offset of the committed file.

```
for each step in file order:
  retained (inherited, or a reference to this file's base with source >= b):
      if bytes are pending or source > b:
          emit Edit::new(start_of_pending, start + (source - b_at_start), pending_len)
      b = source + length
  new bytes (cells, zeros, or a reference that cannot be retained):
      add to pending
at the end: emit the trailing edit if anything is pending or b < base size
```

- Unchanged file: no edit. Insert of `k` at `p`: `Edit::insert(p, k)`. Delete
  of `d` at `p`: `Edit::delete(p, p + d)`.
- Edits are separated by retained bytes and the base cursor only moves
  forward, as the engine requires.
- **Limit.** A reference to another committed root, or one that moves
  backward, cannot be retained. Its bytes are read from committed content and
  fed as new bytes: correct, but linear in those bytes.

### 4.3 Edit engine: measured

The engine is unchanged. One external test
(`core/crates/layerfs-content/tests/edit_shift_scaling.rs`, committed
`f5bfa0afa`) applied single edits through `apply_indexed_edits_view_backed`:

| Edit | Size | Tree pages read | Objects offered | File bytes read | Right-hand leaves reused |
| --- | --- | --- | --- | --- | --- |
| insert 4 KiB, middle | 16 MiB | 4 | 6 | 0 | 2 of 4 |
| insert 4 KiB, middle | 64 MiB | 4 | 6 | 0 | 12 of 14 |
| insert 4 KiB, middle | 256 MiB | 4 | 6 | 0 | 53 of 55 |
| insert 4 KiB, middle | 512 MiB | 6 | 8 | 0 | 107 of 109 |
| delete 4 KiB, middle | 512 MiB | 6 | 7 | 0 | 107 of 109 |
| insert 4 KiB, head | 512 MiB | 3 | 6 | 0 | 215 of 216 |

Each row also reads and emits one file-state object. The step from 256 to
512 MiB is the tree gaining a level. Guideline stop condition 1 is not
triggered.

## 5. Why this is generic

| Requirement | How the design meets it |
| --- | --- |
| Any command, script or program | The only input is WRITE, READ and SETATTR requests. Nothing reads the command, the process or an Exec identity. |
| No ioctl, SDK or cooperation | Recognition uses the bytes of the write itself. The program does nothing special. |
| Any mutation | Every file has the same four range kinds and one read and Commit path. Recognition changes which kind a range gets, never the result. |
| Any position, any file size | Matching follows the committed tree from wherever the bytes line up. No per-case route. |
| Never wrong | A reference is recorded only when chunk ids are equal, or bytes are equal at an edge. Everything else is stored as today. |
| No benchmark-fitting | The benchmark writer is unchanged, and cases that cannot match are measured for regression (section 10). |

What it does not cover in the first phases: content that is new, references to
another file's content (save through a temporary file and rename), and shifts
larger than the search window.

### 5.1 Routes that would shorten exec, and why they are not used

| Route | Why not |
| --- | --- |
| SDK range edit, range-edit ioctl | Only a program written for LayerFS can call them. Removed by owner direction 2026-09-26; ruled out again 2026-10-10. |
| `fallocate` insert-range and collapse-range | Linux 6.12 refuses them for FUSE before they reach the daemon, and ordinary tools do not use them. |
| Reflink clone | FUSE has no support in Linux 6.12. |
| `copy_file_range` | Usable and generic, but only for programs that call it, and the kernel rejects overlapping ranges in one file. It serves copies, not inserts. Planned as a later phase (section 10.1). |
| Kernel writeback caching | Would let writes return at memory speed. The target contract keeps it off. |

## 6. Complexity, space and memory

`N` file size, `S` bytes the command submits, `k` bytes that are new, `R`
pieces of the file, `H` tree height, `c` one chunk (8 to 32 KiB).

### 6.1 Exec time

| Operation | Today | Proposed |
| --- | --- | --- |
| One WRITE of `w` bytes, matched | SQL insert of `w` bytes | hash of `w` bytes + one row update + up to `c` of cells in flight |
| One WRITE, not matched | SQL insert of `w` bytes | the same, plus a bounded scan until the per-file search budget is spent |
| One small in-place WRITE | SQL insert | unchanged: the gate skips recognition |
| One READ of `r` bytes | compose + fetch | compose + up to 32 range fetches |
| Truncate | one boundary row | the same plus one piece cut |
| Whole command | `S` | `S`, smaller constant on writes |

### 6.2 Commit time

| Work | Today | Proposed |
| --- | --- | --- |
| Captured steps | `S / 32 KiB` | cells of new bytes + `R` |
| Bytes read back, chunked, hashed | `S` | `k` + at most `c` per edit edge |
| Objects offered to Save | chunks of `S` | chunks of `k` + `H` tree pages per edit |
| Store read-back of existing chunks | up to `S` | none for reused subtrees |

### 6.3 Space and memory

| Resource | Today | Proposed |
| --- | --- | --- |
| Overlay storage per file | `S` | `k` + `R` rows (under 100 bytes each, estimated) + at most `c` in flight |
| Growth of `R` | — | at most 18 rows per WRITE request, coalescing to one per run |
| Recognizer memory | — | fixed number of slots for the daemon; one slot is at most one chunk (32 KiB) plus upcoming extent ids |
| Per-request scratch | request bytes | the same plus one chunk for hashing |
| Edit records at Commit | one per changed run | one per edit; grows with `R` |

No allowance grows with `N`, `S` or `R`. The slot table is charged to the
daemon, like the existing fixed directory-count table, so many Workspaces
cannot grow it.

### 6.4 The floor on exec

A command that moves `S` bytes makes about `S / 64 KiB` reads and as many
writes before LayerFS can decide anything. Each call must be answered before
the next is made, and no reply can tell the program to stop. So exec is `S` on
any filesystem, ext4 included, and cannot be logarithmic for such a command.
What differs between filesystems is the cost per call.

Layers of the 500 MiB insert, 2.2 to 3.2 s of exec in the samples:

| Layer | Work | Size | Changeable here |
| --- | --- | --- | --- |
| Program and kernel | 8,000 calls; 250 MiB copied in and 250 MiB out | 0.1 to 0.2 s, estimated, on a memory-only filesystem | no |
| FUSE | one round trip per request | a few tenths of a second, estimated | only by fewer or larger requests |
| LayerFS reads | Store fetch, decode, authentication | 0.48 s of Store fetch measured | yes, separate work |
| LayerFS writes | overlay insert per request | 0.35 s measured | yes, this plan |
| Not split by the diagnosis | daemon read work and transport | 1.5 s measured | partly |

Levers on the cost per call:

| Lever | In this plan |
| --- | --- |
| No SQL payload insert for matched bytes | yes |
| Hash at write time, not at Commit | yes |
| Larger requests (fewer READ requests; WRITE count follows the program's buffer) | separate work |
| One reader transaction and one authentication per fetched object | separate work |

Extrapolated to a 100 GiB file with the same insert (nothing was measured above
500 MiB): about 1.6 million requests; exec stays in minutes with or without
this plan; Commit goes from minutes to the in-place level; overlay storage from
about 50 GiB to one row and about one chunk.

Exec is already independent of file size for commands that write only what
changed (overwrite, append, truncate).

## 7. Database tables

Overlay schema `user_version` 32 becomes 33. The file is created fresh at
daemon start, so there is no migration.

```sql
CREATE TABLE payload_reference (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    gen INTEGER NOT NULL CHECK(gen=-1 OR gen>0),
    serial INTEGER NOT NULL CHECK(serial>0),
    file_offset INTEGER NOT NULL CHECK(file_offset>=0 AND file_offset%4096=0),
    length INTEGER NOT NULL CHECK(length>0),
    epoch INTEGER NOT NULL CHECK(epoch>=0),
    source BLOB NOT NULL CHECK(length(source)=32),
    source_offset INTEGER NOT NULL CHECK(source_offset>=0),
    PRIMARY KEY(ns,gen,serial,file_offset)
) STRICT, WITHOUT ROWID;
```

| Change | Purpose |
| --- | --- |
| `payload_reference` | The pieces. One b-tree serves per-file lookup, per-generation retirement and namespace deletion. |
| `inode.referenced` | Sticky flag: this layer of the file has pieces. Files without it skip every piece statement. |
| `inode.sequence` | Content sequence for the carry check (3.2). |
| `maintenance.kind` 12 | Paged deletion of stale pieces. |
| Accounting column and triggers | `reference_rows`, counted like payload rows. |

Why a separate table: every payload statement assumes a row of at most 32 KiB
inside one aligned slot. A long row in `payload` would be invisible to reads
that start past its slot, and a piece cut into slot rows would make rows
proportional to bytes submitted.

Why the source is in the row: the overlay already stores 32-byte roots inline
in three tables. An interning table would add a second lifecycle.

Statements (all keyed on the primary key):

| Statement | Use |
| --- | --- |
| cover | the piece holding byte X: last row with `file_offset <= X` |
| range | pieces starting inside a window, `LIMIT` 33 |
| put, set length, advance start, drop range | extend, cut, trim, delete |

## 8. Use of caches

| Cache | Exec | Commit |
| --- | --- | --- |
| Immutable object cache (8 MiB, shared) | Tree pages for recognition (about 5 KiB per 2.4 MiB of file); chunks for reference reads | Tree pages on the edit path |
| Kernel page cache | Holds what the program wrote; nothing to invalidate | — |
| Store read set | Reference reads and tree pages that are not resident | Edit-path pages |
| Storage per-operation caches | — | A splice fits their bounds |
| Overlay page cache | One piece row updated in place per run | Few captured steps |
| Prepared statements (256) | About 12 new texts; current use must be counted first | — |

Recognition never needs committed file bytes to be cached, in the daemon or
in the kernel. It needs tree pages, and at most one chunk per edit edge. No
cache bound is raised.

## 9. Files and folders

Commit `79ffe99a0`; counter `tools/production_loc.py --files`, `prod` column.
Only files this plan touches are listed, so every subtotal is partial. Tests
live in each package's `tests/` and are not counted.

```
layerfs-content/src/                 [1193]  (partial)
  lib.rs                                42   (re-export the two new entry points)
  file/                              [1081]  (partial)
    view.rs                             87   (open an extent cursor on a committed file)
    cdc/                              [494]  (partial)
      gear.rs                          494   (expose the cut-candidate scan)
    mapping/                          [500]  (partial)
      codec.rs                         306   (chunk identity without building an object)
      mod.rs                            23   (declare extents)
      predecessor.rs                   171   (existing cursor, reused)
      extents.rs                         —   new
  object/                              [70]  (partial)
    id.rs                               70   (streaming identity helper)
```

```
layerfs-overlay/                     [4829]  (partial)
  sql/                                [427]
    accounting.sql                     187   (reference_rows column and triggers)
    schema.sql                         240   (new table, two inode columns, kind 12, version 33)
  src/                               [4402]  (partial)
    lib.rs                              57   (re-export new public types)
    contract/                         [205]  (partial)
      types.rs                         205   (claims on a write; reference ranges on a read)
    database/                         [455]  (partial)
      accounting.rs                    120   (counts and debt)
      startup.rs                       148   (version literal)
      statements.rs                    187   (piece statements; inode columns)
    diagnostics/                      [329]  (partial)
      captured_runs.rs                  47   (plan of the piece seek)
      metrics.rs                       230   (piece counters)
      payload.rs                        52   (piece counters)
    lifetime/                         [421]  (partial)
      composition.rs                   235   (fold moves pieces)
      orphan.rs                        186   (inode columns)
    maintenance/                     [1148]  (partial)
      garbage.rs                       241   (retirement phase, stale pieces)
      mod.rs                            16   (new kind)
      orphan.rs                        394   (retire, reclaim, migrate)
      ready.rs                         250   (kind 12 dispatch)
      reclaim.rs                       247   (one more terminal phase)
      pieces.rs                          —   new
    namespace/                        [794]  (partial)
      compound.rs                      360   (validate and dispatch claims)
      inode.rs                         397   (flag and sequence)
      job_rows.rs                       37   (flag on the job row)
    payload/                          [993]  (partial)
      captured_runs.rs                 244   (piece probes, Reference step)
      captured_types.rs                152   (step variant, probe state)
      layers.rs                        177   (shrink cuts the boundary piece)
      mod.rs                             8   (declarations)
      stream.rs                        412   (claims replace cells; compose applies pieces)
      pieces/                            —   new
        mod.rs                           —   new  (declarations only)
        rows.rs                          —   new  (lookup, put, extend, cut)
        moves.rs                         —   new  (bounded transfer between layers)
        captured.rs                      —   cond.
```

```
layerfs-workspace/src/               [2496]  (partial)
  lib.rs                                64   (re-export new public types)
  base/                               [194]  (partial)
    view.rs                            194   (range read of a committed file by content root)
  construction/                      [1052]  (partial)
    captured/                        [1052]
      context.rs                        84   (accept edits that change length; record version)
      mod.rs                             7   (declare script)
      normalize.rs                     103   (run the script over the whole final length)
      owner.rs                         256   (base client for non-retained references)
      scan.rs                          299   (Reference step; span carries a source offset)
      source.rs                        185   (bytes of a reference that cannot be retained)
      state.rs                         118   (no change expected)
      script.rs                          —   new
  mutation/                           [284]  (partial)
    job.rs                             284   (pass claims to the write plan; charge)
  operations/                         [902]  (partial)
    native_data.rs                     164   (window names reference ranges)
    native_visit.rs                    354   (write input carries claims; charge)
    types.rs                           150   (write operations carry claims)
    file/                             [234]
      mod.rs                             2   (declare recognize)
      read.rs                          162   (resolve a range at its source offset)
      write.rs                          70   (publish pieces with cells)
      recognize.rs                       —   new
```

```
layerfs-daemon/src/                  [2292]  (partial)
  bootstrap.rs                         114   (slot count, only if configured)
  application/                        [453]  (partial)
    owner.rs                           238   (slot count, only if configured)
    diagnostics/                      [215]  (partial)
      resources.rs                     215   (recognizer counts)
  overlay/                            [970]  (partial)
    commands.rs                        830   (reply charge; 857 physical lines, split before adding a variant)
    native_job.rs                      140   (charges of the write and read visits)
  service/                            [372]  (partial)
    filesystem_port.rs                 372   (recognize port; no SQL)
  store/                              [383]  (partial)
    mod.rs                              24   (declare recognizer)
    open.rs                            119   (Store owns the fixed slots)
    ports.rs                           240   (one operation reaches the slots)
    recognizer.rs                        —   new
```

```
layerfs-fuse/src/                     [485]  (partial)
  ports.rs                             170   (one new request port)
  operations/                         [315]  (partial)
    mutation.rs                        239   (recognition before the first overlay visit)
    read.rs                             76   (a window with reference ranges needs the base)
```

New files and what each owns:

| New file | Crate | Responsibility |
| --- | --- | --- |
| `file/mapping/extents.rs` | content | Public cursor over a committed file's chunks: id, length, whether it is a whole chunk |
| `payload/pieces/rows.rs` | overlay | The piece row: lookup, put, extend, cut |
| `payload/pieces/moves.rs` | overlay | Moving a piece between layers in bounded steps |
| `payload/pieces/captured.rs` (conditional) | overlay | Only if the captured-reader logic does not fit in `captured_runs.rs` |
| `maintenance/pieces.rs` | overlay | Paged deletion of pieces during retirement and cleanup |
| `construction/captured/script.rs` | workspace | Captured steps to the edit script at Commit |
| `operations/file/recognize.rs` | workspace | The recognizer: gate, continue, search, carry |
| `store/recognizer.rs` | daemon | The fixed table of recognizer slots, shared by all Workspaces |

Why there is no single folder for the feature: the table belongs to the crate
that owns SQL (overlay), the chunk cursor to the crate that owns the tree
format (content), the recognizer and script to the crate allowed to combine
the two (workspace), and the slots to the crate that sees every Workspace
(daemon). The recognizer and the script stay apart inside workspace because
one is exec and the other is Commit.

Three overlay tests assert the schema version and change to 33.
Architecture documents 19, 25, 31, 48 and 55 change with the source.

## 10. Phases and evidence

| Phase | Builds | Evidence before the next phase |
| --- | --- | --- |
| 0 | Nothing in product. Throughput of chunk hashing and cut scanning on this host; count of prepared statements in use | Numbers recorded; owner decisions recorded in section 12 |
| 1 | Table, statements, read path, truncate, full lifecycle, Reference step, edit script. Pieces are created only by tests through the public overlay API | Byte-exact read-back for every piece shape across capture, Commit and remount; Commit counts at two file sizes; query plans and a runtime database profile |
| 2 | Recognizer without carry: whole chunks inside one request | The seven 500 MiB cases and the regression set below, one sample each; exec and Commit reported separately |
| 3 | Carry across requests with the content sequence; byte-compared edges | Overlay bytes and Commit counts independent of file size at two sizes |
| Later | References to another file's content, then `copy_file_range` (10.1); larger requests; read-path constants | Separate plans |

Regression set (guideline rule V-4): 4 KiB overwrite, append, truncate,
random-offset writes, a new 500 MiB file, a dense rewrite with new bytes, and
a many-small-files case.

### 10.1 Later phase: `copy_file_range`

A standard system call: "copy N bytes from file A at X to file B at Y". GNU
`cp` and the Rust and Go standard-library file copies issue it; the mount
refuses it today, so they fall back to read and write.

- It states the fact the recognizer otherwise derives by hashing. A source
  range that is committed content becomes a reference piece in the
  destination; a source range of uncommitted cells is copied as cells.
- The call may copy fewer bytes than asked, so each request stays bounded.
- It uses the same table, read path and lifecycle. Commit of the destination
  needs the cross-file entry point in Content, which is why this follows that
  phase.
- It makes copies independent of size in exec. It does not help insert, delete
  or prepend inside one file.

### 10.2 Tests and benchmark families for the implementing agent

Tests are external, in each package's `tests/`. Every test command stops at
120 s; build with `--no-run` first.

| Phase | Package | Tests to add or extend |
| --- | --- | --- |
| 1 | content | `edit_shift_scaling` (exists, `f5bfa0afa`); the extent cursor; chunk identity equals the tree's id |
| 1 | overlay | Piece rows in every shape; cells win over pieces in one layer; truncate and regrow in the boundary cell; four layers; Reference step equals the payload pass (extend `captured_runs`); retirement after install, unlink while open, failed-capture fold, close; bounded reclaim steps (as `reclaim_cost`); query plans |
| 1 | workspace | Edit script, table-driven: unchanged, insert, delete, replace, several edits, backward reference, other root; end to end in `captured_file_edits`: pieces written through the overlay API, Commit, remount, byte compare, counts at two sizes |
| 2 | workspace, daemon | Recognizer: gate, continue, search, search budget; slice extents and whole-file bases miss safely; slot eviction |
| 2 | mounted proof | The shift writer through the mount; one process started outside the Exec API |
| 3 | workspace, daemon | Carry with the content sequence; an interleaved second writer; two opens; mapped writes; append mode; non-sequential rewrite |

Benchmark families, one sample per case and identity, exec and Commit reported
separately, counts as the evidence:

| Role | Family and cases | What to look for |
| --- | --- | --- |
| Target | `edit_length_changing`: insert-middle, delete-middle, prepend-head, replace-grow, replace-shrink at 1, 10, 100 and 500 MiB | Overlay bytes and Commit jobs no longer grow with file size; requests unchanged; proof status reported as observed |
| Target, expected to stay failing | `edit_length_changing_capped`: the three shift cases | Whether the 2 s stop still fires in exec |
| Must not regress | `edit_length_preserving`; `edit_canonical_chunk_count`; append, truncate and zero-extend in `edit_length_changing` | Same counts as before |
| Must not regress, new content | `payload_create_read` create cases; `workspace_change_locality` dense-rewrite; `tiny_file_churn` bulk-create | Cost of the bounded search on bytes that never match |
| Must not regress, many Commits | `dedup_branch_history` hotset and recurring at 100 steps; `small_file_delta_smoke` | Pieces across a base advance; whole small files |
| Watch | `file_size_transition`; `git_tool_workflow`; `mixed_load_bearing` | The 128 KiB gate; saves through rename; mixed cycles |
| Later phase | `dedup_workspace_reuse` exact and local | Cross-file references |
| Not needed for this work | `init_namespace`, `namespace_mutation`, `directory_construction_traversal`, `historical_access`, `store_footprint` | — |

Known obstacles at `79ffe99a0`: the daemon target `e2_startup_receipts` does
not compile (a moved harness path), and the two tests of overlay
`close_custody` share one temporary directory and fail intermittently. Neither
was verified at the parent of this branch.

### 10.3 Iteration procedure

Four tiers, narrow and fast first. The benchmark subsets are fixed here so
they are not chosen after seeing results.

**Tier 1, every change.** Only the tests of the crate being edited:

| Crate | Tests |
| --- | --- |
| content | `edit_shift_scaling` at its small sizes |
| overlay | `captured_runs` and the new piece-row test file |
| workspace | `captured_file_edits` and the new edit-script test |

In phase 1 this is the whole loop: no recognizer exists, nothing outside tests
creates a piece, and the benchmark cannot show a gain.

**Tier 2, each stage commit.** Nine cases, one sample each:

| Role | Case | Reason |
| --- | --- | --- |
| Target | `insert-middle-4k-on-10mib-ops-1` | Small partner for the size comparison |
| Target | `insert-middle-4k-on-500mib-result-capped-v2-ops-1` | Headline case |
| Target | `prepend-head-4k-on-500mib-result-capped-v2-ops-1` | Whole file shifted |
| Target | `delete-middle-4k-on-500mib-ops-1` | Forward shift must be found |
| Regression | `overwrite-middle-4k-on-500mib-ops-1` | In-place edit stays on today's path |
| Regression | `append-tail-4k-on-500mib-result-capped-v2-ops-1` | The same for a length change |
| Regression | `payload-create-500m` | New content |
| Regression | `workspace-dense-rewrite-100-mixed-v4` | Existing files overwritten with new bytes: search without a match |
| Regression | `tiny-bulk-create-100-mixed-v3` | Many small files |

- Before the first run: take a control sample of the nine cases on branch
  `issue316-fsb-rescue` (based at `2590a4536`) before any piece code exists.
  All nine are registered as `ported` there (checked 2026-10-11), as are the
  four edit families of tier 3. `file_size_transition`, `git_tool_workflow`,
  `dedup_branch_history` and `mixed_load_bearing` are `pending` at that base
  and are not run from it.
- End of phase 1: run once; counts must equal the control.
- Phases 2 and 3: run at every stage commit.
- Compare in this order: overlay bytes of the target cases; Commit writer jobs
  and statements; request counts, which must not change; exec and Commit time
  as diagnostic only. Samples of identical code gave 4.9 to 8.2 s of Commit
  for `payload-create-500m`, so a timing difference under about a third means
  little from one sample.
- The 10 MiB and 500 MiB insert pair shows independence from file size:
  overlay bytes and Commit jobs should be nearly equal for both.

**Tier 3, end of phases 2 and 3.** Every case of `edit_length_changing`,
`edit_length_preserving`, `edit_canonical_chunk_count` and
`edit_length_changing_capped`: 61 cases, one sample each.

**Tier 4, hand-back only.** The other runnable families in 10.2, full package
tests, warning-denying Clippy, formatting, the boundary guard and the mounted
proofs.

Two rules for the loop:

- One sample per case per commit. A surprising result is diagnosed from its
  counts, not sampled again.
- A regression in tier 2 caused by the recognizer is a stop (guideline stop
  condition 3), not a tuning target.

## 11. Benchmark coverage

Classification of all 273 fs-bench-pro cases against this plan. 174 have
results; 99 are not yet ported
([#317](https://github.com/Ephemeral-AI-Lab/layerfs/issues/317)).

| Class | Cases | Share of measured Commit time | Examples |
| --- | --- | --- | --- |
| Commit helped | 23 | 21% | insert, delete, prepend, replace-grow, replace-shrink at 1 to 500 MiB |
| Partly helped | 6 | 13% | mixed development cycles (one insert and one delete per cycle) |
| Already fast | 69 | 6% | in-place overwrite, append, truncate, clean Commit |
| New content, not helped | 22 | 42% | new 500 MiB file, bulk create, dense rewrite |
| Namespace or metadata, not helped | 130 | 18% | create, unlink, rename, scans, git, Init |
| Unknown | 23 | under 1% | whole-file rewrites from outside the mount; unported families |

Effect on the 34 current failures:

| Failures | Cause | Effect of this plan |
| --- | --- | --- |
| 20 length-changing edits | Retention guard: original chunk ids lost after the edit point | Plausibly cleared, because a splice keeps the original chunks. Not proven; depends on how the guard is judged |
| 3 capped 500 MiB edits | 2 s limit on edit + Commit + unmount | Not cleared. The command phase alone is 2.2 s or more, and this plan does not shorten the program's own I/O |
| 5 history schedules at 500 steps | 120 s outer limit; fixed cost per step | None |
| 6 mixed and boundary cases | Oracle and helper inconsistencies; one failed preparation | None |

Costs this plan does not address, which need their own work:

- **New-content Commit.** 8.2 s for a new 500 MiB file, 11.5 s for the dense
  rewrite. This is the largest share of Commit time in the suite.
- **Many small files.** 25,000 one-byte files: 15.2 s exec, 9.0 s Commit,
  1.46 million writer jobs.
- **Exec read and lookup cost.** Content scan 5.3 s; git workflow 9.9 s; the
  shift cases' own 2.2 to 7.2 s of exec.
- **Fixed cost per Commit step** in the history schedules.

Estimated gain if the 20 measured "Commit helped" cases reach the in-place
Commit level: about 20 s, 7% of measured wall time across the suite, and about
2 GB less overlay data. Their 24.6 s of exec stays.

## 12. Owner decisions and open points

Owner, 2026-10-11, on the recommendations listed that day: "update as what you
suggested, i trust you". Recorded in the
[guidelines](PIECE-STRUCTURE-GUIDELINES.md), section 6.

| # | Decision | Outcome |
| --- | --- | --- |
| 1 | Equal chunk ids, without a byte compare, may create a reference | Accepted |
| 2 | No Store pin; committed content is not deleted today | Accepted for now; a future collector must account for pieces |
| 3 | First phases: the file's own committed content, moving forward | Accepted |
| 4 | An edit is judged by the bytes the command submits | Accepted |
| 5 | Proceed, with a parallel investigation of new-content Commit | Accepted |
| 6 | How the retention guard is judged for the 20 failing shift cases | Open until phase 2 results exist |
| 7 | Whether the 2 s limit on the three capped cases stays | Open; those cases are limited by exec |

Risks carried into the phases:

- **Search cost on new content.** The bounded scan is extra exec work for
  files that will never match. Phase 2 measures it; guideline stop condition 3
  applies.
- **Extents that are slices.** Files edited incrementally keep slice extents
  that the id compare cannot match. Each earlier edit point is a permanent
  miss of up to one chunk.
- **Piece moves between layers.** New bounded-step code with no analogue.
- **Read fan-out.** A window can need up to 32 range reads where today it
  needs one.
- **Write ordering under credit pressure** is not first-in first-out. The
  cost is a missed match.

## 13. Implementation record

Added by the implementing agent. Sections 1 to 12 keep the text the owner
reviewed; this section records where the source differs. Each item is decided
by agent, pending owner review, and is described in the [ledger](PROGRESS.md).

Phase 1, at `707a7c675`:

| Section | Plan | Source |
| --- | --- | --- |
| 3.3 | A read returns reference ranges | The ranges, at most 33 a window, and one bit per byte that a piece supplies |
| 3.4 | Truncate deletes pieces that start in the boundary cell | Truncate cuts the crossing piece to the new size; later pieces go stale through the shrink step and are deleted by maintenance kind 12 |
| 3.2 | A per-file counter is the content sequence | The Workspace revision of the row's last publication |
| 4.2 | A reference is retained when it starts at or after the base cursor | A span partly behind the cursor is split; the part at or after it is retained |
| 4.2 | One script for every captured file | A file without pieces keeps its earlier two-edit form; sealed context version 2 says which |
| 9 | `payload/pieces/captured.rs` conditional | Created: the piece-aware unit is a second decision order |
| 9 | `payload/runs.rs` not listed | Touched: the row transfer it owns must not move cells over a live upper piece |
| 9 | `mapping/predecessor.rs` reused | Refactored onto the walk it now shares with `extents.rs` |
| 9 | `extents.rs` reports whether an extent is a whole chunk | It reports the offset inside the chunk; only equal identity proves a whole chunk |
| 9 | `layerfs-fuse` `operations/read.rs` changes | No change needed: a window with reference ranges already takes the base like an inherited byte |
| 9 | Not listed | Also touched, each by a few lines: overlay `database/connection.rs`; workspace `operations/namespace/create.rs`, `remove.rs` and `rename.rs` (the new inode fields) and three declaration files |
| 9 | `diagnostics/metrics.rs` and `payload.rs` gain piece counters; daemon `native_job.rs` charges | Not touched: the row count is `accounting.reference_rows` and the plans are in `diagnostics/captured_runs.rs`; the charges are in `commands.rs` and the Workspace visit |
| 8 | About 12 new statement texts | 15; 239 of 256 in use (static count) |

Phase 2, first recognizer step (gate, follow and search, no carry):

| Section | Plan | Source |
| --- | --- | --- |
| 3.1 | One new request port | `recognize(serial, offset, bytes)` returns the bytes, with claims; one call in `mutation.rs` before the visit loop |
| 3.1 | Gate: a write of one minimum chunk "or continues an active run" | Without carry a shorter write holds no whole chunk and is never examined. A committed length below the smallest whole-file threshold decides the gate without reading the content root |
| 3.1 | Continue: the next extent after the claim | The committed extents that fall inside the request under the known shift, wherever the request lies; two consecutive differing chunks end the run |
| 3.1 | Search: "the next few committed extents whose length fits between candidates" | 64 extents from after the last claim, or from 512 KiB before the written offset; the first 64 KiB of the request; a chunk cut at the maximum size is not searched for; at most 8 identities; one search a request, and none once the known shift matched in it |
| 3.1 | Stops after a fixed number of unmatched bytes per file | 1 MiB of consecutive requests without a claim, for as long as the file's slot lives |
| 3.1 | Not stated | A new shift must keep the source moving forward after the last claim (rule C-11); a Store-backed pass uses demand custody of its own, so its failure is a miss |
| 9 | `diagnostics/resources.rs` gains recognizer counts | Not touched: `Store::recognizer_work` reports them; the diagnostic record format the harness reads is unchanged |
| 9 | `bootstrap.rs`, `application/owner.rs`: slot count if configured | Not touched: the count is the constant 64 |
| 9 | `overlay/commands.rs` split before a new variant; `native_job.rs` charges | Not touched: the port submits no owner job, so no variant was added |
| 9 | `store/ports.rs`: one operation reaches the slots | Also `StorePorts::fresh`, the separate failure scope of a pass |
| 9 | `layerfs-fuse` `operations/read.rs` | Unchanged, as in phase 1 |
