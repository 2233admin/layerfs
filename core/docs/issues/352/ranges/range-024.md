# Range 024 · **watch** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r023 (live Store)
dsh `8a33e7cd0`..`0d7ec2f8b` · **61 commits** (10 mainline, 51 side) · 2026-07-16 → 2026-07-21
Areas changed: `examples/acp-agent` 26% · `/` 11% · `packages/ui` 8% · other 55%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 85.0 s · git 97.9 s · Node 177.3 s · verify 8.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **615.1 MiB** (+2.9 MiB) | **537.2 MiB** (+30.4 MiB) live | **0.87×** (prev 0.83×) | **30.5 MiB** | **1,240** (total 25,762) | **243.4 s** tooling (total 56.1 min) |

**Checks:** 13 pass · 6 watch: Speed not judged: baseline not set (pilot); Scaling insufficient same-binary points: 2 of 3 (daemon 45a196ef16c6); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters insufficient same-binary points: 2 of 3 (daemon 45a196ef16c6); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 30.5 MiB; median not judged: 1 of 3 earlier ranges; Wall projection 1.02
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe grep_scoped +63% · ▲ probe list_largest +61% · ▼ stored added −55%
**Budget:** 25 of 202 ranges · projected total 17.2 h (budget 16.8 h) · disk 37% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **275 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 2 publishes |
| Steps | 2,253 / 2,253 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 1963 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 302 bin shims, 3273 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (46 lines from 3 .gitignore files) · **166 picks** in 3 merges (166 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `0d7ec2f8b`** · 188 commits written for 188 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 166 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r024-1-examples-acp-agent | end | `79dd2c0a4892` | `c6b854b088d3` | pass (299 normalized) | pass | pass | pass | pass | n/a |
| r024-3-packages-goal | end | `bcc693a88c97` | `c6b854b088d3` | pass (299 normalized) | pass | pass | pass | pass | n/a |
| r024-2-root | end | `5dfb1ae6a3a4` | `238a00bfba08` | pass (306 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `c522d61737ea` | `null` | n/a | pass | n/a | n/a | pass | pass (112,507 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/workflow/tool-workflow/tests/tool-workflow.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively).

## 2. Activity

**2,890 calls** · **142 steps** by **8 agents + lead** on **3 Branches + main** · **193 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +225 added · 813 modified · −132 deleted · 18.7 MiB written · fs 1,084 : Sandbox 86 (**13 : 1**, reported only in P3)
**Execs:** 545 (JS 46 · shell 499) · 3 non-zero exits · install 0 · test runs 4 · version figures 11 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,408 | 1,098 | 310 | Committed 1,098 · Text 26 · NoSuchPath 22 · Equal 4 |
| sandbox | 1,126 | 736 | 4 | commit 191 (Committed 156, UpToDate 34, Conflict 1) · exec 545 (exit:0 542, exit:2 3) · mount 193 (Mounted 193) · status 4 · unmount 193 (Unmounted 193) |
| branch | 346 | 32 | 314 | diff_branches 12 · diff_commits 302 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 2 (Added 2) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,890** | **1,866** | **638** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r024-1-examples-acp-agent | a01 a02 | 32 | 306 | ✓ | ✓ |
| r024-2-root | a03 a04 a05 | 37 | 304 | ✓ | — |
| r024-3-packages-goal | a06 a07 a08 | 66 | 318 | ✓ | — |
| main | lead | 7 | 312 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r024-3, a07 after a08 | 0.1 s |
| Stale clean merge | 1 / 1 | r024-3, a08 a07 | merged cleanly |
| Decoy edit | 1 / 1 | r024-3, a07 a08 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r024-2 vs r024-1 publish | 5.9 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r024-1 | 17 | 7 | 10 | 0 | 0 | 140 | — |
| a02 | r024-1 | 15 | 8 | 7 | 0 | 0 | 166 | — |
| a03 | r024-2 | 9 | 3 | 6 | 0 | 0 | 58 | — |
| a04 | r024-2 | 14 | 5 | 9 | 0 | 0 | 160 | — |
| a05 | r024-2 | 14 | 5 | 9 | 0 | 0 | 86 | — |
| a06 | r024-3 | 23 | 10 | 13 | 0 | 0 | 130 | — |
| a07 | r024-3 | 23 | 7 | 16 | 0 | 0 | 90 | commit-conflict, stale-clean-merge, decoy |
| a08 | r024-3 | 20 | 11 | 9 | 0 | 0 | 98 | commit-conflict, stale-clean-merge, decoy |
| lead | main | 7 | 1 | 0 | 6 | 0 | 312 | merge-race |
| **Total** |  | **142** | **57** | **79** | **6** | **0** | **1,240** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 104 · pnpm 1 · tsc 3 · vitest 4 · other 433

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r024-2-root | 31 | 31 | 31 | 4 | 31 | 428 |
| r024-3-packages-goal | 45 | 45 | 45 | 1 | 45 | 759 |
| r024-1-examples-acp-agent | 21 | 21 | 21 | 0 | 21 | 600 |
| **lead** | — | — | — | — | 188 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r024-1-examples-acp-agent | 0 | 1 | 1 | 1 | 31 | 31 / 31 |
| r024-3-packages-goal | 0 | 1 | 1 | 1 | 13 | 13 / 13 |
| r024-2-root | 1 | 0 | 1 | 1 | 20 | 20 / 20 |
| **lead repair** | 1 | — | 1 | — | — | 112,507 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r023) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 612.2 MiB (13.3 MiB / 557.4 MiB / 11.5 MiB / 29.9 MiB) | 615.1 MiB (14.0 MiB / 557.4 MiB / 12.2 MiB / 31.5 MiB) | +2.9 MiB |
| Version figures from | — | incremental (55,961 changed paths) | — |
| Files / directories / symlinks | 46,616 / 7,859 / 3,200 | 46,782 / 7,922 / 3,279 | +166 / +63 / +79 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 506.8 MiB | 537.2 MiB | +30.4 MiB |
| **Space amplification** (total · tracked) | 0.83× · tracked 3.78× | 0.87× · tracked 3.72× | 0.05 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **8.42** (1.41 / 0.29 / 1.69) | 4.21× the median range |
| **Stored per Commit** | 43.1 KiB | 25.1 KiB | — |
| Metadata share | 0.37 | 0.38 | this range 0.49 |
| History: Commits / Layers / Branches | 24,522 | 25,762 / 13 / 160 | +1,240 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 9.30 GiB (Commits 7.70 GiB · installs 989.0 MiB · build 113.6 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 44.99 GiB / 37% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 330.8 MiB | 0.54 | +12.6 MiB |
| Metadata | 47.0 MiB | 0.08 | +2.6 MiB |
| Index rows + waste + other (live, not split) | 159.4 MiB | 0.26 | — |
| **Total = Store on disk** | **537.2 MiB** | **= 0.87** space amplification | +30.4 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 14.0 MiB | 52.2 MiB (22.4 MiB + 29.8 MiB) | 3.72× | — | 1.9 MiB | 3.6 MiB | 0.52 |
| `node_modules` | 557.4 MiB | 172.3 MiB (163.2 MiB + 9.1 MiB) | 0.31× | — | 879.4 KiB | 132.0 KiB | 6.66 |
| Build output | 12.2 MiB | 8.6 MiB (8.2 MiB + 419.0 KiB) | 0.71× | — | 601.0 KiB | 5.2 MiB | 0.11 |
| `.git` | 31.5 MiB | 143.2 MiB (136.9 MiB + 6.3 MiB) | 4.55× | — | 11.9 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 159.4 MiB | — (not divided) | — | 15.2 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 1.4 MiB | — | — | — | — | — |
| **Total** | — | **537.2 MiB** | **= 0.87×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +3,431 | — | 3,395 (derived) | 53% |
| Chunks (large files) | — (at snapshots) | +802 | — | — | 16% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 4,058 (with inodes, pooled) | — | — | 54% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +3,435 | — | — | — |

Delta: 2.9% at depth cap · 7% of refused bases stopped by budget · `node_modules` reinstall: absolute: 719759 new stored bytes for 1659 raw changed bytes of 64 changed packages (433.851×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.72× (52.2 MiB for 14.0 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.9 KiB / 1.7 KiB / 5.4 KiB over 285 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.4 MiB stored for 1.68 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.29 (3 lanes × 615.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.4 ms / 20.7 ms | 2.8 ms / 5.1 ms | 3.2 ms / 6.7 ms | 21.5 ms / 89.8 ms | 11.6 ms / 23.2 ms | 456 ms / 456 ms | — (native comparison in P3; exec 42.0 ms / 1267 ms) |
| SQL p50: 160 stmts | 53 stmts | 60 stmts | 242 stmts | 57 stmts | 8,735 stmts | — |

**Commit cost:** 9.02 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 595 ms p50 over 193
**Slowest:** sandbox.exec 33553 ms · sandbox.exec 29175 ms · sandbox.exec 28056 ms · checkpoint diff_commits 0.11 ms and 1.52 statements per entry (55,888 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 205 ms / 205 ms | — / — | — | git / status-cold: — |
| git status (steady) | 303 ms / 488 ms | — / — | — | git / status-steady: — |
| git add | 29.0 ms / 126 ms | — / — | — | git / add: — |
| git commit (lane) | 35.0 ms / 86.0 ms | — / — | — | git / commit: — |
| lead writes main | 7869 ms / 7869 ms | — / — | — | — |
| repack | 2587 ms / 2587 ms | — / — | — | — |
| pnpm install (incremental) | 5459 ms / 5459 ms | 1804 ms / 1804 ms | 3.03× | pnpm-reinstall / cold: — |
| pnpm refresh | 2327 ms / 2327 ms | 1610 ms / 1610 ms | 1.45× | pnpm-reinstall / steady: — |
| tsc -b | 4138 ms / 4138 ms | 2560 ms / 2701 ms | 1.62× | tsc-b / cold: — |
| vitest | 3837 ms / 3837 ms | 2997 ms / 2997 ms | 1.28× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.7 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.7 ms / 23.2 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 12392 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2830472 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 45352 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 15.45 at the first command → 12.56 after the last (max 15.45 over 6 commands) · Docker VM 2.55 → 1.91

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-024.a1)

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

- **a1 (`p3-main-r`, live after r23 a1, daemon `45a196ef`, addon `4668012e`; binaries from main 3ef00d32e5, owner 2026-10-20): WATCH, terminal.** Checkpoint ok, git ✓. Node: 17 pass, 0 stop, 0 NOT_RUN over 3 points. Repair P6 pass (803 emitted). Control `control-024.a1` passes. The watch rows are a baseline not set for this binary (fast mode, no re-baseline) and 2 of 3 same-binary points. Final steps: repair 110 s at host load 14, verify 13 s, finish 35 s. Repair build 14.5 s, install 33.6 s. From range 25 the step alarms are rebalanced within the same 295 s: repair 160, verify 70, finish 65.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2253/2253; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 45a196ef16c6); also not judged: oneshot_exec: 2 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 45a196ef16c6) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.495 | < 0.5 | pass |
| Reinstall growth | absolute: 719759 new stored bytes for 1659 raw changed bytes of 64 changed packages (433.851×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0289 (budget 0.0697) | < 0.1 | pass |
| Range growth | 30.5 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.37 | < 0.8 | pass |
| Wall projection | 1.02 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 188 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 166 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 142 | 142 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1240 | 1129 |
| Workspaces (one-shot share) | 193 (0.99) | 78 (0.974) |
| Reads | 262 | 262 |
| Reconcile writes | 303 | 303 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 631.61 | 631.61 | 631.61 | 631.61 | no baseline | no baseline | — | — | 26,040 / 452,216 / 0 | — | 2.5992 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 11 | 36.43 | 239.77 | 239.77 | 531.28 | no baseline | no baseline | — | — | 207 / 19,038 / 0 | — | 0.1512 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 6.41 | 6.41 | 6.41 | 6.41 | no baseline | no baseline | — | — | 90 / 6,787 / 0 | — | 0.8009 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 254.30 | 254.30 | 254.30 | 254.30 | no baseline | no baseline | — | — | 5,287 / 168,305 / 0 | — | 1.1939 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 295 | 21.66 | 36.81 | 72.64 | 325.89 | no baseline | no baseline | — | — | 309 / 32,452 / 0 | — | 0.1177 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.77 | 2.62 | 2.62 | 4.03 | no baseline | no baseline | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.79 | 0.79 | 0.79 | 1.05 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0396 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 455.67 | 455.67 | 455.67 | 529.31 | no baseline | no baseline | — | — | 8,735 / 674,403 / 0 | — | 3.4371 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 2 | 20.31 | 20.31 | 20.31 | 47.18 | no baseline | no baseline | — | — | 56 / 1,178 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 28.95 | 28.95 | 28.95 | 28.95 | no baseline | no baseline | — | — | 172 / 13,267 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 11 | 13.94 | 23.54 | 23.54 | 34.86 | no baseline | no baseline | — | — | 252 / 19,758 / 0 | — | 0.0216 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 20 | 9.83 | 14.77 | 14.77 | 16.58 | no baseline | no baseline | — | — | 133 / 6,569 / 0 | — | 0.0185 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 12 | 15.84 | 26.58 | 26.58 | 33.73 | no baseline | no baseline | — | — | 310 / 15,638 / 0 | — | 0.0011 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 29 | 8.92 | 13.44 | 18.84 | 19.99 | no baseline | no baseline | — | — | 131 / 5,583 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 17 | 13.40 | 31.86 | 31.86 | 52.79 | no baseline | no baseline | — | — | 283 / 35,867 / 82 | — | 0.0047 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 43 | 7.89 | 12.68 | 15.69 | 19.64 | no baseline | no baseline | — | — | 130 / 5,180 / 0 | — | 0.0019 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 12 | 9.16 | 18.59 | 18.59 | 18.71 | no baseline | no baseline | — | — | 230 / 9,862 / 0 | — | 0.0277 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 23 | 7.97 | 13.01 | 13.62 | 17.38 | no baseline | no baseline | — | — | 166 / 7,746 / 0 | — | 0.0353 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 3 | 5.48 | 5.48 | 5.48 | 12.10 | no baseline | no baseline | — | — | 155 / 6,445 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 4 | 8.14 | 8.95 | 8.95 | 10.73 | no baseline | no baseline | — | — | 158 / 8,261 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 14.56 | 14.56 | 14.56 | 14.56 | no baseline | no baseline | — | — | 372 / 20,740 / 0 | — | 0.0023 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 4.45 | 8.58 | 8.58 | 9.51 | no baseline | no baseline | — | — | 98 / 4,992 / 0 | — | 0.0008 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 2 | 4.61 | 4.61 | 4.61 | 5.96 | no baseline | no baseline | — | — | 71 / 6,025 / 0 | — | 0.0871 ms per file | — |
| fs.glob | 17–64 files · uncontended | 5 | 3.30 | 4.11 | 4.11 | 6.21 | no baseline | no baseline | — | — | 69 / 6,597 / 0 | — | 0.0583 ms per file | — |
| fs.glob | 2–4 files · contended | 4 | 3.09 | 3.11 | 3.11 | 3.84 | no baseline | no baseline | — | — | 76 / 2,955 / 0 | — | 0.7715 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 2.53 | 2.55 | 2.55 | 4.43 | no baseline | no baseline | — | — | 52 / 3,128 / 0 | — | 1.223 ms per file | — |
| fs.glob | 5–16 files · contended | 4 | 2.63 | 3.75 | 3.75 | 4.66 | no baseline | no baseline | — | — | 45 / 3,077 / 0 | — | 0.5252 ms per file | — |
| fs.glob | 5–16 files · uncontended | 11 | 2.79 | 3.90 | 3.90 | 4.52 | no baseline | no baseline | — | — | 51 / 4,915 / 0 | — | 0.3167 ms per file | — |
| fs.glob | >64 files · contended | 5 | 13.39 | 25.52 | 25.52 | 31.27 | no baseline | no baseline | — | — | 427 / 28,005 / 0 | — | 0.0465 ms per file | — |
| fs.glob | >64 files · uncontended | 9 | 4.95 | 8.44 | 8.44 | 13.01 | no baseline | no baseline | — | — | 79 / 8,095 / 0 | — | 0.042 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 2.28 | 2.28 | 2.28 | 2.28 | no baseline | no baseline | — | — | 56 / 3,258 / 0 | — | 2.283 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 5 | 11.70 | 11.97 | 11.97 | 12.42 | no baseline | no baseline | — | — | 245 / 12,691 / 0 | — | 0.4873 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 9.10 | 9.42 | 9.42 | 15.72 | no baseline | no baseline | — | — | 171 / 8,603 / 0 | — | 0.1626 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 3.04 | 3.04 | 3.04 | 3.93 | no baseline | no baseline | — | — | 58 / 3,754 / 0 | — | 0.761 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 4 | 2.64 | 3.88 | 3.88 | 7.33 | no baseline | no baseline | — | — | 78 / 3,180 / 0 | — | 0.971 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 5 | 5.04 | 6.33 | 6.33 | 7.30 | no baseline | no baseline | — | — | 117 / 6,421 / 0 | — | 0.9131 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 9 | 3.98 | 5.85 | 5.85 | 7.15 | no baseline | no baseline | — | — | 59 / 3,940 / 0 | — | 0.5614 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 24.98 | 24.98 | 24.98 | 42.55 | no baseline | no baseline | — | — | 642 / 22,438 / 0 | — | 0.2191 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 10 | 16.89 | 24.93 | 24.93 | 51.39 | no baseline | no baseline | — | — | 349 / 18,974 / 0 | — | 0.1645 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 7 | 6.36 | 6.83 | 6.83 | 7.56 | no baseline | no baseline | — | — | 93 / 7,888 / 0 | — | 0.2648 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 11 | 3.35 | 4.62 | 4.62 | 6.44 | no baseline | no baseline | — | — | 68 / 6,462 / 0 | — | 0.1289 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 1.76 | 1.76 | 1.76 | 1.76 | no baseline | no baseline | — | — | 62 / 4,713 / 0 | — | 0.4412 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 8 | 2.25 | 2.97 | 2.97 | 3.72 | no baseline | no baseline | — | — | 46 / 2,888 / 0 | — | 0.846 ms per entrie | — |
| fs.list | 5–16 entries · contended | 3 | 4.11 | 4.11 | 4.11 | 8.29 | no baseline | no baseline | — | — | 64 / 4,586 / 0 | — | 0.5597 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 12 | 2.48 | 4.67 | 4.67 | 4.70 | no baseline | no baseline | — | — | 51 / 4,183 / 0 | — | 0.3413 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 3.19 | 3.19 | 3.19 | 3.63 | no baseline | no baseline | — | — | 75 / 4,290 / 0 | — | 0.0036 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 3 | 3.32 | 3.32 | 3.32 | 3.33 | no baseline | no baseline | — | — | 70 / 3,947 / 0 | — | 0.0042 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.55 | 2.55 | 2.55 | 3.15 | no baseline | no baseline | — | — | 52 / 2,652 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 8 | 2.72 | 3.74 | 3.74 | 5.12 | no baseline | no baseline | — | — | 53 / 3,417 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 24 | 2.74 | 4.53 | 5.54 | 9.04 | no baseline | no baseline | — | — | 51 / 3,257 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 11 | 10.96 | 14.96 | 14.96 | 17.89 | no baseline | no baseline | — | — | 186 / 9,182 / 0 | — | 10.96 ms per file | commit |
| fs.rm | 1 files · uncontended | 121 | 8.72 | 31.90 | 40.17 | 44.56 | no baseline | no baseline | — | — | 143 / 7,652 / 0 | — | 8.722 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 3 | 2.53 | 2.53 | 2.53 | 4.04 | no baseline | no baseline | — | — | 69 / 4,449 / 0 | — | 0.0086 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 6 | 2.04 | 2.15 | 2.15 | 2.18 | no baseline | no baseline | — | — | 39 / 2,387 / 0 | — | 0.004 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 3.37 | 3.37 | 3.37 | 3.37 | no baseline | no baseline | — | — | 45 / 2,759 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.44 | 2.44 | 2.44 | 3.58 | no baseline | no baseline | — | — | 43 / 3,452 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 7 | 2.95 | 5.03 | 5.03 | 5.15 | no baseline | no baseline | — | — | 51 / 3,686 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 13 | 2.66 | 4.03 | 4.03 | 6.23 | no baseline | no baseline | — | — | 46 / 3,589 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 3.64 | 3.64 | 3.64 | 4.72 | no baseline | no baseline | — | — | 63 / 3,496 / 0 | — | 0.0014 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 6 | 1.67 | 2.60 | 2.60 | 3.26 | no baseline | no baseline | — | — | 44 / 2,360 / 0 | — | 0.0003 ms per byte | — |
| fs.write | ≤1 KiB · contended | 8 | 12.46 | 19.93 | 19.93 | 52.16 | no baseline | no baseline | — | — | 300 / 15,957 / 0 | — | 0.0248 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 69 | 7.75 | 14.72 | 16.47 | 19.93 | no baseline | no baseline | — | — | 145 / 6,210 / 0 | — | 0.0151 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 15 | 21.76 | 45.11 | 45.11 | 67.44 | no baseline | no baseline | — | — | 378 / 23,326 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 29 | 10.79 | 14.83 | 15.53 | 34.21 | no baseline | no baseline | — | — | 158 / 6,765 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 90 | 13.00 | 39.80 | 106.44 | 107.76 | no baseline | no baseline | — | — | 259 / 12,559 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 299 | 7.97 | 13.02 | 17.12 | 28.59 | no baseline | no baseline | — | — | 157 / 6,562 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 56 | 12.60 | 34.85 | 38.73 | 40.87 | no baseline | no baseline | — | — | 273 / 12,922 / 0 | — | 0.0035 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 255 | 7.40 | 12.78 | 19.75 | 73.59 | no baseline | no baseline | — | — | 154 / 6,347 / 0 | — | 0.0026 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.72 | 0.72 | 0.72 | 0.72 | no baseline | no baseline | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 34 | 29.19 | 64.19 | 67.62 | 105.28 | no baseline | no baseline | — | — | 388 / 23,714 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 64 | 25.40 | 50.32 | 109.06 | 201.04 | no baseline | no baseline | — | — | 388 / 25,885 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 6 | 3.81 | 4.68 | 4.68 | 5.26 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 28 | 3.60 | 7.92 | 8.23 | 10.79 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 11 | 15.38 | 32.20 | 32.20 | 32.58 | no baseline | no baseline | — | — | 258 / 12,336 / 0 | — | 15.377 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 12 | 9.24 | 12.87 | 12.87 | 20.17 | no baseline | no baseline | — | — | 112 / 3,987 / 0 | — | 9.241 ms per file | observe.after |
| sandbox.commit | 1 files · Conflict · contended | 1 | 110.70 | 110.70 | 110.70 | 110.70 | no baseline | no baseline | — | — | 4,977 / 130,243 / 0 | — | 110.701 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 6 | 25.38 | 33.24 | 33.24 | 36.27 | no baseline | no baseline | — | — | 160 / 18,402 / 0 | — | 9.1855 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 8 | 12.27 | 13.14 | 13.14 | 38.72 | no baseline | no baseline | — | — | 127 / 5,039 / 0 | — | 4.3797 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 23.82 | 23.82 | 23.82 | 23.82 | no baseline | no baseline | — | — | 508 / 20,726 / 0 | — | 4.7632 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 3 | 24.93 | 24.93 | 24.93 | 25.58 | no baseline | no baseline | — | — | 329 / 14,067 / 0 | — | 2.5579 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 71.08 | 1114.05 | 1114.05 | 15003.52 | no baseline | no baseline | — | — | 430 / 25,464 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 193 | 44.15 | 1020.90 | 2758.88 | 2812.60 | no baseline | no baseline | — | — | — | 2579.30 | — | — |
| sandbox.exec | 0 files · uncontended | 117 | 38.30 | 605.97 | 1394.08 | 7273.56 | no baseline | no baseline | — | — | — | 2670.70 | — | — |
| sandbox.exec | 1 files · contended | 43 | 38.37 | 58.98 | 75.23 | 96.01 | no baseline | no baseline | — | — | — | 4.70 | 38.371 ms per file | — |
| sandbox.exec | 1 files · uncontended | 35 | 41.52 | 68.19 | 68.43 | 101.86 | no baseline | no baseline | — | — | — | 4.30 | 41.522 ms per file | — |
| sandbox.exec | 17–64 files · contended | 5 | 81.92 | 82.43 | 82.43 | 90.76 | no baseline | no baseline | — | — | — | 98 | 4.0962 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 6 | 76.41 | 85.51 | 85.51 | 100.63 | no baseline | no baseline | — | — | — | 97 | 3.9363 ms per file | — |
| sandbox.exec | 2–4 files · contended | 45 | 37.58 | 72.97 | 85.63 | 90.74 | no baseline | no baseline | — | — | — | 8.80 | 15.838 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 18 | 36.83 | 64.34 | 64.34 | 83.78 | no baseline | no baseline | — | — | — | 8.70 | 17.493 ms per file | — |
| sandbox.exec | 5–16 files · contended | 19 | 49.29 | 85.66 | 85.66 | 87.94 | no baseline | no baseline | — | — | — | 21.30 | 6.557 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 16 | 45.55 | 90.05 | 90.05 | 206.80 | no baseline | no baseline | — | — | — | 17.20 | 6.2014 ms per file | — |
| sandbox.exec | — · contended | 10 | 2851.50 | 28056.30 | 28056.30 | 29175.19 | no baseline | no baseline | — | — | — | 31324.30 | — | — |
| sandbox.exec | — · uncontended | 28 | 246.49 | 14440.05 | 14485.21 | 33552.65 | no baseline | no baseline | — | — | — | 30301.70 | — | — |
| sandbox.mount | — · contended | 79 | 12.64 | 25.82 | 65.13 | 70.94 | no baseline | no baseline | — | — | 62 / 1,668 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 104 | 11.01 | 21.86 | 24.93 | 27.29 | no baseline | no baseline | — | — | 48 / 1,425 / 82 | — | — | sandbox.mount.attach |
| sandbox.status | — · uncontended | 4 | 5.52 | 6.01 | 6.01 | 65.21 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 55 | 12.33 | 23.72 | 33.71 | 157.65 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 128 | 11.76 | 20.22 | 131.81 | 498.15 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 12 | 0.0 KiB | 637.4 KiB | 2,848 | ok 12 |
| branch.diff_commits | branch | 302 | 0.0 KiB | 16.5 MiB | 56,519 | ok 302 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 9 | 0.0 KiB | 85.8 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 145 | 2.5 MiB | 0.0 KiB | 156 | Committed 145 |
| fs.diff_files | fs | 52 | 0.0 KiB | 244.5 KiB | 30 | Text 26, NoSuchPath 22, Equal 4 |
| fs.glob | fs | 54 | 0.0 KiB | 55.7 KiB | 710 | ok 54 |
| fs.grep | fs | 54 | 0.0 KiB | 177.3 KiB | 652 | ok 54 |
| fs.list | fs | 54 | 0.0 KiB | 153.7 KiB | 1,099 | ok 54 |
| fs.read | fs | 46 | 0.0 KiB | 183.1 KiB | 46 | ok 46 |
| fs.rm | fs | 132 | 0.0 KiB | 0.0 KiB | 132 | Committed 132 |
| fs.stat | fs | 50 | 0.0 KiB | 11.0 KiB | 50 | ok 50 |
| fs.write | fs | 821 | 16.6 MiB | 0.0 KiB | 821 | Committed 821 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 191 | 0.0 KiB | 0.0 KiB | 0 | Committed 156, UpToDate 34, Conflict 1 |
| sandbox.exec | sandbox | 545 | 2.3 MiB | 3.1 MiB | 0 | exit:0 542, exit:2 3 |
| sandbox.mount | sandbox | 193 | 0.0 KiB | 0.0 KiB | 0 | Mounted 193 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 193 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 193 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 2.55 · end 1.91.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.527 | 15.065 · 1.463 · 1.294 · 1.527 · 1.706 | 2.39–2.39 | statements 36, vm_steps 1143, fullscan_steps 0, sorts 0, returned_rows 93 |
| read | 1.358 | 1.299 · 1.358 · 1.842 · 1.457 · 1.314 | 2.39–2.39 | statements 20, vm_steps 798, fullscan_steps 0, sorts 0, returned_rows 77 |
| list_small | 1.297 | 1.395 · 1.399 · 1.22 · 1.178 · 1.297 | 2.39–2.39 | statements 20, vm_steps 807, fullscan_steps 0, sorts 0, returned_rows 77 |
| list_largest | 3.587 | 5.628 · 3.585 · 3.421 · 3.642 · 3.587 | 2.39–2.39 | statements 78, vm_steps 6033, fullscan_steps 0, sorts 0, returned_rows 627 |
| grep_scoped | 1.792 | 1.85 · 1.889 · 1.792 · 1.559 · 1.488 | 2.39–2.39 | statements 25, vm_steps 953, fullscan_steps 0, sorts 0, returned_rows 86 |
| glob_scoped | 1.252 | 1.608 · 1.252 · 1.108 · 1.185 · 1.48 | 2.39–2.39 | statements 19, vm_steps 786, fullscan_steps 0, sorts 0, returned_rows 76 |
| grep_tree | 4028.666 | 4159.975 · 4028.666 · 3994.498 · 4042.713 · 3819.291 | 1.99–2.28 | statements 40385, vm_steps 3235850, fullscan_steps 0, sorts 0, returned_rows 329689 |
| glob_tree | 7.394 | 8.733 · 7.246 · 7.608 · 7.394 · 6.797 | 1.99–1.99 | statements 125, vm_steps 12486, fullscan_steps 0, sorts 0, returned_rows 1395 |
| diff_files | 5.129 | 5.805 · 5.009 · 5.008 · 5.285 · 5.129 | 1.99–1.99 | statements 102, vm_steps 4672, fullscan_steps 0, sorts 0, returned_rows 462 |
| list_commits | 1.159 | 2.462 · 1.159 · 1.007 · 0.946 · 1.374 | 1.99–1.99 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.819 | 4.22 · 2.85 · 2.819 · 2.724 · 2.468 | 1.99–1.99 | statements 64, vm_steps 2506, fullscan_steps 0, sorts 0, returned_rows 295 |
| fork | 0.812 | 1.267 · 1.264 · 0.812 · 0.753 · 0.797 | 1.99–1.99 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 31.875 | 32.431 · 29.748 · 28.615 · 31.875 · 32.46 | 1.99–1.99 | statements 514, vm_steps 23191, fullscan_steps 0, sorts 0, returned_rows 1865 |
| oneshot_mount_unmount | 16.634 | 25.441 · 15.314 · 30.823 · 16.634 · 16.264 | 1.99–2 | statements 70, vm_steps 2363, fullscan_steps 82, sorts 2, returned_rows 229 |
| oneshot_commit | 72.036 | 81.372 · 71.796 · 86.565 · 70.917 · 72.036 | 2–2 | statements 197, vm_steps 12353, fullscan_steps 82, sorts 2, returned_rows 985 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.99–2 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 243.4 s** (tooling): play 86.9 · consolidate 105.7 · verify 16.9 · probes 21.2 · tests 0.0 · seal + snapshot 0.0 · report 12.7

243.36 s tooling: prepare 1.90 · play 84.99 · consolidate 105.67 · verify 8.28 (diff_commits) · version walk 8.66 · probes 21.14 · metrics 0.82 · Store allocation 0.23 · report 0.29

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T20:39:46.485Z | watch | Speed: not judged: baseline not set (pilot); Scaling: insufficient same-binary points: 2 of 3 (daemon 45a196ef16c6); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: insufficient same-binary points: 2 of 3 (daemon 45a196ef16c6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 30.5 MiB; median not judged: 1 of 3 earlier ranges; Wall projection: 1.02 |

### G. Evidence

- `~/lfs-history/metrics/range-024.a1.json`
- trace `~/lfs-history/runs/p3-main-r/trace/range-024.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-r/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r024-2-root | 428 | 239.9 KiB |
| r024-3-packages-goal | 759 | 245.5 KiB |
| r024-1-examples-acp-agent | 600 | 244.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 303.0 | 1,956 |
| `git diff --stat` | 38.0 | 1,947 |
| `git add -f` | 29.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 35.0 | 1,954 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r024-1-examples-acp-agent | end | P1 | pass | — | — |
| r024-1-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r024-1-examples-acp-agent | end | P3 | pass | 186 bookkeeping path(s) | — |
| r024-1-examples-acp-agent | end | P4 | pass | 104 emitted files, exit 2 | — |
| r024-1-examples-acp-agent | end | P5 | pass | 31 files | — |
| r024-1-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r024-3-packages-goal | end | P1 | pass | — | — |
| r024-3-packages-goal | end | P2 | pass | exit 0 | — |
| r024-3-packages-goal | end | P3 | pass | 186 bookkeeping path(s) | — |
| r024-3-packages-goal | end | P4 | pass | 47 emitted files, exit 2 | — |
| r024-3-packages-goal | end | P5 | pass | 13 files | — |
| r024-3-packages-goal | end | P6 | n/a | not a repair | — |
| r024-2-root | end | P1 | pass | — | — |
| r024-2-root | end | P2 | pass | exit 0 | — |
| r024-2-root | end | P3 | n/a | an install, not a refresh | — |
| r024-2-root | end | P4 | pass | 144 emitted files, exit 2 | — |
| r024-2-root | end | P5 | pass | 20 files | — |
| r024-2-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (803 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
