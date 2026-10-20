# Range 038 · **watch** · attempt 2

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · forked from snapshot r037 (run p3-main-u)
dsh `800bafda3`..`92700c237` · **66 commits** (9 mainline, 57 side) · 2026-07-24 → 2026-07-26
Areas changed: `packages/client` 21% · `/` 18% · `.agents/notes` 14% · other 47%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.22×** · **Churn 0.00**
**Time split:** play 85.0 s · git 99.8 s · Node 187.8 s · verify 12.0 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **749.4 MiB** (+2.4 MiB) | **1.02 GiB** (+25.9 MiB) | **1.40×** (prev 1.37×) | **28.6 MiB** | **981** (total 45,294) | **249.5 s** tooling (total 116.5 min) |

**Checks:** 15 pass · 4 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.4× it; Scaling not judged: stat (chain-bounded): 8 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters oneshot_mount_unmount.vm_steps: depth exponent 0.093; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (20 classes too narrow)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ fs.read p95 +53% · ▼ stored added −36% · ▼ sandbox.commit p95 −24%
**Budget:** 39 of 202 ranges · projected total 15.6 h (budget 16.8 h) · disk 37% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **3,538 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,012 / 2,012 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2732 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 392 bin shims, 4195 links · output root ×2, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (49 lines from 3 .gitignore files) · **154 picks** in 3 merges (154 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `92700c237`** · 104 commits written for 104 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 154 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r038-2-agents-notes | end | `d06fab583fe0` | `341c37c5340b` | pass (392 normalized) | pass | pass | pass | pass | n/a |
| r038-3-root | end | `21ffdaf19a32` | `b9ebcc23ea80` | pass (396 normalized) | pass | n/a | pass | pass | n/a |
| r038-1-packages-client | end | `bb0018683363` | `341c37c5340b` | pass (392 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `b75411b5c609` | `null` | n/a | pass | n/a | n/a | pass | pass (121,695 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `apps/cli/tests/args.spec.ts` (fails natively) · `packages/llm/llm-retry/tests/transport-recovery.spec.ts` (fails natively) · `packages/client/ui-layout/tests/apply.spec.ts` (fails natively) · `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-sidebar/tests/sidebar-root.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/appearance-row.spec.tsx` (fails natively) · `packages/client/ui-theme/tests/apply.spec.ts` (fails natively) · `packages/client/ui-theme/tests/invariant.spec.ts` (fails natively) · `packages/client/ui-theme/tests/theme.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/apply.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/rows.spec.tsx` (fails natively) · `packages/client/ui-workspace/tests/workspace-browser.spec.tsx` (fails natively).

## 2. Activity

**2,722 calls** · **168 steps** by **8 agents + lead** on **3 Branches + main** · **214 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +185 added · 595 modified · −117 deleted · 12.1 MiB written · fs 819 : Sandbox 78 (**11 : 1**, reported only in P3)
**Execs:** 556 (JS 62 · shell 494) · 3 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,118 | 833 | 285 | Committed 833 · NoSuchPath 21 · Text 25 |
| sandbox | 1,199 | 767 | 4 | commit 211 (Committed 162, UpToDate 48, Conflict 1) · exec 556 (exit:0 553, exit:1 1, exit:2 2) · mount 214 (Mounted 214) · status 4 · unmount 214 (Unmounted 214) |
| branch | 395 | 32 | 363 | diff_branches 11 · diff_commits 352 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,722** | **1,632** | **662** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r038-1-packages-client | a01 a02 | 29 | 288 | ✓ | — |
| r038-2-agents-notes | a03 a04 a05 | 64 | 307 | ✓ | — |
| r038-3-root | a06 a07 a08 | 69 | 314 | ✓ | — |
| main | lead | 6 | 72 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r038-3, a06 after a07 | 0.1 s |
| Stale clean merge | 1 / 1 | r038-3, a06 a08 | merged cleanly |
| Decoy edit | 1 / 1 | r038-3, a08 a07 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r038-1 | 18 | 9 | 9 | 0 | 0 | 216 | — |
| a02 | r038-1 | 11 | 4 | 7 | 0 | 0 | 72 | — |
| a03 | r038-2 | 21 | 11 | 10 | 0 | 0 | 74 | — |
| a04 | r038-2 | 16 | 8 | 8 | 0 | 0 | 59 | — |
| a05 | r038-2 | 27 | 13 | 14 | 0 | 0 | 174 | — |
| a06 | r038-3 | 20 | 5 | 15 | 0 | 0 | 150 | commit-conflict, stale-clean-merge |
| a07 | r038-3 | 24 | 12 | 12 | 0 | 0 | 33 | commit-conflict, decoy |
| a08 | r038-3 | 25 | 14 | 11 | 0 | 0 | 131 | stale-clean-merge, decoy |
| lead | main | 6 | 1 | 0 | 5 | 0 | 72 | — |
| **Total** |  | **168** | **77** | **86** | **5** | **0** | **981** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 117 · pnpm 1 · tsc 3 · vitest 4 · other 431

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r038-3-root | 44 | 44 | 43 | 7 | 44 | 426 |
| r038-2-agents-notes | 44 | 44 | 44 | 4 | 44 | 580 |
| r038-1-packages-client | 22 | 22 | 22 | 4 | 22 | 496 |
| **lead** | — | — | — | — | 104 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r038-2-agents-notes | 0 | 1 | 1 | 1 | 32 | 32 / 32 |
| r038-3-root | 1 | 0 | 1 | 1 | 29 | 29 / 29 |
| r038-1-packages-client | 0 | 1 | 1 | 1 | 82 | 82 / 82 |
| **lead repair** | 1 | — | 1 | — | — | 121,695 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r037) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 747.0 MiB (20.9 MiB / 625.7 MiB / 19.6 MiB / 80.9 MiB) | 749.4 MiB (21.2 MiB / 625.7 MiB / 20.3 MiB / 82.2 MiB) | +2.4 MiB |
| Version figures from | — | full: first (no manifest for range 37) | — |
| Files / directories / symlinks | 55,311 / 9,061 / 4,152 | 55,520 / 9,110 / 4,203 | +209 / +49 / +51 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1021.6 MiB | 1.02 GiB | +25.9 MiB |
| **Space amplification** (total · tracked) | 1.37× · tracked 5.15× | 1.40× · tracked 5.13× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **9.67** (1.09 / 0.24 / 1.09) | 1.69× the median range |
| **Stored per Commit** | 20.3 KiB | 26.9 KiB | — |
| Metadata share | 0.40 | 0.41 | this range 0.50 |
| History: Commits / Layers / Branches | 44,313 | 45,294 / 23 / 445 | +981 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.59 GiB (Commits 8.60 GiB · installs 884.7 MiB · build 104.6 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 42.00 GiB / 37% | — |
| Snapshot | — | r038, 895.5 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 622.3 MiB | 0.83 | +11.6 MiB |
| Metadata | 91.7 MiB | 0.12 | +2.7 MiB |
| Index rows | 281.8 MiB | 0.38 | +10.3 MiB |
| Waste | 50.3 MiB | 0.07 | +1.2 MiB |
| Other | 1.3 MiB | 0.00 | +40.0 KiB |
| **Total = Store on disk** | **1.02 GiB** | **= 1.40** space amplification | +25.9 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 21.2 MiB | 109.0 MiB (61.0 MiB + 48.0 MiB) | 5.13× | — | 1.6 MiB | 3.0 MiB | 0.53 |
| `node_modules` | 625.7 MiB | 201.3 MiB (181.0 MiB + 20.3 MiB) | 0.32× | — | 912.3 KiB | 152.2 KiB | 6.00 |
| Build output | 20.3 MiB | 17.4 MiB (16.2 MiB + 1.2 MiB) | 0.86× | — | 565.9 KiB | 7.5 MiB | 0.07 |
| `.git` | 82.2 MiB | 357.3 MiB (342.9 MiB + 14.3 MiB) | 4.34× | — | 11.2 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 333.5 MiB | — (not divided) | — | 11.6 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 29.0 MiB | — | — | — | — | — |
| **Total** | — | **1.02 GiB** | **= 1.40×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 149,098 | +3,174 | 6.2 KiB | 0 (derived) | 47% |
| Chunks (large files) | 55,220 | +859 | 15.2 KiB | — | 9% |
| Large-file extents | 15,210 | — | 0.3 KiB | — | — |
| Directories | 290,470 | 3,736 (with inodes, pooled) | 0.2 KiB | — | 54% |
| Inodes and attributes | 283,088 | ↑ pooled | 2.7 KiB | — | — |
| Symlinks | 2,299 | +4,257 | 0.1 KiB | — | — |

Delta: 2.0% at depth cap · 29% of refused bases stopped by budget · `node_modules` reinstall: absolute: 820510 new stored bytes for 779 raw changed bytes of 34 changed packages (1053.286×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 5.13× (109.0 MiB for 21.2 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.1 KiB / 3.8 KiB / 6.4 KiB over 214 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.22× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.4 MiB stored for 1.83 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.47 (3 lanes × 749.4 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.7 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 7.8 ms / 20.2 ms (0.94×) | 2.3 ms / 6.0 ms (0.99×) | 3.1 ms / 7.8 ms (1.33×) | 20.1 ms / 47.9 ms (1.11×) | 10.2 ms / 15.3 ms (0.87×) | 333 ms / 333 ms (1.05×) | — (native comparison in P3; exec 36.5 ms / 766 ms) |
| SQL p50: 154 stmts | 51 stmts | 61 stmts | 243 stmts | 55 stmts | 8,079 stmts | — |

**Commit cost:** 6.02 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 648 ms p50 over 214
**Slowest:** sandbox.exec 31878 ms · sandbox.exec 25282 ms · sandbox.exec 24066 ms · checkpoint diff_commits 0.09 ms and 1.52 statements per entry (65,164 entries per page)
**Scaling:** 14 of 15 probes flat · `glob_tree` 0.28

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 275 ms / 275 ms | — / — | — | git / status-cold: — |
| git status (steady) | 370 ms / 431 ms | — / — | — | git / status-steady: — |
| git add | 28.0 ms / 72.0 ms | — / — | — | git / add: — |
| git commit (lane) | 35.0 ms / 54.0 ms | — / — | — | git / commit: — |
| lead writes main | 3110 ms / 3110 ms | — / — | — | — |
| repack | 3327 ms / 3327 ms | — / — | — | — |
| pnpm install (incremental) | 2830 ms / 2830 ms | 1689 ms / 1689 ms | 1.68× | pnpm-reinstall / cold: — |
| pnpm refresh | 2466 ms / 2466 ms | 1682 ms / 1682 ms | 1.47× | pnpm-reinstall / steady: — |
| tsc -b | 5465 ms / 5465 ms | 3625 ms / 4351 ms | 1.51× | tsc-b / cold: — |
| vitest | 9221 ms / 9221 ms | 4569 ms / 4569 ms | 2.02× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.8 ms / 21.4 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4161232 → 4194304 B · fs.write ≤8 KiB 24752 → 4194304 B · fs.write ≤64 KiB 4161232 → 4194304 B · fs.read ≤8 KiB 4161232 → 4194304 B · sandbox.mount 4161232 → 2616232 B · sandbox.commit 1 file (Committed) 4161232 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 7.47 at the first command → 6.41 after the last (max 7.72 over 7 commands) · Docker VM 1.1 → 1.87

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-038.a2)

## 5. Findings and action

### Finding 038.a1 · stop

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Correctness | tree 0 missing, 1 extra, 0 content, 0 mode; steps 2007/2008; conflicts 3/3; tests 30/30 equal to native | all |

Diagnosis pending: `finding-038.a1.json`.

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

- **a1 (`p3-main-u`, live after r37 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): STOP at the checkpoint, an oracle cause; no LayerFS defect.** The path check found one extra path, `.sessions/session-query.db`, and nothing missing; content and modes match git (the 30 metadata-only `package.json` paths are checked by blob id and pass). Node: 12 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,831 emitted). Steps read 2,007 / 2,008 only because a failed range counts the stopped call as unmatched (`run.mjs`).
- **Cause:** the file is an SQLite database that a session-query test writes at the repository root. dsh's `.gitignore` at this checkpoint ignores `.sessions/`. A Workspace holds ignored files by design, but the checkpoint check exempted only the fixed closure outputs (`node_modules`, `dist/`, `lib/`, `*.tsbuildinfo`), not paths git itself ignores. A native run writes the same file, which git never tracks.
- **Fix 058 (harness, oracle):** in P3 the path and tree checks also exempt paths that the checkpoint's own `.gitignore` files ignore, matched by git's `check-ignore` over those files. Every tracked path is still compared. A checkpoint stop cannot be re-judged on retained state (the run is dirty), so a2 replays r38 on a fork of r37's snapshot.
- Concurrent load: no QUIET overlap recorded. Final steps: lanes 24 s + 68 s (cut at plan order 25), repair 100 s, verify 11 s, finish 5 s (stopped). Repair install 31.6 s, build 20.8 s, tests 3.3 s.
- **a2 (`p3-main-v`, a fork of `p3-main-u`'s r037 snapshot, chain set to `p3-main-u`'s r37 native state as a1 had; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`; fix 058 in the harness): WATCH, terminal.** Checkpoint ok, git ✓ (path check and full tree: 3,538 files, nothing missing or extra). Node: 17 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (1,831 emitted). Control `control-038.a2` passes. Report check F1–F8 PASS.
- **Paths fix 058 exempted:** `.sessions/session-query.db` only. a2 ran before the metrics kept the list (`6fb0d1c2ba`), so the set is derived: a1's only extra was that path, and r35's and r37's full-tree checks passed, so no other ignored file was in the tree before r38. From r39 the metrics keep `checks.tree.gitIgnored`.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 12.4×). One-shot Commit 1.11×, write 0.94×, read 0.99×, mount 0.87×, merge 1.05×; list is under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 6.4–7.7.
- Final steps: lanes 23 s + 68 s (cut at plan order 25), repair 104 s (alarm 200 s), verify 15 s, finish 43 s. Repair install 31.9 s, build 20.9 s, tests 3.4 s.
- Watch items: index rows 281.8 MiB (sealed, +10.3 MiB; #366). `fs.rm` uncontended p50 6.48 ms per file over 97 calls, 6,904 VM steps (#367).

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2012/2012; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.4× it | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 8 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | oneshot_mount_unmount.vm_steps: depth exponent 0.093 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (20 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.5 | < 0.5 | pass |
| Reinstall growth | absolute: 820510 new stored bytes for 779 raw changed bytes of 34 changed packages (1053.286×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0202 (budget 0.2857) | < 0.1 | pass |
| Range growth | 28.6 MiB, 0.85× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 2833 ms for 895.5 MiB new; size exponent -0.874 | < 0.15 | pass |
| Disk projection | 0.37 | < 0.8 | pass |
| Wall projection | 0.93 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 104 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 154 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.22× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 168 | 169 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 981 | 857 |
| Workspaces (one-shot share) | 214 (0.99) | 85 (0.976) |
| Reads | 246 | 246 |
| Reconcile writes | 63 | 63 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 11 | 29.13 | 336.34 | 336.34 | 434.31 | 1.79× | 6.50× | -0.98 | -1.06 | 383 / 45,061 / 0 | — | 0.1175 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 253.85 | 253.85 | 253.85 | 253.85 | no baseline | no baseline | -2.00 | -1.58 | 6,445 / 236,582 / 0 | — | 1.2204 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 346 | 18.41 | 32.10 | 56.81 | 318.12 | 1.07× | 1.24× | -0.42 | -0.50 | 301 / 32,647 / 0 | — | 0.0983 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.77 | 1.25 | 1.25 | 1.68 | 0.85× | 0.95× | -1.73 | -1.93 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.87 | 0.87 | 0.87 | 0.92 | no baseline | no baseline | -0.48 | -0.66 | 70 / 1,298 / 0 | — | 0.0437 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 380.56 | 380.56 | 380.56 | 380.56 | 4.55× | 4.55× | 0.86 | 1.10 | 8,792 / 486,602 / 0 | — | 7.4619 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 96.22 | 96.22 | 96.22 | 333.42 | 1.05× | 1.05× | -3.88 | -3.83 | 2,519 / 125,229 / 0 | — | 0.5977 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.56 | 4.56 | 4.56 | 4.56 | 0.90× | 0.90× | -4.13 | -4.77 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 23.84 | 23.84 | 23.84 | 23.84 | 0.98× | 0.98× | -0.39 | -0.16 | 146 / 9,671 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 7 | 12.39 | 13.94 | 13.94 | 18.10 | 1.05× | 1.03× | -4.80 | -4.62 | 312 / 27,275 / 0 | — | 0.0247 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 5 | 7.60 | 7.96 | 7.96 | 10.21 | 1.24× | 1.07× | -0.84 | -0.94 | 155 / 8,652 / 0 | — | 0.0099 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 3 | 16.87 | 16.87 | 16.87 | 32.33 | 1.83× | 1.08× | -10.03 | -10.58 | 583 / 25,228 / 0 | — | 0.0006 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 3 | 9.01 | 9.01 | 9.01 | 9.61 | 1.30× | 0.93× | 1.54 | 1.49 | 156 / 7,675 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 12 | 13.57 | 23.37 | 23.37 | 87.87 | 1.36× | 1.36× | -1.36 | -1.24 | 323 / 24,196 / 0 | — | 0.006 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 20 | 6.94 | 9.89 | 9.89 | 10.73 | 1.06× | 0.91× | -2.12 | -2.57 | 136 / 6,256 / 0 | — | 0.0017 ms per byte | files.change |
| fs.diff_files | ≤1 KiB · contended | 7 | 7.98 | 12.29 | 12.29 | 14.61 | 1.11× | 1.43× | -0.61 | -1.06 | 287 / 12,469 / 0 | — | — | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 18 | 6.74 | 12.22 | 12.22 | 17.35 | 1.15× | 1.52× | -1.14 | -1.53 | 172 / 9,458 / 0 | — | 0.0201 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 2 | 4.74 | 4.74 | 4.74 | 5.27 | 0.88× | 0.79× | -1.08 | -1.55 | 112 / 5,594 / 0 | — | 0.0001 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 5 | 3.62 | 4.69 | 4.69 | 4.77 | 0.58× | 0.51× | -3.37 | -3.83 | 102 / 3,463 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 7.90 | 7.90 | 7.90 | 7.90 | 1.31× | 1.22× | -1.07 | -1.12 | 179 / 9,625 / 0 | — | 0.0069 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 8 | 6.19 | 8.01 | 8.01 | 8.44 | 0.84× | 1.00× | -1.52 | -1.79 | 144 / 8,684 / 0 | — | 0.0022 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 2.12 | 2.12 | 2.12 | 2.12 | 1.56× | 1.45× | — | — | 31 / 2,073 / 0 | — | 2.12 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 3.19 | 3.57 | 3.57 | 4.17 | 1.13× | 0.94× | -1.08 | -1.34 | 64 / 6,095 / 0 | — | 0.1088 ms per file | — |
| fs.glob | 2–4 files · uncontended | 1 | 2.93 | 2.93 | 2.93 | 2.93 | 1.66× | 1.51× | 0.93 | 1.04 | 54 / 4,034 / 0 | — | 0.7318 ms per file | — |
| fs.glob | 5–16 files · contended | 2 | 3.33 | 3.33 | 3.33 | 11.50 | 1.98× | 1.98× | -0.61 | -1.05 | 62 / 4,885 / 0 | — | 0.6668 ms per file | — |
| fs.glob | 5–16 files · uncontended | 9 | 4.44 | 7.46 | 7.46 | 12.40 | 2.20× | 3.27× | 1.08 | 1.39 | 72 / 5,837 / 0 | — | 0.3867 ms per file | — |
| fs.glob | >64 files · contended | 2 | 11.32 | 11.32 | 11.32 | 39.08 | 2.09× | 2.09× | 0.10 | 0.08 | 427 / 31,065 / 0 | — | 0.0113 ms per file | — |
| fs.glob | >64 files · uncontended | 16 | 4.83 | 22.30 | 22.30 | 39.58 | 0.49× | 1.59× | -0.58 | -1.23 | 83 / 12,105 / 0 | — | 0.0192 ms per file | — |
| fs.grep | 17–64 files · contended | 3 | 6.45 | 6.45 | 6.45 | 7.54 | 1.08× | 1.08× | -2.10 | -1.97 | 157 / 9,015 / 0 | — | 0.2079 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 9 | 7.43 | 9.17 | 9.17 | 11.02 | 1.29× | 1.53× | 1.19 | 0.56 | 185 / 7,618 / 0 | — | 0.2935 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 2 | 1.92 | 1.92 | 1.92 | 3.86 | 0.83× | 0.60× | 0.07 | -0.44 | 53 / 3,112 / 0 | — | 0.962 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 3 | 6.95 | 6.95 | 6.95 | 7.62 | 2.34× | 1.38× | 1.15 | 1.07 | 84 / 4,013 / 0 | — | 0.6925 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 4.01 | 7.08 | 7.08 | 12.91 | 1.07× | 1.18× | -0.04 | -0.04 | 105 / 5,294 / 0 | — | 0.5674 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 25.05 | 25.05 | 25.05 | 37.09 | 1.60× | 1.60× | 1.14 | 1.21 | 736 / 45,443 / 0 | — | 0.0976 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 19.31 | 24.44 | 24.44 | 29.50 | 1.06× | 1.06× | 1.20 | 1.00 | 474 / 26,498 / 0 | — | 0.0965 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 2.21 | 2.21 | 2.21 | 2.21 | 1.31× | 1.31× | -2.08 | -2.06 | 44 / 3,170 / 0 | — | 2.213 ms per entrie | — |
| fs.list | 17–64 entries · contended | 4 | 5.99 | 7.00 | 7.00 | 7.50 | 2.49× | 2.91× | -0.46 | -0.40 | 103 / 7,993 / 0 | — | 0.1332 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 14 | 3.34 | 7.87 | 7.87 | 9.23 | 1.33× | 2.68× | -0.28 | -0.30 | 70 / 6,159 / 0 | — | 0.1019 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 3.07 | 3.07 | 3.07 | 3.07 | 1.32× | 1.32× | -0.34 | -0.48 | 56 / 4,207 / 0 | — | 1.534 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 2.34 | 2.41 | 2.41 | 2.63 | 1.24× | 1.18× | 0.85 | 0.60 | 41 / 3,062 / 0 | — | 0.7813 ms per entrie | — |
| fs.list | 5–16 entries · contended | 5 | 3.52 | 3.68 | 3.68 | 4.18 | 1.51× | 1.30× | -0.91 | -0.64 | 69 / 4,001 / 0 | — | 0.4091 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 10 | 2.95 | 3.72 | 3.72 | 6.34 | 1.55× | 0.98× | 0.24 | 0.12 | 59 / 5,365 / 0 | — | 0.3277 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 2.60 | 2.60 | 2.60 | 2.60 | 1.17× | 1.17× | -1.29 | -1.51 | 101 / 6,068 / 0 | — | 0.0033 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 4 | 2.58 | 2.93 | 2.93 | 20.04 | 1.63× | 1.85× | 0.09 | -0.14 | 63 / 3,953 / 0 | — | 0.0032 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.07 | 2.66 | 2.66 | 3.00 | 0.74× | 0.95× | -2.84 | -2.86 | 48 / 3,116 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 7 | 2.51 | 4.60 | 4.60 | 9.23 | 1.19× | 0.77× | -1.73 | -1.92 | 80 / 3,875 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 20 | 2.04 | 3.46 | 3.46 | 6.01 | 0.99× | 0.97× | -0.63 | -0.80 | 47 / 3,306 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 20 | 13.61 | 19.91 | 19.91 | 46.90 | 1.29× | 1.40× | 1.28 | 1.00 | 231 / 18,841 / 0 | — | 13.608 ms per file | commit |
| fs.rm | 1 files · uncontended | 97 | 6.47 | 12.86 | 21.89 | 24.54 | 0.97× | 1.15× | -2.08 | -2.38 | 134 / 6,904 / 0 | — | 6.475 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 1 | 4.15 | 4.15 | 4.15 | 4.15 | 1.91× | 1.86× | 0.84 | 0.63 | 80 / 7,300 / 0 | — | 0.01 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 5 | 2.66 | 2.74 | 2.74 | 3.08 | 1.73× | 1.78× | -0.03 | 0.15 | 45 / 3,164 / 0 | — | 0.0054 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 3.61 | 3.61 | 3.61 | 3.61 | 1.71× | 1.71× | 0.96 | 0.99 | 73 / 4,197 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 5 | 3.83 | 5.07 | 5.07 | 11.34 | 1.47× | 1.48× | 0.44 | 0.60 | 61 / 3,513 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 11 | 1.97 | 2.88 | 2.88 | 3.93 | 1.01× | 1.33× | 1.01 | 0.55 | 38 / 2,494 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 2.85 | 2.85 | 2.85 | 3.03 | 1.27× | 0.95× | 0.83 | 0.92 | 39 / 2,864 / 0 | — | 0.0008 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 18 | 2.18 | 3.25 | 3.25 | 6.88 | 1.30× | 0.93× | -0.09 | -0.06 | 43 / 2,954 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 37 | 10.91 | 26.15 | 71.61 | 80.34 | 1.28× | 1.75× | -2.12 | -2.34 | 266 / 15,788 / 0 | — | 0.028 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 74 | 6.63 | 13.50 | 15.46 | 15.60 | 1.04× | 1.28× | -2.05 | -2.37 | 139 / 6,925 / 0 | — | 0.0157 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 9 | 14.53 | 20.21 | 20.21 | 64.63 | 0.90× | 1.26× | -1.09 | -1.28 | 362 / 20,227 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 21 | 10.28 | 16.45 | 16.45 | 18.34 | 1.25× | 2.00× | -0.26 | -0.35 | 153 / 7,582 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 47 | 11.06 | 39.35 | 65.14 | 74.31 | 1.12× | 1.79× | -1.19 | -1.43 | 315 / 16,332 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 109 | 6.77 | 13.68 | 18.29 | 23.36 | 0.94× | 1.00× | -1.06 | -1.32 | 141 / 5,696 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 97 | 12.01 | 35.45 | 61.45 | 81.97 | 1.23× | 1.58× | -1.41 | -1.60 | 315 / 17,628 / 0 | — | 0.0043 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 259 | 6.80 | 11.41 | 18.43 | 26.64 | 0.94× | 0.82× | -0.97 | -1.20 | 139 / 6,457 / 0 | — | 0.0024 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.61 | 0.61 | 0.61 | 0.61 | 0.81× | 0.81× | -1.60 | -1.77 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 34 | 28.21 | 40.01 | 51.56 | 61.25 | 1.34× | 1.15× | -0.57 | -0.98 | 433 / 28,404 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 77 | 23.11 | 38.29 | 53.17 | 289.88 | 1.11× | 1.11× | -0.31 | -0.45 | 352 / 24,228 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 10 | 4.35 | 8.97 | 8.97 | 25.28 | 1.13× | 1.11× | 0.60 | 0.37 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 38 | 3.65 | 5.43 | 5.71 | 7.70 | 0.91× | 1.06× | -0.22 | -0.23 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 3 | 18.31 | 18.31 | 18.31 | 19.47 | 1.90× | 0.94× | 0.15 | -0.04 | 285 / 16,700 / 0 | — | 18.306 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 11 | 8.32 | 10.69 | 10.69 | 33.77 | 1.00× | 0.87× | -0.62 | -0.85 | 115 / 4,461 / 0 | — | 8.318 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 56.87 | 56.87 | 56.87 | 56.87 | 1.49× | 1.49× | -5.53 | -6.04 | 1,788 / 89,575 / 0 | — | 56.873 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 19.39 | 21.05 | 21.05 | 26.18 | 1.30× | 1.07× | 2.62 | 2.58 | 284 / 10,841 / 0 | — | 8.7253 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 12 | 9.50 | 12.09 | 12.09 | 17.28 | 0.89× | 0.71× | -0.38 | -0.60 | 122 / 5,444 / 0 | — | 3.7175 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 10.76 | 10.76 | 10.76 | 18.40 | 0.65× | 0.65× | -2.09 | -2.82 | 173 / 7,505 / 0 | — | 1.7933 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 11.48 | 11.48 | 11.48 | 12.81 | 0.84× | 0.84× | -0.57 | -0.55 | 180 / 8,330 / 0 | — | 1.9133 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 101.63 | 101.63 | 101.63 | 109.09 | no baseline | no baseline | -0.36 | -0.53 | 1,684 / 202,781 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 35.98 | 855.73 | 855.73 | 12471.51 | 0.52× | 12.40× | -1.08 | -1.38 | 250 / 25,266 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 209 | 487.86 | 718.50 | 847.85 | 2545.58 | 9.52× | 1.87× | -0.89 | 1.17 | 0 / 0 / 0 | 3576.70 | — | — |
| sandbox.exec | 0 files · uncontended | 138 | 30.24 | 45.00 | 395.76 | 8828.89 | 0.95× | 0.16× | -0.11 | -0.17 | — | 3,529 | — | — |
| sandbox.exec | 1 files · contended | 18 | 33.46 | 51.04 | 51.04 | 67.62 | 0.91× | 0.60× | -0.01 | -0.12 | — | 4.30 | 33.463 ms per file | — |
| sandbox.exec | 1 files · uncontended | 38 | 34.77 | 55.80 | 59.34 | 67.29 | 1.04× | 0.82× | -0.10 | -0.21 | — | 5 | 34.766 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 59.17 | 59.17 | 59.17 | 73.54 | 0.85× | 0.85× | -0.50 | -0.59 | — | 95 | 2.9585 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 5 | 69.22 | 71.19 | 71.19 | 76.17 | 0.99× | 1.02× | -0.51 | -0.58 | — | 102 | 3.4611 ms per file | — |
| sandbox.exec | 2–4 files · contended | 27 | 39.39 | 57.46 | 59.09 | 59.33 | 1.02× | 0.82× | 0.09 | 0.10 | — | 12.30 | 15.776 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 47 | 36.40 | 61.44 | 67.95 | 75.22 | 0.95× | 0.94× | -1.08 | -1.14 | — | 10 | 15.892 ms per file | — |
| sandbox.exec | 5–16 files · contended | 9 | 40.61 | 57.77 | 57.77 | 62.27 | 0.69× | 0.80× | 0.59 | 0.43 | — | 22.70 | 6.6575 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 11 | 52.05 | 66.21 | 66.21 | 70.98 | 0.73× | 0.63× | -0.60 | -0.39 | — | 29 | 6.0263 ms per file | — |
| sandbox.exec | — · contended | 14 | 2826.15 | 14792.94 | 14792.94 | 25282.36 | no baseline | no baseline | -2.53 | -3.25 | — | 55138.60 | — | — |
| sandbox.exec | — · uncontended | 27 | 287.63 | 22764.19 | 24066.21 | 31877.88 | 0.54× | 3.20× | -0.26 | -1.11 | — | 39078.10 | — | — |
| sandbox.mount | — · contended | 71 | 11.32 | 16.57 | 19.64 | 23.36 | 1.01× | 0.87× | -0.08 | -0.22 | 62 / 1,677 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 133 | 9.79 | 14.98 | 18.64 | 29.23 | 0.87× | 0.75× | -0.26 | -0.30 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · contended | 1 | 3.54 | 3.54 | 3.54 | 3.54 | no baseline | no baseline | 0.61 | 0.57 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 5.05 | 5.05 | 5.05 | 45.49 | no baseline | no baseline | 0.03 | -0.02 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 56 | 13.21 | 21.95 | 22.88 | 27.27 | 1.25× | 1.21× | -0.16 | -0.20 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 148 | 11.62 | 20.05 | 159.34 | 203.89 | 1.11× | 1.09× | 0.05 | 0.02 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 11 | 0.0 KiB | 587.4 KiB | 2,611 | ok 11 |
| branch.diff_commits | branch | 352 | 0.0 KiB | 19.3 MiB | 66,033 | ok 352 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.3 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 63 | 938.8 KiB | 0.0 KiB | 74 | Committed 63 |
| fs.diff_files | fs | 46 | 0.0 KiB | 216.3 KiB | 25 | NoSuchPath 21, Text 25 |
| fs.glob | fs | 50 | 0.0 KiB | 61.7 KiB | 770 | ok 50 |
| fs.grep | fs | 45 | 0.0 KiB | 185.8 KiB | 797 | ok 45 |
| fs.list | fs | 51 | 0.0 KiB | 310.1 KiB | 1,958 | ok 51 |
| fs.read | fs | 41 | 0.0 KiB | 138.2 KiB | 41 | ok 41 |
| fs.rm | fs | 117 | 0.0 KiB | 0.0 KiB | 117 | Committed 117 |
| fs.stat | fs | 52 | 0.0 KiB | 11.3 KiB | 52 | ok 52 |
| fs.write | fs | 653 | 11.3 MiB | 0.0 KiB | 653 | Committed 653 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 211 | 0.0 KiB | 0.0 KiB | 0 | Committed 162, UpToDate 48, Conflict 1 |
| sandbox.exec | sandbox | 556 | 1.4 MiB | 4.3 MiB | 0 | exit:0 553, exit:1 1, exit:2 2 |
| sandbox.mount | sandbox | 214 | 0.0 KiB | 0.0 KiB | 0 | Mounted 214 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 214 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 214 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.1 · end 1.87.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.06 | 13.098 · 1.26 · 1.035 · 1.06 · 0.906 | 2.43–2.43 | statements 30, vm_steps 1046, fullscan_steps 0, sorts 0, returned_rows 86 |
| read | 0.989 | 1.21 · 1.043 · 0.952 · 0.989 · 0.869 | 2.43–2.43 | statements 17, vm_steps 764, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_small | 0.971 | 0.971 · 0.864 · 0.987 · 0.957 · 0.999 | 2.43–2.43 | statements 17, vm_steps 773, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_largest | 6.798 | 9.509 · 6.798 · 6.748 · 6.947 · 6.641 | 2.43–2.43 | statements 161, vm_steps 15916, fullscan_steps 0, sorts 0, returned_rows 1754 |
| grep_scoped | 0.968 | 1.36 · 1.103 · 0.968 · 0.965 · 0.925 | 2.43–2.43 | statements 22, vm_steps 919, fullscan_steps 0, sorts 0, returned_rows 82 |
| glob_scoped | 0.911 | 0.911 · 0.876 · 0.815 · 0.963 · 0.918 | 2.43–2.43 | statements 16, vm_steps 752, fullscan_steps 0, sorts 0, returned_rows 72 |
| grep_tree | 4455.419 | 4601.87 · 4464.517 · 4455.419 · 4413.911 · 4433.478 | 2.02–2.32 | statements 52480, vm_steps 3982775, fullscan_steps 0, sorts 0, returned_rows 397224 |
| glob_tree | 7.928 | 10.166 · 8.381 · 7.897 · 7.578 · 7.928 | 2.02–2.02 | statements 179, vm_steps 19782, fullscan_steps 0, sorts 0, returned_rows 2068 |
| diff_files | 3.45 | 3.681 · 3.433 · 3.586 · 3.353 · 3.45 | 2.02–2.02 | statements 84, vm_steps 4468, fullscan_steps 0, sorts 0, returned_rows 438 |
| list_commits | 0.624 | 1.251 · 0.66 · 0.624 · 0.572 · 0.564 | 2.02–2.02 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.887 | 2.612 · 2.393 · 1.78 · 1.887 · 1.772 | 2.02–2.02 | statements 61, vm_steps 2388, fullscan_steps 0, sorts 0, returned_rows 277 |
| fork | 0.624 | 1.336 · 0.624 · 0.508 · 0.587 · 1.024 | 2.02–2.02 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 21.869 | 27.565 · 22.616 · 21.067 · 21.838 · 21.869 | 2.02–2.02 | statements 482, vm_steps 23136, fullscan_steps 0, sorts 0, returned_rows 1818 |
| oneshot_mount_unmount | 16.373 | 17.682 · 14.166 · 18.47 · 16.373 · 14.307 | 2.02–2.02 | statements 64, vm_steps 2266, fullscan_steps 82, sorts 2, returned_rows 222 |
| oneshot_commit | 74.013 | 74.725 · 65.969 · 70.515 · 74.289 · 74.013 | 2.02–2.02 | statements 179, vm_steps 12345, fullscan_steps 82, sorts 2, returned_rows 962 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.02–2.02 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r038: 268,149 pages of 4,096 B, 0 free · Commits 45,864 · Branches 893 · Layers 46 · compression 3.57× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 149,098 | 901.8 MiB |
| 2 | 55,220 | 818.6 MiB |
| 3 | 15,165 | 4.2 MiB |
| 4 | 45 | 8.9 KiB |
| 5 | 15,064 | 1.5 MiB |
| 6 | 112,627 | 549.0 MiB |
| 7 | 289,767 | 70.3 MiB |
| 8 | 703 | 209.1 KiB |
| 9 | 93,335 | 198.3 MiB |
| 10 | 49,240 | 6.1 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,299 | 187.6 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 46,973 | 91.7 MiB |
| 1 | 53,118 | 622.3 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 191,295 | 747.2 MiB | 27.3 MiB |
| inode_value | 44,951 | 175.6 MiB | 3.5 MiB |
| binding_hint | 12,806 | 50.0 MiB | 4.7 MiB |
| object_location | 10,801 | 42.2 MiB | 4.5 MiB |
| commit | 3,746 | 14.6 MiB | 2.4 MiB |
| file_digest | 1,288 | 5.0 MiB | 593.2 KiB |
| commit_lineage | 987 | 3.9 MiB | 452.9 KiB |
| commit_runs | 966 | 3.8 MiB | 509.1 KiB |
| commit_identity | 708 | 2.8 MiB | 315.5 KiB |
| content_signature | 157 | 628.0 KiB | 11.8 KiB |
| branch | 40 | 160.0 KiB | 29.5 KiB |
| branch_names | 15 | 60.0 KiB | 12.4 KiB |
| branch_identity | 11 | 44.0 KiB | 9.0 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 5 | 20.0 KiB | 4.9 KiB |
| layer | 4 | 16.0 KiB | 7.9 KiB |
| absorbed_heights | 3 | 12.0 KiB | 6.9 KiB |
| absorbed | 3 | 12.0 KiB | 6.9 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 249.5 s** (tooling): play 86.5 · consolidate 101.0 · verify 20.7 · probes 23.3 · tests 0.0 · seal + snapshot 7.6 · report 10.4

249.46 s tooling: prepare 1.47 · play 85.04 · consolidate 100.94 · verify 11.98 (diff_commits + full compareTree) · version walk 8.75 · probes 23.32 · metrics 0.73 · seal 1.33 · sealed figures 3.41 · snapshot copy 2.88 · report 0.32

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T01:35:52.489Z | stop | Correctness: tree 0 missing, 1 extra, 0 content, 0 mode; steps 2007/2008; conflicts 3/3; tests 30/30 equal to native; Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.12× it; Counters: not judged: no counters; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (17 classes too narrow) |
| 2 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T01:47:36.913Z | watch | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.4× it; Scaling: not judged: stat (chain-bounded): 8 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: oneshot_mount_unmount.vm_steps: depth exponent 0.093; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (20 classes too narrow) |

### G. Evidence

- `~/lfs-history/metrics/range-038.a1.json`
- `~/lfs-history/metrics/range-038.a2.json`
- trace `~/lfs-history/runs/p3-main-v/trace/range-038.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-v/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-038.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r038-3-root | 426 | 433.7 KiB |
| r038-2-agents-notes | 580 | 432.2 KiB |
| r038-1-packages-client | 496 | 441.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 370.0 | 3,485 |
| `git diff --stat` | 33.0 | 3,477 |
| `git add -f` | 28.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 35.0 | 3,482 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r038-2-agents-notes | end | P1 | pass | — | ✓ |
| r038-2-agents-notes | end | P2 | pass | exit 0 | ✓ |
| r038-2-agents-notes | end | P3 | pass | 252 bookkeeping path(s) | ✓ |
| r038-2-agents-notes | end | P4 | pass | 92 emitted files, exit 1 | ✓ |
| r038-2-agents-notes | end | P5 | pass | 32 files | ✓ |
| r038-2-agents-notes | end | P6 | n/a | not a repair | ✓ |
| r038-3-root | end | P1 | pass | — | ✓ |
| r038-3-root | end | P2 | pass | exit 0 | ✓ |
| r038-3-root | end | P3 | n/a | an install, not a refresh | ✓ |
| r038-3-root | end | P4 | pass | 123 emitted files, exit 2 | ✓ |
| r038-3-root | end | P5 | pass | 29 files | ✓ |
| r038-3-root | end | P6 | n/a | not a repair | ✓ |
| r038-1-packages-client | end | P1 | pass | — | ✓ |
| r038-1-packages-client | end | P2 | pass | exit 0 | ✓ |
| r038-1-packages-client | end | P3 | pass | 252 bookkeeping path(s) | ✓ |
| r038-1-packages-client | end | P4 | pass | 343 emitted files, exit 2 | ✓ |
| r038-1-packages-client | end | P5 | pass | 82 files | ✓ |
| r038-1-packages-client | end | P6 | n/a | not a repair | ✓ |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1831 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
