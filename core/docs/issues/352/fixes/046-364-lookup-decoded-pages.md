# #364 hot spot 3 · kernel lookups keep decoded pages (C); recorded directory counts (B) dropped

> **Status:** Current fix record, 2026-10-20. C on branch `issue364-item3`, on origin/main `3bdc9d3efc`.
> Measured on the pre-item-2 base `847dd666d5`; item 2 does not touch the lookup path. B was built and
> measured, then dropped under the owner's 5 ms rule: it saved nothing on the refresh. B is kept unlanded
> on local branch `issue364-item3-with-b`.

| | |
| --- | --- |
| Trigger | #364 item 3, the range refresh's kernel lookups (r015 `refresh` step; 772 ms of lookup daemon time; pnpm refresh on the mount 1.7 s against 0.9 s native). In a warm lookup, about 75% of the time went to copying three pages out of the canonical cache and decoding each whole page to find one row |
| Owner decision | "Build options B (record directory link counts at Commit) and C (a bounded decoded-page cache only, no read-validation change) for #364 item 3 … Measure cold and warm lookups old vs new." Then, 2026-10-20: judge on whole-call time; "If B or C saves under 5 ms on the refresh, drop it and say so in one line" ([5 ms floor](../../../../../docs/general/agent-measurement-policy.md)) |
| Kind | code path (read cache); no format change |
| Commits | `issue364-item3`: the replay harness, then C |
| Binaries | `refresh_lookups` and `relink_commit` test binaries, release, built in the pinned image `378b799ef433`, one target directory per arm. Arms: old `847dd666d5`, C `050308e466`, B (cherry-pick onto `847dd666d5`, measurement only), B+C `5930084768`. SHA-256 of each binary is in the build receipts |
| Regression tests | new `layerfs-workspace/tests/decoded_pages.rs` (4); adapted `kernel_visit.rs` and `shared_cache_client.rs` |
| Production LOC | 103,702 → 103,921 (delta +219), `tools/production_loc.py --root`, first parent vs committed tree. Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812) |

**B dropped:** recording counts at Commit saved under 5 ms on the refresh replay in every measured case (r015 +2.5 ms, relinked +10 ms, and B+C slower than C alone), so per the owner's rule it is not landed.

## Design

`DecodedPages` (Content, `filesystem/decoded.rs`) keeps the decoded rows of
inode and directory pages by object identity.
- **Budget.** It holds a fixed budget of charged bytes (`DECODED_PAGE_BYTES`, 16 MiB) and evicts the least recently used page first.
- **Charge.** Each page is charged its entries × `size_of::<WireEntry>()`, plus the heap bytes of its names, plus 128 bytes for its map entries and age.
- **Port.** `AuthenticatedObjects` gains `decoded_pages()`, which returns None by default. A provider that returns None reads exactly as before.

**Reads that use it.** The inode reads (`lookup`, `lookup_many`, `rows_after`)
and the directory reads (`load`, `lookup_many`, `list_after_bytes`,
`root_shape`) read their misses as one batch. Each missed page is
size-checked against `MAXIMUM_PAGE_BYTES`, decoded and kept.

**Validation is unchanged.**
- Checks that belong to the page itself (size ceiling, decode) run when the page is decoded.
- Checks that depend on where a read found the page run on every use, kept page or not:
  - the fill rule off the root;
  - the level and largest key the parent summarized;
  - the left sibling's key;
  - a value in every leaf row;
  - a child in every branch row.
- A kept page answers only a read of its own grammar, so a directory page never answers an inode read.
- `page_shape`, now unused, is removed.

**Workspace.** `CanonicalCache` keeps one `DecodedPages` with the budget
`min(DECODED_PAGE_BYTES, canonical allowance)`, so a zero allowance keeps
none. `with_decoded` sets the budget explicitly. `ClientWork.decoded` reports
hits, misses, evictions, the charge and the number of pages.

### Why each new piece

Listing at the C commit, counter `tools/production_loc.py --files`, changed
production files only (production LOC, before → after):

```
layerfs-content/                                  [+201]
  src/filesystem/decoded.rs             — → 207    new
  src/filesystem/directory/codec.rs   156 → 152    (page_shape removed)
  src/filesystem/directory/read.rs    292 → 297    (reads through kept pages)
  src/filesystem/inode/read.rs        242 → 235    (reads through kept pages)
  src/filesystem/mod.rs                46 → 47
  src/object/access.rs                 44 → 47     (decoded_pages port)
layerfs-workspace/                                [+18]
  src/base/cache.rs                   305 → 312    (one budget per cache)
  src/base/client.rs                  275 → 279    (offers it, reports work)
  src/base/view.rs                    307 → 310
```

Nothing kept a decoded page before this change:
- The canonical cache keeps authenticated bytes, which every read copies out and decodes again.
- The count LRU and the metadata cache keep answers, not pages.

