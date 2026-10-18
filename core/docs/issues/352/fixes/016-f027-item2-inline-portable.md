# Portable mode and mtime inline in the inode value (F-027 item 2)

| | |
| --- | --- |
| Trigger | OPTIMIZATIONS.md F-027, binding spec [STORAGE_BATCH_SPEC.md](../STORAGE_BATCH_SPEC.md) §4 item 2: carry mode+mtime inside the 73-byte inode value and make an mtime-only capture not a change (§4.8) |
| Playbook step | storage batch item 2 (owner-approved 2026-10-18) |
| Kind | 1 forward-only: the value grammar is unchanged in width and version; the inline form is a new row-level encoding |
| Old Stores | read unchanged: the root form is byte-identical to every leaf written before this change |
| Old data | not migrated; root-form rows keep their form and bytes until a row really changes |
| Binaries | daemon `76fbb78b`, addon `f7c97bd6` under `core/target/issue360/`; Init-inline rebuild pending |
| Commits | `8aed51d60` + `683666d45` (Init inline) + diff-semantics follow-up on `issue360-storage` |
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

Proofs + measurement: pending lead (§4 proofs, §6, §7).
