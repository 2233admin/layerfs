# Range 044 · **optimize** · attempt 2

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r043 (live Store)
dsh `22e3327f6`..`b85c453e2` · **60 commits** (10 mainline, 50 side) · 2026-07-27 → 2026-07-28
Areas changed: `packages/ui` 13% · `/` 11% · `.agents/notes` 8% · other 67%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.22×** · **Churn 0.00**
**Time split:** play 87.7 s · git 102.7 s · Node 173.6 s · verify 13.8 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **798.1 MiB** (+3.3 MiB) | **1.23 GiB** (+30.7 MiB) | **1.57×** (prev 1.54×) | **36.4 MiB** | **1,240** (total 52,850) | **265.0 s** tooling (total 143.5 min) |

**Checks:** 15 pass · 2 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.91× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.351) and statements per entry does not rise (0.027): the fixed and per-entry parts cannot be separated · 2 optimize/stop: Counters, Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ probe list_largest +49% · ▲ fs.write p95 +47% · ▼ probe fork −44%
**Budget:** 45 of 202 ranges · projected total 15.5 h (budget 16.8 h) · disk 42% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,499 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 2 publishes |
| Steps | 2,328 / 2,328 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2939 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 412 bin shims, 4453 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (51 lines from 3 .gitignore files) · **78 picks** in 3 merges (78 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `b85c453e2`** · 122 commits written for 122 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 12 untracked, unignored (36,476 B), 1 folders (`packages/subagent/subagent-subprocess`) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 78 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r044-1-root | end | `6d67f5cd5478` | `55fc911990b0` | pass (411 normalized) | pass | n/a | pass | pass | n/a |
| r044-2-agents-notes | end | `4f371823648f` | `f11b090f83f2` | pass (408 normalized) | pass | pass | pass | n/a | n/a |
| r044-3-packages-ui | end | `b8b0b43bbd25` | `f11b090f83f2` | pass (408 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `7a60ce167f41` | `null` | n/a | pass | n/a | n/a | pass | pass (137,578 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/plan-mode.spec.ts` (fails natively) · `packages/plan/plan-mode/tests/integration.spec.ts` (fails natively) · `packages/examples/tui-demo/tests/tui-agent.spec.ts` (fails natively) · `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/ui/tui/tests/xml-tool-output.spec.ts` (fails natively) · `packages/subagent/subagent/tests/out-of-process.spec.ts` (fails natively) · `packages/core/scope/tests/invariant.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli-demo.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/sdk/helper/tests/project.spec.ts` (fails natively) · `packages/examples/cli-demo/tests/cli.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively) · `packages/core/agent-loop/tests/request-recovery.spec.ts` (fails natively).

## 2. Activity

**3,088 calls** · **163 steps** by **7 agents + lead** on **3 Branches + main** · **212 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +245 added · 865 modified · −70 deleted · 19.2 MiB written · fs 1,084 : Sandbox 96 (**11 : 1**, reported only in P3)
**Execs:** 553 (JS 61 · shell 492) · 3 non-zero exits · install 0 · test runs 3 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,441 | 1,097 | 344 | Committed 1,097 · Text 35 · NoSuchPath 16 · Equal 1 |
| sandbox | 1,189 | 761 | 4 | commit 208 (Committed 158, UpToDate 49, Conflict 1) · exec 553 (exit:0 550, exit:2 3) · mount 212 (Mounted 212) · status 4 · unmount 212 (Unmounted 212) |
| branch | 449 | 33 | 416 | diff_branches 11 · diff_commits 405 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 2 (Added 2) |
| project | 8 | 0 | 8 | list_commits 8 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,088** | **1,891** | **773** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r044-1-root | a01 a02 | 45 | 357 | ✓ | ✓ |
| r044-2-agents-notes | a03 a04 a05 | 55 | 345 | ✓ | — |
| r044-3-packages-ui | a06 a07 | 56 | 361 | ✓ | — |
| main | lead | 7 | 177 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r044-1, a02 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r044-1, a01 a02 | merged cleanly |
| Decoy edit | 1 / 1 | r044-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r044-2 vs r044-1 publish | 2.7 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r044-1 | 19 | 10 | 9 | 0 | 0 | 168 | commit-conflict, stale-clean-merge, decoy |
| a02 | r044-1 | 26 | 9 | 17 | 0 | 0 | 189 | commit-conflict, stale-clean-merge, decoy |
| a03 | r044-2 | 19 | 6 | 13 | 0 | 0 | 127 | — |
| a04 | r044-2 | 19 | 7 | 12 | 0 | 0 | 102 | — |
| a05 | r044-2 | 17 | 9 | 8 | 0 | 0 | 116 | — |
| a06 | r044-3 | 23 | 9 | 14 | 0 | 0 | 91 | — |
| a07 | r044-3 | 33 | 16 | 17 | 0 | 0 | 270 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 177 | merge-race |
| **Total** |  | **163** | **67** | **90** | **6** | **0** | **1,240** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 111 · pnpm 1 · tsc 3 · vitest 3 · other 435

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r044-3-packages-ui | 38 | 38 | 38 | 4 | 38 | 662 |
| r044-2-agents-notes | 40 | 40 | 40 | 1 | 40 | 697 |
| r044-1-root | 26 | 26 | 26 | 4 | 26 | 439 |
| **lead** | — | — | — | — | 122 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r044-1-root | 1 | 0 | 1 | 1 | 17 | 17 / 17 |
| r044-2-agents-notes | 0 | 1 | 1 | 0 | 0 | — / — |
| r044-3-packages-ui | 0 | 1 | 1 | 1 | 39 | 39 / 39 |
| **lead repair** | 1 | — | 1 | — | — | 137,578 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r043) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 794.8 MiB (23.7 MiB / 656.4 MiB / 21.6 MiB / 93.1 MiB) | 798.1 MiB (24.5 MiB / 656.0 MiB / 22.3 MiB / 95.2 MiB) | +3.3 MiB |
| Version figures from | — | full: first (no manifest for range 43) | — |
| Files / directories / symlinks | 63,623 / 9,764 / 4,430 | 63,969 / 9,818 / 4,461 | +346 / +54 / +31 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.20 GiB | 1.23 GiB | +30.7 MiB |
| **Space amplification** (total · tracked) | 1.54× · tracked 5.08× | 1.57× · tracked 4.90× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.28** (0.90 / 0.16 / 1.41) | 1.14× the median range |
| **Stored per Commit** | 29.3 KiB | 38.9 KiB | — |
| Metadata share | 0.42 | 0.42 | this range 0.44 |
| History: Commits / Layers / Branches | 51,610 | 52,850 / 28 / 579 | +1,240 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.67 GiB (Commits 8.49 GiB · installs 871.9 MiB · build 100.7 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 40.65 GiB / 42% | — |
| Snapshot | — | r044, 1.07 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 726.9 MiB | 0.91 | +17.0 MiB |
| Metadata | 111.5 MiB | 0.14 | +3.4 MiB |
| Index rows | 354.7 MiB | 0.44 | — |
| Waste | 59.8 MiB | 0.07 | — |
| Other | 1.5 MiB | 0.00 | — |
| **Total = Store on disk** | **1.23 GiB** | **= 1.57** space amplification | +30.7 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 24.5 MiB | 120.2 MiB (65.4 MiB + 54.9 MiB) | 4.90× | — | 2.5 MiB | 5.0 MiB | 0.50 |
| `node_modules` | 656.0 MiB | 212.2 MiB (187.1 MiB + 25.1 MiB) | 0.32× | — | 1.4 MiB | 5.8 MiB | 0.25 |
| Build output | 22.3 MiB | 21.8 MiB (20.2 MiB + 1.6 MiB) | 0.98× | — | 1.2 MiB | 8.2 MiB | 0.15 |
| `.git` | 95.2 MiB | 428.9 MiB (410.9 MiB + 18.0 MiB) | 4.50× | — | 15.1 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 416.1 MiB | — (not divided) | — | 26.8 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 55.3 MiB | — | — | — | — | — |
| **Total** | — | **1.23 GiB** | **= 1.57×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 176,188 | +4,390 | 6.3 KiB | 0 (derived) | 51% |
| Chunks (large files) | 61,624 | +1,041 | 15.5 KiB | — | 12% |
| Large-file extents | 16,228 | — | 0.3 KiB | — | — |
| Directories | 368,540 | 4,808 (with inodes, pooled) | 0.3 KiB | — | 59% |
| Inodes and attributes | 336,503 | ↑ pooled | 2.8 KiB | — | — |
| Symlinks | 2,421 | +4,489 | 0.1 KiB | — | — |

Delta: 2.6% at depth cap · 26% of refused bases stopped by budget · `node_modules` reinstall: 0.392× the raw bytes of 23 changed packages (ratio: 1427863 new stored for 3644683 raw)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.90× (120.2 MiB for 24.5 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.5 KiB / 5.0 KiB / 9.5 KiB over 226 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.22× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.7 MiB stored for 1.92 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.52 (3 lanes × 798.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.5 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.4 ms / 27.8 ms (0.95×) | 2.3 ms / 4.0 ms (1.05×) | 2.8 ms / 6.1 ms (1.66×) | 18.4 ms / 49.5 ms (1.09×) | 9.1 ms / 13.3 ms (0.78×) | 166 ms / 166 ms (1.81×) | — (native comparison in P3; exec 37.4 ms / 904 ms) |
| SQL p50: 223 stmts | 52 stmts | 63 stmts | 203 stmts | 45 stmts | 4,785 stmts | — |

**Commit cost:** 7.33 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 683 ms p50 over 212
**Slowest:** sandbox.exec 34727 ms · sandbox.exec 26960 ms · sandbox.exec 25937 ms · checkpoint diff_commits 0.09 ms and 1.52 statements per entry (74,503 entries per page)
**Scaling:** 13 of 15 probes flat · `list_largest` 0.21 · `grep_tree` 0.23

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 349 ms / 349 ms | — / — | — | git / status-cold: — |
| git status (steady) | 421 ms / 601 ms | — / — | — | git / status-steady: — |
| git add | 34.0 ms / 96.0 ms | — / — | — | git / add: — |
| git commit (lane) | 38.0 ms / 64.0 ms | — / — | — | git / commit: — |
| lead writes main | 4066 ms / 4066 ms | — / — | — | — |
| repack | 2146 ms / 2146 ms | — / — | — | — |
| pnpm install (incremental) | 2874 ms / 2874 ms | 1719 ms / 1719 ms | 1.67× | pnpm-reinstall / cold: — |
| pnpm refresh | 1352 ms / 1352 ms | 837 ms / 837 ms | 1.62× | pnpm-reinstall / steady: — |
| tsc -b | 6965 ms / 6965 ms | 4606 ms / 5563 ms | 1.51× | tsc-b / cold: — |
| vitest | 4322 ms / 4322 ms | 2738 ms / 2738 ms | 1.58× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.1 ms / 18.8 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4177712 → 4194304 B · fs.write ≤8 KiB 4177712 → 4194304 B · fs.write ≤64 KiB 4177712 → 4194304 B · fs.read ≤8 KiB 4177712 → 4194304 B · sandbox.mount 4177712 → 3015872 B · sandbox.commit 1 file (Committed) 4177712 → 4181832 B · branch.merge 45352 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 4.70 at the first command → 4.58 after the last (max 4.80 over 2 commands) · Docker VM 1.38 → 1.86

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-044.a2)

## 5. Findings and action

### Finding 044.a1 · stop

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Correctness | tree 0 missing, 0 extra, 0 content, 0 mode; steps 2309/2310; conflicts 4/4; tests 0/0 equal to native | all |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.863 over 14 ranges | < 0.05 (SQL work against tree size) |
| Git | git status not clean at the checkpoint | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard |

Diagnosis pending: `finding-044.a1.json`.

### Finding 044.a2 · optimize

**1. Trigger** (attempt 2, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.778 over 14 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-044.a2.json`.

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

- **a1 (`p3-main-v`, live after r43 a1; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): STOP at the lead's git check, harness cause (fix 060).** `git status --porcelain` listed `?? packages/subagent/subagent-subprocess/` at the checkpoint. The play, lanes and merge completed; the repair did not run.
- **Cause:** the range's agents add `packages/subagent/subagent-subprocess` and remove it again. The plan split it over two lanes: the root lane writes and removes its `package.json`, and `r044-3-packages-ui` writes its sources. That lane's `tsc -b` of `subagent-acp` (TS6059 rootDir errors) emitted `.js`, `.d.ts` and `.map` files into the folder's `src/`. After the reconcile removed the sources, the folder has no tracked file. Decision B's `git clean -f` (no `-d`) cleaned 0 files, because its list drops a wholly untracked folder. Not a LayerFS finding: the native side kept the same files.
- **Fix 060:** part 1 (`45ea9ee411`, found native-first before this attempt) makes the repair clean remove `packages/<group>/<name>` folders the checkpoint does not track. Part 2 (`931adedc70`, liaison ruling 2026-10-20) changes the lead's clean to `git clean -f -d`, still without `-x`, and the native clean to match. Both sides record the removed folders.
- a2 replays r44 on a fork of `p3-main-v`'s r043 snapshot.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 4.9–5.8.
- **a2 (`p3-main-w`, a fork of `p3-main-v`'s r042 snapshot with r43 replayed in fast mode as setup, chain set to `p3-main-v`'s r43 native state; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded), after fix 060.** Checkpoint ok, git ✓. Node: 16 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (2,028 emitted). Control `control-044.a2` passes. Report check F1–F8 PASS. r43 has no snapshot (snapshots are even ranges), hence the r42 fork.
- **Fix 060's `-d` clean** removed 12 files (36,476 B) and 1 folder, `packages/subagent/subagent-subprocess`: the a1 cause, a lane's emitted tsc output in a package added and removed within the range. No checkpoint tracked a file there (neither r43's nor r44's). The native clean removed the same 12 files and folder. Fix 058 exempted `.sessions/session-query.db`.
- **Optimize rows, recorded, not acted on (fast mode):**
  - Counters `merge.returned_rows` (chain-bounded): 2,513 vs 1,941 (1.295×), as in r41–r43.
  - New: Contended work `fs.write ≤1 KiB · contended`, SQL VM steps against tree files, exponent 1.778 over 14 ranges. The contended counters are process-wide: they include the concurrent Commit or merge, as for contended `fs.rm` (#367).
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 14.91×). Merge p50 166 ms (1.81×, below r23–r43's band). One-shot Commit 1.09×, write 0.95× (9.4 ms), mount 0.78×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 4.2–6.8.
- Final steps: lead 3 s; lanes 17 s + 12 s + 13 s + 8 s + 52 s (cuts at plan orders 17, 30, 41 and 50); repair 109 s (alarm 200 s); verify 17 s; finish 45 s. Repair install 34.7 s, build 21.9 s, tests 3.2 s.
- Watch items: index rows 354.7 MiB (#366). `fs.rm` uncontended p50 6.23 ms per file over 48 calls, 132 statements and 6,991 VM steps per call, back at the r36–r38 level: no notes-directory removes this range (the fix 059 cause). Contended 13.24 ms over 22 (332 statements, process-wide; #367).

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2328/2328; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.91× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.351) and statements per entry does not rise (0.027): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.778 over 14 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.442 | < 0.5 | pass |
| Reinstall growth | 0.392× the raw bytes of 23 changed packages (ratio: 1427863 new stored for 3644683 raw) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0259 (budget 0.2553) | < 0.1 | pass |
| Range growth | 36.4 MiB, 1.07× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 2992 ms for 1097.5 MiB new; size exponent -0.825 | < 0.15 | pass |
| Disk projection | 0.42 | < 0.8 | pass |
| Wall projection | 0.92 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 122 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 78 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.22× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 163 | 163 |
| Lanes / agents | 3 / 7 | 3 / 7 |
| LayerFS Commits | 1240 | 1126 |
| Workspaces (one-shot share) | 212 (0.99) | 89 (0.978) |
| Reads | 298 | 298 |
| Reconcile writes | 170 | 170 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 123.90 | 123.90 | 123.90 | 123.90 | 1.60× | 1.60× | -3.05 | -2.01 | 5,879 / 165,686 / 0 | — | 0.5184 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 10 | 16.04 | 345.78 | 345.78 | 346.68 | 0.99× | 6.68× | -0.55 | -0.31 | 243 / 25,532 / 0 | — | 0.0663 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 6.66 | 6.66 | 6.66 | 6.66 | no baseline | no baseline | -4.39 | -9.21 | 98 / 6,202 / 0 | — | 0.3915 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 399 | 18.29 | 33.23 | 46.03 | 328.28 | 1.06× | 1.28× | -0.26 | -0.19 | 293 / 33,865 / 0 | — | 0.1008 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 0.71 | 2.05 | 2.05 | 3.10 | 0.78× | 1.56× | -1.19 | -0.87 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 1 | 0.89 | 0.89 | 0.89 | 0.89 | no baseline | no baseline | -0.29 | -0.24 | 70 / 1,298 / 0 | — | 0.0447 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 166.26 | 166.26 | 166.26 | 365.28 | 1.81× | 1.81× | -0.85 | -0.37 | 4,785 / 357,340 / 0 | — | 1.9327 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.36 | 1.36 | 1.36 | 1.36 | 0.88× | 0.88× | -0.45 | -0.39 | 35 / 517 / 0 | — | 0.0073 ms per entrie | — |
| branch.publish | — · uncontended | 2 | 2.22 | 2.22 | 2.22 | 4.05 | 0.44× | 0.44× | -3.42 | -2.66 | 50 / 1,042 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 32.28 | 32.28 | 32.28 | 32.28 | 1.33× | 1.33× | -0.01 | 0.01 | 188 / 15,260 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 1 | 19.51 | 19.51 | 19.51 | 19.51 | 1.65× | 1.44× | 0.43 | 0.53 | 589 / 94,893 / 8,191 | — | 0.8867 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 3 | 8.76 | 8.76 | 8.76 | 9.41 | 1.43× | 1.18× | -0.24 | -0.12 | 173 / 9,190 / 0 | — | 0.0192 ms per byte | commit |
| fs.apply | ≤512 KiB · contended | 1 | 29.12 | 29.12 | 29.12 | 29.12 | no baseline | no baseline | — | — | 899 / 114,287 / 8,191 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 9 | 12.42 | 20.95 | 20.95 | 23.76 | 1.35× | 1.35× | -5.52 | -3.99 | 371 / 49,284 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 5.30 | 5.30 | 5.30 | 5.30 | 0.77× | 0.55× | -0.01 | 0.16 | 117 / 4,214 / 0 | — | 0.0003 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 12 | 18.29 | 20.50 | 20.50 | 35.13 | 1.83× | 1.19× | -0.08 | -0.01 | 449 / 82,742 / 8,191 | — | 0.0068 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 9 | 8.55 | 10.69 | 10.69 | 11.97 | 1.31× | 0.99× | -0.35 | -0.07 | 140 / 9,061 / 0 | — | 0.0027 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 5 | 7.23 | 7.59 | 7.59 | 8.06 | 1.01× | 0.88× | -0.11 | -0.10 | 206 / 8,365 / 0 | — | 0.0206 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 21 | 6.35 | 7.87 | 7.87 | 8.62 | 1.09× | 0.98× | -0.36 | -0.28 | 157 / 7,079 / 0 | — | 0.0218 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 11 | 7.22 | 9.20 | 9.20 | 9.40 | 1.16× | 1.00× | -0.84 | -0.47 | 186 / 8,794 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 6 | 8.35 | 10.17 | 10.17 | 11.84 | 1.38× | 1.57× | -0.62 | -0.34 | 275 / 12,597 / 0 | — | 0.0028 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 4 | 5.34 | 6.67 | 6.67 | 6.71 | 0.72× | 0.83× | -0.82 | -0.60 | 121 / 5,844 / 0 | — | 0.0047 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 2 | 1.82 | 1.82 | 1.82 | 1.91 | 1.35× | 1.24× | -0.83 | -0.52 | 35 / 2,532 / 0 | — | 1.823 ms per file | — |
| fs.glob | 17–64 files · contended | 1 | 2.78 | 2.78 | 2.78 | 2.78 | 1.00× | 1.00× | -0.97 | -0.76 | 68 / 5,052 / 0 | — | 0.1208 ms per file | — |
| fs.glob | 17–64 files · uncontended | 5 | 5.99 | 6.26 | 6.26 | 6.96 | 2.12× | 1.65× | 0.30 | 0.25 | 111 / 11,800 / 0 | — | 0.1331 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 1.71 | 1.71 | 1.71 | 1.71 | 0.94× | 0.94× | 1.14 | 0.79 | 38 / 3,045 / 0 | — | 0.4263 ms per file | — |
| fs.glob | 2–4 files · uncontended | 6 | 2.67 | 2.75 | 2.75 | 3.78 | 1.52× | 1.42× | 0.41 | 0.28 | 46 / 3,495 / 0 | — | 0.918 ms per file | — |
| fs.glob | 5–16 files · contended | 3 | 1.91 | 1.91 | 1.91 | 4.29 | 1.14× | 1.14× | -0.43 | -0.28 | 40 / 2,807 / 0 | — | 0.3582 ms per file | — |
| fs.glob | 5–16 files · uncontended | 10 | 2.20 | 2.93 | 2.93 | 3.19 | 1.09× | 1.28× | 0.08 | 0.07 | 45 / 3,563 / 0 | — | 0.2531 ms per file | — |
| fs.glob | >64 files · contended | 5 | 3.72 | 20.22 | 20.22 | 41.81 | 0.69× | 3.74× | -1.40 | -1.17 | 134 / 10,560 / 0 | — | 0.0168 ms per file | — |
| fs.glob | >64 files · uncontended | 16 | 5.47 | 12.73 | 12.73 | 43.27 | 0.56× | 0.91× | -1.19 | -1.11 | 83 / 13,359 / 0 | — | 0.0244 ms per file | — |
| fs.grep | 17–64 files · contended | 2 | 6.75 | 6.75 | 6.75 | 18.55 | 1.13× | 1.13× | -1.08 | -0.82 | 172 / 12,284 / 0 | — | 0.1499 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 6 | 9.68 | 11.61 | 11.61 | 14.54 | 1.68× | 1.94× | 0.96 | 0.60 | 249 / 11,519 / 0 | — | 0.2308 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 2.00 | 2.00 | 2.00 | 2.12 | 0.51× | 0.50× | -0.69 | -0.53 | 42 / 2,869 / 0 | — | 0.6677 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 5 | 2.94 | 3.17 | 3.17 | 11.60 | 1.27× | 0.99× | 0.68 | 0.47 | 74 / 4,477 / 0 | — | 1.469 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 3.69 | 3.69 | 3.69 | 3.69 | 1.24× | 0.73× | 0.24 | 0.18 | 63 / 3,331 / 0 | — | 0.737 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 11 | 4.15 | 9.41 | 9.41 | 10.91 | 1.11× | 1.57× | -0.12 | -0.06 | 83 / 4,404 / 0 | — | 0.5256 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 9 | 28.07 | 41.47 | 41.47 | 43.33 | 1.79× | 2.64× | 1.18 | 0.88 | 765 / 37,294 / 0 | — | 0.1075 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 13 | 19.53 | 34.04 | 34.04 | 36.78 | 1.07× | 1.48× | 0.61 | 0.40 | 439 / 27,599 / 0 | — | 0.0829 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 1.84 | 1.84 | 1.84 | 1.84 | 1.26× | 1.26× | -1.75 | -1.32 | 38 / 2,585 / 0 | — | 1.836 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 1.69 | 1.69 | 1.69 | 1.69 | 1.00× | 1.00× | -1.50 | -1.03 | 36 / 2,127 / 0 | — | 1.692 ms per entrie | — |
| fs.list | 17–64 entries · contended | 5 | 3.63 | 4.77 | 4.77 | 5.74 | 1.51× | 1.98× | -0.57 | -0.43 | 132 / 9,234 / 0 | — | 0.0725 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 18 | 4.16 | 6.24 | 6.24 | 6.39 | 1.66× | 2.13× | -0.51 | -0.47 | 73 / 8,206 / 0 | — | 0.0923 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 1.61 | 1.61 | 1.61 | 1.92 | 0.69× | 0.69× | -0.96 | -0.83 | 38 / 2,816 / 0 | — | 0.536 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 9 | 2.14 | 3.36 | 3.36 | 9.96 | 1.14× | 1.64× | 0.55 | 0.37 | 47 / 3,351 / 0 | — | 0.7143 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 3.11 | 3.11 | 3.11 | 4.34 | 1.33× | 1.10× | -0.22 | -0.01 | 114 / 6,099 / 0 | — | 0.3457 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 14 | 2.68 | 3.55 | 3.55 | 4.01 | 1.41× | 0.93× | 0.38 | 0.32 | 56 / 4,661 / 0 | — | 0.335 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 2 | 2.38 | 2.38 | 2.38 | 2.58 | 1.07× | 1.07× | -0.83 | -0.56 | 66 / 3,797 / 0 | — | 0.0038 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 7 | 2.34 | 2.80 | 2.80 | 3.47 | 1.48× | 1.76× | -0.23 | -0.19 | 47 / 2,751 / 0 | — | 0.0031 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 3 | 2.94 | 2.94 | 2.94 | 3.96 | no baseline | no baseline | 0.26 | 0.21 | 101 / 5,214 / 0 | — | 0.0004 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.60 | 2.60 | 2.60 | 3.20 | 0.93× | 0.93× | -1.27 | -0.94 | 56 / 2,748 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 5 | 3.49 | 4.04 | 4.04 | 4.35 | 1.66× | 0.68× | -0.39 | -0.23 | 77 / 7,762 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 27 | 2.16 | 3.01 | 3.34 | 6.38 | 1.05× | 0.84× | -0.27 | -0.18 | 50 / 3,080 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 22 | 13.24 | 18.97 | 20.50 | 24.20 | 1.26× | 1.34× | 1.30 | 1.03 | 332 / 22,430 / 0 | — | 13.241 ms per file | commit |
| fs.rm | 1 files · uncontended | 48 | 6.23 | 9.93 | 16.89 | 27.98 | 0.93× | 0.89× | 0.08 | 0.27 | 132 / 6,991 / 0 | — | 6.234 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 2 | 3.77 | 3.77 | 3.77 | 4.62 | 1.74× | 1.69× | -0.64 | -0.49 | 85 / 6,118 / 0 | — | 0.0069 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 5 | 2.31 | 2.46 | 2.46 | 2.74 | 1.50× | 1.60× | 0.19 | 0.24 | 53 / 3,052 / 0 | — | 0.0052 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 2 | 2.04 | 2.04 | 2.04 | 2.38 | no baseline | no baseline | -0.31 | -0.16 | 37 / 2,301 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 2.27 | 2.27 | 2.27 | 3.01 | 1.08× | 1.08× | -0.17 | -0.19 | 41 / 3,078 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 3 | 4.00 | 4.00 | 4.00 | 4.77 | 1.53× | 1.17× | -0.32 | -0.30 | 80 / 4,098 / 0 | — | 0.0003 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 10 | 1.92 | 2.45 | 2.45 | 2.52 | 0.98× | 1.14× | 0.31 | 0.13 | 37 / 2,518 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 6 | 2.31 | 7.42 | 7.42 | 9.76 | 1.03× | 2.47× | -0.02 | -0.02 | 101 / 4,593 / 0 | — | 0.0016 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 19 | 1.97 | 4.12 | 4.12 | 5.33 | 1.18× | 1.18× | -0.23 | -0.15 | 45 / 3,148 / 0 | — | 0.0004 ms per byte | — |
| fs.write | >512 KiB · uncontended | 2 | 11.57 | 11.57 | 11.57 | 14.10 | no baseline | no baseline | — | — | 208 / 6,777 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 75 | 19.17 | 45.16 | 71.12 | 81.52 | 2.25× | 3.03× | 0.21 | 0.34 | 550 / 57,744 / 0 | — | 0.0429 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 61 | 7.31 | 17.87 | 20.52 | 34.79 | 1.15× | 1.69× | -0.61 | -0.37 | 154 / 7,053 / 0 | — | 0.0145 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 13 | 18.01 | 23.61 | 23.61 | 47.85 | 1.12× | 1.47× | -0.12 | 0.03 | 486 / 36,681 / 0 | — | 0.0001 ms per byte | files.change |
| fs.write | ≤512 KiB · uncontended | 40 | 10.63 | 20.77 | 26.43 | 27.94 | 1.29× | 2.52× | 0.17 | 0.18 | 164 / 7,026 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 117 | 14.19 | 32.34 | 45.63 | 52.99 | 1.43× | 1.47× | -0.30 | -0.14 | 426 / 28,507 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 183 | 7.35 | 13.18 | 18.27 | 22.07 | 1.02× | 0.97× | -0.13 | -0.02 | 161 / 6,625 / 0 | — | 0.0005 ms per byte | files.change |
| fs.write | ≤8 KiB · contended | 261 | 12.75 | 33.66 | 43.49 | 58.08 | 1.30× | 1.50× | -0.41 | -0.22 | 370 / 24,153 / 0 | — | 0.0046 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 226 | 6.85 | 12.51 | 19.36 | 25.95 | 0.95× | 0.90× | -0.02 | 0.05 | 158 / 6,738 / 0 | — | 0.0021 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.71 | 0.71 | 0.71 | 0.71 | 0.94× | 0.94× | -0.40 | -0.28 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 28 | 32.05 | 49.02 | 56.42 | 61.23 | 1.52× | 1.41× | -0.04 | -0.07 | 391 / 80,509 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 77 | 22.61 | 44.61 | 49.55 | 198.01 | 1.09× | 1.29× | -0.14 | -0.12 | 245 / 23,698 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 8 | 2.80 | 3.64 | 3.64 | 3.65 | 0.73× | 0.45× | 0.26 | 0.23 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 40 | 3.20 | 4.41 | 4.61 | 7.38 | 0.80× | 0.86× | -0.19 | -0.13 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 4 | 15.62 | 15.77 | 15.77 | 19.28 | 1.62× | 0.81× | 0.23 | 0.21 | 263 / 13,074 / 0 | — | 15.621 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 13 | 8.74 | 10.86 | 10.86 | 13.53 | 1.05× | 0.89× | -0.16 | -0.12 | 112 / 4,260 / 0 | — | 8.739 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 246.99 | 246.99 | 246.99 | 246.99 | 6.48× | 6.48× | -0.66 | -0.44 | 17,277 / 641,073 / 8,191 | — | 246.991 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 5 | 10.42 | 32.30 | 32.30 | 34.02 | 0.70× | 1.64× | 1.62 | 1.24 | 166 / 7,545 / 0 | — | 5.2115 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 10.02 | 14.30 | 14.30 | 16.34 | 0.94× | 0.84× | -0.13 | -0.13 | 148 / 6,263 / 0 | — | 3.467 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 10.46 | 10.46 | 10.46 | 10.46 | 0.63× | 0.63× | -0.53 | -0.35 | 175 / 8,056 / 0 | — | 1.7427 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 6 | 13.11 | 17.14 | 17.14 | 17.57 | 0.96× | 1.25× | 0.84 | 0.91 | 159 / 5,839 / 0 | — | 2.5093 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 93.25 | 1028.83 | 1028.83 | 13744.83 | 1.35× | 14.91× | -0.06 | 0.04 | 1,474 / 69,318 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 2.58 | 2.58 | 2.58 | 2.58 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.exec | 0 files · contended | 170 | 607.36 | 904.45 | 2211.65 | 2997.77 | 11.85× | 2.36× | 0.85 | 0.63 | — | 4,126 | — | — |
| sandbox.exec | 0 files · uncontended | 154 | 29.64 | 550.56 | 769.30 | 6164.44 | 0.93× | 1.92× | -0.25 | -0.20 | — | 4129.30 | — | — |
| sandbox.exec | 1 files · contended | 24 | 36.99 | 44.71 | 50.16 | 64.64 | 1.01× | 0.53× | 0.15 | 0.10 | — | 4.30 | 36.99 ms per file | — |
| sandbox.exec | 1 files · uncontended | 38 | 32.75 | 63.47 | 68.46 | 69.69 | 0.98× | 0.94× | 0.17 | 0.15 | — | 5 | 32.754 ms per file | — |
| sandbox.exec | 17–64 files · contended | 4 | 65.29 | 73.46 | 73.46 | 74.52 | 0.93× | 1.05× | -0.12 | -0.06 | — | 102 | 3.2645 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 6 | 58.32 | 74.16 | 74.16 | 82.95 | 0.84× | 1.06× | -0.12 | -0.10 | — | 102 | 2.9162 ms per file | — |
| sandbox.exec | 2–4 files · contended | 24 | 33.03 | 42.21 | 48.26 | 56.42 | 0.85× | 0.61× | -0.02 | -0.03 | — | 10.70 | 11.011 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 27 | 27.13 | 46.37 | 47.92 | 51.55 | 0.71× | 0.71× | -0.56 | -0.35 | — | 11.20 | 9.9255 ms per file | — |
| sandbox.exec | 5–16 files · contended | 7 | 47.29 | 49.95 | 49.95 | 55.23 | 0.81× | 0.69× | 0.56 | 0.40 | — | 33 | 5.5732 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 50 | 45.75 | 65.23 | 69.92 | 73.62 | 0.64× | 0.62× | -0.17 | -0.05 | — | 16.50 | 8.0906 ms per file | — |
| sandbox.exec | — · contended | 10 | 2865.70 | 25937.40 | 25937.40 | 26960.26 | no baseline | no baseline | -1.46 | -1.10 | — | 45672.40 | — | — |
| sandbox.exec | — · uncontended | 29 | 487.70 | 14635.27 | 21861.07 | 34727.34 | 0.92× | 2.06× | 0.73 | 0.49 | — | 43,342 | — | — |
| sandbox.mount | — · contended | 54 | 9.72 | 14.89 | 17.96 | 25.39 | 0.87× | 0.78× | -0.12 | -0.07 | 60 / 1,623 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 148 | 8.76 | 12.07 | 14.21 | 19.39 | 0.78× | 0.60× | -0.26 | -0.19 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.52 | 3.69 | 3.69 | 42.10 | no baseline | no baseline | -0.04 | -0.03 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 49 | 10.59 | 15.00 | 20.99 | 23.02 | 1.00× | 0.83× | -0.02 | 0.03 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 153 | 10.09 | 18.96 | 95.46 | 165.52 | 0.96× | 1.03× | 0.07 | 0.07 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 11 | 0.0 KiB | 583.9 KiB | 2,642 | ok 11 |
| branch.diff_commits | branch | 405 | 0.0 KiB | 22.3 MiB | 74,967 | ok 405 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 8 | 0.0 KiB | 72.9 KiB | 123 | ok 8 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 49 | 1.9 MiB | 0.0 KiB | 60 | Committed 49 |
| fs.diff_files | fs | 52 | 0.0 KiB | 309.1 KiB | 36 | Text 35, NoSuchPath 16, Equal 1 |
| fs.glob | fs | 59 | 0.0 KiB | 61.3 KiB | 797 | ok 59 |
| fs.grep | fs | 59 | 0.0 KiB | 258.0 KiB | 943 | ok 59 |
| fs.list | fs | 64 | 0.0 KiB | 348.6 KiB | 2,283 | ok 64 |
| fs.read | fs | 52 | 0.0 KiB | 238.7 KiB | 52 | ok 52 |
| fs.rm | fs | 70 | 0.0 KiB | 0.0 KiB | 70 | Committed 70 |
| fs.stat | fs | 58 | 0.0 KiB | 12.8 KiB | 58 | ok 58 |
| fs.write | fs | 978 | 17.9 MiB | 0.0 KiB | 978 | Committed 978 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 208 | 0.0 KiB | 0.0 KiB | 0 | Committed 158, UpToDate 49, Conflict 1 |
| sandbox.exec | sandbox | 553 | 1.8 MiB | 4.7 MiB | 0 | exit:0 550, exit:2 3 |
| sandbox.mount | sandbox | 212 | 0.0 KiB | 0.0 KiB | 0 | Mounted 212 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 212 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 212 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 1.38 · end 1.86.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.086 | 12.543 · 1.242 · 1.086 · 0.948 · 0.946 | 2.72–2.72 | statements 27, vm_steps 972, fullscan_steps 0, sorts 0, returned_rows 81 |
| read | 0.989 | 1.204 · 0.992 · 0.989 · 0.953 · 0.87 | 2.72–2.72 | statements 16, vm_steps 732, fullscan_steps 0, sorts 0, returned_rows 70 |
| list_small | 0.973 | 0.973 · 0.903 · 1.096 · 0.949 · 1.03 | 2.72–2.72 | statements 16, vm_steps 741, fullscan_steps 0, sorts 0, returned_rows 70 |
| list_largest | 8.54 | 10.742 · 8.714 · 8.075 · 8.082 · 8.54 | 2.72–2.72 | statements 183, vm_steps 21934, fullscan_steps 0, sorts 0, returned_rows 2278 |
| grep_scoped | 1.087 | 1.513 · 1.163 · 1.032 · 0.992 · 1.087 | 2.72–2.72 | statements 21, vm_steps 887, fullscan_steps 0, sorts 0, returned_rows 79 |
| glob_scoped | 0.923 | 0.923 · 0.919 · 0.999 · 1.039 · 0.902 | 2.72–2.72 | statements 15, vm_steps 720, fullscan_steps 0, sorts 0, returned_rows 69 |
| grep_tree | 4891.952 | 4919.829 · 4905.161 · 4885.989 · 4880.786 · 4891.952 | 2.2–2.58 | statements 59576, vm_steps 4548311, fullscan_steps 0, sorts 0, returned_rows 457308 |
| glob_tree | 6.916 | 9.094 · 7.029 · 6.88 · 6.685 · 6.916 | 2.2–2.2 | statements 141, vm_steps 18564, fullscan_steps 0, sorts 0, returned_rows 1958 |
| diff_files | 4.414 | 4.629 · 4.65 · 4.378 · 4.414 · 4.337 | 2.2–2.2 | statements 72, vm_steps 4204, fullscan_steps 0, sorts 0, returned_rows 414 |
| list_commits | 0.638 | 1.099 · 0.58 · 0.638 · 0.656 · 0.564 | 2.2–2.2 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.201 | 2.682 · 2.206 · 2.201 · 2.115 · 2.147 | 2.2–2.2 | statements 59, vm_steps 2188, fullscan_steps 0, sorts 0, returned_rows 247 |
| fork | 0.349 | 0.415 · 0.348 · 0.349 · 0.31 · 0.743 | 2.2–2.2 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 22.61 | 23.76 · 22.61 · 22.378 · 21.841 · 23.577 | 2.2–2.2 | statements 474, vm_steps 22967, fullscan_steps 0, sorts 0, returned_rows 1720 |
| oneshot_mount_unmount | 14.569 | 19.529 · 14.569 · 15.365 · 14.194 · 13.592 | 2.2–2.2 | statements 61, vm_steps 2192, fullscan_steps 82, sorts 2, returned_rows 217 |
| oneshot_commit | 67.67 | 67.67 · 80.304 · 60.794 · 64.802 · 72.214 | 2.2–2.2 | statements 170, vm_steps 11469, fullscan_steps 82, sorts 2, returned_rows 884 |
| oneshot_exec | — |  ·  ·  ·  ·  | 2.2–2.2 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r044: 321,152 pages of 4,096 B, 0 free · Commits 53,530 · Branches 1,060 · Layers 54 · compression 3.62× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 176,188 | 1.06 GiB |
| 2 | 61,624 | 933.8 MiB |
| 3 | 16,179 | 5.2 MiB |
| 4 | 49 | 9.4 KiB |
| 5 | 16,074 | 1.6 MiB |
| 6 | 138,217 | 669.5 MiB |
| 7 | 367,477 | 90.5 MiB |
| 8 | 1,063 | 302.2 KiB |
| 9 | 111,883 | 245.1 MiB |
| 10 | 57,507 | 7.1 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,421 | 198.7 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 54,935 | 111.5 MiB |
| 1 | 61,080 | 726.9 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 224,556 | 877.2 MiB | 31.9 MiB |
| inode_value | 57,191 | 223.4 MiB | 4.5 MiB |
| binding_hint | 16,693 | 65.2 MiB | 6.2 MiB |
| object_location | 13,045 | 51.0 MiB | 5.4 MiB |
| commit | 4,396 | 17.2 MiB | 2.7 MiB |
| file_digest | 1,477 | 5.8 MiB | 669.0 KiB |
| commit_lineage | 1,161 | 4.5 MiB | 564.7 KiB |
| commit_runs | 1,125 | 4.4 MiB | 584.9 KiB |
| commit_identity | 827 | 3.2 MiB | 370.9 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 47 | 188.0 KiB | 33.0 KiB |
| branch_names | 17 | 68.0 KiB | 11.4 KiB |
| branch_identity | 13 | 52.0 KiB | 10.4 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| run_merges | 6 | 24.0 KiB | 5.7 KiB |
| layer | 4 | 16.0 KiB | 6.5 KiB |
| layers_source | 3 | 12.0 KiB | 7.3 KiB |
| layers_child | 3 | 12.0 KiB | 7.3 KiB |
| absorbed_heights | 3 | 12.0 KiB | 5.9 KiB |

### E. Stage times

**Time 265.0 s** (tooling): play 89.1 · consolidate 106.3 · verify 23.0 · probes 25.5 · tests 0.0 · seal + snapshot 6.5 · report 14.6

265.02 s tooling: prepare 1.39 · play 87.74 · consolidate 106.27 · verify 13.79 (diff_commits + full compareTree) · version walk 9.26 · probes 25.45 · metrics 0.72 · seal 1.24 · sealed figures 2.20 · snapshot copy 3.04 · report 0.41

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T04:03:42.489Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 2309/2310; conflicts 4/4; tests 0/0 equal to native; Speed: branch.diff_branches >64 entries · uncontended: 6.77× baseline (no phase); Scaling: not judged: no probes; Counters: not judged: no counters; Contended work: fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.863 over 14 ranges; Git: git status not clean at the checkpoint; Node proofs: 0 pass · 0 stop · 15 NOT_RUN over 3 points |
| 2 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T04:19:47.522Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 14.91× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.351) and statements per entry does not rise (0.027): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2513 vs the first 1941: 1.295× (bound, period 8); Contended work: fs.write ≤1 KiB · contended: SQL VM steps against tree files, exponent 1.778 over 14 ranges |

### G. Evidence

- `~/lfs-history/metrics/range-044.a1.json`
- `~/lfs-history/metrics/range-044.a2.json`
- trace `~/lfs-history/runs/p3-main-w/trace/range-044.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-w/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-044.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r044-3-packages-ui | 662 | 540.9 KiB |
| r044-2-agents-notes | 697 | 544.7 KiB |
| r044-1-root | 439 | 535.0 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 421.0 | 4,365 |
| `git diff --stat` | 37.0 | 4,356 |
| `git add -f` | 34.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 38.0 | 4,361 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r044-1-root | end | P1 | pass | — | — |
| r044-1-root | end | P2 | pass | exit 0 | — |
| r044-1-root | end | P3 | n/a | an install, not a refresh | — |
| r044-1-root | end | P4 | pass | 56 emitted files, exit 2 | — |
| r044-1-root | end | P5 | pass | 17 files | — |
| r044-1-root | end | P6 | n/a | not a repair | — |
| r044-2-agents-notes | end | P1 | pass | — | — |
| r044-2-agents-notes | end | P2 | pass | exit 0 | — |
| r044-2-agents-notes | end | P3 | pass | 0 bookkeeping path(s) | — |
| r044-2-agents-notes | end | P4 | pass | 157 emitted files, exit 2 | — |
| r044-2-agents-notes | end | P5 | n/a | no calibrated file | — |
| r044-2-agents-notes | end | P6 | n/a | not a repair | — |
| r044-3-packages-ui | end | P1 | pass | — | — |
| r044-3-packages-ui | end | P2 | pass | exit 0 | — |
| r044-3-packages-ui | end | P3 | pass | 266 bookkeeping path(s) | — |
| r044-3-packages-ui | end | P4 | pass | 275 emitted files, exit 2 | — |
| r044-3-packages-ui | end | P5 | pass | 39 files | — |
| r044-3-packages-ui | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2028 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
