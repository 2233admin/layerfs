# #352 integration plan onto `dsh-history-replay` (dry run, read-only)

> **Status:** proposal by the correctness lane, 2026-10-18. Nothing was merged.
> Merging into `dsh-history-replay` is the owner's decision. The dry run used
> `git merge-tree --write-tree` and unreferenced `commit-tree` chains only. A
> read-only subagent did the per-branch analysis below. The lane added the
> `issue352-uptodate` step and its checks, in "Addendum: `issue352-uptodate`"
> at the top.

## Addendum: re-run after the decode commit (correctness lane, 2026-10-18)

The heads at this re-run:

| Branch | Head |
| --- | --- |
| `dsh-history-replay` | `b885c55d4` |
| correctness | `2ee725aa0`; decode commit `f671d8ce7` |
| #353 | `d37821838` |
| `issue352-uptodate` | `7238e4551` |
| `issue359-impl` | `2d84fe1bb`, which contains `3be974923` (§4.8 (A)) and `38c72020e` (record corrections) |
| cost-model | `331f2c173` |

The dry run used merge-tree only.

**Order (b′), proposed:** correctness → #353 → `issue352-uptodate` →
`issue359-impl` → `issue359-cost-model`.

| Step | Branch | Conflicts | Tree | Combined LOC |
| --- | --- | --- | --- | --- |
| 1 | correctness | 0 | `a6db2ecdfe4c` | 97,371 (+152) |
| 2 | #353 | 0 | `c72258b5a880` | 100,564 (+3,193) |
| 3 | uptodate | 0 | `33fc5b8f46c4` | 100,597 (+33) |
| 4 | 359-impl | **2: `layerfs-storage/src/read/objects.rs` (code) and `BUGS.md` (docs)** | `b7172071d071` (with markers) | 101,867 (+1,270), counted with conflict markers; recount after resolving |
| 5 | cost-model | 0 | `d33933ddd5ff` | 101,867 (0) |

Final combined LOC: **97,219 → about 101,867 (+4,648)**, to be recounted on
the resolved tree. The counter is `tools/production_loc.py --root` on
`git archive` extracts of `core/crates`, `sdk/js` and `dsh/packages`.

### Resolving step 4

**`read/objects.rs`, F-043 decode reuse against #354 A1.**
- What conflicts: A1 (inside 359-impl) moved the decode workspace out of
  `ReadState`. Callers now pass `&mut DecompressionWorkspace` to
  `ReadState::read`, and `ReadState::new()` is infallible. Correctness made
  `ReadState` own a `Decoder`, which reuses idle decode regions.
- Resolution:
  1. Take 359-impl's `ReadState`.
  2. Keep correctness's `IDLE_DECODE` and `Decoder` in `objects.rs`, made
     `pub(super)`.
  3. At the three `DecompressionWorkspace::new()?` sites in 359-impl's
     `read/provider.rs` (`Reader::new`, `ReadCache::new`, and `read_kept`'s
     per-demand workspace), write `Decoder::new()?`. Deref coercion passes it
     where `&mut DecompressionWorkspace` is taken.
- **`read/provider.rs` is #354's held file.** The three-line change needs the
  liaison's OK at integration.
- Without it, reads do not reuse decode regions; Saves still do, through
  `save/state.rs`, which auto-merges. The probe figure of 286 / 238 MB
  assumes reads reuse too.
- Then run `layerfs-storage` whole, including `encode_region_reuse` and
  `save_encoder_reuse` (Linux).

**`BUGS.md`.** Both sides append after F-043. Keep both: the F-043 paragraph
first, then F-044 onward.

**Rig helpers (agreed with the RCA agent).** After step 4,
`daemon tests/support/mounted_commit.rs` has both:
- correctness's `Rig::history`, which follows continuations to `HISTORY`
  records;
- 359-impl's `Rig::newest(count)`, which is the same page walk truncated to
  `count` ids.

They duplicate each other. Keep `history` and drop `newest`. Its two call
sites become `rig.history().records.iter().take(n).map(|r| r.id)`:
- `mounted_commit.rs` r5_8: `n` = 5;
- `r5_5_install_survival.rs` steps: `n` = `positions.len()`.

Both files auto-merge, so this is a follow-up edit in the integration
commit, not a conflict. Then run `mounted_commit`, `r5_5_install_survival`
and `mounted_install` (Linux).

### Where the code meets

- `encoding/codec.rs` auto-merges:
  - F-A4's `alloc_zeroed` `workspace()`;
  - the encode `in_region` / `into_region` hook, with encode regions reused
    unzeroed (shown content-independent);
  - the decode hook, which zeroes a reused region on hand-out (`fill(0)`),
    because zstd's static decoder init does not clear its own struct.

  So F-A4's "the codec sees zeroed memory" holds for every decode region, and
  for encode regions on first allocation.
- `save/state.rs` auto-merges.
- Neither `issue359-impl` nor cost-model touches any c04 file.
- `support/mounted_commit.rs` (`Rig::history` against `Rig::up_to_date`)
  auto-merges.

