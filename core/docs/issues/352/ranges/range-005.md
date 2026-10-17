# Range 005 · **watch** · attempt 1

**Matches git ✓** · daemon `361bb09e1d94` · image `d3773b4e` · plan v2 · forked from snapshot r004 (run p1-pilot-b)
dsh `dcf8e10e5`..`d24f3ffef` · **65 commits** (7 mainline, 58 side) · 2026-06-29 → 2026-07-03
Areas changed: `packages/core` 15% · `/` 13% · `packages/web` 11% · other 61%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **4.3 MiB** (prev —) | **16.1 MiB** (prev —) | **3.74×** (prev —) | **3.5 MiB** | **631** (total 4,128) | **19.0 s** tooling (total 1.8 min) |

**Checks:** 6 pass · 6 watch: Speed fs.read ≤8 KiB: 8.35× baseline (sdk.lines); Scaling insufficient same-binary points: 1 of 3 (daemon 361bb09e1d94); Counters insufficient same-binary points: 1 of 3 (daemon 361bb09e1d94); Directory share 0.552; Range growth 3.5 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 264 ms for 16.1 MiB new; size exponent not judged (1 snapshots)
**Moved most:** ▼ probe diff_commits −71% · ▼ probe read −38% · ▲ probe glob_tree +35%
**Budget:** 6 of 202 ranges · projected total 1.1 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **654 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,220 / 1,220 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,360 calls** · **191 steps** by **8 agents + lead** on **3 Branches + main** · **101 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +145 added · 489 modified · −21 deleted · 8.4 MiB written · fs 593 : Sandbox 62 (**10 : 1**, target ~9 : 1)
**Execs:** 181 (JS 62 · shell 119) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 856 | 597 | 259 | Committed 597 · Text 17 · NoSuchPath 25 |
| sandbox | 481 | 278 | 0 | commit 97 (Committed 37, UpToDate 59, Conflict 1) · exec 181 (exit:0 181) · mount 101 (Mounted 101) · service 1 (Ready 1) · unmount 101 (Unmounted 101) |
| branch | 19 | 16 | 3 | diff_commits 3 · fork 11 (Forked 11) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,360** | **891** | **266** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r005-1-packages-fs | a01 a02 | 56 | 203 | ✓ | — |
| r005-2-packages-web | a03 a04 a05 | 72 | 201 | ✓ | — |
| r005-3-packages-compact | a06 a07 a08 | 57 | 196 | ✓ | — |
| main | lead | 6 | 31 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r005-1, a02 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r005-1, a01 a02 | merged cleanly |
| Decoy edit | 1 / 1 | r005-1, a02 a01 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r005-1 | 16 | 6 | 10 | 0 | 0 | 11 | commit-conflict, stale-clean-merge, decoy |
| a02 | r005-1 | 40 | 15 | 25 | 0 | 0 | 192 | commit-conflict, stale-clean-merge, decoy |
| a03 | r005-2 | 16 | 7 | 9 | 0 | 0 | 21 | — |
| a04 | r005-2 | 28 | 16 | 12 | 0 | 0 | 138 | — |
| a05 | r005-2 | 28 | 13 | 15 | 0 | 0 | 42 | — |
| a06 | r005-3 | 23 | 14 | 9 | 0 | 0 | 80 | — |
| a07 | r005-3 | 25 | 12 | 13 | 0 | 0 | 102 | — |
| a08 | r005-3 | 9 | 3 | 6 | 0 | 0 | 14 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 31 | — |
| **Total** |  | **191** | **87** | **99** | **5** | **0** | **631** | **3** |

## 3. Storage

