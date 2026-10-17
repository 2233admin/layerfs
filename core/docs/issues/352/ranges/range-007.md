# Range 007 · **optimize** · attempt 1

**Matches git ✓** · daemon `361bb09e1d94` · image `d3773b4e` · plan v2 · continued from r006 (live Store)
dsh `8adcbceee`..`2bd155291` · **60 commits** (16 mainline, 44 side) · 2026-07-01 → 2026-07-04
Areas changed: `examples/acp-agent` 23% · `docs/rfc` 10% · `packages/core` 10% · other 57%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **5.7 MiB** (+895.3 KiB) | **20.7 MiB** (−1.6 MiB) | **3.64×** (prev 4.63×) | **3.2 MiB** | **537** (total 5,186) | **16.6 s** tooling (total 2.3 min) |

**Checks:** 6 pass · 4 watch: Speed fs.read ≤1 KiB: 17.81× baseline (sdk.lines); Directory share 0.563; Range growth 3.2 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 265 ms for 20.7 MiB new; size exponent not judged (2 snapshots) · 2 optimize/stop: Scaling, Counters
**Moved most:** ▼ probe list_small −36% · ▼ sandbox.mount p95 −31% · ▲ range time +28%
**Budget:** 8 of 202 ranges · projected total 0.9 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **804 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,051 / 1,051 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,172 calls** · **166 steps** by **8 agents + lead** on **3 Branches + main** · **83 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +122 added · 409 modified · −24 deleted · 7.4 MiB written · fs 503 : Sandbox 52 (**10 : 1**, target ~9 : 1)
**Execs:** 156 (JS 48 · shell 108) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 748 | 507 | 241 | Committed 507 · Text 25 · NoSuchPath 12 |
| sandbox | 401 | 235 | 0 | commit 79 (Committed 33, UpToDate 45, Conflict 1) · exec 156 (exit:0 156) · mount 83 (Mounted 83) · unmount 83 (Unmounted 83) |
| branch | 19 | 16 | 3 | diff_commits 3 · fork 11 (Forked 11) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,172** | **758** | **248** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r007-1-docs-rfc | a01 a02 a03 | 60 | 169 | ✓ | — |
| r007-2-examples-acp-agent | a04 a05 | 46 | 169 | ✓ | — |
| r007-3-packages-hooks | a06 a07 a08 | 54 | 168 | ✓ | — |
| main | lead | 6 | 31 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r007-1, a01 after a02 | 0.1 s |
| Stale clean merge | 1 / 1 | r007-1, a02 a01 | merged cleanly |
| Decoy edit | 1 / 1 | r007-1, a01 a03 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r007-1 | 24 | 11 | 13 | 0 | 0 | 39 | commit-conflict, stale-clean-merge, decoy |
| a02 | r007-1 | 18 | 10 | 8 | 0 | 0 | 91 | commit-conflict, stale-clean-merge |
| a03 | r007-1 | 18 | 8 | 10 | 0 | 0 | 39 | decoy |
| a04 | r007-2 | 23 | 12 | 11 | 0 | 0 | 76 | — |
| a05 | r007-2 | 23 | 10 | 13 | 0 | 0 | 93 | — |
| a06 | r007-3 | 19 | 9 | 10 | 0 | 0 | 70 | — |
| a07 | r007-3 | 19 | 9 | 10 | 0 | 0 | 40 | — |
| a08 | r007-3 | 16 | 10 | 6 | 0 | 0 | 58 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 31 | — |
| **Total** |  | **166** | **80** | **81** | **5** | **0** | **537** | **3** |

## 3. Storage

