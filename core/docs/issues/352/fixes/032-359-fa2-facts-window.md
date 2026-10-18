# #359 · F-A2/F-A3: base LOOKUP facts from a remembered directory window (rm -rf stage A, prototype 1)

> **Status:** Measured, not integrated (owner decision 2026-10-19). Historical
> record of two local branches; it describes no product behaviour at HEAD.

| | |
| --- | --- |
| Trigger | Owner (relayed by the liaison 2026-10-19): "work on Daemon work cut hard + Plus LOOKUP removed". Stage A, largest ceiling first: facts loaded once per directory and answered from memory for the entries that follow (record 025: 139 µs/e of base-facts read inside LOOKUP). Liaison conditions: files and functions sent first; every cache budget unchanged; no second cache; a coherence rule with a test that fails without it; one rm-committed sample against record 025's arm |
| Kind | code path only (`layerfs-workspace` base facts). No format, schema, budget or telemetry-shape change |
| Branch | local `issue359-facts-window` off `issue359-impl` `7dc323574` (not pushed) |
| Commits | `dce9aea51` window (+89); `5db1dffae` only a kernel read opens windows (+9); `dace472a3` a window opens at a directory's second looked-up name (+16). The last two were reworded before any push to correct a wrong premise (below); their trees equal the measured `1c0cf4b0d` and `24910c806` |
| Production LOC | 98500 → 98614 (+114) over the three commits |
| Cache | the existing `CanonicalCache` allowance, `cache_bytes = 8 MiB` (`layerfs-daemon` `install_types.rs:24`), unchanged. Not the warm-daemon session's 32/64 MiB prototypes |
| Status | **Measured, not integrated: owner decision 2026-10-19** ("revert to the #362 baseline, both code and Store"). Neither the window nor the read-ahead is in the product. Both branches stay local and unchanged, as the record (below). The product stays at #362's source plus E10 (record 029). Measurement stays on the #362 prepared input `layerfs-issue359-prep` |

## Integration status (owner decision 2026-10-19)

- **Decision.** The owner reverted to the #362 baseline, both code and
  Store, and continued integration on the #352 staging lane. Kept in the
  product: E10 (`9bee52d27`, record 029, the F-048 fix). The owner
  confirmed E10 in this session. Not integrated: everything below.
- **Branches kept as the record.** All are local, unchanged and not pushed;
  do not merge them.

  | Branch | Head | Contents |
  | --- | --- | --- |
  | `issue359-facts-window` | `f28e17384` | window `dce9aea51`, `5db1dffae`, `dace472a3`; docs `f28e17384` |
  | `issue359-read-ahead` | `8d20fe411` | read-ahead `0efe2b772`, `311abfcd4`, `50b04e1ab`, `51133cdcf`; docs `79330274c`, `8d20fe411` |
  | `issue359-fb1-memory-orphans` | `1ea734de5` | F-B1 memory orphans, stopped unfinished |

  F-B1 stopped unfinished, and D-1, D-4 and stage B (READDIRPLUS_AUTO)
  were not started.
- **Store.** The current-format golden proposed in the research note below
  was cancelled before any was built. Every sample in this record used the
  #362 prepared input `layerfs-issue359-prep` (Root-form attributes).
- **Production LOC of the product is unchanged by this record.** The LOC
  figures below are those of the unintegrated branches.

## Change

- `Cache` (`base/cache.rs`) gains one entry kind. A **directory window**:
  the names a base directory lists after a looked-up name, each with its
  serial and inode value, at most 128 rows / 64 KiB of listing (the F-032
  bound). Key: **(base root, directory serial)**, one window per directory
  and root.
  - Each window is charged to the same allowance as objects, lengths and
    portables: 256 + 128 per row + name bytes.
  - It is evicted in the same LRU order.
  - An empty window is a **mark** that one name of the directory was looked
    up.
- `CanonicalClient` (`base/client.rs`):
  - `window_child`, `remember_window` and `window_seen`, all memory-only;
  - `ClientWork.window_answers` and `windows`. The diagnostics fields that
    daemon telemetry reads are unchanged.
