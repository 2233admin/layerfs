# F-031 design · `.git` in Workspaces from P3

> **Status:** revision 3, 2026-10-19, for the owner's approval. Design only:
> no product code and no measurement. Part A answers the owner's design gate
> against the merge rules on staging `claude/dsh-352-integration-c98eb1`
> (`5fdee6d0c`: M1 merge by serial, metadata merged per field, the `mode`
> conflict, `/.lww`). Part B is the approved option (c) design (owner
> 2026-10-18), built and off by default (`gitplay.mjs`, `gitlanes.mjs`,
> `c9466a056`), with two figures corrected (A7). Its dev-range proof has not
> run: `dev352-p3s` r015 reached the 118 s command ceiling (RESULTS
> 2026-10-18), and the range is now played in two commands (SCRIPTS.md).

## Open owner questions

Each has a recommendation. None needs a new product merge rule (A3 lists
the rules the design relies on, and the two it would need if a
recommendation is declined).

- **Q1 · `/.lww` must never decide a path under `/.git`.** The replay's
  `/.lww` is generated from every dsh `.gitignore` (`lww.mjs`). An
  unanchored pattern matches at any depth, including under `/.git`. Today
  none does (r015 root `.gitignore`: `lib/`, `tmp/`, `.cache/` and others
  match no `.git` path, and lane folders are named `r0NN-…`). A later
  `.gitignore` with `logs/`, `index`, `objects/` or `*.pack` would make a
  merge that both sides changed there pick the newer mtime silently, instead
  of the `binary` or `content` conflict that stops the range. Options:
  (a) the replay appends `!/.git` as the last generated rule, so the last
  matching rule un-matches every `.git` path (no product change; git itself
  never ignores `.git`); (b) a product rule: `/.lww` never applies under
  `/.git`. **Recommendation: (a).** It needs no product change, and the
  `lww.mjs check` proof gains one assertion: no `.git` path matches.
- **Q2 · How exact the storage split per git Commit is.** A lane git Commit
  holds its loose objects, its lane index and its lane ref together. The
  lead's Commit holds the pack, the shared index, `refs/heads/main` and the
  deletion of every loose object. The trace gives one `newStored` and
  `newMetadata` per Commit, not per path. Options: (a) the stored total per
  Commit, exact, plus the logical split from git (index file bytes, loose
  object bytes, pack/idx/rev bytes, ref bytes), with the stored split
  labelled not measured; (b) a daemon counter: the `bySource` Save counter
  (builder-storage-counters item 1) extended with `.git` sources (`index`,
  `laneIndex`, `loose`, `pack`, `refs`) by path; (c) the lead's finish split
  into two Commits (pack, then index and refs), which makes the lead's split
  exact at one more Commit per range but leaves the lane split as in (a).
  **Recommendation: (a) for the dev range**, then (b) only if the owner
  needs stored bytes per source before measured P3. (b) is a product change
  on the critical path; (c) changes the workload for a report column.
- **Q3 · Lanes commit with plumbing or porcelain.** As built, a lane runs
  real `git add` and `git rm --cached`, then `git write-tree`,
  `git commit-tree` and `git update-ref` of its own ref. Porcelain
  `git commit` on the shared `.git` would move `HEAD`'s branch (`main`) in
  every lane, and those single files would conflict at every lane merge.
  Porcelain is possible without that: each lane gets a linked-worktree git
  folder (`.git/worktrees/<lane>/` with its own `HEAD` →
  `refs/heads/lanes/<lane>`, `index` and `commondir`), and runs
  `GIT_DIR=.git/worktrees/<lane> GIT_WORK_TREE=. git commit`. Every file it
  writes is lane-private or a new object. It adds git's own index refresh
  (an lstat of every tracked file, 1,261–1,332 at r015) per lane commit,
  which is what an agent's `git commit` costs. **Recommendation: keep the
  built plumbing for range 15.** It writes the same objects and refs; the
  porcelain variant is a separate change if the owner wants agents' exact
  command.
