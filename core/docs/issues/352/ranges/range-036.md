# Range 036 · **watch** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r035 (live Store)
dsh `ec47f2e40`..`b97b1b4a3` · **63 commits** (1 mainline, 62 side) · 2026-07-15 → 2026-07-24
Areas changed: `.agents/notes` 72% · `docs/core-data-structures` 16% · `scripts/snapshots` 4% · other 8%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 11 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.19×** · **Churn 0.00**
**Time split:** play 87.5 s · git 72.5 s · Node 110.3 s · verify 7.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **744.1 MiB** (+3.5 MiB) | **983.6 MiB** (+37.4 MiB) live | **1.32×** (prev 1.28×) | **39.9 MiB** | **2,990** (total 42,419) | **213.3 s** tooling (total 107.9 min) |

**Checks:** 14 pass · 5 watch: Speed branch.diff_branches >64 entries · uncontended: 5.58× baseline (no phase); Scaling not judged: stat (chain-bounded): 6 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters not judged: stat.statements (chain-bounded): 6 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (9 classes too narrow); Directory share 0.508
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ fs.read p95 −74% · ▲ metadata added +56% · ▼ probe diff_files −55%
**Budget:** 37 of 202 ranges · projected total 15.7 h (budget 16.8 h) · disk 37% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **545 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 3,768 / 3,768 outcomes as planned |
| Conflicts | **2 / 2 planned hit · 0 unplanned** |
| Unit tests | — (not played in P3) |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2617 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 382 bin shims, 4098 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **154 picks** in 3 merges (154 under node_modules) · re-installed after the merge |
| Ignored files | as expected |
| Milestone | — |
| Git | **HEAD = checkpoint `b97b1b4a3`** · 147 commits written for 147 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 154 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r036-1-docs-rfc | end | `26620eabd78a` | `f3e5c0d9bbe5` | pass (385 normalized) | pass | pass | n/a | n/a | n/a |
| r036-2-agents-notes | end | `86eadf1f9224` | `f3e5c0d9bbe5` | pass (385 normalized) | pass | pass | n/a | n/a | n/a |
| r036-3-docs-core-data-structure | end | `709a236282e9` | `f3e5c0d9bbe5` | pass (385 normalized) | pass | pass | n/a | n/a | n/a |
| lead | repair | `9bfdc1e289f8` | `null` | n/a | pass | n/a | n/a | n/a | pass (121,358 rewritten) |

P5 skip list (failing natively, set at calibration): none.

## 2. Activity

