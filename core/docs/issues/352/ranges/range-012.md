# Range 012 · **watch** · attempt 1

**Matches git ✓** · daemon `6d467539f759` · image `d3773b4e` · plan v2 · continued from r011 (live Store)
dsh `cdd1ce2ad`..`4cda9dd03` · **50 commits** (8 mainline, 42 side) · 2026-07-08 → 2026-07-12
Areas changed: `/` 12% · `packages/ui` 10% · `packages/bash` 9% · other 70%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **8.5 MiB** (+801.5 KiB) | **40.2 MiB** (+7.5 MiB) live | **4.73×** (prev 4.24×) | **4.8 MiB** | **736** (total 8,519) | **15.6 s** tooling (total 4.2 min) |

**Checks:** 7 pass · 6 watch: Speed not judged: fs.glob >64 files · uncontended: baseline class has 0/2/2 calls (minimum 5 per range); 4.08× it; Scaling insufficient same-binary points: 2 of 3 (daemon 6d467539f759); Counters insufficient same-binary points: 2 of 3 (daemon 6d467539f759); Contended work not judged: no contended class has 3 ranges of 5+ calls; Directory share 0.553; Range growth 4.8 MiB; median not judged: 1 of 3 earlier ranges
**Moved most:** ▲ sandbox.exec p95 +103% · ▼ fs.write p95 −86% · ▲ probe list_commits +70%
**Budget:** 13 of 202 ranges · projected total 1.1 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **223 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 1,232 / 1,232 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,336 calls** · **129 steps** by **6 agents + lead** on **3 Branches + main** · **67 Workspaces** (97% one-shot, 0 open at end)
**File changes:** +123 added · 612 modified · −34 deleted · 13.8 MiB written · fs 705 : Sandbox 64 (**11 : 1**, target ~9 : 1)
**Execs:** 152 (JS 32 · shell 120) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 964 | 709 | 255 | Committed 707 · Text 31 · NoSuchPath 8 · UpToDate 2 |
| sandbox | 350 | 216 | 0 | commit 64 (Committed 32, UpToDate 31, Conflict 1) · exec 152 (exit:0 152) · mount 67 (Mounted 67) · unmount 67 (Unmounted 67) |
| branch | 18 | 15 | 3 | diff_commits 3 · fork 10 (Forked 10) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,336** | **940** | **262** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r012-1-examples-acp-agent | a01 a02 | 40 | 211 | ✓ | — |
| r012-2-packages-core | a03 a04 | 36 | 215 | ✓ | — |
| r012-3-root | a05 a06 | 47 | 207 | ✓ | — |
| main | lead | 6 | 103 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r012-3, a05 after a06 | 0.2 s |
| Stale clean merge | 1 / 1 | r012-3, a05 a06 | merged cleanly |
| Decoy edit | 1 / 1 | r012-3, a06 a05 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r012-1 | 20 | 9 | 11 | 0 | 0 | 115 | — |
| a02 | r012-1 | 20 | 11 | 9 | 0 | 0 | 96 | — |
| a03 | r012-2 | 23 | 10 | 13 | 0 | 0 | 140 | — |
| a04 | r012-2 | 13 | 8 | 5 | 0 | 0 | 75 | — |
| a05 | r012-3 | 23 | 11 | 12 | 0 | 0 | 139 | commit-conflict, stale-clean-merge, decoy |
| a06 | r012-3 | 24 | 8 | 16 | 0 | 0 | 68 | commit-conflict, stale-clean-merge, decoy |
| lead | main | 6 | 1 | 0 | 5 | 0 | 103 | — |
| **Total** |  | **129** | **58** | **66** | **5** | **0** | **736** | **3** |

## 3. Storage

**3a. Overview**

