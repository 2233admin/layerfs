# F-031 design · `.git` in Workspaces from P3

> **Status:** owner option (c), 2026-10-18, which supersedes the liaison's
> revision and the lead's split (§1 keeps them as history). The plan stays
> frozen. To be proved on a dev range before any measured P3 range uses it.

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

## 1. How lanes commit (owner option (c), 2026-10-18)

Owner option (c) supersedes the per-dsh-commit lane commits of the
revision, and the lead's split that followed them (history below).

**Lane commits.** Each lane step that changes tracked files runs one git
exec in a one-shot Workspace on its lane Branch, right after its files land.
The exec uses the lane-private index
`GIT_INDEX_FILE=.git/lanes/<lane>/index`, which the lane's first step reads
from `HEAD` (the range's base):
1. Real `git add -f -- <the step's written paths>` and
   `git rm --cached -q -- <its removed paths>`. git hashes the Workspace's
   bytes, so every blob version the range writes is in `.git`, including
   intermediate ones.
2. `git write-tree`, then `git commit-tree <tree> -p <lane ref, or HEAD for
   the first step> -m <step id>`, then `git update-ref
   refs/heads/lanes/<lane>`. These commits get new ids, not dsh's.
   - Porcelain `git commit` would move the shared `HEAD` branch (`main`) and
     its reflog in every lane. Those single files would then conflict at
     every lane merge. So the lane commit uses the plumbing that `git commit`
     runs: a recorded departure from "git commit" in name only.
   - The author and committer are fixed replay identities, with the step's
     dsh commit dates, so reruns give the same ids.

The lane writes only these under `.git/`:
- loose objects;
- its own `lanes/<lane>/index`;
- its own `refs/heads/lanes/<lane>`.

As built, the check is per range: verify's `diff_commits` list of the
range's net change may touch under `.git/` only `HEAD`, `config`, `index`,
`info/exclude`, `refs/heads/main` and `objects/pack/pack-*.{pack,idx,rev}`
(`GIT_ALLOWED`). Anything else is a stray and fails the range.

**The lead writes main exactly as dsh.** After the lane merges and the
reconcile, before the closure, the lead runs one or more execs, each at or
under 120 s, in a one-shot Workspace on the merged Branch. Every dsh commit
of the range is written in topological order with a lead-private index:
1. `git read-tree <first parent>`, skipped when the previous commit written
   is that parent;
2. `git update-index --index-info` with each path that differs from the
   first parent (from `git diff-tree` on `dsh.git`), deletions as mode 0.
3. Real `git write-tree`, which must print dsh's tree id;
4. `git commit-tree` with the original author, committer, dates, message,
   parents and encoding, which must print dsh's commit id.

The job (commits, index lines, raw messages) travels as one gzip file written
by `fs.apply` under `/.lfs-git-job/`, which the lead's last exec removes. A
node writer (`LEAD_WRITER`) runs the git commands, each exec until done or
80 s, so every exec stays under 120 s.

Two recorded departures (lead, 2026-10-18):
- **The lead's index lives in the Sandbox's `/tmp`, not over FUSE.** Each
  dsh commit would otherwise write the 1.6 MB index twice through FUSE. The
  liaison's condition holds it: at range end the real `.git/index` is written
  in the Workspace (`read-tree HEAD`, `update-index --refresh`, over FUSE),
  `git status --porcelain` there must be clean, and again in a fresh
  one-shot Workspace on the checkpoint (below).
- **Blobs no step wrote.** A frozen-plan step can cover several dsh commits,
  so an intermediate version never reaches a Workspace: 403 blobs (12.6 MB
  raw) in range 15, 829 (22.5 MB) in 16, 505 in 17, 286 in 19, none in the
  checkpoint tree. The lead ships them as one native pack and real
  `git unpack-objects` writes them before the writer runs. They are counted
  as `missing` (blobs, raw bytes, pack bytes) and reported apart.
3. Real `git write-tree`, which must print dsh's tree id;
4. `git commit-tree` with the original author, committer, dates, message,
   parents and encoding, which must print dsh's commit id.

That includes dsh's merge commits and the checkpoint.

**The FUSE stat check (owner; liaison condition).** After the lead's
Commit, a fresh one-shot Workspace on the checkpoint runs `git status
--porcelain`, timed, with `GIT_TRACE2_PERF`. It must list nothing, and git's
`refresh/sum_scan` must be 0: git read back no tracked file because every
index entry's inode, ctime and mtime still match after the remount.
`sum_lstat` and whether `.git/index` changed are recorded. The Workspace is
discarded. Daemon FUSE counters are traced only in measured mode; trace2's
count is the per-range proof.

**Earlier plans, kept as history.** The revision committed each dsh commit
in its lane. The frozen plan spreads half the commits over 2–4 lanes, so
`gitlanes.mjs` `classifyCommits` found only 10 of 1,346 commits in ranges
15–20 committable whole in a lane:

| Committed by | Commits | Why |
| --- | --- | --- |
| a lane | 10 | wholly in one lane, parents present |
| the lead | 923 | dsh merge commits |
| the lead | 191 | split across lanes |
| the lead | 220 | a parent split or lead-committed, so not in the lane |
| the lead | 2 | no planned files |

The lead's split, with blobs only in lanes, followed. Option (c) replaced
both.

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
| `refs/heads/lanes/<lane>`, `lanes/<lane>/index` | its lane only | Clean: different paths. The lead deletes the refs at range end; lane commits' objects stay, reported separately. |
| `index`, `HEAD`, `refs/heads/main`, `packed-refs` | the lead only, after all merges | Never changed on two sides. |
| `logs/`, `ORIG_HEAD`, `FETCH_HEAD` | nobody | The seed sets `core.logAllRefUpdates=false`, and only plumbing that writes none of them is used: no `reset`, `merge`, `pull` or `commit` porcelain. |
| packs from auto-repack or `gc` | nobody | The seed sets `gc.auto=0` and `maintenance.auto=false`, so no command repacks on its own: a recorded departure from a developer's git, where auto-gc would repack in whichever Workspace crosses its threshold. The seed's one pack stays as is. |
| `objects/pack/pack-<id>.*` of a range | the lead only, after all merges (§3) | Never changed on two sides. The lane Branches are done by then. |

Any LayerFS merge conflict under `.git/` is a stop finding (D0), never
resolved by rule.

## 3. dsh merge commits with their original parents

Under option (c), the lead writes every dsh commit of the range (§1), merges
included, with real `write-tree` and `commit-tree` and the original parents,
in topological order. That includes the range's checkpoint, a mainline
merge. Every parent is written before its children, or is in `.git` from an
earlier range or the seed.

The same exec then:
- runs `git update-ref refs/heads/main <checkpoint>` (`HEAD` is a symbolic ref
  to `main`);
- rebuilds the index with `git read-tree HEAD` and
  `git update-index -q --refresh`, which stats every file, real FUSE work;
- runs `git repack -d -q` (incremental, not `-a`) while the lane refs still
  exist. It packs the range's loose objects, the lane commits, their trees
  and every intermediate blob version included, into one new pack and deletes
  them, so a range adds one pack and no loose objects. With the lane refs
  already gone, the lane-only objects would stay loose, because an
  incremental repack packs only reachable objects. Only the lead writes the
  pack, after every lane merge, so it can't conflict. It is the only repack,
  run explicitly;
- then deletes the lane refs and the lane and lead index files. The lane-only
  objects stay in the pack, unreachable, and are reported separately (§5a);
- runs `git status --porcelain`.

It has its own Commit, before the closure and the publish.

## 4. Seed

The seed is built natively from `dsh.git`. `git pack-objects --revs` packs
everything reachable from `6e5c908a1`: 1,545 commits, a 9.35 MiB pack and a
0.73 MiB pack index (lead's measurement). It goes into a fresh `.git`:
- `refs/heads/main` = `6e5c908a1`, with `HEAD` pointing to `main`;
- the config above;
- `.lfs-probe/` and `.lww` in `info/exclude` (neither is dsh content);
- `gc.auto=0`, `maintenance.auto=false`, `core.logAllRefUpdates=false`.

One exec in a one-shot Workspace on the lead Branch of the first P3 range
writes the seed, then builds the index with `read-tree` and `update-index --refresh`. It is
proved by:
- `git rev-list --all` lists exactly the commits reachable from `6e5c908a1`,
  with nothing later;
- `git status --porcelain` is empty;
- `git fsck --connectivity-only` passes.

Its Commit's sizes are recorded in the fork manifest.

## 5. Proof per range

- The tree check (§7) skips `.git/`. Otherwise it is unchanged.
- Lane commits have new ids. The player records each lane git exec's printed
  tree and commit, and checks that the lane ref moved to that commit.
- The lead's exec prints each written tree and commit, and every one must
  equal `dsh.git`'s.
- At the checkpoint, the lead's exec must show:
  - `git rev-parse HEAD` = the plan's checkpoint commit, and its tree id
    = dsh's checkpoint tree;
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
- packs, with the lane commits' objects (lane commits, lane-only trees,
  intermediate blobs) counted apart from dsh's own objects;
- refs.

These are new and stored bytes, from each git Commit's traced sizes.

The dev range proves it before any measured use. It reports:
- the lead's commit-tree count and wall time per range, each exec at or
  under 120 s, and its tree and commit ids equal to dsh;
- lane git time: execs, Commits and wall per range;
- `.git` bytes by source, as above;
- the stored bytes per index rewrite, lane and shared;
- `git status --porcelain` time in a fresh one-shot Workspace (one in ten);
- the lead's checkpoint checks;
- the wall time added per range.

Auto-gc is off (§2), a recorded departure.

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
  - Per lane step that changes tracked files: one more one-shot Workspace
    and exec, about 60–100 ms today (mount + exec + Commit + unmount).
  - Per range: lead execs that write every dsh commit, 122–360 (15–20), reads
    every loose object for the repack, and does two full stat walks of about
    16k files over FUSE, est. 3–10 s.
- **Counts:** one more exec, Workspace and Commit per tracked-changing lane
  step, plus the lead's. P0 totals
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
- **`git commit` porcelain per lane.** It moves the shared `HEAD` branch
  and writes its reflog in every lane, so every lane merge would conflict on
  those single files. Lanes run the real `git add` and `git write-tree` and
  replace only the porcelain commit with `git commit-tree` and their own ref.
- **Raw tree and commit bytes via `hash-object` (the first draft).** The
  ids match, but no real git index or tree writing would run in the
  Workspaces. The owner chose the revision.
- **One dsh commit per lane commit (the revision), then the lead's split.**
  The frozen plan spreads half the commits over lanes, so only 10 of 1,346
  commits in ranges 15–20 could be committed whole in a lane (§1). Option (c)
  replaced both.
