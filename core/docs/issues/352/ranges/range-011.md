# Range 011 · **watch** · attempt 2

**Matches git ✓** · daemon `6d467539f759` · image `d3773b4e` · plan v2 · continued from r010 (live Store)
dsh `08fc8467b`..`a5c972b7a` · **87 commits** (7 mainline, 80 side) · 2026-06-25 → 2026-07-10
Areas changed: `examples/acp-agent` 39% · `packages/core` 10% · `/` 7% · other 44%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **7.7 MiB** (+1.0 MiB) | **32.7 MiB** (+868.0 KiB) | **4.24×** (prev 4.76×) | **6.3 MiB** | **960** (total 7,783) | **36.9 s** tooling (total 4.0 min) |

**Checks:** 6 pass · 7 watch: Speed not judged: branch.merge >64 entries · Merged (new Commit) · uncontended: baseline class has 1/2/2 calls (minimum 5 per range); 2.27× it; Scaling insufficient same-binary points: 1 of 3 (daemon 6d467539f759); Counters insufficient same-binary points: 1 of 3 (daemon 6d467539f759); Contended work not judged: no contended class has 3 ranges of 5+ calls; Directory share 0.561; Range growth 6.3 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 375 ms for 32.7 MiB new; size exponent not judged (1 snapshots)
**Moved most:** ▲ stored added +130% · ▲ metadata added +128% · ▲ range time +121%
**Budget:** 12 of 202 ranges · projected total 1.2 h (budget 6.7 h) · disk 41% of budget at range 202

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
| Commit Conflict | 1 / 1 | r011-1, a02 after a01 | 0.2 s |
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

**3a. Overview**