|  | Previous (r004) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | — | 4.3 MiB (4.3 MiB / 0.0 KiB / 0.0 KiB) | — |
| Files / directories / symlinks | — | 648 / 221 / 6 | — |
| Largest file / largest directory | — | 185.7 KiB (`pnpm-lock.yaml`) / 27 entries (`.`) | — |
| **Store on disk** (allocated, sealed) | — | 16.1 MiB | — |
| **Space amplification** | — | 3.74× | — |
| Content amplification | — | 2.14× | — |
| Compression | 6.82× | 6.95× | — |
| Metadata share | — | 0.73 | this range 0.55 |
| **Stored per byte changed** | — | **1.89 bytes** | 0.84× the median range |
| History: Commits / Layers / Branches | 3,497 | 4,128 / 6 / 19 | +631 |
| Projection at range 202 / disk budget | — | 49.26 GiB / 41% | — |
| Snapshot | — | r005, 16.1 MiB new blocks | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 3,435 | +617 | 9.3 KiB | 0 (derived) | 87% |
| Chunks (large files) | 4,310 | +684 | 0.5 KiB | — | 4% |
| Large-file extents | 4,227 | — | 0.1 KiB | — | — |
| Directories | 1,826 | 703 (with inodes, pooled) | 0.2 KiB | — | 88% |
| Inodes and attributes | 22,485 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.4% at depth cap · 24% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.6 MiB · metadata 1.9 MiB · tracked 1.9 MiB changed in git

## 4. Speed

Daemon `361bb09e1d94` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 19.3 ms / 36.4 ms (2.12×) | 14.6 ms / 40.6 ms (3.80×) | 12.9 ms / 27.1 ms (2.98×) | 11.5 ms / 39.3 ms | 12.3 ms / 21.4 ms (1.18×) | 57.1 ms / 57.1 ms | — (native comparison in P3; exec 43.3 ms / 83.8 ms) |
| SQL p50: 443 stmts | 150 stmts | 225 stmts | 107 stmts | 64 stmts | 4,465 stmts | — |

**Commit cost:** 14.38 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 119 ms p50 over 101
**Slowest:** sandbox.exec 615 ms · sandbox.exec 348 ms · sandbox.exec 266 ms · checkpoint diff_commits 0.10 ms and 7.32 statements per entry (253 entries in 2 pages)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 406 MB over 9 of 9 Sandboxes · 127 open files · WAL before seal 4.0 MiB

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

### Lead's note (written by the lead; never empty unless the verdict is pass)