- **Q4 · Where a clean `git status` is claimed.** A clean `git status`
  holds only at a range's checkpoint, after the lead's finish (A2.3). It does
  not hold after a LayerFS lane merge, nor on `main` between a race publish
  (r019 has one) and the range's publish: there `HEAD` and `.git/index` are
  still the previous checkpoint's while the tree has the range's changes.
  **Recommendation: confirm.** It is git's own state for uncommitted work;
  making it clean mid-range would need the lead's writer on every merge.
- **Q5 · The fresh-mount stat check stays a hard stop.** `freshStatus`
  fails the range when `git status` in a fresh Workspace reads back any
  tracked file (`refresh/sum_scan` > 0). One legitimate product behaviour
  can cause that: §4.8 (fix record 022) commits a tracked file's mtime-only
  change as the base mtime, while the same Workspace's live view, and so
  `git update-index --refresh` in it, sees the new one. The lead's exec
  touches no tracked file, so in the replay a nonzero count is a finding.
  **Recommendation: keep the hard stop**, and record any hit with the paths
  and their live and committed mtimes, as a finding for the owner, not a
  harness fix.
- **Q6 · How "wall time added per range" is measured.** (a) The sum of the
  git stages from the trace (seed, lane git execs, lead job, writer, finish,
  fresh status), exact and from the same play; the lane git execs overlap
  other agents' steps, so their sum is not the critical path, and the
  critical path is reported apart. (b) Also an end-to-end git-off play of
  the same dev range from a clone of the same fork, one sample each. The
  earlier git-off r015 plays (83–105 s) ran other binaries at other loads
  and are not comparable. **Recommendation: (a) and (b)**, labelled dev
  diagnostics, one sample each, no reruns.

Two items outside F-031 still gate measured range 15 and are not decided
here: the owner's P3 wall budget (about 254 s projected per range without
`.git`, RESULTS 2026-10-18) and F-034.

## Part A · The owner's design gate, answered

### A1 · How lanes commit

| Git work | Workspace | LayerFS Branch | Sandbox | Git ref it moves | `.git` files it writes |
| --- | --- | --- | --- | --- | --- |
| Seed (first P3 range only) | `fs.apply` of the pack and the small files, then one one-shot Workspace for the index and the checks | the range's lead Branch | `pool[0]` | `refs/heads/main` = `6e5c908a1` | everything in the seed (Part B §4) |
| Lane commit: one per lane step that changes tracked files (`fs`, `apply`, `stale-apply`, `hold-resolve`) | a new one-shot Workspace, mounted after the step landed | the step's lane Branch (`r0NN-<n>-<folder>`) | the agent's, `pool[(N−1) mod 4]` | `refs/heads/lanes/<lane>` only; `HEAD` stays `ref: refs/heads/main` and is never written | loose objects; `.git/lanes/<lane>/index`; `refs/heads/lanes/<lane>` |
| Lead writer and finish | one one-shot Workspace, several execs, one Commit | the merged Branch after the last lane merge and the reconcile (`r<k>-main-<n>`) | `pool[0]` | `refs/heads/main` = the checkpoint | the range's pack (`pack-*.pack/.idx/.rev`); `.git/index`; `refs/heads/main`; deletes the loose objects, `lanes/` and the lane refs |
| Fresh status check | one one-shot Workspace, discarded | the same merged Branch, after the lead's Commit | `pool[0]` | none | none (the Workspace is discarded) |

- **Per lane, one git exec at a time.** Several agents share a lane (r015:
  3 lanes, 8 agents). `laneGit` chains a lane's git execs on one promise, so
  each mounts after the previous one Committed and the lane index and ref
  never have two writers. Agents' own steps on the lane run concurrently
  with it. They change only worktree paths and the git Commit only `.git`
  paths, so a Commit over a moved lane head merges cleanly (A2, the
  "theirs = base" rows) and the SDK answers `Committed`, as for the planned
  stale merge.
- **What the lane commit adds.** `git add` hashes the Workspace's bytes at
  the git exec's mount. When another agent of the lane rewrote the same path
  in between, git adds the later bytes. That is real git on a shared lane;
  lane commit ids are never compared with dsh, so it changes no proof.
