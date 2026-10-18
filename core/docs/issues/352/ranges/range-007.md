# Range 007 · **watch** · attempt 2

**Matches git ✓** · daemon `c25119ace6ae` · image `d3773b4e` · plan v2 · continued from r006 (live Store)
dsh `8adcbceee`..`2bd155291` · **60 commits** (16 mainline, 44 side) · 2026-07-01 → 2026-07-04
Areas changed: `examples/acp-agent` 23% · `docs/rfc` 10% · `packages/core` 10% · other 57%

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **5.7 MiB** (+895.3 KiB) | **20.7 MiB** (−1.5 MiB) | **3.65×** (prev 4.63×) | **3.2 MiB** | **537** (total 5,186) | **20.8 s** tooling (total 2.4 min) |

**Checks:** 6 pass · 6 watch: Speed fs.write ≤512 KiB: 11.87× baseline (commit); Scaling insufficient same-binary points: 1 of 3 (daemon c25119ace6ae); Counters insufficient same-binary points: 1 of 3 (daemon c25119ace6ae); Directory share 0.568; Range growth 3.2 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 317 ms for 20.7 MiB new; size exponent not judged (1 snapshots)
**Moved most:** ▲ fs.write p95 +156% · ▲ sandbox.mount p95 +148% · ▼ fs.read p95 −84%
**Budget:** 8 of 202 ranges · projected total 1.0 h (budget 6.7 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **804 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,051 / 1,051 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | — (not played in P2) |
| Ignored files | — (installs not played in P2) |
| Milestone | — |

## 2. Activity

**1,173 calls** · **166 steps** by **8 agents + lead** on **3 Branches + main** · **83 Workspaces** (98% one-shot, 0 open at end)
**File changes:** +122 added · 409 modified · −24 deleted · 7.4 MiB written · fs 503 : Sandbox 52 (**10 : 1**, target ~9 : 1)
**Execs:** 156 (JS 48 · shell 108) · 0 non-zero exits · install 0 · test runs 0

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 748 | 507 | 241 | Committed 507 · Text 25 · NoSuchPath 12 |
| sandbox | 402 | 235 | 0 | commit 79 (Committed 33, UpToDate 45, Conflict 1) · exec 156 (exit:0 156) · mount 83 (Mounted 83) · service 1 (Ready 1) · unmount 83 (Unmounted 83) |
| branch | 19 | 16 | 3 | diff_commits 3 · fork 11 (Forked 11) · merge 4 (Merged 4) · publish 1 (Added 1) |
| project | 3 | 0 | 3 | list_commits 3 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **1,173** | **758** | **248** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r007-1-docs-rfc | a01 a02 a03 | 60 | 169 | ✓ | — |
| r007-2-examples-acp-agent | a04 a05 | 46 | 169 | ✓ | — |
| r007-3-packages-hooks | a06 a07 a08 | 54 | 168 | ✓ | — |
| main | lead | 6 | 31 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r007-1, a01 after a02 | 0.1 s |
| Stale clean merge | 1 / 1 | r007-1, a02 a01 | merged cleanly |
| Decoy edit | 1 / 1 | r007-1, a01 a03 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r007-1 | 24 | 11 | 13 | 0 | 0 | 39 | commit-conflict, stale-clean-merge, decoy |
| a02 | r007-1 | 18 | 10 | 8 | 0 | 0 | 91 | commit-conflict, stale-clean-merge |
| a03 | r007-1 | 18 | 8 | 10 | 0 | 0 | 39 | decoy |
| a04 | r007-2 | 23 | 12 | 11 | 0 | 0 | 76 | — |
| a05 | r007-2 | 23 | 10 | 13 | 0 | 0 | 93 | — |
| a06 | r007-3 | 19 | 9 | 10 | 0 | 0 | 70 | — |
| a07 | r007-3 | 19 | 9 | 10 | 0 | 0 | 40 | — |
| a08 | r007-3 | 16 | 10 | 6 | 0 | 0 | 58 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 31 | — |
| **Total** |  | **166** | **80** | **81** | **5** | **0** | **537** | **3** |

## 3. Storage

|  | Previous (r006) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build) | 4.8 MiB (4.8 MiB / 0.0 KiB / 0.0 KiB) | 5.7 MiB (5.7 MiB / 0.0 KiB / 0.0 KiB) | +895.3 KiB |
| Files / directories / symlinks | 700 / 229 / 6 | 798 / 267 / 6 | +98 / +38 / +0 |
| Largest file / largest directory | 186.3 KiB / 29 entries | 188.9 KiB (`pnpm-lock.yaml`) / 34 entries (`examples/acp-agent/tests/snapshots`) | — |
| **Store on disk** (allocated, sealed) | 22.2 MiB | 20.7 MiB | −1.5 MiB |
| **Space amplification** | 4.63× | 3.65× | -0.98 |
| Content amplification | 2.19× | 2.10× | — |
| Compression | 7.21× | 7.35× | — |
| Metadata share | 0.60 | 0.74 | this range 0.57 |
| **Stored per byte changed** | — | **1.17 bytes** | 0.60× the median range |
| History: Commits / Layers / Branches | 4,649 | 5,186 / 7 / 27 | +537 |
| Projection at range 202 / disk budget | — | 48.77 GiB / 41% | — |
| Snapshot | — | r007, 20.7 MiB new blocks | — |

