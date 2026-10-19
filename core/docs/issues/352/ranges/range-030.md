# Range 030 · **optimize** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r029 (live Store) · **re-judged after fix 055** (retained state, not replayed)
dsh `2405570ac`..`3e3ea4729` · **65 commits** (11 mainline, 54 side) · 2026-07-22 → 2026-07-23
Areas changed: `examples/acp-agent` 15% · `packages/client` 10% · `/` 10% · other 65%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 15 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 139.0 s · git 155.1 s · Node 219.5 s · verify 14.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **723.5 MiB** (+4.0 MiB) | **803.7 MiB** (+29.6 MiB) | **1.11×** (prev 1.08×) | **35.6 MiB** | **1,545** (total 35,023) | **329.4 s** tooling (total 83.1 min) |

**Checks:** 15 pass · 3 watch: Speed not judged: baseline not set (pilot); Scaling branch.diff_commits checkpoint ms per entry (entries exponent 0.335): depth exponent 0.238; Counters glob_tree.vm_steps per tree file: depth exponent 0.104 · 1 optimize/stop: Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ sandbox.commit p95 +491% · ▲ sandbox.exec p95 +180% · ▲ sandbox.mount p95 +129%
**Budget:** 31 of 202 ranges · projected total 16.4 h (budget 16.8 h) · disk 34% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **2,871 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,613 / 2,613 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2525 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 377 bin shims, 3926 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `3e3ea4729`** · 152 commits written for 152 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 112 untracked, unignored (521,435 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r030-3-examples-acp-agent | end | `f1e46d4af308` | `829a464515b2` | pass (375 normalized) | pass | pass | pass | n/a | n/a |
| r030-1-root | end | `200ee1918438` | `f46e38acfa34` | pass (382 normalized) | pass | n/a | pass | pass | n/a |
| r030-2-packages-client | end | `58accc391ca5` | `829a464515b2` | pass (375 normalized) | pass | pass | pass | n/a | n/a |
| lead | repair | `244aad5851e7` | `null` | n/a | pass | n/a | n/a | pass | pass (120,556 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/bash/bash-local/tests/executor.spec.ts` (fails natively) · `packages/bash/bash-local/tests/run.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/bash/tests/service.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/host/webserver/tests/invariant.spec.ts` (fails natively) · `packages/host/webserver/tests/web-plugins.spec.ts` (fails natively) · `packages/host/webserver/tests/webserver.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/win32.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/normalize.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/support/invariants/tests/service.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/codec.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/modes.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/properties.spec.ts` (fails natively) · `packages/ui/acp/tests/session-list.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/client/i18n/tests/i18n.spec.ts` (fails natively) · `packages/client/i18n/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/client-loader.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-stores.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/toolview-entry-types.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/toolview-registry.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/store.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/tree.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/web-react/tests/bind.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots-real-core.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots.spec.tsx` (fails natively) · `packages/client/web-react/tests/session-provider.spec.tsx` (fails natively) · `packages/client/web-react/tests/store.spec.ts` (fails natively) · `packages/client/web-react/tests/use-invoke.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/boot.spec.tsx` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/i18n/tests/i18n.spec.ts` (fails natively) · `packages/client/i18n/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/client-loader.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/toolview-entry-types.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/toolview-registry.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/toolviews-type-chain.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/tree.spec.ts` (fails natively) · `packages/client/ui-slots/tests/core.spec.ts` (fails natively) · `packages/client/ui-slots/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-slots/tests/surface.spec.ts` (fails natively) · `packages/client/ui-slots/tests/type-chain.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/web-react/tests/bind.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots-real-core.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots.spec.tsx` (fails natively) · `packages/client/web-react/tests/session-provider.spec.tsx` (fails natively) · `packages/client/web-react/tests/stale-authorization.spec.tsx` (fails natively) · `packages/client/web-react/tests/use-invoke.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/boot.spec.tsx` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/compact/compact/tests/compact.spec.ts` (fails natively) · `packages/compact/compact/tests/invariant.spec.ts` (fails natively) · `packages/compact/compact/tests/tool-pairing.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/agent-loop/tests/inbox.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/invariant.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/properties.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-log.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-recovery.spec.ts` (fails natively) · `packages/core/agent-loop/tests/resume.spec.ts` (fails natively) · `packages/core/agent-loop/tests/scope-lifecycle.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/core/agent/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent/tests/agent.spec.ts` (fails natively) · `packages/core/agent/tests/gen-cordis-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/invariant.spec.ts` (fails natively) · `packages/core/agent/tests/llm-target.spec.ts` (fails natively) · `packages/core/agent/tests/verify-export-jsdoc.spec.ts` (fails natively) · `packages/core/session/tests/chunk-rows.spec.ts` (fails natively) · `packages/core/session/tests/derived-cache.spec.ts` (fails natively) · `packages/core/session/tests/fork.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/session/tests/invariant.spec.ts` (fails natively) · `packages/core/session/tests/json.spec.ts` (fails natively) · `packages/core/session/tests/out-of-band.spec.ts` (fails natively) · `packages/core/session/tests/properties.spec.ts` (fails natively) · `packages/core/session/tests/repair.spec.ts` (fails natively) · `packages/core/session/tests/request-header.spec.ts` (fails natively) · `packages/core/session/tests/scoped.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-signal-types.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/invariant.spec.ts` (fails natively) · `packages/core/tools/tests/json-schema.spec.ts` (fails natively) · `packages/core/tools/tests/properties.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/tools/tests/tools.spec.ts` (fails natively) · `packages/core/tools/tests/ts-types.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/examples/tui-demo/tests/tui-agent.spec.ts` (fails natively) · `packages/fs/fs-sandbox/tests/containment.spec.ts` (fails natively) · `packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts` (fails natively) · `packages/fs/fs/tests/invariant.spec.ts` (fails natively) · `packages/fs/fs/tests/service.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/load-path.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/shell-quote.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/tools.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/diff.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/read-render.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/codec.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/detached.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/events.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/invariant.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/matcher.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/merge.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/runner.spec.ts` (fails natively) · `packages/session-query/session-query/tests/session-query.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively).

## 2. Activity

**3,307 calls** · **148 steps** by **8 agents + lead** on **3 Branches + main** · **200 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +205 added · 1,226 modified · −86 deleted · 18.0 MiB written · fs 1,387 : Sandbox 130 (**11 : 1**, reported only in P3)
**Execs:** 562 (JS 48 · shell 514) · 3 non-zero exits · install 0 · test runs 3 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,742 | 1,400 | 342 | Committed 1,400 · NoSuchPath 10 · Text 38 · Equal 1 |
| sandbox | 1,161 | 757 | 4 | commit 195 (Committed 160, UpToDate 34, Conflict 1) · exec 562 (exit:0 559, exit:2 2, exit:1 1) · mount 200 (Mounted 200) · status 4 · unmount 200 (Unmounted 200) |
| branch | 394 | 32 | 362 | diff_branches 13 · diff_commits 349 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,307** | **2,189** | **718** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r030-1-root | a01 | 22 | 464 | ✓ | — |
| r030-2-packages-client | a02 a03 a04 | 57 | 429 | ✓ | — |
| r030-3-examples-acp-agent | a05 a06 a07 a08 | 63 | 448 | ✓ | — |
| main | lead | 6 | 204 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r030-2, a03 after a02 | 0.1 s |
| Stale clean merge | 1 / 1 | r030-2, a03 a04 | merged cleanly |
| Decoy edit | 1 / 1 | r030-2, a02 a03 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r030-1 | 22 | 10 | 12 | 0 | 0 | 464 | — |
| a02 | r030-2 | 23 | 12 | 11 | 0 | 0 | 156 | commit-conflict, decoy |
| a03 | r030-2 | 17 | 5 | 12 | 0 | 0 | 216 | commit-conflict, stale-clean-merge, decoy |
| a04 | r030-2 | 17 | 5 | 12 | 0 | 0 | 57 | stale-clean-merge |
| a05 | r030-3 | 19 | 11 | 8 | 0 | 0 | 149 | — |
| a06 | r030-3 | 12 | 5 | 7 | 0 | 0 | 141 | — |
| a07 | r030-3 | 13 | 7 | 6 | 0 | 0 | 53 | — |
| a08 | r030-3 | 19 | 9 | 10 | 0 | 0 | 105 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 204 | — |
| **Total** |  | **148** | **65** | **78** | **5** | **0** | **1,545** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 111 · pnpm 1 · tsc 3 · vitest 3 · other 444

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r030-2-packages-client | 45 | 45 | 45 | 4 | 45 | 885 |
| r030-1-root | 14 | 14 | 14 | 7 | 14 | 265 |
| r030-3-examples-acp-agent | 45 | 45 | 45 | 1 | 45 | 1,006 |
| **lead** | — | — | — | — | 152 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r030-3-examples-acp-agent | 0 | 1 | 1 | 0 | 0 | — / — |
| r030-1-root | 1 | 0 | 1 | 1 | 37 | 37 / 37 |
| r030-2-packages-client | 0 | 1 | 1 | 0 | 0 | — / — |
| **lead repair** | 1 | — | 1 | — | — | 120,556 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r029) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 719.4 MiB (17.9 MiB / 624.8 MiB / 16.2 MiB / 60.5 MiB) | 723.5 MiB (18.7 MiB / 624.9 MiB / 17.1 MiB / 62.8 MiB) | +4.0 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 53,844 / 8,783 / 3,858 | 54,105 / 8,840 / 3,934 | +261 / +57 / +76 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 774.1 MiB | 803.7 MiB | +29.6 MiB |
| **Space amplification** (total · tracked) | 1.08× · tracked 4.66× | 1.11× · tracked 4.60× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **6.38** (1.16 / 0.23 / 0.66) | 2.52× the median range |
| **Stored per Commit** | 40.1 KiB | 19.3 KiB | — |
| Metadata share | 0.37 | 0.38 | this range 0.44 |
| History: Commits / Layers / Branches | 33,478 | 35,023 / 17 / 264 | +1,545 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.79 GiB (Commits 7.02 GiB · installs 901.9 MiB · build 109.7 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 43.75 GiB / 34% | — |
| Snapshot | — | r030, 702.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 499.9 MiB | 0.69 | +16.5 MiB |
| Metadata | 67.7 MiB | 0.09 | +3.7 MiB |
| Index rows | 196.1 MiB | 0.27 | — |
| Waste | 39.0 MiB | 0.05 | — |
| Other | 1004.0 KiB | 0.00 | — |
| **Total = Store on disk** | **803.7 MiB** | **= 1.11** space amplification | +29.6 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 18.7 MiB | 86.0 MiB (48.7 MiB + 37.3 MiB) | 4.60× | — | 2.7 MiB | 5.6 MiB | 0.49 |
| `node_modules` | 624.9 MiB | 194.0 MiB (180.5 MiB + 13.4 MiB) | 0.31× | — | 902.4 KiB | 2.0 MiB | 0.45 |
| Build output | 17.1 MiB | 12.0 MiB (11.3 MiB + 712.3 KiB) | 0.70× | — | 1.1 MiB | 6.7 MiB | 0.17 |
| `.git` | 62.8 MiB | 247.8 MiB (238.1 MiB + 9.7 MiB) | 3.95× | — | 15.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 236.1 MiB | — (not divided) | — | 9.4 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 27.9 MiB | — | — | — | — | — |
| **Total** | — | **803.7 MiB** | **= 1.11×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 120,429 | +4,855 | 6.1 KiB | 0 (derived) | 55% |
| Chunks (large files) | 48,448 | +959 | 14.7 KiB | — | 11% |
| Large-file extents | 14,177 | — | 0.2 KiB | — | — |
| Directories | 195,895 | 4,910 (with inodes, pooled) | 0.2 KiB | — | 62% |
| Inodes and attributes | 215,601 | ↑ pooled | 2.6 KiB | — | — |
| Symlinks | 2,204 | +4,047 | 0.1 KiB | — | — |

Delta: 3.1% at depth cap · 15% of refused bases stopped by budget · `node_modules` reinstall: absolute: 811108 new stored bytes for 2084 raw changed bytes of 68 changed packages (389.207×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.60× (86.0 MiB for 18.7 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.4 KiB / 5.4 KiB / 8.9 KiB over 256 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.0 MiB stored for 1.83 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.37 (3 lanes × 723.5 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 10.7 ms / 62.6 ms | 3.8 ms / 8.8 ms | 4.6 ms / 15.7 ms | 28.7 ms / 242 ms | 13.6 ms / 38.1 ms | 319 ms / 319 ms | — (native comparison in P3; exec 49.4 ms / 1901 ms) |
| SQL p50: 154 stmts | 49 stmts | 56 stmts | 301 stmts | 54 stmts | 8,242 stmts | — |

**Commit cost:** 7.52 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 844 ms p50 over 200
**Slowest:** sandbox.exec 38138 ms · sandbox.exec 33586 ms · sandbox.exec 31174 ms · checkpoint diff_commits 0.13 ms and 1.51 statements per entry (64,308 entries per page)
**Scaling:** 7 of 15 probes flat · `stat` 0.20 · `read` 0.15 · `list_small` 0.45 · `list_largest` 1.78 · `grep_scoped` 0.15 · `grep_tree` 0.59 · `glob_tree` 1.21 · `oneshot_mount_unmount` 0.21

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 349 ms / 349 ms | — / — | — | git / status-cold: — |
| git status (steady) | 458 ms / 926 ms | — / — | — | git / status-steady: — |
| git add | 43.0 ms / 157 ms | — / — | — | git / add: — |
| git commit (lane) | 46.0 ms / 95.0 ms | — / — | — | git / commit: — |
| lead writes main | 6414 ms / 6414 ms | — / — | — | — |
| repack | 3478 ms / 3478 ms | — / — | — | — |
| pnpm install (incremental) | 3176 ms / 3176 ms | 2155 ms / 2155 ms | 1.47× | pnpm-reinstall / cold: — |
| pnpm refresh | 2963 ms / 2963 ms | 2038 ms / 2038 ms | 1.45× | pnpm-reinstall / steady: — |
| tsc -b | 7691 ms / 7691 ms | 4914 ms / 14100 ms | 1.57× | tsc-b / cold: — |
| vitest | 10593 ms / 10593 ms | 9843 ms / 9843 ms | 1.08× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 14.5 ms / 48.5 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4177712 → 4194304 B · fs.write ≤8 KiB 4177712 → 4194304 B · fs.write ≤64 KiB 4190072 → 4194304 B · fs.read ≤8 KiB 4177712 → 4194304 B · sandbox.mount 4177712 → 2760432 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 13.33 at the first command → 9.35 after the last (max 21.91 over 6 commands) · Docker VM 3.17 → 2.96

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-030.a1)

## 5. Findings and action

### Finding 030.a1 · optimize

**1. Trigger** (attempt 1, daemon `45a196ef16c6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Contended work | fs.rm 1 files · contended: SQL VM steps against tree files, exponent 1.573 over 8 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-030.a1.json`.

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

- **a1 (`p3-main-t`, live after r29 a1, daemon `45a196ef`, addon `4668012e`; binaries from main 3ef00d32e5, owner 2026-10-20; units not used): OPTIMIZE, terminal under the fast-mode ruling (counter rows are recorded, not stops), re-judged after fix 055 on retained state.** Checkpoint ok, git ✓.
  - Node was first judged 13 pass, 2 stop over 4 points: P4 at `r030-1-root.end` and `r030-2-packages-client.end`, the same 4 `packages/client/ui-*/lib/client.js` files.
  - Cause ([fix 055](../fixes/055-r030-a1-native-state-roots.md)): at both points `tsc -b` fails on both sides, so the UI bundles are left over from the last repair build. tsdown writes the absolute path into CSS-module class hashes. `savestate` replayed the chain without each state's root, so the native snapshot's bundles were built at the oracle root, not at `/workspaces/4`. The r029 snapshot was remade at LayerFS's roots and the attempt re-judged.
  - After the re-judge: Node 15 pass, 0 stop, 0 NOT_RUN over 4 points; repair P6 pass (1,568 emitted). Control `control-030.a1` passes.
  - The only optimize row is Contended work: `fs.rm` 1 file, SQL VM steps against tree files, exponent 1.573 over 8 ranges. It is a counter row, recorded and not acted on in fast mode. Watch rows: Speed not judged; Scaling `branch.diff_commits` checkpoint ms per entry, depth exponent 0.238; Counters `glob_tree.vm_steps`, depth exponent 0.104.
  - Range 30 had no `tests-030.json`. `calibrate-tests.mjs` probed 213 candidates in 6 commands; two of them took 110.5 s and 114.3 s against the 115 s alarm. 30 files run.
  - Lanes cut at plan order 33. Final steps: repair 119 s (160 s alarm), verify 18 s, finish 49 s. Repair build 21.2 s, install 38.1 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2613/2613; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.335): depth exponent 0.238 | < 0.15 | watch |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.104 | < 0.05 | watch |
| Contended work | fs.rm 1 files · contended: SQL VM steps against tree files, exponent 1.573 over 8 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.44 | < 0.5 | pass |
| Reinstall growth | absolute: 811108 new stored bytes for 2084 raw changed bytes of 68 changed packages (389.207×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0313 (budget 0.1528) | < 0.1 | pass |
| Range growth | 35.6 MiB, 0.82× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 3839 ms for 702.7 MiB new; size exponent -0.137 | < 0.15 | pass |
| Disk projection | 0.34 | < 0.8 | pass |
| Wall projection | 0.98 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 152 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 15 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 148 | 149 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1545 | 1431 |
| Workspaces (one-shot share) | 200 (0.99) | 77 (0.974) |
| Reads | 303 | 303 |
| Reconcile writes | 197 | 197 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 13 | 21.90 | 438.25 | 438.25 | 445.68 | no baseline | no baseline | -0.50 | -0.58 | 226 / 26,488 / 0 | — | 0.0924 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 13.41 | 13.41 | 13.41 | 13.41 | no baseline | no baseline | — | — | 189 / 19,423 / 0 | — | 0.2854 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 343 | 23.23 | 59.17 | 79.91 | 367.06 | no baseline | no baseline | 0.05 | 0.01 | 303 / 33,278 / 0 | — | 0.1256 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.88 | 3.57 | 3.57 | 29.13 | no baseline | no baseline | 1.23 | 0.97 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.98 | 0.98 | 0.98 | 1.02 | no baseline | no baseline | -0.71 | -0.59 | 70 / 1,298 / 0 | — | 0.0489 ms per entrie | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 2.27 | 2.27 | 2.27 | 2.27 | no baseline | no baseline | — | — | 35 / 517 / 0 | — | 0.0539 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 319.45 | 319.45 | 319.45 | 445.69 | no baseline | no baseline | -0.49 | -0.36 | 8,242 / 470,795 / 0 | — | 1.3479 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 6.93 | 6.93 | 6.93 | 6.93 | no baseline | no baseline | -2.00 | -1.59 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 42.60 | 42.60 | 42.60 | 42.60 | no baseline | no baseline | 0.23 | 0.07 | 183 / 16,086 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 6 | 26.84 | 50.90 | 50.90 | 103.80 | no baseline | no baseline | 0.76 | 0.74 | 230 / 12,140 / 0 | — | 0.1414 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 5 | 14.51 | 18.08 | 18.08 | 20.04 | no baseline | no baseline | 1.23 | 1.06 | 154 / 8,691 / 0 | — | 0.0801 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 15.89 | 15.89 | 15.89 | 15.89 | no baseline | no baseline | -4.58 | -3.34 | 408 / 22,153 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 5 | 10.01 | 10.69 | 10.69 | 15.02 | no baseline | no baseline | 0.39 | 0.18 | 126 / 6,742 / 0 | — | 0.001 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 8 | 16.61 | 39.85 | 39.85 | 58.76 | no baseline | no baseline | -0.86 | -0.61 | 307 / 17,330 / 0 | — | 0.01 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 18 | 11.20 | 22.33 | 22.33 | 23.65 | no baseline | no baseline | 0.96 | 0.74 | 152 / 7,418 / 0 | — | 0.0049 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 3 | 12.12 | 12.12 | 12.12 | 28.87 | no baseline | no baseline | 0.20 | 0.48 | 181 / 11,096 / 0 | — | 0.0347 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 16 | 8.52 | 27.57 | 27.57 | 37.81 | no baseline | no baseline | -0.14 | -0.10 | 168 / 10,528 / 0 | — | 0.0457 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 4 | 15.19 | 44.05 | 44.05 | 120.42 | no baseline | no baseline | 1.75 | 1.46 | 213 / 9,754 / 0 | — | 0.0008 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 12 | 11.21 | 13.53 | 13.53 | 28.47 | no baseline | no baseline | 1.50 | 1.30 | 122 / 5,410 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 4 | 14.06 | 14.82 | 14.82 | 21.30 | no baseline | no baseline | 0.43 | 0.24 | 231 / 13,243 / 0 | — | 0.0037 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 11.73 | 13.12 | 13.12 | 15.54 | no baseline | no baseline | 1.38 | 1.09 | 182 / 9,246 / 0 | — | 0.0055 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 4.40 | 4.40 | 4.40 | 4.40 | no baseline | no baseline | 2.21 | 1.79 | 45 / 3,364 / 0 | — | 4.399 ms per file | — |
| fs.glob | 17–64 files · contended | 2 | 3.61 | 3.61 | 3.61 | 5.39 | no baseline | no baseline | -0.15 | -0.26 | 69 / 3,697 / 0 | — | 0.0856 ms per file | — |
| fs.glob | 17–64 files · uncontended | 9 | 8.50 | 13.14 | 13.14 | 15.44 | no baseline | no baseline | 1.70 | 1.36 | 90 / 8,480 / 0 | — | 0.2617 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 3.58 | 3.58 | 3.58 | 5.79 | no baseline | no baseline | 0.86 | 0.76 | 35 / 3,743 / 0 | — | 0.8952 ms per file | — |
| fs.glob | 5–16 files · contended | 2 | 10.26 | 10.26 | 10.26 | 34.06 | no baseline | no baseline | 2.24 | 1.99 | 244 / 12,773 / 0 | — | 1.0255 ms per file | — |
| fs.glob | 5–16 files · uncontended | 14 | 4.80 | 11.70 | 11.70 | 23.96 | no baseline | no baseline | 1.35 | 1.04 | 64 / 5,604 / 0 | — | 0.4628 ms per file | — |
| fs.glob | >64 files · contended | 10 | 8.25 | 21.18 | 21.18 | 31.98 | no baseline | no baseline | -0.88 | -1.04 | 149 / 11,895 / 0 | — | 0.057 ms per file | — |
| fs.glob | >64 files · uncontended | 10 | 16.10 | 70.42 | 70.42 | 183.17 | no baseline | no baseline | 1.48 | 1.47 | 177 / 20,828 / 0 | — | 0.0672 ms per file | — |
| fs.grep | 1 files · uncontended | 4 | 2.06 | 2.73 | 2.73 | 5.93 | no baseline | no baseline | -0.01 | 0.01 | 39 / 2,425 / 0 | — | 2.055 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 2 | 7.97 | 7.97 | 7.97 | 45.40 | no baseline | no baseline | -0.51 | -0.18 | 185 / 13,762 / 0 | — | 0.1329 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 7 | 14.70 | 25.42 | 25.42 | 59.15 | no baseline | no baseline | 1.26 | 0.90 | 251 / 16,284 / 0 | — | 0.3052 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 3 | 4.57 | 4.57 | 4.57 | 4.99 | no baseline | no baseline | 0.64 | 0.41 | 71 / 4,823 / 0 | — | 1.1433 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 929.32 | 929.32 | 929.32 | 929.32 | no baseline | no baseline | 6.91 | 5.83 | 225 / 11,116 / 0 | — | 116.1653 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 12 | 6.75 | 36.37 | 36.37 | 67.49 | no baseline | no baseline | 1.22 | 0.84 | 113 / 6,666 / 0 | — | 0.9433 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 8 | 32.13 | 78.85 | 78.85 | 84.95 | no baseline | no baseline | -1.98 | -1.58 | 602 / 29,011 / 0 | — | 0.2488 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 15 | 23.32 | 60.68 | 60.68 | 77.20 | no baseline | no baseline | 0.22 | 0.42 | 426 / 24,467 / 0 | — | 0.1681 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 6 | 5.96 | 6.75 | 6.75 | 17.51 | no baseline | no baseline | -0.16 | -0.17 | 84 / 9,338 / 0 | — | 0.1267 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 16 | 6.13 | 19.63 | 19.63 | 20.39 | no baseline | no baseline | 0.77 | 0.84 | 80 / 9,523 / 0 | — | 0.2191 ms per entrie | — |
| fs.list | 2–4 entries · contended | 4 | 4.45 | 4.87 | 4.87 | 6.89 | no baseline | no baseline | 2.20 | 1.87 | 70 / 4,469 / 0 | — | 1.2165 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 6 | 2.79 | 4.49 | 4.49 | 6.27 | no baseline | no baseline | 0.50 | 0.41 | 39 / 3,743 / 0 | — | 0.9293 ms per entrie | — |
| fs.list | 5–16 entries · contended | 3 | 4.63 | 4.63 | 4.63 | 7.20 | no baseline | no baseline | 0.17 | 0.08 | 59 / 4,423 / 0 | — | 0.5789 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 17 | 3.06 | 9.26 | 9.26 | 11.21 | no baseline | no baseline | 0.47 | 0.31 | 50 / 4,279 / 0 | — | 0.3832 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 6.80 | 6.80 | 6.80 | 6.80 | no baseline | no baseline | 1.18 | 0.83 | 153 / 9,675 / 0 | — | 0.0086 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 2 | 3.73 | 3.73 | 3.73 | 8.36 | no baseline | no baseline | -0.43 | -0.36 | 40 / 2,437 / 0 | — | 0.0082 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 3.84 | 5.21 | 5.21 | 7.42 | no baseline | no baseline | 0.99 | 0.88 | 49 / 4,016 / 0 | — | 0.0004 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 8 | 4.61 | 5.93 | 5.93 | 11.91 | no baseline | no baseline | 0.90 | 0.71 | 69 / 5,686 / 0 | — | 0.0015 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 33 | 3.05 | 8.84 | 9.92 | 11.06 | no baseline | no baseline | 0.21 | 0.12 | 46 / 3,118 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 43 | 23.75 | 54.40 | 146.18 | 188.21 | no baseline | no baseline | 1.18 | 0.79 | 403 / 27,011 / 0 | — | 23.75 ms per file | commit |
| fs.rm | 1 files · uncontended | 40 | 18.20 | 48.03 | 88.76 | 100.64 | no baseline | no baseline | 1.22 | 1.12 | 152 / 7,963 / 0 | — | 18.205 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 2.80 | 2.80 | 2.80 | 2.80 | no baseline | no baseline | 0.81 | 0.52 | 63 / 4,274 / 0 | — | 0.0058 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 4 | 3.20 | 3.56 | 3.56 | 5.76 | no baseline | no baseline | 0.72 | 0.56 | 52 / 4,281 / 0 | — | 0.007 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 2.45 | 2.45 | 2.45 | 2.45 | no baseline | no baseline | -2.17 | -1.83 | 100 / 5,986 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 2 | 2.07 | 2.07 | 2.07 | 5.57 | no baseline | no baseline | 0.08 | -0.10 | 40 / 2,886 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.81 | 2.81 | 2.81 | 9.26 | no baseline | no baseline | -0.06 | -0.03 | 69 / 4,316 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 13 | 3.04 | 5.60 | 5.60 | 5.78 | no baseline | no baseline | 0.09 | 0.02 | 44 / 3,612 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 4 | 4.53 | 7.04 | 7.04 | 7.76 | no baseline | no baseline | 0.29 | 0.31 | 41 / 2,632 / 0 | — | 0.0026 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 19 | 3.78 | 8.13 | 8.13 | 18.13 | no baseline | no baseline | 1.19 | 0.94 | 41 / 3,503 / 0 | — | 0.0011 ms per byte | — |
| fs.write | ≤1 KiB · contended | 45 | 21.18 | 72.83 | 310.71 | 1833.82 | no baseline | no baseline | 1.68 | 1.36 | 225 / 14,638 / 0 | — | 0.0337 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 86 | 11.61 | 54.10 | 159.96 | 287.69 | no baseline | no baseline | 0.54 | 0.47 | 138 / 6,627 / 0 | — | 0.0187 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 16 | 29.62 | 79.77 | 79.77 | 254.72 | no baseline | no baseline | 0.48 | 0.37 | 442 / 26,477 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 29 | 14.14 | 26.53 | 34.31 | 79.59 | no baseline | no baseline | 0.37 | 0.30 | 165 / 7,538 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 104 | 27.62 | 93.25 | 125.17 | 486.17 | no baseline | no baseline | 1.66 | 1.28 | 415 / 22,979 / 0 | — | 0.0016 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 305 | 8.80 | 18.84 | 37.10 | 929.48 | no baseline | no baseline | 0.26 | 0.20 | 146 / 6,033 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 200 | 23.45 | 86.07 | 281.14 | 493.75 | no baseline | no baseline | 1.33 | 1.07 | 333 / 19,240 / 0 | — | 0.0078 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 476 | 8.70 | 28.62 | 60.32 | 120.64 | no baseline | no baseline | 0.28 | 0.22 | 140 / 6,083 / 0 | — | 0.0036 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.89 | 1.89 | 1.89 | 1.89 | no baseline | no baseline | 1.96 | 1.52 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 40 | 54.18 | 1553.78 | 1563.99 | 1570.28 | no baseline | no baseline | 0.44 | 0.32 | 549 / 33,339 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 65 | 38.12 | 126.31 | 158.29 | 283.71 | no baseline | no baseline | 0.38 | 0.25 | 441 / 31,855 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 7 | 4.01 | 4.84 | 4.84 | 14.25 | no baseline | no baseline | -0.09 | -0.05 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 27 | 4.47 | 11.21 | 12.32 | 23.36 | no baseline | no baseline | 0.39 | 0.34 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 7 | 14.51 | 31.68 | 31.68 | 71.25 | no baseline | no baseline | 0.06 | 0.16 | 129 / 4,455 / 0 | — | 14.509 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 10 | 10.40 | 15.24 | 15.24 | 16.85 | no baseline | no baseline | 0.17 | 0.13 | 109 / 4,431 / 0 | — | 10.401 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 73.71 | 73.71 | 73.71 | 73.71 | no baseline | no baseline | -1.46 | -1.17 | 2,595 / 122,118 / 0 | — | 73.713 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 5 | 27.55 | 33.07 | 33.07 | 62.53 | no baseline | no baseline | 0.11 | 0.34 | 301 / 16,568 / 0 | — | 11.9955 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 7 | 12.35 | 20.33 | 20.33 | 22.75 | no baseline | no baseline | 0.09 | 0.15 | 152 / 8,246 / 0 | — | 5.3393 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 4 | 57.04 | 58.59 | 58.59 | 85.27 | no baseline | no baseline | 2.09 | 1.70 | 516 / 31,506 / 0 | — | 7.9668 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 7 | 13.54 | 21.49 | 21.49 | 24.85 | no baseline | no baseline | -0.86 | -0.67 | 276 / 14,136 / 0 | — | 1.7912 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 97.37 | 946.74 | 946.74 | 13671.17 | no baseline | no baseline | 0.93 | 0.73 | 1,373 / 135,195 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 198 | 66.57 | 1711.18 | 3521.58 | 4550.15 | no baseline | no baseline | -1.82 | -1.85 | 0 / 0 / 0 | 3,204 | — | — |
| sandbox.exec | 0 files · uncontended | 141 | 43.05 | 1048.38 | 1699.38 | 7608.51 | no baseline | no baseline | 0.20 | 0.20 | — | 3355.70 | — | — |
| sandbox.exec | 1 files · contended | 24 | 39.46 | 57.87 | 65.93 | 89.39 | no baseline | no baseline | -0.13 | -0.07 | — | 4.70 | 39.46 ms per file | — |
| sandbox.exec | 1 files · uncontended | 35 | 38.97 | 53.33 | 60.41 | 73.74 | no baseline | no baseline | 0.11 | 0.16 | — | 4.70 | 38.972 ms per file | — |
| sandbox.exec | 17–64 files · contended | 5 | 92.39 | 92.79 | 92.79 | 93.72 | no baseline | no baseline | 0.55 | 0.55 | — | 108 | 4.6193 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 7 | 134.43 | 218.70 | 218.70 | 240.84 | no baseline | no baseline | 1.53 | 1.32 | — | 104 | 6.7215 ms per file | — |
| sandbox.exec | 2–4 files · contended | 20 | 57.82 | 1852.03 | 1852.03 | 2484.09 | no baseline | no baseline | 0.54 | 0.44 | — | 10 | 23.2167 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 24 | 44.77 | 59.52 | 71.16 | 72.94 | no baseline | no baseline | 0.58 | 0.38 | — | 10 | 16.36 ms per file | — |
| sandbox.exec | 5–16 files · contended | 23 | 79.85 | 105.17 | 967.56 | 1594.49 | no baseline | no baseline | 0.81 | 0.78 | — | 17.30 | 9.7038 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 37 | 54.06 | 87.22 | 91.94 | 96.84 | no baseline | no baseline | 0.33 | 0.19 | — | 19 | 7.015 ms per file | — |
| sandbox.exec | — · contended | 10 | 3898.05 | 31173.93 | 31173.93 | 33586.21 | no baseline | no baseline | 0.21 | 0.35 | — | 38113.50 | — | — |
| sandbox.exec | — · uncontended | 28 | 295.26 | 21203.41 | 24010.42 | 38138.27 | no baseline | no baseline | -0.51 | -0.65 | — | 38914.80 | — | — |
| sandbox.mount | — · contended | 74 | 16.82 | 44.80 | 70.89 | 931.26 | no baseline | no baseline | 0.37 | 0.33 | 59 / 1,635 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 116 | 12.55 | 28.75 | 40.43 | 113.89 | no baseline | no baseline | 0.20 | 0.18 | 45 / 1,362 / 82 | — | — | sandbox.mount.attach |
| sandbox.status | — · uncontended | 4 | 4.96 | 6.26 | 6.26 | 43.38 | no baseline | no baseline | 0.69 | 0.60 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 61 | 18 | 53.35 | 70.22 | 90.97 | no baseline | no baseline | 0.86 | 0.81 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 129 | 13.74 | 41.86 | 127.86 | 241.48 | no baseline | no baseline | 0.51 | 0.43 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 688.7 KiB | 3,091 | ok 13 |
| branch.diff_commits | branch | 349 | 0.0 KiB | 19.1 MiB | 65,105 | ok 349 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 85.2 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 56 | 2.1 MiB | 0.0 KiB | 67 | Committed 56 |
| fs.diff_files | fs | 49 | 0.0 KiB | 428.6 KiB | 39 | NoSuchPath 10, Text 38, Equal 1 |
| fs.glob | fs | 60 | 0.0 KiB | 65.0 KiB | 854 | ok 60 |
| fs.grep | fs | 62 | 0.0 KiB | 286.3 KiB | 1,054 | ok 62 |
| fs.list | fs | 64 | 0.0 KiB | 245.7 KiB | 1,737 | ok 64 |
| fs.read | fs | 53 | 0.0 KiB | 200.2 KiB | 53 | ok 53 |
| fs.rm | fs | 83 | 0.0 KiB | 0.0 KiB | 83 | Committed 83 |
| fs.stat | fs | 54 | 0.0 KiB | 12.1 KiB | 54 | ok 54 |
| fs.write | fs | 1,261 | 16.9 MiB | 0.0 KiB | 1,261 | Committed 1261 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 195 | 0.0 KiB | 0.0 KiB | 0 | Committed 160, UpToDate 34, Conflict 1 |
| sandbox.exec | sandbox | 562 | 2.3 MiB | 4.8 MiB | 0 | exit:0 559, exit:2 2, exit:1 1 |
| sandbox.mount | sandbox | 200 | 0.0 KiB | 0.0 KiB | 0 | Mounted 200 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 200 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 200 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 3.17 · end 2.96.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.238 | 13.192 · 1.24 · 1.162 · 1.238 · 1.176 | 3.03–3.03 | statements 34, vm_steps 976, fullscan_steps 0, sorts 0, returned_rows 94 |
| read | 1.223 | 1.258 · 1.223 · 1.212 · 1.186 · 1.283 | 3.03–3.03 | statements 19, vm_steps 652, fullscan_steps 0, sorts 0, returned_rows 79 |
| list_small | 1.375 | 1.375 · 1.639 · 1.266 · 1.086 · 1.605 | 3.03–3.03 | statements 19, vm_steps 661, fullscan_steps 0, sorts 0, returned_rows 79 |
| list_largest | 5.287 | 7.66 · 5.301 · 4.944 · 5.287 · 5.124 | 3.03–3.03 | statements 117, vm_steps 11673, fullscan_steps 0, sorts 0, returned_rows 1224 |
| grep_scoped | 1.387 | 1.387 · 1.231 · 1.464 · 1.254 · 1.449 | 3.03–3.03 | statements 24, vm_steps 807, fullscan_steps 0, sorts 0, returned_rows 88 |
| glob_scoped | 1.104 | 1.386 · 1.111 · 1.052 · 1.104 · 1.048 | 3.03–3.03 | statements 18, vm_steps 640, fullscan_steps 0, sorts 0, returned_rows 78 |
| grep_tree | 4756.468 | 4748.895 · 4980.18 · 4870.743 · 4756.468 · 4751.11 | 2.94–3.03 | statements 47474, vm_steps 3779956, fullscan_steps 0, sorts 0, returned_rows 382327 |
| glob_tree | 8.354 | 11.172 · 8.19 · 8.418 · 8.354 · 8.037 | 2.94–2.94 | statements 154, vm_steps 17199, fullscan_steps 0, sorts 0, returned_rows 1791 |
| diff_files | 6.128 | 5.343 · 6.594 · 6.128 · 6.418 · 5.998 | 2.94–2.94 | statements 96, vm_steps 3796, fullscan_steps 0, sorts 0, returned_rows 474 |
| list_commits | 0.74 | 1.59 · 0.754 · 0.74 · 0.666 · 0.673 | 2.94–2.94 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.858 | 3.432 · 3.26 · 2.524 · 2.192 · 2.858 | 2.94–2.94 | statements 63, vm_steps 2228, fullscan_steps 0, sorts 0, returned_rows 275 |
| fork | 0.581 | 1.174 · 0.581 · 0.684 · 0.355 · 0.441 | 2.94–2.94 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 29.496 | 31.234 · 28.04 · 29.496 · 29.982 · 26.759 | 2.94–2.94 | statements 507, vm_steps 22492, fullscan_steps 0, sorts 0, returned_rows 1899 |
| oneshot_mount_unmount | 18.184 | 23.167 · 18.12 · 19.918 · 16.172 · 18.184 | 2.94–2.94 | statements 68, vm_steps 2196, fullscan_steps 82, sorts 2, returned_rows 230 |
| oneshot_commit | 73.976 | 74.28 · 68.198 · 71.567 · 73.976 · 79.031 | 2.94–2.94 | statements 191, vm_steps 12422, fullscan_steps 82, sorts 2, returned_rows 1005 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.94–2.94 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r030: 205,740 pages of 4,096 B, 0 free · Commits 35,417 · Branches 648 · Layers 37 · compression 3.55× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 120,429 | 715.7 MiB |
| 2 | 48,448 | 695.5 MiB |
| 3 | 14,136 | 3.3 MiB |
| 4 | 41 | 8.3 KiB |
| 5 | 14,040 | 1.4 MiB |
| 6 | 81,693 | 404.9 MiB |
| 7 | 195,517 | 46.0 MiB |
| 8 | 378 | 115.5 KiB |
| 9 | 68,955 | 139.6 MiB |
| 10 | 38,091 | 4.7 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,204 | 180.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 36,186 | 67.7 MiB |
| 1 | 43,844 | 499.9 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 152,114 | 594.2 MiB | 21.9 MiB |
| inode_value | 30,564 | 119.4 MiB | 2.5 MiB |
| binding_hint | 8,421 | 32.9 MiB | 3.1 MiB |
| object_location | 8,113 | 31.7 MiB | 3.4 MiB |
| commit | 2,832 | 11.1 MiB | 1.8 MiB |
| file_digest | 1,138 | 4.4 MiB | 531.7 KiB |
| commit_lineage | 769 | 3.0 MiB | 377.7 KiB |
| commit_runs | 748 | 2.9 MiB | 401.5 KiB |
| commit_identity | 544 | 2.1 MiB | 232.8 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 27 | 108.0 KiB | 13.4 KiB |
| branch_names | 10 | 40.0 KiB | 5.5 KiB |
| branch_identity | 9 | 36.0 KiB | 10.6 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 4 | 16.0 KiB | 5.0 KiB |
| layer | 3 | 12.0 KiB | 5.5 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 329.4 s** (tooling): play 141.3 · consolidate 115.9 · verify 26.0 · probes 25.1 · tests 0.0 · seal + snapshot 8.0 · report 13.1

329.43 s tooling: prepare 2.29 · play 139.01 · consolidate 115.96 · verify 14.70 (diff_commits + full compareTree) · version walk 11.27 · probes 25.15 · metrics 0.86 · seal 1.33 · sealed figures 2.78 · snapshot copy 3.88 · report 0.42

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T22:36:46.285Z | optimize | Speed: not judged: baseline not set (pilot); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.335): depth exponent 0.238; Counters: glob_tree.vm_steps per tree file: depth exponent 0.104; Contended work: fs.rm 1 files · contended: SQL VM steps against tree files, exponent 1.573 over 8 ranges |

### G. Evidence

- `~/lfs-history/metrics/range-030.a1.json`
- trace `~/lfs-history/runs/p3-main-t/trace/range-030.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-t/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-030.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r030-2-packages-client | 885 | 341.3 KiB |
| r030-1-root | 265 | 338.3 KiB |
| r030-3-examples-acp-agent | 1,006 | 348.6 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 458.0 | 2,790 |
| `git diff --stat` | 44.0 | 2,777 |
| `git add -f` | 43.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 46.0 | 2,783 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r030-3-examples-acp-agent | end | P1 | pass | — | — |
| r030-3-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r030-3-examples-acp-agent | end | P3 | pass | 235 bookkeeping path(s) | — |
| r030-3-examples-acp-agent | end | P4 | pass | 130 emitted files, exit 1 | — |
| r030-3-examples-acp-agent | end | P5 | n/a | no calibrated file | — |
| r030-3-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r030-1-root | end | P1 | pass | — | — |
| r030-1-root | end | P2 | pass | exit 0 | — |
| r030-1-root | end | P3 | n/a | an install, not a refresh | — |
| r030-1-root | end | P4 | pass | 243 emitted files, exit 2 | — |
| r030-1-root | end | P5 | pass | 37 files | — |
| r030-1-root | end | P6 | n/a | not a repair | — |
| r030-2-packages-client | end | P1 | pass | — | — |
| r030-2-packages-client | end | P2 | pass | exit 0 | — |
| r030-2-packages-client | end | P3 | pass | 235 bookkeeping path(s) | — |
| r030-2-packages-client | end | P4 | pass | 504 emitted files, exit 2 | — |
| r030-2-packages-client | end | P5 | n/a | no calibrated file | — |
| r030-2-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1568 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
