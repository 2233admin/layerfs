# Range 053 · **optimize** · attempt 1

**Matches git ✓** · daemon `32eda22d657d` · image `d3773b4e` · plan v2 · continued from r052 (live Store)
dsh `4e7f90667`..`09c217eba` · **64 commits** (9 mainline, 55 side) · 2026-07-30 → 2026-07-30
Areas changed: `/` 12% · `packages/client` 11% · `packages/ui` 8% · other 68%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.15×** · **Churn 0.00**
**Time split:** play 132.6 s · git 122.8 s · Node 295.3 s · verify 16.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **858.0 MiB** (+2.2 MiB) | **1.51 GiB** (+23.0 MiB) | **1.81×** (prev 1.79×) | **25.5 MiB** | **863** (total 63,409) | **356.7 s** tooling (total 193.3 min) |

**Checks:** 12 pass · 5 watch: Speed sandbox.commit 0 files · UpToDate · uncontended: 1.99× baseline (observe.after); not judged: fs.apply ≤1 KiB · uncontended: 4/19/11 calls (1.88×), fs.write >512 KiB · uncontended: 2/7/12 calls (1.87×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.49×), branch.diff_commits 17–64 entries · uncontended: 3/1/4 calls (1.43×) (baseline class under 5 calls per range); Scaling not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Contended work not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (9 classes too narrow); SQL per call (sql.call); Directory share 0.566; Range growth 25.5 MiB; median not judged: 2 of 3 earlier ranges · 2 optimize/stop: Counters, Snapshot time
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe list_small +264% · ▲ probe fork +98% · ▲ fs.write p95 +89%
**Budget:** 54 of 202 ranges · projected total 16.3 h (budget 16.8 h) · disk 45% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,975 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 1,898 / 1,898 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3209 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 426 bin shims, 4688 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (61 lines from 4 .gitignore files) · **80 picks** in 3 merges (80 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `09c217eba`** · 121 commits written for 121 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 88 untracked, unignored (874,854 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 80 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r053-1-agents-notes | end | `cf24ca278f61` | `c6c858193bf0` | pass (427 normalized) | pass | pass | pass | pass | n/a |
| r053-2-root | end | `a46a171bb515` | `f5f1b697d186` | pass (427 normalized) | pass | n/a | pass | pass | n/a |
| r053-3-packages-client | end | `7f6e8d75f51f` | `c6c858193bf0` | pass (427 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `a369930a61e1` | `null` | n/a | pass | n/a | n/a | pass | pass (137,399 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/skill/tool-skill/tests/tool-skill.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-bash-persistent/tests/loader-composition.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/test-runtime/tests/runtime.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/assembly-surfaces.spec.tsx` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively).

## 2. Activity

**2,650 calls** · **160 steps** by **8 agents + lead** on **3 Branches + main** · **204 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +69 added · 683 modified · −22 deleted · 13.3 MiB written · fs 707 : Sandbox 67 (**11 : 1**, reported only in P3)
**Execs:** 554 (JS 58 · shell 496) · 4 non-zero exits · install 0 · test runs 4 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,026 | 721 | 305 | Committed 721 · Text 34 · Equal 1 · NoSuchPath 10 |
| sandbox | 1,167 | 755 | 4 | commit 201 (Committed 156, UpToDate 44, Conflict 1) · exec 554 (exit:0 550, exit:254 1, exit:2 3) · mount 204 (Mounted 204) · status 4 · unmount 204 (Unmounted 204) |
| branch | 447 | 32 | 415 | diff_branches 11 · diff_commits 404 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,650** | **1,508** | **734** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r053-1-agents-notes | a01 a02 a03 | 45 | 254 | ✓ | — |
| r053-2-root | a04 a05 a06 | 55 | 258 | ✓ | — |
| r053-3-packages-client | a07 a08 | 54 | 256 | ✓ | — |
| main | lead | 6 | 95 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r053-3, a07 after a08 | 0.1 s |
| Stale clean merge | 1 / 1 | r053-3, a07 a08 | merged cleanly |
| Decoy edit | 1 / 1 | r053-3, a08 a07 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r053-1 | 8 | 4 | 4 | 0 | 0 | 17 | — |
| a02 | r053-1 | 12 | 8 | 4 | 0 | 0 | 147 | — |
| a03 | r053-1 | 25 | 13 | 12 | 0 | 0 | 90 | — |
| a04 | r053-2 | 47 | 21 | 26 | 0 | 0 | 211 | — |
| a05 | r053-2 | 3 | 2 | 1 | 0 | 0 | 32 | — |
| a06 | r053-2 | 5 | 2 | 3 | 0 | 0 | 15 | — |
| a07 | r053-3 | 24 | 10 | 14 | 0 | 0 | 126 | commit-conflict, stale-clean-merge, decoy |
| a08 | r053-3 | 30 | 15 | 15 | 0 | 0 | 130 | commit-conflict, stale-clean-merge, decoy |
| lead | main | 6 | 1 | 0 | 5 | 0 | 95 | — |
| **Total** |  | **160** | **76** | **79** | **5** | **0** | **863** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 114 · pnpm 1 · tsc 3 · vitest 4 · other 432

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r053-3-packages-client | 35 | 35 | 35 | 0 | 35 | 535 |
| r053-1-agents-notes | 34 | 34 | 34 | 1 | 34 | 507 |
| r053-2-root | 38 | 38 | 38 | 3 | 38 | 458 |
| **lead** | — | — | — | — | 121 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r053-1-agents-notes | 0 | 1 | 1 | 1 | 71 | 71 / 71 |
| r053-2-root | 1 | 0 | 1 | 1 | 93 | 93 / 93 |
| r053-3-packages-client | 0 | 1 | 1 | 1 | 69 | 69 / 69 |
| **lead repair** | 1 | — | 1 | — | — | 137,399 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r052) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 855.7 MiB (27.6 MiB / 691.9 MiB / 26.0 MiB / 110.2 MiB) | 858.0 MiB (27.9 MiB / 691.9 MiB / 26.3 MiB / 111.9 MiB) | +2.2 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,465 / 10,003 / 4,658 | 64,546 / 10,023 / 4,696 | +81 / +20 / +38 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.49 GiB | 1.51 GiB | +23.0 MiB |
| **Space amplification** (total · tracked) | 1.79× · tracked 4.92× | 1.81× · tracked 4.91× | 0.02 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.43** (0.11 / 0.03 / 0.16) | 0.74× the median range |
| **Stored per Commit** | 36.8 KiB | 27.2 KiB | — |
| Metadata share | 0.44 | 0.44 | this range 0.57 |
| History: Commits / Layers / Branches | 62,546 | 63,409 / 36 / 828 | +863 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.69 GiB (Commits 8.25 GiB · installs 847.1 MiB · build 95.0 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 38.74 GiB / 45% | — |
| Snapshot | — | r053, 1.29 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 868.2 MiB | 1.01 | +8.6 MiB |
| Metadata | 139.4 MiB | 0.16 | +2.4 MiB |
| Index rows | 468.6 MiB | 0.55 | +10.9 MiB |
| Waste | 72.8 MiB | 0.08 | +1.0 MiB |
| Other | 1.9 MiB | 0.00 | +32.0 KiB |
| **Total = Store on disk** | **1.51 GiB** | **= 1.81** space amplification | +23.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 27.9 MiB | 136.9 MiB (72.1 MiB + 64.7 MiB) | 4.91× | — | 1.2 MiB | 4.7 MiB | 0.25 |
| `node_modules` | 691.9 MiB | 236.0 MiB (201.4 MiB + 34.6 MiB) | 0.34× | — | 970.6 KiB | 61.5 MiB | 0.01 |
| Build output | 26.3 MiB | 29.7 MiB (27.4 MiB + 2.4 MiB) | 1.13× | — | 973.6 KiB | 9.3 MiB | 0.10 |
| `.git` | 111.9 MiB | 548.3 MiB (523.9 MiB + 24.4 MiB) | 4.90× | — | 7.9 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 543.3 MiB | — (not divided) | — | 12.0 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 56.6 MiB | — | — | — | — | — |
| **Total** | — | **1.51 GiB** | **= 1.81×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 207,653 | +3,096 | 6.4 KiB | 0 (derived) | 50% |
| Chunks (large files) | 72,211 | +964 | 16.0 KiB | — | 59% |
| Large-file extents | 17,676 | — | 0.4 KiB | — | — |
| Directories | 494,104 | 3,808 (with inodes, pooled) | 0.3 KiB | — | 51% |
| Inodes and attributes | 412,788 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,480 | +4,696 | 0.1 KiB | — | — |

Delta: 2.9% at depth cap · 18% of refused bases stopped by budget · `node_modules` reinstall: absolute: 932574 new stored bytes for 874 raw changed bytes of 32 changed packages (1067.018×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.91× (136.9 MiB for 27.9 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.7 KiB / 4.2 KiB / 7.4 KiB over 228 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.15× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.9 MiB stored for 2.03 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.60 (3 lanes × 858.0 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.7 KiB (budget not set) |

## 4. Speed

Daemon `32eda22d657d` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 11.3 ms / 54.3 ms (1.17×) | 2.8 ms / 5.4 ms (1.01×) | 3.9 ms / 8.0 ms (1.27×) | 23.8 ms / 93.4 ms (1.10×) | 11.3 ms / 22.5 ms (1.06×) | 248 ms / 248 ms (0.50×) | — (native comparison in P3; exec 39.9 ms / 1037 ms) |
| SQL p50: 173 stmts | 58 stmts | 68 stmts | 252 stmts | 50 stmts | 4,269 stmts | — |

**Commit cost:** 15.27 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 771 ms p50 over 204
**Slowest:** sandbox.exec 43000 ms · sandbox.exec 36697 ms · sandbox.exec 34495 ms · checkpoint diff_commits 0.11 ms and 1.56 statements per entry (74,151 entries per page)
**Scaling:** 3 of 15 probes flat · `stat` 9.24 · `read` 9.05 · `list_small` 41.35 · `list_largest` 2.73 · `grep_scoped` 7.43 · `glob_scoped` 8.78 · `glob_tree` 4.20 · `diff_files` 12.93 · `list_commits` 14.73 · `diff_commits` 13.20 · `fork` 17.19 · `merge` 3.62

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 419 ms / 419 ms | — / — | — | git / status-cold: — |
| git status (steady) | 428 ms / 669 ms | — / — | — | git / status-steady: — |
| git add | 42.0 ms / 123 ms | — / — | — | git / add: — |
| git commit (lane) | 47.0 ms / 81.0 ms | — / — | — | git / commit: — |
| lead writes main | 4978 ms / 4978 ms | — / — | — | — |
| repack | 2126 ms / 2126 ms | — / — | — | — |
| pnpm install (incremental) | 1643 ms / 1643 ms | 1252 ms / 1252 ms | 1.31× | pnpm-reinstall / cold: — |
| pnpm refresh | 3438 ms / 3438 ms | 2185 ms / 2185 ms | 1.57× | pnpm-reinstall / steady: — |
| tsc -b | 7026 ms / 7026 ms | 4994 ms / 6347 ms | 1.41× | tsc-b / cold: — |
| vitest | 29594 ms / 29594 ms | 9390 ms / 9390 ms | 3.15× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 13.4 ms / 30.7 ms

### Speed as history grows

Range 15 is the reference (owner 2026-10-19; a watch row, not a gate). Uncontended calls; read syscalls per solo in-process call stand in for SQLite page-cache misses (no hit/miss counter is reported by the binary); Workspace calls read in the daemon's process, so they have none here.

| Range | Commits | Store MiB | fs.write ≤1 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤8 KiB p50 ms (×r15) · VM steps · reads/call | fs.write ≤64 KiB p50 ms (×r15) · VM steps · reads/call | fs.read ≤8 KiB p50 ms (×r15) · VM steps · reads/call | sandbox.mount p50 ms (×r15) · VM steps · reads/call | sandbox.commit 1 file (Committed) p50 ms (×r15) · VM steps · reads/call | branch.merge p50 ms (×r15) · VM steps · reads/call |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 015.a4 | 12851 | 207.8 | 5.90 (1.00×) · 6031 · not recorded | 6.21 (1.00×) · 6202 · not recorded | 7.29 (1.00×) · 6942 · not recorded | 1.99 (1.00×) · 3468 · not recorded | 9.12 (1.00×) · 1391 · not recorded | 8.34 (1.00×) · 5058 · not recorded | not split by class (before range 18) |
| 016.a3 | 14766 | 243.7 | 7.83 (1.33×) · 6936 · not recorded | 8.02 (1.29×) · 6716 · not recorded | 8.79 (1.21×) · 6961 · not recorded | 2.52 (1.26×) · 3468 · not recorded | 10.30 (1.13×) · 1337 · not recorded | 9.16 (1.10×) · 4389 · not recorded | not split by class (before range 18) |
| 017.a2 | 15811 | 265.7 | 10.12 (1.71×) · 6649 · not recorded | 9.42 (1.52×) · 6674 · not recorded | 10.07 (1.38×) · 7505 · not recorded | 2.91 (1.46×) · 3610 · not recorded | 11.52 (1.26×) · 1337 · not recorded | 10.18 (1.22×) · 5108 · not recorded | not split by class (before range 18) |
| 018.a6 | 17442 | 329.4 | 7.23 (1.23×) · 7012 · 308 (13 solo) | 7.31 (1.18×) · 6681 · 272 (125 solo) | 8.33 (1.14×) · 7276 · 340 (134 solo) | 2.48 (1.24×) · 3475 · — (0 solo) | 9.64 (1.06×) · 1337 · — (daemon) | 9.40 (1.13×) · 5265 · — (daemon) | 2709.77 (—×) · 15044810 · 26378 (3 solo) |
| 019.a4 | 18401 | 354.7 | 8.18 (1.39×) · 5950 · 250 (11 solo) | 8.63 (1.39×) · 6703 · 302 (93 solo) | 9.84 (1.35×) · 7721 · 357 (108 solo) | 3.23 (1.62×) · 4209 · 60 (2 solo) | 11.03 (1.21×) · 1337 · — (daemon) | 9.98 (1.20×) · 4896 · — (daemon) | 803.54 (—×) · 1377824 · 7245 (4 solo) |
| 020.a2 | 19322 | 374.1 | 7.09 (1.20×) · 6694 · 244 (50 solo) | 7.68 (1.24×) · 6821 · 267 (106 solo) | 8.57 (1.17×) · 7330 · 294 (92 solo) | 2.43 (1.22×) · 3716 · 207 (1 solo) | 10.00 (1.10×) · 1337 · — (daemon) | 9.37 (1.12×) · 5130 · — (daemon) | 888.05 (—×) · 1899898 · 9363 (3 solo) |
| 021.a2 | 20774 | 406.1 | 9.35 (1.58×) · 7305 · 274 (9 solo) | 8.02 (1.29×) · 5651 · 265 (69 solo) | 9.12 (1.25×) · 7036 · 322 (54 solo) | 2.20 (1.11×) · 3028 · — (0 solo) | 11.71 (1.28×) · 1337 · — (daemon) | 9.72 (1.16×) · 5225 · — (daemon) | 1007.13 (—×) · 844072 · 9186 (4 solo) |
| 022.a1 | 23062 | 444.9 | 7.04 (1.19×) · 5812 · 234 (17 solo) | 7.11 (1.14×) · 5968 · 218 (106 solo) | 8.58 (1.18×) · 6594 · 283 (105 solo) | 1.90 (0.95×) · 2092 · 63 (2 solo) | 10.46 (1.15×) · 1337 · — (daemon) | 9.07 (1.09×) · 4334 · — (daemon) | 1654.50 (—×) · 2513563 · 16357 (3 solo) |
| 023.a1 | 24522 | 506.8 | 7.57 (1.28×) · 5717 · 216 (7 solo) | 7.31 (1.18×) · 5936 · 261 (45 solo) | 7.92 (1.09×) · 6044 · 311 (37 solo) | 2.25 (1.13×) · 2690 · 179 (1 solo) | 9.78 (1.07×) · 1362 · — (daemon) | 9.51 (1.14×) · 4280 · — (daemon) | 283.86 (—×) · 464325 · 8582 (3 solo) |
| 024.a1 | 25762 | 537.2 | 7.75 (1.31×) · 6210 · 204 (27 solo) | 7.40 (1.19×) · 6347 · 242 (105 solo) | 7.97 (1.09×) · 6562 · 255 (134 solo) | 2.74 (1.38×) · 3257 · 78 (4 solo) | 11.01 (1.21×) · 1425 · — (daemon) | 9.24 (1.11×) · 3987 · — (daemon) | 455.67 (—×) · 674403 · 8922 (3 solo) |
| 025.a1 | 27563 | 627.9 | 9.69 (1.64×) · 7543 · 236 (1 solo) | 8.21 (1.32×) · 5480 · 251 (10 solo) | 8.21 (1.13×) · 5279 · 310 (6 solo) | 3.04 (1.53×) · 3708 · — (0 solo) | 11.06 (1.21×) · 1362 · — (daemon) | 9.32 (1.12×) · 3909 · — (daemon) | 229.07 (—×) · 361898 · 6093 (3 solo) |
| 026.a1 | 29975 | 669.9 | 6.47 (1.10×) · 6137 · 222 (56 solo) | 6.76 (1.09×) · 6376 · 256 (222 solo) | 7.59 (1.04×) · 6682 · 294 (198 solo) | 2.36 (1.19×) · 3365 · 79 (1 solo) | 10.01 (1.10×) · 1362 · — (daemon) | 8.93 (1.07×) · 5092 · — (daemon) | 333.81 (—×) · 621744 · 11927 (3 solo) |
| 027.a2 | 30629 | 688.0 | 7.75 (1.31×) · 6978 · 228 (24 solo) | 8.12 (1.31×) · 7581 · 288 (119 solo) | 8.98 (1.23×) · 7186 · 327 (41 solo) | 2.71 (1.36×) · 3304 · — (0 solo) | 10.03 (1.10×) · 1362 · — (daemon) | 10.59 (1.27×) · 5757 · — (daemon) | 392.93 (—×) · 655226 · 8832 (3 solo) |
| 028.a2 | 32548 | 737.6 | 6.63 (1.12×) · 5906 · 230 (9 solo) | 6.89 (1.11×) · 5882 · 223 (70 solo) | 8.07 (1.11×) · 6405 · 309 (100 solo) | 2.35 (1.18×) · 3179 · 46 (8 solo) | 10.04 (1.10×) · 1362 · — (daemon) | 10.11 (1.21×) · 4374 · — (daemon) | 268.20 (—×) · 418356 · 8462 (4 solo) |
| 029.a1 | 33478 | 774.1 | 9.40 (1.59×) · 8741 · 379 (13 solo) | 8.42 (1.36×) · 6823 · 370 (55 solo) | 8.70 (1.19×) · 6867 · 351 (26 solo) | 2.57 (1.29×) · 3834 · 55 (2 solo) | 10.23 (1.12×) · 1362 · — (daemon) | 8.83 (1.06×) · 4530 · — (daemon) | 454.73 (—×) · 806701 · 10820 (4 solo) |
| 030.a1 | 35023 | 803.7 | 11.61 (1.97×) · 6627 · 246 (20 solo) | 8.70 (1.40×) · 6083 · 271 (95 solo) | 8.80 (1.21×) · 6033 · 300 (131 solo) | 3.05 (1.53×) · 3118 · 48 (2 solo) | 12.55 (1.38×) · 1362 · — (daemon) | 10.40 (1.25×) · 4431 · — (daemon) | 319.45 (—×) · 470795 · 10330 (3 solo) |
| 031.a1 | 35351 | 835.9 | 10.84 (1.84×) · 9623 · — (0 solo) | 7.16 (1.15×) · 5428 · 604 (5 solo) | 7.65 (1.05×) · 5813 · 375 (2 solo) | 2.45 (1.23×) · 3199 · — (0 solo) | 9.88 (1.08×) · 1362 · — (daemon) | 8.96 (1.07×) · 3894 · — (daemon) | 2.22 (—×) · 517 · 29 (2 solo) |
| 032.a1 | 36538 | 870.9 | 8.46 (1.43×) · 7501 · 364 (16 solo) | 8.20 (1.32×) · 7234 · 347 (148 solo) | 8.68 (1.19×) · 7395 · 379 (121 solo) | 2.78 (1.39×) · 3904 · — (0 solo) | 10.21 (1.12×) · 1362 · — (daemon) | 8.89 (1.07×) · 4608 · — (daemon) | 411.44 (—×) · 721312 · 10559 (4 solo) |
| 033.a1 | 37184 | 890.5 | 8.67 (1.47×) · 6143 · 211 (1 solo) | 7.75 (1.25×) · 6430 · 313 (52 solo) | 8.79 (1.20×) · 6155 · 349 (41 solo) | 2.20 (1.10×) · 2939 · — (0 solo) | 10.93 (1.20×) · 1362 · — (daemon) | 9.95 (1.19×) · 3945 · — (daemon) | 275.58 (—×) · 323482 · 7567 (3 solo) |
| 034.a1 | 38594 | 922.8 | 8.67 (1.47×) · 7209 · 251 (12 solo) | 7.74 (1.25×) · 6773 · 286 (41 solo) | 8.25 (1.13×) · 6167 · 285 (64 solo) | 2.67 (1.34×) · 3236 · 109 (3 solo) | 9.90 (1.09×) · 1362 · — (daemon) | 11.18 (1.34×) · 5652 · — (daemon) | 323.49 (—×) · 478357 · 9655 (3 solo) |
| 035.a1 | 39429 | 946.2 | 9.31 (1.58×) · 7774 · 496 (3 solo) | 7.08 (1.14×) · 6352 · 374 (14 solo) | 7.95 (1.09×) · 6919 · 379 (35 solo) | 2.90 (1.45×) · 3561 · — (0 solo) | 9.60 (1.05×) · 1362 · — (daemon) | 9.73 (1.17×) · 5136 · — (daemon) | 1.65 (—×) · 517 · 42 (2 solo) |
| 036.a1 | 42419 | 983.6 | 4.94 (0.84×) · 4436 · 191 (10 solo) | 5.16 (0.83×) · 4546 · 179 (108 solo) | 5.66 (0.78×) · 4695 · 263 (58 solo) | 2.39 (1.20×) · 3015 · — (0 solo) | 9.14 (1.00×) · 1362 · — (daemon) | — (—×) · — · — (daemon) | 293.22 (—×) · 516618 · 9785 (3 solo) |
| 037.a1 | 44313 | 1021.6 | 6.90 (1.17×) · 5915 · 256 (17 solo) | 6.49 (1.04×) · 5682 · 260 (104 solo) | 7.31 (1.00×) · 6249 · 347 (75 solo) | 2.35 (1.18×) · 3344 · 46 (3 solo) | 9.89 (1.08×) · 1362 · — (daemon) | 8.00 (0.96×) · 5229 · — (daemon) | 336.24 (—×) · 498534 · 11405 (4 solo) |
| 038.a2 | 45294 | 1047.5 | 6.63 (1.12×) · 6925 · 193 (4 solo) | 6.80 (1.09×) · 6457 · 292 (38 solo) | 6.77 (0.93×) · 5696 · 451 (13 solo) | 2.04 (1.02×) · 3306 · 205 (1 solo) | 9.79 (1.07×) · 1362 · — (daemon) | 8.32 (1.00×) · 4461 · — (daemon) | 333.42 (—×) · 424298 · 9993 (3 solo) |
| 039.a1 | 46731 | 1087.5 | 8.82 (1.49×) · 8311 · 303 (20 solo) | 7.84 (1.26×) · 7620 · 370 (39 solo) | 8.44 (1.16×) · 7734 · 470 (23 solo) | 2.39 (1.20×) · 3326 · 93 (2 solo) | 9.97 (1.09×) · 1362 · — (daemon) | 8.24 (0.99×) · 4332 · — (daemon) | 271.77 (—×) · 460242 · 11032 (4 solo) |
| 040.a1 | 48092 | 1115.5 | 7.50 (1.27×) · 6245 · 256 (10 solo) | 7.75 (1.25×) · 6643 · 357 (37 solo) | 8.52 (1.17×) · 7129 · 416 (40 solo) | 2.57 (1.29×) · 3394 · — (0 solo) | 9.38 (1.03×) · 1362 · — (daemon) | 8.97 (1.08×) · 4484 · — (daemon) | 299.26 (—×) · 446500 · 10520 (4 solo) |
| 041.a1 | 48936 | 1146.6 | 8.71 (1.47×) · 6751 · 270 (18 solo) | 8.10 (1.30×) · 5915 · 374 (42 solo) | 9.30 (1.28×) · 6306 · 383 (58 solo) | 2.31 (1.16×) · 3228 · 125 (1 solo) | 9.74 (1.07×) · 1362 · — (daemon) | 9.90 (1.19×) · 4616 · — (daemon) | 308.48 (—×) · 515638 · 11672 (3 solo) |
| 042.a1 | 50146 | 1182.0 | 7.38 (1.25×) · 6433 · 273 (34 solo) | 7.64 (1.23×) · 6300 · 317 (104 solo) | 7.43 (1.02×) · 5793 · 297 (61 solo) | 2.54 (1.27×) · 3075 · 83 (5 solo) | 10.05 (1.10×) · 1362 · — (daemon) | 9.72 (1.17×) · 4266 · — (daemon) | 464.11 (—×) · 737059 · 13057 (4 solo) |
| 043.a1 | 51610 | 1223.8 | 7.04 (1.19×) · 6937 · 276 (27 solo) | 7.41 (1.19×) · 6674 · 345 (49 solo) | 7.43 (1.02×) · 6556 · 343 (100 solo) | 2.42 (1.21×) · 3278 · 189 (2 solo) | 8.87 (0.97×) · 1362 · — (daemon) | 9.28 (1.11×) · 4581 · — (daemon) | 348.56 (—×) · 554099 · 12963 (3 solo) |
| 044.a2 | 52850 | 1254.5 | 7.31 (1.24×) · 7053 · 256 (20 solo) | 6.85 (1.10×) · 6738 · 308 (64 solo) | 7.35 (1.01×) · 6625 · 381 (79 solo) | 2.16 (1.08×) · 3080 · 54 (3 solo) | 8.76 (0.96×) · 1362 · — (daemon) | 8.74 (1.05×) · 4260 · — (daemon) | 166.26 (—×) · 357340 · 8322 (3 solo) |
| 045.a1 | 53964 | 1286.9 | 7.24 (1.23×) · 7087 · 286 (16 solo) | 6.95 (1.12×) · 7135 · 317 (77 solo) | 7.55 (1.04×) · 6871 · 305 (76 solo) | 2.38 (1.20×) · 3611 · 94 (9 solo) | 8.87 (0.97×) · 1362 · — (daemon) | 9.39 (1.13×) · 4995 · — (daemon) | 305.33 (—×) · 485040 · 12305 (3 solo) |
| 046.a1 | 54791 | 1312.2 | 7.64 (1.29×) · 8172 · 168 (2 solo) | 7.70 (1.24×) · 7367 · 303 (32 solo) | 8.00 (1.10×) · 6914 · 301 (66 solo) | 2.71 (1.36×) · 3485 · 79 (7 solo) | 8.82 (0.97×) · 1362 · — (daemon) | 8.56 (1.03×) · 4699 · — (daemon) | 307.16 (—×) · 466212 · 11223 (3 solo) |
| 047.a1 | 56578 | 1359.1 | 8.35 (1.41×) · 7640 · 335 (21 solo) | 8.40 (1.35×) · 7202 · 410 (88 solo) | 8.54 (1.17×) · 6821 · 418 (67 solo) | 2.54 (1.28×) · 3466 · 131 (1 solo) | 9.45 (1.04×) · 1362 · — (daemon) | 11.63 (1.39×) · 5490 · — (daemon) | 433.20 (—×) · 654351 · 15082 (4 solo) |
| 048.a1 | 58088 | 1390.3 | 8.33 (1.41×) · 7008 · 378 (15 solo) | 7.76 (1.25×) · 6851 · 262 (85 solo) | 9.03 (1.24×) · 6564 · 313 (61 solo) | 2.81 (1.41×) · 3334 · 111 (7 solo) | 9.90 (1.08×) · 1362 · — (daemon) | 9.04 (1.08×) · 4602 · — (daemon) | 327.87 (—×) · 344822 · 9703 (3 solo) |
| 049.a1 | 59295 | 1426.0 | 8.07 (1.37×) · 6352 · 328 (10 solo) | 8.18 (1.32×) · 6850 · 307 (54 solo) | 8.84 (1.21×) · 7371 · 362 (51 solo) | 3.27 (1.64×) · 4122 · 75 (7 solo) | 9.92 (1.09×) · 1362 · — (daemon) | 10.33 (1.24×) · 4329 · — (daemon) | 213.34 (—×) · 334840 · 7279 (4 solo) |
| 050.a1 | 60450 | 1462.0 | 7.36 (1.25×) · 7605 · 383 (12 solo) | 8.30 (1.34×) · 7756 · 375 (45 solo) | 8.39 (1.15×) · 6315 · 414 (17 solo) | 2.75 (1.38×) · 3950 · 225 (3 solo) | 9.61 (1.05×) · 1362 · — (daemon) | 8.81 (1.06×) · 3657 · — (daemon) | 459.51 (—×) · 530087 · 12571 (3 solo) |
| 051.a1 | 61383 | 1486.0 | 8.40 (1.42×) · 7415 · 341 (22 solo) | 7.57 (1.22×) · 6531 · 238 (89 solo) | 7.62 (1.04×) · 6446 · 278 (97 solo) | 2.55 (1.28×) · 3609 · 71 (8 solo) | 9.41 (1.03×) · 1362 · — (daemon) | 10.36 (1.24×) · 5130 · — (daemon) | 361.34 (—×) · 426337 · 10118 (3 solo) |
| 052.a1 | 62546 | 1527.8 | 8.42 (1.43×) · 7262 · 342 (30 solo) | 7.84 (1.26×) · 6616 · 294 (59 solo) | 8.42 (1.15×) · 6023 · 385 (71 solo) | 2.54 (1.28×) · 3082 · — (0 solo) | 9.94 (1.09×) · 1362 · — (daemon) | 8.67 (1.04×) · 4221 · — (daemon) | 367.37 (—×) · 482357 · 12922 (3 solo) |
| 053.a1 | 63409 | 1550.9 | 8.89 (1.51×) · 7121 · 293 (18 solo) | 8.78 (1.41×) · 6567 · 421 (50 solo) | 10.08 (1.38×) · 6512 · 450 (40 solo) | 2.67 (1.34×) · 4309 · 235 (2 solo) | 10.60 (1.16×) · 1362 · — (daemon) | 9.77 (1.17×) · 4992 · — (daemon) | 247.84 (—×) · 324874 · 8146 (3 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 24752 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4136512 B · sandbox.mount 4194304 → 2888152 B · sandbox.commit 1 file (Committed) 4194304 → 4136512 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 11.62 at the first command → 6.22 after the last (max 12.64 over 8 commands) · Docker VM 4.79 → 2.6

**Control probe** (one sample per arm, same window and binaries; (a) the range 15 Store, (b) the range's). Gap: each clone is copied just before its arm, which warms the OS cache equally in both, so the control cannot see a cold-read effect of a larger Store (storage reads are 0 in both arms); it compares warm-cache work only.

| Sample | (a) Commits · MiB | (b) Commits · MiB | fs.write ≤1 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.write ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | fs.read ≤8 KiB: (a) / (b) p50 ms · (b)/(a) · reads/call (a)/(b) | Host load (macOS) | Watch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| control-017.diag-15v17 | 12851 · 207.8 | 15811 · 265.7 | failed: (a) 0 of ? calls ok, (b) 0 ok | failed: (a) 0 of ? calls ok, (b) 0 ok | 2.79 (1.00× first) / 2.43 · 0.87× · 73/57 | 9.15 → 9.53 | not judged (failed calls) |
| control-017.diag-15v17-2 | 12851 · 207.8 | 15811 · 265.7 | 6.21 (1.00× first) / 6.63 · 1.07× · 114/112 | 6.39 (1.00× first) / 6.40 · 1.00× · 109/110 | 2.59 (0.93× first) / 2.32 · 0.89× · 73/57 | 11.39 → 10.96 | pass |
| control-018.a1 | 12851 · 207.8 | 17442 · 328.3 | 6.63 (1.07× first) / 7.01 · 1.06× · 113/112 | 6.46 (1.01× first) / 6.41 · 0.99× · 108/108 | 2.74 (0.98× first) / 2.53 · 0.92× · 73/70 | 10.05 → 10.05 | pass |
| control-018.a2 | 12851 · 207.8 | 17442 · 328.4 | 6.23 (1.00× first) / 6.62 · 1.06× · 116/111 | 6.37 (1.00× first) / 6.24 · 0.98× · 110/109 | 2.41 (0.86× first) / 2.35 · 0.97× · 73/67 | 9.83 → 9.69 | pass |
| control-018.a3 | 12851 · 207.8 | 17442 · 328.3 | 6.67 (1.08× first) / 6.47 · 0.97× · 109/111 | 6.72 (1.05× first) / 6.49 · 0.97× · 109/109 | 2.73 (0.98× first) / 2.61 · 0.96× · 73/70 | 8.25 → 8.25 | pass |
| control-018.a4 | 12851 · 207.8 | 17442 · 328.7 | 6.53 (1.05× first) / 6.95 · 1.06× · 110/129 | 6.44 (1.01× first) / 6.80 · 1.06× · 109/110 | 2.60 (0.93× first) / 2.89 · 1.11× · 73/71 | 10.05 → 10.29 | pass |
| control-018.a6 | 12851 · 207.8 | 17442 · 329.4 | 6.35 (1.02× first) / 6.26 · 0.99× · 115/116 | 6.28 (0.98× first) / 5.97 · 0.95× · 108/111 | 3.14 (1.13× first) / 2.24 · 0.71× · 73/77 | 6.84 → 6.84 | pass |
| control-019.a3 | 12851 · 207.8 | 18401 · 354.4 | 5.85 (0.94× first) / 5.96 · 1.02× · 113/116 | 5.50 (0.86× first) / 6.08 · 1.11× · 108/113 | 2.39 (0.86× first) / 2.31 · 0.96× · 74/75 | 10.18 → 11.45 | pass |
| control-019.a4 | 12851 · 207.8 | 18401 · 354.7 | 6.15 (0.99× first) / 7.52 · 1.22× · 111/138 | 6.76 (1.06× first) / 6.60 · 0.98× · 108/111 | 2.80 (1.01× first) / 2.51 · 0.90× · 74/76 | 10.96 → 10.57 | pass |
| control-020.a1 | 12851 · 207.8 | 19322 · 374.2 | 6.10 (0.98× first) / 7.15 · 1.17× · 112/141 | 6.20 (0.97× first) / 5.95 · 0.96× · 109/110 | 2.48 (0.89× first) / 2.40 · 0.97× · 70/79 | 10.08 → 9.76 | pass |
| control-020.a2 | 12851 · 207.8 | 19322 · 374.1 | 5.49 (0.88× first) / 6.81 · 1.24× · 113/115 | 5.82 (0.91× first) / 5.75 · 0.99× · 108/112 | 1.96 (0.70× first) / 1.94 · 0.99× · 70/80 | 9.23 → 8.97 | pass |
| control-021.a2 | 12851 · 207.8 | 20774 · 406.1 | 6.48 (1.04× first) / 5.93 · 0.92× · 113/110 | 6.26 (0.98× first) / 5.98 · 0.96× · 107/110 | 2.28 (0.82× first) / 1.97 · 0.86× · 77/86 | 9.19 → 9.19 | pass |
| control-022.a1 | 12851 · 207.8 | 23062 · 442.2 | 6.19 (1.00× first) / 7.39 · 1.20× · 116/115 | 5.89 (0.92× first) / 6.35 · 1.08× · 109/113 | 2.51 (0.90× first) / 2.16 · 0.86× · 92/81 | 9.12 → 8.71 | pass |
| control-023.a1 | 12851 · 207.8 | 24522 · 506.8 | 5.66 (0.91× first) / 5.42 · 0.96× · 114/117 | 5.41 (0.85× first) / 5.50 · 1.02× · 110/116 | 2.86 (1.03× first) / 2.28 · 0.80× · 76/81 | 10.38 → 10.38 | pass |
| control-024.a1 | 12851 · 207.8 | 25762 · 534.5 | 5.86 (0.94× first) / 5.67 · 0.97× · 113/130 | 5.72 (0.90× first) / 5.98 · 1.05× · 111/119 | 2.63 (0.95× first) / 2.54 · 0.97× · 75/78 | 12.49 → 12.13 | pass |
| control-025.a1 | 12851 · 207.8 | 27563 · 627.9 | 10.27 (1.65× first) / 10.70 · 1.04× · 115/119 | 10.78 (1.69× first) / 9.42 · 0.87× · 109/115 | 6.32 (2.27× first) / 6.64 · 1.05× · 75/100 | 11.62 → 12.06 | pass |
| control-026.a1 | 12851 · 207.8 | 29975 · 667.3 | 5.04 (0.81× first) / 6.12 · 1.22× · 115/148 | 5.36 (0.84× first) / 5.56 · 1.04× · 110/119 | 2.24 (0.80× first) / 2.39 · 1.06× · 73/90 | 7.87 → 8.12 | pass |
| control-027.a1 | 12851 · 207.8 | 30629 · 688.1 | 5.59 (0.90× first) / 6.36 · 1.14× · 115/134 | 5.84 (0.91× first) / 6.16 · 1.05× · 108/124 | 2.58 (0.93× first) / 2.33 · 0.90× · 68/80 | 9.22 → 8.97 | pass |
| control-027.a2 | 12851 · 207.8 | 30629 · 688.0 | 6.10 (0.98× first) / 5.69 · 0.93× · 113/129 | 5.39 (0.84× first) / 5.73 · 1.06× · 111/122 | 2.12 (0.76× first) / 1.84 · 0.87× · 68/76 | 11.42 → 10.90 | pass |
| control-028.a1 | 12851 · 207.8 | 32548 · 737.6 | 5.91 (0.95× first) / 6.25 · 1.06× · 115/120 | 5.90 (0.92× first) / 5.67 · 0.96× · 112/118 | 2.56 (0.92× first) / 3.11 · 1.22× · 67/126 | 7.82 → 7.67 | pass |
| control-028.a2 | 12851 · 207.8 | 32548 · 737.6 | 6.12 (0.99× first) / 5.88 · 0.96× · 113/122 | 5.56 (0.87× first) / 5.64 · 1.01× · 110/120 | 2.14 (0.77× first) / 2.71 · 1.26× · 67/127 | 8.05 → 8.05 | pass |
| control-029.a1 | 12851 · 207.8 | 33478 · 771.5 | 5.60 (0.90× first) / 6.23 · 1.11× · 112/135 | 5.49 (0.86× first) / 5.69 · 1.04× · 109/120 | 2.54 (0.91× first) / 2.67 · 1.05× · 71/111 | 6.98 → 8.74 | pass |
| control-030.a1 | 12851 · 207.8 | 35023 · 803.7 | 6.52 (1.05× first) / 6.57 · 1.01× · 115/145 | 5.74 (0.90× first) / 5.93 · 1.03× · 109/122 | 2.34 (0.84× first) / 2.64 · 1.13× · 66/96 | 8.48 → 8.48 | pass |
| control-031.a1 | 12851 · 207.8 | 35351 · 835.9 | 5.70 (0.92× first) / 6.21 · 1.09× · 114/149 | 5.63 (0.88× first) / 6.05 · 1.07× · 110/121 | 2.25 (0.81× first) / 2.54 · 1.13× · 69/87 | 8.96 → 8.88 | pass |
| control-032.a1 | 12851 · 207.8 | 36538 · 868.0 | 6.10 (0.98× first) / 5.38 · 0.88× · 112/149 | 5.68 (0.89× first) / 5.18 · 0.91× · 109/124 | 2.23 (0.80× first) / 2.07 · 0.93× · 72/105 | 7.71 → 7.49 | pass |
| control-033.a1 | 12851 · 207.8 | 37184 · 890.5 | 4.97 (0.80× first) / 5.69 · 1.14× · 113/146 | 4.97 (0.78× first) / 5.09 · 1.02× · 110/125 | 2.22 (0.80× first) / 2.59 · 1.17× · 87/101 | 11.27 → 11.01 | pass |
| control-034.a1 | 12851 · 207.8 | 38594 · 919.9 | 6.44 (1.04× first) / 6.01 · 0.93× · 115/148 | 5.11 (0.80× first) / 5.24 · 1.02× · 111/126 | 2.34 (0.84× first) / 2.42 · 1.03× · 72/106 | 12.20 → 11.47 | pass |
| control-035.a1 | 12851 · 207.8 | 39429 · 946.2 | 5.19 (0.84× first) / 5.65 · 1.09× · 116/128 | 5.27 (0.83× first) / 4.88 · 0.93× · 111/125 | 2.06 (0.74× first) / 2.45 · 1.19× · 72/112 | 8.02 → 7.78 | pass |
| control-036.a1 | 12851 · 207.8 | 42419 · 980.9 | 5.88 (0.95× first) / 5.68 · 0.97× · 113/236 | 5.55 (0.87× first) / 5.36 · 0.96× · 109/129 | 2.03 (0.73× first) / 2.34 · 1.15× · 62/130 | 6.20 → 6.67 | watch (fs.write ≤1 KiB, fs.read ≤8 KiB) |
| control-037.a1 | 12851 · 207.8 | 44313 · 1021.6 | 5.21 (0.84× first) / 5.51 · 1.06× · 115/135 | 4.95 (0.77× first) / 5.01 · 1.01× · 110/126 | 2.30 (0.82× first) / 2.45 · 1.06× · 74/117 | 6.41 → 7.18 | pass |
| control-038.a1 | 12851 · 207.8 | 44313 · 1047.7 | 5.49 (0.88× first) / 5.82 · 1.06× · 112/147 | 5.80 (0.91× first) / 4.91 · 0.85× · 109/125 | 2.34 (0.84× first) / 2.54 · 1.09× · 75/115 | 7.06 → 7.21 | pass |
| control-038.a2 | 12851 · 207.8 | 45294 · 1047.5 | 5.38 (0.87× first) / 6.70 · 1.25× · 114/146 | 4.88 (0.76× first) / 5.01 · 1.03× · 110/123 | 2.65 (0.95× first) / 2.43 · 0.92× · 75/116 | 6.58 → 6.53 | pass |
| control-039.a1 | 12851 · 207.8 | 46731 · 1084.9 | 5.66 (0.91× first) / 5.67 · 1.00× · 113/133 | 5.27 (0.82× first) / 5.60 · 1.06× · 108/123 | 2.26 (0.81× first) / 2.62 · 1.16× · 75/137 | 6.90 → 6.75 | pass |
| control-040.a1 | 12851 · 207.8 | 48092 · 1115.5 | 5.35 (0.86× first) / 5.33 · 1.00× · 113/131 | 4.95 (0.77× first) / 4.91 · 0.99× · 110/122 | 2.10 (0.76× first) / 2.11 · 1.00× · 70/116 | 6.23 → 6.21 | pass |
| control-041.a1 | 12851 · 207.8 | 48936 · 1143.9 | 5.63 (0.91× first) / 5.34 · 0.95× · 113/130 | 5.32 (0.83× first) / 5.27 · 0.99× · 110/127 | 2.36 (0.85× first) / 2.64 · 1.12× · 72/135 | 7.33 → 7.33 | pass |
| control-042.a1 | 12851 · 207.8 | 50146 · 1182.0 | 5.32 (0.86× first) / 5.16 · 0.97× · 114/135 | 4.82 (0.75× first) / 5.29 · 1.10× · 108/124 | 2.13 (0.77× first) / 2.10 · 0.98× · 72/123 | 5.48 → 5.28 | pass |
| control-043.a1 | 12851 · 207.8 | 51610 · 1221.4 | 5.00 (0.81× first) / 5.39 · 1.08× · 114/153 | 4.88 (0.76× first) / 5.16 · 1.06× · 110/127 | 1.95 (0.70× first) / 2.23 · 1.14× · 79/120 | 5.43 → 5.23 | pass |
| control-044.a2 | 12851 · 207.8 | 52850 · 1254.5 | 5.58 (0.90× first) / 6.18 · 1.11× · 113/155 | 5.01 (0.78× first) / 4.88 · 0.97× · 110/131 | 2.18 (0.78× first) / 2.01 · 0.92× · 81/111 | 5.11 → 5.19 | pass |
| control-045.a1 | 12851 · 207.8 | 53964 · 1283.6 | 5.24 (0.84× first) / 5.00 · 0.95× · 115/131 | 4.73 (0.74× first) / 5.15 · 1.09× · 109/124 | 2.14 (0.77× first) / 2.36 · 1.10× · 81/115 | 5.00 → 4.76 | pass |
| control-046.a1 | 12851 · 207.8 | 54791 · 1312.2 | 4.73 (0.76× first) / 5.07 · 1.07× · 114/130 | 4.75 (0.74× first) / 4.57 · 0.96× · 109/127 | 2.08 (0.75× first) / 2.06 · 0.99× · 93/105 | 4.32 → 4.38 | pass |
| control-047.a1 | 12851 · 207.8 | 56578 · 1356.7 | 15.13 (2.44× first) / 5.85 · 0.39× · 114/127 | 9.49 (1.49× first) / 6.35 · 0.67× · 109/125 | 3.13 (1.12× first) / 3.46 · 1.10× · 89/130 | 12.40 → 14.05 | pass |
| control-048.a1 | 12851 · 207.8 | 58088 · 1390.3 | 5.27 (0.85× first) / 4.91 · 0.93× · 113/128 | 4.58 (0.72× first) / 4.72 · 1.03× · 111/125 | 2.30 (0.83× first) / 3.17 · 1.38× · 89/164 | 7.99 → 7.67 | pass |
| control-049.a1 | 12851 · 207.8 | 59295 · 1423.3 | 5.78 (0.93× first) / 5.60 · 0.97× · 114/139 | 5.80 (0.91× first) / 5.66 · 0.98× · 109/127 | 2.72 (0.98× first) / 3.27 · 1.20× · 89/164 | 16.50 → 15.82 | pass |
| control-050.a1 | 12851 · 207.8 | 60450 · 1462.0 | 8.62 (1.39× first) / 6.89 · 0.80× · 114/131 | 12.07 (1.89× first) / 7.13 · 0.59× · 110/126 | 6.75 (2.42× first) / 5.18 · 0.77× · 90/161 | 6.45 → 7.13 | pass |
| control-051.a1 | 12851 · 207.8 | 61383 · 1486.0 | 6.69 (1.08× first) / 5.70 · 0.85× · 116/156 | 5.60 (0.88× first) / 4.93 · 0.88× · 112/127 | 2.61 (0.94× first) / 2.92 · 1.12× · 90/144 | 7.43 → 7.15 | pass |
| control-052.a1 | 12851 · 207.8 | 62546 · 1527.8 | 5.48 (0.88× first) / 6.37 · 1.16× · 116/130 | 5.38 (0.84× first) / 5.50 · 1.02× · 111/127 | 2.69 (0.96× first) / 2.85 · 1.06× · 90/145 | 8.02 → 7.62 | pass |
| control-053.a1 | 12851 · 207.8 | 63409 · 1550.9 | 5.28 (0.85× first) / 6.45 · 1.22× · 113/142 | 5.34 (0.84× first) / 5.66 · 1.06× · 111/125 | 2.77 (0.99× first) / 2.78 · 1.00× · 90/123 | 7.87 → 7.64 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-053.a1)

## 5. Findings and action

### Finding 053.a1 · optimize

**1. Trigger** (attempt 1, daemon `32eda22d657d`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | oneshot_mount_unmount.statements: depth exponent 3.772 | < 0.05 |
| Snapshot time | 5905 ms for 1322.9 MiB new; size exponent 1.112 | < 0.15 |

Diagnosis pending: `finding-053.a1.json`.

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
| F-030 | `daemon[].fuse.served` on traced exec lines is cumulative | the builder checks the `oneshot_exec` probe split | 08de4f038 |
| F-031 | the replay's Workspaces have no `.git` | the builder | after the P3 dev checks, measuring Store growth per git commit (index, loose objects, packs) and the wall time added per range |
| F-032 | deleting a base tree over FUSE costs ~0.7 ms per entry | the fixer | after item 7, with per-op timing first (D0) |
| F-033 | `MAXIMUM_LINEAGE_ROWS` | the fixer | queued after that confirmation**; the lead places it in the item order |
| F-034 | a fresh mount path per mount leaves absolute paths stale | lead | see BUGS.md |
| F-035 | fs read calls scan one byte at a time and re-walk pages | lead | see BUGS.md |
| F-036 | concurrent first installs from two daemons: one Commit fails "object … is not stored" | lead | see BUGS.md |
| F-042 | exec over committed content is slow: vitest 3.7×, `tsc -b` 1.5× native; base reads grow with directory size | the #352 lead and fixer**; the lead places it | see BUGS.md |
| F-044 | a kernel reply computed before a merged install can land after its invalidation | #359** | D-9 lane |
| F-045 | hard-linked files are never entry-cached on the pinned image's kernel | lead | see BUGS.md |
| F-046 | a terminal unmount in two mount tests fails intermittently | lead | see BUGS.md |
| F-047 | `fp21_detach_stages` fails 0/2 after the A1 merge | unassigned** | A1 owner #354 or the lead |
| F-048 | an Unmount without `discard` is refused after an mtime-only Commit | lead | see BUGS.md |
| F-049 | `fp31` TooSmall's staged premise races an early kernel FORGET | unassigned | see BUGS.md |
| F-050 | a full-case `cost.mjs` run warms the daemon cache for its LayerFS arm | unassigned** | the cost harness owner, or #362 |
| F-051 | `kernel_coherence` `size_never_shrinks_under_concurrent_append_and_refusals_stay_refused` failed once | unassigned | see BUGS.md |
| F-052 | a chmod is lost when the other side edits the same file | lead | see BUGS.md |
| F-053 | the SDK discovery lock outlives its Guard across a fork→exec window | lead | see BUGS.md |
| F-054 | a Sandbox's PID 1 never reaps orphaned processes | lead | see BUGS.md |
| F-055 | direct_locking_real's oracle assumes an order the test does not make | lead | see BUGS.md |
| F-056 | a build that rewrites identical outputs is redone after every remount | lead | see BUGS.md |
| F-057 | newest-wins over pnpm's install state lets the repair keep stale hoisting | lead | see BUGS.md |
| F-058 | the native repair chain ran the lanes on top of each other | lead | see BUGS.md |
| F-059 | lanes' stale build output outlives the repair, and the point oracle's base cannot carry it | lead | see BUGS.md |
| F-060 | the native repair chain never applied the consolidation's reconcile | lead | see BUGS.md |

### Lead's note (written by the lead; never empty unless the verdict is pass)

- **a1 (`p3-main-x`, daemon `32eda22d`): OPTIMIZE, terminal under the fast-mode ruling (rows recorded).** Checkpoint ok, git ✓. Node: 3 lane points P1–P5 pass, repair P6 pass. Control `control-053.a1` passes. Report check F1–F8 PASS. Native first passed with no fix.
- **Optimize row, Counters: `oneshot_mount_unmount.statements` depth exponent 3.77.** This is the counter the liaison accepted for r49 only, and it is judged again from r51.
  - Values: r51 57 statements, r52 65, r53 64, at depths 61,383, 62,546 and 63,409 (+3.3%).
  - So it is one step of +8 statements between r51 and r52, then flat. It is not growth with depth. Over a depth span this short, a single step gives a large exponent.
  - The same probe's `vm_steps` went 2,064 → 2,254 → 2,258, `fullscan_steps` stayed at 82 and `returned_rows` went 208 → 223 → 222.
  - Recorded, not a stop.
- **Optimize row, Snapshot time: size exponent 1.11.**
  - Values: 4,903, 4,885 and 5,905 ms for 1,282, 1,313 and 1,323 MiB new.
  - The size grew 3%; the time moved with the copy. Host load at the finish was 7.8–12.2.
  - Recorded.
- **F-063 active:** chunk PREFIX 448 vs FULL 222 over 107 lane git Commits (103 with a PREFIX chunk).
- **Storage watch:**

  | | r53 | r52 |
  | --- | --- | --- |
  | Store | +23.0 MiB | +41.9 MiB |
  | `.git` stored | +7.9 MiB | +10.8 MiB |
  | Index rows | +10.9 MiB (457.7 → 468.6 MiB) | |

- **Watch rows:**
  - Speed: `sandbox.commit` 0 files, UpToDate, uncontended. Its p90 is 11.9 ms, 1.99× baseline, about 5.9 ms over: just above the 5 ms floor. Its p50 is 3.83 ms (1.12×), and its counters (6 / 71 / 0) equal r52's.
  - Thin classes, not judged: four, all under 5 calls per range.
  - Scaling: `stat` needs a full delta-cap period.
  - Contended work: not judged yet.
- **Steps:**
  - Lead 4 s. Cuts 37, 50 and 57: 34, 15 and 11 s. Lanes 86 s.
  - Repair 138 s (install 43.0, build 31.1, tests 4.1). Under the 170 s line.
  - Verify 20 s. Finish 60 s of 90 s.
  - Host load 7.8–12.2.
- **Pre-scan:**
  - 11 test or script writer lines, among them `scripts/build-exe-for-python-sdk.ts` and new `test:web:built` and `check:ci:linux-primary` scripts. None is run by the replay's calibrated tests.
  - 2 new top-level packages.
  - No finding.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 1898/1898; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | sandbox.commit 0 files · UpToDate · uncontended: 1.99× baseline (observe.after); not judged: fs.apply ≤1 KiB · uncontended: 4/19/11 calls (1.88×), fs.write >512 KiB · uncontended: 2/7/12 calls (1.87×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.49×), branch.diff_commits 17–64 entries · uncontended: 3/1/4 calls (1.43×) (baseline class under 5 calls per range) | ≤ 1.2× | watch |
| Scaling | not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one | < 0.15 | watch |
| Counters | oneshot_mount_unmount.statements: depth exponent 3.772 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (9 classes too narrow); SQL per call (sql.call) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.566 | < 0.5 | watch |
| Reinstall growth | absolute: 932574 new stored bytes for 874 raw changed bytes of 32 changed packages (1067.018×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0287 (budget 0.1751) | < 0.1 | pass |
| Range growth | 25.5 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 5905 ms for 1322.9 MiB new; size exponent 1.112 | < 0.15 | optimize |
| Disk projection | 0.45 | < 0.8 | pass |
| Wall projection | 0.97 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 121 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 80 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.15× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 160 | 161 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 863 | 743 |
| Workspaces (one-shot share) | 204 (0.99) | 78 (0.974) |
| Reads | 256 | 256 |
| Reconcile writes | 86 | 86 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `32eda22d657d` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 11 | 30.32 | 534.51 | 534.51 | 648.10 | 1.20× | 1.22× | 12.26 | 11.99 | 499 / 57,468 / 0 | — | 0.1253 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 20.73 | 20.73 | 20.73 | 22.19 | 1.43× | 1.43× | 6.76 | 6.98 | 268 / 19,158 / 0 | — | 0.3456 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 397 | 19.69 | 41.74 | 77.79 | 410.39 | 0.94× | 1.02× | -1.18 | -1.29 | 298 / 33,978 / 0 | — | 0.11 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.61 | 3.17 | 3.17 | 44.64 | 3.13× | 1.85× | 6.11 | 5.59 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.99 | 0.99 | 0.99 | 1.30 | 1.08× | 1.08× | 4.05 | 3.57 | 70 / 1,298 / 0 | — | 0.0496 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 247.84 | 247.84 | 247.84 | 438.85 | 0.50× | 0.50× | -15.47 | -16.13 | 4,269 / 324,874 / 0 | — | 2.6939 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 8.22 | 8.22 | 8.22 | 8.22 | 1.35× | 1.35× | 21.14 | 22.96 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 39.48 | 39.48 | 39.48 | 39.48 | 1.49× | 1.49× | 8.27 | 8.77 | 185 / 11,992 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 3 | 12.99 | 12.99 | 12.99 | 21.66 | 1.88× | 1.23× | — | — | 194 / 7,702 / 0 | — | 0.0261 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 6.83 | 6.83 | 6.83 | 6.83 | 0.57× | 0.57× | — | — | 121 / 6,331 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 3 | 8.40 | 8.40 | 8.40 | 8.60 | 1.18× | 0.87× | -10.10 | -12.05 | 126 / 4,856 / 0 | — | 0.0006 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 3 | 20.90 | 20.90 | 20.90 | 82.91 | 1.47× | 0.55× | — | — | 221 / 17,112 / 0 | — | 0.0202 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 1 | 11.92 | 11.92 | 11.92 | 11.92 | 1.76× | 1.09× | 3.44 | 3.71 | 135 / 5,132 / 0 | — | 0.002 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 6 | 7.64 | 8.44 | 8.44 | 13.99 | 0.86× | 0.72× | -19.53 | -22.12 | 207 / 10,727 / 0 | — | 0.023 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 7 | 8.35 | 10.90 | 10.90 | 14.53 | 1.13× | 0.95× | -2.17 | -3.55 | 192 / 9,630 / 0 | — | 0.0055 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 9.36 | 15.88 | 15.88 | 19.98 | 1.00× | 1.25× | -6.32 | -8.14 | 200 / 13,305 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 11 | 7.83 | 11.94 | 11.94 | 45.15 | 0.86× | 0.98× | -4.61 | -5.43 | 161 / 10,826 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 14.20 | 14.20 | 14.20 | 17.13 | 1.96× | 1.32× | 26.75 | 28.61 | 184 / 10,854 / 0 | — | 0.0031 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 8 | 9.59 | 11.50 | 11.50 | 12.88 | 1.24× | 1.11× | 12.82 | 13.51 | 218 / 14,409 / 0 | — | 0.0031 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 2.53 | 2.53 | 2.53 | 2.53 | 1.96× | 1.96× | — | — | 46 / 3,537 / 0 | — | 2.527 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 11.83 | 11.83 | 11.83 | 16.49 | 2.76× | 1.81× | — | — | 127 / 13,720 / 0 | — | 0.2749 ms per file | — |
| fs.glob | 17–64 files · uncontended | 6 | 4.17 | 6.13 | 6.13 | 8.11 | 0.73× | 0.79× | 5.01 | 7.86 | 55 / 6,461 / 0 | — | 0.1329 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.45 | 2.45 | 2.45 | 8.42 | 0.75× | 0.60× | — | — | 44 / 2,879 / 0 | — | 0.817 ms per file | — |
| fs.glob | 2–4 files · uncontended | 8 | 2.55 | 4.47 | 4.47 | 9.58 | 0.90× | 1.27× | -9.37 | -10.12 | 53 / 4,713 / 0 | — | 1.1167 ms per file | — |
| fs.glob | 5–16 files · contended | 4 | 4.27 | 5.86 | 5.86 | 7.58 | 1.20× | 1.40× | 12.45 | 14.99 | 73 / 5,494 / 0 | — | 0.5855 ms per file | — |
| fs.glob | 5–16 files · uncontended | 4 | 2.23 | 4.14 | 4.14 | 6.77 | 0.72× | 0.84× | -7.44 | -6.82 | 40 / 3,273 / 0 | — | 0.4456 ms per file | — |
| fs.glob | >64 files · contended | 8 | 6.33 | 13.71 | 13.71 | 14.79 | 1.20× | 1.81× | — | — | 64 / 6,927 / 0 | — | 0.0234 ms per file | — |
| fs.glob | >64 files · uncontended | 9 | 7.32 | 10.33 | 10.33 | 28.73 | 1.35× | 0.56× | 12.90 | 12.96 | 106 / 13,056 / 0 | — | 0.0366 ms per file | — |
| fs.grep | 17–64 files · contended | 1 | 32.16 | 32.16 | 32.16 | 32.16 | 3.68× | 3.22× | — | — | 491 / 25,865 / 0 | — | 0.5272 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 10 | 9.31 | 14.76 | 14.76 | 19.26 | 0.83× | 1.13× | 7.33 | 8.66 | 233 / 9,559 / 0 | — | 0.2842 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 6.00 | 6.00 | 6.00 | 6.00 | 1.67× | 1.21× | — | — | 83 / 3,673 / 0 | — | 1.9987 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 7 | 3.21 | 5.91 | 5.91 | 10.70 | 0.85× | 1.20× | 6.83 | 7.18 | 80 / 5,363 / 0 | — | 1.582 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 4 | 5.98 | 7.07 | 7.07 | 9.33 | 1.06× | 1.25× | 3.11 | 6.38 | 152 / 8,003 / 0 | — | 0.6431 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 4 | 4.02 | 4.47 | 4.47 | 6.08 | 0.73× | 0.54× | -12.13 | -12.65 | 84 / 4,526 / 0 | — | 0.4967 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 11 | 42.67 | 53.17 | 53.17 | 67.50 | 1.75× | 2.18× | — | — | 948 / 40,173 / 0 | — | 0.1616 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 27.48 | 39.40 | 39.40 | 41.97 | 1.14× | 0.95× | 10.77 | 12.03 | 450 / 28,968 / 0 | — | 0.159 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 2.17 | 2.17 | 2.17 | 2.17 | no baseline | no baseline | — | — | 46 / 2,921 / 0 | — | 2.175 ms per entrie | — |
| fs.list | 17–64 entries · contended | 5 | 6.58 | 6.96 | 6.96 | 10.88 | 1.38× | 1.20× | 20.48 | 23.48 | 102 / 8,793 / 0 | — | 0.1392 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 18 | 4.37 | 7.98 | 7.98 | 18.81 | 1.27× | 1.04× | 7.76 | 8.93 | 81 / 7,640 / 0 | — | 0.1453 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 2.08 | 2.08 | 2.08 | 2.08 | 0.64× | 0.63× | — | — | 34 / 3,249 / 0 | — | 0.695 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 7 | 2.74 | 3.02 | 3.02 | 5.14 | 1.11× | 0.93× | 10.48 | 11.62 | 52 / 4,682 / 0 | — | 0.9127 ms per entrie | — |
| fs.list | 5–16 entries · contended | 3 | 7.21 | 7.21 | 7.21 | 7.61 | 2.13× | 1.30× | 21.24 | 21.43 | 83 / 6,633 / 0 | — | 0.6344 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 6 | 2.89 | 3.40 | 3.40 | 5.79 | 0.89× | 0.62× | 0.48 | 0.97 | 50 / 4,926 / 0 | — | 0.333 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 2 | 2.69 | 2.69 | 2.69 | 4.56 | 0.67× | 0.62× | — | — | 56 / 4,084 / 0 | — | 0.003 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 7 | 2.78 | 3.87 | 3.87 | 5.97 | 1.10× | 1.31× | -1.21 | -1.34 | 59 / 3,229 / 0 | — | 0.0034 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 2.30 | 2.30 | 2.30 | 2.30 | 0.70× | 0.64× | — | — | 43 / 3,016 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 6 | 2.53 | 3.16 | 3.16 | 3.82 | 0.88× | 1.01× | -1.25 | -1.00 | 54 / 3,141 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 9 | 3.32 | 5.45 | 5.45 | 10.97 | 1.00× | 1.04× | 6.32 | 7.38 | 57 / 3,675 / 0 | — | 0.0013 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 19 | 2.67 | 3.81 | 3.81 | 5.55 | 1.01× | 0.61× | 1.23 | 1.22 | 61 / 4,309 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 18 | 15.24 | 25.82 | 25.82 | 28.20 | 1.49× | 1.38× | -6.63 | -7.76 | 327 / 17,891 / 0 | — | 15.24 ms per file | commit |
| fs.rm | 1 files · uncontended | 4 | 10.16 | 10.52 | 10.52 | 12.40 | 1.12× | 0.75× | 4.42 | 5.00 | 147 / 7,465 / 0 | — | 10.157 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 5 | 4.85 | 5.32 | 5.32 | 5.92 | 1.70× | 1.86× | 10.35 | 10.66 | 60 / 5,142 / 0 | — | 0.0113 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 9 | 2.97 | 4.60 | 4.60 | 7.52 | 1.05× | 1.39× | 1.92 | 1.70 | 56 / 4,104 / 0 | — | 0.0054 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.01 | 2.01 | 2.01 | 2.21 | 0.82× | 0.82× | -7.36 | -8.16 | 36 / 2,665 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 3 | 2.43 | 2.43 | 2.43 | 3.37 | 1.00× | 0.78× | 8.33 | 10.70 | 46 / 3,196 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 2.69 | 3.87 | 3.87 | 4.76 | 0.95× | 1.08× | 6.24 | 6.67 | 47 / 3,561 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 4 | 4.13 | 4.75 | 4.75 | 5.13 | 1.51× | 1.55× | 22.45 | 23.02 | 51 / 4,228 / 0 | — | 0.001 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 6 | 2.33 | 2.96 | 2.96 | 4.25 | 0.98× | 0.95× | 1.02 | 1.08 | 40 / 2,904 / 0 | — | 0.0008 ms per byte | — |
| fs.write | >512 KiB · contended | 3 | 18.85 | 18.85 | 18.85 | 21.05 | 1.09× | 1.09× | 3.66 | 3.12 | 270 / 13,795 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 4 | 22.24 | 22.36 | 22.36 | 26.50 | 1.87× | 1.52× | 20.55 | 20.82 | 185 / 6,213 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 41 | 25.54 | 159.88 | 192.21 | 221.56 | 1.75× | 2.35× | 4.98 | 3.14 | 431 / 32,572 / 0 | — | 0.0491 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 76 | 8.89 | 22.94 | 36.56 | 130.75 | 1.16× | 1.47× | 1.66 | 1.67 | 162 / 7,121 / 0 | — | 0.0202 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 7 | 18.73 | 53.23 | 53.23 | 66.97 | 1.12× | 1.07× | 12.64 | 14.07 | 306 / 14,754 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 22 | 12.77 | 21.66 | 22.57 | 33.37 | 1.13× | 1.19× | 3.76 | 3.95 | 182 / 8,204 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 66 | 21.09 | 91.64 | 112.33 | 164.43 | 1.47× | 3.16× | 11.96 | 12.46 | 323 / 18,963 / 0 | — | 0.0012 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 174 | 10.08 | 25.14 | 57.02 | 68.69 | 1.20× | 1.58× | 8.43 | 8.92 | 156 / 6,512 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 98 | 17.65 | 64.98 | 83.04 | 146.04 | 1.55× | 1.85× | 6.18 | 6 | 316 / 17,766 / 0 | — | 0.0065 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 184 | 8.78 | 19.61 | 31.26 | 106.12 | 1.17× | 1.60× | 4.43 | 4.62 | 152 / 6,567 / 0 | — | 0.0031 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 2.65 | 2.65 | 2.65 | 2.65 | 3.87× | 3.87× | 28.42 | 29.07 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 36 | 32.67 | 63.74 | 65.35 | 69.97 | 1.13× | 1.41× | 9.41 | 11.05 | 348 / 28,960 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 72 | 27.58 | 67.02 | 93.70 | 202.41 | 1.10× | 1.35× | -1.00 | -1.12 | 327 / 26,709 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 8 | 4.33 | 6.14 | 6.14 | 13.00 | 1.09× | 0.96× | 8.93 | 9.31 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 35 | 3.83 | 11.86 | 12.35 | 15.44 | 1.12× | 1.99× | 1.76 | 1.86 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 3 | 20.68 | 20.68 | 20.68 | 27.80 | 1.94× | 1.12× | 29.85 | 33.40 | 139 / 5,589 / 0 | — | 20.676 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 10 | 9.77 | 11.27 | 11.27 | 14.17 | 1.14× | 0.97× | -2.27 | -3.08 | 113 / 4,992 / 0 | — | 9.77 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 526.92 | 526.92 | 526.92 | 526.92 | 2.04× | 2.04× | 40.37 | 48.12 | 17,740 / 671,622 / 82 | — | 526.924 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 9 | 14.23 | 43.64 | 43.64 | 83.07 | 1.23× | 3.00× | -1.22 | -3.06 | 165 / 9,644 / 0 | — | 5.1545 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 8 | 10.52 | 12.40 | 12.40 | 17.48 | 1.01× | 0.67× | -6.26 | -6.77 | 126 / 5,023 / 0 | — | 4.895 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 17.48 | 17.48 | 17.48 | 17.48 | 1.03× | 0.91× | -58.96 | -68.78 | 234 / 12,249 / 0 | — | 3.496 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 14.88 | 14.88 | 14.88 | 14.88 | 0.97× | 0.91× | -5.66 | -5.03 | 309 / 10,744 / 0 | — | 2.9752 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 112.49 | 1219.65 | 1219.65 | 15365.99 | 1.19× | 1.01× | 4.28 | 4.61 | 1,067 / 79,559 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 4.02 | 4.02 | 4.02 | 4.02 | no baseline | no baseline | — | — | 7 / 92 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 176 | 552.01 | 976.00 | 5193.15 | 5540.03 | 0.96× | 0.99× | -3.99 | -4.17 | — | 4608.30 | — | — |
| sandbox.exec | 0 files · uncontended | 165 | 35.10 | 713.01 | 917.45 | 9067.67 | 1.00× | 1.05× | -2.13 | -2.76 | — | 4631.70 | — | — |
| sandbox.exec | 1 files · contended | 20 | 38.37 | 59.54 | 59.54 | 60.12 | 1.01× | 1.12× | -0.16 | -0.43 | — | 4 | 38.37 ms per file | — |
| sandbox.exec | 1 files · uncontended | 31 | 35.63 | 60.56 | 64.54 | 69.28 | 0.98× | 0.97× | -1.97 | -2.95 | — | 4.70 | 35.626 ms per file | — |
| sandbox.exec | 17–64 files · contended | 2 | 75.20 | 75.20 | 75.20 | 76.77 | 1.13× | 1.09× | 1.57 | 1.27 | — | 97 | 3.8386 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 2 | 74.01 | 74.01 | 74.01 | 76.74 | 1.11× | 0.98× | 4.49 | 4.83 | — | 95 | 3.7003 ms per file | — |
| sandbox.exec | 2–4 files · contended | 35 | 44.62 | 88.99 | 98.70 | 150.92 | 1.25× | 1.47× | -0.23 | -0.60 | — | 11.70 | 17.0027 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 48 | 39.32 | 60.17 | 73.51 | 80.00 | 1.06× | 0.90× | -1.59 | -2.15 | — | 10.80 | 15.043 ms per file | — |
| sandbox.exec | 5–16 files · contended | 14 | 49.86 | 94.09 | 94.09 | 94.46 | 1.16× | 1.32× | -13.74 | -15.65 | — | 17.80 | 7.5846 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 10 | 62.84 | 72.57 | 72.57 | 128.97 | 1.48× | 1.07× | 0.92 | 1.00 | — | 42 | 7.9115 ms per file | — |
| sandbox.exec | — · contended | 10 | 10726.71 | 34495.10 | 34495.10 | 36696.66 | 3.26× | 1.17× | 14.11 | 16.06 | — | 65741.90 | — | — |
| sandbox.exec | — · uncontended | 31 | 490.81 | 31066.76 | 33236.83 | 43000.27 | 1.55× | 1.68× | 13.17 | 14.66 | — | 46231.70 | — | — |
| sandbox.mount | — · contended | 60 | 12.28 | 24.74 | 27.51 | 29.85 | 1.20× | 1.48× | 6.50 | 7.00 | 60 / 1,644 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 134 | 10.60 | 21.20 | 33.54 | 84.86 | 1.06× | 1.19× | 3.63 | 3.90 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 7.25 | 11.86 | 11.86 | 44.19 | 1.44× | 1.63× | 11.26 | 10.02 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 49 | 15.89 | 27.72 | 34.20 | 39.50 | 1.24× | 1.28× | 9.50 | 10.08 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 145 | 13.30 | 30.70 | 119.27 | 186.92 | 0.99× | 1.24× | 3.21 | 3.32 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 11 | 0.0 KiB | 591.4 KiB | 2,604 | ok 11 |
| branch.diff_commits | branch | 404 | 0.0 KiB | 22.2 MiB | 75,152 | ok 404 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.2 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 24 | 1.0 MiB | 0.0 KiB | 35 | Committed 24 |
| fs.diff_files | fs | 45 | 0.0 KiB | 442.9 KiB | 35 | Text 34, Equal 1, NoSuchPath 10 |
| fs.glob | fs | 55 | 0.0 KiB | 56.4 KiB | 707 | ok 55 |
| fs.grep | fs | 55 | 0.0 KiB | 229.7 KiB | 769 | ok 55 |
| fs.list | fs | 53 | 0.0 KiB | 313.0 KiB | 2,065 | ok 53 |
| fs.read | fs | 49 | 0.0 KiB | 214.4 KiB | 49 | ok 49 |
| fs.rm | fs | 22 | 0.0 KiB | 0.0 KiB | 22 | Committed 22 |
| fs.stat | fs | 48 | 0.0 KiB | 10.8 KiB | 48 | ok 48 |
| fs.write | fs | 675 | 12.4 MiB | 0.0 KiB | 675 | Committed 675 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 201 | 0.0 KiB | 0.0 KiB | 0 | Committed 156, UpToDate 44, Conflict 1 |
| sandbox.exec | sandbox | 554 | 2.3 MiB | 5.9 MiB | 0 | exit:0 550, exit:254 1, exit:2 3 |
| sandbox.mount | sandbox | 204 | 0.0 KiB | 0.0 KiB | 0 | Mounted 204 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 204 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 204 |

### C. Scale probes

Binary: daemon `32eda22d657d`.

Load average (1-min, runner (Docker VM kernel)): start 4.79 · end 2.6.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.469 | 18.921 · 4.658 · 1.469 · 1.226 · 1.431 | 3.52–3.52 | statements 30, vm_steps 1038, fullscan_steps 0, sorts 0, returned_rows 86 |
| read | 1.094 | 1.917 · 1.297 · 1.094 · 1.006 · 1.041 | 3.52–3.52 | statements 17, vm_steps 756, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_small | 3.579 | 1.11 · 1.286 · 16.407 · 4.593 · 3.579 | 3.52–3.52 | statements 17, vm_steps 765, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_largest | 10.987 | 16.472 · 22.092 · 10.987 · 10.283 · 10.567 | 3.52–3.52 | statements 202, vm_steps 26704, fullscan_steps 0, sorts 0, returned_rows 2587 |
| grep_scoped | 1.271 | 2.112 · 1.331 · 1.271 · 1.038 · 1.034 | 3.52–3.52 | statements 22, vm_steps 911, fullscan_steps 0, sorts 0, returned_rows 82 |
| glob_scoped | 1.181 | 0.962 · 1.071 · 1.555 · 1.221 · 1.181 | 3.52–3.52 | statements 16, vm_steps 744, fullscan_steps 0, sorts 0, returned_rows 72 |
| grep_tree | 5765.194 | 5774.314 · 5730.699 · 5781.246 · 5765.194 · 5570.928 | 2.99–3.37 | statements 64618, vm_steps 4754795, fullscan_steps 0, sorts 0, returned_rows 470671 |
| glob_tree | 10.461 | 11.171 · 10.461 · 10.493 · 9.788 · 10.151 | 3.15–3.15 | statements 145, vm_steps 21581, fullscan_steps 0, sorts 0, returned_rows 2186 |
| diff_files | 4.665 | 4.579 · 5.337 · 4.655 · 4.946 · 4.665 | 3.15–3.15 | statements 84, vm_steps 4420, fullscan_steps 0, sorts 0, returned_rows 438 |
| list_commits | 1.039 | 1.306 · 0.804 · 0.849 · 1.152 · 1.039 | 3.15–3.15 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.666 | 3.095 · 3.234 · 2.564 · 2.666 · 2.279 | 3.15–3.15 | statements 62, vm_steps 2365, fullscan_steps 0, sorts 0, returned_rows 272 |
| fork | 1.249 | 1.537 · 1.703 · 1.249 · 0.973 · 0.506 | 3.15–3.15 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 29.137 | 32.59 · 30.493 · 27.712 · 28.093 · 29.137 | 3.15–3.15 | statements 510, vm_steps 24281, fullscan_steps 0, sorts 0, returned_rows 1854 |
| oneshot_mount_unmount | 15.197 | 18.71 · 14.89 · 15.197 · 15.355 · 14.751 | 3.15–3.15 | statements 64, vm_steps 2258, fullscan_steps 82, sorts 2, returned_rows 222 |
| oneshot_commit | 58.299 | 79.897 · 69.781 · 58.299 · 43.464 · 52.957 | 3.15–3.15 | statements 185, vm_steps 12442, fullscan_steps 82, sorts 2, returned_rows 958 |
| oneshot_exec | — |  ·  ·  ·  ·  | 3.15–3.15 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r053: 397,021 pages of 4,096 B, 0 free · Commits 64,287 · Branches 1,340 · Layers 64 · compression 3.68× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 207,653 | 1.26 GiB |
| 2 | 72,211 | 1.10 GiB |
| 3 | 17,624 | 6.8 MiB |
| 4 | 52 | 10.3 KiB |
| 5 | 17,505 | 1.8 MiB |
| 6 | 176,126 | 848.0 MiB |
| 7 | 492,622 | 120.6 MiB |
| 8 | 1,482 | 430.4 KiB |
| 9 | 137,315 | 301.3 MiB |
| 10 | 69,020 | 8.5 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,480 | 203.9 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 66,161 | 139.4 MiB |
| 1 | 70,756 | 868.2 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 269,701 | 1.03 GiB | 37.8 MiB |
| inode_value | 76,347 | 298.2 MiB | 5.8 MiB |
| binding_hint | 23,145 | 90.4 MiB | 8.5 MiB |
| object_location | 16,374 | 64.0 MiB | 6.7 MiB |
| commit | 5,323 | 20.8 MiB | 3.2 MiB |
| file_digest | 1,622 | 6.3 MiB | 716.0 KiB |
| commit_lineage | 1,390 | 5.4 MiB | 660.6 KiB |
| commit_runs | 1,348 | 5.3 MiB | 690.7 KiB |
| commit_identity | 977 | 3.8 MiB | 380.9 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 59 | 236.0 KiB | 39.9 KiB |
| branch_names | 21 | 84.0 KiB | 12.5 KiB |
| branch_identity | 16 | 64.0 KiB | 11.5 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| run_merges | 7 | 28.0 KiB | 4.8 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 4.7 KiB |
| layers_source | 3 | 12.0 KiB | 6.4 KiB |
| layers_child | 3 | 12.0 KiB | 6.4 KiB |
| absorbed_heights | 3 | 12.0 KiB | 4.5 KiB |

### E. Stage times

**Time 356.7 s** (tooling): play 134.4 · consolidate 134.6 · verify 28.6 · probes 29.7 · tests 0.0 · seal + snapshot 13.5 · report 15.9

356.73 s tooling: prepare 1.84 · play 132.58 · consolidate 134.59 · verify 16.35 (diff_commits + full compareTree) · version walk 12.25 · probes 29.66 · metrics 0.75 · seal 1.29 · sealed figures 6.29 · snapshot copy 5.96 · report 0.51

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 32eda22d657d10ba2b419652882f2be41fd2b99cbf38e3eeb32d39a19dc16d88 | 2026-10-20T09:10:35.792Z | optimize | Speed: sandbox.commit 0 files · UpToDate · uncontended: 1.99× baseline (observe.after); not judged: fs.apply ≤1 KiB · uncontended: 4/19/11 calls (1.88×), fs.write >512 KiB · uncontended: 2/7/12 calls (1.87×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.49×), branch.diff_commits 17–64 entries · uncontended: 3/1/4 calls (1.43×) (baseline class under 5 calls per range); Scaling: not judged: stat (chain-bounded): 3 of 9 points: a bound needs a full metadata delta-cap period (8) plus one; Counters: oneshot_mount_unmount.statements: depth exponent 3.772; Contended work: not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (9 classes too narrow); SQL per call (sql.call); Directory share: 0.566; Range growth: 25.5 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 5905 ms for 1322.9 MiB new; size exponent 1.112 |

### G. Evidence

- `~/lfs-history/metrics/range-053.a1.json`
- trace `~/lfs-history/runs/p3-main-x/trace/range-053.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-x/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-053.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r053-3-packages-client | 535 | 610.3 KiB |
| r053-1-agents-notes | 507 | 612.0 KiB |
| r053-2-root | 458 | 612.0 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 428.0 | 4,946 |
| `git diff --stat` | 39.0 | 4,938 |
| `git add -f` | 42.0 | — |
| `git rm --cached` | 14.0 | — |
| `git commit` | 47.0 | 4,943 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r053-1-agents-notes | end | P1 | pass | — | — |
| r053-1-agents-notes | end | P2 | pass | exit 0 | — |
| r053-1-agents-notes | end | P3 | pass | 291 bookkeeping path(s) | — |
| r053-1-agents-notes | end | P4 | pass | 229 emitted files, exit 2 | — |
| r053-1-agents-notes | end | P5 | pass | 71 files | — |
| r053-1-agents-notes | end | P6 | n/a | not a repair | — |
| r053-2-root | end | P1 | pass | — | — |
| r053-2-root | end | P2 | pass | exit 254 | — |
| r053-2-root | end | P3 | n/a | an install, not a refresh | — |
| r053-2-root | end | P4 | pass | 443 emitted files, exit 2 | — |
| r053-2-root | end | P5 | pass | 93 files | — |
| r053-2-root | end | P6 | n/a | not a repair | — |
| r053-3-packages-client | end | P1 | pass | — | — |
| r053-3-packages-client | end | P2 | pass | exit 0 | — |
| r053-3-packages-client | end | P3 | pass | 291 bookkeeping path(s) | — |
| r053-3-packages-client | end | P4 | pass | 308 emitted files, exit 2 | — |
| r053-3-packages-client | end | P5 | pass | 69 files | — |
| r053-3-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2287 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
