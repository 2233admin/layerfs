# Range 041 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r040 (live Store)
dsh `8372340f9`..`e7bf30382` · **65 commits** (11 mainline, 54 side) · 2026-07-25 → 2026-07-27
Areas changed: `/` 13% · `.agents/notes` 11% · `packages/client` 11% · other 65%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 15 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.20×** · **Churn 0.00**
**Time split:** play 109.3 s · git 112.5 s · Node 214.3 s · verify 8.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **779.0 MiB** (+9.6 MiB) | **1.12 GiB** (+31.1 MiB) live | **1.47×** (prev 1.45×) | **30.9 MiB** | **844** (total 48,936) | **275.3 s** tooling (total 129.5 min) |

**Checks:** 15 pass · 3 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.22× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.188) and statements per entry does not rise (0.018): the fixed and per-entry parts cannot be separated; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe list_small +96% · ▲ probe stat +77% · ▲ probe read +76%
**Budget:** 42 of 202 ranges · projected total 15.5 h (budget 16.8 h) · disk 42% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **305 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 1,958 / 1,958 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2821 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 398 bin shims, 4295 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (50 lines from 3 .gitignore files) · **85 picks** in 3 merges (80 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `e7bf30382`** · 134 commits written for 134 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 80 · Build outputs 5 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r041-1-agents-notes | end | `604cc6f90055` | `0bd9a3346d39` | pass (401 normalized) | pass | pass | n/a | n/a | n/a |
| r041-2-packages-client | end | `ceea49364840` | `8cca56336417` | pass (401 normalized) | pass | n/a | pass | pass | n/a |
| r041-3-packages-llm | end | `c06f9db7cc5f` | `0bd9a3346d39` | pass (401 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `743fecebaca8` | `null` | n/a | pass | n/a | n/a | pass | pass (127,996 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/code-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/appearance-row.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/apply.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/apply.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/rows.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-browser.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-picker.spec.tsx` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/sse.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/translate.spec.ts` (fails natively) · `packages/core/agent-loop/tests/inbox-invariant.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/llm/llm/tests/service.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-recovery.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively).

## 2. Activity

**2,696 calls** · **184 steps** by **8 agents + lead** on **3 Branches + main** · **227 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +50 added · 665 modified · −27 deleted · 11.4 MiB written · fs 679 : Sandbox 63 (**11 : 1**, reported only in P3)
**Execs:** 580 (JS 67 · shell 513) · 2 non-zero exits · install 0 · test runs 3 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,013 | 693 | 320 | Committed 693 · Text 36 · NoSuchPath 9 · Equal 2 |
| sandbox | 1,261 | 803 | 4 | commit 223 (Committed 165, UpToDate 57, Conflict 1) · exec 580 (exit:0 578, exit:2 2) · mount 227 (Mounted 227) · status 4 · unmount 227 (Unmounted 227) |
| branch | 412 | 31 | 381 | diff_branches 10 · diff_commits 371 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,696** | **1,527** | **715** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r041-1-agents-notes | a01 a02 a03 | 67 | 248 | ✓ | — |
| r041-2-packages-client | a04 a05 | 40 | 223 | ✓ | — |
| r041-3-packages-llm | a06 a07 a08 | 71 | 254 | ✓ | — |
| main | lead | 6 | 119 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r041-2, a05 after a04 | 0.1 s |
| Stale clean merge | 1 / 1 | r041-2, a04 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r041-2, a04 a05 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r041-1 | 17 | 11 | 6 | 0 | 0 | 53 | — |
| a02 | r041-1 | 13 | 7 | 6 | 0 | 0 | 60 | — |
| a03 | r041-1 | 37 | 20 | 17 | 0 | 0 | 135 | — |
| a04 | r041-2 | 17 | 9 | 8 | 0 | 0 | 75 | commit-conflict, stale-clean-merge, decoy |
| a05 | r041-2 | 23 | 8 | 15 | 0 | 0 | 148 | commit-conflict, stale-clean-merge, decoy |
| a06 | r041-3 | 17 | 8 | 9 | 0 | 0 | 150 | — |
| a07 | r041-3 | 14 | 5 | 9 | 0 | 0 | 35 | — |
| a08 | r041-3 | 40 | 17 | 23 | 0 | 0 | 69 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 119 | — |
| **Total** |  | **184** | **86** | **93** | **5** | **0** | **844** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 124 · pnpm 1 · tsc 2 · vitest 3 · other 450

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r041-1-agents-notes | 45 | 45 | 45 | 6 | 45 | 463 |
| r041-3-packages-llm | 49 | 49 | 49 | 3 | 49 | 514 |
| r041-2-packages-client | 23 | 23 | 23 | 2 | 23 | 437 |
| **lead** | — | — | — | — | 134 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r041-1-agents-notes | 0 | 1 | 0 | 0 | 0 | — / — |
| r041-2-packages-client | 1 | 0 | 1 | 1 | 73 | 73 / 73 |
| r041-3-packages-llm | 0 | 1 | 1 | 1 | 44 | 44 / 44 |
| **lead repair** | 1 | — | 1 | — | — | 127,996 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r040) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 769.4 MiB (23.2 MiB / 637.7 MiB / 21.3 MiB / 87.3 MiB) | 779.0 MiB (23.5 MiB / 645.3 MiB / 21.4 MiB / 88.9 MiB) | +9.6 MiB |
| Version figures from | — | incremental (68,478 changed paths) | — |
| Files / directories / symlinks | 58,325 / 9,247 / 4,293 | 59,387 / 9,289 / 4,303 | +1,062 / +42 / +10 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 1.09 GiB | 1.12 GiB | +31.1 MiB |
| **Space amplification** (total · tracked) | 1.45× · tracked 4.94× | 1.47× · tracked 4.93× | 0.02 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **8.16** (0.72 / 0.13 / 0.77) | 1.28× the median range |
| **Stored per Commit** | 20.7 KiB | 37.8 KiB | — |
| Metadata share | 0.41 | 0.41 | this range 0.47 |
| History: Commits / Layers / Branches | 48,092 | 48,936 / 26 / 540 | +844 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 12.79 GiB (Commits 10.71 GiB · installs 878.3 MiB · build 102.7 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 41.34 GiB / 42% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 669.0 MiB | 0.86 | +13.8 MiB |
| Metadata | 101.6 MiB | 0.13 | +2.5 MiB |
| Index rows + waste + other (live, not split) | 376.1 MiB | 0.48 | — |
| **Total = Store on disk** | **1.12 GiB** | **= 1.47** space amplification | +31.1 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 23.5 MiB | 115.9 MiB (63.6 MiB + 52.3 MiB) | 4.93× | — | 1.3 MiB | 3.8 MiB | 0.33 |
| `node_modules` | 645.3 MiB | 207.4 MiB (184.3 MiB + 23.1 MiB) | 0.32× | — | 2.3 MiB | 7.7 MiB | 0.30 |
| Build output | 21.4 MiB | 19.6 MiB (18.2 MiB + 1.4 MiB) | 0.92× | — | 975.7 KiB | 7.8 MiB | 0.12 |
| `.git` | 88.9 MiB | 398.2 MiB (381.6 MiB + 16.6 MiB) | 4.48× | — | 11.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 376.1 MiB | — (not divided) | — | 14.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 29.5 MiB | — | — | — | — | — |
| **Total** | — | **1.12 GiB** | **= 1.47×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +4,145 | — | 0 (derived) | 63% |
| Chunks (large files) | — (at snapshots) | +1,060 | — | — | 9% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 3,771 (with inodes, pooled) | — | — | 53% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,318 | — | — | — |

Delta: 1.8% at depth cap · 30% of refused bases stopped by budget · `node_modules` reinstall: 0.11× the raw bytes of 5 changed packages (ratio: 872900 new stored for 7955000 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.93× (115.9 MiB for 23.5 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.1 KiB / 3.0 KiB / 6.5 KiB over 251 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.20× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (3.2 MiB stored for 1.87 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.49 (3 lanes × 779.0 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 3.0 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.8 ms / 48.7 ms (1.29×) | 2.6 ms / 4.5 ms (1.12×) | 3.3 ms / 7.2 ms (1.19×) | 20.4 ms / 54.7 ms (1.16×) | 10.1 ms / 19.1 ms (0.87×) | 308 ms / 308 ms (3.36×) | — (native comparison in P3; exec 39.5 ms / 798 ms) |
| SQL p50: 171 stmts | 54 stmts | 58 stmts | 205 stmts | 52 stmts | 9,092 stmts | — |

**Commit cost:** 14.09 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 679 ms p50 over 227
**Slowest:** sandbox.exec 36061 ms · sandbox.exec 32086 ms · sandbox.exec 30825 ms · checkpoint diff_commits 0.10 ms and 1.53 statements per entry (68,353 entries per page)
**Scaling:** 13 of 15 probes flat · `list_largest` 0.22 · `glob_tree` 0.17

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 343 ms / 343 ms | — / — | — | git / status-cold: — |
| git status (steady) | 399 ms / 585 ms | — / — | — | git / status-steady: — |
| git add | 30.0 ms / 78.0 ms | — / — | — | git / add: — |
| git commit (lane) | 36.0 ms / 57.0 ms | — / — | — | git / commit: — |
| lead writes main | 4973 ms / 4973 ms | — / — | — | — |
| repack | 1764 ms / 1764 ms | — / — | — | — |
| pnpm install (incremental) | 3758 ms / 3758 ms | 1882 ms / 1882 ms | 2.00× | pnpm-reinstall / cold: — |
| pnpm refresh | 2869 ms / 2869 ms | 1853 ms / 1853 ms | 1.55× | pnpm-reinstall / steady: — |
| tsc -b | 8302 ms / 8302 ms | 7418 ms / 7418 ms | 1.12× | tsc-b / cold: — |
| vitest | 11418 ms / 11418 ms | 6037 ms / 6037 ms | 1.89× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.9 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.0 ms / 23.9 ms

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
| 030.a1 | 35023 | 803.7 | 11.61 (1.97×) · 6627 · 246 (20 solo) | 8.70 (1.40×) · 6083 · 271 (95 solo) | 8.80 (1.21×) · 6033 · 300 (131 solo) | 3.05 (1.53×) · 3118 · 48 (2 solo) | 12.55 (1.38×) · 1362 · — (daemon) | 10.40 (1.25×) · 4431 · — (daemon) | 319.45 (—×) · 470795 · 10330 (3 solo) |
| 031.a1 | 35351 | 835.9 | 10.84 (1.84×) · 9623 · — (0 solo) | 7.16 (1.15×) · 5428 · 604 (5 solo) | 7.65 (1.05×) · 5813 · 375 (2 solo) | 2.45 (1.23×) · 3199 · — (0 solo) | 9.88 (1.08×) · 1362 · — (daemon) | 8.96 (1.07×) · 3894 · — (daemon) | 2.22 (—×) · 517 · 29 (2 solo) |
| 032.a1 | 36538 | 870.9 | 8.46 (1.43×) · 7501 · 364 (16 solo) | 8.20 (1.32×) · 7234 · 347 (148 solo) | 8.68 (1.19×) · 7395 · 379 (121 solo) | 2.78 (1.39×) · 3904 · — (0 solo) | 10.21 (1.12×) · 1362 · — (daemon) | 8.89 (1.07×) · 4608 · — (daemon) | 411.44 (—×) · 721312 · 10559 (4 solo) |
| 033.a1 | 37184 | 890.5 | 8.67 (1.47×) · 6143 · 211 (1 solo) | 7.75 (1.25×) · 6430 · 313 (52 solo) | 8.79 (1.20×) · 6155 · 349 (41 solo) | 2.20 (1.10×) · 2939 · — (0 solo) | 10.93 (1.20×) · 1362 · — (daemon) | 9.95 (1.19×) · 3945 · — (daemon) | 275.58 (—×) · 323482 · 7567 (3 solo) |
| 034.a1 | 38594 | 922.8 | 8.67 (1.47×) · 7209 · 251 (12 solo) | 7.74 (1.25×) · 6773 · 286 (41 solo) | 8.25 (1.13×) · 6167 · 285 (64 solo) | 2.67 (1.34×) · 3236 · 109 (3 solo) | 9.90 (1.09×) · 1362 · — (daemon) | 11.18 (1.34×) · 5652 · — (daemon) | 323.49 (—×) · 478357 · 9655 (3 solo) |
| 035.a1 | 39429 | 946.2 | 9.31 (1.58×) · 7774 · 496 (3 solo) | 7.08 (1.14×) · 6352 · 374 (14 solo) | 7.95 (1.09×) · 6919 · 379 (35 solo) | 2.90 (1.45×) · 3561 · — (0 solo) | 9.60 (1.05×) · 1362 · — (daemon) | 9.73 (1.17×) · 5136 · — (daemon) | 1.65 (—×) · 517 · 42 (2 solo) |
| 036.a1 | 42419 | 983.6 | 4.94 (0.84×) · 4436 · 191 (10 solo) | 5.16 (0.83×) · 4546 · 179 (108 solo) | 5.66 (0.78×) · 4695 · 263 (58 solo) | 2.39 (1.20×) · 3015 · — (0 solo) | 9.14 (1.00×) · 1362 · — (daemon) | — (—×) · — · — (daemon) | 293.22 (—×) · 516618 · 9785 (3 solo) |
| 037.a1 | 44313 | 1021.6 | 6.90 (1.17×) · 5915 · 256 (17 solo) | 6.49 (1.04×) · 5682 · 260 (104 solo) | 7.31 (1.00×) · 6249 · 347 (75 solo) | 2.35 (1.18×) · 3344 · 46 (3 solo) | 9.89 (1.08×) · 1362 · — (daemon) | 8.00 (0.96×) · 5229 · — (daemon) | 336.24 (—×) · 498534 · 11405 (4 solo) |
| 038.a2 | 45294 | 1047.5 | 6.63 (1.12×) · 6925 · 193 (4 solo) | 6.80 (1.09×) · 6457 · 292 (38 solo) | 6.77 (0.93×) · 5696 · 451 (13 solo) | 2.04 (1.02×) · 3306 · 205 (1 solo) | 9.79 (1.07×) · 1362 · — (daemon) | 8.32 (1.00×) · 4461 · — (daemon) | 333.42 (—×) · 424298 · 9993 (3 solo) |
| 039.a1 | 46731 | 1087.5 | 8.82 (1.49×) · 8311 · 303 (20 solo) | 7.84 (1.26×) · 7620 · 370 (39 solo) | 8.44 (1.16×) · 7734 · 470 (23 solo) | 2.39 (1.20×) · 3326 · 93 (2 solo) | 9.97 (1.09×) · 1362 · — (daemon) | 8.24 (0.99×) · 4332 · — (daemon) | 271.77 (—×) · 460242 · 11032 (4 solo) |
| 040.a1 | 48092 | 1115.5 | 7.50 (1.27×) · 6245 · 256 (10 solo) | 7.75 (1.25×) · 6643 · 357 (37 solo) | 8.52 (1.17×) · 7129 · 416 (40 solo) | 2.57 (1.29×) · 3394 · — (0 solo) | 9.38 (1.03×) · 1362 · — (daemon) | 8.97 (1.08×) · 4484 · — (daemon) | 299.26 (—×) · 446500 · 10520 (4 solo) |
| 041.a1 | 48936 | 1146.6 | 8.71 (1.47×) · 6751 · 270 (18 solo) | 8.10 (1.30×) · 5915 · 374 (42 solo) | 9.30 (1.28×) · 6306 · 383 (58 solo) | 2.31 (1.16×) · 3228 · 125 (1 solo) | 9.74 (1.07×) · 1362 · — (daemon) | 9.90 (1.19×) · 4616 · — (daemon) | 308.48 (—×) · 515638 · 11672 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4185952 → 4152992 B · fs.write ≤8 KiB 12392 → 4152992 B · fs.write ≤64 KiB 4157112 → 4152992 B · fs.read ≤8 KiB 4185952 → 4194304 B · sandbox.mount 4185952 → 3036472 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4140632 B
**Host load (1-min, recorded, not waited on):** macOS 5.13 at the first command → 7.60 after the last (max 9.14 over 7 commands) · Docker VM 1.56 → 1.56

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
| control-030.a1 | 12851 · 207.8 | 35023 · 803.7 | 6.52 (1.05× first) / 6.57 · 1.01× · 115/145 | 5.74 (0.90× first) / 5.93 · 1.03× · 109/122 | 2.34 (0.84× first) / 2.64 · 1.13× · 66/96 | 8.48 → 8.48 | pass |
| control-031.a1 | 12851 · 207.8 | 35351 · 835.9 | 5.70 (0.92× first) / 6.21 · 1.09× · 114/149 | 5.63 (0.88× first) / 6.05 · 1.07× · 110/121 | 2.25 (0.81× first) / 2.54 · 1.13× · 69/87 | 8.96 → 8.88 | pass |
| control-032.a1 | 12851 · 207.8 | 36538 · 868.0 | 6.10 (0.98× first) / 5.38 · 0.88× · 112/149 | 5.68 (0.89× first) / 5.18 · 0.91× · 109/124 | 2.23 (0.80× first) / 2.07 · 0.93× · 72/105 | 7.71 → 7.49 | pass |
| control-033.a1 | 12851 · 207.8 | 37184 · 890.5 | 4.97 (0.80× first) / 5.69 · 1.14× · 113/146 | 4.97 (0.78× first) / 5.09 · 1.02× · 110/125 | 2.22 (0.80× first) / 2.59 · 1.17× · 87/101 | 11.27 → 11.01 | pass |
| control-034.a1 | 12851 · 207.8 | 38594 · 919.9 | 6.44 (1.04× first) / 6.01 · 0.93× · 115/148 | 5.11 (0.80× first) / 5.24 · 1.02× · 111/126 | 2.34 (0.84× first) / 2.42 · 1.03× · 72/106 | 12.20 → 11.47 | pass |
| control-035.a1 | 12851 · 207.8 | 39429 · 946.2 | 5.19 (0.84× first) / 5.65 · 1.09× · 116/128 | 5.27 (0.83× first) / 4.88 · 0.93× · 111/125 | 2.06 (0.74× first) / 2.45 · 1.19× · 72/112 | 8.02 → 7.78 | pass |
| control-036.a1 | 12851 · 207.8 | 42419 · 980.9 | 5.88 (0.95× first) / 5.68 · 0.97× · 113/236 | 5.55 (0.87× first) / 5.36 · 0.96× · 109/129 | 2.03 (0.73× first) / 2.34 · 1.15× · 62/130 | 6.20 → 6.67 | watch (fs.write ≤1 KiB, fs.read ≤8 KiB) |
| control-037.a1 | 12851 · 207.8 | 44313 · 1021.6 | 5.21 (0.84× first) / 5.51 · 1.06× · 115/135 | 4.95 (0.77× first) / 5.01 · 1.01× · 110/126 | 2.30 (0.82× first) / 2.45 · 1.06× · 74/117 | 6.41 → 7.18 | pass |
| control-038.a1 | 12851 · 207.8 | 44313 · 1047.7 | 5.49 (0.88× first) / 5.82 · 1.06× · 112/147 | 5.80 (0.91× first) / 4.91 · 0.85× · 109/125 | 2.34 (0.84× first) / 2.54 · 1.09× · 75/115 | 7.06 → 7.21 | pass |
| control-038.a2 | 12851 · 207.8 | 45294 · 1047.5 | 5.38 (0.87× first) / 6.70 · 1.25× · 114/146 | 4.88 (0.76× first) / 5.01 · 1.03× · 110/123 | 2.65 (0.95× first) / 2.43 · 0.92× · 75/116 | 6.58 → 6.53 | pass |
| control-039.a1 | 12851 · 207.8 | 46731 · 1084.9 | 5.66 (0.91× first) / 5.67 · 1.00× · 113/133 | 5.27 (0.82× first) / 5.60 · 1.06× · 108/123 | 2.26 (0.81× first) / 2.62 · 1.16× · 75/137 | 6.90 → 6.75 | pass |
| control-040.a1 | 12851 · 207.8 | 48092 · 1115.5 | 5.35 (0.86× first) / 5.33 · 1.00× · 113/131 | 4.95 (0.77× first) / 4.91 · 0.99× · 110/122 | 2.10 (0.76× first) / 2.11 · 1.00× · 70/116 | 6.23 → 6.21 | pass |
| control-041.a1 | 12851 · 207.8 | 48936 · 1143.9 | 5.63 (0.91× first) / 5.34 · 0.95× · 113/130 | 5.32 (0.83× first) / 5.27 · 0.99× · 110/127 | 2.36 (0.85× first) / 2.64 · 1.12× · 72/135 | 7.33 → 7.33 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-041.a1)

## 5. Findings and action

### Finding 041.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |

Diagnosis pending: `finding-041.a1.json`.

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

- **a1 (`p3-main-v`, live after r40 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 15 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,939 emitted). Control `control-041.a1` passes. Report check F1–F8 PASS.
- **The only optimize row** is Counters `merge.returned_rows` (chain-bounded): the latest cap period's maximum is 2,513 rows against the first period's 1,941 (1.295×, bound period 8). The r39–r40 `diff_files.statements` row is back to pass. Recorded, not acted on (fast mode).
- **Fix 058 exempted nothing** in this range (`checks.tree.gitIgnored` is empty). `r041-1-agents-notes.end` has no test candidates and no changed package (P4 and P5 n/a).
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 14.22×). Merge p50 308 ms (3.36×, inside r23–r40's band). One-shot Commit 1.16×, write 1.29× (9.8 ms, +2.2 ms, under the 5 ms floor), mount 0.87×; read and list are under the floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 5.1–9.1.
- Final steps: lanes 22 s + 15 s + 84 s (cuts at plan orders 19 and 39; the last part is the longest so far, so later ranges get more cuts), repair 112 s (alarm 200 s), verify 13 s, finish 38 s. Repair install 36.1 s, build 22.5 s, tests 3.5 s.
- Watch items: index rows + waste + other 376.1 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 9.82 ms per file over 18 calls, 173 statements and 8,643 VM steps per call; contended 29.35 ms over 8 (728 statements, process-wide; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1958/1958; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.22× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.188) and statements per entry does not rise (0.018): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.47 | < 0.5 | pass |
| Reinstall growth | 0.11× the raw bytes of 5 changed packages (ratio: 872900 new stored for 7955000 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0179 (budget 0.2956) | < 0.1 | pass |
| Range growth | 30.9 MiB, 0.92× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.42 | < 0.8 | pass |
| Wall projection | 0.92 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 134 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 15 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 80 · build 5; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.20× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 184 | 185 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 844 | 715 |
| Workspaces (one-shot share) | 227 (0.99) | 92 (0.978) |
| Reads | 270 | 270 |
| Reconcile writes | 110 | 110 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 10 | 24.61 | 379.71 | 379.71 | 419.23 | 1.51× | 7.33× | -0.15 | 0.02 | 319 / 30,535 / 0 | — | 0.1017 ms per entrie | — |
| branch.diff_commits | 2–4 entries · uncontended | 2 | 3.53 | 3.53 | 3.53 | 4.03 | no baseline | no baseline | — | — | 51 / 4,054 / 0 | — | 1.7635 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 364 | 19.03 | 35.54 | 67.36 | 344.36 | 1.10× | 1.37× | -0.28 | -0.20 | 301 / 33,604 / 0 | — | 0.1049 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 1.56 | 1.89 | 1.89 | 2.61 | 1.72× | 1.44× | -0.73 | -0.44 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.80 | 0.80 | 0.80 | 1.03 | no baseline | no baseline | -0.47 | -0.36 | 70 / 1,298 / 0 | — | 0.0399 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 308.48 | 308.48 | 308.48 | 321.16 | 3.36× | 3.36× | -1.27 | -0.49 | 9,092 / 515,638 / 0 | — | 2.3789 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.67 | 4.67 | 4.67 | 4.67 | 0.92× | 0.92× | -3.87 | -2.91 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 29.58 | 29.58 | 29.58 | 29.58 | 1.21× | 1.21× | -0.28 | -0.14 | 187 / 13,124 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 1 | 69.48 | 69.48 | 69.48 | 69.48 | 5.86× | 5.14× | 1.09 | 1.03 | 1,444 / 222,660 / 16,382 | — | 0.2791 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 4 | 7.75 | 8.27 | 8.27 | 10.94 | 1.08× | 0.96× | -0.24 | -0.20 | 181 / 8,875 / 0 | — | 0.0245 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 13 | 7.68 | 11.34 | 11.34 | 12.01 | 1.32× | 1.41× | -0.59 | -0.42 | 153 / 7,729 / 0 | — | 0.0264 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 1 | 10.91 | 10.91 | 10.91 | 10.91 | 2.02× | 1.81× | -0.08 | 0.02 | 417 / 25,024 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 10 | 7.10 | 9.95 | 9.95 | 10.37 | 1.14× | 1.08× | -1.32 | -0.67 | 174 / 8,557 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 6.44 | 6.44 | 6.44 | 6.44 | 1.07× | 1.00× | -0.38 | -0.11 | 150 / 7,565 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 13 | 7.58 | 12.70 | 12.70 | 13.79 | 1.03× | 1.58× | -0.99 | -0.69 | 185 / 9,180 / 0 | — | 0.0056 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 1 | 7.95 | 7.95 | 7.95 | 7.95 | 2.86× | 2.86× | -0.07 | -0.18 | 135 / 14,832 / 0 | — | 0.1727 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 4.30 | 5.50 | 5.50 | 6.25 | 1.52× | 1.45× | -0.67 | -0.47 | 64 / 6,365 / 0 | — | 0.1287 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 2.44 | 2.59 | 2.59 | 6.61 | 1.38× | 1.34× | 0.48 | 0.29 | 51 / 3,833 / 0 | — | 0.724 ms per file | — |
| fs.glob | 5–16 files · contended | 2 | 6.10 | 6.10 | 6.10 | 6.94 | 3.63× | 3.63× | 0.24 | 0.21 | 79 / 9,392 / 0 | — | 0.4358 ms per file | — |
| fs.glob | 5–16 files · uncontended | 12 | 3.89 | 8.29 | 8.29 | 11.81 | 1.93× | 3.64× | 0.88 | 0.65 | 67 / 7,480 / 0 | — | 0.486 ms per file | — |
| fs.glob | >64 files · contended | 5 | 3.94 | 4.26 | 4.26 | 6.29 | 0.73× | 0.79× | -1.03 | -0.92 | 95 / 6,045 / 0 | — | 0.0253 ms per file | — |
| fs.glob | >64 files · uncontended | 18 | 3.65 | 8.40 | 8.40 | 8.64 | 0.37× | 0.60× | -1.65 | -1.52 | 62 / 5,073 / 0 | — | 0.0246 ms per file | — |
| fs.grep | 17–64 files · uncontended | 9 | 10.45 | 22.20 | 22.20 | 37.93 | 1.82× | 3.70× | 0.76 | 0.34 | 269 / 12,209 / 0 | — | 0.2437 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 2 | 2.61 | 2.61 | 2.61 | 3.79 | 1.13× | 0.82× | -0.14 | -0.28 | 63 / 3,862 / 0 | — | 0.6518 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 6.68 | 6.68 | 6.68 | 6.68 | 2.25× | 1.32× | 1.05 | 0.72 | 125 / 8,254 / 0 | — | 0.8354 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 6 | 4.16 | 10.30 | 10.30 | 23.70 | 1.11× | 1.72× | 0.19 | 0.20 | 109 / 7,484 / 0 | — | 0.5936 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 8 | 19.12 | 31.79 | 31.79 | 32.15 | 1.22× | 2.02× | 0.93 | 0.65 | 456 / 19,296 / 0 | — | 0.0865 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 18 | 19.08 | 44.41 | 44.41 | 44.85 | 1.05× | 1.93× | 0.82 | 0.49 | 352 / 18,239 / 0 | — | 0.0943 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 7 | 4.54 | 5.49 | 5.49 | 6.32 | 1.89× | 2.28× | -0.54 | -0.39 | 89 / 9,158 / 0 | — | 0.1078 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 23 | 2.97 | 7.19 | 8.64 | 11.85 | 1.19× | 2.45× | -1.00 | -0.85 | 56 / 3,845 / 0 | — | 0.0594 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 2 | 3.21 | 3.21 | 3.21 | 18.00 | 1.70× | 1.57× | 0.69 | 0.38 | 49 / 3,542 / 0 | — | 1.0687 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 4.17 | 4.17 | 4.17 | 5.00 | 1.79× | 1.47× | 0.18 | 0.32 | 70 / 6,926 / 0 | — | 0.5215 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 13 | 3.31 | 4.16 | 4.16 | 4.49 | 1.74× | 1.09× | 0.63 | 0.50 | 60 / 4,869 / 0 | — | 0.3945 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 2.92 | 2.92 | 2.92 | 3.40 | 1.32× | 1.32× | -0.53 | -0.32 | 75 / 3,878 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 7 | 2.81 | 3.14 | 3.14 | 4.51 | 1.77× | 1.98× | 0.10 | 0.02 | 67 / 3,612 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 6 | 2.56 | 2.69 | 2.69 | 30.48 | 0.92× | 0.96× | -1.81 | -1.17 | 55 / 3,429 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 2.79 | 4.12 | 4.12 | 4.71 | 1.33× | 0.69× | -0.88 | -0.52 | 49 / 3,901 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 21 | 2.31 | 4.50 | 4.50 | 4.80 | 1.12× | 1.26× | -0.32 | -0.20 | 49 / 3,228 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 8 | 29.35 | 41.21 | 41.21 | 47.61 | 2.79× | 2.90× | 2.02 | 1.51 | 728 / 63,249 / 0 | — | 29.347 ms per file | commit |
| fs.rm | 1 files · uncontended | 18 | 9.82 | 15.01 | 15.01 | 15.85 | 1.47× | 1.34× | 0.15 | 0.46 | 173 / 8,643 / 0 | — | 9.823 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 4 | 2.96 | 3.48 | 3.48 | 5.08 | 1.36× | 1.56× | 0.01 | -0.13 | 64 / 4,159 / 0 | — | 0.0055 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 9 | 2.56 | 3.31 | 3.31 | 3.52 | 1.67× | 2.15× | 0.56 | 0.56 | 50 / 3,347 / 0 | — | 0.0056 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.19 | 2.19 | 2.19 | 10.09 | 1.04× | 1.04× | 0.04 | -0.09 | 41 / 3,171 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 3 | 2.01 | 2.01 | 2.01 | 2.73 | 0.77× | 0.59× | -0.17 | -0.18 | 38 / 2,417 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 11 | 1.96 | 2.67 | 2.67 | 2.72 | 1.00× | 1.24× | 0.53 | 0.20 | 43 / 3,130 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 1 | 2.67 | 2.67 | 2.67 | 2.67 | 1.19× | 0.89× | 0.62 | 0.44 | 53 / 3,580 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 13 | 2.29 | 2.97 | 2.97 | 3.16 | 1.37× | 0.85× | -0.04 | -0.01 | 44 / 3,394 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 46 | 18.38 | 131.16 | 144.59 | 150.73 | 2.16× | 8.80× | -0.17 | 0.17 | 411 / 24,692 / 0 | — | 0.0417 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 66 | 8.71 | 15.39 | 21.53 | 45.74 | 1.37× | 1.46× | -0.72 | -0.36 | 157 / 6,751 / 0 | — | 0.0179 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 17 | 15.69 | 52.93 | 52.93 | 119.10 | 0.97× | 3.29× | 0.05 | 0.22 | 383 / 22,872 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 16 | 11.75 | 18.99 | 18.99 | 20.11 | 1.43× | 2.30× | 0.20 | 0.21 | 152 / 8,036 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 72 | 14.19 | 49.77 | 69.82 | 110.36 | 1.43× | 2.26× | -0.13 | 0.05 | 323 / 17,577 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 172 | 9.30 | 19.41 | 22.18 | 22.34 | 1.29× | 1.42× | -0.01 | 0.12 | 155 / 6,306 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 97 | 12.55 | 64.63 | 83.16 | 108.31 | 1.28× | 2.88× | -0.49 | -0.22 | 310 / 16,767 / 0 | — | 0.0044 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 167 | 8.10 | 16.40 | 18.12 | 91.97 | 1.12× | 1.18× | -0.05 | 0.08 | 148 / 5,915 / 0 | — | 0.002 ms per byte | files.change |
| operator.store.stats | — · uncontended | 1 | 0.60 | 0.60 | 0.60 | 0.60 | 0.79× | 0.79× | -1.17 | -0.80 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 35 | 24.48 | 43.82 | 44.81 | 48.90 | 1.16× | 1.26× | -0.50 | -0.42 | 290 / 23,259 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 83 | 24.16 | 43.20 | 84.70 | 186.39 | 1.16× | 1.25× | -0.24 | -0.20 | 270 / 21,774 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 13 | 3.72 | 6.52 | 6.52 | 8.25 | 0.97× | 0.80× | 1.02 | 0.79 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 43 | 3.27 | 5.52 | 6.57 | 7.09 | 0.82× | 1.08× | -0.21 | -0.15 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 5 | 20.95 | 29.43 | 29.43 | 37.62 | 2.17× | 1.52× | 0.55 | 0.40 | 313 / 18,019 / 0 | — | 20.945 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 13 | 9.90 | 11.72 | 11.72 | 15.73 | 1.19× | 0.96× | -0.29 | -0.20 | 110 / 4,616 / 0 | — | 9.902 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 396.60 | 396.60 | 396.60 | 396.60 | 10.41× | 10.41× | -2.51 | -1.51 | 20,205 / 657,378 / 0 | — | 396.6 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · uncontended | 1 | 3.85 | 3.85 | 3.85 | 3.85 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 3.85 ms per file | observe.after |
| sandbox.commit | 2–4 files · Committed · contended | 3 | 26.39 | 26.39 | 26.39 | 54.66 | 1.77× | 1.34× | 2.29 | 1.55 | 400 / 19,319 / 82 | — | 8.7977 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 10 | 10.81 | 21.39 | 21.39 | 27.20 | 1.01× | 1.25× | -0.21 | -0.17 | 145 / 4,433 / 0 | — | 4.0097 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 21.87 | 21.87 | 21.87 | 21.87 | 1.33× | 1.33× | -0.70 | -0.47 | 169 / 8,642 / 0 | — | 3.124 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 509.26 | 509.26 | 509.26 | 509.26 | no baseline | no baseline | 2.29 | 1.87 | 5,282 / 470,860 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 89.94 | 981.37 | 981.37 | 13499.06 | 1.30× | 14.22× | -0.04 | 0.10 | 1,354 / 82,284 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 202 | 543.25 | 809.05 | 992.65 | 3972.21 | 10.60× | 2.11× | -1.32 | -0.76 | — | 3986.70 | — | — |
| sandbox.exec | 0 files · uncontended | 175 | 33.15 | 586.61 | 674.50 | 6261.61 | 1.04× | 2.05× | -0.22 | -0.20 | — | 4022.70 | — | — |
| sandbox.exec | 1 files · contended | 30 | 39.04 | 66.74 | 72.04 | 77.85 | 1.06× | 0.79× | 0.09 | 0.06 | — | 5 | 39.037 ms per file | — |
| sandbox.exec | 1 files · uncontended | 48 | 37.33 | 59.79 | 64.30 | 74.39 | 1.12× | 0.88× | 0.16 | 0.13 | — | 5.70 | 37.325 ms per file | — |
| sandbox.exec | 17–64 files · contended | 2 | 82.89 | 82.89 | 82.89 | 148.82 | 1.19× | 1.19× | -0.02 | -0.01 | — | 95 | 4.1447 ms per file | — |
| sandbox.exec | 2–4 files · contended | 27 | 38.42 | 60.67 | 68.17 | 71.15 | 0.99× | 0.87× | -0.04 | -0.06 | 0 / 0 / 0 | 11.70 | 12.8083 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 27 | 42.91 | 64.09 | 64.15 | 66.35 | 1.12× | 0.98× | -0.46 | -0.24 | — | 13.70 | 15.251 ms per file | — |
| sandbox.exec | 5–16 files · contended | 14 | 58.94 | 68.17 | 68.17 | 76.72 | 1.01× | 0.94× | 0.86 | 0.62 | — | 37 | 6.8327 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 10 | 66.91 | 76.46 | 76.46 | 82.32 | 0.94× | 0.73× | -0.06 | 0.08 | — | 37 | 8.6276 ms per file | — |
| sandbox.exec | — · contended | 11 | 2875.72 | 30824.99 | 30824.99 | 32086.24 | no baseline | no baseline | -1.55 | -1.09 | — | 52652.70 | — | — |
| sandbox.exec | — · uncontended | 24 | 295.08 | 18853.47 | 22532.24 | 36060.75 | 0.56× | 2.65× | 0.16 | -0.01 | — | 41522.60 | — | — |
| sandbox.mount | — · contended | 70 | 11.66 | 21.26 | 30.39 | 42.66 | 1.04× | 1.12× | 0.17 | 0.14 | 60 / 1,668 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 147 | 9.74 | 15.77 | 25.10 | 73.40 | 0.87× | 0.78× | -0.18 | -0.13 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.28 | 4.39 | 4.39 | 46.17 | no baseline | no baseline | 0.15 | 0.12 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 52 | 13.54 | 24.88 | 26.02 | 26.60 | 1.28× | 1.37× | 0.25 | 0.25 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 165 | 11.88 | 22.61 | 148.22 | 215.82 | 1.13× | 1.23× | 0.19 | 0.16 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 10 | 0.0 KiB | 533.8 KiB | 2,390 | ok 10 |
| branch.diff_commits | branch | 371 | 0.0 KiB | 20.2 MiB | 69,248 | ok 371 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.4 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 14 | 1.2 MiB | 0.0 KiB | 25 | Committed 14 |
| fs.diff_files | fs | 47 | 0.0 KiB | 317.9 KiB | 38 | Text 36, NoSuchPath 9, Equal 2 |
| fs.glob | fs | 60 | 0.0 KiB | 71.1 KiB | 906 | ok 60 |
| fs.grep | fs | 54 | 0.0 KiB | 281.7 KiB | 842 | ok 54 |
| fs.list | fs | 59 | 0.0 KiB | 411.4 KiB | 2,553 | ok 59 |
| fs.read | fs | 48 | 0.0 KiB | 183.9 KiB | 48 | ok 48 |
| fs.rm | fs | 26 | 0.0 KiB | 0.0 KiB | 26 | Committed 26 |
| fs.stat | fs | 52 | 0.0 KiB | 11.9 KiB | 52 | ok 52 |
| fs.write | fs | 653 | 10.8 MiB | 0.0 KiB | 653 | Committed 653 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 223 | 0.0 KiB | 0.0 KiB | 0 | Committed 165, UpToDate 57, Conflict 1 |
| sandbox.exec | sandbox | 580 | 1.8 MiB | 3.6 MiB | 0 | exit:0 578, exit:2 2 |
| sandbox.mount | sandbox | 227 | 0.0 KiB | 0.0 KiB | 0 | Mounted 227 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 227 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 227 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.56 · end 1.56.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.646 | 11.407 · 1.647 · 1.646 · 1.407 · 1.346 | 1.66–1.66 | statements 37, vm_steps 1189, fullscan_steps 0, sorts 0, returned_rows 97 |
| read | 1.382 | 1.49 · 1.655 · 1.374 · 1.271 · 1.382 | 1.66–1.66 | statements 21, vm_steps 844, fullscan_steps 0, sorts 0, returned_rows 81 |
| list_small | 1.498 | 1.498 · 1.28 · 1.718 · 1.542 · 1.354 | 1.66–1.66 | statements 21, vm_steps 853, fullscan_steps 0, sorts 0, returned_rows 81 |
| list_largest | 7.175 | 9.063 · 7.328 · 6.816 · 6.913 · 7.175 | 1.66–1.66 | statements 143, vm_steps 15778, fullscan_steps 0, sorts 0, returned_rows 1754 |
| grep_scoped | 1.378 | 1.794 · 1.378 · 1.347 · 1.256 · 1.489 | 1.66–1.66 | statements 26, vm_steps 999, fullscan_steps 0, sorts 0, returned_rows 90 |
| glob_scoped | 1.248 | 1.248 · 1.122 · 1.344 · 1.497 · 1.219 | 1.66–1.66 | statements 20, vm_steps 832, fullscan_steps 0, sorts 0, returned_rows 80 |
| grep_tree | 4841.35 | 4841.35 · 4842.214 · 4780.157 · 4845.84 · 4749.242 | 1.47–1.61 | statements 56257, vm_steps 4268394, fullscan_steps 0, sorts 0, returned_rows 426760 |
| glob_tree | 8.511 | 10.802 · 8.839 · 8.392 · 8.279 · 8.511 | 1.47–1.47 | statements 151, vm_steps 18431, fullscan_steps 0, sorts 0, returned_rows 2002 |
| diff_files | 5.302 | 6.32 · 5.302 · 5.389 · 5.069 · 5.05 | 1.47–1.47 | statements 102, vm_steps 4876, fullscan_steps 0, sorts 0, returned_rows 480 |
| list_commits | 0.829 | 1.402 · 0.715 · 0.961 · 0.829 · 0.682 | 1.47–1.47 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.425 | 2.425 · 1.795 · 13.156 · 2.33 · 2.51 | 1.47–1.47 | statements 55, vm_steps 2388, fullscan_steps 0, sorts 0, returned_rows 291 |
| fork | 0.842 | 0.842 · 0.74 · 1.457 · 6.877 · 0.589 | 1.47–1.47 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 27.715 | 27.809 · 27.715 · 50.047 · 27.25 · 25.765 | 1.47–1.47 | statements 522, vm_steps 30651, fullscan_steps 0, sorts 0, returned_rows 2513 |
| oneshot_mount_unmount | 21.36 | 44.638 · 21.36 · 19.124 · 23.839 · 19.905 | 1.52–1.52 | statements 71, vm_steps 2409, fullscan_steps 82, sorts 2, returned_rows 233 |
| oneshot_commit | 70.764 | 83.47 · 67.751 · 81.898 · 70.764 · 70.156 | 1.52–1.52 | statements 182, vm_steps 11649, fullscan_steps 82, sorts 2, returned_rows 962 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.52–1.52 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 275.3 s** (tooling): play 110.8 · consolidate 109.1 · verify 16.2 · probes 25.2 · tests 0.0 · seal + snapshot 0.0 · report 14.0

275.29 s tooling: prepare 1.52 · play 109.30 · consolidate 109.11 · verify 8.72 (diff_commits) · version walk 7.49 · probes 25.22 · metrics 0.70 · Store allocation 0.24 · report 0.37

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T02:52:57.794Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.22× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.188) and statements per entry does not rise (0.018): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8); Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-041.a1.json`
- trace `~/lfs-history/runs/p3-main-v/trace/range-041.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-v/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r041-1-agents-notes | 463 | 523.7 KiB |
| r041-3-packages-llm | 514 | 521.5 KiB |
| r041-2-packages-client | 437 | 522.0 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 399.0 | 4,256 |
| `git diff --stat` | 33.0 | 4,249 |
| `git add -f` | 30.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 36.0 | 4,253 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r041-1-agents-notes | end | P1 | pass | — | — |
| r041-1-agents-notes | end | P2 | pass | exit 0 | — |
| r041-1-agents-notes | end | P3 | pass | 261 bookkeeping path(s) | — |
| r041-1-agents-notes | end | P4 | n/a | no changed package to build | — |
| r041-1-agents-notes | end | P5 | n/a | no calibrated file | — |
| r041-1-agents-notes | end | P6 | n/a | not a repair | — |
| r041-2-packages-client | end | P1 | pass | — | — |
| r041-2-packages-client | end | P2 | pass | exit 0 | — |
| r041-2-packages-client | end | P3 | n/a | an install, not a refresh | — |
| r041-2-packages-client | end | P4 | pass | 403 emitted files, exit 2 | — |
| r041-2-packages-client | end | P5 | pass | 73 files | — |
| r041-2-packages-client | end | P6 | n/a | not a repair | — |
| r041-3-packages-llm | end | P1 | pass | — | — |
| r041-3-packages-llm | end | P2 | pass | exit 0 | — |
| r041-3-packages-llm | end | P3 | pass | 261 bookkeeping path(s) | — |
| r041-3-packages-llm | end | P4 | pass | 236 emitted files, exit 2 | — |
| r041-3-packages-llm | end | P5 | pass | 44 files | — |
| r041-3-packages-llm | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1939 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
