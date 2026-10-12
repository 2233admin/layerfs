# Issue 320: the shared immutable object cache with several Workspaces

> **Status:** Diagnosis; host in-process measurement and receipt analysis; not a qualified result.
> Written 2026-10-13 on branch `perf-experiments-c`. Product source at the
> end of this work: `8081d23f9`. The mounted receipts read here were recorded
> by another worktree at product tree `ff47933c44f6` and are single samples.

This document answers five questions about the daemon's one shared immutable
object cache (design: [sandbox cache design](../../../../docs/general/sandbox-cache-design.md)),
records two proofs that [issue 314](https://github.com/Ephemeral-AI-Lab/layerfs/issues/314)
closed as "not found", and records two small changes made inside that design.
Nothing here was measured on a mount. Every count below is either read from a
retained receipt or counted by a host test binary over a real Disposable Store
and the real owner. One host timing is printed and labelled; no speed-up of the
mounted product is claimed.

## 1. What was found

1. **The misses are not eviction.** In the mounted receipts the misses of one
   Workspace are 925 ± 4 in every window of ten steps, with no eviction in
   windows 2 to 7 and more than a thousand evictions in windows 9 and 10. Four
   Workspaces: no rise after the cache filled either. The cache evicts entries
   that nothing asks for again.
2. **The misses are first reads of objects that an earlier Commit of the same
   Workspace wrote.** A Commit leaves nothing in the cache. In the host replay
   96.9% of the misses of one Workspace and 99.2% of four are such objects;
   3.1% and 0.8% are first touches of the base. The mounted receipt agrees
   where it can be checked: the same stage costs 267 misses when its 64 files
   were written by a Commit ten Commits earlier and 10 to 16 when they are base
   files.
3. **They are small and come four to a changed inode.** The format stores
   portable mode and mtime as two small files. An inode with its own mtime has
   four objects nothing else has (attribute page; file state, mapping leaf and
   payload of the mtime), each discovered only by decoding the one before, so
   each is its own Store read. This is why misses and Store batches are nearly
   equal (9,148 ids in 8,995 batches).
4. **Four Workspaces share almost nothing in steady state because their misses
   are their own Commits' objects.** The ratio of four-Workspace to
   one-Workspace misses is 3.74 before any eviction (steps 1 to 20) and 3.77
   after. Sharing of identical objects is exact where objects are identical
   (section 4).
5. **A larger allowance would not have changed the misses** of these two
   cases. It changes them only together with seeding (B1, section 8).
6. Two proofs now exist at the in-process seam: reuse between nearby branches
   and correctness under eviction pressure (sections 4 and 5).
7. Two changes were kept: lookups no longer re-acquire the root object, and
   portable mode and mtime are remembered by metadata root. Together they
   halve the cache acquisitions of the replay (416,571 to 210,181 for one
   Workspace) and change no Store demand.

## 2. C1: what the misses are

### 2.1 The retained receipts

Read from
`layerfs-perf/benchmark-results/fs-bench-pro/2026-10-13-issue320-t1a-run-mixed_load_bearing/v016-mixed-development-100mb-5000-k100-v1/receipt.json`
(one Workspace) and `…-t1a-run-multi_workspace_development/v016-workspace-four-100mb-5000-k100-v1/receipt.json`
(four), `observations.cache_work`, `store_work` and `reader_work`: one
cumulative snapshot per control call. The interval is from the snapshot after
mount to the snapshot of the last Commit; a step is one command and its Commit
and cannot be split from the receipt. The later snapshots include the
verifier's full read of the tree and are not part of these numbers.

One Workspace, by stage (20 steps each):

| Stage | Hits | Misses | Store batches | Authenticated bytes | Evictions | Length ids |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 delete and create 64 files | 42,905 | 2,809 | 2,771 | 876,331 | 656 | 1,024 |
| 2 edit 16 files | 11,717 | 1,671 | 1,618 | 4,079,333 | 1,161 | 594 |
| 3 directory moves | 6,393 | 843 | 839 | 474,043 | 153 | 0 |
| 4 links, chmod, mtime | 30,311 | 618 | 580 | 1,000,184 | 79 | 412 |
| 5 mixed delete, create, rename | 27,667 | 3,207 | 3,187 | 1,202,410 | 353 | 512 |
| Total | 118,993 | 9,148 | 8,995 | 7,632,301 | 2,402 | 2,542 |

Windows of ten steps (four Workspaces: forty Commits in completion order):

| Window | One: misses | One: evictions | Four: misses | Four: evictions | Four: reader grants | Four: queue wait ms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 816 | 0 | 2,715 | 0 | 1,542 | 17 |
| 2 | 929 | 0 | 3,816 | 0 | 1,587 | 15 |
| 3 | 926 | 0 | 3,174 | 348 | 1,433 | 17 |
| 4 | 928 | 0 | 3,715 | 4,582 | 1,618 | 27 |
| 5 | 925 | 0 | 3,701 | 4,033 | 1,597 | 7 |
| 6 | 923 | 0 | 3,640 | 3,753 | 1,534 | 10 |
| 7 | 927 | 0 | 3,651 | 4,237 | 1,565 | 16 |
| 8 | 925 | 180 | 3,370 | 3,678 | 1,392 | 20 |
| 9 | 922 | 1,133 | 3,691 | 3,917 | 1,571 | 12 |
| 10 | 927 | 1,089 | 2,969 | 3,011 | 1,297 | 3 |

Measured from these: the first eviction is at step 80 of one Workspace
(7,051 objects, 8,387,795 bytes charged) and at about Commit 108 of four.
Misses per window do not rise when eviction starts. Re-fetch after eviction is
therefore at most the window noise: under 1% for one Workspace; not visible
for four.

Stage 1 of one Workspace, misses per cycle:
`12, 270, 269, 16, 268, 10, 267, 15, 267, 15, 267, 10, 267, 15, 267, 15, 267, 10, 267, 15`.
The workload refreshes cohort 0 on every odd cycle and a new cohort on every
even one (`cohort_for_cycle`, `core/benchmark/fs-bench-pro/workload/v016_common.rs:728`),
except that cycle 2 is cohort 0 again. So the 267-miss steps are exactly the
steps whose 64 files were created by this Workspace's own Commit two cycles
(ten Commits) earlier, and the 10 to 16-miss steps are the first visit of a
cohort of base files. 267 − 12 = 255 ≈ 64 × 4.

Inferred, not measured, for the mounted cases: stages 3, 4 and 5 return every
cycle to directories and files the previous cycle created
(`core/benchmark/fs-bench-pro/writers/v016_m1.rs:523-1011`), so the same
explanation applies to them; stage 2 also reads the content of base files it
edits for the first time (204 kB a step). The split by command and Commit is
not in a receipt.

Four Workspaces against one, same interval: misses 34,442 against 9,148
(3.77); by steps 1 to 20, before any eviction in either, 6,531 against 1,745
(3.74). The four branches differ by salt in what they write, so what each
reads back is its own.

### 2.2 From source: who asks the shared cache, and what a Commit leaves there

The only place an object enters the cache is the miss path of
`CanonicalClient::read_canonical_batch`
(`core/crates/layerfs-workspace/src/base/client.rs:167-262`, insertion at
`:253`). Callers:

| Path | Where | What it demands |
| --- | --- | --- |
| Command: base lookup, stat, list, readlink, read | `base/view.rs:95-171`, `:185-206`, `:232-306`; `base/links.rs:103-113`; reached from `mutation/facts.rs:112-200`, `workspace/view.rs`, `operations/native_data.rs`, `operations/file/read.rs` | Inode-table pages, directory pages, metadata objects, symlink targets, file objects of the bound root |
| Bind | `layerfs-daemon/src/store/bind.rs:85-119` | Root, the root inode's table path, root directory page, root metadata |
| Commit: validation of the new root | `store/commit.rs:141-146` calling `bind.rs:85-119` | The same four kinds, of the root this Commit has just saved |
| Commit: captured file facts and inherited content | `construction/captured/owner.rs:169-184`, `captured/source.rs:74`, `captured/edges.rs:181` through `base/file.rs:12-30` and `base/view.rs:259-266` | Inode path and file objects of the files the Commit rewrites |

A Commit's tree update reads the base through the Save's own provider
(`store/captured.rs:102-107`; `layerfs-storage/src/save/provider.rs:91`), not
through the shared cache, and what it constructs goes to the Store through the
Save's sink. Nothing it constructs is inserted into the shared cache. The
first reader of each new object fetches it from the Store and authenticates
it: the validation at the end of the same Commit for the new root's top pages,
and later commands for everything else.

### 2.3 Host replay

`core/crates/layerfs-daemon/tests/shared_cache_replay.rs`. Base: 4,712 files
(4.4 MB), one modification time, 4,443 objects. One hundred steps of the same
five stages, each returning every cycle to what the previous cycle of the same
Workspace created (cohort rule as above), a product Commit
(`BoundWorkspace::commit_captured`) after every step, 5,356 operations a
Workspace. It drives the Workspace operation API: every operation walks its
path from the root and Workspaces take turns. It is not the mounted workload;
hit counts in particular are not comparable.

Misses, at product source `e28d482ab` (unchanged by the later commits):

| Run | Workspaces | Command misses | Commit misses | Total | Of which |
| --- | ---: | ---: | ---: | ---: | --- |
| No eviction | 1 | 7,935 | 616 | 8,551 | — |
| No eviction, whole base read first | 1 | 7,850 | 432 | 8,282 | all are objects a Commit wrote: 96.9% of 8,551 |
| No eviction | 4 | 31,410 | 1,552 | 32,962 | 3.855 × one Workspace |
| No eviction, whole base read first | 4 | 31,325 | 1,368 | 32,693 | 99.2% of 32,962 |
| The same, and after each Commit every object new in its root is put in the cache | 1 | 0 | 280 | 280 | the 280 are the Commit's own validation, read before the seeding |
| The same at 8 MiB | 4 | 47 | 1,471 | 1,518 | — |

Commands make 92.8% of the misses and Commits 7.2% (one Workspace). A Commit
misses 3 to 4 objects in validation, and 18 in the edit stage, where it also
opens the 16 files it rewrites. Store batches are 8,538 for 8,551 misses.

## 3. Proof gap 1 of issue 314: reuse between nearby branches

`core/crates/layerfs-daemon/tests/shared_cache_branches.rs`, PASS. Two
branches forked from one Layer; each gets one Commit of a few changes (one
path edited by both, one file added to each, one removed, one renamed, one
mode change). A second daemon opens the same Store with an empty cache. The
identity of every object of each published root is recorded independently,
straight from the Store port with no cache.

| Measure | Value |
| --- | ---: |
| Objects of root A / of root B | 1,647 / 1,650 |
| Identical in both | 1,608 (836,317 of 861,737 bytes) |
| Only in B | 42 (25,420 bytes) |
| Workspace A reads its whole tree: misses = Store object ids | 1,647 = 1,647 |
| Workspace B then reads its whole tree: misses = Store object ids | 42 = 42 |
| Authenticated bytes for B | 25,420 |
| File lengths asked for A / then for B | 302 / 3 |
| Both again, other order: Store objects and lengths | 0 / 0 |

Each Workspace reads its own bytes of the path both edited, and neither sees
the other's added file. This closes the gap at the in-process seam: the real
Store, the real shared cache and the real owner, through the Workspace view.
It does not exercise a kernel mount.

## 4. Proof gap 2 of issue 314: correctness under eviction pressure

`core/crates/layerfs-daemon/tests/shared_cache_pressure.rs`, PASS, and
`core/crates/layerfs-workspace/tests/shared_cache_client.rs`, PASS. Allowance
64 KiB against a working set charged 2,040,340 bytes (1,740 distinct objects),
two Workspaces on two branches. Numbers at `8081d23f9`:

- Every one of 638 alternating whole-file reads returns the bytes recorded
  independently from the Store. 3,394 misses for 1,740 distinct objects:
  evicted objects were fetched again; 4,626 evictions.
- After every read: charge ≤ allowance, and entries held = misses + lengths
  answered + metadata decodes − evictions, exactly.
- One object exactly: demanded (1 miss, 1 Store object, its length in
  authenticated bytes), demanded again (1 hit, nothing from the Store),
  evicted by the other Workspace reading its own tree, demanded again (1 miss,
  1 Store object, the same bytes authenticated again).
- A wrong upstream answer for an evicted object is refused with
  `IdentityMismatch`, retained nowhere and counted as nothing (client test).
- An object charged more than the allowance is served every time, never
  retained, and evicts nothing.
- Two readers at once, one scanning its whole tree in a loop: both complete
  three passes with every byte checked; between two passes of either, the
  other advanced. This shows progress, not a fairness share.

Also measured there: when two readers miss the same object at the same time,
each fetches and authenticates it and one inserts it. In the concurrent phase
4,518 of 9,240 misses were such second fetches, because both readers walk the
same order. The cache does not join concurrent misses of one object.

This closes the gap at the in-process seam. Not covered: kernel caches, and a
Commit under pressure (the replay covers Commits under eviction down to 1 MiB
and checks the final trees, but not one object at a time).

## 5. C4: working set against allowance

The allowance was not changed. It is a limit of logical charge: bytes of each
object plus 256, 264 for a remembered length, 272 for a remembered mode and
mtime. It is not a measured resident size.

Mounted cases, derived from the receipts (product tree `ff47933c44f6`):

| | One Workspace | Four Workspaces |
| --- | ---: | ---: |
| Charge inserted over the run | 10,645,277 | 28,000,164 |
| 8 MiB: hits / misses / evictions (measured) | 118,993 / 9,148 / 2,402 | 442,934 / 34,442 / 27,559 |
| 16 MiB: evictions (inferred) | 0 | about 16,300 |
| 32 MiB and 64 MiB: evictions (inferred) | 0 | 0 |
| 16, 32, 64 MiB: hits and misses (inferred) | unchanged | unchanged |

The inserted charge is authenticated bytes + 256 × misses + 264 × length ids.
The 16 MiB figure divides the excess by the mean charge of an entry (690
bytes); the same rule gives 28,420 at 8 MiB against 27,559 measured. Hits and
misses are stated unchanged because no re-fetch after eviction is visible at
8 MiB. Memory cost of a larger allowance: up to 8, 24 or 56 MiB more charged
bytes in the daemon, plus allocator overhead that was not measured.

Host replay, measured at `8081d23f9`, four Workspaces, 400 Commits:

| Allowance | Hits | Misses | Evictions | Length ids | End charge |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2 MiB | 841,074 | 33,323 | 40,663 | 7,246 | 2,096,823 |
| 4 MiB | 841,082 | 33,315 | 34,616 | 5,761 | 4,192,166 |
| 8 MiB | 841,379 | 33,018 | 23,976 | 4,491 | 8,388,574 |
| 16 MiB | 841,435 | 32,962 | 5,795 | 4,379 | 16,777,090 |
| 32 MiB, 64 MiB | 841,435 | 32,962 | 0 | 4,379 | 19,555,090 |

The last row is the run with an allowance that never evicts; 32 and 64 MiB
were not sampled separately because the whole run charges 19,555,090 bytes.
One Workspace charges 5,600,785 bytes in all: 210,181 hits, 8,551 misses and
no eviction at 8 MiB and above. From 64 MiB down to 2 MiB the misses of four
Workspaces rise by 1.1% and length demands by 65%.

With seeding emulated (section 8), one Workspace, command misses are 0 with no
eviction, 11 at 8 MiB, 40 at 4 MiB, 57 at 2 MiB and 63 at 1 MiB; four
Workspaces at 8 MiB, 47. (Taken at `e28d482ab`; these runs first read the
whole base, 9.1 MB of charge, so the cache is full from step 1.)

## 6. C5: what a hit and a miss cost today

At `8081d23f9`.

| Cost | Value | Where |
| --- | --- | --- |
| Lock | One mutex for the whole cache; taken once per demand for all its ids, and once more to insert the misses | `client.rs:179-202`, `:245-260` |
| Lock across upstream | Released: no lock spans the Store read or authentication | `client.rs:203-225` |
| Map work per hit | One ordered lookup by 32-byte id, one remove and one insert in the age map | `cache.rs:177-194` |
| Bytes copied per hit | The whole object, while the lock is held | `cache.rs:193` |
| Bytes copied per miss | The whole object again into the cache, while the lock is held; the fetched buffer is returned to the caller | `cache.rs:213`, `client.rs:253` |
| Authentication per miss | One identity hash of the object | `client.rs:220` |
| Eviction | One pop of the oldest age and one map remove for each entry evicted | `cache.rs:102-119` |
| Allocation per demand | Three vectors besides the copies | `client.rs:175-177`, `:226` |

Host timing of one hit, printed by `shared_cache_client` and asserting
nothing (one sample, optimized test profile, 8,192 entries, a different object
each time): 490 ns for a 128-byte object, 653 ns for 1 KiB, 1,137 ns for
8 KiB, 2,192 ns for 64 KiB among 512 entries. Inferred from this and the
receipt (1,190 hits a step): about 0.7 ms of an about 110 ms step.

Whether ids known together are demanded together:

| Call site | Behaviour |
| --- | --- |
| Inode by serial: `layerfs-content/src/filesystem/inode/read.rs:38-79` | One id per tree level; each is known only after the page above is decoded |
| Name in a directory: `directory/read.rs:51-100` | One id per level, same reason |
| Several inodes or names: `inode/read.rs:83-140`, `directory/read.rs:108-180`; used by `base/links.rs:113` | One batch per level for all of them |
| Portable metadata: `attributes/read.rs:112-145` | The attribute page (one batch, both keys); then the two values one after the other, although both value roots are known together at `:123-132` |
| One attribute value: `attributes/value.rs:62-90` | File state, then mapping leaf, then payload: three demands for 4 or 12 bytes |
| File content: `file/mapping/read.rs:203`, `:252` | Navigation and payload ids of one range in one batch each |
| Bind and Commit validation: `layerfs-daemon/src/store/bind.rs:101-118` | The root inode's content root and metadata root are known together at `:111` and demanded separately |
| Stat of a symlink: `base/view.rs:191-198` | Metadata root and content root are known together and demanded separately |
| Store port without an admitted reader: `store/ports.rs:192-199` | One reader admission for each batch. A native request admits one reader for all its batches (`store/read_scope.rs:44`) |

## 7. Changes made (Class A)

Each cause sentence and prediction was written before the edit; the counts
are exact assertions in the named tests. Counted on the host; no timing or
mounted claim.

| Commit | Cause | Predicted | Observed | Memory |
| --- | --- | --- | --- | --- |
| `95155aed6` Start base lookups at the root a BaseView already checked | Every lookup built a `FilesystemRead`, which acquires and decodes the root object again, although the view keeps the checked root from `open` | One fewer cache acquisition per lookup; Store demands unchanged | inode 2→1, child 4→3, stat file 9→8, stat symlink 10→9, readlink 3→2, list 3→2; no cache, named file 11→10 objects. Replay, one Workspace: hits 416,571→355,081; misses, batches, bytes, lengths, grants unchanged | None |
| `8081d23f9` Remember portable mode and mtime by metadata root | Every stat acquired, copied and decoded seven objects for mode and mtime, a pure function of the immutable metadata root and kind | Seven fewer acquisitions per resident stat; first touch unchanged; +272 bytes of charge per remembered root | stat file 8→1, stat symlink 9→2; first stat still 8 Store objects. Replay, one Workspace: hits 355,081→210,181; misses, batches, bytes, lengths, grants unchanged | Charge 5,077,729→5,600,785 with no eviction. At 8 MiB, four Workspaces: evictions 17,841→23,976, misses and lengths unchanged. At 2 MiB: length ids 6,342→7,246, misses unchanged |

Not made, with the reason:

- **A1, batching ids known together.** In the files of this work the only
  such site is the stat of a symlink (and of a directory together with its
  entry count): at most one batch saved of nine on a cold symlink or
  directory, none for a file, whose second fact is a length. The sites that
  matter are in `layerfs-content` (the two values of `read_portable`) and in
  `bind.rs`; both are outside this work's files. The dependent chain root →
  state → leaf → payload cannot be batched at all.
- **A2, no copy on a hit.** `AuthenticatedObjects::read_canonical_batch`
  returns owned buffers, so a hit must copy unless that public trait changes.
  The copy could move outside the lock by holding shared bytes in the cache;
  no count would move, and no contention on the cache lock has been measured.
  The two changes above remove half of the hits instead.
- **A3, cheaper bookkeeping.** About 0.5 µs a hit on the host; by inference
  under 1% of a mounted step, and the hits are now half. Not a clear cost.

## 8. Class B: for the owner

**B1, seed the cache with what a Commit constructed. Not built: the wiring is
in files this work does not own. Measured potential on the host:** with every
object new in a Commit's root placed in the cache after that Commit (emulated
by the test demanding them), the next commands of one Workspace miss 0 objects
instead of 7,850 and make 536 reader admissions instead of 8,380; of four
Workspaces at 8 MiB, 47 instead of 31,410. The Commit's own validation still
missed 280 (2.8 a Commit) only because the emulation seeds after it. Cost:
12,391 objects and 3,572,666 bytes seeded for one Workspace, against 8,282
that were read back without seeding: a third of what is seeded is never read,
mostly content of created files. At 8 MiB with four Workspaces evictions rise
from 17,841 to 41,886 and misses do not. In the mounted cases the same
mechanism is the stage-1 pattern of section 2.1; how much of the 9,148 misses
it would remove there is inferred, not measured.

