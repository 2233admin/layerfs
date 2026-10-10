# Reference pieces: progress ledger

> **Status:** Dated working ledger of an unattended run; not release evidence or a product contract.

Append-only. One entry per checkpoint of the
[handoff](HANDOFF-PIECE-STRUCTURE-PROMPT.md) for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). The branch
`issue316-fsb-rescue` is local and unpushed. Every timing here is one
diagnostic sample. Counts are the evidence; a row is called passing only when
its receipt says PASS. Durable execution:
`NOT_RUN — disabled by owner until explicit reauthorization`.

Columns of every tier table, from `tools/tier_table.py`: harness status, proof
status, command phase (exec) and Commit in milliseconds, FUSE requests, overlay
writer jobs and statements of the whole run, overlay logical megabytes after
the command, source commit.

## Phase 0 — checkpoint 2026-10-11, commit `0dff203c2`

### What changed

No product source. Commit `0dff203c2`:
`Production LOC: 79544 -> 79544 (delta +0)`.

- Architecture 55, 56 and 31 gained a dated update for the exploratory
  optimization `8c1993f4a` (shapes-only captured cursor and its `Local` step,
  normalization without payload for dense rows, the cached normalized edit,
  slice copies in the read job).
- Overlay test `close_custody`: each engine now has its own temporary
  directory.

### Checks of `8c1993f4a`

Every test command ran under a 120 s stop, built with `--no-run` first.

| Check | Where | Result |
| --- | --- | --- |
| Clippy `-D warnings`, all targets, `layerfs-overlay`, `layerfs-workspace`, `layerfs-content` | host, cargo 1.85.1 locked | clean |
| Formatting of the three packages | host | clean |
| Product boundary guard | host | PASS, 674 files |
| `layerfs-overlay`, all test targets | Linux, pinned image | pass, except `close_custody` 1 of 2 failed with "File exists" in two runs, before the test fix; 2 of 2 pass after it |
| `layerfs-workspace`, all test targets | Linux, pinned image | pass |
| `layerfs-daemon`: `captured_runs`, `read_cost`, `filesystem_port`, `edit_backing` | Linux, pinned image | pass |
| `cargo fmt --all` | host | not usable: stops on the daemon example and test `e2_startup_receipts`, which name a harness path that is absent |

Both known obstacles were confirmed at the branch base `2590a4536`: the
`close_custody` file is unchanged since that commit, and the harness path the
daemon target names is absent there too. The daemon crate is unchanged on this
branch. Formatting is therefore checked per package.

### Throughput of the cut scan and of chunk identity

One pass each, single thread, 256 MiB of incompressible bytes, 13,762 chunks,
mean 19,505 bytes. Diagnostic; a scratch program outside the repository tree
that calls Content's public scanner and encoder.

| Work | Host, MiB/s | Linux image, MiB/s |
| --- | --- | --- |
| Cut scan (`FastCdc::scan`) | 2206 | 2322 |
| Chunk identity, encode the object then hash | 1011 | 931 |
| Chunk identity, hashed in place without building the object | 1052 | 989 |
| Plain BLAKE3 over the same chunks | 1256 | 1114 |

The streamed identity was equal to the encoder's identity for every chunk.
For scale: the command phase of the 500 MiB insert moves 250 MiB, which is
about a quarter of a second of hashing on one thread.

### Prepared statements in use

Static count over the overlay crate's product source: 228 distinct literal
statement texts. 2 are used only by diagnostics, 4 are format templates, and
3 of the remaining literals are fragments of the 4 texts the fence macro
builds. That gives about 225 texts the engine's jobs can prepare, against a
cache capacity of 256: headroom of about 31. The plan estimates about 12 new
texts. The added stop condition (capacity not enough) is not triggered; the
new texts are counted again at the end of phase 1.

### Control sample, tag `c0`

Nine fixed cases, one sample each, at `0dff203c2`, before any piece code.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 32.2 | 13.2 | 11 | 173 | 880 | 0.3 | 0dff203c2 |
| delete-middle-4k-on-500mib-ops-1 | FAIL | FAIL | 2380.6 | 2446.0 | 6012 | 25449 | 223248 | 272.5 | 0dff203c2 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 64.4 | 47.1 | 171 | 808 | 5018 | 5.7 | 0dff203c2 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 2439.9 | 2413.9 | 8011 | 20649 | 133839 | 268.4 | 0dff203c2 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 6159.2 | 5391.7 | 16011 | 37881 | 252687 | 536.6 | 0dff203c2 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 42.3 | 22.0 | 11 | 452 | 2375 | 0.3 | 0dff203c2 |
| payload-create-500m | INELIGIBLE | PASS | 944.8 | 9379.0 | 4014 | 20137 | 156610 | 533.4 | 0dff203c2 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE | PASS | 678.2 | 1039.6 | 8709 | 71650 | 341790 | 108.7 | 0dff203c2 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE | PASS | 1090.7 | 2323.1 | 12545 | 84438 | 424874 | 109.7 | 0dff203c2 |

