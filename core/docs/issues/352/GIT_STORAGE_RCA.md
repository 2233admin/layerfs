# #352 · Why `.git` costs so much in the Store (RCA, 2026-10-20)

> **Status:** investigation only, for the liaison and the owner. No product
> code changed and nothing was built. The direction in §4 is a proposal; it
> needs the owner's approval before anyone builds it.

The range reports put `.git` at 3.8–4.6× its latest version (r20: 87.5 MiB
for 23.0 MiB; r46: 454.2 MiB for 98.6 MiB), the largest single source in
the Store. This note splits that cost by mechanism, names the code path
that decides it, and proposes one fix.

## 1. Method

- **Sealed copies only.** I used the four fork inputs
  `~/lfs-history/runs/p3-main-{t,u,v,w}/restore/global/store.sqlite` (after
  r27, r30, r37 and r42). They were cloned to a scratch directory, made
  read-only and opened with `immutable=1`. No live run, volume or daemon was
  touched.
- **Three windows** are the difference between two sealed copies: r28–30
  (t→u), r31–37 (u→v) and r38–42 (v→w). Every payload record new in the
  later copy was parsed from its pack: chunk lane v25, whole-file lane v23,
  tag FULL/PREFIX/STORED, and the record's width.
- **What kind of file a chunk belongs to.** Chunks were grouped into files
  through the window's new extent leaves. Each file was classified by its
  first chunk: `DIRC` is a git index, `PACK` is a git pack, and a zlib
  stream starting `blob `, `tree ` or `commit ` is a loose object. Leaves
  after the first of a large file (packs over 128 chunks) start with
  random bytes. Those fall under "other" in the leaf table and are counted
  with packs below. Whole-file records were classified by content in the
  same way.
- **Totals per Commit class** come from the attempts' traces:
  `sizes.newStored`, `newMetadata` and the daemon's
  `delta.payload.{chunk,whole_file}_depths`. Steps are classified the way
  `storage.mjs stepSource` does it (`git-commit` for lanes, `git-main` for
  the lead). These sums reproduce the reports' figures, e.g. r46 adds
  10.69 + 2.41 = 13.10 MiB against the report's 13.1 MiB.
- Scripts (`agg.py`, `packs.py`, `classify.py`, `leaves.py`, `prefix.py`,
  `prefix_cap.py`) are in the side-session notes folder under
  `git-storage-rca-scripts/`. One run per window, no repeats.

## 2. Measured breakdown

`.git` bytes added in each window, in MiB. "Index" covers the lanes'
worktree indexes and the lead's `.git/index`. "Packs" is the lead
Commit's content, which also holds its own index rewrite (at most about
0.5 MiB per range).

| Window | `.git` added | Index versions | Loose objects | Packs (`repack -d`) | Other files | Metadata |
| --- | --- | --- | --- | --- | --- | --- |
| r28–30 (3 ranges) | 44.6 | 19.0 (43%) | 12.9 (29%) | 9.8 (22%) | 0.4 | 2.5 |
| r31–37 (7 ranges) | 98.3 | 31.5 (32%) | 34.3 (35%) | 26.0 (26%) | 2.6 | 4.1 |
| r38–42 (5 ranges) | 67.7 | 29.1 (43%) | 20.6 (30%) | 14.4 (21%) | ≈0 | 3.6 |
| **Per range** | **13.5–14.9** | **4.5–6.3** | **4.1–4.9** | **2.9–3.7** | **≤0.4** | **0.6–0.8** |

"Other files" (`HEAD`, `COMMIT_EDITMSG`, refs, `commondir`, `gitdir`) is
what remains after the other columns; it is under 0.4 MiB per range.

### Index chunks

| Window | New index chunks | FULL | PREFIX | Raw bytes | Stored | Stored per chunk |
| --- | --- | --- | --- | --- | --- | --- |
| r28–30 | 1,799 | 1,797 | **0** | 35.8 MiB | 19.0 MiB | 10.8 KiB |
| r31–37 | 3,332 | 3,331 | **0** | 60.5 MiB | 31.5 MiB | 9.7 KiB |
| r38–42 | 3,115 | 3,113 | **0** | 55.1 MiB | 29.1 MiB | 9.6 KiB |

