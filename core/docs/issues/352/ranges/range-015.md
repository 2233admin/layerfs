# Range 015 · **watch** · attempt 4

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r014 (run p2-main-f)
dsh `75838e10b`..`b4ec4060a` · **67 commits** (18 mainline, 49 side) · 2026-07-12 → 2026-07-15
Areas changed: `examples/acp-agent` 15% · `packages/core` 14% · `docs/rfc` 11% · other 60%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 20 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.29×** · **Churn 0.26**
**Time split:** play 127.9 s · git 98.5 s · Node 189.1 s · verify 9.1 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **421.8 MiB** (+412.0 MiB) | **207.8 MiB** (+161.3 MiB) | **0.49×** (prev 4.74×) | **164.1 MiB** | **2,303** (total 12,851) | **253.7 s** tooling (total 9.3 min) |

**Checks:** 13 pass · 6 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 165.79× it; Scaling insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 164.1 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 817 ms for 207.8 MiB new; size exponent not judged (1 snapshots)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +1996% · ▲ range time +847% · ▲ sandbox.exec p95 +812%
**Budget:** 16 of 202 ranges · projected total 14.2 h (budget 16.8 h) · disk 35% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,332 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 3,521 / 3,521 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of its chain · **1450 package groups equal to native** · not byte-compared: 3 pnpm state file(s) · by target: 252 bin shims, 2563 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | written (30 lines from 1 .gitignore files) · **171 picks** in 3 merges (160 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `b4ec4060a`** · 191 commits written for 191 dsh commits · status clean · fresh mount read back 0 · lane guard 0 |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 160 · Build outputs 11 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lead | initial | `4b927af69eac` | `cfb4088874aa` | pass (243 normalized) | pass | n/a | pass | n/a | n/a |
| r015-3-packages-core | end | `b7a15f3142b5` | `cfb4088874aa` | pass (244 normalized) | pass | pass | pass | pass | n/a |
| r015-1-root | end | `39f4e26a7aa1` | `69ffa2c272eb` | pass (264 normalized) | pass | n/a | pass | pass | n/a |
| r015-2-docs-rfc | end | `cd4263c5458a` | `cfb4088874aa` | pass (244 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `ca5fdcb44dd2` | `null` | n/a | pass | n/a | n/a | pass | pass (94,536 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/core/scope/tests/scope.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/core/agent-core/tests/agent-core.spec.ts` (fails natively) · `packages/core/agent-core/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/gen-cordis-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/verify-export-jsdoc.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/skill/tool-skill/tests/tool-skill.spec.ts` (fails natively) · `packages/timeout/timeout-policy/tests/timeout-policy.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/web/tool-web/tests/load-path.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/deepseek.spec.ts` (fails natively) · `packages/workflow/tool-workflow/tests/tool-workflow.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively) · `packages/ui/app-boot/tests/app-boot.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/ui/stdio-agent/tests/stdio-agent.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/subagent/tests/service.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively).

## 2. Activity

**4,170 calls** · **162 steps** by **8 agents + lead** on **3 Branches + main** · **231 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +125 added · 2,148 modified · −54 deleted · 24.0 MiB written · fs 2,121 : Sandbox 206 (**10 : 1**, reported only in P3)
**Execs:** 696 (JS 55 · shell 641) · 3 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,452 | 2,136 | 316 | Committed 2,129 · Text 38 · NoSuchPath 4 · Equal 2 · UpToDate 7 |
| sandbox | 1,392 | 925 | 5 | commit 229 (Committed 189, UpToDate 39, Conflict 1) · exec 696 (exit:0 693, exit:2 3) · mount 231 (Mounted 231) · status 5 · unmount 231 (Unmounted 231) |
| branch | 316 | 32 | 284 | diff_branches 18 · diff_commits 266 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,170** | **3,093** | **615** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r015-1-root | a01 a02 | 36 | 725 | ✓ | — |
| r015-2-docs-rfc | a03 a04 a05 a06 | 78 | 649 | ✓ | — |
| r015-3-packages-core | a07 a08 | 42 | 689 | ✓ | — |
| main | lead | 6 | 240 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r015-2, a06 after a03 | 0.1 s |
| Stale clean merge | 1 / 1 | r015-2, a03 a04 | merged cleanly |
| Decoy edit | 1 / 1 | r015-2, a04 a06 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r015-1 | 22 | 12 | 10 | 0 | 0 | 455 | — |
| a02 | r015-1 | 14 | 7 | 7 | 0 | 0 | 270 | — |
| a03 | r015-2 | 14 | 6 | 8 | 0 | 0 | 476 | commit-conflict, stale-clean-merge |
| a04 | r015-2 | 14 | 4 | 10 | 0 | 0 | 44 | stale-clean-merge, decoy |
| a05 | r015-2 | 11 | 3 | 8 | 0 | 0 | 28 | — |
| a06 | r015-2 | 39 | 14 | 25 | 0 | 0 | 101 | commit-conflict, decoy |
| a07 | r015-3 | 23 | 8 | 15 | 0 | 0 | 589 | — |
| a08 | r015-3 | 19 | 4 | 15 | 0 | 0 | 100 | — |
| lead | main | 6 | 1 | 0 | 5 | 0 | 240 | — |
| **Total** |  | **162** | **59** | **98** | **5** | **0** | **2,303** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 122 · pnpm 1 · tsc 5 · vitest 4 · other 564

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r015-1-root | 25 | 25 | 25 | 6 | 25 | 447 |
| r015-3-packages-core | 34 | 34 | 34 | 2 | 34 | 1,286 |
| r015-2-docs-rfc | 54 | 54 | 54 | 4 | 54 | 1,382 |
| **lead** | — | — | — | — | 191 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r015-3-packages-core | 0 | 1 | 1 | 1 | 86 | 86 / 86 |
| r015-1-root | 1 | 0 | 1 | 1 | 135 | 135 / 135 |
| r015-2-docs-rfc | 0 | 1 | 1 | 1 | 53 | 53 / 53 |
| **lead repair** | 1 | — | 1 | — | — | 94,536 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r014) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 9.8 MiB (9.8 MiB / 0.0 KiB / 0.0 KiB / 0.0 KiB) | 421.8 MiB (9.3 MiB / 390.9 MiB / 8.3 MiB / 13.3 MiB) | +412.0 MiB |
| Version figures from | — | full: first (no manifest for range 14) | — |
| Files / directories / symlinks | 1,255 / 393 / 6 | 40,504 / 6,733 / 2,569 | +39,249 / +6,340 / +2,563 |
| Largest file / largest directory | 262.4 KiB / 44 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 46.5 MiB | 207.8 MiB | +161.3 MiB |
| **Space amplification** (total · tracked) | 4.74× · tracked 2.74× | 0.49× · tracked 3.26× | -4.24 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **23.34** (0.33 / 0.01 / —) | 13.40× the median range |
| **Stored per Commit** | 2.8 KiB | 60.3 KiB | — |
| Metadata share | 0.74 | 0.31 | this range 0.17 |
| History: Commits / Layers / Branches | 10,548 | 12,851 / 10 / 67 | +2,303 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 24.55 GiB (Commits 23.11 GiB · installs 1.12 GiB · build 119.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.80 GiB / 35% | — |
| Snapshot | — | r015, 207.8 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 143.3 MiB | 0.34 | +131.4 MiB |
| Metadata | 19.6 MiB | 0.05 | +4.6 MiB |
| Index rows | 30.5 MiB | 0.07 | +20.5 MiB |
| Waste | 14.2 MiB | 0.03 | +4.7 MiB |
| Other | 260.0 KiB | 0.00 | +200.0 KiB |
| **Total = Store on disk** | **207.8 MiB** | **= 0.49** space amplification | +161.3 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 9.3 MiB | 30.4 MiB (13.2 MiB + 17.2 MiB) | 3.26× | — | 3.2 MiB | 7.0 MiB | 0.46 |
| `node_modules` | 390.9 MiB | 103.6 MiB (101.9 MiB + 1.7 MiB) | 0.27× | — | 103.6 MiB | 390.5 MiB | 0.27 |
| Build output | 8.3 MiB | 2.2 MiB (2.2 MiB + 45.5 KiB) | 0.27× | — | 2.2 MiB | 3.9 MiB | 0.56 |
| `.git` | 13.3 MiB | 26.7 MiB (26.0 MiB + 719.8 KiB) | 2.00× | — | 26.7 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 44.9 MiB | — (not divided) | — | — | — | — |
| **Total** | — | **207.8 MiB** | **= 0.49×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 49,699 | +40,604 | 5.8 KiB | 42,112 (derived) | 65% |
| Chunks (large files) | 24,066 | +12,783 | 10.5 KiB | — | 1% |
| Large-file extents | 11,581 | — | 0.1 KiB | — | — |
| Directories | 19,848 | 6,522 (with inodes, pooled) | 0.2 KiB | — | 57% |
| Inodes and attributes | 73,754 | ↑ pooled | 1.7 KiB | — | — |
| Symlinks | 1,490 | +5,280 | 0.1 KiB | — | — |

Delta: 0.5% at depth cap · 43% of refused bases stopped by budget · `node_modules` reinstall: 0.037× the raw bytes of 152 changed packages

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.26× (30.4 MiB for 9.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.5 KiB / 7.5 KiB / 10.4 KiB over 304 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.29× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.26 (105.8 MiB stored for 409.4 MiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.16 (3 lanes × 421.8 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 1.9 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 7.2 ms / 12.7 ms (0.99×) | 2.1 ms / 3.1 ms (1.11×) | 2.4 ms / 4.4 ms (1.32×) | 20.5 ms / 83.8 ms (1.21×) | 9.4 ms / 14.0 ms (0.99×) | 1897 ms / 1897 ms (3.73×) | — (native comparison in P3; exec 36.6 ms / 853 ms) |
| SQL p50: 164 stmts | 51 stmts | 57 stmts | 239 stmts | 52 stmts | 106,913 stmts | — |

**Commit cost:** 6.07 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 531 ms p50 over 231
**Slowest:** sandbox.exec 26112 ms · sandbox.exec 20870 ms · sandbox.exec 19743 ms · checkpoint diff_commits 0.11 ms and 4.34 statements per entry (49,010 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 243 ms / 243 ms | — / — | — | git / status-cold: — |
| git status (steady) | 236 ms / 469 ms | — / — | — | git / status-steady: — |
| git add | 19.0 ms / 129 ms | — / — | — | git / add: — |
| git commit (lane) | 28.0 ms / 79.0 ms | — / — | — | git / commit: — |
| lead writes main | 6426 ms / 6426 ms | — / — | — | — |
| repack | 4206 ms / 4206 ms | — / — | — | — |
| pnpm install (incremental) | 3048 ms / 3048 ms | 1942 ms / 1942 ms | 1.57× | pnpm-reinstall / cold: — |
| pnpm refresh | 1708 ms / 1708 ms | 905 ms / 905 ms | 1.89× | pnpm-reinstall / steady: — |
| tsc -b | 4718 ms / 5559 ms | 4028 ms / 5963 ms | 1.17× | tsc-b / cold: — |
| vitest | 8390 ms / 8390 ms | 5978 ms / 5978 ms | 1.40× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (−524 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 8.8 ms / 14.0 ms

## 5. Findings and action

### Finding 015.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Correctness | tree 0 missing, 0 extra, 0 content, 0 mode; steps 3536/3537; conflicts 3/3; tests 0/0 equal to native | all |

Diagnosis pending: `finding-015.a1.json`.

### Finding 015.a2 · stop

**1. Trigger** (attempt 2, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Node proofs | 31 pass · 2 stop · 0 NOT_RUN over 8 points: r015-2-docs-rfc mid P4, lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-015.a2.json`.

### Finding 015.a3 · stop

**1. Trigger** (attempt 3, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Node proofs | 19 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 | P1–P6 pass at every point |

Diagnosis pending: `finding-015.a3.json`.

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

### Lead's note (written by the lead; never empty unless the verdict is pass)

**Verdict: watch, terminal for range 15 (D2).** Liaison under owner delegation, 2026-10-19.
- **a4 (`p3-main-d`):**
  - harness `4b725d5229`, binaries `44ac6c91` / `77597adb`, image `d3773b4eac6a`;
  - checkpoint ok, git ✓;
  - Node proofs 20 pass, 0 stop, 0 NOT_RUN over 5 points. P1–P6 pass at every point, and the repair's P6 passes: P1 equal, P4 503 emitted, exit 0.
- **Owner decision 2026-10-19, verbatim:** "Yes: make the lead's repair a clean relink of node_modules on the merged tree (native the same), keep F-057 open for the product fix, and play range 15 a4." The repair removes every `node_modules`, then runs the frozen offline install, and native does the same.
- **What the clean relink costs against a3's incremental repair** (one sample each):

  | | a4 clean relink | a3 incremental |
  | --- | --- | --- |
  | Repair exec | 26.1 s | 1.57 s |
  | Repair Commit | 11.8 s | 58 ms |
  | Rewritten inodes | 94,536 | 382 |
  | New stored | 646,831 B | 22,038 B |
  | New metadata | 625,489 B | 7,706 B |
  | Native install | 2.60 s | 1.08 s |
  | Final command | 121 s | 98 s |

  Reinstall growth is 0.037× the raw bytes of 152 changed packages (a3: 0.001×), a pass.
- **Watch rows:**
  - *Speed:* `sandbox.commit — · Committed · uncontended` is not judged; its baseline class has 3/3/3 calls, under the minimum of 5. Its p95 of 11,435 ms (165.79×) is the clean-relink Commit, and its p50 is 51 ms (0.74×). No gate changed.
  - *Scaling, Counters and Contended work:* they need 3 same-binary ranges, and this is the first range on `44ac6c91`.
  - *Range growth and Snapshot time:* not judged, because there are no earlier ranges or snapshots on this binary.
  - `branch.publish` stays the thin class, at 1.54× uncontended.
- **F-057 (OPEN, product fix owed):** newest-wins over pnpm's install state lets an incremental repair keep stale hoisting. The workload now avoids it through the clean relink.
- **F-056 (OPEN, owner decision):** a rebuild after a remount redoes the vendor builds, where natively 77 of 77 projects are up to date. The dev checks count as done (D1).
- **Earlier attempts, kept as evidence:**
  - a1 (`p3-main-a`) stopped at the closure: there was no seq oracle (fixed in `e373fd3acb`).
  - a2 (`p3-main-b`) stopped on two harness proof bugs (fixed in `1aea36058f`), and its `.modules.yaml` difference led to the owner's decision to compare what was installed and to end-only points (`b966ddb720`).
  - a3 (`p3-main-c`) stopped on F-057.
- **Final command:** 121 s under the declared 295 s alarm, for that one command only. The a3 projection was 100–120 s; a4 adds the clean relink. The command covers consolidate (lead git 14.2 s for 191 commits), the repair, build and tests, verify and probes. Lanes stayed under 118 s through cuts at 20 and 41.1, and played in 128 s.
- **Environment:** since the 2026-10-19 reboot, Docker sometimes fails `image inspect` on the tag `layerfs-352-runtime:node24`. Each command re-tags it to the pinned id `d3773b4eac6a`; the image is the same.

## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3521/3521; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 165.79× it | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.171 | < 0.5 | pass |
| Reinstall growth | 0.037× the raw bytes of 152 changed packages | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0046 (budget 0.4304) | < 0.1 | pass |
| Range growth | 164.1 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 817 ms for 207.8 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.35 | < 0.8 | pass |
| Wall projection | 0.84 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 191 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 20 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 160 · build 11; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.29× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 162 | 163 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 2303 | 2173 |
| Workspaces (one-shot share) | 231 (0.99) | 97 (0.979) |
| Reads | 270 | 270 |
| Reconcile writes | 228 | 228 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 4). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 18 | 15.24 | 264.21 | 264.21 | 389.60 | 0.99× | 5.27× | — | — | 198 / 23,554 / 0 | — | 0.0649 ms per entrie | — |
| branch.diff_commits | 5–16 entries · contended | 1 | 6.26 | 6.26 | 6.26 | 6.26 | no baseline | no baseline | — | — | 105 / 5,518 / 0 | — | 0.4176 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 1 | 6.05 | 6.05 | 6.05 | 6.05 | no baseline | no baseline | — | — | 113 / 5,720 / 0 | — | 0.4037 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 137.21 | 137.21 | 137.21 | 137.21 | no baseline | no baseline | — | — | 3,918 / 119,131 / 0 | — | 0.6294 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 258 | 15.03 | 29.28 | 39.13 | 2228.02 | 0.87× | 1.14× | — | — | 230 / 28,259 / 0 | — | 0.0817 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.19 | 2.10 | 2.10 | 3.07 | 1.71× | 1.54× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.72 | 0.72 | 0.72 | 0.79 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0361 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 1897.14 | 1897.14 | 1897.14 | 2547.30 | 3.73× | 3.73× | — | — | 106,913 / 8,767,630 / 13,332 | — | 5.6295 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.27 | 1.27 | 1.27 | 1.27 | 1.59× | 1.59× | — | — | 44 / 666 / 0 | — | 0.0119 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 4.24 | 4.24 | 4.24 | 4.24 | 1.54× | 1.54× | — | — | 44 / 995 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 2 | 31.37 | 31.37 | 31.37 | 134.77 | 1.65× | 1.65× | — | — | 131 / 16,564 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 5 | 12.11 | 16.74 | 16.74 | 23.62 | 1.39× | 1.41× | — | — | 270 / 72,948 / 8,191 | — | 0.0348 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 6 | 6.97 | 8.50 | 8.50 | 12.83 | 1.08× | 1.21× | — | — | 149 / 7,216 / 0 | — | 0.0134 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 24.78 | 24.78 | 24.78 | 24.78 | 2.78× | 1.90× | — | — | 672 / 100,515 / 8,191 | — | 0.0016 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 11.83 | 11.83 | 11.83 | 11.83 | 1.76× | 1.27× | — | — | 172 / 10,854 / 0 | — | 0.0013 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 13 | 14.10 | 15.31 | 15.31 | 18.62 | 1.66× | 1.04× | — | — | 330 / 17,260 / 0 | — | 0.0066 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 7 | 6.97 | 12.54 | 12.54 | 12.70 | 0.99× | 1.27× | — | — | 128 / 5,834 / 0 | — | 0.0049 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 2 | 4.95 | 4.95 | 4.95 | 4.97 | 0.88× | 0.79× | — | — | 113 / 6,739 / 0 | — | 0.0181 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 8 | 4.54 | 5.57 | 5.57 | 6.00 | 0.84× | 0.75× | — | — | 117 / 7,961 / 0 | — | 0.0169 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 8 | 5.69 | 10.27 | 10.27 | 11.97 | 0.92× | 1.45× | — | — | 143 / 13,227 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 11 | 5.18 | 7.67 | 7.67 | 8.00 | 0.78× | 1.07× | — | — | 133 / 9,502 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 3 | 6.43 | 6.43 | 6.43 | 7.38 | 1.21× | 0.93× | — | — | 195 / 12,583 / 0 | — | 0.002 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 7 | 4.87 | 5.30 | 5.30 | 9.52 | 0.91× | 0.87× | — | — | 148 / 9,602 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 2 | 1.50 | 1.50 | 1.50 | 1.55 | 0.98× | 0.98× | — | — | 28 / 2,649 / 0 | — | 1.503 ms per file | — |
| fs.glob | 1 files · uncontended | 2 | 1.72 | 1.72 | 1.72 | 1.76 | 1.41× | 1.31× | — | — | 32 / 2,519 / 0 | — | 1.722 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 4.66 | 4.66 | 4.66 | 6.77 | 2.06× | 1.94× | — | — | 174 / 12,940 / 0 | — | 0.2453 ms per file | — |
| fs.glob | 17–64 files · uncontended | 3 | 5.14 | 5.14 | 5.14 | 5.91 | 2.66× | 1.97× | — | — | 94 / 11,800 / 0 | — | 0.2141 ms per file | — |
| fs.glob | 2–4 files · uncontended | 5 | 2.08 | 2.09 | 2.09 | 2.98 | 1.38× | 1.05× | — | — | 43 / 2,827 / 0 | — | 0.56 ms per file | — |
| fs.glob | 5–16 files · contended | 4 | 2.34 | 4.15 | 4.15 | 8.39 | 1.81× | 2.93× | — | — | 53 / 4,960 / 0 | — | 0.3771 ms per file | — |
| fs.glob | 5–16 files · uncontended | 8 | 2.46 | 3.09 | 3.09 | 3.42 | 1.27× | 1.34× | — | — | 51 / 6,006 / 0 | — | 0.3973 ms per file | — |
| fs.glob | >64 files · contended | 7 | 10.28 | 11.65 | 11.65 | 13.88 | 2.49× | 2.82× | — | — | 272 / 22,119 / 0 | — | 0.0248 ms per file | — |
| fs.glob | >64 files · uncontended | 11 | 6.45 | 16.50 | 16.50 | 18.14 | 1.23× | 2.16× | — | — | 137 / 14,756 / 0 | — | 0.0147 ms per file | — |
| fs.grep | 1 files · contended | 1 | 2.66 | 2.66 | 2.66 | 2.66 | 1.57× | 1.57× | — | — | 100 / 4,995 / 0 | — | 2.658 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 4 | 1.88 | 2.14 | 2.14 | 3.89 | 1.48× | 1.70× | — | — | 45 / 2,955 / 0 | — | 1.877 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 5 | 8.84 | 9.21 | 9.21 | 10.79 | 1.63× | 1.70× | — | — | 278 / 17,534 / 0 | — | 0.4846 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 3 | 9.30 | 9.30 | 9.30 | 15.23 | 2.58× | 2.14× | — | — | 243 / 16,442 / 0 | — | 0.4227 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 2.95 | 2.95 | 2.95 | 3.92 | 1.26× | 1.03× | — | — | 102 / 6,702 / 0 | — | 0.9833 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 2.69 | 4.16 | 4.16 | 8.79 | 1.42× | 1.20× | — | — | 65 / 4,217 / 0 | — | 1.0388 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 2 | 3.23 | 3.23 | 3.23 | 6.13 | 1.35× | 0.76× | — | — | 124 / 6,853 / 0 | — | 0.539 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 10 | 4.66 | 5.93 | 5.93 | 8.02 | 1.48× | 1.73× | — | — | 90 / 7,382 / 0 | — | 0.589 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 4 | 24.71 | 26.13 | 26.13 | 33.14 | 1.62× | 1.71× | — | — | 709 / 36,493 / 0 | — | 0.0263 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 10 | 28.60 | 40.20 | 40.20 | 42.05 | 2.49× | 2.56× | — | — | 588 / 25,106 / 0 | — | 0.075 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 2 | 1.63 | 1.63 | 1.63 | 2.82 | 0.92× | 0.92× | — | — | 36 / 2,205 / 0 | — | 1.632 ms per entrie | — |
| fs.list | 17–64 entries · contended | 6 | 2.93 | 5.20 | 5.20 | 5.60 | 1.63× | 2.49× | — | — | 110 / 8,985 / 0 | — | 0.0815 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 8 | 3.33 | 4.35 | 4.35 | 4.71 | 1.38× | 1.73× | — | — | 66 / 7,756 / 0 | — | 0.1241 ms per entrie | — |
| fs.list | 2–4 entries · contended | 4 | 2.40 | 2.73 | 2.73 | 4.27 | 1.19× | 1.35× | — | — | 108 / 6,918 / 0 | — | 1.172 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 9 | 2.09 | 2.22 | 2.22 | 2.83 | 1.16× | 0.94× | — | — | 50 / 3,695 / 0 | — | 0.962 ms per entrie | — |
| fs.list | 5–16 entries · contended | 3 | 1.78 | 1.78 | 1.78 | 1.82 | 0.91× | 0.72× | — | — | 51 / 3,995 / 0 | — | 0.2968 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 14 | 2.14 | 2.93 | 2.93 | 3.14 | 1.32× | 1.43× | — | — | 47 / 4,140 / 0 | — | 0.276 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 5.16 | 5.16 | 5.16 | 5.16 | 3.00× | 3.00× | — | — | 82 / 6,709 / 0 | — | 0.006 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 2.74 | 2.74 | 2.74 | 2.82 | 1.21× | 1.21× | — | — | 52 / 3,795 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 12 | 2.20 | 3.07 | 3.07 | 4.16 | 1.11× | 1.30× | — | — | 59 / 3,438 / 0 | — | 0.0006 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 28 | 1.99 | 2.81 | 3.15 | 3.69 | 1.11× | 0.98× | — | — | 46 / 3,468 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 13 | 13.33 | 17.94 | 17.94 | 19.60 | 1.66× | 1.33× | — | — | 364 / 25,870 / 0 | — | 13.332 ms per file | commit |
| fs.rm | 1 files · uncontended | 40 | 6.59 | 25.46 | 30.11 | 39.50 | 0.98× | 2.42× | — | — | 128 / 5,795 / 0 | — | 6.591 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 1 | 1.47 | 1.47 | 1.47 | 1.47 | 1.02× | 1.02× | — | — | 35 / 2,875 / 0 | — | 0.0017 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 6 | 1.62 | 1.82 | 1.82 | 2.85 | 1.00× | 0.95× | — | — | 35 / 3,323 / 0 | — | 0.0019 ms per byte | — |
| fs.stat | ≤512 KiB · uncontended | 1 | 1.78 | 1.78 | 1.78 | 1.78 | 1.50× | 1.50× | — | — | 34 / 2,468 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 9 | 2.19 | 2.99 | 2.99 | 3.78 | 1.28× | 1.57× | — | — | 57 / 4,951 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 14 | 2.24 | 2.82 | 2.82 | 2.94 | 1.28× | 1.37× | — | — | 41 / 3,475 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 2.47 | 2.47 | 2.47 | 2.85 | 1.76× | 1.09× | — | — | 57 / 3,802 / 0 | — | 0.0008 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 11 | 1.74 | 2.27 | 2.27 | 2.47 | 1.16× | 1.04× | — | — | 38 / 2,895 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 101 | 7.45 | 13.08 | 19.09 | 21.18 | 1.02× | 0.97× | — | — | 222 / 12,025 / 0 | — | 0.0089 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 267 | 5.90 | 8.77 | 11.23 | 18.81 | 1.01× | 0.97× | — | — | 134 / 6,031 / 0 | — | 0.0071 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 12 | 11.67 | 17.33 | 17.33 | 18.33 | 1.05× | 1.17× | — | — | 353 / 18,592 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 12 | 9.70 | 13.73 | 13.73 | 15.19 | 1.04× | 1.44× | — | — | 179 / 8,199 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 267 | 9.72 | 15.84 | 25.46 | 27.51 | 1.05× | 0.99× | — | — | 339 / 17,099 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 382 | 7.29 | 11.40 | 13.86 | 15.26 | 1.04× | 1.16× | — | — | 160 / 6,942 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 362 | 8.53 | 14.76 | 20.48 | 27.12 | 1.00× | 0.90× | — | — | 302 / 15,397 / 0 | — | 0.0022 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 633 | 6.21 | 9.48 | 12.53 | 24.96 | 0.99× | 0.92× | — | — | 147 / 6,202 / 0 | — | 0.0021 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.70 | 0.70 | 0.70 | 0.70 | 1.19× | 1.19× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 44 | 36.72 | 63.83 | 67.96 | 83.84 | 1.61× | 1.52× | — | — | 509 / 59,886 / 41 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 71 | 27.67 | 60.10 | 106.95 | 327.60 | 1.21× | 1.53× | — | — | 285 / 31,245 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 10 | 3.39 | 5.05 | 5.05 | 7.16 | 1.05× | 1.21× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 29 | 3.33 | 4.29 | 4.32 | 4.46 | 1.00× | 0.92× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 9 | 8.93 | 16.55 | 16.55 | 16.70 | 1.03× | 0.97× | — | — | 159 / 8,889 / 0 | — | 8.925 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 16 | 8.34 | 13.79 | 13.79 | 22.81 | 1.10× | 1.32× | — | — | 117 / 5,058 / 0 | — | 8.344 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 400.45 | 400.45 | 400.45 | 400.45 | 7.96× | 7.96× | — | — | 9,106 / 364,703 / 0 | — | 400.451 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 39.07 | 39.07 | 39.07 | 39.07 | no baseline | no baseline | — | — | 924 / 59,902 / 38 | — | 2.0565 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 11 | 15.15 | 25.28 | 25.28 | 25.66 | 0.99× | 1.21× | — | — | 237 / 11,120 / 0 | — | 6.3947 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 6 | 13.80 | 16.20 | 16.20 | 19.66 | 1.39× | 1.45× | — | — | 185 / 9,690 / 0 | — | 5.1267 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 3 | 20.74 | 20.74 | 20.74 | 24.99 | 1.39× | 1.39× | — | — | 308 / 23,101 / 0 | — | 1.8853 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 9 | 19.21 | 35.54 | 35.54 | 61.13 | 1.70× | 3.14× | — | — | 278 / 19,314 / 0 | — | 2.6052 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 1264.44 | 1264.44 | 1264.44 | 1264.44 | no baseline | no baseline | — | — | 10,300 / 985,183 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 13 | 51.32 | 11435.02 | 11435.02 | 11832.60 | 0.74× | 165.79× | — | — | 565 / 64,393 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 210 | 44.75 | 851.36 | 1163.45 | 1790.16 | 1.10× | 2.46× | — | — | — | 2296.70 | — | — |
| sandbox.exec | 0 files · uncontended | 145 | 34.90 | 597.58 | 962.38 | 5796.12 | 1.29× | 2.32× | — | — | 0 / 0 / 0 | 2334.70 | — | — |
| sandbox.exec | 1 files · contended | 41 | 31.65 | 41.28 | 43.07 | 44.23 | 1.01× | 0.70× | — | — | — | 4.30 | 31.654 ms per file | — |
| sandbox.exec | 1 files · uncontended | 44 | 34.85 | 44.63 | 64.57 | 71.03 | 1.15× | 0.76× | — | — | — | 5.30 | 34.849 ms per file | — |
| sandbox.exec | 17–64 files · contended | 9 | 51.04 | 65.62 | 65.62 | 71.10 | 0.79× | 1.02× | — | — | — | 37.20 | 2.5522 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 7 | 66.14 | 73.19 | 73.19 | 76.84 | 0.96× | 1.06× | — | — | — | 99 | 3.481 ms per file | — |
| sandbox.exec | 2–4 files · contended | 47 | 32.73 | 48.93 | 51.22 | 56.64 | 0.86× | 0.79× | — | — | — | 10 | 12.04 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 28 | 30.62 | 56.57 | 62.95 | 66.67 | 0.93× | 1.07× | — | — | — | 10 | 11.309 ms per file | — |
| sandbox.exec | 5–16 files · contended | 32 | 37.75 | 63.25 | 70.98 | 84.10 | 0.72× | 1.09× | — | — | — | 20.20 | 4.5499 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 75 | 35.60 | 61.77 | 64.86 | 97.05 | 0.68× | 0.86× | — | — | — | 15.70 | 3.9326 ms per file | — |
| sandbox.exec | — · contended | 14 | 1703.82 | 19743.28 | 19743.28 | 20869.79 | no baseline | no baseline | — | — | — | 28925.40 | — | — |
| sandbox.exec | — · uncontended | 34 | 307.69 | 10839.57 | 14261.61 | 26112.22 | 0.61× | 2.28× | — | — | — | 28925.40 | — | — |
| sandbox.mount | — · contended | 91 | 9.86 | 12.80 | 16.36 | 20.41 | 0.98× | 0.83× | — | — | 56 / 1,523 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 130 | 9.12 | 14.80 | 18.10 | 23.09 | 0.99× | 1.07× | — | — | 48 / 1,391 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 6.04 | 25.21 | 25.21 | 33.46 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 71 | 8.78 | 12.25 | 14.85 | 16.20 | 1.05× | 0.99× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 150 | 8.97 | 14.18 | 96.57 | 109.53 | 0.99× | 1.02× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 18 | 0.0 KiB | 953.8 KiB | 4,216 | ok 18 |
| branch.diff_commits | branch | 266 | 0.0 KiB | 13.2 MiB | 49,481 | ok 266 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.9 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 47 | 11.9 MiB | 0.0 KiB | 63 | Committed 47 |
| fs.diff_files | fs | 44 | 0.0 KiB | 427.9 KiB | 40 | Text 38, NoSuchPath 4, Equal 2 |
| fs.glob | fs | 55 | 0.0 KiB | 42.5 KiB | 723 | ok 55 |
| fs.grep | fs | 58 | 0.0 KiB | 157.3 KiB | 810 | ok 58 |
| fs.list | fs | 58 | 0.0 KiB | 92.0 KiB | 843 | ok 58 |
| fs.read | fs | 48 | 0.0 KiB | 144.7 KiB | 48 | ok 48 |
| fs.rm | fs | 53 | 0.0 KiB | 0.0 KiB | 53 | Committed 53 |
| fs.stat | fs | 53 | 0.0 KiB | 11.0 KiB | 53 | ok 53 |
| fs.write | fs | 2,036 | 21.2 MiB | 0.0 KiB | 2,036 | Committed 2029, UpToDate 7 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 229 | 0.0 KiB | 0.0 KiB | 0 | Committed 189, UpToDate 39, Conflict 1 |
| sandbox.exec | sandbox | 696 | 4.3 MiB | 4.4 MiB | 0 | exit:0 693, exit:2 3 |
| sandbox.mount | sandbox | 231 | 0.0 KiB | 0.0 KiB | 0 | Mounted 231 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 231 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 231 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 1.05 · end 1.75.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.702 | 3.107 · 1.685 · 1.663 · 2.122 · 1.702 | 2.14–2.14 | statements 22, vm_steps 1292, fullscan_steps 0, sorts 0, returned_rows 129 |
| read | 1.633 | 1.633 · 1.562 · 1.551 · 1.78 · 1.69 | 2.14–2.14 | statements 21, vm_steps 1262, fullscan_steps 0, sorts 0, returned_rows 128 |
| list_small | 1.476 | 1.524 · 1.476 · 1.385 · 1.5 · 1.372 | 2.14–2.14 | statements 21, vm_steps 1271, fullscan_steps 0, sorts 0, returned_rows 128 |
| list_largest | 4.685 | 5.619 · 4.741 · 4.685 · 4.313 · 4.111 | 2.14–2.14 | statements 72, vm_steps 12376, fullscan_steps 0, sorts 0, returned_rows 1302 |
| grep_scoped | 1.548 | 1.579 · 1.244 · 1.269 · 1.548 · 1.662 | 2.14–2.14 | statements 26, vm_steps 1417, fullscan_steps 0, sorts 0, returned_rows 137 |
| glob_scoped | 1.549 | 1.492 · 1.659 · 1.939 · 1.549 · 1.376 | 2.14–2.14 | statements 20, vm_steps 1250, fullscan_steps 0, sorts 0, returned_rows 127 |
| grep_tree | 2885.496 | 2919.074 · 3008.068 · 2885.496 · 2857.272 · 2858.906 | 1.89–2.05 | statements 32172, vm_steps 2636887, fullscan_steps 0, sorts 0, returned_rows 268036 |
| glob_tree | 7.423 | 8.694 · 7.423 · 7.866 · 7.133 · 7.325 | 1.89–1.89 | statements 177, vm_steps 16922, fullscan_steps 0, sorts 0, returned_rows 1714 |
| diff_files | 5.562 | 5.86 · 5.566 · 5.465 · 5.562 · 5.313 | 1.89–1.89 | statements 102, vm_steps 7384, fullscan_steps 0, sorts 0, returned_rows 762 |
| list_commits | 0.897 | 1.561 · 0.734 · 0.897 · 0.542 · 1.747 | 1.89–1.89 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.233 | 6.415 · 2.206 · 2.156 · 2.414 · 2.233 | 1.89–1.89 | statements 60, vm_steps 2467, fullscan_steps 0, sorts 0, returned_rows 269 |
| fork | 0.292 | 0.518 · 0.343 · 0.292 · 0.284 · 0.253 | 1.89–1.89 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 30.376 | 31.763 · 30.376 · 33.191 · 29.419 · 29.074 | 1.89–1.89 | statements 525, vm_steps 27857, fullscan_steps 4, sorts 8, returned_rows 2176 |
| oneshot_mount_unmount | 17.757 | 22.515 · 15.032 · 17.757 · 16.645 · 18.29 | 1.89–1.89 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 75.793 | 84.257 · 75.607 · 65.369 · 75.793 · 79.974 | 1.89–1.89 | statements 168, vm_steps 9897, fullscan_steps 80, sorts 2, returned_rows 975 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.89–1.89 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r015: 53,196 pages of 4,096 B, 0 free · Commits 12,937 · Branches 199 · Layers 19 · compression 4.02× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 49,699 | 280.4 MiB |
| 2 | 24,066 | 245.8 MiB |
| 3 | 11,562 | 1.5 MiB |
| 4 | 19 | 4.4 KiB |
| 5 | 11,506 | 1.2 MiB |
| 6 | 18,370 | 100.4 MiB |
| 7 | 19,819 | 4.5 MiB |
| 8 | 29 | 9.1 KiB |
| 9 | 16,764 | 16.8 MiB |
| 10 | 14,292 | 1.8 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,490 | 121.2 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 13,018 | 19.6 MiB |
| 1 | 24,331 | 143.3 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 44,613 | 174.3 MiB | 9.3 MiB |
| inode_value | 3,321 | 13.0 MiB | 332.2 KiB |
| object_location | 2,438 | 9.5 MiB | 1.0 MiB |
| commit | 971 | 3.8 MiB | 598.9 KiB |
| binding_hint | 820 | 3.2 MiB | 327.6 KiB |
| commit_runs | 278 | 1.1 MiB | 166.3 KiB |
| commit_lineage | 278 | 1.1 MiB | 128.2 KiB |
| commit_identity | 201 | 804.0 KiB | 94.2 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 9 | 36.0 KiB | 7.1 KiB |
| history_meta | 8 | 32.0 KiB | 2.6 KiB |
| sqlite_schema | 6 | 24.0 KiB | 8.0 KiB |
| branch_names | 4 | 16.0 KiB | 5.5 KiB |
| branch_identity | 3 | 12.0 KiB | 4.2 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| run_merges | 1 | 4.0 KiB | 0.9 KiB |
| reach | 1 | 4.0 KiB | 3.2 KiB |

### E. Stage times

**Time 253.7 s** (tooling): play 129.5 · consolidate 81.6 · verify 17.3 · probes 15.6 · tests 0.0 · seal + snapshot 2.4 · report 7.3

253.66 s tooling: prepare 1.59 · play 127.92 · consolidate 81.57 · verify 9.09 (diff_commits + full compareTree) · version walk 8.24 · probes 15.57 · metrics 0.89 · seal 1.17 · sealed figures 0.40 · snapshot copy 0.86 · report 0.21

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T11:21:34.175Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 3536/3537; conflicts 3/3; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 8.48× baseline (no phase); Scaling: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Counters: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 157.6 MiB; median not judged: 0 of 3 earlier ranges; Node proofs: 0 pass · 0 stop · 35 NOT_RUN over 7 points |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T11:27:32.088Z | stop | Speed: branch.diff_branches >64 entries · uncontended: 5.96× baseline (no phase); Scaling: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 157.9 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 872 ms for 202.2 MiB new; size exponent not judged (1 snapshots); Node proofs: 31 pass · 2 stop · 0 NOT_RUN over 8 points: r015-2-docs-rfc mid P4, lead repair P6 |
| 3 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T12:30:03.383Z | stop | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 5.45× it; Scaling: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 157.3 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 832 ms for 201.6 MiB new; size exponent not judged (1 snapshots); Node proofs: 19 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 |
| 4 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T12:53:02.171Z | watch | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 165.79× it; Scaling: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 164.1 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 817 ms for 207.8 MiB new; size exponent not judged (1 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-015.a1.json`
- `~/lfs-history/metrics/range-015.a2.json`
- `~/lfs-history/metrics/range-015.a3.json`
- `~/lfs-history/metrics/range-015.a4.json`
- trace `~/lfs-history/runs/p3-main-d/trace/range-015.a4.jsonl` · runner log `~/lfs-history/runs/p3-main-d/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-015.p3-main-d.json`

### H. Git internals

Seed pack: — objects, 10.1 MiB (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r015-1-root | 447 | 154.0 KiB |
| r015-3-packages-core | 1,286 | 155.8 KiB |
| r015-2-docs-rfc | 1,382 | 160.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 236.0 | 1,302 |
| `git diff --stat` | 29.0 | 1,281 |
| `git add -f` | 19.0 | — |
| `git rm --cached` | 4.0 | — |
| `git commit` | 28.0 | 1,289 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| lead | initial | P1 | pass | — | ✓ |
| lead | initial | P2 | pass | exit 0 | ✓ |
| lead | initial | P3 | n/a | the lead's first install | ✓ |
| lead | initial | P4 | pass | 500 emitted files, exit 0 | ✓ |
| lead | initial | P5 | n/a | no tests at the first install | ✓ |
| lead | initial | P6 | n/a | not a repair | ✓ |
| r015-3-packages-core | end | P1 | pass | — | ✓ |
| r015-3-packages-core | end | P2 | pass | exit 0 | ✓ |
| r015-3-packages-core | end | P3 | pass | 139 bookkeeping path(s) | ✓ |
| r015-3-packages-core | end | P4 | pass | 242 emitted files, exit 2 | ✓ |
| r015-3-packages-core | end | P5 | pass | 86 files | ✓ |
| r015-3-packages-core | end | P6 | n/a | not a repair | ✓ |
| r015-1-root | end | P1 | pass | — | ✓ |
| r015-1-root | end | P2 | pass | exit 0 | ✓ |
| r015-1-root | end | P3 | n/a | an install, not a refresh | ✓ |
| r015-1-root | end | P4 | pass | 483 emitted files, exit 2 | ✓ |
| r015-1-root | end | P5 | pass | 135 files | ✓ |
| r015-1-root | end | P6 | n/a | not a repair | ✓ |
| r015-2-docs-rfc | end | P1 | pass | — | ✓ |
| r015-2-docs-rfc | end | P2 | pass | exit 0 | ✓ |
| r015-2-docs-rfc | end | P3 | pass | 139 bookkeeping path(s) | ✓ |
| r015-2-docs-rfc | end | P4 | pass | 195 emitted files, exit 2 | ✓ |
| r015-2-docs-rfc | end | P5 | pass | 53 files | ✓ |
| r015-2-docs-rfc | end | P6 | n/a | not a repair | ✓ |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (503 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
