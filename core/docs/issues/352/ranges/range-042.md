# Range 042 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r041 (live Store)
dsh `e8cbf6cc7`..`c03c4fdbd` · **70 commits** (11 mainline, 59 side) · 2026-07-27 → 2026-07-27
Areas changed: `/` 16% · `.agents/notes` 9% · `docs` 7% · other 68%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 20 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.23×** · **Churn 0.00**
**Time split:** play 97.8 s · git 130.6 s · Node 234.8 s · verify 14.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **792.4 MiB** (+13.3 MiB) | **1.15 GiB** (+35.3 MiB) | **1.49×** (prev 1.47×) | **41.4 MiB** | **1,210** (total 50,146) | **288.2 s** tooling (total 134.3 min) |

**Checks:** 15 pass · 3 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.22× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.267) and statements per entry does not rise (0.02): the fixed and per-entry parts cannot be separated; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (23 classes too narrow) · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▼ fs.write p95 −48% · ▼ probe stat −39% · ▼ probe list_small −39%
**Budget:** 43 of 202 ranges · projected total 15.5 h (budget 16.8 h) · disk 42% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,330 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 1 publish |
| Steps | 2,530 / 2,530 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2902 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 405 bin shims, 4422 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (50 lines from 3 .gitignore files) · **232 picks** in 4 merges (232 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `c03c4fdbd`** · 133 commits written for 133 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 232 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r042-4-packages-telemetry | end | `100382b39993` | `ba21611eef26` | pass (401 normalized) | pass | pass | pass | n/a | n/a |
| r042-1-root | end | `d7d7affd46fe` | `45f7f58bcb89` | pass (405 normalized) | pass | n/a | pass | n/a | n/a |
| r042-2-agents-notes | end | `21c3fa7209ac` | `ba21611eef26` | pass (401 normalized) | pass | pass | pass | pass | n/a |
| r042-3-packages-subprocess | end | `f12a8dd12513` | `ba21611eef26` | pass (401 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `a4d996a62b9f` | `null` | n/a | pass | n/a | n/a | pass | pass (137,062 rewritten) |

P5 skip list (failing natively, set at calibration): `apps/cli/tests/args.spec.ts` (fails natively) · `packages/bash/bash-local/tests/executor.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/bash/tests/service.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/sdk/create-sdk/tests/create.spec.ts` (fails natively) · `packages/sdk/helper/tests/documents.spec.ts` (fails natively) · `packages/sdk/helper/tests/headless-prompt-port.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/sdk/helper/tests/questions.spec.ts` (fails natively) · `packages/session-title/session-title-llm/tests/llm.spec.ts` (fails natively) · `apps/cli/tests/args.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/hmr/tests/node-half.spec.ts` (fails natively) · `packages/client/modules/tests/loader.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-machine.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/queue-dock.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/app-frame.spec.tsx` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-layout/tests/columns.spec.ts` (fails natively) · `packages/client/ui-layout/tests/layout-store.spec.ts` (fails natively) · `packages/client/ui-layout/tests/service.spec.ts` (fails natively) · `packages/client/ui-layout/tests/theme-presenter.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/code-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/appearance-row.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/apply.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/settings-store.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/bootstrap.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/output-json.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/runtime.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/source-worker.compat.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/worker-json.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/examples/tui-demo/tests/tui-agent.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-directory-picker.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/host/webserver/tests/webserver.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/serialize.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/sse.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/translate.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/loader-composition.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/persistence.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/retry.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/transport-recovery.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/apply.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/load-path.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/render.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/tools.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/scripted-provider.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/normalize.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/example-launch.spec.ts` (fails natively) · `packages/support/loader-smoke/tests/loader-smoke.spec.ts` (fails natively) · `packages/tasks/tasks/tests/invariant.spec.ts` (fails natively) · `packages/tasks/tasks/tests/service.spec.ts` (fails natively) · `packages/tasks/tool-tasks/tests/tool-tasks.spec.ts` (fails natively) · `packages/web/tool-web/tests/integration.spec.ts` (fails natively) · `packages/web/tool-web/tests/load-path.spec.ts` (fails natively) · `packages/web/tool-web/tests/spill.spec.ts` (fails natively) · `packages/web/tool-web/tests/tool-web.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/integration.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/connection.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/framing.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/host.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/instance.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/lifecycle.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/provider.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/translate.spec.ts` (fails natively) · `packages/lsp/tool-lsp/tests/integration.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively).

## 2. Activity

**3,336 calls** · **202 steps** by **9 agents + lead** on **4 Branches + main** · **253 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +140 added · 896 modified · −78 deleted · 18.0 MiB written · fs 1,019 : Sandbox 95 (**11 : 1**, reported only in P3)
**Execs:** 685 (JS 74 · shell 611) · 3 non-zero exits · install 0 · test runs 3 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,427 | 1,032 | 395 | Committed 1,032 · Text 38 · NoSuchPath 22 · Equal 1 |
| sandbox | 1,446 | 935 | 5 | commit 250 (Committed 192, UpToDate 57, Conflict 1) · exec 685 (exit:0 682, exit:2 3) · mount 253 (Mounted 253) · status 5 · unmount 253 (Unmounted 253) |
| branch | 452 | 34 | 418 | diff_branches 15 · diff_commits 403 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,336** | **2,001** | **829** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r042-1-root | a01 a02 | 35 | 268 | ✓ | — |
| r042-2-agents-notes | a03 a04 a05 | 76 | 266 | ✓ | — |
| r042-3-packages-subprocess | a06 a07 | 44 | 273 | ✓ | — |
| r042-4-packages-telemetry | a08 a09 | 40 | 255 | ✓ | — |
| main | lead | 7 | 148 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r042-1, a01 after a02 | 0.1 s |
| Stale clean merge | 1 / 1 | r042-1, a02 a01 | merged cleanly |
| Decoy edit | 1 / 1 | r042-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r042-1 | 20 | 7 | 13 | 0 | 0 | 125 | commit-conflict, stale-clean-merge, decoy |
| a02 | r042-1 | 15 | 8 | 7 | 0 | 0 | 143 | commit-conflict, stale-clean-merge, decoy |
| a03 | r042-2 | 17 | 7 | 10 | 0 | 0 | 50 | — |
| a04 | r042-2 | 22 | 11 | 11 | 0 | 0 | 68 | — |
| a05 | r042-2 | 37 | 20 | 17 | 0 | 0 | 148 | — |
| a06 | r042-3 | 27 | 16 | 11 | 0 | 0 | 209 | — |
| a07 | r042-3 | 17 | 9 | 8 | 0 | 0 | 64 | — |
| a08 | r042-4 | 21 | 8 | 13 | 0 | 0 | 151 | — |
| a09 | r042-4 | 19 | 9 | 10 | 0 | 0 | 104 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 148 | — |
| **Total** |  | **202** | **96** | **100** | **6** | **0** | **1,210** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 142 · pnpm 1 · tsc 4 · vitest 3 · other 535

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r042-4-packages-telemetry | 28 | 28 | 28 | 4 | 28 | 521 |
| r042-2-agents-notes | 51 | 51 | 51 | 4 | 51 | 577 |
| r042-3-packages-subprocess | 34 | 34 | 33 | 2 | 34 | 595 |
| r042-1-root | 21 | 21 | 21 | 6 | 21 | 333 |
| **lead** | — | — | — | — | 133 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r042-4-packages-telemetry | 0 | 1 | 1 | 0 | 0 | — / — |
| r042-1-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r042-2-agents-notes | 0 | 1 | 1 | 1 | 16 | 16 / 16 |
| r042-3-packages-subprocess | 0 | 1 | 1 | 1 | 76 | 76 / 76 |
| **lead repair** | 1 | — | 1 | — | — | 137,062 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r041) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 779.0 MiB (23.5 MiB / 645.3 MiB / 21.4 MiB / 88.9 MiB) | 792.4 MiB (23.8 MiB / 656.4 MiB / 21.7 MiB / 90.5 MiB) | +13.3 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 59,387 / 9,289 / 4,303 | 63,647 / 9,764 / 4,430 | +4,260 / +475 / +127 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.12 GiB | 1.15 GiB | +35.3 MiB |
| **Space amplification** (total · tracked) | 1.47× · tracked 4.93× | 1.49× · tracked 4.95× | 0.02 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **11.68** (0.82 / 0.13 / 0.58) | 1.83× the median range |
| **Stored per Commit** | 37.8 KiB | 29.5 KiB | — |
| Metadata share | 0.41 | 0.42 | this range 0.47 |
| History: Commits / Layers / Branches | 48,936 | 50,146 / 27 / 573 | +1,210 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 12.08 GiB (Commits 9.97 GiB · installs 876.1 MiB · build 102.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 41.12 GiB / 42% | — |
| Snapshot | — | r042, 1.00 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 687.7 MiB | 0.87 | +18.7 MiB |
| Metadata | 105.0 MiB | 0.13 | +3.4 MiB |
| Index rows | 331.0 MiB | 0.42 | — |
| Waste | 56.8 MiB | 0.07 | — |
| Other | 1.4 MiB | 0.00 | — |
| **Total = Store on disk** | **1.15 GiB** | **= 1.49** space amplification | +35.3 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 23.8 MiB | 117.7 MiB (64.3 MiB + 53.4 MiB) | 4.95× | — | 1.8 MiB | 3.5 MiB | 0.52 |
| `node_modules` | 656.4 MiB | 210.8 MiB (186.7 MiB + 24.1 MiB) | 0.32× | — | 3.4 MiB | 11.2 MiB | 0.30 |
| Build output | 21.7 MiB | 20.5 MiB (19.0 MiB + 1.5 MiB) | 0.94× | — | 962.8 KiB | 8.0 MiB | 0.12 |
| `.git` | 90.5 MiB | 413.8 MiB (396.5 MiB + 17.3 MiB) | 4.57× | — | 15.6 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 389.2 MiB | — (not divided) | — | 13.1 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 29.9 MiB | — | — | — | — | — |
| **Total** | — | **1.15 GiB** | **= 1.49×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 167,117 | +5,955 | 6.2 KiB | 601 (derived) | 56% |
| Chunks (large files) | 59,472 | +1,381 | 15.4 KiB | — | 10% |
| Large-file extents | 15,883 | — | 0.3 KiB | — | — |
| Directories | 342,393 | 4,940 (with inodes, pooled) | 0.3 KiB | — | 51% |
| Inodes and attributes | 318,571 | ↑ pooled | 2.8 KiB | — | — |
| Symlinks | 2,408 | +4,601 | 0.1 KiB | — | — |

Delta: 1.8% at depth cap · 25% of refused bases stopped by budget · `node_modules` reinstall: 0.2× the raw bytes of 62 changed packages (ratio: 2315785 new stored for 11597270 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.95× (117.7 MiB for 23.8 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.0 KiB / 3.3 KiB / 6.1 KiB over 267 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.23× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (4.3 MiB stored for 2.53 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.37 (4 lanes × 792.4 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.5 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.8 ms / 25.5 ms (1.06×) | 2.6 ms / 6.1 ms (1.23×) | 3.3 ms / 6.9 ms (1.69×) | 22.6 ms / 56.5 ms (1.21×) | 10.3 ms / 19.3 ms (0.90×) | 464 ms / 515 ms (5.60×) | — (native comparison in P3; exec 39.5 ms / 881 ms) |
| SQL p50: 170 stmts | 58 stmts | 68 stmts | 226 stmts | 50 stmts | 9,587 stmts | — |

**Commit cost:** 7.92 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 689 ms p50 over 253
**Slowest:** sandbox.exec 35800 ms · sandbox.exec 29750 ms · sandbox.exec 28174 ms · checkpoint diff_commits 0.10 ms and 1.52 statements per entry (73,249 entries per page)
**Scaling:** 13 of 15 probes flat · `grep_tree` 0.19 · `glob_tree` 0.23

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 361 ms / 361 ms | — / — | — | git / status-cold: — |
| git status (steady) | 382 ms / 555 ms | — / — | — | git / status-steady: — |
| git add | 36.0 ms / 91.0 ms | — / — | — | git / add: — |
| git commit (lane) | 39.0 ms / 62.0 ms | — / — | — | git / commit: — |
| lead writes main | 4899 ms / 4899 ms | — / — | — | — |
| repack | 2209 ms / 2209 ms | — / — | — | — |
| pnpm install (incremental) | 4381 ms / 4381 ms | 2068 ms / 2068 ms | 2.12× | pnpm-reinstall / cold: — |
| pnpm refresh | 2713 ms / 2713 ms | 1791 ms / 1791 ms | 1.51× | pnpm-reinstall / steady: — |
| tsc -b | 5088 ms / 7035 ms | 4757 ms / 6252 ms | 1.07× | tsc-b / cold: — |
| vitest | 3625 ms / 3625 ms | 1905 ms / 1905 ms | 1.90× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.5 ms / 27.6 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 2706872 → 4194304 B · fs.write ≤64 KiB 2628592 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2982912 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 7.10 at the first command → 4.62 after the last (max 7.38 over 8 commands) · Docker VM 1.56 → 2.26

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-042.a1)

## 5. Findings and action

### Finding 042.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |

Diagnosis pending: `finding-042.a1.json`.

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

- **a1 (`p3-main-v`, live after r41 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 20 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass (1,965 emitted). Control `control-042.a1` passes. Report check F1–F8 PASS.
- **The only optimize row** is the same Counters `merge.returned_rows` row as r41 (chain-bounded): 2,513 rows against the first period's 1,941 (1.295×, bound period 8). Recorded, not acted on (fast mode).
- **Fix 058 exempted** `.sessions/session-query.db` (session test output, gitignored by the checkpoint; not a LayerFS-relevant path).
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 14.22×). Merge p50 464 ms (5.60×, above r23–r41's band of about 3–3.4×, near r36's `diff_branches` 5.58×; this range has 4 lanes and a larger merge). One-shot Commit 1.21×, write 1.06× (8.8 ms), mount 0.90×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 4.6–7.4.
- Final steps: lead 4 s; lanes 20 s + 14 s + 14 s + 63 s (cuts at plan orders 22, 37 and 51); repair 117 s (alarm 200 s); verify 18 s; finish 52 s. Repair install 35.8 s, build 23.8 s, tests 3.6 s.
- Watch items: index rows 331.0 MiB on the live Store (#366). `fs.rm` uncontended p50 9.21 ms per file over 53 calls, 169 statements and 10,407 VM steps per call; contended 13.13 ms over 22 (296 statements, process-wide; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2530/2530; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.22× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.267) and statements per entry does not rise (0.02): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (23 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.467 | < 0.5 | pass |
| Reinstall growth | 0.2× the raw bytes of 62 changed packages (ratio: 2315785 new stored for 11597270 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.018 (budget 0.2508) | < 0.1 | pass |
| Range growth | 41.4 MiB, 1.23× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 3205 ms for 1029.0 MiB new; size exponent -0.734 | < 0.15 | pass |
| Disk projection | 0.42 | < 0.8 | pass |
| Wall projection | 0.92 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 133 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 20 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 232 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.23× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 202 | 203 |
| Lanes / agents | 4 / 9 | 4 / 9 |
| LayerFS Commits | 1210 | 1063 |
| Workspaces (one-shot share) | 253 (0.99) | 99 (0.98) |
| Reads | 352 | 352 |
| Reconcile writes | 140 | 140 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 15 | 27.08 | 347.33 | 347.33 | 512.17 | 1.67× | 6.71× | 0.03 | 0.14 | 382 / 43,067 / 0 | — | 0.1231 ms per entrie | — |
| branch.diff_commits | 2–4 entries · contended | 1 | 3.21 | 3.21 | 3.21 | 3.21 | no baseline | no baseline | — | — | 60 / 3,924 / 0 | — | 1.6075 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 2 | 6.34 | 6.34 | 6.34 | 7.64 | no baseline | no baseline | — | — | 85 / 5,522 / 0 | — | 0.6345 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 65.92 | 65.92 | 65.92 | 65.92 | no baseline | no baseline | -2.37 | -1.52 | 793 / 55,995 / 0 | — | 0.2805 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 394 | 18.92 | 36.34 | 72.24 | 348.13 | 1.10× | 1.40× | -0.26 | -0.18 | 300 / 33,267 / 0 | — | 0.1036 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.54 | 2.33 | 2.33 | 2.66 | 0.59× | 1.77× | -1.19 | -0.81 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.89 | 0.89 | 0.89 | 0.94 | no baseline | no baseline | -0.44 | -0.34 | 70 / 1,298 / 0 | — | 0.0444 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 514.54 | 514.54 | 514.54 | 523.57 | 5.60× | 5.60× | -0.45 | 0.01 | 10,641 / 807,327 / 0 | — | 5.2505 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.55 | 1.55 | 1.55 | 1.55 | 1.00× | 1.00× | -0.49 | -0.42 | 35 / 517 / 0 | — | 0.0172 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 5.35 | 5.35 | 5.35 | 5.35 | 1.06× | 1.06× | -3.39 | -2.53 | 45 / 1,014 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 26.84 | 26.84 | 26.84 | 26.84 | 1.10× | 1.10× | -0.31 | -0.17 | 167 / 12,824 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 2 | 11.38 | 11.38 | 11.38 | 17.85 | 0.96× | 0.84× | 0.19 | 0.45 | 279 / 10,997 / 0 | — | 0.0112 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 4 | 9.46 | 15.04 | 15.04 | 17.17 | 1.54× | 2.02× | -0.30 | -0.13 | 188 / 8,115 / 0 | — | 0.0094 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 9.31 | 9.31 | 9.31 | 9.31 | 1.34× | 0.96× | 1.57 | 1.00 | 245 / 16,589 / 0 | — | 0.001 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 17 | 11.14 | 25.07 | 25.07 | 25.10 | 1.11× | 1.46× | -0.84 | -0.45 | 272 / 15,124 / 0 | — | 0.0051 ms per byte | files.change |
| fs.apply | ≤8 KiB · uncontended | 9 | 10.49 | 12.59 | 12.59 | 14.44 | 1.61× | 1.16× | -0.33 | 0.00 | 157 / 7,368 / 0 | — | 0.0039 ms per byte | files.change |
| fs.diff_files | ≤1 KiB · contended | 7 | 8.47 | 10.02 | 10.02 | 11.09 | 1.18× | 1.17× | -0.19 | -0.15 | 232 / 9,872 / 0 | — | 0.0053 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 28 | 6.86 | 11.64 | 13.74 | 14.47 | 1.18× | 1.44× | -0.54 | -0.38 | 157 / 8,213 / 0 | — | 0.025 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 2 | 10.89 | 10.89 | 10.89 | 12.54 | 2.01× | 1.81× | 0.09 | 0.14 | 366 / 15,508 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 9 | 8.27 | 9.06 | 9.06 | 12.20 | 1.33× | 0.98× | -1.03 | -0.50 | 180 / 9,264 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 8.68 | 8.68 | 8.68 | 8.92 | 1.44× | 1.34× | -0.28 | -0.06 | 226 / 11,885 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 8 | 8.09 | 10.35 | 10.35 | 19.17 | 1.09× | 1.29× | -0.72 | -0.49 | 164 / 8,820 / 0 | — | 0.0026 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 2.00 | 2.00 | 2.00 | 2.00 | 1.47× | 1.36× | -0.51 | -0.32 | 51 / 2,431 / 0 | — | 1.995 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 6.61 | 6.61 | 6.61 | 27.13 | 2.38× | 2.38× | 0.07 | -0.05 | 196 / 15,929 / 0 | — | 0.1695 ms per file | — |
| fs.glob | 17–64 files · uncontended | 4 | 7.10 | 11.99 | 11.99 | 21.04 | 2.51× | 3.16× | -0.03 | 0.02 | 88 / 8,890 / 0 | — | 0.2103 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.19 | 2.19 | 2.19 | 2.71 | 1.20× | 1.20× | 0.96 | 0.65 | 43 / 3,442 / 0 | — | 0.5467 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 2.13 | 2.13 | 2.13 | 2.92 | 1.21× | 1.10× | 0.35 | 0.20 | 41 / 2,587 / 0 | — | 0.9727 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 4.45 | 5.30 | 5.30 | 6.35 | 2.65× | 3.15× | 0.41 | 0.33 | 77 / 8,742 / 0 | — | 0.5293 ms per file | — |
| fs.glob | 5–16 files · uncontended | 18 | 2.67 | 4.80 | 4.80 | 5.39 | 1.32× | 2.10× | 0.58 | 0.41 | 52 / 2,687 / 0 | — | 0.2732 ms per file | — |
| fs.glob | >64 files · contended | 6 | 6.23 | 20.18 | 20.18 | 42.79 | 1.15× | 3.73× | -1.03 | -0.89 | 137 / 7,830 / 0 | — | 0.0177 ms per file | — |
| fs.glob | >64 files · uncontended | 14 | 4.95 | 8.39 | 8.39 | 43.43 | 0.50× | 0.60× | -1.59 | -1.41 | 68 / 5,641 / 0 | — | 0.0238 ms per file | — |
| fs.grep | 17–64 files · contended | 5 | 14.81 | 18.81 | 18.81 | 33.22 | 2.48× | 3.14× | -1.19 | -0.83 | 351 / 16,283 / 0 | — | 0.4488 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 10.01 | 12.14 | 12.14 | 12.33 | 1.74× | 2.02× | 0.90 | 0.49 | 234 / 12,860 / 0 | — | 0.2801 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 1 | 4.30 | 4.30 | 4.30 | 4.30 | 1.86× | 1.35× | 0.51 | 0.31 | 87 / 4,192 / 0 | — | 1.0748 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 3 | 5.83 | 5.83 | 5.83 | 11.65 | 1.96× | 1.15× | 1.00 | 0.69 | 142 / 7,418 / 0 | — | 0.9713 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 21 | 3.92 | 13.55 | 13.55 | 16.72 | 1.04× | 2.26× | -0.02 | 0.02 | 82 / 4,342 / 0 | — | 0.4749 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 9 | 28.68 | 33.28 | 33.28 | 40.02 | 1.83× | 2.12× | 1.15 | 0.81 | 680 / 34,526 / 0 | — | 0.124 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 16 | 18.98 | 30.12 | 30.12 | 34.10 | 1.04× | 1.31× | 0.70 | 0.42 | 460 / 23,257 / 0 | — | 0.0815 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 5 | 4.63 | 5.95 | 5.95 | 6.88 | 1.93× | 2.48× | -0.49 | -0.36 | 85 / 9,173 / 0 | — | 0.1566 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 23 | 4.23 | 6.88 | 7.07 | 17.74 | 1.69× | 2.35× | -0.79 | -0.67 | 82 / 6,787 / 0 | — | 0.1172 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 2.14 | 2.14 | 2.14 | 2.14 | 0.92× | 0.92× | -1.10 | -0.91 | 42 / 2,661 / 0 | — | 0.5347 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 5 | 3.15 | 4.05 | 4.05 | 4.12 | 1.67× | 1.98× | 0.87 | 0.57 | 50 / 3,185 / 0 | — | 0.7883 ms per entrie | — |
| fs.list | 5–16 entries · contended | 6 | 3.41 | 4.33 | 4.33 | 5.29 | 1.46× | 1.52× | 0.18 | 0.28 | 108 / 5,839 / 0 | — | 0.464 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 19 | 2.98 | 4.02 | 4.02 | 4.18 | 1.57× | 1.05× | 0.56 | 0.44 | 59 / 4,731 / 0 | — | 0.3309 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 9 | 2.71 | 5.25 | 5.25 | 15.77 | 1.71× | 3.31× | 0.05 | -0.00 | 59 / 3,350 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 1.99 | 1.99 | 1.99 | 2.70 | 0.71× | 0.71× | -1.78 | -1.19 | 46 / 2,902 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 13 | 3.03 | 6.11 | 6.11 | 17.32 | 1.44× | 1.03× | -0.72 | -0.42 | 96 / 4,868 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 34 | 2.54 | 4.34 | 5.68 | 6.20 | 1.23× | 1.21× | -0.22 | -0.14 | 57 / 3,075 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 22 | 13.13 | 55.99 | 113.63 | 308.88 | 1.25× | 3.95× | 1.74 | 1.29 | 296 / 19,415 / 0 | — | 13.131 ms per file | commit |
| fs.rm | 1 files · uncontended | 53 | 9.21 | 14.61 | 15.77 | 32.34 | 1.37× | 1.31× | 0.18 | 0.42 | 169 / 10,407 / 0 | — | 9.213 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 3 | 2.33 | 2.33 | 2.33 | 2.87 | 1.07× | 1.04× | -0.37 | -0.36 | 53 / 3,853 / 0 | — | 0.0044 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 9 | 2.53 | 2.88 | 2.88 | 3.49 | 1.65× | 1.87× | 0.46 | 0.46 | 50 / 3,274 / 0 | — | 0.0062 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 3.02 | 3.02 | 3.02 | 7.78 | no baseline | no baseline | 0.56 | 0.45 | 96 / 6,136 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 4 | 2.47 | 2.48 | 2.48 | 3.11 | 1.17× | 1.18× | 0.01 | -0.09 | 45 / 2,967 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 4 | 1.64 | 2.07 | 2.07 | 3.91 | 0.63× | 0.60× | -0.67 | -0.56 | 46 / 3,815 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 7 | 2.15 | 2.27 | 2.27 | 2.30 | 1.09× | 1.05× | 0.52 | 0.23 | 45 / 3,034 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 6 | 2.29 | 3.46 | 3.46 | 4.20 | 1.02× | 1.15× | 0.37 | 0.25 | 45 / 3,828 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 21 | 2.33 | 2.90 | 2.90 | 7.30 | 1.39× | 0.83× | -0.02 | 0.00 | 44 / 2,998 / 0 | — | 0.0005 ms per byte | — |
| fs.write | >512 KiB · uncontended | 1 | 19.48 | 19.48 | 19.48 | 19.48 | no baseline | no baseline | — | — | 216 / 9,654 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 47 | 15.53 | 71.95 | 130.59 | 230.62 | 1.82× | 4.83× | 0.01 | 0.25 | 347 / 24,638 / 0 | — | 0.0378 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 97 | 7.38 | 16.93 | 18.91 | 19.65 | 1.16× | 1.60× | -0.67 | -0.35 | 153 / 6,433 / 0 | — | 0.0157 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 15 | 14.98 | 31.36 | 31.36 | 50.65 | 0.93× | 1.95× | -0.05 | 0.10 | 376 / 21,625 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 33 | 12.32 | 19.63 | 20.35 | 20.84 | 1.49× | 2.38× | 0.30 | 0.28 | 162 / 8,109 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 92 | 11.30 | 32.00 | 77.93 | 212.26 | 1.14× | 1.46× | -0.27 | -0.08 | 320 / 15,851 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 164 | 7.43 | 13.54 | 20.45 | 24.45 | 1.03× | 0.99× | -0.07 | 0.05 | 158 / 5,793 / 0 | — | 0.0005 ms per byte | files.change |
| fs.write | ≤8 KiB · contended | 148 | 13.19 | 40.89 | 60.27 | 142.48 | 1.35× | 1.82× | -0.36 | -0.15 | 308 / 16,583 / 0 | — | 0.0048 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 314 | 7.64 | 14.64 | 18.96 | 22.89 | 1.06× | 1.06× | 0.01 | 0.11 | 150 / 6,300 / 0 | — | 0.0025 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.93 | 0.93 | 0.93 | 0.93 | 1.23× | 1.23× | -0.75 | -0.48 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 42 | 31.85 | 53.70 | 56.47 | 57.91 | 1.51× | 1.54× | -0.28 | -0.24 | 453 / 31,978 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 93 | 25.13 | 38.56 | 49.70 | 221.39 | 1.21× | 1.11× | -0.17 | -0.14 | 271 / 25,475 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 7 | 3.61 | 6.60 | 6.60 | 6.68 | 0.94× | 0.82× | 0.82 | 0.62 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 49 | 3.71 | 6.97 | 7.48 | 14.46 | 0.93× | 1.36× | -0.10 | -0.07 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 13 | 15.80 | 21.93 | 21.93 | 42.18 | 1.64× | 1.13× | 0.64 | 0.47 | 144 / 6,464 / 0 | — | 15.803 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 9 | 9.72 | 12.07 | 12.07 | 12.25 | 1.17× | 0.99× | -0.18 | -0.12 | 127 / 4,266 / 0 | — | 9.722 ms per file | commit |
| sandbox.commit | 1 files · Conflict · uncontended | 1 | 132.25 | 132.25 | 132.25 | 132.25 | no baseline | no baseline | — | — | 7,813 / 208,011 / 0 | — | 132.254 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 5 | 36.32 | 40.27 | 40.27 | 46.28 | 2.44× | 2.04× | 2.87 | 2.04 | 354 / 18,504 / 0 | — | 12.1063 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 8 | 8.86 | 11.71 | 11.71 | 14.95 | 0.83× | 0.69× | -0.32 | -0.26 | 109 / 4,060 / 0 | — | 3.4177 ms per file | commit |
| sandbox.commit | 2–4 files · UpToDate · contended | 1 | 13.43 | 13.43 | 13.43 | 13.43 | no baseline | no baseline | — | — | 255 / 9,349 / 0 | — | 4.478 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 26.16 | 26.16 | 26.16 | 26.16 | 1.59× | 1.59× | -0.09 | -0.04 | 274 / 18,683 / 0 | — | 2.1797 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 3 | 15.01 | 15.01 | 15.01 | 18.51 | 1.09× | 1.09× | 1.25 | 1.29 | 207 / 11,681 / 0 | — | 2.6443 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 887.31 | 887.31 | 887.31 | 887.31 | no baseline | no baseline | 4.19 | 3.22 | 16,615 / 1,046,550 / 8,273 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 84.29 | 981.11 | 981.11 | 14286.19 | 1.22× | 14.22× | 0.05 | 0.14 | 1,205 / 58,083 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 260 | 44.10 | 846.33 | 3996.48 | 4176.86 | 0.86× | 2.20× | -2.19 | -1.48 | 0 / 0 / 0 | 3,973 | — | — |
| sandbox.exec | 0 files · uncontended | 173 | 35.02 | 585.37 | 709.51 | 6996.01 | 1.10× | 2.05× | -0.14 | -0.13 | — | 4,052 | — | — |
| sandbox.exec | 1 files · contended | 44 | 32.62 | 53.18 | 57.67 | 62.85 | 0.89× | 0.63× | 0.01 | -0.01 | — | 4.70 | 32.621 ms per file | — |
| sandbox.exec | 1 files · uncontended | 33 | 37.22 | 62.02 | 71.44 | 71.49 | 1.12× | 0.92× | 0.26 | 0.21 | — | 5 | 37.216 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 63.59 | 63.59 | 63.59 | 74.53 | 0.91× | 0.91× | 0.08 | 0.07 | — | 94 | 3.3468 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 4 | 81.25 | 83.82 | 83.82 | 89.25 | 1.17× | 1.20× | -0.17 | -0.13 | — | 100 | 4.0627 ms per file | — |
| sandbox.exec | 2–4 files · contended | 29 | 43.39 | 73.26 | 78.13 | 80.99 | 1.12× | 1.05× | 0.10 | 0.06 | — | 11.30 | 13.185 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 44 | 45.19 | 72.03 | 78.29 | 80.69 | 1.18× | 1.10× | -0.24 | -0.09 | — | 13.30 | 14.2815 ms per file | — |
| sandbox.exec | 5–16 files · contended | 14 | 30.75 | 62.55 | 62.55 | 69.30 | 0.53× | 0.86× | 0.38 | 0.25 | — | 17.30 | 2.5622 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 23 | 54.90 | 74.61 | 76.75 | 79.16 | 0.77× | 0.71× | 0.01 | 0.11 | — | 32 | 6.4166 ms per file | — |
| sandbox.exec | — · contended | 18 | 2707.70 | 28174.25 | 28174.25 | 29750.35 | no baseline | no baseline | -1.61 | -1.14 | — | 57039.60 | — | — |
| sandbox.exec | — · uncontended | 30 | 297.68 | 26262.99 | 27261.96 | 35800.32 | 0.56× | 3.69× | 0.39 | 0.20 | — | 40,932 | — | — |
| sandbox.mount | — · contended | 84 | 11.60 | 20.18 | 26.73 | 42.23 | 1.04× | 1.06× | 0.18 | 0.14 | 58 / 1,635 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 159 | 10.05 | 16.38 | 23.46 | 27.77 | 0.90× | 0.82× | -0.13 | -0.09 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 5.47 | 5.47 | 5.47 | 5.47 | no baseline | no baseline | 1.12 | 0.99 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.69 | 3.82 | 3.82 | 44.94 | no baseline | no baseline | 0.03 | 0.02 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 61 | 13.11 | 24.87 | 34.31 | 39.37 | 1.24× | 1.37× | 0.26 | 0.24 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 182 | 12.86 | 27.60 | 127.56 | 231.98 | 1.23× | 1.50× | 0.25 | 0.20 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 15 | 0.0 KiB | 801.4 KiB | 3,528 | ok 15 |
| branch.diff_commits | branch | 403 | 0.0 KiB | 21.9 MiB | 74,600 | ok 403 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 96.1 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 46 | 1.1 MiB | 0.0 KiB | 57 | Committed 46 |
| fs.diff_files | fs | 61 | 0.0 KiB | 350.3 KiB | 39 | Text 38, NoSuchPath 22, Equal 1 |
| fs.glob | fs | 66 | 0.0 KiB | 66.4 KiB | 860 | ok 66 |
| fs.grep | fs | 70 | 0.0 KiB | 329.7 KiB | 1,181 | ok 70 |
| fs.list | fs | 71 | 0.0 KiB | 378.3 KiB | 2,475 | ok 71 |
| fs.read | fs | 63 | 0.0 KiB | 184.9 KiB | 63 | ok 63 |
| fs.rm | fs | 75 | 0.0 KiB | 0.0 KiB | 75 | Committed 75 |
| fs.stat | fs | 64 | 0.0 KiB | 14.5 KiB | 64 | ok 64 |
| fs.write | fs | 911 | 17.0 MiB | 0.0 KiB | 911 | Committed 911 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 250 | 0.0 KiB | 0.0 KiB | 0 | Committed 192, UpToDate 57, Conflict 1 |
| sandbox.exec | sandbox | 685 | 2.3 MiB | 6.1 MiB | 0 | exit:0 682, exit:2 3 |
| sandbox.mount | sandbox | 253 | 0.0 KiB | 0.0 KiB | 0 | Mounted 253 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 253 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 253 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.56 · end 2.26.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.004 | 13.977 · 1.044 · 1.004 · 0.861 · 0.952 | 2.35–2.35 | statements 23, vm_steps 860, fullscan_steps 0, sorts 0, returned_rows 72 |
| read | 0.846 | 1.022 · 0.918 · 0.846 · 0.806 · 0.817 | 2.35–2.35 | statements 14, vm_steps 662, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_small | 0.914 | 0.914 · 0.872 · 0.777 · 1.259 · 0.92 | 2.35–2.35 | statements 14, vm_steps 671, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_largest | 5.816 | 8.465 · 5.979 · 5.812 · 5.816 · 5.765 | 2.35–2.35 | statements 128, vm_steps 15487, fullscan_steps 0, sorts 0, returned_rows 1668 |
| grep_scoped | 0.932 | 1.238 · 0.989 · 0.932 · 0.871 · 0.854 | 2.35–2.35 | statements 19, vm_steps 817, fullscan_steps 0, sorts 0, returned_rows 72 |
| glob_scoped | 0.844 | 0.866 · 0.844 · 0.751 · 0.86 · 0.776 | 2.35–2.35 | statements 13, vm_steps 650, fullscan_steps 0, sorts 0, returned_rows 62 |
| grep_tree | 5163.409 | 5281.193 · 5163.409 · 5142.019 · 5186.096 · 5120.113 | 2.05–2.24 | statements 58377, vm_steps 4497028, fullscan_steps 0, sorts 0, returned_rows 454495 |
| glob_tree | 8.206 | 10.708 · 8.383 · 8.022 · 8.206 · 8.127 | 2.11–2.11 | statements 126, vm_steps 18239, fullscan_steps 0, sorts 0, returned_rows 1965 |
| diff_files | 3.676 | 3.826 · 3.676 · 3.515 · 3.775 · 3.582 | 2.11–2.11 | statements 60, vm_steps 3784, fullscan_steps 0, sorts 0, returned_rows 372 |
| list_commits | 0.691 | 1.393 · 0.822 · 0.691 · 0.638 · 0.562 | 2.11–2.11 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.039 | 2.893 · 2.113 · 2.039 · 1.993 · 2.029 | 2.11–2.11 | statements 59, vm_steps 2520, fullscan_steps 0, sorts 0, returned_rows 302 |
| fork | 0.677 | 0.691 · 0.682 · 0.677 · 0.629 · 0.484 | 2.11–2.11 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 25.668 | 27.748 · 26.015 · 21.925 · 23.135 · 25.668 | 2.11–2.11 | statements 474, vm_steps 30007, fullscan_steps 0, sorts 0, returned_rows 2440 |
| oneshot_mount_unmount | 16.878 | 19.114 · 15.053 · 19.36 · 16.878 · 16.6 | 2.11–2.11 | statements 57, vm_steps 2080, fullscan_steps 82, sorts 2, returned_rows 208 |
| oneshot_commit | 75.962 | 93.683 · 66.266 · 75.962 · 59.124 · 77.007 | 2.11–2.58 | statements 163, vm_steps 13922, fullscan_steps 82, sorts 2, returned_rows 1146 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.11–2.11 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r042: 302,580 pages of 4,096 B, 0 free · Commits 50,804 · Branches 1,021 · Layers 51 · compression 3.61× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 167,117 | 1005.6 MiB |
| 2 | 59,472 | 894.9 MiB |
| 3 | 15,835 | 4.9 MiB |
| 4 | 48 | 9.3 KiB |
| 5 | 15,731 | 1.6 MiB |
| 6 | 129,662 | 629.1 MiB |
| 7 | 341,441 | 83.8 MiB |
| 8 | 952 | 272.5 KiB |
| 9 | 105,685 | 230.3 MiB |
| 10 | 54,671 | 6.7 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,408 | 197.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 52,131 | 105.0 MiB |
| 1 | 58,300 | 687.7 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 212,405 | 829.7 MiB | 30.5 MiB |
| inode_value | 53,289 | 208.2 MiB | 4.3 MiB |
| binding_hint | 15,375 | 60.1 MiB | 5.7 MiB |
| object_location | 12,322 | 48.1 MiB | 5.2 MiB |
| commit | 4,156 | 16.2 MiB | 2.5 MiB |
| file_digest | 1,431 | 5.6 MiB | 645.3 KiB |
| commit_lineage | 1,098 | 4.3 MiB | 520.5 KiB |
| commit_runs | 1,069 | 4.2 MiB | 560.3 KiB |
| commit_identity | 779 | 3.0 MiB | 328.5 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 45 | 180.0 KiB | 30.7 KiB |
| branch_names | 17 | 68.0 KiB | 13.5 KiB |
| branch_identity | 13 | 52.0 KiB | 12.0 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 6 | 24.0 KiB | 6.4 KiB |
| layer | 4 | 16.0 KiB | 7.0 KiB |
| layers_source | 3 | 12.0 KiB | 7.6 KiB |
| layers_child | 3 | 12.0 KiB | 7.6 KiB |
| absorbed_heights | 3 | 12.0 KiB | 6.2 KiB |

### E. Stage times

**Time 288.2 s** (tooling): play 99.4 · consolidate 113.6 · verify 25.6 · probes 26.9 · tests 0.0 · seal + snapshot 8.3 · report 14.4

288.21 s tooling: prepare 1.60 · play 97.81 · consolidate 113.58 · verify 14.21 (diff_commits + full compareTree) · version walk 11.37 · probes 26.91 · metrics 0.77 · seal 1.30 · sealed figures 3.73 · snapshot copy 3.26 · report 0.35

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T03:12:19.004Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.22× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.267) and statements per entry does not rise (0.02): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8); Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (23 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-042.a1.json`
- trace `~/lfs-history/runs/p3-main-v/trace/range-042.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-v/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-042.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r042-4-packages-telemetry | 521 | 527.8 KiB |
| r042-2-agents-notes | 577 | 527.6 KiB |
| r042-3-packages-subprocess | 595 | 526.5 KiB |
| r042-1-root | 333 | 523.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 382.0 | 4,282 |
| `git diff --stat` | 34.0 | 4,275 |
| `git add -f` | 36.0 | — |
| `git rm --cached` | 10.0 | — |
| `git commit` | 39.0 | 4,279 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r042-4-packages-telemetry | end | P1 | pass | — | — |
| r042-4-packages-telemetry | end | P2 | pass | exit 0 | — |
| r042-4-packages-telemetry | end | P3 | pass | 261 bookkeeping path(s) | — |
| r042-4-packages-telemetry | end | P4 | pass | 178 emitted files, exit 2 | — |
| r042-4-packages-telemetry | end | P5 | n/a | no calibrated file | — |
| r042-4-packages-telemetry | end | P6 | n/a | not a repair | — |
| r042-1-root | end | P1 | pass | — | — |
| r042-1-root | end | P2 | pass | exit 0 | — |
| r042-1-root | end | P3 | n/a | an install, not a refresh | — |
| r042-1-root | end | P4 | pass | 443 emitted files, exit 2 | — |
| r042-1-root | end | P5 | n/a | no calibrated file | — |
| r042-1-root | end | P6 | n/a | not a repair | — |
| r042-2-agents-notes | end | P1 | pass | — | — |
| r042-2-agents-notes | end | P2 | pass | exit 0 | — |
| r042-2-agents-notes | end | P3 | pass | 261 bookkeeping path(s) | — |
| r042-2-agents-notes | end | P4 | pass | 58 emitted files, exit 0 | — |
| r042-2-agents-notes | end | P5 | pass | 16 files | — |
| r042-2-agents-notes | end | P6 | n/a | not a repair | — |
| r042-3-packages-subprocess | end | P1 | pass | — | — |
| r042-3-packages-subprocess | end | P2 | pass | exit 0 | — |
| r042-3-packages-subprocess | end | P3 | pass | 261 bookkeeping path(s) | — |
| r042-3-packages-subprocess | end | P4 | pass | 263 emitted files, exit 2 | — |
| r042-3-packages-subprocess | end | P5 | pass | 76 files | — |
| r042-3-packages-subprocess | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1965 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