- `BaseView` (`base/view.rs`):
  - `open_window` absorbs `provide_sibling_lengths`. It does `list_after`,
    one `lookup_many` and the remembered window, and, given a file whose
    length is not remembered, the F-032 length batch as before;
  - `windowed_child`;
  - `walked_window`, which marks on the first name and opens on the second.
- `BaseView::supply` (`mutation/facts.rs`) answers a `Need::Name` from a
  window when one lists it.
  - Only `supply_opening(.., true)`, the provider demand of a kernel
    LOOKUP/GETATTR (`VisitFacts::supply`), opens windows.
  - Mutation plans and the owner's memory-only evaluation only consult.
  - F-032's own trigger opens on every path, as before.
- Metadata and lengths stay in their existing entries, keyed by immutable
  object ids.

Files: `layerfs-workspace` `base/cache.rs`, `base/client.rs`, `base/view.rs`,
`mutation/facts.rs`. `layerfs-fuse` `operations/lookup.rs` was not touched
(part 2, below).

## Coherence: why no invalidation, and the tests

- **Key by base root.** An install that changes any listed inode (bytes,
  mode, kind, links) or the listing itself installs a new base root. A
  window of the old root is never asked under the new one.
  - A directory's content root is *not* enough. An append and a chmod of
    `p/b` keep `p`'s listing and content root, while `b`'s inode value
    changes (liaison 2026-10-19).
- **Overlay first.** The owner visit asks for `Need::Name` only for a name
  the overlay does not bind or whiteout, so base facts never override an
  overlay row.

New `layerfs-daemon` `tests/facts_window.rs`. Real kernel mounts of one
daemon, whose Workspaces share the allowance, so a window read by one mount
is still remembered by the next:

| Test | Checks | Keyed by the directory's content root | Keyed by serial alone |
| --- | --- | --- | --- |
| `a_window_never_answers_for_an_inode_changed_under_the_same_listing` | `stat p/a` reads the window; append and chmod `p/b`; Commit. `p/b` is `7 600` on the same mount after install and on a fresh mount | **fails**: the fresh mount sees `p/b 2 644` | **fails** |
| `a_window_never_answers_for_a_name_removed_by_a_later_base` | window read; `rm p/b`, new `p/d`; Commit. On a fresh mount, `p/b` is ENOENT and `p/d` is `2 644` | passes (the listing changed the content root) | **fails**: `p/b 2 644` |
| `an_overlay_rename_of_a_windowed_name_is_decided_by_the_overlay` | window read; `mv p/c p/e` on the same mount. `p/c` is ENOENT, `p/e` is found | passes | passes (overlay first, by design) |

## Samples (rm-committed, one per arm)

`cost.mjs case rm-rf-nm --part lfs`. Declared cache state: a fresh daemon
and Workspace, with the Store page cache resident (not controlled). Counts
are exact; wall and µs are warm-Store diagnostics. **Interference:**

- two non-#359 issue containers ran throughout;
- 1-minute load was 8.5–15.5, against 6.5 for the head arm;
- the timing columns move with load in callbacks the window does not run
  (UNLINK and GETATTR), so only the counts are attributed.

**Control.** Record 025's and record 026's arms are full-case runs, and
their native arm reads the tree through the same daemon first (F-050,
below). The like-for-like control is therefore `issue359-impl` itself with
`--part lfs`: daemon `caa59784` (`7dc323574`), seq 587.

