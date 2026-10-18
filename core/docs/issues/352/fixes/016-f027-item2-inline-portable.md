# Portable mode and mtime inline in the inode value (F-027 item 2)

| | |
| --- | --- |
| Trigger | OPTIMIZATIONS.md F-027, binding spec [STORAGE_BATCH_SPEC.md](../STORAGE_BATCH_SPEC.md) §4 item 2: carry mode+mtime inside the 73-byte inode value and make an mtime-only capture not a change (§4.8) |
| Playbook step | storage batch item 2 (owner-approved 2026-10-18) |
| Kind | 1 forward-only: the value grammar is unchanged in width and version; the inline form is a new row-level encoding |
| Old Stores | read unchanged: the root form is byte-identical to every leaf written before this change |
| Old data | not migrated; root-form rows keep their form and bytes until a row really changes |
| Binaries | final: daemon `928b2872` (sha256 `928b2872e02e…`), addon `0286ddbd` (sha256 `0286ddbd35d1…`), from `c4d9893e7`, under `core/target/issue360/`. Earlier: `76fbb78b`/`f7c97bd6` (`8aed51d60`), `76816d87`/`04cbdedb` (`683666d45`) |
| Commits | `8aed51d60` (item 2), `683666d45` (Init inline), `9dae17892` (rustfmt only), `c4d9893e7` (diffs compare by value) on `issue360-storage` |
| Compatibility test | range 14 played on a fork of `p2-main-e` range 13 (written by older daemons, root form throughout) with the final binaries: checkpoint ok. The mixed Store (root-form history, inline range 14) then passes the §4 proofs below |
| Regression test | `layerfs-content/tests/inode_leaf.rs` (both forms, mixed leaf, padding/kind/value rejection, pooled inline), `layerfs-workspace/tests/captured_namespace_inline.rs` (mtime-only, identical rewrite, net-zero directory → kept base root; one real change → exactly one inline inode) |
| Recovery | none needed: decode dispatches on the byte-0 tag bit |

## Change

`layerfs-content/src/object/inode_leaf.rs`: `InodeValue.metadata_root` keeps its
name (files owned by other sessions compile unchanged) but is now
`InodeMetadata::{Root(ObjectId), Inline(PortableMetadata)}`. Byte 0's high bit
tags the form: `kind.code() | 0x80` is the inline form with mode at 41..45
(u32 BE), mtime seconds at 45..53 (i64 BE), nanoseconds at 53..57 (u32 BE) and
zero padding at 57..73. Decode rejects nonzero padding, a foreign kind code
and inline values failing `PortableMetadata::validate(kind)`. The root form
encodes exactly as before.

`filesystem/attributes/read.rs`: `read_portable` takes `InodeMetadata`; the
inline arm validates and returns with zero object reads, the root arm walks
the attribute tree as before. `object/inode_leaf.rs` also grew `root()`,
`inline_value()` and `inline_keys()`, so opaque attribute reads and key
listings of an inline inode still answer the two portable keys.

Reference surface: `object/admission.rs` contributes `content_root` plus
`metadata_root.root()` — an inline inode references no attribute tree.
`filesystem/rows/spool.rs` carries the tagged kind byte and the 32-byte
metadata field verbatim through its construction rows.

`compare/tree.rs`: `same_value` stays the strict byte-level check; the new
reader-taking `same_inode` also compares the decoded portable values when the
forms differ. `inode_changes` and the `root_changes` end-filter use it, so a
form-only difference is not a change. Merge `decide.rs`/`build.rs` are
untouched: `decide.rs`'s `time()` passes `entry.value.metadata_root` straight
to `read_portable` and `build.rs` keeps the strict `same_value`.