|  | Previous (r006) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 4.8 MiB (4.8 MiB / 0.0 KiB / 0.0 KiB) | 5.7 MiB (5.7 MiB / 0.0 KiB / 0.0 KiB) | +895.3 KiB |
| Files / directories / symlinks | 700 / 229 / 6 | 798 / 267 / 6 | +98 / +38 / +0 |
| Largest file / largest directory | 186.3 KiB / 29 entries | 188.9 KiB (`pnpm-lock.yaml`) / 34 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, sealed) | 22.2 MiB | 20.7 MiB | −1.6 MiB |
| **Space amplification** | 4.63× | 3.64× | -0.99 |
| Content amplification | 2.19× | 2.09× | — |
| Compression | 7.21× | 7.31× | — |
| Metadata share | 0.60 | 0.73 | this range 0.56 |
| **Stored per byte changed** | — | **1.15 bytes** | 0.59× the median range |
| History: Commits / Layers / Branches | 4,649 | 5,186 / 8 / 48 | +537 |
| Projection at range 202 / disk budget | — | 48.77 GiB / 41% | — |
| Snapshot | — | r007, 20.7 MiB new blocks | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 4,483 | +512 | 10.3 KiB | 0 (derived) | 91% |
| Chunks (large files) | 5,446 | +578 | 0.5 KiB | — | 3% |
| Large-file extents | 5,345 | — | 0.1 KiB | — | — |
| Directories | 2,083 | 654 (with inodes, pooled) | 0.2 KiB | — | 88% |
| Inodes and attributes | 28,377 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.0% at depth cap · 31% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.4 MiB · metadata 1.8 MiB · tracked 2.8 MiB changed in git

## 4. Speed

Daemon `361bb09e1d94` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 25.0 ms / 56.9 ms (2.83×) | 19.3 ms / 43.9 ms (4.86×) | 24.7 ms / 46.5 ms (5.43×) | 13.8 ms / 86.1 ms | 12.7 ms / 29.4 ms (1.22×) | 169 ms / 169 ms | — (native comparison in P3; exec 42.0 ms / 83.0 ms) |
| SQL p50: 496 stmts | 168 stmts | 231 stmts | 185 stmts | 64 stmts | 7,046 stmts | — |

**Commit cost:** 23.77 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 129 ms p50 over 83
**Slowest:** sandbox.exec 735 ms · sandbox.exec 383 ms · sandbox.exec 330 ms · checkpoint diff_commits 0.11 ms and 9.88 statements per entry (317 entries in 2 pages)
**Scaling:** 4 of 15 probes flat · `stat` 1.61 · `read` 0.69 · `list_small` 1.67 · `list_largest` 1.56 · `grep_scoped` 0.36 · `glob_scoped` 0.51 · `grep_tree` 0.91 · `diff_files` 0.74 · `list_commits` 0.25 · `merge` 0.50 · `oneshot_commit` 0.56

**Health:** 0 Workspaces open · 0 overlay files left · daemons 458 MB (+22 MB) over 9 of 9 Sandboxes · 127 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 007.a1 · optimize

