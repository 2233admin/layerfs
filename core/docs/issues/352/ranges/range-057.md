# Range 057 · **optimize** · attempt 1

**Matches git ✓** · daemon `32eda22d657d` · image `d3773b4e` · plan v2 · continued from r056 (live Store)
dsh `997932ffd`..`085383b14` · **61 commits** (7 mainline, 54 side) · 2026-07-30 → 2026-07-31
Areas changed: `packages/client` 14% · `/` 10% · `examples/acp-agent` 9% · other 67%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.15×** · **Churn 0.00**
**Time split:** play 121.0 s · git 133.1 s · Node 262.9 s · verify 16.9 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **868.1 MiB** (+3.1 MiB) | **1.62 GiB** (+28.7 MiB) | **1.92×** (prev 1.89×) | **31.9 MiB** | **1,194** (total 67,927) | **339.9 s** tooling (total 216.9 min) |

**Checks:** 14 pass · 4 watch: Speed fs.apply ≤8 KiB · uncontended: 1.79× baseline (commit); not judged: branch.publish — · uncontended: 1/1/2 calls (2.15×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.68×) (baseline class under 5 calls per range); Scaling branch.diff_commits checkpoint statements in total (entries exponent 0.004): tree files exponent 0.628; Contended work not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (18 classes too narrow); SQL per call (sql.call); Directory share 0.509 · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ sandbox.commit p95 +87% · ▼ fs.list p95 −46% · ▼ probe fork −42%
**Budget:** 58 of 202 ranges · projected total 16.6 h (budget 16.8 h) · disk 44% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **5,206 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,238 / 2,238 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3291 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 433 bin shims, 4764 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (61 lines from 4 .gitignore files) · **160 picks** in 3 merges (160 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `085383b14`** · 126 commits written for 126 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 104 untracked, unignored (955,793 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 160 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r057-3-examples-acp-agent | end | `ecd704e7da86` | `27634e0a233b` | pass (435 normalized) | pass | pass | pass | pass | n/a |
| r057-1-packages-client | end | `254de602c156` | `27634e0a233b` | pass (435 normalized) | pass | pass | pass | pass | n/a |
| r057-2-root | end | `831f7abf8a8e` | `78c571a9048a` | pass (437 normalized) | pass | n/a | pass | pass | n/a |
| lead | repair | `dbef0975b2d5` | `null` | n/a | pass | n/a | n/a | pass | pass (137,678 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/client/ui-models/tests/apply.spec.ts` (fails natively) · `packages/client/ui-models/tests/components.spec.tsx` (fails natively) · `packages/client/ui-models/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-models/tests/onboarding-dialog.spec.tsx` (fails natively) · `packages/client/ui-models/tests/readiness.spec.ts` (fails natively) · `packages/client/ui-models/tests/store.spec.ts` (fails natively) · `packages/client/ui-model/tests/model-select.spec.tsx` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/client/ui-model/tests/browser-plugin.spec.ts` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-reconstruction.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively) · `packages/typert/generator/tests/cordis-catalog.spec.ts` (fails natively) · `packages/llm/llm/tests/invariant.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-fork.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/dynamic-config.spec.ts` (fails natively) · `packages/llm/llm/tests/topology.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/loader-composition.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/dynamic-config.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-config.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/transport-recovery.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/typert/generator/tests/tools-catalog.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/loader-composition.spec.ts` (fails natively).

## 2. Activity

**2,987 calls** · **156 steps** by **8 agents + lead** on **3 Branches + main** · **198 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +110 added · 978 modified · −48 deleted · 19.7 MiB written · fs 1,045 : Sandbox 91 (**11 : 1**, reported only in P3)
**Execs:** 527 (JS 58 · shell 469) · 3 non-zero exits · install 0 · test runs 4 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,405 | 1,058 | 347 | Committed 1,058 · NoSuchPath 19 · Text 36 · Equal 2 |
| sandbox | 1,122 | 722 | 4 | commit 195 (Committed 151, UpToDate 43, Conflict 1) · exec 527 (exit:0 524, exit:2 3) · mount 198 (Mounted 198) · status 4 · unmount 198 (Unmounted 198) |
| branch | 450 | 32 | 418 | diff_branches 13 · diff_commits 405 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,987** | **1,812** | **779** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r057-1-packages-client | a01 a02 a03 | 58 | 341 | ✓ | — |
| r057-2-root | a04 a05 | 44 | 335 | ✓ | — |
| r057-3-examples-acp-agent | a06 a07 a08 | 48 | 331 | ✓ | — |
| main | lead | 6 | 187 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r057-2, a04 after a05 | 0.1 s |
| Stale clean merge | 1 / 1 | r057-2, a04 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r057-2, a05 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r057-1 | 18 | 11 | 7 | 0 | 0 | 75 | — |
| a02 | r057-1 | 15 | 9 | 6 | 0 | 0 | 86 | — |
| a03 | r057-1 | 25 | 12 | 13 | 0 | 0 | 180 | — |
| a04 | r057-2 | 23 | 11 | 12 | 0 | 0 | 215 | commit-conflict, stale-clean-merge, decoy |
| a05 | r057-2 | 21 | 8 | 13 | 0 | 0 | 120 | commit-conflict, stale-clean-merge, decoy |
| a06 | r057-3 | 17 | 8 | 9 | 0 | 0 | 39 | — |
| a07 | r057-3 | 14 | 7 | 7 | 0 | 0 | 76 | — |
| a08 | r057-3 | 17 | 7 | 10 | 0 | 0 | 216 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 187 | — |
| **Total** |  | **156** | **74** | **77** | **5** | **0** | **1,194** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 110 · pnpm 1 · tsc 3 · vitest 4 · other 409

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r057-1-packages-client | 39 | 39 | 39 | 1 | 39 | 719 |
| r057-3-examples-acp-agent | 35 | 35 | 34 | 1 | 35 | 701 |
| r057-2-root | 29 | 29 | 28 | 3 | 29 | 544 |
| **lead** | — | — | — | — | 126 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r057-3-examples-acp-agent | 0 | 1 | 1 | 1 | 23 | 23 / 23 |
| r057-1-packages-client | 0 | 1 | 1 | 1 | 126 | 126 / 126 |
| r057-2-root | 1 | 0 | 1 | 1 | 62 | 62 / 62 |
| **lead repair** | 1 | — | 1 | — | — | 137,678 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r056) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 865.1 MiB (29.0 MiB / 692.1 MiB / 27.0 MiB / 117.1 MiB) | 868.1 MiB (29.4 MiB / 692.1 MiB / 27.4 MiB / 119.3 MiB) | +3.1 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,816 / 10,084 / 4,758 | 64,938 / 10,095 / 4,772 | +122 / +11 / +14 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.60 GiB | 1.62 GiB | +28.7 MiB |
| **Space amplification** (total · tracked) | 1.89× · tracked 4.91× | 1.92× · tracked 4.91× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.31** (0.77 / 0.18 / 0.81) | 0.72× the median range |
| **Stored per Commit** | 25.3 KiB | 24.5 KiB | — |
| Metadata share | 0.45 | 0.45 | this range 0.51 |
| History: Commits / Layers / Branches | 66,733 | 67,927 / 40 / 956 | +1,194 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 9.89 GiB (Commits 7.36 GiB · installs 831.1 MiB · build 92.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 37.85 GiB / 44% | — |
| Snapshot | — | r057, 1.40 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 914.3 MiB | 1.05 | +12.5 MiB |
| Metadata | 151.8 MiB | 0.17 | +3.1 MiB |
| Index rows | 516.3 MiB | 0.59 | +11.8 MiB |
| Waste | 78.2 MiB | 0.09 | +1.2 MiB |
| Other | 2.0 MiB | 0.00 | +36.0 KiB |
| **Total = Store on disk** | **1.62 GiB** | **= 1.92** space amplification | +28.7 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 29.4 MiB | 144.4 MiB (75.2 MiB + 69.2 MiB) | 4.91× | — | 2.0 MiB | 6.0 MiB | 0.34 |
| `node_modules` | 692.1 MiB | 240.0 MiB (201.5 MiB + 38.5 MiB) | 0.35× | — | 995.4 KiB | 606.3 KiB | 1.64 |
| Build output | 27.4 MiB | 34.6 MiB (31.8 MiB + 2.8 MiB) | 1.26× | — | 1.4 MiB | 9.6 MiB | 0.14 |
| `.git` | 119.3 MiB | 590.0 MiB (562.5 MiB + 27.5 MiB) | 4.95× | — | 11.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 596.6 MiB | — (not divided) | — | 13.1 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 57.3 MiB | — | — | — | — | — |
| **Total** | — | **1.62 GiB** | **= 1.92×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 221,031 | +4,335 | 6.5 KiB | 0 (derived) | 51% |
| Chunks (large files) | 76,746 | +1,113 | 16.0 KiB | — | 58% |
| Large-file extents | 18,380 | — | 0.4 KiB | — | — |
| Directories | 547,111 | 4,521 (with inodes, pooled) | 0.3 KiB | — | 56% |
| Inodes and attributes | 445,691 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,537 | +4,812 | 0.1 KiB | — | — |

Delta: 3.0% at depth cap · 19% of refused bases stopped by budget · `node_modules` reinstall: absolute: 908041 new stored bytes for 363793 raw changed bytes of 19 changed packages (2.496×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.91× (144.4 MiB for 29.4 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.8 KiB / 4.9 KiB / 9.7 KiB over 229 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.15× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.3 MiB stored for 2.03 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.64 (3 lanes × 868.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.5 KiB (budget not set) |

## 4. Speed

Daemon `32eda22d657d` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 10.0 ms / 27.3 ms (1.11×) | 2.9 ms / 6.8 ms (1.08×) | 3.7 ms / 6.1 ms (1.08×) | 27.3 ms / 117 ms (1.28×) | 10.0 ms / 17.8 ms (0.99×) | 514 ms / 514 ms (1.05×) | — (native comparison in P3; exec 40.1 ms / 1184 ms) |
| SQL p50: 179 stmts | 65 stmts | 63 stmts | 281 stmts | 51 stmts | 11,215 stmts | — |

**Commit cost:** 7.57 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 877 ms p50 over 198
**Slowest:** sandbox.exec 38073 ms · sandbox.exec 32180 ms · sandbox.exec 30516 ms · checkpoint diff_commits 0.11 ms and 1.59 statements per entry (74,380 entries per page)
**Scaling:** 4 of 15 probes flat · `read` 2.90 · `list_largest` 1.39 · `grep_scoped` 4.47 · `glob_scoped` 4.55 · `grep_tree` 0.73 · `glob_tree` 2.60 · `diff_files` 5.34 · `diff_commits` 2.54 · `merge` 1.75 · `oneshot_mount_unmount` 0.92 · `oneshot_commit` 1.76

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 423 ms / 423 ms | — / — | — | git / status-cold: — |
| git status (steady) | 536 ms / 713 ms | — / — | — | git / status-steady: — |
| git add | 44.0 ms / 93.0 ms | — / — | — | git / add: — |
| git commit (lane) | 46.0 ms / 68.0 ms | — / — | — | git / commit: — |
| lead writes main | 5779 ms / 5779 ms | — / — | — | — |
| repack | 2714 ms / 2714 ms | — / — | — | — |
| pnpm install (incremental) | 3064 ms / 3064 ms | 2236 ms / 2236 ms | 1.37× | pnpm-reinstall / cold: — |
| pnpm refresh | 3229 ms / 3229 ms | 2109 ms / 2109 ms | 1.53× | pnpm-reinstall / steady: — |
| tsc -b | 14092 ms / 14092 ms | 11710 ms / 15393 ms | 1.20× | tsc-b / cold: — |
| vitest | 17751 ms / 17751 ms | 12746 ms / 12746 ms | 1.39× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 13.0 ms / 26.0 ms

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
| 047.a1 | 56578 | 1359.1 | 8.35 (1.41×) · 7640 · 335 (21 solo) | 8.40 (1.35×) · 7202 · 410 (88 solo) | 8.54 (1.17×) · 6821 · 418 (67 solo) | 2.54 (1.28×) · 3466 · 131 (1 solo) | 9.45 (1.04×) · 1362 · — (daemon) | 11.63 (1.39×) · 5490 · — (daemon) | 433.20 (—×) · 654351 · 15082 (4 solo) |
| 048.a1 | 58088 | 1390.3 | 8.33 (1.41×) · 7008 · 378 (15 solo) | 7.76 (1.25×) · 6851 · 262 (85 solo) | 9.03 (1.24×) · 6564 · 313 (61 solo) | 2.81 (1.41×) · 3334 · 111 (7 solo) | 9.90 (1.08×) · 1362 · — (daemon) | 9.04 (1.08×) · 4602 · — (daemon) | 327.87 (—×) · 344822 · 9703 (3 solo) |
| 049.a1 | 59295 | 1426.0 | 8.07 (1.37×) · 6352 · 328 (10 solo) | 8.18 (1.32×) · 6850 · 307 (54 solo) | 8.84 (1.21×) · 7371 · 362 (51 solo) | 3.27 (1.64×) · 4122 · 75 (7 solo) | 9.92 (1.09×) · 1362 · — (daemon) | 10.33 (1.24×) · 4329 · — (daemon) | 213.34 (—×) · 334840 · 7279 (4 solo) |
| 050.a1 | 60450 | 1462.0 | 7.36 (1.25×) · 7605 · 383 (12 solo) | 8.30 (1.34×) · 7756 · 375 (45 solo) | 8.39 (1.15×) · 6315 · 414 (17 solo) | 2.75 (1.38×) · 3950 · 225 (3 solo) | 9.61 (1.05×) · 1362 · — (daemon) | 8.81 (1.06×) · 3657 · — (daemon) | 459.51 (—×) · 530087 · 12571 (3 solo) |
| 051.a1 | 61383 | 1486.0 | 8.40 (1.42×) · 7415 · 341 (22 solo) | 7.57 (1.22×) · 6531 · 238 (89 solo) | 7.62 (1.04×) · 6446 · 278 (97 solo) | 2.55 (1.28×) · 3609 · 71 (8 solo) | 9.41 (1.03×) · 1362 · — (daemon) | 10.36 (1.24×) · 5130 · — (daemon) | 361.34 (—×) · 426337 · 10118 (3 solo) |
| 052.a1 | 62546 | 1527.8 | 8.42 (1.43×) · 7262 · 342 (30 solo) | 7.84 (1.26×) · 6616 · 294 (59 solo) | 8.42 (1.15×) · 6023 · 385 (71 solo) | 2.54 (1.28×) · 3082 · — (0 solo) | 9.94 (1.09×) · 1362 · — (daemon) | 8.67 (1.04×) · 4221 · — (daemon) | 367.37 (—×) · 482357 · 12922 (3 solo) |
| 053.a1 | 63409 | 1550.9 | 8.89 (1.51×) · 7121 · 293 (18 solo) | 8.78 (1.41×) · 6567 · 421 (50 solo) | 10.08 (1.38×) · 6512 · 450 (40 solo) | 2.67 (1.34×) · 4309 · 235 (2 solo) | 10.60 (1.16×) · 1362 · — (daemon) | 9.77 (1.17×) · 4992 · — (daemon) | 247.84 (—×) · 324874 · 8146 (3 solo) |
| 054.a1 | 64802 | 1581.6 | 7.91 (1.34×) · 6951 · 232 (25 solo) | 8.69 (1.40×) · 6748 · 292 (52 solo) | 9.06 (1.24×) · 6801 · 344 (57 solo) | 2.41 (1.21×) · 3590 · 53 (2 solo) | 9.82 (1.08×) · 1362 · — (daemon) | 8.88 (1.06×) · 5205 · — (daemon) | 367.61 (—×) · 504299 · 12592 (4 solo) |
| 055.a1 | 65543 | 1604.4 | 9.52 (1.61×) · 7149 · 262 (24 solo) | 10.65 (1.71×) · 7457 · 339 (83 solo) | 9.23 (1.27×) · 5796 · 333 (56 solo) | 3.19 (1.60×) · 4074 · 77 (6 solo) | 10.30 (1.13×) · 1362 · — (daemon) | 9.66 (1.16×) · 3942 · — (daemon) | 422.43 (—×) · 350398 · 10094 (3 solo) |
| 056.a1 | 66733 | 1634.0 | 10.66 (1.81×) · 7896 · 313 (11 solo) | 10.31 (1.66×) · 7283 · 341 (25 solo) | 10.65 (1.46×) · 6820 · 413 (30 solo) | 3.04 (1.52×) · 3866 · 35 (2 solo) | 11.63 (1.27×) · 1362 · — (daemon) | 8.99 (1.08×) · 4188 · — (daemon) | 457.77 (—×) · 382689 · 11272 (4 solo) |
| 057.a1 | 67927 | 1662.7 | 8.31 (1.41×) · 7370 · 369 (21 solo) | 8.37 (1.35×) · 6968 · 411 (60 solo) | 9.24 (1.27×) · 7403 · 435 (75 solo) | 2.85 (1.43×) · 4010 · 128 (2 solo) | 9.97 (1.09×) · 1437 · — (daemon) | 8.64 (1.04×) · 5397 · — (daemon) | 513.59 (—×) · 634430 · 15544 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4194304 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2863432 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 5.76 at the first command → 8.27 after the last (max 8.37 over 8 commands) · Docker VM 1.47 → 1.64

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
| control-047.a1 | 12851 · 207.8 | 56578 · 1356.7 | 15.13 (2.44× first) / 5.85 · 0.39× · 114/127 | 9.49 (1.49× first) / 6.35 · 0.67× · 109/125 | 3.13 (1.12× first) / 3.46 · 1.10× · 89/130 | 12.40 → 14.05 | pass |
| control-048.a1 | 12851 · 207.8 | 58088 · 1390.3 | 5.27 (0.85× first) / 4.91 · 0.93× · 113/128 | 4.58 (0.72× first) / 4.72 · 1.03× · 111/125 | 2.30 (0.83× first) / 3.17 · 1.38× · 89/164 | 7.99 → 7.67 | pass |
| control-049.a1 | 12851 · 207.8 | 59295 · 1423.3 | 5.78 (0.93× first) / 5.60 · 0.97× · 114/139 | 5.80 (0.91× first) / 5.66 · 0.98× · 109/127 | 2.72 (0.98× first) / 3.27 · 1.20× · 89/164 | 16.50 → 15.82 | pass |
| control-050.a1 | 12851 · 207.8 | 60450 · 1462.0 | 8.62 (1.39× first) / 6.89 · 0.80× · 114/131 | 12.07 (1.89× first) / 7.13 · 0.59× · 110/126 | 6.75 (2.42× first) / 5.18 · 0.77× · 90/161 | 6.45 → 7.13 | pass |
| control-051.a1 | 12851 · 207.8 | 61383 · 1486.0 | 6.69 (1.08× first) / 5.70 · 0.85× · 116/156 | 5.60 (0.88× first) / 4.93 · 0.88× · 112/127 | 2.61 (0.94× first) / 2.92 · 1.12× · 90/144 | 7.43 → 7.15 | pass |
| control-052.a1 | 12851 · 207.8 | 62546 · 1527.8 | 5.48 (0.88× first) / 6.37 · 1.16× · 116/130 | 5.38 (0.84× first) / 5.50 · 1.02× · 111/127 | 2.69 (0.96× first) / 2.85 · 1.06× · 90/145 | 8.02 → 7.62 | pass |
| control-053.a1 | 12851 · 207.8 | 63409 · 1550.9 | 5.28 (0.85× first) / 6.45 · 1.22× · 113/142 | 5.34 (0.84× first) / 5.66 · 1.06× · 111/125 | 2.77 (0.99× first) / 2.78 · 1.00× · 90/123 | 7.87 → 7.64 | pass |
| control-054.a1 | 12851 · 207.8 | 64802 · 1581.6 | 5.87 (0.95× first) / 5.30 · 0.90× · 116/129 | 6.10 (0.95× first) / 5.30 · 0.87× · 110/124 | 2.46 (0.88× first) / 2.92 · 1.19× · 74/117 | 9.96 → 9.48 | pass |
| control-055.a1 | 12851 · 207.8 | 65543 · 1604.4 | 5.43 (0.87× first) / 5.86 · 1.08× · 116/132 | 5.58 (0.87× first) / 5.82 · 1.04× · 111/128 | 2.47 (0.88× first) / 3.15 · 1.28× · 74/109 | 5.70 → 5.75 | pass |
| control-056.a1 | 12851 · 207.8 | 66733 · 1634.0 | 8.03 (1.29× first) / 7.10 · 0.88× · 121/135 | 7.29 (1.14× first) / 8.01 · 1.10× · 112/129 | 3.08 (1.11× first) / 3.14 · 1.02× · 72/124 | 5.59 → 5.86 | pass |
| control-057.a1 | 12851 · 207.8 | 67927 · 1662.7 | 8.61 (1.39× first) / 5.59 · 0.65× · 113/130 | 5.75 (0.90× first) / 5.64 · 0.98× · 111/128 | 2.60 (0.93× first) / 4.08 · 1.57× · 72/112 | 8.25 → 8.15 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-057.a1)

## 5. Findings and action

### Finding 057.a1 · optimize

**1. Trigger** (attempt 1, daemon `32eda22d657d`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | oneshot_mount_unmount.statements: depth exponent 1.503 | < 0.05 |

Diagnosis pending: `finding-057.a1.json`.

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

- **a1 (`p3-main-x`, daemon `32eda22d`): OPTIMIZE, terminal under the fast-mode ruling (row recorded).** Checkpoint ok, git ✓. Node: 3 lane points P1–P5 pass, repair P6 pass. Control `control-057.a1` passes. Report check F1–F8 PASS. Native first passed with no fix.
- **Optimize row, Counters: `oneshot_mount_unmount.statements`, depth exponent 1.50 (66).** Cold mount: 62 statements, 8 blob opens. The 61–70 handoff carries the question of what sets the blob count.
- **Speed watch: `fs.apply` ≤8 KiB, uncontended.**
  - p50 12.1 ms, 1.79× baseline, about 5.4 ms over the floor, slowest phase commit.
  - It has read 1.57–1.88× in every range r51–r57 (p50 10.7–12.8 ms) with 135–179 statements per call. That is a steady excess of about 4–6 ms against the baseline's p50, not a trend.
- **F-063 active:** chunk PREFIX 501 vs FULL 227 over 103 lane git Commits (100 with a PREFIX chunk).
- **Storage watch:**

  | | r57 | r56 |
  | --- | --- | --- |
  | Store | +28.7 MiB | +29.6 MiB |
  | `.git` stored | +11.1 MiB | +11.6 MiB |
  | Index rows | +11.8 MiB (504.5 → 516.3 MiB) | |

- **Clean:** the `-d` clean removed 104 files (956 KB; `tool-cordis` emitted files again) and no folder.
- **Steps:**
  - Lead 3 s. Cuts 19, 39 and 50: 21, 21 and 12 s; the cuts avoid the stale-clean-merges at 19.8–38 and 40.6–41.4. Lanes 79 s.
  - Repair 131 s (install 38.1, build 32.2, tests 2.3).
  - Verify 21 s. Finish 62 s of 90 s.
  - Host load 5.8–8.4.
- **Snapshot:** 1,431.7 MiB new, 5.3 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2238/2238; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.apply ≤8 KiB · uncontended: 1.79× baseline (commit); not judged: branch.publish — · uncontended: 1/1/2 calls (2.15×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.68×) (baseline class under 5 calls per range) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint statements in total (entries exponent 0.004): tree files exponent 0.628 | < 0.15 | watch |
| Counters | oneshot_mount_unmount.statements: depth exponent 1.503 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (18 classes too narrow); SQL per call (sql.call) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.509 | < 0.5 | watch |
| Reinstall growth | absolute: 908041 new stored bytes for 363793 raw changed bytes of 19 changed packages (2.496×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0304 (budget 0.1929) | < 0.1 | pass |
| Range growth | 31.9 MiB, 1.21× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 5294 ms for 1431.7 MiB new; size exponent -0.32 | < 0.15 | pass |
| Disk projection | 0.44 | < 0.8 | pass |
| Wall projection | 0.99 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 126 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 160 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.15× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 156 | 157 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1194 | 1079 |
| Workspaces (one-shot share) | 198 (0.99) | 76 (0.974) |
| Reads | 298 | 298 |
| Reconcile writes | 180 | 180 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `32eda22d657d` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 13 | 19.70 | 581.43 | 581.43 | 678.41 | 0.78× | 1.32× | 1.88 | 2.80 | 234 / 25,728 / 0 | — | 0.0817 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 15.52 | 15.52 | 15.52 | 15.52 | 1.07× | 1.07× | -0.80 | -1.63 | 214 / 23,000 / 0 | — | 0.3234 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 382.66 | 382.66 | 382.66 | 382.66 | 1.28× | 1.28× | -5.07 | -6.29 | 9,408 / 367,892 / 0 | — | 1.8666 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 398 | 20.54 | 41.99 | 67.02 | 420.90 | 0.98× | 1.03× | 0.65 | 1.01 | 304 / 34,972 / 0 | — | 0.1117 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.19 | 2.57 | 2.57 | 5.23 | 2.32× | 1.50× | -0.66 | -0.12 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · contended | 1 | 1.16 | 1.16 | 1.16 | 1.16 | no baseline | no baseline | — | — | 85 / 1,901 / 0 | — | 0.0581 ms per entrie | — |
| branch.list_commits | 17–64 entries · uncontended | 1 | 0.94 | 0.94 | 0.94 | 0.94 | 1.02× | 1.02× | 1.73 | 2.38 | 70 / 1,298 / 0 | — | 0.0472 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 513.59 | 513.59 | 513.59 | 562.86 | 1.05× | 1.05× | 3.63 | 4.58 | 11,215 / 634,430 / 0 | — | 2.6931 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.70 | 1.70 | 1.70 | 1.70 | 1.09× | 1.09× | — | — | 35 / 517 / 0 | — | 0.0104 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 13.05 | 13.05 | 13.05 | 13.05 | 2.15× | 2.15× | 8.17 | 13.65 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 44.66 | 44.66 | 44.66 | 44.66 | 1.68× | 1.68× | 1.36 | 2.81 | 184 / 13,962 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 3 | 10.41 | 10.41 | 10.41 | 12.80 | 1.50× | 0.99× | -1.69 | -2.90 | 162 / 7,388 / 0 | — | 0.0294 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 13.15 | 13.15 | 13.15 | 13.15 | 1.10× | 1.10× | 8.79 | 10.49 | 146 / 5,259 / 0 | — | 0.0015 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 2 | 8.34 | 8.34 | 8.34 | 24.68 | 1.17× | 0.86× | 0.30 | -0.16 | 137 / 7,573 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 10 | 16.66 | 34.63 | 34.63 | 50.47 | 1.17× | 0.91× | 7.32 | 10.01 | 301 / 25,717 / 82 | — | 0.0071 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 8 | 12.14 | 14.28 | 14.28 | 14.29 | 1.79× | 1.30× | 1.04 | 1.42 | 149 / 8,541 / 0 | — | 0.0031 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 4 | 7.73 | 9.31 | 9.31 | 10.62 | 0.87× | 0.80× | -1.16 | -2.22 | 208 / 11,077 / 0 | — | 0.0075 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 24 | 8.61 | 13.11 | 14.63 | 14.68 | 1.17× | 1.14× | 1.50 | 2.69 | 176 / 10,123 / 0 | — | 0.0262 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 3 | 9.42 | 9.42 | 9.42 | 16.78 | 1.00× | 0.74× | 1.59 | 1.39 | 247 / 11,202 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 9 | 11.21 | 12.13 | 12.13 | 13.03 | 1.23× | 0.99× | 2.92 | 4.22 | 211 / 12,115 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 8.70 | 8.70 | 8.70 | 14.39 | 1.20× | 0.81× | 2.54 | 4.39 | 227 / 11,673 / 0 | — | 0.0084 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 10 | 9.07 | 12.04 | 12.04 | 12.17 | 1.17× | 1.16× | 3.09 | 4.29 | 178 / 10,110 / 0 | — | 0.0033 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 2.35 | 2.35 | 2.35 | 3.07 | 1.82× | 1.82× | 0.93 | 1.83 | 46 / 3,608 / 0 | — | 2.348 ms per file | — |
| fs.glob | 17–64 files · contended | 4 | 7.03 | 7.09 | 7.09 | 7.80 | 1.64× | 1.08× | 5.92 | 9.20 | 165 / 14,479 / 0 | — | 0.269 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 4.11 | 6.58 | 6.58 | 7.77 | 0.71× | 0.85× | 2.03 | 1.86 | 65 / 6,197 / 0 | — | 0.165 ms per file | — |
| fs.glob | 2–4 files · contended | 3 | 4.20 | 4.20 | 4.20 | 7.32 | 1.28× | 1.03× | 0.38 | 1.42 | 71 / 5,754 / 0 | — | 1.4013 ms per file | — |
| fs.glob | 2–4 files · uncontended | 8 | 2.68 | 3.16 | 3.16 | 5.02 | 0.95× | 0.90× | -2.54 | -4.10 | 45 / 3,815 / 0 | — | 0.7665 ms per file | — |
| fs.glob | 5–16 files · uncontended | 12 | 2.71 | 3.14 | 3.14 | 4.37 | 0.88× | 0.64× | 1.88 | 2.15 | 52 / 4,284 / 0 | — | 0.3623 ms per file | — |
| fs.glob | >64 files · contended | 4 | 4.56 | 6.03 | 6.03 | 7.46 | 0.86× | 0.80× | 4.09 | 5.70 | 94 / 9,031 / 0 | — | 0.0179 ms per file | — |
| fs.glob | >64 files · uncontended | 8 | 7.86 | 10.77 | 10.77 | 55.48 | 1.45× | 0.59× | 6.21 | 8.63 | 109 / 15,675 / 0 | — | 0.0144 ms per file | — |
| fs.grep | 1 files · uncontended | 2 | 3.13 | 3.13 | 3.13 | 3.46 | 1.08× | 1.08× | -1.90 | -2.29 | 49 / 3,166 / 0 | — | 3.135 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 6 | 10.70 | 34.85 | 34.85 | 38.91 | 1.22× | 3.49× | -0.81 | -0.24 | 277 / 18,076 / 0 | — | 0.3778 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 13 | 9.42 | 18.81 | 18.81 | 35.59 | 0.84× | 1.44× | 3.04 | 4.14 | 221 / 12,894 / 0 | — | 0.4198 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 6.07 | 6.07 | 6.07 | 6.07 | 1.69× | 1.22× | 3.48 | 6.84 | 150 / 11,151 / 0 | — | 2.0247 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 3.12 | 3.29 | 3.29 | 4.41 | 0.82× | 0.67× | 3.10 | 3.86 | 67 / 4,395 / 0 | — | 1.027 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 3 | 4.14 | 4.14 | 4.14 | 6.05 | 0.73× | 0.73× | -3.23 | -4.31 | 89 / 5,108 / 0 | — | 0.7561 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 9 | 4.55 | 5.47 | 5.47 | 36.81 | 0.82× | 0.66× | 0.22 | 0.24 | 106 / 5,804 / 0 | — | 0.6012 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 38.83 | 38.83 | 38.83 | 64.33 | 1.60× | 1.60× | -0.41 | 2.13 | 973 / 42,054 / 0 | — | 0.2144 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 10 | 36.17 | 43.23 | 43.23 | 63.11 | 1.49× | 1.04× | 4.55 | 7.03 | 971 / 29,981 / 0 | — | 0.1284 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 2 | 3.34 | 3.34 | 3.34 | 4.27 | 2.72× | 2.72× | — | — | 48 / 3,650 / 0 | — | 3.338 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 14 | 3.42 | 8.18 | 8.18 | 15.12 | 0.99× | 1.06× | 0.66 | 1.78 | 61 / 5,305 / 0 | — | 0.0759 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 4.42 | 4.42 | 4.42 | 4.42 | 1.36× | 1.34× | 5.42 | 8.39 | 64 / 5,379 / 0 | — | 1.1062 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 6 | 2.44 | 2.61 | 2.61 | 4.69 | 0.99× | 0.80× | 3.34 | 4.73 | 43 / 4,068 / 0 | — | 0.869 ms per entrie | — |
| fs.list | 5–16 entries · contended | 8 | 4.59 | 5.36 | 5.36 | 8.24 | 1.35× | 0.97× | 2.77 | 4.05 | 83 / 8,368 / 0 | — | 0.4587 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 16 | 3.51 | 3.93 | 3.93 | 4.69 | 1.08× | 0.72× | 2.40 | 3.07 | 62 / 4,862 / 0 | — | 0.4146 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 3.73 | 3.73 | 3.73 | 3.73 | 0.93× | 0.86× | -1.85 | -5.14 | 102 / 5,133 / 0 | — | 0.0052 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 6 | 2.80 | 6.30 | 6.30 | 10.54 | 1.10× | 2.13× | 1.41 | 1.75 | 67 / 4,233 / 0 | — | 0.0038 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 2.40 | 2.40 | 2.40 | 2.88 | 0.84× | 0.77× | 0.15 | 0.55 | 65 / 4,071 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 10 | 3.00 | 4.77 | 4.77 | 33.09 | 0.90× | 0.91× | 3.46 | 4.34 | 67 / 4,893 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 31 | 2.85 | 5.08 | 6.79 | 9.91 | 1.08× | 0.82× | 1.75 | 2.48 | 63 / 4,010 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 3 | 12.87 | 12.87 | 12.87 | 15.35 | 1.26× | 0.69× | -2.34 | -4.29 | 193 / 13,932 / 0 | — | 12.87 ms per file | commit |
| fs.rm | 1 files · uncontended | 43 | 8.02 | 14.96 | 23.70 | 24.43 | 0.89× | 1.07× | 0.09 | 0.67 | 141 / 7,334 / 0 | — | 8.015 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 7 | 2.75 | 3.66 | 3.66 | 22.30 | 0.97× | 1.10× | 0.41 | 0.93 | 59 / 3,730 / 0 | — | 0.0052 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.96 | 2.96 | 2.96 | 6.28 | 1.21× | 1.21× | 3.03 | 4.51 | 43 / 3,692 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 4 | 2.15 | 2.89 | 2.89 | 3.02 | 0.89× | 0.93× | 2.55 | 3.26 | 52 / 3,295 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 7 | 2.28 | 2.64 | 2.64 | 3.08 | 0.81× | 0.73× | 0.84 | 1.14 | 45 / 3,058 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 4 | 4.55 | 5.10 | 5.10 | 16.03 | 1.66× | 1.66× | 6.97 | 10.27 | 59 / 4,261 / 0 | — | 0.0008 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 21 | 2.65 | 3.35 | 3.35 | 3.99 | 1.11× | 1.08× | 2.49 | 3.62 | 47 / 4,003 / 0 | — | 0.001 ms per byte | — |
| fs.write | >512 KiB · contended | 6 | 14.27 | 23.96 | 23.96 | 30.07 | 0.83× | 1.39× | 0.59 | 0.08 | 326 / 12,629 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 5 | 11.86 | 12.71 | 12.71 | 25.94 | 1.00× | 0.86× | 0.80 | 1.59 | 151 / 6,048 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 32 | 14.65 | 65.52 | 69.06 | 77.57 | 1.00× | 0.96× | 0.57 | 0.13 | 347 / 18,255 / 0 | — | 0.0278 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 93 | 8.31 | 18.16 | 27.26 | 45.38 | 1.09× | 1.17× | 0.99 | 1.56 | 165 / 7,370 / 0 | — | 0.0192 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 14 | 13.99 | 254.78 | 254.78 | 273.95 | 0.84× | 5.11× | 3.23 | 3.15 | 301 / 23,610 / 0 | — | 0.0001 ms per byte | files.change |
| fs.write | ≤512 KiB · uncontended | 29 | 11.94 | 17.31 | 26.43 | 74.11 | 1.06× | 0.95× | 1.23 | 2.01 | 155 / 7,870 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 106 | 14.62 | 43.78 | 74.18 | 240.35 | 1.02× | 1.51× | 1.16 | 1.82 | 360 / 18,666 / 0 | — | 0.0009 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 216 | 9.24 | 16.71 | 29.22 | 48.93 | 1.10× | 1.05× | 2.03 | 3.08 | 166 / 7,403 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 159 | 13.81 | 31.16 | 51.01 | 64.77 | 1.21× | 0.89× | 1.47 | 2.01 | 322 / 18,186 / 0 | — | 0.0041 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 315 | 8.37 | 14.96 | 20.56 | 59.26 | 1.11× | 1.22× | 2.15 | 2.78 | 155 / 6,968 / 0 | — | 0.0023 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.03 | 1.03 | 1.03 | 1.03 | 1.51× | 1.51× | -4.69 | -5.22 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 35 | 34.70 | 69.30 | 76.78 | 136.16 | 1.20× | 1.53× | 2.47 | 3.97 | 428 / 84,499 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 69 | 32.01 | 52.47 | 84.55 | 267.64 | 1.28× | 1.06× | 1.08 | 2.00 | 384 / 31,255 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 10 | 3.37 | 6.98 | 6.98 | 7.01 | 0.85× | 1.09× | 0.96 | 1.66 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 33 | 3.55 | 6.30 | 6.72 | 7.87 | 1.04× | 1.06× | 0.22 | 0.52 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 4 | 10.05 | 10.87 | 10.87 | 10.88 | 0.94× | 0.59× | 0.89 | 2.13 | 112 / 5,851 / 0 | — | 10.048 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 8 | 8.64 | 11.79 | 11.79 | 28.69 | 1.01× | 1.02× | -1.10 | -1.67 | 129 / 5,397 / 0 | — | 8.642 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 151.88 | 151.88 | 151.88 | 151.88 | 0.59× | 0.59× | -4.78 | -5.81 | 6,015 / 253,534 / 8,191 | — | 151.878 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 6 | 11.52 | 31.48 | 31.48 | 37.15 | 1.00× | 2.16× | 2.44 | 1.51 | 114 / 6,318 / 0 | — | 3.84 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 3 | 9.48 | 9.48 | 9.48 | 9.59 | 0.91× | 0.51× | -1.86 | -2.66 | 140 / 5,482 / 0 | — | 4.5805 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 5 | 28.59 | 56.65 | 56.65 | 76.49 | 1.69× | 2.96× | -5.49 | -8.84 | 484 / 90,440 / 8,191 | — | 4.7645 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 13.01 | 13.70 | 13.70 | 17.65 | 0.85× | 0.84× | -1.54 | -5.11 | 173 / 8,870 / 0 | — | 2.2825 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 117.41 | 117.41 | 117.41 | 117.41 | 1.27× | 1.27× | — | — | 1,750 / 170,638 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 127.25 | 1310.95 | 1310.95 | 15390.99 | 1.35× | 1.09× | 1.92 | 2.64 | 1,749 / 131,911 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 177 | 717.70 | 1065.81 | 5002.42 | 5833.14 | 1.25× | 1.08× | -10.13 | -11.67 | — | 4861.70 | — | — |
| sandbox.exec | 0 files · uncontended | 151 | 32.14 | 880.79 | 1020.35 | 8890.00 | 0.92× | 1.29× | -0.93 | -1.47 | — | 4871.70 | — | — |
| sandbox.exec | 1 files · contended | 23 | 30.35 | 54.44 | 56.13 | 71.29 | 0.80× | 1.03× | -1.17 | -1.88 | — | 4.70 | 30.354 ms per file | — |
| sandbox.exec | 1 files · uncontended | 22 | 35.14 | 49.23 | 50.07 | 54.92 | 0.96× | 0.79× | 0.15 | 0.16 | — | 4.70 | 35.136 ms per file | — |
| sandbox.exec | 17–64 files · contended | 2 | 74.67 | 74.67 | 74.67 | 80.38 | 1.13× | 1.08× | 0.92 | 1.43 | — | 81 | 3.9302 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 6 | 64.50 | 75.58 | 75.58 | 95.03 | 0.96× | 1.00× | 0.22 | 0.77 | — | 95 | 3.6806 ms per file | — |
| sandbox.exec | 2–4 files · contended | 20 | 39.31 | 60.68 | 60.68 | 62.00 | 1.10× | 1.00× | -0.19 | -0.54 | — | 13.30 | 12.9693 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 19 | 38.01 | 65.26 | 65.26 | 68.78 | 1.02× | 0.98× | 0.93 | 1.08 | — | 11 | 13.2967 ms per file | — |
| sandbox.exec | 5–16 files · contended | 24 | 53.17 | 80.32 | 96.36 | 97.94 | 1.23× | 1.13× | -1.57 | -2.72 | — | 20 | 8.0403 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 32 | 45.81 | 85.54 | 105.31 | 106.54 | 1.08× | 1.27× | -2.17 | -3.12 | — | 17.20 | 7.5132 ms per file | — |
| sandbox.exec | — · contended | 16 | 3373.53 | 29046.18 | 29046.18 | 30515.54 | 1.02× | 0.98× | -9.27 | -12.32 | — | 60132.60 | — | — |
| sandbox.exec | — · uncontended | 25 | 429.13 | 13931.05 | 32179.66 | 38072.61 | 1.36× | 0.75× | -1.14 | 1.14 | — | 44066.40 | — | — |
| sandbox.mount | — · contended | 69 | 10.13 | 20.26 | 26.38 | 27.41 | 0.99× | 1.21× | 1.08 | 1.52 | 58 / 1,602 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 119 | 9.97 | 15.68 | 17.83 | 89.08 | 0.99× | 0.88× | 0.95 | 1.52 | 49 / 1,437 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.40 | 3.40 | 3.40 | 3.40 | 0.93× | 0.93× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 3.67 | 3.67 | 3.67 | 73.85 | 0.73× | 0.50× | -0.68 | -1.34 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 57 | 12.66 | 20.07 | 24.59 | 24.98 | 0.99× | 0.92× | 1.11 | 1.71 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 131 | 13.34 | 28.64 | 116.26 | 317.33 | 0.99× | 1.16× | 1.32 | 1.86 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 693.8 KiB | 3,060 | ok 13 |
| branch.diff_commits | branch | 405 | 0.0 KiB | 22.3 MiB | 75,411 | ok 405 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.4 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 37 | 1.5 MiB | 0.0 KiB | 48 | Committed 37 |
| fs.diff_files | fs | 57 | 0.0 KiB | 360.8 KiB | 38 | NoSuchPath 19, Text 36, Equal 2 |
| fs.glob | fs | 59 | 0.0 KiB | 53.8 KiB | 689 | ok 59 |
| fs.grep | fs | 63 | 0.0 KiB | 249.1 KiB | 953 | ok 63 |
| fs.list | fs | 59 | 0.0 KiB | 295.3 KiB | 1,909 | ok 59 |
| fs.read | fs | 55 | 0.0 KiB | 173.4 KiB | 55 | ok 55 |
| fs.rm | fs | 46 | 0.0 KiB | 0.0 KiB | 46 | Committed 46 |
| fs.stat | fs | 54 | 0.0 KiB | 12.0 KiB | 54 | ok 54 |
| fs.write | fs | 975 | 18.9 MiB | 0.0 KiB | 975 | Committed 975 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 195 | 0.0 KiB | 0.0 KiB | 0 | Committed 151, UpToDate 43, Conflict 1 |
| sandbox.exec | sandbox | 527 | 2.1 MiB | 6.0 MiB | 0 | exit:0 524, exit:2 3 |
| sandbox.mount | sandbox | 198 | 0.0 KiB | 0.0 KiB | 0 | Mounted 198 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 198 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 198 |

### C. Scale probes

Binary: daemon `32eda22d657d`.

Load average (1-min, runner (Docker VM kernel)): start 1.47 · end 1.64.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.162 | 14.343 · 1.4 · 1.162 · 1.091 · 1.048 | 2.47–2.47 | statements 32, vm_steps 1085, fullscan_steps 0, sorts 0, returned_rows 89 |
| read | 1.173 | 1.173 · 1.082 · 1.132 · 1.264 · 1.696 | 2.47–2.47 | statements 18, vm_steps 782, fullscan_steps 0, sorts 0, returned_rows 75 |
| list_small | 1.044 | 1.398 · 1.044 · 1.044 · 0.982 · 1.043 | 2.47–2.47 | statements 18, vm_steps 791, fullscan_steps 0, sorts 0, returned_rows 75 |
| list_largest | 10.971 | 13.508 · 10.696 · 10.971 · 10.721 · 11.612 | 2.47–2.47 | statements 190, vm_steps 27369, fullscan_steps 0, sorts 0, returned_rows 2567 |
| grep_scoped | 1.332 | 1.746 · 1.332 · 1.299 · 1.57 · 1.24 | 2.47–2.47 | statements 23, vm_steps 937, fullscan_steps 0, sorts 0, returned_rows 84 |
| glob_scoped | 1.441 | 1.725 · 1.441 · 1.837 · 1.123 · 1.213 | 2.47–2.47 | statements 17, vm_steps 770, fullscan_steps 0, sorts 0, returned_rows 74 |
| grep_tree | 6020.591 | 6270.452 · 5883.506 · 5933.731 · 6020.591 · 6021.5 | 2.02–2.35 | statements 66212, vm_steps 4839731, fullscan_steps 0, sorts 0, returned_rows 478879 |
| glob_tree | 11.692 | 13.066 · 11.692 · 12.047 · 11.365 · 10.737 | 2.02–2.02 | statements 164, vm_steps 22157, fullscan_steps 0, sorts 0, returned_rows 2201 |
| diff_files | 5.251 | 5.204 · 5.392 · 5.251 · 4.962 · 5.434 | 2.02–2.02 | statements 90, vm_steps 4576, fullscan_steps 0, sorts 0, returned_rows 450 |
| list_commits | 0.678 | 1.347 · 0.678 · 0.676 · 0.62 · 0.935 | 2.02–2.02 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.339 | 4.293 · 2.339 · 2.2 · 2.157 · 2.373 | 2.02–2.02 | statements 64, vm_steps 2136, fullscan_steps 0, sorts 0, returned_rows 229 |
| fork | 0.541 | 1.1 · 0.541 · 0.723 · 0.377 · 0.474 | 2.02–2.02 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 31.872 | 31.865 · 32.827 · 31.872 · 32.458 · 31.112 | 2.02–2.02 | statements 513, vm_steps 22745, fullscan_steps 0, sorts 0, returned_rows 1648 |
| oneshot_mount_unmount | 19.047 | 19.047 · 19.279 · 17.976 · 17.588 · 20.333 | 2.02–2.02 | statements 66, vm_steps 2305, fullscan_steps 82, sorts 2, returned_rows 225 |
| oneshot_commit | 76.699 | 79.096 · 76.699 · 83.616 · 65.765 · 66.045 | 2.02–2.02 | statements 191, vm_steps 12383, fullscan_steps 82, sorts 2, returned_rows 910 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.02–2.02 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r057: 425,655 pages of 4,096 B, 0 free · Commits 68,893 · Branches 1,468 · Layers 69 · compression 3.77× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 221,031 | 1.37 GiB |
| 2 | 76,746 | 1.17 GiB |
| 3 | 18,328 | 7.6 MiB |
| 4 | 52 | 10.3 KiB |
| 5 | 18,209 | 1.8 MiB |
| 6 | 192,377 | 925.2 MiB |
| 7 | 545,431 | 133.4 MiB |
| 8 | 1,680 | 490.1 KiB |
| 9 | 148,324 | 329.5 MiB |
| 10 | 73,959 | 9.1 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,537 | 208.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 70,953 | 151.8 MiB |
| 1 | 75,007 | 914.3 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 285,439 | 1.09 GiB | 40.2 MiB |
| inode_value | 84,369 | 329.6 MiB | 6.4 MiB |
| binding_hint | 25,774 | 100.7 MiB | 9.4 MiB |
| object_location | 17,798 | 69.5 MiB | 7.3 MiB |
| commit | 5,754 | 22.5 MiB | 3.5 MiB |
| file_digest | 1,693 | 6.6 MiB | 774.6 KiB |
| commit_lineage | 1,485 | 5.8 MiB | 689.6 KiB |
| commit_runs | 1,443 | 5.6 MiB | 734.1 KiB |
| commit_identity | 1,059 | 4.1 MiB | 456.0 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 64 | 256.0 KiB | 41.2 KiB |
| branch_names | 25 | 100.0 KiB | 21.6 KiB |
| branch_identity | 16 | 64.0 KiB | 6.5 KiB |
| run_merges | 9 | 36.0 KiB | 10.6 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 5 | 20.0 KiB | 7.8 KiB |
| layers_source | 3 | 12.0 KiB | 6.0 KiB |
| layers_child | 3 | 12.0 KiB | 6.0 KiB |
| absorbed_heights | 3 | 12.0 KiB | 4.0 KiB |

### E. Stage times

**Time 339.9 s** (tooling): play 122.6 · consolidate 128.1 · verify 29.7 · probes 31.3 · tests 0.0 · seal + snapshot 12.8 · report 15.4

339.93 s tooling: prepare 1.59 · play 121.02 · consolidate 128.09 · verify 16.94 (diff_commits + full compareTree) · version walk 12.76 · probes 31.29 · metrics 0.87 · seal 1.35 · sealed figures 6.15 · snapshot copy 5.35 · report 0.53

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 32eda22d657d10ba2b419652882f2be41fd2b99cbf38e3eeb32d39a19dc16d88 | 2026-10-20T10:37:34.729Z | optimize | Speed: fs.apply ≤8 KiB · uncontended: 1.79× baseline (commit); not judged: branch.publish — · uncontended: 1/1/2 calls (2.15×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.68×) (baseline class under 5 calls per range); Scaling: branch.diff_commits checkpoint statements in total (entries exponent 0.004): tree files exponent 0.628; Counters: oneshot_mount_unmount.statements: depth exponent 1.503; Contended work: not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (18 classes too narrow); SQL per call (sql.call); Directory share: 0.509 |

### G. Evidence

- `~/lfs-history/metrics/range-057.a1.json`
- trace `~/lfs-history/runs/p3-main-x/trace/range-057.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-x/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-057.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r057-1-packages-client | 719 | 643.1 KiB |
| r057-3-examples-acp-agent | 701 | 643.1 KiB |
| r057-2-root | 544 | 640.0 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 536.0 | 5,172 |
| `git diff --stat` | 44.0 | 5,162 |
| `git add -f` | 44.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 46.0 | 5,167 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r057-3-examples-acp-agent | end | P1 | pass | — | — |
| r057-3-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r057-3-examples-acp-agent | end | P3 | pass | 299 bookkeeping path(s) | — |
| r057-3-examples-acp-agent | end | P4 | pass | 119 emitted files, exit 2 | — |
| r057-3-examples-acp-agent | end | P5 | pass | 23 files | — |
| r057-3-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r057-1-packages-client | end | P1 | pass | — | — |
| r057-1-packages-client | end | P2 | pass | exit 0 | — |
| r057-1-packages-client | end | P3 | pass | 299 bookkeeping path(s) | — |
| r057-1-packages-client | end | P4 | pass | 479 emitted files, exit 2 | — |
| r057-1-packages-client | end | P5 | pass | 126 files | — |
| r057-1-packages-client | end | P6 | n/a | not a repair | — |
| r057-2-root | end | P1 | pass | — | — |
| r057-2-root | end | P2 | pass | exit 0 | — |
| r057-2-root | end | P3 | n/a | an install, not a refresh | — |
| r057-2-root | end | P4 | pass | 429 emitted files, exit 2 | — |
| r057-2-root | end | P5 | pass | 62 files | — |
| r057-2-root | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2357 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