The rest (1–2 per window) are STORED. Across all of ranges 15–47, the
`git-commit` and `git-main` Commits stored **0** chunk PREFIX records:
`chunk_depths` holds only depth 0, 28,277 chunks in all (git-seed included). Lane Commits
average 5.6 new chunks each (3,816 over 684 Commits in r31–37). An index
is 160–210 KB, about 10 chunks of about 19 KB, so CAS reuses roughly half
of every rewrite and stores the other half whole. Zstd only halves those
chunks: the entries are mostly SHA-1s and stat words.

**The theoretical floor is tiny.** I compared each new index version with
its nearest earlier one (by matching entry SHA and mtime) over 32,861
entries in r31–37:

- 48% of entries differ;
- 48.3% differ **only in `st_dev`**;
- 1.1% have a new blob, mtime or size.

Every one-shot Workspace is a new FUSE mount with a new device number (24
distinct values in that window), and git records it in the entries it
refreshes. Those 4-byte changes are spread across the whole file, so
nearly every CDC chunk changes a little. CAS cannot reuse those chunks,
and a PREFIX delta against the previous chunk would make them almost
free. LayerFS cannot choose a FUSE mount's `st_dev` (the kernel assigns
it), so this churn is a fact to design for, not a defect to remove.

### Loose objects and packs (items 2 and 3 confirmed)

- **Loose objects:** 23,017 whole-file records over the three windows,
  every one STORED (zlib payloads are incompressible), with 0 PREFIX.
  Loose objects of 128 KiB or more are chunked (603 chunks, 10.8 MiB,
  for example `pnpm-lock.yaml` blobs), and these are also all STORED.
- **Packs:** every chunk STORED or FULL, 0 PREFIX. Each range's pack
  repeats the range's objects in a different compression, so it shares
  nothing with the loose objects that history already holds. Once the
  loose objects are in a lane Commit, history keeps them, and `repack -d`
  removes them only from the live tree.
- CAS and delta encoding cannot recover these bytes: the payloads are
  compressed, and identical git objects are compressed differently in
  loose and packed form. Saving them would need git-aware
  inflate-and-recompress storage (a byte-exact zlib reconstruction format),
  or different git compression settings in the replay. The second is a
  workload change. I recommend neither (§5).

## 3. Root cause and the code path

Git never edits `.git/index` in place. It writes `index.lock`, a new inode,
and renames it over `index`. LayerFS Commit construction binds a file's
predecessor **by inode serial, not by path**. The replacing inode has no
base file, so its chunks get no delta base:

1. `layerfs-workspace/src/construction/namespace/inodes.rs`, `file()`: a
   `fresh` inode (created above the base) goes to
   `CapturedFileEdits::construct_new`; only a base inode goes to `prepare`
   then `construct`.
2. `layerfs-workspace/src/construction/captured/owner.rs`, `bound()`, takes
   the base file from `base.captured_file(self.serial)`.
   `construct_new` requires `file_root.is_none()`, and `run_new` calls
   `construct_runs` with no predecessor.
3. `layerfs-content/src/file/construction/runs.rs`, `construct_runs`,
   passes `chunk_runs::no_hint` to every `ChunkRuns::data`, `zero` and
   `finish` call, so each chunk is pushed with an empty advisory list.
4. `layerfs-storage/src/encoding/delta/select.rs`, `select()`: for
   `ObjectRole::Chunk` it considers only `advisory.first()`. With none it
   counts `no_candidate` and stores FULL. Chunks never consult the
   content-signature index; only whole files fall back to it.

