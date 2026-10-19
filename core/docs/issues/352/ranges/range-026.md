# Range 026 · **optimize** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r025 (live Store)
dsh `2c075711e`..`562a7f9da` · **60 commits** (9 mainline, 51 side) · 2026-07-20 → 2026-07-21
Areas changed: `examples/acp-agent` 21% · `packages/core` 13% · `packages/ui` 7% · other 59%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 90.5 s · git 121.2 s · Node 151.4 s · verify 8.9 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **645.8 MiB** (+5.0 MiB) | **669.9 MiB** (+42.0 MiB) live | **1.04×** (prev 0.98×) | **43.5 MiB** | **2,412** (total 29,975) | **261.1 s** tooling (total 64.6 min) |

**Checks:** 15 pass · 3 watch: Speed not judged: baseline not set (pilot); Scaling branch.diff_commits checkpoint ms in total (entries exponent -0.25): tree files exponent 0.253; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ probe fork −68% · ▼ probe list_commits −66% · ▼ stored added −55%
**Budget:** 27 of 202 ranges · projected total 16.7 h (budget 16.8 h) · disk 42% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **877 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 3,750 / 3,750 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2138 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 312 bin shims, 3434 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (46 lines from 3 .gitignore files) · **164 picks** in 3 merges (164 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `562a7f9da`** · 143 commits written for 143 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 192 untracked, unignored (857,259 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 164 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r026-1-root | end | `66351fc0cb0c` | `9252021d5845` | pass (315 normalized) | pass | n/a | pass | n/a | n/a |
| r026-3-examples-acp-agent | end | `48096c8f9f61` | `567918a34992` | pass (312 normalized) | pass | pass | pass | pass | n/a |
| r026-2-packages-core | end | `4c7041ae2203` | `567918a34992` | pass (312 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `73dea808100e` | `null` | n/a | pass | n/a | n/a | pass | pass (108,145 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/code-runtime/code-runtime-worker/tests/bootstrap.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/runtime.spec.ts` (fails natively) · `packages/code-runtime/code-runtime/tests/service.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/compact/compact/tests/compact.spec.ts` (fails natively) · `packages/compact/compact/tests/invariant.spec.ts` (fails natively) · `packages/compact/compact/tests/tool-pairing.spec.ts` (fails natively) · `packages/context/time-context/tests/invariant.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/codec.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/detached.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/events.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/invariant.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/matcher.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/merge.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/runner.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/apply.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/load-path.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/session-query/session-query/tests/session-query.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/codec.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/properties.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/web/tool-web/tests/integration.spec.ts` (fails natively) · `packages/web/tool-web/tests/load-path.spec.ts` (fails natively) · `packages/web/tool-web/tests/spill.spec.ts` (fails natively) · `packages/web/tool-web/tests/tool-web.spec.ts` (fails natively) · `packages/web/web-fetch-local/tests/fetch-local.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/deepseek.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/redirect.spec.ts` (fails natively) · `packages/web/web-search-exa/tests/exa.spec.ts` (fails natively) · `packages/web/web-search-perplexity/tests/perplexity.spec.ts` (fails natively) · `packages/web/web/tests/web.spec.ts` (fails natively) · `packages/workflow/tool-workflow/tests/tool-workflow.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/meta.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/realm.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/session.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/source-worker.compat.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively) · `packages/workflow/workflow/tests/invariant.spec.ts` (fails natively) · `packages/workflow/workflow/tests/workflow.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/fs/fs/tests/invariant.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/load-path.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm/tests/invariant.spec.ts` (fails natively) · `packages/skill/skill-local/tests/skill-local.spec.ts` (fails natively) · `packages/skill/tool-skill/tests/tool-skill.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/invariant.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/permission/tests/invariant.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/ui/user-approval/tests/invariant.spec.ts` (fails natively) · `packages/util/paths/tests/paths.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/llm/token-meter/tests/token-meter.spec.ts` (fails natively) · `packages/llm/llm/tests/service.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/tools.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/integration.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/bash/bash-local/tests/executor.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/bash/tests/invariant.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent-execution.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent-initiator.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/invariant.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/properties.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-recovery.spec.ts` (fails natively) · `packages/core/agent-loop/tests/resume.spec.ts` (fails natively) · `packages/core/agent-loop/tests/scope-lifecycle.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/core/agent/tests/invariant.spec.ts` (fails natively) · `packages/core/scope/tests/invariant.spec.ts` (fails natively) · `packages/core/session/tests/invariant.spec.ts` (fails natively) · `packages/core/system-prompt/tests/invariant.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-signal-types.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/invariant.spec.ts` (fails natively) · `packages/core/tools/tests/properties.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/tools/tests/tools.spec.ts` (fails natively) · `packages/core/tools/tests/ts-types.spec.ts` (fails natively) · `packages/sdk/scripts/tests/scripts.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/anonymous-id.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/consent-resolver.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/payload.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/reporter.spec.ts` (fails natively) · `packages/sdk/telemetry/tests/secret-redactor.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/spill/spill-local/tests/spill-local.spec.ts` (fails natively) · `packages/spill/spill-policy/tests/spill-policy.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/subagent/subagent/tests/invariant.spec.ts` (fails natively) · `packages/subagent/subagent/tests/service.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/scripted-provider.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/support/agent-loop-testkit/tests/agent-loop-testkit.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/support/invariants/tests/service.spec.ts` (fails natively) · `packages/tasks/tasks/tests/invariant.spec.ts` (fails natively) · `packages/tasks/tool-tasks/tests/tool-tasks.spec.ts` (fails natively) · `packages/timeout/timeout-policy/tests/timeout-policy.spec.ts` (fails natively) · `packages/core/agent/tests/llm-target.spec.ts` (fails natively) · `packages/core/agent-loop/tests/inbox.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/core/session/tests/scoped.spec.ts` (fails natively) · `packages/core/system-prompt/tests/scoped.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively).

## 2. Activity

**4,448 calls** · **176 steps** by **8 agents + lead** on **3 Branches + main** · **236 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +324 added · 1,968 modified · −119 deleted · 26.1 MiB written · fs 2,230 : Sandbox 181 (**12 : 1**, reported only in P3)
**Execs:** 662 (JS 57 · shell 605) · 3 non-zero exits · install 0 · test runs 3 · version figures 11 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,705 | 2,243 | 462 | Committed 2,243 · Text 45 · NoSuchPath 25 · Equal 2 |
| sandbox | 1,371 | 895 | 4 | commit 233 (Committed 184, Conflict 1, UpToDate 48) · exec 662 (exit:0 659, exit:4 2, exit:2 1) · mount 236 (Mounted 236) · status 4 · unmount 236 (Unmounted 236) |
| branch | 362 | 31 | 331 | diff_branches 22 · diff_commits 309 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,448** | **3,169** | **807** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r026-1-root | a01 a02 | 35 | 623 | ✓ | — |
| r026-2-packages-core | a03 a04 a05 | 77 | 631 | ✓ | — |
| r026-3-examples-acp-agent | a06 a07 a08 | 58 | 645 | ✓ | — |
| main | lead | 6 | 513 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r026-2, a05 after a03 | 0.1 s |
| Stale clean merge | 1 / 1 | r026-2, a03 a04 | merged cleanly |
| Decoy edit | 1 / 1 | r026-2, a05 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r026-1 | 18 | 6 | 12 | 0 | 0 | 264 | — |
| a02 | r026-1 | 17 | 8 | 9 | 0 | 0 | 359 | — |
| a03 | r026-2 | 32 | 16 | 16 | 0 | 0 | 154 | commit-conflict, stale-clean-merge |
| a04 | r026-2 | 18 | 8 | 10 | 0 | 0 | 161 | stale-clean-merge, decoy |
| a05 | r026-2 | 27 | 10 | 17 | 0 | 0 | 316 | commit-conflict, decoy |
| a06 | r026-3 | 24 | 11 | 13 | 0 | 0 | 314 | — |
| a07 | r026-3 | 9 | 3 | 6 | 0 | 0 | 54 | — |
| a08 | r026-3 | 25 | 9 | 16 | 0 | 0 | 277 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 513 | — |
| **Total** |  | **176** | **72** | **99** | **5** | **0** | **2,412** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 127 · pnpm 1 · tsc 3 · vitest 3 · other 528

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r026-3-examples-acp-agent | 43 | 43 | 42 | 4 | 43 | 1,466 |
| r026-1-root | 28 | 28 | 28 | 8 | 28 | 1,062 |
| r026-2-packages-core | 49 | 49 | 49 | 2 | 49 | 1,498 |
| **lead** | — | — | — | — | 143 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r026-1-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r026-3-examples-acp-agent | 0 | 1 | 1 | 1 | 50 | 50 / 50 |
| r026-2-packages-core | 0 | 1 | 1 | 1 | 33 | 33 / 33 |
| **lead repair** | 1 | — | 1 | — | — | 108,145 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r025) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 640.9 MiB (14.3 MiB / 560.8 MiB / 12.6 MiB / 53.1 MiB) | 645.8 MiB (15.3 MiB / 560.8 MiB / 13.5 MiB / 56.2 MiB) | +5.0 MiB |
| Version figures from | — | incremental (57,766 changed paths) | — |
| Files / directories / symlinks | 47,057 / 7,980 / 3,315 | 47,827 / 8,016 / 3,440 | +770 / +36 / +125 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 627.9 MiB | 669.9 MiB | +42.0 MiB |
| **Space amplification** (total · tracked) | 0.98× · tracked 5.40× | 1.04× · tracked 5.30× | 0.06 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.71** (1.59 / 0.29 / 1.27) | 2.54× the median range |
| **Stored per Commit** | 51.4 KiB | 17.8 KiB | — |
| Metadata share | 0.35 | 0.36 | this range 0.42 |
| History: Commits / Layers / Branches | 27,563 | 29,975 / 15 / 221 | +2,412 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 7.27 GiB (Commits 5.58 GiB · installs 955.0 MiB · build 112.3 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 44.61 GiB / 42% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 428.7 MiB | 0.66 | +21.2 MiB |
| Metadata | 55.0 MiB | 0.09 | +3.9 MiB |
| Index rows + waste + other (live, not split) | 186.2 MiB | 0.29 | — |
| **Total = Store on disk** | **669.9 MiB** | **= 1.04** space amplification | +42.0 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 15.3 MiB | 81.0 MiB (46.7 MiB + 34.4 MiB) | 5.30× | — | 3.6 MiB | 7.6 MiB | 0.48 |
| `node_modules` | 560.8 MiB | 174.7 MiB (164.0 MiB + 10.6 MiB) | 0.31× | — | 810.1 KiB | 127.2 KiB | 6.37 |
| Build output | 13.5 MiB | 10.0 MiB (9.5 MiB + 511.6 KiB) | 0.74× | — | 1.3 MiB | 5.6 MiB | 0.23 |
| `.git` | 56.2 MiB | 216.3 MiB (208.5 MiB + 7.8 MiB) | 3.85× | — | 19.4 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 186.2 MiB | — (not divided) | — | 16.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 1.8 MiB | — | — | — | — | — |
| **Total** | — | **669.9 MiB** | **= 1.04×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +8,231 | — | 0 (derived) | 61% |
| Chunks (large files) | — (at snapshots) | +1,086 | — | — | 8% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 6,865 (with inodes, pooled) | — | — | 70% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +3,483 | — | — | — |

Delta: 3.3% at depth cap · 18% of refused bases stopped by budget · `node_modules` reinstall: absolute: 733982 new stored bytes for 3705 raw changed bytes of 127 changed packages (198.106×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.30× (81.0 MiB for 15.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.1 KiB / 4.3 KiB / 11.7 KiB over 263 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.1 MiB stored for 1.64 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.35 (3 lanes × 645.8 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 1.6 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.2 ms / 24.2 ms | 2.4 ms / 4.5 ms | 3.2 ms / 6.6 ms | 23.3 ms / 91.7 ms | 10.4 ms / 18.7 ms | 334 ms / 334 ms | — (native comparison in P3; exec 39.0 ms / 808 ms) |
| SQL p50: 168 stmts | 59 stmts | 62 stmts | 249 stmts | 45 stmts | 10,296 stmts | — |

**Commit cost:** 5.53 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 605 ms p50 over 236
**Slowest:** sandbox.exec 31134 ms · sandbox.exec 24002 ms · sandbox.exec 23191 ms · checkpoint diff_commits 0.11 ms and 1.53 statements per entry (57,606 entries per page)
**Scaling:** 2 of 15 probes flat · `stat` 0.22 · `read` 0.26 · `list_small` 0.45 · `list_largest` 1.82 · `grep_scoped` 0.47 · `glob_scoped` 0.58 · `grep_tree` 0.30 · `glob_tree` 0.47 · `diff_files` 1.94 · `list_commits` 3.32 · `diff_commits` 0.94 · `oneshot_mount_unmount` 0.64 · `oneshot_commit` 0.75

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 263 ms / 263 ms | — / — | — | git / status-cold: — |
| git status (steady) | 248 ms / 367 ms | — / — | — | git / status-steady: — |
| git add | 39.0 ms / 144 ms | — / — | — | git / add: — |
| git commit (lane) | 43.0 ms / 123 ms | — / — | — | git / commit: — |
| lead writes main | 8642 ms / 8642 ms | — / — | — | — |
| repack | 5597 ms / 5597 ms | — / — | — | — |
| pnpm install (incremental) | 3222 ms / 3222 ms | 2328 ms / 2328 ms | 1.38× | pnpm-reinstall / cold: — |
| pnpm refresh | 2494 ms / 2494 ms | 1593 ms / 1593 ms | 1.57× | pnpm-reinstall / steady: — |
| tsc -b | 369 ms / 369 ms | 174 ms / 6032 ms | 2.12× | tsc-b / cold: — |
| vitest | 3646 ms / 3646 ms | 2559 ms / 2559 ms | 1.42× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.6 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.6 ms / 22.7 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4148872 → 4194304 B · fs.write ≤8 KiB 4148872 → 4194304 B · fs.write ≤64 KiB 4148872 → 4194304 B · fs.read ≤8 KiB 4713312 → 4194304 B · sandbox.mount 4194304 → 2776912 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 12.13 at the first command → 8.26 after the last (max 12.13 over 6 commands) · Docker VM 2.82 → 2.31

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-026.a1)

## 5. Findings and action

### Finding 026.a1 · optimize

**1. Trigger** (attempt 1, daemon `45a196ef16c6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.726 | < 0.05 |

Diagnosis pending: `finding-026.a1.json`.

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

- **a1 (`p3-main-r`, live after r25 a1, daemon `45a196ef`, addon `4668012e`; binaries from main 3ef00d32e5, owner 2026-10-20): OPTIMIZE, terminal under the fast-mode ruling (counter rows are recorded, not stops).** Checkpoint ok, git ✓. Node: 16 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,167 emitted). Control `control-026.a1` passes.
  - The only optimize row is Counters `glob_tree.vm_steps` per tree file, with depth exponent 0.726. It is recorded, as at r25 (`glob_tree.statements`).
  - `r026-1-root.end` calibrated no test: all 71 candidates fail natively at that tree, so P5 is n/a.
  - Final steps: repair 117 s (160 s alarm), verify 12 s, finish 36 s. Repair build 18.6 s, install 31.1 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3750/3750; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms in total (entries exponent -0.25): tree files exponent 0.253 | < 0.15 | watch |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.726 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.418 | < 0.5 | pass |
| Reinstall growth | absolute: 733982 new stored bytes for 3705 raw changed bytes of 127 changed packages (198.106×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0328 (budget 0.1821) | < 0.1 | pass |
| Range growth | 43.5 MiB, 0.64× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.42 | < 0.8 | pass |
| Wall projection | 0.99 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 143 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 164 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 176 | 177 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 2412 | 2283 |
| Workspaces (one-shot share) | 236 (0.99) | 98 (0.98) |
| Reads | 417 | 417 |
| Reconcile writes | 506 | 506 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 22 | 17.58 | 293.56 | 304.35 | 348.31 | no baseline | no baseline | -1.94 | -1.99 | 225 / 27,196 / 0 | — | 0.0749 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 304 | 22.21 | 36.98 | 72.08 | 315.41 | no baseline | no baseline | 0.24 | 0.42 | 307 / 32,332 / 0 | — | 0.1161 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 2.22 | 5.59 | 5.59 | 5.84 | no baseline | no baseline | 3.40 | 5.30 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 1.38 | 1.38 | 1.38 | 2.14 | no baseline | no baseline | 0.39 | -0.07 | 70 / 1,298 / 0 | — | 0.0688 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 333.81 | 333.81 | 333.81 | 423.74 | no baseline | no baseline | -0.34 | 0.24 | 10,296 / 621,744 / 0 | — | 1.2004 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.18 | 1.18 | 1.18 | 1.18 | no baseline | no baseline | — | — | 35 / 517 / 0 | — | 0.0091 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 9.45 | 9.45 | 9.45 | 9.45 | no baseline | no baseline | -1.21 | -0.99 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 43.31 | 43.31 | 43.31 | 43.31 | no baseline | no baseline | 2.10 | 1.77 | 209 / 21,329 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 3 | 10.36 | 10.36 | 10.36 | 14.13 | no baseline | no baseline | -2.21 | -3.03 | 143 / 7,723 / 0 | — | 0.0543 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 9 | 7.07 | 9.04 | 9.04 | 9.94 | no baseline | no baseline | -0.33 | -0.55 | 136 / 7,420 / 0 | — | 0.0189 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 16 | 11.22 | 27.76 | 27.76 | 54.05 | no baseline | no baseline | -10.61 | -12.78 | 315 / 28,262 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 13 | 7.08 | 8.90 | 8.90 | 11.16 | no baseline | no baseline | -0.55 | -0.79 | 111 / 4,313 / 0 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 21 | 11.69 | 17.57 | 17.57 | 35.66 | no baseline | no baseline | -3.63 | -4.57 | 328 / 24,473 / 0 | — | 0.0047 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 16 | 7.68 | 10.45 | 10.45 | 11.16 | no baseline | no baseline | 0.35 | 0.32 | 123 / 7,351 / 0 | — | 0.0017 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 10 | 7.79 | 11.66 | 11.66 | 16.01 | no baseline | no baseline | -1.23 | -1.23 | 255 / 12,075 / 0 | — | 0.0279 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 27 | 7.51 | 10.82 | 10.95 | 11.07 | no baseline | no baseline | -0.54 | -0.52 | 171 / 8,754 / 0 | — | 0.0272 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 8.76 | 12.82 | 12.82 | 19.59 | no baseline | no baseline | 1.21 | 1.36 | 275 / 13,797 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 11 | 8.55 | 10.74 | 10.74 | 10.79 | no baseline | no baseline | 0.32 | 1.26 | 195 / 11,098 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 5 | 10.54 | 13.86 | 13.86 | 14.98 | no baseline | no baseline | 0.94 | 1.29 | 227 / 11,493 / 0 | — | 0.0036 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 8 | 6.43 | 8.72 | 8.72 | 9.15 | no baseline | no baseline | 0.55 | -0.05 | 161 / 8,496 / 0 | — | 0.0012 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 2.42 | 2.42 | 2.42 | 2.42 | no baseline | no baseline | 1.47 | 1.63 | 55 / 3,128 / 0 | — | 2.416 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 5.11 | 5.11 | 5.11 | 16.59 | no baseline | no baseline | 1.75 | 2.51 | 136 / 8,871 / 0 | — | 0.2104 ms per file | — |
| fs.glob | 17–64 files · uncontended | 7 | 3.19 | 6.55 | 6.55 | 7.79 | no baseline | no baseline | 0.40 | 0.45 | 66 / 5,865 / 0 | — | 0.1448 ms per file | — |
| fs.glob | 2–4 files · contended | 3 | 3.91 | 3.91 | 3.91 | 8.39 | no baseline | no baseline | 2.24 | 2.29 | 87 / 4,539 / 0 | — | 1.9565 ms per file | — |
| fs.glob | 2–4 files · uncontended | 13 | 2.10 | 2.56 | 2.56 | 6.67 | no baseline | no baseline | 0.26 | 0.18 | 45 / 3,671 / 0 | — | 0.7017 ms per file | — |
| fs.glob | 5–16 files · contended | 10 | 3.30 | 4.21 | 4.21 | 9.81 | no baseline | no baseline | 0.71 | 0.98 | 77 / 5,598 / 0 | — | 0.4033 ms per file | — |
| fs.glob | 5–16 files · uncontended | 14 | 3.30 | 4.97 | 4.97 | 12.98 | no baseline | no baseline | 1.22 | 1.64 | 65 / 6,457 / 0 | — | 0.4546 ms per file | — |
| fs.glob | >64 files · contended | 3 | 34.38 | 34.38 | 34.38 | 37.66 | no baseline | no baseline | 5.19 | 7.14 | 708 / 51,162 / 0 | — | 0.0183 ms per file | — |
| fs.glob | >64 files · uncontended | 18 | 4.51 | 16.10 | 16.10 | 31.04 | no baseline | no baseline | -0.85 | -1.14 | 87 / 7,370 / 0 | — | 0.0418 ms per file | — |
| fs.grep | 1 files · uncontended | 2 | 1.66 | 1.66 | 1.66 | 1.80 | no baseline | no baseline | -0.41 | -0.41 | 42 / 2,607 / 0 | — | 1.658 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 2 | 6.58 | 6.58 | 6.58 | 15.94 | no baseline | no baseline | -3.01 | -3.10 | 252 / 10,343 / 0 | — | 0.3463 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 5.89 | 11.40 | 11.40 | 12.71 | no baseline | no baseline | -0.55 | -0.46 | 155 / 8,519 / 0 | — | 0.218 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 5 | 3.61 | 4.27 | 4.27 | 4.89 | no baseline | no baseline | 0.74 | 1.12 | 122 / 5,771 / 0 | — | 1.2605 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 11 | 2.67 | 3.76 | 3.76 | 7.15 | no baseline | no baseline | 0.27 | -0.26 | 72 / 3,934 / 0 | — | 0.891 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 13 | 9.82 | 19.55 | 19.55 | 490.34 | no baseline | no baseline | 3.50 | 4.63 | 181 / 9,746 / 0 | — | 1.0916 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 9 | 4.25 | 7.17 | 7.17 | 24.52 | no baseline | no baseline | 0.07 | 0.09 | 104 / 5,426 / 0 | — | 0.6729 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 5 | 25.67 | 33.13 | 33.13 | 58.09 | no baseline | no baseline | -3.19 | -3.77 | 797 / 37,111 / 0 | — | 0.1808 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 16 | 12.73 | 35.50 | 35.50 | 42.86 | no baseline | no baseline | -2.62 | -3.13 | 235 / 10,429 / 0 | — | 0.1473 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 2 | 3.24 | 3.24 | 3.24 | 3.38 | no baseline | no baseline | — | — | 40 / 2,548 / 0 | — | 3.242 ms per entrie | — |
| fs.list | 1 entries · uncontended | 3 | 1.38 | 1.38 | 1.38 | 1.56 | no baseline | no baseline | -0.18 | -0.51 | 34 / 2,211 / 0 | — | 1.38 ms per entrie | — |
| fs.list | 17–64 entries · contended | 8 | 5.51 | 6.64 | 6.64 | 7.95 | no baseline | no baseline | 0.20 | 0.35 | 126 / 12,408 / 0 | — | 0.2027 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 16 | 3.35 | 4.91 | 4.91 | 6.97 | no baseline | no baseline | -0.64 | -0.94 | 64 / 5,475 / 0 | — | 0.067 ms per entrie | — |
| fs.list | 2–4 entries · contended | 4 | 2.70 | 4.32 | 4.32 | 5.29 | no baseline | no baseline | 1.32 | 1.75 | 62 / 3,602 / 0 | — | 0.918 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 14 | 2.29 | 5.85 | 5.85 | 14.73 | no baseline | no baseline | 0.26 | 0.13 | 54 / 3,575 / 0 | — | 0.829 ms per entrie | — |
| fs.list | 5–16 entries · contended | 7 | 3.44 | 5.62 | 5.62 | 6.45 | no baseline | no baseline | 0.67 | 1.10 | 89 / 5,799 / 0 | — | 0.4916 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 15 | 2.70 | 4.42 | 4.42 | 8.09 | no baseline | no baseline | 0.84 | 0.94 | 56 / 4,203 / 0 | — | 0.3212 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 8 | 1.90 | 2.67 | 2.67 | 3.84 | no baseline | no baseline | -1.34 | -2.23 | 52 / 2,867 / 0 | — | 0.0032 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 2 | 2.73 | 2.73 | 2.73 | 3.39 | no baseline | no baseline | — | — | 83 / 6,423 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.22 | 2.25 | 2.25 | 2.53 | no baseline | no baseline | -0.19 | -0.20 | 59 / 3,959 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 14 | 2.79 | 6.42 | 6.42 | 8.51 | no baseline | no baseline | 0.68 | 0.73 | 97 / 5,053 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 39 | 2.36 | 4.45 | 4.55 | 5.47 | no baseline | no baseline | 0.19 | -0.01 | 57 / 3,365 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 32 | 13.10 | 45.43 | 54.36 | 60.30 | no baseline | no baseline | 0.88 | 0.87 | 300 / 18,971 / 0 | — | 13.101 ms per file | commit |
| fs.rm | 1 files · uncontended | 81 | 7.34 | 20.25 | 32.42 | 33.29 | no baseline | no baseline | -0.60 | -0.71 | 141 / 7,800 / 0 | — | 7.341 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 2 | 4.10 | 4.10 | 4.10 | 4.12 | no baseline | no baseline | 3.18 | 4.41 | 97 / 6,199 / 0 | — | 0.0087 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 4 | 2.55 | 2.88 | 2.88 | 10.03 | no baseline | no baseline | 0.87 | 0.94 | 50 / 3,247 / 0 | — | 0.0048 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 2.58 | 2.58 | 2.58 | 3.20 | no baseline | no baseline | -1.96 | -3.27 | 44 / 3,669 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 4 | 2.33 | 2.38 | 2.38 | 105.10 | no baseline | no baseline | 1.33 | 1.34 | 48 / 2,903 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 7 | 3.23 | 5.72 | 5.72 | 8.81 | no baseline | no baseline | 1.32 | 1.63 | 60 / 4,025 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 13 | 2.20 | 2.60 | 2.60 | 4.10 | no baseline | no baseline | 0.31 | 0.16 | 50 / 3,317 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 5 | 2.34 | 2.53 | 2.53 | 3.46 | no baseline | no baseline | -1.18 | -1.10 | 67 / 3,862 / 0 | — | 0.001 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 32 | 2.00 | 5.22 | 9.70 | 9.77 | no baseline | no baseline | 0.36 | 0.06 | 47 / 2,902 / 0 | — | 0.0007 ms per byte | — |
| fs.write | ≤1 KiB · contended | 124 | 10.37 | 28.55 | 47.07 | 88.18 | no baseline | no baseline | 0.89 | 1.03 | 370 / 18,760 / 0 | — | 0.0184 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 171 | 6.47 | 10.96 | 18.25 | 34.26 | no baseline | no baseline | -0.52 | -1.02 | 139 / 6,137 / 0 | — | 0.0101 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 27 | 15.02 | 36.34 | 48.23 | 87.88 | no baseline | no baseline | -1.64 | -1.50 | 355 / 17,447 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 39 | 9.99 | 15.16 | 15.31 | 15.62 | no baseline | no baseline | -0.19 | -0.37 | 153 / 7,114 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 186 | 13.69 | 47.80 | 111.36 | 144.97 | no baseline | no baseline | 1.19 | 1.46 | 375 / 20,473 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 388 | 7.59 | 13.14 | 22.61 | 117.07 | no baseline | no baseline | -0.18 | -0.28 | 164 / 6,682 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 426 | 12.02 | 30.81 | 68.77 | 165.09 | no baseline | no baseline | 0.40 | 0.50 | 370 / 20,363 / 0 | — | 0.0072 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 678 | 6.76 | 12.19 | 19.23 | 31.94 | no baseline | no baseline | -0.26 | -0.51 | 143 / 6,376 / 0 | — | 0.004 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.81 | 0.81 | 0.81 | 0.81 | no baseline | no baseline | 1.12 | 1.57 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 47 | 35.19 | 91.68 | 98.59 | 149.98 | no baseline | no baseline | 1.15 | 1.38 | 418 / 37,708 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 74 | 33.54 | 81.86 | 133.23 | 409.18 | no baseline | no baseline | 1.88 | 2.36 | 366 / 38,775 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 13 | 3.69 | 7.74 | 7.74 | 7.87 | no baseline | no baseline | -0.35 | -0.38 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 31 | 3.36 | 5.76 | 5.87 | 11.33 | no baseline | no baseline | -0.23 | -0.28 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 6 | 12.77 | 21.47 | 21.47 | 23.71 | no baseline | no baseline | 0.31 | 0.57 | 135 / 5,325 / 0 | — | 12.765 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 5 | 8.93 | 9.21 | 9.21 | 11.84 | no baseline | no baseline | -0.27 | -0.36 | 130 / 5,092 / 0 | — | 8.932 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 298.74 | 298.74 | 298.74 | 298.74 | no baseline | no baseline | -0.66 | -0.33 | 10,280 / 338,959 / 0 | — | 298.738 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · contended | 1 | 4.19 | 4.19 | 4.19 | 4.19 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 4.189 ms per file | observe.after |
| sandbox.commit | 17–64 files · Committed · uncontended | 1 | 23.32 | 23.32 | 23.32 | 23.32 | no baseline | no baseline | — | — | 350 / 25,253 / 0 | — | 1.2274 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 6 | 12.10 | 16.78 | 16.78 | 36.06 | no baseline | no baseline | -2.03 | -1.80 | 185 / 9,792 / 0 | — | 4.55 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 21 | 12.07 | 16.59 | 16.59 | 17.83 | no baseline | no baseline | 0.38 | 0.66 | 151 / 6,276 / 0 | — | 4.024 ms per file | commit |
| sandbox.commit | 2–4 files · UpToDate · uncontended | 1 | 3.41 | 3.41 | 3.41 | 3.41 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 1.706 ms per file | observe.after |
| sandbox.commit | 5–16 files · Committed · contended | 5 | 15.70 | 21.61 | 21.61 | 44.51 | no baseline | no baseline | 0.61 | 0.16 | 205 / 14,178 / 0 | — | 3.1406 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 5 | 17.72 | 18.70 | 18.70 | 23.22 | no baseline | no baseline | -0.51 | 0.06 | 243 / 14,684 / 0 | — | 2.1116 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 114.08 | 114.08 | 114.08 | 114.08 | no baseline | no baseline | -5.93 | -7.11 | 1,502 / 180,368 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 8 | 79.58 | 744.34 | 744.34 | 15290.24 | no baseline | no baseline | 1.16 | 1.27 | 1,178 / 125,390 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 2 | 3.38 | 3.38 | 3.38 | 3.52 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 239 | 46.98 | 842.64 | 1196.19 | 4079.87 | no baseline | no baseline | -5.93 | -10.14 | — | 3,040 | — | — |
| sandbox.exec | 0 files · uncontended | 148 | 34.90 | 596.80 | 1715.41 | 8771.71 | no baseline | no baseline | 0.12 | 0.07 | — | 3,247 | — | — |
| sandbox.exec | 1 files · contended | 29 | 34.00 | 53.17 | 57.57 | 65.70 | no baseline | no baseline | -0.68 | -1.03 | — | 4.30 | 34.001 ms per file | — |
| sandbox.exec | 1 files · uncontended | 13 | 34.99 | 49.31 | 49.31 | 50.06 | no baseline | no baseline | -0.07 | -0.07 | — | 4 | 34.993 ms per file | — |
| sandbox.exec | 17–64 files · contended | 10 | 65.38 | 77.80 | 77.80 | 81.58 | no baseline | no baseline | -0.63 | -0.31 | — | 103 | 3.269 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 14 | 66.33 | 82.85 | 82.85 | 122.85 | no baseline | no baseline | 0.91 | 1.12 | — | 98 | 3.4008 ms per file | — |
| sandbox.exec | 2–4 files · contended | 41 | 39.02 | 75.97 | 77.85 | 243.60 | no baseline | no baseline | 0.23 | 0.04 | — | 11 | 12.2245 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 60 | 35.38 | 91.82 | 105.10 | 170.91 | no baseline | no baseline | 0.70 | 0.36 | — | 11 | 12.3675 ms per file | — |
| sandbox.exec | 5–16 files · contended | 29 | 36.72 | 76.71 | 78.34 | 91.67 | no baseline | no baseline | -1.62 | -2.13 | — | 16.70 | 6.1198 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 31 | 51.16 | 106.84 | 113.45 | 161.77 | no baseline | no baseline | 0.24 | 0.09 | — | 25.70 | 5.9431 ms per file | — |
| sandbox.exec | — · contended | 9 | 3217.22 | 23191.19 | 23191.19 | 24001.51 | no baseline | no baseline | -0.93 | -0.98 | — | 33524.80 | — | — |
| sandbox.exec | — · uncontended | 29 | 272.02 | 14052.32 | 18601.16 | 31134.06 | no baseline | no baseline | 2.18 | 2.15 | — | 33175.90 | — | — |
| sandbox.mount | — · contended | 86 | 11.21 | 21.39 | 31.61 | 39.18 | no baseline | no baseline | -0.16 | -0.12 | 62 / 1,647 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 140 | 10.01 | 17.20 | 22.02 | 70.32 | no baseline | no baseline | 0.03 | -0.04 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.52 | 3.52 | 3.52 | 3.52 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 6.58 | 6.58 | 6.58 | 34.40 | no baseline | no baseline | 1.96 | 2.78 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 69 | 10.05 | 18.77 | 24.98 | 41.62 | no baseline | no baseline | -0.70 | -0.94 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 157 | 11.11 | 25.72 | 105.14 | 175.11 | no baseline | no baseline | 0.28 | 0.18 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 22 | 0.0 KiB | 1.1 MiB | 5,151 | ok 22 |
| branch.diff_commits | branch | 309 | 0.0 KiB | 16.9 MiB | 58,281 | ok 309 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 9 | 0.0 KiB | 85.6 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 91 | 3.2 MiB | 0.0 KiB | 102 | Committed 91 |
| fs.diff_files | fs | 72 | 0.0 KiB | 477.4 KiB | 47 | Text 45, NoSuchPath 25, Equal 2 |
| fs.glob | fs | 82 | 0.0 KiB | 75.0 KiB | 942 | ok 82 |
| fs.grep | fs | 78 | 0.0 KiB | 290.7 KiB | 1,160 | ok 78 |
| fs.list | fs | 81 | 0.0 KiB | 247.6 KiB | 1,630 | ok 81 |
| fs.read | fs | 72 | 0.0 KiB | 215.4 KiB | 72 | ok 72 |
| fs.rm | fs | 113 | 0.0 KiB | 0.0 KiB | 113 | Committed 113 |
| fs.stat | fs | 77 | 0.0 KiB | 17.1 KiB | 77 | ok 77 |
| fs.write | fs | 2,039 | 24.0 MiB | 0.0 KiB | 2,039 | Committed 2039 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 233 | 0.0 KiB | 0.0 KiB | 0 | Committed 184, Conflict 1, UpToDate 48 |
| sandbox.exec | sandbox | 662 | 3.2 MiB | 3.6 MiB | 0 | exit:0 659, exit:4 2, exit:2 1 |
| sandbox.mount | sandbox | 236 | 0.0 KiB | 0.0 KiB | 0 | Mounted 236 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 236 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 236 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 2.82 · end 2.31.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.19 | 28.994 · 1.19 · 0.985 · 0.983 · 2.344 | 3.22–3.22 | statements 25, vm_steps 894, fullscan_steps 0, sorts 0, returned_rows 74 |
| read | 1.107 | 1.355 · 1.04 · 1.107 · 1.081 · 1.53 | 3.22–3.22 | statements 14, vm_steps 654, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_small | 1.08 | 1.448 · 1.187 · 1.08 · 0.936 · 0.883 | 3.22–3.22 | statements 14, vm_steps 663, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_largest | 3.477 | 4.641 · 3.525 · 3.415 · 3.191 · 3.477 | 3.22–3.22 | statements 78, vm_steps 6983, fullscan_steps 0, sorts 0, returned_rows 706 |
| grep_scoped | 1.348 | 2.188 · 1.313 · 1.22 · 1.348 · 1.786 | 3.22–3.22 | statements 19, vm_steps 809, fullscan_steps 0, sorts 0, returned_rows 72 |
| glob_scoped | 1.104 | 1.56 · 1.026 · 0.875 · 1.104 · 2.143 | 3.22–3.22 | statements 13, vm_steps 642, fullscan_steps 0, sorts 0, returned_rows 62 |
| grep_tree | 4258.35 | 4482.706 · 4258.35 · 4222.049 · 4258.863 · 4175.008 | 2.54–3.04 | statements 42158, vm_steps 3312157, fullscan_steps 0, sorts 0, returned_rows 335259 |
| glob_tree | 6.284 | 8.574 · 6.008 · 6.841 · 6.284 · 6.11 | 2.54–2.54 | statements 123, vm_steps 14826, fullscan_steps 0, sorts 0, returned_rows 1515 |
| diff_files | 7.777 | 7.777 · 7.579 · 9.236 · 8.229 · 7.46 | 2.54–2.54 | statements 72, vm_steps 3880, fullscan_steps 0, sorts 0, returned_rows 384 |
| list_commits | 1.441 | 3.967 · 1.441 · 1.82 · 1.158 · 1.103 | 2.54–2.54 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.053 | 4.015 · 3.053 · 2.807 · 3.296 · 2.909 | 2.54–2.54 | statements 59, vm_steps 2134, fullscan_steps 0, sorts 0, returned_rows 242 |
| fork | 0.576 | 0.784 · 1.032 · 0.568 · 0.576 · 0.571 | 2.54–2.54 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 24.811 | 27.526 · 23.802 · 25.235 · 24.811 · 24.306 | 2.54–2.54 | statements 442, vm_steps 20873, fullscan_steps 0, sorts 0, returned_rows 1596 |
| oneshot_mount_unmount | 18.963 | 21.829 · 18.202 · 20.831 · 17.972 · 18.963 | 2.54–2.54 | statements 59, vm_steps 2114, fullscan_steps 82, sorts 2, returned_rows 210 |
| oneshot_commit | 84.881 | 86.809 · 77.609 · 84.881 · 88.659 · 73.674 | 2.54–2.54 | statements 164, vm_steps 10478, fullscan_steps 82, sorts 2, returned_rows 821 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.54–2.54 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 261.1 s** (tooling): play 95.2 · consolidate 113.2 · verify 16.2 · probes 22.5 · tests 0.0 · seal + snapshot 0.0 · report 14.0

261.10 s tooling: prepare 4.69 · play 90.49 · consolidate 113.17 · verify 8.92 (diff_commits) · version walk 7.30 · probes 22.52 · metrics 0.96 · Store allocation 0.27 · report 0.30

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T20:57:41.110Z | optimize | Speed: not judged: baseline not set (pilot); Scaling: branch.diff_commits checkpoint ms in total (entries exponent -0.25): tree files exponent 0.253; Counters: glob_tree.vm_steps per tree file: depth exponent 0.726; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-026.a1.json`
- trace `~/lfs-history/runs/p3-main-r/trace/range-026.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-r/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r026-3-examples-acp-agent | 1,466 | 262.8 KiB |
| r026-1-root | 1,062 | 257.3 KiB |
| r026-2-packages-core | 1,498 | 269.2 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 248.0 | 2,134 |
| `git diff --stat` | 36.0 | 2,118 |
| `git add -f` | 39.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 43.0 | 2,127 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r026-1-root | end | P1 | pass | — | — |
| r026-1-root | end | P2 | pass | exit 0 | — |
| r026-1-root | end | P3 | n/a | an install, not a refresh | — |
| r026-1-root | end | P4 | pass | 197 emitted files, exit 4 | — |
| r026-1-root | end | P5 | n/a | no calibrated file | — |
| r026-1-root | end | P6 | n/a | not a repair | — |
| r026-3-examples-acp-agent | end | P1 | pass | — | — |
| r026-3-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r026-3-examples-acp-agent | end | P3 | pass | 198 bookkeeping path(s) | — |
| r026-3-examples-acp-agent | end | P4 | pass | 214 emitted files, exit 4 | — |
| r026-3-examples-acp-agent | end | P5 | pass | 50 files | — |
| r026-3-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r026-2-packages-core | end | P1 | pass | — | — |
| r026-2-packages-core | end | P2 | pass | exit 0 | — |
| r026-2-packages-core | end | P3 | pass | 198 bookkeeping path(s) | — |
| r026-2-packages-core | end | P4 | pass | 383 emitted files, exit 2 | — |
| r026-2-packages-core | end | P5 | pass | 33 files | — |
| r026-2-packages-core | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1167 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
