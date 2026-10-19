# Range 015 · **stop** · attempt 3

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r014 (run p2-main-f)
dsh `75838e10b`..`b4ec4060a` · **67 commits** (18 mainline, 49 side) · 2026-07-12 → 2026-07-15
Areas changed: `examples/acp-agent` 15% · `packages/core` 14% · `docs/rfc` 11% · other 60%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 19 pass, 1 stop, 0 NOT_RUN over 5 points) · **Content 0.30×** · **Churn 0.26**
**Time split:** play 136.1 s · git 102.1 s · Node 179.2 s · verify 10.0 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **440.2 MiB** (+430.4 MiB) | **201.6 MiB** (+155.1 MiB) | **0.46×** (prev 4.74×) | **157.3 MiB** | **2,303** (total 12,851) | **240.1 s** tooling (total 9.1 min) |

**Checks:** 12 pass · 6 watch: Speed not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 5.45× it; Scaling insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 157.3 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time 832 ms for 201.6 MiB new; size exponent not judged (1 snapshots) · 1 optimize/stop: Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ stored added +1909% · ▲ sandbox.exec p95 +829% · ▲ range time +797%
**Budget:** 16 of 202 ranges · projected total 13.5 h (budget 16.8 h) · disk 35% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,332 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 3,521 / 3,521 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of its chain · **differs**: 0 missing, 0 extra, 1 differ · not byte-compared: 3 pnpm state file(s) · by target: 261 bin shims, 2602 links · output root ×0, verification age ×1 · vitest results: order sorted in 1 of 1 files, duration ×53 |
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
| lead | repair | `ca5fdcb44dd2` | `null` | n/a | pass | n/a | n/a | pass | stop (382 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/core/scope/tests/scope.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/core/agent-core/tests/agent-core.spec.ts` (fails natively) · `packages/core/agent-core/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/gen-cordis-catalog.spec.ts` (fails natively) · `packages/core/agent/tests/verify-export-jsdoc.spec.ts` (fails natively) · `packages/core/session/tests/gen-persistence-catalog.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence/tests/persistence.spec.ts` (fails natively) · `packages/skill/tool-skill/tests/tool-skill.spec.ts` (fails natively) · `packages/timeout/timeout-policy/tests/timeout-policy.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/tool-todo.spec.ts` (fails natively) · `packages/web/tool-web/tests/load-path.spec.ts` (fails natively) · `packages/web/web-search-deepseek/tests/deepseek.spec.ts` (fails natively) · `packages/workflow/tool-workflow/tests/tool-workflow.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/workflow-workerthread.spec.ts` (fails natively) · `packages/ui/app-boot/tests/app-boot.spec.ts` (fails natively) · `packages/core/session/tests/session.spec.ts` (fails natively) · `packages/core/agent-loop/tests/agent.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/ui/stdio-agent/tests/stdio-agent.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/ui/permission/tests/permission.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/subagent/tests/service.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively).

## 2. Activity

