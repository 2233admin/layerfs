# F-031 design · `.git` in Workspaces from P3

> **Status:** proposal (builder, 2026-10-18), for owner approval under the
> F-031 design gate ([BUGS.md F-031](BUGS.md), [SPEC §2](SPEC.md)). Not built.
> No measured play uses it until it is approved and proved on a dev range.

## The constraint that shapes it

`.git/index`, `HEAD`, the branch refs, `logs/`, `ORIG_HEAD` and packs are
single files that every `git commit` rewrites. If each lane ran `git add` and
`git commit` on its own LayerFS Branch, every lane merge would conflict on
them. There is no correct automatic resolution for an index or a pack, and the
replay has no retries or guessed resolutions.

A lane's tree is also not the dsh commit's tree. A lane holds main's tree at
the range start plus its own side branches' changes, while a side-branch
commit's tree is its own parent's tree plus its change. So `git write-tree`
in a lane gives a different tree, the commit gets a different id, and HEAD
could never equal the checkpoint. The SPEC §2 cadence ("`git add` then
`git commit` ... where the history allows it") therefore cannot reach its own
proof.

So the design splits `.git` by what can merge:
- **Objects** are content-addressed and only ever added. Lanes write them.
- **The single files** are written only by the lead, once per range, after
  every merge.

## 1. How lanes commit

There is one git exec per replayed dsh commit, by the agent that replayed it,
in a one-shot Workspace on its lane Branch, right after the step's files land.
It gets its own LayerFS Commit, so every replayed dsh commit adds one exec and
one Commit, as SPEC §2 "Counts change" expects. The exec runs real git over
FUSE:

1. `git hash-object -w` on each path the commit changed, run in the
   Workspace. Each printed id must equal the plan's blob id, which also proves
   the bytes.
2. `git hash-object -w -t tree --stdin` for each tree object the commit added,
   and `-t commit` for the commit itself. Their raw bytes come from `dsh.git`
   (`git cat-file`), sent like Sandbox file bytes (base64 chunks into the
   step's own `/tmp` scratch). Copying the raw commit keeps the message,
   author, committer, dates, signature and parents exactly, so the printed id
   equals the dsh commit id.
3. `git update-ref refs/heads/lanes/<lane> <id>`. This ref file belongs to that
   lane alone.

The lane writes nothing else under `.git`. The player checks every path a lane
Commit changed under `.git/`: anything outside `objects/` and its own
`refs/heads/lanes/<lane>` is a stop finding.

## 2. How a LayerFS merge treats `.git`

| Path | Written by | Merge outcome |
| --- | --- | --- |
| `objects/xx/<id>` (loose) | lanes, add-only | Clean. Two lanes adding the same object add identical bytes at the same path, because the same git version in the same image compresses deterministically. A conflict on any object path is a stop finding, not a resolution. |
| `refs/heads/lanes/<lane>` | its lane only | Clean: different paths. The lead deletes them at range end. |
| `index`, `HEAD`, `refs/heads/main`, `packed-refs` | the lead only, after all merges | Never changed on two sides. |
| `logs/`, `ORIG_HEAD`, `FETCH_HEAD` | nobody | The seed sets `core.logAllRefUpdates=false`, and only plumbing that writes none of them is used: no `reset`, `merge`, `pull` or `commit` porcelain. |
| packs from auto-repack or `gc` | nobody | The seed sets `gc.auto=0` and `maintenance.auto=false`, so no command repacks on its own. The seed's one pack stays as is. |
| `objects/pack/pack-<id>.*` of a range | the lead only, after all merges (§3) | Never changed on two sides. The lane Branches are done by then. |

Any LayerFS merge conflict under `.git/` is a stop finding (D0), never
resolved by rule.

## 3. dsh merge commits with their original parents

dsh's merge commits are reconciled by the lead, not replayed (§P0). The lead's
end-of-range exec writes each merge commit of the range, in topological order,
from its raw bytes, together with any trees it adds. That includes the range's
checkpoint, which is a mainline merge. The raw bytes keep the original
parents. By then every parent object is in the lead's `.git`, from one of
three sources:
- a lane, carried in by the lane merges;
- an earlier range;
- the seed.

The same exec then:
- runs `git update-ref refs/heads/main <checkpoint>` (`HEAD` is a symbolic ref
  to `main`);
- rebuilds the index with `git read-tree HEAD` and
  `git update-index -q --refresh`, which stats every file, real FUSE work;
- deletes the lane refs;
- runs `git repack -d -q` (incremental, not `-a`). This packs the range's loose
  objects into one new pack and deletes them, so a range adds one pack and no
  loose objects. Only the lead writes it, after every lane merge, so it can't
  conflict. It is the only repack, run explicitly;
- runs `git status --porcelain`.

It has its own Commit, before the closure and the publish.

## 4. Seed

The seed is built natively from `dsh.git`. `git pack-objects --revs` packs
everything reachable from `6e5c908a1`: 1,545 commits, a 9.35 MiB pack and a
0.73 MiB pack index (lead's measurement). It goes into a fresh `.git`:
- `refs/heads/main` = `6e5c908a1`, with `HEAD` pointing to `main`;
- the config above;
- `.lfs-probe/` in `info/exclude`.

One exec in a one-shot Workspace on `main` of the P3 fork writes the seed,
then builds the index with `read-tree` and `update-index --refresh`. It is
proved by:
- `git rev-list --all` lists exactly the commits reachable from `6e5c908a1`,
  with nothing later;
- `git status --porcelain` is empty;
- `git fsck --connectivity-only` passes.

Its Commit's sizes are recorded in the fork manifest.

## 5. Proof per range

- The tree check (§7) skips `.git/`. Otherwise it is unchanged.
- The player compares each lane git exec's printed ids with the plan (blobs)
  and with `dsh.git` (trees, commit).
- At the checkpoint, the lead's exec must show:
  - `git rev-parse HEAD` = the plan's checkpoint commit;
  - `git status --porcelain` empty;
  - `git rev-list --count <previous checkpoint>..HEAD` = the range's dsh
    commit count;
  - no lane ref left.
- No LayerFS merge conflict occurred under `.git/`.
- At milestones, also `git fsck --connectivity-only`.
- In P3, the closure runs `git status --porcelain` after the install and build
  steps, and it must be empty. dsh's `.gitignore` must cover `node_modules`,
  `dist` and `tsbuildinfo`. If it doesn't, that is a finding about the
  replay's assumptions, recorded and not hidden.

## 6. Expected cost

The figures below are estimates until the dev range measures them.

- **Seed:** about 10.1 MiB once (pack and pack index, already compressed, so
  no CDC gain), plus an index of about 1.6 MiB (16k entries).
- **Per range:**
  - The range's new blobs, trees and commits, written first as loose zlib
    objects by the lanes. They don't deduplicate against the files they hold.
    The lead's `repack -d` then turns them into one delta-compressed pack of
    1.2–3.1 MiB (ranges 15–20 below, against 5.7–11.7 MiB loose). The loose
    objects live in lane Commits and the merged frontier until the repack,
    so the Store also keeps those bytes in the range's intermediate Commits.
  - One index rewrite (about 1.6 MiB raw), whose stat fields change
    throughout, so dedupe is partial.
- **Wall time:**
  - Per non-merge dsh commit: one more one-shot Workspace and exec, about
    60–100 ms today (mount + exec + Commit + unmount), times 60–88 per range
    (15–20).
  - Per range: one lead exec that writes 62–279 merge commits (15–20), reads
    every loose object for the repack, and does two full stat walks of about
    16k files over FUSE, est. 3–10 s.
- **Counts:** 60–88 more execs, Workspaces and Commits per range, plus the
  lead's one. P0 totals
  and the §5/§7 expectations are re-derived at the P3 re-baseline (SPEC §2
  "Counts change").

Measured from `dsh.git` (builder, 2026-10-18). Objects are new since the
previous checkpoint (`rev-list --objects <checkpoint> --not <previous>`).
Loose bytes are zlib level 6 of each object. Pack bytes are
`pack-objects --stdout` of the same objects.

| Range | Commits (non-merge / merge) | New objects (blobs / trees / commits) | Raw bytes | Loose bytes | Pack bytes after `repack -d` |
| --- | --- | --- | --- | --- | --- |
| 15 | 67 / 124 | 2,102 / 2,540 / 191 | 37,257,159 | 11,216,167 | 3,119,166 |
| 16 | 88 / 100 | 2,054 / 2,401 / 188 | 41,317,321 | 12,315,736 | 2,543,029 |
| 17 | 60 / 62 | 1,143 / 1,595 / 122 | 27,491,776 | 7,961,573 | 1,555,839 |
| 18 | 67 / 83 | 2,075 / 2,781 / 150 | 41,161,949 | 11,670,183 | 2,877,775 |
| 19 | 81 / 279 | 842 / 2,545 / 360 | 20,799,498 | 6,500,324 | 1,679,591 |
| 20 | 60 / 275 | 702 / 2,009 / 335 | 20,319,418 | 5,971,143 | 1,200,612 |
| 15–20 | 423 / 923 | 8,918 / 13,871 / 1,346 | 188,347,121 | 55,635,126 | 12,976,012 |

The final repack keeps about 2.2 MiB of pack per range in the live tree.
The loose bytes are also stored once in the range's lane Commits, so the
Store grows by about 8–9 MiB per range plus the pack.

## Not chosen

- **Loose objects kept, no repack.** It is simpler, but it is about 4× the
  live `.git` growth (55.6 MB against 13.0 MB over ranges 15–20), and git's
  own read cost grows with loose objects.
- **`git add` + `git commit` per lane**, with a lane-private index
  (`GIT_INDEX_FILE`) and lane refs. Commit ids differ from dsh, so HEAD never
  equals the checkpoint, and the index still conflicts unless it is private.
- **The lead commits everything at range end.** One exec per range instead of
  one per dsh commit. It is cheaper, but it isn't "one git commit per replayed
  dsh commit", and lanes would then never touch `.git`.
