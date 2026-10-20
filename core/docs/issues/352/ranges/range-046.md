# Range 046 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r045 (live Store)
dsh `f85736e81`..`817c09828` · **64 commits** (6 mainline, 58 side) · 2026-07-28 → 2026-07-28
Areas changed: `packages/client` 20% · `/` 14% · `packages/ui` 9% · other 57%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 15 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.22×** · **Churn 0.00**
**Time split:** play 99.7 s · git 109.7 s · Node 183.6 s · verify 13.9 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **802.4 MiB** (+2.0 MiB) | **1.28 GiB** (+25.3 MiB) | **1.64×** (prev 1.61×) | **31.2 MiB** | **827** (total 54,791) | **279.7 s** tooling (total 152.6 min) |

**Checks:** 15 pass · 2 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 15.14× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.369) and statements per entry does not rise (0.05): the fixed and per-entry parts cannot be separated · 2 optimize/stop: Counters, Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe fork +37% · ▲ fs.write p95 +27% · ▲ probe diff_commits +22%
**Budget:** 47 of 202 ranges · projected total 15.5 h (budget 16.8 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,556 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,920 / 1,920 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2977 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 414 bin shims, 4488 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (57 lines from 4 .gitignore files) · **156 picks** in 3 merges (155 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `817c09828`** · 92 commits written for 92 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 155 · Build outputs 1 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r046-3-agents-notes | end | `3e18ebe5c807` | `95c01f0b6302` | pass (416 normalized) | pass | pass | pass | n/a | n/a |
| r046-1-packages-client | end | `034bd42d700c` | `95c01f0b6302` | pass (416 normalized) | pass | pass | pass | n/a | n/a |
| r046-2-root | end | `d9a03d13dff4` | `675d49d68108` | pass (417 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `4237fecce852` | `null` | n/a | pass | n/a | n/a | pass | pass (137,705 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/goal/command-goal/tests/command-goal.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-models.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-directory-picker.spec.ts` (fails natively) · `packages/host/apiproxy/tests/native-path-opener.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/session-title/session-title-llm/tests/llm.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/projection.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively) · `apps/cli/tests/args.spec.ts` (fails natively) · `packages/client/connection/tests/api-helpers.spec.ts` (fails natively) · `packages/client/connection/tests/client-apply.spec.ts` (fails natively) · `packages/client/connection/tests/connection.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/client/connection/tests/http-bridge.spec.ts` (fails natively) · `packages/client/connection/tests/native-dialog-request.spec.ts` (fails natively) · `packages/client/connection/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/conversation.spec.ts` (fails natively) · `packages/client/runtime/tests/fold-adapter.spec.ts` (fails natively) · `packages/client/runtime/tests/invariant.spec.ts` (fails natively) · `packages/client/runtime/tests/lineage.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/runtime/tests/node-half.spec.ts` (fails natively) · `packages/client/runtime/tests/notifier.spec.ts` (fails natively) · `packages/client/runtime/tests/partial.spec.ts` (fails natively) · `packages/client/runtime/tests/projection-store.spec.ts` (fails natively) · `packages/client/runtime/tests/queue-store.spec.ts` (fails natively) · `packages/client/runtime/tests/scope.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/runtime/tests/slots-service.spec.ts` (fails natively) · `packages/client/runtime/tests/store.spec.ts` (fails natively) · `packages/client/runtime/tests/wire-events.spec.ts` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-command/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-command/tests/directory.spec.ts` (fails natively) · `packages/client/ui-command/tests/popup-view.spec.tsx` (fails natively) · `packages/client/ui-command/tests/popup.spec.ts` (fails natively) · `packages/client/ui-command/tests/service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-stats-bash-sample.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-store.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-machine.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/queue-dock.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/selection-survival.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/views-type-chain.spec.tsx` (fails natively) · `packages/client/ui-question/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/node-plugin.spec.ts` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/ui-slots/tests/core.spec.ts` (fails natively) · `packages/client/ui-slots/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-slots/tests/surface.spec.ts` (fails natively) · `packages/client/ui-slots/tests/type-chain.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/cell.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/layout.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/web-react/tests/bind.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots-real-core.spec.tsx` (fails natively) · `packages/client/web-react/tests/scoped-slots.spec.tsx` (fails natively) · `packages/client/web-react/tests/session-provider.spec.tsx` (fails natively) · `packages/client/web-react/tests/stale-authorization.spec.tsx` (fails natively) · `packages/client/web-react/tests/use-invoke.spec.tsx` (fails natively) · `packages/client/web-react/tests/use-projection.spec.tsx` (fails natively) · `packages/compact/compact/tests/compact.spec.ts` (fails natively) · `packages/compact/compact/tests/invariant.spec.ts` (fails natively) · `packages/compact/compact/tests/tool-pairing.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/codec.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/detached.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/events.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/invariant.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/matcher.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/merge.spec.ts` (fails natively) · `packages/hooks/hook-protocol/tests/runner.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/win32.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/invariant.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/projection.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/session-title/session-title/tests/session-title.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/session-title/session-title/tests/persistence.spec.ts` (fails natively) · `packages/session-title/session-title/tests/provider.spec.ts` (fails natively) · `packages/session-title/session-title/tests/service-contracts.spec.ts` (fails natively).

## 2. Activity

**2,684 calls** · **174 steps** by **8 agents + lead** on **3 Branches + main** · **218 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +69 added · 629 modified · −28 deleted · 14.3 MiB written · fs 663 : Sandbox 63 (**11 : 1**, reported only in P3)
**Execs:** 587 (JS 63 · shell 524) · 3 non-zero exits · install 0 · test runs 2 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 989 | 677 | 312 | Committed 677 · Text 35 · NoSuchPath 14 · Equal 1 |
| sandbox | 1,240 | 800 | 4 | commit 213 (Committed 164, UpToDate 48, Conflict 1) · exec 587 (exit:0 584, exit:2 3) · mount 218 (Mounted 218) · status 4 · unmount 218 (Unmounted 218) |
| branch | 445 | 32 | 413 | diff_branches 11 · diff_commits 402 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,684** | **1,509** | **739** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r046-1-packages-client | a01 a02 a03 | 67 | 261 | ✓ | — |
| r046-2-root | a04 a05 | 43 | 242 | ✓ | — |
| r046-3-agents-notes | a06 a07 a08 | 58 | 254 | ✓ | — |
| main | lead | 6 | 70 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r046-1, a02 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r046-1, a01 a03 | merged cleanly |
| Decoy edit | 1 / 1 | r046-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r046-1 | 4 | 3 | 1 | 0 | 0 | 18 | commit-conflict, stale-clean-merge, decoy |
| a02 | r046-1 | 21 | 9 | 12 | 0 | 0 | 36 | commit-conflict, decoy |
| a03 | r046-1 | 42 | 23 | 19 | 0 | 0 | 207 | stale-clean-merge |
| a04 | r046-2 | 40 | 20 | 20 | 0 | 0 | 202 | — |
| a05 | r046-2 | 3 | 1 | 2 | 0 | 0 | 40 | — |
| a06 | r046-3 | 6 | 3 | 3 | 0 | 0 | 32 | — |
| a07 | r046-3 | 41 | 19 | 22 | 0 | 0 | 190 | — |
| a08 | r046-3 | 11 | 6 | 5 | 0 | 0 | 32 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 70 | — |
| **Total** |  | **174** | **85** | **84** | **5** | **0** | **827** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 123 · pnpm 1 · tsc 3 · vitest 2 · other 458

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r046-3-agents-notes | 40 | 40 | 39 | 6 | 40 | 518 |
| r046-1-packages-client | 45 | 45 | 45 | 5 | 45 | 586 |
| r046-2-root | 31 | 31 | 31 | 4 | 31 | 401 |
| **lead** | — | — | — | — | 92 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r046-3-agents-notes | 0 | 1 | 1 | 0 | 0 | — / — |
| r046-1-packages-client | 0 | 1 | 1 | 0 | 0 | — / — |
| r046-2-root | 1 | 0 | 1 | 1 | 102 | 102 / 102 |
| **lead repair** | 1 | — | 1 | — | — | 137,705 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r045) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 800.4 MiB (24.7 MiB / 656.0 MiB / 22.6 MiB / 97.1 MiB) | 802.4 MiB (24.9 MiB / 656.0 MiB / 22.8 MiB / 98.6 MiB) | +2.0 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,020 / 9,828 / 4,476 | 64,115 / 9,838 / 4,496 | +95 / +10 / +20 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.26 GiB | 1.28 GiB | +25.3 MiB |
| **Space amplification** (total · tracked) | 1.61× · tracked 4.94× | 1.64× · tracked 4.95× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **8.25** (1.13 / 0.20 / 0.71) | 1.26× the median range |
| **Stored per Commit** | 29.8 KiB | 31.0 KiB | — |
| Metadata share | 0.42 | 0.43 | this range 0.47 |
| History: Commits / Layers / Branches | 53,964 | 54,791 / 30 / 640 | +827 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 13.06 GiB (Commits 10.83 GiB · installs 867.6 MiB · build 99.5 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 40.25 GiB / 41% | — |
| Snapshot | — | r046, 1.12 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 753.8 MiB | 0.94 | +13.9 MiB |
| Metadata | 117.1 MiB | 0.15 | +2.7 MiB |
| Index rows | 377.3 MiB | 0.47 | — |
| Waste | 62.4 MiB | 0.08 | — |
| Other | 1.6 MiB | 0.00 | — |
| **Total = Store on disk** | **1.28 GiB** | **= 1.64** space amplification | +25.3 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 24.9 MiB | 123.4 MiB (66.5 MiB + 56.9 MiB) | 4.95× | — | 1.3 MiB | 3.8 MiB | 0.36 |
| `node_modules` | 656.0 MiB | 214.2 MiB (187.2 MiB + 27.0 MiB) | 0.33× | — | 972.9 KiB | 139.4 KiB | 6.98 |
| Build output | 22.8 MiB | 23.5 MiB (21.7 MiB + 1.8 MiB) | 1.03× | — | 962.7 KiB | 8.4 MiB | 0.11 |
| `.git` | 98.6 MiB | 454.2 MiB (435.1 MiB + 19.2 MiB) | 4.61× | — | 13.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 441.3 MiB | — (not divided) | — | 8.7 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 55.6 MiB | — | — | — | — | — |
| **Total** | — | **1.28 GiB** | **= 1.64×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 181,937 | +3,344 | 6.3 KiB | 0 (derived) | 52% |
| Chunks (large files) | 63,352 | +972 | 15.6 KiB | — | 10% |
| Large-file extents | 16,504 | — | 0.3 KiB | — | — |
| Directories | 393,321 | 4,180 (with inodes, pooled) | 0.3 KiB | — | 53% |
| Inodes and attributes | 351,256 | ↑ pooled | 2.8 KiB | — | — |
| Symlinks | 2,425 | +4,521 | 0.1 KiB | — | — |

Delta: 2.3% at depth cap · 29% of refused bases stopped by budget · `node_modules` reinstall: absolute: 920119 new stored bytes for 604 raw changed bytes of 16 changed packages (1523.376×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.95× (123.4 MiB for 24.9 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.7 KiB / 5.2 KiB / 7.4 KiB over 208 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.22× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.9 MiB stored for 1.92 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.55 (3 lanes × 802.4 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 3.0 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 10.5 ms / 42.5 ms (1.11×) | 2.7 ms / 5.2 ms (1.32×) | 3.6 ms / 7.1 ms (1.49×) | 19.6 ms / 56.8 ms (1.06×) | 9.0 ms / 13.2 ms (0.79×) | 307 ms / 307 ms (3.34×) | — (native comparison in P3; exec 38.3 ms / 879 ms) |
| SQL p50: 221 stmts | 57 stmts | 68 stmts | 202 stmts | 49 stmts | 8,956 stmts | — |

**Commit cost:** 9.68 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 704 ms p50 over 218
**Slowest:** sandbox.exec 34468 ms · sandbox.exec 25927 ms · sandbox.exec 25900 ms · checkpoint diff_commits 0.10 ms and 1.56 statements per entry (73,496 entries per page)
**Scaling:** 13 of 15 probes flat · `list_largest` 0.52 · `grep_tree` 0.24

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 358 ms / 358 ms | — / — | — | git / status-cold: — |
| git status (steady) | 434 ms / 591 ms | — / — | — | git / status-steady: — |
| git add | 32.0 ms / 66.0 ms | — / — | — | git / add: — |
| git commit (lane) | 37.0 ms / 56.0 ms | — / — | — | git / commit: — |
| lead writes main | 2696 ms / 2696 ms | — / — | — | — |
| repack | 1513 ms / 1513 ms | — / — | — | — |
| pnpm install (incremental) | 2887 ms / 2887 ms | 1676 ms / 1676 ms | 1.72× | pnpm-reinstall / cold: — |
| pnpm refresh | 2484 ms / 2484 ms | 1773 ms / 1773 ms | 1.40× | pnpm-reinstall / steady: — |
| tsc -b | 5615 ms / 5615 ms | 3548 ms / 7738 ms | 1.58× | tsc-b / cold: — |
| vitest | 13484 ms / 13484 ms | 9585 ms / 9585 ms | 1.41× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.7 ms / 18.7 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4157112 → 4194304 B · fs.write ≤8 KiB 12392 → 4194304 B · fs.write ≤64 KiB 4157112 → 4194304 B · fs.read ≤8 KiB 4194304 → 4177712 B · sandbox.mount 4194304 → 2982912 B · sandbox.commit 1 file (Committed) 4194304 → 4177712 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 5.07 at the first command → 5.55 after the last (max 6.76 over 9 commands) · Docker VM 2.22 → 1.86

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-046.a1)

## 5. Findings and action

### Finding 046.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |
| Contended work | fs.rm 1 files · contended: SQL VM steps against tree files, exponent 1.914 over 10 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-046.a1.json`.

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

- **a1 (`p3-main-w`, live after r45 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 15 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (2,071 emitted). Control `control-046.a1` passes. Report check F1–F8 PASS.
- **Optimize rows, recorded, not acted on (fast mode):**
  - Counters `merge.returned_rows` (chain-bounded): 2,514 vs 1,941 (1.295×).
  - Contended work `fs.rm 1 files · contended`: SQL VM steps against tree files, exponent 1.914 over 10 ranges. Process-wide counters, plus the fix 059 cause.
- **The lead's `git clean -f -d`** removed 0 files and 0 folders; the native clean removed the same. Fix 058 exempted `.sessions/session-query.db`.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 15.14×, its p95 the repair's build Commit, 1,045 ms). Merge p50 307 ms (3 calls). One-shot Commit 1.06×, write 1.11× (10.5 ms), mount 0.79×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 5.0–6.8.
- Final steps: lead 3 s; lanes 19 s + 11 s + 11 s + 11 s + 63 s (cuts at plan orders 19, 33, 45 and 56); repair 107 s (alarm 200 s); verify 17 s; finish 50 s. Repair install 34.5 s, build 22.6 s, tests 3.2 s.
- Watch items: index rows 377.3 MiB on the sealed snapshot (#366). `fs.rm` uncontended p50 8.44 ms per file over 9 calls, 180 statements and 11,656 VM steps per call (fix 059 cause); contended 14.13 ms over 16 (321 statements, process-wide; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1920/1920; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 15.14× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.369) and statements per entry does not rise (0.05): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | fs.rm 1 files · contended: SQL VM steps against tree files, exponent 1.914 over 10 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.473 | < 0.5 | pass |
| Reinstall growth | absolute: 920119 new stored bytes for 604 raw changed bytes of 16 changed packages (1523.376×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0233 (budget 0.2898) | < 0.1 | pass |
| Range growth | 31.2 MiB, 0.92× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 3478 ms for 1143.2 MiB new; size exponent -0.747 | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.92 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 92 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 15 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 155 · build 1; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.22× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 174 | 175 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 827 | 699 |
| Workspaces (one-shot share) | 218 (0.99) | 83 (0.976) |
| Reads | 266 | 266 |
| Reconcile writes | 61 | 61 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 11 | 37.37 | 364.04 | 364.04 | 364.27 | 2.30× | 7.03× | 0.01 | 0.05 | 520 / 50,695 / 0 | — | 0.1604 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 17.20 | 17.20 | 17.20 | 19.85 | no baseline | no baseline | -0.21 | -1.30 | 216 / 18,742 / 0 | — | 0.7816 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 395 | 18.86 | 35.30 | 149.16 | 599.78 | 1.09× | 1.36× | -0.23 | -0.18 | 305 / 35,369 / 0 | — | 0.104 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.07 | 1.57 | 1.57 | 2.74 | 1.18× | 1.19× | -0.65 | -0.52 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.87 | 0.87 | 0.87 | 10.62 | no baseline | no baseline | -0.30 | -0.26 | 70 / 1,298 / 0 | — | 0.0434 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 307.16 | 307.16 | 307.16 | 354.71 | 3.34× | 3.34× | -1.51 | -0.91 | 8,956 / 466,212 / 0 | — | 3.2247 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.77 | 4.77 | 4.77 | 4.77 | 0.94× | 0.94× | -2.86 | -2.36 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 20.27 | 20.27 | 20.27 | 20.27 | 0.83× | 0.83× | -0.27 | -0.17 | 162 / 10,231 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 3 | 31.98 | 31.98 | 31.98 | 75.95 | 2.70× | 2.37× | -0.05 | 0.19 | 746 / 105,477 / 8,273 | — | 0.0499 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 4 | 6.17 | 18.94 | 18.94 | 39.34 | 1.01× | 2.55× | -0.72 | -0.54 | 132 / 5,040 / 0 | — | 0.016 ms per byte | files.change |
| fs.apply | ≤8 KiB · contended | 4 | 18.29 | 24.68 | 24.68 | 25.36 | 1.83× | 1.43× | 0.28 | 0.21 | 530 / 90,935 / 8,191 | — | 0.0069 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 3 | 13.27 | 13.27 | 13.27 | 15.20 | 1.85× | 1.55× | -0.02 | -0.04 | 333 / 18,345 / 0 | — | 0.052 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 16 | 6.75 | 13.06 | 13.06 | 13.52 | 1.16× | 1.62× | -0.37 | -0.29 | 176 / 7,926 / 0 | — | 0.0161 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 1 | 10.89 | 10.89 | 10.89 | 10.89 | 2.01× | 1.81× | 0.14 | 0.16 | 394 / 21,817 / 0 | — | 0.0012 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 13 | 8.82 | 11.98 | 11.98 | 12.95 | 1.42× | 1.30× | -0.49 | -0.27 | 214 / 12,089 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 4 | 8.04 | 8.33 | 8.33 | 10.16 | 1.33× | 1.29× | -0.39 | -0.22 | 176 / 10,792 / 0 | — | 0.0034 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 8 | 8.19 | 10.57 | 10.57 | 11.07 | 1.11× | 1.32× | -0.44 | -0.35 | 206 / 10,545 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 3 | 4.28 | 4.28 | 4.28 | 4.51 | 2.49× | 2.49× | 3.63 | 8.87 | 97 / 4,762 / 0 | — | 4.275 ms per file | — |
| fs.glob | 1 files · uncontended | 1 | 1.93 | 1.93 | 1.93 | 1.93 | 1.42× | 1.32× | -0.16 | -0.22 | 76 / 3,540 / 0 | — | 1.927 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 6.10 | 6.10 | 6.10 | 7.93 | 2.19× | 2.19× | -0.73 | -0.62 | 99 / 12,188 / 0 | — | 0.1982 ms per file | — |
| fs.glob | 17–64 files · uncontended | 10 | 3.89 | 9.73 | 9.73 | 15.52 | 1.38× | 2.56× | 0.03 | 0.06 | 76 / 7,760 / 0 | — | 0.1794 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 1.91 | 1.91 | 1.91 | 1.91 | 1.05× | 1.05× | 0.56 | 0.44 | 46 / 2,859 / 0 | — | 0.6377 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 1.88 | 1.88 | 1.88 | 2.00 | 1.06× | 0.97× | 0.23 | 0.16 | 41 / 2,309 / 0 | — | 0.4995 ms per file | — |
| fs.glob | 5–16 files · contended | 2 | 4.24 | 4.24 | 4.24 | 5.41 | 2.52× | 2.52× | -0.11 | -0.07 | 89 / 7,284 / 0 | — | 0.5301 ms per file | — |
| fs.glob | 5–16 files · uncontended | 10 | 3.55 | 5.03 | 5.03 | 5.86 | 1.76× | 2.20× | 0.10 | 0.08 | 70 / 5,182 / 0 | — | 0.419 ms per file | — |
| fs.glob | >64 files · contended | 4 | 4.36 | 6.54 | 6.54 | 73.42 | 0.81× | 1.21× | -1.90 | -1.55 | 77 / 8,159 / 0 | — | 0.0162 ms per file | — |
| fs.glob | >64 files · uncontended | 6 | 6.51 | 13.59 | 13.59 | 14.96 | 0.66× | 0.97× | -1.13 | -1.07 | 104 / 13,886 / 0 | — | 0.0292 ms per file | — |
| fs.grep | 1 files · contended | 1 | 3.21 | 3.21 | 3.21 | 3.21 | 2.14× | 2.14× | 1 | 1.42 | 65 / 3,690 / 0 | — | 3.211 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 1 | 2.15 | 2.15 | 2.15 | 2.15 | 0.90× | 0.90× | 0.04 | 0.07 | 55 / 3,942 / 0 | — | 2.148 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 5 | 14.22 | 20.95 | 20.95 | 24.27 | 2.38× | 3.50× | -1.05 | -0.85 | 295 / 21,278 / 0 | — | 0.5845 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 11 | 7.24 | 11.72 | 11.72 | 14.21 | 1.26× | 1.95× | 0.57 | 0.38 | 163 / 9,742 / 0 | — | 0.3514 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 3.29 | 4.42 | 4.42 | 4.92 | 1.43× | 1.38× | 0.68 | 0.50 | 72 / 3,846 / 0 | — | 1.2417 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 3.38 | 3.38 | 3.38 | 8.92 | 1.14× | 0.67× | -0.25 | -0.16 | 87 / 3,883 / 0 | — | 0.4821 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 12 | 6.86 | 10.60 | 10.60 | 10.88 | 1.83× | 1.77× | 0.13 | 0.10 | 129 / 9,923 / 0 | — | 0.7619 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 12.46 | 12.46 | 12.46 | 21.35 | 0.79× | 0.79× | 0.24 | 0.28 | 352 / 17,033 / 0 | — | 0.0757 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 8 | 19.00 | 25.12 | 25.12 | 36.72 | 1.04× | 1.09× | 0.47 | 0.34 | 439 / 27,087 / 0 | — | 0.0848 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 2 | 3.03 | 3.03 | 3.03 | 3.34 | 1.80× | 1.80× | -0.26 | -0.28 | 61 / 3,514 / 0 | — | 3.027 ms per entrie | — |
| fs.list | 17–64 entries · contended | 2 | 4.79 | 4.79 | 4.79 | 12.45 | 1.99× | 1.99× | -0.68 | -0.54 | 82 / 7,645 / 0 | — | 0.249 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 18 | 3.75 | 7.69 | 7.69 | 12.38 | 1.49× | 2.62× | -0.55 | -0.50 | 81 / 7,638 / 0 | — | 0.1405 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 7 | 2.46 | 2.72 | 2.72 | 5.95 | 1.30× | 1.33× | 0.92 | 0.69 | 50 / 4,291 / 0 | — | 1.086 ms per entrie | — |
| fs.list | 5–16 entries · contended | 5 | 3.51 | 3.66 | 3.66 | 4.42 | 1.50× | 1.29× | -0.31 | -0.11 | 75 / 5,855 / 0 | — | 0.3241 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 16 | 3.70 | 6.17 | 6.17 | 7.05 | 1.95× | 1.62× | 0.43 | 0.36 | 69 / 5,754 / 0 | — | 0.4 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 9 | 2.92 | 3.90 | 3.90 | 8.18 | 1.84× | 2.46× | -0.18 | -0.17 | 67 / 3,952 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 2.75 | 5.22 | 5.22 | 12.79 | 1.30× | 0.88× | -0.55 | -0.37 | 65 / 3,960 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 23 | 2.71 | 3.09 | 3.28 | 3.63 | 1.32× | 0.86× | -0.14 | -0.11 | 55 / 3,485 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 16 | 14.13 | 34.17 | 34.17 | 39.09 | 1.34× | 2.41× | 1.10 | 0.93 | 321 / 18,180 / 0 | — | 14.127 ms per file | commit |
| fs.rm | 1 files · uncontended | 9 | 8.44 | 13.61 | 13.61 | 14.90 | 1.26× | 1.22× | 0.22 | 0.33 | 180 / 11,656 / 0 | — | 8.436 ms per file | files.change |
| fs.stat | >512 KiB · uncontended | 1 | 1.51 | 1.51 | 1.51 | 1.51 | no baseline | no baseline | — | — | 36 / 1,483 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤1 KiB · contended | 2 | 2.28 | 2.28 | 2.28 | 2.93 | 1.05× | 1.02× | -0.79 | -0.61 | 42 / 2,727 / 0 | — | 0.0023 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 1 | 7.41 | 7.41 | 7.41 | 7.41 | 4.82× | 4.82× | 0.83 | 0.68 | 174 / 9,747 / 0 | — | 0.0141 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 1.98 | 1.98 | 1.98 | 1.98 | 0.94× | 0.94× | -0.45 | -0.36 | 40 / 2,660 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.57 | 2.57 | 2.57 | 5.24 | 0.98× | 0.75× | -0.37 | -0.33 | 111 / 5,628 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 9 | 2.20 | 2.68 | 2.68 | 3.24 | 1.12× | 1.24× | 0.34 | 0.18 | 44 / 2,914 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 2.13 | 2.13 | 2.13 | 2.98 | 0.95× | 0.71× | -0.20 | -0.15 | 38 / 2,996 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 19 | 2.46 | 3.46 | 3.46 | 10.13 | 1.47× | 0.99× | -0.17 | -0.12 | 45 / 3,636 / 0 | — | 0.0005 ms per byte | — |
| fs.write | >512 KiB · contended | 3 | 15.43 | 15.43 | 15.43 | 21.74 | no baseline | no baseline | -2.62 | -2.51 | 471 / 28,464 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 6 | 11.74 | 12.50 | 12.50 | 12.77 | no baseline | no baseline | -5.79 | -10.66 | 200 / 6,761 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 45 | 16.53 | 105.87 | 123.63 | 137.79 | 1.94× | 7.10× | 0.36 | 0.42 | 506 / 30,136 / 0 | — | 0.0385 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 31 | 7.64 | 15.16 | 15.96 | 19.46 | 1.20× | 1.44× | -0.51 | -0.33 | 159 / 8,172 / 0 | — | 0.016 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 5 | 15.58 | 17.06 | 17.06 | 89.74 | 0.97× | 1.06× | 0.10 | 0.15 | 349 / 16,385 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 13 | 9.76 | 15.41 | 15.41 | 16.76 | 1.18× | 1.87× | 0.01 | 0.06 | 168 / 7,395 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 89 | 16.07 | 71.05 | 77.57 | 78.04 | 1.62× | 3.23× | 0.08 | 0.10 | 517 / 31,293 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 154 | 8.00 | 14.32 | 20.66 | 24.75 | 1.11× | 1.05× | -0.10 | -0.02 | 159 / 6,914 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 145 | 15.46 | 45.95 | 56.68 | 96.73 | 1.58× | 2.05× | -0.05 | 0.00 | 455 / 28,686 / 0 | — | 0.0061 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 137 | 7.70 | 13.88 | 23.31 | 36.11 | 1.07× | 1.00× | -0.00 | 0.05 | 162 / 7,367 / 0 | — | 0.0017 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.71 | 0.71 | 0.71 | 0.71 | 0.94× | 0.94× | -0.29 | -0.22 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 27 | 29.05 | 50.29 | 53.74 | 56.78 | 1.38× | 1.44× | 0.05 | 0 | 312 / 48,204 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 90 | 22.08 | 36.30 | 56.95 | 175.64 | 1.06× | 1.05× | -0.13 | -0.12 | 231 / 21,214 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 11 | 3.59 | 6.87 | 6.87 | 7.69 | 0.94× | 0.85× | 0.16 | 0.16 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 37 | 3.14 | 4.46 | 4.63 | 8.45 | 0.78× | 0.87× | -0.20 | -0.15 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 6 | 9.44 | 9.92 | 9.92 | 11.47 | 0.98× | 0.51× | 0.02 | 0.06 | 117 / 4,377 / 0 | — | 9.442 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 12 | 8.56 | 12.69 | 12.69 | 28.79 | 1.03× | 1.04× | -0.15 | -0.12 | 118 / 4,699 / 0 | — | 8.563 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 247.29 | 247.29 | 247.29 | 247.29 | 6.49× | 6.49× | 0.05 | 0.03 | 12,911 / 462,742 / 0 | — | 247.29 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 3 | 12.46 | 12.46 | 12.46 | 12.76 | 0.84× | 0.63× | 1.05 | 0.88 | 153 / 8,865 / 0 | — | 3.116 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 10.51 | 16.92 | 16.92 | 19.65 | 0.98× | 0.99× | -0.06 | -0.08 | 149 / 7,402 / 0 | — | 4.559 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 26.14 | 26.14 | 26.14 | 26.14 | 1.58× | 1.58× | 0.40 | 0.25 | 453 / 24,579 / 0 | — | 4.3573 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 22.62 | 22.62 | 22.62 | 22.62 | 1.65× | 1.65× | 1.05 | 1.03 | 468 / 23,156 / 0 | — | 4.5236 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 111.81 | 111.81 | 111.81 | 117.69 | no baseline | no baseline | 2.17 | 2.04 | 2,662 / 398,699 / 8,191 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 8 | 104.17 | 1044.58 | 1044.58 | 13742.40 | 1.51× | 15.14× | 0.19 | 0.20 | 1,582 / 74,773 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 179 | 595.65 | 858.12 | 3003.38 | 3286.14 | 11.62× | 2.23× | 2.19 | 1.62 | — | 4188.30 | — | — |
| sandbox.exec | 0 files · uncontended | 199 | 32.05 | 600.05 | 891.29 | 6668.00 | 1.01× | 2.10× | -0.20 | -0.17 | — | 4188.30 | — | — |
| sandbox.exec | 1 files · contended | 19 | 36.12 | 51.62 | 51.62 | 55.10 | 0.98× | 0.61× | 0.10 | 0.07 | — | 5 | 36.116 ms per file | — |
| sandbox.exec | 1 files · uncontended | 45 | 36.03 | 54.11 | 61.75 | 62.80 | 1.08× | 0.80× | 0.24 | 0.20 | 0 / 0 / 0 | 5 | 36.026 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 63.81 | 63.81 | 63.81 | 68.25 | 0.91× | 0.91× | 0.12 | 0.09 | — | 104 | 3.4127 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 1 | 54.07 | 54.07 | 54.07 | 54.07 | 0.78× | 0.78× | -0.24 | -0.20 | — | 90 | 2.7035 ms per file | — |
| sandbox.exec | 2–4 files · contended | 19 | 36.45 | 57.30 | 57.30 | 60.27 | 0.94× | 0.82× | -0.05 | -0.04 | — | 14.70 | 12.1503 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 44 | 39.60 | 64.18 | 69.10 | 69.17 | 1.04× | 0.98× | -0.39 | -0.26 | — | 11 | 15.429 ms per file | — |
| sandbox.exec | 5–16 files · contended | 19 | 50.04 | 66.79 | 66.79 | 74.75 | 0.86× | 0.92× | 0.56 | 0.42 | — | 27 | 7.7515 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 10 | 43.08 | 56.84 | 56.84 | 62.96 | 0.61× | 0.54× | -0.29 | -0.15 | — | 11.90 | 5.3855 ms per file | — |
| sandbox.exec | — · contended | 10 | 2882.47 | 25899.56 | 25899.56 | 25926.60 | no baseline | no baseline | -1.28 | -1.02 | — | 44117.10 | — | — |
| sandbox.exec | — · uncontended | 29 | 299.03 | 22630.49 | 25259.83 | 34467.58 | 0.56× | 3.18× | 0.74 | 0.53 | — | 43,502 | — | — |
| sandbox.mount | — · contended | 55 | 9.52 | 13.83 | 16.11 | 17.45 | 0.85× | 0.73× | -0.22 | -0.15 | 57 / 1,578 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 153 | 8.82 | 12.88 | 14.97 | 17.05 | 0.79× | 0.64× | -0.30 | -0.23 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.61 | 3.61 | 3.61 | 3.61 | no baseline | no baseline | 0.17 | 0.17 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 3.61 | 3.61 | 3.61 | 44.45 | no baseline | no baseline | -0.13 | -0.10 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 42 | 10.37 | 17.25 | 18.68 | 26.29 | 0.98× | 0.95× | -0.15 | -0.07 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 166 | 10.79 | 19.77 | 107.50 | 184.59 | 1.03× | 1.07× | -0.05 | -0.02 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 11 | 0.0 KiB | 591.3 KiB | 2,592 | ok 11 |
| branch.diff_commits | branch | 402 | 0.0 KiB | 22.1 MiB | 74,428 | ok 402 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.5 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 24 | 706.3 KiB | 0.0 KiB | 35 | Committed 24 |
| fs.diff_files | fs | 50 | 0.0 KiB | 349.0 KiB | 36 | Text 35, NoSuchPath 14, Equal 1 |
| fs.glob | fs | 52 | 0.0 KiB | 54.4 KiB | 700 | ok 52 |
| fs.grep | fs | 59 | 0.0 KiB | 215.0 KiB | 961 | ok 59 |
| fs.list | fs | 62 | 0.0 KiB | 294.3 KiB | 1,993 | ok 62 |
| fs.read | fs | 43 | 0.0 KiB | 117.4 KiB | 43 | ok 43 |
| fs.rm | fs | 25 | 0.0 KiB | 0.0 KiB | 25 | Committed 25 |
| fs.stat | fs | 46 | 0.0 KiB | 10.0 KiB | 46 | ok 46 |
| fs.write | fs | 628 | 13.5 MiB | 0.0 KiB | 628 | Committed 628 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 213 | 0.0 KiB | 0.0 KiB | 0 | Committed 164, UpToDate 48, Conflict 1 |
| sandbox.exec | sandbox | 587 | 2.1 MiB | 5.5 MiB | 0 | exit:0 584, exit:2 3 |
| sandbox.mount | sandbox | 218 | 0.0 KiB | 0.0 KiB | 0 | Mounted 218 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 218 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 218 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 2.22 · end 1.86.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.107 | 13.116 · 1.136 · 1.107 · 0.942 · 1.087 | 2.36–2.36 | statements 32, vm_steps 1071, fullscan_steps 0, sorts 0, returned_rows 88 |
| read | 1.129 | 1.225 · 1.129 · 1.151 · 0.982 · 1.02 | 2.36–2.36 | statements 18, vm_steps 768, fullscan_steps 0, sorts 0, returned_rows 74 |
| list_small | 1.008 | 1.175 · 1.022 · 1.008 · 0.947 · 0.963 | 2.36–2.36 | statements 18, vm_steps 777, fullscan_steps 0, sorts 0, returned_rows 74 |
| list_largest | 8.32 | 10.875 · 8.677 · 8.32 · 8.15 · 7.963 | 2.36–2.36 | statements 179, vm_steps 23793, fullscan_steps 0, sorts 0, returned_rows 2442 |
| grep_scoped | 1.064 | 1.365 · 1.117 · 1.064 · 1.026 · 1.02 | 2.36–2.36 | statements 23, vm_steps 923, fullscan_steps 0, sorts 0, returned_rows 83 |
| glob_scoped | 0.985 | 0.985 · 0.93 · 0.941 · 1.04 · 1.076 | 2.36–2.36 | statements 17, vm_steps 756, fullscan_steps 0, sorts 0, returned_rows 73 |
| grep_tree | 4969.795 | 4969.795 · 4975.076 · 4952.916 · 4978.958 · 4952.681 | 2.02–2.31 | statements 60083, vm_steps 4571665, fullscan_steps 0, sorts 0, returned_rows 459264 |
| glob_tree | 7.459 | 10.223 · 8.363 · 7.459 · 7.418 · 7.367 | 2.02–2.02 | statements 137, vm_steps 19449, fullscan_steps 0, sorts 0, returned_rows 2096 |
| diff_files | 4.773 | 4.917 · 4.845 · 4.773 · 4.749 · 4.682 | 2.02–2.02 | statements 90, vm_steps 4492, fullscan_steps 0, sorts 0, returned_rows 444 |
| list_commits | 0.616 | 1.129 · 0.616 · 0.582 · 0.649 · 0.584 | 2.02–2.02 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.277 | 2.794 · 2.153 · 2.295 · 2.277 · 2.225 | 2.02–2.02 | statements 63, vm_steps 2485, fullscan_steps 0, sorts 0, returned_rows 291 |
| fork | 0.709 | 0.761 · 0.368 · 0.437 · 0.713 · 0.709 | 2.02–2.02 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 24.439 | 25.242 · 24.899 · 24.143 · 23.301 · 24.439 | 2.02–2.02 | statements 501, vm_steps 23509, fullscan_steps 0, sorts 0, returned_rows 1874 |
| oneshot_mount_unmount | 14.869 | 18.793 · 14.869 · 16.59 · 14.56 · 14.166 | 2.02–2.02 | statements 66, vm_steps 2291, fullscan_steps 82, sorts 2, returned_rows 224 |
| oneshot_commit | 65.943 | 70.063 · 75.816 · 61.133 · 63.58 · 65.943 | 2.02–2.02 | statements 185, vm_steps 12340, fullscan_steps 82, sorts 2, returned_rows 977 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.02–2.02 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r046: 335,916 pages of 4,096 B, 0 free · Commits 55,515 · Branches 1,121 · Layers 56 · compression 3.63× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 181,937 | 1.09 GiB |
| 2 | 63,352 | 965.1 MiB |
| 3 | 16,455 | 5.5 MiB |
| 4 | 49 | 9.4 KiB |
| 5 | 16,350 | 1.7 MiB |
| 6 | 145,574 | 704.3 MiB |
| 7 | 392,155 | 96.7 MiB |
| 8 | 1,166 | 333.4 KiB |
| 9 | 116,801 | 256.3 MiB |
| 10 | 59,709 | 7.3 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,425 | 199.0 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 57,044 | 117.1 MiB |
| 1 | 62,846 | 753.8 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 233,239 | 911.1 MiB | 33.1 MiB |
| inode_value | 61,009 | 238.3 MiB | 4.8 MiB |
| binding_hint | 17,974 | 70.2 MiB | 6.6 MiB |
| object_location | 13,679 | 53.4 MiB | 5.6 MiB |
| commit | 4,582 | 17.9 MiB | 2.9 MiB |
| file_digest | 1,509 | 5.9 MiB | 686.4 KiB |
| commit_lineage | 1,197 | 4.7 MiB | 557.6 KiB |
| commit_runs | 1,166 | 4.6 MiB | 604.1 KiB |
| commit_identity | 858 | 3.4 MiB | 386.0 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 49 | 196.0 KiB | 32.0 KiB |
| branch_names | 18 | 72.0 KiB | 12.2 KiB |
| branch_identity | 13 | 52.0 KiB | 8.1 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| run_merges | 7 | 28.0 KiB | 8.6 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 6.1 KiB |
| layers_source | 3 | 12.0 KiB | 7.1 KiB |
| layers_child | 3 | 12.0 KiB | 7.1 KiB |
| absorbed_heights | 3 | 12.0 KiB | 5.6 KiB |

### E. Stage times

**Time 279.7 s** (tooling): play 101.1 · consolidate 103.9 · verify 24.7 · probes 25.8 · tests 0.0 · seal + snapshot 9.2 · report 15.0

279.71 s tooling: prepare 1.47 · play 99.67 · consolidate 103.93 · verify 13.91 (diff_commits + full compareTree) · version walk 10.78 · probes 25.81 · metrics 0.69 · seal 1.23 · sealed figures 4.41 · snapshot copy 3.52 · report 0.36

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T04:57:28.686Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 15.14× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.369) and statements per entry does not rise (0.05): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8); Contended work: fs.rm 1 files · contended: SQL VM steps against tree files, exponent 1.914 over 10 ranges |

### G. Evidence

- `~/lfs-history/metrics/range-046.a1.json`
- trace `~/lfs-history/runs/p3-main-w/trace/range-046.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-w/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-046.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r046-3-agents-notes | 518 | 558.7 KiB |
| r046-1-packages-client | 586 | 557.5 KiB |
| r046-2-root | 401 | 558.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 434.0 | 4,529 |
| `git diff --stat` | 34.0 | 4,523 |
| `git add -f` | 32.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 37.0 | 4,526 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r046-3-agents-notes | end | P1 | pass | — | — |
| r046-3-agents-notes | end | P2 | pass | exit 0 | — |
| r046-3-agents-notes | end | P3 | pass | 270 bookkeeping path(s) | — |
| r046-3-agents-notes | end | P4 | pass | 110 emitted files, exit 2 | — |
| r046-3-agents-notes | end | P5 | n/a | no calibrated file | — |
| r046-3-agents-notes | end | P6 | n/a | not a repair | — |
| r046-1-packages-client | end | P1 | pass | — | — |
| r046-1-packages-client | end | P2 | pass | exit 0 | — |
| r046-1-packages-client | end | P3 | pass | 270 bookkeeping path(s) | — |
| r046-1-packages-client | end | P4 | pass | 301 emitted files, exit 2 | — |
| r046-1-packages-client | end | P5 | n/a | no calibrated file | — |
| r046-1-packages-client | end | P6 | n/a | not a repair | — |
| r046-2-root | end | P1 | pass | — | — |
| r046-2-root | end | P2 | pass | exit 0 | — |
| r046-2-root | end | P3 | n/a | an install, not a refresh | — |
| r046-2-root | end | P4 | pass | 405 emitted files, exit 2 | — |
| r046-2-root | end | P5 | pass | 102 files | — |
| r046-2-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2071 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
