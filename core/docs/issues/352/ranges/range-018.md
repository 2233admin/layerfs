# Range 018 · **optimize** · attempt 4

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r017 (run p3-main-g)
dsh `0056238bb`..`417248eed` · **67 commits** (11 mainline, 56 side) · 2026-07-07 → 2026-07-18
Areas changed: `examples/acp-agent` 30% · `packages/core` 11% · `/` 6% · other 53%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.24×** · **Churn 0.02**
**Time split:** play 94.4 s · git 118.6 s · Node 170.4 s · verify 95.1 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **552.7 MiB** (+116.4 MiB) | **328.7 MiB** (+63.0 MiB) | **0.59×** (prev 0.61×) | **66.6 MiB** | **1,631** (total 17,442) | **340.1 s** tooling (total 25.5 min) |

**Checks:** 14 pass · 4 watch: Speed branch.diff_commits >64 entries · uncontended: 16.65× baseline (no phase); Counters glob_tree.vm_steps per tree file: depth exponent 0.43; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow); Wall projection 1.02 · 1 optimize/stop: Scaling
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +175% · ▲ metadata added +73% · ▲ probe list_small +57%
**Budget:** 19 of 202 ranges · projected total 17.2 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,669 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,855 / 2,855 outcomes as planned |
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
| lead | repair | `6769d6cfba70` | `null` | n/a | pass | n/a | n/a | pass | pass (115,379 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/compact/compact/tests/tool-pairing.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/stdio-demo/tests/stdio-agent.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/web/tool-web/tests/tool-web.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/core/agent-loop/tests/review-fixes.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/apply.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/load-path.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/example-launch.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/harness.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively).

## 2. Activity

**3,548 calls** · **168 steps** by **8 agents + lead** on **3 Branches + main** · **228 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +188 added · 1,298 modified · −85 deleted · 20.9 MiB written · fs 1,446 : Sandbox 125 (**12 : 1**, reported only in P3)
**Execs:** 658 (JS 52 · shell 606) · 3 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,830 | 1,460 | 370 | Committed 1,460 · Text 43 · NoSuchPath 9 |
| sandbox | 1,343 | 883 | 4 | commit 225 (Committed 185, UpToDate 39, Conflict 1) · exec 658 (exit:0 655, exit:2 3) · mount 228 (Mounted 228) · status 4 · unmount 228 (Unmounted 228) |
| branch | 365 | 32 | 333 | diff_branches 15 · diff_commits 318 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,548** | **2,375** | **717** |  |

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


