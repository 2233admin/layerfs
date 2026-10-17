# Range 006 · **watch** · attempt 1

**Matches git ✓** · daemon `361bb09e1d94` · image `d3773b4e` · plan v2 · continued from r005 (live Store)
dsh `490fe002a`..`ff21a788e` · **65 commits** (12 mainline, 53 side) · 2026-07-02 → 2026-07-04
Areas changed: `packages/core` 19% · `examples/acp-agent` 14% · `/` 12% · other 56%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **4.8 MiB** (+516.6 KiB) | **22.2 MiB** (+6.1 MiB) live | **4.63×** (prev 3.74×) | **2.9 MiB** | **521** (total 4,649) | **13.0 s** tooling (total 2.0 min) |

**Checks:** 7 pass · 5 watch: Speed fs.grep 5–16 files: 15.55× baseline (sdk.lines); Scaling insufficient same-binary points: 2 of 3 (daemon 361bb09e1d94); Counters insufficient same-binary points: 2 of 3 (daemon 361bb09e1d94); Directory share 0.549; Range growth 2.9 MiB; median not judged: 1 of 3 earlier ranges
**Moved most:** ▲ sandbox.commit p95 +128% · ▲ probe list_small +125% · ▲ sandbox.mount p95 +99%
**Budget:** 7 of 202 ranges · projected total 0.9 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **181 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 1,070 / 1,070 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,198 calls** · **186 steps** by **8 agents + lead** on **3 Branches + main** · **91 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +53 added · 478 modified · −1 deleted · 8.1 MiB written · fs 486 : Sandbox 46 (**11 : 1**, target ~9 : 1)
**Execs:** 168 (JS 55 · shell 113) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 738 | 490 | 248 | Committed 490 · Text 32 · NoSuchPath 5 |
| sandbox | 439 | 256 | 0 | commit 88 (UpToDate 53, Committed 34, Conflict 1) · exec 168 (exit:0 168) · mount 91 (Mounted 91) · service 1 (Ready 1) · unmount 91 (Unmounted 91) |
| branch | 17 | 15 | 2 | diff_commits 2 · fork 10 (Forked 10) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,198** | **761** | **254** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r006-1-packages-core | a01 a02 a03 | 59 | 159 | ✓ | — |
| r006-2-docs-rfc | a04 a05 a06 | 74 | 161 | ✓ | — |
| r006-3-packages-fs | a07 a08 | 47 | 155 | ✓ | — |
| main | lead | 6 | 46 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r006-1, a01 after a02 | 0.1 s |
| Stale clean merge | 1 / 1 | r006-1, a01 a03 | merged cleanly |
| Decoy edit | 1 / 1 | r006-1, a02 a01 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r006-1 | 21 | 8 | 13 | 0 | 0 | 61 | commit-conflict, stale-clean-merge, decoy |
| a02 | r006-1 | 20 | 9 | 11 | 0 | 0 | 58 | commit-conflict, decoy |
| a03 | r006-1 | 18 | 9 | 9 | 0 | 0 | 40 | stale-clean-merge |
| a04 | r006-2 | 29 | 15 | 14 | 0 | 0 | 82 | — |
| a05 | r006-2 | 21 | 10 | 11 | 0 | 0 | 26 | — |
| a06 | r006-2 | 24 | 12 | 12 | 0 | 0 | 53 | — |
| a07 | r006-3 | 24 | 12 | 12 | 0 | 0 | 82 | — |
| a08 | r006-3 | 23 | 15 | 8 | 0 | 0 | 73 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 46 | — |
| **Total** |  | **186** | **91** | **90** | **5** | **0** | **521** | **3** |

## 3. Storage

|  | Previous (r005) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 4.3 MiB (4.3 MiB / 0.0 KiB / 0.0 KiB) | 4.8 MiB (4.8 MiB / 0.0 KiB / 0.0 KiB) | +516.6 KiB |
| Files / directories / symlinks | 648 / 221 / 6 | 700 / 229 / 6 | +52 / +8 / +0 |
| Largest file / largest directory | 185.7 KiB / 27 entries | 186.3 KiB (`pnpm-lock.yaml`) / 29 entries (`.`) | — |
| **Store on disk** (allocated, live: file + WAL) | 16.1 MiB | 22.2 MiB | +6.1 MiB |
| **Space amplification** | 3.74× | 4.63× | 0.88 |
| Content amplification | 2.14× | 2.19× | — |
| Compression | 6.95× | 7.21× | — |
| Metadata share | 0.73 | 0.60 | this range 0.55 |
| **Stored per byte changed** | — | **1.36 bytes** | 0.69× the median range |
| History: Commits / Layers / Branches | 4,128 | 4,649 / 7 / 33 | +521 |
| Projection at range 202 / disk budget | — | 49.02 GiB / 41% | — |
| Snapshot | — | none this range | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +524 | — | 0 (derived) | 91% |
| Chunks (large files) | — (at snapshots) | +544 | — | — | 2% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 584 (with inodes, pooled) | — | — | 88% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +0 | — | — | — |