**E10 (new): #359 `4db0ceb9e` against c04.** That commit keeps an mtime-only
change live until unmount, adding +47 LOC.
- If the live row it keeps sits in the active generation, the dirty counters
  stay non-zero. Every later Commit of that Workspace then takes the full path
  instead of the shortcut.
- That costs speed, not correctness: the full path decides exactly as before.
- After step 4, check that a Workspace with only a kept mtime-only row still
  answers UpToDate through the full path. `mounted_commit` r5_2 and
  `r5_5_install_survival` cover this.

**Tests after step 3** (Linux, pinned image), on the c04 branch alone:
- pass:
  - `layerfs-daemon`: `store_commit` 10/10, `mount_control` 9/9,
    `mounted_commit_failures` 4/4, `forced_producers` 4/4,
    `kernel_application` 1/1, `r5_1_actual_daemon_commit` 1/1,
    `mounted_cycles` 4/4;
  - `concurrent_commits` 3/3 (F-008).
- `mounted_commit` and `r5_5_install_survival` fail only at the
  `rig.history()` page assertions, which c02 (step 1) fixes.
- **`r5_10_producer_profile` fails at its line 385** (`storage.policy` 0,
  expected 1). This is **pre-existing at #353's head `d37821838`**: the same
  build fails identically with the c04 block removed. Owner of the fix: #353,
  or whoever owns the producer-handle receipt (#320). It should be diagnosed
  before the merge.

**E9. c04 against the rest.**
- **#359 F-B4 negative entries.** A shortcut UpToDate installs nothing, so no
  kernel invalidation is owed.
- **#360's mtime-only rule.** An mtime-only edit writes an inode row, so the
  full path runs.
- **#355 M1.** A moved head always takes the merge path, which is tested.
- **Readers of `CommitSuccess.capture`.** They are listed in fix record c04.
  No product code unwraps it.

---

# Subagent dry-run report (orders a, a2, b, c, d)

Date 2026-10-18. Nothing was merged, committed, checked out or pushed. The only
writes were loose objects from `git merge-tree --write-tree` and unreferenced
`git commit-tree` chain commits, plus `git archive` extracts under
`/private/tmp/claude-501/integ/` (deleted afterwards). No cargo, tests or docker.

## Summary

- **Every branch merges cleanly**, alone or in any of the four orders tried.
  There are 0 textual conflicts at every step. All complete orders give the
  same final tree, `d3cee831fc3e` (correctness head `c3b5f4d86`).
- **`issue359-impl` is a superset** of `claude/issue354-fs-read-calls-58a66a`
  (`1d5dfafae` is its ancestor), `issue360-storage` (`d36a14159` is its
  ancestor) and `issue359-cost-model` up to `7fd5db242`. The cost-model head
  `331f2c173` adds one docs commit, with production LOC delta 0. It also
  re-applies the #356 F-032 commits from `dsh-352-f032-rm-rf` (`ee7e0fc51`,
  `a9a9b23ea`, `7bde585ac`). Merging #354, #360 and cost-model separately
  before `issue359-impl` is therefore redundant, though harmless.
- **Proposed order (b):** correctness → #353 → `issue359-impl` →
  `issue359-cost-model`. If the owner does not want the #359 implementation
  commits to land yet, use order (a2): correctness → #353 → #354 → #360 →
  cost-model, then `issue359-impl` later. Both give the same final tree.
- **Do not merge `dsh-352-f032-rm-rf`.** Its #356 commits are already in
  `issue359-impl` as re-applied versions. Merging it on top gives 5 conflicts
  (see order c). What it has left is the parked READDIRPLUS WIP and one docs
  commit (`bf1b45732`).
- **The ruled overlaps** are in the "Ruled overlaps" table below. All three
  rulings apply, and none conflicts textually.
- **The new textual overlap** is `layerfs-storage/src/encoding/codec.rs`.
  #359 F-A4 (`f7cd6311b`, lazy zeroed arena) and correctness F-043
  (`2f0d4378e`, an idle-arena reuse list) both change it. The merge is clean
  and the result reads coherently. The semantics are listed in E4 below.
- **Production LOC, combined scope (core + sdk + dsh):** 97,219 → 101,673
  (delta +4,454). Core 88,537 → 92,986 (+4,449), sdk 2,635 → 2,640 (+5), dsh
  6,047 (0). The reference is absent (retired R9c; last counted 65,417 at
  tree 498dd1917812).
- **Risks a compile or test will surface.** None of these is a textual
  conflict.
  1. M1's strict `same_value` sites against #360's mixed metadata forms (E1).
  2. The mounted_commit r5_8 and r5_5 tests: correctness fixes their
     pagination cause, but #359-impl records a second cause in #360's
     mtime-only rule (E5).
  3. #353's breaking History/SDK API: the dsh simulator still emits the old
     layer shape (E6).
  4. The codec arena interplay (E4).

## Branch heads

These are the refs as resolved at the end of the run. Two refs moved during the
run, and the whole analysis was redone on the final heads.

