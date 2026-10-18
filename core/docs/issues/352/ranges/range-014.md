# Range 014 · **optimize** · attempt 1

**Matches git ✓** · daemon `6d467539f759` · image `d3773b4e` · plan v2 · continued from r013 (live Store)
dsh `1d848cf5f`..`6e5c908a1` · **79 commits** (9 mainline, 70 side) · 2026-07-10 → 2026-07-14
Areas changed: `examples/acp-agent` 29% · `packages/ui` 9% · `/` 8% · other 54%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **9.8 MiB** (+884.8 KiB) | **50.5 MiB** (+9.8 MiB) live | **5.14×** (prev 4.55×) | **7.8 MiB** | **1,163** (total 10,548) | **38.9 s** tooling (total 5.3 min) |

**Checks:** 8 pass · 4 watch: Speed not judged: fs.glob >64 files · uncontended: baseline class has 0/2/2 calls (minimum 5 per range); 3.11× it; Counters list_largest.returned_rows per entry of the largest directory: depth exponent 0.137; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (30 classes too narrow); Directory share 0.595 · 1 optimize/stop: Scaling
**Moved most:** ▲ fs.write p95 +2283% · ▲ sandbox.mount p95 +1104% · ▲ sandbox.commit p95 +900%
**Budget:** 15 of 202 ranges · projected total 1.3 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **380 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 4 lanes merged, 2 publishes |
| Steps | 2,171 / 2,171 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**2,351 calls** · **288 steps** by **10 agents + lead** on **4 Branches + main** · **143 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +130 added · 1,049 modified · −36 deleted · 13.4 MiB written · fs 1,100 : Sandbox 115 (**10 : 1**, target ~9 : 1)
**Execs:** 283 (JS 80 · shell 203) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,617 | 1,104 | 513 | Committed 1,104 · Text 57 · NoSuchPath 27 |
| sandbox | 709 | 423 | 0 | commit 140 (Committed 61, UpToDate 78, Conflict 1) · exec 283 (exit:0 283) · mount 143 (Mounted 143) · unmount 143 (Unmounted 143) |
| branch | 21 | 18 | 3 | diff_commits 3 · fork 11 (Forked 11) · merge 5 (Merged 5) · publish 2 (Added 2) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,351** | **1,545** | **520** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r014-1-examples-acp-agent | a01 a02 a03 | 73 | 283 | ✓ | ✓ |
| r014-2-packages-ui | a04 a05 | 65 | 281 | ✓ | — |
| r014-3-docs-rfc | a06 a07 | 69 | 274 | ✓ | — |
| r014-4-packages-core | a08 a09 a10 | 73 | 277 | ✓ | — |
| main | lead | 8 | 48 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r014-1, a03 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r014-1, a03 a01 | merged cleanly |
| Decoy edit | 1 / 1 | r014-1, a01 a03 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r014-2 vs r014-1 publish | 1.5 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r014-1 | 29 | 10 | 19 | 0 | 0 | 46 | commit-conflict, stale-clean-merge, decoy |
| a02 | r014-1 | 25 | 14 | 11 | 0 | 0 | 199 | — |
| a03 | r014-1 | 19 | 9 | 10 | 0 | 0 | 38 | commit-conflict, stale-clean-merge, decoy |
| a04 | r014-2 | 26 | 12 | 14 | 0 | 0 | 87 | — |
| a05 | r014-2 | 39 | 18 | 21 | 0 | 0 | 194 | — |
| a06 | r014-3 | 45 | 22 | 23 | 0 | 0 | 205 | — |
| a07 | r014-3 | 24 | 14 | 10 | 0 | 0 | 69 | — |
| a08 | r014-4 | 18 | 10 | 8 | 0 | 0 | 43 | — |
| a09 | r014-4 | 38 | 19 | 19 | 0 | 0 | 170 | — |
| a10 | r014-4 | 17 | 10 | 7 | 0 | 0 | 64 | — |
| lead | main | 8 | 1 | 0 | 7 | 0 | 48 | merge-race |
| **Total** |  | **288** | **139** | **142** | **7** | **0** | **1,163** | **4** |

## 3. Storage

**3a. Overview**

