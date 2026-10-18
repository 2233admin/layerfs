# Range 011 · **optimize** · attempt 1

**Matches git ✓** · daemon `58a60046739f` · image `d3773b4e` · plan v2 · continued from r010 (live Store)
dsh `08fc8467b`..`a5c972b7a` · **87 commits** (7 mainline, 80 side) · 2026-06-25 → 2026-07-10
Areas changed: `examples/acp-agent` 39% · `packages/core` 10% · `/` 7% · other 44%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **7.7 MiB** (+1.0 MiB) | **32.8 MiB** (+1004.0 KiB) | **4.25×** (prev 4.76×) | **6.4 MiB** | **960** (total 7,783) | **34.5 s** tooling (total 3.9 min) |

**Checks:** 6 pass · 4 watch: Speed fs.apply ≤8 KiB: 20.11× baseline (commit); Directory share 0.568; Range growth 6.4 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 412 ms for 32.8 MiB new; size exponent not judged (2 snapshots) · 2 optimize/stop: Scaling, Counters
**Moved most:** ▲ fs.read p95 +321% · ▲ metadata added +135% · ▲ stored added +135%
**Budget:** 12 of 202 ranges · projected total 1.2 h (budget 6.7 h) · disk 40% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,057 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 1 publish |
| Steps | 1,737 / 1,737 outcomes as planned |
| Conflicts | **2 / 2 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,896 calls** · **257 steps** by **10 agents + lead** on **4 Branches + main** · **121 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +146 added · 803 modified · −45 deleted · 15.5 MiB written · fs 911 : Sandbox 83 (**11 : 1**, target ~9 : 1)
**Execs:** 239 (JS 71 · shell 168) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,273 | 915 | 358 | Committed 914 · Text 34 · NoSuchPath 22 · UpToDate 1 |
| sandbox | 598 | 356 | 0 | commit 117 (Committed 48, UpToDate 68, Conflict 1) · exec 239 (exit:0 239) · mount 121 (Mounted 121) · unmount 121 (Unmounted 121) |
| branch | 21 | 18 | 3 | diff_commits 3 · fork 12 (Forked 12) · merge 5 (Merged 5) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,896** | **1,289** | **365** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r011-1-packages-workflow | a01 a02 | 52 | 199 | ✓ | — |
| r011-2-examples-acp-agent | a03 a04 a05 | 62 | 203 | ✓ | — |
| r011-3-packages-core | a06 a07 | 64 | 198 | ✓ | — |
| r011-4-packages-ui | a08 a09 a10 | 72 | 202 | ✓ | — |
| main | lead | 7 | 158 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r011-1, a02 after a01 | 0.1 s |
| Stale clean merge | 0 / 0 | — | — |
| Decoy edit | 1 / 1 | r011-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r011-1 | 43 | 23 | 20 | 0 | 0 | 183 | commit-conflict, decoy |
| a02 | r011-1 | 9 | 3 | 6 | 0 | 0 | 16 | commit-conflict, decoy |
| a03 | r011-2 | 19 | 10 | 9 | 0 | 0 | 122 | — |
| a04 | r011-2 | 9 | 3 | 6 | 0 | 0 | 8 | — |
| a05 | r011-2 | 34 | 20 | 14 | 0 | 0 | 73 | — |
| a06 | r011-3 | 31 | 18 | 13 | 0 | 0 | 114 | — |
| a07 | r011-3 | 33 | 17 | 16 | 0 | 0 | 84 | — |
| a08 | r011-4 | 17 | 8 | 9 | 0 | 0 | 81 | — |
| a09 | r011-4 | 19 | 9 | 10 | 0 | 0 | 47 | — |
| a10 | r011-4 | 36 | 21 | 15 | 0 | 0 | 74 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 158 | — |
| **Total** |  | **257** | **133** | **118** | **6** | **0** | **960** | **2** |

## 3. Storage