| Arm | Seq | Daemon | Load | Wall ms | Sync req / e | Daemon µs / e | Outside µs / e | LOOKUP µs / e | read_supply µs / e | read_visit µs / e | Cache hits / e | Misses / e | Evictions / e | Store readers / e |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| head, full run (record 026) | 349 | `cc185d13` | 6.5 | 22,255 | 3.672 | 337.4 | 139.0 | 185.3 | 129.4 | 79.9 | 38.16 | 4.21 | 5.48 | 4.26 |
| control: impl, lfs only | 587 | `caa59784` | 12.2 | 25,441 | 3.672 | 384.1 | 160.4 | 208.0 | 142.1 | 90.6 | 38.16 | 4.21 | 5.48 | 4.26 |
| window | 567 | `455e325b` | 11.3 | 20,587 | 3.672 | 296.7 | 143.9 | 157.5 | 121.9 | 60.2 | 21.48 | 4.21 | 5.59 | 4.27 |
| + kernel reads only | 579 | `0d94d336` | 9.7 | 19,112 | 3.672 | 280.8 | 128.3 | 146.8 | 111.4 | 57.3 | 19.97 | 4.21 | 5.59 | 4.27 |
| + open at second name | 583 | `e9fffc9c` | 8.5 | 19,684 | 3.672 | 276.8 | 144.5 | 144.7 | 110.3 | 57.7 | 20.18 | 4.21 | 5.63 | 4.27 |

Against the targets, the final arm (seq 583):

| | Value | Ratio |
| --- | ---: | ---: |
| ~3 s target | 19.7 s | 6.6× |
| 7.0 s floor | 19.7 s | 2.8× |
| Stage A daemon target (≤ 100 µs/e, ideally 50) | 276.8 µs/e | missed |

## Reading

- **Attributed (counts):**
  - cache hits per entry fell 38.16 → 20.18 (−47%), the navigation the
    window replaces: parent resolution, directory search and child
    resolution per sibling;
  - Store reads (4.27 per entry), misses (4.21) and read visits per entry
    are unchanged;
  - requests per entry are unchanged.
- **Not attributed (timing):** LOOKUP 208 → 145 µs/e and daemon 384 → 277
  µs/e against the control, but the control ran at a much higher load.
  Against the head arm (lower load, full run) the fall is 185 → 145 and
  337 → 277. The share due to the window is somewhere in that range. One
  sample per arm; no resampling.
- **What remains in read_supply (about 110 µs/e).** It is the cold Store
  reads, inferred from source:
  - a file whose metadata is a root reads its attribute page and its mtime
    value, plus mode;
  - with the remaining misses, about 4.2 objects per entry are read once
    each, in a walk that touches every file once. No cache allowance can
    hold them ahead of the walk;
  - reader SQL alone is about 49 µs/e (record 025 method, seq 403).
- **Why read_visit stays at 2 visits per LOOKUP.** The owner's first visit
  already evaluates base facts from memory (`kernel_visit.rs` `supply` →
  `BaseView::supply`, memory-only client), and it now consults the window.
  It still returns `Needs`, because the sibling's metadata objects are not
  resident.

## Part 2 (approved: a memory-only pre-fill in `lookup.rs`) is moot

The pre-fill would have given the first visit the window's facts. It
already has them, through the resident path above. What it lacks is each
sibling's portable metadata, which no memory-only pre-fill can supply.

The change that would give a single visit is a read-ahead. When a LOOKUP is
answered from a window, which is evidence of a listing-order walk, the
portable metadata of the rest of that window would be read and remembered
(existing `portable` entries, same allowance).

- The same objects are read, in one supply per window instead of one per
  name.
- Later names then decide in one visit with no `read_supply`. The ceiling
  is about 57 µs/e of `read_visit` halved, plus the per-supply overhead.
- The cost is metadata read for names a program never asks for. That is
  bounded by one window, and only after a second name of the directory was
  looked up.

It is not built: it is a read-ahead, not the approved pre-fill, so it needs
a decision.

## Part 2, as built: read-ahead of a walked window

- **Decision.** The liaison (2026-10-19) approved the read-ahead instead of
  the moot pre-fill: its own commit and samples, a walk-evidence trigger,
  one read per window, ordinary entries, and a waste count. The owner
  (2026-10-19, in this session) said: "approve for the most aggressive
  change, and would like to make sure the optimization of rm -rfs is also
  applied to other filesystem operations especially the slow ones".
- **Commits** on local `issue359-read-ahead` off `issue359-facts-window`
  (not pushed):

  | Commit | Change | Production LOC |
  | --- | --- | --- |
  | `0efe2b772` | read-ahead | +191 |
  | `311abfcd4` | in-order trigger | −14 |
  | `50b04e1ab` | a repeat ask keeps its order | +6 |
  | `51133cdcf` | per-kind | +9 |

  Total 98614 → 98806 (+192).