|  | Previous (r013) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 8.9 MiB (8.9 MiB / 0.0 KiB / 0.0 KiB) | 9.8 MiB (9.8 MiB / 0.0 KiB / 0.0 KiB) | +884.8 KiB |
| Files / directories / symlinks | 1,161 / 371 / 6 | 1,255 / 393 / 6 | +94 / +22 / +0 |
| Largest file / largest directory | 246.1 KiB / 39 entries | 262.4 KiB (`pnpm-lock.yaml`) / 44 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, live: file + WAL) | 40.7 MiB | 50.5 MiB | +9.8 MiB |
| **Space amplification** (total · tracked) | 4.55× · tracked 2.65× | 5.14× · tracked 2.74× | 0.60 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **2.00** (0.30 / 0.50 / 1.70) | 1.16× the median range |
| **Stored per Commit** | 3.2 KiB | 8.6 KiB | — |
| Metadata share | 0.74 | 0.69 | this range 0.59 |
| History: Commits / Layers / Branches | 9,385 | 10,548 / 11 / 67 | +1,163 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 3.34 GiB (Commits 2.05 GiB · installs 1.13 GiB · build 120.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 47.04 GiB / 41% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 11.9 MiB | 1.21 | +1.2 MiB |
| Metadata | 15.0 MiB | 1.53 | +2.0 MiB |
| Index rows + waste + other (live, not split) | 23.6 MiB | 2.41 | — |
| **Total = Store on disk** | **50.5 MiB** | **= 5.14** space amplification | +9.8 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 9.8 MiB | 26.9 MiB (11.9 MiB + 15.0 MiB) | 2.74× | — | 3.1 MiB | 3.9 MiB | 0.80 |
| `node_modules` | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Build output | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 23.6 MiB | — (not divided) | — | 6.7 MiB | — | — |
| **Total** | — | **50.5 MiB** | **= 5.14×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +3,662 | — | 0 (derived) | 91% |
| Chunks (large files) | — (at snapshots) | +4,111 | — | — | 3% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 4,607 (with inodes, pooled) | — | — | 88% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +0 | — | — | — |

Delta: 3.1% at depth cap · 38% of refused bases stopped by budget · `node_modules` reinstall: none this range

## 4. Speed

Daemon `6d467539f759` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 21.6 ms / 447 ms (1.17×) | 2.6 ms / 5.6 ms (1.14×) | 2.9 ms / 5.4 ms (1.40×) | 22.2 ms / 251 ms (1.02×) | 15.0 ms / 193 ms (0.95×) | 306 ms / 349 ms (2.99×) | — (native comparison in P3; exec 46.5 ms / 96.5 ms) |
| SQL p50: 2,201 stmts | 270 stmts | 272 stmts | 173 stmts | 57 stmts | 9,977 stmts | — |

**Commit cost:** 50.14 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 195 ms p50 over 143
**Slowest:** fs.write 811 ms (8,786 bytes) · fs.write 768 ms (6,428 bytes) · fs.write 717 ms (2,492 bytes) · checkpoint diff_commits 0.10 ms and 8.99 statements per entry (427 entries per page)
**Scaling:** 12 of 14 probes flat · `grep_tree` 0.78 · `glob_tree` 0.33

**Health:** 0 Workspaces open · 0 overlay files left · daemons 489 MB (+251 MB) over 11 of 11 Sandboxes · 153 open files · WAL 4.0 MiB (live)

## 5. Findings and action

### Finding 014.a1 · optimize

**1. Trigger** (attempt 1, daemon `6d467539f759`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | branch.diff_commits checkpoint statements per entry (entries exponent 1.604): tree files exponent 1.143; also not judged: oneshot_exec: 2 of 3 points of probe version 1 | < 0.15 |

Diagnosis pending: `finding-014.a1.json`.

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

- Optimize, a counter trip, so not noise. The end-of-range `branch.diff_commits` check runs 7.27 / 7.00 / 6.65 / 8.99 statements per entry over ranges 11–14 (entries 335 / 310 / 249 / 427), or 10.35 / 10.39 / 10.18 / 13.71 per changed entry. It is judged against tree files, exponent 1.14. The jump is at range 14 only, the largest diff so far. Candidates for the fixer, from earlier findings: the metadata delta-chain position (F-016/F-023 bound probes over one delta-cap period of 8, but this checkpoint is not chain-bounded), and changed ancestors per entry (F-019). The fixer diagnoses 014.a1 from counters on forks of p2-main-e's range-13 snapshot.
- Declared: none of the fixer's or the builder's Docker work ran during this range (03:25:48–03:26:27Z). The fork probe and `diff_files` are flat.
- `oneshot_exec` (new series) has 2 of 3 points, so it is not judged until range 15.
- P2 closes once 014.a1 is resolved. Recovery: fork p2-main-e's range-13 snapshot and rerun 14 measured.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2171/2171; conflicts 4/4; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: fs.glob >64 files · uncontended: baseline class has 0/2/2 calls (minimum 5 per range); 3.11× it | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint statements per entry (entries exponent 1.604): tree files exponent 1.143; also not judged: oneshot_exec: 2 of 3 points of probe version 1 | < 0.15 | optimize |
| Counters | list_largest.returned_rows per entry of the largest directory: depth exponent 0.137 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (30 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.595 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0309 (budget 0.3831) | < 0.1 | pass |
| Range growth | 7.8 MiB, 1.36× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.19 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 288 | 288 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 1163 | 1165 |
| Workspaces (one-shot share) | 143 (0.99) | 141 (0.986) |
| Reads | 508 | 508 |
| Reconcile writes | 45 | 45 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `6d467539f759` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries · uncontended | 2 | 15.56 | 15.56 | 15.56 | 49.44 | 2.36× | 2.36× | 2.33 | 3.41 | 960 / 38,144 / 0 | — | 0.079 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.35 | 0.80 | 0.80 | 1.69 | 0.57× | 0.95× | -1.02 | -2.62 | 16 / 271 / 0 | — | — | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 349.05 | 349.05 | 349.05 | 369.47 | 2.99× | 2.99× | 0.53 | 1.31 | 10,915 / 188,524 / 913 | — | 3.6223 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · contended | 1 | 6.40 | 6.40 | 6.40 | 6.40 | 1.62× | 1.62× | — | — | 892 / 22,835 / 0 | — | 0.0719 ms per entrie | — |
| branch.publish | — · contended | 1 | 5.23 | 5.23 | 5.23 | 5.23 | 1.92× | 1.92× | — | — | 583 / 15,093 / 0 | — | — | — |
| branch.publish | — · uncontended | 1 | 10.23 | 10.23 | 10.23 | 10.23 | 2.46× | 2.46× | 1.86 | 3.93 | 2,346 / 60,950 / 0 | — | — | — |
| fs.apply | ≤1 KiB · contended | 25 | 60.51 | 386.68 | 491.98 | 706.80 | 5.38× | 28.84× | -2.16 | -6.78 | 3,987 / 134,163 / 3,724 | — | 0.3545 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 2 | 10.79 | 10.79 | 10.79 | 15.46 | 1.59× | 1.59× | — | — | 747 / 37,115 / 928 | — | 0.0271 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 11 | 23.55 | 302.68 | 302.68 | 490.45 | 2.01× | 8.75× | 0.56 | -0.21 | 1,574 / 86,205 / 1,974 | — | 0.0013 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 7.04 | 7.04 | 7.04 | 7.04 | 0.91× | 0.86× | -1.45 | -7.51 | 501 / 30,832 / 909 | — | 0.0006 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 41 | 102.06 | 386.40 | 410.09 | 561.35 | 8.84× | 15.01× | -0.28 | -2.60 | 5,386 / 150,828 / 2,882 | — | 0.0268 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 2 | 10.16 | 10.16 | 10.16 | 10.69 | 1.31× | 0.92× | — | — | 922 / 35,345 / 928 | — | 0.0017 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 28 | 3.63 | 15.81 | 15.89 | 39.64 | 1.07× | 2.93× | -0.33 | -0.21 | 394 / 13,748 / 0 | — | 0.0191 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 6 | 3.87 | 4.72 | 4.72 | 9.74 | 0.92× | 0.78× | -1.05 | -2.14 | 192 / 7,296 / 0 | — | — | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 27 | 4.57 | 9.67 | 10.90 | 12.81 | 0.84× | 1.63× | -0.44 | -0.97 | 543 / 17,773 / 60 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 2 | 4.76 | 4.76 | 4.76 | 4.92 | 1.02× | 1.02× | -0.72 | -0.49 | 285 / 9,668 / 0 | — | 0.0002 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 18 | 4.38 | 5.91 | 5.91 | 6.60 | 1.13× | 1.26× | -0.36 | -0.64 | 381 / 13,042 / 0 | — | 0.0008 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 2 | 3.23 | 3.23 | 3.23 | 3.78 | 0.85× | 0.85× | -0.54 | -1.37 | 228 / 10,007 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 2.99 | 2.99 | 2.99 | 2.99 | 1.32× | 1.19× | 2.12 | 3.62 | 394 / 10,071 / 0 | — | 2.992 ms per file | — |
| fs.glob | 17–64 files · contended | 11 | 4.90 | 5.78 | 5.78 | 7.51 | 1.08× | 1.27× | 0.28 | 0.51 | 468 / 17,936 / 0 | — | 0.1522 ms per file | — |
| fs.glob | 17–64 files · uncontended | 3 | 5.71 | 5.71 | 5.71 | 6.99 | 2.07× | 2.07× | 3.03 | 5.24 | 351 / 13,002 / 0 | — | 0.2717 ms per file | — |
| fs.glob | 2–4 files · contended | 7 | 2.92 | 3.12 | 3.12 | 4.39 | 1.29× | 0.91× | 0.23 | 0.68 | 288 / 9,796 / 60 | — | 1.2525 ms per file | — |
| fs.glob | 2–4 files · uncontended | 1 | 3.83 | 3.83 | 3.83 | 3.83 | 1.48× | 1.01× | 2.32 | 4.13 | 198 / 7,861 / 0 | — | 1.275 ms per file | — |
| fs.glob | 5–16 files · contended | 35 | 3.50 | 7.64 | 9.32 | 9.44 | 1.38× | 2.12× | -0.35 | -0.49 | 399 / 13,763 / 0 | — | 0.4554 ms per file | — |
| fs.glob | 5–16 files · uncontended | 7 | 3.58 | 4.84 | 4.84 | 8.84 | 1.50× | 1.48× | 0.16 | 1.01 | 234 / 7,179 / 0 | — | 0.2834 ms per file | — |
| fs.glob | >64 files · contended | 14 | 36.18 | 152.73 | 152.73 | 190.61 | 4.47× | 15.80× | 3.72 | 6.37 | 3,410 / 121,759 / 60 | — | 0.0463 ms per file | — |
| fs.glob | >64 files · uncontended | 1 | 12.11 | 12.11 | 12.11 | 12.11 | 3.11× | 3.11× | 2.05 | 4.29 | 687 / 37,178 / 0 | — | 0.0786 ms per file | — |
| fs.grep | 17–64 files · contended | 16 | 12.98 | 57.38 | 57.38 | 72.08 | 1.31× | 4.55× | 0.76 | 1.02 | 1,134 / 37,240 / 0 | — | 0.4908 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 12 | 3.98 | 6.91 | 6.91 | 9.24 | 1.20× | 1.59× | -0.41 | -0.58 | 411 / 15,741 / 0 | — | 1.3615 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 37 | 6.31 | 19.56 | 27.59 | 44.60 | 1.54× | 2.76× | -0.00 | 0.49 | 739 / 22,019 / 60 | — | 0.7802 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 7 | 7.57 | 12.06 | 12.06 | 15.22 | 1.69× | 1.93× | 2.92 | 6.22 | 534 / 12,904 / 0 | — | 0.8922 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 14 | 17.85 | 96.03 | 96.03 | 100.03 | 1.73× | 7.95× | 3.10 | 6.26 | 1,798 / 60,884 / 60 | — | 0.0262 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 1 | 8.42 | 8.42 | 8.42 | 8.42 | 0.97× | 0.97× | 1.41 | 3.34 | 570 / 22,711 / 0 | — | 0.0135 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 18 | 4.60 | 5.74 | 5.74 | 6.32 | 2.05× | 1.92× | 0.78 | 1.60 | 381 / 14,240 / 0 | — | 0.1393 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 2 | 2.24 | 2.24 | 2.24 | 4.74 | 0.97× | 0.97× | 0.26 | -0.07 | 81 / 5,276 / 0 | — | 0.07 ms per entrie | — |
| fs.list | 2–4 entries · contended | 11 | 2.80 | 3.83 | 3.83 | 4.63 | 1.21× | 0.97× | -0.10 | 0.21 | 336 / 11,049 / 0 | — | 0.9563 ms per entrie | — |
| fs.list | 5–16 entries · contended | 46 | 2.71 | 5.20 | 8.57 | 13.97 | 1.09× | 1.46× | -0.18 | 0.02 | 258 / 9,725 / 0 | — | 0.4896 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 9 | 2.74 | 3.68 | 3.68 | 4.11 | 1.40× | 1.72× | 0.04 | 0.40 | 156 / 5,891 / 0 | — | 0.456 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 9 | 2.94 | 5.04 | 5.04 | 5.59 | 2.22× | 3.80× | 1.13 | 1.95 | 367 / 9,113 / 0 | — | 0.0047 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 1 | 3.24 | 3.24 | 3.24 | 3.24 | 1.00× | 1.00× | — | — | 216 / 7,562 / 0 | — | 0.0042 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 6 | 3.37 | 3.67 | 3.67 | 4.02 | 1.52× | 1.65× | 0.35 | 0.57 | 311 / 8,987 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 2.33 | 2.33 | 2.33 | 2.33 | 0.82× | 0.82× | — | — | 159 / 5,807 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 56 | 2.55 | 6.12 | 8.05 | 11.89 | 0.94× | 1.20× | -0.43 | -0.62 | 290 / 9,087 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 9 | 2.57 | 4.01 | 4.01 | 5.13 | 1.14× | 0.85× | 1.20 | 2.16 | 177 / 5,588 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 34 | 210.82 | 406.06 | 467.33 | 493.67 | 23.17× | 24.44× | 8.59 | 13.63 | 7,766 / 196,868 / 4,650 | — | 210.823 ms per file | commit |
| fs.rm | 1 files · uncontended | 2 | 8.84 | 8.84 | 8.84 | 17.77 | 1.13× | 0.92× | -0.46 | -0.07 | 305 / 24,031 / 956 | — | 8.836 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 10 | 2.03 | 3.76 | 3.76 | 5.28 | 0.82× | 1.41× | -2.68 | -4.38 | 192 / 6,330 / 0 | — | 0.005 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 2.39 | 2.39 | 2.39 | 2.39 | no baseline | no baseline | — | — | 123 / 4,677 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 26 | 2.16 | 4.59 | 6.40 | 7.92 | 0.84× | 1.19× | -1.03 | -1.64 | 220 / 7,217 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 2 | 1.38 | 1.38 | 1.38 | 3.54 | 0.69× | 0.69× | -0.03 | 0.76 | 87 / 2,933 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 29 | 2.40 | 4.34 | 4.98 | 6.88 | 1.10× | 1.18× | 0.16 | 0.22 | 231 / 7,611 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 13 | 2.47 | 3.53 | 3.53 | 7.79 | 1.32× | 1.58× | 0.35 | 0.79 | 159 / 5,038 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 66 | 124.16 | 387.75 | 546.33 | 614.95 | 12.41× | 18.84× | -0.81 | -3.19 | 5,875 / 160,315 / 4,542 | — | 0.2409 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 2 | 7.57 | 7.57 | 7.57 | 14.40 | 1.20× | 0.73× | -0.19 | -0.01 | 538 / 22,816 / 928 | — | 0.0094 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 13 | 195.38 | 283.06 | 283.06 | 333.38 | 14.98× | 21.70× | 6.35 | 11.17 | 7,420 / 196,364 / 4,423 | — | 0.0013 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 1 | 12.10 | 12.10 | 12.10 | 12.10 | 1.27× | 1.27× | 0.45 | 0.89 | 468 / 25,115 / 973 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 311 | 124.36 | 480.01 | 586.13 | 811.20 | 9.55× | 4.83× | 1.10 | 0.90 | 5,006 / 147,008 / 3,816 | — | 0.005 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 48 | 9.35 | 13.41 | 13.98 | 15.98 | 1.21× | 1.06× | 0.17 | 0.39 | 519 / 24,116 / 973 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 474 | 20.46 | 438.29 | 551.56 | 767.76 | 1.70× | 6.02× | -4.79 | -9.70 | 2,083 / 93,176 / 2,907 | — | 0.0052 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 67 | 8.29 | 12.21 | 22.00 | 62.22 | 1.17× | 0.98× | 0.11 | 0.32 | 451 / 23,194 / 972 | — | 0.0016 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.85 | 0.85 | 0.85 | 0.85 | 1.36× | 1.36× | 1.09 | 2.09 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · UpToDate · contended | 71 | 16.98 | 158.08 | 218.18 | 234.86 | 1.30× | 5.41× | -0.60 | -0.75 | 74 / 15,149 / 896 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · uncontended | 7 | 8.54 | 8.65 | 8.65 | 9.34 | 1.02× | 0.65× | 0.08 | 0.11 | 71 / 15,149 / 913 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 26 | 35.16 | 181.22 | 190.86 | 276.07 | 0.87× | 2.12× | -2.08 | -3.30 | 1,026 / 40,537 / 902 | — | 35.155 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 4 | 10.28 | 14.04 | 14.04 | 14.70 | 0.85× | 1.16× | -0.97 | -1.63 | 209 / 19,345 / 910 | — | 10.277 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 291.12 | 291.12 | 291.12 | 291.12 | 4.46× | 4.46× | 0.44 | 0.46 | 5,477 / 79,879 / 904 | — | 291.117 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 26 | 64.06 | 316.04 | 325.75 | 325.99 | 1.37× | 3.63× | -1.51 | -3.66 | 733 / 30,019 / 898 | — | 32.0285 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 1 | 21.43 | 21.43 | 21.43 | 21.43 | 1.40× | 1.40× | 1.15 | 1.54 | 823 / 29,937 / 910 | — | 5.3565 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 27.93 | 27.93 | 27.93 | 298.03 | 1.01× | 1.01× | -3.50 | -7.35 | 1,102 / 35,622 / 910 | — | 4.6557 ms per file | commit |
| sandbox.exec | 1 files · contended | 97 | 42.05 | 78.99 | 103.79 | 109.19 | 0.97× | 1.19× | -0.04 | 0.00 | 0 / 0 / 0 | 4.70 | 42.045 ms per file | observe.after |
| sandbox.exec | 1 files · uncontended | 7 | 44.49 | 46.81 | 46.81 | 49.77 | 1.14× | 0.93× | 0.58 | 0.87 | 0 / 0 / 0 | 3.70 | 44.495 ms per file | observe.after |
| sandbox.exec | 17–64 files · contended | 6 | 91.86 | 102.94 | 102.94 | 107.90 | 1.01× | 0.99× | 0.05 | 0.18 | 0 / 0 / 0 | 93 | 4.9702 ms per file | observe.after |
| sandbox.exec | 17–64 files · uncontended | 1 | 75.60 | 75.60 | 75.60 | 75.60 | 0.65× | 0.65× | — | — | 0 / 0 / 0 | 97 | 4.4468 ms per file | observe.after |
| sandbox.exec | 2–4 files · contended | 116 | 44.89 | 79.50 | 95.46 | 120.27 | 0.96× | 0.99× | -0.14 | -0.17 | 0 / 0 / 0 | 9.70 | 19.3085 ms per file | observe.after |
| sandbox.exec | 2–4 files · uncontended | 3 | 49.36 | 49.36 | 49.36 | 62.34 | 1.11× | 0.68× | -0.03 | 0.09 | 0 / 0 / 0 | 14 | 24.678 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 48 | 75.96 | 104.16 | 147.74 | 172.33 | 1.06× | 1.05× | -0.68 | -0.85 | 0 / 0 / 0 | 34 | 8.7319 ms per file | observe.after |
| sandbox.exec | 5–16 files · uncontended | 1 | 75.59 | 75.59 | 75.59 | 75.59 | 1.07× | 1.07× | -0.04 | -0.74 | 0 / 0 / 0 | 53 | 8.3986 ms per file | observe.after |
| sandbox.exec | — · uncontended | 2 | 530.12 | 530.12 | 530.12 | 633.18 | 1.59× | 1.59× | 0.17 | -0.47 | 0 / 0 / 0 | 1,683 | — | observe.after |
| sandbox.mount | — · contended | 127 | 24.41 | 192.77 | 251.50 | 281.48 | 1.88× | 3.67× | 0.83 | 1.37 | 57 / 1,205 / 60 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 14 | 9.64 | 11.56 | 11.56 | 11.76 | 0.95× | 0.87× | 0.10 | 0.05 | 57 / 1,205 / 60 | — | — | observe.after |
| sandbox.unmount | — · contended | 127 | 7.55 | 11.78 | 14.87 | 77.96 | 0.90× | 0.93× | -0.40 | -0.67 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 14 | 6.49 | 10.20 | 10.20 | 17.03 | 0.85× | 1.05× | -0.18 | -0.53 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 101.5 KiB | 428 | ok 3 |
| branch.fork | branch | 11 | 0.0 KiB | 0.0 KiB | 0 | Forked 11 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.3 KiB | 23 | ok 3 |
| branch.merge | branch | 5 | 0.0 KiB | 0.0 KiB | 0 | Merged 5 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 86 | 479.1 KiB | 0.0 KiB | 88 | Committed 86 |
| fs.diff_files | fs | 84 | 0.0 KiB | 572.9 KiB | 57 | Text 57, NoSuchPath 27 |
| fs.glob | fs | 82 | 0.0 KiB | 43.3 KiB | 562 | ok 82 |
| fs.grep | fs | 89 | 0.0 KiB | 309.8 KiB | 1,224 | ok 89 |
| fs.list | fs | 90 | 0.0 KiB | 117.9 KiB | 1,005 | ok 90 |
| fs.read | fs | 83 | 0.0 KiB | 354.2 KiB | 83 | ok 83 |
| fs.rm | fs | 36 | 0.0 KiB | 0.0 KiB | 36 | Committed 36 |
| fs.stat | fs | 85 | 0.0 KiB | 18.2 KiB | 85 | ok 85 |
| fs.write | fs | 982 | 11.7 MiB | 0.0 KiB | 982 | Committed 982 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 140 | 0.0 KiB | 0.0 KiB | 0 | Committed 61, UpToDate 78, Conflict 1 |
| sandbox.exec | sandbox | 283 | 1.8 MiB | 81.3 KiB | 0 | exit:0 283 |
| sandbox.mount | sandbox | 143 | 0.0 KiB | 0.0 KiB | 0 | Mounted 143 |
| sandbox.unmount | sandbox | 143 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 143 |

### C. Scale probes

Binary: daemon `6d467539f759`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 1.992 | statements 42, vm_steps 2957, fullscan_steps 0, sorts 0, returned_rows 308 |
| read | 1.727 | statements 45, vm_steps 2975, fullscan_steps 0, sorts 0, returned_rows 309 |
| list_small | 1.747 | statements 54, vm_steps 3927, fullscan_steps 0, sorts 0, returned_rows 410 |
| list_largest | 5.999 | statements 276, vm_steps 15765, fullscan_steps 0, sorts 0, returned_rows 1499 |
| grep_scoped | 2.073 | statements 69, vm_steps 4017, fullscan_steps 0, sorts 0, returned_rows 415 |
| glob_scoped | 1.604 | statements 54, vm_steps 3927, fullscan_steps 0, sorts 0, returned_rows 410 |
| grep_tree | 464.251 | statements 46464, vm_steps 806926, fullscan_steps 0, sorts 0, returned_rows 65137 |
| glob_tree | 15.443 | statements 1080, vm_steps 50626, fullscan_steps 0, sorts 0, returned_rows 4796 |
| diff_files | 2.225 | statements 90, vm_steps 5944, fullscan_steps 0, sorts 0, returned_rows 618 |
| list_commits | 1.533 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 1.912 | statements 84, vm_steps 2570, fullscan_steps 0, sorts 0, returned_rows 296 |
| fork | 0.496 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 43.616 | statements 968, vm_steps 72892, fullscan_steps 2868, sorts 7, returned_rows 5431 |
| oneshot_mount_unmount | 15.696 | statements 89, vm_steps 2320, fullscan_steps 60, sorts 2, returned_rows 237 |
| oneshot_commit | 82.298 | statements 256, vm_steps 23936, fullscan_steps 976, sorts 3, returned_rows 1800 |
| oneshot_exec | 1.446 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 38.9 s** (tooling): play 33.9 · consolidate 1.5 · verify 1.4 · probes 0.7 · tests 0.0 · seal + snapshot 0.0 · report 1.4

38.94 s tooling: prepare 3.50 · play 30.46 · consolidate 1.48 · verify 0.72 (diff_commits) · version walk 0.65 · probes 0.72 · metrics 1.08 · Store allocation 0.29

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 6d467539f7590c6125c9000e8ef7ee5518f0e893aa1ae30c7e5851fc67759026 | 2026-10-18T03:25:47.795Z | optimize | Speed: not judged: fs.glob >64 files · uncontended: baseline class has 0/2/2 calls (minimum 5 per range); 3.11× it; Scaling: branch.diff_commits checkpoint statements per entry (entries exponent 1.604): tree files exponent 1.143; also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: list_largest.returned_rows per entry of the largest directory: depth exponent 0.137; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (30 classes too narrow); Directory share: 0.595 |

### G. Evidence

- `~/lfs-history/metrics/range-014.a1.json`
- trace `~/lfs-history/runs/p2-main-e/trace/range-014.a1.jsonl` · runner log `~/lfs-history/runs/p2-main-e/play.log`