**What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 4,477 | +1,110 | 10.3 KiB | 0 (derived) | 88% |
| Chunks (large files) | 5,439 | +1,224 | 0.5 KiB | — | 3% |
| Large-file extents | 5,338 | — | 0.1 KiB | — | — |
| Directories | 2,075 | 1,552 (with inodes, pooled) | 0.2 KiB | — | 89% |
| Inodes and attributes | 28,973 | ↑ pooled | 1.4 KiB | — | — |
| Symlinks | 2 | +0 | 0.0 KiB | — | — |

Delta: 3.2% at depth cap · 28% of refused bases stopped by budget · `node_modules` reinstall: none this range
**Added by source:** content 1.4 MiB · metadata 1.8 MiB · tracked 2.8 MiB changed in git

## 4. Speed

Daemon `c25119ace6ae` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 18.4 ms / 177 ms (1.41×) | 5.3 ms / 7.9 ms (1.17×) | 6.3 ms / 11.1 ms (1.34×) | 20.6 ms / 112 ms (1.36×) | 15.2 ms / 105 ms (1.23×) | 183 ms / 183 ms (1.54×) | — (native comparison in P3; exec 42.8 ms / 81.5 ms) |
| SQL p50: 1,267 stmts | 249 stmts | 381 stmts | 227 stmts | 64 stmts | 7,046 stmts | — |

