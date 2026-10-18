# Range 008 · **watch** · attempt 1

**Matches git ✓** · daemon `c25119ace6ae` · image `d3773b4e` · plan v2 · continued from r007 (live Store)
dsh `5a450af73`..`cbc9c2636` · **62 commits** (17 mainline, 45 side) · 2026-07-04 → 2026-07-06
Areas changed: `examples/acp-agent` 32% · `docs/rfc` 18% · `packages/core` 12% · other 39%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **6.2 MiB** (+508.3 KiB) | **28.0 MiB** (+7.2 MiB) live | **4.53×** (prev 3.65×) | **4.4 MiB** | **742** (total 5,928) | **20.4 s** tooling (total 2.7 min) |

**Checks:** 7 pass · 5 watch: Speed fs.rm 1 files: 9.69× baseline (commit); Scaling insufficient same-binary points: 2 of 3 (daemon c25119ace6ae); Counters insufficient same-binary points: 2 of 3 (daemon c25119ace6ae); Directory share 0.556; Range growth 4.4 MiB; median not judged: 1 of 3 earlier ranges
**Moved most:** ▲ stored added +35% · ▲ fs.write p95 +34% · ▲ metadata added +33%
**Budget:** 9 of 202 ranges · projected total 1.0 h (budget 6.7 h) · disk 40% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **390 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 1,362 / 1,362 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,504 calls** · **200 steps** by **8 agents + lead** on **3 Branches + main** · **104 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +64 added · 677 modified · −27 deleted · 9.5 MiB written · fs 696 : Sandbox 72 (**10 : 1**, target ~9 : 1)
**Execs:** 210 (JS 57 · shell 153) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 962 | 700 | 262 | Committed 700 · Text 35 · NoSuchPath 12 · Equal 2 |
| sandbox | 520 | 311 | 0 | commit 101 (Committed 45, UpToDate 55, Conflict 1) · exec 210 (exit:0 210) · mount 104 (Mounted 104) · service 1 (Ready 1) · unmount 104 (Unmounted 104) |
| branch | 18 | 15 | 3 | diff_commits 3 · fork 10 (Forked 10) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,504** | **1,026** | **269** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r008-1-docs-rfc | a01 a02 a03 | 62 | 235 | ✓ | — |
| r008-2-examples-acp-agent | a04 a05 | 62 | 236 | ✓ | — |
| r008-3-packages-core | a06 a07 a08 | 70 | 237 | ✓ | — |
| main | lead | 6 | 34 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r008-2, a05 after a04 | 0.2 s |
| Stale clean merge | 1 / 1 | r008-2, a04 a05 | merged cleanly |
| Decoy edit | 1 / 1 | r008-2, a04 a05 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r008-1 | 23 | 10 | 13 | 0 | 0 | 152 | — |
| a02 | r008-1 | 20 | 10 | 10 | 0 | 0 | 26 | — |
| a03 | r008-1 | 19 | 11 | 8 | 0 | 0 | 57 | — |
| a04 | r008-2 | 32 | 16 | 16 | 0 | 0 | 159 | commit-conflict, stale-clean-merge, decoy |
| a05 | r008-2 | 30 | 12 | 18 | 0 | 0 | 77 | commit-conflict, stale-clean-merge, decoy |
| a06 | r008-3 | 18 | 8 | 10 | 0 | 0 | 97 | — |
| a07 | r008-3 | 32 | 15 | 17 | 0 | 0 | 84 | — |
| a08 | r008-3 | 20 | 9 | 11 | 0 | 0 | 56 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 34 | — |
| **Total** |  | **200** | **92** | **103** | **5** | **0** | **742** | **3** |

## 3. Storage

