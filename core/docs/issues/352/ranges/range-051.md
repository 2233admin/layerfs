# Range 051 · **watch** · attempt 1

**Matches git ✓** · daemon `32eda22d657d` · image `d3773b4e` · plan v2 · forked from snapshot r050 (run p3-main-w)
dsh `628c1bffe`..`d296b6d37` · **62 commits** (6 mainline, 56 side) · 2026-07-27 → 2026-07-29
Areas changed: `packages/client` 38% · `/` 15% · `.agents/notes` 8% · other 39%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.16×** · **Churn 0.00**
**Time split:** play 112.4 s · git 113.6 s · Node 222.4 s · verify 17.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **818.3 MiB** (+2.7 MiB) | **1.45 GiB** (+24.0 MiB) | **1.82×** (prev 1.79×) | **26.4 MiB** | **933** (total 61,383) | **323.6 s** tooling (total 181.6 min) |

**Checks:** 12 pass · 7 watch: Speed sandbox.exec — · uncontended: 1.47× baseline (no phase); Scaling insufficient same-binary points: 1 of 3 (daemon 32eda22d657d); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters insufficient same-binary points: 1 of 3 (daemon 32eda22d657d); Contended work not judged: no contended class has 3 ranges of 5+ calls with per-call SQL; SQL per call (sql.call); Directory share 0.566; Range growth 26.4 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 4903 ms for 1282.0 MiB new; size exponent not judged (1 snapshots)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ probe read −44% · ▼ fs.read p95 −44% · ▼ metadata added −41%
**Budget:** 52 of 202 ranges · projected total 16.1 h (budget 16.8 h) · disk 45% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,832 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,953 / 1,953 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3134 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 426 bin shims, 4651 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (57 lines from 4 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `d296b6d37`** · 111 commits written for 111 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r051-2-root | end | `e196b912f7b3` | `2fcb3ea9e838` | pass (429 normalized) | pass | n/a | pass | pass | n/a |
| r051-3-agents-notes | end | `e41b33896eb0` | `c98f97ecce86` | pass (429 normalized) | pass | pass | pass | pass | n/a |
| r051-1-packages-client | end | `7e77b2ad6b85` | `c98f97ecce86` | pass (429 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `fa76dcfab950` | `null` | n/a | pass | n/a | n/a | pass | pass (138,395 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/client/ui-primitives/tests/ansi.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/terminal-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/sdk/helper/tests/documents.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/session-title/session-title/tests/invariant.spec.ts` (fails natively) · `packages/core/session/tests/surface.spec.ts` (fails natively) · `packages/core/session/tests/invariant.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/table.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown-plain-text.spec.ts` (fails natively) · `packages/client/ui-primitives/tests/json-tree.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/terminal-block.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/terminal-card.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-picker.spec.tsx` (fails natively).

## 2. Activity

**2,697 calls** · **155 steps** by **8 agents + lead** on **3 Branches + main** · **196 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +67 added · 771 modified · −30 deleted · 13.8 MiB written · fs 792 : Sandbox 76 (**10 : 1**, reported only in P3)
**Execs:** 507 (JS 59 · shell 448) · 3 non-zero exits · install 0 · test runs 5 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,144 | 805 | 339 | Committed 801 · Text 39 · Equal 4 · NoSuchPath 8 · UpToDate 4 |
| sandbox | 1,096 | 700 | 4 | commit 193 (Committed 147, UpToDate 45, Conflict 1) · exec 507 (exit:0 504, exit:2 3) · mount 196 (Mounted 196) · status 4 · unmount 196 (Unmounted 196) |
| branch | 447 | 32 | 415 | diff_branches 10 · diff_commits 405 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,697** | **1,537** | **768** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r051-1-packages-client | a01 a02 a03 | 64 | 436 | ✓ | — |
| r051-2-root | a04 a05 | 29 | 201 | ✓ | — |
| r051-3-agents-notes | a06 a07 a08 | 56 | 205 | ✓ | — |
| main | lead | 6 | 91 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r051-2, a05 after a04 | 0.1 s |
| Stale clean merge | 1 / 1 | r051-2, a04 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r051-2, a04 a05 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r051-1 | 49 | 24 | 25 | 0 | 0 | 308 | — |
| a02 | r051-1 | 10 | 5 | 5 | 0 | 0 | 107 | — |
| a03 | r051-1 | 5 | 2 | 3 | 0 | 0 | 21 | — |
| a04 | r051-2 | 12 | 7 | 5 | 0 | 0 | 135 | commit-conflict, stale-clean-merge, decoy |
| a05 | r051-2 | 17 | 6 | 11 | 0 | 0 | 66 | commit-conflict, stale-clean-merge, decoy |
| a06 | r051-3 | 27 | 13 | 14 | 0 | 0 | 77 | — |
| a07 | r051-3 | 13 | 7 | 6 | 0 | 0 | 46 | — |
| a08 | r051-3 | 16 | 7 | 9 | 0 | 0 | 82 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 91 | — |
| **Total** |  | **155** | **72** | **78** | **5** | **0** | **933** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 107 · pnpm 1 · tsc 3 · vitest 5 · other 391

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r051-3-agents-notes | 39 | 39 | 39 | 2 | 39 | 465 |
| r051-1-packages-client | 42 | 42 | 42 | 3 | 42 | 920 |
| r051-2-root | 19 | 19 | 19 | 2 | 19 | 220 |
| **lead** | — | — | — | — | 111 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r051-2-root | 1 | 0 | 1 | 1 | 32 | 32 / 32 |
| r051-3-agents-notes | 0 | 1 | 1 | 1 | 58 | 58 / 58 |
| r051-1-packages-client | 0 | 1 | 1 | 1 | 84 | 84 / 84 |
| **lead repair** | 1 | — | 1 | — | — | 138,395 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r050) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 815.6 MiB (26.4 MiB / 658.0 MiB / 24.5 MiB / 106.7 MiB) | 818.3 MiB (26.8 MiB / 658.0 MiB / 25.3 MiB / 108.3 MiB) | +2.7 MiB |
| Version figures from | — | full: first (no manifest for range 50) | — |
| Files / directories / symlinks | 64,755 / 9,958 / 4,648 | 64,850 / 9,961 / 4,659 | +95 / +3 / +11 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.43 GiB | 1.45 GiB | +24.0 MiB |
| **Space amplification** (total · tracked) | 1.79× · tracked 5.02× | 1.82× · tracked 4.99× | 0.02 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.22** (0.71 / 0.19 / 0.98) | 0.98× the median range |
| **Stored per Commit** | 31.7 KiB | 26.2 KiB | — |
| Metadata share | 0.44 | 0.44 | this range 0.57 |
| History: Commits / Layers / Branches | 60,450 | 61,383 / 34 / 766 | +933 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.35 GiB (Commits 7.97 GiB · installs 855.0 MiB · build 96.3 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 39.18 GiB / 45% | — |
| Snapshot | — | r051, 1.25 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 833.4 MiB | 1.02 | +9.0 MiB |
| Metadata | 134.1 MiB | 0.16 | +2.5 MiB |
| Index rows | 446.2 MiB | 0.55 | +11.2 MiB |
| Waste | 70.4 MiB | 0.09 | +1.2 MiB |
| Other | 1.8 MiB | 0.00 | +28.0 KiB |
| **Total = Store on disk** | **1.45 GiB** | **= 1.82** space amplification | +24.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 26.8 MiB | 133.7 MiB (70.7 MiB + 63.0 MiB) | 4.99× | — | 1.3 MiB | 3.7 MiB | 0.35 |
| `node_modules` | 658.0 MiB | 220.0 MiB (187.4 MiB + 32.6 MiB) | 0.33× | — | 983.8 KiB | 0.5 KiB | 2010.85 |
| Build output | 25.3 MiB | 27.7 MiB (25.5 MiB + 2.2 MiB) | 1.10× | — | 914.1 KiB | 9.0 MiB | 0.10 |
| `.git` | 108.3 MiB | 529.7 MiB (506.5 MiB + 23.1 MiB) | 4.89× | — | 8.2 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 518.4 MiB | — (not divided) | — | 12.5 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 56.4 MiB | — | — | — | — | — |
| **Total** | — | **1.45 GiB** | **= 1.82×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 201,465 | +3,089 | 6.3 KiB | 0 (derived) | 53% |
| Chunks (large files) | 68,462 | +849 | 15.8 KiB | — | 58% |
| Large-file extents | 17,359 | — | 0.4 KiB | — | — |
| Directories | 468,996 | 3,721 (with inodes, pooled) | 0.3 KiB | — | 50% |
| Inodes and attributes | 397,935 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,453 | +4,664 | 0.1 KiB | — | — |

Delta: 2.9% at depth cap · 20% of refused bases stopped by budget · `node_modules` reinstall: absolute: 922985 new stored bytes for 167 raw changed bytes of 7 changed packages (5526.856×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.99× (133.7 MiB for 26.8 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.8 KiB / 4.7 KiB / 7.5 KiB over 211 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.16× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.9 MiB stored for 1.93 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.61 (3 lanes × 818.3 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.6 KiB (budget not set) |

## 4. Speed

Daemon `32eda22d657d` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.5 ms / 21.4 ms (1.01×) | 2.7 ms / 3.5 ms (0.97×) | 3.2 ms / 6.7 ms (0.88×) | 21.8 ms / 75.9 ms (1.13×) | 9.5 ms / 14.7 ms (0.94×) | 361 ms / 361 ms | — (native comparison in P3; exec 43.3 ms / 1100 ms) |
| SQL p50: 161 stmts | 56 stmts | 61 stmts | 225 stmts | 45 stmts | 7,986 stmts | — |

**Commit cost:** 8.58 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 744 ms p50 over 196
**Slowest:** sandbox.exec 37408 ms · sandbox.exec 32076 ms · sandbox.exec 28522 ms · checkpoint diff_commits 0.11 ms and 1.53 statements per entry (74,240 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 397 ms / 397 ms | — / — | — | git / status-cold: — |
| git status (steady) | 428 ms / 640 ms | — / — | — | git / status-steady: — |
| git add | 38.0 ms / 76.0 ms | — / — | — | git / add: — |
| git commit (lane) | 41.0 ms / 63.0 ms | — / — | — | git / commit: — |
| lead writes main | 4233 ms / 4233 ms | — / — | — | — |
| repack | 2036 ms / 2036 ms | — / — | — | — |
| pnpm install (incremental) | 3261 ms / 3261 ms | 2250 ms / 2250 ms | 1.45× | pnpm-reinstall / cold: — |
| pnpm refresh | 2934 ms / 2934 ms | 1971 ms / 1971 ms | 1.49× | pnpm-reinstall / steady: — |
| tsc -b | 6900 ms / 6900 ms | 5406 ms / 6128 ms | 1.28× | tsc-b / cold: — |
| vitest | 9086 ms / 9086 ms | 6079 ms / 6079 ms | 1.49× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.7 ms / 18.4 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4128272 B · fs.write ≤8 KiB 4120032 → 4128272 B · fs.write ≤64 KiB 4194304 → 4128272 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3506152 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 3831632 B
**Host load (1-min, recorded, not waited on):** macOS 5.05 at the first command → 8.37 after the last (max 9.61 over 7 commands) · Docker VM 2.17 → 2.17

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-051.a1)

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

- **a1 (`p3-main-x`, first range on the 51–100 binaries: daemon `32eda22d`, addon `4c52d23c`, SDK JS `6928ca80`, built at main `6928ca809d`): WATCH, terminal.** Checkpoint ok, git ✓. Node: 3 lane points P1–P5 pass, repair P6 pass. Control `control-051.a1` passes. Report check F1–F8 PASS.
- **Setup.** `p3-main-x` forked `p3-main-w`'s r50 snapshot (the retired run; read only). Its native chain started from a copy of `p3-main-w`'s adopted r50 native state: `state-4686faf2420541a217b3721a.tar` (sha256 `fa52145a…`, matching), read from `layerfs-issue352-lead31-native-states` once and copied into `layerfs-issue352-lead51-native-states` (ledger `native-state copy`, 07:57:23Z). The liaison accepted it as within bounds. From now on the run uses only the lead51 and prep51 volumes.
- **F-063 active:** chunk PREFIX 401 vs FULL 179 over 100 lane git Commits (97 with a PREFIX chunk); depths 0:179 1:74 2:68 3:56 4:52 5:46 6:37 7:35 8:33. The build `6928ca809d` contains `2de43d0a02`.
- **Storage watch:**

  | | r51 | Compared with |
  | --- | --- | --- |
  | Store | +24.0 MiB | r46–r50: +25.3 to +47.0 MiB |
  | `.git` stored | +8.2 MiB | 13.1–23.1 MiB on r46–r50 (pre-F-063), about 5 MiB less, as expected |
  | Index rows (#366) | +11.2 MiB (435.0 → 446.2 MiB) | |

- **Watch rows:**
  - Speed: `sandbox.exec` uncontended p50 37.2 ms, 1.47× baseline. That is about 12 ms over, above the 5 ms floor, so it stays a watch, not a pass. It is the lane shell, not a LayerFS fs call.
  - Scaling and Counters: 1 of 3 same-binary points, expected on new binaries.
  - Contended work: no class yet has 3 ranges with per-call SQL (fix 067).
  - Range growth and snapshot exponent: not yet judged.
- **Steps:**
  - Lead 3 s. Cuts 37 and 50: 42 s and 14 s. Lanes 67 s.
  - Repair 128 s (install 37.4, build 32.1, tests 4.0). Under the 170 s notify line.
  - Verify 21 s. Finish 59 s of the 65 s alarm (90 s from r52, owner).
  - Host load 5.0–9.6, recorded and not rerun.
- **Pre-scan (fix 064):** `packages/subagent/subagent-subprocess/` was added and removed within the range (R9). `scripts/client-bundle-css.spec.ts` writes a stylesheet. Neither caused a finding.
- **Calibration (fix 065):** batches sized by time per file, with the `<tree>.commit` follow-up (`bca707936b`).
- **Snapshot:** taken (1,282 new blocks, 1.34 GB, copy 4.9 s). Every range from r52 (fix 071).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1953/1953; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | sandbox.exec — · uncontended: 1.47× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 32eda22d657d); also not judged: oneshot_exec: 1 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 32eda22d657d) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls with per-call SQL; SQL per call (sql.call) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.566 | < 0.5 | watch |
| Reinstall growth | absolute: 922985 new stored bytes for 167 raw changed bytes of 7 changed packages (5526.856×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.029 (budget 0.2016) | < 0.1 | pass |
| Range growth | 26.4 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 4903 ms for 1282.0 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.45 | < 0.8 | pass |
| Wall projection | 0.95 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 111 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.16× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 155 | 156 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 933 | 821 |
| Workspaces (one-shot share) | 196 (0.99) | 77 (0.974) |
| Reads | 289 | 289 |
| Reconcile writes | 84 | 84 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `32eda22d657d` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 10 | 19.69 | 386.30 | 386.30 | 588.62 | 0.78× | 0.88× | — | — | 236 / 26,047 / 0 | — | 0.0827 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 16.49 | 16.49 | 16.49 | 34.18 | 1.14× | 1.14× | — | — | 193 / 15,662 / 0 | — | 0.3509 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 399.58 | 399.58 | 399.58 | 399.58 | 1.34× | 1.34× | — | — | 10,392 / 383,033 / 0 | — | 1.9397 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 397 | 20.46 | 42.81 | 72.69 | 460.84 | 0.98× | 1.05× | — | — | 292 / 34,487 / 0 | — | 0.1127 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.29 | 3.37 | 3.37 | 3.45 | 2.50× | 1.96× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.85 | 0.85 | 0.85 | 0.95 | 0.93× | 0.93× | — | — | 70 / 1,298 / 0 | — | 0.0427 ms per entrie | — |
| branch.merge | 5–16 entries · Merged (new Commit) · uncontended | 1 | 361.34 | 361.34 | 361.34 | 361.34 | no baseline | no baseline | — | — | 7,986 / 426,337 / 0 | — | 22.5836 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 417.06 | 417.06 | 417.06 | 417.06 | 0.85× | 0.85× | — | — | 9,500 / 508,220 / 0 | — | 3.4468 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.80 | 1.80 | 1.80 | 1.80 | 1.15× | 1.15× | — | — | 35 / 517 / 0 | — | 0.0123 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 4.13 | 4.13 | 4.13 | 4.13 | 0.68× | 0.68× | — | — | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 30.01 | 30.01 | 30.01 | 30.01 | 1.13× | 1.13× | — | — | 195 / 12,328 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 11.37 | 11.37 | 11.37 | 11.37 | 1.59× | 1.18× | — | — | 179 / 10,766 / 0 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 1 | 10.65 | 10.65 | 10.65 | 10.65 | 1.57× | 0.97× | — | — | 156 / 6,389 / 0 | — | 0.0101 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 1 | 14.10 | 14.10 | 14.10 | 14.10 | 1.59× | 1.21× | — | — | 412 / 23,836 / 0 | — | 0.0406 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 17 | 8.70 | 11.43 | 11.43 | 15.30 | 1.18× | 0.99× | — | — | 199 / 13,356 / 0 | — | 0.0289 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 4 | 11.14 | 12.11 | 12.11 | 12.39 | 1.19× | 0.95× | — | — | 279 / 15,415 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 15 | 9.01 | 10.16 | 10.16 | 10.73 | 0.99× | 0.83× | — | — | 214 / 11,368 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 5.88 | 5.88 | 5.88 | 7.61 | 0.81× | 0.55× | — | — | 133 / 8,009 / 0 | — | 0.0025 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 7 | 6.25 | 7.54 | 7.54 | 8.93 | 0.81× | 0.72× | — | — | 175 / 10,158 / 0 | — | 0.0059 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 2 | 3.68 | 3.68 | 3.68 | 4.03 | 0.86× | 0.56× | — | — | 76 / 7,156 / 0 | — | 0.0822 ms per file | — |
| fs.glob | 17–64 files · uncontended | 14 | 3.76 | 7.24 | 7.24 | 7.80 | 0.65× | 0.93× | — | — | 64 / 7,033 / 0 | — | 0.16 ms per file | — |
| fs.glob | 2–4 files · uncontended | 1 | 3.46 | 3.46 | 3.46 | 3.46 | 1.23× | 0.99× | — | — | 56 / 4,768 / 0 | — | 1.155 ms per file | — |
| fs.glob | 5–16 files · contended | 3 | 2.95 | 2.95 | 2.95 | 4.33 | 0.83× | 0.71× | — | — | 73 / 5,069 / 0 | — | 0.2457 ms per file | — |
| fs.glob | 5–16 files · uncontended | 14 | 2.93 | 4.59 | 4.59 | 4.91 | 0.95× | 0.93× | — | — | 55 / 5,401 / 0 | — | 0.2364 ms per file | — |
| fs.glob | >64 files · uncontended | 9 | 4.69 | 9.76 | 9.76 | 48.24 | 0.86× | 0.53× | — | — | 86 / 5,547 / 0 | — | 0.018 ms per file | — |
| fs.grep | 17–64 files · contended | 5 | 9.09 | 19.55 | 19.55 | 25.49 | 1.04× | 1.96× | — | — | 277 / 15,653 / 0 | — | 0.3759 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 8 | 7.46 | 14.61 | 14.61 | 21.75 | 0.67× | 1.12× | — | — | 159 / 9,246 / 0 | — | 0.3227 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 3 | 2.56 | 2.56 | 2.56 | 2.71 | 0.68× | 0.52× | — | — | 55 / 3,861 / 0 | — | 1.279 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 5.81 | 5.81 | 5.81 | 6.24 | 1.03× | 1.03× | — | — | 128 / 6,374 / 0 | — | 0.5198 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 17 | 6.04 | 8.80 | 8.80 | 14.61 | 1.09× | 1.06× | — | — | 136 / 7,132 / 0 | — | 0.4963 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 12 | 19.51 | 40.72 | 40.72 | 46.57 | 0.81× | 0.98× | — | — | 411 / 25,038 / 0 | — | 0.0935 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 2 | 3.48 | 3.48 | 3.48 | 3.91 | 0.73× | 0.60× | — | — | 56 / 5,151 / 0 | — | 0.0696 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 18 | 3.43 | 7.72 | 7.72 | 9.72 | 1.00× | 1.00× | — | — | 71 / 7,649 / 0 | — | 0.1088 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 1.96 | 2.63 | 2.63 | 2.90 | 0.79× | 0.81× | — | — | 42 / 3,763 / 0 | — | 0.7262 ms per entrie | — |
| fs.list | 5–16 entries · contended | 8 | 3.47 | 4.38 | 4.38 | 4.71 | 1.02× | 0.79× | — | — | 68 / 7,063 / 0 | — | 0.3194 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 19 | 2.88 | 3.99 | 3.99 | 4 | 0.88× | 0.73× | — | — | 58 / 5,520 / 0 | — | 0.2814 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 8 | 2.89 | 3.21 | 3.21 | 3.88 | 1.14× | 1.08× | — | — | 58 / 3,740 / 0 | — | 0.0033 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 5 | 2.66 | 2.74 | 2.74 | 2.88 | 0.93× | 0.88× | — | — | 61 / 4,217 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 7 | 2.74 | 3.49 | 3.49 | 3.78 | 0.82× | 0.67× | — | — | 59 / 3,886 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 33 | 2.55 | 3.37 | 3.42 | 3.56 | 0.97× | 0.54× | — | — | 54 / 3,609 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 9 | 18.65 | 23.15 | 23.15 | 26.56 | 1.82× | 1.24× | — | — | 354 / 24,628 / 0 | — | 18.651 ms per file | commit |
| fs.rm | 1 files · uncontended | 21 | 8.84 | 13.72 | 13.72 | 33.91 | 0.98× | 0.98× | — | — | 155 / 8,829 / 0 | — | 8.84 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 3.41 | 3.41 | 3.41 | 3.41 | 1.20× | 1.20× | — | — | 60 / 3,306 / 0 | — | 0.006 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 9 | 2.77 | 3.65 | 3.65 | 3.75 | 0.98× | 1.10× | — | — | 59 / 4,206 / 0 | — | 0.0063 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.54 | 2.54 | 2.54 | 2.70 | 1.04× | 1.04× | — | — | 52 / 3,856 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 1.93 | 1.93 | 1.93 | 3.53 | 0.80× | 0.62× | — | — | 43 / 3,685 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 18 | 2.19 | 2.82 | 2.82 | 2.99 | 0.78× | 0.78× | — | — | 40 / 3,342 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 1.93 | 1.93 | 1.93 | 2.08 | 0.70× | 0.63× | — | — | 38 / 3,517 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 14 | 2.25 | 3.55 | 3.55 | 5.25 | 0.94× | 1.14× | — | — | 46 / 3,526 / 0 | — | 0.0008 ms per byte | — |
| fs.write | >512 KiB · contended | 2 | 16.39 | 16.39 | 16.39 | 21.09 | 0.95× | 0.95× | — | — | 377 / 22,632 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 5 | 10.98 | 15.50 | 15.50 | 28.49 | 0.92× | 1.05× | — | — | 173 / 6,411 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 13 | 20.54 | 72.04 | 72.04 | 263.52 | 1.40× | 1.06× | — | — | 402 / 37,449 / 0 | — | 0.0397 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 64 | 8.40 | 17.19 | 19.82 | 22.33 | 1.10× | 1.10× | — | — | 160 / 7,415 / 0 | — | 0.0168 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 8 | 12.51 | 68.32 | 68.32 | 79.93 | 0.75× | 1.37× | — | — | 212 / 15,252 / 0 | — | 0.0002 ms per byte | files.change |
| fs.write | ≤512 KiB · uncontended | 24 | 11.27 | 16.60 | 18.79 | 39.46 | 1.00× | 0.91× | — | — | 160 / 8,012 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 72 | 14.11 | 24.62 | 42.01 | 49.14 | 0.98× | 0.85× | — | — | 341 / 20,637 / 0 | — | 0.0009 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 185 | 7.62 | 12.41 | 14.29 | 14.37 | 0.91× | 0.78× | — | — | 150 / 6,446 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 100 | 14.18 | 31.86 | 51.42 | 276.64 | 1.24× | 0.91× | — | — | 323 / 19,188 / 0 | — | 0.0059 ms per byte | files.change |
| fs.write | ≤8 KiB · uncontended | 287 | 7.57 | 14.12 | 19.48 | 24.92 | 1.01× | 1.15× | — | — | 145 / 6,531 / 0 | — | 0.0027 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.00 | 1.00 | 1.00 | 1.00 | 1.47× | 1.47× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 25 | 24.54 | 38.89 | 46.19 | 75.94 | 0.85× | 0.86× | — | — | 230 / 19,673 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 76 | 28.48 | 52.46 | 72.52 | 206.01 | 1.13× | 1.06× | — | — | 310 / 26,970 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 6 | 3.20 | 3.34 | 3.34 | 3.47 | 0.81× | 0.52× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 39 | 3.62 | 4.99 | 5.14 | 6.05 | 1.06× | 0.84× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 1 | 8.02 | 8.02 | 8.02 | 8.02 | 0.75× | 0.43× | — | — | 118 / 4,345 / 0 | — | 8.015 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 10 | 10.36 | 10.84 | 10.84 | 12.04 | 1.21× | 0.94× | — | — | 146 / 5,130 / 0 | — | 10.363 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 157.25 | 157.25 | 157.25 | 157.25 | 0.61× | 0.61× | — | — | 6,504 / 232,758 / 0 | — | 157.251 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 14.19 | 28.47 | 28.47 | 29.58 | 1.23× | 1.95× | — | — | 166 / 9,427 / 0 | — | 3.5478 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 12.91 | 16.20 | 16.20 | 35.82 | 1.24× | 0.87× | — | — | 165 / 8,927 / 0 | — | 5.4017 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 106.06 | 106.06 | 106.06 | 106.06 | 6.27× | 5.53× | — | — | 501 / 85,617 / 8,191 | — | 17.677 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 18.38 | 18.50 | 18.50 | 21.06 | 1.19× | 1.13× | — | — | 283 / 12,685 / 0 | — | 3.0084 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 97.78 | 1123.56 | 1123.56 | 14848.85 | 1.03× | 0.93× | — | — | 1,071 / 51,763 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 134 | 631.00 | 951.17 | 5405.25 | 6381.82 | 1.10× | 0.96× | — | — | — | 4,382 | — | — |
| sandbox.exec | 0 files · uncontended | 176 | 37.21 | 693.15 | 740.31 | 7668.94 | 1.06× | 1.02× | — | — | — | 4470.70 | — | — |
| sandbox.exec | 1 files · contended | 13 | 38.32 | 61.15 | 61.15 | 103.12 | 1.01× | 1.15× | — | — | — | 4.30 | 38.318 ms per file | — |
| sandbox.exec | 1 files · uncontended | 31 | 37.23 | 52.32 | 57.84 | 60.24 | 1.02× | 0.83× | — | — | — | 6.30 | 37.233 ms per file | — |
| sandbox.exec | 17–64 files · contended | 2 | 70.70 | 70.70 | 70.70 | 73.41 | 1.07× | 1.02× | — | — | — | 82 | 3.5351 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 4 | 63.87 | 66.69 | 66.69 | 72.72 | 0.95× | 0.89× | — | — | — | 95 | 3.1937 ms per file | — |
| sandbox.exec | 2–4 files · contended | 10 | 44.57 | 51.27 | 51.27 | 56.59 | 1.25× | 0.85× | — | — | — | 9.30 | 17.089 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 45 | 40.97 | 58.28 | 62.23 | 74.28 | 1.10× | 0.88× | — | — | — | 12.70 | 15.548 ms per file | — |
| sandbox.exec | 5–16 files · contended | 5 | 76.59 | 98.82 | 98.82 | 109.57 | 1.77× | 1.39× | — | — | — | 17.50 | 12.7655 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 36 | 61.00 | 78.57 | 80.75 | 86.19 | 1.43× | 1.16× | — | — | — | 34 | 8.5141 ms per file | — |
| sandbox.exec | — · contended | 11 | 6899.38 | 16171.66 | 16171.66 | 28522.29 | 2.10× | 0.55× | — | — | — | 50549.90 | — | — |
| sandbox.exec | — · uncontended | 30 | 322.43 | 27332.26 | 32075.55 | 37407.64 | 1.02× | 1.47× | — | — | — | 45941.90 | — | — |
| sandbox.mount | — · contended | 38 | 9.93 | 15.69 | 26.12 | 30.55 | 0.97× | 0.94× | — | — | 61 / 1,665 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 148 | 9.41 | 13.89 | 17.73 | 19.65 | 0.94× | 0.78× | — | — | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.76 | 8.17 | 8.17 | 51.44 | 0.94× | 1.12× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 28 | 11.60 | 14.25 | 16.46 | 25.27 | 0.91× | 0.66× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 158 | 11.93 | 19.11 | 110.31 | 244.79 | 0.89× | 0.77× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 10 | 0.0 KiB | 532.2 KiB | 2,388 | ok 10 |
| branch.diff_commits | branch | 405 | 0.0 KiB | 22.3 MiB | 75,217 | ok 405 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.5 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 15 | 873.9 KiB | 0.0 KiB | 26 | Committed 15 |
| fs.diff_files | fs | 51 | 0.0 KiB | 445.4 KiB | 43 | Text 39, Equal 4, NoSuchPath 8 |
| fs.glob | fs | 53 | 0.0 KiB | 60.4 KiB | 767 | ok 53 |
| fs.grep | fs | 57 | 0.0 KiB | 212.7 KiB | 1,007 | ok 57 |
| fs.list | fs | 63 | 0.0 KiB | 325.9 KiB | 2,151 | ok 63 |
| fs.read | fs | 58 | 0.0 KiB | 176.0 KiB | 58 | ok 58 |
| fs.rm | fs | 30 | 0.0 KiB | 0.0 KiB | 30 | Committed 30 |
| fs.stat | fs | 57 | 0.0 KiB | 12.8 KiB | 57 | ok 57 |
| fs.write | fs | 760 | 13.0 MiB | 0.0 KiB | 760 | Committed 756, UpToDate 4 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 193 | 0.0 KiB | 0.0 KiB | 0 | Committed 147, UpToDate 45, Conflict 1 |
| sandbox.exec | sandbox | 507 | 1.6 MiB | 5.0 MiB | 0 | exit:0 504, exit:2 3 |
| sandbox.mount | sandbox | 196 | 0.0 KiB | 0.0 KiB | 0 | Mounted 196 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 196 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 196 |

### C. Scale probes

Binary: daemon `32eda22d657d`.

Load average (1-min, runner (Docker VM kernel)): start 2.17 · end 2.17.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.09 | 12.09 · 1.329 · 1.09 · 0.833 · 0.908 | 2.04–2.04 | statements 23, vm_steps 844, fullscan_steps 0, sorts 0, returned_rows 72 |
| read | 0.831 | 0.93 · 0.784 · 0.831 · 0.73 · 1.206 | 2.04–2.04 | statements 14, vm_steps 646, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_small | 0.87 | 1.163 · 1.175 · 0.87 · 0.856 · 0.757 | 2.04–2.04 | statements 14, vm_steps 655, fullscan_steps 0, sorts 0, returned_rows 63 |
| list_largest | 10.015 | 13.154 · 10.015 · 10.247 · 9.698 · 9.853 | 2.04–2.04 | statements 178, vm_steps 26458, fullscan_steps 0, sorts 0, returned_rows 2664 |
| grep_scoped | 0.997 | 1.556 · 1.011 · 0.997 · 0.997 · 0.853 | 2.04–2.04 | statements 19, vm_steps 801, fullscan_steps 0, sorts 0, returned_rows 72 |
| glob_scoped | 0.904 | 0.988 · 0.829 · 0.773 · 0.904 · 0.952 | 2.04–2.04 | statements 13, vm_steps 634, fullscan_steps 0, sorts 0, returned_rows 62 |
| grep_tree | 5799.664 | 5856.982 · 5799.664 · 5843.018 · 5789.583 · 5791.879 | 1.88–1.99 | statements 63393, vm_steps 4714277, fullscan_steps 0, sorts 0, returned_rows 469257 |
| glob_tree | 8.983 | 10.607 · 9.039 · 8.473 · 8.983 · 8.635 | 1.99–1.99 | statements 131, vm_steps 19982, fullscan_steps 0, sorts 0, returned_rows 2060 |
| diff_files | 3.097 | 3.327 · 3.013 · 3.097 · 3.101 · 3.022 | 1.99–1.99 | statements 60, vm_steps 3688, fullscan_steps 0, sorts 0, returned_rows 372 |
| list_commits | 0.641 | 1.345 · 0.904 · 0.641 · 0.598 · 0.619 | 1.99–1.99 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.727 | 2.259 · 1.593 · 1.566 · 1.727 · 1.822 | 1.99–1.99 | statements 59, vm_steps 2096, fullscan_steps 0, sorts 0, returned_rows 234 |
| fork | 0.684 | 1.227 · 0.728 · 0.684 · 0.411 · 0.43 | 1.99–1.99 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 26.101 | 24.059 · 23.406 · 26.101 · 26.41 · 30.87 | 1.99–1.99 | statements 465, vm_steps 21119, fullscan_steps 0, sorts 0, returned_rows 1564 |
| oneshot_mount_unmount | 18.718 | 18.34 · 18.854 · 20.291 · 18.718 · 15.795 | 1.99–1.99 | statements 57, vm_steps 2064, fullscan_steps 82, sorts 2, returned_rows 208 |
| oneshot_commit | 73.126 | 73.888 · 73.126 · 76.157 · 47.529 · 59.118 | 1.99–2.47 | statements 164, vm_steps 10145, fullscan_steps 82, sorts 2, returned_rows 792 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.99–1.99 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r051: 380,405 pages of 4,096 B, 0 free · Commits 62,217 · Branches 1,278 · Layers 62 · compression 3.66× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 201,465 | 1.21 GiB |
| 2 | 68,462 | 1.03 GiB |
| 3 | 17,309 | 6.4 MiB |
| 4 | 50 | 9.6 KiB |
| 5 | 17,203 | 1.7 MiB |
| 6 | 168,721 | 813.3 MiB |
| 7 | 467,585 | 114.8 MiB |
| 8 | 1,411 | 408.3 KiB |
| 9 | 132,404 | 291.8 MiB |
| 10 | 66,785 | 8.2 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,453 | 201.2 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 63,988 | 134.1 MiB |
| 1 | 68,759 | 833.4 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 259,078 | 1012.0 MiB | 36.6 MiB |
| inode_value | 72,601 | 283.6 MiB | 5.6 MiB |
| binding_hint | 21,864 | 85.4 MiB | 8.0 MiB |
| object_location | 15,740 | 61.5 MiB | 6.6 MiB |
| commit | 5,165 | 20.2 MiB | 3.2 MiB |
| file_digest | 1,596 | 6.2 MiB | 719.1 KiB |
| commit_lineage | 1,338 | 5.2 MiB | 610.5 KiB |
| commit_runs | 1,308 | 5.1 MiB | 681.8 KiB |
| commit_identity | 945 | 3.7 MiB | 366.4 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 57 | 228.0 KiB | 41.0 KiB |
| branch_names | 21 | 84.0 KiB | 15.8 KiB |
| branch_identity | 15 | 60.0 KiB | 9.9 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| run_merges | 7 | 28.0 KiB | 5.9 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 5.0 KiB |
| layers_source | 3 | 12.0 KiB | 6.6 KiB |
| layers_child | 3 | 12.0 KiB | 6.6 KiB |
| absorbed_heights | 3 | 12.0 KiB | 4.8 KiB |

### E. Stage times

**Time 323.6 s** (tooling): play 114.1 · consolidate 124.9 · verify 28.8 · probes 30.1 · tests 0.0 · seal + snapshot 12.0 · report 13.7

323.63 s tooling: prepare 1.64 · play 112.42 · consolidate 124.95 · verify 17.20 (diff_commits + full compareTree) · version walk 11.62 · probes 30.06 · metrics 0.74 · seal 1.59 · sealed figures 5.50 · snapshot copy 4.97 · report 0.48

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 32eda22d657d10ba2b419652882f2be41fd2b99cbf38e3eeb32d39a19dc16d88 | 2026-10-20T08:14:32.445Z | watch | Speed: sandbox.exec — · uncontended: 1.47× baseline (no phase); Scaling: insufficient same-binary points: 1 of 3 (daemon 32eda22d657d); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 32eda22d657d); Contended work: not judged: no contended class has 3 ranges of 5+ calls with per-call SQL; SQL per call (sql.call); Directory share: 0.566; Range growth: 26.4 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 4903 ms for 1282.0 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-051.a1.json`
- trace `~/lfs-history/runs/p3-main-x/trace/range-051.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-x/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-051.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r051-3-agents-notes | 465 | 594.3 KiB |
| r051-1-packages-client | 920 | 594.9 KiB |
| r051-2-root | 220 | 592.1 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 428.0 | 4,811 |
| `git diff --stat` | 38.0 | 4,803 |
| `git add -f` | 38.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 41.0 | 4,806 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r051-2-root | end | P1 | pass | — | — |
| r051-2-root | end | P2 | pass | exit 0 | — |
| r051-2-root | end | P3 | n/a | an install, not a refresh | — |
| r051-2-root | end | P4 | pass | 218 emitted files, exit 2 | — |
| r051-2-root | end | P5 | pass | 32 files | — |
| r051-2-root | end | P6 | n/a | not a repair | — |
| r051-3-agents-notes | end | P1 | pass | — | — |
| r051-3-agents-notes | end | P2 | pass | exit 0 | — |
| r051-3-agents-notes | end | P3 | pass | 283 bookkeeping path(s) | — |
| r051-3-agents-notes | end | P4 | pass | 211 emitted files, exit 2 | — |
| r051-3-agents-notes | end | P5 | pass | 58 files | — |
| r051-3-agents-notes | end | P6 | n/a | not a repair | — |
| r051-1-packages-client | end | P1 | pass | — | — |
| r051-1-packages-client | end | P2 | pass | exit 0 | — |
| r051-1-packages-client | end | P3 | pass | 283 bookkeeping path(s) | — |
| r051-1-packages-client | end | P4 | pass | 387 emitted files, exit 2 | — |
| r051-1-packages-client | end | P5 | pass | 84 files | — |
| r051-1-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2237 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