The reads are Content's, so the cache sits behind the same
`AuthenticatedObjects` port that supplies their bytes. A provider without
the cache (the SDK, tests) is unchanged.

## Tests

- **`decoded_pages.rs`:**
  - a kept page answers without a canonical acquisition;
  - every lookup, listing and row walk is equal with and without kept pages;
  - the budget holds its charge and evicts the oldest page;
  - a kept directory page never answers an inode read.
- **Adapted tests.** `kernel_visit` and `shared_cache_client` count a decoded hit as the canonical acquisition it replaces. The canonical eviction bench keeps no decoded pages.
- No assertion value changed and no test was deleted.

## Checks

- **Linux** (pinned image, B+C build `5930084768`, a superset of C):
  - 184 test binaries pass across content, overlay, history, persistence, workspace, store-service, api and daemon. The mounted and `kernel_*` binaries ran with `--device /dev/fuse --cap-add SYS_ADMIN --security-opt apparmor=unconfined`.
  - Two daemon tests fail, both known:
    - `fp21_detach_stages` (0/2) is F-047, which fails on main since A1;
    - `complete_installed_roots` (1 failure) is the huge case, which needs `LAYERFS_Q1_PREPARED` (known NOT_RUN).
  - Clippy is clean.
- **Host** at the final SHA: see the commit and the liaison report.
- **Build jobs.** Builds ran at `-j 2` while `~/lfs-history/QUIET` existed, otherwise `-j 6`. Each receipt records its QUIET state.

## Performance, old vs new

Linux, pinned image, one sample per arm, 1-minute load 8.8–10.6,
Disposable/WAL/OFF.

**The replay.** `layerfs-api/tests/refresh_lookups.rs` replays the refresh step's kernel lookups:
- 6,000 lookups from the r015 head, in the order the range issued them, against a fresh copy of the Store;
- **cold** uses a fresh daemon cache;
- **warm** replays the same lookups again in the same process.

**Stores.** "Relinked" is r015 after a full relink Commit (38,135 files).

| Store | Arm | Cold µs/lookup | Warm µs/lookup | Cold daemon ms | Warm daemon ms |
| --- | --- | --- | --- | --- | --- |
| r015 | old | 74.3 | 27.5 | 446.1 | 165.0 |
| | C | **49.6** | **14.0** | **297.4** | **84.1** |
| | B | 74.8 | 27.5 | 448.6 | 164.8 |
| | B+C | 50.3 | 12.7 | 301.6 | 76.3 |
| relinked | old | 69.2 | 27.0 | 415.3 | 161.7 |
| | C | **46.7** | **12.7** | **280.3** | **76.0** |
| | B | 70.9 | 27.3 | 425.6 | 164.0 |
| | B+C | 46.4 | 13.0 | 278.4 | 78.2 |
| r015, whole tree (47,425 lookups) | old | 73.8 | 37.6 | 3,498.9 | 1,784.1 |
| | C | **33.1** | **12.4** | **1,568.1** | **590.2** |

- **On the refresh's lookups.** C saves 149 ms cold and 81 ms warm of daemon time on r015, and 135 / 86 ms on the relinked Store. This is well over the 5 ms floor.
- **On the whole tree.** C saves 1.9 s cold and 1.2 s warm.
- **Real refresh estimate.** If it scaled like the cold replay, the real refresh's 772 ms of lookup daemon time would fall to about 520 ms. The pnpm refresh on a mount was not run end to end; **this is an estimate**.
- **B.** Recording every count (an audit-written upper-bound Store) still did not help: 66.4 / 29.8 µs against old's 69.2 / 27.0.
- **C on Commit.** C does not change Commit work. On a full relink, statements and root are the same as old's.

**Memory bound and hit rate.**
- **Bound.** At most 16 MiB of charged rows per daemon, shared by every Workspace through the canonical cache owner. The charge accounts for the stored rows; it is not a measured allocation.
- **Use in these runs.**

  | Run | Charged | Pages kept | Evictions |
  | --- | --- | --- | --- |
  | 6,000 lookups | 2.6–4.3 MiB | 2,001–2,216 | 0 |
  | whole tree | 12.6 MiB | 7,783 | 0 |
- **Hit rate.**
  - 6,000 lookups: 98% cold (109,053 hits / 2,216 misses), 100% warm.
  - Whole tree, cold: 99%.

## Limits

- One sample per arm on a loaded host.
- The replay covers the refresh's lookups, not a whole pnpm refresh. The 520 ms figure is an estimate.
- A page evicted from the budget costs the same read and decode as before.

Receipts in this session's scratch:
- `out/i3/*.txt`: each records its arm, Store, QUIET state and load;
- `out/i3build-*.txt`: build logs and binary SHA-256;
- the Linux results `out/i3grp-*.res`, `out/i3d.res`, `out/i3lx/`.