- First P2 range on the main line `p2-main` (fork of p1-pilot-b range 4, daemon `361bb09e`, addon `3da0f665`): 9 agents' steps played, 3/3 planned conflicts hit and resolved, checkpoint and full tree match git.
- Watch: `fs.read` ≤8 KiB at 8.35× the `361bb09e` baseline (slow phase `sdk.lines`). The baseline is P1's one-agent, fs-only play; P2 runs agents concurrently, so part of it may be contention. Not yet rising for 3 ranges; the fixer reads it with the next finding (LESSONS S1).
- Scaling and counters not judged (1 of 3 same-binary points); directory share 0.55.
- Process: STATS.md first committed with this range (backfilled 000–004).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1220/1220; conflicts 3/3; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.read ≤8 KiB: 8.35× baseline (sdk.lines) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 361bb09e1d94) | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 361bb09e1d94) | < 0.05 | watch |
| Directory share | 0.552 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.0339 (budget 0.2442) | < 0.1 | pass |
| Range growth | 3.5 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 264 ms for 16.1 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.16 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 191 | 192 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 631 | 633 |
| Workspaces (one-shot share) | 101 (0.98) | 98 (0.98) |
| Reads | 253 | 253 |
| Reconcile writes | 29 | 29 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `361bb09e1d94` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | 5–16 entries | 1 | 5.72 | 5.72 | 5.72 | 5.72 | no baseline | no baseline | — | — | 99 / 5,050 / 0 | — | 0.8173 ms per entrie | — |
| branch.diff_commits | >64 entries | 1 | 19.77 | 19.77 | 19.77 | 19.77 | 1.88× | 1.88× | — | — | 1,752 / 26,285 / 0 | — | 0.0804 ms per entrie | — |
| branch.fork | — | 7 | 2.26 | 2.73 | 2.73 | 4.13 | 0.89× | 0.85× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries | 1 | 4.04 | 4.04 | 4.04 | 4.04 | no baseline | no baseline | — | — | 436 / 10,998 / 0 | — | 0.0985 ms per entrie | — |
| branch.merge | >64 entries | 2 | 57.13 | 57.13 | 57.13 | 162.10 | no baseline | no baseline | — | — | 4,465 / 83,967 / 464 | — | 0.7231 ms per entrie | branch.merge |
| branch.publish | — | 1 | 7.71 | 7.71 | 7.71 | 7.71 | 1.20× | 1.20× | — | — | 648 / 16,829 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 11 | 29.68 | 33.41 | 33.41 | 59.52 | 3.26× | 3.50× | — | — | 461 / 18,948 / 520 | — | 0.1153 ms per byte | commit |
| fs.apply | ≤512 KiB | 1 | 10.09 | 10.09 | 10.09 | 10.09 | 1.02× | 1.02× | — | — | 268 / 12,563 / 448 | — | 0.0001 ms per byte | commit |
| fs.apply | ≤64 KiB | 10 | 20.04 | 24.91 | 24.91 | 30.02 | 2.05× | 2.17× | — | — | 364 / 15,393 / 461 | — | 0.0018 ms per byte | commit |
| fs.apply | ≤8 KiB | 27 | 17.91 | 31.61 | 34.72 | 35.08 | 1.95× | 2.73× | — | — | 346 / 15,289 / 486 | — | 0.0058 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 26 | 14.19 | 23.69 | 25.53 | 29.01 | 2.88× | 3.71× | — | — | 213 / 7,487 / 0 | — | 0.0567 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 6 | 13.87 | 22.05 | 22.05 | 24.76 | 2.11× | 2.90× | — | — | 231 / 8,786 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 9 | 14.00 | 29.26 | 29.26 | 32.45 | 2.78× | 4.95× | — | — | 228 / 8,349 / 0 | — | 0.0019 ms per byte | sdk.read |
| fs.glob | 1 files | 4 | 19.43 | 27.17 | 27.17 | 28.16 | 5.16× | 6.72× | — | — | 102 / 4,104 / 0 | — | 19.433 ms per file | — |
| fs.glob | 17–64 files | 5 | 13.33 | 16.70 | 16.70 | 16.89 | 2.32× | 2.87× | — | — | 312 / 15,047 / 0 | — | 0.5333 ms per file | — |
| fs.glob | 2–4 files | 11 | 13.00 | 23.89 | 23.89 | 26.33 | 3.53× | 5.71× | — | — | 150 / 5,854 / 0 | — | 4.3343 ms per file | — |
| fs.glob | 5–16 files | 12 | 6.96 | 24.52 | 24.52 | 28.35 | 1.70× | 5.06× | — | — | 147 / 6,267 / 0 | — | 0.9762 ms per file | — |
| fs.glob | >64 files | 7 | 20.02 | 25.68 | 25.68 | 30.92 | 2.04× | 1.29× | — | — | 348 / 14,655 / 0 | — | 0.0775 ms per file | — |
| fs.grep | 1 files | 4 | 15.03 | 23.52 | 23.52 | 23.89 | 3.63× | 5.62× | — | — | 168 / 4,831 / 0 | — | 15.033 ms per file | sdk.lines |
| fs.grep | 17–64 files | 1 | 5.08 | 5.08 | 5.08 | 5.08 | 0.53× | 0.49× | — | — | 273 / 7,050 / 0 | — | 0.1541 ms per file | sdk.lines |
| fs.grep | 2–4 files | 9 | 6.20 | 23.46 | 23.46 | 52.15 | 1.45× | 4.08× | — | — | 147 / 6,177 / 0 | — | 3.1005 ms per file | sdk.lines |
| fs.grep | 5–16 files | 16 | 16.07 | 30.88 | 30.88 | 37.70 | 3.11× | 5.09× | — | — | 261 / 7,242 / 0 | — | 1.8864 ms per file | sdk.lines |
| fs.grep | >64 files | 12 | 19.81 | 30.84 | 30.84 | 31.06 | 1.79× | 2.34× | — | — | 507 / 12,692 / 0 | — | 0.0583 ms per file | sdk.lines |
| fs.list | 1 entries | 2 | 12.91 | 12.91 | 12.91 | 14.61 | 3.38× | 3.38× | — | — | 123 / 4,579 / 0 | — | 12.913 ms per entrie | — |
| fs.list | 17–64 entries | 2 | 11.78 | 11.78 | 11.78 | 23.05 | 1.25× | 1.18× | — | — | 669 / 29,127 / 0 | — | 0.4208 ms per entrie | — |
| fs.list | 2–4 entries | 13 | 7.54 | 26.51 | 26.51 | 58.25 | 1.98× | 5.08× | — | — | 186 / 7,145 / 0 | — | 3.2305 ms per entrie | — |
| fs.list | 5–16 entries | 20 | 14.47 | 27.11 | 27.11 | 103.09 | 2.98× | 4.42× | — | — | 249 / 9,961 / 0 | — | 1.8407 ms per entrie | — |
| fs.read | ≤64 KiB | 3 | 4.84 | 4.84 | 4.84 | 12.41 | 1.08× | 1.08× | — | — | 195 / 5,266 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 43 | 14.83 | 40.65 | 65.47 | 75.71 | 3.80× | 8.35× | — | — | 150 / 4,766 / 0 | — | 0.0047 ms per byte | sdk.lines |
| fs.rm | 1 files | 20 | 19.35 | 32.87 | 32.87 | 33.41 | 2.20× | 2.98× | — | — | 433 / 16,251 / 500 | — | 19.351 ms per file | commit |
| fs.stat | ≤1 KiB | 5 | 11.62 | 15.43 | 15.43 | 23.60 | 3.40× | 3.79× | — | — | 105 / 4,464 / 0 | — | 0.0303 ms per byte | — |
| fs.stat | ≤512 KiB | 1 | 16.97 | 16.97 | 16.97 | 16.97 | 5.30× | 5.30× | — | — | 114 / 5,957 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB | 17 | 14.26 | 24.84 | 24.84 | 25.47 | 4.03× | 5.91× | — | — | 138 / 4,872 / 0 | — | 0.0008 ms per byte | — |
| fs.stat | ≤8 KiB | 17 | 11.45 | 26.49 | 26.49 | 27.14 | 3.18× | 6.56× | — | — | 135 / 5,341 / 0 | — | 0.0026 ms per byte | — |
| fs.write | ≤1 KiB | 47 | 14.72 | 29.11 | 51.31 | 54.38 | 1.85× | 2.92× | — | — | 330 / 14,531 / 494 | — | 0.0262 ms per byte | commit |
| fs.write | ≤512 KiB | 20 | 18.95 | 29.11 | 29.11 | 31.52 | 1.42× | 2.17× | — | — | 430 / 15,934 / 477 | — | 0.0002 ms per byte | commit |
| fs.write | ≤64 KiB | 207 | 21.34 | 36.35 | 63.43 | 124.95 | 2.18× | 2.83× | — | — | 508 / 16,774 / 481 | — | 0.0011 ms per byte | commit |
| fs.write | ≤8 KiB | 250 | 18.53 | 39.95 | 62.10 | 74.17 | 2.12× | 3.78× | — | — | 421 / 15,472 / 480 | — | 0.0047 ms per byte | commit |
| operator.store.stats | — | 1 | 2.33 | 2.33 | 2.33 | 2.33 | 1.06× | 1.06× | — | — | — | — | — | — |
| sandbox.commit | 0 files | 59 | 8.68 | 26.05 | 33.01 | 39.16 | no baseline | no baseline | — | — | 74 / 7,822 / 415 | — | — | commit |
| sandbox.commit | 1 files | 24 | 20.37 | 48.34 | 57.61 | 60.33 | 1.81× | 4.30× | — | — | 502 / 20,181 / 420 | — | 20.367 ms per file | commit |
| sandbox.commit | 2–4 files | 11 | 15.45 | 53.36 | 53.36 | 68.44 | no baseline | no baseline | — | — | 295 / 13,872 / 421 | — | 6.795 ms per file | commit |
| sandbox.commit | 5–16 files | 2 | 13.96 | 13.96 | 13.96 | 24.80 | no baseline | no baseline | — | — | 289 / 14,226 / 415 | — | 2.3258 ms per file | commit |
| sandbox.exec | 1 files | 88 | 39.25 | 65.02 | 76.70 | 105.80 | 0.88× | 1.41× | — | — | 0 / 0 / 0 | 4.30 | 39.246 ms per file | — |
| sandbox.exec | 17–64 files | 4 | 74.66 | 86.54 | 86.54 | 93.97 | no baseline | no baseline | — | — | 0 / 0 / 0 | 94 | 3.7331 ms per file | — |
| sandbox.exec | 2–4 files | 56 | 44.86 | 72.89 | 76.61 | 102.28 | no baseline | no baseline | — | — | 0 / 0 / 0 | 10.30 | 20.029 ms per file | — |
| sandbox.exec | 5–16 files | 28 | 68.53 | 83.78 | 84.70 | 87.94 | no baseline | no baseline | — | — | 0 / 0 / 0 | 33 | 7.0581 ms per file | — |
| sandbox.exec | — | 3 | 347.71 | 347.71 | 347.71 | 614.94 | 1.21× | 1.21× | — | — | 0 / 0 / 0 | 1,764 | — | — |
| sandbox.mount | — | 99 | 12.27 | 21.41 | 27.89 | 33.41 | 1.18× | 2.04× | — | — | 64 / 1,619 / 60 | — | — | sandbox.mount.attach |
| sandbox.service | — | 1 | 249.03 | 249.03 | 249.03 | 249.03 | 1.03× | 1.03× | — | — | — | — | — | — |
| sandbox.unmount | — | 99 | 7.38 | 17.97 | 57.37 | 80.82 | 1.07× | 2.43× | — | — | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 56.8 KiB | 254 | ok 3 |
| branch.fork | branch | 11 | 0.0 KiB | 0.0 KiB | 0 | Forked 11 |
| branch.list_commits | project | 3 | 0.0 KiB | 12.9 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 53 | 311.9 KiB | 0.0 KiB | 55 | Committed 53 |
| fs.diff_files | fs | 42 | 0.0 KiB | 224.9 KiB | 17 | Text 17, NoSuchPath 25 |
| fs.glob | fs | 41 | 0.0 KiB | 21.9 KiB | 301 | ok 41 |
| fs.grep | fs | 44 | 0.0 KiB | 152.8 KiB | 621 | ok 44 |
| fs.list | fs | 41 | 0.0 KiB | 33.4 KiB | 289 | ok 41 |
| fs.read | fs | 47 | 0.0 KiB | 163.6 KiB | 47 | ok 47 |
| fs.rm | fs | 20 | 0.0 KiB | 0.0 KiB | 20 | Committed 20 |
| fs.stat | fs | 44 | 0.0 KiB | 9.5 KiB | 44 | ok 44 |
| fs.write | fs | 524 | 7.5 MiB | 0.0 KiB | 524 | Committed 524 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 97 | 0.0 KiB | 0.0 KiB | 0 | Committed 37, UpToDate 59, Conflict 1 |
| sandbox.exec | sandbox | 181 | 974.0 KiB | 102.6 KiB | 0 | exit:0 181 |
| sandbox.mount | sandbox | 101 | 0.0 KiB | 0.0 KiB | 0 | Mounted 101 |
| sandbox.service | sandbox | 1 | 0.0 KiB | 0.0 KiB | 0 | Ready 1 |
| sandbox.unmount | sandbox | 101 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 101 |

