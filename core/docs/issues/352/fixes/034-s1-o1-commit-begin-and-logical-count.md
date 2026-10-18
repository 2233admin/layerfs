# #352 record 034 · S1 (delta-candidate load) and O1 (Store writer after construct)

| | |
| --- | --- |
| Trigger | Owner, via the #352 liaison, 2026-10-19: S1, `begin` loads the delta-candidate ring on every first Save; O1, the Save writer took 2.2 s on `pnpm-first`. RCA first; ceilings to the liaison before edits |
| Approval | Liaison, 2026-10-19: fixes 1–3 in that order, each its own commit with one sample on `layerfs-issue359-prep` (`--setup clone`). Skip fixes 4 (O1-b) and 5 (O1-c) and record their ceilings here. `store-service store/commit.rs` (`logical_after`) approved for O1-a only; in `read/*`, only dropping a clone in `Fetch::signatures` was allowed |
| Kind | code path only. No Store format, schema or data change |
| Branch | `claude/issue352-s1-o1-034`, on staging `d679c84ee` (`claude/dsh-352-integration-c98eb1`). Not pushed |
| Commits | O1-a `13522bf39`; S1-a `6b47dbd26`; S1-b `4469e20a7`; this record: the commit after them |
| Binaries | release, `--locked`, image `layerfs-307-fuser-patch-clippy:1.85.1` (`378b799ef433`), under `core/target/issue352-r034/`, registered in `~/lfs-history/runs/issue359/binaries.json`. base `f72b9b9c` (on `77f124580`, the same product source as `d679c84ee`); O1-a `dd9d1b19` (addon `5c02b12a`); S1-a `c0bf738a` (`cf9f3549`); S1-b `39f3ecfc` (`c115d781`). Diagnostic builds for the RCA only (never committed): `43a7b330`, `a36082a9`, `56df6384` |
| Production LOC | O1-a `102246 -> 102319` (+73); S1-a `102319 -> 102328` (+9); S1-b `102328 -> 102339` (+11). Each commit message carries its line |

## Conditions

- `cost.mjs case <id> --binary <id> --part lfs`, `--setup clone` on
  `layerfs-issue359-prep`, Disposable/WAL/OFF,
  `LAYERFS_CONSTRUCTION_WORKERS=1`. One sample per arm, no retry, no
  best-of. Every sample listed is COMPLETE.
- **Host load** (one-minute average at the start of each sample, from the
  manifest). The owner directed not to wait for load to fall, so load was
  recorded instead. Other sessions ran cost.mjs throughout, and sequence
  numbers skip theirs. **Counts are the primary evidence. Times across
  samples at different loads are not attributed below about 2×.**

  | Sample | Case | Binary | Load |
  | --- | --- | --- | ---: |
  | s649 | small-commit | base `f72b9b9c` | 18.0 |
  | s651 | small-commit | diag | 13.4 |
  | s653 | pnpm-first | diag | 10.2 |
  | s655, s657 | pnpm-first | diag 2, diag 3 | 19–38 |
  | s659 | pnpm-first | base `f72b9b9c` | 38.1 |
  | s677 | pnpm-first | O1-a `dd9d1b19` | 10.1 |
  | s679 | small-commit | S1-a `c0bf738a` | 15.3 |
  | s685 | small-commit | S1-b `39f3ecfc` | 7.4 |

- s659 (base pnpm) ran at load 38, and its Commit took 50.8 s. Its times are
  ineligible and only its counts are used. The pnpm time comparison is
  s653 (diag build, load 10.2) against s677 (O1-a, load 10.1). The diag
  build's own counting adds cost, so that comparison flatters O1-a slightly.

## RCA

The full RCA is in the shared liaison note `r034-s1-o1-rca.md`. In summary:

- **S1.** The small Commit's `begin` was 6.76 of 13.78 ms (s649). Of that,
  5.48 ms was one statement, `SELECT … FROM content_signature ORDER BY
  stamp LIMIT 8193`. `stamp` has no index, so SQLite scanned all 8,192 rows
  and sorted them in a temporary B-tree (8,191 fullscan steps, 1 sort). The
  read ran in `save/state.rs State::new` on the first Save of every Storage
  handle. The daemon keeps one handle from bootstrap
  (`store-service bootstrap.rs:139`), so a warm daemon pays this once.
  A one-shot daemon pays it on every Commit, and so does every cost.mjs
  sample. The small Commit never uses the ring: its one whole-file object
  finds its declared base.