**4,405 calls** · **108 steps** by **4 agents + lead** on **3 Branches + main** · **155 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +806 added · 1,862 modified · −452 deleted · 12.7 MiB written · fs 2,872 : Sandbox 248 (**12 : 1**, reported only in P3)
**Execs:** 448 (JS 36 · shell 412) · 0 non-zero exits · install 0 · test runs 0 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 3,100 | 2,885 | 215 | Committed 2,885 · NoSuchPath 24 · Text 8 |
| sandbox | 909 | 595 | 4 | commit 147 (Committed 120, UpToDate 26, Conflict 1) · exec 448 (exit:0 448) · mount 155 (Mounted 155) · status 4 · unmount 155 (Unmounted 155) |
| branch | 385 | 31 | 354 | diff_branches 17 · diff_commits 337 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,405** | **3,511** | **584** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r036-1-docs-rfc | a01 | 12 | 1,193 | ✓ | — |
| r036-2-agents-notes | a02 a03 | 28 | 730 | ✓ | — |
| r036-3-docs-core-data-structure | a04 a05 a06 a07 a08 | 62 | 433 | ✓ | — |
| main | lead | 6 | 634 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r036-2, a03 after a02 | 0.1 s |
| Stale clean merge | 0 / 0 | — | — |
| Decoy edit | 1 / 1 | r036-2, a03 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r036-1 | 12 | 4 | 8 | 0 | 0 | 1,193 | — |
| a02 | r036-2 | 23 | 4 | 19 | 0 | 0 | 728 | commit-conflict, decoy |
| a03 | r036-2 | 5 | 1 | 4 | 0 | 0 | 2 | commit-conflict, decoy |
| a04 | r036-3 | 62 | 27 | 35 | 0 | 0 | 433 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 634 | — |
| **Total** |  | **108** | **37** | **66** | **5** | **0** | **2,990** | **2** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 80 · pnpm 1 · tsc 0 · vitest 0 · other 367

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r036-1-docs-rfc | 8 | 8 | 8 | 0 | 8 | 1,275 |
| r036-2-agents-notes | 22 | 22 | 22 | 0 | 22 | 1,068 |
| r036-3-docs-core-data-structure | 43 | 43 | 43 | 0 | 43 | 601 |
| **lead** | — | — | — | — | 147 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r036-1-docs-rfc | 0 | 1 | 0 | 0 | 0 | — / — |
| r036-2-agents-notes | 0 | 1 | 0 | 0 | 0 | — / — |
| r036-3-docs-core-data-structure | 0 | 1 | 0 | 0 | 0 | — / — |
| **lead repair** | 1 | — | 0 | — | — | 121,358 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r035) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 740.6 MiB (20.6 MiB / 625.6 MiB / 18.6 MiB / 75.7 MiB) | 744.1 MiB (22.0 MiB / 625.6 MiB / 18.6 MiB / 77.8 MiB) | +3.5 MiB |
| Version figures from | — | incremental (61,240 changed paths) | — |
| Files / directories / symlinks | 54,671 / 9,004 / 4,106 | 55,026 / 9,016 / 4,106 | +355 / +12 / +0 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 946.2 MiB | 983.6 MiB | +37.4 MiB |
| **Space amplification** (total · tracked) | 1.28× · tracked 4.82× | 1.32× · tracked 4.76× | 0.04 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **13.82** (5.00 / 1.74 / 6.21) | 2.42× the median range |
| **Stored per Commit** | 28.5 KiB | 12.8 KiB | — |
| Metadata share | 0.39 | 0.40 | this range 0.51 |
| History: Commits / Layers / Branches | 39,429 | 42,419 / 22 / 414 | +2,990 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 5.91 GiB (Commits 3.98 GiB · installs 889.0 MiB · build 105.9 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 42.42 GiB / 37% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 588.3 MiB | 0.79 | +14.4 MiB |
| Metadata | 85.0 MiB | 0.11 | +5.0 MiB |
| Index rows + waste + other (live, not split) | 310.3 MiB | 0.42 | — |
| **Total = Store on disk** | **983.6 MiB** | **= 1.32** space amplification | +37.4 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 22.0 MiB | 104.8 MiB (59.4 MiB + 45.4 MiB) | 4.76× | — | 5.6 MiB | 2.9 MiB | 1.92 |
| `node_modules` | 625.6 MiB | 199.5 MiB (180.9 MiB + 18.6 MiB) | 0.32× | — | 899.8 KiB | 0.0 KiB | — |
| Build output | 18.6 MiB | 15.5 MiB (14.5 MiB + 1.1 MiB) | 0.83× | — | 0 | 0.0 KiB | — |
| `.git` | 77.8 MiB | 325.1 MiB (312.3 MiB + 12.8 MiB) | 4.18× | — | 13.0 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 310.3 MiB | — (not divided) | — | 17.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 28.5 MiB | — | — | — | — | — |
| **Total** | — | **983.6 MiB** | **= 1.32×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +7,161 | — | 0 (derived) | 49% |
| Chunks (large files) | — (at snapshots) | +507 | — | — | 0% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 7,517 (with inodes, pooled) | — | — | 71% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,110 | — | — | — |

Delta: 3.5% at depth cap · 14% of refused bases stopped by budget · `node_modules` reinstall: no changed packages: 821275 new stored bytes

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.76× (104.8 MiB for 22.0 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.9 KiB / 6.0 KiB / 9.7 KiB over 220 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.19× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (899.8 KiB stored for 1.83 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.44 (3 lanes × 744.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 1.7 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 6.7 ms / 20.6 ms (0.72×) | 2.5 ms / 3.2 ms (1.16×) | 5.4 ms / 7.2 ms (2.15×) | 18.2 ms / 85.0 ms (1.07×) | 9.1 ms / 13.2 ms (0.82×) | 293 ms / 293 ms (3.19×) | — (native comparison in P3; exec 39.7 ms / 745 ms) |
| SQL p50: 152 stmts | 55 stmts | 96 stmts | 205 stmts | 45 stmts | 9,363 stmts | — |

**Commit cost:** 2.34 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 550 ms p50 over 155
**Slowest:** sandbox.exec 32009 ms · sandbox.exec 22417 ms · sandbox.exec 22333 ms · checkpoint diff_commits 0.10 ms and 1.51 statements per entry (61,193 entries per page)
**Scaling:** 14 of 15 probes flat · `glob_tree` 0.76

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 299 ms / 299 ms | — / — | — | git / status-cold: — |
| git status (steady) | 339 ms / 429 ms | — / — | — | git / status-steady: — |
| git add | 26.0 ms / 357 ms | — / — | — | git / add: — |
| git commit (lane) | 32.0 ms / 59.0 ms | — / — | — | git / commit: — |
| lead writes main | 4241 ms / 4241 ms | — / — | — | — |
| repack | 2359 ms / 2359 ms | — / — | — | — |
| pnpm install (incremental) | — / — | 3363 ms / 3363 ms | — | pnpm-reinstall / cold: — |
| pnpm refresh | 2653 ms / 2653 ms | 1686 ms / 1686 ms | 1.57× | pnpm-reinstall / steady: — |
| tsc -b | — / — | — / — | — | tsc-b / cold: — |
| vitest | — / — | — / — | — | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.8 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.4 ms / 16.2 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a6 | 17442 | 329.4 | 7.23 (1.23×) · 7012 · 308 (13 solo) | 7.31 (1.18×) · 6681 · 272 (125 solo) | 8.33 (1.14×) · 7276 · 340 (134 solo) | 2.48 (1.24×) · 3475 · — (0 solo) | 9.64 (1.06×) · 1337 · — (daemon) | 9.40 (1.13×) · 5265 · — (daemon) | 2709.77 (—×) · 15044810 · 26378 (3 solo) |
| 019.a4 | 18401 | 354.7 | 8.18 (1.39×) · 5950 · 250 (11 solo) | 8.63 (1.39×) · 6703 · 302 (93 solo) | 9.84 (1.35×) · 7721 · 357 (108 solo) | 3.23 (1.62×) · 4209 · 60 (2 solo) | 11.03 (1.21×) · 1337 · — (daemon) | 9.98 (1.20×) · 4896 · — (daemon) | 803.54 (—×) · 1377824 · 7245 (4 solo) |
| 020.a2 | 19322 | 374.1 | 7.09 (1.20×) · 6694 · 244 (50 solo) | 7.68 (1.24×) · 6821 · 267 (106 solo) | 8.57 (1.17×) · 7330 · 294 (92 solo) | 2.43 (1.22×) · 3716 · 207 (1 solo) | 10.00 (1.10×) · 1337 · — (daemon) | 9.37 (1.12×) · 5130 · — (daemon) | 888.05 (—×) · 1899898 · 9363 (3 solo) |
| 021.a2 | 20774 | 406.1 | 9.35 (1.58×) · 7305 · 274 (9 solo) | 8.02 (1.29×) · 5651 · 265 (69 solo) | 9.12 (1.25×) · 7036 · 322 (54 solo) | 2.20 (1.11×) · 3028 · — (0 solo) | 11.71 (1.28×) · 1337 · — (daemon) | 9.72 (1.16×) · 5225 · — (daemon) | 1007.13 (—×) · 844072 · 9186 (4 solo) |
| 022.a1 | 23062 | 444.9 | 7.04 (1.19×) · 5812 · 234 (17 solo) | 7.11 (1.14×) · 5968 · 218 (106 solo) | 8.58 (1.18×) · 6594 · 283 (105 solo) | 1.90 (0.95×) · 2092 · 63 (2 solo) | 10.46 (1.15×) · 1337 · — (daemon) | 9.07 (1.09×) · 4334 · — (daemon) | 1654.50 (—×) · 2513563 · 16357 (3 solo) |
| 023.a1 | 24522 | 506.8 | 7.57 (1.28×) · 5717 · 216 (7 solo) | 7.31 (1.18×) · 5936 · 261 (45 solo) | 7.92 (1.09×) · 6044 · 311 (37 solo) | 2.25 (1.13×) · 2690 · 179 (1 solo) | 9.78 (1.07×) · 1362 · — (daemon) | 9.51 (1.14×) · 4280 · — (daemon) | 283.86 (—×) · 464325 · 8582 (3 solo) |
| 024.a1 | 25762 | 537.2 | 7.75 (1.31×) · 6210 · 204 (27 solo) | 7.40 (1.19×) · 6347 · 242 (105 solo) | 7.97 (1.09×) · 6562 · 255 (134 solo) | 2.74 (1.38×) · 3257 · 78 (4 solo) | 11.01 (1.21×) · 1425 · — (daemon) | 9.24 (1.11×) · 3987 · — (daemon) | 455.67 (—×) · 674403 · 8922 (3 solo) |
| 025.a1 | 27563 | 627.9 | 9.69 (1.64×) · 7543 · 236 (1 solo) | 8.21 (1.32×) · 5480 · 251 (10 solo) | 8.21 (1.13×) · 5279 · 310 (6 solo) | 3.04 (1.53×) · 3708 · — (0 solo) | 11.06 (1.21×) · 1362 · — (daemon) | 9.32 (1.12×) · 3909 · — (daemon) | 229.07 (—×) · 361898 · 6093 (3 solo) |
| 026.a1 | 29975 | 669.9 | 6.47 (1.10×) · 6137 · 222 (56 solo) | 6.76 (1.09×) · 6376 · 256 (222 solo) | 7.59 (1.04×) · 6682 · 294 (198 solo) | 2.36 (1.19×) · 3365 · 79 (1 solo) | 10.01 (1.10×) · 1362 · — (daemon) | 8.93 (1.07×) · 5092 · — (daemon) | 333.81 (—×) · 621744 · 11927 (3 solo) |
| 027.a2 | 30629 | 688.0 | 7.75 (1.31×) · 6978 · 228 (24 solo) | 8.12 (1.31×) · 7581 · 288 (119 solo) | 8.98 (1.23×) · 7186 · 327 (41 solo) | 2.71 (1.36×) · 3304 · — (0 solo) | 10.03 (1.10×) · 1362 · — (daemon) | 10.59 (1.27×) · 5757 · — (daemon) | 392.93 (—×) · 655226 · 8832 (3 solo) |
| 028.a2 | 32548 | 737.6 | 6.63 (1.12×) · 5906 · 230 (9 solo) | 6.89 (1.11×) · 5882 · 223 (70 solo) | 8.07 (1.11×) · 6405 · 309 (100 solo) | 2.35 (1.18×) · 3179 · 46 (8 solo) | 10.04 (1.10×) · 1362 · — (daemon) | 10.11 (1.21×) · 4374 · — (daemon) | 268.20 (—×) · 418356 · 8462 (4 solo) |
| 029.a1 | 33478 | 774.1 | 9.40 (1.59×) · 8741 · 379 (13 solo) | 8.42 (1.36×) · 6823 · 370 (55 solo) | 8.70 (1.19×) · 6867 · 351 (26 solo) | 2.57 (1.29×) · 3834 · 55 (2 solo) | 10.23 (1.12×) · 1362 · — (daemon) | 8.83 (1.06×) · 4530 · — (daemon) | 454.73 (—×) · 806701 · 10820 (4 solo) |
| 030.a1 | 35023 | 803.7 | 11.61 (1.97×) · 6627 · 246 (20 solo) | 8.70 (1.40×) · 6083 · 271 (95 solo) | 8.80 (1.21×) · 6033 · 300 (131 solo) | 3.05 (1.53×) · 3118 · 48 (2 solo) | 12.55 (1.38×) · 1362 · — (daemon) | 10.40 (1.25×) · 4431 · — (daemon) | 319.45 (—×) · 470795 · 10330 (3 solo) |
| 031.a1 | 35351 | 835.9 | 10.84 (1.84×) · 9623 · — (0 solo) | 7.16 (1.15×) · 5428 · 604 (5 solo) | 7.65 (1.05×) · 5813 · 375 (2 solo) | 2.45 (1.23×) · 3199 · — (0 solo) | 9.88 (1.08×) · 1362 · — (daemon) | 8.96 (1.07×) · 3894 · — (daemon) | 2.22 (—×) · 517 · 29 (2 solo) |
| 032.a1 | 36538 | 870.9 | 8.46 (1.43×) · 7501 · 364 (16 solo) | 8.20 (1.32×) · 7234 · 347 (148 solo) | 8.68 (1.19×) · 7395 · 379 (121 solo) | 2.78 (1.39×) · 3904 · — (0 solo) | 10.21 (1.12×) · 1362 · — (daemon) | 8.89 (1.07×) · 4608 · — (daemon) | 411.44 (—×) · 721312 · 10559 (4 solo) |
| 033.a1 | 37184 | 890.5 | 8.67 (1.47×) · 6143 · 211 (1 solo) | 7.75 (1.25×) · 6430 · 313 (52 solo) | 8.79 (1.20×) · 6155 · 349 (41 solo) | 2.20 (1.10×) · 2939 · — (0 solo) | 10.93 (1.20×) · 1362 · — (daemon) | 9.95 (1.19×) · 3945 · — (daemon) | 275.58 (—×) · 323482 · 7567 (3 solo) |
| 034.a1 | 38594 | 922.8 | 8.67 (1.47×) · 7209 · 251 (12 solo) | 7.74 (1.25×) · 6773 · 286 (41 solo) | 8.25 (1.13×) · 6167 · 285 (64 solo) | 2.67 (1.34×) · 3236 · 109 (3 solo) | 9.90 (1.09×) · 1362 · — (daemon) | 11.18 (1.34×) · 5652 · — (daemon) | 323.49 (—×) · 478357 · 9655 (3 solo) |
| 035.a1 | 39429 | 946.2 | 9.31 (1.58×) · 7774 · 496 (3 solo) | 7.08 (1.14×) · 6352 · 374 (14 solo) | 7.95 (1.09×) · 6919 · 379 (35 solo) | 2.90 (1.45×) · 3561 · — (0 solo) | 9.60 (1.05×) · 1362 · — (daemon) | 9.73 (1.17×) · 5136 · — (daemon) | 1.65 (—×) · 517 · 42 (2 solo) |
| 036.a1 | 42419 | 983.6 | 4.94 (0.84×) · 4436 · 191 (10 solo) | 5.16 (0.83×) · 4546 · 179 (108 solo) | 5.66 (0.78×) · 4695 · 263 (58 solo) | 2.39 (1.20×) · 3015 · — (0 solo) | 9.14 (1.00×) · 1362 · — (daemon) | — (—×) · — · — (daemon) | 293.22 (—×) · 516618 · 9785 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 1755152 → 4194304 B · fs.write ≤8 KiB 931152 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 2533832 → 2892272 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 6.34 at the first command → 5.16 after the last (max 6.62 over 6 commands) · Docker VM 1.16 → 3.01

**Control probe** (one sample per arm, same window and binaries; (a) the range 15 Store, (b) the range's). Gap: each clone is copied just before its arm, which warms the OS cache equally in both, so the control cannot see a cold-read effect of a larger Store (storage reads are 0 in both arms); it compares warm-cache work only.

| Sample | (a) Commits · MiB | (b) Commits · MiB | fs.write ≤1 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.write ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.read ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | Host load (macOS) | Watch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| control-017.diag-15v17 | 12851 · 207.8 | 15811 · 265.7 | failed: (a) 0 of ? calls ok, (b) 0 ok | failed: (a) 0 of ? calls ok, (b) 0 ok | 2.79 (1.00× first) / 2.43 · 0.87× · 73/57 | 9.15 → 9.53 | not judged (failed calls) |
| control-017.diag-15v17-2 | 12851 · 207.8 | 15811 · 265.7 | 6.21 (1.00× first) / 6.63 · 1.07× · 114/112 | 6.39 (1.00× first) / 6.40 · 1.00× · 109/110 | 2.59 (0.93× first) / 2.32 · 0.89× · 73/57 | 11.39 → 10.96 | pass |
| control-018.a1 | 12851 · 207.8 | 17442 · 328.3 | 6.63 (1.07× first) / 7.01 · 1.06× · 113/112 | 6.46 (1.01× first) / 6.41 · 0.99× · 108/108 | 2.74 (0.98× first) / 2.53 · 0.92× · 73/70 | 10.05 → 10.05 | pass |
| control-018.a2 | 12851 · 207.8 | 17442 · 328.4 | 6.23 (1.00× first) / 6.62 · 1.06× · 116/111 | 6.37 (1.00× first) / 6.24 · 0.98× · 110/109 | 2.41 (0.86× first) / 2.35 · 0.97× · 73/67 | 9.83 → 9.69 | pass |
| control-018.a3 | 12851 · 207.8 | 17442 · 328.3 | 6.67 (1.08× first) / 6.47 · 0.97× · 109/111 | 6.72 (1.05× first) / 6.49 · 0.97× · 109/109 | 2.73 (0.98× first) / 2.61 · 0.96× · 73/70 | 8.25 → 8.25 | pass |
| control-018.a4 | 12851 · 207.8 | 17442 · 328.7 | 6.53 (1.05× first) / 6.95 · 1.06× · 110/129 | 6.44 (1.01× first) / 6.80 · 1.06× · 109/110 | 2.60 (0.93× first) / 2.89 · 1.11× · 73/71 | 10.05 → 10.29 | pass |
| control-018.a6 | 12851 · 207.8 | 17442 · 329.4 | 6.35 (1.02× first) / 6.26 · 0.99× · 115/116 | 6.28 (0.98× first) / 5.97 · 0.95× · 108/111 | 3.14 (1.13× first) / 2.24 · 0.71× · 73/77 | 6.84 → 6.84 | pass |
| control-019.a3 | 12851 · 207.8 | 18401 · 354.4 | 5.85 (0.94× first) / 5.96 · 1.02× · 113/116 | 5.50 (0.86× first) / 6.08 · 1.11× · 108/113 | 2.39 (0.86× first) / 2.31 · 0.96× · 74/75 | 10.18 → 11.45 | pass |
| control-019.a4 | 12851 · 207.8 | 18401 · 354.7 | 6.15 (0.99× first) / 7.52 · 1.22× · 111/138 | 6.76 (1.06× first) / 6.60 · 0.98× · 108/111 | 2.80 (1.01× first) / 2.51 · 0.90× · 74/76 | 10.96 → 10.57 | pass |
| control-020.a1 | 12851 · 207.8 | 19322 · 374.2 | 6.10 (0.98× first) / 7.15 · 1.17× · 112/141 | 6.20 (0.97× first) / 5.95 · 0.96× · 109/110 | 2.48 (0.89× first) / 2.40 · 0.97× · 70/79 | 10.08 → 9.76 | pass |
| control-020.a2 | 12851 · 207.8 | 19322 · 374.1 | 5.49 (0.88× first) / 6.81 · 1.24× · 113/115 | 5.82 (0.91× first) / 5.75 · 0.99× · 108/112 | 1.96 (0.70× first) / 1.94 · 0.99× · 70/80 | 9.23 → 8.97 | pass |
| control-021.a2 | 12851 · 207.8 | 20774 · 406.1 | 6.48 (1.04× first) / 5.93 · 0.92× · 113/110 | 6.26 (0.98× first) / 5.98 · 0.96× · 107/110 | 2.28 (0.82× first) / 1.97 · 0.86× · 77/86 | 9.19 → 9.19 | pass |
| control-022.a1 | 12851 · 207.8 | 23062 · 442.2 | 6.19 (1.00× first) / 7.39 · 1.20× · 116/115 | 5.89 (0.92× first) / 6.35 · 1.08× · 109/113 | 2.51 (0.90× first) / 2.16 · 0.86× · 92/81 | 9.12 → 8.71 | pass |
| control-023.a1 | 12851 · 207.8 | 24522 · 506.8 | 5.66 (0.91× first) / 5.42 · 0.96× · 114/117 | 5.41 (0.85× first) / 5.50 · 1.02× · 110/116 | 2.86 (1.03× first) / 2.28 · 0.80× · 76/81 | 10.38 → 10.38 | pass |
| control-024.a1 | 12851 · 207.8 | 25762 · 534.5 | 5.86 (0.94× first) / 5.67 · 0.97× · 113/130 | 5.72 (0.90× first) / 5.98 · 1.05× · 111/119 | 2.63 (0.95× first) / 2.54 · 0.97× · 75/78 | 12.49 → 12.13 | pass |
| control-025.a1 | 12851 · 207.8 | 27563 · 627.9 | 10.27 (1.65× first) / 10.70 · 1.04× · 115/119 | 10.78 (1.69× first) / 9.42 · 0.87× · 109/115 | 6.32 (2.27× first) / 6.64 · 1.05× · 75/100 | 11.62 → 12.06 | pass |
| control-026.a1 | 12851 · 207.8 | 29975 · 667.3 | 5.04 (0.81× first) / 6.12 · 1.22× · 115/148 | 5.36 (0.84× first) / 5.56 · 1.04× · 110/119 | 2.24 (0.80× first) / 2.39 · 1.06× · 73/90 | 7.87 → 8.12 | pass |
| control-027.a1 | 12851 · 207.8 | 30629 · 688.1 | 5.59 (0.90× first) / 6.36 · 1.14× · 115/134 | 5.84 (0.91× first) / 6.16 · 1.05× · 108/124 | 2.58 (0.93× first) / 2.33 · 0.90× · 68/80 | 9.22 → 8.97 | pass |
| control-027.a2 | 12851 · 207.8 | 30629 · 688.0 | 6.10 (0.98× first) / 5.69 · 0.93× · 113/129 | 5.39 (0.84× first) / 5.73 · 1.06× · 111/122 | 2.12 (0.76× first) / 1.84 · 0.87× · 68/76 | 11.42 → 10.90 | pass |
| control-028.a1 | 12851 · 207.8 | 32548 · 737.6 | 5.91 (0.95× first) / 6.25 · 1.06× · 115/120 | 5.90 (0.92× first) / 5.67 · 0.96× · 112/118 | 2.56 (0.92× first) / 3.11 · 1.22× · 67/126 | 7.82 → 7.67 | pass |
| control-028.a2 | 12851 · 207.8 | 32548 · 737.6 | 6.12 (0.99× first) / 5.88 · 0.96× · 113/122 | 5.56 (0.87× first) / 5.64 · 1.01× · 110/120 | 2.14 (0.77× first) / 2.71 · 1.26× · 67/127 | 8.05 → 8.05 | pass |
| control-029.a1 | 12851 · 207.8 | 33478 · 771.5 | 5.60 (0.90× first) / 6.23 · 1.11× · 112/135 | 5.49 (0.86× first) / 5.69 · 1.04× · 109/120 | 2.54 (0.91× first) / 2.67 · 1.05× · 71/111 | 6.98 → 8.74 | pass |
| control-030.a1 | 12851 · 207.8 | 35023 · 803.7 | 6.52 (1.05× first) / 6.57 · 1.01× · 115/145 | 5.74 (0.90× first) / 5.93 · 1.03× · 109/122 | 2.34 (0.84× first) / 2.64 · 1.13× · 66/96 | 8.48 → 8.48 | pass |
| control-031.a1 | 12851 · 207.8 | 35351 · 835.9 | 5.70 (0.92× first) / 6.21 · 1.09× · 114/149 | 5.63 (0.88× first) / 6.05 · 1.07× · 110/121 | 2.25 (0.81× first) / 2.54 · 1.13× · 69/87 | 8.96 → 8.88 | pass |
| control-032.a1 | 12851 · 207.8 | 36538 · 868.0 | 6.10 (0.98× first) / 5.38 · 0.88× · 112/149 | 5.68 (0.89× first) / 5.18 · 0.91× · 109/124 | 2.23 (0.80× first) / 2.07 · 0.93× · 72/105 | 7.71 → 7.49 | pass |
| control-033.a1 | 12851 · 207.8 | 37184 · 890.5 | 4.97 (0.80× first) / 5.69 · 1.14× · 113/146 | 4.97 (0.78× first) / 5.09 · 1.02× · 110/125 | 2.22 (0.80× first) / 2.59 · 1.17× · 87/101 | 11.27 → 11.01 | pass |
| control-034.a1 | 12851 · 207.8 | 38594 · 919.9 | 6.44 (1.04× first) / 6.01 · 0.93× · 115/148 | 5.11 (0.80× first) / 5.24 · 1.02× · 111/126 | 2.34 (0.84× first) / 2.42 · 1.03× · 72/106 | 12.20 → 11.47 | pass |
| control-035.a1 | 12851 · 207.8 | 39429 · 946.2 | 5.19 (0.84× first) / 5.65 · 1.09× · 116/128 | 5.27 (0.83× first) / 4.88 · 0.93× · 111/125 | 2.06 (0.74× first) / 2.45 · 1.19× · 72/112 | 8.02 → 7.78 | pass |
| control-036.a1 | 12851 · 207.8 | 42419 · 980.9 | 5.88 (0.95× first) / 5.68 · 0.97× · 113/236 | 5.55 (0.87× first) / 5.36 · 0.96× · 109/129 | 2.03 (0.73× first) / 2.34 · 1.15× · 62/130 | 6.20 → 6.67 | watch (fs.write ≤1 KiB, fs.read ≤8 KiB) |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): watch — fs.write ≤1 KiB, fs.read ≤8 KiB (sample control-036.a1)

## 5. Findings and action

**Optimization:** none — no problems found.

### Open issues touching this range

| Id | Issue | Owner | Next step |
| --- | --- | --- | --- |
| F-002 | full-scan steps on hot paths | lead | see BUGS.md |
| F-006 | health cannot judge overlay files left | the builder | measure it per range, REPORT_FORMAT.md |
| F-007 | Trends were never written | the builder | see BUGS.md |
| F-013 | per-entry gate trips on a fixed per-checkpoint cost | lead | see BUGS.md |
| F-014 | the "one-file" `diff_commits` probe had a drifting input | lead | see BUGS.md |
| F-020 | Store calls cross a Sandbox for no reason | the fixer | now (the builder keeps playing P2 on the current route until the switch) |
| F-025 | Commits queue behind in-lane merges whose path search walks the tree | the fixer | now; fix 1 (top-down path naming) first, then lane narrowing, reads off the writer queue, and fixed per-call costs |
| F-030 | `daemon[].fuse.served` on traced exec lines is cumulative | the builder checks the `oneshot_exec` probe split | 08de4f038 |
| F-031 | the replay's Workspaces have no `.git` | the builder | after the P3 dev checks, measuring Store growth per git commit (index, loose objects, packs) and the wall time added per range |
| F-032 | deleting a base tree over FUSE costs ~0.7 ms per entry | the fixer | after item 7, with per-op timing first (D0) |
| F-033 | `MAXIMUM_LINEAGE_ROWS` | the fixer | queued after that confirmation**; the lead places it in the item order |
| F-034 | a fresh mount path per mount leaves absolute paths stale | lead | see BUGS.md |
| F-035 | fs read calls scan one byte at a time and re-walk pages | lead | see BUGS.md |
| F-036 | concurrent first installs from two daemons: one Commit fails "object … is not stored" | lead | see BUGS.md |
| F-042 | exec over committed content is slow: vitest 3.7×, `tsc -b` 1.5× native; base reads grow with directory size | the #352 lead and fixer**; the lead places it | see BUGS.md |
| F-044 | a kernel reply computed before a merged install can land after its invalidation | #359** | D-9 lane |
| F-045 | hard-linked files are never entry-cached on the pinned image's kernel | lead | see BUGS.md |
| F-046 | a terminal unmount in two mount tests fails intermittently | lead | see BUGS.md |
| F-047 | `fp21_detach_stages` fails 0/2 after the A1 merge | unassigned** | A1 owner #354 or the lead |
| F-048 | an Unmount without `discard` is refused after an mtime-only Commit | lead | see BUGS.md |
| F-049 | `fp31` TooSmall's staged premise races an early kernel FORGET | unassigned | see BUGS.md |
| F-050 | a full-case `cost.mjs` run warms the daemon cache for its LayerFS arm | unassigned** | the cost harness owner, or #362 |
| F-051 | `kernel_coherence` `size_never_shrinks_under_concurrent_append_and_refusals_stay_refused` failed once | unassigned | see BUGS.md |
| F-052 | a chmod is lost when the other side edits the same file | lead | see BUGS.md |
| F-053 | the SDK discovery lock outlives its Guard across a fork→exec window | lead | see BUGS.md |
| F-054 | a Sandbox's PID 1 never reaps orphaned processes | lead | see BUGS.md |
| F-055 | direct_locking_real's oracle assumes an order the test does not make | lead | see BUGS.md |
| F-056 | a build that rewrites identical outputs is redone after every remount | lead | see BUGS.md |
| F-057 | newest-wins over pnpm's install state lets the repair keep stale hoisting | lead | see BUGS.md |
| F-058 | the native repair chain ran the lanes on top of each other | lead | see BUGS.md |
| F-059 | lanes' stale build output outlives the repair, and the point oracle's base cannot carry it | lead | see BUGS.md |
| F-060 | the native repair chain never applied the consolidation's reconcile | lead | see BUGS.md |

### Lead's note (written by the lead; never empty unless the verdict is pass)

- **a1 (`p3-main-u`, live after r35 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c` from the pinned copy): WATCH, terminal.** Checkpoint ok, git ✓. Node: 11 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass. Control `control-036.a1` passes. Report check F1–F8 PASS.
- **A docs-only range:** no changed package and no test candidates, so P4 and P5 are n/a at every point and the repair ran only its clean relink (no build or test Commit). That is also why the thin `sandbox.commit` "—" class is absent, and Speed is judged for the first time against the re-baseline.
- **Speed** (recorded, fast mode): the only non-pass Speed row is `branch.diff_branches` >64 entries at p95, 289 ms, 5.58× the baseline; its p50 is 17.0 ms (1.05×). That p95 has been 288–351 ms in every range since r31, against pilot-sized trees in the baseline. One-shot Commit 1.07×, write 0.72×, mount 0.82×; read and list are under the 5 ms floor; merge 293 ms (3.19×, as in r31–r35).
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 5.2–6.6.
- Final steps: lanes 50 s + 43 s (cut at plan order 35), repair 79 s, verify 11 s, finish 35 s. Repair install 32.0 s; no build or tests.
- Watch items: index rows + waste + other 310.3 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 6.07 ms per file over 452 calls, 6,410 VM steps (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3768/3768; conflicts 2/2; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_branches >64 entries · uncontended: 5.58× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 6 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | not judged: stat.statements (chain-bounded): 6 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (9 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.508 | < 0.5 | watch |
| Reinstall growth | no changed packages: 821275 new stored bytes | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0348 (budget 0.135) | < 0.1 | pass |
| Range growth | 39.9 MiB, 1.22× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.37 | < 0.8 | pass |
| Wall projection | 0.93 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 147 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 11 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 154 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.19× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 108 | 108 |
| Lanes / agents | 3 / 4 | 3 / 8 |
| LayerFS Commits | 2990 | 2912 |
| Workspaces (one-shot share) | 155 (0.99) | 65 (0.985) |
| Reads | 165 | 165 |
| Reconcile writes | 629 | 629 |
| Left out (not played in this phase) | none | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 17 | 17.01 | 289.05 | 289.05 | 326.02 | 1.05× | 5.58× | -2.91 | -3.16 | 182 / 23,722 / 0 | — | 0.0724 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 2 | 327.87 | 327.87 | 327.87 | 493.09 | no baseline | no baseline | 0.39 | 1.53 | 8,160 / 336,817 / 0 | — | 1.5763 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 330 | 18.80 | 34.33 | 61.58 | 523.58 | 1.09× | 1.32× | -0.36 | -0.50 | 289 / 31,682 / 0 | — | 0.1016 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.80 | 1.69 | 1.69 | 1.73 | 0.88× | 1.28× | -1.90 | -2.17 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.87 | 0.87 | 0.87 | 0.97 | no baseline | no baseline | -0.30 | -0.72 | 70 / 1,298 / 0 | — | 0.0437 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 293.22 | 293.22 | 293.22 | 351.94 | 3.19× | 3.19× | -2.35 | -2.10 | 9,363 / 516,618 / 0 | — | 0.8832 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.90 | 1.90 | 1.90 | 1.90 | 1.22× | 1.22× | -0.02 | 0.99 | 35 / 517 / 0 | — | 0.0042 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 4.94 | 4.94 | 4.94 | 4.94 | 0.98× | 0.98× | -4.93 | -6.12 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 34.13 | 34.13 | 34.13 | 34.13 | 1.40× | 1.40× | 0.04 | 0.66 | 216 / 13,864 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 12 | 9.90 | 17.32 | 17.32 | 44.70 | 0.84× | 1.28× | -9.70 | -6.85 | 336 / 27,394 / 0 | — | 0.022 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 1 | 9.64 | 9.64 | 9.64 | 9.64 | 1.57× | 1.30× | 0.05 | 0.02 | 140 / 6,327 / 0 | — | 0.0211 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 10 | 7.08 | 10.78 | 10.78 | 18.57 | 0.99× | 1.26× | 0.27 | -0.82 | 220 / 11,287 / 0 | — | 0.0271 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 15 | 6.34 | 10.30 | 10.30 | 11.02 | 1.09× | 1.28× | -0.37 | -1.22 | 136 / 8,010 / 0 | — | — | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 2 | 6.47 | 6.47 | 6.47 | 7.49 | 1.04× | 0.70× | -2.23 | -2.84 | 160 / 7,639 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 2 | 7.75 | 7.75 | 7.75 | 9.16 | 2.79× | 2.79× | 2.52 | 2.40 | 195 / 36,387 / 0 | — | 0.1212 ms per file | — |
| fs.glob | 17–64 files · uncontended | 1 | 4.02 | 4.02 | 4.02 | 4.02 | 1.42× | 1.06× | -0.31 | -0.77 | 59 / 6,067 / 0 | — | 0.2114 ms per file | — |
| fs.glob | >64 files · contended | 6 | 7.27 | 8.37 | 8.37 | 10.79 | 1.34× | 1.55× | -0.35 | -0.47 | 178 / 18,799 / 0 | — | 0.1101 ms per file | — |
| fs.glob | >64 files · uncontended | 17 | 6.65 | 9.55 | 9.55 | 10.17 | 0.68× | 0.68× | 2.26 | 0.77 | 105 / 16,379 / 0 | — | 0.0423 ms per file | — |
| fs.grep | 17–64 files · contended | 3 | 17.39 | 17.39 | 17.39 | 19.64 | 2.91× | 2.91× | 0.66 | 1.47 | 543 / 38,401 / 0 | — | 0.2717 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 1 | 6.73 | 6.73 | 6.73 | 6.73 | 1.80× | 1.12× | 2.62 | 2.91 | 157 / 7,459 / 0 | — | 0.7473 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 9 | 18.96 | 24.09 | 24.09 | 25.51 | 1.21× | 1.53× | -0.05 | 0.17 | 615 / 27,031 / 0 | — | 0.1733 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 14 | 16.48 | 20.66 | 20.66 | 21.22 | 0.90× | 0.90× | 1.06 | 0.27 | 410 / 11,612 / 0 | — | 0.0896 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 2.63 | 2.63 | 2.63 | 2.63 | 1.80× | 1.80× | — | — | 58 / 2,890 / 0 | — | 2.635 ms per entrie | — |
| fs.list | 17–64 entries · contended | 9 | 6.48 | 8.50 | 8.50 | 8.96 | 2.70× | 3.54× | 0.95 | 1.38 | 191 / 17,460 / 0 | — | 0.1358 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 15 | 5.39 | 6.55 | 6.55 | 7.16 | 2.15× | 2.23× | 1.34 | 1.50 | 89 / 10,977 / 0 | — | 0.1078 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 1 | 2.07 | 2.07 | 2.07 | 2.07 | 1.10× | 1.01× | 0.87 | -0.02 | 27 / 2,369 / 0 | — | 0.6897 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 2.95 | 2.95 | 2.95 | 2.95 | 1.26× | 1.04× | -2.97 | -1.85 | 46 / 4,450 / 0 | — | 0.3279 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 1 | 2.92 | 2.92 | 2.92 | 2.92 | 1.54× | 0.77× | 1.21 | 0.91 | 58 / 4,821 / 0 | — | 0.325 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 2 | 2.54 | 2.54 | 2.54 | 2.88 | 1.14× | 1.14× | -1.32 | -1.71 | 66 / 4,071 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 6 | 2.71 | 3.11 | 3.11 | 4.33 | 1.71× | 1.96× | 0.86 | 0.26 | 55 / 3,569 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 2.48 | 2.74 | 2.74 | 3.22 | 1.18× | 0.46× | -2.22 | -2.51 | 122 / 8,396 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 12 | 2.39 | 2.74 | 2.74 | 3.15 | 1.16× | 0.77× | 0.05 | -0.26 | 45 / 3,015 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.rm | 1 files · uncontended | 452 | 6.07 | 8.25 | 9.74 | 25.91 | 0.90× | 0.74× | -2.78 | -3.36 | 127 / 6,410 / 0 | — | 6.066 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 6 | 2.23 | 2.83 | 2.83 | 3.56 | 1.03× | 1.27× | -3.15 | -2.74 | 70 / 3,564 / 0 | — | 0.0055 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 13 | 2.62 | 2.98 | 2.98 | 3.34 | 1.71× | 1.94× | -0.17 | 0.33 | 47 / 3,261 / 0 | — | 0.0059 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 4 | 2.76 | 2.85 | 2.85 | 3.40 | 1.06× | 0.83× | -0.71 | -0.45 | 50 / 3,847 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 2 | 2.10 | 2.10 | 2.10 | 2.72 | 1.07× | 0.97× | 3.02 | 1.72 | 44 / 3,497 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 1 | 3.20 | 3.20 | 3.20 | 3.20 | 1.42× | 1.07× | 2.02 | 2.07 | 66 / 4,293 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 5 | 2.87 | 3.20 | 3.20 | 6.36 | 1.71× | 0.92× | 1.30 | 1.55 | 55 / 4,337 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 470 | 8.97 | 24.69 | 27.78 | 42.28 | 1.05× | 1.66× | -3.16 | -3.56 | 291 / 18,448 / 0 | — | 0.0203 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 463 | 4.94 | 8.91 | 14.28 | 20.61 | 0.78× | 0.85× | -3.51 | -4.23 | 116 / 4,436 / 0 | — | 0.011 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 6 | 9.12 | 12.82 | 12.82 | 30.20 | 1.11× | 1.55× | -0.84 | -1.11 | 117 / 5,367 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 165 | 10.22 | 21.23 | 32.10 | 47.49 | 1.03× | 0.97× | -1.67 | -2.18 | 318 / 28,401 / 0 | — | 0.0009 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 225 | 5.66 | 9.41 | 16.51 | 19.55 | 0.78× | 0.69× | -1.88 | -2.52 | 121 / 4,695 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 517 | 9.31 | 21.17 | 25.32 | 30.69 | 0.95× | 0.94× | -2.48 | -2.90 | 280 / 21,083 / 0 | — | 0.0024 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 561 | 5.16 | 9.74 | 13.71 | 24.33 | 0.72× | 0.70× | -2.02 | -2.62 | 115 / 4,546 / 0 | — | 0.0012 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.70 | 0.70 | 0.70 | 0.70 | 0.93× | 0.93× | -1.15 | -1.30 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 30 | 21.42 | 39.42 | 102.93 | 125.43 | 1.02× | 1.13× | -0.63 | -1.69 | 226 / 21,666 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 44 | 22.26 | 84.57 | 128.99 | 272.54 | 1.07× | 2.44× | -0.26 | -0.61 | 239 / 23,885 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 10 | 2.73 | 3.57 | 3.57 | 6.87 | 0.71× | 0.44× | -0.12 | -0.95 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 16 | 3.21 | 5.27 | 5.27 | 6.60 | 0.80× | 1.03× | -0.73 | -0.76 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 4 | 7.36 | 7.47 | 7.47 | 9.49 | 0.76× | 0.39× | -3.03 | -3.61 | 100 / 4,100 / 0 | — | 7.357 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 148.19 | 148.19 | 148.19 | 148.19 | 3.89× | 3.89× | -3.05 | -4.35 | 7,375 / 285,427 / 8,191 | — | 148.193 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 22.09 | 22.09 | 22.09 | 22.09 | no baseline | no baseline | — | — | 259 / 18,533 / 0 | — | 0.7363 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · uncontended | 2 | 22.14 | 22.14 | 22.14 | 25.94 | no baseline | no baseline | — | — | 329 / 19,085 / 0 | — | 0.4804 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 8 | 8.83 | 13.75 | 13.75 | 23.35 | 0.59× | 0.70× | 0.21 | -0.61 | 95 / 4,544 / 0 | — | 3.6665 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 15 | 9.78 | 15.79 | 15.79 | 16.56 | 0.91× | 0.93× | 0.08 | -0.42 | 137 / 6,148 / 0 | — | 3.9482 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 11.38 | 11.38 | 11.38 | 15.45 | 0.69× | 0.69× | -0.69 | -2.76 | 205 / 7,814 / 0 | — | 1.4225 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 11.53 | 12.21 | 12.21 | 14.78 | 0.84× | 0.89× | -0.92 | -0.81 | 154 / 8,078 / 0 | — | 1.9215 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 85.05 | 85.05 | 85.05 | 89.82 | no baseline | no baseline | -0.69 | -1.01 | 1,311 / 151,202 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 2 | 82.86 | 82.86 | 82.86 | 12284.95 | 1.20× | 1.20× | 1.23 | 0.79 | 1,301 / 152,342 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 119 | 439.38 | 1189.86 | 2329.45 | 2360.89 | 8.57× | 3.10× | -2.99 | 2.89 | — | 3,605 | — | — |
| sandbox.exec | 0 files · uncontended | 115 | 37.25 | 567.53 | 745.20 | 5812.22 | 1.17× | 1.98× | 0.79 | 0.74 | — | 3652.70 | — | — |
| sandbox.exec | 1 files · contended | 11 | 35.42 | 52.87 | 52.87 | 73.22 | 0.96× | 0.63× | 0.57 | 0.32 | — | 4.30 | 35.416 ms per file | — |
| sandbox.exec | 1 files · uncontended | 6 | 23.02 | 36.76 | 36.76 | 39.00 | 0.69× | 0.54× | -2.01 | -2.52 | — | 4.30 | 23.022 ms per file | — |
| sandbox.exec | 17–64 files · contended | 25 | 38.05 | 78.16 | 108.22 | 156.77 | 0.54× | 1.12× | -4.06 | -3.84 | — | 60.10 | 1.1135 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 13 | 39.21 | 71.72 | 71.72 | 166.15 | 0.56× | 1.03× | -3.47 | -3.90 | — | 69.80 | 0.8005 ms per file | — |
| sandbox.exec | 2–4 files · contended | 33 | 37.66 | 60.28 | 61.34 | 76.61 | 0.97× | 0.86× | -0.16 | -0.16 | — | 10.80 | 13.446 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 51 | 34.08 | 53.91 | 71.32 | 72.02 | 0.89× | 0.82× | -1.84 | -1.90 | — | 9 | 13.3975 ms per file | — |
| sandbox.exec | 5–16 files · contended | 24 | 42.46 | 64.21 | 64.68 | 75.02 | 0.73× | 0.88× | 1.32 | 0.82 | — | 17.20 | 5.3075 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 16 | 44.78 | 68.52 | 68.52 | 76.03 | 0.63× | 0.65× | -2.23 | -1.68 | — | 16 | 7.4642 ms per file | — |
| sandbox.exec | — · contended | 5 | 2632.64 | 2656.68 | 2656.68 | 21732.06 | no baseline | no baseline | -1.84 | -3.38 | — | 49,884 | — | — |
| sandbox.exec | — · uncontended | 20 | 67.46 | 22417.06 | 22417.06 | 32008.51 | 0.13× | 3.15× | -4.69 | -7.54 | — | 49,884 | — | — |
| sandbox.mount | — · contended | 54 | 8.94 | 13.19 | 15.36 | 15.69 | 0.80× | 0.69× | -0.85 | -1.33 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 91 | 9.14 | 12.47 | 14.54 | 19.28 | 0.82× | 0.62× | -0.63 | -0.75 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.35 | 3.35 | 3.35 | 3.35 | no baseline | no baseline | -0.62 | -0.60 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 3.45 | 3.45 | 3.45 | 42.33 | no baseline | no baseline | -0.96 | -1.20 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 52 | 10.00 | 13.01 | 14.36 | 14.62 | 0.94× | 0.72× | -1.38 | -1.60 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 93 | 11.46 | 21.81 | 153.00 | 199.05 | 1.09× | 1.18× | 0.05 | -0.04 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 17 | 0.0 KiB | 898.2 KiB | 4,008 | ok 17 |
| branch.diff_commits | branch | 337 | 0.0 KiB | 18.5 MiB | 62,440 | ok 337 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 10 | 0.0 KiB | 97.8 KiB | 163 | ok 10 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 26 | 1.2 MiB | 0.0 KiB | 37 | Committed 26 |
| fs.diff_files | fs | 32 | 0.0 KiB | 103.0 KiB | 8 | NoSuchPath 24, Text 8 |
| fs.glob | fs | 36 | 0.0 KiB | 56.0 KiB | 774 | ok 36 |
| fs.grep | fs | 37 | 0.0 KiB | 120.8 KiB | 672 | ok 37 |
| fs.list | fs | 40 | 0.0 KiB | 329.2 KiB | 2,254 | ok 40 |
| fs.read | fs | 31 | 0.0 KiB | 86.3 KiB | 31 | ok 31 |
| fs.rm | fs | 452 | 0.0 KiB | 0.0 KiB | 452 | Committed 452 |
| fs.stat | fs | 39 | 0.0 KiB | 8.8 KiB | 39 | ok 39 |
| fs.write | fs | 2,407 | 11.2 MiB | 0.0 KiB | 2,407 | Committed 2407 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 147 | 0.0 KiB | 0.0 KiB | 0 | Committed 120, UpToDate 26, Conflict 1 |
| sandbox.exec | sandbox | 448 | 3.1 MiB | 3.0 MiB | 0 | exit:0 448 |
| sandbox.mount | sandbox | 155 | 0.0 KiB | 0.0 KiB | 0 | Mounted 155 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 155 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 155 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.16 · end 3.01.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.081 | 13.746 · 1.273 · 1.081 · 0.996 · 1.075 | 2.08–2.08 | statements 21, vm_steps 818, fullscan_steps 0, sorts 0, returned_rows 70 |
| read | 1.162 | 1.274 · 1.223 · 1.162 · 1.003 · 1.031 | 2.08–2.08 | statements 14, vm_steps 662, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_small | 1.119 | 1.119 · 1.147 · 1.002 · 0.992 · 1.601 | 2.08–2.08 | statements 14, vm_steps 671, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_largest | 6.261 | 8.97 · 6.358 · 6.037 · 6.231 · 6.261 | 2.08–2.08 | statements 149, vm_steps 15738, fullscan_steps 0, sorts 0, returned_rows 1603 |
| grep_scoped | 1.083 | 1.489 · 1.17 · 1.049 · 1.048 · 1.083 | 2.08–2.08 | statements 19, vm_steps 817, fullscan_steps 0, sorts 0, returned_rows 72 |
| glob_scoped | 1.006 | 1.006 · 1.022 · 0.908 · 0.99 · 1.084 | 2.08–2.08 | statements 13, vm_steps 650, fullscan_steps 0, sorts 0, returned_rows 62 |
| grep_tree | 4357.296 | 4386.306 · 4357.296 · 4348.091 · 4369.649 · 4354.912 | 1.99–2.95 | statements 50904, vm_steps 3947587, fullscan_steps 0, sorts 0, returned_rows 395992 |
| glob_tree | 8.105 | 10.305 · 8.504 · 8.105 · 7.776 · 7.557 | 2.73–2.73 | statements 155, vm_steps 20144, fullscan_steps 0, sorts 0, returned_rows 2043 |
| diff_files | 3.167 | 3.242 · 3.042 · 3.167 · 3.001 · 3.192 | 2.73–2.73 | statements 48, vm_steps 3640, fullscan_steps 0, sorts 0, returned_rows 360 |
| list_commits | 0.639 | 1.334 · 0.679 · 0.639 · 0.607 · 0.599 | 2.73–2.73 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.609 | 2.131 · 1.495 · 1.638 · 1.563 · 1.609 | 2.73–2.73 | statements 49, vm_steps 1874, fullscan_steps 0, sorts 0, returned_rows 210 |
| fork | 0.427 | 0.427 · 0.367 · 0.818 · 0.413 · 0.641 | 2.73–2.73 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 18.755 | 21.019 · 18.755 · 19.43 · 17.917 · 17.969 | 2.73–2.73 | statements 429, vm_steps 21270, fullscan_steps 0, sorts 0, returned_rows 1536 |
| oneshot_mount_unmount | 17.269 | 20.053 · 17.269 · 21.879 · 15.319 · 14.381 | 2.73–2.73 | statements 55, vm_steps 2038, fullscan_steps 82, sorts 2, returned_rows 206 |
| oneshot_commit | 67.284 | 67.778 · 53.049 · 69.192 · 63.836 · 67.284 | 2.73–2.75 | statements 150, vm_steps 10904, fullscan_steps 82, sorts 2, returned_rows 820 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.73–2.73 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 213.3 s** (tooling): play 89.0 · consolidate 76.0 · verify 14.7 · probes 22.7 · tests 0.0 · seal + snapshot 0.0 · report 10.9

213.25 s tooling: prepare 1.52 · play 87.49 · consolidate 75.97 · verify 7.70 (diff_commits) · version walk 6.99 · probes 22.73 · metrics 0.94 · Store allocation 0.26 · report 0.32

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T00:59:27.865Z | watch | Speed: branch.diff_branches >64 entries · uncontended: 5.58× baseline (no phase); Scaling: not judged: stat (chain-bounded): 6 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: not judged: stat.statements (chain-bounded): 6 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (9 classes too narrow); Directory share: 0.508 |

### G. Evidence

- `~/lfs-history/metrics/range-036.a1.json`
- trace `~/lfs-history/runs/p3-main-u/trace/range-036.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-u/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r036-1-docs-rfc | 1,275 | 436.5 KiB |
| r036-2-agents-notes | 1,068 | 417.8 KiB |
| r036-3-docs-core-data-structure | 601 | 380.2 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 339.0 | 3,208 |
| `git diff --stat` | 30.0 | 3,183 |
| `git add -f` | 26.0 | — |
| `git commit` | 32.0 | 3,200 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r036-1-docs-rfc | end | P1 | pass | — | — |
| r036-1-docs-rfc | end | P2 | pass | exit 0 | — |
| r036-1-docs-rfc | end | P3 | pass | 245 bookkeeping path(s) | — |
| r036-1-docs-rfc | end | P4 | n/a | no changed package to build | — |
| r036-1-docs-rfc | end | P5 | n/a | no calibrated file | — |
| r036-1-docs-rfc | end | P6 | n/a | not a repair | — |
| r036-2-agents-notes | end | P1 | pass | — | — |
| r036-2-agents-notes | end | P2 | pass | exit 0 | — |
| r036-2-agents-notes | end | P3 | pass | 245 bookkeeping path(s) | — |
| r036-2-agents-notes | end | P4 | n/a | no changed package to build | — |
| r036-2-agents-notes | end | P5 | n/a | no calibrated file | — |
| r036-2-agents-notes | end | P6 | n/a | not a repair | — |
| r036-3-docs-core-data-structure | end | P1 | pass | — | — |
| r036-3-docs-core-data-structure | end | P2 | pass | exit 0 | — |
| r036-3-docs-core-data-structure | end | P3 | pass | 245 bookkeeping path(s) | — |
| r036-3-docs-core-data-structure | end | P4 | n/a | no changed package to build | — |
| r036-3-docs-core-data-structure | end | P5 | n/a | no calibrated file | — |
| r036-3-docs-core-data-structure | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | n/a | no range tests | — |
| lead | repair | P6 | pass | P1 pass, P4 n/a (no changed package to build) | — |

### J. Conflicts by path class

No conflicts by path recorded.
