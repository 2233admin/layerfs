# #352 — Storage batch F-027: implementation spec (items 1–3)

> **Status:** Current, owner direction 2026-10-18 ("produce a spec for this fix …
> so that it has clearer direction"). Binding on the fixer; the lead accepts each
> item. Implements STORAGE_STUDY.md §6 items 1, 2 and 3, approved by the owner
> and batched before P3 (RESULTS.md, `98005f379`, `70afdb17b`). Fix record:
> [fixes/011-study-f027-storage-batch.md](fixes/011-study-f027-storage-batch.md).
> Order in the fixer queue: after F-020 and F-025's fixes, before P3's
> development run. Non-stop rule: where this file is silent, choose the option
> that keeps old Stores readable, one attempt per operation and the least new
> code, and record the choice in the fix record.

## 1. Why

At range 11 (sealed snapshot, daemon `58a60046`) the Store is 32.8 MiB on a
7.7 MiB head, growing ~5.1 KB per LayerFS Commit; about a third of it is
overhead (STORAGE_STUDY §2). Simulated on the real snapshot data, each item
measured on top of the previous one:

| Item | Change | Saving at r011 | Kind |
| --- | --- | --- | --- |
| 1 | Size each pack's directory to its group count | −4.87 MiB (14.8%) | 1 |
| 2 | Mode and mtime in the inode value | −5.40 MiB (16.5%) | 1 (Content grammar change, owner-approved) |
| 3 | Inode branches stored as deltas | −3.10 MiB (9.5%), growing with inodes | 1 |
| | **Together** | **32.8 → ~19.2 MiB (−41%)**; forecast at r201 3.37 → ~1.95 GiB | |

Item 3 is also the main P3 item: once `node_modules` adds ~47k inodes, every
small Commit would rewrite a full inode child branch (+2.5–6 KB per Commit,
STORAGE_STUDY §3b).

## 2. Rules for all three items

- **Kind 1 (REBUILD.md).** Old Stores open and read unchanged; no migration,
  no rebuild, no rewrite of old objects. Readers accept the old and the new
  form forever. A missing new form is never a refusal.
- **Object identity is the hash of the canonical form.** Items 1 and 3 change
  only how objects are stored, so no id changes. Item 2 changes the canonical
  inode leaf grammar for rows it rewrites, so it must obey §4.3 (no spurious
  changes across the format boundary).
- **Not lost:** content deduplication, compression, CDC, and localized edits
  (edit cost independent of file size). Each item proves it (§6).
- Disposable/WAL/OFF only; page size 4 KiB; one attempt per operation; no
  fsync; `LAYERFS_CONSTRUCTION_WORKERS=1` for Commit measurements; no retry or
  busy handler; no new dependency.
- One commit (or a short series) per item, each with its production LOC line,
  its own daemon id, compatibility test, proofs and old-vs-new table. The lead
  merges each item separately; items land in the order 1 → 2 → 3.
- Files stay under 999 lines; `mod.rs`/`lib.rs` under 200. Update the storage
  and content format documentation in the same commit as the code (AGENTS.md
  §4), and replace the design note in
  `layerfs-content/src/filesystem/attributes/value.rs` (item 2).
- Tests: each command ≤120 s, bounded waits, built with `--no-run` first.
- Build on F-020's code (`layerfs-store-service`) where the Commit path lives
  after F-020; the storage and content crates are unaffected by F-020.

## 3. Item 1 · Pack directory sized to its groups

### Today
`layerfs-storage/src/pack/layout.rs`: the written versions
(`VERSION_ORDINARY_TIGHT` 19, `VERSION_CHUNK_TIGHT` 20,
`VERSION_WHOLE_FILE_TIGHT` 18) reserve 16 directory slots of
`DIRECTORY_ENTRY_LEN` = 16 B each (24 B header; 280 B for ordinary and chunk
packs, 88 B for whole-file packs). Every Save seals its own packs and packs are
inserted whole at seal, so 22,415 packs hold 22,417 groups and the reservation
is stored as zeros: 4.98 MB, 14.5% of the file (STORAGE_STUDY §2).

### Design
- Three new versions (next free numbers, e.g. 21/22/23: `*_SIZED`) whose
  directory length equals the group count written at seal. The header's group
  count (or a new length field in the new versions only) gives the reader the
  directory length; the payload offset follows the directory.
- Writers emit only the sized versions. Every existing version stays readable;
  readers dispatch on the version as today.
- **Invariant to verify first:** no path appends a group to a pack after seal.
  If one exists (for example a reopened pack), that path keeps writing a tight
  version; record it in the fix record.
- Files: `pack/layout.rs`, `pack/assemble.rs`, `save/seal.rs`,
  `encoding/full.rs`, persistence `backend/sqlite/unit_layout.rs`.

### Item 1 proofs
- Round trip of every version (old and new) through write/read; a pack with
  1, 2 and the maximum number of groups.
- New packs carry zero reserved bytes (count from the sealed file).
- Compatibility: the newest snapshot, written by the old daemon, reads with the
  new one (`compat.mjs`), then a Commit on it mixes old and new packs and still
  passes.

## 4. Item 2 · Mode and mtime in the inode value

### Today
`layerfs-content/src/filesystem/attributes/{portable,value,codec,read}.rs`: the
portable attributes (`mode` u32, `mtime_seconds` i64, `mtime_nanoseconds` u32,
16 bytes) are stored as a complete file: a Chunk (the 12-byte mtime), an
ExtentLeaf and a FileState under an AttributeLeaf, referenced by a 32-byte
attribute root in the inode value (`object/inode_leaf.rs`). Each changed inode
writes those objects plus their own chunk pack; with their index rows and
waste this is ~16.5–19% of the Store. A stat walks four objects for one mtime.

### Design
1. **Inline form.** A new inode value form carries the portable attributes
   inline (16 bytes, the grammar `portable.rs` already checks) instead of the
   attribute root. A form tag in the row (or a new inode leaf version)
   distinguishes inline from root form; the root form stays defined.
2. **Scope.** Only the portable set (mode, mtime) moves inline. An inode with
   any other attribute (none are written today; uid, gid and atime are not
   carried, `portable.rs`) keeps the root form. The extent-backed attribute
   path stays for that case.
3. **No spurious changes across the boundary (correctness, required).** Tree
   differences (`compare/tree.rs` `inode_changes`, page-skipping by subtree id)
   drive `diff_commits`, merge candidates, `logical.count`, bindings and
   change detection. A leaf rewritten in the new form must not make its
   unchanged rows look changed:
   - **Row-level form.** A row changes form only when that inode itself
     changes (content, kind, mode or mtime). Unchanged rows of a rewritten
     leaf keep their exact previous encoding, so a leaf may hold both forms.
   - **Semantic equality where forms meet.** Wherever two rows of the same
     serial are compared and their forms differ, compare the decoded portable
     values (reading the old attribute root once), never the bytes. Equal
     values are not a change.
   Either guarantee alone is not enough: row-level form keeps differences
   cheap; semantic equality keeps them correct when a row did change form.
4. **Readers.** Stat, listing, readdir attributes, FUSE getattr (daemon) and
   every SDK read accept both forms and return identical values.
5. **Writers.** Construction (`captured.namespace` update) writes the inline
   form for every inode it creates or changes; Init writes inline too.
6. **Merge.** Attribute conflicts and last-writer-wins compare decoded
   portable values, so merge results are identical whatever the forms.
7. **Design note.** Replace the note in `attributes/value.rs` ("no ...
   metadata-specific file format is introduced") with this decision and its
   date; update the content format documentation.

### Item 2 proofs
- **Value equivalence:** for every inode of the newest snapshot, stat through
  the old form equals stat after the inode is rewritten in the new form (mode,
  mtime to the nanosecond, kind, size).
- **Boundary differences:** on a fork of the newest snapshot, play one range on
  the new daemon, then `diff_commits` between the last old-form Commit and each
  new Commit reports exactly git's changes (the checkpoint proof), and an
  unchanged-file touch of a neighbour row reports nothing for the others.
- **Merge equivalence:** every merge recorded in r7a2–r11 (inputs from the
  traces), with one side rewritten in the new form, gives the same picks,
  conflicts and merged tree as the old daemon.
- **Attribute-only change:** `chmod` and an mtime-only touch through a mounted
  Workspace each produce exactly one changed inode and the right values.
- Compatibility (`compat.mjs`) as for item 1.

## 5. Item 3 · Inode branches as deltas

### Today
`layerfs-storage/src/encoding/delta/select.rs` (around 327–345) stores tree
roles whole, `InodeBranch` included; only `InodeLeaf` takes a pooled delta
(`save/pooled.rs`, `encoding/pool/delta.rs`). The inode-table branch (40 B per
child, up to 127 children, `format.rs`) is rewritten in full on every Commit:
~0.53 B per live inode per Commit at one level, and a full child branch (up to
~5 KB canonical) per Commit once the table has two levels (P3).

### Design
- `InodeBranch` takes the same copy/insert delta as `InodeLeaf`, against its
  predecessor (the advisory base the construction already carries), within the
  existing metadata chain cap (8) and the per-chain read budget
  (`select.rs` ~418). A refused base stores full, as for leaves.
- Readers: `encoding/delta/record.rs`, `encoding/pool/read.rs` decode branch
  deltas. A read session memoizes a decoded branch for the call (the F-026 memo
  pattern), so a listing or a merge decodes each branch once.
- Other tree roles (directory leaves and branches, roots, extents) stay whole:
  out of scope.
- The delta budget is a per-chain read budget, not a pool shared across a Save,
  so branch deltas do not compete with file-content deltas; confirm by the
  whole-file delta hit rate in §7.

### Item 3 proofs
- Round trip of branch chains at depth 1–8 and at the cap; a refused base
  stores full and reads back.
- **Lookup cost bound:** on a Store with ~50k inodes (below), a lookup decodes
  at most one chain per branch level per call (counter, not time).
- Compatibility as for item 1.

### Synthetic P3 check (required for item 3)
On a fork of the newest snapshot, as a labeled diagnostic: create ~50k inodes
in one one-shot Workspace (for example a generated tree shaped like
`node_modules/.pnpm`), Commit, then play 100 small `fs.write` Commits. Record
bytes per Commit by role on the old and the new daemon. Expected: the
InodeBranch bytes per Commit drop from ~3–5 KB (old) to ~0.1–0.3 KB (new).

## 6. Proofs that nothing is sacrificed (every item)

| Property | Probe | Pass |
| --- | --- | --- |
| Checkpoints | the range's proof checkpoint after a played range on the new daemon | matches git |
| Deduplication | write an existing file's bytes to a new path; reinstall-shaped write of 1,000 known files | content added = 0 |
| Compression | stored ÷ canonical per role on the same snapshot | not worse than old |
| Localized edit | 1-byte edit in the middle of a 1 MiB and a 16 MiB file through a mounted Workspace and through `fs.edit` | stored bytes and statements per edit equal at both sizes, and not higher than old |
| Delta use | whole-file delta hit rate, delta ÷ canonical | within STORAGE_STUDY §7 normal ranges |
| Defect signatures | STORAGE_STUDY §7 rows | no alarm |

## 7. Measurement (old vs new, each item)

Same snapshot forks (newest P2 snapshot; and the synthetic P3 fork for item
3), same cache state, one sample per case, each column labeled with its
binaries; tables go in the fix record.

**Storage:** Store on disk and the five parts (REPORT_FORMAT §9); bytes per
Commit by role; packs and objects per Commit; `object_location` rows per
Commit; reserved bytes; unused share of pack pages.

**Speed:** p50/p95 and SQL statements and VM steps for `fs.write`, `fs.read`,
`fs.stat`, `fs.list`, `fs.grep`, `branch.merge`, `diff_commits`, `sandbox.mount`,
one-shot Commit, plus FUSE `getattr`/`lookup` counts for one exec.

**Acceptance (per item):**

| Item | Storage | Speed |
| --- | --- | --- |
| 1 | ≥ 12% smaller at r011-equivalent (simulated 14.8%) | no key operation p50 or p95 worse than 1.1× |
| 2 | ≥ 13% smaller (simulated 16.5%) | stat/getattr not slower; Commit p50 not higher |
| 3 | ≥ 7% at r011 (simulated 9.5%) and the synthetic P3 drop above | the lead's condition: read/lookup p95 within 1.2×, Commit p50 not higher |

A miss is a finding under the playbook; it never changes a gate and never
removes a proof. A storage gain bought with a ~50% speed loss is rejected
(AGENTS.md §3.9).

## 8. Recovery and rollout

- No rebuild: fork the newest good snapshot onto each new daemon. Earlier
  receipts keep their labels.
- After item 3 lands, one re-baseline for P3 (the lead's call), and STORAGE_STUDY
  gets "Recalibration after F-027" with measured savings beside the simulated
  ones.
- If item 3 fails its speed condition, items 1 and 2 still land; item 3 goes
  back to the fixer with its numbers.

## 9. Risks

| Risk | Item | Handling |
| --- | --- | --- |
| Spurious changes when old and new inode forms meet | 2 | §4.3 row-level form + semantic equality; boundary and merge proofs |
| One-time growth: the first rewrite of a leaf after item 2 may be stored full | 2 | measured in §7; expected small and once per leaf |
| Two inode forms to support forever | 2 | readers in one place (`attributes/read.rs`); tests for both |
| Lookup decodes a branch chain | 3 | chain cap 8, per-call memo, the lead's speed condition |
| A path appends to a sealed pack | 1 | verify the invariant first (§3) |
| SDK and daemon both write the Store (F-020) | all | unchanged by this batch; covered by F-020's locking test |

## 10. Not in this batch

Shared zstd dictionary (STORAGE_STUDY §6 item 4), compression level changes,
merging a Save's packs, chunk compaction (F-005), shorter `object_location`
keys, commit row compaction: each below 10% or not approved.