### What it does

- **Trigger.** A kernel read is answered with the row after the one the
  window last answered, or with its first row. That is evidence of a walk
  asking every listed name of that kind in order. The same row asked again
  keeps its verdict: the owner's memory-only visit asks first, then the
  request's own demand asks.
- **What is read.** Once per window and per kind, the rows of the answered
  name's kind: portable metadata, a file's length, and a directory's or
  symlink's root object.
- **How it reads.** In waves. Each wave decodes from memory through a probe
  reader and reads every missing object in one Store demand. That is one
  demand per object level, not a few per name.
- **Where it is kept.** Answers are ordinary `portable`, length and object
  entries in the same CanonicalCache allowance. `cache_bytes` stays at
  8 MiB; all arms here ran at 8 MiB.
- **Waste counters.** `ClientWork` gains `read_ahead_portables`,
  `read_ahead_demands`, `read_ahead_used` and `read_ahead_evicted`
  (evicted before any ask). Daemon telemetry row 10 has a fixed field set
  and is not changed. In the samples, waste shows as misses above the
  no-read-ahead control, and that measure is exact for these trees.
- **Tests:** `layerfs-workspace` `tests/read_ahead.rs` (5).
  - Whole window: 128 answers in at most 4 demands, all used, none evicted.
  - Waste is counted under a small allowance.
  - A sparse walk reads nothing ahead.
  - A row asked twice keeps its order. This test fails without
    `50b04e1ab` (revert check).
  - A walk of directories reads only directories, then files once a file
    is asked in order.

### Arms (one sample each, `--part lfs`)

Controls are the window arm `e9fffc9c`: s583 for rm, and s591, s595, s599
and s603, run as controls this session.

**Load:**
- s589–s605 ran at 6.4–16.5;
- s612–s620 at 31–53. Host `du`, Spotlight indexing and the Docker VM
  were busy; the owner said "just go, the load will not impact that much";
- s623–s631 at 11.9–15.9;
- s636–s646 at 24–39.

Counts are exact. Timings are only diagnostic.

| Case / step | Arm (daemon) | Store readers | Misses | Owner jobs | Wall ms |
| --- | --- | ---: | ---: | ---: | ---: |
| rm-committed | control s583 | 199,307 | 196,738 | 289,756 | 19,684 |
| | first (s589 `16b551cc`) | 54,338 | 198,903 | 254,325 | 21,269 |
| | repeat-ask fix (s623 `a6a36e85`) | 54,717 | 198,847 | 257,946 | 18,782 |
| | per-kind (s646 `a4b20748`) | 58,654 | 198,724 | 258,241 | 23,344 |
| du-s cold | control s591 | 219,595 | 216,367 | 139,862 | 14,572 |
| | first (s593) | 62,820 | 218,576 | 101,708 | 11,954 |
| | in-order, buggy (s620 `bc680fa3`) | 219,595 | 216,367 | 139,862 | 17,097 |
| | repeat-ask fix (s625) | 63,233 | 218,541 | 105,803 | 13,756 |
| | per-kind (s642) | 67,796 | 218,420 | 106,218 | 22,420 |
| find cold | control s595 | 35,863 | 36,563 | 50,971 | 3,737 |
| | first (s597) | 24,777 | **50,339** | 50,963 | 4,018 |
| | repeat-ask fix (s627) | 24,774 | **42,683** | 50,967 | 3,738 |
| | per-kind (s636) | 24,495 | 36,569 | 50,967 | 4,025 |
| ls-r cold | control s599 | 4,559 | 4,586 | 6,441 | 453 |
| | first (s601) | 3,527 | **5,925** | 6,434 | 564 |
| | per-kind (s638) | 3,799 | 4,586 | 6,438 | 441 |
| tree-r17-find cold | control s603 | 35,863 | 36,563 | 50,971 | 3,394 |
| | per-kind (s640) | 24,495 | 36,569 | 50,967 | 4,471 |

