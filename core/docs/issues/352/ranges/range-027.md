# Range 027 · **watch** · attempt 2

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r026 (live Store)
dsh `ed784cfdc`..`86f115a07` · **63 commits** (3 mainline, 60 side) · 2026-07-20 → 2026-07-22
Areas changed: `/` 21% · `packages/ui` 12% · `packages/support` 10% · other 57%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.19×** · **Churn 0.00**
**Time split:** play 94.1 s · git 61.9 s · Node 156.8 s · verify 11.1 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **651.1 MiB** (+5.2 MiB) | **688.0 MiB** (+18.1 MiB) | **1.06×** (prev 1.04×) | **22.7 MiB** | **654** (total 30,629) | **243.2 s** tooling (total 68.6 min) |

**Checks:** 14 pass · 5 watch: Speed not judged: baseline not set (pilot); Scaling not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters glob_tree.vm_steps per tree file: depth exponent 0.468; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (16 classes too narrow); Directory share 0.563
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ stored added −48% · ▼ probe list_commits −45% · ▼ fs.list p95 −44%
**Budget:** 28 of 202 ranges · projected total 16.5 h (budget 16.8 h) · disk 43% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **2,282 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,364 / 1,364 outcomes as planned |
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
| r027-1-root | end | `6f0b325973d1` | `1cd0e67c51cf` | pass (323 normalized) | pass | n/a | pass | pass | n/a |
| r027-2-packages-support | end | `61e56b5ce6be` | `54bac3c9202e` | pass (315 normalized) | pass | pass | pass | n/a | n/a |
| r027-3-docs-rfc | end | `87e6f1a9b394` | `54bac3c9202e` | pass (315 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `518ce623cdc1` | `null` | n/a | pass | n/a | n/a | pass | pass (113,480 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/skill/skill-local/tests/skill-local.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/tools.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively).

## 2. Activity

**1,969 calls** · **121 steps** by **8 agents + lead** on **3 Branches + main** · **160 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +74 added · 437 modified · −55 deleted · 6.6 MiB written · fs 531 : Sandbox 35 (**15 : 1**, reported only in P3)
**Execs:** 423 (JS 42 · shell 381) · 4 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 711 | 544 | 167 | Committed 544 · Text 21 · NoSuchPath 5 |
| sandbox | 903 | 579 | 4 | commit 156 (Committed 125, UpToDate 30, Conflict 1) · exec 423 (exit:0 419, exit:1 2, exit:2 2) · mount 160 (Mounted 160) · status 4 · unmount 160 (Unmounted 160) |
| branch | 345 | 32 | 313 | diff_branches 7 · diff_commits 306 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,969** | **1,155** | **494** |  |

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


**Execs by tool:** git 89 · pnpm 1 · tsc 3 · vitest 4 · other 326

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r027-3-docs-rfc | 37 | 37 | 37 | 1 | 37 | 362 |
| r027-2-packages-support | 42 | 42 | 42 | 0 | 42 | 398 |
| r027-1-root | 3 | 3 | 3 | 1 | 3 | 120 |
| **lead** | — | — | — | — | 95 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r027-1-root | 1 | 0 | 1 | 1 | 204 | 204 / 204 |
| r027-2-packages-support | 0 | 1 | 1 | 0 | 0 | — / — |
| r027-3-docs-rfc | 0 | 1 | 1 | 1 | 13 | 13 / 13 |
| **lead repair** | 1 | — | 1 | — | — | 113,480 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r026) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 645.8 MiB (15.3 MiB / 560.8 MiB / 13.5 MiB / 56.2 MiB) | 651.1 MiB (15.4 MiB / 564.9 MiB / 13.6 MiB / 57.1 MiB) | +5.2 MiB |
| Version figures from | — | full: first (no manifest for range 26) | — |
| Files / directories / symlinks | 47,827 / 8,016 / 3,440 | 47,950 / 8,040 / 3,445 | +123 / +24 / +5 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 669.9 MiB | 688.0 MiB | +18.1 MiB |
| **Space amplification** (total · tracked) | 1.04× · tracked 5.30× | 1.06× · tracked 5.07× | 0.02 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **11.95** (0.69 / 0.15 / 2.13) | 5.11× the median range |
| **Stored per Commit** | 17.8 KiB | 54.3 KiB | — |
| Metadata share | 0.36 | 0.37 | this range 0.56 |
| History: Commits / Layers / Branches | 29,975 | 30,629 / 15 / 199 | +654 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 12.42 GiB (Commits 10.73 GiB · installs 938.0 MiB · build 111.7 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 44.36 GiB / 43% | — |
| Snapshot | — | r027, 593.0 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 436.7 MiB | 0.67 | +8.0 MiB |
| Metadata | 57.1 MiB | 0.09 | +2.2 MiB |
| Index rows | 159.4 MiB | 0.24 | — |
| Waste | 33.9 MiB | 0.05 | — |
| Other | 860.0 KiB | 0.00 | — |
| **Total = Store on disk** | **688.0 MiB** | **= 1.06** space amplification | +18.1 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 15.4 MiB | 78.3 MiB (45.6 MiB + 32.7 MiB) | 5.07× | — | 913.0 KiB | 1.9 MiB | 0.47 |
| `node_modules` | 564.9 MiB | 175.8 MiB (165.1 MiB + 10.7 MiB) | 0.31× | — | 1.9 MiB | 4.2 MiB | 0.47 |
| Build output | 13.6 MiB | 9.3 MiB (8.8 MiB + 505.3 KiB) | 0.68× | — | 601.3 KiB | 5.6 MiB | 0.10 |
| `.git` | 57.1 MiB | 203.2 MiB (196.0 MiB + 7.2 MiB) | 3.56× | — | 6.4 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 194.2 MiB | — (not divided) | — | 24.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 27.2 MiB | — | — | — | — | — |
| **Total** | — | **688.0 MiB** | **= 1.06×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 102,238 | +1,866 | 6.2 KiB | 41 (derived) | 55% |
| Chunks (large files) | 43,899 | +577 | 14.2 KiB | — | 4% |
| Large-file extents | 13,574 | — | 0.2 KiB | — | — |
| Directories | 157,930 | 3,014 (with inodes, pooled) | 0.2 KiB | — | 42% |
| Inodes and attributes | 186,229 | ↑ pooled | 2.5 KiB | — | — |
| Symlinks | 1,986 | +3,628 | 0.1 KiB | — | — |

Delta: 2.3% at depth cap · 18% of refused bases stopped by budget · `node_modules` reinstall: 0.171× the raw bytes of 16 changed packages (ratio: 728595 new stored for 4266906 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.07× (78.3 MiB for 15.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.6 KiB / 1.9 KiB / 5.1 KiB over 177 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.19× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.5 MiB stored for 1.69 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.35 (3 lanes × 651.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.7 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.7 ms / 24.5 ms | 2.6 ms / 5.1 ms | 2.7 ms / 3.7 ms | 18.0 ms / 70.8 ms | 10.2 ms / 17.6 ms | 393 ms / 393 ms | — (native comparison in P3; exec 38.4 ms / 815 ms) |
| SQL p50: 157 stmts | 53 stmts | 49 stmts | 197 stmts | 55 stmts | 7,470 stmts | — |

**Commit cost:** 14.36 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 539 ms p50 over 160
**Slowest:** sandbox.exec 31732 ms · sandbox.exec 23147 ms · sandbox.exec 20385 ms · checkpoint diff_commits 0.11 ms and 1.48 statements per entry (56,900 entries per page)
**Scaling:** 5 of 15 probes flat · `stat` 0.33 · `read` 0.57 · `list_small` 0.67 · `list_largest` 1.75 · `grep_tree` 0.34 · `glob_tree` 0.40 · `diff_files` 0.74 · `diff_commits` 0.47 · `oneshot_mount_unmount` 0.69 · `oneshot_commit` 0.36

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 224 ms / 224 ms | — / — | — | git / status-cold: — |
| git status (steady) | 260 ms / 374 ms | — / — | — | git / status-steady: — |
| git add | 21.0 ms / 40.0 ms | — / — | — | git / add: — |
| git commit (lane) | 29.0 ms / 42.0 ms | — / — | — | git / commit: — |
| lead writes main | 2198 ms / 2198 ms | — / — | — | — |
| repack | 1530 ms / 1530 ms | — / — | — | — |
| pnpm install (incremental) | 4642 ms / 4642 ms | 1822 ms / 1822 ms | 2.55× | pnpm-reinstall / cold: — |
| pnpm refresh | 2022 ms / 2022 ms | 1343 ms / 1343 ms | 1.51× | pnpm-reinstall / steady: — |
| tsc -b | 1732 ms / 1732 ms | 3173 ms / 4521 ms | 0.55× | tsc-b / cold: — |
| vitest | 7436 ms / 7436 ms | 6594 ms / 6594 ms | 1.13× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.3 ms / 21.8 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4194304 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3024112 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 5.82 at the first command → 9.01 after the last (max 9.01 over 6 commands) · Docker VM 1 → 2.05

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-027.a2)

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

- **a1 (`p3-main-r`, live after r26 a1, daemon `45a196ef`, addon `4668012e`; binaries from main 3ef00d32e5, owner 2026-10-20): STOP.** Checkpoint ok, git ✓, repair P6 pass. Node: 14 pass, 1 stop, 1 NOT_RUN over 4 points. Both causes were in the harness ([fix 052](../fixes/052-r027-a1-vitest-report-and-home.md)):
  - `r027-1-root.end` P5 NOT_RUN: the 204-file vitest report passed the Sandbox exec's stdout cap (about 1 MiB) and arrived cut. Whether that cap is an artificial transport limit is an open owner question; it is unchanged.
  - `r027-3-docs-rfc.end` P5 stop: `fs-sandbox.spec.ts` puts its folders under `homedir()`. The SDK's exec sets `HOME=/tmp`, which `workspace-write` grants; the native replay had `HOME=/root`. LayerFS correctly allowed the "outside" write.
- **a2 (`p3-main-s`, fork of `p3-main-r`'s r25 snapshot, r26 replayed in `fast` mode as setup; same binaries; harness with fix 052, rebased on main 9d45b7c8f0, units not used): WATCH, terminal.** Checkpoint ok, git ✓. Node: 16 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,175 emitted). Control `control-027.a2` passes.
  - Watch rows: Speed not judged (baseline not set, accepted); Counters `glob_tree.vm_steps` per tree file, depth exponent 0.468; Directory share 0.563.
  - `r027-1-root.end` now parses all 204 results. At `r027-3-docs-rfc.end`, `fs-sandbox.spec.ts` fails natively too under `HOME=/tmp`, so it is left out of the calibrated set.
  - The fork had no r26 snapshot: a re-judge on retained state was not allowed, because point 1's results were lost. Its native chain took r25's native state (`state-5a771e86`), after checking it equals the fork's chain.
  - Final steps: repair 93 s (160 s alarm), verify 15 s, finish 41 s. Repair build 15.8 s, install 31.8 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1364/1364; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.468 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (16 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.563 | < 0.5 | watch |
| Reinstall growth | 0.171× the raw bytes of 16 changed packages (ratio: 728595 new stored for 4266906 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0227 (budget 0.1805) | < 0.1 | pass |
| Range growth | 22.7 MiB, 0.52× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 2129 ms for 593.0 MiB new; size exponent -0.477 | < 0.15 | pass |
| Disk projection | 0.43 | < 0.8 | pass |
| Wall projection | 0.98 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 95 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
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

Binary: daemon `45a196ef16c6` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 7 | 48.69 | 269.17 | 269.17 | 497.61 | no baseline | no baseline | 1.01 | 1.47 | 632 / 63,088 / 0 | — | 0.2244 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 301 | 21.96 | 35.71 | 65.08 | 346.82 | no baseline | no baseline | 0.28 | 0.42 | 301 / 32,924 / 0 | — | 0.1163 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.83 | 1.39 | 1.39 | 1.62 | no baseline | no baseline | 1.66 | 2.79 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.88 | 0.88 | 0.88 | 0.98 | no baseline | no baseline | -0.91 | -1.45 | 70 / 1,298 / 0 | — | 0.0442 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 2 | 392.93 | 392.93 | 392.93 | 502.09 | no baseline | no baseline | — | — | 7,470 / 655,226 / 0 | — | 6.5489 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.16 | 1.16 | 1.16 | 1.16 | no baseline | no baseline | -6.20 | -6.10 | 35 / 517 / 0 | — | 0.0091 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 8.06 | 8.06 | 8.06 | 8.06 | no baseline | no baseline | -1.72 | -1.81 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 29.05 | 29.05 | 29.05 | 29.05 | no baseline | no baseline | 0.33 | -0.08 | 167 / 10,949 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 4 | 18.57 | 38.33 | 38.33 | 75.30 | no baseline | no baseline | -0.63 | -1.00 | 489 / 85,545 / 8,191 | — | 0.0415 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 1 | 9.60 | 9.60 | 9.60 | 9.60 | no baseline | no baseline | 0.23 | 0.18 | 165 / 9,262 / 0 | — | 0.0146 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 5 | 15.93 | 32.30 | 32.30 | 86.40 | no baseline | no baseline | -7.89 | -9.64 | 373 / 24,237 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 13.16 | 13.16 | 13.16 | 13.16 | no baseline | no baseline | 1.06 | 1.22 | 142 / 5,603 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 2 | 19.20 | 19.20 | 19.20 | 40.30 | no baseline | no baseline | -1.78 | -2.29 | 427 / 29,591 / 0 | — | 0.005 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 3 | 10.58 | 10.58 | 10.58 | 11.94 | no baseline | no baseline | 1.11 | 1.29 | 155 / 6,685 / 0 | — | 0.0091 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 4.79 | 4.79 | 4.79 | 6.64 | no baseline | no baseline | -2.35 | -2.71 | 111 / 5,660 / 0 | — | 0.0242 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 5 | 7.70 | 8.21 | 8.21 | 11.85 | no baseline | no baseline | -0.32 | -0.31 | 186 / 7,295 / 0 | — | 0.0318 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 2 | 8.60 | 8.60 | 8.60 | 10.59 | no baseline | no baseline | 1.24 | 1.49 | 205 / 10,541 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 6 | 9.58 | 11.03 | 11.03 | 12.04 | no baseline | no baseline | 1.27 | 2.11 | 202 / 11,133 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 11.66 | 11.66 | 11.66 | 11.66 | no baseline | no baseline | 0.91 | 1.24 | 340 / 16,194 / 0 | — | 0.0017 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 7.62 | 8.12 | 8.12 | 10.31 | no baseline | no baseline | 0.71 | 0.42 | 168 / 9,366 / 0 | — | 0.0013 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 1.83 | 1.83 | 1.83 | 1.83 | no baseline | no baseline | — | — | 34 / 2,393 / 0 | — | 1.828 ms per file | — |
| fs.glob | 1 files · uncontended | 1 | 2.82 | 2.82 | 2.82 | 2.82 | no baseline | no baseline | 1.72 | 1.98 | 65 / 3,827 / 0 | — | 2.817 ms per file | — |
| fs.glob | 17–64 files · uncontended | 4 | 4.18 | 5.25 | 5.25 | 6.44 | no baseline | no baseline | 1.05 | 1.26 | 71 / 7,402 / 0 | — | 0.1099 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.27 | 2.27 | 2.27 | 2.52 | no baseline | no baseline | 0.14 | -0.09 | 46 / 2,747 / 0 | — | 0.756 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 2.02 | 2.02 | 2.02 | 2.46 | no baseline | no baseline | -0.15 | -0.26 | 36 / 2,873 / 0 | — | 0.6733 ms per file | — |
| fs.glob | 5–16 files · contended | 2 | 2.40 | 2.40 | 2.40 | 4.41 | no baseline | no baseline | -0.06 | -0.00 | 49 / 4,267 / 0 | — | 0.2753 ms per file | — |
| fs.glob | 5–16 files · uncontended | 5 | 3.59 | 4.16 | 4.16 | 13.03 | no baseline | no baseline | 1.49 | 1.93 | 60 / 5,183 / 0 | — | 0.504 ms per file | — |
| fs.glob | >64 files · uncontended | 1 | 3.55 | 3.55 | 3.55 | 3.55 | no baseline | no baseline | -1.53 | -1.95 | 53 / 6,405 / 0 | — | 0.05 ms per file | — |
| fs.grep | 1 files · contended | 1 | 2.13 | 2.13 | 2.13 | 2.13 | no baseline | no baseline | — | — | 47 / 3,194 / 0 | — | 2.132 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 13.57 | 13.71 | 13.71 | 18.59 | no baseline | no baseline | 1.75 | 2.27 | 266 / 15,340 / 0 | — | 0.3442 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 2.56 | 2.56 | 2.56 | 2.86 | no baseline | no baseline | -0.07 | 0.05 | 55 / 2,908 / 0 | — | 0.952 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 3 | 3.68 | 3.68 | 3.68 | 3.69 | no baseline | no baseline | 0.72 | 0.52 | 57 / 3,736 / 0 | — | 1.23 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 4.14 | 4.14 | 4.14 | 5.30 | no baseline | no baseline | 1.21 | 1.74 | 119 / 6,907 / 0 | — | 0.5919 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 1 | 8.60 | 8.60 | 8.60 | 8.60 | no baseline | no baseline | 2.14 | 2.62 | 191 / 10,495 / 0 | — | 1.433 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 3 | 15.20 | 15.20 | 15.20 | 23.39 | no baseline | no baseline | -1.83 | -2.21 | 250 / 12,834 / 0 | — | 0.1902 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 1.58 | 1.58 | 1.58 | 1.58 | no baseline | no baseline | -0.06 | -0.27 | 35 / 2,176 / 0 | — | 1.58 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 2 | 2.58 | 2.58 | 2.58 | 3.27 | no baseline | no baseline | -1.40 | -1.82 | 46 / 4,525 / 0 | — | 0.0516 ms per entrie | — |
| fs.list | 2–4 entries · contended | 3 | 2.91 | 2.91 | 2.91 | 3.74 | no baseline | no baseline | 1.74 | 2.23 | 64 / 3,901 / 0 | — | 0.936 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 5 | 2.34 | 2.44 | 2.44 | 2.60 | no baseline | no baseline | 0.15 | 0.06 | 48 / 4,053 / 0 | — | 0.651 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 3.12 | 3.12 | 3.12 | 3.12 | no baseline | no baseline | 0.33 | 0.59 | 47 / 4,105 / 0 | — | 0.5197 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 6 | 2.75 | 3.30 | 3.30 | 10.16 | no baseline | no baseline | 0.75 | 0.88 | 62 / 5,269 / 0 | — | 0.4407 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 2.30 | 2.30 | 2.30 | 2.30 | no baseline | no baseline | 0.90 | 0.51 | 47 / 2,639 / 0 | — | 0.0069 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 2 | 2.38 | 2.38 | 2.38 | 2.42 | no baseline | no baseline | -1.35 | -2.04 | 53 / 2,569 / 0 | — | 0.0031 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 3 | 2.88 | 2.88 | 2.88 | 5.12 | no baseline | no baseline | 0.60 | 0.67 | 114 / 5,582 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 14 | 2.71 | 4.84 | 4.84 | 5.56 | no baseline | no baseline | 0.26 | 0.17 | 51 / 3,304 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 10 | 18.48 | 26.03 | 26.03 | 32.89 | no baseline | no baseline | 1.71 | 1.97 | 333 / 24,186 / 0 | — | 18.476 ms per file | commit |
| fs.rm | 1 files · uncontended | 45 | 7.87 | 16.11 | 25.89 | 36.63 | no baseline | no baseline | -0.41 | -0.50 | 136 / 6,451 / 0 | — | 7.869 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 1 | 2.63 | 2.63 | 2.63 | 2.63 | no baseline | no baseline | 2.12 | 2.95 | 74 / 4,184 / 0 | — | 0.0056 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 1 | 2.30 | 2.30 | 2.30 | 2.30 | no baseline | no baseline | 0.52 | 0.56 | 51 / 3,030 / 0 | — | 0.0051 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.06 | 2.06 | 2.06 | 2.69 | no baseline | no baseline | -0.10 | -0.01 | 48 / 2,805 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.25 | 3.40 | 3.40 | 8.96 | no baseline | no baseline | 0.01 | -0.13 | 39 / 3,564 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 8 | 2.39 | 2.75 | 2.75 | 3.10 | no baseline | no baseline | 0.68 | 0.59 | 49 / 3,729 / 0 | — | 0.0003 ms per byte | — |
| fs.write | ≤1 KiB · contended | 9 | 12.97 | 14.43 | 14.43 | 62.93 | no baseline | no baseline | 1.19 | 1.43 | 307 / 20,428 / 0 | — | 0.015 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 73 | 7.75 | 11.81 | 12.05 | 15.66 | no baseline | no baseline | -0.34 | -0.67 | 135 / 6,978 / 0 | — | 0.0095 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 1 | 27.80 | 27.80 | 27.80 | 27.80 | no baseline | no baseline | 0.48 | 0.90 | 767 / 105,886 / 8,191 | — | 0.0004 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 12 | 11.31 | 21.33 | 21.33 | 23.73 | no baseline | no baseline | 0.03 | -0.05 | 158 / 7,488 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 39 | 16.22 | 38.68 | 76.19 | 80.30 | no baseline | no baseline | 1.52 | 1.87 | 326 / 21,390 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 101 | 8.98 | 13.77 | 16.91 | 31.16 | no baseline | no baseline | 0.25 | 0.27 | 168 / 7,186 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 26 | 14.82 | 35.24 | 43.27 | 60.29 | no baseline | no baseline | 0.90 | 1.12 | 315 / 17,318 / 0 | — | 0.0052 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 199 | 8.12 | 11.48 | 15.64 | 36.70 | no baseline | no baseline | 0.10 | 0.00 | 152 / 7,581 / 0 | — | 0.0053 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.08 | 1.08 | 1.08 | 1.08 | no baseline | no baseline | 1.99 | 2.57 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 22 | 24.89 | 30.24 | 30.35 | 32.05 | no baseline | no baseline | 0.09 | 0.10 | 423 / 24,721 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 61 | 21.38 | 40.07 | 70.79 | 131.46 | no baseline | no baseline | 0.53 | 0.70 | 263 / 20,465 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 4 | 3.55 | 4.29 | 4.29 | 11.72 | no baseline | no baseline | -0.39 | -0.46 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 25 | 3.64 | 4.72 | 4.87 | 4.97 | no baseline | no baseline | -0.02 | -0.03 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 6 | 8.77 | 12.06 | 12.06 | 14.24 | no baseline | no baseline | -0.84 | -0.90 | 129 / 5,097 / 0 | — | 8.772 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 15 | 10.59 | 12.61 | 12.61 | 18.71 | no baseline | no baseline | 0.22 | 0.25 | 138 / 5,757 / 0 | — | 10.592 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 212.16 | 212.16 | 212.16 | 212.16 | no baseline | no baseline | -0.38 | -0.17 | 11,594 / 379,048 / 0 | — | 212.165 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 2 | 11.27 | 11.27 | 11.27 | 28.08 | no baseline | no baseline | -1.98 | -2.01 | 168 / 9,203 / 0 | — | 3.7553 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 4 | 8.79 | 10.48 | 10.48 | 13.08 | no baseline | no baseline | -0.47 | -0.45 | 133 / 5,059 / 0 | — | 4.3165 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 924.52 | 924.52 | 924.52 | 924.52 | no baseline | no baseline | 0.32 | 0.31 | 12,944 / 850,896 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 76.75 | 670.14 | 670.14 | 12775.34 | no baseline | no baseline | 0.84 | 0.95 | 972 / 59,863 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 4.21 | 4.21 | 4.21 | 4.21 | no baseline | no baseline | -4.21 | -4.39 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 132 | 410.25 | 644.57 | 2149.75 | 2318.89 | no baseline | no baseline | -0.73 | -2.77 | — | 2,710 | — | — |
| sandbox.exec | 0 files · uncontended | 119 | 31.56 | 463.31 | 497.59 | 4008.17 | no baseline | no baseline | -0.32 | -0.44 | — | 2693.30 | — | — |
| sandbox.exec | 1 files · contended | 25 | 36.64 | 45.50 | 45.89 | 48.43 | no baseline | no baseline | -0.59 | -0.85 | — | 5 | 36.641 ms per file | — |
| sandbox.exec | 1 files · uncontended | 50 | 31.56 | 54.86 | 75.15 | 77.56 | no baseline | no baseline | -0.48 | -0.58 | — | 5.30 | 31.556 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 68.32 | 68.32 | 68.32 | 81.60 | no baseline | no baseline | 0.73 | 0.91 | — | 93 | 4.0188 ms per file | — |
| sandbox.exec | 2–4 files · contended | 13 | 39.31 | 55.50 | 55.50 | 64.73 | no baseline | no baseline | 0.06 | -0.08 | — | 11.30 | 16.251 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 27 | 44.44 | 65.64 | 68.94 | 75.32 | no baseline | no baseline | 0.84 | 0.72 | — | 11.30 | 19.2075 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 6 | 61.94 | 87.98 | 87.98 | 93.10 | no baseline | no baseline | 0.69 | 0.71 | — | 33 | 8.798 ms per file | — |
| sandbox.exec | — · contended | 11 | 2466.90 | 20385.02 | 20385.02 | 23147.44 | no baseline | no baseline | -1.32 | -1.52 | — | 33570.60 | — | — |
| sandbox.exec | — · uncontended | 28 | 196.71 | 15749.39 | 19290.14 | 31731.85 | no baseline | no baseline | 0.57 | 0.40 | — | 31051.30 | — | — |
| sandbox.mount | — · contended | 46 | 11.17 | 14.64 | 18.20 | 19.06 | no baseline | no baseline | -0.18 | -0.17 | 62 / 1,681 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 104 | 10.03 | 17.41 | 20.84 | 22.56 | no baseline | no baseline | -0.10 | -0.17 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.07 | 6.86 | 6.86 | 30.40 | no baseline | no baseline | 0.66 | 1.06 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 41 | 12.20 | 17.05 | 20.43 | 69.07 | no baseline | no baseline | -0.24 | -0.35 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 109 | 11.74 | 26.82 | 169.16 | 207.94 | no baseline | no baseline | 0.23 | 0.18 | 0 / 0 / 0 | — | — | observe.after |

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
| sandbox.exec | sandbox | 423 | 1.2 MiB | 3.5 MiB | 0 | exit:0 419, exit:1 2, exit:2 2 |
| sandbox.mount | sandbox | 160 | 0.0 KiB | 0.0 KiB | 0 | Mounted 160 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 160 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 160 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 1 · end 2.05.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.43 | 13.601 · 1.586 · 1.208 · 1.11 · 1.43 | 2.86–2.86 | statements 22, vm_steps 808, fullscan_steps 0, sorts 0, returned_rows 67 |
| read | 1.479 | 1.38 · 1.185 · 1.551 · 1.479 · 1.551 | 2.86–2.86 | statements 13, vm_steps 610, fullscan_steps 0, sorts 0, returned_rows 58 |
| list_small | 1.412 | 1.633 · 1.761 · 1.412 · 1.405 · 1.048 | 2.86–2.86 | statements 13, vm_steps 619, fullscan_steps 0, sorts 0, returned_rows 58 |
| list_largest | 3.965 | 4.789 · 3.888 · 3.916 · 3.982 · 3.965 | 2.86–2.86 | statements 60, vm_steps 7333, fullscan_steps 0, sorts 0, returned_rows 740 |
| grep_scoped | 1.24 | 2.045 · 1.196 · 1.121 · 1.24 · 1.552 | 2.86–2.86 | statements 18, vm_steps 765, fullscan_steps 0, sorts 0, returned_rows 67 |
| glob_scoped | 1.034 | 1.525 · 0.938 · 0.874 · 1.034 · 1.399 | 2.86–2.86 | statements 12, vm_steps 598, fullscan_steps 0, sorts 0, returned_rows 57 |
| grep_tree | 4225.335 | 4391.7 · 4225.335 · 4142.941 · 4236.678 · 4194.164 | 2.33–2.71 | statements 42258, vm_steps 3319614, fullscan_steps 0, sorts 0, returned_rows 335668 |
| glob_tree | 6.54 | 7.727 · 5.689 · 6.54 · 6.665 · 5.617 | 2.33–2.33 | statements 112, vm_steps 14381, fullscan_steps 0, sorts 0, returned_rows 1436 |
| diff_files | 5.123 | 5.23 · 4.907 · 5.123 · 5.021 · 5.412 | 2.33–2.33 | statements 60, vm_steps 3544, fullscan_steps 0, sorts 0, returned_rows 348 |
| list_commits | 0.791 | 2.108 · 0.791 · 0.641 · 0.644 · 1.112 | 2.33–2.33 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.063 | 3.958 · 3.063 · 2.539 · 2.709 · 3.118 | 2.33–2.33 | statements 56, vm_steps 1973, fullscan_steps 0, sorts 0, returned_rows 221 |
| fork | 0.623 | 0.693 · 0.681 · 0.415 · 0.385 · 0.623 | 2.33–2.33 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 28.221 | 28.221 · 29.388 · 28.548 · 25.508 · 26.402 | 2.33–2.33 | statements 435, vm_steps 20549, fullscan_steps 0, sorts 0, returned_rows 1515 |
| oneshot_mount_unmount | 19.275 | 19.34 · 19.275 · 23.437 · 18.028 · 17.52 | 2.33–2.33 | statements 56, vm_steps 2028, fullscan_steps 82, sorts 2, returned_rows 203 |
| oneshot_commit | 72.53 | 83.973 · 72.53 · 73.41 · 64.572 · 63.11 | 2.33–2.33 | statements 158, vm_steps 11370, fullscan_steps 82, sorts 2, returned_rows 844 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.33–2.33 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r027: 176,137 pages of 4,096 B, 0 free · Commits 30,957 · Branches 552 · Layers 33 · compression 3.50× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 102,238 | 619.5 MiB |
| 2 | 43,899 | 608.6 MiB |
| 3 | 13,537 | 2.9 MiB |
| 4 | 37 | 7.6 KiB |
| 5 | 13,447 | 1.4 MiB |
| 6 | 68,120 | 340.7 MiB |
| 7 | 157,635 | 36.8 MiB |
| 8 | 295 | 87.4 KiB |
| 9 | 58,478 | 111.3 MiB |
| 10 | 33,362 | 4.1 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,986 | 160.7 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 31,580 | 57.1 MiB |
| 1 | 39,605 | 436.7 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 132,429 | 517.3 MiB | 19.3 MiB |
| inode_value | 24,449 | 95.5 MiB | 2.0 MiB |
| object_location | 6,887 | 26.9 MiB | 3.0 MiB |
| binding_hint | 6,703 | 26.2 MiB | 2.4 MiB |
| commit | 2,466 | 9.6 MiB | 1.6 MiB |
| file_digest | 949 | 3.7 MiB | 439.8 KiB |
| commit_lineage | 668 | 2.6 MiB | 313.9 KiB |
| commit_runs | 654 | 2.6 MiB | 351.7 KiB |
| commit_identity | 477 | 1.9 MiB | 209.5 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 23 | 92.0 KiB | 11.5 KiB |
| branch_names | 9 | 36.0 KiB | 6.6 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| branch_identity | 8 | 32.0 KiB | 10.3 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 4 | 16.0 KiB | 6.7 KiB |
| layer | 3 | 12.0 KiB | 6.2 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 243.2 s** (tooling): play 95.7 · consolidate 89.2 · verify 19.8 · probes 22.2 · tests 0.0 · seal + snapshot 5.7 · report 10.6

243.16 s tooling: prepare 1.57 · play 94.11 · consolidate 89.25 · verify 11.09 (diff_commits + full compareTree) · version walk 8.68 · probes 22.21 · metrics 0.82 · seal 1.27 · sealed figures 2.23 · snapshot copy 2.18 · report 0.38

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T21:07:58.831Z | stop | Speed: not judged: baseline not set (pilot); Scaling: not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: glob_tree.vm_steps per tree file: depth exponent 0.451; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (15 classes too narrow); Directory share: 0.563; Snapshot time: 3001 ms for 601.1 MiB new; size exponent 0.157; Node proofs: 14 pass · 1 stop · 1 NOT_RUN over 4 points: r027-3-docs-rfc end P5 |
| 2 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T21:32:57.662Z | watch | Speed: not judged: baseline not set (pilot); Scaling: not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: glob_tree.vm_steps per tree file: depth exponent 0.468; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (16 classes too narrow); Directory share: 0.563 |

### G. Evidence

- `~/lfs-history/metrics/range-027.a1.json`
- `~/lfs-history/metrics/range-027.a2.json`
- trace `~/lfs-history/runs/p3-main-s/trace/range-027.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-s/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-027.p3-main-s.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r027-3-docs-rfc | 362 | 280.5 KiB |
| r027-2-packages-support | 398 | 278.5 KiB |
| r027-1-root | 120 | 275.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 260.0 | 2,275 |
| `git diff --stat` | 26.0 | 2,271 |
| `git add -f` | 21.0 | — |
| `git rm --cached` | 5.0 | — |
| `git commit` | 29.0 | 2,273 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r027-1-root | end | P1 | pass | — | — |
| r027-1-root | end | P2 | pass | exit 0 | — |
| r027-1-root | end | P3 | n/a | an install, not a refresh | — |
| r027-1-root | end | P4 | pass | 906 emitted files, exit 1 | — |
| r027-1-root | end | P5 | pass | 204 files | — |
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
| r027-3-docs-rfc | end | P5 | pass | 13 files | — |
| r027-3-docs-rfc | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1175 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
