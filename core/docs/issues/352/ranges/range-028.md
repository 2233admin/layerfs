# Range 028 · **stop** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r027 (live Store)
dsh `48395a937`..`451fad5a2` · **80 commits** (6 mainline, 74 side) · 2026-07-22 → 2026-07-22
Areas changed: `examples/acp-agent` 25% · `packages/client` 17% · `/` 10% · other 48%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 18 pass, 1 stop, 0 NOT_RUN over 5 points) · **Content 0.24×** · **Churn 0.01**
**Time split:** play 91.5 s · git 124.7 s · Node 185.2 s · verify 8.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **704.2 MiB** (+53.1 MiB) | **740.7 MiB** (+52.7 MiB) live | **1.05×** (prev 1.06×) | **53.5 MiB** | **1,919** (total 32,548) | **248.4 s** tooling (total 72.8 min) |

**Checks:** 14 pass · 4 watch: Speed not judged: baseline not set (pilot); Scaling branch.diff_commits checkpoint ms in total (entries exponent 0.142): tree files exponent 0.223; Counters glob_tree.vm_steps per tree file: depth exponent 0.333; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (19 classes too narrow) · 1 optimize/stop: Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +135% · ▲ fs.list p95 +66% · ▲ metadata added +41%
**Budget:** 29 of 202 ranges · projected total 16.3 h (budget 16.8 h) · disk 43% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **595 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 4 lanes merged, 1 publish |
| Steps | 3,397 / 3,397 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2432 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 371 bin shims, 3835 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (46 lines from 3 .gitignore files) · **246 picks** in 4 merges (246 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `451fad5a2`** · 122 commits written for 122 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 32 untracked, unignored (191,910 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 246 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r028-1-root | end | `9e9c857de0fe` | `94e82d2ed5c3` | pass (316 normalized) | pass | n/a | pass | n/a | n/a |
| r028-2-packages-client | end | `18e377f62d7b` | `c9f333872711` | pass (315 normalized) | pass | pass | pass | n/a | n/a |
| r028-3-examples-acp-agent | end | `f86f697d5ebc` | `c9f333872711` | pass (315 normalized) | pass | pass | pass | n/a | n/a |
| r028-4-examples-plan-acp-agent | end | `4451272e250e` | `c9f333872711` | pass (315 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `4f848b571fa8` | `null` | n/a | pass | n/a | n/a | pass | stop (112,198 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/codec.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/properties.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cross-mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/inspect.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/mount.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/present.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/sandbox-context.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/tool-cordis.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/unmount-hmr.spec.ts` (fails natively) · `packages/core/session/tests/derived-cache.spec.ts` (fails natively) · `packages/core/session/tests/fork.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/session/tests/invariant.spec.ts` (fails natively) · `packages/core/session/tests/json.spec.ts` (fails natively) · `packages/core/session/tests/out-of-band.spec.ts` (fails natively) · `packages/core/session/tests/properties.spec.ts` (fails natively) · `packages/core/session/tests/repair.spec.ts` (fails natively) · `packages/core/session/tests/request-header.spec.ts` (fails natively) · `packages/core/session/tests/scoped.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/core/tools/tests/code-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-mode.spec.ts` (fails natively) · `packages/core/tools/tests/execution-signal-types.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/invariant.spec.ts` (fails natively) · `packages/core/tools/tests/json-schema.spec.ts` (fails natively) · `packages/core/tools/tests/properties.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/core/tools/tests/tools.spec.ts` (fails natively) · `packages/core/tools/tests/ts-types.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/serialize.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/sse.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/translate.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/loader-composition.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/persistence.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/retry.spec.ts` (fails natively) · `packages/llm/llm/tests/assembler.spec.ts` (fails natively) · `packages/llm/llm/tests/attribution.spec.ts` (fails natively) · `packages/llm/llm/tests/call-config.spec.ts` (fails natively) · `packages/llm/llm/tests/invariant.spec.ts` (fails natively) · `packages/llm/llm/tests/properties.spec.ts` (fails natively) · `packages/llm/llm/tests/service.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/codec.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/modes.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/properties.spec.ts` (fails natively) · `packages/ui/acp/tests/stream-update.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/commands/tests/commands.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/ui/user-approval/tests/approval.spec.ts` (fails natively) · `packages/ui/user-approval/tests/invariant.spec.ts` (fails natively) · `packages/ui/user-interaction/tests/user-interaction.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/connection.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/framing.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/host.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/instance.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/lifecycle.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/provider.spec.ts` (fails natively) · `packages/lsp/lsp-local/tests/translate.spec.ts` (fails natively) · `packages/lsp/tool-lsp/tests/integration.spec.ts` (fails natively) · `packages/lsp/tool-lsp/tests/load-path.spec.ts` (fails natively) · `packages/lsp/tool-lsp/tests/render.spec.ts` (fails natively) · `packages/lsp/tool-lsp/tests/tool-lsp.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/deepseek.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/redirect.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively).

## 2. Activity

**4,173 calls** · **208 steps** by **10 agents + lead** on **4 Branches + main** · **290 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +524 added · 1,192 modified · −143 deleted · 22.6 MiB written · fs 1,685 : Sandbox 174 (**10 : 1**, reported only in P3)
**Execs:** 832 (JS 62 · shell 770) · 4 non-zero exits · install 0 · test runs 4 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,071 | 1,698 | 373 | Committed 1,695 · Text 44 · NoSuchPath 16 · Equal 2 · UpToDate 3 |
| sandbox | 1,704 | 1,119 | 5 | commit 287 (Committed 238, UpToDate 48, Conflict 1) · exec 832 (exit:0 828, exit:1 1, exit:2 3) · mount 290 (Mounted 290) · status 5 · unmount 290 (Unmounted 290) |
| branch | 387 | 33 | 354 | diff_branches 19 · diff_commits 335 · fork 23 (Forked 23) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,173** | **2,850** | **743** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r028-1-root | a01 a02 | 35 | 581 | ✓ | — |
| r028-2-packages-client | a03 a04 | 43 | 374 | ✓ | — |
| r028-3-examples-acp-agent | a05 a06 | 45 | 430 | ✓ | — |
| r028-4-examples-plan-acp-agent | a07 a08 a09 a10 | 78 | 431 | ✓ | — |
| main | lead | 7 | 103 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r028-2, a04 after a03 | 0.1 s |
| Stale clean merge | 1 / 1 | r028-2, a03 a04 | merged cleanly |
| Decoy edit | 1 / 1 | r028-2, a03 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r028-1 | 26 | 14 | 12 | 0 | 0 | 532 | — |
| a02 | r028-1 | 9 | 3 | 6 | 0 | 0 | 49 | — |
| a03 | r028-2 | 9 | 2 | 7 | 0 | 0 | 272 | commit-conflict, stale-clean-merge, decoy |
| a04 | r028-2 | 34 | 11 | 23 | 0 | 0 | 102 | commit-conflict, stale-clean-merge, decoy |
| a05 | r028-3 | 35 | 17 | 18 | 0 | 0 | 346 | — |
| a06 | r028-3 | 10 | 4 | 6 | 0 | 0 | 84 | — |
| a07 | r028-4 | 4 | 1 | 3 | 0 | 0 | 6 | — |
| a08 | r028-4 | 4 | 0 | 4 | 0 | 0 | 8 | — |
| a09 | r028-4 | 66 | 26 | 40 | 0 | 0 | 376 | — |
| a10 | r028-4 | 4 | 1 | 3 | 0 | 0 | 41 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 103 | — |
| **Total** |  | **208** | **80** | **122** | **6** | **0** | **1,919** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 158 · pnpm 1 · tsc 4 · vitest 4 · other 665

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r028-1-root | 24 | 24 | 24 | 5 | 24 | 497 |
| r028-3-examples-acp-agent | 33 | 33 | 33 | 0 | 33 | 839 |
| r028-2-packages-client | 33 | 33 | 33 | 0 | 33 | 717 |
| r028-4-examples-plan-acp-agent | 60 | 60 | 60 | 5 | 60 | 898 |
| **lead** | — | — | — | — | 122 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r028-1-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r028-2-packages-client | 0 | 1 | 1 | 0 | 0 | — / — |
| r028-3-examples-acp-agent | 0 | 1 | 1 | 0 | 0 | — / — |
| r028-4-examples-plan-acp-agent | 0 | 1 | 1 | 1 | 11 | 11 / 11 |
| **lead repair** | 1 | — | 1 | — | — | 112,198 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r027) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 651.1 MiB (15.4 MiB / 564.9 MiB / 13.6 MiB / 57.1 MiB) | 704.2 MiB (17.4 MiB / 611.2 MiB / 16.0 MiB / 59.5 MiB) | +53.1 MiB |
| Version figures from | — | incremental (62,156 changed paths) | — |
| Files / directories / symlinks | 47,950 / 8,040 / 3,445 | 51,612 / 8,694 / 3,841 | +3,662 / +654 / +396 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 688.0 MiB | 740.7 MiB | +52.7 MiB |
| **Space amplification** (total · tracked) | 1.06× · tracked 5.07× | 1.05× · tracked 4.69× | -0.00 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **9.92** (0.51 / 0.06 / 0.28) | 4.24× the median range |
| **Stored per Commit** | 54.3 KiB | 28.1 KiB | — |
| Metadata share | 0.37 | 0.36 | this range 0.34 |
| History: Commits / Layers / Branches | 30,629 | 32,548 / 16 / 231 | +1,919 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.28 GiB (Commits 8.55 GiB · installs 921.0 MiB · build 111.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 44.17 GiB / 43% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 468.2 MiB | 0.66 | +31.4 MiB |
| Metadata | 60.9 MiB | 0.09 | +3.7 MiB |
| Index rows + waste + other (live, not split) | 211.7 MiB | 0.30 | — |
| **Total = Store on disk** | **740.7 MiB** | **= 1.05** space amplification | +52.7 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 17.4 MiB | 81.8 MiB (47.1 MiB + 34.6 MiB) | 4.69× | — | 3.5 MiB | 5.4 MiB | 0.64 |
| `node_modules` | 611.2 MiB | 189.4 MiB (177.8 MiB + 11.6 MiB) | 0.31× | — | 13.6 MiB | 50.3 MiB | 0.27 |
| Build output | 16.0 MiB | 10.3 MiB (9.8 MiB + 568.3 KiB) | 0.65× | — | 1.0 MiB | 6.2 MiB | 0.16 |
| `.git` | 59.5 MiB | 220.3 MiB (212.2 MiB + 8.1 MiB) | 3.70× | — | 17.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 211.7 MiB | — (not divided) | — | 17.5 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 27.2 MiB | — | — | — | — | — |
| **Total** | — | **740.7 MiB** | **= 1.05×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +8,189 | — | 0 (derived) | 52% |
| Chunks (large files) | — (at snapshots) | +2,706 | — | — | 4% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 5,429 (with inodes, pooled) | — | — | 64% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +3,867 | — | — | — |

Delta: 2.4% at depth cap · 13% of refused bases stopped by budget · `node_modules` reinstall: 0.305× the raw bytes of 210 changed packages (ratio: 14113121 new stored for 46345206 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.69× (81.8 MiB for 17.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.2 KiB / 5.5 KiB / 9.1 KiB over 272 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.24× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.01 (14.6 MiB stored for 2.20 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.26 (4 lanes × 704.2 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.0 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 7.8 ms / 17.5 ms | 2.3 ms / 3.9 ms | 2.6 ms / 6.2 ms | 18.8 ms / 51.3 ms | 10.8 ms / 19.4 ms | 275 ms / 317 ms | — (native comparison in P3; exec 39.2 ms / 710 ms) |
| SQL p50: 157 stmts | 52 stmts | 53 stmts | 199 stmts | 45 stmts | 7,667 stmts | — |

**Commit cost:** 7.21 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 581 ms p50 over 290
**Slowest:** sandbox.exec 32345 ms · sandbox.exec 26459 ms · sandbox.exec 25135 ms · checkpoint diff_commits 0.10 ms and 1.45 statements per entry (62,021 entries per page)
**Scaling:** 9 of 15 probes flat · `read` 0.67 · `list_largest` 1.79 · `glob_scoped` 0.33 · `grep_tree` 0.33 · `glob_tree` 0.63 · `oneshot_mount_unmount` 0.69

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 284 ms / 284 ms | — / — | — | git / status-cold: — |
| git status (steady) | 293 ms / 419 ms | — / — | — | git / status-steady: — |
| git add | 27.0 ms / 121 ms | — / — | — | git / add: — |
| git commit (lane) | 34.0 ms / 88.0 ms | — / — | — | git / commit: — |
| lead writes main | 3765 ms / 3765 ms | — / — | — | — |
| repack | 3394 ms / 3394 ms | — / — | — | — |
| pnpm install (incremental) | 2416 ms / 2416 ms | 1693 ms / 1693 ms | 1.43× | pnpm-reinstall / cold: — |
| pnpm refresh | 2518 ms / 2518 ms | 1628 ms / 1628 ms | 1.55× | pnpm-reinstall / steady: — |
| tsc -b | 2130 ms / 2224 ms | 1779 ms / 3197 ms | 1.20× | tsc-b / cold: — |
| vitest | 4322 ms / 4322 ms | 3842 ms / 3842 ms | 1.12× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 3.2 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 13.3 ms / 24.6 ms

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
| 028.a1 | 32548 | 740.7 | 6.49 (1.10×) · 5919 · 247 (9 solo) | 6.60 (1.06×) · 5818 · 222 (70 solo) | 7.61 (1.04×) · 6392 · 323 (100 solo) | 2.15 (1.08×) · 3175 · 45 (8 solo) | 10.44 (1.14×) · 1362 · — (daemon) | 9.60 (1.15×) · 4716 · — (daemon) | 274.75 (—×) · 418268 · 8491 (4 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 1841672 → 4194304 B · fs.write ≤8 KiB 453232 → 4194304 B · fs.write ≤64 KiB 189552 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3341352 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 8.86 at the first command → 8.34 after the last (max 12.83 over 8 commands) · Docker VM 3.45 → 1.97

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-028.a1)

## 5. Findings and action

### Finding 028.a1 · stop

**1. Trigger** (attempt 1, daemon `45a196ef16c6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Node proofs | 18 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-028.a1.json`.

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

- (none yet)


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3397/3397; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms in total (entries exponent 0.142): tree files exponent 0.223 | < 0.15 | watch |
| Counters | glob_tree.vm_steps per tree file: depth exponent 0.333 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (19 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.338 | < 0.5 | pass |
| Reinstall growth | 0.305× the raw bytes of 210 changed packages (ratio: 14113121 new stored for 46345206 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0238 (budget 0.125) | < 0.1 | pass |
| Range growth | 53.5 MiB, 1.23× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.43 | < 0.8 | pass |
| Wall projection | 0.97 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 122 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 18 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 | P1–P6 pass at every point | stop |
| `.git` conflicts | 0 (tracked 0 · install 246 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.24× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 208 | 209 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 1919 | 1758 |
| Workspaces (one-shot share) | 290 (0.99) | 121 (0.983) |
| Reads | 333 | 333 |
| Reconcile writes | 95 | 95 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 19 | 17.23 | 301.72 | 301.72 | 306.73 | no baseline | no baseline | -0.35 | -0.68 | 216 / 22,180 / 0 | — | 0.0721 ms per entrie | — |
| branch.diff_commits | 2–4 entries · uncontended | 1 | 7.26 | 7.26 | 7.26 | 7.26 | no baseline | no baseline | — | — | 102 / 9,601 / 0 | — | 3.63 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 2 | 221.86 | 221.86 | 221.86 | 240.50 | no baseline | no baseline | — | — | 5,829 / 197,901 / 0 | — | 1.0416 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 327 | 20.60 | 36.72 | 62.89 | 330.68 | no baseline | no baseline | 0.10 | 0.06 | 292 / 31,805 / 0 | — | 0.1113 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.67 | 1.34 | 1.34 | 1.90 | no baseline | no baseline | 0.22 | -0.03 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 1.00 | 1.00 | 1.00 | 1.01 | no baseline | no baseline | -1.00 | -1.02 | 70 / 1,298 / 0 | — | 0.0502 ms per entrie | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 3.43 | 3.43 | 3.43 | 3.43 | no baseline | no baseline | — | — | 35 / 517 / 0 | — | 0.1904 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 316.67 | 316.67 | 316.67 | 350.10 | no baseline | no baseline | -0.14 | 0.07 | 8,686 / 525,569 / 0 | — | 1.8304 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 10.87 | 10.87 | 10.87 | 10.87 | no baseline | no baseline | -0.99 | -0.52 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 32.84 | 32.84 | 32.84 | 32.84 | no baseline | no baseline | -0.15 | -0.45 | 172 / 15,506 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 12 | 10.77 | 26.14 | 26.14 | 29.31 | no baseline | no baseline | -1.17 | -1.27 | 255 / 23,188 / 0 | — | 0.0171 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 19 | 8.82 | 14.61 | 14.61 | 16.48 | no baseline | no baseline | 0.23 | 0.17 | 130 / 5,453 / 0 | — | 0.0251 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 1 | 8.67 | 8.67 | 8.67 | 8.67 | no baseline | no baseline | — | — | 118 / 3,795 / 0 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 4 | 7.24 | 13.53 | 13.53 | 13.75 | no baseline | no baseline | -7.51 | -6.42 | 128 / 6,008 / 0 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 9 | 7.27 | 8.34 | 8.34 | 8.78 | no baseline | no baseline | 0.18 | -0.16 | 124 / 5,938 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 31 | 11.97 | 21.99 | 23.32 | 33.68 | no baseline | no baseline | -1.87 | -1.70 | 266 / 18,735 / 0 | — | 0.0074 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 38 | 7.22 | 13.56 | 14.77 | 16.79 | no baseline | no baseline | 0.37 | 0.06 | 124 / 5,722 / 0 | — | 0.0032 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 5 | 8.07 | 11.38 | 11.38 | 12.65 | no baseline | no baseline | -1.25 | -0.68 | 193 / 9,017 / 0 | — | 0.0194 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 22 | 6.15 | 8.47 | 10.31 | 15.08 | no baseline | no baseline | -0.71 | -0.72 | 123 / 6,143 / 0 | — | 0.022 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 8.08 | 8.93 | 8.93 | 10.59 | no baseline | no baseline | 0.94 | 0.72 | 170 / 8,346 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 14 | 8.21 | 12.09 | 12.09 | 14.79 | no baseline | no baseline | 1.11 | 1.11 | 135 / 7,753 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 6.46 | 6.46 | 6.46 | 6.46 | no baseline | no baseline | -0.57 | -0.97 | 164 / 8,511 / 0 | — | 0.0061 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 9 | 7.69 | 9.58 | 9.58 | 11.28 | no baseline | no baseline | 0.70 | 0.45 | 188 / 10,226 / 0 | — | 0.0019 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 1.67 | 1.67 | 1.67 | 2.49 | no baseline | no baseline | 0.28 | -0.28 | 36 / 2,448 / 0 | — | 1.671 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 3.93 | 3.93 | 3.93 | 5.16 | no baseline | no baseline | 0.72 | 0.50 | 97 / 6,964 / 0 | — | 0.2071 ms per file | — |
| fs.glob | 17–64 files · uncontended | 5 | 2.80 | 2.95 | 2.95 | 5.68 | no baseline | no baseline | 0.23 | -0.08 | 50 / 5,427 / 0 | — | 0.1179 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 2.14 | 2.14 | 2.14 | 2.14 | no baseline | no baseline | -0.86 | -1.17 | 65 / 5,104 / 0 | — | 1.0705 ms per file | — |
| fs.glob | 2–4 files · uncontended | 6 | 1.91 | 2.21 | 2.21 | 3.24 | no baseline | no baseline | -0.42 | -0.49 | 36 / 3,472 / 0 | — | 0.477 ms per file | — |
| fs.glob | 5–16 files · contended | 3 | 2.18 | 2.18 | 2.18 | 3.92 | no baseline | no baseline | -0.59 | -0.67 | 37 / 3,477 / 0 | — | 0.2684 ms per file | — |
| fs.glob | 5–16 files · uncontended | 13 | 2.97 | 3.75 | 3.75 | 4.71 | no baseline | no baseline | 0.95 | 0.68 | 46 / 3,421 / 0 | — | 0.407 ms per file | — |
| fs.glob | >64 files · contended | 4 | 8.69 | 18.05 | 18.05 | 21.92 | no baseline | no baseline | 0.66 | -0.09 | 163 / 11,587 / 0 | — | 0.0548 ms per file | — |
| fs.glob | >64 files · uncontended | 17 | 5.59 | 22.07 | 22.07 | 35.43 | no baseline | no baseline | -0.54 | -0.17 | 91 / 12,581 / 0 | — | 0.0402 ms per file | — |
| fs.grep | 1 files · uncontended | 6 | 2.01 | 2.32 | 2.32 | 3.89 | no baseline | no baseline | 0.10 | 0.18 | 39 / 2,659 / 0 | — | 2.009 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 2 | 3.68 | 3.68 | 3.68 | 10.94 | no baseline | no baseline | -3.68 | -3.11 | 100 / 4,187 / 0 | — | 0.0899 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 8 | 6.02 | 9.35 | 9.35 | 12.29 | no baseline | no baseline | 0.54 | 0.11 | 124 / 7,597 / 0 | — | 0.3316 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 3.79 | 3.79 | 3.79 | 5.10 | no baseline | no baseline | 0.52 | 0.69 | 113 / 6,855 / 0 | — | 1.2627 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 5 | 2.72 | 3.25 | 3.25 | 3.37 | no baseline | no baseline | 0.10 | -0.24 | 59 / 3,815 / 0 | — | 0.8127 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 5.28 | 5.28 | 5.28 | 5.28 | no baseline | no baseline | 0.68 | 0.50 | 132 / 7,623 / 0 | — | 0.5866 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 14 | 4.44 | 8.90 | 8.90 | 11.38 | no baseline | no baseline | 1.13 | 0.66 | 82 / 4,283 / 0 | — | 0.5676 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 2 | 8.87 | 8.87 | 8.87 | 13.51 | no baseline | no baseline | -5.05 | -4.58 | 200 / 7,557 / 0 | — | 0.0059 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 11 | 22.80 | 35.36 | 35.36 | 38.62 | no baseline | no baseline | -0.30 | 0.25 | 510 / 25,976 / 0 | — | 0.1753 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 5 | 2.26 | 2.33 | 2.33 | 2.98 | no baseline | no baseline | 0.89 | 1.00 | 47 / 3,382 / 0 | — | 2.263 ms per entrie | — |
| fs.list | 17–64 entries · contended | 7 | 4.93 | 7.70 | 7.70 | 10.83 | no baseline | no baseline | -0.24 | -0.26 | 132 / 8,644 / 0 | — | 0.124 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 13 | 4.05 | 5.68 | 5.68 | 11.39 | no baseline | no baseline | -0.46 | -0.13 | 76 / 10,100 / 0 | — | 0.1408 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 6 | 1.74 | 2.99 | 2.99 | 3.31 | no baseline | no baseline | -0.61 | -0.82 | 36 / 2,749 / 0 | — | 0.5383 ms per entrie | — |
| fs.list | 5–16 entries · contended | 5 | 2.58 | 3.36 | 3.36 | 4.12 | no baseline | no baseline | -0.29 | -0.40 | 76 / 4,570 / 0 | — | 0.3689 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 21 | 2.06 | 3.67 | 3.67 | 4.25 | no baseline | no baseline | -0.06 | -0.34 | 46 / 3,453 / 0 | — | 0.3468 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 5 | 2.65 | 2.92 | 2.92 | 3.12 | no baseline | no baseline | -0.91 | -0.77 | 45 / 3,456 / 0 | — | 0.0036 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.37 | 2.97 | 2.97 | 3.30 | no baseline | no baseline | -0.03 | 0.01 | 40 / 2,717 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 16 | 2.46 | 4.50 | 4.50 | 4.62 | no baseline | no baseline | 0.11 | -0.08 | 57 / 3,922 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 31 | 2.15 | 3.42 | 3.86 | 3.94 | no baseline | no baseline | -0.28 | -0.48 | 49 / 3,175 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 26 | 8.11 | 11.84 | 12.01 | 12.65 | no baseline | no baseline | -0.11 | -0.74 | 193 / 11,060 / 0 | — | 8.114 ms per file | commit |
| fs.rm | 1 files · uncontended | 114 | 7.28 | 11.68 | 16.24 | 20.11 | no baseline | no baseline | -0.47 | -0.42 | 131 / 7,679 / 0 | — | 7.275 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 3 | 2.81 | 2.81 | 2.81 | 3.55 | no baseline | no baseline | 1.54 | 1.27 | 54 / 3,455 / 0 | — | 0.0077 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 3 | 2.04 | 2.04 | 2.04 | 2.14 | no baseline | no baseline | 0.01 | -0.18 | 36 / 2,689 / 0 | — | 0.0022 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 1.90 | 1.90 | 1.90 | 2.16 | no baseline | no baseline | -3.03 | -2.63 | 55 / 2,986 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 6 | 2.08 | 2.83 | 2.83 | 8.43 | no baseline | no baseline | -0.58 | -0.64 | 39 / 3,599 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 14 | 1.86 | 2.71 | 2.71 | 2.94 | no baseline | no baseline | -0.56 | -0.73 | 39 / 2,820 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 2.21 | 2.21 | 2.21 | 2.90 | no baseline | no baseline | -1.04 | -0.77 | 49 / 2,928 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 18 | 1.93 | 3.02 | 3.02 | 4.05 | no baseline | no baseline | 0.21 | -0.05 | 38 / 2,363 / 0 | — | 0.0007 ms per byte | — |
| fs.write | ≤1 KiB · contended | 68 | 9.31 | 22.31 | 33.40 | 39.69 | no baseline | no baseline | 0.37 | 0.05 | 260 / 15,993 / 0 | — | 0.0126 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 169 | 6.49 | 11.61 | 20.62 | 42.11 | no baseline | no baseline | -0.63 | -0.73 | 128 / 5,919 / 0 | — | 0.0094 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 29 | 14.70 | 22.32 | 36.77 | 42.37 | no baseline | no baseline | -0.21 | -0.31 | 335 / 24,203 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 30 | 8.77 | 16.26 | 17.30 | 18.30 | no baseline | no baseline | -0.47 | -0.61 | 140 / 6,510 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 200 | 11.23 | 22.39 | 35.40 | 41.95 | no baseline | no baseline | 0.58 | 0.20 | 319 / 18,161 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 259 | 7.61 | 13.08 | 17.64 | 27.14 | no baseline | no baseline | 0.00 | -0.09 | 153 / 6,392 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 219 | 10.56 | 22.20 | 27.18 | 37.65 | no baseline | no baseline | 0.19 | -0.06 | 299 / 17,766 / 0 | — | 0.0042 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 457 | 6.60 | 11.81 | 16.30 | 35.88 | no baseline | no baseline | -0.25 | -0.37 | 135 / 5,818 / 0 | — | 0.0034 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.59 | 0.59 | 0.59 | 0.59 | no baseline | no baseline | 0.63 | 0.15 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 72 | 24.43 | 47.39 | 72.34 | 100.34 | no baseline | no baseline | -0.40 | -0.52 | 298 / 26,815 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 79 | 23.89 | 47.75 | 61.57 | 305.57 | no baseline | no baseline | 0.16 | 0.04 | 265 / 25,352 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 11 | 3.62 | 10.77 | 10.77 | 13.54 | no baseline | no baseline | -0.31 | -0.24 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 36 | 3.72 | 5.51 | 6.48 | 6.90 | no baseline | no baseline | 0.12 | 0.15 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 20 | 12.36 | 20.00 | 20.00 | 23.70 | no baseline | no baseline | -0.38 | -0.14 | 145 / 5,848 / 0 | — | 12.357 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 20 | 9.60 | 14.27 | 14.27 | 20.24 | no baseline | no baseline | 0.16 | 0.11 | 114 / 4,716 / 0 | — | 9.598 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 311.24 | 311.24 | 311.24 | 311.24 | no baseline | no baseline | 0.68 | 1.04 | 14,545 / 491,456 / 8,273 | — | 311.235 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · uncontended | 2 | 13.71 | 13.71 | 13.71 | 18.20 | no baseline | no baseline | -2.72 | -1.93 | 149 / 11,597 / 0 | — | 0.7617 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 14 | 15.06 | 26.76 | 26.76 | 35.81 | no baseline | no baseline | -1.01 | -0.42 | 193 / 11,484 / 0 | — | 5.7455 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 11 | 11.96 | 16.90 | 16.90 | 22.12 | no baseline | no baseline | -0.03 | 0.16 | 139 / 5,707 / 0 | — | 4.2255 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 13.94 | 13.94 | 13.94 | 13.94 | no baseline | no baseline | -0.74 | -1.00 | 166 / 12,321 / 0 | — | 1.0719 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 3 | 11.87 | 11.87 | 11.87 | 13.43 | no baseline | no baseline | -1.28 | -1.07 | 129 / 8,647 / 0 | — | 1.9785 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 69.76 | 69.76 | 69.76 | 105.34 | no baseline | no baseline | -3.41 | -4.17 | 1,097 / 120,814 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 74.87 | 953.30 | 953.30 | 13603.35 | no baseline | no baseline | 0.53 | 0.34 | 653 / 44,327 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 9.80 | 9.80 | 9.80 | 9.80 | no baseline | no baseline | 2.54 | 2.54 | 66 / 7,043 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 272 | 44.39 | 729.54 | 2312.79 | 2432.01 | no baseline | no baseline | -3.69 | -4.83 | 0 / 0 / 0 | 2,853 | — | — |
| sandbox.exec | 0 files · uncontended | 203 | 36.55 | 547.65 | 729.46 | 6964.56 | no baseline | no baseline | -0.11 | -0.05 | 0 / 0 / 0 | 3028.70 | — | — |
| sandbox.exec | 1 files · contended | 86 | 34.47 | 57.71 | 68.20 | 74.69 | no baseline | no baseline | -0.61 | -0.58 | 0 / 0 / 0 | 5.30 | 34.465 ms per file | — |
| sandbox.exec | 1 files · uncontended | 53 | 39.55 | 55.07 | 63.79 | 93.41 | no baseline | no baseline | -0.05 | 0.10 | — | 5.30 | 39.552 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 72.01 | 72.01 | 72.01 | 82.27 | no baseline | no baseline | 0.04 | 0.25 | — | 104 | 3.6005 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 20 | 68.13 | 95.02 | 95.02 | 108.53 | no baseline | no baseline | 0.55 | 0.42 | — | 43.60 | 3.4065 ms per file | — |
| sandbox.exec | 2–4 files · contended | 59 | 35.91 | 45.35 | 51.19 | 60.37 | no baseline | no baseline | -0.23 | -0.34 | — | 10.80 | 12.9767 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 46 | 39.20 | 66.32 | 70.17 | 71.58 | no baseline | no baseline | 0.48 | 0.20 | — | 8.80 | 14.8255 ms per file | — |
| sandbox.exec | 5–16 files · contended | 17 | 56.73 | 77.89 | 77.89 | 80.00 | no baseline | no baseline | -0.12 | 0.14 | — | 27.70 | 6.1538 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 19 | 59.56 | 73.06 | 73.06 | 75.70 | no baseline | no baseline | 0.68 | 0.55 | — | 19.30 | 6.8815 ms per file | — |
| sandbox.exec | — · contended | 12 | 2411.12 | 25134.78 | 25134.78 | 26459.19 | no baseline | no baseline | -1.34 | -1.15 | — | 33367.90 | — | — |
| sandbox.exec | — · uncontended | 32 | 94.37 | 13750.87 | 19107.51 | 32344.68 | no baseline | no baseline | -1.87 | -2.54 | — | 33367.90 | — | — |
| sandbox.mount | — · contended | 123 | 11.51 | 19.86 | 28.51 | 29.11 | no baseline | no baseline | -0.09 | -0.04 | 56 / 1,590 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 157 | 10.44 | 18.91 | 20.61 | 26.26 | no baseline | no baseline | -0.05 | -0.04 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 4.46 | 4.46 | 4.46 | 4.46 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.06 | 4.85 | 4.85 | 97.22 | no baseline | no baseline | 0.03 | -0.10 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 114 | 14.43 | 23.28 | 26.87 | 37.31 | no baseline | no baseline | 0.37 | 0.50 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 166 | 12.80 | 26.83 | 110.82 | 289.77 | no baseline | no baseline | 0.37 | 0.34 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 19 | 0.0 KiB | 1010.2 KiB | 4,491 | ok 19 |
| branch.diff_commits | branch | 335 | 0.0 KiB | 18.2 MiB | 63,055 | ok 335 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 10 | 0.0 KiB | 95.8 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 127 | 2.0 MiB | 0.0 KiB | 138 | Committed 127 |
| fs.diff_files | fs | 62 | 0.0 KiB | 479.7 KiB | 46 | Text 44, NoSuchPath 16, Equal 2 |
| fs.glob | fs | 64 | 0.0 KiB | 63.5 KiB | 851 | ok 64 |
| fs.grep | fs | 61 | 0.0 KiB | 182.2 KiB | 789 | ok 61 |
| fs.list | fs | 69 | 0.0 KiB | 210.6 KiB | 1,452 | ok 69 |
| fs.read | fs | 61 | 0.0 KiB | 227.4 KiB | 61 | ok 61 |
| fs.rm | fs | 140 | 0.0 KiB | 0.0 KiB | 140 | Committed 140 |
| fs.stat | fs | 56 | 0.0 KiB | 12.3 KiB | 56 | ok 56 |
| fs.write | fs | 1,431 | 20.0 MiB | 0.0 KiB | 1,431 | Committed 1428, UpToDate 3 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 287 | 0.0 KiB | 0.0 KiB | 0 | Committed 238, UpToDate 48, Conflict 1 |
| sandbox.exec | sandbox | 832 | 4.1 MiB | 3.6 MiB | 0 | exit:0 828, exit:1 1, exit:2 3 |
| sandbox.mount | sandbox | 290 | 0.0 KiB | 0.0 KiB | 0 | Mounted 290 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 290 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 290 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 3.45 · end 1.97.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.152 | 15.766 · 1.553 · 1.152 · 1.121 · 1.069 | 2.1–2.1 | statements 30, vm_steps 994, fullscan_steps 0, sorts 0, returned_rows 84 |
| read | 1.518 | 2.058 · 1.518 · 1.374 · 1.107 · 1.938 | 2.1–2.1 | statements 17, vm_steps 712, fullscan_steps 0, sorts 0, returned_rows 71 |
| list_small | 1.057 | 1.801 · 1.108 · 0.964 · 1.057 · 1.047 | 2.1–2.1 | statements 17, vm_steps 721, fullscan_steps 0, sorts 0, returned_rows 71 |
| list_largest | 4.544 | 6.861 · 4.747 · 4.394 · 4.455 · 4.544 | 2.1–2.1 | statements 72, vm_steps 8020, fullscan_steps 0, sorts 0, returned_rows 864 |
| grep_scoped | 1.335 | 2.236 · 1.335 · 1.235 · 1.233 · 1.484 | 2.1–2.1 | statements 22, vm_steps 867, fullscan_steps 0, sorts 0, returned_rows 80 |
| glob_scoped | 1.353 | 1.672 · 1.476 · 1.105 · 1.353 · 1.338 | 2.1–2.1 | statements 16, vm_steps 700, fullscan_steps 0, sorts 0, returned_rows 70 |
| grep_tree | 4273.857 | 4747.207 · 4392.355 · 4273.585 · 4273.857 · 4235.916 | 2.06–2.17 | statements 45313, vm_steps 3610924, fullscan_steps 0, sorts 0, returned_rows 365890 |
| glob_tree | 7.495 | 8.781 · 7.612 · 7.103 · 7.495 · 7.482 | 2.06–2.06 | statements 141, vm_steps 17040, fullscan_steps 0, sorts 0, returned_rows 1789 |
| diff_files | 4.54 | 4.996 · 4.34 · 4.771 · 4.54 · 4.175 | 2.06–2.06 | statements 84, vm_steps 4156, fullscan_steps 0, sorts 0, returned_rows 426 |
| list_commits | 0.764 | 1.233 · 0.63 · 0.59 · 0.805 · 0.764 | 2.06–2.06 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.241 | 3.158 · 2.357 · 2.241 · 2.066 · 2.061 | 2.06–2.06 | statements 61, vm_steps 2444, fullscan_steps 0, sorts 0, returned_rows 293 |
| fork | 0.637 | 0.473 · 0.686 · 0.496 · 0.637 · 0.969 | 2.06–2.06 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 26.28 | 28.889 · 26.814 · 26.28 · 24.642 · 24.494 | 2.06–2.06 | statements 482, vm_steps 23582, fullscan_steps 0, sorts 0, returned_rows 1915 |
| oneshot_mount_unmount | 19.897 | 19.897 · 24.955 · 19.952 · 14.753 · 17.196 | 2.05–2.06 | statements 64, vm_steps 2214, fullscan_steps 82, sorts 2, returned_rows 220 |
| oneshot_commit | 69.061 | 77.914 · 67.882 · 69.811 · 67.786 · 69.061 | 2.05–2.05 | statements 179, vm_steps 12983, fullscan_steps 82, sorts 2, returned_rows 1017 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.05–2.06 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 248.4 s** (tooling): play 93.1 · consolidate 101.4 · verify 16.8 · probes 22.9 · tests 0.0 · seal + snapshot 0.0 · report 14.2

248.41 s tooling: prepare 1.57 · play 91.54 · consolidate 101.41 · verify 8.69 (diff_commits) · version walk 8.07 · probes 22.93 · metrics 0.86 · Store allocation 0.24 · report 0.29

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T21:43:45.557Z | stop | Speed: not judged: baseline not set (pilot); Scaling: branch.diff_commits checkpoint ms in total (entries exponent 0.142): tree files exponent 0.223; Counters: glob_tree.vm_steps per tree file: depth exponent 0.333; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (19 classes too narrow); Node proofs: 18 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 |

### G. Evidence

- `~/lfs-history/metrics/range-028.a1.json`
- trace `~/lfs-history/runs/p3-main-s/trace/range-028.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-s/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r028-1-root | 497 | 280.4 KiB |
| r028-3-examples-acp-agent | 839 | 288.6 KiB |
| r028-2-packages-client | 717 | 311.2 KiB |
| r028-4-examples-plan-acp-agent | 898 | 285.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 293.0 | 2,362 |
| `git diff --stat` | 31.0 | 2,352 |
| `git add -f` | 27.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 34.0 | 2,359 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r028-1-root | end | P1 | pass | — | — |
| r028-1-root | end | P2 | pass | exit 0 | — |
| r028-1-root | end | P3 | n/a | an install, not a refresh | — |
| r028-1-root | end | P4 | pass | 8 emitted files, exit 1 | — |
| r028-1-root | end | P5 | n/a | no calibrated file | — |
| r028-1-root | end | P6 | n/a | not a repair | — |
| r028-2-packages-client | end | P1 | pass | — | — |
| r028-2-packages-client | end | P2 | pass | exit 0 | — |
| r028-2-packages-client | end | P3 | pass | 201 bookkeeping path(s) | — |
| r028-2-packages-client | end | P4 | pass | 140 emitted files, exit 2 | — |
| r028-2-packages-client | end | P5 | n/a | no calibrated file | — |
| r028-2-packages-client | end | P6 | n/a | not a repair | — |
| r028-3-examples-acp-agent | end | P1 | pass | — | — |
| r028-3-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r028-3-examples-acp-agent | end | P3 | pass | 201 bookkeeping path(s) | — |
| r028-3-examples-acp-agent | end | P4 | pass | 86 emitted files, exit 2 | — |
| r028-3-examples-acp-agent | end | P5 | n/a | no calibrated file | — |
| r028-3-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r028-4-examples-plan-acp-agent | end | P1 | pass | — | — |
| r028-4-examples-plan-acp-agent | end | P2 | pass | exit 0 | — |
| r028-4-examples-plan-acp-agent | end | P3 | pass | 201 bookkeeping path(s) | — |
| r028-4-examples-plan-acp-agent | end | P4 | pass | 64 emitted files, exit 2 | — |
| r028-4-examples-plan-acp-agent | end | P5 | pass | 11 files | — |
| r028-4-examples-plan-acp-agent | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | stop | P1 pass, P4 stop (4 emitted file(s) differ: packages/client/ui-conversation/lib/client.js, packages/client/ui-layout/lib/client.js, packages/client/ui-sidebar/lib/client.js) | — |

### J. Conflicts by path class

No conflicts by path recorded.
