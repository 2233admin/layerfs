# Range 020 · **optimize** · attempt 2

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r019 (run p3-main-n)
dsh `61136b22b`..`dde62f454` · **60 commits** (6 mainline, 54 side) · 2026-07-14 → 2026-07-19
Areas changed: `examples/acp-agent` 23% · `packages/core` 21% · `/` 14% · other 42%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.18×** · **Churn 0.00**
**Time split:** play 77.8 s · git 69.8 s · Node 178.5 s · verify 89.8 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **554.1 MiB** (+1.3 MiB) | **374.1 MiB** (+19.5 MiB) | **0.68×** (prev 0.64×) | **21.5 MiB** | **921** (total 19,322) | **311.9 s** tooling (total 37.1 min) |

**Checks:** 13 pass · 5 watch: Speed branch.diff_commits >64 entries · uncontended: 15.73× baseline (no phase); Counters grep_tree.returned_rows per tree byte: depth exponent 0.434; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (15 classes too narrow); Directory share 0.563; Wall projection 1.07 · 1 optimize/stop: Scaling
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ fs.write p95 −64% · ▲ probe glob_scoped +40% · ▲ probe oneshot_commit +33%
**Budget:** 21 of 202 ranges · projected total 17.9 h (budget 16.8 h) · disk 51% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,686 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,657 / 1,657 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 1814 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 292 bin shims, 3181 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (35 lines from 2 .gitignore files) · **167 picks** in 3 merges (167 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `dde62f454`** · 335 commits written for 335 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 167 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r020-2-examples-acp-agent | end | `28b4071d5f25` | `b0a42300c7a6` | pass (295 normalized) | pass | pass | pass | n/a | n/a |
| r020-1-root | end | `3de719f75f2c` | `5c3a7fe0fed9` | pass (297 normalized) | pass | n/a | pass | pass | n/a |
| r020-3-docs-rfc | end | `cf11c9d30c90` | `b0a42300c7a6` | pass (295 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `5305a12a1e99` | `null` | n/a | pass | n/a | n/a | pass | pass (115,565 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/examples/stdio-demo/tests/stdio-agent.spec.ts` (fails natively).

## 2. Activity

**2,276 calls** · **118 steps** by **8 agents + lead** on **3 Branches + main** · **158 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +87 added · 702 modified · −74 deleted · 8.9 MiB written · fs 805 : Sandbox 58 (**14 : 1**, reported only in P3)
**Execs:** 433 (JS 44 · shell 389) · 3 non-zero exits · install 0 · test runs 3 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 998 | 818 | 180 | Committed 816 · Text 23 · Equal 2 · NoSuchPath 2 · UpToDate 2 |
| sandbox | 907 | 587 | 4 | commit 154 (Committed 120, UpToDate 33, Conflict 1) · exec 433 (exit:0 430, exit:1 1, exit:2 2) · mount 158 (Mounted 158) · status 4 · unmount 158 (Unmounted 158) |
| branch | 361 | 32 | 329 | diff_branches 7 · diff_commits 322 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,276** | **1,437** | **523** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r020-1-root | a01 | 7 | 336 | ✓ | — |
| r020-2-examples-acp-agent | a02 a03 a04 | 36 | 150 | ✓ | — |
| r020-3-docs-rfc | a05 a06 a07 a08 | 69 | 190 | ✓ | — |
| main | lead | 6 | 245 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r020-2, a02 after a04 | 0.1 s |
| Stale clean merge | 1 / 1 | r020-2, a02 a03 | merged cleanly |
| Decoy edit | 1 / 1 | r020-2, a02 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r020-1 | 7 | 4 | 3 | 0 | 0 | 336 | — |
| a02 | r020-2 | 17 | 2 | 15 | 0 | 0 | 78 | commit-conflict, stale-clean-merge, decoy |
| a03 | r020-2 | 10 | 2 | 8 | 0 | 0 | 39 | stale-clean-merge |
| a04 | r020-2 | 9 | 5 | 4 | 0 | 0 | 33 | commit-conflict, decoy |
| a05 | r020-3 | 40 | 20 | 20 | 0 | 0 | 95 | — |
| a06 | r020-3 | 7 | 3 | 4 | 0 | 0 | 38 | — |
| a07 | r020-3 | 11 | 6 | 5 | 0 | 0 | 17 | — |
| a08 | r020-3 | 11 | 6 | 5 | 0 | 0 | 40 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 245 | — |
| **Total** |  | **118** | **49** | **64** | **5** | **0** | **921** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 83 · pnpm 1 · tsc 3 · vitest 3 · other 343

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r020-2-examples-acp-agent | 26 | 26 | 26 | 0 | 26 | 365 |
| r020-3-docs-rfc | 44 | 44 | 44 | 3 | 44 | 460 |
| r020-1-root | 6 | 6 | 6 | 3 | 6 | 87 |
| **lead** | — | — | — | — | 335 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r020-2-examples-acp-agent | 0 | 1 | 1 | 0 | 0 | — / — |
| r020-1-root | 1 | 0 | 1 | 1 | 150 | 150 / 150 |
| r020-3-docs-rfc | 0 | 1 | 1 | 1 | 25 | 25 / 25 |
| **lead repair** | 1 | — | 1 | — | — | 115,565 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r019) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 552.8 MiB (11.4 MiB / 509.2 MiB / 10.5 MiB / 21.8 MiB) | 554.1 MiB (11.4 MiB / 509.2 MiB / 10.5 MiB / 23.0 MiB) | +1.3 MiB |
| Version figures from | — | full: first (no manifest for range 19) | — |
| Files / directories / symlinks | 49,730 / 8,423 / 3,185 | 49,745 / 8,423 / 3,187 | +15 / +0 / +2 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 354.7 MiB | 374.1 MiB | +19.5 MiB |
| **Space amplification** (total · tracked) | 0.64× · tracked 3.51× | 0.68× · tracked 3.60× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.72** (0.98 / 0.26 / 1.34) | 3.92× the median range |
| **Stored per Commit** | 26.8 KiB | 21.5 KiB | — |
| Metadata share | 0.35 | 0.37 | this range 0.56 |
| History: Commits / Layers / Branches | 18,401 | 19,322 / 10 / 67 | +921 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.94 GiB (Commits 7.43 GiB · installs 1.03 GiB · build 116.1 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 45.85 GiB / 51% | — |
| Snapshot | — | r020, 333.1 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 237.0 MiB | 0.43 | +7.4 MiB |
| Metadata | 33.7 MiB | 0.06 | +2.0 MiB |
| Index rows | 81.5 MiB | 0.15 | +9.0 MiB |
| Waste | 21.5 MiB | 0.04 | +1.0 MiB |
| Other | 468.0 KiB | 0.00 | +24.0 KiB |
| **Total = Store on disk** | **374.1 MiB** | **= 0.68** space amplification | +19.5 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 11.4 MiB | 41.0 MiB (17.9 MiB + 23.1 MiB) | 3.60× | — | 1.2 MiB | 2.8 MiB | 0.43 |
| `node_modules` | 509.2 MiB | 135.4 MiB (129.7 MiB + 5.7 MiB) | 0.27× | — | 874.2 KiB | 0.0 KiB | 20344.93 |
| Build output | 10.5 MiB | 5.9 MiB (5.7 MiB + 233.0 KiB) | 0.56× | — | 392.4 KiB | 4.7 MiB | 0.08 |
| `.git` | 23.0 MiB | 87.5 MiB (83.7 MiB + 3.8 MiB) | 3.80× | — | 6.9 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 103.4 MiB | — (not divided) | — | 10.1 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 922.4 KiB | — | — | — | — | — |
| **Total** | — | **374.1 MiB** | **= 0.68×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 73,852 | +1,877 | 6.1 KiB | 48,243 (derived) | 60% |
| Chunks (large files) | 31,117 | +417 | 12.3 KiB | — | 2% |
| Large-file extents | 12,420 | — | 0.2 KiB | — | — |
| Directories | 75,199 | 3,107 (with inodes, pooled) | 0.2 KiB | — | 49% |
| Inodes and attributes | 116,136 | ↑ pooled | 2.2 KiB | — | — |
| Symlinks | 1,880 | +3,381 | 0.1 KiB | — | — |

Delta: 2.6% at depth cap · 22% of refused bases stopped by budget · `node_modules` reinstall: absolute: 782574 new stored bytes for 44 raw changed bytes of 2 changed packages (17785.773×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.60× (41.0 MiB for 11.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.5 KiB / 1.5 KiB / 3.0 KiB over 411 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.18× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.2 MiB stored for 1.51 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.23 (3 lanes × 554.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.5 ms / 16.0 ms (1.22×) | 2.4 ms / 4.0 ms (1.35×) | 2.7 ms / 5.2 ms (1.73×) | 16.4 ms / 59.2 ms (0.84×) | 10.4 ms / 17.3 ms (1.09×) | 888 ms / 888 ms (2.56×) | — (native comparison in P3; exec 41.4 ms / 1123 ms) |
| SQL p50: 162 stmts | 47 stmts | 51 stmts | 175 stmts | 45 stmts | 23,524 stmts | — |

**Commit cost:** 14.71 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 523 ms p50 over 158
**Slowest:** sandbox.exec 34023 ms · sandbox.exec 33308 ms · sandbox.exec 29322 ms · checkpoint diff_commits 1.28 ms and 16.02 statements per entry (59,545 entries per page)
**Scaling:** 1 of 15 probes flat · `stat` 1.04 · `read` 1.01 · `list_small` 0.79 · `list_largest` 0.71 · `grep_scoped` 0.93 · `glob_scoped` 0.67 · `grep_tree` 0.95 · `glob_tree` 0.65 · `diff_files` 0.72 · `list_commits` 0.80 · `diff_commits` 0.91 · `fork` 2.14 · `merge` 0.22 · `oneshot_commit` 0.24

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 265 ms / 265 ms | — / — | — | git / status-cold: — |
| git status (steady) | 279 ms / 448 ms | — / — | — | git / status-steady: — |
| git add | 19.0 ms / 71.0 ms | — / — | — | git / add: — |
| git commit (lane) | 28.0 ms / 43.0 ms | — / — | — | git / commit: — |
| lead writes main | 10790 ms / 10790 ms | — / — | — | — |
| repack | 2320 ms / 2320 ms | — / — | — | — |
| pnpm install (incremental) | 2913 ms / 2913 ms | 1217 ms / 1217 ms | 2.39× | pnpm-reinstall / cold: — |
| pnpm refresh | 2541 ms / 2541 ms | 1368 ms / 1368 ms | 1.86× | pnpm-reinstall / steady: — |
| tsc -b | 2821 ms / 2821 ms | 2579 ms / 2935 ms | 1.09× | tsc-b / cold: — |
| vitest | 2915 ms / 2915 ms | 2104 ms / 2104 ms | 1.39× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 9.1 ms / 18.2 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 2954072 → 4194304 B · fs.write ≤8 KiB 2595632 → 4194304 B · fs.write ≤64 KiB 4185952 → 4194304 B · fs.read ≤8 KiB 4132392 → 4194304 B · sandbox.mount 4132392 → 4194304 B · sandbox.commit 1 file (Committed) 4185952 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 8.83 at the first command → 8.86 after the last (max 12.80 over 6 commands) · Docker VM 0.33 → 1.37

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-020.a2)

## 5. Findings and action

### Finding 020.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.418 | < 0.15 |
| Node proofs | 15 pass · 1 stop · 0 NOT_RUN over 4 points: r020-1-root end P1 | P1–P6 pass at every point |

Diagnosis pending: `finding-020.a1.json`.

### Finding 020.a2 · optimize

**1. Trigger** (attempt 2, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.387 | < 0.15 |

Diagnosis pending: `finding-020.a2.json`.

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
- **a1 (`p3-main-n`, from r19 a4's live state, harness `0420a43db7`, daemon `44ac6c91`, addon `77597adb`): STOP at the root lane's P1, caused by a harness change of mine (the closure chain reset in fix 043), not by LayerFS.** Checkpoint ok, git ✓. The repair's P6 passes (721 emitted files, build 11.59 s). The other two points pass. `r020-1-root.end` P1: `examples/node_modules/.bin` and `python/sdk-runtime/node_modules/.bin` differ. LayerFS has the workspace bins `dsh-acp-demo`, `dsh-stdio-demo`, `cordis`, `dsh-jsonrpc-agent`; native lacks some.
  - Cause: before this range I restarted the closure chain at r19's repair (a fresh checkout plus the repair's install and build) to keep calibration under the 115 s alarm. That model is not exact. On a fresh checkout the repair's clean install runs before any `lib/` exists, and pnpm links a workspace bin only when its target exists. In LayerFS the r19 repair install ran while `lib/` was still there, so the bins are linked. The long chain carried that state and passed r15–r19.
  - The reset is reverted. a2 forks `p3-main-n`'s r19 snapshot (`p3-main-o`, long chain, 17 states). Points 1 and 3 are calibrated on the long chain (150 and 25 test files). Point 2 keeps its short-chain calibration: native vitest timed out at 90 s, so no tests. On the long chain its chain plus that timeout cannot fit the 115 s command.
  - Final command 233 s under the 295 s alarm. Control sample `control-020.a1` passes.
- **Killed run (`p3-main-o`, fork of `p3-main-n`'s r19 snapshot, long chain, harness `007157472b`; no attempt number, because it wrote no metrics): KILLED at the declared 295 s alarm of the final command. No metrics were written and nothing was judged; held for the liaison (owner rule: stop and tell; the alarm is not raised).** The lanes played, but the last lanes command took 116 s of its 118 s alarm (a1: 60 s). In the final command the closure finished at +442.6 s: repair install 60.4 s (a1 36.4 s), build 43.1 s (a1 11.6 s; clean plus whole build), test 5.2 s. Consolidation took 285.9 s, then the alarm fired. Host 1-min load: 8.5 at the first command, 14.4 at the final one, 42.1 just after (a1 ran at 9.7–11.3). The busiest process was the Docker VM (305% CPU), with Spotlight (`mds_stores`, 86%) and Chrome also busy. The runner container and the four Sandboxes left behind were stopped and removed; the run is dirty. Cause, as the liaison recorded it: interference from another session (its Docker builds, with the Docker VM at 240–300% and load 42.1), plus Spotlight and Chrome. Recorded fix: that session runs no Docker work while `~/lfs-history/QUIET` exists, and QUIET now spans the whole attempt.
- **a2 (`p3-main-p`, fork of `p3-main-n`'s r19 snapshot, long chain, harness `8879be4cea`, daemon `44ac6c91`, addon `77597adb`): OPTIMIZE, terminal: advanced on optimize: #364 item 4.** This is the liaison's replay after the killed run, one sample, same alarm. `~/lfs-history/QUIET` was held from the first command to the end of the last. Checkpoint ok, git ✓. Node 15 pass, 0 stop, 0 NOT_RUN over 4 points. The repair's P6 passes with 721 emitted files equal to native. The only optimize row is the checkpoint `diff_commits` scaling (#364 item 4).
  - **Owner rule change (2026-10-20): the 5 ms absolute time floor** (`THRESHOLDS.absoluteFloorMs`, `b7d1d8fe8c`) judges this attempt's time rows for the first time. `diff_commits` is far over it (seconds per call), so its rows stand. Earlier ranges' reports keep their rows (F2).
  - **Repair build time against r15** (one sample each): LayerFS 10.45 s (clean plus whole build, 721 emitted) against 7.60 s at r15 a4; native 8.21 s against 5.96 s. Repair install 34.0 s (r15 26.1 s).
  - Final command 228 s, under the 270 s line and the 295 s alarm. Lanes command 59 s. Host 1-min load 9.0–12.8. Control sample `control-020.a2` passes (write ≤1 KiB 1.24×, under the floor).

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1657/1657; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 15.73× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.387 | < 0.15 | optimize |
| Counters | grep_tree.returned_rows per tree byte: depth exponent 0.434 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (15 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.563 | < 0.5 | watch |
| Reinstall growth | absolute: 782574 new stored bytes for 44 raw changed bytes of 2 changed packages (17785.773×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0265 (budget 0.2246) | < 0.1 | pass |
| Range growth | 21.5 MiB, 0.54× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 1380 ms for 333.1 MiB new; size exponent -0.333 | < 0.15 | pass |
| Disk projection | 0.51 | < 0.8 | pass |
| Wall projection | 1.07 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 335 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 167 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.18× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 118 | 119 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 921 | 835 |
| Workspaces (one-shot share) | 158 (0.99) | 63 (0.968) |
| Reads | 133 | 133 |
| Reconcile writes | 238 | 238 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 7 | 38.59 | 230.75 | 230.75 | 243.65 | 2.51× | 4.60× | 1.24 | 1.82 | 549 / 57,366 / 0 | — | 0.1739 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 248.09 | 248.09 | 248.09 | 248.09 | no baseline | no baseline | — | — | 3,185 / 503,604 / 0 | — | 35.4417 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 316 | 273.17 | 298.48 | 314.38 | 430.09 | 15.73× | 11.65× | 5.97 | 11.26 | 3,444 / 534,458 / 0 | — | 1.4257 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.66 | 1.23 | 1.23 | 1.54 | 0.96× | 0.90× | -1.42 | -2.39 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.95 | 0.95 | 0.95 | 1.66 | no baseline | no baseline | 1.20 | 1.93 | 70 / 1,298 / 0 | — | 0.0474 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 1103.28 | 1103.28 | 1103.28 | 1103.28 | 2.56× | 2.56× | — | — | 30,972 / 2,674,669 / 4,816 | — | 20.4311 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 888.05 | 888.05 | 888.05 | 888.05 | 1.75× | 1.75× | -0.99 | -1.19 | 23,524 / 1,899,898 / 3,425 | — | 7.7222 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.43 | 1.43 | 1.43 | 1.43 | 1.79× | 1.79× | — | — | 35 / 517 / 0 | — | 0.0131 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 4.04 | 4.04 | 4.04 | 4.04 | 1.47× | 1.47× | -0.26 | 0.00 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 100.47 | 100.47 | 100.47 | 100.47 | 5.28× | 5.28× | 1.83 | 2.52 | 189 / 18,853 / 0 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 2 | 14.84 | 14.84 | 14.84 | 17.32 | 1.70× | 1.25× | 0.78 | 0.95 | 291 / 26,394 / 0 | — | 0.0601 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 8 | 8.53 | 10.85 | 10.85 | 11.87 | 1.21× | 1.10× | 0.66 | 1.04 | 133 / 7,144 / 0 | — | 0.0045 ms per byte | commit |
| fs.diff_files | ≤1 KiB · uncontended | 8 | 9.37 | 11.40 | 11.40 | 12.72 | 1.73× | 1.54× | 1.62 | 2.59 | 191 / 11,894 / 0 | — | 0.0352 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 3 | 12.13 | 12.13 | 12.13 | 15.67 | 1.97× | 1.71× | 1.86 | 2.92 | 294 / 15,755 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 7 | 9.17 | 9.63 | 9.63 | 10.77 | 1.37× | 1.35× | 1.45 | 2.40 | 202 / 12,057 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 12.84 | 12.84 | 12.84 | 12.84 | 2.42× | 1.86× | 1.28 | 1.83 | 241 / 12,713 / 0 | — | 0.0028 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 3 | 9.32 | 9.32 | 9.32 | 10.74 | 1.75× | 1.53× | 1.34 | 2.15 | 196 / 11,806 / 0 | — | 0.003 ms per byte | sdk.read |
| fs.glob | 17–64 files · uncontended | 5 | 5.05 | 5.40 | 5.40 | 6.15 | 2.61× | 2.06× | -0.08 | 0.22 | 88 / 11,052 / 0 | — | 0.2391 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 2.37 | 2.37 | 2.37 | 2.37 | 1.70× | 1.70× | -0.32 | -0.09 | 38 / 3,191 / 0 | — | 1.1855 ms per file | — |
| fs.glob | 2–4 files · uncontended | 1 | 3.38 | 3.38 | 3.38 | 3.38 | 2.25× | 1.70× | 1.14 | 1.50 | 51 / 5,480 / 0 | — | 1.1267 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 7.69 | 7.69 | 7.69 | 7.69 | 5.94× | 5.43× | 1.66 | 2.66 | 180 / 16,228 / 0 | — | 1.0986 ms per file | — |
| fs.glob | 5–16 files · uncontended | 6 | 3.26 | 3.43 | 3.43 | 4.08 | 1.69× | 1.48× | 0.52 | 0.84 | 62 / 6,194 / 0 | — | 0.4078 ms per file | — |
| fs.glob | >64 files · uncontended | 4 | 6.38 | 6.83 | 6.83 | 17.17 | 1.22× | 0.89× | -0.88 | -1.30 | 110 / 14,942 / 0 | — | 0.0176 ms per file | — |
| fs.grep | 1 files · uncontended | 2 | 1.71 | 1.71 | 1.71 | 3.18 | 1.36× | 1.36× | 0.53 | 1.14 | 30 / 2,560 / 0 | — | 1.714 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 1 | 19.23 | 19.23 | 19.23 | 19.23 | 3.56× | 3.56× | 2.29 | 3.76 | 385 / 24,681 / 0 | — | 0.506 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 2 | 10.74 | 10.74 | 10.74 | 20.94 | 2.98× | 2.48× | 0.31 | 1.04 | 232 / 15,353 / 0 | — | 0.4884 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 3.59 | 3.59 | 3.59 | 4.58 | 1.53× | 1.25× | 0.49 | 0.98 | 56 / 3,742 / 0 | — | 1.5283 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 2 | 2.35 | 2.35 | 2.35 | 3.28 | 1.24× | 0.68× | 0.43 | 0.95 | 39 / 4,401 / 0 | — | 1.0937 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 4 | 4.09 | 4.91 | 4.91 | 7.83 | 1.30× | 1.43× | -0.07 | 0.06 | 80 / 5,222 / 0 | — | 0.5844 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 23.89 | 39.92 | 39.92 | 51.90 | 2.08× | 2.54× | -0.02 | -0.11 | 559 / 32,844 / 0 | — | 0.0876 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 1.90 | 1.90 | 1.90 | 1.90 | 1.13× | 1.13× | -1.66 | -3.15 | 54 / 3,985 / 0 | — | 1.904 ms per entrie | — |
| fs.list | 17–64 entries · contended | 1 | 4.91 | 4.91 | 4.91 | 4.91 | 2.74× | 2.35× | 1.19 | 2.00 | 204 / 18,119 / 0 | — | 0.2045 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 8 | 4.17 | 5.79 | 5.79 | 7.19 | 1.73× | 2.30× | 0.42 | 0.92 | 69 / 8,819 / 0 | — | 0.1737 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 2.30 | 2.39 | 2.39 | 2.42 | 1.28× | 1.01× | 0.44 | 0.50 | 37 / 4,447 / 0 | — | 0.7977 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 2.62 | 2.62 | 2.62 | 2.62 | 1.34× | 1.06× | 0.82 | 1.61 | 51 / 5,574 / 0 | — | 0.3747 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 7 | 2.56 | 2.86 | 2.86 | 2.94 | 1.58× | 1.40× | 0.46 | 0.94 | 48 / 4,981 / 0 | — | 0.3366 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 1 | 2.14 | 2.14 | 2.14 | 2.14 | 1.80× | 1.80× | -1.65 | -4.36 | 35 / 3,781 / 0 | — | 0.0027 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.53 | 2.53 | 2.53 | 4.80 | 1.12× | 1.12× | 0.08 | 0.12 | 42 / 3,588 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 3 | 2.21 | 2.21 | 2.21 | 3.96 | 1.12× | 0.94× | 0.15 | 0.38 | 37 / 3,354 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 17 | 2.43 | 3.52 | 3.52 | 4.32 | 1.35× | 1.23× | 0.64 | 1.21 | 50 / 3,716 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 9 | 10.19 | 14.32 | 14.32 | 66.36 | 1.27× | 1.06× | 0.38 | 0.78 | 215 / 11,430 / 0 | — | 10.193 ms per file | commit |
| fs.rm | 1 files · uncontended | 65 | 8.82 | 12.79 | 14.26 | 28.38 | 1.31× | 1.21× | 0.87 | 1.70 | 152 / 7,826 / 0 | — | 8.821 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 3 | 2.15 | 2.15 | 2.15 | 2.69 | 1.32× | 1.12× | 0.93 | 1.82 | 45 / 4,292 / 0 | — | 0.0028 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.12 | 2.12 | 2.12 | 2.12 | 1.78× | 1.78× | 0.38 | 0.56 | 36 / 3,406 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 11 | 2.41 | 3.21 | 3.21 | 3.61 | 1.37× | 1.56× | 0.30 | 0.42 | 38 / 3,623 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 1 | 3.11 | 3.11 | 3.11 | 3.11 | 2.22× | 1.37× | 0.38 | 0.22 | 63 / 4,882 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 7 | 2.22 | 2.60 | 2.60 | 3.01 | 1.48× | 1.19× | 0.70 | 1.13 | 37 / 3,721 / 0 | — | 0.0007 ms per byte | — |
| fs.write | ≤1 KiB · contended | 47 | 9.59 | 14.39 | 14.95 | 18.20 | 1.31× | 1.06× | 0.08 | 0.63 | 293 / 17,768 / 0 | — | 0.0109 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 147 | 7.09 | 13.21 | 17.48 | 26.75 | 1.21× | 1.46× | 0.36 | 0.86 | 140 / 6,694 / 0 | — | 0.0084 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 3 | 15.98 | 15.98 | 15.98 | 17.28 | 1.44× | 1.08× | 0.95 | 1.53 | 188 / 19,176 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 10 | 9.28 | 11.17 | 11.17 | 24.91 | 1.00× | 1.17× | 0.08 | 0.15 | 135 / 6,532 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 63 | 11.26 | 29.89 | 68.27 | 91.90 | 1.21× | 1.88× | 0.79 | 1.47 | 321 / 18,573 / 0 | — | 0.0007 ms per byte | files.change |
| fs.write | ≤64 KiB · uncontended | 156 | 8.57 | 14.13 | 18.27 | 37.00 | 1.22× | 1.44× | 0.40 | 0.77 | 165 / 7,330 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 70 | 10.40 | 14.45 | 45.46 | 76.93 | 1.22× | 0.88× | 0.86 | 1.57 | 304 / 18,115 / 0 | — | 0.0058 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 225 | 7.68 | 14.21 | 26.36 | 33.02 | 1.22× | 1.38× | 0.44 | 0.88 | 151 / 6,821 / 0 | — | 0.0043 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.62 | 0.62 | 0.62 | 0.62 | 1.06× | 1.06× | -0.34 | -0.52 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 15 | 27.23 | 48.89 | 48.89 | 49.12 | 1.20× | 1.16× | -0.70 | -0.96 | 264 / 21,965 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 62 | 19.16 | 38.80 | 59.17 | 152.50 | 0.84× | 0.99× | -0.69 | -0.81 | 197 / 17,634 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 3 | 4.22 | 4.22 | 4.22 | 5.00 | 1.30× | 1.01× | 0.64 | 1.09 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 28 | 3.37 | 4.84 | 4.91 | 5.03 | 1.01× | 1.04× | 0.02 | 0.13 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 5 | 16.58 | 19.41 | 19.41 | 25.94 | 1.92× | 1.13× | 1.05 | 1.57 | 308 / 23,851 / 0 | — | 16.576 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 16 | 9.37 | 14.18 | 14.18 | 39.45 | 1.23× | 1.36× | 0.30 | 0.57 | 127 / 5,130 / 0 | — | 9.371 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 464.92 | 464.92 | 464.92 | 464.92 | 9.24× | 9.24× | 1.65 | 3.36 | 12,993 / 587,364 / 0 | — | 464.922 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · uncontended | 1 | 4.91 | 4.91 | 4.91 | 4.91 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 4.91 ms per file | observe.after |
| sandbox.commit | 2–4 files · Committed · contended | 1 | 21.36 | 21.36 | 21.36 | 21.36 | 1.39× | 1.02× | 1.45 | 2.17 | 136 / 8,222 / 0 | — | 10.6815 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 4 | 14.55 | 14.97 | 14.97 | 15.00 | 1.47× | 1.34× | 0.07 | 0.08 | 137 / 6,755 / 0 | — | 3.751 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 16.87 | 16.87 | 16.87 | 16.87 | 1.13× | 1.13× | -0.18 | 0.09 | 206 / 17,235 / 0 | — | 1.687 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 28.73 | 28.73 | 28.73 | 28.73 | 2.54× | 2.54× | 0.66 | 0.82 | 544 / 22,534 / 0 | — | 2.3944 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 298.49 | 298.49 | 298.49 | 298.49 | no baseline | no baseline | -0.79 | -1.56 | 2,110 / 292,638 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 72.52 | 489.78 | 489.78 | 14901.49 | 1.05× | 7.10× | 0.79 | 1.40 | 546 / 29,359 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 4.23 | 4.23 | 4.23 | 4.23 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 101 | 51.97 | 752.32 | 1786.22 | 1869.67 | 1.28× | 2.17× | 2.43 | 4.93 | — | 2298.70 | — | — |
| sandbox.exec | 0 files · uncontended | 136 | 38.09 | 563.52 | 597.32 | 4758.91 | 1.40× | 2.19× | 0.18 | 0.20 | — | 2186.70 | — | — |
| sandbox.exec | 1 files · contended | 32 | 37.83 | 57.37 | 59.99 | 61.87 | 1.20× | 0.98× | 0.35 | 0.69 | — | 4.70 | 37.825 ms per file | — |
| sandbox.exec | 1 files · uncontended | 54 | 39.62 | 63.09 | 66.69 | 73.11 | 1.30× | 1.07× | 0.11 | 0.12 | — | 5.30 | 39.616 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 67.34 | 67.34 | 67.34 | 74.97 | 0.98× | 0.97× | -0.06 | -0.04 | — | 97 | 3.3669 ms per file | — |
| sandbox.exec | 2–4 files · contended | 10 | 37.45 | 51.74 | 51.74 | 72.28 | 0.99× | 0.83× | 0.32 | 0.80 | — | 9.70 | 13.6615 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 23 | 52.35 | 69.86 | 69.98 | 75.13 | 1.60× | 1.32× | 1.09 | 1.66 | — | 11.60 | 17.1827 ms per file | — |
| sandbox.exec | 5–16 files · contended | 6 | 37.02 | 52.74 | 52.74 | 54.77 | 0.71× | 0.91× | -0.72 | -0.75 | — | 16 | 3.4131 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 20 | 39.11 | 73.49 | 73.49 | 74.51 | 0.75× | 1.02× | 0.16 | 0.53 | — | 17.50 | 3.6899 ms per file | — |
| sandbox.exec | — · contended | 11 | 2907.72 | 29321.50 | 29321.50 | 33308.10 | no baseline | no baseline | 1.52 | 2.50 | — | 34181.40 | — | — |
| sandbox.exec | — · uncontended | 28 | 294.99 | 10860.15 | 11455.81 | 34022.90 | 0.59× | 2.28× | -0.08 | -0.85 | — | 32540.30 | — | — |
| sandbox.mount | — · contended | 38 | 12.47 | 20.10 | 21.70 | 23.10 | 1.24× | 1.30× | 0.51 | 0.84 | 63 / 1,664 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 110 | 10.00 | 14.79 | 19.95 | 67.81 | 1.09× | 1.07× | 0.21 | 0.42 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.33 | 4.40 | 4.40 | 33.51 | no baseline | no baseline | -0.35 | -0.84 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 20 | 10.47 | 16.48 | 16.48 | 18.20 | 1.26× | 1.34× | 0.62 | 1.23 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 128 | 9.06 | 19.97 | 104.60 | 158.00 | 1.00× | 1.44× | 0.22 | 0.56 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 7 | 0.0 KiB | 372.2 KiB | 1,661 | ok 7 |
| branch.diff_commits | branch | 322 | 0.0 KiB | 17.6 MiB | 60,146 | ok 322 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.8 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 23 | 1.0 MiB | 0.0 KiB | 34 | Committed 23 |
| fs.diff_files | fs | 27 | 0.0 KiB | 254.3 KiB | 25 | Text 23, Equal 2, NoSuchPath 2 |
| fs.glob | fs | 28 | 0.0 KiB | 25.1 KiB | 436 | ok 28 |
| fs.grep | fs | 30 | 0.0 KiB | 97.8 KiB | 468 | ok 30 |
| fs.list | fs | 34 | 0.0 KiB | 71.6 KiB | 615 | ok 34 |
| fs.read | fs | 30 | 0.0 KiB | 123.8 KiB | 30 | ok 30 |
| fs.rm | fs | 74 | 0.0 KiB | 0.0 KiB | 74 | Committed 74 |
| fs.stat | fs | 31 | 0.0 KiB | 6.7 KiB | 31 | ok 31 |
| fs.write | fs | 721 | 7.7 MiB | 0.0 KiB | 721 | Committed 719, UpToDate 2 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 154 | 0.0 KiB | 0.0 KiB | 0 | Committed 120, UpToDate 33, Conflict 1 |
| sandbox.exec | sandbox | 433 | 1.9 MiB | 3.9 MiB | 0 | exit:0 430, exit:1 1, exit:2 2 |
| sandbox.mount | sandbox | 158 | 0.0 KiB | 0.0 KiB | 0 | Mounted 158 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 158 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 158 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 0.33 · end 1.37.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 3.091 | 5.744 · 3.418 · 3.091 · 2.361 · 2.234 | 1.56–1.56 | statements 15, vm_steps 1258, fullscan_steps 0, sorts 0, returned_rows 117 |
| read | 2.175 | 2.668 · 2.175 · 1.756 · 2.154 · 2.349 | 1.56–1.56 | statements 14, vm_steps 1228, fullscan_steps 0, sorts 0, returned_rows 116 |
| list_small | 1.951 | 1.866 · 1.951 · 2.589 · 2.063 · 1.92 | 1.56–1.56 | statements 14, vm_steps 1237, fullscan_steps 0, sorts 0, returned_rows 116 |
| list_largest | 7.942 | 8.433 · 7.657 · 8.831 · 7.942 · 7.106 | 1.56–1.56 | statements 84, vm_steps 14722, fullscan_steps 0, sorts 0, returned_rows 1371 |
| grep_scoped | 2.411 | 2.486 · 2.411 · 2.137 · 1.897 · 2.722 | 1.56–1.56 | statements 19, vm_steps 1383, fullscan_steps 0, sorts 0, returned_rows 125 |
| glob_scoped | 2.622 | 2.622 · 4.072 · 6.82 · 2.472 · 1.553 | 1.56–1.56 | statements 13, vm_steps 1216, fullscan_steps 0, sorts 0, returned_rows 115 |
| grep_tree | 4117.29 | 4245.057 · 3884.212 · 3938.602 · 4205.1 · 4117.29 | 1.48–1.52 | statements 42681, vm_steps 3523291, fullscan_steps 0, sorts 0, returned_rows 367337 |
| glob_tree | 9.823 | 11.12 · 10.086 · 9.823 · 9.247 · 9.517 | 1.48–1.48 | statements 216, vm_steps 23529, fullscan_steps 0, sorts 0, returned_rows 2218 |
| diff_files | 6.969 | 7.113 · 7.248 · 6.611 · 6.969 · 6.709 | 1.48–1.48 | statements 72, vm_steps 7324, fullscan_steps 0, sorts 0, returned_rows 702 |
| list_commits | 1.223 | 1.773 · 1.223 · 1.357 · 1.002 · 0.758 | 1.48–1.48 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.179 | 4.004 · 3.41 · 2.973 · 2.933 · 3.179 | 1.48–1.48 | statements 53, vm_steps 2393, fullscan_steps 0, sorts 0, returned_rows 253 |
| fork | 0.869 | 0.727 · 1.139 · 0.896 · 0.817 · 0.869 | 1.48–1.48 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 31.264 | 34.315 · 31.125 · 31.264 · 32.806 · 29.587 | 1.48–1.48 | statements 459, vm_steps 26610, fullscan_steps 4, sorts 8, returned_rows 1985 |
| oneshot_mount_unmount | 17.507 | 18.951 · 17.275 · 17.507 · 16.607 · 21.354 | 1.48–1.48 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 97.288 | 160.573 · 105.945 · 97.288 · 69.927 · 77.353 | 1.48–1.48 | statements 136, vm_steps 9311, fullscan_steps 80, sorts 2, returned_rows 869 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.48–1.48 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r020: 95,777 pages of 4,096 B, 0 free · Commits 19,518 · Branches 358 · Layers 25 · compression 4.00× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 73,852 | 437.3 MiB |
| 2 | 31,117 | 374.4 MiB |
| 3 | 12,398 | 2.0 MiB |
| 4 | 22 | 4.9 KiB |
| 5 | 12,337 | 1.2 MiB |
| 6 | 37,716 | 194.2 MiB |
| 7 | 75,058 | 16.7 MiB |
| 8 | 141 | 41.6 KiB |
| 9 | 32,019 | 52.9 MiB |
| 10 | 21,242 | 2.6 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,880 | 152.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 19,799 | 33.7 MiB |
| 1 | 30,409 | 237.0 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 73,379 | 286.6 MiB | 13.1 MiB |
| inode_value | 11,989 | 46.8 MiB | 997.7 KiB |
| object_location | 4,210 | 16.4 MiB | 1.8 MiB |
| binding_hint | 3,207 | 12.5 MiB | 1.2 MiB |
| commit | 1,509 | 5.9 MiB | 942.2 KiB |
| commit_lineage | 428 | 1.7 MiB | 226.3 KiB |
| commit_runs | 413 | 1.6 MiB | 225.2 KiB |
| commit_identity | 298 | 1.2 MiB | 121.1 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 16 | 64.0 KiB | 11.9 KiB |
| history_meta | 8 | 32.0 KiB | 2.6 KiB |
| branch_names | 7 | 28.0 KiB | 9.0 KiB |
| sqlite_schema | 6 | 24.0 KiB | 8.0 KiB |
| branch_identity | 5 | 20.0 KiB | 6.0 KiB |
| run_merges | 3 | 12.0 KiB | 6.2 KiB |
| layer | 3 | 12.0 KiB | 7.6 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 311.9 s** (tooling): play 79.4 · consolidate 97.2 · verify 101.6 · probes 21.6 · tests 0.0 · seal + snapshot 4.1 · report 8.0

311.87 s tooling: prepare 1.52 · play 77.84 · consolidate 97.20 · verify 89.80 (diff_commits + full compareTree) · version walk 11.78 · probes 21.64 · metrics 1.01 · seal 1.38 · sealed figures 1.30 · snapshot copy 1.46 · report 0.28

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T17:53:22.025Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 15.85× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.418; Counters: grep_tree.returned_rows per tree byte: depth exponent 0.446; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Directory share: 0.565; Wall projection: 1.07; Node proofs: 15 pass · 1 stop · 0 NOT_RUN over 4 points: r020-1-root end P1 |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T18:23:13.583Z | optimize | Speed: branch.diff_commits >64 entries · uncontended: 15.73× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.387; Counters: grep_tree.returned_rows per tree byte: depth exponent 0.434; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (15 classes too narrow); Directory share: 0.563; Wall projection: 1.07 |

### G. Evidence

- `~/lfs-history/metrics/range-020.a1.json`
- `~/lfs-history/metrics/range-020.a2.json`
- trace `~/lfs-history/runs/p3-main-p/trace/range-020.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-p/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-020.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r020-2-examples-acp-agent | 365 | 203.4 KiB |
| r020-3-docs-rfc | 460 | 205.2 KiB |
| r020-1-root | 87 | 201.2 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 279.0 | 1,682 |
| `git diff --stat` | 27.0 | 1,673 |
| `git add -f` | 19.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 28.0 | 1,676 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r020-2-examples-acp-agent | end | P1 | pass | — | — |
| r020-2-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r020-2-examples-acp-agent | end | P3 | pass | 178 bookkeeping path(s) | — |
| r020-2-examples-acp-agent | end | P4 | pass | 92 emitted files, exit 2 | — |
| r020-2-examples-acp-agent | end | P5 | n/a | no calibrated file | — |
| r020-2-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r020-1-root | end | P1 | pass | — | — |
| r020-1-root | end | P2 | pass | exit 0 | — |
| r020-1-root | end | P3 | n/a | an install, not a refresh | — |
| r020-1-root | end | P4 | pass | 478 emitted files, exit 1 | — |
| r020-1-root | end | P5 | pass | 150 files | — |
| r020-1-root | end | P6 | n/a | not a repair | — |
| r020-3-docs-rfc | end | P1 | pass | — | — |
| r020-3-docs-rfc | end | P2 | pass | exit 0 | — |
| r020-3-docs-rfc | end | P3 | pass | 178 bookkeeping path(s) | — |
| r020-3-docs-rfc | end | P4 | pass | 70 emitted files, exit 2 | — |
| r020-3-docs-rfc | end | P5 | pass | 25 files | — |
| r020-3-docs-rfc | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (721 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