- **O1.** pnpm-first's writer ran 103,770 statements (s653). 44,178 of
  them were one-id locates, and 38,285 of those came from the
  `logical.count` Reader. `layerfs-content
  filesystem/statistics.rs logical_size_after` opened each changed file with
  `FileView::open`. For a whole-file root that reads and authenticates the
  **entire payload**, only to call `logical_len()`. The next largest
  consumers were bindings (47,526 single-row `binding_hint` inserts, 48 ms,
  and 7,548 locates) and the Save itself (about 2,950 locates and 9,441
  single-row pack-descriptor lookups, 39 ms). None of it is inside the
  publication lane.
- **Correction to the RCA note.** The note says logical.count accounts for
  "the 191 MB of payload reads". It accounts for about 45 MB of them:
  payload reads went from 191 MB (s653) to 146 MB (s677) once
  logical.count read none. The remaining 146 MB comes from construction and
  the Save.

## O1-a · a Commit's logical size from catalogue lengths (`13522bf39`)

**Old.** `logical_size_after` called `FileView::open(root)` per changed
regular file, which is one locate and one whole-payload read per whole-file
root.

**New.**
- In `layerfs-content`, `filesystem/statistics.rs logical_size_after_with`
  walks the same before/after difference. It gathers changed regular-file
  roots, with sign and `namespace_ref_count` weight, in windows of
  `LENGTH_WINDOW` = 1,024. It asks a caller-supplied length callback once
  per window and checks the callback's cardinality. `logical_size_after`
  is now this function over `FileView::open` (the payload route), and the
  SDK merge route (`sdk/branch.rs`) keeps using it.
- `layerfs-store-service`, `store/commit.rs Store::logical_after`, passes
  `Reader::file_lengths` (storage `read/length.rs`). Whole-file lengths
  come from the catalogue `canonical_length`; chunked and empty lengths
  come from the small FileState object, one locate per window. A storage
  refusal keeps its `CommitError::Storage` type.
- No `save/*` change.

**Proof.** `layerfs-storage/tests/logical_size_lengths.rs` (2 tests) uses
real `construct_bytes` files of every representation on one Storage:
- empty (FileState), 5 B and 100 kB whole-file, 300 kB chunked;
- a hard link under two names;
- a deleted file, a replaced file, and added files of each kind.

The payload route, the lengths route and the after tree counted whole all
give the same size, in both directions. 2,055 changed files are asked in 3
windows.

**Result, pnpm-first** (s653 diag → s677 O1-a; similar load):

| Measure | s653 (diag) | s677 (O1-a) | Change |
| --- | ---: | ---: | ---: |
| Writer statements | 103,770 | 66,173 | −37,597 |
| Locate statements (storage `locate`) | 44,159 | 9,759 | −34,400 |
| Writer statement time | 1.62 s | 0.84 s | −0.77 s |
| Blob reads | 28,281 / 258 MB | 18,798 / 211 MB | −9,483 / −48 MB |
| Payload reads | 7,457 / 191 MB | 4,365 / 146 MB | −3,092 / −45 MB |
| Commit − construct (finish, logical.count, bindings, validate, publish, install) | 1.74 s | 0.60 s | −1.14 s |
| Commit | 13.78 s | 11.68 s | −2.10 s (construct also −0.96 s; not attributed) |

The base sample s659 (load 38) shows the same locate count as s653 (44,091
against 44,159), so the diag build did not change the counts. The ceiling
sent before the edit was −1.2 to −1.6 s and about 65.6k statements. The
results are 66.2k statements and −1.14 s outside construct.

## S1-a · read the ring in slot order (`6b47dbd26`)

**Old.** `layerfs-persistence backend/sqlite/metadata_signatures.rs read`
ran `ORDER BY stamp`, with no index, and decoded generic records.