`layerfs-workspace/.../namespace/inodes.rs`: `value()` returns the stored row
exactly — old form, old mtime — when content root, directory entries (the
captured header's change count via `get(key(HEADER, serial))`/`read_number`),
namespace count and mode all match; mtime is deliberately not compared.
`metadata()` writes `Inline` for fresh inodes, for stored inline values and
for stored roots whose attribute tree holds only the two portable keys; a
stored root with any other key keeps the root form through the existing
`portable_root` patch. `base/client.rs` reads an inline value directly with no
cache entry. Verified under the spec's non-stop rule: a symlink's only
possible change is a new target, and capture allocates a fresh serial for it,
so the stored-symlink path in `value()` can never see a changed target and no
stored target is ever re-read from the capture.

## Project Init writes the inline form (owner decision, item-2 follow-up)

The earlier "Init keeps root" deviation was reversed: `init_entry` rows are
written and read only by the live operation owning them — every read query
filters `owner.owner_epoch = ?` and other sessions' rows are only discarded
(abandoned/release), never resumed — so the `metadata_root` blob's content is
private to one running binary. The acquisition port's entry metadata field is
now `PortableMetadata` (renamed `metadata`; no #353/#354-owned file reads the
port fields) and the SQLite provider stores it in the unchanged 32-byte
column as `mode u32 BE | mtime_seconds i64 BE | mtime_nanoseconds u32 BE |
16 zero bytes`, decoded with padding rejection and `validate(kind)`.
`schema.sql` and the stored schema source are byte-identical. `scan.rs` no
longer emits attribute objects at all and `namespace.rs` writes
`InodeMetadata::Inline`.

## Defect found by the owner proof (item-2 follow-up)

The §4 boundary proof's chmod round-trip on an old-form base reported 1,259
paths as `Modified` after mode restoration: the Store-service diff walk and
the daemon operator compared inode values byte-wise, so a form-only
difference (root-form base, inline-form Commit) listed as a change even
though the decoded portable values were equal. Fixed the same way
`same_inode` settled the compare walk: every same-serial comparison now goes
through `same_inode` / `same_metadata` (strict byte fast path first), the
`metadata` flag is true only when the decoded mode/mtime differ, and a
directory whose decoded metadata matches lists only its children
(`children_only`). Sites: `sdk/compare.rs` (`change()`, `emit()`) and
`daemon/operator/workspace.rs`; the oracle test's own walk mirrors them.
Audited and clean: `sdk/blame.rs` (kind only), `diff_files`/`body` compare
`content_root`, history has no `metadata_root` use, merge candidate naming
uses hints — merge `build.rs`'s strict `same_value` is the #353-owned
serial-reuse check, reported, not edited.

## Tests

Codec: round-trip both forms; root form byte-identical; a mixed-form leaf;
nonzero padding, bad kind code, invalid inline mode for the kind and nanos ≥
1e9 all rejected; a pooled value wraps an inline value.
Workspace: utimens-only, an identical rewrite and a create+delete under a
directory each keep the base root (and row bytes); one chmod beside the three
no-ops changes exactly one inode, written inline with the live mode and
mtime; untouched root-form rows keep their exact bytes. Root-form patch
coverage for attributes beyond the portable pair stays in
`captured_namespace_metadata.rs`.
Existing suites adapted mechanically; deleted tests: none.

## Proofs (lead, 2026-10-18)

Scripts and receipts under `~/lfs-history/runs/issue360/`: `proof-item2.mjs`,
`stat-probe.mjs`, `init-compare.mjs`, `speed-table.mjs`. Every proof runs on a
fresh byte clone of the arm's Store volume, a fresh home and a fresh Sandbox,
one command each, Disposable/WAL/OFF, 4 KiB pages,
`LAYERFS_CONSTRUCTION_WORKERS=1`. Docker resources are `layerfs-issue360-*`.

| Proof (§4 / §6) | Result | Receipt |
| --- | --- | --- |
| Value equivalence and boundary differences: o+x toggled on all 1,665 non-symlink paths of the mixed Store, Committed (every row rewritten inline), restored, Committed; remount | listing of kind, mode, mtime to the ns and size identical for all paths; `diff_commits(base, toggled)` 1,658 paths, `diff_commits(base, restored)` **0** | `proof-new-all-1792320177401` (final binaries). The same proof on `76816d87` reported 1,259 spurious `Modified` paths: the defect fixed by `c4d9893e7` (`proof-1792319575728`) |
| mtime-only is not a change (§4.8): `touch`, identical rewrite, temp file created and deleted | each Commit `UpToDate`; the three beside one real edit: `Committed`, exactly 1 changed path; after a remount the touched file shows its committed mtime (same ns) | same |
| Attribute-only change: `chmod 600` of one file | exactly 1 changed path; mode 600, mtime unchanged to the ns after a remount | same |
| Checkpoint after a played range | range 14 checkpoint ok (old arm and final new arm) | `i360-r14-old`, `i360-r14-final` |
| Dedup: one existing file copied to a new path; 1,000 known files copied into a new folder | content added (newStored − newMetadata): one file 6,424 B old → 6,382 B new; 1,000 files 9,917 B old → **0** new | `proof-old-p45-1792319900116`, `proof-new-p45-1792319910555` |
| Localized edit: 1 byte in the middle of a 1 MiB and a 16 MiB file, through a mounted Workspace | stored per edit Commit: 1 MiB 3,577 → 3,276 B, 16 MiB 15,344 → 15,065 B; statements 180 → 138 and 175 → 165 | same |
| Compression per role | canonical bytes per content role unchanged; pack bytes −2.0% (domain 0) and −0.6% (domain 1) | range-14 figures |

**Findings, not regressions (both arms alike):**
- The dedup probe's single copied file adds ~6.4 KB of non-metadata bytes on both
  arms, so §6's "content added = 0" fails for that case independently of item 2.
  I haven't found where those bytes come from (`sizes.newStored − newMetadata`
  counts every non-metadata stored byte, which may include a whole-file
  object for the new path).