What it needs: an insertion entry on the cache owner that checks the identity
of the bytes before inserting, so that nothing enters unauthenticated; and a
tee of the Save's sink in `store/captured.rs:102-107`, or a pass over the
saved objects after `save.finish()` at `store/commit.rs:121`, before the
validation at `:141-146`. It should seed namespace objects (inode, directory
and attribute pages and values, symlink targets) and not file payload: the
replay's files are 1 KiB; the mounted workload's are about 20 KiB, and 64 of
them a Commit would displace the entries that are read back. The reuse
distance to cover is ten Commits of each Workspace: about 1.1 MB of charge for
one mounted Workspace and 2.8 MB for four at the receipts' rates, inside
8 MiB.

The measurement rule: seeding is product behaviour, paid inside the measured
Commit and visible in its counts; it is not setup. It does mean the command
after a Commit starts with those objects resident by the product's own doing,
as it already does today for what bind and validation read. A receipt must
declare that state and may not call that command cold. A counter of seeded
objects and bytes should be added with it so the two are never confused.

**B2, a different default allowance. Not justified by these cases.** With
the present behaviour the misses do not depend on the allowance (section 5).
It becomes a real question only with B1, or for a daemon with many more
Workspaces than four: the receipts' insert rate is about 0.07 MB of charge a
Commit and Workspace, so 8 MiB holds about 120 Workspace-Commits.

