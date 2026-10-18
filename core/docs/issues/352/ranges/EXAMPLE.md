# Example range reports (simulated)

> **Status:** Reference example for [REPORT_FORMAT.md](../REPORT_FORMAT.md),
> 2026-10-18. **Every number, id, path and finding here is invented** to show
> the format; none of it is a measurement. Example A is the common case: no
> problem found. Example B is a range whose first attempt tripped an optimize
> gate, shown at its rerun, with the fix context and the before/after comparison.

---

# Example A · Range 056 · **pass** · attempt 1

**Matches git ✓** · daemon `511dceeda1b5` · image `d3773b4e` · plan v2 · continued from r055 (live Store)
dsh `a91e0c4`..`3f1c2a8` · **61 commits** (11 mainline, 50 side) · 2026-07-30 → 2026-08-02
Areas changed: `packages/core` 52% · `packages/cli` 30% · `scripts` 11% · other 7%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **2.61 GiB** (+5.9 MiB) | **1.82 GiB** (+33.0 MiB) | **0.70×** · tracked 3.88× (prev 0.70×) | **26.4 MiB** | **988** (total 60,346) | **39.6 s** (total 37.9 min) |

**Checks:** 16 pass
**Moved most:** ▲ metadata added +8% · ▼ merge p95 −4% · ▲ grep over the tree +3% (tree +2%)
**Budget:** 56 of 202 ranges · projected total 2.4 h (budget 6 h) · disk 40% of budget at range 202

*(Sections 1–4 and the appendix follow, in the same shape as Example B.)*

## 5. Findings and action

**Optimization:** none — no problems found.

**Lead's note:** no watch items. Next milestone r100.

---

# Example B · Range 057 · **watch** · attempt 2