- A localized edit stores 15 KB at 16 MiB against 3–3.6 KB at 1 MiB on both
  arms: the "equal at both sizes" condition fails before and after item 2.
  The extra bytes are metadata (extent pages), not content.
Both are carried to the owner as open items. Item 2 makes neither worse.

## Performance, old vs new

Both arms forked the **`p2-main-e` range-13 snapshot** and played range 14
once, measured. Old: daemon `20b7fde1`, addon `c41ae8c5` (item 1; identical
product source to this branch's base `7a11f3c3e`, no `core/crates` or `sdk/js`
difference). New: the final `928b2872` / `0286ddbd`. Host 1-min load in the
runner VM: old 0.44 → 1.72, new 1.49 → 2.23 (macOS host load average 7–9 from
other sessions).

### Storage (range-14 growth on the same start Store, 42,627,072 B)

| Measure | Old | New | Change |
| --- | ---: | ---: | ---: |
| Store file after the range | 47,390,720 | 46,632,960 | −1.6% |
| **Store growth over range 14** | 4,763,648 | 4,005,888 | **−15.9%** |
| New stored bytes | 6,586,353 | 5,514,239 | −16.3% |
| New metadata (index rows) | 3,872,537 | 3,192,297 | −17.6% |
| New pack bytes | 2,713,816 | 2,321,942 | −14.4% |

Objects by role, whole Store after the range (old → new): chunk 11,308 →
10,068, extent leaf 11,038 → 9,798, file state 11,038 → 9,798, attribute leaf
12,822 → 11,446 (−1,240 / −1,240 / −1,240 / −1,376): the four objects per
changed inode that range 14 no longer writes. Inode leaf/branch and root
counts +5 / +30 / +30 (run interleaving).

The whole Store shrinks only 1.6% because old rows are not rewritten (Kind 1).
Acceptance (spec §7: ≥ 13%) is met on the growth this item controls, −15.9%. The
spec's "r011-equivalent snapshot" figure would need ranges 1–11 replayed on
the new daemon, which was not done here (gap).

**Init** of the 51,491-entry #359 head tree (`init-compare.mjs`): the Store file is
124,923,904 B old and 124,952,576 B new (+0.02%, 7 pages); Init 23.2 s → 23.1 s. Init already
deduplicated metadata roots (357 distinct mode/mtime trees for 51k
entries), so moving them inline saves objects (−224 chunk, −224 extent leaf,
−224 file state, −357 attribute leaf) but not file pages.

### Statements per stat (spec §7; owner's "statements per stat, old vs new")

`stat-probe.mjs`: the 20 regular files range 14 modified (each arm wrote them
itself: old arm root form, new arm inline), one cold `stat` each through FUSE
in a fresh Workspace on a fresh daemon:

| | Old | New | Change |
| --- | ---: | ---: | ---: |
| Store statements (20 stats) | 1,458 | 924 | **−37%** (72.9 → 46.2 per stat) |
| Read transactions | 486 | 308 | −37% |
| Store reader requests | 182 | 91 | −50% |
| Pack bytes read | 446,250 | 297,623 | −33% |
| FUSE lookups / getattr | 30 / 1 | 30 / 1 | |