| Branch | Head | Merge-base with target | Ahead / behind target |
| --- | --- | --- | --- |
| `dsh-history-replay` (target) | `b885c55d4` | — | — |
| `claude/issue353-lineage-cap-ec7c49` | `d37821838` | `ecf3255a4` | 16 / 52 |
| `claude/issue354-fs-read-calls-58a66a` | `1d5dfafae` | `2943275c8` | 10 / 44 |
| `issue360-storage` | `d36a14159` | `7a11f3c3e` | 6 / 3 |
| `issue359-cost-model` | `331f2c173` | `7a11f3c3e` | 4 / 3 |
| `issue359-impl` | `f7cd6311b` (was `8ef8dfbfa` at start) | `7a11f3c3e` | 36 / 3 |
| `claude/issue352-correctness-644bbc` | `c3b5f4d86` (was `bb19d9d7d` at start) | `b885c55d4` | 4 / 0 |
| `dsh-352-f032-rm-rf` (not proposed) | `bf1b45732` | `1c1a8ec33` | 5 / 41 |

The correctness lane has 4 commits:

- `fad2ca3f3`: F-036
- `bb19d9d7d`: r5_8 helper
- `2f0d4378e`: F-043 zstd arena reuse
- `c3b5f4d86`: VERIFICATION docs

The new `issue359-impl` commit is `f7cd6311b`, #359 F-A4 (arenas from one
`alloc_zeroed`).

Target drift since #353's base (`ecf3255a4..b885c55d4`, 52 commits) touches
only `layerfs-storage/src/pack/{assemble,layout,mod}.rs` and `dsh/tools/history/*`
among production and tool sources. None of these is a #353 file.

## Conflict list per file (per step, per order)

"Auto-merged" means both sides changed the file and Git merged it without a
conflict. Those files need a read during review. "Conflicts" means real
conflict markers.

### Each branch alone onto `dsh-history-replay`

| Branch | Conflicts | Result tree |
| --- | --- | --- |
| #353 `d37821838` | 0 | `233d7073ef05` |
| #354 `1d5dfafae` | 0 | `b5bfb4548959` |
| `issue360-storage` | 0 | `550e8bfb012d` |
| `issue359-cost-model` | 0 | `b3860774053c` |
| `issue359-impl` `f7cd6311b` | 0 | `a401c86f900f` |
| correctness (`2f0d4378e`; `c3b5f4d86` is docs-only on top) | 0 | `f4db9c2b9409` |
| `dsh-352-f032-rm-rf` | 0 | `6d19fccdca84` |

### Order (a): #353 → #354 → #360 → cost-model → 359-impl → correctness

| Step | Branch | Conflicts | Auto-merged files (both sides changed) | Tree |
| --- | --- | --- | --- | --- |
| 1 | #353 | 0 | — | `233d7073ef05` |
| 2 | #354 | 0 | `layerfs-persistence/src/storage/provider.rs`; `docs/issues/352/fixes/015-pre-f035-fs-read-calls.md` | `6e82541b9670` |
| 3 | #360 | 0 | `layerfs-persistence/tests/sqlite_inode_values.rs`; `layerfs-store-service/src/sdk/compare.rs` | `52cc3ad31049` |
| 4 | cost-model | 0 | `.agents/skills/layerfs-sdk-observe/references/tracing.md` | `5c0bf64e2c22` |
| 5 | 359-impl | 0 | — (it already contains steps 2–4) | `522316a515dc` |
| 6 | correctness | 0 | `layerfs-storage/src/encoding/codec.rs` | `d3cee831fc3e` |

Hunks in the auto-merged files:

- `storage/provider.rs`. #353 adds an inherent `StorageProvider::merge_scratch()`
  near the top of `impl StorageProvider`. #354 changes the five immutable read
  methods of `impl PackPersistence` from `session.run(false, …)` to
  `session.read_immutable(…)` and extends the module doc. The hunks are
  disjoint.
- `015-pre-f035-fs-read-calls.md`. Both branches append to the fix record.
- `sqlite_inode_values.rs`. #354 adds BEGIN-free read tests. #360 adds
  inline-form round trips. The hunks are disjoint.
- `sdk/compare.rs`. #360 replaces the strict `metadata_root` comparisons with
  `same_metadata` and `same_inode` in `change()` and `emit()`. #354 changes one
  line in `diff_files`: `existing(&reader, …)` → `existing(reader.as_ref(), …)`.
- `tracing.md`. #353 and cost-model each add a section.
- `encoding/codec.rs`. F-A4 rewrites `fn workspace()` (lines ~168–190) to use
  `alloc_zeroed`. F-043 adds the `Arena`, `IDLE_ENCODE` and `IDLE_DECODE`,
  `take_idle` and `keep_idle` items after `workspace_bytes`, a `take_idle` in
  `CompressionWorkspace::new` and `DecompressionWorkspace::context`, and
  `keep_idle` in both `Drop` impls. The hunks are disjoint. The merged file
  has F-A4's `workspace()` and F-043's reuse list.

### Order (b), proposed: correctness → #353 → 359-impl → cost-model

| Step | Branch | Conflicts | Auto-merged files | Tree |
| --- | --- | --- | --- | --- |
| 1 | correctness `c3b5f4d86` | 0 | — | `5668ce5b722d` |
| 2 | #353 | 0 | — | `8bfae661a35b` |
| 3 | 359-impl `f7cd6311b` | 0 | `tracing.md`; `storage/provider.rs`; `encoding/codec.rs` | `71b7f42763f9` |
| 4 | cost-model `331f2c173` | 0 | — (docs commit only) | `d3cee831fc3e` |