- **Counts from the frozen plan.** Lane git execs per range: 122 (r015,
  at most 42 in one lane), 174 (r016, 52), 104 (r017, 37), 133 (r018, 51),
  124 (r019, 34), 82 (r020, 31). Each adds one mount, exec, Commit and
  unmount.

### A2 · A LayerFS merge of two Branches that both changed `.git`

The rules are those of [81-compare-and-merge.md](../../architecture/81-compare-and-merge.md)
on staging. Branch merges read `/.lww` from ours (the lead's Branch); a
Workspace Commit reads it from theirs.

#### A2.1 · Path by path

| `.git` path | Changed by | Rule that applies (81, steps 2–3 and metadata) | Outcome |
| --- | --- | --- | --- |
| `objects/<xx>/` fan-out folders | lanes, both new | "Two new directories at one name are merged by name into `into`'s." Both changed the folder's metadata: theirs is kept | clean |
| `objects/<xx>/<id>` loose object, one lane | one lane | "theirs = base → ours" (or the converse) | clean; taken whole, metadata included |
| `objects/<xx>/<id>` loose object, both lanes | both lanes, new on both | a name collision of two entries; "ours = theirs → theirs" when the bytes are equal. Mode is 0444 on both, so no `mode` conflict; mtime differs and takes the decided entry's | clean when git wrote equal bytes (same git and zlib in one image, deterministic). Unequal bytes are not text: `binary`, a reported conflict, so the merge answers Conflict and the range stops (D0) |
| `lanes/<lane>/index`, `refs/heads/lanes/<lane>` | one lane each | different names: one side each | clean |
| `lanes/`, `refs/heads/lanes/` folders | both lanes, new | merged by name | clean |
| `index`, `HEAD`, `refs/heads/main`, `config`, `packed-refs` | nobody before the lead | "ours = theirs" (both unchanged) | untouched |
| `logs/`, `ORIG_HEAD`, `FETCH_HEAD`, `COMMIT_EDITMSG` | nobody | not created: `core.logAllRefUpdates=false`, plumbing only | absent |
| packs from auto-repack or `gc` | nobody | not created: `gc.auto=0`, `maintenance.auto=false` | absent |
| the range's pack | the lead, after every lane merge | no merge follows on that Branch before the publish | not merged |

If a lane did write a shared single file, the result depends on how many
did:
- **Two lanes:** `.git/index` is not text, so `binary` (Conflict, stop). A
  ref is text, so `content` with markers (Conflict, stop).
- **One lane:** "theirs = base" takes it silently. The lead's
  `read-tree HEAD` would then overwrite `.git/index`, hiding the stray.
  `verify`'s `GIT_ALLOWED` check sees only the range's net change, and
  `index`, `HEAD` and `refs/heads/main` are allowed there.

So A4 adds a lane guard before each lane merge.

#### A2.2 · What the merge does to `.git/index` and refs

Nothing. No lane writes `.git/index`, `HEAD` or `refs/heads/main`:
- the lane's `git add` uses `GIT_INDEX_FILE=.git/lanes/<lane>/index`;
- the one-in-ten lane status probe runs with `GIT_OPTIONAL_LOCKS=0`
  (`statusProbe({ locks: false })`), so it never rewrites the shared index.

A lane merge copies each lane's own index and ref and the union of the loose
objects. The merged Branch's `.git/index`, `HEAD` and `main` stay the
previous checkpoint's until the lead's finish.

#### A2.3 · Whether a clean `git status` holds after the merge

- **After the lane merges: no, by design (Q4).** `HEAD` is the previous
  checkpoint and the tree holds the range's changes, so `git status` lists
  them.
- **After the lead's finish: yes, and cheaply after a remount.** Git
  compares each entry's inode, mtime, ctime, size, uid and gid. In LayerFS:
  - the inode is the serial plus one, stable across mounts (`layerfs-fuse/src/attributes.rs:24`);
  - ctime is reported as the mtime (`attributes.rs:70`);
  - a merge keeps a file's serial except where one serial would carry two
    values (81 step 6). dsh's tracked files are not hard links, so an
    unchanged tracked file keeps its serial and mtime through every merge.

  The lead builds `.git/index` after every merge, from the merged tree, so
  its stat data match what a fresh mount shows. The fresh one-shot check
  proves it (`refresh/sum_scan` = 0, Q5).
- **Across ranges.** The next range's lane merges keep unchanged files'
  serials and mtimes. The lead rebuilds the index anyway. As built, it runs
  `git read-tree HEAD`, which drops every entry's stat data, so `update-index
  --refresh` re-reads every tracked file's content (1,332 files at the r015
  checkpoint). `git read-tree -m HEAD` keeps the stat data of entries whose
  blob is unchanged and re-reads only changed paths. It is the same real git
  index rebuild that `git reset` does. Builder's choice, recorded with the
  dev range; it changes cost, not the proof.

### A3 · Merge rules: relied on, and not needed

Relied on, all on staging:
- add/add of equal bytes is clean ("ours = theirs");
- non-text both-sides changes are a reported `binary` conflict, never a
  silent pick;
- new folders at one name merge by name;
- a field one side changed takes that side's value (F-052). Two files' equal
  modes are not a `mode` conflict.

Not needed, and so not requested:
- **a content-addressed rule for `objects/`** ("same name, keep either") —
  needed only if loose-object bytes could differ, which A2.1 makes a stop
  instead;
- **a merge rule for the git index or refs** — no two Branches change them.

If the owner declines Q1 (a), the design needs a product rule (Q1 (b)).

### A4 · The lane guard (new, harness)

Before each lane merge, the lead diffs the lane's head against the range's
base under `/.git` (the same `diff_commits` that `verify` uses). Allowed:
- `objects/<xx>/` and `objects/<xx>/<38 hex>`;
- `lanes/<lane>/` and its `index`;
- `refs/heads/lanes/` and `refs/heads/lanes/<lane>`.

Anything else, or another lane's names, stops the range before the merge,
with the paths. This catches the one-lane stray that A2.1 would otherwise
take silently. It costs one diff per lane merge, limited to `.git`.

### A5 · Remaining questions in BUGS F-031

BUGS F-031 lists no question beyond the gate's three. Its items stand as
follows:
- **(3) dsh merge commits with their original parents.** The lead writes
  every dsh commit of the range in topological order (Part B §1 and §3),
  merges and the checkpoint included. Each parent is in the seed, an earlier
  range's pack, or written earlier in the same exec, so both parents'
  objects are in one `.git`. Blobs come from the lanes' `git add`, or from
  the lead's pack of blobs no step wrote, written by real
  `git unpack-objects`. Each `commit-tree` must print dsh's id, which covers
  the parents.
- **Seed:** built and proved by the seed script (Part B §4).
- **Cadence:** option (c), Part B §1.
- **Proof:** HEAD = the checkpoint, tree id = dsh's, clean status, the fresh
  check (Part B §5), plus the lane guard (A4).
- **Counts change:** re-derived at the P3 re-baseline (SPEC §2).
- **Dev range:** not done. A git range is played in two commands, each at or
  under 118 s (SCRIPTS.md "The P3 command shape").

### A6 · What the dev range measures

One dev range (r015, from a clone of the P2 fork, Disposable), one sample,
`LAYERFS_CONSTRUCTION_WORKERS=1`.

**Store growth per git Commit** (from each Commit's traced `sizes`):

| Commit | Stored and metadata | Logical split (from git in the same exec) |
| --- | --- | --- |
| seed (once) | `newStored`, `newMetadata` | pack, idx, rev; index; small files |
| each lane git Commit | the same | lane index bytes; loose objects (count, bytes); ref |
| lead Commit | the same | new pack, idx, rev; `.git/index`; loose objects deleted (count, bytes); refs |
| lead job and missing-blob pack (`fs.apply`) | the same | job bytes; pack bytes (removed again by the finish) |

From these, per range:
- total `.git` growth;
- the median and p90 stored bytes per lane index rewrite;
- the stored bytes per shared index rewrite;
- the loose bytes the range's Commits keep after the repack deletes them
  from the live tree;
- the pack bytes;
- Store on disk before and after.

The stored split per source is labelled not measured unless Q2 (b) lands.

**Wall time added per range** (Q6):
- the seed's;
- the lane git execs': count, sum, median, p90;
- the critical path: per lane, the time from its last step landing to its
  last git Commit;
- the lead's: job, unpack, writer execs, finish (refresh, repack), Commit;
- the fresh check;
- with Q6 (b), the end-to-end difference against the git-off play.

Each exec stays at or under 120 s.

**Checks reported:**
- HEAD and tree ids;
- the lead's commit count against dsh's;
- `refresh/sum_scan` and `sum_lstat` in the fresh Workspace;
- the lane guard;
- conflicts under `.git` (must be 0);
- the one-in-ten lane status times.

### A7 · Corrections to Part B's figures

The dsh index is about 160 KB, not 1.6 MiB. Measured here with native git
`read-tree` into a scratch index (a fact about dsh, not a LayerFS
measurement):

| Commit | Entries | Index v2 | Index v4 |
| --- | --- | --- | --- |
| `6e5c908a1` | 1,261 | 157,025 B | 114,899 B |
| r015 checkpoint `b4ec4060a` | 1,332 | 165,931 B | 121,158 B |

Part B §6 said "about 1.6 MiB (16k entries)" and a stat walk of "about 16k
files". Both are about ten times too high; Part B now uses the figures
above.

A lane git exec rewrites its whole lane index, so per range the lanes
write 82–174 index files of about 160 KB, 13–28 MB raw. How much CDC
deduplicates of each rewrite is unknown until the dev range measures it.
Part B's estimate left this out.

---

## Part B · The approved option (c) design, as built

### The constraint that shapes it

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

### 1. How lanes commit (owner option (c), 2026-10-18)

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
  dsh commit would otherwise write the index (about 160 KB, A7) twice through FUSE. The
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

### 2. How a LayerFS merge treats `.git`

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

### 3. dsh merge commits with their original parents

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

### 4. Seed

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

### 5. Proof per range

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

### 5a. Storage reporting and the dev-range proof (owner revision)

The storage cost is accepted. `.git` bytes are reported separately from the
range's other storage, by source:
- the shared index;
- lane indexes;
- loose objects;
- packs, with the lane commits' objects (lane commits, lane-only trees,
  intermediate blobs) counted apart from dsh's own objects;
- refs.

These are new and stored bytes, from each git Commit's traced sizes. The trace gives them per Commit, not per source: A6 and Q2 say how the split is reported.

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

### 6. Expected cost

The figures below are estimates until the dev range measures them.

- **Seed:** about 10.1 MiB once (pack and pack index, already compressed, so
  no CDC gain), plus an index of about 157 KB (1,261 entries; corrected, A7).
- **Per range:**
  - The range's new blobs, trees and commits, written first as loose zlib
    objects by the lanes. They don't deduplicate against the files they hold.
    The lead's `repack -d` then turns them into one delta-compressed pack of
    1.2–3.1 MiB (ranges 15–20 below, against 5.7–11.7 MiB loose). The loose
    objects live in lane Commits and the merged frontier until the repack,
    so the Store also keeps those bytes in the range's intermediate Commits.
  - One shared index rewrite (about 160 KB raw; corrected, A7), and 82–174 lane index rewrites of the same size (A7), whose stat fields change
    throughout, so dedupe is partial.
- **Wall time:**
  - Per lane step that changes tracked files: one more one-shot Workspace
    and exec, about 60–100 ms today (mount + exec + Commit + unmount).
  - Per range: lead execs that write every dsh commit, 122–360 (15–20), reads
    every loose object for the repack, and does two full stat walks of about
    1,332 files over FUSE (corrected, A7), est. 3–10 s.
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

### Not chosen

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