SDK `fs.stat` (in-process) costs the same in both arms (1,959 statements for
the 20): it returns type, inode and size, never mode or mtime
(`store-service/src/sdk/reads.rs` `stat`).

### Speed (range-14 trace, ms; statements p50)

| Method | n | p50 old → new | p95 old → new | p50 × | p95 × | statements p50 |
| --- | --- | --- | --- | --- | --- | --- |
| fs.write | 982 | 17.75 → 15.81 | 42.98 → 39.31 | 0.89 | 0.91 | 1361 → 1187 |
| sandbox.exec | 292 | 47.35 → 43.89 | 110.11 → 130.43 | 0.93 | 1.18 | 0 → 0 |
| sandbox.mount | 152 | 13.16 → 13.10 | 33.68 → 38.23 | 1.00 | 1.14 | 57 → 57 |
| sandbox.unmount | 152 | 8.94 → 8.80 | 15.71 → 24.88 | 0.99 | 1.58 | 0 → 0 |
| **sandbox.commit** | 144 | 12.69 → 11.66 | 39.20 → 31.28 | **0.92** | 0.80 | 188 → 188 |
| fs.list | 98 | 3.47 → 3.01 | 10.59 → 10.42 | 0.87 | 0.98 | 243 → 249 |
| fs.grep | 97 | 9.21 → 9.92 | 207.06 → 112.08 | 1.08 | 0.54 | 712 → 632 |
| fs.apply | 94 | 19.21 → 16.71 | 40.85 → 36.47 | 0.87 | 0.89 | 1262 → 1059 |
| fs.glob | 90 | 5.30 → 4.62 | 47.14 → 45.09 | 0.87 | 0.96 | 385 → 354 |
| **fs.stat** | 89 | 2.63 → 2.66 | 9.39 → 7.45 | **1.01** | 0.79 | 190 → 171 |
| fs.diff_files | 88 | 4.94 → 4.54 | 11.10 → 13.51 | 0.92 | 1.22 | 366 → 371 |
| fs.read | 87 | 3.32 → 3.09 | 7.89 → 7.10 | 0.93 | 0.90 | 264 → 245 |
| fs.rm | 36 | 21.00 → 26.36 | 38.87 → 49.54 | 1.26 | 1.27 | 1516 → 1721 |
| branch.fork | 24 | 0.25 → 0.51 | 1.10 → 1.65 | 2.05 | 1.49 | 16 → 16 |
| branch.merge | 9 | 9.19 → 18.23 | 346.92 → 386.67 | 1.98 | 1.11 | 245 → 245 |
| branch.diff_commits | 7 | 1.37 → 1.52 | 40.71 → 76.56 | 1.10 | 1.88 | 69 → 69 |
| branch.list_commits | 7 | 0.42 → 0.62 | 0.63 → 1.22 | 1.46 | 1.93 | 68 → 68 |
| branch.publish | 2 | 9.60 → 12.17 | 9.60 → 12.17 | 1.27 | 1.27 | 2346 → 2346 |

Acceptance (spec §7 item 2): stat/getattr not slower — FUSE stat statements
−37% and Store requests −50% on rewritten rows; SDK `fs.stat` p50 1.01× at
fewer statements (190 → 171). Commit p50 not higher: 0.92×. **Pass.**

**Watch, not regression:** branch.fork, branch.merge,
branch.list_commits and branch.publish move with equal statement counts. All
four are time-only, one sample, sub-millisecond to low-millisecond medians, on
a host at load 7–9. fs.rm moved with its statement count (1516 → 1721), which
differs with the run's merge interleaving, as item 1 recorded. Not resampled.

## Left open

- §6 dedup single-file case and localized-edit size dependence fail on both
  arms (above): pre-existing, owner's call.
- Merge `build.rs` (#353/#355) keeps the strict `same_value` for serial
  reuse. For a root-form and an inline-form value with equal decoded values
  it may assign a fresh serial instead of reusing one. The merge-equivalence
  proof over r7a2–r11's recorded merges (spec §4) was not run here, and
  needs #353's agreement to change that file if it shows a difference.
- r011-equivalent whole-Store figure (needs ranges 1–11 on the new daemon).
