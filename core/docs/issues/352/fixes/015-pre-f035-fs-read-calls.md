# Pre-range 15 · F-035 · fs read calls: byte-at-a-time scan, re-walked pages, unpruned glob

| | |
| --- | --- |
| Trigger | `grep_tree` probe: one whole-tree `fs.grep` of 49.7k paths and 427 MB takes ~9.3 s (~46 MB/s) on dev range 15 (`dev352-p3f`, lead's tooling diagnosis, 2026-10-18) |
| Kind | 1 forward-only (REBUILD.md): SDK read-call code path only. No Store, daemon or record format change; only the page token's contents change (pending owner decision on the JS page token) |
| Old Stores | not involved |
| Old data | not involved |
| Compatibility test | not applicable: no stored format changes. Results proved equal to the old code by the equivalence test |
| Recovery | none: no Store change |
| Owner decision | 2026-10-18: optimize the calls before adding any API option. The proposed opt-in `exclude` argument on `fs.grep` is dropped |
| Issue | GitHub `Ephemeral-AI-Lab/layerfs#354` |
| Branch | `issue354-fs-read-calls`, own worktree; merging into `dsh-history-replay` is a later owner decision |
| Status | implemented on the branch; page tokens (step 4) on hold; merge is an owner decision |

## Old design (HEAD `8cfda6e0b`)

`fs.grep` (`layerfs-store-service/src/sdk/reads.rs:171`) walks the tree with
`window::walk`, and for each regular file calls `window::lines`
(`sdk/window.rs:27`), which:

1. opens the file view once, then reads **16 KiB windows**, each one a Store read
   (a chunk of 8–32 KiB may be decoded for two windows);
2. per window: scans for NUL, validates UTF-8, drains the validated bytes from a
   carry buffer;
3. walks the window **one byte at a time**: a hand-written KMP state machine
   for the pattern, a line counter and a copy of each line's first bytes, in
   one branchy loop.

`fs.read` uses the same `window::lines` loop with no pattern. Paging in
`fs.grep`, `fs.glob` and `fs.list` passes a **count** (`nextPagePos`): page *j*
re-walks from the start and skips *j·k* results (`reads.rs:189`, `:234`, `:126`).
`fs.glob` walks the whole tree whatever the pattern. The shared `Walker`
(`window.rs`) has no per-call memo of the inode table's upper pages, unlike
`fs.list` (`011-a1-list-entry-lookups.md`).

```
before                                   after (recommended)
walk tree, file by file (no memo)        walk tree, per-call memo; glob prunes by pattern prefix
  read 16 KiB windows (Store read each)    each distinct content id scanned once per call
    NUL scan, UTF-8, drain copy              chunk-aligned reads, each chunk decoded once
      byte loop: KMP + lines + copy            whole-buffer search; lines located near matches
page j: re-walk, skip j*k                page j: resume after the last path/name/offset
```

## New design

1. **Whole-buffer search.** Find matches in a whole buffer with the standard
   library's substring search, then find the line start, end and number only
   around a match. Counting newlines over a buffer vectorizes. `fs.read` uses
   the same buffer-wide line scanner.
2. **Chunk-aligned reads.** Windows follow the file's chunk boundaries, so each
   chunk is read and decoded once. Do this if step 0 shows reading dominates.
3. **Each distinct content once per call.** Files with the same content id give
   the same matches. One call scans each id once and reports every path in walk
   order. The memo lives for one call only (no cache credit across calls or
   measured phases) and is bounded by the reply budget.
4. **Resumable pages.** The next-page token carries a resume point: the last
   path for `grep`/`glob`, the last name for `list` (`list_after` already takes
   one), and line number plus byte offset for `fs.read`. It is checked against
   the call's pinned snapshot. A token from another snapshot is refused,
   never guessed.
5. **Glob prefix pruning.** Start the walk at the pattern's literal leading
   directories, and do not descend into a folder the pattern cannot match.
6. **Walker memo.** Reuse `fs.list`'s per-call memo of the inode table's upper
   pages.
7. **Parallel files** over the reader pool (F-025 fix 4), only if 1–6 leave
   grep read-bound, and as a separate measured step.

Generic by construction: no path, name or folder is special-cased or excluded.
Results are byte-identical to today: same order, line numbers, `Binary` skips
(NUL or invalid UTF-8), truncation flags and `hasMore`. Only the page token's
contents change.

## Scope extension: the Store read path (owner, 2026-10-18)

#354's measurement on range 14 main (1,263 files, 10.3 MB) showed `fs.read` is
read-bound in the Store, not in scanning: 594 of 606 ms in `FileView::open`,
29.2 SQL statements per file (36,900 total) for ~1.05 canonical objects per
file, so ~28 statements per object fetch, most likely delta-chain resolution
(whole-file chain depth up to 16). The owner extends #354 to optimize that
path: delta-chain resolution, the SQL statements per object fetch, and
`FileView::open` (for example batched chain lookups in one query, bounded
reuse of resolved bases within a read). Rules:
- measure first: statements, pages and time per chain step on range 14 and
  the P3 Store copy;
- results byte-identical; caches bounded and declared;
- **no change to delta depth or storage policy** (that trades storage for
  speed and needs a separate owner decision);
- files outside `sdk/` (`layerfs-content` file view, `layerfs-storage` read
  path) are now in scope; coordinate file overlap with the #352 fixer's #356
  work (workspace base lookups) through the #352 lead before editing.
F-042 (#357, exec over committed content) consumes this result.

## Complexity

*B* bytes scanned, *D* bytes of distinct content, *M* matches, *R* results paged
through, *k* per page, *S* file size.

| Call | Before | After |
| --- | --- | --- |
| `fs.grep` scan | O(B), per-byte loop, ~46 MB/s measured | O(D) whole-buffer, plus O(M × line) |
| `fs.grep` reads | one Store read per 16 KiB window; chunks may decode twice | one decode per chunk |
| paging `grep`/`glob`/`list` | O(R²/k) over all pages | O(R) plus one descent per page |
| `fs.read` of lines *s*–*e* | O(bytes to *e*), per-byte | O(bytes to *e*), buffer speed |
| `fs.read` paging a file | O(S²/page) | O(S) |
| `fs.glob` | O(whole tree) | O(subtree under the literal prefix, pruned) |
| walker | upper inode pages re-read per 64-entry window | once per call |

The seconds are not predicted: step 0 splits today's 9.3 s into read and decode
versus scan, from the existing `sdk.lines` / `content.read` trace timings, and
native `grep -rF` on the same tree is the reference.

## Layout

Snapshot `8cfda6e0b`, `tools/production_loc.py --files`, crate
`layerfs-store-service`; only the `sdk/` files this work touches are listed.

```
sdk/                                [830]  (partial: files this work touches)
  mod.rs                               17  (declares walk and search)
  args.rs                             159  (page token: resume point instead of count)
  reads.rs                            242  (read, grep, glob, list use the new pieces)
  snapshot.rs                         166  (unchanged)
  window.rs                           246  (buffer-wide line scan; Walker moves out)
  walk.rs                               —  new (Walker, per-call memo, glob prefix pruning)
  search.rs                             —  new (whole-buffer search, match to line, per-call reuse by content id)
```

No new dependency: `std` only. Making the transitive `memchr` crate a direct
dependency is a separate owner decision. No Store format change: a line
index for `fs.read` is out of scope.

## Proof

Branch `claude/issue354-fs-read-calls-58a66a`, pushed, not merged. Commits:
`a69a49549` (scan, content reuse, pruned glob, walker memo), `ae398c99f` (one
read pass per chunked file), `049a2f894` (one call's read caches, memoized
lookups), `68695cfdc` (grep roots in batches of 64), `0b0a883f0` (immutable
object reads without BEGIN/COMMIT). Pre-#354 binary: `a69a49549^`. Trees:
range 14 (1,263 files, 10.30 MB) and P3 (r15 checkpoint, 40,408 regular files,
427,061,438 B, 35,214 distinct contents, 80 binary).

### Step 0 split (pre-#354, P3, probe passes)

Walk 4.25 s; read 9.49 s (of which `FileView::open` 4.68 s, the 373 chunked
files' window reads the rest); old byte scan 0.68 s. Reading, not scanning,
dominated: 843 MB of canonical bytes were decoded for 427 MB of files. On
range 14: read 651 ms (open 627 ms), scan 21 ms, walk 245 ms.

A second split found during the read-path work: `fs.read` is ~95% fixed cost.
For 4,000 P3 files, `fs.stat` alone (snapshot, path lookup, size; no content)
was 682,053 of `fs.read`'s 714,456 statements and 1.157 of 1.158 GB of pack
bytes. Path lookup was ~159 statements, 38 objects and 281 KB of pack reads
per call: each component re-read the inode table's upper pages cold.

### Read-path breakdown (before the fix)

Each storage port call was BEGIN, its SELECTs, COMMIT; one delta-chain level
cost ~6 statements and 60–100 µs. Range 14: 5.5 statements per file at one
pack acquisition, 101.4 at 17. A fresh storage `Reader` per object demand
re-read packs: on P3 a shared reader across one walk cut statements 344,847 ->
178,032 and pack bytes 1.26 GB -> 257 MB.

### Equivalence

Old (`a69a49549^`) and new binaries' dumps are byte-identical after every
commit above: P3 grep (4 batteries: never-present, `import`, `e`, `\n`, `}\n`,
`a\nb`, `é`, `😀`, `the`, `export default`, two spaces, `TODO`; whole tree and
subtrees incl. a missing path and a file path), glob (3 batteries, 19 patterns
incl. `!`, `?`, trailing `/`, anchored and unanchored), list (5 paths), read
(4,000 files); range 14 grep, glob, list, read and full paging at page sizes
100 and 7 (paging equals one unpaged pass). `sdk_text_scan` compares the new
calls with a copy of the old window scan over ~90 crafted files: NUL and
invalid UTF-8 at window, block and chunk edges (a 32-file NUL sweep across
256 KiB blocks, 700 KB files), incomplete final characters, long lines,
widths around 1,024 and 49,152, empty files, duplicate contents, matches and
characters split across parts, late lines and late read starts. Mutants it
catches: wrong failing window, missing cross-part tail check, missing window
holdback.

### Statements per call (calls probe, one process per arm, fresh Store copy)

| Call | Pre-#354 | After `049a2f894` | After `68695cfdc` | After `0b0a883f0` |
| --- | --- | --- | --- | --- |
| P3 `fs.grep /` | 622,275 | 217,059 | 97,047 | 39,739 |
| P3 `fs.read` ×4,000 | 714,456 | 299,454 | 299,454 | 167,990 |
| Range 14 `fs.grep /` | 39,261 | 37,335 | 20,850 | 7,004 |
| Range 14 `fs.read` ×1,263 | 206,361 | 138,810 | 138,810 | 60,036 |

Statements per object: P3 grep 6.72 -> 0.65 (from `ae398c99f`'s 407,817),
P3 read 4.47 -> 1.95. The pre-#354 P3 grep figure is the timed arm below;
the others are from the calls probe at `ae398c99f`. Pack bytes (from `ae398c99f`): P3 grep
68.5 MB -> 18.1 MB (12.8 MB after the caches; batching raised it to 18.1 MB
because a batch's working set exceeds the 2 MiB pack cache), P3 read
1.158 GB -> 841 MB.

Peak RSS per call (`/usr/bin/time -l`, one process per arm): P3 grep 23.6 ->
38.0 MB (caches: 2 MiB pack bodies plus an isolated singleton, 512 KiB
decoded groups, 512 KiB pooled values; batch roots at most 4 MiB); P3 read
×4,000 21.3 -> 26.2 MB.

### Complexity

Paging is still count-based: step 4 (resumable tokens) is on hold with the
owner. Range-14 statements at page 1 vs page 100: grep 408 -> 720 before,
595 -> 521 now (page 1 rose because a window of 64 roots and their lengths
are read before the first match is returned); glob 336 -> 3,558 before,
80 -> 217 now; list 69 -> 84 before, 30 -> 35 now. Glob follows the pruned
subtree: the range-14 glob dump went from 7.6 s to 1.2 s. Each content is
scanned once per call; each chunk is decoded once per scan; the walker reads
directory pages and the inode table's upper pages once per call.

### Timing (one sample per arm)

Window granted by the owner's liaison, started on the user's "go" at 17:26,
2026-10-18. Host: macOS, 1-minute load 8.8–10.3 throughout, with a VM
process using ~3.5 cores. State per arm: a new process (no in-process
caches), a fresh Store copy for that arm only, warmed by reading the copy's
files once with `cat`, so the whole Store was in the OS page cache for both
grep arms alike. Native: the exported tree read once with `tar` first.

| Arm | Time | MB/s over 427.1 MB |
| --- | --- | --- |
| Old `fs.grep` (never-present pattern, whole tree) | 11.21 s | 38 |
| New `fs.grep` (same) | 2.93 s | 146 |
| Native `/usr/bin/grep -rF` (BSD grep 2.6.0) | 8.90 s | 48 |
| New `fs.read` ×4,000 files | 6.64 s | — |

Earlier diagnostic times on a loaded host (load 10–170) are not claims.

### Tests and checks

New: `sdk_text_scan`, `sdk_fs_reads_replay` (probes; skipped without a Store),
`sdk_root_batches`, `sdk_reads_under_publish` (40 Commits published to a fork
during 4 rounds of paged reads of main; every answer unchanged). Changed:
`sqlite_group_rows` and `sqlite_group_rows_indexed` exact statement counts
(whole-pack read 5 -> 3, single locate 3 -> 1 and 1 -> 0 transactions). No
tests deleted; no count-token test was touched because paging did not change.
All persistence, storage, content and store-service test binaries pass, each
≤120 s; daemon 48 of 50 (the other two need `LAYERFS_Q1_PREPARED` or a Docker
Linux binary and fail at that setup check). Clippy `-D warnings` clean for the
changed crates and the daemon; fmt clean on changed files; the boundary guard
reports the same 16 violations as before #354.

### Boundaries kept

No delta depth, storage policy or Store format change; no new dependency.
`StorePorts::objects_with` is the one new function in `store/ports.rs`.
`file_lengths` signatures and the one-length-per-id-in-order contract are
unchanged. Only object locates and pack reads run without a transaction; why
that is safe is stated on `Session::read_immutable` and in the `0b0a883f0`
message (insert-only locations, trigger-immutable packs, a pack id counter
that never goes back, page-only reclamation). Reads that pick a snapshot keep
their transaction. That argument is flagged for the owner.

## Continuation results (2026-10-18)

Full record: [#354 continuation findings](../../354/FINDINGS-20261018.md).
The text above is unchanged.

**Load labels.** The statement, object and pack-byte tables above and below
are deterministic counts, so host load does not change them. Only the timing
tables are load-sensitive:

- the 17:26 pass: load 8.8–10.3, not quiet;
- the final-identity pass: load 7.1–7.3 over 1 minute and about 10 over 5 minutes, with declared interference (#353's `sdk_merge_scale`, fseventsd, mds_stores).

Both are diagnostic on macOS. No timing on this branch is qualified.

**`b83871223`: inode-value reads without BEGIN/COMMIT.**

- `inode_value` is insert-only.
  - Writes: one plain INSERT per ordinal at publish, and a second INSERT of the same ordinal fails.
  - No production UPDATE or DELETE exists. The only ones are the test's deliberate corruption at `sqlite_inode_values.rs:196` and `:207`. The liaison checked `dsh-history-replay` and `issue360-storage` too.
  - `release_ordinals` gives back only an unwritten tail.
- **Revisit trigger:** a change that updates or deletes `inode_value` rows (#360 item 3, any GC) must move `inode_values` back into a transaction.
- Missing ordinals behave as before. At the port they are omitted (`sqlite_inode_values.rs:74-85`); a leaf read with a missing row still fails with "metadata ordinal missing" (`:205-215`).
- The exact-count test changes from 3 statements and 1 transaction to 1 statement and 0 transactions. It is updated to match the new behaviour, not weakened.
- Effect: fs.read on P3 drops from 42 to 29 statements per file.
- Commit order: it follows item 3 (`0b0a883f0`) with only a docs commit between them, so it can be dropped together with that commit.

**Final-identity proof** (product `b83871223`, old arm `2943275c8`):

- **Statements per file, old → new:**
  - P3 fs.read: 179.86 → 28.95; pack bytes 292,303 → 210,265 per file.
  - Range-14 fs.read: 163.44 → 40.63; pack bytes 87,018 → 47,288.
  - P3 grep: 15.40 → 0.80; pack bytes 12,126 → 447.
  - Range-14 grep: 39.31 → 5.51; pack bytes 5,777 → 644.
- **Delta depth or per-file overhead:** per-file overhead dominates. Chain depth adds about 6 statements per step, and only in the content phase.
- **Equivalence:** every grep, glob, list and read battery on both trees is equal to the pre-#354 dumps.
  - Range 14: full paging at page sizes 7 and 100 equals paging at 1,000 and the old dump.
  - P3: full paging of two greps and a list equals old at page size 500.
  - P3 glob `**` paging (49,710 items): the new arm is self-consistent, but the old arm cannot finish within the 120 s ceiling, so that comparison is NOT_RUN.
- **Memory:** P3 grep peaks at 9.37 MB, inside the 9.44 MB sum of the declared holders, against 7.43 MB on range 14, a 32× smaller tree.
- **Timing:** new grep 3.26 s and fs.read ×4,000 7.46 s.
- **Checks:**
  - Host `+1.85.1`: content, storage, persistence and store-service suites pass, each command ≤120 s, and clippy is clean.
  - Linux: the same suites pass, plus daemon non-mount 28/28.
  - The daemon mount tests are NOT_RUN: the container has no FUSE device.

**Paging** is still count-based (O(R²/k)). Tokens are held; see the
[cursor proposal](../../354/PAGE-CURSOR-PROPOSAL.md).

**Choices where the brief was silent:**

- inode values are read without a transaction, with byte-identical results, and the change adds no new code;
- equivalence old dumps were reused, not regenerated (same old identity);
- the old timed arms were not sampled again;
- no cross-call cache was added (it is an owner memory decision).

## A1: a Workspace reader keeps its storage caches (2026-10-18)

**Cause** (found by the RCA agent). `ReadSession::objects` built a fresh
storage `Reader` for every demand, so each FUSE request re-read, hashed and
decoded a whole pack to take one small object.

**Change.**

- A Workspace reader keeps one `KeptReads` (pack bodies, decoded groups, pooled values) from its first object or length demand until it is released at unmount.
- `objects` and `file_lengths` go through it, under the reader lock that the demand already held (`Storage::read_kept`, `lengths_kept`).
- Each demand takes a fresh decode arena, allocated only if it decodes. An arena holds a raw zstd context and is not `Send`, and making it `Send` would widen storage's audited unsafe module, so the arena is not kept.

**Bound.**

- The kept caches hold at most 3 MiB between demands: 2 MiB pack bodies, 512 KiB decoded groups and 512 KiB pooled values (`KeptReads::ORDINARY_BYTES`).
- On the read path the pool reader is given the shared pack cache, so its own pack cache stays empty.
- A demand that fails, or that leaves an isolated singleton pack (up to 16 MiB), drops the whole cache, and the next demand starts empty.
- With N mounted Workspaces this is up to N × 3 MiB.

**Positive only.** The cache keeps rows that never change once visible
(insert-only object locations, trigger-immutable packs, insert-only inode
values). It never records an absence.

**Lifetime.** The cache lives as long as the Workspace's reader: from the
first demand to the release at unmount. A pooled SDK reader handed back to
the idle list is released first, so it starts empty. The Store's control
reader (session 0) serves every SDK call and keeps none, so SDK fs calls
still use only their per-call caches; a cross-call SDK cache stays held for
the owner. **Measured phases must declare this cache's state.** A phase that
follows another in the same Workspace starts warm.

**Measured** (Linux, real kernel mount, `ls -l` of a committed directory of
10,000 files with distinct metadata, one sample per arm; ledger
`receipts-20261018/A1-LISTING-MEASUREMENT.txt`):

| Cold pass, 10,000 entries | Old (`b2549b33a`) | A1 |
| --- | --- | --- |
| listing digest | 66d15773311f4758 | 66d15773311f4758 (identical) |
| statements | 90,792 (9.08 / entry) | 50,607 (5.06 / entry) |
| object demands / ids | 40,235 / 40,395 | 40,235 / 40,395 (same demands) |
| pack selections | 40,235 | 107 |
| pack bytes | 468,079,142 (46,808 / entry) | 1,106,120 (111 / entry) |
| VmRSS after (daemon in-process) | 50,184 KiB | 52,404 KiB (+2,220 KiB) |

- **Run conditions:** load about 8 (1 minute), with other worktrees' agents active. The counts are deterministic; wall time is diagnostic.
- **Steady pass:** 414 → 268 statements, and 146 → 0 pack selections.
- **Ineligible first pair:** the first pair of runs used a fixture without fixed times. It is retained as INELIGIBLE: different digests, and metadata shared across files.
- **What remains:** the 5 statements per entry are locates and inode-value reads, one per new object. #356's sibling-length demand addresses those.

**A3 (pass the locate's PackInfo into `read_scoped_pack`): not done.**

- It would change the Storage→Persistence port signature: storage `port/persistence.rs`, persistence `objects_selection.rs`, and every provider and test double, all outside this lane's files.
- After A1 it would save one statement per pack selection, so at most 107 of the 50,607 statements here.

**Tests.**

- New `workspace_reader_cache` checks:
  - a repeated object or length demand on a Workspace reader runs no statement and returns identical bytes;
  - the control reader reads again;
  - a reader closed and mounted again starts empty.
- It fails with the cache disabled (mutant checked).
- New Linux `mounted_listing_reads` is the measurement.

**Checks.**

- Host `+1.85.1`: storage 19 binaries and store-service 24 pass, each command ≤120 s, and clippy is clean.
- Linux clippy is clean on storage, store-service and the daemon.
- Linux daemon tests without a mount: 25/25 pass.
- Linux mount tests in a FUSE container pass: `fp27_reader_health`, `mounted_store_read`, `mounted_concurrency`, `kernel_mount_routes`, `mounted_parallel_commits`, `mounted_cycles`, `mounted_listing_reads`.
- `mounted_commit::r5_8` fails the same way **without A1** at `b2549b33a`: Commit history lists 3 of 5 records. That failure predates A1 and lies outside this lane (History). Receipts: `m-mounted_commit*.log`.

No tests deleted.