Rows as observed:

- **Four FAIL**, all four target cases. Original failure of each receipt:
  `independent-graph failed with exit 1`; the step's error text is
  `persisted edit lost an original untouched payload object`. This is the
  retention guard of the oracle. How it is judged for these cases stays with
  the owner (O-6).
- **Five INELIGIBLE**, all five regression cases. Functional status PASS and
  proof PASS in each receipt. Ineligible because the run declares interference:
  another agent's containers share the Docker VM, unquantified. Every sample of
  this run will carry the same declaration.
- The 10 MiB and 500 MiB inserts hold 5.7 MB and 268.4 MB in the overlay and
  take 808 and 20,649 writer jobs: both grow with file size. This pair is the
  size comparison for phases 2 and 3.

### Decisions by agent, pending owner review

1. **`close_custody` test fix.** The two tests created one shared directory.
   Giving each engine its own is a test-only change needed to finish the Linux
   check; no assertion changed.
2. **Formatting is checked per package**, because `cargo fmt --all` cannot
   parse the daemon target with the absent path. The daemon target is not
   repaired here: it is outside this work.
3. **Design choices for phase 1**, taken where the plan leaves a detail open.
   Each is implemented and tested in the checkpoint that needs it and recorded
   again there.
   - A piece's source is the file's committed content root, never the base
     root (rule C-6).
   - Piece rows of one layer never overlap, live or stale. A piece is stale by
     its start offset and stamp, with the existing staircase test.
   - Truncate cuts the live piece that crosses the new size so that it ends at
     the new size, and later pieces go stale through the existing shrink step.
     The plan's wording "deletes pieces that start in the boundary cell" would
     drop bytes below the new size, because the shrink boundary is the next
     cell boundary at or above it; the cut replaces it.
   - The content sequence of an inode row is the Workspace revision of the
     publication that last wrote the row. A counter kept in the row could
     repeat after the row is deleted and created again; a revision cannot.
   - Claims travel beside the write in the compound job value, not inside the
     byte window type, so the 51 existing call sites are unchanged.
   - One engine-wide exact flag records whether a piece row was ever written,
     like the existing orphan flag. While it is false no retirement or cleanup
     path issues a piece statement, so runs without pieces keep today's counts.

### Not done in phase 0

- `layerfs-daemon` test targets other than the four named were not run on
  Linux in this phase; the full package tests belong to tier 4.
- The runtime database profile for piece statements belongs to phase 1.

### Next

Phase 1, in small counted commits: schema 33 and inode columns; piece rows,
claims and the layered read; truncate and stale pieces; lifecycle; the
captured `Reference` step; Content's extent cursor; the Workspace read path;
the edit script and end-to-end tests. Then tier 2 under tag `p1`, whose counts
must equal `c0`.

## Phase 1 — checkpoint 2026-10-11, commit `707a7c675`

### What changed

Five counted commits. Only tests write a piece: no request path supplies a
claim, so no ordinary program can create one yet.

| Commit | Subject | Production LOC |
| --- | --- | --- |
| `27a0620ac` | Overlay schema 33: piece rows, claims on a write, pieces in a read | 79544 -> 80040 (delta +496) |
| `aacb44746` | Pieces follow the layer lifecycles: retire, fold, orphan, reclaim | 80040 -> 80312 (delta +272) |
| `72f014a7a` | Captured run cursor reports a piece as one Reference step | 80312 -> 80433 (delta +121) |
| `31fbe96da` | Workspace reads reference ranges and commits pieces as an edit script | 80433 -> 80829 (delta +396) |
| `707a7c675` | Content: extent cursor, chunk identity from bytes, cut-candidate scan | 80829 -> 80953 (delta +124) |

Phase total: 79544 -> 80953 (delta +1409). Scope and method are in each
commit message; the reference scope is absent (retired R9c; last counted
65,417 at tree 498dd1917812).

- **Table.** `payload_reference(ns, gen, serial, file_offset, length, epoch,
  source, source_offset)`; `inode.referenced` and `inode.sequence`;
  maintenance kind 12; `accounting.reference_rows`.
- **Write.** A write can carry claims. A claim is trimmed inward to cells,
  replaces the layer's cells in its range, and extends the neighbouring piece
  or inserts one row. A claim over bytes of an earlier job is honoured only
  while the content sequence is unchanged.