|  | Previous (r007) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 5.7 MiB (5.7 MiB / 0.0 KiB / 0.0 KiB) | 6.2 MiB (6.2 MiB / 0.0 KiB / 0.0 KiB) | +508.3 KiB |
| Files / directories / symlinks | 798 / 267 / 6 | 835 / 270 / 6 | +37 / +3 / +0 |
| Largest file / largest directory | 188.9 KiB / 34 entries | 226.2 KiB (`pnpm-lock.yaml`) / 34 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, live: file + WAL) | 20.7 MiB | 28.0 MiB | +7.2 MiB |
| **Space amplification** | 3.65× | 4.53× | 0.88 |
| Content amplification | 2.10× | 2.24× | — |
| Compression | 7.35× | 7.42× | — |
| Metadata share | 0.74 | 0.63 | this range 0.56 |
| **Stored per byte changed** | — | **1.00 bytes** | 0.53× the median range |
| History: Commits / Layers / Branches | 5,186 | 5,928 / 8 / 41 | +742 |
| Projection at range 202 / disk budget | — | 48.52 GiB / 40% | — |
| Snapshot | — | none this range | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +1,574 | — | 0 (derived) | 93% |
| Chunks (large files) | — (at snapshots) | +1,720 | — | — | 1% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 2,068 (with inodes, pooled) | — | — | 87% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +0 | — | — | — |

Delta: 3.0% at depth cap · 41% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.9 MiB · metadata 2.4 MiB · tracked 4.4 MiB changed in git

## 4. Speed

Daemon `c25119ace6ae` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 17.2 ms / 236 ms (1.41×) | 5.1 ms / 6.6 ms (1.13×) | 6.4 ms / 11.3 ms (1.16×) | 18.2 ms / 136 ms (1.41×) | 14.1 ms / 100 ms (1.15×) | 254 ms / 254 ms (2.14×) | — (native comparison in P3; exec 42.6 ms / 83.2 ms) |
| SQL p50: 1,197 stmts | 219 stmts | 361 stmts | 203 stmts | 64 stmts | 8,246 stmts | — |

