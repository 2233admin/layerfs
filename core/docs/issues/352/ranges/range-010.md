# Range 010 · **watch** · attempt 1

**Matches git ✓** · daemon `58a60046739f` · image `d3773b4e` · plan v2 · continued from r009 (live Store)
dsh `671cbe173`..`63d890ab9` · **61 commits** (13 mainline, 48 side) · 2026-07-06 → 2026-07-09
Areas changed: `/` 16% · `docs/rfc` 12% · `scripts` 10% · other 62%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **6.7 MiB** (+469.0 KiB) | **31.8 MiB** (+5.9 MiB) live | **4.76×** (prev 4.16×) | **2.7 MiB** | **438** (total 6,823) | **16.6 s** tooling (total 3.3 min) |

**Checks:** 7 pass · 5 watch: Speed branch.merge 17–64 entries: 64.69× baseline (branch.merge); Scaling insufficient same-binary points: 2 of 3 (daemon 58a60046739f); Counters insufficient same-binary points: 2 of 3 (daemon 58a60046739f); Directory share 0.567; Range growth 2.7 MiB; median not judged: 1 of 3 earlier ranges
**Moved most:** ▼ probe list_commits −46% · ▲ sandbox.mount p95 +34% · ▼ fs.list p95 −32%
**Budget:** 11 of 202 ranges · projected total 1.0 h (budget 6.7 h) · disk 40% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **203 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 876 / 876 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**986 calls** · **144 steps** by **8 agents + lead** on **3 Branches + main** · **72 Workspaces** (97% one-shot, 0 open at end)
**File changes:** +104 added · 340 modified · −8 deleted · 6.5 MiB written · fs 411 : Sandbox 41 (**10 : 1**, target ~9 : 1)
**Execs:** 132 (JS 44 · shell 88) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 618 | 415 | 203 | Committed 415 · Text 19 · NoSuchPath 11 |
| sandbox | 346 | 201 | 0 | commit 69 (Committed 26, UpToDate 42, Conflict 1) · exec 132 (exit:0 132) · mount 72 (Mounted 72) · service 1 (Ready 1) · unmount 72 (Unmounted 72) |
| branch | 18 | 15 | 3 | diff_commits 3 · fork 10 (Forked 10) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **986** | **631** | **210** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r010-1-packages-support | a01 a02 | 35 | 131 | ✓ | — |
| r010-2-docs-rfc | a03 a04 a05 | 63 | 138 | ✓ | — |
| r010-3-packages-subagent | a06 a07 a08 | 40 | 133 | ✓ | — |
| main | lead | 6 | 36 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r010-2, a03 after a04 | 0.1 s |
| Stale clean merge | 1 / 1 | r010-2, a03 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r010-2, a05 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r010-1 | 18 | 10 | 8 | 0 | 0 | 77 | — |
| a02 | r010-1 | 17 | 9 | 8 | 0 | 0 | 54 | — |
| a03 | r010-2 | 30 | 12 | 18 | 0 | 0 | 71 | commit-conflict, stale-clean-merge |
| a04 | r010-2 | 16 | 9 | 7 | 0 | 0 | 41 | commit-conflict, decoy |
| a05 | r010-2 | 17 | 8 | 9 | 0 | 0 | 26 | stale-clean-merge, decoy |
| a06 | r010-3 | 12 | 5 | 7 | 0 | 0 | 34 | — |
| a07 | r010-3 | 19 | 10 | 9 | 0 | 0 | 74 | — |
| a08 | r010-3 | 9 | 4 | 5 | 0 | 0 | 25 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 36 | — |
| **Total** |  | **144** | **68** | **71** | **5** | **0** | **438** | **3** |

## 3. Storage