**Commit cost:** 39.72 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 170 ms p50 over 83
**Slowest:** sandbox.exec 864 ms · sandbox.exec 449 ms · sandbox.exec 379 ms · checkpoint diff_commits 0.08 ms and 6.54 statements per entry (313 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (15 probes)

**Health:** 0 Workspaces open · 0 overlay files left · daemons 525 MB (+90 MB) over 9 of 9 Sandboxes · 143 open files · WAL before seal 4.0 MiB

## 5. Findings and action

### Finding 007.a1 · optimize → fixed · Two causes

**1. Trigger** (attempt 1, daemon `361bb09e1d94`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling: list_small depth exponent; Counters: list_small.statements depth exponent | 1.67; 3.252 | < 0.15; < 0.05 |

**2. Fix context**

|  |  |
| --- | --- |
| Playbook step | D1 |
| Cause | Two causes. (1) list_small is bounded and periodic: each probe-directory rewrite adds a metadata delta, capped at depth 8; a 20-Commit series reads 60, 84, ..., 228 blobs (+24 per Commit) and resets every 8. Ranges 5, 6, 7 sampled 60, 204, 156 — the gate read the sawtooth as depth growth (F-016, builder). (2) S1 latency (fs.read 17.81x baseline) is client queueing (D6): about 1 ms of daemon work, 19 ms p50 / 44 ms p95 at the client, because all calls of all agents on a Sandbox shared one control connection behind a Mutex (F-017). |
| Old design | One control connection per Sandbox behind a Mutex: every call of every agent queued for the whole exchange in front of it; 4 libuv threads. |
| New design | Up to 6 connections per Sandbox, opened on demand, one exchange each, sent once; quarantined connections closed; 64 libuv threads; queue wait traced. History lookups on the control reader's read-only session; counters read without the writer's admission. |
| Kind | 1 forward-only |
| Old Stores | open unchanged (SDK addon only; daemon 361bb09e unchanged) |
| Old data | still read as before |
| Compatibility test | range-4 fork of p1-pilot-b written by 511dceed, read by daemon 361bb09e through addon 5baa0f5d: whole-tree proof checkpoint ok (530 files, 283 blob ids, 285 changed paths); daemon c25119ac: same range-4 fork, whole-tree proof ok (530 files) |
| Commits | `121eb9c69`, `728d8d766` · regression tests sdk/js/test/verify/concurrent_reads_real.mjs; core/crates/layerfs-daemon/tests/sdk_reads_during_publish.rs; core/crates/layerfs-persistence/tests/diagnostics_during_lane.rs |
| Recovery | Fork the p2-main range-7 snapshot onto daemon c25119ac and addon 5baa0f5d (kind 1), then rerun range 7 measured as attempt 2 with the corrected gate (F-016). |

**3. Before / after** (same snapshots, one sample each)

| Measure | Before | After | Change | Old binary | New binary | Snapshot / checkpoint | Cache |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fs.read p50, range-8 play on the range-7 fork | 25 ms | 6.6 ms | −74% | `addon 3da0f665, daemon 361bb09e` | `addon 5baa0f5d, daemon 361bb09e` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| fs.read p95 (cost) | 43.2 ms | 92.7 ms | +115% | `addon 3da0f665` | `addon 5baa0f5d` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| fs.grep p50 | 32.2 ms | 12.4 ms | −61% | `addon 3da0f665` | `addon 5baa0f5d` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| fs.grep p95 | 108.9 ms | 111 ms | +2% | `addon 3da0f665` | `addon 5baa0f5d` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| fs.* client time outside the reader transaction, p50 | 23.5 ms | 5.4 ms | −77% | `addon 3da0f665` | `addon 5baa0f5d` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| connection wait p95 (new trace field; old has none) | n/a ms | 0 ms | ±NaN% | `addon 3da0f665` | `addon 5baa0f5d` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| sandbox.commit p50 | 14.4 ms | 13.4 ms | −7% | `addon 3da0f665` | `addon 5baa0f5d` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| sandbox.commit p95 (cost: Commit begin p95 25.7 -> 69.2) | 92.5 ms | 133.4 ms | +44% | `addon 3da0f665` | `addon 5baa0f5d` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| fs.read p95 (F-018, addon 5baa0f5d) | 96.1 ms | 9.7 ms | −90% | `daemon 361bb09e` | `daemon c25119ac` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| all reads p95 (F-018) | 90.4 ms | 24.9 ms | −72% | `daemon 361bb09e` | `daemon c25119ac` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| fs.grep p95 (F-018) | 100.1 ms | 63.6 ms | −36% | `daemon 361bb09e` | `daemon c25119ac` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| in-lane merges per range-8 play (cost) | 132 merges | 193 merges | +46% | `daemon 361bb09e` | `daemon c25119ac` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |
| range-8 play span (cost) | 14.76 s | 17.13 s | +16% | `daemon 361bb09e` | `daemon c25119ac` | p2-main range-007 snapshot | fresh daemon (new service container on a just-restored Store file) |

Counter `list_small.statements` depth exponent 3.252 → 3.252.

**4. With vs without the optimization, this range**

| Measure | Attempt 1 (without) · `361bb09e1d94` | Attempt 2 (with) · `c25119ace6ae` |
| --- | --- | --- |
| Range time (tooling) | 16.6 s | 20.8 s |
| One-shot Commit p50 / p95 | 13.8 / 86.1 ms | 20.6 / 112.2 ms |
| fs.write p50 / p95 | 25.0 / 56.9 ms | 18.4 / 176.5 ms |
| merge p50 / p95 | 169.2 / 169.2 ms | 183.0 / 183.0 ms |
| SQL per one-shot Commit (statements p50) | 185 | 227 |
| Store on disk | 20.7 MiB | 20.7 MiB |
| Space amplification | 3.64× | 3.65× |
| Verdict | optimize | watch |

The two columns are separate series under their own binaries; no fit or baseline mixes them.

**5. Cost of the fix:** p95 rose: fs.read 43 -> 93 ms, sandbox.commit 93 -> 133 ms (waiting moved into the daemon: Commit begin p95 26 -> 69 ms); up to 6 sockets and 64 threads per process; production LOC +173. F-018: in-lane merges 132 -> 193 and span 14.8 -> 17.1 s (single samples); production LOC +25.

**6. Records:** [fixes/007-a1-list-small-chain-period.md](../fixes/007-a1-list-small-chain-period.md) · [fixes/007-a1-f017-control-connections.md](../fixes/007-a1-f017-control-connections.md) · [fixes/007-a1-f018-reads-behind-publication-lane.md](../fixes/007-a1-f018-reads-behind-publication-lane.md) · [OPTIMIZATIONS.md](../OPTIMIZATIONS.md) (007.a1 rows and Watch) · [BUGS.md](../BUGS.md) (F-017) · [BUGS.md](../BUGS.md) (F-018) · finding `~/lfs-history/metrics/finding-007.a1.json`

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

- Optimize: the `list_small` probe (a fixed 5-entry directory, probe input checked fixed) grows with depth: time exponent 1.67, statements exponent 3.25 over ranges 5–7 on `361bb09e`. SPEC §4: list must stay flat with depth. The runner stopped; snapshot taken at range 7.
- Also handed to the fixer in the same cycle (LESSONS S1): `fs.read`/`fs.grep` at 8–18× the baseline in `sdk.lines` since P2 started (ranges 5–7).
- Action: fixer diagnoses (D2/D4) and fixes; recovery forks the range-7 snapshot (kind 1 unless the record justifies otherwise) and reruns range 7 measured as attempt 2.
- Attempt 2 (run `p2-main-b`, daemon `c25119ac`, addon `5baa0f5d`): recovery forked p2-main's range-5 snapshot (range 7's fork would continue at 8; range 6 has no snapshot) and fast-forwarded range 6 (checkpoint by `diff_commits`, ok); range 7 replayed measured: watch, checkpoint and full tree ok, conflicts 3/3. The A1 Finding block above is attempt 1's; the gate defects it exposed are F-016 (bounded chain period), F-019 (checkpoint diff per entry + changed directory) and the phase-matched P2 baseline.
- Watch: `fs.write` ≤512 KiB at 11.87× the P2 baseline in the commit phase (p50 79.6 ms, 11 calls), against a baseline class of a single call (15.1 ms): too thin to judge; it is re-read when the class has same-binary points. Scaling and counters need 3 same-binary points (1 now). `oneshot_commit.statements` (239/350/314 on `361bb09e`, non-monotone; `fullscan_steps` = F-002's bounded ring fill) is a watch, gated again on the new binary.
- Next: the fixer builds direct Store access (DIRECT_STORE.md) and the builder the runner container before P2 continues at range 8 on `p2-main-b`.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1051/1051; conflicts 3/3; tests 0/0 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.write ≤512 KiB: 11.87× baseline (commit) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon c25119ace6ae) | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon c25119ace6ae) | < 0.05 | watch |
| Directory share | 0.568 | < 0.5 | watch |
| Reinstall growth | not applicable: no node_modules reinstall in this range | ≤ 2× | pass |
| Delta at cap | 0.0319 (budget 0.2781) | < 0.1 | pass |
| Range growth | 3.2 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 317 ms for 20.7 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.15 | ≤ 1 | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 166 | 167 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 537 | 539 |
| Workspaces (one-shot share) | 83 (0.98) | 80 (0.975) |
| Reads | 232 | 232 |
| Reconcile writes | 29 | 29 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `c25119ace6ae` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | >64 entries | 2 | 12.17 | 12.17 | 12.17 | 24.83 | 1.32× | 1.32× | — | — | 648 / 22,174 / 0 | — | 0.1094 ms per entrie | — |
| branch.fork | — | 7 | 2.84 | 3.00 | 3.00 | 3.29 | 1.07× | 1.04× | — | — | 16 / 271 / 0 | — | — | — |
| branch.merge | >64 entries | 3 | 183.02 | 183.02 | 183.02 | 275.51 | 1.54× | 1.54× | — | — | 7,046 / 110,140 / 550 | — | 1.5511 ms per entrie | branch.merge |
| branch.publish | — | 1 | 5.88 | 5.88 | 5.88 | 5.88 | 1.17× | 1.17× | — | — | 554 / 14,385 / 0 | — | — | — |
| fs.apply | ≤1 KiB | 32 | 17.37 | 152.10 | 178.01 | 203.13 | 1.48× | 9.19× | — | — | 1,164 / 44,045 / 1,190 | — | 0.0915 ms per byte | commit |
| fs.apply | ≤64 KiB | 39 | 16.34 | 165.71 | 172.29 | 178.47 | 1.29× | 3.57× | — | — | 1,259 / 40,467 / 1,172 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤8 KiB | 22 | 18.20 | 132.85 | 141.71 | 220.34 | 1.43× | 7.36× | — | — | 2,237 / 58,047 / 1,282 | — | 0.0053 ms per byte | commit |
| fs.diff_files | ≤1 KiB | 15 | 6.39 | 8.35 | 8.35 | 9.76 | 1.14× | 1.10× | — | — | 381 / 12,498 / 0 | — | 0.0254 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB | 10 | 6.86 | 8.74 | 8.74 | 14.66 | 1.01× | 1.06× | — | — | 576 / 12,372 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB | 11 | 6.63 | 12.90 | 12.90 | 15.28 | 0.97× | 1.78× | — | — | 363 / 12,393 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.glob | 1 files | 3 | 4.48 | 4.48 | 4.48 | 6.34 | 0.99× | 0.86× | — | — | 237 / 7,703 / 0 | — | 4.478 ms per file | — |
| fs.glob | 17–64 files | 6 | 5.57 | 6.36 | 6.36 | 12.18 | 1.04× | 0.88× | — | — | 252 / 11,231 / 0 | — | 0.2318 ms per file | — |
| fs.glob | 2–4 files | 8 | 4.56 | 6.03 | 6.03 | 7.45 | 1.14× | 1.06× | — | — | 204 / 5,840 / 0 | — | 1.898 ms per file | — |
| fs.glob | 5–16 files | 8 | 5.34 | 6.99 | 6.99 | 7.62 | 1.20× | 1.21× | — | — | 222 / 7,979 / 0 | — | 0.534 ms per file | — |
| fs.glob | >64 files | 13 | 12.85 | 26.57 | 26.57 | 109.90 | 1.27× | 1.34× | — | — | 859 / 40,608 / 60 | — | 0.0655 ms per file | — |
| fs.grep | 1 files | 2 | 4.17 | 4.17 | 4.17 | 5.04 | 0.90× | 0.90× | — | — | 150 / 4,572 / 0 | — | 4.166 ms per file | sdk.lines |
| fs.grep | 17–64 files | 3 | 7.95 | 7.95 | 7.95 | 13.45 | 0.72× | 0.57× | — | — | 582 / 11,988 / 0 | — | 0.4675 ms per file | sdk.lines |
| fs.grep | 2–4 files | 10 | 5.83 | 6.61 | 6.61 | 7.34 | 1.05× | 1.02× | — | — | 300 / 7,335 / 0 | — | 2.096 ms per file | sdk.lines |
| fs.grep | 5–16 files | 13 | 7.91 | 9.89 | 9.89 | 11.40 | 1.29× | 1.14× | — | — | 580 / 11,771 / 0 | — | 0.9509 ms per file | sdk.lines |
| fs.grep | >64 files | 8 | 16.55 | 31.93 | 31.93 | 43.87 | 1.41× | 2.15× | — | — | 1,523 / 39,647 / 0 | — | 0.1368 ms per file | sdk.lines |
| fs.list | 1 entries | 1 | 5.67 | 5.67 | 5.67 | 5.67 | 1.34× | 1.34× | — | — | 201 / 8,162 / 0 | — | 5.675 ms per entrie | — |
| fs.list | 17–64 entries | 4 | 11.07 | 12.70 | 12.70 | 21.52 | 1.16× | 1.10× | — | — | 1,062 / 39,135 / 0 | — | 0.4197 ms per entrie | — |
| fs.list | 2–4 entries | 13 | 5.63 | 6.28 | 6.28 | 6.45 | 1.21× | 1.00× | — | — | 274 / 9,193 / 0 | — | 1.6263 ms per entrie | — |
| fs.list | 5–16 entries | 19 | 7.50 | 9.27 | 9.27 | 10.87 | 1.34× | 1.14× | — | — | 483 / 15,756 / 0 | — | 0.7502 ms per entrie | — |
| fs.read | ≤1 KiB | 1 | 3.43 | 3.43 | 3.43 | 3.43 | 0.82× | 0.68× | — | — | 324 / 7,074 / 0 | — | 0.005 ms per byte | sdk.lines |
| fs.read | ≤64 KiB | 5 | 4.94 | 5.01 | 5.01 | 7.81 | 0.93× | 0.94× | — | — | 192 / 7,042 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB | 36 | 5.31 | 8.11 | 8.37 | 9.96 | 1.17× | 1.24× | — | — | 279 / 7,090 / 0 | — | 0.0016 ms per byte | sdk.lines |
| fs.rm | 1 files | 23 | 13.38 | 23.07 | 122.37 | 154.69 | 1.22× | 1.24× | — | — | 866 / 30,570 / 610 | — | 13.385 ms per file | commit |
| fs.stat | ≤1 KiB | 1 | 4.29 | 4.29 | 4.29 | 4.29 | 0.98× | 0.93× | — | — | 111 / 3,011 / 0 | — | 0.0254 ms per byte | — |
| fs.stat | ≤512 KiB | 2 | 5.15 | 5.15 | 5.15 | 5.75 | 0.07× | 0.07× | — | — | 168 / 5,440 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB | 18 | 4.82 | 6.51 | 6.51 | 7.78 | 1.09× | 1.12× | — | — | 231 / 6,510 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤8 KiB | 17 | 4.80 | 7.34 | 7.34 | 9.82 | 1.15× | 1.17× | — | — | 225 / 6,385 / 0 | — | 0.0012 ms per byte | — |
| fs.write | ≤1 KiB | 19 | 14.18 | 113.69 | 113.69 | 199.05 | 1.35× | 3.85× | — | — | 807 / 34,960 / 1,144 | — | 0.036 ms per byte | commit |
| fs.write | ≤512 KiB | 11 | 79.55 | 179.06 | 179.06 | 182.71 | 5.27× | 11.87× | — | — | 3,270 / 91,823 / 1,759 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB | 159 | 24.42 | 176.67 | 206.99 | 338.19 | 1.88× | 2.06× | — | — | 1,419 / 53,427 / 1,220 | — | 0.0014 ms per byte | commit |
| fs.write | ≤8 KiB | 198 | 16.73 | 176.20 | 267.79 | 277.44 | 1.41× | 2.18× | — | — | 1,204 / 44,562 / 1,200 | — | 0.0049 ms per byte | commit |
| operator.store.stats | — | 1 | 2.32 | 2.32 | 2.32 | 2.32 | 0.93× | 0.93× | — | — | — | — | — | — |
| sandbox.commit | 0 files | 45 | 12.73 | 88.64 | 102.22 | 104.41 | 1.36× | 2.20× | — | — | 107 / 9,964 / 542 | — | — | commit |
| sandbox.commit | 1 files | 19 | 50.60 | 118.61 | 118.61 | 157.90 | 1.63× | 1.34× | — | — | 763 / 27,433 / 540 | — | 50.596 ms per file | commit |
| sandbox.commit | 2–4 files | 14 | 52.48 | 156.26 | 156.26 | 188.01 | 1.24× | 2.37× | — | — | 497 / 20,382 / 540 | — | 17.4943 ms per file | commit |
| sandbox.exec | 1 files | 67 | 38.81 | 63.62 | 70.18 | 79.08 | 1.11× | 1.04× | — | — | 0 / 0 / 0 | 5 | 38.811 ms per file | — |
| sandbox.exec | 17–64 files | 2 | 75.02 | 75.02 | 75.02 | 94.06 | 0.95× | 0.82× | — | — | 0 / 0 / 0 | 83 | 4.1678 ms per file | — |
| sandbox.exec | 2–4 files | 65 | 45.30 | 76.48 | 78.97 | 81.51 | 1.16× | 1.11× | — | — | 0 / 0 / 0 | 10.70 | 19.1947 ms per file | — |
| sandbox.exec | 5–16 files | 17 | 72.93 | 86.76 | 86.76 | 100.62 | 1.15× | 1.13× | — | — | 0 / 0 / 0 | 34 | 11.2202 ms per file | — |
| sandbox.exec | — | 3 | 449.02 | 449.02 | 449.02 | 863.82 | 1.50× | 1.50× | — | — | 0 / 0 / 0 | 2,144 | — | — |
| sandbox.mount | — | 81 | 15.16 | 105.27 | 160.32 | 162.89 | 1.23× | 2.24× | — | — | 64 / 1,895 / 60 | — | — | sandbox.mount.attach |
| sandbox.service | — | 1 | 237.00 | 237.00 | 237.00 | 237.00 | 1.04× | 1.04× | — | — | — | — | — | — |
| sandbox.unmount | — | 81 | 6.53 | 8.48 | 8.80 | 9.61 | 1.06× | 0.99× | — | — | 0 / 0 / 0 | — | — | — |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_commits | branch | 3 | 0.0 KiB | 75.5 KiB | 314 | ok 3 |
| branch.fork | branch | 11 | 0.0 KiB | 0.0 KiB | 0 | Forked 11 |
| branch.list_commits | project | 3 | 0.0 KiB | 13.1 KiB | 23 | ok 3 |
| branch.merge | branch | 4 | 0.0 KiB | 0.0 KiB | 0 | Merged 4 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 97 | 1.0 MiB | 0.0 KiB | 99 | Committed 97 |
| fs.diff_files | fs | 37 | 0.0 KiB | 229.7 KiB | 25 | Text 25, NoSuchPath 12 |
| fs.glob | fs | 40 | 0.0 KiB | 31.8 KiB | 458 | ok 40 |
| fs.grep | fs | 38 | 0.0 KiB | 135.8 KiB | 362 | ok 38 |
| fs.list | fs | 41 | 0.0 KiB | 48.0 KiB | 381 | ok 41 |
| fs.read | fs | 43 | 0.0 KiB | 192.3 KiB | 43 | ok 43 |
| fs.rm | fs | 23 | 0.0 KiB | 0.0 KiB | 23 | Committed 23 |
| fs.stat | fs | 42 | 0.0 KiB | 9.2 KiB | 42 | ok 42 |
| fs.write | fs | 387 | 5.8 MiB | 0.0 KiB | 387 | Committed 387 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 79 | 0.0 KiB | 0.0 KiB | 0 | Committed 33, UpToDate 45, Conflict 1 |
| sandbox.exec | sandbox | 156 | 925.9 KiB | 122.7 KiB | 0 | exit:0 156 |
| sandbox.mount | sandbox | 83 | 0.0 KiB | 0.0 KiB | 0 | Mounted 83 |
| sandbox.service | sandbox | 1 | 0.0 KiB | 0.0 KiB | 0 | Ready 1 |
| sandbox.unmount | sandbox | 83 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 83 |

