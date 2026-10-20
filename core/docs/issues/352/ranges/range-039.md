# Range 039 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r038 (live Store)
dsh `30db52fa4`..`8cb908b9e` · **71 commits** (11 mainline, 60 side) · 2026-07-26 → 2026-07-27
Areas changed: `.agents/notes` 10% · `/` 8% · `packages/client` 7% · other 76%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 21 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.22×** · **Churn 0.00**
**Time split:** play 95.7 s · git 138.0 s · Node 243.5 s · verify 8.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **766.0 MiB** (+16.6 MiB) | **1.06 GiB** (+40.1 MiB) live | **1.42×** (prev 1.40×) | **41.4 MiB** | **1,437** (total 46,731) | **255.4 s** tooling (total 120.7 min) |

**Checks:** 16 pass · 2 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.58× it; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ probe diff_files +52% · ▲ fs.write p95 +48% · ▲ stored added +45%
**Budget:** 40 of 202 ranges · projected total 15.6 h (budget 16.8 h) · disk 37% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **932 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 4 lanes merged, 2 publishes |
| Steps | 2,838 / 2,838 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2762 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 394 bin shims, 4243 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (49 lines from 3 .gitignore files) · **157 picks** in 4 merges (157 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `8cb908b9e`** · 165 commits written for 165 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 56 untracked, unignored (410,217 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 157 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r039-4-root | end | `b4b3fff7d9a3` | `0f65eb9e1a17` | pass (397 normalized) | pass | n/a | pass | n/a | n/a |
| r039-1-agents-notes | end | `9ddd311a077b` | `2fe3e59c36d4` | pass (396 normalized) | pass | pass | pass | pass | n/a |
| r039-3-apps-web | end | `059efdbbd6d1` | `2fe3e59c36d4` | pass (396 normalized) | pass | pass | pass | pass | n/a |
| r039-2-packages-client | end | `0239a1bd0382` | `2fe3e59c36d4` | pass (396 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `cba503402a73` | `null` | n/a | pass | n/a | n/a | pass | pass (125,677 rewritten) |

P5 skip list (failing natively, set at calibration): `apps/cli/tests/args.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-layout/tests/theme-presenter.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/appearance-row.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/apply.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/settings-store.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/apply.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/rows.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/tree.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/workspace-browser.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-picker.spec.tsx` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/bootstrap.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/output-json.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/runtime.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/source-worker.compat.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/worker-json.spec.ts` (fails natively) · `packages/code-runtime/code-runtime/tests/service.spec.ts` (fails natively) · `packages/context/session-reference/tests/session-reference.spec.ts` (fails natively) · `packages/context/time-context/tests/invariant.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/agent-loop/tests/inbox-invariant.spec.ts` (fails natively) · `packages/core/agent-loop/tests/inbox.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/invariant.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/properties.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-log.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-recovery.spec.ts` (fails natively) · `packages/core/agent-loop/tests/resume.spec.ts` (fails natively) · `packages/core/agent-loop/tests/scope-lifecycle.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/core/agent/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent/tests/agent.spec.ts` (fails natively) · `packages/core/agent/tests/gen-cordis-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/invariant.spec.ts` (fails natively) · `packages/core/agent/tests/llm-target.spec.ts` (fails natively) · `packages/core/agent/tests/verify-export-jsdoc.spec.ts` (fails natively) · `packages/core/scope/tests/invariant.spec.ts` (fails natively) · `packages/core/scope/tests/scope.spec.ts` (fails natively) · `packages/core/scope/tests/store.spec.ts` (fails natively) · `packages/core/session/tests/chunk-rows.spec.ts` (fails natively) · `packages/core/session/tests/derived-cache.spec.ts` (fails natively) · `packages/core/session/tests/fork.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/session/tests/invariant.spec.ts` (fails natively) · `packages/core/session/tests/json.spec.ts` (fails natively) · `packages/core/session/tests/out-of-band.spec.ts` (fails natively) · `packages/core/session/tests/properties.spec.ts` (fails natively) · `packages/core/session/tests/repair.spec.ts` (fails natively) · `packages/core/session/tests/request-header.spec.ts` (fails natively) · `packages/core/session/tests/scoped.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/core/system-prompt/tests/invariant.spec.ts` (fails natively) · `packages/core/system-prompt/tests/scoped.spec.ts` (fails natively) · `packages/core/system-prompt/tests/system-prompt.spec.ts` (fails natively) · `packages/core/system-prompt/tests/tool-order.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-signal-types.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/invariant.spec.ts` (fails natively) · `packages/core/tools/tests/json-schema.spec.ts` (fails natively) · `packages/core/tools/tests/properties.spec.ts` (fails natively) · `packages/core/tools/tests/schema.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/tools/tests/tools.spec.ts` (fails natively) · `packages/core/tools/tests/ts-types.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/examples/tui-demo/tests/tui-agent.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/apply.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/load-path.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/session-query/session-query-sqlite/tests/query.spec.ts` (fails natively) · `packages/session-query/session-query-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-query/session-query/tests/search-helpers.spec.ts` (fails natively) · `packages/session-query/session-query/tests/session-query.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/session-query/tool-session-query/tests/sqlite-integration.spec.ts` (fails natively) · `packages/session-query/tool-session-query/tests/tool-session-query.spec.ts` (fails natively) · `packages/session-title/session-title-all-messages-llm/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title-first-message-llm/tests/loader-composition.spec.ts` (fails natively) · `packages/session-title/session-title-first-message-llm/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title-llm/tests/llm.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/normalize.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/support/agent-loop-testkit/tests/agent-loop-testkit.spec.ts` (fails natively) · `packages/support/invariants/tests/service.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/cli.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/invariant.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/server.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/example-launch.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/loader-smoke.spec.ts` (fails natively) · `packages/web/tool-web/tests/integration.spec.ts` (fails natively) · `packages/web/tool-web/tests/load-path.spec.ts` (fails natively) · `packages/web/tool-web/tests/spill.spec.ts` (fails natively) · `packages/web/tool-web/tests/tool-web.spec.ts` (fails natively) · `packages/web/web-fetch-local/tests/fetch-local.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/deepseek.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/redirect.spec.ts` (fails natively) · `packages/web/web-search-exa/tests/exa.spec.ts` (fails natively) · `packages/web/web-search-perplexity/tests/perplexity.spec.ts` (fails natively) · `packages/web/web/tests/web.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/tools.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/code-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-question/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/appearance-row.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/apply.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/apply.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/rows.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-browser.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-picker.spec.tsx` (fails natively) · `packages/storage/storage-json/tests/json-backend.spec.ts` (fails natively) · `packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/spill/spill-policy/tests/spill-policy.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively).

## 2. Activity

**3,632 calls** · **218 steps** by **9 agents + lead** on **4 Branches + main** · **279 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +538 added · 785 modified · −18 deleted · 15.6 MiB written · fs 1,219 : Sandbox 122 (**10 : 1**, reported only in P3)
**Execs:** 782 (JS 68 · shell 714) · 3 non-zero exits · install 0 · test runs 4 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,582 | 1,232 | 350 | Committed 1,227 · Text 34 · NoSuchPath 21 · Equal 1 · UpToDate 5 |
| sandbox | 1,623 | 1,060 | 5 | commit 278 (Committed 224, UpToDate 53, Conflict 1) · exec 782 (exit:0 779, exit:2 3) · mount 279 (Mounted 279) · status 5 · unmount 279 (Unmounted 279) |
| branch | 416 | 34 | 382 | diff_branches 16 · diff_commits 366 · fork 23 (Forked 23) · merge 9 (Merged 9) · publish 2 (Added 2) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,632** | **2,326** | **748** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r039-1-agents-notes | a01 a02 a03 | 66 | 342 | ✓ | ✓ |
| r039-2-packages-client | a04 a05 | 42 | 318 | ✓ | — |
| r039-3-apps-web | a06 a07 | 55 | 335 | ✓ | — |
| r039-4-root | a08 a09 | 47 | 337 | ✓ | — |
| main | lead | 8 | 105 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r039-3, a06 after a07 | 0.1 s |
| Stale clean merge | 1 / 1 | r039-3, a06 a07 | merged cleanly |
| Decoy edit | 1 / 1 | r039-3, a07 a06 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r039-2 vs r039-1 publish | 3.7 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r039-1 | 18 | 9 | 9 | 0 | 0 | 215 | — |
| a02 | r039-1 | 30 | 15 | 15 | 0 | 0 | 70 | — |
| a03 | r039-1 | 18 | 9 | 9 | 0 | 0 | 57 | — |
| a04 | r039-2 | 28 | 15 | 13 | 0 | 0 | 269 | — |
| a05 | r039-2 | 14 | 7 | 7 | 0 | 0 | 49 | — |
| a06 | r039-3 | 24 | 10 | 14 | 0 | 0 | 226 | commit-conflict, stale-clean-merge, decoy |
| a07 | r039-3 | 31 | 13 | 18 | 0 | 0 | 109 | commit-conflict, stale-clean-merge, decoy |
| a08 | r039-4 | 20 | 12 | 8 | 0 | 0 | 219 | — |
| a09 | r039-4 | 27 | 12 | 15 | 0 | 0 | 118 | — |
| lead | main | 8 | 1 | 0 | 7 | 0 | 105 | merge-race |
| **Total** |  | **218** | **103** | **108** | **7** | **0** | **1,437** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 161 · pnpm 1 · tsc 4 · vitest 4 · other 612

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r039-2-packages-client | 31 | 31 | 31 | 1 | 31 | 626 |
| r039-1-agents-notes | 45 | 45 | 45 | 0 | 45 | 613 |
| r039-4-root | 39 | 39 | 39 | 3 | 39 | 586 |
| r039-3-apps-web | 38 | 38 | 38 | 0 | 38 | 601 |
| **lead** | — | — | — | — | 165 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r039-4-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r039-1-agents-notes | 0 | 1 | 1 | 1 | 39 | 39 / 39 |
| r039-3-apps-web | 0 | 1 | 1 | 1 | 71 | 71 / 71 |
| r039-2-packages-client | 0 | 1 | 1 | 1 | 131 | 131 / 131 |
| **lead repair** | 1 | — | 1 | — | — | 125,677 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r038) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 749.4 MiB (21.2 MiB / 625.7 MiB / 20.3 MiB / 82.2 MiB) | 766.0 MiB (22.9 MiB / 637.7 MiB / 20.4 MiB / 85.0 MiB) | +16.6 MiB |
| Version figures from | — | incremental (67,765 changed paths) | — |
| Files / directories / symlinks | 55,520 / 9,110 / 4,203 | 57,944 / 9,190 / 4,251 | +2,424 / +80 / +48 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 1.02 GiB | 1.06 GiB | +40.1 MiB |
| **Space amplification** (total · tracked) | 1.40× · tracked 5.13× | 1.42× · tracked 4.89× | 0.02 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **6.42** (0.74 / 0.14 / 0.65) | 1.01× the median range |
| **Stored per Commit** | 26.9 KiB | 28.6 KiB | — |
| Metadata share | 0.41 | 0.41 | this range 0.44 |
| History: Commits / Layers / Branches | 45,294 | 46,731 / 24 / 477 | +1,437 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.50 GiB (Commits 8.48 GiB · installs 882.6 MiB · build 104.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 41.77 GiB / 37% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 641.7 MiB | 0.84 | +19.4 MiB |
| Metadata | 95.4 MiB | 0.12 | +3.7 MiB |
| Index rows + waste + other (live, not split) | 350.4 MiB | 0.46 | — |
| **Total = Store on disk** | **1.06 GiB** | **= 1.42** space amplification | +40.1 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 22.9 MiB | 112.1 MiB (62.2 MiB + 49.9 MiB) | 4.89× | — | 3.1 MiB | 6.5 MiB | 0.48 |
| `node_modules` | 637.7 MiB | 204.2 MiB (182.9 MiB + 21.3 MiB) | 0.32× | — | 2.9 MiB | 12.1 MiB | 0.24 |
| Build output | 20.4 MiB | 18.0 MiB (16.7 MiB + 1.3 MiB) | 0.88× | — | 591.0 KiB | 7.6 MiB | 0.08 |
| `.git` | 85.0 MiB | 373.8 MiB (358.6 MiB + 15.2 MiB) | 4.40× | — | 16.5 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 350.4 MiB | — (not divided) | — | 17.0 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 29.0 MiB | — | — | — | — | — |
| **Total** | — | **1.06 GiB** | **= 1.42×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +5,560 | — | 0 (derived) | 42% |
| Chunks (large files) | — (at snapshots) | +1,189 | — | — | 4% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 6,046 (with inodes, pooled) | — | — | 63% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,305 | — | — | — |

Delta: 3.0% at depth cap · 20% of refused bases stopped by budget · `node_modules` reinstall: 0.068× the raw bytes of 26 changed packages (ratio: 850781 new stored for 12586331 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.89× (112.1 MiB for 22.9 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.6 KiB / 6.8 KiB / 8.7 KiB over 318 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.22× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (3.5 MiB stored for 2.45 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.35 (4 lanes × 766.0 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.6 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 11.7 ms / 29.9 ms (1.09×) | 2.8 ms / 5.6 ms (1.16×) | 3.2 ms / 7.7 ms (1.32×) | 20.8 ms / 59.7 ms (1.13×) | 10.5 ms / 20.7 ms (0.89×) | 272 ms / 416 ms (4.53×) | — (native comparison in P3; exec 36.3 ms / 824 ms) |
| SQL p50: 260 stmts | 65 stmts | 80 stmts | 235 stmts | 54 stmts | 8,993 stmts | — |

**Commit cost:** 8.56 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 675 ms p50 over 279
**Slowest:** sandbox.exec 32896 ms · sandbox.exec 28172 ms · sandbox.exec 27165 ms · checkpoint diff_commits 0.09 ms and 1.53 statements per entry (67,686 entries per page)
**Scaling:** 14 of 15 probes flat · `glob_tree` 0.41

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 339 ms / 339 ms | — / — | — | git / status-cold: — |
| git status (steady) | 359 ms / 555 ms | — / — | — | git / status-steady: — |
| git add | 31.0 ms / 75.0 ms | — / — | — | git / add: — |
| git commit (lane) | 39.0 ms / 58.0 ms | — / — | — | git / commit: — |
| lead writes main | 7029 ms / 7029 ms | — / — | — | — |
| repack | 2256 ms / 2256 ms | — / — | — | — |
| pnpm install (incremental) | 3477 ms / 3477 ms | 1744 ms / 1744 ms | 1.99× | pnpm-reinstall / cold: — |
| pnpm refresh | 2796 ms / 2796 ms | 1727 ms / 1727 ms | 1.62× | pnpm-reinstall / steady: — |
| tsc -b | 3435 ms / 5498 ms | 3408 ms / 4431 ms | 1.01× | tsc-b / cold: — |
| vitest | 14096 ms / 14096 ms | 7354 ms / 7354 ms | 1.92× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.7 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.3 ms / 25.2 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4136512 B · fs.write ≤8 KiB 4194304 → 4136512 B · fs.write ≤64 KiB 4194304 → 4136512 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2785152 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 70072 → 4136512 B
**Host load (1-min, recorded, not waited on):** macOS 6.82 at the first command → 6.55 after the last (max 9.32 over 7 commands) · Docker VM 1.28 → 1.68

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-039.a1)

## 5. Findings and action

### Finding 039.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | diff_files.statements (chain-bounded): max over the latest cap period 108 vs the first 96: 1.125× (bound, period 8) | < 0.05 |

Diagnosis pending: `finding-039.a1.json`.

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

- **a1 (`p3-main-v`, live after r38 a2; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 21 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass (1,843 emitted). Control `control-039.a1` passes. Report check F1–F8 PASS.
- **The only optimize row** is Counters `diff_files.statements` (chain-bounded): the latest metadata cap period's maximum is 108 statements against the first period's 96 (1.125×, bound period 8). This is the first range with a full cap period on this binary. Recorded, not acted on (fast mode).
- **P5 n/a at `r039-4-root.end`,** the hybrid lane tree case (as r34 and r37: "Failed to load tsconfig … Tsconfig not found" natively too). The merged checkpoint builds clean and its 30 tests pass natively and in LayerFS.
- **Fix 058 exempted nothing** in this range (`checks.tree.gitIgnored` is empty).
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 12.58×). Merge p50 272 ms, 4.53× the pilot baseline, inside r23–r38's band. One-shot Commit 1.13×, write 1.09×, mount 0.89×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 6.3–9.3.
- Final steps: lanes 19 s + 16 s + 70 s (cuts at plan orders 21 and 44), repair 109 s (alarm 200 s), verify 12 s, finish 37 s. Repair install 32.9 s, build 21.1 s, tests 3.3 s.
- Watch items: index rows + waste + other 350.4 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 12.66 ms per file over 15 calls, 254 statements and 19,238 VM steps per call (r38: 6.48 ms, 6,904; #367; process-wide counters, see fix 057).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2838/2838; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.58× it | ≤ 1.2× | watch |
| Scaling | stat (chain-bounded): max over the latest cap period 1.411 vs the first 1.411: 1× (bound, period 8) | < 0.15 | pass |
| Counters | diff_files.statements (chain-bounded): max over the latest cap period 108 vs the first 96: 1.125× (bound, period 8) | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.437 | < 0.5 | pass |
| Reinstall growth | 0.068× the raw bytes of 26 changed packages (ratio: 850781 new stored for 12586331 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.03 (budget 0.2046) | < 0.1 | pass |
| Range growth | 41.4 MiB, 1.27× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.37 | < 0.8 | pass |
| Wall projection | 0.93 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 165 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 21 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 157 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.22× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 218 | 218 |
| Lanes / agents | 4 / 9 | 4 / 9 |
| LayerFS Commits | 1437 | 1270 |
| Workspaces (one-shot share) | 279 (0.99) | 107 (0.981) |
| Reads | 300 | 300 |
| Reconcile writes | 97 | 97 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 366.45 | 366.45 | 366.45 | 366.45 | 4.75× | 4.75× | — | — | 12,261 / 382,068 / 0 | — | 1.5269 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 15 | 17.44 | 417.83 | 417.83 | 441.81 | 1.07× | 8.07× | -1.18 | -1.06 | 267 / 26,426 / 0 | — | 0.0727 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 361 | 18.58 | 34.47 | 89.45 | 321.51 | 1.08× | 1.33× | -0.41 | -0.35 | 302 / 33,633 / 0 | — | 0.1022 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.73 | 1.42 | 1.42 | 1.48 | 0.81× | 1.08× | -1.74 | -1.48 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.93 | 0.93 | 0.93 | 0.95 | no baseline | no baseline | -0.39 | -0.36 | 70 / 1,298 / 0 | — | 0.0467 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 416.49 | 416.49 | 416.49 | 487.95 | 4.53× | 4.53× | -2.05 | -0.95 | 10,201 / 600,321 / 0 | — | 1.8187 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 0.97 | 0.97 | 0.97 | 0.97 | 0.63× | 0.63× | -0.94 | -0.89 | 35 / 517 / 0 | — | 0.0038 ms per entrie | — |
| branch.publish | — · uncontended | 2 | 2.95 | 2.95 | 2.95 | 4.68 | 0.58× | 0.58× | -4.73 | -4.32 | 60 / 1,239 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 31.71 | 31.71 | 31.71 | 31.71 | 1.30× | 1.30× | -0.10 | 0.13 | 172 / 10,956 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 2 | 13.74 | 13.74 | 13.74 | 19.21 | 1.16× | 1.02× | -3.31 | -1.87 | 385 / 23,332 / 0 | — | 0.0243 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 2 | 9.09 | 9.09 | 9.09 | 9.43 | 1.48× | 1.22× | -0.58 | -0.38 | 177 / 8,791 / 0 | — | 0.0126 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 2 | 11.16 | 11.16 | 11.16 | 15.45 | 1.21× | 0.72× | -9.38 | -7.04 | 177 / 9,279 / 0 | — | 0.0002 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 6 | 8.99 | 16.67 | 16.67 | 17.09 | 1.30× | 1.72× | 1.64 | 1.09 | 142 / 7,135 / 0 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 1 | 11.34 | 11.34 | 11.34 | 11.34 | 1.13× | 0.66× | -1.35 | -0.94 | 121 / 6,501 / 0 | — | 0.0086 ms per byte | files.change |
| fs.apply | ≤8 KiB · uncontended | 3 | 10.75 | 10.75 | 10.75 | 12.13 | 1.65× | 0.99× | -1.08 | -0.57 | 158 / 8,294 / 0 | — | 0.0084 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 12 | 9.27 | 14.24 | 14.24 | 16.12 | 1.29× | 1.66× | -0.26 | -0.26 | 212 / 11,815 / 0 | — | 0.0374 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 16 | 6.65 | 13.52 | 13.52 | 14.71 | 1.14× | 1.68× | -0.99 | -0.91 | 164 / 8,588 / 0 | — | 0.0243 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 7 | 10.52 | 15.39 | 15.39 | 22.40 | 1.94× | 2.55× | -0.44 | -0.28 | 359 / 18,253 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 8 | 8.28 | 10.10 | 10.10 | 11.75 | 1.33× | 1.09× | -2.30 | -1.61 | 202 / 10,005 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 4 | 11.50 | 11.66 | 11.66 | 11.67 | 1.91× | 1.80× | -0.10 | 0.34 | 270 / 15,030 / 0 | — | 0.002 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 6.43 | 6.70 | 6.70 | 11.43 | 0.87× | 0.84× | -1.37 | -1.12 | 174 / 9,201 / 0 | — | 0.0015 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 2.01 | 2.01 | 2.01 | 2.72 | 1.48× | 1.37× | — | — | 44 / 3,092 / 0 | — | 2.008 ms per file | — |
| fs.glob | 17–64 files · contended | 6 | 6.64 | 7.56 | 7.56 | 10.93 | 2.39× | 2.72× | 0.60 | 0.41 | 173 / 11,497 / 0 | — | 0.1704 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 3.46 | 4.75 | 4.75 | 9.76 | 1.22× | 1.25× | -1.17 | -1.09 | 67 / 5,727 / 0 | — | 0.077 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.19 | 2.19 | 2.19 | 3.18 | 1.20× | 1.20× | 0.80 | 0.26 | 44 / 3,753 / 0 | — | 0.796 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 1.88 | 2.49 | 2.49 | 3.28 | 1.07× | 1.28× | 0.32 | 0.06 | 44 / 3,411 / 0 | — | 0.7625 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 2.98 | 3.15 | 3.15 | 5.51 | 1.77× | 1.88× | -0.70 | -0.76 | 90 / 5,107 / 0 | — | 0.3673 ms per file | — |
| fs.glob | 5–16 files · uncontended | 8 | 3.25 | 4.86 | 4.86 | 5.18 | 1.61× | 2.13× | 0.91 | 0.77 | 57 / 5,087 / 0 | — | 0.4639 ms per file | — |
| fs.glob | >64 files · contended | 8 | 6.19 | 8.99 | 8.99 | 18.22 | 1.14× | 1.66× | -0.43 | -0.58 | 138 / 15,093 / 0 | — | 0.0387 ms per file | — |
| fs.glob | >64 files · uncontended | 11 | 4.81 | 41.05 | 41.05 | 41.18 | 0.49× | 2.92× | -1.09 | -1.38 | 77 / 5,652 / 0 | — | 0.0223 ms per file | — |
| fs.grep | 1 files · contended | 2 | 4.43 | 4.43 | 4.43 | 11.96 | 2.96× | 2.96× | — | — | 62 / 3,680 / 0 | — | 4.427 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 1 | 2.02 | 2.02 | 2.02 | 2.02 | 0.85× | 0.85× | -0.69 | -0.29 | 35 / 1,911 / 0 | — | 2.024 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 4 | 8.15 | 10.42 | 10.42 | 10.43 | 1.36× | 1.74× | -2.17 | -1.68 | 245 / 12,520 / 0 | — | 0.2672 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 8.00 | 9.48 | 9.48 | 10.67 | 1.39× | 1.58× | 0.95 | 0.40 | 217 / 7,717 / 0 | — | 0.2106 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 3.45 | 3.45 | 3.45 | 6.47 | 0.88× | 0.86× | -0.07 | -0.09 | 78 / 4,225 / 0 | — | 1.1487 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 4 | 2.23 | 3.41 | 3.41 | 7.88 | 0.96× | 1.07× | -0.25 | -0.53 | 49 / 3,227 / 0 | — | 1.113 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 11 | 4.58 | 10.93 | 10.93 | 11.98 | 1.54× | 2.17× | 0.68 | 0.32 | 190 / 10,694 / 0 | — | 0.7287 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 5.91 | 8.19 | 8.19 | 11.83 | 1.58× | 1.36× | 0.42 | 0.52 | 103 / 6,320 / 0 | — | 0.5913 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 8 | 24.25 | 38.33 | 38.33 | 43.03 | 1.54× | 2.44× | 1.25 | 1.04 | 468 / 32,621 / 0 | — | 0.1331 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 9 | 19.95 | 26.83 | 26.83 | 36.28 | 1.09× | 1.16× | 1.05 | 0.69 | 478 / 24,456 / 0 | — | 0.0995 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 2.37 | 2.37 | 2.37 | 2.37 | 1.62× | 1.62× | — | — | 92 / 5,690 / 0 | — | 2.365 ms per entrie | — |
| fs.list | 17–64 entries · contended | 10 | 5.58 | 8.79 | 8.79 | 22.50 | 2.32× | 3.66× | -0.14 | 0.05 | 124 / 15,555 / 0 | — | 0.1161 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 13 | 3.31 | 7.61 | 7.61 | 8.23 | 1.32× | 2.59× | -0.71 | -0.75 | 65 / 5,175 / 0 | — | 0.0735 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 1.55 | 1.55 | 1.55 | 2.93 | 0.67× | 0.67× | -1.56 | -1.63 | 35 / 2,839 / 0 | — | 0.777 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 3 | 1.90 | 1.90 | 1.90 | 3.10 | 1.01× | 0.93× | 0.25 | -0.17 | 46 / 3,186 / 0 | — | 0.9485 ms per entrie | — |
| fs.list | 5–16 entries · contended | 9 | 3.28 | 4.70 | 4.70 | 5.63 | 1.41× | 1.66× | -0.58 | -0.21 | 96 / 6,424 / 0 | — | 0.4404 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 10 | 3.11 | 5.27 | 5.27 | 7.17 | 1.64× | 1.38× | 0.42 | 0.35 | 57 / 5,234 / 0 | — | 0.3479 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 6 | 2.98 | 4.58 | 4.58 | 4.60 | 1.34× | 2.06× | -0.81 | -0.56 | 79 / 5,686 / 0 | — | 0.0037 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 6 | 2.93 | 5.16 | 5.16 | 14.10 | 1.85× | 3.26× | 0.16 | 0.06 | 68 / 3,974 / 0 | — | 0.0036 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 3 | 2.81 | 2.81 | 2.81 | 5.64 | no baseline | no baseline | 0.10 | 0.03 | 91 / 6,893 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.27 | 2.27 | 2.27 | 7.55 | 0.81× | 0.81× | -2.22 | -1.49 | 59 / 3,271 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 9 | 2.93 | 5.02 | 5.02 | 8.47 | 1.39× | 0.85× | -1.32 | -0.97 | 88 / 4,500 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 19 | 2.39 | 4.07 | 4.07 | 4.85 | 1.16× | 1.14× | -0.50 | -0.42 | 56 / 3,326 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 3 | 10.37 | 10.37 | 10.37 | 15.64 | 0.99× | 0.73× | 0.85 | 0.38 | 138 / 7,092 / 0 | — | 10.374 ms per file | commit |
| fs.rm | 1 files · uncontended | 15 | 12.66 | 25.78 | 25.78 | 34.52 | 1.89× | 2.30× | -0.67 | -0.10 | 254 / 19,238 / 0 | — | 12.662 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 5 | 3.79 | 4.58 | 4.58 | 6.05 | 1.74× | 2.05× | 1.01 | 0.72 | 108 / 7,117 / 0 | — | 0.0095 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 6 | 2.70 | 3.48 | 3.48 | 3.68 | 1.76× | 2.27× | 0.18 | 0.31 | 55 / 3,322 / 0 | — | 0.0063 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 3 | 3.02 | 3.02 | 3.02 | 3.69 | no baseline | no baseline | — | — | 50 / 2,793 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 2 | 2.53 | 2.53 | 2.53 | 2.60 | 1.20× | 1.20× | 0.60 | 0.34 | 37 / 2,571 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 6 | 3.19 | 3.58 | 3.58 | 4.60 | 1.22× | 1.04× | 0.51 | 0.51 | 86 / 5,353 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 6 | 1.93 | 2.50 | 2.50 | 3.87 | 0.98× | 1.16× | 0.70 | 0.22 | 43 / 3,084 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 7 | 2.91 | 3.25 | 3.25 | 6.75 | 1.29× | 1.08× | 0.82 | 0.69 | 67 / 3,550 / 0 | — | 0.001 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 12 | 2.00 | 2.88 | 2.88 | 4.13 | 1.20× | 0.83× | -0.31 | -0.33 | 44 / 2,952 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 220 | 17.95 | 37.94 | 79.97 | 168.09 | 2.11× | 2.54× | -0.89 | -0.31 | 393 / 41,202 / 0 | — | 0.0432 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 112 | 8.82 | 16.26 | 17.74 | 22.25 | 1.39× | 1.54× | -1.27 | -0.84 | 155 / 8,311 / 0 | — | 0.0205 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 21 | 17.12 | 66.14 | 66.14 | 156.56 | 1.06× | 4.11× | -0.58 | -0.33 | 329 / 19,282 / 0 | — | 0.0001 ms per byte | files.change |
| fs.write | ≤512 KiB · uncontended | 20 | 11.12 | 18.23 | 18.23 | 18.89 | 1.35× | 2.21× | -0.08 | -0.03 | 182 / 7,847 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 159 | 15.71 | 32.85 | 44.47 | 159.30 | 1.59× | 1.49× | -0.50 | -0.22 | 418 / 31,427 / 0 | — | 0.0009 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 115 | 8.44 | 18.29 | 20.96 | 23.35 | 1.17× | 1.34× | -0.57 | -0.37 | 158 / 7,734 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 320 | 14.13 | 29.57 | 45.11 | 82.29 | 1.44× | 1.32× | -0.80 | -0.48 | 349 / 25,567 / 0 | — | 0.0039 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 218 | 7.84 | 15.32 | 20.97 | 23.38 | 1.09× | 1.10× | -0.50 | -0.31 | 147 / 7,620 / 0 | — | 0.0023 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.70 | 0.70 | 0.70 | 0.70 | 0.93× | 0.93× | -1.36 | -1.06 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 64 | 26.95 | 47.89 | 59.74 | 96.12 | 1.28× | 1.37× | -0.51 | -0.57 | 380 / 28,955 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 90 | 23.50 | 38.25 | 80.59 | 266.27 | 1.13× | 1.10× | -0.30 | -0.30 | 264 / 24,026 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 23 | 4.26 | 9.31 | 14.06 | 15.10 | 1.11× | 1.15× | 0.81 | 0.63 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 29 | 3.29 | 6.06 | 6.46 | 8.88 | 0.82× | 1.19× | -0.27 | -0.23 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 12 | 12.82 | 32.16 | 32.16 | 48.08 | 1.33× | 1.66× | 0.14 | 0.02 | 164 / 7,388 / 0 | — | 12.819 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 11 | 8.24 | 9.73 | 9.73 | 14.69 | 0.99× | 0.80× | -0.63 | -0.60 | 113 / 4,332 / 0 | — | 8.241 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 247.92 | 247.92 | 247.92 | 247.92 | 6.50× | 6.50× | -3.53 | -2.29 | 16,029 / 478,928 / 0 | — | 247.917 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · uncontended | 1 | 5.06 | 5.06 | 5.06 | 5.06 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 5.061 ms per file | observe.after |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 31.71 | 31.71 | 31.71 | 31.71 | no baseline | no baseline | 1.32 | 0.93 | 602 / 20,649 / 0 | — | 1.7617 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 12 | 16.16 | 27.91 | 27.91 | 30.19 | 1.08× | 1.42× | 2.39 | 1.80 | 198 / 6,967 / 0 | — | 7.7635 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 11 | 10.28 | 15.81 | 15.81 | 23.09 | 0.96× | 0.93× | -0.29 | -0.29 | 141 / 6,819 / 0 | — | 5.141 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 18.60 | 18.60 | 18.60 | 33.99 | 1.13× | 1.13× | -1.28 | -1.05 | 303 / 13,386 / 0 | — | 2.6566 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 38.00 | 38.00 | 38.00 | 38.00 | 2.77× | 2.77× | 1.57 | 2.14 | 794 / 40,632 / 0 | — | 4.7499 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 133.36 | 133.36 | 133.36 | 145.60 | no baseline | no baseline | 0.38 | 0.50 | 881 / 47,960 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 81.26 | 867.92 | 867.92 | 12620.07 | 1.18× | 12.58× | -0.64 | -0.46 | 679 / 42,909 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 317 | 40.45 | 760.50 | 1099.67 | 2906.80 | 0.79× | 1.98× | -2.93 | -2.25 | — | 3758.70 | — | — |
| sandbox.exec | 0 files · uncontended | 161 | 29.71 | 62.47 | 880.49 | 6437.01 | 0.94× | 0.22× | -0.33 | -0.38 | — | 3812.30 | — | — |
| sandbox.exec | 1 files · contended | 51 | 36.08 | 55.79 | 59.66 | 67.33 | 0.98× | 0.66× | 0.06 | 0.03 | — | 4.70 | 36.078 ms per file | — |
| sandbox.exec | 1 files · uncontended | 33 | 34.49 | 53.73 | 58.92 | 64.39 | 1.03× | 0.79× | 0.06 | 0.06 | — | 5 | 34.489 ms per file | — |
| sandbox.exec | 17–64 files · contended | 12 | 35.46 | 83.46 | 83.46 | 91.12 | 0.51× | 1.19× | -1.37 | -1.39 | — | 26.50 | 1.9699 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 1 | 53.68 | 53.68 | 53.68 | 53.68 | 0.77× | 0.77× | -0.67 | -0.64 | — | 76 | 3.1574 ms per file | — |
| sandbox.exec | 2–4 files · contended | 67 | 39.64 | 63.35 | 69.11 | 71.71 | 1.02× | 0.91× | 0.12 | 0.12 | — | 9.70 | 15.8493 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 40 | 39.73 | 67.69 | 72.40 | 73.50 | 1.04× | 1.03× | -0.78 | -0.52 | — | 9.30 | 16.12 ms per file | — |
| sandbox.exec | 5–16 files · contended | 32 | 46.02 | 69.22 | 71.94 | 78.96 | 0.79× | 0.95× | 0.66 | 0.48 | — | 15.30 | 5.5663 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 11 | 58.40 | 74.32 | 74.32 | 77.25 | 0.82× | 0.71× | -0.19 | 0.11 | — | 14.70 | 6.423 ms per file | — |
| sandbox.exec | — · contended | 18 | 2892.39 | 26900.46 | 26900.46 | 28171.61 | no baseline | no baseline | -2.36 | -2.15 | — | 48771.90 | — | — |
| sandbox.exec | — · uncontended | 29 | 192.28 | 21098.21 | 27164.61 | 32895.97 | 0.36× | 2.97× | -0.46 | -0.84 | — | 42149.60 | — | — |
| sandbox.mount | — · contended | 134 | 11.36 | 23.73 | 28.83 | 35.58 | 1.01× | 1.25× | 0.01 | -0.03 | 60 / 1,632 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 135 | 9.97 | 17.13 | 20.46 | 32.49 | 0.89× | 0.85× | -0.18 | -0.13 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 4.58 | 7.79 | 7.79 | 36.23 | no baseline | no baseline | 0.26 | 0.28 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 110 | 13.04 | 23.59 | 27.91 | 113.51 | 1.23× | 1.30× | 0.01 | 0.06 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 159 | 12.31 | 29.73 | 117.96 | 202.46 | 1.18× | 1.62× | 0.15 | 0.14 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 16 | 0.0 KiB | 848.3 KiB | 3,823 | ok 16 |
| branch.diff_commits | branch | 366 | 0.0 KiB | 20.1 MiB | 68,996 | ok 366 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 10 | 0.0 KiB | 94.6 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 29 | 1.1 MiB | 0.0 KiB | 40 | Committed 29 |
| fs.diff_files | fs | 56 | 0.0 KiB | 450.0 KiB | 35 | Text 34, NoSuchPath 21, Equal 1 |
| fs.glob | fs | 64 | 0.0 KiB | 69.4 KiB | 863 | ok 64 |
| fs.grep | fs | 64 | 0.0 KiB | 221.6 KiB | 950 | ok 64 |
| fs.list | fs | 60 | 0.0 KiB | 345.5 KiB | 2,315 | ok 60 |
| fs.read | fs | 51 | 0.0 KiB | 206.0 KiB | 51 | ok 51 |
| fs.rm | fs | 18 | 0.0 KiB | 0.0 KiB | 18 | Committed 18 |
| fs.stat | fs | 55 | 0.0 KiB | 12.2 KiB | 55 | ok 55 |
| fs.write | fs | 1,185 | 13.8 MiB | 0.0 KiB | 1,185 | Committed 1180, UpToDate 5 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 278 | 0.0 KiB | 0.0 KiB | 0 | Committed 224, UpToDate 53, Conflict 1 |
| sandbox.exec | sandbox | 782 | 3.5 MiB | 4.5 MiB | 0 | exit:0 779, exit:2 3 |
| sandbox.mount | sandbox | 279 | 0.0 KiB | 0.0 KiB | 0 | Mounted 279 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 279 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 279 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.28 · end 1.68.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.238 | 13.385 · 1.248 · 1.238 · 1.15 · 1.122 | 2.22–2.22 | statements 38, vm_steps 1226, fullscan_steps 0, sorts 0, returned_rows 98 |
| read | 1.177 | 1.268 · 1.116 · 1.101 · 1.177 · 1.303 | 2.22–2.22 | statements 21, vm_steps 860, fullscan_steps 0, sorts 0, returned_rows 81 |
| list_small | 1.192 | 1.356 · 1.192 · 1.104 · 1.308 · 1.062 | 2.22–2.22 | statements 21, vm_steps 869, fullscan_steps 0, sorts 0, returned_rows 81 |
| list_largest | 6.737 | 9.036 · 6.638 · 7.079 · 6.737 · 6.686 | 2.22–2.22 | statements 147, vm_steps 18191, fullscan_steps 0, sorts 0, returned_rows 2003 |
| grep_scoped | 1.244 | 1.522 · 1.305 · 1.244 · 1.127 · 1.196 | 2.22–2.22 | statements 26, vm_steps 1015, fullscan_steps 0, sorts 0, returned_rows 90 |
| glob_scoped | 1.128 | 1.115 · 1.042 · 1.128 · 1.25 · 1.161 | 2.22–2.22 | statements 20, vm_steps 848, fullscan_steps 0, sorts 0, returned_rows 80 |
| grep_tree | 4607.417 | 4657.672 · 4606.596 · 4595.756 · 4607.417 · 4626.234 | 1.8–2.12 | statements 54397, vm_steps 4134422, fullscan_steps 0, sorts 0, returned_rows 414264 |
| glob_tree | 8.413 | 10.519 · 8.707 · 8.413 · 8.269 · 7.999 | 1.8–1.8 | statements 173, vm_steps 20924, fullscan_steps 0, sorts 0, returned_rows 2186 |
| diff_files | 5.247 | 5.577 · 5.104 · 5.247 · 5.319 · 4.919 | 1.8–1.8 | statements 108, vm_steps 5044, fullscan_steps 0, sorts 0, returned_rows 486 |
| list_commits | 0.655 | 1.577 · 0.74 · 0.655 · 0.635 · 0.601 | 1.8–1.8 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.726 | 2.42 · 1.721 · 1.939 · 1.726 · 1.695 | 1.8–1.8 | statements 56, vm_steps 2104, fullscan_steps 0, sorts 0, returned_rows 240 |
| fork | 0.544 | 1.042 · 0.544 · 0.598 · 0.496 · 0.487 | 1.8–1.8 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 21.589 | 23.989 · 22.581 · 21.589 · 21.316 · 20.371 | 1.8–1.8 | statements 500, vm_steps 22859, fullscan_steps 0, sorts 0, returned_rows 1739 |
| oneshot_mount_unmount | 14.947 | 19.041 · 14.881 · 18.1 · 14.947 · 14.177 | 1.8–1.8 | statements 72, vm_steps 2446, fullscan_steps 82, sorts 2, returned_rows 234 |
| oneshot_commit | 68.657 | 70.694 · 69.51 · 64.261 · 62.35 · 68.657 | 1.8–1.8 | statements 185, vm_steps 12002, fullscan_steps 82, sorts 2, returned_rows 924 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.8–1.8 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 255.4 s** (tooling): play 97.2 · consolidate 105.3 · verify 16.3 · probes 24.0 · tests 0.0 · seal + snapshot 0.0 · report 12.6

255.41 s tooling: prepare 1.49 · play 95.67 · consolidate 105.29 · verify 8.69 (diff_commits) · version walk 7.63 · probes 24.05 · metrics 0.81 · Store allocation 0.28 · report 0.35

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T02:14:29.860Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.58× it; Counters: diff_files.statements (chain-bounded): max over the latest cap period 108 vs the first 96: 1.125× (bound, period 8); Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-039.a1.json`
- trace `~/lfs-history/runs/p3-main-v/trace/range-039.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-v/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r039-2-packages-client | 626 | 455.9 KiB |
| r039-1-agents-notes | 613 | 457.3 KiB |
| r039-4-root | 586 | 452.2 KiB |
| r039-3-apps-web | 601 | 455.1 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 359.0 | 3,646 |
| `git diff --stat` | 32.0 | 3,640 |
| `git add -f` | 31.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 39.0 | 3,647 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r039-4-root | end | P1 | pass | — | — |
| r039-4-root | end | P2 | pass | exit 0 | — |
| r039-4-root | end | P3 | n/a | an install, not a refresh | — |
| r039-4-root | end | P4 | pass | 548 emitted files, exit 2 | — |
| r039-4-root | end | P5 | n/a | no calibrated file | — |
| r039-4-root | end | P6 | n/a | not a repair | — |
| r039-1-agents-notes | end | P1 | pass | — | — |
| r039-1-agents-notes | end | P2 | pass | exit 0 | — |
| r039-1-agents-notes | end | P3 | pass | 256 bookkeeping path(s) | — |
| r039-1-agents-notes | end | P4 | pass | 206 emitted files, exit 0 | — |
| r039-1-agents-notes | end | P5 | pass | 39 files | — |
| r039-1-agents-notes | end | P6 | n/a | not a repair | — |
| r039-3-apps-web | end | P1 | pass | — | — |
| r039-3-apps-web | end | P2 | pass | exit 0 | — |
| r039-3-apps-web | end | P3 | pass | 256 bookkeeping path(s) | — |
| r039-3-apps-web | end | P4 | pass | 438 emitted files, exit 2 | — |
| r039-3-apps-web | end | P5 | pass | 71 files | — |
| r039-3-apps-web | end | P6 | n/a | not a repair | — |
| r039-2-packages-client | end | P1 | pass | — | — |
| r039-2-packages-client | end | P2 | pass | exit 0 | — |
| r039-2-packages-client | end | P3 | pass | 256 bookkeeping path(s) | — |
| r039-2-packages-client | end | P4 | pass | 679 emitted files, exit 2 | — |
| r039-2-packages-client | end | P5 | pass | 131 files | — |
| r039-2-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1843 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