|  | Previous (r009) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 6.2 MiB (6.2 MiB / 0.0 KiB / 0.0 KiB) | 6.7 MiB (6.7 MiB / 0.0 KiB / 0.0 KiB) | +469.0 KiB |
| Files / directories / symlinks | 854 / 268 / 6 | 950 / 304 / 6 | +96 / +36 / +0 |
| Largest file / largest directory | 226.5 KiB / 34 entries | 231.6 KiB (`pnpm-lock.yaml`) / 35 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, live: file + WAL) | 25.9 MiB | 31.8 MiB | +5.9 MiB |
| **Space amplification** | 4.16× | 4.76× | 0.60 |
| Content amplification | 2.40× | 2.41× | — |
| Compression | 7.50× | 7.50× | — |
| Metadata share | 0.74 | 0.65 | this range 0.57 |
| **Stored per byte changed** | — | **1.72 bytes** | 1.26× the median range |
| History: Commits / Layers / Branches | 6,385 | 6,823 / 9 / 49 | +438 |
| Projection at range 202 / disk budget | — | 48.03 GiB / 40% | — |
| Snapshot | — | none this range | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +1,064 | — | 0 (derived) | 86% |
| Chunks (large files) | — (at snapshots) | +1,264 | — | — | 8% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 1,494 (with inodes, pooled) | — | — | 89% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +0 | — | — | — |

Delta: 4.2% at depth cap · 25% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.2 MiB · metadata 1.5 MiB · tracked 1.6 MiB changed in git

## 4. Speed

Daemon `58a60046739f` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 24.4 ms / 292 ms (2.31×) | 4.9 ms / 8.4 ms (1.04×) | 6.8 ms / 13.4 ms (1.13×) | 13.8 ms / 159 ms (1.11×) | 12.3 ms / 157 ms (0.98×) | 227 ms / 227 ms (64.69×) | — (native comparison in P3; exec 41.6 ms / 88.4 ms) |
| SQL p50: 1,487 stmts | 231 stmts | 432 stmts | 179 stmts | 63 stmts | 5,809 stmts | — |