### Order (a2): correctness → #353 → #354 → #360 → cost-model → 359-impl

Use this order when 359-impl's own commits should wait.

| Step | Branch | Conflicts | Auto-merged files |
| --- | --- | --- | --- |
| 1 | correctness | 0 | — |
| 2 | #353 | 0 | — |
| 3 | #354 | 0 | `provider.rs`, `015-…md` |
| 4 | #360 | 0 | `sqlite_inode_values.rs`, `sdk/compare.rs` |
| 5 | cost-model | 0 | `tracing.md` |
| 6 | 359-impl | 0 | `encoding/codec.rs` |

The result after step 6 is the same final tree, `d3cee831fc3e`. That holds for
correctness at `c3b5f4d86`. At `2f0d4378e` it was `7adc646e2295`, and the LOC
is identical.

### Order (d): 359-impl → #353 → cost-model → correctness

0 conflicts at every step. Step 2 auto-merges `tracing.md` and `provider.rs`.
The final tree is the same.

### Order (c): order (b), then `dsh-352-f032-rm-rf` (for information only)

Step 5 has **5 conflicts**:

| File | Kind | Cause |
| --- | --- | --- |
| `layerfs-fuse/src/phase.rs` | add/add | The #352 F-032 D0 file was added on both branches with different content. 359-impl carries the re-applied `7bde585ac` with later rustfmt. |
| `layerfs-fuse/src/request/accounting.rs` | content | The F-032 timing hunks overlap with cost-model's `lookup_missing` and `served_ns` counters, as already resolved in 359-impl. |
| `layerfs-fuse/src/request/callbacks.rs` | content | The F-032 D0 per-callback timing, re-applied, against the F-B4 changes. |
| `layerfs-fuse/src/request/mod.rs` | content | The F-032 commits re-applied, plus the rustfmt in `8ef8dfbfa`. |
| `layerfs-workspace/tests/sibling_lengths.rs` | add/add | The same test was added twice. |

`store/ports.rs`, `daemon/telemetry.rs` and `workspace/base/client.rs`
auto-merge. Conclusion: do not merge this branch. Take `bf1b45732`, the docs
commit, by cherry-pick if it is wanted.

## Ruled overlaps

| Overlap | Ruling | Where it stands | Applicable? |
| --- | --- | --- | --- |
| `layerfs-persistence/src/storage/provider.rs` | #353 first, #354 resolves | The hunks are disjoint: #353 adds `merge_scratch()` and #354 switches the reads to `read_immutable`. There is no conflict in any order. | Yes, and it is trivial. Keeping #353 before #354, as in orders a, a2 and b, respects it. No manual resolution is needed. |
| `layerfs-store-service/src/sdk/compare.rs` | #360 owns, #354 resolves its line | 359-impl already holds the resolution: #360's file, plus #354's `existing(reader.as_ref(), …)` at line 71. `git diff issue360-storage issue359-impl -- compare.rs` shows only that line. | Yes, and it is already applied in 359-impl. In order a or a2 it auto-merges to the same content. |
| `layerfs-store-service/src/store/ports.rs` | #354 first, #356 re-applies | #356 is carried by **`issue359-impl`** as `ee7e0fc51` "perf(#356 F-032): a lookup asks its siblings' lengths in one demand; 8 MiB daemon cache". The original is `2aed07094` on `dsh-352-f032-rm-rf`. In 359-impl, `049a2f894` (#354, `StorePorts::objects_with`) comes first, then `ee7e0fc51` (`FileLengths::file_lengths` batch). | Yes, and it is already applied in 359-impl in the ruled order. Merging `dsh-352-f032-rm-rf` would also re-apply it, auto-merging cleanly, but is not proposed. |

## Proposed order with reasons

**(b) correctness `c3b5f4d86` → #353 `d37821838` → `issue359-impl` `f7cd6311b` → `issue359-cost-model` `331f2c173`**

1. **Correctness goes first.** It branches from the target HEAD, is small
   (+48 production LOC) and touches nothing the others touch, except
   `codec.rs`, which merges cleanly. Landing it first fixes F-036 (stale
   negative base lookup), F-043 (arena retention) and the r5_8 helper before
   any later test run. Later failures then cannot be confused with these known
   bugs.
2. **#353/#355 goes second.** This follows the provider.rs ruling (#353
   first). It is the largest change (+3,193). It needs the #360 equivalence
   proof described in E1. Placing it before #360, in the same integration,
   makes the #360 merge the point where that proof is run.
3. **`issue359-impl` goes third.** It brings #354 (final A1), #360 item 2,
   cost-model counters, the #356 F-032 re-application and #359 F-B2, F-B4 and
   F-A4, with their conflicts already resolved by that branch. That covers
   compare.rs, ports.rs, the rustfmt passes and the test attributions in
   `8ef8dfbfa`. Merging it whole keeps those recorded resolutions. Merging
   #354 and #360 separately first only re-derives them.
4. **`issue359-cost-model` goes last.** Its only unmerged commit is
   `331f2c173`: docs, delta 0.

