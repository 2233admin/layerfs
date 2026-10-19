# #364 hot spot 2 · a relinked file reuses the object that holds its bytes

> **Status:** Current fix record, 2026-10-20, landed on main at `e009823a48` (owner: fs.write extra latency under 5 ms is
> ignored). Branch `issue364-item2`, on origin/main `f99b47bf2c` (measured on `029db0950f`). Overlay schema 37 → 38; the Store gains one table
> (`file_digest`), added empty to older Stores at open.

| | |
| --- | --- |
| Trigger | Range 15 a4 ([BASELINE_R15.md](../BASELINE_R15.md) §7; issue #364 item 2). The clean-relink repair's Commit: 11.8 s for ~94.5k rewritten inodes, every relinked file read and chunked again although its bytes were already stored |
| Owner decisions | (1) "Yes: build option (b), the identical-rewrite shortcut with a content digest kept on the write path; keep design 8 / F-056 untouched; drop the partial item 2 change unless it still helps under (b)." (2) Relayed 2026-10-19: "reuse the object only. The new inode F keeps its own row, identity and metadata. When F's write-path digest and length match a stored file root, the Commit reuses that existing object instead of reading and chunking F again. Design 8, keep_live_row and F-056 are not changed, so D1 and D3 are out." D2 (the `file_digest` table) accepted |
| Kind | code path plus one overlay table and one Store table |
| Old Stores | open unchanged and gain the empty `file_digest` table; they reuse from their second Commit of the same bytes (see Limits) |
| Binaries | `relink_commit` and `write_cost` test binaries, release, built in the pinned build image `378b799ef433`: old from `dd361543e4` (core sources identical to `029db0950f`), new from `70d81c3f20` (relink) and `f9ed53a05a` (write cost); both add only harness changes after `e75cacca82`. SHA-256 of each test binary in the receipts |
| Regression tests | `layerfs-overlay/tests/digests.rs` (12), `layerfs-daemon/tests/file_digests.rs` (3), persistence fixtures `lineage_backfill.rs`, `old_format_open.rs` (drop the new table to stay pre-#364), `sqlite_publication.rs` (table count 19 → 20) |
| Production LOC | 103,127 → 103,702 (delta +575), `tools/production_loc.py --root`, first parent vs committed tree, over three commits |

## Design

1. **Write path (overlay, `payload/digest.rs`).** A fresh regular file is
   followed with a BLAKE3 state while every byte it gains is an exact append.
   Any other write, a cell change, a size other than the followed length, a
   second link or a non-file ends it for good. The state is in the journaled
   open state; no byte is held. With no descriptor open, the digest goes to
   `fs_digest`, pinned to the row's content sequence. A job that changes no
   byte (mode or time at the same size) moves the pin; any other row write
   leaves it behind, so a digest is only ever read for the row it describes.
   One slot resumes the last file finished without a descriptor (chunked SDK
   writes); an empty file still the row it was created as resumes from no
   bytes (create, then write).
2. **Store (`file_digest(digest, length, root)`).** Keyed by digest and
   length. Rows are written only for roots built from all their bytes, and a
   new row replaces an old one. The lookup joins `object_location`, so it
   answers only roots whose object the Store holds.
3. **Commit (captured construction, inodes pass).** Per captured inode page:
   one overlay job reads the fresh files' digests (a file open at that moment
   has none) and one Store read per 64 returns any saved root with the same
   digest and length. Such a file takes that root as its content root. Its
   metadata is built from its own row, as for every fresh file; its serial and
   row are its own. Every other followed file is built in full and its row is
   recorded, 64 per write, before the publication lane. Names play no part: a
   copy at any path matches.

The edge cases the liaison listed take the full path: a partial or ranged
write, truncate-then-write and an mmap store (each a write at another offset
or a size change), a file open when construction reads its digest, and a hard
link. A mode change is a metadata change only: the new file reuses the object
and records its own mode (the owner's object-only decision); tested.

### Why each new piece

Listing at `70d81c3f20`, counter `tools/production_loc.py --files`, changed
production files of item 2 only (production LOC, before → after):

```
layerfs-overlay/                                  [+289]
  sql/schema.sql                       83 → 89     (fs_digest table)
  src/database/startup.rs             169 → 170    (schema 38, template check)
  src/lib.rs                           58 → 59     (CapturedDigest export)
  src/lifetime/file_owners.rs         249 → 252    (last close finishes a digest)
  src/namespace/compound.rs           254 → 257    (the job's three hooks)
  src/open/kernel.rs                   71 → 77     (journaled digest state)
  src/payload/mod.rs                    9 → 10
  src/payload/digest.rs                 — → 268    new
layerfs-history/                                  [+13]
  src/contract/catalog.rs             130 → 136    (two defaulted methods)
  src/contract/records.rs             340 → 347    (FileDigest)
layerfs-persistence/                              [+102]
  sql/sqlite/file_digest.sql            — → 6      new
  sql/sqlite/queries/history/digest_insert.sql  — → 1  new
  sql/sqlite/queries/history/digest_of.sql      — → 1  new
  src/backend/sqlite/query.rs         199 → 205
  src/backend/sqlite/schema.rs        256 → 293    (additive migration)
  src/history/catalog.rs              146 → 152
  src/history/digests.rs                — → 43     new
  src/history/mod.rs                   19 → 20
  src/store/open.rs                   118 → 119
layerfs-store-service/                            [+37]
  src/overlay/captured_namespace_port.rs  74 → 86  (owner-job port)
  src/store/captured.rs               236 → 238
  src/store/digests.rs                  — → 22     new
  src/store/mod.rs                     32 → 33
layerfs-workspace/                                [+134]
  src/construction/driver.rs          246 → 256    (digest port plumbing)
  src/construction/namespace/inodes.rs  259 → 268  (reused content root)
  src/construction/namespace/normalize.rs  262 → 346  (page demands, record)
  src/construction/outcome.rs          75 → 77     (two counters)
  src/lib.rs                           68 → 69
  src/ports/captured_namespace.rs      74 → 88     (captured_digests)
  src/ports/digests.rs                  — → 12     new
  src/ports/mod.rs                     15 → 17
```

- **Overlay digest (268 + 21).** No existing piece hashes a file's whole
  content as it is written: the #316 write recognizer claims chunks against
  the same inode's committed content only, and a relink writes new inodes.
  Content's hashing builds objects from bytes it is given at Commit, which is
  the cost being removed. The state must follow the overlay's own
  transactions (journaled, rolled back with a failed job), so it lives there.
- **Store table and catalog (102 + 13).** No Store table maps bytes to a
  root: `content_signature` is a delta-candidate ring keyed by similarity,
  and `object_location` is keyed by object identity, which a reader cannot
  compute without building the object. The migration is the same additive
  pattern as lineage and merge scratch.
- **Ports and construction (171).** Construction reaches the overlay only
  through `OverlayCapturedNamespace` and the Store only through the Save; a
  digest read and a root lookup are neither, so each needs a port method.
  The inodes pass already pages captured inodes and demands base records per
  page; the digest and root demands follow the same per-page shape.

Smaller than the first build (+779 → +575): the name matching, mapped
directories and their records went with the object-only decision.

## Tests

- Overlay (`tests/digests.rs`): appends in jobs and by descriptor, the empty
  file, a write at another offset, a cell change, truncate-then-write, a hard
  link, a later mode change keeps the digest, appends after a mode change, a
  size change, a file open at capture, a finished file opened again.
- Daemon (`tests/file_digests.rs`): a Commit records only followed fresh
  files; a relink over a committed tree reuses the object for same bytes, a
  mode change (own metadata) and a copy at a new path, and takes the full path
  for one changed byte and a hard link, with live bytes read after the
  install; a recorded root the Store does not hold is not reused, and its row
  takes the new root.
- No test deleted.

## Checks

- Host (macOS, `cargo +1.85.1`, each run under a 120 s alarm): overlay,
  workspace, store-service, persistence and history suites; daemon
  `store_commit`, `file_digests`, `concurrent_commits`, `installed_store`;
  Clippy `-D warnings` on the touched crates and tests.
- Linux, pinned image, `-j 2` (QUIET present): at `7ff5079382`, 92 test
  binaries of overlay, history, persistence, workspace, store-service and
  daemon (among them `file_digests`, `store_commit`, `concurrent_commits`,
  `installed_store`, the `kernel_*` tests and `mounted_commit`,
  `mounted_install`, `mounted_links`), all pass; the mounted ones with `--device /dev/fuse
  --cap-add SYS_ADMIN --security-opt apparmor=unconfined`, each in its own
  container (the first run without them failed at `attach:mount` Device).
  At `e75cacca82`: the 37 persistence, history and daemon digest binaries
  again, all pass. Clippy `-D warnings --all-targets` on the touched crates
  and the three new tests, clean.
- Build slip: one measurement build ran at `-j 6` while
  `~/lfs-history/QUIET` existed (about one minute, old2b/new2b release test
  binaries). Every later build ran at `-j 2`.

## Performance, old vs new

Linux, pinned image, one sample per arm, each on a fresh copy of the r015
snapshot (`/store/r015.sqlite`), `LAYERFS_CONSTRUCTION_WORKERS=1`. The harness
(`layerfs-api/tests/relink_commit.rs`) forks the r015 head, unlinks every
one-link regular file under a `node_modules` directory and writes it again
(new inode, same bytes, chunked SDK writes), Commits (round 1), then does it
again over that Commit (round 2: relink over relink, the r016 shape). "Times
kept" sets every file's original mtime again, so roots compare across builds;
"fresh" leaves each new file its write time, as pnpm's copy does. Full scope
is 38,135 files, 409.7 MB: the harness relinks one-link regular files only,
where the range's 94.5k counts every rewritten inode (directories, symlinks
and hard-linked files included).

| Relink | Arm | Load (1 min) | Round 1 ms | Round 2 ms | Round 2 statements | Files reused (r1 / r2) | Stored bytes (r1 / r2) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10k, times kept | old | 9.28 | 3,007.7 | 2,674.3 | 16,599 | — | 256,557 / 160,507 |
| | new | 10.98 | 3,355.7 | **2,014.1** | 25,602 | 793 / 10,000 | 256,557 / 160,507 |
| 30k, times kept | old | 11.30 | 8,034.5 | 8,343.6 | 48,514 | — | 489,170 / 444,753 |
| | new | 8.28 | 8,392.6 | **6,389.8** | 78,645 | 2,628 / 30,000 | 489,170 / 444,753 |
| full (38,135), times kept | old | 7.66 | 9,892.9 | 10,165.5 | 60,032 | — | 556,910 / 553,299 |
| | new | 10.42 | 10,645.8 | **9,565.6** | 98,927 | 3,058 / 38,135 | 556,910 / 553,299 |
| full (38,135), fresh times | old | 11.56 | 10,036.4 | 10,505.9 | 60,003 | — | 546,578 / 541,695 |
| | new | 8.22 | 10,411.6 | **7,444.1** | 98,919 | 3,058 / 38,135 | 546,194 / 541,974 |

- **Byte-identical results.** With times kept, old and new give the same
  root in every round at every size (10k: `70bcdf1c…`, `6aa2cf3c…`; 30k:
  `5fee6457…`, `60b85d18…`; full: `2a89dd11…`, `77e03656…`). With fresh times
  the roots differ by design (each run writes its own times). Stored bytes
  are equal with times kept and within 0.1% with fresh times.
- **Round 1 on a pre-#364 Store** records 9,207 / 27,372 / 35,077 digests
  and already reuses the duplicates within the same Commit (793 / 2,628 /
  3,058: the Save writes each object's location as it goes, so a root built
  earlier in the Commit is present). It pays for the recording: about 2×
  the writer statements (60,408 → 135,921 at full) and 0.4–0.8 s.
- **Round 2** (every file reused): 2,674 → 2,014 ms at 10k (−25%), 8,344 →
  6,390 at 30k (−23%), 10,166 → 9,566 at full with times kept (−6%), 10,506
  → 7,444 at full with fresh times (−29%). The writer statements go up
  (one lookup per file); the bytes read and chunked go to zero. Single
  samples on a host at load 8–12; the spread between the two full rows of
  the same build is part of that.
- A first new-arm 10k sample at `7ff5079382` (before the existence join) is
  kept as `new7ff-10k-keep`: 2,893.0 / 2,481.2 ms, same roots.

### The r016 relink-over-relink diff

`branch.diff_commits` between the two rounds' Commits, every page, page size
200, in the same process:

| Diff | Arm | Pages | Entries | ms | Statements | Per page | ms per entry |
| --- | --- | --- | --- | --- | --- | --- | --- |
| full, times kept | old | 208 | 38,135 | 62,145.5 | 690,921 | 3,322 | 1.630 |
| | new | 208 | 38,135 | 66,657.5 | 690,921 | 3,322 | 1.748 |
| full, fresh times | old | 229 | 42,239 | 66,574.9 | 757,428 | 3,308 | 1.576 |
| | new | 229 | 42,239 | 65,267.1 | 757,426 | 3,308 | 1.545 |

The harness reproduces range 16's cost (3,554 statements a page, 1.31 ms an
entry there) with the old build. Item 2 does not change it: every relinked
file has a new serial, so the diff lists it as an identity change in both
builds. The owner accepted this for item 2; it is #364 item 4.

