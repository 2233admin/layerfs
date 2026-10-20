# Range 043 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r042 (live Store)
dsh `36e814114`..`5b5f089bd` · **66 commits** (2 mainline, 64 side) · 2026-07-27 → 2026-07-27
Areas changed: `packages/core` 19% · `packages/client` 11% · `.agents/notes` 8% · other 62%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 18 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.23×** · **Churn 0.00**
**Time split:** play 117.2 s · git 133.9 s · Node 204.8 s · verify 9.1 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **794.8 MiB** (+2.4 MiB) | **1.20 GiB** (+41.9 MiB) live | **1.54×** (prev 1.49×) | **42.8 MiB** | **1,464** (total 51,610) | **285.5 s** tooling (total 139.1 min) |

**Checks:** 15 pass · 3 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.49× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.314) and statements per entry does not rise (0.028): the fixed and per-entry parts cannot be separated; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe diff_files +45% · ▲ probe read +44% · ▼ fs.read p95 −44%
**Budget:** 44 of 202 ranges · projected total 15.6 h (budget 16.8 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **457 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 2,838 / 2,838 outcomes as planned |
| Conflicts | **2 / 2 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2902 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 405 bin shims, 4422 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (51 lines from 3 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | as expected |
| Milestone | — |
| Git | **HEAD = checkpoint `5b5f089bd`** · 91 commits written for 91 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r043-2-agents-notes | end | `bd4bc48b9a14` | `f11b090f83f2` | pass (408 normalized) | pass | pass | pass | pass | n/a |
| r043-1-packages-core | end | `4242182fc15a` | `f11b090f83f2` | pass (408 normalized) | pass | pass | pass | pass | n/a |
| r043-3-packages-client | end | `55f3a3070570` | `f11b090f83f2` | pass (408 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `df1177102ed0` | `null` | n/a | pass | n/a | n/a | pass | pass (137,540 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/tasks/tasks/tests/tasks.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/tasks/tool-tasks/tests/tool-tasks.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/goal/tool-goal/tests/tool-goal.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/plan-mode.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively) · `packages/acp/acp/tests/dispose.spec.ts` (fails natively) · `packages/workflow/tool-ralph/tests/integration.spec.ts` (fails natively) · `packages/session-query/session-query/tests/search-helpers.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/loader-composition.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/transport-recovery.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/retry.spec.ts` (fails natively).

## 2. Activity

**3,640 calls** · **200 steps** by **7 agents + lead** on **3 Branches + main** · **250 Workspaces** (100% one-shot, 0 open at end)
**File changes:** +43 added · 1,311 modified · −49 deleted · 29.9 MiB written · fs 1,283 : Sandbox 120 (**11 : 1**, reported only in P3)
**Execs:** 689 (JS 70 · shell 619) · 3 non-zero exits · install 0 · test runs 4 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,736 | 1,297 | 439 | Committed 1,288 · Text 59 · NoSuchPath 5 · Equal 2 · UpToDate 9 |
| sandbox | 1,441 | 937 | 4 | commit 248 (Committed 190, UpToDate 57, Conflict 1) · exec 689 (exit:0 686, exit:2 3) · mount 250 (Mounted 250) · status 4 · unmount 250 (Unmounted 250) |
| branch | 452 | 31 | 421 | diff_branches 17 · diff_commits 404 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,640** | **2,265** | **875** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r043-1-packages-core | a01 a02 a03 | 67 | 446 | ✓ | — |
| r043-2-agents-notes | a04 a05 a06 | 69 | 416 | ✓ | — |
| r043-3-packages-client | a07 a08 | 58 | 425 | ✓ | — |
| main | lead | 6 | 177 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r043-2, a05 after a04 | 0.1 s |
| Stale clean merge | 0 / 0 | — | — |
| Decoy edit | 1 / 1 | r043-2, a06 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r043-1 | 1 | 1 | 0 | 0 | 0 | 4 | — |
| a02 | r043-1 | 66 | 33 | 33 | 0 | 0 | 442 | — |
| a04 | r043-2 | 64 | 32 | 32 | 0 | 0 | 414 | commit-conflict, decoy |
| a05 | r043-2 | 4 | 0 | 4 | 0 | 0 | 0 | commit-conflict |
| a06 | r043-2 | 1 | 1 | 0 | 0 | 0 | 2 | decoy |
| a07 | r043-3 | 4 | 2 | 2 | 0 | 0 | 93 | — |
| a08 | r043-3 | 54 | 27 | 27 | 0 | 0 | 332 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 177 | — |
| **Total** |  | **200** | **97** | **98** | **5** | **0** | **1,464** | **2** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 141 · pnpm 1 · tsc 3 · vitest 4 · other 540

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r043-1-packages-core | 48 | 48 | 48 | 3 | 48 | 1,001 |
| r043-2-agents-notes | 44 | 44 | 44 | 1 | 44 | 950 |
| r043-3-packages-client | 42 | 42 | 42 | 0 | 42 | 908 |
| **lead** | — | — | — | — | 91 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r043-2-agents-notes | 0 | 1 | 1 | 1 | 26 | 26 / 26 |
| r043-1-packages-core | 0 | 1 | 1 | 1 | 84 | 84 / 84 |
| r043-3-packages-client | 0 | 1 | 1 | 1 | 129 | 129 / 129 |
| **lead repair** | 1 | — | 1 | — | — | 137,540 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r042) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 792.4 MiB (23.8 MiB / 656.4 MiB / 21.7 MiB / 90.5 MiB) | 794.8 MiB (23.7 MiB / 656.4 MiB / 21.6 MiB / 93.1 MiB) | +2.4 MiB |
| Version figures from | — | incremental (73,506 changed paths) | — |
| Files / directories / symlinks | 63,647 / 9,764 / 4,430 | 63,623 / 9,764 / 4,430 | −24 / +0 / +0 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 1.15 GiB | 1.20 GiB | +41.9 MiB |
| **Space amplification** (total · tracked) | 1.49× · tracked 4.95× | 1.54× · tracked 5.08× | 0.05 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.41** (1.61 / 0.23 / 1.20) | 1.16× the median range |
| **Stored per Commit** | 29.5 KiB | 29.3 KiB | — |
| Metadata share | 0.42 | 0.42 | this range 0.40 |
| History: Commits / Layers / Branches | 50,146 | 51,610 / 28 / 603 | +1,464 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.61 GiB (Commits 8.47 GiB · installs 874.0 MiB · build 101.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 40.90 GiB / 41% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 709.9 MiB | 0.89 | +22.2 MiB |
| Metadata | 108.2 MiB | 0.14 | +3.2 MiB |
| Index rows + waste + other (live, not split) | 405.8 MiB | 0.51 | — |
| **Total = Store on disk** | **1.20 GiB** | **= 1.54** space amplification | +41.9 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 23.7 MiB | 120.2 MiB (65.5 MiB + 54.7 MiB) | 5.08× | — | 2.5 MiB | 5.8 MiB | 0.43 |
| `node_modules` | 656.4 MiB | 211.8 MiB (186.7 MiB + 25.1 MiB) | 0.32× | — | 1015.6 KiB | 0.0 KiB | — |
| Build output | 21.6 MiB | 21.7 MiB (20.1 MiB + 1.6 MiB) | 1.00× | — | 1.1 MiB | 8.0 MiB | 0.14 |
| `.git` | 93.1 MiB | 434.6 MiB (416.3 MiB + 18.3 MiB) | 4.67× | — | 20.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 405.8 MiB | — (not divided) | — | 16.5 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 29.9 MiB | — | — | — | — | — |
| **Total** | — | **1.20 GiB** | **= 1.54×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +6,071 | — | 0 (derived) | 54% |
| Chunks (large files) | — (at snapshots) | +1,350 | — | — | 17% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 5,085 (with inodes, pooled) | — | — | 59% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,434 | — | — | — |

Delta: 2.7% at depth cap · 26% of refused bases stopped by budget · `node_modules` reinstall: no changed packages: 927141 new stored bytes

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.08× (120.2 MiB for 23.7 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.4 KiB / 7.2 KiB / 11.8 KiB over 225 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.23× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.1 MiB stored for 1.92 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.51 (3 lanes × 794.8 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.2 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.3 ms / 18.9 ms (1.03×) | 2.4 ms / 3.4 ms (1.17×) | 3.1 ms / 6.1 ms (1.69×) | 22.4 ms / 54.8 ms (1.23×) | 9.1 ms / 14.0 ms (0.79×) | 349 ms / 349 ms (3.79×) | — (native comparison in P3; exec 38.7 ms / 858 ms) |
| SQL p50: 178 stmts | 53 stmts | 68 stmts | 240 stmts | 45 stmts | 10,080 stmts | — |

**Commit cost:** 7.80 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 721 ms p50 over 250
**Slowest:** sandbox.exec 34704 ms · sandbox.exec 26166 ms · sandbox.exec 25293 ms · checkpoint diff_commits 0.10 ms and 1.54 statements per entry (73,283 entries per page)
**Scaling:** 14 of 15 probes flat · `grep_tree` 0.22

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 330 ms / 330 ms | — / — | — | git / status-cold: — |
| git status (steady) | 416 ms / 563 ms | — / — | — | git / status-steady: — |
| git add | 36.0 ms / 108 ms | — / — | — | git / add: — |
| git commit (lane) | 42.0 ms / 71.0 ms | — / — | — | git / commit: — |
| lead writes main | 3654 ms / 3654 ms | — / — | — | — |
| repack | 3154 ms / 3154 ms | — / — | — | — |
| pnpm install (incremental) | — / — | 3534 ms / 3534 ms | — | pnpm-reinstall / cold: — |
| pnpm refresh | 2959 ms / 2959 ms | 1764 ms / 1764 ms | 1.68× | pnpm-reinstall / steady: — |
| tsc -b | 5952 ms / 5952 ms | 4266 ms / 7352 ms | 1.40× | tsc-b / cold: — |
| vitest | 10066 ms / 10066 ms | 6664 ms / 6664 ms | 1.51× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 2.5 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.8 ms / 19.5 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 12392 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2645072 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 4.29 at the first command → 5.35 after the last (max 7.17 over 9 commands) · Docker VM 1.54 → 1.53

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-043.a1)

## 5. Findings and action

### Finding 043.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |

Diagnosis pending: `finding-043.a1.json`.

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

- **a1 (`p3-main-v`, live after r42 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 18 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,955 emitted). Control `control-043.a1` passes. Report check F1–F8 PASS.
- **The only optimize row** is the r41–r42 Counters `merge.returned_rows` row (chain-bounded): 2,513 rows against the first period's 1,941 (1.295×, bound period 8). Recorded, not acted on (fast mode).
- **Fix 058 exempted** `.sessions/session-query.db` (session test output, gitignored by the checkpoint; not a LayerFS-relevant path).
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 14.49×). Merge p50 349 ms (3.79×, back near r23–r41's band after r42's 5.60×). One-shot Commit 1.23×, write 1.03× (8.3 ms), mount 0.79×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 5.0–7.2.
- Final steps: lead 3 s; lanes 18 s + 17 s + 12 s + 12 s + 73 s (cuts at plan orders 14, 28, 42 and 55); repair 111 s (alarm 200 s); verify 12 s; finish 39 s. Repair install 34.7 s, build 21.8 s, tests 3.4 s.
- Watch items: index rows + waste + other 405.8 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 12.14 ms per file over 36 calls, 207 statements and 15,447 VM steps per call (1.81×); contended 12.45 ms over 13 (339 statements, process-wide; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2838/2838; conflicts 2/2; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.49× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.314) and statements per entry does not rise (0.028): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.402 | < 0.5 | pass |
| Reinstall growth | no changed packages: 927141 new stored bytes | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0272 (budget 0.2581) | < 0.1 | pass |
| Range growth | 42.8 MiB, 1.27× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.92 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 91 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 18 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.23× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 200 | 200 |
| Lanes / agents | 3 / 7 | 3 / 8 |
| LayerFS Commits | 1464 | 1315 |
| Workspaces (one-shot share) | 250 (1.00) | 97 (0.99) |
| Reads | 392 | 392 |
| Reconcile writes | 168 | 168 |
| Left out (not played in this phase) | tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 17 | 16.07 | 395.11 | 395.11 | 409.92 | 0.99× | 7.63× | -0.32 | -0.12 | 208 / 25,184 / 0 | — | 0.0681 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 10.43 | 10.43 | 10.43 | 10.43 | no baseline | no baseline | — | — | 158 / 19,390 / 0 | — | 0.4346 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 3 | 8.78 | 8.78 | 8.78 | 9.88 | no baseline | no baseline | 1.68 | 0.85 | 108 / 7,114 / 0 | — | 0.7983 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 519.64 | 519.64 | 519.64 | 519.64 | no baseline | no baseline | -0.48 | -0.26 | 13,992 / 526,815 / 0 | — | 2.4983 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 394 | 18.85 | 33.94 | 138.51 | 506.90 | 1.09× | 1.31× | -0.25 | -0.18 | 301 / 34,964 / 0 | — | 0.103 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.73 | 3.20 | 3.20 | 3.84 | 0.80× | 2.43× | -1.19 | -0.84 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 1.01 | 1.01 | 1.01 | 1.17 | no baseline | no baseline | -0.29 | -0.25 | 70 / 1,298 / 0 | — | 0.0505 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 348.56 | 348.56 | 348.56 | 411.98 | 3.79× | 3.79× | -0.29 | 0.06 | 10,080 / 554,099 / 0 | — | 1.864 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.77 | 4.77 | 4.77 | 4.77 | 0.94× | 0.94× | -3.08 | -2.38 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 32.14 | 32.14 | 32.14 | 32.14 | 1.32× | 1.32× | -0.13 | -0.07 | 166 / 13,472 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤512 KiB · contended | 3 | 27.86 | 27.86 | 27.86 | 81.88 | no baseline | no baseline | — | — | 733 / 125,661 / 8,191 | — | 0.0004 ms per byte | files.change |
| fs.apply | ≤64 KiB · contended | 1 | 20.47 | 20.47 | 20.47 | 20.47 | 2.22× | 1.31× | -6.16 | -4.33 | 658 / 94,115 / 8,191 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 3 | 7.48 | 7.48 | 7.48 | 13.11 | 1.08× | 0.77× | 0.93 | 0.73 | 152 / 6,377 / 0 | — | 0.0003 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 3 | 10.21 | 10.21 | 10.21 | 12.65 | 1.42× | 1.19× | 0.02 | -0.01 | 266 / 14,966 / 0 | — | 0.0332 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 20 | 8.44 | 10.68 | 10.68 | 12.24 | 1.45× | 1.32× | -0.30 | -0.23 | 197 / 10,461 / 0 | — | 0.0274 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 9.01 | 9.36 | 9.36 | 21.61 | 1.66× | 1.55× | 0.03 | 0.09 | 242 / 14,369 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 26 | 7.25 | 10.97 | 11.90 | 14.28 | 1.17× | 1.19× | -0.93 | -0.49 | 155 / 9,165 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 4.74 | 4.74 | 4.74 | 4.74 | 0.79× | 0.73× | -0.78 | -0.42 | 133 / 7,869 / 0 | — | 0.0046 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 6.80 | 6.94 | 6.94 | 9.12 | 0.92× | 0.87× | -0.68 | -0.48 | 168 / 9,487 / 0 | — | 0.0053 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 1.95 | 1.95 | 1.95 | 1.95 | 1.13× | 1.13× | — | — | 77 / 4,418 / 0 | — | 1.945 ms per file | — |
| fs.glob | 17–64 files · contended | 1 | 3.28 | 3.28 | 3.28 | 3.28 | 1.18× | 1.18× | -0.48 | -0.41 | 94 / 7,704 / 0 | — | 0.156 ms per file | — |
| fs.glob | 17–64 files · uncontended | 12 | 5.04 | 7.06 | 7.06 | 8.26 | 1.78× | 1.86× | 0.09 | 0.10 | 94 / 10,524 / 0 | — | 0.2308 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 8.38 | 8.38 | 8.38 | 8.38 | 4.61× | 4.61× | 2.14 | 1.45 | 148 / 17,935 / 0 | — | 2.7933 ms per file | — |
| fs.glob | 2–4 files · uncontended | 8 | 2.32 | 3.41 | 3.41 | 5.38 | 1.31× | 1.76× | 0.33 | 0.20 | 47 / 4,066 / 0 | — | 0.8515 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 2.69 | 2.69 | 2.69 | 2.69 | 1.60× | 1.60× | 0.07 | 0.10 | 50 / 4,279 / 0 | — | 0.5376 ms per file | — |
| fs.glob | 5–16 files · uncontended | 14 | 2.77 | 3.73 | 3.73 | 4.80 | 1.37× | 1.64× | 0.39 | 0.30 | 52 / 4,488 / 0 | — | 0.4814 ms per file | — |
| fs.glob | >64 files · contended | 4 | 6.03 | 6.63 | 6.63 | 7.62 | 1.11× | 1.23× | -1.04 | -0.90 | 97 / 13,813 / 0 | — | 0.0269 ms per file | — |
| fs.glob | >64 files · uncontended | 21 | 6.20 | 8.88 | 8.88 | 12.16 | 0.63× | 0.63× | -1.30 | -1.22 | 90 / 14,301 / 0 | — | 0.0363 ms per file | — |
| fs.grep | 1 files · contended | 2 | 2.33 | 2.33 | 2.33 | 4.27 | 1.56× | 1.56× | 0.30 | 1.30 | 39 / 3,288 / 0 | — | 2.328 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 5 | 13.70 | 20.57 | 20.57 | 30.72 | 2.29× | 3.44× | -0.74 | -0.54 | 281 / 16,324 / 0 | — | 0.6225 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 18 | 9.91 | 17.12 | 17.12 | 17.95 | 1.72× | 2.86× | 0.96 | 0.57 | 226 / 12,707 / 0 | — | 0.5418 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 4.14 | 4.14 | 4.14 | 4.14 | 1.06× | 1.04× | 0.16 | 0.06 | 257 / 12,118 / 0 | — | 1.3807 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 5 | 3.90 | 3.96 | 3.96 | 4.35 | 1.69× | 1.24× | 0.77 | 0.53 | 84 / 4,635 / 0 | — | 1.0885 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 3.87 | 3.87 | 3.87 | 5.05 | 1.30× | 0.77× | 0.57 | 0.42 | 120 / 5,774 / 0 | — | 0.2577 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 11 | 4.50 | 15.66 | 15.66 | 16.29 | 1.20× | 2.61× | -0.04 | 0.00 | 110 / 6,620 / 0 | — | 0.8898 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 9 | 25.06 | 29.53 | 29.53 | 30.54 | 1.60× | 1.88× | 1.12 | 0.82 | 705 / 39,872 / 0 | — | 0.1448 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 17 | 20.61 | 27.19 | 27.19 | 28.23 | 1.13× | 1.18× | 0.68 | 0.43 | 543 / 24,628 / 0 | — | 0.0941 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 1.57 | 1.57 | 1.57 | 1.57 | 0.93× | 0.93× | -1.73 | -1.14 | 29 / 2,381 / 0 | — | 1.573 ms per entrie | — |
| fs.list | 17–64 entries · contended | 6 | 4.86 | 6.47 | 6.47 | 7.03 | 2.02× | 2.69× | -0.41 | -0.31 | 102 / 10,774 / 0 | — | 0.1294 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 33 | 4.23 | 6.00 | 6.13 | 6.94 | 1.69× | 2.05× | -0.62 | -0.56 | 76 / 9,763 / 0 | — | 0.1199 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 3.03 | 3.03 | 3.03 | 3.09 | 1.30× | 1.30× | -0.58 | -0.58 | 60 / 4,942 / 0 | — | 0.7718 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 2.73 | 2.95 | 2.95 | 3.04 | 1.45× | 1.44× | 0.81 | 0.55 | 50 / 4,884 / 0 | — | 0.9087 ms per entrie | — |
| fs.list | 5–16 entries · contended | 4 | 2.34 | 2.48 | 2.48 | 3.10 | 1.00× | 0.87× | -0.22 | 0.02 | 58 / 4,709 / 0 | — | 0.4423 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 17 | 3.00 | 4.25 | 4.25 | 9.80 | 1.58× | 1.11× | 0.51 | 0.41 | 54 / 4,659 / 0 | — | 0.4896 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 2.29 | 2.29 | 2.29 | 2.29 | 1.03× | 1.03× | -0.77 | -0.49 | 54 / 2,158 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 17 | 2.32 | 2.81 | 2.81 | 2.92 | 1.46× | 1.77× | -0.12 | -0.12 | 57 / 3,548 / 0 | — | 0.003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 5 | 2.33 | 2.37 | 2.37 | 2.40 | 0.83× | 0.85× | -1.55 | -1.10 | 49 / 2,951 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 9 | 3.04 | 3.33 | 3.33 | 4.77 | 1.44× | 0.56× | -0.59 | -0.36 | 80 / 4,945 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 34 | 2.42 | 4.64 | 4.88 | 8.76 | 1.17× | 1.30× | -0.20 | -0.13 | 48 / 3,278 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 13 | 12.45 | 16.02 | 16.02 | 29.09 | 1.18× | 1.13× | 1.46 | 1.14 | 339 / 19,516 / 0 | — | 12.446 ms per file | commit |
| fs.rm | 1 files · uncontended | 36 | 12.14 | 20.35 | 21.94 | 26.03 | 1.81× | 1.82× | 0.44 | 0.56 | 207 / 15,447 / 0 | — | 12.141 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 2 | 1.49 | 1.49 | 1.49 | 4.22 | 0.68× | 0.67× | -1.14 | -0.80 | 35 / 3,624 / 0 | — | 0.0033 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 8 | 2.33 | 3.14 | 3.14 | 10.16 | 1.52× | 2.04× | 0.30 | 0.34 | 45 / 3,566 / 0 | — | 0.0053 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 2.29 | 2.29 | 2.29 | 2.60 | no baseline | no baseline | 0.07 | 0.14 | 48 / 3,711 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.23 | 2.23 | 2.23 | 6.38 | 1.06× | 1.06× | -0.11 | -0.15 | 45 / 3,671 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 3 | 2.07 | 2.07 | 2.07 | 2.68 | 0.79× | 0.60× | -0.78 | -0.64 | 66 / 3,875 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 31 | 1.92 | 3.49 | 4.34 | 10.12 | 0.98× | 1.62× | 0.39 | 0.17 | 39 / 3,018 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 2.00 | 2.00 | 2.00 | 3.23 | 0.89× | 0.67× | 0.07 | 0.05 | 86 / 4,832 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 11 | 2.02 | 2.60 | 2.60 | 2.93 | 1.20× | 0.74× | -0.13 | -0.08 | 38 / 3,063 / 0 | — | 0.0004 ms per byte | — |
| fs.write | ≤1 KiB · contended | 28 | 12.30 | 38.09 | 42.60 | 49.63 | 1.44× | 2.56× | -0.08 | 0.16 | 313 / 24,427 / 0 | — | 0.0297 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 107 | 7.04 | 15.51 | 18.00 | 18.28 | 1.11× | 1.47× | -0.66 | -0.38 | 163 / 6,937 / 0 | — | 0.0153 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 38 | 13.12 | 34.82 | 36.44 | 50.32 | 0.81× | 2.16× | -0.24 | -0.05 | 374 / 20,611 / 0 | — | 0.0001 ms per byte | files.change |
| fs.write | ≤512 KiB · uncontended | 53 | 10.59 | 15.65 | 29.46 | 34.09 | 1.28× | 1.90× | 0.22 | 0.22 | 163 / 8,339 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 247 | 10.14 | 23.02 | 36.68 | 151.02 | 1.03× | 1.05× | -0.45 | -0.23 | 331 / 17,335 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 468 | 7.43 | 12.23 | 17.83 | 25.77 | 1.03× | 0.90× | -0.10 | 0.01 | 156 / 6,556 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 114 | 10.13 | 23.25 | 25.87 | 100.06 | 1.03× | 1.03× | -0.50 | -0.27 | 342 / 17,786 / 0 | — | 0.0022 ms per byte | files.change |
| fs.write | ≤8 KiB · uncontended | 173 | 7.41 | 12.68 | 17.76 | 89.66 | 1.03× | 0.91× | 0.03 | 0.10 | 155 / 6,674 / 0 | — | 0.0015 ms per byte | files.change |
| operator.store.stats | — · uncontended | 1 | 1.00 | 1.00 | 1.00 | 1.00 | 1.33× | 1.33× | -0.38 | -0.25 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 50 | 30.27 | 49.51 | 70.72 | 79.21 | 1.44× | 1.42× | -0.17 | -0.17 | 307 / 50,700 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 85 | 25.59 | 45.65 | 54.77 | 306.88 | 1.23× | 1.32× | -0.10 | -0.09 | 264 / 26,544 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 14 | 3.21 | 4.06 | 4.06 | 5.04 | 0.84× | 0.50× | 0.55 | 0.45 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 43 | 3.25 | 4.31 | 5.20 | 6.22 | 0.81× | 0.84× | -0.15 | -0.10 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 2 | 8.14 | 8.14 | 8.14 | 11.25 | 0.84× | 0.42× | 0.09 | 0.10 | 103 / 4,086 / 0 | — | 8.136 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 8 | 9.28 | 11.70 | 11.70 | 15.35 | 1.12× | 0.96× | -0.14 | -0.10 | 137 / 4,581 / 0 | — | 9.284 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 415.99 | 415.99 | 415.99 | 415.99 | 10.91× | 10.91× | -1 | -0.65 | 18,330 / 746,784 / 8,191 | — | 415.99 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · uncontended | 1 | 25.27 | 25.27 | 25.27 | 25.27 | no baseline | no baseline | — | — | 461 / 21,049 / 0 | — | 1.2634 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 6 | 12.22 | 22.31 | 22.31 | 22.72 | 0.82× | 1.13× | 2.22 | 1.66 | 239 / 8,616 / 0 | — | 4.0543 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 17 | 11.89 | 15.71 | 15.71 | 16.30 | 1.11× | 0.92× | -0.13 | -0.13 | 141 / 7,241 / 0 | — | 4.2567 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 18.20 | 18.20 | 18.20 | 56.77 | 1.10× | 1.10× | -0.05 | -0.02 | 279 / 10,673 / 0 | — | 2.9802 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 16.85 | 16.85 | 16.85 | 16.85 | 1.23× | 1.23× | 1.15 | 1.18 | 332 / 15,696 / 0 | — | 2.1067 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 101.68 | 101.68 | 101.68 | 110.83 | no baseline | no baseline | 3.06 | 2.57 | 2,503 / 367,308 / 8,191 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 56.20 | 999.52 | 999.52 | 13759.56 | 0.81× | 14.49× | -0.26 | -0.08 | 428 / 25,389 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 210 | 610.04 | 897.46 | 1065.08 | 4097.99 | 11.91× | 2.34× | -0.37 | -0.28 | — | 4270.30 | — | — |
| sandbox.exec | 0 files · uncontended | 212 | 31.55 | 670.96 | 879.99 | 6913.69 | 0.99× | 2.34× | -0.18 | -0.15 | — | 4263.70 | — | — |
| sandbox.exec | 1 files · contended | 15 | 39.89 | 61.80 | 61.80 | 64.33 | 1.09× | 0.73× | 0.13 | 0.08 | — | 6.30 | 39.889 ms per file | — |
| sandbox.exec | 1 files · uncontended | 28 | 33.00 | 57.58 | 62.98 | 63.82 | 0.99× | 0.85× | 0.22 | 0.18 | — | 6 | 32.999 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 41.33 | 41.33 | 41.33 | 73.46 | 0.59× | 0.59× | -0.29 | -0.17 | — | 40.70 | 2.0663 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 11 | 69.58 | 96.46 | 96.46 | 121.04 | 1.00× | 1.39× | -0.04 | -0.04 | — | 88 | 3.4796 ms per file | — |
| sandbox.exec | 2–4 files · contended | 34 | 40.32 | 59.64 | 60.70 | 65.88 | 1.04× | 0.86× | 0.12 | 0.08 | — | 9.60 | 13.4407 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 78 | 35.73 | 59.85 | 63.71 | 66.78 | 0.94× | 0.91× | -0.31 | -0.15 | — | 9 | 13.026 ms per file | — |
| sandbox.exec | 5–16 files · contended | 22 | 54.25 | 71.17 | 76.61 | 81.44 | 0.93× | 0.98× | 0.56 | 0.39 | — | 38 | 7.0169 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 27 | 46.28 | 67.14 | 67.29 | 70.81 | 0.65× | 0.64× | -0.10 | 0.03 | — | 16.80 | 5.4668 ms per file | — |
| sandbox.exec | — · contended | 12 | 2965.87 | 18779.24 | 18779.24 | 26166.28 | no baseline | no baseline | -1.52 | -1.12 | — | 47166.40 | — | — |
| sandbox.exec | — · uncontended | 27 | 196.93 | 25272.39 | 25293.17 | 34703.71 | 0.37× | 3.56× | 0.17 | 0.07 | — | 47166.40 | — | — |
| sandbox.mount | — · contended | 67 | 9.32 | 14.40 | 16.02 | 16.41 | 0.83× | 0.76× | -0.02 | 0.01 | 58 / 1,686 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 173 | 8.87 | 13.25 | 16.21 | 20.95 | 0.79× | 0.66× | -0.20 | -0.14 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.31 | 3.31 | 3.31 | 3.31 | no baseline | no baseline | 0.43 | 0.38 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 4.28 | 4.28 | 4.28 | 40.30 | no baseline | no baseline | 0.08 | 0.06 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 61 | 11.42 | 19.16 | 24.07 | 26.30 | 1.08× | 1.06× | 0.13 | 0.15 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 179 | 12.27 | 24.59 | 136.29 | 221.80 | 1.17× | 1.34× | 0.24 | 0.20 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 17 | 0.0 KiB | 906.4 KiB | 3,975 | ok 17 |
| branch.diff_commits | branch | 404 | 0.0 KiB | 22.2 MiB | 74,647 | ok 404 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 10 | 0.0 KiB | 96.1 KiB | 163 | ok 10 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 20 | 1.8 MiB | 0.0 KiB | 31 | Committed 20 |
| fs.diff_files | fs | 66 | 0.0 KiB | 762.9 KiB | 61 | Text 59, NoSuchPath 5, Equal 2 |
| fs.glob | fs | 73 | 0.0 KiB | 75.8 KiB | 1,017 | ok 73 |
| fs.grep | fs | 80 | 0.0 KiB | 268.5 KiB | 1,141 | ok 80 |
| fs.list | fs | 79 | 0.0 KiB | 411.8 KiB | 2,705 | ok 79 |
| fs.read | fs | 71 | 0.0 KiB | 217.1 KiB | 71 | ok 71 |
| fs.rm | fs | 49 | 0.0 KiB | 0.0 KiB | 49 | Committed 49 |
| fs.stat | fs | 70 | 0.0 KiB | 15.9 KiB | 70 | ok 70 |
| fs.write | fs | 1,228 | 27.8 MiB | 0.0 KiB | 1,228 | Committed 1219, UpToDate 9 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 248 | 0.0 KiB | 0.0 KiB | 0 | Committed 190, UpToDate 57, Conflict 1 |
| sandbox.exec | sandbox | 689 | 3.6 MiB | 3.9 MiB | 0 | exit:0 686, exit:2 3 |
| sandbox.mount | sandbox | 250 | 0.0 KiB | 0.0 KiB | 0 | Mounted 250 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 250 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 250 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.54 · end 1.53.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.159 | 15.536 · 1.343 · 1.159 · 1.078 · 1.065 | 2.09–2.09 | statements 32, vm_steps 1105, fullscan_steps 0, sorts 0, returned_rows 91 |
| read | 1.218 | 1.45 · 1.218 · 1.234 · 1.099 · 1.065 | 2.09–2.09 | statements 18, vm_steps 802, fullscan_steps 0, sorts 0, returned_rows 77 |
| list_small | 1.1 | 1.439 · 1.246 · 1.071 · 1.1 · 1.036 | 2.09–2.09 | statements 18, vm_steps 811, fullscan_steps 0, sorts 0, returned_rows 77 |
| list_largest | 5.746 | 7.571 · 5.662 · 5.746 · 5.949 · 5.413 | 2.09–2.09 | statements 116, vm_steps 15268, fullscan_steps 0, sorts 0, returned_rows 1649 |
| grep_scoped | 1.214 | 1.654 · 1.313 · 1.214 · 1.172 · 1.131 | 2.09–2.09 | statements 23, vm_steps 957, fullscan_steps 0, sorts 0, returned_rows 86 |
| glob_scoped | 1.146 | 1.213 · 1.072 · 1.078 · 1.146 · 1.165 | 2.09–2.09 | statements 17, vm_steps 790, fullscan_steps 0, sorts 0, returned_rows 76 |
| grep_tree | 4934.295 | 5083.268 · 4934.295 · 4926.073 · 4938.075 · 4910.85 | 1.72–2 | statements 58818, vm_steps 4512404, fullscan_steps 0, sorts 0, returned_rows 455281 |
| glob_tree | 6.617 | 9.984 · 7.838 · 6.617 · 6.441 · 6.566 | 1.72–1.72 | statements 133, vm_steps 17689, fullscan_steps 0, sorts 0, returned_rows 1877 |
| diff_files | 5.312 | 5.312 · 5.266 · 5.428 · 5.308 · 5.443 | 1.72–1.72 | statements 90, vm_steps 4696, fullscan_steps 0, sorts 0, returned_rows 462 |
| list_commits | 0.655 | 1.391 · 0.683 · 0.655 · 0.619 · 0.614 | 1.72–1.72 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.242 | 2.788 · 2.371 · 2.192 · 2.242 · 2.021 | 1.72–1.72 | statements 62, vm_steps 2150, fullscan_steps 0, sorts 0, returned_rows 235 |
| fork | 0.623 | 0.42 · 0.667 · 0.623 · 0.629 · 0.547 | 1.72–1.72 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 24.029 | 25.32 · 24.587 · 23.699 · 23.733 · 24.029 | 1.72–1.72 | statements 497, vm_steps 23390, fullscan_steps 0, sorts 0, returned_rows 1721 |
| oneshot_mount_unmount | 16.176 | 18.221 · 16.176 · 18.812 · 14.274 · 14.667 | 1.72–1.72 | statements 66, vm_steps 2325, fullscan_steps 82, sorts 2, returned_rows 227 |
| oneshot_commit | 73.45 | 73.48 · 70.808 · 78.297 · 69.741 · 73.45 | 1.72–1.72 | statements 185, vm_steps 12980, fullscan_steps 82, sorts 2, returned_rows 956 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.72–1.72 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 285.5 s** (tooling): play 118.7 · consolidate 108.0 · verify 17.1 · probes 25.8 · tests 0.0 · seal + snapshot 0.0 · report 15.9

285.55 s tooling: prepare 1.56 · play 117.19 · consolidate 108.01 · verify 9.10 (diff_commits) · version walk 7.99 · probes 25.79 · metrics 0.79 · Store allocation 0.26 · report 0.36

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T03:35:56.238Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.49× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.314) and statements per entry does not rise (0.028): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8); Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (21 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-043.a1.json`
- trace `~/lfs-history/runs/p3-main-v/trace/range-043.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-v/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r043-1-packages-core | 1,001 | 532.1 KiB |
| r043-2-agents-notes | 950 | 537.5 KiB |
| r043-3-packages-client | 908 | 532.7 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 416.0 | 4,346 |
| `git diff --stat` | 39.0 | 4,336 |
| `git add -f` | 36.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 42.0 | 4,339 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r043-2-agents-notes | end | P1 | pass | — | — |
| r043-2-agents-notes | end | P2 | pass | exit 0 | — |
| r043-2-agents-notes | end | P3 | pass | 266 bookkeeping path(s) | — |
| r043-2-agents-notes | end | P4 | pass | 128 emitted files, exit 2 | — |
| r043-2-agents-notes | end | P5 | pass | 26 files | — |
| r043-2-agents-notes | end | P6 | n/a | not a repair | — |
| r043-1-packages-core | end | P1 | pass | — | — |
| r043-1-packages-core | end | P2 | pass | exit 0 | — |
| r043-1-packages-core | end | P3 | pass | 266 bookkeeping path(s) | — |
| r043-1-packages-core | end | P4 | pass | 262 emitted files, exit 2 | — |
| r043-1-packages-core | end | P5 | pass | 84 files | — |
| r043-1-packages-core | end | P6 | n/a | not a repair | — |
| r043-3-packages-client | end | P1 | pass | — | — |
| r043-3-packages-client | end | P2 | pass | exit 0 | — |
| r043-3-packages-client | end | P3 | pass | 266 bookkeeping path(s) | — |
| r043-3-packages-client | end | P4 | pass | 551 emitted files, exit 2 | — |
| r043-3-packages-client | end | P5 | pass | 129 files | — |
| r043-3-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1955 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
