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

## Phase 2, step `p2a` — checkpoint 2026-10-11, commit `677a7f8d6`

The first recognizer step: gate, follow and search, no carry. **The phase 2
exit is not met at this step**: overlay bytes of the target improved, the
regression cases are unchanged, and the Commit of the target cases got worse.
Phase 2 stays open; tier 3 was not sampled (below).

### What changed

| Commit | Change | Production LOC |
| --- | --- | --- |
| `aad5c6632` | Ledger entry of phase 1 and the plan record (documentation) | 80953 -> 80953 (delta +0) |
| `677a7f8d6` | Write recognizer without carry: `operations/file/recognize.rs` in Workspace, `store/recognizer.rs` in the daemon, one request port in `layerfs-fuse`, called once before a WRITE's first owner visit | 80953 -> 81457 (delta +504) |
| this commit | This entry; two count tests (below) | 81457 -> 81457 (delta +0) |

Scope of every count: active core; reference absent (retired R9c; last counted
65,417 at tree 498dd1917812). Method: `count_absent_aware.py staged`.

### Checks at `677a7f8d6`

Each command under a 120 s stop, built with `--no-run` first.

| Check | Result |
| --- | --- |
| `layerfs-workspace`, all targets, host | pass, 173 tests; new `recognize`, 6 tests |
| `layerfs-fuse`, all targets, host | pass, 24 tests |
| `layerfs-daemon`, 17 selected targets, host | pass, 72 tests; new `recognizer`, 2 tests |
| Linux, pinned image: Workspace `recognize`, daemon `recognizer`, `native_mutation`, `mounted_store_read`, `mounted_execute`, `mounted_commit`, `native_coherence` (FUSE device, one test thread) | pass |
| Linux `layerfs-fuse`, all targets | pass, 27 tests |
| Linux `mounted_recognizer` (new): a process started outside the daemon shifts two tails with `dd`, `tail` and `truncate` | pass: 48 pieces, 2.12 of 3.07 MiB claimed; compared with a native replay, daemon READs, the published root and a fresh mount |
| Clippy `-D warnings`: Workspace and FUSE all targets, daemon library and the touched tests | clean |
| Formatting; product boundary guard | clean; PASS, 683 files |
| Durable | `NOT_RUN — disabled by owner until explicit reauthorization` |

### Tier 2, tag `p2a`

Nine fixed cases, one sample each, at `677a7f8d6`. Control `c0` is in the
phase 0 entry.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 34.5 | 13.6 | 11 | 173 | 880 | 0.3 | 677a7f8d6 |
| delete-middle-4k-on-500mib-ops-1 | FAIL | NOT_RUN | 2205.3 | 0.0 | None | None | None | - | 677a7f8d6 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 61.1 | 264.5 | 171 | 26724 | 130250 | 2.4 | 677a7f8d6 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | NOT_RUN | 2640.4 | 0.0 | None | None | None | - | 677a7f8d6 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | NOT_RUN | 5383.1 | 0.0 | None | None | None | - | 677a7f8d6 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 45.9 | 36.7 | 11 | 452 | 2375 | 0.3 | 677a7f8d6 |
| payload-create-500m | INELIGIBLE | PASS | 969.3 | 5874.5 | 4014 | 20137 | 156610 | 533.4 | 677a7f8d6 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE | PASS | 691.0 | 1205.9 | 8709 | 71650 | 341790 | 108.7 | 677a7f8d6 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE | PASS | 1075.4 | 2088.3 | 12545 | 84438 | 424874 | 109.8 | 677a7f8d6 |

Failures as recorded in the receipts:

- `insert-middle-4k-on-10mib-ops-1`: `independent-graph failed with exit 1`
  (the retention guard, as in `c0`; O-6, with the owner).
- `insert-middle-4k-on-500mib-result-capped-v2-ops-1`,
  `prepend-head-4k-on-500mib-result-capped-v2-ops-1` and
  `delete-middle-4k-on-500mib-ops-1`: `original event wall stop: commit`. The
  Commit did not finish inside the harness limit; the proof was not run and
  the receipt holds no counts. **In `c0` and `p1` these Commits finished in
  2.3 to 5.4 s. This is a regression of this step.**

Rows as observed, in the order of comparison:

- **Overlay bytes of the target that completed**: the 10 MiB insert holds
  2,396,160 logical bytes, against 5,656,576 in `c0` (-58 %). The three
  500 MiB targets have no reading.
- **Commit writer jobs and statements of that target got worse**: 26,724
  jobs and 130,250 statements, against 808 and 5,018. By class, completed
  operation-record jobs went from 381 to 26,150; read jobs from 333 to 480;
  mutation jobs are 86 in both.
- **Store bytes of that target grew**: 12,865,184 logical bytes after the
  Commit, against 11,044,144. The stored bytes between two pieces become new
  chunks that share no boundary with the committed ones.
- **Requests are equal to `c0` in the six cases that completed.**
- **The five regression cases are equal to `c0` in requests, writer jobs and
  statements**, to the unit. Overlay bytes differ from `c0` as they did at
  `p1` (schema 33). Stop condition 3 is not triggered.
- Five INELIGIBLE: functional PASS and proof PASS in each receipt;
  ineligible for the declared interference. None of the nine rows is PASS.
- Timings are single diagnostic samples.

### Why the Commit got worse

Without carry, the chunk that crosses the end of a request is never claimed,
so every request leaves one stored stretch between two pieces. At Commit each
stretch is one edit of the script: about 80 edits for the 10 MiB insert, about
4,000 for a 500 MiB one.

Two count tests, added with this entry, separate the two halves of the cost:

| Step | Test | Edits | Record calls |
| --- | --- | --- | --- |
| Normalization (Workspace) | `captured_piece_edits`, `commit_record_calls_grow_with_the_edits_and_no_faster` | 8, 32, 128 | 20, 68, 261: linear, about two an edit |
| Edit engine (Content) | `edit_scaling`, 12 MiB | 8, 32, 128 | 1,946, 8,186, 45,268 jobs: 243, 255, 353 an edit |
| Edit engine (Content) | `edit_scaling`, 48 MiB | 32, 128, 512 | 8,186, 45,442, 425,401 jobs: 255, 355, 830 an edit |
| Edit engine, run once and not kept in the test | 192 MiB, 384 MiB | 2,048, 4,096 | 5,154,837 and 16,020,338 jobs: 2,517 and 3,911 an edit |

- The job count does not depend on the file length: 32 edits cost 8,186 jobs
  on 12 MiB and on 48 MiB.
- It grows faster than the number of edits over the whole measured range.
  The histogram by record kind names the step: every hold and release of a
  branch node reads three records (reference count, detached marker, draft)
  for each child that is a draft, and the modified leaves stay drafts until
  the end. At 512 edits these three kinds are 366,923 of 397,697 reads.
- The growth has a ceiling in the source, 128 entries a node on each level,
  and it was not reached at 4,096 edits. This is a property of the existing
  edit engine with many edits in one file; a control Commit has one or two
  edits a file and never reaches it. **Rule D-7 (nothing quadratic in `R`):
  reported as observed, between linear and quadratic in the measured range,
  with a ceiling from the fan-out. Rule D-5 states `k + R + H`; the measured
  cost is nearer `R` times fan-out times `H`. Left to the owner.**

### Decisions by agent, pending owner review

1. **`677a7f8d6` stays.** It is correct (read-back, Commit and fresh mount
   are byte-exact in every test) and it is the base of the carry. The carry
   makes the pieces of a shifted tail contiguous, so they extend one row and
   the stretch between them disappears: that is the plan's own next step and
   the remedy for the number of edits.
2. **Tier 3 is not sampled at this step.** The handoff widens "only when the
   narrower tier is green", and tier 2 is not: three of four targets stop at
   the Commit wall. Tier 3 will be sampled at the first step whose tier 2
   completes the target Commits.
3. **The edit engine is not changed in this step.** Its per-edit accounting
   is Content's own algorithm, outside plan sections 3, 4 and 7. Recorded as
   a candidate for the optimization track.
4. **`edit_scaling` asserts what holds** (jobs independent of the length) and
   prints the growth with edits without asserting a bound on it.

### What failed or was not done

- Phase 2's "target cases improve in Commit writer jobs": not met; worse.
- Three Commit wall stops, above. Nothing was resampled.
- Tier 3: not sampled, decision 2.
- No SQLite claim is made in this entry: the counts are job and record
  counts, not a query plan.
- Nothing was reverted.

### Next

The carry: the identity so far of the chunk that crosses a request's end is
kept in the file's slot (no bytes), the next request completes it, and its
claim reaches back over the stored bytes under the content sequence of the
publication that stored them. Tier 2 under a new tag at that commit.

## Phase 3, step `p3a` — checkpoint 2026-10-11, commit `779324ee8`

The carry in the direction of rising offsets. It repairs the delete and does
nothing for the insert and the prepend, whose writer moves the tail from the
end of the file backward.

### What changed

| Commit | Change | Production LOC |
| --- | --- | --- |
| `16541bcd8` | Ledger entry of step `p2a`, two count tests | 81457 -> 81457 (delta +0) |
| `779324ee8` | Carry: `mapping::ChunkIdentity` in Content; the run keeps the identity so far of the chunk that crosses a request's end and the next request completes it, reaching back under the content sequence; the port records the revision of an applied write | 81457 -> 81617 (delta +160) |

### Checks at `779324ee8`

| Check | Result |
| --- | --- |
| `layerfs-content`, all targets, host | pass, 458 tests |
| `layerfs-workspace`, all targets, host | pass, 174 tests; a shifted tail written forward is claimed but for 2 to 28 KiB |
| `layerfs-fuse`, all targets, host | pass, 24 tests |
| `layerfs-daemon`, 18 selected targets, host | pass, 73 tests; new: a second writer between two requests, a repeated request, reverse order, an appending writer, each equal to the model through Commit and a fresh bind |
| Linux, pinned image, FUSE device, one test thread: 7 daemon targets | pass, 24 tests |
| Linux `mounted_recognizer` (outside process, `dd`, `tail`, `truncate`, written forward) | pass: 2 piece rows and 33,792 stored bytes for 3.07 MiB written; 48 rows before |
| Clippy `-D warnings`, formatting, product boundary guard | clean; clean; PASS, 683 files |
| Durable | `NOT_RUN — disabled by owner until explicit reauthorization` |

### Tier 2, tag `p3a`

Nine fixed cases, one sample each, at `779324ee8`.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 46.8 | 16.7 | 11 | 173 | 880 | 0.3 | 779324ee8 |
| delete-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 2153.5 | 96.0 | 6012 | 13247 | 123503 | 0.5 | 779324ee8 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 72.1 | 266.7 | 171 | 26724 | 130250 | 2.4 | 779324ee8 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | NOT_RUN | 2960.7 | 0.0 | None | None | None | - | 779324ee8 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | NOT_RUN | 6047.6 | 0.0 | None | None | None | - | 779324ee8 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 47.3 | 23.4 | 11 | 452 | 2375 | 0.3 | 779324ee8 |
| payload-create-500m | INELIGIBLE | PASS | 1108.3 | 6357.3 | 4014 | 20137 | 156610 | 533.4 | 779324ee8 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE | PASS | 744.1 | 1181.7 | 8709 | 71650 | 341790 | 108.7 | 779324ee8 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE | PASS | 1094.1 | 2025.5 | 12545 | 84438 | 424874 | 109.8 | 779324ee8 |

Failures as recorded in the receipts:

- `insert-middle-4k-on-10mib-ops-1`: `independent-graph failed with exit 1`.
- `insert-middle-4k-on-500mib-result-capped-v2-ops-1` and
  `prepend-head-4k-on-500mib-result-capped-v2-ops-1`:
  `original event wall stop: commit`; proof not run; no counts. Still the
  regression of step `p2a`.

