# Range 009 · **watch** · attempt 2

**Matches git ✓** · daemon `58a60046739f` · image `d3773b4e` · plan v2 · continued from r008 (live Store)
dsh `72166dad0`..`7396b931e` · **61 commits** (10 mainline, 51 side) · 2026-07-06 → 2026-07-07
Areas changed: `examples/acp-agent` 30% · `packages/core` 13% · `/` 10% · other 47%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **6.2 MiB** (+63.8 KiB) | **25.9 MiB** (−2.0 MiB) | **4.16×** (prev 4.53×) | **2.6 MiB** | **457** (total 6,385) | **19.8 s** tooling (total 3.1 min) |

**Checks:** 6 pass · 6 watch: Speed fs.rm 1 files: 11.54× baseline (commit); Scaling insufficient same-binary points: 1 of 3 (daemon 58a60046739f); Counters insufficient same-binary points: 1 of 3 (daemon 58a60046739f); Directory share 0.564; Range growth 2.6 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 278 ms for 25.9 MiB new; size exponent not judged (1 snapshots)
**Moved most:** ▲ fs.list p95 +75% · ▲ probe list_commits +59% · ▼ stored added −41%
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

**1,053 calls** · **177 steps** by **8 agents + lead** on **3 Branches + main** · **85 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +32 added · 420 modified · −13 deleted · 5.8 MiB written · fs 423 : Sandbox 42 (**10 : 1**, target ~9 : 1)
**Execs:** 156 (JS 50 · shell 106) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 622 | 427 | 195 | Committed 427 · Text 19 · NoSuchPath 7 · Equal 1 |
| sandbox | 408 | 237 | 0 | commit 81 (Committed 33, UpToDate 47, Conflict 1) · exec 156 (exit:0 156) · mount 85 (Mounted 85) · service 1 (Ready 1) · unmount 85 (Unmounted 85) |
| branch | 19 | 17 | 2 | diff_commits 2 · fork 11 (Forked 11) · merge 4 (Merged 4) · publish 2 (Added 2) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,053** | **681** | **201** |  |

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
| Commit Conflict | 1 / 1 | r009-1, a01 after a02 | 0.1 s |
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
| History: Commits / Layers / Branches | 5,928 | 6,385 / 8 / 35 | +457 |
| Projection at range 202 / disk budget | — | 48.27 GiB / 40% | — |
| Snapshot | — | r009, 25.9 MiB new blocks | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 5,626 | +1,041 | 10.6 KiB | 0 (derived) | 93% |
| Chunks (large files) | 6,714 | +1,170 | 0.5 KiB | — | 1% |
| Large-file extents | 6,591 | — | 0.1 KiB | — | — |
| Directories | 2,216 | 1,487 (with inodes, pooled) | 0.2 KiB | — | 90% |
| Inodes and attributes | 36,094 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.6% at depth cap · 31% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.1 MiB · metadata 1.5 MiB · tracked 2.6 MiB changed in git

## 4. Speed

Daemon `58a60046739f` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 19.8 ms / 253 ms (1.44×) | 5.1 ms / 7.1 ms (1.08×) | 6.2 ms / 19.8 ms (1.18×) | 17.0 ms / 123 ms (1.40×) | 14.0 ms / 117 ms (1.12×) | 189 ms / 189 ms (1.58×) | — (native comparison in P3; exec 39.9 ms / 74.9 ms) |
| SQL p50: 1,387 stmts | 205 stmts | 429 stmts | 167 stmts | 63 stmts | 7,448 stmts | — |

