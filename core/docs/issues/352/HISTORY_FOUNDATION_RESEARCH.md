# #352 — History foundation: pointer or copy? (research, 2026-10-18)

> **Status:** Research, read-only (four parallel source and receipt studies).
> It establishes neither capability nor a decision. Owner question: do fork,
> Commit and merge reference immutable history, or clone it, and why does a
> 100k-file directory-move merge take 30 s?

## Verdict

**History is referenced, not cloned.** Fork, branch create, mount, publish and
install all point at existing immutable rows. The 30 s merge and most Store
overhead come from two other things:

1. **The merge decides per path, not per changed inode.**
2. **Metadata embeds non-content identity**, mtime and inode serials, so
   unchanged files get new metadata objects.

| Operation | Writes | Cost | Copies history? |
| --- | --- | --- | --- |
| `branch.fork` / create | 1 `branch` row (`history/branch.rs:191-205`); 16 statements (F-020 record) | O(1). Fork from a Commit id walks ancestry up to 4,096 (fixed by #353) | no |
| Mount | 0 Store rows; the Workspace's own overlay file (template byte copy) | O(log n) root checks (`store/bind.rs:115-149`) | no |
| Commit | changed content; the copy-on-write path to the root; 1 `commit` row; new binding hints | grows with the change, plus the inode-branch rewrite (~0.53 B per live inode per Commit) | no (path copy, like Git) |
| Publish (`add_layer`) | 1 `layer` row (root by id), 1 stack head | today `overwrote` lists and ancestry walks (#353 makes them O(1)) | no |
| Install | base pointer swap (`overlay/lifetime/generation.rs:12-27`) | O(1) | no |

Content is deduplicated by id. An existing object is reused before encoding
(`save/wave.rs:91-99`), and "content added = 0" holds for 1,000 known files.

## Why the directory-move merge is O(files)

Case: one branch moves a directory of 100,000 files, the other changes one
file.

The move itself is cheap. A rename keeps the directory's serial, and inode
values hold no parent or path (`object/inode_leaf.rs:84-93`), so the Commit
changes about 2 inodes.

The merge then:
1. **Names candidates by walking whole subtrees:** both `/big` (base) and
   `/moved` (ours), about 200k paths (`merge/candidates.rs:191-277`).
2. **Decides each path** with name and inode lookups in base, ours and theirs.
   There is no page memo (`merge/decide.rs:81-113`, `entry.rs:100`). This is
   20.9 of 30.5 s, about 105 µs per path (#355 FIX_NOTES, temporary trace).
3. **Builds:** the strict serial rule gives the moved directory a fresh serial
   while theirs still holds the old one, and rebuilds its listing child by
   child (`merge/build.rs:144-168`): 8.9 s.

**"Merged roots equal to today's roots"** (the #355 invariant) forces at least
O(moved subtree), because a rebuilt directory B-tree need not equal the stored
one. Git-style subtree-id skipping does not apply directly: a directory's
`content_root` covers only its own listing, not its descendants. The cheap
equivalent is diffing changed serials, which is already structural and
O(change) (`compare/tree.rs:100-117`).

## Where Store overhead comes from (range 14, read-only query of a copy)

| Part | Share | Cause |
| --- | --- | --- |
| Mode and mtime stored as 4 objects per changed file | 16.5–19% (r011) | non-content identity; #360 item 2 (−15.9% measured, branch only) |
| Reserved pack slots in old packs | 11.6% | fixed for new packs (F-027 item 1); old packs keep it |
| Inode branch stored whole every Commit | 9.5% (r011), growing with inode count | #360 item 3 |
| `object_location` | 10.8% | one row per object (needed) |
| `commit` + `commit_identity` | 8.1% | `commit_identity` repeats the key for foreign keys (~1.4%) |
| Duplicate `inode_value` rows | 2.3% | 26,924 rows, 13,799 distinct; no value-to-ordinal lookup across Saves (`save/pooled.rs:53-115`) |

All 10,612 Commits at r014 have distinct roots. A rewrite of identical bytes
still commits, because the mtime is part of the metadata. Fresh serials on
every create mean a clean reinstall writes 30–43 MiB of metadata for near-zero
new content (STORAGE_STUDY §3c).

## Options, ranked

| # | Option | Effect | Format | Decision needed |
| --- | --- | --- | --- | --- |
| M1 | **Merge by serial:** diff base→ours and base→theirs by inode. One-sided changes take that side's value; directory listings merge by name only for serials both sides changed; paths are named only for conflicts and `.lww` | 100k-move case: ms instead of 30 s (inference); O(changed inodes × log n) | none | yes: merged root ids change; a move plus an edit inside the moved directory merges cleanly instead of conflicting |
| M2 | Name candidates from the smaller side (`decide_from` exists) | O(depth) for one-sided moves | none | yes: root ids change (dropped in #355 for that reason) |
| M3 | Constant-factor fixes: page memo in the merge resolver, list a directory once, skip lookups under absent parents | 3–10× faster, still O(files) (inference) | none | no |
| S1 | #360 item 2 (mtime inline; an mtime-only change is not a change) | −15.9% growth, −37% statements per stat | kind 1 | already approved |
| S2 | #360 item 3 (inode-branch deltas) | −9.5%, removes the P3 step of +2.5–6 KB per Commit | kind 1 | approved, gated after #354 |
| S3 | Keep a serial when the same parent, name and kind is recreated within one Workspace frontier | reinstalls and rewrites to an identical state become cheap or UpToDate | allocator semantics | yes |
| S4 | Deduplicate `inode_value` across Saves (fingerprint index) | about −2% | additive | no (kind 2) |
| S5 | Drop `commit_identity` | about −1.4% | schema | yes |

## Next measurements

1. **Fork growth** (none exists). On a byte clone of the r014 Store:
   - fork from main, fork from a mid-history Commit, 100 forks;
   - mount and unmount with no writes; mount then an empty Commit;
   - the same edit on two forks, then merged;
   - delete and recreate identical bytes.

   Before and after each case: per-table `dbstat`, row counts, `inode_value`
   distinct values, packs, and the overlay size reported separately. Pass: a
   fork adds about 200 B, a mount adds 0 rows.
2. **The merge, broken down:**
   - the 100k `mv` Commit's changed-inode count;
   - the sizes of the base→ours and base→theirs diffs;
   - `/moved`'s serial and listing id in today's merged root;
   - a phase split of the 49.1 s arm after (d);
   - page reads per decided path.
3. **An M1 prototype,** checked against the 35 replay merges by decoded view
   (paths, kinds, contents, metadata, hard-link groups), timed at 35k, 100k and
   135k files to show the time stays flat. Add a deep-tree move, a move into a
   non-root directory, and a move plus an edit inside it.