Delta: 2.4% at depth cap · 46% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.3 MiB · metadata 1.6 MiB · tracked 2.1 MiB changed in git

## 4. Speed

Daemon `361bb09e1d94` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 30.4 ms / 69.0 ms (3.05×) | 26.2 ms / 48.3 ms (6.71×) | 22.1 ms / 51.6 ms (4.55×) | 18.6 ms / 89.4 ms | 16.6 ms / 42.5 ms (1.60×) | 118 ms / 118 ms | — (native comparison in P3; exec 44.3 ms / 86.6 ms) |
| SQL p50: 505 stmts | 150 stmts | 270 stmts | 164 stmts | 64 stmts | 5,098 stmts | — |

**Commit cost:** 33.21 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 142 ms p50 over 91
**Slowest:** sandbox.exec 348 ms · sandbox.exec 248 ms · fs.write 243 ms (471 bytes) · checkpoint diff_commits 0.10 ms and 8.85 statements per entry (195 entries in 1 pages)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 436 MB (+30 MB) over 9 of 9 Sandboxes · 126 open files · WAL 4.0 MiB (live)

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

- Watch: `fs.grep` 5–16 files at 15.55× baseline (`sdk.lines`), the same pattern as range 5's `fs.read`; scaling and counters not judged (2 of 3 points); directory share 0.55.
- No snapshot due (P2 cadence, SPEC §7); checkpoint by `diff_commits` of the changed paths.
- Action: continue.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1070/1070; conflicts 3/3; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.grep 5–16 files: 15.55× baseline (sdk.lines) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 361bb09e1d94) | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 361bb09e1d94) | < 0.05 | watch |
| Directory share | 0.549 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.0242 (budget 0.4605) | < 0.1 | pass |
| Range growth | 2.9 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.13 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 186 | 187 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 521 | 523 |
| Workspaces (one-shot share) | 91 (0.98) | 89 (0.978) |
| Reads | 234 | 234 |
| Reconcile writes | 44 | 44 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `361bb09e1d94` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries | 1 | 19.05 | 19.05 | 19.05 | 19.05 | 1.81× | 1.81× | — | — | 1,725 / 29,194 / 0 | — | 0.0977 ms per entrie | — |
| branch.fork | — | 6 | 1.91 | 3.04 | 3.04 | 3.57 | 0.75× | 0.95× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries | 2 | 3.59 | 3.59 | 3.59 | 180.12 | no baseline | no baseline | — | — | 348 / 8,710 / 0 | — | 0.0717 ms per entrie | branch.merge |
| branch.merge | >64 entries | 1 | 118.31 | 118.31 | 118.31 | 118.31 | no baseline | no baseline | — | — | 5,098 / 87,367 / 510 | — | 1.6432 ms per entrie | branch.merge |
| branch.publish | — | 1 | 4.90 | 4.90 | 4.90 | 4.90 | 0.76× | 0.76× | — | — | 538 / 13,969 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 3 | 32.71 | 32.71 | 32.71 | 38.34 | 3.59× | 3.43× | — | — | 530 / 21,154 / 527 | — | 0.1398 ms per byte | commit |
| fs.apply | ≤64 KiB | 8 | 33.64 | 45.88 | 45.88 | 132.42 | 3.45× | 4.00× | — | — | 483 / 17,227 / 527 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤8 KiB | 6 | 19.90 | 35.83 | 35.83 | 47.19 | 2.16× | 3.09× | — | — | 483 / 17,810 / 558 | — | 0.0044 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 12 | 19.27 | 40.02 | 40.02 | 42.16 | 3.91× | 6.27× | — | — | 186 / 6,672 / 0 | — | 0.0736 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 21 | 21.13 | 46.72 | 46.72 | 74.51 | 3.21× | 6.14× | — | — | 303 / 9,307 / 0 | — | 0.0009 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 3 | 27.63 | 27.63 | 27.63 | 33.72 | 5.49× | 4.67× | — | — | 288 / 8,733 / 0 | — | 0.0034 ms per byte | sdk.read |
| fs.glob | 1 files | 3 | 13.98 | 13.98 | 13.98 | 13.99 | 3.71× | 3.46× | — | — | 90 / 4,324 / 0 | — | 13.976 ms per file | — |
| fs.glob | 17–64 files | 3 | 14.71 | 14.71 | 14.71 | 28.15 | 2.55× | 2.52× | — | — | 207 / 9,781 / 0 | — | 0.7597 ms per file | — |
| fs.glob | 2–4 files | 15 | 26.06 | 41.54 | 41.54 | 66.14 | 7.08× | 9.94× | — | — | 153 / 5,401 / 0 | — | 11.227 ms per file | — |
| fs.glob | 5–16 files | 10 | 11.43 | 45.41 | 45.41 | 107.20 | 2.79× | 9.37× | — | — | 177 / 5,533 / 0 | — | 1.9045 ms per file | — |
| fs.glob | >64 files | 4 | 47.40 | 52.94 | 52.94 | 106.28 | 4.82× | 2.66× | — | — | 390 / 14,287 / 0 | — | 0.1598 ms per file | — |
| fs.grep | 1 files | 5 | 12.16 | 17.81 | 17.81 | 31.02 | 2.94× | 4.25× | — | — | 168 / 4,889 / 0 | — | 12.162 ms per file | sdk.lines |
| fs.grep | 17–64 files | 5 | 38.01 | 48.49 | 48.49 | 48.63 | 3.93× | 4.68× | — | — | 498 / 11,799 / 0 | — | 1.5839 ms per file | sdk.lines |
| fs.grep | 2–4 files | 6 | 15.43 | 26.33 | 26.33 | 38.96 | 3.61× | 4.58× | — | — | 225 / 6,568 / 0 | — | 6.287 ms per file | sdk.lines |
| fs.grep | 5–16 files | 19 | 32.12 | 94.28 | 94.28 | 98.15 | 6.22× | 15.55× | — | — | 333 / 7,766 / 0 | — | 3.8516 ms per file | sdk.lines |
| fs.grep | >64 files | 7 | 34.91 | 60.81 | 60.81 | 68.45 | 3.15× | 4.62× | — | — | 897 / 23,355 / 0 | — | 0.2272 ms per file | sdk.lines |
| fs.list | 1 entries | 3 | 14.35 | 14.35 | 14.35 | 34.33 | 3.76× | 3.76× | — | — | 99 / 4,443 / 0 | — | 14.346 ms per entrie | — |
| fs.list | 17–64 entries | 4 | 37.82 | 45.34 | 45.34 | 51.64 | 4.03× | 4.54× | — | — | 699 / 27,503 / 0 | — | 1.3042 ms per entrie | — |
| fs.list | 2–4 entries | 8 | 15.31 | 53.14 | 53.14 | 62.21 | 4.01× | 10.17× | — | — | 201 / 7,233 / 0 | — | 3.8272 ms per entrie | — |
| fs.list | 5–16 entries | 20 | 22.09 | 42.92 | 42.92 | 45.84 | 4.55× | 6.99× | — | — | 282 / 12,643 / 0 | — | 2.1312 ms per entrie | — |
| fs.read | ≤1 KiB | 1 | 29.31 | 29.31 | 29.31 | 29.31 | 7.89× | 7.89× | — | — | 99 / 2,864 / 0 | — | 0.0425 ms per byte | sdk.lines |
| fs.read | ≤64 KiB | 2 | 10.48 | 10.48 | 10.48 | 15.06 | 2.33× | 2.33× | — | — | 165 / 7,120 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 42 | 26.17 | 48.30 | 105.56 | 125.36 | 6.71× | 9.93× | — | — | 147 / 4,919 / 0 | — | 0.006 ms per byte | sdk.lines |
| fs.rm | 1 files | 1 | 35.79 | 35.79 | 35.79 | 35.79 | 4.06× | 3.25× | — | — | 493 / 17,862 / 551 | — | 35.789 ms per file | commit |
| fs.stat | ≤1 KiB | 2 | 26.22 | 26.22 | 26.22 | 36.43 | 7.68× | 6.43× | — | — | 57 / 2,116 / 0 | — | 0.0657 ms per byte | — |
| fs.stat | ≤64 KiB | 20 | 15.89 | 35.37 | 35.37 | 39.35 | 4.49× | 8.41× | — | — | 126 / 4,794 / 0 | — | 0.001 ms per byte | — |
| fs.stat | ≤8 KiB | 19 | 11.32 | 42.14 | 42.14 | 44.69 | 3.14× | 10.43× | — | — | 123 / 4,525 / 0 | — | 0.0025 ms per byte | — |
| fs.write | ≤1 KiB | 25 | 37.83 | 52.20 | 242.29 | 242.65 | 4.76× | 5.24× | — | — | 391 / 16,396 / 546 | — | 0.0699 ms per byte | commit |
| fs.write | ≤512 KiB | 4 | 27.52 | 32.32 | 32.32 | 39.55 | 2.07× | 2.41× | — | — | 413 / 18,052 / 543 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB | 269 | 29.86 | 69.01 | 109.56 | 124.29 | 3.05× | 5.37× | — | — | 538 / 17,594 / 548 | — | 0.0015 ms per byte | commit |
| fs.write | ≤8 KiB | 170 | 29.14 | 65.94 | 123.30 | 169.48 | 3.33× | 6.24× | — | — | 475 / 17,277 / 549 | — | 0.0051 ms per byte | commit |
| operator.store.stats | — | 1 | 1.99 | 1.99 | 1.99 | 1.99 | 0.91× | 0.91× | — | — | — | — | — | — |
| sandbox.commit | 0 files | 53 | 12.80 | 71.27 | 82.22 | 84.51 | no baseline | no baseline | — | — | 83 / 9,044 / 485 | — | — | commit |
| sandbox.commit | 1 files | 26 | 36.69 | 97.23 | 136.85 | 216.34 | 3.26× | 8.65× | — | — | 828 / 27,032 / 485 | — | 36.687 ms per file | commit |
| sandbox.commit | 2–4 files | 7 | 19.02 | 29.05 | 29.05 | 100.74 | no baseline | no baseline | — | — | 644 / 20,372 / 492 | — | 8.3395 ms per file | commit |
| sandbox.commit | 5–16 files | 1 | 37.95 | 37.95 | 37.95 | 37.95 | no baseline | no baseline | — | — | 757 / 22,023 / 485 | — | 6.3257 ms per file | commit |
| sandbox.exec | 1 files | 90 | 39.17 | 64.92 | 95.06 | 108.64 | 0.87× | 1.41× | — | — | 0 / 0 / 0 | 5 | 39.166 ms per file | — |
| sandbox.exec | 17–64 files | 2 | 78.65 | 78.65 | 78.65 | 101.20 | no baseline | no baseline | — | — | 0 / 0 / 0 | 83 | 4.3696 ms per file | — |
| sandbox.exec | 2–4 files | 50 | 52.15 | 79.94 | 86.56 | 114.86 | no baseline | no baseline | — | — | 0 / 0 / 0 | 9.30 | 23.1565 ms per file | — |
| sandbox.exec | 5–16 files | 22 | 73.01 | 84.47 | 89.61 | 98.89 | no baseline | no baseline | — | — | 0 / 0 / 0 | 35 | 9.8895 ms per file | — |
| sandbox.exec | — | 2 | 247.57 | 247.57 | 247.57 | 348.35 | 0.86× | 0.86× | — | — | 0 / 0 / 0 | 830 | — | — |
| sandbox.mount | — | 89 | 16.60 | 42.53 | 87.33 | 90.70 | 1.60× | 4.05× | — | — | 64 / 1,799 / 60 | — | — | sandbox.mount.attach |
| sandbox.service | — | 1 | 235.43 | 235.43 | 235.43 | 235.43 | 0.97× | 0.97× | — | — | — | — | — | — |
| sandbox.unmount | — | 89 | 8.32 | 31.71 | 88.76 | 100.65 | 1.20× | 4.29× | — | — | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 2 | 0.0 KiB | 46.3 KiB | 196 | ok 2 |
| branch.fork | branch | 10 | 0.0 KiB | 0.0 KiB | 0 | Forked 10 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.1 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 21 | 264.5 KiB | 0.0 KiB | 23 | Committed 21 |
| fs.diff_files | fs | 37 | 0.0 KiB | 463.2 KiB | 32 | Text 32, NoSuchPath 5 |
| fs.glob | fs | 37 | 0.0 KiB | 18.5 KiB | 249 | ok 37 |
| fs.grep | fs | 44 | 0.0 KiB | 148.1 KiB | 474 | ok 44 |
| fs.list | fs | 39 | 0.0 KiB | 45.5 KiB | 360 | ok 39 |
| fs.read | fs | 46 | 0.0 KiB | 174.2 KiB | 46 | ok 46 |
| fs.rm | fs | 1 | 0.0 KiB | 0.0 KiB | 1 | Committed 1 |
| fs.stat | fs | 45 | 0.0 KiB | 9.6 KiB | 45 | ok 45 |
| fs.write | fs | 468 | 7.2 MiB | 0.0 KiB | 468 | Committed 468 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 88 | 0.0 KiB | 0.0 KiB | 0 | UpToDate 53, Committed 34, Conflict 1 |
| sandbox.exec | sandbox | 168 | 877.3 KiB | 37.3 KiB | 0 | exit:0 168 |
| sandbox.mount | sandbox | 91 | 0.0 KiB | 0.0 KiB | 0 | Mounted 91 |
| sandbox.service | sandbox | 1 | 0.0 KiB | 0.0 KiB | 0 | Ready 1 |
| sandbox.unmount | sandbox | 91 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 91 |

