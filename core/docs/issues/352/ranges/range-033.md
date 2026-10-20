# Range 033 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r032 (live Store)
dsh `0e8979596`..`f712bca31` · **61 commits** (10 mainline, 51 side) · 2026-07-23 → 2026-07-23
Areas changed: `/` 17% · `packages/client` 13% · `packages/ui` 10% · other 61%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 79.1 s · git 81.9 s · Node 211.5 s · verify 11.9 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **735.5 MiB** (+2.6 MiB) | **890.5 MiB** (+19.6 MiB) | **1.21×** (prev 1.19×) | **24.6 MiB** | **646** (total 37,184) | **256.2 s** tooling (total 95.9 min) |

**Checks:** 12 pass · 6 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.17× it; Scaling not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (5 classes too narrow); Directory share 0.502; Range growth 24.6 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 2811 ms for 772.5 MiB new; size exponent not judged (2 snapshots) · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe grep_scoped +594% · ▲ sandbox.exec p95 +161% · ▲ sandbox.commit p95 +74%
**Budget:** 34 of 202 ranges · projected total 16.1 h (budget 16.8 h) · disk 39% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **2,946 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,493 / 1,493 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2578 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 378 bin shims, 4065 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `f712bca31`** · 120 commits written for 120 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r033-1-packages-client | end | `c89bb302d1f1` | `492e0e166225` | pass (380 normalized) | pass | pass | pass | pass | n/a |
| r033-2-agents-notes | end | `85d6eab355d5` | `492e0e166225` | pass (380 normalized) | pass | pass | pass | pass | n/a |
| r033-3-root | end | `22767a44cb4f` | `a61c5f4c0916` | pass (382 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `acc42262f7ef` | `null` | n/a | pass | n/a | n/a | pass | pass (121,018 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/core/tools/tests/ts-types.spec.ts` (fails natively) · `packages/core/tools/tests/schema.spec.ts` (fails natively) · `packages/core/tools/tests/json-schema.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/tools/tests/execution-mode.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/tools/tests/properties.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-recovery.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/scope-lifecycle.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/tasks/tool-tasks/tests/tool-tasks.spec.ts` (fails natively) · `packages/client/i18n/tests/i18n.spec.ts` (fails natively) · `packages/client/i18n/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/client-loader.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/boot.spec.tsx` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/tools.spec.ts` (fails natively) · `packages/ui/acp/tests/session-list.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/modes.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/host/runtime/tests/host-runtime.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/pty/pty/tests/service.spec.ts` (fails natively).

## 2. Activity

**2,155 calls** · **138 steps** by **8 agents + lead** on **3 Branches + main** · **173 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +40 added · 527 modified · −8 deleted · 10.8 MiB written · fs 531 : Sandbox 44 (**12 : 1**, reported only in P3)
**Execs:** 448 (JS 54 · shell 394) · 3 non-zero exits · install 0 · test runs 5 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 788 | 544 | 244 | Committed 533 · NoSuchPath 4 · Text 33 · UpToDate 11 |
| sandbox | 968 | 618 | 4 | commit 170 (Committed 128, UpToDate 41, Conflict 1) · exec 448 (exit:0 445, exit:2 3) · mount 173 (Mounted 173) · status 4 · unmount 173 (Unmounted 173) |
| branch | 389 | 32 | 357 | diff_branches 9 · diff_commits 348 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,155** | **1,194** | **615** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r033-1-packages-client | a01 a02 | 37 | 169 | ✓ | — |
| r033-2-agents-notes | a03 a04 a05 | 56 | 188 | ✓ | — |
| r033-3-root | a06 a07 a08 | 39 | 180 | ✓ | — |
| main | lead | 6 | 109 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r033-2, a05 after a04 | 0.1 s |
| Stale clean merge | 1 / 1 | r033-2, a03 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r033-2, a03 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r033-1 | 17 | 9 | 8 | 0 | 0 | 77 | — |
| a02 | r033-1 | 20 | 9 | 11 | 0 | 0 | 92 | — |
| a03 | r033-2 | 10 | 7 | 3 | 0 | 0 | 37 | stale-clean-merge, decoy |
| a04 | r033-2 | 30 | 18 | 12 | 0 | 0 | 130 | commit-conflict, decoy |
| a05 | r033-2 | 16 | 4 | 12 | 0 | 0 | 21 | commit-conflict, stale-clean-merge |
| a06 | r033-3 | 22 | 10 | 12 | 0 | 0 | 96 | — |
| a07 | r033-3 | 8 | 4 | 4 | 0 | 0 | 58 | — |
| a08 | r033-3 | 9 | 3 | 6 | 0 | 0 | 26 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 109 | — |
| **Total** |  | **138** | **65** | **68** | **5** | **0** | **646** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 94 · pnpm 1 · tsc 3 · vitest 5 · other 345

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r033-3-root | 26 | 26 | 26 | 2 | 26 | 326 |
| r033-2-agents-notes | 36 | 36 | 36 | 0 | 36 | 438 |
| r033-1-packages-client | 25 | 25 | 25 | 0 | 25 | 394 |
| **lead** | — | — | — | — | 120 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r033-1-packages-client | 0 | 1 | 1 | 1 | 57 | 57 / 57 |
| r033-2-agents-notes | 0 | 1 | 1 | 1 | 7 | 7 / 7 |
| r033-3-root | 1 | 0 | 1 | 1 | 71 | 71 / 71 |
| **lead repair** | 1 | — | 1 | — | — | 121,018 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r032) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 732.9 MiB (19.5 MiB / 624.9 MiB / 17.6 MiB / 71.0 MiB) | 735.5 MiB (19.7 MiB / 625.6 MiB / 17.9 MiB / 72.2 MiB) | +2.6 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 54,160 / 8,844 / 3,936 | 54,442 / 8,972 / 4,073 | +282 / +128 / +137 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 870.9 MiB | 890.5 MiB | +19.6 MiB |
| **Space amplification** (total · tracked) | 1.19× · tracked 4.84× | 1.21× · tracked 4.83× | 0.02 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **8.01** (0.94 / 0.19 / 0.66) | 1.40× the median range |
| **Stored per Commit** | 30.2 KiB | 30.5 KiB | — |
| Metadata share | 0.38 | 0.39 | this range 0.50 |
| History: Commits / Layers / Branches | 36,538 | 37,184 / 19 / 325 | +646 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 13.36 GiB (Commits 11.51 GiB · installs 895.4 MiB · build 107.8 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 43.10 GiB / 39% | — |
| Snapshot | — | r033, 772.5 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 546.4 MiB | 0.74 | +10.1 MiB |
| Metadata | 74.4 MiB | 0.10 | +2.4 MiB |
| Index rows | 226.6 MiB | 0.31 | — |
| Waste | 42.0 MiB | 0.06 | — |
| Other | 1.1 MiB | 0.00 | — |
| **Total = Store on disk** | **890.5 MiB** | **= 1.21** space amplification | +19.6 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 19.7 MiB | 95.3 MiB (56.0 MiB + 39.3 MiB) | 4.83× | — | 1.1 MiB | 3.1 MiB | 0.36 |
| `node_modules` | 625.6 MiB | 196.9 MiB (180.8 MiB + 16.1 MiB) | 0.32× | — | 1.1 MiB | 899.6 KiB | 1.22 |
| Build output | 17.9 MiB | 14.0 MiB (13.1 MiB + 930.9 KiB) | 0.78× | — | 737.8 KiB | 6.8 MiB | 0.11 |
| `.git` | 72.2 MiB | 286.4 MiB (275.3 MiB + 11.1 MiB) | 3.97× | — | 9.2 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 269.6 MiB | — (not divided) | — | 7.1 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 28.3 MiB | — | — | — | — | — |
| **Total** | — | **890.5 MiB** | **= 1.21×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 127,686 | +2,613 | 6.2 KiB | 0 (derived) | 53% |
| Chunks (large files) | 51,066 | +620 | 14.9 KiB | — | 8% |
| Large-file extents | 14,507 | — | 0.3 KiB | — | — |
| Directories | 228,911 | 2,828 (with inodes, pooled) | 0.2 KiB | — | 45% |
| Inodes and attributes | 232,659 | ↑ pooled | 2.7 KiB | — | — |
| Symlinks | 2,260 | +4,114 | 0.1 KiB | — | — |

Delta: 2.0% at depth cap · 24% of refused bases stopped by budget · `node_modules` reinstall: absolute: 1025528 new stored bytes for 783592 raw changed bytes of 41 changed packages (1.309×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.83× (95.3 MiB for 19.7 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.8 KiB / 3.1 KiB / 6.0 KiB over 207 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.8 MiB stored for 1.83 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.40 (3 lanes × 735.5 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 3.1 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.4 ms / 29.5 ms (1.22×) | 2.4 ms / 4.2 ms (1.07×) | 3.6 ms / 9.1 ms (1.31×) | 21.0 ms / 159 ms (1.32×) | 11.3 ms / 20.1 ms (0.98×) | 276 ms / 276 ms (3.29×) | — (native comparison in P3; exec 41.7 ms / 2640 ms) |
| SQL p50: 156 stmts | 50 stmts | 58 stmts | 226 stmts | 53 stmts | 7,081 stmts | — |

**Commit cost:** 14.69 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 577 ms p50 over 173
**Slowest:** sandbox.exec 39972 ms · sandbox.exec 27671 ms · sandbox.exec 27616 ms · checkpoint diff_commits 0.10 ms and 1.51 statements per entry (64,170 entries per page)
**Scaling:** 11 of 15 probes flat · `grep_scoped` 29.34 · `glob_scoped` 0.86 · `diff_files` 2.10 · `fork` 0.68

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 344 ms / 344 ms | — / — | — | git / status-cold: — |
| git status (steady) | 297 ms / 513 ms | — / — | — | git / status-steady: — |
| git add | 35.0 ms / 77.0 ms | — / — | — | git / add: — |
| git commit (lane) | 37.0 ms / 71.0 ms | — / — | — | git / commit: — |
| lead writes main | 3567 ms / 3567 ms | — / — | — | — |
| repack | 1700 ms / 1700 ms | — / — | — | — |
| pnpm install (incremental) | 4361 ms / 4361 ms | 1975 ms / 1975 ms | 2.21× | pnpm-reinstall / cold: — |
| pnpm refresh | 2728 ms / 2728 ms | 2048 ms / 2048 ms | 1.33× | pnpm-reinstall / steady: — |
| tsc -b | 6716 ms / 6716 ms | 4547 ms / 5023 ms | 1.48× | tsc-b / cold: — |
| vitest | 10970 ms / 10970 ms | 9840 ms / 9840 ms | 1.11× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.0 ms / 29.5 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4140632 B · fs.write ≤8 KiB 3205392 → 4140632 B · fs.write ≤64 KiB 4194304 → 4140632 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3127112 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 3481432 B
**Host load (1-min, recorded, not waited on):** macOS 6.67 at the first command → 8.12 after the last (max 8.22 over 6 commands) · Docker VM 3.32 → 3.33

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-033.a1)

## 5. Findings and action

### Finding 033.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.787 | < 0.05 |

Diagnosis pending: `finding-033.a1.json`.

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

- **a1 (`p3-main-u`, live after r32 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 17 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,591 emitted). Control `control-033.a1` passes. Report check F1–F8 PASS.
- **The only optimize row** is Counters `glob_tree.vm_steps` per tree file, depth exponent 0.787 over the 3 same-binary points r31–r33, as at r25–r26 on the earlier binary. Recorded, not acted on (fast mode).
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` 0 files class, 12.17×). Merge p50 276 ms, 3.29× the baseline. One-shot Commit 1.32× (21.0 ms), write 1.22×; read, list and mount are under the 5 ms floor or at 1.0×.
- **SDK JS pinned** from r33: origin/main 6ee064ce91 (fix 056) changed `sdk/js`, so the run now loads main 3c7852e50f's `sdk/js` from `core/target/lead31/sdk-js-3c7852e5` (sha256 `e990c25c`, unchanged; `run.json` `sdkJsPins`). The addon stays `0611f3e0` (liaison 2026-10-20).
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 7.5–8.2.
- Final steps: lanes 19 s + 66 s (cut at plan order 30), repair 114 s (alarm 160 s), verify 15 s, finish 47 s. Repair install 40.0 s, build 20.5 s, tests 3.7 s. From r34 the repair alarm is 200 s (owner 2026-10-20).
- Watch items: index rows 226.6 MiB (sealed; #366). `fs.rm` uncontended p50 8.84 ms per file over 7 calls, 7,561 VM steps (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1493/1493; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.17× it | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.787 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (5 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.502 | < 0.5 | watch |
| Reinstall growth | absolute: 1025528 new stored bytes for 783592 raw changed bytes of 41 changed packages (1.309×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0201 (budget 0.237) | < 0.1 | pass |
| Range growth | 24.6 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 2811 ms for 772.5 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.39 | < 0.8 | pass |
| Wall projection | 0.96 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 120 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 138 | 139 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 646 | 547 |
| Workspaces (one-shot share) | 173 (0.99) | 67 (0.97) |
| Reads | 194 | 194 |
| Reconcile writes | 102 | 102 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 9 | 39.51 | 304.66 | 304.66 | 437.51 | 2.43× | 5.88× | 11.96 | 33.91 | 501 / 49,025 / 0 | — | 0.1756 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 347.67 | 347.67 | 347.67 | 347.67 | no baseline | no baseline | — | — | 7,299 / 271,564 / 0 | — | 1.6715 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 342 | 20.28 | 34.18 | 54.61 | 328.80 | 1.18× | 1.32× | 0.33 | 0.55 | 298 / 32,707 / 0 | — | 0.106 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.33 | 3.18 | 3.18 | 3.72 | 1.47× | 2.41× | -0.19 | 7.73 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · contended | 1 | 1.82 | 1.82 | 1.82 | 1.82 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0908 ms per entrie | — |
| branch.list_commits | 17–64 entries · uncontended | 1 | 0.81 | 0.81 | 0.81 | 0.81 | no baseline | no baseline | -2.04 | -11.54 | 70 / 1,298 / 0 | — | 0.0406 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 275.58 | 275.58 | 275.58 | 275.58 | 3.29× | 3.29× | — | — | 7,081 / 323,482 / 0 | — | 4.3059 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 306.06 | 306.06 | 306.06 | 306.06 | 3.33× | 3.33× | — | — | 7,680 / 451,277 / 0 | — | 4.3107 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.56 | 1.56 | 1.56 | 1.56 | 1.00× | 1.00× | -8.24 | -16.50 | 35 / 517 / 0 | — | 0.0183 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 6.95 | 6.95 | 6.95 | 6.95 | 1.37× | 1.37× | 7.85 | -12.38 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 22.09 | 22.09 | 22.09 | 22.09 | 0.91× | 0.91× | — | — | 164 / 10,769 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 3 | 20.14 | 20.14 | 20.14 | 23.28 | 2.01× | 1.17× | — | — | 439 / 78,892 / 8,191 | — | 0.0039 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 1 | 14.24 | 14.24 | 14.24 | 14.24 | 2.18× | 1.31× | — | — | 168 / 65,640 / 8,191 | — | 0.0078 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 3 | 5.77 | 5.77 | 5.77 | 10.37 | 0.80× | 0.67× | -2.00 | -17.46 | 154 / 6,980 / 0 | — | 0.0051 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 5 | 8.53 | 14.08 | 14.08 | 14.83 | 1.46× | 1.75× | 5.92 | 13.65 | 184 / 10,828 / 0 | — | 0.0302 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 3 | 9.74 | 9.74 | 9.74 | 10.37 | 1.80× | 1.62× | 7.55 | 15.90 | 210 / 11,656 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 14 | 10.50 | 15.14 | 15.14 | 15.55 | 1.69× | 1.64× | 3.92 | 8.50 | 193 / 10,489 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 7.87 | 7.87 | 7.87 | 7.87 | 1.30× | 1.22× | — | — | 293 / 12,820 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 6 | 7.27 | 8.68 | 8.68 | 10.96 | 0.98× | 1.08× | -5.36 | -15.78 | 189 / 8,717 / 0 | — | 0.0012 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 1 | 7.42 | 7.42 | 7.42 | 7.42 | 2.67× | 2.67× | 9.63 | 29.48 | 108 / 16,530 / 0 | — | 0.265 ms per file | — |
| fs.glob | 17–64 files · uncontended | 3 | 3.32 | 3.32 | 3.32 | 12.99 | 1.17× | 0.87× | -5.23 | -21.41 | 56 / 4,723 / 0 | — | 0.1382 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 1.60 | 1.60 | 1.60 | 1.60 | 0.88× | 0.88× | — | — | 35 / 2,595 / 0 | — | 0.5327 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 1.98 | 1.98 | 1.98 | 2.76 | 1.12× | 1.02× | 1.90 | 0.21 | 40 / 3,056 / 0 | — | 0.6613 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 2.22 | 2.22 | 2.22 | 2.22 | 1.32× | 1.32× | -8.40 | -29.22 | 34 / 2,085 / 0 | — | 0.4448 ms per file | — |
| fs.glob | 5–16 files · uncontended | 9 | 2.58 | 3.21 | 3.21 | 3.69 | 1.28× | 1.41× | -2.37 | -8.54 | 52 / 4,148 / 0 | — | 0.2869 ms per file | — |
| fs.glob | >64 files · contended | 4 | 6.36 | 7.86 | 7.86 | 9.89 | 1.18× | 1.45× | -15.56 | -34.18 | 194 / 11,618 / 0 | — | 0.0516 ms per file | — |
| fs.glob | >64 files · uncontended | 10 | 6.65 | 26.36 | 26.36 | 28.41 | 0.68× | 1.87× | 2.07 | 12.93 | 83 / 9,285 / 0 | — | 0.0598 ms per file | — |
| fs.grep | 17–64 files · contended | 2 | 21.29 | 21.29 | 21.29 | 114.65 | 3.56× | 3.56× | 5.68 | 26.82 | 210 / 13,058 / 0 | — | 0.3803 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 4 | 6.94 | 10.99 | 10.99 | 39.54 | 1.21× | 1.83× | 11.12 | 27.95 | 151 / 8,878 / 0 | — | 0.2314 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 4 | 2.85 | 3.31 | 3.31 | 3.98 | 1.23× | 1.04× | 11.14 | 26.30 | 57 / 3,386 / 0 | — | 0.7633 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 4.02 | 4.02 | 4.02 | 19.19 | 1.36× | 0.80× | 8.61 | 11.40 | 68 / 3,693 / 0 | — | 0.447 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 3.19 | 11.07 | 11.07 | 45.56 | 0.85× | 1.84× | -2.90 | -16.87 | 74 / 3,770 / 0 | — | 0.3544 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 27.15 | 27.15 | 27.15 | 40.93 | 1.73× | 1.73× | — | — | 685 / 40,336 / 0 | — | 0.2073 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 10 | 20.29 | 25.70 | 25.70 | 27.78 | 1.11× | 1.12× | 14.53 | 34.07 | 292 / 15,543 / 0 | — | 0.1773 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 4 | 6.47 | 9.14 | 9.14 | 12.58 | 2.69× | 3.80× | 6.04 | 19.11 | 121 / 10,891 / 0 | — | 0.1293 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 10 | 4.05 | 5.20 | 5.20 | 7.22 | 1.62× | 1.77× | -2.31 | -6.19 | 78 / 7,157 / 0 | — | 0.081 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 5 | 1.93 | 3.65 | 3.65 | 8.05 | 1.02× | 1.79× | 6.21 | 6.57 | 43 / 3,016 / 0 | — | 0.5213 ms per entrie | — |
| fs.list | 5–16 entries · contended | 3 | 3.67 | 3.67 | 3.67 | 4.18 | 1.57× | 1.29× | — | — | 125 / 6,149 / 0 | — | 0.4074 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 11 | 2.49 | 3.38 | 3.38 | 12.21 | 1.31× | 0.89× | 3.50 | 5.10 | 48 / 3,415 / 0 | — | 0.3593 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 4 | 2.44 | 2.84 | 2.84 | 3.20 | 1.54× | 1.79× | 3.38 | 2.36 | 54 / 4,266 / 0 | — | 0.0031 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 2.71 | 2.71 | 2.71 | 3.90 | 0.97× | 0.97× | — | — | 54 / 3,534 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 3.10 | 4.15 | 4.15 | 7.65 | 1.47× | 0.70× | -2.04 | -10.60 | 50 / 3,427 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 20 | 2.20 | 3.71 | 3.71 | 4.79 | 1.07× | 1.04× | -1.39 | -7.51 | 47 / 2,939 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 1 | 10.63 | 10.63 | 10.63 | 10.63 | 1.01× | 0.75× | 16.51 | 34.32 | 231 / 18,678 / 0 | — | 10.626 ms per file | commit |
| fs.rm | 1 files · uncontended | 7 | 8.84 | 9.22 | 9.22 | 21.48 | 1.32× | 0.82× | 9.69 | 10.52 | 141 / 7,561 / 0 | — | 8.842 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 3.47 | 3.47 | 3.47 | 3.47 | 1.60× | 1.55× | — | — | 68 / 4,552 / 0 | — | 0.0077 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 1 | 1.52 | 1.52 | 1.52 | 1.52 | 0.99× | 0.99× | -10.84 | -37.89 | 41 / 1,854 / 0 | — | 0.0022 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 1.95 | 1.95 | 1.95 | 1.95 | 0.93× | 0.93× | — | — | 34 / 3,590 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.00 | 2.00 | 2.00 | 3.38 | 0.77× | 0.58× | -5.11 | -25.07 | 35 / 2,488 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 14 | 2.24 | 7.03 | 7.03 | 14.22 | 1.14× | 3.26× | 21.82 | 49.31 | 41 / 3,414 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 1.30 | 1.30 | 1.30 | 3.55 | 0.58× | 0.43× | -7.82 | -36.41 | 23 / 716 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 11 | 2.28 | 5.07 | 5.07 | 7.00 | 1.36× | 1.45× | 0.87 | 1.57 | 42 / 2,855 / 0 | — | 0.0008 ms per byte | — |
| fs.write | ≤1 KiB · contended | 22 | 13.42 | 108.83 | 192.21 | 201.87 | 1.57× | 7.30× | -4.33 | -12.81 | 278 / 15,356 / 0 | — | 0.0267 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 18 | 8.67 | 18.78 | 18.78 | 25.94 | 1.36× | 1.78× | -4.80 | -11.16 | 146 / 6,143 / 0 | — | 0.0192 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 5 | 14.19 | 15.79 | 15.79 | 22.87 | 0.88× | 0.98× | -6.01 | -14.86 | 374 / 21,772 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 31 | 11.28 | 19.32 | 19.36 | 85.54 | 1.37× | 2.34× | 2.22 | 5.83 | 156 / 8,103 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 72 | 13.00 | 32.85 | 40.22 | 195.03 | 1.31× | 1.49× | 0.98 | -1.65 | 265 / 14,507 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 157 | 8.79 | 21.72 | 31.54 | 57.71 | 1.22× | 1.59× | 2.89 | 7.18 | 150 / 6,155 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 72 | 13.87 | 38.42 | 102.82 | 204.59 | 1.42× | 1.71× | -1.17 | -3.10 | 251 / 13,230 / 0 | — | 0.0044 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 142 | 7.75 | 15.48 | 19.51 | 20.75 | 1.08× | 1.12× | 1.90 | 3.58 | 145 / 6,430 / 0 | — | 0.0026 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.67 | 0.67 | 0.67 | 0.67 | 0.88× | 0.88× | -12.37 | -30.38 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 30 | 29.53 | 66.32 | 160.87 | 222.55 | 1.40× | 1.90× | 0.45 | 3.72 | 327 / 22,539 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 58 | 27.37 | 145.13 | 237.33 | 298.00 | 1.32× | 4.19× | 0.87 | 6.21 | 293 / 21,817 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 10 | 3.56 | 7.36 | 7.36 | 9.34 | 0.93× | 0.91× | 4.81 | 13.73 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 30 | 3.46 | 6.20 | 6.70 | 13.54 | 0.86× | 1.21× | -2.10 | -4.90 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 6 | 13.39 | 19.10 | 19.10 | 25.83 | 1.39× | 0.99× | -2.13 | -0.65 | 143 / 7,251 / 0 | — | 13.393 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 7 | 9.95 | 10.29 | 10.29 | 13.71 | 1.20× | 0.84× | 1.79 | 6.31 | 112 / 3,945 / 0 | — | 9.95 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 297.20 | 297.20 | 297.20 | 297.20 | 7.80× | 7.80× | — | — | 14,151 / 429,911 / 0 | — | 297.2 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · contended | 1 | 7.93 | 7.93 | 7.93 | 7.93 | no baseline | no baseline | — | — | 179 / 8,117 / 0 | — | 7.931 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 10.93 | 15.57 | 15.57 | 22.40 | 0.73× | 0.79× | 5.15 | 13.14 | 127 / 4,700 / 0 | — | 4.6425 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 4 | 12.01 | 21.34 | 21.34 | 62.93 | 1.12× | 1.25× | 6.83 | 16.90 | 114 / 4,138 / 0 | — | 5.2385 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 11.29 | 11.29 | 11.29 | 11.29 | 0.68× | 0.68× | — | — | 133 / 4,823 / 0 | — | 2.2582 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 9.62 | 9.62 | 9.62 | 9.62 | 0.70× | 0.70× | -7.98 | -25.89 | 132 / 6,564 / 0 | — | 1.9236 ms per file | commit |
| sandbox.commit | — · Committed · contended | 4 | 97.60 | 112.63 | 112.63 | 161.92 | no baseline | no baseline | — | — | 680 / 47,246 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 8 | 51.06 | 839.68 | 839.68 | 13886.58 | 0.74× | 12.17× | -5.03 | -22.60 | 302 / 19,690 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 165 | 65.16 | 740.92 | 3834.09 | 3940.60 | 1.27× | 1.93× | -33.88 | -118.73 | — | 3,172 | — | — |
| sandbox.exec | 0 files · uncontended | 113 | 33.93 | 481.69 | 765.54 | 7075.81 | 1.07× | 1.68× | -0.14 | 0.48 | — | 3258.30 | — | — |
| sandbox.exec | 1 files · contended | 26 | 40.38 | 58.24 | 67.78 | 68.16 | 1.10× | 0.69× | 5.58 | 16.87 | — | 5.30 | 40.385 ms per file | — |
| sandbox.exec | 1 files · uncontended | 27 | 35.59 | 60.82 | 64.92 | 86.45 | 1.07× | 0.90× | 3.10 | 7.02 | — | 5.70 | 35.592 ms per file | — |
| sandbox.exec | 17–64 files · contended | 1 | 69.52 | 69.52 | 69.52 | 69.52 | 0.99× | 0.99× | — | — | — | 98 | 3.6589 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 4 | 63.94 | 71.06 | 71.06 | 74.81 | 0.92× | 1.02× | -6.00 | -14.01 | — | 99 | 3.1968 ms per file | — |
| sandbox.exec | 2–4 files · contended | 21 | 36.85 | 67.17 | 67.17 | 76.36 | 0.95× | 0.96× | 0.49 | -1.27 | — | 12.30 | 16.7913 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 21 | 44.53 | 54.51 | 54.51 | 63.80 | 1.17× | 0.83× | 0.72 | 0.17 | — | 11 | 15.7953 ms per file | — |
| sandbox.exec | 5–16 files · contended | 6 | 40.56 | 57.05 | 57.05 | 74.22 | 0.69× | 0.79× | 12.35 | 23.42 | — | 16.80 | 8.113 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 14 | 59.28 | 93.37 | 93.37 | 95.00 | 0.83× | 0.89× | -6.65 | -10.03 | — | 38 | 8.0672 ms per file | — |
| sandbox.exec | — · contended | 13 | 4355.98 | 26719.48 | 26719.48 | 27615.82 | no baseline | no baseline | 0.22 | -1.99 | — | 50096.10 | — | — |
| sandbox.exec | — · uncontended | 27 | 250.22 | 20545.55 | 27671.00 | 39972.48 | 0.47× | 2.89× | -0.04 | 6.76 | — | 34662.60 | — | — |
| sandbox.mount | — · contended | 58 | 12.15 | 22.18 | 23.23 | 23.47 | 1.09× | 1.17× | 2.62 | 9.20 | 57 / 1,632 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 105 | 10.93 | 16.33 | 22.41 | 40.72 | 0.98× | 0.81× | 1.88 | 5.76 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.68 | 3.68 | 3.68 | 3.68 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 4.82 | 4.82 | 4.82 | 216.84 | no baseline | no baseline | 5.95 | 15.68 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 48 | 13.52 | 22.77 | 26.25 | 39.88 | 1.28× | 1.26× | 2.24 | 6.34 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 115 | 11.75 | 37.36 | 181.02 | 259.08 | 1.12× | 2.03× | 2.40 | 4.67 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 9 | 0.0 KiB | 480.4 KiB | 2,118 | ok 9 |
| branch.diff_commits | branch | 348 | 0.0 KiB | 19.1 MiB | 64,983 | ok 348 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.1 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 17 | 884.5 KiB | 0.0 KiB | 28 | Committed 17 |
| fs.diff_files | fs | 37 | 0.0 KiB | 563.4 KiB | 33 | NoSuchPath 4, Text 33 |
| fs.glob | fs | 42 | 0.0 KiB | 54.5 KiB | 677 | ok 42 |
| fs.grep | fs | 43 | 0.0 KiB | 191.0 KiB | 743 | ok 43 |
| fs.list | fs | 45 | 0.0 KiB | 228.5 KiB | 1,494 | ok 45 |
| fs.read | fs | 37 | 0.0 KiB | 120.2 KiB | 37 | ok 37 |
| fs.rm | fs | 8 | 0.0 KiB | 0.0 KiB | 8 | Committed 8 |
| fs.stat | fs | 40 | 0.0 KiB | 8.9 KiB | 40 | ok 40 |
| fs.write | fs | 519 | 10.3 MiB | 0.0 KiB | 519 | Committed 508, UpToDate 11 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 170 | 0.0 KiB | 0.0 KiB | 0 | Committed 128, UpToDate 41, Conflict 1 |
| sandbox.exec | sandbox | 448 | 1.6 MiB | 4.7 MiB | 0 | exit:0 445, exit:2 3 |
| sandbox.mount | sandbox | 173 | 0.0 KiB | 0.0 KiB | 0 | Mounted 173 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 173 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 173 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 3.32 · end 3.33.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.22 | 11.006 · 1.332 · 1.209 · 1.206 · 1.22 | 4.36–4.36 | statements 32, vm_steps 1045, fullscan_steps 0, sorts 0, returned_rows 89 |
| read | 1.217 | 1.541 · 1.203 · 1.177 · 1.352 · 1.217 | 4.36–4.36 | statements 18, vm_steps 742, fullscan_steps 0, sorts 0, returned_rows 75 |
| list_small | 1.203 | 1.198 · 1.283 · 1.203 · 1.16 · 1.314 | 4.36–4.36 | statements 18, vm_steps 751, fullscan_steps 0, sorts 0, returned_rows 75 |
| list_largest | 6.412 | 7.568 · 6.102 · 6.302 · 6.412 · 38.389 | 4.36–4.36 | statements 121, vm_steps 13835, fullscan_steps 0, sorts 0, returned_rows 1407 |
| grep_scoped | 7.263 | 7.263 · 9.878 · 10.582 · 2.656 · 2.466 | 4.36–4.36 | statements 23, vm_steps 897, fullscan_steps 0, sorts 0, returned_rows 84 |
| glob_scoped | 1.297 | 1.43 · 1.278 · 1.251 · 1.628 · 1.297 | 4.36–4.36 | statements 17, vm_steps 730, fullscan_steps 0, sorts 0, returned_rows 74 |
| grep_tree | 4496.997 | 5056.142 · 4620.781 · 4496.997 · 4437.264 · 4349.275 | 3.61–4.25 | statements 48599, vm_steps 3826092, fullscan_steps 0, sorts 0, returned_rows 385578 |
| glob_tree | 6.78 | 8.976 · 7.075 · 6.78 · 6.503 · 6.267 | 3.61–3.61 | statements 133, vm_steps 18367, fullscan_steps 0, sorts 0, returned_rows 1883 |
| diff_files | 5.738 | 5.684 · 5.738 · 6.193 · 6.385 · 5.667 | 3.61–3.61 | statements 90, vm_steps 4336, fullscan_steps 0, sorts 0, returned_rows 450 |
| list_commits | 0.956 | 1.885 · 1.038 · 0.956 · 0.956 · 0.792 | 3.61–3.61 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.775 | 3.793 · 2.775 · 2.563 · 2.884 · 2.743 | 3.61–3.61 | statements 62, vm_steps 2462, fullscan_steps 0, sorts 0, returned_rows 295 |
| fork | 0.847 | 0.74 · 0.967 · 0.703 · 0.847 · 0.858 | 3.61–3.61 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 27.755 | 30.779 · 26.808 · 27.421 · 27.755 · 28.539 | 3.61–3.61 | statements 488, vm_steps 24000, fullscan_steps 0, sorts 0, returned_rows 1941 |
| oneshot_mount_unmount | 15.856 | 20.597 · 14.601 · 18.827 · 14.863 · 15.856 | 3.61–3.61 | statements 66, vm_steps 2265, fullscan_steps 82, sorts 2, returned_rows 225 |
| oneshot_commit | 68.867 | 87.439 · 57.297 · 69.148 · 68.867 · 66.208 | 3.61–3.61 | statements 185, vm_steps 13165, fullscan_steps 82, sorts 2, returned_rows 1034 |
| oneshot_exec | — |  ·  ·  ·  ·  | 3.61–3.61 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r033: 227,956 pages of 4,096 B, 0 free · Commits 37,644 · Branches 740 · Layers 40 · compression 3.51× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 127,686 | 773.2 MiB |
| 2 | 51,066 | 742.9 MiB |
| 3 | 14,463 | 3.6 MiB |
| 4 | 44 | 8.7 KiB |
| 5 | 14,363 | 1.5 MiB |
| 6 | 90,777 | 445.7 MiB |
| 7 | 228,454 | 53.6 MiB |
| 8 | 457 | 142.6 KiB |
| 9 | 74,233 | 154.5 MiB |
| 10 | 40,464 | 5.0 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,260 | 185.0 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 38,515 | 74.4 MiB |
| 1 | 45,985 | 546.4 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 166,127 | 648.9 MiB | 23.1 MiB |
| inode_value | 35,971 | 140.5 MiB | 2.9 MiB |
| binding_hint | 10,019 | 39.1 MiB | 3.7 MiB |
| object_location | 8,924 | 34.9 MiB | 3.7 MiB |
| commit | 3,018 | 11.8 MiB | 1.8 MiB |
| file_digest | 1,173 | 4.6 MiB | 508.6 KiB |
| commit_lineage | 810 | 3.2 MiB | 372.2 KiB |
| commit_runs | 797 | 3.1 MiB | 435.0 KiB |
| commit_identity | 579 | 2.3 MiB | 250.6 KiB |
| content_signature | 157 | 628.0 KiB | 16.6 KiB |
| branch | 33 | 132.0 KiB | 23.9 KiB |
| branch_names | 13 | 52.0 KiB | 12.6 KiB |
| branch_identity | 9 | 36.0 KiB | 7.0 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 5 | 20.0 KiB | 7.5 KiB |
| layer | 3 | 12.0 KiB | 5.0 KiB |
| absorbed_heights | 3 | 12.0 KiB | 7.6 KiB |
| absorbed | 3 | 12.0 KiB | 7.6 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 256.2 s** (tooling): play 80.7 · consolidate 110.5 · verify 22.8 · probes 24.0 · tests 0.0 · seal + snapshot 7.3 · report 10.9

256.23 s tooling: prepare 1.66 · play 79.08 · consolidate 110.46 · verify 11.91 (diff_commits + full compareTree) · version walk 10.90 · probes 24.02 · metrics 0.75 · seal 1.29 · sealed figures 3.17 · snapshot copy 2.85 · report 0.38

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T00:08:40.227Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.17× it; Scaling: not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: glob_tree.vm_steps per tree file: depth exponent 0.787; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (5 classes too narrow); Directory share: 0.502; Range growth: 24.6 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 2811 ms for 772.5 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-033.a1.json`
- trace `~/lfs-history/runs/p3-main-u/trace/range-033.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-u/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-033.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r033-3-root | 326 | 358.3 KiB |
| r033-2-agents-notes | 438 | 360.5 KiB |
| r033-1-packages-client | 394 | 360.5 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 297.0 | 2,928 |
| `git diff --stat` | 34.0 | 2,922 |
| `git add -f` | 35.0 | — |
| `git rm --cached` | 9.0 | — |
| `git commit` | 37.0 | 2,925 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r033-1-packages-client | end | P1 | pass | — | — |
| r033-1-packages-client | end | P2 | pass | exit 0 | — |
| r033-1-packages-client | end | P3 | pass | 240 bookkeeping path(s) | — |
| r033-1-packages-client | end | P4 | pass | 271 emitted files, exit 2 | — |
| r033-1-packages-client | end | P5 | pass | 57 files | — |
| r033-1-packages-client | end | P6 | n/a | not a repair | — |
| r033-2-agents-notes | end | P1 | pass | — | — |
| r033-2-agents-notes | end | P2 | pass | exit 0 | — |
| r033-2-agents-notes | end | P3 | pass | 240 bookkeeping path(s) | — |
| r033-2-agents-notes | end | P4 | pass | 34 emitted files, exit 2 | — |
| r033-2-agents-notes | end | P5 | pass | 7 files | — |
| r033-2-agents-notes | end | P6 | n/a | not a repair | — |
| r033-3-root | end | P1 | pass | — | — |
| r033-3-root | end | P2 | pass | exit 0 | — |
| r033-3-root | end | P3 | n/a | an install, not a refresh | — |
| r033-3-root | end | P4 | pass | 385 emitted files, exit 2 | — |
| r033-3-root | end | P5 | pass | 71 files | — |
| r033-3-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1591 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
