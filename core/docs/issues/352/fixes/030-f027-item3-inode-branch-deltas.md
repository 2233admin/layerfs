# Inode-table branches stored as deltas (F-027 item 3)

| | |
| --- | --- |
| Trigger | OPTIMIZATIONS.md F-027. Binding spec: [STORAGE_BATCH_SPEC.md](../STORAGE_BATCH_SPEC.md) §5, item 3. Every Commit rewrote each changed `InodeBranch` whole. Once the table has two levels (P3, `node_modules`), that is a full child branch per Commit |
| Playbook step | storage batch item 3 (owner-approved 2026-10-18, gated on #354 and a #359 baseline, both present in this branch's base `46e17bdf3`) |
| Kind | 1, forward-only (REBUILD.md): a new record form under the `InodeBranch` role. No schema change, no migration |
| Old Stores | read unchanged: their branches are `0 \| page`, the whole form, byte-identical to before |
| Old data | not rewritten. A branch takes the new form only when a Commit rewrites it, so a chain may start from an old whole branch |
| Binaries | old daemon `cc185d13` / addon `66d774c8` (source `46e17bdf3`, rebuilt from `git archive`; byte-identical to the sealed `cc185d13` / `66d774c8` from `2d84fe1bb`). New daemon `3dad6f79` / addon `43c96012` (source `7ac7343c7`). Both release `--locked --offline -j 6`, image `378b799ef433`, target volume `layerfs-issue360-i3-cargo-target`, under `core/target/issue360-i3/` |
| Commits | `7ac7343c7` (implementation, tests, docs); `040f517c8` (this record); `01dc7eefa` (merge of `origin/claude/issue352-correctness-644bbc` at `5ae2b7034`: F-036, F-043, c01–c03); `a76b4ac33` (bases re-located per F-036; closure, chronology and merge-read proofs); `f3396ae0d` (four inherited persistence tests repaired); this record's update. Branch `claude/issue360-item3-branch-deltas-72ecad`. M1 equivalence: `32db594f2` + `383c5daa7` on branch `issue360-i3-m1-equiv` (item 3 cherry-picked onto `issue353-m1-360-equiv` `58329939b`) |
| Compatibility test | `compat.mjs` range 14 with daemon `3dad6f79` on fork `i3-compat` of `p2-main-f`'s range-14 snapshot (written by `57141b57`; all branches whole): **ok**. 380 git paths, 366 ids, 1,261 files; nothing missing, extra or changed; 3,827 ms |
| Regression test | `layerfs-storage/tests/inode_branch_deltas.rs` (4 tests), `layerfs-storage/tests/inode_branch_merge_reads.rs`, `layerfs-persistence/tests/inode_branch_delta_custody.rs` (2 tests); on the M1 branch, `merge_mixed_forms`'s delta-form case (below) |
| Recovery | none needed: readers dispatch on the record tag under the role |

## Old design

`encoding/delta/select.rs` `select()` returned `encode_full` for every tree
role, `InodeBranch` included. The `UnchangedPrefix` predecessor that
`sorted/page.rs` declares on every rewritten page was discarded. The canonical
inode branch holds 40 B per child (an 8-byte key and a 32-byte child id) for
up to 127 children. Most of it is incompressible ids, so a changed branch cost
about its canonical size on every Commit. One edit rewrites the root branch
and one child branch.

## New design

**Record.** The ordinary lane, read under the `InodeBranch` role:
- `0 | page` is the whole form, unchanged.
- `1 | base id | output length | count | program` is the pooled leaves'
  COPY/INSERT grammar (`pool::delta`), applied to the canonical predecessor
  page.
- `encoding/pool/branch.rs` parses both. `delta::record::stored_base` names
  the base for Ordinary+`InodeBranch`, so the read prefetch and the writer's
  depth walk follow branch edges without new code.

**Write** (`encoding/delta/branch.rs`, called from `select()`'s tree-role branch):
- The candidate is the first advisory predecessor.
- It is refused, and the branch stored whole, when:
  - it is absent or of another role;
  - its chain is at the metadata depth cap (8);
  - its chain plus this branch exceeds the metadata chain budgets (64 KiB
    canonical, 139 KiB record bytes).
- One trial runs `pool::delta::build` under the 128 KiB match budget. The
  program is kept only when it is shorter than the whole record.
- The base joins the member's references through the existing `record.base`
  path, so publication closure and reachability see it.
- `save/select.rs`, `save/state.rs` and `encoding/codec.rs` are unchanged.
- Counts are in `DeltaCounters::branch`, apart from the payload counts.

**Read** (`Resolver::resolve_charged` → `PoolReader::branch_canonical_with_caches`):
- One chain per requested branch, walked through the caller's pack and
  decoded-group caches (on a Workspace reader, the #354 A1 `KeptReads`).
- Checks: ceiling, cycle, depth cap, role and chronology. Record bytes are
  charged against the metadata budgets.
- Programs are applied base first, and every element is authenticated
  against its own locator.

**Per-call memo: placement confirmed, no new cache.** The decoded canonical
branch is already memoized above storage:
- `compare::memo::Memo`: list, compare and merge (F-012, F-026);
- `inode::lookup_many`: one demand per level per batch;
- the Workspace `CanonicalCache` (8 MiB) across FUSE calls.

New counters in `PoolReadCounters`: `branch_requests` (chains reconstructed),
`branch_chain_edges`, `branch_delta_applies`.

Out of scope, as the spec says: directory pages, roots, extents and attribute
trees stay whole.

## Proof

`tests/inode_branch_deltas.rs`. A 50,000-inode table is built by the real C1
writer (`apply_inode_values`): two branch levels, 999 leaves and 16 branch
pages. Each one-row change rewrites the root branch and one child branch.

| Test | Asserts |
| --- | --- |
| chains grow to the cap, reset whole, read back | Over 20 one-row Saves, branch depths 1..8 each appear at least twice. `depth_capped` ≥ 2, nothing deeper than 8, `work_exceeded` 0. All 21 tables read back value for value from fresh readers. Branch saves leave the payload counts (`prepared_full`, `trials`, `prefix_selected`) at 0 |
| old whole-branch Store, then delta branches | Store written at metadata depth 0 (whole branches only, the pre-change form) for the initial table and 5 Saves. Reopened at depth 8: reads identically before and after 5 more Saves that store delta branches |
| lookup cost bound (counter) | Root branch at depth 7: a lookup reconstructs **exactly 2 chains** (`branch_requests` = branch levels), with 1–16 edges. `lookup_many` of 1,352 serials: **16 chains for 16 branch pages** (each page once), 14 edges and 14 applies; 999 leaves |
| refused base | An absent predecessor stores both branches whole (`full_branches` 2) and they read back |

Checks:
- Host, `+1.85.1`, each command ≤ 120 s: `layerfs-storage`'s 19 test binaries
  pass, and clippy `--all-targets -D warnings` is clean.
- `layerfs-store-service`'s 24 binaries pass, including the diff, ancestry,
  list, merge and compare oracles.
- `layerfs-workspace`: 28 binaries pass.
- `layerfs-persistence`'s test `space_reclamation` did not compile at
  `7ac7343c7` (`NewEntry.metadata_root`, item 2's rename), predating item 3;
  repaired in `f3396ae0d` (below).
- Not run: the Linux daemon mount tests.

## Synthetic P3 check (spec §5, required)

Harness: `~/lfs-history/runs/issue360-i3/i3.mjs` (modelled on #359
`cost.mjs`), `role_bytes.py` and `table.py`. One command per phase and per
case. Each run gets a fresh LayerFS home and a fresh Sandbox (a fresh daemon)
in a runner container. Disposable/WAL/OFF, 4 KiB pages,
`LAYERFS_CONSTRUCTION_WORKERS=1`.

Base: the newest snapshot, the #359 prepared golden `layerfs-issue359-prep`
(dev352-p3p range 18). It was cloned per arm to `layerfs-issue360-i3-p3-<arm>`.

1. **gen** (`s001` old, `s003` new): fork `i3` from the golden's `nonm` branch
   (the head without `node_modules`). In one one-shot Workspace, generate a
   `node_modules/.pnpm`-shaped tree:
   - 400 packages × 100 inodes;
   - `.i3/d10000`, a folder of 10,000 files.

   That is 53,611 entries; Commit.
   - old: 16.5 s, 2,757,571 B stored;
   - new: 16.4 s, 2,759,446 B stored.
2. **writes** (`s005`, `s007`): 100 `fs.write` Commits of one existing file
   each, spread over 400 packages. All 100 `Committed` in both arms.

Bytes per Commit by role, the mean over the 100 Commits. Attribution: the
packs the 100 Commits added, each ordinary group's encoded bytes split across
its records by decoded length, header and directory included.

| Role | objects / Commit | stored (pack share) old → new | record bytes old → new | canonical |
| --- | ---: | ---: | ---: | ---: |
| **inode branch** | 2 | **2,894 → 338 B (−88%)** | 3,290 → 321 | 3,288 |
| inode leaf | 1 | 63 → 80 | 72 → 72 | 4,094 |
| filesystem root | 1 | 114 → 145 | 130 → 130 | 129 |
| whole file | 1 | 67 → 67 | – | 53 |
| **all packs** | | **3,138 → 630 B (−80%)** | | |

| Over the 100 Commits | Old | New | Change |
| --- | ---: | ---: | ---: |
| Pack bytes | 313,825 | 62,985 | −80% |
| Store file growth (WAL excluded) | 1,540,096 | 1,232,896 | **−20%** (15.4 → 12.3 KB per Commit) |
| Traced `newMetadata` per Commit | 3,071 | 563 | −82% |
| InodeBranch records whole / delta | 200 / 0 | 13 / 187 | |

The spec expected 3–5 KB → 0.1–0.3 KB. Measured: 2.9 → 0.34 KB, against
3.3 KB canonical for the two branches. This table's child branches are about
1.6 KB each, smaller than the spec's 5 KB worst case. The rest of the Store
growth (index rows, commit rows, page waste) is unchanged by item 3.

Payload deltas are untouched. The 100 writes have identical payload and leaf
counts in both arms:
- payload: `prepared_full` 100, `trials` 100, `prefix_selected` 0,
  `full_losses` 100;
- leaves: `delta_leaves` 100 of 100.

The gen Commit's counts are identical too: 48,399 prepared, 38,046 trials,
1,000 of 1,001 leaves whole. Branch programs do not compete with content
deltas, and the whole-file delta hit rate cannot move.

## Performance, old vs new

The same input per arm, each arm's own P3 Store (the new arm's branches are
chains up to depth 8 on the golden's whole branches).

- `cold`: the first run in a fresh one-shot Workspace on a fresh daemon.
- `steady`: the same command again in that Workspace.
- Counters: the daemon's cumulative records at a traced status before and
  after the arm (the #359 method).
- One sample per case and arm.

Interference, every sample: host 1-min load 15–25. 23–25 other containers
ran (other lanes, `layerfs-issue359-impl-*` tests, and the frozen F-036
`layerfs-issue352-scale-s4-a/-b`, untouched).

**Cache state.** The first pass (label `measured`, `s009`–`s051`) left the
cloned Store file's page-cache state uncontrolled. Its `first-stat` cold row
reads 3.47 → 17.55 ms on equal work: 57 → 62 statements, the same pack bytes.
Its SQLite statement time is 2.5 → 18.5 ms and blob time 0.07 → 3.4 ms for
the same bytes: page-cache misses on the Store file, not decoding. That pass
is **ineligible for a timing verdict** (AGENTS §1); its counters stand and
equal the second pass's.

The second pass (label `filewarm`, `s053`–`s095`) enforces one state for both
arms: the cloned Store file is read once into the VM page cache right before
the case, and the daemon and its caches start cold. The table below is that
pass.

| Case | Step | ms old → new | × | statements | VM steps | pack selections | pack bytes | group decodes | lookup / getattr |
| --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| first-stat | cold | 3.95 → 3.38 | 0.86 | 57 → 62 | 6,798 → 6,885 | 32 → 34 | 273,996 → 273,526 | 30 → 32 | 1/1 |
| first-stat | steady | 1.15 → 1.18 | 1.03 | 0 → 0 | | | | | 0/0 |
| first-stat-deep (8-level path) | cold | 40.10 → 40.06 | 1.00 | 512 → 570 | 145,548 → 147,743 | 78 → 117 | 620,732 → 521,941 | 99 → 96 | 7/1 |
| first-stat-deep | steady | 1.05 → 1.08 | 1.04 | 0 → 0 | | | | | 0/0 |
| ls -l, 10k entries | cold | 1,187 → 1,211 | 1.02 | 401 → 406 | 266,213 → 266,300 | 28 → 30 | 344,246 → 343,776 | 33 → 35 | 10,002/1 |
| ls -l, 10k entries | steady | 82.6 → 81.2 | 0.98 | 0 → 0 | | | | | 0/1 |
| find | cold | 1,401 → 1,424 | 1.02 | 7,936 → 7,955 | 505,568 → 507,295 | 1,083 → 1,083 | 3,028,542 → 2,783,876 | 787 → 757 | 2,330/11 |
| find | steady | 1,128 → 988 | 0.88 | 0 → 0 | | | | | 0/2,331 |
| du -s | cold | 8,790 → 7,447 | 0.85 | 24,130 → 24,181 | 1,855,731 → 1,858,157 | 4,004 → 4,001 | 8,190,277 → 7,923,363 | 2,432 → 2,397 | 53,610/11 |
| du -s | steady | 1,450 → 1,341 | 0.92 | 7,695 → 7,759 | 460,545 → 461,898 | 876 → 875 | 2,143,662 → 1,897,371 | 621 → 579 | 0/2,331 |
| small Commit | edit | 3.44 → 3.45 | 1.00 | 57 → 62 | | 32 → 34 | | | |
| small Commit | **commit** | **17.46 → 17.49** | **1.00** | 171 → 184 | 131,788 → 131,998 | | stored 80,317 → 62,060 | | |
| merge | merge | 17.16 → 17.87 | 1.04 | 897 → 918 | 148,900 → 149,251 | | | | |
| SDK `fs.stat` deep | cold | 3.49 → 3.28 | 0.94 | 50 → 66 | 2,786 → 3,059 | | | | |
| SDK `fs.stat` deep | steady | 7.87 → 1.72 | 0.22 | 27 → 34 | | | | | |
| SDK `fs.read` | cold | 3.48 → 4.36 | **1.25** | 51 → 67 | 2,798 → 3,071 | | | | |
| SDK `fs.read` | steady | 1.72 → 1.80 | 1.04 | 28 → 35 | | | | | |
| SDK `fs.list` 1,000 of 10k | cold | 5.27 → 4.14 | 0.79 | 51 → 59 | | | | | |
| SDK `fs.list` 1,000 of 10k | steady | 2.79 → 3.21 | 1.15 | 31 → 34 | | | | | |
| SDK `diff_commits` (100 Commits) | cold | 85.3 → 83.4 | 0.98 | 2,161 → 2,528 | 99,932 → 105,396 | | | | |
| SDK `diff_commits` | steady | 36.7 → 42.2 | 1.15 | 595 → 733 | | | | | |

**`fs.write`**, the 100 writes (`s005`, `s007`; cache uncontrolled, the old
arm ran first):
- p50 9.06 → 5.94 ms, p95 16.52 → 9.79 ms;
- statements p50 89 → 119 and p95 91 → 141. The writer now rebuilds each base
  branch chain before its trial.

**Outputs.** Every case's output digest is identical across arms. The one
exception is `first-stat-deep`, whose `stat` shows each arm's own generated
mtime. The **decoded views** are proved by `tree-digest` (`s097`, `s099`):
- the sorted type, mode, size and path of all 53,611 entries, and the content
  hash of every file;
- old and new are identical: `de6945501c3d…` and `9e4b413f3ce7…`.

The new arm's Store is the mixed Store: old whole branches from the golden,
with delta branches on top.

## Integration and the extra checks (liaison, 2026-10-19)

**Merge.** `origin/claude/issue352-correctness-644bbc` (`5ae2b7034`) was
merged before item 3 was built further (`01dc7eefa`). Conflicts:
- `read/objects.rs`: HEAD's `ReadState` kept, with F-043's `IDLE_DECODE`,
  `Decoder` and `Decoder::new()` beside it; F-043's region list unchanged.
- `read/provider.rs` (needed to build, not a textual conflict): `Reader` and
  `ReadCache` hold a `Decoder`, as INTEGRATION_PLAN step 4 lays out.
- `BUGS.md`: the F-043 continuation, then F-044 to F-047.

**F-036.** The branch reconstruct finds every base a stored record names with
`Source::base_location`, as `reconstruct_leaf` does: never a stale per-wave
"absent" (`a76b4ac33`). F-036's `concurrent_winner_chain` passes, as do
`encode_region_reuse` and `save_encoder_reuse` and the whole
`layerfs-storage` suite (22 binaries).

**1. Reference closure.** A delta branch names its base by id. The base
stays readable as long as the branch is, for three reasons:
- `pack` and `pack_unit` rows cannot be deleted or updated (abort
  triggers in `objects.sql` and `objects_units.sql`);
- reclamation (`reclaim_space`) only runs `incremental_vacuum` over free
  pages;
- no product statement deletes an `object_location` row.

`inode_branch_delta_custody.rs` shows it on a real Disposable Store: after
six branch-delta Saves on 20,000 inodes, DELETE and UPDATE of the first
base's pack and pack-unit rows abort. Reclamation then runs to zero pages,
and all seven tables read back value for value.

**2. Chronology.** A base is a branch located below the Save's ceiling, so it
was published before the Save that names it. A branch inside the same Save
is pending, not located, and is refused (stored whole). The same test runs
two Saves on two handles, both begun before either publishes, each choosing
the same published root branch as its base:
- with different changes, both store delta branches;
- with an identical change, both finish (first wins).

All four tables read back, and each dependent root is in a later pack than
its base.

**3. One chain per level, in merge and LOOKUP.** The only `InodeBranch`
decode is `Resolver::resolve_charged` → `branch_canonical_with_caches`,
shared by `Reader`, `ReadCache`/`KeptReads` (the daemon's base reader, which
FUSE LOOKUP and GETATTR use) and the Save's own reads (where M1 runs inside a
Commit). Each demanded branch page reconstructs one chain of at most 8 edges.
- Lookup: the counter test above shows a lookup reconstructs 2 chains for
  2 levels.
- Merge: `inode_branch_merge_reads.rs` runs `merge_roots` over a Store reader
  on a 20,000-file tree whose ours and theirs root branches are deltas.
  42 branch pages are demanded and 42 chains reconstructed, with 16 edges.
  The merged tree holds both changes.

Gap: the Save's internal read counters (`save/state.rs`) and the daemon
telemetry do not carry the branch counters, so the in-Commit M1 and live
LOOKUP numbers rest on the shared resolver, not on their own counters.

**Decoded-value comparison.** Item 3 changes only the stored form of a
branch page. The canonical page and its id are byte-identical to before, so
every identity check (UpToDate, no-change, same root) is unaffected. Merge
and no-change checks compare decoded `InodeValue`s (`same_value`,
`same_inode`), never stored record bytes.

**M1 equivalence with a delta-form side.** Item 3 was cherry-picked onto
`issue353-m1-360-equiv` (`58329939b`) as `32db594f2`. `merge_mixed_forms`
gained `changes_merge_over_delta_form_inode_branches` (`383c5daa7`): the
fixture's table is one leaf, so the case widens it to 400 files under `/w`
and changes both sides in their own Commits. Reading every inode of each
side applies at least one branch delta (the premise). Both merge
orientations equal the decoded expectation, with no conflict. Run once:
both cases pass (0.30 s). The first attempt failed in the test's own setup
(`/w` not yet made, `NoSuchPath`) before any merge ran.

**Found while writing the merge test (not item 3; whole branches behave the
same).** On this branch, `merge::decide::same` compares only kind and
content root. A metadata-only change on ours (an mtime or a chmod alone)
against an unrelated change on theirs is dropped from the merge. The base
behaves identically at metadata depth 0. The M1 merge by serial on
`issue353-m1-360-equiv` merges metadata by value instead. Reported to the
liaison; not fixed here.

**Inherited persistence tests** (`f3396ae0d`; none from item 3):
- `space_reclamation` and `immutable_reads_under_reclamation` did not
  compile: item 2's rename of `NewEntry.metadata_root` to
  `metadata: PortableMetadata`. Adapted mechanically.
- `acquisition_reads` failed with Bounds: its fixture wrote symlinks with
  mode 0o644, outside the portable grammar. Fixture fixed; no assertion
  changed.
- `acquisition_batching` failed with Bounds: a stale premise, because item 2
  refuses the bad value at write. The test was renamed and now checks that
  the write is refused and leaves no row, and that the read decode still
  fails for a row changed out of band (both of the old cases).

No test was deleted. All persistence binaries pass.

**Not rerun after the merge.** The synthetic P3 and timing tables above are
from `7ac7343c7` (pre-merge daemon `3dad6f79`). The only item-3 change since
is the base lookup (`base_location` instead of `location`). It behaves
differently only when a concurrent winner publishes a base, which never
happens in the single-writer P3 replay. F-036 and F-043 are other lanes'
changes, measured in their own records.

## Verdict

- **Lookup cost bound: holds** (counter test above). A lookup reconstructs
  one chain per branch level, and a batch reconstructs each branch page once.
  The per-chain cost is capped by depth 8 and the metadata budgets.
- **AGENTS §3.9: passes.** Storage:
  - InodeBranch per Commit −88%;
  - pack bytes per Commit −80%;
  - Store growth −20% on the P3 shape.

  Speed, with the cache state enforced: FUSE operations, Commit and merge
  run 0.85–1.04×. SDK calls (sub-5 ms) run 0.22–1.25×.

  Work grows instead of time:
  - +5 to +16 statements on single cold reads;
  - +58 statements and +39 pack selections on an 8-level path;
  - `fs.write` +30 statements p50.

  That is nowhere near a ~50% speed loss for ~5% storage. **Accepted under
  §3.9.**
- **Spec §7, the lead's item-3 condition (read/lookup p95 within 1.2×,
  Commit p50 not higher): partly established.**
  - Commit is 1.00× (17.46 → 17.49 ms).
  - One sample per case gives no p95 for the read cases.
  - One single sample exceeds 1.2×: SDK `fs.read` cold, 1.25× (+0.9 ms,
    51 → 67 statements).
  - The lead decides whether the counter evidence suffices or a p95 run is
    wanted.
- **Spec §7 storage gate "≥ 7% at r011": NOT_RUN.** It needs ranges 1–11
  replayed on the new daemon (the same gap item 2 recorded). The synthetic P3
  drop is measured above.

## Not run, and gaps

- r011-equivalent whole-Store saving (above).
- A played range checkpoint on the new daemon. Only `compat.mjs` range 14 on
  the old Store ran.
- The §6 deduplication, compression-per-role and localized-edit probes were
  not rerun. Item 3 touches only the `InodeBranch` record. The payload delta
  counts above are identical.
- Linux daemon mount tests (`layerfs-daemon` mounted_*).
- Branch counters reach `Reader::pooled_read_counters`, but not the daemon's
  reader telemetry or the Save's own read counters. That needs `read/provider.rs` or the store-service
  telemetry, which belong to other lanes. The live table therefore shows
  statements, pack selections and group decodes, and the per-level bound
  rests on the counter test.
- `cost.mjs` cases were not run on the #359 golden directly. Its branches are
  all whole, so it cannot show the chain read cost. The harness reuses its
  case shapes and counter method on each arm's own P3 Store.
- Harness identity changed during the campaign, and each sample's manifest
  records its sha256:
  - `measured`: v1;
  - `filewarm`: v2 (the warm step added);
  - `tree-digest`: v3 (the case added).

  No sample was repeated within a label.

## Resources

Volumes:
- kept as this record's inputs: `layerfs-issue360-i3-p3-old`,
  `layerfs-issue360-i3-p3-new`;
- build caches, kept: `layerfs-issue360-i3-cargo-target`,
  `layerfs-issue360-i3-cargo-home`;
- removed: the compat fork `layerfs-issue360-i3-i3-compat`. Every case
  volume was removed after its sample.

Receipts: `~/lfs-history/runs/issue360-i3/` (`ledger.jsonl`, `samples/`,
`roles-*.json`, `table-*.md`, `compat-r14-new.txt`).
