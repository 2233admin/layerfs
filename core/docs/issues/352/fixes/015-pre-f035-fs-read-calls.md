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
| Status | open |

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

## Proof (to be filled by the worker)

- **Equivalence:** old vs new over a replay snapshot (range 14 or a P3 dev
  checkpoint). Every `grep`, `glob`, `list` and `read` result is equal across
  many patterns and paths, including binary files, invalid UTF-8, long lines,
  matches across window and chunk boundaries, empty files and duplicate
  contents. Paging through the full results is equal to one unpaged pass.
- **Complexity:** paging cost is flat per page (statements per page at page 1
  vs page 100). Glob statements follow the pruned subtree.
- **Timing:** whole-tree grep, old vs new, one sample per arm, in a declared
  quiet window agreed with the #352 lead. Report MB/s and native `grep -rF`.
- **Tests:** each ≤120 s. Tests of the count-based page token are replaced, not
  nursed.
