# Range 034 · **watch** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r033 (live Store)
dsh `8e4f66623`..`bc7a89b81` · **61 commits** (9 mainline, 52 side) · 2026-07-23 → 2026-07-24
Areas changed: `examples/acp-agent` 19% · `packages/client` 12% · `/` 12% · other 57%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 15 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.20×** · **Churn 0.00**
**Time split:** play 92.1 s · git 104.1 s · Node 185.7 s · verify 8.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **738.2 MiB** (+2.8 MiB) | **922.8 MiB** (+32.3 MiB) live | **1.25×** (prev 1.21×) | **32.7 MiB** | **1,410** (total 38,594) | **251.9 s** tooling (total 100.1 min) |

**Checks:** 15 pass · 4 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.36× it; Scaling not judged: stat (chain-bounded): 4 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters oneshot_mount_unmount.vm_steps: depth exponent 0.297; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (9 classes too narrow)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ probe grep_scoped −85% · ▼ sandbox.exec p95 −71% · ▲ fs.read p95 +47%
**Budget:** 35 of 202 ranges · projected total 16.0 h (budget 16.8 h) · disk 40% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **373 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 2 publishes |
| Steps | 2,467 / 2,467 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2612 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 381 bin shims, 4094 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **154 picks** in 3 merges (153 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `bc7a89b81`** · 105 commits written for 105 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 153 · Build outputs 1 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r034-1-root | end | `16c4fb997eda` | `f79bfe94cd93` | pass (384 normalized) | pass | n/a | pass | n/a | n/a |
| r034-3-packages-session-query | end | `aa015c81b366` | `3a5989d00918` | pass (381 normalized) | pass | pass | pass | pass | n/a |
| r034-2-packages-client | end | `80e68273f4ee` | `3a5989d00918` | pass (381 normalized) | pass | pass | pass | n/a | n/a |
| lead | repair | `99170a565d6d` | `null` | n/a | pass | n/a | n/a | pass | pass (121,363 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/client/i18n/tests/i18n.spec.ts` (fails natively) · `packages/client/i18n/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/client-loader.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/tree.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/boot.spec.tsx` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/tui-demo/tests/tui-agent.spec.ts` (fails natively) · `packages/host/runtime/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/runtime/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/runtime/tests/host-runtime.spec.ts` (fails natively) · `packages/host/runtime/tests/web-plugins.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/session-query/session-query/tests/session-query.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/session-query/session-query/tests/search-helpers.spec.ts` (fails natively) · `packages/session-query/session-query/tests/session-query.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-question/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/node-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/store.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/tree.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/document-title.spec.tsx` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/agent-loop/tests/inbox.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/invariant.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/properties.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-log.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-recovery.spec.ts` (fails natively) · `packages/core/agent-loop/tests/resume.spec.ts` (fails natively) · `packages/core/agent-loop/tests/scope-lifecycle.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/examples/tui-demo/tests/tui-agent.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/host/runtime/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/runtime/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/runtime/tests/host-runtime.spec.ts` (fails natively) · `packages/host/runtime/tests/web-plugins.spec.ts` (fails natively) · `packages/host/webserver/tests/invariant.spec.ts` (fails natively) · `packages/host/webserver/tests/web-plugins.spec.ts` (fails natively) · `packages/host/webserver/tests/webserver.spec.ts` (fails natively) · `packages/session-persistence/session-checkpoint-policy/tests/session-checkpoint-policy.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/win32.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/example-launch.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/loader-smoke.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/codec.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/modes.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/properties.spec.ts` (fails natively) · `packages/ui/acp/tests/session-list.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/app-boot/tests/app-boot.spec.ts` (fails natively) · `packages/ui/app-boot/tests/config-reload.spec.ts` (fails natively) · `packages/ui/app-boot/tests/personal-config.spec.ts` (fails natively) · `packages/ui/tui/tests/extension.spec.ts` (fails natively) · `packages/ui/tui/tests/file-autocomplete.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively).

## 2. Activity

**3,158 calls** · **148 steps** by **8 agents + lead** on **3 Branches + main** · **198 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +226 added · 986 modified · −166 deleted · 16.5 MiB written · fs 1,250 : Sandbox 128 (**10 : 1**, reported only in P3)
**Execs:** 593 (JS 43 · shell 550) · 3 non-zero exits · install 0 · test runs 6 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,566 | 1,263 | 303 | Committed 1,263 · Text 33 · NoSuchPath 10 · Equal 3 |
| sandbox | 1,187 | 787 | 4 | commit 194 (Committed 162, UpToDate 31, Conflict 1) · exec 593 (exit:0 590, exit:2 3) · mount 198 (Mounted 198) · status 4 · unmount 198 (Unmounted 198) |
| branch | 395 | 32 | 363 | diff_branches 13 · diff_commits 350 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 2 (Added 2) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,158** | **2,082** | **680** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r034-1-root | a01 a02 | 25 | 712 | ✓ | ✓ |
| r034-2-packages-client | a03 a04 a05 | 60 | 282 | ✓ | — |
| r034-3-packages-session-query | a06 a07 a08 | 56 | 332 | ✓ | — |
| main | lead | 7 | 84 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r034-2, a04 after a03 | 0.1 s |
| Stale clean merge | 1 / 1 | r034-2, a03 a04 | merged cleanly |
| Decoy edit | 1 / 1 | r034-2, a04 a05 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r034-2 vs r034-1 publish | 2.6 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r034-1 | 7 | 4 | 3 | 0 | 0 | 483 | — |
| a02 | r034-1 | 18 | 8 | 10 | 0 | 0 | 229 | — |
| a03 | r034-2 | 15 | 6 | 9 | 0 | 0 | 59 | commit-conflict, stale-clean-merge |
| a04 | r034-2 | 29 | 13 | 16 | 0 | 0 | 143 | commit-conflict, stale-clean-merge, decoy |
| a05 | r034-2 | 16 | 8 | 8 | 0 | 0 | 80 | decoy |
| a06 | r034-3 | 15 | 7 | 8 | 0 | 0 | 118 | — |
| a07 | r034-3 | 22 | 9 | 13 | 0 | 0 | 134 | — |
| a08 | r034-3 | 19 | 11 | 8 | 0 | 0 | 80 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 84 | merge-race |
| **Total** |  | **148** | **67** | **75** | **6** | **0** | **1,410** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 113 · pnpm 1 · tsc 3 · vitest 6 · other 470

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r034-2-packages-client | 45 | 45 | 45 | 2 | 45 | 769 |
| r034-3-packages-session-query | 42 | 42 | 42 | 0 | 42 | 726 |
| r034-1-root | 19 | 19 | 19 | 5 | 19 | 376 |
| **lead** | — | — | — | — | 105 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r034-1-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r034-3-packages-session-query | 0 | 1 | 1 | 1 | 22 | 22 / 22 |
| r034-2-packages-client | 0 | 1 | 1 | 0 | 0 | — / — |
| **lead repair** | 1 | — | 1 | — | — | 121,363 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r033) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 735.5 MiB (19.7 MiB / 625.6 MiB / 17.9 MiB / 72.2 MiB) | 738.2 MiB (20.3 MiB / 625.6 MiB / 18.4 MiB / 73.9 MiB) | +2.8 MiB |
| Version figures from | — | incremental (64,838 changed paths) | — |
| Files / directories / symlinks | 54,442 / 8,972 / 4,073 | 54,612 / 9,003 / 4,102 | +170 / +31 / +29 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 890.5 MiB | 922.8 MiB | +32.3 MiB |
| **Space amplification** (total · tracked) | 1.21× · tracked 4.83× | 1.25× · tracked 4.81× | 0.04 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.36** (1.23 / 0.27 / 1.31) | 1.29× the median range |
| **Stored per Commit** | 30.5 KiB | 23.5 KiB | — |
| Metadata share | 0.39 | 0.39 | this range 0.47 |
| History: Commits / Layers / Branches | 37,184 | 38,594 / 20 / 355 | +1,410 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.87 GiB (Commits 7.00 GiB · installs 893.3 MiB · build 107.2 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 42.87 GiB / 40% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 560.5 MiB | 0.76 | +14.2 MiB |
| Metadata | 77.5 MiB | 0.11 | +3.1 MiB |
| Index rows + waste + other (live, not split) | 284.7 MiB | 0.39 | — |
| **Total = Store on disk** | **922.8 MiB** | **= 1.25** space amplification | +32.3 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 20.3 MiB | 97.7 MiB (56.8 MiB + 40.9 MiB) | 4.81× | — | 2.4 MiB | 4.4 MiB | 0.53 |
| `node_modules` | 625.6 MiB | 197.8 MiB (180.8 MiB + 16.9 MiB) | 0.32× | — | 913.6 KiB | 147.1 KiB | 6.21 |
| Build output | 18.4 MiB | 14.7 MiB (13.8 MiB + 1005.3 KiB) | 0.80× | — | 801.8 KiB | 6.9 MiB | 0.11 |
| `.git` | 73.9 MiB | 299.6 MiB (287.9 MiB + 11.7 MiB) | 4.05× | — | 13.2 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 284.7 MiB | — (not divided) | — | 15.1 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 28.3 MiB | — | — | — | — | — |
| **Total** | — | **922.8 MiB** | **= 1.25×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +3,870 | — | 0 (derived) | 53% |
| Chunks (large files) | — (at snapshots) | +887 | — | — | 7% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 4,756 (with inodes, pooled) | — | — | 61% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,148 | — | — | — |

Delta: 3.0% at depth cap · 17% of refused bases stopped by budget · `node_modules` reinstall: absolute: 818490 new stored bytes for 1192 raw changed bytes of 34 changed packages (686.653×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.81× (97.7 MiB for 20.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.8 KiB / 5.4 KiB / 8.1 KiB over 211 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.20× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.7 MiB stored for 1.83 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.42 (3 lanes × 738.2 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.2 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.2 ms / 27.1 ms (1.07×) | 2.8 ms / 6.1 ms (1.29×) | 3.6 ms / 8.2 ms (1.69×) | 24.4 ms / 90.1 ms (1.25×) | 10.8 ms / 22.7 ms (0.88×) | 323 ms / 323 ms (3.87×) | — (native comparison in P3; exec 38.5 ms / 776 ms) |
| SQL p50: 158 stmts | 65 stmts | 70 stmts | 234 stmts | 48 stmts | 8,095 stmts | — |

**Commit cost:** 7.54 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 634 ms p50 over 198
**Slowest:** sandbox.exec 37648 ms · sandbox.exec 30917 ms · sandbox.exec 28824 ms · checkpoint diff_commits 0.10 ms and 1.51 statements per entry (64,665 entries per page)
**Scaling:** 10 of 15 probes flat · `grep_scoped` 2.28 · `diff_files` 1.71 · `list_commits` 3.03 · `diff_commits` 2.02 · `fork` 5.09

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 370 ms / 370 ms | — / — | — | git / status-cold: — |
| git status (steady) | 320 ms / 462 ms | — / — | — | git / status-steady: — |
| git add | 36.0 ms / 107 ms | — / — | — | git / add: — |
| git commit (lane) | 36.0 ms / 74.0 ms | — / — | — | git / commit: — |
| lead writes main | 4669 ms / 4669 ms | — / — | — | — |
| repack | 2559 ms / 2559 ms | — / — | — | — |
| pnpm install (incremental) | 2931 ms / 2931 ms | 1990 ms / 1990 ms | 1.47× | pnpm-reinstall / cold: — |
| pnpm refresh | 2399 ms / 2399 ms | 1869 ms / 1869 ms | 1.28× | pnpm-reinstall / steady: — |
| tsc -b | 7617 ms / 7617 ms | 4874 ms / 6102 ms | 1.56× | tsc-b / cold: — |
| vitest | 3606 ms / 3606 ms | 2445 ms / 2445 ms | 1.47× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.9 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.9 ms / 28.6 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4128272 → 4194304 B · fs.write ≤8 KiB 4128272 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3024112 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 45352 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 9.57 at the first command → 9.28 after the last (max 11.13 over 6 commands) · Docker VM 5.31 → 3.24

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-034.a1)

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

- **a1 (`p3-main-u`, live after r33 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c` from the pinned copy): WATCH, terminal.** Checkpoint ok, git ✓. Node: 15 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,645 emitted). Control `control-034.a1` passes. Report check F1–F8 PASS.
- **P5 n/a at two lane points, from the workload:** at `r034-1-root.end` and `r034-2-packages-client.end` every candidate test fails natively at transform ("Failed to load tsconfig for 'scripts/test-invariants.ts': Tsconfig not found"). Each lane applies only its own area's changes. The root lane's new `tsconfig.json` references packages that other lanes add, so these hybrid lane trees cannot load vitest natively or in LayerFS. P1–P4 pass at both, and the repair's tests run on the merged checkpoint.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` 0 files class, 12.36×). Merge p50 323 ms, 3.87× the baseline. One-shot Commit 1.25× (24.4 ms), write 1.07×; read, list and mount are under the 5 ms floor or below 1×.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 9.3–11.1.
- Final steps: lanes 28 s + 70 s (cut at plan order 29), repair 110 s (first range at the owner's 200 s alarm), verify 12 s, finish 37 s. Repair install 37.6 s, build 20.2 s, tests 3.4 s.
- Watch items: index rows + waste + other 284.7 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 9.77 ms per file over 123 calls, 9,376 VM steps; contended 13.4 ms over 43 (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2467/2467; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.36× it | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 4 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | oneshot_mount_unmount.vm_steps: depth exponent 0.297 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (9 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.468 | < 0.5 | pass |
| Reinstall growth | absolute: 818490 new stored bytes for 1192 raw changed bytes of 34 changed packages (686.653×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0302 (budget 0.1748) | < 0.1 | pass |
| Range growth | 32.7 MiB, 0.97× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.4 | < 0.8 | pass |
| Wall projection | 0.95 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 105 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 15 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 153 · build 1; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.20× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 148 | 148 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1410 | 1294 |
| Workspaces (one-shot share) | 198 (0.99) | 74 (0.973) |
| Reads | 263 | 263 |
| Reconcile writes | 77 | 77 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 355.64 | 355.64 | 355.64 | 355.64 | 4.61× | 4.61× | — | — | 12,634 / 377,299 / 0 | — | 1.488 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 12 | 18.30 | 350.60 | 350.60 | 482.78 | 1.13× | 6.77× | -1.32 | -6.05 | 220 / 24,154 / 0 | — | 0.0767 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 2 | 96.75 | 96.75 | 96.75 | 283.46 | no baseline | no baseline | -22.85 | -39.84 | 2,060 / 115,873 / 0 | — | 0.4887 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 343 | 20.46 | 36.15 | 44.53 | 341.08 | 1.19× | 1.39× | 0.20 | 0.34 | 306 / 33,142 / 0 | — | 0.1075 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 1.22 | 3.55 | 3.55 | 3.63 | 1.34× | 2.69× | 0.90 | 3.83 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.88 | 0.88 | 0.88 | 1.12 | no baseline | no baseline | -1.75 | -4.87 | 70 / 1,298 / 0 | — | 0.0441 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 323.49 | 323.49 | 323.49 | 323.49 | 3.87× | 3.87× | -0.45 | -0.41 | 8,095 / 478,357 / 0 | — | 11.1549 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 378.62 | 378.62 | 378.62 | 378.62 | 4.12× | 4.12× | -3.25 | -6.24 | 9,329 / 576,175 / 0 | — | 2.2537 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.03 | 1.03 | 1.03 | 1.03 | 0.67× | 0.67× | -7.92 | -15.80 | 35 / 517 / 0 | — | 0.0057 ms per entrie | — |
| branch.publish | — · uncontended | 2 | 9.34 | 9.34 | 9.34 | 12.44 | 1.84× | 1.84× | -0.52 | -9.91 | 50 / 1,042 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 28.17 | 28.17 | 28.17 | 28.17 | 1.16× | 1.16× | -5.43 | -10.29 | 199 / 13,512 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 4 | 26.82 | 27.14 | 27.14 | 34.24 | 2.26× | 2.01× | — | — | 532 / 31,765 / 0 | — | 0.1386 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 4 | 8.98 | 10.81 | 10.81 | 11.40 | 1.46× | 1.46× | -0.17 | -1.52 | 190 / 8,996 / 0 | — | 0.0369 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 1 | 18.97 | 18.97 | 18.97 | 18.97 | 1.41× | 1.41× | — | — | 158 / 8,655 / 0 | — | 0.0002 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 23.22 | 23.22 | 23.22 | 23.22 | 2.52× | 1.49× | — | — | 384 / 74,928 / 8,191 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 2 | 6.58 | 6.58 | 6.58 | 8.62 | 0.95× | 0.68× | — | — | 146 / 4,951 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 4 | 10.70 | 18.64 | 18.64 | 34.56 | 1.07× | 1.08× | — | — | 247 / 12,482 / 0 | — | 0.0047 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 12 | 9.07 | 14.12 | 14.12 | 16.94 | 1.39× | 1.30× | 0.74 | 0.01 | 150 / 7,802 / 0 | — | 0.0068 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 9.27 | 9.27 | 9.27 | 35.12 | 1.29× | 1.08× | 1.16 | 0.98 | 201 / 11,249 / 0 | — | 0.1067 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 16 | 7.26 | 13.59 | 13.59 | 14.58 | 1.24× | 1.69× | 1.03 | 0.47 | 173 / 8,640 / 0 | — | 0.0326 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 9 | 12.40 | 16.90 | 16.90 | 17.11 | 2.29× | 2.80× | 5.95 | 11.47 | 238 / 14,585 / 0 | — | 0.0009 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 6 | 9.06 | 11.29 | 11.29 | 13.76 | 1.46× | 1.22× | 0.09 | -1.24 | 118 / 4,983 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 8.32 | 8.32 | 8.32 | 15.23 | 1.38× | 1.29× | -2.74 | -5.75 | 340 / 13,761 / 0 | — | 0.0021 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 6 | 6.14 | 12.29 | 12.29 | 20.39 | 0.83× | 1.53× | -5.32 | -11.67 | 134 / 6,113 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 5 | 7.08 | 7.78 | 7.78 | 8.98 | 2.55× | 2.80× | 5.89 | 12.35 | 109 / 10,170 / 0 | — | 0.2277 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 5.03 | 5.53 | 5.53 | 5.69 | 1.78× | 1.46× | -0.16 | -0.41 | 65 / 5,785 / 0 | — | 0.111 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.89 | 2.89 | 2.89 | 7.73 | 1.59× | 1.59× | 4.20 | 6.79 | 74 / 4,742 / 0 | — | 0.723 ms per file | — |
| fs.glob | 2–4 files · uncontended | 6 | 1.97 | 2.67 | 2.67 | 4.07 | 1.12× | 1.38× | -0.20 | -1.94 | 47 / 2,959 / 0 | — | 0.6197 ms per file | — |
| fs.glob | 5–16 files · contended | 3 | 4.19 | 4.19 | 4.19 | 4.33 | 2.50× | 2.50× | 0.64 | 2.49 | 96 / 5,502 / 0 | — | 0.3813 ms per file | — |
| fs.glob | 5–16 files · uncontended | 10 | 2.53 | 6.22 | 6.22 | 6.76 | 1.26× | 2.73× | -2.11 | -4.89 | 56 / 3,646 / 0 | — | 0.3886 ms per file | — |
| fs.glob | >64 files · contended | 5 | 7.76 | 8.79 | 8.79 | 11.07 | 1.43× | 1.63× | -4.79 | -5.92 | 230 / 20,403 / 0 | — | 0.0607 ms per file | — |
| fs.glob | >64 files · uncontended | 5 | 33.70 | 34.61 | 34.61 | 76.17 | 3.43× | 2.46× | 21.20 | 52.06 | 165 / 22,869 / 0 | — | 0.0394 ms per file | — |
| fs.grep | 17–64 files · contended | 3 | 11.20 | 11.20 | 11.20 | 17.42 | 1.87× | 1.87× | -1.07 | -1.84 | 251 / 13,555 / 0 | — | 0.3841 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 6 | 9.88 | 14.29 | 14.29 | 15.94 | 1.72× | 2.38× | 9.85 | 20.41 | 184 / 10,674 / 0 | — | 0.2297 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 3.23 | 3.23 | 3.23 | 10.19 | 0.82× | 0.81× | — | — | 100 / 4,727 / 0 | — | 0.9637 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 8 | 2.46 | 4.05 | 4.05 | 4.51 | 1.07× | 1.27× | 3.85 | 5.58 | 57 / 3,523 / 0 | — | 0.821 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 5 | 6.72 | 20.39 | 20.39 | 22.20 | 2.27× | 4.04× | 7.77 | 14.15 | 192 / 10,362 / 0 | — | 1.3448 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 5.77 | 16.89 | 16.89 | 19.52 | 1.54× | 2.82× | 2.73 | 5.58 | 110 / 6,916 / 0 | — | 0.7215 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 10.65 | 10.65 | 10.65 | 16.74 | 0.68× | 0.68× | -10.48 | -17.77 | 337 / 13,702 / 0 | — | 0.0942 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 18.70 | 21.80 | 21.80 | 25.55 | 1.03× | 0.95× | 6.18 | 10.05 | 433 / 26,032 / 0 | — | 0.1469 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 3 | 2.71 | 2.71 | 2.71 | 2.74 | 1.61× | 1.61× | — | — | 44 / 2,830 / 0 | — | 2.71 ms per entrie | — |
| fs.list | 17–64 entries · contended | 8 | 5.86 | 9.84 | 9.84 | 11.16 | 2.44× | 4.09× | 3.07 | 6.36 | 124 / 12,208 / 0 | — | 0.176 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 9 | 4.65 | 7.02 | 7.02 | 7.15 | 1.86× | 2.40× | 0.23 | 1.19 | 90 / 8,271 / 0 | — | 0.093 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 2.99 | 2.99 | 2.99 | 4.17 | 1.28× | 1.28× | — | — | 41 / 3,516 / 0 | — | 0.9957 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 7 | 2.26 | 4.11 | 4.11 | 7.92 | 1.20× | 2.01× | 2.84 | 3.22 | 47 / 3,236 / 0 | — | 0.566 ms per entrie | — |
| fs.list | 5–16 entries · contended | 6 | 3.26 | 5.60 | 5.60 | 9.30 | 1.40× | 1.97× | -5.48 | -9.83 | 124 / 6,887 / 0 | — | 0.5055 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 11 | 3.21 | 3.87 | 3.87 | 5.61 | 1.69× | 1.01× | 3.79 | 7.37 | 62 / 4,321 / 0 | — | 0.5176 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 4.02 | 4.02 | 4.02 | 6.12 | 1.81× | 1.81× | — | — | 81 / 4,736 / 0 | — | 0.0052 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 3 | 2.80 | 2.80 | 2.80 | 4.54 | 1.77× | 1.77× | 1.82 | 2.17 | 65 / 3,704 / 0 | — | 0.0051 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 2.90 | 2.90 | 2.90 | 2.90 | no baseline | no baseline | — | — | 68 / 5,140 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 3.34 | 3.34 | 3.34 | 3.34 | 1.20× | 1.20× | -4.36 | -8.27 | 69 / 4,433 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 13 | 2.79 | 7.76 | 7.76 | 9.29 | 1.33× | 1.31× | -3.60 | -9.15 | 86 / 4,187 / 0 | — | 0.0014 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 18 | 2.67 | 4.66 | 4.66 | 5.05 | 1.29× | 1.30× | 0.44 | 0.68 | 57 / 3,236 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 43 | 13.38 | 31.44 | 43.82 | 83.45 | 1.27× | 2.22× | 9.54 | 16.65 | 185 / 11,969 / 0 | — | 13.375 ms per file | commit |
| fs.rm | 1 files · uncontended | 123 | 9.77 | 18.46 | 20.97 | 27.05 | 1.46× | 1.65× | 2.81 | 1.16 | 153 / 9,376 / 0 | — | 9.767 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 2 | 2.79 | 2.79 | 2.79 | 3.97 | 1.29× | 1.25× | — | — | 50 / 4,236 / 0 | — | 0.0059 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 3 | 2.73 | 2.73 | 2.73 | 3.58 | 1.78× | 1.78× | -1.81 | -3.19 | 59 / 3,488 / 0 | — | 0.0067 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 3.32 | 3.32 | 3.32 | 3.32 | 1.58× | 1.58× | 5.95 | 10.08 | 41 / 3,557 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 5 | 2.40 | 2.49 | 2.49 | 5.51 | 0.92× | 0.73× | -3.75 | -9.90 | 65 / 3,348 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.38 | 3.40 | 3.40 | 5.06 | 1.21× | 1.58× | 10.85 | 18.52 | 44 / 3,371 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 9 | 3.25 | 4.34 | 4.34 | 4.63 | 1.45× | 1.45× | 1.93 | 3.74 | 78 / 4,402 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 10 | 2.27 | 3.41 | 3.41 | 6.42 | 1.35× | 0.98× | 0.22 | 0.15 | 46 / 3,154 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 50 | 13.52 | 60.61 | 240.85 | 255.73 | 1.59× | 4.07× | -2.69 | -5.56 | 212 / 12,063 / 0 | — | 0.0173 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 137 | 8.67 | 14.51 | 19.81 | 27.07 | 1.36× | 1.38× | -2.32 | -3.98 | 144 / 7,209 / 0 | — | 0.0111 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 13 | 24.21 | 29.08 | 29.08 | 29.48 | 1.50× | 1.81× | 2.87 | 8.78 | 437 / 24,211 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 27 | 11.92 | 15.03 | 15.94 | 34.10 | 1.45× | 1.82× | 1.86 | 3.87 | 145 / 7,479 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 92 | 16.11 | 31.14 | 37.34 | 73.84 | 1.63× | 1.42× | 1.90 | 3.48 | 387 / 20,854 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 147 | 8.25 | 14.95 | 20.84 | 48.67 | 1.14× | 1.10× | 0.81 | 1.07 | 149 / 6,167 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 225 | 15.27 | 34.65 | 79.86 | 240.56 | 1.56× | 1.54× | 0.42 | 1.32 | 320 / 18,856 / 0 | — | 0.0057 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 365 | 7.74 | 14.42 | 20.28 | 42.38 | 1.07× | 1.04× | 0.69 | 0.87 | 145 / 6,773 / 0 | — | 0.0042 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.94 | 0.94 | 0.94 | 0.94 | 1.24× | 1.24× | -2.58 | -2.36 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 45 | 35.88 | 73.21 | 90.13 | 102.92 | 1.70× | 2.10× | 3.07 | 7.78 | 551 / 39,997 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 62 | 26.02 | 46.53 | 58.21 | 213.25 | 1.25× | 1.34× | 0.90 | 2.69 | 266 / 26,943 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 9 | 4.63 | 6.21 | 6.21 | 15.03 | 1.20× | 0.77× | 5.91 | 13.13 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 22 | 3.74 | 5.70 | 9.57 | 41.89 | 0.93× | 1.12× | -0.15 | 0.35 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 9 | 14.91 | 20.48 | 20.48 | 28.34 | 1.55× | 1.06× | 1.25 | 4.58 | 145 / 6,211 / 0 | — | 14.915 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 5 | 11.18 | 13.24 | 13.24 | 16.99 | 1.35× | 1.08× | 2.71 | 6.35 | 125 / 5,652 / 0 | — | 11.182 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 380.98 | 380.98 | 380.98 | 380.98 | 10.00× | 10.00× | 9.45 | 16.90 | 16,009 / 570,563 / 8,191 | — | 380.983 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 24.68 | 24.68 | 24.68 | 24.68 | no baseline | no baseline | — | — | 370 / 20,511 / 0 | — | 1.4518 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 3 | 10.58 | 10.58 | 10.58 | 12.74 | 0.71× | 0.54× | 2.42 | 4.33 | 172 / 5,039 / 0 | — | 3.185 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 15 | 10.64 | 13.31 | 13.31 | 25.01 | 1.00× | 0.78× | 2.20 | 3.19 | 120 / 4,769 / 0 | — | 4.0987 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 37.70 | 37.70 | 37.70 | 57.43 | 2.29× | 2.29× | 18.15 | 31.38 | 423 / 23,055 / 0 | — | 5.3856 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 11.70 | 16.44 | 16.44 | 18.90 | 0.85× | 1.20× | -3.48 | -7.14 | 150 / 6,034 / 0 | — | 2.3406 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 124.16 | 124.16 | 124.16 | 124.16 | no baseline | no baseline | 5.82 | 10.28 | 1,678 / 216,746 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 112.78 | 853.07 | 853.07 | 13615.57 | 1.63× | 12.36× | 3.74 | 8.60 | 1,558 / 96,713 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 198 | 44.49 | 792.41 | 2935.03 | 4710.69 | 0.87× | 2.06× | -30.58 | -70.17 | — | 3,412 | — | — |
| sandbox.exec | 0 files · uncontended | 142 | 34.62 | 639.06 | 813.30 | 6489.99 | 1.09× | 2.23× | 0.36 | 1.07 | — | 3,478 | — | — |
| sandbox.exec | 1 files · contended | 37 | 38.35 | 51.69 | 53.79 | 73.05 | 1.04× | 0.61× | 3.08 | 6.32 | 0 / 0 / 0 | 4 | 38.351 ms per file | — |
| sandbox.exec | 1 files · uncontended | 14 | 29.82 | 39.32 | 39.32 | 48.24 | 0.89× | 0.58× | -0.53 | -2.36 | — | 6 | 29.822 ms per file | — |
| sandbox.exec | 17–64 files · contended | 15 | 39.50 | 78.53 | 78.53 | 84.82 | 0.57× | 1.12× | -12.03 | -21.14 | — | 21.10 | 2.3236 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 63.69 | 63.69 | 63.69 | 84.89 | 0.91× | 0.91× | -2.96 | -5.12 | — | 93 | 3.1846 ms per file | — |
| sandbox.exec | 2–4 files · contended | 24 | 36.59 | 42.85 | 58.60 | 107.73 | 0.94× | 0.61× | -0.44 | -1.71 | — | 9.30 | 13.3847 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 65 | 39.15 | 65.67 | 114.35 | 130.54 | 1.03× | 1.00× | -1.47 | -4.08 | — | 8.40 | 16.4165 ms per file | — |
| sandbox.exec | 5–16 files · contended | 28 | 43.53 | 83.12 | 84.45 | 90.32 | 0.74× | 1.14× | 5.44 | 7.92 | — | 17 | 5.0847 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 22 | 41.92 | 66.84 | 67.68 | 75.46 | 0.59× | 0.64× | -5.74 | -10.55 | — | 20.70 | 6.3418 ms per file | — |
| sandbox.exec | — · contended | 10 | 3117.77 | 28824.23 | 28824.23 | 30916.87 | no baseline | no baseline | -4.26 | -10.86 | — | 36,418 | — | — |
| sandbox.exec | — · uncontended | 26 | 269.21 | 13233.35 | 20172.86 | 37647.60 | 0.51× | 1.86× | 2.50 | 7.40 | — | 39317.40 | — | — |
| sandbox.mount | — · contended | 80 | 13.11 | 31.08 | 46.60 | 75.88 | 1.17× | 1.63× | 2.88 | 6.68 | 54 / 1,524 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 108 | 9.90 | 19.32 | 25.54 | 54.64 | 0.88× | 0.96× | 0.14 | -0.03 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.50 | 3.71 | 3.71 | 94.24 | no baseline | no baseline | -0.25 | -2.26 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 67 | 12.83 | 25.02 | 49.27 | 49.33 | 1.21× | 1.38× | 0.78 | 1.35 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 121 | 11.64 | 30.28 | 138.94 | 224.61 | 1.11× | 1.65× | 0.83 | 1.00 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 694.6 KiB | 3,045 | ok 13 |
| branch.diff_commits | branch | 350 | 0.0 KiB | 19.2 MiB | 65,484 | ok 350 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.6 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 41 | 1.3 MiB | 0.0 KiB | 52 | Committed 41 |
| fs.diff_files | fs | 46 | 0.0 KiB | 363.7 KiB | 36 | Text 33, NoSuchPath 10, Equal 3 |
| fs.glob | fs | 54 | 0.0 KiB | 57.5 KiB | 685 | ok 54 |
| fs.grep | fs | 53 | 0.0 KiB | 175.7 KiB | 797 | ok 53 |
| fs.list | fs | 58 | 0.0 KiB | 259.4 KiB | 1,678 | ok 58 |
| fs.read | fs | 44 | 0.0 KiB | 136.3 KiB | 44 | ok 44 |
| fs.rm | fs | 166 | 0.0 KiB | 0.0 KiB | 166 | Committed 166 |
| fs.stat | fs | 48 | 0.0 KiB | 10.8 KiB | 48 | ok 48 |
| fs.write | fs | 1,056 | 14.4 MiB | 0.0 KiB | 1,056 | Committed 1056 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 194 | 0.0 KiB | 0.0 KiB | 0 | Committed 162, UpToDate 31, Conflict 1 |
| sandbox.exec | sandbox | 593 | 3.6 MiB | 3.4 MiB | 0 | exit:0 590, exit:2 3 |
| sandbox.mount | sandbox | 198 | 0.0 KiB | 0.0 KiB | 0 | Mounted 198 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 198 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 198 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 5.31 · end 3.24.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.175 | 15.737 · 1.247 · 1.024 · 0.958 · 1.175 | 4.07–4.07 | statements 26, vm_steps 952, fullscan_steps 0, sorts 0, returned_rows 80 |
| read | 1.01 | 1.191 · 1.083 · 1.01 · 0.995 · 1.004 | 4.07–4.07 | statements 15, vm_steps 712, fullscan_steps 0, sorts 0, returned_rows 69 |
| list_small | 1.027 | 1.211 · 1.177 · 1.027 · 0.891 · 0.961 | 4.07–4.07 | statements 15, vm_steps 721, fullscan_steps 0, sorts 0, returned_rows 69 |
| list_largest | 5.305 | 7.751 · 5.319 · 5.305 · 5.101 · 4.898 | 4.07–4.07 | statements 120, vm_steps 13651, fullscan_steps 0, sorts 0, returned_rows 1364 |
| grep_scoped | 1.103 | 1.407 · 1.103 · 1.054 · 1.025 · 1.429 | 4.07–4.07 | statements 20, vm_steps 867, fullscan_steps 0, sorts 0, returned_rows 78 |
| glob_scoped | 0.951 | 1.073 · 0.949 · 0.951 · 0.958 · 0.894 | 4.07–4.07 | statements 14, vm_steps 700, fullscan_steps 0, sorts 0, returned_rows 68 |
| grep_tree | 4502.999 | 4727.438 · 4706.608 · 4502.999 · 4406.916 · 4425.679 | 3.48–3.82 | statements 49012, vm_steps 3854362, fullscan_steps 0, sorts 0, returned_rows 388161 |
| glob_tree | 7.089 | 8.294 · 6.9 · 7.208 · 6.977 · 7.089 | 3.48–3.48 | statements 131, vm_steps 18389, fullscan_steps 0, sorts 0, returned_rows 1905 |
| diff_files | 5.57 | 5.553 · 5.57 · 5.759 · 5.744 · 5.532 | 3.48–3.48 | statements 72, vm_steps 4156, fullscan_steps 0, sorts 0, returned_rows 414 |
| list_commits | 1.302 | 1.558 · 1.302 · 0.837 · 1.439 · 1.01 | 3.48–3.48 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.97 | 3.6 · 2.758 · 3.149 · 2.97 · 2.924 | 3.48–3.48 | statements 59, vm_steps 2480, fullscan_steps 0, sorts 0, returned_rows 297 |
| fork | 1.214 | 1.221 · 1.214 · 0.686 · 1.52 · 0.563 | 3.48–3.48 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 25.507 | 28.674 · 25.507 · 23.72 · 23.721 · 54.238 | 3.48–3.48 | statements 455, vm_steps 22668, fullscan_steps 0, sorts 0, returned_rows 1849 |
| oneshot_mount_unmount | 17.985 | 20.086 · 16.819 · 18.67 · 15.593 · 17.985 | 3.44–3.48 | statements 60, vm_steps 2172, fullscan_steps 82, sorts 2, returned_rows 216 |
| oneshot_commit | 66.902 | 67.936 · 66.902 · 67.298 · 65.237 · 54.703 | 3.44–3.44 | statements 167, vm_steps 11889, fullscan_steps 82, sorts 2, returned_rows 958 |
| oneshot_exec | — |  ·  ·  ·  ·  | 3.44–3.48 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 251.9 s** (tooling): play 93.8 · consolidate 107.0 · verify 16.1 · probes 23.7 · tests 0.0 · seal + snapshot 0.0 · report 11.3

251.86 s tooling: prepare 1.68 · play 92.11 · consolidate 106.95 · verify 8.72 (diff_commits) · version walk 7.41 · probes 23.72 · metrics 0.83 · Store allocation 0.27 · report 0.36

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T00:28:53.820Z | watch | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.36× it; Scaling: not judged: stat (chain-bounded): 4 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: oneshot_mount_unmount.vm_steps: depth exponent 0.297; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (9 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-034.a1.json`
- trace `~/lfs-history/runs/p3-main-u/trace/range-034.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-u/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r034-2-packages-client | 769 | 366.3 KiB |
| r034-3-packages-session-query | 726 | 366.7 KiB |
| r034-1-root | 376 | 363.1 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 320.0 | 2,968 |
| `git diff --stat` | 35.0 | 2,956 |
| `git add -f` | 36.0 | — |
| `git rm --cached` | 11.0 | — |
| `git commit` | 36.0 | 2,961 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r034-1-root | end | P1 | pass | — | — |
| r034-1-root | end | P2 | pass | exit 0 | — |
| r034-1-root | end | P3 | n/a | an install, not a refresh | — |
| r034-1-root | end | P4 | pass | 244 emitted files, exit 2 | — |
| r034-1-root | end | P5 | n/a | no calibrated file | — |
| r034-1-root | end | P6 | n/a | not a repair | — |
| r034-3-packages-session-query | end | P1 | pass | — | — |
| r034-3-packages-session-query | end | P2 | pass | exit 0 | — |
| r034-3-packages-session-query | end | P3 | pass | 241 bookkeeping path(s) | — |
| r034-3-packages-session-query | end | P4 | pass | 110 emitted files, exit 2 | — |
| r034-3-packages-session-query | end | P5 | pass | 22 files | — |
| r034-3-packages-session-query | end | P6 | n/a | not a repair | — |
| r034-2-packages-client | end | P1 | pass | — | — |
| r034-2-packages-client | end | P2 | pass | exit 0 | — |
| r034-2-packages-client | end | P3 | pass | 241 bookkeeping path(s) | — |
| r034-2-packages-client | end | P4 | pass | 433 emitted files, exit 2 | — |
| r034-2-packages-client | end | P5 | n/a | no calibrated file | — |
| r034-2-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1645 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
