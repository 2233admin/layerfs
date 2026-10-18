# One Commit per file write, and why the Store stays small

> **Status:** Current explanation, written 2026-10-18 from the code at
> `dsh-history-replay` and the #352 storage study. It explains existing
> behaviour and decided work; it adds no requirement. Labels: **[impl]**
> implemented, **[decided]** decided but not merged (with its fix id),
> **[E]** measured, **[I]** inferred. Numbers are from
> [STORAGE_STUDY.md](../issues/352/STORAGE_STUDY.md) at range 11 unless stated.
> Companion notes: [global SQLite Store](84-global-sqlite-store.md),
> [Store concurrency model](83-store-concurrency-model.md).

## 1. The question

Every SDK file write (`fs.write`, `fs.rm`, `fs.apply`) publishes its own
LayerFS Commit, and the #352 history replay deliberately writes every changed
file as its own call (owner decision 2026-10-18: it is a load test). The writer
also sends the **whole file**, even when one line changed, because the replay
rebuilds history from Git, which only holds each file's full new contents.

So a naive reading is "every Commit stores a whole copy of a file". It does
not. This note explains what one Commit actually writes, why file content costs
only about its change, and where the real per-Commit cost is.

## 2. What one Commit writes

A Commit that changes one file of an existing tree writes, in one Save and one
publish [impl]:

```
fs.write(path, full bytes)
  │
  ├─ overlay: only pieces that differ are written            (no change → UpToDate, no Commit)
  │
  ├─ content: the new version of the file                    ~1.2 KB stored  [E]
  │     whole file (< 128 KiB): one object, usually a delta against the previous version
  │     large file (≥ 128 KiB): CDC chunks; unchanged chunks are shared, only new ones stored
  │
  ├─ metadata (pooled, zstd level 1):                        ~1.6 KB stored  [E]
  │     inode leaf for that file (a ~70–90 B pooled delta)
  │     inode-table root branch (rewritten in full today)
  │     filesystem root
  │     attribute leaf + mtime as chunk / extent leaf / file state   (F-027 item 2 removes these)
  │     directory leaf only if a name is added or removed (0.1–0.6 per Commit)
  │
  ├─ index rows: ~9 object_location rows (49 B), the Commit row (258 B),
  │     commit_identity, inode_value                         ~1.0 KB stored  [E]
  │
  └─ page waste: unused space in 4 KiB pages                 ~1.2 KB         [E]
                                                     total  ~5.1 KB per Commit (ranges 9→11) [E]
```

Inodes are addressed by serial number, not by path, so editing a deep file
does **not** rewrite its chain of parent directories: metadata per Commit is
about 1,070 + 1.2 × depth bytes, depth barely matters [E].

## 3. Why file content costs about its change

| Mechanism | What it does | Effect [E] |
| --- | --- | --- |
| Piece compare on write | `fs.write` with the same length compares the old bytes piece by piece and writes only pieces that differ into the overlay (`layerfs-daemon/src/sdk/mutation.rs`) | identical bytes: UpToDate, no Commit, nothing stored |
| Content addressing | an object's id is the hash of its canonical bytes | the same content anywhere in history is stored once |
| Whole-file deltas | a small file's new version is stored as a copy/insert delta against a similar earlier version (depth cap 16, a read budget per chain) | 88% of whole-file records are deltas, each about **4.4%** of the file's size |
| Full records | when no base qualifies or the chain is at its cap, the version is stored full with zstd level 3 | about 34% of the file's size; keeps reads bounded |
| Content-defined chunks | files ≥ 128 KiB are cut into 8/16/32 KiB chunks at content-chosen boundaries, so an edit moves only nearby boundaries | unchanged chunks are reused; chunks may also be deltas (cap 8) |

Result at range 11: **8.5 MiB of content holds the history of 7,825 Commits,
1.10× the size of the latest version alone** [E]. Content is 25.9% of the
Store.

Writing whole files is a property of the replay's input, not of the product.
Through the mount, an agent's tool can write a byte range in place, and the
owner requires edit cost independent of file size on that route [impl]. Either
way, storage keeps only what changed.

## 4. Where the per-Commit cost really is

The fixed part of a Commit (metadata, index rows and their page waste) does
not shrink with a smaller edit. At range 11 it is about three quarters of the
Store [E]:

| Part | Share | Grows with |
| --- | --- | --- |
| Content | 25.9% | bytes changed (after deltas and chunk reuse) |
| Metadata | 31.7% | Commits, plus live inode count through the root branch |
| Index rows | 23.0% | Commits (objects per Commit) |
| Page waste | 19.2% | rows and pack size |

So **the number of Commits, not the bytes written, drives storage** [E]: a
per-Commit model fitted on ranges 0–7 predicts ranges 9 and 11 within −0.2%
and −1.8%, while a changed-bytes model misses content by 17–19%.

Three design details inflate that fixed part; F-027 removes them, forward-only,
without rewriting old data [decided, F-027,
[STORAGE_BATCH_SPEC.md](../issues/352/STORAGE_BATCH_SPEC.md)]:

| Item | Today | After | Simulated saving at r011 |
| --- | --- | --- | --- |
| 1. Pack directories sized to their groups | every pack reserves 16 slots, stored as zeros | only used slots | 14.8% |
| 2. Mode and mtime in the inode value | a 12-byte mtime stored as a chunk, extent leaf and file state, with its own pack | 16 bytes inline | 16.5% |
| 3. Inode-table branches as deltas | the root branch rewritten in full every Commit; after `node_modules` (P3) a full child branch too, +2.5–6 KB per Commit | a short delta | 9.5% now, more after P3 |
| **Together** | ~5.1 KB per Commit (≈9 KB expected after P3) | **~3.4 KB per Commit** | **−41%** (r201 forecast 3.37 → ~1.95 GiB) |

## 5. Why one Commit per write is still the right model here

- **Every step is restorable.** Each Commit is a complete immutable root; any
  write can be inspected, compared or restored alone.
- **Content is not duplicated** (§3); a Commit adds roughly a fixed few KB of
  bookkeeping plus the compressed change.
- **The replay is a load test.** One Commit per file write produces ~249k
  Commits over the plan instead of ~26k with one per tool-call step, which
  exercises the publish lane, history depth and the per-Commit cost far
  harder than real use [E, plan arithmetic]. A product that commits once per
  tool call would store less than the replay's totals; read the replay's
  per-Commit figures as the unit cost, not as the per-tool-call product cost.
- **The lever is the fixed cost, not the content.** Optimizations should target
  bytes per Commit (F-027, then the smaller items in STORAGE_STUDY §6), not the
  delta and chunk machinery, which already stores close to the change.

## 6. Known gap

A rewrite of identical bytes **through the mount** updates mtime, and mtime is
part of the root today, so it commits a new root although no byte changed
[impl]. SDK `fs.write` does not have this gap (§3). The replay's Sandbox apply
route hit it and is fixed in the harness (#352 F-028); whether an mtime-only
change should count as a change in a Workspace Commit is an open owner
question.
