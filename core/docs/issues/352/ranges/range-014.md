# Range 014 · **watch** · attempt 2

**Matches git ✓** · daemon `57141b57ac53` · image `d3773b4e` · plan v2 · forked from snapshot r013 (run p2-main-e)
dsh `1d848cf5f`..`6e5c908a1` · **79 commits** (9 mainline, 70 side) · 2026-07-10 → 2026-07-14
Areas changed: `examples/acp-agent` 29% · `packages/ui` 9% · `/` 8% · other 54%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **9.8 MiB** (+884.8 KiB) | **46.5 MiB** (+5.8 MiB) | **4.74×** (prev 4.55×) | **7.8 MiB** | **1,163** (total 10,548) | **26.8 s** tooling (total 5.1 min) |

**Checks:** 6 pass · 7 watch: Speed not judged: branch.publish — · uncontended: baseline class has 1/1/1 calls (minimum 5 per range); 2.44× it; Scaling insufficient same-binary points: 1 of 3 (daemon 57141b57ac53); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters insufficient same-binary points: 1 of 3 (daemon 57141b57ac53); Contended work not judged: no contended class has 3 ranges of 5+ calls; Directory share 0.592; Range growth 7.8 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 380 ms for 46.5 MiB new; size exponent not judged (1 snapshots)
**Moved most:** ▲ fs.write p95 +119% · ▲ fs.read p95 +53% · ▲ metadata added +51%
**Budget:** 15 of 202 ranges · projected total 1.2 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,261 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 2 publishes |
| Steps | 2,173 / 2,173 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**2,451 calls** · **288 steps** by **10 agents + lead** on **4 Branches + main** · **152 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +130 added · 1,049 modified · −36 deleted · 13.4 MiB written · fs 1,100 : Sandbox 115 (**10 : 1**, target ~9 : 1)
**Execs:** 292 (JS 81 · shell 211) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,661 | 1,112 | 549 | Committed 1,112 · Text 61 · NoSuchPath 27 |
| sandbox | 740 | 436 | 0 | commit 144 (Committed 65, UpToDate 78, Conflict 1) · exec 292 (exit:0 292) · mount 152 (Mounted 152) · unmount 152 (Unmounted 152) |
| branch | 42 | 35 | 7 | diff_commits 7 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 2 (Added 2) |
| project | 7 | 0 | 7 | list_commits 7 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,451** | **1,583** | **564** |  |

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
| Merge / publish race | 1 / 1 | lead merge of r014-2 vs r014-1 publish | 1.2 s, merged again |
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

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.

## 3. Storage

**3a. Overview**