|  | Previous (r011) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 7.7 MiB (7.7 MiB / 0.0 KiB / 0.0 KiB) | 8.5 MiB (8.5 MiB / 0.0 KiB / 0.0 KiB) | +801.5 KiB |
| Files / directories / symlinks | 1,051 / 329 / 6 | 1,140 / 368 / 6 | +89 / +39 / +0 |
| Largest file / largest directory | 238.1 KiB / 38 entries | 244.9 KiB (`pnpm-lock.yaml`) / 39 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, live: file + WAL) | 32.7 MiB | 40.2 MiB | +7.5 MiB |
| **Space amplification** (total · tracked) | 4.24× · tracked 2.45× | 4.73× · tracked 2.48× | 0.50 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **1.98** (0.39 / 0.49 / 2.22) | 1.15× the median range |
| **Stored per Commit** | 2.9 KiB | 10.5 KiB | — |
| Metadata share | 0.74 | 0.67 | this range 0.55 |
| History: Commits / Layers / Branches | 7,783 | 8,519 / 10 / 59 | +736 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 3.35 GiB (Commits 2.06 GiB · installs 1.13 GiB · build 120.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 47.53 GiB / 41% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 9.4 MiB | 1.11 | +980.0 KiB |
| Metadata | 11.6 MiB | 1.36 | +1.2 MiB |
| Index rows + waste + other (live, not split) | 19.2 MiB | 2.26 | — |
| **Total = Store on disk** | **40.2 MiB** | **= 4.73** space amplification | +7.5 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 8.5 MiB | 21.0 MiB (9.4 MiB + 11.6 MiB) | 2.48× | — | 2.1 MiB | 2.4 MiB | 0.88 |
| `node_modules` | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Build output | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 19.2 MiB | — (not divided) | — | 5.4 MiB | — | — |
| **Total** | — | **40.2 MiB** | **= 4.73×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +1,178 | — | 0 (derived) | 89% |
| Chunks (large files) | — (at snapshots) | +1,470 | — | — | 8% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 1,416 (with inodes, pooled) | — | — | 87% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +0 | — | — | — |

Delta: 3.4% at depth cap · 35% of refused bases stopped by budget · `node_modules` reinstall: none this range

## 4. Speed

Daemon `6d467539f759` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 12.4 ms / 47.9 ms (1.29×) | 2.9 ms / 5.6 ms (0.93×) | 3.1 ms / 6.5 ms (1.40×) | 19.9 ms / 146 ms (1.01×) | 11.0 ms / 59.4 ms (0.90×) | 276 ms / 276 ms (1.74×) | — (native comparison in P3; exec 47.5 ms / 185 ms) |
| SQL p50: 886 stmts | 225 stmts | 265 stmts | 230 stmts | 57 stmts | 7,294 stmts | — |

**Commit cost:** 24.78 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 206 ms p50 over 67
**Slowest:** sandbox.exec 561 ms · sandbox.exec 357 ms · sandbox.exec 318 ms (20 files) · checkpoint diff_commits 0.08 ms and 7.00 statements per entry (310 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 312 MB (−171 MB) over 7 of 7 Sandboxes · 97 open files · WAL 4.0 MiB (live)

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

### Lead's note (written by the lead; never empty unless the verdict is pass)

- Watch: nothing trips. The `fs.glob` >64 files class reads 4.08× a thin baseline class (0/2/2 calls, under 5 per range), so it is not judged (F-024). The uncontended `branch.merge` p95 is 276–292 ms, in line with range 11 and with F-020 step 6 (286 ms p50 there). In-lane merge cost is F-025, already queued. Scaling and Counters have 2 of 3 same-binary points; range 13 opens them. Continue to 13.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1232/1232; conflicts 3/3; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: fs.glob >64 files · uncontended: baseline class has 0/2/2 calls (minimum 5 per range); 4.08× it | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 6d467539f759) | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 6d467539f759) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.553 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0335 (budget 0.35) | < 0.1 | pass |
| Range growth | 4.8 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.17 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 129 | 130 |
| Lanes / agents | 3 / 6 | 3 / 6 |
| LayerFS Commits | 736 | 738 |
| Workspaces (one-shot share) | 67 (0.97) | 65 (0.969) |
| Reads | 241 | 241 |
| Reconcile writes | 101 | 101 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `6d467539f759` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries · uncontended | 2 | 9.84 | 9.84 | 9.84 | 25.99 | 1.50× | 1.50× | — | — | 612 / 26,042 / 0 | — | 0.1092 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.29 | 0.66 | 0.66 | 0.78 | 0.47× | 0.79× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 276.03 | 276.03 | 276.03 | 276.03 | 1.74× | 1.74× | — | — | 7,294 / 124,759 / 790 | — | 6.4192 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 1 | 291.57 | 291.57 | 291.57 | 291.57 | 2.50× | 2.50× | — | — | 9,199 / 151,078 / 790 | — | 2.6507 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 3.04 | 3.04 | 3.04 | 3.04 | 0.98× | 0.98× | — | — | 452 / 11,414 / 0 | — | 0.0292 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 7.58 | 7.58 | 7.58 | 7.58 | 1.82× | 1.82× | — | — | 753 / 19,559 / 0 | — | — | — |
| fs.apply | ≤1 KiB · contended | 7 | 11.14 | 13.99 | 13.99 | 16.19 | 0.99× | 1.04× | — | — | 834 / 42,899 / 1,659 | — | 0.016 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 2 | 6.63 | 6.63 | 6.63 | 8.57 | 0.97× | 0.97× | — | — | 246 / 19,696 / 804 | — | 0.0071 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 17 | 15.25 | 33.19 | 33.19 | 41.54 | 1.30× | 0.96× | — | — | 765 / 40,645 / 1,628 | — | 0.0011 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 3 | 8.78 | 8.78 | 8.78 | 9.53 | 1.13× | 1.07× | — | — | 331 / 18,980 / 804 | — | 0.001 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 20 | 13.59 | 25.97 | 25.97 | 191.55 | 1.18× | 1.01× | — | — | 943 / 45,729 / 1,663 | — | 0.0045 ms per byte | files.change |
| fs.apply | ≤8 KiB · uncontended | 2 | 9.52 | 9.52 | 9.52 | 11.58 | 1.23× | 0.87× | — | — | 592 / 32,225 / 805 | — | 0.0024 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 12 | 6.22 | 9.13 | 9.13 | 16.05 | 1.84× | 1.69× | — | — | 382 / 13,042 / 0 | — | 0.0223 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 2 | 4.62 | 4.62 | 4.62 | 11.43 | 1.10× | 0.77× | — | — | 162 / 5,454 / 0 | — | 0.041 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 16 | 4.88 | 7.70 | 7.70 | 9.58 | 0.89× | 1.30× | — | — | 397 / 12,782 / 0 | — | 0.0002 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 1 | 8.52 | 8.52 | 8.52 | 8.52 | 1.82× | 1.82× | — | — | 267 / 9,439 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 6 | 4.54 | 5.21 | 5.21 | 5.60 | 1.18× | 1.11× | — | — | 382 / 12,943 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 1 | 3.35 | 3.35 | 3.35 | 3.35 | 0.88× | 0.88× | — | — | 243 / 8,154 / 0 | — | 0.0013 ms per byte | sdk.read |
| fs.glob | 17–64 files · contended | 5 | 4.20 | 6.46 | 6.46 | 6.59 | 0.92× | 1.42× | — | — | 567 / 17,508 / 0 | — | 0.2009 ms per file | — |
| fs.glob | 2–4 files · contended | 11 | 3.31 | 5.58 | 5.58 | 10.32 | 1.46× | 1.64× | — | — | 261 / 8,671 / 0 | — | 1.048 ms per file | — |
| fs.glob | 5–16 files · contended | 12 | 3.41 | 6.35 | 6.35 | 9.51 | 1.34× | 1.76× | — | — | 318 / 11,784 / 0 | — | 0.3533 ms per file | — |
| fs.glob | 5–16 files · uncontended | 1 | 4.79 | 4.79 | 4.79 | 4.79 | 2.00× | 1.47× | — | — | 111 / 3,941 / 0 | — | 0.9588 ms per file | — |
| fs.glob | >64 files · contended | 8 | 7.28 | 38.16 | 38.16 | 179.71 | 0.90× | 3.95× | — | — | 670 / 34,262 / 748 | — | 0.0331 ms per file | — |
| fs.glob | >64 files · uncontended | 4 | 9.14 | 15.90 | 15.90 | 26.77 | 2.35× | 4.08× | — | — | 408 / 18,526 / 0 | — | 0.0486 ms per file | — |
| fs.grep | 1 files · contended | 1 | 2.20 | 2.20 | 2.20 | 2.20 | 0.95× | 0.85× | — | — | 190 / 18,120 / 751 | — | 2.197 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 6 | 10.17 | 20.38 | 20.38 | 28.84 | 1.02× | 1.62× | — | — | 1,178 / 18,967 / 60 | — | 0.4739 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 12 | 4.45 | 5.76 | 5.76 | 6.06 | 1.34× | 1.33× | — | — | 356 / 9,863 / 0 | — | 1.1787 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 1 | 4.11 | 4.11 | 4.11 | 4.11 | 1.94× | 1.91× | — | — | 270 / 6,643 / 0 | — | 1.3703 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 6 | 7.72 | 10.68 | 10.68 | 16.36 | 1.88× | 1.51× | — | — | 552 / 12,146 / 60 | — | 0.7358 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 3 | 4.08 | 4.08 | 4.08 | 8.22 | 0.91× | 0.65× | — | — | 246 / 5,864 / 0 | — | 0.5138 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 10 | 7.07 | 63.73 | 63.73 | 151.60 | 0.68× | 5.27× | — | — | 1,207 / 32,892 / 0 | — | 0.0324 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 1 | 7.97 | 7.97 | 7.97 | 7.97 | 0.91× | 0.91× | — | — | 264 / 8,076 / 0 | — | 0.0424 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 2 | 1.58 | 1.58 | 1.58 | 2.26 | 0.79× | 0.79× | — | — | 124 / 8,187 / 0 | — | 1.582 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 2.63 | 2.63 | 2.63 | 2.63 | 1.34× | 1.34× | — | — | 201 / 6,056 / 0 | — | 2.634 ms per entrie | — |
| fs.list | 17–64 entries · contended | 10 | 4.18 | 5.67 | 5.67 | 7.38 | 1.86× | 1.89× | — | — | 321 / 12,552 / 0 | — | 0.1992 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 2 | 1.88 | 1.88 | 1.88 | 5.95 | 0.81× | 0.81× | — | — | 105 / 4,904 / 0 | — | 0.0647 ms per entrie | — |
| fs.list | 2–4 entries · contended | 10 | 3.15 | 4.87 | 4.87 | 6.45 | 1.37× | 1.24× | — | — | 326 / 9,296 / 0 | — | 0.8558 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 2 | 2.45 | 2.45 | 2.45 | 4.67 | 1.55× | 1.55× | — | — | 162 / 5,821 / 0 | — | 1.1687 ms per entrie | — |
| fs.list | 5–16 entries · contended | 11 | 3.15 | 5.64 | 5.64 | 8.49 | 1.27× | 1.58× | — | — | 265 / 9,360 / 0 | — | 0.543 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 3 | 2.73 | 2.73 | 2.73 | 3.02 | 1.40× | 1.28× | — | — | 147 / 6,153 / 0 | — | 0.3033 ms per entrie | — |
| fs.read | ≤64 KiB · contended | 6 | 2.75 | 4.27 | 4.27 | 5.22 | 1.24× | 1.93× | — | — | 234 / 7,690 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 30 | 2.99 | 6.20 | 6.29 | 11.47 | 1.10× | 1.22× | — | — | 254 / 7,331 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 6 | 2.11 | 2.58 | 2.58 | 3.22 | 0.93× | 0.54× | — | — | 144 / 4,280 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 15 | 13.40 | 23.52 | 23.52 | 110.54 | 1.47× | 1.42× | — | — | 1,259 / 54,472 / 1,622 | — | 13.401 ms per file | commit |
| fs.rm | 1 files · uncontended | 17 | 13.73 | 18.76 | 18.76 | 21.56 | 1.76× | 1.95× | — | — | 355 / 19,387 / 850 | — | 13.729 ms per file | commit |
| fs.stat | ≤512 KiB · contended | 3 | 1.87 | 1.87 | 1.87 | 2.82 | no baseline | no baseline | — | — | 96 / 3,421 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 19 | 2.82 | 6.20 | 6.20 | 6.38 | 1.09× | 1.61× | — | — | 195 / 6,322 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 5 | 2.97 | 3.98 | 3.98 | 5.16 | 1.49× | 2.00× | — | — | 99 / 3,555 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 8 | 2.37 | 3.46 | 3.46 | 5.19 | 1.08× | 0.94× | — | — | 198 / 5,721 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 4 | 1.95 | 2.20 | 2.20 | 3.85 | 1.04× | 0.98× | — | — | 111 / 3,904 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 41 | 11.52 | 20.75 | 148.51 | 238.86 | 1.15× | 1.01× | — | — | 807 / 39,167 / 1,604 | — | 0.0228 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 12 | 9.25 | 23.49 | 23.49 | 28.54 | 1.46× | 2.28× | — | — | 496 / 21,663 / 850 | — | 0.0158 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 18 | 15.61 | 114.14 | 114.14 | 153.85 | 1.20× | 8.75× | — | — | 1,492 / 60,099 / 1,680 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 6 | 11.82 | 16.80 | 16.80 | 32.87 | 1.24× | 1.76× | — | — | 480 / 21,496 / 840 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 212 | 13.93 | 99.36 | 170.19 | 239.41 | 1.07× | 1.00× | — | — | 1,140 / 47,032 / 1,678 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 112 | 9.97 | 17.66 | 20.08 | 48.79 | 1.29× | 1.40× | — | — | 565 / 22,791 / 850 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 162 | 13.26 | 84.30 | 173.63 | 192.26 | 1.10× | 1.16× | — | — | 981 / 43,338 / 1,636 | — | 0.0035 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 59 | 8.49 | 13.54 | 14.74 | 17.22 | 1.20× | 1.09× | — | — | 475 / 21,228 / 850 | — | 0.002 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.60 | 0.60 | 0.60 | 0.60 | 0.96× | 0.96× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · UpToDate · contended | 23 | 16.72 | 32.20 | 35.33 | 46.06 | 1.28× | 1.10× | — | — | 80 / 13,278 / 769 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · uncontended | 7 | 8.49 | 9.41 | 9.41 | 23.19 | 1.01× | 0.70× | — | — | 80 / 12,932 / 790 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 14 | 33.07 | 161.00 | 161.00 | 193.92 | 0.82× | 1.89× | — | — | 835 / 32,982 / 744 | — | 33.073 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 3 | 14.25 | 14.25 | 14.25 | 15.09 | 1.18× | 1.18× | — | — | 263 / 17,604 / 790 | — | 14.251 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 213.39 | 213.39 | 213.39 | 213.39 | 3.27× | 3.27× | — | — | 4,868 / 67,941 / 782 | — | 213.394 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · contended | 1 | 8.67 | 8.67 | 8.67 | 8.67 | no baseline | no baseline | — | — | 41 / 11,742 / 754 | — | 8.671 ms per file | observe.after |
| sandbox.commit | 2–4 files · Committed · contended | 10 | 19.92 | 32.48 | 32.48 | 50.20 | 0.43× | 0.37× | — | — | 319 / 18,436 / 779 | — | 9.9585 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 1 | 11.51 | 11.51 | 11.51 | 11.51 | 0.75× | 0.75× | — | — | 202 / 16,636 / 790 | — | 3.8373 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 21.35 | 21.35 | 21.35 | 21.35 | 0.77× | 0.77× | — | — | 738 / 28,891 / 744 | — | 4.2704 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 20.18 | 20.18 | 20.18 | 39.69 | no baseline | no baseline | — | — | 641 / 27,086 / 788 | — | 2.018 ms per file | commit |
| sandbox.exec | 1 files · contended | 58 | 43.71 | 123.79 | 190.11 | 279.41 | 1.01× | 1.87× | — | — | 0 / 0 / 0 | 5.70 | 43.711 ms per file | observe.after |
| sandbox.exec | 1 files · uncontended | 8 | 37.95 | 51.77 | 51.77 | 130.84 | 0.98× | 1.03× | — | — | 0 / 0 / 0 | 4.30 | 37.945 ms per file | observe.after |
| sandbox.exec | 17–64 files · contended | 6 | 100.24 | 213.12 | 213.12 | 317.83 | 1.10× | 2.06× | — | — | 0 / 0 / 0 | 93 | 5.5688 ms per file | observe.after |
| sandbox.exec | 2–4 files · contended | 46 | 47.46 | 85.36 | 120.19 | 184.96 | 1.01× | 1.06× | — | — | 0 / 0 / 0 | 9 | 22.137 ms per file | observe.after |
| sandbox.exec | 2–4 files · uncontended | 4 | 44.32 | 45.07 | 45.07 | 73.17 | 1.00× | 0.62× | — | — | 0 / 0 / 0 | 10.30 | 14.774 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 23 | 84.46 | 175.35 | 195.28 | 231.28 | 1.18× | 1.77× | — | — | 0 / 0 / 0 | 43 | 9.8076 ms per file | observe.after |
| sandbox.exec | 5–16 files · uncontended | 3 | 46.99 | 46.99 | 46.99 | 123.06 | 0.67× | 0.67× | — | — | 0 / 0 / 0 | 28.60 | 4.6986 ms per file | observe.after |
| sandbox.exec | — · uncontended | 2 | 357.38 | 357.38 | 357.38 | 560.96 | 1.07× | 1.07× | — | — | 0 / 0 / 0 | 1,187 | — | observe.after |
| sandbox.mount | — · contended | 54 | 12.18 | 65.64 | 137.44 | 143.88 | 0.94× | 1.25× | — | — | 57 / 1,205 / 60 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 11 | 9.05 | 10.84 | 10.84 | 24.59 | 0.90× | 0.82× | — | — | 57 / 1,205 / 60 | — | — | observe.after |
| sandbox.unmount | — · contended | 51 | 7.89 | 66.63 | 75.61 | 136.43 | 0.94× | 5.26× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 14 | 6.55 | 15.31 | 15.31 | 42.93 | 0.86× | 1.58× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 73.4 KiB | 311 | ok 3 |
| branch.fork | branch | 10 | 0.0 KiB | 0.0 KiB | 0 | Forked 10 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.7 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 55 | 361.1 KiB | 0.0 KiB | 57 | Committed 55 |
| fs.diff_files | fs | 39 | 0.0 KiB | 387.6 KiB | 31 | Text 31, NoSuchPath 8 |
| fs.glob | fs | 43 | 0.0 KiB | 26.4 KiB | 421 | ok 43 |
| fs.grep | fs | 42 | 0.0 KiB | 132.3 KiB | 493 | ok 42 |
| fs.list | fs | 45 | 0.0 KiB | 56.8 KiB | 497 | ok 45 |
| fs.read | fs | 43 | 0.0 KiB | 216.0 KiB | 43 | ok 43 |
| fs.rm | fs | 32 | 0.0 KiB | 0.0 KiB | 32 | Committed 32 |
| fs.stat | fs | 43 | 0.0 KiB | 9.1 KiB | 43 | ok 43 |
| fs.write | fs | 622 | 12.4 MiB | 0.0 KiB | 622 | Committed 620, UpToDate 2 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 64 | 0.0 KiB | 0.0 KiB | 0 | Committed 32, UpToDate 31, Conflict 1 |
| sandbox.exec | sandbox | 152 | 1.4 MiB | 46.1 KiB | 0 | exit:0 152 |
| sandbox.mount | sandbox | 67 | 0.0 KiB | 0.0 KiB | 0 | Mounted 67 |
| sandbox.unmount | sandbox | 67 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 67 |