Rows as observed:

- **`delete-middle-4k-on-500mib-ops-1` completed**: overlay 479,232 logical
  bytes against 272,486,400 in `c0`; Commit 96.0 ms against 2,446.0 ms;
  13,247 writer jobs and 123,503 statements against 25,449 and 223,248;
  requests 6,012 in both. Functional PASS and proof PASS in the receipt, where
  `c0` failed the retention guard; the row is INELIGIBLE for the declared
  interference, not PASS.
- **The 10 MiB insert is unchanged from `p2a`** to the unit: 26,724 writer
  jobs, 130,250 statements, 2,396,160 overlay bytes.
- **The five regression cases equal `c0`** in requests, writer jobs and
  statements.
- No row is PASS. Timings are single diagnostic samples.

### Why the insert did not change

The benchmark's writer (`writers/edit.rs`, unchanged) grows a file the way
`memmove` does: it extends the file, then copies the suffix in 64 KiB blocks
from the end of the file toward the edit. Its requests arrive in falling
offsets, so no request begins where the one before it ended, and the chunk
that crosses a boundary is cut the other way round: its end was written first.
A delete copies in rising offsets, which is the direction of this step. The
mounted proof wrote forward and did not show this.

### Decisions by agent, pending owner review

1. **Add the falling direction** as the next step: the earlier request keeps
   the bytes of the chunk whose beginning lies before it (at most one chunk,
   32 KiB, which is the slot the plan describes in 6.3), the next lower
   request completes it, and its claim reaches past its own end under the
   content sequence. The engine's claim grammar gains that reach; no schema
   change.
2. **Tier 3 still waits**: two of four targets stop at the Commit wall.

### What failed or was not done

- Two Commit wall stops and the unchanged 10 MiB insert, above.
- Tier 3: not sampled. Nothing was reverted.

## Phase 3, step `p3d` — checkpoint 2026-10-11, commit `5239bfaa1`

The carry in falling offsets. Every target Commit completes; overlay bytes
and Commit work of the insert no longer follow the file size.

### What changed

| Commit | Change | Production LOC |
| --- | --- | --- |
| `e1f7c2814` | Ledger entry of step `p3a` | 81617 -> 81617 (delta +0) |
| `5239bfaa1` | Carry in falling offsets: the earlier request keeps the last bytes of the chunk that begins before it (at most 32 KiB); the request below completes the identity and its claim ends after its window; the engine accepts that reach under the content sequence and takes in the piece that follows a claim | 81617 -> 81714 (delta +97) |

### Checks at `5239bfaa1`

| Check | Result |
| --- | --- |
| `layerfs-overlay`, all targets, host | pass, 152 tests |
| `layerfs-workspace`, all targets, host | pass, 175 tests; a 2 MiB tail moved backward is claimed but for 25 to 29 KiB |
| `layerfs-fuse`, all targets, host | pass, 24 tests |
| `layerfs-daemon`, 18 selected targets, host | pass, 74 tests |
| Linux, pinned image, FUSE device, one test thread: 7 daemon targets | pass, 25 tests |
| Linux `mounted_recognizer`: an outside process shifts two tails forward and grows a third file in place from its end backward | pass: 4 piece rows and 71,168 stored bytes for three files |
| Clippy `-D warnings` (overlay, workspace, fuse, all targets), formatting, boundary guard | clean; clean; PASS, 683 files |
| `layerfs-content` | not rerun: unchanged since `779324ee8` |
| Durable | `NOT_RUN — disabled by owner until explicit reauthorization` |

### Mistakes of this run, as they happened

- **Tag `p3c` holds no sample.** While that tier's build was starting I
  dry-ran the draft of a later step against a tracked source file, written
  and restored within one command. The tier was stopped before any sample
  and its build container, which this run had started, was stopped. The
  container had in fact started after the restore. `p3d` is the sample of
  `5239bfaa1`.
- **Leftover daemon containers.** A sample that ends with the harness's wall
  stop leaves its daemon container running. Five were found: three from
  `p2a` and two from `p3a`, each matched to a receipt of this worktree by its
  sample volume, and stopped. The three from `p2a` were still running their
  Commits during the `p3a` tier, so the timings of `p3a` carry that load;
  its counts do not. Older containers that match no receipt of this worktree
  were not touched.

### Tier 2, tag `p3d`

Nine fixed cases, one sample each, at `5239bfaa1`.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 44.4 | 13.7 | 11 | 173 | 880 | 0.3 | 5239bfaa1 |
| delete-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 2021.4 | 90.0 | 6012 | 13247 | 127502 | 0.5 | 5239bfaa1 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 72.2 | 17.4 | 171 | 867 | 5522 | 0.3 | 5239bfaa1 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 2364.9 | 26.3 | 8011 | 8938 | 104641 | 0.4 | 5239bfaa1 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 5173.9 | 19.6 | 16011 | 16582 | 202834 | 0.3 | 5239bfaa1 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 43.8 | 15.5 | 11 | 452 | 2375 | 0.3 | 5239bfaa1 |
| payload-create-500m | INELIGIBLE | PASS | 1136.4 | 5730.1 | 4014 | 20137 | 156610 | 533.4 | 5239bfaa1 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE | PASS | 714.6 | 1146.2 | 8709 | 71650 | 341790 | 108.7 | 5239bfaa1 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE | PASS | 1121.9 | 2082.1 | 12545 | 84438 | 424874 | 109.8 | 5239bfaa1 |

Against the control `c0`, in the order of comparison:

| case | overlay bytes `c0` | overlay bytes `p3d` | Commit ms `c0` | Commit ms `p3d` | writer jobs `c0` | writer jobs `p3d` |
| --- | --- | --- | --- | --- | --- | --- |
| insert-middle-4k-on-10mib | 5,656,576 | 307,200 | 47.1 | 17.4 | 808 | 867 |
| insert-middle-4k-on-500mib | 268,427,264 | 405,504 | 2,413.9 | 26.3 | 20,649 | 8,938 |
| prepend-head-4k-on-500mib | 536,563,712 | 344,064 | 5,391.7 | 19.6 | 37,881 | 16,582 |
| delete-middle-4k-on-500mib | 272,486,400 | 479,232 | 2,446.0 | 90.0 | 25,449 | 13,247 |