Use **(a2)** when only #354 and #360 are approved and the #359 implementation
commits are not. It still runs correctness and #353 first, and every step is
clean.

## LOC table

Counter: `tools/production_loc.py` copied from `dsh-history-replay:tools/production_loc.py`
and run as `python3 -I <copy> --root <git-archive extract> --json` for every
tree. This gives one counter version and one combined scope. The reference is
absent (retired R9c; last counted 65,417 at tree 498dd1917812).

| Branch | Merge-base (combined / core / sdk / dsh) | Head (combined / core / sdk / dsh) | Delta combined (core, sdk, dsh) | Claimed in commits | Recount vs claim |
| --- | --- | --- | --- | --- | --- |
| #353 `d37821838` | `ecf3255a4`: 97,211 / 88,529 / 2,635 / 6,047 | 100,404 / 91,717 / 2,640 / 6,047 | **+3,193** (+3,188, +5, 0) | Mixed; see below | See below |
| #354 `1d5dfafae` | `2943275c8`: 97,219 / 88,537 / 2,635 / 6,047 | 97,872 / 89,190 / 2,635 / 6,047 | **+653** (+653, 0, 0) | Head commit 97,828 → 97,872 | Matches |
| `issue360-storage` `d36a14159` | `7a11f3c3e`: 97,219 / 88,537 | 97,443 / 88,761 | **+224** (+224, 0, 0) | 97,443 at head | Matches |
| `issue359-cost-model` `331f2c173` | `7a11f3c3e`: 97,219 | 97,253 / 88,571 | **+34** (+34, 0, 0) | 97,219 → 97,253 (`41efeeae8`), then 0 | Matches |
| `issue359-impl` `f7cd6311b` | `7a11f3c3e`: 97,219 | 98,432 / 89,750 / 2,635 / 6,047 | **+1,213** (+1,213, 0, 0). Of this, +302 is its own and the rest is #354 +653, #360 +224 and cost +34. | `f7cd6311b` 98,431 → 98,432; `8ef8dfbfa` 98,433 → 98,431 | Matches. Spot-checked parent/child pairs `8ef8dfbfa`, `8d0a32f10`, `9a5bd4b5b`, `ee7e0fc51` and `9bb2be502` all match. |
| correctness `c3b5f4d86` | `b885c55d4`: 97,219 / 88,537 | 97,267 / 88,585 | **+48** (+48, 0, 0) | F-036 97,219 → 97,237; r5_8 0; F-043 97,237 → 97,267; docs 0 | Matches |

Final merged tree, order (a), (a2) or (b) (`d3cee831fc3e`): **101,673**. That
is core 92,986, sdk 2,640, dsh 6,047, and a delta of **+4,454** from the
target's 97,219 (core +4,449, sdk +5, dsh 0). Check: 3,193 + 1,213 + 48 =
4,454. The target drift since #353's base (+8 core) is already in 97,219.

Combined LOC after each step:

- Order (a): 97,219 → 100,412 (+3,193) → 101,065 (+653) → 101,289 (+224) →
  101,323 (+34) → 101,625 (+302) → 101,673 (+48).
- Order (b): 97,267 (+48) → 100,460 (+3,193) → 101,673 (+1,213) → 101,673 (0).

### #353: claimed vs recounted

The branch changed scope and counter mid-way:

- `c8d5b4819`–`418819bd4` use `tools/production_loc.py` with the combined
  scope.
- From `e4c74f7c3` on, the commits say "scope core production source". Their
  numbers come from the older `core/tools/production_loc.py`, a core-only
  counter, which I re-ran to reproduce them exactly.

| Commit | Claimed | Recount, combined (core) | Note |
| --- | --- | --- | --- |
| `c8d5b4819`, `c863c337c` | 97,211 → 97,211 | 97,211 (88,529) | Matches |
| `45ba293b4` | 97,211 → 97,600 (+389) | 97,600 (88,913), +389: core +384, sdk +5 | Matches |
| `0b6f5b35e`, `418819bd4` | 97,600 → 97,600 | 97,600 | Matches |
| `e4c74f7c3` | **88,102 → 88,851 (+749), "core"** | 98,373 (89,686), **+773** | Scope and counter switch. The legacy core counter gives 88,102 at the parent, against 88,913 for root-tool core. +24 is uncounted by the legacy counter, partly the new `merge_scratch.sql` (12 nonblank lines); the rest is not attributed. |
| `d472edef8` | +31 | +31 | Matches |
| `b7d79b001` | +90 | **+91** | Counter difference of 1 |
| `d2fda2593` | −1 | −1 | Matches |
| `16a19429a` | +1,420 (88,971 → 90,391) | +1,420 (91,227 core) | Delta matches; absolute numbers are on the legacy scale |
| `40a713349` | 0 | 0 | — |
| `5d37e1a3c` | +1 | +1 | — |
| `9f0756466` | +467 | +467 | — |
| `f277f54e8` | 0 | 0 | — |
| `05aca99a0` | +22 | +22 | — |
| `d37821838` | 90,881 → 90,881 | 100,404 (91,717) | The final claim is core-only on the legacy counter |