**New.** `ORDER BY slot` uses the primary key, so there is no sort, and the
rows are typed and decoded from borrowed blobs. They are then sorted by
stamp in memory, so the port still returns insertion order and
`Candidates::read`, with its stamp-order check, is unchanged. No schema
change. `read/fetch.rs` was not touched: `Fetch::signatures` holds one
clone of about 655 KB, so the clone the RCA counted twice is only one.

**Proof.** `layerfs-persistence/tests/signature_ring_order.rs` runs on real
SQLite (Disposable).
- 9,000 whole-file admissions wrap the 8,192-slot ring (newest stamp >
  8,192).
- The port's rows equal a raw `ORDER BY stamp` read, row for row.
- A fresh Storage loads the wrapped ring and proposes a post-wrap entry as
  the base of a near copy (prefix_selected 1).

**Result, small-commit** (s649 base → s679 S1-a; O1-a is also in s679):

| Measure | s649 | s679 | Change |
| --- | ---: | ---: | ---: |
| `begin` | 6.76 ms | 3.26 ms | −3.50 ms |
| Writer statements | 121 | 106 | −15 (O1-a: the logical.count locates) |
| Writer VM steps | 130,760 | 65,043 | −65,717 |
| Sorts | 1 | 0 | −1 |
| Fullscan steps | 8,191 | 8,191 | 0 (a slot-order scan is still a full read) |
| Writer statement time | 8.0 ms | 4.65 ms | −3.36 ms |
| Payload reads | 29 | 14 | −15 (O1-a) |
| Commit (daemon) | 13.78 ms | 9.52 ms | −4.26 ms |
| Delta outcome | prefix 1, no_candidate 0 | same | — |

The ceiling was about −4.5 ms of `begin`. The result is −3.5 ms of `begin`.
The Rust-side copy saving the RCA counted was smaller than expected
because there was only one clone.

## S1-b · load the ring at its first use (`4469e20a7`)

**Old.** `save/state.rs State::new` reloaded the ring whenever
`needs_load` was set. `save/select.rs State::offer` asked it for a proposal
for every whole-file object.

**New.** The `save/*` functions changed are:
- `save/state.rs State::new`: no longer loads the ring;
- `save/select.rs State::offer`: asks for the early proposal only while
  the ring is loaded.

Also changed:
- `encoding/delta/select.rs select` calls the new
  `Candidates::ensure_loaded` before its fallback `find` and before each
  `insert`.

Selection is unchanged. An unloaded ring means this Save has inserted
nothing, so whatever it would propose is a published object, never one
pending in this Save's packer. The early proposal in `offer` only seals
pending bases and prefetches one locator, and `select` makes its own
fallback query on the loaded ring. A failed Save still invalidates the
ring, and its next use reads the table again.

**Proof.** `layerfs-storage/tests/lazy_candidate_ring.rs` runs the same
Save sequence on two in-memory Stores:
- the lazy arm opens a fresh handle per Save, so the ring is unloaded at
  each start;
- the loaded arm keeps one handle, as a warm daemon does, so the ring is
  already loaded.

The sequence is:
1. a FULL new-file Save of three files;
2. a near copy that declares its base;
3. a near copy found through the ring;
4. a new file admitted into the ring, then a failed publication;
5. a Save on the same handle after the failure, with a near copy of the
   failed file (no candidate) and a near copy of a stored file (found).

After each Save, packs, locators and ring rows are identical, and so are
the delta outcomes. Identical packs mean the same object ids,
representations and delta bases. The declared-base Save reads no ring
table, and the invalidated ring is read exactly once after the failure.
With the fallback `ensure_loaded` removed, the test fails at step 3
(no_candidate 1 instead of prefix 1).

**Limit of the proof.** After the failed Save (step 5), the kept-handle arm
is lazy too, because its ring was invalidated. That step therefore checks
reload-after-invalidation and the expected selections, not lazy against
eager. Steps 1–3 compare lazy against loaded. One more case is
unchanged in kind, not removed: the ring is read once per handle outside
any write transaction, before and after this change. A Store another
process changes between that read and this Save's flush is ordered by
stamp in both designs.

**Result, small-commit** (s679 S1-a → s685 S1-b):