- **Requests equal `c0` in all nine cases.** The five regression cases equal
  `c0` in requests, writer jobs and statements, to the unit.
- **Every target Commit completes.** The 10 MiB and the 500 MiB insert hold
  307,200 and 405,504 overlay bytes, of which 32,768 and 61,952 are stored
  payload by the receipts' stored counts. Their Commits make 676 and 904
  operation-record jobs (4,496 for the 500 MiB insert in `c0`); the other
  writer jobs are the command's own reads and writes.
- **Statements of the delete rose from 123,503 at `p3a` to 127,502**, which
  is consistent with the one more indexed lookup a claim now makes for the
  piece that follows; not profiled.
- **3 FAIL, proof FAIL**: the two inserts and the prepend,
  `independent-graph failed with exit 1`, the oracle's retention guard (O-6,
  with the owner). The delete has proof PASS.
- **6 INELIGIBLE**: functional PASS and proof PASS in each receipt;
  ineligible for the declared interference. No row is PASS.
- Timings are single diagnostic samples.

### Tier 3, tag `p3d`

The four edit families, 61 cases, at `5239bfaa1`; six of them are the tier 2
rows above and were not sampled again. This is the tier 3 sample the handoff
places at the end of phase 2; it was held back until the target Commits
completed.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| overwrite-fixed-64k-chunk-count-decrease-on-100mib-ops-1 | INELIGIBLE | PASS | 41.8 | 14.4 | 10 | 347 | 1821 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-decrease-on-10mib-ops-1 | INELIGIBLE | PASS | 34.1 | 12.3 | 10 | 347 | 1821 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-decrease-on-1mib-ops-1 | INELIGIBLE | PASS | 43.1 | 11.1 | 10 | 144 | 738 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-decrease-on-500mib-ops-1 | INELIGIBLE | PASS | 43.8 | 20.6 | 10 | 494 | 2580 | 0.4 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-increase-on-100mib-ops-1 | INELIGIBLE | PASS | 48.1 | 16.5 | 10 | 347 | 1821 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-increase-on-10mib-ops-1 | INELIGIBLE | PASS | 47.3 | 13.1 | 10 | 347 | 1821 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-increase-on-1mib-ops-1 | INELIGIBLE | PASS | 50.1 | 11.4 | 10 | 144 | 738 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-increase-on-500mib-ops-1 | INELIGIBLE | PASS | 51.2 | 20.8 | 10 | 494 | 2580 | 0.4 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-preserve-on-100mib-ops-1 | INELIGIBLE | PASS | 44.8 | 15.9 | 10 | 347 | 1821 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-preserve-on-10mib-ops-1 | INELIGIBLE | PASS | 46.9 | 15.5 | 10 | 347 | 1821 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-preserve-on-1mib-ops-1 | INELIGIBLE | PASS | 45.8 | 12.2 | 10 | 144 | 738 | 0.3 | 5239bfaa1 |
| overwrite-fixed-64k-chunk-count-preserve-on-500mib-ops-1 | INELIGIBLE | PASS | 44.4 | 20.6 | 10 | 494 | 2580 | 0.4 | 5239bfaa1 |
| append-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | 47.5 | 10.6 | 11 | 133 | 658 | 0.2 | 5239bfaa1 |
| append-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 43.3 | 10.5 | 11 | 133 | 658 | 0.2 | 5239bfaa1 |
| append-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | 34.2 | 11.1 | 11 | 110 | 535 | 0.2 | 5239bfaa1 |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 44.4 | 13.7 | 11 | 173 | 880 | 0.3 | 5239bfaa1 |
| delete-middle-4k-on-100mib-ops-1 | INELIGIBLE | PASS | 436.1 | 31.6 | 1212 | 2661 | 26166 | 0.3 | 5239bfaa1 |
| delete-middle-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 72.6 | 15.4 | 132 | 508 | 3897 | 0.3 | 5239bfaa1 |
| delete-middle-4k-on-1mib-ops-1 | INELIGIBLE | PASS | 38.9 | 10.3 | 24 | 157 | 934 | 0.3 | 5239bfaa1 |
| delete-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 2021.4 | 90.0 | 6012 | 13247 | 127502 | 0.5 | 5239bfaa1 |
| insert-middle-4k-on-100mib-ops-1 | FAIL | FAIL | 462.6 | 19.3 | 1611 | 2362 | 23775 | 0.3 | 5239bfaa1 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 72.2 | 17.4 | 171 | 867 | 5522 | 0.3 | 5239bfaa1 |
| insert-middle-4k-on-1mib-ops-1 | FAIL | FAIL | 43.4 | 10.9 | 27 | 212 | 1227 | 0.3 | 5239bfaa1 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 2364.9 | 26.3 | 8011 | 8938 | 104641 | 0.4 | 5239bfaa1 |
| prepend-head-4k-on-100mib-ops-1 | FAIL | FAIL | 930.1 | 15.7 | 3211 | 3637 | 42130 | 0.3 | 5239bfaa1 |
| prepend-head-4k-on-10mib-ops-1 | FAIL | FAIL | 137.3 | 16.7 | 331 | 757 | 6152 | 0.3 | 5239bfaa1 |
| prepend-head-4k-on-1mib-ops-1 | FAIL | FAIL | 48.6 | 12.0 | 43 | 196 | 1233 | 0.3 | 5239bfaa1 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 5173.9 | 19.6 | 16011 | 16582 | 202834 | 0.3 | 5239bfaa1 |
| replace-grow-middle-2k-to-4k-on-100mib-ops-1 | FAIL | FAIL | 476.9 | 21.4 | 1612 | 2624 | 27897 | 0.3 | 5239bfaa1 |
| replace-grow-middle-2k-to-4k-on-10mib-ops-1 | FAIL | FAIL | 69.6 | 20.8 | 172 | 1376 | 8252 | 0.3 | 5239bfaa1 |
| replace-grow-middle-2k-to-4k-on-1mib-ops-1 | FAIL | FAIL | 44.3 | 11.9 | 28 | 244 | 1433 | 0.3 | 5239bfaa1 |
| replace-grow-middle-2k-to-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 2667.1 | 25.8 | 8012 | 8939 | 104658 | 0.4 | 5239bfaa1 |
| replace-shrink-middle-4k-to-2k-on-100mib-ops-1 | INELIGIBLE | PASS | 478.4 | 20.1 | 1212 | 1860 | 19312 | 0.3 | 5239bfaa1 |
| replace-shrink-middle-4k-to-2k-on-10mib-ops-1 | INELIGIBLE | PASS | 69.6 | 17.3 | 132 | 737 | 4717 | 0.3 | 5239bfaa1 |
| replace-shrink-middle-4k-to-2k-on-1mib-ops-1 | INELIGIBLE | PASS | 73.5 | 13.5 | 24 | 188 | 1090 | 0.3 | 5239bfaa1 |
| replace-shrink-middle-4k-to-2k-on-500mib-ops-1 | INELIGIBLE | PASS | 1817.7 | 22.0 | 6012 | 6790 | 83980 | 0.3 | 5239bfaa1 |
| truncate-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | 37.9 | 12.6 | 10 | 170 | 881 | 0.2 | 5239bfaa1 |
| truncate-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 43.3 | 10.5 | 10 | 170 | 881 | 0.2 | 5239bfaa1 |
| truncate-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | 45.6 | 10.2 | 10 | 106 | 521 | 0.2 | 5239bfaa1 |
| truncate-tail-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 42.6 | 16.4 | 10 | 216 | 1133 | 0.3 | 5239bfaa1 |
| zero-extend-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | 30.4 | 10.4 | 11 | 133 | 658 | 0.2 | 5239bfaa1 |
| zero-extend-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 38.1 | 9.5 | 11 | 133 | 658 | 0.2 | 5239bfaa1 |
| zero-extend-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | 42.0 | 9.7 | 11 | 110 | 535 | 0.2 | 5239bfaa1 |
| zero-extend-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 56.1 | 16.7 | 11 | 173 | 880 | 0.3 | 5239bfaa1 |
| append-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1 | INELIGIBLE | PASS | 41.3 | 16.1 | 11 | 173 | 880 | 0.3 | 5239bfaa1 |
| insert-middle-4k-input-524283904b-result-500mib-ops-1-capped-v1 | FAIL | NOT_RUN | 0.0 | 0.0 | None | None | None | - | 5239bfaa1 |
| prepend-head-4k-input-524283904b-result-500mib-ops-1-capped-v1 | FAIL | NOT_RUN | 0.0 | 0.0 | None | None | None | - | 5239bfaa1 |
| replace-grow-middle-2k-to-4k-input-524285952b-result-500mib-ops-1-capped-v1 | FAIL | NOT_RUN | 0.0 | 0.0 | None | None | None | - | 5239bfaa1 |
| zero-extend-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1 | INELIGIBLE | PASS | 50.4 | 16.7 | 11 | 173 | 880 | 0.3 | 5239bfaa1 |
| overwrite-head-4k-on-100mib-ops-1 | INELIGIBLE | PASS | 42.3 | 13.5 | 10 | 253 | 1311 | 0.3 | 5239bfaa1 |
| overwrite-head-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 39.3 | 13.9 | 10 | 253 | 1311 | 0.3 | 5239bfaa1 |
| overwrite-head-4k-on-1mib-ops-1 | INELIGIBLE | PASS | 47.7 | 10.3 | 10 | 122 | 606 | 0.2 | 5239bfaa1 |
| overwrite-head-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 45.8 | 15.5 | 10 | 352 | 1824 | 0.3 | 5239bfaa1 |
| overwrite-middle-4k-on-100mib-ops-1 | INELIGIBLE | PASS | 35.3 | 16.3 | 11 | 406 | 2123 | 0.3 | 5239bfaa1 |
| overwrite-middle-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 38.1 | 13.0 | 11 | 388 | 2015 | 0.3 | 5239bfaa1 |
| overwrite-middle-4k-on-1mib-ops-1 | INELIGIBLE | PASS | 47.3 | 10.7 | 11 | 145 | 740 | 0.2 | 5239bfaa1 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 43.8 | 15.5 | 11 | 452 | 2375 | 0.3 | 5239bfaa1 |
| overwrite-tail-4k-on-100mib-ops-1 | INELIGIBLE | PASS | 42.4 | 13.4 | 10 | 224 | 1139 | 0.3 | 5239bfaa1 |
| overwrite-tail-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 41.1 | 14.3 | 10 | 224 | 1139 | 0.2 | 5239bfaa1 |
| overwrite-tail-4k-on-1mib-ops-1 | INELIGIBLE | PASS | 38.6 | 13.9 | 10 | 123 | 608 | 0.2 | 5239bfaa1 |
| overwrite-tail-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 44.9 | 15.2 | 10 | 318 | 1631 | 0.3 | 5239bfaa1 |

