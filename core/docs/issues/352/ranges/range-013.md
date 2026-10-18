# Range 013 · **optimize** · attempt 1

**Matches git ✓** · daemon `6d467539f759` · image `d3773b4e` · plan v2 · continued from r012 (live Store)
dsh `32db205c1`..`b3e1a4154` · **64 commits** (1 mainline, 63 side) · 2026-07-09 → 2026-07-13
Areas changed: `packages/core` 28% · `docs/rfc` 8% · `packages/subagent` 8% · other 56%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **8.9 MiB** (+456.3 KiB) | **40.7 MiB** (+448.0 KiB) | **4.55×** (prev 4.73×) | **5.8 MiB** | **866** (total 9,385) | **21.8 s** tooling (total 4.6 min) |

**Checks:** 6 pass · 6 watch: Speed not judged: branch.diff_commits >64 entries · uncontended: baseline class has 1/3/2 calls (minimum 5 per range); 4.35× it; Counters list_largest.vm_steps per entry of the largest directory: depth exponent 0.436; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (25 classes too narrow); Directory share 0.534; Range growth 5.8 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 389 ms for 40.7 MiB new; size exponent not judged (2 snapshots) · 1 optimize/stop: Scaling
**Moved most:** ▼ sandbox.commit p95 −85% · ▼ sandbox.mount p95 −78% · ▼ fs.write p95 −65%
**Budget:** 14 of 202 ranges · projected total 1.2 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,167 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,634 / 1,634 outcomes as planned |
| Conflicts | **2 / 2 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,775 calls** · **196 steps** by **5 agents + lead** on **3 Branches + main** · **103 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +23 added · 885 modified · −2 deleted · 19.8 MiB written · fs 822 : Sandbox 88 (**9 : 1**, target ~9 : 1)
**Execs:** 235 (JS 58 · shell 177) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,212 | 826 | 386 | Committed 826 · Text 54 · NoSuchPath 12 |
| sandbox | 540 | 334 | 0 | commit 99 (UpToDate 55, Committed 43, Conflict 1) · exec 235 (exit:0 235) · mount 103 (Mounted 103) · unmount 103 (Unmounted 103) |
| branch | 19 | 16 | 3 | diff_commits 3 · fork 11 (Forked 11) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,775** | **1,176** | **393** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r013-1-packages-core | a01 a02 | 51 | 281 | ✓ | — |
| r013-2-packages-subagent | a03 a04 a05 | 75 | 286 | ✓ | — |
| r013-3-docs-rfc | a06 a07 a08 | 64 | 275 | ✓ | — |
| main | lead | 6 | 24 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r013-2, a04 after a03 | 0.1 s |
| Stale clean merge | 0 / 0 | — | — |
| Decoy edit | 1 / 1 | r013-2, a05 a03 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r013-1 | 51 | 24 | 27 | 0 | 0 | 281 | — |
| a03 | r013-2 | 70 | 32 | 38 | 0 | 0 | 285 | commit-conflict, decoy |
| a04 | r013-2 | 4 | 0 | 4 | 0 | 0 | 0 | commit-conflict |
| a05 | r013-2 | 1 | 1 | 0 | 0 | 0 | 1 | decoy |
| a06 | r013-3 | 64 | 33 | 31 | 0 | 0 | 275 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 24 | — |
| **Total** |  | **196** | **91** | **100** | **5** | **0** | **866** | **2** |

## 3. Storage

**3a. Overview**

