# #352 · Git rule for a range iteration (from P3, F-031)

> **Status:** current rule, 2026-10-19, for ranges from P3 on. It applies the
> owner-approved option (c) of [F031_DESIGN.md](F031_DESIGN.md). The design's
> revision 3 questions Q1–Q6 are open (Q7 declined), so the lane guard and the `/.lww`
> exclusion below wait for the owner's answers. The range cycles it extends
> are [SPEC §2, "The two nested cycles"](SPEC.md#the-two-nested-cycles).

Each range carries a real `.git`. All lanes share one `.git`, so only one
writer may own each of its single files (`HEAD`, `refs/heads/main`,
`.git/index`, packs).

## Git steps in the cycles

SPEC §2's outer and inner cycles add these git steps:

| Cycle step | Who, where | Git commands | Writes under `.git` |
| --- | --- | --- | --- |
| Outer 1, first P3 range only: *seed* | lead, one-shot Workspace on the lead Branch | pack reachable from `6e5c908a1`, `read-tree HEAD`, `update-index --refresh`, checks | everything in the seed |
| Inner 1–2, after each step that changes tracked files: *lane commit* | the step's agent, a new one-shot Workspace on the lane Branch, one at a time per lane | `git add -f` and `git rm --cached` of the step's paths with the lane's private index (`read-tree HEAD` on its first step), then `write-tree`, `commit-tree`, `update-ref` | loose objects, `lanes/<lane>/index`, `refs/heads/lanes/<lane>` |
| Inner, one step in ten | the same exec | `git status --porcelain` without optional locks | nothing |
| Outer 3, after every lane merge and the reconcile: *lead writes main* | lead, one one-shot Workspace on the merged Branch, one Commit | per dsh commit in topological order: `read-tree <parent>` when needed, `update-index --index-info`, `write-tree`, `commit-tree` with the original metadata and parents; then `update-ref main`, the index rebuild, `repack -d`, lane refs and indexes deleted | the range's pack, `.git/index`, `refs/heads/main`; loose objects removed |
| Outer 4: *verify* | lead, then a fresh one-shot Workspace (discarded) | `rev-parse HEAD`, `git status --porcelain` with trace2 | nothing |

## Rules

- **Lanes run real `git add`, never porcelain `git commit`.** With one shared
  `HEAD`, `git commit` would move `main` (and write its reflogs) in every
  lane, and every lane merge would conflict on those files. Plumbing moves
  only the lane's own ref. Lane commits get new ids. They are never
  compared with dsh's.
- **Only the lead writes `main`, the index and packs, once per range, after
  every merge.** It writes every dsh commit, merges included: one git commit
  per dsh commit, never a squash. It uses neither `git add` nor `git commit`:
  - intermediate versions are no longer on disk, so it sets each commit's
    index from dsh's blob ids;
  - `commit-tree` takes the exact parents, author, committer, dates and
    message, so ids equal dsh's.
- **Blobs come from real bytes.** A lane's `git add` hashes what is in the
  Workspace. Blobs no step wrote come from one native pack by real
  `git unpack-objects`, counted apart.
- **No lane writes a shared single file.** Auto-gc, auto-maintenance and
  reflogs are off in the seed, recorded departures from git defaults. A lane
  that changes anything under `.git` except its loose objects, its own index
  and its own ref stops the range before its merge (the lane guard,
  F031_DESIGN A4).
- **Merges get no special rule for `.git`.** Equal loose objects from two
  lanes merge cleanly. Any conflict under `.git` is a stop finding (D0),
  never resolved. `/.lww` never decides a `.git` path (Q1).
- **`git status` is clean only at the checkpoint.** Before the lead's step,
  `HEAD` is the previous checkpoint while the tree holds the range's changes.
  At the checkpoint, HEAD must equal the checkpoint commit and its tree
  dsh's tree, and `git status --porcelain` must be empty. In a fresh mount,
  git must also read back no tracked file (`refresh/sum_scan` = 0).
- **Every git exec stays at or under 120 s.** A git range is played in two
  commands (SCRIPTS.md, "The P3 command shape").


## Expected load per range (estimate, ranges 15–20)

Estimated 2026-10-19 from the frozen plans (`~/lfs-history/plan`) and
`dsh.git` only, with the replay's own `leadJob`. Nothing was played and no
LayerFS figure is measured; the dev range measures them (F031_DESIGN A6).
MB here is 1,000,000 bytes.

### Git operations

| Range | Lanes / agents | Lane git execs | Lane git processes | dsh commits (merges) | Lead `read-tree` | Lead git processes | All git processes | Extra Workspaces and Commits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | 3 / 8 | 122 | 635 | 191 (124) | 53 | 641 | 1,277 | 124 |
| 16 | 4 / 10 | 174 | 901 | 188 (100) | 35 | 614 | 1,516 | 176 |
| 17 | 3 / 8 | 104 | 540 | 122 (62) | 31 | 411 | 952 | 106 |
| 18 | 3 / 8 | 133 | 689 | 150 (83) | 34 | 501 | 1,191 | 135 |
| 19 | 4 / 10 | 124 | 641 | 360 (279) | 281 | 1,367 | 2,009 | 126 |
| 20 | 3 / 8 | 82 | 426 | 335 (275) | 235 | 1,233 | 1,660 | 84 |
| 15–20 | | 739 | 3,832 | 1,346 (923) | 669 | 4,767 | 8,605 | 751 |

How the counts are made:
- **A lane git exec** runs:
  - `git add` once, with all the step's paths;
  - `git rm --cached` when the step removes files;
  - `write-tree`, `rev-parse`, `commit-tree` and `update-ref`;
  - on a lane's first step, one more `read-tree` and `rev-parse`;
  - on one step in ten, `git status`.
- **The lead**, for each dsh commit, runs `write-tree` and `commit-tree`,
  plus `update-index --index-info` and a `read-tree` when the previous
  commit written is not its first parent. Then one `unpack-objects` and
  about 16 finish commands.
- **Extra Workspaces and Commits:** the lane execs, plus the lead's and the
  fresh check's (the latter discarded).

The lane share is steady at 82–174 execs. The lead's share follows dsh's
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
| 15 | 67 | 124 | 177 | 1,400 | 103 | 122 | 191 |
| 16 | 88 | 100 | 257 | 1,029 | 139 | 174 | 188 |
| 17 | 60 | 62 | 151 | 466 | 71 | 104 | 122 |
| 18 | 67 | 83 | 183 | 910 | 98 | 133 | 150 |
| 19 | 81 | 279 | 184 | 368 | 86 | 124 | 360 |
| 20 | 60 | 275 | 125 | 280 | 63 | 82 | 335 |

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
| 15 | 3 × 67 = 201 | 60–141 | 122 | 0.61 |
| 16 | 4 × 88 = 352 | 106–246 | 174 | 0.49 |
| 17 | 3 × 60 = 180 | 54–126 | 104 | 0.58 |
| 18 | 3 × 67 = 201 | 60–141 | 133 | 0.66 |
| 19 | 4 × 81 = 324 | 97–227 | 124 | 0.38 |
| 20 | 3 × 60 = 180 | 54–126 | 82 | 0.46 |

All six are inside the band. The ratio is the share of lanes a dsh commit
touches. A played range whose lane git commit count falls outside the band
is a finding about the plan or the player, recorded and not hidden.

The owner keeps the lane commits: F031_DESIGN Q7 (one git commit per dsh
commit, no lane commits) is declined.

### Sizes

| Range | Blobs lanes add (loose) | Blobs no step wrote: count, loose / shipped pack | dsh trees (loose) | dsh commits (loose) | Range pack after `repack -d` | `.git/index` at checkpoint | Lane index rewrites (raw) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | 1,502, 6.81 MB | 600, 4.50 / 1.34 MB | 2,540, 0.93 MB | 191, 0.05 MB | 3.95 MB | 0.17 MB | 19.70 MB |
| 16 | 1,058, 4.99 MB | 996, 7.49 / 2.09 MB | 2,401, 0.93 MB | 188, 0.06 MB | 3.52 MB | 0.19 MB | 30.68 MB |
| 17 | 510, 2.74 MB | 633, 5.33 / 1.20 MB | 1,595, 0.64 MB | 122, 0.04 MB | 2.07 MB | 0.20 MB | 19.87 MB |
| 18 | 973, 5.06 MB | 1,102, 6.67 / 2.27 MB | 2,781, 1.09 MB | 150, 0.04 MB | 4.00 MB | 0.21 MB | 26.80 MB |
| 19 | 391, 2.26 MB | 451, 3.59 / 1.26 MB | 2,545, 1.19 MB | 360, 0.09 MB | 2.12 MB | 0.21 MB | 25.78 MB |
| 20 | 264, 1.49 MB | 438, 3.93 / 0.78 MB | 2,009, 1.05 MB | 335, 0.08 MB | 1.44 MB | 0.21 MB | 17.14 MB |
| 15–20 | 4,698, 23.35 MB | 4,220, 31.51 / 8.94 MB | 13,871, 5.83 MB | 1,346, 0.36 MB | 17.10 MB | | 140.0 MB |

Method:
- **Loose bytes** are each object zlib-compressed at level 1, git's default
  `core.looseCompression`.
- **The range pack** is `pack-objects` of the range's dsh objects, with
  deltas only among them, as `repack -d` packs only loose objects. Lane
  commits and their trees are not in these figures; they are of the same
  order as the dsh trees.
- **Lane index rewrites** are the lane execs times the mean of the two
  checkpoints' index sizes. Each lane exec rewrites its whole private index.

### What the Store keeps per range (estimate)

Only committed bytes reach the Store:
- **The lanes' loose blobs**, about 1.5–6.8 MB, plus lane trees and
  commits. Each lane Commit holds them, so history keeps them after the
  repack deletes them from the live tree.
- **The lane index rewrites**: 17–31 MB raw. How much CDC deduplicates is
  unknown, so this is the widest term.
- **The shipped pack of blobs no step wrote**, 0.8–2.3 MB, and the job
  file. Both are committed by `fs.apply`, then removed.
- **The range pack**, 1.4–4.0 MB, and one `.git/index` of about 0.2 MB.

Some loose objects are never committed: the lead's unpacked blobs and its
dsh trees and commits are written and packed inside one Workspace before its
Commit.

For range 15 that gives about 12–13 MB with every lane index fully
deduplicated, and up to about 33 MB with none deduplicated. For comparison, range 14, without `.git`, stored 7.8 MiB
new (RANGES.md).

### Differences from Part B's table in F031_DESIGN

- **Loose bytes:** Part B used zlib level 6; git's default for loose objects
  is level 1. The ranges' loose total is 61.0 MB here against 55.6 MB.
- **Range pack:** 17.1 MB here against 13.0 MB. Part B's packing parameters
  are not recorded.
- **Blobs no step wrote** (600 against 403 in range 15): this table counts
  every blob new in the range that no plan step writes. Part B's set was
  not recorded. The dev range's `missing` counter settles it.