### Write-path cost

`layerfs-api/tests/write_cost.rs`, a fresh copy of the r015 Store per sample,
one sample per arm: 200 `fs.write` calls of 1–8 KiB, each its own Commit,
then one 64 MiB `fs.write`.

| | old | new | delta |
| --- | --- | --- | --- |
| first pair (load 6.52), `fs.write` p50 | 9.26 ms | 10.12 ms | +0.86 ms |
| first pair, p90 | 11.44 ms | 12.35 ms | +0.91 ms |
| first pair, 64 MiB write | 824.2 ms | 951.3 ms | +127 ms |
| second pair, with counters (load 11.5), p50 | 9.36 ms | 9.47 ms | +0.11 ms |
| second pair, p90 | 10.80 ms | 11.22 ms | +0.42 ms |
| second pair, 64 MiB write | 824.3 ms | 770.3 ms | −54 ms |

The liaison asked where the first pair's +0.86 ms goes. The second pair
(harness `_WORK` lines, the same binaries' code with counters added) counts
it per call:

| Per small `fs.write` | old | new | delta |
| --- | --- | --- | --- |
| Store statements | 165.4 | 171.4 | +6.0 |
| Store VM steps | 14,062 | 14,116 | +54 |
| Store time in SQLite | 1.870 ms | 1.884 ms | +0.014 ms |
| overlay statements | 175.8 | 180.8 | +5.0 |
| overlay VM steps | 3,670 | 3,803 | +133 |
| overlay time in SQLite | 0.859 ms | 0.912 ms | +0.053 ms |
| overlay lock hold | 0.865 ms | 0.947 ms | +0.082 ms |
| BLAKE3 over the same bytes | — | 0.006 ms | |

| 64 MiB `fs.write` | old | new | delta |
| --- | --- | --- | --- |
| Store statements | 630 | 637 | +7 |
| overlay statements | 24,809 | 26,862 | +2,053 |
| overlay time in SQLite | 153.6 ms | 102.5 ms | −51 ms (noise) |
| overlay lock hold | 287.5 ms | 292.9 ms | +5.4 ms |
| BLAKE3 over the same bytes | — | 50.6–51.1 ms | |

- **Small writes.** The added work is about 0.1 ms a call: 5 overlay
  statements (the digest row writes and the reads that resume, carry and
  capture it) and 6 Store statements (two
  catalog calls, each its own transaction: `BEGIN`, one statement, end).
  Hashing is 6 µs. The first pair's +0.86 ms is mostly sample noise. The
  new arm's two samples are 10.12 and 9.47 ms, and the old arm's 9.26 and
  9.36 ms.
- **The big write.** It is chunked into about 1,024 jobs. Each job ends by
  writing the digest row again and starts by reading the latest row to
  resume, so it adds two statements. BLAKE3 runs under the Workspace lock:
  about 51 ms per 64 MiB (0.8 ms a MiB), 6% of the write. The two samples
  differ by more than that (+127 ms, then −54 ms).
- **What could be cut, not built (liaison: report only).**
  1. Write the digest row once per file instead of once per job. Keep the
     one-slot resumable state in memory, journaled as now, and write the
     row when the slot passes to another file, at capture or at the last
     close. This needs no read to resume. A chunked write then adds no
     statements per chunk, about 2,050 fewer for 64 MiB; one 8 KiB write
     saves about 2.
  2. Fold the two Store catalog calls into one read and one write
     transaction per Commit page. That saves 4 of the 6 Store statements,
     about 0.01 ms.
  3. The hash itself cannot move off the lock without per-chunk tree
     hashing. It is about 0.8 ms a MiB.

  Options 1 and 2 cut about 0.05 ms a call. Neither changes a result.

## 25f50cc876 (resident construction records): dropped

Built onto this branch as a third arm (`new25`) and measured:

| Relink, times kept | new round 1 / 2 ms | new + 25f50cc876 round 1 / 2 ms | backing ns, round 2 |
| --- | --- | --- | --- |
| 10k | 3,355.7 / 2,014.1 | 2,280.7 / 1,255.8 | 821,872,780 → 118,327,044 |
| 30k | 8,392.6 / 6,389.8 | 9,017.2 / 6,834.2 | 2,802,982,076 → 2,891,342,442 |

It helps while a Commit's records fit its resident bound (10k) and does not
past it (30k, where they spill and Content's backing time is unchanged). The
relink class this item targets is larger still, so it does not measurably
help under (b), and per the owner's instruction it is dropped (+266 LOC not
landed). Receipts: `new25-10k-keep`, `new25-30k-keep`.

## Limits

- **Pre-#364 Stores** have no digests: their first relink records them and
  reuses only duplicates within that Commit; reuse of committed bytes starts
  at their second relink. Init records none.
- A file written by anything other than appends from creation (an in-place
  edit, a copy that seeks, a hard link) has no digest and is built in full.
- The digest of a big file is computed under the Workspace lock as it is
  written (+15% on a 64 MiB write).
- The r016 diff cost is unchanged (item 4).

Receipts in this session's scratch: `out/m2/*.txt` (each with its load and
QUIET state), binary hashes in `meas-build.txt` and the build logs.
