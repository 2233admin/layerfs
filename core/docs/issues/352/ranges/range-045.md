# Range 045 · **optimize** · attempt 1

**Matches git ✓** · daemon `27a769a48998` · image `d3773b4e` · plan v2 · continued from r044 (live Store)
dsh `208a44a7e`..`d42f6e9e1` · **64 commits** (21 mainline, 43 side) · 2026-07-24 → 2026-07-28
Areas changed: `packages/client` 27% · `.agents/notes` 20% · `/` 13% · other 41%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.22×** · **Churn 0.00**
**Time split:** play 97.3 s · git 92.9 s · Node 186.9 s · verify 9.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **800.4 MiB** (+2.3 MiB) | **1.26 GiB** (+32.4 MiB) live | **1.61×** (prev 1.57×) | **32.0 MiB** | **1,114** (total 53,964) | **263.2 s** tooling (total 147.9 min) |

**Checks:** 15 pass · 2 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.78× it; Scaling not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.364) and statements per entry does not rise (0.039): the fixed and per-entry parts cannot be separated · 2 optimize/stop: Counters, Contended work
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ sandbox.commit p95 +39% · ▲ fs.read p95 +21% · ▲ fs.write p95 +21%
**Budget:** 46 of 202 ranges · projected total 15.5 h (budget 16.8 h) · disk 41% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **463 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 2,092 / 2,092 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 2956 package groups equal · not byte-compared: 3 pnpm state file(s) · by target: 413 bin shims, 4468 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (54 lines from 4 .gitignore files) · **156 picks** in 3 merges (156 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `d42f6e9e1`** · 171 commits written for 171 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 220 untracked, unignored (999,872 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 156 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r045-1-agents-notes | end | `3c23b9d8608c` | `a355e952cc2d` | pass (415 normalized) | pass | pass | pass | n/a | n/a |
| r045-3-root | end | `12256096b952` | `0899f9a5d152` | pass (418 normalized) | pass | n/a | pass | pass | n/a |
| r045-2-packages-client | end | `9cea7e94abf3` | `a355e952cc2d` | pass (415 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `2cf97a0ad27c` | `null` | n/a | pass | n/a | n/a | pass | pass (138,575 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/ui/tui/tests/plugin-shape.spec.ts` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively) · `packages/ui/tui/tests/xml-tool-output.spec.ts` (fails natively) · `packages/host/apiproxy/tests/fetch-carrier.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-commands.spec.ts` (fails natively) · `packages/host/apiproxy/tests/api-proxy-workspace.spec.ts` (fails natively) · `packages/host/apiproxy/tests/client-handler.spec.ts` (fails natively) · `packages/llm/llm-pi-ai/tests/adapter.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton-branches.spec.tsx` (fails natively) · `packages/pty/pty-local/tests/index.spec.ts` (fails natively) · `packages/pty/pty-local/tests/local.spec.ts` (fails natively) · `packages/pty/tool-pty/tests/loader-composition.spec.ts` (fails natively) · `packages/client/ui-slash/tests/apply.spec.ts` (fails natively) · `packages/client/runtime/tests/wire-events.spec.ts` (fails natively) · `packages/client/runtime/tests/queue-store.spec.ts` (fails natively) · `packages/client/runtime/tests/client-apply.spec.ts` (fails natively) · `packages/client/runtime/tests/manager.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-scenarios.spec.tsx` (fails natively) · `packages/client/runtime/tests/workspaces-service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/input-matrix.spec.tsx` (fails natively) · `packages/client/ui-slash/tests/service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/gate-branch-tails.spec.tsx` (fails natively) · `packages/client/runtime/tests/sessions-service.spec.ts` (fails natively) · `packages/client/ui-conversation/tests/skeleton.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/chat-code-subcalls.spec.tsx` (fails natively) · `packages/client/ui-conversation/tests/input-bar.spec.tsx` (fails natively) · `packages/client/runtime/tests/session.spec.ts` (fails natively) · `packages/client/ui-workspace/tests/workspace-picker.spec.tsx` (fails natively) · `packages/ui/tui/tests/tui.spec.ts` (fails natively).

## 2. Activity

**2,825 calls** · **143 steps** by **8 agents + lead** on **3 Branches + main** · **191 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +164 added · 747 modified · −148 deleted · 12.2 MiB written · fs 969 : Sandbox 90 (**11 : 1**, reported only in P3)
**Execs:** 525 (JS 54 · shell 471) · 3 non-zero exits · install 0 · test runs 4 · version figures 13 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,273 | 983 | 290 | Committed 983 · Text 30 · NoSuchPath 8 · Equal 1 |
| sandbox | 1,099 | 713 | 4 | commit 188 (Committed 145, UpToDate 42, Conflict 1) · exec 525 (exit:0 522, exit:2 3) · mount 191 (Mounted 191) · status 4 · unmount 191 (Unmounted 191) |
| branch | 443 | 31 | 412 | diff_branches 10 · diff_commits 402 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,825** | **1,727** | **716** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r045-1-agents-notes | a01 a02 | 35 | 308 | ✓ | — |
| r045-2-packages-client | a03 a04 a05 a06 | 72 | 346 | ✓ | — |
| r045-3-root | a07 a08 | 30 | 317 | ✓ | — |
| main | lead | 6 | 143 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r045-2, a06 after a04 | 0.1 s |
| Stale clean merge | 1 / 1 | r045-2, a03 a04 | merged cleanly |
| Decoy edit | 1 / 1 | r045-2, a05 a04 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r045-1 | 18 | 8 | 10 | 0 | 0 | 76 | — |
| a02 | r045-1 | 17 | 8 | 9 | 0 | 0 | 232 | — |
| a03 | r045-2 | 18 | 8 | 10 | 0 | 0 | 109 | stale-clean-merge |
| a04 | r045-2 | 24 | 10 | 14 | 0 | 0 | 108 | commit-conflict, stale-clean-merge, decoy |
| a05 | r045-2 | 9 | 6 | 3 | 0 | 0 | 22 | decoy |
| a06 | r045-2 | 21 | 6 | 15 | 0 | 0 | 107 | commit-conflict |
| a07 | r045-3 | 15 | 5 | 10 | 0 | 0 | 229 | — |
| a08 | r045-3 | 15 | 3 | 12 | 0 | 0 | 88 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 143 | — |
| **Total** |  | **143** | **55** | **83** | **5** | **0** | **1,114** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 98 · pnpm 1 · tsc 3 · vitest 4 · other 419

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r045-2-packages-client | 46 | 46 | 46 | 0 | 46 | 766 |
| r045-1-agents-notes | 22 | 22 | 22 | 4 | 22 | 411 |
| r045-3-root | 23 | 23 | 23 | 6 | 23 | 255 |
| **lead** | — | — | — | — | 171 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r045-1-agents-notes | 0 | 1 | 1 | 0 | 0 | — / — |
| r045-3-root | 1 | 0 | 1 | 1 | 27 | 27 / 27 |
| r045-2-packages-client | 0 | 1 | 1 | 1 | 98 | 98 / 98 |
| **lead repair** | 1 | — | 1 | — | — | 138,575 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r044) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 798.1 MiB (24.5 MiB / 656.0 MiB / 22.3 MiB / 95.2 MiB) | 800.4 MiB (24.7 MiB / 656.0 MiB / 22.6 MiB / 97.1 MiB) | +2.3 MiB |
| Version figures from | — | incremental (73,780 changed paths) | — |
| Files / directories / symlinks | 63,969 / 9,818 / 4,461 | 64,020 / 9,828 / 4,476 | +51 / +10 / +15 |
| Largest file / largest directory | 23.5 MiB / 2,252 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 2,252 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.6_@opentelemetry+api@1.9.0/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 1.23 GiB | 1.26 GiB | +32.4 MiB |
| **Space amplification** (total · tracked) | 1.57× · tracked 4.90× | 1.61× · tracked 4.94× | 0.04 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **7.61** (1.04 / 0.23 / 1.31) | 1.17× the median range |
| **Stored per Commit** | 38.9 KiB | 29.8 KiB | — |
| Metadata share | 0.42 | 0.42 | this range 0.50 |
| History: Commits / Layers / Branches | 52,850 | 53,964 / 29 / 609 | +1,114 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 10.47 GiB (Commits 8.27 GiB · installs 869.7 MiB · build 100.1 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 40.48 GiB / 41% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 739.9 MiB | 0.92 | +13.1 MiB |
| Metadata | 114.4 MiB | 0.14 | +2.8 MiB |
| Index rows + waste + other (live, not split) | 432.6 MiB | 0.54 | — |
| **Total = Store on disk** | **1.26 GiB** | **= 1.61** space amplification | +32.4 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 24.7 MiB | 122.1 MiB (66.0 MiB + 56.1 MiB) | 4.94× | — | 1.8 MiB | 4.2 MiB | 0.44 |
| `node_modules` | 656.0 MiB | 213.2 MiB (187.2 MiB + 26.0 MiB) | 0.33× | — | 1.0 MiB | 139.0 KiB | 7.48 |
| Build output | 22.6 MiB | 22.6 MiB (20.9 MiB + 1.7 MiB) | 1.00× | — | 791.1 KiB | 8.3 MiB | 0.09 |
| `.git` | 97.1 MiB | 441.1 MiB (422.6 MiB + 18.5 MiB) | 4.54× | — | 12.3 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 432.6 MiB | — (not divided) | — | 16.5 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 55.3 MiB | — | — | — | — | — |
| **Total** | — | **1.26 GiB** | **= 1.61×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +3,473 | — | 0 (derived) | 53% |
| Chunks (large files) | — (at snapshots) | +853 | — | — | 7% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 4,710 (with inodes, pooled) | — | — | 57% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +4,498 | — | — | — |

Delta: 2.7% at depth cap · 25% of refused bases stopped by budget · `node_modules` reinstall: absolute: 942639 new stored bytes for 224 raw changed bytes of 10 changed packages (4208.21×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 4.94× (122.1 MiB for 24.7 MiB) |
| Store growth per git commit (index / loose objects / pack) | 2.1 KiB / 5.2 KiB / 7.3 KiB over 262 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.22× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (1.8 MiB stored for 1.93 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.54 (3 lanes × 800.4 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.0 KiB / 2.6 KiB (budget not set) |

## 4. Speed

Daemon `27a769a48998` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.0 ms / 33.5 ms (0.96×) | 2.4 ms / 4.8 ms (1.16×) | 3.3 ms / 7.2 ms (1.48×) | 19.5 ms / 68.6 ms (1.24×) | 9.2 ms / 14.3 ms (0.79×) | 305 ms / 305 ms (0.85×) | — (native comparison in P3; exec 38.7 ms / 896 ms) |
| SQL p50: 191 stmts | 57 stmts | 64 stmts | 211 stmts | 45 stmts | 9,159 stmts | — |

**Commit cost:** 9.68 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 665 ms p50 over 191
**Slowest:** sandbox.exec 35094 ms · sandbox.exec 26486 ms · sandbox.exec 26064 ms · checkpoint diff_commits 0.10 ms and 1.55 statements per entry (73,640 entries per page)
**Scaling:** 13 of 15 probes flat · `list_largest` 0.43 · `grep_tree` 0.24

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 335 ms / 335 ms | — / — | — | git / status-cold: — |
| git status (steady) | 404 ms / 588 ms | — / — | — | git / status-steady: — |
| git add | 35.0 ms / 79.0 ms | — / — | — | git / add: — |
| git commit (lane) | 40.0 ms / 58.0 ms | — / — | — | git / commit: — |
| lead writes main | 5582 ms / 5582 ms | — / — | — | — |
| repack | 1857 ms / 1857 ms | — / — | — | — |
| pnpm install (incremental) | 3212 ms / 3212 ms | 1743 ms / 1743 ms | 1.84× | pnpm-reinstall / cold: — |
| pnpm refresh | 2942 ms / 2942 ms | 1687 ms / 1687 ms | 1.74× | pnpm-reinstall / steady: — |
| tsc -b | 5789 ms / 5789 ms | 3781 ms / 4521 ms | 1.53× | tsc-b / cold: — |
| vitest | 4324 ms / 4324 ms | 3320 ms / 3320 ms | 1.30× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 3.5 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.7 ms / 18.1 ms

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

**WAL across each class this range:** fs.write ≤1 KiB 4194304 → 4148872 B · fs.write ≤8 KiB 24752 → 4148872 B · fs.write ≤64 KiB 4194304 → 4148872 B · fs.read ≤8 KiB 4194304 → 4194304 B · sandbox.mount 4194304 → 3637992 B · sandbox.commit 1 file (Committed) 4194304 → 4194304 B · branch.merge 0 → 4091192 B
**Host load (1-min, recorded, not waited on):** macOS 4.27 at the first command → 4.74 after the last (max 6.53 over 8 commands) · Docker VM 2.65 → 1.78

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

**Watch row** (control (b)/(a) p50 over 1.25×, or (b)'s reads per call over 2× (a)'s): pass (sample control-045.a1)

## 5. Findings and action

### Finding 045.a1 · optimize

**1. Trigger** (attempt 1, daemon `27a769a48998`)

| Check | Value | Threshold |
| --- | --- | --- |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 |
| Contended work | fs.rm 1 files · contended: SQL VM steps against tree files, exponent 2.212 over 9 ranges | < 0.05 (SQL work against tree size) |

Diagnosis pending: `finding-045.a1.json`.

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

- **a1 (`p3-main-w`, live after r44 a2; daemon `27a769a4`, addon `0611f3e0`, SDK JS `e990c25c`): OPTIMIZE, terminal under the fast-mode ruling (counters recorded).** Checkpoint ok, git ✓. Node: 16 pass, 0 stop, 0 NOT_RUN over 4 points. Repair P6 pass (2,045 emitted). Control `control-045.a1` passes. Report check F1–F8 PASS.
- **Optimize rows, recorded, not acted on (fast mode):**
  - Counters `merge.returned_rows` (chain-bounded): 2,514 vs 1,941 (1.295×).
  - Contended work `fs.rm 1 files · contended`: SQL VM steps against tree files, exponent 2.212 over 9 ranges. Fix 059's cause: each remove in a notes directory relisted its parent, and the cached count was lost at every Commit. That cost grows with the directory, not the tree. The contended counters are process-wide.
- **The lead's `git clean -f -d`** removed 220 untracked, unignored files (999,872 B) and 0 folders. They are `.js`, `.d.ts` and `.map` files emitted beside sources in 8 tracked packages: `packages/ui/tui` 72 of the first 200 listed, `session-query` 40, `session-reference` 24 and others. This is the lane-split emission decision B was made for. The native clean removed the same 220. Fix 058 exempted nothing.
- **Speed** (re-baseline, recorded): not judged as a whole (the thin `sandbox.commit` "—" class, 13.78×). Merge p50 305 ms. One-shot Commit 1.24×, write 0.96× (9.0 ms), mount 0.79×; read and list are under the 5 ms floor.
- **Concurrent load:** no QUIET overlap recorded. Host 1-min load 4.7–6.5.
- Final steps: lead 3 s; lanes 21 s + 10 s + 13 s + 65 s (cuts at plan orders 29, 41 and 52); repair 112 s (alarm 200 s); verify 12 s; finish 38 s. Repair install 35.1 s, build 22.0 s, tests 3.2 s.
- Watch items: index rows + waste + other 432.6 MiB on the live Store (not split; #366). `fs.rm` uncontended p50 12.10 ms per file over 102 calls, 195 statements and 16,425 VM steps per call (the fix 059 cause); contended 13.34 ms over 43 (372 statements, process-wide; #367).


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2092/2092; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.78× it | ≤ 1.2× | watch |
| Scaling | not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.364) and statements per entry does not rise (0.039): the fixed and per-entry parts cannot be separated | < 0.15 | watch |
| Counters | merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8) | < 0.05 | optimize |
| Contended work | fs.rm 1 files · contended: SQL VM steps against tree files, exponent 2.212 over 9 ranges | < 0.05 (SQL work against tree size) | optimize |
| Directory share | 0.5 | < 0.5 | pass |
| Reinstall growth | absolute: 942639 new stored bytes for 224 raw changed bytes of 10 changed packages (4208.21×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.027 (budget 0.2549) | < 0.1 | pass |
| Range growth | 32.0 MiB, 0.94× the median | ≤ 3× median, ≤ 2 GiB | pass |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.41 | < 0.8 | pass |
| Wall projection | 0.92 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 171 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 156 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.22× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 143 | 144 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1114 | 1010 |
| Workspaces (one-shot share) | 191 (0.99) | 82 (0.976) |
| Reads | 244 | 244 |
| Reconcile writes | 134 | 134 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `27a769a48998` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 10 | 26.76 | 343.46 | 343.46 | 353.22 | 1.65× | 6.63× | -0.34 | -0.19 | 394 / 42,829 / 0 | — | 0.1125 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 6.49 | 6.49 | 6.49 | 8.68 | no baseline | no baseline | -4.88 | -9.34 | 87 / 6,114 / 0 | — | 0.3604 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 2 | 72.41 | 72.41 | 72.41 | 308.78 | no baseline | no baseline | -1.55 | -1.07 | 1,922 / 111,338 / 0 | — | 0.3108 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 393 | 18.57 | 34.97 | 47.04 | 323.39 | 1.08× | 1.35× | -0.24 | -0.19 | 304 / 35,161 / 0 | — | 0.1043 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 1.11 | 1.53 | 1.53 | 2.63 | 1.22× | 1.16× | -0.86 | -0.66 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.88 | 0.88 | 0.88 | 0.94 | no baseline | no baseline | -0.29 | -0.25 | 70 / 1,298 / 0 | — | 0.0437 ms per entrie | — |
| branch.merge | 17–64 entries · Merged (new Commit) · uncontended | 1 | 357.83 | 357.83 | 357.83 | 357.83 | 4.28× | 4.28× | 0.46 | 0.40 | 9,811 / 584,975 / 0 | — | 6.5059 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 78.58 | 78.58 | 78.58 | 305.33 | 0.85× | 0.85× | -1.81 | -1.05 | 3,060 / 204,174 / 0 | — | 0.3207 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.26 | 4.26 | 4.26 | 4.26 | 0.84× | 0.84× | -3.15 | -2.52 | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 28.60 | 28.60 | 28.60 | 28.60 | 1.17× | 1.17× | -0.02 | -0.00 | 170 / 14,796 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 3 | 5.69 | 5.69 | 5.69 | 8.30 | 0.48× | 0.42× | -1.04 | -0.31 | 112 / 3,865 / 0 | — | 0.0141 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 5 | 6.28 | 10.54 | 10.54 | 12.96 | 1.02× | 1.42× | -0.54 | -0.38 | 124 / 5,696 / 0 | — | 0.0157 ms per byte | files.change |
| fs.apply | ≤64 KiB · contended | 2 | 14.69 | 14.69 | 14.69 | 17.65 | 1.59× | 0.94× | -4.88 | -3.68 | 344 / 74,974 / 8,191 | — | 0.0006 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 5.87 | 5.87 | 5.87 | 5.87 | 0.85× | 0.61× | -0.42 | -0.09 | 112 / 4,061 / 0 | — | 0.0004 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 18 | 14.17 | 28.20 | 28.20 | 42.37 | 1.42× | 1.64× | -0.01 | 0.03 | 361 / 53,057 / 0 | — | 0.0044 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 17 | 6.47 | 9.30 | 9.30 | 21.68 | 0.99× | 0.86× | -0.62 | -0.30 | 122 / 4,899 / 0 | — | 0.0024 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 5.72 | 5.72 | 5.72 | 11.13 | 0.80× | 0.67× | -0.36 | -0.28 | 222 / 11,762 / 0 | — | — | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 10 | 6.57 | 11.82 | 11.82 | 13.34 | 1.13× | 1.47× | -0.38 | -0.30 | 170 / 8,096 / 0 | — | 0.0218 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 4 | 9.67 | 10.02 | 10.02 | 11.24 | 1.79× | 1.66× | 0.04 | 0.10 | 219 / 12,861 / 0 | — | 0.0008 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 8 | 8.71 | 11.61 | 11.61 | 14.76 | 1.40× | 1.26× | -0.64 | -0.36 | 222 / 12,634 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 8.99 | 8.99 | 8.99 | 8.99 | 1.49× | 1.39× | -0.44 | -0.24 | 268 / 13,109 / 0 | — | 0.0068 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 9 | 8.65 | 10.63 | 10.63 | 11.77 | 1.17× | 1.33× | -0.58 | -0.44 | 196 / 9,994 / 0 | — | 0.0028 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 2.29 | 2.29 | 2.29 | 2.29 | 1.69× | 1.56× | -0.02 | -0.15 | 47 / 3,298 / 0 | — | 2.285 ms per file | — |
| fs.glob | 17–64 files · contended | 1 | 4.52 | 4.52 | 4.52 | 4.52 | 1.63× | 1.63× | -0.94 | -0.76 | 112 / 6,663 / 0 | — | 0.2261 ms per file | — |
| fs.glob | 17–64 files · uncontended | 8 | 3.87 | 6.10 | 6.10 | 7.56 | 1.37× | 1.61× | 0.14 | 0.14 | 82 / 7,157 / 0 | — | 0.1196 ms per file | — |
| fs.glob | 2–4 files · uncontended | 2 | 2.39 | 2.39 | 2.39 | 2.72 | 1.36× | 1.24× | 0.40 | 0.27 | 40 / 3,719 / 0 | — | 0.6793 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 3.93 | 3.93 | 3.93 | 3.93 | 2.34× | 2.34× | -0.27 | -0.17 | 62 / 6,281 / 0 | — | 0.2807 ms per file | — |
| fs.glob | 5–16 files · uncontended | 13 | 2.56 | 4.73 | 4.73 | 4.96 | 1.27× | 2.07× | -0.03 | -0.00 | 46 / 3,859 / 0 | — | 0.3307 ms per file | — |
| fs.glob | >64 files · contended | 2 | 2.56 | 2.56 | 2.56 | 3.63 | 0.47× | 0.47× | -1.90 | -1.53 | 58 / 4,041 / 0 | — | 0.012 ms per file | — |
| fs.glob | >64 files · uncontended | 9 | 3.66 | 23.84 | 23.84 | 42.45 | 0.37× | 1.70× | -1.37 | -1.24 | 61 / 4,853 / 0 | — | 0.0172 ms per file | — |
| fs.grep | 17–64 files · contended | 2 | 5.35 | 5.35 | 5.35 | 12.30 | 0.89× | 0.89× | -1.45 | -1.11 | 144 / 6,350 / 0 | — | 0.2675 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 10 | 6.93 | 9.89 | 9.89 | 11.22 | 1.20× | 1.65× | 0.72 | 0.46 | 145 / 9,203 / 0 | — | 0.2167 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 1 | 3.90 | 3.90 | 3.90 | 3.90 | 1.00× | 0.98× | -0.40 | -0.35 | 81 / 5,176 / 0 | — | 0.976 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 3.47 | 3.47 | 3.47 | 9.07 | 1.17× | 0.69× | -0.04 | -0.01 | 112 / 5,972 / 0 | — | 0.5782 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 16 | 4.31 | 9.79 | 9.79 | 12.85 | 1.15× | 1.63× | -0.14 | -0.08 | 113 / 5,943 / 0 | — | 0.5103 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 3 | 15.02 | 15.02 | 15.02 | 25.50 | 0.96× | 0.96× | 0.70 | 0.58 | 312 / 25,933 / 0 | — | 0.1197 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 6 | 19.16 | 36.99 | 36.99 | 37.92 | 1.05× | 1.61× | 0.53 | 0.36 | 454 / 24,648 / 0 | — | 0.0874 ms per file | sdk.lines |
| fs.list | 1 entries · uncontended | 1 | 2.21 | 2.21 | 2.21 | 2.21 | 1.31× | 1.31× | -0.96 | -0.72 | 49 / 3,703 / 0 | — | 2.206 ms per entrie | — |
| fs.list | 17–64 entries · contended | 4 | 2.99 | 5.13 | 5.13 | 7.19 | 1.24× | 2.14× | -0.81 | -0.61 | 99 / 8,689 / 0 | — | 0.0598 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 16 | 3.38 | 7.10 | 7.10 | 12.00 | 1.35× | 2.42× | -0.57 | -0.51 | 69 / 5,099 / 0 | — | 0.1415 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 1 | 5.81 | 5.81 | 5.81 | 5.81 | 3.08× | 2.84× | 1.10 | 0.80 | 56 / 4,484 / 0 | — | 1.9353 ms per entrie | — |
| fs.list | 5–16 entries · contended | 2 | 2.33 | 2.33 | 2.33 | 11.22 | 1.00× | 0.82× | -0.44 | -0.18 | 49 / 3,353 / 0 | — | 0.3877 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 17 | 2.81 | 3.56 | 3.56 | 3.65 | 1.48× | 0.93× | 0.32 | 0.28 | 56 / 4,401 / 0 | — | 0.3099 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 6 | 2.44 | 3.35 | 3.35 | 5.92 | 1.54× | 2.12× | -0.27 | -0.22 | 69 / 3,574 / 0 | — | 0.0033 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 2.37 | 2.37 | 2.37 | 2.37 | 0.85× | 0.85× | -1.14 | -0.88 | 57 / 3,730 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 9 | 2.18 | 3.79 | 3.79 | 4.79 | 1.03× | 0.64× | -0.57 | -0.37 | 51 / 3,326 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 28 | 2.38 | 3.97 | 5.63 | 6.79 | 1.16× | 1.11× | -0.24 | -0.17 | 58 / 3,611 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 43 | 13.34 | 23.52 | 26.72 | 27.35 | 1.27× | 1.66× | 1.17 | 0.96 | 372 / 27,499 / 0 | — | 13.335 ms per file | commit |
| fs.rm | 1 files · uncontended | 102 | 12.10 | 18.34 | 19.57 | 35.09 | 1.81× | 1.64× | 0.29 | 0.40 | 195 / 16,425 / 0 | — | 12.101 ms per file | files.change |
| fs.stat | ≤1 KiB · contended | 2 | 2.38 | 2.38 | 2.38 | 2.40 | 1.10× | 1.06× | -0.71 | -0.55 | 46 / 3,230 / 0 | — | 0.004 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 4 | 2.61 | 2.63 | 2.63 | 3.20 | 1.70× | 1.71× | 0.19 | 0.24 | 48 / 3,544 / 0 | — | 0.0049 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 1.89 | 1.89 | 1.89 | 1.89 | 0.90× | 0.90× | -0.36 | -0.30 | 35 / 2,436 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 4 | 2.25 | 3.01 | 3.01 | 4.00 | 0.86× | 0.88× | -0.40 | -0.35 | 82 / 4,765 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 11 | 2.13 | 2.59 | 2.59 | 2.88 | 1.09× | 1.20× | 0.32 | 0.15 | 43 / 2,978 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 4 | 2.21 | 2.46 | 2.46 | 3.46 | 0.98× | 0.82× | -0.11 | -0.09 | 45 / 2,875 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 18 | 2.06 | 3.13 | 3.13 | 3.24 | 1.23× | 0.90× | -0.26 | -0.18 | 43 / 3,299 / 0 | — | 0.0006 ms per byte | — |
| fs.write | >512 KiB · contended | 1 | 13.55 | 13.55 | 13.55 | 13.55 | no baseline | no baseline | — | — | 293 / 12,202 / 0 | — | 0 ms per byte | commit |
| fs.write | >512 KiB · uncontended | 3 | 12.42 | 12.42 | 12.42 | 13.62 | no baseline | no baseline | -6.86 | -11.92 | 188 / 6,365 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤1 KiB · contended | 56 | 16.36 | 61.10 | 65.05 | 75.26 | 1.92× | 4.10× | 0.29 | 0.38 | 464 / 33,749 / 0 | — | 0.035 ms per byte | files.change |
| fs.write | ≤1 KiB · uncontended | 46 | 7.24 | 17.28 | 19.17 | 20.75 | 1.14× | 1.64× | -0.57 | -0.36 | 164 / 7,087 / 0 | — | 0.014 ms per byte | files.change |
| fs.write | ≤512 KiB · contended | 6 | 23.42 | 34.06 | 34.06 | 39.08 | 1.45× | 2.12× | 0.15 | 0.20 | 570 / 38,478 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 15 | 9.93 | 18.24 | 18.24 | 26.48 | 1.20× | 2.21× | 0.08 | 0.11 | 155 / 6,308 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 63 | 17.39 | 37.33 | 50.23 | 69.13 | 1.76× | 1.70× | -0.05 | 0.02 | 556 / 33,602 / 0 | — | 0.0011 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 143 | 7.55 | 13.73 | 20.31 | 44.41 | 1.05× | 1.01× | -0.13 | -0.04 | 161 / 6,871 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 199 | 15.55 | 42.98 | 70.94 | 87.48 | 1.59× | 1.91× | -0.20 | -0.09 | 426 / 32,705 / 0 | — | 0.0051 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 247 | 6.95 | 11.80 | 17.64 | 26.68 | 0.96× | 0.85× | -0.05 | 0.03 | 152 / 7,135 / 0 | — | 0.0023 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.87 | 0.87 | 0.87 | 0.87 | 1.15× | 1.15× | -0.27 | -0.19 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 19 | 32.58 | 46.38 | 46.38 | 143.31 | 1.55× | 1.33× | 0.05 | -0.00 | 422 / 28,638 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 73 | 25.84 | 52.60 | 68.58 | 200.97 | 1.24× | 1.52× | -0.08 | -0.08 | 330 / 30,089 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 4 | 3.34 | 3.73 | 3.73 | 5.70 | 0.87× | 0.46× | 0.17 | 0.18 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 38 | 3.44 | 5.83 | 8.02 | 13.35 | 0.86× | 1.14× | -0.16 | -0.12 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 5 | 14.08 | 15.36 | 15.36 | 26.88 | 1.46× | 0.79× | 0.25 | 0.22 | 181 / 7,246 / 0 | — | 14.078 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 15 | 9.39 | 11.53 | 11.53 | 11.93 | 1.13× | 0.94× | -0.12 | -0.09 | 130 / 4,995 / 0 | — | 9.394 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 405.90 | 405.90 | 405.90 | 405.90 | 10.65× | 10.65× | -0.00 | -0.01 | 18,663 / 672,944 / 0 | — | 405.899 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 12.03 | 12.67 | 12.67 | 26.16 | 0.81× | 0.64× | 1.28 | 1.02 | 156 / 7,866 / 0 | — | 4.009 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 8 | 10.70 | 11.24 | 11.24 | 11.57 | 1.00× | 0.66× | -0.09 | -0.09 | 152 / 8,213 / 0 | — | 3.9545 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 37.13 | 37.13 | 37.13 | 37.13 | 2.25× | 2.25× | 0.17 | 0.09 | 565 / 32,008 / 0 | — | 7.4254 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 4 | 18.64 | 18.69 | 18.69 | 25.54 | 1.36× | 1.36× | 0.90 | 0.93 | 262 / 14,628 / 0 | — | 1.9488 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 216.13 | 216.13 | 216.13 | 216.13 | no baseline | no baseline | 2.87 | 2.48 | 3,746 / 335,704 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 10 | 85.00 | 950.98 | 950.98 | 13868.90 | 1.23× | 13.78× | 0.01 | 0.09 | 1,218 / 86,582 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 136 | 549.03 | 897.40 | 3038.07 | 3461.38 | 10.71× | 2.34× | 1.62 | 1.18 | — | 4153.30 | — | — |
| sandbox.exec | 0 files · uncontended | 163 | 34.01 | 682.01 | 825.54 | 6681.98 | 1.07× | 2.38× | -0.20 | -0.17 | 0 / 0 / 0 | 4,223 | — | — |
| sandbox.exec | 1 files · contended | 24 | 33.70 | 48.12 | 50.27 | 51.27 | 0.92× | 0.57× | 0.10 | 0.07 | — | 3.70 | 33.703 ms per file | — |
| sandbox.exec | 1 files · uncontended | 43 | 36.59 | 49.54 | 52.20 | 75.92 | 1.10× | 0.73× | 0.22 | 0.18 | — | 5 | 36.592 ms per file | — |
| sandbox.exec | 17–64 files · contended | 1 | 71.91 | 71.91 | 71.91 | 71.91 | 1.03× | 1.03× | 0.07 | 0.06 | — | 89 | 4.2302 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 8 | 58.45 | 66.43 | 66.43 | 78.08 | 0.84× | 0.95× | -0.17 | -0.14 | — | 100 | 2.9224 ms per file | — |
| sandbox.exec | 2–4 files · contended | 25 | 37.74 | 49.55 | 51.19 | 55.65 | 0.97× | 0.71× | -0.03 | -0.03 | — | 9.70 | 14.3507 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 27 | 39.76 | 57.70 | 58.55 | 61.65 | 1.04× | 0.88× | -0.46 | -0.30 | — | 9.70 | 17.009 ms per file | — |
| sandbox.exec | 5–16 files · contended | 17 | 45.76 | 61.21 | 61.21 | 67.37 | 0.78× | 0.84× | 0.54 | 0.39 | — | 21 | 5.6561 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 34 | 46.61 | 72.39 | 78.51 | 82.76 | 0.66× | 0.69× | -0.21 | -0.09 | — | 22.30 | 5.5173 ms per file | — |
| sandbox.exec | — · contended | 11 | 3205.67 | 26063.76 | 26063.76 | 26486.03 | no baseline | no baseline | -1.32 | -1.03 | — | 49663.50 | — | — |
| sandbox.exec | — · uncontended | 26 | 273.75 | 14805.81 | 21996.06 | 35094.46 | 0.52× | 2.08× | 0.71 | 0.50 | — | 49663.50 | — | — |
| sandbox.mount | — · contended | 57 | 10.04 | 15.03 | 17.63 | 23.30 | 0.90× | 0.79× | -0.16 | -0.10 | 60 / 1,689 / 82 | — | — | observe.after |
| sandbox.mount | — · uncontended | 124 | 8.87 | 12.63 | 14.69 | 15.52 | 0.79× | 0.63× | -0.28 | -0.21 | 45 / 1,362 / 82 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.73 | 4.45 | 4.45 | 38.89 | no baseline | no baseline | -0.08 | -0.06 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 35 | 11.59 | 17.82 | 18.12 | 21.53 | 1.09× | 0.98× | -0.06 | 0 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 146 | 10.66 | 18.67 | 115.88 | 174.09 | 1.02× | 1.01× | -0.01 | 0.02 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 10 | 0.0 KiB | 536.0 KiB | 2,367 | ok 10 |
| branch.diff_commits | branch | 402 | 0.0 KiB | 22.1 MiB | 74,565 | ok 402 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
| branch.list_commits | project | 9 | 0.0 KiB | 85.7 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 59 | 1.7 MiB | 0.0 KiB | 70 | Committed 59 |
| fs.diff_files | fs | 39 | 0.0 KiB | 348.1 KiB | 31 | Text 30, NoSuchPath 8, Equal 1 |
| fs.glob | fs | 47 | 0.0 KiB | 57.4 KiB | 715 | ok 47 |
| fs.grep | fs | 50 | 0.0 KiB | 169.0 KiB | 812 | ok 50 |
| fs.list | fs | 53 | 0.0 KiB | 315.4 KiB | 2,018 | ok 53 |
| fs.read | fs | 49 | 0.0 KiB | 137.9 KiB | 49 | ok 49 |
| fs.rm | fs | 145 | 0.0 KiB | 0.0 KiB | 145 | Committed 145 |
| fs.stat | fs | 52 | 0.0 KiB | 11.7 KiB | 52 | ok 52 |
| fs.write | fs | 779 | 11.2 MiB | 0.0 KiB | 779 | Committed 779 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 188 | 0.0 KiB | 0.0 KiB | 0 | Committed 145, UpToDate 42, Conflict 1 |
| sandbox.exec | sandbox | 525 | 2.3 MiB | 3.9 MiB | 0 | exit:0 522, exit:2 3 |
| sandbox.mount | sandbox | 191 | 0.0 KiB | 0.0 KiB | 0 | Mounted 191 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 191 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 191 |

### C. Scale probes

Binary: daemon `27a769a48998`.

Load average (1-min, runner (Docker VM kernel)): start 2.65 · end 1.78.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.08 | 13.398 · 1.198 · 0.996 · 1.08 · 0.961 | 1.83–1.83 | statements 30, vm_steps 1032, fullscan_steps 0, sorts 0, returned_rows 85 |
| read | 1.16 | 1.16 · 1.004 · 1.18 · 1.139 · 1.672 | 1.83–1.83 | statements 17, vm_steps 750, fullscan_steps 0, sorts 0, returned_rows 72 |
| list_small | 1.018 | 1.631 · 1.151 · 1.018 · 0.965 · 0.918 | 1.83–1.83 | statements 17, vm_steps 759, fullscan_steps 0, sorts 0, returned_rows 72 |
| list_largest | 9.336 | 12.534 · 10.184 · 9.336 · 8.906 · 8.841 | 1.83–1.83 | statements 197, vm_steps 24364, fullscan_steps 0, sorts 0, returned_rows 2482 |
| grep_scoped | 1.114 | 1.389 · 1.132 · 1.015 · 1.09 · 1.114 | 1.83–1.83 | statements 22, vm_steps 905, fullscan_steps 0, sorts 0, returned_rows 81 |
| glob_scoped | 0.915 | 0.983 · 0.885 · 0.879 · 1.058 · 0.915 | 1.83–1.83 | statements 16, vm_steps 738, fullscan_steps 0, sorts 0, returned_rows 71 |
| grep_tree | 4930.278 | 4930.278 · 4949.089 · 4911.349 · 4940.662 · 4927.694 | 1.7–1.83 | statements 59969, vm_steps 4563448, fullscan_steps 0, sorts 0, returned_rows 458188 |
| glob_tree | 7.151 | 9.912 · 7.387 · 7.151 · 6.983 · 6.782 | 1.76–1.76 | statements 139, vm_steps 18324, fullscan_steps 0, sorts 0, returned_rows 1921 |
| diff_files | 4.538 | 4.777 · 4.534 · 4.456 · 4.591 · 4.538 | 1.76–1.76 | statements 84, vm_steps 4384, fullscan_steps 0, sorts 0, returned_rows 432 |
| list_commits | 0.605 | 1.257 · 0.703 · 0.592 · 0.605 · 0.573 | 1.76–1.76 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 1.861 | 2.489 · 1.837 · 1.861 · 1.981 · 1.856 | 1.76–1.76 | statements 57, vm_steps 1910, fullscan_steps 0, sorts 0, returned_rows 208 |
| fork | 0.517 | 0.405 · 0.619 · 0.374 · 0.604 · 0.517 | 1.76–1.76 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 23.651 | 25.518 · 24.01 · 22.76 · 23.651 · 23.555 | 1.76–1.76 | statements 502, vm_steps 29558, fullscan_steps 0, sorts 0, returned_rows 2514 |
| oneshot_mount_unmount | 14.196 | 16.613 · 14.196 · 14.333 · 13.624 · 13.39 | 1.76–1.76 | statements 64, vm_steps 2252, fullscan_steps 82, sorts 2, returned_rows 221 |
| oneshot_commit | 66.977 | 70.355 · 67.374 · 66.802 · 66.977 · 56.422 | 1.76–1.76 | statements 185, vm_steps 14697, fullscan_steps 82, sorts 2, returned_rows 1206 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.76–1.76 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 263.2 s** (tooling): play 98.8 · consolidate 108.3 · verify 17.0 · probes 25.6 · tests 0.0 · seal + snapshot 0.0 · report 13.5

263.16 s tooling: prepare 1.45 · play 97.30 · consolidate 108.30 · verify 9.16 (diff_commits) · version walk 7.84 · probes 25.57 · metrics 0.69 · Store allocation 0.23 · report 0.37

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 27a769a48998f22cf9998662724d348290b9fccc62cda384f910de773b8ceeda | 2026-10-20T04:38:03.109Z | optimize | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 13.78× it; Scaling: not judged: branch.diff_commits checkpoint statements: entries grow with depth (exponent 0.364) and statements per entry does not rise (0.039): the fixed and per-entry parts cannot be separated; Counters: merge.returned_rows (chain-bounded): max over the latest cap period 2514 vs the first 1941: 1.295× (bound, period 8); Contended work: fs.rm 1 files · contended: SQL VM steps against tree files, exponent 2.212 over 9 ranges |

### G. Evidence

- `~/lfs-history/metrics/range-045.a1.json`
- trace `~/lfs-history/runs/p3-main-w/trace/range-045.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-w/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r045-2-packages-client | 766 | 558.9 KiB |
| r045-1-agents-notes | 411 | 554.4 KiB |
| r045-3-root | 255 | 555.2 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 404.0 | 4,523 |
| `git diff --stat` | 35.0 | 4,512 |
| `git add -f` | 35.0 | — |
| `git rm --cached` | 8.0 | — |
| `git commit` | 40.0 | 4,517 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r045-1-agents-notes | end | P1 | pass | — | — |
| r045-1-agents-notes | end | P2 | pass | exit 0 | — |
| r045-1-agents-notes | end | P3 | pass | 269 bookkeeping path(s) | — |
| r045-1-agents-notes | end | P4 | pass | 108 emitted files, exit 2 | — |
| r045-1-agents-notes | end | P5 | n/a | no calibrated file | — |
| r045-1-agents-notes | end | P6 | n/a | not a repair | — |
| r045-3-root | end | P1 | pass | — | — |
| r045-3-root | end | P2 | pass | exit 0 | — |
| r045-3-root | end | P3 | n/a | an install, not a refresh | — |
| r045-3-root | end | P4 | pass | 165 emitted files, exit 2 | — |
| r045-3-root | end | P5 | pass | 27 files | — |
| r045-3-root | end | P6 | n/a | not a repair | — |
| r045-2-packages-client | end | P1 | pass | — | — |
| r045-2-packages-client | end | P2 | pass | exit 0 | — |
| r045-2-packages-client | end | P3 | pass | 269 bookkeeping path(s) | — |
| r045-2-packages-client | end | P4 | pass | 498 emitted files, exit 2 | — |
| r045-2-packages-client | end | P5 | pass | 98 files | — |
| r045-2-packages-client | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (2045 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