**4,173 calls** · **162 steps** by **8 agents + lead** on **3 Branches + main** · **231 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +125 added · 2,148 modified · −54 deleted · 24.0 MiB written · fs 2,121 : Sandbox 206 (**10 : 1**, reported only in P3)
**Execs:** 696 (JS 55 · shell 641) · 3 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,452 | 2,136 | 316 | Committed 2,129 · Text 38 · NoSuchPath 4 · Equal 2 · UpToDate 7 |
| sandbox | 1,392 | 925 | 5 | commit 229 (Committed 189, UpToDate 39, Conflict 1) · exec 696 (exit:0 693, exit:2 3) · mount 231 (Mounted 231) · status 5 · unmount 231 (Unmounted 231) |
| branch | 319 | 32 | 287 | diff_branches 18 · diff_commits 269 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,173** | **3,093** | **618** |  |

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
| **lead repair** | 1 | — | 1 | — | — | 382 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r014) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 9.8 MiB (9.8 MiB / 0.0 KiB / 0.0 KiB / 0.0 KiB) | 440.2 MiB (9.3 MiB / 409.3 MiB / 8.3 MiB / 13.3 MiB) | +430.4 MiB |
| Version figures from | — | full: first (no manifest for range 14) | — |
| Files / directories / symlinks | 1,255 / 393 / 6 | 40,814 / 6,807 / 2,608 | +39,559 / +6,414 / +2,602 |
| Largest file / largest directory | 262.4 KiB / 44 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 46.5 MiB | 201.6 MiB | +155.1 MiB |
| **Space amplification** (total · tracked) | 4.74× · tracked 2.74× | 0.46× · tracked 3.26× | -4.28 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **22.37** (0.31 / 0.01 / —) | 12.84× the median range |
| **Stored per Commit** | 2.8 KiB | 60.0 KiB | — |
| Metadata share | 0.74 | 0.29 | this range 0.14 |
| History: Commits / Layers / Branches | 10,548 | 12,851 / 10 / 67 | +2,303 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 23.58 GiB (Commits 22.15 GiB · installs 1.12 GiB · build 119.4 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.80 GiB / 35% | — |
| Snapshot | — | r015, 201.6 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 143.2 MiB | 0.33 | +131.3 MiB |
| Metadata | 19.0 MiB | 0.04 | +4.0 MiB |
| Index rows | 25.2 MiB | 0.06 | +15.2 MiB |
| Waste | 14.0 MiB | 0.03 | +4.5 MiB |
| Other | 252.0 KiB | 0.00 | +192.0 KiB |
| **Total = Store on disk** | **201.6 MiB** | **= 0.46** space amplification | +155.1 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 9.3 MiB | 30.4 MiB (13.2 MiB + 17.2 MiB) | 3.26× | — | 3.2 MiB | 7.0 MiB | 0.46 |
| `node_modules` | 409.3 MiB | 103.0 MiB (101.9 MiB + 1.1 MiB) | 0.25× | — | 103.0 MiB | 408.9 MiB | 0.25 |
| Build output | 8.3 MiB | 2.2 MiB (2.2 MiB + 40.5 KiB) | 0.26× | — | 2.2 MiB | 3.9 MiB | 0.56 |
| `.git` | 13.3 MiB | 26.6 MiB (25.9 MiB + 723.7 KiB) | 2.00× | — | 26.6 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 39.4 MiB | — (not divided) | — | — | — | — |
| **Total** | — | **201.6 MiB** | **= 0.46×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 49,657 | +40,711 | 5.8 KiB | 4,014 (derived) | 65% |
| Chunks (large files) | 24,066 | +12,799 | 10.5 KiB | — | 1% |
| Large-file extents | 11,581 | — | 0.1 KiB | — | — |
| Directories | 13,657 | 5,635 (with inodes, pooled) | 0.2 KiB | — | 67% |
| Inodes and attributes | 72,814 | ↑ pooled | 1.7 KiB | — | — |
| Symlinks | 1,490 | +2,717 | 0.1 KiB | — | — |

Delta: 0.5% at depth cap · 43% of refused bases stopped by budget · `node_modules` reinstall: 0.001× the raw bytes of 152 changed packages

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.26× (30.4 MiB for 9.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.5 KiB / 7.5 KiB / 10.4 KiB over 304 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.30× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.26 (105.2 MiB stored for 409.4 MiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.15 (3 lanes × 440.2 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 1.7 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 7.3 ms / 13.2 ms (1.00×) | 2.1 ms / 3.3 ms (1.16×) | 2.4 ms / 4.4 ms (1.23×) | 21.4 ms / 82.2 ms (1.30×) | 9.7 ms / 13.9 ms (1.06×) | 2057 ms / 2057 ms (4.04×) | — (native comparison in P3; exec 37.1 ms / 869 ms) |
| SQL p50: 164 stmts | 52 stmts | 57 stmts | 238 stmts | 50 stmts | 106,970 stmts | — |

**Commit cost:** 6.51 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 551 ms p50 over 231
**Slowest:** sandbox.exec 22638 ms · sandbox.exec 21519 ms · sandbox.exec 19299 ms · checkpoint diff_commits 0.13 ms and 4.50 statements per entry (49,433 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 235 ms / 235 ms | — / — | — | git / status-cold: — |
| git status (steady) | 243 ms / 499 ms | — / — | — | git / status-steady: — |
| git add | 18.0 ms / 128 ms | — / — | — | git / add: — |
| git commit (lane) | 29.0 ms / 83.0 ms | — / — | — | git / commit: — |
| lead writes main | 7196 ms / 7196 ms | — / — | — | — |
| repack | 4158 ms / 4158 ms | — / — | — | — |
| pnpm install (incremental) | 3147 ms / 3147 ms | 1217 ms / 1217 ms | 2.59× | pnpm-reinstall / cold: — |
| pnpm refresh | 1812 ms / 1812 ms | 905 ms / 905 ms | 2.00× | pnpm-reinstall / steady: — |
| tsc -b | 5761 ms / 7331 ms | 4028 ms / 6259 ms | 1.43× | tsc-b / cold: — |
| vitest | 9992 ms / 9992 ms | 5978 ms / 5978 ms | 1.67× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (−524 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 8.9 ms / 17.3 ms

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

**Verdict: stop on F-057 (OPEN product finding).** Liaison under owner delegation, 2026-10-19. a4 is held: changing the repair command is a workload change, and that is the owner's call.

- **a3 (`p3-main-c`, harness `b966ddb720`, binaries `44ac6c91` / `77597adb`):** checkpoint ok, git ✓, Node 19 pass and 1 stop over 5 points. Every lane end passes P1–P5. The stop is `lead.repair` P6: the public hoist `node_modules/.pnpm/node_modules/@cordisjs/plugin-loader` resolves to the workspace package `vendor/loader`, while natively it resolves to `@cordisjs/plugin-loader@1.0.0-rc.5`. That is 1 of 761 entries; P4 passes (503 emitted, exit 0). The cause is newest-wins over pnpm's install state: the merged `.modules.yaml` keeps the stale `plugin-loader@1.0.0-rc.4(cordis@4.0.0-rc.6)` hoist beside rc.5, and the repair keeps it. See BUGS.md F-057; receipts in `~/lfs-history/dev/r015-a3-p6-20261019/`.
- **a2 (`p3-main-b`):** two stops, both fixed in the harness (`1aea36058f`). At `docs-rfc.mid`, P4: another agent's write landed during the lane's test point. At the repair, P6: shims were hashed with unknown lane roots. a2's `.modules.yaml` difference, the same mix as F-057, led to the owner decision below.
- **a1 (`p3-main-a`):** stopped at the closure. No seq oracle existed, because the oracle tool predicted the lead's install without PRUNE_EMPTY (fixed in `e373fd3acb`).
- **Owner decision 2026-10-19 (harness only; NODE_RULE §6):**
  - The proofs compare what was installed: package bytes, links and shims by target, and the `pnpm ls` package set. pnpm's state files are not byte-compared.
  - Node proofs run only at quiet points: each lane at its end, plus the lead.
  - For a3 this drops the mid points: lanes played in 136 s (a2: 175 s).
- **Final command:** 98 s under the declared 295 s alarm, for that one command only. Projected 100–120 s; it consolidates, runs the lead git (15.2 s for 191 commits), the repair, verify and probes. Lanes stayed under 118 s through cuts at 20 and 41.1.
- **Watch rows:**
  - *Speed:* `sandbox.commit` Committed uncontended is not judged, because its baseline class has 3/3/3 calls (minimum 5).
  - *Scaling, Counters and Contended work:* they need 3 same-binary ranges, and this is the first range on `44ac6c91`.
  - *Range growth and Snapshot time:* not judged, for lack of earlier ranges on this binary.
  - `branch.publish` stays the thin class at 1.28×.
  - *Reinstall growth* passes this range: 0.001× the raw bytes of 152 changed packages.
- **F-056 (OPEN, owner decision):** a rebuild after a remount redoes the vendor builds. Natively 77 of 77 projects are up to date. The dev checks count as done (D1).
- **Environment:** since the 2026-10-19 reboot, Docker sometimes fails `image inspect` on the tag `layerfs-352-runtime:node24`. Each command re-tags it to the pinned id `d3773b4eac6a`; the image is the same.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3521/3521; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 5.45× it | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.14 | < 0.5 | pass |
| Reinstall growth | 0.001× the raw bytes of 152 changed packages | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0046 (budget 0.4331) | < 0.1 | pass |
| Range growth | 157.3 MiB; median not judged: 0 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 832 ms for 201.6 MiB new; size exponent not judged (1 snapshots) | < 0.15 | watch |
| Disk projection | 0.35 | < 0.8 | pass |
| Wall projection | 0.8 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 191 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 19 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 | P1–P6 pass at every point | stop |
| `.git` conflicts | 0 (tracked 0 · install 160 · build 11; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.30× | ≤ 2× (act > 5×) | pass |
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

Binary: daemon `44ac6c91abf6` (attempt 3). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 18 | 15.69 | 269.35 | 269.35 | 424.06 | 1.02× | 5.37× | — | — | 199 / 23,566 / 0 | — | 0.0668 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 12.57 | 12.57 | 12.57 | 12.57 | no baseline | no baseline | — | — | 283 / 14,659 / 0 | — | 0.2028 ms per entrie | — |
| branch.diff_commits | 5–16 entries · uncontended | 2 | 5.87 | 5.87 | 5.87 | 6.34 | no baseline | no baseline | — | — | 105 / 5,516 / 0 | — | 0.391 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 261 | 17.24 | 33.22 | 44.41 | 2233.99 | 0.99× | 1.30× | — | — | 263 / 31,334 / 0 | — | 0.0926 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.92 | 2.69 | 2.69 | 2.73 | 2.76× | 1.98× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.79 | 0.79 | 0.79 | 0.82 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0394 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 2056.64 | 2056.64 | 2056.64 | 2841.80 | 4.04× | 4.04× | — | — | 106,970 / 8,767,580 / 13,332 | — | 6.1028 ms per entrie | branch.merge |
| branch.merge | >64 entries · Merged · uncontended | 1 | 1.43 | 1.43 | 1.43 | 1.43 | 1.79× | 1.79× | — | — | 44 / 666 / 0 | — | 0.0135 ms per entrie | — |
| branch.publish | — · uncontended | 1 | 3.53 | 3.53 | 3.53 | 3.53 | 1.28× | 1.28× | — | — | 44 / 995 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 2 | 31.15 | 31.15 | 31.15 | 135.40 | 1.64× | 1.64× | — | — | 131 / 16,564 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 5 | 8.90 | 13.30 | 13.30 | 17.04 | 1.02× | 1.12× | — | — | 298 / 18,545 / 0 | — | 0.0206 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 6 | 8.76 | 9.50 | 9.50 | 9.61 | 1.35× | 1.35× | — | — | 155 / 8,207 / 0 | — | 0.0274 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 7.06 | 7.06 | 7.06 | 7.06 | 0.79× | 0.54× | — | — | 126 / 7,986 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 1 | 10.46 | 10.46 | 10.46 | 10.46 | 1.56× | 1.12× | — | — | 172 / 10,867 / 0 | — | 0.0011 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 12 | 12.62 | 15.43 | 15.43 | 17.93 | 1.49× | 1.04× | — | — | 324 / 22,563 / 0 | — | 0.0063 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 8 | 7.15 | 10.53 | 10.53 | 13.98 | 1.01× | 1.07× | — | — | 139 / 6,536 / 0 | — | 0.0058 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 4 | 4.48 | 6.54 | 6.54 | 6.57 | 0.80× | 1.04× | — | — | 117 / 8,213 / 0 | — | 0.0221 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 6 | 4.56 | 4.98 | 4.98 | 6.15 | 0.84× | 0.67× | — | — | 114 / 6,624 / 0 | — | 0.0166 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 4 | 4.07 | 6.22 | 6.22 | 9.15 | 0.66× | 0.88× | — | — | 222 / 12,676 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 15 | 6.53 | 8.01 | 8.01 | 8.28 | 0.98× | 1.12× | — | — | 164 / 9,786 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 2 | 7.15 | 7.15 | 7.15 | 7.91 | 1.35× | 1.04× | — | — | 201 / 15,234 / 0 | — | 0.0012 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 8 | 5.13 | 5.87 | 5.87 | 6.19 | 0.96× | 0.96× | — | — | 152 / 9,610 / 0 | — | 0.002 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 1.86 | 1.86 | 1.86 | 1.86 | 1.21× | 1.21× | — | — | 93 / 5,843 / 0 | — | 1.858 ms per file | — |
| fs.glob | 1 files · uncontended | 3 | 1.86 | 1.86 | 1.86 | 3.45 | 1.52× | 1.42× | — | — | 32 / 2,669 / 0 | — | 1.862 ms per file | — |
| fs.glob | 17–64 files · contended | 4 | 4.13 | 4.35 | 4.35 | 7.61 | 1.83× | 1.82× | — | — | 94 / 11,808 / 0 | — | 0.2175 ms per file | — |
| fs.glob | 17–64 files · uncontended | 2 | 3.90 | 3.90 | 3.90 | 5.59 | 2.02× | 1.49× | — | — | 83 / 11,227 / 0 | — | 0.1471 ms per file | — |
| fs.glob | 2–4 files · uncontended | 5 | 2.05 | 2.58 | 2.58 | 4.17 | 1.36× | 1.30× | — | — | 43 / 2,827 / 0 | — | 0.6297 ms per file | — |
| fs.glob | 5–16 files · contended | 1 | 2.39 | 2.39 | 2.39 | 2.39 | 1.85× | 1.69× | — | — | 63 / 5,259 / 0 | — | 0.342 ms per file | — |
| fs.glob | 5–16 files · uncontended | 11 | 2.80 | 3.39 | 3.39 | 4.06 | 1.45× | 1.47× | — | — | 52 / 6,019 / 0 | — | 0.4057 ms per file | — |
| fs.glob | >64 files · contended | 8 | 8.12 | 15.07 | 15.07 | 17.10 | 1.97× | 3.65× | — | — | 328 / 26,512 / 0 | — | 0.0136 ms per file | — |
| fs.glob | >64 files · uncontended | 10 | 6.37 | 17.85 | 17.85 | 18.71 | 1.22× | 2.34× | — | — | 121 / 14,684 / 0 | — | 0.0151 ms per file | — |
| fs.grep | 1 files · contended | 2 | 2.52 | 2.52 | 2.52 | 2.96 | 1.50× | 1.50× | — | — | 81 / 4,273 / 0 | — | 2.524 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 3 | 2.04 | 2.04 | 2.04 | 2.15 | 1.61× | 1.61× | — | — | 46 / 3,087 / 0 | — | 2.037 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 4 | 7.88 | 10.21 | 10.21 | 18.03 | 1.46× | 1.89× | — | — | 335 / 17,481 / 0 | — | 0.4147 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 4 | 8.70 | 9.20 | 9.20 | 15.05 | 2.42× | 2.12× | — | — | 234 / 13,290 / 0 | — | 0.4196 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 3.53 | 3.53 | 3.53 | 4.43 | 1.51× | 1.23× | — | — | 191 / 9,936 / 0 | — | 1.7655 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 6 | 3.25 | 3.63 | 3.63 | 3.65 | 1.72× | 1.05× | — | — | 65 / 4,605 / 0 | — | 0.8523 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 1 | 3.77 | 3.77 | 3.77 | 3.77 | 1.58× | 0.89× | — | — | 191 / 12,586 / 0 | — | 0.6277 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 11 | 4.72 | 6.66 | 6.66 | 7.32 | 1.50× | 1.94× | — | — | 113 / 7,366 / 0 | — | 0.6055 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 7 | 24.45 | 39.21 | 39.21 | 41.15 | 1.60× | 2.57× | — | — | 845 / 38,767 / 0 | — | 0.0849 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 27.19 | 31.96 | 31.96 | 35.22 | 2.37× | 2.03× | — | — | 587 / 25,130 / 0 | — | 0.075 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 1.72 | 1.72 | 1.72 | 1.72 | 0.97× | 0.97× | — | — | 107 / 8,016 / 0 | — | 1.724 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 3.29 | 3.29 | 3.29 | 3.29 | 1.95× | 1.95× | — | — | 90 / 5,856 / 0 | — | 3.295 ms per entrie | — |
| fs.list | 17–64 entries · contended | 7 | 4.03 | 4.38 | 4.38 | 16.33 | 2.25× | 2.10× | — | — | 141 / 8,933 / 0 | — | 0.1152 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 7 | 3.96 | 4.36 | 4.36 | 4.79 | 1.65× | 1.74× | — | — | 67 / 7,789 / 0 | — | 0.1261 ms per entrie | — |
| fs.list | 2–4 entries · contended | 3 | 2.64 | 2.64 | 2.64 | 2.68 | 1.31× | 1.31× | — | — | 118 / 7,352 / 0 | — | 1.322 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 10 | 2.01 | 2.83 | 2.83 | 2.93 | 1.12× | 1.20× | — | — | 44 / 3,703 / 0 | — | 0.7757 ms per entrie | — |
| fs.list | 5–16 entries · contended | 4 | 2.48 | 2.64 | 2.64 | 3.10 | 1.26× | 1.07× | — | — | 61 / 6,094 / 0 | — | 0.2812 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 13 | 2.00 | 2.56 | 2.56 | 3.18 | 1.23× | 1.25× | — | — | 44 / 4,112 / 0 | — | 0.2786 ms per entrie | — |
| fs.read | ≤1 KiB · contended | 1 | 2.69 | 2.69 | 2.69 | 2.69 | 1.56× | 1.56× | — | — | 147 / 7,774 / 0 | — | 0.0031 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 2 | 2.51 | 2.51 | 2.51 | 2.52 | 1.11× | 1.11× | — | — | 52 / 3,795 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 10 | 2.48 | 3.65 | 3.65 | 3.69 | 1.25× | 1.54× | — | — | 76 / 5,209 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 30 | 2.08 | 3.12 | 3.31 | 3.80 | 1.16× | 1.09× | — | — | 46 / 3,449 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 8 | 8.96 | 9.56 | 9.56 | 14.06 | 1.12× | 0.71× | — | — | 157 / 10,818 / 0 | — | 8.958 ms per file | commit |
| fs.rm | 1 files · uncontended | 45 | 6.84 | 21.38 | 28.73 | 37.56 | 1.02× | 2.03× | — | — | 129 / 6,268 / 0 | — | 6.843 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 7 | 1.79 | 1.97 | 1.97 | 2.39 | 1.10× | 1.02× | — | — | 35 / 3,323 / 0 | — | 0.002 ms per byte | — |
| fs.stat | ≤512 KiB · contended | 1 | 1.71 | 1.71 | 1.71 | 1.71 | no baseline | no baseline | — | — | 97 / 4,347 / 0 | — | 0 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 6 | 2.11 | 2.74 | 2.74 | 3.85 | 1.23× | 1.44× | — | — | 65 / 4,565 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 17 | 1.97 | 2.61 | 2.61 | 2.65 | 1.12× | 1.27× | — | — | 42 / 3,543 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 2.52 | 2.52 | 2.52 | 3.56 | 1.80× | 1.12× | — | — | 96 / 6,230 / 0 | — | 0.0011 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 11 | 1.58 | 2.79 | 2.79 | 5.91 | 1.06× | 1.28× | — | — | 38 / 2,793 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 96 | 7.97 | 13.15 | 30.39 | 33.35 | 1.09× | 0.97× | — | — | 244 / 13,392 / 0 | — | 0.0099 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 272 | 6.03 | 9.39 | 13.84 | 19.93 | 1.03× | 1.04× | — | — | 135 / 5,997 / 0 | — | 0.0072 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 10 | 10.38 | 14.71 | 14.71 | 18.27 | 0.94× | 0.99× | — | — | 339 / 19,746 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 14 | 9.25 | 13.49 | 13.49 | 15.33 | 0.99× | 1.42× | — | — | 153 / 7,601 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 287 | 9.47 | 16.41 | 26.39 | 30.12 | 1.02× | 1.03× | — | — | 338 / 16,879 / 0 | — | 0.0006 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 362 | 7.32 | 11.52 | 14.42 | 17.33 | 1.04× | 1.17× | — | — | 159 / 6,961 / 0 | — | 0.0004 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 365 | 8.62 | 14.26 | 22.24 | 27.35 | 1.01× | 0.87× | — | — | 307 / 15,994 / 0 | — | 0.0024 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 630 | 6.32 | 9.87 | 13.34 | 14.39 | 1.00× | 0.96× | — | — | 146 / 6,185 / 0 | — | 0.002 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.68 | 0.68 | 0.68 | 0.68 | 1.14× | 1.14× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 46 | 33.67 | 66.55 | 73.76 | 82.20 | 1.48× | 1.58× | — | — | 491 / 48,553 / 29 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 69 | 29.58 | 87.44 | 103.82 | 335.90 | 1.30× | 2.23× | — | — | 322 / 36,426 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 11 | 3.76 | 5.55 | 5.55 | 10.24 | 1.16× | 1.33× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 28 | 3.42 | 4.40 | 5.34 | 5.85 | 1.03× | 0.94× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 10 | 8.98 | 19.95 | 19.95 | 68.39 | 1.04× | 1.17× | — | — | 132 / 5,159 / 0 | — | 8.981 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 15 | 8.02 | 11.73 | 11.73 | 19.59 | 1.06× | 1.13× | — | — | 117 / 5,212 / 0 | — | 8.022 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 390.80 | 390.80 | 390.80 | 390.80 | 7.77× | 7.77× | — | — | 9,110 / 365,898 / 0 | — | 390.8 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 34.84 | 34.84 | 34.84 | 34.84 | no baseline | no baseline | — | — | 835 / 55,732 / 38 | — | 1.8339 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 12 | 15.23 | 27.79 | 27.79 | 47.79 | 0.99× | 1.33× | — | — | 239 / 11,186 / 0 | — | 6.352 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 5 | 13.22 | 16.80 | 16.80 | 21.96 | 1.33× | 1.50× | — | — | 161 / 7,044 / 0 | — | 5.5987 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 2 | 12.66 | 12.66 | 12.66 | 24.26 | 0.85× | 0.85× | — | — | 154 / 8,649 / 0 | — | 1.5829 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 10 | 25.28 | 33.84 | 33.84 | 61.18 | 2.24× | 2.99× | — | — | 264 / 16,712 / 0 | — | 2.1063 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 1263.73 | 1263.73 | 1263.73 | 1263.73 | no baseline | no baseline | — | — | 10,219 / 988,753 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 13 | 54.51 | 376.09 | 376.09 | 12008.12 | 0.79× | 5.45× | — | — | 556 / 65,216 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 215 | 42.57 | 860.12 | 1148.45 | 1966.63 | 1.05× | 2.48× | — | — | — | 2,288 | — | — |
| sandbox.exec | 0 files · uncontended | 140 | 34.39 | 610.90 | 988.33 | 5915.59 | 1.27× | 2.37× | — | — | — | 2344.30 | — | — |
| sandbox.exec | 1 files · contended | 37 | 31.73 | 41.30 | 41.50 | 44.76 | 1.01× | 0.70× | — | — | — | 4.70 | 31.732 ms per file | — |
| sandbox.exec | 1 files · uncontended | 48 | 35.06 | 50.69 | 59.20 | 121.20 | 1.15× | 0.86× | — | — | — | 5 | 35.064 ms per file | — |
| sandbox.exec | 17–64 files · contended | 10 | 56.41 | 71.93 | 71.93 | 73.69 | 0.88× | 1.12× | — | — | — | 37.20 | 2.8206 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 6 | 70.57 | 80.19 | 80.19 | 82.19 | 1.03× | 1.16× | — | — | — | 99 | 3.5284 ms per file | — |
| sandbox.exec | 2–4 files · contended | 42 | 34.84 | 56.41 | 110.91 | 117.20 | 0.92× | 0.91× | — | — | — | 10 | 12.0465 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 33 | 34.08 | 68.11 | 71.11 | 72.41 | 1.04× | 1.29× | — | — | — | 10 | 12.365 ms per file | — |
| sandbox.exec | 5–16 files · contended | 28 | 40.01 | 78.83 | 96.83 | 108.64 | 0.76× | 1.36× | — | — | — | 20.20 | 4.5485 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 79 | 37.43 | 69.85 | 76.16 | 83.05 | 0.71× | 0.97× | — | — | — | 15.70 | 4.1793 ms per file | — |
| sandbox.exec | — · contended | 14 | 1808.50 | 21518.83 | 21518.83 | 22638.49 | no baseline | no baseline | — | — | — | 28924.20 | — | — |
| sandbox.exec | — · uncontended | 34 | 274.45 | 10550.02 | 14583.30 | 19299.32 | 0.54× | 2.21× | — | — | — | 28924.20 | — | — |
| sandbox.mount | — · contended | 82 | 10.04 | 13.32 | 15.17 | 17.02 | 1.00× | 0.86× | — | — | 56 / 1,523 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 139 | 9.71 | 13.92 | 17.96 | 24.32 | 1.06× | 1.00× | — | — | 50 / 1,424 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 4.53 | 8.30 | 8.30 | 23.19 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 73 | 8.51 | 13.97 | 15.58 | 18.31 | 1.02× | 1.13× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 148 | 9.10 | 36.22 | 76.50 | 125.27 | 1.00× | 2.61× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 18 | 0.0 KiB | 953.8 KiB | 4,216 | ok 18 |
| branch.diff_commits | branch | 269 | 0.0 KiB | 13.3 MiB | 49,904 | ok 269 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 83.8 KiB | 143 | ok 9 |
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

Load average (1-min, runner (Docker VM kernel)): start 1.66 · end 2.7.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.944 | 8.836 · 1.944 · 2.012 · 1.382 · 1.6 | 3.47–3.47 | statements 22, vm_steps 1236, fullscan_steps 0, sorts 0, returned_rows 121 |
| read | 1.525 | 1.536 · 1.724 · 1.525 · 1.155 · 1.147 | 3.47–3.47 | statements 21, vm_steps 1206, fullscan_steps 0, sorts 0, returned_rows 120 |
| list_small | 1.455 | 1.455 · 1.699 · 1.883 · 1.29 · 1.452 | 3.47–3.47 | statements 21, vm_steps 1215, fullscan_steps 0, sorts 0, returned_rows 120 |
| list_largest | 5.633 | 6.031 · 5.663 · 5.578 · 5.32 · 5.633 | 3.47–3.47 | statements 110, vm_steps 12634, fullscan_steps 0, sorts 0, returned_rows 1306 |
| grep_scoped | 1.852 | 2.195 · 1.446 · 1.757 · 2.02 · 1.852 | 3.47–3.47 | statements 26, vm_steps 1361, fullscan_steps 0, sorts 0, returned_rows 129 |
| glob_scoped | 1.889 | 1.707 · 1.889 · 2.046 · 1.978 · 1.21 | 3.47–3.47 | statements 20, vm_steps 1194, fullscan_steps 0, sorts 0, returned_rows 119 |
| grep_tree | 3158.718 | 3158.718 · 3244.958 · 3130.766 · 2943.246 · 3222.563 | 3–3.47 | statements 32729, vm_steps 2647797, fullscan_steps 0, sorts 0, returned_rows 268768 |
| glob_tree | 9.439 | 10.475 · 9.439 · 10.599 · 8.827 · 8.086 | 3–3 | statements 240, vm_steps 17778, fullscan_steps 0, sorts 0, returned_rows 1748 |
| diff_files | 6.508 | 5.963 · 5.944 · 6.911 · 6.777 · 6.508 | 3–3 | statements 120, vm_steps 7264, fullscan_steps 0, sorts 0, returned_rows 732 |
| list_commits | 1.363 | 1.739 · 3.153 · 1.039 · 1.363 · 1.251 | 3–3 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.51 | 8.153 · 3.51 · 3.166 · 3.986 · 3.267 | 3–3 | statements 80, vm_steps 2653, fullscan_steps 0, sorts 0, returned_rows 281 |
| fork | 0.462 | 1.118 · 0.537 · 0.462 · 0.326 · 0.286 | 3–3 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 33.386 | 33.386 · 35.231 · 32.141 · 33.703 · 32.798 | 3–3 | statements 554, vm_steps 27362, fullscan_steps 4, sorts 8, returned_rows 2067 |
| oneshot_mount_unmount | 17.944 | 18.158 · 17.9 · 17.944 · 18.636 · 16.237 | 3–3 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 74.114 | 73.426 · 67.513 · 79.122 · 74.114 · 80.241 | 3–3 | statements 170, vm_steps 9981, fullscan_steps 80, sorts 2, returned_rows 959 |
| oneshot_exec | — |  ·  ·  ·  ·  | 3–3 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r015: 51,603 pages of 4,096 B, 0 free · Commits 12,937 · Branches 199 · Layers 19 · compression 4.00× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 49,657 | 280.3 MiB |
| 2 | 24,066 | 245.6 MiB |
| 3 | 11,562 | 1.5 MiB |
| 4 | 19 | 4.4 KiB |
| 5 | 11,506 | 1.2 MiB |
| 6 | 17,427 | 96.7 MiB |
| 7 | 13,639 | 3.1 MiB |
| 8 | 18 | 5.3 KiB |
| 9 | 16,766 | 16.7 MiB |
| 10 | 14,293 | 1.8 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,490 | 121.2 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 12,999 | 19.0 MiB |
| 1 | 24,311 | 143.2 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 44,444 | 173.6 MiB | 9.3 MiB |
| inode_value | 2,346 | 9.2 MiB | 277.9 KiB |
| object_location | 2,329 | 9.1 MiB | 977.4 KiB |
| commit | 983 | 3.8 MiB | 646.7 KiB |
| binding_hint | 469 | 1.8 MiB | 190.8 KiB |
| commit_runs | 283 | 1.1 MiB | 186.3 KiB |
| commit_lineage | 277 | 1.1 MiB | 124.2 KiB |
| commit_identity | 198 | 792.0 KiB | 82.2 KiB |
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

**Time 240.1 s** (tooling): play 138.0 · consolidate 55.8 · verify 19.5 · probes 16.7 · tests 0.0 · seal + snapshot 2.5 · report 7.6

240.08 s tooling: prepare 1.86 · play 136.11 · consolidate 55.78 · verify 10.03 (diff_commits + full compareTree) · version walk 9.45 · probes 16.76 · metrics 1.17 · seal 1.21 · sealed figures 0.39 · snapshot copy 0.88 · report 0.22

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T11:21:34.175Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 3536/3537; conflicts 3/3; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 8.48× baseline (no phase); Scaling: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Counters: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 157.6 MiB; median not judged: 0 of 3 earlier ranges; Node proofs: 0 pass · 0 stop · 35 NOT_RUN over 7 points |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T11:27:32.088Z | stop | Speed: branch.diff_branches >64 entries · uncontended: 5.96× baseline (no phase); Scaling: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 157.9 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 872 ms for 202.2 MiB new; size exponent not judged (1 snapshots); Node proofs: 31 pass · 2 stop · 0 NOT_RUN over 8 points: r015-2-docs-rfc mid P4, lead repair P6 |
| 3 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T12:30:03.383Z | stop | Speed: not judged: sandbox.commit — · Committed · uncontended: baseline class has 3/3/3 calls (minimum 5 per range); 5.45× it; Scaling: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 1 of 3 points of probe version 1; Counters: insufficient same-binary points: 1 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 157.3 MiB; median not judged: 0 of 3 earlier ranges; Snapshot time: 832 ms for 201.6 MiB new; size exponent not judged (1 snapshots); Node proofs: 19 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P6 |

### G. Evidence

- `~/lfs-history/metrics/range-015.a1.json`
- `~/lfs-history/metrics/range-015.a2.json`
- `~/lfs-history/metrics/range-015.a3.json`
- trace `~/lfs-history/runs/p3-main-c/trace/range-015.a3.jsonl` · runner log `~/lfs-history/runs/p3-main-c/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-015.p3-main-c.json`

### H. Git internals

Seed pack: — objects, 10.1 MiB (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r015-1-root | 447 | 154.0 KiB |
| r015-3-packages-core | 1,286 | 155.8 KiB |
| r015-2-docs-rfc | 1,382 | 160.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 243.0 | 1,300 |
| `git diff --stat` | 30.0 | 1,281 |
| `git add -f` | 18.0 | — |
| `git rm --cached` | 4.0 | — |
| `git commit` | 29.0 | 1,286 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| lead | initial | P1 | pass | — | — |
| lead | initial | P2 | pass | exit 0 | — |
| lead | initial | P3 | n/a | the lead's first install | — |
| lead | initial | P4 | pass | 500 emitted files, exit 0 | — |
| lead | initial | P5 | n/a | no tests at the first install | — |
| lead | initial | P6 | n/a | not a repair | — |
| r015-3-packages-core | end | P1 | pass | — | — |
| r015-3-packages-core | end | P2 | pass | exit 0 | — |
| r015-3-packages-core | end | P3 | pass | 139 bookkeeping path(s) | — |
| r015-3-packages-core | end | P4 | pass | 242 emitted files, exit 2 | — |
| r015-3-packages-core | end | P5 | pass | 86 files | — |
| r015-3-packages-core | end | P6 | n/a | not a repair | — |
| r015-1-root | end | P1 | pass | — | — |
| r015-1-root | end | P2 | pass | exit 0 | — |
| r015-1-root | end | P3 | n/a | an install, not a refresh | — |
| r015-1-root | end | P4 | pass | 483 emitted files, exit 2 | — |
| r015-1-root | end | P5 | pass | 135 files | — |
| r015-1-root | end | P6 | n/a | not a repair | — |
| r015-2-docs-rfc | end | P1 | pass | — | — |
| r015-2-docs-rfc | end | P2 | pass | exit 0 | — |
| r015-2-docs-rfc | end | P3 | pass | 139 bookkeeping path(s) | — |
| r015-2-docs-rfc | end | P4 | pass | 195 emitted files, exit 2 | — |
| r015-2-docs-rfc | end | P5 | pass | 53 files | — |
| r015-2-docs-rfc | end | P6 | n/a | not a repair | — |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | stop | P1 stop (missing 0, extra 0, differ 1: node_modules/.pnpm/node_modules), P4 pass (503 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