### C. Scale probes

Binary: daemon `361bb09e1d94`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 3.207 | statements 42, vm_steps 2789, fullscan_steps 0, sorts 0, returned_rows 308 |
| read | 2.785 | statements 45, vm_steps 2807, fullscan_steps 0, sorts 0, returned_rows 309 |
| list_small | 3.347 | statements 90, vm_steps 7287, fullscan_steps 0, sorts 0, returned_rows 814 |
| list_largest | 8.932 | statements 474, vm_steps 26037, fullscan_steps 0, sorts 0, returned_rows 2575 |
| grep_scoped | 3.424 | statements 69, vm_steps 3793, fullscan_steps 0, sorts 0, returned_rows 415 |
| glob_scoped | 3.121 | statements 54, vm_steps 3703, fullscan_steps 0, sorts 0, returned_rows 410 |
| grep_tree | 178.702 | statements 18672, vm_steps 328856, fullscan_steps 0, sorts 0, returned_rows 29793 |
| glob_tree | 15.014 | statements 819, vm_steps 35999, fullscan_steps 0, sorts 0, returned_rows 3562 |
| diff_files | 5.345 | statements 90, vm_steps 5608, fullscan_steps 0, sorts 0, returned_rows 618 |
| list_commits | 3.602 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 3.905 | statements 72, vm_steps 2398, fullscan_steps 0, sorts 0, returned_rows 290 |
| fork | 2.978 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 33.008 | statements 803, vm_steps 48236, fullscan_steps 1518, sorts 7, returned_rows 3780 |
| oneshot_mount_exec | 63.865 | statements 57, vm_steps 1668, fullscan_steps 60, sorts 2, returned_rows 168 |
| oneshot_commit | 70.808 | statements 239, vm_steps 17040, fullscan_steps 526, sorts 3, returned_rows 1369 |