Claimed deltas summed across the two scales: +389 + 2,779 = +3,168. The
recount under one scope is **+3,193 combined** (core +3,188, sdk +5). The
legacy core counter gives +3,113 over the whole branch (87,768 → 90,881),
against root-tool core +3,188. The integrator's merge commit should report
+3,193 combined / +3,188 core with the root tool, not the branch's mixed
figures.

## Tests after each merge

Each test command needs a wall timeout of 120 s or less. Build first with
`--no-run`. Run Disposable only. fs-bench-pro is frozen and is not listed.
Tests marked "Linux" need the pinned FUSE image.

**After correctness:**

- `layerfs-storage`: `concurrent_winner_chain` (F-036);
  `save_encoder_reuse` (F-043, Linux RSS); the whole crate, since `codec.rs`
  is on every read and Save path.
- `layerfs-persistence`: `concurrent_first_installs` (Linux).
- `layerfs-daemon`, Linux: `mounted_commit`, `r5_5_install_survival`,
  `mounted_cycles` (r5_8 helper).

**After #353/#355:**

- `layerfs-persistence`: `lineage_backfill`, `merge_records`,
  `old_format_open`, `sqlite_publication`, `history_allocation`,
  `history_remediation`, `writer_admission`, `diagnostics_during_lane`.
  `lineage_backfill_measure` is `#[ignore]`; it is a by-hand measurement and
  stays unrun.
- `layerfs-store-service`: `merge_by_serial`, `merge_root_oracle`,
  `replay_merges`, `history_ancestry_oracle`, `scale_lineage_cap`,
  `sdk_history_depth`, `sdk_merge_paths`, `sdk_merge_scale`,
  `history_diff_oracle`.
- `layerfs-daemon`: `lane_merge`, `merge_report`, `concurrent_commits` (known
  F-020 state), and on Linux `mounted_parallel_commits`, `mounted_install`
  and `store_commit`.
- `layerfs-content`: the lib tests for `merge/*` and `compare_memo`.
- `layerfs-project` tests that use `support/memory_history.rs`
  (`overwrote_count`).
- `layerfs-history`: lib tests.
- SDK: `sdk/js/test/verify/cases_b.mjs` (publish `overwrote` and
  `overwroteCount`), plus the `project.list_overwritten` case.

**After 359-impl** (or the #354, #360 and cost-model steps in order a2):

- #354: `layerfs-store-service` `sdk_fs_reads_replay`,
  `sdk_reads_under_publish`, `sdk_reads_during_publish`, `sdk_root_batches`,
  `sdk_text_scan`, `workspace_reader_cache`, `sdk_diff_entries`,
  `sdk_diff_pages`, `sdk_diff_size`. `layerfs-persistence`
  `immutable_reads_under_reclamation`, `sqlite_group_rows`,
  `sqlite_group_rows_indexed`, `sqlite_inode_values`, `file_lengths`,
  `space_reclamation`. `layerfs-daemon` `mounted_listing_reads` and
  `mounted_store_read` (Linux).
- #360: `layerfs-content` `filesystem_attributes`, `filesystem_codec`,
  `inode_leaf`, `inode_decode_cost`, `object_admission`, `object_context`,
  the `filesystem_*` set and `compare_memo`. `layerfs-persistence`
  `acquisition_*`, `semantic_admission`, `concurrent_pooled_saves` and
  `sqlite_ordinal_lookahead`. `layerfs-project` `backed_acquisition` and
  `complete_root`. `layerfs-workspace` `captured_namespace*`,
  `directory_links` and `namespace_view`. `layerfs-storage`
  `stored_value_reads`, `pooled_demand_work` and
  `pooled_dependency_integrity`. `layerfs-store-service`
  `history_diff_oracle`. **Re-run #353's `merge_by_serial`,
  `merge_root_oracle` and `replay_merges` here**, since this is the point
  where mixed forms first meet M1 (E1).
- #356 and #359: `layerfs-fuse` lib tests and `opcode_time`.
  `layerfs-workspace` `sibling_lengths`. `layerfs-overlay` `orphans`.
  `layerfs-daemon` `negative_entries`, `installed_store`, `r5_10_producer_profile`
  and `observed_application`, and on Linux `kernel_coherence`, `kernel_mount`,
  `kernel_mutation`, `kernel_custody`, `mounted_install`, `mounted_commit` and
  `r5_5_install_survival`. `sdk/js/native` (`sandbox.rs` changed): build it and
  run the SDK native checks.
- F-A4 meets F-043: the whole `layerfs-storage` crate again, plus
  `save_encoder_reuse` (Linux) on the merged `codec.rs`.
- Tools: `tools/test_decode_observations.py` (cost-model and 359-impl changed
  `decode_observations.py`).

**After cost-model `331f2c173`:** docs only, so nothing beyond a docs link
check.

## Semantic interactions

**E1. #360's mixed metadata forms against #355 M1 merge by serial.** This is
real and not yet resolved.

- #360 (`8aed51d60`) makes `InodeValue.metadata_root` an
  `InodeMetadata::{Root(ObjectId), Inline(PortableMetadata)}`.
- `same_value` stays a byte-strict comparison. `inode_changes` and
  `root_changes` now use the decoded `same_inode`, see `compare/tree.rs:145-160`
  in the merged tree.
- The #355 FIX_NOTES analysis (`40a713349`) names three strict sites, in
  `merge/build.rs` `assign` (lines 191 and 201 in the merged tree) and
  `onto_ours`. It assigns the fix to "whoever integrates #353/#355 with #360".
- That note predates M1 (`9f0756466`). M1 adds more strict sites in
  `merge/serial.rs`, which the note does not list:
  - `same()` (line 52), used for `same(i, f)` (skip as unchanged) and
    `one_sided = same(c.i, c.b)`.
  - `!same_value(&value, &i)` at lines 280 and 550.
  - `result_value`'s three-way metadata pick (lines 330–335), which compares
    `f.metadata_root == b.metadata_root` by form.
  - The directory branch of `emit_change` (lines 377–392).

Under mixed forms, a form-only difference therefore has these effects:

- It makes a one-sided change look two-sided. M1's notes (FIX_NOTES lines
  486–490) say "costs a decision, never a wrong content result".
