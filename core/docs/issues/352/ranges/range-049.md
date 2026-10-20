# Range 049 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r048 (live Store)
dsh `7fd2abd82`..`665eadbc1` · **77 commits** (4 mainline, 73 side) · 2026-07-28 → 2026-07-29
Areas changed: `packages/client` 29% · `/` 21% · `packages/host` 17% · other 33%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 20 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.24×** · **Churn 0.00**
**Time split:** play 125.6 s · git 152.4 s · Node 275.6 s · verify 11.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **813.6 MiB** (+2.4 MiB) | **1.39 GiB** (+35.7 MiB) live | **1.75×** (prev 1.71×) | **36.0 MiB** | **1,207** (total 59,295) | **325.6 s** tooling (total 169.0 min) |

**Checks:** 15 pass · 1 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 17.15× it · 3 optimize/stop: Scaling, Counters, Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ probe fork +169% · ▲ probe diff_commits +164% · ▲ probe list_commits +83%
**Budget:** 50 of 202 ranges · projected total 15.8 h (budget 16.8 h) · disk 39% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **213 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 4 lanes merged, 2 publishes |
| Steps | 2,534 / 2,534 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3111 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 425 bin shims, 4629 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (57 lines from 4 .gitignore files) · **204 picks** in 4 merges (204 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `665eadbc1`** · 121 commits written for 121 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 32 untracked, unignored (131,545 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 204 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r049-1-root | end | `0721d6a07763` | `cbbfa11742c0` | pass (424 normalized) | pass | n/a | pass | n/a | n/a |
| r049-2-packages-host | end | `eaab8bd1efed` | `460953fc2a32` | pass (423 normalized) | pass | pass | pass | n/a | n/a |
| r049-4-agents-notes | end | `79a3e941eddd` | `460953fc2a32` | pass (423 normalized) | pass | pass | pass | pass | n/a |
| r049-3-packages-client | end | `5ebd9443d72e` | `460953fc2a32` | pass (423 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `fa8db2b0a903` | `null` | n/a | pass | n/a | n/a | pass | pass (138,356 rewritten) |

P5 skip list (failing natively, set at calibration): `apps/cli/tests/args.spec.ts` (fails natively) · `apps/cli/tests/trusted-hosts.spec.ts` (fails natively) · `apps/cli/tests/tsconfig-paths-loader.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/api-request-trust.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/http-bridge.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-machine.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/queue-dock.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-snapshot.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/app-shell.spec.tsx` (fails natively) · `packages/client/web/tests/app.spec.tsx` (fails natively) · `packages/client/web/tests/base-styles.spec.ts` (fails natively) · `packages/client/web/tests/document-title.spec.tsx` (fails natively) · `packages/goal/goal/tests/goal.spec.ts` (fails natively) · `packages/goal/goal/tests/invariant.spec.ts` (fails natively) · `packages/goal/goal/tests/projection.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-blank.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-models.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-directory-picker.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-path-opener.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/integration.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/invariant.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/plan-mode.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/projection.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/inheritance.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/cli.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/invariant.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/server.spec.ts` (fails natively) · `packages/ui/permission/tests/invariant.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-approval.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-blank.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-models.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-path-opener.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `apps/cli/tests/args.spec.ts` (fails natively) · `apps/cli/tests/trusted-hosts.spec.ts` (fails natively) · `apps/cli/tests/tsconfig-paths-loader.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/ui/permission/tests/projection.spec.ts` (fails natively) · `packages/ui/user-approval/tests/approval.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/test-runtime/tests/runtime.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-browser.spec.tsx` (fails natively).

## 2. Activity

**3,344 calls** · **206 steps** by **10 agents + lead** on **4 Branches + main** · **257 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +147 added · 880 modified · −80 deleted · 20.5 MiB written · fs 1,010 : Sandbox 97 (**10 : 1**, reported only in P3)
**Execs:** 698 (JS 70 · shell 628) · 4 non-zero exits · install 0 · test runs 4 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,406 | 1,023 | 383 | Committed 1,022 · Text 46 · NoSuchPath 10 · Equal 3 · UpToDate 1 |
| sandbox | 1,472 | 953 | 5 | commit 255 (Committed 199, UpToDate 55, Conflict 1) · exec 698 (exit:0 694, exit:1 1, exit:2 3) · mount 257 (Mounted 257) · status 5 · unmount 257 (Unmounted 257) |
| branch | 455 | 34 | 421 | diff_branches 13 · diff_commits 408 · fork 23 (Forked 23) · merge 9 (Merged 9) · publish 2 (Added 2) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,344** | **2,010** | **820** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r049-1-root | a01 | 26 | 331 | ✓ | ✓ |
| r049-2-packages-host | a02 a03 a04 | 67 | 298 | ✓ | — |
| r049-3-packages-client | a05 a06 a07 | 56 | 266 | ✓ | — |
| r049-4-agents-notes | a08 a09 a10 | 49 | 187 | ✓ | — |
| main | lead | 8 | 125 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r049-3, a07 after a05 | 0.1 s |
| Stale clean merge | 1 / 1 | r049-3, a05 a06 | merged cleanly |
| Decoy edit | 1 / 1 | r049-3, a07 a05 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r049-2 vs r049-1 publish | 3.6 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r049-1 | 26 | 14 | 12 | 0 | 0 | 331 | — |
| a02 | r049-2 | 28 | 9 | 19 | 0 | 0 | 178 | — |
| a03 | r049-2 | 30 | 17 | 13 | 0 | 0 | 82 | — |
| a04 | r049-2 | 9 | 4 | 5 | 0 | 0 | 38 | — |
| a05 | r049-3 | 23 | 11 | 12 | 0 | 0 | 96 | commit-conflict, stale-clean-merge, decoy |
| a06 | r049-3 | 14 | 7 | 7 | 0 | 0 | 42 | stale-clean-merge |
| a07 | r049-3 | 19 | 9 | 10 | 0 | 0 | 128 | commit-conflict, decoy |
| a08 | r049-4 | 25 | 14 | 11 | 0 | 0 | 94 | — |
| a09 | r049-4 | 11 | 6 | 5 | 0 | 0 | 26 | — |
| a10 | r049-4 | 13 | 7 | 6 | 0 | 0 | 67 | — |
| lead | main | 8 | 1 | 0 | 7 | 0 | 125 | merge-race |
| **Total** |  | **206** | **99** | **100** | **7** | **0** | **1,207** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 147 · pnpm 1 · tsc 4 · vitest 4 · other 542

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r049-3-packages-client | 39 | 39 | 39 | 1 | 39 | 601 |
| r049-4-agents-notes | 34 | 34 | 34 | 0 | 34 | 420 |
| r049-1-root | 16 | 16 | 16 | 7 | 16 | 179 |
| r049-2-packages-host | 50 | 50 | 50 | 3 | 50 | 674 |
| **lead** | — | — | — | — | 121 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r049-1-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r049-2-packages-host | 0 | 1 | 1 | 0 | 0 | — / — |
| r049-4-agents-notes | 0 | 1 | 1 | 1 | 11 | 11 / 11 |
| r049-3-packages-client | 0 | 1 | 1 | 1 | 69 | 69 / 69 |
| **lead repair** | 1 | — | 1 | — | — | 138,356 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r048) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 811.2 MiB (25.7 MiB / 657.9 MiB / 23.7 MiB / 103.9 MiB) | 813.6 MiB (26.1 MiB / 657.9 MiB / 24.3 MiB / 105.3 MiB) | +2.4 MiB |
| Version figures from | — | incremental (74,158 changed paths) | — |
| Files / directories / symlinks | 64,505 / 9,897 / 4,587 | 64,669 / 9,945 / 4,637 | +164 / +48 / +50 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 1.36 GiB | 1.39 GiB | +35.7 MiB |
| **Space amplification** (total · tracked) | 1.71× · tracked 5.03× | 1.75× · tracked 5.02× | 0.04 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **13.39** (1.39 / 0.24 / 1.40) | 1.84× the median range |
| **Stored per Commit** | 20.8 KiB | 30.3 KiB | — |
| Metadata share | 0.43 | 0.43 | this range 0.46 |
| History: Commits / Layers / Branches | 58,088 | 59,295 / 33 / 735 | +1,207 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.77 GiB (Commits 8.44 GiB · installs 861.1 MiB · build 97.5 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 39.61 GiB / 39% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 811.3 MiB | 1.00 | +16.4 MiB |
| Metadata | 127.5 MiB | 0.16 | +2.8 MiB |
| Index rows + waste + other (live, not split) | 487.2 MiB | 0.60 | — |
| **Total = Store on disk** | **1.39 GiB** | **= 1.75** space amplification | +35.7 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 26.1 MiB | 130.9 MiB (69.7 MiB + 61.2 MiB) | 5.02× | — | 1.7 MiB | 2.7 MiB | 0.63 |
| `node_modules` | 657.9 MiB | 217.2 MiB (187.3 MiB + 29.9 MiB) | 0.33× | — | 1.0 MiB | 151.1 KiB | 6.90 |
| Build output | 24.3 MiB | 26.4 MiB (24.4 MiB + 2.0 MiB) | 1.09× | — | 700.8 KiB | 8.9 MiB | 0.08 |
| `.git` | 105.3 MiB | 508.3 MiB (486.5 MiB + 21.8 MiB) | 4.83× | — | 15.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 487.2 MiB | — (not divided) | — | 16.5 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 56.0 MiB | — | — | — | — | — |
| **Total** | — | **1.39 GiB** | **= 1.75×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +3,788 | — | 0 (derived) | 54% |
| Chunks (large files) | — (at snapshots) | +1,064 | — | — | 9% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 4,667 (with inodes, pooled) | — | — | 56% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,663 | — | — | — |

Delta: 2.6% at depth cap · 26% of refused bases stopped by budget · `node_modules` reinstall: absolute: 916228 new stored bytes for 1081 raw changed bytes of 35 changed packages (847.574×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.02× (130.9 MiB for 26.1 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.3 KiB / 2.5 KiB / 5.3 KiB over 260 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.24× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.7 MiB stored for 2.57 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.44 (4 lanes × 813.6 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.3 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.5 ms / 29.9 ms (1.13×) | 3.2 ms / 6.1 ms (1.58×) | 3.4 ms / 6.9 ms (1.67×) | 22.2 ms / 51.1 ms (1.21×) | 10.1 ms / 15.8 ms (0.89×) | 213 ms / 355 ms (2.55×) | — (native comparison in P3; exec 42.4 ms / 978 ms) |
| SQL p50: 168 stmts | 60 stmts | 61 stmts | 201 stmts | 45 stmts | 4,104 stmts | — |

**Commit cost:** 9.50 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 760 ms p50 over 257
**Slowest:** sandbox.exec 37817 ms · sandbox.exec 37809 ms · sandbox.exec 35933 ms · checkpoint diff_commits 0.12 ms and 1.57 statements per entry (74,071 entries per page)
**Scaling:** 9 of 15 probes flat · `list_largest` 0.94 · `grep_tree` 0.53 · `glob_tree` 0.36 · `diff_commits` 0.61 · `fork` 0.99 · `merge` 0.30

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 340 ms / 340 ms | — / — | — | git / status-cold: — |
| git status (steady) | 443 ms / 659 ms | — / — | — | git / status-steady: — |
| git add | 37.0 ms / 107 ms | — / — | — | git / add: — |
| git commit (lane) | 43.0 ms / 71.0 ms | — / — | — | git / commit: — |
| lead writes main | 4966 ms / 4966 ms | — / — | — | — |
| repack | 2382 ms / 2382 ms | — / — | — | — |
| pnpm install (incremental) | 3541 ms / 3541 ms | 3090 ms / 3090 ms | 1.15× | pnpm-reinstall / cold: — |
| pnpm refresh | 3975 ms / 3975 ms | 4855 ms / 4855 ms | 0.82× | pnpm-reinstall / steady: — |
| tsc -b | 4131 ms / 5783 ms | 5841 ms / 12732 ms | 0.71× | tsc-b / cold: — |
| vitest | 3637 ms / 3637 ms | 5449 ms / 5449 ms | 0.67× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.7 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.8 ms / 25.4 ms

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
| 049.a1 | 59295 | 1426.0 | 8.07 (1.37×) · 6352 · 328 (10 solo) | 8.18 (1.32×) · 6850 · 307 (54 solo) | 8.84 (1.21×) · 7371 · 362 (51 solo) | 3.27 (1.64×) · 4122 · 75 (7 solo) | 9.92 (1.09×) · 1362 · — (daemon) | 10.33 (1.24×) · 4329 · — (daemon) | 213.34 (—×) · 334840 · 7279 (4 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4148872 B · fs.write ≤8 KiB 4194304 → 4148872 B · fs.write ≤64 KiB 4194304 → 4148872 B · fs.read ≤8 KiB 4194304 → 4124152 B · sandbox.mount 4194304 → 2818112 B · sandbox.commit 1 file (Committed) 4194304 → 3316632 B · branch.merge 45352 → 4120032 B
**Host load (1-min, recorded, not waited on):** macOS 9.12 at the first command → 12.25 after the last (max 12.35 over 8 commands) · Docker VM 1.92 → 1.48

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
| control-049.a1 | 12851 · 207.8 | 59295 · 1423.3 | 5.78 (0.93× first) / 5.60 · 0.97× · 114/139 | 5.80 (0.91× first) / 5.66 · 0.98× · 109/127 | 2.72 (0.98× first) / 3.27 · 1.20× · 89/164 | 16.50 → 15.82 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-049.a1)

## 5. Findings and action

### Finding 049.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | diff_commits (chain-bounded): max over the latest cap period 9.551 vs the first 2.97: 3.216× (bound, period 8) | < 0.15 |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.313 over 19 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-049.a1.json`.

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

- **a1 (`p3-main-w`, live after r48 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (time and counter rows recorded).** Checkpoint ok, git ✓. Node: 20 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass (2,189 emitted). Control `control-049.a1` passes. Report check F1–F8 PASS.
- **Optimize rows, recorded, not acted on (fast mode):**
  - New: Scaling `diff_commits` (chain-bounded), the one-file `diff_commits` scale probe. The latest cap period's maximum is 9.55 ms against the first period's 2.97 ms (3.216×). Its five samples spread 5.6–11.3 ms. Its counters are flat: 60 statements, 2,045 VM steps and 222 returned rows, against 55–63 statements and 1.9–2.6k VM steps at r41–r48. The probe's time read 1.9–3.6 ms at r41–r48. This range ran under host 1-min load 10.2–12.3 (other sessions' work), so it reads as a wall-time effect of load with the same SQL work, not more work. It is above the 5 ms floor, so it is recorded as an optimize row.
  - Counters `merge.returned_rows` (chain-bounded): 2,514 vs 1,941 (1.295×).
  - Contended work `fs.write ≤1 KiB · contended`: SQL VM steps against tree files, exponent 1.313 over 19 ranges. Process-wide counters.
- **The lead's `git clean -f -d`** removed 32 untracked, unignored files (131,545 B) and 0 folders. They were emitted output beside sources in `packages/goal/goal` (24) and `packages/session-projection/session-projection-cache` (8). The native clean removed the same 32. Fix 058 exempted nothing.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 17.15×, its p95 the repair's build Commit, 1,184 ms; the relink Commit 15.2 s). Merge p50 355 ms (1 call). One-shot Commit 1.21×, write 1.13× (9.5 ms), mount 0.89×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 10.2–12.3.
- Final steps: lead 3 s; lanes 41 s + 12 s + 11 s + 71 s (cuts at plan orders 44, 55 and 66; no safe cut before order 44); repair 124 s (alarm 200 s); verify 16 s; finish 57 s. Repair install 37.8 s, build 27.7 s, tests 4.8 s.
- **Test calibration** took 11 commands for 110 files. Four 40-file commands stopped at the 115 s alarm, their containers were removed, and no partial result was used. One of my own commands failed at once on the container-name conflict, without touching the tree.
- Watch items: index rows + waste + other 487.2 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 10.40 ms per file over 47 calls, 161 statements and 10,021 VM steps per call (fix 059 cause); contended 14.97 ms over 32 (415 statements, process-wide; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2534/2534; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 17.15× it | ≤ 1.2× | watch |
| Scaling | diff_commits (chain-bounded): max over the latest cap period 9.551 vs the first 2.97: 3.216× (bound, period 8) | < 0.15 | optimize |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.313 over 19 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.462 | < 0.5 | pass |
| Reinstall growth | absolute: 916228 new stored bytes for 1081 raw changed bytes of 35 changed packages (847.574×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0259 (budget 0.2607) | < 0.1 | pass |
| Range growth | 36.0 MiB, 1.06× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.39 | < 0.8 | pass |
| Wall projection | 0.94 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 121 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 20 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 204 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.24× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 206 | 206 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 1207 | 1055 |
| Workspaces (one-shot share) | 257 (0.99) | 99 (0.98) |
| Reads | 336 | 336 |
| Reconcile writes | 117 | 117 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 351.97 | 351.97 | 351.97 | 351.97 | 4.56× | 4.56× | -0.87 | -0.96 | 11,669 / 333,123 / 0 | — | 1.4727 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 12 | 25.95 | 351.74 | 351.74 | 381.32 | 1.60× | 6.79× | 0.11 | 0.11 | 338 / 35,240 / 0 | — | 0.1077 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 4 | 16.32 | 17.72 | 17.72 | 27.02 | no baseline | no baseline | 2.12 | 3.25 | 189 / 13,940 / 0 | — | 0.4209 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 735.26 | 735.26 | 735.26 | 735.26 | no baseline | no baseline | 0.29 | 0.10 | 15,023 / 542,028 / 0 | — | 3.5692 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 398 | 23.27 | 50.76 | 105.89 | 808.67 | 1.35× | 1.95× | 0.04 | 0.00 | 307 / 35,017 / 0 | — | 0.1223 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.07 | 2.89 | 2.89 | 4.67 | 1.18× | 2.19× | -0.19 | -0.23 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · contended | 1 | 1.05 | 1.05 | 1.05 | 1.05 | no baseline | no baseline | -1.07 | -1.01 | 70 / 1,298 / 0 | — | 0.0524 ms per entrie | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.92 | 0.92 | 0.92 | 1.27 | no baseline | no baseline | -0.28 | -0.26 | 70 / 1,298 / 0 | — | 0.0457 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 2 | 213.34 | 213.34 | 213.34 | 397.91 | 2.55× | 2.55× | -0.21 | -0.19 | 4,104 / 334,840 / 0 | — | 6.2173 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 354.95 | 354.95 | 354.95 | 354.95 | 3.86× | 3.86× | -0.34 | -0.25 | 9,262 / 481,118 / 0 | — | 4.1758 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.23 | 1.23 | 1.23 | 1.23 | 0.79× | 0.79× | -0.33 | -0.31 | 35 / 517 / 0 | — | 0.0176 ms per entrie | — |
| branch.publish | — · uncontended | 2 | 3.74 | 3.74 | 3.74 | 6.26 | 0.74× | 0.74× | -1.79 | -1.72 | 60 / 1,239 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 23.95 | 23.95 | 23.95 | 23.95 | 0.98× | 0.98× | -0.15 | -0.11 | 156 / 15,311 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 10 | 11.81 | 19.23 | 19.23 | 22.34 | 1.00× | 1.42× | 0.09 | 0.25 | 255 / 11,521 / 0 | — | 0.0267 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 8 | 8.55 | 13.49 | 13.49 | 17 | 1.39× | 1.81× | -0.41 | -0.36 | 159 / 5,381 / 0 | — | 0.0165 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 1 | 15.92 | 15.92 | 15.92 | 15.92 | 1.18× | 1.18× | -0.65 | -0.57 | 234 / 17,344 / 0 | — | 0.0002 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 5 | 12.53 | 22.30 | 22.30 | 22.39 | 1.36× | 1.43× | -3.94 | -3.48 | 367 / 13,420 / 0 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 20 | 7.83 | 11.86 | 11.86 | 12.32 | 1.13× | 1.23× | 0.03 | 0.10 | 141 / 5,168 / 0 | — | 0.0003 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 16 | 14.79 | 29.15 | 29.15 | 34.69 | 1.48× | 1.69× | 0.39 | 0.32 | 262 / 19,205 / 0 | — | 0.0065 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 27 | 7.33 | 14.56 | 15.04 | 17.05 | 1.12× | 1.34× | -0.58 | -0.40 | 131 / 4,623 / 0 | — | 0.002 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 10 | 6.77 | 12.82 | 12.82 | 16.73 | 0.94× | 1.49× | -0.15 | -0.13 | 196 / 9,341 / 0 | — | 0.0244 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 16 | 6.84 | 11.09 | 11.09 | 12.06 | 1.17× | 1.37× | -0.29 | -0.26 | 139 / 8,049 / 0 | — | 0.0246 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 10.95 | 13.27 | 13.27 | 14.89 | 2.02× | 2.20× | 0.07 | 0.10 | 285 / 17,236 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 8 | 9.56 | 10.96 | 10.96 | 12.47 | 1.54× | 1.19× | -0.14 | -0.08 | 217 / 14,374 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 7.19 | 7.19 | 7.19 | 8.25 | 1.19× | 1.11× | -0.35 | -0.23 | 182 / 10,832 / 0 | — | 0.0017 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 12 | 8.44 | 10.32 | 10.32 | 13.04 | 1.14× | 1.29× | -0.18 | -0.20 | 160 / 10,071 / 0 | — | 0.0018 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 5 | 6.39 | 6.43 | 6.43 | 7.30 | 2.30× | 2.31× | -0.36 | -0.40 | 176 / 14,468 / 0 | — | 0.3549 ms per file | — |
| fs.glob | 17–64 files · uncontended | 12 | 5.82 | 9.29 | 9.29 | 12.85 | 2.06× | 2.45× | 0.41 | 0.34 | 87 / 10,252 / 0 | — | 0.2619 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 4.32 | 4.32 | 4.32 | 4.32 | 2.38× | 2.38× | 0.53 | 0.46 | 84 / 6,010 / 0 | — | 2.16 ms per file | — |
| fs.glob | 2–4 files · uncontended | 5 | 2.92 | 3.08 | 3.08 | 3.14 | 1.66× | 1.59× | 0.54 | 0.41 | 50 / 4,635 / 0 | — | 0.9607 ms per file | — |
| fs.glob | 5–16 files · contended | 7 | 3.82 | 4.64 | 4.64 | 7.86 | 2.28× | 2.76× | -0.29 | -0.20 | 110 / 8,033 / 0 | — | 0.5154 ms per file | — |
| fs.glob | 5–16 files · uncontended | 9 | 3.19 | 4.04 | 4.04 | 5.42 | 1.58× | 1.77× | 0.20 | 0.16 | 58 / 5,461 / 0 | — | 0.319 ms per file | — |
| fs.glob | >64 files · contended | 5 | 7.62 | 8.63 | 8.63 | 31.86 | 1.41× | 1.60× | -0.57 | -0.68 | 114 / 16,183 / 0 | — | 0.0385 ms per file | — |
| fs.glob | >64 files · uncontended | 8 | 8.51 | 21.11 | 21.11 | 84.07 | 0.87× | 1.50× | -0.76 | -0.83 | 140 / 15,934 / 0 | — | 0.0179 ms per file | — |
| fs.grep | 17–64 files · contended | 7 | 14.00 | 26.31 | 26.31 | 36.58 | 2.34× | 4.40× | -0.45 | -0.46 | 278 / 16,474 / 0 | — | 0.5016 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 10 | 8.54 | 20.18 | 20.18 | 22.85 | 1.48× | 3.37× | 0.70 | 0.53 | 176 / 9,319 / 0 | — | 0.3218 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 5.51 | 5.51 | 5.51 | 5.51 | 1.41× | 1.38× | 0.28 | 0.14 | 85 / 4,582 / 0 | — | 1.8363 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 4.34 | 4.66 | 4.66 | 4.87 | 1.88× | 1.46× | 0.94 | 0.75 | 71 / 4,827 / 0 | — | 1.1647 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 3 | 5.57 | 5.57 | 5.57 | 6.92 | 1.88× | 1.10× | 0.07 | 0.06 | 85 / 5,633 / 0 | — | 0.7689 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 13 | 5.61 | 12.19 | 12.19 | 13.46 | 1.50× | 2.03× | 0.15 | 0.13 | 124 / 6,797 / 0 | — | 0.6373 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 7 | 20.83 | 40.69 | 40.69 | 64.87 | 1.33× | 2.59× | 0.32 | 0.34 | 614 / 30,612 / 0 | — | 0.115 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 22.78 | 23.93 | 23.93 | 25.47 | 1.25× | 1.04× | 0.59 | 0.46 | 561 / 15,396 / 0 | — | 0.1004 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 6 | 6.20 | 8.99 | 8.99 | 10.85 | 2.58× | 3.74× | -0.30 | -0.31 | 102 / 12,882 / 0 | — | 0.1593 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 7 | 3.39 | 3.91 | 3.91 | 6.91 | 1.35× | 1.33× | -0.59 | -0.55 | 55 / 5,049 / 0 | — | 0.0738 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 3 | 3.12 | 3.12 | 3.12 | 3.79 | 1.66× | 1.53× | 0.72 | 0.60 | 53 / 4,793 / 0 | — | 1.2623 ms per entrie | — |
| fs.list | 5–16 entries · contended | 13 | 3.77 | 4.31 | 4.31 | 5.84 | 1.61× | 1.52× | 0.02 | 0.07 | 93 / 6,241 / 0 | — | 0.4207 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 22 | 3.18 | 5.14 | 5.21 | 6.34 | 1.67× | 1.35× | 0.37 | 0.34 | 58 / 5,254 / 0 | — | 0.3457 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 2 | 3.18 | 3.18 | 3.18 | 3.75 | 1.43× | 1.43× | -0.27 | -0.28 | 58 / 5,097 / 0 | — | 0.0043 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 3 | 3.06 | 3.06 | 3.06 | 3.45 | 1.93× | 1.93× | -0.06 | -0.08 | 69 / 3,374 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 3.63 | 3.63 | 3.63 | 3.63 | no baseline | no baseline | 0.46 | 0.38 | 149 / 7,285 / 0 | — | 0.0004 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 3.84 | 3.84 | 3.84 | 6.62 | 1.38× | 1.38× | -0.28 | -0.38 | 56 / 3,044 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 15 | 2.92 | 4.97 | 4.97 | 6.09 | 1.39× | 0.84× | -0.20 | -0.16 | 76 / 4,828 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 37 | 3.27 | 5.13 | 11.39 | 16.80 | 1.58× | 1.43× | 0.13 | 0.07 | 57 / 4,122 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 32 | 14.97 | 21.86 | 26.09 | 27.84 | 1.42× | 1.54× | 0.79 | 0.75 | 415 / 24,438 / 0 | — | 14.968 ms per file | commit |
| fs.rm | 1 files · uncontended | 47 | 10.40 | 20.38 | 38.16 | 40.07 | 1.55× | 1.82× | 0.10 | 0.22 | 161 / 10,021 / 0 | — | 10.4 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 3 | 2.74 | 2.74 | 2.74 | 3.02 | 1.26× | 1.23× | -0.26 | -0.30 | 63 / 3,193 / 0 | — | 0.0065 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 4 | 3.23 | 4.21 | 4.21 | 4.87 | 2.10× | 2.74× | 0.53 | 0.51 | 59 / 3,233 / 0 | — | 0.0074 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 2.42 | 2.42 | 2.42 | 3.41 | no baseline | no baseline | -0.16 | -0.11 | 44 / 2,746 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 3.78 | 3.78 | 3.78 | 3.78 | 1.80× | 1.80× | 0.11 | -0.01 | 63 / 4,113 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 10 | 2.75 | 6.00 | 6.00 | 28.12 | 1.05× | 1.75× | -0.14 | -0.17 | 69 / 4,455 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 15 | 2.78 | 5.75 | 5.75 | 15.89 | 1.42× | 2.66× | 0.54 | 0.37 | 50 / 4,188 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 7 | 2.81 | 3.13 | 3.13 | 3.83 | 1.25× | 1.04× | -0.06 | -0.06 | 61 / 3,943 / 0 | — | 0.0013 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 20 | 2.49 | 3.35 | 3.35 | 4.04 | 1.49× | 0.96× | 0.00 | -0.01 | 46 / 3,732 / 0 | — | 0.0008 ms per byte | — |
| fs.write | >512 KiB · contended | 4 | 14.39 | 26.26 | 26.26 | 30.47 | no baseline | no baseline | -1.92 | -2.00 | 254 / 10,517 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 10 | 12.77 | 17.87 | 17.87 | 20.35 | no baseline | no baseline | -1.45 | -3.05 | 176 / 5,996 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 19 | 12.78 | 100.91 | 100.91 | 110.94 | 1.50× | 6.77× | 0.43 | 0.47 | 331 / 17,458 / 0 | — | 0.025 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 60 | 8.07 | 14.32 | 17.76 | 24.34 | 1.27× | 1.36× | -0.26 | -0.20 | 141 / 6,352 / 0 | — | 0.0148 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 13 | 15.78 | 32.50 | 32.50 | 54.26 | 0.98× | 2.02× | 0.10 | 0.15 | 383 / 27,486 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 30 | 11.22 | 17.23 | 18.86 | 30.61 | 1.36× | 2.09× | 0.12 | 0.13 | 147 / 7,043 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 91 | 15.50 | 40.85 | 51.38 | 68.80 | 1.57× | 1.86× | 0.27 | 0.24 | 377 / 21,383 / 0 | — | 0.0009 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 162 | 8.84 | 13.42 | 29.95 | 185.79 | 1.23× | 0.98× | 0.10 | 0.11 | 158 / 7,371 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 149 | 13.93 | 40.82 | 76.02 | 94.09 | 1.42× | 1.82× | 0.07 | 0.08 | 328 / 20,222 / 0 | — | 0.0063 ms per byte | files.change |
| fs.write | ≤8 KiB · uncontended | 306 | 8.18 | 13.55 | 19.13 | 34.25 | 1.13× | 0.98× | 0.14 | 0.15 | 148 / 6,850 / 0 | — | 0.0034 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.98 | 0.98 | 0.98 | 0.98 | 1.30× | 1.30× | -0.11 | -0.12 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 41 | 30.97 | 51.07 | 56.21 | 63.36 | 1.47× | 1.47× | 0.14 | 0.08 | 257 / 29,688 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 99 | 25.24 | 40.23 | 48.03 | 209.25 | 1.21× | 1.16× | -0.01 | -0.03 | 231 / 22,124 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 10 | 3.56 | 4.10 | 4.10 | 4.65 | 0.93× | 0.51× | 0.08 | 0.11 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 45 | 3.58 | 5.07 | 5.77 | 36.83 | 0.89× | 0.99× | -0.08 | -0.07 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 6 | 11.45 | 13.05 | 13.05 | 14.65 | 1.19× | 0.67× | -0.10 | -0.04 | 124 / 6,136 / 0 | — | 11.447 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 11 | 10.33 | 16.31 | 16.31 | 24.14 | 1.24× | 1.33× | 0.04 | 0.02 | 113 / 4,329 / 0 | — | 10.333 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 419.84 | 419.84 | 419.84 | 419.84 | 11.02× | 11.02× | 0.52 | 0.35 | 17,871 / 741,923 / 8,191 | — | 419.837 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 12.97 | 16.51 | 16.51 | 17.48 | 0.87× | 0.84× | 0.69 | 0.67 | 155 / 7,421 / 0 | — | 6.4835 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 13 | 11.22 | 17.44 | 17.44 | 24.45 | 1.05× | 1.02× | 0.04 | 0.00 | 118 / 5,849 / 0 | — | 5.0135 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 10.30 | 10.30 | 10.30 | 10.30 | 0.62× | 0.62× | 0.22 | 0.17 | 113 / 5,156 / 0 | — | 2.0598 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 6 | 12.90 | 13.53 | 13.53 | 14.86 | 0.94× | 0.99× | 0.60 | 0.71 | 177 / 8,179 / 0 | — | 1.8433 ms per file | commit |
| sandbox.commit | — · Committed · contended | 5 | 90.62 | 121.31 | 121.31 | 123.89 | no baseline | no baseline | 1.24 | 1.47 | 949 / 163,741 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 8 | 84.41 | 1183.51 | 1183.51 | 15218.87 | 1.22× | 17.15× | 0.39 | 0.35 | 277 / 13,945 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 223 | 601.70 | 979.71 | 4640.17 | 5204.05 | 11.74× | 2.55× | 1.15 | 0.99 | — | 4,327 | — | — |
| sandbox.exec | 0 files · uncontended | 221 | 37.23 | 699.84 | 900.20 | 9834.08 | 1.17× | 2.45× | -0.06 | -0.08 | — | 4,420 | — | — |
| sandbox.exec | 1 files · contended | 30 | 39.38 | 63.75 | 91.55 | 135.89 | 1.07× | 0.76× | 0.10 | 0.07 | — | 5.50 | 39.381 ms per file | — |
| sandbox.exec | 1 files · uncontended | 35 | 43.46 | 72.16 | 72.26 | 78.16 | 1.30× | 1.07× | 0.40 | 0.33 | — | 5 | 43.461 ms per file | — |
| sandbox.exec | 17–64 files · contended | 5 | 73.53 | 79.44 | 79.44 | 91.81 | 1.05× | 1.14× | 0.29 | 0.22 | — | 108 | 3.8697 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 57.90 | 57.90 | 57.90 | 71.92 | 0.83× | 0.83× | -0.29 | -0.25 | — | 91 | 2.8948 ms per file | — |
| sandbox.exec | 2–4 files · contended | 24 | 38.09 | 60.91 | 63.75 | 68.86 | 0.98× | 0.87× | -0.05 | -0.05 | — | 9 | 15.978 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 56 | 42.82 | 79.33 | 107.22 | 114.30 | 1.12× | 1.21× | -0.22 | -0.18 | — | 10.80 | 18.2647 ms per file | — |
| sandbox.exec | 5–16 files · contended | 19 | 47.09 | 75.74 | 75.74 | 82.45 | 0.81× | 1.04× | 0.39 | 0.33 | — | 21 | 6.6161 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 28 | 51.23 | 72.50 | 77.48 | 78.08 | 0.72× | 0.69× | -0.24 | -0.15 | — | 22.70 | 7.8082 ms per file | — |
| sandbox.exec | — · contended | 16 | 3766.16 | 35933.26 | 35933.26 | 37809.28 | no baseline | no baseline | -0.95 | -0.86 | — | 44144.50 | — | — |
| sandbox.exec | — · uncontended | 29 | 219.32 | 27699.90 | 35860.22 | 37817.10 | 0.41× | 3.90× | 0.37 | 0.31 | — | 44144.50 | — | — |
| sandbox.mount | — · contended | 67 | 10.95 | 16.42 | 21.48 | 32.05 | 0.98× | 0.86× | -0.12 | -0.09 | 45 / 1,362 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 180 | 9.92 | 14.60 | 21.88 | 58.40 | 0.89× | 0.73× | -0.17 | -0.16 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.85 | 3.85 | 3.85 | 3.85 | no baseline | no baseline | 0.10 | 0.12 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.91 | 4.40 | 4.40 | 38.63 | no baseline | no baseline | -0.09 | -0.07 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 68 | 13.47 | 26.19 | 56.27 | 119.30 | 1.27× | 1.45× | -0.00 | 0.02 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 179 | 12.73 | 20.80 | 120.04 | 223.44 | 1.22× | 1.13× | 0.12 | 0.10 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 696.1 KiB | 3,089 | ok 13 |
| branch.diff_commits | branch | 408 | 0.0 KiB | 22.4 MiB | 75,502 | ok 408 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 10 | 0.0 KiB | 95.3 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 100 | 1.8 MiB | 0.0 KiB | 111 | Committed 100 |
| fs.diff_files | fs | 59 | 0.0 KiB | 421.1 KiB | 49 | Text 46, NoSuchPath 10, Equal 3 |
| fs.glob | fs | 62 | 0.0 KiB | 56.0 KiB | 722 | ok 62 |
| fs.grep | fs | 64 | 0.0 KiB | 226.1 KiB | 1,046 | ok 64 |
| fs.list | fs | 63 | 0.0 KiB | 293.4 KiB | 1,972 | ok 63 |
| fs.read | fs | 65 | 0.0 KiB | 182.4 KiB | 65 | ok 65 |
| fs.rm | fs | 79 | 0.0 KiB | 0.0 KiB | 79 | Committed 79 |
| fs.stat | fs | 70 | 0.0 KiB | 15.5 KiB | 70 | ok 70 |
| fs.write | fs | 844 | 18.7 MiB | 0.0 KiB | 844 | Committed 843, UpToDate 1 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 255 | 0.0 KiB | 0.0 KiB | 0 | Committed 199, UpToDate 55, Conflict 1 |
| sandbox.exec | sandbox | 698 | 2.6 MiB | 4.6 MiB | 0 | exit:0 694, exit:1 1, exit:2 3 |
| sandbox.mount | sandbox | 257 | 0.0 KiB | 0.0 KiB | 0 | Mounted 257 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 257 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 257 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.92 · end 1.48.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.76 | 19.101 · 2.373 · 1.607 · 1.479 · 1.76 | 2.2–2.2 | statements 32, vm_steps 1070, fullscan_steps 0, sorts 0, returned_rows 88 |
| read | 1.569 | 2.192 · 1.525 · 1.878 · 1.569 · 1.525 | 2.2–2.2 | statements 19, vm_steps 788, fullscan_steps 0, sorts 0, returned_rows 75 |
| list_small | 1.704 | 1.704 · 1.332 · 1.856 · 1.655 · 1.923 | 2.2–2.2 | statements 19, vm_steps 797, fullscan_steps 0, sorts 0, returned_rows 75 |
| list_largest | 11.204 | 16.981 · 11.321 · 10.895 · 11.204 · 10.639 | 2.2–2.2 | statements 187, vm_steps 25561, fullscan_steps 0, sorts 0, returned_rows 2587 |
| grep_scoped | 1.576 | 2.447 · 1.576 · 1.306 · 1.333 · 2.341 | 2.2–2.2 | statements 24, vm_steps 943, fullscan_steps 0, sorts 0, returned_rows 84 |
| glob_scoped | 1.405 | 1.415 · 1.321 · 1.227 · 2.402 · 1.405 | 2.2–2.2 | statements 18, vm_steps 776, fullscan_steps 0, sorts 0, returned_rows 74 |
| grep_tree | 6962.781 | 6573.276 · 7617.756 · 6954.962 · 7564.799 · 6962.781 | 1.82–2.18 | statements 61907, vm_steps 4649683, fullscan_steps 0, sorts 0, returned_rows 463550 |
| glob_tree | 10.894 | 12.221 · 10.98 · 10.894 · 10.399 · 10.444 | 1.82–1.82 | statements 140, vm_steps 20434, fullscan_steps 0, sorts 0, returned_rows 2113 |
| diff_files | 6.912 | 5.421 · 6.912 · 7.025 · 4.879 · 6.932 | 1.82–1.82 | statements 84, vm_steps 4468, fullscan_steps 0, sorts 0, returned_rows 438 |
| list_commits | 1.702 | 2.324 · 2.76 · 1.702 · 1.502 · 0.987 | 1.82–1.82 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 9.551 | 5.629 · 11.342 · 10.903 · 6.038 · 9.551 | 1.82–1.82 | statements 60, vm_steps 2045, fullscan_steps 0, sorts 0, returned_rows 222 |
| fork | 4.656 | 13.657 · 29.806 · 4.442 · 4.656 · 1.484 | 1.82–1.82 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 41.838 | 50.488 · 43.706 · 39.337 · 41.838 · 38.966 | 1.82–1.82 | statements 509, vm_steps 21972, fullscan_steps 0, sorts 0, returned_rows 1613 |
| oneshot_mount_unmount | 18.371 | 28.118 · 16.814 · 18.371 · 18.84 · 16.16 | 1.82–1.82 | statements 66, vm_steps 2290, fullscan_steps 82, sorts 2, returned_rows 224 |
| oneshot_commit | 74.327 | 76.788 · 73.05 · 74.327 · 85.456 · 73.628 | 1.82–1.82 | statements 184, vm_steps 10499, fullscan_steps 82, sorts 2, returned_rows 813 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.82–1.82 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 325.6 s** (tooling): play 127.2 · consolidate 121.2 · verify 22.8 · probes 37.0 · tests 0.0 · seal + snapshot 0.0 · report 17.4

325.60 s tooling: prepare 1.62 · play 125.59 · consolidate 121.25 · verify 11.35 (diff_commits) · version walk 11.41 · probes 37.00 · metrics 1.20 · Store allocation 0.36 · report 0.79

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T06:10:43.353Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 17.15× it; Scaling: diff_commits (chain-bounded): max over the latest cap period 9.551 vs the first 2.97: 3.216× (bound, period 8); Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8); Contended work: fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.313 over 19 ranges |

### G. Evidence

- `~/lfs-history/metrics/range-049.a1.json`
- trace `~/lfs-history/runs/p3-main-w/trace/range-049.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-w/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r049-3-packages-client | 601 | 581.2 KiB |
| r049-4-agents-notes | 420 | 581.0 KiB |
| r049-1-root | 179 | 578.3 KiB |
| r049-2-packages-host | 674 | 583.6 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 443.0 | 4,710 |
| `git diff --stat` | 39.0 | 4,703 |
| `git add -f` | 37.0 | — |
| `git rm --cached` | 9.0 | — |
| `git commit` | 43.0 | 4,705 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r049-1-root | end | P1 | pass | — | — |
| r049-1-root | end | P2 | pass | exit 0 | — |
| r049-1-root | end | P3 | n/a | an install, not a refresh | — |
| r049-1-root | end | P4 | pass | 266 emitted files, exit 2 | — |
| r049-1-root | end | P5 | n/a | no calibrated file | — |
| r049-1-root | end | P6 | n/a | not a repair | — |
| r049-2-packages-host | end | P1 | pass | — | — |
| r049-2-packages-host | end | P2 | pass | exit 0 | — |
| r049-2-packages-host | end | P3 | pass | 277 bookkeeping path(s) | — |
| r049-2-packages-host | end | P4 | pass | 62 emitted files, exit 2 | — |
| r049-2-packages-host | end | P5 | n/a | no calibrated file | — |
| r049-2-packages-host | end | P6 | n/a | not a repair | — |
| r049-4-agents-notes | end | P1 | pass | — | — |
| r049-4-agents-notes | end | P2 | pass | exit 0 | — |
| r049-4-agents-notes | end | P3 | pass | 277 bookkeeping path(s) | — |
| r049-4-agents-notes | end | P4 | pass | 71 emitted files, exit 1 | — |
| r049-4-agents-notes | end | P5 | pass | 11 files | — |
| r049-4-agents-notes | end | P6 | n/a | not a repair | — |
| r049-3-packages-client | end | P1 | pass | — | — |
| r049-3-packages-client | end | P2 | pass | exit 0 | — |
| r049-3-packages-client | end | P3 | pass | 277 bookkeeping path(s) | — |
| r049-3-packages-client | end | P4 | pass | 278 emitted files, exit 2 | — |
| r049-3-packages-client | end | P5 | pass | 69 files | — |
| r049-3-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2189 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
