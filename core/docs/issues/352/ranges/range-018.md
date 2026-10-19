# Range 018 · **stop** · attempt 1

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · continued from r017 (live Store)
dsh `0056238bb`..`417248eed` · **67 commits** (11 mainline, 56 side) · 2026-07-07 → 2026-07-18
Areas changed: `examples/acp-agent` 30% · `packages/core` 11% · `/` 6% · other 53%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 16 pass, 1 stop, 0 NOT_RUN over 4 points) · **Content 0.24×** · **Churn 0.02**
**Time split:** play 119.0 s · git 121.9 s · Node 236.4 s · verify 97.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **552.7 MiB** (+116.4 MiB) | **332.3 MiB** (+66.6 MiB) live | **0.60×** (prev 0.61×) | **66.3 MiB** | **1,631** (total 17,442) | **367.9 s** tooling (total 26.0 min) |

**Checks:** 13 pass · 4 watch: Speed branch.diff_commits >64 entries · uncontended: 17.24× baseline (no phase); Counters glob_tree.vm_steps per tree file: depth exponent 0.424; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection 1.05 · 2 optimize/stop: Scaling, Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +174% · ▲ metadata added +72% · ▲ probe list_commits +49%
**Budget:** 19 of 202 ranges · projected total 17.6 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **528 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 2,864 / 2,864 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 0 missing, 0 extra, 2 differ (`examples/node_modules/.bin`, `python/sdk-runtime/node_modules/.bin`) · not byte-compared: 3 pnpm state file(s) · by target: 292 bin shims, 3174 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (31 lines from 1 .gitignore files) · **170 picks** in 3 merges (162 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `417248eed`** · 150 commits written for 150 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 162 · Build outputs 8 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r018-3-examples-acp-agent | end | `e8131b0c30fb` | `1d0c61fffe17` | pass (276 normalized) | pass | pass | pass | pass | n/a |
| r018-2-packages-core | end | `718d55dc1efb` | `1d0c61fffe17` | pass (276 normalized) | pass | pass | pass | pass | n/a |
| r018-1-root | end | `c7a6bb7dc05e` | `1ca44e155637` | pass (295 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `6769d6cfba70` | `null` | n/a | pass | n/a | n/a | pass | stop (115,375 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/compact/compact/tests/tool-pairing.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/stdio-demo/tests/stdio-agent.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/web/tool-web/tests/tool-web.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/core/agent-loop/tests/review-fixes.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/apply.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/load-path.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/example-launch.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/harness.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively).

## 2. Activity

**3,554 calls** · **168 steps** by **8 agents + lead** on **3 Branches + main** · **227 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +188 added · 1,298 modified · −85 deleted · 20.9 MiB written · fs 1,446 : Sandbox 125 (**12 : 1**, reported only in P3)
**Execs:** 667 (JS 51 · shell 616) · 3 non-zero exits · install 0 · test runs 4 · version figures 11 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,830 | 1,460 | 370 | Committed 1,460 · Text 43 · NoSuchPath 9 |
| sandbox | 1,350 | 892 | 4 | commit 225 (Committed 185, UpToDate 39, Conflict 1) · exec 667 (exit:0 664, exit:2 3) · mount 227 (Mounted 227) · status 4 · unmount 227 (Unmounted 227) |
| branch | 364 | 31 | 333 | diff_branches 15 · diff_commits 318 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,554** | **2,383** | **717** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r018-1-root | a01 a02 | 40 | 433 | ✓ | — |
| r018-2-packages-core | a03 a04 a05 | 60 | 448 | ✓ | — |
| r018-3-examples-acp-agent | a06 a07 a08 | 62 | 444 | ✓ | — |
| main | lead | 6 | 306 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r018-1, a02 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r018-1, a02 a01 | merged cleanly |
| Decoy edit | 1 / 1 | r018-1, a02 a01 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r018-1 | 22 | 9 | 13 | 0 | 0 | 226 | commit-conflict, stale-clean-merge, decoy |
| a02 | r018-1 | 18 | 5 | 13 | 0 | 0 | 207 | commit-conflict, stale-clean-merge, decoy |
| a03 | r018-2 | 17 | 10 | 7 | 0 | 0 | 109 | — |
| a04 | r018-2 | 14 | 5 | 9 | 0 | 0 | 142 | — |
| a05 | r018-2 | 29 | 15 | 14 | 0 | 0 | 197 | — |
| a06 | r018-3 | 28 | 12 | 16 | 0 | 0 | 272 | — |
| a07 | r018-3 | 17 | 7 | 10 | 0 | 0 | 115 | — |
| a08 | r018-3 | 17 | 8 | 9 | 0 | 0 | 57 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 306 | — |
| **Total** |  | **168** | **72** | **91** | **5** | **0** | **1,631** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 126 · pnpm 1 · tsc 4 · vitest 4 · other 532

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r018-2-packages-core | 45 | 45 | 45 | 5 | 45 | 966 |
| r018-3-examples-acp-agent | 45 | 45 | 45 | 1 | 45 | 894 |
| r018-1-root | 29 | 29 | 29 | 4 | 29 | 548 |
| **lead** | — | — | — | — | 150 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r018-3-examples-acp-agent | 0 | 1 | 1 | 1 | 11 | 11 / 11 |
| r018-2-packages-core | 0 | 1 | 1 | 1 | 51 | 51 / 51 |
| r018-1-root | 1 | 0 | 1 | 1 | 31 | 31 / 31 |
| **lead repair** | 1 | — | 1 | — | — | 115,375 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r017) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 436.3 MiB (10.7 MiB / 396.6 MiB / 11.7 MiB / 17.3 MiB) | 552.7 MiB (11.4 MiB / 509.1 MiB / 12.0 MiB / 20.1 MiB) | +116.4 MiB |
| Version figures from | — | incremental (58,955 changed paths) | — |
| Files / directories / symlinks | 41,546 / 6,995 / 2,729 | 49,771 / 8,447 / 3,180 | +8,225 / +1,452 / +451 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 265.7 MiB | 332.3 MiB | +66.6 MiB |
| **Space amplification** (total · tracked) | 0.61× · tracked 3.29× | 0.60× · tracked 3.35× | -0.01 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **10.21** (0.36 / 0.03 / 0.16) | 5.40× the median range |
| **Stored per Commit** | 21.4 KiB | 41.8 KiB | — |
| Metadata share | 0.35 | 0.34 | this range 0.29 |
| History: Commits / Layers / Branches | 15,811 | 17,442 / 11 / 97 | +1,631 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 14.51 GiB (Commits 13.01 GiB · installs 1.07 GiB · build 117.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.26 GiB / 36% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 216.8 MiB | 0.39 | +43.3 MiB |
| Metadata | 29.0 MiB | 0.05 | +3.3 MiB |
| Index rows + waste + other (live, not split) | 86.5 MiB | 0.16 | — |
| **Total = Store on disk** | **332.3 MiB** | **= 0.60** space amplification | +66.6 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 11.4 MiB | 38.3 MiB (16.8 MiB + 21.6 MiB) | 3.35× | — | 3.0 MiB | 6.5 MiB | 0.47 |
| `node_modules` | 509.1 MiB | 133.7 MiB (129.6 MiB + 4.1 MiB) | 0.26× | — | 27.3 MiB | 112.6 MiB | 0.24 |
| Build output | 12.0 MiB | 4.0 MiB (3.9 MiB + 130.2 KiB) | 0.33× | — | 514.6 KiB | 2.4 MiB | 0.21 |
| `.git` | 20.1 MiB | 69.5 MiB (66.6 MiB + 2.9 MiB) | 3.46× | — | 15.9 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 86.5 MiB | — (not divided) | — | 20.0 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 389.3 KiB | — | — | — | — | — |
| **Total** | — | **332.3 MiB** | **= 0.60×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +11,268 | — | 47,367 (derived) | 55% |
| Chunks (large files) | — (at snapshots) | +4,146 | — | — | 2% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 5,331 (with inodes, pooled) | — | — | 56% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +3,652 | — | — | — |

Delta: 1.5% at depth cap · 25% of refused bases stopped by budget · `node_modules` reinstall: 0.007× the raw bytes of 229 changed packages (ratio: 778319 new stored for 117917290 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.35× (38.3 MiB for 11.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.8 KiB / 5.7 KiB / 10.5 KiB over 269 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.24× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.02 (27.8 MiB stored for 1.27 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.20 (3 lanes × 552.7 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.2 ms / 21.3 ms (1.31×) | 2.6 ms / 6.3 ms (1.47×) | 3.7 ms / 7.7 ms (2.31×) | 24.2 ms / 77.9 ms (1.42×) | 11.5 ms / 18.7 ms (1.21×) | 2870 ms / 2870 ms (5.64×) | — (native comparison in P3; exec 43.5 ms / 934 ms) |
| SQL p50: 164 stmts | 53 stmts | 66 stmts | 222 stmts | 47 stmts | 168,960 stmts | — |

**Commit cost:** 18.26 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 713 ms p50 over 227
**Slowest:** sandbox.exec 40061 ms · sandbox.exec 39414 ms · sandbox.exec 33618 ms · checkpoint diff_commits 1.43 ms and 17.25 statements per entry (58,681 entries per page)
**Scaling:** 3 of 15 probes flat · `stat` 0.69 · `read` 0.25 · `list_small` 0.31 · `list_largest` 0.95 · `grep_scoped` 0.27 · `grep_tree` 0.97 · `glob_tree` 0.91 · `diff_files` 0.72 · `list_commits` 0.61 · `diff_commits` 1.01 · `fork` 2.42 · `merge` 0.37

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 379 ms / 379 ms | — / — | — | git / status-cold: — |
| git status (steady) | 346 ms / 569 ms | — / — | — | git / status-steady: — |
| git add | 35.0 ms / 127 ms | — / — | — | git / add: — |
| git commit (lane) | 41.0 ms / 81.0 ms | — / — | — | git / commit: — |
| lead writes main | 5742 ms / 5742 ms | — / — | — | — |
| repack | 4072 ms / 4072 ms | — / — | — | — |
| pnpm install (incremental) | 6291 ms / 6291 ms | 1635 ms / 1635 ms | 3.85× | pnpm-reinstall / cold: — |
| pnpm refresh | 2396 ms / 2396 ms | 994 ms / 994 ms | 2.41× | pnpm-reinstall / steady: — |
| tsc -b | 8753 ms / 8753 ms | 3373 ms / 4009 ms | 2.60× | tsc-b / cold: — |
| vitest | 14513 ms / 14513 ms | 5553 ms / 5553 ms | 2.61× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 4.0 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.3 ms / 23.9 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a1 | 17442 | 332.3 | 7.94 (1.35×) · 7071 · not recorded | 7.92 (1.27×) · 6639 · not recorded | 9.15 (1.25×) · 7319 · not recorded | 2.64 (1.32×) · 3551 · not recorded | 11.10 (1.22×) · 1337 · not recorded | 10.20 (1.22×) · 5238 · not recorded | not split by class (before range 18) |

**WAL across each class this range:** not recorded
**Host load (1-min, recorded, not waited on):** macOS not recorded (before 2026-10-19) · Docker VM 2.42 → 2.24

**Control probe** (one sample per arm, same window and binaries; (a) the range 15 Store, (b) the range's):

| Sample | (a) Commits · MiB | (b) Commits · MiB | fs.write ≤1 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.write ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.read ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | Host load (macOS) | Watch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| control-017.diag-15v17 | 12851 · 207.8 | 15811 · 265.7 | failed: (a) 0 of ? calls ok, (b) 0 ok | failed: (a) 0 of ? calls ok, (b) 0 ok | 2.79 (1.00× first) / 2.43 · 0.87× · 73/57 | 9.15 → 9.53 | not judged (failed calls) |
| control-017.diag-15v17-2 | 12851 · 207.8 | 15811 · 265.7 | 6.21 (1.00× first) / 6.63 · 1.07× · 114/112 | 6.39 (1.00× first) / 6.40 · 1.00× · 109/110 | 2.59 (0.93× first) / 2.32 · 0.89× · 73/57 | 11.39 → 10.96 | pass |
| control-018.a1 | 12851 · 207.8 | 17442 · 328.3 | 6.63 (1.07× first) / 7.01 · 1.06× · 113/112 | 6.46 (1.01× first) / 6.41 · 0.99× · 108/108 | 2.74 (0.98× first) / 2.53 · 0.92× · 73/70 | 10.05 → 10.05 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-018.a1)

## 5. Findings and action

### Finding 018.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.828 | < 0.15 |
| Node proofs | 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-018.a1.json`.

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

### Lead's note (written by the lead; never empty unless the verdict is pass)

- **a1 (`p3-main-g`, harness `05e3713f2c`, daemon `44ac6c91`, addon `77597adb`): STOP at the repair's P6 (Node proof). This is an oracle model gap, not a LayerFS defect; held for a liaison decision.** Checkpoint ok, git ✓ (decision B cleaned 0 files). All three lane points pass P1–P5, and the repair passes P2 and P5 (30 files). P6 stops because P4 finds 2 emitted files that differ: `packages/core/session/lib/types/tool-pairing.d.ts` and `.js`.
  - **Cause:** the plan's path lanes split dsh `cc546c4580` ("move pairing helpers"). That commit moves `packages/core/session/src/tool-pairing.ts` to `packages/compact/compact/src/` (the `core/session` side goes to lane 2, `compact` to lane 3). Lane 2 also plays `1123e946c0` and `649865043d`, which still edit `core/session/src/tool-pairing.ts`. So lane 2's end-point build emits new git-ignored output, `core/session/lib/types/tool-pairing.*` (`042b06c9…`, `c233d58c…`); natively the same tree and command write the same blobs (P4 pass at `r018-2-packages-core`).
  - At the checkpoint `6769d6cf`, the source no longer exists in `core/session`, and `tsc -b` neither rewrites nor deletes outputs of a deleted source. LayerFS merged lane 2's change to the ignored file into main, as the Workspace model says (ignored files are state; a Branch's change merges). The native repair chain runs each lane point in that lane's own folder (`repairChain`: "its lib/ output stays in the lane's tree"), so the lead's native folder keeps the older stale copy from earlier ranges (`23bfb241…`, `2352ae25…`). The two sides differ only in which stale orphan they hold. The same class as range 16 a1 (a package move split across path lanes), here in ignored build output, which decision B's `git clean -f` does not touch.
  - **Options sent to the liaison:**
    - A: the native repair chain carries each lane point's changed build output into the lead's folder in merge order. This models the merge LayerFS performs; oracle fix, recommended.
    - B: P4 at the repair judges only outputs whose source exists at the checkpoint, and orphans are counted and listed. This is a proof-scope change.
    - C: the lead's finish removes orphaned `tsc` outputs, natively the same. This is a workload change.
  - **Scaling optimize, `branch.diff_commits` checkpoint ms per entry against tree files, exponent 11.8.** The per-entry cost is flat since the relink-over-relink step at r016: 1.31 → 1.50 → 1.43 ms and 16.58 → 17.11 → 17.25 statements per entry (r015 0.11 ms, 4.34 statements). The fit's first two points sit at 41,376 and 41,546 tree files, so a time-only +14% between them reads as a steep exponent. Not filed; it stays the hot-spot lead recorded at range 16.
  - **Watch:** `diff_commits` 17.24× (verify 97.2 s); `glob_tree` VM steps per tree file, exponent 0.424; wall projection 1.05.
  - **Speed** is time-only as in r017: method p50 ratios are write 1.31×, read 1.47×, list 2.31×, Commit 1.42×, mount 1.21×. SQL p50 is flat (write 164, read 53, list 66, Commit 222 statements). macOS host load is 10–16.
- **Against range 15:**
  - Stored per Commit 41.8 KiB (r015 60.3).
  - `node_modules` grew 396.6 → 509.1 MiB (229 changed packages, 117.9 MB raw). Reinstall growth 0.007× (ratio, pass).
  - Content ratio 0.24× (0.29×); churn 0.02 (27.8 MiB stored for 1.27 GiB rewritten; r015 0.26).
  - Index rows aren't split this range (live Store; index rows + waste + other 86.5 MiB).
  - Tooling 367.9 s; the final command took 244 s under the 295 s alarm. Lanes ran in 3 commands (cuts 16 and 56; 16, 32 and 81 s).
- **Speed as history grows (added after a1, owner request; watch row only).** a1 was played before the per-call counters existed, so its classes show "not recorded"; its control sample was taken afterwards on the live Store (`control-018.a1`, macOS load 10.0).
  - The r018 Store (17,442 Commits, 328 MiB) against r015's (12,851 Commits, 208 MiB): (b)/(a) p50 1.06× write ≤1 KiB, 0.99× write ≤8 KiB, 0.92× read ≤8 KiB, with read syscalls per call equal (112/113, 108/108, 70/73). Watch row pass.
  - In the play's traces, the p50 rise since r015 is mostly outside SQLite (write ≤1 KiB: 4.89 → 6.35 ms outside, 0.98 → 1.43 ms inside). History growth does not explain it.
- **Installed tree row (correction, liaison question):** the row now reads the on-top chain the repair's P1 judges (equal to native). The lead-only chain's two `.bin` differences are each one shim whose target a lane's build makes; LayerFS equals the on-top chain byte for byte (`examples/node_modules/.bin` 3 files, 2,838 B, `1123c550…`; `python/sdk-runtime/node_modules/.bin` 3 files, 2,778 B, `d785f42d…`).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2864/2864; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 17.24× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.828 | < 0.15 | optimize |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.424 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.292 | < 0.5 | pass |
| Reinstall growth | 0.007× the raw bytes of 229 changed packages (ratio: 778319 new stored for 117917290 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0145 (budget 0.2487) | < 0.1 | pass |
| Range growth | 66.3 MiB, 1.67× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 1.05 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 150 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 | P1–P6 pass at every point | stop |
| `.git` conflicts | 0 (tracked 0 · install 162 · build 8; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.24× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 168 | 169 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1631 | 1498 |
| Workspaces (one-shot share) | 227 (0.99) | 90 (0.978) |
| Reads | 323 | 323 |
| Reconcile writes | 297 | 297 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 15 | 16.69 | 283.34 | 283.34 | 772.26 | 1.09× | 5.65× | 0.75 | 1.17 | 209 / 22,828 / 0 | — | 0.0704 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 2 | 42.47 | 42.47 | 42.47 | 250.60 | no baseline | no baseline | -4.08 | -5.07 | 671 / 39,979 / 0 | — | 0.5445 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 311 | 299.46 | 371.95 | 417.51 | 505.60 | 17.24× | 14.52× | 9.95 | 13.98 | 3,712 / 570,168 / 0 | — | 1.5811 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.65 | 1.27 | 1.27 | 2.54 | 0.94× | 0.94× | -1.21 | -1.76 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 1.11 | 1.11 | 1.11 | 1.19 | no baseline | no baseline | 1.08 | 1.54 | 70 / 1,298 / 0 | — | 0.0556 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 2870.34 | 2870.34 | 2870.34 | 3429.60 | 5.64× | 5.64× | 0.55 | 0.56 | 168,960 / 15,087,690 / 23,361 | — | 14.1719 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.22 | 4.22 | 4.22 | 4.22 | 1.53× | 1.53× | 0.39 | 0.57 | 45 / 1,012 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 43.31 | 43.31 | 43.31 | 43.31 | 2.28× | 2.28× | 0.76 | 1.10 | 169 / 22,938 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 4 | 34.18 | 42.08 | 42.08 | 94.22 | 3.93× | 3.55× | 2.38 | 3.07 | 958 / 46,348 / 0 | — | 0.067 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 8 | 9.36 | 10.08 | 10.08 | 10.83 | 1.45× | 1.44× | 1.30 | 1.76 | 136 / 6,429 / 0 | — | 0.0214 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 11 | 14.79 | 22.13 | 22.13 | 27.73 | 1.66× | 1.70× | -1.64 | -2.31 | 377 / 23,967 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 8 | 7.71 | 10.51 | 10.51 | 28.56 | 1.15× | 1.13× | -1.15 | -1.63 | 121 / 5,654 / 0 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 34 | 16.69 | 34.51 | 41.44 | 86.09 | 1.97× | 2.33× | 0.25 | 0.45 | 340 / 24,816 / 0 | — | 0.0046 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 38 | 6.98 | 14.84 | 19.83 | 23.79 | 0.99× | 1.51× | 0.38 | 0.59 | 117 / 4,648 / 0 | — | 0.0021 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 4.44 | 4.44 | 4.44 | 8.00 | 0.79× | 0.71× | -0.00 | 0.21 | 156 / 5,604 / 0 | — | — | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 10 | 8.89 | 10.45 | 10.45 | 11.34 | 1.64× | 1.41× | 2.23 | 3.02 | 166 / 8,654 / 0 | — | 0.0319 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 9 | 9.99 | 13.84 | 13.84 | 14.77 | 1.62× | 1.95× | 1.55 | 2.16 | 245 / 12,592 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 19 | 8.58 | 12.07 | 12.07 | 13.75 | 1.29× | 1.69× | 1.71 | 2.32 | 175 / 9,241 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 3 | 7.23 | 7.23 | 7.23 | 7.55 | 1.37× | 1.05× | 0.80 | 1.17 | 149 / 7,630 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 6.23 | 6.75 | 6.75 | 8.61 | 1.17× | 1.11× | 1.12 | 1.62 | 132 / 7,437 / 0 | — | 0.0014 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 5 | 6.64 | 7.37 | 7.37 | 7.92 | 2.93× | 3.07× | 1.07 | 1.50 | 109 / 14,711 / 0 | — | 0.2141 ms per file | — |
| fs.glob | 17–64 files · uncontended | 9 | 6.58 | 10.26 | 10.26 | 11.38 | 3.41× | 3.92× | 1.22 | 1.70 | 105 / 14,025 / 0 | — | 0.2551 ms per file | — |
| fs.glob | 2–4 files · contended | 3 | 3.33 | 3.33 | 3.33 | 4.67 | 2.39× | 2.39× | — | — | 58 / 3,443 / 0 | — | 0.924 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 2.22 | 2.22 | 2.22 | 5.71 | 1.47× | 1.12× | 0.11 | 0.16 | 38 / 4,117 / 0 | — | 1.109 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 3.79 | 4.28 | 4.28 | 4.91 | 2.93× | 3.02× | 1.93 | 2.84 | 61 / 5,463 / 0 | — | 0.4758 ms per file | — |
| fs.glob | 5–16 files · uncontended | 12 | 3.20 | 4.83 | 4.83 | 15.49 | 1.66× | 2.09× | 1.13 | 1.53 | 50 / 4,813 / 0 | — | 0.4574 ms per file | — |
| fs.glob | >64 files · contended | 3 | 5.33 | 5.33 | 5.33 | 6.28 | 1.29× | 1.29× | -2.62 | -3.17 | 141 / 13,390 / 0 | — | 0.0208 ms per file | — |
| fs.glob | >64 files · uncontended | 9 | 8.24 | 18.27 | 18.27 | 21.39 | 1.57× | 2.39× | 0.44 | 0.77 | 99 / 13,717 / 0 | — | 0.0308 ms per file | — |
| fs.grep | 17–64 files · contended | 3 | 20.42 | 20.42 | 20.42 | 35.61 | 3.78× | 3.78× | 2.94 | 3.87 | 427 / 18,416 / 0 | — | 0.9372 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 14 | 18.18 | 22.00 | 22.00 | 33.47 | 5.05× | 5.07× | 2.41 | 3.27 | 354 / 18,407 / 0 | — | 0.4089 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 4.00 | 4.00 | 4.00 | 4.00 | 1.71× | 1.39× | 0.76 | 1.10 | 97 / 6,095 / 0 | — | 1.3337 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 8 | 2.79 | 3.94 | 3.94 | 4.85 | 1.48× | 1.14× | 0.24 | 0.39 | 51 / 3,377 / 0 | — | 1.267 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 7 | 6.70 | 9.46 | 9.46 | 19.48 | 2.80× | 2.23× | 2.43 | 3.51 | 204 / 7,804 / 0 | — | 0.718 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 13 | 4.34 | 17.24 | 17.24 | 34.27 | 1.38× | 5.02× | 0.36 | 0.55 | 109 / 5,289 / 0 | — | 0.5429 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 6 | 23.07 | 32.20 | 32.20 | 53.97 | 1.51× | 2.11× | -0.07 | 0.07 | 666 / 29,895 / 0 | — | 0.0901 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 8 | 31.05 | 52.22 | 52.22 | 55.39 | 2.70× | 3.32× | -0.03 | 0.01 | 557 / 30,291 / 0 | — | 0.1069 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 3 | 2.35 | 2.35 | 2.35 | 2.51 | 1.39× | 1.39× | -1.28 | -1.96 | 41 / 3,548 / 0 | — | 2.352 ms per entrie | — |
| fs.list | 17–64 entries · contended | 7 | 5.00 | 7.03 | 7.03 | 8.61 | 2.78× | 3.37× | 1.68 | 2.33 | 100 / 9,351 / 0 | — | 0.2081 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 21 | 5.56 | 7.95 | 7.95 | 8.85 | 2.31× | 3.16× | 1.62 | 2.20 | 88 / 8,564 / 0 | — | 0.1677 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 3.10 | 3.10 | 3.10 | 3.10 | 1.54× | 1.54× | 1.00 | 1.42 | 41 / 3,251 / 0 | — | 1.552 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 10 | 2.21 | 2.86 | 2.86 | 3.54 | 1.23× | 1.21× | 0.21 | 0.28 | 44 / 4,054 / 0 | — | 0.9283 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 2.57 | 2.57 | 2.57 | 4.17 | 1.31× | 1.04× | 1.20 | 1.76 | 47 / 4,905 / 0 | — | 0.3669 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 16 | 2.41 | 4.48 | 4.48 | 7.16 | 1.49× | 2.19× | 0.62 | 0.93 | 49 / 4,055 / 0 | — | 0.3771 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 4 | 2.03 | 2.66 | 2.66 | 3.88 | 1.71× | 2.24× | -3.39 | -5.21 | 46 / 3,447 / 0 | — | 0.0037 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 2 | 2.79 | 2.79 | 2.79 | 4.07 | no baseline | no baseline | — | — | 57 / 4,180 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.21 | 2.67 | 2.67 | 3.83 | 0.98× | 1.18× | -0.67 | -0.93 | 56 / 3,634 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 9 | 2.65 | 3.20 | 3.20 | 3.48 | 1.34× | 1.35× | 0.64 | 0.93 | 57 / 3,575 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 35 | 2.64 | 6.69 | 6.87 | 15.94 | 1.47× | 2.34× | 1.03 | 1.45 | 50 / 3,551 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 11 | 16.14 | 41.91 | 41.91 | 59.83 | 2.01× | 3.12× | 0.71 | 0.84 | 377 / 73,052 / 8,191 | — | 16.138 ms per file | commit |
| fs.rm | 1 files · uncontended | 74 | 10.26 | 17.41 | 33.32 | 60.84 | 1.53× | 1.65× | 1.70 | 2.33 | 152 / 8,342 / 0 | — | 10.255 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 2 | 1.85 | 1.85 | 1.85 | 2.49 | 1.14× | 0.96× | 0.80 | 1.24 | 39 / 3,481 / 0 | — | 0.0022 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 2.06 | 2.06 | 2.06 | 2.06 | no baseline | no baseline | — | — | 38 / 3,199 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.04 | 2.04 | 2.04 | 2.04 | 1.72× | 1.72× | — | — | 42 / 3,290 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 8 | 2.77 | 3.10 | 3.10 | 3.27 | 1.62× | 1.63× | 0.70 | 1.12 | 49 / 4,363 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 23 | 2.33 | 3.58 | 3.69 | 7.12 | 1.33× | 1.74× | 0.18 | 0.23 | 42 / 3,602 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 2.22 | 2.22 | 2.22 | 2.82 | 1.58× | 0.98× | -0.11 | -0.15 | 44 / 3,568 / 0 | — | 0.0013 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 14 | 1.90 | 3.63 | 3.63 | 9.83 | 1.27× | 1.66× | 0.45 | 0.65 | 45 / 3,018 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 23 | 9.74 | 18.36 | 28.67 | 29.34 | 1.33× | 1.36× | 1.32 | 2.03 | 245 / 11,326 / 0 | — | 0.0142 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 109 | 7.94 | 14.48 | 20.23 | 28.45 | 1.35× | 1.60× | 1.20 | 1.70 | 143 / 7,071 / 0 | — | 0.0103 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 9 | 13.98 | 20.73 | 20.73 | 24.42 | 1.26× | 1.40× | 0.80 | 1.11 | 326 / 17,691 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 12 | 10.42 | 13.72 | 13.72 | 14.96 | 1.12× | 1.44× | 0.32 | 0.43 | 152 / 6,536 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 166 | 13.72 | 38.37 | 84.18 | 123.50 | 1.47× | 2.41× | 1.22 | 1.71 | 340 / 18,828 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 428 | 9.15 | 14.43 | 18.30 | 31.27 | 1.31× | 1.47× | 0.85 | 1.19 | 162 / 7,319 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 123 | 11.91 | 32.36 | 53.66 | 109.64 | 1.39× | 1.97× | 1.05 | 1.56 | 303 / 18,073 / 0 | — | 0.0038 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 389 | 7.92 | 14.55 | 20.31 | 33.64 | 1.26× | 1.42× | 0.95 | 1.35 | 150 / 6,639 / 0 | — | 0.0025 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.64 | 0.64 | 0.64 | 0.64 | 1.08× | 1.08× | -0.21 | -0.27 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 41 | 34.88 | 63.87 | 65.12 | 74.66 | 1.53× | 1.52× | -0.13 | -0.16 | 366 / 37,246 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 79 | 32.44 | 75.80 | 94.05 | 297.01 | 1.42× | 1.94× | 0.53 | 0.67 | 321 / 34,801 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 11 | 3.83 | 4.81 | 4.81 | 4.92 | 1.18× | 1.15× | 0.63 | 0.92 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 28 | 3.88 | 5.46 | 5.78 | 8.06 | 1.16× | 1.17× | 0.54 | 0.77 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 9 | 10.48 | 25.70 | 25.70 | 53.27 | 1.21× | 1.50× | 0.62 | 1.01 | 132 / 6,626 / 0 | — | 10.479 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 15 | 10.20 | 11.81 | 11.81 | 16.31 | 1.34× | 1.13× | 0.71 | 0.96 | 113 / 5,238 / 0 | — | 10.197 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 1469.16 | 1469.16 | 1469.16 | 1469.16 | 29.21× | 29.21× | 4.42 | 5.57 | 28,680 / 1,901,117 / 0 | — | 1469.163 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 6 | 19.38 | 42.62 | 42.62 | 61.07 | 1.26× | 2.03× | 1.10 | 1.42 | 269 / 15,882 / 2 | — | 6.4593 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 8 | 16.24 | 17.68 | 17.68 | 20.43 | 1.64× | 1.58× | 0.28 | 0.32 | 195 / 10,613 / 0 | — | 4.4188 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 15.51 | 15.51 | 15.51 | 39.14 | 1.04× | 1.04× | — | — | 229 / 11,081 / 0 | — | 3.0862 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 7 | 18.64 | 29.68 | 29.68 | 32.35 | 1.65× | 2.62× | 0.42 | 0.50 | 228 / 16,380 / 0 | — | 3.3412 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 3730.43 | 3730.43 | 3730.43 | 3730.43 | no baseline | no baseline | 2.26 | 1.62 | 21,467 / 2,258,066 / 8,511 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 91.79 | 409.16 | 409.16 | 15302.43 | 1.33× | 5.93× | 1.77 | 2.39 | 770 / 82,084 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 210 | 513.77 | 937.33 | 1125.91 | 2118.02 | 12.68× | 2.71× | 9.22 | 12.17 | 0 / 0 / 0 | 2451.30 | — | — |
| sandbox.exec | 0 files · uncontended | 171 | 38.29 | 598.64 | 1724.78 | 7893.98 | 1.41× | 2.33× | 0.35 | 0.46 | — | 2,466 | — | — |
| sandbox.exec | 1 files · contended | 33 | 40.76 | 60.25 | 78.85 | 80.48 | 1.30× | 1.02× | 1.05 | 1.47 | — | 4.70 | 40.763 ms per file | — |
| sandbox.exec | 1 files · uncontended | 54 | 38.78 | 63.06 | 72.99 | 92.35 | 1.27× | 1.07× | 0.38 | 0.53 | — | 5.50 | 38.781 ms per file | — |
| sandbox.exec | 17–64 files · contended | 6 | 76.26 | 91.12 | 91.12 | 94.90 | 1.19× | 1.42× | 2.05 | 2.70 | — | 95 | 3.8132 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 4 | 70.42 | 70.61 | 70.61 | 75.73 | 1.03× | 1.02× | 0.14 | 0.24 | — | 92 | 3.5208 ms per file | — |
| sandbox.exec | 2–4 files · contended | 35 | 43.50 | 63.19 | 67.85 | 78.17 | 1.15× | 1.02× | 1.16 | 1.65 | — | 10.50 | 15.5188 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 30 | 40.20 | 62.05 | 62.20 | 68.04 | 1.23× | 1.18× | 1.06 | 1.49 | 0 / 0 / 0 | 10.30 | 13.057 ms per file | — |
| sandbox.exec | 5–16 files · contended | 39 | 42.96 | 65.08 | 80.93 | 92.96 | 0.82× | 1.12× | 0.45 | 0.81 | — | 13.70 | 7.4292 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 37 | 48.82 | 81.58 | 84.98 | 98.83 | 0.93× | 1.13× | 1.07 | 1.61 | — | 13.80 | 7.7712 ms per file | — |
| sandbox.exec | — · contended | 16 | 2391.13 | 32632.41 | 32632.41 | 39414.01 | no baseline | no baseline | 1.20 | 1.72 | — | 30926.20 | — | — |
| sandbox.exec | — · uncontended | 22 | 178.54 | 13290.96 | 33618.13 | 40060.99 | 0.35× | 2.79× | -1.79 | -2.65 | — | 27588.20 | — | — |
| sandbox.mount | — · contended | 85 | 12.28 | 18.85 | 22.98 | 26.42 | 1.22× | 1.22× | 0.78 | 1.11 | 58 / 1,619 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 132 | 11.10 | 15.82 | 17.96 | 19.60 | 1.21× | 1.14× | 0.72 | 0.98 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 5.05 | 10.69 | 10.69 | 32.12 | no baseline | no baseline | -0.61 | -0.93 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 61 | 12.40 | 22.56 | 24.16 | 24.94 | 1.49× | 1.83× | 1.27 | 1.80 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 156 | 11.34 | 30.56 | 99.29 | 142.65 | 1.25× | 2.20× | 0.92 | 1.26 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 15 | 0.0 KiB | 794.0 KiB | 3,522 | ok 15 |
| branch.diff_commits | branch | 318 | 0.0 KiB | 17.1 MiB | 59,270 | ok 318 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.8 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 116 | 3.3 MiB | 0.0 KiB | 127 | Committed 116 |
| fs.diff_files | fs | 52 | 0.0 KiB | 739.3 KiB | 43 | Text 43, NoSuchPath 9 |
| fs.glob | fs | 58 | 0.0 KiB | 49.1 KiB | 821 | ok 58 |
| fs.grep | fs | 70 | 0.0 KiB | 266.4 KiB | 1,052 | ok 70 |
| fs.list | fs | 72 | 0.0 KiB | 148.6 KiB | 1,298 | ok 72 |
| fs.read | fs | 59 | 0.0 KiB | 221.2 KiB | 59 | ok 59 |
| fs.rm | fs | 85 | 0.0 KiB | 0.0 KiB | 85 | Committed 85 |
| fs.stat | fs | 59 | 0.0 KiB | 12.7 KiB | 59 | ok 59 |
| fs.write | fs | 1,259 | 18.2 MiB | 0.0 KiB | 1,259 | Committed 1259 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 225 | 0.0 KiB | 0.0 KiB | 0 | Committed 185, UpToDate 39, Conflict 1 |
| sandbox.exec | sandbox | 667 | 3.8 MiB | 3.0 MiB | 0 | exit:0 664, exit:2 3 |
| sandbox.mount | sandbox | 227 | 0.0 KiB | 0.0 KiB | 0 | Mounted 227 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 227 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 227 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 2.42 · end 2.24.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.83 | 2.338 · 1.916 · 1.83 · 1.646 · 1.473 | 2.26–2.26 | statements 21, vm_steps 1344, fullscan_steps 0, sorts 0, returned_rows 128 |
| read | 1.754 | 1.779 · 1.712 · 1.754 · 1.572 · 1.97 | 2.26–2.26 | statements 20, vm_steps 1314, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_small | 1.683 | 2.049 · 1.683 · 1.329 · 1.405 · 1.882 | 2.26–2.26 | statements 20, vm_steps 1323, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_largest | 6.194 | 6.416 · 6.194 · 6.441 · 5.828 · 5.882 | 2.26–2.26 | statements 97, vm_steps 14990, fullscan_steps 0, sorts 0, returned_rows 1472 |
| grep_scoped | 1.884 | 2.4 · 2.081 · 1.615 · 1.342 · 1.884 | 2.26–2.26 | statements 25, vm_steps 1469, fullscan_steps 0, sorts 0, returned_rows 136 |
| glob_scoped | 1.819 | 1.747 · 1.501 · 1.856 · 1.858 · 1.819 | 2.26–2.26 | statements 19, vm_steps 1302, fullscan_steps 0, sorts 0, returned_rows 126 |
| grep_tree | 3903.454 | 4297.975 · 3903.454 · 3912.915 · 3835.921 · 3871.954 | 2.18–2.24 | statements 42193, vm_steps 3452413, fullscan_steps 0, sorts 0, returned_rows 355935 |
| glob_tree | 9.556 | 10.803 · 9.224 · 9.404 · 9.556 · 9.811 | 2.18–2.18 | statements 212, vm_steps 24000, fullscan_steps 0, sorts 0, returned_rows 2400 |
| diff_files | 6.953 | 7.659 · 6.965 · 6.749 · 6.817 · 6.953 | 2.18–2.18 | statements 102, vm_steps 7768, fullscan_steps 0, sorts 0, returned_rows 762 |
| list_commits | 1.164 | 1.977 · 1.259 · 1.164 · 1.107 · 0.776 | 2.18–2.18 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.117 | 3.693 · 3.117 · 3.126 · 2.746 · 2.557 | 2.18–2.18 | statements 58, vm_steps 2467, fullscan_steps 0, sorts 0, returned_rows 263 |
| fork | 0.612 | 0.625 · 2.98 · 0.612 · 0.434 · 0.522 | 2.18–2.18 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 34.761 | 34.761 · 35.946 · 35.404 · 33.755 · 33.814 | 2.18–2.18 | statements 529, vm_steps 29342, fullscan_steps 4, sorts 8, returned_rows 2191 |
| oneshot_mount_unmount | 17.402 | 17.402 · 18.745 · 17.551 · 16.297 · 15.136 | 2.18–2.18 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 65.75 | 74.104 · 66.559 · 64.234 · 62.278 · 65.75 | 2.18–2.18 | statements 165, vm_steps 10081, fullscan_steps 80, sorts 2, returned_rows 966 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.18–2.18 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 367.9 s** (tooling): play 120.7 · consolidate 110.3 · verify 106.0 · probes 20.8 · tests 0.0 · seal + snapshot 0.0 · report 10.1

367.88 s tooling: prepare 1.62 · play 119.04 · consolidate 110.26 · verify 97.17 (diff_commits) · version walk 8.87 · probes 20.85 · metrics 1.15 · Store allocation 0.28 · report 0.23

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T14:53:15.420Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 17.24× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.828; Counters: glob_tree.vm_steps per tree file: depth exponent 0.424; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection: 1.05; Node proofs: 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 |

### G. Evidence

- `~/lfs-history/metrics/range-018.a1.json`
- trace `~/lfs-history/runs/p3-main-g/trace/range-018.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-g/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r018-2-packages-core | 966 | 195.7 KiB |
| r018-3-examples-acp-agent | 894 | 198.0 KiB |
| r018-1-root | 548 | 192.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 346.0 | 1,603 |
| `git diff --stat` | 44.0 | 1,592 |
| `git add -f` | 35.0 | — |
| `git rm --cached` | 5.0 | — |
| `git commit` | 41.0 | 1,597 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r018-3-examples-acp-agent | end | P1 | pass | — | — |
| r018-3-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r018-3-examples-acp-agent | end | P3 | pass | 167 bookkeeping path(s) | — |
| r018-3-examples-acp-agent | end | P4 | pass | 99 emitted files, exit 2 | — |
| r018-3-examples-acp-agent | end | P5 | pass | 11 files | — |
| r018-3-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r018-2-packages-core | end | P1 | pass | — | — |
| r018-2-packages-core | end | P2 | pass | exit 0 | — |
| r018-2-packages-core | end | P3 | pass | 167 bookkeeping path(s) | — |
| r018-2-packages-core | end | P4 | pass | 153 emitted files, exit 2 | — |
| r018-2-packages-core | end | P5 | pass | 51 files | — |
| r018-2-packages-core | end | P6 | n/a | not a repair | — |
| r018-1-root | end | P1 | pass | — | — |
| r018-1-root | end | P2 | pass | exit 0 | — |
| r018-1-root | end | P3 | n/a | an install, not a refresh | — |
| r018-1-root | end | P4 | pass | 157 emitted files, exit 2 | — |
| r018-1-root | end | P5 | pass | 31 files | — |
| r018-1-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | stop | P1 pass, P4 stop (2 emitted file(s) differ: packages/core/session/lib/types/tool-pairing.d.ts, packages/core/session/lib/types/tool-pairing.js) | — |

### J. Conflicts by path class

No conflicts by path recorded.