### C. Scale probes

Binary: daemon `c25119ace6ae`.

| Probe | ms | Counters |
| --- | --- | --- |
| stat | 4.861 | statements 78, vm_steps 3317, fullscan_steps 0, sorts 0, returned_rows 344 |
| read | 4.728 | statements 81, vm_steps 3335, fullscan_steps 0, sorts 0, returned_rows 345 |
| list_small | 6.775 | statements 186, vm_steps 8695, fullscan_steps 0, sorts 0, returned_rows 910 |
| list_largest | 13.835 | statements 855, vm_steps 31393, fullscan_steps 0, sorts 0, returned_rows 3389 |
| grep_scoped | 5.591 | statements 117, vm_steps 4497, fullscan_steps 0, sorts 0, returned_rows 463 |
| glob_scoped | 5.906 | statements 102, vm_steps 4407, fullscan_steps 0, sorts 0, returned_rows 458 |
| grep_tree | 248.841 | statements 23379, vm_steps 426157, fullscan_steps 0, sorts 0, returned_rows 37872 |
| glob_tree | 16.71 | statements 981, vm_steps 44041, fullscan_steps 0, sorts 0, returned_rows 4256 |
| diff_files | 5.974 | statements 162, vm_steps 6664, fullscan_steps 0, sorts 0, returned_rows 690 |
| list_commits | 3.695 | statements 68, vm_steps 1264, fullscan_steps 0, sorts 0, returned_rows 50 |
| diff_commits | 3.957 | statements 90, vm_steps 2674, fullscan_steps 0, sorts 0, returned_rows 312 |
| fork | 3.089 | statements 16, vm_steps 271, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 38.975 | statements 992, vm_steps 55354, fullscan_steps 1782, sorts 7, returned_rows 4282 |
| oneshot_mount_exec | 62.699 | statements 57, vm_steps 1944, fullscan_steps 60, sorts 2, returned_rows 191 |
| oneshot_commit | 80.517 | statements 314, vm_steps 19736, fullscan_steps 614, sorts 3, returned_rows 1552 |

