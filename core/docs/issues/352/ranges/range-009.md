# Range 009 · **optimize** · attempt 1

**Matches git ✓** · daemon `c25119ace6ae` · image `d3773b4e` · plan v2 · continued from r008 (live Store)
dsh `72166dad0`..`7396b931e` · **61 commits** (10 mainline, 51 side) · 2026-07-06 → 2026-07-07
Areas changed: `examples/acp-agent` 30% · `packages/core` 13% · `/` 10% · other 47%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **6.2 MiB** (+63.8 KiB) | **25.9 MiB** (−2.0 MiB) | **4.16×** (prev 4.53×) | **2.6 MiB** | **457** (total 6,385) | **18.5 s** tooling (total 3.0 min) |

**Checks:** 6 pass · 5 watch: Speed fs.rm 1 files: 11.84× baseline (commit); Scaling diff_commits: depth exponent 0.569; Directory share 0.565; Range growth 2.6 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 326 ms for 25.9 MiB new; size exponent not judged (2 snapshots) · 1 optimize/stop: Counters
**Moved most:** ▲ fs.list p95 +53% · ▼ stored added −41% · ▼ metadata added −40%
**Budget:** 10 of 202 ranges · projected total 1.0 h (budget 6.7 h) · disk 40% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **860 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 2 publishes |
| Steps | 930 / 930 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,052 calls** · **177 steps** by **8 agents + lead** on **3 Branches + main** · **85 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +32 added · 420 modified · −13 deleted · 5.8 MiB written · fs 423 : Sandbox 42 (**10 : 1**, target ~9 : 1)
**Execs:** 156 (JS 50 · shell 106) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 622 | 427 | 195 | Committed 427 · Text 19 · NoSuchPath 7 · Equal 1 |
| sandbox | 407 | 237 | 0 | commit 81 (Committed 33, UpToDate 47, Conflict 1) · exec 156 (exit:0 156) · mount 85 (Mounted 85) · unmount 85 (Unmounted 85) |
| branch | 19 | 17 | 2 | diff_commits 2 · fork 11 (Forked 11) · merge 4 (Merged 4) · publish 2 (Added 2) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,052** | **681** | **201** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r009-1-packages-core | a01 a02 | 49 | 144 | ✓ | ✓ |
| r009-2-docs | a03 a04 a05 | 73 | 143 | ✓ | — |
| r009-3-docs-rfc | a06 a07 a08 | 48 | 142 | ✓ | — |
| main | lead | 7 | 28 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r009-1, a01 after a02 | 0.3 s |
| Stale clean merge | 1 / 1 | r009-1, a01 a02 | merged cleanly |
| Decoy edit | 1 / 1 | r009-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r009-2 vs r009-1 publish | 0.8 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r009-1 | 25 | 13 | 12 | 0 | 0 | 50 | commit-conflict, stale-clean-merge, decoy |
| a02 | r009-1 | 24 | 12 | 12 | 0 | 0 | 94 | commit-conflict, stale-clean-merge, decoy |
| a03 | r009-2 | 28 | 14 | 14 | 0 | 0 | 48 | — |
| a04 | r009-2 | 24 | 11 | 13 | 0 | 0 | 53 | — |
| a05 | r009-2 | 21 | 10 | 11 | 0 | 0 | 42 | — |
| a06 | r009-3 | 15 | 11 | 4 | 0 | 0 | 19 | — |
| a07 | r009-3 | 15 | 7 | 8 | 0 | 0 | 29 | — |
| a08 | r009-3 | 18 | 9 | 9 | 0 | 0 | 94 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 28 | merge-race |
| **Total** |  | **177** | **88** | **83** | **6** | **0** | **457** | **4** |

## 3. Storage