**Commit cost:** 41.30 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 175 ms p50 over 104
**Slowest:** fs.write 582 ms (7,463 bytes) · fs.write 487 ms (4,660 bytes) · sandbox.exec 485 ms · checkpoint diff_commits 0.09 ms and 7.11 statements per entry (404 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 578 MB (+53 MB) over 9 of 9 Sandboxes · 147 open files · WAL 4.0 MiB (live)

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

- Played with concurrent work declared (AGENTS.md §3.5): the fixer building F-020 in its own worktree (`layerfs-f020`, own Cargo target) and the builder editing `dsh/tools/` in this checkout. Speed points of this range are read against that load first (D1.1).
- Watch: `fs.rm` of 1 file at 9.69× the P2 baseline (commit phase); scaling and counters need 3 same-binary points (2 now); directory share 0.56.
- Action: continue.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1362/1362; conflicts 3/3; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.rm 1 files: 9.69× baseline (commit) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon c25119ace6ae) | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon c25119ace6ae) | < 0.05 | watch |
| Directory share | 0.556 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.03 (budget 0.4068) | < 0.1 | pass |
| Range growth | 4.4 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.4 | < 0.8 | pass |
| Wall projection | 0.15 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 200 | 201 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 742 | 744 |
| Workspaces (one-shot share) | 104 (0.98) | 102 (0.98) |
| Reads | 259 | 259 |
| Reconcile writes | 32 | 32 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `c25119ace6ae` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries | 2 | 19.15 | 19.15 | 19.15 | 30.59 | 2.07× | 2.07× | — | — | 942 / 27,849 / 0 | — | 0.1041 ms per entrie | — |
| branch.fork | — | 6 | 2.14 | 3.46 | 3.46 | 3.62 | 0.80× | 1.20× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | >64 entries | 3 | 253.63 | 253.63 | 253.63 | 325.69 | 2.14× | 2.14× | — | — | 8,246 / 133,256 / 593 | — | 2.062 ms per entrie | branch.merge |
| branch.publish | — | 1 | 6.66 | 6.66 | 6.66 | 6.66 | 1.33× | 1.33× | — | — | 759 / 19,715 / 0 | — | — | — |
| fs.apply | ≤64 KiB | 4 | 18.94 | 39.39 | 39.39 | 40.39 | 1.49× | 0.85× | — | — | 1,971 / 60,604 / 1,370 | — | 0.0014 ms per byte | commit |
| fs.apply | ≤8 KiB | 4 | 71.08 | 73.36 | 73.36 | 197.72 | 5.59× | 4.06× | — | — | 2,115 / 83,815 / 2,500 | — | 0.0169 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 21 | 6.73 | 12.16 | 12.16 | 12.27 | 1.20× | 1.60× | — | — | 370 / 12,855 / 0 | — | 0.0236 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 20 | 7.63 | 9.20 | 9.20 | 13.75 | 1.12× | 1.12× | — | — | 378 / 11,864 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 7 | 5.33 | 6.38 | 6.38 | 6.61 | 0.78× | 0.88× | — | — | 339 / 12,066 / 0 | — | 0.0011 ms per byte | sdk.read |
| fs.glob | 1 files | 3 | 5.59 | 5.59 | 5.59 | 29.03 | 1.24× | 1.08× | — | — | 306 / 8,760 / 0 | — | 5.591 ms per file | — |
| fs.glob | 17–64 files | 5 | 7.06 | 7.26 | 7.26 | 7.63 | 1.32× | 1.01× | — | — | 303 / 12,299 / 0 | — | 0.3413 ms per file | — |
| fs.glob | 2–4 files | 9 | 5.77 | 6.71 | 6.71 | 11.84 | 1.45× | 1.18× | — | — | 180 / 7,501 / 0 | — | 1.6763 ms per file | — |
| fs.glob | 5–16 files | 13 | 5.54 | 8.31 | 8.31 | 9.00 | 1.24× | 1.44× | — | — | 290 / 11,870 / 0 | — | 0.518 ms per file | — |
| fs.glob | >64 files | 16 | 8.85 | 22.30 | 22.30 | 27.08 | 0.87× | 1.13× | — | — | 609 / 26,027 / 0 | — | 0.0587 ms per file | — |
| fs.grep | 1 files | 1 | 5.61 | 5.61 | 5.61 | 5.61 | 1.21× | 1.21× | — | — | 378 / 7,970 / 0 | — | 5.608 ms per file | sdk.lines |
| fs.grep | 17–64 files | 8 | 11.92 | 16.27 | 16.27 | 19.80 | 1.08× | 1.16× | — | — | 876 / 20,993 / 60 | — | 0.4838 ms per file | sdk.lines |
| fs.grep | 2–4 files | 10 | 5.78 | 7.83 | 7.83 | 79.61 | 1.04× | 1.21× | — | — | 338 / 9,392 / 0 | — | 1.928 ms per file | sdk.lines |
| fs.grep | 5–16 files | 13 | 8.75 | 10.96 | 10.96 | 12.94 | 1.43× | 1.26× | — | — | 564 / 13,366 / 0 | — | 0.875 ms per file | sdk.lines |
| fs.grep | >64 files | 14 | 16.47 | 44.35 | 44.35 | 51.28 | 1.41× | 2.99× | — | — | 1,380 / 31,220 / 0 | — | 0.0844 ms per file | sdk.lines |
| fs.list | 1 entries | 3 | 4.75 | 4.75 | 4.75 | 5.21 | 1.12× | 1.12× | — | — | 216 / 6,984 / 0 | — | 4.748 ms per entrie | — |
| fs.list | 17–64 entries | 9 | 11.19 | 12.93 | 12.93 | 14.39 | 1.17× | 1.12× | — | — | 683 / 29,225 / 0 | — | 0.4961 ms per entrie | — |
| fs.list | 2–4 entries | 12 | 5.50 | 6.43 | 6.43 | 7.24 | 1.18× | 1.02× | — | — | 252 / 9,663 / 0 | — | 1.4363 ms per entrie | — |
| fs.list | 5–16 entries | 15 | 6.46 | 9.08 | 9.08 | 9.50 | 1.16× | 1.12× | — | — | 375 / 14,330 / 0 | — | 1.013 ms per entrie | — |
| fs.read | ≤64 KiB | 4 | 4.64 | 5.11 | 5.11 | 5.51 | 0.88× | 0.96× | — | — | 189 / 7,055 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 32 | 5.12 | 6.63 | 6.87 | 6.94 | 1.13× | 1.02× | — | — | 219 / 6,630 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.rm | 1 files | 26 | 29.65 | 180.75 | 356.59 | 362.14 | 2.69× | 9.69× | — | — | 1,628 / 60,874 / 1,332 | — | 29.653 ms per file | commit |
| fs.stat | ≤1 KiB | 1 | 3.84 | 3.84 | 3.84 | 3.84 | 0.88× | 0.84× | — | — | 75 / 2,347 / 0 | — | 0.0043 ms per byte | — |
| fs.stat | ≤512 KiB | 2 | 4.63 | 4.63 | 4.63 | 4.89 | 0.06× | 0.06× | — | — | 183 / 7,019 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB | 17 | 4.52 | 6.01 | 6.01 | 6.47 | 1.03× | 1.03× | — | — | 150 / 5,645 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB | 13 | 4.98 | 5.54 | 5.54 | 98.03 | 1.19× | 0.88× | — | — | 201 / 6,316 / 0 | — | 0.0011 ms per byte | — |
| fs.write | ≤1 KiB | 18 | 20.60 | 113.88 | 113.88 | 222.12 | 1.96× | 3.85× | — | — | 1,216 / 50,847 / 1,232 | — | 0.043 ms per byte | commit |
| fs.write | ≤512 KiB | 11 | 21.21 | 136.68 | 136.68 | 178.22 | 1.41× | 9.06× | — | — | 1,317 / 52,313 / 1,288 | — | 0.0003 ms per byte | commit |
| fs.write | ≤64 KiB | 301 | 17.29 | 258.21 | 354.17 | 374.58 | 1.33× | 3.02× | — | — | 1,240 / 45,562 / 1,281 | — | 0.0011 ms per byte | commit |
| fs.write | ≤8 KiB | 332 | 16.71 | 224.06 | 355.55 | 581.84 | 1.41× | 2.77× | — | — | 1,144 / 44,415 / 1,280 | — | 0.0045 ms per byte | commit |
| operator.store.stats | — | 1 | 2.31 | 2.31 | 2.31 | 2.31 | 0.93× | 0.93× | — | — | — | — | — | — |
| sandbox.commit | 0 files | 55 | 13.20 | 81.44 | 101.50 | 108.20 | 1.41× | 2.02× | — | — | 122 / 10,441 / 576 | — | — | commit |
| sandbox.commit | 1 files | 34 | 58.77 | 143.42 | 166.07 | 183.95 | 1.90× | 1.62× | — | — | 1,039 / 33,469 / 575 | — | 58.775 ms per file | commit |
| sandbox.commit | 2–4 files | 9 | 19.68 | 87.41 | 87.41 | 186.63 | 0.47× | 1.33× | — | — | 515 / 20,519 / 580 | — | 7.3925 ms per file | commit |
| sandbox.commit | 5–16 files | 2 | 57.76 | 57.76 | 57.76 | 147.94 | 2.07× | 2.07× | — | — | 968 / 33,106 / 562 | — | 9.6268 ms per file | commit |
| sandbox.exec | 1 files | 120 | 39.89 | 69.49 | 79.27 | 102.63 | 1.14× | 1.14× | — | — | 0 / 0 / 0 | 4.70 | 39.887 ms per file | — |
| sandbox.exec | 17–64 files | 4 | 78.40 | 78.55 | 78.55 | 127.66 | 0.99× | 0.86× | — | — | 0 / 0 / 0 | 97 | 3.9202 ms per file | — |
| sandbox.exec | 2–4 files | 57 | 48.78 | 81.94 | 90.53 | 90.99 | 1.25× | 1.18× | — | — | 0 / 0 / 0 | 10 | 19.3347 ms per file | — |
| sandbox.exec | 5–16 files | 25 | 67.24 | 94.32 | 100.84 | 127.76 | 1.06× | 1.23× | — | — | 0 / 0 / 0 | 25 | 6.724 ms per file | — |
| sandbox.exec | — | 2 | 459.68 | 459.68 | 459.68 | 484.53 | 1.54× | 1.54× | — | — | 0 / 0 / 0 | 1,715 | — | — |
| sandbox.mount | — | 102 | 14.11 | 100.15 | 125.42 | 150.85 | 1.15× | 2.14× | — | — | 64 / 2,075 / 60 | — | — | sandbox.mount.attach |
| sandbox.service | — | 1 | 271.80 | 271.80 | 271.80 | 271.80 | 1.19× | 1.19× | — | — | — | — | — | — |
| sandbox.unmount | — | 102 | 6.13 | 9.39 | 14.25 | 37.31 | 0.99× | 1.10× | — | — | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 101.3 KiB | 405 | ok 3 |
| branch.fork | branch | 10 | 0.0 KiB | 0.0 KiB | 0 | Forked 10 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.1 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 12 | 69.3 KiB | 0.0 KiB | 14 | Committed 12 |
| fs.diff_files | fs | 49 | 0.0 KiB | 517.4 KiB | 37 | Text 35, NoSuchPath 12, Equal 2 |
| fs.glob | fs | 48 | 0.0 KiB | 34.7 KiB | 513 | ok 48 |
| fs.grep | fs | 48 | 0.0 KiB | 168.0 KiB | 572 | ok 48 |
| fs.list | fs | 43 | 0.0 KiB | 52.8 KiB | 416 | ok 43 |
| fs.read | fs | 37 | 0.0 KiB | 175.9 KiB | 37 | ok 37 |
| fs.rm | fs | 26 | 0.0 KiB | 0.0 KiB | 26 | Committed 26 |
| fs.stat | fs | 37 | 0.0 KiB | 8.1 KiB | 37 | ok 37 |
| fs.write | fs | 662 | 8.5 MiB | 0.0 KiB | 662 | Committed 662 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 101 | 0.0 KiB | 0.0 KiB | 0 | Committed 45, UpToDate 55, Conflict 1 |
| sandbox.exec | sandbox | 210 | 1.3 MiB | 61.4 KiB | 0 | exit:0 210 |
| sandbox.mount | sandbox | 104 | 0.0 KiB | 0.0 KiB | 0 | Mounted 104 |
| sandbox.service | sandbox | 1 | 0.0 KiB | 0.0 KiB | 0 | Ready 1 |
| sandbox.unmount | sandbox | 104 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 104 |

