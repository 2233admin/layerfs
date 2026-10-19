# Range 020 · **stop** · attempt 1

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · continued from r019 (live Store)
dsh `61136b22b`..`dde62f454` · **60 commits** (6 mainline, 54 side) · 2026-07-14 → 2026-07-19
Areas changed: `examples/acp-agent` 23% · `packages/core` 21% · `/` 14% · other 42%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 15 pass, 1 stop, 0 NOT_RUN over 4 points) · **Content 0.18×** · **Churn 0.00**
**Time split:** play 80.6 s · git 74.1 s · Node 183.1 s · verify 89.0 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **554.1 MiB** (+1.3 MiB) | **378.2 MiB** (+23.5 MiB) live | **0.68×** (prev 0.64×) | **21.5 MiB** | **921** (total 19,322) | **318.8 s** tooling (total 37.2 min) |

**Checks:** 12 pass · 5 watch: Speed branch.diff_commits >64 entries · uncontended: 15.85× baseline (no phase); Counters grep_tree.returned_rows per tree byte: depth exponent 0.446; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Directory share 0.565; Wall projection 1.07 · 2 optimize/stop: Scaling, Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ fs.write p95 −55% · ▲ sandbox.commit p95 +44% · ▼ probe read −32%
**Budget:** 21 of 202 ranges · projected total 18.0 h (budget 16.8 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **170 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 1,666 / 1,666 outcomes as planned |
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
| r020-1-root | end | `3de719f75f2c` | `5c3a7fe0fed9` | stop (297 normalized) | pass | n/a | pass | pass | n/a |
| r020-3-docs-rfc | end | `cf11c9d30c90` | `b0a42300c7a6` | pass (295 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `5305a12a1e99` | `null` | n/a | pass | n/a | n/a | pass | pass (115,591 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/examples/stdio-demo/tests/stdio-agent.spec.ts` (fails natively).

## 2. Activity

**2,282 calls** · **118 steps** by **8 agents + lead** on **3 Branches + main** · **157 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +87 added · 702 modified · −74 deleted · 8.9 MiB written · fs 805 : Sandbox 58 (**14 : 1**, reported only in P3)
**Execs:** 442 (JS 43 · shell 399) · 3 non-zero exits · install 0 · test runs 3 · version figures 11 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 998 | 818 | 180 | Committed 816 · Text 23 · Equal 2 · NoSuchPath 2 · UpToDate 2 |
| sandbox | 914 | 596 | 4 | commit 154 (Committed 120, UpToDate 33, Conflict 1) · exec 442 (exit:0 439, exit:1 1, exit:2 2) · mount 157 (Mounted 157) · status 4 · unmount 157 (Unmounted 157) |
| branch | 360 | 31 | 329 | diff_branches 7 · diff_commits 322 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,282** | **1,445** | **523** |  |

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


**Execs by tool:** git 83 · pnpm 1 · tsc 3 · vitest 3 · other 352

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r020-2-examples-acp-agent | 26 | 26 | 26 | 0 | 26 | 365 |
| r020-3-docs-rfc | 44 | 44 | 44 | 3 | 44 | 460 |
| r020-1-root | 6 | 6 | 6 | 3 | 6 | 87 |
| **lead** | — | — | — | — | 335 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r020-2-examples-acp-agent | 0 | 1 | 1 | 0 | 0 | — / — |
| r020-1-root | 1 | 0 | 1 | 1 | 157 | 157 / 157 |
| r020-3-docs-rfc | 0 | 1 | 1 | 1 | 25 | 25 / 25 |
| **lead repair** | 1 | — | 1 | — | — | 115,591 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r019) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 552.8 MiB (11.4 MiB / 509.2 MiB / 10.5 MiB / 21.8 MiB) | 554.1 MiB (11.4 MiB / 509.2 MiB / 10.5 MiB / 23.0 MiB) | +1.3 MiB |
| Version figures from | — | incremental (59,677 changed paths) | — |
| Files / directories / symlinks | 49,730 / 8,423 / 3,185 | 49,745 / 8,423 / 3,187 | +15 / +0 / +2 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 354.7 MiB | 378.2 MiB | +23.5 MiB |
| **Space amplification** (total · tracked) | 0.64× · tracked 3.51× | 0.68× · tracked 3.60× | 0.04 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.74** (0.98 / 0.26 / 1.90) | 3.94× the median range |
| **Stored per Commit** | 26.8 KiB | 26.1 KiB | — |
| Metadata share | 0.35 | 0.36 | this range 0.56 |
| History: Commits / Layers / Branches | 18,401 | 19,322 / 11 / 99 | +921 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.96 GiB (Commits 7.45 GiB · installs 1.03 GiB · build 116.1 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 45.85 GiB / 41% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 237.0 MiB | 0.43 | +7.4 MiB |
| Metadata | 33.6 MiB | 0.06 | +1.9 MiB |
| Index rows + waste + other (live, not split) | 107.6 MiB | 0.19 | — |
| **Total = Store on disk** | **378.2 MiB** | **= 0.68** space amplification | +23.5 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 11.4 MiB | 41.0 MiB (17.9 MiB + 23.1 MiB) | 3.60× | — | 1.2 MiB | 2.8 MiB | 0.43 |
| `node_modules` | 509.2 MiB | 135.4 MiB (129.7 MiB + 5.7 MiB) | 0.27× | — | 873.4 KiB | 0.0 KiB | 20325.29 |
| Build output | 10.5 MiB | 5.9 MiB (5.7 MiB + 233.1 KiB) | 0.56× | — | 392.6 KiB | 4.7 MiB | 0.08 |
| `.git` | 23.0 MiB | 87.5 MiB (83.7 MiB + 3.8 MiB) | 3.80× | — | 6.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 107.6 MiB | — (not divided) | — | 14.2 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 832.1 KiB | — | — | — | — | — |
| **Total** | — | **378.2 MiB** | **= 0.68×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +1,878 | — | 48,242 (derived) | 61% |
| Chunks (large files) | — (at snapshots) | +411 | — | — | 2% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 3,098 (with inodes, pooled) | — | — | 49% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +3,381 | — | — | — |

Delta: 2.7% at depth cap · 22% of refused bases stopped by budget · `node_modules` reinstall: absolute: 781815 new stored bytes for 44 raw changed bytes of 2 changed packages (17768.523×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.60× (41.0 MiB for 11.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.5 KiB / 1.4 KiB / 3.0 KiB over 411 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.18× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.2 MiB stored for 1.51 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.23 (3 lanes × 554.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.7 ms / 20.2 ms (1.23×) | 3.0 ms / 5.8 ms (1.35×) | 3.4 ms / 7.6 ms (2.17×) | 17.4 ms / 85.5 ms (0.96×) | 11.4 ms / 23.5 ms (1.15×) | 872 ms / 872 ms (2.69×) | — (native comparison in P3; exec 43.9 ms / 935 ms) |
| SQL p50: 163 stmts | 50 stmts | 52 stmts | 175 stmts | 45 stmts | 23,526 stmts | — |

**Commit cost:** 17.98 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 568 ms p50 over 157
**Slowest:** sandbox.exec 36419 ms · sandbox.exec 31925 ms · sandbox.exec 30609 ms · checkpoint diff_commits 1.30 ms and 16.02 statements per entry (59,545 entries per page)
**Scaling:** 4 of 15 probes flat · `stat` 0.19 · `read` 0.39 · `list_small` 0.17 · `list_largest` 0.30 · `grep_scoped` 0.30 · `grep_tree` 1.01 · `glob_tree` 0.65 · `diff_files` 0.66 · `list_commits` 0.90 · `diff_commits` 0.79 · `fork` 1.37

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 277 ms / 277 ms | — / — | — | git / status-cold: — |
| git status (steady) | 277 ms / 454 ms | — / — | — | git / status-steady: — |
| git add | 21.0 ms / 86.0 ms | — / — | — | git / add: — |
| git commit (lane) | 31.0 ms / 65.0 ms | — / — | — | git / commit: — |
| lead writes main | 12148 ms / 12148 ms | — / — | — | — |
| repack | 2483 ms / 2483 ms | — / — | — | — |
| pnpm install (incremental) | 3335 ms / 3335 ms | 1176 ms / 1176 ms | 2.84× | pnpm-reinstall / cold: — |
| pnpm refresh | 2544 ms / 2544 ms | 1253 ms / 1253 ms | 2.03× | pnpm-reinstall / steady: — |
| tsc -b | 2548 ms / 2548 ms | 2552 ms / 2847 ms | 1.00× | tsc-b / cold: — |
| vitest | 3859 ms / 3859 ms | 2116 ms / 2116 ms | 1.82× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 4.0 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.5 ms / 27.7 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a6 | 17442 | 329.4 | 7.23 (1.23×) · 7012 · 308 (13 solo) | 7.31 (1.18×) · 6681 · 272 (125 solo) | 8.33 (1.14×) · 7276 · 340 (134 solo) | 2.48 (1.24×) · 3475 · — (0 solo) | 9.64 (1.06×) · 1337 · — (daemon) | 9.40 (1.13×) · 5265 · — (daemon) | 2709.77 (—×) · 15044810 · 26378 (3 solo) |
| 019.a4 | 18401 | 354.7 | 8.18 (1.39×) · 5950 · 250 (11 solo) | 8.63 (1.39×) · 6703 · 302 (93 solo) | 9.84 (1.35×) · 7721 · 357 (108 solo) | 3.23 (1.62×) · 4209 · 60 (2 solo) | 11.03 (1.21×) · 1337 · — (daemon) | 9.98 (1.20×) · 4896 · — (daemon) | 803.54 (—×) · 1377824 · 7245 (4 solo) |
| 020.a1 | 19322 | 378.2 | 7.25 (1.23×) · 6753 · 248 (50 solo) | 7.75 (1.25×) · 6964 · 272 (106 solo) | 8.74 (1.20×) · 7293 · 302 (92 solo) | 2.43 (1.22×) · 3653 · 207 (1 solo) | 10.58 (1.16×) · 1337 · — (daemon) | 10.34 (1.24×) · 5025 · — (daemon) | 872.10 (—×) · 1899627 · 9454 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 2776912 → 4194304 B · fs.write ≤8 KiB 2397872 → 4194304 B · fs.write ≤64 KiB 4190072 → 4194304 B · fs.read ≤8 KiB 4190072 → 4194304 B · sandbox.mount 4190072 → 4194304 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 9.92 at the first command → 9.78 after the last (max 11.99 over 5 commands) · Docker VM 1.55 → 2.24

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-020.a1)

## 5. Findings and action

### Finding 020.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.418 | < 0.15 |
| Node proofs | 15 pass · 1 stop · 0 NOT_RUN over 4 points: r020-1-root end P1 | P1–P6 pass at every point |

Diagnosis pending: `finding-020.a1.json`.

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
- **a2 (`p3-main-o`, fork of `p3-main-n`'s r19 snapshot, long chain, harness `007157472b`): KILLED at the declared 295 s alarm of the final command. No metrics were written and nothing was judged; held for the liaison (owner rule: stop and tell; the alarm is not raised).** The lanes played, but the last lanes command took 116 s of its 118 s alarm (a1: 60 s). In the final command the closure finished at +442.6 s: repair install 60.4 s (a1 36.4 s), build 43.1 s (a1 11.6 s; clean plus whole build), test 5.2 s. Consolidation took 285.9 s, then the alarm fired. Host 1-min load: 8.5 at the first command, 14.4 at the final one, 42.1 just after (a1 ran at 9.7–11.3). The busiest process was the Docker VM (305% CPU), with Spotlight (`mds_stores`, 86%) and Chrome also busy. The runner container and the four Sandboxes left behind were stopped and removed; the run is dirty.

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1666/1666; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 15.85× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.418 | < 0.15 | optimize |
| Counters | grep_tree.returned_rows per tree byte: depth exponent 0.446 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.565 | < 0.5 | watch |
| Reinstall growth | absolute: 781815 new stored bytes for 44 raw changed bytes of 2 changed packages (17768.523×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0273 (budget 0.2211) | < 0.1 | pass |
| Range growth | 21.5 MiB, 0.54× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 1.07 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 335 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 15 pass · 1 stop · 0 NOT_RUN over 4 points: r020-1-root end P1 | P1–P6 pass at every point | stop |
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
| Workspaces (one-shot share) | 157 (0.99) | 63 (0.968) |
| Reads | 133 | 133 |
| Reconcile writes | 238 | 238 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 7 | 38.76 | 241.66 | 241.66 | 251.11 | 2.53× | 4.82× | 1.25 | 1.83 | 551 / 57,336 / 0 | — | 0.1754 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 257.43 | 257.43 | 257.43 | 257.43 | no baseline | no baseline | — | — | 3,185 / 503,612 / 0 | — | 36.7761 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 278.75 | 278.75 | 278.75 | 278.75 | no baseline | no baseline | 0.18 | 0.39 | 5,795 / 206,081 / 0 | — | 1.3026 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 315 | 275.31 | 317.22 | 381.69 | 493.69 | 15.85× | 12.38× | 5.98 | 11.28 | 3,445 / 534,571 / 0 | — | 1.4395 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.57 | 1.30 | 1.30 | 1.56 | 0.82× | 0.95× | -1.66 | -2.67 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.80 | 0.80 | 0.80 | 4.93 | no baseline | no baseline | 0.95 | 1.62 | 70 / 1,298 / 0 | — | 0.0399 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 1155.61 | 1155.61 | 1155.61 | 1155.61 | 2.69× | 2.69× | — | — | 30,962 / 2,674,647 / 4,813 | — | 21.4002 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 872.10 | 872.10 | 872.10 | 872.10 | 1.71× | 1.71× | -1.01 | -1.22 | 23,526 / 1,899,627 / 3,425 | — | 7.5835 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.38 | 1.38 | 1.38 | 1.38 | 1.73× | 1.73× | — | — | 35 / 517 / 0 | — | 0.0127 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 6.48 | 6.48 | 6.48 | 6.48 | 2.35× | 2.35× | 0.44 | 0.83 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 25.44 | 25.44 | 25.44 | 25.44 | 1.34× | 1.34× | -0.21 | 0.10 | 189 / 18,789 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 2 | 14.54 | 14.54 | 14.54 | 16.86 | 1.67× | 1.23× | 0.75 | 0.92 | 288 / 20,183 / 0 | — | 0.0589 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 2 | 10.19 | 10.19 | 10.19 | 14.49 | 1.20× | 0.69× | 0.74 | 1.42 | 120 / 6,818 / 0 | — | 0.0077 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 6 | 10.96 | 11.40 | 11.40 | 23.96 | 1.55× | 1.16× | 1.03 | 1.48 | 133 / 7,798 / 0 | — | 0.0056 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 5.47 | 5.47 | 5.47 | 8.70 | 0.98× | 0.87× | 0.71 | 1.06 | 130 / 6,289 / 0 | — | 0.0203 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 6 | 10.70 | 17.77 | 17.77 | 20.74 | 1.98× | 2.40× | 1.81 | 2.82 | 191 / 11,894 / 0 | — | 0.0332 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 1 | 24.14 | 24.14 | 24.14 | 24.14 | 3.92× | 3.40× | 2.88 | 4.13 | 368 / 20,706 / 0 | — | 0.0013 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 9 | 9.45 | 14.39 | 14.39 | 25.48 | 1.42× | 2.01× | 1.49 | 2.45 | 204 / 12,674 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 10.79 | 20.87 | 20.87 | 21.58 | 2.02× | 3.43× | 1.56 | 2.41 | 211 / 12,923 / 0 | — | 0.0029 ms per byte | sdk.read |
| fs.glob | 17–64 files · uncontended | 5 | 5.14 | 5.77 | 5.77 | 5.91 | 2.66× | 2.21× | -0.05 | 0.25 | 87 / 11,052 / 0 | — | 0.2469 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 3.02 | 3.02 | 3.02 | 5.37 | 2.01× | 1.52× | 0.97 | 1.31 | 51 / 5,480 / 0 | — | 1.008 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 4.47 | 4.47 | 4.47 | 4.47 | 3.45× | 3.16× | 0.86 | 1.70 | 114 / 9,989 / 0 | — | 0.6383 ms per file | — |
| fs.glob | 5–16 files · uncontended | 6 | 4.84 | 6.84 | 6.84 | 7.16 | 2.50× | 2.95× | 1.11 | 1.54 | 61 / 6,164 / 0 | — | 0.5259 ms per file | — |
| fs.glob | >64 files · uncontended | 4 | 14.02 | 15.00 | 15.00 | 36.03 | 2.68× | 1.96× | 0.29 | 0.09 | 119 / 15,103 / 0 | — | 0.0461 ms per file | — |
| fs.grep | 1 files · uncontended | 2 | 1.63 | 1.63 | 1.63 | 9.46 | 1.29× | 1.29× | 0.45 | 1.01 | 30 / 2,560 / 0 | — | 1.626 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 3 | 20.34 | 20.34 | 20.34 | 22.69 | 5.64× | 4.69× | 1.25 | 2.17 | 379 / 24,630 / 0 | — | 0.5385 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 4 | 3.23 | 3.45 | 3.45 | 22.24 | 1.71× | 1.00× | 0.90 | 1.51 | 56 / 4,401 / 0 | — | 1.167 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 7.39 | 7.39 | 7.39 | 7.39 | 3.09× | 1.74× | 0.70 | 1.49 | 188 / 10,183 / 0 | — | 0.8209 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 3 | 6.45 | 6.45 | 6.45 | 9.78 | 2.05× | 1.88× | 0.61 | 0.86 | 80 / 5,222 / 0 | — | 0.4959 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 1 | 63.05 | 63.05 | 63.05 | 63.05 | 4.13× | 4.13× | 0.85 | 1.07 | 965 / 51,969 / 0 | — | 0.0382 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 6 | 23.25 | 35.17 | 35.17 | 39.73 | 2.02× | 2.24× | -0.06 | -0.16 | 556 / 26,303 / 0 | — | 0.0864 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 2.81 | 2.81 | 2.81 | 2.81 | 1.67× | 1.67× | -0.31 | -1.05 | 54 / 3,961 / 0 | — | 2.815 ms per entrie | — |
| fs.list | 17–64 entries · contended | 2 | 4.60 | 4.60 | 4.60 | 12.61 | 2.57× | 2.21× | 1.09 | 1.88 | 149 / 16,595 / 0 | — | 0.1918 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 7 | 5.23 | 7.45 | 7.45 | 7.56 | 2.17× | 2.96× | 0.76 | 1.32 | 69 / 8,819 / 0 | — | 0.25 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 2.30 | 2.84 | 2.84 | 3.36 | 1.28× | 1.20× | 0.45 | 0.51 | 37 / 4,447 / 0 | — | 0.7673 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 17.17 | 17.17 | 17.17 | 17.17 | 8.77× | 6.95× | 3.61 | 4.93 | 138 / 19,129 / 0 | — | 2.453 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 7 | 2.48 | 3.17 | 3.17 | 3.51 | 1.53× | 1.55× | 0.41 | 0.88 | 48 / 4,981 / 0 | — | 0.3357 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 1 | 3.18 | 3.18 | 3.18 | 3.18 | 2.67× | 2.67× | -0.63 | -2.83 | 35 / 3,781 / 0 | — | 0.0041 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 13.72 | 13.72 | 13.72 | 13.72 | no baseline | no baseline | 3.43 | 3.71 | 117 / 7,177 / 0 | — | 0.0014 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.77 | 2.77 | 2.77 | 3.05 | 1.22× | 1.22× | 0.27 | 0.34 | 42 / 3,588 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 2 | 4.30 | 4.30 | 4.30 | 5.83 | 2.17× | 1.82× | 1.13 | 1.56 | 61 / 1,939 / 0 | — | 0.0015 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 18 | 2.43 | 5.82 | 5.82 | 7.64 | 1.35× | 2.04× | 0.65 | 1.21 | 47 / 3,653 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 7 | 13.53 | 16.94 | 16.94 | 56.51 | 1.69× | 1.26× | 0.80 | 1.28 | 278 / 17,826 / 0 | — | 13.527 ms per file | commit |
| fs.rm | 1 files · uncontended | 67 | 9.11 | 16.82 | 19.58 | 37.54 | 1.35× | 1.60× | 0.92 | 1.75 | 151 / 7,815 / 0 | — | 9.106 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 3 | 2.80 | 2.80 | 2.80 | 2.96 | 1.72× | 1.46× | 1.32 | 2.28 | 45 / 4,343 / 0 | — | 0.0032 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.51 | 2.51 | 2.51 | 2.51 | 2.12× | 2.12× | 0.71 | 0.95 | 36 / 3,406 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 1 | 5.32 | 5.32 | 5.32 | 5.32 | 3.10× | 2.80× | 1.43 | 2.04 | 52 / 5,248 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.25 | 3.20 | 3.20 | 5.43 | 1.28× | 1.56× | 0.20 | 0.30 | 38 / 3,618 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 8 | 2.25 | 4.32 | 4.32 | 5.69 | 1.51× | 1.98× | 0.72 | 1.15 | 37 / 3,721 / 0 | — | 0.0007 ms per byte | — |
| fs.write | ≤1 KiB · contended | 45 | 10.03 | 15.88 | 25.32 | 59.27 | 1.37× | 1.17× | 0.15 | 0.71 | 283 / 16,469 / 0 | — | 0.0118 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 149 | 7.25 | 16.43 | 20.51 | 34.86 | 1.24× | 1.82× | 0.40 | 0.90 | 140 / 6,753 / 0 | — | 0.0084 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 1 | 18.22 | 18.22 | 18.22 | 18.22 | 1.64× | 1.23× | 1.14 | 1.76 | 388 / 22,351 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 12 | 8.90 | 13.66 | 13.66 | 20.48 | 0.96× | 1.44× | 0.02 | 0.08 | 137 / 6,624 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 61 | 12.12 | 98.43 | 106.44 | 127.65 | 1.30× | 6.18× | 0.90 | 1.60 | 324 / 17,828 / 0 | — | 0.0007 ms per byte | files.change |
| fs.write | ≤64 KiB · uncontended | 158 | 8.74 | 16.78 | 20.40 | 24.77 | 1.25× | 1.71× | 0.43 | 0.81 | 165 / 7,293 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 68 | 11.55 | 27.21 | 37.52 | 139.63 | 1.35× | 1.66× | 1.01 | 1.75 | 311 / 17,944 / 0 | — | 0.0066 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 227 | 7.75 | 16.55 | 27.93 | 55.32 | 1.23× | 1.61× | 0.45 | 0.89 | 154 / 6,964 / 0 | — | 0.0044 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.55 | 0.55 | 0.55 | 0.55 | 0.93× | 0.93× | -0.53 | -0.75 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 15 | 37.54 | 68.24 | 68.24 | 138.80 | 1.65× | 1.62× | -0.23 | -0.40 | 272 / 37,232 / 42 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 62 | 21.95 | 62.50 | 85.54 | 149.45 | 0.96× | 1.60× | -0.49 | -0.57 | 201 / 18,245 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 5 | 3.92 | 5.60 | 5.60 | 8.60 | 1.21× | 1.34× | 0.53 | 0.96 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 26 | 3.98 | 10.11 | 10.29 | 18.58 | 1.19× | 2.17× | 0.27 | 0.42 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 7 | 16.52 | 17.28 | 17.28 | 20.83 | 1.91× | 1.01× | 1.05 | 1.56 | 170 / 12,825 / 0 | — | 16.518 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 14 | 10.34 | 15.99 | 15.99 | 33.54 | 1.36× | 1.54× | 0.45 | 0.75 | 125 / 5,025 / 0 | — | 10.337 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 653.51 | 653.51 | 653.51 | 653.51 | 12.99× | 12.99× | 2.15 | 3.96 | 13,028 / 588,121 / 0 | — | 653.508 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · uncontended | 1 | 7.18 | 7.18 | 7.18 | 7.18 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 7.182 ms per file | observe.after |
| sandbox.commit | 2–4 files · Committed · contended | 1 | 14.53 | 14.53 | 14.53 | 14.53 | 0.95× | 0.69× | 0.88 | 1.49 | 140 / 8,270 / 0 | — | 7.264 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 4 | 11.90 | 13.88 | 13.88 | 13.88 | 1.20× | 1.24× | -0.23 | -0.28 | 137 / 6,755 / 0 | — | 3.4707 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 16.75 | 16.75 | 16.75 | 29.06 | 1.48× | 1.48× | -0.14 | -0.13 | 206 / 17,235 / 0 | — | 1.6752 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 134.78 | 134.78 | 134.78 | 401.29 | no baseline | no baseline | -1.97 | -2.96 | 1,088 / 200,001 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 8 | 34.58 | 525.09 | 525.09 | 15677.17 | 0.50× | 7.61× | -0.31 | 0.09 | 189 / 10,932 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 3.57 | 3.57 | 3.57 | 3.57 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 102 | 394.45 | 753.28 | 1210.94 | 1833.48 | 9.73× | 2.18× | 5.44 | 8.52 | — | 2,294 | — | — |
| sandbox.exec | 0 files · uncontended | 146 | 39.03 | 541.93 | 1162.19 | 8794.51 | 1.44× | 2.11× | 0.21 | 0.24 | — | 2201.30 | — | — |
| sandbox.exec | 1 files · contended | 33 | 45.21 | 88.02 | 96.72 | 97.60 | 1.44× | 1.50× | 0.62 | 1.00 | 0 / 0 / 0 | 5 | 45.206 ms per file | observe.after |
| sandbox.exec | 1 files · uncontended | 53 | 37.13 | 55.77 | 81.41 | 87.76 | 1.22× | 0.95× | 0.02 | 0.00 | — | 5 | 37.128 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 66.93 | 66.93 | 66.93 | 81.73 | 0.98× | 0.97× | -0.07 | -0.06 | — | 97 | 3.3465 ms per file | — |
| sandbox.exec | 2–4 files · contended | 12 | 39.07 | 82.41 | 82.41 | 143.56 | 1.03× | 1.33× | 0.39 | 0.87 | — | 9.70 | 16.491 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 21 | 49.16 | 78.66 | 78.66 | 89.09 | 1.50× | 1.49× | 0.99 | 1.55 | — | 11.60 | 16.8732 ms per file | — |
| sandbox.exec | 5–16 files · contended | 6 | 40.64 | 62.95 | 62.95 | 79.16 | 0.78× | 1.08× | -0.58 | -0.58 | — | 16 | 3.7222 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 20 | 44.15 | 82.77 | 82.77 | 118.92 | 0.84× | 1.15× | 0.34 | 0.74 | — | 17.50 | 3.8847 ms per file | — |
| sandbox.exec | — · contended | 12 | 3326.15 | 30608.87 | 30608.87 | 31924.50 | no baseline | no baseline | 1.73 | 2.73 | — | 34177.60 | — | — |
| sandbox.exec | — · uncontended | 25 | 222.94 | 12218.46 | 13487.17 | 36419.16 | 0.44× | 2.56× | -0.50 | -1.34 | — | 32648.60 | — | — |
| sandbox.mount | — · contended | 33 | 13.87 | 26.76 | 29.29 | 31.52 | 1.38× | 1.74× | 0.67 | 1.03 | 58 / 1,630 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 114 | 10.58 | 22.58 | 28.35 | 30.62 | 1.15× | 1.63× | 0.29 | 0.52 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 7.66 | 7.66 | 7.66 | 7.66 | no baseline | no baseline | -1.70 | 1.32 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 11.84 | 11.84 | 11.84 | 30.51 | no baseline | no baseline | 1.14 | 0.94 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 23 | 15.92 | 27.53 | 27.67 | 49.91 | 1.91× | 2.24× | 1.24 | 1.97 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 124 | 10.42 | 27.61 | 109.54 | 140.67 | 1.14× | 1.99× | 0.43 | 0.81 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 7 | 0.0 KiB | 372.1 KiB | 1,660 | ok 7 |
| branch.diff_commits | branch | 322 | 0.0 KiB | 17.6 MiB | 60,146 | ok 322 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
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
| sandbox.exec | sandbox | 442 | 2.3 MiB | 3.7 MiB | 0 | exit:0 439, exit:1 1, exit:2 2 |
| sandbox.mount | sandbox | 157 | 0.0 KiB | 0.0 KiB | 0 | Mounted 157 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 157 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 157 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 1.55 · end 2.24.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.744 | 3.232 · 1.744 · 1.881 · 1.216 · 1.27 | 2.73–2.73 | statements 15, vm_steps 1258, fullscan_steps 0, sorts 0, returned_rows 117 |
| read | 1.433 | 1.488 · 1.433 · 1.796 · 1.291 · 1.249 | 2.73–2.73 | statements 14, vm_steps 1228, fullscan_steps 0, sorts 0, returned_rows 116 |
| list_small | 1.289 | 1.289 · 1.173 · 1.811 · 1.533 · 1.215 | 2.73–2.73 | statements 14, vm_steps 1237, fullscan_steps 0, sorts 0, returned_rows 116 |
| list_largest | 6.027 | 6.768 · 5.535 · 5.77 · 6.027 · 6.04 | 2.73–2.73 | statements 84, vm_steps 14722, fullscan_steps 0, sorts 0, returned_rows 1371 |
| grep_scoped | 1.581 | 1.728 · 1.674 · 1.581 · 1.464 · 1.517 | 2.73–2.73 | statements 19, vm_steps 1383, fullscan_steps 0, sorts 0, returned_rows 125 |
| glob_scoped | 1.328 | 1.247 · 1.252 · 1.328 · 1.742 · 1.688 | 2.73–2.73 | statements 13, vm_steps 1216, fullscan_steps 0, sorts 0, returned_rows 115 |
| grep_tree | 4285.276 | 4439.945 · 4285.276 · 4151.085 · 4342.724 · 4187.52 | 2.31–2.59 | statements 42766, vm_steps 3535834, fullscan_steps 0, sorts 0, returned_rows 370196 |
| glob_tree | 9.816 | 12.104 · 9.816 · 9.829 · 9.333 · 9.379 | 2.37–2.37 | statements 210, vm_steps 23278, fullscan_steps 0, sorts 0, returned_rows 2207 |
| diff_files | 6.693 | 6.693 · 6.741 · 6.171 · 6.395 · 6.82 | 2.37–2.37 | statements 72, vm_steps 7324, fullscan_steps 0, sorts 0, returned_rows 702 |
| list_commits | 1.304 | 1.429 · 0.903 · 1.35 · 1.304 · 0.917 | 2.37–2.37 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.938 | 3.463 · 2.554 · 3.038 · 2.938 · 2.71 | 2.37–2.37 | statements 53, vm_steps 2393, fullscan_steps 0, sorts 0, returned_rows 253 |
| fork | 0.519 | 1.153 · 0.619 · 0.399 · 0.416 · 0.519 | 2.37–2.37 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 28.229 | 28.229 · 29.408 · 30.871 · 27.989 · 27.5 | 2.37–2.37 | statements 459, vm_steps 26610, fullscan_steps 4, sorts 8, returned_rows 1985 |
| oneshot_mount_unmount | 17.668 | 22.712 · 17.456 · 18.529 · 17.668 · 16.537 | 2.37–2.37 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 67.896 | 190.966 · 66.385 · 61.637 · 81.288 · 67.896 | 2.37–2.37 | statements 136, vm_steps 9311, fullscan_steps 80, sorts 2, returned_rows 869 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.37–2.37 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 318.8 s** (tooling): play 82.1 · consolidate 106.2 · verify 98.9 · probes 22.6 · tests 0.0 · seal + snapshot 0.0 · report 9.0

318.78 s tooling: prepare 1.50 · play 80.63 · consolidate 106.19 · verify 89.02 (diff_commits) · version walk 9.90 · probes 22.56 · metrics 0.96 · Store allocation 0.30 · report 0.27

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T17:53:22.025Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 15.85× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.963): tree files exponent 9.418; Counters: grep_tree.returned_rows per tree byte: depth exponent 0.446; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Directory share: 0.565; Wall projection: 1.07; Node proofs: 15 pass · 1 stop · 0 NOT_RUN over 4 points: r020-1-root end P1 |

### G. Evidence

- `~/lfs-history/metrics/range-020.a1.json`
- trace `~/lfs-history/runs/p3-main-n/trace/range-020.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-n/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r020-2-examples-acp-agent | 365 | 203.4 KiB |
| r020-3-docs-rfc | 460 | 205.2 KiB |
| r020-1-root | 87 | 201.2 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 277.0 | 1,682 |
| `git diff --stat` | 30.0 | 1,673 |
| `git add -f` | 21.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 31.0 | 1,676 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r020-2-examples-acp-agent | end | P1 | pass | — | — |
| r020-2-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r020-2-examples-acp-agent | end | P3 | pass | 178 bookkeeping path(s) | — |
| r020-2-examples-acp-agent | end | P4 | pass | 92 emitted files, exit 2 | — |
| r020-2-examples-acp-agent | end | P5 | n/a | no calibrated file | — |
| r020-2-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r020-1-root | end | P1 | stop | missing 0, extra 0, differ 2: examples/node_modules/.bin, python/sdk-runtime/node_modules/.bin | — |
| r020-1-root | end | P2 | pass | exit 0 | — |
| r020-1-root | end | P3 | n/a | an install, not a refresh | — |
| r020-1-root | end | P4 | pass | 478 emitted files, exit 1 | — |
| r020-1-root | end | P5 | pass | 157 files | — |
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