|  | Previous (r012) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 8.5 MiB (8.5 MiB / 0.0 KiB / 0.0 KiB) | 8.9 MiB (8.9 MiB / 0.0 KiB / 0.0 KiB) | +456.3 KiB |
| Files / directories / symlinks | 1,140 / 368 / 6 | 1,161 / 371 / 6 | +21 / +3 / +0 |
| Largest file / largest directory | 244.9 KiB / 39 entries | 246.1 KiB (`pnpm-lock.yaml`) / 39 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, sealed) | 40.2 MiB | 40.7 MiB | +448.0 KiB |
| **Space amplification** (total · tracked) | 4.73× · tracked 2.48× | 4.55× · tracked 2.65× | -0.19 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **1.69** (0.38 / 0.41 / -0.66) | 0.97× the median range |
| **Stored per Commit** | 10.5 KiB | 0.5 KiB | — |
| Metadata share | 0.67 | 0.74 | this range 0.53 |
| History: Commits / Layers / Branches | 8,519 | 9,385 / 11 / 74 | +866 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 3.34 GiB (Commits 2.06 GiB · installs 1.13 GiB · build 120.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 47.29 GiB / 41% | — |
| Snapshot | — | r013, 40.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 10.7 MiB | 1.20 | +1.3 MiB |
| Metadata | 13.0 MiB | 1.45 | +1.4 MiB |
| Index rows | 8.9 MiB | 1.00 | — |
| Waste | 8.0 MiB | 0.89 | — |
| Other | 52.0 KiB | 0.01 | — |
| **Total = Store on disk** | **40.7 MiB** | **= 4.55** space amplification | +448.0 KiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 8.9 MiB | 23.7 MiB (10.7 MiB + 13.0 MiB) | 2.65× | — | 2.7 MiB | 3.4 MiB | 0.78 |
| `node_modules` | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Build output | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 16.9 MiB | — (not divided) | — | -2.3 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 22.6 KiB | — | — | — | — | — |
| **Total** | — | **40.7 MiB** | **= 4.55×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 8,508 | +1,500 | 12.4 KiB | 0 (derived) | 95% |
| Chunks (large files) | 10,043 | +1,581 | 0.6 KiB | — | 3% |
| Large-file extents | 9,798 | — | 0.1 KiB | — | — |
| Directories | 2,839 | 1,556 (with inodes, pooled) | 0.2 KiB | — | 89% |
| Inodes and attributes | 53,226 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.8% at depth cap · 30% of refused bases stopped by budget · `node_modules` reinstall: none this range

## 4. Speed

Daemon `6d467539f759` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 11.2 ms / 17.0 ms (1.17×) | 2.5 ms / 4.3 ms (1.13×) | 2.7 ms / 5.5 ms (2.02×) | 11.4 ms / 22.3 ms (1.08×) | 9.6 ms / 12.9 ms (0.95×) | 206 ms / 206 ms (1.76×) | — (native comparison in P3; exec 42.9 ms / 87.2 ms) |
| SQL p50: 962 stmts | 204 stmts | 213 stmts | 92 stmts | 57 stmts | 8,579 stmts | — |

**Commit cost:** 9.32 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 118 ms p50 over 103
**Slowest:** sandbox.exec 1319 ms · sandbox.exec 589 ms · sandbox.exec 460 ms · checkpoint diff_commits 0.09 ms and 6.65 statements per entry (249 entries per page)
**Scaling:** 13 of 15 probes flat · `grep_tree` 0.79 · `oneshot_mount_exec` 2.30

**Health:** 0 Workspaces open · 0 overlay files left · daemons 231 MB (−81 MB) over 9 of 9 Sandboxes · 121 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 013.a1 · optimize

**1. Trigger** (attempt 1, daemon `6d467539f759`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | oneshot_mount_exec: depth exponent 2.297 | < 0.15 |

Diagnosis pending: `finding-013.a1.json`.

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

- Optimize: the `oneshot_mount_exec` probe time is 50.8 → 66.8 → 78.1 ms over ranges 11–13 (depth 7,783 → 9,385), time exponent 2.30, all three on `6d467539`. Every counter is identical in all three ranges: 50 statements, 1,134 VM steps, 60 full-scan steps, 126 rows. So the growth is outside the Store's SQL: mount bind, FUSE, the exec process, or daemon state that accumulates over the run's life (121 Workspaces in range 11). It could also be runner or Docker drift. Nothing ran alongside: the builder held at the re-baseline. The fixer diagnoses 013.a1 from per-phase timing (mount, exec, commit, unmount) on the range-11 and range-13 snapshots with a fresh daemon. If a fresh daemon is flat, the cause is accumulated state.
- `list_largest` VM steps per entry, exponent 0.44, is a watch: the residual chain position F-026 noted, bounded by the delta cap. The `branch.diff_commits` 4.35× is a thin class, not judged.
- Recovery after the fix: fork p2-main-d's range-11 snapshot (range 12 has none), fast-forward 12, rerun 13 measured.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1634/1634; conflicts 2/2; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: branch.diff_commits >64 entries · uncontended: baseline class has 1/3/2 calls (minimum 5 per range); 4.35× it | ≤ 1.2× | watch |
| Scaling | oneshot_mount_exec: depth exponent 2.297 | < 0.15 | optimize |
| Counters | list_largest.vm_steps per entry of the largest directory: depth exponent 0.436 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (25 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.534 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0382 (budget 0.3033) | < 0.1 | pass |
| Range growth | 5.8 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 389 ms for 40.7 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.17 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 196 | 197 |
| Lanes / agents | 3 / 5 | 3 / 8 |
| LayerFS Commits | 866 | 868 |
| Workspaces (one-shot share) | 103 (0.99) | 100 (0.99) |
| Reads | 373 | 373 |
| Reconcile writes | 22 | 22 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `6d467539f759` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 4.01 | 4.01 | 4.01 | 4.01 | no baseline | no baseline | — | — | 201 / 10,522 / 0 | — | 0.401 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 1 | 28.64 | 28.64 | 28.64 | 28.64 | 4.35× | 4.35× | 6.02 | 8.01 | 2,334 / 45,863 / 0 | — | 0.1198 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.48 | 1.03 | 1.03 | 1.27 | 0.78× | 1.23× | -1.00 | -4.05 | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 5.13 | 5.13 | 5.13 | 5.13 | 3.32× | 3.32× | — | — | 592 / 15,054 / 0 | — | 0.0802 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 205.75 | 205.75 | 205.75 | 334.48 | 1.76× | 1.76× | -1.37 | -1.40 | 8,579 / 142,242 / 835 | — | 3.0258 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 10.65 | 10.65 | 10.65 | 10.65 | 2.56× | 2.56× | 4.20 | 7.21 | 883 / 22,939 / 0 | — | — | — |
| fs.apply | ≤64 KiB · contended | 1 | 16.11 | 16.11 | 16.11 | 16.11 | 1.38× | 0.47× | -2.77 | -5.88 | 981 / 43,999 / 855 | — | 0.0014 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 16.19 | 16.19 | 16.19 | 16.19 | 2.09× | 1.98× | — | — | 1,117 / 59,186 / 856 | — | 0.0019 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 1 | 25.30 | 25.30 | 25.30 | 25.30 | 2.19× | 0.98× | -9.97 | -22.87 | 1,258 / 62,397 / 1,708 | — | 0.0076 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 12 | 5.89 | 8.56 | 8.56 | 9.78 | 1.74× | 1.59× | 2.36 | 5.05 | 549 / 19,967 / 60 | — | 0.0219 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 12 | 4.27 | 6.07 | 6.07 | 6.24 | 1.02× | 1.01× | -1.61 | -2.96 | 276 / 9,686 / 0 | — | 0.0185 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 15 | 4.59 | 6.60 | 6.60 | 7.26 | 0.84× | 1.11× | -0.98 | -1.75 | 502 / 14,624 / 0 | — | 0.0002 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 15 | 4.99 | 6.05 | 6.05 | 6.62 | 1.06× | 1.29× | 0.00 | 2.15 | 321 / 10,886 / 0 | — | 0.0002 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 9 | 4.70 | 5.58 | 5.58 | 5.77 | 1.22× | 1.19× | -0.20 | -0.55 | 384 / 13,844 / 0 | — | 0.0008 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 2 | 3.39 | 3.39 | 3.39 | 4.33 | 0.89× | 0.89× | -1.21 | -2.51 | 279 / 8,719 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 2.70 | 2.70 | 2.70 | 2.70 | 1.19× | 1.08× | — | — | 330 / 9,050 / 0 | — | 2.701 ms per file | — |
| fs.glob | 1 files · uncontended | 6 | 2.60 | 4.61 | 4.61 | 5.91 | 1.77× | 3.15× | — | — | 186 / 6,741 / 0 | — | 2.595 ms per file | — |
| fs.glob | 17–64 files · contended | 8 | 4.16 | 5.27 | 5.27 | 6.66 | 0.92× | 1.16× | -0.35 | -0.68 | 405 / 13,837 / 0 | — | 0.1704 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 4.17 | 7.70 | 7.70 | 7.91 | 1.52× | 2.80× | — | — | 240 / 10,969 / 0 | — | 0.1946 ms per file | — |
| fs.glob | 2–4 files · contended | 8 | 2.17 | 2.42 | 2.42 | 3.13 | 0.96× | 0.71× | -0.89 | -0.14 | 192 / 7,305 / 0 | — | 0.8955 ms per file | — |
| fs.glob | 2–4 files · uncontended | 5 | 2.51 | 2.56 | 2.56 | 3.25 | 0.97× | 0.68× | — | — | 159 / 7,035 / 0 | — | 0.9745 ms per file | — |
| fs.glob | 5–16 files · contended | 7 | 2.69 | 4.29 | 4.29 | 4.30 | 1.06× | 1.19× | -1.74 | -2.60 | 307 / 11,403 / 0 | — | 0.4592 ms per file | — |
| fs.glob | 5–16 files · uncontended | 5 | 2.60 | 2.94 | 2.94 | 3.31 | 1.08× | 0.90× | -0.56 | 1.31 | 198 / 6,273 / 0 | — | 0.3679 ms per file | — |
| fs.glob | >64 files · contended | 11 | 11.28 | 39.84 | 39.84 | 156.45 | 1.39× | 4.12× | -0.03 | -1.81 | 1,013 / 39,763 / 60 | — | 0.0345 ms per file | — |
| fs.glob | >64 files · uncontended | 5 | 7.46 | 8.07 | 8.07 | 9 | 1.92× | 2.07× | 1.68 | 4.25 | 504 / 21,792 / 0 | — | 0.0391 ms per file | — |
| fs.grep | 1 files · contended | 3 | 2.76 | 2.76 | 2.76 | 3.36 | 1.19× | 1.07× | -0.19 | -1.30 | 222 / 5,914 / 0 | — | 2.758 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 2 | 2.88 | 2.88 | 2.88 | 2.94 | 1.39× | 1.39× | — | — | 183 / 5,266 / 0 | — | 2.876 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 10 | 13.52 | 16.62 | 16.62 | 16.96 | 1.36× | 1.32× | 1.03 | 0.96 | 1,348 / 38,648 / 884 | — | 0.4294 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 6 | 10.63 | 12.98 | 12.98 | 14.79 | 1.92× | 2.34× | — | — | 702 / 14,314 / 0 | — | 0.5227 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 12 | 3.82 | 4.25 | 4.25 | 5.55 | 1.15× | 0.98× | -0.69 | -0.80 | 367 / 10,561 / 0 | — | 1.9105 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 3 | 4.23 | 4.23 | 4.23 | 6.97 | 1.99× | 1.96× | 0.56 | 1.04 | 276 / 7,788 / 0 | — | 1.4165 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 9 | 7.88 | 10.81 | 10.81 | 11.87 | 1.92× | 1.52× | 1.82 | 3.64 | 778 / 24,444 / 0 | — | 0.8751 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 11 | 4.63 | 8.60 | 8.60 | 8.66 | 1.03× | 1.38× | — | — | 450 / 9,708 / 0 | — | 0.6498 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 4.85 | 4.85 | 4.85 | 5.05 | 0.47× | 0.40× | -0.61 | 0.28 | 412 / 12,834 / 0 | — | 0.0247 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 2 | 4.16 | 4.16 | 4.16 | 4.46 | 0.48× | 0.48× | -0.35 | 1.90 | 222 / 7,695 / 0 | — | 0.0218 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 4 | 2.22 | 2.79 | 2.79 | 3.32 | 1.10× | 1.38× | 0.05 | -1.25 | 269 / 9,503 / 0 | — | 2.216 ms per entrie | — |
| fs.list | 1 entries · uncontended | 3 | 1.98 | 1.98 | 1.98 | 2.15 | 1.01× | 1.01× | — | — | 135 / 5,442 / 0 | — | 1.977 ms per entrie | — |
| fs.list | 17–64 entries · contended | 10 | 3.10 | 5.49 | 5.49 | 6.19 | 1.38× | 1.83× | -0.55 | 0.08 | 320 / 20,380 / 0 | — | 0.1546 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 10 | 4.65 | 5.17 | 5.17 | 5.77 | 2.02× | 2.24× | 3.63 | 3.77 | 291 / 12,969 / 0 | — | 0.1974 ms per entrie | — |
| fs.list | 2–4 entries · contended | 11 | 2.38 | 2.67 | 2.67 | 3.08 | 1.03× | 0.68× | -0.53 | 0.05 | 192 / 7,825 / 0 | — | 1.188 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 6 | 2.29 | 2.65 | 2.65 | 3.30 | 1.45× | 1.68× | 1.24 | 2.81 | 156 / 5,711 / 0 | — | 0.7775 ms per entrie | — |
| fs.list | 5–16 entries · contended | 10 | 2.16 | 3.58 | 3.58 | 3.82 | 0.87× | 1.01× | -1.08 | -0.69 | 198 / 9,234 / 0 | — | 0.4014 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 7 | 2.66 | 2.94 | 2.94 | 3.04 | 1.36× | 1.37× | — | — | 180 / 6,105 / 0 | — | 0.4506 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 2.21 | 2.21 | 2.21 | 2.21 | 1.66× | 1.66× | — | — | 162 / 16,718 / 800 | — | 0.0029 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 5 | 2.46 | 2.60 | 2.60 | 2.72 | 1.11× | 1.17× | -1.12 | -1.84 | 192 / 6,078 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 3.14 | 3.14 | 3.14 | 3.96 | 1.11× | 1.11× | — | — | 207 / 6,110 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 22 | 2.35 | 4.30 | 4.30 | 4.51 | 0.87× | 0.84× | -0.96 | -1.01 | 282 / 8,493 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 28 | 2.56 | 3.00 | 3.60 | 9.28 | 1.13× | 0.64× | 1.97 | 3.25 | 171 / 5,234 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 1 | 9.55 | 9.55 | 9.55 | 9.55 | 1.05× | 0.57× | -4.12 | -7.06 | 334 / 23,131 / 891 | — | 9.553 ms per file | commit |
| fs.rm | 1 files · uncontended | 1 | 10.86 | 10.86 | 10.86 | 10.86 | 1.39× | 1.13× | 1.30 | 3.59 | 652 / 27,762 / 895 | — | 10.863 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 1.33 | 1.33 | 1.33 | 1.33 | 0.54× | 0.50× | — | — | 117 / 4,139 / 0 | — | 0.0033 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 1 | 1.73 | 1.73 | 1.73 | 1.73 | 0.68× | 0.68× | — | — | 114 / 4,387 / 0 | — | 0.004 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 2.73 | 2.73 | 2.73 | 2.73 | no baseline | no baseline | — | — | 425 / 12,126 / 60 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 26 | 2.14 | 2.85 | 2.99 | 4.70 | 0.83× | 0.74× | -1.49 | -1.94 | 200 / 7,440 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 24 | 1.96 | 2.35 | 2.52 | 4.89 | 0.98× | 1.18× | 2.62 | 7.04 | 126 / 4,928 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 8 | 2.17 | 3.01 | 3.01 | 5.59 | 0.99× | 0.82× | -0.38 | -0.43 | 188 / 7,684 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 2 | 1.84 | 1.84 | 1.84 | 1.90 | 0.98× | 0.82× | -0.66 | -1.13 | 129 / 4,494 / 0 | — | 0.0002 ms per byte | — |
| fs.write | ≤1 KiB · contended | 10 | 10.07 | 12.82 | 12.82 | 13.62 | 1.01× | 0.62× | -16.08 | -32.32 | 808 / 40,810 / 1,710 | — | 0.0182 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 17 | 7.36 | 11.29 | 11.29 | 11.71 | 1.16× | 1.09× | -0.06 | 0.79 | 352 / 20,307 / 866 | — | 0.0152 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 24 | 15.07 | 19.12 | 19.13 | 19.99 | 1.15× | 1.47× | -2.79 | -5.56 | 1,169 / 50,272 / 1,758 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 9 | 11.70 | 12.92 | 12.92 | 13.18 | 1.23× | 1.35× | 0.67 | 1.40 | 433 / 22,472 / 880 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 403 | 12.51 | 17.81 | 22.58 | 36.65 | 0.96× | 0.18× | -11.04 | -22.14 | 1,159 / 47,770 / 1,752 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 144 | 9.01 | 13.00 | 15.47 | 28.49 | 1.17× | 1.03× | 0.17 | 0.74 | 499 / 22,309 / 879 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 132 | 11.16 | 16.39 | 19.88 | 101.58 | 0.93× | 0.23× | -12.17 | -24.18 | 964 / 43,243 / 1,727 | — | 0.0023 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 78 | 8.00 | 13.61 | 15.50 | 15.94 | 1.13× | 1.10× | 0.15 | 0.54 | 457 / 21,662 / 880 | — | 0.0019 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.59 | 0.59 | 0.59 | 0.59 | 0.95× | 0.95× | 0.13 | 0.34 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · UpToDate · contended | 33 | 10.45 | 12.41 | 13.17 | 15.80 | 0.80× | 0.42× | -3.05 | -4.34 | 77 / 13,646 / 806 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 22 | 9.06 | 11.27 | 13.01 | 14.21 | 1.08× | 0.84× | 0.40 | 0.55 | 77 / 13,634 / 820 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 11 | 12.20 | 14.96 | 14.96 | 16.30 | 0.30× | 0.18× | -8.27 | -12.90 | 263 / 18,156 / 806 | — | 12.198 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 5 | 12.58 | 12.68 | 12.68 | 19.41 | 1.04× | 1.05× | -0.45 | -0.42 | 278 / 17,799 / 831 | — | 12.582 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 116.06 | 116.06 | 116.06 | 116.06 | 1.78× | 1.78× | -4.58 | -6.91 | 4,850 / 81,138 / 833 | — | 116.06 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 16 | 17.03 | 22.30 | 22.30 | 23.09 | 0.36× | 0.26× | -10.26 | -20.35 | 481 / 22,933 / 806 | — | 8.473 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 7 | 16.34 | 18.72 | 18.72 | 19.78 | 1.07× | 1.23× | -0.10 | -1.60 | 505 / 21,544 / 819 | — | 8.146 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 24.89 | 24.89 | 24.89 | 44.04 | 0.90× | 0.90× | -7.56 | -16.06 | 691 / 26,019 / 822 | — | 3.5556 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 25.95 | 25.95 | 25.95 | 25.95 | no baseline | no baseline | — | — | 1,215 / 37,320 / 833 | — | 5.1896 ms per file | commit |
| sandbox.exec | 1 files · contended | 51 | 40.04 | 57.03 | 63.43 | 76.91 | 0.92× | 0.86× | -0.24 | -0.13 | 0 / 0 / 0 | 5.30 | 40.044 ms per file | observe.after |
| sandbox.exec | 1 files · uncontended | 13 | 33.44 | 48.69 | 48.69 | 52.84 | 0.86× | 0.97× | -0.81 | -1.14 | 0 / 0 / 0 | 4.70 | 33.444 ms per file | observe.after |
| sandbox.exec | 17–64 files · contended | 10 | 86.36 | 101.51 | 101.51 | 108.74 | 0.95× | 0.98× | -0.17 | 0.26 | 0 / 0 / 0 | 93 | 4.4726 ms per file | observe.after |
| sandbox.exec | 2–4 files · contended | 89 | 41.23 | 68.89 | 85.79 | 86.20 | 0.88× | 0.86× | -0.57 | -0.61 | 0 / 0 / 0 | 8.50 | 18.2715 ms per file | observe.after |
| sandbox.exec | 2–4 files · uncontended | 17 | 41.27 | 53.70 | 53.70 | 57.73 | 0.93× | 0.74× | -0.73 | -1.21 | 0 / 0 / 0 | 8.50 | 16.755 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 41 | 60.62 | 87.57 | 89.43 | 91.97 | 0.84× | 0.88× | -1.78 | -2.32 | 0 / 0 / 0 | 29 | 7.2972 ms per file | observe.after |
| sandbox.exec | 5–16 files · uncontended | 9 | 45.71 | 79.53 | 79.53 | 87.20 | 0.65× | 1.13× | -3.51 | -7.07 | 0 / 0 / 0 | 16.60 | 7.2032 ms per file | observe.after |
| sandbox.exec | — · uncontended | 3 | 589.00 | 589.00 | 589.00 | 1318.82 | 1.77× | 1.77× | -0.11 | -2.22 | 0 / 0 / 0 | 3,027 | — | observe.after |
| sandbox.mount | — · contended | 63 | 9.64 | 13.13 | 18.99 | 21.12 | 0.74× | 0.25× | -3.51 | -6.23 | 57 / 1,205 / 60 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 38 | 9.58 | 12.22 | 12.43 | 12.86 | 0.95× | 0.92× | -0.04 | -0.32 | 57 / 1,205 / 60 | — | — | observe.after |
| sandbox.unmount | — · contended | 64 | 7.13 | 9.88 | 10.19 | 10.80 | 0.85× | 0.78× | -0.88 | -1.40 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 37 | 7.41 | 16.42 | 16.46 | 21.30 | 0.97× | 1.69× | 0.12 | -0.24 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 61.2 KiB | 250 | ok 3 |
| branch.fork | branch | 11 | 0.0 KiB | 0.0 KiB | 0 | Forked 11 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.0 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 7 | 26.9 KiB | 0.0 KiB | 9 | Committed 7 |
| fs.diff_files | fs | 66 | 0.0 KiB | 807.0 KiB | 54 | Text 54, NoSuchPath 12 |
| fs.glob | fs | 66 | 0.0 KiB | 43.8 KiB | 662 | ok 66 |
| fs.grep | fs | 63 | 0.0 KiB | 168.0 KiB | 684 | ok 63 |
| fs.list | fs | 65 | 0.0 KiB | 96.4 KiB | 716 | ok 65 |
| fs.read | fs | 59 | 0.0 KiB | 247.6 KiB | 59 | ok 59 |
| fs.rm | fs | 2 | 0.0 KiB | 0.0 KiB | 2 | Committed 2 |
| fs.stat | fs | 67 | 0.0 KiB | 14.7 KiB | 67 | ok 67 |
| fs.write | fs | 817 | 17.8 MiB | 0.0 KiB | 817 | Committed 817 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 99 | 0.0 KiB | 0.0 KiB | 0 | UpToDate 55, Committed 43, Conflict 1 |
| sandbox.exec | sandbox | 235 | 2.7 MiB | 174.6 KiB | 0 | exit:0 235 |
| sandbox.mount | sandbox | 103 | 0.0 KiB | 0.0 KiB | 0 | Mounted 103 |
| sandbox.unmount | sandbox | 103 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 103 |

### C. Scale probes

Binary: daemon `6d467539f759`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 1.815 | statements 45, vm_steps 2912, fullscan_steps 0, sorts 0, returned_rows 309 |
| read | 1.582 | statements 45, vm_steps 2903, fullscan_steps 0, sorts 0, returned_rows 309 |
| list_small | 1.739 | statements 54, vm_steps 3831, fullscan_steps 0, sorts 0, returned_rows 410 |
| list_largest | 5.462 | statements 261, vm_steps 14905, fullscan_steps 0, sorts 0, returned_rows 1376 |
| grep_scoped | 2.174 | statements 84, vm_steps 4056, fullscan_steps 0, sorts 0, returned_rows 420 |
| glob_scoped | 1.794 | statements 54, vm_steps 3831, fullscan_steps 0, sorts 0, returned_rows 410 |
| grep_tree | 427.474 | statements 42798, vm_steps 787023, fullscan_steps 0, sorts 0, returned_rows 63001 |
| glob_tree | 12.66 | statements 810, vm_steps 44994, fullscan_steps 0, sorts 0, returned_rows 4117 |
| diff_files | 2.115 | statements 90, vm_steps 5800, fullscan_steps 0, sorts 0, returned_rows 618 |
| list_commits | 0.922 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 1.867 | statements 84, vm_steps 3178, fullscan_steps 0, sorts 0, returned_rows 308 |
| fork | 0.407 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 36.256 | statements 854, vm_steps 69562, fullscan_steps 2634, sorts 7, returned_rows 5049 |
| oneshot_mount_exec | 78.14 | statements 50, vm_steps 1134, fullscan_steps 60, sorts 2, returned_rows 126 |
| oneshot_commit | 67.229 | statements 256, vm_steps 23561, fullscan_steps 898, sorts 3, returned_rows 1737 |

### D. Storage internals

From the sealed file at snapshot r013: 10,408 pages of 4,096 B, 0 free · Commits 9,433 · Branches 141 · Layers 16 · compression 7.74× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 8,508 | 102.7 MiB |
| 2 | 10,043 | 6.3 MiB |
| 3 | 9,798 | 840.1 KiB |
| 5 | 9,798 | 1014.2 KiB |
| 6 | 11,040 | 63.3 MiB |
| 7 | 2,839 | 600.1 KiB |
| 9 | 10,430 | 6.0 MiB |
| 10 | 10,501 | 1.3 MiB |
| 11 | 11,457 | 1.6 MiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 9,444 | 13.0 MiB |
| 1 | 17,669 | 10.7 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 7,824 | 30.6 MiB | 5.4 MiB |
| object_location | 1,126 | 4.4 MiB | 460.4 KiB |
| commit | 709 | 2.8 MiB | 458.9 KiB |
| inode_value | 513 | 2.0 MiB | 72.0 KiB |
| commit_identity | 146 | 584.0 KiB | 66.4 KiB |
| binding_hint | 19 | 76.0 KiB | 11.8 KiB |
| content_signature | 17 | 68.0 KiB | 5.7 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| branch | 7 | 28.0 KiB | 7.6 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch_names | 3 | 12.0 KiB | 4.6 KiB |
| branch_identity | 3 | 12.0 KiB | 6.5 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 2.7 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 2.7 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 21.8 s** (tooling): play 12.0 · consolidate 0.8 · verify 2.5 · probes 0.6 · tests 0.0 · seal + snapshot 4.7 · report 1.2

21.85 s tooling: prepare 2.53 · play 9.45 · consolidate 0.79 · verify 1.94 (diff_commits + full compareTree) · version walk 0.61 · probes 0.68 · metrics 1.17 · seal 3.81 · sealed figures 0.42 · snapshot copy 0.45

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 6d467539f7590c6125c9000e8ef7ee5518f0e893aa1ae30c7e5851fc67759026 | 2026-10-18T03:00:10.636Z | optimize | Speed: not judged: branch.diff_commits >64 entries · uncontended: baseline class has 1/3/2 calls (minimum 5 per range); 4.35× it; Scaling: oneshot_mount_exec: depth exponent 2.297; Counters: list_largest.vm_steps per entry of the largest directory: depth exponent 0.436; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (25 classes too narrow); Directory share: 0.534; Range growth: 5.8 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 389 ms for 40.7 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-013.a1.json`
- trace `~/lfs-history/runs/p2-main-d/trace/range-013.a1.jsonl` · runner log `~/lfs-history/runs/p2-main-d/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-013.json`