### C. Scale probes

Binary: daemon `6d467539f759`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 2.368 | statements 78, vm_steps 3173, fullscan_steps 0, sorts 0, returned_rows 332 |
| read | 1.924 | statements 81, vm_steps 3191, fullscan_steps 0, sorts 0, returned_rows 333 |
| list_small | 1.904 | statements 102, vm_steps 4215, fullscan_steps 0, sorts 0, returned_rows 442 |
| list_largest | 4.853 | statements 246, vm_steps 13783, fullscan_steps 0, sorts 0, returned_rows 1295 |
| grep_scoped | 2.411 | statements 117, vm_steps 4305, fullscan_steps 0, sorts 0, returned_rows 447 |
| glob_scoped | 2.438 | statements 102, vm_steps 4215, fullscan_steps 0, sorts 0, returned_rows 442 |
| grep_tree | 388.197 | statements 38394, vm_steps 693634, fullscan_steps 0, sorts 0, returned_rows 56765 |
| glob_tree | 11.666 | statements 732, vm_steps 40396, fullscan_steps 0, sorts 0, returned_rows 3801 |
| diff_files | 2.993 | statements 162, vm_steps 6376, fullscan_steps 0, sorts 0, returned_rows 666 |
| list_commits | 2.445 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 1.957 | statements 96, vm_steps 2618, fullscan_steps 0, sorts 0, returned_rows 268 |
| fork | 0.477 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 37.742 | statements 965, vm_steps 65727, fullscan_steps 2502, sorts 7, returned_rows 4786 |
| oneshot_mount_exec | 66.816 | statements 50, vm_steps 1134, fullscan_steps 60, sorts 2, returned_rows 126 |
| oneshot_commit | 72.465 | statements 319, vm_steps 22463, fullscan_steps 854, sorts 3, returned_rows 1658 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 15.6 s** (tooling): play 11.1 · consolidate 1.6 · verify 1.1 · probes 0.7 · tests 0.0 · seal + snapshot 0.0 · report 1.1

15.60 s tooling: prepare 2.13 · play 9 · consolidate 1.63 · verify 0.51 (diff_commits) · version walk 0.58 · probes 0.64 · metrics 0.83 · Store allocation 0.27

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 6d467539f7590c6125c9000e8ef7ee5518f0e893aa1ae30c7e5851fc67759026 | 2026-10-18T02:59:12.972Z | watch | Speed: not judged: fs.glob >64 files · uncontended: baseline class has 0/2/2 calls (minimum 5 per range); 4.08× it; Scaling: insufficient same-binary points: 2 of 3 (daemon 6d467539f759); Counters: insufficient same-binary points: 2 of 3 (daemon 6d467539f759); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Directory share: 0.553; Range growth: 4.8 MiB; median not judged: 1 of 3 earlier ranges |

### G. Evidence

- `~/lfs-history/metrics/range-012.a1.json`
- trace `~/lfs-history/runs/p2-main-d/trace/range-012.a1.jsonl` · runner log `~/lfs-history/runs/p2-main-d/play.log`