**B3, protecting entries shared by several live roots. Not justified.** No
harmful interference was found: no re-fetch after eviction in either mounted
case, 1.1% more misses in the replay from 64 MiB down to 2 MiB, and the
pressure proof shows exact bytes and progress at 3% of the working set.

**Outside these classes, for the owner:** the four objects per inode with its
own mtime are a property of the canonical format (each attribute value is a
file). A format in which mode and mtime are read with the attribute page
would remove three of every four of these objects, their Store reads and
their cache charge. That is a format change and is only named here.

## 9. Not determined

- The split of the mounted misses between command and Commit: not in a receipt.
- How many of the mounted misses of stages 2 to 5 are Commit-written objects:
  inferred from the workload source, not counted.
- The effect of either kept change on the mounted product: not run (host only).
- Contention on the cache mutex with four Workspaces: not measured.
- Resident memory of the cache against its logical charge: not measured.
- Why four mounted Workspaces miss slightly more than four times one in
  windows 2 and 4 to 7: the two cases are different workload families, and
  concurrent second fetches of one object (section 4) are a possible part.

## 10. Reproduce

From the worktree root, each command under a 120 s limit:

```sh
export CARGO_BUILD_JOBS=2 CARGO_TARGET_DIR=core/target/issue320/host LAYERFS_CONSTRUCTION_WORKERS=1
cargo +1.85.1 test --locked --manifest-path core/Cargo.toml -p layerfs-daemon \
  --test shared_cache_branches --test shared_cache_pressure -- --nocapture
cargo +1.85.1 test --locked --manifest-path core/Cargo.toml -p layerfs-workspace \
  --test shared_cache_client -- --nocapture
# workspaces,steps,allowance_kib,mode  (mode 1: base read first; 2: seeding emulated)
SHARED_CACHE_REPLAY=4,100,8192,0 cargo +1.85.1 test --locked --manifest-path core/Cargo.toml \
  -p layerfs-daemon --test shared_cache_replay -- --nocapture
```

Checks at `8081d23f9` on the host: `layerfs-workspace` 33 test binaries PASS;
`layerfs-fuse` 5 PASS; `layerfs-daemon` 90 of 92 PASS (`host_handoff` not run:
it drives Docker; one test of `complete_installed_roots` needs
`LAYERFS_Q1_PREPARED`); Clippy with warnings denied for `layerfs-workspace`
and the new daemon targets; rustfmt; product boundary guard. Mounted and
Linux-only tests: not run.
