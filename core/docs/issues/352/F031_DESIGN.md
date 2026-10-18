# F-031 design · `.git` in Workspaces from P3

> **Status:** approved by the owner with the liaison's revision (2026-10-18,
> HANDOFF "Owner decisions", BUGS F-031), revised below. To be proved on a dev
> range before any measured P3 range uses it.

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

## 1. How lanes commit (owner revision)

There is one git exec per replayed dsh commit, by the agent that replayed it,
in a one-shot Workspace on its lane Branch, right after the step's files land.
It gets its own LayerFS Commit, so every replayed dsh commit adds one exec and
one Commit, as SPEC §2 "Counts change" expects. The exec runs real git over
FUSE with a lane-private index,
`GIT_INDEX_FILE=.git/lanes/<lane>/index`:

1. `git read-tree <dsh parent>`: the index is set to the dsh commit's first
   parent's tree. Its objects are in `.git`, from the seed, an earlier range,
   or this lane's own earlier commit.
2. Real `git add -- <paths>` for the paths the commit added or changed, and
   `git rm --cached -q -- <paths>` for the ones it removed. git hashes the
   Workspace's bytes, so each blob is the replay's own writing.
3. Real `git write-tree`. The printed tree id must equal the dsh commit's
   tree; a different id is a stop finding.
4. `git commit-tree <tree> -p <parent>…` with the original author,
   committer, dates and message (`GIT_AUTHOR_*`, `GIT_COMMITTER_*`, `-F` with
   the raw message bytes). The printed id must equal the dsh commit's.
   - No post-seed commit is signed: 20,850 commits after `6e5c908a1`, with no
     `gpgsig` or `mergetag` header (builder check).
   - Four carry an `encoding` header. Those run with
     `-c i18n.commitEncoding=<their encoding>`, so the header is reproduced.
5. `git update-ref refs/heads/lanes/<lane> <id>`.

The lane writes only these under `.git/`:
- loose objects;
- its own `lanes/<lane>/index`;
- its own `refs/heads/lanes/<lane>`.

The player checks every path a lane Commit changed under `.git/`. Anything
else there is a stop finding.

**Departure from the owner's revision: split commits (lead decision,
2026-10-18; the owner may override).** The frozen plan spreads a dsh
commit's files over several lanes: 191 of 421 replayed commits in ranges
15–20 (at r015, 36 of 67, such as `75838e10b` in 3 lanes). A lane holding
only part of a commit can't write its tree, so the work is split:

- **In the lane:** a commit wholly in one lane, whose parent commits already
  exist in that lane's `.git`, is committed there as above.
- **Blobs, in every lane:** each lane step of any commit runs real `git
  hash-object -w -- <its paths>` on the Workspace's bytes (what `git add`
  does to the object store). Each printed id must equal the plan's blob.
  This is the lane's part of a split commit, and the parts can't conflict:
  loose objects are content-addressed.
- **By the lead:** every other commit is committed after the lane merges, in
  topological order, before the checkpoint checks. That covers commits
  split across lanes, and commits whose parent isn't in the lane yet. The
  lead uses a lead-private index:
  1. `git read-tree <parent>`;
  2. `git update-index --add --cacheinfo <mode>,<blob>,<path>` for the
     commit's changed paths (blobs from the lanes' hash-object), and
     `--force-remove` for the deleted ones;
  3. real `git write-tree`;
  4. `git commit-tree` with the original metadata.

  The lead can't use `git add` there: the merged Workspace holds each path's
  final bytes, not an intermediate commit's.

**What the split means in practice** (`gitlanes.mjs` `classifyCommits`,
ranges 15–20, 1,346 dsh commits):

| Committed by | Commits | Why |
| --- | --- | --- |
| a lane | 10 | wholly in one lane, parents present |
| the lead | 923 | dsh merge commits |
| the lead | 191 | split across lanes |
| the lead | 220 | a parent split or lead-committed, so not in the lane (the chain cascades) |
| the lead | 2 | no planned files |

So the lanes write blobs, with real `git hash-object -w` in their one-shot
Workspaces, plus the 10 eligible in-lane commits. The lead builds the trees
and commits the rest with real git, in topological order, in as few execs as
fit 120 s each (lead decision, 2026-10-18, reported to the owner). The dev
range measures:
- the lead's commit-tree count and wall time per range;
- the lanes' hash-object time;
- `.git` bytes by source;
- `git status` in a fresh one-shot Workspace;
- ids equal to dsh for every commit.

Ids must equal dsh in both paths; a mismatch is a finding. Per range, the
metrics count the commits made in a lane and by the lead, and report the
lead's git exec time as its own series.

**`git status --porcelain` share.** One in ten one-shot Workspaces (the
step's sequence number mod 10 = 0) also runs `git status --porcelain` with
the shared index, after its own command. The output is recorded. It must be
empty only in the lead's checkpoint Workspace. In a lane it lists that lane's
uncommitted state and is reported, not judged. Its time is reported as its
own series.

## 2. How a LayerFS merge treats `.git`

| Path | Written by | Merge outcome |
| --- | --- | --- |
| `objects/xx/<id>` (loose) | lanes, add-only | Clean. Two lanes adding the same object add identical bytes at the same path, because the same git version in the same image compresses deterministically. A conflict on any object path is a stop finding, not a resolution. |
| `refs/heads/lanes/<lane>`, `lanes/<lane>/index` | its lane only | Clean: different paths. The lead deletes them at range end. |
| `index`, `HEAD`, `refs/heads/main`, `packed-refs` | the lead only, after all merges | Never changed on two sides. |
| `logs/`, `ORIG_HEAD`, `FETCH_HEAD` | nobody | The seed sets `core.logAllRefUpdates=false`, and only plumbing that writes none of them is used: no `reset`, `merge`, `pull` or `commit` porcelain. |
| packs from auto-repack or `gc` | nobody | The seed sets `gc.auto=0` and `maintenance.auto=false`, so no command repacks on its own: a recorded departure from a developer's git, where auto-gc would repack in whichever Workspace crosses its threshold. The seed's one pack stays as is. |
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

## 5a. Storage reporting and the dev-range proof (owner revision)

The storage cost is accepted. `.git` bytes are reported separately from the
range's other storage, by source:
- the shared index;
- lane indexes;
- loose objects;
- packs;
- refs.

These are new and stored bytes, from each git Commit's traced sizes.

The dev range proves it before any measured use. It reports:
- every lane git exec's tree and commit ids against dsh;
- the stored bytes per index rewrite, lane and shared;
- `git status --porcelain` time in a fresh one-shot Workspace;
- the lead's checkpoint checks;
- the wall time added per range.

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
- **`git commit` porcelain per lane.** It stamps the current time and
  takes HEAD as its parent, so commit ids differ from dsh and HEAD never
  equals the checkpoint. The revision keeps the real `git add` and
  `git write-tree`, and replaces only the porcelain commit with
  `git commit-tree` and the original metadata.
- **Raw tree and commit bytes via `hash-object` (the first draft).** The
  ids match, but no real git index or tree writing would run in the
  Workspaces. The owner chose the revision.
- **The lead commits everything at range end.** One exec per range instead of
  one per dsh commit. It is cheaper, but it isn't "one git commit per replayed
  dsh commit", and lanes would then never touch `.git`.
