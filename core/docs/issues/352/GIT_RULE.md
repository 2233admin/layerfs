# #352 · Git rule for a range iteration (from P3, F-031)

> **Status:** current rule, 2026-10-19, for ranges from P3 on. It applies the
> owner-approved option (c) of [F031_DESIGN.md](F031_DESIGN.md). The design's
> revision 3 questions Q1–Q6 are open, so the lane guard and the `/.lww`
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

