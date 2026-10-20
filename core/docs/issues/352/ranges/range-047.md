# Range 047 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r046 (live Store)
dsh `535816878`..`b6b13441a` · **85 commits** (12 mainline, 73 side) · 2026-07-28 → 2026-07-29
Areas changed: `packages/core` 13% · `packages/client` 7% · `/` 7% · other 74%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 21 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 113.4 s · git 184.4 s · Node 274.7 s · verify 11.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **808.5 MiB** (+6.1 MiB) | **1.33 GiB** (+47.0 MiB) live | **1.68×** (prev 1.64×) | **48.8 MiB** | **1,787** (total 56,578) | **324.2 s** tooling (total 158.0 min) |

**Checks:** 15 pass · 2 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 19.15× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.372) and statements per entry does not rise (0.054): the fixed and per-entry parts cannot be separated · 2 optimize/stop: Counters, Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +57% · ▲ fs.list p95 +49% · ▲ sandbox.mount p95 +43%
**Budget:** 48 of 202 ranges · projected total 15.6 h (budget 16.8 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **665 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 4 lanes merged, 1 publish |
| Steps | 3,537 / 3,537 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3013 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 419 bin shims, 4543 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (57 lines from 4 .gitignore files) · **234 picks** in 4 merges (234 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `b6b13441a`** · 139 commits written for 139 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 234 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r047-1-examples-acp-agent | end | `91f6b97edae8` | `8ed3917a3617` | pass (417 normalized) | pass | pass | pass | pass | n/a |
| r047-4-packages-core | end | `308fc00deb63` | `8ed3917a3617` | pass (417 normalized) | pass | pass | pass | n/a | n/a |
| r047-3-agents-notes | end | `eeca05547782` | `8ed3917a3617` | pass (417 normalized) | pass | pass | pass | pass | n/a |
| r047-2-root | end | `62a07e77e935` | `159f26aae420` | pass (418 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `2ad5d8b5a8ac` | `null` | n/a | pass | n/a | n/a | pass | pass (138,678 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/integration.spec.ts` (fails natively) · `packages/context/session-reference/tests/session-reference.spec.ts` (fails natively) · `packages/context/time-context/tests/invariant.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/skill/tool-skill/tests/tool-skill.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/plan-mode.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/workflow/tool-ralph/tests/integration.spec.ts` (fails natively) · `packages/acp/acp/tests/approval.spec.ts` (fails natively) · `packages/acp/acp/tests/bridge.spec.ts` (fails natively) · `packages/acp/acp/tests/codec.spec.ts` (fails natively) · `packages/acp/acp/tests/dispose.spec.ts` (fails natively) · `packages/acp/acp/tests/edges.spec.ts` (fails natively) · `packages/acp/acp/tests/multi-session.spec.ts` (fails natively) · `packages/acp/acp/tests/turns.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/http-bridge.spec.ts` (fails natively) · `packages/client/connection/tests/native-dialog-request.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/projection-store.spec.ts` (fails natively) · `packages/client/runtime/tests/queue-store.spec.ts` (fails natively) · `packages/client/runtime/tests/scope.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/runtime/tests/wire-events.spec.ts` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-command/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-command/tests/directory.spec.ts` (fails natively) · `packages/client/ui-command/tests/popup-view.spec.tsx` (fails natively) · `packages/client/ui-command/tests/popup.spec.ts` (fails natively) · `packages/client/ui-command/tests/service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-machine.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/queue-dock.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-layout/tests/theme-presenter.spec.ts` (fails natively) · `packages/client/ui-model/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-model/tests/model-select.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/code-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-question/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/node-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/ui-settings/tests/apply.spec.ts` (fails natively) · `packages/client/ui-settings/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-settings/tests/settings-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-snapshot.spec.tsx` (fails natively) · `packages/client/ui-slash/tests/apply.spec.ts` (fails natively) · `packages/client/ui-slash/tests/core-detect.spec.ts` (fails natively) · `packages/client/ui-slash/tests/core-menu.spec.ts` (fails natively) · `packages/client/ui-slash/tests/menu-view.spec.tsx` (fails natively) · `packages/client/ui-slash/tests/service.spec.ts` (fails natively) · `packages/client/ui-theme/tests/appearance-row.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/apply.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/scrollbar-styles.spec.ts` (fails natively) · `packages/client/ui-theme/tests/settings-store.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/apply.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/browser-styles.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/rows.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/tree.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/workspace-browser.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-picker.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/app-shell.spec.tsx` (fails natively) · `packages/client/web/tests/app.spec.tsx` (fails natively) · `packages/client/web/tests/base-styles.spec.ts` (fails natively) · `packages/client/web/tests/document-title.spec.tsx` (fails natively) · `packages/core/agent-loop/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/invariant.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/properties.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-error.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/resume.spec.ts` (fails natively) · `packages/core/agent-loop/tests/scope-lifecycle.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/agent/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent/tests/agent.spec.ts` (fails natively) · `packages/core/agent/tests/gen-cordis-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/invariant.spec.ts` (fails natively) · `packages/core/agent/tests/llm-target.spec.ts` (fails natively) · `packages/core/agent/tests/verify-export-jsdoc.spec.ts` (fails natively) · `packages/core/scope/tests/invariant.spec.ts` (fails natively) · `packages/core/scope/tests/scope.spec.ts` (fails natively) · `packages/core/scope/tests/store.spec.ts` (fails natively) · `packages/core/session/tests/chunk-rows.spec.ts` (fails natively) · `packages/core/session/tests/derived-cache.spec.ts` (fails natively) · `packages/core/session/tests/fork.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/session/tests/invariant.spec.ts` (fails natively) · `packages/core/session/tests/json.spec.ts` (fails natively) · `packages/core/session/tests/properties.spec.ts` (fails natively) · `packages/core/session/tests/repair.spec.ts` (fails natively) · `packages/core/session/tests/request-header.spec.ts` (fails natively) · `packages/core/session/tests/scoped.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-signal-types.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/invariant.spec.ts` (fails natively) · `packages/core/tools/tests/json-schema.spec.ts` (fails natively) · `packages/core/tools/tests/properties.spec.ts` (fails natively) · `packages/core/tools/tests/schema.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/tools/tests/tools.spec.ts` (fails natively) · `packages/core/tools/tests/ts-types.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/load-path.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/shell-quote.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/tools.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/diff.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/read-render.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-models.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-directory-picker.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-path-opener.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/serialize.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/sse.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/translate.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/convert.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/loader-composition.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/persistence.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/retry.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/transport-recovery.spec.ts` (fails natively) · `packages/llm/llm/tests/assembler.spec.ts` (fails natively) · `packages/llm/llm/tests/attribution.spec.ts` (fails natively) · `packages/llm/llm/tests/call-config.spec.ts` (fails natively) · `packages/llm/llm/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm/tests/message.spec.ts` (fails natively) · `packages/llm/llm/tests/properties.spec.ts` (fails natively) · `packages/llm/llm/tests/retry-policy.spec.ts` (fails natively) · `packages/llm/llm/tests/service.spec.ts` (fails natively) · `packages/llm/token-meter/tests/token-meter.spec.ts` (fails natively) · `packages/session-persistence/session-checkpoint-policy/tests/session-checkpoint-policy.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/win32.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title-all-messages-llm/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title-first-message-llm/tests/loader-composition.spec.ts` (fails natively) · `packages/session-title/session-title-first-message-llm/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title-llm/tests/llm.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/projection.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively) · `packages/spill/spill-policy/tests/spill-policy.spec.ts` (fails natively) · `packages/telemetry/session-telemetry/tests/redact.spec.ts` (fails natively) · `packages/telemetry/session-telemetry/tests/telemetry.spec.ts` (fails natively) · `packages/goal/goal-session/tests/invariant.spec.ts` (fails natively) · `packages/goal/goal/tests/invariant.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/goal/command-goal/tests/command-goal.spec.ts` (fails natively) · `packages/ui/user-approval/tests/approval.spec.ts` (fails natively) · `packages/goal/goal/tests/goal.spec.ts` (fails natively) · `packages/goal/tool-goal/tests/tool-goal.spec.ts` (fails natively) · `packages/goal/goal-session/tests/goal-session.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/sdk/sdk-client/tests/sdk-client.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/code-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/sse.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/translate.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/transport-recovery.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/connection.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/instance.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/session-query/session-query-sqlite/tests/query.spec.ts` (fails natively) · `packages/session-query/session-query-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-query/session-query/tests/search-helpers.spec.ts` (fails natively) · `packages/session-query/session-query/tests/session-query.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/session-query/tool-session-query/tests/sqlite-integration.spec.ts` (fails natively) · `packages/session-query/tool-session-query/tests/tool-session-query.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/projection.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/example-launch.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/loader-smoke.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/projection.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/ui/tui/tests/xml-tool-output.spec.ts` (fails natively) · `packages/web/tool-web/tests/integration.spec.ts` (fails natively) · `packages/web/tool-web/tests/load-path.spec.ts` (fails natively) · `packages/web/tool-web/tests/spill.spec.ts` (fails natively) · `packages/web/tool-web/tests/tool-web.spec.ts` (fails natively) · `packages/compact/compact/tests/compact.spec.ts` (fails natively) · `packages/compact/compact/tests/tool-pairing.spec.ts` (fails natively) · `packages/compact/compact-tool-result-prune/tests/tool-result-prune.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/inheritance.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/tasks/tool-tasks/tests/tool-tasks.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively).

## 2. Activity

**4,432 calls** · **265 steps** by **10 agents + lead** on **4 Branches + main** · **335 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +132 added · 1,493 modified · −55 deleted · 29.7 MiB written · fs 1,529 : Sandbox 151 (**10 : 1**, reported only in P3)
**Execs:** 924 (JS 90 · shell 834) · 4 non-zero exits · install 0 · test runs 4 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,028 | 1,542 | 486 | Committed 1,542 · NoSuchPath 12 · Text 64 |
| sandbox | 1,933 | 1,258 | 5 | commit 334 (Committed 259, UpToDate 74, Conflict 1) · exec 924 (exit:0 920, exit:2 4) · mount 335 (Mounted 335) · status 5 · unmount 335 (Unmounted 335) |
| branch | 460 | 33 | 427 | diff_branches 19 · diff_commits 408 · fork 23 (Forked 23) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,432** | **2,833** | **929** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r047-1-examples-acp-agent | a01 a02 a03 | 72 | 411 | ✓ | — |
| r047-2-root | a04 a05 | 53 | 399 | ✓ | — |
| r047-3-agents-notes | a06 a07 a08 | 76 | 409 | ✓ | — |
| r047-4-packages-core | a09 a10 | 57 | 396 | ✓ | — |
| main | lead | 7 | 172 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r047-1, a03 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r047-1, a01 a03 | merged cleanly |
| Decoy edit | 1 / 1 | r047-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r047-1 | 24 | 13 | 11 | 0 | 0 | 82 | commit-conflict, stale-clean-merge, decoy |
| a02 | r047-1 | 29 | 15 | 14 | 0 | 0 | 64 | decoy |
| a03 | r047-1 | 19 | 6 | 13 | 0 | 0 | 265 | commit-conflict, stale-clean-merge |
| a04 | r047-2 | 17 | 5 | 12 | 0 | 0 | 94 | — |
| a05 | r047-2 | 36 | 16 | 20 | 0 | 0 | 305 | — |
| a06 | r047-3 | 44 | 23 | 21 | 0 | 0 | 222 | — |
| a07 | r047-3 | 17 | 9 | 8 | 0 | 0 | 58 | — |
| a08 | r047-3 | 15 | 8 | 7 | 0 | 0 | 129 | — |
| a09 | r047-4 | 23 | 9 | 14 | 0 | 0 | 249 | — |
| a10 | r047-4 | 34 | 17 | 17 | 0 | 0 | 147 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 172 | — |
| **Total** |  | **265** | **122** | **137** | **6** | **0** | **1,787** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 188 · pnpm 1 · tsc 4 · vitest 4 · other 727

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r047-1-examples-acp-agent | 47 | 47 | 47 | 2 | 47 | 859 |
| r047-3-agents-notes | 52 | 52 | 52 | 0 | 52 | 870 |
| r047-2-root | 40 | 40 | 40 | 4 | 40 | 623 |
| r047-4-packages-core | 41 | 41 | 41 | 1 | 41 | 885 |
| **lead** | — | — | — | — | 139 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r047-1-examples-acp-agent | 0 | 1 | 1 | 1 | 12 | 12 / 12 |
| r047-4-packages-core | 0 | 1 | 1 | 0 | 0 | — / — |
| r047-3-agents-notes | 0 | 1 | 1 | 1 | 27 | 27 / 27 |
| r047-2-root | 1 | 0 | 1 | 1 | 103 | 103 / 103 |
| **lead repair** | 1 | — | 1 | — | — | 138,678 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r046) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 802.4 MiB (24.9 MiB / 656.0 MiB / 22.8 MiB / 98.6 MiB) | 808.5 MiB (25.4 MiB / 657.9 MiB / 23.4 MiB / 101.8 MiB) | +6.1 MiB |
| Version figures from | — | incremental (74,517 changed paths) | — |
| Files / directories / symlinks | 64,115 / 9,838 / 4,496 | 64,383 / 9,874 / 4,551 | +268 / +36 / +55 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 1.28 GiB | 1.33 GiB | +47.0 MiB |
| **Space amplification** (total · tracked) | 1.64× · tracked 4.95× | 1.68× · tracked 4.96× | 0.05 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.56** (1.27 / 0.21 / 0.96) | 0.76× the median range |
| **Stored per Commit** | 31.0 KiB | 26.9 KiB | — |
| Metadata share | 0.43 | 0.43 | this range 0.41 |
| History: Commits / Layers / Branches | 54,791 | 56,578 / 31 / 672 | +1,787 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.07 GiB (Commits 7.81 GiB · installs 865.4 MiB · build 98.8 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 40.03 GiB / 41% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 778.3 MiB | 0.96 | +24.4 MiB |
| Metadata | 121.1 MiB | 0.15 | +4.1 MiB |
| Index rows + waste + other (live, not split) | 459.8 MiB | 0.57 | — |
| **Total = Store on disk** | **1.33 GiB** | **= 1.68** space amplification | +47.0 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 25.4 MiB | 126.2 MiB (67.5 MiB + 58.7 MiB) | 4.96× | — | 2.8 MiB | 8.8 MiB | 0.32 |
| `node_modules` | 657.9 MiB | 215.2 MiB (187.2 MiB + 28.0 MiB) | 0.33× | — | 1.0 MiB | 2.0 MiB | 0.52 |
| Build output | 23.4 MiB | 25.0 MiB (23.1 MiB + 1.9 MiB) | 1.07× | — | 1.5 MiB | 8.5 MiB | 0.18 |
| `.git` | 101.8 MiB | 477.4 MiB (457.0 MiB + 20.4 MiB) | 4.69× | — | 23.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 459.8 MiB | — (not divided) | — | 18.5 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 55.6 MiB | — | — | — | — | — |
| **Total** | — | **1.33 GiB** | **= 1.68×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +7,155 | — | 0 (derived) | 54% |
| Chunks (large files) | — (at snapshots) | +1,574 | — | — | 13% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 6,834 (with inodes, pooled) | — | — | 65% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,589 | — | — | — |

Delta: 3.0% at depth cap · 22% of refused bases stopped by budget · `node_modules` reinstall: absolute: 925189 new stored bytes for 544 raw changed bytes of 18 changed packages (1700.715×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.96× (126.2 MiB for 25.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.8 KiB / 7.2 KiB / 10.3 KiB over 319 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.5 MiB stored for 2.57 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.42 (4 lanes × 808.5 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.3 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 10.5 ms / 45.6 ms (1.17×) | 2.8 ms / 6.3 ms (1.23×) | 3.2 ms / 10.5 ms (1.54×) | 22.4 ms / 79.9 ms (1.20×) | 10.2 ms / 18.9 ms (0.84×) | 433 ms / 541 ms (5.88×) | — (native comparison in P3; exec 37.2 ms / 934 ms) |
| SQL p50: 186 stmts | 62 stmts | 65 stmts | 224 stmts | 48 stmts | 10,990 stmts | — |

**Commit cost:** 7.51 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 756 ms p50 over 335
**Slowest:** sandbox.exec 41179 ms · sandbox.exec 32140 ms · sandbox.exec 29465 ms · checkpoint diff_commits 0.11 ms and 1.55 statements per entry (74,229 entries per page)
**Scaling:** 13 of 15 probes flat · `list_largest` 0.68 · `grep_tree` 0.31

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 385 ms / 385 ms | — / — | — | git / status-cold: — |
| git status (steady) | 431 ms / 649 ms | — / — | — | git / status-steady: — |
| git add | 37.0 ms / 80.0 ms | — / — | — | git / add: — |
| git commit (lane) | 43.0 ms / 77.0 ms | — / — | — | git / commit: — |
| lead writes main | 6774 ms / 6774 ms | — / — | — | — |
| repack | 3400 ms / 3400 ms | — / — | — | — |
| pnpm install (incremental) | 3353 ms / 3353 ms | 2076 ms / 2076 ms | 1.62× | pnpm-reinstall / cold: — |
| pnpm refresh | 2597 ms / 2597 ms | 2131 ms / 2131 ms | 1.22× | pnpm-reinstall / steady: — |
| tsc -b | 8831 ms / 9667 ms | 7323 ms / 9610 ms | 1.21× | tsc-b / cold: — |
| vitest | 6758 ms / 6758 ms | 8046 ms / 8046 ms | 0.84× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.5 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 13.0 ms / 26.0 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4194304 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4185952 B · sandbox.mount 4194304 → 2632712 B · sandbox.commit 1 file (Committed) 4194304 → 980592 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 4.67 at the first command → 18.77 after the last (max 18.77 over 10 commands) · Docker VM 1.74 → 1.46

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-047.a1)

## 5. Findings and action

### Finding 047.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.674 over 17 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-047.a1.json`.

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

- **a1 (`p3-main-w`, live after r46 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 21 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass (2,107 emitted). Control `control-047.a1` passes. Report check F1–F8 PASS. A larger range: 258 steps over 4 lanes.
- **Optimize rows, recorded, not acted on (fast mode):**
  - Counters `merge.returned_rows` (chain-bounded): 2,514 vs 1,941 (1.295×).
  - Contended work `fs.write ≤1 KiB · contended`: SQL VM steps against tree files, exponent 1.674 over 17 ranges. Process-wide counters.
- **The lead's `git clean -f -d`** removed 0 files and 0 folders; the native clean removed the same. Fix 058 exempted nothing.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 19.15×, its p95 the repair's build Commit, 1,322 ms; the relink Commit 17.0 s). Merge p50 541 ms (3 calls, a four-lane range), the top of r23–r46's band. One-shot Commit 1.20×, write 1.17× (10.5 ms, under the 5 ms floor's extra), mount 0.84×; read and list are under the floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 5.9–18.8 (other sessions' work; recorded, not waited on).
- Final steps: lead 3 s; lanes 19 s + 14 s + 10 s + 13 s + 15 s + 62 s (cuts at plan orders 18, 37, 48, 61 and 75); repair 142 s (alarm 200 s; install 41.2 s, build 32.1 s, tests 4.0 s, the largest so far); verify 15 s; finish 47 s. Test calibration needed 10 commands for 325 files, 2 of them stopped at the 115 s alarm (containers removed, no partial state used).
- Watch items: index rows + waste + other 459.8 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 9.57 ms per file over 31 calls, 173 statements and 10,273 VM steps per call (fix 059 cause); contended 10.69 ms over 15 (222 statements; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3537/3537; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 19.15× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.372) and statements per entry does not rise (0.054): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.674 over 17 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.41 | < 0.5 | pass |
| Reinstall growth | absolute: 925189 new stored bytes for 544 raw changed bytes of 18 changed packages (1700.715×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0299 (budget 0.2249) | < 0.1 | pass |
| Range growth | 48.8 MiB, 1.45× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.93 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 139 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 21 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 234 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 265 | 266 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 1787 | 1593 |
| Workspaces (one-shot share) | 335 (0.99) | 136 (0.985) |
| Reads | 441 | 441 |
| Reconcile writes | 164 | 164 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 19 | 18.70 | 500.38 | 500.38 | 571.77 | 1.15× | 9.66× | -0.12 | -0.04 | 234 / 25,826 / 0 | — | 0.0786 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 3 | 10.43 | 10.43 | 10.43 | 10.89 | no baseline | no baseline | 0.17 | -0.39 | 144 / 10,180 / 0 | — | 0.4743 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 400 | 21.69 | 40.05 | 73.39 | 376.24 | 1.26× | 1.54× | -0.13 | -0.12 | 308 / 35,781 / 0 | — | 0.1176 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.94 | 2.05 | 2.05 | 2.37 | 1.03× | 1.56× | -0.54 | -0.46 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.81 | 0.81 | 0.81 | 0.97 | no baseline | no baseline | -0.34 | -0.29 | 70 / 1,298 / 0 | — | 0.0403 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 540.80 | 540.80 | 540.80 | 743.76 | 5.88× | 5.88× | -0.87 | -0.55 | 11,973 / 754,197 / 0 | — | 2.927 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.60 | 1.60 | 1.60 | 1.60 | 1.03× | 1.03× | -0.22 | -0.23 | 35 / 517 / 0 | — | 0.0107 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 14.78 | 14.78 | 14.78 | 14.78 | 2.92× | 2.92× | -1.93 | -1.77 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 39.22 | 39.22 | 39.22 | 39.22 | 1.61× | 1.61× | -0.02 | -0.02 | 180 / 14,975 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 4 | 28.14 | 68.96 | 68.96 | 247.33 | 2.37× | 5.10× | 0.50 | 0.49 | 650 / 85,782 / 8,191 | — | 0.0396 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 4 | 7.61 | 7.96 | 7.96 | 13.37 | 1.24× | 1.07× | -0.67 | -0.52 | 150 / 6,007 / 0 | — | 0.0165 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 3 | 6.37 | 6.37 | 6.37 | 13.26 | 0.69× | 0.41× | -5.01 | -3.96 | 102 / 3,283 / 0 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 8.80 | 8.80 | 8.80 | 8.80 | 1.27× | 0.91× | -0.12 | 0.03 | 155 / 6,345 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 7 | 17.44 | 40.63 | 40.63 | 93.57 | 1.74× | 2.36× | 0.43 | 0.32 | 311 / 47,163 / 0 | — | 0.0085 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 13 | 6.53 | 8.87 | 8.87 | 9.19 | 1.00× | 0.82× | -0.76 | -0.45 | 128 / 5,253 / 0 | — | 0.0017 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 11 | 10.07 | 19.11 | 19.11 | 23.67 | 1.40× | 2.23× | 0.08 | 0.03 | 199 / 11,106 / 0 | — | 0.0586 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 16 | 7.26 | 14.69 | 14.69 | 14.78 | 1.24× | 1.82× | -0.31 | -0.26 | 140 / 7,467 / 0 | — | 0.0253 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 14 | 9.10 | 18.82 | 18.82 | 20.26 | 1.68× | 3.12× | 0.09 | 0.12 | 192 / 12,511 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 14 | 8.70 | 13.92 | 13.92 | 17.24 | 1.40× | 1.51× | -0.37 | -0.21 | 193 / 10,885 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 6 | 10.29 | 19.41 | 19.41 | 27.41 | 1.71× | 3.00× | -0.18 | -0.09 | 276 / 12,063 / 0 | — | 0.0032 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 10 | 7.01 | 8.08 | 8.08 | 20.34 | 0.95× | 1.01× | -0.41 | -0.34 | 162 / 9,361 / 0 | — | 0.0039 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 2.66 | 2.66 | 2.66 | 2.66 | 1.55× | 1.55× | 1.81 | 4.24 | 29 / 956 / 0 | — | 2.661 ms per file | — |
| fs.glob | 17–64 files · contended | 10 | 5 | 18.64 | 18.64 | 19.21 | 1.80× | 6.70× | -0.67 | -0.59 | 111 / 10,156 / 0 | — | 0.194 ms per file | — |
| fs.glob | 17–64 files · uncontended | 12 | 5.93 | 7.01 | 7.01 | 9.29 | 2.10× | 1.85× | 0.19 | 0.17 | 93 / 10,999 / 0 | — | 0.1491 ms per file | — |
| fs.glob | 2–4 files · contended | 8 | 3.34 | 7.93 | 7.93 | 9.39 | 1.83× | 4.36× | 0.61 | 0.49 | 78 / 5,090 / 0 | — | 0.9173 ms per file | — |
| fs.glob | 2–4 files · uncontended | 8 | 2.18 | 2.50 | 2.50 | 2.58 | 1.24× | 1.29× | 0.18 | 0.14 | 43 / 3,310 / 0 | — | 0.6442 ms per file | — |
| fs.glob | 5–16 files · contended | 8 | 4.53 | 5.57 | 5.57 | 5.89 | 2.70× | 3.31× | 0.06 | 0.04 | 69 / 4,929 / 0 | — | 0.4121 ms per file | — |
| fs.glob | 5–16 files · uncontended | 14 | 3.02 | 6.11 | 6.11 | 7.14 | 1.50× | 2.68× | 0.10 | 0.08 | 47 / 4,181 / 0 | — | 0.3862 ms per file | — |
| fs.glob | >64 files · contended | 6 | 19.03 | 48.02 | 48.02 | 69.87 | 3.52× | 8.88× | -1.01 | -0.97 | 314 / 25,573 / 0 | — | 0.0168 ms per file | — |
| fs.glob | >64 files · uncontended | 12 | 6.54 | 11.11 | 11.11 | 11.41 | 0.66× | 0.79× | -0.92 | -0.94 | 99 / 8,688 / 0 | — | 0.026 ms per file | — |
| fs.grep | 17–64 files · contended | 6 | 12.52 | 22.17 | 22.17 | 27.12 | 2.09× | 3.71× | -0.82 | -0.70 | 387 / 19,500 / 0 | — | 0.2781 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 8 | 11.20 | 17.96 | 17.96 | 24.11 | 1.95× | 2.99× | 0.69 | 0.48 | 240 / 15,580 / 0 | — | 0.4366 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 6 | 7.25 | 9.04 | 9.04 | 10.98 | 1.85× | 2.26× | 0.42 | 0.19 | 159 / 10,378 / 0 | — | 2.0175 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 10 | 3.13 | 4.39 | 4.39 | 5.33 | 1.36× | 1.37× | 0.64 | 0.49 | 81 / 4,278 / 0 | — | 1.0433 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 7 | 9.21 | 27.71 | 27.71 | 29.97 | 3.10× | 5.49× | 0.17 | 0.12 | 151 / 11,731 / 0 | — | 0.9101 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 15 | 5.02 | 11.85 | 11.85 | 22.20 | 1.34× | 1.98× | 0.15 | 0.12 | 95 / 4,758 / 0 | — | 0.67 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 14 | 31.14 | 48.52 | 48.52 | 48.79 | 1.98× | 3.09× | 0.48 | 0.44 | 811 / 43,060 / 0 | — | 0.1769 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 11 | 22.27 | 32.76 | 32.76 | 35.00 | 1.22× | 1.42× | 0.51 | 0.37 | 597 / 27,363 / 0 | — | 0.112 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 10 | 3.61 | 9.57 | 9.57 | 14.63 | 1.50× | 3.98× | -0.73 | -0.59 | 93 / 6,352 / 0 | — | 0.0737 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 15 | 3.45 | 6.39 | 6.39 | 6.53 | 1.38× | 2.18× | -0.56 | -0.51 | 66 / 5,192 / 0 | — | 0.0728 ms per entrie | — |
| fs.list | 2–4 entries · contended | 8 | 3.26 | 7.41 | 7.41 | 12.35 | 1.40× | 3.19× | -0.41 | -0.50 | 82 / 5,961 / 0 | — | 1.087 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 13 | 2.51 | 3.10 | 3.10 | 3.40 | 1.33× | 1.52× | 0.78 | 0.61 | 50 / 3,412 / 0 | — | 0.8367 ms per entrie | — |
| fs.list | 5–16 entries · contended | 8 | 4.26 | 10.53 | 10.53 | 23.35 | 1.82× | 3.71× | -0.07 | 0.02 | 88 / 7,275 / 0 | — | 0.4708 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 22 | 2.93 | 4.48 | 4.96 | 16.69 | 1.54× | 1.17× | 0.38 | 0.33 | 59 / 5,726 / 0 | — | 0.3621 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 4 | 2.86 | 5.00 | 5.00 | 5.75 | 1.29× | 2.25× | -0.61 | -0.46 | 97 / 4,639 / 0 | — | 0.0038 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 9 | 2.65 | 3.20 | 3.20 | 5.31 | 1.67× | 2.02× | -0.17 | -0.16 | 60 / 3,701 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 5 | 3.32 | 3.50 | 3.50 | 5.92 | no baseline | no baseline | 0.34 | 0.28 | 95 / 4,423 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 6 | 2.54 | 4.13 | 4.13 | 6.25 | 0.91× | 1.48× | -0.94 | -0.78 | 60 / 3,676 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 13 | 4.10 | 12.37 | 12.37 | 20.95 | 1.95× | 2.08× | -0.29 | -0.21 | 97 / 6,053 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 30 | 2.54 | 3.45 | 4.12 | 7.47 | 1.23× | 0.96× | -0.10 | -0.08 | 56 / 3,466 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 15 | 10.69 | 18.79 | 18.79 | 21.86 | 1.02× | 1.32× | 0.87 | 0.78 | 222 / 14,125 / 0 | — | 10.689 ms per file | commit |
| fs.rm | 1 files · uncontended | 31 | 9.57 | 15.28 | 21.19 | 26.76 | 1.43× | 1.37× | 0.23 | 0.33 | 173 / 10,273 / 0 | — | 9.569 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 5 | 4.44 | 5.20 | 5.20 | 11.69 | 2.05× | 2.33× | -0.33 | -0.34 | 150 / 7,364 / 0 | — | 0.0085 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 8 | 2.19 | 3.34 | 3.34 | 3.49 | 1.43× | 2.18× | 0.60 | 0.54 | 48 / 3,544 / 0 | — | 0.0049 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 6 | 2.52 | 3.24 | 3.24 | 3.63 | 1.20× | 1.54× | -0.35 | -0.31 | 47 / 2,955 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 9 | 4.24 | 11.56 | 11.56 | 32.17 | 1.62× | 3.37× | -0.05 | -0.12 | 94 / 4,812 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 21 | 2.22 | 3.17 | 3.17 | 16.78 | 1.13× | 1.47× | 0.35 | 0.21 | 41 / 3,140 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 7 | 3.15 | 4.39 | 4.39 | 4.95 | 1.40× | 1.47× | -0.03 | -0.04 | 68 / 4,619 / 0 | — | 0.0013 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 10 | 2.49 | 3.08 | 3.08 | 3.66 | 1.49× | 0.88× | -0.09 | -0.07 | 44 / 3,893 / 0 | — | 0.0004 ms per byte | — |
| fs.write | >512 KiB · contended | 4 | 21.61 | 33.12 | 33.12 | 49.11 | no baseline | no baseline | -2.15 | -2.14 | 355 / 19,045 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 2 | 18.62 | 18.62 | 18.62 | 27.86 | no baseline | no baseline | -1.06 | -2.85 | 201 / 7,376 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 63 | 20.86 | 133.89 | 162.54 | 168.02 | 2.45× | 8.98× | 0.54 | 0.54 | 496 / 29,658 / 0 | — | 0.045 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 82 | 8.35 | 15.67 | 25.57 | 27.27 | 1.31× | 1.49× | -0.40 | -0.28 | 170 / 7,640 / 0 | — | 0.0177 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 34 | 19.32 | 132.56 | 135.79 | 138.30 | 1.20× | 8.23× | 0.17 | 0.20 | 509 / 32,062 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 38 | 12.31 | 24.57 | 26.25 | 33.69 | 1.49× | 2.98× | 0.09 | 0.11 | 182 / 8,554 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 292 | 16.82 | 65.27 | 121.80 | 150.58 | 1.70× | 2.97× | 0.20 | 0.19 | 411 / 22,258 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 323 | 8.54 | 15.84 | 26.71 | 40.29 | 1.18× | 1.16× | -0.03 | 0.02 | 162 / 6,821 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 235 | 15.86 | 75.84 | 123.77 | 182.27 | 1.62× | 3.38× | 0.07 | 0.09 | 392 / 22,050 / 0 | — | 0.0039 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 378 | 8.40 | 15.40 | 23.76 | 60.48 | 1.17× | 1.11× | 0.08 | 0.11 | 158 / 7,202 / 0 | — | 0.0025 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.61 | 0.61 | 0.61 | 0.61 | 0.81× | 0.81× | -0.40 | -0.30 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 81 | 32.69 | 58.55 | 79.90 | 119.52 | 1.55× | 1.68× | 0.11 | 0.05 | 430 / 41,643 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 100 | 24.89 | 47.84 | 107.18 | 326.23 | 1.20× | 1.38× | -0.10 | -0.09 | 256 / 27,399 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 26 | 3.78 | 8.09 | 9.26 | 14.14 | 0.99× | 1.00× | 0.17 | 0.17 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 48 | 3.41 | 5.29 | 6.21 | 6.59 | 0.85× | 1.03× | -0.17 | -0.14 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 13 | 11.79 | 23.89 | 23.89 | 26.61 | 1.22× | 1.23× | -0.03 | 0.02 | 125 / 4,500 / 0 | — | 11.788 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 10 | 11.63 | 14.40 | 14.40 | 41.11 | 1.40× | 1.18× | 0.01 | -0.01 | 145 / 5,490 / 0 | — | 11.627 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 275.05 | 275.05 | 275.05 | 275.05 | 7.22× | 7.22× | 0.16 | 0.10 | 12,666 / 532,038 / 8,191 | — | 275.047 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 11 | 16.19 | 27.66 | 27.66 | 31.50 | 1.09× | 1.40× | 1.00 | 0.86 | 191 / 9,827 / 0 | — | 6.001 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 14 | 10.48 | 14.03 | 14.03 | 18.12 | 0.98× | 0.82× | -0.05 | -0.06 | 139 / 5,391 / 0 | — | 4.4753 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 5 | 16.11 | 19.87 | 19.87 | 30.23 | 0.98× | 1.20× | 0.25 | 0.17 | 157 / 8,532 / 0 | — | 3.2218 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 6 | 14.81 | 18.82 | 18.82 | 20.30 | 1.08× | 1.37× | 0.89 | 0.92 | 215 / 11,894 / 0 | — | 2.6648 ms per file | commit |
| sandbox.commit | — · Committed · contended | 4 | 231.10 | 316.98 | 316.98 | 624.66 | no baseline | no baseline | 2.18 | 2.06 | 2,708 / 112,811 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 107.24 | 1321.52 | 1321.52 | 17009.79 | 1.55× | 19.15× | 0.34 | 0.30 | 1,568 / 179,152 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 360 | 42.50 | 971.22 | 1245.63 | 3452.57 | 0.83× | 2.53× | 1.06 | 0.89 | 0 / 0 / 0 | 4365.30 | — | — |
| sandbox.exec | 0 files · uncontended | 203 | 30.40 | 655.77 | 790.54 | 8419.41 | 0.96× | 2.29× | -0.22 | -0.19 | 0 / 0 / 0 | 4,440 | — | — |
| sandbox.exec | 1 files · contended | 63 | 33.50 | 55.19 | 61.24 | 65.30 | 0.91× | 0.65× | 0.06 | 0.04 | — | 5.30 | 33.5 ms per file | — |
| sandbox.exec | 1 files · uncontended | 27 | 38.60 | 60.95 | 64.01 | 75.88 | 1.16× | 0.90× | 0.29 | 0.24 | — | 5 | 38.603 ms per file | — |
| sandbox.exec | 17–64 files · contended | 6 | 68.02 | 77.64 | 77.64 | 83.78 | 0.97× | 1.11× | 0.20 | 0.15 | — | 101 | 3.401 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 53.63 | 53.63 | 53.63 | 72.42 | 0.77× | 0.77× | -0.30 | -0.24 | — | 90 | 2.6814 ms per file | — |
| sandbox.exec | 2–4 files · contended | 81 | 35.71 | 62.25 | 71.95 | 77.41 | 0.92× | 0.89× | -0.08 | -0.07 | — | 9.40 | 13.3373 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 46 | 36.92 | 51.16 | 66.67 | 77.73 | 0.97× | 0.78× | -0.36 | -0.26 | — | 10 | 12.8383 ms per file | — |
| sandbox.exec | 5–16 files · contended | 41 | 43.25 | 77.84 | 77.86 | 80.50 | 0.74× | 1.07× | 0.49 | 0.39 | — | 19.70 | 5.7068 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 38 | 42.38 | 75.77 | 75.82 | 84.54 | 0.60× | 0.72× | -0.35 | -0.21 | — | 19.50 | 6.2564 ms per file | — |
| sandbox.exec | — · contended | 21 | 2592.23 | 28423.16 | 28423.16 | 29465.22 | no baseline | no baseline | -1.28 | -1.04 | — | 45617.50 | — | — |
| sandbox.exec | — · uncontended | 26 | 108.76 | 28711.73 | 32139.50 | 41179.33 | 0.21× | 4.04× | 0.16 | 0.15 | — | 42991.90 | — | — |
| sandbox.mount | — · contended | 159 | 11.33 | 20.01 | 24.20 | 26.10 | 1.01× | 1.05× | -0.16 | -0.12 | 57 / 1,581 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 166 | 9.45 | 15.88 | 20.94 | 43.11 | 0.84× | 0.79× | -0.27 | -0.21 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 3.96 | 4.56 | 4.56 | 37.04 | no baseline | no baseline | -0.11 | -0.09 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 123 | 13.86 | 27.63 | 35.45 | 144.85 | 1.31× | 1.53× | -0.06 | -0.01 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 202 | 12.79 | 21.43 | 97.36 | 305.35 | 1.22× | 1.16× | 0.01 | 0.02 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 19 | 0.0 KiB | 1011.0 KiB | 4,530 | ok 19 |
| branch.diff_commits | branch | 408 | 0.0 KiB | 22.4 MiB | 75,625 | ok 408 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 10 | 0.0 KiB | 96.6 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 45 | 1.6 MiB | 0.0 KiB | 56 | Committed 45 |
| fs.diff_files | fs | 76 | 0.0 KiB | 538.9 KiB | 64 | NoSuchPath 12, Text 64 |
| fs.glob | fs | 89 | 0.0 KiB | 80.4 KiB | 966 | ok 89 |
| fs.grep | fs | 87 | 0.0 KiB | 341.7 KiB | 1,294 | ok 87 |
| fs.list | fs | 88 | 0.0 KiB | 384.4 KiB | 2,484 | ok 88 |
| fs.read | fs | 72 | 0.0 KiB | 280.5 KiB | 72 | ok 72 |
| fs.rm | fs | 46 | 0.0 KiB | 0.0 KiB | 46 | Committed 46 |
| fs.stat | fs | 74 | 0.0 KiB | 17.0 KiB | 74 | ok 74 |
| fs.write | fs | 1,451 | 27.5 MiB | 0.0 KiB | 1,451 | Committed 1451 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 334 | 0.0 KiB | 0.0 KiB | 0 | Committed 259, UpToDate 74, Conflict 1 |
| sandbox.exec | sandbox | 924 | 4.2 MiB | 4.7 MiB | 0 | exit:0 920, exit:2 4 |
| sandbox.mount | sandbox | 335 | 0.0 KiB | 0.0 KiB | 0 | Mounted 335 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 335 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 335 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.74 · end 1.46.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.294 | 12.245 · 1.435 · 1.265 · 1.205 · 1.294 | 1.9–1.9 | statements 30, vm_steps 1015, fullscan_steps 0, sorts 0, returned_rows 85 |
| read | 1.398 | 1.938 · 1.398 · 1.406 · 1.309 · 1.139 | 1.9–1.9 | statements 18, vm_steps 754, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_small | 1.22 | 1.548 · 1.277 · 1.22 · 1.078 · 1.101 | 1.9–1.9 | statements 18, vm_steps 763, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_largest | 9.973 | 11.707 · 9.916 · 9.973 · 9.35 · 10.008 | 1.9–1.9 | statements 183, vm_steps 25923, fullscan_steps 0, sorts 0, returned_rows 2670 |
| grep_scoped | 1.256 | 1.854 · 1.553 · 1.248 · 1.256 · 1.214 | 1.9–1.9 | statements 23, vm_steps 909, fullscan_steps 0, sorts 0, returned_rows 82 |
| glob_scoped | 1.182 | 1.423 · 1.223 · 1.182 · 1.107 · 1.158 | 1.9–1.9 | statements 17, vm_steps 742, fullscan_steps 0, sorts 0, returned_rows 72 |
| grep_tree | 5538.741 | 8948.57 · 5673.786 · 5538.741 · 5374.586 · 5494.461 | 1.55–1.83 | statements 61155, vm_steps 4613111, fullscan_steps 0, sorts 0, returned_rows 461411 |
| glob_tree | 8.867 | 11.622 · 9.507 · 8.867 · 8.654 · 8.362 | 1.55–1.55 | statements 137, vm_steps 20061, fullscan_steps 0, sorts 0, returned_rows 2137 |
| diff_files | 4.586 | 4.586 · 5.097 · 4.7 · 4.492 · 4.572 | 1.55–1.55 | statements 78, vm_steps 4264, fullscan_steps 0, sorts 0, returned_rows 426 |
| list_commits | 0.694 | 1.902 · 0.753 · 0.622 · 0.677 · 0.694 | 1.55–1.55 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.239 | 3.341 · 2.303 · 2.086 · 2.239 · 2.001 | 1.55–1.55 | statements 60, vm_steps 2054, fullscan_steps 0, sorts 0, returned_rows 225 |
| fork | 0.988 | 0.988 · 0.936 · 1.872 · 0.643 · 1.029 | 1.55–1.55 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 31.451 | 31.451 · 33.795 · 34.379 · 27.021 · 28.914 | 1.55–1.55 | statements 496, vm_steps 21804, fullscan_steps 0, sorts 0, returned_rows 1613 |
| oneshot_mount_unmount | 15.189 | 26.369 · 14.755 · 40.514 · 15.011 · 15.189 | 1.55–1.55 | statements 64, vm_steps 2235, fullscan_steps 82, sorts 2, returned_rows 221 |
| oneshot_commit | 72.072 | 72.072 · 80.24 · 71.486 · 79.86 · 71.728 | 1.55–1.55 | statements 179, vm_steps 10459, fullscan_steps 82, sorts 2, returned_rows 813 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.55–1.55 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 324.2 s** (tooling): play 114.9 · consolidate 138.7 · verify 20.6 · probes 32.2 · tests 0.0 · seal + snapshot 0.0 · report 17.8

324.22 s tooling: prepare 1.48 · play 113.40 · consolidate 138.74 · verify 11.29 (diff_commits) · version walk 9.28 · probes 32.17 · metrics 0.90 · Store allocation 0.26 · report 0.45

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T05:26:19.801Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 19.15× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.372) and statements per entry does not rise (0.054): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8); Contended work: fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.674 over 17 ranges |

### G. Evidence

- `~/lfs-history/metrics/range-047.a1.json`
- trace `~/lfs-history/runs/p3-main-w/trace/range-047.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-w/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r047-1-examples-acp-agent | 859 | 562.9 KiB |
| r047-3-agents-notes | 870 | 567.1 KiB |
| r047-2-root | 623 | 560.9 KiB |
| r047-4-packages-core | 885 | 565.4 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 431.0 | 4,576 |
| `git diff --stat` | 39.0 | 4,566 |
| `git add -f` | 37.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 43.0 | 4,572 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r047-1-examples-acp-agent | end | P1 | pass | — | — |
| r047-1-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r047-1-examples-acp-agent | end | P3 | pass | 271 bookkeeping path(s) | — |
| r047-1-examples-acp-agent | end | P4 | pass | 151 emitted files, exit 2 | — |
| r047-1-examples-acp-agent | end | P5 | pass | 12 files | — |
| r047-1-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r047-4-packages-core | end | P1 | pass | — | — |
| r047-4-packages-core | end | P2 | pass | exit 0 | — |
| r047-4-packages-core | end | P3 | pass | 271 bookkeeping path(s) | — |
| r047-4-packages-core | end | P4 | pass | 698 emitted files, exit 2 | — |
| r047-4-packages-core | end | P5 | n/a | no calibrated file | — |
| r047-4-packages-core | end | P6 | n/a | not a repair | — |
| r047-3-agents-notes | end | P1 | pass | — | — |
| r047-3-agents-notes | end | P2 | pass | exit 0 | — |
| r047-3-agents-notes | end | P3 | pass | 271 bookkeeping path(s) | — |
| r047-3-agents-notes | end | P4 | pass | 197 emitted files, exit 2 | — |
| r047-3-agents-notes | end | P5 | pass | 27 files | — |
| r047-3-agents-notes | end | P6 | n/a | not a repair | — |
| r047-2-root | end | P1 | pass | — | — |
| r047-2-root | end | P2 | pass | exit 0 | — |
| r047-2-root | end | P3 | n/a | an install, not a refresh | — |
| r047-2-root | end | P4 | pass | 796 emitted files, exit 2 | — |
| r047-2-root | end | P5 | pass | 103 files | — |
| r047-2-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2107 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