**Matches git ✓** · daemon `7c2e9d40f1a3` · image `d3773b4e` · plan v2 · forked from snapshot r057 (attempt 1's checkpoint), range 057 rerun measured
dsh `3f1c2a9`..`8e40d71` · **64 commits** (12 mainline, 52 side) · 2026-08-02 → 2026-08-04
Areas changed: `packages/cli` 41% · `packages/core` 33% · `docs/rfc` 18% · other 8%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **2.62 GiB** (+7.4 MiB) | **1.86 GiB** (+41.2 MiB) | **0.71×** · tracked 3.91× (prev 0.70×) | **30.8 MiB** | **1,042** (total 61,388) | **41.8 s** (total 38.6 min) |

**Checks:** 14 pass · 2 watch: metadata share 0.54 · `list_largest` rising slightly (depth exponent 0.17)
**Moved most:** ▼ one-shot Commit p95 −58% (the fix) · ▲ grep over the tree +6% (tree +6%) · ▲ metadata added +22%
**Budget:** 57 of 202 ranges · projected total 2.4 h (budget 6 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **16,180 tracked files match** (blob id and mode); 214 changed paths checked via diff_commits |
| History | as planned: 3 lanes merged, 1 publish |
| Steps | 175 / 175 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **63 / 63 equal to native** · 12 skipped natively (8 broken at this commit, 4 timeout) |
| Ignored files | `node_modules` matches lockfile `a71c…` ✓ · build outputs present (`packages/cli/dist`, `packages/core/lib`) ✓ |
| Milestone | — (next: r100) |

## 2. Activity

**2,184 calls** · **175 steps** by **9 agents + lead** on **3 Branches + main** · **91 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +97 added · 312 modified · −19 deleted · 7.9 MiB written · fs 1,031 : Sandbox 84 (**12 : 1**, target ~9 : 1)
**Execs:** 196 (JS 172 · shell 24) · 0 non-zero exits · install 1 (incremental, 41 packages) · build 2 · test runs 1

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,512 | 1,031 | 481 | Committed 1,004 · UpToDate 27 |
| sandbox | 588 | 294 | 0 | mount 98 · exec 196 · status 98 · commit 98 (Committed 61, UpToDate 36, Conflict 1) · unmount 98 |
| branch | 71 | 9 | 62 | fork 4 · merge 4 (Merged 3, Conflict 1) · publish 1 (Added) · diff_commits 58 · diff_branches 4 |
| project | 8 | 0 | 8 | list_commits 8 |
| operator | 5 | 0 | 5 | store.stats 5 |
| **Total** | **2,184** | **1,334** | **556** | |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r057-1-packages-cli | a01 a02 a03 | 64 | 402 | ✓ (2nd try) | — |
| r057-2-packages-core | a04 a05 a06 | 58 | 371 | ✓ | — |
| r057-3-docs | a07 a08 a09 | 41 | 212 | ✓ | — |
| main | lead | 12 | 57 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r057-1, a02 after a01 | 0.8 s |
| Stale clean merge | 1 / 1 | r057-2, a05 | merged cleanly |
| Decoy edit | 1 / 1 | r057-3, a08 | reverted before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge vs r057-1 | 1.2 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r057-1 | 22 | 19 | 3 | 0 | 0 | 141 | — |
| a02 | r057-1 | 21 | 17 | 4 | 0 | 0 | 129 | Commit Conflict |
| a03 | r057-1 | 21 | 18 | 3 | 0 | 0 | 132 | — |
| a04 | r057-2 | 20 | 18 | 2 | 0 | 0 | 130 | — |
| a05 | r057-2 | 19 | 15 | 4 | 0 | 0 | 118 | stale merge |
| a06 | r057-2 | 19 | 17 | 2 | 0 | 0 | 123 | — |
| a07 | r057-3 | 14 | 12 | 2 | 0 | 0 | 71 | — |
| a08 | r057-3 | 14 | 11 | 3 | 0 | 0 | 72 | decoy |
| a09 | r057-3 | 13 | 12 | 1 | 0 | 0 | 69 | — |
| lead | main | 12 | 3 | 4 | 4 | 1 | 57 | race |
| **Total** | | **175** | **142** | **28** | **4** | **1** | **1,042** | **4** |

## 3. Storage

*(Storage format of 2026-10-18, REPORT_FORMAT.md §3 and §9. Simulated numbers;
range 057 is a snapshot range, so every part is exact.)*

**3a. Overview**

| | Previous (r056) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 2.61 GiB (133.0 MiB / 2.44 GiB / 41.0 MiB) | 2.62 GiB (133.1 MiB / 2.45 GiB / 41.0 MiB) | +7.4 MiB |
| Files / directories / symlinks | 96,432 / 9,804 / 1,407 | 96,534 / 9,826 / 1,407 | +102 / +22 / 0 |
| Largest file / largest directory | 4.1 MiB / 2,310 entries | 4.1 MiB / 2,318 entries | |
| **Store on disk** (allocated) | 1.82 GiB | 1.86 GiB | +41.2 MiB |
| **Space amplification** (total · tracked · `node_modules` · build) | 0.70× · 3.88× · 0.335× · 1.70× | **0.71× · 3.91× · 0.335× · 1.71×** | +0.01 · +0.03 · 0 · +0.01 |
| **Head cost** / **history cost** | 0.32× / 0.38× (r055 snapshot) | **0.32× / 0.39×** | 0 / +0.01 |
| **Stored per byte changed** (content / metadata / shared) | | **2.5 bytes** (1.4 / 0.6 / 0.5) | 0.9× the median range |
| **Stored per Commit** | 29.8 KiB | **30.3 KiB** | +0.5 KiB |
| Metadata share | 0.22 | 0.22 | this range 0.24 |
| History: Commits / Layers / Branches | 60,346 / 172 / 229 | 61,388 / 175 / 233 | +1,042 / +3 / +4 |
| Projection at range 202 / disk budget | | 6.4 GiB / 41% | |
| Snapshot | | r057 attempt 1 (before the fix), 38.1 MiB new blocks | |

**3b. Where the bytes are** (change = allocated growth, so it includes waste; Added this range in 3c is the bytes written: content 17.0 + metadata 7.5 + shared rows 6.3 = 30.8 MiB)

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 1,010.0 MiB | 0.376× | +17.0 MiB |
| Metadata | 420.0 MiB | 0.157× | +7.5 MiB |
| Index rows | 230.0 MiB | 0.086× | +3.9 MiB |
| Waste | 225.0 MiB | 0.084× | +12.6 MiB ⚠ |
| Other | 19.6 MiB | 0.007× | +0.2 MiB |
| **Total = Store on disk** | **1,904.6 MiB** | **0.710× = space amplification** | **+41.2 MiB** |

Waste grew faster than data this range (31% of the growth): free pages left
by the attempt-1 checkpoint. Watch, appendix D.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 133.1 MiB | 520.0 MiB (260.0 + 260.0) | **3.91×** | 0.62× | 14.0 MiB | 5.9 MiB (git) | 2.37 |
| `node_modules` | 2.45 GiB | 840.0 MiB (700.0 + 140.0) | 0.335× | 0.30× | 7.4 MiB | 4.4 MiB (41 packages) | 1.68 |
| Build output | 41.0 MiB | 70.0 MiB (50.0 + 20.0) | 1.71× | 0.55× | 3.1 MiB | 2.0 MiB | 1.55 |
| Shared (index rows + waste + other) | — | 474.6 MiB | — (not divided) | — | 6.3 MiB | — | — |
| **Total** | **2.62 GiB** | **1,904.6 MiB** | **0.71×** | **0.32×** | **30.8 MiB** | 12.3 MiB | 2.5 |

Tracked files cost 3.91× their head, while `node_modules` costs 0.335×, so the
total of 0.71× is mostly `node_modules`. Against git, the tracked history is
1.9× git's packed size (appendix D).

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files (< 128 KiB) | 182,400 | +1,904 | 7.6 KiB | 412 | 62% |
| Large files (≥ 128 KiB) | 1,210 | +31 | 1.9 MiB | 6 | — |
| Chunks (8–32 KiB) | 96,800 | +212 | 18.4 KiB | 1,640 (89%) | **0%** ⚠ |
| Directories | 9,826 live / 41,300 versions | +2,210 | — | — | 55% |
| Inodes and attributes | 113,900 versions | +1,200 | — | — | 48% |
| Symlinks | 1,407 | 0 | — | — | — |
| **Total** | **446,920** | **+5,557** | | | **59%** |

Delta: 3% at depth cap · 32% of refused bases stopped by budget · `node_modules` reinstall: 41 packages changed, +6.2 MiB content stored (1.4× changed packages, gate ≤ 2×)

## 4. Speed

Daemon `7c2e9d40` · p50 / p95 · ratio to baseline in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9 / 12 ms (1.0×) | 4 / 6 ms (1.0×) | 5 / 11 ms (1.1×) | 14 / 17 ms (0.9×) | 11 / 12 ms (1.0×) | 12 / 15 ms (1.0×) | **1.6×** |
| SQL p50: 41 stmts | 72 | 162 | 214 | 57 | 908 | — |

**Commit cost:** 1.1 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 74 ms p50
**Slowest:** sandbox.create 296 ms · `pnpm install` exec 18.4 s (native 11.2 s, 1.64×) · diff_commits 224 ms (1,042 changes, 0.2 ms each)
**Scaling:** 14 of 15 probes flat · `list_largest` watch (0.17)

**Health:** 0 Workspaces open · 0 overlay files left · daemon 182 MB (+2 MB) · 41 open files · WAL before seal 7.6 MiB

## 5. Findings and action

### Finding 057.a1 · optimize → fixed · one-shot Commit scanned the content-signature ring

**1. Trigger** (attempt 1, daemon `511dceed`)

| Check | Value | Threshold |
| --- | --- | --- |
| Commit by depth | one-shot Commit p95 40.6 ms, rising 3 ranges (r055 33.9 → r056 37.2 → r057 40.6) | flat with depth; optimize when rising 3 ranges |
| Counters | `oneshot_commit.fullscan_steps` depth exponent 0.81 | < 0.05 |

**2. Fix context**

| | |
| --- | --- |
| Playbook step | D4 (inefficient database work), confirmed by D2 (counter vs depth) |
| Cause | Each Save looked up candidate delta bases in the content-signature ring with `SELECT … WHERE role = ? ORDER BY seq DESC`; no index matched the order, so SQLite scanned the ring and sorted (`SCAN signature_ring`, `USE TEMP B-TREE FOR ORDER BY`). The ring fills toward its 8,192-row bound as history grows, so the scan grew with depth until the bound |
| Old design | Ring read by scan + sort per Save: O(ring rows), up to 8,192 per Commit |
| New design | Covering index `signature_ring(role, seq DESC, signature)`; the lookup reads only the newest candidates: O(candidates), independent of ring fill and depth |
| Kind | code path + schema index (no change to stored objects; existing Stores gain the index at open) |
| Commits | fix `9a41c07e2` · regression test `core/crates/layerfs-storage/tests/signature_ring_depth.rs` (fullscan_steps equal at ring fill 100 and 8,192; failed before the fix) |
| Recovery | snapshot r057 taken at attempt 1's checkpoint (before the fix); forked into run `p3-main-b`; range 057 rerun measured as attempt 2. Attempt 1's proof and measurements are kept under daemon `511dceed` |

**3. Before / after** (same snapshots, fresh daemon per case, one sample each)

| Measure | Before | After | Change | Old binary | New binary | Snapshot / checkpoint | Cache |
| --- | --- | --- | --- | --- | --- | --- | --- |
| one-shot Commit fullscan_steps | 443 | 0 | −100% | `511dceed` | `7c2e9d40` | r057 | cold daemon, warm page cache |
| one-shot Commit statements | 272 | 214 | −21% | `511dceed` | `7c2e9d40` | r057 | same |
| one-shot Commit p95 | 40.6 ms | 17.1 ms | −58% | `511dceed` | `7c2e9d40` | r057 | same |
| merge fullscan_steps | 1,269 | 0 | −100% | `511dceed` | `7c2e9d40` | r057 | same |
| merge p95 | 21.4 ms | 15.2 ms | −29% | `511dceed` | `7c2e9d40` | r057 | same |
| one-shot Commit p95 at r004 / r050 / r057 | 15.9 / 30.2 / 40.6 ms | 16.8 / 17.0 / 17.1 ms | flat after | `511dceed` | `7c2e9d40` | r004, r050, r057 | same |
| fullscan_steps depth exponent (r004–r057) | 0.81 | 0.00 | — | `511dceed` | `7c2e9d40` | r004, r050, r057 | — |
| Store on disk at r057 | 1.860 GiB | 1.861 GiB | +0.6 MiB (index) | `511dceed` | `7c2e9d40` | r057 | n/a |

**4. With vs without the optimization, this range**

| Measure | Attempt 1 (without) · `511dceed` | Attempt 2 (with) · `7c2e9d40` | Change |
| --- | --- | --- | --- |
| Range time (tooling) | 52.3 s | 41.8 s | −20% |
| One-shot Commit p50 / p95 | 31.0 / 40.6 ms | 14.0 / 17.1 ms | −55% / −58% |
| One-shot Workspace total p50 | 96 ms | 74 ms | −23% |
| merge p50 / p95 | 17.8 / 21.4 ms | 12.0 / 15.2 ms | −33% / −29% |
| SQL per one-shot Commit (statements · full-scan steps) | 272 · 443 | 214 · 0 | |
| Store on disk / space amplification | 1.860 GiB / 0.71× | 1.861 GiB / 0.71× | +0.6 MiB / 0 |
| Verdict | optimize | watch | |

The two columns are separate series under their own binaries; no fit or
baseline mixes them.

**5. Cost of the fix:** +0.6 MiB of index at r057 (≈ 0.03% of the Store), +1 index
write per Save (+0.02 ms p50 on fs.write, within noise). No change to stored
objects or the Store format.

**6. Records:** [fixes/057-a1-signature-ring-index.md](../fixes/057-a1-signature-ring-index.md) ·
[OPTIMIZATIONS.md](../OPTIMIZATIONS.md) (057.a1) · finding `~/lfs-history/metrics/finding-057.a1.json`

### Open issues touching this range

| Id | Issue | Owner | Next step |
| --- | --- | --- | --- |
| F-005 | Chunks never stored as deltas (0% since Init) | fixer | Decide whether chunk delta selection finds no base or files are rarely chunked; result feeds the delta decision |
| F-006 | Metadata share above 0.5 for 12 ranges | fixer | Probe directory leaf rewrite size at milestone 100 |

### Lead's note

Attempt 2 watches: metadata share 0.54 (F-006) and `list_largest` 0.17, which
grows with its directory (2,318 entries), allowed by SPEC §4; recheck per entry at
r100. The fix also removed F-002's merge full scans; F-002 closed in BUGS.md.

## Appendix

A. Checks (all 16, values and thresholds) · B. Latency by method and size class,
×baseline, depth and tree slopes, SQL and FUSE counters · C. Scale probes with
counters · D. Storage internals (SQLite tables and indexes, free pages, packs,
depth and chain histograms; from snapshot r057) · E. Stage times: prepare 0.3 ·
play 31.2 · consolidate 2.4 · verify 1.9 · probes 0.4 · tests 3.1 · seal 2.3 ·
snapshot 0.3 · report 0.2 s · F. Attempts: 1 optimize (`511dceed`), 2 watch
(`7c2e9d40`) · G. Evidence: `~/lfs-history/metrics/range-057.a1.json`,
`range-057.a2.json`, `finding-057.a1.json`, trace, runner log, snapshot manifest.