**Execs by tool:** git 126 · pnpm 1 · tsc 4 · vitest 4 · other 523

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
| **lead repair** | 1 | — | 1 | — | — | 115,379 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r017) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 436.3 MiB (10.7 MiB / 396.6 MiB / 11.7 MiB / 17.3 MiB) | 552.7 MiB (11.4 MiB / 509.1 MiB / 12.0 MiB / 20.1 MiB) | +116.4 MiB |
| Version figures from | — | full: first (no manifest for range 17) | — |
| Files / directories / symlinks | 41,546 / 6,995 / 2,729 | 49,771 / 8,447 / 3,180 | +8,225 / +1,452 / +451 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 265.7 MiB | 328.7 MiB | +63.0 MiB |
| **Space amplification** (total · tracked) | 0.61× · tracked 3.29× | 0.59× · tracked 3.35× | -0.01 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **10.27** (0.36 / 0.03 / 0.13) | 5.43× the median range |
| **Stored per Commit** | 21.4 KiB | 39.4 KiB | — |
| Metadata share | 0.35 | 0.34 | this range 0.29 |
| History: Commits / Layers / Branches | 15,811 | 17,442 / 10 / 67 | +1,631 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 14.59 GiB (Commits 13.08 GiB · installs 1.07 GiB · build 117.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.26 GiB / 36% | — |
| Snapshot | — | r018, 296.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 217.1 MiB | 0.39 | +43.6 MiB |
| Metadata | 29.3 MiB | 0.05 | +3.6 MiB |
| Index rows | 62.5 MiB | 0.11 | +13.4 MiB |
| Waste | 19.4 MiB | 0.04 | +2.3 MiB |
| Other | 412.0 KiB | 0.00 | +80.0 KiB |
| **Total = Store on disk** | **328.7 MiB** | **= 0.59** space amplification | +63.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 11.4 MiB | 38.3 MiB (16.8 MiB + 21.6 MiB) | 3.35× | — | 3.0 MiB | 6.5 MiB | 0.47 |
| `node_modules` | 509.1 MiB | 133.7 MiB (129.6 MiB + 4.1 MiB) | 0.26× | — | 27.3 MiB | 112.6 MiB | 0.24 |
| Build output | 12.0 MiB | 4.0 MiB (3.9 MiB + 130.1 KiB) | 0.33× | — | 515.1 KiB | 2.4 MiB | 0.21 |
| `.git` | 20.1 MiB | 69.7 MiB (66.9 MiB + 2.9 MiB) | 3.48× | — | 16.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 82.3 MiB | — (not divided) | — | 15.8 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 670.1 KiB | — | — | — | — | — |
| **Total** | — | **328.7 MiB** | **= 0.59×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 69,075 | +11,212 | 5.9 KiB | 47,423 (derived) | 55% |
| Chunks (large files) | 30,048 | +4,203 | 12.1 KiB | — | 2% |
| Large-file extents | 12,191 | — | 0.2 KiB | — | — |
| Directories | 53,475 | 5,401 (with inodes, pooled) | 0.2 KiB | — | 56% |
| Inodes and attributes | 103,124 | ↑ pooled | 2.1 KiB | — | — |
| Symlinks | 1,880 | +3,652 | 0.1 KiB | — | — |

Delta: 1.4% at depth cap · 26% of refused bases stopped by budget · `node_modules` reinstall: 0.007× the raw bytes of 229 changed packages (ratio: 784209 new stored for 117917290 raw)

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
| 9.4 ms / 23.5 ms (1.32×) | 2.6 ms / 5.7 ms (1.39×) | 3.6 ms / 8.1 ms (1.99×) | 24.7 ms / 80.6 ms (1.32×) | 11.0 ms / 16.7 ms (1.18×) | 2933 ms / 2933 ms (5.76×) | — (native comparison in P3; exec 42.8 ms / 909 ms) |
| SQL p50: 165 stmts | 53 stmts | 71 stmts | 222 stmts | 45 stmts | 168,793 stmts | — |

**Commit cost:** 18.20 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 664 ms p50 over 228
**Slowest:** sandbox.exec 34385 ms · sandbox.exec 26147 ms · sandbox.exec 22877 ms · checkpoint diff_commits 1.36 ms and 17.28 statements per entry (58,681 entries per page)
**Scaling:** 4 of 15 probes flat · `stat` 0.56 · `read` 0.17 · `list_small` 1.10 · `list_largest` 0.88 · `grep_tree` 1.08 · `glob_tree` 1.34 · `diff_files` 0.56 · `list_commits` 0.27 · `diff_commits` 0.46 · `fork` 2.89 · `merge` 0.46

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 354 ms / 354 ms | — / — | — | git / status-cold: — |
| git status (steady) | 327 ms / 533 ms | — / — | — | git / status-steady: — |
| git add | 30.0 ms / 110 ms | — / — | — | git / add: — |
| git commit (lane) | 35.0 ms / 94.0 ms | — / — | — | git / commit: — |
| lead writes main | 5538 ms / 5538 ms | — / — | — | — |
| repack | 4080 ms / 4080 ms | — / — | — | — |
| pnpm install (incremental) | 5136 ms / 5136 ms | 1635 ms / 1635 ms | 3.14× | pnpm-reinstall / cold: — |
| pnpm refresh | 1934 ms / 1934 ms | 994 ms / 994 ms | 1.95× | pnpm-reinstall / steady: — |
| tsc -b | 6128 ms / 6128 ms | 3373 ms / 4009 ms | 1.82× | tsc-b / cold: — |
| vitest | 8229 ms / 8229 ms | 5553 ms / 5553 ms | 1.48× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.4 ms / 20.5 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a4 | 17442 | 328.7 | 7.64 (1.29×) · 6926 · 303 (13 solo) | 8.50 (1.37×) · 6672 · 291 (125 solo) | 9.24 (1.27×) · 7387 · 349 (134 solo) | 2.50 (1.26×) · 3600 · — (0 solo) | 10.84 (1.19×) · 1337 · — (daemon) | 10.21 (1.22×) · 5170 · — (daemon) | 2932.91 (—×) · 15044678 · 26582 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 12392 → 4194304 B · fs.write ≤8 KiB 4152992 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4152992 → 4194304 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 9.64 at the first command → 10.08 after the last (max 10.64 over 6 commands) · Docker VM 1.76 → 3.39

**Control probe** (one sample per arm, same window and binaries; (a) the range 15 Store, (b) the range's). Gap: each clone is copied just before its arm, which warms the OS cache equally in both, so the control cannot see a cold-read effect of a larger Store (storage reads are 0 in both arms); it compares warm-cache work only.

| Sample | (a) Commits · MiB | (b) Commits · MiB | fs.write ≤1 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.write ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.read ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | Host load (macOS) | Watch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| control-017.diag-15v17 | 12851 · 207.8 | 15811 · 265.7 | failed: (a) 0 of ? calls ok, (b) 0 ok | failed: (a) 0 of ? calls ok, (b) 0 ok | 2.79 (1.00× first) / 2.43 · 0.87× · 73/57 | 9.15 → 9.53 | not judged (failed calls) |
| control-017.diag-15v17-2 | 12851 · 207.8 | 15811 · 265.7 | 6.21 (1.00× first) / 6.63 · 1.07× · 114/112 | 6.39 (1.00× first) / 6.40 · 1.00× · 109/110 | 2.59 (0.93× first) / 2.32 · 0.89× · 73/57 | 11.39 → 10.96 | pass |
| control-018.a1 | 12851 · 207.8 | 17442 · 328.3 | 6.63 (1.07× first) / 7.01 · 1.06× · 113/112 | 6.46 (1.01× first) / 6.41 · 0.99× · 108/108 | 2.74 (0.98× first) / 2.53 · 0.92× · 73/70 | 10.05 → 10.05 | pass |
| control-018.a2 | 12851 · 207.8 | 17442 · 328.4 | 6.23 (1.00× first) / 6.62 · 1.06× · 116/111 | 6.37 (1.00× first) / 6.24 · 0.98× · 110/109 | 2.41 (0.86× first) / 2.35 · 0.97× · 73/67 | 9.83 → 9.69 | pass |
| control-018.a3 | 12851 · 207.8 | 17442 · 328.3 | 6.67 (1.08× first) / 6.47 · 0.97× · 109/111 | 6.72 (1.05× first) / 6.49 · 0.97× · 109/109 | 2.73 (0.98× first) / 2.61 · 0.96× · 73/70 | 8.25 → 8.25 | pass |
| control-018.a4 | 12851 · 207.8 | 17442 · 328.7 | 6.53 (1.05× first) / 6.95 · 1.06× · 110/129 | 6.44 (1.01× first) / 6.80 · 1.06× · 109/110 | 2.60 (0.93× first) / 2.89 · 1.11× · 73/71 | 10.05 → 10.29 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-018.a4)

## 5. Findings and action

### Finding 018.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.828 | < 0.15 |
| Node proofs | 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-018.a1.json`.

### Finding 018.a2 · stop

**1. Trigger** (attempt 2, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.724 | < 0.15 |
| Snapshot time | 1997 ms for 299.4 MiB new; size exponent 0.791 | < 0.15 |
| Node proofs | 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-018.a2.json`.

### Finding 018.a3 · stop

**1. Trigger** (attempt 3, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.605 | < 0.15 |
| Node proofs | 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-018.a3.json`.

### Finding 018.a4 · optimize

**1. Trigger** (attempt 4, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.632 | < 0.15 |

Diagnosis pending: `finding-018.a4.json`.

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
- **a2 (`p3-main-h`, fork of `p3-main-g`'s r017 snapshot, harness `a2f4e2eb9f` with fix 042, same binaries): STOP at the repair's P6. The cause is a harness bug in fix 042, not LayerFS.** Checkpoint ok, git ✓ (decision B: the native clean removed 3 files). All three lane points pass P1–P5; the repair passes P2 and P5. Report check F1–F8 PASS.
  - **What happened:** P6 reported the same 2 files as a1. The lanes' merge had failed inside the native container. `cpSync` followed a pnpm link to a folder (`examples/node_modules/@cordisjs/plugin-hmr`) and refused to copy a directory. The failure went to stderr, which the chain reads only when the container fails, so the oracle silently kept the old sequential model (`lanes: []` in its record).
  - **Fix (on fix 042, before a3):**
    - links are copied as links (`readlink`/`symlink`), and files with their mode and times;
    - every merge step reports a failure, and the chain refuses the oracle unless every lane was captured and the merge applied (P6 NOT_RUN, never a wrong oracle);
    - lane chains get a new oracle key, so the bad oracle is never reused;
    - new test: links to folders, restored exactly.
  - **Diagnostic (labelled, not a proof):** with the fix, the native repair chain on a2's state emits `tool-pairing.d.ts` `c233d58c…` and `.js` `042b06c9…`, the same as LayerFS. It took 64 s. Lanes captured 10,276 / 311 / 403 changed paths; 19 paths are two-sided (18 `tsconfig.tsbuildinfo` and `vendor/cordis/bin.js`).
  - **Speed as history grows:**
    - a2 is the first attempt with per-call counters. Solo in-process writes average 268–335 read syscalls per call; the harness's own reads in the same process land in them, so the control probe is the clean measure.
    - `control-018.a2`: (b)/(a) 1.06× / 0.98× / 0.98×, reads per call equal. Watch row pass.
    - WAL runs from 12 KiB to 4.0 MiB across the classes (the checkpoint size). macOS load 8.4–10.7.
  - **Against range 15:** stored per Commit 39.2 KiB (60.3); index rows +13.4 MiB for 1,631 Commits, 8.4 KiB per Commit (9.1); content ratio 0.24× (0.29×); churn 0.02 (0.26). Tooling 355.1 s; the final command took 254 s under the 295 s alarm.

- **a3 (`p3-main-i`, fork of `p3-main-g`'s r017 snapshot, harness `029db0950f`, same binaries): STOP at the repair's P6. LayerFS's result is as its merge rule says; the native merge rule differs. Held for the liaison.** Checkpoint ok, git ✓. All three lane points pass P1–P5; the repair passes P1, P2 and P5. Report check F1–F8 PASS.
  - **The lanes' merge now ran whole** (10,276 / 311 / 403 paths captured, 19 two-sided). The `tool-pairing` difference of a1 and a2 is gone.
  - **P4 stops on tsc's exit:** LayerFS's repair build exits 0, the native one exits 2. Native tsc reports `TS2694` in `packages/examples/agent-spine-demo/src/index.ts`: `tool-bash`'s `lib/types/index` has no exported `Config`.
  - **Cause, two-sided paths:** `packages/bash/tool-bash/lib/tsconfig.tsbuildinfo` is among the 19 paths both the packages-core and examples lanes wrote.
    - The rule the liaison set (fix 042, test 3) takes the later-merged lane's copy: examples, merge rank 2.
    - The product's `/.lww` (`layerfs-content/src/merge/lww.rs`) takes the newer write. In this play the lanes' end builds finished examples 15:50:16.1, root 15:50:20.409, packages-core 15:50:20.447. So LayerFS kept packages-core's copies.
    - The native folder then held a build-info file from another lane than its outputs, and the repair build failed.
  - **Options to the liaison:**
    - order the native application by the lanes' recorded write times (the newest writer wins, as `/.lww` does);
    - or keep merge order.
  - **Scaling optimize** (checkpoint `diff_commits` ms per entry) is as in a1: flat per entry since r016.
  - **Speed as history grows:** `control-018.a3` (b)/(a) 0.97× / 0.97× / 0.96×, watch row pass. macOS load 8.5–9.8.
  - **Against range 15:** stored per Commit 39.2 KiB (60.3); index rows 8.4 KiB per Commit (9.1); content ratio 0.24× (0.29×); churn 0.02 (0.26). Tooling 321.8 s; the final command took 235 s under the 295 s alarm.

- **a4 (`p3-main-j`, fork of `p3-main-g`'s r017 snapshot, harness `e1ff6b0c1f`, daemon `44ac6c91`, addon `77597adb`): OPTIMIZE, terminal: advanced on optimize: #364 item 4. The only optimize row is the checkpoint `diff_commits` scaling, which the liaison said to leave alone (#364 item 4).** Checkpoint ok, git ✓. Node 17 pass, 0 stop, 0 NOT_RUN over 4 points. Report check F1–F8 PASS.
  - **Repair P6 passes:** P1 pass, P4 pass (418 emitted files, exit 0).
    - The native chain merged the lanes in their recorded write order (owner option 1): examples 16:04:20.221, packages-core 16:04:29.883, root 16:04:30.557.
    - Captures were 403 / 311 / 10,276 paths; 19 two-sided paths are listed in the oracle. The chain took 73.9 s.
    - A labelled diagnostic on a3's recorded state with the same rule gave the same: exit 0, 418 equal files.
  - **Scaling optimize:** checkpoint `diff_commits` ms per entry against tree files, exponent 11.6. It is flat per entry since r016 (1.31 / 1.50 / 1.39 ms, 16.6 / 17.1 / 17.3 statements); facts went to #364 item 4. No gate change.
  - **Watch:**
    - `diff_commits` 16.65× is verify's relink-over-relink diff;
    - `glob_tree` VM steps per tree file, exponent 0.43;
    - wall projection 1.02;
    - `branch.merge` p50 2,933 ms at 168,793 statements. This is the merge of the root lane's 229-package reinstall: r015's merge with an install was 1,897 ms at 106,913 statements; r017's, with none, 918 ms. Not judged rising.
  - **Speed as history grows:** `control-018.a4` (b)/(a) 1.06× / 1.06× / 1.11×; read syscalls per call ×1.17 / 1.01 / 0.97. Watch row pass. macOS load 10.1–10.3.
  - **Against range 15:**
    - Method p50 ratios: write 1.32× (r015 0.99×), read 1.39× (1.11×), list 1.99× (1.32×), Commit 1.32× (1.21×), mount 1.18× (0.99×). Statements per call are flat (write 165 against 164).
    - Stored per Commit 39.4 KiB (60.3). `node_modules` grew 396.6 → 509.1 MiB from 229 changed packages; Reinstall 0.007× (pass).
    - Index rows +13.4 MiB for 1,631 Commits, 8.4 KiB per Commit (9.1).
    - Content ratio 0.24× (0.29×); churn 0.02 (0.26).
    - Tooling 340.1 s; the final command took 239 s under the 295 s alarm.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2855/2855; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 16.65× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.632 | < 0.15 | optimize |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.43 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.292 | < 0.5 | pass |
| Reinstall growth | 0.007× the raw bytes of 229 changed packages (ratio: 784209 new stored for 117917290 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.014 (budget 0.2645) | < 0.1 | pass |
| Range growth | 66.6 MiB, 1.68× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 1279 ms for 296.7 MiB new; size exponent -0.257 | < 0.15 | pass |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 1.02 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 150 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
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
| Workspaces (one-shot share) | 228 (0.99) | 90 (0.978) |
| Reads | 323 | 323 |
| Reconcile writes | 297 | 297 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 4). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 15 | 17.63 | 292.24 | 292.24 | 788.62 | 1.15× | 5.83× | 0.90 | 1.37 | 214 / 22,736 / 0 | — | 0.0744 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 313 | 289.17 | 329.85 | 370.91 | 481.46 | 16.65× | 12.88× | 9.85 | 13.85 | 3,716 / 570,708 / 0 | — | 1.506 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.62 | 1.31 | 1.31 | 1.79 | 0.89× | 0.96× | -1.38 | -1.97 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 1.14 | 1.14 | 1.14 | 1.43 | no baseline | no baseline | 1.17 | 1.64 | 70 / 1,298 / 0 | — | 0.0572 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 2932.91 | 2932.91 | 2932.91 | 3115.28 | 5.76× | 5.76× | 0.61 | 0.64 | 168,793 / 15,044,678 / 23,359 | — | 12.8731 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.27 | 4.27 | 4.27 | 4.27 | 1.55× | 1.55× | 0.42 | 0.62 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 47.62 | 47.62 | 47.62 | 47.62 | 2.50× | 2.50× | 1.03 | 1.45 | 162 / 22,557 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 5 | 29.97 | 44.34 | 44.34 | 81.71 | 3.44× | 3.74× | 2 | 2.59 | 724 / 72,896 / 8,191 | — | 0.1242 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 7 | 8.65 | 10.74 | 10.74 | 14.53 | 1.34× | 1.53× | 1.07 | 1.47 | 147 / 7,405 / 0 | — | 0.0195 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 11 | 20.39 | 31.17 | 31.17 | 39.66 | 2.29× | 2.39× | -0.56 | -0.90 | 337 / 19,843 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 8 | 8.25 | 9.00 | 9.00 | 10.57 | 1.23× | 0.97× | -0.96 | -1.39 | 124 / 5,654 / 0 | — | 0.0003 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 38 | 13.33 | 31.38 | 39.04 | 86.85 | 1.57× | 2.12× | -0.40 | -0.38 | 316 / 22,173 / 0 | — | 0.0041 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 34 | 7.48 | 14.58 | 19.17 | 74.46 | 1.06× | 1.48× | 0.58 | 0.85 | 114 / 4,816 / 0 | — | 0.0019 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 3.52 | 3.52 | 3.52 | 6.94 | 0.63× | 0.56× | -0.67 | -0.64 | 79 / 4,479 / 0 | — | 0.0249 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 10 | 6.90 | 10.47 | 10.47 | 11.18 | 1.28× | 1.41× | 1.50 | 2.09 | 140 / 8,920 / 0 | — | 0.0351 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 11 | 10.36 | 15.98 | 15.98 | 20.00 | 1.68× | 2.25× | 1.66 | 2.30 | 182 / 9,691 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 17 | 9.67 | 13.31 | 13.31 | 14.78 | 1.45× | 1.86× | 2.05 | 2.76 | 184 / 10,987 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 7.33 | 7.33 | 7.33 | 8.99 | 1.38× | 1.06× | 0.84 | 1.22 | 170 / 12,270 / 0 | — | 0.0012 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 5.73 | 6.70 | 6.70 | 7.31 | 1.08× | 1.10× | 0.88 | 1.32 | 144 / 7,485 / 0 | — | 0.0013 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 1 | 7.93 | 7.93 | 7.93 | 7.93 | 3.50× | 3.31× | 1.58 | 2.15 | 184 / 15,089 / 0 | — | 0.3775 ms per file | — |
| fs.glob | 17–64 files · uncontended | 13 | 6.24 | 7.32 | 7.32 | 7.53 | 3.23× | 2.80× | 1.07 | 1.50 | 110 / 14,157 / 0 | — | 0.1971 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 2.37 | 2.37 | 2.37 | 2.37 | 1.70× | 1.70× | — | — | 106 / 6,194 / 0 | — | 0.5933 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 2.12 | 2.17 | 2.17 | 4.28 | 1.41× | 1.09× | -0.02 | 0.00 | 39 / 3,359 / 0 | — | 1.018 ms per file | — |
| fs.glob | 5–16 files · contended | 6 | 2.28 | 3.77 | 3.77 | 5.46 | 1.76× | 2.67× | 0.47 | 0.98 | 68 / 5,323 / 0 | — | 0.3254 ms per file | — |
| fs.glob | 5–16 files · uncontended | 11 | 2.57 | 5.09 | 5.09 | 8.18 | 1.33× | 2.20× | 0.49 | 0.72 | 59 / 5,463 / 0 | — | 0.4514 ms per file | — |
| fs.glob | >64 files · contended | 8 | 6.29 | 7.33 | 7.33 | 18.86 | 1.52× | 1.78× | -2.14 | -2.56 | 99 / 10,405 / 0 | — | 0.0243 ms per file | — |
| fs.glob | >64 files · uncontended | 4 | 8.77 | 10.88 | 10.88 | 20.66 | 1.68× | 1.42× | 0.62 | 0.99 | 168 / 15,628 / 0 | — | 0.0243 ms per file | — |
| fs.grep | 17–64 files · contended | 5 | 18.12 | 18.45 | 18.45 | 20.27 | 3.35× | 3.41× | 2.60 | 3.43 | 385 / 24,572 / 0 | — | 0.5358 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 12 | 16.50 | 19.82 | 19.82 | 19.94 | 4.58× | 4.57× | 2.13 | 2.91 | 359 / 18,493 / 0 | — | 0.376 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 3.93 | 3.93 | 3.93 | 4.14 | 1.68× | 1.37× | 0.71 | 1.04 | 72 / 5,324 / 0 | — | 1.6465 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 2.18 | 4.58 | 4.58 | 5.12 | 1.15× | 1.32× | -0.47 | -0.52 | 53 / 3,409 / 0 | — | 1.092 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 7 | 5.98 | 12.34 | 12.34 | 16.77 | 2.50× | 2.91× | 2.10 | 3.09 | 226 / 9,894 / 0 | — | 0.6796 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 13 | 5.23 | 11.65 | 11.65 | 13.86 | 1.66× | 3.39× | 0.90 | 1.23 | 114 / 5,569 / 0 | — | 0.5995 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 8 | 28.55 | 46.50 | 46.50 | 104.77 | 1.87× | 3.04× | 0.54 | 0.85 | 602 / 26,965 / 0 | — | 0.0924 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 6 | 24.30 | 45.12 | 45.12 | 49.60 | 2.11× | 2.87× | -0.74 | -0.89 | 555 / 30,255 / 0 | — | 0.0907 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 3 | 2.06 | 2.06 | 2.06 | 5.99 | 1.22× | 1.22× | -2.12 | -3.24 | 41 / 3,556 / 0 | — | 2.061 ms per entrie | — |
| fs.list | 17–64 entries · contended | 10 | 6.17 | 9.49 | 9.49 | 9.79 | 3.44× | 4.55× | 2.29 | 3.10 | 124 / 11,727 / 0 | — | 0.1994 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 18 | 4.79 | 7.68 | 7.68 | 8.07 | 1.99× | 3.06× | 1.19 | 1.65 | 81 / 8,519 / 0 | — | 0.1763 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 3.03 | 3.03 | 3.03 | 3.30 | 1.50× | 1.50× | 0.94 | 1.34 | 50 / 4,439 / 0 | — | 1.0987 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 9 | 1.91 | 3.35 | 3.35 | 3.58 | 1.07× | 1.42× | -0.20 | -0.25 | 41 / 3,945 / 0 | — | 0.826 ms per entrie | — |
| fs.list | 5–16 entries · contended | 5 | 3.56 | 3.93 | 3.93 | 5.02 | 1.82× | 1.59× | 2.13 | 2.95 | 58 / 5,323 / 0 | — | 0.4369 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 13 | 2.14 | 3.35 | 3.35 | 3.55 | 1.32× | 1.64× | 0.28 | 0.50 | 48 / 4,071 / 0 | — | 0.3428 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 2 | 6.59 | 6.59 | 6.59 | 7.72 | 3.83× | 3.83× | — | — | 55 / 4,379 / 0 | — | 0.0082 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 2 | 1.27 | 1.27 | 1.27 | 2.21 | 1.07× | 1.07× | -6.34 | -9.72 | 31 / 1,688 / 0 | — | 0.004 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 2 | 3.30 | 3.30 | 3.30 | 4.84 | no baseline | no baseline | — | — | 47 / 3,425 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 3.22 | 3.74 | 3.74 | 3.88 | 1.42× | 1.65× | 0.41 | 0.44 | 57 / 4,176 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 11 | 3.13 | 3.94 | 3.94 | 4.65 | 1.58× | 1.67× | 1.12 | 1.54 | 69 / 4,071 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 33 | 2.50 | 4.79 | 5.65 | 6.36 | 1.39× | 1.67× | 0.88 | 1.25 | 50 / 3,600 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 14 | 16.09 | 31.26 | 31.26 | 37.62 | 2.01× | 2.32× | 0.70 | 0.83 | 326 / 59,574 / 2 | — | 16.088 ms per file | commit |
| fs.rm | 1 files · uncontended | 71 | 9.59 | 13.54 | 33.35 | 38.26 | 1.43× | 1.28× | 1.51 | 2.09 | 156 / 8,450 / 0 | — | 9.593 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 2.10 | 2.10 | 2.10 | 2.10 | 1.47× | 1.47× | 1.03 | 1.67 | 45 / 3,532 / 0 | — | 0.0023 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 1 | 1.60 | 1.60 | 1.60 | 1.60 | 0.98× | 0.83× | 0.38 | 0.71 | 44 / 3,548 / 0 | — | 0.0019 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 1.67 | 1.67 | 1.67 | 1.67 | no baseline | no baseline | — | — | 38 / 3,199 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.07 | 2.07 | 2.07 | 2.07 | 1.75× | 1.75× | — | — | 42 / 3,282 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 9 | 4.02 | 7.17 | 7.17 | 7.49 | 2.34× | 3.77× | 1.77 | 2.47 | 49 / 4,472 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 22 | 2.35 | 3.11 | 3.40 | 3.68 | 1.34× | 1.51× | 0.20 | 0.25 | 44 / 3,723 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 5 | 2.04 | 2.67 | 2.67 | 3.08 | 1.46× | 1.18× | -0.35 | -0.46 | 36 / 2,503 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 11 | 2.32 | 3.19 | 3.19 | 4.38 | 1.55× | 1.46× | 1.03 | 1.40 | 44 / 3,391 / 0 | — | 0.0008 ms per byte | — |
| fs.write | ≤1 KiB · contended | 33 | 11.87 | 24.62 | 24.82 | 27.93 | 1.62× | 1.82× | 1.89 | 2.76 | 292 / 16,339 / 0 | — | 0.0151 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 99 | 7.64 | 13.29 | 19.82 | 24.23 | 1.30× | 1.47× | 1.09 | 1.56 | 139 / 6,926 / 0 | — | 0.0101 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 8 | 13.96 | 16.03 | 16.03 | 16.26 | 1.26× | 1.08× | 0.79 | 1.11 | 297 / 17,076 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 13 | 11.44 | 15.39 | 15.39 | 16.40 | 1.23× | 1.62× | 0.58 | 0.77 | 160 / 6,652 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 167 | 15.22 | 37.63 | 71.11 | 100.57 | 1.64× | 2.36× | 1.52 | 2.09 | 335 / 18,461 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 427 | 9.24 | 15.15 | 20.38 | 44.53 | 1.32× | 1.55× | 0.88 | 1.23 | 161 / 7,387 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 143 | 13.27 | 33.08 | 70.57 | 111.05 | 1.55× | 2.01× | 1.36 | 1.96 | 301 / 16,870 / 0 | — | 0.0039 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 369 | 8.50 | 15.32 | 23.06 | 38.40 | 1.35× | 1.49× | 1.15 | 1.61 | 150 / 6,672 / 0 | — | 0.0028 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.50 | 0.50 | 0.50 | 0.50 | 0.85× | 0.85× | -0.89 | -1.13 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 39 | 34.00 | 74.16 | 80.57 | 83.33 | 1.49× | 1.77× | -0.20 | -0.26 | 395 / 38,575 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 81 | 30.07 | 71.68 | 110.99 | 283.45 | 1.32× | 1.83× | 0.31 | 0.40 | 301 / 33,970 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 11 | 3.64 | 4.81 | 4.81 | 4.81 | 1.12× | 1.15× | 0.48 | 0.73 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 28 | 3.76 | 5.87 | 6.08 | 7.38 | 1.13× | 1.26× | 0.45 | 0.66 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 5 | 11.54 | 21.14 | 21.14 | 25.70 | 1.34× | 1.24× | 0.90 | 1.36 | 160 / 6,321 / 0 | — | 11.542 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 19 | 10.21 | 14.82 | 14.82 | 54.02 | 1.34× | 1.42× | 0.71 | 0.97 | 117 / 5,170 / 0 | — | 10.205 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 1391.26 | 1391.26 | 1391.26 | 1391.26 | 27.66× | 27.66× | 4.26 | 5.37 | 28,687 / 1,900,683 / 0 | — | 1391.256 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 7 | 29.97 | 36.16 | 36.16 | 46.25 | 1.96× | 1.72× | 2.36 | 3.02 | 343 / 19,722 / 2 | — | 11.5635 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 7 | 13.11 | 15.30 | 15.30 | 21.81 | 1.32× | 1.37× | -0.34 | -0.47 | 178 / 8,690 / 0 | — | 5.1 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 35.30 | 35.30 | 35.30 | 43.23 | 2.36× | 2.36× | — | — | 463 / 31,587 / 8 | — | 7.0604 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 8 | 19.13 | 34.49 | 34.49 | 64.03 | 1.69× | 3.05× | 0.49 | 0.60 | 227 / 11,302 / 0 | — | 3.084 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 3039.82 | 3039.82 | 3039.82 | 3039.82 | no baseline | no baseline | 1.67 | 0.87 | 21,612 / 2,267,123 / 8,511 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 77.75 | 392.03 | 392.03 | 15367.61 | 1.13× | 5.68× | 1.30 | 1.78 | 845 / 82,523 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 200 | 528.29 | 929.74 | 1711.68 | 2006.03 | 13.04× | 2.68× | 9.30 | 12.27 | 0 / 0 / 0 | 2,447 | — | — |
| sandbox.exec | 0 files · uncontended | 170 | 35.33 | 584.51 | 949.16 | 6817.36 | 1.30× | 2.27× | 0.12 | 0.16 | — | 2456.30 | — | — |
| sandbox.exec | 1 files · contended | 26 | 40.36 | 52.62 | 56.59 | 77.31 | 1.28× | 0.89× | 1.02 | 1.43 | — | 5 | 40.362 ms per file | — |
| sandbox.exec | 1 files · uncontended | 61 | 37.61 | 66.58 | 101.41 | 103.22 | 1.24× | 1.13× | 0.29 | 0.42 | — | 5.30 | 37.611 ms per file | — |
| sandbox.exec | 17–64 files · contended | 7 | 82.86 | 89.53 | 89.53 | 131.18 | 1.29× | 1.39× | 2.29 | 3.01 | — | 100 | 4.1432 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 3 | 73.49 | 73.49 | 73.49 | 99.79 | 1.07× | 1.06× | 0.27 | 0.39 | — | 92 | 3.6747 ms per file | — |
| sandbox.exec | 2–4 files · contended | 43 | 42.81 | 64.92 | 70.98 | 73.12 | 1.13× | 1.04× | 1.11 | 1.59 | — | 10.30 | 14.7828 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 22 | 37.20 | 57.81 | 70.25 | 84.08 | 1.13× | 1.10× | 0.83 | 1.20 | — | 10 | 11.3417 ms per file | — |
| sandbox.exec | 5–16 files · contended | 39 | 42.29 | 67.14 | 70.25 | 70.37 | 0.81× | 1.15× | 0.40 | 0.76 | — | 13.40 | 7.4459 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 37 | 47.03 | 90.06 | 111.87 | 141.82 | 0.90× | 1.25× | 0.97 | 1.48 | — | 16 | 6.9273 ms per file | — |
| sandbox.exec | — · contended | 15 | 2288.13 | 22877.20 | 22877.20 | 26147.49 | no baseline | no baseline | 1.08 | 1.56 | — | 30789.20 | — | — |
| sandbox.exec | — · uncontended | 25 | 158.98 | 12834.73 | 22623.42 | 34385.28 | 0.32× | 2.69× | -2.13 | -3.07 | — | 27486.70 | — | — |
| sandbox.mount | — · contended | 79 | 11.51 | 17.76 | 31.80 | 36.02 | 1.15× | 1.15× | 0.59 | 0.87 | 52 / 1,556 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 139 | 10.84 | 16.73 | 20.67 | 52.34 | 1.18× | 1.21× | 0.65 | 0.90 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.81 | 8.43 | 8.43 | 29.21 | no baseline | no baseline | -0.75 | -1.11 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 62 | 11.57 | 19.21 | 23.02 | 23.33 | 1.39× | 1.56× | 1.07 | 1.54 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 156 | 11.73 | 21.03 | 87.52 | 115.19 | 1.29× | 1.51× | 1.01 | 1.38 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 15 | 0.0 KiB | 794.1 KiB | 3,522 | ok 15 |
| branch.diff_commits | branch | 318 | 0.0 KiB | 17.1 MiB | 59,270 | ok 318 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
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
| sandbox.exec | sandbox | 658 | 3.4 MiB | 3.3 MiB | 0 | exit:0 655, exit:2 3 |
| sandbox.mount | sandbox | 228 | 0.0 KiB | 0.0 KiB | 0 | Mounted 228 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 228 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 228 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 1.76 · end 3.39.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.751 | 2.859 · 1.659 · 1.751 · 1.573 · 1.914 | 3.44–3.44 | statements 21, vm_steps 1352, fullscan_steps 0, sorts 0, returned_rows 128 |
| read | 1.705 | 1.395 · 1.705 · 2.036 · 1.905 · 1.631 | 3.44–3.44 | statements 20, vm_steps 1322, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_small | 2.215 | 1.919 · 1.834 · 5.653 · 5.02 · 2.215 | 3.44–3.44 | statements 20, vm_steps 1331, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_largest | 6.043 | 8.277 · 6.033 · 6.339 · 5.759 · 6.043 | 3.44–3.44 | statements 97, vm_steps 14886, fullscan_steps 0, sorts 0, returned_rows 1452 |
| grep_scoped | 1.516 | 2.062 · 1.648 · 1.36 · 1.408 · 1.516 | 3.44–3.44 | statements 25, vm_steps 1477, fullscan_steps 0, sorts 0, returned_rows 136 |
| glob_scoped | 1.273 | 2.019 · 1.576 · 1.155 · 1.27 · 1.273 | 3.44–3.44 | statements 19, vm_steps 1310, fullscan_steps 0, sorts 0, returned_rows 126 |
| grep_tree | 4053.266 | 4765.28 · 4053.266 · 4094.782 · 4049.839 · 3983.319 | 3.41–3.57 | statements 42528, vm_steps 3547071, fullscan_steps 0, sorts 0, returned_rows 370384 |
| glob_tree | 11.103 | 11.347 · 11.557 · 11.103 · 9.843 · 9.671 | 3.53–3.53 | statements 215, vm_steps 24052, fullscan_steps 0, sorts 0, returned_rows 2417 |
| diff_files | 6.582 | 6.757 · 6.223 · 6.26 · 6.622 · 6.582 | 3.53–3.53 | statements 102, vm_steps 7816, fullscan_steps 0, sorts 0, returned_rows 762 |
| list_commits | 1.034 | 4.788 · 1.192 · 1.034 · 0.914 · 0.667 | 3.53–3.53 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.574 | 4.193 · 2.449 · 3.081 · 2.574 · 2.34 | 3.53–3.53 | statements 58, vm_steps 2475, fullscan_steps 0, sorts 0, returned_rows 263 |
| fork | 0.72 | 0.742 · 1.035 · 0.659 · 0.72 · 0.541 | 3.53–3.53 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 35.804 | 36.226 · 35.804 · 35.943 · 35.056 · 35.084 | 3.65–3.65 | statements 529, vm_steps 29413, fullscan_steps 4, sorts 8, returned_rows 2191 |
| oneshot_mount_unmount | 15.642 | 15.702 · 15.397 · 15.642 · 15.65 · 15.589 | 3.65–3.65 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 67.426 | 71.769 · 72.872 · 62.738 · 67.426 · 62.204 | 3.65–3.65 | statements 165, vm_steps 10113, fullscan_steps 80, sorts 2, returned_rows 966 |
| oneshot_exec | — |  ·  ·  ·  ·  | 3.65–3.65 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r018: 84,144 pages of 4,096 B, 0 free · Commits 17,594 · Branches 294 · Layers 22 · compression 3.99× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 69,075 | 400.8 MiB |
| 2 | 30,048 | 354.7 MiB |
| 3 | 12,169 | 1.9 MiB |
| 4 | 22 | 4.9 KiB |
| 5 | 12,108 | 1.2 MiB |
| 6 | 31,417 | 165.0 MiB |
| 7 | 53,381 | 12.1 MiB |
| 8 | 94 | 27.4 KiB |
| 9 | 27,546 | 43.6 MiB |
| 10 | 19,231 | 2.4 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,880 | 152.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 17,810 | 29.3 MiB |
| 1 | 28,986 | 217.1 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 66,827 | 261.0 MiB | 12.0 MiB |
| inode_value | 8,726 | 34.1 MiB | 892.4 KiB |
| object_location | 3,639 | 14.2 MiB | 1.5 MiB |
| binding_hint | 2,238 | 8.7 MiB | 833.3 KiB |
| commit | 1,368 | 5.3 MiB | 928.5 KiB |
| commit_lineage | 379 | 1.5 MiB | 177.0 KiB |
| commit_runs | 376 | 1.5 MiB | 217.6 KiB |
| commit_identity | 268 | 1.0 MiB | 106.7 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 14 | 56.0 KiB | 13.2 KiB |
| history_meta | 8 | 32.0 KiB | 2.6 KiB |
| sqlite_schema | 6 | 24.0 KiB | 8.0 KiB |
| branch_names | 5 | 20.0 KiB | 4.4 KiB |
| branch_identity | 4 | 16.0 KiB | 4.5 KiB |
| run_merges | 3 | 12.0 KiB | 7.2 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| reach | 1 | 4.0 KiB | 3.1 KiB |

### E. Stage times

**Time 340.1 s** (tooling): play 96.0 · consolidate 102.7 · verify 107.1 · probes 22.0 · tests 0.0 · seal + snapshot 3.7 · report 8.6

340.05 s tooling: prepare 1.54 · play 94.40 · consolidate 102.71 · verify 95.14 (diff_commits + full compareTree) · version walk 11.96 · probes 21.98 · metrics 1.20 · seal 1.29 · sealed figures 1.07 · snapshot copy 1.33 · report 0.24

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T14:53:15.420Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 17.24× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.828; Counters: glob_tree.vm_steps per tree file: depth exponent 0.424; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection: 1.05; Node proofs: 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T15:33:50.574Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 17.17× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.724; Counters: glob_tree.vm_steps per tree file: depth exponent 0.429; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow); Snapshot time: 1997 ms for 299.4 MiB new; size exponent 0.791; Wall projection: 1.04; Node proofs: 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 |
| 3 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T15:48:55.653Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 16.49× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.605; Counters: glob_tree.vm_steps per tree file: depth exponent 0.422; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection: 1.01; Node proofs: 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 |
| 4 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T16:02:47.699Z | optimize | Speed: branch.diff_commits >64 entries · uncontended: 16.65× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.632; Counters: glob_tree.vm_steps per tree file: depth exponent 0.43; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow); Wall projection: 1.02 |

### G. Evidence

- `~/lfs-history/metrics/range-018.a1.json`
- `~/lfs-history/metrics/range-018.a2.json`
- `~/lfs-history/metrics/range-018.a3.json`
- `~/lfs-history/metrics/range-018.a4.json`
- trace `~/lfs-history/runs/p3-main-j/trace/range-018.a4.jsonl` · runner log `~/lfs-history/runs/p3-main-j/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-018.p3-main-j.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r018-2-packages-core | 966 | 195.7 KiB |
| r018-3-examples-acp-agent | 894 | 198.0 KiB |
| r018-1-root | 548 | 192.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 327.0 | 1,603 |
| `git diff --stat` | 38.0 | 1,592 |
| `git add -f` | 30.0 | — |
| `git rm --cached` | 5.0 | — |
| `git commit` | 35.0 | 1,596 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r018-3-examples-acp-agent | end | P1 | pass | — | ✓ |
| r018-3-examples-acp-agent | end | P2 | pass | exit 0 | ✓ |
| r018-3-examples-acp-agent | end | P3 | pass | 167 bookkeeping path(s) | ✓ |
| r018-3-examples-acp-agent | end | P4 | pass | 99 emitted files, exit 2 | ✓ |
| r018-3-examples-acp-agent | end | P5 | pass | 11 files | ✓ |
| r018-3-examples-acp-agent | end | P6 | n/a | not a repair | ✓ |
| r018-2-packages-core | end | P1 | pass | — | ✓ |
| r018-2-packages-core | end | P2 | pass | exit 0 | ✓ |
| r018-2-packages-core | end | P3 | pass | 167 bookkeeping path(s) | ✓ |
| r018-2-packages-core | end | P4 | pass | 153 emitted files, exit 2 | ✓ |
| r018-2-packages-core | end | P5 | pass | 51 files | ✓ |
| r018-2-packages-core | end | P6 | n/a | not a repair | ✓ |
| r018-1-root | end | P1 | pass | — | ✓ |
| r018-1-root | end | P2 | pass | exit 0 | ✓ |
| r018-1-root | end | P3 | n/a | an install, not a refresh | ✓ |
| r018-1-root | end | P4 | pass | 157 emitted files, exit 2 | ✓ |
| r018-1-root | end | P5 | pass | 31 files | ✓ |
| r018-1-root | end | P6 | n/a | not a repair | ✓ |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (418 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