- **46 INELIGIBLE with proof PASS, 12 FAIL with proof FAIL, 3 FAIL with proof
  NOT_RUN.** No row is PASS.
- **The 12 with proof FAIL** are every insert, prepend and replace-grow case
  that completed, at 1, 10, 100 and 500 MiB:
  `independent-graph failed with exit 1` (O-6, with the owner). Every delete,
  replace-shrink, append, truncate, zero-extend and overwrite case has proof
  PASS.
- **The 3 with proof NOT_RUN** are the insert, prepend and replace-grow of
  `edit_length_changing_capped` (`...-capped-v1`):
  `original event wall stop: command`. The command phase did not finish
  inside that family's limit (O-9, with the owner); the same commands take
  2.4 to 5.2 s of exec in the uncapped rows. No control sample of these three
  exists in this run, so no comparison is made. Each left a daemon container
  running, which this run stopped after the tier.
- **Commit of the insert against the file size**: 10.9, 17.4, 19.3 and
  26.3 ms at 1, 10, 100 and 500 MiB; overlay 0.3 to 0.4 MB at every size.
  The prepend: 12.0, 16.7, 15.7, 19.6 ms. Replace-shrink: 13.5, 17.3, 20.1,
  22.0 ms.
- **Commit of the delete still follows the file size**: 10.3, 15.4, 31.6 and
  90.0 ms, with 118, 361, 1,426 and 7,200 operation-record jobs, where
  replace-shrink makes 147, 588, 629 and 759. See below.