**Commit cost:** 41.44 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 154 ms p50 over 72
**Slowest:** sandbox.exec 502 ms · fs.write 490 ms (9,102 bytes) · fs.write 439 ms (4,819 bytes) · checkpoint diff_commits 0.08 ms and 6.74 statements per entry (245 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 561 MB (+47 MB) over 9 of 9 Sandboxes · 147 open files · WAL 4.0 MiB (live)

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

### Lead's note (written by the lead; never empty unless the verdict is pass)

- Concurrent load declared: F-020 build (fixer worktree), builder tooling and the one-time `pnpm fetch` (network and disk).
- Watch: `branch.merge` 17–64 entries at 64.69× the P2 baseline, but that baseline class is one call (3.51 ms); too thin to judge (F-024 opened: per-class sample counts). Scaling and counters need 3 same-binary points (2 now); directory share 0.57.
- Action: continue.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 876/876; conflicts 3/3; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.merge 17–64 entries: 64.69× baseline (branch.merge) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 58a60046739f) | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 58a60046739f) | < 0.05 | watch |
| Directory share | 0.567 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.0424 (budget 0.2487) | < 0.1 | pass |
| Range growth | 2.7 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.4 | < 0.8 | pass |
| Wall projection | 0.15 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 144 | 145 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 438 | 440 |
| Workspaces (one-shot share) | 72 (0.97) | 70 (0.971) |
| Reads | 190 | 190 |
| Reconcile writes | 34 | 34 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `58a60046739f` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | 5–16 entries | 1 | 6.23 | 6.23 | 6.23 | 6.23 | no baseline | no baseline | — | — | 273 / 9,900 / 0 | — | 0.6226 ms per entrie | — |
| branch.diff_commits | >64 entries | 1 | 23.11 | 23.11 | 23.11 | 23.11 | 2.45× | 2.45× | — | — | 2,079 / 35,743 / 0 | — | 0.0984 ms per entrie | — |
| branch.fork | — | 6 | 3.64 | 8.97 | 8.97 | 11.66 | 1.47× | 3.14× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries | 2 | 227.08 | 227.08 | 227.08 | 227.66 | 64.69× | 64.69× | — | — | 5,809 / 99,348 / 673 | — | 4.1287 ms per entrie | branch.merge |
| branch.merge | >64 entries | 1 | 3.83 | 3.83 | 3.83 | 3.83 | 0.03× | 0.03× | — | — | 292 / 7,254 / 0 | — | 0.0408 ms per entrie | — |
| branch.publish | — | 1 | 5.32 | 5.32 | 5.32 | 5.32 | 0.95× | 0.95× | — | — | 455 / 11,811 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 12 | 30.53 | 219.40 | 219.40 | 270.86 | 2.58× | 12.76× | — | — | 1,976 / 63,584 / 2,097 | — | 0.1884 ms per byte | commit |
| fs.apply | ≤64 KiB | 18 | 98.44 | 361.83 | 361.83 | 382.48 | 7.21× | 8.55× | — | — | 3,807 / 95,726 / 2,028 | — | 0.0069 ms per byte | commit |
| fs.apply | ≤8 KiB | 18 | 22.21 | 307.35 | 307.35 | 393.23 | 1.79× | 16.21× | — | — | 1,415 / 62,859 / 1,546 | — | 0.0169 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 12 | 6.92 | 11.32 | 11.32 | 47.79 | 1.16× | 1.20× | — | — | 345 / 12,085 / 0 | — | 0.0442 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 14 | 7.69 | 11.09 | 11.09 | 12.89 | 1.06× | 1.39× | — | — | 420 / 13,896 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 3 | 8.19 | 8.19 | 8.19 | 9.11 | 1.38× | 1.20× | — | — | 484 / 13,891 / 0 | — | 0.003 ms per byte | sdk.read |
| fs.glob | 17–64 files | 2 | 7.79 | 7.79 | 7.79 | 13.38 | 1.28× | 0.85× | — | — | 390 / 10,959 / 0 | — | 0.3117 ms per file | — |
| fs.glob | 2–4 files | 8 | 5.07 | 5.89 | 5.89 | 7.96 | 1.09× | 0.88× | — | — | 249 / 7,930 / 0 | — | 2.537 ms per file | — |
| fs.glob | 5–16 files | 9 | 4.97 | 5.73 | 5.73 | 5.91 | 1.02× | 0.65× | — | — | 204 / 8,028 / 0 | — | 0.7747 ms per file | — |
| fs.glob | >64 files | 14 | 11.88 | 64.72 | 64.72 | 148.99 | 1.21× | 3.54× | — | — | 633 / 30,777 / 0 | — | 0.066 ms per file | — |
| fs.grep | 1 files | 4 | 4.61 | 5.33 | 5.33 | 5.92 | 0.95× | 0.98× | — | — | 204 / 6,802 / 0 | — | 4.61 ms per file | sdk.lines |
| fs.grep | 17–64 files | 3 | 10.50 | 10.50 | 10.50 | 13.59 | 0.96× | 0.77× | — | — | 768 / 16,270 / 0 | — | 0.4119 ms per file | sdk.lines |
| fs.grep | 2–4 files | 5 | 6.21 | 6.59 | 6.59 | 9.40 | 1.11× | 0.83× | — | — | 273 / 8,236 / 0 | — | 2.7665 ms per file | sdk.lines |
| fs.grep | 5–16 files | 7 | 7.10 | 8.07 | 8.07 | 12.12 | 1.00× | 0.57× | — | — | 417 / 10,810 / 0 | — | 0.9337 ms per file | sdk.lines |
| fs.grep | >64 files | 13 | 10.41 | 80.53 | 80.53 | 123.65 | 0.82× | 4.46× | — | — | 899 / 22,428 / 60 | — | 0.0586 ms per file | sdk.lines |
| fs.list | 17–64 entries | 13 | 12.73 | 14.14 | 14.14 | 14.56 | 1.13× | 0.84× | — | — | 755 / 28,418 / 0 | — | 0.4522 ms per entrie | — |
| fs.list | 2–4 entries | 11 | 5.17 | 5.73 | 5.73 | 9.06 | 1.04× | 0.82× | — | — | 210 / 8,221 / 0 | — | 1.9365 ms per entrie | — |
| fs.list | 5–16 entries | 11 | 6.48 | 7.41 | 7.41 | 12.03 | 1.12× | 0.87× | — | — | 278 / 13,020 / 0 | — | 1.2031 ms per entrie | — |
| fs.read | ≤1 KiB | 2 | 4.21 | 4.21 | 4.21 | 5.61 | 1.00× | 0.95× | — | — | 300 / 8,436 / 0 | — | 0.0061 ms per byte | sdk.lines |
| fs.read | ≤64 KiB | 1 | 26.65 | 26.65 | 26.65 | 26.65 | 4.00× | 4.00× | — | — | 204 / 6,301 / 0 | — | 0.0021 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 29 | 4.91 | 6.93 | 8.45 | 13.37 | 1.04× | 1.04× | — | — | 231 / 5,930 / 0 | — | 0.0018 ms per byte | sdk.lines |
| fs.rm | 1 files | 8 | 68.21 | 212.32 | 212.32 | 322.15 | 5.70× | 11.21× | — | — | 3,430 / 113,548 / 1,458 | — | 68.212 ms per file | commit |
| fs.stat | ≤1 KiB | 2 | 4.12 | 4.12 | 4.12 | 5.88 | 0.77× | 0.70× | — | — | 129 / 3,818 / 0 | — | 0.0048 ms per byte | — |
| fs.stat | ≤64 KiB | 13 | 5.40 | 7.60 | 7.60 | 7.93 | 1.17× | 0.98× | — | — | 236 / 7,092 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤8 KiB | 13 | 4.24 | 6.89 | 6.89 | 11.90 | 0.88× | 1.14× | — | — | 147 / 6,784 / 0 | — | 0.0011 ms per byte | — |
| fs.write | ≤1 KiB | 50 | 18.45 | 242.29 | 287.65 | 304.17 | 1.69× | 6.70× | — | — | 1,215 / 55,532 / 1,418 | — | 0.1515 ms per byte | commit |
| fs.write | ≤512 KiB | 11 | 21.32 | 164.00 | 164.00 | 174.83 | 1.51× | 11.60× | — | — | 1,281 / 61,082 / 1,464 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB | 157 | 33.39 | 301.69 | 430.42 | 489.63 | 2.31× | 3.29× | — | — | 1,709 / 65,098 / 1,462 | — | 0.0025 ms per byte | commit |
| fs.write | ≤8 KiB | 137 | 19.00 | 291.77 | 355.86 | 438.81 | 1.47× | 3.68× | — | — | 1,310 / 52,019 / 1,458 | — | 0.0073 ms per byte | commit |
| operator.store.stats | — | 1 | 2.83 | 2.83 | 2.83 | 2.83 | 1.06× | 1.06× | — | — | — | — | — | — |
| sandbox.commit | 0 files | 42 | 11.43 | 130.65 | 146.81 | 159.01 | 1.11× | 3.16× | — | — | 89 / 11,614 / 655 | — | — | commit |
| sandbox.commit | 1 files | 18 | 13.37 | 242.53 | 242.53 | 259.75 | 0.28× | 2.92× | — | — | 341 / 16,624 / 655 | — | 13.365 ms per file | commit |
| sandbox.commit | 2–4 files | 8 | 43.75 | 131.41 | 131.41 | 174.49 | 1.48× | 1.37× | — | — | 784 / 31,104 / 648 | — | 21.358 ms per file | commit |
| sandbox.exec | 1 files | 67 | 38.17 | 61.87 | 71.25 | 73.72 | 1.04× | 0.92× | — | — | 0 / 0 / 0 | 5.30 | 38.166 ms per file | — |
| sandbox.exec | 17–64 files | 2 | 69.64 | 69.64 | 69.64 | 95.62 | 1.01× | 0.80× | — | — | 0 / 0 / 0 | 94 | 3.482 ms per file | — |
| sandbox.exec | 2–4 files | 45 | 47.29 | 85.75 | 119.55 | 120.99 | 1.21× | 1.17× | — | — | 0 / 0 / 0 | 12.40 | 16.4745 ms per file | — |
| sandbox.exec | 5–16 files | 14 | 74.76 | 88.40 | 88.40 | 126.54 | 1.19× | 1.05× | — | — | 0 / 0 / 0 | 31 | 11.3899 ms per file | — |
| sandbox.exec | — | 2 | 287.22 | 287.22 | 287.22 | 501.89 | 0.93× | 0.93× | — | — | 0 / 0 / 0 | 918 | — | — |
| sandbox.mount | — | 70 | 12.28 | 157.25 | 181.96 | 195.27 | 0.98× | 2.97× | — | — | 63 / 1,256 / 60 | — | — | sandbox.mount.attach |
| sandbox.service | — | 1 | 277.92 | 277.92 | 277.92 | 277.92 | 1.18× | 1.18× | — | — | — | — | — | — |
| sandbox.unmount | — | 70 | 6.19 | 10.85 | 36.07 | 42.57 | 0.98× | 1.02× | — | — | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 58.0 KiB | 246 | ok 3 |
| branch.fork | branch | 10 | 0.0 KiB | 0.0 KiB | 0 | Forked 10 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.0 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 52 | 329.1 KiB | 0.0 KiB | 54 | Committed 52 |
| fs.diff_files | fs | 30 | 0.0 KiB | 234.8 KiB | 19 | Text 19, NoSuchPath 11 |
| fs.glob | fs | 35 | 0.0 KiB | 22.4 KiB | 334 | ok 35 |
| fs.grep | fs | 34 | 0.0 KiB | 112.0 KiB | 454 | ok 34 |
| fs.list | fs | 39 | 0.0 KiB | 55.2 KiB | 481 | ok 39 |
| fs.read | fs | 33 | 0.0 KiB | 104.5 KiB | 33 | ok 33 |
| fs.rm | fs | 8 | 0.0 KiB | 0.0 KiB | 8 | Committed 8 |
| fs.stat | fs | 32 | 0.0 KiB | 6.9 KiB | 32 | ok 32 |
| fs.write | fs | 355 | 5.6 MiB | 0.0 KiB | 355 | Committed 355 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 69 | 0.0 KiB | 0.0 KiB | 0 | Committed 26, UpToDate 42, Conflict 1 |
| sandbox.exec | sandbox | 132 | 835.6 KiB | 37.0 KiB | 0 | exit:0 132 |
| sandbox.mount | sandbox | 72 | 0.0 KiB | 0.0 KiB | 0 | Mounted 72 |
| sandbox.service | sandbox | 1 | 0.0 KiB | 0.0 KiB | 0 | Ready 1 |
| sandbox.unmount | sandbox | 72 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 72 |

