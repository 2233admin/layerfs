# Range 027 · **stop** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r026 (live Store)
dsh `ed784cfdc`..`86f115a07` · **63 commits** (3 mainline, 60 side) · 2026-07-20 → 2026-07-22
Areas changed: `/` 21% · `packages/ui` 12% · `packages/support` 10% · other 57%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 14 pass, 1 stop, 1 NOT_RUN over 4 points) · **Content 0.19×** · **Churn 0.00**
**Time split:** play 103.7 s · git 67.3 s · Node 180.5 s · verify 10.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **651.0 MiB** (+5.2 MiB) | **688.1 MiB** (+18.2 MiB) | **1.06×** (prev 1.04×) | **22.7 MiB** | **654** (total 30,629) | **271.6 s** tooling (total 69.1 min) |

**Checks:** 12 pass · 6 watch: Speed not judged: baseline not set (pilot); Scaling not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters glob_tree.vm_steps per tree file: depth exponent 0.451; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (15 classes too narrow); Directory share 0.563; Snapshot time 3001 ms for 601.1 MiB new; size exponent 0.157 · 1 optimize/stop: Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe fork +77% · ▼ stored added −48% · ▼ probe diff_files −41%
**Budget:** 28 of 202 ranges · projected total 16.6 h (budget 16.8 h) · disk 43% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **2,282 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,375 / 1,375 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2142 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 312 bin shims, 3439 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (46 lines from 3 .gitignore files) · **166 picks** in 3 merges (166 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `86f115a07`** · 95 commits written for 95 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 166 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r027-1-root | end | `6f0b325973d1` | `1cd0e67c51cf` | pass (323 normalized) | pass | n/a | pass | NOT_RUN | n/a |
| r027-2-packages-support | end | `61e56b5ce6be` | `54bac3c9202e` | pass (315 normalized) | pass | pass | pass | n/a | n/a |
| r027-3-docs-rfc | end | `87e6f1a9b394` | `54bac3c9202e` | pass (315 normalized) | pass | pass | pass | stop | n/a |
| lead | repair | `518ce623cdc1` | `null` | n/a | pass | n/a | n/a | pass | pass (113,460 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/skill/skill-local/tests/skill-local.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/tools.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively).

## 2. Activity

**1,980 calls** · **121 steps** by **8 agents + lead** on **3 Branches + main** · **160 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +74 added · 437 modified · −55 deleted · 6.6 MiB written · fs 531 : Sandbox 35 (**15 : 1**, reported only in P3)
**Execs:** 434 (JS 43 · shell 391) · 4 non-zero exits · install 0 · test runs 4 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 711 | 544 | 167 | Committed 544 · Text 21 · NoSuchPath 5 |
| sandbox | 914 | 590 | 4 | commit 156 (Committed 125, UpToDate 30, Conflict 1) · exec 434 (exit:0 430, exit:1 2, exit:2 2) · mount 160 (Mounted 160) · status 4 · unmount 160 (Unmounted 160) |
| branch | 345 | 32 | 313 | diff_branches 7 · diff_commits 306 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,980** | **1,166** | **494** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r027-1-root | a01 | 5 | 143 | ✓ | — |
| r027-2-packages-support | a02 a03 a04 a05 | 60 | 147 | ✓ | — |
| r027-3-docs-rfc | a06 a07 a08 | 50 | 146 | ✓ | — |
| main | lead | 6 | 218 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r027-2, a05 after a03 | 0.1 s |
| Stale clean merge | 1 / 1 | r027-2, a02 a03 | merged cleanly |
| Decoy edit | 1 / 1 | r027-2, a05 a03 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r027-1 | 5 | 2 | 3 | 0 | 0 | 143 | — |
| a02 | r027-2 | 7 | 1 | 6 | 0 | 0 | 28 | stale-clean-merge |
| a03 | r027-2 | 41 | 19 | 22 | 0 | 0 | 93 | commit-conflict, stale-clean-merge, decoy |
| a04 | r027-2 | 7 | 4 | 3 | 0 | 0 | 24 | — |
| a05 | r027-2 | 5 | 1 | 4 | 0 | 0 | 2 | commit-conflict, decoy |
| a06 | r027-3 | 3 | 1 | 2 | 0 | 0 | 9 | — |
| a07 | r027-3 | 37 | 21 | 16 | 0 | 0 | 98 | — |
| a08 | r027-3 | 10 | 6 | 4 | 0 | 0 | 39 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 218 | — |
| **Total** |  | **121** | **56** | **60** | **5** | **0** | **654** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 89 · pnpm 1 · tsc 3 · vitest 4 · other 337

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r027-3-docs-rfc | 37 | 37 | 37 | 1 | 37 | 362 |
| r027-2-packages-support | 42 | 42 | 42 | 0 | 42 | 398 |
| r027-1-root | 3 | 3 | 3 | 1 | 3 | 120 |
| **lead** | — | — | — | — | 95 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r027-1-root | 1 | 0 | 1 | 1 | 204 | — / — |
| r027-2-packages-support | 0 | 1 | 1 | 0 | 0 | — / — |
| r027-3-docs-rfc | 0 | 1 | 1 | 1 | 13 | — / 13 |
| **lead repair** | 1 | — | 1 | — | — | 113,460 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r026) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 645.8 MiB (15.3 MiB / 560.8 MiB / 13.5 MiB / 56.2 MiB) | 651.0 MiB (15.4 MiB / 564.9 MiB / 13.6 MiB / 57.1 MiB) | +5.2 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 47,827 / 8,016 / 3,440 | 47,950 / 8,040 / 3,445 | +123 / +24 / +5 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 669.9 MiB | 688.1 MiB | +18.2 MiB |
| **Space amplification** (total · tracked) | 1.04× · tracked 5.30× | 1.06× · tracked 5.30× | 0.02 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **11.92** (0.69 / 0.15 / 0.69) | 5.10× the median range |
| **Stored per Commit** | 17.8 KiB | 27.9 KiB | — |
| Metadata share | 0.36 | 0.37 | this range 0.56 |
| History: Commits / Layers / Branches | 29,975 | 30,629 / 16 / 252 | +654 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 12.40 GiB (Commits 10.71 GiB · installs 938.0 MiB · build 111.7 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 44.40 GiB / 43% | — |
| Snapshot | — | r027, 601.1 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 436.8 MiB | 0.67 | +8.0 MiB |
| Metadata | 57.1 MiB | 0.09 | +2.2 MiB |
| Index rows | 159.5 MiB | 0.25 | — |
| Waste | 33.8 MiB | 0.05 | — |
| Other | 860.0 KiB | 0.00 | — |
| **Total = Store on disk** | **688.1 MiB** | **= 1.06** space amplification | +18.2 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 15.4 MiB | 81.9 MiB (47.1 MiB + 34.9 MiB) | 5.30× | — | 909.6 KiB | 1.9 MiB | 0.47 |
| `node_modules` | 564.9 MiB | 176.6 MiB (165.1 MiB + 11.5 MiB) | 0.31× | — | 1.9 MiB | 4.2 MiB | 0.47 |
| Build output | 13.6 MiB | 10.6 MiB (10.0 MiB + 556.7 KiB) | 0.78× | — | 596.0 KiB | 5.6 MiB | 0.10 |
| `.git` | 57.1 MiB | 222.6 MiB (214.5 MiB + 8.2 MiB) | 3.90× | — | 6.4 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 194.2 MiB | — (not divided) | — | 8.0 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 2.1 MiB | — | — | — | — | — |
| **Total** | — | **688.1 MiB** | **= 1.06×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 102,244 | +1,794 | 6.2 KiB | 113 (derived) | 55% |
| Chunks (large files) | 43,856 | +556 | 14.2 KiB | — | 4% |
| Large-file extents | 13,574 | — | 0.2 KiB | — | — |
| Directories | 157,961 | 2,974 (with inodes, pooled) | 0.2 KiB | — | 42% |
| Inodes and attributes | 186,347 | ↑ pooled | 2.5 KiB | — | — |
| Symlinks | 1,986 | +3,628 | 0.1 KiB | — | — |

Delta: 2.2% at depth cap · 18% of refused bases stopped by budget · `node_modules` reinstall: 0.17× the raw bytes of 16 changed packages (ratio: 724708 new stored for 4266906 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.30× (81.9 MiB for 15.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.6 KiB / 1.9 KiB / 5.1 KiB over 177 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.19× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.5 MiB stored for 1.69 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.35 (3 lanes × 651.0 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.7 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.1 ms / 22.2 ms | 2.6 ms / 4.4 ms | 2.5 ms / 4.4 ms | 18.5 ms / 67.3 ms | 10.5 ms / 15.6 ms | 403 ms / 403 ms | — (native comparison in P3; exec 40.3 ms / 1040 ms) |
| SQL p50: 156 stmts | 52 stmts | 48 stmts | 187 stmts | 55 stmts | 7,449 stmts | — |

**Commit cost:** 13.48 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 533 ms p50 over 160
**Slowest:** sandbox.exec 37591 ms · sandbox.exec 25459 ms · sandbox.exec 24802 ms · checkpoint diff_commits 0.10 ms and 1.48 statements per entry (56,900 entries per page)
**Scaling:** 8 of 15 probes flat · `list_largest` 0.80 · `grep_tree` 0.16 · `diff_files` 0.41 · `list_commits` 1.29 · `diff_commits` 0.30 · `oneshot_mount_unmount` 0.80 · `oneshot_commit` 0.72

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 310 ms / 310 ms | — / — | — | git / status-cold: — |
| git status (steady) | 273 ms / 353 ms | — / — | — | git / status-steady: — |
| git add | 24.0 ms / 45.0 ms | — / — | — | git / add: — |
| git commit (lane) | 32.0 ms / 43.0 ms | — / — | — | git / commit: — |
| lead writes main | 2825 ms / 2825 ms | — / — | — | — |
| repack | 1613 ms / 1613 ms | — / — | — | — |
| pnpm install (incremental) | 4629 ms / 4629 ms | 3035 ms / 3035 ms | 1.53× | pnpm-reinstall / cold: — |
| pnpm refresh | 2298 ms / 2298 ms | 1808 ms / 1808 ms | 1.27× | pnpm-reinstall / steady: — |
| tsc -b | 2227 ms / 2227 ms | 3634 ms / 5494 ms | 0.61× | tsc-b / cold: — |
| vitest | 7803 ms / 7803 ms | 8919 ms / 8919 ms | 0.87× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.8 ms / 22.5 ms

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
| 027.a1 | 30629 | 688.1 | 7.50 (1.27×) · 6978 · 235 (24 solo) | 7.67 (1.23×) · 7509 · 298 (119 solo) | 8.77 (1.20×) · 7101 · 349 (41 solo) | 2.92 (1.47×) · 3445 · — (0 solo) | 10.46 (1.15×) · 1362 · — (daemon) | 9.62 (1.15×) · 5076 · — (daemon) | 403.13 (—×) · 645820 · 8822 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4152992 → 4194304 B · fs.write ≤8 KiB 4152992 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3629752 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 8.40 at the first command → 10.42 after the last (max 13.45 over 6 commands) · Docker VM 3.73 → 3.48

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-027.a1)

## 5. Findings and action

### Finding 027.a1 · stop

**1. Trigger** (attempt 1, daemon `45a196ef16c6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Node proofs | 14 pass · 1 stop · 1 NOT_RUN over 4 points: r027-3-docs-rfc end P5 | P1–P6 pass at every point |

Diagnosis pending: `finding-027.a1.json`.

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

- (none yet)


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1375/1375; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.451 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (15 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.563 | < 0.5 | watch |
| Reinstall growth | 0.17× the raw bytes of 16 changed packages (ratio: 724708 new stored for 4266906 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0222 (budget 0.1797) | < 0.1 | pass |
| Range growth | 22.7 MiB, 0.52× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 3001 ms for 601.1 MiB new; size exponent 0.157 | < 0.15 | watch |
| Disk projection | 0.43 | < 0.8 | pass |
| Wall projection | 0.99 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 95 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 14 pass · 1 stop · 1 NOT_RUN over 4 points: r027-3-docs-rfc end P5 | P1–P6 pass at every point | stop |
| `.git` conflicts | 0 (tracked 0 · install 166 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.19× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 121 | 122 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 654 | 562 |
| Workspaces (one-shot share) | 160 (0.99) | 59 (0.966) |
| Reads | 120 | 120 |
| Reconcile writes | 211 | 211 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 7 | 49.92 | 330.55 | 330.55 | 519.21 | no baseline | no baseline | 1.09 | 1.56 | 628 / 62,666 / 0 | — | 0.23 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 301 | 21.18 | 33.61 | 41.03 | 372.53 | no baseline | no baseline | 0.17 | 0.29 | 303 / 33,259 / 0 | — | 0.1132 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.93 | 1.30 | 1.30 | 1.72 | no baseline | no baseline | 1.99 | 3.18 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.93 | 0.93 | 0.93 | 1.03 | no baseline | no baseline | -0.76 | -1.27 | 70 / 1,298 / 0 | — | 0.0466 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 2 | 403.13 | 403.13 | 403.13 | 472.34 | no baseline | no baseline | — | — | 7,449 / 645,820 / 0 | — | 6.7188 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 2.35 | 2.35 | 2.35 | 2.35 | no baseline | no baseline | -1.39 | -2.11 | 35 / 517 / 0 | — | 0.0184 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 9.07 | 9.07 | 9.07 | 9.07 | no baseline | no baseline | -1.38 | -1.39 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 24.25 | 24.25 | 24.25 | 24.25 | no baseline | no baseline | -0.19 | -0.72 | 167 / 10,949 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 3 | 23.73 | 23.73 | 23.73 | 84.64 | no baseline | no baseline | 0.07 | -0.14 | 539 / 86,273 / 8,191 | — | 0.1099 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 2 | 8.23 | 8.23 | 8.23 | 8.61 | no baseline | no baseline | -0.21 | -0.36 | 119 / 4,511 / 0 | — | 0.0131 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 4 | 15.88 | 31.04 | 31.04 | 91.09 | no baseline | no baseline | -7.90 | -9.65 | 364 / 21,188 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 2 | 6.53 | 6.53 | 6.53 | 7.49 | no baseline | no baseline | -0.96 | -1.25 | 131 / 5,101 / 0 | — | 0.0003 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 2 | 14.78 | 14.78 | 14.78 | 35.13 | no baseline | no baseline | -2.53 | -3.21 | 410 / 28,738 / 0 | — | 0.0038 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 3 | 8.01 | 8.01 | 8.01 | 8.90 | no baseline | no baseline | 0.31 | 0.31 | 155 / 7,975 / 0 | — | 0.007 ms per byte | commit |
| fs.diff_files | ≤1 KiB · uncontended | 7 | 6.34 | 13.37 | 13.37 | 18.52 | no baseline | no baseline | -0.88 | -0.99 | 134 / 7,069 / 0 | — | 0.0239 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 2 | 8.56 | 8.56 | 8.56 | 13.55 | no baseline | no baseline | 1.23 | 1.48 | 210 / 10,509 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 6 | 9.04 | 11.21 | 11.21 | 15.89 | no baseline | no baseline | 1.10 | 1.91 | 202 / 10,617 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 5.00 | 5.00 | 5.00 | 5.00 | no baseline | no baseline | -1.52 | -1.63 | 112 / 5,127 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 9.82 | 10.00 | 10.00 | 11.57 | no baseline | no baseline | 1.44 | 1.31 | 180 / 9,907 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 2.17 | 2.17 | 2.17 | 2.79 | no baseline | no baseline | 0.98 | 1.09 | 33 / 2,381 / 0 | — | 2.172 ms per file | — |
| fs.glob | 17–64 files · uncontended | 4 | 4.18 | 6.84 | 6.84 | 14.20 | no baseline | no baseline | 1.05 | 1.26 | 70 / 7,406 / 0 | — | 0.1671 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 2.06 | 2.06 | 2.06 | 2.06 | no baseline | no baseline | -0.13 | -0.43 | 35 / 2,861 / 0 | — | 0.6873 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 2.42 | 2.67 | 2.67 | 2.90 | no baseline | no baseline | 0.36 | 0.37 | 43 / 2,735 / 0 | — | 0.889 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 4.04 | 4.04 | 4.04 | 4.04 | no baseline | no baseline | 1.44 | 1.84 | 81 / 7,711 / 0 | — | 0.2525 ms per file | — |
| fs.glob | 5–16 files · uncontended | 6 | 2.40 | 2.97 | 2.97 | 3.79 | no baseline | no baseline | 0.33 | 0.51 | 47 / 4,342 / 0 | — | 0.3928 ms per file | — |
| fs.glob | >64 files · uncontended | 1 | 3.22 | 3.22 | 3.22 | 3.22 | no baseline | no baseline | -1.82 | -2.30 | 52 / 6,393 / 0 | — | 0.0453 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 2.00 | 2.00 | 2.00 | 2.00 | no baseline | no baseline | 0.00 | 0.03 | 46 / 3,174 / 0 | — | 1.998 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 14.45 | 14.56 | 14.56 | 14.87 | no baseline | no baseline | 1.92 | 2.49 | 265 / 15,352 / 0 | — | 0.2754 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 5 | 3.34 | 3.53 | 3.53 | 3.96 | no baseline | no baseline | 0.45 | 0.18 | 56 / 3,318 / 0 | — | 1.1773 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 5.03 | 5.03 | 5.03 | 5.03 | no baseline | no baseline | 1.77 | 2.42 | 118 / 6,887 / 0 | — | 1.0058 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 2 | 3.58 | 3.58 | 3.58 | 6.23 | no baseline | no baseline | -0.38 | -0.47 | 81 / 5,216 / 0 | — | 0.5113 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 1 | 23.78 | 23.78 | 23.78 | 23.78 | no baseline | no baseline | -2.73 | -3.29 | 598 / 34,910 / 0 | — | 0.1933 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 2 | 14.16 | 14.16 | 14.16 | 14.72 | no baseline | no baseline | -2.03 | -2.46 | 175 / 8,987 / 0 | — | 0.1753 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 1.81 | 1.81 | 1.81 | 1.81 | no baseline | no baseline | 0.33 | 0.20 | 34 / 2,164 / 0 | — | 1.814 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 2 | 3.00 | 3.00 | 3.00 | 3.87 | no baseline | no baseline | -0.96 | -1.29 | 45 / 4,513 / 0 | — | 0.0599 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 4.78 | 4.78 | 4.78 | 4.78 | no baseline | no baseline | 3.17 | 3.97 | 68 / 6,104 / 0 | — | 1.1945 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 7 | 2.35 | 2.50 | 2.50 | 3.00 | no baseline | no baseline | 0.17 | 0.08 | 48 / 3,881 / 0 | — | 0.683 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 2.28 | 2.28 | 2.28 | 2.28 | no baseline | no baseline | -0.57 | -0.51 | 46 / 4,093 / 0 | — | 0.3793 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 6 | 2.68 | 2.83 | 2.83 | 4.36 | no baseline | no baseline | 0.68 | 0.78 | 48 / 4,347 / 0 | — | 0.4039 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 2.18 | 2.18 | 2.18 | 2.18 | no baseline | no baseline | 0.65 | 0.17 | 46 / 2,627 / 0 | — | 0.0066 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 2 | 2.28 | 2.28 | 2.28 | 2.63 | no baseline | no baseline | -1.46 | -2.18 | 52 / 2,557 / 0 | — | 0.0029 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 2 | 2.15 | 2.15 | 2.15 | 2.54 | no baseline | no baseline | -0.25 | -0.36 | 45 / 3,541 / 0 | — | 0.0004 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 15 | 2.92 | 4.42 | 4.42 | 4.63 | no baseline | no baseline | 0.47 | 0.43 | 55 / 3,445 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 9 | 12.97 | 30.43 | 30.43 | 35.62 | no baseline | no baseline | 0.69 | 0.73 | 321 / 20,928 / 0 | — | 12.967 ms per file | commit |
| fs.rm | 1 files · uncontended | 46 | 7.51 | 23.66 | 24.90 | 33.51 | no baseline | no baseline | -0.55 | -0.66 | 138 / 6,487 / 0 | — | 7.508 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 2.83 | 2.83 | 2.83 | 2.83 | no baseline | no baseline | 2.33 | 3.20 | 67 / 4,121 / 0 | — | 0.0061 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 1 | 2.88 | 2.88 | 2.88 | 2.88 | no baseline | no baseline | 1.15 | 1.34 | 56 / 3,067 / 0 | — | 0.0064 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.51 | 2.51 | 2.51 | 3.08 | no baseline | no baseline | 0.45 | 0.65 | 47 / 3,805 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.20 | 2.90 | 2.90 | 3 | no baseline | no baseline | -0.06 | -0.22 | 38 / 3,027 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 8 | 2.77 | 3.19 | 3.19 | 4.34 | no baseline | no baseline | 1.10 | 1.11 | 48 / 3,725 / 0 | — | 0.0004 ms per byte | — |
| fs.write | ≤1 KiB · contended | 9 | 11.29 | 16.95 | 16.95 | 74.45 | no baseline | no baseline | 0.79 | 0.94 | 210 / 13,894 / 0 | — | 0.0129 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 73 | 7.50 | 11.50 | 12.47 | 14.14 | no baseline | no baseline | -0.43 | -0.78 | 136 / 6,978 / 0 | — | 0.0091 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 3 | 13.58 | 13.58 | 13.58 | 23.14 | no baseline | no baseline | -1.57 | -1.62 | 204 / 9,752 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 10 | 11.35 | 24.05 | 24.05 | 25.66 | no baseline | no baseline | 0.04 | -0.04 | 158 / 7,412 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 32 | 13.81 | 24.27 | 38.85 | 81.14 | no baseline | no baseline | 1.05 | 1.30 | 352 / 21,249 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 108 | 8.77 | 19.61 | 33.03 | 52.91 | no baseline | no baseline | 0.18 | 0.18 | 165 / 7,101 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 21 | 13.31 | 31.45 | 31.45 | 44.78 | no baseline | no baseline | 0.59 | 0.74 | 430 / 22,681 / 0 | — | 0.0045 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 204 | 7.67 | 11.76 | 14.56 | 36.13 | no baseline | no baseline | -0.06 | -0.20 | 152 / 7,509 / 0 | — | 0.0048 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.63 | 0.63 | 0.63 | 0.63 | no baseline | no baseline | 0.41 | 0.64 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 14 | 22.06 | 51.35 | 51.35 | 67.27 | no baseline | no baseline | -0.26 | -0.33 | 344 / 17,931 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 69 | 21.03 | 30.96 | 32.65 | 159.88 | no baseline | no baseline | 0.48 | 0.64 | 254 / 19,410 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 1 | 3.91 | 3.91 | 3.91 | 3.91 | no baseline | no baseline | -0.12 | -0.12 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 28 | 3.78 | 5.77 | 5.79 | 6.83 | no baseline | no baseline | 0.09 | 0.11 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 3 | 10.52 | 10.52 | 10.52 | 12.05 | no baseline | no baseline | -0.31 | -0.26 | 149 / 5,226 / 0 | — | 10.518 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 18 | 9.62 | 13.40 | 13.40 | 18.89 | no baseline | no baseline | -0.06 | -0.09 | 127 / 5,076 / 0 | — | 9.624 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 185.70 | 185.70 | 185.70 | 185.70 | no baseline | no baseline | -0.76 | -0.64 | 11,803 / 383,439 / 0 | — | 185.696 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 1 | 10.84 | 10.84 | 10.84 | 10.84 | no baseline | no baseline | -2.09 | -2.15 | 172 / 9,236 / 0 | — | 3.6143 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 5 | 10.06 | 11.57 | 11.57 | 28.42 | no baseline | no baseline | -0.08 | 0.02 | 138 / 5,786 / 0 | — | 5.0295 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 898.27 | 898.27 | 898.27 | 898.27 | no baseline | no baseline | 0.24 | 0.21 | 12,887 / 844,004 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 79.70 | 634.52 | 634.52 | 13441.04 | no baseline | no baseline | 0.95 | 1.08 | 999 / 60,412 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 4.96 | 4.96 | 4.96 | 4.96 | no baseline | no baseline | -3.10 | -3.47 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 142 | 389.69 | 608.41 | 2199.99 | 2383.64 | no baseline | no baseline | -0.88 | -2.95 | — | 2703.70 | — | — |
| sandbox.exec | 0 files · uncontended | 120 | 36.25 | 490.30 | 582.27 | 6880.39 | no baseline | no baseline | 0.08 | 0.04 | — | 2,749 | — | — |
| sandbox.exec | 1 files · contended | 19 | 41.67 | 57.41 | 57.41 | 63.22 | no baseline | no baseline | -0.22 | -0.40 | — | 6.30 | 41.668 ms per file | — |
| sandbox.exec | 1 files · uncontended | 56 | 36.71 | 60.86 | 69.25 | 75.78 | no baseline | no baseline | -0.05 | -0.05 | — | 5.30 | 36.714 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 65.20 | 65.20 | 65.20 | 69.91 | no baseline | no baseline | 0.60 | 0.74 | — | 93 | 3.4956 ms per file | — |
| sandbox.exec | 2–4 files · contended | 15 | 49.14 | 61.56 | 61.56 | 108.26 | no baseline | no baseline | 0.70 | 0.71 | — | 11.30 | 20.1335 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 25 | 35.11 | 67.80 | 74.15 | 85.25 | no baseline | no baseline | 0.16 | -0.11 | — | 8 | 16.496 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 6 | 68.56 | 74.03 | 74.03 | 82.50 | no baseline | no baseline | 0.98 | 1.07 | — | 33 | 9.0422 ms per file | — |
| sandbox.exec | — · contended | 11 | 2813.46 | 24802.33 | 24802.33 | 25458.59 | no baseline | no baseline | -0.94 | -1.06 | — | 33615.80 | — | — |
| sandbox.exec | — · uncontended | 28 | 283.60 | 18643.46 | 23994.86 | 37590.77 | no baseline | no baseline | 1.62 | 1.68 | — | 31107.70 | — | — |
| sandbox.mount | — · contended | 43 | 11.55 | 19.89 | 69.67 | 117.44 | no baseline | no baseline | -0.08 | -0.05 | 62 / 1,668 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 107 | 10.46 | 14.65 | 17.57 | 80.04 | no baseline | no baseline | 0.02 | -0.02 | 45 / 1,362 / 82 | — | — | sandbox.mount.attach |
| sandbox.status | — · uncontended | 4 | 4.07 | 8.52 | 8.52 | 179.75 | no baseline | no baseline | 0.66 | 1.06 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 20 | 13.04 | 18.11 | 18.11 | 18.13 | no baseline | no baseline | -0.06 | -0.12 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 130 | 12.04 | 22.52 | 126.86 | 152.86 | no baseline | no baseline | 0.30 | 0.27 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 7 | 0.0 KiB | 373.8 KiB | 1,657 | ok 7 |
| branch.diff_commits | branch | 306 | 0.0 KiB | 16.7 MiB | 57,583 | ok 306 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.4 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 29 | 928.3 KiB | 0.0 KiB | 40 | Committed 29 |
| fs.diff_files | fs | 26 | 0.0 KiB | 273.7 KiB | 21 | Text 21, NoSuchPath 5 |
| fs.glob | fs | 29 | 0.0 KiB | 32.6 KiB | 381 | ok 29 |
| fs.grep | fs | 27 | 0.0 KiB | 83.7 KiB | 441 | ok 27 |
| fs.list | fs | 30 | 0.0 KiB | 109.5 KiB | 639 | ok 30 |
| fs.read | fs | 25 | 0.0 KiB | 68.4 KiB | 25 | ok 25 |
| fs.rm | fs | 55 | 0.0 KiB | 0.0 KiB | 55 | Committed 55 |
| fs.stat | fs | 30 | 0.0 KiB | 6.5 KiB | 30 | ok 30 |
| fs.write | fs | 460 | 5.8 MiB | 0.0 KiB | 460 | Committed 460 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 156 | 0.0 KiB | 0.0 KiB | 0 | Committed 125, UpToDate 30, Conflict 1 |
| sandbox.exec | sandbox | 434 | 1.6 MiB | 5.1 MiB | 0 | exit:0 430, exit:1 2, exit:2 2 |
| sandbox.mount | sandbox | 160 | 0.0 KiB | 0.0 KiB | 0 | Mounted 160 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 160 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 160 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 3.73 · end 3.48.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.063 | 11.936 · 1.145 · 0.907 · 0.878 · 1.063 | 3.67–3.67 | statements 23, vm_steps 820, fullscan_steps 0, sorts 0, returned_rows 68 |
| read | 0.913 | 1.133 · 1.062 · 0.91 · 0.913 · 0.817 | 3.67–3.67 | statements 14, vm_steps 622, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_small | 0.961 | 0.961 · 1.05 · 1.049 · 0.89 · 0.797 | 3.67–3.67 | statements 14, vm_steps 631, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_largest | 2.844 | 3.781 · 2.823 · 2.901 · 2.723 · 2.844 | 3.67–3.67 | statements 61, vm_steps 7259, fullscan_steps 0, sorts 0, returned_rows 726 |
| grep_scoped | 1.073 | 1.22 · 1.073 · 1.002 · 1.011 · 1.42 | 3.67–3.67 | statements 19, vm_steps 777, fullscan_steps 0, sorts 0, returned_rows 68 |
| glob_scoped | 0.878 | 1.061 · 0.853 · 0.865 · 0.878 · 0.897 | 3.67–3.67 | statements 13, vm_steps 610, fullscan_steps 0, sorts 0, returned_rows 58 |
| grep_tree | 3965.794 | 4285.682 · 3965.794 · 4015.671 · 3938.47 · 3903.492 | 3.19–3.53 | statements 42194, vm_steps 3319745, fullscan_steps 0, sorts 0, returned_rows 335046 |
| glob_tree | 5.951 | 6.84 · 5.368 · 5.951 · 6.068 · 5.802 | 3.19–3.19 | statements 110, vm_steps 14299, fullscan_steps 0, sorts 0, returned_rows 1424 |
| diff_files | 4.565 | 4.732 · 4.565 · 4.464 · 5.088 · 4.091 | 3.19–3.19 | statements 60, vm_steps 3544, fullscan_steps 0, sorts 0, returned_rows 348 |
| list_commits | 1.223 | 8.118 · 1.223 · 0.845 · 2.814 · 0.847 | 3.19–3.19 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.886 | 4.583 · 2.895 · 2.886 · 2.815 · 2.815 | 3.66–3.66 | statements 59, vm_steps 2018, fullscan_steps 0, sorts 0, returned_rows 224 |
| fork | 1.019 | 0.644 · 1.155 · 1.052 · 0.643 · 1.019 | 3.66–3.66 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 28.675 | 27.622 · 28.675 · 26.132 · 30.996 · 29.211 | 3.66–3.66 | statements 437, vm_steps 20791, fullscan_steps 0, sorts 0, returned_rows 1528 |
| oneshot_mount_unmount | 20.015 | 20.357 · 16.353 · 20.015 · 15.765 · 114.371 | 3.66–3.66 | statements 57, vm_steps 2040, fullscan_steps 82, sorts 2, returned_rows 204 |
| oneshot_commit | 82.13 | 79.428 · 123.834 · 82.882 · 82.13 · 60.905 | 3.66–3.66 | statements 159, vm_steps 11391, fullscan_steps 82, sorts 2, returned_rows 845 |
| oneshot_exec | — |  ·  ·  ·  ·  | 3.66–3.66 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r027: 176,148 pages of 4,096 B, 0 free · Commits 30,979 · Branches 574 · Layers 33 · compression 3.50× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 102,244 | 619.5 MiB |
| 2 | 43,856 | 608.6 MiB |
| 3 | 13,537 | 2.9 MiB |
| 4 | 37 | 7.6 KiB |
| 5 | 13,447 | 1.4 MiB |
| 6 | 68,169 | 341.2 MiB |
| 7 | 157,666 | 36.8 MiB |
| 8 | 295 | 87.4 KiB |
| 9 | 58,529 | 111.4 MiB |
| 10 | 33,380 | 4.1 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,986 | 160.7 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 31,590 | 57.1 MiB |
| 1 | 39,611 | 436.8 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 132,429 | 517.3 MiB | 19.2 MiB |
| inode_value | 24,465 | 95.6 MiB | 2.0 MiB |
| object_location | 6,876 | 26.9 MiB | 2.9 MiB |
| binding_hint | 6,701 | 26.2 MiB | 2.4 MiB |
| commit | 2,472 | 9.7 MiB | 1.6 MiB |
| file_digest | 946 | 3.7 MiB | 427.4 KiB |
| commit_lineage | 673 | 2.6 MiB | 332.0 KiB |
| commit_runs | 654 | 2.6 MiB | 350.1 KiB |
| commit_identity | 475 | 1.9 MiB | 200.3 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 24 | 96.0 KiB | 12.3 KiB |
| branch_names | 10 | 40.0 KiB | 9.5 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| branch_identity | 8 | 32.0 KiB | 9.5 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 4 | 16.0 KiB | 6.4 KiB |
| layer | 3 | 12.0 KiB | 6.2 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 271.6 s** (tooling): play 105.4 · consolidate 104.3 · verify 21.4 · probes 21.3 · tests 0.0 · seal + snapshot 7.4 · report 11.8

271.63 s tooling: prepare 1.72 · play 103.68 · consolidate 104.34 · verify 10.72 (diff_commits + full compareTree) · version walk 10.63 · probes 21.29 · metrics 0.76 · seal 1.36 · sealed figures 3.01 · snapshot copy 3.07 · report 0.50

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T21:07:58.831Z | stop | Speed: not judged: baseline not set (pilot); Scaling: not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: glob_tree.vm_steps per tree file: depth exponent 0.451; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (15 classes too narrow); Directory share: 0.563; Snapshot time: 3001 ms for 601.1 MiB new; size exponent 0.157; Node proofs: 14 pass · 1 stop · 1 NOT_RUN over 4 points: r027-3-docs-rfc end P5 |

### G. Evidence

- `~/lfs-history/metrics/range-027.a1.json`
- trace `~/lfs-history/runs/p3-main-r/trace/range-027.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-r/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-027.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r027-3-docs-rfc | 362 | 280.5 KiB |
| r027-2-packages-support | 398 | 278.5 KiB |
| r027-1-root | 120 | 275.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 273.0 | 2,275 |
| `git diff --stat` | 26.0 | 2,271 |
| `git add -f` | 24.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 32.0 | 2,273 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r027-1-root | end | P1 | pass | — | — |
| r027-1-root | end | P2 | pass | exit 0 | — |
| r027-1-root | end | P3 | n/a | an install, not a refresh | — |
| r027-1-root | end | P4 | pass | 906 emitted files, exit 1 | — |
| r027-1-root | end | P5 | NOT_RUN | no vitest results on one side | — |
| r027-1-root | end | P6 | n/a | not a repair | — |
| r027-2-packages-support | end | P1 | pass | — | — |
| r027-2-packages-support | end | P2 | pass | exit 0 | — |
| r027-2-packages-support | end | P3 | pass | 201 bookkeeping path(s) | — |
| r027-2-packages-support | end | P4 | pass | 201 emitted files, exit 2 | — |
| r027-2-packages-support | end | P5 | n/a | no calibrated file | — |
| r027-2-packages-support | end | P6 | n/a | not a repair | — |
| r027-3-docs-rfc | end | P1 | pass | — | — |
| r027-3-docs-rfc | end | P2 | pass | exit 0 | — |
| r027-3-docs-rfc | end | P3 | pass | 201 bookkeeping path(s) | — |
| r027-3-docs-rfc | end | P4 | pass | 85 emitted files, exit 2 | — |
| r027-3-docs-rfc | end | P5 | stop | 1 pass natively, fail on LayerFS: packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts | — |
| r027-3-docs-rfc | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1175 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