### D. Storage internals

From the sealed file at snapshot r007: 5,305 pages of 4,096 B, 0 free · Commits 5,210 · Branches 64 · Layers 9.

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 4,477 | 44.9 MiB |
| 2 | 5,439 | 2.6 MiB |
| 3 | 5,338 | 452.4 KiB |
| 5 | 5,338 | 552.6 KiB |
| 6 | 6,041 | 34.7 MiB |
| 7 | 2,075 | 441.9 KiB |
| 9 | 5,479 | 2.3 MiB |
| 10 | 5,550 | 699.2 KiB |
| 11 | 6,565 | 916.8 KiB |
| 13 | 2 | 0.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 5,215 | 6.4 MiB |
| 1 | 9,605 | 5.5 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 3,837 | 15.0 MiB | 2.3 MiB |
| object_location | 618 | 2.4 MiB | 262.1 KiB |
| commit | 391 | 1.5 MiB | 265.8 KiB |
| inode_value | 311 | 1.2 MiB | 32.4 KiB |
| commit_identity | 81 | 324.0 KiB | 38.1 KiB |
| binding_hint | 14 | 56.0 KiB | 9.6 KiB |
| content_signature | 12 | 48.0 KiB | 6.9 KiB |
| history_meta | 7 | 28.0 KiB | 2.3 KiB |
| sqlite_schema | 5 | 20.0 KiB | 6.2 KiB |
| branch | 4 | 16.0 KiB | 6.8 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| layers_source | 1 | 4.0 KiB | 3.3 KiB |
| layers_genesis | 1 | 4.0 KiB | 3.9 KiB |
| layers_child | 1 | 4.0 KiB | 3.3 KiB |
| layer_stack_names | 1 | 4.0 KiB | 4.0 KiB |
| layer_stack | 1 | 4.0 KiB | 3.9 KiB |
| layer_identity | 1 | 4.0 KiB | 3.5 KiB |

