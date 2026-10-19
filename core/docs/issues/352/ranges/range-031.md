# Range 031 · **watch** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · forked from snapshot r030 (run p3-main-t)
dsh `069e0ecdc`..`0c8b3813f` · **32 commits** (13 mainline, 19 side) · 2026-07-15 → 2026-07-23
Areas changed: `/` 25% · `packages/client` 18% · `packages/ui` 15% · other 42%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 12 pass, 0 stop, 0 NOT_RUN over 3 points) · **Content 0.51×** · **Churn 0.00**
**Time split:** play 64.1 s · git 47.7 s · Node 143.2 s · verify 11.9 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **729.9 MiB** (+6.4 MiB) | **835.9 MiB** (+32.2 MiB) | **1.15×** (prev 1.11×) | **33.8 MiB** | **328** (total 35,351) | **232.3 s** tooling (total 87.0 min) |

**Checks:** 13 pass · 6 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 11.27× it; Scaling insufficient same-binary points: 1 of 3 (daemon 27a769a48998); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters insufficient same-binary points: 1 of 3 (daemon 27a769a48998); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 33.8 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 2696 ms for 709.9 MiB new; size exponent not judged (1 snapshots)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 7 merges: 0 (trips at 1)
**Moved most:** ▲ sandbox.exec p95 +94% · ▼ sandbox.commit p95 −64% · ▼ fs.list p95 −62%
**Budget:** 32 of 202 ranges · projected total 16.2 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **2,894 tracked files match** (blob id and mode) |
| History | 2 lanes merged, 1 publish |
| Steps | 794 / 794 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2525 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 377 bin shims, 3926 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (48 lines from 3 .gitignore files) · **77 picks** in 2 merges (77 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `0c8b3813f`** · 65 commits written for 65 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 77 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r031-2-agents-notes | end | `63ee5f0f72dc` | `1ab472d8e6a7` | pass (380 normalized) | pass | n/a | pass | pass | n/a |
| r031-1-packages-client | end | `398bd8f364df` | `f46e38acfa34` | pass (380 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `865956de2ff8` | `null` | n/a | pass | n/a | n/a | pass | pass (120,412 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/client/ui-sidebar/tests/apply.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/ui/app-boot/tests/config-reload.spec.ts` (fails natively).

## 2. Activity

**1,372 calls** · **76 steps** by **5 agents + lead** on **2 Branches + main** · **101 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +44 added · 215 modified · −21 deleted · 8.8 MiB written · fs 254 : Sandbox 26 (**10 : 1**, reported only in P3)
**Execs:** 256 (JS 28 · shell 228) · 2 non-zero exits · install 0 · test runs 3 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 429 | 267 | 162 | Committed 267 · Text 17 · NoSuchPath 4 · Equal 1 |
| sandbox | 557 | 352 | 3 | commit 96 (Committed 77, Conflict 1, UpToDate 18) · exec 256 (exit:0 254, exit:2 2) · mount 101 (Mounted 101) · status 3 · unmount 101 (Unmounted 101) |
| branch | 377 | 30 | 347 | diff_branches 4 · diff_commits 343 · fork 22 (Forked 22) · merge 7 (Merged 7) · publish 1 (Added 1) |
| project | 8 | 0 | 8 | list_commits 8 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,372** | **649** | **521** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r031-1-packages-client | a01 a02 | 36 | 158 | ✓ | — |
| r031-2-agents-notes | a03 a04 a05 | 35 | 157 | ✓ | — |
| main | lead | 5 | 13 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r031-1, a02 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r031-1, a02 a01 | merged cleanly |
| Decoy edit | 1 / 1 | r031-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r031-1 | 17 | 11 | 6 | 0 | 0 | 96 | commit-conflict, stale-clean-merge, decoy |
| a02 | r031-1 | 19 | 7 | 12 | 0 | 0 | 62 | commit-conflict, stale-clean-merge, decoy |
| a03 | r031-2 | 11 | 5 | 6 | 0 | 0 | 44 | — |
| a04 | r031-2 | 12 | 7 | 5 | 0 | 0 | 68 | — |
| a05 | r031-2 | 12 | 6 | 6 | 0 | 0 | 45 | — |
| lead | main | 5 | 1 | 0 | 4 | 0 | 13 | — |
| **Total** |  | **76** | **37** | **35** | **4** | **0** | **328** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 55 · pnpm 1 · tsc 2 · vitest 3 · other 195

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r031-1-packages-client | 22 | 22 | 22 | 1 | 22 | 296 |
| r031-2-agents-notes | 27 | 27 | 27 | 3 | 27 | 291 |
| **lead** | — | — | — | — | 65 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r031-2-agents-notes | 1 | 0 | 1 | 1 | 31 | 31 / 31 |
| r031-1-packages-client | 0 | 1 | 1 | 1 | 55 | 55 / 55 |
| **lead repair** | 1 | — | 1 | — | — | 120,412 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r030) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 723.5 MiB (18.7 MiB / 624.9 MiB / 17.1 MiB / 62.8 MiB) | 729.9 MiB (18.9 MiB / 624.9 MiB / 17.2 MiB / 69.0 MiB) | +6.4 MiB |
| Version figures from | — | full: first (no manifest for range 30) | — |
| Files / directories / symlinks | 54,105 / 8,840 / 3,934 | 54,122 / 8,844 / 3,934 | +17 / +4 / +0 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 803.7 MiB | 835.9 MiB | +32.2 MiB |
| **Space amplification** (total · tracked) | 1.11× · tracked 4.60× | 1.15× · tracked 4.90× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **18.18** (2.49 / 0.18 / 1.07) | 3.45× the median range |
| **Stored per Commit** | 19.3 KiB | 100.5 KiB | — |
| Metadata share | 0.38 | 0.38 | this range 0.32 |
| History: Commits / Layers / Branches | 35,023 | 35,351 / 17 / 262 | +328 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 33.16 GiB (Commits 31.36 GiB · installs 899.7 MiB · build 109.1 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 43.53 GiB / 36% | — |
| Snapshot | — | r031, 709.9 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 521.3 MiB | 0.71 | +21.4 MiB |
| Metadata | 69.3 MiB | 0.09 | +1.6 MiB |
| Index rows | 204.4 MiB | 0.28 | +8.4 MiB |
| Waste | 39.9 MiB | 0.05 | +842.5 KiB |
| Other | 1.0 MiB | 0.00 | +40.0 KiB |
| **Total = Store on disk** | **835.9 MiB** | **= 1.15** space amplification | +32.2 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 18.9 MiB | 92.3 MiB (54.7 MiB + 37.6 MiB) | 4.90× | — | 6.3 MiB | 1.9 MiB | 3.40 |
| `node_modules` | 624.9 MiB | 194.8 MiB (180.5 MiB + 14.3 MiB) | 0.31× | — | 846.1 KiB | 0.0 KiB | 23415.62 |
| Build output | 17.2 MiB | 12.3 MiB (11.5 MiB + 777.9 KiB) | 0.71× | — | 271.1 KiB | 6.7 MiB | 0.04 |
| `.git` | 69.0 MiB | 263.4 MiB (253.4 MiB + 10.0 MiB) | 3.82× | — | 15.6 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 245.3 MiB | — (not divided) | — | 9.2 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 27.9 MiB | — | — | — | — | — |
| **Total** | — | **835.9 MiB** | **= 1.15×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 121,558 | +1,223 | 6.1 KiB | 0 (derived) | 46% |
| Chunks (large files) | 49,668 | +1,310 | 14.8 KiB | — | 1% |
| Large-file extents | 14,251 | — | 0.2 KiB | — | — |
| Directories | 205,674 | 2,199 (with inodes, pooled) | 0.2 KiB | — | 35% |
| Inodes and attributes | 219,193 | ↑ pooled | 2.6 KiB | — | — |
| Symlinks | 2,204 | +3,935 | 0.1 KiB | — | — |

Delta: 1.2% at depth cap · 27% of refused bases stopped by budget · `node_modules` reinstall: absolute: 813948 new stored bytes for 37 raw changed bytes of 1 changed package (21998.595×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.90× (92.3 MiB for 18.9 MiB) |
| Store growth per git commit (index / loose objects / pack) | 3.1 KiB / 55.3 KiB / 55.8 KiB over 114 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.51× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.1 MiB stored for 1.22 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.57 (2 lanes × 729.9 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 4.6 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.2 ms / 46.8 ms (0.99×) | 2.5 ms / 3.6 ms (1.19×) | 4.2 ms / 6.0 ms (1.81×) | 23.3 ms / 87.4 ms (1.21×) | 10.2 ms / 16.9 ms (0.88×) | 2.2 ms / 2.2 ms (3.96×) | — (native comparison in P3; exec 39.8 ms / 3679 ms) |
| SQL p50: 169 stmts | 56 stmts | 73 stmts | 263 stmts | 56 stmts | 35 stmts | — |

**Commit cost:** 8.52 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 601 ms p50 over 101
**Slowest:** sandbox.exec 37617 ms · sandbox.exec 23908 ms · sandbox.exec 21797 ms · checkpoint diff_commits 0.10 ms and 1.54 statements per entry (63,597 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 303 ms / 303 ms | — / — | — | git / status-cold: — |
| git status (steady) | 318 ms / 390 ms | — / — | — | git / status-steady: — |
| git add | 25.0 ms / 56.0 ms | — / — | — | git / add: — |
| git commit (lane) | 29.0 ms / 41.0 ms | — / — | — | git / commit: — |
| lead writes main | 2253 ms / 2253 ms | — / — | — | — |
| repack | 971 ms / 971 ms | — / — | — | — |
| pnpm install (incremental) | 2148 ms / 2148 ms | 2195 ms / 2195 ms | 0.98× | pnpm-reinstall / cold: — |
| pnpm refresh | 2715 ms / 2715 ms | 1951 ms / 1951 ms | 1.39× | pnpm-reinstall / steady: — |
| tsc -b | 2584 ms / 2584 ms | 2840 ms / 2840 ms | 0.91× | tsc-b / cold: — |
| vitest | 8188 ms / 8188 ms | 5068 ms / 5068 ms | 1.62× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.6 ms / 29.2 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4194304 → 1763392 B · fs.write ≤64 KiB 4194304 → 1326672 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2661552 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 1174232 B
**Host load (1-min, recorded, not waited on):** macOS 9.03 at the first command → 7.12 after the last (max 9.75 over 5 commands) · Docker VM 3.14 → 1.82

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-031.a1)

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

- **a1 (`p3-main-u`, a fork of `p3-main-t`'s r030 snapshot; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`, the P3 re-baseline binaries from main 3c7852e50f): WATCH, terminal.** Checkpoint ok, git ✓. Node: 12 pass, 0 stop, 0 NOT_RUN over 3 points. Repair P6 pass (1,564 emitted). Control `control-031.a1` passes. Report check F1–F8 PASS.
- **First range on the re-baseline** (owner 2026-10-20: P3 speed re-baselined on main 3c7852e50f binaries; `baseline-27a769a48998-0611f3e0cf81-p3.json`). The run was forked onto them before r31, so no binary switch was needed. Speed reads "not judged" only because one class, `sandbox.commit` 0 files · Committed, has 3 calls per baseline range against the minimum of 5. The judged classes are recorded, not stops (fast mode, 5 ms floor): write 0.99×, read 1.19×, one-shot Commit 1.21×, mount 0.88×; list 1.81× and merge 3.96× are on 4.2 ms and 2.2 ms calls, under the floor.
- **Own volumes** (owner 2026-10-20, sessions share nothing they write): Store `layerfs-issue352-lead31-p3-main-u`, pnpm store `layerfs-issue352-lead31-pnpm-store` (a copy after the 117-lockfile fetch for ranges 31–50, all exit 0), native states `layerfs-issue352-lead31-native-states`, plan `plan-r31`, oracle `oracle-r31` (copies of r1). Harness `fe258e3843`.
- **Concurrent load:** no QUIET overlap recorded (`QUIET.overlaps.jsonl` absent). Host 1-min load 7.1–9.8 across the play commands. The exec-stdout-cap session was working during the play.
- Final steps: lanes 67 s (no cut), repair 108 s, verify 15 s, finish 45 s. Repair install 37.6 s, build 21.5 s, tests 4.1 s.
- Watch items: index rows 204.4 MiB (+8.4 MiB, #366). `fs.rm` uncontended p50 6.39 ms per file over 15 calls, 4,699 VM steps (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 794/794; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 11.27× it | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 27a769a48998); also not judged: oneshot_exec: 1 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 27a769a48998) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.32 | < 0.5 | pass |
| Reinstall growth | absolute: 813948 new stored bytes for 37 raw changed bytes of 1 changed package (21998.595×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.012 (budget 0.2676) | < 0.1 | pass |
| Range growth | 33.8 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 2696 ms for 709.9 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 0.96 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 65 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 12 pass · 0 stop · 0 NOT_RUN over 3 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 77 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.51× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 76 | 77 |
| Lanes / agents | 2 / 5 | 2 / 5 |
| LayerFS Commits | 328 | 270 |
| Workspaces (one-shot share) | 101 (0.98) | 34 (0.941) |
| Reads | 117 | 117 |
| Reconcile writes | 7 | 7 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 4 | 21.29 | 288.00 | 288.00 | 332.69 | 1.31× | 5.56× | — | — | 327 / 25,581 / 0 | — | 0.0869 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 338 | 20.02 | 36.10 | 42.16 | 364.67 | 1.16× | 1.39× | — | — | 302 / 32,192 / 0 | — | 0.1105 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 1.24 | 2.79 | 2.79 | 7.18 | 1.36× | 2.11× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 1 | 0.96 | 0.96 | 0.96 | 0.96 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0479 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 330.88 | 330.88 | 330.88 | 330.88 | 3.96× | 3.96× | — | — | 6,542 / 260,974 / 0 | — | 5.8049 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 2.22 | 2.22 | 2.22 | 2.22 | 1.43× | 1.43× | — | — | 35 / 517 / 0 | — | 0.0249 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 6.65 | 6.65 | 6.65 | 6.65 | 1.31× | 1.31× | — | — | 35 / 789 / 0 | — | — | — |
| fs.apply | >512 KiB · contended | 1 | 55.87 | 55.87 | 55.87 | 55.87 | no baseline | no baseline | — | — | 708 / 109,081 / 8,191 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 1 | 8.84 | 8.84 | 8.84 | 8.84 | 1.44× | 1.19× | — | — | 167 / 9,383 / 0 | — | 0.0417 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 1 | 22.37 | 22.37 | 22.37 | 22.37 | 1.66× | 1.66× | — | — | 170 / 67,426 / 8,191 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 231.33 | 231.33 | 231.33 | 231.33 | 25.07× | 14.86× | — | — | 1,174 / 224,415 / 16,710 | — | 0.0261 ms per byte | files.change |
| fs.apply | ≤8 KiB · uncontended | 1 | 8.90 | 8.90 | 8.90 | 8.90 | 1.36× | 0.82× | — | — | 172 / 8,115 / 0 | — | 0.0021 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 7.23 | 7.23 | 7.23 | 7.42 | 1.01× | 0.84× | — | — | 147 / 10,690 / 0 | — | — | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 4 | 6.49 | 7.97 | 7.97 | 9.63 | 1.11× | 0.99× | — | — | 135 / 10,106 / 0 | — | 0.0036 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 2 | 6.98 | 6.98 | 6.98 | 10.93 | 1.29× | 1.16× | — | — | 139 / 7,873 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 3 | 8.81 | 8.81 | 8.81 | 9.65 | 1.42× | 0.95× | — | — | 178 / 10,042 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 10.42 | 10.42 | 10.42 | 11.55 | 1.73× | 1.61× | — | — | 235 / 11,482 / 0 | — | 0.003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 9.65 | 9.76 | 9.76 | 12.07 | 1.31× | 1.22× | — | — | 182 / 9,437 / 0 | — | 0.0014 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 2 | 4.41 | 4.41 | 4.41 | 4.63 | 1.59× | 1.59× | — | — | 84 / 7,054 / 0 | — | 0.0746 ms per file | — |
| fs.glob | 17–64 files · uncontended | 2 | 4.65 | 4.65 | 4.65 | 14.74 | 1.65× | 1.23× | — | — | 85 / 7,356 / 0 | — | 0.0831 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 1.90 | 1.90 | 1.90 | 2.31 | 1.08× | 0.98× | — | — | 42 / 2,034 / 0 | — | 0.4745 ms per file | — |
| fs.glob | 5–16 files · contended | 2 | 3.63 | 3.63 | 3.63 | 3.80 | 2.16× | 2.16× | — | — | 59 / 5,669 / 0 | — | 0.2421 ms per file | — |
| fs.glob | 5–16 files · uncontended | 3 | 2.97 | 2.97 | 2.97 | 5.65 | 1.47× | 1.30× | — | — | 58 / 3,650 / 0 | — | 0.4957 ms per file | — |
| fs.glob | >64 files · contended | 2 | 12.82 | 12.82 | 12.82 | 22.60 | 2.37× | 2.37× | — | — | 298 / 28,663 / 0 | — | 0.0979 ms per file | — |
| fs.glob | >64 files · uncontended | 5 | 5.55 | 5.70 | 5.70 | 6.40 | 0.56× | 0.41× | — | — | 93 / 9,051 / 0 | — | 0.076 ms per file | — |
| fs.grep | 17–64 files · contended | 1 | 14.20 | 14.20 | 14.20 | 14.20 | 2.37× | 2.37× | — | — | 181 / 10,068 / 0 | — | 0.229 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 1 | 4.06 | 4.06 | 4.06 | 4.06 | 0.71× | 0.68× | — | — | 83 / 3,464 / 0 | — | 0.2386 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 1 | 1.69 | 1.69 | 1.69 | 1.69 | 0.73× | 0.53× | — | — | 40 / 2,590 / 0 | — | 0.4233 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 2.95 | 2.95 | 2.95 | 3.75 | 0.99× | 0.59× | — | — | 60 / 2,434 / 0 | — | 0.5361 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 4.05 | 11.54 | 11.54 | 27.99 | 1.08× | 1.92× | — | — | 82 / 4,120 / 0 | — | 0.5488 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 6 | 10.31 | 22.99 | 22.99 | 30.28 | 0.57× | 1.00× | — | — | 255 / 11,011 / 0 | — | 0.144 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 2 | 4.64 | 4.64 | 4.64 | 4.97 | 1.93× | 1.93× | — | — | 95 / 7,480 / 0 | — | 0.0927 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 10 | 4.54 | 6.00 | 6.00 | 6.61 | 1.81× | 2.05× | — | — | 74 / 7,152 / 0 | — | 0.0909 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 1 | 1.57 | 1.57 | 1.57 | 1.57 | 0.83× | 0.77× | — | — | 35 / 2,473 / 0 | — | 0.3922 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 7 | 2.18 | 3.26 | 3.26 | 4.84 | 1.15× | 0.85× | — | — | 50 / 3,446 / 0 | — | 0.3567 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 6 | 2.21 | 2.87 | 2.87 | 3.32 | 1.39× | 1.81× | — | — | 54 / 3,812 / 0 | — | 0.0028 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 1 | 3.62 | 3.62 | 3.62 | 3.62 | 1.72× | 0.61× | — | — | 73 / 2,988 / 0 | — | 0.0014 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 12 | 2.45 | 3.45 | 3.45 | 11.90 | 1.19× | 0.97× | — | — | 53 / 3,199 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 3 | 5.16 | 5.16 | 5.16 | 13.77 | 0.49× | 0.36× | — | — | 110 / 4,615 / 0 | — | 5.155 ms per file | commit |
| fs.rm | 1 files · uncontended | 15 | 6.39 | 13.30 | 13.30 | 14.46 | 0.95× | 1.19× | — | — | 118 / 4,699 / 0 | — | 6.394 ms per file | files.change |
| fs.stat | ≤1 KiB · uncontended | 4 | 2.86 | 3.09 | 3.09 | 7.62 | 1.86× | 2.01× | — | — | 62 / 4,185 / 0 | — | 0.006 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 1 | 2.91 | 2.91 | 2.91 | 2.91 | 1.11× | 0.85× | — | — | 93 / 4,778 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 2 | 0.83 | 0.83 | 0.83 | 2.00 | 0.42× | 0.38× | — | — | 19 / 658 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 2.26 | 2.26 | 2.26 | 2.63 | 1.01× | 0.76× | — | — | 47 / 2,635 / 0 | — | 0.0006 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 9 | 2.20 | 2.96 | 2.96 | 8.61 | 1.32× | 0.85× | — | — | 48 / 4,172 / 0 | — | 0.0009 ms per byte | — |
| fs.write | >512 KiB · contended | 2 | 44.80 | 44.80 | 44.80 | 136.31 | no baseline | no baseline | — | — | 546 / 39,661 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 12 | 16.87 | 218.01 | 218.01 | 263.76 | 1.98× | 14.62× | — | — | 353 / 17,842 / 0 | — | 0.036 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 18 | 10.84 | 17.08 | 17.08 | 17.25 | 1.70× | 1.62× | — | — | 190 / 9,623 / 0 | — | 0.0249 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 3 | 18.92 | 18.92 | 18.92 | 20.45 | 1.18× | 1.18× | — | — | 339 / 20,589 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 4 | 10.11 | 14.69 | 14.69 | 15.31 | 1.23× | 1.78× | — | — | 129 / 6,404 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 26 | 12.94 | 47.06 | 68.97 | 76.17 | 1.31× | 2.14× | — | — | 297 / 15,155 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 36 | 7.65 | 11.95 | 13.20 | 23.70 | 1.06× | 0.88× | — | — | 143 / 5,813 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 37 | 14.70 | 56.60 | 59.52 | 246.37 | 1.50× | 2.52× | — | — | 333 / 15,728 / 0 | — | 0.0036 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 94 | 7.16 | 14.67 | 20.79 | 20.98 | 0.99× | 1.06× | — | — | 136 / 5,428 / 0 | — | 0.0023 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.20 | 1.20 | 1.20 | 1.20 | 1.59× | 1.59× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 21 | 28.12 | 46.45 | 46.45 | 57.11 | 1.33× | 1.33× | — | — | 414 / 22,952 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 29 | 25.16 | 40.68 | 106.07 | 169.96 | 1.21× | 1.17× | — | — | 390 / 22,482 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 2 | 2.77 | 2.77 | 2.77 | 3.31 | 0.72× | 0.34× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 16 | 3.82 | 4.87 | 4.87 | 5.60 | 0.95× | 0.95× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 2 | 14.14 | 14.14 | 14.14 | 28.62 | 1.47× | 0.73× | — | — | 239 / 11,869 / 0 | — | 14.137 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 6 | 8.96 | 9.60 | 9.60 | 11.42 | 1.08× | 0.78× | — | — | 116 / 3,894 / 0 | — | 8.955 ms per file | commit |
| sandbox.commit | 1 files · Conflict · uncontended | 1 | 55.81 | 55.81 | 55.81 | 55.81 | no baseline | no baseline | — | — | 1,236 / 136,166 / 8,191 | — | 55.809 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 2 | 8.50 | 8.50 | 8.50 | 34.52 | 0.57× | 0.43× | — | — | 94 / 3,959 / 0 | — | 4.25 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 2 | 8.66 | 8.66 | 8.66 | 10.12 | 0.81× | 0.51× | — | — | 100 / 3,670 / 0 | — | 2.529 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 15.03 | 15.03 | 15.03 | 15.03 | 1.10× | 1.10× | — | — | 206 / 12,280 / 0 | — | 2.5052 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 9 | 72.23 | 777.97 | 777.97 | 13625.00 | 1.05× | 11.27× | — | — | 617 / 43,857 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 85 | 475.48 | 654.08 | 3852.20 | 3886.59 | 9.28× | 1.70× | — | — | — | 3,112 | — | — |
| sandbox.exec | 0 files · uncontended | 69 | 33.87 | 494.84 | 540.57 | 5044.18 | 1.07× | 1.73× | — | — | — | 3132.70 | — | — |
| sandbox.exec | 1 files · contended | 10 | 29.94 | 46.87 | 46.87 | 79.39 | 0.82× | 0.56× | — | — | — | 4.70 | 29.937 ms per file | — |
| sandbox.exec | 1 files · uncontended | 22 | 30.89 | 50.68 | 56.30 | 60.54 | 0.93× | 0.75× | — | — | — | 5 | 30.891 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 1 | 84.49 | 84.49 | 84.49 | 84.49 | 1.21× | 1.21× | — | — | — | 96 | 4.2245 ms per file | — |
| sandbox.exec | 2–4 files · contended | 12 | 36.94 | 51.34 | 51.34 | 62.04 | 0.95× | 0.74× | — | — | — | 13.50 | 11.8795 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 7 | 43.75 | 61.07 | 61.07 | 63.45 | 1.15× | 0.93× | — | — | — | 13.50 | 14.241 ms per file | — |
| sandbox.exec | 5–16 files · contended | 2 | 24.18 | 24.18 | 24.18 | 68.85 | 0.41× | 0.33× | — | — | — | 12.70 | 4.0295 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 7 | 76.25 | 99.56 | 99.56 | 157.96 | 1.07× | 0.95× | — | — | — | 44 | 6.1213 ms per file | — |
| sandbox.exec | — · contended | 7 | 4425.37 | 11981.91 | 11981.91 | 23907.81 | no baseline | no baseline | — | — | — | 47467.90 | — | — |
| sandbox.exec | — · uncontended | 24 | 233.42 | 21500.47 | 21796.87 | 37616.60 | 0.44× | 3.02× | — | — | — | 47467.90 | — | — |
| sandbox.mount | — · contended | 27 | 10.42 | 14.92 | 16.93 | 26.19 | 0.93× | 0.78× | — | — | 65 / 1,719 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 64 | 9.88 | 15.66 | 20.28 | 23.28 | 0.88× | 0.78× | — | — | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 3 | 3.59 | 3.59 | 3.59 | 43.07 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 19 | 12.04 | 16.20 | 16.20 | 18.93 | 1.14× | 0.89× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 72 | 10.61 | 29.22 | 193.49 | 259.42 | 1.01× | 1.59× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 4 | 0.0 KiB | 211.3 KiB | 981 | ok 4 |
| branch.diff_commits | branch | 343 | 0.0 KiB | 18.8 MiB | 64,006 | ok 343 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 8 | 0.0 KiB | 85.3 KiB | 123 | ok 8 |
| branch.merge | branch | 7 | 0.0 KiB | 0.0 KiB | 0 | Merged 7 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 17 | 905.3 KiB | 0.0 KiB | 28 | Committed 17 |
| fs.diff_files | fs | 22 | 0.0 KiB | 204.6 KiB | 18 | Text 17, NoSuchPath 4, Equal 1 |
| fs.glob | fs | 29 | 0.0 KiB | 37.2 KiB | 431 | ok 29 |
| fs.grep | fs | 29 | 0.0 KiB | 112.8 KiB | 507 | ok 29 |
| fs.list | fs | 32 | 0.0 KiB | 201.3 KiB | 1,299 | ok 32 |
| fs.read | fs | 24 | 0.0 KiB | 56.1 KiB | 24 | ok 24 |
| fs.rm | fs | 18 | 0.0 KiB | 0.0 KiB | 18 | Committed 18 |
| fs.stat | fs | 26 | 0.0 KiB | 5.8 KiB | 26 | ok 26 |
| fs.write | fs | 232 | 8.0 MiB | 0.0 KiB | 232 | Committed 232 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 96 | 0.0 KiB | 0.0 KiB | 0 | Committed 77, Conflict 1, UpToDate 18 |
| sandbox.exec | sandbox | 256 | 494.3 KiB | 3.3 MiB | 0 | exit:0 254, exit:2 2 |
| sandbox.mount | sandbox | 101 | 0.0 KiB | 0.0 KiB | 0 | Mounted 101 |
| sandbox.status | sandbox | 3 | 0.0 KiB | 0.0 KiB | 0 | ok 3 |
| sandbox.unmount | sandbox | 101 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 101 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 3.14 · end 1.82.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.365 | 15.778 · 1.665 · 1.365 · 1.228 · 1.126 | 2.36–2.36 | statements 28, vm_steps 951, fullscan_steps 0, sorts 0, returned_rows 83 |
| read | 1.344 | 1.506 · 1.351 · 1.344 · 1.224 · 1.082 | 2.36–2.36 | statements 16, vm_steps 690, fullscan_steps 0, sorts 0, returned_rows 71 |
| list_small | 1.378 | 1.156 · 1.486 · 1.617 · 1.378 · 1.068 | 2.36–2.36 | statements 16, vm_steps 699, fullscan_steps 0, sorts 0, returned_rows 71 |
| list_largest | 7.194 | 8.957 · 7.194 · 7.412 · 6.707 · 6.781 | 2.36–2.36 | statements 117, vm_steps 11975, fullscan_steps 0, sorts 0, returned_rows 1242 |
| grep_scoped | 1.266 | 1.55 · 1.222 · 1.266 · 1.239 · 1.299 | 2.36–2.36 | statements 21, vm_steps 845, fullscan_steps 0, sorts 0, returned_rows 80 |
| glob_scoped | 1.188 | 1.339 · 1.695 · 1.188 · 1.089 · 1.031 | 2.36–2.36 | statements 15, vm_steps 678, fullscan_steps 0, sorts 0, returned_rows 70 |
| grep_tree | 4608.727 | 4916.379 · 4570.297 · 4341.715 · 4608.727 · 4866.508 | 1.97–2.25 | statements 47672, vm_steps 3790303, fullscan_steps 0, sorts 0, returned_rows 382722 |
| glob_tree | 7.405 | 9.597 · 7.405 · 7.353 · 7.397 · 7.66 | 1.97–1.97 | statements 133, vm_steps 17389, fullscan_steps 0, sorts 0, returned_rows 1843 |
| diff_files | 4.987 | 4.987 · 5.419 · 5.247 · 4.775 · 4.982 | 1.97–1.97 | statements 78, vm_steps 4024, fullscan_steps 0, sorts 0, returned_rows 426 |
| list_commits | 1.008 | 2.636 · 1.008 · 0.97 · 0.846 · 1.118 | 1.97–1.97 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.624 | 3.323 · 2.624 · 2.233 · 2.346 · 2.686 | 1.97–1.97 | statements 58, vm_steps 1972, fullscan_steps 0, sorts 0, returned_rows 223 |
| fork | 0.796 | 0.826 · 0.513 · 1.204 · 0.796 · 0.528 | 1.97–1.97 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 33.863 | 29.821 · 33.684 · 36.535 · 53.599 · 33.863 | 1.97–1.97 | statements 472, vm_steps 21738, fullscan_steps 0, sorts 0, returned_rows 1633 |
| oneshot_mount_unmount | 18.619 | 20.991 · 18.619 · 21.747 · 17.153 · 16.41 | 1.97–1.97 | statements 62, vm_steps 2171, fullscan_steps 82, sorts 2, returned_rows 219 |
| oneshot_commit | 90.274 | 71.6 · 90.274 · 103.461 · 120.4 · 74.111 | 1.97–1.97 | statements 173, vm_steps 12070, fullscan_steps 82, sorts 2, returned_rows 904 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.97–1.97 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r031: 213,991 pages of 4,096 B, 0 free · Commits 35,767 · Branches 677 · Layers 38 · compression 3.48× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 121,558 | 721.2 MiB |
| 2 | 49,668 | 717.9 MiB |
| 3 | 14,207 | 3.4 MiB |
| 4 | 44 | 8.7 KiB |
| 5 | 14,107 | 1.4 MiB |
| 6 | 83,787 | 414.2 MiB |
| 7 | 205,274 | 48.2 MiB |
| 8 | 400 | 122.8 KiB |
| 9 | 69,954 | 142.5 MiB |
| 10 | 38,523 | 4.7 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,204 | 180.4 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 36,582 | 69.3 MiB |
| 1 | 44,256 | 521.3 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 158,097 | 617.6 MiB | 22.2 MiB |
| inode_value | 32,042 | 125.2 MiB | 2.6 MiB |
| binding_hint | 8,909 | 34.8 MiB | 3.3 MiB |
| object_location | 8,348 | 32.6 MiB | 3.6 MiB |
| commit | 2,863 | 11.2 MiB | 1.8 MiB |
| file_digest | 1,144 | 4.5 MiB | 530.2 KiB |
| commit_lineage | 772 | 3.0 MiB | 363.1 KiB |
| commit_runs | 755 | 2.9 MiB | 404.1 KiB |
| commit_identity | 548 | 2.1 MiB | 229.6 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 28 | 112.0 KiB | 13.2 KiB |
| branch_names | 11 | 44.0 KiB | 7.9 KiB |
| branch_identity | 9 | 36.0 KiB | 9.5 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 4 | 16.0 KiB | 4.6 KiB |
| layer | 3 | 12.0 KiB | 5.3 KiB |
| absorbed_heights | 3 | 12.0 KiB | 7.9 KiB |
| absorbed | 3 | 12.0 KiB | 7.9 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 232.3 s** (tooling): play 65.7 · consolidate 105.2 · verify 20.4 · probes 24.5 · tests 0.0 · seal + snapshot 7.4 · report 9.1

232.31 s tooling: prepare 1.65 · play 64.11 · consolidate 105.17 · verify 11.93 (diff_commits + full compareTree) · version walk 8.44 · probes 24.50 · metrics 0.76 · seal 1.26 · sealed figures 3.38 · snapshot copy 2.74 · report 0.54

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-19T23:26:44.765Z | watch | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 11.27× it; Scaling: insufficient same-binary points: 1 of 3 (daemon 27a769a48998); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 27a769a48998); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 33.8 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 2696 ms for 709.9 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-031.a1.json`
- trace `~/lfs-history/runs/p3-main-u/trace/range-031.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-u/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-031.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r031-1-packages-client | 296 | 352.2 KiB |
| r031-2-agents-notes | 291 | 356.1 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 318.0 | 2,885 |
| `git diff --stat` | 30.0 | 2,879 |
| `git add -f` | 25.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 29.0 | 2,882 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r031-2-agents-notes | end | P1 | pass | — | — |
| r031-2-agents-notes | end | P2 | pass | exit 0 | — |
| r031-2-agents-notes | end | P3 | n/a | an install, not a refresh | — |
| r031-2-agents-notes | end | P4 | pass | 114 emitted files, exit 2 | — |
| r031-2-agents-notes | end | P5 | pass | 31 files | — |
| r031-2-agents-notes | end | P6 | n/a | not a repair | — |
| r031-1-packages-client | end | P1 | pass | — | — |
| r031-1-packages-client | end | P2 | pass | exit 0 | — |
| r031-1-packages-client | end | P3 | pass | 240 bookkeeping path(s) | — |
| r031-1-packages-client | end | P4 | pass | 196 emitted files, exit 2 | — |
| r031-1-packages-client | end | P5 | pass | 55 files | — |
| r031-1-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1564 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
