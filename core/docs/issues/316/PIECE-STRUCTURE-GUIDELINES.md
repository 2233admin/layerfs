# Piece structure: rules and guidelines

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Draft for owner review, 2026-10-10, for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). It fixes the
rules a piece structure must obey before an implementation spec is written.
Nothing here is implemented or measured. It builds on the
[localized-edit requirements note](LOCALIZED-EDIT-REQUIREMENTS.md).

Each rule carries its origin:

- **Owner** — an owner statement, quoted with its date in the requirements note
  or in the repository instructions.
- **Standing** — an existing repository rule in [AGENTS.md](../../../../AGENTS.md)
  or [core/AGENTS.md](../../../AGENTS.md).
- **Proposed** — analysis from this work. PENDING OWNER until accepted.

The implementation spec cites rules by their number. A rule changes only by an
owner statement, recorded here with its date.

Owner decisions of 2026-10-11 are recorded in section 6 and applied to the
rules below. The [implementation plan](PIECE-STRUCTURE-IMPLEMENTATION-PLAN.md)
follows this rule set.

## 1. What the piece structure is

A file in a Workspace is a sequence of ranges over the committed file. Today a
range is one of three kinds: inherited from the committed file at the same
offset, local bytes held in overlay cells, or zero. The piece structure adds one
kind:

- **Reference piece** — a range whose bytes are a range of content that is
  already committed in the Store, possibly at a different offset. It holds no
  bytes.

Terms used below:

| Term | Meaning |
| --- | --- |
| Cell | Existing overlay payload row holding literal bytes |
| Reference piece | New overlay row: file offset, length, source, source offset |
| Source | An immutable committed content root in the Store |
| Recognizer | The write-path step that decides whether incoming bytes equal committed bytes |
| `N` | File size |
| `S` | Bytes the command submits in WRITE requests |
| `k` | Bytes that are new, that is, not equal to committed bytes |
| `R` | Reference pieces of one file |
| `H` | Height of the committed file tree, about `log N` |

## 2. Goal and non-goals

Goal: for a command that rewrites bytes that did not change, overlay storage and
Commit work depend on `k`, `R` and `H`, not on `N` or `S`.

Non-goals, stated so they are not claimed later:

- The command's own reads and writes are not removed. Command time stays
  proportional to the bytes the program moves through the mount.
- Content that is new gains nothing: a new file, or a file re-encoded,
  compressed or encrypted.
- A remote or distributed Store is not designed here.

## 3. Rules

### A. Generic input

| # | Rule | Origin |
| --- | --- | --- |
| A-1 | The only input is ordinary filesystem requests on the mount. No ioctl, SDK call, control-channel call, environment variable or wrapper creates or influences a piece. | Owner 2026-10-10; ioctl first removed 2026-09-26 |
| A-2 | LayerFS never reads the command text, classifies the program or depends on an Exec identity. Any process with mount access gets the same behaviour. | Owner 2026-10-08, 2026-10-10 |
| A-3 | One structure and one read and Commit path serve every mutation: any size, any position, any file size. No route is selected per benchmark case or per tool. | Owner 2026-10-10 |
| A-4 | A benchmark writer stays an ordinary program. It is not changed to issue calls an ordinary tool would not issue. | Owner 2026-10-10 |
| A-5 | `copy_file_range` and `fallocate` may be served later, but the design must reach its goal without them. | Proposed |

### B. Correctness

| # | Rule | Origin |
| --- | --- | --- |
| B-1 | A reference piece is recorded only when the written bytes have the same chunk id as the committed chunk, computed with Content's chunk identity, or are equal byte for byte to authenticated committed bytes at a partial-chunk edge. Any weaker fingerprint only selects a candidate. | Owner 2026-10-11 |
| B-2 | Recognition is an optimization only. When it does not fire, the bytes are stored as cells exactly as today. A miss is never an error. | Proposed |
| B-3 | Every read returns the same bytes whether or not recognition fired. Size, holes, truncation, timestamps and error results are unchanged. | Proposed |
| B-4 | A write that creates, extends or splits a piece is one atomic overlay job with the failure atomicity of today's write. One attempted operation; no retry or replay. | Standing |
| B-5 | Equal chunk ids are sufficient; whole chunks need no byte compare. This is the identity the read path already relies on when it authenticates a fetched object. | Owner 2026-10-11 |

### C. Structure and storage