**Commit cost:** 38.16 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 158 ms p50 over 85
**Slowest:** sandbox.exec 884 ms · fs.write 443 ms (18,778 bytes) · sandbox.exec 425 ms · checkpoint diff_commits 0.07 ms and 6.22 statements per entry (216 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 514 MB (−64 MB) over 9 of 9 Sandboxes · 147 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 009.a1 · optimize → fixed · Only the first exchange of sandbox

**1. Trigger** (attempt 1, daemon `c25119ace6ae`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters: oneshot_mount_exec.vm_steps depth exponent | 0.971 | < 0.05 |

**2. Fix context**

|  |  |
| --- | --- |
| Playbook step | D4 |
| Cause | Only the first exchange of sandbox.mount grew (VM steps 786 -> 954 -> 1,194, rows 64 -> 78 -> 96 over ranges 7-9); bind and install were constant. That exchange is project.list_branches: layerfs-api mount_branch found the Branch id by paging every Branch and searching for the name, so each mount cost O(Branches), and the replay adds about 7 Branches per range. S1 fs.rm (9.69x -> 11.84x, commit phase) is in-lane merges with a moved head (4/23 -> 16/26 -> 13/13 merged), recorded as a watch. |
| Old design | A mount resolved its Branch name by paging every Branch through project.list_branches: O(Branches) per mount. |
| New design | project.list_branches with name answers from the name index (one item or none); mount_branch sends the name. |
| Kind | 1 forward-only |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | range-4 fork of p1-pilot-b written by 511dceed, read by daemon 58a60046 through addon 799e3ca6: whole-tree proof checkpoint ok (530 files, 283 blob ids, 285 changed paths) |
| Commits | `bdd4befdc (branch dsh-352-f009)` · regression tests core/crates/layerfs-daemon/tests/sdk_mount_lookup.rs |
| Recovery | Fork p2-main-b's range-7 snapshot (attempt 2), fast-forward range 8, and rerun range 9 measured on daemon 58a60046 and addon 799e3ca6 (lead). |

**3. Before / after** (same snapshots, one sample each)

| Measure | Before | After | Change | Old binary | New binary | Snapshot / checkpoint | Cache |
| --- | --- | --- | --- | --- | --- | --- | --- |
| oneshot_mount_exec VM steps, p2-main-b range-7 snapshot | 1923 steps | 1140 steps | −41% | `daemon c25119ac, addon 5baa0f5d` | `daemon 58a60046, addon 799e3ca6` | p2-main-b range-007 snapshot | fresh daemon on a just-restored Store file; one warm run before the measured run |
| oneshot_mount_exec VM steps, p2-main-b range-9 snapshot | 2331 steps | 1140 steps | −51% | `daemon c25119ac, addon 5baa0f5d` | `daemon 58a60046, addon 799e3ca6` | p2-main-b range-009 snapshot | fresh daemon on a just-restored Store file; one warm run before the measured run |
| mount Branch lookup VM steps, range-9 snapshot | 1242 steps | 51 steps | −96% | `daemon c25119ac, addon 5baa0f5d` | `daemon 58a60046, addon 799e3ca6` | p2-main-b range-009 snapshot | fresh daemon on a just-restored Store file; one warm run before the measured run |
| oneshot_mount_exec statements, range-9 snapshot | 56 statements | 50 statements | −11% | `daemon c25119ac, addon 5baa0f5d` | `daemon 58a60046, addon 799e3ca6` | p2-main-b range-009 snapshot | fresh daemon on a just-restored Store file; one warm run before the measured run |

Counter `oneshot_mount_exec.vm_steps` depth exponent 0.971 → 0.

**4. With vs without the optimization, this range**

| Measure | Attempt 1 (without) · `c25119ace6ae` | Attempt 2 (with) · `58a60046739f` |
| --- | --- | --- |
| Range time (tooling) | 18.7 s | 19.8 s |
| One-shot Commit p50 / p95 | 23.7 / 143.5 ms | 17.0 / 122.9 ms |
| fs.write p50 / p95 | 20.3 / 257.0 ms | 19.8 / 253.1 ms |
| merge p50 / p95 | 187.2 / 187.2 ms | 189.1 / 189.1 ms |
| SQL per one-shot Commit (statements p50) | 167 | 167 |
| Store on disk | 25.9 MiB | 25.9 MiB |
| Space amplification | 4.16× | 4.16× |
| Verdict | optimize | — |

The two columns are separate series under their own binaries; no fit or baseline mixes them.

**5. Cost of the fix:** One optional request field; production LOC +29. No storage change; mount client time within noise (7-9 ms both).

**6. Records:** [fixes/009-a1-mount-branch-lookup.md](../fixes/009-a1-mount-branch-lookup.md) · [OPTIMIZATIONS.md](../OPTIMIZATIONS.md) (009.a1 row and the fs.rm watch) · [BUGS.md](../BUGS.md) (F-022) · finding `~/lfs-history/metrics/finding-009.a1.json`

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
- Attempt 2 (run `p2-main-c`, daemon `58a60046`, addon `799e3ca6`, F-022): recovery forked p2-main-b's range-7 snapshot and fast-forwarded range 8 (checkpoint ok); range 9 replayed measured: watch, checkpoint and full tree ok, conflicts 4/4. Mount probe VM steps 2,331 → 1,140 on the range-9 snapshot (F-022 record). Scaling and counters need 3 same-binary points (1 now).
- Watch: `fs.rm` 1 file at 11.54× the P2 baseline (commit phase; in-lane merges per the fixer's 009.a1 reading). Concurrent load declared: F-020 build (fixer worktree), builder tooling and the one-time `pnpm fetch`.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 930/930; conflicts 4/4; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.rm 1 files: 11.54× baseline (commit) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 58a60046739f) | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 58a60046739f) | < 0.05 | watch |
| Directory share | 0.564 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.0365 (budget 0.3091) | < 0.1 | pass |
| Range growth | 2.6 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 278 ms for 25.9 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.4 | < 0.8 | pass |
| Wall projection | 0.16 | ≤ 1 | pass |

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

Binary: daemon `58a60046739f` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries | 1 | 26.12 | 26.12 | 26.12 | 26.12 | 2.77× | 2.77× | — | — | 2,244 / 38,862 / 0 | — | 0.1209 ms per entrie | — |
| branch.fork | — | 7 | 2.38 | 3.49 | 3.49 | 5.74 | 0.96× | 1.22× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries | 1 | 5.93 | 5.93 | 5.93 | 5.93 | 1.69× | 1.69× | — | — | 477 / 12,045 / 0 | — | 0.1561 ms per entrie | — |
| branch.merge | >64 entries | 2 | 189.13 | 189.13 | 189.13 | 297.12 | 1.58× | 1.58× | — | — | 7,448 / 108,307 / 624 | — | 2.1251 ms per entrie | branch.merge |
| branch.publish | — | 2 | 4.99 | 4.99 | 4.99 | 5.73 | 0.90× | 0.90× | — | — | 173 / 4,263 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 1 | 15.86 | 15.86 | 15.86 | 15.86 | 1.34× | 0.92× | — | — | 1,105 / 47,555 / 1,403 | — | 0.0197 ms per byte | commit |
| fs.apply | ≤64 KiB | 2 | 11.55 | 11.55 | 11.55 | 13.32 | 0.85× | 0.27× | — | — | 372 / 18,484 / 674 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤8 KiB | 2 | 13.92 | 13.92 | 13.92 | 21.39 | 1.12× | 0.73× | — | — | 1,222 / 51,262 / 1,347 | — | 0.0034 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 9 | 6.21 | 7.61 | 7.61 | 8.37 | 1.04× | 0.81× | — | — | 324 / 11,898 / 0 | — | 0.0191 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 8 | 7.32 | 9.29 | 9.29 | 14.06 | 1.01× | 1.17× | — | — | 513 / 14,748 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 9 | 7.23 | 9.61 | 9.61 | 12.82 | 1.22× | 1.41× | — | — | 405 / 11,594 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.glob | 1 files | 2 | 4.53 | 4.53 | 4.53 | 4.92 | 0.97× | 0.89× | — | — | 183 / 5,857 / 0 | — | 4.533 ms per file | — |
| fs.glob | 17–64 files | 7 | 7.04 | 8.55 | 8.55 | 13.20 | 1.15× | 0.94× | — | — | 451 / 15,350 / 0 | — | 0.294 ms per file | — |
| fs.glob | 2–4 files | 6 | 4.48 | 5.11 | 5.11 | 5.93 | 0.97× | 0.76× | — | — | 144 / 6,189 / 0 | — | 1.951 ms per file | — |
| fs.glob | 5–16 files | 6 | 5.68 | 6.03 | 6.03 | 10.32 | 1.16× | 0.68× | — | — | 339 / 9,716 / 0 | — | 0.5676 ms per file | — |
| fs.glob | >64 files | 11 | 21.13 | 40.77 | 40.77 | 207.33 | 2.15× | 2.23× | — | — | 2,007 / 71,513 / 60 | — | 0.0639 ms per file | — |
| fs.grep | 1 files | 1 | 6.21 | 6.21 | 6.21 | 6.21 | 1.27× | 1.14× | — | — | 160 / 7,831 / 0 | — | 6.215 ms per file | sdk.lines |
| fs.grep | 17–64 files | 3 | 11.06 | 11.06 | 11.06 | 12.91 | 1.01× | 0.81× | — | — | 578 / 23,750 / 0 | — | 0.461 ms per file | sdk.lines |
| fs.grep | 2–4 files | 5 | 5.39 | 6.44 | 6.44 | 7.11 | 0.97× | 0.81× | — | — | 298 / 6,440 / 0 | — | 2.2765 ms per file | sdk.lines |
| fs.grep | 5–16 files | 10 | 7.76 | 9.12 | 9.12 | 18.04 | 1.09× | 0.64× | — | — | 438 / 10,674 / 0 | — | 0.9493 ms per file | sdk.lines |
| fs.grep | >64 files | 9 | 21.11 | 27.86 | 27.86 | 127.38 | 1.67× | 1.54× | — | — | 1,947 / 45,518 / 0 | — | 0.0582 ms per file | sdk.lines |
| fs.list | 1 entries | 2 | 4.03 | 4.03 | 4.03 | 4.72 | 0.94× | 0.94× | — | — | 144 / 5,925 / 0 | — | 4.034 ms per entrie | — |
| fs.list | 17–64 entries | 13 | 13.29 | 19.78 | 19.78 | 32.97 | 1.18× | 1.17× | — | — | 856 / 30,730 / 0 | — | 0.5053 ms per entrie | — |
| fs.list | 2–4 entries | 5 | 4.79 | 5.19 | 5.19 | 5.88 | 0.96× | 0.74× | — | — | 276 / 9,677 / 0 | — | 2.3935 ms per entrie | — |
| fs.list | 5–16 entries | 12 | 5.55 | 7.27 | 7.27 | 61.48 | 0.96× | 0.85× | — | — | 261 / 10,606 / 0 | — | 1.0174 ms per entrie | — |
| fs.read | ≤1 KiB | 2 | 5.14 | 5.14 | 5.14 | 6.15 | 1.22× | 1.16× | — | — | 237 / 4,575 / 0 | — | 0.0076 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 25 | 5.09 | 7.07 | 8.78 | 15.74 | 1.08× | 1.06× | — | — | 198 / 6,320 / 0 | — | 0.0018 ms per byte | sdk.lines |
| fs.rm | 1 files | 13 | 115.76 | 218.58 | 218.58 | 248.44 | 9.67× | 11.54× | — | — | 4,242 / 134,918 / 2,091 | — | 115.763 ms per file | commit |
| fs.stat | ≤1 KiB | 3 | 3.96 | 3.96 | 3.96 | 4.76 | 0.74× | 0.68× | — | — | 177 / 3,385 / 0 | — | 0.0097 ms per byte | — |
| fs.stat | ≤512 KiB | 1 | 4.32 | 4.32 | 4.32 | 4.32 | 0.88× | 0.88× | — | — | 81 / 2,767 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB | 20 | 4.54 | 6.52 | 6.52 | 6.77 | 0.98× | 0.84× | — | — | 192 / 5,584 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB | 12 | 4.79 | 6.02 | 6.02 | 6.32 | 0.99× | 1.00× | — | — | 195 / 6,616 / 0 | — | 0.0011 ms per byte | — |
| fs.write | ≤1 KiB | 19 | 51.82 | 236.60 | 236.60 | 277.98 | 4.75× | 6.54× | — | — | 3,116 / 90,282 / 2,025 | — | 0.134 ms per byte | commit |
| fs.write | ≤512 KiB | 4 | 30.43 | 138.45 | 138.45 | 253.14 | 2.15× | 9.79× | — | — | 1,805 / 81,643 / 1,292 | — | 0.0002 ms per byte | commit |
| fs.write | ≤64 KiB | 207 | 20.76 | 271.39 | 333.34 | 442.58 | 1.44× | 2.96× | — | — | 1,392 / 55,762 / 1,358 | — | 0.0015 ms per byte | commit |
| fs.write | ≤8 KiB | 175 | 18.58 | 240.25 | 358.06 | 399.18 | 1.44× | 3.03× | — | — | 1,328 / 53,894 / 1,402 | — | 0.0057 ms per byte | commit |
| operator.store.stats | — | 1 | 2.59 | 2.59 | 2.59 | 2.59 | 0.97× | 0.97× | — | — | — | — | — | — |
| sandbox.commit | 0 files | 47 | 14.43 | 112.22 | 133.10 | 197.67 | 1.40× | 2.72× | — | — | 92 / 10,911 / 615 | — | — | commit |
| sandbox.commit | 1 files | 26 | 16.91 | 90.40 | 122.86 | 343.31 | 0.36× | 1.09× | — | — | 290 / 16,405 / 617 | — | 16.914 ms per file | commit |
| sandbox.commit | 2–4 files | 7 | 61.74 | 118.14 | 118.14 | 123.02 | 2.09× | 1.23× | — | — | 760 / 30,140 / 615 | — | 22.4952 ms per file | commit |
| sandbox.exec | 1 files | 92 | 36.13 | 63.86 | 69.79 | 70.86 | 0.98× | 0.95× | — | — | 0 / 0 / 0 | 4.70 | 36.135 ms per file | — |
| sandbox.exec | 2–4 files | 50 | 52.60 | 72.18 | 75.89 | 76.96 | 1.35× | 0.98× | — | — | 0 / 0 / 0 | 13 | 18.191 ms per file | — |
| sandbox.exec | 5–16 files | 9 | 73.71 | 78.30 | 78.30 | 89.36 | 1.18× | 0.93× | — | — | 0 / 0 / 0 | 30 | 11.1698 ms per file | — |
| sandbox.exec | — | 3 | 424.81 | 424.81 | 424.81 | 884.06 | 1.37× | 1.37× | — | — | 0 / 0 / 0 | 2,205 | — | — |
| sandbox.mount | — | 83 | 14.02 | 117.15 | 226.01 | 228.43 | 1.12× | 2.21× | — | — | 63 / 1,256 / 60 | — | — | sandbox.mount.attach |
| sandbox.service | — | 1 | 230.40 | 230.40 | 230.40 | 230.40 | 0.98× | 0.98× | — | — | — | — | — | — |
| sandbox.unmount | — | 83 | 6.82 | 9.14 | 11.74 | 13.38 | 1.08× | 0.86× | — | — | 0 / 0 / 0 | — | — | — |

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
| sandbox.service | sandbox | 1 | 0.0 KiB | 0.0 KiB | 0 | Ready 1 |
| sandbox.unmount | sandbox | 85 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 85 |

### C. Scale probes

Binary: daemon `58a60046739f`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 4.132 | statements 105, vm_steps 3587, fullscan_steps 0, sorts 0, returned_rows 359 |
| read | 3.388 | statements 108, vm_steps 3605, fullscan_steps 0, sorts 0, returned_rows 360 |
| list_small | 6.7 | statements 258, vm_steps 9415, fullscan_steps 0, sorts 0, returned_rows 950 |
| list_largest | 10.99 | statements 564, vm_steps 31339, fullscan_steps 0, sorts 0, returned_rows 3225 |
| grep_scoped | 4.512 | statements 153, vm_steps 4857, fullscan_steps 0, sorts 0, returned_rows 483 |
| glob_scoped | 3.979 | statements 138, vm_steps 4767, fullscan_steps 0, sorts 0, returned_rows 478 |
| grep_tree | 283.334 | statements 30150, vm_steps 512470, fullscan_steps 0, sorts 0, returned_rows 42605 |
| glob_tree | 16.116 | statements 993, vm_steps 41759, fullscan_steps 0, sorts 0, returned_rows 3992 |
| diff_files | 6.792 | statements 216, vm_steps 7204, fullscan_steps 0, sorts 0, returned_rows 720 |
| list_commits | 6.472 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 3.914 | statements 84, vm_steps 2284, fullscan_steps 0, sorts 0, returned_rows 239 |
| fork | 3.051 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 40.642 | statements 1190, vm_steps 59185, fullscan_steps 1998, sorts 7, returned_rows 4337 |
| oneshot_mount_exec | 61.04 | statements 56, vm_steps 1185, fullscan_steps 60, sorts 2, returned_rows 128 |
| oneshot_commit | 79.459 | statements 382, vm_steps 20142, fullscan_steps 686, sorts 3, returned_rows 1501 |

### D. Storage internals

From the sealed file at snapshot r009: 6,637 pages of 4,096 B, 0 free · Commits 6,415 · Branches 87 · Layers 12.

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 5,626 | 58.5 MiB |
| 2 | 6,714 | 3.3 MiB |
| 3 | 6,591 | 557.3 KiB |
| 5 | 6,591 | 682.3 KiB |
| 6 | 7,545 | 43.6 MiB |
| 7 | 2,216 | 498.3 KiB |
| 9 | 6,990 | 3.3 MiB |
| 10 | 7,061 | 889.5 KiB |
| 11 | 7,907 | 1.1 MiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 6,422 | 8.2 MiB |
| 1 | 11,914 | 6.8 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 4,846 | 18.9 MiB | 3.0 MiB |
| object_location | 764 | 3.0 MiB | 319.6 KiB |
| commit | 479 | 1.9 MiB | 306.5 KiB |
| inode_value | 372 | 1.5 MiB | 39.9 KiB |
| commit_identity | 102 | 408.0 KiB | 56.0 KiB |
| binding_hint | 15 | 60.0 KiB | 9.8 KiB |
| content_signature | 13 | 52.0 KiB | 5.5 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch | 5 | 20.0 KiB | 7.5 KiB |
| branch_names | 3 | 12.0 KiB | 7.4 KiB |
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

**Time 19.8 s** (tooling): play 11.9 · consolidate 0.8 · verify 1.8 · probes 0.6 · tests 0.0 · seal + snapshot 4.2 · report 0.5

19.75 s tooling: prepare 2.37 · play 9.56 · consolidate 0.79 · verify 1.30 (diff_commits + full compareTree) · version walk 0.45 · probes 0.59 · metrics 0.23 · seal 3.67 · sealed figures 0.22 · snapshot copy 0.33

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | c25119ace6ae9a10d6e67618b114c031676e5065680db4e47ab0beb3a1759031 | 2026-10-18T00:13:00.636Z | optimize | Speed: fs.rm 1 files: 11.84× baseline (commit); Scaling: diff_commits: depth exponent 0.569; Counters: oneshot_mount_exec.vm_steps: depth exponent 0.971; Directory share: 0.565; Range growth: 2.6 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 326 ms for 25.9 MiB new; size exponent not judged (2 snapshots) |
| 2 | 58a60046739f3fb1e8c675274cf34afb1f867c08c5cf03db21eb35a2abb569b9 | 2026-10-18T00:25:51.729Z | watch | Speed: fs.rm 1 files: 11.54× baseline (commit); Scaling: insufficient same-binary points: 1 of 3 (daemon 58a60046739f); Counters: insufficient same-binary points: 1 of 3 (daemon 58a60046739f); Directory share: 0.564; Range growth: 2.6 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 278 ms for 25.9 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-009.a1.json`
- `~/lfs-history/metrics/range-009.a2.json`
- `~/lfs-history/metrics/finding-009.a1.json`
- trace `~/lfs-history/runs/p2-main-c/trace/range-009.a2.jsonl` · runner log `~/lfs-history/runs/p2-main-c/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-009.p2-main-c.json`
