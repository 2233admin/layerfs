# Range 056 · **optimize** · attempt 1

**Matches git ✓** · daemon `32eda22d657d` · image `d3773b4e` · plan v2 · continued from r055 (live Store)
dsh `7dff9c3ad`..`37b68e1c3` · **76 commits** (13 mainline, 63 side) · 2026-07-30 → 2026-07-31
Areas changed: `packages/client` 13% · `/` 13% · `docs` 7% · other 67%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 21 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.15×** · **Churn 0.00**
**Time split:** play 125.8 s · git 183.9 s · Node 331.0 s · verify 18.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **865.1 MiB** (+3.2 MiB) | **1.60 GiB** (+29.6 MiB) | **1.89×** (prev 1.86×) | **33.0 MiB** | **1,190** (total 66,733) | **363.5 s** tooling (total 211.2 min) |

**Checks:** 13 pass · 3 watch: Contended work not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (17 classes too narrow); SQL per call (sql.call); Directory share 0.514; Snapshot time 5592 ms for 1403.0 MiB new; size exponent 0.16 · 3 optimize/stop: Speed, Scaling, Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ probe diff_commits +39% · ▲ fs.list p95 +35% · ▲ stored added +31%
**Budget:** 57 of 202 ranges · projected total 16.5 h (budget 16.8 h) · disk 44% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **5,144 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 1 publish |
| Steps | 2,669 / 2,669 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3276 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 432 bin shims, 4750 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (61 lines from 4 .gitignore files) · **239 picks** in 4 merges (238 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `37b68e1c3`** · 165 commits written for 165 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 88 untracked, unignored (890,873 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 238 · Build outputs 1 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r056-2-agents-notes | end | `b702627db522` | `4ac160de1eb7` | pass (431 normalized) | pass | pass | pass | pass | n/a |
| r056-3-examples-acp-agent | end | `5c418bc16582` | `4ac160de1eb7` | pass (431 normalized) | pass | pass | pass | pass | n/a |
| r056-4-packages-client | end | `8b13128e871c` | `4ac160de1eb7` | pass (431 normalized) | pass | pass | pass | n/a | n/a |
| r056-1-root | end | `9be466cd4e87` | `7f72cd58bc0d` | pass (434 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `038792d682dd` | `null` | n/a | pass | n/a | n/a | pass | pass (137,652 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `apps/cli/tests/source-launch.compat.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/api-request-trust.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/http-bridge.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/projection-store.spec.ts` (fails natively) · `packages/client/runtime/tests/queue-store.spec.ts` (fails natively) · `packages/client/runtime/tests/request-inspection.spec.ts` (fails natively) · `packages/client/runtime/tests/scope.spec.ts` (fails natively) · `packages/client/runtime/tests/session-history-source.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/runtime/tests/wire-events.spec.ts` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/test-runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/test-runtime/tests/runtime.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/ask-question-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/assembly-surfaces.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-machine.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/queue-dock.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/terminal-card.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-question/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/node-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/plan-review-panel.spec.tsx` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/apply.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/browser-styles.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/rename-assembly.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/rows.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/tree.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/workspace-browser.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-picker.spec.tsx` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/dynamic-config.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/loader-composition.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/serialize.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/sse.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/translate.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/convert.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/dynamic-config.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/loader-composition.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/llm/llm/tests/assembler.spec.ts` (fails natively) · `packages/llm/llm/tests/attribution.spec.ts` (fails natively) · `packages/llm/llm/tests/call-config.spec.ts` (fails natively) · `packages/llm/llm/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm/tests/message.spec.ts` (fails natively) · `packages/llm/llm/tests/properties.spec.ts` (fails natively) · `packages/llm/llm/tests/retry-policy.spec.ts` (fails natively) · `packages/llm/llm/tests/service.spec.ts` (fails natively) · `packages/settings/settings-local/tests/concurrency.spec.ts` (fails natively) · `packages/settings/settings-local/tests/loader-composition.spec.ts` (fails natively) · `packages/settings/settings-local/tests/local.spec.ts` (fails natively) · `packages/settings/settings-local/tests/lock-race.spec.ts` (fails natively) · `packages/settings/settings-local/tests/watcher.spec.ts` (fails natively) · `packages/settings/settings/tests/invariant.spec.ts` (fails natively) · `packages/settings/settings/tests/settings.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/example-launch.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/loader-smoke.spec.ts` (fails natively) · `packages/typert/generator/tests/cordis-catalog.spec.ts` (fails natively) · `packages/typert/generator/tests/tools-catalog.spec.ts` (fails natively) · `packages/settings/settings-local/tests/local.spec.ts` (fails natively) · `packages/settings/settings-local/tests/concurrency.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively).

## 2. Activity

**3,512 calls** · **235 steps** by **9 agents + lead** on **4 Branches + main** · **287 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +167 added · 848 modified · −60 deleted · 22.1 MiB written · fs 979 : Sandbox 96 (**10 : 1**, reported only in P3)
**Execs:** 765 (JS 90 · shell 675) · 4 non-zero exits · install 0 · test runs 5 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,417 | 992 | 425 | Committed 992 · Text 47 · NoSuchPath 18 · Equal 5 |
| sandbox | 1,629 | 1,050 | 5 | commit 285 (Committed 212, UpToDate 72, Conflict 1) · exec 765 (exit:0 761, exit:1 1, exit:2 3) · mount 287 (Mounted 287) · status 5 · unmount 287 (Unmounted 287) |
| branch | 455 | 34 | 421 | diff_branches 14 · diff_commits 407 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,512** | **2,076** | **862** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r056-1-root | a01 a02 | 65 | 288 | ✓ | — |
| r056-2-agents-notes | a03 a04 a05 | 64 | 273 | ✓ | — |
| r056-3-examples-acp-agent | a06 a07 | 52 | 273 | ✓ | — |
| r056-4-packages-client | a08 a09 | 47 | 274 | ✓ | — |
| main | lead | 7 | 82 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r056-1, a01 after a02 | 0.1 s |
| Stale clean merge | 1 / 1 | r056-1, a02 a01 | merged cleanly |
| Decoy edit | 1 / 1 | r056-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r056-1 | 45 | 20 | 25 | 0 | 0 | 141 | commit-conflict, stale-clean-merge, decoy |
| a02 | r056-1 | 20 | 9 | 11 | 0 | 0 | 147 | commit-conflict, stale-clean-merge, decoy |
| a03 | r056-2 | 28 | 17 | 11 | 0 | 0 | 131 | — |
| a04 | r056-2 | 17 | 8 | 9 | 0 | 0 | 78 | — |
| a05 | r056-2 | 19 | 9 | 10 | 0 | 0 | 64 | — |
| a06 | r056-3 | 37 | 17 | 20 | 0 | 0 | 110 | — |
| a07 | r056-3 | 15 | 6 | 9 | 0 | 0 | 163 | — |
| a08 | r056-4 | 32 | 18 | 14 | 0 | 0 | 217 | — |
| a09 | r056-4 | 15 | 8 | 7 | 0 | 0 | 57 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 82 | — |
| **Total** |  | **235** | **113** | **116** | **6** | **0** | **1,190** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 160 · pnpm 1 · tsc 4 · vitest 5 · other 595

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r056-1-root | 39 | 39 | 39 | 4 | 39 | 332 |
| r056-4-packages-client | 36 | 36 | 36 | 1 | 36 | 629 |
| r056-3-examples-acp-agent | 34 | 34 | 34 | 2 | 34 | 464 |
| r056-2-agents-notes | 43 | 43 | 43 | 1 | 43 | 579 |
| **lead** | — | — | — | — | 165 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r056-2-agents-notes | 0 | 1 | 1 | 1 | 30 | 30 / 30 |
| r056-3-examples-acp-agent | 0 | 1 | 1 | 1 | 10 | 10 / 10 |
| r056-4-packages-client | 0 | 1 | 1 | 0 | 0 | — / — |
| r056-1-root | 1 | 0 | 1 | 1 | 31 | 31 / 31 |
| **lead repair** | 1 | — | 1 | — | — | 137,652 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r055) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 861.9 MiB (28.4 MiB / 692.0 MiB / 26.5 MiB / 115.0 MiB) | 865.1 MiB (29.0 MiB / 692.1 MiB / 27.0 MiB / 117.1 MiB) | +3.2 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,633 / 10,038 / 4,718 | 64,816 / 10,084 / 4,758 | +183 / +46 / +40 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.57 GiB | 1.60 GiB | +29.6 MiB |
| **Space amplification** (total · tracked) | 1.86× · tracked 4.94× | 1.89× · tracked 4.91× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.21** (0.88 / 0.22 / 0.94) | 0.98× the median range |
| **Stored per Commit** | 31.4 KiB | 25.3 KiB | — |
| Metadata share | 0.45 | 0.45 | this range 0.51 |
| History: Commits / Layers / Branches | 65,543 | 66,733 / 39 / 925 | +1,190 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.18 GiB (Commits 7.67 GiB · installs 835.1 MiB · build 93.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 38.07 GiB / 44% | — |
| Snapshot | — | r056, 1.37 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 901.8 MiB | 1.04 | +12.6 MiB |
| Metadata | 148.7 MiB | 0.17 | +3.4 MiB |
| Index rows | 504.5 MiB | 0.58 | +12.2 MiB |
| Waste | 77.0 MiB | 0.09 | +1.4 MiB |
| Other | 2.0 MiB | 0.00 | +40.0 KiB |
| **Total = Store on disk** | **1.60 GiB** | **= 1.89** space amplification | +29.6 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 29.0 MiB | 142.3 MiB (74.3 MiB + 68.0 MiB) | 4.91× | — | 2.1 MiB | 4.6 MiB | 0.46 |
| `node_modules` | 692.1 MiB | 239.0 MiB (201.5 MiB + 37.5 MiB) | 0.34× | — | 1.0 MiB | 249.4 KiB | 4.16 |
| Build output | 27.0 MiB | 33.2 MiB (30.6 MiB + 2.7 MiB) | 1.23× | — | 1.1 MiB | 9.5 MiB | 0.11 |
| `.git` | 117.1 MiB | 578.9 MiB (552.1 MiB + 26.8 MiB) | 4.94× | — | 11.6 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 583.5 MiB | — (not divided) | — | 13.6 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 57.1 MiB | — | — | — | — | — |
| **Total** | — | **1.60 GiB** | **= 1.89×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 217,187 | +4,066 | 6.5 KiB | 0 (derived) | 46% |
| Chunks (large files) | 75,691 | +1,415 | 16.0 KiB | — | 62% |
| Large-file extents | 18,232 | — | 0.4 KiB | — | — |
| Directories | 534,070 | 4,837 (with inodes, pooled) | 0.3 KiB | — | 58% |
| Inodes and attributes | 437,286 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,522 | +4,795 | 0.1 KiB | — | — |

Delta: 3.0% at depth cap · 22% of refused bases stopped by budget · `node_modules` reinstall: absolute: 919635 new stored bytes for 104414 raw changed bytes of 29 changed packages (8.808×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.91× (142.3 MiB for 29.0 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.0 KiB / 4.7 KiB / 6.5 KiB over 317 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.15× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.1 MiB stored for 2.70 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.47 (4 lanes × 865.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.7 KiB (budget not set) |

## 4. Speed

Daemon `32eda22d657d` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 12.8 ms / 44.4 ms (1.37×) | 3.6 ms / 10.6 ms (1.15×) | 4.5 ms / 11.3 ms (1.16×) | 25.5 ms / 62.8 ms (1.25×) | 12.7 ms / 24.4 ms (1.16×) | 458 ms / 472 ms (0.96×) | — (native comparison in P3; exec 40.8 ms / 1045 ms) |
| SQL p50: 177 stmts | 65 stmts | 69 stmts | 232 stmts | 50 stmts | 8,572 stmts | — |

**Commit cost:** 10.14 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 804 ms p50 over 287
**Slowest:** sandbox.exec 44272 ms · sandbox.exec 39615 ms · sandbox.exec 39467 ms · checkpoint diff_commits 0.12 ms and 1.60 statements per entry (74,166 entries per page)
**Scaling:** 1 of 15 probes flat · `stat` 0.87 · `read` 3.89 · `list_small` 1.83 · `list_largest` 2.22 · `grep_scoped` 7.34 · `glob_scoped` 5.67 · `grep_tree` 0.88 · `glob_tree` 2.41 · `diff_files` 7.18 · `list_commits` 0.91 · `diff_commits` 3.54 · `fork` 2.15 · `merge` 1.92 · `oneshot_commit` 1.50

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 485 ms / 485 ms | — / — | — | git / status-cold: — |
| git status (steady) | 454 ms / 692 ms | — / — | — | git / status-steady: — |
| git add | 51.0 ms / 107 ms | — / — | — | git / add: — |
| git commit (lane) | 56.0 ms / 86.0 ms | — / — | — | git / commit: — |
| lead writes main | 7927 ms / 7927 ms | — / — | — | — |
| repack | 3198 ms / 3198 ms | — / — | — | — |
| pnpm install (incremental) | 3951 ms / 3951 ms | 1955 ms / 1955 ms | 2.02× | pnpm-reinstall / cold: — |
| pnpm refresh | 3795 ms / 3795 ms | 2087 ms / 2087 ms | 1.82× | pnpm-reinstall / steady: — |
| tsc -b | 6180 ms / 18440 ms | 8483 ms / 9661 ms | 0.73× | tsc-b / cold: — |
| vitest | 8448 ms / 8448 ms | 2290 ms / 2290 ms | 3.69× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 14.6 ms / 29.3 ms

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
| 050.a1 | 60450 | 1462.0 | 7.36 (1.25×) · 7605 · 383 (12 solo) | 8.30 (1.34×) · 7756 · 375 (45 solo) | 8.39 (1.15×) · 6315 · 414 (17 solo) | 2.75 (1.38×) · 3950 · 225 (3 solo) | 9.61 (1.05×) · 1362 · — (daemon) | 8.81 (1.06×) · 3657 · — (daemon) | 459.51 (—×) · 530087 · 12571 (3 solo) |
| 051.a1 | 61383 | 1486.0 | 8.40 (1.42×) · 7415 · 341 (22 solo) | 7.57 (1.22×) · 6531 · 238 (89 solo) | 7.62 (1.04×) · 6446 · 278 (97 solo) | 2.55 (1.28×) · 3609 · 71 (8 solo) | 9.41 (1.03×) · 1362 · — (daemon) | 10.36 (1.24×) · 5130 · — (daemon) | 361.34 (—×) · 426337 · 10118 (3 solo) |
| 052.a1 | 62546 | 1527.8 | 8.42 (1.43×) · 7262 · 342 (30 solo) | 7.84 (1.26×) · 6616 · 294 (59 solo) | 8.42 (1.15×) · 6023 · 385 (71 solo) | 2.54 (1.28×) · 3082 · — (0 solo) | 9.94 (1.09×) · 1362 · — (daemon) | 8.67 (1.04×) · 4221 · — (daemon) | 367.37 (—×) · 482357 · 12922 (3 solo) |
| 053.a1 | 63409 | 1550.9 | 8.89 (1.51×) · 7121 · 293 (18 solo) | 8.78 (1.41×) · 6567 · 421 (50 solo) | 10.08 (1.38×) · 6512 · 450 (40 solo) | 2.67 (1.34×) · 4309 · 235 (2 solo) | 10.60 (1.16×) · 1362 · — (daemon) | 9.77 (1.17×) · 4992 · — (daemon) | 247.84 (—×) · 324874 · 8146 (3 solo) |
| 054.a1 | 64802 | 1581.6 | 7.91 (1.34×) · 6951 · 232 (25 solo) | 8.69 (1.40×) · 6748 · 292 (52 solo) | 9.06 (1.24×) · 6801 · 344 (57 solo) | 2.41 (1.21×) · 3590 · 53 (2 solo) | 9.82 (1.08×) · 1362 · — (daemon) | 8.88 (1.06×) · 5205 · — (daemon) | 367.61 (—×) · 504299 · 12592 (4 solo) |
| 055.a1 | 65543 | 1604.4 | 9.52 (1.61×) · 7149 · 262 (24 solo) | 10.65 (1.71×) · 7457 · 339 (83 solo) | 9.23 (1.27×) · 5796 · 333 (56 solo) | 3.19 (1.60×) · 4074 · 77 (6 solo) | 10.30 (1.13×) · 1362 · — (daemon) | 9.66 (1.16×) · 3942 · — (daemon) | 422.43 (—×) · 350398 · 10094 (3 solo) |
| 056.a1 | 66733 | 1634.0 | 10.66 (1.81×) · 7896 · 313 (11 solo) | 10.31 (1.66×) · 7283 · 341 (25 solo) | 10.65 (1.46×) · 6820 · 413 (30 solo) | 3.04 (1.52×) · 3866 · 35 (2 solo) | 11.63 (1.27×) · 1362 · — (daemon) | 8.99 (1.08×) · 4188 · — (daemon) | 457.77 (—×) · 382689 · 11272 (4 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4157112 → 4177712 B · fs.write ≤8 KiB 4157112 → 4177712 B · fs.write ≤64 KiB 4157112 → 4177712 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2789272 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4177712 B
**Host load (1-min, recorded, not waited on):** macOS 7.83 at the first command → 6.25 after the last (max 11.84 over 8 commands) · Docker VM 2.15 → 2.2

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
| control-050.a1 | 12851 · 207.8 | 60450 · 1462.0 | 8.62 (1.39× first) / 6.89 · 0.80× · 114/131 | 12.07 (1.89× first) / 7.13 · 0.59× · 110/126 | 6.75 (2.42× first) / 5.18 · 0.77× · 90/161 | 6.45 → 7.13 | pass |
| control-051.a1 | 12851 · 207.8 | 61383 · 1486.0 | 6.69 (1.08× first) / 5.70 · 0.85× · 116/156 | 5.60 (0.88× first) / 4.93 · 0.88× · 112/127 | 2.61 (0.94× first) / 2.92 · 1.12× · 90/144 | 7.43 → 7.15 | pass |
| control-052.a1 | 12851 · 207.8 | 62546 · 1527.8 | 5.48 (0.88× first) / 6.37 · 1.16× · 116/130 | 5.38 (0.84× first) / 5.50 · 1.02× · 111/127 | 2.69 (0.96× first) / 2.85 · 1.06× · 90/145 | 8.02 → 7.62 | pass |
| control-053.a1 | 12851 · 207.8 | 63409 · 1550.9 | 5.28 (0.85× first) / 6.45 · 1.22× · 113/142 | 5.34 (0.84× first) / 5.66 · 1.06× · 111/125 | 2.77 (0.99× first) / 2.78 · 1.00× · 90/123 | 7.87 → 7.64 | pass |
| control-054.a1 | 12851 · 207.8 | 64802 · 1581.6 | 5.87 (0.95× first) / 5.30 · 0.90× · 116/129 | 6.10 (0.95× first) / 5.30 · 0.87× · 110/124 | 2.46 (0.88× first) / 2.92 · 1.19× · 74/117 | 9.96 → 9.48 | pass |
| control-055.a1 | 12851 · 207.8 | 65543 · 1604.4 | 5.43 (0.87× first) / 5.86 · 1.08× · 116/132 | 5.58 (0.87× first) / 5.82 · 1.04× · 111/128 | 2.47 (0.88× first) / 3.15 · 1.28× · 74/109 | 5.70 → 5.75 | pass |
| control-056.a1 | 12851 · 207.8 | 66733 · 1634.0 | 8.03 (1.29× first) / 7.10 · 0.88× · 121/135 | 7.29 (1.14× first) / 8.01 · 1.10× · 112/129 | 3.08 (1.11× first) / 3.14 · 1.02× · 72/124 | 5.59 → 5.86 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-056.a1)

## 5. Findings and action

### Finding 056.a1 · optimize

**1. Trigger** (attempt 1, daemon `32eda22d657d`)

| Check | Value | Threshold |
| --- | --- | --- |
| Speed | fs.grep 17–64 files · uncontended: 3.72× baseline (sdk.lines); not judged: fs.apply ≤64 KiB · uncontended: 3/20/20 calls (1.74×), fs.write >512 KiB · uncontended: 2/7/12 calls (1.6×), sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (1.46×) (baseline class under 5 calls per range) | ≤ 1.2× |
| Scaling | branch.diff_commits checkpoint ms in total (entries exponent -0.066): tree files exponent 1.515 | < 0.15 |
| Counters | oneshot_mount_unmount.statements: depth exponent 2.346 | < 0.05 |

Diagnosis pending: `finding-056.a1.json`.

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

- **a1 (`p3-main-x`, daemon `32eda22d`): OPTIMIZE, terminal under the fast-mode ruling (rows recorded).** Checkpoint ok, git ✓. Node: 4 lane points P1–P5 pass, repair P6 pass. Control `control-056.a1` passes. Report check F1–F8 PASS. Native first passed with no fix.
  - Lane point `r056-4-packages-client.end` has no calibrated test, so its P3 is n/a. All 103 candidates fail natively at this lane state with vitest `TSCONFIG_ERROR … Tsconfig not found` (`packages/llm/llm-deepseek/src/invariant.ts`), the same on both sides.
- **Optimize rows:**
  - **Speed: `fs.grep` 17–64 files, uncontended.**
    - p90 48.5 ms, 3.72× baseline, about 35 ms over the 5 ms floor.
    - p50 14.0 ms (1.25×).
    - Statements per call: 288, against 159–302 on r51–r55. Per file: 0.40 ms, as on r54.
    - Host load: 7.4–11.8.
    - A tail on a call-size bucket; recorded.
  - **Scaling: `branch.diff_commits` checkpoint ms in total, tree files exponent 1.52.**
    - Per entry, r51–r56: 0.10, 0.11, 0.10, 0.11, 0.12, 0.11 ms.
    - Statements per entry stayed at 1.53–1.60.
    - The tree grew only 6% over the window (4,832 → 5,144 files), so a few ms of wall time give a large exponent.
    - The entries exponent is -0.07.
    - Recorded.
  - **Counters: `oneshot_mount_unmount.statements`, depth exponent 2.35 (70).** Cold mount: 66 statements, 10 blob opens. The liaison's handoff item asks the 61–70 session to find what sets this count.
- **F-063 active:** chunk PREFIX 714 vs FULL 300 over 152 lane git Commits (146 with a PREFIX chunk).
- **Storage watch:**

  | | r56 | r55 |
  | --- | --- | --- |
  | Store | +29.6 MiB | +22.8 MiB |
  | `.git` stored | +11.6 MiB | +7.2 MiB |
  | Index rows | +12.2 MiB (492.3 → 504.5 MiB) | |

- **Clean:** the `-d` clean removed 88 files (891 KB), `tool-cordis`'s emitted `api-catalog.d.ts` and `.map` files, and no folder.
- **Steps:**
  - Lead 3 s. Cuts 30, 45 and 60: 28, 13 and 16 s. Lanes 84 s.
  - Repair 146 s (install 44.3, build 33.2, tests 2.8).
  - Verify 22 s. Finish 64 s of 90 s.
- **Snapshot:** 1,403.0 MiB new, 5.6 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2669/2669; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.grep 17–64 files · uncontended: 3.72× baseline (sdk.lines); not judged: fs.apply ≤64 KiB · uncontended: 3/20/20 calls (1.74×), fs.write >512 KiB · uncontended: 2/7/12 calls (1.6×), sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (1.46×) (baseline class under 5 calls per range) | ≤ 1.2× | optimize |
| Scaling | branch.diff_commits checkpoint ms in total (entries exponent -0.066): tree files exponent 1.515 | < 0.15 | optimize |
| Counters | oneshot_mount_unmount.statements: depth exponent 2.346 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (17 classes too narrow); SQL per call (sql.call) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.514 | < 0.5 | watch |
| Reinstall growth | absolute: 919635 new stored bytes for 104414 raw changed bytes of 29 changed packages (8.808×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0303 (budget 0.2158) | < 0.1 | pass |
| Range growth | 33.0 MiB, 1.25× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 5592 ms for 1403.0 MiB new; size exponent 0.16 | < 0.15 | watch |
| Disk projection | 0.44 | < 0.8 | pass |
| Wall projection | 0.98 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 165 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 21 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 238 · build 1; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.15× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 235 | 236 |
| Lanes / agents | 4 / 9 | 4 / 9 |
| LayerFS Commits | 1190 | 1024 |
| Workspaces (one-shot share) | 287 (0.99) | 115 (0.983) |
| Reads | 380 | 380 |
| Reconcile writes | 74 | 74 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `32eda22d657d` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 14 | 28.07 | 497.64 | 497.64 | 956.13 | 1.11× | 1.13× | 4.98 | 8.04 | 387 / 44,668 / 0 | — | 0.115 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 14.85 | 14.85 | 14.85 | 14.85 | 1.03× | 1.03× | 0.51 | -0.01 | 194 / 21,739 / 0 | — | 0.4641 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 4 | 97.69 | 506.61 | 506.61 | 522.50 | 0.33× | 1.70× | -12.44 | -18.04 | 912 / 72,237 / 0 | — | 0.6502 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 397 | 22.73 | 44.94 | 86.11 | 636.41 | 1.09× | 1.10× | 0.98 | 1.66 | 311 / 34,825 / 0 | — | 0.1242 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 1.37 | 2.64 | 2.64 | 3.88 | 2.67× | 1.54× | -0.65 | 0.46 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 1.03 | 1.03 | 1.03 | 1.25 | 1.11× | 1.11× | 2.44 | 3.57 | 70 / 1,298 / 0 | — | 0.0514 ms per entrie | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 2.10 | 2.10 | 2.10 | 2.10 | 1.17× | 1.17× | 6.40 | 10.38 | 35 / 517 / 0 | — | 0.0599 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 472.48 | 472.48 | 472.48 | 526.88 | 0.96× | 0.96× | 2.72 | 2.88 | 9,824 / 533,602 / 0 | — | 4.5421 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 7.85 | 7.85 | 7.85 | 7.85 | 1.29× | 1.29× | 4.76 | 10.07 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 29.46 | 29.46 | 29.46 | 29.46 | 1.11× | 1.11× | -1.50 | -1.13 | 173 / 12,775 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 5 | 27.84 | 32.75 | 32.75 | 42.48 | 1.81× | 2.03× | 8.90 | 16.50 | 477 / 91,371 / 8,191 | — | 0.0736 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 4 | 10.88 | 11.00 | 11.00 | 14.12 | 1.57× | 1.04× | -1.73 | -3.67 | 142 / 9,077 / 0 | — | 0.0627 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 12.39 | 12.39 | 12.39 | 12.39 | 1.74× | 1.28× | 2.10 | 2.34 | 150 / 5,113 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 10 | 26.60 | 42.53 | 42.53 | 133.83 | 1.87× | 1.11× | 14.21 | 23.11 | 390 / 23,300 / 0 | — | 0.0099 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 8 | 12.00 | 14.80 | 14.80 | 20.81 | 1.77× | 1.35× | 1.25 | 1.76 | 179 / 8,228 / 0 | — | 0.0043 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 10 | 12.77 | 23.01 | 23.01 | 34.89 | 1.44× | 1.98× | 0.90 | 0.64 | 320 / 15,171 / 0 | — | 0.0572 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 25 | 10.32 | 17.44 | 18 | 33.76 | 1.40× | 1.51× | 1.32 | 2.90 | 171 / 9,480 / 0 | — | 0.0329 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 13.36 | 16.47 | 16.47 | 17.64 | 1.42× | 1.29× | 3.77 | 4.36 | 207 / 12,640 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 14 | 10.13 | 15.03 | 15.03 | 18.46 | 1.11× | 1.23× | 1.82 | 2.65 | 200 / 10,957 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 4 | 10.71 | 10.96 | 10.96 | 16.92 | 1.48× | 1.02× | 4.77 | 8.75 | 245 / 12,191 / 0 | — | 0.0024 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 6 | 8.72 | 13.94 | 13.94 | 28.82 | 1.12× | 1.34× | 3.97 | 5.81 | 171 / 9,632 / 0 | — | 0.0043 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 3.28 | 3.28 | 3.28 | 3.28 | 2.55× | 2.55× | 5.48 | 9.09 | 57 / 3,513 / 0 | — | 3.284 ms per file | — |
| fs.glob | 17–64 files · contended | 2 | 11.57 | 11.57 | 11.57 | 15.03 | 2.70× | 1.77× | 11.31 | 17.73 | 229 / 17,218 / 0 | — | 0.2269 ms per file | — |
| fs.glob | 17–64 files · uncontended | 9 | 7.07 | 14.31 | 14.31 | 23.71 | 1.23× | 1.84× | 7.26 | 9.70 | 123 / 13,485 / 0 | — | 0.3215 ms per file | — |
| fs.glob | 2–4 files · contended | 3 | 3.30 | 3.30 | 3.30 | 4.50 | 1.01× | 0.81× | -3.00 | -3.89 | 86 / 5,337 / 0 | — | 0.8245 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 2.28 | 2.35 | 2.35 | 8.52 | 0.81× | 0.67× | -3.51 | -6.17 | 45 / 3,835 / 0 | — | 0.761 ms per file | — |
| fs.glob | 5–16 files · contended | 8 | 4.50 | 8.23 | 8.23 | 13.61 | 1.26× | 1.97× | 3.95 | 5.59 | 80 / 7,295 / 0 | — | 0.5623 ms per file | — |
| fs.glob | 5–16 files · uncontended | 11 | 4.42 | 5.21 | 5.21 | 7.85 | 1.43× | 1.05× | 4.99 | 6.93 | 63 / 4,707 / 0 | — | 0.5497 ms per file | — |
| fs.glob | >64 files · contended | 7 | 10.04 | 47.81 | 47.81 | 57.94 | 1.90× | 6.31× | 11.19 | 19.21 | 128 / 17,090 / 0 | — | 0.015 ms per file | — |
| fs.glob | >64 files · uncontended | 21 | 9.19 | 44.48 | 44.48 | 58.00 | 1.69× | 2.42× | 8.12 | 11.93 | 104 / 14,821 / 0 | — | 0.0352 ms per file | — |
| fs.grep | 17–64 files · uncontended | 10 | 14.01 | 48.50 | 48.50 | 54.47 | 1.25× | 3.72× | 5.81 | 8.67 | 288 / 14,511 / 0 | — | 0.3958 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 2.67 | 2.67 | 2.67 | 4.39 | 0.74× | 0.54× | -3.28 | -3.43 | 56 / 3,702 / 0 | — | 0.6665 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 2 | 3.74 | 3.74 | 3.74 | 4.86 | 0.99× | 0.76× | 5.45 | 7.45 | 52 / 4,509 / 0 | — | 1.246 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 7 | 8.55 | 15.24 | 15.24 | 18.41 | 1.51× | 2.70× | 2.15 | 3.70 | 185 / 10,087 / 0 | — | 0.9528 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 10 | 7.88 | 13.80 | 13.80 | 18.06 | 1.42× | 1.67× | 2.31 | 3.60 | 125 / 6,879 / 0 | — | 0.9855 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 9 | 27.48 | 91.14 | 91.14 | 165.03 | 1.13× | 3.74× | -6.54 | -6.40 | 737 / 31,554 / 0 | — | 0.109 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 19 | 29.32 | 58.81 | 58.81 | 64.77 | 1.21× | 1.41× | 3.56 | 6.09 | 461 / 31,600 / 0 | — | 0.1427 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 9 | 6.85 | 11.26 | 11.26 | 12.07 | 1.44× | 1.93× | 3.87 | 7.68 | 83 / 7,214 / 0 | — | 0.1949 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 14 | 5.71 | 10.79 | 10.79 | 15.80 | 1.66× | 1.40× | 3.00 | 6.25 | 65 / 6,811 / 0 | — | 0.1534 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 3.29 | 3.29 | 3.29 | 5.06 | 1.01× | 0.99× | 3.08 | 5.23 | 59 / 3,335 / 0 | — | 1.6445 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 3.71 | 4.79 | 4.79 | 4.87 | 1.50× | 1.47× | 6.55 | 10.12 | 51 / 4,984 / 0 | — | 1.623 ms per entrie | — |
| fs.list | 5–16 entries · contended | 10 | 5.47 | 10.04 | 10.04 | 161.58 | 1.61× | 1.81× | 5.51 | 8.21 | 116 / 9,410 / 0 | — | 0.9118 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 21 | 3.79 | 5.78 | 5.78 | 6.97 | 1.16× | 1.05× | 3.26 | 4.36 | 59 / 5,398 / 0 | — | 0.4277 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 1.61 | 1.61 | 1.61 | 1.61 | 0.40× | 0.37× | -6.86 | -17.46 | 50 / 3,427 / 0 | — | 0.0031 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 8 | 3.87 | 6.69 | 6.69 | 7.69 | 1.53× | 2.26× | 3.36 | 4.82 | 67 / 4,279 / 0 | — | 0.0045 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 5.16 | 5.16 | 5.16 | 5.16 | 1.57× | 1.44× | 12.79 | 19.35 | 79 / 6,606 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 3.37 | 3.37 | 3.37 | 4.36 | 1.18× | 1.08× | 1.51 | 3.03 | 53 / 4,420 / 0 | — | 0.0001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 16 | 5.41 | 14.13 | 14.13 | 17.08 | 1.63× | 2.70× | 8.31 | 11.99 | 90 / 5,718 / 0 | — | 0.0017 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 33 | 3.04 | 5.35 | 6.57 | 15.49 | 1.15× | 0.86× | 2.34 | 3.52 | 57 / 3,866 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 18 | 11.04 | 21.68 | 21.68 | 35.69 | 1.08× | 1.16× | -1.60 | -3.92 | 149 / 7,572 / 0 | — | 11.044 ms per file | commit |
| fs.rm | 1 files · uncontended | 39 | 12.29 | 20.64 | 22.83 | 46.26 | 1.36× | 1.47× | 2.20 | 4.51 | 163 / 9,013 / 0 | — | 12.29 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 3 | 3.77 | 3.77 | 3.77 | 4.45 | 1.32× | 1.32× | 0.21 | 1.37 | 101 / 5,655 / 0 | — | 0.0088 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 13 | 3.04 | 5.02 | 5.02 | 7.90 | 1.08× | 1.51× | 0.71 | 1.69 | 54 / 3,894 / 0 | — | 0.0062 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 4.58 | 4.58 | 4.58 | 4.58 | 1.94× | 1.94× | 3.23 | 8.01 | 112 / 5,577 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 4 | 2.99 | 4.40 | 4.40 | 5.51 | 1.22× | 1.80× | 2.42 | 3.84 | 40 / 3,578 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 6 | 3.97 | 6.27 | 6.27 | 7.74 | 1.64× | 2.02× | 7.51 | 11.18 | 69 / 5,160 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 12 | 2.86 | 3.23 | 3.23 | 3.95 | 1.01× | 0.90× | 2.56 | 3.94 | 47 / 3,229 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 5 | 3.41 | 5.03 | 5.03 | 5.62 | 1.24× | 1.64× | 6.21 | 9.68 | 49 / 3,878 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 20 | 3.07 | 7.08 | 7.08 | 7.59 | 1.29× | 2.27× | 3.22 | 5.00 | 43 / 3,814 / 0 | — | 0.0009 ms per byte | — |
| fs.write | >512 KiB · contended | 3 | 20.65 | 20.65 | 20.65 | 36.43 | 1.19× | 1.19× | 4.39 | 5.02 | 183 / 9,501 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 12 | 15.56 | 23.55 | 23.55 | 24.72 | 1.31× | 1.60× | 3.19 | 5.86 | 165 / 5,912 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 46 | 24.09 | 111.72 | 184.51 | 207.19 | 1.65× | 1.64× | 4.84 | 6.61 | 445 / 32,087 / 0 | — | 0.052 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 83 | 10.66 | 28.53 | 38.61 | 55.37 | 1.39× | 1.83× | 2.35 | 3.93 | 162 / 7,896 / 0 | — | 0.0229 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 11 | 23.91 | 66.67 | 66.67 | 130.01 | 1.44× | 1.34× | 9.36 | 12.20 | 450 / 30,087 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 27 | 14.86 | 26.63 | 34.47 | 42.01 | 1.31× | 1.46× | 2.34 | 4.06 | 175 / 7,940 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 101 | 20.23 | 65.38 | 169.05 | 191.40 | 1.41× | 2.26× | 3.80 | 6.31 | 345 / 20,752 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 209 | 10.65 | 19.65 | 26.15 | 37.65 | 1.27× | 1.23× | 3.13 | 5.13 | 157 / 6,820 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 158 | 20.23 | 56.84 | 91.63 | 173.33 | 1.77× | 1.62× | 4.10 | 6.33 | 332 / 20,762 / 0 | — | 0.0074 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 244 | 10.31 | 21.36 | 26.99 | 169.16 | 1.37× | 1.74× | 4.13 | 5.89 | 155 / 7,283 / 0 | — | 0.0027 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.64 | 0.64 | 0.64 | 0.64 | 0.93× | 0.93× | -7.14 | -8.36 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 60 | 38.50 | 55.88 | 62.10 | 106.47 | 1.33× | 1.24× | 3.12 | 5.50 | 391 / 36,501 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 93 | 31.46 | 49.12 | 87.03 | 276.46 | 1.25× | 0.99× | 0.18 | 0.94 | 306 / 24,718 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 19 | 4.49 | 9.54 | 9.54 | 54.04 | 1.13× | 1.49× | 2.69 | 4.75 | 6 / 71 / 0 | — | — | observe.before |
| sandbox.commit | 0 files · UpToDate · uncontended | 53 | 4.12 | 8.72 | 9.13 | 48.53 | 1.21× | 1.46× | 0.88 | 1.77 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 9 | 16.89 | 19.99 | 19.99 | 37.64 | 1.58× | 1.08× | 5.42 | 10.17 | 141 / 7,240 / 0 | — | 16.889 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 14 | 8.99 | 12.33 | 12.33 | 14.86 | 1.05× | 1.07× | -0.93 | -1.53 | 107 / 4,188 / 0 | — | 8.992 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 320.71 | 320.71 | 320.71 | 320.71 | 1.24× | 1.24× | 2.22 | 6.04 | 15,305 / 521,223 / 0 | — | 320.714 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 7 | 17.79 | 42.32 | 42.32 | 48.84 | 1.54× | 2.91× | 7.33 | 8.16 | 176 / 9,007 / 0 | — | 8.424 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 5 | 12.02 | 16.51 | 16.51 | 18.97 | 1.16× | 0.89× | -1.06 | -1.49 | 114 / 7,155 / 0 | — | 4.1283 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 23.46 | 23.46 | 23.46 | 23.46 | 1.39× | 1.22× | -11.67 | -18.89 | 307 / 14,701 / 0 | — | 3.3509 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 21.19 | 23.82 | 23.82 | 25.46 | 1.38× | 1.46× | 3.77 | 1.26 | 193 / 11,207 / 0 | — | 2.9771 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 14 | 110.17 | 1330.80 | 1330.80 | 15369.67 | 1.17× | 1.10× | 1.51 | 2.00 | 1,031 / 51,422 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 299 | 50.48 | 997.01 | 5828.10 | 5847.80 | 0.09× | 1.01× | -26.64 | -37.02 | 0 / 0 / 0 | 4669.30 | — | — |
| sandbox.exec | 0 files · uncontended | 181 | 32.94 | 715.63 | 982.97 | 10621.61 | 0.94× | 1.05× | -0.79 | -1.41 | — | 4,681 | — | — |
| sandbox.exec | 1 files · contended | 49 | 37.91 | 61.64 | 64.80 | 69.66 | 1.00× | 1.16× | 0.46 | 0.54 | — | 4.70 | 37.907 ms per file | — |
| sandbox.exec | 1 files · uncontended | 36 | 35.10 | 63.79 | 67.90 | 110.43 | 0.96× | 1.02× | -0.07 | -0.23 | — | 4.70 | 35.099 ms per file | — |
| sandbox.exec | 17–64 files · contended | 5 | 79.34 | 82.59 | 82.59 | 111.77 | 1.20× | 1.20× | 1.08 | 1.82 | — | 110 | 3.9672 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 3 | 74.74 | 74.74 | 74.74 | 81.92 | 1.12× | 0.99× | 0.87 | 2.19 | — | 98 | 3.737 ms per file | — |
| sandbox.exec | 2–4 files · contended | 54 | 43.98 | 78.54 | 83.43 | 84.30 | 1.23× | 1.30× | 0.99 | 1.16 | — | 10.30 | 15.255 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 31 | 47.75 | 75.71 | 77.90 | 81.16 | 1.29× | 1.14× | 2.36 | 3.30 | — | 12 | 17.1495 ms per file | — |
| sandbox.exec | 5–16 files · contended | 19 | 56.62 | 79.65 | 79.65 | 90.86 | 1.31× | 1.12× | -1.73 | -3.43 | — | 20.80 | 6.1317 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 29 | 57.99 | 115.84 | 127.19 | 134.25 | 1.36× | 1.71× | -0.59 | -0.70 | — | 33.50 | 7.734 ms per file | — |
| sandbox.exec | — · contended | 19 | 3788.01 | 38670.95 | 38670.95 | 39251.64 | 1.15× | 1.31× | -7.40 | -9.16 | — | 46648.10 | — | — |
| sandbox.exec | — · uncontended | 30 | 309.83 | 39466.73 | 39615.42 | 44272.29 | 0.98× | 2.13× | -5.22 | -3.51 | — | 41729.10 | — | — |
| sandbox.mount | — · contended | 119 | 13.66 | 31.55 | 60.04 | 65.51 | 1.34× | 1.89× | 3.33 | 5.22 | 58 / 1,599 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 158 | 11.63 | 21.17 | 25.92 | 45.41 | 1.16× | 1.19× | 1.83 | 3.14 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 4.84 | 4.89 | 4.89 | 50.13 | 0.96× | 0.67× | 2.41 | 3.35 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 94 | 15.99 | 29.50 | 33.17 | 41.55 | 1.25× | 1.36× | 2.88 | 4.75 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 183 | 13.93 | 29.29 | 155.55 | 196.31 | 1.03× | 1.18× | 1.83 | 2.75 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 14 | 0.0 KiB | 748.9 KiB | 3,321 | ok 14 |
| branch.diff_commits | branch | 407 | 0.0 KiB | 22.4 MiB | 75,691 | ok 407 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 95.8 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 41 | 1.1 MiB | 0.0 KiB | 52 | Committed 41 |
| fs.diff_files | fs | 70 | 0.0 KiB | 494.6 KiB | 52 | Text 47, NoSuchPath 18, Equal 5 |
| fs.glob | fs | 76 | 0.0 KiB | 77.5 KiB | 1,025 | ok 76 |
| fs.grep | fs | 69 | 0.0 KiB | 299.3 KiB | 1,101 | ok 69 |
| fs.list | fs | 72 | 0.0 KiB | 349.8 KiB | 2,334 | ok 72 |
| fs.read | fs | 66 | 0.0 KiB | 246.8 KiB | 66 | ok 66 |
| fs.rm | fs | 57 | 0.0 KiB | 0.0 KiB | 57 | Committed 57 |
| fs.stat | fs | 72 | 0.0 KiB | 16.2 KiB | 72 | ok 72 |
| fs.write | fs | 894 | 20.7 MiB | 0.0 KiB | 894 | Committed 894 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 285 | 0.0 KiB | 0.0 KiB | 0 | Committed 212, UpToDate 72, Conflict 1 |
| sandbox.exec | sandbox | 765 | 3.1 MiB | 6.6 MiB | 0 | exit:0 761, exit:1 1, exit:2 3 |
| sandbox.mount | sandbox | 287 | 0.0 KiB | 0.0 KiB | 0 | Mounted 287 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 287 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 287 |

### C. Scale probes

Binary: daemon `32eda22d657d`.

Load average (1-min, runner (Docker VM kernel)): start 2.15 · end 2.2.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.276 | 15.281 · 1.439 · 1.276 · 1.19 · 1.156 | 3.26–3.26 | statements 36, vm_steps 1197, fullscan_steps 0, sorts 0, returned_rows 98 |
| read | 1.328 | 1.736 · 1.345 · 1.242 · 1.328 · 1.28 | 3.26–3.26 | statements 20, vm_steps 852, fullscan_steps 0, sorts 0, returned_rows 82 |
| list_small | 1.205 | 1.271 · 1.268 · 1.159 · 1.205 · 1.087 | 3.26–3.26 | statements 20, vm_steps 861, fullscan_steps 0, sorts 0, returned_rows 82 |
| list_largest | 11.611 | 13.593 · 11.542 · 11.611 · 12.799 · 11.371 | 3.26–3.26 | statements 191, vm_steps 27425, fullscan_steps 0, sorts 0, returned_rows 2609 |
| grep_scoped | 1.642 | 2.288 · 1.727 · 1.627 · 1.447 · 1.642 | 3.26–3.26 | statements 25, vm_steps 1007, fullscan_steps 0, sorts 0, returned_rows 91 |
| glob_scoped | 1.702 | 1.702 · 1.308 · 1.175 · 1.796 · 1.801 | 3.26–3.26 | statements 19, vm_steps 840, fullscan_steps 0, sorts 0, returned_rows 81 |
| grep_tree | 6214.371 | 6515.281 · 6129.153 · 6214.371 · 5979.318 · 6254.07 | 2.37–3.08 | statements 66007, vm_steps 4823545, fullscan_steps 0, sorts 0, returned_rows 477679 |
| glob_tree | 10.33 | 13.101 · 9.743 · 10.33 · 10.325 · 11.795 | 2.37–2.37 | statements 134, vm_steps 20672, fullscan_steps 0, sorts 0, returned_rows 2102 |
| diff_files | 6.458 | 7.155 · 6.438 · 6.074 · 6.908 · 6.458 | 2.37–2.37 | statements 102, vm_steps 4996, fullscan_steps 0, sorts 0, returned_rows 492 |
| list_commits | 0.84 | 1.74 · 0.84 · 0.728 · 1.155 · 0.807 | 2.37–2.37 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.794 | 3.633 · 3.402 · 2.677 · 2.794 · 2.548 | 2.37–2.37 | statements 66, vm_steps 2218, fullscan_steps 0, sorts 0, returned_rows 238 |
| fork | 0.93 | 1.272 · 0.544 · 1.706 · 0.669 · 0.93 | 2.37–2.37 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 33.523 | 35.195 · 33.523 · 32.611 · 41.887 · 29.735 | 2.37–2.37 | statements 537, vm_steps 23611, fullscan_steps 0, sorts 0, returned_rows 1734 |
| oneshot_mount_unmount | 17.679 | 22.557 · 17.679 · 18.403 · 17.147 · 15.947 | 2.37–2.37 | statements 70, vm_steps 2417, fullscan_steps 82, sorts 2, returned_rows 234 |
| oneshot_commit | 79.255 | 94.967 · 82.476 · 76.981 · 79.255 · 68.11 | 2.37–2.37 | statements 203, vm_steps 12708, fullscan_steps 82, sorts 2, returned_rows 942 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.37–2.37 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r056: 418,300 pages of 4,096 B, 0 free · Commits 67,677 · Branches 1,437 · Layers 68 · compression 3.75× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 217,187 | 1.34 GiB |
| 2 | 75,691 | 1.16 GiB |
| 3 | 18,180 | 7.5 MiB |
| 4 | 52 | 10.3 KiB |
| 5 | 18,061 | 1.8 MiB |
| 6 | 188,262 | 905.4 MiB |
| 7 | 532,431 | 130.3 MiB |
| 8 | 1,639 | 477.7 KiB |
| 9 | 145,476 | 321.7 MiB |
| 10 | 72,665 | 8.9 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,522 | 206.6 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 69,696 | 148.7 MiB |
| 1 | 73,807 | 901.8 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 281,265 | 1.07 GiB | 39.6 MiB |
| inode_value | 82,389 | 321.8 MiB | 6.2 MiB |
| binding_hint | 25,121 | 98.1 MiB | 9.2 MiB |
| object_location | 17,444 | 68.1 MiB | 7.1 MiB |
| commit | 5,649 | 22.1 MiB | 3.5 MiB |
| file_digest | 1,675 | 6.5 MiB | 761.5 KiB |
| commit_lineage | 1,469 | 5.7 MiB | 718.2 KiB |
| commit_runs | 1,419 | 5.5 MiB | 727.0 KiB |
| commit_identity | 1,040 | 4.1 MiB | 446.7 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 63 | 252.0 KiB | 41.7 KiB |
| branch_names | 24 | 96.0 KiB | 19.3 KiB |
| branch_identity | 16 | 64.0 KiB | 7.7 KiB |
| run_merges | 9 | 36.0 KiB | 11.1 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 4.0 KiB |
| layers_source | 3 | 12.0 KiB | 6.1 KiB |
| layers_child | 3 | 12.0 KiB | 6.1 KiB |
| absorbed_heights | 3 | 12.0 KiB | 4.1 KiB |

### E. Stage times

**Time 363.5 s** (tooling): play 127.4 · consolidate 142.6 · verify 31.1 · probes 32.3 · tests 0.0 · seal + snapshot 13.5 · report 16.6

363.48 s tooling: prepare 1.63 · play 125.82 · consolidate 142.57 · verify 18.26 (diff_commits + full compareTree) · version walk 12.82 · probes 32.28 · metrics 0.82 · seal 1.43 · sealed figures 6.44 · snapshot copy 5.65 · report 0.54

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 32eda22d657d10ba2b419652882f2be41fd2b99cbf38e3eeb32d39a19dc16d88 | 2026-10-20T10:14:18.208Z | optimize | Speed: fs.grep 17–64 files · uncontended: 3.72× baseline (sdk.lines); not judged: fs.apply ≤64 KiB · uncontended: 3/20/20 calls (1.74×), fs.write >512 KiB · uncontended: 2/7/12 calls (1.6×), sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (1.46×) (baseline class under 5 calls per range); Scaling: branch.diff_commits checkpoint ms in total (entries exponent -0.066): tree files exponent 1.515; Counters: oneshot_mount_unmount.statements: depth exponent 2.346; Contended work: not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (17 classes too narrow); SQL per call (sql.call); Directory share: 0.514; Snapshot time: 5592 ms for 1403.0 MiB new; size exponent 0.16 |

### G. Evidence

- `~/lfs-history/metrics/range-056.a1.json`
- trace `~/lfs-history/runs/p3-main-x/trace/range-056.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-x/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-056.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r056-1-root | 332 | 625.1 KiB |
| r056-4-packages-client | 629 | 627.3 KiB |
| r056-3-examples-acp-agent | 464 | 628.4 KiB |
| r056-2-agents-notes | 579 | 633.0 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 454.0 | 5,056 |
| `git diff --stat` | 49.0 | 5,050 |
| `git add -f` | 51.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 56.0 | 5,053 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r056-2-agents-notes | end | P1 | pass | — | — |
| r056-2-agents-notes | end | P2 | pass | exit 0 | — |
| r056-2-agents-notes | end | P3 | pass | 295 bookkeeping path(s) | — |
| r056-2-agents-notes | end | P4 | pass | 100 emitted files, exit 1 | — |
| r056-2-agents-notes | end | P5 | pass | 30 files | — |
| r056-2-agents-notes | end | P6 | n/a | not a repair | — |
| r056-3-examples-acp-agent | end | P1 | pass | — | — |
| r056-3-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r056-3-examples-acp-agent | end | P3 | pass | 295 bookkeeping path(s) | — |
| r056-3-examples-acp-agent | end | P4 | pass | 53 emitted files, exit 2 | — |
| r056-3-examples-acp-agent | end | P5 | pass | 10 files | — |
| r056-3-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r056-4-packages-client | end | P1 | pass | — | — |
| r056-4-packages-client | end | P2 | pass | exit 0 | — |
| r056-4-packages-client | end | P3 | pass | 295 bookkeeping path(s) | — |
| r056-4-packages-client | end | P4 | pass | 343 emitted files, exit 2 | — |
| r056-4-packages-client | end | P5 | n/a | no calibrated file | — |
| r056-4-packages-client | end | P6 | n/a | not a repair | — |
| r056-1-root | end | P1 | pass | — | — |
| r056-1-root | end | P2 | pass | exit 0 | — |
| r056-1-root | end | P3 | n/a | an install, not a refresh | — |
| r056-1-root | end | P4 | pass | 148 emitted files, exit 2 | — |
| r056-1-root | end | P5 | pass | 31 files | — |
| r056-1-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2327 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