|  | Previous (r008) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 6.2 MiB (6.2 MiB / 0.0 KiB / 0.0 KiB) | 6.2 MiB (6.2 MiB / 0.0 KiB / 0.0 KiB) | +63.8 KiB |
| Files / directories / symlinks | 835 / 270 / 6 | 854 / 268 / 6 | +19 / −2 / +0 |
| Largest file / largest directory | 226.2 KiB / 34 entries | 226.5 KiB (`pnpm-lock.yaml`) / 34 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, sealed) | 28.0 MiB | 25.9 MiB | −2.0 MiB |
| **Space amplification** | 4.53× | 4.16× | -0.37 |
| Content amplification | 2.24× | 2.40× | — |
| Compression | 7.42× | 7.50× | — |
| Metadata share | 0.63 | 0.74 | this range 0.56 |
| **Stored per byte changed** | — | **0.99 bytes** | 0.52× the median range |
| History: Commits / Layers / Branches | 5,928 | 6,385 / 9 / 56 | +457 |
| Projection at range 202 / disk budget | — | 48.27 GiB / 40% | — |
| Snapshot | — | r009, 25.9 MiB new blocks | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 5,632 | +1,037 | 10.6 KiB | 0 (derived) | 93% |
| Chunks (large files) | 6,721 | +1,158 | 0.5 KiB | — | 1% |
| Large-file extents | 6,598 | — | 0.1 KiB | — | — |
| Directories | 2,224 | 1,459 (with inodes, pooled) | 0.2 KiB | — | 90% |
| Inodes and attributes | 36,142 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 4.3% at depth cap · 31% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.1 MiB · metadata 1.5 MiB · tracked 2.6 MiB changed in git

## 4. Speed

Daemon `c25119ace6ae` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 20.3 ms / 257 ms (1.76×) | 4.9 ms / 7.3 ms (1.07×) | 7.3 ms / 17.3 ms (1.46×) | 23.7 ms / 144 ms (2.04×) | 19.6 ms / 120 ms (1.59×) | 187 ms / 187 ms (1.58×) | — (native comparison in P3; exec 44.6 ms / 96.4 ms) |
| SQL p50: 1,300 stmts | 204 stmts | 495 stmts | 167 stmts | 69 stmts | 7,448 stmts | — |

**Commit cost:** 40.28 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 180 ms p50 over 85
**Slowest:** sandbox.exec 1214 ms · sandbox.exec 454 ms · fs.write 439 ms (13,019 bytes) · checkpoint diff_commits 0.07 ms and 6.22 statements per entry (216 entries per page)
**Scaling:** 11 of 15 probes flat · `grep_tree` 0.85 · `diff_files` 1.64 · `diff_commits` 0.57 · `merge` 0.26

**Health:** 0 Workspaces open · 0 overlay files left · daemons 607 MB (+29 MB) over 9 of 9 Sandboxes · 148 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 009.a1 · optimize