- It can split a hard-link group (the `assign` fresh serial).
- It can give a different root identity and spurious delete/add pairs in
  diffs.

The equivalence test that FIX_NOTES prescribes is not written:

- an old-form base;
- an inline rewrite of a hard-linked file with equal mode and mtime;
- an unrelated change on the other side;
- assert the links stay on one serial and the decoded view equals the
  strict-form view.

It must be added and run on the integrated tree.

The class-(a) results also change: #360's mtime-only rule means most
mtime-only one-sided differences never reach the merge. M1's r14 replay
"mtime lines" samples and any oracle expectation that counts them may shift.

**E2. #354 and #359 read-path changes against F-036 (`Source::base_location`).**
These are compatible.

- Neither #354 nor #359 touches `read/fetch.rs`, `read/prefetch.rs`,
  `save/wave.rs`, `save/source.rs`, `store/source.rs`, `encoding/delta/read.rs`,
  `delta/select.rs` or `pool/read.rs`. Their storage changes are only in
  `read/{mod,objects,provider}.rs`, `lib.rs` and #360's
  `port/acquisition/rows.rs`.
- #354 A1 (`ReadCache` and `KeptReads`) keeps only positive, immutable caches
  across demands: pack bodies, decoded groups and pooled values.
  `ReadState::read` still calls `source.begin_demand()`, which clears
  `Fetch.absent` per demand.
- No negative object cache crosses demands. F-036's "drop from `absent` and
  re-locate" therefore still applies inside a demand.
- #354's `Session::read_immutable` (no BEGIN; one implicit snapshot per
  statement) is consistent with F-036: `base_location` re-queries and sees a
  fresh snapshot, as it did under `run(false)`.
- I checked that no branch adds UPDATE, DELETE or REPLACE on `object_location`,
  `pack`, `pack_unit` or `inode_value`, which `read_immutable`'s safety
  argument requires. #353's new tables (`lineage*` and
  `merge_operation`/`merge_record`) are written and read through `run()` and
  `MergeScratch`, never through `read_immutable`.
- One residual point to note in review: `Fetch.locators`, the positive locator
  cache, persists across demands (pre-existing), and A1 now keeps pack bodies
  too. Both rely on "pack ids never go back and published packs never change"
  under reclamation. `immutable_reads_under_reclamation` covers this.

**E3. #359 F-B4 negative entries against correctness, #353 and #360.**

- F-B4 answers a missing LOOKUP with node id 0 and a 60 s entry TTL, so the
  kernel keeps a negative dentry.
- It is correct only if every install that adds a name invalidates it. That
  happens through `control/invalidate.rs` → `BoundWorkspace::stale_after_install`
  (`store-service/src/store/commit_merge.rs:274`). This walks
  `inode_changes(shown, installed)` plus `binding_changes` on changed
  directories, with no cap, so #355's F-041 `WRITTEN_PATHS` cut does not
  affect it.
- After #360, `inode_changes` skips form-only differences. That is correct,
  since the decoded attributes are equal.
- Open risk, recorded in `8ef8dfbfa`: "an own-root install reverts an
  mtime-only edit without invalidating the kernel's cache". This is a
  live-view decision still pending. It is about attribute caches, not
  negative dentries. Run `negative_entries` (Linux) after #353 is in, because
  #355 changed the merge and install path (two-stage merge at Commit, lane
  hold).
- F-036 is unrelated to dentries. No interaction.

**E4. #359 F-A4 against correctness F-043, both in `encoding/codec.rs`.**
There is no conflict, but the semantics overlap.

- F-A4 makes a *fresh* arena an `alloc_zeroed`, with lazy pages. Its commit
  message says "the codec sees the same zeroed memory".
- F-043 reuses dropped arenas from a process-wide idle list (`IDLE_ENCODE`
  and `IDLE_DECODE`, with no cap). A reused arena is not zeroed. Correctness
  then relies on F-043's claim that every encode and decode entry point
  resets the context first.
- After the merge, F-A4's "zeroed" claim holds only for first allocations.
  F-A4's benefit, no 16 MiB memset per Save, mostly disappears once F-043
  warms the list, because reuse already avoids the allocation.