The only producer of chunk hints is the localized edit path
(`layerfs-content/src/file/edit/apply.rs`, through
`file::mapping::Aligner`, #352 F-005). It runs only when the same inode
is edited in place. Git's lock-and-rename never takes that path. The same
applies to any other atomic-save writer of a file of 128 KiB or more, such
as pnpm's `write-file-atomic` for `pnpm-lock.yaml`.

## 4. One direction: the replaced file as positional predecessor on rename-over

**Proposal.** When a rename replaces a regular file with another regular
file, record the replaced file as the new inode's advisory predecessor.
At Commit, construct the fresh file with the existing `Aligner` over that
predecessor, the F-005 mechanism, instead of `no_hint`.

- **Where it is recorded:**
  `layerfs-workspace/src/operations/namespace/rename.rs`, `rename()`,
  already holds the `replaced` inode and the `moved` one. It would record
  one predecessor serial on the moved inode in the same short overlay job,
  with no Store I/O. If the replaced inode was itself fresh (git writes the
  index twice in one Workspace, `add` and then `commit`), the moved inode
  inherits its predecessor, which ends at a base file.
- **Where it is used:** `construct_new` and `run_new` bind
  `base.captured_file(predecessor)` when it exists.
  `construct_runs` gains a hint parameter. The caller passes an `Aligner`
  over the predecessor's `FileState`, anchored at 0, and every other
  caller keeps `no_hint`. CDC's resynchronization re-anchors the
  `Aligner` at every chunk that CAS reuses, as it does in edits today.
- **What does not change:** the hint is advisory and physical only. The
  selector still makes one trial, stores PREFIX only when it is strictly
  smaller, and keeps the depth cap (chunk depth 8) and the chain budgets
  (512 KiB canonical, 256 KiB encoded). Canonical identity, the format and
  the Store layout are unchanged. There is no new table, no second
  database and no new limit.

**Estimated saving.** I simulated it on the windows' real index chunks:
each chunk is compressed with zstd level 3, window log 20 (the chunk
profile), against its most similar earlier index chunk, with the same
record framing. Depth cap 8 is enforced, so every ninth version is FULL.

| Window | Index stored today | With the hint | Saved | Saved per range | Share of Store growth per range |
| --- | --- | --- | --- | --- | --- |
| r28–30 | 19.0 MiB | 2.5 MiB | 16.5 MiB (87%) | 5.5 MiB | 14% |
| r31–37 | 31.5 MiB | 4.7 MiB | 26.8 MiB (85%) | 3.8 MiB | 12% |
| r38–42 | 29.1 MiB | 4.1 MiB | 25.0 MiB (86%) | 5.0 MiB | 16% |

That is **about 4–5.5 MiB per range**: 27–37% of `.git`'s growth and
12–16% of the whole Store's growth (31–38 MiB per range by file size). The
same hook would also delta other atomic saves of large files, such as the
lockfile, which are not counted here.

Caveats:
- The simulated base is the most similar earlier chunk, not the exact
  predecessor at the same offset. An index rewrite keeps entry order and
  mostly changes 4-byte fields in place, so the predecessor at the same
  offset should be about as close. The real number may fall somewhat
  below 85%.
- A lane's first step builds its index with `read-tree` and has no
  predecessor. It stays FULL.

**Speed cost.** Measured on the same chunks on this host (1-minute load
9.4):
- FULL compression of an 18 KB index chunk takes about 71 µs;
- the PREFIX trial takes about 132 µs;
- decoding a PREFIX record takes about 17 µs.

Each lane Commit adds about 5.6 trials, a base acquisition each (a chain
of at most 8 decodes, from packs written by the previous Commits) and one
extent-leaf read for the `Aligner`. That is about 1–3 ms per lane
Commit, against 40–50 ms Commits today.

Reads pay at most 8 extra decodes per index chunk when git loads the
index: under 2 ms for a 10-chunk index in a fresh mount. Both are under
the 5 ms per-call floor. No other Commit pays anything, because the hook
fires only on rename-over of a regular file of 128 KiB or more.

**Why not let chunks consult the similarity index instead.** That would
compute a signature for every new chunk in every Commit (installs write
thousands) and contend for the 8,192 shared slots. It also finds the
right base less reliably than the exact positional predecessor that
rename-over already names. It would cost more time for the same index
saving.

## 5. What is left, said plainly

Even with §4, `.git` keeps roughly 9–10 MiB per range:
- loose objects, 4–5 MiB;
- the range pack, 3–4 MiB;
- metadata, about 0.7 MiB;
- the remaining index deltas and FULL refreshes, about 0.7 MiB.

Git's own zlib compression puts those bytes out of CAS's and delta
encoding's reach. They are the replay's design (lanes commit loose
objects, the lead repacks once per range), not a LayerFS selection
defect. Reducing them needs either git-aware storage of zlib streams (a
large format project; I do not recommend it for this saving) or a change
to the replay's git settings, which is the owner's call under the
no-workload-changes rule.
