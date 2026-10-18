# #352 / #359 — Cost model of common operations

> **Status:** Measurement only (#359), 2026-10-18. No product behavior changed.
> Proposed budgets (§6) await the owner's approval; no systemic fix starts
> before that. Branch `issue359-cost-model` (from `dsh-history-replay`
> `7a11f3c3e`).

## 1. What was measured

36 cases, 37 commands (vitest split into a native part and a LayerFS part to
keep every command under 2 minutes), one sample per arm, label `measured`,
ledger `~/lfs-history/runs/issue359/ledger.jsonl` seq 103–175, samples
`~/lfs-history/runs/issue359/samples/s103…s175-*-measured/`, aggregated table
`~/lfs-history/runs/issue359/table-measured.json`
(`node dsh/tools/history/cost.mjs table --label measured --binary 50155780`).

| Identity | Value |
| --- | --- |
| Product source | `41efeeae8` = `7a11f3c3e` + the declared counter commit (FUSE `lookup_missing`, `served_ns`; no behavior change) |
| Harness | `ebb0572fd`, `dsh/tools/history/cost.mjs` sha256 `3d1d215b…`, clean tree |
| Daemon / addon | `50155780` (sha256 `501557802eab…`) / `c41ae8c5` (sha256 `c41ae8c55769…`), release `--locked` |
| SDK JS | sha256 `cf1bd238…` |
| Image | `layerfs-352-runtime:node24` = `sha256:d3773b4eac6a…` (Node 24.21, pnpm 11.28.5, git 2.39.5) |
| Store | `layerfs-issue359-prep`: byte copy of `layerfs-issue352-dev352-p3p` plus three setup Commits (`nonm`: every `node_modules` removed; `folders`: `.cost/d100`, `d1000`, `d10000` of empty files; `git`: `git init` + one commit of the tree). Head = range-17 layer `32acff60…` (51,491 entries, 485,027,770 B, 102 `node_modules` folders) |
| Profile | Disposable / WAL / `synchronous=OFF`, 4 KiB pages, `LAYERFS_CONSTRUCTION_WORKERS=1`. Durable: `NOT_RUN — disabled by owner until explicit reauthorization` |

**Arms.** Every case gets a fresh byte clone of the prepared Store, a fresh
home and a fresh Sandbox (fresh daemon), in its own runner container.
*native*: the same command in the same container and image, in a native copy
of exactly the tree LayerFS serves (`/tmp/native/w`, copied from the
read-only native volume; its page cache holds the tree after the copy —
declared, favours native). *cold*: first run in a fresh Workspace on a fresh
daemon. *steady*: the same Workspace, run again (kernel dentry/attr caches
warm, TTL 60 s; daemon caches as they are). Wall time is measured in the
container around the command alone. Counters per arm are the daemon's
cumulative observation records at a traced `sandbox.status` before and after
the arm, subtracted. SDK calls, Commits and merges carry their own traced
telemetry.

*warm-daemon* (added 2026-10-18, `cost.mjs case <id> --daemon warm`; fix
record 031): Workspace W1 mounts, runs the case's non-steady steps once and
unmounts discarded, then a fresh W2 on the same Branch and daemon runs them
once and is measured. Its own arm: it never credits or replaces *cold*.
`--daemon fresh` runs *cold* and *steady* on a daemon that has served no
Workspace (no native setup mount before them); both read the daemon's
VmRSS/VmHWM after each step.

**Caches (declared).** Daemon shared immutable cache: **64 KiB** (the SDK
starts every daemon with `cache_bytes: 65536`, `sdk/js/native/src/sandbox.rs:61`;
recorded in each sample's Mount operation record). SDK in-process Store cache:
64 KiB (`layerfs-store-service/src/store_service.rs:34`). The Store file sits
in the VM page cache after the clone for every arm (not controlled), so no
cold-disk claim is made.

**Outputs.** Native and LayerFS outputs agree for every case: digests equal
for `sorted`/`exact` cases (`find`, `grep -r`, `tsc -b`, `node-require`,
`first-open`, `git`, folder cases), exit codes equal for `exit` cases
(vitest 544/544 tests both arms, pnpm, `cp`/`rm`). `du -s --apparent-size`
differs (`cmp: none`): 485,027,770 native vs 455,659,450 LayerFS. The
difference, 29,368,320 B, is exactly the sum of the native tree's 7,048
directory sizes (ext4 `st_size`), so LayerFS directories add 0 to `du
--apparent-size` — not a content difference, but a visible one.

**Host.** Load average 6–7 throughout (other sessions on the host; no build of
this campaign ran during the pass), recorded per case. Wall times carry that
noise; counts (statements, bytes, requests) are deterministic and are the
primary evidence.

## 2. Ranked table

Sorted by wall time lost to LayerFS (cold arm unless noted). ms are
in-container wall times. *stmts* = Store reader SQL statements; *pack MB* =
pack bytes read; *reqs* = Store reader requests; *miss* = immutable-cache
misses; FUSE columns are kernel requests the daemon served.

| # | Case | Native ms | LayerFS ms | × | stmts | pack MB | reqs | miss | lookup (ENOENT) | getattr | readdir |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | `cp -a node_modules` (created tree) | 1,663 | 63,854 | 38 | 1,755,744 | 2,887 | 333,587 | 316,600 | 93,450 (46,724) | 89,371 | 12,243 |
| 2 | `grep -r -l` whole tree | 646 | 41,425 | 64 | 1,938,819 | 2,983 | 354,940 | 332,798 | 51,490 (0) | 212 | 14,322 |
| 3 | `rm -rf node_modules` (committed) | 483 | 34,084 | 71 | 1,459,725 | 2,559 | 265,953 | 236,232 | 46,722 (0) | 47,366 | 18,250 |
| 4 | `du -s` | 120 | 28,241 | 236 | 1,585,854 | 2,740 | 285,831 | 253,629 | 51,490 (0) | 212 | 14,322 |
| 5 | Commit after first `pnpm install` | — | 19,840 | — | 429 | 0 | — | — | — | — | — |
| 6 | `fs.grep` (SDK, whole tree) | — | 10,602 | — | 660,054 | 2,785¹ | — | — | — | — | — |
| 7 | `rm -rf` of the tree `cp` created | 541 | 10,009 | 18 | 0 | 0 | 0 | 0 | 23,594 (0) | 47,365 | 18,250 |
| 8 | `find .` | 129 | 8,492 | 66 | 320,112 | 507 | 51,289 | 57,149 | 7,047 (0) | 212 | 14,322 |
| 9 | first `pnpm install` (no `node_modules`) | 4,887 | 12,128 | 2.5 | 36,285 | 77 | 6,571 | 6,220 | 57,975 (53,496) | 83,437 | 1,028 |
| 10 | `vitest run` | 2,165 | 6,901 | 3.2 | 231,978 | 551 | 58,986 | 57,621 | 19,860 (18,737) | 1,030 | 658 |
| 11 | `pnpm install` (reinstall, tree present) | 1,669 | 5,821 | 3.5 | 215,811 | 405 | 40,166 | 39,309 | 4,642 (187) | 517 | 618 |
| 12 | `ls -l` of a 10,000-entry folder | 34 | 4,388 | 128 | 243,684 | 476 | 40,528 | 40,527 | 10,002 (0) | 1 | 158 |
| 13 | `tsc -b` (up to date) | 210 | 1,706 | 8.1 | 33,570 | 48 | 5,826 | 5,813 | 597 (3) | 75 | 290 |
| 14 | `git status` cold | 137 | 1,342 | 9.8 | 96,720 | 93 | 15,845 | 14,567 | 2,427 (324) | 8 | 1,028 |
| 15 | `ls -R` | 13 | 1,050 | 81 | 42,207 | 68 | 5,873 | 6,246 | 921 (0) | 2 | 1,845 |
| 16 | `node` require of every dependency | 26 | 273 | 10 | 8,229 | 16 | 1,513 | 1,585 | 149 (0) | 42 | 0 |
| 17 | `fs.glob **/*.json` under `/packages` | — | 146 | — | 8,223 | 21.5¹ | — | — | — | — | — |
| 18 | first `stat` 7 components deep | 1.2 | 16.9 | 14 | 612 | 0.9 | 73 | 111 | 7 (0) | 1 | 0 |
| 19 | one-shot small Commit | — | 20.3 | — | 171 | 0 | — | — | — | — | — |
| 20 | `branch.merge`, two one-file sides | — | 17.9 | — | 21 | 0 | — | — | — | — | — |
| 21 | first `stat` at the root | 1.1 | 3.3 | 2.9 | 45 | 0 | 8 | 7 | 1 (0) | 1 | 0 |

¹ SDK calls read through SQLite BLOB I/O in the SDK process; the column is BLOB bytes read.

**Steady arms** (same Workspace, run again):

| Case | Native ms | Steady ms | × | stmts | miss | note |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `find .` | 85 | 7,672 | 90 | 308,058 | 50,014 | **no better than cold**: 50,014 misses for 50,014 requests |
| `du -s` | 107 | 7,993 | 74 | 333,177 | 53,715 | |
| `grep -r` | 539 | 28,831 | 54 | 1,527,054 | 235,325 | |
| `ls -R` | 7.7 | 874 | 113 | 32,043 | 5,595 | 922 getattr re-served |
| `vitest run` | 1,711 | 5,408 | 3.2 | 175,740 | 45,706 | 18,703 of 18,704 lookups are ENOENT again |
| `pnpm install` reinstall | 554 | 788 | 1.4 | 16,221 | 2,714 | |
| `tsc -b` | 205 | 411 | 2.0 | 6,663 | 1,549 | |
| `git status` | 9.3 | 559 | 60 | 23,478 | 5,483 | |
| `ls -l` 10,000 entries | 35 | 147 | 4.2 | 1,962 | 238 | kernel entries warm |
| `fs.grep` | — | 10,696 | — | 659,775 | — | identical to cold |
| first `stat` (both) | 1.1–1.2 | 1.3–1.4 | ~1.1 | 0 | 0 | kernel-cached |

## 3. Unit costs

| Unit | Cost (measured) | Source |
| --- | --- | --- |
| One Store reader request (object fetch on a cache miss) | 5.5–6.2 statements, 1.8–2.1 read transactions, ~1 cache miss | `find`, `grep -r`, `du`, `rm` cold (stmts/reqs, txn/reqs) |
| Pack bytes read per byte used (authenticated) | 5.4–21.8× on walks; **82×** for `ls -l` of 10,000 entries | `reader_storage.pack_read_bytes` ÷ `immutable_cache.authenticated_bytes`; 80–90% of selections are whole-pack (`whole_selected` vs `range_selected`) |
| One cold FUSE lookup on a 10,000-entry folder | 24.4 statements, 48 KB pack read, 0.43 ms | `ls -l` 100 / 1,000 / 10,000: 24.5 / 24.4 / 24.4 stmts per entry (linear) |
| One cold path component (`stat` 7 deep) | ~87 statements, 2.4 ms | 612 stmts / 7 lookups |
| First `stat` in a fresh Workspace, root file | 45 statements, 15 transactions, 22 KB BLOB | the ~1,250 statements quoted in #352 do not reproduce at this binary for a shallow path; 612 at depth 7 |
| Tree size (r14 2.3k entries → r17 51k entries) | first `stat` 174 → 207 statements; small Commit 21.5 → 19.8 ms | sub-linear (tree height) |
| History depth (r15 → r16 → r17) | first `stat` 156 → 189 → 207 statements | follows tree shape, not chain length |
| Daemon service share of wall | 85–89% of walk wall time is inside FUSE request service (`served_ns`); owner-lock hold ≤ 11% of wall and wait ≤ 0.21 s on read-only cases | `kernel_opcodes.served_ns`, `owner.hold_ns_general`, `owner.lock_wait_ns_general` |
| Owner lock on mutation cases | wait 2.25 s + hold 2.41 s in 10.0 s (`rm -rf` created); wait 2.53 s in 12.1 s (first install); wait 2.21 s in 63.9 s (`cp -a`) — sums over FUSE workers | same |
| Commit construction after a 47,934-inode install | 17.45 s in `captured.namespace`; 890,272 overlay record jobs (~18.6 per inode); 799,431 `fresh_points`, 541,905 `header_points` | trace `construction` counters |
| `rm -rf` of a Workspace-created tree | 0 Store statements; 223,334 owner jobs for 211,093 served FUSE requests (1.06 each); 8.9 s served | overlay-side only |

## 4. Shared causes (with evidence)

**C1 — The daemon cache is 64 KiB, so nothing a walk reads survives to the next
request.** The SDK starts every daemon with `cache_bytes: 65536`
(`sdk/js/native/src/sandbox.rs:61`; the daemon's own default is 8 MiB,
`layerfs-daemon/src/install_types.rs:24`). A walk authenticates 57–555 MB of
objects; the cache evicts 57k–426k objects per walk and misses ~1 time per
request. Steady `find` costs the same as cold (50,014 misses for 50,014
requests; 7.7 s vs 8.5 s). The SDK's in-process Store cache is also 64 KiB
(`store_service.rs:34`): `fs.grep` steady = cold to the statement.

**C2 — Each object fetch costs ~6 SQL statements and ~2 read transactions, and
reads a whole pack.** Across every walk case: 5.5–6.2 statements and 1.8–2.1
transactions per Store reader request; pack bytes read are 5.4–82× the bytes
the reads authenticate, with 80–90% of pack selections whole-pack
(`whole_due_density`). `ls -l` of 10,000 entries reads 476 MB of packs for
5.8 MB of objects. This is #354's Store read path (its measured ~28
statements per `FileView::open` covers a larger unit than one request).

**C3 — Missing names are not cached by the kernel.** A LOOKUP that finds
nothing is answered with an ENOENT error (`layerfs-fuse/src/request/reply.rs`
`attributes()`, `self.error(refusal(reason))`), not a zero-inode entry with a
TTL, so the kernel asks again every time. vitest: 18,737 of 19,860 cold
lookups are ENOENT and **18,703 of 18,704 steady lookups are ENOENT again**;
first `pnpm install`: 53,496 of 57,975; `cp -a`: 46,724 (create's
pre-lookups). Each one costs Store reads (C1, C2).

**C4 — One LOOKUP per listed entry.** READDIRPLUS is not offered
(`layerfs-fuse/src/operations/unsupported.rs`; `mount/profile.rs` selects
`FUSE_ASYNC_READ | FUSE_BIG_WRITES | FUSE_MAX_PAGES`). `ls -l` of N entries
issues N lookups, each a separate request with its own Store reads: linear at
24.4 statements per entry.

**C5 — A `stat` walks four metadata objects.** A cold path component costs
~87 statements; the inode's mode and mtime live in a Chunk + ExtentLeaf +
FileState + AttributeLeaf tree (STORAGE_BATCH_SPEC §4). #360 item 2 (inline
mode/mtime) removes that walk for every rewritten inode.

