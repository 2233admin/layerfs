# Range 037 · **watch** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r036 (live Store)
dsh `f9a638b8a`..`a519412b4` · **75 commits** (13 mainline, 62 side) · 2026-07-25 → 2026-07-26
Areas changed: `.agents/notes` 20% · `packages/client` 12% · `examples/acp-agent` 9% · other 60%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 20 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.23×** · **Churn 0.00**
**Time split:** play 97.4 s · git 140.4 s · Node 221.4 s · verify 12.1 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **747.0 MiB** (+2.9 MiB) | **1021.6 MiB** (+38.0 MiB) | **1.37×** (prev 1.32×) | **44.4 MiB** | **1,894** (total 44,313) | **265.3 s** tooling (total 112.3 min) |

**Checks:** 15 pass · 4 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.24× it; Scaling not judged: stat (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters not judged: stat.statements (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ sandbox.mount p95 +52% · ▼ sandbox.commit p95 −26% · ▲ range time +24%
**Budget:** 38 of 202 ranges · projected total 15.7 h (budget 16.8 h) · disk 37% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **3,470 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 1 publish |
| Steps | 3,535 / 3,535 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2672 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 389 bin shims, 4144 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **232 picks** in 4 merges (231 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `a519412b4`** · 113 commits written for 113 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 231 · Build outputs 1 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r037-1-agents-notes | end | `1c40129e7a60` | `f3e5c0d9bbe5` | pass (385 normalized) | pass | pass | pass | pass | n/a |
| r037-2-examples-acp-agent | end | `a6082beef39d` | `f3e5c0d9bbe5` | pass (385 normalized) | pass | pass | pass | n/a | n/a |
| r037-3-packages-client | end | `22ac1e741722` | `f3e5c0d9bbe5` | pass (385 normalized) | pass | pass | pass | n/a | n/a |
| r037-4-root | end | `9d2aaba32a99` | `3fbc215e18f5` | pass (393 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `b9ed52968c51` | `null` | n/a | pass | n/a | n/a | pass | pass (121,677 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/plan/plan-mode/tests/integration.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/sdk/create-sdk/tests/create.spec.ts` (fails natively) · `packages/sdk/helper/tests/documents.spec.ts` (fails natively) · `packages/sdk/helper/tests/headless-prompt-port.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/sdk/helper/tests/questions.spec.ts` (fails natively) · `packages/sdk/scripts/tests/scripts.spec.ts` (fails natively) · `packages/session-query/session-query-sqlite/tests/query.spec.ts` (fails natively) · `packages/session-query/session-query-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-query/session-query/tests/search-helpers.spec.ts` (fails natively) · `packages/session-query/session-query/tests/session-query.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/normalize.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/hmr/tests/node-half.spec.ts` (fails natively) · `packages/client/i18n/tests/i18n.spec.ts` (fails natively) · `packages/client/i18n/tests/invariant.spec.ts` (fails natively) · `packages/client/modules/tests/loader.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/session-intents.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-question/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/node-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/rows.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/tree.spec.ts` (fails natively) · `packages/client/ui-slots/tests/core.spec.ts` (fails natively) · `packages/client/ui-slots/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-slots/tests/surface.spec.ts` (fails natively) · `packages/client/ui-slots/tests/type-chain.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/cell.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/layout.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/web-react/tests/bind.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots-real-core.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots.spec.tsx` (fails natively) · `packages/client/web-react/tests/session-provider.spec.tsx` (fails natively) · `packages/client/web-react/tests/stale-authorization.spec.tsx` (fails natively) · `packages/client/web-react/tests/use-invoke.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/document-title.spec.tsx` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/host/runtime/tests/host-runtime.spec.ts` (fails natively) · `packages/host/webserver/tests/web-plugins.spec.ts` (fails natively) · `packages/host/webserver/tests/webserver.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/serialize.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/sse.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/translate.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/convert.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/loader-composition.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/persistence.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/retry.spec.ts` (fails natively) · `packages/llm/llm/tests/assembler.spec.ts` (fails natively) · `packages/llm/llm/tests/attribution.spec.ts` (fails natively) · `packages/llm/llm/tests/call-config.spec.ts` (fails natively) · `packages/llm/llm/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm/tests/properties.spec.ts` (fails natively) · `packages/llm/llm/tests/service.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/apply.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/load-path.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/win32.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/invariant.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/acp/acp/tests/edges.spec.ts` (fails natively) · `packages/context/session-reference/tests/session-reference.spec.ts` (fails natively) · `packages/acp/acp/tests/bridge.spec.ts` (fails natively) · `packages/storage/storage-json/tests/json-backend.spec.ts` (fails natively) · `packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts` (fails natively) · `packages/acp/acp/tests/multi-session.spec.ts` (fails natively) · `packages/acp/acp/tests/dispose.spec.ts` (fails natively) · `packages/acp/acp/tests/turns.spec.ts` (fails natively).

## 2. Activity

**4,359 calls** · **240 steps** by **9 agents + lead** on **4 Branches + main** · **312 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +223 added · 1,439 modified · −145 deleted · 27.2 MiB written · fs 1,654 : Sandbox 153 (**11 : 1**, reported only in P3)
**Execs:** 866 (JS 82 · shell 784) · 4 non-zero exits · install 0 · test runs 4 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,134 | 1,667 | 467 | Committed 1,663 · Text 51 · NoSuchPath 21 · Equal 2 · UpToDate 4 |
| sandbox | 1,804 | 1,175 | 5 | commit 309 (Committed 245, UpToDate 63, Conflict 1) · exec 866 (exit:0 862, exit:2 4) · mount 312 (Mounted 312) · status 5 · unmount 312 (Unmounted 312) |
| branch | 410 | 34 | 376 | diff_branches 19 · diff_commits 357 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,359** | **2,876** | **859** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r037-1-agents-notes | a01 a02 a03 | 61 | 435 | ✓ | — |
| r037-2-examples-acp-agent | a04 a05 | 63 | 440 | ✓ | — |
| r037-3-packages-client | a06 a07 | 53 | 425 | ✓ | — |
| r037-4-root | a08 a09 | 56 | 437 | ✓ | — |
| main | lead | 7 | 157 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r037-2, a05 after a04 | 0.1 s |
| Stale clean merge | 1 / 1 | r037-2, a04 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r037-2, a05 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r037-1 | 19 | 9 | 10 | 0 | 0 | 299 | — |
| a02 | r037-1 | 27 | 15 | 12 | 0 | 0 | 89 | — |
| a03 | r037-1 | 15 | 6 | 9 | 0 | 0 | 47 | — |
| a04 | r037-2 | 40 | 16 | 24 | 0 | 0 | 368 | commit-conflict, stale-clean-merge, decoy |
| a05 | r037-2 | 23 | 8 | 15 | 0 | 0 | 72 | commit-conflict, stale-clean-merge, decoy |
| a06 | r037-3 | 19 | 9 | 10 | 0 | 0 | 209 | — |
| a07 | r037-3 | 34 | 19 | 15 | 0 | 0 | 216 | — |
| a08 | r037-4 | 26 | 11 | 15 | 0 | 0 | 161 | — |
| a09 | r037-4 | 30 | 13 | 17 | 0 | 0 | 276 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 157 | — |
| **Total** |  | **240** | **107** | **127** | **6** | **0** | **1,894** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 174 · pnpm 1 · tsc 4 · vitest 4 · other 683

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r037-1-agents-notes | 44 | 44 | 44 | 4 | 44 | 771 |
| r037-3-packages-client | 41 | 41 | 41 | 6 | 41 | 827 |
| r037-4-root | 39 | 39 | 39 | 7 | 39 | 657 |
| r037-2-examples-acp-agent | 42 | 42 | 41 | 2 | 42 | 719 |
| **lead** | — | — | — | — | 113 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r037-1-agents-notes | 0 | 1 | 1 | 1 | 15 | 15 / 15 |
| r037-2-examples-acp-agent | 0 | 1 | 1 | 0 | 0 | — / — |
| r037-3-packages-client | 0 | 1 | 1 | 0 | 0 | — / — |
| r037-4-root | 1 | 0 | 1 | 1 | 90 | 90 / 90 |
| **lead repair** | 1 | — | 1 | — | — | 121,677 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r036) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 744.1 MiB (22.0 MiB / 625.6 MiB / 18.6 MiB / 77.8 MiB) | 747.0 MiB (20.9 MiB / 625.7 MiB / 19.6 MiB / 80.9 MiB) | +2.9 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 55,026 / 9,016 / 4,106 | 55,311 / 9,061 / 4,152 | +285 / +45 / +46 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 983.6 MiB | 1021.6 MiB | +38.0 MiB |
| **Space amplification** (total · tracked) | 1.32× · tracked 4.76× | 1.37× · tracked 5.15× | 0.05 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.56** (1.46 / 0.23 / 0.75) | 0.87× the median range |
| **Stored per Commit** | 12.8 KiB | 20.3 KiB | — |
| Metadata share | 0.40 | 0.40 | this range 0.41 |
| History: Commits / Layers / Branches | 42,419 | 44,313 / 23 / 447 | +1,894 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.91 GiB (Commits 6.95 GiB · installs 886.9 MiB · build 105.2 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 42.21 GiB / 37% | — |
| Snapshot | — | r037, 886.6 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 610.7 MiB | 0.82 | +22.5 MiB |
| Metadata | 89.0 MiB | 0.12 | +3.9 MiB |
| Index rows | 271.5 MiB | 0.36 | — |
| Waste | 49.1 MiB | 0.07 | — |
| Other | 1.2 MiB | 0.00 | — |
| **Total = Store on disk** | **1021.6 MiB** | **= 1.37** space amplification | +38.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 20.9 MiB | 107.4 MiB (60.5 MiB + 46.9 MiB) | 5.15× | — | 2.7 MiB | 8.0 MiB | 0.33 |
| `node_modules` | 625.7 MiB | 200.4 MiB (180.9 MiB + 19.5 MiB) | 0.32× | — | 927.7 KiB | 164.4 KiB | 5.64 |
| Build output | 19.6 MiB | 16.9 MiB (15.7 MiB + 1.1 MiB) | 0.86× | — | 1.3 MiB | 7.3 MiB | 0.18 |
| `.git` | 80.9 MiB | 346.1 MiB (332.4 MiB + 13.7 MiB) | 4.28× | — | 21.0 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 321.9 MiB | — (not divided) | — | 11.5 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 28.9 MiB | — | — | — | — | — |
| **Total** | — | **1021.6 MiB** | **= 1.37×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 146,140 | +6,340 | 6.2 KiB | 0 (derived) | 50% |
| Chunks (large files) | 54,418 | +1,347 | 15.1 KiB | — | 8% |
| Large-file extents | 15,063 | — | 0.3 KiB | — | — |
| Directories | 278,607 | 5,658 (with inodes, pooled) | 0.2 KiB | — | 64% |
| Inodes and attributes | 275,835 | ↑ pooled | 2.7 KiB | — | — |
| Symlinks | 2,290 | +4,272 | 0.1 KiB | — | — |

Delta: 2.4% at depth cap · 19% of refused bases stopped by budget · `node_modules` reinstall: absolute: 837442 new stored bytes for 3158 raw changed bytes of 96 changed packages (265.181×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.15× (107.4 MiB for 20.9 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.6 KiB / 7.4 KiB / 11.2 KiB over 279 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.23× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.2 MiB stored for 2.44 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.34 (4 lanes × 747.0 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 1.9 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 7.9 ms / 21.4 ms (0.90×) | 2.5 ms / 3.9 ms (1.14×) | 3.0 ms / 7.1 ms (1.20×) | 20.6 ms / 63.0 ms (1.17×) | 10.3 ms / 20.1 ms (0.88×) | 336 ms / 401 ms (4.36×) | — (native comparison in P3; exec 38.6 ms / 783 ms) |
| SQL p50: 156 stmts | 53 stmts | 56 stmts | 226 stmts | 49 stmts | 8,923 stmts | — |

**Commit cost:** 7.42 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 618 ms p50 over 312
**Slowest:** sandbox.exec 31574 ms · sandbox.exec 27283 ms · sandbox.exec 26878 ms · checkpoint diff_commits 0.09 ms and 1.48 statements per entry (65,642 entries per page)
**Scaling:** 14 of 15 probes flat · `glob_tree` 0.18

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 283 ms / 283 ms | — / — | — | git / status-cold: — |
| git status (steady) | 321 ms / 500 ms | — / — | — | git / status-steady: — |
| git add | 33.0 ms / 84.0 ms | — / — | — | git / add: — |
| git commit (lane) | 39.0 ms / 64.0 ms | — / — | — | git / commit: — |
| lead writes main | 4424 ms / 4424 ms | — / — | — | — |
| repack | 2612 ms / 2612 ms | — / — | — | — |
| pnpm install (incremental) | 2786 ms / 2786 ms | 1740 ms / 1740 ms | 1.60× | pnpm-reinstall / cold: — |
| pnpm refresh | 2746 ms / 2746 ms | 1753 ms / 1753 ms | 1.57× | pnpm-reinstall / steady: — |
| tsc -b | 3136 ms / 11743 ms | 7756 ms / 7997 ms | 0.40× | tsc-b / cold: — |
| vitest | 3696 ms / 3696 ms | 1929 ms / 1929 ms | 1.92× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.9 ms / 21.4 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4194304 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3287792 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 6.33 at the first command → 4.65 after the last (max 8.26 over 7 commands) · Docker VM 1.76 → 2.63

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-037.a1)

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

- **a1 (`p3-main-u`, live after r36 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c` from the pinned copy): WATCH, terminal.** Checkpoint ok, git ✓. Node: 20 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass (1,760 emitted). Control `control-037.a1` passes. Report check F1–F8 PASS.
- **P5 n/a at two lane points, from the workload (as r34):** at `r037-2-examples-acp-agent.end` and `r037-3-packages-client.end` every candidate fails natively at transform ("Failed to load tsconfig … Tsconfig not found"), because those hybrid lane trees lack packages other lanes add. The native repair on the merged checkpoint builds clean (tsc exit 0) and its 30 tests pass, as in LayerFS.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 13.24×: its p95 is the repair's build Commit). Merge p50 336 ms, 4.36× the pilot baseline and inside r23–r36's band. One-shot Commit 1.17×, write 0.90×, mount 0.88×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 4.7–8.3.
- Final steps: lanes 27 s + 19 s + 62 s (cuts at plan orders 28 and 52), repair 104 s (alarm 200 s), verify 16 s, finish 45 s. Repair install 31.6 s, build 20.1 s, tests 3.5 s.
- Watch items: index rows 271.5 MiB (sealed; #366). `fs.rm` uncontended p50 6.38 ms per file over 114 calls, 6,713 VM steps (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3535/3535; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.24× it | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | not judged: stat.statements (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.41 | < 0.5 | pass |
| Reinstall growth | absolute: 837442 new stored bytes for 3158 raw changed bytes of 96 changed packages (265.181×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0243 (budget 0.1938) | < 0.1 | pass |
| Range growth | 44.4 MiB, 1.36× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 2738 ms for 886.6 MiB new; size exponent -0.941 | < 0.15 | pass |
| Disk projection | 0.37 | < 0.8 | pass |
| Wall projection | 0.93 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 113 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 20 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 231 · build 1; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.23× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 240 | 241 |
| Lanes / agents | 4 / 9 | 4 / 9 |
| LayerFS Commits | 1894 | 1715 |
| Workspaces (one-shot share) | 312 (0.99) | 126 (0.984) |
| Reads | 431 | 431 |
| Reconcile writes | 149 | 149 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 19 | 17.62 | 401.62 | 401.62 | 432.41 | 1.08× | 7.76× | -2.37 | -2.57 | 240 / 25,275 / 0 | — | 0.0734 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 6.18 | 6.18 | 6.18 | 6.18 | no baseline | no baseline | — | — | 110 / 6,772 / 0 | — | 1.2368 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 2 | 86.37 | 86.37 | 86.37 | 258.54 | no baseline | no baseline | -3.89 | -3.12 | 1,459 / 102,692 / 0 | — | 0.3891 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 349 | 18.96 | 33.04 | 67.18 | 294.00 | 1.10× | 1.27× | -0.37 | -0.46 | 301 / 32,943 / 0 | — | 0.0998 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.83 | 1.16 | 1.16 | 11.73 | 0.92× | 0.88× | -1.70 | -1.90 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · contended | 1 | 1.10 | 1.10 | 1.10 | 1.10 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0551 ms per entrie | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.92 | 0.92 | 0.92 | 1.04 | no baseline | no baseline | -0.35 | -0.59 | 70 / 1,298 / 0 | — | 0.0462 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 401.16 | 401.16 | 401.16 | 440.61 | 4.36× | 4.36× | -0.65 | -0.63 | 10,263 / 635,369 / 0 | — | 1.5732 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.72 | 1.72 | 1.72 | 1.72 | 1.11× | 1.11× | 0.31 | 0.86 | 35 / 517 / 0 | — | 0.0057 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 6.05 | 6.05 | 6.05 | 6.05 | 1.19× | 1.19× | -3.99 | -4.73 | 45 / 1,014 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 32.01 | 32.01 | 32.01 | 32.01 | 1.31× | 1.31× | 0.32 | 0.64 | 203 / 14,293 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 7 | 10.41 | 16.34 | 16.34 | 36.41 | 0.88× | 1.21× | -6.64 | -5.83 | 299 / 13,550 / 0 | — | 0.0234 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 9 | 7.78 | 9.99 | 9.99 | 10.66 | 1.27× | 1.34× | -0.64 | -0.70 | 142 / 7,980 / 0 | — | 0.012 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 2 | 10.47 | 10.47 | 10.47 | 19.51 | 0.78× | 0.78× | -3.44 | -4.17 | 151 / 6,866 / 0 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 6 | 11.86 | 18.81 | 18.81 | 44.51 | 1.29× | 1.21× | -12.40 | -13.14 | 324 / 19,353 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 25 | 7.32 | 10.32 | 11.79 | 27.37 | 1.06× | 1.07× | — | — | 128 / 5,168 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 24 | 11.12 | 15.99 | 17.01 | 20.28 | 1.11× | 0.93× | -2.39 | -2.19 | 273 / 17,128 / 0 | — | 0.0047 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 68 | 6.30 | 10.92 | 21.14 | 26.64 | 0.97× | 1.01× | -2.33 | -3.01 | 120 / 5,272 / 0 | — | 0.0018 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 14 | 6.60 | 8.91 | 8.91 | 10.24 | 0.92× | 1.04× | -0.75 | -1.41 | 205 / 11,408 / 0 | — | 0.0241 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 20 | 5.39 | 8.53 | 8.53 | 8.88 | 0.92× | 1.06× | -1.39 | -1.94 | 125 / 7,175 / 0 | — | 0.0219 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 5 | 11.60 | 12.72 | 12.72 | 24.82 | 2.14× | 2.11× | 1.56 | 1.37 | 308 / 16,862 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 20 | 6.60 | 11.65 | 11.65 | 15.45 | 1.06× | 1.26× | -2.17 | -2.58 | 165 / 10,118 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 4 | 6.77 | 9.22 | 9.22 | 9.55 | 1.12× | 1.42× | -1.64 | -1.76 | 240 / 11,946 / 0 | — | 0.003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 6 | 6.04 | 7.65 | 7.65 | 7.74 | 0.82× | 0.95× | -1.50 | -1.90 | 161 / 7,882 / 0 | — | 0.0023 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 3 | 4.97 | 4.97 | 4.97 | 6.55 | 1.79× | 1.79× | 0.62 | 0.48 | 116 / 9,906 / 0 | — | 0.172 ms per file | — |
| fs.glob | 17–64 files · uncontended | 4 | 4.20 | 7.94 | 7.94 | 12.43 | 1.48× | 2.09× | -0.46 | -0.72 | 62 / 9,255 / 0 | — | 0.1908 ms per file | — |
| fs.glob | 2–4 files · contended | 3 | 3.52 | 3.52 | 3.52 | 4.88 | 1.94× | 1.94× | 2.67 | 2.79 | 59 / 4,359 / 0 | — | 0.8808 ms per file | — |
| fs.glob | 2–4 files · uncontended | 8 | 2.14 | 3.39 | 3.39 | 8.17 | 1.21× | 1.75× | 0.16 | 0.10 | 42 / 3,147 / 0 | — | 0.7025 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 2.45 | 6.46 | 6.46 | 11.86 | 1.46× | 3.85× | -0.87 | -1.72 | 87 / 5,577 / 0 | — | 0.4902 ms per file | — |
| fs.glob | 5–16 files · uncontended | 20 | 2.80 | 4.63 | 4.63 | 7.43 | 1.39× | 2.03× | -0.24 | -0.11 | 51 / 3,925 / 0 | — | 0.4203 ms per file | — |
| fs.glob | >64 files · contended | 12 | 6.32 | 18.62 | 18.62 | 33.82 | 1.17× | 3.44× | -1.03 | -1.17 | 150 / 13,368 / 0 | — | 0.0271 ms per file | — |
| fs.glob | >64 files · uncontended | 18 | 6.40 | 14.08 | 14.08 | 43.39 | 0.65× | 1.00× | 0.59 | -0.25 | 87 / 12,817 / 0 | — | 0.0284 ms per file | — |
| fs.grep | 1 files · contended | 1 | 1.87 | 1.87 | 1.87 | 1.87 | 1.25× | 1.25× | — | — | 48 / 2,876 / 0 | — | 1.872 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 2 | 1.88 | 1.88 | 1.88 | 3.76 | 0.79× | 0.79× | — | — | 48 / 2,863 / 0 | — | 1.878 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 4 | 6.87 | 7.49 | 7.49 | 13.61 | 1.19× | 1.25× | 2.03 | 1.03 | 168 / 7,431 / 0 | — | 0.2081 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 3.93 | 3.93 | 3.93 | 4.19 | 1.00× | 0.98× | 0.26 | 0.41 | 86 / 5,627 / 0 | — | 0.9927 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 7 | 2.89 | 2.92 | 2.92 | 5.13 | 1.25× | 0.91× | 1.68 | 1.20 | 56 / 3,445 / 0 | — | 0.8673 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 8 | 4.11 | 11.23 | 11.23 | 16.93 | 1.39× | 2.23× | 0.11 | -0.42 | 146 / 6,073 / 0 | — | 0.763 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 21 | 3.64 | 10.47 | 10.47 | 16.02 | 0.97× | 1.74× | 0.44 | 0.49 | 78 / 4,197 / 0 | — | 0.4039 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 6 | 21.14 | 35.97 | 35.97 | 40.92 | 1.35× | 2.29× | 0.57 | 0.66 | 609 / 24,190 / 0 | — | 0.0924 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 20 | 22.91 | 35.45 | 35.45 | 38.19 | 1.26× | 1.54× | 1.51 | 1.19 | 515 / 26,867 / 0 | — | 0.113 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 2 | 1.66 | 1.66 | 1.66 | 1.85 | 0.99× | 0.99× | — | — | 33 / 2,754 / 0 | — | 1.661 ms per entrie | — |
| fs.list | 17–64 entries · contended | 4 | 2.97 | 3.88 | 3.88 | 5.64 | 1.23× | 1.61× | -1.36 | -1.33 | 77 / 5,612 / 0 | — | 0.0593 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 21 | 4.51 | 7.13 | 7.13 | 7.97 | 1.80× | 2.43× | 0.62 | 0.69 | 81 / 6,425 / 0 | — | 0.1218 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 2.17 | 2.17 | 2.17 | 3.27 | 0.93× | 0.93× | -1.28 | -1.61 | 39 / 3,329 / 0 | — | 0.724 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 3 | 2.90 | 2.90 | 2.90 | 3.14 | 1.54× | 1.42× | 1.26 | 0.88 | 50 / 4,656 / 0 | — | 0.9653 ms per entrie | — |
| fs.list | 5–16 entries · contended | 8 | 2.83 | 9.27 | 9.27 | 10.26 | 1.21× | 3.27× | -1.89 | -1.41 | 73 / 6,998 / 0 | — | 0.4043 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 30 | 2.28 | 3.94 | 3.96 | 7.24 | 1.20× | 1.03× | 0.04 | -0.18 | 45 / 3,601 / 0 | — | 0.3944 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 10 | 2.76 | 3.92 | 3.92 | 4.93 | 1.74× | 2.47× | 0.40 | 0.08 | 61 / 3,991 / 0 | — | 0.0036 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 3 | 2.92 | 2.92 | 2.92 | 3.56 | no baseline | no baseline | 0.29 | 0.28 | 72 / 4,062 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 12 | 2.65 | 3.89 | 3.89 | 5.61 | 1.26× | 0.65× | -1.82 | -2.03 | 78 / 4,761 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 41 | 2.35 | 3.88 | 3.92 | 4.03 | 1.14× | 1.09× | -0.24 | -0.43 | 48 / 3,344 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 29 | 9.37 | 20.09 | 30 | 47.54 | 0.89× | 1.42× | 0.86 | 0.14 | 237 / 11,417 / 0 | — | 9.374 ms per file | commit |
| fs.rm | 1 files · uncontended | 114 | 6.38 | 14.00 | 16.42 | 36.72 | 0.95× | 1.25× | -2.36 | -2.74 | 129 / 6,713 / 0 | — | 6.376 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 3 | 3.68 | 3.68 | 3.68 | 4.38 | 1.69× | 1.65× | -0.24 | -0.41 | 73 / 5,673 / 0 | — | 0.0093 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 4 | 2.17 | 2.96 | 2.96 | 2.99 | 1.41× | 1.93× | -0.42 | -0.20 | 50 / 3,480 / 0 | — | 0.0055 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 4 | 2.23 | 2.30 | 2.30 | 2.65 | 1.06× | 1.09× | -0.40 | -0.53 | 44 / 2,740 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 8 | 2.69 | 4.00 | 4.00 | 5.71 | 1.03× | 1.17× | -0.44 | -0.31 | 59 / 4,709 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 17 | 1.91 | 4.04 | 4.04 | 5.83 | 0.97× | 1.87× | 1.48 | 0.79 | 42 / 2,944 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 8 | 2.44 | 3.44 | 3.44 | 5.69 | 1.09× | 1.15× | 0.86 | 0.94 | 43 / 2,987 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 23 | 1.98 | 2.44 | 2.71 | 2.75 | 1.18× | 0.70× | 0.08 | 0.14 | 44 / 3,262 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 104 | 9.83 | 27.29 | 56.10 | 131.08 | 1.15× | 1.83× | -2.63 | -2.92 | 260 / 14,833 / 0 | — | 0.0204 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 143 | 6.90 | 10.51 | 15.44 | 20.53 | 1.09× | 1.00× | -2.41 | -2.83 | 142 / 5,915 / 0 | — | 0.0152 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 18 | 12.02 | 22.52 | 22.52 | 27.82 | 0.75× | 1.40× | -1.47 | -1.87 | 359 / 18,679 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 44 | 10.86 | 14.68 | 17.86 | 18.63 | 1.32× | 1.78× | -0.31 | -0.44 | 156 / 7,530 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 154 | 11.88 | 54.50 | 104.01 | 146.66 | 1.20× | 2.48× | -1.23 | -1.52 | 335 / 17,503 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 333 | 7.31 | 14.44 | 23.57 | 48.25 | 1.01× | 1.06× | -1.17 | -1.51 | 147 / 6,249 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 185 | 10.63 | 46.66 | 86.83 | 141.47 | 1.09× | 2.08× | -1.94 | -2.21 | 274 / 14,375 / 0 | — | 0.0031 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 389 | 6.49 | 12.23 | 15.69 | 25.87 | 0.90× | 0.88× | -1.35 | -1.68 | 138 / 5,682 / 0 | — | 0.0015 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.65 | 0.65 | 0.65 | 0.65 | 0.86× | 0.86× | -1.45 | -1.61 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 56 | 25.16 | 70.05 | 73.64 | 84.22 | 1.19× | 2.01× | -0.81 | -1.41 | 397 / 28,797 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 111 | 24.20 | 43.20 | 63.03 | 285.45 | 1.17× | 1.25× | -0.23 | -0.42 | 267 / 25,984 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 22 | 3.37 | 5.43 | 7.09 | 11.80 | 0.88× | 0.67× | 0.00 | -0.42 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 41 | 3.38 | 5.54 | 5.98 | 6.03 | 0.84× | 1.08× | -0.49 | -0.51 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 13 | 12.77 | 28.18 | 28.18 | 31.24 | 1.32× | 1.45× | -1.20 | -1.58 | 157 / 6,691 / 0 | — | 12.768 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 10 | 8.00 | 10.47 | 10.47 | 20.14 | 0.96× | 0.86× | -0.52 | -0.90 | 100 / 5,229 / 0 | — | 7.995 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 212.10 | 212.10 | 212.10 | 212.10 | 5.57× | 5.57× | -2.40 | -3.17 | 12,213 / 502,322 / 8,191 | — | 212.105 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 17 | 19.33 | 42.51 | 42.51 | 45.75 | 1.30× | 2.16× | 2.13 | 1.90 | 215 / 9,768 / 0 | — | 6.8927 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 12 | 9.73 | 14.77 | 14.77 | 15.36 | 0.91× | 0.87× | -0.24 | -0.53 | 131 / 4,705 / 0 | — | 3.8265 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 4 | 15.68 | 16.59 | 16.59 | 21.80 | 0.95× | 1.01× | -1.07 | -2.14 | 259 / 14,787 / 0 | — | 2.5395 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 11.91 | 14.01 | 14.01 | 29.08 | 0.87× | 1.02× | -0.61 | -0.56 | 117 / 4,727 / 0 | — | 1.949 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 87.95 | 87.95 | 87.95 | 87.95 | no baseline | no baseline | -0.75 | -0.96 | 1,289 / 149,369 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 95.19 | 913.69 | 913.69 | 12445.04 | 1.38× | 13.24× | 1.15 | 0.96 | 1,453 / 118,315 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 323 | 41.90 | 795.31 | 1005.33 | 2732.70 | 0.82× | 2.07× | -5.73 | -3.08 | — | 3607.30 | — | — |
| sandbox.exec | 0 files · uncontended | 208 | 33.89 | 560.39 | 805.52 | 6264.70 | 1.07× | 1.96× | 0.30 | 0.27 | — | 3698.30 | — | — |
| sandbox.exec | 1 files · contended | 41 | 33.15 | 56.99 | 57.58 | 61.25 | 0.90× | 0.68× | 0.11 | -0.04 | — | 4.30 | 33.154 ms per file | — |
| sandbox.exec | 1 files · uncontended | 33 | 37.34 | 48.51 | 49.26 | 56.23 | 1.12× | 0.72× | -0.44 | -0.64 | — | 4.30 | 37.338 ms per file | — |
| sandbox.exec | 17–64 files · contended | 5 | 73.64 | 74.66 | 74.66 | 77.66 | 1.05× | 1.07× | -0.84 | -0.94 | — | 97 | 3.8829 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 5 | 78.04 | 87.18 | 87.18 | 101.94 | 1.12× | 1.25× | -1.04 | -1.17 | — | 93 | 3.902 ms per file | — |
| sandbox.exec | 2–4 files · contended | 73 | 39.30 | 61.19 | 64.30 | 74.50 | 1.01× | 0.88× | 0.03 | 0.04 | — | 10.80 | 14.9608 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 52 | 36.89 | 63.30 | 74.55 | 76.49 | 0.97× | 0.97× | -1.29 | -1.34 | — | 10.80 | 13.8327 ms per file | — |
| sandbox.exec | 5–16 files · contended | 30 | 41.73 | 65.15 | 65.44 | 73.39 | 0.71× | 0.90× | 0.84 | 0.59 | — | 19.70 | 6.7886 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 37 | 53.15 | 76.20 | 79.11 | 91.74 | 0.75× | 0.72× | -0.99 | -0.68 | — | 27 | 6.2574 ms per file | — |
| sandbox.exec | — · contended | 16 | 2739.97 | 26877.62 | 26877.62 | 27283.48 | no baseline | no baseline | -2.51 | -3.46 | — | 40,196 | — | — |
| sandbox.exec | — · uncontended | 33 | 293.83 | 13533.44 | 20101.78 | 31574.29 | 0.55× | 1.90× | -1.32 | -2.67 | — | 38305.60 | — | — |
| sandbox.mount | — · contended | 122 | 11.53 | 27.56 | 29.37 | 42.21 | 1.03× | 1.45× | -0.23 | -0.47 | 58 / 1,611 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 180 | 9.89 | 15.26 | 19.97 | 31.63 | 0.88× | 0.76× | -0.34 | -0.40 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 5.44 | 5.44 | 5.44 | 5.44 | no baseline | no baseline | 1.29 | 1.18 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.52 | 4.11 | 4.11 | 40.19 | no baseline | no baseline | -0.84 | -1 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 108 | 12.52 | 21.42 | 33.12 | 37.46 | 1.18× | 1.18× | -0.56 | -0.65 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 194 | 11.66 | 19.78 | 133.24 | 199.08 | 1.11× | 1.07× | 0.06 | 0.01 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 19 | 0.0 KiB | 1008.9 KiB | 4,517 | ok 19 |
| branch.diff_commits | branch | 357 | 0.0 KiB | 19.6 MiB | 66,958 | ok 357 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 97.6 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 154 | 2.3 MiB | 0.0 KiB | 165 | Committed 154 |
| fs.diff_files | fs | 74 | 0.0 KiB | 508.5 KiB | 53 | Text 51, NoSuchPath 21, Equal 2 |
| fs.glob | fs | 83 | 0.0 KiB | 81.8 KiB | 1,063 | ok 83 |
| fs.grep | fs | 82 | 0.0 KiB | 316.5 KiB | 1,265 | ok 82 |
| fs.list | fs | 82 | 0.0 KiB | 371.4 KiB | 2,472 | ok 82 |
| fs.read | fs | 71 | 0.0 KiB | 204.5 KiB | 71 | ok 71 |
| fs.rm | fs | 143 | 0.0 KiB | 0.0 KiB | 143 | Committed 143 |
| fs.stat | fs | 75 | 0.0 KiB | 16.6 KiB | 75 | ok 75 |
| fs.write | fs | 1,370 | 24.6 MiB | 0.0 KiB | 1,370 | Committed 1366, UpToDate 4 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 309 | 0.0 KiB | 0.0 KiB | 0 | Committed 245, UpToDate 63, Conflict 1 |
| sandbox.exec | sandbox | 866 | 3.4 MiB | 5.5 MiB | 0 | exit:0 862, exit:2 4 |
| sandbox.mount | sandbox | 312 | 0.0 KiB | 0.0 KiB | 0 | Mounted 312 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 312 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 312 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.76 · end 2.63.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.027 | 14.743 · 1.202 · 1.027 · 0.965 · 0.909 | 3.59–3.59 | statements 26, vm_steps 960, fullscan_steps 0, sorts 0, returned_rows 80 |
| read | 0.891 | 1.033 · 0.93 · 0.878 · 0.891 · 0.812 | 3.59–3.59 | statements 15, vm_steps 720, fullscan_steps 0, sorts 0, returned_rows 69 |
| list_small | 0.902 | 1.017 · 0.803 · 0.902 · 0.921 · 0.849 | 3.59–3.59 | statements 15, vm_steps 729, fullscan_steps 0, sorts 0, returned_rows 69 |
| list_largest | 6.305 | 8.548 · 6.547 · 6.284 · 6.264 · 6.305 | 3.59–3.59 | statements 132, vm_steps 15539, fullscan_steps 0, sorts 0, returned_rows 1659 |
| grep_scoped | 1.001 | 1.513 · 1.005 · 1.001 · 0.944 · 0.901 | 3.59–3.59 | statements 20, vm_steps 875, fullscan_steps 0, sorts 0, returned_rows 78 |
| glob_scoped | 0.919 | 0.885 · 0.919 · 0.777 · 1.001 · 0.933 | 3.59–3.59 | statements 14, vm_steps 708, fullscan_steps 0, sorts 0, returned_rows 68 |
| grep_tree | 4428.938 | 4651.277 · 4413.68 · 4458.866 · 4402.946 · 4428.938 | 2.93–3.38 | statements 51813, vm_steps 3961579, fullscan_steps 0, sorts 0, returned_rows 396158 |
| glob_tree | 6.976 | 8.66 · 6.976 · 6.989 · 6.886 · 6.682 | 2.93–2.93 | statements 116, vm_steps 18725, fullscan_steps 0, sorts 0, returned_rows 1959 |
| diff_files | 3.003 | 3.42 · 3.336 · 3.003 · 2.91 · 2.851 | 2.93–2.93 | statements 72, vm_steps 4204, fullscan_steps 0, sorts 0, returned_rows 414 |
| list_commits | 0.655 | 1.399 · 0.677 · 0.643 · 0.655 · 0.567 | 2.93–2.93 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.701 | 2.173 · 1.464 · 1.45 · 1.911 · 1.701 | 2.93–2.93 | statements 57, vm_steps 1990, fullscan_steps 0, sorts 0, returned_rows 219 |
| fork | 0.49 | 0.49 · 0.376 · 0.374 · 0.512 · 0.539 | 2.93–2.93 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 21.184 | 25.146 · 20.702 · 22.656 · 19.469 · 21.184 | 2.93–2.93 | statements 456, vm_steps 21131, fullscan_steps 0, sorts 0, returned_rows 1553 |
| oneshot_mount_unmount | 15.114 | 19.611 · 15.114 · 19.037 · 14.448 · 13.993 | 2.93–2.93 | statements 60, vm_steps 2180, fullscan_steps 82, sorts 2, returned_rows 216 |
| oneshot_commit | 65.365 | 76.806 · 65.365 · 64.913 · 67.854 · 61.587 | 2.93–2.93 | statements 167, vm_steps 11522, fullscan_steps 82, sorts 2, returned_rows 859 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.93–2.93 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r037: 261,526 pages of 4,096 B, 0 free · Commits 44,861 · Branches 862 · Layers 45 · compression 3.57× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 146,140 | 888.7 MiB |
| 2 | 54,418 | 804.4 MiB |
| 3 | 15,018 | 4.1 MiB |
| 4 | 45 | 8.9 KiB |
| 5 | 14,917 | 1.5 MiB |
| 6 | 109,164 | 532.5 MiB |
| 7 | 277,961 | 67.4 MiB |
| 8 | 646 | 194.3 KiB |
| 9 | 90,824 | 191.6 MiB |
| 10 | 48,108 | 5.9 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,290 | 187.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 45,920 | 89.0 MiB |
| 1 | 52,236 | 610.7 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 187,453 | 732.2 MiB | 26.7 MiB |
| inode_value | 43,217 | 168.8 MiB | 3.4 MiB |
| binding_hint | 12,234 | 47.8 MiB | 4.5 MiB |
| object_location | 10,491 | 41.0 MiB | 4.4 MiB |
| commit | 3,661 | 14.3 MiB | 2.3 MiB |
| file_digest | 1,269 | 5.0 MiB | 584.6 KiB |
| commit_lineage | 974 | 3.8 MiB | 477.2 KiB |
| commit_runs | 945 | 3.7 MiB | 498.4 KiB |
| commit_identity | 694 | 2.7 MiB | 314.5 KiB |
| content_signature | 157 | 628.0 KiB | 12.5 KiB |
| branch | 38 | 152.0 KiB | 26.1 KiB |
| branch_names | 15 | 60.0 KiB | 14.0 KiB |
| branch_identity | 11 | 44.0 KiB | 10.2 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 5 | 20.0 KiB | 5.4 KiB |
| layer | 3 | 12.0 KiB | 4.1 KiB |
| absorbed_heights | 3 | 12.0 KiB | 7.1 KiB |
| absorbed | 3 | 12.0 KiB | 7.1 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 265.3 s** (tooling): play 98.9 · consolidate 100.9 · verify 22.3 · probes 23.3 · tests 0.0 · seal + snapshot 7.4 · report 12.5

265.31 s tooling: prepare 1.48 · play 97.45 · consolidate 100.89 · verify 12.13 (diff_commits + full compareTree) · version walk 10.14 · probes 23.31 · metrics 0.88 · seal 1.35 · sealed figures 3.31 · snapshot copy 2.79 · report 0.37

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T01:18:43.646Z | watch | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.24× it; Scaling: not judged: stat (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: not judged: stat.statements (chain-bounded): 7 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-037.a1.json`
- trace `~/lfs-history/runs/p3-main-u/trace/range-037.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-u/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-037.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r037-1-agents-notes | 771 | 426.5 KiB |
| r037-3-packages-client | 827 | 426.8 KiB |
| r037-4-root | 657 | 428.3 KiB |
| r037-2-examples-acp-agent | 719 | 423.4 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 321.0 | 3,415 |
| `git diff --stat` | 34.0 | 3,402 |
| `git add -f` | 33.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 39.0 | 3,411 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r037-1-agents-notes | end | P1 | pass | — | — |
| r037-1-agents-notes | end | P2 | pass | exit 0 | — |
| r037-1-agents-notes | end | P3 | pass | 245 bookkeeping path(s) | — |
| r037-1-agents-notes | end | P4 | pass | 106 emitted files, exit 2 | — |
| r037-1-agents-notes | end | P5 | pass | 15 files | — |
| r037-1-agents-notes | end | P6 | n/a | not a repair | — |
| r037-2-examples-acp-agent | end | P1 | pass | — | — |
| r037-2-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r037-2-examples-acp-agent | end | P3 | pass | 245 bookkeeping path(s) | — |
| r037-2-examples-acp-agent | end | P4 | pass | 190 emitted files, exit 2 | — |
| r037-2-examples-acp-agent | end | P5 | n/a | no calibrated file | — |
| r037-2-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r037-3-packages-client | end | P1 | pass | — | — |
| r037-3-packages-client | end | P2 | pass | exit 0 | — |
| r037-3-packages-client | end | P3 | pass | 245 bookkeeping path(s) | — |
| r037-3-packages-client | end | P4 | pass | 510 emitted files, exit 2 | — |
| r037-3-packages-client | end | P5 | n/a | no calibrated file | — |
| r037-3-packages-client | end | P6 | n/a | not a repair | — |
| r037-4-root | end | P1 | pass | — | — |
| r037-4-root | end | P2 | pass | exit 0 | — |
| r037-4-root | end | P3 | n/a | an install, not a refresh | — |
| r037-4-root | end | P4 | pass | 360 emitted files, exit 2 | — |
| r037-4-root | end | P5 | pass | 90 files | — |
| r037-4-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1760 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