- **The length-preserving families are unchanged in kind**: 10 or 11
  requests and 0.2 to 0.4 MB whatever the size. There is no control sample of
  tier 3 in this run to compare their counts with.

### Open: a few stored cells in the large delete

The delete's stored payload is 8,704 bytes at 1 and 10 MiB, 16,896 at
100 MiB and 41,472 at 500 MiB: two and eight more 4 KiB cells. Each such cell
between two pieces is one more edit at Commit, which at that tree height
costs several hundred record jobs. Replace-shrink, which differs only in
moving the tail by 2 KiB and so in requests that do not begin on cell
boundaries, shows two extra cells at 500 MiB and no extra edits.

Not reproduced, and so not explained:

| Attempt | Result |
| --- | --- |
| Workspace `recognize`, aligned delete over 96 MiB, cells emulated as the engine trims them | 3 stored cells, all at the edit |
| Daemon `recognizer`, aligned and unaligned delete of 3 MiB through Commit | 42 record jobs each |
| Linux `mounted_recognizer`, aligned delete of a 64 MiB file by `dd` through the kernel | 1 piece row, 16,384 stored bytes, no pass needed the Store |
| Workspace `captured_piece_edits`, one delete at 1 and 6 MiB | same steps; record calls 41 and 171, as an insert's 44 and 172 (tree height) |

What the three reproductions lack is the benchmark's size: at 500 MiB the
recognizer's memory-only pass must sometimes be repeated over the Store.
That path is the first suspect and was not tested at scale. **Rule D-5 for
the delete: not met at 500 MiB as observed; left open.**

### Decisions by agent, pending owner review

1. **Phase 3's "nearly equal"** is reported as numbers, above, not judged.
2. **The falling direction keeps bytes of a write** between two requests,
   one chunk a slot, about 2.2 MiB for the daemon. The rising direction
   keeps a hash state.
3. **Byte-compared edges are not implemented.** They would save at most one
   chunk an edit edge (the stored payload is already 33 to 62 KiB a case)
   and add Store reads to the write path. A draft exists outside the tree.
4. **Runs are now bounded per command** after the owner's message of
   2026-10-11 ("we prefer a limit of 2 minutes timeout, for extreme case
   with 5 minutes"): no tier is run as one background command again.

### What failed or was not done

- The delete's extra cells at 100 and 500 MiB: open, above.
- Byte-compared edges: not done, decision 3.
- Tier 4: not sampled at this entry.
- Nothing was reverted.

## Tier 4 interrupted; storage rule — 2026-10-11, commit `bd46378f1`

Not a phase checkpoint. Product source is unchanged since `5239bfaa1`.

### What happened

- **This run filled the disk.** Every tag prepared its own set of inputs
  (source tree, expected tree, sealed Store and master volume a case), and
  every sample kept an exported closed Store beside its receipt; a sample
  that was FAIL also kept its clone volume and its stopped container. The six
  tags of this run (`c0`, `p1`, `p2a`, `p3a`, `p3d`, `p4`) held about 81 GB
  under the ignored result folder, where the five tags of 2026-10-10 held
  about 39 GB more, and the worktree's own build caches 23 GB. The volume
  reached 3.6 GiB free and a tier 4 preparation step failed with
  `StorageFull`.
- **The worktree's files were then removed from outside this session**, at
  13:04 local time, while a tier 4 sample was running. The branch, its
  commits and the worktree's registration were not touched; the tracked
  files were restored from the branch.
- **Lost with the ignored folders:** every receipt of this run, so the
  tables in this ledger and in the comments on issue 317 are now the only
  record of tags `c0` to `p3d` and cannot be derived again; the draft of the
  byte-compared edges; the Linux test wrapper and the case lists; the lock
  wrapper and the build caches (recreated from the main checkout, read only).
- **Tier 4, tag `p4`:** 33 of 42 cases had been sampled (23 small, 9 at size
  100, `payload-random-read-500`). `tiny-create-500` failed before its sample
  on a record truncated when the disk was full; `tiny-stat-500` was running
  when the files went. No `p4` row had been read into a table. **No `p4`
  result is reported.**

### Storage rule (owner, 2026-10-11) and the driver

"keep at most two copies of them (one original copy (never change). one for
test copy which is initially clone from original copy)".

| Commit | Subject | Production LOC |
| --- | --- | --- |
| `bd46378f1` | Benchmark driver: one original and one test copy of a payload | 81714 -> 81714 (delta +0) |

- **Original:** the prepared folder of a case and its master volume, once,
  under `issue316-originals/`, shared by every tag. Replaced, never
  duplicated, when the product or harness source it was prepared from
  differs from the current one or its preparation did not finish.
- **Test copy:** the sample's clone volume, every container on that volume
  and the exported closed Store. Removed as soon as the sample has ended,
  whatever its status; `payload-cleanup.json` beside the receipt records it.
  Receipts, logs and counts stay. A later offline census of the sample is not
  possible, and the harness's own receipt still says "retained" for what the
  driver removes afterwards.
- `tier.py` only prints a tier's cases now; its whole-tier route is removed.
- The harness engine is unchanged.

### Checks at `bd46378f1`

