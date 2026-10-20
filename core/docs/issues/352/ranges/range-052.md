# Range 052 · **watch** · attempt 1

**Matches git ✓** · daemon `32eda22d657d` · image `d3773b4e` · plan v2 · continued from r051 (live Store)
dsh `b76659aa5`..`b9e240bbe` · **63 commits** (8 mainline, 55 side) · 2026-07-27 → 2026-07-30
Areas changed: `/` 13% · `packages/typert` 12% · `packages/client` 9% · other 66%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 17 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.24×** · **Churn 0.01**
**Time split:** play 130.6 s · git 127.0 s · Node 267.4 s · verify 16.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **855.7 MiB** (+37.5 MiB) | **1.49 GiB** (+41.9 MiB) | **1.79×** (prev 1.82×) | **44.7 MiB** | **1,163** (total 62,546) | **344.9 s** tooling (total 187.4 min) |

**Checks:** 13 pass · 6 watch: Speed fs.grep 5–16 files · uncontended: 2.3× baseline (sdk.lines); not judged: sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (1.38×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.25×) (baseline class under 5 calls per range); Scaling insufficient same-binary points: 2 of 3 (daemon 32eda22d657d); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters insufficient same-binary points: 2 of 3 (daemon 32eda22d657d); Contended work not judged: no contended class has 3 ranges of 5+ calls with per-call SQL; SQL per call (sql.call); Range growth 44.7 MiB; median not judged: 1 of 3 earlier ranges; Snapshot time 4885 ms for 1312.8 MiB new; size exponent not judged (2 snapshots)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +69% · ▲ probe read +41% · ▲ probe diff_files +40%
**Budget:** 53 of 202 ranges · projected total 16.2 h (budget 16.8 h) · disk 45% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,928 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,279 / 2,279 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3168 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 424 bin shims, 4650 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (57 lines from 4 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `b9e240bbe`** · 140 commits written for 140 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r052-1-root | end | `318b8bff6781` | `03fd25a37267` | pass (429 normalized) | pass | n/a | pass | pass | n/a |
| r052-3-agents-notes | end | `6036e9ebf846` | `03fd25a37267` | pass (429 normalized) | pass | pass | pass | pass | n/a |
| r052-2-packages-hooks | end | `bca8cf986473` | `03fd25a37267` | pass (429 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `f1dafb78f751` | `null` | n/a | pass | n/a | n/a | pass | pass (137,895 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/subagent/subagent/tests/out-of-process.spec.ts` (fails natively) · `packages/skill/skill-local/tests/skill-local-watcher.spec.ts` (fails natively) · `packages/skill/tool-skill/tests/tool-skill.spec.ts` (fails natively) · `packages/storage/storage-json/tests/json-backend.spec.ts` (fails natively) · `packages/core/agent-loop/tests/tool-calls.spec.ts` (fails natively) · `packages/skill/skill-local/tests/skill-local.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/client/ui-model/tests/model-select.spec.tsx` (fails natively) · `packages/client/ui-question/tests/question-composer.spec.tsx` (fails natively) · `packages/client/ui-trajectory/tests/client-bundle.spec.ts` (fails natively) · `packages/client/connection/tests/fixture-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-rename.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-basic.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-branch-tails.spec.tsx` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/client/connection/tests/fixture.spec.ts` (fails natively).

## 2. Activity

**3,047 calls** · **158 steps** by **8 agents + lead** on **3 Branches + main** · **214 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +151 added · 888 modified · −55 deleted · 19.6 MiB written · fs 995 : Sandbox 99 (**10 : 1**, reported only in P3)
**Execs:** 586 (JS 55 · shell 531) · 2 non-zero exits · install 0 · test runs 5 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,355 | 1,008 | 347 | Committed 1,008 · Text 38 · NoSuchPath 9 · Equal 4 |
| sandbox | 1,229 | 797 | 4 | commit 211 (Committed 170, UpToDate 40, Conflict 1) · exec 586 (exit:0 584, exit:2 2) · mount 214 (Mounted 214) · status 4 · unmount 214 (Unmounted 214) |
| branch | 453 | 32 | 421 | diff_branches 13 · diff_commits 408 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,047** | **1,837** | **782** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r052-1-root | a01 a02 | 36 | 357 | ✓ | — |
| r052-2-packages-hooks | a03 a04 a05 | 53 | 346 | ✓ | — |
| r052-3-agents-notes | a06 a07 a08 | 63 | 362 | ✓ | — |
| main | lead | 6 | 98 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r052-2, a04 after a05 | 0.1 s |
| Stale clean merge | 1 / 1 | r052-2, a03 a04 | merged cleanly |
| Decoy edit | 1 / 1 | r052-2, a03 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r052-1 | 18 | 9 | 9 | 0 | 0 | 250 | — |
| a02 | r052-1 | 18 | 7 | 11 | 0 | 0 | 107 | — |
| a03 | r052-2 | 12 | 4 | 8 | 0 | 0 | 73 | stale-clean-merge, decoy |
| a04 | r052-2 | 31 | 12 | 19 | 0 | 0 | 223 | commit-conflict, stale-clean-merge, decoy |
| a05 | r052-2 | 10 | 5 | 5 | 0 | 0 | 50 | commit-conflict |
| a06 | r052-3 | 32 | 15 | 17 | 0 | 0 | 152 | — |
| a07 | r052-3 | 13 | 6 | 7 | 0 | 0 | 84 | — |
| a08 | r052-3 | 18 | 6 | 12 | 0 | 0 | 126 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 98 | — |
| **Total** |  | **158** | **65** | **88** | **5** | **0** | **1,163** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 115 · pnpm 1 · tsc 3 · vitest 5 · other 462

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r052-1-root | 27 | 27 | 27 | 6 | 27 | 310 |
| r052-2-packages-hooks | 35 | 35 | 35 | 1 | 35 | 721 |
| r052-3-agents-notes | 46 | 46 | 46 | 2 | 46 | 763 |
| **lead** | — | — | — | — | 140 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r052-1-root | 1 | 0 | 1 | 1 | 28 | 28 / 28 |
| r052-3-agents-notes | 0 | 1 | 1 | 1 | 68 | 68 / 68 |
| r052-2-packages-hooks | 0 | 1 | 1 | 1 | 148 | 148 / 148 |
| **lead repair** | 1 | — | 1 | — | — | 137,895 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r051) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 818.3 MiB (26.8 MiB / 658.0 MiB / 25.3 MiB / 108.3 MiB) | 855.7 MiB (27.6 MiB / 691.9 MiB / 26.0 MiB / 110.2 MiB) | +37.5 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,850 / 9,961 / 4,659 | 64,465 / 10,003 / 4,658 | −385 / +42 / −1 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.45 GiB | 1.49 GiB | +41.9 MiB |
| **Space amplification** (total · tracked) | 1.82× · tracked 4.99× | 1.79× · tracked 4.92× | -0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **9.32** (0.50 / 0.05 / 0.24) | 1.28× the median range |
| **Stored per Commit** | 26.2 KiB | 36.8 KiB | — |
| Metadata share | 0.44 | 0.44 | this range 0.35 |
| History: Commits / Layers / Branches | 61,383 | 62,546 / 35 / 797 | +1,163 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 13.20 GiB (Commits 10.79 GiB · installs 851.0 MiB · build 95.6 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 38.95 GiB / 45% | — |
| Snapshot | — | r052, 1.28 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 859.6 MiB | 1.00 | +26.1 MiB |
| Metadata | 137.0 MiB | 0.16 | +2.9 MiB |
| Index rows | 457.7 MiB | 0.53 | +11.5 MiB |
| Waste | 71.7 MiB | 0.08 | +1.3 MiB |
| Other | 1.9 MiB | 0.00 | +52.0 KiB |
| **Total = Store on disk** | **1.49 GiB** | **= 1.79** space amplification | +41.9 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 27.6 MiB | 135.7 MiB (71.7 MiB + 64.0 MiB) | 4.92× | — | 2.0 MiB | 4.8 MiB | 0.42 |
| `node_modules` | 691.9 MiB | 235.0 MiB (201.4 MiB + 33.6 MiB) | 0.34× | — | 15.0 MiB | 38.4 MiB | 0.39 |
| Build output | 26.0 MiB | 28.8 MiB (26.5 MiB + 2.3 MiB) | 1.11× | — | 1.1 MiB | 9.2 MiB | 0.12 |
| `.git` | 110.2 MiB | 540.5 MiB (516.7 MiB + 23.8 MiB) | 4.90× | — | 10.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 531.3 MiB | — (not divided) | — | 12.9 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 56.5 MiB | — | — | — | — | — |
| **Total** | — | **1.49 GiB** | **= 1.78×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 204,835 | +3,574 | 6.4 KiB | 0 (derived) | 48% |
| Chunks (large files) | 71,326 | +2,929 | 15.9 KiB | — | 27% |
| Large-file extents | 17,538 | — | 0.4 KiB | — | — |
| Directories | 481,839 | 4,238 (with inodes, pooled) | 0.3 KiB | — | 55% |
| Inodes and attributes | 406,049 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,472 | +4,662 | 0.1 KiB | — | — |

Delta: 2.7% at depth cap · 18% of refused bases stopped by budget · `node_modules` reinstall: 0.412× the raw bytes of 43 changed packages (ratio: 15699803 new stored for 38091349 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.92× (135.7 MiB for 27.6 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.5 KiB / 4.1 KiB / 8.1 KiB over 248 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.24× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.01 (16.1 MiB stored for 1.93 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.60 (3 lanes × 855.7 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.4 KiB (budget not set) |

## 4. Speed

Daemon `32eda22d657d` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.2 ms / 28.7 ms (1.04×) | 2.7 ms / 4.0 ms (0.96×) | 3.5 ms / 8.2 ms (1.28×) | 21.8 ms / 73.9 ms (1.11×) | 10.1 ms / 18.1 ms (0.99×) | 367 ms / 367 ms (0.75×) | — (native comparison in P3; exec 38.5 ms / 968 ms) |
| SQL p50: 163 stmts | 56 stmts | 61 stmts | 220 stmts | 45 stmts | 9,329 stmts | — |

**Commit cost:** 14.44 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 722 ms p50 over 214
**Slowest:** sandbox.exec 39822 ms · sandbox.exec 33341 ms · sandbox.exec 33108 ms · checkpoint diff_commits 0.10 ms and 1.54 statements per entry (74,741 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 392 ms / 392 ms | — / — | — | git / status-cold: — |
| git status (steady) | 425 ms / 580 ms | — / — | — | git / status-steady: — |
| git add | 43.0 ms / 116 ms | — / — | — | git / add: — |
| git commit (lane) | 46.0 ms / 74.0 ms | — / — | — | git / commit: — |
| lead writes main | 5658 ms / 5658 ms | — / — | — | — |
| repack | 2632 ms / 2632 ms | — / — | — | — |
| pnpm install (incremental) | 3339 ms / 3339 ms | 2347 ms / 2347 ms | 1.42× | pnpm-reinstall / cold: — |
| pnpm refresh | 3018 ms / 3018 ms | 1908 ms / 1908 ms | 1.58× | pnpm-reinstall / steady: — |
| tsc -b | 6913 ms / 6913 ms | 3479 ms / 8049 ms | 1.99× | tsc-b / cold: — |
| vitest | 18250 ms / 18250 ms | 13947 ms / 13947 ms | 1.31× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.2 ms / 23.0 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4148872 B · fs.write ≤8 KiB 4725672 → 4148872 B · fs.write ≤64 KiB 4194304 → 4148872 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 2781032 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 3843992 B
**Host load (1-min, recorded, not waited on):** macOS 6.64 at the first command → 7.16 after the last (max 10.43 over 7 commands) · Docker VM 1.42 → 2.59

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-052.a1)

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

- **a1 (`p3-main-x`, daemon `32eda22d`): WATCH, terminal, after fix 072 (native first).** Checkpoint ok, git ✓. Node: 3 lane points P1–P5 pass, repair P6 pass. Control `control-052.a1` passes. Report check F1–F8 PASS.
- **Native first, fix 072.** The first native repair broke with `TS6310`. The cause: r052 adds typert's test fixture `tests/fixtures/type-model/`, whose folders have a package.json and a tsconfig.json each, and the whole build listed them as packages. Fixture folders are now skipped, and their files belong to the package around them. No earlier checkpoint has one. After the fix, `calibrate --repair` was ok, before the LayerFS attempt.
- **F-063 active:** chunk PREFIX 558 vs FULL 188 over 108 lane git Commits (104 with a PREFIX chunk).
- **Storage watch:**

  | | r52 | r51 |
  | --- | --- | --- |
  | Store | +41.9 MiB | +24.0 MiB |
  | `.git` stored | +10.8 MiB | +8.2 MiB |
  | Index rows | +11.5 MiB (446.2 → 457.7 MiB) | |

- **Watch rows:**
  - Speed: `fs.grep` 5–16 files, uncontended. Its p90 is 19.0 ms, 2.30× baseline, about 11 ms over and above the 5 ms floor. Its p50 is 5.46 ms (0.99×).
  - Thin classes, not judged: `sandbox.commit` 5–16 files (1.38×) and `fs.apply` >512 KiB (1.25×).
  - Scaling and Counters: 2 of 3 same-binary points.
  - Contended work: not judged yet.
- **Steps:**
  - Lead 3 s. Cuts 37 and 50: 35 s and 13 s. Lanes 92 s.
  - Repair 133 s (install 39.8, build 31.1, tests 3.8). Under the 170 s line.
  - Verify 19 s. Finish 57 s of the 90 s alarm.
  - Host load 6.6–10.4.
- **Pre-scan:**
  - `.gitignore` gains `.typert-*/` and oxlint-contract entries.
  - `subagent-subprocess` was added and removed within the range again.
  - 16 test-writer lines. They write to temporary or fixture paths; none showed up as a finding.
- **Snapshot:** 1,312.8 MiB new, 4.9 s (every range, fix 071).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2279/2279; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.grep 5–16 files · uncontended: 2.3× baseline (sdk.lines); not judged: sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (1.38×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.25×) (baseline class under 5 calls per range) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 32eda22d657d); also not judged: oneshot_exec: 2 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 32eda22d657d) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls with per-call SQL; SQL per call (sql.call) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.351 | < 0.5 | pass |
| Reinstall growth | 0.412× the raw bytes of 43 changed packages (ratio: 15699803 new stored for 38091349 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0269 (budget 0.184) | < 0.1 | pass |
| Range growth | 44.7 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 4885 ms for 1312.8 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.45 | < 0.8 | pass |
| Wall projection | 0.96 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 140 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 17 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.24× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 158 | 159 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1163 | 1043 |
| Workspaces (one-shot share) | 214 (0.99) | 87 (0.977) |
| Reads | 303 | 303 |
| Reconcile writes | 91 | 91 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `32eda22d657d` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 13 | 18.27 | 474.39 | 474.39 | 562.19 | 0.72× | 1.08× | — | — | 265 / 22,904 / 0 | — | 0.0768 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 17.19 | 17.19 | 17.19 | 28.26 | 1.19× | 1.19× | — | — | 207 / 15,840 / 0 | — | 0.3657 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 407.22 | 407.22 | 407.22 | 407.22 | 1.37× | 1.37× | — | — | 10,488 / 387,407 / 0 | — | 1.9768 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 400 | 19.96 | 40.28 | 73.38 | 439.47 | 0.95× | 0.99× | — | — | 296 / 33,701 / 0 | — | 0.1081 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.14 | 2.52 | 2.52 | 4.44 | 2.21× | 1.47× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.76 | 0.76 | 0.76 | 0.78 | 0.83× | 0.83× | — | — | 70 / 1,298 / 0 | — | 0.0382 ms per entrie | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 1.60 | 1.60 | 1.60 | 1.60 | 0.89× | 0.89× | — | — | 35 / 517 / 0 | — | 0.042 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 367.37 | 367.37 | 367.37 | 432.79 | 0.75× | 0.75× | — | — | 9,329 / 482,357 / 0 | — | 2.1113 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 6.05 | 6.05 | 6.05 | 6.05 | 1.00× | 1.00× | — | — | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 33.28 | 33.28 | 33.28 | 33.28 | 1.25× | 1.25× | — | — | 190 / 15,094 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 8 | 12.89 | 20.83 | 20.83 | 41.95 | 0.84× | 1.29× | — | — | 335 / 21,367 / 0 | — | 0.0469 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 9 | 10.03 | 11.08 | 11.08 | 44.59 | 1.45× | 1.05× | — | — | 136 / 6,767 / 0 | — | 0.0318 ms per byte | commit |
| fs.apply | ≤512 KiB · contended | 1 | 17.71 | 17.71 | 17.71 | 17.71 | no baseline | no baseline | — | — | 372 / 77,715 / 8,191 | — | 0.0002 ms per byte | commit |
| fs.apply | ≤512 KiB · uncontended | 1 | 10.68 | 10.68 | 10.68 | 10.68 | 0.64× | 0.64× | — | — | 123 / 6,104 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 2 | 7.45 | 7.45 | 7.45 | 7.64 | 1.04× | 0.77× | — | — | 121 / 5,373 / 0 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 4 | 8.94 | 10.44 | 10.44 | 11.67 | 0.63× | 0.27× | — | — | 129 / 5,824 / 0 | — | 0.0015 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 5 | 11.27 | 12.41 | 12.41 | 14.59 | 1.66× | 1.13× | — | — | 138 / 6,948 / 0 | — | 0.0095 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 4 | 8.09 | 10.94 | 10.94 | 16.55 | 0.91× | 0.94× | — | — | 254 / 14,123 / 0 | — | 0.0256 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 15 | 6.40 | 11.33 | 11.33 | 12.61 | 0.87× | 0.98× | — | — | 159 / 9,416 / 0 | — | 0.0201 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 2 | 7.47 | 7.47 | 7.47 | 8.38 | 0.79× | 0.59× | — | — | 220 / 9,062 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 12 | 7.54 | 11.06 | 11.06 | 12.71 | 0.83× | 0.90× | — | — | 176 / 9,428 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 3 | 8.63 | 8.63 | 8.63 | 17.56 | 1.19× | 0.80× | — | — | 207 / 11,698 / 0 | — | 0.0019 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 10 | 7.19 | 9.04 | 9.04 | 11.83 | 0.93× | 0.87× | — | — | 173 / 10,441 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.glob | 17–64 files · uncontended | 12 | 7.06 | 7.56 | 7.56 | 8.30 | 1.23× | 0.98× | — | — | 113 / 10,888 / 0 | — | 0.2705 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 5.11 | 5.11 | 5.11 | 7.50 | 1.56× | 1.25× | — | — | 38 / 3,303 / 0 | — | 2.4997 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 2.96 | 2.96 | 2.96 | 3.04 | 1.05× | 0.84× | — | — | 55 / 3,950 / 0 | — | 0.7408 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 5.13 | 5.13 | 5.13 | 5.13 | 1.44× | 1.23× | — | — | 202 / 15,539 / 0 | — | 0.3417 ms per file | — |
| fs.glob | 5–16 files · uncontended | 9 | 3.39 | 4.70 | 4.70 | 8.89 | 1.10× | 0.95× | — | — | 56 / 5,005 / 0 | — | 0.4523 ms per file | — |
| fs.glob | >64 files · contended | 4 | 3.41 | 8.72 | 8.72 | 9.21 | 0.65× | 1.15× | — | — | 85 / 5,610 / 0 | — | 0.0131 ms per file | — |
| fs.glob | >64 files · uncontended | 20 | 4.68 | 11.53 | 11.53 | 11.97 | 0.86× | 0.63× | — | — | 75 / 8,528 / 0 | — | 0.0299 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 3.70 | 3.70 | 3.70 | 3.70 | 1.27× | 1.27× | — | — | 73 / 3,396 / 0 | — | 3.696 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 8 | 9.96 | 24.75 | 24.75 | 25.23 | 0.89× | 1.90× | — | — | 248 / 12,362 / 0 | — | 0.4504 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 2.65 | 2.65 | 2.65 | 19.29 | 0.74× | 0.53× | — | — | 59 / 3,512 / 0 | — | 0.6613 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 1 | 2.74 | 2.74 | 2.74 | 2.74 | 0.72× | 0.56× | — | — | 56 / 3,420 / 0 | — | 1.372 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 12.02 | 12.02 | 12.02 | 12.02 | 2.13× | 2.13× | — | — | 232 / 13,097 / 0 | — | 1.7164 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 9 | 5.46 | 19.04 | 19.04 | 21.32 | 0.99× | 2.30× | — | — | 141 / 6,580 / 0 | — | 0.7746 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 6 | 27.72 | 34.15 | 34.15 | 38.22 | 1.14× | 1.40× | — | — | 721 / 28,832 / 0 | — | 0.1303 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 17 | 25.52 | 39.34 | 39.34 | 45.61 | 1.05× | 0.94× | — | — | 682 / 28,664 / 0 | — | 0.1318 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 4 | 6.63 | 6.87 | 6.87 | 12.14 | 1.39× | 1.18× | — | — | 82 / 14,792 / 0 | — | 0.1326 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 23 | 4.42 | 8.22 | 13.34 | 14.06 | 1.28× | 1.07× | — | — | 77 / 9,407 / 0 | — | 0.1155 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 3.47 | 3.47 | 3.47 | 3.47 | 1.07× | 1.05× | — | — | 46 / 3,233 / 0 | — | 0.8672 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 4 | 2.49 | 2.90 | 2.90 | 3.53 | 1.01× | 0.89× | — | — | 47 / 4,548 / 0 | — | 0.8313 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 3.53 | 3.53 | 3.53 | 4.87 | 1.04× | 0.64× | — | — | 57 / 5,578 / 0 | — | 0.3919 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 21 | 3.21 | 4.92 | 4.92 | 5.56 | 0.99× | 0.90× | — | — | 59 / 5,450 / 0 | — | 0.3467 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 3.31 | 3.31 | 3.31 | 3.31 | 0.83× | 0.76× | — | — | 75 / 4,513 / 0 | — | 0.0045 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 10 | 2.81 | 3.29 | 3.29 | 7.42 | 1.11× | 1.11× | — | — | 60 / 4,062 / 0 | — | 0.0036 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 2.36 | 2.36 | 2.36 | 2.36 | 0.72× | 0.66× | — | — | 49 / 3,550 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.82 | 2.82 | 2.82 | 3.08 | 0.98× | 0.90× | — | — | 42 / 2,834 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 5 | 3.45 | 4.00 | 4.00 | 5.49 | 1.04× | 0.76× | — | — | 67 / 5,141 / 0 | — | 0.0014 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 33 | 2.54 | 3.83 | 4.05 | 5.58 | 0.96× | 0.62× | — | — | 53 / 3,082 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 12 | 14.60 | 23.57 | 23.57 | 24.23 | 1.42× | 1.26× | — | — | 331 / 21,691 / 0 | — | 14.601 ms per file | commit |
| fs.rm | 1 files · uncontended | 42 | 10.02 | 12.54 | 12.88 | 17.21 | 1.11× | 0.89× | — | — | 156 / 8,603 / 0 | — | 10.019 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 3 | 3.61 | 3.61 | 3.61 | 16.55 | 1.27× | 1.27× | — | — | 62 / 3,857 / 0 | — | 0.0082 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 10 | 2.63 | 5.13 | 5.13 | 10.88 | 0.93× | 1.55× | — | — | 51 / 3,814 / 0 | — | 0.0069 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 3.16 | 3.16 | 3.16 | 3.16 | 1.34× | 1.34× | — | — | 48 / 2,643 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 2.14 | 2.14 | 2.14 | 2.14 | 0.87× | 0.87× | — | — | 36 / 2,742 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 3 | 3.24 | 3.24 | 3.24 | 9.31 | 1.34× | 1.05× | — | — | 58 / 3,798 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 9 | 2.40 | 4.67 | 4.67 | 7.57 | 0.85× | 1.30× | — | — | 41 / 3,237 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 2 | 2.13 | 2.13 | 2.13 | 2.59 | 0.77× | 0.69× | — | — | 48 / 3,996 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 18 | 2.28 | 2.92 | 2.92 | 3.83 | 0.95× | 0.94× | — | — | 48 / 3,564 / 0 | — | 0.0004 ms per byte | — |
| fs.write | >512 KiB · contended | 2 | 14.48 | 14.48 | 14.48 | 21.13 | 0.84× | 0.84× | — | — | 291 / 12,208 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 6 | 11.37 | 16.55 | 16.55 | 18.73 | 0.96× | 1.12× | — | — | 157 / 5,875 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 44 | 13.52 | 88.03 | 277.95 | 298.61 | 0.92× | 1.29× | — | — | 337 / 19,793 / 0 | — | 0.0275 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 108 | 8.42 | 16.14 | 21.00 | 26.95 | 1.10× | 1.04× | — | — | 165 / 7,262 / 0 | — | 0.0186 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 18 | 16.95 | 100.56 | 100.56 | 108.94 | 1.02× | 2.02× | — | — | 288 / 17,147 / 0 | — | 0.0002 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 37 | 11.71 | 17.08 | 18.65 | 44.82 | 1.04× | 0.94× | — | — | 167 / 7,918 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 68 | 15.55 | 46.66 | 67.45 | 195.98 | 1.09× | 1.61× | — | — | 353 / 19,279 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 187 | 8.42 | 15.91 | 24.52 | 27.80 | 1.01× | 1.00× | — | — | 155 / 6,023 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 133 | 13.50 | 32.47 | 53.02 | 72.52 | 1.18× | 0.92× | — | — | 318 / 18,552 / 0 | — | 0.0049 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 308 | 7.84 | 14.41 | 18.32 | 37.83 | 1.04× | 1.18× | — | — | 146 / 6,616 / 0 | — | 0.0028 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 1.12 | 1.12 | 1.12 | 1.12 | 1.64× | 1.64× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 24 | 34.94 | 61.46 | 62.80 | 73.91 | 1.21× | 1.36× | — | — | 329 / 32,735 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 85 | 27.79 | 56.18 | 100.34 | 257.34 | 1.11× | 1.13× | — | — | 307 / 25,850 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 6 | 3.45 | 6.07 | 6.07 | 7.10 | 0.87× | 0.95× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 34 | 3.69 | 8.21 | 10.54 | 11.63 | 1.08× | 1.38× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 6 | 17.10 | 20.39 | 20.39 | 43.37 | 1.60× | 1.10× | — | — | 151 / 5,464 / 0 | — | 17.104 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 16 | 8.67 | 12.73 | 12.73 | 14.28 | 1.01× | 1.10× | — | — | 112 / 4,221 / 0 | — | 8.674 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 846.97 | 846.97 | 846.97 | 846.97 | 3.27× | 3.27× | — | — | 17,335 / 674,779 / 0 | — | 846.965 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 9.43 | 22.72 | 22.72 | 25.09 | 0.82× | 1.56× | — | — | 125 / 5,241 / 0 | — | 4.715 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 13 | 11.60 | 15.61 | 15.61 | 15.67 | 1.12× | 0.84× | — | — | 156 / 8,036 / 0 | — | 4.0427 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 12.68 | 12.68 | 12.68 | 14.22 | 0.75× | 0.66× | — | — | 146 / 6,801 / 0 | — | 2.5358 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 3 | 21.29 | 21.29 | 21.29 | 29.76 | 1.38× | 1.30× | — | — | 455 / 21,519 / 0 | — | 4.0638 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 118.88 | 118.88 | 118.88 | 118.88 | 1.29× | 1.29× | — | — | 1,797 / 181,737 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 104.78 | 1287.94 | 1287.94 | 15641.25 | 1.11× | 1.07× | — | — | 1,142 / 58,130 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 179 | 609.08 | 918.22 | 6249.59 | 6624.18 | 1.06× | 0.93× | — | — | — | 4485.30 | — | — |
| sandbox.exec | 0 files · uncontended | 170 | 32.40 | 653.40 | 1256.75 | 8176.41 | 0.93× | 0.96× | — | — | — | 4,590 | — | — |
| sandbox.exec | 1 files · contended | 26 | 36.02 | 59.35 | 65.33 | 98.47 | 0.95× | 1.12× | — | — | — | 4.70 | 36.024 ms per file | — |
| sandbox.exec | 1 files · uncontended | 48 | 29.97 | 42.38 | 46.28 | 47.72 | 0.82× | 0.68× | — | — | — | 4 | 29.974 ms per file | — |
| sandbox.exec | 17–64 files · contended | 1 | 65.98 | 65.98 | 65.98 | 65.98 | 1.00× | 0.95× | — | — | — | 84 | 3.8815 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 7 | 68.61 | 72.70 | 72.70 | 88.79 | 1.02× | 0.97× | — | — | — | 92 | 3.4306 ms per file | — |
| sandbox.exec | 2–4 files · contended | 26 | 41.03 | 56.95 | 59.07 | 59.85 | 1.15× | 0.94× | — | — | — | 9 | 15.3767 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 43 | 36.21 | 70.38 | 106.14 | 109.83 | 0.97× | 1.06× | — | — | — | 12.30 | 13.049 ms per file | — |
| sandbox.exec | 5–16 files · contended | 16 | 50.78 | 69.49 | 69.49 | 206.46 | 1.18× | 0.98× | — | — | — | 30.30 | 9.4694 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 19 | 62.11 | 79.25 | 79.25 | 102.06 | 1.46× | 1.17× | — | — | — | 32.80 | 7.1726 ms per file | — |
| sandbox.exec | — · contended | 12 | 10482.31 | 33107.76 | 33107.76 | 33340.97 | 3.18× | 1.12× | — | — | — | 51458.80 | — | — |
| sandbox.exec | — · uncontended | 29 | 442.41 | 16353.40 | 31067.77 | 39822.22 | 1.40× | 0.88× | — | — | — | 46166.70 | — | — |
| sandbox.mount | — · contended | 52 | 11.01 | 21.19 | 24.68 | 26.55 | 1.08× | 1.27× | — | — | 54 / 1,524 / 82 | — | — | sandbox.mount.bind |
| sandbox.mount | — · uncontended | 152 | 9.94 | 15.29 | 20.86 | 29.77 | 0.99× | 0.86× | — | — | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.56 | 3.80 | 3.80 | 42.67 | 0.71× | 0.52× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 41 | 13.04 | 23.03 | 23.23 | 26.96 | 1.02× | 1.06× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 163 | 12.19 | 22.74 | 125.53 | 204.58 | 0.90× | 0.92× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 13 | 0.0 KiB | 699.4 KiB | 3,029 | ok 13 |
| branch.diff_commits | branch | 408 | 0.0 KiB | 22.4 MiB | 75,718 | ok 408 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.5 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 43 | 1.8 MiB | 0.0 KiB | 54 | Committed 43 |
| fs.diff_files | fs | 51 | 0.0 KiB | 392.4 KiB | 42 | Text 38, NoSuchPath 9, Equal 4 |
| fs.glob | fs | 61 | 0.0 KiB | 66.5 KiB | 881 | ok 61 |
| fs.grep | fs | 55 | 0.0 KiB | 277.5 KiB | 950 | ok 55 |
| fs.list | fs | 67 | 0.0 KiB | 371.2 KiB | 2,600 | ok 67 |
| fs.read | fs | 58 | 0.0 KiB | 185.8 KiB | 58 | ok 58 |
| fs.rm | fs | 54 | 0.0 KiB | 0.0 KiB | 54 | Committed 54 |
| fs.stat | fs | 55 | 0.0 KiB | 12.1 KiB | 55 | ok 55 |
| fs.write | fs | 911 | 18.3 MiB | 0.0 KiB | 911 | Committed 911 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 211 | 0.0 KiB | 0.0 KiB | 0 | Committed 170, UpToDate 40, Conflict 1 |
| sandbox.exec | sandbox | 586 | 2.3 MiB | 6.0 MiB | 0 | exit:0 584, exit:2 2 |
| sandbox.mount | sandbox | 214 | 0.0 KiB | 0.0 KiB | 0 | Mounted 214 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 214 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 214 |

### C. Scale probes

Binary: daemon `32eda22d657d`.

Load average (1-min, runner (Docker VM kernel)): start 1.42 · end 2.59.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.315 | 13.294 · 1.315 · 1.05 · 1.304 · 1.649 | 3.11–3.11 | statements 31, vm_steps 1034, fullscan_steps 0, sorts 0, returned_rows 87 |
| read | 1.17 | 1.349 · 1.034 · 1.154 · 1.269 · 1.17 | 3.11–3.11 | statements 18, vm_steps 752, fullscan_steps 0, sorts 0, returned_rows 74 |
| list_small | 0.984 | 1.173 · 0.984 · 0.951 · 0.939 · 0.985 | 3.11–3.11 | statements 18, vm_steps 761, fullscan_steps 0, sorts 0, returned_rows 74 |
| list_largest | 10.158 | 12.486 · 10.558 · 10.158 · 10.13 · 10.04 | 3.11–3.11 | statements 180, vm_steps 25956, fullscan_steps 0, sorts 0, returned_rows 2559 |
| grep_scoped | 1.129 | 1.588 · 1.195 · 1.129 · 1.067 · 1.052 | 3.11–3.11 | statements 23, vm_steps 907, fullscan_steps 0, sorts 0, returned_rows 83 |
| glob_scoped | 1.252 | 5.938 · 1.308 · 1.209 · 1.252 · 0.988 | 3.11–3.11 | statements 17, vm_steps 740, fullscan_steps 0, sorts 0, returned_rows 73 |
| grep_tree | 5653.623 | 5841.923 · 5653.623 · 5642.41 · 5679.925 · 5623.513 | 2.56–3.18 | statements 64077, vm_steps 4739449, fullscan_steps 0, sorts 0, returned_rows 471408 |
| glob_tree | 8.412 | 9.954 · 8.279 · 8.417 · 8.412 · 8.236 | 2.56–2.56 | statements 131, vm_steps 20767, fullscan_steps 0, sorts 0, returned_rows 2133 |
| diff_files | 4.333 | 4.543 · 4.254 · 4.333 · 4.4 · 4.315 | 2.56–2.56 | statements 84, vm_steps 4324, fullscan_steps 0, sorts 0, returned_rows 438 |
| list_commits | 0.81 | 1.249 · 0.745 · 0.815 · 0.7 · 0.81 | 2.56–2.56 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.101 | 3.426 · 2.441 · 2.101 · 1.986 · 2.025 | 2.56–2.56 | statements 62, vm_steps 2517, fullscan_steps 0, sorts 0, returned_rows 300 |
| fork | 0.632 | 1.017 · 0.395 · 0.903 · 0.406 · 0.632 | 2.56–2.56 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 29.909 | 27.509 · 28.527 · 29.909 · 34.762 · 31.898 | 2.56–2.56 | statements 508, vm_steps 24702, fullscan_steps 0, sorts 0, returned_rows 1958 |
| oneshot_mount_unmount | 15.25 | 28.446 · 15.25 · 16.591 · 14.974 · 14.317 | 2.56–2.56 | statements 65, vm_steps 2254, fullscan_steps 82, sorts 2, returned_rows 223 |
| oneshot_commit | 60.431 | 74.954 · 60.431 · 58.162 · 64.419 · 56.962 | 2.56–2.56 | statements 188, vm_steps 12324, fullscan_steps 82, sorts 2, returned_rows 985 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.56–2.56 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r052: 391,122 pages of 4,096 B, 0 free · Commits 63,402 · Branches 1,309 · Layers 63 · compression 3.66× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 204,835 | 1.24 GiB |
| 2 | 71,326 | 1.08 GiB |
| 3 | 17,486 | 6.7 MiB |
| 4 | 52 | 10.3 KiB |
| 5 | 17,367 | 1.8 MiB |
| 6 | 172,626 | 831.6 MiB |
| 7 | 480,393 | 117.8 MiB |
| 8 | 1,446 | 419.4 KiB |
| 9 | 135,184 | 297.2 MiB |
| 10 | 68,050 | 8.4 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,472 | 203.1 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 65,227 | 137.0 MiB |
| 1 | 69,852 | 859.6 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 266,725 | 1.02 GiB | 37.3 MiB |
| inode_value | 74,492 | 291.0 MiB | 5.7 MiB |
| binding_hint | 22,504 | 87.9 MiB | 8.2 MiB |
| object_location | 16,075 | 62.8 MiB | 6.6 MiB |
| commit | 5,272 | 20.6 MiB | 3.3 MiB |
| file_digest | 1,612 | 6.3 MiB | 723.8 KiB |
| commit_lineage | 1,367 | 5.3 MiB | 636.1 KiB |
| commit_runs | 1,331 | 5.2 MiB | 687.2 KiB |
| commit_identity | 960 | 3.8 MiB | 361.5 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 57 | 228.0 KiB | 36.5 KiB |
| branch_names | 21 | 84.0 KiB | 14.1 KiB |
| branch_identity | 16 | 64.0 KiB | 12.7 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| run_merges | 7 | 28.0 KiB | 5.4 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 4.9 KiB |
| layers_source | 3 | 12.0 KiB | 6.5 KiB |
| layers_child | 3 | 12.0 KiB | 6.5 KiB |
| absorbed_heights | 3 | 12.0 KiB | 4.7 KiB |

### E. Stage times

**Time 344.9 s** (tooling): play 132.1 · consolidate 130.3 · verify 28.3 · probes 29.5 · tests 0.0 · seal + snapshot 11.6 · report 13.1

344.87 s tooling: prepare 1.57 · play 130.55 · consolidate 130.31 · verify 16.29 (diff_commits + full compareTree) · version walk 12.01 · probes 29.50 · metrics 0.74 · seal 1.27 · sealed figures 5.38 · snapshot copy 4.93 · report 0.47

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 32eda22d657d10ba2b419652882f2be41fd2b99cbf38e3eeb32d39a19dc16d88 | 2026-10-20T08:49:07.302Z | watch | Speed: fs.grep 5–16 files · uncontended: 2.3× baseline (sdk.lines); not judged: sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (1.38×), fs.apply >512 KiB · uncontended: 1/1/1 calls (1.25×) (baseline class under 5 calls per range); Scaling: insufficient same-binary points: 2 of 3 (daemon 32eda22d657d); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: insufficient same-binary points: 2 of 3 (daemon 32eda22d657d); Contended work: not judged: no contended class has 3 ranges of 5+ calls with per-call SQL; SQL per call (sql.call); Range growth: 44.7 MiB; median not judged: 1 of 3 earlier ranges; Snapshot time: 4885 ms for 1312.8 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-052.a1.json`
- trace `~/lfs-history/runs/p3-main-x/trace/range-052.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-x/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-052.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r052-1-root | 310 | 596.4 KiB |
| r052-2-packages-hooks | 721 | 605.3 KiB |
| r052-3-agents-notes | 763 | 601.0 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 425.0 | 4,857 |
| `git diff --stat` | 41.0 | 4,848 |
| `git add -f` | 43.0 | — |
| `git rm --cached` | 10.0 | — |
| `git commit` | 46.0 | 4,852 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r052-1-root | end | P1 | pass | — | — |
| r052-1-root | end | P2 | pass | exit 0 | — |
| r052-1-root | end | P3 | n/a | an install, not a refresh | — |
| r052-1-root | end | P4 | pass | 148 emitted files, exit 0 | — |
| r052-1-root | end | P5 | pass | 28 files | — |
| r052-1-root | end | P6 | n/a | not a repair | — |
| r052-3-agents-notes | end | P1 | pass | — | — |
| r052-3-agents-notes | end | P2 | pass | exit 0 | — |
| r052-3-agents-notes | end | P3 | pass | 283 bookkeeping path(s) | — |
| r052-3-agents-notes | end | P4 | pass | 211 emitted files, exit 2 | — |
| r052-3-agents-notes | end | P5 | pass | 68 files | — |
| r052-3-agents-notes | end | P6 | n/a | not a repair | — |
| r052-2-packages-hooks | end | P1 | pass | — | — |
| r052-2-packages-hooks | end | P2 | pass | exit 0 | — |
| r052-2-packages-hooks | end | P3 | pass | 283 bookkeeping path(s) | — |
| r052-2-packages-hooks | end | P4 | pass | 630 emitted files, exit 2 | — |
| r052-2-packages-hooks | end | P5 | pass | 148 files | — |
| r052-2-packages-hooks | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2271 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
