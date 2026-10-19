# Range 029 · **watch** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r028 (live Store) · **re-judged after fix 054** (retained state, not replayed)
dsh `f1202d0dd`..`402f8c5f5` · **90 commits** (3 mainline, 87 side) · 2026-07-21 → 2026-07-22
Areas changed: `/` 26% · `packages/ui` 17% · `.agents/notes` 16% · other 42%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 19 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 110.1 s · git 152.1 s · Node 233.3 s · verify 8.1 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **719.4 MiB** (+15.3 MiB) | **774.1 MiB** (+36.4 MiB) live | **1.08×** (prev 1.05×) | **37.1 MiB** | **930** (total 33,478) | **272.8 s** tooling (total 77.6 min) |

**Checks:** 14 pass · 5 watch: Speed not judged: baseline not set (pilot); Scaling not judged: stat (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters glob_tree.vm_steps per tree file: depth exponent 0.242; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (19 classes too narrow); Directory share 0.506
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ fs.write p95 +86% · ▲ probe fork +62% · ▲ fs.list p95 +42%
**Budget:** 30 of 202 ranges · projected total 16.3 h (budget 16.8 h) · disk 43% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **230 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 4 lanes merged, 2 publishes |
| Steps | 2,625 / 2,625 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **24 / 24 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2443 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 372 bin shims, 3850 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (48 lines from 3 .gitignore files) · **163 picks** in 4 merges (163 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `402f8c5f5`** · 110 commits written for 110 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 632 untracked, unignored (2,474,386 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 163 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r029-1-agents-notes | end | `e7d24ad04254` | `0598fce19e83` | pass (374 normalized) | pass | pass | n/a | n/a | n/a |
| r029-4-scripts | end | `40a7e3169670` | `0598fce19e83` | pass (374 normalized) | pass | pass | pass | n/a | n/a |
| r029-3-packages-ui | end | `ea6eefcf3dbe` | `0598fce19e83` | pass (374 normalized) | pass | pass | pass | pass | n/a |
| r029-2-root | end | `4711b451aa67` | `631a9db272f2` | pass (375 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `81056a04aef7` | `null` | n/a | pass | n/a | n/a | pass | pass (125,711 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/core/session/tests/scoped.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/ui/user-approval/tests/approval.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/tools/tests/tools.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively).

## 2. Activity

**3,514 calls** · **309 steps** by **9 agents + lead** on **4 Branches + main** · **366 Workspaces** (100% one-shot, 0 open at end)
**File changes:** +131 added · 551 modified · −42 deleted · 10.7 MiB written · fs 659 : Sandbox 65 (**10 : 1**, reported only in P3)
**Execs:** 927 (JS 106 · shell 821) · 2 non-zero exits · install 0 · test runs 5 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,051 | 673 | 378 | Committed 673 · Text 41 · NoSuchPath 20 · Equal 2 |
| sandbox | 2,027 | 1,290 | 5 | commit 363 (Committed 270, UpToDate 92, Conflict 1) · exec 927 (exit:0 925, exit:2 1, exit:1 1) · mount 366 (Mounted 366) · status 5 · unmount 366 (Unmounted 366) |
| branch | 425 | 34 | 391 | diff_branches 13 · diff_commits 378 · fork 23 (Forked 23) · merge 9 (Merged 9) · publish 2 (Added 2) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,514** | **1,997** | **785** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r029-1-agents-notes | a01 a02 a03 | 87 | 235 | ✓ | ✓ |
| r029-2-root | a04 a05 | 41 | 190 | ✓ | — |
| r029-3-packages-ui | a06 a07 a08 | 99 | 227 | ✓ | — |
| r029-4-scripts | a09 a10 | 74 | 203 | ✓ | — |
| main | lead | 8 | 75 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r029-4, a09 after a10 | 0.1 s |
| Stale clean merge | 1 / 1 | r029-4, a09 a10 | merged cleanly |
| Decoy edit | 1 / 1 | r029-4, a10 a09 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r029-2 vs r029-1 publish | 4.1 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r029-1 | 49 | 28 | 21 | 0 | 0 | 99 | — |
| a02 | r029-1 | 1 | 0 | 1 | 0 | 0 | 2 | — |
| a03 | r029-1 | 37 | 20 | 17 | 0 | 0 | 134 | — |
| a04 | r029-2 | 12 | 3 | 9 | 0 | 0 | 81 | — |
| a05 | r029-2 | 29 | 17 | 12 | 0 | 0 | 109 | — |
| a06 | r029-3 | 61 | 36 | 25 | 0 | 0 | 95 | — |
| a07 | r029-3 | 38 | 20 | 18 | 0 | 0 | 132 | — |
| a09 | r029-4 | 45 | 20 | 25 | 0 | 0 | 93 | commit-conflict, stale-clean-merge, decoy |
| a10 | r029-4 | 29 | 14 | 15 | 0 | 0 | 110 | commit-conflict, stale-clean-merge, decoy |
| lead | main | 8 | 1 | 0 | 7 | 0 | 75 | merge-race |
| **Total** |  | **309** | **159** | **143** | **7** | **0** | **930** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 213 · pnpm 1 · tsc 3 · vitest 5 · other 705

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r029-2-root | 33 | 33 | 33 | 2 | 33 | 281 |
| r029-4-scripts | 47 | 47 | 47 | 2 | 47 | 337 |
| r029-3-packages-ui | 68 | 68 | 68 | 2 | 68 | 516 |
| r029-1-agents-notes | 57 | 57 | 56 | 1 | 57 | 524 |
| **lead** | — | — | — | — | 110 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r029-1-agents-notes | 0 | 1 | 0 | 0 | 0 | — / — |
| r029-4-scripts | 0 | 1 | 1 | 0 | 0 | — / — |
| r029-3-packages-ui | 0 | 1 | 1 | 1 | 13 | 13 / 13 |
| r029-2-root | 1 | 0 | 1 | 1 | 46 | 46 / 46 |
| **lead repair** | 1 | — | 1 | — | — | 125,711 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r028) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 704.2 MiB (17.4 MiB / 611.2 MiB / 16.0 MiB / 59.5 MiB) | 719.4 MiB (17.9 MiB / 624.8 MiB / 16.2 MiB / 60.5 MiB) | +15.3 MiB |
| Version figures from | — | incremental (68,872 changed paths) | — |
| Files / directories / symlinks | 51,612 / 8,694 / 3,841 | 53,844 / 8,783 / 3,858 | +2,232 / +89 / +17 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 737.6 MiB | 774.1 MiB | +36.4 MiB |
| **Space amplification** (total · tracked) | 1.05× · tracked 4.69× | 1.08× · tracked 4.66× | 0.03 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **18.90** (0.40 / 0.08 / 0.49) | 7.46× the median range |
| **Stored per Commit** | 26.3 KiB | 40.1 KiB | — |
| Metadata share | 0.37 | 0.37 | this range 0.51 |
| History: Commits / Layers / Branches | 32,548 | 33,478 / 16 / 233 | +930 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 13.95 GiB (Commits 12.20 GiB · installs 904.0 MiB · build 110.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 43.97 GiB / 43% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 483.4 MiB | 0.67 | +15.1 MiB |
| Metadata | 64.0 MiB | 0.09 | +2.9 MiB |
| Index rows + waste + other (live, not split) | 226.7 MiB | 0.32 | — |
| **Total = Store on disk** | **774.1 MiB** | **= 1.08** space amplification | +36.4 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 17.9 MiB | 83.3 MiB (47.7 MiB + 35.6 MiB) | 4.66× | — | 1.5 MiB | 2.0 MiB | 0.77 |
| `node_modules` | 624.8 MiB | 193.1 MiB (180.5 MiB + 12.6 MiB) | 0.31× | — | 3.7 MiB | 29.5 MiB | 0.13 |
| Build output | 16.2 MiB | 10.9 MiB (10.2 MiB + 640.0 KiB) | 0.67× | — | 502.8 KiB | 6.3 MiB | 0.08 |
| `.git` | 60.5 MiB | 232.7 MiB (223.7 MiB + 9.0 MiB) | 3.84× | — | 12.3 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 226.7 MiB | — (not divided) | — | 18.4 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 27.4 MiB | — | — | — | — | — |
| **Total** | — | **774.1 MiB** | **= 1.08×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +6,408 | — | 0 (derived) | 62% |
| Chunks (large files) | — (at snapshots) | +1,061 | — | — | 7% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 4,876 (with inodes, pooled) | — | — | 50% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +3,986 | — | — | — |

Delta: 1.8% at depth cap · 15% of refused bases stopped by budget · `node_modules` reinstall: 0.031× the raw bytes of 10 changed packages (ratio: 828311 new stored for 26939737 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.66× (83.3 MiB for 17.9 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.1 KiB / 2.4 KiB / 3.2 KiB over 315 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (4.2 MiB stored for 2.42 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.27 (4 lanes × 719.4 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 3.2 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.6 ms / 34.9 ms | 2.8 ms / 4.2 ms | 4.0 ms / 7.3 ms | 16.4 ms / 41.0 ms | 10.3 ms / 16.6 ms | 455 ms / 569 ms | — (native comparison in P3; exec 40.8 ms / 680 ms) |
| SQL p50: 168 stmts | 54 stmts | 69 stmts | 171 stmts | 49 stmts | 9,075 stmts | — |

**Commit cost:** 11.16 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 578 ms p50 over 366
**Slowest:** sandbox.exec 36231 ms · sandbox.exec 30832 ms · sandbox.exec 30075 ms · checkpoint diff_commits 0.09 ms and 1.40 statements per entry (68,784 entries per page)
**Scaling:** 6 of 15 probes flat · `stat` 0.53 · `read` 0.39 · `list_small` 0.50 · `list_largest` 1.70 · `grep_scoped` 0.28 · `grep_tree` 0.57 · `glob_tree` 1.33 · `oneshot_mount_unmount` 0.21 · `oneshot_commit` 0.23

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 306 ms / 306 ms | — / — | — | git / status-cold: — |
| git status (steady) | 322 ms / 452 ms | — / — | — | git / status-steady: — |
| git add | 25.0 ms / 43.0 ms | — / — | — | git / add: — |
| git commit (lane) | 31.0 ms / 48.0 ms | — / — | — | git / commit: — |
| lead writes main | 2847 ms / 2847 ms | — / — | — | — |
| repack | 1760 ms / 1760 ms | — / — | — | — |
| pnpm install (incremental) | 8484 ms / 8484 ms | 2308 ms / 2308 ms | 3.68× | pnpm-reinstall / cold: — |
| pnpm refresh | 3190 ms / 3190 ms | 1957 ms / 1957 ms | 1.63× | pnpm-reinstall / steady: — |
| tsc -b | 4060 ms / 4060 ms | 2624 ms / 3641 ms | 1.55× | tsc-b / cold: — |
| vitest | 7100 ms / 7100 ms | 6662 ms / 6662 ms | 1.07× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.7 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.9 ms / 20.5 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4124152 → 4194304 B · fs.write ≤8 KiB 24752 → 4194304 B · fs.write ≤64 KiB 4136512 → 4194304 B · fs.read ≤8 KiB 4136512 → 4194304 B · sandbox.mount 4136512 → 2793392 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 45352 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 10.04 at the first command → 5.67 after the last (max 10.04 over 7 commands) · Docker VM 1.92 → 1.66

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-029.a1)

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

- **a1 (`p3-main-t`, live after r28 a2, daemon `45a196ef`, addon `4668012e`; binaries from main 3ef00d32e5, owner 2026-10-20; units not used): WATCH, terminal, re-judged after fix 054 on retained state.** Checkpoint ok, git ✓. Node first judged 18 pass, 1 stop over 5 points: `r029-2-root.end` P4, tsc exit 1 on LayerFS against native 2.
  - Cause ([fix 054](../fixes/054-r029-a1-native-unchanged-file-times.md)): the native chain extracted each tree whole with new times, so `tsc -b` rebuilt every package. `llm-pi-ai`'s unchanged source then failed against `pi-ai` 0.81.1. LayerFS, like a checkout, left it up to date and failed later in `apps/cli`.
  - The chain now copies in only files that differ by content (`SYNC_TREE`, `CHAIN_VERSION` 4). A first git-diff version broke the lead repair's native install after the lanes' merge and was superseded.
  - After the re-judge: Node 19 pass, 0 stop, 0 NOT_RUN over 5 points; repair P6 pass (1,499 emitted). Control `control-029.a1` passes.
  - Watch rows: Speed not judged (baseline not set, accepted); Counters `glob_tree.vm_steps` per tree file, depth exponent 0.242; Directory share 0.506.
  - 301 steps in lanes cut at plan orders 53 and 71 (the first safe cut is at 185 steps). Final steps: repair 110 s (160 s alarm), verify 12 s, finish 39 s. Repair build 19.1 s, install 36.2 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2625/2625; conflicts 4/4; tests 24/24 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.242 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (19 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.506 | < 0.5 | watch |
| Reinstall growth | 0.031× the raw bytes of 10 changed packages (ratio: 828311 new stored for 26939737 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0179 (budget 0.15) | < 0.1 | pass |
| Range growth | 37.1 MiB, 0.85× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.43 | < 0.8 | pass |
| Wall projection | 0.97 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 110 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 19 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 163 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 309 | 309 |
| Lanes / agents | 4 / 9 | 4 / 10 |
| LayerFS Commits | 930 | 711 |
| Workspaces (one-shot share) | 366 (0.99) | 142 (0.986) |
| Reads | 335 | 335 |
| Reconcile writes | 65 | 65 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 579.81 | 579.81 | 579.81 | 579.81 | no baseline | no baseline | — | — | 35,439 / 588,947 / 0 | — | 2.3763 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 12 | 19.82 | 311.68 | 311.68 | 313.36 | no baseline | no baseline | -0.51 | -0.67 | 278 / 24,740 / 0 | — | 0.0802 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 373 | 18.73 | 35.51 | 60.21 | 344.01 | no baseline | no baseline | -0.16 | -0.20 | 281 / 30,186 / 0 | — | 0.1033 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.79 | 2.60 | 2.60 | 2.69 | no baseline | no baseline | 0.23 | 0.07 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 1.33 | 1.33 | 1.33 | 1.34 | no baseline | no baseline | -0.59 | -0.50 | 70 / 1,298 / 0 | — | 0.0668 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 2 | 569.22 | 569.22 | 569.22 | 612.74 | no baseline | no baseline | — | — | 9,075 / 818,377 / 0 | — | 11.1407 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 191.17 | 191.17 | 191.17 | 454.73 | no baseline | no baseline | -0.86 | -0.65 | 8,036 / 698,209 / 0 | — | 2.6925 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 2 | 3.89 | 3.89 | 3.89 | 4.11 | no baseline | no baseline | -2.13 | -1.71 | 66 / 1,375 / 0 | — | — | — |
| fs.apply | ≤1 KiB · uncontended | 1 | 13.11 | 13.11 | 13.11 | 13.11 | no baseline | no baseline | 0.72 | 0.65 | 196 / 16,468 / 0 | — | 0.0148 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 1 | 17.91 | 17.91 | 17.91 | 17.91 | no baseline | no baseline | 0.06 | 0.00 | 176 / 8,883 / 0 | — | 0 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 5 | 7.38 | 9.43 | 9.43 | 14.42 | no baseline | no baseline | -0.60 | -0.11 | 165 / 10,022 / 0 | — | 0.0066 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 26 | 8.05 | 12.52 | 13.48 | 17.81 | no baseline | no baseline | -0.46 | -0.40 | 180 / 10,487 / 0 | — | 0.0306 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 3 | 9.22 | 9.22 | 9.22 | 10.74 | no baseline | no baseline | 1.11 | 0.89 | 185 / 12,707 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 15 | 9.82 | 12.65 | 12.65 | 12.81 | no baseline | no baseline | 1.29 | 1.16 | 192 / 11,274 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 9 | 9.41 | 11.24 | 11.24 | 15.37 | no baseline | no baseline | 0.93 | 0.70 | 189 / 11,649 / 0 | — | 0.0014 ms per byte | sdk.read |
| fs.glob | 17–64 files · uncontended | 17 | 4.14 | 6.70 | 6.70 | 6.97 | no baseline | no baseline | 0.48 | 0.26 | 71 / 6,991 / 0 | — | 0.1054 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 1.45 | 1.45 | 1.45 | 2.62 | no baseline | no baseline | -1.82 | -2.14 | 55 / 3,160 / 0 | — | 0.363 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 3.05 | 3.05 | 3.05 | 5.25 | no baseline | no baseline | 0.25 | 0.25 | 45 / 4,421 / 0 | — | 1.4555 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 4.47 | 4.47 | 4.47 | 4.47 | no baseline | no baseline | 0.56 | 0.57 | 127 / 12,189 / 0 | — | 0.5587 ms per file | — |
| fs.glob | 5–16 files · uncontended | 10 | 4.20 | 4.78 | 4.78 | 8.05 | no baseline | no baseline | 0.90 | 0.62 | 64 / 7,142 / 0 | — | 0.4761 ms per file | — |
| fs.glob | >64 files · contended | 6 | 6.12 | 14.44 | 14.44 | 15.71 | no baseline | no baseline | -0.31 | -0.70 | 112 / 10,744 / 0 | — | 0.0486 ms per file | — |
| fs.glob | >64 files · uncontended | 13 | 4.87 | 12.65 | 12.65 | 16.03 | no baseline | no baseline | -0.34 | -0.06 | 81 / 8,964 / 0 | — | 0.0447 ms per file | — |
| fs.grep | 17–64 files · contended | 3 | 8.85 | 8.85 | 8.85 | 10.08 | no baseline | no baseline | -0.59 | -0.15 | 253 / 14,928 / 0 | — | 0.1474 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 13 | 6.87 | 13.53 | 13.53 | 13.86 | no baseline | no baseline | 0.34 | 0.02 | 195 / 9,007 / 0 | — | 0.1459 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 3.45 | 3.45 | 3.45 | 7.46 | no baseline | no baseline | 0.63 | 0.68 | 65 / 4,535 / 0 | — | 1.723 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 3 | 3.36 | 3.36 | 3.36 | 4.42 | no baseline | no baseline | 0.10 | -0.13 | 54 / 4,496 / 0 | — | 1.12 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 3.04 | 3.04 | 3.04 | 3.04 | no baseline | no baseline | -0.99 | -1.17 | 118 / 9,496 / 0 | — | 0.38 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 10 | 5.35 | 7.87 | 7.87 | 10.01 | no baseline | no baseline | 1.01 | 0.60 | 111 / 7,662 / 0 | — | 0.6603 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 5 | 17.23 | 17.95 | 17.95 | 20.02 | no baseline | no baseline | -3.42 | -2.78 | 339 / 20,000 / 0 | — | 0.1424 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 17 | 16.59 | 34.74 | 34.74 | 35.95 | no baseline | no baseline | -0.35 | 0.02 | 347 / 20,051 / 0 | — | 0.1503 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 6 | 5.85 | 8.19 | 8.19 | 8.94 | no baseline | no baseline | -0.53 | -0.50 | 168 / 14,980 / 0 | — | 0.1169 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 26 | 4.14 | 7.11 | 7.25 | 9.28 | no baseline | no baseline | -0.00 | 0.24 | 72 / 7,785 / 0 | — | 0.0958 ms per entrie | — |
| fs.list | 2–4 entries · contended | 3 | 3.18 | 3.18 | 3.18 | 5.25 | no baseline | no baseline | 1.76 | 1.54 | 45 / 3,816 / 0 | — | 1.5885 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 5 | 3.49 | 3.69 | 3.69 | 4.80 | no baseline | no baseline | 0.38 | 0.31 | 53 / 4,397 / 0 | — | 1.4455 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 2.95 | 2.95 | 2.95 | 4.63 | no baseline | no baseline | -0.66 | -0.70 | 93 / 7,297 / 0 | — | 0.4213 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 11 | 3.13 | 4.29 | 4.29 | 4.78 | no baseline | no baseline | 0.29 | 0.12 | 51 / 4,695 / 0 | — | 0.4347 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 2.79 | 2.79 | 2.79 | 2.85 | no baseline | no baseline | -0.20 | -0.42 | 72 / 3,740 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 4 | 3.50 | 3.63 | 3.63 | 3.84 | no baseline | no baseline | -1.38 | -1.24 | 73 / 4,481 / 0 | — | 0.0044 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 5 | 2.83 | 2.89 | 2.89 | 3.36 | no baseline | no baseline | 0.47 | 0.46 | 58 / 4,180 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 2.79 | 3.38 | 3.38 | 4.28 | no baseline | no baseline | 0.20 | 0.07 | 54 / 3,661 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 36 | 2.57 | 4.25 | 4.55 | 7.75 | no baseline | no baseline | -0.05 | -0.14 | 48 / 3,834 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 22 | 16.78 | 41.10 | 65.15 | 76.78 | no baseline | no baseline | 0.39 | 0.02 | 411 / 27,656 / 0 | — | 16.777 ms per file | commit |
| fs.rm | 1 files · uncontended | 17 | 9.70 | 15.75 | 15.75 | 15.99 | no baseline | no baseline | 0.08 | 0.15 | 154 / 7,393 / 0 | — | 9.7 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 3 | 2.85 | 2.85 | 2.85 | 3.42 | no baseline | no baseline | 0.90 | 0.56 | 55 / 4,138 / 0 | — | 0.006 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 10 | 2.77 | 4.20 | 4.20 | 8.18 | no baseline | no baseline | 0.36 | 0.24 | 46 / 4,073 / 0 | — | 0.0063 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.31 | 2.31 | 2.31 | 3.37 | no baseline | no baseline | -0.25 | -0.21 | 31 / 1,741 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 14 | 2.10 | 3.31 | 3.31 | 3.35 | no baseline | no baseline | -0.47 | -0.50 | 37 / 1,848 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 6 | 2.89 | 3.00 | 3.00 | 3.26 | no baseline | no baseline | -0.86 | -0.63 | 53 / 3,992 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 22 | 2.63 | 3.60 | 3.72 | 4.46 | no baseline | no baseline | 0.49 | 0.31 | 43 / 3,787 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 26 | 16.18 | 96.51 | 125.45 | 203.56 | no baseline | no baseline | 1.06 | 0.82 | 368 / 29,939 / 0 | — | 0.0295 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 50 | 9.40 | 15.34 | 16.04 | 18.79 | no baseline | no baseline | -0.04 | -0.04 | 169 / 8,741 / 0 | — | 0.0184 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 10 | 15.84 | 31.63 | 31.63 | 32.05 | no baseline | no baseline | -0.42 | -0.46 | 354 / 21,281 / 0 | — | 0.0001 ms per byte | files.change |
| fs.write | ≤512 KiB · uncontended | 28 | 11.19 | 14.75 | 16.59 | 24.21 | no baseline | no baseline | -0.03 | -0.06 | 135 / 6,824 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 34 | 16.85 | 113.55 | 136.06 | 159.29 | no baseline | no baseline | 0.80 | 0.50 | 376 / 24,730 / 0 | — | 0.0011 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 141 | 8.70 | 15.55 | 23.53 | 36.97 | no baseline | no baseline | 0.22 | 0.16 | 158 / 6,867 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 92 | 16.24 | 66.08 | 95.34 | 96.95 | no baseline | no baseline | 0.58 | 0.39 | 393 / 29,303 / 0 | — | 0.0054 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 239 | 8.42 | 15.18 | 21.43 | 88.26 | no baseline | no baseline | 0.11 | 0.06 | 153 / 6,823 / 0 | — | 0.0027 ms per byte | files.change |
| operator.store.stats | — · uncontended | 1 | 0.67 | 0.67 | 0.67 | 0.67 | no baseline | no baseline | 0.89 | 0.54 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 50 | 21.71 | 44.56 | 47.53 | 62.15 | no baseline | no baseline | -0.73 | -0.75 | 235 / 23,594 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 156 | 19.06 | 31.03 | 46.95 | 287.09 | no baseline | no baseline | -0.36 | -0.45 | 203 / 16,371 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 9 | 3.71 | 4.75 | 4.75 | 8.63 | no baseline | no baseline | -0.29 | -0.22 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 83 | 3.50 | 5.25 | 7.32 | 8.18 | no baseline | no baseline | 0.07 | 0.07 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 10 | 12.51 | 20.28 | 20.28 | 33.66 | no baseline | no baseline | -0.34 | -0.16 | 130 / 5,937 / 0 | — | 12.511 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 25 | 8.83 | 11.25 | 11.64 | 13.29 | no baseline | no baseline | 0.06 | 0.01 | 117 / 4,530 / 0 | — | 8.83 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 216.46 | 216.46 | 216.46 | 216.46 | no baseline | no baseline | 0.13 | 0.27 | 13,038 / 475,690 / 8,273 | — | 216.459 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 5 | 10.39 | 14.59 | 14.59 | 21.06 | no baseline | no baseline | -1.30 | -0.83 | 167 / 6,681 / 0 | — | 4.721 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 7 | 10.98 | 13.21 | 13.21 | 14.17 | no baseline | no baseline | -0.14 | -0.03 | 134 / 6,076 / 0 | — | 4.331 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 87.53 | 87.53 | 87.53 | 87.53 | no baseline | no baseline | -2.98 | -3.34 | 1,274 / 149,896 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 95.90 | 1468.17 | 1468.17 | 13570.12 | no baseline | no baseline | 0.81 | 0.63 | 1,283 / 155,146 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 327 | 459.35 | 715.93 | 966.07 | 2300.40 | no baseline | no baseline | -0.67 | -0.99 | — | 2967.30 | — | — |
| sandbox.exec | 0 files · uncontended | 309 | 34.34 | 508.90 | 709.07 | 7611.02 | no baseline | no baseline | -0.12 | -0.07 | — | 3,015 | — | — |
| sandbox.exec | 1 files · contended | 70 | 40.88 | 66.53 | 72.50 | 73.30 | no baseline | no baseline | -0.23 | -0.15 | — | 5 | 40.88 ms per file | — |
| sandbox.exec | 1 files · uncontended | 81 | 39.09 | 68.33 | 76.94 | 79.42 | no baseline | no baseline | 0.01 | 0.10 | — | 4.70 | 39.087 ms per file | — |
| sandbox.exec | 17–64 files · contended | 1 | 70.75 | 70.75 | 70.75 | 70.75 | no baseline | no baseline | 0.09 | 0.20 | — | 87 | 3.5374 ms per file | — |
| sandbox.exec | 2–4 files · contended | 29 | 43.66 | 69.90 | 75.46 | 77.27 | no baseline | no baseline | 0.02 | -0.03 | 0 / 0 / 0 | 13 | 15.488 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 42 | 47.23 | 69.32 | 70.34 | 71.98 | no baseline | no baseline | 0.59 | 0.36 | — | 11.70 | 18.3345 ms per file | — |
| sandbox.exec | 5–16 files · contended | 6 | 54.52 | 62.51 | 62.51 | 63.13 | no baseline | no baseline | 0.12 | 0.26 | — | 32 | 6.0582 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 9 | 69.21 | 74.39 | 74.39 | 75.15 | no baseline | no baseline | 0.42 | 0.25 | — | 37 | 8.8861 ms per file | — |
| sandbox.exec | — · contended | 15 | 4443.77 | 30075.18 | 30075.18 | 30832.39 | no baseline | no baseline | -0.16 | 0.10 | — | 47647.50 | — | — |
| sandbox.exec | — · uncontended | 28 | 122.72 | 14825.32 | 19114.84 | 36230.76 | no baseline | no baseline | -1.35 | -1.52 | — | 35129.90 | — | — |
| sandbox.mount | — · contended | 77 | 10.35 | 16.65 | 41.00 | 50.25 | no baseline | no baseline | -0.30 | -0.25 | 56 / 1,569 / 82 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 279 | 10.23 | 16.50 | 19.34 | 27.11 | no baseline | no baseline | -0.11 | -0.10 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 7.12 | 8.72 | 8.72 | 40.12 | no baseline | no baseline | 0.97 | 0.89 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 61 | 13.52 | 21.77 | 27.57 | 60.33 | no baseline | no baseline | 0.40 | 0.44 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 295 | 12.89 | 20.16 | 116.53 | 191.11 | no baseline | no baseline | 0.42 | 0.36 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 697.0 KiB | 3,054 | ok 13 |
| branch.diff_commits | branch | 378 | 0.0 KiB | 20.4 MiB | 69,972 | ok 378 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 10 | 0.0 KiB | 94.0 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 14 | 404.6 KiB | 0.0 KiB | 25 | Committed 14 |
| fs.diff_files | fs | 63 | 0.0 KiB | 478.5 KiB | 43 | Text 41, NoSuchPath 20, Equal 2 |
| fs.glob | fs | 62 | 0.0 KiB | 69.1 KiB | 886 | ok 62 |
| fs.grep | fs | 64 | 0.0 KiB | 335.4 KiB | 960 | ok 64 |
| fs.list | fs | 65 | 0.0 KiB | 315.6 KiB | 2,155 | ok 65 |
| fs.read | fs | 59 | 0.0 KiB | 176.4 KiB | 59 | ok 59 |
| fs.rm | fs | 39 | 0.0 KiB | 0.0 KiB | 39 | Committed 39 |
| fs.stat | fs | 65 | 0.0 KiB | 14.5 KiB | 65 | ok 65 |
| fs.write | fs | 620 | 10.2 MiB | 0.0 KiB | 620 | Committed 620 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 363 | 0.0 KiB | 0.0 KiB | 0 | Committed 270, UpToDate 92, Conflict 1 |
| sandbox.exec | sandbox | 927 | 2.0 MiB | 4.1 MiB | 0 | exit:0 925, exit:2 1, exit:1 1 |
| sandbox.mount | sandbox | 366 | 0.0 KiB | 0.0 KiB | 0 | Mounted 366 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 366 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 366 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 1.92 · end 1.66.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.567 | 16.622 · 2.209 · 1.272 · 1.298 · 1.567 | 2.05–2.05 | statements 23, vm_steps 828, fullscan_steps 0, sorts 0, returned_rows 68 |
| read | 1.367 | 1.821 · 1.004 · 1.367 · 1.544 · 1.34 | 2.05–2.05 | statements 14, vm_steps 630, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_small | 1.453 | 1.399 · 1.454 · 1.589 · 1.244 · 1.453 | 2.05–2.05 | statements 14, vm_steps 639, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_largest | 4.973 | 6.46 · 4.77 · 5.288 · 4.431 · 4.973 | 2.05–2.05 | statements 77, vm_steps 8943, fullscan_steps 0, sorts 0, returned_rows 974 |
| grep_scoped | 1.546 | 1.575 · 1.542 · 1.625 · 1.546 · 1.424 | 2.05–2.05 | statements 19, vm_steps 785, fullscan_steps 0, sorts 0, returned_rows 68 |
| glob_scoped | 0.847 | 0.836 · 0.847 · 0.818 · 1.096 · 1.103 | 2.05–2.05 | statements 13, vm_steps 618, fullscan_steps 0, sorts 0, returned_rows 58 |
| grep_tree | 4717.522 | 4848.161 · 4630.769 · 4680.416 · 4758.779 · 4717.522 | 1.69–1.97 | statements 46528, vm_steps 3741540, fullscan_steps 0, sorts 0, returned_rows 379510 |
| glob_tree | 9.655 | 11.398 · 8.784 · 9.655 · 9.821 · 8.199 | 1.69–1.69 | statements 145, vm_steps 17406, fullscan_steps 0, sorts 0, returned_rows 1826 |
| diff_files | 3.902 | 4.452 · 3.902 · 4.438 · 3.833 · 3.804 | 1.69–1.69 | statements 60, vm_steps 3592, fullscan_steps 0, sorts 0, returned_rows 348 |
| list_commits | 0.829 | 2.494 · 0.922 · 0.792 · 0.77 · 0.829 | 1.69–1.69 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.182 | 3.153 · 2.253 · 2.164 · 2.182 · 2.18 | 1.69–1.69 | statements 53, vm_steps 1812, fullscan_steps 0, sorts 0, returned_rows 200 |
| fork | 0.956 | 1.141 · 1.409 · 0.754 · 0.908 · 0.956 | 1.69–1.69 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 29.62 | 31.003 · 29.864 · 26.919 · 27.302 · 29.62 | 1.69–1.69 | statements 450, vm_steps 20669, fullscan_steps 0, sorts 0, returned_rows 1477 |
| oneshot_mount_unmount | 19.33 | 26.955 · 18.604 · 25.205 · 17.961 · 19.33 | 1.69–1.69 | statements 57, vm_steps 2048, fullscan_steps 82, sorts 2, returned_rows 204 |
| oneshot_commit | 81.63 | 87.661 · 81.63 · 82.978 · 68.139 · 77.434 | 1.69–1.69 | statements 157, vm_steps 11442, fullscan_steps 82, sorts 2, returned_rows 829 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.69–1.69 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 272.8 s** (tooling): play 111.6 · consolidate 106.5 · verify 17.4 · probes 24.7 · tests 0.0 · seal + snapshot 0.0 · report 12.6

272.83 s tooling: prepare 1.49 · play 110.11 · consolidate 106.46 · verify 8.14 (diff_commits) · version walk 9.25 · probes 24.75 · metrics 0.77 · Store allocation 0.26 · report 0.30

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T22:07:34.243Z | watch | Speed: not judged: baseline not set (pilot); Scaling: not judged: stat (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: glob_tree.vm_steps per tree file: depth exponent 0.242; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (19 classes too narrow); Directory share: 0.506 |

### G. Evidence

- `~/lfs-history/metrics/range-029.a1.json`
- trace `~/lfs-history/runs/p3-main-t/trace/range-029.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-t/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r029-2-root | 281 | 324.2 KiB |
| r029-4-scripts | 337 | 325.9 KiB |
| r029-3-packages-ui | 516 | 326.4 KiB |
| r029-1-agents-notes | 524 | 336.1 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 322.0 | 2,674 |
| `git diff --stat` | 29.0 | 2,670 |
| `git add -f` | 25.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 31.0 | 2,673 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r029-1-agents-notes | end | P1 | pass | — | — |
| r029-1-agents-notes | end | P2 | pass | exit 0 | — |
| r029-1-agents-notes | end | P3 | pass | 234 bookkeeping path(s) | — |
| r029-1-agents-notes | end | P4 | n/a | no changed package to build | — |
| r029-1-agents-notes | end | P5 | n/a | no calibrated file | — |
| r029-1-agents-notes | end | P6 | n/a | not a repair | — |
| r029-4-scripts | end | P1 | pass | — | — |
| r029-4-scripts | end | P2 | pass | exit 0 | — |
| r029-4-scripts | end | P3 | pass | 234 bookkeeping path(s) | — |
| r029-4-scripts | end | P4 | pass | 16 emitted files, exit 0 | — |
| r029-4-scripts | end | P5 | n/a | no calibrated file | — |
| r029-4-scripts | end | P6 | n/a | not a repair | — |
| r029-3-packages-ui | end | P1 | pass | — | — |
| r029-3-packages-ui | end | P2 | pass | exit 0 | — |
| r029-3-packages-ui | end | P3 | pass | 234 bookkeeping path(s) | — |
| r029-3-packages-ui | end | P4 | pass | 74 emitted files, exit 2 | — |
| r029-3-packages-ui | end | P5 | pass | 13 files | — |
| r029-3-packages-ui | end | P6 | n/a | not a repair | — |
| r029-2-root | end | P1 | pass | — | — |
| r029-2-root | end | P2 | pass | exit 0 | — |
| r029-2-root | end | P3 | n/a | an install, not a refresh | — |
| r029-2-root | end | P4 | pass | 134 emitted files, exit 1 | — |
| r029-2-root | end | P5 | pass | 46 files | — |
| r029-2-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 24 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1499 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