- **Read.** A layer's cells are applied first, then its pieces. A read plan
  names pieces as at most 33 disjoint ranges and one bit per byte; Workspace
  copies each range from committed content at its source offset.
- **Truncate and lifecycle.** A shrink cuts the crossing piece; stale pieces,
  generation retirement, last-owner release, orphan migration, failed-capture
  fold and terminal reclaim all handle pieces in bounded steps.
- **Commit.** The captured cursor reports a piece as one `Reference` step. A
  forward pass with constant state turns the spans of a file with pieces into
  an edit script; a file without pieces seals the records it sealed before.
- **Content.** Extent cursor over a committed file, chunk identity from bytes
  without building the object, and the cut-candidate scan: the read-only entry
  points phase 2 calls.

Architecture documents 03, 19, 25, 31, 48, 55 and 56 changed with the source.

### Checks at `707a7c675`

Every test command ran under a 120 s stop, built with `--no-run` first. Host:
cargo 1.85.1, locked. Linux: the pinned image.

| Check | Where | Result |
| --- | --- | --- |
| `layerfs-content`, `layerfs-overlay`, `layerfs-workspace`, all test targets | host | pass |
| `layerfs-daemon`, 16 selected test targets | host | pass |
| Clippy `-D warnings`: content, overlay, workspace all targets; daemon and fuse libraries and the touched daemon tests | host | clean |
| Formatting: content, overlay, workspace by package; touched daemon files one by one | host | clean |
| Product boundary guard | host | PASS, 681 files |
| `layerfs-content`, all test targets | Linux | 457 passed |
| `layerfs-overlay`, all test targets | Linux | 151 passed |
| `layerfs-workspace`, all test targets | Linux | 167 passed |
| `layerfs-daemon`, non-mount selection | Linux | 17 passed; 2 failed in `native_mutation` because that run was started without the FUSE device ("native attach Device: No such file or directory"), a selection error of this run |
| `layerfs-daemon` mount tests, default test threads | Linux, FUSE device | 3 of `mounted_store_read` failed at mount with "already mounted" |
| `layerfs-daemon` mount tests, one test thread: `mounted_store_read`, `native_mutation` | Linux, FUSE device | 6 passed |
| `layerfs-daemon` mount tests, one test thread: `mounted_commit`, `mounted_execute`, `native_coherence` | Linux, FUSE device | 14 passed |
| `layerfs-daemon` package as a whole; `cargo fmt` of the daemon package | host | not usable: the example `e2_startup` and the test `e2_startup_receipts` include a harness file that is absent, as at the branch base |

The three parallel failures are reported as observed. They were not diagnosed
further: the same tests pass with one test thread, and the failing call is the
mount of the test's own directory. The linker was killed once for lack of
memory while building the daemon tests in the image; the build passed with two
jobs.

Evidence the plan asks of phase 1:

- **Byte-exact read-back.** Overlay `pieces.rs` and `piece_lifetimes.rs`
  compare every piece shape with a plain-write model, including randomized
  rounds across resize, capture, install and fold. Workspace
  `captured_piece_edits.rs` compares the live view, the sealed view and the
  constructed root with the final bytes. Daemon `piece_commit.rs` uses a real
  Disposable Store: pieces in two files, product Commit, the published root
  read from a fresh bind, then a second Commit. "Remount" here is a fresh
  bind of the Workspace on the published root, not a kernel mount; the kernel
  route to a piece does not exist before phase 2.
- **Commit counts at two sizes.** A middle insert over a 1 MiB and a 6 MiB
  base: 4 normalization steps, 1 source step, 5 rows, 1 edit and 0 committed
  bytes for both; object reads 4 and 7.
- **Query plans and runtime profile.** `pieces.rs` asserts the plans of the
  piece statements (no scan, temporary b-tree or automatic index) and the engine's runtime counters:
  extending a piece of 1 and of 48 windows is 14 statements and 3 changed rows
  each; a read inside either is 6 statements. The profile found one statement
  that SQLite prepared again on each bind; its limit is now a literal.
- **Prepared statements.** 239 literal job texts of a capacity of 256 (static
  count), 15 more than schema 32. The stop condition (capacity not enough) is
  not triggered. The plan's estimate was about 12.
- **Moving a long piece between layers.** A step reads at most three rows and
  changes at most three, whatever the piece's length. That stop condition is
  not triggered.

### Tier 2, tag `p1`