- Retained memory under F-043 equals the peak number of concurrently live
  workspaces. With #354 A1, each kept `ReadCache` owns a decode arena
  outside the list until it is dropped.
- `KeptReads` takes a fresh arena per demand, which now comes from the idle
  list.
- Two items to re-check on the merged file:
  - The unsafe-block or boundary-guard count. F-A4 states 19, unchanged.
    F-043 adds an `unsafe impl Send for Arena<T>`.
  - `save_encoder_reuse`'s RSS thresholds, since the lazy-zero pages change
    the "without fix" baseline.
- Clippy `-D warnings` must pass on the merged file.

**E5. r5_8 and r5_5 after integration.** Correctness `bb19d9d7d` fixes the
History-page cause: the helper now follows continuations. `issue359-impl`
`8ef8dfbfa` records that `mounted_install`, `mounted_commit` r5_1/r5_8 and
r5_5 *also* fail from #360's mtime-only rule, pending a live-view decision.
Expect r5_8 and r5_5 to pass after step 1 of order (b), then possibly fail
after step 3 for the #360 reason. That is a different cause, and it should
not be read as a regression of c02.

**E6. #353's breaking History/SDK API against code that merges in cleanly.**

- `LayerRecord.overwrote` became `overwrote_count`.
- `AddLayerOutcome::Added` dropped `overwrote`.
- `MAXIMUM_LINEAGE_ROWS` and `MAXIMUM_MERGE_PATHS` were removed.
- The SDK layer value dropped `overwrote` and `overwroteTruncated` in favour
  of `overwroteCount`.

A grep of the merged tree finds no Rust user of the removed items outside
#353's own files. The two remaining users:

- `dsh/packages/host/src/sim/binding.js` (lines 50 and 271, dsh production
  scope) still emits the old shape: `overwrote: […]` and
  `overwroteTruncated: false` on layer values. The simulator therefore no
  longer matches the real SDK layer value.
- `dsh/scenarios/shared/terminal.mjs:110` and
  `sdk/js/test/verify/cases_b.mjs:236,242` use `branch.publish`'s `overwrote`,
  which #353 keeps (first 50). They are fine.

A compile is still required. #354 and #359-impl changed
`sdk::snapshot::existing` to take `&dyn` and changed the `walk`/`Walker`
signatures. #353 changes `sdk/branch.rs` and `dispatch.rs` but calls neither.
I found no textual mismatch, but grep is not a build.

**E7. #360 Init and acquisition form against #353 lineage backfill.**

- #360 `683666d45` has Project Init write the inline form.
- `acquisition/rows.rs` `NewEntry` and `Entry` change `metadata_root: ObjectId`
  to `metadata: PortableMetadata`.
- #353's open-time lineage backfill (REBUILD kind 2) reads only Commit and
  Layer rows. No interaction.
- #353 schema additions (`lineage*`, `merge_scratch`) and #360's format change
  (bytes inside the 73-byte inode value, no schema change) are independent.
- An old-format Store opened after integration gets the lineage backfill and
  reads root-form metadata unchanged (#360 Kind 1). Both
  `old_format_open` and `sqlite_inode_values` cover this.

**E8. #354 `read_immutable` and #353's writable session.** `read_immutable`
quarantines the session if the connection is not in autocommit. #353's
`MergeScratch` shares the same `Session`, through `merge_scratch()` cloning
the `Arc<Session>`, and uses guarded write transactions. These are
serialized by the session lock and admission, so a read cannot start inside
an open scratch transaction. I found no ordering issue in the source.
`merge_records` with `immutable_reads_under_reclamation` together exercise
it.

## Commands used

All git commands ran as `git -C /Users/yifanxu/Ephemeral-AI-Lab/layerfs …`.

```
git rev-parse --short <branch>; git merge-base dsh-history-replay <branch>
git rev-list --count dsh-history-replay..<branch>   (and the reverse)
git log --oneline $(git merge-base dsh-history-replay <b>)..<b>
git merge-base --is-ancestor <b> issue359-impl
git diff --name-only dsh-history-replay...<b>        (pairwise overlap via python3)
git merge-tree --write-tree --name-only --messages dsh-history-replay <b>
# chaining (objects only, no refs):
tree=$(git merge-tree --write-tree --name-only --messages $cur $b | head -1)
cur=$(git commit-tree $tree -p $cur -p $(git rev-parse $b) -m "tmp integ ...")
git diff dsh-history-replay...<b> -- <file>;  git show <commit>[:path]
git grep -n <pattern> <tree> -- <paths>
git show dsh-history-replay:tools/production_loc.py > /private/tmp/claude-501/integ/tool/production_loc.py
git archive <tree> | tar -x -C <mktemp under /private/tmp/claude-501/integ>
python3 -I /private/tmp/claude-501/integ/tool/production_loc.py --root <dir> --json
# legacy check of #353 claims only:
git show claude/issue353-lineage-cap-ec7c49:core/tools/production_loc.py > .../core_production_loc.py
python3 -I .../core_production_loc.py --root <dir>
```

The unreferenced chain commits are reachable from no ref and will be
garbage-collected. All `/private/tmp/claude-501/integ/` extracts and helper
files were deleted after the run.
