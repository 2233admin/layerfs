# #352 · Git rule for a range iteration (from P3, F-031)

> **Status:** approved by the owner 2026-10-19, for ranges from P3 on. It
> applies [F031_DESIGN.md](F031_DESIGN.md) with the owner's decisions of
> 2026-10-19: porcelain lanes (Q3), status and diff before every lane commit,
> Q1, Q2 and Q4–Q6 as recommended, Q7 declined, Q8 measured first. The
> porcelain lanes are not built yet; the builder implements them in
> `gitlanes.mjs` next. The range cycles it extends are
> [SPEC §2, "The two nested cycles"](SPEC.md#the-two-nested-cycles).

Each range carries a real `.git`. All lanes share one `.git`, so only one
writer may own each of its single files (`HEAD`, `refs/heads/main`,
`.git/index`, packs).

## Git steps in the cycles

SPEC §2's outer and inner cycles add these git steps:

| Cycle step | Who, where | Git commands | Writes under `.git` |
| --- | --- | --- | --- |
| Outer 1, first P3 range only: *seed* | lead, one-shot Workspace on the lead Branch | pack reachable from `6e5c908a1`, `read-tree HEAD`, `update-index --refresh`, checks | everything in the seed |
| Inner 1–2, after each step that changes tracked files: *lane commit* | the step's agent, a new one-shot Workspace on the lane Branch, one at a time per lane | with `GIT_DIR=.git/worktrees/<lane> GIT_WORK_TREE=.`: `git status --porcelain` and `git diff --stat` (no optional locks), then `git add -f` and `git rm --cached` of the step's paths, then porcelain `git commit -m`. On the lane's first step, first: the worktree folder, `update-ref refs/heads/lanes/<lane>` to the range base, `read-tree HEAD`, `update-index --refresh` | loose objects; `worktrees/<lane>/` (`HEAD`, `commondir`, `gitdir`, `index`, `COMMIT_EDITMSG`); `refs/heads/lanes/<lane>` |
| Outer 3, after every lane merge and the reconcile: *lead writes main* | lead, one one-shot Workspace on the merged Branch, one Commit | per dsh commit in topological order: `read-tree <parent>` when needed, `update-index --index-info`, `write-tree`, `commit-tree` with the original metadata and parents; then `update-ref main`, the index rebuild, `repack -d`, the lane refs and `.git/worktrees/` deleted | the range's pack, `.git/index`, `refs/heads/main`; loose objects, lane refs and worktree folders removed |
| Outer 4: *verify* | lead, then a fresh one-shot Workspace (discarded) | `rev-parse HEAD`, `git status --porcelain` with trace2 | nothing |

## Rules

- **Lanes run real `git add` and porcelain `git commit`, each in its own
  linked worktree (owner, Q3).**
  - Each lane has `.git/worktrees/<lane>/` with its own `HEAD`
    (`ref: refs/heads/lanes/<lane>`) and `index`, and a `commondir`, so
    objects and refs are shared.
  - Its git runs with `GIT_DIR=.git/worktrees/<lane> GIT_WORK_TREE=.`. A
    commit there moves only the lane's ref and writes only the lane's
    folder, never the shared `HEAD`, `main` or `.git/index`.
  - Reflogs stay off. Lane commits get new ids and are never compared with
    dsh's.
- **`git status --porcelain` and `git diff --stat` before every lane
  commit (owner).** Both run with `GIT_OPTIONAL_LOCKS=0`, so they write
  nothing and add nothing to the Store. Each is timed on its own in the
  trace.
- **Only the lead writes `main`, the index and packs, once per range, after
  every merge.** It writes every dsh commit, merges included: one git commit
  per dsh commit, never a squash. It uses neither `git add` nor `git commit`:
  - intermediate versions are no longer on disk, so it sets each commit's
    index from dsh's blob ids;
  - `commit-tree` takes the exact parents, author, committer, dates and
    message, so ids equal dsh's.
- **Blobs come from real bytes.** A lane's `git add` hashes what is in the
  Workspace. It is followed by `git add --renormalize` of the same paths, which
  hashes them whatever their stat data says. A one-shot Workspace's index can
  come from a lane commit that mounted before the lane's previous write landed
  and was merged after it. When that write kept the file's size, inode and
  second, the stale entry's stat data matches, and the index is newer than the
  entry, so git does not treat it as racy. Plain `git add` then keeps the old
  blob. This happened in `f031-r1-slice-g` at `r015.s0013`: blob `e70f8059`
  was never written, and the lead's `write-tree` stopped. git 2.39.5
  reproduces it natively (`~/lfs-history/dev/git-object-r015-20261019/`).
  LayerFS merged correctly; git's stat cache assumes one index on one
  timeline. Blobs no step wrote come from one native pack by real
  `git unpack-objects`, counted apart.
- **No lane writes a shared single file.** Auto-gc, auto-maintenance and
  reflogs are off in the seed, recorded departures from git defaults. The
  lane guard (F031_DESIGN A4) allows a lane, exactly:
  - new loose objects (`objects/<xx>/<38 hex>` and their folders);
  - `worktrees/<lane>/` with `HEAD`, `commondir`, `gitdir`, `index` and
    `COMMIT_EDITMSG`;
  - `refs/heads/lanes/<lane>`.

  Any other content change under `.git` stops the range before the lane's
  merge. git also refreshes the shared seed pack's mtime on `git add`; that
  mtime-only change is not committed (§4.8), so the guard does not see it.
- **Merges get no special rule for `.git`.** Equal loose objects from two
  lanes merge cleanly, and lanes' worktree folders and refs have different
  names. Any conflict under `.git` is a stop finding (D0), never resolved.
  `/.lww` never decides a `.git` path: the replay appends `!/.git` as the
  last generated rule (Q1).
- **`git status` is clean only at the checkpoint.** Before the lead's step,
  `HEAD` is the previous checkpoint while the tree holds the range's changes.
  At the checkpoint, HEAD must equal the checkpoint commit and its tree
  dsh's tree, and `git status --porcelain` must be empty. In a fresh mount,
  git must also read back no tracked file (`refresh/sum_scan` = 0).
- **The lead runs `git clean -f` before the status checks** (decision B,
  liaison 2026-10-19 under the owner's delegation for ranges 16–20). It removes
  untracked, unignored files only: never `-x` (ignored files and
  `node_modules` stay) and never `-d` (untracked folders stay). A lane's build
  can emit beside its sources on a tree the plan's lane split makes, and the
  lead's merge carries every file of a Branch into main. In r016.a1, dsh
  `72bb02e68e`'s move was split over two lanes, leaving 116 untracked `tsc`
  outputs; natively the same tree writes the same files. Each range records the
  removed files' count, bytes and paths (`git.lead.cleaned`). The step stops if
  any of them is tracked or ignored, or one is left. The native repair chain
  runs the same clean on the checkpoint tree (NODE_RULE §6). Range 15 had
  nothing untracked at its checkpoint, so it is unchanged and the series stays
  comparable.
- **Every git exec stays at or under 120 s.** A git range is played in two
  commands (SCRIPTS.md, "The P3 command shape").


## Expected load per range (estimate, ranges 15–20)

Estimated 2026-10-19 from the frozen plans (`~/lfs-history/plan`) and
`dsh.git` only, with the replay's own `leadJob`. Nothing was played and no
LayerFS figure is measured; the dev range measures them (F031_DESIGN A6).
MB here is 1,000,000 bytes.

### Git operations

| Range | Lanes / agents | Lane git execs | Lane git processes | Lane lstat (status, diff, commit refresh) | dsh commits (merges) | Lead `read-tree` | Lead git processes | All git processes | Extra Workspaces and Commits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | 3 / 8 | 123 | 510 | ~478k (native: 499k) | 191 (124) | 53 | 641 | 1,152 | 125 |
| 16 | 4 / 10 | 175 | 723 | ~743k | 188 (100) | 35 | 614 | 1,338 | 177 |
| 17 | 3 / 8 | 105 | 434 | ~482k | 122 (62) | 31 | 411 | 846 | 107 |
| 18 | 3 / 8 | 134 | 554 | ~650k | 150 (83) | 34 | 501 | 1,056 | 136 |
| 19 | 4 / 10 | 125 | 517 | ~627k | 360 (279) | 281 | 1,367 | 1,885 | 127 |
| 20 | 3 / 8 | 83 | 347 | ~418k | 335 (275) | 235 | 1,233 | 1,581 | 85 |
| 15–20 | | 745 | 3,085 | ~3.4M | 1,346 (923) | 669 | 4,767 | 7,858 | 757 |

How the counts are made:
- **A lane git exec** (porcelain, Q3) runs:
  - `git status --porcelain` and `git diff --stat`;
  - `git add` once, with all the step's paths (decoys included);
  - `git rm --cached` when the step removes files;
  - `git commit`;
  - on a lane's first step, also `rev-parse`, `update-ref`, `read-tree` and
    `update-index --refresh` to set up its worktree.
- **Lane lstat:** git's index refresh stats every tracked file in each of
  `status`, `diff` and `commit`, about 3 × the index's entries per exec
  (1,261–1,686 entries over ranges 15–20). Range 15's native run counted
  499k.
- **The lead**, for each dsh commit, runs `write-tree` and `commit-tree`,
  plus `update-index --index-info` and a `read-tree` when the previous
  commit written is not its first parent. Then one `unpack-objects` and
  about 16 finish commands.
- **Extra Workspaces and Commits:** the lane execs, plus the lead's and the
  fresh check's (the latter discarded).

The lane share is steady at 83–175 execs. The lead's share follows dsh's
merges: ranges 19–20 are mostly merges with a first parent other than the
previous commit written, so most of their commits need a `read-tree`.

### Git commits against LayerFS Commits

Git never runs per LayerFS Commit. A lane git exec runs once per plan
step that changes tracked files, after the step lands:
- **An fs step** is one agent's batch of `fs.write` and `fs.rm` calls for
  its part of one dsh commit. Each call is its own LayerFS Commit. The step
  gets one git exec, with all its paths in one `git add`.
- **An `apply` step** is one one-shot Workspace and one Commit, followed by
  one git exec when it changed tracked files.
- **`check` steps** answer UpToDate and get no git exec.

Ranges 0–14 (P1–P2) ran without `.git`, so no range has played git yet.
Every figure below comes from the plans.

| Range | dsh commits replayed | dsh merges | Plan steps | fs calls (each a LayerFS Commit) | Sandbox Commit steps | Lane git commits | Lead git commits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | 67 | 124 | 177 | 1,400 | 103 | 123 | 191 |
| 16 | 88 | 100 | 257 | 1,029 | 139 | 175 | 188 |
| 17 | 60 | 62 | 151 | 466 | 71 | 105 | 122 |
| 18 | 67 | 83 | 183 | 910 | 98 | 134 | 150 |
| 19 | 81 | 279 | 184 | 368 | 86 | 125 | 360 |
| 20 | 60 | 275 | 125 | 280 | 63 | 83 | 335 |

Range 14, played without git, for scale: 79 dsh commits, 1,112 fs
Commits, 1,163 LayerFS Commits in all ([range-014](ranges/range-014.md)).

Why the git counts differ:
- **Lane git commits exceed the dsh commits replayed** (about 1.4–2×). The
  frozen plan splits a dsh commit over about 2 lanes (up to 4), so it
  becomes one step, and one lane git commit, per lane that holds part of it.
- **Lead git commits** are every dsh commit in the range, merges included:
  the replayed commits plus dsh's merges. Without the merges, HEAD would not
  be dsh's checkpoint.

**Expected lane commit count (owner, 2026-10-19).** Lane git commits per
range are about lanes × dsh commits replayed × 0.3–0.7. The plans give:

| Range | Lanes × dsh commits | Expected (0.3–0.7) | Lane git commits | Ratio |
| --- | --- | --- | --- | --- |
| 15 | 3 × 67 = 201 | 60–141 | 123 | 0.61 |
| 16 | 4 × 88 = 352 | 106–246 | 175 | 0.50 |
| 17 | 3 × 60 = 180 | 54–126 | 105 | 0.58 |
| 18 | 3 × 67 = 201 | 60–141 | 134 | 0.67 |
| 19 | 4 × 81 = 324 | 97–227 | 125 | 0.39 |
| 20 | 3 × 60 = 180 | 54–126 | 83 | 0.46 |

All six are inside the band. The ratio is the share of lanes a dsh commit
touches. A played range whose lane git commit count falls outside the band
is a finding about the plan or the player, recorded and not hidden.

The owner keeps the lane commits: F031_DESIGN Q7 (one git commit per dsh
commit, no lane commits) is declined.

### Sizes

| Range | Blobs lanes add (loose) | Blobs no step wrote: count, loose / shipped pack | dsh trees (loose) | dsh commits (loose) | Range pack after `repack -d` | `.git/index` at checkpoint | Lane index rewrites (raw) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | 1,502, 6.81 MB | 600, 4.50 / 1.34 MB | 2,540, 0.93 MB | 191, 0.05 MB | 3.95 MB | 0.17 MB | 19.86 MB |
| 16 | 1,058, 4.99 MB | 996, 7.49 / 2.09 MB | 2,401, 0.93 MB | 188, 0.06 MB | 3.52 MB | 0.19 MB | 30.86 MB |
| 17 | 510, 2.74 MB | 633, 5.33 / 1.20 MB | 1,595, 0.64 MB | 122, 0.04 MB | 2.07 MB | 0.20 MB | 20.06 MB |
| 18 | 973, 5.06 MB | 1,102, 6.67 / 2.27 MB | 2,781, 1.09 MB | 150, 0.04 MB | 4.00 MB | 0.21 MB | 27.00 MB |
| 19 | 391, 2.26 MB | 451, 3.59 / 1.26 MB | 2,545, 1.19 MB | 360, 0.09 MB | 2.12 MB | 0.21 MB | 25.99 MB |
| 20 | 264, 1.49 MB | 438, 3.93 / 0.78 MB | 2,009, 1.05 MB | 335, 0.08 MB | 1.44 MB | 0.21 MB | 17.35 MB |
| 15–20 | 4,698, 23.35 MB | 4,220, 31.51 / 8.94 MB | 13,871, 5.83 MB | 1,346, 0.36 MB | 17.10 MB | | 141.1 MB |

Method:
- **Loose bytes** are each object zlib-compressed at level 1, git's default
  `core.looseCompression`.
- **The range pack** is `pack-objects` of the range's dsh objects, with
  deltas only among them, as `repack -d` packs only loose objects. Lane
  commits and their trees are not in these figures; they are of the same
  order as the dsh trees.
- **Lane index rewrites** are the lane execs times the mean of the two
  checkpoints' index sizes. Each lane commit rewrites its worktree's whole
  index; the native porcelain run ended at 158–162 KB per lane index. How
  well these deduplicate in the Store is Q8, measured first on the dev
  range.

### What the Store keeps per range (estimate)

Only committed bytes reach the Store:
- **The lanes' loose blobs**, about 1.5–6.8 MB, plus lane trees and
  commits. Each lane Commit holds them, so history keeps them after the
  repack deletes them from the live tree.
- **The lane index rewrites**: 17–31 MB raw. How much CDC deduplicates is
  unknown, so this is the widest term (Q8). The worktree folder's other
  files (`HEAD`, `commondir`, `gitdir`, `COMMIT_EDITMSG`) are under 200 B
  each.
- **The shipped pack of blobs no step wrote**, 0.8–2.3 MB, and the job
  file. Both are committed by `fs.apply`, then removed.
- **The range pack**, 1.4–4.0 MB, and one `.git/index` of about 0.2 MB.

Some loose objects are never committed: the lead's unpacked blobs and its
dsh trees and commits are written and packed inside one Workspace before its
Commit.

For range 15 that gives about 12–13 MB with every lane index fully
deduplicated, and up to about 33 MB with none deduplicated. For
comparison, range 14, without `.git`, stored 7.8 MiB new (RANGES.md).

### Differences from Part B's table in F031_DESIGN

- **Loose bytes:** Part B used zlib level 6; git's default for loose objects
  is level 1. The ranges' loose total is 61.0 MB here against 55.6 MB.
- **Range pack:** 17.1 MB here against 13.0 MB. Part B's packing parameters
  are not recorded.
- **Blobs no step wrote** (600 against 403 in range 15): this table counts
  every blob new in the range that no plan step writes. Part B's set was
  not recorded. The dev range's `missing` counter settles it.

## Native baseline (range 15, measured 2026-10-19)

Range 15's git work run natively in the replay's runtime image, without
LayerFS. It is the floor for the FUSE ÷ native ratios of the dev range.
Diagnostic only: one sample per phase, nothing rerun.

- **Image and versions:** `layerfs-352-runtime:node24`, `sha256:d3773b4e…`
  (the image the replay's runs use); git 2.39.5, node 24.21.0; aarch64,
  8 CPUs.
- **File system and cache:** the container's own overlay file system. The
  page cache is warm, since each step's files were written just before its
  git exec, as in the replay.
- **Load:** host 1-minute load 8.1–8.5; the Docker VM's own load 2.4–2.7.
- **Commands:** the replay's own generators (`laneCommands`, `leadJob`,
  `LEAD_WRITER`, `finishScript`, `statusProbe`, at `9ec613e9e`, unchanged
  from staging).
- **Receipts:** `~/lfs-history/evidence/f031-native-baseline-r015-20261019/`
  (results, `prep.mjs`, `driver.mjs`, `IDENTITY.txt`).

The first lane measurement used the built plumbing lanes. After the owner
changed Q3, the lanes were measured once more with porcelain lanes
(below). The lead is plumbing in both.

Departures from the replay:
- **Lanes run one after another**, each on its own copy of the seeded
  repository, not concurrently on Branches.
- **The lead's repository** gets the lanes' blobs by `unpack-objects`
  (untimed: in the replay they arrive by the merges) but not the lane
  commits and their trees, so its repack packs a little less.
- **The "fresh" status** runs a second time in the same container, not
  after a remount.

| Stage | Count | Native time |
| --- | --- | --- |
| Seed index (`read-tree HEAD`, `update-index --refresh`, checks, status) | 1 | 116 ms (refresh 33 ms) |
| Plumbing lane git exec (superseded), whole command list | 123 | sum 4.00 s · p50 26.5 ms · p90 60.8 ms · max 158.8 ms |
| of which git (the script's own timer) | 123 | sum 2.54 s · p50 17 ms · p90 28 ms · max 151 ms |
| Plumbing lane `git status --porcelain` (one in ten) | 13 | p50 29 ms · max 56 ms |
| Per plumbing lane (42 / 39 / 42 execs) | 3 | 1.33 / 1.34 / 1.34 s |
| Lead: `unpack-objects` of 600 blobs no step wrote | 1 | 311 ms |
| Lead writer: 191 dsh commits (124 merges), 53 `read-tree`, one exec | 191 | 4.38 s (22.9 ms per commit) |
| Lead finish: `update-ref`, index rebuild (refresh 39 ms), `repack -d` (800 ms), checks, status | 1 | 0.99 s |
| Second `git status` | 1 | 14 ms (status 6 ms) |
| **Lead total** | | **5.7 s** |

Results:
- **The proof held.** Every tree and commit the writer printed equalled
  dsh's. HEAD = `b4ec4060a`, `rev-list --count` = 191, both statuses were
  empty, and the lanes' private indexes ended at 158–162 KB.
- **The repack** packed 4,825 loose objects into one 2.93 MB pack and a
  0.14 MB index, leaving 0 loose.
- **`.git/index`** is 165,931 B.

### Porcelain lanes (owner Q3, measured 2026-10-19)

The same 123 lane steps, re-measured once with the porcelain lanes: a
linked worktree per lane, then `git status --porcelain` and
`git diff --stat` (no optional locks), `git add`, `git rm --cached` and
porcelain `git commit -m`. Each command is timed inside the exec. The
commands are the baseline driver's (`driver.mjs`, phase `lanes-porcelain`),
since `gitlanes.mjs` has no porcelain lanes yet; the builder's
implementation must match them. Host
load 8.2; the Docker VM's 0.4–0.9.
- **Receipt:** `results-lanes-porcelain.json`.
- **A first run lost the status and diff times to a driver redirect bug.**
  Its receipt is kept (`…-run1-timerbug.json`) and not compared.

| Command per lane exec | Count | Native p50 · p90 · max | Sum | lstat per call (p50) |
| --- | --- | --- | --- | --- |
| Worktree setup (first step of a lane) | 3 | 42.4 · 47.0 · 47.0 ms | 0.13 s | — |
| `git status --porcelain` | 123 | 8.0 · 12.0 · 13.4 ms | 1.05 s | 1,333 |
| `git diff --stat` | 123 | 6.1 · 11.9 · 32.0 ms | 0.96 s | 1,280 |
| `git add -f` (1.8 ms per path p50) | 123 | 6.1 · 13.1 · 49.5 ms | 1.05 s | — |
| `git rm --cached` | 6 | 3.8 · 5.8 · 5.8 ms | 0.02 s | — |
| `git commit -q -m` | 123 | 7.3 · 12.5 · 17.5 ms | 1.03 s | 1,344 |
| **Git per exec** (sum of the above / 123) | 123 | mean 33.4 ms | 4.11 s | ~3,960 |

Results:
- **Each lane wrote exactly the A4 set** under `.git`, plus new loose
  objects (972, 984 and 1,083):
  - `refs/heads/lanes/<lane>`;
  - `worktrees/<lane>/HEAD`, `commondir`, `gitdir`, `index` and
    `COMMIT_EDITMSG`.
- **The shared `.git/index` was unchanged.**
- **`git add` refreshed the seed pack's mtime**, git's freshen; its sha1
  was unchanged. LayerFS does not commit an mtime-only change (§4.8).
- **The commit's refresh read back no file** (`refresh/sum_scan` 0 in all
  123).
- **The lane worktree indexes ended at 158–162 KB.**
- **Git costs about 1.6× plumbing per exec**: a mean of 33.4 ms against the
  plumbing script's 20.6 ms. Most of the difference is the three index
  walks (`status`, `diff`, `commit`), about 3,960 lstats per exec.

The exec's own total (p50 44.8 ms) includes the trace2 bookkeeping added
for the lstat counts, so the table uses the per-command times.

### What to expect on LayerFS (estimate)

- **A porcelain lane git exec** is one more one-shot Workspace. On range 14
  that costs 128 ms p50 (mount, exec, Commit, unmount), plus about 3,960
  lstats over FUSE in a fresh mount, plus the native git work above.
  - The first index walk in a new mount pays the kernel's cold entry and
    attribute cache: about 1,300 LOOKUP and GETATTR round trips, about
    0.13 ms each at F-032's per-op timings, so about 170 ms.
  - The `diff` and `commit` walks cost as little again, or as much, depending
    on how long the kernel keeps those entries and attributes.

  Expect about 300–700 ms p50 per exec. For range 15's 123 execs that is
  about 40–85 s summed and 13–30 s per lane, overlapping other agents'
  steps. This is the largest new cost, and it presses on the
  `play --until lanes` command's 118 s limit. The dev range's per-command
  series measure it. The plumbing estimate of 150–250 ms is superseded.
- **The lead writer** keeps its index in `/tmp`, but every tree and commit
  it writes is a new loose file over FUSE. The repack then deletes 4,825
  loose files and their fan-out folders over FUSE. That is the F-032
  pattern: about 0.7 ms per entry before #356, so about 3–4 s for the
  deletions alone. Expect the lead stage at about 10–20 s, against 5.7 s
  native.

### Finding: the stat probe under-counts lstat

In git 2.39, `git status` stats the index entries in its preload threads,
reported as `index/preload/sum_lstat` (1,261 at the seed). `refresh/sum_lstat`
counts only what preload left: 1 after one `touch`, where git stat-ed 1,261.
`statusProbe` reads only `refresh/sum_lstat`, so its `@@sumLstat` is too
low. `refresh/sum_scan`, the count the fresh check judges, is correct: 1
after a `touch`, 0 here. Builder item before the dev range (owner,
2026-10-19): add `preload/sum_lstat` to `@@sumLstat`. It changes no
verdict. The porcelain run above already sums both keys.