|  | Previous (r010) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 6.7 MiB (6.7 MiB / 0.0 KiB / 0.0 KiB) | 7.7 MiB (7.7 MiB / 0.0 KiB / 0.0 KiB) | +1.0 MiB |
| Files / directories / symlinks | 950 / 304 / 6 | 1,051 / 329 / 6 | +101 / +25 / +0 |
| Largest file / largest directory | 231.6 KiB / 35 entries | 238.1 KiB (`pnpm-lock.yaml`) / 38 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, sealed) | 31.8 MiB | 32.8 MiB | +1004.0 KiB |
| **Space amplification** | 4.76× | 4.25× | -0.50 |
| Content amplification | 2.41× | 2.45× | — |
| Compression | 7.50× | 7.56× | — |
| Metadata share | 0.65 | 0.74 | this range 0.57 |
| **Stored per byte changed** | — | **1.78 bytes** | 1.03× the median range |
| History: Commits / Layers / Branches | 6,823 | 7,783 / 10 / 66 | +960 |
| Projection at range 202 / disk budget | — | 47.78 GiB / 40% | — |
| Snapshot | — | r011, 32.8 MiB new blocks | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 6,945 | +2,572 | 11.1 KiB | 0 (derived) | 88% |
| Chunks (large files) | 8,271 | +2,947 | 0.6 KiB | — | 3% |
| Large-file extents | 8,084 | — | 0.1 KiB | — | — |
| Directories | 2,597 | 3,618 (with inodes, pooled) | 0.2 KiB | — | 87% |
| Inodes and attributes | 44,629 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.1% at depth cap · 27% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 2.8 MiB · metadata 3.6 MiB · tracked 3.6 MiB changed in git

## 4. Speed

Daemon `58a60046739f` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 29.1 ms / 328 ms (1.92×) | 6.7 ms / 35.6 ms (1.42×) | 9.2 ms / 20.8 ms (1.51×) | 19.7 ms / 190 ms (1.35×) | 17.9 ms / 142 ms (1.43×) | 278 ms / 365 ms (3.04×) | — (native comparison in P3; exec 47.1 ms / 161 ms) |
| SQL p50: 1,614 stmts | 301 stmts | 457 stmts | 167 stmts | 63 stmts | 7,341 stmts | — |

**Commit cost:** 42.09 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 207 ms p50 over 121
**Slowest:** sandbox.exec 1218 ms · sandbox.exec 611 ms · fs.apply 575 ms (3,118 bytes) · checkpoint diff_commits 0.09 ms and 7.30 statements per entry (335 entries per page)
**Scaling:** 8 of 15 probes flat · `stat` 0.64 · `read` 0.47 · `list_largest` 1.35 · `grep_tree` 1.37 · `diff_commits` 0.39 · `merge` 0.35 · `oneshot_commit` 0.47

**Health:** 0 Workspaces open · 0 overlay files left · daemons 699 MB (+138 MB) over 11 of 11 Sandboxes · 175 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 011.a1 · optimize