**1. Trigger** (attempt 1, daemon `c25119ace6ae`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | oneshot_mount_exec.vm_steps: depth exponent 0.971 | < 0.05 |

Diagnosis pending: `finding-009.a1.json`.

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

- Played with the same concurrent work declared as range 8 (fixer F-020 build in its worktree, builder tooling).
- Optimize: `oneshot_mount_exec.vm_steps` depth exponent 0.971 over ranges 7–9 on `c25119ac`: one-shot mount + exec must stay flat with depth (SPEC §4). Deterministic counter, so the concurrent load does not explain it. Snapshot taken at range 9.
- Watch: `fs.rm` 1 file 11.84× the P2 baseline (9.69× at range 8), handed to the fixer in the same cycle (S1); `diff_commits` scaling 0.569.
- Action: the fixer diagnoses 009.a1 before F-020; recovery forks p2-main-b's range-7 snapshot, fast-forwards range 8 and reruns range 9 measured as attempt 2.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 930/930; conflicts 4/4; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.rm 1 files: 11.84× baseline (commit) | ≤ 1.2× | watch |
| Scaling | diff_commits: depth exponent 0.569 | < 0.15 | watch |
| Counters | oneshot_mount_exec.vm_steps: depth exponent 0.971 | < 0.05 | optimize |
| Directory share | 0.565 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.0427 (budget 0.3072) | < 0.1 | pass |
| Range growth | 2.6 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 326 ms for 25.9 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.4 | < 0.8 | pass |
| Wall projection | 0.15 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 177 | 177 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 457 | 459 |
| Workspaces (one-shot share) | 85 (0.98) | 82 (0.976) |
| Reads | 185 | 185 |
| Reconcile writes | 26 | 26 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `c25119ace6ae` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries | 1 | 25.32 | 25.32 | 25.32 | 25.32 | 2.74× | 2.74× | 3.50 | 10.76 | 2,244 / 38,838 / 0 | — | 0.1172 ms per entrie | — |
| branch.fork | — | 7 | 2.65 | 2.85 | 2.85 | 3.56 | 1.00× | 0.99× | -0.54 | -1.76 | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries | 1 | 5.17 | 5.17 | 5.17 | 5.17 | 1.51× | 1.51× | — | — | 477 / 12,045 / 0 | — | 0.1362 ms per entrie | — |
| branch.merge | >64 entries | 2 | 187.21 | 187.21 | 187.21 | 262.94 | 1.58× | 1.58× | 0.39 | 1.33 | 7,448 / 108,206 / 621 | — | 2.1035 ms per entrie | branch.merge |
| branch.publish | — | 2 | 4.01 | 4.01 | 4.01 | 6.48 | 0.80× | 0.80× | -1.51 | -4.47 | 173 / 4,263 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 1 | 11.25 | 11.25 | 11.25 | 11.25 | 0.96× | 0.68× | — | — | 627 / 32,871 / 668 | — | 0.014 ms per byte | commit |
| fs.apply | ≤64 KiB | 2 | 10.54 | 10.54 | 10.54 | 17.90 | 0.83× | 0.23× | -1.73 | -5.10 | 372 / 18,375 / 674 | — | 0.0007 ms per byte | commit |
| fs.apply | ≤8 KiB | 2 | 16.11 | 16.11 | 16.11 | 18.55 | 1.27× | 0.89× | 0.70 | 2.82 | 695 / 36,768 / 669 | — | 0.0039 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 9 | 7.05 | 9.68 | 9.68 | 11.11 | 1.26× | 1.27× | 0.46 | 1.42 | 345 / 11,880 / 0 | — | 0.0202 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 8 | 6.87 | 11.32 | 11.32 | 12.16 | 1.01× | 1.37× | 0.10 | 0.35 | 378 / 10,032 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 9 | 7.13 | 8.44 | 8.44 | 19.13 | 1.04× | 1.17× | 0.11 | 0.21 | 420 / 12,579 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.glob | 1 files | 2 | 3.73 | 3.73 | 3.73 | 4.92 | 0.82× | 0.72× | -0.57 | -1.60 | 126 / 4,180 / 0 | — | 3.733 ms per file | — |
| fs.glob | 17–64 files | 7 | 7.09 | 8.71 | 8.71 | 8.87 | 1.33× | 1.21× | 1.23 | 3.83 | 477 / 17,250 / 0 | — | 0.2898 ms per file | — |
| fs.glob | 2–4 files | 6 | 4.37 | 6.27 | 6.27 | 6.57 | 1.10× | 1.11× | 0.03 | 0.23 | 144 / 6,165 / 0 | — | 2.1005 ms per file | — |
| fs.glob | 5–16 files | 6 | 5.68 | 6.33 | 6.33 | 8.74 | 1.28× | 1.10× | 0.29 | 0.90 | 168 / 8,226 / 0 | — | 0.6311 ms per file | — |
| fs.glob | >64 files | 11 | 28.40 | 44.10 | 44.10 | 128.76 | 2.81× | 2.23× | 3.02 | 8.88 | 1,586 / 61,660 / 656 | — | 0.0697 ms per file | — |
| fs.grep | 1 files | 1 | 7.32 | 7.32 | 7.32 | 7.32 | 1.58× | 1.58× | 2.65 | 8.12 | 141 / 6,346 / 0 | — | 7.32 ms per file | sdk.lines |
| fs.grep | 17–64 files | 3 | 9.70 | 9.70 | 9.70 | 10.71 | 0.88× | 0.69× | 1.21 | 3.83 | 786 / 18,647 / 0 | — | 0.4658 ms per file | sdk.lines |
| fs.grep | 2–4 files | 5 | 6.93 | 7.94 | 7.94 | 9.21 | 1.25× | 1.23× | 0.73 | 2.19 | 408 / 11,572 / 0 | — | 2.31 ms per file | sdk.lines |
| fs.grep | 5–16 files | 10 | 7.57 | 11.82 | 11.82 | 12.21 | 1.23× | 1.36× | -0.10 | -0.24 | 363 / 8,872 / 0 | — | 1.0287 ms per file | sdk.lines |
| fs.grep | >64 files | 9 | 15.84 | 25.14 | 25.14 | 38.68 | 1.35× | 1.69× | -0.19 | -0.57 | 1,579 / 33,222 / 0 | — | 0.0614 ms per file | sdk.lines |
| fs.list | 1 entries | 2 | 3.88 | 3.88 | 3.88 | 4.86 | 0.92× | 0.92× | -1.77 | -5.41 | 144 / 5,989 / 0 | — | 3.879 ms per entrie | — |
| fs.list | 17–64 entries | 13 | 13.89 | 18.64 | 18.64 | 83.65 | 1.46× | 1.62× | 0.97 | 2.92 | 868 / 31,736 / 0 | — | 0.5166 ms per entrie | — |
| fs.list | 2–4 entries | 5 | 5.43 | 6.94 | 6.94 | 17.34 | 1.17× | 1.10× | -0.17 | -0.53 | 238 / 8,009 / 0 | — | 2.6615 ms per entrie | — |
| fs.list | 5–16 entries | 12 | 6.76 | 7.83 | 7.83 | 12.71 | 1.21× | 0.96× | -0.57 | -1.80 | 378 / 11,283 / 0 | — | 1.1559 ms per entrie | — |
| fs.read | ≤1 KiB | 2 | 3.68 | 3.68 | 3.68 | 5.36 | 0.87× | 0.73× | — | — | 141 / 3,182 / 0 | — | 0.0054 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 25 | 4.86 | 7.25 | 7.58 | 8.97 | 1.07× | 1.11× | -0.41 | -1.24 | 204 / 5,697 / 0 | — | 0.0017 ms per byte | sdk.lines |
| fs.rm | 1 files | 13 | 60.72 | 220.76 | 220.76 | 269.42 | 5.51× | 11.84× | 7.11 | 21.77 | 3,364 / 107,826 / 1,348 | — | 60.715 ms per file | commit |
| fs.stat | ≤1 KiB | 3 | 3.99 | 3.99 | 3.99 | 4.08 | 0.91× | 0.87× | -0.40 | -1.26 | 144 / 3,152 / 0 | — | 0.0098 ms per byte | — |
| fs.stat | ≤512 KiB | 1 | 4.00 | 4.00 | 4.00 | 4.00 | 0.06× | 0.06× | -1.16 | -3.54 | 78 / 2,735 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB | 20 | 4.65 | 11.29 | 11.29 | 18.65 | 1.06× | 1.93× | -0.20 | -0.64 | 162 / 6,374 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤8 KiB | 12 | 4.30 | 5.68 | 5.68 | 5.96 | 1.03× | 0.90× | -0.43 | -1.27 | 183 / 6,599 / 0 | — | 0.001 ms per byte | — |
| fs.write | ≤1 KiB | 19 | 72.41 | 212.67 | 212.67 | 297.57 | 6.89× | 7.20× | 7.24 | 21.92 | 3,006 / 82,339 / 2,058 | — | 0.1938 ms per byte | commit |
| fs.write | ≤512 KiB | 4 | 23.46 | 53.71 | 53.71 | 325.69 | 1.56× | 3.56× | -6.35 | -19.76 | 1,513 / 60,245 / 1,346 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB | 207 | 22.80 | 259.39 | 318.70 | 439.19 | 1.76× | 3.03× | -0.60 | -1.98 | 1,395 / 54,198 / 1,358 | — | 0.0015 ms per byte | commit |
| fs.write | ≤8 KiB | 175 | 18.02 | 235.16 | 309.78 | 339.65 | 1.52× | 2.91× | 0.31 | 0.94 | 1,208 / 48,347 / 1,332 | — | 0.0045 ms per byte | commit |
| operator.store.stats | — | 1 | 2.17 | 2.17 | 2.17 | 2.17 | 0.87× | 0.87× | -0.29 | -0.88 | — | — | — | — |
| sandbox.commit | 0 files | 47 | 19.07 | 143.53 | 159.71 | 167.13 | 2.04× | 3.56× | 1.74 | 5.25 | 92 / 10,866 / 612 | — | — | commit |
| sandbox.commit | 1 files | 26 | 28.05 | 114.63 | 132.48 | 205.41 | 0.91× | 1.29× | -2.36 | -7.01 | 347 / 16,588 / 614 | — | 28.05 ms per file | commit |
| sandbox.commit | 2–4 files | 7 | 46.34 | 83.72 | 83.72 | 88.03 | 1.10× | 1.27× | -1.40 | -4.73 | 1,143 / 36,887 / 611 | — | 20.9297 ms per file | commit |
| sandbox.exec | 1 files | 92 | 39.49 | 73.00 | 96.38 | 116.29 | 1.12× | 1.20× | 0.10 | 0.31 | 0 / 0 / 0 | 4.70 | 39.488 ms per file | — |
| sandbox.exec | 2–4 files | 50 | 55.73 | 86.34 | 110.36 | 116.91 | 1.43× | 1.25× | 0.94 | 2.87 | 0 / 0 / 0 | 13 | 20.3237 ms per file | — |
| sandbox.exec | 5–16 files | 9 | 82.18 | 93.59 | 93.59 | 124.02 | 1.29× | 1.22× | 0.43 | 1.26 | 0 / 0 / 0 | 30 | 11.773 ms per file | — |
| sandbox.exec | — | 3 | 453.84 | 453.84 | 453.84 | 1213.83 | 1.52× | 1.52× | 0.07 | 0.21 | 0 / 0 / 0 | 2,205 | — | — |
| sandbox.mount | — | 83 | 19.63 | 120.45 | 135.38 | 191.12 | 1.59× | 2.57× | 1.03 | 3.05 | 69 / 2,303 / 60 | — | — | sandbox.mount.attach |
| sandbox.unmount | — | 83 | 6.42 | 9.76 | 29.66 | 37.94 | 1.04× | 1.14× | -0.13 | -0.42 | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 2 | 0.0 KiB | 52.4 KiB | 217 | ok 2 |
| branch.fork | branch | 11 | 0.0 KiB | 0.0 KiB | 0 | Forked 11 |
| branch.list_commits | project | 3 | 0.0 KiB | 12.9 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 9 | 32.6 KiB | 0.0 KiB | 11 | Committed 9 |
| fs.diff_files | fs | 27 | 0.0 KiB | 243.5 KiB | 20 | Text 19, NoSuchPath 7, Equal 1 |
| fs.glob | fs | 34 | 0.0 KiB | 23.5 KiB | 362 | ok 34 |
| fs.grep | fs | 30 | 0.0 KiB | 127.8 KiB | 435 | ok 30 |
| fs.list | fs | 36 | 0.0 KiB | 49.6 KiB | 474 | ok 36 |
| fs.read | fs | 28 | 0.0 KiB | 92.3 KiB | 28 | ok 28 |
| fs.rm | fs | 13 | 0.0 KiB | 0.0 KiB | 13 | Committed 13 |
| fs.stat | fs | 40 | 0.0 KiB | 8.2 KiB | 40 | ok 40 |
| fs.write | fs | 405 | 5.2 MiB | 0.0 KiB | 405 | Committed 405 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 81 | 0.0 KiB | 0.0 KiB | 0 | Committed 33, UpToDate 47, Conflict 1 |
| sandbox.exec | sandbox | 156 | 837.7 KiB | 111.4 KiB | 0 | exit:0 156 |
| sandbox.mount | sandbox | 85 | 0.0 KiB | 0.0 KiB | 0 | Mounted 85 |
| sandbox.unmount | sandbox | 85 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 85 |

### C. Scale probes

Binary: daemon `c25119ace6ae`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 4.836 | statements 105, vm_steps 3587, fullscan_steps 0, sorts 0, returned_rows 359 |
| read | 4.726 | statements 108, vm_steps 3605, fullscan_steps 0, sorts 0, returned_rows 360 |
| list_small | 5.906 | statements 258, vm_steps 9415, fullscan_steps 0, sorts 0, returned_rows 950 |
| list_largest | 10.466 | statements 564, vm_steps 31283, fullscan_steps 0, sorts 0, returned_rows 3225 |
| grep_scoped | 4.57 | statements 153, vm_steps 4857, fullscan_steps 0, sorts 0, returned_rows 483 |
| glob_scoped | 4.053 | statements 138, vm_steps 4767, fullscan_steps 0, sorts 0, returned_rows 478 |
| grep_tree | 295.205 | statements 30231, vm_steps 513250, fullscan_steps 0, sorts 0, returned_rows 42632 |
| glob_tree | 16.514 | statements 1005, vm_steps 41835, fullscan_steps 0, sorts 0, returned_rows 3996 |
| diff_files | 8.348 | statements 216, vm_steps 7204, fullscan_steps 0, sorts 0, returned_rows 720 |
| list_commits | 3.238 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 4.473 | statements 84, vm_steps 2292, fullscan_steps 0, sorts 0, returned_rows 239 |
| fork | 2.349 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 40.831 | statements 1190, vm_steps 59050, fullscan_steps 1989, sorts 7, returned_rows 4328 |
| oneshot_mount_exec | 60.081 | statements 62, vm_steps 2352, fullscan_steps 60, sorts 2, returned_rows 223 |
| oneshot_commit | 82.612 | statements 388, vm_steps 21264, fullscan_steps 683, sorts 3, returned_rows 1593 |

### D. Storage internals

From the sealed file at snapshot r009: 6,641 pages of 4,096 B, 0 free · Commits 6,421 · Branches 93 · Layers 12.

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 5,632 | 58.5 MiB |
| 2 | 6,721 | 3.3 MiB |
| 3 | 6,598 | 557.9 KiB |
| 5 | 6,598 | 683.0 KiB |
| 6 | 7,548 | 43.7 MiB |
| 7 | 2,224 | 499.1 KiB |
| 9 | 7,004 | 3.3 MiB |
| 10 | 7,075 | 891.3 KiB |
| 11 | 7,917 | 1.1 MiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 6,428 | 8.2 MiB |
| 1 | 11,923 | 6.8 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 4,841 | 18.9 MiB | 3.0 MiB |
| object_location | 770 | 3.0 MiB | 339.9 KiB |
| commit | 479 | 1.9 MiB | 305.1 KiB |
| inode_value | 377 | 1.5 MiB | 46.1 KiB |
| commit_identity | 100 | 400.0 KiB | 47.7 KiB |
| binding_hint | 15 | 60.0 KiB | 9.6 KiB |
| content_signature | 13 | 52.0 KiB | 5.7 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch | 5 | 20.0 KiB | 6.6 KiB |
| branch_names | 3 | 12.0 KiB | 7.1 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 3.0 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 3.0 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |
| layer_stack | 1 | 4.0 KiB | 3.9 KiB |

### E. Stage times

**Time 18.5 s** (tooling): play 10.2 · consolidate 0.8 · verify 2.2 · probes 0.6 · tests 0.0 · seal + snapshot 4.5 · report 0.2

18.51 s tooling: prepare 0.25 · play 9.90 · consolidate 0.76 · verify 1.77 (diff_commits + full compareTree) · version walk 0.47 · probes 0.60 · metrics 0.21 · seal 3.89 · sealed figures 0.28 · snapshot copy 0.38

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | c25119ace6ae9a10d6e67618b114c031676e5065680db4e47ab0beb3a1759031 | 2026-10-18T00:13:00.636Z | optimize | Speed: fs.rm 1 files: 11.84× baseline (commit); Scaling: diff_commits: depth exponent 0.569; Counters: oneshot_mount_exec.vm_steps: depth exponent 0.971; Directory share: 0.565; Range growth: 2.6 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 326 ms for 25.9 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-009.a1.json`
- trace `~/lfs-history/runs/p2-main-b/trace/range-009.a1.jsonl` · runner log `~/lfs-history/runs/p2-main-b/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-009.json`
