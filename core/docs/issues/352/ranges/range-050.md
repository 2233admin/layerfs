# Range 050 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r049 (live Store) · **re-judged after fix 069** (retained state, not replayed)
dsh `0e220ab56`..`2c536ef1f` · **60 commits** (10 mainline, 50 side) · 2026-07-28 → 2026-07-29
Areas changed: `/` 22% · `packages/client` 15% · `docs` 8% · other 54%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 19 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.20×** · **Churn 0.00**
**Time split:** play 196.5 s · git 134.3 s · Node 328.9 s · verify 17.8 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **815.6 MiB** (+2.0 MiB) | **1.43 GiB** (+36.0 MiB) | **1.79×** (prev 1.75×) | **42.6 MiB** | **1,155** (total 60,450) | **433.8 s** tooling (total 176.2 min) |

**Checks:** 14 pass · 3 watch: Speed branch.diff_branches >64 entries · uncontended: 8.45× baseline (no phase); not judged: sandbox.commit — · Committed · uncontended: 3/3/3 calls (212.35×), branch.merge >64 entries · Merged (new Commit) · uncontended: 1/3/2 calls (5×), fs.grep 17–64 files · uncontended: 4/8/1 calls (2.72×), fs.write ≤512 KiB · uncontended: 3/2/2 calls (2.15×), fs.grep >64 files · uncontended: 3/7/4 calls (1.47×) (baseline class under 5 calls per range); Scaling branch.diff_commits checkpoint ms per entry (entries exponent 0.352): depth exponent 0.161; Directory share 0.599 · 2 optimize/stop: Counters, Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ probe fork −78% · ▼ probe diff_commits −77% · ▲ metadata added +54%
**Budget:** 51 of 202 ranges · projected total 16.0 h (budget 16.8 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,795 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,389 / 2,389 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **161 / 161 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 0 missing, 0 extra, 2 differ (`examples/node_modules/.bin`, `python/sdk-runtime/node_modules/.bin`) · not byte-compared: 3 pnpm state file(s) · by target: 426 bin shims, 4640 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (57 lines from 4 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | snapshot taken; restore, oracle and quick_check by the lead (SPEC §7) |
| Git | **HEAD = checkpoint `2c536ef1f`** · 101 commits written for 101 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lead | initial | `fa8db2b0a903` | `e0cfa4a6eda2` | pass (428 normalized) | pass | n/a | pass | n/a | n/a |
| r050-2-root | end | `14b0410a74b9` | `a98c460dc0c2` | pass (429 normalized) | pass | n/a | pass | n/a | n/a |
| r050-3-agents-notes | end | `2411549eae49` | `e0cfa4a6eda2` | pass (428 normalized) | pass | pass | pass | pass | n/a |
| r050-1-packages-client | end | `dde2f14f2fcc` | `e0cfa4a6eda2` | pass (428 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `76469194d625` | `null` | n/a | pass | n/a | n/a | pass | pass |

P5 skip list (failing natively, set at calibration): `apps/cli/tests/args.spec.ts` (fails natively) · `apps/cli/tests/trusted-hosts.spec.ts` (fails natively) · `apps/cli/tests/tsconfig-paths-loader.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/api-request-trust.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/http-bridge.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-machine.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/queue-dock.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-snapshot.spec.tsx` (fails natively) · `packages/client/web/tests/app-root.spec.tsx` (fails natively) · `packages/client/web/tests/app-shell.spec.tsx` (fails natively) · `packages/client/web/tests/app.spec.tsx` (fails natively) · `packages/client/web/tests/base-styles.spec.ts` (fails natively) · `packages/client/web/tests/document-title.spec.tsx` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/bootstrap.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/output-json.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/runtime.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/source-worker.compat.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/worker-json.spec.ts` (fails natively) · `packages/code-runtime/code-runtime/tests/service.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/goal/command-goal/tests/command-goal.spec.ts` (fails natively) · `packages/goal/goal-session/tests/goal-session.spec.ts` (fails natively) · `packages/goal/goal-session/tests/invariant.spec.ts` (fails natively) · `packages/goal/goal/tests/goal.spec.ts` (fails natively) · `packages/goal/goal/tests/invariant.spec.ts` (fails natively) · `packages/goal/goal/tests/projection.spec.ts` (fails natively) · `packages/goal/tool-goal/tests/tool-goal.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/codec.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/detached.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/events.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/invariant.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/matcher.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/merge.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/runner.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-approval.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-blank.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-models.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-path-opener.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/apply.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/load-path.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/integration.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/invariant.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/plan-mode.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/projection.spec.ts` (fails natively) · `packages/sdk/create-sdk/tests/create.spec.ts` (fails natively) · `packages/sdk/helper/tests/documents.spec.ts` (fails natively) · `packages/sdk/helper/tests/headless-prompt-port.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/sdk/helper/tests/questions.spec.ts` (fails natively) · `packages/sdk/scripts/tests/scripts.spec.ts` (fails natively) · `packages/sdk/sdk-client/tests/dispose.spec.ts` (fails natively) · `packages/sdk/sdk-client/tests/sdk-client.spec.ts` (fails natively) · `packages/sdk/sdk-protocol/tests/transport.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/anonymous-id.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/consent-resolver.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/payload.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/reporter.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/secret-redactor.spec.ts` (fails natively) · `packages/session-title/session-title-all-messages-llm/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title-first-message-llm/tests/loader-composition.spec.ts` (fails natively) · `packages/session-title/session-title-first-message-llm/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title-llm/tests/llm.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/projection.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively) · `packages/spill/spill-local/tests/spill-local.spec.ts` (fails natively) · `packages/spill/spill-policy/tests/spill-policy.spec.ts` (fails natively) · `packages/spill/spill/tests/service.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/subagent/subagent-dsh-sdk/tests/subagent-dsh-sdk.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/inheritance.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/subagent/subagent/tests/invariant.spec.ts` (fails natively) · `packages/subagent/subagent/tests/out-of-process.spec.ts` (fails natively) · `packages/subagent/subagent/tests/service.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/scripted-provider.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/cli.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/invariant.spec.ts` (fails natively) · `packages/support/llm-mock-server/tests/server.spec.ts` (fails natively) · `packages/tasks/tasks-local/tests/tasks.spec.ts` (fails natively) · `packages/tasks/tasks/tests/invariant.spec.ts` (fails natively) · `packages/tasks/tasks/tests/service.spec.ts` (fails natively) · `packages/tasks/tool-tasks/tests/tool-tasks.spec.ts` (fails natively) · `packages/telemetry/session-telemetry-otel/tests/otel.spec.ts` (fails natively) · `packages/telemetry/session-telemetry/tests/redact.spec.ts` (fails natively) · `packages/telemetry/session-telemetry/tests/telemetry.spec.ts` (fails natively) · `packages/timeout/timeout-policy/tests/timeout-policy.spec.ts` (fails natively) · `packages/ui/permission/tests/invariant.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/ui/permission/tests/projection.spec.ts` (fails natively) · `packages/util/paths/tests/paths.spec.ts` (fails natively) · `packages/util/retention/tests/retention.spec.ts` (fails natively) · `packages/util/timeout/tests/timeout.spec.ts` (fails natively) · `packages/workflow/tool-ralph/tests/integration.spec.ts` (fails natively) · `packages/workflow/tool-ralph/tests/tool-ralph.spec.ts` (fails natively) · `packages/workflow/tool-workflow/tests/tool-workflow.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/meta.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/realm.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/session.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/source-worker.compat.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively) · `packages/workflow/workflow/tests/invariant.spec.ts` (fails natively) · `packages/workflow/workflow/tests/workflow.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/client/locale/tests/apply.spec.ts` (fails natively) · `packages/client/locale/tests/invariant.spec.ts` (fails natively) · `packages/client/locale/tests/language-row.spec.tsx` (fails natively) · `packages/client/locale/tests/locale.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/terminal-card.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-model/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-model/tests/model-select.spec.tsx` (fails natively) · `packages/client/ui-models/tests/apply.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/ansi.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/terminal-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-settings/tests/apply.spec.ts` (fails natively) · `packages/client/ui-settings/tests/settings-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-snapshot.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/appearance-row.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/apply.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/storage/storage-json/tests/json-backend.spec.ts` (fails natively) · `packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively).

lead initial, the fresh-checkout oracle (information, not gated; fix 069): P1 stop (missing 0, extra 0, differ 2: examples/node_modules/.bin, python/sdk-runtime/node_modules/.bin) · P2 stop (line 6: native "[WARN] Failed to create bin at <root>/examples/node_modules/.bin/dsh-cli-demo. ENOENT: no such file or directory, open '<root>/packages/examples/cli-demo/lib/bin.js'", LayerFS "").

## 2. Activity

**3,180 calls** · **190 steps** by **8 agents + lead** on **3 Branches + main** · **238 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +62 added · 999 modified · −23 deleted · 9.5 MiB written · fs 983 : Sandbox 101 (**10 : 1**, reported only in P3)
**Execs:** 607 (JS 76 · shell 531) · 3 non-zero exits · install 0 · test runs 3 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,396 | 996 | 400 | Committed 996 · Text 47 · NoSuchPath 9 · Equal 1 |
| sandbox | 1,322 | 842 | 4 | commit 235 (Committed 174, UpToDate 60, Conflict 1) · exec 607 (exit:0 604, exit:1 1, exit:2 2) · mount 238 (Mounted 238) · status 4 · unmount 238 (Unmounted 238) |
| branch | 452 | 32 | 420 | diff_branches 14 · diff_commits 406 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,180** | **1,870** | **834** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r050-1-packages-client | a01 a02 a03 | 61 | 363 | ✓ | — |
| r050-2-root | a04 a05 | 61 | 372 | ✓ | — |
| r050-3-agents-notes | a06 a07 a08 | 62 | 350 | ✓ | — |
| main | lead | 6 | 70 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r050-2, a04 after a05 | 0.1 s |
| Stale clean merge | 1 / 1 | r050-2, a04 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r050-2, a05 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r050-1 | 11 | 6 | 5 | 0 | 0 | 38 | — |
| a02 | r050-1 | 25 | 12 | 13 | 0 | 0 | 130 | — |
| a03 | r050-1 | 25 | 13 | 12 | 0 | 0 | 195 | — |
| a04 | r050-2 | 28 | 10 | 18 | 0 | 0 | 105 | commit-conflict, stale-clean-merge, decoy |
| a05 | r050-2 | 33 | 18 | 15 | 0 | 0 | 267 | commit-conflict, stale-clean-merge, decoy |
| a06 | r050-3 | 12 | 4 | 8 | 0 | 0 | 57 | — |
| a07 | r050-3 | 29 | 14 | 15 | 0 | 0 | 248 | — |
| a08 | r050-3 | 21 | 9 | 12 | 0 | 0 | 45 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 70 | — |
| **Total** |  | **190** | **87** | **98** | **5** | **0** | **1,155** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 129 · pnpm 1 · tsc 4 · vitest 3 · other 470

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r050-3-agents-notes | 40 | 40 | 38 | 2 | 40 | 742 |
| r050-2-root | 40 | 40 | 40 | 2 | 40 | 691 |
| r050-1-packages-client | 41 | 41 | 41 | 1 | 41 | 784 |
| **lead** | — | — | — | — | 101 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r050-2-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r050-3-agents-notes | 0 | 1 | 1 | 1 | 114 | 114 / 114 |
| r050-1-packages-client | 0 | 1 | 1 | 1 | 129 | 129 / 129 |
| **lead repair** | 1 | — | 1 | — | — | — files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r049) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 813.6 MiB (26.1 MiB / 657.9 MiB / 24.3 MiB / 105.3 MiB) | 815.6 MiB (26.4 MiB / 658.0 MiB / 24.5 MiB / 106.7 MiB) | +2.0 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,669 / 9,945 / 4,637 | 64,755 / 9,958 / 4,648 | +86 / +13 / +11 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.39 GiB | 1.43 GiB | +36.0 MiB |
| **Space amplification** (total · tracked) | 1.75× · tracked 5.02× | 1.79× · tracked 5.02× | 0.04 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **16.11** (1.11 / 0.32 / 1.59) | 2.21× the median range |
| **Stored per Commit** | 30.3 KiB | 31.7 KiB | — |
| Metadata share | 0.43 | 0.44 | this range 0.60 |
| History: Commits / Layers / Branches | 59,295 | 60,450 / 34 / 766 | +1,155 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 12.78 GiB (Commits 10.42 GiB · installs 859.0 MiB · build 96.9 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 39.39 GiB / 41% | — |
| Snapshot | — | r050, 1.25 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 824.4 MiB | 1.01 | +13.2 MiB |
| Metadata | 131.6 MiB | 0.16 | +4.1 MiB |
| Index rows | 435.0 MiB | 0.53 | — |
| Waste | 69.1 MiB | 0.08 | — |
| Other | 1.8 MiB | 0.00 | — |
| **Total = Store on disk** | **1.43 GiB** | **= 1.79** space amplification | +36.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 26.4 MiB | 132.4 MiB (70.2 MiB + 62.2 MiB) | 5.02× | — | 1.5 MiB | 2.6 MiB | 0.58 |
| `node_modules` | 658.0 MiB | 219.0 MiB (187.3 MiB + 31.7 MiB) | 0.33× | — | 1.9 MiB | 178.6 KiB | 10.70 |
| Build output | 24.5 MiB | 26.8 MiB (24.7 MiB + 2.1 MiB) | 1.09× | — | 403.5 KiB | 9.0 MiB | 0.04 |
| `.git` | 106.7 MiB | 521.4 MiB (498.8 MiB + 22.6 MiB) | 4.89× | — | 13.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 506.0 MiB | — (not divided) | — | 18.8 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 56.3 MiB | — | — | — | — | — |
| **Total** | — | **1.43 GiB** | **= 1.79×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 198,527 | +4,090 | 6.3 KiB | 0 (derived) | 47% |
| Chunks (large files) | 67,628 | +925 | 15.8 KiB | — | 3% |
| Large-file extents | 17,225 | — | 0.4 KiB | — | — |
| Directories | 456,557 | 5,597 (with inodes, pooled) | 0.3 KiB | — | 40% |
| Inodes and attributes | 391,067 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,450 | +9,292 | 0.1 KiB | — | — |

Delta: 1.8% at depth cap · 27% of refused bases stopped by budget · `node_modules` reinstall: absolute: 955043 new stored bytes for 40314 raw changed bytes of 7 changed packages (23.69×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.02× (132.4 MiB for 26.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.7 KiB / 4.4 KiB / 6.6 KiB over 222 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.20× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.3 MiB stored for 657.7 MiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.60 (3 lanes × 815.6 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 3.3 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.7 ms / 25.2 ms (1.15×) | 2.8 ms / 6.2 ms (1.34×) | 3.4 ms / 7.3 ms (1.64×) | 22.5 ms / 66.2 ms (1.23×) | 10.0 ms / 18.4 ms (0.86×) | 460 ms / 460 ms (5.00×) | — (native comparison in P3; exec 40.0 ms / 1053 ms) |
| SQL p50: 158 stmts | 54 stmts | 62 stmts | 226 stmts | 53 stmts | 9,269 stmts | — |

**Commit cost:** 6.77 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 775 ms p50 over 238
**Slowest:** sandbox.exec 40410 ms · sandbox.exec 39953 ms · sandbox.exec 30395 ms · checkpoint diff_commits 0.12 ms and 1.55 statements per entry (74,343 entries per page)
**Scaling:** 8 of 15 probes flat · `read` 0.24 · `list_largest` 1.00 · `grep_tree` 0.55 · `glob_tree` 0.46 · `diff_commits` 0.50 · `fork` 1.01 · `merge` 0.32

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 453 ms / 453 ms | — / — | — | git / status-cold: — |
| git status (steady) | 477 ms / 718 ms | — / — | — | git / status-steady: — |
| git add | 40.0 ms / 90.0 ms | — / — | — | git / add: — |
| git commit (lane) | 44.0 ms / 70.0 ms | — / — | — | git / commit: — |
| lead writes main | 4461 ms / 4461 ms | — / — | — | — |
| repack | 2138 ms / 2138 ms | — / — | — | — |
| pnpm install (incremental) | 3094 ms / 3094 ms | 4259 ms / 4259 ms | 0.73× | pnpm-reinstall / cold: — |
| pnpm refresh | 3167 ms / 3167 ms | 1584 ms / 1584 ms | 2.00× | pnpm-reinstall / steady: — |
| tsc -b | 2900 ms / 6184 ms | 3816 ms / 4406 ms | 0.76× | tsc-b / cold: — |
| vitest | 17966 ms / 17966 ms | 9668 ms / 9668 ms | 1.86× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.8 ms / 24.1 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 2632712 → 4194304 B · fs.write ≤64 KiB 2727472 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 12392 → 2863432 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 6.98 at the first command → 10.54 after the last (max 10.58 over 7 commands) · Docker VM 2.56 → 2.16

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-050.a1)

## 5. Findings and action

### Finding 050.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 (r045.a1 merge probe) vs the first 1941 (r033.a1 merge probe): 1.295× (bound, period 8; carried from r045.a1 merge probe; this range 1533, not a new maximum) | < 0.05 |
| Contended work | fs.rm 1 files · contended: SQL VM steps process-wide (writer + readers) against tree files, exponent 1.294 over 13 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-050.a1.json`.

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

- **a1 (`p3-main-w`, live after r49 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`; a milestone): OPTIMIZE, terminal under the fast-mode ruling (counter rows recorded), after fixes 068 and 069.** Checkpoint ok, git ✓. Node after the fix 069 re-judge on retained state: 19 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass. Control `control-050.a1` passes. Report check F1–F8 PASS.
- **Native first, fix 068:** the first native repair broke on `fs-sandbox.spec.ts`. The test puts its "outside" folder under `homedir()`, and the replay runs vitest with `HOME=/tmp` (fix 052), but calibrate-tests' probe ran under `/root`. The probe now uses `HOME=/tmp`, and range 50's tests were calibrated again: `fs-sandbox.spec` pass→fail, `tool-ralph` integration timeout→pass, 161 files run. The old file is kept as `tests-050.pre-fix068.json`. Repair ok before the attempt.
- **Node stop at `lead.initial` (P1, P2), oracle cause, fix 069 (liaison ruling):** the milestone's clean install runs on the live tree, which keeps the earlier builds' `lib/`. pnpm linked `cli-demo`'s bin (`lib/bin.js`) into `examples/` and `python/sdk-runtime/` `.bin`. The fresh-checkout oracle had no `lib/` and warned instead. The oracle now starts from the run's chain state (r49 native state, `state-19175a9d…`) and runs the lead's own commands. Re-judged `--rejudge "fix 069"`: P1, P2 and P4 pass. The old fresh-checkout diff is kept as an information line under the proofs table (P1 and P2 stop on the 2 `.bin` groups). `m.node.chainBefore` was filled from the r49 savestate record, because the play predates the field.
- **Docker Desktop crash at 07:28:57Z (infrastructure):** the play, finish, snapshot and proofs had completed. The first `control.mjs` run was in flight and was lost with an empty log and no numbers: a dead sample, not a LayerFS stop. A second start at 15:42 refused at once, because the crashed control's volume was still there (no sample). `control.mjs` then ran once to completion and passes. The r50 snapshot verifies intact after the restart (`snapshot.mjs verify`: ok).
- **Optimize rows, recorded, not acted on (fast mode):**
  - Counters `merge.returned_rows` (chain-bounded, carried from r45: 1.295×; this range 1,533, not a new maximum).
  - Contended work `fs.rm 1 files · contended`: SQL VM steps process-wide against tree files, exponent 1.294 over 13 ranges.
- **Speed, after the rebase onto prep Part A's harness:** watch. The rule now lists thin classes; `branch.diff_branches >64 entries` reads 8.45× its baseline (no phase). Not judged (baseline classes under 5 calls per range): `sandbox.commit` "—" 212.35× (its p95 is the relink Commit, 14.7 s, in this 12-call range), merge 5×, `fs.grep` 17–64 files 2.72×, `fs.write ≤512 KiB` 2.15×, `fs.grep` >64 files 1.47×. Merge p50 460 ms (2 calls). One-shot Commit 1.23×, write 1.15× (8.7 ms), mount 0.86×.
- **The lead's `git clean -f -d`** removed 0 files and 0 folders; the native clean removed the same. Fix 058 exempted `.sessions/session-query.db`.
- **Concurrent load:** the prep session's re-baseline runs (`rb-p3-32eda22d-4c52d23c` and `-b`) recorded 18 QUIET overlaps against this attempt, 07:27:43–07:41:45Z. That window covers the proofs, the re-judge and the lost control, after the play and finish (ended 07:22:46Z). Host 1-min load 6.3–10.6.
- Final steps: lead 89 s (the milestone's clean install and whole build); lanes 18 s + 14 s + 13 s + 78 s (cuts at plan orders 16, 26 and 37); repair 137 s (alarm 200 s; clean install 40.4 s, build 29.3 s, tests 12.2 s for 161 files); verify 21 s. The finish reached its 65 s alarm at exit, after metrics, report and snapshot were written (next = 51). Test calibration: 491 files, about 19 commands, then 19 more for the fix 068 recalibration (30-file batches).
- Watch items: index rows 435.0 MiB on the sealed snapshot (#366). `fs.rm` uncontended p50 8.76 ms per file over 10 calls, 156 statements and 7,807 VM steps per call; contended 12.54 ms over 4 (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2389/2389; conflicts 3/3; tests 161/161 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_branches >64 entries · uncontended: 8.45× baseline (no phase); not judged: sandbox.commit — · Committed · uncontended: 3/3/3 calls (212.35×), branch.merge >64 entries · Merged (new Commit) · uncontended: 1/3/2 calls (5×), fs.grep 17–64 files · uncontended: 4/8/1 calls (2.72×), fs.write ≤512 KiB · uncontended: 3/2/2 calls (2.15×), fs.grep >64 files · uncontended: 3/7/4 calls (1.47×) (baseline class under 5 calls per range) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.352): depth exponent 0.161 | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 (r045.a1 merge probe) vs the first 1941 (r033.a1 merge probe): 1.295× (bound, period 8; carried from r045.a1 merge probe; this range 1533, not a new maximum) | < 0.05 | optimize |
| Contended work | fs.rm 1 files · contended: SQL VM steps process-wide (writer + readers) against tree files, exponent 1.294 over 13 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.599 | < 0.5 | watch |
| Reinstall growth | absolute: 955043 new stored bytes for 40314 raw changed bytes of 7 changed packages (23.69×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0175 (budget 0.2727) | < 0.1 | pass |
| Range growth | 42.6 MiB, 1.21× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 6180 ms for 1278.0 MiB new; size exponent -0.125 | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.95 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 101 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 19 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.20× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 190 | 191 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1155 | 1022 |
| Workspaces (one-shot share) | 238 (0.99) | 97 (0.979) |
| Reads | 353 | 353 |
| Reconcile writes | 61 | 61 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 14 | 19.19 | 437.39 | 437.39 | 615.71 | 1.18× | 8.45× | 0.01 | 0.04 | 221 / 25,756 / 0 | — | 0.0803 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 16.01 | 16.01 | 16.01 | 17.50 | no baseline | no baseline | 2.48 | 4.00 | 188 / 15,364 / 0 | — | 0.3557 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 357.57 | 357.57 | 357.57 | 357.57 | no baseline | no baseline | 0.61 | 0.37 | 8,460 / 334,021 / 0 | — | 1.7358 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 398 | 21.28 | 48.19 | 84.73 | 387.98 | 1.23× | 1.86× | 0.07 | 0.03 | 298 / 34,766 / 0 | — | 0.1176 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.86 | 4.98 | 4.98 | 6.85 | 2.05× | 3.78× | 0.13 | -0.00 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.92 | 0.92 | 0.92 | 0.95 | no baseline | no baseline | -0.24 | -0.24 | 70 / 1,298 / 0 | — | 0.0462 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 459.51 | 459.51 | 459.51 | 478.86 | 5.00× | 5.00× | -0.09 | -0.09 | 9,269 / 530,087 / 0 | — | 2.703 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 3.69 | 3.69 | 3.69 | 3.69 | 2.38× | 2.38× | 0.35 | 0.21 | 44 / 666 / 0 | — | 0.0205 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 8.64 | 8.64 | 8.64 | 8.64 | 1.71× | 1.71× | -1.41 | -1.48 | 44 / 995 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 24.36 | 24.36 | 24.36 | 24.36 | 1.00× | 1.00× | -0.21 | -0.15 | 191 / 11,042 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 1 | 8.97 | 8.97 | 8.97 | 8.97 | 0.76× | 0.66× | -0.39 | -0.06 | 163 / 8,259 / 0 | — | 0.0204 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 10.41 | 10.41 | 10.41 | 10.41 | 1.50× | 1.08× | 0.27 | 0.25 | 308 / 14,986 / 0 | — | 0.0012 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 2 | 10.44 | 10.44 | 10.44 | 16.59 | 1.04× | 0.61× | 0.13 | 0.15 | 316 / 17,889 / 0 | — | 0.0032 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 1 | 13.46 | 13.46 | 13.46 | 13.46 | 2.06× | 1.24× | -0.26 | -0.18 | 161 / 8,935 / 0 | — | 0.0083 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 1 | 8.62 | 8.62 | 8.62 | 8.62 | 1.20× | 1.00× | -0.12 | -0.11 | 227 / 11,399 / 0 | — | 0.0089 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 18 | 6.80 | 8.42 | 8.42 | 11.57 | 1.16× | 1.04× | -0.28 | -0.26 | 168 / 9,320 / 0 | — | 0.0069 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 5 | 8.96 | 9.13 | 9.13 | 10.09 | 1.66× | 1.52× | 0.04 | 0.08 | 284 / 13,897 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 10 | 8.12 | 9.12 | 9.12 | 14.79 | 1.31× | 0.99× | -0.12 | -0.07 | 178 / 10,688 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 5 | 10.13 | 10.83 | 10.83 | 13.82 | 1.68× | 1.67× | -0.19 | -0.13 | 235 / 17,128 / 0 | — | 0.0025 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 13 | 7.75 | 12.40 | 12.40 | 12.58 | 1.05× | 1.55× | -0.14 | -0.17 | 175 / 10,595 / 0 | — | 0.0022 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 6 | 7.33 | 8.27 | 8.27 | 10.12 | 2.63× | 2.97× | -0.19 | -0.28 | 182 / 16,035 / 0 | — | 0.2364 ms per file | — |
| fs.glob | 17–64 files · uncontended | 10 | 6.09 | 7.75 | 7.75 | 8.48 | 2.15× | 2.04× | 0.48 | 0.39 | 103 / 11,467 / 0 | — | 0.2266 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 2.72 | 2.72 | 2.72 | 3.40 | 1.54× | 1.40× | 0.55 | 0.42 | 47 / 4,754 / 0 | — | 0.68 ms per file | — |
| fs.glob | 5–16 files · contended | 6 | 5.04 | 5.83 | 5.83 | 5.98 | 3.00× | 3.47× | -0.08 | -0.07 | 114 / 10,858 / 0 | — | 0.3887 ms per file | — |
| fs.glob | 5–16 files · uncontended | 18 | 5.15 | 5.81 | 5.81 | 5.95 | 2.55× | 2.55× | 0.42 | 0.32 | 70 / 8,547 / 0 | — | 0.4578 ms per file | — |
| fs.glob | >64 files · contended | 4 | 13.22 | 14.66 | 14.66 | 24.22 | 2.44× | 2.71× | -0.22 | -0.43 | 152 / 18,272 / 0 | — | 0.0559 ms per file | — |
| fs.glob | >64 files · uncontended | 9 | 9.09 | 16.81 | 16.81 | 52.47 | 0.92× | 1.20× | -0.48 | -0.64 | 105 / 15,160 / 0 | — | 0.021 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 6.25 | 6.25 | 6.25 | 6.25 | 2.61× | 2.61× | 2.09 | 1.41 | 60 / 3,183 / 0 | — | 6.245 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 5 | 16.13 | 16.40 | 16.40 | 28.70 | 2.70× | 2.74× | -0.23 | -0.31 | 329 / 17,912 / 0 | — | 0.6719 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 16 | 11.65 | 16.31 | 16.31 | 16.33 | 2.03× | 2.72× | 0.78 | 0.60 | 216 / 13,125 / 0 | — | 0.3474 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 8 | 8.71 | 10.53 | 10.53 | 12.29 | 2.94× | 2.09× | 0.32 | 0.24 | 263 / 15,263 / 0 | — | 0.6215 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 20 | 7.39 | 9.87 | 9.87 | 12.73 | 1.97× | 1.65× | 0.34 | 0.26 | 151 / 9,539 / 0 | — | 0.6718 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 2 | 16.18 | 16.18 | 16.18 | 25.74 | 1.03× | 1.03× | 0.15 | 0.23 | 378 / 20,269 / 0 | — | 0.1129 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 6 | 19.92 | 33.97 | 33.97 | 40.40 | 1.09× | 1.47× | 0.54 | 0.44 | 432 / 27,987 / 0 | — | 0.132 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 2 | 7.38 | 7.38 | 7.38 | 18.36 | 3.07× | 3.07× | -0.07 | -0.15 | 90 / 14,981 / 0 | — | 0.1994 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 9 | 5.18 | 7.52 | 7.52 | 9.23 | 2.07× | 2.56× | -0.40 | -0.42 | 85 / 9,593 / 0 | — | 0.1534 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 2.50 | 2.57 | 2.57 | 2.66 | 1.33× | 1.26× | 0.62 | 0.54 | 46 / 4,137 / 0 | — | 0.6238 ms per entrie | — |
| fs.list | 5–16 entries · contended | 12 | 4.00 | 5.75 | 5.75 | 7.31 | 1.71× | 2.03× | 0.12 | 0.14 | 93 / 7,131 / 0 | — | 0.4104 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 38 | 3.12 | 4.44 | 4.50 | 4.83 | 1.64× | 1.16× | 0.36 | 0.33 | 53 / 5,438 / 0 | — | 0.335 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 3.01 | 3.01 | 3.01 | 6.53 | 1.36× | 1.36× | -0.20 | -0.23 | 127 / 6,242 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 8 | 2.27 | 2.80 | 2.80 | 2.89 | 1.43× | 1.76× | -0.13 | -0.14 | 47 / 3,452 / 0 | — | 0.0031 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 7.38 | 7.38 | 7.38 | 7.38 | no baseline | no baseline | 1.10 | 0.87 | 116 / 6,945 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 5 | 2.93 | 2.98 | 2.98 | 3.01 | 1.05× | 1.07× | -0.19 | -0.32 | 56 / 3,824 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 8 | 3.53 | 6.02 | 6.02 | 6.92 | 1.68× | 1.01× | -0.11 | -0.10 | 94 / 4,824 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 35 | 2.75 | 4.30 | 4.59 | 6.21 | 1.34× | 1.20× | 0.15 | 0.10 | 51 / 3,950 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 4 | 12.54 | 19.67 | 19.67 | 28.09 | 1.19× | 1.39× | 0.70 | 0.70 | 379 / 19,250 / 0 | — | 12.541 ms per file | commit |
| fs.rm | 1 files · uncontended | 10 | 8.76 | 12.32 | 12.32 | 35.17 | 1.31× | 1.10× | 0.08 | 0.20 | 156 / 7,807 / 0 | — | 8.759 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 1 | 3.52 | 3.52 | 3.52 | 3.52 | 1.62× | 1.57× | -0.12 | -0.21 | 108 / 7,144 / 0 | — | 0.0082 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 16 | 2.96 | 3.59 | 3.59 | 3.69 | 1.92× | 2.33× | 0.51 | 0.50 | 51 / 3,854 / 0 | — | 0.0068 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.96 | 2.96 | 2.96 | 2.96 | 1.41× | 1.41× | 0.18 | 0.05 | 44 / 2,963 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 4 | 3.24 | 3.33 | 3.33 | 5.16 | 1.24× | 0.97× | -0.04 | -0.10 | 64 / 4,472 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 13 | 2.58 | 3.40 | 3.40 | 3.47 | 1.31× | 1.58× | 0.57 | 0.41 | 45 / 3,755 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 7 | 3.52 | 4.19 | 4.19 | 8.81 | 1.56× | 1.40× | 0.10 | 0.05 | 61 / 4,032 / 0 | — | 0.0012 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 17 | 2.49 | 3.64 | 3.64 | 5.08 | 1.49× | 1.04× | 0.04 | 0.02 | 44 / 3,960 / 0 | — | 0.0006 ms per byte | — |
| fs.write | >512 KiB · contended | 3 | 16.01 | 16.01 | 16.01 | 19.16 | no baseline | no baseline | -1.89 | -2.00 | 318 / 15,903 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 4 | 13.01 | 13.78 | 13.78 | 22.88 | no baseline | no baseline | -1.20 | -2.52 | 172 / 5,778 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 123 | 9.93 | 20.59 | 54.84 | 107.63 | 1.17× | 1.38× | 0.21 | 0.32 | 297 / 17,555 / 0 | — | 0.0221 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 247 | 7.36 | 11.71 | 21.74 | 29.43 | 1.16× | 1.11× | -0.26 | -0.21 | 148 / 7,605 / 0 | — | 0.0164 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 3 | 35.29 | 35.29 | 35.29 | 48.42 | 2.19× | 2.19× | 0.42 | 0.38 | 771 / 43,105 / 0 | — | 0.0003 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 12 | 11.59 | 17.74 | 17.74 | 28.78 | 1.41× | 2.15× | 0.13 | 0.14 | 181 / 8,063 / 0 | — | 0.0001 ms per byte | files.change |
| fs.write | ≤64 KiB · contended | 45 | 11.95 | 54.93 | 72.12 | 91.61 | 1.21× | 2.50× | 0.18 | 0.18 | 259 / 15,253 / 0 | — | 0.0011 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 117 | 8.39 | 15.28 | 24.59 | 36.40 | 1.16× | 1.12× | 0.12 | 0.12 | 148 / 6,315 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 116 | 11.74 | 53.49 | 67.30 | 93.35 | 1.20× | 2.38× | 0.02 | 0.04 | 308 / 18,675 / 0 | — | 0.0043 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 294 | 8.30 | 14.05 | 28.52 | 44.27 | 1.15× | 1.01× | 0.18 | 0.17 | 150 / 7,756 / 0 | — | 0.0023 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.95 | 0.95 | 0.95 | 0.95 | 1.27× | 1.27× | -0.01 | -0.04 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 44 | 30.93 | 52.65 | 66.16 | 70.75 | 1.47× | 1.51× | 0.15 | 0.09 | 406 / 36,547 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 78 | 25.54 | 49.89 | 69.04 | 236.63 | 1.23× | 1.44× | 0.01 | -0.01 | 307 / 23,992 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 17 | 3.75 | 4.96 | 4.96 | 6.61 | 0.98× | 0.61× | 0.09 | 0.12 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 42 | 3.71 | 5.59 | 6.66 | 8.61 | 0.93× | 1.09× | -0.04 | -0.05 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 4 | 12.96 | 16.81 | 16.81 | 23.07 | 1.34× | 0.87× | -0.07 | -0.03 | 138 / 5,055 / 0 | — | 12.96 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 8 | 8.81 | 15.47 | 15.47 | 16.40 | 1.06× | 1.27× | 0.01 | -0.00 | 98 / 3,657 / 0 | — | 8.81 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 145.74 | 145.74 | 145.74 | 145.74 | 3.82× | 3.82× | 0.15 | 0.12 | 7,501 / 297,560 / 8,191 | — | 145.74 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 7 | 16.92 | 28.23 | 28.23 | 57.58 | 1.13× | 1.43× | 0.70 | 0.69 | 144 / 14,113 / 0 | — | 5.6733 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 10 | 10.26 | 13.60 | 13.60 | 22.52 | 0.96× | 0.80× | 0.03 | -0.00 | 130 / 6,229 / 0 | — | 3.3995 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 7.38 | 7.38 | 7.38 | 48.35 | 0.45× | 0.45× | -0.26 | -0.15 | 80 / 4,965 / 0 | — | 1.4754 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 12.36 | 17.78 | 17.78 | 27.06 | 0.90× | 1.30× | 0.44 | 0.59 | 154 / 7,636 / 0 | — | 2.0598 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 81.24 | 14653.01 | 14653.01 | 15499.15 | 1.18× | 212.35× | 0.34 | 0.32 | 969 / 69,052 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 3.56 | 3.56 | 3.56 | 3.56 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 229 | 603.49 | 981.03 | 1116.01 | 4082.65 | 11.78× | 2.55× | 1.57 | 1.32 | — | 4441.70 | — | — |
| sandbox.exec | 0 files · uncontended | 153 | 33.20 | 511.70 | 940.11 | 11575.69 | 1.05× | 1.79× | -0.05 | -0.08 | 0 / 0 / 0 | 4442.30 | — | — |
| sandbox.exec | 1 files · contended | 21 | 36.14 | 56.00 | 56.00 | 64.41 | 0.98× | 0.66× | 0.10 | 0.07 | — | 4 | 36.136 ms per file | — |
| sandbox.exec | 1 files · uncontended | 23 | 36.38 | 51.66 | 61.40 | 82.27 | 1.09× | 0.76× | 0.38 | 0.33 | — | 5 | 36.375 ms per file | — |
| sandbox.exec | 17–64 files · contended | 4 | 57.71 | 60.78 | 60.78 | 65.58 | 0.83× | 0.87× | 0.23 | 0.19 | — | 98 | 2.8855 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 5 | 72.07 | 77.03 | 77.03 | 83.91 | 1.04× | 1.11× | -0.19 | -0.18 | — | 100 | 3.6036 ms per file | — |
| sandbox.exec | 2–4 files · contended | 29 | 41.08 | 63.57 | 64.18 | 69.18 | 1.06× | 0.91× | -0.01 | -0.02 | — | 11.70 | 15.1353 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 38 | 40.94 | 73.41 | 81.66 | 116.08 | 1.07× | 1.12× | -0.17 | -0.15 | — | 13.70 | 15.3272 ms per file | — |
| sandbox.exec | 5–16 files · contended | 24 | 52.78 | 68.19 | 69.45 | 70.95 | 0.90× | 0.94× | 0.43 | 0.37 | — | 30 | 6.9268 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 24 | 50.64 | 74.06 | 76.58 | 79.42 | 0.71× | 0.70× | -0.20 | -0.14 | — | 38 | 6.9507 ms per file | — |
| sandbox.exec | — · contended | 12 | 3182.27 | 30370.08 | 30370.08 | 30394.96 | no baseline | no baseline | -0.88 | -0.83 | — | 52889.70 | — | — |
| sandbox.exec | — · uncontended | 35 | 630.71 | 30070.86 | 39952.82 | 40410.07 | 1.19× | 4.23× | 0.74 | 0.58 | — | 52889.70 | — | — |
| sandbox.mount | — · contended | 80 | 11.54 | 19.42 | 20.93 | 28.60 | 1.03× | 1.02× | -0.07 | -0.07 | 60 / 1,632 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 148 | 9.61 | 16.94 | 19.52 | 24.28 | 0.86× | 0.84× | -0.16 | -0.15 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.84 | 4.00 | 4.00 | 52.55 | no baseline | no baseline | -0.09 | -0.08 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 66 | 13.28 | 22.31 | 27.51 | 32.26 | 1.25× | 1.23× | 0.03 | 0.04 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 162 | 12.93 | 20.20 | 159.15 | 253.01 | 1.23× | 1.10× | 0.14 | 0.12 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 14 | 0.0 KiB | 747.2 KiB | 3,289 | ok 14 |
| branch.diff_commits | branch | 406 | 0.0 KiB | 22.4 MiB | 75,318 | ok 406 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.9 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 18 | 659.2 KiB | 0.0 KiB | 29 | Committed 18 |
| fs.diff_files | fs | 57 | 0.0 KiB | 381.4 KiB | 48 | Text 47, NoSuchPath 9, Equal 1 |
| fs.glob | fs | 66 | 0.0 KiB | 52.6 KiB | 638 | ok 66 |
| fs.grep | fs | 68 | 0.0 KiB | 258.1 KiB | 1,279 | ok 68 |
| fs.list | fs | 77 | 0.0 KiB | 295.5 KiB | 2,009 | ok 77 |
| fs.read | fs | 65 | 0.0 KiB | 220.6 KiB | 65 | ok 65 |
| fs.rm | fs | 14 | 0.0 KiB | 0.0 KiB | 14 | Committed 14 |
| fs.stat | fs | 67 | 0.0 KiB | 14.6 KiB | 67 | ok 67 |
| fs.write | fs | 964 | 8.9 MiB | 0.0 KiB | 964 | Committed 964 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 235 | 0.0 KiB | 0.0 KiB | 0 | Committed 174, UpToDate 60, Conflict 1 |
| sandbox.exec | sandbox | 607 | 1.9 MiB | 7.4 MiB | 0 | exit:0 604, exit:1 1, exit:2 2 |
| sandbox.mount | sandbox | 238 | 0.0 KiB | 0.0 KiB | 0 | Mounted 238 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 238 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 238 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 2.56 · end 2.16.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.404 | 15.023 · 1.504 · 1.404 · 1.228 · 1.393 | 2.38–2.38 | statements 26, vm_steps 937, fullscan_steps 0, sorts 0, returned_rows 79 |
| read | 1.486 | 1.867 · 1.479 · 1.425 · 1.665 · 1.486 | 2.38–2.38 | statements 16, vm_steps 718, fullscan_steps 0, sorts 0, returned_rows 69 |
| list_small | 1.325 | 1.543 · 1.325 · 1.321 · 1.198 · 1.431 | 2.38–2.38 | statements 16, vm_steps 727, fullscan_steps 0, sorts 0, returned_rows 69 |
| list_largest | 10.554 | 14.263 · 10.554 · 10.804 · 10.35 · 10.13 | 2.38–2.38 | statements 191, vm_steps 26125, fullscan_steps 0, sorts 0, returned_rows 2629 |
| grep_scoped | 1.565 | 2.303 · 1.503 · 1.565 · 1.393 · 1.616 | 2.38–2.38 | statements 21, vm_steps 873, fullscan_steps 0, sorts 0, returned_rows 78 |
| glob_scoped | 1.407 | 1.445 · 1.321 · 1.407 · 1.61 · 1.351 | 2.38–2.38 | statements 15, vm_steps 706, fullscan_steps 0, sorts 0, returned_rows 68 |
| grep_tree | 5954.178 | 6054.355 · 6108.623 · 5954.178 · 5923.351 · 5916.015 | 2.13–2.46 | statements 62734, vm_steps 4686250, fullscan_steps 0, sorts 0, returned_rows 467244 |
| glob_tree | 10.506 | 10.506 · 8.897 · 8.544 · 36.165 · 16.939 | 2.13–2.13 | statements 134, vm_steps 20228, fullscan_steps 0, sorts 0, returned_rows 2111 |
| diff_files | 4.948 | 5.926 · 4.458 · 9.684 · 4.948 · 3.956 | 2.13–2.13 | statements 66, vm_steps 4048, fullscan_steps 0, sorts 0, returned_rows 402 |
| list_commits | 0.803 | 1.908 · 0.803 · 0.947 · 0.741 · 0.719 | 2.13–2.13 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.181 | 2.853 · 2.098 · 2.3 · 2.181 · 1.936 | 2.13–2.13 | statements 57, vm_steps 1975, fullscan_steps 0, sorts 0, returned_rows 216 |
| fork | 1.008 | 0.846 · 1.008 · 1.033 · 1.449 · 0.65 | 2.13–2.13 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 29.677 | 29.677 · 25.767 · 62.762 · 55.723 · 24.908 | 2.12–2.13 | statements 469, vm_steps 20973, fullscan_steps 0, sorts 0, returned_rows 1533 |
| oneshot_mount_unmount | 16.6 | 18.883 · 15.388 · 17.799 · 14.709 · 16.6 | 2.12–2.12 | statements 60, vm_steps 2157, fullscan_steps 82, sorts 2, returned_rows 215 |
| oneshot_commit | 69.091 | 75.404 · 69.091 · 80.98 · 66.996 · 68.337 | 2.12–2.12 | statements 166, vm_steps 10093, fullscan_steps 82, sorts 2, returned_rows 783 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.12–2.12 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r050: 374,273 pages of 4,096 B, 0 free · Commits 61,262 · Branches 1,247 · Layers 61 · compression 3.64× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 198,527 | 1.19 GiB |
| 2 | 67,628 | 1.02 GiB |
| 3 | 17,175 | 6.3 MiB |
| 4 | 50 | 9.6 KiB |
| 5 | 17,069 | 1.7 MiB |
| 6 | 165,202 | 797.0 MiB |
| 7 | 455,175 | 111.9 MiB |
| 8 | 1,382 | 399.1 KiB |
| 9 | 130,189 | 287.6 MiB |
| 10 | 65,785 | 8.1 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,450 | 200.9 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 63,003 | 131.6 MiB |
| 1 | 67,871 | 824.4 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 255,986 | 999.9 MiB | 36.1 MiB |
| inode_value | 70,708 | 276.2 MiB | 5.4 MiB |
| binding_hint | 21,218 | 82.9 MiB | 7.8 MiB |
| object_location | 15,424 | 60.3 MiB | 6.5 MiB |
| commit | 5,059 | 19.8 MiB | 3.1 MiB |
| file_digest | 1,586 | 6.2 MiB | 726.3 KiB |
| commit_lineage | 1,309 | 5.1 MiB | 567.4 KiB |
| commit_runs | 1,287 | 5.0 MiB | 667.6 KiB |
| commit_identity | 936 | 3.7 MiB | 382.8 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 56 | 224.0 KiB | 41.5 KiB |
| branch_names | 20 | 80.0 KiB | 13.4 KiB |
| branch_identity | 14 | 56.0 KiB | 7.1 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| run_merges | 7 | 28.0 KiB | 6.4 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 5.2 KiB |
| layers_source | 3 | 12.0 KiB | 6.7 KiB |
| layers_child | 3 | 12.0 KiB | 6.7 KiB |
| absorbed_heights | 3 | 12.0 KiB | 5.0 KiB |

### E. Stage times

**Time 433.8 s** (tooling): play 198.1 · consolidate 134.4 · verify 36.2 · probes 31.1 · tests 0.0 · seal + snapshot 18.2 · report 15.8

433.84 s tooling: prepare 1.58 · play 196.50 · consolidate 134.39 · verify 17.84 (diff_commits + full compareTree) · version walk 18.40 · probes 31.11 · metrics 1.74 · seal 1.49 · sealed figures 10.47 · snapshot copy 6.23 · report 0.54

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T07:15:06.233Z | optimize | Speed: branch.diff_branches >64 entries · uncontended: 8.45× baseline (no phase); not judged: sandbox.commit — · Committed · uncontended: 3/3/3 calls (212.35×), branch.merge >64 entries · Merged (new Commit) · uncontended: 1/3/2 calls (5×), fs.grep 17–64 files · uncontended: 4/8/1 calls (2.72×), fs.write ≤512 KiB · uncontended: 3/2/2 calls (2.15×), fs.grep >64 files · uncontended: 3/7/4 calls (1.47×) (baseline class under 5 calls per range); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.352): depth exponent 0.161; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2514 (r045.a1 merge probe) vs the first 1941 (r033.a1 merge probe): 1.295× (bound, period 8; carried from r045.a1 merge probe; this range 1533, not a new maximum); Contended work: fs.rm 1 files · contended: SQL VM steps process-wide (writer + readers) against tree files, exponent 1.294 over 13 ranges; Directory share: 0.599 |

### G. Evidence

- `~/lfs-history/metrics/range-050.a1.json`
- trace `~/lfs-history/runs/p3-main-w/trace/range-050.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-w/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-050.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r050-3-agents-notes | 742 | 590.1 KiB |
| r050-2-root | 691 | 586.7 KiB |
| r050-1-packages-client | 784 | 588.4 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 477.0 | 4,771 |
| `git diff --stat` | 39.0 | 4,762 |
| `git add -f` | 40.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 44.0 | 4,765 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| lead | initial | P1 | pass | — | — |
| lead | initial | P2 | pass | exit 0 | — |
| lead | initial | P3 | n/a | the lead's first install | — |
| lead | initial | P4 | pass | 2189 emitted files, exit 0 | — |
| lead | initial | P5 | n/a | no tests at the first install | — |
| lead | initial | P6 | n/a | not a repair | — |
| r050-2-root | end | P1 | pass | — | ✓ |
| r050-2-root | end | P2 | pass | exit 0 | ✓ |
| r050-2-root | end | P3 | n/a | an install, not a refresh | ✓ |
| r050-2-root | end | P4 | pass | 778 emitted files, exit 2 | ✓ |
| r050-2-root | end | P5 | n/a | no calibrated file | ✓ |
| r050-2-root | end | P6 | n/a | not a repair | ✓ |
| r050-3-agents-notes | end | P1 | pass | — | ✓ |
| r050-3-agents-notes | end | P2 | pass | exit 0 | ✓ |
| r050-3-agents-notes | end | P3 | pass | 282 bookkeeping path(s) | ✓ |
| r050-3-agents-notes | end | P4 | pass | 439 emitted files, exit 1 | ✓ |
| r050-3-agents-notes | end | P5 | pass | 114 files | ✓ |
| r050-3-agents-notes | end | P6 | n/a | not a repair | ✓ |
| r050-1-packages-client | end | P1 | pass | — | ✓ |
| r050-1-packages-client | end | P2 | pass | exit 0 | ✓ |
| r050-1-packages-client | end | P3 | pass | 282 bookkeeping path(s) | ✓ |
| r050-1-packages-client | end | P4 | pass | 783 emitted files, exit 2 | ✓ |
| r050-1-packages-client | end | P5 | pass | 129 files | ✓ |
| r050-1-packages-client | end | P6 | n/a | not a repair | ✓ |
| lead | repair | P1 | n/a | folded into P6 | ✓ |
| lead | repair | P2 | pass | exit 0 | ✓ |
| lead | repair | P3 | n/a | a repair, not a no-op | ✓ |
| lead | repair | P4 | n/a | folded into P6 | ✓ |
| lead | repair | P5 | pass | 161 files | ✓ |
| lead | repair | P6 | pass | P1 pass, P4 pass (2209 emitted files, exit 0) | ✓ |

### J. Conflicts by path class

No conflicts by path recorded.
