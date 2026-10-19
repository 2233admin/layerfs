# Range 025 · **optimize** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r024 (live Store)
dsh `b965285f2`..`0ac96409a` · **64 commits** (2 mainline, 62 side) · 2026-07-18 → 2026-07-21
Areas changed: `/` 41% · `packages/lsp` 22% · `docs` 16% · other 21%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 13 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.59×** · **Churn 0.00**
**Time split:** play 82.0 s · git 84.8 s · Node 174.1 s · verify 10.1 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **640.9 MiB** (+25.8 MiB) | **627.9 MiB** (+90.8 MiB) | **0.98×** (prev 0.87×) | **97.3 MiB** | **1,801** (total 27,563) | **250.8 s** tooling (total 60.2 min) |

**Checks:** 12 pass · 6 watch: Speed not judged: baseline not set (pilot); Scaling not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (10 classes too narrow); Range growth 97.3 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 2619 ms for 565.9 MiB new; size exponent not judged (2 snapshots); Wall projection 1 · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe list_commits +267% · ▲ stored added +219% · ▲ probe fork +122%
**Budget:** 26 of 202 ranges · projected total 16.9 h (budget 16.8 h) · disk 40% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **2,058 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,670 / 2,670 outcomes as planned |
| Conflicts | **2 / 2 planned hit · 0 unplanned** |
| Unit tests | **20 / 20 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 1999 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 309 bin shims, 3309 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (46 lines from 3 .gitignore files) · **83 picks** in 3 merges (83 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `0ac96409a`** · 76 commits written for 76 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 83 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r025-2-root | end | `ba6dc84e8f77` | `5994c59feaf4` | pass (312 normalized) | pass | n/a | n/a | n/a | n/a |
| r025-1-examples-desktop | end | `275dcd3bdd8c` | `bbece7426032` | pass (305 normalized) | pass | pass | n/a | n/a | n/a |
| r025-3-packages-lsp | end | `18e27ac7edd9` | `bbece7426032` | pass (305 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `2a6622d2edfc` | `null` | n/a | pass | n/a | n/a | pass | pass (108,039 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively).

## 2. Activity

**3,275 calls** · **119 steps** by **5 agents + lead** on **3 Branches + main** · **160 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +682 added · 498 modified · −630 deleted · 50.8 MiB written · fs 1,687 : Sandbox 123 (**14 : 1**, reported only in P3)
**Execs:** 457 (JS 47 · shell 410) · 1 non-zero exits · install 0 · test runs 3 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,986 | 1,700 | 286 | Committed 1,700 · NoSuchPath 33 · Text 10 · Equal 3 · Binary 8 |
| sandbox | 934 | 610 | 4 | commit 153 (Committed 116, UpToDate 36, Conflict 1) · exec 457 (exit:0 456, exit:1 1) · mount 160 (Mounted 160) · status 4 · unmount 160 (Unmounted 160) |
| branch | 345 | 32 | 313 | diff_branches 11 · diff_commits 302 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,275** | **2,342** | **613** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r025-1-examples-desktop | a01 a02 a03 | 51 | 653 | ✓ | — |
| r025-2-root | a04 | 14 | 320 | ✓ | — |
| r025-3-packages-lsp | a05 a06 a07 a08 | 48 | 256 | ✓ | — |
| main | lead | 6 | 572 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r025-1, a03 after a01 | 0.1 s |
| Stale clean merge | 0 / 0 | — | — |
| Decoy edit | 1 / 1 | r025-1, a03 a01 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r025-1 | 46 | 23 | 23 | 0 | 0 | 651 | commit-conflict, decoy |
| a03 | r025-1 | 5 | 1 | 4 | 0 | 0 | 2 | commit-conflict, decoy |
| a04 | r025-2 | 14 | 6 | 8 | 0 | 0 | 320 | — |
| a05 | r025-3 | 31 | 13 | 18 | 0 | 0 | 110 | — |
| a06 | r025-3 | 17 | 4 | 13 | 0 | 0 | 146 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 572 | — |
| **Total** |  | **119** | **48** | **66** | **5** | **0** | **1,801** | **2** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 82 · pnpm 1 · tsc 1 · vitest 3 · other 370

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r025-2-root | 9 | 9 | 9 | 5 | 9 | 160 |
| r025-3-packages-lsp | 35 | 35 | 34 | 2 | 35 | 574 |
| r025-1-examples-desktop | 31 | 31 | 31 | 0 | 31 | 914 |
| **lead** | — | — | — | — | 76 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r025-2-root | 1 | 0 | 0 | 0 | 0 | — / — |
| r025-1-examples-desktop | 0 | 1 | 0 | 0 | 0 | — / — |
| r025-3-packages-lsp | 0 | 1 | 1 | 1 | 7 | 7 / 7 |
| **lead repair** | 1 | — | 1 | — | — | 108,039 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r024) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 615.1 MiB (14.0 MiB / 557.4 MiB / 12.2 MiB / 31.5 MiB) | 640.9 MiB (14.3 MiB / 560.8 MiB / 12.6 MiB / 53.1 MiB) | +25.8 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 46,782 / 7,922 / 3,279 | 47,057 / 7,980 / 3,315 | +275 / +58 / +36 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 537.2 MiB | 627.9 MiB | +90.8 MiB |
| **Space amplification** (total · tracked) | 0.87× · tracked 3.72× | 0.98× · tracked 5.40× | 0.11 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **96.59** (7.81 / 0.38 / 1.01) | 42.92× the median range |
| **Stored per Commit** | 25.1 KiB | 51.4 KiB | — |
| Metadata share | 0.38 | 0.35 | this range 0.17 |
| History: Commits / Layers / Branches | 25,762 | 27,563 / 14 / 191 | +1,801 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 18.48 GiB (Commits 16.81 GiB · installs 972.0 MiB · build 112.9 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 44.77 GiB / 40% | — |
| Snapshot | — | r025, 565.9 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 407.6 MiB | 0.64 | +76.8 MiB |
| Metadata | 51.1 MiB | 0.08 | +4.1 MiB |
| Index rows | 137.8 MiB | 0.22 | — |
| Waste | 30.7 MiB | 0.05 | — |
| Other | 788.0 KiB | 0.00 | — |
| **Total = Store on disk** | **627.9 MiB** | **= 0.98** space amplification | +90.8 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 14.3 MiB | 77.4 MiB (45.2 MiB + 32.2 MiB) | 5.40× | — | 25.2 MiB | 1.0 MiB | 25.05 |
| `node_modules` | 560.8 MiB | 173.9 MiB (164.0 MiB + 9.9 MiB) | 0.31× | — | 1.6 MiB | 3.5 MiB | 0.45 |
| Build output | 12.6 MiB | 8.7 MiB (8.3 MiB + 454.9 KiB) | 0.69× | — | 119.7 KiB | 5.4 MiB | 0.02 |
| `.git` | 53.1 MiB | 196.8 MiB (190.0 MiB + 6.8 MiB) | 3.70× | — | 53.6 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 169.3 MiB | — (not divided) | — | 9.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 1.8 MiB | — | — | — | — | — |
| **Total** | — | **627.9 MiB** | **= 0.98×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 93,160 | +3,017 | 6.2 KiB | 0 (derived) | 34% |
| Chunks (large files) | 42,236 | +4,166 | 14.0 KiB | — | 5% |
| Large-file extents | 13,329 | — | 0.2 KiB | — | — |
| Directories | 134,481 | 4,571 (with inodes, pooled) | 0.2 KiB | — | 62% |
| Inodes and attributes | 167,089 | ↑ pooled | 2.5 KiB | — | — |
| Symlinks | 1,974 | +3,357 | 0.1 KiB | — | — |

Delta: 2.4% at depth cap · 14% of refused bases stopped by budget · `node_modules` reinstall: 0.208× the raw bytes of 23 changed packages (ratio: 728165 new stored for 3505168 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.40× (77.4 MiB for 14.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.7 KiB / 145.9 KiB / 147.1 KiB over 151 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.59× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.7 MiB stored for 1.63 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.33 (3 lanes × 640.9 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.6 ms / 20.2 ms | 3.2 ms / 5.4 ms | 3.1 ms / 7.2 ms | 17.8 ms / 83.6 ms | 11.1 ms / 20.5 ms | 229 ms / 229 ms | — (native comparison in P3; exec 46.5 ms / 1249 ms) |
| SQL p50: 135 stmts | 62 stmts | 66 stmts | 183 stmts | 45 stmts | 6,364 stmts | — |

**Commit cost:** 4.28 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 587 ms p50 over 160
**Slowest:** sandbox.exec 40195 ms · sandbox.exec 32826 ms · sandbox.exec 31960 ms · checkpoint diff_commits 0.10 ms and 1.53 statements per entry (55,971 entries per page)
**Scaling:** 2 of 15 probes flat · `stat` 3.20 · `read` 3.99 · `list_small` 4.34 · `list_largest` 4.28 · `grep_scoped` 2.83 · `glob_scoped` 3.57 · `glob_tree` 1.64 · `diff_files` 1.03 · `list_commits` 13.26 · `diff_commits` 4.01 · `fork` 3.94 · `merge` 0.24 · `oneshot_mount_unmount` 0.25

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 244 ms / 244 ms | — / — | — | git / status-cold: — |
| git status (steady) | 323 ms / 628 ms | — / — | — | git / status-steady: — |
| git add | 46.0 ms / 279 ms | — / — | — | git / add: — |
| git commit (lane) | 47.0 ms / 113 ms | — / — | — | git / commit: — |
| lead writes main | 2094 ms / 2094 ms | — / — | — | — |
| repack | 4079 ms / 4079 ms | — / — | — | — |
| pnpm install (incremental) | 3771 ms / 3771 ms | 2402 ms / 2402 ms | 1.57× | pnpm-reinstall / cold: — |
| pnpm refresh | 2747 ms / 2747 ms | 1684 ms / 1684 ms | 1.63× | pnpm-reinstall / steady: — |
| tsc -b | 1895 ms / 1895 ms | 1334 ms / 1334 ms | 1.42× | tsc-b / cold: — |
| vitest | 2385 ms / 2385 ms | 1074 ms / 1074 ms | 2.22× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.1 ms / 21.8 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4173592 B · fs.write ≤8 KiB 337872 → 4173592 B · fs.write ≤64 KiB 2509112 → 4173592 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2879912 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 3848112 B
**Host load (1-min, recorded, not waited on):** macOS 11.63 at the first command → 11.64 after the last (max 13.10 over 6 commands) · Docker VM 3.13 → 2.85

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-025.a1)

## 5. Findings and action

### Finding 025.a1 · optimize

**1. Trigger** (attempt 1, daemon `45a196ef16c6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | glob_tree.statements per tree file: depth exponent 1.489 | < 0.05 |

Diagnosis pending: `finding-025.a1.json`.

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

- **a1 (`p3-main-r`, live after r24 a1, daemon `45a196ef`, addon `4668012e`; binaries from main 3ef00d32e5, owner 2026-10-20): OPTIMIZE, terminal under the fast-mode ruling (liaison 2026-10-20: counter rows are recorded, not stops).** Checkpoint ok, git ✓. Node: 13 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (834 emitted). Control `control-025.a1` passes.
  - The only optimize row is Counters `glob_tree.statements` per tree file, with depth exponent 1.489 on 3 same-binary points. This is a probe counter, recorded.
  - `r025-1-examples-desktop.end` ran no calibrated tests: native vitest exits 1 with no per-file results at that tree, so P5 is n/a.
  - Final steps: repair 111 s (160 s alarm), verify 14 s, finish 42 s. Repair build 14.7 s, install 40.2 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2670/2670; conflicts 2/2; tests 20/20 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | glob_tree.statements per tree file: depth exponent 1.489 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (10 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.171 | < 0.5 | pass |
| Reinstall growth | 0.208× the raw bytes of 23 changed packages (ratio: 728165 new stored for 3505168 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0237 (budget 0.1392) | < 0.1 | pass |
| Range growth | 97.3 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 2619 ms for 565.9 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.4 | < 0.8 | pass |
| Wall projection | 1 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 76 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 13 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 83 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.59× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 119 | 120 |
| Lanes / agents | 3 / 5 | 3 / 8 |
| LayerFS Commits | 1801 | 1719 |
| Workspaces (one-shot share) | 160 (0.99) | 66 (0.985) |
| Reads | 246 | 246 |
| Reconcile writes | 565 | 565 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 11 | 18.98 | 239.92 | 239.92 | 356.58 | no baseline | no baseline | -1.29 | 0.43 | 253 / 24,147 / 0 | — | 0.0794 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 297 | 19.78 | 36.49 | 69.57 | 324.30 | no baseline | no baseline | -0.37 | -0.28 | 311 / 32,074 / 0 | — | 0.1064 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.51 | 1.15 | 1.15 | 1.40 | no baseline | no baseline | -6.16 | -9.40 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 1.64 | 1.64 | 1.64 | 2.13 | no baseline | no baseline | 0.36 | -2.42 | 70 / 1,298 / 0 | — | 0.0818 ms per entrie | — |
| branch.merge | 5–16 entries · Merged (new Commit) · uncontended | 1 | 253.92 | 253.92 | 253.92 | 253.92 | no baseline | no baseline | — | — | 6,364 / 361,898 / 0 | — | 23.0834 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 229.07 | 229.07 | 229.07 | 229.07 | no baseline | no baseline | -2.33 | -1.31 | 7,616 / 444,047 / 0 | — | 2.3138 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 2.15 | 2.15 | 2.15 | 2.15 | no baseline | no baseline | — | — | 35 / 517 / 0 | — | 0.0042 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 9.43 | 9.43 | 9.43 | 9.43 | no baseline | no baseline | -0.24 | 2.82 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 64.44 | 64.44 | 64.44 | 64.44 | no baseline | no baseline | 5.72 | 6.98 | 165 / 26,031 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 4 | 16.27 | 17.03 | 17.03 | 18.98 | no baseline | no baseline | -0.54 | -1.64 | 198 / 14,800 / 0 | — | 0.0894 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 16 | 9.36 | 16.91 | 16.91 | 111.95 | no baseline | no baseline | 2.17 | 4.15 | 119 / 4,591 / 0 | — | 0.0176 ms per byte | commit |
| fs.apply | ≤512 KiB · contended | 13 | 22.67 | 34.27 | 34.27 | 63.24 | no baseline | no baseline | — | — | 398 / 22,797 / 0 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 62 | 15.27 | 25.96 | 29.91 | 31.61 | no baseline | no baseline | — | — | 161 / 7,582 / 0 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 13 | 14.73 | 33.30 | 33.30 | 38.82 | no baseline | no baseline | -18.34 | -33.01 | 302 / 15,795 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 111 | 8.71 | 11.94 | 15.78 | 23.90 | no baseline | no baseline | 0.94 | 1.81 | 121 / 5,559 / 0 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 12 | 15.06 | 26.02 | 26.02 | 42.30 | no baseline | no baseline | -5.16 | -9.87 | 263 / 17,205 / 0 | — | 0.0027 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 53 | 8.42 | 14.53 | 16.19 | 17.26 | no baseline | no baseline | 1.40 | 2.26 | 124 / 5,647 / 0 | — | 0.0022 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 12 | 6.97 | 20.03 | 20.03 | 25.54 | no baseline | no baseline | -2.75 | -3.83 | 180 / 9,299 / 0 | — | 0.0229 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 26 | 7.02 | 9.99 | 10.77 | 15.88 | no baseline | no baseline | -1.36 | -1.94 | 162 / 7,051 / 0 | — | 0.0284 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 2 | 4.12 | 4.12 | 4.12 | 7.86 | no baseline | no baseline | -4.42 | -5.13 | 100 / 3,355 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 1 | 9.53 | 9.53 | 9.53 | 9.53 | no baseline | no baseline | 2.71 | 1.68 | 241 / 10,409 / 0 | — | 0.0028 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 2.35 | 2.35 | 2.35 | 3.04 | no baseline | no baseline | — | — | 48 / 3,554 / 0 | — | 2.347 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 3.48 | 3.48 | 3.48 | 3.61 | no baseline | no baseline | 0.62 | 2.32 | 61 / 3,381 / 0 | — | 0.1184 ms per file | — |
| fs.glob | 17–64 files · uncontended | 4 | 3.33 | 3.77 | 3.77 | 8.65 | no baseline | no baseline | 1.17 | 2.08 | 66 / 4,705 / 0 | — | 0.0811 ms per file | — |
| fs.glob | 2–4 files · contended | 3 | 4.76 | 4.76 | 4.76 | 11.76 | no baseline | no baseline | 5.12 | 7.45 | 73 / 3,728 / 0 | — | 1.5883 ms per file | — |
| fs.glob | 2–4 files · uncontended | 6 | 2.52 | 3.01 | 3.01 | 4.40 | no baseline | no baseline | 2.23 | 4.08 | 56 / 3,425 / 0 | — | 0.6973 ms per file | — |
| fs.glob | 5–16 files · contended | 2 | 2.67 | 2.67 | 2.67 | 3.23 | no baseline | no baseline | -0.64 | -1.23 | 78 / 5,533 / 0 | — | 0.2672 ms per file | — |
| fs.glob | 5–16 files · uncontended | 9 | 2.63 | 4.38 | 4.38 | 5.57 | no baseline | no baseline | 0.43 | 1.02 | 59 / 3,965 / 0 | — | 0.2874 ms per file | — |
| fs.glob | >64 files · contended | 3 | 10.45 | 10.45 | 10.45 | 19.14 | no baseline | no baseline | -0.33 | 0.46 | 281 / 24,722 / 0 | — | 0.0306 ms per file | — |
| fs.glob | >64 files · uncontended | 12 | 5.20 | 25.02 | 25.02 | 30.70 | no baseline | no baseline | -0.47 | -1.07 | 87 / 7,282 / 0 | — | 0.0361 ms per file | — |
| fs.grep | 17–64 files · contended | 2 | 5.84 | 5.84 | 5.84 | 7.29 | no baseline | no baseline | -5.16 | -6.42 | 133 / 5,765 / 0 | — | 0.1669 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 7 | 6.17 | 10.58 | 10.58 | 30.64 | no baseline | no baseline | 0.46 | 2.48 | 112 / 5,327 / 0 | — | 0.2581 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 2.76 | 2.76 | 2.76 | 5.96 | no baseline | no baseline | -0.81 | -1.04 | 78 / 4,611 / 0 | — | 0.9615 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 4.21 | 10.59 | 10.59 | 11.43 | no baseline | no baseline | 3.56 | 4.48 | 65 / 3,992 / 0 | — | 1.301 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 4.96 | 4.96 | 4.96 | 4.96 | no baseline | no baseline | 0.48 | 0.93 | 157 / 9,508 / 0 | — | 0.496 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 6 | 4.11 | 4.97 | 4.97 | 9.12 | no baseline | no baseline | -0.27 | -0.63 | 70 / 4,165 / 0 | — | 0.4166 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 5 | 24.68 | 31.45 | 31.45 | 56.30 | no baseline | no baseline | -6.70 | -12.12 | 525 / 25,269 / 0 | — | 0.204 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 8 | 14.58 | 46.97 | 46.97 | 94.55 | no baseline | no baseline | -3.51 | -5.75 | 184 / 8,653 / 0 | — | 0.0945 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 1.83 | 1.83 | 1.83 | 1.83 | no baseline | no baseline | — | — | 35 / 2,416 / 0 | — | 1.826 ms per entrie | — |
| fs.list | 17–64 entries · contended | 4 | 5.41 | 6.13 | 6.13 | 7.03 | no baseline | no baseline | 0.69 | 1.94 | 107 / 8,043 / 0 | — | 0.1082 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 8 | 3.89 | 7.20 | 7.20 | 7.44 | no baseline | no baseline | -0.26 | -1.09 | 77 / 5,986 / 0 | — | 0.128 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 1.93 | 1.93 | 1.93 | 3.81 | no baseline | no baseline | -0.84 | -1.91 | 44 / 2,491 / 0 | — | 0.6443 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 8 | 2.63 | 5.40 | 5.40 | 14.29 | no baseline | no baseline | 1.40 | 1.90 | 57 / 3,443 / 0 | — | 0.877 ms per entrie | — |
| fs.list | 5–16 entries · contended | 6 | 2.93 | 4.00 | 4.00 | 4.26 | no baseline | no baseline | 0.76 | 2.82 | 79 / 4,837 / 0 | — | 0.351 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 10 | 2.72 | 4.91 | 4.91 | 6.33 | no baseline | no baseline | 1.47 | 2.28 | 49 / 3,985 / 0 | — | 0.2601 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 5.39 | 5.39 | 5.39 | 6.15 | no baseline | no baseline | 9.26 | 14.60 | 67 / 2,858 / 0 | — | 0.004 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 9 | 4.08 | 5.03 | 5.03 | 6.73 | no baseline | no baseline | 4.05 | 6.48 | 62 / 3,785 / 0 | — | 0.0061 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 7 | 2.94 | 3.53 | 3.53 | 4.60 | no baseline | no baseline | 1.62 | 2.60 | 75 / 4,707 / 0 | — | 0.0013 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 20 | 3.04 | 5.05 | 5.05 | 5.19 | no baseline | no baseline | 2.51 | 4.11 | 57 / 3,708 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 35 | 13.92 | 23.74 | 25.73 | 37.68 | no baseline | no baseline | 1.66 | 2.00 | 290 / 20,508 / 0 | — | 13.917 ms per file | commit |
| fs.rm | 1 files · uncontended | 586 | 7.92 | 13.91 | 24.70 | 123.02 | no baseline | no baseline | -0.20 | 0.06 | 126 / 6,653 / 0 | — | 7.916 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 2 | 2.01 | 2.01 | 2.01 | 2.48 | no baseline | no baseline | 0.17 | 1.29 | 55 / 2,722 / 0 | — | 0.0055 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 2 | 2.48 | 2.48 | 2.48 | 3.66 | no baseline | no baseline | 0.92 | 0.84 | 41 / 2,448 / 0 | — | 0.0048 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 3 | 4.60 | 4.60 | 4.60 | 6.74 | no baseline | no baseline | — | — | 69 / 3,544 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 8 | 2.91 | 3.85 | 3.85 | 4.08 | no baseline | no baseline | 4.30 | 7.06 | 59 / 3,412 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.85 | 3.38 | 3.38 | 4.43 | no baseline | no baseline | 2.91 | 4.99 | 54 / 3,280 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 2.24 | 2.24 | 2.24 | 3.68 | no baseline | no baseline | -1.40 | -0.47 | 48 / 2,460 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 8 | 2.47 | 3.19 | 3.19 | 6.41 | no baseline | no baseline | 1.64 | 1.32 | 47 / 3,628 / 0 | — | 0.0013 ms per byte | — |
| fs.write | ≤1 KiB · contended | 16 | 11.50 | 20.90 | 20.90 | 23.37 | no baseline | no baseline | 2.99 | 5.77 | 221 / 11,265 / 0 | — | 0.0169 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 57 | 9.69 | 14.39 | 17.80 | 48.36 | no baseline | no baseline | 2.19 | 3.02 | 144 / 7,543 / 0 | — | 0.0124 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 14 | 12.44 | 35.12 | 35.12 | 148.40 | no baseline | no baseline | -3.48 | -3.94 | 141 / 7,224 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 65 | 11.66 | 19.58 | 24.70 | 25.89 | no baseline | no baseline | 0.88 | 1.28 | 123 / 6,112 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 63 | 12.94 | 29.00 | 47.73 | 51.22 | no baseline | no baseline | 1.85 | 3.39 | 273 / 15,887 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 165 | 8.21 | 16.39 | 24.25 | 40.48 | no baseline | no baseline | 0.31 | 0.44 | 124 / 5,279 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 111 | 11.97 | 21.30 | 27.38 | 137.82 | no baseline | no baseline | 0.90 | 1.84 | 251 / 14,532 / 0 | — | 0.0038 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 291 | 8.21 | 15.16 | 23.89 | 44.38 | no baseline | no baseline | 1.03 | 1.43 | 125 / 5,480 / 0 | — | 0.0034 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.64 | 0.64 | 0.64 | 0.64 | no baseline | no baseline | 0.31 | 1.07 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 23 | 32.13 | 70.97 | 131.60 | 207.90 | no baseline | no baseline | 1.16 | 1.69 | 298 / 28,075 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 53 | 26.84 | 62.73 | 83.56 | 427.20 | no baseline | no baseline | 1.46 | 2.42 | 246 / 22,621 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 9 | 3.65 | 3.92 | 3.92 | 7.84 | no baseline | no baseline | -0.67 | -1.05 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 26 | 3.49 | 4.50 | 5.17 | 6.33 | no baseline | no baseline | -0.01 | 0.13 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 4 | 11.88 | 14.27 | 14.27 | 17.28 | no baseline | no baseline | 0.66 | 2.29 | 105 / 4,272 / 0 | — | 11.875 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 8 | 9.32 | 11.79 | 11.79 | 12.40 | no baseline | no baseline | -0.16 | -0.32 | 105 / 3,909 / 0 | — | 9.32 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 131.47 | 131.47 | 131.47 | 131.47 | no baseline | no baseline | -9.66 | -18.28 | 6,891 / 180,155 / 0 | — | 131.468 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · uncontended | 1 | 21.59 | 21.59 | 21.59 | 21.59 | no baseline | no baseline | — | — | 156 / 9,235 / 0 | — | 1.0282 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 5 | 10.38 | 13.11 | 13.11 | 27.40 | no baseline | no baseline | -2.98 | -1.61 | 116 / 5,047 / 0 | — | 4.3683 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 2 | 10.34 | 10.34 | 10.34 | 17.66 | no baseline | no baseline | -0.24 | 0.30 | 124 / 4,874 / 0 | — | 3.448 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 30.05 | 30.05 | 30.05 | 30.05 | no baseline | no baseline | 6.77 | 11.31 | 247 / 76,911 / 8,191 | — | 2.3118 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 7 | 12.21 | 26.85 | 26.85 | 29.48 | no baseline | no baseline | -2.56 | -1.61 | 109 / 5,350 / 0 | — | 2.2375 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 208.03 | 208.03 | 208.03 | 208.03 | no baseline | no baseline | — | — | 2,125 / 212,371 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 6 | 82.48 | 445.47 | 445.47 | 11914.29 | no baseline | no baseline | 2.24 | 3.43 | 1,047 / 115,418 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 5.93 | 5.93 | 5.93 | 5.93 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 105 | 530.14 | 1248.59 | 2573.87 | 2856.59 | no baseline | no baseline | 4.30 | -2.77 | — | 2851.30 | — | — |
| sandbox.exec | 0 files · uncontended | 140 | 38.72 | 718.48 | 1002.87 | 8521.12 | no baseline | no baseline | 1.21 | 2.15 | — | 2900.30 | — | — |
| sandbox.exec | 1 files · contended | 18 | 42.74 | 61.20 | 61.20 | 62.30 | no baseline | no baseline | 0.52 | 0.49 | — | 5.30 | 42.744 ms per file | — |
| sandbox.exec | 1 files · uncontended | 26 | 37.39 | 51.74 | 70.03 | 73.64 | no baseline | no baseline | 0.79 | 1.88 | — | 5 | 37.394 ms per file | — |
| sandbox.exec | 17–64 files · contended | 4 | 51.25 | 51.42 | 51.42 | 128.86 | no baseline | no baseline | -2.25 | -2.08 | — | 29.40 | 2.4403 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 13 | 68.62 | 101.87 | 101.87 | 115.77 | no baseline | no baseline | 2.44 | 4.90 | — | 93 | 3.7014 ms per file | — |
| sandbox.exec | 2–4 files · contended | 21 | 46.50 | 65.85 | 65.85 | 83.77 | no baseline | no baseline | 1.54 | 1.89 | — | 10 | 15.578 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 17 | 52.70 | 85.86 | 85.86 | 105.36 | no baseline | no baseline | 4.20 | 6.10 | 0 / 0 / 0 | 11.70 | 18.92 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 39 | 49.32 | 88.14 | 91.14 | 117.37 | no baseline | no baseline | -0.41 | -0.75 | — | 17.90 | 5.8186 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 30 | 57.09 | 93.46 | 97.30 | 103.63 | no baseline | no baseline | 0.89 | 0.66 | — | 18.40 | 5.9159 ms per file | — |
| sandbox.exec | — · contended | 9 | 2741.48 | 31959.62 | 31959.62 | 32826.18 | no baseline | no baseline | -3.28 | -5.79 | — | 30707.20 | — | — |
| sandbox.exec | — · uncontended | 25 | 370.84 | 13156.95 | 14732.05 | 40194.83 | no baseline | no baseline | 6.15 | 9.43 | — | 30707.20 | — | — |
| sandbox.mount | — · contended | 38 | 11.15 | 21.42 | 23.51 | 39.83 | no baseline | no baseline | -0.02 | 0.50 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 112 | 11.06 | 19.35 | 23.32 | 83.68 | no baseline | no baseline | 1.00 | 1.79 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.27 | 11.14 | 11.14 | 35.19 | no baseline | no baseline | 0.49 | 1.99 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 39 | 11.93 | 21.66 | 23.95 | 30.90 | no baseline | no baseline | 0.32 | 0.73 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 111 | 12.87 | 21.84 | 136.56 | 213.37 | no baseline | no baseline | 1.70 | 2.71 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 11 | 0.0 KiB | 584.1 KiB | 2,587 | ok 11 |
| branch.diff_commits | branch | 302 | 0.0 KiB | 16.5 MiB | 56,630 | ok 302 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 80.8 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 297 | 26.9 MiB | 0.0 KiB | 308 | Committed 297 |
| fs.diff_files | fs | 46 | 0.0 KiB | 103.6 KiB | 13 | NoSuchPath 33, Text 10, Equal 3 |
| fs.glob | fs | 54 | 0.0 KiB | 50.9 KiB | 642 | ok 54 |
| fs.grep | fs | 48 | 0.0 KiB | 124.6 KiB | 638 | ok 48 |
| fs.list | fs | 51 | 0.0 KiB | 135.4 KiB | 1,015 | ok 51 |
| fs.read | fs | 44 | 0.0 KiB | 85.6 KiB | 36 | ok 36, Binary 8 |
| fs.rm | fs | 621 | 0.0 KiB | 0.0 KiB | 621 | Committed 621 |
| fs.stat | fs | 43 | 0.0 KiB | 9.4 KiB | 43 | ok 43 |
| fs.write | fs | 782 | 22.8 MiB | 0.0 KiB | 782 | Committed 782 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 153 | 0.0 KiB | 0.0 KiB | 0 | Committed 116, UpToDate 36, Conflict 1 |
| sandbox.exec | sandbox | 457 | 3.0 MiB | 3.7 MiB | 0 | exit:0 456, exit:1 1 |
| sandbox.mount | sandbox | 160 | 0.0 KiB | 0.0 KiB | 0 | Mounted 160 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 160 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 160 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 3.13 · end 2.85.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.615 | 63.235 · 1.873 · 1.533 · 1.615 · 1.526 | 3.49–3.49 | statements 39, vm_steps 1179, fullscan_steps 0, sorts 0, returned_rows 97 |
| read | 1.703 | 1.761 · 1.626 · 1.465 · 1.703 · 1.842 | 3.49–3.49 | statements 21, vm_steps 792, fullscan_steps 0, sorts 0, returned_rows 79 |
| list_small | 1.667 | 1.667 · 1.31 · 1.685 · 1.418 · 1.723 | 3.49–3.49 | statements 21, vm_steps 801, fullscan_steps 0, sorts 0, returned_rows 79 |
| list_largest | 3.781 | 4.64 · 3.759 · 3.647 · 4.087 · 3.781 | 3.49–3.49 | statements 78, vm_steps 6349, fullscan_steps 0, sorts 0, returned_rows 678 |
| grep_scoped | 1.583 | 1.926 · 1.58 · 1.607 · 1.583 · 1.535 | 3.49–3.49 | statements 26, vm_steps 947, fullscan_steps 0, sorts 0, returned_rows 88 |
| glob_scoped | 1.497 | 1.589 · 1.61 · 1.42 · 1.385 · 1.497 | 3.49–3.49 | statements 20, vm_steps 780, fullscan_steps 0, sorts 0, returned_rows 78 |
| grep_tree | 3815.084 | 6132.985 · 3733.771 · 3814.108 · 3822.492 · 3815.084 | 3.02–3.45 | statements 40482, vm_steps 3207009, fullscan_steps 0, sorts 0, returned_rows 324505 |
| glob_tree | 6.513 | 7.666 · 6.158 · 6.012 · 6.513 · 7.579 | 3.02–3.02 | statements 127, vm_steps 13829, fullscan_steps 0, sorts 0, returned_rows 1520 |
| diff_files | 6.08 | 6.163 · 5.972 · 6.651 · 6.017 · 6.08 | 3.02–3.02 | statements 114, vm_steps 4708, fullscan_steps 0, sorts 0, returned_rows 480 |
| list_commits | 4.249 | 11.326 · 4.773 · 1.955 · 1.733 · 4.249 | 3.02–3.02 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 4.343 | 6.447 · 4.343 · 5.75 · 2.57 · 4.189 | 3.02–3.02 | statements 57, vm_steps 2148, fullscan_steps 0, sorts 0, returned_rows 253 |
| fork | 1.802 | 6.548 · 1.543 · 1.802 · 0.85 · 2.456 | 3.02–3.02 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 30.836 | 42.521 · 35.515 · 30.836 · 25.861 · 25.467 | 3.02–3.02 | statements 495, vm_steps 21440, fullscan_steps 0, sorts 0, returned_rows 1696 |
| oneshot_mount_unmount | 17.234 | 18.619 · 15.853 · 19.663 · 17.082 · 17.234 | 3.02–3.02 | statements 73, vm_steps 2399, fullscan_steps 82, sorts 2, returned_rows 233 |
| oneshot_commit | 72.091 | 72.44 · 74.249 · 71.955 · 61.123 · 72.091 | 3.02–3.02 | statements 188, vm_steps 10723, fullscan_steps 82, sorts 2, returned_rows 876 |
| oneshot_exec | — |  ·  ·  ·  ·  | 3.02–3.02 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r025: 160,748 pages of 4,096 B, 0 free · Commits 27,869 · Branches 513 · Layers 31 · compression 3.45× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 93,160 | 565.5 MiB |
| 2 | 42,236 | 577.9 MiB |
| 3 | 13,293 | 2.7 MiB |
| 4 | 36 | 7.5 KiB |
| 5 | 13,204 | 1.3 MiB |
| 6 | 59,650 | 299.9 MiB |
| 7 | 134,230 | 31.3 MiB |
| 8 | 251 | 74.6 KiB |
| 9 | 51,329 | 98.1 MiB |
| 10 | 30,084 | 3.7 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,974 | 159.8 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 28,390 | 51.1 MiB |
| 1 | 36,950 | 407.6 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 122,932 | 480.2 MiB | 17.7 MiB |
| inode_value | 20,816 | 81.3 MiB | 1.7 MiB |
| object_location | 6,153 | 24.0 MiB | 2.6 MiB |
| binding_hint | 5,686 | 22.2 MiB | 2.1 MiB |
| commit | 2,206 | 8.6 MiB | 1.4 MiB |
| file_digest | 902 | 3.5 MiB | 418.8 KiB |
| commit_lineage | 595 | 2.3 MiB | 257.4 KiB |
| commit_runs | 590 | 2.3 MiB | 321.9 KiB |
| commit_identity | 432 | 1.7 MiB | 198.9 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 23 | 92.0 KiB | 17.2 KiB |
| branch_names | 9 | 36.0 KiB | 8.7 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| branch_identity | 7 | 28.0 KiB | 7.9 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 4 | 16.0 KiB | 7.4 KiB |
| layer | 3 | 12.0 KiB | 6.6 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 250.8 s** (tooling): play 83.8 · consolidate 106.7 · verify 18.4 · probes 22.5 · tests 0.0 · seal + snapshot 6.4 · report 13.0

250.81 s tooling: prepare 1.77 · play 82.01 · consolidate 106.72 · verify 10.07 (diff_commits + full compareTree) · version walk 8.36 · probes 22.46 · metrics 0.73 · seal 1.39 · sealed figures 2.39 · snapshot copy 2.66 · report 0.33

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T20:48:23.355Z | optimize | Speed: not judged: baseline not set (pilot); Scaling: not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: glob_tree.statements per tree file: depth exponent 1.489; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (10 classes too narrow); Range growth: 97.3 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 2619 ms for 565.9 MiB new; size exponent not judged (2 snapshots); Wall projection: 1 |

### G. Evidence

- `~/lfs-history/metrics/range-025.a1.json`
- trace `~/lfs-history/runs/p3-main-r/trace/range-025.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-r/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-025.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r025-2-root | 160 | 247.8 KiB |
| r025-3-packages-lsp | 574 | 257.5 KiB |
| r025-1-examples-desktop | 914 | 307.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 323.0 | 2,204 |
| `git diff --stat` | 44.0 | 2,196 |
| `git add -f` | 46.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 47.0 | 2,206 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r025-2-root | end | P1 | pass | — | — |
| r025-2-root | end | P2 | pass | exit 0 | — |
| r025-2-root | end | P3 | n/a | an install, not a refresh | — |
| r025-2-root | end | P4 | n/a | no changed package to build | — |
| r025-2-root | end | P5 | n/a | no calibrated file | — |
| r025-2-root | end | P6 | n/a | not a repair | — |
| r025-1-examples-desktop | end | P1 | pass | — | — |
| r025-1-examples-desktop | end | P2 | pass | exit 0 | — |
| r025-1-examples-desktop | end | P3 | pass | 192 bookkeeping path(s) | — |
| r025-1-examples-desktop | end | P4 | n/a | no changed package to build | — |
| r025-1-examples-desktop | end | P5 | n/a | no calibrated file | — |
| r025-1-examples-desktop | end | P6 | n/a | not a repair | — |
| r025-3-packages-lsp | end | P1 | pass | — | — |
| r025-3-packages-lsp | end | P2 | pass | exit 0 | — |
| r025-3-packages-lsp | end | P3 | pass | 192 bookkeeping path(s) | — |
| r025-3-packages-lsp | end | P4 | pass | 13 emitted files, exit 1 | — |
| r025-3-packages-lsp | end | P5 | pass | 7 files | — |
| r025-3-packages-lsp | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 20 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (834 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