### E. Stage times

**Time 20.8 s** (tooling): play 12.6 · consolidate 0.8 · verify 1.9 · probes 0.6 · tests 0.0 · seal + snapshot 4.3 · report 0.6

20.76 s tooling: prepare 2.37 · play 10.26 · consolidate 0.84 · verify 1.39 (diff_commits + full compareTree) · version walk 0.47 · probes 0.57 · metrics 0.23 · seal 3.66 · sealed figures 0.21 · snapshot copy 0.38 · report 0.14

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 361bb09e1d9465ab47e93d1ae98226e62018aad71340140500bbcebb1fde41f4 | 2026-10-17T23:17:20.522Z | optimize | Speed: fs.read ≤1 KiB: 17.81× baseline (sdk.lines); Scaling: list_small: depth exponent 1.67; Counters: list_small.statements: depth exponent 3.252; Directory share: 0.563; Range growth: 3.2 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 265 ms for 20.7 MiB new; size exponent not judged (2 snapshots) |
| 2 | c25119ace6ae9a10d6e67618b114c031676e5065680db4e47ab0beb3a1759031 | 2026-10-18T00:09:08.489Z | watch | Speed: fs.write ≤512 KiB: 11.87× baseline (commit); Scaling: insufficient same-binary points: 1 of 3 (daemon c25119ace6ae); Counters: insufficient same-binary points: 1 of 3 (daemon c25119ace6ae); Directory share: 0.568; Range growth: 3.2 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 317 ms for 20.7 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-007.a1.json`
- `~/lfs-history/metrics/range-007.a2.json`
- `~/lfs-history/metrics/finding-007.a1.json`
- trace `~/lfs-history/runs/p2-main-b/trace/range-007.a2.jsonl` · runner log `~/lfs-history/runs/p2-main-b/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-007.p2-main-b.json`
