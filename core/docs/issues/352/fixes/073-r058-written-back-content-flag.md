# F-073 · r058: diff_commits called a file written away and back a content change

> **Status:** Current fix record (#352 range 058, a1 and a2 stop). Product
> change in `layerfs-content` (`compare/bytes.rs`) and `layerfs-store-service`
> (`read/compare.rs`). Store format, overlay schema and construction are
> unchanged. Not an F-063 interaction.

| | |
| --- | --- |
| Trigger | [range 058](../ranges/range-058.md): the checkpoint's path check listed `packages/cordis/tool-cordis/src/api-catalog.ts` (git 361, LayerFS 537 paths). Its bytes were git's at both heads (blob `4d986582`, 234,915 B); ids and the full tree compare passed |
| Issue | #352 |
| Kind | code path: `diff_commits` and `diff_branches` items, and `fs.diff_files` `contentEqual`, decided "content changed" from unequal content roots |
| Binaries | the run's SDK addon `4c52d23c` (with F-063); pre-F-063 addon `bf1cd303` (origin/main `6e8986ff46`); fixed addon `7a35c33c` (Linux, pinned image `378b799ef433`); runtime image `d3773b4e` |
| Commits | this commit; regression tests `core/crates/layerfs-api/tests/sdk_written_back.rs` |
| Recovery | none: no attempt reran. Probes ran on clones of `p3-main-x-b`'s Store, copied through a read-only mount (sha256 `e8c61042…`) |

## What happened

The file's first-parent history on the run's Store, read with
`operator.files.history`:

| Commit | Step | Size | Content root |
| --- | --- | --- | --- |
| `12cf9467…` | `r057.reconcile` (the r57 head's version) | 234,915 | `e6fffe32…` |
| `12c07208…` | `merge r058-3-apps-web` (lane `s0115`) | 227,085 | `6f66f1e2…` |
| `12a55361…` | `r058.reconcile` (the r58 head's version) | 234,915 | `2d001b97…` |

`diff_commits` from `12dbfee1…` (r57 head) to `12286c64…` (r58 head), as the
verify step paged it, gave this item:

```json
{"path":"/packages/cordis/tool-cordis/src/api-catalog.ts","kind":"Modified","type":"file",
 "before":{"type":"file","inode":699528},"after":{"type":"file","inode":699528},
 "content":true,"identity":false,"metadata":true}
```

It is the same inode, so no rename was involved. The checkpoint check accepts
a Modified file not in git's list only with `content: false`
(`steps.mjs` `comparePaths`), so the path counted as extra.

## Root cause

**A content root depends on how a file was built, not only on its bytes. The
difference took unequal roots to mean unequal bytes.**

- Both 234,915-byte versions were written by `fs.write` on the Store route,
  so F-063 never ran.
- Each write went through the F-005 localized-edit construction. The trace
  shows `edit.compare`, `edit.split`, `content.chunk` and `edit.finish`.
- A localized edit keeps the extents of the file it edits:
  - r57's version was built over a 221,356-byte predecessor;
  - r58's version was built over the lane's 227,085-byte one.
- The same bytes therefore got two mappings and two roots. CAS handbook §2
  allows this explicitly.
- `read/compare.rs` set `content` from
  `l.content_root != r.content_root`.

Fix 044's digest reuse does not apply here either way. It follows only fresh
inodes written by exact appends. An in-place `fs.write` over an existing file
is neither.

## Replay of the sequence

A clone of the r58 Store, one sample per arm. Each arm forks the r57 head,
writes the lane's bytes (blob `31b1793f`), then writes the checkpoint's bytes
back (blob `4d986582`), and diffs from the r57 head.

| Arm | Lane root | Write-back root | Item |
| --- | --- | --- | --- |
| pre-F-063 addon `bf1cd303` | `6f66f1e2…` | `2d001b97…` | `content: true`, `identity: false`, `metadata: true` |
| run addon `4c52d23c` (F-063 active) | `6f66f1e2…` | `2d001b97…` | the same |

Both arms reproduce the run's roots exactly, so the result is deterministic
and does not depend on F-063.

## Fix

The difference proves inequality instead of assuming it.
`layerfs_content::compare::same_file_bytes(reader, left, right, scope)`:

- Equal roots: equal, with no read.
- Different lengths: unequal, after one root read each.
- Otherwise it walks both files' extents together:
  - an extent both files take from the same chunk, at the same offset and
    chunk offset, is skipped;
  - everything else is read from both sides in windows of at most 256 KiB
    and compared. This covers misaligned extents, holes and whole-file roots.
  - It stops at the first window that differs, and holds at most two
    windows in memory.

`read/compare.rs` uses it, through `same_content`, only for two regular files
whose roots differ:

- the item's `content` flag;
- whether a same-inode pair with unchanged metadata is listed at all;
- `fs.diff_files`' `contentEqual` for files that are not text. Text files
  were already compared by their text.

**Why not make the write reproduce the old root?**

- The root depends on the edit's predecessor by design. Making a write
  canonical would mean rebuilding without the localized-edit structure, which
  makes edit cost depend on file size again (owner requirement, #316). The
  alternative is a full-bytes digest lookup on every in-place write.
- Even then, the earlier version's root was not recorded in `file_digest`:
  it was built by an edit, and fix 044 records only fresh, appended files.
- Fixing the comparison covers every route (Store edit, rename-over,
  Workspace in-place write) and keeps F-063's and F-005's storage savings.

## Proof

**`sdk_written_back.rs`** (two tests). In each, Init saves a 400 KiB file,
and an edit gives the start version an edit-built root, as r57's reconcile
did. Then:

1. **Store route** (`fs.apply`): an edit elsewhere, then the start bytes
   written back.
   - The edit is listed with `content: true`.
   - Start to write-back: no content change. `fs.diff_files` answers
     `Equal`, `contentEqual: true`.
   - A same-length change of the last byte is still `content: true` and
     `contentEqual: false`.
2. **Rename-over** (a Workspace `<name>.save` then rename, the liaison's
   case): the edited bytes, then the start bytes saved over the path.
   - The write-back is listed for its new inode (`identity: true`) with
     `content: false`.
   - `contentEqual` is true.

Without the `read/compare.rs` change, both tests fail with the run's item
shape: `content: true`, plus `identity: true` for the rename. With it, both
pass.

**The run's own checkpoint.** `diff_commits` `12dbfee1…` → `12286c64…`, all
pages, on the r58 clone, one sample per addon, host 1-min load 5.4:

| Addon | Items | Files | Modified files with `content: false` | `api-catalog.ts` | Wall time |
| --- | --- | --- | --- | --- | --- |
| run `4c52d23c` | 74,378 | 65,018 | 64,148 | `content: true` | 11.3 s |
| fixed `7a35c33c` | 74,378 | 65,018 | 64,149 | `content: false` | 9.5 s |

Only that path changed. The byte check costs no visible time on the real
checkpoint; the 1.8 s difference is within one-sample noise. The fixed addon
was built before `pair_differs` was rewritten for Clippy. The rewrite has the
same logic.

## Checks

- Clippy `-D warnings`, `--all-targets`, on content, store-service and api:
  host `+1.85.1` passes; Linux (image `378b799ef433`) passes.
- Tests, each run ≤120 s:
  - content: 485 passed, 2 ignored;
  - store-service: 3 passed;
  - layerfs-api: all 42 integration binaries pass (they share the changed
    test support), including `sdk_written_back` (2).
- Boundary guard: the same 57 violations as origin/main. Tool self-tests:
  50 ok.
- rustfmt: the changed files are clean.

## Left open

- **Merge** (`merge/decide.rs` and `merge/units.rs`) still decides
  "unchanged" by root. Two sides that both rewrote a file to the same bytes
  under different roots are treated as both changed. For text this
  three-way merges to the same bytes. For binary it may conflict. No range
  has shown it.
- **`operator.files.history`, `files.stats` and `fs.blame`** count a
  rewrite to the same bytes under a new root as a revision. That is a
  history listing, not a correctness check, and is left as is.
- **Mapping structure.** I did not decode the two roots' extent layouts
  from the Store. The trace's construction counters show what differs:
  - the r58 write-back saved 40,421 new canonical bytes;
  - r57's root `e6fffe32…` is not reused by it.