Steady arms of du-s, find, ls-r and tree-r17-find answer GETATTR by serial
with no window. Their counts are unchanged in every arm.

rm-committed per entry, final arm (s646) against s583:

| | Value |
| --- | ---: |
| Sync requests / e | 3.672 (unchanged) |
| Daemon µs / e | 341.1, against 276.8 at load 32 vs 8.5; not attributable |
| Outside µs / e | 158.6 |
| Foreground statements / e | 26.11 → 24.78 |

### Reading

- **Attributed (counts):**
  - On walks that ask every name (rm, du-s), Store reader requests fall
    69–73%. Owner jobs fall 11% (rm) and 24% (du-s), because the second
    owner visit of a LOOKUP is gone for read-ahead names.
  - Waste is about 1% (rm 1,986 objects, du-s 2,053 above control).
  - On walks that ask only directories (find, tree-r17-find, ls-r), waste
    is 0–6 objects, and readers still fall 17–32%.
- **Two intermediate arms were wrong**, and later commits fixed them:
  - the first arm read files ahead for find (+38% misses);
  - the in-order arm never fired on a mount (s620: identical to control),
    because the owner's memory-only visit advanced the window before the
    demand asked.
- **Not attributed (timing):** the one low-load pair (s593, du-s cold) went
  14.6 → 12.0 s, and s623 (rm, load 15.9) went 19.7 → 18.8 s. The per-kind
  arms ran at load 24–39, so their timings are not like-for-like. Store
  reads per object still dominate read_supply: misses are unchanged, and
  each object costs 26–33 µs (research note below).
- **Stage A target:** still missed. Daemon time on rm is about 275–340
  µs/e against ≤100.

### Proof (part 2)

All runs used the pinned image and `LAYERFS_CONSTRUCTION_WORKERS=1`, each
command ≤120 s, with binaries built first. clippy `-D warnings` and rustfmt
are clean.

- `layerfs-workspace`: 176 of 176 at `51133cdcf`.
- `layerfs-daemon`: of the 16 targets listed above, 15 pass at
  `51133cdcf`. `kernel_coherence` was 5 of 6: **F-051**.
