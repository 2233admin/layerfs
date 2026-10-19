# Range 019 · **stop** · attempt 3

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r018 (run p3-main-l)
dsh `e481288a3`..`67053d1cf` · **81 commits** (9 mainline, 72 side) · 2026-07-14 → 2026-07-19
Areas changed: `packages/core` 19% · `/` 12% · `packages/ui` 8% · other 61%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 21 pass, 1 stop, 0 NOT_RUN over 5 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 103.2 s · git 116.3 s · Node 270.9 s · verify 92.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **552.8 MiB** (+180.6 KiB) | **354.4 MiB** (+25.0 MiB) | **0.64×** (prev 0.60×) | **27.4 MiB** | **959** (total 18,401) | **364.7 s** tooling (total 31.9 min) |

**Checks:** 13 pass · 4 watch: Speed branch.diff_commits >64 entries · uncontended: 15.91× baseline (no phase); Counters grep_tree.returned_rows per tree byte: depth exponent 0.385; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection 1.07 · 2 optimize/stop: Scaling, Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ fs.write p95 +79% · ▼ stored added −59% · ▲ probe diff_commits +59%
**Budget:** 20 of 202 ranges · projected total 18.1 h (budget 16.8 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,673 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 2 publishes |
| Steps | 2,054 / 2,054 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 1812 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 292 bin shims, 3179 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (35 lines from 2 .gitignore files) · **251 picks** in 4 merges (242 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `67053d1cf`** · 360 commits written for 360 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 242 · Build outputs 9 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r019-2-packages-core | end | `b639fe9a30e3` | `1ca44e155637` | pass (295 normalized) | pass | pass | pass | pass | n/a |
| r019-3-packages-support | end | `7ff6c1978e4d` | `1ca44e155637` | pass (295 normalized) | pass | pass | pass | pass | n/a |
| r019-1-root | end | `dc4d7c9471cd` | `46b2dc783702` | pass (293 normalized) | pass | n/a | pass | pass | n/a |
| r019-4-packages-ui | end | `33b61c17aa15` | `1ca44e155637` | pass (295 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `5086f6d30def` | `null` | n/a | pass | n/a | n/a | pass | stop (115,524 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/core/agent-loop/tests/cancel.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively) · `packages/core/agent-loop/tests/contract-regressions.spec.ts` (fails natively) · `packages/core/agent-loop/tests/coverage-edges.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/properties.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-log.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/core/agent-loop/tests/resume.spec.ts` (fails natively) · `packages/core/agent-loop/tests/review-fixes.spec.ts` (fails natively) · `packages/core/agent-loop/tests/scope-lifecycle.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-order.spec.ts` (fails natively) · `packages/core/agent-loop/tests/turn-stop.spec.ts` (fails natively) · `packages/core/agent/tests/agent.spec.ts` (fails natively) · `packages/core/session/tests/derived-cache.spec.ts` (fails natively) · `packages/core/session/tests/fork.spec.ts` (fails natively) · `packages/core/session/tests/json.spec.ts` (fails natively) · `packages/core/session/tests/properties.spec.ts` (fails natively) · `packages/core/session/tests/repair.spec.ts` (fails natively) · `packages/core/session/tests/request-header.spec.ts` (fails natively) · `packages/core/session/tests/scoped.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-mode.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/properties.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/tools/tests/tools.spec.ts` (fails natively) · `packages/core/tools/tests/ts-types.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact/tests/tool-pairing.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/support/llm-replay/tests/llm-replay.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/convert.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/session.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively).

## 2. Activity

**2,764 calls** · **190 steps** by **10 agents + lead** on **4 Branches + main** · **241 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +51 added · 734 modified · −47 deleted · 11.0 MiB written · fs 771 : Sandbox 61 (**13 : 1**, reported only in P3)
**Execs:** 639 (JS 66 · shell 573) · 3 non-zero exits · install 0 · test runs 5 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,017 | 784 | 233 | Committed 784 · Text 25 · NoSuchPath 8 |
| sandbox | 1,366 | 879 | 5 | commit 240 (Committed 189, UpToDate 50, Conflict 1) · exec 639 (exit:0 636, exit:2 3) · mount 241 (Mounted 241) · status 5 · unmount 241 (Unmounted 241) |
| branch | 370 | 35 | 335 | diff_branches 11 · diff_commits 324 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 2 (Added 2) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,764** | **1,698** | **584** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r019-1-root | a01 | 6 | 222 | ✓ | ✓ |
| r019-2-packages-core | a02 a03 a04 | 46 | 158 | ✓ | — |
| r019-3-packages-support | a05 a06 a07 | 76 | 185 | ✓ | — |
| r019-4-packages-ui | a08 a09 a10 | 54 | 169 | ✓ | — |
| main | lead | 8 | 225 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r019-3, a05 after a06 | 0.1 s |
| Stale clean merge | 1 / 1 | r019-3, a05 a07 | merged cleanly |
| Decoy edit | 1 / 1 | r019-3, a07 a06 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r019-2 vs r019-1 publish | 7.3 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r019-1 | 6 | 4 | 2 | 0 | 0 | 222 | — |
| a02 | r019-2 | 34 | 16 | 18 | 0 | 0 | 126 | — |
| a03 | r019-2 | 6 | 2 | 4 | 0 | 0 | 21 | — |
| a04 | r019-2 | 6 | 2 | 4 | 0 | 0 | 11 | — |
| a05 | r019-3 | 39 | 18 | 21 | 0 | 0 | 97 | commit-conflict, stale-clean-merge |
| a06 | r019-3 | 22 | 12 | 10 | 0 | 0 | 50 | commit-conflict, decoy |
| a07 | r019-3 | 15 | 8 | 7 | 0 | 0 | 38 | stale-clean-merge, decoy |
| a08 | r019-4 | 8 | 4 | 4 | 0 | 0 | 8 | — |
| a09 | r019-4 | 41 | 20 | 21 | 0 | 0 | 143 | — |
| a10 | r019-4 | 5 | 2 | 3 | 0 | 0 | 18 | — |
| lead | main | 8 | 1 | 0 | 7 | 0 | 225 | merge-race |
| **Total** |  | **190** | **89** | **94** | **7** | **0** | **959** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 136 · pnpm 1 · tsc 4 · vitest 5 · other 493

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r019-4-packages-ui | 36 | 36 | 36 | 0 | 36 | 407 |
| r019-2-packages-core | 38 | 38 | 38 | 0 | 38 | 412 |
| r019-3-packages-support | 50 | 50 | 50 | 1 | 50 | 470 |
| r019-1-root | 4 | 4 | 4 | 2 | 4 | 156 |
| **lead** | — | — | — | — | 360 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r019-2-packages-core | 0 | 1 | 1 | 1 | 10 | 10 / 10 |
| r019-3-packages-support | 0 | 1 | 1 | 1 | 6 | 6 / 6 |
| r019-1-root | 1 | 0 | 1 | 1 | 77 | 77 / 77 |
| r019-4-packages-ui | 0 | 1 | 1 | 1 | 27 | 27 / 27 |
| **lead repair** | 1 | — | 1 | — | — | 115,524 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r018) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 552.7 MiB (11.4 MiB / 509.1 MiB / 12.0 MiB / 20.1 MiB) | 552.8 MiB (11.4 MiB / 509.2 MiB / 10.5 MiB / 21.8 MiB) | +180.6 KiB |
| Version figures from | — | full: first (no manifest for range 18) | — |
| Files / directories / symlinks | 49,763 / 8,447 / 3,180 | 49,730 / 8,423 / 3,185 | −33 / −24 / +5 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 329.4 MiB | 354.4 MiB | +25.0 MiB |
| **Space amplification** (total · tracked) | 0.60× · tracked 3.35× | 0.64× · tracked 3.51× | 0.04 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **8.73** (1.48 / 0.28 / 1.40) | 4.44× the median range |
| **Stored per Commit** | 39.8 KiB | 26.5 KiB | — |
| Metadata share | 0.34 | 0.35 | this range 0.49 |
| History: Commits / Layers / Branches | 17,442 | 18,401 / 10 / 69 | +959 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.62 GiB (Commits 9.11 GiB · installs 1.05 GiB · build 116.8 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.07 GiB / 41% | — |
| Snapshot | — | r019, 315.4 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 229.2 MiB | 0.41 | +11.6 MiB |
| Metadata | 31.7 MiB | 0.06 | +2.4 MiB |
| Index rows | 72.5 MiB | 0.13 | +9.7 MiB |
| Waste | 20.5 MiB | 0.04 | +1.2 MiB |
| Other | 444.0 KiB | 0.00 | +32.0 KiB |
| **Total = Store on disk** | **354.4 MiB** | **= 0.64** space amplification | +25.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 11.4 MiB | 39.8 MiB (17.5 MiB + 22.4 MiB) | 3.51× | — | 1.5 MiB | 3.1 MiB | 0.48 |
| `node_modules` | 509.2 MiB | 134.6 MiB (129.6 MiB + 4.9 MiB) | 0.26× | — | 903.6 KiB | 0.1 KiB | 7343.24 |
| Build output | 10.5 MiB | 5.5 MiB (5.3 MiB + 197.4 KiB) | 0.52× | — | 934.1 KiB | 4.7 MiB | 0.19 |
| `.git` | 21.8 MiB | 80.3 MiB (76.8 MiB + 3.5 MiB) | 3.68× | — | 10.6 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 93.4 MiB | — (not divided) | — | 11.0 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 831.6 KiB | — | — | — | — | — |
| **Total** | — | **354.4 MiB** | **= 0.64×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 72,064 | +3,422 | 6.0 KiB | 47,682 (derived) | 63% |
| Chunks (large files) | 30,668 | +640 | 12.2 KiB | — | 4% |
| Large-file extents | 12,335 | — | 0.2 KiB | — | — |
| Directories | 64,890 | 3,624 (with inodes, pooled) | 0.2 KiB | — | 53% |
| Inodes and attributes | 109,983 | ↑ pooled | 2.2 KiB | — | — |
| Symlinks | 1,880 | +3,231 | 0.1 KiB | — | — |

Delta: 2.2% at depth cap · 25% of refused bases stopped by budget · `node_modules` reinstall: absolute: 780544 new stored bytes for 126 raw changed bytes of 5 changed packages (6194.794×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.51× (39.8 MiB for 11.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.4 KiB / 1.4 KiB / 3.6 KiB over 488 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.8 MiB stored for 2.00 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.16 (4 lanes × 552.8 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.3 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.6 ms / 33.4 ms (1.40×) | 3.4 ms / 4.5 ms (1.88×) | 3.2 ms / 6.8 ms (1.83×) | 19.6 ms / 83.3 ms (1.06×) | 10.9 ms / 17.7 ms (1.16×) | 795 ms / 1395 ms (1.85×) | — (native comparison in P3; exec 42.3 ms / 830 ms) |
| SQL p50: 162 stmts | 58 stmts | 54 stmts | 191 stmts | 49 stmts | 17,598 stmts | — |

**Commit cost:** 17.19 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 585 ms p50 over 241
**Slowest:** sandbox.exec 40859 ms · sandbox.exec 35682 ms · sandbox.exec 35018 ms · checkpoint diff_commits 1.31 ms and 15.71 statements per entry (59,634 entries per page)
**Scaling:** 4 of 15 probes flat · `stat` 1.25 · `read` 1.11 · `list_small` 1.10 · `list_largest` 0.64 · `grep_scoped` 0.57 · `grep_tree` 1.01 · `glob_tree` 0.57 · `diff_files` 0.72 · `diff_commits` 0.79 · `fork` 1.78 · `merge` 0.41

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 250 ms / 250 ms | — / — | — | git / status-cold: — |
| git status (steady) | 324 ms / 503 ms | — / — | — | git / status-steady: — |
| git add | 22.0 ms / 41.0 ms | — / — | — | git / add: — |
| git commit (lane) | 30.0 ms / 55.0 ms | — / — | — | git / commit: — |
| lead writes main | 10702 ms / 10702 ms | — / — | — | — |
| repack | 2790 ms / 2790 ms | — / — | — | — |
| pnpm install (incremental) | 3370 ms / 3370 ms | 1246 ms / 1246 ms | 2.70× | pnpm-reinstall / cold: — |
| pnpm refresh | 2798 ms / 2798 ms | 1272 ms / 1272 ms | 2.20× | pnpm-reinstall / steady: — |
| tsc -b | 4988 ms / 6555 ms | 2541 ms / 4807 ms | 1.96× | tsc-b / cold: — |
| vitest | 3113 ms / 8346 ms | 1018 ms / 6126 ms | 3.06× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.6 ms / 23.2 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a6 | 17442 | 329.4 | 7.23 (1.23×) · 7012 · 308 (13 solo) | 7.31 (1.18×) · 6681 · 272 (125 solo) | 8.33 (1.14×) · 7276 · 340 (134 solo) | 2.48 (1.24×) · 3475 · — (0 solo) | 9.64 (1.06×) · 1337 · — (daemon) | 9.40 (1.13×) · 5265 · — (daemon) | 2709.77 (—×) · 15044810 · 26378 (3 solo) |
| 019.a3 | 18401 | 354.4 | 7.80 (1.32×) · 6117 · 267 (11 solo) | 8.39 (1.35×) · 6706 · 305 (93 solo) | 9.78 (1.34×) · 7755 · 361 (108 solo) | 3.38 (1.69×) · 4130 · 60 (2 solo) | 10.67 (1.17×) · 1337 · — (daemon) | 10.01 (1.20×) · 4897 · — (daemon) | 795.43 (—×) · 1377699 · 7257 (4 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 2546192 → 4194304 B · fs.write ≤8 KiB 2669792 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4161232 → 4194304 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 45352 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 9.77 at the first command → 12.40 after the last (max 14.08 over 6 commands) · Docker VM 0.62 → 1.61

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-019.a3)

## 5. Findings and action

### Finding 019.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Correctness | tree 0 missing, 0 extra, 0 content, 0 mode; steps 2043/2044; conflicts 4/4; tests 0/0 equal to native | all |
| Node proofs | 18 pass · 1 stop · 0 NOT_RUN over 4 points: r019-2-packages-core end P4 | P1–P6 pass at every point |

Diagnosis pending: `finding-019.a1.json`.

### Finding 019.a2 · stop

**1. Trigger** (attempt 2, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Correctness | tree 0 missing, 0 extra, 0 content, 0 mode; steps 2043/2044; conflicts 4/4; tests 0/0 equal to native | all |

Diagnosis pending: `finding-019.a2.json`.

### Finding 019.a3 · stop

**1. Trigger** (attempt 3, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.898): tree files exponent 10.252 | < 0.15 |
| Node proofs | 21 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-019.a3.json`.

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

### Lead's note (written by the lead; never empty unless the verdict is pass)

- **Stop, held for a decision (F-059, harness oracle and workload, not a product defect).** The repair's
  `tsc -b` exited 2: `agent-spine-demo` needs `Config` from tool-bash's emitted
  `lib/types/index.d.ts`. Lane 3 built that file at an older side-branch commit
  without `Config`; the merge kept it, and the repair's build finds tool-bash up
  to date. The native repair chain with the same merge (fix 042, write order)
  also exits 2 with the same errors (diagnostic, not a proof), so LayerFS matches
  its model.
- The lane-2 point's P4 stop on `core/session/lib/types/tool-pairing.*` is the
  same cause one range back. LayerFS keeps r18's repaired output (`c233d58c`,
  equal to native in r18's P6). The point oracle's base is a fresh build of the
  r18 tree (`2352ae25`).
- Lanes 86.5 s, final command 107 s under the declared 295 s alarm. Speed watch
  is `branch.diff_commits` scaling only (#364 item 4, as in r18). Next attempt
  waits for the liaison.
- `report.mjs check 019`: FAIL F1, F7. Both come from the stop inside the closure:
  the build's Commit never happened (Overview counts 959 Commits against 958), and
  the report falls back to the older header without the Wall time row. Not changed
  for a held attempt; to fix with the next attempt.
- **a2 (`p3-main-l`, from r18 a6's live state, harness `15b3cce060`, daemon `44ac6c91`, addon `77597adb`): STOP. A harness gap in fix 043's clean, not a LayerFS defect.** The repair's install passed (32.3 s). Its build (clean plus whole build) passed `tsc -b`, then tsdown failed (exit 1, 12.1 s): `MISSING_EXPORT "AgentId"` in a `lib/types/index.js`. No source at the checkpoint mentions `AgentId`. The file sits in folders the checkpoint deletes: `packages/core/agent-core` (lane 2's tree) and `packages/ui/stdio-agent` (lane 4's). Lanes built there at older commits. The lead's git step removes their tracked files, but the untracked `lib/` stays, and tsdown bundles every `packages/<group>/<name>` folder. The clean covered only the checkpoint's tsconfig packages. The native repair chain fails the same way (diagnostic).
  - Corrected in fix 043: the clean also removes `packages/*/*/lib` and every tsbuildinfo under `packages/`, then prunes empty folders (`PRUNE_EMPTY`), so the orphan folders go, as on a fresh checkout. Natively the corrected repair build of r19 exits 0 in 7.5 s with 721 emitted files (diagnostic).
  - The run is dirty. a3 forks `p3-main-l`'s r018 snapshot (r18 a6). Lanes 96 s; final command 105 s. Report check F1–F8 PASS.
- **a3 (`p3-main-m`, fork of `p3-main-l`'s r018 snapshot, harness `10fc29d4f1`, daemon `44ac6c91`, addon `77597adb`): STOP at the repair's P6 on an oracle bug (F-060), not a LayerFS defect.** Checkpoint ok, git ✓. The four lane points pass P1–P5. The repair passes P2 and P5. Repair build 13.97 s, exit 0 (clean plus whole build, 721 emitted files). P6 stopped: "P4 stop (tsc exit 0, native 1)". The native chain never applied the plan's reconcile, so files the lanes created that the checkpoint deleted (`packages/ui/stdio-agent/src`, `tests`) stayed natively. tsdown then took the folder as a package without `lib/types`.
  - Fixed in fix 044: the native repair chain removes the reconcile's `rm` paths. With the fix, r19 a3's native repair build exits 0 and all 721 emitted files equal LayerFS's (diagnostic).
  - Correction to a2's note: its "natively exit 0" diagnostic ran without lane states, because a2's points had no recorded native trees. The cause stands.
  - Final command 256 s under the 295 s alarm. The control sample `control-019.a3` passes. a4 forks r18 a6's snapshot again. Report check F1–F8 PASS. The only other non-pass rows are `diff_commits` scaling (optimize, #364 item 4) and watch rows.

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2054/2054; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 15.91× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.898): tree files exponent 10.252 | < 0.15 | optimize |
| Counters | grep_tree.returned_rows per tree byte: depth exponent 0.385 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.488 | < 0.5 | pass |
| Reinstall growth | absolute: 780544 new stored bytes for 126 raw changed bytes of 5 changed packages (6194.794×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0224 (budget 0.2533) | < 0.1 | pass |
| Range growth | 27.4 MiB, 0.69× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 1295 ms for 315.4 MiB new; size exponent -0.382 | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 1.07 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 360 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 21 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 | P1–P6 pass at every point | stop |
| `.git` conflicts | 0 (tracked 0 · install 242 · build 9; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 190 | 190 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 959 | 816 |
| Workspaces (one-shot share) | 241 (0.99) | 93 (0.978) |
| Reads | 185 | 185 |
| Reconcile writes | 217 | 217 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 3). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 236.18 | 236.18 | 236.18 | 236.18 | 3.80× | 3.80× | — | — | 7,673 / 216,717 / 0 | — | 0.9719 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 10 | 21.64 | 270.54 | 270.54 | 271.19 | 1.41× | 5.40× | 0.55 | 0.99 | 350 / 34,389 / 0 | — | 0.0906 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 506.41 | 506.41 | 506.41 | 506.41 | no baseline | no baseline | 3.57 | 5.73 | 9,978 / 358,894 / 0 | — | 2.3664 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 318 | 276.20 | 331.85 | 427.42 | 743.70 | 15.91× | 12.95× | 7.43 | 12.23 | 3,382 / 531,524 / 0 | — | 1.4498 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.52 | 1.30 | 1.30 | 2.24 | 0.75× | 0.95× | -1.74 | -2.53 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 1.31 | 1.31 | 1.31 | 4.99 | no baseline | no baseline | 0.97 | 1.35 | 70 / 1,298 / 0 | — | 0.0656 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 2 | 795.43 | 795.43 | 795.43 | 1395.47 | 1.85× | 1.85× | — | — | 17,598 / 1,377,699 / 2,625 | — | 18.4983 ms per entrie | branch.merge |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 1.77 | 1.77 | 1.77 | 1.77 | 1.79× | 1.79× | — | — | 35 / 517 / 0 | — | 0.03 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 1515.12 | 1515.12 | 1515.12 | 1515.12 | 2.98× | 2.98× | -0.02 | -0.03 | 35,572 / 3,292,357 / 5,814 | — | 20.4746 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 2 | 7.50 | 7.50 | 7.50 | 14.89 | 2.72× | 2.72× | 1.53 | 2.18 | 60 / 1,239 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 37.40 | 37.40 | 37.40 | 37.40 | 1.97× | 1.97× | 0.41 | 0.78 | 171 / 17,909 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 1 | 17.03 | 17.03 | 17.03 | 17.03 | 1.96× | 1.44× | 0.20 | 0.07 | 399 / 21,173 / 0 | — | 0.069 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 44.82 | 44.82 | 44.82 | 44.82 | 5.04× | 3.44× | 1.03 | 0.86 | 830 / 130,332 / 8,511 | — | 0.0047 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 12.13 | 12.13 | 12.13 | 12.13 | 1.80× | 1.30× | -0.32 | -0.90 | 154 / 9,505 / 0 | — | 0.0014 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 1 | 55.38 | 55.38 | 55.38 | 55.38 | 6.54× | 3.75× | 2.45 | 3.01 | 1,078 / 121,749 / 8,191 | — | 0.0522 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 7 | 11.02 | 11.53 | 11.53 | 13.75 | 1.56× | 1.17× | 0.74 | 0.98 | 164 / 10,698 / 0 | — | 0.0045 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 1 | 8.84 | 8.84 | 8.84 | 8.84 | 1.58× | 1.41× | 0.33 | 0.35 | 197 / 12,454 / 0 | — | — | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 14 | 8.63 | 10.56 | 10.56 | 13.03 | 1.60× | 1.43× | 1.48 | 2.21 | 193 / 11,383 / 0 | — | 0.0298 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 1 | 19.01 | 19.01 | 19.01 | 19.01 | 3.09× | 2.68× | 2.50 | 3.39 | 145 / 9,225 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 6 | 11.65 | 13.31 | 13.31 | 19.12 | 1.75× | 1.86× | 1.97 | 2.81 | 207 / 12,838 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 9.06 | 9.06 | 9.06 | 9.06 | 1.71× | 1.31× | 0.51 | 0.78 | 250 / 14,136 / 0 | — | 0.0025 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 9.37 | 10.50 | 10.50 | 11.11 | 1.76× | 1.73× | 1.32 | 1.96 | 196 / 11,360 / 0 | — | 0.002 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 2.57 | 2.57 | 2.57 | 2.57 | 1.67× | 1.67× | 1.16 | 2.41 | 49 / 3,549 / 0 | — | 2.57 ms per file | — |
| fs.glob | 1 files · uncontended | 2 | 2.39 | 2.39 | 2.39 | 3.84 | 1.95× | 1.82× | 1.28 | 2.39 | 40 / 3,149 / 0 | — | 2.387 ms per file | — |
| fs.glob | 17–64 files · uncontended | 7 | 6.44 | 8.54 | 8.54 | 9.17 | 3.33× | 3.26× | 0.50 | 0.89 | 94 / 12,541 / 0 | — | 0.2688 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 3.51 | 3.51 | 3.51 | 3.53 | 2.33× | 1.76× | 0.95 | 1.12 | 52 / 4,656 / 0 | — | 1.1687 ms per file | — |
| fs.glob | 5–16 files · contended | 3 | 5.52 | 5.52 | 5.52 | 8.16 | 4.26× | 3.90× | 1.50 | 2.39 | 98 / 10,111 / 0 | — | 0.5078 ms per file | — |
| fs.glob | 5–16 files · uncontended | 14 | 3.15 | 4.96 | 4.96 | 5.55 | 1.63× | 2.15× | 0.47 | 0.72 | 54 / 4,575 / 0 | — | 0.4551 ms per file | — |
| fs.glob | >64 files · uncontended | 3 | 5.14 | 5.14 | 5.14 | 9.55 | 0.98× | 0.67× | -1.34 | -1.68 | 91 / 10,729 / 0 | — | 0.0191 ms per file | — |
| fs.grep | 1 files · uncontended | 2 | 2.88 | 2.88 | 2.88 | 3.44 | 2.28× | 2.28× | 1.20 | 1.77 | 58 / 4,363 / 0 | — | 2.876 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 3 | 15.26 | 15.26 | 15.26 | 20.43 | 4.24× | 3.52× | 1.43 | 2.32 | 293 / 18,473 / 0 | — | 0.5263 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 7.53 | 7.53 | 7.53 | 12.77 | 3.22× | 2.62× | 2.37 | 3.40 | 188 / 12,155 / 0 | — | 3.7645 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 8 | 4.59 | 5.56 | 5.56 | 5.61 | 2.42× | 1.61× | 1.20 | 1.65 | 68 / 4,913 / 0 | — | 2.0665 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 6.97 | 6.97 | 6.97 | 17.92 | 2.92× | 1.64× | 1.37 | 2.33 | 171 / 8,809 / 0 | — | 0.9961 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 7 | 4.82 | 8.73 | 8.73 | 10.02 | 1.53× | 2.54× | -0.07 | 0.00 | 98 / 5,638 / 0 | — | 0.694 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 1 | 28.85 | 28.85 | 28.85 | 28.85 | 1.89× | 1.89× | 0.08 | 0.27 | 837 / 48,026 / 0 | — | 0.1072 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 3 | 43.61 | 43.61 | 43.61 | 64.44 | 3.80× | 2.77× | 0.27 | 0.11 | 822 / 46,937 / 0 | — | 0.0392 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 1 | 6.96 | 6.96 | 6.96 | 6.96 | 3.88× | 3.33× | 1.79 | 2.53 | 135 / 12,516 / 0 | — | 0.2898 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 5 | 5.70 | 6.03 | 6.03 | 6.78 | 2.37× | 2.40× | 1.23 | 1.83 | 94 / 13,820 / 0 | — | 0.1206 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 3.97 | 3.97 | 3.97 | 5.89 | 1.97× | 1.97× | 0.50 | 0.59 | 92 / 6,337 / 0 | — | 0.9935 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 11 | 2.98 | 4.92 | 4.92 | 6.37 | 1.66× | 2.08× | 0.44 | 0.39 | 48 / 4,390 / 0 | — | 1.492 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 4.78 | 4.78 | 4.78 | 4.78 | 2.44× | 1.93× | 2.04 | 2.92 | 50 / 5,221 / 0 | — | 0.6823 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 12 | 2.96 | 4.13 | 4.13 | 7.35 | 1.83× | 2.02× | 0.70 | 1.14 | 52 / 4,811 / 0 | — | 0.424 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 2 | 2.08 | 2.08 | 2.08 | 2.82 | 1.75× | 1.75× | -2.66 | -5.47 | 45 / 4,216 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 3.39 | 4.20 | 4.20 | 4.47 | 1.71× | 1.78× | 0.69 | 0.95 | 62 / 3,677 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 26 | 3.38 | 4.15 | 4.46 | 4.48 | 1.88× | 1.45× | 1.15 | 1.67 | 58 / 4,130 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 1 | 65.90 | 65.90 | 65.90 | 65.90 | 8.22× | 4.90× | 3.62 | 4.41 | 1,115 / 151,870 / 8,511 | — | 65.903 ms per file | commit |
| fs.rm | 1 files · uncontended | 46 | 10.76 | 15.87 | 16.60 | 33.20 | 1.60× | 1.51× | 1.30 | 2.04 | 151 / 8,713 / 0 | — | 10.758 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 2 | 2 | 2 | 2 | 2.92 | 1.23× | 1.04× | 0.59 | 1.22 | 36 / 3,147 / 0 | — | 0.0021 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 3 | 3.34 | 3.34 | 3.34 | 3.84 | 1.95× | 1.76× | 0.48 | 0.81 | 40 / 3,978 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 11 | 2.96 | 3.98 | 3.98 | 4.00 | 1.69× | 1.94× | 0.55 | 0.65 | 51 / 3,731 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 3.22 | 3.22 | 3.22 | 3.42 | 2.30× | 1.43× | 0.07 | -0.20 | 61 / 5,358 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 11 | 2.76 | 3.29 | 3.29 | 3.36 | 1.85× | 1.51× | 0.95 | 1.29 | 47 / 3,499 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 20 | 11.10 | 42.45 | 42.45 | 153.31 | 1.52× | 3.14× | 0.53 | 1.15 | 242 / 16,356 / 0 | — | 0.0133 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 83 | 7.80 | 11.27 | 14.33 | 18.45 | 1.33× | 1.25× | 0.62 | 1.09 | 131 / 6,117 / 0 | — | 0.0097 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 4 | 13.58 | 25.16 | 25.16 | 31.53 | 1.23× | 1.69× | 0.39 | 0.70 | 331 / 18,699 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 9 | 11.12 | 20.08 | 20.08 | 25.07 | 1.20× | 2.11× | 0.17 | 0.20 | 154 / 6,654 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 73 | 16.17 | 122.10 | 177.66 | 182.97 | 1.74× | 7.66× | 1.04 | 1.56 | 383 / 22,703 / 0 | — | 0.0009 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 239 | 9.78 | 14.20 | 18.26 | 25.87 | 1.40× | 1.45× | 0.62 | 0.95 | 166 / 7,755 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 57 | 17.21 | 164.60 | 186.99 | 204.73 | 2.01× | 10.01× | 1.19 | 1.72 | 414 / 21,245 / 0 | — | 0.0054 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 228 | 8.39 | 12.75 | 15.66 | 34.96 | 1.33× | 1.24× | 0.62 | 1.02 | 151 / 6,706 / 0 | — | 0.0033 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.62 | 0.62 | 0.62 | 0.62 | 1.06× | 1.06× | -0.34 | -0.47 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 26 | 27.50 | 43.68 | 71.52 | 102.97 | 1.21× | 1.04× | -0.68 | -0.86 | 289 / 34,904 / 45 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 103 | 24.10 | 48.61 | 62.27 | 198.37 | 1.06× | 1.24× | -0.18 | -0.16 | 234 / 21,413 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 11 | 4.25 | 8.91 | 8.91 | 18.62 | 1.31× | 2.14× | 0.42 | 0.70 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 39 | 3.70 | 7.85 | 8.98 | 55.41 | 1.11× | 1.68× | 0.05 | 0.14 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 10 | 9.42 | 13.49 | 13.49 | 16.90 | 1.09× | 0.79× | -0.27 | -0.11 | 104 / 5,157 / 0 | — | 9.423 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 17 | 10.01 | 17.95 | 17.95 | 30.51 | 1.32× | 1.72× | 0.45 | 0.69 | 117 / 4,897 / 0 | — | 10.01 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 545.19 | 545.19 | 545.19 | 545.19 | 10.84× | 10.84× | 2.79 | 4.40 | 10,345 / 541,935 / 0 | — | 545.193 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 3 | 31.48 | 31.48 | 31.48 | 41.47 | 2.05× | 1.50× | 1.68 | 2.15 | 306 / 17,907 / 0 | — | 15.7405 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 13.24 | 15.34 | 15.34 | 16.75 | 1.34× | 1.37× | 0.04 | 0.07 | 151 / 7,112 / 0 | — | 4.865 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 15.52 | 15.52 | 15.52 | 15.52 | 1.37× | 1.37× | -0.24 | -0.25 | 210 / 12,967 / 0 | — | 3.1044 ms per file | commit |
| sandbox.commit | — · Committed · contended | 3 | 100.59 | 100.59 | 100.59 | 245.98 | no baseline | no baseline | -1.69 | -2.54 | 1,428 / 260,380 / 8,191 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 83.30 | 571.14 | 571.14 | 18055.14 | 1.21× | 8.28× | 1.14 | 1.70 | 532 / 27,298 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 222 | 436.09 | 794.92 | 1279.94 | 2194.56 | 10.76× | 2.30× | 5.35 | 7.63 | 0 / 0 / 0 | 2283.70 | — | — |
| sandbox.exec | 0 files · uncontended | 168 | 35.44 | 434.72 | 771.32 | 5571.07 | 1.31× | 1.69× | -0.06 | -0.10 | — | 2294.30 | — | — |
| sandbox.exec | 1 files · contended | 44 | 40.77 | 66.62 | 72.19 | 80.70 | 1.30× | 1.13× | 0.43 | 0.71 | — | 5 | 40.77 ms per file | — |
| sandbox.exec | 1 files · uncontended | 66 | 39.15 | 72.92 | 75.99 | 100.42 | 1.29× | 1.24× | 0.05 | 0.04 | — | 5 | 39.146 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 81.39 | 81.39 | 81.39 | 84.53 | 1.27× | 1.27× | 1.55 | 2.34 | — | 107 | 4.0696 ms per file | — |
| sandbox.exec | 2–4 files · contended | 23 | 41.87 | 83.35 | 92.03 | 112.88 | 1.10× | 1.34× | 0.50 | 0.92 | — | 9.70 | 17.837 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 41 | 44.73 | 72.88 | 101.70 | 116.16 | 1.36× | 1.38× | 0.70 | 1.06 | — | 10.40 | 18.678 ms per file | — |
| sandbox.exec | 5–16 files · contended | 3 | 72.68 | 72.68 | 72.68 | 73.03 | 1.39× | 1.25× | 0.90 | 1.30 | — | 30 | 10.4264 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 10 | 70.65 | 73.95 | 73.95 | 81.08 | 1.35× | 1.03× | 0.95 | 1.38 | — | 29 | 10.5647 ms per file | — |
| sandbox.exec | — · contended | 16 | 3112.03 | 35018.44 | 35018.44 | 35682.48 | no baseline | no baseline | 1.29 | 1.94 | — | 31495.30 | — | — |
| sandbox.exec | — · uncontended | 33 | 158.52 | 13971.53 | 16738.95 | 40859.47 | 0.31× | 2.93× | -1.24 | -2.12 | 1 / 12 / 0 | 31495.30 | — | — |
| sandbox.mount | — · contended | 64 | 11.75 | 20.19 | 28.05 | 29.61 | 1.17× | 1.31× | 0.22 | 0.41 | 61 / 1,619 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 167 | 10.67 | 15.53 | 21.63 | 38.32 | 1.16× | 1.12× | 0.30 | 0.48 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 4.38 | 4.38 | 4.38 | 4.38 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 5.23 | 5.26 | 5.26 | 45.42 | no baseline | no baseline | -0.56 | -1.10 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 50 | 13.20 | 21.93 | 24.50 | 28.23 | 1.58× | 1.78× | 0.81 | 1.30 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 181 | 11.57 | 26.53 | 127.14 | 173.91 | 1.27× | 1.91× | 0.58 | 0.90 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 11 | 0.0 KiB | 583.6 KiB | 2,587 | ok 11 |
| branch.diff_commits | branch | 324 | 0.0 KiB | 17.7 MiB | 60,575 | ok 324 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 94.9 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 24 | 1.8 MiB | 0.0 KiB | 35 | Committed 24 |
| fs.diff_files | fs | 33 | 0.0 KiB | 311.4 KiB | 25 | Text 25, NoSuchPath 8 |
| fs.glob | fs | 42 | 0.0 KiB | 29.6 KiB | 508 | ok 42 |
| fs.grep | fs | 38 | 0.0 KiB | 90.8 KiB | 526 | ok 38 |
| fs.list | fs | 44 | 0.0 KiB | 81.7 KiB | 646 | ok 44 |
| fs.read | fs | 39 | 0.0 KiB | 129.6 KiB | 39 | ok 39 |
| fs.rm | fs | 47 | 0.0 KiB | 0.0 KiB | 47 | Committed 47 |
| fs.stat | fs | 37 | 0.0 KiB | 7.8 KiB | 37 | ok 37 |
| fs.write | fs | 713 | 9.9 MiB | 0.0 KiB | 713 | Committed 713 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 240 | 0.0 KiB | 0.0 KiB | 0 | Committed 189, UpToDate 50, Conflict 1 |
| sandbox.exec | sandbox | 639 | 2.0 MiB | 4.0 MiB | 0 | exit:0 636, exit:2 3 |
| sandbox.mount | sandbox | 241 | 0.0 KiB | 0.0 KiB | 0 | Mounted 241 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 241 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 241 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 0.62 · end 1.61.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 2.711 | 4.217 · 2.146 · 1.746 · 2.962 · 2.711 | 2.15–2.15 | statements 17, vm_steps 1320, fullscan_steps 0, sorts 0, returned_rows 128 |
| read | 2.282 | 3.549 · 2.406 · 2.146 · 2.238 · 2.282 | 2.15–2.15 | statements 16, vm_steps 1290, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_small | 2.163 | 2.28 · 1.793 · 1.743 · 2.169 · 2.163 | 2.15–2.15 | statements 16, vm_steps 1299, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_largest | 6.515 | 7.018 · 6.515 · 6.392 · 6.13 · 6.608 | 2.15–2.15 | statements 78, vm_steps 13936, fullscan_steps 0, sorts 0, returned_rows 1350 |
| grep_scoped | 1.942 | 2.007 · 2.08 · 1.942 · 1.604 · 1.551 | 2.15–2.15 | statements 21, vm_steps 1445, fullscan_steps 0, sorts 0, returned_rows 136 |
| glob_scoped | 1.343 | 1.739 · 1.343 · 1.327 · 1.237 · 1.346 | 2.15–2.15 | statements 15, vm_steps 1278, fullscan_steps 0, sorts 0, returned_rows 126 |
| grep_tree | 4081.445 | 4344.805 · 4032.48 · 4024.776 · 4081.445 · 4324.849 | 1.97–2.06 | statements 42464, vm_steps 3478828, fullscan_steps 0, sorts 0, returned_rows 361592 |
| glob_tree | 9.92 | 12.039 · 10.086 · 9.893 · 9.543 · 9.92 | 1.97–1.97 | statements 196, vm_steps 21980, fullscan_steps 0, sorts 0, returned_rows 2161 |
| diff_files | 7.411 | 7.411 · 7.586 · 7.398 · 6.869 · 7.519 | 1.97–1.97 | statements 84, vm_steps 7696, fullscan_steps 0, sorts 0, returned_rows 768 |
| list_commits | 0.893 | 1.797 · 0.893 · 1.003 · 0.802 · 0.776 | 1.97–1.97 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.673 | 4.917 · 3.673 · 3.066 · 3.986 · 3.154 | 1.97–1.97 | statements 55, vm_steps 2455, fullscan_steps 0, sorts 0, returned_rows 264 |
| fork | 0.619 | 0.606 · 0.555 · 0.619 · 0.652 · 1.426 | 1.97–1.97 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 37.875 | 39.359 · 36.326 · 37.878 · 37.875 · 32.759 | 1.97–1.97 | statements 476, vm_steps 27013, fullscan_steps 4, sorts 8, returned_rows 2086 |
| oneshot_mount_unmount | 17.38 | 18.681 · 17.702 · 16.364 · 16.68 · 17.38 | 1.97–1.97 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 76.585 | 76.585 · 70.254 · 76.043 · 79.764 · 81.248 | 1.97–1.97 | statements 144, vm_steps 9235, fullscan_steps 80, sorts 2, returned_rows 859 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.97–1.97 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r019: 90,719 pages of 4,096 B, 0 free · Commits 18,575 · Branches 327 · Layers 24 · compression 3.99× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 72,064 | 423.8 MiB |
| 2 | 30,668 | 366.3 MiB |
| 3 | 12,313 | 2.0 MiB |
| 4 | 22 | 4.9 KiB |
| 5 | 12,252 | 1.2 MiB |
| 6 | 34,762 | 180.6 MiB |
| 7 | 64,771 | 14.5 MiB |
| 8 | 119 | 35.0 KiB |
| 9 | 29,869 | 49.1 MiB |
| 10 | 20,278 | 2.5 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,880 | 152.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 18,831 | 31.7 MiB |
| 1 | 29,861 | 229.2 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 70,738 | 276.3 MiB | 12.6 MiB |
| inode_value | 10,441 | 40.8 MiB | 928.6 KiB |
| object_location | 3,944 | 15.4 MiB | 1.6 MiB |
| binding_hint | 2,739 | 10.7 MiB | 1.0 MiB |
| commit | 1,432 | 5.6 MiB | 896.0 KiB |
| commit_lineage | 403 | 1.6 MiB | 198.3 KiB |
| commit_runs | 396 | 1.5 MiB | 226.0 KiB |
| commit_identity | 290 | 1.1 MiB | 140.8 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 15 | 60.0 KiB | 12.4 KiB |
| history_meta | 8 | 32.0 KiB | 2.6 KiB |
| sqlite_schema | 6 | 24.0 KiB | 8.0 KiB |
| branch_names | 6 | 24.0 KiB | 6.6 KiB |
| branch_identity | 5 | 20.0 KiB | 7.2 KiB |
| run_merges | 3 | 12.0 KiB | 6.7 KiB |
| layer | 3 | 12.0 KiB | 7.8 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 364.7 s** (tooling): play 104.7 · consolidate 120.7 · verify 105.3 · probes 21.9 · tests 0.0 · seal + snapshot 3.9 · report 8.2

364.72 s tooling: prepare 1.52 · play 103.15 · consolidate 120.70 · verify 92.23 (diff_commits + full compareTree) · version walk 13.04 · probes 21.91 · metrics 1.03 · seal 1.43 · sealed figures 1.15 · snapshot copy 1.36 · report 0.26

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T16:16:46.944Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 2043/2044; conflicts 4/4; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 7.25× baseline (no phase); Scaling: not judged: no probes; Counters: not judged: no counters; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Node proofs: 18 pass · 1 stop · 0 NOT_RUN over 4 points: r019-2-packages-core end P4 |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T17:00:47.340Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 2043/2044; conflicts 4/4; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 19.03× baseline (no phase); Scaling: not judged: no probes; Counters: not judged: no counters; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow); Node proofs: 0 pass · 0 stop · 20 NOT_RUN over 4 points |
| 3 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T17:09:39.381Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 15.91× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.898): tree files exponent 10.252; Counters: grep_tree.returned_rows per tree byte: depth exponent 0.385; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection: 1.07; Node proofs: 21 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 |

### G. Evidence

- `~/lfs-history/metrics/range-019.a1.json`
- `~/lfs-history/metrics/range-019.a2.json`
- `~/lfs-history/metrics/range-019.a3.json`
- trace `~/lfs-history/runs/p3-main-m/trace/range-019.a3.jsonl` · runner log `~/lfs-history/runs/p3-main-m/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-019.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r019-4-packages-ui | 407 | 203.7 KiB |
| r019-2-packages-core | 412 | 203.7 KiB |
| r019-3-packages-support | 470 | 202.9 KiB |
| r019-1-root | 156 | 201.6 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 324.0 | 1,677 |
| `git diff --stat` | 33.0 | 1,672 |
| `git add -f` | 22.0 | — |
| `git rm --cached` | 5.0 | — |
| `git commit` | 30.0 | 1,674 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r019-2-packages-core | end | P1 | pass | — | — |
| r019-2-packages-core | end | P2 | pass | exit 0 | — |
| r019-2-packages-core | end | P3 | pass | 178 bookkeeping path(s) | — |
| r019-2-packages-core | end | P4 | pass | 93 emitted files, exit 2 | — |
| r019-2-packages-core | end | P5 | pass | 10 files | — |
| r019-2-packages-core | end | P6 | n/a | not a repair | — |
| r019-3-packages-support | end | P1 | pass | — | — |
| r019-3-packages-support | end | P2 | pass | exit 0 | — |
| r019-3-packages-support | end | P3 | pass | 178 bookkeeping path(s) | — |
| r019-3-packages-support | end | P4 | pass | 59 emitted files, exit 2 | — |
| r019-3-packages-support | end | P5 | pass | 6 files | — |
| r019-3-packages-support | end | P6 | n/a | not a repair | — |
| r019-1-root | end | P1 | pass | — | — |
| r019-1-root | end | P2 | pass | exit 0 | — |
| r019-1-root | end | P3 | n/a | an install, not a refresh | — |
| r019-1-root | end | P4 | pass | 242 emitted files, exit 0 | — |
| r019-1-root | end | P5 | pass | 77 files | — |
| r019-1-root | end | P6 | n/a | not a repair | — |
| r019-4-packages-ui | end | P1 | pass | — | — |
| r019-4-packages-ui | end | P2 | pass | exit 0 | — |
| r019-4-packages-ui | end | P3 | pass | 178 bookkeeping path(s) | — |
| r019-4-packages-ui | end | P4 | pass | 201 emitted files, exit 2 | — |
| r019-4-packages-ui | end | P5 | pass | 27 files | — |
| r019-4-packages-ui | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | stop | P1 pass, P4 stop (tsc exit 0, native 1) | — |

### J. Conflicts by path class

No conflicts by path recorded.
