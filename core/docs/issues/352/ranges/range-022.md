# Range 022 · **stop** · attempt 1

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · continued from r021 (live Store)
dsh `d5350cd42`..`b8826c9e9` · **63 commits** (18 mainline, 45 side) · 2026-07-19 → 2026-07-20
Areas changed: `.agents/notes` 19% · `examples/acp-agent` 19% · `packages/core` 8% · other 54%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.20×** · **Churn 0.00**
**Time split:** play 91.5 s · git 106.2 s · Node 188.1 s · verify 90.6 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **564.7 MiB** (+4.3 MiB) | **444.9 MiB** (+38.8 MiB) live | **0.79×** (prev 0.72×) | **40.5 MiB** | **2,288** (total 23,062) | **323.5 s** tooling (total 48.1 min) |

**Checks:** 13 pass · 3 watch: Speed branch.diff_commits >64 entries · uncontended: 15.63× baseline (no phase); Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (25 classes too narrow); Wall projection 1.08 · 3 optimize/stop: Scaling, Counters, Disk projection
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ probe list_largest −70% · ▲ sandbox.commit p95 +51% · ▼ probe glob_tree −44%
**Budget:** 23 of 202 ranges · projected total 18.1 h (budget 16.8 h) · disk 140% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,167 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 3,446 / 3,446 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 1888 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 300 bin shims, 3247 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (35 lines from 2 .gitignore files) · **166 picks** in 3 merges (163 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `b8826c9e9`** · 131 commits written for 131 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 163 · Build outputs 3 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r022-2-docs-rfc | end | `7f1b46f5cbc3` | `8c0c255be9f9` | pass (298 normalized) | pass | pass | pass | pass | n/a |
| r022-3-agents-notes | end | `5813fcf8e4fb` | `8c0c255be9f9` | pass (298 normalized) | pass | pass | pass | pass | n/a |
| r022-1-root | end | `edd3fbb9b6c0` | `85b6a978db82` | pass (299 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `d203efa5ed5e` | `null` | n/a | pass | n/a | n/a | pass | pass (115,905 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/loader-composition.spec.ts` (fails natively) · `packages/sdk/scripts/tests/scripts.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/ui/stdio/tests/readline.spec.ts` (fails natively) · `packages/ui/stdio/tests/stdio.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/examples/stdio-demo/tests/stdio-agent.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/core/agent/tests/gen-cordis-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/verify-export-jsdoc.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/load-path.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/diff.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/integration.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/read-render.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/spill/spill-policy/tests/spill-policy.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/scripted-provider.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/tools/tests/scoped.spec.ts` (fails natively) · `packages/fs/tool-fs-search/tests/tools.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively).

## 2. Activity

**4,141 calls** · **151 steps** by **8 agents + lead** on **3 Branches + main** · **219 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +581 added · 1,264 modified · −469 deleted · 21.3 MiB written · fs 2,106 : Sandbox 208 (**10 : 1**, reported only in P3)
**Execs:** 666 (JS 45 · shell 621) · 3 non-zero exits · install 0 · test runs 4 · version figures 11 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,430 | 2,119 | 311 | Committed 2,119 · Text 35 · NoSuchPath 9 · Equal 2 |
| sandbox | 1,325 | 883 | 4 | commit 217 (Committed 184, UpToDate 32, Conflict 1) · exec 666 (exit:0 663, exit:2 3) · mount 219 (Mounted 219) · status 4 · unmount 219 (Unmounted 219) |
| branch | 376 | 31 | 345 | diff_branches 17 · diff_commits 328 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,141** | **3,033** | **670** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r022-1-root | a01 a02 a03 | 45 | 715 | ✓ | — |
| r022-2-docs-rfc | a04 a05 a06 | 58 | 686 | ✓ | — |
| r022-3-agents-notes | a07 a08 | 42 | 669 | ✓ | — |
| main | lead | 6 | 218 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r022-3, a08 after a07 | 0.1 s |
| Stale clean merge | 1 / 1 | r022-3, a07 a08 | merged cleanly |
| Decoy edit | 1 / 1 | r022-3, a07 a08 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r022-1 | 13 | 6 | 7 | 0 | 0 | 72 | — |
| a02 | r022-1 | 19 | 7 | 12 | 0 | 0 | 400 | — |
| a03 | r022-1 | 13 | 5 | 8 | 0 | 0 | 243 | — |
| a04 | r022-2 | 14 | 5 | 9 | 0 | 0 | 129 | — |
| a05 | r022-2 | 24 | 9 | 15 | 0 | 0 | 83 | — |
| a06 | r022-2 | 20 | 9 | 11 | 0 | 0 | 474 | — |
| a07 | r022-3 | 17 | 6 | 11 | 0 | 0 | 373 | commit-conflict, stale-clean-merge, decoy |
| a08 | r022-3 | 25 | 5 | 20 | 0 | 0 | 296 | commit-conflict, stale-clean-merge, decoy |
| lead | main | 6 | 1 | 0 | 5 | 0 | 218 | — |
| **Total** |  | **151** | **53** | **93** | **5** | **0** | **2,288** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 116 · pnpm 1 · tsc 3 · vitest 4 · other 542

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r022-2-docs-rfc | 44 | 44 | 44 | 6 | 44 | 956 |
| r022-1-root | 33 | 33 | 33 | 13 | 33 | 891 |
| r022-3-agents-notes | 32 | 32 | 32 | 5 | 32 | 936 |
| **lead** | — | — | — | — | 131 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r022-2-docs-rfc | 0 | 1 | 1 | 1 | 63 | 63 / 63 |
| r022-3-agents-notes | 0 | 1 | 1 | 1 | 25 | 25 / 25 |
| r022-1-root | 1 | 0 | 1 | 1 | 74 | 74 / 74 |
| **lead repair** | 1 | — | 1 | — | — | 115,905 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r021) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 560.4 MiB (12.4 MiB / 512.1 MiB / 11.0 MiB / 25.0 MiB) | 564.7 MiB (13.3 MiB / 512.1 MiB / 11.5 MiB / 27.9 MiB) | +4.3 MiB |
| Version figures from | — | incremental (61,189 changed paths) | — |
| Files / directories / symlinks | 50,003 / 8,488 / 3,215 | 50,203 / 8,538 / 3,253 | +200 / +50 / +38 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 406.1 MiB | 444.9 MiB | +38.8 MiB |
| **Space amplification** (total · tracked) | 0.72× · tracked 3.51× | 0.79× · tracked 3.61× | 0.06 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.26** (1.14 / 0.27 / 1.07) | 2.66× the median range |
| **Stored per Commit** | 22.4 KiB | 17.4 KiB | — |
| Metadata share | 0.38 | 0.38 | this range 0.45 |
| History: Commits / Layers / Branches | 20,774 | 23,062 / 11 / 99 | +2,288 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 7.12 GiB (Commits 5.58 GiB · installs 1023.0 MiB · build 114.9 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 45.40 GiB / 140% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 271.6 MiB | 0.48 | +17.9 MiB |
| Metadata | 41.0 MiB | 0.07 | +4.2 MiB |
| Index rows + waste + other (live, not split) | 132.4 MiB | 0.23 | — |
| **Total = Store on disk** | **444.9 MiB** | **= 0.79** space amplification | +38.8 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 13.3 MiB | 47.9 MiB (20.8 MiB + 27.0 MiB) | 3.61× | — | 4.4 MiB | 7.7 MiB | 0.57 |
| `node_modules` | 512.1 MiB | 137.8 MiB (130.5 MiB + 7.4 MiB) | 0.27× | — | 861.3 KiB | 3.0 MiB | 0.28 |
| Build output | 11.5 MiB | 7.3 MiB (7.0 MiB + 327.2 KiB) | 0.64× | — | 920.4 KiB | 4.9 MiB | 0.18 |
| `.git` | 27.9 MiB | 118.4 MiB (113.2 MiB + 5.2 MiB) | 4.24× | — | 16.0 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 132.4 MiB | — (not divided) | — | 16.7 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 1.1 MiB | — | — | — | — | — |
| **Total** | — | **444.9 MiB** | **= 0.79×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +5,650 | — | 46,841 (derived) | 48% |
| Chunks (large files) | — (at snapshots) | +926 | — | — | 10% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 6,566 (with inodes, pooled) | — | — | 68% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +3,274 | — | — | — |

Delta: 3.2% at depth cap · 20% of refused bases stopped by budget · `node_modules` reinstall: absolute: 774887 new stored bytes for 904 raw changed bytes of 29 changed packages (857.176×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.61× (47.9 MiB for 13.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.0 KiB / 9.7 KiB / 12.5 KiB over 240 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.20× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.7 MiB stored for 1.50 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.26 (3 lanes × 564.7 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 1.9 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.5 ms / 22.6 ms (1.13×) | 2.1 ms / 3.5 ms (1.06×) | 2.7 ms / 5.4 ms (1.32×) | 25.9 ms / 97.7 ms (1.36×) | 10.6 ms / 20.1 ms (1.14×) | 1655 ms / 1655 ms (3.25×) | — (native comparison in P3; exec 38.6 ms / 854 ms) |
| SQL p50: 170 stmts | 55 stmts | 69 stmts | 290 stmts | 54 stmts | 31,383 stmts | — |

**Commit cost:** 8.16 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 582 ms p50 over 219
**Slowest:** sandbox.exec 33559 ms · sandbox.exec 29192 ms · sandbox.exec 28737 ms · checkpoint diff_commits 1.28 ms and 15.51 statements per entry (61,062 entries per page)
**Scaling:** 13 of 15 probes flat · `grep_tree` 0.53 · `fork` 1.05

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 375 ms / 375 ms | — / — | — | git / status-cold: — |
| git status (steady) | 312 ms / 446 ms | — / — | — | git / status-steady: — |
| git add | 25.0 ms / 120 ms | — / — | — | git / add: — |
| git commit (lane) | 33.0 ms / 91.0 ms | — / — | — | git / commit: — |
| lead writes main | 6269 ms / 6269 ms | — / — | — | — |
| repack | 3273 ms / 3273 ms | — / — | — | — |
| pnpm install (incremental) | 2141 ms / 2141 ms | 1648 ms / 1648 ms | 1.30× | pnpm-reinstall / cold: — |
| pnpm refresh | 2298 ms / 2298 ms | 1496 ms / 1496 ms | 1.54× | pnpm-reinstall / steady: — |
| tsc -b | 5450 ms / 5450 ms | 3721 ms / 4755 ms | 1.46× | tsc-b / cold: — |
| vitest | 10773 ms / 10773 ms | 4151 ms / 4151 ms | 2.60× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.8 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 9.7 ms / 20.2 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 716912 → 4194304 B · fs.write ≤64 KiB 832272 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2892272 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 7.71 at the first command → 9.95 after the last (max 9.95 over 6 commands) · Docker VM 1.18 → 1.47

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-022.a1)

## 5. Findings and action

### Finding 022.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.828): tree files exponent 5.851 | < 0.15 |
| Counters | oneshot_mount_unmount.vm_steps: depth exponent 0.695 | < 0.05 |
| Disk projection | 1.4 | < 0.8 |

Diagnosis pending: `finding-022.a1.json`.

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

- **a1 (`p3-main-r`, live after r21 a2, harness `46d282762b` with fix 049, daemon `44ac6c91`, addon `77597adb`): STOP verdict, terminal under the liaison's ruling (2026-10-20): advanced on optimize: #364 item 4; disk projection (environment: issue364 cargo target) and counters recorded.** Checkpoint ok, git ✓, Node 21 pass, 0 stop, 0 NOT_RUN over 4 points; repair P6 pass (769 emitted). Control `control-022.a1` passes.
  - The stop row is Disk projection 1.4: the Docker VM's free space fell 16 GB since r21, because `layerfs-issue364-cargo-target` grew to 78 GB (another session's build target; this run's data is about 3 GB). The optimize rows are `diff_commits` scaling (#364 item 4) and Counters `oneshot_mount_unmount.vm_steps` (depth exponent 0.695). In fast mode, disk-projection and counter rows are recorded, not stops.
  - The native-first check caught fix 049 before the attempt: the repair clean left cli-demo's `.typecheck/` tsbuildinfo, so the whole build failed natively.
  - Played on the range-15 binaries. The owner's switch to main's binaries (3ef00d32e5, 2026-10-20) arrived after this attempt and takes effect from range 23.
  - Final steps: repair 101 s, verify 94 s, finish 36 s. Repair build 12.6 s, install 33.6 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3446/3446; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 15.63× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint ms per entry (entries exponent 0.828): tree files exponent 5.851 | < 0.15 | optimize |
| Counters | oneshot_mount_unmount.vm_steps: depth exponent 0.695 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (25 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.45 | < 0.5 | pass |
| Reinstall growth | absolute: 774887 new stored bytes for 904 raw changed bytes of 29 changed packages (857.176×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0319 (budget 0.1996) | < 0.1 | pass |
| Range growth | 40.5 MiB, 1.16× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 1.4 | < 0.8 | stop |
| Wall projection | 1.08 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 131 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 163 · build 3; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.20× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 151 | 152 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 2288 | 2167 |
| Workspaces (one-shot share) | 219 (0.99) | 92 (0.978) |
| Reads | 279 | 279 |
| Reconcile writes | 211 | 211 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 17 | 17.24 | 291.48 | 291.48 | 344.92 | 1.12× | 5.81× | 0.30 | 0.48 | 216 / 22,086 / 0 | — | 0.0724 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 283.66 | 283.66 | 283.66 | 283.66 | no baseline | no baseline | 0.54 | 1.03 | 6,522 / 249,730 / 0 | — | 1.3072 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 322 | 271.38 | 309.43 | 442.65 | 667.40 | 15.63× | 12.08× | 3.51 | 7.05 | 3,355 / 521,742 / 0 | — | 1.4066 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.66 | 2.82 | 2.82 | 4.65 | 0.96× | 2.07× | -0.81 | -1.48 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.87 | 0.87 | 0.87 | 1.11 | no baseline | no baseline | 0.32 | 0.60 | 70 / 1,298 / 0 | — | 0.0435 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 1654.50 | 1654.50 | 1654.50 | 2221.61 | 3.25× | 3.25× | -0.38 | -0.49 | 31,383 / 2,513,563 / 4,300 | — | 3.8122 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.41 | 1.41 | 1.41 | 1.41 | 1.77× | 1.77× | 0.21 | 0.34 | 35 / 517 / 0 | — | 0.0088 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 5.87 | 5.87 | 5.87 | 5.87 | 2.13× | 2.13× | 0.26 | 0.63 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 49.13 | 49.13 | 49.13 | 49.13 | 2.58× | 2.58× | 0.57 | 0.87 | 188 / 15,094 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 15 | 13.71 | 29.13 | 29.13 | 29.50 | 1.57× | 2.46× | 0.35 | 0.47 | 294 / 26,797 / 0 | — | 0.0248 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 13 | 7.54 | 11.18 | 11.18 | 11.49 | 1.17× | 1.59× | 0.02 | 0.17 | 125 / 6,686 / 0 | — | 0.014 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 1 | 14.68 | 14.68 | 14.68 | 14.68 | 1.12× | 1.12× | — | — | 192 / 9,509 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 33 | 8.97 | 14.56 | 14.79 | 14.86 | 1.01× | 1.12× | -1.14 | -1.98 | 254 / 14,055 / 0 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 15 | 7.31 | 12.56 | 12.56 | 13.45 | 1.09× | 1.35× | -0.19 | -0.55 | 120 / 6,527 / 0 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 55 | 8.88 | 21.60 | 36.17 | 62.57 | 1.05× | 1.46× | -0.46 | -0.71 | 253 / 13,397 / 0 | — | 0.0022 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 69 | 6.47 | 10.67 | 13.01 | 18.83 | 0.92× | 1.08× | 0.04 | 0.08 | 115 / 5,228 / 0 | — | 0.0014 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 9 | 6.29 | 8.64 | 8.64 | 10.66 | 1.12× | 1.38× | 0.56 | 0.83 | 188 / 8,340 / 0 | — | 0.0237 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 7 | 5.18 | 5.59 | 5.59 | 8.65 | 0.96× | 0.75× | 0.55 | 1.00 | 126 / 5,725 / 0 | — | 0.0194 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 9 | 8.88 | 12.98 | 12.98 | 13.73 | 1.44× | 1.83× | 0.78 | 1.37 | 241 / 11,744 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 9 | 6.44 | 7.19 | 7.19 | 8.64 | 0.97× | 1.01× | 0.67 | 1.22 | 171 / 7,399 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 5 | 9.71 | 10.41 | 10.41 | 10.42 | 1.83× | 1.51× | 0.43 | 0.68 | 192 / 9,429 / 0 | — | 0.0015 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 2 | 3.08 | 3.08 | 3.08 | 7.16 | 0.58× | 0.51× | -0.46 | -0.69 | 95 / 2,608 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 3 | 1.45 | 1.45 | 1.45 | 3.43 | 1.19× | 1.11× | -0.24 | -0.17 | 33 / 2,144 / 0 | — | 1.45 ms per file | — |
| fs.glob | 17–64 files · contended | 5 | 3.31 | 5.61 | 5.61 | 8.10 | 1.46× | 2.34× | -0.29 | -0.37 | 90 / 8,570 / 0 | — | 0.1368 ms per file | — |
| fs.glob | 17–64 files · uncontended | 4 | 2.48 | 5.58 | 5.58 | 14.18 | 1.28× | 2.13× | -0.89 | -1.33 | 43 / 3,489 / 0 | — | 0.0775 ms per file | — |
| fs.glob | 2–4 files · contended | 3 | 2.41 | 2.41 | 2.41 | 2.96 | 1.73× | 1.73× | -0.20 | -0.24 | 85 / 3,871 / 0 | — | 0.6837 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 1.55 | 1.55 | 1.55 | 2.26 | 1.03× | 0.78× | -0.17 | -0.38 | 36 / 1,923 / 0 | — | 0.388 ms per file | — |
| fs.glob | 5–16 files · contended | 11 | 3.47 | 5.07 | 5.07 | 6.57 | 2.68× | 3.58× | 0.52 | 0.96 | 90 / 6,465 / 0 | — | 0.5039 ms per file | — |
| fs.glob | 5–16 files · uncontended | 6 | 2.36 | 4.48 | 4.48 | 6.65 | 1.22× | 1.94× | 0.15 | 0.27 | 58 / 4,367 / 0 | — | 0.3536 ms per file | — |
| fs.glob | >64 files · contended | 2 | 4.37 | 4.37 | 4.37 | 4.87 | 1.06× | 1.06× | -1.53 | -2.66 | 92 / 7,983 / 0 | — | 0.054 ms per file | — |
| fs.glob | >64 files · uncontended | 5 | 19.80 | 20.47 | 20.47 | 32.31 | 3.78× | 2.68× | 0.99 | 1.65 | 314 / 30,079 / 0 | — | 0.0383 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 2.48 | 2.48 | 2.48 | 2.48 | 1.96× | 1.96× | 0.15 | 0.38 | 67 / 1,758 / 0 | — | 2.478 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 4 | 6.80 | 15.30 | 15.30 | 18.96 | 1.26× | 2.83× | 0.09 | 0.32 | 334 / 17,895 / 0 | — | 0.3577 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 10.40 | 19.41 | 19.41 | 28.95 | 2.89× | 4.48× | -0.16 | 0.04 | 210 / 11,706 / 0 | — | 0.3537 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 2.26 | 2.26 | 2.26 | 2.83 | 0.97× | 0.79× | -0.18 | -0.24 | 103 / 4,059 / 0 | — | 0.7523 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 4 | 2.49 | 2.51 | 2.51 | 2.61 | 1.31× | 0.73× | -0.06 | 0.05 | 61 / 2,935 / 0 | — | 0.6528 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 14 | 9.21 | 12.96 | 12.96 | 13.22 | 3.86× | 3.05× | 0.85 | 1.66 | 194 / 9,518 / 0 | — | 1.0969 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 7 | 5.10 | 6.29 | 6.29 | 7.82 | 1.62× | 1.83× | -0.09 | -0.07 | 117 / 7,302 / 0 | — | 0.5245 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 6 | 21.33 | 51.12 | 51.12 | 88.35 | 1.40× | 3.35× | -0.43 | -0.61 | 628 / 35,406 / 0 | — | 0.0817 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 2 | 8.32 | 8.32 | 8.32 | 27.60 | 0.72× | 0.53× | -1.17 | -2.02 | 189 / 7,702 / 0 | — | 0.0478 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 1.58 | 1.58 | 1.58 | 1.58 | 0.89× | 0.89× | -0.44 | -0.39 | 37 / 2,018 / 0 | — | 1.576 ms per entrie | — |
| fs.list | 17–64 entries · contended | 8 | 3.44 | 6.30 | 6.30 | 15.30 | 1.91× | 3.02× | 0.41 | 0.79 | 80 / 7,605 / 0 | — | 0.142 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 8 | 4.22 | 5.13 | 5.13 | 5.40 | 1.75× | 2.04× | 0.41 | 0.82 | 72 / 7,409 / 0 | — | 0.1027 ms per entrie | — |
| fs.list | 2–4 entries · contended | 3 | 2.46 | 2.46 | 2.46 | 2.53 | 1.22× | 1.22× | 0.06 | 0.08 | 47 / 3,392 / 0 | — | 1.23 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 6 | 1.73 | 2.15 | 2.15 | 2.19 | 0.97× | 0.91× | -0.08 | -0.22 | 39 / 1,948 / 0 | — | 0.574 ms per entrie | — |
| fs.list | 5–16 entries · contended | 11 | 2.25 | 4.35 | 4.35 | 14.83 | 1.15× | 1.76× | 0.33 | 0.74 | 91 / 4,620 / 0 | — | 0.4354 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 9 | 2.14 | 4.15 | 4.15 | 4.55 | 1.32× | 2.03× | -0.06 | 0.02 | 46 / 3,326 / 0 | — | 0.3457 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 2 | 1.65 | 1.65 | 1.65 | 2.85 | 0.96× | 0.96× | -1.91 | -3.17 | 41 / 2,593 / 0 | — | 0.0035 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 2 | 2.06 | 2.06 | 2.06 | 12.53 | 1.73× | 1.73× | -0.63 | -1.48 | 56 / 2,203 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 2 | 2.38 | 2.38 | 2.38 | 4.53 | no baseline | no baseline | -1.38 | -2.73 | 46 / 2,411 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 2.17 | 2.17 | 2.17 | 2.17 | 0.96× | 0.96× | 0.16 | 0.25 | 49 / 4,099 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 16 | 1.96 | 2.49 | 2.49 | 11.38 | 0.99× | 1.05× | 0.02 | 0.10 | 73 / 3,568 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 24 | 1.90 | 3.11 | 3.17 | 3.47 | 1.06× | 1.09× | -0.13 | -0.10 | 50 / 2,092 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 124 | 11.16 | 30.40 | 47.62 | 62.48 | 1.39× | 2.26× | -0.04 | 0.04 | 318 / 18,650 / 0 | — | 11.16 ms per file | commit |
| fs.rm | 1 files · uncontended | 337 | 8.49 | 12.13 | 18.24 | 40.16 | 1.26× | 1.15× | 0.41 | 0.88 | 145 / 8,624 / 0 | — | 8.486 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 1.72 | 1.72 | 1.72 | 1.72 | 1.20× | 1.20× | 0.02 | 0.30 | 45 / 2,684 / 0 | — | 0.0094 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 4 | 1.81 | 2.12 | 2.12 | 3.02 | 1.11× | 1.10× | -0.08 | 0.09 | 52 / 2,875 / 0 | — | 0.0056 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.39 | 2.39 | 2.39 | 2.39 | 2.01× | 2.01× | 0.66 | 1.05 | 48 / 3,613 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 11 | 2.24 | 3.05 | 3.05 | 4.00 | 1.31× | 1.61× | -0.25 | -0.31 | 58 / 3,102 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 8 | 1.76 | 1.98 | 1.98 | 2.12 | 1.01× | 0.96× | -0.11 | -0.21 | 34 / 2,310 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 4 | 1.40 | 2.92 | 2.92 | 3.74 | 1.00× | 1.29× | -0.53 | -1.07 | 50 / 3,280 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 12 | 1.36 | 1.93 | 1.93 | 2.19 | 0.91× | 0.88× | -0.00 | 0.03 | 35 / 1,941 / 0 | — | 0.0003 ms per byte | — |
| fs.write | ≤1 KiB · contended | 88 | 9.74 | 15.11 | 25.33 | 118.25 | 1.33× | 1.12× | -0.07 | 0.14 | 261 / 14,951 / 0 | — | 0.0142 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 114 | 7.04 | 10.94 | 15.54 | 21.37 | 1.20× | 1.21× | 0.22 | 0.51 | 134 / 5,812 / 0 | — | 0.009 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 5 | 11.34 | 15.38 | 15.38 | 27.65 | 1.02× | 1.04× | -0.08 | -0.07 | 283 / 15,160 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 21 | 10.63 | 14.59 | 14.59 | 15.04 | 1.14× | 1.53× | 0.19 | 0.33 | 161 / 5,941 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 172 | 10.93 | 28.75 | 60.88 | 98.95 | 1.17× | 1.80× | 0.22 | 0.51 | 307 / 15,625 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 286 | 8.58 | 14.48 | 23.03 | 31.98 | 1.22× | 1.48× | 0.18 | 0.40 | 157 / 6,594 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 384 | 9.93 | 28.50 | 50.77 | 201.64 | 1.16× | 1.73× | 0.11 | 0.33 | 295 / 16,196 / 0 | — | 0.0043 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 374 | 7.11 | 13.78 | 21.06 | 81.11 | 1.13× | 1.34× | 0.12 | 0.30 | 149 / 5,968 / 0 | — | 0.0021 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.01 | 1.01 | 1.01 | 1.01 | 1.71× | 1.71× | 0.50 | 0.82 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 58 | 38.98 | 85.72 | 97.74 | 107.75 | 1.71× | 2.04× | -0.18 | -0.25 | 609 / 56,733 / 47 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 52 | 30.95 | 63.71 | 107.29 | 333.53 | 1.36× | 1.63× | -0.04 | 0.04 | 443 / 32,466 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 17 | 3.45 | 6.28 | 6.28 | 7.96 | 1.06× | 1.51× | 0.17 | 0.34 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 15 | 3.43 | 4.92 | 4.92 | 6.67 | 1.03× | 1.05× | 0.04 | 0.11 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 11 | 18.69 | 23.59 | 23.59 | 25.90 | 2.16× | 1.38× | 0.72 | 1.21 | 214 / 12,605 / 0 | — | 18.69 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 8 | 9.07 | 9.86 | 9.86 | 10.74 | 1.20× | 0.95× | 0.13 | 0.27 | 104 / 4,334 / 0 | — | 9.074 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 673.28 | 673.28 | 673.28 | 673.28 | 13.39× | 13.39× | 0.43 | 1.20 | 12,358 / 610,090 / 0 | — | 673.277 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 2 | 20.74 | 20.74 | 20.74 | 99.43 | no baseline | no baseline | -1.51 | -2.32 | 495 / 30,174 / 0 | — | 1.2201 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 9 | 18.64 | 37.01 | 37.01 | 38.26 | 1.22× | 1.76× | 0.43 | 0.72 | 332 / 17,526 / 2 | — | 7.7825 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 15 | 12.29 | 15.59 | 15.59 | 17.46 | 1.24× | 1.39× | -0.07 | -0.14 | 156 / 7,427 / 0 | — | 4.6283 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 6 | 17.94 | 42.97 | 42.97 | 43.63 | 1.20× | 2.87× | -0.08 | 0.04 | 293 / 15,411 / 0 | — | 2.9897 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 6 | 15.13 | 19.79 | 19.79 | 36.66 | 1.34× | 1.75× | -0.36 | -0.67 | 212 / 10,773 / 0 | — | 2.443 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 105.56 | 105.56 | 105.56 | 111.45 | no baseline | no baseline | -1.98 | -3.49 | 1,322 / 188,484 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 81.87 | 585.55 | 585.55 | 15452.36 | 1.19× | 8.49× | 0.17 | 0.42 | 341 / 18,657 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 232 | 42.16 | 883.86 | 1149.58 | 2748.50 | 1.04× | 2.55× | -0.40 | 0.00 | — | 2576.70 | — | — |
| sandbox.exec | 0 files · uncontended | 133 | 34.65 | 460.25 | 752.84 | 8632.50 | 1.28× | 1.79× | 0.06 | 0.06 | — | 2,601 | — | — |
| sandbox.exec | 1 files · contended | 43 | 34.96 | 51.87 | 62.13 | 62.47 | 1.11× | 0.88× | 0.14 | 0.31 | — | 4.30 | 34.959 ms per file | — |
| sandbox.exec | 1 files · uncontended | 22 | 33.40 | 50.64 | 51.53 | 52.93 | 1.10× | 0.86× | 0.01 | -0.01 | — | 4 | 33.402 ms per file | — |
| sandbox.exec | 17–64 files · contended | 20 | 68.66 | 135.13 | 135.13 | 160.53 | 1.07× | 2.10× | 0.71 | 1.32 | — | 40 | 3.4331 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 3 | 72.04 | 72.04 | 72.04 | 79.11 | 1.05× | 1.04× | 0.05 | 0.10 | — | 97 | 3.9554 ms per file | — |
| sandbox.exec | 2–4 files · contended | 45 | 37.01 | 50.49 | 55.68 | 109.10 | 0.98× | 0.81× | 0.06 | 0.25 | — | 9.30 | 14.245 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 51 | 33.11 | 77.36 | 80.43 | 91.39 | 1.01× | 1.47× | 0.31 | 0.52 | — | 10.30 | 11.862 ms per file | — |
| sandbox.exec | 5–16 files · contended | 41 | 38.58 | 75.63 | 77.40 | 80.31 | 0.74× | 1.30× | -0.38 | -0.47 | — | 15.60 | 5.5496 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 27 | 33.97 | 53.42 | 55.13 | 72.42 | 0.65× | 0.74× | 0.01 | 0.14 | — | 14.30 | 6.1218 ms per file | — |
| sandbox.exec | — · contended | 14 | 2910.97 | 28737.38 | 28737.38 | 29192.48 | no baseline | no baseline | 0.77 | 1.40 | — | 36258.70 | — | — |
| sandbox.exec | — · uncontended | 25 | 295.54 | 10587.75 | 12547.76 | 33559.48 | 0.59× | 2.22× | 0.24 | 0.05 | — | 33,459 | — | — |
| sandbox.mount | — · contended | 104 | 10.65 | 20.45 | 31.18 | 45.78 | 1.06× | 1.33× | 0.18 | 0.34 | 55 / 1,547 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 105 | 10.46 | 16.07 | 21.53 | 45.80 | 1.14× | 1.16× | 0.21 | 0.40 | 45 / 1,337 / 80 | — | — | sandbox.mount.bind |
| sandbox.status | — · uncontended | 4 | 4.17 | 4.44 | 4.44 | 33.44 | no baseline | no baseline | -0.42 | -0.86 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 93 | 10.17 | 17.39 | 28.16 | 38.85 | 1.22× | 1.41× | 0.29 | 0.62 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 116 | 9.77 | 28.97 | 142.06 | 228.84 | 1.07× | 2.08× | 0.16 | 0.38 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 17 | 0.0 KiB | 898.6 KiB | 4,004 | ok 17 |
| branch.diff_commits | branch | 328 | 0.0 KiB | 17.9 MiB | 61,694 | ok 328 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.9 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 214 | 3.1 MiB | 0.0 KiB | 225 | Committed 214 |
| fs.diff_files | fs | 46 | 0.0 KiB | 458.0 KiB | 37 | Text 35, NoSuchPath 9, Equal 2 |
| fs.glob | fs | 51 | 0.0 KiB | 49.7 KiB | 624 | ok 51 |
| fs.grep | fs | 55 | 0.0 KiB | 186.1 KiB | 816 | ok 55 |
| fs.list | fs | 58 | 0.0 KiB | 135.7 KiB | 1,032 | ok 58 |
| fs.read | fs | 52 | 0.0 KiB | 181.7 KiB | 52 | ok 52 |
| fs.rm | fs | 461 | 0.0 KiB | 0.0 KiB | 461 | Committed 461 |
| fs.stat | fs | 49 | 0.0 KiB | 10.4 KiB | 49 | ok 49 |
| fs.write | fs | 1,444 | 17.8 MiB | 0.0 KiB | 1,444 | Committed 1444 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 217 | 0.0 KiB | 0.0 KiB | 0 | Committed 184, UpToDate 32, Conflict 1 |
| sandbox.exec | sandbox | 666 | 3.7 MiB | 3.7 MiB | 0 | exit:0 663, exit:2 3 |
| sandbox.mount | sandbox | 219 | 0.0 KiB | 0.0 KiB | 0 | Mounted 219 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 219 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 219 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 1.18 · end 1.47.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.295 | 15.52 · 1.295 · 0.973 · 0.821 · 1.468 | 1.68–1.68 | statements 24, vm_steps 793, fullscan_steps 0, sorts 0, returned_rows 73 |
| read | 0.955 | 1.194 · 0.955 · 1.016 · 0.804 · 0.776 | 1.68–1.68 | statements 14, vm_steps 574, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_small | 0.875 | 0.917 · 0.938 · 0.875 · 0.875 · 0.858 | 1.68–1.68 | statements 14, vm_steps 583, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_largest | 1.785 | 2.386 · 1.785 · 1.662 · 1.771 · 1.884 | 1.55–1.68 | statements 44, vm_steps 2644, fullscan_steps 0, sorts 0, returned_rows 319 |
| grep_scoped | 0.937 | 1.337 · 0.974 · 0.929 · 0.815 · 0.937 | 1.55–1.55 | statements 19, vm_steps 729, fullscan_steps 0, sorts 0, returned_rows 72 |
| glob_scoped | 0.9 | 0.852 · 0.901 · 1.262 · 0.9 · 0.792 | 1.55–1.55 | statements 13, vm_steps 562, fullscan_steps 0, sorts 0, returned_rows 62 |
| grep_tree | 3771.736 | 4043.734 · 4343.806 · 3771.736 · 3729.43 · 3738.875 | 1.43–1.55 | statements 42830, vm_steps 3561917, fullscan_steps 0, sorts 0, returned_rows 374712 |
| glob_tree | 4.814 | 5.869 · 4.814 · 4.983 · 4.788 · 4.809 | 1.43–1.43 | statements 91, vm_steps 10243, fullscan_steps 0, sorts 0, returned_rows 1267 |
| diff_files | 3.344 | 3.344 · 2.941 · 3.199 · 3.362 · 3.437 | 1.43–1.43 | statements 66, vm_steps 3328, fullscan_steps 0, sorts 0, returned_rows 378 |
| list_commits | 0.813 | 1.656 · 0.813 · 0.775 · 0.845 · 0.792 | 1.43–1.43 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.905 | 2.542 · 1.81 · 1.767 · 1.92 · 1.905 | 1.43–1.43 | statements 58, vm_steps 2306, fullscan_steps 0, sorts 0, returned_rows 285 |
| fork | 0.482 | 0.511 · 0.757 · 0.482 · 0.336 · 0.4 | 1.43–1.43 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 26.402 | 26.402 · 23.727 · 27.168 · 26.503 · 24.705 | 1.43–1.43 | statements 450, vm_steps 22404, fullscan_steps 4, sorts 8, returned_rows 1764 |
| oneshot_mount_unmount | 13.654 | 18.473 · 13.586 · 13.654 · 15.111 · 13.42 | 1.43–1.47 | statements 58, vm_steps 1988, fullscan_steps 80, sorts 2, returned_rows 207 |
| oneshot_commit | 60.138 | 69.598 · 60.138 · 56.023 · 64.625 · 58.908 | 1.47–1.47 | statements 157, vm_steps 11515, fullscan_steps 80, sorts 2, returned_rows 937 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.43–1.47 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 323.5 s** (tooling): play 92.9 · consolidate 98.4 · verify 100.4 · probes 20.5 · tests 0.0 · seal + snapshot 0.0 · report 11.3

323.51 s tooling: prepare 1.45 · play 91.50 · consolidate 98.36 · verify 90.64 (diff_commits) · version walk 9.81 · probes 20.49 · metrics 1.33 · Store allocation 0.27 · report 0.50

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T20:14:53.169Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 15.63× baseline (no phase); Scaling: branch.diff_commits checkpoint ms per entry (entries exponent 0.828): tree files exponent 5.851; Counters: oneshot_mount_unmount.vm_steps: depth exponent 0.695; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (25 classes too narrow); Disk projection: 1.4; Wall projection: 1.08 |

### G. Evidence

- `~/lfs-history/metrics/range-022.a1.json`
- trace `~/lfs-history/runs/p3-main-r/trace/range-022.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-r/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r022-2-docs-rfc | 956 | 193.6 KiB |
| r022-1-root | 891 | 218.7 KiB |
| r022-3-agents-notes | 936 | 258.5 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 312.0 | 1,841 |
| `git diff --stat` | 32.0 | 1,823 |
| `git add -f` | 25.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 33.0 | 1,834 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r022-2-docs-rfc | end | P1 | pass | — | — |
| r022-2-docs-rfc | end | P2 | pass | exit 0 | — |
| r022-2-docs-rfc | end | P3 | pass | 180 bookkeeping path(s) | — |
| r022-2-docs-rfc | end | P4 | pass | 324 emitted files, exit 2 | — |
| r022-2-docs-rfc | end | P5 | pass | 63 files | — |
| r022-2-docs-rfc | end | P6 | n/a | not a repair | — |
| r022-3-agents-notes | end | P1 | pass | — | — |
| r022-3-agents-notes | end | P2 | pass | exit 0 | — |
| r022-3-agents-notes | end | P3 | pass | 180 bookkeeping path(s) | — |
| r022-3-agents-notes | end | P4 | pass | 100 emitted files, exit 2 | — |
| r022-3-agents-notes | end | P5 | pass | 25 files | — |
| r022-3-agents-notes | end | P6 | n/a | not a repair | — |
| r022-1-root | end | P1 | pass | — | — |
| r022-1-root | end | P2 | pass | exit 0 | — |
| r022-1-root | end | P3 | n/a | an install, not a refresh | — |
| r022-1-root | end | P4 | pass | 251 emitted files, exit 2 | — |
| r022-1-root | end | P5 | pass | 74 files | — |
| r022-1-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (769 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
