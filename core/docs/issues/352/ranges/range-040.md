# Range 040 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r039 (live Store)
dsh `e0e187a6a`..`e14c2aea3` · **72 commits** (7 mainline, 65 side) · 2026-07-26 → 2026-07-27
Areas changed: `.agents/notes` 23% · `packages/client` 23% · `examples/acp-agent` 11% · other 43%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 20 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 84.6 s · git 107.2 s · Node 221.4 s · verify 13.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **769.4 MiB** (+3.4 MiB) | **1.09 GiB** (+28.0 MiB) | **1.45×** (prev 1.42×) | **34.1 MiB** | **1,361** (total 48,092) | **254.2 s** tooling (total 125.0 min) |

**Checks:** 14 pass · 4 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.83× it; Scaling branch.diff_commits checkpoint statements in total (entries exponent 0.143): tree files exponent 0.161; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (22 classes too narrow); Directory share 0.503 · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ sandbox.commit p95 +44% · ▼ probe diff_files −37% · ▼ probe list_small −36%
**Budget:** 41 of 202 ranges · projected total 15.5 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,245 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 1 publish |
| Steps | 2,443 / 2,443 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2810 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 398 bin shims, 4285 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (50 lines from 3 .gitignore files) · **232 picks** in 4 merges (232 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `e14c2aea3`** · 101 commits written for 101 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 232 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r040-1-agents-notes | end | `9403c00573df` | `805cf082fc23` | pass (397 normalized) | pass | pass | n/a | n/a | n/a |
| r040-4-examples-acp-agent | end | `5b3fdb97d556` | `805cf082fc23` | pass (397 normalized) | pass | pass | pass | pass | n/a |
| r040-3-root | end | `1e471a37b4ac` | `4c5be6064df1` | pass (397 normalized) | pass | n/a | pass | pass | n/a |
| r040-2-packages-client | end | `4e8144862d7e` | `805cf082fc23` | pass (397 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `56c287e046a6` | `null` | n/a | pass | n/a | n/a | pass | pass (125,815 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/client/ui-primitives/tests/atoms.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/code-block.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/hover-card.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/icons.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/markdown.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/state-dot.spec.tsx` (fails natively) · `packages/client/ui-primitives/tests/tooltip.spec.tsx` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/host/apiproxy/tests/rpc-schemas.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-view.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/client/runtime/tests/wire-events.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/views.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively).

## 2. Activity

**3,179 calls** · **156 steps** by **9 agents + lead** on **4 Branches + main** · **218 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +365 added · 753 modified · −178 deleted · 11.7 MiB written · fs 1,177 : Sandbox 119 (**10 : 1**, reported only in P3)
**Execs:** 627 (JS 48 · shell 579) · 2 non-zero exits · install 0 · test runs 6 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,469 | 1,191 | 278 | Committed 1,191 · Text 28 · NoSuchPath 10 |
| sandbox | 1,283 | 842 | 5 | commit 215 (Committed 183, UpToDate 31, Conflict 1) · exec 627 (exit:0 625, exit:2 2) · mount 218 (Mounted 218) · status 5 · unmount 218 (Unmounted 218) |
| branch | 416 | 34 | 382 | diff_branches 14 · diff_commits 368 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,179** | **2,067** | **676** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r040-1-agents-notes | a01 a02 | 35 | 546 | ✓ | — |
| r040-2-packages-client | a03 a04 | 33 | 304 | ✓ | — |
| r040-3-root | a05 a06 a07 | 40 | 205 | ✓ | — |
| r040-4-examples-acp-agent | a08 a09 | 41 | 201 | ✓ | — |
| main | lead | 7 | 105 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r040-4, a08 after a09 | 0.1 s |
| Stale clean merge | 1 / 1 | r040-4, a08 a09 | merged cleanly |
| Decoy edit | 1 / 1 | r040-4, a09 a08 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r040-1 | 13 | 7 | 6 | 0 | 0 | 69 | — |
| a02 | r040-1 | 22 | 11 | 11 | 0 | 0 | 477 | — |
| a03 | r040-2 | 11 | 4 | 7 | 0 | 0 | 229 | — |
| a04 | r040-2 | 22 | 9 | 13 | 0 | 0 | 75 | — |
| a05 | r040-3 | 15 | 4 | 11 | 0 | 0 | 81 | — |
| a06 | r040-3 | 6 | 4 | 2 | 0 | 0 | 50 | — |
| a07 | r040-3 | 19 | 10 | 9 | 0 | 0 | 74 | — |
| a08 | r040-4 | 20 | 8 | 12 | 0 | 0 | 75 | commit-conflict, stale-clean-merge, decoy |
| a09 | r040-4 | 21 | 7 | 14 | 0 | 0 | 126 | commit-conflict, stale-clean-merge, decoy |
| lead | main | 7 | 1 | 0 | 6 | 0 | 105 | — |
| **Total** |  | **156** | **65** | **85** | **6** | **0** | **1,361** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 122 · pnpm 1 · tsc 3 · vitest 6 · other 495

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r040-3-root | 32 | 32 | 32 | 2 | 32 | 363 |
| r040-1-agents-notes | 28 | 28 | 28 | 3 | 28 | 609 |
| r040-4-examples-acp-agent | 28 | 28 | 27 | 2 | 28 | 371 |
| r040-2-packages-client | 26 | 26 | 26 | 1 | 26 | 617 |
| **lead** | — | — | — | — | 101 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r040-1-agents-notes | 0 | 1 | 0 | 0 | 0 | — / — |
| r040-4-examples-acp-agent | 0 | 1 | 1 | 1 | 30 | 30 / 30 |
| r040-3-root | 1 | 0 | 1 | 1 | 33 | 33 / 33 |
| r040-2-packages-client | 0 | 1 | 1 | 1 | 73 | 73 / 73 |
| **lead repair** | 1 | — | 1 | — | — | 125,815 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r039) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 766.0 MiB (22.9 MiB / 637.7 MiB / 20.4 MiB / 85.0 MiB) | 769.4 MiB (23.2 MiB / 637.7 MiB / 21.3 MiB / 87.3 MiB) | +3.4 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 57,944 / 9,190 / 4,251 | 58,325 / 9,247 / 4,293 | +381 / +57 / +42 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.06 GiB | 1.09 GiB | +28.0 MiB |
| **Space amplification** (total · tracked) | 1.42× · tracked 4.89× | 1.45× · tracked 4.94× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **5.85** (0.98 / 0.24 / 0.79) | 0.92× the median range |
| **Stored per Commit** | 28.6 KiB | 20.7 KiB | — |
| Metadata share | 0.41 | 0.41 | this range 0.50 |
| History: Commits / Layers / Branches | 46,731 | 48,092 / 25 / 510 | +1,361 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 9.39 GiB (Commits 7.34 GiB · installs 880.4 MiB · build 103.3 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 41.56 GiB / 36% | — |
| Snapshot | — | r040, 970.5 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 655.1 MiB | 0.85 | +13.5 MiB |
| Metadata | 99.1 MiB | 0.13 | +3.7 MiB |
| Index rows | 306.1 MiB | 0.40 | — |
| Waste | 53.8 MiB | 0.07 | — |
| Other | 1.4 MiB | 0.00 | — |
| **Total = Store on disk** | **1.09 GiB** | **= 1.45** space amplification | +28.0 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 23.2 MiB | 114.6 MiB (63.2 MiB + 51.5 MiB) | 4.94× | — | 2.6 MiB | 5.8 MiB | 0.44 |
| `node_modules` | 637.7 MiB | 205.1 MiB (183.0 MiB + 22.2 MiB) | 0.32× | — | 950.4 KiB | 143.8 KiB | 6.61 |
| Build output | 21.3 MiB | 18.7 MiB (17.3 MiB + 1.4 MiB) | 0.88× | — | 675.8 KiB | 7.8 MiB | 0.08 |
| `.git` | 87.3 MiB | 386.4 MiB (370.5 MiB + 15.9 MiB) | 4.43× | — | 12.6 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 361.2 MiB | — (not divided) | — | 10.8 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 29.5 MiB | — | — | — | — | — |
| **Total** | — | **1.09 GiB** | **= 1.45×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 157,685 | +4,592 | 6.2 KiB | 0 (derived) | 49% |
| Chunks (large files) | 57,155 | +771 | 15.3 KiB | — | 3% |
| Large-file extents | 15,540 | — | 0.3 KiB | — | — |
| Directories | 316,934 | 5,268 (with inodes, pooled) | 0.3 KiB | — | 62% |
| Inodes and attributes | 302,942 | ↑ pooled | 2.8 KiB | — | — |
| Symlinks | 2,329 | +4,303 | 0.1 KiB | — | — |

Delta: 2.7% at depth cap · 19% of refused bases stopped by budget · `node_modules` reinstall: absolute: 853874 new stored bytes for 666 raw changed bytes of 28 changed packages (1282.093×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.94× (114.6 MiB for 23.2 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.4 KiB / 8.9 KiB / 10.7 KiB over 215 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.6 MiB stored for 2.49 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.36 (4 lanes × 769.4 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.5 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 10.7 ms / 31.1 ms (1.08×) | 3.1 ms / 6.2 ms (1.25×) | 3.5 ms / 6.5 ms (1.71×) | 21.1 ms / 86.2 ms (1.12×) | 10.4 ms / 18.2 ms (0.84×) | 299 ms / 354 ms (3.25×) | — (native comparison in P3; exec 36.9 ms / 886 ms) |
| SQL p50: 241 stmts | 69 stmts | 68 stmts | 229 stmts | 49 stmts | 8,607 stmts | — |

**Commit cost:** 5.91 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 673 ms p50 over 218
**Slowest:** sandbox.exec 33058 ms · sandbox.exec 27384 ms · sandbox.exec 27080 ms · checkpoint diff_commits 0.10 ms and 1.52 statements per entry (67,889 entries per page)
**Scaling:** 15 of 15 probes flat

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 362 ms / 362 ms | — / — | — | git / status-cold: — |
| git status (steady) | 361 ms / 481 ms | — / — | — | git / status-steady: — |
| git add | 32.0 ms / 106 ms | — / — | — | git / add: — |
| git commit (lane) | 41.0 ms / 71.0 ms | — / — | — | git / commit: — |
| lead writes main | 3244 ms / 3244 ms | — / — | — | — |
| repack | 1845 ms / 1845 ms | — / — | — | — |
| pnpm install (incremental) | 2886 ms / 2886 ms | 1876 ms / 1876 ms | 1.54× | pnpm-reinstall / cold: — |
| pnpm refresh | 2905 ms / 2905 ms | 1768 ms / 1768 ms | 1.64× | pnpm-reinstall / steady: — |
| tsc -b | 4654 ms / 4654 ms | 3340 ms / 5558 ms | 1.39× | tsc-b / cold: — |
| vitest | 5739 ms / 5739 ms | 3584 ms / 3584 ms | 1.60× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.6 ms / 26.2 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 24752 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2710992 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 5.57 at the first command → 5.39 after the last (max 7.32 over 6 commands) · Docker VM 1.75 → 1.88

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-040.a1)

## 5. Findings and action

### Finding 040.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | diff_files.statements (chain-bounded): max over the latest cap period 108 vs the first 96: 1.125× (bound, period 8) | < 0.05 |

Diagnosis pending: `finding-040.a1.json`.

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

- **a1 (`p3-main-v`, live after r39 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓ (full tree). Node: 20 pass, 0 stop, 0 NOT_RUN over 5 points. Repair P6 pass (1,941 emitted). Control `control-040.a1` passes. Report check F1–F8 PASS.
- **The only optimize row** is the same as r39's: Counters `diff_files.statements` (chain-bounded), 108 vs 96 statements (1.125×). Recorded, not acted on (fast mode).
- **Fix 058 exempted** `.sessions/session-query.db` (`checks.tree.gitIgnored`): the session-query test's SQLite file, written again by this range's tests.
- `r040-1-agents-notes.end` has no test candidates and no changed package (P4 and P5 n/a).
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 12.83×). Merge p50 299 ms (3.25×, inside r23–r39's band). One-shot Commit 1.12×, write 1.08×, mount 0.84×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 4.8–7.3.
- Final steps: lanes 20 s + 71 s (cut at plan order 29), repair 105 s (alarm 200 s), verify 17 s, finish 46 s. Repair install 33.1 s, build 21.7 s, tests 3.3 s.
- Watch items: index rows 306.1 MiB (sealed; #366). `fs.rm` uncontended p50 11.88 ms per file over 104 calls, 192 statements and 15,765 VM steps per call; contended 14.54 ms over 70 (#367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2443/2443; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.83× it | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint statements in total (entries exponent 0.143): tree files exponent 0.161 | < 0.15 | watch |
| Counters | diff_files.statements (chain-bounded): max over the latest cap period 108 vs the first 96: 1.125× (bound, period 8) | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (22 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.503 | < 0.5 | watch |
| Reinstall growth | absolute: 853874 new stored bytes for 666 raw changed bytes of 28 changed packages (1282.093×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.027 (budget 0.1935) | < 0.1 | pass |
| Range growth | 34.1 MiB, 1.01× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 3091 ms for 970.5 MiB new; size exponent -0.81 | < 0.15 | pass |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 0.92 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 101 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 20 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 232 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 156 | 157 |
| Lanes / agents | 4 / 9 | 4 / 9 |
| LayerFS Commits | 1361 | 1232 |
| Workspaces (one-shot share) | 218 (0.99) | 84 (0.976) |
| Reads | 231 | 231 |
| Reconcile writes | 95 | 95 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 14 | 34.17 | 313.13 | 313.13 | 386.28 | 2.10× | 6.05× | -0.27 | -0.05 | 440 / 42,663 / 0 | — | 0.1512 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 11.10 | 11.10 | 11.10 | 11.10 | no baseline | no baseline | — | — | 162 / 20,194 / 0 | — | 0.4442 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 296.31 | 296.31 | 296.31 | 296.31 | no baseline | no baseline | -0.52 | 0.16 | 7,648 / 279,513 / 0 | — | 1.4246 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 361 | 19.46 | 35.23 | 67.72 | 298.55 | 1.13× | 1.36× | -0.31 | -0.23 | 302 / 34,140 / 0 | — | 0.103 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.73 | 1.83 | 1.83 | 20.66 | 0.81× | 1.39× | -1.67 | -1.27 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.94 | 0.94 | 0.94 | 2.00 | no baseline | no baseline | -0.32 | -0.25 | 70 / 1,298 / 0 | — | 0.047 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 4 | 299.26 | 353.83 | 353.83 | 390.63 | 3.25× | 3.85× | -1.59 | -0.65 | 8,607 / 446,500 / 0 | — | 1.6534 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.46 | 4.46 | 4.46 | 4.46 | 0.88× | 0.88× | -4.26 | -3.35 | 50 / 1,128 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 24.03 | 24.03 | 24.03 | 24.03 | 0.99× | 0.99× | -0.40 | -0.22 | 179 / 10,532 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 12 | 12.72 | 30.96 | 30.96 | 34.15 | 1.07× | 2.29× | -2.60 | -1.30 | 298 / 34,956 / 0 | — | 0.0248 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 3 | 12.84 | 12.84 | 12.84 | 18.14 | 1.39× | 0.82× | -8.42 | -5.54 | 319 / 75,642 / 8,191 | — | 0.0013 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 4 | 9.88 | 24.93 | 24.93 | 27.08 | 1.43× | 2.57× | 1.81 | 1.11 | 180 / 9,133 / 0 | — | 0.0003 ms per byte | files.change |
| fs.apply | ≤8 KiB · contended | 17 | 15.12 | 21.29 | 21.29 | 86.85 | 1.51× | 1.24× | -0.72 | -0.32 | 358 / 77,230 / 8,191 | — | 0.0047 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 4 | 10.04 | 11.68 | 11.68 | 26.99 | 1.54× | 1.08× | -0.66 | -0.19 | 167 / 12,104 / 0 | — | 0.0058 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 9 | 8.51 | 13.77 | 13.77 | 14.22 | 1.18× | 1.60× | -0.18 | -0.15 | 223 / 11,575 / 0 | — | 0.0077 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 8 | 6.85 | 11.29 | 11.29 | 13.90 | 1.17× | 1.40× | -0.82 | -0.64 | 176 / 8,514 / 0 | — | 0.0241 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 9 | 14.62 | 14.62 | 17.24 | 1.66× | 2.43× | -0.36 | -0.20 | 255 / 11,918 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 5 | 9.33 | 9.68 | 9.68 | 12.76 | 1.50× | 1.05× | -1.48 | -0.74 | 210 / 10,052 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 3 | 8.99 | 8.99 | 8.99 | 18.44 | 1.49× | 1.39× | -0.02 | 0.27 | 188 / 11,551 / 0 | — | 0.0043 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 2 | 6.19 | 6.19 | 6.19 | 9.06 | 0.84× | 0.77× | -1.29 | -0.95 | 147 / 6,193 / 0 | — | 0.0038 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 2 | 2.58 | 2.58 | 2.58 | 3.40 | 1.50× | 1.50× | — | — | 27 / 1,812 / 0 | — | 2.581 ms per file | — |
| fs.glob | 17–64 files · contended | 2 | 3.18 | 3.18 | 3.18 | 5.97 | 1.14× | 1.14× | -0.66 | -0.71 | 72 / 4,863 / 0 | — | 0.1047 ms per file | — |
| fs.glob | 17–64 files · uncontended | 6 | 4.34 | 5.11 | 5.11 | 9.42 | 1.53× | 1.35× | -0.85 | -0.64 | 59 / 5,211 / 0 | — | 0.1296 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 4.87 | 4.87 | 4.87 | 4.87 | 2.68× | 2.68× | 1.86 | 1.23 | 46 / 3,847 / 0 | — | 2.4345 ms per file | — |
| fs.glob | 2–4 files · uncontended | 1 | 2.54 | 2.54 | 2.54 | 2.54 | 1.44× | 1.31× | 0.47 | 0.26 | 51 / 3,642 / 0 | — | 0.845 ms per file | — |
| fs.glob | 5–16 files · contended | 4 | 3.30 | 4.07 | 4.07 | 5.86 | 1.96× | 2.42× | -0.56 | -0.50 | 87 / 4,969 / 0 | — | 0.3548 ms per file | — |
| fs.glob | 5–16 files · uncontended | 6 | 3.11 | 4.17 | 4.17 | 5.22 | 1.54× | 1.83× | 0.73 | 0.52 | 52 / 4,711 / 0 | — | 0.3351 ms per file | — |
| fs.glob | >64 files · contended | 5 | 8.46 | 8.53 | 8.53 | 58.45 | 1.56× | 1.58× | -0.25 | -0.28 | 159 / 19,860 / 0 | — | 0.0144 ms per file | — |
| fs.glob | >64 files · uncontended | 6 | 5.17 | 6.87 | 6.87 | 9.05 | 0.53× | 0.49× | -1.21 | -1.24 | 75 / 11,715 / 0 | — | 0.028 ms per file | — |
| fs.grep | 1 files · contended | 3 | 2.32 | 2.32 | 2.32 | 3.92 | 1.55× | 1.55× | 4.33 | 2.22 | 106 / 5,327 / 0 | — | 2.32 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 1 | 2.27 | 2.27 | 2.27 | 2.27 | 0.95× | 0.95× | -0.09 | 0.05 | 56 / 3,552 / 0 | — | 2.267 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 4 | 8.00 | 18.65 | 18.65 | 28.27 | 1.34× | 3.12× | -2.14 | -1.54 | 169 / 8,899 / 0 | — | 0.3535 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 9 | 6.25 | 9.98 | 9.98 | 13.53 | 1.09× | 1.66× | 0.44 | -0.01 | 122 / 6,904 / 0 | — | 0.2402 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 3.44 | 3.44 | 3.44 | 3.44 | 0.88× | 0.86× | -0.16 | -0.14 | 123 / 7,763 / 0 | — | 1.72 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 4 | 6.22 | 6.25 | 6.25 | 8.63 | 2.10× | 1.24× | 0.88 | 0.56 | 128 / 5,851 / 0 | — | 0.719 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 5.10 | 7.30 | 7.30 | 12.09 | 1.36× | 1.22× | 0.43 | 0.44 | 90 / 5,346 / 0 | — | 0.599 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 4 | 24.72 | 32.79 | 32.79 | 45.32 | 1.57× | 2.09× | 1.28 | 0.95 | 687 / 25,753 / 0 | — | 0.098 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 9 | 20.64 | 30 | 30 | 33.11 | 1.13× | 1.30× | 0.97 | 0.60 | 544 / 18,659 / 0 | — | 0.1158 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 2 | 1.87 | 1.87 | 1.87 | 3.45 | 1.28× | 1.28× | -2.31 | -1.26 | 49 / 2,806 / 0 | — | 1.873 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 1.84 | 1.84 | 1.84 | 1.84 | 1.09× | 1.09× | -1.75 | -1.01 | 42 / 2,914 / 0 | — | 1.842 ms per entrie | — |
| fs.list | 17–64 entries · contended | 3 | 3.67 | 3.67 | 3.67 | 4.04 | 1.53× | 1.53× | -0.56 | -0.42 | 150 / 7,881 / 0 | — | 0.0808 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 13 | 3.67 | 6.52 | 6.52 | 9.76 | 1.46× | 2.22× | -0.75 | -0.68 | 68 / 5,379 / 0 | — | 0.148 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 2.54 | 2.54 | 2.54 | 3.03 | 1.09× | 1.09× | -1.14 | -0.98 | 45 / 4,005 / 0 | — | 0.634 ms per entrie | — |
| fs.list | 5–16 entries · contended | 12 | 3.67 | 6.97 | 6.97 | 7.98 | 1.58× | 2.45× | -0.20 | 0.08 | 90 / 6,033 / 0 | — | 0.4456 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 14 | 3.24 | 3.78 | 3.78 | 4.17 | 1.71× | 0.99× | 0.55 | 0.44 | 64 / 4,909 / 0 | — | 0.3438 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 4 | 2.89 | 3.67 | 3.67 | 4.69 | 1.30× | 1.65× | -0.64 | -0.40 | 59 / 4,150 / 0 | — | 0.0042 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 4 | 2.76 | 3.12 | 3.12 | 5.57 | 1.74× | 1.97× | 0.11 | 0.02 | 68 / 3,961 / 0 | — | 0.0039 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 2 | 3.36 | 3.36 | 3.36 | 4.67 | no baseline | no baseline | 0.42 | 0.30 | 70 / 4,080 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 1.84 | 1.84 | 1.84 | 1.84 | 0.66× | 0.66× | -2.30 | -1.51 | 39 / 2,925 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 12 | 3.12 | 4.80 | 4.80 | 7.12 | 1.48× | 0.81× | -0.96 | -0.57 | 72 / 4,859 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 16 | 2.57 | 6.23 | 6.23 | 7.43 | 1.25× | 1.74× | -0.30 | -0.19 | 60 / 3,394 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 70 | 14.54 | 25.39 | 29.72 | 30.23 | 1.38× | 1.79× | 1.10 | 0.70 | 354 / 22,810 / 0 | — | 14.54 ms per file | commit |
| fs.rm | 1 files · uncontended | 104 | 11.88 | 21.77 | 24.44 | 32.05 | 1.77× | 1.95× | -0.00 | 0.44 | 192 / 15,765 / 0 | — | 11.88 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 2 | 2.35 | 2.35 | 2.35 | 2.88 | 1.08× | 1.05× | 0.12 | -0.09 | 53 / 4,341 / 0 | — | 0.0026 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 5 | 3.59 | 4.15 | 4.15 | 7.40 | 2.34× | 2.70× | 0.69 | 0.73 | 54 / 3,785 / 0 | — | 0.0065 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 2 | 2.40 | 2.40 | 2.40 | 3.52 | 1.14× | 1.14× | 0.32 | 0.10 | 43 / 3,095 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 2 | 2.74 | 2.74 | 2.74 | 2.78 | 1.05× | 0.80× | 0.31 | 0.23 | 45 / 3,876 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 7 | 2.17 | 2.42 | 2.42 | 3.49 | 1.10× | 1.12× | 0.67 | 0.28 | 46 / 2,844 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 8 | 2.86 | 4.44 | 4.44 | 6.68 | 1.27× | 1.48× | 0.75 | 0.56 | 58 / 3,915 / 0 | — | 0.0006 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 7 | 2.60 | 3.06 | 3.06 | 3.86 | 1.56× | 0.88× | -0.04 | -0.01 | 46 / 3,622 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 107 | 12.75 | 47.29 | 73.98 | 139.94 | 1.50× | 3.17× | -0.70 | -0.23 | 297 / 31,614 / 0 | — | 0.0297 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 67 | 7.50 | 14.87 | 19.75 | 21.78 | 1.18× | 1.41× | -1.04 | -0.60 | 145 / 6,245 / 0 | — | 0.017 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 6 | 23.70 | 31.08 | 31.08 | 45.58 | 1.47× | 1.93× | 0.15 | 0.37 | 417 / 35,534 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 7 | 11.97 | 13.02 | 13.02 | 13.96 | 1.45× | 1.58× | 0.12 | 0.16 | 153 / 7,222 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 170 | 14.20 | 38.59 | 54.55 | 92.48 | 1.44× | 1.76× | -0.26 | -0.02 | 382 / 23,559 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 123 | 8.52 | 14.23 | 18.44 | 26.98 | 1.18× | 1.04× | -0.28 | -0.08 | 161 / 7,129 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 311 | 12.84 | 31.20 | 57.54 | 125.90 | 1.31× | 1.39× | -0.59 | -0.28 | 310 / 26,758 / 0 | — | 0.0032 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 173 | 7.75 | 17.16 | 25.43 | 37.63 | 1.08× | 1.24× | -0.25 | -0.06 | 145 / 6,643 / 0 | — | 0.002 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.74 | 0.74 | 0.74 | 0.74 | 0.98× | 0.98× | -1.09 | -0.72 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 41 | 27.92 | 60.81 | 90.17 | 101.83 | 1.33× | 1.75× | -0.41 | -0.37 | 427 / 31,019 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 74 | 23.33 | 40.14 | 56.36 | 204.83 | 1.12× | 1.16× | -0.29 | -0.25 | 272 / 24,205 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 9 | 5.57 | 9.45 | 9.45 | 16.50 | 1.45× | 1.17× | 1.26 | 1.03 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 21 | 3.55 | 7.93 | 7.93 | 11.06 | 0.89× | 1.55× | -0.17 | -0.12 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 11 | 11.29 | 28.64 | 28.64 | 45.28 | 1.17× | 1.48× | -0.05 | -0.15 | 129 / 5,316 / 0 | — | 11.294 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 19 | 8.97 | 14.82 | 14.82 | 17.72 | 1.08× | 1.21× | -0.49 | -0.38 | 110 / 4,484 / 0 | — | 8.97 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 72.13 | 72.13 | 72.13 | 72.13 | 1.89× | 1.89× | -4.41 | -3.02 | 2,395 / 171,019 / 8,191 | — | 72.127 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 5 | 12.22 | 22.72 | 22.72 | 23.60 | 0.82× | 1.15× | 1.77 | 1.08 | 169 / 8,150 / 0 | — | 6.1085 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 9.57 | 12.51 | 12.51 | 12.87 | 0.89× | 0.73× | -0.33 | -0.29 | 160 / 5,840 / 0 | — | 3.577 ms per file | commit |
| sandbox.commit | 2–4 files · UpToDate · contended | 1 | 2.72 | 2.72 | 2.72 | 2.72 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 1.362 ms per file | observe.after |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 13.65 | 13.65 | 13.65 | 26.60 | 0.83× | 0.83× | -1.33 | -0.99 | 110 / 5,588 / 0 | — | 1.7735 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 3 | 18.08 | 18.08 | 18.08 | 19.17 | 1.32× | 1.32× | 1.56 | 1.70 | 285 / 14,694 / 0 | — | 2.1858 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 94.02 | 94.02 | 94.02 | 110.18 | no baseline | no baseline | 0.16 | 0.19 | 1,453 / 164,043 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 87.60 | 885.58 | 885.58 | 12648.32 | 1.27× | 12.83× | -0.27 | -0.08 | 1,007 / 59,129 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 226 | 40.77 | 745.82 | 2967.87 | 3569.89 | 0.80× | 1.94× | -3.87 | -3.02 | — | 3900.30 | — | — |
| sandbox.exec | 0 files · uncontended | 138 | 33.61 | 574.27 | 756.93 | 6407.73 | 1.06× | 2.01× | -0.25 | -0.24 | 0 / 0 / 0 | 4018.70 | — | — |
| sandbox.exec | 1 files · contended | 54 | 32.35 | 48.07 | 59.45 | 70.92 | 0.88× | 0.57× | -0.06 | -0.09 | — | 4.70 | 32.347 ms per file | — |
| sandbox.exec | 1 files · uncontended | 46 | 31.15 | 47.79 | 59.54 | 65.68 | 0.93× | 0.71× | -0.01 | -0.02 | — | 4.70 | 31.153 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 66.96 | 66.96 | 66.96 | 67.41 | 0.96× | 0.96× | -0.68 | -0.55 | — | 96 | 3.3482 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 1 | 56.29 | 56.29 | 56.29 | 56.29 | 0.81× | 0.81× | -0.67 | -0.55 | — | 87 | 3.127 ms per file | — |
| sandbox.exec | 2–4 files · contended | 23 | 34.30 | 50.68 | 54.95 | 65.55 | 0.88× | 0.73× | -0.07 | -0.09 | — | 11.70 | 14.86 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 38 | 36.96 | 54.85 | 62.87 | 67.55 | 0.97× | 0.84× | -0.69 | -0.42 | — | 9.50 | 15.3333 ms per file | — |
| sandbox.exec | 5–16 files · contended | 16 | 42.05 | 60.87 | 60.87 | 64.81 | 0.72× | 0.84× | 0.54 | 0.34 | — | 27 | 5.5783 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 24 | 40.90 | 68.32 | 73.73 | 76.37 | 0.58× | 0.65× | -0.48 | -0.26 | — | 23.30 | 6.067 ms per file | — |
| sandbox.exec | — · contended | 15 | 4654.17 | 27079.92 | 27079.92 | 27383.90 | no baseline | no baseline | -1.50 | -1.05 | — | 45182.10 | — | — |
| sandbox.exec | — · uncontended | 33 | 245.07 | 14231.03 | 21679.97 | 33058.39 | 0.46× | 2.00× | -0.20 | -0.37 | — | 41,127 | — | — |
| sandbox.mount | — · contended | 89 | 12.09 | 20.69 | 29.99 | 32.62 | 1.08× | 1.09× | 0.14 | 0.12 | 62 / 1,677 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 119 | 9.38 | 13.76 | 16.91 | 18.39 | 0.84× | 0.68× | -0.21 | -0.16 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 3.77 | 4.52 | 4.52 | 41.34 | no baseline | no baseline | 0.10 | 0.07 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 63 | 13.90 | 24.54 | 27.16 | 27.23 | 1.31× | 1.36× | 0.19 | 0.22 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 145 | 12.56 | 35.39 | 132.41 | 196.21 | 1.20× | 1.92× | 0.22 | 0.20 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 14 | 0.0 KiB | 748.0 KiB | 3,331 | ok 14 |
| branch.diff_commits | branch | 368 | 0.0 KiB | 20.2 MiB | 69,208 | ok 368 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 97.0 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 53 | 884.7 KiB | 0.0 KiB | 64 | Committed 53 |
| fs.diff_files | fs | 38 | 0.0 KiB | 305.5 KiB | 28 | Text 28, NoSuchPath 10 |
| fs.glob | fs | 43 | 0.0 KiB | 49.0 KiB | 667 | ok 43 |
| fs.grep | fs | 53 | 0.0 KiB | 219.1 KiB | 758 | ok 53 |
| fs.list | fs | 59 | 0.0 KiB | 305.6 KiB | 1,859 | ok 59 |
| fs.read | fs | 44 | 0.0 KiB | 153.4 KiB | 44 | ok 44 |
| fs.rm | fs | 174 | 0.0 KiB | 0.0 KiB | 174 | Committed 174 |
| fs.stat | fs | 41 | 0.0 KiB | 9.1 KiB | 41 | ok 41 |
| fs.write | fs | 964 | 10.2 MiB | 0.0 KiB | 964 | Committed 964 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 215 | 0.0 KiB | 0.0 KiB | 0 | Committed 183, UpToDate 31, Conflict 1 |
| sandbox.exec | sandbox | 627 | 2.7 MiB | 5.9 MiB | 0 | exit:0 625, exit:2 2 |
| sandbox.mount | sandbox | 218 | 0.0 KiB | 0.0 KiB | 0 | Mounted 218 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 218 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 218 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.75 · end 1.88.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 0.932 | 13.993 · 0.987 · 0.932 · 0.859 · 0.812 | 2.62–2.62 | statements 23, vm_steps 812, fullscan_steps 0, sorts 0, returned_rows 68 |
| read | 0.786 | 0.946 · 0.786 · 0.863 · 0.775 · 0.742 | 2.62–2.62 | statements 14, vm_steps 614, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_small | 0.764 | 0.855 · 0.727 · 0.774 · 0.735 · 0.764 | 2.62–2.62 | statements 14, vm_steps 623, fullscan_steps 0, sorts 0, returned_rows 59 |
| list_largest | 6.374 | 8.472 · 6.374 · 6.404 · 6.216 · 5.965 | 2.62–2.62 | statements 124, vm_steps 14101, fullscan_steps 0, sorts 0, returned_rows 1643 |
| grep_scoped | 0.989 | 1.235 · 0.998 · 0.854 · 0.875 · 0.989 | 2.62–2.62 | statements 19, vm_steps 769, fullscan_steps 0, sorts 0, returned_rows 68 |
| glob_scoped | 0.824 | 0.866 · 0.787 · 0.769 · 0.824 · 0.824 | 2.62–2.62 | statements 13, vm_steps 602, fullscan_steps 0, sorts 0, returned_rows 58 |
| grep_tree | 4645.507 | 4639.038 · 4813.154 · 4622.524 · 4645.507 · 4673.791 | 2.23–2.49 | statements 55329, vm_steps 4172515, fullscan_steps 0, sorts 0, returned_rows 417875 |
| glob_tree | 6.119 | 8.6 · 6.29 · 6.119 · 5.965 · 6.115 | 2.23–2.23 | statements 111, vm_steps 16445, fullscan_steps 0, sorts 0, returned_rows 1855 |
| diff_files | 3.289 | 3.522 · 3.289 · 3.203 · 3.138 · 3.374 | 2.23–2.23 | statements 60, vm_steps 3496, fullscan_steps 0, sorts 0, returned_rows 348 |
| list_commits | 0.721 | 1.35 · 0.721 · 0.682 · 0.672 · 0.775 | 2.23–2.23 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.967 | 2.574 · 1.901 · 1.967 · 1.916 · 1.983 | 2.23–2.23 | statements 59, vm_steps 2388, fullscan_steps 0, sorts 0, returned_rows 284 |
| fork | 0.518 | 0.518 · 0.476 · 0.555 · 0.408 · 0.599 | 2.23–2.23 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 22.611 | 26.029 · 25.323 · 22.611 · 21.014 · 21.246 | 2.23–2.23 | statements 453, vm_steps 22070, fullscan_steps 0, sorts 0, returned_rows 1753 |
| oneshot_mount_unmount | 15.079 | 18.499 · 15.079 · 20.467 · 15.017 · 14.677 | 2.23–2.23 | statements 57, vm_steps 2032, fullscan_steps 82, sorts 2, returned_rows 204 |
| oneshot_commit | 66.433 | 76.191 · 66.433 · 74.154 · 60.342 · 66.302 | 2.23–2.23 | statements 158, vm_steps 11555, fullscan_steps 82, sorts 2, returned_rows 917 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.23–2.23 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r040: 285,570 pages of 4,096 B, 0 free · Commits 48,706 · Branches 958 · Layers 49 · compression 3.59× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 157,685 | 949.4 MiB |
| 2 | 57,155 | 854.0 MiB |
| 3 | 15,494 | 4.5 MiB |
| 4 | 46 | 9.0 KiB |
| 5 | 15,392 | 1.6 MiB |
| 6 | 121,778 | 593.0 MiB |
| 7 | 316,076 | 77.6 MiB |
| 8 | 858 | 247.2 KiB |
| 9 | 100,574 | 217.6 MiB |
| 10 | 52,376 | 6.4 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,329 | 189.9 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 49,941 | 99.1 MiB |
| 1 | 55,989 | 655.1 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 202,153 | 789.7 MiB | 29.1 MiB |
| inode_value | 48,988 | 191.4 MiB | 3.9 MiB |
| binding_hint | 14,072 | 55.0 MiB | 5.2 MiB |
| object_location | 11,585 | 45.3 MiB | 4.8 MiB |
| commit | 3,980 | 15.5 MiB | 2.4 MiB |
| file_digest | 1,352 | 5.3 MiB | 653.3 KiB |
| commit_lineage | 1,045 | 4.1 MiB | 468.4 KiB |
| commit_runs | 1,024 | 4.0 MiB | 533.5 KiB |
| commit_identity | 741 | 2.9 MiB | 291.7 KiB |
| content_signature | 157 | 628.0 KiB | 9.8 KiB |
| branch | 42 | 168.0 KiB | 28.0 KiB |
| branch_names | 15 | 60.0 KiB | 8.9 KiB |
| branch_identity | 12 | 48.0 KiB | 10.4 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 6 | 24.0 KiB | 7.6 KiB |
| layer | 4 | 16.0 KiB | 7.3 KiB |
| layers_source | 3 | 12.0 KiB | 7.8 KiB |
| layers_child | 3 | 12.0 KiB | 7.8 KiB |
| absorbed_heights | 3 | 12.0 KiB | 6.6 KiB |

### E. Stage times

**Time 254.2 s** (tooling): play 86.2 · consolidate 101.5 · verify 23.7 · probes 24.3 · tests 0.0 · seal + snapshot 7.8 · report 10.7

254.25 s tooling: prepare 1.60 · play 84.59 · consolidate 101.50 · verify 13.35 (diff_commits + full compareTree) · version walk 10.37 · probes 24.32 · metrics 0.80 · seal 1.24 · sealed figures 3.40 · snapshot copy 3.14 · report 0.34

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T02:31:28.810Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 12.83× it; Scaling: branch.diff_commits checkpoint statements in total (entries exponent 0.143): tree files exponent 0.161; Counters: diff_files.statements (chain-bounded): max over the latest cap period 108 vs the first 96: 1.125× (bound, period 8); Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (22 classes too narrow); Directory share: 0.503 |

### G. Evidence

- `~/lfs-history/metrics/range-040.a1.json`
- trace `~/lfs-history/runs/p3-main-v/trace/range-040.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-v/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-040.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r040-3-root | 363 | 499.1 KiB |
| r040-1-agents-notes | 609 | 508.7 KiB |
| r040-4-examples-acp-agent | 371 | 499.6 KiB |
| r040-2-packages-client | 617 | 508.7 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 361.0 | 4,104 |
| `git diff --stat` | 32.0 | 4,094 |
| `git add -f` | 32.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 41.0 | 4,101 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r040-1-agents-notes | end | P1 | pass | — | — |
| r040-1-agents-notes | end | P2 | pass | exit 0 | — |
| r040-1-agents-notes | end | P3 | pass | 257 bookkeeping path(s) | — |
| r040-1-agents-notes | end | P4 | n/a | no changed package to build | — |
| r040-1-agents-notes | end | P5 | n/a | no calibrated file | — |
| r040-1-agents-notes | end | P6 | n/a | not a repair | — |
| r040-4-examples-acp-agent | end | P1 | pass | — | — |
| r040-4-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r040-4-examples-acp-agent | end | P3 | pass | 257 bookkeeping path(s) | — |
| r040-4-examples-acp-agent | end | P4 | pass | 86 emitted files, exit 0 | — |
| r040-4-examples-acp-agent | end | P5 | pass | 30 files | — |
| r040-4-examples-acp-agent | end | P6 | n/a | not a repair | — |
| r040-3-root | end | P1 | pass | — | — |
| r040-3-root | end | P2 | pass | exit 0 | — |
| r040-3-root | end | P3 | n/a | an install, not a refresh | — |
| r040-3-root | end | P4 | pass | 243 emitted files, exit 2 | — |
| r040-3-root | end | P5 | pass | 33 files | — |
| r040-3-root | end | P6 | n/a | not a repair | — |
| r040-2-packages-client | end | P1 | pass | — | — |
| r040-2-packages-client | end | P2 | pass | exit 0 | — |
| r040-2-packages-client | end | P3 | pass | 257 bookkeeping path(s) | — |
| r040-2-packages-client | end | P4 | pass | 288 emitted files, exit 2 | — |
| r040-2-packages-client | end | P5 | pass | 73 files | — |
| r040-2-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (1941 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
