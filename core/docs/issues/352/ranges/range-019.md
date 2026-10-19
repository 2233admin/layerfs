# Range 019 · **optimize** · attempt 4

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r018 (run p3-main-l)
dsh `e481288a3`..`67053d1cf` · **81 commits** (9 mainline, 72 side) · 2026-07-14 → 2026-07-19
Areas changed: `packages/core` 19% · `/` 12% · `packages/ui` 8% · other 61%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 22 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 102.7 s · git 127.9 s · Node 257.6 s · verify 92.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **552.8 MiB** (+180.9 KiB) | **354.7 MiB** (+25.3 MiB) | **0.64×** (prev 0.60×) | **27.7 MiB** | **959** (total 18,401) | **362.2 s** tooling (total 31.9 min) |

**Checks:** 14 pass · 4 watch: Speed branch.diff_commits >64 entries · uncontended: 16.14× baseline (no phase); Counters grep_tree.returned_rows per tree byte: depth exponent 0.41; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection 1.07 · 1 optimize/stop: Scaling
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ fs.write p95 +140% · ▲ probe diff_commits +82% · ▼ stored added −59%
**Budget:** 20 of 202 ranges · projected total 18.0 h (budget 16.8 h) · disk 41% of budget at range 202

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
| lead | repair | `5086f6d30def` | `null` | n/a | pass | n/a | n/a | pass | pass (115,498 rewritten) |

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
| Merge / publish race | 1 / 1 | lead merge of r019-2 vs r019-1 publish | 7.0 s, merged again |
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
| **lead repair** | 1 | — | 1 | — | — | 115,498 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r018) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 552.7 MiB (11.4 MiB / 509.1 MiB / 12.0 MiB / 20.1 MiB) | 552.8 MiB (11.4 MiB / 509.2 MiB / 10.5 MiB / 21.8 MiB) | +180.9 KiB |
| Version figures from | — | full: first (no manifest for range 18) | — |
| Files / directories / symlinks | 49,763 / 8,447 / 3,180 | 49,730 / 8,423 / 3,185 | −33 / −24 / +5 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 329.4 MiB | 354.7 MiB | +25.3 MiB |
| **Space amplification** (total · tracked) | 0.60× · tracked 3.35× | 0.64× · tracked 3.51× | 0.05 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **8.82** (1.52 / 0.28 / 1.39) | 4.49× the median range |
| **Stored per Commit** | 39.8 KiB | 26.8 KiB | — |
| Metadata share | 0.34 | 0.35 | this range 0.48 |
| History: Commits / Layers / Branches | 17,442 | 18,401 / 10 / 69 | +959 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.72 GiB (Commits 9.21 GiB · installs 1.05 GiB · build 116.8 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.07 GiB / 41% | — |
| Snapshot | — | r019, 312.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 229.6 MiB | 0.42 | +12.0 MiB |
| Metadata | 31.7 MiB | 0.06 | +2.4 MiB |
| Index rows | 72.5 MiB | 0.13 | +9.7 MiB |
| Waste | 20.5 MiB | 0.04 | +1.2 MiB |
| Other | 444.0 KiB | 0.00 | +32.0 KiB |
| **Total = Store on disk** | **354.7 MiB** | **= 0.64** space amplification | +25.3 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 11.4 MiB | 39.8 MiB (17.5 MiB + 22.4 MiB) | 3.51× | — | 1.5 MiB | 3.1 MiB | 0.47 |
| `node_modules` | 509.2 MiB | 134.6 MiB (129.6 MiB + 4.9 MiB) | 0.26× | — | 904.1 KiB | 0.1 KiB | 7347.91 |
| Build output | 10.5 MiB | 5.5 MiB (5.3 MiB + 197.3 KiB) | 0.52× | — | 934.1 KiB | 4.7 MiB | 0.19 |
| `.git` | 21.8 MiB | 80.6 MiB (77.2 MiB + 3.4 MiB) | 3.70× | — | 10.9 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 93.4 MiB | — (not divided) | — | 10.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 832.1 KiB | — | — | — | — | — |
| **Total** | — | **354.7 MiB** | **= 0.64×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 72,064 | +3,439 | 6.0 KiB | 47,665 (derived) | 62% |
| Chunks (large files) | 30,713 | +704 | 12.2 KiB | — | 4% |
| Large-file extents | 12,335 | — | 0.2 KiB | — | — |
| Directories | 64,890 | 3,659 (with inodes, pooled) | 0.2 KiB | — | 54% |
| Inodes and attributes | 109,976 | ↑ pooled | 2.2 KiB | — | — |
| Symlinks | 1,880 | +3,231 | 0.1 KiB | — | — |

Delta: 2.2% at depth cap · 25% of refused bases stopped by budget · `node_modules` reinstall: absolute: 782737 new stored bytes for 126 raw changed bytes of 5 changed packages (6212.198×; raw under 1 MiB)

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
| 9.8 ms / 44.6 ms (1.40×) | 3.2 ms / 5.4 ms (1.80×) | 3.2 ms / 6.6 ms (1.93×) | 19.2 ms / 59.6 ms (1.03×) | 11.9 ms / 23.1 ms (1.20×) | 804 ms / 1271 ms (1.87×) | — (native comparison in P3; exec 45.1 ms / 1133 ms) |
| SQL p50: 162 stmts | 58 stmts | 53 stmts | 196 stmts | 49 stmts | 17,602 stmts | — |

**Commit cost:** 17.69 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 609 ms p50 over 241
**Slowest:** sandbox.exec 40112 ms · sandbox.exec 36382 ms · sandbox.exec 33177 ms · checkpoint diff_commits 1.31 ms and 15.72 statements per entry (59,634 entries per page)
**Scaling:** 3 of 15 probes flat · `stat` 1.01 · `read` 0.95 · `list_small` 0.77 · `list_largest` 0.53 · `grep_scoped` 0.87 · `grep_tree` 1.06 · `glob_tree` 0.67 · `diff_files` 0.76 · `list_commits` 0.58 · `diff_commits` 1.05 · `fork` 1.92 · `merge` 0.43

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 310 ms / 310 ms | — / — | — | git / status-cold: — |
| git status (steady) | 337 ms / 629 ms | — / — | — | git / status-steady: — |
| git add | 23.0 ms / 53.0 ms | — / — | — | git / add: — |
| git commit (lane) | 33.0 ms / 60.0 ms | — / — | — | git / commit: — |
| lead writes main | 11445 ms / 11445 ms | — / — | — | — |
| repack | 3561 ms / 3561 ms | — / — | — | — |
| pnpm install (incremental) | 4419 ms / 4419 ms | 1130 ms / 1130 ms | 3.91× | pnpm-reinstall / cold: — |
| pnpm refresh | 3749 ms / 3749 ms | 1223 ms / 1223 ms | 3.07× | pnpm-reinstall / steady: — |
| tsc -b | 3813 ms / 5648 ms | 2367 ms / 4647 ms | 1.61× | tsc-b / cold: — |
| vitest | 2251 ms / 7601 ms | 1018 ms / 5444 ms | 2.21× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.5 ms / 26.7 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a6 | 17442 | 329.4 | 7.23 (1.23×) · 7012 · 308 (13 solo) | 7.31 (1.18×) · 6681 · 272 (125 solo) | 8.33 (1.14×) · 7276 · 340 (134 solo) | 2.48 (1.24×) · 3475 · — (0 solo) | 9.64 (1.06×) · 1337 · — (daemon) | 9.40 (1.13×) · 5265 · — (daemon) | 2709.77 (—×) · 15044810 · 26378 (3 solo) |
| 019.a4 | 18401 | 354.7 | 8.18 (1.39×) · 5950 · 250 (11 solo) | 8.63 (1.39×) · 6703 · 302 (93 solo) | 9.84 (1.35×) · 7721 · 357 (108 solo) | 3.23 (1.62×) · 4209 · 60 (2 solo) | 11.03 (1.21×) · 1337 · — (daemon) | 9.98 (1.20×) · 4896 · — (daemon) | 803.54 (—×) · 1377824 · 7245 (4 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 2463792 → 4194304 B · fs.write ≤8 KiB 2525592 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4124152 → 4194304 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 45352 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 16.41 at the first command → 10.03 after the last (max 16.41 over 6 commands) · Docker VM 1.21 → 0.97

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-019.a4)

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

### Finding 019.a4 · optimize

**1. Trigger** (attempt 4, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.898): tree files exponent 10.255 | < 0.15 |

Diagnosis pending: `finding-019.a4.json`.

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
  - Fixed in fix 045: the native repair chain removes the reconcile's `rm` paths. With the fix, r19 a3's native repair build exits 0 and all 721 emitted files equal LayerFS's (diagnostic).
  - Correction to a2's note: its "natively exit 0" diagnostic ran without lane states, because a2's points had no recorded native trees. The cause stands.
  - Final command 256 s under the 295 s alarm. The control sample `control-019.a3` passes. a4 forks r18 a6's snapshot again. Report check F1–F8 PASS. The only other non-pass rows are `diff_commits` scaling (optimize, #364 item 4) and watch rows.
- **a4 (`p3-main-n`, fork of `p3-main-l`'s r018 snapshot, harness `21cf84257e`, daemon `44ac6c91`, addon `77597adb`): OPTIMIZE, terminal: advanced on optimize: #364 item 4.** Checkpoint ok, git ✓. Node 21 pass, 0 stop, 0 NOT_RUN over 5 points. The repair's P6 passes with 721 emitted files equal to native, using fix 043's clean and whole build and fix 044's reconcile in the native chain. The only optimize row is the checkpoint `diff_commits` scaling (#364 item 4). Speed, Counters, Contended work and Wall projection are watch.
  - **Repair build time against r15** (one sample each): LayerFS 12.17 s (clean plus whole build, 721 emitted) against 7.60 s at r15 a4 (503); native 8.07 s against 5.96 s. Repair install 40.1 s (r15 26.1 s).
  - Final command 253 s under the declared 295 s alarm. Control sample `control-019.a4` passes the watch row, though write ≤1 KiB is at 1.22× (limit 1.25×). Its read syscalls per call are 1.24× (limit 2×).

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2054/2054; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 16.14× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.898): tree files exponent 10.255 | < 0.15 | optimize |
| Counters | grep_tree.returned_rows per tree byte: depth exponent 0.41 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.481 | < 0.5 | pass |
| Reinstall growth | absolute: 782737 new stored bytes for 126 raw changed bytes of 5 changed packages (6212.198×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0223 (budget 0.2522) | < 0.1 | pass |
| Range growth | 27.7 MiB, 0.7× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 1658 ms for 312.7 MiB new; size exponent -0.248 | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 1.07 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 360 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 22 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
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

Binary: daemon `44ac6c91abf6` (attempt 4). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 241.31 | 241.31 | 241.31 | 241.31 | 3.89× | 3.89× | — | — | 7,673 / 216,717 / 0 | — | 0.9931 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 10 | 19.96 | 240.68 | 240.68 | 308.09 | 1.30× | 4.80× | 0.40 | 0.80 | 350 / 34,389 / 0 | — | 0.0908 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 4 | 94.65 | 532.36 | 532.36 | 538.03 | no baseline | no baseline | -1.37 | -1.57 | 1,551 / 80,417 / 0 | — | 0.9698 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 315 | 280.27 | 312.46 | 346.76 | 366.31 | 16.14× | 12.20× | 7.46 | 12.26 | 3,385 / 531,766 / 0 | — | 1.4557 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.51 | 1.20 | 1.20 | 1.46 | 0.74× | 0.88× | -1.76 | -2.55 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · contended | 1 | 3.31 | 3.31 | 3.31 | 3.31 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.1655 ms per entrie | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 2.18 | 2.18 | 2.18 | 2.44 | no baseline | no baseline | 1.97 | 2.52 | 80 / 1,418 / 0 | — | 0.1088 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 2 | 803.54 | 803.54 | 803.54 | 1271.18 | 1.87× | 1.87× | — | — | 17,602 / 1,377,824 / 2,625 | — | 18.687 ms per entrie | branch.merge |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 2.49 | 2.49 | 2.49 | 2.49 | 2.51× | 2.51× | — | — | 35 / 517 / 0 | — | 0.0422 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 1479.21 | 1479.21 | 1479.21 | 1479.21 | 2.91× | 2.91× | -0.07 | -0.09 | 35,560 / 3,287,775 / 5,822 | — | 19.9893 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 2 | 3.34 | 3.34 | 3.34 | 8.25 | 1.21× | 1.21× | -0.05 | 0.32 | 60 / 1,239 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 41.55 | 41.55 | 41.55 | 41.55 | 2.18× | 2.18× | 0.62 | 1.02 | 172 / 17,940 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 1 | 25.52 | 25.52 | 25.52 | 25.52 | 2.93× | 2.15× | 0.99 | 1.00 | 297 / 18,781 / 0 | — | 0.1033 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 91.01 | 91.01 | 91.01 | 91.01 | 10.23× | 6.98× | 2.43 | 2.58 | 884 / 136,976 / 8,511 | — | 0.0095 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 12.73 | 12.73 | 12.73 | 12.73 | 1.89× | 1.37× | -0.22 | -0.79 | 154 / 9,505 / 0 | — | 0.0014 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 1 | 60.96 | 60.96 | 60.96 | 60.96 | 7.19× | 4.12× | 2.64 | 3.23 | 994 / 175,435 / 16,382 | — | 0.0575 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 7 | 12.41 | 13.89 | 13.89 | 16.40 | 1.76× | 1.41× | 0.97 | 1.26 | 164 / 10,635 / 0 | — | 0.0043 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 1 | 16.67 | 16.67 | 16.67 | 16.67 | 2.97× | 2.66× | 1.58 | 1.81 | 271 / 13,555 / 0 | — | 0.0526 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 14 | 9.25 | 11.59 | 11.59 | 12.76 | 1.71× | 1.56× | 1.61 | 2.37 | 193 / 11,782 / 0 | — | 0.0303 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 1 | 14.62 | 14.62 | 14.62 | 14.62 | 2.37× | 2.06× | 1.99 | 2.79 | 242 / 13,254 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 6 | 9.71 | 11.18 | 11.18 | 14.28 | 1.45× | 1.56× | 1.61 | 2.39 | 145 / 10,674 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 11.09 | 11.09 | 11.09 | 11.09 | 2.09× | 1.61× | 0.90 | 1.24 | 348 / 19,286 / 0 | — | 0.0022 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 9.34 | 10.22 | 10.22 | 11.21 | 1.75× | 1.68× | 1.32 | 1.95 | 187 / 11,298 / 0 | — | 0.003 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 2 | 3.84 | 3.84 | 3.84 | 12.53 | 2.49× | 2.49× | 2.34 | 4.15 | 40 / 4,066 / 0 | — | 3.839 ms per file | — |
| fs.glob | 1 files · uncontended | 1 | 2.57 | 2.57 | 2.57 | 2.57 | 2.10× | 1.96× | 1.48 | 2.66 | 51 / 3,149 / 0 | — | 2.567 ms per file | — |
| fs.glob | 17–64 files · contended | 1 | 5.59 | 5.59 | 5.59 | 5.59 | 2.47× | 2.33× | 0.39 | 0.73 | 99 / 13,625 / 0 | — | 0.2539 ms per file | — |
| fs.glob | 17–64 files · uncontended | 6 | 5.98 | 6.70 | 6.70 | 7.00 | 3.09× | 2.56× | 0.35 | 0.71 | 75 / 10,301 / 0 | — | 0.1841 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 3.33 | 3.33 | 3.33 | 4.26 | 2.22× | 1.68× | 0.85 | 1.00 | 52 / 4,648 / 0 | — | 1.1113 ms per file | — |
| fs.glob | 5–16 files · contended | 4 | 4.19 | 4.61 | 4.61 | 5.02 | 3.24× | 3.26× | 0.96 | 1.76 | 71 / 7,354 / 0 | — | 0.5766 ms per file | — |
| fs.glob | 5–16 files · uncontended | 13 | 3.17 | 5.14 | 5.14 | 5.84 | 1.64× | 2.22× | 0.48 | 0.73 | 57 / 4,603 / 0 | — | 0.4675 ms per file | — |
| fs.glob | >64 files · uncontended | 3 | 5.97 | 5.97 | 5.97 | 9.68 | 1.14× | 0.78× | -1.05 | -1.33 | 91 / 10,737 / 0 | — | 0.0222 ms per file | — |
| fs.grep | 1 files · contended | 1 | 4.14 | 4.14 | 4.14 | 4.14 | 2.45× | 2.45× | 1.08 | 1.97 | 58 / 4,363 / 0 | — | 4.142 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 1 | 3.56 | 3.56 | 3.56 | 3.56 | 2.82× | 2.82× | 1.78 | 2.56 | 69 / 4,683 / 0 | — | 3.564 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 1 | 21.11 | 21.11 | 21.11 | 21.11 | 3.90× | 3.90× | 2.59 | 3.77 | 532 / 29,142 / 0 | — | 0.4222 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 2 | 11.37 | 11.37 | 11.37 | 20.47 | 3.15× | 2.62× | 0.85 | 1.64 | 245 / 15,432 / 0 | — | 0.5167 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 4 | 4.38 | 6.96 | 6.96 | 24.79 | 1.88× | 2.42× | 0.89 | 1.42 | 92 / 5,781 / 0 | — | 2.1915 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 5.18 | 5.47 | 5.47 | 5.84 | 2.73× | 1.58× | 1.44 | 1.93 | 68 / 4,728 / 0 | — | 1.963 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 4.06 | 4.06 | 4.06 | 10.19 | 1.70× | 0.96× | 0.31 | 1.09 | 100 / 3,973 / 0 | — | 0.8118 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 7 | 6.28 | 10.27 | 10.27 | 12.41 | 2.00× | 2.99× | 0.45 | 0.61 | 111 / 6,615 / 0 | — | 0.856 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 2 | 21.13 | 21.13 | 21.13 | 35.55 | 1.38× | 1.38× | -0.53 | -0.45 | 542 / 26,695 / 0 | — | 0.0786 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 2 | 49.92 | 49.92 | 49.92 | 50.52 | 4.34× | 3.17× | 0.54 | 0.42 | 823 / 46,970 / 0 | — | 0.0303 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 2 | 5.68 | 5.68 | 5.68 | 6.55 | 3.17× | 2.73× | 1.40 | 2.06 | 115 / 10,503 / 0 | — | 0.1137 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 4 | 4.21 | 5.81 | 5.81 | 9.93 | 1.75× | 2.31× | 0.64 | 1.13 | 68 / 8,639 / 0 | — | 0.1162 ms per entrie | — |
| fs.list | 2–4 entries · contended | 4 | 3.96 | 5.71 | 5.71 | 10.07 | 1.96× | 2.82× | 0.50 | 0.59 | 92 / 6,673 / 0 | — | 1.3213 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 9 | 3.13 | 3.47 | 3.47 | 3.61 | 1.75× | 1.47× | 0.54 | 0.50 | 47 / 4,390 / 0 | — | 1.551 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 3.14 | 3.14 | 3.14 | 4.55 | 1.60× | 1.27× | 1.22 | 1.95 | 50 / 4,172 / 0 | — | 0.4481 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 11 | 3.12 | 4.95 | 4.95 | 6.19 | 1.93× | 2.42× | 0.81 | 1.26 | 52 / 4,919 / 0 | — | 0.4703 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 2 | 2.26 | 2.26 | 2.26 | 4.08 | 1.90× | 1.90× | -2.35 | -5.04 | 45 / 4,216 / 0 | — | 0.0038 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 3.22 | 4.63 | 4.63 | 10.00 | 1.63× | 1.96× | 0.59 | 0.83 | 53 / 3,666 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 26 | 3.23 | 4.46 | 5.40 | 16.77 | 1.80× | 1.56× | 1.07 | 1.57 | 59 / 4,209 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 3 | 20.02 | 20.02 | 20.02 | 101.77 | 2.50× | 1.49× | 1.29 | 1.67 | 388 / 23,721 / 0 | — | 20.024 ms per file | commit |
| fs.rm | 1 files · uncontended | 44 | 11.27 | 15.94 | 16.30 | 29.20 | 1.68× | 1.51× | 1.39 | 2.15 | 151 / 8,614 / 0 | — | 11.268 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 2 | 3.44 | 3.44 | 3.44 | 3.67 | 2.12× | 1.79× | 1.66 | 2.47 | 36 / 3,147 / 0 | — | 0.0037 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 4 | 4.06 | 4.24 | 4.24 | 5.59 | 2.37× | 2.23× | 0.87 | 1.26 | 67 / 4,163 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.69 | 3.46 | 3.46 | 3.49 | 1.53× | 1.68× | 0.36 | 0.43 | 44 / 3,563 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 3.07 | 3.07 | 3.07 | 3.23 | 2.19× | 1.36× | -0.03 | -0.30 | 45 / 4,183 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 10 | 2.67 | 3.54 | 3.54 | 4.55 | 1.78× | 1.62× | 0.88 | 1.21 | 49 / 3,499 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 15 | 11.06 | 47.99 | 47.99 | 141.83 | 1.51× | 3.55× | 0.52 | 1.14 | 156 / 10,229 / 0 | — | 0.0146 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 88 | 8.18 | 12.58 | 15.33 | 22.25 | 1.39× | 1.39× | 0.71 | 1.20 | 130 / 5,950 / 0 | — | 0.0097 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 4 | 20.63 | 54.71 | 54.71 | 85.79 | 1.86× | 3.68× | 1.21 | 1.66 | 319 / 15,449 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 9 | 12.13 | 17.35 | 17.35 | 17.38 | 1.30× | 1.82× | 0.34 | 0.40 | 154 / 6,654 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 70 | 21.08 | 102.48 | 181.18 | 196.22 | 2.27× | 6.43× | 1.56 | 2.17 | 362 / 18,320 / 0 | — | 0.0011 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 242 | 9.84 | 15.87 | 24.73 | 29.39 | 1.40× | 1.62× | 0.63 | 0.97 | 168 / 7,721 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 60 | 22.39 | 174.98 | 203.68 | 218.12 | 2.62× | 10.64× | 1.71 | 2.33 | 406 / 23,436 / 0 | — | 0.0072 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 225 | 8.63 | 14.33 | 19.86 | 44.57 | 1.37× | 1.40× | 0.68 | 1.09 | 151 / 6,703 / 0 | — | 0.0034 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.62 | 0.62 | 0.62 | 0.62 | 1.05× | 1.05× | -0.35 | -0.48 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 42 | 30.43 | 44.99 | 51.07 | 52.68 | 1.34× | 1.07× | -0.48 | -0.63 | 358 / 46,001 / 64 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 87 | 23.48 | 45.81 | 59.58 | 214.53 | 1.03× | 1.17× | -0.23 | -0.22 | 226 / 21,161 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 12 | 5.54 | 7.98 | 7.98 | 38.94 | 1.71× | 1.91× | 0.94 | 1.31 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 38 | 4.09 | 7.29 | 7.32 | 14.61 | 1.23× | 1.56× | 0.25 | 0.36 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 7 | 16.86 | 19.81 | 19.81 | 19.82 | 1.95× | 1.16× | 0.87 | 1.23 | 213 / 8,690 / 0 | — | 16.863 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 20 | 9.98 | 12.16 | 12.16 | 17.98 | 1.32× | 1.17× | 0.44 | 0.69 | 113 / 4,896 / 0 | — | 9.985 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 544.16 | 544.16 | 544.16 | 544.16 | 10.82× | 10.82× | 2.78 | 4.39 | 10,345 / 541,935 / 0 | — | 544.156 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 3 | 33.77 | 33.77 | 33.77 | 44.95 | 2.20× | 1.61× | 1.82 | 2.31 | 300 / 16,739 / 2 | — | 16.8845 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 12.38 | 14.31 | 14.31 | 15.33 | 1.25× | 1.28× | -0.09 | -0.09 | 147 / 6,878 / 0 | — | 5.4295 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 17.81 | 17.81 | 17.81 | 17.81 | 1.58× | 1.58× | 0.03 | 0.07 | 210 / 12,967 / 0 | — | 3.5628 ms per file | commit |
| sandbox.commit | — · Committed · contended | 5 | 148.99 | 214.60 | 214.60 | 276.33 | no baseline | no baseline | -0.93 | -1.64 | 1,166 / 235,738 / 8,191 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 75.84 | 574.50 | 574.50 | 17554.06 | 1.10× | 8.33× | 0.95 | 1.49 | 543 / 26,484 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 211 | 486.33 | 1096.90 | 1326.37 | 2142.42 | 12.00× | 3.17× | 5.56 | 7.88 | — | 2,274 | — | — |
| sandbox.exec | 0 files · uncontended | 179 | 38.38 | 450.35 | 1048.79 | 6775.16 | 1.42× | 1.75× | 0.10 | 0.08 | 0 / 0 / 0 | 2292.30 | — | — |
| sandbox.exec | 1 files · contended | 44 | 43.53 | 76.07 | 81.47 | 182.54 | 1.38× | 1.29× | 0.56 | 0.86 | — | 5 | 43.528 ms per file | — |
| sandbox.exec | 1 files · uncontended | 66 | 37.54 | 69.39 | 74.93 | 151.23 | 1.23× | 1.18× | -0.03 | -0.05 | — | 5 | 37.537 ms per file | — |
| sandbox.exec | 17–64 files · contended | 1 | 86.62 | 86.62 | 86.62 | 86.62 | 1.35× | 1.35× | 1.67 | 2.48 | — | 109 | 4.3312 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 70.40 | 70.40 | 70.40 | 105.53 | 1.03× | 1.02× | -0.01 | 0.03 | 0 / 0 / 0 | 101 | 3.52 ms per file | observe.after |
| sandbox.exec | 2–4 files · contended | 24 | 48.15 | 69.33 | 71.26 | 75.06 | 1.27× | 1.12× | 0.77 | 1.25 | — | 9.70 | 17.8148 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 40 | 51.35 | 73.11 | 75.93 | 79.97 | 1.57× | 1.39× | 0.97 | 1.38 | — | 10.40 | 19.861 ms per file | — |
| sandbox.exec | 5–16 files · contended | 2 | 34.20 | 34.20 | 34.20 | 87.74 | 0.65× | 0.59× | -0.58 | -0.44 | — | 19 | 6.841 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 11 | 64.01 | 103.60 | 103.60 | 163.90 | 1.22× | 1.44× | 0.76 | 1.15 | — | 30 | 9.606 ms per file | — |
| sandbox.exec | — · contended | 15 | 4404.93 | 33176.93 | 33176.93 | 36382.35 | no baseline | no baseline | 1.97 | 2.74 | — | 34570.30 | — | — |
| sandbox.exec | — · uncontended | 34 | 164.18 | 13026.57 | 14128.60 | 40111.96 | 0.33× | 2.73× | -1.17 | -2.04 | — | 31509.60 | — | — |
| sandbox.mount | — · contended | 72 | 14.64 | 29.46 | 45.67 | 69.55 | 1.46× | 1.91× | 0.65 | 0.91 | 60 / 1,607 / 80 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 159 | 11.03 | 17.96 | 22.03 | 24.73 | 1.20× | 1.29× | 0.36 | 0.56 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · contended | 2 | 5.07 | 5.07 | 5.07 | 12.17 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 6.11 | 6.11 | 6.11 | 52.21 | no baseline | no baseline | -0.26 | -0.75 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 50 | 16.18 | 25.72 | 29.10 | 29.18 | 1.94× | 2.09× | 1.21 | 1.76 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 181 | 12.16 | 26.73 | 122.68 | 158.00 | 1.34× | 1.92× | 0.68 | 1.01 | 0 / 0 / 0 | — | — | observe.after |

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

Load average (1-min, runner (Docker VM kernel)): start 1.21 · end 0.97.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 2.396 | 2.635 · 2.396 · 2.328 · 2.184 · 2.413 | 1.2–1.21 | statements 17, vm_steps 1328, fullscan_steps 0, sorts 0, returned_rows 128 |
| read | 2.106 | 2.191 · 2.106 · 1.722 · 1.941 · 2.2 | 1.2–1.2 | statements 16, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_small | 1.826 | 2.262 · 1.888 · 1.826 · 1.755 · 1.703 | 1.2–1.2 | statements 16, vm_steps 1307, fullscan_steps 0, sorts 0, returned_rows 127 |
| list_largest | 6.146 | 6.841 · 6.057 · 6.457 · 6.081 · 6.146 | 1.2–1.2 | statements 78, vm_steps 13952, fullscan_steps 0, sorts 0, returned_rows 1350 |
| grep_scoped | 2.261 | 2.67 · 2.079 · 2.364 · 1.928 · 2.261 | 1.2–1.2 | statements 21, vm_steps 1453, fullscan_steps 0, sorts 0, returned_rows 136 |
| glob_scoped | 1.867 | 2.013 · 1.777 · 1.847 · 2.254 · 1.867 | 1.2–1.2 | statements 15, vm_steps 1286, fullscan_steps 0, sorts 0, returned_rows 126 |
| grep_tree | 4182.032 | 4408.327 · 4174.77 · 4160.816 · 4182.032 · 4272.345 | 1.14–1.2 | statements 42542, vm_steps 3510689, fullscan_steps 0, sorts 0, returned_rows 366376 |
| glob_tree | 10.407 | 12.832 · 12.097 · 10.407 · 9.381 · 9.921 | 1.14–1.14 | statements 194, vm_steps 21965, fullscan_steps 0, sorts 0, returned_rows 2160 |
| diff_files | 7.555 | 8.369 · 7.243 · 7.951 · 6.911 · 7.555 | 1.14–1.14 | statements 84, vm_steps 7744, fullscan_steps 0, sorts 0, returned_rows 768 |
| list_commits | 1.216 | 2.354 · 1.311 · 1.216 · 0.885 · 1.075 | 1.14–1.14 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 4.197 | 5.099 · 4.351 · 4.197 · 4.187 · 3.359 | 1.14–1.14 | statements 55, vm_steps 2463, fullscan_steps 0, sorts 0, returned_rows 264 |
| fork | 0.664 | 0.74 · 0.655 · 0.664 · 0.545 · 0.769 | 1.14–1.14 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 38.269 | 41.445 · 37.124 · 38.153 · 38.269 · 39.951 | 1.14–1.14 | statements 476, vm_steps 27093, fullscan_steps 4, sorts 8, returned_rows 2086 |
| oneshot_mount_unmount | 18.965 | 24.1 · 18.965 · 21.173 · 17.529 · 17.444 | 1.14–1.14 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 73.269 | 85.121 · 70.252 · 72.613 · 74.678 · 73.269 | 1.14–1.14 | statements 144, vm_steps 9267, fullscan_steps 80, sorts 2, returned_rows 859 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.14–1.14 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r019: 90,796 pages of 4,096 B, 0 free · Commits 18,575 · Branches 327 · Layers 24 · compression 3.99× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 72,064 | 423.8 MiB |
| 2 | 30,713 | 367.0 MiB |
| 3 | 12,313 | 2.0 MiB |
| 4 | 22 | 4.9 KiB |
| 5 | 12,252 | 1.2 MiB |
| 6 | 34,761 | 180.5 MiB |
| 7 | 64,771 | 14.5 MiB |
| 8 | 119 | 35.0 KiB |
| 9 | 29,865 | 49.1 MiB |
| 10 | 20,276 | 2.5 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,880 | 152.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 18,829 | 31.7 MiB |
| 1 | 29,861 | 229.6 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 70,830 | 276.7 MiB | 12.6 MiB |
| inode_value | 10,426 | 40.7 MiB | 902.5 KiB |
| object_location | 3,943 | 15.4 MiB | 1.6 MiB |
| binding_hint | 2,740 | 10.7 MiB | 1.0 MiB |
| commit | 1,437 | 5.6 MiB | 916.1 KiB |
| commit_lineage | 404 | 1.6 MiB | 202.2 KiB |
| commit_runs | 396 | 1.5 MiB | 226.0 KiB |
| commit_identity | 284 | 1.1 MiB | 116.9 KiB |
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

**Time 362.2 s** (tooling): play 104.4 · consolidate 116.4 · verify 106.0 · probes 22.3 · tests 0.0 · seal + snapshot 4.5 · report 8.6

362.21 s tooling: prepare 1.69 · play 102.69 · consolidate 116.39 · verify 92.70 (diff_commits + full compareTree) · version walk 13.29 · probes 22.36 · metrics 1.13 · seal 1.32 · sealed figures 1.41 · snapshot copy 1.74 · report 0.28

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T16:16:46.944Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 2043/2044; conflicts 4/4; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 7.25× baseline (no phase); Scaling: not judged: no probes; Counters: not judged: no counters; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Node proofs: 18 pass · 1 stop · 0 NOT_RUN over 4 points: r019-2-packages-core end P4 |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T17:00:47.340Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 2043/2044; conflicts 4/4; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 19.03× baseline (no phase); Scaling: not judged: no probes; Counters: not judged: no counters; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (18 classes too narrow); Node proofs: 0 pass · 0 stop · 20 NOT_RUN over 4 points |
| 3 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T17:09:39.381Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 15.91× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.898): tree files exponent 10.252; Counters: grep_tree.returned_rows per tree byte: depth exponent 0.385; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection: 1.07; Node proofs: 21 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 |
| 4 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T17:28:57.743Z | optimize | Speed: branch.diff_commits >64 entries · uncontended: 16.14× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.898): tree files exponent 10.255; Counters: grep_tree.returned_rows per tree byte: depth exponent 0.41; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow); Wall projection: 1.07 |

### G. Evidence

- `~/lfs-history/metrics/range-019.a1.json`
- `~/lfs-history/metrics/range-019.a2.json`
- `~/lfs-history/metrics/range-019.a3.json`
- `~/lfs-history/metrics/range-019.a4.json`
- trace `~/lfs-history/runs/p3-main-n/trace/range-019.a4.jsonl` · runner log `~/lfs-history/runs/p3-main-n/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-019.p3-main-n.json`

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
| `git status --porcelain` | 337.0 | 1,677 |
| `git diff --stat` | 35.0 | 1,672 |
| `git add -f` | 23.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 33.0 | 1,674 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r019-2-packages-core | end | P1 | pass | — | ✓ |
| r019-2-packages-core | end | P2 | pass | exit 0 | ✓ |
| r019-2-packages-core | end | P3 | pass | 178 bookkeeping path(s) | ✓ |
| r019-2-packages-core | end | P4 | pass | 93 emitted files, exit 2 | ✓ |
| r019-2-packages-core | end | P5 | pass | 10 files | ✓ |
| r019-2-packages-core | end | P6 | n/a | not a repair | ✓ |
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
| lead | repair | P6 | pass | P1 pass, P4 pass (721 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