**C6 — Removing files costs overlay jobs, not Store reads.** `rm -rf` of a
tree the Workspace itself created runs **zero** Store statements yet takes
10.0 s vs 0.54 s native: 211,093 served requests (about 4.5 per removed
entry), one owner job each, with 2.25 s of owner-lock wait and 2.41 s of hold
summed over the FUSE workers; 8.9 s served. For a
committed tree the same removal adds 1.46 M Store statements (C1, C2) on top:
34.1 s vs 0.48 s. This is #356.

**C7 — Commit construction after a large install does ~18 overlay record jobs
per inode.** 19.8 s for 47,934 inodes, 17.45 s of it in `captured.namespace`
with one construction worker; 890,272 record jobs; point reads dominate
(`fresh_points` 799,431, `header_points` 541,905).

What is **not** a cause here: owner-lock contention on read-only cases (hold
≤ 11% of wall, wait ≤ 0.21 s; it does appear on mutation cases, C6), full scans (`fullscan_steps` 0 in every case), tree size
and history depth for single-path operations (§3).

## 5. What each cause costs, per case

| Case | C1 cache | C2 fetch | C3 ENOENT | C4 per-entry lookup | C5 metadata walk | C6 overlay rm | C7 construction |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| `find`, `ls -R`, `du` | ● | ● | | ● | ● | | |
| `grep -r`, `fs.grep` | ● | ● | | | ● | | |
| `ls -l` large folder | ● | ● | | ● | ● | | |
| vitest, `node` require, `tsc -b` | ● | ● | ● | | ● | | |
| first `pnpm install` + Commit | | ● | ● | | | | ● |
| `cp -a` | ● | ● | ● | | ● | | |
| `rm -rf` committed / created | ● | ● | | ● | ● | ● | |
| `git status` | ● | ● | ● | | ● | | |

