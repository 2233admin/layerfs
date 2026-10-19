# Range 032 · **watch** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r031 (live Store)
dsh `8500974fd`..`0ac226e07` · **76 commits** (1 mainline, 75 side) · 2026-07-21 → 2026-07-23
Areas changed: `examples/acp-agent` 15% · `packages/core` 15% · `/` 9% · other 61%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 20 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.20×** · **Churn 0.00**
**Time split:** play 99.1 s · git 129.4 s · Node 266.4 s · verify 9.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **732.9 MiB** (+3.0 MiB) | **870.9 MiB** (+35.0 MiB) live | **1.19×** (prev 1.15×) | **35.2 MiB** | **1,187** (total 36,538) | **277.0 s** tooling (total 91.6 min) |

**Checks:** 14 pass · 5 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.4× it; Scaling insufficient same-binary points: 2 of 3 (daemon 27a769a48998); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters insufficient same-binary points: 2 of 3 (daemon 27a769a48998); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 35.2 MiB; median not judged: 1 of 3 earlier ranges
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ fs.read p95 +118% · ▲ fs.list p95 +84% · ▼ sandbox.exec p95 −73%
**Budget:** 33 of 202 ranges · projected total 16.2 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **265 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 4 lanes merged, 1 publish |
| Steps | 2,360 / 2,360 outcomes as planned |
| Conflicts | **2 / 2 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2527 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 377 bin shims, 3928 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **242 picks** in 4 merges (242 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `0ac226e07`** · 214 commits written for 214 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 100 untracked, unignored (460,983 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 242 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r032-3-packages-core | end | `6cab88d8e30a` | `1ab472d8e6a7` | pass (380 normalized) | pass | pass | pass | n/a | n/a |
| r032-2-agents-notes | end | `1939710808d6` | `1ab472d8e6a7` | pass (380 normalized) | pass | pass | pass | n/a | n/a |
| r032-1-root | end | `42c09c1f3e05` | `ceb627768ce2` | pass (379 normalized) | pass | n/a | pass | pass | n/a |
| r032-4-packages-code-runtime | end | `1e155eab12b5` | `1ab472d8e6a7` | pass (380 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `848f33390526` | `null` | n/a | pass | n/a | n/a | pass | pass (125,773 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/context/time-context/tests/invariant.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/config.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/render.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/tools.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/support/invariants/tests/service.spec.ts` (fails natively) · `packages/timeout/timeout-policy/tests/timeout-policy.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/skill/tool-skill/tests/tool-skill.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/tools.spec.ts` (fails natively) · `packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/host/runtime/tests/host-runtime.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/modes.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/session-list.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/host/runtime/tests/api-proxy-view.spec.ts` (fails natively) · `packages/compact/compact-tool-result-prune/tests/tool-result-prune.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/ui/tool-ask-user/tests/tool-ask-user.spec.ts` (fails natively) · `packages/lsp/tool-lsp/tests/tool-lsp.spec.ts` (fails natively) · `packages/tasks/tool-tasks/tests/tool-tasks.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/retry.spec.ts` (fails natively) · `packages/mcp/mcp-client/tests/mcp-client.spec.ts` (fails natively) · `packages/code-runtime/code-runtime-worker/tests/worker-json.spec.ts` (fails natively).

## 2. Activity

**3,093 calls** · **190 steps** by **6 agents + lead** on **4 Branches + main** · **239 Workspaces** (100% one-shot, 0 open at end)
**File changes:** +52 added · 998 modified · −32 deleted · 18.0 MiB written · fs 1,004 : Sandbox 78 (**13 : 1**, reported only in P3)
**Execs:** 645 (JS 67 · shell 578) · 4 non-zero exits · install 0 · test runs 3 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,322 | 1,017 | 305 | Committed 1,017 · Text 33 · NoSuchPath 13 |
| sandbox | 1,365 | 882 | 5 | commit 237 (Committed 184, UpToDate 52, Conflict 1) · exec 645 (exit:0 641, exit:2 3, exit:1 1) · mount 239 (Mounted 239) · status 5 · unmount 239 (Unmounted 239) |
| branch | 395 | 33 | 362 | diff_branches 14 · diff_commits 348 · fork 23 (Forked 23) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,093** | **1,932** | **683** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r032-1-root | a01 | 19 | 208 | ✓ | — |
| r032-2-agents-notes | a02 a03 a04 a05 | 64 | 227 | ✓ | — |
| r032-3-packages-core | a06 a07 | 35 | 211 | ✓ | — |
| r032-4-packages-code-runtime | a08 a09 a10 | 65 | 236 | ✓ | — |
| main | lead | 7 | 305 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r032-4, a10 after a08 | 0.1 s |
| Stale clean merge | 0 / 0 | — | — |
| Decoy edit | 1 / 1 | r032-4, a09 a08 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r032-1 | 19 | 8 | 11 | 0 | 0 | 208 | — |
| a02 | r032-2 | 64 | 35 | 29 | 0 | 0 | 227 | — |
| a06 | r032-3 | 35 | 20 | 15 | 0 | 0 | 211 | — |
| a08 | r032-4 | 60 | 27 | 33 | 0 | 0 | 234 | commit-conflict, decoy |
| a09 | r032-4 | 1 | 1 | 0 | 0 | 0 | 2 | decoy |
| a10 | r032-4 | 4 | 0 | 4 | 0 | 0 | 0 | commit-conflict |
| lead | main | 7 | 1 | 0 | 6 | 0 | 305 | — |
| **Total** |  | **190** | **92** | **92** | **6** | **0** | **1,187** | **2** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 136 · pnpm 1 · tsc 4 · vitest 3 · other 501

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r032-1-root | 13 | 13 | 13 | 1 | 13 | 249 |
| r032-4-packages-code-runtime | 42 | 42 | 42 | 0 | 42 | 553 |
| r032-2-agents-notes | 46 | 46 | 46 | 0 | 46 | 514 |
| r032-3-packages-core | 27 | 27 | 27 | 0 | 27 | 504 |
| **lead** | — | — | — | — | 214 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r032-3-packages-core | 0 | 1 | 1 | 0 | 0 | — / — |
| r032-2-agents-notes | 0 | 1 | 1 | 0 | 0 | — / — |
| r032-1-root | 1 | 0 | 1 | 1 | 217 | 217 / 217 |
| r032-4-packages-code-runtime | 0 | 1 | 1 | 1 | 29 | 29 / 29 |
| **lead repair** | 1 | — | 1 | — | — | 125,773 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r031) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 729.9 MiB (18.9 MiB / 624.9 MiB / 17.2 MiB / 69.0 MiB) | 732.9 MiB (19.5 MiB / 624.9 MiB / 17.6 MiB / 71.0 MiB) | +3.0 MiB |
| Version figures from | — | incremental (64,016 changed paths) | — |
| Files / directories / symlinks | 54,122 / 8,844 / 3,934 | 54,160 / 8,844 / 3,936 | +38 / +0 / +2 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 835.9 MiB | 870.9 MiB | +35.0 MiB |
| **Space amplification** (total · tracked) | 1.15× · tracked 4.90× | 1.19× · tracked 4.84× | 0.04 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **6.52** (1.23 / 0.23 / 1.42) | 1.24× the median range |
| **Stored per Commit** | 100.5 KiB | 30.2 KiB | — |
| Metadata share | 0.38 | 0.38 | this range 0.49 |
| History: Commits / Layers / Branches | 35,351 | 36,538 / 18 / 294 | +1,187 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.81 GiB (Commits 8.98 GiB · installs 897.6 MiB · build 108.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 43.32 GiB / 36% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 536.2 MiB | 0.73 | +14.9 MiB |
| Metadata | 72.1 MiB | 0.10 | +2.8 MiB |
| Index rows + waste + other (live, not split) | 262.6 MiB | 0.36 | — |
| **Total = Store on disk** | **870.9 MiB** | **= 1.19** space amplification | +35.0 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 19.5 MiB | 94.2 MiB (55.5 MiB + 38.7 MiB) | 4.84× | — | 1.9 MiB | 5.4 MiB | 0.35 |
| `node_modules` | 624.9 MiB | 195.8 MiB (180.6 MiB + 15.2 MiB) | 0.31× | — | 1.0 MiB | 0.1 KiB | 15783.25 |
| Build output | 17.6 MiB | 13.2 MiB (12.4 MiB + 854.6 KiB) | 0.75× | — | 1006.2 KiB | 6.8 MiB | 0.15 |
| `.git` | 71.0 MiB | 277.2 MiB (266.5 MiB + 10.6 MiB) | 3.90× | — | 13.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 262.6 MiB | — (not divided) | — | 17.2 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 27.9 MiB | — | — | — | — | — |
| **Total** | — | **870.9 MiB** | **= 1.19×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +4,211 | — | 0 (derived) | 58% |
| Chunks (large files) | — (at snapshots) | +814 | — | — | 6% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 4,897 (with inodes, pooled) | — | — | 53% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,061 | — | — | — |

Delta: 3.1% at depth cap · 18% of refused bases stopped by budget · `node_modules` reinstall: absolute: 817116 new stored bytes for 68 raw changed bytes of 2 changed packages (12016.412×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.84× (94.2 MiB for 19.5 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.0 KiB / 2.2 KiB / 6.0 KiB over 342 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.20× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.0 MiB stored for 2.46 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.30 (4 lanes × 732.9 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.4 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.8 ms / 29.6 ms (1.20×) | 3.1 ms / 7.9 ms (1.35×) | 3.8 ms / 11.0 ms (1.58×) | 19.0 ms / 90.9 ms (1.05×) | 10.3 ms / 20.4 ms (0.91×) | 411 ms / 495 ms (5.39×) | — (native comparison in P3; exec 40.5 ms / 1011 ms) |
| SQL p50: 172 stmts | 63 stmts | 70 stmts | 196 stmts | 45 stmts | 7,938 stmts | — |

**Commit cost:** 8.31 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 635 ms p50 over 239
**Slowest:** sandbox.exec 41441 ms · sandbox.exec 30281 ms · sandbox.exec 30115 ms · checkpoint diff_commits 0.11 ms and 1.50 statements per entry (63,848 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 329 ms / 329 ms | — / — | — | git / status-cold: — |
| git status (steady) | 327 ms / 501 ms | — / — | — | git / status-steady: — |
| git add | 28.0 ms / 81.0 ms | — / — | — | git / add: — |
| git commit (lane) | 36.0 ms / 63.0 ms | — / — | — | git / commit: — |
| lead writes main | 12240 ms / 12240 ms | — / — | — | — |
| repack | 3160 ms / 3160 ms | — / — | — | — |
| pnpm install (incremental) | 6592 ms / 6592 ms | 2140 ms / 2140 ms | 3.08× | pnpm-reinstall / cold: — |
| pnpm refresh | 2794 ms / 2794 ms | 1931 ms / 1931 ms | 1.45× | pnpm-reinstall / steady: — |
| tsc -b | 5022 ms / 5885 ms | 4032 ms / 6160 ms | 1.25× | tsc-b / cold: — |
| vitest | 15686 ms / 15686 ms | 12259 ms / 12259 ms | 1.28× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.9 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.5 ms / 32.8 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4132392 → 4194304 B · fs.write ≤64 KiB 4132392 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4132392 → 3073552 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 10.16 at the first command → 6.45 after the last (max 10.70 over 6 commands) · Docker VM 1.48 → 1.98

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-032.a1)

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

- **a1 (`p3-main-u`, live after r31 a1; daemon `27a769a4`, addon `0611f3e0`, the P3 re-baseline binaries): WATCH, terminal.** Checkpoint ok, git ✓. Node: 20 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass (1,572 emitted). Control `control-032.a1` passes. Report check F1–F8 PASS.
- **Calibration facts of the history, not of LayerFS:** at `r032-2-agents-notes.end` dsh's own build fails (`tsc -b` exit 1) and its 20 candidate tests fail natively, so P5 is n/a there. At `r032-3-packages-core.end` the native vitest run of 78 files hit its 90 s timeout (exit 124), so the files are skipped as "vitest report did not parse" and P5 is n/a. P1–P4 pass at both.
- **Speed** (re-baseline, recorded, not a stop in fast mode): not judged as a whole, because the thin `sandbox.commit` 0 files · Committed class has 3 calls per baseline range (13.4×; explained in the range 35 summary). Merge p50 411 ms is 5.39× the baseline, about 330 ms more per call, over the 5 ms floor. One-shot Commit 1.05×, mount 0.91×, write 1.20×; read 1.35× and list 1.58× are on 3–4 ms calls, under the floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 6.5–10.7 across the play commands.
- Final steps: lanes 22 s + 83 s (cut at plan order 21), repair 130 s of its 160 s alarm, verify 13 s, finish 35 s. Repair install 41.4 s, build 21.8 s, tests 3.5 s. The repair step is the one to watch for the alarm.
- Watch items: index rows + waste + other 262.6 MiB on the live Store (not split; +17.2 MiB shared, #366). `fs.rm` uncontended p50 18.2 ms per file over 29 calls, 7,884 VM steps (r31: 6.4 ms, 4,699; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2360/2360; conflicts 2/2; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.4× it | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 27a769a48998); also not judged: oneshot_exec: 2 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 27a769a48998) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.488 | < 0.5 | pass |
| Reinstall growth | absolute: 817116 new stored bytes for 68 raw changed bytes of 2 changed packages (12016.412×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0306 (budget 0.1816) | < 0.1 | pass |
| Range growth | 35.2 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 0.96 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 214 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 20 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 242 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.20× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 190 | 191 |
| Lanes / agents | 4 / 6 | 4 / 10 |
| LayerFS Commits | 1187 | 1046 |
| Workspaces (one-shot share) | 239 (1.00) | 92 (0.989) |
| Reads | 256 | 256 |
| Reconcile writes | 297 | 297 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 14 | 29.77 | 337.25 | 337.25 | 516.66 | 1.83× | 6.51× | — | — | 395 / 37,571 / 0 | — | 0.124 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 300.67 | 300.67 | 300.67 | 300.67 | no baseline | no baseline | — | — | 7,870 / 285,139 / 0 | — | 1.4455 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 342 | 20.56 | 40.29 | 59.94 | 378.09 | 1.19× | 1.55× | — | — | 298 / 32,448 / 0 | — | 0.112 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.84 | 2.66 | 2.66 | 4.18 | 0.93× | 2.02× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 1.18 | 1.18 | 1.18 | 1.28 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0589 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 495.26 | 495.26 | 495.26 | 516.40 | 5.39× | 5.39× | — | — | 9,207 / 789,759 / 0 | — | 6.1143 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.28 | 1.28 | 1.28 | 1.28 | 0.83× | 0.83× | — | — | 35 / 517 / 0 | — | 0.0077 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 40.43 | 40.43 | 40.43 | 40.43 | 7.98× | 7.98× | — | — | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 42.83 | 42.83 | 42.83 | 42.83 | 1.76× | 1.76× | — | — | 184 / 15,231 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 1 | 10.80 | 10.80 | 10.80 | 10.80 | 1.76× | 1.45× | — | — | 166 / 10,601 / 0 | — | 0.0164 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 8 | 11.72 | 16.08 | 16.08 | 18.57 | 1.63× | 1.87× | — | — | 335 / 20,936 / 0 | — | 0.0333 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 12 | 8.84 | 11.81 | 11.81 | 16.76 | 1.51× | 1.46× | — | — | 200 / 11,360 / 0 | — | 0.0256 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 11.10 | 15.04 | 15.04 | 24.84 | 2.05× | 2.50× | — | — | 208 / 13,081 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 13 | 11.09 | 16.65 | 16.65 | 30.78 | 1.78× | 1.80× | — | — | 222 / 11,831 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 2 | 8.53 | 8.53 | 8.53 | 9.25 | 1.15× | 1.06× | — | — | 161 / 9,883 / 0 | — | 0.0014 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 4 | 5.23 | 6.10 | 6.10 | 12.99 | 1.88× | 2.19× | — | — | 87 / 8,946 / 0 | — | 0.2376 ms per file | — |
| fs.glob | 17–64 files · uncontended | 6 | 5.43 | 8.87 | 8.87 | 33.06 | 1.92× | 2.34× | — | — | 73 / 7,122 / 0 | — | 0.2262 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.59 | 2.59 | 2.59 | 2.63 | 1.42× | 1.42× | — | — | 51 / 3,694 / 0 | — | 0.863 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 2.54 | 2.54 | 2.54 | 2.66 | 1.44× | 1.31× | — | — | 44 / 3,617 / 0 | — | 0.8877 ms per file | — |
| fs.glob | 5–16 files · contended | 4 | 3.67 | 3.80 | 3.80 | 4.96 | 2.19× | 2.26× | — | — | 82 / 5,402 / 0 | — | 0.4755 ms per file | — |
| fs.glob | 5–16 files · uncontended | 8 | 3.03 | 3.60 | 3.60 | 57.26 | 1.50× | 1.58× | — | — | 52 / 4,697 / 0 | — | 0.4336 ms per file | — |
| fs.glob | >64 files · contended | 4 | 5.26 | 6.17 | 6.17 | 14.14 | 0.97× | 1.14× | — | — | 141 / 10,074 / 0 | — | 0.0491 ms per file | — |
| fs.glob | >64 files · uncontended | 3 | 4.26 | 4.26 | 4.26 | 6.23 | 0.43× | 0.30× | — | — | 74 / 8,455 / 0 | — | 0.0309 ms per file | — |
| fs.grep | 17–64 files · contended | 4 | 10.20 | 10.88 | 10.88 | 15.64 | 1.71× | 1.82× | — | — | 153 / 8,998 / 0 | — | 0.4532 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 4 | 6.52 | 10.37 | 10.37 | 12.44 | 1.13× | 1.73× | — | — | 153 / 7,807 / 0 | — | 0.3434 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 3.94 | 3.94 | 3.94 | 4.15 | 1.01× | 0.99× | — | — | 100 / 5,642 / 0 | — | 0.9848 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 2 | 2.95 | 2.95 | 2.95 | 3.25 | 1.28× | 0.92× | — | — | 57 / 2,730 / 0 | — | 0.983 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 6 | 6.82 | 13.59 | 13.59 | 15.25 | 2.30× | 2.69× | — | — | 142 / 6,311 / 0 | — | 0.8758 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 18 | 5.55 | 12.71 | 12.71 | 12.72 | 1.48× | 2.12× | — | — | 93 / 5,339 / 0 | — | 0.7823 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 5 | 16.29 | 21.12 | 21.12 | 22.64 | 1.04× | 1.34× | — | — | 470 / 24,559 / 0 | — | 0.1531 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 21.48 | 23.91 | 23.91 | 25.71 | 1.18× | 1.04× | — | — | 479 / 25,992 / 0 | — | 0.161 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 6 | 5.01 | 11.02 | 11.02 | 15.02 | 2.09× | 4.58× | — | — | 118 / 8,115 / 0 | — | 0.1414 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 9 | 4.19 | 4.99 | 4.99 | 5.57 | 1.67× | 1.70× | — | — | 73 / 7,214 / 0 | — | 0.0875 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 2.63 | 2.63 | 2.63 | 3 | 1.13× | 1.13× | — | — | 102 / 7,779 / 0 | — | 0.6563 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 3 | 3.09 | 3.09 | 3.09 | 3.20 | 1.64× | 1.52× | — | — | 55 / 4,878 / 0 | — | 1.0313 ms per entrie | — |
| fs.list | 5–16 entries · contended | 7 | 4.50 | 6.50 | 6.50 | 6.73 | 1.93× | 2.29× | — | — | 71 / 4,840 / 0 | — | 0.5524 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 15 | 3.00 | 11.10 | 11.10 | 23.55 | 1.58× | 2.91× | — | — | 52 / 4,906 / 0 | — | 0.4326 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 3 | 2.90 | 2.90 | 2.90 | 3.44 | 1.31× | 1.31× | — | — | 66 / 4,602 / 0 | — | 0.004 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 5 | 3.38 | 4.29 | 4.29 | 4.30 | 2.13× | 2.71× | — | — | 71 / 4,770 / 0 | — | 0.0042 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 2.73 | 2.73 | 2.73 | 2.73 | no baseline | no baseline | — | — | 95 / 5,668 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 4.70 | 4.70 | 4.70 | 8.64 | 1.68× | 1.68× | — | — | 63 / 4,724 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 11 | 4.26 | 7.89 | 7.89 | 11.36 | 2.02× | 1.33× | — | — | 103 / 6,467 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 22 | 2.78 | 3.71 | 3.81 | 12.00 | 1.35× | 1.04× | — | — | 55 / 3,904 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 3 | 14.51 | 14.51 | 14.51 | 38.70 | 1.38× | 1.02× | — | — | 152 / 7,049 / 0 | — | 14.507 ms per file | commit |
| fs.rm | 1 files · uncontended | 29 | 18.21 | 40.70 | 42.77 | 50.98 | 2.72× | 3.64× | — | — | 148 / 7,884 / 0 | — | 18.206 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 6 | 2.93 | 3.28 | 3.28 | 3.34 | 1.91× | 2.14× | — | — | 61 / 4,382 / 0 | — | 0.0063 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 2.56 | 2.56 | 2.56 | 5.36 | no baseline | no baseline | — | — | 41 / 2,590 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.61 | 2.61 | 2.61 | 3.11 | 1.24× | 1.24× | — | — | 41 / 2,793 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 9 | 4.10 | 14.57 | 14.57 | 21.58 | 1.57× | 4.25× | — | — | 87 / 5,937 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 17 | 2.71 | 4.47 | 4.47 | 9.40 | 1.38× | 2.07× | — | — | 44 / 3,366 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 3.49 | 3.49 | 3.49 | 4.74 | 1.55× | 1.16× | — | — | 52 / 3,802 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 6 | 2.35 | 2.49 | 2.49 | 3.39 | 1.41× | 0.71× | — | — | 41 / 3,270 / 0 | — | 0.0003 ms per byte | — |
| fs.write | ≤1 KiB · contended | 28 | 15.32 | 62.63 | 85.47 | 128.26 | 1.80× | 4.20× | — | — | 353 / 22,753 / 0 | — | 0.0289 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 67 | 8.46 | 25.29 | 32.80 | 61.79 | 1.33× | 2.40× | — | — | 152 / 7,501 / 0 | — | 0.0145 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 20 | 14.47 | 81.10 | 81.10 | 138.92 | 0.90× | 5.04× | — | — | 410 / 30,094 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 28 | 10.98 | 15.73 | 21.49 | 31.43 | 1.33× | 1.91× | — | — | 163 / 7,721 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 201 | 16.29 | 39.32 | 75.98 | 142.72 | 1.65× | 1.79× | — | — | 495 / 27,848 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 269 | 8.68 | 14.40 | 26.51 | 136.52 | 1.20× | 1.06× | — | — | 160 / 7,395 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 108 | 14.10 | 38.28 | 70.72 | 115.28 | 1.44× | 1.70× | — | — | 401 / 21,075 / 0 | — | 0.0038 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 250 | 8.20 | 13.70 | 21.76 | 31.03 | 1.14× | 0.99× | — | — | 150 / 7,234 / 0 | — | 0.0047 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.69 | 0.69 | 0.69 | 0.69 | 0.91× | 0.91× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 39 | 25.47 | 51.35 | 128.56 | 132.73 | 1.21× | 1.47× | — | — | 267 / 25,335 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 90 | 21.73 | 36.47 | 167.43 | 262.48 | 1.05× | 1.05× | — | — | 226 / 21,255 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 10 | 3.15 | 17.65 | 17.65 | 23.52 | 0.82× | 2.18× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 42 | 3.42 | 4.79 | 7.08 | 10.14 | 0.86× | 0.94× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 6 | 10.40 | 12.12 | 12.12 | 12.40 | 1.08× | 0.63× | — | — | 114 / 4,662 / 0 | — | 10.398 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 15 | 8.89 | 10.89 | 10.89 | 13.13 | 1.07× | 0.89× | — | — | 110 / 4,608 / 0 | — | 8.894 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 220.75 | 220.75 | 220.75 | 220.75 | 5.79× | 5.79× | — | — | 14,231 / 445,824 / 82 | — | 220.749 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 10.50 | 14.90 | 14.90 | 15.52 | 0.70× | 0.76× | — | — | 170 / 8,191 / 0 | — | 4.9653 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 11.74 | 20.60 | 20.60 | 34.30 | 1.10× | 1.21× | — | — | 138 / 5,986 / 0 | — | 4.889 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 16.13 | 16.13 | 16.13 | 16.13 | 0.98× | 0.98× | — | — | 229 / 14,051 / 0 | — | 1.7918 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 13.95 | 13.95 | 13.95 | 23.01 | 1.02× | 1.02× | — | — | 224 / 9,037 / 0 | — | 2.3014 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 90.88 | 90.88 | 90.88 | 825.21 | no baseline | no baseline | — | — | 1,527 / 163,034 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 91.82 | 924.76 | 924.76 | 13680.28 | 1.33× | 13.40× | — | — | 1,131 / 64,967 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 212 | 518.53 | 829.73 | 2969.54 | 3208.39 | 10.12× | 2.16× | — | — | 0 / 0 / 0 | 3318.70 | — | — |
| sandbox.exec | 0 files · uncontended | 188 | 32.39 | 54.47 | 1373.83 | 6447.96 | 1.02× | 0.19× | — | — | — | 3327.70 | — | — |
| sandbox.exec | 1 files · contended | 30 | 33.38 | 63.80 | 69.34 | 71.80 | 0.91× | 0.76× | — | — | — | 5.50 | 33.384 ms per file | — |
| sandbox.exec | 1 files · uncontended | 50 | 36.51 | 60.48 | 62.53 | 68.30 | 1.10× | 0.89× | — | — | — | 5 | 36.511 ms per file | — |
| sandbox.exec | 17–64 files · contended | 4 | 73.92 | 155.34 | 155.34 | 316.53 | 1.06× | 2.22× | — | — | — | 92 | 3.8903 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 62.28 | 62.28 | 62.28 | 75.15 | 0.89× | 0.89× | — | — | — | 97 | 3.1138 ms per file | — |
| sandbox.exec | 2–4 files · contended | 25 | 42.31 | 73.96 | 179.19 | 254.74 | 1.09× | 1.06× | — | — | — | 8.80 | 15.582 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 51 | 48.61 | 151.27 | 176.97 | 209.83 | 1.27× | 2.31× | — | — | — | 12.30 | 19.659 ms per file | — |
| sandbox.exec | 5–16 files · contended | 11 | 58.09 | 74.02 | 74.02 | 82.87 | 0.99× | 1.02× | — | — | — | 27 | 7.4023 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 17 | 42.25 | 74.03 | 74.03 | 89.79 | 0.59× | 0.70× | — | — | — | 20 | 4.4374 ms per file | — |
| sandbox.exec | — · contended | 14 | 5021.61 | 30115.02 | 30115.02 | 30281.38 | no baseline | no baseline | — | — | — | 38053.40 | — | — |
| sandbox.exec | — · uncontended | 31 | 170.25 | 14913.07 | 21815.33 | 41440.51 | 0.32× | 2.10× | — | — | — | 37892.10 | — | — |
| sandbox.mount | — · contended | 62 | 10.35 | 16.45 | 48.42 | 54.14 | 0.92× | 0.87× | — | — | 45 / 1,362 / 82 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 167 | 10.21 | 22.55 | 53.40 | 57.15 | 0.91× | 1.12× | — | — | 45 / 1,362 / 82 | — | — | sandbox.mount.attach |
| sandbox.status | — · contended | 1 | 3.65 | 3.65 | 3.65 | 3.65 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.48 | 9.62 | 9.62 | 42.55 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 58 | 12.83 | 22.93 | 70.73 | 112.17 | 1.21× | 1.27× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 171 | 12.53 | 32.78 | 118.35 | 184.52 | 1.20× | 1.78× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 14 | 0.0 KiB | 750.5 KiB | 3,283 | ok 14 |
| branch.diff_commits | branch | 348 | 0.0 KiB | 19.1 MiB | 65,065 | ok 348 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 10 | 0.0 KiB | 96.7 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 14 | 1.7 MiB | 0.0 KiB | 25 | Committed 14 |
| fs.diff_files | fs | 46 | 0.0 KiB | 600.9 KiB | 33 | Text 33, NoSuchPath 13 |
| fs.glob | fs | 44 | 0.0 KiB | 50.8 KiB | 596 | ok 44 |
| fs.grep | fs | 58 | 0.0 KiB | 235.3 KiB | 899 | ok 58 |
| fs.list | fs | 54 | 0.0 KiB | 243.4 KiB | 1,526 | ok 54 |
| fs.read | fs | 50 | 0.0 KiB | 175.4 KiB | 50 | ok 50 |
| fs.rm | fs | 32 | 0.0 KiB | 0.0 KiB | 32 | Committed 32 |
| fs.stat | fs | 53 | 0.0 KiB | 12.4 KiB | 53 | ok 53 |
| fs.write | fs | 971 | 16.9 MiB | 0.0 KiB | 971 | Committed 971 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 237 | 0.0 KiB | 0.0 KiB | 0 | Committed 184, UpToDate 52, Conflict 1 |
| sandbox.exec | sandbox | 645 | 2.6 MiB | 4.1 MiB | 0 | exit:0 641, exit:2 3, exit:1 1 |
| sandbox.mount | sandbox | 239 | 0.0 KiB | 0.0 KiB | 0 | Mounted 239 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 239 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 239 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.48 · end 1.98.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.106 | 13.98 · 1.317 · 1.05 · 0.959 · 1.106 | 2.4–2.4 | statements 23, vm_steps 772, fullscan_steps 0, sorts 0, returned_rows 68 |
| read | 1.04 | 1.332 · 1.04 · 1.043 · 1.005 · 0.945 | 2.4–2.4 | statements 14, vm_steps 574, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_small | 1.066 | 1.582 · 1.096 · 0.914 · 1.066 · 0.908 | 2.4–2.4 | statements 14, vm_steps 583, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_largest | 5.916 | 7.978 · 5.916 · 5.694 · 5.758 · 6.213 | 2.4–2.4 | statements 136, vm_steps 12974, fullscan_steps 0, sorts 0, returned_rows 1294 |
| grep_scoped | 1.047 | 1.473 · 1.135 · 1.008 · 1.011 · 1.047 | 2.4–2.4 | statements 19, vm_steps 729, fullscan_steps 0, sorts 0, returned_rows 68 |
| glob_scoped | 1.005 | 1.016 · 0.887 · 0.89 · 1.005 · 1.029 | 2.4–2.4 | statements 13, vm_steps 562, fullscan_steps 0, sorts 0, returned_rows 58 |
| grep_tree | 4441.389 | 4441.389 · 4491.852 · 4448.917 · 4377.774 · 4322.863 | 2.07–2.29 | statements 48018, vm_steps 3796950, fullscan_steps 0, sorts 0, returned_rows 382580 |
| glob_tree | 7.238 | 9.425 · 7.573 · 7.099 · 7.071 · 7.238 | 2.07–2.07 | statements 152, vm_steps 18198, fullscan_steps 0, sorts 0, returned_rows 1853 |
| diff_files | 4.598 | 4.602 · 4.184 · 4.277 · 4.598 · 4.651 | 2.07–2.07 | statements 60, vm_steps 3256, fullscan_steps 0, sorts 0, returned_rows 348 |
| list_commits | 0.904 | 1.401 · 0.777 · 0.904 · 0.847 · 0.911 | 2.07–2.07 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.117 | 2.829 · 2.123 · 2.117 · 2.063 · 1.911 | 2.07–2.07 | statements 53, vm_steps 1780, fullscan_steps 0, sorts 0, returned_rows 204 |
| fork | 0.721 | 0.944 · 0.576 · 0.727 · 0.721 · 0.578 | 2.07–2.07 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 25.11 | 31.838 · 30.535 · 25.11 · 20.578 · 21.159 | 2.07–2.07 | statements 445, vm_steps 20304, fullscan_steps 0, sorts 0, returned_rows 1488 |
| oneshot_mount_unmount | 15.184 | 20.701 · 14.585 · 18.892 · 14.969 · 15.184 | 2.07–2.07 | statements 57, vm_steps 1992, fullscan_steps 82, sorts 2, returned_rows 204 |
| oneshot_commit | 67.868 | 68.655 · 56.492 · 67.023 · 68.73 · 67.868 | 2.07–2.07 | statements 157, vm_steps 11425, fullscan_steps 82, sorts 2, returned_rows 844 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.07–2.07 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 277.0 s** (tooling): play 100.8 · consolidate 126.6 · verify 15.5 · probes 23.0 · tests 0.0 · seal + snapshot 0.0 · report 11.1

277.01 s tooling: prepare 1.68 · play 99.10 · consolidate 126.63 · verify 9.15 (diff_commits) · version walk 6.37 · probes 23.01 · metrics 0.77 · Store allocation 0.27 · report 0.34

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-19T23:45:37.772Z | watch | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.4× it; Scaling: insufficient same-binary points: 2 of 3 (daemon 27a769a48998); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: insufficient same-binary points: 2 of 3 (daemon 27a769a48998); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 35.2 MiB; median not judged: 1 of 3 earlier ranges |

### G. Evidence

- `~/lfs-history/metrics/range-032.a1.json`
- trace `~/lfs-history/runs/p3-main-u/trace/range-032.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-u/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r032-1-root | 249 | 352.8 KiB |
| r032-4-packages-code-runtime | 553 | 356.4 KiB |
| r032-2-agents-notes | 514 | 357.6 KiB |
| r032-3-packages-core | 504 | 355.9 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 327.0 | 2,905 |
| `git diff --stat` | 32.0 | 2,898 |
| `git add -f` | 28.0 | — |
| `git rm --cached` | 9.0 | — |
| `git commit` | 36.0 | 2,901 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r032-3-packages-core | end | P1 | pass | — | — |
| r032-3-packages-core | end | P2 | pass | exit 0 | — |
| r032-3-packages-core | end | P3 | pass | 240 bookkeeping path(s) | — |
| r032-3-packages-core | end | P4 | pass | 179 emitted files, exit 2 | — |
| r032-3-packages-core | end | P5 | n/a | no calibrated file | — |
| r032-3-packages-core | end | P6 | n/a | not a repair | — |
| r032-2-agents-notes | end | P1 | pass | — | — |
| r032-2-agents-notes | end | P2 | pass | exit 0 | — |
| r032-2-agents-notes | end | P3 | pass | 240 bookkeeping path(s) | — |
| r032-2-agents-notes | end | P4 | pass | 58 emitted files, exit 1 | — |
| r032-2-agents-notes | end | P5 | n/a | no calibrated file | — |
| r032-2-agents-notes | end | P6 | n/a | not a repair | — |
| r032-1-root | end | P1 | pass | — | — |
| r032-1-root | end | P2 | pass | exit 0 | — |
| r032-1-root | end | P3 | n/a | an install, not a refresh | — |
| r032-1-root | end | P4 | pass | 1048 emitted files, exit 2 | — |
| r032-1-root | end | P5 | pass | 217 files | — |
| r032-1-root | end | P6 | n/a | not a repair | — |
| r032-4-packages-code-runtime | end | P1 | pass | — | — |
| r032-4-packages-code-runtime | end | P2 | pass | exit 0 | — |
| r032-4-packages-code-runtime | end | P3 | pass | 240 bookkeeping path(s) | — |
| r032-4-packages-code-runtime | end | P4 | pass | 151 emitted files, exit 2 | — |
| r032-4-packages-code-runtime | end | P5 | pass | 29 files | — |
| r032-4-packages-code-runtime | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1572 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