### C. Scale probes

Binary: daemon `361bb09e1d94`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 4.424 | statements 96, vm_steps 3437, fullscan_steps 0, sorts 0, returned_rows 344 |
| read | 3.899 | statements 99, vm_steps 3455, fullscan_steps 0, sorts 0, returned_rows 345 |
| list_small | 7.537 | statements 234, vm_steps 9015, fullscan_steps 0, sorts 0, returned_rows 910 |
| list_largest | 11.596 | statements 672, vm_steps 29601, fullscan_steps 0, sorts 0, returned_rows 2887 |
| grep_scoped | 4.434 | statements 141, vm_steps 4657, fullscan_steps 0, sorts 0, returned_rows 463 |
| glob_scoped | 4.318 | statements 126, vm_steps 4567, fullscan_steps 0, sorts 0, returned_rows 458 |
| grep_tree | 188.735 | statements 20355, vm_steps 373054, fullscan_steps 0, sorts 0, returned_rows 32205 |
| glob_tree | 13.969 | statements 708, vm_steps 40055, fullscan_steps 0, sorts 0, returned_rows 4002 |
| diff_files | 5.806 | statements 198, vm_steps 6904, fullscan_steps 0, sorts 0, returned_rows 690 |
| list_commits | 3.289 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 3.614 | statements 96, vm_steps 2810, fullscan_steps 0, sorts 0, returned_rows 328 |
| fork | 2.356 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 38.637 | statements 1010, vm_steps 53416, fullscan_steps 1656, sorts 7, returned_rows 4140 |
| oneshot_mount_exec | 62.068 | statements 57, vm_steps 1836, fullscan_steps 60, sorts 2, returned_rows 182 |
| oneshot_commit | 79.024 | statements 350, vm_steps 19372, fullscan_steps 572, sorts 3, returned_rows 1527 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 13.0 s** (tooling): play 10.1 · consolidate 0.8 · verify 0.7 · probes 0.5 · tests 0.0 · seal + snapshot 0.0 · report 0.9

12.99 s tooling: prepare 2.19 · play 7.94 · consolidate 0.81 · verify 0.34 (diff_commits) · version walk 0.37 · probes 0.48 · metrics 0.21 · Store allocation 0.28 · report 0.12

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 361bb09e1d9465ab47e93d1ae98226e62018aad71340140500bbcebb1fde41f4 | 2026-10-17T23:17:09.498Z | watch | Speed: fs.grep 5–16 files: 15.55× baseline (sdk.lines); Scaling: insufficient same-binary points: 2 of 3 (daemon 361bb09e1d94); Counters: insufficient same-binary points: 2 of 3 (daemon 361bb09e1d94); Directory share: 0.549; Range growth: 2.9 MiB; median not judged: 1 of 3 earlier ranges |

### G. Evidence

- `~/lfs-history/metrics/range-006.a1.json`
- trace `~/lfs-history/runs/p2-main/trace/range-006.a1.jsonl` · runner log `~/lfs-history/runs/p2-main/play.log`
