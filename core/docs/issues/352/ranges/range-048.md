# Range 048 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r047 (live Store)
dsh `9236f24bc`..`19a9cfe03` · **65 commits** (5 mainline, 60 side) · 2026-07-28 → 2026-07-29
Areas changed: `packages/ui` 19% · `/` 19% · `packages/client` 17% · other 45%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.24×** · **Churn 0.00**
**Time split:** play 120.7 s · git 135.3 s · Node 207.3 s · verify 17.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **811.2 MiB** (+2.7 MiB) | **1.36 GiB** (+31.2 MiB) | **1.71×** (prev 1.68×) | **37.0 MiB** | **1,510** (total 58,088) | **335.8 s** tooling (total 163.6 min) |

**Checks:** 15 pass · 2 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.67× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.366) and statements per entry does not rise (0.062): the fixed and per-entry parts cannot be separated · 2 optimize/stop: Counters, Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe fork +75% · ▲ probe diff_commits +61% · ▼ fs.write p95 −48%
**Budget:** 49 of 202 ranges · projected total 15.7 h (budget 16.8 h) · disk 39% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,689 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,671 / 2,671 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3054 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 420 bin shims, 4579 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (57 lines from 4 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `19a9cfe03`** · 88 commits written for 88 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 220 untracked, unignored (1,044,126 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r048-1-root | end | `f6d807dcd39d` | `7bca6fb5c201` | pass (422 normalized) | pass | n/a | pass | n/a | n/a |
| r048-2-missions-tasks | end | `e97adcc60bc6` | `6c2be3049b86` | pass (422 normalized) | pass | pass | pass | pass | n/a |
| r048-3-packages-client | end | `4dc2b52cb52b` | `6c2be3049b86` | pass (422 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `62af5a51d69f` | `null` | n/a | pass | n/a | n/a | pass | pass (138,181 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/http-bridge.spec.ts` (fails natively) · `packages/client/connection/tests/native-dialog-request.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/projection-store.spec.ts` (fails natively) · `packages/client/runtime/tests/queue-store.spec.ts` (fails natively) · `packages/client/runtime/tests/scope.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/runtime/tests/wire-events.spec.ts` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-machine.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/queue-dock.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-snapshot.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/app-shell.spec.tsx` (fails natively) · `packages/client/web/tests/app.spec.tsx` (fails natively) · `packages/client/web/tests/base-styles.spec.ts` (fails natively) · `packages/client/web/tests/document-title.spec.tsx` (fails natively) · `packages/goal/goal-session/tests/goal-session.spec.ts` (fails natively) · `packages/goal/goal-session/tests/invariant.spec.ts` (fails natively) · `packages/goal/goal/tests/goal.spec.ts` (fails natively) · `packages/goal/goal/tests/invariant.spec.ts` (fails natively) · `packages/goal/goal/tests/projection.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-models.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-directory-picker.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-path-opener.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/llm/llm/tests/assembler.spec.ts` (fails natively) · `packages/llm/llm/tests/attribution.spec.ts` (fails natively) · `packages/llm/llm/tests/call-config.spec.ts` (fails natively) · `packages/llm/llm/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm/tests/message.spec.ts` (fails natively) · `packages/llm/llm/tests/properties.spec.ts` (fails natively) · `packages/llm/llm/tests/retry-policy.spec.ts` (fails natively) · `packages/llm/llm/tests/service.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/projection.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/inheritance.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/invariant.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/projection.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/ui/commands/tests/commands.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/integration.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/plan-mode.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/projection.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `apps/cli/tests/args.spec.ts` (fails natively) · `apps/cli/tests/trusted-hosts.spec.ts` (fails natively) · `apps/cli/tests/tsconfig-paths-loader.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/runtime/tests/wire-events.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively).

## 2. Activity

**3,446 calls** · **173 steps** by **8 agents + lead** on **3 Branches + main** · **225 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +348 added · 835 modified · −292 deleted · 19.0 MiB written · fs 1,338 : Sandbox 137 (**10 : 1**, reported only in P3)
**Execs:** 637 (JS 61 · shell 576) · 3 non-zero exits · install 0 · test runs 4 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,675 | 1,351 | 324 | Committed 1,351 · Text 29 · NoSuchPath 21 · Equal 3 |
| sandbox | 1,312 | 858 | 4 | commit 221 (Committed 174, UpToDate 46, Conflict 1) · exec 637 (exit:0 634, exit:2 3) · mount 225 (Mounted 225) · status 4 · unmount 225 (Unmounted 225) |
| branch | 449 | 32 | 417 | diff_branches 13 · diff_commits 404 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,446** | **2,241** | **755** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r048-1-root | a01 a02 | 42 | 473 | ✓ | — |
| r048-2-missions-tasks | a03 a04 | 48 | 448 | ✓ | — |
| r048-3-packages-client | a05 a06 a07 a08 | 77 | 485 | ✓ | — |
| main | lead | 6 | 104 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r048-1, a01 after a02 | 0.1 s |
| Stale clean merge | 1 / 1 | r048-1, a01 a02 | merged cleanly |
| Decoy edit | 1 / 1 | r048-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r048-1 | 24 | 10 | 14 | 0 | 0 | 233 | commit-conflict, stale-clean-merge, decoy |
| a02 | r048-1 | 18 | 6 | 12 | 0 | 0 | 240 | commit-conflict, stale-clean-merge, decoy |
| a03 | r048-2 | 22 | 8 | 14 | 0 | 0 | 56 | — |
| a04 | r048-2 | 26 | 14 | 12 | 0 | 0 | 392 | — |
| a05 | r048-3 | 16 | 7 | 9 | 0 | 0 | 68 | — |
| a06 | r048-3 | 19 | 9 | 10 | 0 | 0 | 111 | — |
| a07 | r048-3 | 37 | 20 | 17 | 0 | 0 | 194 | — |
| a08 | r048-3 | 5 | 3 | 2 | 0 | 0 | 112 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 104 | — |
| **Total** |  | **173** | **78** | **90** | **5** | **0** | **1,510** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 124 · pnpm 1 · tsc 3 · vitest 4 · other 505

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r048-2-missions-tasks | 35 | 35 | 35 | 1 | 35 | 605 |
| r048-3-packages-client | 55 | 55 | 54 | 8 | 55 | 968 |
| r048-1-root | 27 | 27 | 27 | 7 | 27 | 331 |
| **lead** | — | — | — | — | 88 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r048-1-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r048-2-missions-tasks | 0 | 1 | 1 | 1 | 13 | 13 / 13 |
| r048-3-packages-client | 0 | 1 | 1 | 1 | 52 | 52 / 52 |
| **lead repair** | 1 | — | 1 | — | — | 138,181 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r047) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 808.5 MiB (25.4 MiB / 657.9 MiB / 23.4 MiB / 101.8 MiB) | 811.2 MiB (25.7 MiB / 657.9 MiB / 23.7 MiB / 103.9 MiB) | +2.7 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,383 / 9,874 / 4,551 | 64,505 / 9,897 / 4,587 | +122 / +23 / +36 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.33 GiB | 1.36 GiB | +31.2 MiB |
| **Space amplification** (total · tracked) | 1.68× · tracked 4.96× | 1.71× · tracked 5.03× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **12.54** (1.41 / 0.27 / 0.93) | 1.92× the median range |
| **Stored per Commit** | 26.9 KiB | 20.8 KiB | — |
| Metadata share | 0.43 | 0.43 | this range 0.46 |
| History: Commits / Layers / Branches | 56,578 | 58,088 / 32 / 703 | +1,510 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 9.25 GiB (Commits 6.96 GiB · installs 863.3 MiB · build 98.2 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 39.82 GiB / 39% | — |
| Snapshot | — | r048, 1.19 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 794.9 MiB | 0.98 | +16.6 MiB |
| Metadata | 124.7 MiB | 0.15 | +3.6 MiB |
| Index rows | 403.1 MiB | 0.50 | — |
| Waste | 65.9 MiB | 0.08 | — |
| Other | 1.7 MiB | 0.00 | — |
| **Total = Store on disk** | **1.36 GiB** | **= 1.71** space amplification | +31.2 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 25.7 MiB | 129.2 MiB (69.0 MiB + 60.2 MiB) | 5.03× | — | 3.0 MiB | 2.9 MiB | 1.01 |
| `node_modules` | 657.9 MiB | 216.2 MiB (187.2 MiB + 28.9 MiB) | 0.33× | — | 982.4 KiB | 145.4 KiB | 6.76 |
| Build output | 23.7 MiB | 25.8 MiB (23.8 MiB + 2.0 MiB) | 1.09× | — | 785.9 KiB | 8.7 MiB | 0.09 |
| `.git` | 103.9 MiB | 492.5 MiB (471.5 MiB + 21.0 MiB) | 4.74× | — | 15.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 470.7 MiB | — (not divided) | — | 10.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 56.0 MiB | — | — | — | — | — |
| **Total** | — | **1.36 GiB** | **= 1.71×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 191,223 | +3,549 | 6.4 KiB | 0 (derived) | 42% |
| Chunks (large files) | 65,742 | +1,022 | 15.7 KiB | — | 7% |
| Large-file extents | 16,896 | — | 0.4 KiB | — | — |
| Directories | 421,283 | 4,752 (with inodes, pooled) | 0.3 KiB | — | 58% |
| Inodes and attributes | 373,017 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,435 | +4,593 | 0.1 KiB | — | — |

Delta: 2.6% at depth cap · 23% of refused bases stopped by budget · `node_modules` reinstall: absolute: 921446 new stored bytes for 620 raw changed bytes of 23 changed packages (1486.203×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.03× (129.2 MiB for 25.7 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.8 KiB / 9.3 KiB / 10.7 KiB over 205 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.24× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.7 MiB stored for 1.93 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.57 (3 lanes × 811.2 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.2 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.9 ms / 23.7 ms (1.08×) | 2.9 ms / 3.7 ms (1.36×) | 3.3 ms / 7.4 ms (1.63×) | 23.5 ms / 66.1 ms (1.32×) | 10.0 ms / 17.3 ms (0.88×) | 328 ms / 328 ms (3.92×) | — (native comparison in P3; exec 41.3 ms / 1060 ms) |
| SQL p50: 157 stmts | 58 stmts | 68 stmts | 217 stmts | 45 stmts | 7,994 stmts | — |

**Commit cost:** 5.54 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 798 ms p50 over 225
**Slowest:** sandbox.exec 41672 ms · sandbox.exec 31335 ms · sandbox.exec 29486 ms · checkpoint diff_commits 0.11 ms and 1.57 statements per entry (73,929 entries per page)
**Scaling:** 12 of 15 probes flat · `list_largest` 0.81 · `grep_tree` 0.39 · `glob_tree` 0.22

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 373 ms / 373 ms | — / — | — | git / status-cold: — |
| git status (steady) | 471 ms / 642 ms | — / — | — | git / status-steady: — |
| git add | 37.0 ms / 95.0 ms | — / — | — | git / add: — |
| git commit (lane) | 39.0 ms / 80.0 ms | — / — | — | git / commit: — |
| lead writes main | 3644 ms / 3644 ms | — / — | — | — |
| repack | 2367 ms / 2367 ms | — / — | — | — |
| pnpm install (incremental) | 3416 ms / 3416 ms | 2394 ms / 2394 ms | 1.43× | pnpm-reinstall / cold: — |
| pnpm refresh | 3222 ms / 3222 ms | 1982 ms / 1982 ms | 1.63× | pnpm-reinstall / steady: — |
| tsc -b | 5311 ms / 5311 ms | 3468 ms / 7351 ms | 1.53× | tsc-b / cold: — |
| vitest | 2882 ms / 2882 ms | 1905 ms / 1905 ms | 1.51× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 13.0 ms / 22.1 ms

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
| 042.a1 | 50146 | 1182.0 | 7.38 (1.25×) · 6433 · 273 (34 solo) | 7.64 (1.23×) · 6300 · 317 (104 solo) | 7.43 (1.02×) · 5793 · 297 (61 solo) | 2.54 (1.27×) · 3075 · 83 (5 solo) | 10.05 (1.10×) · 1362 · — (daemon) | 9.72 (1.17×) · 4266 · — (daemon) | 464.11 (—×) · 737059 · 13057 (4 solo) |
| 043.a1 | 51610 | 1223.8 | 7.04 (1.19×) · 6937 · 276 (27 solo) | 7.41 (1.19×) · 6674 · 345 (49 solo) | 7.43 (1.02×) · 6556 · 343 (100 solo) | 2.42 (1.21×) · 3278 · 189 (2 solo) | 8.87 (0.97×) · 1362 · — (daemon) | 9.28 (1.11×) · 4581 · — (daemon) | 348.56 (—×) · 554099 · 12963 (3 solo) |
| 044.a2 | 52850 | 1254.5 | 7.31 (1.24×) · 7053 · 256 (20 solo) | 6.85 (1.10×) · 6738 · 308 (64 solo) | 7.35 (1.01×) · 6625 · 381 (79 solo) | 2.16 (1.08×) · 3080 · 54 (3 solo) | 8.76 (0.96×) · 1362 · — (daemon) | 8.74 (1.05×) · 4260 · — (daemon) | 166.26 (—×) · 357340 · 8322 (3 solo) |
| 045.a1 | 53964 | 1286.9 | 7.24 (1.23×) · 7087 · 286 (16 solo) | 6.95 (1.12×) · 7135 · 317 (77 solo) | 7.55 (1.04×) · 6871 · 305 (76 solo) | 2.38 (1.20×) · 3611 · 94 (9 solo) | 8.87 (0.97×) · 1362 · — (daemon) | 9.39 (1.13×) · 4995 · — (daemon) | 305.33 (—×) · 485040 · 12305 (3 solo) |
| 046.a1 | 54791 | 1312.2 | 7.64 (1.29×) · 8172 · 168 (2 solo) | 7.70 (1.24×) · 7367 · 303 (32 solo) | 8.00 (1.10×) · 6914 · 301 (66 solo) | 2.71 (1.36×) · 3485 · 79 (7 solo) | 8.82 (0.97×) · 1362 · — (daemon) | 8.56 (1.03×) · 4699 · — (daemon) | 307.16 (—×) · 466212 · 11223 (3 solo) |
| 047.a1 | 56578 | 1359.1 | 8.35 (1.41×) · 7640 · 335 (21 solo) | 8.40 (1.35×) · 7202 · 410 (88 solo) | 8.54 (1.17×) · 6821 · 418 (67 solo) | 2.54 (1.28×) · 3466 · 131 (1 solo) | 9.45 (1.04×) · 1362 · — (daemon) | 11.63 (1.39×) · 5490 · — (daemon) | 433.20 (—×) · 654351 · 15082 (4 solo) |
| 048.a1 | 58088 | 1390.3 | 8.33 (1.41×) · 7008 · 378 (15 solo) | 7.76 (1.25×) · 6851 · 262 (85 solo) | 9.03 (1.24×) · 6564 · 313 (61 solo) | 2.81 (1.41×) · 3334 · 111 (7 solo) | 9.90 (1.08×) · 1362 · — (daemon) | 9.04 (1.08×) · 4602 · — (daemon) | 327.87 (—×) · 344822 · 9703 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4185952 → 4194304 B · fs.write ≤64 KiB 4185952 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2855192 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 8.27 at the first command → 10.43 after the last (max 12.78 over 8 commands) · Docker VM 1.97 → 2.01

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
| control-042.a1 | 12851 · 207.8 | 50146 · 1182.0 | 5.32 (0.86× first) / 5.16 · 0.97× · 114/135 | 4.82 (0.75× first) / 5.29 · 1.10× · 108/124 | 2.13 (0.77× first) / 2.10 · 0.98× · 72/123 | 5.48 → 5.28 | pass |
| control-043.a1 | 12851 · 207.8 | 51610 · 1221.4 | 5.00 (0.81× first) / 5.39 · 1.08× · 114/153 | 4.88 (0.76× first) / 5.16 · 1.06× · 110/127 | 1.95 (0.70× first) / 2.23 · 1.14× · 79/120 | 5.43 → 5.23 | pass |
| control-044.a2 | 12851 · 207.8 | 52850 · 1254.5 | 5.58 (0.90× first) / 6.18 · 1.11× · 113/155 | 5.01 (0.78× first) / 4.88 · 0.97× · 110/131 | 2.18 (0.78× first) / 2.01 · 0.92× · 81/111 | 5.11 → 5.19 | pass |
| control-045.a1 | 12851 · 207.8 | 53964 · 1283.6 | 5.24 (0.84× first) / 5.00 · 0.95× · 115/131 | 4.73 (0.74× first) / 5.15 · 1.09× · 109/124 | 2.14 (0.77× first) / 2.36 · 1.10× · 81/115 | 5.00 → 4.76 | pass |
| control-046.a1 | 12851 · 207.8 | 54791 · 1312.2 | 4.73 (0.76× first) / 5.07 · 1.07× · 114/130 | 4.75 (0.74× first) / 4.57 · 0.96× · 109/127 | 2.08 (0.75× first) / 2.06 · 0.99× · 93/105 | 4.32 → 4.38 | pass |
| control-047.a1 | 12851 · 207.8 | 56578 · 1356.7 | 15.13 (2.44× first) / 5.85 · 0.39× · 114/127 | 9.49 (1.49× first) / 6.35 · 0.67× · 109/125 | 3.13 (1.12× first) / 3.46 · 1.10× · 89/130 | 12.40 → 14.05 | pass |
| control-048.a1 | 12851 · 207.8 | 58088 · 1390.3 | 5.27 (0.85× first) / 4.91 · 0.93× · 113/128 | 4.58 (0.72× first) / 4.72 · 1.03× · 111/125 | 2.30 (0.83× first) / 3.17 · 1.38× · 89/164 | 7.99 → 7.67 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-048.a1)

## 5. Findings and action

### Finding 048.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.534 over 18 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-048.a1.json`.

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

- **a1 (`p3-main-w`, live after r47 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 16 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (2,140 emitted). Control `control-048.a1` passes. Report check F1–F8 PASS.
- **Optimize rows, recorded, not acted on (fast mode):**
  - Counters `merge.returned_rows` (chain-bounded): 2,514 vs 1,941 (1.295×).
  - Contended work `fs.write ≤1 KiB · contended`: SQL VM steps against tree files, exponent 1.534 over 18 ranges. Process-wide counters.
- **The lead's `git clean -f -d`** removed 220 untracked, unignored files (1,044,126 B) and 0 folders. They are the `.js`, `.d.ts` and `.map` files lane builds emit beside sources, in the same 8 tracked packages as r45: `packages/ui/tui` 72 of the first 200 listed, `session-query` 40, `session-reference` 24 and others. The native clean removed the same 220. Fix 058 exempted `.sessions/session-query.db`.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 14.67×, its p95 the repair's build Commit, 1,013 ms; the relink Commit 15.3 s). Merge p50 456 ms (1 call). One-shot Commit 1.32×, write 1.08× (8.9 ms), mount 0.88×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 7.7–12.8.
- Final steps: lead 3 s; lanes 21 s + 22 s + 19 s + 70 s (cuts at plan orders 12, 32 and 46); repair 129 s (alarm 200 s); verify 21 s; finish 61 s. Repair install 41.7 s, build 29.1 s, tests 3.5 s.
- Watch items: index rows 403.1 MiB on the sealed snapshot (#366). `fs.rm` uncontended p50 6.31 ms per file over 247 calls, 114 statements and 4,698 VM steps per call: at baseline, so no notes-directory removes this range (fix 059 cause absent). Contended 13.12 ms over 39 (305 statements, process-wide; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2671/2671; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.67× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.366) and statements per entry does not rise (0.062): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.534 over 18 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.461 | < 0.5 | pass |
| Reinstall growth | absolute: 921446 new stored bytes for 620 raw changed bytes of 23 changed packages (1486.203×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0263 (budget 0.2346) | < 0.1 | pass |
| Range growth | 37.0 MiB, 1.08× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 5062 ms for 1215.3 MiB new; size exponent -0.422 | < 0.15 | pass |
| Disk projection | 0.39 | < 0.8 | pass |
| Wall projection | 0.93 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 88 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.24× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 173 | 174 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1510 | 1382 |
| Workspaces (one-shot share) | 225 (0.99) | 89 (0.978) |
| Reads | 294 | 294 |
| Reconcile writes | 97 | 97 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 13 | 31.98 | 454.17 | 454.17 | 464.38 | 1.97× | 8.77× | 0.07 | 0.08 | 238 / 25,694 / 0 | — | 0.1355 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 13.35 | 13.35 | 13.35 | 13.35 | no baseline | no baseline | 1.17 | 1.43 | 180 / 13,646 / 0 | — | 0.4044 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 398 | 21.84 | 45.02 | 76.08 | 405.95 | 1.27× | 1.73× | -0.05 | -0.06 | 307 / 35,114 / 0 | — | 0.1199 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.26 | 1.48 | 1.48 | 3.21 | 1.39× | 1.12× | -0.30 | -0.30 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.90 | 0.90 | 0.90 | 0.93 | no baseline | no baseline | -0.31 | -0.28 | 70 / 1,298 / 0 | — | 0.045 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 327.87 | 327.87 | 327.87 | 327.87 | 3.92× | 3.92× | 0.24 | 0.22 | 7,994 / 344,822 / 0 | — | 5.8547 ms per entrie | branch.merge |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 2.58 | 2.58 | 2.58 | 2.58 | 2.76× | 2.76× | — | — | 35 / 517 / 0 | — | 0.0572 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 455.55 | 455.55 | 455.55 | 455.55 | 4.95× | 4.95× | -0.49 | -0.33 | 10,714 / 591,048 / 0 | — | 2.6333 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 5.04 | 5.04 | 5.04 | 5.04 | 1.00× | 1.00× | -1.77 | -1.69 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 27.11 | 27.11 | 27.11 | 27.11 | 1.11× | 1.11× | -0.06 | -0.04 | 168 / 10,471 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 19 | 9.43 | 16.41 | 16.41 | 16.95 | 1.54× | 2.21× | -0.49 | -0.41 | 122 / 5,018 / 0 | — | 0.0185 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 3 | 14.06 | 14.06 | 14.06 | 14.56 | 1.52× | 0.90× | -4.34 | -3.66 | 237 / 15,606 / 0 | — | 0.0012 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 19 | 8.62 | 10.91 | 10.91 | 27.88 | 1.24× | 1.13× | 0.03 | 0.10 | 127 / 5,647 / 0 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 10 | 15.61 | 208.29 | 208.29 | 212.52 | 1.56× | 12.10× | 0.43 | 0.33 | 242 / 25,496 / 0 | — | 0.0048 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 43 | 9.52 | 12.89 | 14.18 | 14.76 | 1.46× | 1.19× | -0.56 | -0.35 | 127 / 6,332 / 0 | — | 0.0026 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 7 | 6.72 | 6.84 | 6.84 | 7.49 | 0.94× | 0.80× | -0.06 | -0.06 | 189 / 10,257 / 0 | — | 0.0088 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 22 | 6.65 | 10.00 | 10.45 | 12.27 | 1.14× | 1.24× | -0.31 | -0.27 | 171 / 9,243 / 0 | — | 0.0265 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 1 | 8.34 | 8.34 | 8.34 | 8.34 | 1.54× | 1.38× | -0.00 | 0.05 | 234 / 12,370 / 0 | — | 0.0009 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 5 | 8.97 | 9.71 | 9.71 | 14.61 | 1.44× | 1.05× | -0.26 | -0.15 | 217 / 13,651 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 6.18 | 6.18 | 6.18 | 6.83 | 1.02× | 0.96× | -0.33 | -0.20 | 142 / 8,545 / 0 | — | 0.0009 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 11 | 8.43 | 13.62 | 13.62 | 14.10 | 1.14× | 1.70× | -0.28 | -0.26 | 169 / 10,622 / 0 | — | 0.0042 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 1.55 | 1.55 | 1.55 | 1.55 | 1.15× | 1.06× | -0.77 | -0.59 | 32 / 1,586 / 0 | — | 1.553 ms per file | — |
| fs.glob | 17–64 files · contended | 2 | 6.00 | 6.00 | 6.00 | 7.78 | 2.16× | 2.16× | -0.51 | -0.50 | 102 / 10,629 / 0 | — | 0.1201 ms per file | — |
| fs.glob | 17–64 files · uncontended | 7 | 6.41 | 8.44 | 8.44 | 8.44 | 2.26× | 2.22× | 0.35 | 0.28 | 114 / 12,552 / 0 | — | 0.3058 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.04 | 2.04 | 2.04 | 2.96 | 1.12× | 1.12× | 0.29 | 0.29 | 71 / 3,207 / 0 | — | 0.68 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 4.14 | 4.14 | 4.14 | 10.50 | 2.34× | 2.14× | 0.49 | 0.35 | 67 / 4,245 / 0 | — | 2.051 ms per file | — |
| fs.glob | 5–16 files · contended | 3 | 1.53 | 1.53 | 1.53 | 2.80 | 0.91× | 0.91× | -0.40 | -0.27 | 56 / 3,815 / 0 | — | 0.2696 ms per file | — |
| fs.glob | 5–16 files · uncontended | 11 | 3.64 | 4.69 | 4.69 | 5.34 | 1.80× | 2.05× | 0.20 | 0.15 | 57 / 4,899 / 0 | — | 0.3992 ms per file | — |
| fs.glob | >64 files · contended | 3 | 9.41 | 9.41 | 9.41 | 37.39 | 1.74× | 1.74× | -0.70 | -0.77 | 167 / 17,129 / 0 | — | 0.0149 ms per file | — |
| fs.glob | >64 files · uncontended | 14 | 3.58 | 41.11 | 41.11 | 49.13 | 0.36× | 2.92× | -1.07 | -1.04 | 58 / 4,831 / 0 | — | 0.014 ms per file | — |
| fs.grep | 1 files · contended | 2 | 2.92 | 2.92 | 2.92 | 3.80 | 1.95× | 1.95× | 0.74 | 1.21 | 36 / 1,643 / 0 | — | 2.917 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 3 | 12.13 | 12.13 | 12.13 | 22.70 | 2.03× | 2.03× | -0.65 | -0.60 | 227 / 16,211 / 0 | — | 0.7137 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 11.27 | 17.30 | 17.30 | 21.42 | 1.96× | 2.88× | 0.78 | 0.56 | 181 / 10,544 / 0 | — | 0.368 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 2.34 | 2.34 | 2.34 | 3.48 | 0.60× | 0.59× | -0.04 | -0.09 | 91 / 4,242 / 0 | — | 1.1603 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 3 | 4.82 | 4.82 | 4.82 | 5.15 | 2.09× | 1.51× | 0.85 | 0.66 | 102 / 5,070 / 0 | — | 1.242 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 5 | 3.63 | 5.70 | 5.70 | 15.11 | 1.22× | 1.13× | -0.01 | 0.01 | 91 / 4,822 / 0 | — | 0.7264 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 7 | 4.23 | 5.71 | 5.71 | 7.67 | 1.13× | 0.95× | 0.07 | 0.07 | 90 / 5,669 / 0 | — | 0.6624 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 4 | 19.25 | 37.79 | 37.79 | 40.41 | 1.23× | 2.41× | 0.37 | 0.37 | 563 / 14,617 / 0 | — | 0.1334 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 14 | 24.51 | 39.84 | 39.84 | 52.43 | 1.34× | 1.73× | 0.58 | 0.44 | 563 / 27,905 / 0 | — | 0.1494 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 2.19 | 2.19 | 2.19 | 2.19 | 1.50× | 1.50× | -0.69 | -0.90 | 91 / 3,968 / 0 | — | 2.191 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 2.28 | 2.28 | 2.28 | 2.28 | 1.35× | 1.35× | -0.08 | -0.17 | 46 / 3,689 / 0 | — | 2.281 ms per entrie | — |
| fs.list | 17–64 entries · contended | 4 | 5.81 | 6.93 | 6.93 | 7.37 | 2.42× | 2.88× | -0.51 | -0.45 | 71 / 6,693 / 0 | — | 0.1162 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 14 | 3.38 | 7.57 | 7.57 | 7.76 | 1.35× | 2.58× | -0.58 | -0.53 | 63 / 5,014 / 0 | — | 0.073 ms per entrie | — |
| fs.list | 2–4 entries · contended | 3 | 3.48 | 3.48 | 3.48 | 4.57 | 1.50× | 1.50× | -0.03 | -0.25 | 73 / 4,863 / 0 | — | 1.1597 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 2 | 2.76 | 2.76 | 2.76 | 7.47 | 1.46× | 1.35× | 0.71 | 0.58 | 42 / 3,559 / 0 | — | 0.689 ms per entrie | — |
| fs.list | 5–16 entries · contended | 5 | 3.19 | 3.33 | 3.33 | 4.50 | 1.37× | 1.17× | -0.07 | 0.02 | 100 / 6,794 / 0 | — | 0.5317 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 16 | 3.10 | 4.06 | 4.06 | 4.78 | 1.63× | 1.06× | 0.37 | 0.33 | 60 / 4,909 / 0 | — | 0.439 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 3.01 | 3.01 | 3.01 | 3.65 | 1.35× | 1.35× | -0.43 | -0.37 | 86 / 4,686 / 0 | — | 0.0041 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 5 | 2.77 | 3.49 | 3.49 | 3.70 | 1.75× | 2.20× | -0.13 | -0.14 | 62 / 3,525 / 0 | — | 0.0032 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 3.40 | 3.40 | 3.40 | 3.40 | 1.22× | 1.22× | -0.59 | -0.59 | 74 / 4,965 / 0 | — | 0.0004 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 7 | 3.36 | 3.64 | 3.64 | 4.42 | 1.59× | 0.61× | -0.20 | -0.16 | 58 / 4,013 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 28 | 2.81 | 3.40 | 3.64 | 5.19 | 1.36× | 0.95× | -0.01 | -0.02 | 55 / 3,334 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 39 | 13.12 | 59.88 | 61.68 | 95.17 | 1.25× | 4.22× | 0.79 | 0.74 | 305 / 16,742 / 0 | — | 13.12 ms per file | commit |
| fs.rm | 1 files · uncontended | 247 | 6.31 | 20.11 | 23.89 | 44.68 | 0.94× | 1.80× | 0.01 | 0.17 | 114 / 4,698 / 0 | — | 6.313 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 1 | 2.95 | 2.95 | 2.95 | 2.95 | 1.36× | 1.32× | -0.26 | -0.31 | 61 / 4,815 / 0 | — | 0.024 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 5 | 2.51 | 3.01 | 3.01 | 3.49 | 1.63× | 1.96× | 0.49 | 0.47 | 48 / 3,556 / 0 | — | 0.0067 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 2.76 | 2.76 | 2.76 | 2.83 | no baseline | no baseline | -0.11 | -0.06 | 48 / 3,091 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 3.07 | 3.07 | 3.07 | 3.07 | 1.46× | 1.46× | -0.15 | -0.19 | 49 / 3,082 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.15 | 2.15 | 2.15 | 2.28 | 0.82× | 0.63× | -0.17 | -0.19 | 38 / 1,953 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.60 | 3.73 | 3.73 | 3.85 | 1.33× | 1.73× | 0.44 | 0.28 | 46 / 3,204 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 4 | 2.04 | 2.49 | 2.49 | 2.72 | 0.91× | 0.83× | -0.14 | -0.11 | 72 / 4,206 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 19 | 2.40 | 3.94 | 3.94 | 13.30 | 1.43× | 1.13× | -0.05 | -0.05 | 46 / 3,300 / 0 | — | 0.0005 ms per byte | — |
| fs.write | >512 KiB · contended | 4 | 22.39 | 22.71 | 22.71 | 31.89 | no baseline | no baseline | -1.84 | -1.91 | 361 / 19,451 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 6 | 11.61 | 12.14 | 12.14 | 22.12 | no baseline | no baseline | -1.70 | -3.72 | 153 / 5,527 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 21 | 17.27 | 50.05 | 50.05 | 227.70 | 2.03× | 3.36× | 0.56 | 0.56 | 355 / 23,397 / 0 | — | 0.0536 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 89 | 8.33 | 20.98 | 26.65 | 27.64 | 1.31× | 1.99× | -0.31 | -0.23 | 151 / 7,008 / 0 | — | 0.0191 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 13 | 16.75 | 45.68 | 45.68 | 53.31 | 1.04× | 2.84× | 0.15 | 0.18 | 390 / 23,537 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 24 | 11.64 | 15.58 | 18.14 | 23.70 | 1.41× | 1.89× | 0.12 | 0.13 | 163 / 7,629 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 49 | 15.29 | 47.00 | 84.22 | 125.50 | 1.55× | 2.14× | 0.24 | 0.22 | 344 / 19,514 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 151 | 9.03 | 16.67 | 29.25 | 42.84 | 1.25× | 1.22× | 0.05 | 0.07 | 147 / 6,564 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 118 | 12.46 | 46.40 | 124.83 | 197.52 | 1.27× | 2.07× | 0.04 | 0.06 | 307 / 18,818 / 0 | — | 0.0064 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 483 | 7.76 | 13.21 | 20.50 | 24.04 | 1.08× | 0.95× | 0.10 | 0.12 | 144 / 6,851 / 0 | — | 0.0036 ms per byte | files.change |
| operator.store.stats | — · uncontended | 1 | 0.91 | 0.91 | 0.91 | 0.91 | 1.20× | 1.20× | -0.26 | -0.21 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 31 | 30.89 | 64.28 | 66.07 | 106.29 | 1.47× | 1.85× | 0.13 | 0.07 | 272 / 45,146 / 82 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 87 | 27.46 | 49.83 | 67.60 | 304.71 | 1.32× | 1.44× | -0.02 | -0.04 | 247 / 26,016 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 8 | 3.17 | 3.65 | 3.65 | 4.71 | 0.83× | 0.45× | 0.09 | 0.12 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 38 | 3.69 | 5.27 | 5.40 | 5.91 | 0.92× | 1.03× | -0.11 | -0.10 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 4 | 12.24 | 25.27 | 25.27 | 48.42 | 1.27× | 1.30× | -0.05 | 0.00 | 126 / 4,470 / 0 | — | 12.236 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 13 | 9.04 | 11.15 | 11.15 | 14.58 | 1.09× | 0.91× | -0.01 | -0.02 | 112 / 4,602 / 0 | — | 9.04 ms per file | commit |
| sandbox.commit | 1 files · Conflict · uncontended | 1 | 69.27 | 69.27 | 69.27 | 69.27 | no baseline | no baseline | 0.80 | 1.00 | 2,295 / 120,996 / 0 | — | 69.27 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 12.46 | 12.81 | 12.81 | 32.80 | 0.84× | 0.65× | 0.81 | 0.75 | 175 / 7,778 / 0 | — | 4.2703 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 8 | 11.32 | 20.50 | 20.50 | 27.16 | 1.06× | 1.20× | 0.01 | -0.03 | 124 / 6,696 / 0 | — | 5.238 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 7 | 37.82 | 48.09 | 48.09 | 51.61 | 2.29× | 2.92× | 0.65 | 0.43 | 400 / 22,811 / 0 | — | 2.8431 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 14.97 | 17.71 | 17.71 | 18.80 | 1.09× | 1.29× | 0.77 | 0.83 | 190 / 10,075 / 0 | — | 2.3502 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 136.00 | 136.00 | 136.00 | 136.00 | no baseline | no baseline | 1.78 | 1.83 | 1,807 / 234,292 / 82 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 102.62 | 1012.53 | 1012.53 | 15311.72 | 1.49× | 14.67× | 0.42 | 0.37 | 520 / 31,547 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 184 | 87.84 | 1059.84 | 4887.20 | 5260.07 | 1.71× | 2.76× | 0.58 | 0.58 | — | 4,481 | — | — |
| sandbox.exec | 0 files · uncontended | 198 | 37.65 | 737.58 | 1166.97 | 8171.70 | 1.19× | 2.58× | -0.13 | -0.13 | 0 / 0 / 0 | 4505.30 | — | — |
| sandbox.exec | 1 files · contended | 27 | 34.64 | 62.57 | 66.94 | 68.06 | 0.94× | 0.74× | 0.04 | 0.04 | — | 4.70 | 34.636 ms per file | — |
| sandbox.exec | 1 files · uncontended | 45 | 38.16 | 67.19 | 75.67 | 90.71 | 1.14× | 0.99× | 0.32 | 0.27 | — | 6 | 38.155 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 61.77 | 61.77 | 61.77 | 72.47 | 0.88× | 0.88× | 0.20 | 0.15 | — | 95 | 3.0979 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 3 | 58.43 | 58.43 | 58.43 | 79.73 | 0.84× | 0.84× | -0.29 | -0.24 | — | 105 | 2.9213 ms per file | — |
| sandbox.exec | 2–4 files · contended | 30 | 38.43 | 76.73 | 78.25 | 95.05 | 0.99× | 1.10× | -0.06 | -0.06 | — | 9.80 | 14.7185 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 27 | 39.85 | 72.54 | 90.65 | 166.83 | 1.04× | 1.11× | -0.30 | -0.23 | — | 10 | 15.2043 ms per file | — |
| sandbox.exec | 5–16 files · contended | 44 | 39.84 | 88.57 | 104.00 | 190.00 | 0.68× | 1.22× | 0.39 | 0.33 | — | 19.30 | 4.9313 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 26 | 51.51 | 79.31 | 91.53 | 92.42 | 0.72× | 0.75× | -0.28 | -0.18 | — | 21.80 | 6.2916 ms per file | — |
| sandbox.exec | — · contended | 11 | 3320.83 | 29485.79 | 29485.79 | 31335.13 | no baseline | no baseline | -1.13 | -0.97 | — | 50866.40 | — | — |
| sandbox.exec | — · uncontended | 29 | 447.79 | 16676.67 | 29141.68 | 41671.57 | 0.84× | 2.35× | 0.48 | 0.38 | — | 43962.70 | — | — |
| sandbox.mount | — · contended | 67 | 10.86 | 27.18 | 62.88 | 65.83 | 0.97× | 1.43× | -0.14 | -0.10 | 57 / 1,569 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 148 | 9.90 | 15.13 | 23.02 | 57.44 | 0.88× | 0.75× | -0.22 | -0.18 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.00 | 4.05 | 4.05 | 39.75 | no baseline | no baseline | -0.09 | -0.07 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 57 | 12.09 | 19.24 | 22.00 | 39.09 | 1.14× | 1.06× | -0.06 | -0.02 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 158 | 13.55 | 24.86 | 122.70 | 196.47 | 1.29× | 1.35× | 0.09 | 0.08 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 697.7 KiB | 3,041 | ok 13 |
| branch.diff_commits | branch | 404 | 0.0 KiB | 22.3 MiB | 74,953 | ok 404 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.0 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 107 | 1.3 MiB | 0.0 KiB | 118 | Committed 107 |
| fs.diff_files | fs | 53 | 0.0 KiB | 222.5 KiB | 32 | Text 29, NoSuchPath 21, Equal 3 |
| fs.glob | fs | 56 | 0.0 KiB | 59.3 KiB | 770 | ok 56 |
| fs.grep | fs | 56 | 0.0 KiB | 245.0 KiB | 917 | ok 56 |
| fs.list | fs | 58 | 0.0 KiB | 323.3 KiB | 2,069 | ok 58 |
| fs.read | fs | 49 | 0.0 KiB | 133.2 KiB | 49 | ok 49 |
| fs.rm | fs | 286 | 0.0 KiB | 0.0 KiB | 286 | Committed 286 |
| fs.stat | fs | 52 | 0.0 KiB | 11.2 KiB | 52 | ok 52 |
| fs.write | fs | 958 | 16.9 MiB | 0.0 KiB | 958 | Committed 958 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 221 | 0.0 KiB | 0.0 KiB | 0 | Committed 174, UpToDate 46, Conflict 1 |
| sandbox.exec | sandbox | 637 | 3.2 MiB | 5.6 MiB | 0 | exit:0 634, exit:2 3 |
| sandbox.mount | sandbox | 225 | 0.0 KiB | 0.0 KiB | 0 | Mounted 225 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 225 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 225 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.97 · end 2.01.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.194 | 14.426 · 1.51 · 1.194 · 1.176 · 1.194 | 2.43–2.43 | statements 33, vm_steps 1082, fullscan_steps 0, sorts 0, returned_rows 89 |
| read | 1.377 | 1.671 · 1.368 · 1.377 · 1.443 · 1.302 | 2.43–2.43 | statements 20, vm_steps 800, fullscan_steps 0, sorts 0, returned_rows 76 |
| list_small | 1.18 | 1.398 · 1.18 · 1.265 · 1.137 · 1.169 | 2.43–2.43 | statements 20, vm_steps 809, fullscan_steps 0, sorts 0, returned_rows 76 |
| list_largest | 10.447 | 13.856 · 10.678 · 10.447 · 10.14 · 9.781 | 2.43–2.43 | statements 210, vm_steps 26463, fullscan_steps 0, sorts 0, returned_rows 2674 |
| grep_scoped | 1.343 | 1.72 · 1.388 · 1.267 · 1.343 · 1.238 | 2.43–2.43 | statements 25, vm_steps 955, fullscan_steps 0, sorts 0, returned_rows 85 |
| glob_scoped | 1.352 | 1.237 · 1.352 · 1.433 · 1.696 · 1.187 | 2.43–2.43 | statements 19, vm_steps 788, fullscan_steps 0, sorts 0, returned_rows 75 |
| grep_tree | 5948.437 | 5911.056 · 5948.437 · 5983.979 · 5858.793 · 5988.972 | 1.87–2.32 | statements 61620, vm_steps 4662473, fullscan_steps 0, sorts 0, returned_rows 467068 |
| glob_tree | 9.743 | 10.837 · 9.552 · 9.743 · 8.983 · 10.016 | 1.87–1.87 | statements 133, vm_steps 20474, fullscan_steps 0, sorts 0, returned_rows 2124 |
| diff_files | 4.984 | 6.685 · 4.483 · 4.984 · 5.031 · 4.966 | 1.87–1.87 | statements 84, vm_steps 4468, fullscan_steps 0, sorts 0, returned_rows 438 |
| list_commits | 0.928 | 2.898 · 1.107 · 0.787 · 0.831 · 0.928 | 1.87–1.87 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.611 | 4.15 · 4.456 · 3.365 · 3.611 · 3.073 | 1.87–1.87 | statements 63, vm_steps 2562, fullscan_steps 0, sorts 0, returned_rows 301 |
| fork | 1.733 | 2.222 · 1.883 · 1.733 · 1.052 · 1.116 | 1.87–1.87 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 38.629 | 57.108 · 82.529 · 38.629 · 35.398 · 29.135 | 1.87–1.87 | statements 517, vm_steps 23958, fullscan_steps 0, sorts 0, returned_rows 1926 |
| oneshot_mount_unmount | 16.125 | 18.297 · 16.187 · 14.498 · 16.125 · 15.783 | 1.87–1.87 | statements 67, vm_steps 2302, fullscan_steps 82, sorts 2, returned_rows 225 |
| oneshot_commit | 80.173 | 68.612 · 78.364 · 100.617 · 82.553 · 80.173 | 1.87–1.87 | statements 188, vm_steps 11245, fullscan_steps 82, sorts 2, returned_rows 930 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.87–1.87 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r048: 355,913 pages of 4,096 B, 0 free · Commits 58,856 · Branches 1,184 · Layers 58 · compression 3.64× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 191,223 | 1.16 GiB |
| 2 | 65,742 | 1007.5 MiB |
| 3 | 16,846 | 5.9 MiB |
| 4 | 50 | 9.6 KiB |
| 5 | 16,740 | 1.7 MiB |
| 6 | 155,645 | 753.2 MiB |
| 7 | 419,994 | 103.8 MiB |
| 8 | 1,289 | 369.9 KiB |
| 9 | 124,564 | 274.8 MiB |
| 10 | 63,246 | 7.8 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,435 | 199.9 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 60,500 | 124.7 MiB |
| 1 | 65,623 | 794.9 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 246,259 | 961.9 MiB | 34.9 MiB |
| inode_value | 65,245 | 254.9 MiB | 5.1 MiB |
| binding_hint | 19,347 | 75.6 MiB | 7.1 MiB |
| object_location | 14,531 | 56.8 MiB | 6.0 MiB |
| commit | 4,844 | 18.9 MiB | 2.9 MiB |
| file_digest | 1,560 | 6.1 MiB | 736.9 KiB |
| commit_lineage | 1,265 | 4.9 MiB | 574.7 KiB |
| commit_runs | 1,233 | 4.8 MiB | 627.5 KiB |
| commit_identity | 896 | 3.5 MiB | 354.8 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 52 | 208.0 KiB | 34.8 KiB |
| branch_names | 19 | 76.0 KiB | 12.8 KiB |
| branch_identity | 14 | 56.0 KiB | 9.6 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| run_merges | 7 | 28.0 KiB | 7.5 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 5.7 KiB |
| layers_source | 3 | 12.0 KiB | 7.0 KiB |
| layers_child | 3 | 12.0 KiB | 7.0 KiB |
| absorbed_heights | 3 | 12.0 KiB | 5.3 KiB |

### E. Stage times

**Time 335.8 s** (tooling): play 122.2 · consolidate 126.3 · verify 30.2 · probes 30.9 · tests 0.0 · seal + snapshot 11.6 · report 14.6

335.80 s tooling: prepare 1.47 · play 120.69 · consolidate 126.30 · verify 17.21 (diff_commits + full compareTree) · version walk 12.98 · probes 30.91 · metrics 0.87 · seal 1.38 · sealed figures 5.17 · snapshot copy 5.11 · report 0.48

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T05:45:20.867Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.67× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.366) and statements per entry does not rise (0.062): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8); Contended work: fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.534 over 18 ranges |

### G. Evidence

- `~/lfs-history/metrics/range-048.a1.json`
- trace `~/lfs-history/runs/p3-main-w/trace/range-048.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-w/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-048.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r048-2-missions-tasks | 605 | 573.8 KiB |
| r048-3-packages-client | 968 | 577.9 KiB |
| r048-1-root | 331 | 572.1 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 471.0 | 4,666 |
| `git diff --stat` | 39.0 | 4,655 |
| `git add -f` | 37.0 | — |
| `git rm --cached` | 9.0 | — |
| `git commit` | 39.0 | 4,660 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r048-1-root | end | P1 | pass | — | — |
| r048-1-root | end | P2 | pass | exit 0 | — |
| r048-1-root | end | P3 | n/a | an install, not a refresh | — |
| r048-1-root | end | P4 | pass | 357 emitted files, exit 2 | — |
| r048-1-root | end | P5 | n/a | no calibrated file | — |
| r048-1-root | end | P6 | n/a | not a repair | — |
| r048-2-missions-tasks | end | P1 | pass | — | — |
| r048-2-missions-tasks | end | P2 | pass | exit 0 | — |
| r048-2-missions-tasks | end | P3 | pass | 276 bookkeeping path(s) | — |
| r048-2-missions-tasks | end | P4 | pass | 91 emitted files, exit 2 | — |
| r048-2-missions-tasks | end | P5 | pass | 13 files | — |
| r048-2-missions-tasks | end | P6 | n/a | not a repair | — |
| r048-3-packages-client | end | P1 | pass | — | — |
| r048-3-packages-client | end | P2 | pass | exit 0 | — |
| r048-3-packages-client | end | P3 | pass | 276 bookkeeping path(s) | — |
| r048-3-packages-client | end | P4 | pass | 328 emitted files, exit 2 | — |
| r048-3-packages-client | end | P5 | pass | 52 files | — |
| r048-3-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2140 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