- `check_cleanup.py`: a made-up sample with a claimed volume, a running and
  a never-started container on it, an exported Store and an unclaimed
  volume. All seven checks true.
- Two real samples through the new route, tag `s1`:

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| delete-middle-4k-on-10mib-ops-1 | INELIGIBLE | PASS | 66.7 | 13.5 | 132 | 508 | 3897 | 0.3 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 68.7 | 18.0 | 171 | 867 | 5522 | 0.3 |

  The insert is `independent-graph failed with exit 1`, the retention guard
  (O-6, with the owner); its requests, writer jobs and statements equal the
  `p3d` row. The second case reused the first one's master volume. After the
  samples the result folder held 3.8 MB and the two originals 73 MB; the
  failed sample's volume and container were gone. `clean originals` then
  removed both originals and the master volume with the second of them.

### Mistakes of this run, as they happened

- **Storage was never measured.** Nothing in this run looked at free space
  or at the size of its own output until a step failed.
- A piped command hid the first failure: the preparation call that hit the
  full disk printed nothing and one of its records was truncated.

### Left as found

- **Docker still holds what earlier tags kept:** the clone volume and the
  stopped container of each FAIL sample, and one master volume for each
  distinct input of each tag. With the receipts gone these can no longer be
  told apart from another agent's by evidence, so none was removed.
  Removing them is the owner's decision.
- One daemon container of this run, matched to its receipt by volume, was
  stopped and removed with its volume.

### What failed or was not done

- Tier 4 samples: none reportable; to be sampled again through the new route
  under a new tag.
- Tier 4 checks (full package tests, Clippy on all targets, guard and
  self-tests, mounted proofs): not run at this entry.
- Nothing was reverted.

### Stop: Docker's own disk is full (same day, after `8024cc318`)

Tier 4 was started again through the new route under tag `p5`. 37 of 42
originals were prepared; five (`workspace-clean-commit`, `-fixed-move` at
sizes 100 and 500, `-distributed-sdk-edit` at 100) failed in Store install
with `ConnectionReset`, and a plain `docker run` then answered
`no space left on device` from the engine's snapshot folder. The host had
214 GiB free at that moment: the limit is Docker's virtual disk.

- **No `p5` case was sampled.** All 37 originals and their master volumes
  were removed again with `clean originals`, so this run holds nothing in
  Docker that it can identify.
- **What fills it, as counted:** 302 stopped containers of the benchmark
  image, 113 sample volumes and 77 master volumes, 87 of those volumes used
  by no container, and 36 daemon containers running for 7 to 21 hours.
  `docker system df` reports 125 GB of containers and 69 GB of volumes.
  Part of it is from this run's earlier tags; none of it can be attributed
  by evidence now.
- **Blocked until the owner frees it:** every benchmark sample and the
  Linux mounted proofs. Host tests, Clippy and the guard are not blocked.
- Driver fix in the same commit: removing an original also removes the
  setup container a failed preparation leaves on its master volume, and a
  master volume that was never created is not reported as a failure.

## Tier 4 samples, tag `p5` — 2026-10-11, sampled at `061eceeee`