|  | Previous (r010) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 6.7 MiB (6.7 MiB / 0.0 KiB / 0.0 KiB) | 7.7 MiB (7.7 MiB / 0.0 KiB / 0.0 KiB) | +1.0 MiB |
| Files / directories / symlinks | 950 / 304 / 6 | 1,051 / 329 / 6 | +101 / +25 / +0 |
| Largest file / largest directory | 231.6 KiB / 35 entries | 238.1 KiB (`pnpm-lock.yaml`) / 38 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, sealed) | 31.8 MiB | 32.7 MiB | +868.0 KiB |
| **Space amplification** (total · tracked) | 4.76× | 4.24× · tracked 2.45× | -0.52 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **1.74** (0.34 / 0.42 / —) | 1.01× the median range |
| **Stored per Commit** | — | 2.9 KiB | — |
| Metadata share | 0.65 | 0.74 | this range 0.56 |
| History: Commits / Layers / Branches | 6,823 | 7,783 / 9 / 45 | +960 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 3.35 GiB (Commits 2.07 GiB · installs 1.13 GiB · build 120.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 47.78 GiB / 41% | — |
| Snapshot | — | r011, 32.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 8.5 MiB | 1.10 | — |
| Metadata | 10.4 MiB | 1.35 | — |
| Index rows | 7.5 MiB | 0.98 | — |
| Waste | 6.2 MiB | 0.81 | — |
| Other | 44.0 KiB | 0.01 | — |
| **Total = Store on disk** | **32.7 MiB** | **= 4.24** space amplification | — |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 7.7 MiB | 18.9 MiB (8.5 MiB + 10.4 MiB) | 2.45× | — | 2.7 MiB | 3.6 MiB | 0.76 |
| `node_modules` | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Build output | 0.0 KiB | 0.0 KiB (0.0 KiB + 0.0 KiB) | — | — | 0 | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 13.8 MiB | — (not divided) | — | — | — | — |
| **Total** | — | **32.7 MiB** | **= 4.24×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 6,939 | +2,838 | 11.1 KiB | 0 (derived) | 88% |
| Chunks (large files) | 8,263 | +3,219 | 0.6 KiB | — | 2% |
| Large-file extents | 8,076 | — | 0.1 KiB | — | — |
| Directories | 2,589 | 4,009 (with inodes, pooled) | 0.2 KiB | — | 89% |
| Inodes and attributes | 44,612 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.2% at depth cap · 27% of refused bases stopped by budget · `node_modules` reinstall: none this range

## 4. Speed

Daemon `6d467539f759` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 21.3 ms / 347 ms (1.13×) | 2.8 ms / 7.9 ms (0.78×) | 2.8 ms / 6.2 ms (1.04×) | 19.1 ms / 166 ms (1.00×) | 15.8 ms / 125 ms (0.96×) | 176 ms / 265 ms (2.27×) | — (native comparison in P3; exec 46.1 ms / 91.3 ms) |
| SQL p50: 1,720 stmts | 288 stmts | 288 stmts | 167 stmts | 57 stmts | 7,287 stmts | — |

**Commit cost:** 45.44 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 185 ms p50 over 121
**Slowest:** sandbox.exec 1224 ms · fs.write 659 ms (5,506 bytes) · sandbox.exec 608 ms · checkpoint diff_commits 0.09 ms and 7.27 statements per entry (335 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 483 MB (−78 MB) over 11 of 11 Sandboxes · 153 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 011.a1 · optimize → fixed · Same directory every range (examples/acp-agent/tests/snapshots, 34/35/38 entries)

**1. Trigger** (attempt 1, daemon `58a60046739f`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling: list_largest per entry depth exponent; Counters: list_largest.statements per entry depth exponent | 0.782; 1.834 | < 0.15; < 0.05 |

**2. Fix context**

|  |  |
| --- | --- |
| Playbook step | D3 |
| Cause | Same directory every range (examples/acp-agent/tests/snapshots, 34/35/38 entries). fs.list looked each entry up separately from the inode table's root (TreeTable::value) with a 64 KiB Store cache, so every entry re-read the table's upper levels and their delta chains: 16.6 -> 24.3 statements per entry (r9 -> r11), reproduced exactly on forks. Not mainly the F-016 chain cycle: after the fix a +16% residual per entry remains, the leaves' chain position (bounded, gate). Not F-025 (no merge in a listing). S1 fs.apply <=8 KiB 20.11x: the captured namespace construct 'update' phase on one Branch (378/331 ms), not merges and not F-025's merge.paths; a watch. |
| Old design | One inode-table descent per listed entry, uncached: O(table levels x chain depth) per entry. |
| New design | One memo per call and one batched lookup per page: upper pages read once, an entry costs its share of the leaves. |
| Kind | 1 forward-only |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | range-4 fork of p1-pilot-b written by 511dceed, read by daemon 0cc2a732 (addon 799e3ca6): whole-tree proof checkpoint ok (530 files) |
| Commits | `e20ddd08e (branch dsh-352-f011)` · regression tests core/crates/layerfs-daemon/tests/sdk_list_entries.rs |
| Recovery | Fork p2-main-c's range-9 snapshot, fast-forward range 10, rerun range 11 measured on daemon 0cc2a732 (lead). |

**3. Before / after** (same snapshots, one sample each)

| Measure | Before | After | Change | Old binary | New binary | Snapshot / checkpoint | Cache |
| --- | --- | --- | --- | --- | --- | --- | --- |
| list_largest statements, p2-main-c range-9 snapshot (34 entries) | 564 statements | 210 statements | −63% | `daemon 58a60046` | `daemon 0cc2a732` | p2-main-c range-009 snapshot | fresh daemon on a just-restored Store file; one warm call before the measured call |
| list_largest statements, p2-main-c range-11 snapshot (38 entries) | 924 statements | 273 statements | −70% | `daemon 58a60046` | `daemon 0cc2a732` | p2-main-c range-011 snapshot | fresh daemon on a just-restored Store file; one warm call before the measured call |
| list_largest statements per entry, range 11 | 24.32 statements | 7.18 statements | −70% | `daemon 58a60046` | `daemon 0cc2a732` | p2-main-c range-011 snapshot | fresh daemon on a just-restored Store file; one warm call before the measured call |
| list_largest blob reads, range 11 | 789 reads | 225 reads | −71% | `daemon 58a60046` | `daemon 0cc2a732` | p2-main-c range-011 snapshot | fresh daemon on a just-restored Store file; one warm call before the measured call |

Counter `list_largest.statements per entry` depth exponent 1.834 → null.

**4. With vs without the optimization, this range**

| Measure | Attempt 1 (without) · `58a60046739f` | Attempt 2 (with) · `6d467539f759` |
| --- | --- | --- |
| Range time (tooling) | 34.6 s | 36.9 s |
| One-shot Commit p50 / p95 | 19.7 / 190.5 ms | 19.1 / 166.3 ms |
| fs.write p50 / p95 | 29.1 / 328.3 ms | 21.3 / 347.5 ms |
| merge p50 / p95 | 277.7 / 364.9 ms | 176.4 / 264.5 ms |
| SQL per one-shot Commit (statements p50) | 167 | 167 |
| Store on disk | 32.8 MiB | 32.7 MiB |
| Space amplification | 4.25× | 4.24× |
| Verdict | optimize | — |

The two columns are separate series under their own binaries; no fit or baseline mixes them.

**5. Cost of the fix:** At most 256 cached objects per fs.list call; production LOC +8. No storage change.

**6. Records:** [fixes/011-a1-list-entry-lookups.md](../fixes/011-a1-list-entry-lookups.md) · [OPTIMIZATIONS.md](../OPTIMIZATIONS.md) (011.a1 row and the fs.apply watch) · [BUGS.md](../BUGS.md) (F-026) · finding `~/lfs-history/metrics/finding-011.a1.json`

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

- Optimize: `list_largest` per entry of the largest directory rises with depth (time exponent 0.78, statements per entry 1.83) over ranges 9–11 on `58a60046`. SPEC §4: list may grow with that directory's entries only; this is per entry, so a finding. Possibly the largest directory's metadata chain (it is rewritten often); the fixer decides from counters. Snapshot taken at range 11.
- Also to the fixer in this cycle (S1): `fs.apply` ≤8 KiB at 20.11× the P2 baseline (commit phase). Concurrent load declared as for range 10.
- Action: fixer diagnoses 011.a1; recovery forks the range-11 snapshot? No: it continues at 12; range 10 has no snapshot, so recovery forks range 9 (p2-main-c), fast-forwards 10 and reruns 11 measured.

- Attempt 2 (watch), run `p2-main-d`: forked from p2-main-c's range-9 snapshot, range 10 fast, 11 measured. Binaries: daemon `6d467539` and Linux addon `7ec591f1`, i.e. F-026's fix plus F-020, not `0cc2a732` as the recovery row says. It played in the runner container against the phase-matched baseline `baseline-6d467539f759-7ec591f14985-p2.json` (rebaselined just before, ranges 2–4 watch, checkpoints ok). F-026 holds: the `list_largest` trip no longer applies, with 288 statements per list call. Scaling and Counters are blind for three ranges after the binary change (1 of 3 points), as expected. The branch.merge 2.27× is a thin class (1/2/2 calls), not judged. Contended fs.write p95 347–381 ms is F-025 queueing, already in the fixer's queue. Continue to 12.

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1737/1737; conflicts 2/2; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: branch.merge >64 entries · Merged (new Commit) · uncontended: baseline class has 1/2/2 calls (minimum 5 per range); 2.27× it | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 6d467539f759) | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 6d467539f759) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.561 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0322 (budget 0.2723) | < 0.1 | pass |
| Range growth | 6.3 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 375 ms for 32.7 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.41 | < 0.8 | pass |
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

Binary: daemon `6d467539f759` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries · uncontended | 2 | 9.39 | 9.39 | 9.39 | 32.13 | 1.43× | 1.43× | — | — | 618 / 22,644 / 0 | — | 0.0939 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.59 | 1.03 | 1.03 | 1.31 | 0.95× | 1.22× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 2.43 | 2.43 | 2.43 | 2.43 | 1.57× | 1.57× | — | — | 428 / 10,790 / 0 | — | 0.0624 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 264.54 | 264.54 | 264.54 | 293.76 | 2.27× | 2.27× | — | — | 8,054 / 145,490 / 725 | — | 3.6238 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.85 | 4.85 | 4.85 | 4.85 | 1.17× | 1.17× | — | — | 977 / 25,383 / 0 | — | — | — |
| fs.apply | ≤1 KiB · contended | 9 | 228.94 | 300.14 | 300.14 | 319.27 | 20.37× | 22.38× | — | — | 7,111 / 178,525 / 4,405 | — | 0.2805 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 25 | 27.27 | 285.82 | 364.57 | 418.71 | 2.33× | 8.26× | — | — | 1,983 / 86,512 / 2,340 | — | 0.0017 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 49 | 169.55 | 328.76 | 378.86 | 425.36 | 14.69× | 12.77× | — | — | 6,843 / 171,161 / 3,665 | — | 0.0358 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 24 | 3.76 | 8.56 | 14.18 | 42.80 | 1.11× | 1.59× | — | — | 360 / 11,676 / 0 | — | 0.004 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 2 | 5.78 | 5.78 | 5.78 | 6.88 | 1.38× | 0.96× | — | — | 240 / 6,297 / 0 | — | 0.0266 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 19 | 5.51 | 12.49 | 12.49 | 21.30 | 1.01× | 2.10× | — | — | 552 / 14,032 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 3 | 4.93 | 4.93 | 4.93 | 9.84 | 1.05× | 1.05× | — | — | 270 / 7,985 / 0 | — | 0.0002 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 6 | 4.89 | 6.14 | 6.14 | 7.43 | 1.27× | 1.31× | — | — | 507 / 16,431 / 60 | — | 0.0013 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 1 | 4.26 | 4.26 | 4.26 | 4.26 | 1.12× | 1.12× | — | — | 246 / 7,919 / 0 | — | 0.0007 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 2 | 1.60 | 1.60 | 1.60 | 2.84 | 0.70× | 0.64× | — | — | 204 / 4,986 / 0 | — | 1.597 ms per file | — |
| fs.glob | 17–64 files · contended | 7 | 4.45 | 5.16 | 5.16 | 6.07 | 0.98× | 1.14× | — | — | 408 / 14,722 / 0 | — | 0.2249 ms per file | — |
| fs.glob | 17–64 files · uncontended | 1 | 2.27 | 2.27 | 2.27 | 2.27 | 0.83× | 0.83× | — | — | 120 / 6,731 / 0 | — | 0.1135 ms per file | — |
| fs.glob | 2–4 files · contended | 12 | 2.55 | 7.06 | 7.06 | 9.47 | 1.12× | 2.07× | — | — | 304 / 10,310 / 0 | — | 0.8493 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 1.81 | 1.81 | 1.81 | 3.87 | 0.70× | 0.48× | — | — | 96 / 4,104 / 0 | — | 0.6027 ms per file | — |
| fs.glob | 5–16 files · contended | 27 | 3.72 | 5.90 | 10.16 | 72.93 | 1.47× | 1.63× | — | — | 342 / 10,878 / 0 | — | 0.3911 ms per file | — |
| fs.glob | 5–16 files · uncontended | 1 | 2.85 | 2.85 | 2.85 | 2.85 | 1.19× | 0.87× | — | — | 186 / 6,645 / 0 | — | 0.3164 ms per file | — |
| fs.glob | >64 files · contended | 7 | 11.45 | 27.06 | 27.06 | 50.11 | 1.42× | 2.80× | — | — | 939 / 36,499 / 0 | — | 0.0517 ms per file | — |
| fs.glob | >64 files · uncontended | 2 | 5.40 | 5.40 | 5.40 | 5.49 | 1.39× | 1.39× | — | — | 354 / 16,246 / 0 | — | 0.03 ms per file | — |
| fs.grep | 1 files · contended | 3 | 2.87 | 2.87 | 2.87 | 3.03 | 1.24× | 1.11× | — | — | 360 / 12,928 / 0 | — | 2.873 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 11 | 11.20 | 14.99 | 14.99 | 16.73 | 1.13× | 1.19× | — | — | 1,023 / 26,406 / 60 | — | 0.3165 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 2 | 4.06 | 4.06 | 4.06 | 9.61 | 0.73× | 0.73× | — | — | 288 / 7,383 / 0 | — | 0.203 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 9 | 4.34 | 8.10 | 8.10 | 9.93 | 1.31× | 1.87× | — | — | 407 / 13,789 / 0 | — | 1.1178 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 1 | 3.80 | 3.80 | 3.80 | 3.80 | 1.79× | 1.77× | — | — | 210 / 4,982 / 0 | — | 1.2677 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 18 | 5.58 | 11.48 | 11.48 | 14.99 | 1.36× | 1.62× | — | — | 594 / 15,313 / 0 | — | 0.6849 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 6 | 5.39 | 7.99 | 7.99 | 23.96 | 0.52× | 0.66× | — | — | 638 / 15,023 / 0 | — | 0.0284 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 2 | 4.37 | 4.37 | 4.37 | 13.97 | 0.50× | 0.50× | — | — | 291 / 7,922 / 0 | — | 0.0144 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 2 | 2.21 | 2.21 | 2.21 | 3.65 | 1.10× | 1.10× | — | — | 282 / 7,073 / 0 | — | 2.213 ms per entrie | — |
| fs.list | 17–64 entries · contended | 13 | 3.42 | 5.74 | 5.74 | 7.16 | 1.52× | 1.92× | — | — | 406 / 13,131 / 0 | — | 0.1423 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 2 | 2.39 | 2.39 | 2.39 | 2.45 | 1.04× | 1.04× | — | — | 120 / 6,712 / 0 | — | 0.0995 ms per entrie | — |
| fs.list | 2–4 entries · contended | 13 | 2.61 | 5.20 | 5.20 | 10.16 | 1.13× | 1.32× | — | — | 264 / 8,532 / 0 | — | 0.8123 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 2 | 1.80 | 1.80 | 1.80 | 4.75 | 1.14× | 1.14× | — | — | 93 / 4,080 / 0 | — | 0.6013 ms per entrie | — |
| fs.list | 5–16 entries · contended | 25 | 2.63 | 6.06 | 6.17 | 6.69 | 1.06× | 1.70× | — | — | 282 / 9,462 / 0 | — | 0.419 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 4 | 2.09 | 2.44 | 2.44 | 3.13 | 1.57× | 1.83× | — | — | 378 / 8,679 / 0 | — | 0.0026 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 8 | 3.03 | 5.45 | 5.45 | 208.32 | 1.37× | 2.46× | — | — | 243 / 7,484 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 43 | 2.81 | 5.96 | 8.27 | 8.56 | 1.04× | 1.17× | — | — | 293 / 9,778 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 6 | 1.77 | 3.81 | 3.81 | 6.94 | 0.78× | 0.81× | — | — | 117 / 3,327 / 0 | — | 0.0007 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 31 | 20.68 | 345.48 | 456.57 | 461.50 | 2.27× | 20.79× | — | — | 1,772 / 77,825 / 2,409 | — | 20.675 ms per file | commit |
| fs.rm | 1 files · uncontended | 14 | 8.45 | 9.81 | 9.81 | 14.79 | 1.08× | 1.02× | — | — | 362 / 21,892 / 785 | — | 8.451 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 4.16 | 4.16 | 4.16 | 4.16 | 1.68× | 1.56× | — | — | 166 / 5,167 / 0 | — | 0.0055 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 34 | 2.82 | 5.79 | 6.79 | 7.23 | 1.10× | 1.50× | — | — | 219 / 6,794 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 4 | 1.18 | 1.57 | 1.57 | 5.33 | 0.59× | 0.79× | — | — | 90 / 2,766 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 16 | 2.33 | 4.08 | 4.08 | 5.45 | 1.07× | 1.11× | — | — | 276 / 6,822 / 0 | — | 0.0007 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 3 | 2.09 | 2.09 | 2.09 | 3.19 | 1.11× | 0.93× | — | — | 121 / 6,126 / 0 | — | 0.0004 ms per byte | — |
| fs.write | ≤1 KiB · contended | 33 | 210.98 | 353.16 | 401.30 | 474.48 | 21.09× | 17.16× | — | — | 6,446 / 150,230 / 3,096 | — | 0.3105 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 5 | 7.41 | 8.01 | 8.01 | 8.41 | 1.17× | 0.78× | — | — | 403 / 18,828 / 786 | — | 0.013 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 13 | 25.53 | 284.08 | 284.08 | 293.83 | 1.96× | 21.78× | — | — | 1,206 / 57,456 / 2,290 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 7 | 10.31 | 11.03 | 11.03 | 11.32 | 1.08× | 1.16× | — | — | 411 / 21,167 / 786 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 350 | 101.04 | 359.73 | 458.84 | 513.57 | 7.76× | 3.62× | — | — | 4,221 / 115,267 / 2,435 | — | 0.0042 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 119 | 8.71 | 11.23 | 13.58 | 13.75 | 1.13× | 0.89× | — | — | 502 / 20,447 / 786 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 196 | 111.42 | 381.20 | 501.86 | 658.68 | 9.25× | 5.24× | — | — | 4,655 / 124,370 / 3,032 | — | 0.0233 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 60 | 7.76 | 10.05 | 11.42 | 17.00 | 1.09× | 0.81× | — | — | 448 / 19,814 / 786 | — | 0.0018 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.58 | 0.58 | 0.58 | 0.58 | 0.92× | 0.92× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · UpToDate · contended | 60 | 18.41 | 79.20 | 112.62 | 115.72 | 1.40× | 2.71× | — | — | 89 / 12,375 / 710 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · uncontended | 8 | 8.42 | 9.37 | 9.37 | 10.51 | 1.00× | 0.70× | — | — | 41 / 11,307 / 725 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 23 | 57.07 | 137.68 | 177.53 | 247.99 | 1.42× | 1.61× | — | — | 540 / 24,150 / 707 | — | 57.073 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 2 | 13.66 | 13.66 | 13.66 | 14.85 | 1.13× | 1.13× | — | — | 167 / 14,433 / 702 | — | 13.657 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 272.37 | 272.37 | 272.37 | 272.37 | 4.17× | 4.17× | — | — | 5,723 / 64,200 / 708 | — | 272.37 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 17 | 118.53 | 219.57 | 219.57 | 264.40 | 2.54× | 2.52× | — | — | 514 / 22,487 / 702 | — | 41.141 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 4 | 16.78 | 18.31 | 18.31 | 18.48 | 1.10× | 1.20× | — | — | 307 / 17,601 / 725 | — | 7.036 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 104.53 | 104.53 | 104.53 | 104.53 | 3.77× | 3.77× | — | — | 782 / 33,207 / 692 | — | 17.4213 ms per file | commit |
| sandbox.exec | 1 files · contended | 88 | 41.79 | 70.96 | 91.31 | 108.00 | 0.96× | 1.07× | — | — | 0 / 0 / 0 | 4.70 | 41.789 ms per file | observe.after |
| sandbox.exec | 1 files · uncontended | 8 | 38.85 | 55.42 | 55.42 | 77.68 | 1.00× | 1.10× | — | — | 0 / 0 / 0 | 5.80 | 38.847 ms per file | observe.after |
| sandbox.exec | 17–64 files · contended | 8 | 88.79 | 108.51 | 108.51 | 126.70 | 0.98× | 1.05× | — | — | 0 / 0 / 0 | 91 | 4.7249 ms per file | observe.after |
| sandbox.exec | 2–4 files · contended | 99 | 45.81 | 77.92 | 87.01 | 87.32 | 0.98× | 0.97× | — | — | 0 / 0 / 0 | 9.70 | 19.907 ms per file | observe.after |
| sandbox.exec | 2–4 files · uncontended | 12 | 47.31 | 64.89 | 64.89 | 66.33 | 1.06× | 0.90× | — | — | 0 / 0 / 0 | 7.50 | 17.585 ms per file | observe.after |
| sandbox.exec | 5–16 files · contended | 18 | 84.34 | 98.68 | 98.68 | 104 | 1.18× | 1.00× | — | — | 0 / 0 / 0 | 33 | 11.7333 ms per file | observe.after |
| sandbox.exec | 5–16 files · uncontended | 1 | 88.84 | 88.84 | 88.84 | 88.84 | 1.26× | 1.26× | — | — | 0 / 0 / 0 | 36 | 11.1054 ms per file | observe.after |
| sandbox.exec | — · uncontended | 3 | 608.09 | 608.09 | 608.09 | 1223.52 | 1.83× | 1.83× | — | — | 0 / 0 / 0 | 2,707 | — | observe.after |
| sandbox.mount | — · contended | 101 | 18.62 | 127.81 | 212.90 | 213.93 | 1.44× | 2.44× | — | — | 57 / 1,205 / 60 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 18 | 9.68 | 12.65 | 12.65 | 12.69 | 0.96× | 0.95× | — | — | 57 / 1,205 / 60 | — | — | observe.after |
| sandbox.unmount | — · contended | 103 | 8.41 | 14.77 | 19.20 | 23.36 | 1.00× | 1.17× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 16 | 7.26 | 9.66 | 9.66 | 12.23 | 0.95× | 0.99× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 79.8 KiB | 336 | ok 3 |
| branch.fork | branch | 12 | 0.0 KiB | 0.0 KiB | 0 | Forked 12 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.8 KiB | 23 | ok 3 |
| branch.merge | branch | 5 | 0.0 KiB | 0.0 KiB | 0 | Merged 5 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 87 | 802.5 KiB | 0.0 KiB | 89 | Committed 87 |
| fs.diff_files | fs | 56 | 0.0 KiB | 497.4 KiB | 34 | Text 34, NoSuchPath 22 |
| fs.glob | fs | 63 | 0.0 KiB | 36.7 KiB | 523 | ok 63 |
| fs.grep | fs | 54 | 0.0 KiB | 169.2 KiB | 765 | ok 54 |
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

Binary: daemon `6d467539f759`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 2.438 | statements 87, vm_steps 3317, fullscan_steps 0, sorts 0, returned_rows 338 |
| read | 2.263 | statements 90, vm_steps 3335, fullscan_steps 0, sorts 0, returned_rows 339 |
| list_small | 2.462 | statements 114, vm_steps 4407, fullscan_steps 0, sorts 0, returned_rows 450 |
| list_largest | 6.292 | statements 273, vm_steps 13397, fullscan_steps 0, sorts 0, returned_rows 1258 |
| grep_scoped | 2.689 | statements 129, vm_steps 4497, fullscan_steps 0, sorts 0, returned_rows 455 |
| glob_scoped | 2.497 | statements 114, vm_steps 4407, fullscan_steps 0, sorts 0, returned_rows 450 |
| grep_tree | 368.823 | statements 38754, vm_steps 658686, fullscan_steps 0, sorts 0, returned_rows 53502 |
| glob_tree | 14.887 | statements 984, vm_steps 42408, fullscan_steps 0, sorts 0, returned_rows 3969 |
| diff_files | 3.652 | statements 180, vm_steps 6664, fullscan_steps 0, sorts 0, returned_rows 678 |
| list_commits | 1.442 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 2.458 | statements 123, vm_steps 2822, fullscan_steps 0, sorts 0, returned_rows 312 |
| fork | 0.635 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 45.819 | statements 1187, vm_steps 64718, fullscan_steps 2304, sorts 7, returned_rows 4821 |
| oneshot_mount_exec | 50.755 | statements 50, vm_steps 1134, fullscan_steps 60, sorts 2, returned_rows 126 |
| oneshot_commit | 82.41 | statements 385, vm_steps 22023, fullscan_steps 788, sorts 3, returned_rows 1667 |

### D. Storage internals

From the sealed file at snapshot r011: 8,366 pages of 4,096 B, 0 free · Commits 7,819 · Branches 112 · Layers 14 · compression 7.56× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 6,939 | 75.4 MiB |
| 2 | 8,263 | 4.8 MiB |
| 3 | 8,076 | 688.6 KiB |
| 5 | 8,076 | 836.0 KiB |
| 6 | 9,278 | 53.6 MiB |
| 7 | 2,589 | 558.6 KiB |
| 9 | 8,788 | 4.6 MiB |
| 10 | 8,859 | 1.1 MiB |
| 11 | 9,611 | 1.3 MiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 7,828 | 10.4 MiB |
| 1 | 14,571 | 8.5 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 6,175 | 24.1 MiB | 4.1 MiB |
| object_location | 941 | 3.7 MiB | 390.3 KiB |
| commit | 593 | 2.3 MiB | 398.9 KiB |
| inode_value | 451 | 1.8 MiB | 53.0 KiB |
| commit_identity | 122 | 488.0 KiB | 59.0 KiB |
| binding_hint | 18 | 72.0 KiB | 13.4 KiB |
| content_signature | 15 | 60.0 KiB | 5.9 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| branch | 6 | 24.0 KiB | 7.8 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch_names | 3 | 12.0 KiB | 6.1 KiB |
| branch_identity | 3 | 12.0 KiB | 7.6 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 2.8 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 2.8 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 36.9 s** (tooling): play 25.1 · consolidate 2.2 · verify 2.5 · probes 0.6 · tests 0.0 · seal + snapshot 5.4 · report 1.1

36.91 s tooling: prepare 3.40 · play 21.74 · consolidate 2.21 · verify 1.84 (diff_commits + full compareTree) · version walk 0.63 · probes 0.63 · metrics 1.10 · seal 4.43 · sealed figures 0.47 · snapshot copy 0.44

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 58a60046739f3fb1e8c675274cf34afb1f867c08c5cf03db21eb35a2abb569b9 | 2026-10-18T00:26:26.709Z | optimize | Speed: fs.apply ≤8 KiB: 20.11× baseline (commit); Scaling: list_largest per entry of the largest directory: depth exponent 0.782; Counters: list_largest.statements per entry of the largest directory: depth exponent 1.834; Directory share: 0.568; Range growth: 6.4 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 412 ms for 32.8 MiB new; size exponent not judged (2 snapshots) |
| 2 | 6d467539f7590c6125c9000e8ef7ee5518f0e893aa1ae30c7e5851fc67759026 | 2026-10-18T02:57:52.329Z | watch | Speed: not judged: branch.merge >64 entries · Merged (new Commit) · uncontended: baseline class has 1/2/2 calls (minimum 5 per range); 2.27× it; Scaling: insufficient same-binary points: 1 of 3 (daemon 6d467539f759); Counters: insufficient same-binary points: 1 of 3 (daemon 6d467539f759); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Directory share: 0.561; Range growth: 6.3 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 375 ms for 32.7 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-011.a1.json`
- `~/lfs-history/metrics/range-011.a2.json`
- `~/lfs-history/metrics/finding-011.a1.json`
- trace `~/lfs-history/runs/p2-main-d/trace/range-011.a2.jsonl` · runner log `~/lfs-history/runs/p2-main-d/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-011.p2-main-d.json`
