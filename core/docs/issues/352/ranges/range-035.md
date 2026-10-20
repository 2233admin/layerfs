# Range 035 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r034 (live Store)
dsh `bae81744b`..`478d9c17b` · **49 commits** (9 mainline, 40 side) · 2026-07-23 → 2026-07-24
Areas changed: `packages/core` 14% · `packages/ui` 11% · `examples/acp-agent` 11% · other 64%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 12 pass, 0 stop, 0 NOT_RUN over 3 points) · **Content 0.20×** · **Churn 0.00**
**Time split:** play 86.9 s · git 70.1 s · Node 149.2 s · verify 12.7 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **740.6 MiB** (+2.3 MiB) | **946.2 MiB** (+23.4 MiB) | **1.28×** (prev 1.25×) | **28.6 MiB** | **835** (total 39,429) | **256.2 s** tooling (total 104.3 min) |

**Checks:** 15 pass · 3 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.77× it; Scaling not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (8 classes too narrow) · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 7 merges: 0 (trips at 1)
**Moved most:** ▲ fs.read p95 +102% · ▼ probe fork −53% · ▲ probe read +52%
**Budget:** 36 of 202 ranges · projected total 15.9 h (budget 16.8 h) · disk 37% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **3,038 tracked files match** (blob id and mode) |
| History | 2 lanes merged, 1 publish |
| Steps | 1,649 / 1,649 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2617 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 382 bin shims, 4098 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **77 picks** in 2 merges (77 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `478d9c17b`** · 78 commits written for 78 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 77 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r035-2-agents-notes | end | `8298ee6e799b` | `98823cdaf895` | pass (384 normalized) | pass | n/a | pass | pass | n/a |
| r035-1-packages-core | end | `925133564d50` | `f79bfe94cd93` | pass (384 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `1037011a3df9` | `null` | n/a | pass | n/a | n/a | pass | pass (121,445 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/integration.spec.ts` (fails natively) · `packages/goal/command-goal/tests/command-goal.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/ui/acp/tests/modes.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-edge-paths.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-config.spec.ts` (fails natively) · `packages/goal/goal/tests/goal.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-result-shape.spec.ts` (fails natively) · `packages/goal/tool-goal/tests/tool-goal.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/plan-mode.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-stop.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/ui/acp/tests/commands.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/workflow/tool-ralph/tests/integration.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/goal/goal-session/tests/goal-session.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively).

## 2. Activity

**2,290 calls** · **113 steps** by **6 agents + lead** on **2 Branches + main** · **152 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +36 added · 756 modified · −4 deleted · 21.3 MiB written · fs 721 : Sandbox 75 (**10 : 1**, reported only in P3)
**Execs:** 426 (JS 41 · shell 385) · 2 non-zero exits · install 0 · test runs 3 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,013 | 734 | 279 | Committed 734 · Text 32 · NoSuchPath 7 · Equal 4 |
| sandbox | 880 | 573 | 3 | commit 147 (Committed 117, UpToDate 29, Conflict 1) · exec 426 (exit:0 424, exit:2 2) · mount 152 (Mounted 152) · status 3 · unmount 152 (Unmounted 152) |
| branch | 388 | 30 | 358 | diff_branches 11 · diff_commits 347 · fork 22 (Forked 22) · merge 7 (Merged 7) · publish 1 (Added 1) |
| project | 8 | 0 | 8 | list_commits 8 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,290** | **1,337** | **649** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r035-1-packages-core | a01 a02 a03 | 45 | 392 | ✓ | — |
| r035-2-agents-notes | a04 a05 a06 | 63 | 402 | ✓ | — |
| main | lead | 5 | 41 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r035-2, a04 after a05 | 0.1 s |
| Stale clean merge | 1 / 1 | r035-2, a04 a06 | merged cleanly |
| Decoy edit | 1 / 1 | r035-2, a05 a06 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r035-1 | 15 | 6 | 9 | 0 | 0 | 101 | — |
| a02 | r035-1 | 9 | 3 | 6 | 0 | 0 | 70 | — |
| a03 | r035-1 | 21 | 9 | 12 | 0 | 0 | 221 | — |
| a04 | r035-2 | 21 | 8 | 13 | 0 | 0 | 96 | commit-conflict, stale-clean-merge |
| a05 | r035-2 | 13 | 8 | 5 | 0 | 0 | 80 | commit-conflict, decoy |
| a06 | r035-2 | 29 | 14 | 15 | 0 | 0 | 226 | stale-clean-merge, decoy |
| lead | main | 5 | 1 | 0 | 4 | 0 | 41 | — |
| **Total** |  | **113** | **49** | **60** | **4** | **0** | **835** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 81 · pnpm 1 · tsc 2 · vitest 3 · other 339

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r035-2-agents-notes | 43 | 43 | 43 | 0 | 43 | 927 |
| r035-1-packages-core | 32 | 32 | 32 | 1 | 32 | 838 |
| **lead** | — | — | — | — | 78 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r035-2-agents-notes | 1 | 0 | 1 | 1 | 32 | 32 / 32 |
| r035-1-packages-core | 0 | 1 | 1 | 1 | 146 | 146 / 146 |
| **lead repair** | 1 | — | 1 | — | — | 121,445 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r034) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 738.2 MiB (20.3 MiB / 625.6 MiB / 18.4 MiB / 73.9 MiB) | 740.6 MiB (20.6 MiB / 625.6 MiB / 18.6 MiB / 75.7 MiB) | +2.3 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 54,612 / 9,003 / 4,102 | 54,671 / 9,004 / 4,106 | +59 / +1 / +4 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 922.8 MiB | 946.2 MiB | +23.4 MiB |
| **Space amplification** (total · tracked) | 1.25× · tracked 4.81× | 1.28× · tracked 4.82× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.24** (1.07 / 0.18 / 0.62) | 0.82× the median range |
| **Stored per Commit** | 23.5 KiB | 28.5 KiB | — |
| Metadata share | 0.39 | 0.39 | this range 0.45 |
| History: Commits / Layers / Branches | 38,594 | 39,429 / 21 / 384 | +835 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 12.20 GiB (Commits 10.31 GiB · installs 891.1 MiB · build 106.5 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 42.65 GiB / 37% | — |
| Snapshot | — | r035, 818.2 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 573.8 MiB | 0.77 | +13.3 MiB |
| Metadata | 80.0 MiB | 0.11 | +2.5 MiB |
| Index rows | 246.8 MiB | 0.33 | — |
| Waste | 44.4 MiB | 0.06 | — |
| Other | 1.2 MiB | 0.00 | — |
| **Total = Store on disk** | **946.2 MiB** | **= 1.28** space amplification | +23.4 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 20.6 MiB | 99.2 MiB (57.5 MiB + 41.7 MiB) | 4.82× | — | 1.5 MiB | 5.5 MiB | 0.28 |
| `node_modules` | 625.6 MiB | 198.6 MiB (180.9 MiB + 17.7 MiB) | 0.32× | — | 871.4 KiB | 2.7 KiB | 324.50 |
| Build output | 18.6 MiB | 15.5 MiB (14.5 MiB + 1.1 MiB) | 0.83× | — | 796.7 KiB | 6.9 MiB | 0.11 |
| `.git` | 75.7 MiB | 312.0 MiB (299.8 MiB + 12.3 MiB) | 4.12× | — | 12.4 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 292.4 MiB | — (not divided) | — | 7.7 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 28.5 MiB | — | — | — | — | — |
| **Total** | — | **946.2 MiB** | **= 1.28×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 134,416 | +3,474 | 6.3 KiB | 0 (derived) | 53% |
| Chunks (large files) | 52,644 | +787 | 15.0 KiB | — | 16% |
| Large-file extents | 14,768 | — | 0.3 KiB | — | — |
| Directories | 252,070 | 3,251 (with inodes, pooled) | 0.2 KiB | — | 50% |
| Inodes and attributes | 248,660 | ↑ pooled | 2.7 KiB | — | — |
| Symlinks | 2,270 | +4,107 | 0.1 KiB | — | — |

Delta: 2.2% at depth cap · 19% of refused bases stopped by budget · `node_modules` reinstall: absolute: 823115 new stored bytes for 79 raw changed bytes of 3 changed packages (10419.177×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.82× (99.2 MiB for 20.6 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.4 KiB / 8.4 KiB / 12.0 KiB over 153 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.20× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.6 MiB stored for 1.22 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.64 (2 lanes × 740.6 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.7 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.8 ms / 19.4 ms (1.10×) | 3.0 ms / 12.4 ms (1.40×) | 3.0 ms / 8.1 ms (1.47×) | 24.6 ms / 81.2 ms (1.32×) | 9.8 ms / 16.6 ms (0.86×) | 1.7 ms / 1.7 ms (3.61×) | — (native comparison in P3; exec 40.2 ms / 905 ms) |
| SQL p50: 163 stmts | 60 stmts | 54 stmts | 263 stmts | 54 stmts | 35 stmts | — |

**Commit cost:** 10.18 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 634 ms p50 over 152
**Slowest:** sandbox.exec 36204 ms · sandbox.exec 23009 ms · sandbox.exec 22930 ms · checkpoint diff_commits 0.10 ms and 1.51 statements per entry (64,463 entries per page)
**Scaling:** 7 of 15 probes flat · `stat` 0.33 · `read` 0.62 · `grep_scoped` 0.33 · `glob_scoped` 0.89 · `grep_tree` 0.23 · `glob_tree` 0.72 · `diff_files` 3.03 · `diff_commits` 1.45

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 446 ms / 446 ms | — / — | — | git / status-cold: — |
| git status (steady) | 330 ms / 465 ms | — / — | — | git / status-steady: — |
| git add | 31.0 ms / 114 ms | — / — | — | git / add: — |
| git commit (lane) | 36.0 ms / 69.0 ms | — / — | — | git / commit: — |
| lead writes main | 2999 ms / 2999 ms | — / — | — | — |
| repack | 2024 ms / 2024 ms | — / — | — | — |
| pnpm install (incremental) | 2366 ms / 2366 ms | 2055 ms / 2055 ms | 1.15× | pnpm-reinstall / cold: — |
| pnpm refresh | 2726 ms / 2726 ms | 1755 ms / 1755 ms | 1.55× | pnpm-reinstall / steady: — |
| tsc -b | 3674 ms / 3674 ms | 7480 ms / 7480 ms | 0.49× | tsc-b / cold: — |
| vitest | 4316 ms / 4316 ms | 3129 ms / 3129 ms | 1.38× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.7 ms / 19.3 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4177712 → 4144752 B · fs.write ≤64 KiB 4177712 → 4144752 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2624472 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 2319592 B
**Host load (1-min, recorded, not waited on):** macOS 6.91 at the first command → 9.05 after the last (max 15.78 over 6 commands) · Docker VM 1.94 → 1.97

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-035.a1)

## 5. Findings and action

### Finding 035.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | oneshot_mount_unmount.vm_steps: depth exponent 0.947 | < 0.05 |

Diagnosis pending: `finding-035.a1.json`.

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

- **a1 (`p3-main-u`, live after r34 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c` from the pinned copy): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 12 pass, 0 stop, 0 NOT_RUN over 3 points. Repair P6 pass (1,657 emitted). Control `control-035.a1` passes. Report check F1–F8 PASS.
- **The only optimize row** is Counters `oneshot_mount_unmount.vm_steps`, depth exponent 0.947 over the same-binary points from r31 (r34: 0.297, watch). The probe's own counters this range are 68 statements, 2,402 VM steps and 82 full-scan steps. It is recorded, not acted on (fast mode), and is listed in the 31–35 summary as a counter to follow.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` 0 files class, 12.77×). One-shot Commit 1.32× (24.6 ms), write 1.10×; read, list, mount and merge are under the 5 ms floor or below 1× (merge 1.7 ms this range).
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 6.9–15.8. It rose to 15.8 at the end of the repair step and stayed high through verify, from other work on the host.
- Final steps: lanes 25 s + 68 s (cut at plan order 27), repair 105 s (alarm 200 s), verify 17 s, finish 47 s. Repair install 36.2 s, build 23.0 s, tests 3.0 s.
- Watch items: index rows 246.8 MiB (sealed; #366). `fs.rm` uncontended p50 5.99 ms per file over 4 calls, 7,717 VM steps (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1649/1649; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.77× it | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | oneshot_mount_unmount.vm_steps: depth exponent 0.947 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (8 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.454 | < 0.5 | pass |
| Reinstall growth | absolute: 823115 new stored bytes for 79 raw changed bytes of 3 changed packages (10419.177×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0221 (budget 0.1875) | < 0.1 | pass |
| Range growth | 28.6 MiB, 0.87× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 2784 ms for 818.2 MiB new; size exponent -0.81 | < 0.15 | pass |
| Disk projection | 0.37 | < 0.8 | pass |
| Wall projection | 0.95 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 78 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 12 pass · 0 stop · 0 NOT_RUN over 3 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 77 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.20× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 113 | 114 |
| Lanes / agents | 2 / 6 | 2 / 6 |
| LayerFS Commits | 835 | 751 |
| Workspaces (one-shot share) | 152 (0.99) | 59 (0.966) |
| Reads | 229 | 229 |
| Reconcile writes | 35 | 35 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 11 | 18.72 | 344.13 | 344.13 | 413.82 | 1.15× | 6.65× | -3.02 | -8.08 | 215 / 25,658 / 0 | — | 0.0787 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 269.21 | 269.21 | 269.21 | 269.21 | no baseline | no baseline | -7.55 | -14.25 | 7,051 / 251,837 / 0 | — | 1.2943 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 341 | 20.34 | 35.41 | 42.36 | 338.84 | 1.18× | 1.36× | 0.11 | 0.18 | 301 / 32,328 / 0 | — | 0.1079 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.94 | 2.45 | 2.45 | 3.67 | 1.03× | 1.86× | -0.89 | -1.15 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 1 | 1.27 | 1.27 | 1.27 | 1.27 | no baseline | no baseline | 1.14 | 2.21 | 70 / 1,298 / 0 | — | 0.0636 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 332.24 | 332.24 | 332.24 | 332.24 | 3.61× | 3.61× | -3.03 | -5.79 | 9,321 / 523,698 / 0 | — | 2.3732 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.65 | 1.65 | 1.65 | 1.65 | 1.07× | 1.07× | -3.35 | -5.81 | 35 / 517 / 0 | — | 0.0107 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 7.97 | 7.97 | 7.97 | 7.97 | 1.57× | 1.57× | -2.86 | -10.54 | 35 / 789 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 25.06 | 25.06 | 25.06 | 25.06 | 1.03× | 1.03× | -4.27 | -8.17 | 194 / 13,744 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 1 | 16.86 | 16.86 | 16.86 | 16.86 | 1.42× | 1.25× | — | — | 445 / 28,301 / 0 | — | 0.0222 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 3 | 13.76 | 13.76 | 13.76 | 15.27 | 1.92× | 1.60× | 4.26 | 8.52 | 347 / 17,872 / 0 | — | 0.0416 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 16 | 10.13 | 12.68 | 12.68 | 13.32 | 1.74× | 1.57× | 2.47 | 4.46 | 212 / 12,145 / 0 | — | 0.0366 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 14 | 9.01 | 13.03 | 13.03 | 15.38 | 1.45× | 1.41× | -0.56 | -1.95 | 164 / 10,793 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 5 | 11.54 | 11.98 | 11.98 | 20.62 | 1.56× | 1.49× | -0.06 | 0.44 | 222 / 12,009 / 0 | — | 0.006 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 2 | 5.89 | 5.89 | 5.89 | 6.30 | 2.12× | 2.12× | 3.13 | 6.00 | 90 / 10,788 / 0 | — | 0.1466 ms per file | — |
| fs.glob | 17–64 files · uncontended | 10 | 5.60 | 7.48 | 7.48 | 9.77 | 1.98× | 1.97× | 1.41 | 3.11 | 82 / 10,856 / 0 | — | 0.2135 ms per file | — |
| fs.glob | 2–4 files · uncontended | 6 | 2.23 | 2.53 | 2.53 | 5.08 | 1.26× | 1.31× | 0.36 | 0.09 | 44 / 3,679 / 0 | — | 0.8223 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 5.81 | 5.81 | 5.81 | 5.81 | 3.46× | 3.46× | 4.24 | 9.84 | 273 / 16,245 / 0 | — | 0.4151 ms per file | — |
| fs.glob | 5–16 files · uncontended | 7 | 2.69 | 5.29 | 5.29 | 11.69 | 1.33× | 2.32× | -1.33 | -2.85 | 48 / 4,945 / 0 | — | 0.5338 ms per file | — |
| fs.glob | >64 files · contended | 1 | 12.76 | 12.76 | 12.76 | 12.76 | 2.36× | 2.36× | 1.10 | 5.19 | 152 / 23,275 / 0 | — | 0.0974 ms per file | — |
| fs.glob | >64 files · uncontended | 13 | 5.90 | 7.42 | 7.42 | 8.43 | 0.60× | 0.53× | 8.69 | 19.65 | 102 / 10,797 / 0 | — | 0.0431 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 2.22 | 2.22 | 2.22 | 2.22 | 0.93× | 0.93× | — | — | 58 / 3,526 / 0 | — | 2.219 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 1 | 10.72 | 10.72 | 10.72 | 10.72 | 1.79× | 1.79× | -2.26 | -4.64 | 230 / 14,462 / 0 | — | 0.3064 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 3 | 13.19 | 13.19 | 13.19 | 13.63 | 2.29× | 2.20× | 10.20 | 20.91 | 305 / 18,932 / 0 | — | 0.4711 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 4.15 | 11.26 | 11.26 | 21.62 | 1.80× | 3.52× | 5.81 | 11.03 | 74 / 5,279 / 0 | — | 1.0788 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 3.96 | 3.96 | 3.96 | 3.96 | 1.33× | 0.78× | 2.73 | 3.80 | 69 / 3,896 / 0 | — | 0.4397 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 12 | 4.73 | 13.23 | 13.23 | 18.28 | 1.26× | 2.20× | 1.78 | 3.46 | 94 / 5,985 / 0 | — | 0.7286 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 22.19 | 22.19 | 22.19 | 24.73 | 1.41× | 1.41× | -1.51 | -2.81 | 552 / 26,210 / 0 | — | 0.1638 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 9 | 17.41 | 29.15 | 29.15 | 32.13 | 0.96× | 1.27× | 3.45 | 5.25 | 412 / 23,437 / 0 | — | 0.1463 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 2 | 3.88 | 3.88 | 3.88 | 7.97 | 1.62× | 1.62× | -0.75 | -2.17 | 65 / 7,853 / 0 | — | 0.0776 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 13 | 5.00 | 8.08 | 8.08 | 15.53 | 1.99× | 2.76× | 1.10 | 2.73 | 81 / 9,218 / 0 | — | 0.1255 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 3.12 | 3.12 | 3.12 | 3.12 | 1.34× | 1.34× | 2.28 | 4.13 | 164 / 10,509 / 0 | — | 1.039 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 7 | 2.98 | 3.29 | 3.29 | 14.34 | 1.58× | 1.61× | 3.82 | 6.67 | 47 / 4,645 / 0 | — | 1.0343 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 2.07 | 2.07 | 2.07 | 7.28 | 0.89× | 0.73× | -8.91 | -16.21 | 33 / 3,009 / 0 | — | 0.2298 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 14 | 2.80 | 3.54 | 3.54 | 4.31 | 1.47× | 0.93× | 2.30 | 4.21 | 52 / 4,806 / 0 | — | 0.3129 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 3.19 | 3.19 | 3.19 | 3.19 | 1.44× | 1.44× | 2.20 | 4.17 | 61 / 4,396 / 0 | — | 0.0041 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 5 | 3.53 | 4.81 | 4.81 | 12.63 | 2.23× | 3.04× | 2.93 | 5.39 | 60 / 3,814 / 0 | — | 0.0042 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.50 | 2.61 | 2.61 | 5.59 | 0.90× | 0.94× | -5.51 | -10.28 | 55 / 3,973 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 5 | 3.56 | 5.07 | 5.07 | 6.96 | 1.69× | 0.85× | -1.59 | -3.74 | 94 / 5,793 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 25 | 2.90 | 7.74 | 12.37 | 16.85 | 1.40× | 2.17× | 1.23 | 2.54 | 58 / 3,561 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · uncontended | 4 | 5.99 | 7.45 | 7.45 | 8.08 | 0.89× | 0.67× | -2.13 | -7.44 | 132 / 7,717 / 0 | — | 5.988 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 3.06 | 3.06 | 3.06 | 3.06 | 1.41× | 1.37× | -2.57 | -4.99 | 91 / 7,933 / 0 | — | 0.0061 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 2 | 2.13 | 2.13 | 2.13 | 5.77 | 1.38× | 1.38× | -1.90 | -3.62 | 38 / 2,366 / 0 | — | 0.0052 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 5 | 2.21 | 2.22 | 2.22 | 5.51 | 1.05× | 1.06× | 0.97 | 1.80 | 48 / 2,818 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.75 | 2.75 | 2.75 | 2.76 | 1.05× | 0.80× | -2.01 | -4.87 | 61 / 3,174 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 15 | 2.30 | 7.47 | 7.47 | 8.49 | 1.17× | 3.46× | 7.26 | 12.31 | 46 / 3,513 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 11 | 2.41 | 3.78 | 3.78 | 4.14 | 1.44× | 1.08× | 0.53 | 0.98 | 46 / 3,945 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 20 | 13.43 | 36.70 | 36.70 | 51.23 | 1.58× | 2.46× | -2.07 | -4.13 | 356 / 18,688 / 0 | — | 0.0213 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 18 | 9.31 | 14.13 | 14.13 | 14.99 | 1.46× | 1.34× | -1.09 | -1.61 | 183 / 7,774 / 0 | — | 0.0204 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 19 | 14.54 | 30.95 | 30.95 | 36.49 | 0.90× | 1.92× | 0.22 | 1.39 | 338 / 19,571 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 44 | 9.55 | 13.92 | 20.83 | 30.62 | 1.16× | 1.69× | -0.04 | -0.39 | 147 / 7,948 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 113 | 12.17 | 27.75 | 31.33 | 32.96 | 1.23× | 1.26× | -0.22 | -1.02 | 317 / 16,794 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 304 | 7.95 | 12.42 | 20.09 | 38.12 | 1.10× | 0.91× | 0.10 | -0.21 | 154 / 6,919 / 0 | — | 0.0003 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 54 | 11.66 | 21.53 | 26.47 | 69.10 | 1.19× | 0.96× | -1.30 | -2.72 | 322 / 15,150 / 0 | — | 0.0018 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 144 | 7.08 | 11.84 | 15.84 | 48.30 | 0.98× | 0.85× | -0.22 | -0.88 | 148 / 6,352 / 0 | — | 0.0015 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.02 | 1.02 | 1.02 | 1.02 | 1.35× | 1.35× | -0.07 | 1.74 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 25 | 38.34 | 59.12 | 59.94 | 61.59 | 1.82× | 1.70× | 3.48 | 7.87 | 646 / 61,040 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 51 | 27.48 | 60.71 | 90.77 | 189.72 | 1.32× | 1.75× | 1.15 | 2.80 | 374 / 29,061 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 8 | 3.35 | 8.68 | 8.68 | 8.93 | 0.87× | 1.07× | 2.90 | 5.87 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 21 | 3.34 | 4.41 | 4.41 | 5.39 | 0.84× | 0.86× | -0.61 | -1.01 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · uncontended | 5 | 9.73 | 18.68 | 18.68 | 23.20 | 1.17× | 1.53× | 1.46 | 3.14 | 139 / 5,136 / 0 | — | 9.729 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 385.08 | 385.08 | 385.08 | 385.08 | 10.10× | 10.10× | 7.10 | 13.18 | 20,145 / 647,820 / 0 | — | 385.076 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 5 | 13.16 | 13.91 | 13.91 | 40.38 | 0.88× | 0.71× | 3.17 | 6.26 | 146 / 7,920 / 0 | — | 4.6377 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 14 | 11.40 | 15.47 | 15.47 | 19.52 | 1.07× | 0.91× | 1.63 | 2.58 | 139 / 5,696 / 0 | — | 4.7165 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 31.05 | 31.05 | 31.05 | 31.05 | 1.88× | 1.88× | 13.22 | 24.07 | 497 / 28,045 / 0 | — | 5.1747 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 13.37 | 13.37 | 13.37 | 17.55 | 0.98× | 0.98× | -1.32 | -2.31 | 219 / 8,431 / 0 | — | 1.7553 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 92.06 | 880.84 | 880.84 | 13144.35 | 1.33× | 12.77× | 3.10 | 6.65 | 1,345 / 108,095 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 140 | 42.08 | 792.57 | 910.91 | 2879.74 | 0.82× | 2.06× | -25.85 | -55.36 | — | 3509.30 | — | — |
| sandbox.exec | 0 files · uncontended | 101 | 38.73 | 598.77 | 5003.40 | 6541.26 | 1.22× | 2.09× | 1.17 | 2.69 | — | 3,622 | — | — |
| sandbox.exec | 1 files · contended | 15 | 34.20 | 44.99 | 44.99 | 53.95 | 0.93× | 0.53× | 1.43 | 2.60 | — | 5.30 | 34.204 ms per file | — |
| sandbox.exec | 1 files · uncontended | 7 | 31.42 | 37.49 | 37.49 | 51.16 | 0.94× | 0.55× | -0.65 | -1.96 | — | 5.30 | 31.417 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 67.91 | 67.91 | 67.91 | 72.76 | 0.97× | 0.97× | -3.66 | -7.01 | — | 104 | 3.3952 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 6 | 63.16 | 73.80 | 73.80 | 81.40 | 0.91× | 1.06× | -2.10 | -3.66 | — | 101 | 3.1578 ms per file | — |
| sandbox.exec | 2–4 files · contended | 35 | 37.80 | 54.55 | 64.83 | 106.34 | 0.97× | 0.78× | -0.29 | -0.96 | — | 11.70 | 13.927 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 49 | 36.55 | 51.88 | 69.85 | 71.35 | 0.96× | 0.79× | -2.07 | -4.84 | — | 8 | 15.6345 ms per file | — |
| sandbox.exec | 5–16 files · contended | 12 | 37.87 | 70.84 | 70.84 | 75.03 | 0.65× | 0.98× | 2.57 | 3.13 | — | 12.50 | 5.7719 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 16 | 45.26 | 72.56 | 72.56 | 75.02 | 0.64× | 0.69× | -4.20 | -7.66 | — | 22.20 | 4.8275 ms per file | — |
| sandbox.exec | — · contended | 5 | 9736.90 | 15931.29 | 15931.29 | 22929.74 | no baseline | no baseline | 3.71 | 7.91 | — | 60684.70 | — | — |
| sandbox.exec | — · uncontended | 27 | 426.50 | 22379.52 | 23009.27 | 36204.37 | 0.80× | 3.15× | 5.76 | 13.40 | — | 41917.10 | — | — |
| sandbox.mount | — · contended | 51 | 10.38 | 18.63 | 22.18 | 24.80 | 0.93× | 0.98× | 0.85 | 1.74 | 60 / 1,632 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 91 | 9.60 | 15.18 | 17.63 | 18.78 | 0.86× | 0.76× | -0.37 | -0.99 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 3.85 | 3.85 | 3.85 | 44.77 | no baseline | no baseline | -0.51 | -1.93 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 36 | 10.61 | 16.50 | 17.96 | 19.17 | 1.00× | 0.91× | -0.90 | -2.26 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 106 | 11.30 | 23.42 | 121.06 | 173.41 | 1.08× | 1.27× | 0.25 | 0.07 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 11 | 0.0 KiB | 586.3 KiB | 2,576 | ok 11 |
| branch.diff_commits | branch | 347 | 0.0 KiB | 19.1 MiB | 64,882 | ok 347 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 8 | 0.0 KiB | 70.8 KiB | 123 | ok 8 |
| branch.merge | branch | 7 | 0.0 KiB | 0.0 KiB | 0 | Merged 7 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 14 | 799.0 KiB | 0.0 KiB | 25 | Committed 14 |
| fs.diff_files | fs | 43 | 0.0 KiB | 390.7 KiB | 36 | Text 32, NoSuchPath 7, Equal 4 |
| fs.glob | fs | 50 | 0.0 KiB | 59.9 KiB | 757 | ok 50 |
| fs.grep | fs | 46 | 0.0 KiB | 162.0 KiB | 676 | ok 46 |
| fs.list | fs | 51 | 0.0 KiB | 238.5 KiB | 1,531 | ok 51 |
| fs.read | fs | 45 | 0.0 KiB | 169.9 KiB | 45 | ok 45 |
| fs.rm | fs | 4 | 0.0 KiB | 0.0 KiB | 4 | Committed 4 |
| fs.stat | fs | 44 | 0.0 KiB | 10.1 KiB | 44 | ok 44 |
| fs.write | fs | 716 | 20.2 MiB | 0.0 KiB | 716 | Committed 716 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 147 | 0.0 KiB | 0.0 KiB | 0 | Committed 117, UpToDate 29, Conflict 1 |
| sandbox.exec | sandbox | 426 | 2.3 MiB | 4.2 MiB | 0 | exit:0 424, exit:2 2 |
| sandbox.mount | sandbox | 152 | 0.0 KiB | 0.0 KiB | 0 | Mounted 152 |
| sandbox.status | sandbox | 3 | 0.0 KiB | 0.0 KiB | 0 | ok 3 |
| sandbox.unmount | sandbox | 152 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 152 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.94 · end 1.97.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.411 | 12.554 · 1.705 · 1.408 · 1.411 · 1.39 | 2.38–2.38 | statements 34, vm_steps 1182, fullscan_steps 0, sorts 0, returned_rows 99 |
| read | 1.54 | 1.809 · 1.54 · 1.452 · 1.434 · 1.709 | 2.38–2.38 | statements 19, vm_steps 858, fullscan_steps 0, sorts 0, returned_rows 84 |
| list_small | 1.308 | 1.547 · 1.286 · 1.308 · 1.243 · 1.433 | 2.38–2.38 | statements 19, vm_steps 867, fullscan_steps 0, sorts 0, returned_rows 84 |
| list_largest | 6.644 | 8.507 · 6.537 · 6.644 · 6.507 · 6.656 | 2.38–2.38 | statements 129, vm_steps 14943, fullscan_steps 0, sorts 0, returned_rows 1505 |
| grep_scoped | 1.593 | 1.847 · 1.593 · 1.746 · 1.552 · 1.323 | 2.38–2.38 | statements 24, vm_steps 1013, fullscan_steps 0, sorts 0, returned_rows 93 |
| glob_scoped | 1.444 | 1.264 · 1.444 · 1.196 · 1.814 · 1.569 | 2.38–2.38 | statements 18, vm_steps 846, fullscan_steps 0, sorts 0, returned_rows 83 |
| grep_tree | 4740.081 | 4886.386 · 4878.4 · 4652.788 · 4642.111 · 4740.081 | 1.99–2.27 | statements 49605, vm_steps 3881991, fullscan_steps 0, sorts 0, returned_rows 390374 |
| glob_tree | 8.255 | 10.082 · 8.255 · 8.265 · 7.485 · 6.937 | 1.99–1.99 | statements 131, vm_steps 18446, fullscan_steps 0, sorts 0, returned_rows 1878 |
| diff_files | 7.031 | 6.765 · 6.451 · 8.11 · 7.031 · 7.461 | 1.99–1.99 | statements 96, vm_steps 5032, fullscan_steps 0, sorts 0, returned_rows 504 |
| list_commits | 0.633 | 1.706 · 0.74 · 0.633 · 0.611 · 0.626 | 1.99–1.99 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.743 | 3.775 · 3.01 · 2.716 · 2.658 · 2.743 | 1.99–1.99 | statements 63, vm_steps 2314, fullscan_steps 0, sorts 0, returned_rows 260 |
| fork | 0.565 | 0.565 · 1.014 · 1.064 · 0.488 · 0.424 | 1.99–1.99 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 27.951 | 31.161 · 28.391 · 27.408 · 27.562 · 27.951 | 1.99–1.99 | statements 496, vm_steps 22888, fullscan_steps 0, sorts 0, returned_rows 1784 |
| oneshot_mount_unmount | 16.777 | 20.207 · 16.731 · 27.121 · 16.326 · 16.777 | 1.99–1.99 | statements 68, vm_steps 2402, fullscan_steps 82, sorts 2, returned_rows 235 |
| oneshot_commit | 76.085 | 86.049 · 84.501 · 76.085 · 72.961 · 70.197 | 1.99–2.15 | statements 191, vm_steps 12192, fullscan_steps 82, sorts 2, returned_rows 949 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.99–1.99 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r035: 242,230 pages of 4,096 B, 0 free · Commits 39,933 · Branches 799 · Layers 43 · compression 3.55× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 134,416 | 828.4 MiB |
| 2 | 52,644 | 771.4 MiB |
| 3 | 14,724 | 3.8 MiB |
| 4 | 44 | 8.7 KiB |
| 5 | 14,624 | 1.5 MiB |
| 6 | 98,192 | 480.6 MiB |
| 7 | 251,567 | 58.9 MiB |
| 8 | 503 | 158.0 KiB |
| 9 | 79,956 | 169.5 MiB |
| 10 | 43,066 | 5.3 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,270 | 185.6 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 40,916 | 80.0 MiB |
| 1 | 47,784 | 573.8 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 174,912 | 683.3 MiB | 24.2 MiB |
| inode_value | 39,360 | 153.8 MiB | 3.1 MiB |
| binding_hint | 11,080 | 43.3 MiB | 4.1 MiB |
| object_location | 9,575 | 37.4 MiB | 4.0 MiB |
| commit | 3,213 | 12.6 MiB | 2.0 MiB |
| file_digest | 1,205 | 4.7 MiB | 515.9 KiB |
| commit_lineage | 860 | 3.4 MiB | 397.5 KiB |
| commit_runs | 844 | 3.3 MiB | 455.5 KiB |
| commit_identity | 620 | 2.4 MiB | 288.9 KiB |
| content_signature | 157 | 628.0 KiB | 15.2 KiB |
| branch | 37 | 148.0 KiB | 31.3 KiB |
| branch_names | 14 | 56.0 KiB | 13.4 KiB |
| branch_identity | 9 | 36.0 KiB | 4.7 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 5 | 20.0 KiB | 6.5 KiB |
| layer | 3 | 12.0 KiB | 4.4 KiB |
| absorbed_heights | 3 | 12.0 KiB | 7.4 KiB |
| absorbed | 3 | 12.0 KiB | 7.4 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 256.2 s** (tooling): play 88.5 · consolidate 102.0 · verify 23.3 · probes 24.9 · tests 0.0 · seal + snapshot 7.1 · report 10.4

256.16 s tooling: prepare 1.61 · play 86.88 · consolidate 101.97 · verify 12.71 (diff_commits + full compareTree) · version walk 10.62 · probes 24.90 · metrics 0.73 · seal 1.34 · sealed figures 2.92 · snapshot copy 2.83 · report 0.35

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T00:47:15.129Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.77× it; Scaling: not judged: stat (chain-bounded): 5 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: oneshot_mount_unmount.vm_steps: depth exponent 0.947; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (8 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-035.a1.json`
- trace `~/lfs-history/runs/p3-main-u/trace/range-035.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-u/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-035.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r035-2-agents-notes | 927 | 372.8 KiB |
| r035-1-packages-core | 838 | 371.8 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 330.0 | 3,031 |
| `git diff --stat` | 39.0 | 3,019 |
| `git add -f` | 31.0 | — |
| `git rm --cached` | 10.0 | — |
| `git commit` | 36.0 | 3,024 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r035-2-agents-notes | end | P1 | pass | — | — |
| r035-2-agents-notes | end | P2 | pass | exit 0 | — |
| r035-2-agents-notes | end | P3 | n/a | an install, not a refresh | — |
| r035-2-agents-notes | end | P4 | pass | 218 emitted files, exit 2 | — |
| r035-2-agents-notes | end | P5 | pass | 32 files | — |
| r035-2-agents-notes | end | P6 | n/a | not a repair | — |
| r035-1-packages-core | end | P1 | pass | — | — |
| r035-1-packages-core | end | P2 | pass | exit 0 | — |
| r035-1-packages-core | end | P3 | pass | 244 bookkeeping path(s) | — |
| r035-1-packages-core | end | P4 | pass | 468 emitted files, exit 2 | — |
| r035-1-packages-core | end | P5 | pass | 146 files | — |
| r035-1-packages-core | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1657 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