### D. Storage internals

From the sealed file at snapshot r005: 4,121 pages of 4,096 B, 0 free · Commits 4,146 · Branches 41 · Layers 7.

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 3,435 | 31.2 MiB |
| 2 | 4,310 | 2.1 MiB |
| 3 | 4,227 | 357.9 KiB |
| 5 | 4,227 | 437.6 KiB |
| 6 | 4,710 | 27.0 MiB |
| 7 | 1,826 | 369.2 KiB |
| 9 | 4,093 | 1.5 MiB |
| 10 | 4,164 | 524.6 KiB |
| 11 | 5,291 | 738.9 KiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 4,149 | 4.9 MiB |
| 1 | 7,538 | 4.3 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 2,953 | 11.5 MiB | 1.7 MiB |
| object_location | 485 | 1.9 MiB | 212.4 KiB |
| commit | 308 | 1.2 MiB | 209.6 KiB |
| inode_value | 253 | 1012.0 KiB | 18.3 KiB |
| commit_identity | 61 | 244.0 KiB | 16.6 KiB |
| binding_hint | 12 | 48.0 KiB | 8.8 KiB |
| content_signature | 10 | 40.0 KiB | 5.4 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch | 3 | 12.0 KiB | 6.2 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 3.5 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 3.5 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |
| layer_stack | 1 | 4.0 KiB | 3.9 KiB |
| layer_identity | 1 | 4.0 KiB | 3.6 KiB |

### E. Stage times

**Time 19.0 s** (tooling): play 10.8 · consolidate 0.6 · verify 1.4 · probes 0.4 · tests 0.0 · seal + snapshot 5.2 · report 0.6

19.02 s tooling: prepare 2.27 · play 8.58 · consolidate 0.57 · verify 1.01 (diff_commits + full compareTree) · version walk 0.37 · probes 0.45 · metrics 0.22 · seal 4.62 · sealed figures 0.23 · snapshot copy 0.32 · report 0.13

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 361bb09e1d9465ab47e93d1ae98226e62018aad71340140500bbcebb1fde41f4 | 2026-10-17T23:16:50.546Z | watch | Speed: fs.read ≤8 KiB: 8.35× baseline (sdk.lines); Scaling: insufficient same-binary points: 1 of 3 (daemon 361bb09e1d94); Counters: insufficient same-binary points: 1 of 3 (daemon 361bb09e1d94); Directory share: 0.552; Range growth: 3.5 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 264 ms for 16.1 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-005.a1.json`
- trace `~/lfs-history/runs/p2-main/trace/range-005.a1.jsonl` · runner log `~/lfs-history/runs/p2-main/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-005.json`