### C. Scale probes

Binary: daemon `58a60046739f`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 3.644 | statements 87, vm_steps 3317, fullscan_steps 0, sorts 0, returned_rows 338 |
| read | 3.225 | statements 90, vm_steps 3335, fullscan_steps 0, sorts 0, returned_rows 339 |
| list_small | 5.475 | statements 210, vm_steps 8695, fullscan_steps 0, sorts 0, returned_rows 894 |
| list_largest | 12.408 | statements 723, vm_steps 33201, fullscan_steps 0, sorts 0, returned_rows 3359 |
| grep_scoped | 4.688 | statements 129, vm_steps 4497, fullscan_steps 0, sorts 0, returned_rows 455 |
| glob_scoped | 4.02 | statements 114, vm_steps 4407, fullscan_steps 0, sorts 0, returned_rows 450 |
| grep_tree | 322.03 | statements 32223, vm_steps 562467, fullscan_steps 0, sorts 0, returned_rows 47180 |
| glob_tree | 16.823 | statements 945, vm_steps 40400, fullscan_steps 0, sorts 0, returned_rows 3863 |
| diff_files | 5.691 | statements 180, vm_steps 6664, fullscan_steps 0, sorts 0, returned_rows 678 |
| list_commits | 3.492 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 3.287 | statements 99, vm_steps 2770, fullscan_steps 0, sorts 0, returned_rows 322 |
| fork | 2.245 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 38.609 | statements 1049, vm_steps 61515, fullscan_steps 2145, sorts 7, returned_rows 4671 |
| oneshot_mount_exec | 50.442 | statements 125, vm_steps 2626, fullscan_steps 60, sorts 2, returned_rows 254 |
| oneshot_commit | 69.418 | statements 352, vm_steps 21128, fullscan_steps 735, sorts 3, returned_rows 1629 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 16.6 s** (tooling): play 13.5 · consolidate 0.9 · verify 0.9 · probes 0.6 · tests 0.0 · seal + snapshot 0.0 · report 0.7

16.58 s tooling: prepare 2.14 · play 11.34 · consolidate 0.86 · verify 0.38 (diff_commits) · version walk 0.52 · probes 0.60 · metrics 0.20 · Store allocation 0.25

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 58a60046739f3fb1e8c675274cf34afb1f867c08c5cf03db21eb35a2abb569b9 | 2026-10-18T00:26:11.401Z | watch | Speed: branch.merge 17–64 entries: 64.69× baseline (branch.merge); Scaling: insufficient same-binary points: 2 of 3 (daemon 58a60046739f); Counters: insufficient same-binary points: 2 of 3 (daemon 58a60046739f); Directory share: 0.567; Range growth: 2.7 MiB; median not judged: 1 of 3 earlier ranges |

### G. Evidence

- `~/lfs-history/metrics/range-010.a1.json`
- trace `~/lfs-history/runs/p2-main-c/trace/range-010.a1.jsonl` · runner log `~/lfs-history/runs/p2-main-c/play.log`