### C. Scale probes

Binary: daemon `c25119ace6ae`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 5.381 | statements 69, vm_steps 3149, fullscan_steps 0, sorts 0, returned_rows 326 |
| read | 3.934 | statements 72, vm_steps 3167, fullscan_steps 0, sorts 0, returned_rows 327 |
| list_small | 5.579 | statements 162, vm_steps 8247, fullscan_steps 0, sorts 0, returned_rows 862 |
| list_largest | 15.243 | statements 909, vm_steps 38009, fullscan_steps 0, sorts 0, returned_rows 4130 |
| grep_scoped | 5.076 | statements 105, vm_steps 4273, fullscan_steps 0, sorts 0, returned_rows 439 |
| glob_scoped | 4.449 | statements 90, vm_steps 4183, fullscan_steps 0, sorts 0, returned_rows 434 |
| grep_tree | 286.086 | statements 27486, vm_steps 506278, fullscan_steps 0, sorts 0, returned_rows 44376 |
| glob_tree | 20.68 | statements 1188, vm_steps 54474, fullscan_steps 0, sorts 0, returned_rows 5471 |
| diff_files | 7.679 | statements 144, vm_steps 6328, fullscan_steps 0, sorts 0, returned_rows 654 |
| list_commits | 4.063 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 4.185 | statements 93, vm_steps 2934, fullscan_steps 0, sorts 0, returned_rows 304 |
| fork | 2.709 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 41.806 | statements 1019, vm_steps 58678, fullscan_steps 1905, sorts 7, returned_rows 4406 |
| oneshot_mount_exec | 59.655 | statements 87, vm_steps 2337, fullscan_steps 60, sorts 2, returned_rows 215 |
| oneshot_commit | 74.87 | statements 308, vm_steps 20742, fullscan_steps 655, sorts 3, returned_rows 1579 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 20.4 s** (tooling): play 16.9 · consolidate 1.0 · verify 1.1 · probes 0.6 · tests 0.0 · seal + snapshot 0.0 · report 0.8

20.41 s tooling: prepare 2.50 · play 14.41 · consolidate 1.00 · verify 0.63 (diff_commits) · version walk 0.48 · probes 0.60 · metrics 0.23 · Store allocation 0.28

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | c25119ace6ae9a10d6e67618b114c031676e5065680db4e47ab0beb3a1759031 | 2026-10-18T00:12:42.340Z | watch | Speed: fs.rm 1 files: 9.69× baseline (commit); Scaling: insufficient same-binary points: 2 of 3 (daemon c25119ace6ae); Counters: insufficient same-binary points: 2 of 3 (daemon c25119ace6ae); Directory share: 0.556; Range growth: 4.4 MiB; median not judged: 1 of 3 earlier ranges |

### G. Evidence

- `~/lfs-history/metrics/range-008.a1.json`
- trace `~/lfs-history/runs/p2-main-b/trace/range-008.a1.jsonl` · runner log `~/lfs-history/runs/p2-main-b/play.log`