- At `50b04e1ab`, 15 of 16: `fp31` was 1 of 2 (F-049, Absent case).
- At `0efe2b772`, earlier failures, kept as recorded:
  - `mounted_install` r5-5b precondition ("no write was seen between the
    capture and the return"). This is the known timing precondition of
    record 022; it passed on one diagnostic run alone;
  - `fp31` TooSmall (F-049).

No test was deleted.

### Research note: the golden Store predates inline metadata

> Superseded: the owner kept the #362 prepared input (2026-10-19), and no
> current-format golden was built. The note is kept as research.

From a read-only research pass in this session, no measurement:

- Current Init and Commit write a file's mode and mtime inline in the
  inode leaf (`InodeMetadata::Inline`). The cost suite's golden Store was
  made before that, so its inodes use the Root form.
- About 3 of the ~4.2 objects read per first base stat are that attribute
  tree: the attribute page, the mtime value and its payload.
- So a Store built by current code would not pay most of the misses this
  read-ahead batches. The research estimate (inferred, not measured):
  rm −3.7 s, du-s −4.6 s, grep-r −4.3 s, cp −4.7 s.
- Confirming it needs a golden prepared by current code. That is a setup
  change, so it is an owner or liaison decision.

## Other cases (diagnostic, one sample each)

On `455e325b`, the first window commit; seq 569, 571, 573 and 575. The
controls are head full runs, which are confounded for small trees (F-050).

| Case / step | Store readers, head → window | Cache misses, head → window | Wall ms, head → window |
| --- | --- | --- | --- |
| node-require cold | 831 → 833 | 861 → 869 | 347 → 134 (not attributable) |
| tsc-b cold | 3,053 → 3,055 | 3,152 → 3,160 | 620 → 549 |
| find cold | 35,848 → 35,864 | 36,520 → 36,564 | 3,883 → 3,745 |
| git status-cold | 8,987 → 9,026 | 8,545 → 8,624 | 627 → 502 |
| git commit | 223 → 371 | 201 → 337 | 55 → 61 |

**Wrong premise, corrected.** The git commit rise was first attributed to
the window, and the two gate commits were written for it.

- The control without any window (seq 585, `caa59784`) also reads
  **371**, with 337 misses.
- The head arm's 223 came from its full run. Its native copy had warmed
  the daemon cache: 7,488 evictions in head's status-cold, 0 in every
  `--part lfs` arm.

Both gates are kept on their own merit: a mutation or a scattered lookup
does not pay a 128-row listing. The rm-committed arms show they cost
nothing (276.8 vs 296.7 µs/e).

## Proof

All runs used the pinned image, the Disposable Store and
`LAYERFS_CONSTRUCTION_WORKERS=1`, each command ≤120 s, with the test
binaries built first.

- `layerfs-workspace`: 171 of 171 (unchanged count, including
  `kernel_visit`, whose `file_lengths == 0` holds because F-032's trigger
  is unchanged). `layerfs-store-service` + `layerfs-fuse` +
  `layerfs-overlay`: 107 of 107.
- `layerfs-daemon` at the final commit:

  | Target | Passed |
  | --- | ---: |
  | `facts_window` | 3 |
  | `mounted_commit` | 9 |
  | `mounted_install` | 4 |
  | `r5_5_install_survival` | 4 |
  | `kernel_coherence` | 6 |
  | `kernel_custody` | 2 |
  | `mounted_listing_reads` | 1 |
  | `negative_entries` | 2 |
  | `mounted_cycles` | 4 |
  | `store_commit` | 7 |
  | `mount_control` | 9 |
  | `mounted_commit_failures` | 4 |
  | `r5_1_actual_daemon_commit` | 1 |
  | `mounted_concurrency` | 5 |
  | `kernel_mount` | 3 |
  | `mounted_links` | 1 |

  `fp31_forget_underflow` passed 1 of 2: **F-049** (below). It passed on
  one diagnostic run alone, which is not a pass.
- Earlier commits on this branch, preserved:

  | Commit | Result |
  | --- | --- |
  | `dce9aea51` | 29 daemon targets pass in full; `mounted_install` 3/4 (F-046, fifth occurrence) |
  | `1c0cf4b0d` | `mounted_commit` 8/9 (F-046, sixth occurrence) |

- clippy `-D warnings` and rustfmt are clean. No test was deleted.

## Record 026's head table: rows confounded by F-050

Liaison, 2026-10-19: mark them here. Record 026's head-table rows are
unchanged and keep their verdicts; this only says which of them are
like-for-like.

- **Confounded** (a full-case run whose native arm warmed the same daemon's
  cache first): every row except the three below. That covers node-require,
  pnpm-first, pnpm-reinstall, tsc-b, git, du-s, find, ls-r, rm-rf-nm,
  lifecycle, scale-folder and scale-tree. Their Store reads, misses and
  timings are not lfs-cold figures. rm-rf-nm's per-entry hit and miss counts
  match an lfs-only arm (38.16 and 4.21), so only its timings are not
  like-for-like.
- **Not confounded:** vitest, grep-r and cp-rm-nm. They ran `--part native`
  and `--part lfs` as two commands, each with its own daemon.

## Findings filed

- **F-049**: `fp31` TooSmall's premise races an early kernel FORGET.
- **F-050**: a full-case `cost.mjs` run warms the daemon cache for its
  LayerFS arm.
- F-046: fifth and sixth occurrences.

## Production LOC

Per commit:

| Commit | Before | After | Delta |
| --- | ---: | ---: | ---: |
| `dce9aea51` | 98500 | 98589 | +89 |
| `5db1dffae` | 98589 | 98598 | +9 |
| `dace472a3` | 98598 | 98614 | +16 |

Method: `tools/production_loc.py --root` on `git archive`; core 89818 →
89932, sdk 2635, dsh 6047, reference absent (retired R9c; last counted
65,417 at tree `498dd1917812`). This record is docs only: 98614 → 98614
(delta 0).
