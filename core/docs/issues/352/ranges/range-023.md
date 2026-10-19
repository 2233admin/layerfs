# Range 023 · **watch** · attempt 1

**Matches git ✓** · daemon `45a196ef16c6` · image `d3773b4e` · plan v2 · continued from r022 (live Store)
dsh `6eaa6073a`..`171a0e2b3` · **63 commits** (11 mainline, 52 side) · 2026-07-20 → 2026-07-20
Areas changed: `examples/acp-agent` 25% · `packages/core` 10% · `/` 7% · other 58%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.33×** · **Churn 0.02**
**Time split:** play 85.0 s · git 96.7 s · Node 170.6 s · verify 9.9 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **612.2 MiB** (+47.5 MiB) | **506.8 MiB** (+61.9 MiB) | **0.83×** (prev 0.79×) | **67.8 MiB** | **1,460** (total 24,522) | **234.8 s** tooling (total 52.0 min) |

**Checks:** 12 pass · 7 watch: Speed not judged: baseline not set (pilot); Scaling insufficient same-binary points: 1 of 3 (daemon 45a196ef16c6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters insufficient same-binary points: 1 of 3 (daemon 45a196ef16c6); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 67.8 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 1956 ms for 460.8 MiB new; size exponent not judged (1 snapshots); Wall projection 1.04
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ branch.diff_commits p95 −89% · ▲ stored added +67% · ▲ probe diff_files +63%
**Budget:** 24 of 202 ranges · projected total 17.6 h (budget 16.8 h) · disk 70% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,913 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,578 / 2,578 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 1875 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 295 bin shims, 3194 links · output root ×2, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (45 lines from 3 .gitignore files) · **167 picks** in 3 merges (167 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `171a0e2b3`** · 129 commits written for 129 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 167 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r023-1-root | end | `137ad2a96a56` | `5826d3d60c09` | pass (305 normalized) | pass | n/a | pass | pass | n/a |
| r023-3-agents-notes | end | `82f4b0463908` | `eae73a9ca0a3` | pass (303 normalized) | pass | pass | pass | pass | n/a |
| r023-2-examples-acp-agent | end | `c4d39d90d37e` | `eae73a9ca0a3` | pass (303 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `52ab395b3792` | `null` | n/a | pass | n/a | n/a | pass | pass (111,981 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/util/timeout/tests/timeout.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/scripted-provider.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/sdk/create-sdk/tests/create.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/sdk/scripts/tests/scripts.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/sdk-options.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/llm/llm-deepseek/tests/adapter.spec.ts` (fails natively) · `packages/core/agent-loop/tests/interception.spec.ts` (fails natively) · `packages/core/agent-loop/tests/loop.spec.ts` (fails natively) · `packages/core/agent-loop/tests/resume.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/core/agent-loop/tests/config-session-id.spec.ts` (fails natively).

## 2. Activity

**3,267 calls** · **159 steps** by **8 agents + lead** on **3 Branches + main** · **214 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +227 added · 983 modified · −208 deleted · 15.4 MiB written · fs 1,297 : Sandbox 121 (**11 : 1**, reported only in P3)
**Execs:** 596 (JS 56 · shell 540) · 3 non-zero exits · install 0 · test runs 4 · version figures 12 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,643 | 1,311 | 332 | Committed 1,306 · Text 43 · NoSuchPath 11 · Equal 2 · UpToDate 5 |
| sandbox | 1,239 | 807 | 4 | commit 211 (Committed 168, UpToDate 42, Conflict 1) · exec 596 (exit:0 593, exit:1 1, exit:2 2) · mount 214 (Mounted 214) · status 4 · unmount 214 (Unmounted 214) |
| branch | 375 | 32 | 343 | diff_branches 13 · diff_commits 330 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,267** | **2,150** | **689** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r023-1-root | a01 a02 | 33 | 427 | ✓ | — |
| r023-2-examples-acp-agent | a03 a04 a05 | 57 | 432 | ✓ | — |
| r023-3-agents-notes | a06 a07 a08 | 63 | 446 | ✓ | — |
| main | lead | 6 | 155 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r023-1, a02 after a01 | 0.2 s |
| Stale clean merge | 1 / 1 | r023-1, a01 a02 | merged cleanly |
| Decoy edit | 1 / 1 | r023-1, a02 a01 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r023-1 | 16 | 7 | 9 | 0 | 0 | 236 | commit-conflict, stale-clean-merge, decoy |
| a02 | r023-1 | 17 | 5 | 12 | 0 | 0 | 191 | commit-conflict, stale-clean-merge, decoy |
| a03 | r023-2 | 18 | 9 | 9 | 0 | 0 | 148 | — |
| a04 | r023-2 | 24 | 9 | 15 | 0 | 0 | 214 | — |
| a05 | r023-2 | 15 | 6 | 9 | 0 | 0 | 70 | — |
| a06 | r023-3 | 25 | 11 | 14 | 0 | 0 | 150 | — |
| a07 | r023-3 | 22 | 9 | 13 | 0 | 0 | 92 | — |
| a08 | r023-3 | 16 | 8 | 8 | 0 | 0 | 204 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 155 | — |
| **Total** |  | **159** | **65** | **89** | **5** | **0** | **1,460** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 114 · pnpm 1 · tsc 3 · vitest 4 · other 474

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r023-2-examples-acp-agent | 41 | 41 | 41 | 3 | 41 | 886 |
| r023-3-agents-notes | 46 | 46 | 46 | 5 | 46 | 841 |
| r023-1-root | 20 | 20 | 20 | 5 | 20 | 388 |
| **lead** | — | — | — | — | 129 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r023-1-root | 1 | 0 | 1 | 1 | 32 | 32 / 32 |
| r023-3-agents-notes | 0 | 1 | 1 | 1 | 11 | 11 / 11 |
| r023-2-examples-acp-agent | 0 | 1 | 1 | 1 | 61 | 61 / 61 |
| **lead repair** | 1 | — | 1 | — | — | 111,981 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r022) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 564.7 MiB (13.3 MiB / 512.1 MiB / 11.5 MiB / 27.9 MiB) | 612.2 MiB (13.3 MiB / 557.4 MiB / 11.5 MiB / 29.9 MiB) | +47.5 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 50,203 / 8,538 / 3,253 | 46,616 / 7,859 / 3,200 | −3,587 / −679 / −53 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 444.9 MiB | 506.8 MiB | +61.9 MiB |
| **Space amplification** (total · tracked) | 0.79× · tracked 3.61× | 0.83× · tracked 3.78× | 0.04 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **12.02** (0.46 / 0.03 / 0.12) | 6.01× the median range |
| **Stored per Commit** | 17.4 KiB | 43.1 KiB | — |
| Metadata share | 0.38 | 0.37 | this range 0.27 |
| History: Commits / Layers / Branches | 23,062 | 24,522 / 12 / 130 | +1,460 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 16.17 GiB (Commits 14.58 GiB · installs 1006.0 MiB · build 114.2 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 45.18 GiB / 70% | — |
| Snapshot | — | r023, 460.8 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 318.1 MiB | 0.52 | +46.6 MiB |
| Metadata | 44.4 MiB | 0.07 | +3.4 MiB |
| Index rows | 116.5 MiB | 0.19 | — |
| Waste | 27.1 MiB | 0.04 | — |
| Other | 636.0 KiB | 0.00 | — |
| **Total = Store on disk** | **506.8 MiB** | **= 0.83** space amplification | +61.9 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 13.3 MiB | 50.3 MiB (21.7 MiB + 28.6 MiB) | 3.78× | — | 2.4 MiB | 5.6 MiB | 0.43 |
| `node_modules` | 557.4 MiB | 171.4 MiB (163.2 MiB + 8.3 MiB) | 0.31× | — | 33.6 MiB | 90.3 MiB | 0.37 |
| Build output | 11.5 MiB | 8.0 MiB (7.7 MiB + 369.0 KiB) | 0.69× | — | 700.9 KiB | 4.9 MiB | 0.14 |
| `.git` | 29.9 MiB | 131.3 MiB (125.5 MiB + 5.8 MiB) | 4.39× | — | 12.9 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 144.2 MiB | — (not divided) | — | 11.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 1.4 MiB | — | — | — | — | — |
| **Total** | — | **506.8 MiB** | **= 0.83×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 86,970 | +4,367 | 6.1 KiB | 39,354 (derived) | 52% |
| Chunks (large files) | 37,390 | +4,455 | 13.5 KiB | — | 1% |
| Large-file extents | 12,928 | — | 0.2 KiB | — | — |
| Directories | 111,507 | 4,274 (with inodes, pooled) | 0.2 KiB | — | 61% |
| Inodes and attributes | 148,366 | ↑ pooled | 2.4 KiB | — | — |
| Symlinks | 1,936 | +3,293 | 0.1 KiB | — | — |

Delta: 2.0% at depth cap · 17% of refused bases stopped by budget · `node_modules` reinstall: 0.341× the raw bytes of 41 changed packages (ratio: 31286934 new stored for 91766276 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.78× (50.3 MiB for 13.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 1.0 KiB / 5.8 KiB / 8.8 KiB over 236 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.33× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.02 (34.3 MiB stored for 1.53 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.28 (3 lanes × 612.2 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `45a196ef16c6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 7.9 ms / 21.1 ms | 2.3 ms / 4.5 ms | 2.6 ms / 5.0 ms | 19.6 ms / 67.8 ms | 10.2 ms / 17.1 ms | 284 ms / 284 ms | — (native comparison in P3; exec 41.0 ms / 852 ms) |
| SQL p50: 154 stmts | 51 stmts | 53 stmts | 210 stmts | 45 stmts | 7,547 stmts | — |

**Commit cost:** 9.22 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 555 ms p50 over 214
**Slowest:** sandbox.exec 30624 ms · sandbox.exec 28589 ms · sandbox.exec 28390 ms · checkpoint diff_commits 0.10 ms and 1.45 statements per entry (61,190 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline, none recorded yet: not judged)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 218 ms / 218 ms | — / — | — | git / status-cold: — |
| git status (steady) | 265 ms / 503 ms | — / — | — | git / status-steady: — |
| git add | 27.0 ms / 98.0 ms | — / — | — | git / add: — |
| git commit (lane) | 31.0 ms / 76.0 ms | — / — | — | git / commit: — |
| lead writes main | 8568 ms / 8568 ms | — / — | — | — |
| repack | 2414 ms / 2414 ms | — / — | — | — |
| pnpm install (incremental) | 2646 ms / 2646 ms | 2032 ms / 2032 ms | 1.30× | pnpm-reinstall / cold: — |
| pnpm refresh | 2336 ms / 2336 ms | 1458 ms / 1458 ms | 1.60× | pnpm-reinstall / steady: — |
| tsc -b | 4104 ms / 4104 ms | 3251 ms / 3989 ms | 1.26× | tsc-b / cold: — |
| vitest | 4569 ms / 4569 ms | 4080 ms / 4080 ms | 1.12× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (−0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.5 ms / 27.6 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 86552 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3085912 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 8.62 at the first command → 7.65 after the last (max 12.20 over 6 commands) · Docker VM 1.77 → 2.26

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-023.a1)

## 5. Findings and action

**Optimization:** none — no problems found.

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

- **a1 (`p3-main-r`, live after r22 a1, harness `79758e8c12`): WATCH, terminal.** First range on binaries from main 3ef00d32e5, owner 2026-10-20: daemon `45a196ef`, addon `4668012e`, built at `79758e8c12` (release, offline, -j 6, image `layerfs-307-fuser-patch-clippy:1.85.1`); SDK JS `be717af4` (main's `sdk/js`; unchanged), image `d3773b4e` unchanged. Switched in place on the run at the 22/23 boundary (`run.pre-switch-r23.json` kept). The old SDK JS folder (`f031-build` worktree) had been deleted.
  - Checkpoint ok, git ✓. Node: 17 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (771 emitted). Control `control-023.a1` passes.
  - The `diff_commits` optimize row is gone (#364 item 4). Verify took 9.9 s, against 91–96 s in r21–r22.
  - Speed, Scaling and Counters are watch rows: the speed baseline is r15's binary, and the new daemon has only 1 of 3 points. Accepted in fast mode, so no re-baseline.
  - Final steps: repair 95 s, verify 13 s, finish 41 s. Repair build 12.5 s, install 30.6 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2578/2578; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: baseline not set (pilot) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 45a196ef16c6); also not judged: oneshot_exec: 1 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 45a196ef16c6) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.265 | < 0.5 | pass |
| Reinstall growth | 0.341× the raw bytes of 41 changed packages (ratio: 31286934 new stored for 91766276 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0204 (budget 0.1661) | < 0.1 | pass |
| Range growth | 67.8 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 1956 ms for 460.8 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.7 | < 0.8 | pass |
| Wall projection | 1.04 | ≤ 1 (p3 budget) | watch |
| Git | HEAD = checkpoint; 129 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 167 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.33× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 159 | 160 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1460 | 1339 |
| Workspaces (one-shot share) | 214 (0.99) | 88 (0.977) |
| Reads | 290 | 290 |
| Reconcile writes | 146 | 146 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `45a196ef16c6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 13 | 20.74 | 308.36 | 308.36 | 315.63 | no baseline | no baseline | — | — | 256 / 21,120 / 0 | — | 0.0868 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 325 | 20.50 | 32.74 | 44.21 | 324.80 | no baseline | no baseline | — | — | 299 / 32,050 / 0 | — | 0.1085 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.04 | 1.32 | 1.32 | 2.33 | no baseline | no baseline | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 1.69 | 1.69 | 1.69 | 2.29 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0847 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 283.86 | 283.86 | 283.86 | 425.06 | no baseline | no baseline | — | — | 7,547 / 464,325 / 0 | — | 1.0918 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 8.94 | 8.94 | 8.94 | 8.94 | no baseline | no baseline | — | — | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 34.56 | 34.56 | 34.56 | 34.56 | no baseline | no baseline | — | — | 161 / 13,204 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 3 | 17.71 | 17.71 | 17.71 | 17.85 | no baseline | no baseline | — | — | 335 / 23,957 / 0 | — | 0.0723 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 26 | 7.11 | 11.33 | 13.68 | 16.55 | no baseline | no baseline | — | — | 126 / 6,306 / 0 | — | 0.0174 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 142.82 | 142.82 | 142.82 | 142.82 | no baseline | no baseline | — | — | 1,161 / 148,480 / 8,519 | — | 0.0073 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 6 | 7.73 | 8.59 | 8.59 | 12.69 | no baseline | no baseline | — | — | 146 / 7,133 / 0 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 7 | 28.95 | 33.70 | 33.70 | 70.70 | no baseline | no baseline | — | — | 568 / 80,731 / 8,191 | — | 0.007 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 43 | 7.13 | 11.14 | 13.13 | 14.48 | no baseline | no baseline | — | — | 121 / 5,601 / 0 | — | 0.0024 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 4 | 9.51 | 9.79 | 9.79 | 10.16 | no baseline | no baseline | — | — | 216 / 10,564 / 0 | — | 0.0256 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 15 | 8.20 | 12.44 | 12.44 | 19.50 | no baseline | no baseline | — | — | 161 / 7,399 / 0 | — | 0.0275 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 8 | 7.73 | 8.87 | 8.87 | 9.36 | no baseline | no baseline | — | — | 223 / 10,387 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 18 | 6.62 | 10.63 | 10.63 | 10.99 | no baseline | no baseline | — | — | 176 / 8,152 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 7.22 | 7.22 | 7.22 | 13.51 | no baseline | no baseline | — | — | 250 / 12,796 / 0 | — | 0.0017 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 7.40 | 8.80 | 8.80 | 11.25 | no baseline | no baseline | — | — | 192 / 8,214 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 1.81 | 1.81 | 1.81 | 2.39 | no baseline | no baseline | — | — | 34 / 2,331 / 0 | — | 1.815 ms per file | — |
| fs.glob | 17–64 files · contended | 4 | 3.12 | 3.63 | 3.63 | 5.10 | no baseline | no baseline | — | — | 82 / 5,559 / 0 | — | 0.1341 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 2.88 | 6.16 | 6.16 | 9.81 | no baseline | no baseline | — | — | 49 / 3,921 / 0 | — | 0.073 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 2.65 | 2.65 | 2.65 | 2.65 | no baseline | no baseline | — | — | 58 / 2,947 / 0 | — | 0.8817 ms per file | — |
| fs.glob | 2–4 files · uncontended | 7 | 1.91 | 2.54 | 2.54 | 4.87 | no baseline | no baseline | — | — | 40 / 2,655 / 0 | — | 0.7013 ms per file | — |
| fs.glob | 5–16 files · contended | 4 | 2.90 | 2.90 | 2.90 | 3.78 | no baseline | no baseline | — | — | 50 / 4,136 / 0 | — | 0.4198 ms per file | — |
| fs.glob | 5–16 files · uncontended | 10 | 2.48 | 2.67 | 2.67 | 2.74 | no baseline | no baseline | — | — | 44 / 3,771 / 0 | — | 0.3694 ms per file | — |
| fs.glob | >64 files · contended | 3 | 10.59 | 10.59 | 10.59 | 18.50 | no baseline | no baseline | — | — | 237 / 19,290 / 0 | — | 0.0734 ms per file | — |
| fs.glob | >64 files · uncontended | 3 | 5.54 | 5.54 | 5.54 | 9.87 | no baseline | no baseline | — | — | 108 / 10,131 / 0 | — | 0.0424 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 1.62 | 1.62 | 1.62 | 1.62 | no baseline | no baseline | — | — | 34 / 2,136 / 0 | — | 1.621 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 4 | 10.28 | 12.39 | 12.39 | 14.21 | no baseline | no baseline | — | — | 251 / 9,774 / 0 | — | 0.4673 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 10 | 5.59 | 20.75 | 20.75 | 21.29 | no baseline | no baseline | — | — | 116 / 5,074 / 0 | — | 0.1419 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 3.02 | 3.02 | 3.02 | 3.02 | no baseline | no baseline | — | — | 44 / 2,370 / 0 | — | 1.005 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 8 | 2.85 | 4.60 | 4.60 | 12.95 | no baseline | no baseline | — | — | 58 / 3,196 / 0 | — | 0.741 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 7 | 4.67 | 5.07 | 5.07 | 5.81 | no baseline | no baseline | — | — | 105 / 5,284 / 0 | — | 0.6342 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 13 | 4.27 | 12.03 | 12.03 | 12.76 | no baseline | no baseline | — | — | 84 / 4,361 / 0 | — | 0.61 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 1 | 56.69 | 56.69 | 56.69 | 56.69 | no baseline | no baseline | — | — | 1,492 / 61,745 / 0 | — | 0.225 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 4 | 22.19 | 40.11 | 40.11 | 45.19 | no baseline | no baseline | — | — | 509 / 23,632 / 0 | — | 0.1341 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 2 | 1.47 | 1.47 | 1.47 | 1.96 | no baseline | no baseline | — | — | 29 / 2,058 / 0 | — | 1.471 ms per entrie | — |
| fs.list | 17–64 entries · contended | 5 | 4.88 | 4.96 | 4.96 | 11.27 | no baseline | no baseline | — | — | 66 / 9,252 / 0 | — | 0.2255 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 11 | 4.08 | 4.91 | 4.91 | 5.82 | no baseline | no baseline | — | — | 77 / 7,136 / 0 | — | 0.0983 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 2.17 | 2.17 | 2.17 | 2.40 | no baseline | no baseline | — | — | 73 / 4,211 / 0 | — | 0.7223 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 10 | 2.24 | 4.27 | 4.27 | 6.96 | no baseline | no baseline | — | — | 43 / 2,992 / 0 | — | 0.9635 ms per entrie | — |
| fs.list | 5–16 entries · contended | 4 | 2.57 | 2.63 | 2.63 | 2.71 | no baseline | no baseline | — | — | 53 / 4,241 / 0 | — | 0.3754 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 11 | 2.29 | 2.87 | 2.87 | 3.54 | no baseline | no baseline | — | — | 43 / 3,223 / 0 | — | 0.373 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 1.80 | 1.80 | 1.80 | 1.80 | no baseline | no baseline | — | — | 46 / 2,902 / 0 | — | 0.0042 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 5 | 2.52 | 2.60 | 2.60 | 2.92 | no baseline | no baseline | — | — | 57 / 3,604 / 0 | — | 0.0031 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 2 | 2.98 | 2.98 | 2.98 | 2.99 | no baseline | no baseline | — | — | 56 / 2,462 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 4 | 2.21 | 2.36 | 2.36 | 2.60 | no baseline | no baseline | — | — | 46 / 2,805 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 10 | 2.42 | 3.92 | 3.92 | 5.03 | no baseline | no baseline | — | — | 54 / 2,663 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 28 | 2.25 | 4.51 | 5.10 | 5.22 | no baseline | no baseline | — | — | 48 / 2,690 / 0 | — | 0.0008 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 49 | 11.62 | 33.51 | 48.52 | 54.90 | no baseline | no baseline | — | — | 230 / 11,686 / 0 | — | 11.619 ms per file | commit |
| fs.rm | 1 files · uncontended | 150 | 8.02 | 14.01 | 17.48 | 31.48 | no baseline | no baseline | — | — | 132 / 6,766 / 0 | — | 8.024 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 1 | 1.92 | 1.92 | 1.92 | 1.92 | no baseline | no baseline | — | — | 43 / 2,857 / 0 | — | 0.0059 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 6 | 2.26 | 2.41 | 2.41 | 2.79 | no baseline | no baseline | — | — | 43 / 2,764 / 0 | — | 0.0055 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 1.74 | 1.74 | 1.74 | 1.74 | no baseline | no baseline | — | — | 39 / 2,546 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 6 | 2.37 | 3.08 | 3.08 | 3.19 | no baseline | no baseline | — | — | 61 / 3,397 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 12 | 2.00 | 2.41 | 2.41 | 2.58 | no baseline | no baseline | — | — | 40 / 2,538 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 5 | 2.52 | 2.70 | 2.70 | 2.78 | no baseline | no baseline | — | — | 64 / 3,681 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 14 | 2.10 | 2.93 | 2.93 | 3.53 | no baseline | no baseline | — | — | 38 / 2,734 / 0 | — | 0.0004 ms per byte | — |
| fs.write | ≤1 KiB · contended | 34 | 7.86 | 16.64 | 25.70 | 41.88 | no baseline | no baseline | — | — | 158 / 7,638 / 0 | — | 0.0132 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 158 | 7.57 | 11.38 | 16.68 | 30.60 | no baseline | no baseline | — | — | 143 / 5,717 / 0 | — | 0.0107 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 4 | 18.03 | 28.75 | 28.75 | 32.88 | no baseline | no baseline | — | — | 441 / 19,327 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 22 | 10.54 | 18.55 | 21.21 | 36.04 | no baseline | no baseline | — | — | 162 / 6,995 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 75 | 10.27 | 72.09 | 150.87 | 160.78 | no baseline | no baseline | — | — | 258 / 13,281 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 289 | 7.92 | 12.59 | 16.32 | 17.68 | no baseline | no baseline | — | — | 156 / 6,044 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 110 | 10.65 | 57.71 | 78.86 | 91.50 | no baseline | no baseline | — | — | 281 / 14,251 / 0 | — | 0.0029 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 321 | 7.31 | 12.79 | 14.49 | 96.68 | no baseline | no baseline | — | — | 147 / 5,936 / 0 | — | 0.0024 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.61 | 0.61 | 0.61 | 0.61 | no baseline | no baseline | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 37 | 28.13 | 65.14 | 104.71 | 141.36 | no baseline | no baseline | — | — | 367 / 27,879 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 71 | 22.52 | 50.21 | 67.78 | 255.33 | no baseline | no baseline | — | — | 303 / 22,522 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 9 | 3.96 | 6.04 | 6.04 | 25.28 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 33 | 3.48 | 6.12 | 6.44 | 11.74 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 10 | 10.64 | 24.63 | 24.63 | 28.39 | no baseline | no baseline | — | — | 129 / 5,130 / 0 | — | 10.638 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 9 | 9.51 | 12.64 | 12.64 | 19.12 | no baseline | no baseline | — | — | 112 / 4,280 / 0 | — | 9.512 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 444.99 | 444.99 | 444.99 | 444.99 | no baseline | no baseline | — | — | 8,932 / 282,027 / 8,191 | — | 444.989 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 30.17 | 30.17 | 30.17 | 30.17 | no baseline | no baseline | — | — | 424 / 88,917 / 8,191 | — | 1.7749 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 8 | 13.63 | 39.81 | 39.81 | 85.71 | no baseline | no baseline | — | — | 160 / 7,417 / 0 | — | 5.644 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 10 | 10.46 | 14.33 | 14.33 | 14.40 | no baseline | no baseline | — | — | 146 / 5,672 / 0 | — | 4.58 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 13.29 | 13.29 | 13.29 | 15.79 | no baseline | no baseline | — | — | 143 / 7,009 / 0 | — | 1.9735 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 3 | 15.51 | 15.51 | 15.51 | 16.46 | no baseline | no baseline | — | — | 251 / 10,211 / 0 | — | 2.2157 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 378.97 | 378.97 | 378.97 | 378.97 | no baseline | no baseline | — | — | 2,859 / 327,778 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 63.48 | 619.32 | 619.32 | 14845.73 | no baseline | no baseline | — | — | 506 / 32,639 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 203 | 407.98 | 818.47 | 1408.25 | 3100.86 | no baseline | no baseline | — | — | 0 / 0 / 0 | 2560.70 | — | — |
| sandbox.exec | 0 files · uncontended | 145 | 33.36 | 110.95 | 920.26 | 5729.30 | no baseline | no baseline | — | — | — | 2,628 | — | — |
| sandbox.exec | 1 files · contended | 42 | 40.52 | 60.04 | 70.08 | 70.45 | no baseline | no baseline | — | — | — | 4.70 | 40.523 ms per file | — |
| sandbox.exec | 1 files · uncontended | 28 | 33.52 | 71.18 | 78.24 | 91.08 | no baseline | no baseline | — | — | — | 4.50 | 33.524 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 64.35 | 64.35 | 64.35 | 294.04 | no baseline | no baseline | — | — | — | 95 | 3.7854 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 10 | 50.05 | 81.65 | 81.65 | 87.58 | no baseline | no baseline | — | — | — | 19.80 | 2.9439 ms per file | — |
| sandbox.exec | 2–4 files · contended | 34 | 39.32 | 61.94 | 72.23 | 186.31 | no baseline | no baseline | — | — | — | 10.30 | 12.3565 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 39 | 32.53 | 62.01 | 71.79 | 79.63 | no baseline | no baseline | — | — | — | 9.50 | 13.399 ms per file | — |
| sandbox.exec | 5–16 files · contended | 20 | 51.92 | 75.06 | 75.06 | 78.92 | no baseline | no baseline | — | — | — | 24 | 6.857 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 22 | 52.38 | 77.00 | 77.96 | 81.15 | no baseline | no baseline | — | — | — | 18.80 | 7.0365 ms per file | — |
| sandbox.exec | — · contended | 11 | 4103.19 | 28389.76 | 28389.76 | 28589.30 | no baseline | no baseline | — | — | — | 36342.60 | — | — |
| sandbox.exec | — · uncontended | 29 | 180.58 | 8675.57 | 12481.10 | 30623.73 | no baseline | no baseline | — | — | — | 36342.60 | — | — |
| sandbox.mount | — · contended | 75 | 11.02 | 16.45 | 25.69 | 122.51 | no baseline | no baseline | — | — | 58 / 1,647 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 129 | 9.78 | 17.06 | 24.18 | 116.98 | no baseline | no baseline | — | — | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.90 | 4.16 | 4.16 | 35.20 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 57 | 11.42 | 21.43 | 63.81 | 132.79 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 147 | 10.52 | 27.56 | 110.59 | 320.46 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 687.5 KiB | 3,109 | ok 13 |
| branch.diff_commits | branch | 330 | 0.0 KiB | 17.9 MiB | 61,837 | ok 330 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.0 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 99 | 1.6 MiB | 0.0 KiB | 110 | Committed 99 |
| fs.diff_files | fs | 56 | 0.0 KiB | 595.1 KiB | 45 | Text 43, NoSuchPath 11, Equal 2 |
| fs.glob | fs | 52 | 0.0 KiB | 52.0 KiB | 630 | ok 52 |
| fs.grep | fs | 59 | 0.0 KiB | 192.6 KiB | 730 | ok 59 |
| fs.list | fs | 57 | 0.0 KiB | 151.8 KiB | 1,030 | ok 57 |
| fs.read | fs | 55 | 0.0 KiB | 208.1 KiB | 55 | ok 55 |
| fs.rm | fs | 199 | 0.0 KiB | 0.0 KiB | 199 | Committed 199 |
| fs.stat | fs | 53 | 0.0 KiB | 11.9 KiB | 53 | ok 53 |
| fs.write | fs | 1,013 | 13.8 MiB | 0.0 KiB | 1,013 | Committed 1008, UpToDate 5 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 211 | 0.0 KiB | 0.0 KiB | 0 | Committed 168, UpToDate 42, Conflict 1 |
| sandbox.exec | sandbox | 596 | 2.7 MiB | 4.3 MiB | 0 | exit:0 593, exit:1 1, exit:2 2 |
| sandbox.mount | sandbox | 214 | 0.0 KiB | 0.0 KiB | 0 | Mounted 214 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 214 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 214 |

### C. Scale probes

Binary: daemon `45a196ef16c6`.

Load average (1-min, runner (Docker VM kernel)): start 1.77 · end 2.26.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.092 | 10.949 · 1.237 · 1.092 · 0.956 · 1.004 | 2.53–2.53 | statements 33, vm_steps 1070, fullscan_steps 0, sorts 0, returned_rows 88 |
| read | 1.063 | 1.063 · 0.97 · 1.338 · 1.127 · 1.014 | 2.53–2.53 | statements 18, vm_steps 746, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_small | 0.999 | 1.242 · 0.966 · 1.085 · 0.996 · 0.999 | 2.53–2.53 | statements 18, vm_steps 755, fullscan_steps 0, sorts 0, returned_rows 73 |
| list_largest | 2.234 | 2.853 · 2.205 · 2.169 · 2.319 · 2.234 | 2.53–2.53 | statements 51, vm_steps 4162, fullscan_steps 0, sorts 0, returned_rows 463 |
| grep_scoped | 1.098 | 1.423 · 1.065 · 1.098 · 1.077 · 1.426 | 2.53–2.53 | statements 23, vm_steps 901, fullscan_steps 0, sorts 0, returned_rows 82 |
| glob_scoped | 0.98 | 0.988 · 0.98 · 0.861 · 0.929 · 1.583 | 2.53–2.53 | statements 17, vm_steps 734, fullscan_steps 0, sorts 0, returned_rows 72 |
| grep_tree | 3938.898 | 3939.029 · 3608.5 · 3938.898 · 3616.206 · 4318.808 | 2.31–2.53 | statements 39530, vm_steps 3202366, fullscan_steps 0, sorts 0, returned_rows 327748 |
| glob_tree | 5.237 | 6.434 · 4.356 · 51.148 · 5.045 · 5.237 | 2.31–2.31 | statements 98, vm_steps 10795, fullscan_steps 0, sorts 0, returned_rows 1275 |
| diff_files | 5.453 | 5.291 · 5.423 · 5.509 · 5.453 · 5.506 | 2.31–2.31 | statements 96, vm_steps 4432, fullscan_steps 0, sorts 0, returned_rows 444 |
| list_commits | 0.942 | 2.013 · 1.143 · 0.884 · 0.751 · 0.942 | 2.31–2.31 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.767 | 4.848 · 2.865 · 2.767 · 2.53 · 2.447 | 2.31–2.31 | statements 65, vm_steps 2562, fullscan_steps 0, sorts 0, returned_rows 306 |
| fork | 1.205 | 1.205 · 3.346 · 0.745 · 1.242 · 0.757 | 2.31–2.31 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 29.834 | 42.232 · 29.834 · 28.936 · 95.457 · 27.797 | 2.31–2.31 | statements 490, vm_steps 23385, fullscan_steps 0, sorts 0, returned_rows 1897 |
| oneshot_mount_unmount | 16.767 | 24.755 · 16.268 · 49.246 · 16.767 · 15.882 | 2.31–2.31 | statements 67, vm_steps 2290, fullscan_steps 82, sorts 2, returned_rows 224 |
| oneshot_commit | 72.691 | 72.691 · 138.795 · 66.233 · 55.993 · 92.395 | 2.31–2.31 | statements 191, vm_steps 12160, fullscan_steps 82, sorts 2, returned_rows 980 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.31–2.31 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r023: 129,729 pages of 4,096 B, 0 free · Commits 24,784 · Branches 452 · Layers 28 · compression 3.83× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 86,970 | 518.2 MiB |
| 2 | 37,390 | 492.7 MiB |
| 3 | 12,895 | 2.4 MiB |
| 4 | 33 | 6.7 KiB |
| 5 | 12,817 | 1.3 MiB |
| 6 | 51,421 | 261.1 MiB |
| 7 | 111,299 | 25.2 MiB |
| 8 | 208 | 61.9 KiB |
| 9 | 44,408 | 82.4 MiB |
| 10 | 26,898 | 3.3 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,936 | 157.3 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 25,241 | 44.4 MiB |
| 1 | 34,494 | 318.1 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 97,717 | 381.7 MiB | 15.7 MiB |
| inode_value | 17,284 | 67.5 MiB | 1.4 MiB |
| object_location | 5,427 | 21.2 MiB | 2.3 MiB |
| binding_hint | 4,718 | 18.4 MiB | 1.7 MiB |
| commit | 1,957 | 7.6 MiB | 1.3 MiB |
| file_digest | 789 | 3.1 MiB | 359.9 KiB |
| commit_lineage | 539 | 2.1 MiB | 268.6 KiB |
| commit_runs | 523 | 2.0 MiB | 279.7 KiB |
| commit_identity | 383 | 1.5 MiB | 172.1 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 19 | 76.0 KiB | 10.1 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| branch_names | 8 | 32.0 KiB | 8.0 KiB |
| branch_identity | 7 | 28.0 KiB | 10.3 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 3 | 12.0 KiB | 4.5 KiB |
| layer | 3 | 12.0 KiB | 7.1 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |

### E. Stage times

**Time 234.8 s** (tooling): play 86.6 · consolidate 91.4 · verify 20.9 · probes 20.7 · tests 0.0 · seal + snapshot 4.8 · report 10.4

234.85 s tooling: prepare 1.56 · play 85.04 · consolidate 91.41 · verify 9.93 (diff_commits + full compareTree) · version walk 10.97 · probes 20.66 · metrics 0.72 · seal 1.22 · sealed figures 1.62 · snapshot copy 1.99 · report 0.48

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 45a196ef16c67addd2125ca0788555b3cdefa53df36efe3261c0ddacc17db5ae | 2026-10-19T20:30:19.606Z | watch | Speed: not judged: baseline not set (pilot); Scaling: insufficient same-binary points: 1 of 3 (daemon 45a196ef16c6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 45a196ef16c6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 67.8 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 1956 ms for 460.8 MiB new; size exponent not judged (1 snapshots); Wall projection: 1.04 |

### G. Evidence

- `~/lfs-history/metrics/range-023.a1.json`
- trace `~/lfs-history/runs/p3-main-r/trace/range-023.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-r/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-023.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r023-2-examples-acp-agent | 886 | 235.7 KiB |
| r023-3-agents-notes | 841 | 240.5 KiB |
| r023-1-root | 388 | 230.6 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 265.0 | 1,915 |
| `git diff --stat` | 35.0 | 1,903 |
| `git add -f` | 27.0 | — |
| `git rm --cached` | 9.0 | — |
| `git commit` | 31.0 | 1,910 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r023-1-root | end | P1 | pass | — | — |
| r023-1-root | end | P2 | pass | exit 0 | — |
| r023-1-root | end | P3 | n/a | an install, not a refresh | — |
| r023-1-root | end | P4 | pass | 75 emitted files, exit 1 | — |
| r023-1-root | end | P5 | pass | 32 files | — |
| r023-1-root | end | P6 | n/a | not a repair | — |
| r023-3-agents-notes | end | P1 | pass | — | — |
| r023-3-agents-notes | end | P2 | pass | exit 0 | — |
| r023-3-agents-notes | end | P3 | pass | 185 bookkeeping path(s) | — |
| r023-3-agents-notes | end | P4 | pass | 180 emitted files, exit 2 | — |
| r023-3-agents-notes | end | P5 | pass | 11 files | — |
| r023-3-agents-notes | end | P6 | n/a | not a repair | — |
| r023-2-examples-acp-agent | end | P1 | pass | — | — |
| r023-2-examples-acp-agent | end | P2 | pass | exit 0 | — |
| r023-2-examples-acp-agent | end | P3 | pass | 185 bookkeeping path(s) | — |
| r023-2-examples-acp-agent | end | P4 | pass | 148 emitted files, exit 2 | — |
| r023-2-examples-acp-agent | end | P5 | pass | 61 files | — |
| r023-2-examples-acp-agent | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (771 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
