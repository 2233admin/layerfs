# Range 018 · **stop** · attempt 2

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r017 (run p3-main-g)
dsh `0056238bb`..`417248eed` · **67 commits** (11 mainline, 56 side) · 2026-07-07 → 2026-07-18
Areas changed: `examples/acp-agent` 30% · `packages/core` 11% · `/` 6% · other 53%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 16 pass, 1 stop, 0 NOT_RUN over 4 points) · **Content 0.24×** · **Churn 0.02**
**Time split:** play 95.0 s · git 114.7 s · Node 185.0 s · verify 96.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **552.7 MiB** (+116.4 MiB) | **328.4 MiB** (+62.7 MiB) | **0.59×** (prev 0.61×) | **66.3 MiB** | **1,631** (total 17,442) | **355.1 s** tooling (total 25.8 min) |

**Checks:** 12 pass · 4 watch: Speed branch.diff_commits >64 entries · uncontended: 17.17× baseline (no phase); Counters glob_tree.vm_steps per tree file: depth exponent 0.429; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow); Wall projection 1.04 · 3 optimize/stop: Scaling, Snapshot time, Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +174% · ▲ metadata added +74% · ▲ probe grep_scoped +60%
**Budget:** 19 of 202 ranges · projected total 17.4 h (budget 16.8 h) · disk 36% of budget at range 202

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
| lead | repair | `6769d6cfba70` | `null` | n/a | pass | n/a | n/a | pass | stop (115,375 rewritten) |

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
| **lead repair** | 1 | — | 1 | — | — | 115,375 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r017) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 436.3 MiB (10.7 MiB / 396.6 MiB / 11.7 MiB / 17.3 MiB) | 552.7 MiB (11.4 MiB / 509.1 MiB / 12.0 MiB / 20.1 MiB) | +116.4 MiB |
| Version figures from | — | full: first (no manifest for range 17) | — |
| Files / directories / symlinks | 41,546 / 6,995 / 2,729 | 49,771 / 8,447 / 3,180 | +8,225 / +1,452 / +451 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 265.7 MiB | 328.4 MiB | +62.7 MiB |
| **Space amplification** (total · tracked) | 0.61× · tracked 3.29× | 0.59× · tracked 3.35× | -0.01 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **10.22** (0.36 / 0.03 / 0.13) | 5.41× the median range |
| **Stored per Commit** | 21.4 KiB | 39.2 KiB | — |
| Metadata share | 0.35 | 0.34 | this range 0.29 |
| History: Commits / Layers / Branches | 15,811 | 17,442 / 10 / 67 | +1,631 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 14.53 GiB (Commits 13.03 GiB · installs 1.07 GiB · build 117.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.26 GiB / 36% | — |
| Snapshot | — | r018, 299.4 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 216.7 MiB | 0.39 | +43.2 MiB |
| Metadata | 29.3 MiB | 0.05 | +3.6 MiB |
| Index rows | 62.5 MiB | 0.11 | +13.4 MiB |
| Waste | 19.4 MiB | 0.04 | +2.4 MiB |
| Other | 412.0 KiB | 0.00 | +80.0 KiB |
| **Total = Store on disk** | **328.4 MiB** | **= 0.59** space amplification | +62.7 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 11.4 MiB | 38.3 MiB (16.8 MiB + 21.6 MiB) | 3.35× | — | 3.0 MiB | 6.5 MiB | 0.47 |
| `node_modules` | 509.1 MiB | 133.6 MiB (129.5 MiB + 4.1 MiB) | 0.26× | — | 27.2 MiB | 112.6 MiB | 0.24 |
| Build output | 12.0 MiB | 4.0 MiB (3.9 MiB + 130.6 KiB) | 0.33× | — | 513.3 KiB | 2.4 MiB | 0.21 |
| `.git` | 20.1 MiB | 69.4 MiB (66.5 MiB + 2.9 MiB) | 3.46× | — | 15.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 82.4 MiB | — (not divided) | — | 15.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 669.7 KiB | — | — | — | — | — |
| **Total** | — | **328.4 MiB** | **= 0.59×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 69,075 | +11,144 | 5.9 KiB | 47,491 (derived) | 55% |
| Chunks (large files) | 29,992 | +4,155 | 12.1 KiB | — | 3% |
| Large-file extents | 12,191 | — | 0.2 KiB | — | — |
| Directories | 53,478 | 5,290 (with inodes, pooled) | 0.2 KiB | — | 56% |
| Inodes and attributes | 103,121 | ↑ pooled | 2.1 KiB | — | — |
| Symlinks | 1,880 | +3,652 | 0.1 KiB | — | — |

Delta: 1.4% at depth cap · 25% of refused bases stopped by budget · `node_modules` reinstall: 0.007× the raw bytes of 229 changed packages (ratio: 786233 new stored for 117917290 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.35× (38.3 MiB for 11.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.8 KiB / 5.7 KiB / 10.5 KiB over 269 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.24× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.02 (27.7 MiB stored for 1.27 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.20 (3 lanes × 552.7 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.5 ms / 17.6 ms (1.20×) | 2.4 ms / 4.5 ms (1.22×) | 3.5 ms / 7.7 ms (2.02×) | 24.1 ms / 70.9 ms (1.35×) | 10.7 ms / 16.7 ms (1.14×) | 2872 ms / 2872 ms (5.64×) | — (native comparison in P3; exec 41.9 ms / 836 ms) |
| SQL p50: 162 stmts | 53 stmts | 71 stmts | 224 stmts | 48 stmts | 168,766 stmts | — |

**Commit cost:** 17.65 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 670 ms p50 over 228
**Slowest:** sandbox.exec 42937 ms · sandbox.exec 27221 ms · sandbox.exec 24003 ms · checkpoint diff_commits 1.39 ms and 17.28 statements per entry (58,681 entries per page)
**Scaling:** 4 of 15 probes flat · `stat` 1.05 · `read` 0.32 · `list_small` 0.53 · `list_largest` 1.21 · `grep_scoped` 0.79 · `grep_tree` 1.16 · `glob_tree` 0.98 · `diff_files` 0.61 · `diff_commits` 0.73 · `fork` 1.97 · `merge` 0.42

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 317 ms / 317 ms | — / — | — | git / status-cold: — |
| git status (steady) | 322 ms / 489 ms | — / — | — | git / status-steady: — |
| git add | 30.0 ms / 115 ms | — / — | — | git / add: — |
| git commit (lane) | 36.0 ms / 90.0 ms | — / — | — | git / commit: — |
| lead writes main | 6033 ms / 6033 ms | — / — | — | — |
| repack | 4410 ms / 4410 ms | — / — | — | — |
| pnpm install (incremental) | 5591 ms / 5591 ms | 1635 ms / 1635 ms | 3.42× | pnpm-reinstall / cold: — |
| pnpm refresh | 2012 ms / 2012 ms | 994 ms / 994 ms | 2.02× | pnpm-reinstall / steady: — |
| tsc -b | 5948 ms / 5948 ms | 3373 ms / 4009 ms | 1.76× | tsc-b / cold: — |
| vitest | 8786 ms / 8786 ms | 5553 ms / 5553 ms | 1.58× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.6 ms / 20.6 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a2 | 17442 | 328.4 | 7.69 (1.30×) · 7030 · 308 (13 solo) | 7.65 (1.23×) · 6616 · 268 (125 solo) | 8.44 (1.16×) · 7280 · 335 (134 solo) | 2.19 (1.10×) · 3459 · 21 (1 solo) | 10.49 (1.15×) · 1337 · — (daemon) | 9.81 (1.18×) · 5242 · — (daemon) | 2871.56 (—×) · 15044212 · 26414 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 12392 → 4194304 B · fs.write ≤8 KiB 4173592 → 4194304 B · fs.write ≤64 KiB 4185952 → 4194304 B · fs.read ≤8 KiB 4185952 → 4194304 B · sandbox.mount 4173592 → 4194304 B · sandbox.commit 1 file (Committed) 4185952 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 7.82 at the first command → 10.70 after the last (max 10.70 over 6 commands) · Docker VM 0.16 → 1.49

**Control probe** (one sample per arm, same window and binaries; (a) the range 15 Store, (b) the range's):

| Sample | (a) Commits · MiB | (b) Commits · MiB | fs.write ≤1 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.write ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.read ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | Host load (macOS) | Watch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| control-017.diag-15v17 | 12851 · 207.8 | 15811 · 265.7 | failed: (a) 0 of ? calls ok, (b) 0 ok | failed: (a) 0 of ? calls ok, (b) 0 ok | 2.79 (1.00× first) / 2.43 · 0.87× · 73/57 | 9.15 → 9.53 | not judged (failed calls) |
| control-017.diag-15v17-2 | 12851 · 207.8 | 15811 · 265.7 | 6.21 (1.00× first) / 6.63 · 1.07× · 114/112 | 6.39 (1.00× first) / 6.40 · 1.00× · 109/110 | 2.59 (0.93× first) / 2.32 · 0.89× · 73/57 | 11.39 → 10.96 | pass |
| control-018.a1 | 12851 · 207.8 | 17442 · 328.3 | 6.63 (1.07× first) / 7.01 · 1.06× · 113/112 | 6.46 (1.01× first) / 6.41 · 0.99× · 108/108 | 2.74 (0.98× first) / 2.53 · 0.92× · 73/70 | 10.05 → 10.05 | pass |
| control-018.a2 | 12851 · 207.8 | 17442 · 328.4 | 6.23 (1.00× first) / 6.62 · 1.06× · 116/111 | 6.37 (1.00× first) / 6.24 · 0.98× · 110/109 | 2.41 (0.86× first) / 2.35 · 0.97× · 73/67 | 9.83 → 9.69 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-018.a2)

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


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2855/2855; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 17.17× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.724 | < 0.15 | optimize |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.429 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.294 | < 0.5 | pass |
| Reinstall growth | 0.007× the raw bytes of 229 changed packages (ratio: 786233 new stored for 117917290 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0143 (budget 0.2487) | < 0.1 | pass |
| Range growth | 66.3 MiB, 1.67× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 1997 ms for 299.4 MiB new; size exponent 0.791 | < 0.15 | optimize |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 1.04 | ≤ 1 (p3 budget) | watch |
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
| Workspaces (one-shot share) | 228 (0.99) | 90 (0.978) |
| Reads | 323 | 323 |
| Reconcile writes | 297 | 297 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 15 | 17.45 | 283.26 | 283.26 | 731.30 | 1.14× | 5.65× | 0.88 | 1.33 | 214 / 22,772 / 0 | — | 0.0736 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 313 | 298.10 | 342.13 | 377.83 | 433.00 | 17.17× | 13.36× | 9.94 | 13.96 | 3,715 / 570,089 / 0 | — | 1.5611 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.59 | 0.83 | 0.83 | 1.27 | 0.86× | 0.61× | -1.49 | -2.11 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.84 | 0.84 | 0.84 | 1.19 | no baseline | no baseline | 0.27 | 0.50 | 70 / 1,298 / 0 | — | 0.0419 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 2871.56 | 2871.56 | 2871.56 | 3325.35 | 5.64× | 5.64× | 0.55 | 0.56 | 168,766 / 15,044,212 / 23,359 | — | 13.7411 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.21 | 4.21 | 4.21 | 4.21 | 1.53× | 1.53× | 0.38 | 0.57 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 46.05 | 46.05 | 46.05 | 46.05 | 2.42× | 2.42× | 0.94 | 1.32 | 157 / 22,180 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 6 | 23.63 | 54.84 | 54.84 | 76.57 | 2.71× | 4.62× | 1.31 | 1.72 | 300 / 30,486 / 0 | — | 0.0463 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 6 | 6.69 | 8.53 | 8.53 | 9.01 | 1.04× | 1.22× | 0.33 | 0.53 | 117 / 4,706 / 0 | — | 0.0209 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 8 | 15.08 | 27.29 | 27.29 | 27.41 | 1.69× | 2.09× | -1.58 | -2.23 | 366 / 76,154 / 8,191 | — | 0.001 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 11 | 8.05 | 9.55 | 9.55 | 9.63 | 1.20× | 1.03× | -1.03 | -1.47 | 131 / 5,689 / 0 | — | 0.0003 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 33 | 15.44 | 31.19 | 33.63 | 85.02 | 1.82× | 2.11× | 0.02 | 0.16 | 294 / 27,283 / 0 | — | 0.0042 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 39 | 7.34 | 19.22 | 20.38 | 23.57 | 1.04× | 1.95× | 0.53 | 0.78 | 117 / 4,664 / 0 | — | 0.0022 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 1 | 5.28 | 5.28 | 5.28 | 5.28 | 0.94× | 0.84× | 0.50 | 0.85 | 119 / 7,100 / 0 | — | — | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 11 | 7.87 | 10.64 | 10.64 | 16.28 | 1.46× | 1.44× | 1.88 | 2.57 | 183 / 10,234 / 0 | — | 0.0311 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 10 | 8.74 | 13.70 | 13.70 | 14.81 | 1.42× | 1.93× | 1.17 | 1.68 | 242 / 11,350 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 18 | 7.99 | 12 | 12 | 15.35 | 1.20× | 1.68× | 1.50 | 2.06 | 170 / 9,460 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 6.51 | 6.51 | 6.51 | 6.51 | 1.23× | 0.94× | 0.50 | 0.78 | 197 / 11,579 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 6 | 5.97 | 6.42 | 6.42 | 7.81 | 1.12× | 1.06× | 0.99 | 1.46 | 143 / 7,461 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 3 | 5.70 | 5.70 | 5.70 | 7.54 | 2.52× | 2.38× | 0.63 | 0.94 | 118 / 12,820 / 0 | — | 0.2427 ms per file | — |
| fs.glob | 17–64 files · uncontended | 11 | 5.94 | 6.91 | 6.91 | 6.92 | 3.08× | 2.64× | 0.93 | 1.32 | 106 / 13,993 / 0 | — | 0.1819 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.40 | 2.40 | 2.40 | 3.74 | 1.73× | 1.73× | — | — | 41 / 3,443 / 0 | — | 0.6012 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 3.69 | 3.69 | 3.69 | 4.31 | 2.45× | 1.86× | 1.57 | 2.03 | 42 / 4,137 / 0 | — | 1.2303 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 4.68 | 5.20 | 5.20 | 7.62 | 3.62× | 3.67× | 2.54 | 3.62 | 82 / 12,006 / 0 | — | 0.4761 ms per file | — |
| fs.glob | 5–16 files · uncontended | 12 | 2.73 | 4.44 | 4.44 | 5.28 | 1.41× | 1.92× | 0.67 | 0.94 | 59 / 5,487 / 0 | — | 0.3897 ms per file | — |
| fs.glob | >64 files · contended | 5 | 6.67 | 8.18 | 8.18 | 12.06 | 1.62× | 1.98× | -1.97 | -2.34 | 109 / 13,815 / 0 | — | 0.032 ms per file | — |
| fs.glob | >64 files · uncontended | 7 | 6.13 | 13.15 | 13.15 | 18.10 | 1.17× | 1.72× | -0.41 | -0.32 | 96 / 10,340 / 0 | — | 0.0189 ms per file | — |
| fs.grep | 17–64 files · contended | 4 | 19.27 | 22.66 | 22.66 | 25.77 | 3.56× | 4.19× | 2.78 | 3.65 | 429 / 18,531 / 0 | — | 0.3636 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 13 | 15.65 | 18.24 | 18.24 | 20.18 | 4.34× | 4.21× | 1.98 | 2.72 | 335 / 18,411 / 0 | — | 0.4131 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 4.03 | 4.03 | 4.03 | 4.03 | 1.72× | 1.40× | 0.78 | 1.12 | 103 / 6,064 / 0 | — | 1.3423 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 8 | 2.19 | 3.45 | 3.45 | 3.74 | 1.16× | 1.00× | -0.47 | -0.51 | 53 / 3,401 / 0 | — | 1.095 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 7 | 5.86 | 7.84 | 7.84 | 9.67 | 2.45× | 1.85× | 2.04 | 3.02 | 186 / 11,289 / 0 | — | 0.7837 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 13 | 4.97 | 13.10 | 13.10 | 17.43 | 1.58× | 3.81× | 0.75 | 1.04 | 112 / 5,561 / 0 | — | 0.6784 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 7 | 24.91 | 26.34 | 26.34 | 37.02 | 1.63× | 1.72× | 0.15 | 0.35 | 683 / 31,142 / 0 | — | 0.0973 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 45.81 | 46.82 | 46.82 | 50.81 | 3.99× | 2.98× | 1.09 | 1.43 | 939 / 30,283 / 0 | — | 0.0882 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 3 | 1.81 | 1.81 | 1.81 | 2.37 | 1.07× | 1.07× | -2.95 | -4.51 | 41 / 3,556 / 0 | — | 1.806 ms per entrie | — |
| fs.list | 17–64 entries · contended | 7 | 4.66 | 5.87 | 5.87 | 12.04 | 2.60× | 2.81× | 1.48 | 2.07 | 110 / 9,396 / 0 | — | 0.1738 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 21 | 4.87 | 7.69 | 7.69 | 8.11 | 2.02× | 3.06× | 1.23 | 1.71 | 90 / 10,692 / 0 | — | 0.1689 ms per entrie | — |
| fs.list | 2–4 entries · contended | 4 | 2.03 | 2.20 | 2.20 | 2.77 | 1.00× | 1.09× | -0.22 | -0.13 | 39 / 4,102 / 0 | — | 0.7323 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 7 | 2.00 | 2.38 | 2.38 | 2.39 | 1.12× | 1.01× | -0.06 | -0.07 | 46 / 4,215 / 0 | — | 0.7385 ms per entrie | — |
| fs.list | 5–16 entries · contended | 3 | 2.23 | 2.23 | 2.23 | 3.72 | 1.14× | 0.90× | 0.79 | 1.25 | 49 / 4,929 / 0 | — | 0.322 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 15 | 2.34 | 6.09 | 6.09 | 9.46 | 1.44× | 2.97× | 0.53 | 0.82 | 50 / 4,851 / 0 | — | 0.3341 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 4 | 1.88 | 3.28 | 3.28 | 5.17 | 1.58× | 2.75× | -3.88 | -5.95 | 47 / 3,451 / 0 | — | 0.004 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 2 | 3.25 | 3.25 | 3.25 | 3.91 | no baseline | no baseline | — | — | 57 / 4,180 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.35 | 2.52 | 2.52 | 3.47 | 1.04× | 1.11× | -0.49 | -0.70 | 56 / 3,622 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 12 | 2.45 | 4.79 | 4.79 | 5.01 | 1.24× | 2.03× | 0.42 | 0.65 | 68 / 4,100 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 32 | 2.19 | 3.84 | 4.29 | 4.50 | 1.22× | 1.34× | 0.49 | 0.76 | 47 / 3,459 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 11 | 18.68 | 25.81 | 25.81 | 41.34 | 2.33× | 1.92× | 1.13 | 1.38 | 380 / 77,063 / 8,191 | — | 18.68 ms per file | commit |
| fs.rm | 1 files · uncontended | 74 | 9.38 | 14.69 | 31.94 | 36.20 | 1.40× | 1.39× | 1.44 | 2.01 | 156 / 8,485 / 0 | — | 9.383 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 2 | 1.85 | 1.85 | 1.85 | 2.97 | 1.14× | 0.96× | 0.80 | 1.25 | 45 / 3,569 / 0 | — | 0.0022 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 1.87 | 1.87 | 1.87 | 1.87 | no baseline | no baseline | — | — | 38 / 3,207 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 1.71 | 1.71 | 1.71 | 1.71 | 1.44× | 1.44× | — | — | 42 / 3,298 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 9 | 2.38 | 3.45 | 3.45 | 4.60 | 1.39× | 1.82× | 0.26 | 0.56 | 47 / 4,387 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 22 | 2.13 | 2.93 | 3.55 | 3.55 | 1.21× | 1.43× | -0.08 | -0.10 | 44 / 3,591 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 1 | 2.24 | 2.24 | 2.24 | 2.24 | 1.59× | 0.99× | -0.09 | -0.12 | 54 / 2,551 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 15 | 2.10 | 6.18 | 6.18 | 10.28 | 1.41× | 2.83× | 0.75 | 1.03 | 44 / 3,415 / 0 | — | 0.0009 ms per byte | — |
| fs.write | ≤1 KiB · contended | 27 | 9.03 | 24.05 | 31.63 | 38.31 | 1.23× | 1.78× | 1.10 | 1.76 | 175 / 10,173 / 0 | — | 0.0139 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 105 | 7.69 | 13.68 | 15.18 | 17.58 | 1.31× | 1.52× | 1.11 | 1.58 | 141 / 7,030 / 0 | — | 0.0096 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 6 | 11.37 | 13.59 | 13.59 | 13.98 | 1.03× | 0.91× | 0.20 | 0.36 | 262 / 12,439 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 15 | 10.18 | 14.03 | 14.03 | 17.29 | 1.09× | 1.47× | 0.25 | 0.34 | 154 / 6,733 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 148 | 12.20 | 34.67 | 73.30 | 114.24 | 1.31× | 2.18× | 0.88 | 1.28 | 337 / 19,238 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 446 | 8.44 | 12.60 | 15.67 | 20.84 | 1.20× | 1.29× | 0.62 | 0.90 | 159 / 7,280 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 109 | 10.37 | 35.17 | 99.25 | 128.47 | 1.21× | 2.14× | 0.65 | 1.05 | 301 / 16,710 / 0 | — | 0.0027 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 403 | 7.65 | 12.95 | 15.78 | 19.62 | 1.21× | 1.26× | 0.85 | 1.22 | 150 / 6,616 / 0 | — | 0.0025 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.69 | 0.69 | 0.69 | 0.69 | 1.17× | 1.17× | 0.02 | 0.01 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 38 | 31.91 | 68.54 | 81.59 | 85.34 | 1.40× | 1.63× | -0.39 | -0.49 | 318 / 36,381 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 82 | 30.79 | 54.59 | 106.37 | 305.29 | 1.35× | 1.39× | 0.37 | 0.48 | 332 / 33,977 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 11 | 4.11 | 4.41 | 4.41 | 4.46 | 1.27× | 1.06× | 0.83 | 1.18 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 28 | 3.78 | 4.65 | 4.95 | 5.54 | 1.13× | 1.00× | 0.47 | 0.68 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 5 | 11.23 | 12.11 | 12.11 | 31.05 | 1.30× | 0.71× | 0.82 | 1.26 | 132 / 5,445 / 0 | — | 11.229 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 19 | 9.81 | 15.88 | 15.88 | 55.11 | 1.29× | 1.52× | 0.60 | 0.82 | 112 / 5,242 / 0 | — | 9.81 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 1409.66 | 1409.66 | 1409.66 | 1409.66 | 28.03× | 28.03× | 4.30 | 5.41 | 28,707 / 1,901,193 / 0 | — | 1409.659 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 7 | 22.72 | 36.33 | 36.33 | 37.35 | 1.48× | 1.73× | 1.56 | 2.01 | 346 / 28,605 / 4 | — | 7.572 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 7 | 15.01 | 18.80 | 18.80 | 24.37 | 1.52× | 1.68× | 0.05 | 0.03 | 195 / 10,589 / 0 | — | 5.0043 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 30.13 | 30.13 | 30.13 | 41.40 | 2.01× | 2.01× | — | — | 487 / 31,932 / 8 | — | 6.0266 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 7 | 18.35 | 21.09 | 21.09 | 32.70 | 1.62× | 1.87× | 0.38 | 0.45 | 228 / 13,655 / 0 | — | 3.0582 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 3069.53 | 3069.53 | 3069.53 | 3069.53 | no baseline | no baseline | 1.70 | 0.90 | 21,447 / 2,258,099 / 8,511 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 70.26 | 401.65 | 401.65 | 16181.14 | 1.02× | 5.82× | 1.00 | 1.41 | 796 / 82,637 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 212 | 512.54 | 840.89 | 1235.16 | 2144.79 | 12.65× | 2.43× | 9.21 | 12.16 | — | 2,459 | — | — |
| sandbox.exec | 0 files · uncontended | 158 | 35.33 | 534.37 | 819.70 | 7146.01 | 1.30× | 2.08× | 0.12 | 0.16 | — | 2,457 | — | — |
| sandbox.exec | 1 files · contended | 34 | 37.05 | 67.96 | 89.86 | 142.13 | 1.18× | 1.16× | 0.78 | 1.12 | — | 4.70 | 37.054 ms per file | — |
| sandbox.exec | 1 files · uncontended | 53 | 39.12 | 64.81 | 69.83 | 141.97 | 1.29× | 1.10× | 0.41 | 0.56 | — | 5.50 | 39.124 ms per file | — |
| sandbox.exec | 17–64 files · contended | 7 | 71.11 | 81.29 | 81.29 | 86.07 | 1.11× | 1.27× | 1.85 | 2.44 | — | 100 | 3.5553 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 3 | 71.06 | 71.06 | 71.06 | 79.41 | 1.04× | 1.03× | 0.17 | 0.27 | — | 90 | 3.553 ms per file | — |
| sandbox.exec | 2–4 files · contended | 35 | 50.59 | 66.40 | 67.67 | 73.14 | 1.33× | 1.07× | 1.59 | 2.20 | — | 10.50 | 16.6 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 30 | 36.74 | 54.24 | 55.52 | 60.65 | 1.12× | 1.03× | 0.80 | 1.16 | — | 10.30 | 11.9665 ms per file | — |
| sandbox.exec | 5–16 files · contended | 32 | 39.88 | 77.08 | 79.71 | 85.69 | 0.76× | 1.33× | 0.23 | 0.54 | — | 13.70 | 6.2292 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 44 | 48.41 | 70.24 | 76.22 | 85.62 | 0.92× | 0.97× | 1.05 | 1.58 | — | 13.80 | 8.133 ms per file | — |
| sandbox.exec | — · contended | 15 | 2298.16 | 24003.47 | 24003.47 | 27220.90 | no baseline | no baseline | 1.09 | 1.58 | — | 30790.60 | — | — |
| sandbox.exec | — · uncontended | 25 | 193.62 | 14944.43 | 23717.47 | 42936.82 | 0.38× | 3.14× | -1.56 | -2.35 | — | 27488.10 | — | — |
| sandbox.mount | — · contended | 81 | 12.10 | 17.46 | 24.95 | 26.25 | 1.20× | 1.13× | 0.74 | 1.06 | 59 / 1,664 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 137 | 10.49 | 15.18 | 20.12 | 23.11 | 1.14× | 1.09× | 0.55 | 0.78 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.75 | 9.38 | 9.38 | 32.49 | no baseline | no baseline | -1.47 | -2.02 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 53 | 11.84 | 20.44 | 22.41 | 24.34 | 1.42× | 1.66× | 1.14 | 1.63 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 165 | 10.53 | 20.79 | 92.24 | 113.47 | 1.16× | 1.50× | 0.70 | 0.99 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 15 | 0.0 KiB | 793.9 KiB | 3,522 | ok 15 |
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

Load average (1-min, runner (Docker VM kernel)): start 0.16 · end 1.49.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 2.073 | 4.299 · 2.266 · 1.771 · 1.678 · 2.073 | 1.3–1.3 | statements 21, vm_steps 1344, fullscan_steps 0, sorts 0, returned_rows 128 |
| read | 1.798 | 1.798 · 1.603 · 1.877 · 2.292 · 1.625 | 1.3–1.3 | statements 20, vm_steps 1314, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_small | 1.816 | 1.715 · 1.816 · 1.883 · 1.957 · 1.596 | 1.3–1.3 | statements 20, vm_steps 1323, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_largest | 6.776 | 7.555 · 6.776 · 6.843 · 6.665 · 6.765 | 1.3–1.3 | statements 98, vm_steps 15024, fullscan_steps 0, sorts 0, returned_rows 1474 |
| grep_scoped | 2.261 | 2.613 · 1.97 · 1.976 · 2.261 · 2.335 | 1.3–1.3 | statements 25, vm_steps 1469, fullscan_steps 0, sorts 0, returned_rows 136 |
| glob_scoped | 1.549 | 1.549 · 1.888 · 1.575 · 1.333 · 1.414 | 1.3–1.3 | statements 19, vm_steps 1302, fullscan_steps 0, sorts 0, returned_rows 126 |
| grep_tree | 4169.888 | 4285.15 · 4169.888 · 4198.185 · 4096.676 · 4073.38 | 1.22–1.28 | statements 42436, vm_steps 3525556, fullscan_steps 0, sorts 0, returned_rows 366744 |
| glob_tree | 9.796 | 12.681 · 9.796 · 9.702 · 10.122 · 9.4 | 1.22–1.22 | statements 217, vm_steps 24041, fullscan_steps 0, sorts 0, returned_rows 2402 |
| diff_files | 6.713 | 6.316 · 6.704 · 6.937 · 7.127 · 6.713 | 1.22–1.22 | statements 102, vm_steps 7768, fullscan_steps 0, sorts 0, returned_rows 762 |
| list_commits | 0.84 | 1.281 · 0.665 · 0.711 · 1.216 · 0.84 | 1.22–1.22 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.831 | 3.554 · 2.577 · 2.831 · 3.313 · 2.605 | 1.22–1.22 | statements 58, vm_steps 2467, fullscan_steps 0, sorts 0, returned_rows 263 |
| fork | 0.524 | 0.626 · 0.608 · 0.524 · 0.454 · 0.399 | 1.22–1.22 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 35.423 | 38.731 · 35.423 · 33.15 · 33.803 · 36.103 | 1.22–1.22 | statements 531, vm_steps 29381, fullscan_steps 4, sorts 8, returned_rows 2194 |
| oneshot_mount_unmount | 17.285 | 19.2 · 17.285 · 17.143 · 14.162 · 17.901 | 1.22–1.22 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 77.578 | 92.222 · 83.493 · 73.358 · 66.51 · 77.578 | 1.68–1.68 | statements 165, vm_steps 10081, fullscan_steps 80, sorts 2, returned_rows 966 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.22–1.22 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r018: 84,070 pages of 4,096 B, 0 free · Commits 17,594 · Branches 294 · Layers 22 · compression 3.99× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 69,075 | 400.8 MiB |
| 2 | 29,992 | 354.0 MiB |
| 3 | 12,169 | 1.9 MiB |
| 4 | 22 | 4.9 KiB |
| 5 | 12,108 | 1.2 MiB |
| 6 | 31,416 | 165.0 MiB |
| 7 | 53,384 | 12.1 MiB |
| 8 | 94 | 27.4 KiB |
| 9 | 27,546 | 43.6 MiB |
| 10 | 19,229 | 2.4 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,880 | 152.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 17,812 | 29.3 MiB |
| 1 | 28,984 | 216.7 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 66,723 | 260.6 MiB | 11.9 MiB |
| inode_value | 8,721 | 34.1 MiB | 880.8 KiB |
| object_location | 3,664 | 14.3 MiB | 1.6 MiB |
| binding_hint | 2,243 | 8.8 MiB | 852.9 KiB |
| commit | 1,364 | 5.3 MiB | 912.5 KiB |
| commit_lineage | 384 | 1.5 MiB | 196.9 KiB |
| commit_runs | 374 | 1.5 MiB | 209.6 KiB |
| commit_identity | 274 | 1.1 MiB | 130.6 KiB |
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

**Time 355.1 s** (tooling): play 96.5 · consolidate 114.6 · verify 107.9 · probes 21.9 · tests 0.0 · seal + snapshot 5.2 · report 9.0

355.14 s tooling: prepare 1.55 · play 94.98 · consolidate 114.59 · verify 96.69 (diff_commits + full compareTree) · version walk 11.26 · probes 21.92 · metrics 1.46 · seal 2.16 · sealed figures 0.93 · snapshot copy 2.11 · report 0.40

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T14:53:15.420Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 17.24× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.828; Counters: glob_tree.vm_steps per tree file: depth exponent 0.424; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection: 1.05; Node proofs: 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T15:33:50.574Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 17.17× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.656): tree files exponent 11.724; Counters: glob_tree.vm_steps per tree file: depth exponent 0.429; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow); Snapshot time: 1997 ms for 299.4 MiB new; size exponent 0.791; Wall projection: 1.04; Node proofs: 16 pass · 1 stop · 0 NOT_RUN over 4 points: lead repair P6 |

### G. Evidence

- `~/lfs-history/metrics/range-018.a1.json`
- `~/lfs-history/metrics/range-018.a2.json`
- trace `~/lfs-history/runs/p3-main-h/trace/range-018.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-h/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-018.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r018-2-packages-core | 966 | 195.7 KiB |
| r018-3-examples-acp-agent | 894 | 198.0 KiB |
| r018-1-root | 548 | 192.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 322.0 | 1,604 |
| `git diff --stat` | 38.0 | 1,592 |
| `git add -f` | 30.0 | — |
| `git rm --cached` | 5.0 | — |
| `git commit` | 36.0 | 1,599 |

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
| lead | repair | P6 | stop | P1 pass, P4 stop (2 emitted file(s) differ: packages/core/session/lib/types/tool-pairing.d.ts, packages/core/session/lib/types/tool-pairing.js) | — |

### J. Conflicts by path class

No conflicts by path recorded.