| Measure | s679 | s685 | Change |
| --- | ---: | ---: | ---: |
| `begin` | 3.26 ms | 0.11 ms | −3.15 ms |
| Ring reads (storage `signatures`) | 1 | 0 | −1 |
| Writer statements | 106 | 103 | −3 |
| Writer VM steps | 65,043 | 7,685 | −57,358 |
| Fullscan steps | 8,191 | 0 | −8,191 |
| Writer statement time | 4.65 ms | 2.19 ms | −2.46 ms |
| Commit (daemon) | 9.52 ms | 6.41 ms | −3.11 ms (load 15.3 → 7.4; not all attributed) |
| Delta outcome | prefix 1, no_candidate 0 | same | — |

The ceiling was `begin` at about 0.3 ms. The result is 0.11 ms.

**Overall, small-commit:** `begin` 6.76 → 0.11 ms; writer statements
121 → 103; writer VM steps 130,760 → 7,685; daemon Commit 13.78 → 6.41 ms
(loads 18.0 → 7.4). A Commit that stores a new whole-file object FULL, such
as pnpm-first, still loads the ring at its first insert, now at the S1-a
cost.

## A-1 · exact reuse trusts the content address (owner decision, 2026-10-19)

**Integrity policy change, in one line:** on exact reuse (the same id under
the same role and canonical length), a Save no longer reads the stored copy
back, so a corrupt stored object surfaces at its first read, not at Save.

**Why.** After O1-a, Save::accept was 2.76–2.86 s of pnpm-first's Commit. 89%
of that was re-checking objects the Store already holds. Of 63,392 accepted
objects, 55,966 were reused, and 50,183 of them were read back in full
(396 MB, 1,543 ms) to be compared byte for byte (s689). The full split and
the A-1 option table (a/b/c) are in the shared liaison note
`r034-save-accept-rca.md`. The owner chose (b).

**Old.** `save/wave.rs State::wave`, on a found locator, required:
- equal role;
- equal canonical length;
- `self.resolve(id)? == object.canonical()`, a full reconstruction plus a
  byte compare.

Any mismatch failed the Save with `Collision`.

**New.** Only the `save/*` function `State::wave` changes. It still requires
equal role and canonical length, and a mismatch is still `Collision` at
Save. `||` short-circuits, so today's code never read back on a mismatch
either. A match is accepted without `resolve`. `State::resolve` stays: the
Save's own provider still uses it (`save/provider.rs read_inner`).

**Every read path still authenticates (audit at `5da5401aa`).** Every route
that returns stored object bytes ends in a hash check against the id. A
corrupt object therefore fails at read with a typed `StorageError::Integrity`.
- `Reader::read_objects` / `read_with` / `read_kept` go through
  `read/objects.rs ReadState::read`, then
  `encoding/delta/read.rs Resolver::resolve_at` and `resolve_charged`. The
  checks there are:
  - each object of an ordinary or payload chain is decoded and checked with
    `ObjectId::for_bytes(&decoded) != location.object_id`, giving
    `Integrity("dependency identity")`;
  - a pooled `InodeLeaf` is rebuilt and checked, giving
    `Integrity("pooled leaf identity")`, and `encoding/pool/read.rs` checks
    again, giving `Integrity("pooled canonical identity")`;
  - an `InodeBranch` gives `encoding/pool/branch.rs`
    `Integrity("branch canonical identity")`;
  - the record grammars check base identities (`encoding/delta/record.rs`:
    compact, chunk and framed base identity);
  - a whole-pack read checks the pack digest
    (`port/read_pack.rs PersistedPack::authenticate`).
- Save-side reads:
  - `save/provider.rs Save::read_objects` / `read_inner` return this Save's
    own pending bytes or `State::resolve`, which is the same `Resolver`;
  - delta-base acquisition goes through `Resolver::resolve_dependency`.

  A later Save that uses a corrupt object as a delta base fails with the
  same error.
- Store-service and Workspace reads (`store/ports.rs`, `sdk/cached.rs`,
  workspace `base/client.rs CanonicalClient`) read through the storage
  `Reader`.
- Not byte reads:
  - `Reader::file_lengths` returns catalogue lengths for whole-file objects
    and decodes only FileState objects (authenticated). It never returns
    stored payload bytes.
  - The workspace base cache is seeded with the bytes construction just
    built (`base/cache.rs admit_constructed`), not with stored bytes. A
    daemon that seeded a reused object serves correct bytes from its cache,
    and the damaged stored copy is seen on the first cache miss.