Nine fixed cases, one sample each, at `707a7c675`. Control `c0` is above.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 42.5 | 14.4 | 11 | 173 | 880 | 0.3 | 707a7c675 |
| delete-middle-4k-on-500mib-ops-1 | FAIL | FAIL | 2169.3 | 2350.4 | 6012 | 25449 | 223248 | 272.5 | 707a7c675 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 60.5 | 43.3 | 171 | 808 | 5018 | 5.7 | 707a7c675 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 2217.2 | 2282.9 | 8011 | 20649 | 133839 | 268.4 | 707a7c675 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 4729.1 | 4750.9 | 16011 | 37881 | 252687 | 536.6 | 707a7c675 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 47.3 | 18.7 | 11 | 452 | 2375 | 0.3 | 707a7c675 |
| payload-create-500m | INELIGIBLE | PASS | 1051.6 | 6644.7 | 4014 | 20137 | 156610 | 533.4 | 707a7c675 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE | PASS | 721.6 | 1246.9 | 8709 | 71650 | 341790 | 108.7 | 707a7c675 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE | PASS | 1171.0 | 2374.7 | 12545 | 84438 | 424874 | 109.8 | 707a7c675 |

Rows as observed:

- **Requests, writer jobs and statements equal `c0` in all nine cases**, to
  the unit. This is the phase 1 expectation: nothing creates a piece.
- **Overlay logical bytes are not equal.** Seven cases hold 4,096 bytes more
  than `c0`, `tiny-bulk-create` 8,192 more and `workspace-dense-rewrite`
  40,960 more (109,719,552 to 109,760,512, 0.04%). Not profiled. The reading:
  one page is the root of the new, empty table; the rest follows the two
  added inode columns, which make every inode row a few bytes wider, in the
  two cases with thousands of inodes. Reported as a storage cost of schema 33.
- **Four FAIL**, the four target cases, with the same original failure as in
  `c0`: `independent-graph failed with exit 1`, the retention guard (O-6,
  with the owner).
- **Five INELIGIBLE**, the five regression cases: functional status PASS and
  proof PASS in each receipt; ineligible for the declared interference.
- Timings are single diagnostic samples and are not compared.

### Decisions by agent, pending owner review

Each is also in the commit message of the checkpoint that made it.

1. **Truncate** cuts the crossing piece to end at the new size. The plan's
   "deletes pieces that start in the boundary cell" would drop bytes below it.
2. **Content sequence** is the Workspace revision of the row's last
   publication, not a per-row counter, so a value cannot repeat.
3. **Claims** are a boxed field beside the write in the overlay job and travel
   in `WriteData` in Workspace: existing call sites are unchanged.
4. **A literal `LIMIT`** in the window statement, found by the runtime
   counters.
5. **`explain_pieces()`** is a new diagnostic rather than more lines of
   `explain_payload()`.
6. **The retirement phase for pieces is the last one**, so the phase numbers
   of an engine without pieces are unchanged.
7. **A moved fragment is not merged** with a neighbouring row of the upper
   layer. Fold and migration are rare; rows stay bounded by the rows that
   existed.
8. **Compact read plan**: ranges and a bit mask, not a byte map. The byte map
   doubled the reservation of every read reply.
9. **The edit script splits a span that lies partly behind the base cursor**
   and retains the rest. The plan retains a reference only when it starts at
   or after the cursor.
10. **A file without pieces keeps its two-edit form**, so its records and
    counts equal the control; its exact edit checks stay. Script edits have
    the general checks. The sealed context is version 2.
11. **The captured cursor keeps no piece state**; a resumed pass pays one
    seek, and the wire form of the cursor is unchanged.
12. **The extent cursor reports the offset inside the chunk**, not a "whole
    chunk" flag: the mapping records no chunk length, so only bytes that hash
    to the chunk's identity prove a whole chunk.
13. **Placement, against plan section 9** (recorded in the plan, section 13):
    `payload/pieces/captured.rs` was created; `payload/runs.rs` and
    `mapping/predecessor.rs` were touched; `layerfs-fuse` `read.rs` needed no
    change; the Workspace test harness moved to `tests/captured_support`.

### What failed or was not done

- The three parallel mount-test failures and the two device-less failures in
  the table above.
- The daemon package's own `e2_startup` targets do not compile; untouched.
- No kernel-mounted proof creates a piece: that is the mounted proof of
  phase 2.
- Tier 3 and tier 4 do not belong to this phase.
- Nothing was reverted in phase 1.

### Next

Phase 2: the recognizer without carry. One new request port; gate, continue
and search in Workspace over the Content entry points; a fixed slot table in
the daemon shared by all Workspaces; split of the daemon's overlay command
file before any new variant. Tier 2 at each recognizer step.