**1. Trigger** (attempt 1, daemon `58a60046739f`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | list_largest per entry of the largest directory: depth exponent 0.782 | < 0.15 |
| Counters | list_largest.statements per entry of the largest directory: depth exponent 1.834 | < 0.05 |

Diagnosis pending: `finding-011.a1.json`.

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

- Optimize: `list_largest` per entry of the largest directory rises with depth (time exponent 0.78, statements per entry 1.83) over ranges 9–11 on `58a60046`. SPEC §4: list may grow with that directory's entries only; this is per entry, so a finding. Possibly the largest directory's metadata chain (it is rewritten often); the fixer decides from counters. Snapshot taken at range 11.
- Also to the fixer in this cycle (S1): `fs.apply` ≤8 KiB at 20.11× the P2 baseline (commit phase). Concurrent load declared as for range 10.
- Action: fixer diagnoses 011.a1; recovery forks the range-11 snapshot? No: it continues at 12; range 10 has no snapshot, so recovery forks range 9 (p2-main-c), fast-forwards 10 and reruns 11 measured.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1737/1737; conflicts 2/2; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.apply ≤8 KiB: 20.11× baseline (commit) | ≤ 1.2× | watch |
| Scaling | list_largest per entry of the largest directory: depth exponent 0.782 | < 0.15 | optimize |
| Counters | list_largest.statements per entry of the largest directory: depth exponent 1.834 | < 0.05 | optimize |
| Directory share | 0.568 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.031 (budget 0.2719) | < 0.1 | pass |
| Range growth | 6.4 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 412 ms for 32.8 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.4 | < 0.8 | pass |
| Wall projection | 0.17 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 257 | 258 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 960 | 962 |
| Workspaces (one-shot share) | 121 (0.99) | 118 (0.992) |
| Reads | 357 | 357 |
| Reconcile writes | 155 | 155 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `58a60046739f` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries | 2 | 11.65 | 11.65 | 11.65 | 29.06 | 1.23× | 1.23× | -4.24 | -3.89 | 618 / 22,636 / 0 | — | 0.1165 ms per entrie | — |
| branch.fork | — | 8 | 3.20 | 6.38 | 6.38 | 8.38 | 1.29× | 2.24× | 1.16 | 1.47 | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries | 1 | 4.68 | 4.68 | 4.68 | 4.68 | 1.33× | 1.33× | -5.18 | -0.83 | 428 / 10,790 / 0 | — | 0.1201 ms per entrie | — |
| branch.merge | >64 entries | 3 | 364.94 | 364.94 | 364.94 | 372.42 | 3.04× | 3.04× | 7.73 | 2.83 | 8,048 / 145,613 / 733 | — | 4.9992 ms per entrie | branch.merge |
| branch.publish | — | 1 | 7.70 | 7.70 | 7.70 | 7.70 | 1.38× | 1.38× | 2.28 | 2.09 | 977 / 25,383 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 9 | 161.06 | 332.40 | 332.40 | 466.91 | 13.58× | 19.34× | 11.84 | 11.19 | 5,710 / 145,323 / 4,410 | — | 0.3609 ms per byte | commit |
| fs.apply | ≤64 KiB | 25 | 26.68 | 246.72 | 431.53 | 451.30 | 1.96× | 5.83× | 2.23 | 4.20 | 1,588 / 58,670 / 1,640 | — | 0.0021 ms per byte | commit |
| fs.apply | ≤8 KiB | 49 | 174.82 | 381.17 | 483.23 | 575.13 | 14.07× | 20.11× | 13.19 | 12.20 | 5,997 / 153,827 / 3,148 | — | 0.0465 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 26 | 7.96 | 19.09 | 20.14 | 23.70 | 1.34× | 2.03× | 1.23 | 1.21 | 420 / 13,517 / 0 | — | 0.012 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 22 | 9.53 | 18.98 | 28.08 | 124.53 | 1.32× | 2.38× | 1.38 | 1.28 | 500 / 14,301 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 7 | 8.61 | 11.02 | 11.02 | 11.47 | 1.45× | 1.62× | 0.81 | 0.85 | 444 / 14,339 / 0 | — | 0.0022 ms per byte | sdk.read |
| fs.glob | 1 files | 2 | 4.84 | 4.84 | 4.84 | 11.12 | 1.04× | 0.95× | — | — | 295 / 5,123 / 0 | — | 4.842 ms per file | — |
| fs.glob | 17–64 files | 8 | 7.67 | 10.97 | 10.97 | 18.01 | 1.26× | 1.20× | 0.35 | 0.42 | 360 / 12,324 / 0 | — | 0.3757 ms per file | — |
| fs.glob | 2–4 files | 14 | 6.00 | 21.87 | 21.87 | 71.56 | 1.29× | 3.28× | 1.45 | 1.42 | 276 / 8,036 / 0 | — | 1.9055 ms per file | — |
| fs.glob | 5–16 files | 28 | 7.66 | 11.57 | 12.02 | 23.39 | 1.57× | 1.31× | 1.76 | 1.43 | 331 / 13,195 / 0 | — | 0.7557 ms per file | — |
| fs.glob | >64 files | 9 | 13.67 | 60.39 | 60.39 | 148.97 | 1.39× | 3.31× | -1.74 | -2.14 | 864 / 31,580 / 0 | — | 0.0759 ms per file | — |
| fs.grep | 1 files | 3 | 7.07 | 7.07 | 7.07 | 11.05 | 1.45× | 1.30× | 1.02 | 0.59 | 354 / 10,096 / 0 | — | 7.072 ms per file | sdk.lines |
| fs.grep | 17–64 files | 13 | 14.92 | 19.86 | 19.86 | 27.02 | 1.36× | 1.45× | 1.67 | 1.43 | 770 / 20,859 / 0 | — | 0.6166 ms per file | sdk.lines |
| fs.grep | 2–4 files | 10 | 7.13 | 15.34 | 15.34 | 93.41 | 1.28× | 1.94× | 1.36 | 1.36 | 354 / 11,366 / 0 | — | 1.8145 ms per file | sdk.lines |
| fs.grep | 5–16 files | 18 | 11.06 | 15.04 | 15.04 | 19.38 | 1.55× | 1.05× | 2.01 | 1.70 | 537 / 15,668 / 0 | — | 1.154 ms per file | sdk.lines |
| fs.grep | >64 files | 8 | 9.74 | 22.06 | 22.06 | 45.38 | 0.77× | 1.22× | -3.43 | -3.78 | 507 / 17,365 / 0 | — | 0.0371 ms per file | sdk.lines |
| fs.list | 1 entries | 2 | 6.00 | 6.00 | 6.00 | 6.61 | 1.40× | 1.40× | — | — | 303 / 6,475 / 0 | — | 6.002 ms per entrie | — |
| fs.list | 17–64 entries | 15 | 11.80 | 23.68 | 23.68 | 27.93 | 1.05× | 1.40× | -0.60 | -0.57 | 916 / 29,838 / 0 | — | 0.4905 ms per entrie | — |
| fs.list | 2–4 entries | 15 | 8.16 | 14.11 | 14.11 | 14.22 | 1.64× | 2.02× | 2.80 | 2.57 | 300 / 10,159 / 0 | — | 2.2955 ms per entrie | — |
| fs.list | 5–16 entries | 25 | 8.74 | 20.50 | 20.80 | 32.39 | 1.51× | 2.40× | 2.30 | 2.20 | 498 / 14,803 / 0 | — | 1.4534 ms per entrie | — |
| fs.read | ≤1 KiB | 4 | 4.96 | 6.69 | 6.69 | 8.40 | 1.18× | 1.51× | 0.02 | -0.19 | 240 / 5,239 / 0 | — | 0.0077 ms per byte | sdk.lines |
| fs.read | ≤64 KiB | 8 | 8.41 | 10.97 | 10.97 | 11.94 | 1.26× | 1.65× | — | — | 267 / 10,594 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 49 | 6.67 | 35.57 | 67.89 | 85.30 | 1.42× | 5.35× | 1.50 | 1.30 | 301 / 8,136 / 0 | — | 0.0021 ms per byte | sdk.lines |
| fs.rm | 1 files | 45 | 24.91 | 337.68 | 453.84 | 461.99 | 2.08× | 17.82× | -7.75 | -7.43 | 1,507 / 62,327 / 1,638 | — | 24.908 ms per file | commit |
| fs.stat | ≤1 KiB | 1 | 5.27 | 5.27 | 5.27 | 5.27 | 0.99× | 0.90× | 1.51 | 1.38 | 138 / 4,926 / 0 | — | 0.007 ms per byte | — |
| fs.stat | ≤64 KiB | 38 | 6.44 | 24.21 | 28.24 | 59.14 | 1.40× | 3.11× | 1.71 | 1.70 | 273 / 8,696 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB | 19 | 5.16 | 9.09 | 9.09 | 10.74 | 1.07× | 1.51× | 0.54 | 0.35 | 246 / 6,830 / 0 | — | 0.0015 ms per byte | — |
| fs.write | ≤1 KiB | 38 | 30.61 | 338.22 | 363.73 | 381.16 | 2.80× | 9.35× | -1.74 | -2.62 | 1,655 / 64,763 / 2,238 | — | 0.0542 ms per byte | commit |
| fs.write | ≤512 KiB | 20 | 22.82 | 277.38 | 277.38 | 321.32 | 1.61× | 19.62× | -1.18 | -1.41 | 1,050 / 45,068 / 1,534 | — | 0.0002 ms per byte | commit |
| fs.write | ≤64 KiB | 469 | 27.66 | 315.41 | 386.08 | 570.53 | 1.92× | 3.44× | 1.04 | 1.42 | 1,614 / 61,878 / 1,596 | — | 0.0018 ms per byte | commit |
| fs.write | ≤8 KiB | 256 | 33.28 | 355.44 | 467.09 | 571.48 | 2.58× | 4.48× | 3.13 | 2.80 | 1,605 / 66,437 / 1,592 | — | 0.0097 ms per byte | commit |
| operator.store.stats | — | 1 | 2.61 | 2.61 | 2.61 | 2.61 | 0.98× | 0.98× | -0.04 | 0.05 | — | — | — | — |
| sandbox.commit | 0 files | 68 | 13.86 | 110.85 | 196.07 | 228.13 | 1.35× | 2.68× | 0.03 | -0.21 | 83 / 12,374 / 717 | — | — | commit |
| sandbox.commit | 1 files | 26 | 70.49 | 190.47 | 215.66 | 236.84 | 1.49× | 2.30× | 7.97 | 6.84 | 598 / 23,745 / 714 | — | 70.491 ms per file | commit |
| sandbox.commit | 2–4 files | 21 | 38.50 | 196.86 | 196.86 | 270.99 | 1.30× | 2.05× | -2.19 | -2.30 | 511 / 20,201 / 713 | — | 16.3167 ms per file | commit |
| sandbox.commit | 5–16 files | 1 | 20.54 | 20.54 | 20.54 | 20.54 | 0.75× | 0.75× | — | — | 316 / 22,184 / 697 | — | 3.4237 ms per file | commit |
| sandbox.exec | 1 files | 96 | 43.25 | 160.73 | 202.14 | 211.25 | 1.18× | 2.38× | 0.91 | 0.87 | 0 / 0 / 0 | 4.70 | 43.248 ms per file | — |
| sandbox.exec | 17–64 files | 8 | 107.65 | 137.82 | 137.82 | 192.13 | 1.57× | 1.59× | — | — | 0 / 0 / 0 | 91 | 5.8047 ms per file | — |
| sandbox.exec | 2–4 files | 111 | 46.91 | 130.90 | 156.81 | 253.06 | 1.20× | 1.78× | -0.51 | -0.56 | 0 / 0 / 0 | 9.70 | 20.279 ms per file | — |
| sandbox.exec | 5–16 files | 19 | 87.97 | 144.59 | 144.59 | 181.16 | 1.41× | 1.71× | 0.94 | 0.85 | 0 / 0 / 0 | 33 | 12.0477 ms per file | — |
| sandbox.exec | — | 3 | 611.21 | 611.21 | 611.21 | 1217.87 | 1.97× | 1.97× | 2.39 | 1.72 | 0 / 0 / 0 | 2,707 | — | — |
| sandbox.mount | — | 119 | 17.90 | 141.71 | 202.39 | 248.78 | 1.43× | 2.68× | 1.46 | 1.16 | 63 / 1,256 / 60 | — | — | sandbox.mount.attach |
| sandbox.unmount | — | 119 | 7.16 | 22.19 | 34.36 | 51.62 | 1.13× | 2.10× | 0.36 | 0.22 | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 79.8 KiB | 336 | ok 3 |
| branch.fork | branch | 12 | 0.0 KiB | 0.0 KiB | 0 | Forked 12 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.8 KiB | 23 | ok 3 |
| branch.merge | branch | 5 | 0.0 KiB | 0.0 KiB | 0 | Merged 5 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 87 | 802.5 KiB | 0.0 KiB | 89 | Committed 87 |
| fs.diff_files | fs | 56 | 0.0 KiB | 497.4 KiB | 34 | Text 34, NoSuchPath 22 |
| fs.glob | fs | 63 | 0.0 KiB | 36.6 KiB | 522 | ok 63 |
| fs.grep | fs | 54 | 0.0 KiB | 168.1 KiB | 763 | ok 54 |
| fs.list | fs | 61 | 0.0 KiB | 74.3 KiB | 651 | ok 61 |
| fs.read | fs | 62 | 0.0 KiB | 262.0 KiB | 62 | ok 62 |
| fs.rm | fs | 45 | 0.0 KiB | 0.0 KiB | 45 | Committed 45 |
| fs.stat | fs | 62 | 0.0 KiB | 13.5 KiB | 62 | ok 62 |
| fs.write | fs | 783 | 13.5 MiB | 0.0 KiB | 783 | Committed 782, UpToDate 1 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 117 | 0.0 KiB | 0.0 KiB | 0 | Committed 48, UpToDate 68, Conflict 1 |
| sandbox.exec | sandbox | 239 | 1.7 MiB | 161.0 KiB | 0 | exit:0 239 |
| sandbox.mount | sandbox | 121 | 0.0 KiB | 0.0 KiB | 0 | Mounted 121 |
| sandbox.unmount | sandbox | 121 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 121 |

### C. Scale probes

Binary: daemon `58a60046739f`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 4.54 | statements 87, vm_steps 3317, fullscan_steps 0, sorts 0, returned_rows 338 |
| read | 3.661 | statements 90, vm_steps 3335, fullscan_steps 0, sorts 0, returned_rows 339 |
| list_small | 5.428 | statements 210, vm_steps 8695, fullscan_steps 0, sorts 0, returned_rows 894 |
| list_largest | 14.455 | statements 924, vm_steps 38457, fullscan_steps 0, sorts 0, returned_rows 3741 |
| grep_scoped | 4.098 | statements 129, vm_steps 4497, fullscan_steps 0, sorts 0, returned_rows 455 |
| glob_scoped | 3.906 | statements 114, vm_steps 4407, fullscan_steps 0, sorts 0, returned_rows 450 |
| grep_tree | 374.635 | statements 38829, vm_steps 660192, fullscan_steps 0, sorts 0, returned_rows 53620 |
| glob_tree | 14.558 | statements 984, vm_steps 42432, fullscan_steps 0, sorts 0, returned_rows 3969 |
| diff_files | 5.052 | statements 180, vm_steps 6664, fullscan_steps 0, sorts 0, returned_rows 678 |
| list_commits | 2.769 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 4.064 | statements 123, vm_steps 2822, fullscan_steps 0, sorts 0, returned_rows 312 |
| fork | 2.345 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 42.936 | statements 1187, vm_steps 65078, fullscan_steps 2328, sorts 7, returned_rows 4845 |
| oneshot_mount_exec | 56.076 | statements 56, vm_steps 1185, fullscan_steps 60, sorts 2, returned_rows 128 |
| oneshot_commit | 84.383 | statements 391, vm_steps 22194, fullscan_steps 796, sorts 3, returned_rows 1677 |

### D. Storage internals

From the sealed file at snapshot r011: 8,400 pages of 4,096 B, 0 free · Commits 7,825 · Branches 118 · Layers 14.

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 6,945 | 75.4 MiB |
| 2 | 8,271 | 4.8 MiB |
| 3 | 8,084 | 689.2 KiB |
| 5 | 8,084 | 836.8 KiB |
| 6 | 9,294 | 53.7 MiB |
| 7 | 2,597 | 559.4 KiB |
| 9 | 8,779 | 4.6 MiB |
| 10 | 8,850 | 1.1 MiB |
| 11 | 9,622 | 1.3 MiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 7,834 | 10.4 MiB |
| 1 | 14,581 | 8.5 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 6,191 | 24.2 MiB | 4.1 MiB |
| object_location | 951 | 3.7 MiB | 427.9 KiB |
| commit | 596 | 2.3 MiB | 410.2 KiB |
| inode_value | 457 | 1.8 MiB | 59.0 KiB |
| commit_identity | 121 | 484.0 KiB | 54.7 KiB |
| binding_hint | 18 | 72.0 KiB | 13.2 KiB |
| content_signature | 15 | 60.0 KiB | 5.3 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| branch | 6 | 24.0 KiB | 7.0 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch_names | 3 | 12.0 KiB | 5.8 KiB |
| branch_identity | 3 | 12.0 KiB | 7.4 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 2.8 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 2.8 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 34.5 s** (tooling): play 23.3 · consolidate 3.0 · verify 2.4 · probes 0.7 · tests 0.0 · seal + snapshot 4.8 · report 0.3

34.46 s tooling: prepare 0.73 · play 22.53 · consolidate 3.05 · verify 1.74 (diff_commits + full compareTree) · version walk 0.63 · probes 0.68 · metrics 0.27 · seal 4.15 · sealed figures 0.22 · snapshot copy 0.46

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 58a60046739f3fb1e8c675274cf34afb1f867c08c5cf03db21eb35a2abb569b9 | 2026-10-18T00:26:26.709Z | optimize | Speed: fs.apply ≤8 KiB: 20.11× baseline (commit); Scaling: list_largest per entry of the largest directory: depth exponent 0.782; Counters: list_largest.statements per entry of the largest directory: depth exponent 1.834; Directory share: 0.568; Range growth: 6.4 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 412 ms for 32.8 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-011.a1.json`
- trace `~/lfs-history/runs/p2-main-c/trace/range-011.a1.jsonl` · runner log `~/lfs-history/runs/p2-main-c/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-011.json`