**1. Trigger** (attempt 1, daemon `361bb09e1d94`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | list_small: depth exponent 1.67 | < 0.15 |
| Counters | list_small.statements: depth exponent 3.252 | < 0.05 |

Diagnosis pending: `finding-007.a1.json`.

### Open issues touching this range

| Id | Issue | Owner | Next step |
| --- | --- | --- | --- |
| F-002 | full-scan steps on hot paths | lead | see BUGS.md |
| F-006 | health cannot judge overlay files left | the builder | measure it per range, REPORT_FORMAT.md |
| F-007 | Trends were never written | the builder | see BUGS.md |
| F-013 | per-entry gate trips on a fixed per-checkpoint cost | lead | see BUGS.md |
| F-014 | the "one-file" `diff_commits` probe had a drifting input | lead | see BUGS.md |

### Lead's note (written by the lead; never empty unless the verdict is pass)

- Optimize: the `list_small` probe (a fixed 5-entry directory, probe input checked fixed) grows with depth: time exponent 1.67, statements exponent 3.25 over ranges 5–7 on `361bb09e`. SPEC §4: list must stay flat with depth. The runner stopped; snapshot taken at range 7.
- Also handed to the fixer in the same cycle (LESSONS S1): `fs.read`/`fs.grep` at 8–18× the baseline in `sdk.lines` since P2 started (ranges 5–7).
- Action: fixer diagnoses (D2/D4) and fixes; recovery forks the range-7 snapshot (kind 1 unless the record justifies otherwise) and reruns range 7 measured as attempt 2.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1051/1051; conflicts 3/3; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.read ≤1 KiB: 17.81× baseline (sdk.lines) | ≤ 1.2× | watch |
| Scaling | list_small: depth exponent 1.67 | < 0.15 | optimize |
| Counters | list_small.statements: depth exponent 3.252 | < 0.05 | optimize |
| Directory share | 0.563 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.0298 (budget 0.3067) | < 0.1 | pass |
| Range growth | 3.2 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 265 ms for 20.7 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.13 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 166 | 167 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 537 | 539 |
| Workspaces (one-shot share) | 83 (0.98) | 80 (0.975) |
| Reads | 232 | 232 |
| Reconcile writes | 29 | 29 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `361bb09e1d94` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries | 2 | 11.83 | 11.83 | 11.83 | 23.94 | 1.13× | 1.13× | -2.22 | -2.61 | 654 / 22,170 / 0 | — | 0.105 ms per entrie | — |
| branch.fork | — | 7 | 2.46 | 2.66 | 2.66 | 3.00 | 0.97× | 0.83× | 0.35 | 0.58 | 16 / 271 / 0 | — | — | — |
| branch.merge | >64 entries | 3 | 169.25 | 169.25 | 169.25 | 246.00 | no baseline | no baseline | 4.78 | 4.99 | 7,046 / 110,037 / 557 | — | 1.4343 ms per entrie | branch.merge |
| branch.publish | — | 1 | 5.92 | 5.92 | 5.92 | 5.92 | 0.92× | 0.92× | -1.19 | -0.98 | 554 / 14,385 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 32 | 35.78 | 52.09 | 100.12 | 105.71 | 3.93× | 5.45× | 0.82 | 0.88 | 494 / 19,523 / 593 | — | 0.13 ms per byte | commit |
| fs.apply | ≤64 KiB | 39 | 27.84 | 57.60 | 85.09 | 107.97 | 2.85× | 5.02× | 1.48 | 1.27 | 496 / 17,638 / 599 | — | 0.0013 ms per byte | commit |
| fs.apply | ≤8 KiB | 22 | 33.66 | 57.94 | 69.12 | 73.61 | 3.66× | 5.00× | 2.74 | 3.16 | 399 / 17,097 / 585 | — | 0.0075 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 15 | 15.70 | 40.81 | 40.81 | 53.27 | 3.18× | 6.39× | 0.47 | 0.27 | 276 / 8,642 / 0 | — | 0.0341 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 10 | 15.17 | 34.06 | 34.06 | 34.85 | 2.31× | 4.47× | 0.44 | 0.12 | 288 / 9,099 / 0 | — | 0.0009 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 11 | 20.16 | 29.99 | 29.99 | 42.62 | 4.01× | 5.07× | 1.66 | 1.32 | 279 / 10,698 / 0 | — | 0.0037 ms per byte | sdk.read |
| fs.glob | 1 files | 3 | 26.13 | 26.13 | 26.13 | 89.04 | 6.93× | 6.46× | 1.24 | 1.79 | 123 / 4,799 / 0 | — | 26.134 ms per file | — |
| fs.glob | 17–64 files | 6 | 13.41 | 49.48 | 49.48 | 99.08 | 2.33× | 8.49× | 0.04 | -0.05 | 240 / 9,625 / 0 | — | 0.4966 ms per file | — |
| fs.glob | 2–4 files | 8 | 17.42 | 37.30 | 37.30 | 40.06 | 4.73× | 8.92× | 1.35 | 0.94 | 138 / 5,232 / 0 | — | 8.71 ms per file | — |
| fs.glob | 5–16 files | 8 | 13.50 | 30.08 | 30.08 | 40.95 | 3.30× | 6.21× | 2.92 | 3.00 | 177 / 6,625 / 0 | — | 1.4996 ms per file | — |
| fs.glob | >64 files | 13 | 33.84 | 46.42 | 46.42 | 114.53 | 3.44× | 2.33× | 2.37 | 2.00 | 498 / 26,212 / 0 | — | 0.1507 ms per file | — |
| fs.grep | 1 files | 2 | 18.30 | 18.30 | 18.30 | 25.58 | 4.42× | 4.37× | 0.82 | 1.19 | 120 / 4,372 / 0 | — | 18.305 ms per file | sdk.lines |
| fs.grep | 17–64 files | 3 | 22.16 | 22.16 | 22.16 | 34.21 | 2.29× | 2.14× | 6.60 | 5.93 | 441 / 10,741 / 0 | — | 1.267 ms per file | sdk.lines |
| fs.grep | 2–4 files | 10 | 13.45 | 28.63 | 28.63 | 40.38 | 3.15× | 4.98× | 3.46 | 3.24 | 183 / 5,668 / 0 | — | 6.393 ms per file | sdk.lines |
| fs.grep | 5–16 files | 13 | 23.80 | 41.61 | 41.61 | 59.30 | 4.61× | 6.86× | 1.78 | 1.45 | 291 / 7,560 / 0 | — | 2.8139 ms per file | sdk.lines |
| fs.grep | >64 files | 8 | 23.13 | 42.67 | 42.67 | 48.72 | 2.09× | 3.24× | 0.74 | 0.33 | 1,005 / 24,068 / 0 | — | 0.1228 ms per file | sdk.lines |
| fs.list | 1 entries | 1 | 23.97 | 23.97 | 23.97 | 23.97 | 6.28× | 6.28× | 2.68 | 3.10 | 195 / 8,087 / 0 | — | 23.967 ms per entrie | — |
| fs.list | 17–64 entries | 4 | 29.27 | 38.50 | 38.50 | 39.23 | 3.12× | 3.86× | 4.07 | 3.73 | 624 / 28,715 / 0 | — | 1.0092 ms per entrie | — |
| fs.list | 2–4 entries | 13 | 19.57 | 42.20 | 42.20 | 108.27 | 5.13× | 8.08× | 4.21 | 4.33 | 192 / 7,249 / 0 | — | 7.753 ms per entrie | — |
| fs.list | 5–16 entries | 19 | 26.38 | 46.51 | 46.51 | 71.94 | 5.43× | 7.58× | 2.65 | 2.74 | 294 / 12,497 / 0 | — | 2.2542 ms per entrie | — |
| fs.read | ≤1 KiB | 1 | 66.17 | 66.17 | 66.17 | 66.17 | 17.81× | 17.81× | — | — | 96 / 2,622 / 0 | — | 0.0959 ms per byte | sdk.lines |
| fs.read | ≤64 KiB | 5 | 23.66 | 33.16 | 33.16 | 35.82 | 5.26× | 7.38× | 6.94 | 7.53 | 150 / 5,183 / 0 | — | 0.0022 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 36 | 18.97 | 43.95 | 46.45 | 109.26 | 4.86× | 9.03× | 1.13 | 0.80 | 168 / 5,499 / 0 | — | 0.0053 ms per byte | sdk.lines |
| fs.rm | 1 files | 23 | 12.47 | 32.63 | 35.71 | 45.99 | 1.42× | 2.96× | -1.82 | -2.76 | 413 / 18,743 / 614 | — | 12.47 ms per file | commit |
| fs.stat | ≤1 KiB | 1 | 26.47 | 26.47 | 26.47 | 26.47 | 7.76× | 6.49× | 3.66 | 3.57 | 99 / 3,031 / 0 | — | 0.1566 ms per byte | — |
| fs.stat | ≤512 KiB | 2 | 21.85 | 21.85 | 21.85 | 26.29 | 6.82× | 6.82× | — | — | 54 / 2,356 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB | 18 | 13.04 | 34.95 | 34.95 | 38.03 | 3.69× | 8.31× | -0.37 | -0.55 | 141 / 5,111 / 0 | — | 0.0006 ms per byte | — |
| fs.stat | ≤8 KiB | 17 | 14.56 | 42.06 | 42.06 | 46.79 | 4.04× | 10.41× | 1.04 | 1.25 | 150 / 5,427 / 0 | — | 0.0041 ms per byte | — |
| fs.write | ≤1 KiB | 19 | 28.58 | 46.99 | 46.99 | 108.57 | 3.60× | 4.72× | 2.98 | 2.64 | 364 / 17,431 / 599 | — | 0.058 ms per byte | commit |
| fs.write | ≤512 KiB | 11 | 22.86 | 33.78 | 33.78 | 43.05 | 1.72× | 2.52× | 0.85 | 0.66 | 465 / 18,984 / 613 | — | 0.0002 ms per byte | commit |
| fs.write | ≤64 KiB | 159 | 24.95 | 57.91 | 83.38 | 120.17 | 2.55× | 4.51× | 0.72 | 0.53 | 526 / 18,490 / 608 | — | 0.0013 ms per byte | commit |
| fs.write | ≤8 KiB | 198 | 24.75 | 56.94 | 107.26 | 137.25 | 2.83× | 5.39× | 1.30 | 1.12 | 493 / 18,518 / 608 | — | 0.0053 ms per byte | commit |
| operator.store.stats | — | 1 | 3.23 | 3.23 | 3.23 | 3.23 | 1.47× | 1.47× | 1.40 | 1.82 | — | — | — | — |
| sandbox.commit | 0 files | 45 | 10.40 | 38.12 | 41.24 | 80.21 | no baseline | no baseline | 0.83 | 0.62 | 83 / 9,989 / 548 | — | — | commit |
| sandbox.commit | 1 files | 19 | 22.00 | 97.38 | 97.38 | 142.27 | 1.96× | 8.66× | 0.40 | -0.09 | 679 / 24,744 / 545 | — | 21.997 ms per file | commit |
| sandbox.commit | 2–4 files | 14 | 20.07 | 96.09 | 96.09 | 153.93 | no baseline | no baseline | 1.16 | 1.18 | 506 / 20,331 / 547 | — | 10.036 ms per file | commit |
| sandbox.exec | 1 files | 67 | 39.05 | 64.72 | 78.59 | 129.76 | 0.87× | 1.40× | -0.02 | -0.02 | 0 / 0 / 0 | 5 | 39.049 ms per file | — |
| sandbox.exec | 17–64 files | 2 | 77.66 | 77.66 | 77.66 | 105.38 | no baseline | no baseline | 0.18 | 0.16 | 0 / 0 / 0 | 83 | 4.3145 ms per file | — |
| sandbox.exec | 2–4 files | 65 | 40.56 | 79.93 | 85.00 | 90.69 | no baseline | no baseline | -0.42 | -0.64 | 0 / 0 / 0 | 10.70 | 17.4305 ms per file | — |
| sandbox.exec | 5–16 files | 17 | 70.02 | 83.00 | 83.00 | 85.07 | no baseline | no baseline | 0.10 | 0.06 | 0 / 0 / 0 | 34 | 10.8928 ms per file | — |
| sandbox.exec | — | 3 | 383.40 | 383.40 | 383.40 | 734.85 | 1.34× | 1.34× | 0.38 | 0.78 | 0 / 0 / 0 | 2,144 | — | — |
| sandbox.mount | — | 81 | 12.70 | 29.40 | 89.36 | 93.19 | 1.22× | 2.80× | 0.18 | -0.07 | 64 / 1,967 / 60 | — | — | sandbox.mount.attach |
| sandbox.unmount | — | 81 | 7.46 | 15.02 | 44.33 | 74.00 | 1.08× | 2.03× | 0.06 | -0.04 | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 76.3 KiB | 318 | ok 3 |
| branch.fork | branch | 11 | 0.0 KiB | 0.0 KiB | 0 | Forked 11 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.1 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 97 | 1.0 MiB | 0.0 KiB | 99 | Committed 97 |
| fs.diff_files | fs | 37 | 0.0 KiB | 229.7 KiB | 25 | Text 25, NoSuchPath 12 |
| fs.glob | fs | 40 | 0.0 KiB | 31.8 KiB | 458 | ok 40 |
| fs.grep | fs | 38 | 0.0 KiB | 136.5 KiB | 363 | ok 38 |
| fs.list | fs | 41 | 0.0 KiB | 48.0 KiB | 381 | ok 41 |
| fs.read | fs | 43 | 0.0 KiB | 192.3 KiB | 43 | ok 43 |
| fs.rm | fs | 23 | 0.0 KiB | 0.0 KiB | 23 | Committed 23 |
| fs.stat | fs | 42 | 0.0 KiB | 9.2 KiB | 42 | ok 42 |
| fs.write | fs | 387 | 5.8 MiB | 0.0 KiB | 387 | Committed 387 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 79 | 0.0 KiB | 0.0 KiB | 0 | Committed 33, UpToDate 45, Conflict 1 |
| sandbox.exec | sandbox | 156 | 925.9 KiB | 122.7 KiB | 0 | exit:0 156 |
| sandbox.mount | sandbox | 83 | 0.0 KiB | 0.0 KiB | 0 | Mounted 83 |
| sandbox.unmount | sandbox | 83 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 83 |

### C. Scale probes

Binary: daemon `361bb09e1d94`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 4.619 | statements 78, vm_steps 3317, fullscan_steps 0, sorts 0, returned_rows 344 |
| read | 3.239 | statements 81, vm_steps 3335, fullscan_steps 0, sorts 0, returned_rows 345 |
| list_small | 4.815 | statements 186, vm_steps 8695, fullscan_steps 0, sorts 0, returned_rows 910 |
| list_largest | 12.712 | statements 855, vm_steps 31193, fullscan_steps 0, sorts 0, returned_rows 3353 |
| grep_scoped | 3.691 | statements 117, vm_steps 4497, fullscan_steps 0, sorts 0, returned_rows 463 |
| glob_scoped | 3.476 | statements 102, vm_steps 4407, fullscan_steps 0, sorts 0, returned_rows 458 |
| grep_tree | 220.456 | statements 23001, vm_steps 421734, fullscan_steps 0, sorts 0, returned_rows 37709 |
| glob_tree | 15.454 | statements 975, vm_steps 43917, fullscan_steps 0, sorts 0, returned_rows 4256 |
| diff_files | 6.335 | statements 162, vm_steps 6664, fullscan_steps 0, sorts 0, returned_rows 690 |
| list_commits | 3.83 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 3.951 | statements 90, vm_steps 2674, fullscan_steps 0, sorts 0, returned_rows 312 |
| fork | 2.33 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 36.923 | statements 992, vm_steps 55669, fullscan_steps 1803, sorts 7, returned_rows 4303 |
| oneshot_mount_exec | 63.001 | statements 57, vm_steps 2016, fullscan_steps 60, sorts 2, returned_rows 197 |
| oneshot_commit | 80.295 | statements 314, vm_steps 19913, fullscan_steps 621, sorts 3, returned_rows 1565 |

### D. Storage internals

From the sealed file at snapshot r007: 5,289 pages of 4,096 B, 0 free · Commits 5,216 · Branches 70 · Layers 9.

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 4,483 | 44.9 MiB |
| 2 | 5,446 | 2.6 MiB |
| 3 | 5,345 | 452.9 KiB |
| 5 | 5,345 | 553.3 KiB |
| 6 | 5,968 | 34.3 MiB |
| 7 | 2,083 | 442.7 KiB |
| 9 | 5,209 | 2.1 MiB |
| 10 | 5,280 | 665.2 KiB |
| 11 | 6,575 | 918.2 KiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 5,221 | 6.4 MiB |
| 1 | 9,614 | 5.5 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 3,840 | 15.0 MiB | 2.4 MiB |
| object_location | 607 | 2.4 MiB | 246.0 KiB |
| commit | 383 | 1.5 MiB | 241.7 KiB |
| inode_value | 308 | 1.2 MiB | 24.7 KiB |
| commit_identity | 84 | 336.0 KiB | 49.8 KiB |
| binding_hint | 14 | 56.0 KiB | 9.4 KiB |
| content_signature | 12 | 48.0 KiB | 6.4 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch | 4 | 16.0 KiB | 6.0 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 3.3 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 3.3 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |
| layer_stack | 1 | 4.0 KiB | 3.9 KiB |
| layer_identity | 1 | 4.0 KiB | 3.5 KiB |

### E. Stage times

**Time 16.6 s** (tooling): play 8.3 · consolidate 0.8 · verify 1.6 · probes 0.5 · tests 0.0 · seal + snapshot 5.1 · report 0.3

16.64 s tooling: prepare 0.23 · play 8.02 · consolidate 0.77 · verify 1.21 (diff_commits + full compareTree) · version walk 0.41 · probes 0.52 · metrics 0.21 · seal 4.61 · sealed figures 0.21 · snapshot copy 0.32 · report 0.12

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 361bb09e1d9465ab47e93d1ae98226e62018aad71340140500bbcebb1fde41f4 | 2026-10-17T23:17:20.522Z | optimize | Speed: fs.read ≤1 KiB: 17.81× baseline (sdk.lines); Scaling: list_small: depth exponent 1.67; Counters: list_small.statements: depth exponent 3.252; Directory share: 0.563; Range growth: 3.2 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 265 ms for 20.7 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-007.a1.json`
- trace `~/lfs-history/runs/p2-main/trace/range-007.a1.jsonl` · runner log `~/lfs-history/runs/p2-main/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-007.json`