|  | Previous (r013) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 8.9 MiB (8.9 MiB / 0.0 KiB / 0.0 KiB) | 9.8 MiB (9.8 MiB / 0.0 KiB / 0.0 KiB) | +884.8 KiB |
| Files / directories / symlinks | 1,161 / 371 / 6 | 1,255 / 393 / 6 | +94 / +22 / +0 |
| Largest file / largest directory | 246.1 KiB / 39 entries | 262.4 KiB (`pnpm-lock.yaml`) / 44 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, sealed) | 40.7 MiB | 46.5 MiB | +5.8 MiB |
| **Space amplification** (total · tracked) | 4.55× · tracked 2.65× | 4.74× · tracked 2.74× | 0.19 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **2.00** (0.30 / 0.51 / —) | 1.16× the median range |
| **Stored per Commit** | 3.2 KiB | 2.8 KiB | — |
| Metadata share | 0.74 | 0.74 | this range 0.59 |
| History: Commits / Layers / Branches | 9,385 | 10,548 / 10 / 69 | +1,163 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 3.34 GiB (Commits 2.05 GiB · installs 1.13 GiB · build 120.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 47.04 GiB / 41% | — |
| Snapshot | — | r014, 46.5 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 11.9 MiB | 1.21 | +1.2 MiB |
| Metadata | 15.0 MiB | 1.53 | +2.0 MiB |
| Index rows | 10.0 MiB | 1.02 | +1.1 MiB |
| Waste | 9.5 MiB | 0.97 | +1.5 MiB |
| Other | 60.0 KiB | 0.01 | +8.0 KiB |
| **Total = Store on disk** | **46.5 MiB** | **= 4.74** space amplification | +5.8 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 9.8 MiB | 26.9 MiB (11.9 MiB + 15.0 MiB) | 2.74× | — | 3.2 MiB | 3.9 MiB | 0.81 |
| `node_modules` | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Build output | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 19.6 MiB | — (not divided) | — | — | — | — |
| **Total** | — | **46.5 MiB** | **= 4.74×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 9,647 | +3,224 | 12.1 KiB | 0 (derived) | 92% |
| Chunks (large files) | 11,308 | +3,583 | 0.6 KiB | — | 2% |
| Large-file extents | 11,038 | — | 0.1 KiB | — | — |
| Directories | 3,059 | 3,917 (with inodes, pooled) | 0.2 KiB | — | 87% |
| Inodes and attributes | 60,014 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.2% at depth cap · 40% of refused bases stopped by budget · `node_modules` reinstall: none this range

## 4. Speed

Daemon `57141b57ac53` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 18.7 ms / 41.1 ms (1.22×) | 2.8 ms / 5.8 ms (1.21×) | 3.0 ms / 7.9 ms (0.96×) | 14.9 ms / 34.3 ms (1.06×) | 12.7 ms / 23.9 ms (0.89×) | 169 ms / 264 ms (2.31×) | — (native comparison in P3; exec 43.7 ms / 93.5 ms) |
| SQL p50: 1,752 stmts | 276 stmts | 264 stmts | 209 stmts | 57 stmts | 9,011 stmts | — |

**Commit cost:** 12.03 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 128 ms p50 over 152
**Slowest:** sandbox.exec 1263 ms · sandbox.exec 620 ms · sandbox.exec 492 ms · checkpoint diff_commits 0.09 ms and 8.04 statements per entry (427 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 526 MB (+288 MB) over 11 of 11 Sandboxes · 153 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 014.a1 · optimize → fixed · The checkpoint diff's memo (F-012, MEMO_PAGES 256) emptied wholesale when full

**1. Trigger** (attempt 1, daemon `6d467539f759`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | branch.diff_commits checkpoint statements per entry (entries exponent 1.604): tree files exponent 1.143 | < 0.05 |

**2. Fix context**

|  |  |
| --- | --- |
| Playbook step | D3 |
| Cause | The checkpoint diff's memo (F-012, MEMO_PAGES 256) emptied wholesale when full. Range 14's diff (427 entries, 224 changed ancestors) is the first to touch more than 256 objects, so every later lookup re-read the inode and directory B-trees' upper pages. Cold on one fork (p2-main-e r13 + r14 fast): statements per entry-or-changed-directory 9.89 / 9.91 / 10.72 / 11.65 over ranges 11-14 with the 256 memo; with an unbounded memo ranges 11-13 are identical and range 14 is 9.33 (readers 5,754 -> 4,248). Not chain position (Store metadata chain mean 3.80-3.83), not hints (writer statements flat per entry, 3.96-4.47), not composition (mean depth 4.38 -> 4.20; parent entries per entry 2.28-2.73). The measured series also mixed cache state (the checkpoint ran at 48% of cold reader work in r13, 70% in r14) |
| Old design | A comparison's memo held at most 256 objects and emptied wholesale when full, losing the upper pages every lookup needs first. |
| New design | The same bound, evicting least recently used objects: the shared upper pages stay, only cold leaves are re-read. |
| Kind | 1 forward-only |
| Old Stores | open unchanged (no schema or stored-byte change) |
| Old data | still read as before |
| Compatibility test | the memo holds objects read within one call and writes nothing; the same p2-main-e-derived Store (fork f009-d014b) read by old addon 7ec591f1 and new 7b90b9fb gives identical diffs for ranges 11-14 (entries and writer statements equal); store-service suite 25/25 |
| Commits | `d85bfdf50 (branch dsh-352-014a1)` · regression tests core/crates/layerfs-content/tests/compare_memo.rs |
| Recovery | Fork p2-main-e range 13, rerun range 14 measured on binaries built from the merge of dsh-352-014a1 and dsh-352-f025-fix1-topdown (lead). |

**3. Before / after** (same snapshots, one sample each)

| Measure | Before | After | Change | Old binary | New binary | Snapshot / checkpoint | Cache |
| --- | --- | --- | --- | --- | --- | --- | --- |
| range-14 checkpoint diff reader statements | 5754 statements | 4743 statements | −18% | `addon 7ec591f1 (daemon 6d467539)` | `addon 7b90b9fb (daemon a2926cf2)` | fork f009-d014b of p2-main-e range 13, range 14 fast | fresh SDK process per diff, one sample |
| range-14 checkpoint diff blob reads | 3933 reads | 3072 reads | −22% | `addon 7ec591f1 (daemon 6d467539)` | `addon 7b90b9fb (daemon a2926cf2)` | fork f009-d014b of p2-main-e range 13, range 14 fast | fresh SDK process per diff, one sample |
| range-14 statements per entry or changed directory | 11.65 statements | 10.09 statements | −13% | `addon 7ec591f1 (daemon 6d467539)` | `addon 7b90b9fb (daemon a2926cf2)` | fork f009-d014b of p2-main-e range 13, range 14 fast | fresh SDK process per diff, one sample |
| ranges 11-13 checkpoint diff reader statements | 3390 / 3330 / 2973 statements | 3390 / 3330 / 2973 statements | ±NaN% | `addon 7ec591f1 (daemon 6d467539)` | `addon 7b90b9fb (daemon a2926cf2)` | fork f009-d014b | fresh SDK process per diff, one sample |

Counter `checkpoint diff reader statements per unit` depth exponent 1.143 → null.

**4. With vs without the optimization, this range**

| Measure | Attempt 1 (without) · `6d467539f759` | Attempt 2 (with) · `57141b57ac53` |
| --- | --- | --- |
| Range time (tooling) | 39.1 s | 26.8 s |
| One-shot Commit p50 / p95 | 22.2 / 251.1 ms | 14.9 / 34.3 ms |
| fs.write p50 / p95 | 21.6 / 446.5 ms | 18.7 / 41.1 ms |
| merge p50 / p95 | 306.0 / 349.1 ms | 168.6 / 264.2 ms |
| SQL per one-shot Commit (statements p50) | 173 | 209 |
| Store on disk | 50.5 MiB | 46.5 MiB |
| Space amplification | 5.14× | 4.74× |
| Verdict | optimize | watch |

The two columns are separate series under their own binaries; no fit or baseline mixes them.

**5. Cost of the fix:** One sort of at most 256 recency stamps per miss batch once full, and 8 bytes per held object; production LOC +16. No storage change.

**6. Records:** [fixes/014-a1-diff-memo-eviction.md](../fixes/014-a1-diff-memo-eviction.md) · [OPTIMIZATIONS.md](../OPTIMIZATIONS.md) (014.a1 row) · finding `~/lfs-history/metrics/finding-014.a1.json`

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
| F-031 | the replay's Workspaces have no `.git` | the builder | after the P3 dev checks, measuring Store growth per git commit (index, loose objects, packs) and the wall time added per range |

### Lead's note (written by the lead; never empty unless the verdict is pass)

- Optimize, a counter trip, so not noise. The end-of-range `branch.diff_commits` check runs 7.27 / 7.00 / 6.65 / 8.99 statements per entry over ranges 11–14 (entries 335 / 310 / 249 / 427), or 10.35 / 10.39 / 10.18 / 13.71 per changed entry. It is judged against tree files, exponent 1.14. The jump is at range 14 only, the largest diff so far. Candidates for the fixer, from earlier findings: the metadata delta-chain position (F-016/F-023 bound probes over one delta-cap period of 8, but this checkpoint is not chain-bounded), and changed ancestors per entry (F-019). The fixer diagnoses 014.a1 from counters on forks of p2-main-e's range-13 snapshot.
- Declared: none of the fixer's or the builder's Docker work ran during this range (03:25:48–03:26:27Z). The fork probe and `diff_files` are flat.
- `oneshot_exec` (new series) has 2 of 3 points, so it is not judged until range 15.
- P2 closes once 014.a1 is resolved. Recovery: fork p2-main-e's range-13 snapshot and rerun 14 measured.

- Attempt 2 (watch), run `p2-main-f`: fork of p2-main-e range 13, 14 measured on daemon `57141b57` and addon `438bae05`, built from `9815dbc95` (014.a1 memo eviction plus F-025 fix 1). Played 03:55:15–03:55:42Z on a quiet crew. Docker VM load was 2.5–3.5. The Mac's 1-min load was about 9.5 from work outside the crew. It was judged against the new P2 baseline `baseline-57141b57ac53-438bae05ad7c-p2.json`.
- 014.a1 effect: the checkpoint `diff_commits` ran 8.99 → 8.04 statements per entry (5,853 → 5,232 for the same 427 entries) and 13.71 → 12.25 per changed entry. That is still above ranges 11–13 (6.65–7.27) in this unit. In the fixer's unit (entries plus changed directories) it is 10.09, within 9.89–10.72. Scaling and Counters are blind for two more ranges on this binary, so the next lead watches this counter at ranges 15–16.
- Activity's Commit total was corrected by the builder's `fix-overview --samples` (e90fdedab), applied once from the stored trace and marked. Scale-probe Commits (22) are shown on their own line.
- Daemon memory (526 MB) is the sum over 11 daemons, about 48 MB each, not growth; see RESULTS P2.
- P2 closes here (owner: stop after range 14 and hand off).

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2173/2173; conflicts 4/4; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: branch.publish — · uncontended: baseline class has 1/1/1 calls (minimum 5 per range); 2.44× it | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 57141b57ac53); also not judged: oneshot_exec: 1 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 57141b57ac53) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.592 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0317 (budget 0.4048) | < 0.1 | pass |
| Range growth | 7.8 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 380 ms for 46.5 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.18 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 288 | 288 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 1163 | 1165 |
| Workspaces (one-shot share) | 152 (0.99) | 141 (0.986) |
| Reads | 508 | 508 |
| Reconcile writes | 45 | 45 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `57141b57ac53` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries · uncontended | 2 | 15.86 | 15.86 | 15.86 | 40.29 | 2.41× | 2.41× | — | — | 960 / 38,152 / 0 | — | 0.0805 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.40 | 1.32 | 1.32 | 1.37 | 0.62× | 1.21× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 264.22 | 264.22 | 264.22 | 335.95 | 2.31× | 2.31× | — | — | 11,065 / 187,380 / 915 | — | 3.2936 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · contended | 1 | 5.00 | 5.00 | 5.00 | 5.00 | 2.02× | 2.02× | — | — | 892 / 22,835 / 0 | — | 0.0562 ms per entrie | — |
| branch.publish | — · contended | 1 | 3.86 | 3.86 | 3.86 | 3.86 | 1.05× | 1.05× | — | — | 583 / 15,093 / 0 | — | — | — |
| branch.publish | — · uncontended | 1 | 10.14 | 10.14 | 10.14 | 10.14 | 2.44× | 2.44× | — | — | 2,346 / 60,950 / 0 | — | — | — |
| fs.apply | ≤1 KiB · contended | 26 | 20.30 | 38.98 | 44.44 | 51.10 | 1.90× | 2.46× | — | — | 1,711 / 86,481 / 2,739 | — | 0.0509 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 1 | 9.08 | 9.08 | 9.08 | 9.08 | 1.45× | 1.44× | — | — | 910 / 40,910 / 944 | — | 0.0228 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 10 | 17.52 | 27.73 | 27.73 | 32.87 | 1.56× | 1.61× | — | — | 1,200 / 58,015 / 1,869 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 2 | 9.95 | 9.95 | 9.95 | 14.77 | 1.26× | 0.98× | — | — | 252 / 18,721 / 936 | — | 0.0003 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 41 | 23.91 | 39.32 | 40.04 | 46.67 | 2.02× | 2.37× | — | — | 2,084 / 87,597 / 2,740 | — | 0.0053 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 2 | 9.14 | 9.14 | 9.14 | 11.53 | 1.30× | 1.09× | — | — | 853 / 38,659 / 934 | — | 0.0015 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 30 | 4.39 | 8.14 | 11.02 | 14.35 | 1.41× | 1.56× | — | — | 347 / 14,256 / 0 | — | 0.0236 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 4 | 2.63 | 3.51 | 3.51 | 4.74 | 0.73× | 0.75× | — | — | 153 / 5,239 / 0 | — | — | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 25 | 4.57 | 7.64 | 8.88 | 14.39 | 1.06× | 1.58× | — | — | 439 / 18,133 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 4 | 3.62 | 3.83 | 3.83 | 4.95 | 1.29× | 1.09× | — | — | 276 / 9,621 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 18 | 4.78 | 7.95 | 7.95 | 9.79 | 1.52× | 2.28× | — | — | 459 / 16,368 / 0 | — | 0.001 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 2 | 3.87 | 3.87 | 3.87 | 4.68 | 1.19× | 1.19× | — | — | 258 / 10,705 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 2.72 | 2.72 | 2.72 | 2.72 | 1.28× | 1.22× | — | — | 318 / 10,765 / 0 | — | 2.717 ms per file | — |
| fs.glob | 17–64 files · contended | 12 | 6.06 | 8.57 | 8.57 | 14.06 | 1.57× | 1.43× | — | — | 616 / 22,568 / 60 | — | 0.2388 ms per file | — |
| fs.glob | 17–64 files · uncontended | 2 | 4.18 | 4.18 | 4.18 | 4.55 | 2.19× | 2.19× | — | — | 252 / 12,655 / 0 | — | 0.0995 ms per file | — |
| fs.glob | 2–4 files · contended | 8 | 2.89 | 3.95 | 3.95 | 6.75 | 1.23× | 1.30× | — | — | 241 / 7,913 / 0 | — | 1.334 ms per file | — |
| fs.glob | 5–16 files · contended | 36 | 3.20 | 9.11 | 10.60 | 11.52 | 1.41× | 2.99× | — | — | 363 / 12,018 / 0 | — | 0.4506 ms per file | — |
| fs.glob | 5–16 files · uncontended | 6 | 3.02 | 3.55 | 3.55 | 5.29 | 1.36× | 1.59× | — | — | 210 / 7,029 / 0 | — | 0.3587 ms per file | — |
| fs.glob | >64 files · contended | 15 | 33.81 | 212.53 | 212.53 | 228.75 | 3.70× | 16.49× | — | — | 2,942 / 135,769 / 2,808 | — | 0.0593 ms per file | — |
| fs.grep | 17–64 files · contended | 14 | 15.84 | 30.01 | 30.01 | 41.02 | 1.97× | 2.54× | — | — | 1,809 / 53,575 / 1,021 | — | 0.6342 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 2 | 7.03 | 7.03 | 7.03 | 7.48 | 1.25× | 1.25× | — | — | 528 / 13,533 / 0 | — | 0.1673 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 12 | 3.76 | 7.39 | 7.39 | 10.12 | 1.18× | 1.97× | — | — | 303 / 11,425 / 0 | — | 1.6825 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 42 | 6.43 | 12.85 | 13.87 | 27.67 | 1.65× | 2.75× | — | — | 756 / 26,487 / 60 | — | 0.8996 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 2 | 2.44 | 2.44 | 2.44 | 7.68 | 0.73× | 0.70× | — | — | 189 / 7,501 / 0 | — | 0.4876 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 12 | 29.52 | 95.08 | 95.08 | 126.82 | 2.98× | 7.83× | — | — | 1,863 / 65,500 / 1,019 | — | 0.0377 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 3 | 7.68 | 7.68 | 7.68 | 20.38 | 1.11× | 1.11× | — | — | 570 / 22,807 / 0 | — | 0.0173 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 18 | 4.37 | 8.30 | 8.30 | 9.93 | 1.94× | 3.68× | — | — | 315 / 14,981 / 0 | — | 0.1355 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 2 | 2.98 | 2.98 | 2.98 | 4.24 | 1.37× | 1.37× | — | — | 156 / 7,831 / 0 | — | 0.1192 ms per entrie | — |
| fs.list | 2–4 entries · contended | 8 | 3.71 | 6.46 | 6.46 | 13.33 | 1.80× | 2.25× | — | — | 213 / 7,826 / 0 | — | 1.4315 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 3 | 2.39 | 2.39 | 2.39 | 7.57 | 1.15× | 0.96× | — | — | 144 / 4,853 / 0 | — | 0.9965 ms per entrie | — |
| fs.list | 5–16 entries · contended | 48 | 2.82 | 4.61 | 8.65 | 9.99 | 1.32× | 1.60× | — | — | 264 / 9,557 / 0 | — | 0.4724 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 7 | 1.98 | 2.12 | 2.12 | 2.41 | 0.96× | 0.87× | — | — | 144 / 5,477 / 0 | — | 0.3964 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 10 | 3.24 | 4.51 | 4.51 | 4.86 | 1.34× | 1.87× | — | — | 333 / 10,489 / 0 | — | 0.0042 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 6 | 2.70 | 3.07 | 3.07 | 4.14 | 0.67× | 0.77× | — | — | 276 / 8,924 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 2.37 | 2.37 | 2.37 | 2.37 | 1.01× | 1.01× | — | — | 159 / 5,807 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 56 | 2.79 | 7.44 | 8.19 | 8.90 | 1.29× | 2.14× | — | — | 285 / 9,128 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 9 | 2.47 | 4.01 | 4.01 | 5.51 | 1.21× | 1.68× | — | — | 201 / 6,229 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 35 | 29.28 | 49.35 | 54.35 | 54.53 | 3.32× | 3.19× | — | — | 2,664 / 118,345 / 3,800 | — | 29.276 ms per file | commit |
| fs.rm | 1 files · uncontended | 1 | 7.30 | 7.30 | 7.30 | 7.30 | 1.05× | 0.76× | — | — | 728 / 42,699 / 975 | — | 7.302 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 10 | 2.44 | 6.53 | 6.53 | 7.76 | 0.74× | 1.97× | — | — | 248 / 6,947 / 0 | — | 0.0048 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 1.01 | 1.01 | 1.01 | 1.01 | 0.53× | 0.53× | — | — | 72 / 2,611 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 24 | 2.12 | 5.37 | 6.10 | 7.63 | 0.98× | 2.37× | — | — | 210 / 7,721 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 4 | 1.75 | 2.00 | 2.00 | 2.64 | 1.08× | 0.94× | — | — | 108 / 4,450 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 34 | 2.43 | 4.91 | 6.08 | 6.75 | 1.38× | 1.97× | — | — | 214 / 6,902 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 8 | 1.67 | 2.38 | 2.38 | 2.58 | 0.79× | 0.95× | — | — | 111 / 3,930 / 0 | — | 0.0004 ms per byte | — |
| fs.write | ≤1 KiB · contended | 64 | 22.70 | 41.87 | 54.72 | 57.55 | 2.47× | 2.61× | — | — | 2,072 / 87,849 / 2,856 | — | 0.0379 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 4 | 8.91 | 10.72 | 10.72 | 15.72 | 1.37× | 1.29× | — | — | 541 / 22,873 / 945 | — | 0.0116 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 13 | 27.37 | 34.59 | 34.59 | 36.27 | 1.66× | 2.10× | — | — | 2,028 / 85,230 / 2,812 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 1 | 11.50 | 11.50 | 11.50 | 11.50 | 1.06× | 1.06× | — | — | 468 / 25,145 / 975 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 316 | 22.50 | 43.55 | 53.39 | 64.59 | 1.91× | 1.79× | — | — | 2,181 / 95,325 / 2,883 | — | 0.0013 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 43 | 8.69 | 10.69 | 15.18 | 23.16 | 1.17× | 0.88× | — | — | 484 / 23,690 / 975 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 479 | 18.25 | 40.13 | 52.04 | 71.29 | 1.67× | 1.63× | — | — | 1,725 / 75,560 / 2,704 | — | 0.0039 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 62 | 7.97 | 11.31 | 15.49 | 17.50 | 1.22× | 1.18× | — | — | 451 / 23,016 / 974 | — | 0.0015 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.06 | 1.06 | 1.06 | 1.06 | 1.96× | 1.96× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · UpToDate · contended | 71 | 12.57 | 20.24 | 25.31 | 34.27 | 1.18× | 0.98× | — | — | 83 / 15,188 / 896 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · uncontended | 7 | 9.18 | 9.62 | 9.62 | 10.00 | 1.06× | 0.82× | — | — | 71 / 15,194 / 914 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 27 | 18.42 | 28.59 | 31.26 | 42.53 | 1.00× | 1.13× | — | — | 540 / 26,506 / 903 | — | 18.42 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 3 | 13.63 | 13.63 | 13.63 | 19.64 | 1.21× | 1.21× | — | — | 371 / 20,020 / 912 | — | 13.635 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 58.56 | 58.56 | 58.56 | 58.56 | 1.14× | 1.14× | — | — | 2,510 / 65,657 / 908 | — | 58.56 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 26 | 22.10 | 39.18 | 46.17 | 53.36 | 1.10× | 1.36× | — | — | 643 / 28,653 / 901 | — | 10.357 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 1 | 16.30 | 16.30 | 16.30 | 16.30 | 1.21× | 1.21× | — | — | 733 / 29,657 / 915 | — | 4.074 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 29.24 | 29.24 | 29.24 | 31.83 | 1.52× | 1.52× | — | — | 1,102 / 35,652 / 912 | — | 4.874 ms per file | commit |
| sandbox.exec | 1 files · contended | 96 | 38.62 | 62.13 | 73.73 | 78.70 | 0.96× | 0.82× | — | — | 0 / 0 / 0 | 4.70 | 38.621 ms per file | observe.after |
| sandbox.exec | 1 files · uncontended | 8 | 39.98 | 42.66 | 42.66 | 48.41 | 0.94× | 0.83× | — | — | 0 / 0 / 0 | 4 | 39.976 ms per file | observe.after |
| sandbox.exec | 17–64 files · contended | 6 | 90.04 | 103.78 | 103.78 | 138.39 | 1.19× | 1.19× | — | — | 0 / 0 / 0 | 93 | 4.5719 ms per file | observe.after |
| sandbox.exec | 17–64 files · uncontended | 1 | 85.20 | 85.20 | 85.20 | 85.20 | 0.92× | 0.92× | — | — | 0 / 0 / 0 | 97 | 5.0119 ms per file | observe.after |
| sandbox.exec | 2–4 files · contended | 113 | 44.84 | 76.22 | 85.57 | 101.77 | 1.06× | 1.08× | — | — | 0 / 0 / 0 | 9.70 | 17.617 ms per file | observe.after |
| sandbox.exec | 2–4 files · uncontended | 6 | 34.37 | 43.72 | 43.72 | 51.71 | 0.83× | 0.61× | — | — | 0 / 0 / 0 | 11.30 | 10.9 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 49 | 73.26 | 97.97 | 107.21 | 117.40 | 1.08× | 1.20× | — | — | 0 / 0 / 0 | 35 | 8.3079 ms per file | observe.after |
| sandbox.exec | — · uncontended | 3 | 620 | 620 | 620 | 1263.25 | 1.95× | 1.95× | — | — | 0 / 0 / 0 | 3,231 | — | observe.after |
| sandbox.mount | — · contended | 124 | 13.21 | 23.93 | 26.50 | 27.90 | 1.17× | 1.24× | — | — | 57 / 1,205 / 60 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 18 | 9.01 | 11.93 | 11.93 | 12.15 | 0.89× | 0.99× | — | — | 57 / 1,205 / 60 | — | — | observe.after |
| sandbox.unmount | — · contended | 125 | 7.50 | 12.64 | 14.41 | 18.04 | 1.02× | 1.22× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 17 | 7.04 | 8.90 | 8.90 | 9.76 | 0.93× | 0.93× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 7 | 0.0 KiB | 103.9 KiB | 432 | ok 7 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 7 | 0.0 KiB | 60.1 KiB | 103 | ok 7 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 94 | 479.2 KiB | 0.0 KiB | 104 | Committed 94 |
| fs.diff_files | fs | 88 | 0.0 KiB | 632.6 KiB | 61 | Text 61, NoSuchPath 27 |
| fs.glob | fs | 90 | 0.0 KiB | 52.1 KiB | 782 | ok 90 |
| fs.grep | fs | 97 | 0.0 KiB | 332.4 KiB | 1,384 | ok 97 |
| fs.list | fs | 98 | 0.0 KiB | 141.4 KiB | 1,201 | ok 98 |
| fs.read | fs | 87 | 0.0 KiB | 362.7 KiB | 87 | ok 87 |
| fs.rm | fs | 36 | 0.0 KiB | 0.0 KiB | 36 | Committed 36 |
| fs.stat | fs | 89 | 0.0 KiB | 18.9 KiB | 89 | ok 89 |
| fs.write | fs | 982 | 11.7 MiB | 0.0 KiB | 982 | Committed 982 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 144 | 0.0 KiB | 0.0 KiB | 0 | Committed 65, UpToDate 78, Conflict 1 |
| sandbox.exec | sandbox | 292 | 1.8 MiB | 201.6 KiB | 0 | exit:0 292 |
| sandbox.mount | sandbox | 152 | 0.0 KiB | 0.0 KiB | 0 | Mounted 152 |
| sandbox.unmount | sandbox | 152 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 152 |

### C. Scale probes

Binary: daemon `57141b57ac53`.

Load average (1-min, runner (Docker VM kernel)): start 2.51 · end 3.45.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.681 | 2.291 · 1.732 · 1.58 · 1.681 · 1.465 | 3.45–3.45 | statements 42, vm_steps 2957, fullscan_steps 0, sorts 0, returned_rows 308 |
| read | 1.533 | 1.538 · 1.465 · 1.379 · 1.533 · 1.828 | 3.45–3.45 | statements 45, vm_steps 2975, fullscan_steps 0, sorts 0, returned_rows 309 |
| list_small | 1.703 | 1.796 · 1.703 · 1.83 · 1.535 · 1.386 | 3.45–3.45 | statements 54, vm_steps 3927, fullscan_steps 0, sorts 0, returned_rows 410 |
| list_largest | 5.087 | 5.44 · 5.645 · 4.859 · 4.892 · 5.087 | 3.45–3.45 | statements 276, vm_steps 15765, fullscan_steps 0, sorts 0, returned_rows 1499 |
| grep_scoped | 1.724 | 2.037 · 1.759 · 1.724 · 1.398 · 1.615 | 3.45–3.45 | statements 69, vm_steps 4017, fullscan_steps 0, sorts 0, returned_rows 415 |
| glob_scoped | 1.654 | 1.843 · 1.681 · 1.654 · 1.433 · 1.576 | 3.45–3.45 | statements 54, vm_steps 3927, fullscan_steps 0, sorts 0, returned_rows 410 |
| grep_tree | 432.201 | 425.868 · 432.201 · 425.902 · 437.576 · 461.465 | 3.45–3.45 | statements 46269, vm_steps 805025, fullscan_steps 0, sorts 0, returned_rows 64988 |
| glob_tree | 14.968 | 16.416 · 14.327 · 14.968 · 14.412 · 15.356 | 3.45–3.45 | statements 1080, vm_steps 50626, fullscan_steps 0, sorts 0, returned_rows 4796 |
| diff_files | 2.313 | 2.837 · 2.313 · 2.201 · 2.394 · 2.297 | 3.45–3.45 | statements 90, vm_steps 5944, fullscan_steps 0, sorts 0, returned_rows 618 |
| list_commits | 0.755 | 0.973 · 0.755 · 0.677 · 0.807 · 0.659 | 3.45–3.45 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 1.44 | 1.576 · 1.65 · 1.38 · 1.44 · 1.32 | 3.45–3.45 | statements 84, vm_steps 2570, fullscan_steps 0, sorts 0, returned_rows 296 |
| fork | 0.457 | 0.467 · 0.457 · 0.345 · 0.318 · 1.802 | 3.45–3.45 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 35.399 | 35.803 · 35.399 · 36.284 · 31.094 · 35.123 | 3.45–3.45 | statements 803, vm_steps 68168, fullscan_steps 2874, sorts 7, returned_rows 5014 |
| oneshot_mount_unmount | 16.587 | 17.765 · 18.12 · 15.239 · 15.599 · 16.587 | 3.45–3.45 | statements 50, vm_steps 1134, fullscan_steps 60, sorts 2, returned_rows 126 |
| oneshot_commit | 78.648 | 80.647 · 77.864 · 78.648 · 74.729 · 78.957 | 3.45–3.45 | statements 256, vm_steps 23966, fullscan_steps 978, sorts 3, returned_rows 1802 |
| oneshot_exec | 1.408 | 1.61 · 1.408 · 1.395 · 1.259 · 3.098 | 3.45–3.45 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r014: 11,896 pages of 4,096 B, 0 free · Commits 10,612 · Branches 168 · Layers 18 · compression 7.63× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 9,647 | 113.7 MiB |
| 2 | 11,308 | 6.9 MiB |
| 3 | 11,038 | 945.6 KiB |
| 5 | 11,038 | 1.1 MiB |
| 6 | 12,427 | 71.4 MiB |
| 7 | 3,059 | 662.7 KiB |
| 9 | 11,828 | 7.3 MiB |
| 10 | 11,899 | 1.5 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 10,624 | 15.0 MiB |
| 1 | 19,925 | 11.9 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 8,983 | 35.1 MiB | 6.6 MiB |
| object_location | 1,283 | 5.0 MiB | 575.8 KiB |
| commit | 797 | 3.1 MiB | 509.9 KiB |
| inode_value | 569 | 2.2 MiB | 80.6 KiB |
| commit_identity | 166 | 664.0 KiB | 81.7 KiB |
| binding_hint | 21 | 84.0 KiB | 14.2 KiB |
| content_signature | 19 | 76.0 KiB | 7.5 KiB |
| branch | 8 | 32.0 KiB | 7.7 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch_names | 4 | 16.0 KiB | 7.1 KiB |
| branch_identity | 3 | 12.0 KiB | 5.4 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 2.5 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 2.5 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 26.8 s** (tooling): play 13.1 · consolidate 1.2 · verify 2.6 · probes 3.3 · tests 0.0 · seal + snapshot 5.3 · report 1.3

26.78 s tooling: prepare 3.33 · play 9.72 · consolidate 1.21 · verify 1.96 (diff_commits + full compareTree) · version walk 0.64 · probes 3.29 · metrics 1.12 · seal 4.44 · sealed figures 0.43 · snapshot copy 0.44 · report 0.16

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 6d467539f7590c6125c9000e8ef7ee5518f0e893aa1ae30c7e5851fc67759026 | 2026-10-18T03:25:47.795Z | optimize | Speed: not judged: fs.glob >64 files · uncontended: baseline class has 0/2/2 calls (minimum 5 per range); 3.11× it; Scaling: branch.diff_commits checkpoint statements per entry (entries exponent 1.604): tree files exponent 1.143; also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: list_largest.returned_rows per entry of the largest directory: depth exponent 0.137; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (30 classes too narrow); Directory share: 0.595 |
| 2 | 57141b57ac5359b8aee9a0b8d2d946536b0da6b71efd33a14d72cac7e9007aeb | 2026-10-18T03:55:18.931Z | watch | Speed: not judged: branch.publish — · uncontended: baseline class has 1/1/1 calls (minimum 5 per range); 2.44× it; Scaling: insufficient same-binary points: 1 of 3 (daemon 57141b57ac53); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 57141b57ac53); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Directory share: 0.592; Range growth: 7.8 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 380 ms for 46.5 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-014.a1.json`
- `~/lfs-history/metrics/range-014.a2.json`
- `~/lfs-history/metrics/finding-014.a1.json`
- trace `~/lfs-history/runs/p2-main-f/trace/range-014.a2.jsonl` · runner log `~/lfs-history/runs/p2-main-f/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-014.json`