| # | Rule | Origin |
| --- | --- | --- |
| C-1 | Pieces are rows in the daemon's overlay SQLite database, namespaced like payload cells. Nothing authoritative is held only in memory. | Standing (indexed, backed state) |
| C-2 | The SQLite index is the only piece index. No custom resident tree, rope or graph duplicates it. | Standing (optimization guide) |
| C-3 | No cap on pieces per file, edits per file, file size or Workspace size. Physical capacity and explicit admission remain the only limits. | Standing |
| C-4 | Resident memory is bounded by configuration and does not grow with `N`, `S` or `R`. | Standing; Owner (no unbounded memory) |
| C-5 | Recognizer state in memory is a cache. Losing it, including at daemon restart, costs a missed match and nothing else. | Proposed |
| C-6 | A source is an immutable committed content root, never "the current base". A piece stays valid when a Commit advances the base. | Proposed |
| C-7 | A piece's source stays readable because the Store has no collector and deletes no committed content, as orphans and captured readers already assume. The overlay holds no Store pin. A future collector must account for pieces before it is enabled. | Owner 2026-10-11 |
| C-8 | Pieces follow the existing layer, capture, last-owner release and bounded reclamation lifecycles. No second lifecycle. | Standing |
| C-9 | One write changes a bounded number of rows that does not depend on file size: its own cells and at most 18 piece rows, one per matched run in a 128 KiB request. Literal bytes take precedence over a piece inside one layer, so an ordinary write never reads, trims or splits a piece. | Proposed |
| C-10 | A reference piece replaces payload; it never sits beside a stored copy of the same bytes. Speed is not bought with allocated storage. | Owner (no speed bought with storage) |
| C-11 | First phases: a piece names the file's own committed content, and source offsets move forward through the file. Bytes that would need another source are stored as cells. | Owner 2026-10-11 |
| C-12 | A piece starts and ends on 4 KiB cell boundaries of the file. Ragged edges of a match are stored as cells. | Proposed |

### D. Complexity

These are the requirement the design is judged by. "Independent of `N`" allows
a `log N` factor (owner, 2026-10-10: sub-linear accepted, linear not). An edit
is judged by the bytes the command submits (owner, 2026-10-11): storage and
Commit must be independent of `N`; exec is not required to be for a command
that itself rewrites bytes.

| # | Operation | Bound | Origin |
| --- | --- | --- | --- |
| D-1 | One WRITE request | request bytes + `log R`; independent of `N` | Proposed |
| D-2 | One READ request | bytes read + `log R` + chunks covering the window | Proposed |
| D-3 | Truncate | rows beyond the new size, amortized over the writes that made them | Proposed |
| D-4 | Overlay storage of one file | `k` + `R` rows | Proposed |
| D-5 | Commit of one file | `k` + `R` + `H`; no read, chunking, hashing or save of recognized bytes | Proposed |
| D-6 | Growth of `R` | at most a constant per WRITE request (from C-9) | Proposed |
| D-7 | Any step | never quadratic or worse in `N`, `S` or `R` | Standing |

Stated plainly: the command phase as a whole is `S`. A command that rewrites
half a file submits half a file on any filesystem. No document, receipt or
report claims a size-independent command phase for such a command.

### E. Store and Commit

| # | Rule | Origin |
| --- | --- | --- |
| E-1 | Commit turns pieces into an edit script for the existing Content edit engine. No second encoder, chunker or tree builder. | Standing |
| E-2 | Canonical construction stays in Content, encoding and packing in Storage, database writes in Persistence. SQLite types stay out of Content. | Standing |
| E-3 | Only new objects are offered to Save. Reused subtrees appear only as child ids in new nodes. | Proposed |
| E-4 | Storage's exact-reuse check, including its read-back, is unchanged. The design does not depend on weakening it. | Standing; change PENDING OWNER |
| E-5 | No canonical or physical format change in the Store. An incremental root may differ from a fresh chunking, as the current contract allows. | Standing |
| E-6 | Commit keeps one construction producer (`LAYERFS_CONSTRUCTION_WORKERS=1`). No helper thread or lane is added to pass a gate. | Standing |
| E-7 | Commit captures every piece in the published frontier, whatever process wrote it. | Standing |

### F. Lazy mount and the no-server target