No read path skips authentication.

**Proof.** `layerfs-storage/tests/exact_reuse_trust.rs` (4 tests,
in-memory Store):
- an exact reuse on a fresh handle reads no pack (no `read_*` port call);
- the same holds for a pooled `InodeLeaf` (no pack acquired), and the leaf
  still reads back whole;
- a stored locator whose role (or canonical length) was changed is refused
  with `Collision(id)`;
- a stored record with one payload byte flipped, and its pack digest
  re-sealed so only object authentication can see it, is accepted by a
  reusing Save (inserted 0, reused 1, no pack read). Its next read fails
  with `Integrity("dependency identity")`.

On the old `wave()`, the no-read and corruption tests fail and the mismatch
test passes.

**Tests deleted** (they asserted the retired read-back on reuse):
- `layerfs-storage/tests/pooled_demand_work.rs`
  `save_exact_reuse_consumes_the_group_already_acquired_by_discovery`: a
  reused pooled leaf acquired its pack exactly once. Now it acquires none,
  which `an_exact_reuse_of_a_pooled_leaf_acquires_no_pack` asserts.
- `layerfs-persistence/tests/sqlite_reference_acquisition.rs`
  `exact_reuse_still_acquires_and_compares_canonical_bytes`: the retired
  policy itself.

## Not done (approved skips), with ceilings

- **O1-b · bindings.** 47,526 single-row `INSERT OR IGNORE INTO binding_hint`
  calls would become multi-row pages, and the 7,548 directory-page locates
  in bindings' Reader would be batched. Ceiling about **−0.1 to −0.2 s** on
  pnpm-first. The files would be persistence `history/hints.rs record`
  plus its query, and store-service `store/hints.rs record_new_bindings`
  and `new_bindings`. Both run before the lane, in their own write
  transactions.
- **O1-c · Save-internal.** About 2,950 locates, 9,441 single-row pack
  descriptor lookups (39 ms) and the inode-value reads (2,298 statements,
  97 ms). Ceiling **under −0.1 s**.
- **A-2a · locator-cache eviction search.** `read/locator_cache.rs
  LocatorCache::make_room` / `evict_one` scan the protected demand
  linearly per probe; a binary search would save at most 45 ms (s691).
  Skipped by the liaison.
- Not material on these cases: `save/wave.rs wave()` re-reads every
  exact-reuse hit with `resolve(id)` to compare bytes. That would matter
  only on a Commit full of already-stored files. **Wrong** (corrected after s689): pnpm-first *is* such a Commit, with
  55,966 reuses. The count was misread from `whole_due_reuse`. See A-1.
- After bindings, about 2.1 s of the pnpm Commit (RCA, under load) runs no
  Store SQL. That is install and overlay work, outside this lane's scope.

## Checks and gaps

- **Tests.** Every persistence and storage test binary passes at each fix
  commit (65 for S1-a, 59 for S1-b), each under a 100 s alarm. The new
  tests take under 0.2 s. Clippy `-D warnings` and rustfmt are clean on the
  changed crates.
- **Linux daemon targets** (liaison's pre-push condition): `store_commit`
  (10), `mounted_commit` (9), `mounted_install` (4), `concurrent_commits`
  (3), `mounted_commit_failures` (4), `r5_5_install_survival` (4) and
  `r5_10_producer_profile` (1). They ran once each in their own container
  (pinned image `378b799ef433`, `/dev/fuse`, `SYS_ADMIN`), under a 115 s
  timeout, on the source tree of `1380bd542` (the same product code as
  `4469e20a7`), at host load 11.5–13. All 35 tests pass; there was no F-046
  or F-049 recurrence.
- **Not run:**
  - workspace-wide builds and checks;
  - the other Linux mount targets;
  - the r011 storage gate;
  - any Durable profile (`NOT_RUN — disabled by owner until explicit
    reauthorization`);
  - fs-bench-pro (frozen).
- **Storage.** No format change and no bytes-written change by design. The
  equivalence tests show identical packs. No storage arm was measured.
- **One sample per arm.** Times are under shared-host load, so the count
  columns carry the evidence.