Product source is `5239bfaa1`'s. The owner removed Docker's stopped
containers (112.2 GB reclaimed), after which the engine accepted work again.
Sampled through the storage rule's route: 42 originals prepared once, each
sample's test copy removed when the sample ended, the originals removed
after the last sample. The result folder holds 136 MB for the 41 samples.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| payload-create-100m | INELIGIBLE | PASS | 226.4 | 783.2 | 814 | 4137 | 31810 | 106.9 | 061eceeee |
| payload-create-10m-compact-v2 | INELIGIBLE | PASS | 61.7 | 82.4 | 94 | 537 | 3730 | 10.9 | 061eceeee |
| payload-create-1m-compact-v2 | INELIGIBLE | PASS | 35.4 | 18.0 | 22 | 177 | 922 | 1.3 | 061eceeee |
| payload-random-read-1-compact-v2 | INELIGIBLE | PASS | 34.6 | 9.7 | 6 | 52 | 236 | 0.2 | 061eceeee |
| payload-random-read-10-compact-v2 | INELIGIBLE | PASS | 42.4 | 7.7 | 15 | 61 | 254 | 0.2 | 061eceeee |
| payload-random-read-100 | INELIGIBLE | PASS | 50.7 | 9.6 | 105 | 151 | 434 | 0.2 | 061eceeee |
| payload-random-read-500 | INELIGIBLE | PASS | 150.6 | 11.2 | 503 | 550 | 1232 | 0.2 | 061eceeee |
| small-file-delta-10x30-v1 | INELIGIBLE | PASS | 1334.5 | 236.0 | 402 | 2919 | 14049 | 0.3 | 061eceeee |
| tiny-bulk-create-1-compact-v2 | INELIGIBLE | PASS | 144.7 | 99.8 | 1429 | 14865 | 64387 | 1.5 | 061eceeee |
| tiny-bulk-create-10-compact-v2 | INELIGIBLE | PASS | 374.1 | 328.3 | 4651 | 41160 | 188401 | 11.7 | 061eceeee |
| tiny-bulk-delete-1-compact-v2 | INELIGIBLE | PASS | 124.0 | 62.3 | 1145 | 9966 | 53091 | 0.4 | 061eceeee |
| tiny-bulk-delete-10-compact-v2 | INELIGIBLE | PASS | 329.0 | 133.6 | 3012 | 22772 | 129856 | 0.6 | 061eceeee |
| tiny-bulk-delete-100-mixed-v3 | INELIGIBLE | PASS | 437.3 | 202.1 | 4987 | 36093 | 210351 | 0.9 | 061eceeee |
| tiny-bulk-delete-500-mixed-v3 | INELIGIBLE | PASS | 2028.1 | 858.6 | 21187 | 146056 | 872771 | 3.3 | 061eceeee |
| tiny-create-1-compact-v2 | INELIGIBLE | PASS | 44.6 | 12.2 | 16 | 140 | 645 | 0.2 | 061eceeee |
| tiny-create-10-compact-v2 | INELIGIBLE | PASS | 54.5 | 18.6 | 115 | 938 | 4380 | 0.3 | 061eceeee |
| tiny-create-100-mixed-v4 | INELIGIBLE | PASS | 92.5 | 48.1 | 736 | 5565 | 26688 | 0.6 | 061eceeee |
| tiny-create-500-mixed-v4 | INELIGIBLE | PASS | 258.0 | 195.1 | 3496 | 27941 | 131288 | 1.8 | 061eceeee |
| tiny-stat-1-compact-v2 | INELIGIBLE | PASS | 50.5 | 10.5 | 4 | 51 | 249 | 0.2 | 061eceeee |
| tiny-stat-10-compact-v2 | INELIGIBLE | PASS | 42.0 | 10.8 | 22 | 69 | 501 | 0.3 | 061eceeee |
| tiny-stat-100-mixed-v4 | INELIGIBLE | PASS | 52.4 | 9.8 | 112 | 159 | 1671 | 0.4 | 061eceeee |
| tiny-stat-500-mixed-v4 | INELIGIBLE | PASS | 96.8 | 15.3 | 512 | 559 | 6871 | 0.6 | 061eceeee |
| tiny-unlink-1-compact-v2 | INELIGIBLE | PASS | 47.1 | 12.6 | 12 | 122 | 594 | 0.2 | 061eceeee |
| tiny-unlink-10-compact-v2 | INELIGIBLE | PASS | 53.5 | 16.5 | 75 | 608 | 3301 | 0.3 | 061eceeee |
| tiny-unlink-100-mixed-v4 | INELIGIBLE | PASS | 73.6 | 32.9 | 435 | 3035 | 17989 | 0.4 | 061eceeee |
| tiny-unlink-500-mixed-v4 | INELIGIBLE | PASS | 222.5 | 99.8 | 2035 | 13939 | 83656 | 0.6 | 061eceeee |
| workspace-clean-commit-1-compact-v2 | INELIGIBLE | PASS | 0.0 | 9.7 | 0 | 47 | 204 | 0.2 | 061eceeee |
| workspace-clean-commit-10-compact-v2 | INELIGIBLE | PASS | 0.0 | 9.6 | 0 | 47 | 204 | 0.3 | 061eceeee |
| workspace-clean-commit-100-mixed-v4 | INELIGIBLE | PASS | 0.0 | 11.9 | 0 | 47 | 204 | 0.3 | 061eceeee |
| workspace-clean-commit-500-mixed-v4 | INELIGIBLE | PASS | 0.0 | 12.6 | 0 | 47 | 204 | 0.5 | 061eceeee |
| workspace-dense-rewrite-1-compact-v2 | INELIGIBLE | PASS | 79.1 | 42.0 | 437 | 1950 | 11504 | 1.4 | 061eceeee |
| workspace-dense-rewrite-10-compact-v2 | INELIGIBLE | PASS | 307.1 | 327.6 | 3146 | 20751 | 104003 | 11.5 | 061eceeee |
| workspace-dense-rewrite-500-mixed-v4 | INELIGIBLE | PASS | 3352.3 | 13298.9 | 33361 | 222681 | 1154238 | 541.5 | 061eceeee |
| workspace-distributed-sdk-edit-1-compact-v2 | INELIGIBLE | PASS | 41.6 | 10.6 | 12 | 94 | 444 | 0.2 | 061eceeee |
| workspace-distributed-sdk-edit-10-compact-v2 | INELIGIBLE | PASS | 46.7 | 15.9 | 75 | 418 | 2199 | 0.3 | 061eceeee |
| workspace-distributed-sdk-edit-100-mixed-v4 | INELIGIBLE | PASS | 114.7 | 84.5 | 745 | 4113 | 21526 | 0.8 | 061eceeee |
| workspace-distributed-sdk-edit-500-mixed-v4 | INELIGIBLE | PASS | 281.5 | 352.3 | 3160 | 20374 | 100197 | 3.0 | 061eceeee |
| workspace-fixed-move-1-compact-v2 | INELIGIBLE | PASS | 50.0 | 12.6 | 16 | 151 | 700 | 0.2 | 061eceeee |
| workspace-fixed-move-10-compact-v2 | INELIGIBLE | PASS | 50.0 | 10.7 | 16 | 151 | 700 | 0.3 | 061eceeee |
| workspace-fixed-move-100-mixed-v4 | INELIGIBLE | PASS | 44.7 | 17.9 | 16 | 151 | 700 | 0.3 | 061eceeee |
| workspace-fixed-move-500-mixed-v4 | INELIGIBLE | PASS | 36.2 | 29.2 | 16 | 151 | 700 | 0.5 | 061eceeee |

- **41 rows: all INELIGIBLE with proof PASS.** Each receipt has functional
  PASS; ineligible for the declared interference. No row is PASS.
- **1 case has no result: `tiny-bulk-create-500-mixed-v3`.** The driver
  started it with 43 s of its own budget left and stopped it at that limit.
  That is a stop by this run's tooling, not a product result, and the case
  is not sampled again at this source. The driver now starts a sample only
  with 75 s left (same commit as this entry).
- **The three cases of these families sampled at `p3d`** (`payload-create-500m`,
  `workspace-dense-rewrite-100-mixed-v4`, `tiny-bulk-create-100-mixed-v3`)
  were not sampled again; their rows are in the `p3d` entry and equalled the
  control in requests, writer jobs and statements.
- **No control sample of the other 41 exists in this run**, so their counts
  are recorded and not compared. Rule V-4 for them is therefore not shown by
  this run beyond the three rows above.
- **Not runnable at this base, as registered `pending`:**
  `file_size_transition`, `git_tool_workflow`, `dedup_branch_history`,
  `mixed_load_bearing`. Not ported.
- The 33 samples of tag `p4` remain lost and unreported.
- Timings are single diagnostic samples.
