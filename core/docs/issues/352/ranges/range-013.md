# Range 013 · **optimize** · attempt 2

**Matches git ✓** · daemon `6d467539f759` · image `d3773b4e` · plan v2 · continued from r012 (live Store)
dsh `32db205c1`..`b3e1a4154` · **64 commits** (1 mainline, 63 side) · 2026-07-09 → 2026-07-13
Areas changed: `packages/core` 28% · `docs/rfc` 8% · `packages/subagent` 8% · other 56%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **8.9 MiB** (+456.3 KiB) | **40.7 MiB** (+444.0 KiB) | **4.55×** (prev 4.73×) | **5.8 MiB** | **866** (total 9,385) | **22.9 s** tooling (total 4.6 min) |

**Checks:** 6 pass · 6 watch: Speed not judged: fs.apply ≤64 KiB · uncontended: baseline class has 1/21/5 calls (minimum 5 per range); 4.22× it; Counters list_largest.vm_steps per entry of the largest directory: depth exponent 0.428; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (24 classes too narrow); Directory share 0.534; Range growth 5.8 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 368 ms for 40.7 MiB new; size exponent not judged (2 snapshots) · 1 optimize/stop: Scaling
**Moved most:** ▼ sandbox.commit p95 −83% · ▼ sandbox.mount p95 −73% · ▼ fs.write p95 −61%
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
| **Store on disk** (allocated, sealed) | 40.2 MiB | 40.7 MiB | +444.0 KiB |
| **Space amplification** (total · tracked) | 4.73× · tracked 2.48× | 4.55× · tracked 2.65× | -0.19 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **1.69** (0.38 / 0.41 / —) | 0.97× the median range |
| **Stored per Commit** | 10.5 KiB | 3.2 KiB | — |
| Metadata share | 0.67 | 0.74 | this range 0.53 |
| History: Commits / Layers / Branches | 8,519 | 9,385 / 10 / 51 | +866 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 3.34 GiB (Commits 2.06 GiB · installs 1.13 GiB · build 120.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 47.28 GiB / 41% | — |
| Snapshot | — | r013, 40.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 10.7 MiB | 1.20 | +1.3 MiB |
| Metadata | 13.0 MiB | 1.45 | +1.4 MiB |
| Index rows | 8.9 MiB | 1.00 | — |
| Waste | 8.0 MiB | 0.89 | — |
| Other | 52.0 KiB | 0.01 | — |
| **Total = Store on disk** | **40.7 MiB** | **= 4.55** space amplification | +444.0 KiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 8.9 MiB | 23.7 MiB (10.7 MiB + 13.0 MiB) | 2.65× | — | 2.7 MiB | 3.4 MiB | 0.78 |
| `node_modules` | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Build output | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 16.9 MiB | — (not divided) | — | — | — | — |
| **Total** | — | **40.7 MiB** | **= 4.54×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 8,502 | +1,540 | 12.4 KiB | 0 (derived) | 95% |
| Chunks (large files) | 10,035 | +1,603 | 0.6 KiB | — | 2% |
| Large-file extents | 9,790 | — | 0.1 KiB | — | — |
| Directories | 2,831 | 1,591 (with inodes, pooled) | 0.2 KiB | — | 89% |
| Inodes and attributes | 53,184 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.8% at depth cap · 29% of refused bases stopped by budget · `node_modules` reinstall: none this range

## 4. Speed

Daemon `6d467539f759` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 11.9 ms / 18.7 ms (1.26×) | 2.5 ms / 3.8 ms (1.03×) | 2.7 ms / 5.9 ms (1.42×) | 12.4 ms / 25.1 ms (1.05×) | 10.3 ms / 16.0 ms (1.01×) | 200 ms / 200 ms (1.72×) | — (native comparison in P3; exec 44.3 ms / 95.0 ms) |
| SQL p50: 979 stmts | 209 stmts | 219 stmts | 92 stmts | 57 stmts | 8,579 stmts | — |

**Commit cost:** 9.61 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 130 ms p50 over 103
**Slowest:** sandbox.exec 1343 ms · sandbox.exec 624 ms · sandbox.exec 434 ms · checkpoint diff_commits 0.08 ms and 6.65 statements per entry (249 entries per page)
**Scaling:** 12 of 14 probes flat · `grep_tree` 0.79 · `fork` 1.08

**Health:** 0 Workspaces open · 0 overlay files left · daemons 238 MB (−74 MB) over 9 of 9 Sandboxes · 121 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 013.a1 · optimize → closed without a code change · The probe's growth is all in the executor's launch of `exec true` (33

**1. Trigger** (attempt 1, daemon `6d467539f759`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | oneshot_mount_exec: depth exponent 2.297 | < 0.15 |

**2. Fix context**

|  |  |
| --- | --- |
| Playbook step | D0 |
| Cause | The probe's growth is all in the executor's launch of `exec true` (33.3, 48.8, 62.4 ms, ranges 11-13; zero FUSE requests, about 1-2 ms of daemon observation). Mount (9.7, 9.6, 8.2 ms) and unmount (6.4, 6.9, 6.3 ms) are flat, and every SQL counter is identical (50 statements, 1,134 VM steps). On fresh daemons on the range-11 and range-13 snapshots, 10 exec true calls each overlap (18.2-61.8 vs 24.4-47.5 ms), so one sample cannot carry a time exponent. The fixer's addon build ran in the same Docker VM during the range-13 probe (declared) |
| Kind | none: no code change · not a product finding: command launch belongs to the Sandbox (AGENTS execution ownership); no daemon, FUSE or Store work grew. The probe is split (builder 08de4f038): mount + unmount judged as before, the exec by its LayerFS share, its wall reported only |
| Recovery | Fork p2-main-d range 11, fast-forward 12, rerun 13 measured (lead) with the split probe (08de4f038). |

**3. Evidence** (no code change; one sample each unless the row says otherwise)

| Measure | Value | Binary | Snapshot / checkpoint | Cache |
| --- | --- | --- | --- | --- |
| probe exec true, range 11 (trace) | 33.3 ms | `daemon 6d467539` | p2-main-d range 11, measured | live run daemon, one sample |
| probe exec true, range 13 (trace) | 62.4 ms | `daemon 6d467539` | p2-main-d range 13, measured | live run daemon, one sample; fixer's addon build in the same Docker VM |
| probe mount + unmount, ranges 11 / 13 (trace) | 16.1 / 14.5 ms | `daemon 6d467539` | p2-main-d ranges 11 and 13, measured | live run daemon, one sample each |
| exec true 10x min / median / max, range-11 snapshot | 18.19 / 34.79 / 61.75 ms | `daemon 6d467539, addon 7ec591f1` | fork f020-d013-r11 of p2-main-d range 11 | fresh daemon, one Sandbox and Workspace, 10 calls in a row |
| exec true 10x min / median / max, range-13 snapshot | 24.43 / 40.99 / 47.48 ms | `daemon 6d467539, addon 7ec591f1` | fork f020-d013-r13 of p2-main-d range 13 | fresh daemon, one Sandbox and Workspace, 10 calls in a row |
| split probe exponents over ranges 11-13: mount+unmount / exec share | -0.58 / -0.62 (exponent) | `daemon 6d467539` | p2-main-d ranges 11-13 traces (report.mjs regate --split-oneshot) | recorded traces, offline |

Counter `oneshot_mount_exec ms` depth exponent 2.297 → null.

**4. Attempt vs rerun, this range** (same binary; no code change)

| Measure | Attempt 1 · `6d467539f759` | Attempt 2 · `6d467539f759` |
| --- | --- | --- |
| Range time (tooling) | 22.0 s | 22.9 s |
| One-shot Commit p50 / p95 | 11.4 / 22.3 ms | 12.4 / 25.1 ms |
| fs.write p50 / p95 | 11.2 / 17.0 ms | 11.9 / 18.7 ms |
| merge p50 / p95 | 205.8 / 205.8 ms | 200.4 / 200.4 ms |
| SQL per one-shot Commit (statements p50) | 92 | 92 |
| Store on disk | 40.7 MiB | 40.7 MiB |
| Space amplification | 4.55× | 4.55× |
| Verdict | optimize | optimize |

The same binary twice: the rerun repeats the measurement; nothing was changed between them.

**5. Cost of the fix:** none: no code change.

**6. Records:** [fixes/013-a1-oneshot-exec-launch.md](../fixes/013-a1-oneshot-exec-launch.md) · [OPTIMIZATIONS.md](../OPTIMIZATIONS.md) (013.a1 row) · finding `~/lfs-history/metrics/finding-013.a1.json`

### Finding 013.a2 · optimize → closed without a code change · The fork probe's SQL work is identical at every point (16 statements, 271 VM steps, 0 full scans, 7 rows) while its single sub-millisecond sample moves both ways: 0

**1. Trigger** (attempt 2, daemon `6d467539f759`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | fork: depth exponent 1.076 | < 0.15 |

**2. Fix context**

|  |  |
| --- | --- |
| Playbook step | D0 |
| Cause | The fork probe's SQL work is identical at every point (16 statements, 271 VM steps, 0 full scans, 7 rows) while its single sub-millisecond sample moves both ways: 0.635, 0.477 then 0.770 ms over ranges 11-13 (depth 7,783 -> 9,385). The same input on the same binary read 0.407 ms in 013.a1 and 0.770 ms in 013.a2, a spread larger than the whole series' change. Timer and scheduling noise, not growth. The fixer's builds ended 4 s before the range (adjacent, not overlapping) |
| Kind | none: no code change · not a product finding: no counter changed; one sub-millisecond sample per range cannot carry a time exponent |
| Recovery | None: no rerun; the lane continues to range 14 (lead). |

**3. Evidence** (no code change; one sample each unless the row says otherwise)

| Measure | Value | Binary | Snapshot / checkpoint | Cache |
| --- | --- | --- | --- | --- |
| fork probe, range 11 a2 | 0.635 ms | `daemon 6d467539, addon 7ec591f1` | p2-main-d range 11, measured | live run, one sample; 16 statements, 271 VM steps |
| fork probe, range 12 a1 | 0.477 ms | `daemon 6d467539, addon 7ec591f1` | p2-main-d range 12, measured | live run, one sample; 16 statements, 271 VM steps |
| fork probe, range 13 a1 | 0.407 ms | `daemon 6d467539, addon 7ec591f1` | p2-main-d range 13, measured | live run, one sample; 16 statements, 271 VM steps |
| fork probe, range 13 a2 | 0.77 ms | `daemon 6d467539, addon 7ec591f1` | p2-main-e range 13, measured | live run, one sample; 16 statements, 271 VM steps |

Counter `fork ms (counters flat)` depth exponent 1.076 → null.

**4. Attempt vs rerun, this range** (same binary; no code change)

No rerun: no code change, and an unchanged treatment is not resampled.

**5. Cost of the fix:** none: no code change.

**6. Records:** [fixes/013-a2-fork-probe-timer-noise.md](../fixes/013-a2-fork-probe-timer-noise.md) · [OPTIMIZATIONS.md](../OPTIMIZATIONS.md) (013.a2 row) · finding `~/lfs-history/metrics/finding-013.a2.json`

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
| F-029 | every SDK call on a Sandbox refreshes discovery for all its mounts | the fixer | after F-027, together with Engine connection reuse |
| F-030 | `daemon[].fuse.served` on traced exec lines is cumulative | the builder checks the `oneshot_exec` probe split | 08de4f038 |

### Lead's note (written by the lead; never empty unless the verdict is pass)

- Optimize: the `oneshot_mount_exec` probe time is 50.8 → 66.8 → 78.1 ms over ranges 11–13 (depth 7,783 → 9,385), time exponent 2.30, all three on `6d467539`. Every counter is identical in all three ranges: 50 statements, 1,134 VM steps, 60 full-scan steps, 126 rows. So the growth is outside the Store's SQL: mount bind, FUSE, the exec process, or daemon state that accumulates over the run's life (121 Workspaces in range 11). It could also be runner or Docker drift. Nothing ran alongside: the builder held at the re-baseline. The fixer diagnoses 013.a1 from per-phase timing (mount, exec, commit, unmount) on the range-11 and range-13 snapshots with a fresh daemon. If a fresh daemon is flat, the cause is accumulated state.
- `list_largest` VM steps per entry, exponent 0.44, is a watch: the residual chain position F-026 noted, bounded by the delta cap. The `branch.diff_commits` 4.35× is a thin class, not judged.
- Recovery after the fix: fork p2-main-d's range-11 snapshot (range 12 has none), fast-forward 12, rerun 13 measured.

- Attempt 2 (optimize), run `p2-main-e`: fork of p2-main-d range 11, range 12 fast, 13 measured with the split one-shot probe (08de4f038, 0a1ef97c1). It played 03:24:01–03:24:25Z. The fixer's two Docker builds ended at 03:23:57Z, so there was no overlap, but they were adjacent. The old trigger is gone: `oneshot_exec` has 1 of 3 points of the new series, so it is not judged.
- New trigger: the `fork` probe's time exponent is 1.08 over ranges 11–13 (0.635, 0.477, 0.77 ms). Every counter is identical in all four samples, including 013.a1: 16 statements, 271 VM steps, 0 full scans, 7 rows. The same input on the same binary read 0.407 ms in 013.a1 and 0.77 ms in 013.a2, a 1.9× swing on identical work. That is timer and scheduler noise at sub-millisecond scale, with host load average 15–32 from other agents per the liaison. Closed as fix kind "none" (fixer record 013.a2). There is no rerun: an unchanged treatment is not resampled. The verdict stays optimize as recorded. The lane continues from this attempt's state (checkpoint ok) to range 14.
- Gate note, not a change: a time-scaling fit over three single sub-ms samples trips on noise. Counters are the reliable signal there. This is recorded as an open gate question in RESULTS; no threshold is touched.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1634/1634; conflicts 2/2; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: fs.apply ≤64 KiB · uncontended: baseline class has 1/21/5 calls (minimum 5 per range); 4.22× it | ≤ 1.2× | watch |
| Scaling | fork: depth exponent 1.076; also not judged: oneshot_exec: 1 of 3 points of probe version 1 | < 0.15 | optimize |
| Counters | list_largest.vm_steps per entry of the largest directory: depth exponent 0.428 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (24 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.534 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.038 (budget 0.2892) | < 0.1 | pass |
| Range growth | 5.8 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 368 ms for 40.7 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
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

Binary: daemon `6d467539f759` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 4.24 | 4.24 | 4.24 | 4.24 | no baseline | no baseline | — | — | 201 / 10,576 / 0 | — | 0.4237 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 1 | 25.51 | 25.51 | 25.51 | 25.51 | 3.87× | 3.87× | 5.39 | 7.20 | 2,334 / 45,767 / 0 | — | 0.1067 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.47 | 1.31 | 1.31 | 2.32 | 0.76× | 1.56× | -1.15 | -4.24 | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 3.27 | 3.27 | 3.27 | 3.27 | 2.11× | 2.11× | — | — | 592 / 15,054 / 0 | — | 0.0511 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 200.45 | 200.45 | 200.45 | 299.51 | 1.72× | 1.72× | -1.51 | -1.58 | 8,579 / 142,124 / 833 | — | 2.9364 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.98 | 4.98 | 4.98 | 4.98 | 1.20× | 1.20× | 0.09 | 1.87 | 883 / 22,939 / 0 | — | — | — |
| fs.apply | ≤64 KiB · contended | 1 | 43.83 | 43.83 | 43.83 | 43.83 | 3.74× | 1.27× | 2.63 | 1.15 | 953 / 46,265 / 853 | — | 0.0037 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 32.73 | 32.73 | 32.73 | 32.73 | 4.22× | 3.99× | — | — | 1,798 / 89,484 / 854 | — | 0.0038 ms per byte | files.resolve |
| fs.apply | ≤8 KiB · contended | 1 | 29.66 | 29.66 | 29.66 | 29.66 | 2.57× | 1.15× | -9.11 | -21.75 | 1,407 / 67,417 / 1,764 | — | 0.0089 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 17 | 5.59 | 7.79 | 7.79 | 20.61 | 1.65× | 1.44× | 2.08 | 4.68 | 415 / 14,741 / 0 | — | 0.0194 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 7 | 5.49 | 6.55 | 6.55 | 8.42 | 1.31× | 1.09× | -0.24 | -1.19 | 276 / 8,917 / 0 | — | 0.0239 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 19 | 5.58 | 7.40 | 7.40 | 7.58 | 1.02× | 1.25× | 0.08 | -0.37 | 481 / 20,885 / 60 | — | 0.0002 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 11 | 4.79 | 7.65 | 7.65 | 8.46 | 1.02× | 1.63× | -0.22 | 1.86 | 351 / 10,872 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 7 | 4.34 | 4.60 | 4.60 | 5.48 | 1.12× | 0.98× | -0.63 | -1.11 | 312 / 13,145 / 0 | — | 0.0008 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 4.58 | 5.08 | 5.08 | 5.11 | 1.20× | 1.33× | 0.41 | -0.40 | 303 / 13,268 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 3 | 2.63 | 2.63 | 2.63 | 3.02 | 1.16× | 1.05× | — | — | 183 / 7,276 / 0 | — | 2.627 ms per file | — |
| fs.glob | 1 files · uncontended | 4 | 2.47 | 2.66 | 2.66 | 5.72 | 1.69× | 1.82× | — | — | 180 / 6,901 / 0 | — | 2.469 ms per file | — |
| fs.glob | 17–64 files · contended | 10 | 4.04 | 5.19 | 5.19 | 5.47 | 0.89× | 1.14× | -0.51 | -0.89 | 378 / 14,349 / 0 | — | 0.1835 ms per file | — |
| fs.glob | 17–64 files · uncontended | 6 | 3.97 | 4.70 | 4.70 | 5.19 | 1.44× | 1.71× | — | — | 255 / 11,143 / 0 | — | 0.2039 ms per file | — |
| fs.glob | 2–4 files · contended | 9 | 2.84 | 3.73 | 3.73 | 4.58 | 1.25× | 1.09× | 0.55 | 1.74 | 192 / 7,380 / 0 | — | 1.2125 ms per file | — |
| fs.glob | 2–4 files · uncontended | 4 | 2.14 | 2.39 | 2.39 | 2.61 | 0.83× | 0.63× | — | — | 129 / 5,581 / 0 | — | 0.7967 ms per file | — |
| fs.glob | 5–16 files · contended | 7 | 2.70 | 3.43 | 3.43 | 3.87 | 1.06× | 0.95× | -1.72 | -2.58 | 290 / 9,903 / 0 | — | 0.49 ms per file | — |
| fs.glob | 5–16 files · uncontended | 5 | 2.89 | 3.58 | 3.58 | 4.03 | 1.21× | 1.09× | 0.01 | 2.06 | 222 / 7,725 / 0 | — | 0.3046 ms per file | — |
| fs.glob | >64 files · contended | 10 | 7.56 | 41.33 | 41.33 | 226.35 | 0.93× | 4.28× | -2.19 | -4.62 | 890 / 30,252 / 0 | — | 0.036 ms per file | — |
| fs.glob | >64 files · uncontended | 6 | 6.18 | 9.85 | 9.85 | 10.86 | 1.59× | 2.53× | 0.66 | 2.92 | 432 / 18,994 / 0 | — | 0.0413 ms per file | — |
| fs.grep | 1 files · contended | 2 | 2.93 | 2.93 | 2.93 | 6.70 | 1.27× | 1.13× | 0.14 | -0.87 | 192 / 5,720 / 0 | — | 2.93 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 3 | 3.84 | 3.84 | 3.84 | 4.74 | 1.85× | 1.85× | — | — | 252 / 8,740 / 0 | — | 3.837 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 13 | 14.23 | 16.61 | 16.61 | 20.30 | 1.43× | 1.32× | 1.30 | 1.32 | 1,263 / 38,801 / 930 | — | 0.4811 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 3 | 9.39 | 9.39 | 9.39 | 9.80 | 1.69× | 1.69× | — | — | 603 / 10,811 / 0 | — | 0.5522 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 10 | 3.76 | 4.61 | 4.61 | 5.41 | 1.13× | 1.06× | -0.77 | -0.91 | 313 / 9,072 / 0 | — | 1.8815 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 5 | 2.91 | 3.05 | 3.05 | 3.60 | 1.37× | 1.42× | -1.46 | -1.60 | 156 / 6,412 / 0 | — | 1.1987 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 12 | 5.35 | 10.00 | 10.00 | 11.32 | 1.30× | 1.41× | -0.27 | 0.92 | 631 / 11,508 / 0 | — | 0.6249 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 4.89 | 8.86 | 8.86 | 13.59 | 1.09× | 1.42× | — | — | 462 / 9,741 / 0 | — | 0.7283 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 2 | 3.61 | 3.61 | 3.61 | 5.22 | 0.35× | 0.30× | -2.20 | -1.79 | 249 / 8,517 / 0 | — | 0.0187 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 3 | 4.46 | 4.46 | 4.46 | 8.81 | 0.51× | 0.51× | 0.04 | 2.40 | 279 / 9,073 / 0 | — | 0.0228 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 3 | 3.04 | 3.04 | 3.04 | 3.21 | 1.51× | 1.51× | 1.76 | 0.98 | 223 / 8,767 / 0 | — | 3.045 ms per entrie | — |
| fs.list | 1 entries · uncontended | 4 | 2.13 | 2.47 | 2.47 | 3.62 | 1.08× | 1.26× | — | — | 135 / 5,553 / 0 | — | 2.128 ms per entrie | — |
| fs.list | 17–64 entries · contended | 14 | 3.75 | 6.17 | 6.17 | 7.08 | 1.67× | 2.06× | 0.47 | 1.41 | 345 / 17,069 / 0 | — | 0.1626 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 6 | 3.04 | 3.98 | 3.98 | 4.93 | 1.32× | 1.73× | 1.33 | 0.79 | 216 / 8,471 / 0 | — | 0.1548 ms per entrie | — |
| fs.list | 2–4 entries · contended | 5 | 2.28 | 2.44 | 2.44 | 5.98 | 0.99× | 0.62× | -0.76 | -0.25 | 223 / 5,955 / 0 | — | 1.138 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 12 | 2.24 | 3.41 | 3.41 | 3.78 | 1.42× | 2.15× | 1.13 | 2.66 | 147 / 5,703 / 0 | — | 0.8977 ms per entrie | — |
| fs.list | 5–16 entries · contended | 12 | 2.39 | 3.59 | 3.59 | 3.82 | 0.96× | 1.01× | -0.54 | 0.01 | 243 / 8,897 / 0 | — | 0.3868 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 5 | 2.48 | 3.03 | 3.03 | 3.78 | 1.27× | 1.42× | — | — | 150 / 5,631 / 0 | — | 0.4906 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 2.63 | 2.63 | 2.63 | 2.63 | 1.98× | 1.98× | — | — | 174 / 5,338 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 4 | 2.72 | 2.86 | 2.86 | 5.46 | 1.23× | 1.29× | -0.57 | -1.12 | 287 / 18,935 / 829 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.52 | 2.52 | 2.52 | 3.17 | 0.89× | 0.89× | — | — | 171 / 4,901 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 27 | 2.60 | 3.44 | 4.28 | 4.82 | 0.96× | 0.67× | -0.42 | -0.30 | 234 / 7,632 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 23 | 2.33 | 3.64 | 3.68 | 3.80 | 1.03× | 0.77× | 1.47 | 2.60 | 171 / 5,474 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · uncontended | 2 | 7.68 | 7.68 | 7.68 | 11.61 | 0.98× | 0.80× | -0.58 | 1.15 | 334 / 23,157 / 889 | — | 7.68 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 1.40 | 1.40 | 1.40 | 1.40 | 0.56× | 0.52× | — | — | 213 / 5,078 / 0 | — | 0.0034 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 1 | 1.98 | 1.98 | 1.98 | 1.98 | 0.77× | 0.77× | — | — | 114 / 4,403 / 0 | — | 0.0046 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 3.61 | 3.61 | 3.61 | 3.61 | 3.64× | 3.64× | — | — | 234 / 8,955 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 26 | 2.20 | 2.80 | 2.82 | 5.26 | 0.85× | 0.72× | -1.35 | -1.76 | 183 / 6,451 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 24 | 2.13 | 3.90 | 4.77 | 5.62 | 1.07× | 1.96× | 3.07 | 7.62 | 132 / 5,042 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 6 | 2.56 | 3.48 | 3.48 | 4.26 | 1.17× | 0.95× | 0.51 | 0.73 | 262 / 9,746 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 4 | 1.54 | 1.85 | 1.85 | 2.13 | 0.82× | 0.83× | -1.63 | -2.39 | 108 / 4,538 / 0 | — | 0.0002 ms per byte | — |
| fs.write | ≤1 KiB · contended | 11 | 12.81 | 14.47 | 14.47 | 16.52 | 1.28× | 0.70× | -14.78 | -30.63 | 992 / 43,439 / 1,726 | — | 0.0245 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 16 | 7.23 | 11.24 | 11.24 | 35.78 | 1.14× | 1.09× | -0.16 | 0.67 | 352 / 20,234 / 864 | — | 0.0146 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 26 | 13.83 | 21.81 | 23.56 | 31.33 | 1.06× | 1.67× | -3.25 | -6.16 | 1,026 / 47,619 / 1,756 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 7 | 11.64 | 12.89 | 12.89 | 13.12 | 1.22× | 1.35× | 0.64 | 1.36 | 498 / 23,323 / 879 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 405 | 12.97 | 20.23 | 23.58 | 25.03 | 1.00× | 0.20× | -10.85 | -21.89 | 1,196 / 48,618 / 1,756 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 142 | 9.74 | 13.08 | 14.13 | 14.91 | 1.26× | 1.03× | 0.58 | 1.29 | 496 / 22,442 / 882 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 140 | 12.01 | 17.14 | 22.16 | 23.02 | 1.00× | 0.24× | -11.77 | -23.66 | 1,026 / 44,940 / 1,726 | — | 0.0025 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 70 | 7.82 | 12.65 | 15.28 | 15.43 | 1.10× | 1.02× | 0.02 | 0.38 | 436 / 21,331 / 883 | — | 0.0017 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.53 | 0.53 | 0.53 | 0.53 | 0.84× | 0.84× | -0.51 | -0.50 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · UpToDate · contended | 34 | 10.55 | 17.27 | 18.26 | 18.28 | 0.81× | 0.59× | -2.99 | -4.27 | 77 / 13,622 / 804 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · uncontended | 21 | 8.84 | 11.17 | 11.17 | 11.84 | 1.05× | 0.84× | 0.26 | 0.37 | 77 / 13,622 / 817 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 12 | 13.76 | 16.05 | 16.05 | 25.48 | 0.34× | 0.19× | -7.62 | -12.05 | 266 / 18,038 / 805 | — | 13.761 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 4 | 13.04 | 15.99 | 15.99 | 16.05 | 1.08× | 1.32× | -0.25 | -0.16 | 260 / 17,697 / 827 | — | 13.044 ms per file | commit |
| sandbox.commit | 1 files · Conflict · uncontended | 1 | 110.80 | 110.80 | 110.80 | 110.80 | no baseline | no baseline | — | — | 4,850 / 81,082 / 831 | — | 110.797 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 13 | 18.42 | 25.11 | 25.11 | 28.84 | 0.39× | 0.29× | -9.84 | -19.80 | 449 / 21,538 / 814 | — | 9.2 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 10 | 16.50 | 21.69 | 21.69 | 23.14 | 1.08× | 1.42× | -0.05 | -1.54 | 544 / 22,225 / 804 | — | 8.249 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 26.81 | 26.81 | 26.81 | 27.90 | 0.97× | 0.97× | -7.16 | -15.54 | 691 / 26,044 / 821 | — | 3.9857 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 24.89 | 24.89 | 24.89 | 24.89 | no baseline | no baseline | — | — | 972 / 31,600 / 822 | — | 2.4887 ms per file | commit |
| sandbox.exec | 1 files · contended | 51 | 41.19 | 70.93 | 73.39 | 75.06 | 0.95× | 1.07× | -0.08 | 0.07 | 0 / 0 / 0 | 5 | 41.193 ms per file | observe.after |
| sandbox.exec | 1 files · uncontended | 13 | 45.76 | 66.57 | 66.57 | 67.81 | 1.18× | 1.33× | 0.89 | 1.06 | 0 / 0 / 0 | 5.30 | 45.759 ms per file | observe.after |
| sandbox.exec | 17–64 files · contended | 10 | 97.19 | 103.74 | 103.74 | 104.76 | 1.07× | 1.00× | 0.47 | 1.09 | 0 / 0 / 0 | 93 | 5.0599 ms per file | observe.after |
| sandbox.exec | 2–4 files · contended | 87 | 43.41 | 71.50 | 82.23 | 83.53 | 0.92× | 0.89× | -0.29 | -0.24 | 0 / 0 / 0 | 8.50 | 20.5565 ms per file | observe.after |
| sandbox.exec | 2–4 files · uncontended | 19 | 35.79 | 51.43 | 51.43 | 55.93 | 0.80× | 0.71× | -1.50 | -2.21 | 0 / 0 / 0 | 8.80 | 16.7025 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 41 | 54.77 | 94.95 | 103.04 | 116.56 | 0.76× | 0.96× | -2.33 | -3.03 | 0 / 0 / 0 | 16.60 | 7.4071 ms per file | observe.after |
| sandbox.exec | 5–16 files · uncontended | 9 | 67.32 | 90.33 | 90.33 | 101.64 | 0.96× | 1.28× | -1.42 | -4.35 | 0 / 0 / 0 | 27 | 8.2768 ms per file | observe.after |
| sandbox.exec | — · uncontended | 3 | 623.73 | 623.73 | 623.73 | 1342.62 | 1.87× | 1.87× | 0.20 | -1.82 | 0 / 0 / 0 | 3,027 | — | observe.after |
| sandbox.mount | — · contended | 55 | 10.54 | 16.01 | 25.27 | 44.95 | 0.81× | 0.31× | -3.02 | -5.60 | 57 / 1,205 / 60 | — | — | observe.after |
| sandbox.mount | — · uncontended | 46 | 10.22 | 13.78 | 19.09 | 22.72 | 1.01× | 1.04× | 0.30 | 0.13 | 57 / 1,205 / 60 | — | — | observe.after |
| sandbox.unmount | — · contended | 60 | 7.17 | 9.92 | 14.27 | 22.10 | 0.85× | 0.78× | -0.86 | -1.36 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 41 | 7.78 | 11.13 | 11.21 | 17.14 | 1.02× | 1.14× | 0.39 | 0.10 | 0 / 0 / 0 | — | — | observe.after |

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
| stat | 2.2 | statements 45, vm_steps 2912, fullscan_steps 0, sorts 0, returned_rows 309 |
| read | 1.684 | statements 45, vm_steps 2903, fullscan_steps 0, sorts 0, returned_rows 309 |
| list_small | 1.771 | statements 54, vm_steps 3831, fullscan_steps 0, sorts 0, returned_rows 410 |
| list_largest | 6.228 | statements 261, vm_steps 14883, fullscan_steps 0, sorts 0, returned_rows 1375 |
| grep_scoped | 2.383 | statements 84, vm_steps 4056, fullscan_steps 0, sorts 0, returned_rows 420 |
| glob_scoped | 1.848 | statements 54, vm_steps 3831, fullscan_steps 0, sorts 0, returned_rows 410 |
| grep_tree | 427.234 | statements 42717, vm_steps 786349, fullscan_steps 0, sorts 0, returned_rows 62987 |
| glob_tree | 14.006 | statements 807, vm_steps 45039, fullscan_steps 0, sorts 0, returned_rows 4116 |
| diff_files | 2.52 | statements 90, vm_steps 5800, fullscan_steps 0, sorts 0, returned_rows 618 |
| list_commits | 1.306 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 2.053 | statements 84, vm_steps 3254, fullscan_steps 0, sorts 0, returned_rows 310 |
| fork | 0.77 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 37.344 | statements 854, vm_steps 69776, fullscan_steps 2628, sorts 7, returned_rows 5051 |
| oneshot_mount_unmount | 16.35 | statements 50, vm_steps 1134, fullscan_steps 60, sorts 2, returned_rows 126 |
| oneshot_commit | 67.125 | statements 256, vm_steps 23645, fullscan_steps 896, sorts 3, returned_rows 1738 |
| oneshot_exec | 2.233 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r013: 10,407 pages of 4,096 B, 0 free · Commits 9,427 · Branches 135 · Layers 16 · compression 7.74× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 8,502 | 102.7 MiB |
| 2 | 10,035 | 6.3 MiB |
| 3 | 9,790 | 839.5 KiB |
| 5 | 9,790 | 1013.4 KiB |
| 6 | 11,029 | 63.3 MiB |
| 7 | 2,831 | 599.3 KiB |
| 9 | 10,424 | 6.0 MiB |
| 10 | 10,495 | 1.3 MiB |
| 11 | 11,446 | 1.6 MiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 9,438 | 13.0 MiB |
| 1 | 17,659 | 10.7 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 7,816 | 30.5 MiB | 5.4 MiB |
| object_location | 1,130 | 4.4 MiB | 479.8 KiB |
| commit | 715 | 2.8 MiB | 484.0 KiB |
| inode_value | 512 | 2.0 MiB | 69.5 KiB |
| commit_identity | 144 | 576.0 KiB | 58.8 KiB |
| binding_hint | 19 | 76.0 KiB | 11.9 KiB |
| content_signature | 17 | 68.0 KiB | 5.9 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| branch | 7 | 28.0 KiB | 8.5 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch_names | 3 | 12.0 KiB | 4.9 KiB |
| branch_identity | 3 | 12.0 KiB | 6.7 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 2.7 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 2.7 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 22.9 s** (tooling): play 13.0 · consolidate 0.7 · verify 2.6 · probes 0.7 · tests 0.0 · seal + snapshot 4.5 · report 1.4

22.88 s tooling: prepare 2.67 · play 10.29 · consolidate 0.71 · verify 1.96 (diff_commits + full compareTree) · version walk 0.66 · probes 0.68 · metrics 1.26 · seal 3.77 · sealed figures 0.30 · snapshot copy 0.42 · report 0.15

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 6d467539f7590c6125c9000e8ef7ee5518f0e893aa1ae30c7e5851fc67759026 | 2026-10-18T03:00:10.636Z | optimize | Speed: not judged: branch.diff_commits >64 entries · uncontended: baseline class has 1/3/2 calls (minimum 5 per range); 4.35× it; Scaling: oneshot_mount_exec: depth exponent 2.297; Counters: list_largest.vm_steps per entry of the largest directory: depth exponent 0.436; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (25 classes too narrow); Directory share: 0.534; Range growth: 5.8 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 389 ms for 40.7 MiB new; size exponent not judged (2 snapshots) |
| 2 | 6d467539f7590c6125c9000e8ef7ee5518f0e893aa1ae30c7e5851fc67759026 | 2026-10-18T03:24:05.056Z | optimize | Speed: not judged: fs.apply ≤64 KiB · uncontended: baseline class has 1/21/5 calls (minimum 5 per range); 4.22× it; Scaling: fork: depth exponent 1.076; also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: list_largest.vm_steps per entry of the largest directory: depth exponent 0.428; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (24 classes too narrow); Directory share: 0.534; Range growth: 5.8 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 368 ms for 40.7 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-013.a1.json`
- `~/lfs-history/metrics/range-013.a2.json`
- `~/lfs-history/metrics/finding-013.a1.json`
- `~/lfs-history/metrics/finding-013.a2.json`
- trace `~/lfs-history/runs/p2-main-e/trace/range-013.a2.jsonl` · runner log `~/lfs-history/runs/p2-main-e/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-013.p2-main-e.json`