## 6. Proposed budgets (for owner approval)

Budgets are checked on this harness (same Store, image, arms and cache
declaration), one sample per arm. Counts are binding; wall ratios are binding
in a quiet window. "Native" is the same command in the same container.

| Operation | Now (cold / steady) | Budget cold | Budget steady | Main causes |
| --- | --- | --- | --- | --- |
| Store reader request | 6 stmts, 2 txn, pack/auth 5–82× | ≤ 2 statements, 1 transaction; pack/auth ≤ 2× | — | C2 |
| Whole-tree walk: `find`, `ls -R`, `du -s` | 66–236× / 74–113× | ≤ 10× native | ≤ 2× native; misses ≤ 5% of cold | C1, C2, C4, C5 |
| `ls -l` of 10,000 entries | 128× / 4.2× | ≤ 10×; ≤ 3 statements per entry | ≤ 2× | C2, C4 |
| `grep -r` whole tree | 64× / 54× | ≤ 5× | ≤ 2× | C1, C2 |
| `fs.grep` whole tree | 10.6 s, 660k stmts, 2.8 GB / same | ≤ 2 s; BLOB bytes ≤ 1.2× file bytes | ≤ cold ÷ 2 | C1, C2 (#354) |
| `fs.glob` | 146 ms, 8.2k stmts | ≤ 30 ms | — | C2 (#354) |
| first `stat`, depth d | 45 (d=1) … 612 (d=7) stmts; 3.3 / 16.9 ms | ≤ 10 statements per component; ≤ 2× native at d=1, ≤ 3 ms at d=7 | ≤ 1.2× | C2, C5 |
| vitest, `pnpm install` reinstall | 3.2–3.5× / 1.4–3.2× | ≤ 1.5× | ≤ 1.3×; ENOENT lookups served ≤ 10% of cold | C1, C2, C3 |
| `tsc -b`, `node` require | 8–10× / 2–2.6× | ≤ 2× | ≤ 1.3× | C1, C2, C3 |
| `git status` | 9.8× / 60× | ≤ 3× | ≤ 3× | C1, C2, C3 |
| first `pnpm install` | 2.5× | ≤ 1.5× | — | C2, C3 |
| Commit after first install (48k inodes) | 19.8 s | ≤ 5 s; ≤ 4 record jobs per inode | — | C7 |
| `rm -rf` committed `node_modules` | 71× (34.1 s) | ≤ 5× | — | C1, C2, C6 (#356) |
| `rm -rf` of a created tree | 18.5× (10.0 s) | ≤ 3× | — | C6 (#356) |
| `cp -a node_modules` | 38× | ≤ 5× | — | C1, C2, C3 |
| small Commit, `branch.merge` | 20 ms / 18 ms | no regression (≤ 1.1×) | — | — |

No budget may be met by changing a workload, a timeout or the cache
declaration of the native arm; a larger daemon cache must stay bounded and
declared (AGENTS §1), and its RSS is reported beside the timing.

## 7. Fix plan

| Order | Fix | Causes | Owner / issue | Expected effect (to be measured) |
| ---: | --- | --- | --- | --- |
| 1 | Bounded daemon cache sized for a walk's metadata (the daemon default is 8 MiB; the SDK passes 64 KiB), with RSS reported; same for the SDK process | C1 | #357 (Sandbox config, `sdk/js/native/src/sandbox.rs:61`); #356 already plans 8 MiB; SDK cache with #354 | steady walks drop to the kernel-warm cost; no change for cold |
| 2 | Store read path: one read transaction per request, fewer statements per fetch, range reads instead of whole packs for small objects | C2 | **#354** (owns the Store read path; its results are input here) | every row of §2 |
| 3 | Cached negative lookups (zero-inode entry with a TTL, invalidated by the Workspace's own create) | C3 | #357 | vitest/pnpm/`git`/`cp` steady ENOENT traffic → ~0 |
| 4 | READDIRPLUS (entries and attributes in one reply) | C4 | #357 (FUSE) | `ls -l`, `find`, `du`: one request per directory page, not per entry |
| 5 | Inline mode/mtime in the inode value | C5 | #360 item 2 (in progress, `issue360-storage`) | ~4 fewer object reads per cold component; storage −13…16% |
| 6 | `rm -rf`: overlay jobs per unlink, base reads for whiteouts | C6 | **#356** | `rm` rows |
| 7 | Commit construction record jobs per inode | C7 | new item under #357 or its own issue (owner's call); Commit files `commit.rs` belong to #353/#355 — construction is in `layerfs-workspace/src/construction/namespace/` | Commit after install |

Items 1, 3 and 4 are independent of #354 and small; item 2 is the largest and
benefits every case. I propose the order 1 → 2 → 3 → 4 → 6 → 7, with item 5
landing in parallel.

## 8. Cases run and not run

Run (36 cases, all COMPLETE, outputs agree): vitest (native, lfs parts),
`tsc -b`, pnpm reinstall, first pnpm install + Commit, node require, `find`,
`ls -R`, `grep -r`, `du -s`, `cp -a`+`rm -rf` created, `rm -rf` committed,
git status/add/commit, first `stat` (root, depth 7), first open, small Commit,
merge, `fs.read`, `fs.list`, `fs.glob`, `fs.grep`, folder 100/1,000/10,000
(`ls -l`, `stat`), tree r14/r17 (`stat`, `find`, small Commit), depth
r15/r16/r17 (`stat`).

Not run: Durable (`NOT_RUN — disabled by owner until explicit
reauthorization`); a cold-disk arm (the Store stays in the VM page cache after
the clone; not controllable in this setup); syscall traces (`strace` is not in
the pinned image; adding it is a new dependency).

Diagnostic runs (label `diagnostic`, base binary `57141b57`, load average up
to 32) are retained in the ledger (seq 1–101) and not used for numbers above.

## 9. Gaps

- SQLite page-cache hits/misses: rusqlite 0.40.2 exposes no
  `sqlite3_db_status`; no `unsafe` was added. Pack/BLOB bytes stand in.
- Head cost (reachable bytes of the newest version) needs an operator
  reachability walk that does not exist yet (#360 storage counters).
- Timings were taken at load average 6–7 from other sessions; counts are
  unaffected. A quiet-window rerun is one command per case
  (`~/lfs-history/runs/issue359/measured.sh`).
- `du` apparent sizes differ by directory `st_size` (§1) — a visible
  difference from native, not investigated further here.