| # | Rule | Origin |
| --- | --- | --- |
| F-1 | Mount stays lazy. Pieces add no scan, copy or materialization at mount or at Commit. | Standing |
| F-2 | Recognition never requires committed file bytes to be resident in the daemon or in the kernel. It reads tree pages, and fetches at most one chunk per edge of an edit for a byte compare. | Owner 2026-10-11 |
| F-3 | Pieces are local to one daemon's overlay and name content any daemon reading the Store can fetch. No daemon depends on another daemon's state. | Owner 2026-10-07 (target) |
| F-4 | The shared write is Commit only, and it stays short: fewer offered objects, not longer Store writer transactions. | Proposed |
| F-5 | Disposable/WAL/OFF for the Store; MEMORY/OFF/EXCLUSIVE for the overlay. No `fsync` family call on overlay backing. Durable is not run. | Standing; Owner 2026-10-07 |
| F-6 | Recognizer state is charged to one fixed daemon-wide allowance. No cache bound is raised for this feature, and no second cache of committed bytes is added. | Proposed |

### G. Source and process

| # | Rule | Origin |
| --- | --- | --- |
| G-1 | New production files obey the 999-line ceiling; `lib.rs` and `mod.rs` the 200-line ceiling. No tests, fixtures or test-only switches in product source. | Standing |
| G-2 | No new dependency where an existing crate supplies the capability. No third-party patch. | Standing |
| G-3 | An overlay schema change is explicit, versioned and documented in the architecture set in the same change. | Standing |
| G-4 | Every commit records production LOC before, after and delta. | Standing |

## 4. Evidence the design must produce

| # | Requirement | Origin |
| --- | --- | --- |
| V-1 | Report command and Commit separately, and speed and storage together, for every case. | Standing |
| V-2 | Counts (requests, owner jobs, statements, objects offered, bytes read back) are the evidence for the bounds in section D. Timings are diagnostic. | Standing |
| V-3 | Each bound in section D is checked at two or more file sizes so the dependence on `N` is observed, not assumed. | Proposed |
| V-4 | Cases that cannot match are measured too and must not regress: small in-place edits, random-offset writes, new content, non-sequential rewrites. | Owner (no benchmark-fitting) |
| V-5 | Read-back bytes are compared with expected bytes for every piece shape: extended, split, overwritten, truncated, captured, committed and remounted. | Proposed |
| V-6 | A SQLite claim needs the query plan and a correlated runtime database profile. | Standing |
| V-7 | One sample per case and identity, fresh outputs, failed samples retained. Every test command stops at 120 s. | Standing |
| V-8 | The benchmark oracle is not changed to make a case pass. | Standing |

## 5. Conditions that stop the work

The design is abandoned or returned to the owner, not patched around, if any of
these is observed:

1. The Content edit engine does not reuse the untouched subtrees for a middle
   insert or delete at 500 MiB. Checked 2026-10-11 at 16 to 512 MiB: not
   triggered (implementation plan, section 4.3).
2. A bound in section D cannot be met without breaking a rule in A, B or C.
3. A case in V-4 regresses beyond sample noise and the cause is the recognizer.
4. A Store collector is introduced that does not account for pieces (rule C-7).

## 6. Owner decisions

Owner, 2026-10-11, on the recommendations listed to them that day: "update as
what you suggested, i trust you". The recommendations accepted were:

| # | Decision | Recorded in |
| --- | --- | --- |
| O-1 | Work proceeds on this rule set (see O-8). Rules still marked Proposed were not ruled on one by one. | — |
| O-2 | An edit is judged by the bytes the command submits. | Section D |
| O-3 | Equal chunk ids, without a byte compare, may create a reference piece. | B-1, B-5 |
| O-4 | Recognition may fetch committed bytes, bounded to one chunk per edge of an edit. | F-2 |
| O-5 | First phases use the file's own committed content, moving forward. Cross-file sources and `copy_file_range` are a later phase. | C-11 |
| O-7 | No Store pin; committed content is not deleted today. | C-7 |
| O-8 | Proceed with the implementation, with a parallel investigation of new-content Commit. | Implementation plan |

Still open, to be decided when phase 2 results exist:

| # | Decision | Effect |
| --- | --- | --- |
| O-6 | How the structural-shift cases and the oracle's retention guard are judged. | Decides whether those cases can report PASS. |
| O-9 | Whether the 2 s limit on the capped 500 MiB cases stays. | Those cases are limited by exec, which this design does not shorten. |
