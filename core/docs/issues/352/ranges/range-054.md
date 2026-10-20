# Range 054 · **optimize** · attempt 1

**Matches git ✓** · daemon `32eda22d657d` · image `d3773b4e` · plan v2 · continued from r053 (live Store)
dsh `b34115565`..`3921610f5` · **97 commits** (5 mainline, 92 side) · 2026-07-30 → 2026-07-30
Areas changed: `/` 13% · `packages/client` 12% · `.agents/notes` 11% · other 64%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 22 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.16×** · **Churn 0.00**
**Time split:** play 128.2 s · git 177.1 s · Node 266.4 s · verify 15.5 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **860.1 MiB** (+2.1 MiB) | **1.54 GiB** (+30.7 MiB) | **1.84×** (prev 1.81×) | **34.2 MiB** | **1,393** (total 64,802) | **334.9 s** tooling (total 198.9 min) |

**Checks:** 14 pass · 4 watch: Speed fs.glob 17–64 files · uncontended: 4.92× baseline (no phase); not judged: sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (6.68×), fs.apply ≤1 KiB · uncontended: 4/19/11 calls (2.52×) (baseline class under 5 calls per range); Scaling branch.diff_commits checkpoint statements in total (entries exponent -0.031): tree files exponent 0.67; Contended work not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (10 classes too narrow); SQL per call (sql.call); Directory share 0.518 · 1 optimize/stop: Counters
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▼ probe list_small −70% · ▼ probe fork −57% · ▲ fs.read p95 +36%
**Budget:** 55 of 202 ranges · projected total 16.3 h (budget 16.8 h) · disk 45% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **4,991 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 2 publishes |
| Steps | 2,894 / 2,894 outcomes as planned |
| Conflicts | **4 / 4 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 3215 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 425 bin shims, 4696 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (61 lines from 4 .gitignore files) · **239 picks** in 4 merges (239 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `3921610f5`** · 133 commits written for 133 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 239 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r054-2-root | end | `fbb1826d917d` | `b890d55b9cba` | pass (429 normalized) | pass | n/a | pass | pass | n/a |
| r054-3-apps-cli | end | `eeaa7c755176` | `e0e951e44447` | pass (429 normalized) | pass | pass | pass | pass | n/a |
| r054-1-agents-notes | end | `95c0fb1600c9` | `e0e951e44447` | pass (429 normalized) | pass | pass | pass | pass | n/a |
| r054-4-packages-client | end | `0761587bdadb` | `e0e951e44447` | pass (429 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `8c0260870ece` | `null` | n/a | pass | n/a | n/a | pass | pass (137,792 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.compat.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/zstd.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/ui/app-boot/tests/config-reload.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/inheritance.spec.ts` (fails natively) · `apps/cli/tests/source-launch.compat.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/apply-inject.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/assembly-surfaces.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-apply.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-toolview-slot.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-view.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/service-orchestration.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-blank.spec.ts` (fails natively) · `packages/llm/token-meter/tests/token-meter.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-cold.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/coverage-tails.spec.tsx` (fails natively) · `packages/client/ui-goal/tests/browser-plugin.spec.tsx` (fails natively) · `packages/host/apiproxy/tests/api-proxy-projections.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/chat-tool-row.spec.tsx` (fails natively) · `packages/client/ui-goal/tests/goalbar.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/todo-panel.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/terminal-card.spec.tsx` (fails natively) · `packages/session-query/session-query-sqlite/tests/sqlite.spec.ts` (fails natively).

## 2. Activity

**3,747 calls** · **235 steps** by **8 agents + lead** on **4 Branches + main** · **297 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +173 added · 950 modified · −157 deleted · 21.8 MiB written · fs 1,166 : Sandbox 114 (**10 : 1**, reported only in P3)
**Execs:** 799 (JS 81 · shell 718) · 2 non-zero exits · install 0 · test runs 5 · version figures 14 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,586 | 1,179 | 407 | Committed 1,176 · Text 54 · NoSuchPath 8 · Equal 4 · UpToDate 3 |
| sandbox | 1,694 | 1,095 | 5 | commit 296 (Committed 231, UpToDate 64, Conflict 1) · exec 799 (exit:0 797, exit:2 2) · mount 297 (Mounted 297) · status 5 · unmount 297 (Unmounted 297) |
| branch | 456 | 35 | 421 | diff_branches 15 · diff_commits 406 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 2 (Added 2) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **3,747** | **2,309** | **844** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r054-1-agents-notes | a01 a02 | 47 | 310 | ✓ | ✓ |
| r054-2-root | a03 a04 | 50 | 318 | ✓ | — |
| r054-3-apps-cli | a05 a06 a07 a08 | 81 | 325 | ✓ | — |
| r054-4-packages-client | a09 a10 | 49 | 318 | ✓ | — |
| main | lead | 8 | 122 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r054-1, a02 after a01 | 0.1 s |
| Stale clean merge | 1 / 1 | r054-1, a01 a02 | merged cleanly |
| Decoy edit | 1 / 1 | r054-1, a02 a01 | replaced before the checkpoint |
| Merge / publish race | 1 / 1 | lead merge of r054-2 vs r054-1 publish | 3.8 s, merged again |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r054-1 | 34 | 18 | 16 | 0 | 0 | 281 | commit-conflict, stale-clean-merge, decoy |
| a02 | r054-1 | 13 | 4 | 9 | 0 | 0 | 29 | commit-conflict, stale-clean-merge, decoy |
| a03 | r054-2 | 6 | 4 | 2 | 0 | 0 | 29 | — |
| a04 | r054-2 | 44 | 22 | 22 | 0 | 0 | 289 | — |
| a05 | r054-3 | 5 | 2 | 3 | 0 | 0 | 12 | — |
| a06 | r054-3 | 76 | 39 | 37 | 0 | 0 | 313 | — |
| a09 | r054-4 | 36 | 14 | 22 | 0 | 0 | 242 | — |
| a10 | r054-4 | 13 | 5 | 8 | 0 | 0 | 76 | — |
| lead | main | 8 | 1 | 0 | 7 | 0 | 122 | merge-race |
| **Total** |  | **235** | **109** | **119** | **7** | **0** | **1,393** | **4** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 167 · pnpm 1 · tsc 4 · vitest 5 · other 622

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r054-3-apps-cli | 57 | 57 | 57 | 4 | 57 | 573 |
| r054-4-packages-client | 37 | 37 | 34 | 7 | 37 | 497 |
| r054-2-root | 34 | 34 | 34 | 6 | 34 | 388 |
| r054-1-agents-notes | 31 | 31 | 29 | 5 | 31 | 548 |
| **lead** | — | — | — | — | 133 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r054-2-root | 1 | 0 | 1 | 1 | 5 | 5 / 5 |
| r054-3-apps-cli | 0 | 1 | 1 | 1 | 27 | 27 / 27 |
| r054-1-agents-notes | 0 | 1 | 1 | 1 | 37 | 37 / 37 |
| r054-4-packages-client | 0 | 1 | 1 | 1 | 61 | 61 / 61 |
| **lead repair** | 1 | — | 1 | — | — | 137,792 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r053) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 858.0 MiB (27.9 MiB / 691.9 MiB / 26.3 MiB / 111.9 MiB) | 860.1 MiB (28.1 MiB / 691.9 MiB / 26.2 MiB / 113.8 MiB) | +2.1 MiB |
| Version figures from | — | full: snapshot cross-check | — |
| Files / directories / symlinks | 64,546 / 10,023 / 4,696 | 64,552 / 10,021 / 4,704 | +6 / −2 / +8 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 1.51 GiB | 1.54 GiB | +30.7 MiB |
| **Space amplification** (total · tracked) | 1.81× · tracked 4.91× | 1.84× · tracked 4.95× | 0.03 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.78** (0.94 / 0.24 / 1.03) | 1.07× the median range |
| **Stored per Commit** | 27.2 KiB | 22.4 KiB | — |
| Metadata share | 0.44 | 0.44 | this range 0.52 |
| History: Commits / Layers / Branches | 63,409 | 64,802 / 37 / 861 | +1,393 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 9.29 GiB (Commits 6.83 GiB · installs 843.1 MiB · build 94.3 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 38.51 GiB / 45% | — |
| Snapshot | — | r054, 1.32 GiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 881.2 MiB | 1.02 | +13.0 MiB |
| Metadata | 142.9 MiB | 0.17 | +3.5 MiB |
| Index rows | 481.2 MiB | 0.56 | +12.6 MiB |
| Waste | 74.4 MiB | 0.09 | +1.6 MiB |
| Other | 1.9 MiB | 0.00 | +36.0 KiB |
| **Total = Store on disk** | **1.54 GiB** | **= 1.84** space amplification | +30.7 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 28.1 MiB | 139.0 MiB (72.9 MiB + 66.1 MiB) | 4.95× | — | 2.1 MiB | 4.4 MiB | 0.47 |
| `node_modules` | 691.9 MiB | 237.0 MiB (201.4 MiB + 35.5 MiB) | 0.34× | — | 1.0 MiB | 137.7 KiB | 7.46 |
| Build output | 26.2 MiB | 31.2 MiB (28.7 MiB + 2.5 MiB) | 1.19× | — | 1.5 MiB | 9.3 MiB | 0.16 |
| `.git` | 113.8 MiB | 560.0 MiB (534.7 MiB + 25.3 MiB) | 4.92× | — | 11.7 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 557.5 MiB | — (not divided) | — | 14.2 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 56.8 MiB | — | — | — | — | — |
| **Total** | — | **1.54 GiB** | **= 1.84×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 211,263 | +4,086 | 6.4 KiB | 0 (derived) | 48% |
| Chunks (large files) | 73,624 | +1,473 | 16.0 KiB | — | 60% |
| Large-file extents | 17,892 | — | 0.4 KiB | — | — |
| Directories | 507,931 | 5,288 (with inodes, pooled) | 0.3 KiB | — | 59% |
| Inodes and attributes | 422,331 | ↑ pooled | 2.9 KiB | — | — |
| Symlinks | 2,502 | +4,749 | 0.1 KiB | — | — |

Delta: 3.2% at depth cap · 23% of refused bases stopped by budget · `node_modules` reinstall: absolute: 933341 new stored bytes for 1191 raw changed bytes of 33 changed packages (783.662×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.95× (139.0 MiB for 28.1 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.1 KiB / 4.8 KiB / 6.9 KiB over 292 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.16× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (2.5 MiB stored for 2.76 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.46 (4 lanes × 860.1 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.4 KiB (budget not set) |

## 4. Speed

Daemon `32eda22d657d` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 11.2 ms / 41.2 ms (1.15×) | 3.0 ms / 7.4 ms (0.91×) | 3.8 ms / 7.3 ms (1.17×) | 22.5 ms / 76.0 ms (1.00×) | 10.3 ms / 17.0 ms (0.98×) | 368 ms / 401 ms (0.82×) | — (native comparison in P3; exec 38.8 ms / 999 ms) |
| SQL p50: 186 stmts | 62 stmts | 72 stmts | 225 stmts | 45 stmts | 9,211 stmts | — |

**Commit cost:** 10.13 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 775 ms p50 over 297
**Slowest:** sandbox.exec 36095 ms · sandbox.exec 30390 ms · sandbox.exec 29734 ms · checkpoint diff_commits 0.10 ms and 1.56 statements per entry (74,048 entries per page)
**Scaling:** 4 of 15 probes flat · `stat` 1.01 · `read` 2.20 · `list_small` 8.37 · `list_largest` 1.04 · `grep_scoped` 2.60 · `glob_scoped` 2.94 · `glob_tree` 3.54 · `diff_files` 5.29 · `list_commits` 2.79 · `diff_commits` 4.94 · `merge` 1.06

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 391 ms / 391 ms | — / — | — | git / status-cold: — |
| git status (steady) | 454 ms / 704 ms | — / — | — | git / status-steady: — |
| git add | 39.0 ms / 117 ms | — / — | — | git / add: — |
| git commit (lane) | 45.0 ms / 79.0 ms | — / — | — | git / commit: — |
| lead writes main | 4351 ms / 4351 ms | — / — | — | — |
| repack | 2183 ms / 2183 ms | — / — | — | — |
| pnpm install (incremental) | 3402 ms / 3402 ms | 2276 ms / 2276 ms | 1.49× | pnpm-reinstall / cold: — |
| pnpm refresh | 3052 ms / 3052 ms | 2077 ms / 2077 ms | 1.47× | pnpm-reinstall / steady: — |
| tsc -b | 6031 ms / 7102 ms | 3596 ms / 6445 ms | 1.68× | tsc-b / cold: — |
| vitest | 6998 ms / 7435 ms | 3514 ms / 3758 ms | 1.99× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 13.0 ms / 26.8 ms

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
| 054.a1 | 64802 | 1581.6 | 7.91 (1.34×) · 6951 · 232 (25 solo) | 8.69 (1.40×) · 6748 · 292 (52 solo) | 9.06 (1.24×) · 6801 · 344 (57 solo) | 2.41 (1.21×) · 3590 · 53 (2 solo) | 9.82 (1.08×) · 1362 · — (daemon) | 8.88 (1.06×) · 5205 · — (daemon) | 367.61 (—×) · 504299 · 12592 (4 solo) |

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4194304 B · fs.write ≤8 KiB 4194304 → 4194304 B · fs.write ≤64 KiB 4194304 → 4194304 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3164192 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 45352 → 4194304 B
**Host load (1-min, recorded, not waited on):** macOS 8.18 at the first command → 5.62 after the last (max 8.95 over 9 commands) · Docker VM 4.41 → 1.63

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
| control-054.a1 | 12851 · 207.8 | 64802 · 1581.6 | 5.87 (0.95× first) / 5.30 · 0.90× · 116/129 | 6.10 (0.95× first) / 5.30 · 0.87× · 110/124 | 2.46 (0.88× first) / 2.92 · 1.19× · 74/117 | 9.96 → 9.48 | pass |

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-054.a1)

## 5. Findings and action

### Finding 054.a1 · optimize

**1. Trigger** (attempt 1, daemon `32eda22d657d`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | oneshot_mount_unmount.statements: depth exponent 2.423 | < 0.05 |

Diagnosis pending: `finding-054.a1.json`.

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

- **a1 (`p3-main-x`, daemon `32eda22d`): OPTIMIZE, terminal under the fast-mode ruling (row recorded).** Checkpoint ok, git ✓. Node: 4 lane points P1–P5 pass, repair P6 pass. Control `control-054.a1` passes. Report check F1–F8 PASS. Native first passed with no fix.
- **Optimize row, Counters: `oneshot_mount_unmount.statements` depth exponent 2.42.** The counter went 57 → 65 → 64 → 66 over r51–r54.
  - The trace (per-call `sql.call`) puts the whole change in the probe's first, cold mount: 53 / 61 / 60 / 62 statements, with 4 / 8 / 7 / 8 blob opens.
  - The four warm mounts stay at 40 statements and 0 blob opens.
  - Reading, accepted by the liaison: the extra statements are metadata blob lookups in the cold bind, about 2 per blob. Their count follows the bound layer's metadata delta chain (cap period 8), so they are bounded, not growth with depth. This is an inference from the blob counters; the traces carry no statement text.
  - The row stays optimize in this block. A proposal for the next re-baseline: judge the cold-mount counter by the F-016 chain bound.
- **F-063 active:** chunk PREFIX 694 vs FULL 295 over 159 lane git Commits (153 with a PREFIX chunk).
- **Storage watch:**

  | | r54 | r53 |
  | --- | --- | --- |
  | Store | +30.7 MiB | +23.0 MiB |
  | `.git` stored | +11.7 MiB | +7.9 MiB |
  | Index rows | +12.6 MiB (468.6 → 481.2 MiB) | |

- **Watch rows:**
  - Speed: `fs.glob` 17–64 files, uncontended. Its p90 is 38.2 ms, 4.92× baseline, about 30 ms over, above the 5 ms floor. Its p50 is 7.9 ms (1.37×). Statements per call went 55 → 100 and vm_steps 6.5k → 13.6k against r53, so this range's globs match more files inside the same class bucket (0.22 ms per file).
  - Thin, not judged: one `sandbox.commit` 5–16 files took 102.8 ms (6.68×).
  - Scaling: `branch.diff_commits` statements, tree files exponent 0.67.
- **Steps:**
  - Lead 3 s. Cuts 30, 50, 70 and 85: 28, 16, 18 and 15 s. Lanes 66 s.
  - Repair 124 s (install 36.1, build 29.7, tests 3.8).
  - Verify 19 s. Finish 57 s of 90 s.
  - Host load 6.4–8.9.
- **Pre-scan:** 5 packages added and removed within the range: `examples/code-mode`, `guard/source-guard` and three `session-registry` packages. The `-d` clean reached them: Correctness pass, and no untracked leftover in the checkpoint compare.
- **Snapshot:** 1,353.6 MiB new, 4.6 s.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2894/2894; conflicts 4/4; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | fs.glob 17–64 files · uncontended: 4.92× baseline (no phase); not judged: sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (6.68×), fs.apply ≤1 KiB · uncontended: 4/19/11 calls (2.52×) (baseline class under 5 calls per range) | ≤ 1.2× | watch |
| Scaling | branch.diff_commits checkpoint statements in total (entries exponent -0.031): tree files exponent 0.67 | < 0.15 | watch |
| Counters | oneshot_mount_unmount.statements: depth exponent 2.423 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (10 classes too narrow); SQL per call (sql.call) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.518 | < 0.5 | watch |
| Reinstall growth | absolute: 933341 new stored bytes for 1191 raw changed bytes of 33 changed packages (783.662×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.0324 (budget 0.2304) | < 0.1 | pass |
| Range growth | 34.2 MiB, 1.29× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | 4589 ms for 1353.6 MiB new; size exponent -1.307 | < 0.15 | pass |
| Disk projection | 0.45 | < 0.8 | pass |
| Wall projection | 0.97 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 133 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 22 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 239 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.16× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 235 | 235 |
| Lanes / agents | 4 / 8 | 4 / 10 |
| LayerFS Commits | 1393 | 1219 |
| Workspaces (one-shot share) | 297 (0.99) | 118 (0.983) |
| Reads | 374 | 374 |
| Reconcile writes | 114 | 114 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `32eda22d657d` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · contended | 1 | 390.71 | 390.71 | 390.71 | 390.71 | 0.98× | 0.98× | — | — | 12,722 / 448,309 / 0 | — | 1.6079 ms per entrie | — |
| branch.diff_branches | >64 entries · uncontended | 14 | 15.81 | 380.85 | 380.85 | 478.88 | 0.63× | 0.87× | -1.86 | 1.92 | 252 / 21,684 / 0 | — | 0.065 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 4 | 73.95 | 301.19 | 301.19 | 372.39 | 0.25× | 1.01× | -33.34 | -47.55 | 922 / 71,498 / 0 | — | 0.3188 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 397 | 19.23 | 38.35 | 63.60 | 371.29 | 0.92× | 0.94× | -1.13 | -1.68 | 298 / 34,544 / 0 | — | 0.1076 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 1.00 | 1.78 | 1.78 | 4.12 | 1.96× | 1.03× | -2.93 | -1.44 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.95 | 0.95 | 0.95 | 0.96 | 1.03× | 1.03× | 2.98 | 4.19 | 70 / 1,298 / 0 | — | 0.0473 ms per entrie | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 1.15 | 1.15 | 1.15 | 1.15 | 0.64× | 0.64× | — | — | 35 / 517 / 0 | — | 0.0212 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 400.84 | 400.84 | 400.84 | 453.62 | 0.82× | 0.82× | -2.12 | -7.87 | 9,992 / 543,928 / 0 | — | 3.065 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 2 | 2.77 | 2.77 | 2.77 | 6.49 | 0.46× | 0.46× | -6.25 | 1.64 | 60 / 1,239 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 27.47 | 27.47 | 27.47 | 27.47 | 1.03× | 1.03× | -1.01 | 2.03 | 164 / 11,501 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 9 | 16.43 | 24.57 | 24.57 | 65.15 | 1.07× | 1.52× | — | — | 371 / 50,656 / 0 | — | 0.033 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 3 | 17.46 | 17.46 | 17.46 | 18.45 | 2.52× | 1.66× | 15.47 | 39.94 | 162 / 8,699 / 0 | — | 0.04 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 10.42 | 10.42 | 10.42 | 10.42 | 0.87× | 0.87× | — | — | 243 / 10,876 / 0 | — | 0.0011 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 5 | 10.96 | 12.67 | 12.67 | 12.95 | 1.54× | 1.31× | 0.22 | -4.48 | 132 / 4,673 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 10 | 13.03 | 22.85 | 22.85 | 26.29 | 0.91× | 0.60× | 7.69 | 43.28 | 235 / 12,117 / 0 | — | 0.0044 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 9 | 12.78 | 16.20 | 16.20 | 25.54 | 1.88× | 1.48× | 3.41 | 4.96 | 161 / 9,044 / 0 | — | 0.0023 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 5 | 7.97 | 13.68 | 13.68 | 16.32 | 0.90× | 1.17× | -9.84 | -18.79 | 194 / 11,440 / 0 | — | 0.0263 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 17 | 6.27 | 11.96 | 11.96 | 15.78 | 0.85× | 1.04× | -4.49 | -6.47 | 157 / 8,132 / 0 | — | 0.0217 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 12 | 13.40 | 17.99 | 17.99 | 20.18 | 1.43× | 1.41× | 4.54 | 1.47 | 249 / 16,691 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 12 | 7.68 | 9.66 | 9.66 | 10.61 | 0.84× | 0.79× | -2.51 | -4.78 | 192 / 10,201 / 0 | — | 0.0006 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 6 | 8.32 | 16.41 | 16.41 | 17.05 | 1.15× | 1.53× | 7.76 | 18.47 | 250 / 15,490 / 0 | — | 0.0054 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 9 | 9.01 | 10.98 | 10.98 | 12.26 | 1.16× | 1.06× | 7.48 | 12.72 | 190 / 11,684 / 0 | — | 0.0065 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 3.10 | 3.10 | 3.10 | 3.10 | 0.55× | 0.55× | — | — | 51 / 3,927 / 0 | — | 3.095 ms per file | — |
| fs.glob | 1 files · uncontended | 1 | 2.36 | 2.36 | 2.36 | 2.36 | 1.83× | 1.83× | — | — | 48 / 3,840 / 0 | — | 2.358 ms per file | — |
| fs.glob | 17–64 files · contended | 8 | 6.68 | 12.51 | 12.51 | 21.85 | 1.56× | 1.91× | 12.96 | 27.00 | 101 / 10,235 / 0 | — | 0.1654 ms per file | — |
| fs.glob | 17–64 files · uncontended | 14 | 7.90 | 38.20 | 38.20 | 41.62 | 1.37× | 4.92× | 10.56 | 14.89 | 100 / 13,635 / 0 | — | 0.2229 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 2.78 | 2.78 | 2.78 | 2.78 | 0.85× | 0.68× | -15.02 | -54.47 | 66 / 5,244 / 0 | — | 0.928 ms per file | — |
| fs.glob | 2–4 files · uncontended | 3 | 3.17 | 3.17 | 3.17 | 4.16 | 1.12× | 0.90× | -2.04 | -5.81 | 49 / 4,790 / 0 | — | 1.0393 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 5.32 | 5.32 | 5.32 | 5.32 | 1.50× | 1.28× | 9.26 | 15.77 | 100 / 7,134 / 0 | — | 0.665 ms per file | — |
| fs.glob | 5–16 files · uncontended | 12 | 3.10 | 7.17 | 7.17 | 8.05 | 1.01× | 1.45× | -0.74 | -2.83 | 61 / 5,149 / 0 | — | 0.4063 ms per file | — |
| fs.glob | >64 files · contended | 8 | 7.07 | 17.67 | 17.67 | 23.91 | 1.34× | 2.33× | 19.14 | 59.07 | 152 / 9,382 / 0 | — | 0.0294 ms per file | — |
| fs.glob | >64 files · uncontended | 17 | 7.05 | 52.63 | 52.63 | 55.68 | 1.30× | 2.87× | 8.99 | 13.92 | 73 / 10,843 / 0 | — | 0.02 ms per file | — |
| fs.grep | 1 files · uncontended | 1 | 3.16 | 3.16 | 3.16 | 3.16 | 1.08× | 1.08× | — | — | 46 / 2,922 / 0 | — | 3.156 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 8 | 18.36 | 32.77 | 32.77 | 46.52 | 2.10× | 3.28× | 15.01 | 30.30 | 412 / 24,408 / 0 | — | 0.6041 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 8 | 13.60 | 20.24 | 20.24 | 102.36 | 1.21× | 1.55× | 10.14 | 14.17 | 302 / 13,161 / 0 | — | 0.3963 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 2.31 | 2.31 | 2.31 | 3.46 | 0.64× | 0.47× | -7.47 | 11.40 | 69 / 3,103 / 0 | — | 1.1533 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 4 | 3.44 | 3.71 | 3.71 | 3.89 | 0.91× | 0.75× | 5.84 | 8.74 | 79 / 4,943 / 0 | — | 0.9867 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 5 | 8.02 | 11.61 | 11.61 | 12.26 | 1.42× | 2.06× | 2.30 | 5.76 | 236 / 12,450 / 0 | — | 0.8171 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 8 | 5.27 | 10.82 | 10.82 | 16.45 | 0.95× | 1.31× | -3.52 | -8.16 | 130 / 6,864 / 0 | — | 0.6766 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 13 | 29.37 | 63.78 | 63.78 | 86.32 | 1.21× | 2.62× | -0.08 | 13.87 | 717 / 26,211 / 0 | — | 0.1556 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 12 | 22.59 | 43.69 | 43.69 | 44.68 | 0.93× | 1.05× | 2.64 | 7.28 | 538 / 31,218 / 0 | — | 0.1158 ms per file | sdk.lines |
| fs.list | 17–64 entries · contended | 11 | 5.67 | 7.31 | 7.31 | 12.71 | 1.19× | 1.26× | 8.04 | 17.48 | 146 / 12,866 / 0 | — | 0.1153 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 12 | 3.43 | 6.44 | 6.44 | 11.22 | 1.00× | 0.84× | -0.32 | 3.06 | 66 / 5,355 / 0 | — | 0.0838 ms per entrie | — |
| fs.list | 2–4 entries · contended | 2 | 2.16 | 2.16 | 2.16 | 6.42 | 0.66× | 0.65× | -12.01 | -41.02 | 40 / 2,629 / 0 | — | 1.08 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 6 | 2.72 | 2.92 | 2.92 | 3.27 | 1.10× | 0.90× | 6.00 | 10.67 | 49 / 3,735 / 0 | — | 0.7242 ms per entrie | — |
| fs.list | 5–16 entries · contended | 10 | 5.13 | 6.75 | 6.75 | 7.49 | 1.51× | 1.22× | 9.74 | 17.58 | 103 / 7,437 / 0 | — | 0.3938 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 16 | 3.83 | 5.84 | 5.84 | 6.54 | 1.17× | 1.06× | 4.55 | 5.35 | 66 / 6,161 / 0 | — | 0.3861 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 4 | 4.82 | 7.41 | 7.41 | 14.06 | 1.20× | 1.70× | 12.02 | 17.75 | 115 / 6,101 / 0 | — | 0.0051 ms per byte | sdk.lines |
| fs.read | ≤1 KiB · uncontended | 6 | 3.26 | 3.30 | 3.30 | 4.87 | 1.29× | 1.12× | 2.10 | 1.75 | 63 / 3,822 / 0 | — | 0.0037 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 3.11 | 3.11 | 3.11 | 3.11 | 0.95× | 0.87× | 8.32 | 16.07 | 43 / 2,805 / 0 | — | 0.0001 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.37 | 2.37 | 2.37 | 4.71 | 0.83× | 0.76× | -2.56 | -2.97 | 62 / 3,156 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 19 | 3.72 | 7.45 | 7.45 | 8.20 | 1.12× | 1.42× | 5.08 | 8.26 | 80 / 5,418 / 0 | — | 0.001 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 22 | 2.41 | 3.18 | 3.58 | 5.31 | 0.91× | 0.51× | -0.81 | -0.46 | 51 / 3,590 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 76 | 10.96 | 30.24 | 49.86 | 52.50 | 1.07× | 1.61× | -9.05 | -12.64 | 235 / 14,482 / 0 | — | 10.965 ms per file | commit |
| fs.rm | 1 files · uncontended | 61 | 7.79 | 15.12 | 21.07 | 42.77 | 0.86× | 1.08× | -2.32 | -0.59 | 135 / 6,442 / 0 | — | 7.788 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 6 | 3.27 | 5.01 | 5.01 | 5.15 | 1.15× | 1.76× | 0.33 | 4.01 | 55 / 4,321 / 0 | — | 0.006 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 8 | 2.31 | 3.31 | 3.31 | 4.30 | 0.82× | 1.00× | -2.70 | -2.39 | 44 / 3,305 / 0 | — | 0.005 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 3 | 3.19 | 3.19 | 3.19 | 3.56 | 1.35× | 1.35× | — | — | 63 / 3,700 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 3 | 1.67 | 1.67 | 1.67 | 2.35 | 0.68× | 0.68× | -7.55 | -11.06 | 36 / 2,636 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 5 | 3.02 | 5.57 | 5.57 | 8.39 | 1.25× | 1.79× | 6.33 | 11.17 | 74 / 7,315 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 8 | 2.79 | 3.95 | 3.95 | 6.11 | 0.99× | 1.10× | 4.64 | 7.32 | 41 / 2,902 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 7 | 2.74 | 3.17 | 3.17 | 5.08 | 1.00× | 1.03× | 8.79 | 17.23 | 49 / 4,696 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 17 | 2.37 | 3.62 | 3.62 | 3.97 | 0.99× | 1.16× | 0.99 | 1.43 | 43 / 3,723 / 0 | — | 0.0006 ms per byte | — |
| fs.write | >512 KiB · contended | 6 | 23.90 | 25.00 | 25.00 | 25.09 | 1.38× | 1.45× | 7.86 | 9.22 | 438 / 21,163 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 8 | 12.88 | 15.07 | 15.07 | 30.02 | 1.09× | 1.02× | 5.43 | 12.82 | 172 / 6,047 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 84 | 15.92 | 57.93 | 209.34 | 351.04 | 1.09× | 0.85× | -1.65 | -1.38 | 345 / 20,625 / 0 | — | 0.0304 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 107 | 7.91 | 15.90 | 22.22 | 27.06 | 1.03× | 1.02× | -0.88 | -0.37 | 152 / 6,951 / 0 | — | 0.0163 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 19 | 28.39 | 360.25 | 360.25 | 498.38 | 1.70× | 7.23× | 14.67 | 20.84 | 696 / 49,177 / 0 | — | 0.0004 ms per byte | files.change |
| fs.write | ≤512 KiB · uncontended | 35 | 11.63 | 18.19 | 21.25 | 26.56 | 1.03× | 1.00× | 0.86 | 2.31 | 163 / 7,907 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 131 | 15.12 | 85.89 | 104.65 | 519.59 | 1.06× | 2.96× | 2.33 | 6.81 | 339 / 18,998 / 0 | — | 0.001 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 179 | 9.06 | 18.38 | 25.23 | 31.42 | 1.08× | 1.15× | 3.70 | 7.09 | 159 / 6,801 / 0 | — | 0.0007 ms per byte | files.change |
| fs.write | ≤8 KiB · contended | 222 | 15.52 | 45.38 | 112.55 | 247.93 | 1.36× | 1.29× | 2.71 | 4.81 | 312 / 17,937 / 0 | — | 0.0044 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 201 | 8.69 | 19.49 | 43.77 | 147.40 | 1.15× | 1.59× | 2.88 | 4.67 | 151 / 6,748 / 0 | — | 0.0025 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.89 | 0.89 | 0.89 | 0.89 | 1.30× | 1.30× | 1.06 | 11.05 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 56 | 33.79 | 71.03 | 75.96 | 76.58 | 1.17× | 1.57× | 5.09 | 9.70 | 383 / 30,870 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 104 | 25.21 | 52.39 | 78.39 | 242.22 | 1.00× | 1.06× | -2.17 | -2.73 | 263 / 21,995 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 19 | 3.78 | 6.09 | 6.09 | 12.99 | 0.96× | 0.95× | 3.75 | 7.23 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 44 | 3.50 | 5.77 | 10.03 | 10.21 | 1.03× | 0.97× | -0.44 | 0.19 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 14 | 12.05 | 15.81 | 15.81 | 19.68 | 1.13× | 0.85× | 7.27 | 20.16 | 133 / 5,391 / 0 | — | 12.046 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 18 | 8.88 | 11.27 | 11.27 | 11.79 | 1.04× | 0.97× | -2.12 | -3.58 | 119 / 5,205 / 0 | — | 8.875 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 396.72 | 396.72 | 396.72 | 396.72 | 1.53× | 1.53× | 13.02 | 32.70 | 13,222 / 515,787 / 0 | — | 396.724 ms per file | commit |
| sandbox.commit | 1 files · UpToDate · uncontended | 1 | 3.84 | 3.84 | 3.84 | 3.84 | no baseline | no baseline | — | — | 6 / 71 / 0 | — | 3.839 ms per file | observe.after |
| sandbox.commit | 2–4 files · Committed · contended | 3 | 19.99 | 19.99 | 19.99 | 23.74 | 1.73× | 1.37× | 8.09 | 6.94 | 180 / 8,669 / 0 | — | 7.913 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 11 | 11.27 | 21.65 | 21.65 | 32.44 | 1.09× | 1.16× | -2.69 | -5.31 | 184 / 9,866 / 0 | — | 5.42 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 4 | 17.25 | 24.90 | 24.90 | 29.46 | 1.02× | 1.30× | -29.05 | -57.41 | 212 / 11,320 / 0 | — | 2.1043 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 1 | 102.75 | 102.75 | 102.75 | 102.75 | 6.68× | 6.29× | 29.08 | 29.54 | 284 / 15,292 / 0 | — | 17.1242 ms per file | commit |
| sandbox.commit | — · Committed · uncontended | 15 | 120.72 | 1226.19 | 1226.19 | 14553.62 | 1.28× | 1.02× | 3.96 | 5.88 | 1,413 / 56,884 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 283 | 47.32 | 979.65 | 5928.14 | 6796.22 | 0.08× | 0.99× | -46.43 | -50.93 | — | 4552.30 | — | — |
| sandbox.exec | 0 files · uncontended | 227 | 34.29 | 684.21 | 1019.60 | 7360.72 | 0.98× | 1.00× | -1.01 | -2.23 | — | 4,646 | — | — |
| sandbox.exec | 1 files · contended | 44 | 35.80 | 51.07 | 59.35 | 82.72 | 0.95× | 0.96× | -0.91 | -1.21 | — | 4.70 | 35.798 ms per file | — |
| sandbox.exec | 1 files · uncontended | 67 | 33.10 | 60.22 | 80.90 | 227.85 | 0.91× | 0.96× | -1.21 | -2.63 | — | 4.70 | 33.104 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 71.81 | 71.81 | 71.81 | 82.89 | 1.08× | 1.04× | 0.85 | 1.22 | — | 98 | 3.5906 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 4 | 56.68 | 62.65 | 62.65 | 66.33 | 0.85× | 0.83× | -1.90 | -0.29 | — | 91 | 2.8342 ms per file | — |
| sandbox.exec | 2–4 files · contended | 30 | 39.37 | 62.99 | 70.13 | 76.08 | 1.10× | 1.04× | -1.80 | -2.25 | — | 10.70 | 12.319 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 40 | 39.48 | 67.39 | 68.27 | 76.76 | 1.06× | 1.01× | -0.22 | -1.16 | — | 9.60 | 15.656 ms per file | — |
| sandbox.exec | 5–16 files · contended | 24 | 55.92 | 90.41 | 113.70 | 176.46 | 1.30× | 1.27× | -5.28 | -11.53 | — | 31 | 7.9096 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 17 | 55.97 | 71.11 | 71.11 | 71.90 | 1.32× | 1.05× | -1.50 | -1.24 | — | 33 | 7.775 ms per file | — |
| sandbox.exec | — · contended | 20 | 3397.40 | 29110.75 | 29110.75 | 30389.96 | 1.03× | 0.98× | -12.91 | -7.70 | — | 50856.50 | — | — |
| sandbox.exec | — · uncontended | 30 | 140.25 | 28702.09 | 29734.21 | 36094.74 | 0.44× | 1.55× | -14.70 | -10.25 | — | 44001.40 | — | — |
| sandbox.mount | — · contended | 110 | 11.42 | 22.27 | 30.87 | 57.43 | 1.12× | 1.33× | 2.82 | 5.52 | 56 / 1,548 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 177 | 9.82 | 16.23 | 23.31 | 41.21 | 0.98× | 0.91× | 0.96 | 2.42 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 4.17 | 4.29 | 4.29 | 46.33 | 0.83× | 0.59× | 0.67 | 3.60 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 93 | 14.60 | 24.49 | 31.87 | 35.76 | 1.14× | 1.13× | 4.76 | 8.64 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 194 | 12.81 | 30.28 | 125.40 | 232.60 | 0.95× | 1.22× | 1.58 | 2.83 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 15 | 0.0 KiB | 805.6 KiB | 3,553 | ok 15 |
| branch.diff_commits | branch | 406 | 0.0 KiB | 22.4 MiB | 75,595 | ok 406 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 96.0 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 2 | 0.0 KiB | 0.0 KiB | 0 | Added 2 |
| fs.apply | fs | 50 | 1.1 MiB | 0.0 KiB | 61 | Committed 50 |
| fs.diff_files | fs | 66 | 0.0 KiB | 555.5 KiB | 58 | Text 54, NoSuchPath 8, Equal 4 |
| fs.glob | fs | 76 | 0.0 KiB | 73.2 KiB | 955 | ok 76 |
| fs.grep | fs | 71 | 0.0 KiB | 280.4 KiB | 1,124 | ok 71 |
| fs.list | fs | 69 | 0.0 KiB | 359.9 KiB | 2,344 | ok 69 |
| fs.read | fs | 60 | 0.0 KiB | 224.6 KiB | 60 | ok 60 |
| fs.rm | fs | 137 | 0.0 KiB | 0.0 KiB | 137 | Committed 137 |
| fs.stat | fs | 65 | 0.0 KiB | 14.2 KiB | 65 | ok 65 |
| fs.write | fs | 992 | 20.9 MiB | 0.0 KiB | 992 | Committed 989, UpToDate 3 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 296 | 0.0 KiB | 0.0 KiB | 0 | Committed 231, UpToDate 64, Conflict 1 |
| sandbox.exec | sandbox | 799 | 2.3 MiB | 6.9 MiB | 0 | exit:0 797, exit:2 2 |
| sandbox.mount | sandbox | 297 | 0.0 KiB | 0.0 KiB | 0 | Mounted 297 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 297 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 297 |

### C. Scale probes

Binary: daemon `32eda22d657d`.

Load average (1-min, runner (Docker VM kernel)): start 4.41 · end 1.63.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.137 | 12.82 · 1.223 · 1.137 · 1 · 0.998 | 2.24–2.24 | statements 32, vm_steps 1087, fullscan_steps 0, sorts 0, returned_rows 88 |
| read | 0.972 | 1.2 · 0.972 · 0.985 · 0.962 · 0.953 | 2.24–2.24 | statements 18, vm_steps 784, fullscan_steps 0, sorts 0, returned_rows 74 |
| list_small | 1.056 | 1.628 · 1.233 · 1.027 · 0.974 · 1.056 | 2.24–2.24 | statements 18, vm_steps 793, fullscan_steps 0, sorts 0, returned_rows 74 |
| list_largest | 10.446 | 12.818 · 10.806 · 10.43 · 10.144 · 10.446 | 2.24–2.24 | statements 191, vm_steps 27381, fullscan_steps 0, sorts 0, returned_rows 2620 |
| grep_scoped | 1.132 | 1.581 · 1.132 · 1.272 · 1.019 · 1.021 | 2.24–2.24 | statements 23, vm_steps 939, fullscan_steps 0, sorts 0, returned_rows 83 |
| glob_scoped | 1.099 | 0.939 · 0.921 · 1.566 · 1.101 · 1.099 | 2.24–2.24 | statements 17, vm_steps 772, fullscan_steps 0, sorts 0, returned_rows 73 |
| grep_tree | 5601.29 | 5620.74 · 5622.47 · 5574.403 · 5601.29 · 5596.322 | 1.75–2.14 | statements 64800, vm_steps 4762135, fullscan_steps 0, sorts 0, returned_rows 472745 |
| glob_tree | 10.41 | 10.798 · 10.41 · 10.754 · 9.888 · 9.174 | 1.75–1.75 | statements 134, vm_steps 21297, fullscan_steps 0, sorts 0, returned_rows 2171 |
| diff_files | 4.176 | 4.501 · 4.162 · 4.847 · 4.176 · 4.058 | 1.75–1.75 | statements 90, vm_steps 4588, fullscan_steps 0, sorts 0, returned_rows 444 |
| list_commits | 0.719 | 1.313 · 0.714 · 0.665 · 0.719 · 0.787 | 1.75–1.75 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.186 | 2.829 · 2.382 · 2.186 · 1.962 · 2.148 | 1.75–1.75 | statements 64, vm_steps 2318, fullscan_steps 0, sorts 0, returned_rows 258 |
| fork | 0.531 | 1.344 · 0.45 · 0.419 · 0.538 · 0.531 | 1.75–1.75 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 28.072 | 29.702 · 29.328 · 27.929 · 26.539 · 28.072 | 1.75–1.75 | statements 513, vm_steps 23800, fullscan_steps 0, sorts 0, returned_rows 1775 |
| oneshot_mount_unmount | 16.044 | 19.392 · 15.721 · 16.324 · 14.86 · 16.044 | 1.75–1.75 | statements 66, vm_steps 2307, fullscan_steps 82, sorts 2, returned_rows 224 |
| oneshot_commit | 69.396 | 82.462 · 65.05 · 66.978 · 69.396 · 71.212 | 1.75–1.75 | statements 191, vm_steps 12471, fullscan_steps 82, sorts 2, returned_rows 941 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.75–1.75 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r054: 404,880 pages of 4,096 B, 0 free · Commits 65,702 · Branches 1,373 · Layers 66 · compression 3.70× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 211,263 | 1.29 GiB |
| 2 | 73,624 | 1.12 GiB |
| 3 | 17,840 | 7.1 MiB |
| 4 | 52 | 10.3 KiB |
| 5 | 17,721 | 1.8 MiB |
| 6 | 180,663 | 870.1 MiB |
| 7 | 506,383 | 124.1 MiB |
| 8 | 1,548 | 450.1 KiB |
| 9 | 140,614 | 308.9 MiB |
| 10 | 70,511 | 8.7 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 2,502 | 205.3 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 67,621 | 142.9 MiB |
| 1 | 71,979 | 881.2 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 274,144 | 1.05 GiB | 38.5 MiB |
| inode_value | 78,448 | 306.4 MiB | 6.0 MiB |
| binding_hint | 23,820 | 93.0 MiB | 8.8 MiB |
| object_location | 16,747 | 65.4 MiB | 6.8 MiB |
| commit | 5,461 | 21.3 MiB | 3.4 MiB |
| file_digest | 1,643 | 6.4 MiB | 741.6 KiB |
| commit_lineage | 1,423 | 5.6 MiB | 684.7 KiB |
| commit_runs | 1,380 | 5.4 MiB | 715.2 KiB |
| commit_identity | 1,008 | 3.9 MiB | 427.1 KiB |
| content_signature | 157 | 628.0 KiB | 9.7 KiB |
| branch | 60 | 240.0 KiB | 39.1 KiB |
| branch_names | 22 | 88.0 KiB | 14.7 KiB |
| branch_identity | 16 | 64.0 KiB | 10.2 KiB |
| run_merges | 8 | 32.0 KiB | 8.2 KiB |
| history_meta | 8 | 32.0 KiB | 2.1 KiB |
| sqlite_schema | 6 | 24.0 KiB | 7.7 KiB |
| layer | 4 | 16.0 KiB | 4.3 KiB |
| layers_source | 3 | 12.0 KiB | 6.3 KiB |
| layers_child | 3 | 12.0 KiB | 6.3 KiB |
| absorbed_heights | 3 | 12.0 KiB | 4.4 KiB |

### E. Stage times

**Time 334.9 s** (tooling): play 129.7 · consolidate 121.0 · verify 27.2 · probes 29.1 · tests 0.0 · seal + snapshot 11.2 · report 16.7

334.92 s tooling: prepare 1.57 · play 128.17 · consolidate 121.00 · verify 15.48 (diff_commits + full compareTree) · version walk 11.72 · probes 29.06 · metrics 0.84 · seal 1.43 · sealed figures 5.15 · snapshot copy 4.64 · report 0.47

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 32eda22d657d10ba2b419652882f2be41fd2b99cbf38e3eeb32d39a19dc16d88 | 2026-10-20T09:32:25.446Z | optimize | Speed: fs.glob 17–64 files · uncontended: 4.92× baseline (no phase); not judged: sandbox.commit 5–16 files · Committed · uncontended: 7/4/6 calls (6.68×), fs.apply ≤1 KiB · uncontended: 4/19/11 calls (2.52×) (baseline class under 5 calls per range); Scaling: branch.diff_commits checkpoint statements in total (entries exponent -0.031): tree files exponent 0.67; Counters: oneshot_mount_unmount.statements: depth exponent 2.423; Contended work: not judged: no contended class has 3 ranges of 5+ calls with per-call SQL over a tree that grew 1.5× (10 classes too narrow); SQL per call (sql.call); Directory share: 0.518 |

### G. Evidence

- `~/lfs-history/metrics/range-054.a1.json`
- trace `~/lfs-history/runs/p3-main-x/trace/range-054.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-x/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-054.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r054-3-apps-cli | 573 | 619.9 KiB |
| r054-4-packages-client | 497 | 611.6 KiB |
| r054-2-root | 388 | 614.4 KiB |
| r054-1-agents-notes | 548 | 619.5 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 454.0 | 4,989 |
| `git diff --stat` | 39.0 | 4,982 |
| `git add -f` | 39.0 | — |
| `git rm --cached` | 10.0 | — |
| `git commit` | 45.0 | 4,983 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r054-2-root | end | P1 | pass | — | — |
| r054-2-root | end | P2 | pass | exit 0 | — |
| r054-2-root | end | P3 | n/a | an install, not a refresh | — |
| r054-2-root | end | P4 | pass | 45 emitted files, exit 0 | — |
| r054-2-root | end | P5 | pass | 5 files | — |
| r054-2-root | end | P6 | n/a | not a repair | — |
| r054-3-apps-cli | end | P1 | pass | — | — |
| r054-3-apps-cli | end | P2 | pass | exit 0 | — |
| r054-3-apps-cli | end | P3 | pass | 293 bookkeeping path(s) | — |
| r054-3-apps-cli | end | P4 | pass | 124 emitted files, exit 2 | — |
| r054-3-apps-cli | end | P5 | pass | 27 files | — |
| r054-3-apps-cli | end | P6 | n/a | not a repair | — |
| r054-1-agents-notes | end | P1 | pass | — | — |
| r054-1-agents-notes | end | P2 | pass | exit 0 | — |
| r054-1-agents-notes | end | P3 | pass | 293 bookkeeping path(s) | — |
| r054-1-agents-notes | end | P4 | pass | 53 emitted files, exit 0 | — |
| r054-1-agents-notes | end | P5 | pass | 37 files | — |
| r054-1-agents-notes | end | P6 | n/a | not a repair | — |
| r054-4-packages-client | end | P1 | pass | — | — |
| r054-4-packages-client | end | P2 | pass | exit 0 | — |
| r054-4-packages-client | end | P3 | pass | 293 bookkeeping path(s) | — |
| r054-4-packages-client | end | P4 | pass | 320 emitted files, exit 2 | — |
| r054-4-packages-client | end | P5 | pass | 61 files | — |
| r054-4-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2281 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
