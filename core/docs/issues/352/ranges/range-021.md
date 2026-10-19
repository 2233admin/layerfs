# Range 021 · **optimize** · attempt 2

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r020 (run p3-main-p)
dsh `4dda5b953`..`b3c4b732d` · **76 commits** (13 mainline, 63 side) · 2026-07-19 → 2026-07-19
Areas changed: `/` 12% · `packages/core` 12% · `docs/rfc` 7% · other 70%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 21 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.24×** · **Churn 0.00**
**Time split:** play 92.1 s · git 141.7 s · Node 221.6 s · verify 92.9 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **560.4 MiB** (+6.4 MiB) | **406.1 MiB** (+32.0 MiB) | **0.72×** (prev 0.68×) | **35.0 MiB** | **1,452** (total 20,774) | **338.8 s** tooling (total 42.7 min) |

**Checks:** 13 pass · 5 watch: Speed branch.diff_commits >64 entries · uncontended: 16.14× baseline (no phase); Counters oneshot_mount_unmount.returned_rows: depth exponent 0.473; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (22 classes too narrow); Disk projection 0.96; Wall projection 1.08 · 1 optimize/stop: Scaling
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ fs.write p95 +116% · ▲ fs.list p95 +75% · ▲ stored added +63%
**Budget:** 22 of 202 ranges · projected total 18.1 h (budget 16.8 h) · disk 96% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,782 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 1 publish |
| Steps | 2,952 / 2,952 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 1845 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 294 bin shims, 3209 links · output root ×2, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (35 lines from 2 .gitignore files) · **249 picks** in 4 merges (249 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `b3c4b732d`** · 157 commits written for 157 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 249 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r021-1-root | end | `f7de02f063e0` | `fc12798da8a2` | pass (297 normalized) | pass | n/a | pass | pass | n/a |
| r021-4-docs | end | `39f55acfc00d` | `a088ce88744f` | pass (295 normalized) | pass | pass | pass | pass | n/a |
| r021-3-docs-rfc | end | `64ef8a469f79` | `a088ce88744f` | pass (295 normalized) | pass | pass | pass | pass | n/a |
| r021-2-packages-core | end | `84a0216519c9` | `a088ce88744f` | pass (295 normalized) | pass | pass | pass | n/a | n/a |
| lead | repair | `6745eb74debd` | `null` | n/a | pass | n/a | n/a | pass | pass (115,825 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/core/agent/tests/gen-cordis-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/verify-export-jsdoc.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/stdio/tests/readline.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/ui/stdio/tests/stdio.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/loader-smoke.spec.ts` (fails natively).

## 2. Activity

**3,712 calls** · **227 steps** by **10 agents + lead** on **4 Branches + main** · **286 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +210 added · 1,044 modified · −114 deleted · 16.5 MiB written · fs 1,246 : Sandbox 122 (**10 : 1**, reported only in P3)
**Execs:** 778 (JS 80 · shell 698) · 4 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,688 | 1,259 | 429 | Committed 1,249 · Text 46 · NoSuchPath 18 · Equal 4 · Binary 1 · UpToDate 10 |
| sandbox | 1,639 | 1,062 | 5 | commit 284 (Committed 217, UpToDate 66, Conflict 1) · exec 778 (exit:0 774, exit:1 1, exit:2 3) · mount 286 (Mounted 286) · status 5 · unmount 286 (Unmounted 286) |
| branch | 374 | 34 | 340 | diff_branches 14 · diff_commits 326 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,712** | **2,355** | **785** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r021-1-root | a01 | 22 | 379 | ✓ | — |
| r021-2-packages-core | a02 a03 a04 | 56 | 289 | ✓ | — |
| r021-3-docs-rfc | a05 a06 a07 | 71 | 317 | ✓ | — |
| r021-4-docs | a08 a09 a10 | 71 | 315 | ✓ | — |
| main | lead | 7 | 152 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r021-4, a08 after a10 | 0.2 s |
| Stale clean merge | 1 / 1 | r021-4, a08 a09 | merged cleanly |
| Decoy edit | 1 / 1 | r021-4, a09 a10 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r021-1 | 22 | 10 | 12 | 0 | 0 | 379 | — |
| a02 | r021-2 | 16 | 6 | 10 | 0 | 0 | 153 | — |
| a03 | r021-2 | 26 | 13 | 13 | 0 | 0 | 93 | — |
| a04 | r021-2 | 14 | 7 | 7 | 0 | 0 | 43 | — |
| a05 | r021-3 | 26 | 12 | 14 | 0 | 0 | 145 | — |
| a06 | r021-3 | 19 | 9 | 10 | 0 | 0 | 34 | — |
| a07 | r021-3 | 26 | 14 | 12 | 0 | 0 | 138 | — |
| a08 | r021-4 | 22 | 8 | 14 | 0 | 0 | 86 | commit-conflict, stale-clean-merge |
| a09 | r021-4 | 19 | 10 | 9 | 0 | 0 | 98 | stale-clean-merge, decoy |
| a10 | r021-4 | 30 | 15 | 15 | 0 | 0 | 131 | commit-conflict, decoy |
| lead | main | 7 | 1 | 0 | 6 | 0 | 152 | — |
| **Total** |  | **227** | **105** | **116** | **6** | **0** | **1,452** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 159 · pnpm 1 · tsc 4 · vitest 4 · other 610

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r021-3-docs-rfc | 48 | 48 | 48 | 7 | 48 | 614 |
| r021-1-root | 15 | 15 | 15 | 7 | 15 | 260 |
| r021-4-docs | 47 | 47 | 47 | 2 | 47 | 573 |
| r021-2-packages-core | 41 | 41 | 41 | 1 | 41 | 634 |
| **lead** | — | — | — | — | 157 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r021-1-root | 1 | 0 | 1 | 1 | 2 | 2 / 2 |
| r021-4-docs | 0 | 1 | 1 | 1 | 25 | 25 / 25 |
| r021-3-docs-rfc | 0 | 1 | 1 | 1 | 8 | 8 / 8 |
| r021-2-packages-core | 0 | 1 | 1 | 0 | 0 | — / — |
| **lead repair** | 1 | — | 1 | — | — | 115,825 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r020) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 554.1 MiB (11.4 MiB / 509.2 MiB / 10.5 MiB / 23.0 MiB) | 560.4 MiB (12.4 MiB / 512.1 MiB / 11.0 MiB / 25.0 MiB) | +6.4 MiB |
| Version figures from | — | full: first (no manifest for range 20) | — |
| Files / directories / symlinks | 49,745 / 8,423 / 3,187 | 50,003 / 8,488 / 3,215 | +258 / +65 / +28 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 374.1 MiB | 406.1 MiB | +32.0 MiB |
| **Space amplification** (total · tracked) | 0.68× · tracked 3.60× | 0.72× · tracked 3.51× | 0.05 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **10.04** (1.49 / 0.25 / 1.08) | 5.08× the median range |
| **Stored per Commit** | 21.5 KiB | 22.4 KiB | — |
| Metadata share | 0.37 | 0.38 | this range 0.44 |
| History: Commits / Layers / Branches | 19,322 | 20,774 / 10 / 69 | +1,452 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 9.17 GiB (Commits 7.65 GiB · installs 1.02 GiB · build 115.5 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 45.62 GiB / 96% | — |
| Snapshot | — | r021, 362.1 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 253.7 MiB | 0.45 | +16.7 MiB |
| Metadata | 36.8 MiB | 0.07 | +3.0 MiB |
| Index rows | 92.0 MiB | 0.16 | +10.6 MiB |
| Waste | 23.1 MiB | 0.04 | +1.6 MiB |
| Other | 508.0 KiB | 0.00 | +40.0 KiB |
| **Total = Store on disk** | **406.1 MiB** | **= 0.72** space amplification | +32.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 12.4 MiB | 43.5 MiB (19.1 MiB + 24.4 MiB) | 3.51× | — | 2.5 MiB | 3.5 MiB | 0.71 |
| `node_modules` | 512.1 MiB | 137.0 MiB (130.4 MiB + 6.6 MiB) | 0.27× | — | 1.6 MiB | 3.0 MiB | 0.52 |
| Build output | 11.0 MiB | 6.4 MiB (6.2 MiB + 274.9 KiB) | 0.59× | — | 572.9 KiB | 4.7 MiB | 0.12 |
| `.git` | 25.0 MiB | 102.4 MiB (97.9 MiB + 4.5 MiB) | 4.10× | — | 15.0 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 115.6 MiB | — (not divided) | — | 12.2 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 1.1 MiB | — | — | — | — | — |
| **Total** | — | **406.1 MiB** | **= 0.72×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 77,732 | +4,354 | 6.1 KiB | 47,500 (derived) | 55% |
| Chunks (large files) | 32,047 | +945 | 12.5 KiB | — | 6% |
| Large-file extents | 12,596 | — | 0.2 KiB | — | — |
| Directories | 87,385 | 4,891 (with inodes, pooled) | 0.2 KiB | — | 63% |
| Inodes and attributes | 125,681 | ↑ pooled | 2.3 KiB | — | — |
| Symlinks | 1,895 | +3,252 | 0.1 KiB | — | — |

Delta: 3.4% at depth cap · 14% of refused bases stopped by budget · `node_modules` reinstall: 0.252× the raw bytes of 28 changed packages (ratio: 771560 new stored for 3056967 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.51× (43.5 MiB for 12.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.7 KiB / 4.0 KiB / 6.5 KiB over 308 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.24× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.1 MiB stored for 1.99 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.18 (4 lanes × 560.4 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.0 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 10.1 ms / 34.6 ms (1.27×) | 2.6 ms / 5.7 ms (1.23×) | 3.9 ms / 9.1 ms (2.44×) | 22.2 ms / 64.9 ms (1.26×) | 12.2 ms / 24.8 ms (1.28×) | 1007 ms / 1437 ms (2.82×) | — (native comparison in P3; exec 45.5 ms / 869 ms) |
| SQL p50: 175 stmts | 49 stmts | 65 stmts | 212 stmts | 47 stmts | 13,793 stmts | — |

**Commit cost:** 9.30 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 648 ms p50 over 286
**Slowest:** sandbox.exec 40728 ms · sandbox.exec 34144 ms · sandbox.exec 33295 ms · checkpoint diff_commits 1.31 ms and 15.77 statements per entry (59,998 entries per page)
**Scaling:** 6 of 15 probes flat · `read` 0.48 · `list_small` 0.21 · `list_largest` 0.38 · `grep_scoped` 0.31 · `grep_tree` 0.78 · `glob_tree` 0.41 · `list_commits` 0.46 · `diff_commits` 0.32 · `fork` 1.91

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 290 ms / 290 ms | — / — | — | git / status-cold: — |
| git status (steady) | 324 ms / 510 ms | — / — | — | git / status-steady: — |
| git add | 31.0 ms / 103 ms | — / — | — | git / add: — |
| git commit (lane) | 37.0 ms / 68.0 ms | — / — | — | git / commit: — |
| lead writes main | 4545 ms / 4545 ms | — / — | — | — |
| repack | 2647 ms / 2647 ms | — / — | — | — |
| pnpm install (incremental) | 3797 ms / 3797 ms | 1525 ms / 1525 ms | 2.49× | pnpm-reinstall / cold: — |
| pnpm refresh | 2576 ms / 2576 ms | 1586 ms / 1586 ms | 1.62× | pnpm-reinstall / steady: — |
| tsc -b | 1899 ms / 2293 ms | 1621 ms / 4128 ms | 1.17× | tsc-b / cold: — |
| vitest | 2515 ms / 2515 ms | 1606 ms / 1606 ms | 1.57× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 13.3 ms / 31.8 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194192 → 4194304 B · fs.write ≤8 KiB 4194192 → 4194304 B · fs.write ≤64 KiB 4194192 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2789272 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 12.45 at the first command → 8.75 after the last (max 12.45 over 6 commands) · Docker VM 1.15 → 1.51

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-021.a2)

## 5. Findings and action

### Finding 021.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.923): tree files exponent 7.779 | < 0.15 |
| Node proofs | 20 pass · 1 stop · 0 NOT_RUN over 5 points: r021-1-root end P2 | P1–P6 pass at every point |

Diagnosis pending: `finding-021.a1.json`.

### Finding 021.a2 · optimize

**1. Trigger** (attempt 2, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.923): tree files exponent 7.734 | < 0.15 |

Diagnosis pending: `finding-021.a2.json`.

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

- **a1 (`p3-main-q`, fork of `p3-main-p`'s r20 snapshot, harness `f4f790dc22`, daemon `44ac6c91`, addon `77597adb`): STOP on Node proofs (`r021-1-root.end` P1 and P2), caused by the oracle's pnpm store, not LayerFS (fix 048).** Checkpoint ok, git ✓. Ranges 21–30's intermediate lockfile versions had not been fetched, so the native install failed pnpm's release-age check offline while LayerFS's Sandbox verified online. Fetched (74 versions), then re-judged on retained state ("re-judged after fix 048"): 20 pass, 1 stop, P2's verification line only. a1 stays a stop.
- **a2 (`p3-main-r`, fork of `p3-main-p`'s r20 snapshot, harness `f4f790dc22` + fix 048): OPTIMIZE, terminal: advanced on optimize: #364 item 4.** Checkpoint ok, git ✓, Node 21 pass, 0 stop, 0 NOT_RUN over 5 points; repair P6 pass (729 emitted). First range on step 0: the native chain is one snapshot (restore 61,328 entries, a point's native run 10 s against 73–94 s at r20); native-first repair check ok (35 s). Final steps: repair 109 s (130 s alarm), verify 96 s (115 s), finish 40 s (50 s); 245 s in all. Repair build 12.2 s (r20 10.4 s), repair install 40.7 s. Control `control-021.a2` passes.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2952/2952; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 16.14× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.923): tree files exponent 7.734 | < 0.15 | optimize |
| Counters | oneshot_mount_unmount.returned_rows: depth exponent 0.473 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (22 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.436 | < 0.5 | pass |
| Reinstall growth | 0.252× the raw bytes of 28 changed packages (ratio: 771560 new stored for 3056967 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0342 (budget 0.144) | < 0.1 | pass |
| Range growth | 35.0 MiB, 1.27× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 1741 ms for 362.1 MiB new; size exponent -0.344 | < 0.15 | pass |
| Disk projection | 0.96 | < 0.8 | watch |
| Wall projection | 1.08 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 157 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 21 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 249 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.24× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 227 | 228 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 1452 | 1288 |
| Workspaces (one-shot share) | 286 (0.99) | 115 (0.983) |
| Reads | 401 | 401 |
| Reconcile writes | 144 | 144 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 14 | 23.14 | 244.62 | 244.62 | 252.67 | 1.51× | 4.88× | 0.90 | 1.42 | 350 / 27,466 / 0 | — | 0.0956 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 253.23 | 253.23 | 253.23 | 253.23 | no baseline | no baseline | 8.23 | 13.70 | 3,131 / 499,528 / 0 | — | 25.3228 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 320 | 280.25 | 318.50 | 335.59 | 352.93 | 16.14× | 12.43× | 4.72 | 9.30 | 3,395 / 531,596 / 0 | — | 1.4457 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.71 | 10.48 | 10.48 | 17.99 | 1.02× | 7.69× | -1.05 | -1.88 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.98 | 0.98 | 0.98 | 1.03 | no baseline | no baseline | 0.77 | 1.33 | 70 / 1,298 / 0 | — | 0.0492 ms per entrie | — |
| branch.merge | 5–16 entries · Merged · uncontended | 1 | 1.18 | 1.18 | 1.18 | 1.18 | no baseline | no baseline | — | — | 35 / 517 / 0 | — | 0.0738 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 1436.61 | 1436.61 | 1436.61 | 1661.72 | 2.82× | 2.82× | -0.74 | -0.98 | 29,855 / 2,650,788 / 4,469 | — | 10.8834 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 5.41 | 5.41 | 5.41 | 5.41 | 1.96× | 1.96× | 0.02 | 0.32 | 45 / 1,011 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 27.78 | 27.78 | 27.78 | 27.78 | 1.46× | 1.46× | 0.64 | 0.89 | 157 / 15,028 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 5 | 14.38 | 17.64 | 17.64 | 24.15 | 1.65× | 1.49× | 0.57 | 0.76 | 265 / 12,797 / 0 | — | 0.0174 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 10 | 8.18 | 11.23 | 11.23 | 13.74 | 1.27× | 1.60× | 0.30 | 0.65 | 131 / 4,544 / 0 | — | 0.0428 ms per byte | commit |
| fs.apply | ≤512 KiB · contended | 1 | 30.87 | 30.87 | 30.87 | 30.87 | no baseline | no baseline | — | — | 469 / 79,845 / 8,191 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 3 | 11.18 | 11.18 | 11.18 | 16.88 | 1.26× | 0.86× | -0.05 | -0.31 | 262 / 12,170 / 0 | — | 0.0003 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 5 | 11.71 | 13.96 | 13.96 | 17.58 | 1.74× | 1.50× | 0.24 | -0.01 | 181 / 8,660 / 0 | — | 0.0003 ms per byte | files.resolve |
| fs.apply | ≤8 KiB · contended | 18 | 14.55 | 23.57 | 23.57 | 26.56 | 1.72× | 1.59× | 0.85 | 1.29 | 304 / 34,525 / 0 | — | 0.0057 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 16 | 9.22 | 17.41 | 17.41 | 28.90 | 1.31× | 1.77× | 0.54 | 0.91 | 150 / 4,665 / 0 | — | 0.0036 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 10 | 8.94 | 15.39 | 15.39 | 18.85 | 1.59× | 2.46× | 1.24 | 1.74 | 216 / 12,284 / 0 | — | 0.0266 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 17 | 8.91 | 11.27 | 11.27 | 12.27 | 1.65× | 1.52× | 1.41 | 2.38 | 156 / 10,088 / 0 | — | 0.0299 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 7 | 8.91 | 13.40 | 13.40 | 22.10 | 1.45× | 1.89× | 1.24 | 2.10 | 176 / 10,593 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 16 | 10.13 | 14.71 | 14.71 | 14.81 | 1.52× | 2.06× | 1.36 | 2.34 | 147 / 9,915 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 6 | 6.02 | 8.05 | 8.05 | 21.64 | 1.14× | 1.17× | 0.41 | 0.60 | 107 / 6,979 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 7 | 6.10 | 9.16 | 9.16 | 9.98 | 1.14× | 1.51× | 0.70 | 1.24 | 113 / 6,112 / 0 | — | 0.0014 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 2.49 | 2.49 | 2.49 | 2.49 | 2.04× | 1.90× | 0.70 | 1.49 | 36 / 3,472 / 0 | — | 2.489 ms per file | — |
| fs.glob | 17–64 files · contended | 5 | 7.58 | 7.94 | 7.94 | 10.89 | 3.35× | 3.32× | 0.68 | 1.15 | 126 / 15,852 / 0 | — | 0.2097 ms per file | — |
| fs.glob | 17–64 files · uncontended | 13 | 7.22 | 8.48 | 8.48 | 12.81 | 3.74× | 3.24× | 0.16 | 0.51 | 105 / 14,427 / 0 | — | 0.1599 ms per file | — |
| fs.glob | 2–4 files · contended | 4 | 2.95 | 3.85 | 3.85 | 3.96 | 2.12× | 2.76× | 0.04 | 0.41 | 46 / 4,547 / 0 | — | 1.3187 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 1.89 | 3.24 | 3.24 | 3.49 | 1.26× | 1.63× | 0.45 | 0.59 | 36 / 3,625 / 0 | — | 0.9265 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 4.54 | 5.06 | 5.06 | 6.20 | 3.51× | 3.57× | 1.19 | 2.04 | 70 / 7,209 / 0 | — | 0.4135 ms per file | — |
| fs.glob | 5–16 files · uncontended | 8 | 3.63 | 5.00 | 5.00 | 5.25 | 1.88× | 2.16× | 0.63 | 1.05 | 61 / 6,504 / 0 | — | 0.4689 ms per file | — |
| fs.glob | >64 files · contended | 10 | 10.19 | 19.11 | 19.11 | 25.33 | 2.47× | 4.63× | -0.95 | -1.72 | 271 / 25,149 / 0 | — | 0.0151 ms per file | — |
| fs.glob | >64 files · uncontended | 13 | 10.00 | 16.86 | 16.86 | 17.80 | 1.91× | 2.21× | -0.15 | -0.24 | 178 / 18,670 / 0 | — | 0.019 ms per file | — |
| fs.grep | 1 files · contended | 1 | 2.76 | 2.76 | 2.76 | 2.76 | 1.63× | 1.63× | 0.01 | 0.25 | 82 / 9,014 / 0 | — | 2.757 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 1 | 1.65 | 1.65 | 1.65 | 1.65 | 1.30× | 1.30× | -0.04 | 0.12 | 48 / 2,970 / 0 | — | 1.647 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 9 | 12.18 | 20.11 | 20.11 | 22.94 | 2.25× | 3.72× | 1.36 | 2.44 | 266 / 16,038 / 0 | — | 0.5365 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 10 | 11.11 | 19.20 | 19.20 | 19.85 | 3.08× | 4.43× | 0.05 | 0.52 | 247 / 15,525 / 0 | — | 0.397 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 4.50 | 4.50 | 4.50 | 4.50 | 1.92× | 1.56× | 0.59 | 1.12 | 159 / 7,777 / 0 | — | 2.249 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 8 | 3.36 | 5.42 | 5.42 | 5.50 | 1.77× | 1.57× | 0.34 | 0.78 | 69 / 4,662 / 0 | — | 1.6785 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 9 | 6.04 | 11.60 | 11.60 | 13.40 | 2.53× | 2.73× | 0.37 | 1.01 | 182 / 8,582 / 0 | — | 0.6709 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 4.60 | 8.72 | 8.72 | 29.34 | 1.46× | 2.54× | -0.17 | -0.15 | 88 / 5,181 / 0 | — | 0.5751 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 9 | 30.08 | 55.92 | 55.92 | 59.90 | 1.97× | 3.66× | -0.17 | -0.12 | 716 / 33,610 / 0 | — | 0.0798 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 9 | 41.35 | 52.53 | 52.53 | 80.50 | 3.60× | 3.34× | 0.40 | 0.57 | 580 / 32,200 / 0 | — | 0.0733 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 2.63 | 2.63 | 2.63 | 2.63 | 1.48× | 1.48× | 0.65 | 1.66 | 69 / 6,431 / 0 | — | 2.631 ms per entrie | — |
| fs.list | 17–64 entries · contended | 14 | 5.23 | 9.06 | 9.06 | 12.08 | 2.92× | 4.34× | 1.05 | 1.85 | 97 / 9,959 / 0 | — | 0.218 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 20 | 5.88 | 10.69 | 10.69 | 10.87 | 2.44× | 4.25× | 0.70 | 1.33 | 71 / 9,012 / 0 | — | 0.1649 ms per entrie | — |
| fs.list | 2–4 entries · contended | 5 | 3.26 | 3.29 | 3.29 | 4.71 | 1.61× | 1.63× | 0.47 | 0.66 | 45 / 3,691 / 0 | — | 1.178 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 8 | 2.14 | 3.86 | 3.86 | 3.91 | 1.20× | 1.63× | 0.27 | 0.32 | 38 / 3,461 / 0 | — | 0.936 ms per entrie | — |
| fs.list | 5–16 entries · contended | 8 | 3.27 | 5.20 | 5.20 | 6.40 | 1.67× | 2.10× | 0.82 | 1.60 | 61 / 4,933 / 0 | — | 0.5045 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 17 | 2.66 | 5.40 | 5.40 | 9.57 | 1.64× | 2.64× | 0.29 | 0.66 | 53 / 4,491 / 0 | — | 0.3797 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 2 | 2.14 | 2.14 | 2.14 | 2.44 | 1.24× | 1.24× | — | — | 54 / 2,333 / 0 | — | 0.0032 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 5 | 2.59 | 2.77 | 2.77 | 2.87 | 2.18× | 2.33× | -0.74 | -2.00 | 55 / 3,114 / 0 | — | 0.0037 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 4.00 | 4.00 | 4.00 | 4.66 | 1.76× | 1.76× | 0.68 | 1.06 | 65 / 4,160 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 18 | 3.71 | 6.17 | 6.17 | 10.26 | 1.87× | 2.61× | 0.56 | 1.01 | 57 / 3,653 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 28 | 2.20 | 3.41 | 3.58 | 4.21 | 1.23× | 1.19× | 0.26 | 0.60 | 41 / 3,028 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 61 | 13.77 | 42.24 | 74.66 | 74.91 | 1.72× | 3.14× | 0.27 | 0.60 | 309 / 20,619 / 0 | — | 13.765 ms per file | commit |
| fs.rm | 1 files · uncontended | 52 | 10.93 | 23.78 | 30.28 | 39.10 | 1.63× | 2.26× | 0.81 | 1.58 | 155 / 7,752 / 0 | — | 10.934 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 2.60 | 2.60 | 2.60 | 2.60 | 1.82× | 1.82× | 0.81 | 1.60 | 40 / 3,685 / 0 | — | 0.0142 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 8 | 1.84 | 3.55 | 3.55 | 3.56 | 1.13× | 1.84× | 0.30 | 0.81 | 35 / 3,119 / 0 | — | 0.0076 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.87 | 2.87 | 2.87 | 2.87 | 2.42× | 2.42× | 0.79 | 1.21 | 48 / 3,001 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 6 | 2.42 | 6.81 | 6.81 | 15.57 | 1.41× | 3.59× | 0.11 | 0.32 | 44 / 3,957 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 17 | 2.56 | 4.48 | 4.48 | 4.75 | 1.46× | 2.18× | 0.32 | 0.49 | 42 / 3,380 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 8 | 2.18 | 2.62 | 2.62 | 5.47 | 1.55× | 1.16× | 0.10 | -0.09 | 50 / 2,949 / 0 | — | 0.0006 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 18 | 2.68 | 6 | 6 | 6.19 | 1.79× | 2.74× | 0.78 | 1.30 | 35 / 3,628 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 38 | 12.06 | 33.69 | 65.78 | 146.98 | 1.65× | 2.49× | 0.15 | 0.61 | 308 / 18,151 / 0 | — | 0.0183 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 64 | 9.35 | 17.52 | 19.53 | 20.04 | 1.59× | 1.94× | 0.51 | 1.04 | 165 / 7,305 / 0 | — | 0.0167 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 7 | 11.04 | 23.59 | 23.59 | 113.68 | 1.00× | 1.59× | 0.27 | 0.53 | 316 / 18,217 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 12 | 11.75 | 16.66 | 16.66 | 31.28 | 1.26× | 1.75× | 0.24 | 0.41 | 175 / 8,033 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 179 | 14.78 | 89.39 | 185.21 | 262.63 | 1.59× | 5.61× | 0.68 | 1.30 | 350 / 20,516 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 203 | 9.12 | 17.87 | 28.38 | 39.62 | 1.30× | 1.82× | 0.33 | 0.65 | 158 / 7,036 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 244 | 11.94 | 69.74 | 119.12 | 215.03 | 1.40× | 4.24× | 0.54 | 1.08 | 277 / 15,827 / 0 | — | 0.0055 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 328 | 8.02 | 15.31 | 23.11 | 38.29 | 1.27× | 1.49× | 0.34 | 0.70 | 134 / 5,651 / 0 | — | 0.0027 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.87 | 0.87 | 0.87 | 0.87 | 1.48× | 1.48× | 0.12 | 0.16 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 60 | 32.18 | 60.76 | 68.49 | 79.77 | 1.41× | 1.45× | -0.53 | -0.79 | 346 / 32,574 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 92 | 28.76 | 51.28 | 79.21 | 242.09 | 1.26× | 1.31× | -0.34 | -0.39 | 289 / 29,363 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 17 | 4.98 | 13.53 | 13.53 | 14.81 | 1.54× | 3.25× | 0.64 | 1.12 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 47 | 4.27 | 11.71 | 30.94 | 32.52 | 1.28× | 2.51× | 0.21 | 0.40 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 5 | 10.06 | 14.60 | 14.60 | 64.87 | 1.17× | 0.85× | 0.42 | 0.68 | 122 / 4,878 / 0 | — | 10.064 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 14 | 9.72 | 26.00 | 26.00 | 36.51 | 1.28× | 2.50× | 0.26 | 0.49 | 114 / 5,225 / 0 | — | 9.717 ms per file | observe.after |
| sandbox.commit | 1 files · Conflict · contended | 1 | 238.86 | 238.86 | 238.86 | 238.86 | 4.75× | 4.75× | 0.11 | 0.88 | 6,236 / 169,294 / 80 | — | 238.858 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · contended | 1 | 12.00 | 12.00 | 12.00 | 12.00 | no baseline | no baseline | — | — | 129 / 6,438 / 0 | — | 11.997 ms per file | observe.after |
| sandbox.commit | 2–4 files · Committed · contended | 10 | 14.27 | 22.01 | 22.01 | 96.78 | 0.93× | 1.05× | 0.63 | 1.03 | 148 / 7,265 / 0 | — | 5.346 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 13 | 13.49 | 18.98 | 18.98 | 25.36 | 1.36× | 1.69× | 0.04 | 0.05 | 156 / 10,292 / 0 | — | 4.745 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 28.89 | 28.89 | 28.89 | 69.95 | 1.93× | 1.93× | 0.30 | 0.70 | 269 / 14,411 / 0 | — | 3.0878 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 11.84 | 11.84 | 11.84 | 24.63 | 1.05× | 1.05× | -0.20 | -0.42 | 186 / 9,733 / 0 | — | 2.3676 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 179.37 | 179.37 | 179.37 | 179.37 | no baseline | no baseline | -1.29 | -2.32 | 1,415 / 197,135 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 37.41 | 520.24 | 520.24 | 15770.04 | 0.54× | 7.54× | -0.20 | -0.13 | 289 / 15,475 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 6.56 | 6.56 | 6.56 | 6.56 | no baseline | no baseline | -2.51 | -4.63 | 6 / 71 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 302 | 62.77 | 863.71 | 1270.55 | 3333.94 | 1.55× | 2.49× | 0.92 | 2.47 | 0 / 0 / 0 | 2,351 | — | — |
| sandbox.exec | 0 files · uncontended | 171 | 36.54 | 81.38 | 703.34 | 5322.09 | 1.35× | 0.32× | 0.15 | 0.19 | 0 / 0 / 0 | 2,419 | — | — |
| sandbox.exec | 1 files · contended | 34 | 43.70 | 87.83 | 110.47 | 146.50 | 1.39× | 1.49× | 0.41 | 0.76 | — | 4.30 | 43.702 ms per file | — |
| sandbox.exec | 1 files · uncontended | 41 | 40.15 | 70.11 | 80.29 | 85.63 | 1.32× | 1.19× | 0.19 | 0.26 | — | 4.70 | 40.148 ms per file | — |
| sandbox.exec | 17–64 files · contended | 8 | 84.66 | 97.09 | 97.09 | 118.90 | 1.32× | 1.51× | 1.25 | 2.13 | — | 95 | 4.4365 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 5 | 73.54 | 79.02 | 79.02 | 80.91 | 1.07× | 1.14× | 0.03 | 0.07 | — | 100 | 3.7718 ms per file | — |
| sandbox.exec | 2–4 files · contended | 49 | 45.64 | 78.33 | 84.99 | 85.12 | 1.20× | 1.26× | 0.32 | 0.75 | — | 10.70 | 17.9365 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 63 | 44.94 | 76.74 | 80.50 | 97.98 | 1.37× | 1.45× | 0.86 | 1.39 | 0 / 0 / 0 | 9.80 | 17.344 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 31 | 51.66 | 125.13 | 141.46 | 165.81 | 0.99× | 2.15× | -0.31 | -0.26 | 0 / 0 / 0 | 16.90 | 6.6131 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 16 | 76.41 | 91.36 | 91.36 | 115.65 | 1.46× | 1.27× | 0.69 | 1.30 | — | 41 | 7.5343 ms per file | — |
| sandbox.exec | — · contended | 15 | 2565.52 | 33294.97 | 33294.97 | 34143.85 | no baseline | no baseline | 1.01 | 1.79 | — | 32376.20 | — | — |
| sandbox.exec | — · uncontended | 33 | 153.17 | 12149.67 | 14082.24 | 40728.35 | 0.30× | 2.55× | -0.37 | -1.11 | — | 35021.50 | — | — |
| sandbox.mount | — · contended | 105 | 13.55 | 29.16 | 36.63 | 48.34 | 1.35× | 1.89× | 0.50 | 0.86 | 54 / 1,499 / 80 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 171 | 11.71 | 21.41 | 26.49 | 51.77 | 1.28× | 1.54× | 0.31 | 0.58 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 4.05 | 7.12 | 7.12 | 35.16 | no baseline | no baseline | -0.45 | -0.95 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 88 | 15.18 | 31.76 | 38.30 | 47.57 | 1.82× | 2.58× | 0.74 | 1.40 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 188 | 12.61 | 30.34 | 115.42 | 161.37 | 1.39× | 2.18× | 0.39 | 0.79 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 14 | 0.0 KiB | 743.8 KiB | 3,342 | ok 14 |
| branch.diff_commits | branch | 326 | 0.0 KiB | 17.7 MiB | 60,909 | ok 326 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 95.4 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 71 | 1.7 MiB | 0.0 KiB | 82 | Committed 71 |
| fs.diff_files | fs | 68 | 0.0 KiB | 582.5 KiB | 50 | Text 46, NoSuchPath 18, Equal 4 |
| fs.glob | fs | 73 | 0.0 KiB | 62.4 KiB | 1,010 | ok 73 |
| fs.grep | fs | 75 | 0.0 KiB | 216.6 KiB | 950 | ok 75 |
| fs.list | fs | 85 | 0.0 KiB | 206.8 KiB | 1,557 | ok 85 |
| fs.read | fs | 61 | 0.0 KiB | 190.8 KiB | 60 | ok 60, Binary 1 |
| fs.rm | fs | 113 | 0.0 KiB | 0.0 KiB | 113 | Committed 113 |
| fs.stat | fs | 67 | 0.0 KiB | 14.2 KiB | 67 | ok 67 |
| fs.write | fs | 1,075 | 14.5 MiB | 0.0 KiB | 1,075 | Committed 1065, UpToDate 10 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 284 | 0.0 KiB | 0.0 KiB | 0 | Committed 217, UpToDate 66, Conflict 1 |
| sandbox.exec | sandbox | 778 | 2.8 MiB | 3.6 MiB | 0 | exit:0 774, exit:1 1, exit:2 3 |
| sandbox.mount | sandbox | 286 | 0.0 KiB | 0.0 KiB | 0 | Mounted 286 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 286 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 286 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 1.15 · end 1.51.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.567 | 14.363 · 1.631 · 1.451 · 1.567 · 1.389 | 1.56–1.56 | statements 25, vm_steps 685, fullscan_steps 0, sorts 0, returned_rows 70 |
| read | 1.494 | 1.494 · 1.309 · 1.535 · 1.571 · 1.103 | 1.56–1.56 | statements 15, vm_steps 466, fullscan_steps 0, sorts 0, returned_rows 60 |
| list_small | 1.288 | 1.297 · 1.174 · 1.192 · 1.44 · 1.288 | 1.56–1.56 | statements 15, vm_steps 475, fullscan_steps 0, sorts 0, returned_rows 60 |
| list_largest | 6.025 | 14.672 · 5.876 · 7.019 · 6.025 · 5.676 | 1.56–1.56 | statements 98, vm_steps 14663, fullscan_steps 0, sorts 0, returned_rows 1520 |
| grep_scoped | 1.546 | 2.085 · 1.501 · 1.383 · 1.546 · 1.738 | 1.56–1.56 | statements 20, vm_steps 621, fullscan_steps 0, sorts 0, returned_rows 69 |
| glob_scoped | 1.302 | 1.485 · 1.161 · 1.22 · 1.464 · 1.302 | 1.56–1.56 | statements 14, vm_steps 454, fullscan_steps 0, sorts 0, returned_rows 59 |
| grep_tree | 4008.84 | 4078.626 · 3970.141 · 4029.319 · 4008.84 · 3970.051 | 1.43–1.51 | statements 43331, vm_steps 3556394, fullscan_steps 0, sorts 0, returned_rows 372047 |
| glob_tree | 8.581 | 10.541 · 9.564 · 8.206 · 8.196 · 8.581 | 1.48–1.48 | statements 177, vm_steps 20972, fullscan_steps 0, sorts 0, returned_rows 2178 |
| diff_files | 3.472 | 4.068 · 3.481 · 3.353 · 3.352 · 3.472 | 1.48–1.48 | statements 66, vm_steps 2608, fullscan_steps 0, sorts 0, returned_rows 354 |
| list_commits | 0.904 | 1.98 · 0.988 · 0.904 · 0.87 · 0.764 | 1.48–1.48 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.255 | 2.645 · 2.009 · 1.983 · 2.301 · 2.255 | 1.48–1.48 | statements 58, vm_steps 2174, fullscan_steps 0, sorts 0, returned_rows 279 |
| fork | 0.778 | 0.778 · 0.842 · 0.646 · 0.79 · 0.727 | 1.48–1.48 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 28.259 | 30.132 · 28.715 · 28.259 · 27.375 · 28.057 | 1.48–1.48 | statements 460, vm_steps 21157, fullscan_steps 4, sorts 8, returned_rows 1734 |
| oneshot_mount_unmount | 16.337 | 21.082 · 16.015 · 17.928 · 14.218 · 16.337 | 1.48–1.6 | statements 59, vm_steps 1880, fullscan_steps 80, sorts 2, returned_rows 204 |
| oneshot_commit | 65.465 | 68.87 · 67.71 · 62.589 · 65.465 · 58.394 | 1.6–1.6 | statements 160, vm_steps 9723, fullscan_steps 80, sorts 2, returned_rows 851 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.48–1.6 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r021: 103,960 pages of 4,096 B, 0 free · Commits 20,992 · Branches 391 · Layers 26 · compression 3.98× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 77,732 | 461.4 MiB |
| 2 | 32,047 | 392.5 MiB |
| 3 | 12,574 | 2.1 MiB |
| 4 | 22 | 4.9 KiB |
| 5 | 12,513 | 1.3 MiB |
| 6 | 41,923 | 214.5 MiB |
| 7 | 87,219 | 19.4 MiB |
| 8 | 166 | 49.1 KiB |
| 9 | 35,575 | 59.8 MiB |
| 10 | 22,848 | 2.8 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,895 | 153.5 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 21,334 | 36.8 MiB |
| 1 | 31,641 | 253.7 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 78,689 | 307.4 MiB | 13.9 MiB |
| inode_value | 13,762 | 53.8 MiB | 1.1 MiB |
| object_location | 4,572 | 17.9 MiB | 1.9 MiB |
| binding_hint | 3,720 | 14.5 MiB | 1.4 MiB |
| commit | 1,649 | 6.4 MiB | 1.1 MiB |
| commit_lineage | 451 | 1.8 MiB | 206.0 KiB |
| commit_runs | 442 | 1.7 MiB | 233.4 KiB |
| commit_identity | 319 | 1.2 MiB | 124.3 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 17 | 68.0 KiB | 11.1 KiB |
| history_meta | 8 | 32.0 KiB | 2.6 KiB |
| branch_names | 7 | 28.0 KiB | 7.2 KiB |
| sqlite_schema | 6 | 24.0 KiB | 8.0 KiB |
| branch_identity | 6 | 24.0 KiB | 8.7 KiB |
| run_merges | 3 | 12.0 KiB | 5.6 KiB |
| layer | 3 | 12.0 KiB | 7.4 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 338.8 s** (tooling): play 93.7 · consolidate 106.2 · verify 102.8 · probes 21.0 · tests 0.0 · seal + snapshot 4.3 · report 10.8

338.75 s tooling: prepare 1.58 · play 92.11 · consolidate 106.20 · verify 92.91 (diff_commits + full compareTree) · version walk 9.84 · probes 21.03 · metrics 0.84 · seal 1.29 · sealed figures 1.25 · snapshot copy 1.78 · report 0.29

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T19:39:45.011Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 16.43× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.923): tree files exponent 7.779; Counters: oneshot_mount_unmount.returned_rows: depth exponent 0.473; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow); Disk projection: 0.95; Wall projection: 1.08; Node proofs: 20 pass · 1 stop · 0 NOT_RUN over 5 points: r021-1-root end P2 |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T19:57:38.720Z | optimize | Speed: branch.diff_commits >64 entries · uncontended: 16.14× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.923): tree files exponent 7.734; Counters: oneshot_mount_unmount.returned_rows: depth exponent 0.473; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (22 classes too narrow); Disk projection: 0.96; Wall projection: 1.08 |

### G. Evidence

- `~/lfs-history/metrics/range-021.a1.json`
- `~/lfs-history/metrics/range-021.a2.json`
- trace `~/lfs-history/runs/p3-main-r/trace/range-021.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-r/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-021.p3-main-r.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r021-3-docs-rfc | 614 | 211.6 KiB |
| r021-1-root | 260 | 205.2 KiB |
| r021-4-docs | 573 | 209.9 KiB |
| r021-2-packages-core | 634 | 206.9 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 324.0 | 1,713 |
| `git diff --stat` | 38.0 | 1,705 |
| `git add -f` | 31.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 37.0 | 1,709 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r021-1-root | end | P1 | pass | — | — |
| r021-1-root | end | P2 | pass | exit 0 | — |
| r021-1-root | end | P3 | n/a | an install, not a refresh | — |
| r021-1-root | end | P4 | pass | 16 emitted files, exit 1 | — |
| r021-1-root | end | P5 | pass | 2 files | — |
| r021-1-root | end | P6 | n/a | not a repair | — |
| r021-4-docs | end | P1 | pass | — | — |
| r021-4-docs | end | P2 | pass | exit 0 | — |
| r021-4-docs | end | P3 | pass | 178 bookkeeping path(s) | — |
| r021-4-docs | end | P4 | pass | 69 emitted files, exit 2 | — |
| r021-4-docs | end | P5 | pass | 25 files | — |
| r021-4-docs | end | P6 | n/a | not a repair | — |
| r021-3-docs-rfc | end | P1 | pass | — | — |
| r021-3-docs-rfc | end | P2 | pass | exit 0 | — |
| r021-3-docs-rfc | end | P3 | pass | 178 bookkeeping path(s) | — |
| r021-3-docs-rfc | end | P4 | pass | 50 emitted files, exit 2 | — |
| r021-3-docs-rfc | end | P5 | pass | 8 files | — |
| r021-3-docs-rfc | end | P6 | n/a | not a repair | — |
| r021-2-packages-core | end | P1 | pass | — | — |
| r021-2-packages-core | end | P2 | pass | exit 0 | — |
| r021-2-packages-core | end | P3 | pass | 178 bookkeeping path(s) | — |
| r021-2-packages-core | end | P4 | pass | 119 emitted files, exit 2 | — |
| r021-2-packages-core | end | P5 | n/a | no calibrated file | — |
| r021-2-packages-core | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (729 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
