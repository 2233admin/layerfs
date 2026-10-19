# Range 017 · **watch** · attempt 2

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r016 (run p3-main-f)
dsh `a2c53a885`..`cf872d002` · **60 commits** (7 mainline, 53 side) · 2026-07-06 → 2026-07-17
Areas changed: `/` 13% · `examples/acp-agent` 11% · `packages/support` 7% · other 69%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 97.5 s · git 104.4 s · Node 175.9 s · verify 86.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **436.3 MiB** (+2.6 MiB) | **265.7 MiB** (+21.9 MiB) | **0.61×** (prev 0.56×) | **24.2 MiB** | **1,045** (total 15,811) | **317.2 s** tooling (total 19.9 min) |

**Checks:** 13 pass · 6 watch: Speed branch.diff_commits >64 entries · uncontended: 18.13× baseline (no phase); Scaling fork: depth exponent 3.441; time-only trip (identical SQL counters at every point): watch, optimize only if it repeats at range 18; Counters glob_tree.returned_rows per tree file: depth exponent 0.325; Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (11 classes too narrow); Range growth 24.2 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time 1141 ms for 236.7 MiB new; size exponent 0.552
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▲ sandbox.exec p95 +66% · ▲ probe stat +46% · ▼ fs.read p95 −43%
**Budget:** 18 of 202 ranges · projected total 16.6 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,566 tracked files match** (blob id and mode) |
| History | 3 lanes merged, 1 publish |
| Steps | 2,025 / 2,025 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of the on-top chain (lead, lane points, repair): **equal to native** (the repair's P1) · the lead's chain alone (context; without the lane points' installs and builds): 0 missing, 0 extra, 1 differ (`python/sdk-runtime/node_modules/.bin`) · not byte-compared: 3 pnpm state file(s) · by target: 273 bin shims, 2723 links · output root ×0, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (30 lines from 1 .gitignore files) · **170 picks** in 3 merges (170 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `cf872d002`** · 122 commits written for 122 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 0 untracked, unignored (0 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 170 · Build outputs 0 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r017-1-root | end | `a95c9ef5ed33` | `4a2b51394cf6` | pass (269 normalized) | pass | n/a | pass | n/a | n/a |
| r017-2-docs-rfc | end | `a7b4c603d163` | `d4496ce97c22` | pass (269 normalized) | pass | pass | pass | pass | n/a |
| r017-3-packages-bash | end | `7981b795ae7e` | `d4496ce97c22` | pass (269 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `07b0aca5a949` | `null` | n/a | pass | n/a | n/a | pass | pass (95,345 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/examples/stdio-demo/tests/stdio-agent.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/skill/skill-local/tests/skill-local.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/web/tool-web/tests/spill.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively).

## 2. Activity

**2,622 calls** · **142 steps** by **8 agents + lead** on **3 Branches + main** · **190 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +145 added · 755 modified · −76 deleted · 11.8 MiB written · fs 897 : Sandbox 79 (**11 : 1**, reported only in P3)
**Execs:** 519 (JS 48 · shell 471) · 3 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,216 | 910 | 306 | Committed 910 · Text 30 · NoSuchPath 11 · Equal 3 |
| sandbox | 1,089 | 705 | 4 | commit 186 (Committed 150, UpToDate 35, Conflict 1) · exec 519 (exit:0 516, exit:2 2, exit:1 1) · mount 190 (Mounted 190) · status 4 · unmount 190 (Unmounted 190) |
| branch | 307 | 32 | 275 | diff_branches 10 · diff_commits 265 · fork 23 (Forked 23) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,622** | **1,647** | **595** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r017-1-root | a01 a02 | 18 | 360 | ✓ | — |
| r017-2-docs-rfc | a03 a04 a05 | 48 | 237 | ✓ | — |
| r017-3-packages-bash | a06 a07 a08 | 70 | 267 | ✓ | — |
| main | lead | 6 | 181 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r017-3, a08 after a06 | 0.3 s |
| Stale clean merge | 1 / 1 | r017-3, a06 a08 | merged cleanly |
| Decoy edit | 1 / 1 | r017-3, a07 a08 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r017-1 | 10 | 6 | 4 | 0 | 0 | 182 | — |
| a02 | r017-1 | 8 | 6 | 2 | 0 | 0 | 178 | — |
| a03 | r017-2 | 23 | 7 | 16 | 0 | 0 | 91 | — |
| a04 | r017-2 | 14 | 9 | 5 | 0 | 0 | 87 | — |
| a05 | r017-2 | 11 | 4 | 7 | 0 | 0 | 59 | — |
| a06 | r017-3 | 23 | 10 | 13 | 0 | 0 | 91 | commit-conflict, stale-clean-merge |
| a07 | r017-3 | 18 | 10 | 8 | 0 | 0 | 99 | decoy |
| a08 | r017-3 | 29 | 9 | 20 | 0 | 0 | 77 | commit-conflict, stale-clean-merge, decoy |
| lead | main | 6 | 1 | 0 | 5 | 0 | 181 | — |
| **Total** |  | **142** | **62** | **75** | **5** | **0** | **1,045** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 104 · pnpm 1 · tsc 4 · vitest 4 · other 406

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r017-3-packages-bash | 43 | 43 | 43 | 1 | 43 | 636 |
| r017-2-docs-rfc | 39 | 39 | 39 | 1 | 39 | 613 |
| r017-1-root | 15 | 15 | 15 | 5 | 15 | 272 |
| **lead** | — | — | — | — | 122 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r017-1-root | 1 | 0 | 1 | 0 | 0 | — / — |
| r017-2-docs-rfc | 0 | 1 | 1 | 1 | 25 | 25 / 25 |
| r017-3-packages-bash | 0 | 1 | 1 | 1 | 38 | 38 / 38 |
| **lead repair** | 1 | — | 1 | — | — | 95,345 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r016) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 433.7 MiB (10.3 MiB / 396.5 MiB / 11.1 MiB / 15.8 MiB) | 436.3 MiB (10.7 MiB / 396.6 MiB / 11.7 MiB / 17.3 MiB) | +2.6 MiB |
| Version figures from | — | full: first (no manifest for range 16) | — |
| Files / directories / symlinks | 41,376 / 6,927 / 2,663 | 41,546 / 6,995 / 2,729 | +170 / +68 / +66 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 243.7 MiB | 265.7 MiB | +21.9 MiB |
| **Space amplification** (total · tracked) | 0.56× · tracked 3.26× | 0.61× · tracked 3.29× | 0.05 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **9.05** (0.46 / 0.09 / 0.39) | 4.79× the median range |
| **Stored per Commit** | 19.1 KiB | 21.4 KiB | — |
| Metadata share | 0.33 | 0.35 | this range 0.46 |
| History: Commits / Layers / Branches | 14,766 | 15,811 / 10 / 67 | +1,045 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.91 GiB (Commits 7.45 GiB · installs 1.08 GiB · build 118.1 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.49 GiB / 36% | — |
| Snapshot | — | r017, 236.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 173.5 MiB | 0.40 | +10.7 MiB |
| Metadata | 25.7 MiB | 0.06 | +2.2 MiB |
| Index rows | 49.1 MiB | 0.11 | +7.9 MiB |
| Waste | 17.0 MiB | 0.04 | +1.0 MiB |
| Other | 332.0 KiB | 0.00 | +24.0 KiB |
| **Total = Store on disk** | **265.7 MiB** | **= 0.61** space amplification | +21.9 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 10.7 MiB | 35.3 MiB (15.3 MiB + 20.0 MiB) | 3.29× | — | 1.7 MiB | 2.7 MiB | 0.62 |
| `node_modules` | 396.6 MiB | 106.4 MiB (103.3 MiB + 3.1 MiB) | 0.27× | — | 714.4 KiB | 18.6 MiB | 0.04 |
| Build output | 11.7 MiB | 3.5 MiB (3.4 MiB + 101.5 KiB) | 0.30× | — | 269.6 KiB | 1.9 MiB | 0.14 |
| `.git` | 17.3 MiB | 53.6 MiB (51.4 MiB + 2.2 MiB) | 3.10× | — | 10.2 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 66.5 MiB | — (not divided) | — | 9.0 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 389.3 KiB | — | — | — | — | — |
| **Total** | — | **265.7 MiB** | **= 0.61×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 58,250 | +2,993 | 5.8 KiB | 38,253 (derived) | 55% |
| Chunks (large files) | 25,862 | +693 | 11.0 KiB | — | 8% |
| Large-file extents | 11,911 | — | 0.1 KiB | — | — |
| Directories | 40,461 | 3,239 (with inodes, pooled) | 0.2 KiB | — | 59% |
| Inodes and attributes | 92,377 | ↑ pooled | 2.0 KiB | — | — |
| Symlinks | 1,566 | +2,735 | 0.1 KiB | — | — |

Delta: 2.5% at depth cap · 32% of refused bases stopped by budget · `node_modules` reinstall: absolute: 640580 new stored bytes for 75810 raw changed bytes of 55 changed packages (8.45×; raw under 1 MiB)

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.29× (35.3 MiB for 10.7 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.9 KiB / 2.4 KiB / 6.7 KiB over 219 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (984.0 KiB stored for 1.16 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.20 (3 lanes × 436.3 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 10.2 ms / 22.2 ms (1.50×) | 2.8 ms / 5.8 ms (1.62×) | 3.7 ms / 6.2 ms (2.05×) | 26.5 ms / 73.8 ms (1.29×) | 12.1 ms / 24.9 ms (1.25×) | 918 ms / 918 ms (1.80×) | — (native comparison in P3; exec 49.5 ms / 1275 ms) |
| SQL p50: 152 stmts | 51 stmts | 63 stmts | 222 stmts | 48 stmts | 11,712 stmts | — |

**Commit cost:** 16.36 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 719 ms p50 over 190
**Slowest:** sandbox.exec 36826 ms · sandbox.exec 29444 ms · sandbox.exec 28164 ms · checkpoint diff_commits 1.50 ms and 17.11 statements per entry (48,577 entries per page)
**Scaling:** 7 of 15 probes flat · `stat` 3.31 · `list_largest` 2.32 · `grep_tree` 0.95 · `glob_tree` 1.21 · `diff_files` 0.26 · `diff_commits` 1.22 · `fork` 3.44 · `merge` 0.24

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 329 ms / 329 ms | — / — | — | git / status-cold: — |
| git status (steady) | 351 ms / 724 ms | — / — | — | git / status-steady: — |
| git add | 30.0 ms / 93.0 ms | — / — | — | git / add: — |
| git commit (lane) | 37.0 ms / 100 ms | — / — | — | git / commit: — |
| lead writes main | 4094 ms / 4094 ms | — / — | — | — |
| repack | 2646 ms / 2646 ms | — / — | — | — |
| pnpm install (incremental) | 2770 ms / 2770 ms | 1192 ms / 1192 ms | 2.32× | pnpm-reinstall / cold: — |
| pnpm refresh | 2679 ms / 2679 ms | 1168 ms / 1168 ms | 2.29× | pnpm-reinstall / steady: — |
| tsc -b | 3859 ms / 3859 ms | 2868 ms / 2898 ms | 1.35× | tsc-b / cold: — |
| vitest | 3426 ms / 3426 ms | 2326 ms / 2326 ms | 1.47× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 12.5 ms / 26.9 ms

## 5. Findings and action

### Finding 017.a1 · optimize

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Scaling | list_largest per entry of the largest directory: depth exponent 2.22 | < 0.15 |
| Counters | list_largest.statements per entry of the largest directory: depth exponent 1.188 | < 0.05 |
| Reinstall growth | 8.427× the raw bytes of 55 changed packages | ≤ 2× changed packages; ≤ 1 MiB with none |

Diagnosis pending: `finding-017.a1.json`.

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

- **a1 (`p3-main-f`, harness `e071c5d436`, daemon `44ac6c91`, addon `77597adb`): OPTIMIZE. Correctness, git and Node are clean; held for a gate decision.** Checkpoint ok, git ✓ (status clean; decision B cleaned 0 files). Node 16 pass, 0 stop, 0 NOT_RUN over 4 points; tests equal to native. Report check F1–F8 PASS. Three rows are at optimize:
  - **Scaling / Counters, `list_largest`** (depth exponent 2.22 ms, 1.188 statements per entry). This is the first range with 3 same-binary points (r015–r017). The probe lists `/scripts` (45 → 50 → 50 entries). Statements per call went 72 → 92 → 103, blob reads 153 → 207 → 240. From r016 to r017 the directory is the same size (50 entries) and +11 statements are the only change. `scripts/` changes in most ranges, and each change adds a link to the metadata delta chains its entries are read through. Metadata depths are capped at 8 (histogram `metadata` has 9 buckets, 0–8). This is the bounded chain residual recorded in fix 011.a1 / F-016 for this same probe ("+16% per entry r9 → r11 is the leaves' chain position, bounded"). But `list_largest` is fitted as a depth exponent, not judged as a bound over a cap period, so the gate reads it as growth. Not filed as a product F-number; the gate reading is with the liaison.
  - **Reinstall growth** 8.43× the raw bytes of 55 changed packages: 638,855 B stored new for 75,810 B of raw package change. The clean relink stores about the same each range (r015 646,831 B; r016 0.106× of 101 packages). This is the open link-unit gate question (BASELINE_R15 §5: "a later range that shows them has not regressed"; option (b), absolute bytes, is the owner's call).
  - **Speed** (watch): `branch.diff_commits` 17.82× is verify's relink-over-relink diff (range 16 note); verify took 82.2 s. `sandbox.commit 0 files · Committed · uncontended` is at 1.51× p50 and 1.62× p95 (r015 1.21×, r016 1.19×). The gate reports only the worst row; Docker VM load was comparable and the macOS host was at 11–13.
- **Against range 15:**
  - Uncontended p50s are 1.07–1.51× (writes 1.29–1.38×).
  - Stored per Commit 25.3 KiB (r015 60.3, r016 19.1); content ratio 0.21× (0.29×); churn 0.00 (982 KiB stored for 1.16 GiB rewritten).
  - Index rows aren't split this range: the Store is live, with no snapshot due. Index rows + waste + other total 70.7 MiB live.
  - Tooling 290.0 s; the final command took 195 s under the 295 s alarm.
- **Process:** the proof command's budget let the repair's native chain start late, and the 115 s alarm stopped it before it saved. The rerun used the cached lane oracle and computed the repair; nothing recorded was lost.
- **a2 (`p3-main-g`, harness `05e3713f2c`, daemon `44ac6c91`, addon `77597adb`): WATCH, terminal.** Forked from `p3-main-f`'s r016 snapshot. The fork takes its P3 state from the snapshot and its storage parts from range-016.a3's metrics (closure chain 8, `groups-016`). It plays with the two gate decisions above. Checkpoint ok, git ✓ (decision B cleaned 0 files). Node 16 pass, 0 stop, 0 NOT_RUN over 4 points. Report check F1–F8 PASS.
  - **Gate decisions applied:** `list_largest` is judged by the F-016 chain bound and is not judged yet (3 of 9 points). Reinstall growth is absolute: 640,580 B stored new for 75,810 B raw of 55 packages, pass.
  - **Watch rows:**
    - `diff_commits` 18.13× is verify's relink-over-relink diff, as in r016 (verify 86.3 s).
    - The `fork` scaling probe: 0.29 → 0.56 → 0.57 ms at 16 statements and 274 VM steps every time. This is time-only, so the gate holds it at watch until r018.
    - `glob_tree` returned rows per file: exponent 0.325.
    - Snapshot time: 1,141 ms for 236.7 MiB.
  - **Speed, every uncontended class (the gate reports only the worst):** p50 and p95 ratios to the P3 baseline rise from r015 to r017 across almost every class. Examples: `fs.write ≤1 KiB` p50 1.01 → 1.34 → 1.73; `fs.write ≤8 KiB` 0.99 → 1.27 → 1.50; `sandbox.mount` 0.99 → 1.12 → 1.25; `fs.stat ≤8 KiB` p95 1.04 → 3.99 → 4.64. The SQL work per call is flat or lower:
    - writes 164 → 171 → 152 statements at p50; reads 51 → 56 → 51;
    - the `stat` probe 22 → 16 → 15 statements and 1,292 → 1,138 VM steps, while its time went 1.70 → 2.39 → 3.49 ms.

    The Docker VM's 1-minute load stayed at 0.7–1.8. The macOS host was at 9–13, with Chrome, Claude and Spotlight (`mds_stores`) busy. Read as time-only host contention, not a product regression: no counter grew. The gate's rising rule needs 4 same-binary points, so nothing is at optimize. Not filed; flagged to the liaison with the table. A range that shows counters rising with the times becomes a stop.
- **Against range 15 (a2):**
  - Method p50 ratios: write 1.50× (r015 0.99×), read 1.62× (1.11×), list 2.05× (1.32×), Commit 1.29× (1.21×), mount 1.25× (0.99×), merge 1.80× (3.73×). All are time-only, as above.
  - Stored per Commit 21.4 KiB (r015 60.3, r016 19.1).
  - Index rows +7.9 MiB for 1,045 Commits, 7.7 KiB per Commit (r015 9.1, r016 5.7).
  - Content ratio 0.21× (0.29×); churn 0.00 (984 KiB stored for 1.16 GiB rewritten; r015 0.26).
  - Tooling 317.2 s; the final command took 216 s under the 295 s alarm. Lanes ran in one 101 s command.
- **Correction (after a2, liaison question; verdict unchanged):** the Installed tree row read "**differs**: 0 missing, 0 extra, 1 differ" while every Node proof passed. The row read a different listing.
  - With Node on, the closure's inline oracle replays the lead's chain alone. `nodeproof.mjs` judges the installed tree at the repair (P1 inside P6) against the on-top chain: the lead, every lane point's install and build, then the repair.
  - The one group, `python/sdk-runtime/node_modules/.bin`, is equal to the on-top chain: 3 files, 2,778 B, digest `d785f42d…` on both sides. The lead-only chain has 2 files and 1,344 B (`9bb41a00…`), because pnpm links a workspace bin only when its target exists, and that target is a lane's build output.
  - The row now leads with the on-top chain's result (the repair's P1) and shows the lead-only comparison as labelled context (`format.mjs` installedText; tests in `tests/p2.mjs`). The proofs are unchanged.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2025/2025; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 18.13× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | fork: depth exponent 3.441; time-only trip (identical SQL counters at every point): watch, optimize only if it repeats at range 18 | < 0.15 | watch |
| Counters | glob_tree.returned_rows per tree file: depth exponent 0.325 | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (11 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.464 | < 0.5 | pass |
| Reinstall growth | absolute: 640580 new stored bytes for 75810 raw changed bytes of 55 changed packages (8.45×; raw under 1 MiB) | ≤ 2× changed packages; ≤ 1 MiB with none or under 1 MiB raw | pass |
| Delta at cap | 0.025 (budget 0.3231) | < 0.1 | pass |
| Range growth | 24.2 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 1141 ms for 236.7 MiB new; size exponent 0.552 | < 0.15 | watch |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 0.99 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 122 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 16 pass · 0 stop · 0 NOT_RUN over 4 points | P1–P6 pass at every point | pass |
| `.git` conflicts | 0 (tracked 0 · install 170 · build 0; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.21× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 142 | 143 |
| Lanes / agents | 3 / 8 | 3 / 8 |
| LayerFS Commits | 1045 | 937 |
| Workspaces (one-shot share) | 190 (0.99) | 74 (0.973) |
| Reads | 263 | 263 |
| Reconcile writes | 174 | 174 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 10 | 31.36 | 245.50 | 245.50 | 262.94 | 2.04× | 4.90× | 3.33 | 4.14 | 364 / 31,339 / 0 | — | 0.129 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 19.78 | 19.78 | 19.78 | 19.81 | no baseline | no baseline | — | — | 226 / 14,369 / 0 | — | 0.3532 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 258 | 314.87 | 384.98 | 453.36 | 603.57 | 18.13× | 15.03× | 15.60 | 20.03 | 3,666 / 562,884 / 0 | — | 1.6412 ms per entrie | — |
| branch.fork | — · uncontended | 7 | 1.31 | 1.59 | 1.59 | 9.99 | 1.89× | 1.17× | -0.49 | -0.98 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.80 | 0.80 | 0.80 | 1.03 | no baseline | no baseline | 0.99 | 1.43 | 70 / 1,298 / 0 | — | 0.0401 ms per entrie | — |
| branch.merge | 5–16 entries · Merged · uncontended | 1 | 2.85 | 2.85 | 2.85 | 2.85 | no baseline | no baseline | — | — | 35 / 517 / 0 | — | 0.1899 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 917.84 | 917.84 | 917.84 | 1738.35 | 1.80× | 1.80× | -3 | -3.60 | 11,712 / 742,145 / 1,336 | — | 9.5608 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 6.68 | 6.68 | 6.68 | 6.68 | 2.42× | 2.42× | 1.88 | 2.26 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 33.14 | 33.14 | 33.14 | 33.14 | 1.74× | 1.74× | 0.70 | 1.04 | 178 / 16,896 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 2 | 7.79 | 7.79 | 7.79 | 8.02 | 0.90× | 0.66× | -1.34 | -1.41 | 140 / 7,905 / 0 | — | 0.0101 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 11 | 11.92 | 19.11 | 19.11 | 24.98 | 1.85× | 2.73× | 2.29 | 2.78 | 157 / 8,387 / 0 | — | 0.012 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 5 | 9.87 | 10.94 | 10.94 | 20.57 | 1.47× | 1.18× | -1.27 | -1.75 | 164 / 8,599 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 5 | 14.06 | 15.28 | 15.28 | 20.19 | 1.66× | 1.03× | 0.50 | 0.82 | 178 / 9,027 / 0 | — | 0.0023 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 32 | 11.20 | 16.54 | 17.64 | 21.32 | 1.59× | 1.68× | 2.06 | 2.52 | 151 / 8,306 / 0 | — | 0.0042 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 4 | 8.79 | 10.00 | 10.00 | 15.64 | 1.57× | 1.59× | 2.79 | 3.53 | 169 / 11,406 / 0 | — | 0.0528 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 12 | 7.62 | 11.49 | 11.49 | 12.27 | 1.41× | 1.55× | 2.50 | 3.15 | 155 / 8,894 / 0 | — | 0.0253 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 4 | 7.12 | 10.10 | 10.10 | 16.80 | 1.16× | 1.42× | 1.51 | 2.06 | 156 / 9,282 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 9 | 7.91 | 9.80 | 9.80 | 10.53 | 1.18× | 1.37× | 2.02 | 2.55 | 140 / 9,039 / 0 | — | 0.0005 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 1 | 11.73 | 11.73 | 11.73 | 11.73 | 2.21× | 1.70× | 2.63 | 3.23 | 147 / 6,904 / 0 | — | 0.0016 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 9 | 9.15 | 9.66 | 9.66 | 10.52 | 1.72× | 1.59× | 2.94 | 3.67 | 165 / 10,897 / 0 | — | 0.004 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 4.54 | 4.54 | 4.54 | 4.54 | 3.71× | 3.46× | 4.10 | 4.97 | 66 / 6,693 / 0 | — | 4.538 ms per file | — |
| fs.glob | 17–64 files · contended | 2 | 5.91 | 5.91 | 5.91 | 8.60 | 2.61× | 2.47× | 1.34 | 1.76 | 81 / 10,378 / 0 | — | 0.2325 ms per file | — |
| fs.glob | 17–64 files · uncontended | 3 | 9.71 | 9.71 | 9.71 | 10.57 | 5.03× | 3.71× | 2.75 | 3.36 | 107 / 11,007 / 0 | — | 0.3885 ms per file | — |
| fs.glob | 2–4 files · uncontended | 9 | 2.03 | 2.44 | 2.44 | 2.71 | 1.35× | 1.23× | 0.01 | 0.06 | 34 / 3,249 / 0 | — | 0.829 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 6.41 | 7.56 | 7.56 | 7.61 | 4.95× | 5.34× | 4.94 | 6.27 | 80 / 7,743 / 0 | — | 0.8007 ms per file | — |
| fs.glob | 5–16 files · uncontended | 11 | 3.83 | 6.46 | 6.46 | 11.92 | 1.98× | 2.79× | 1.90 | 2.31 | 50 / 4,041 / 0 | — | 0.4035 ms per file | — |
| fs.glob | >64 files · contended | 7 | 7.14 | 24.23 | 24.23 | 34.88 | 1.73× | 5.88× | -0.64 | -0.41 | 197 / 14,278 / 0 | — | 0.0264 ms per file | — |
| fs.glob | >64 files · uncontended | 5 | 7.00 | 15.83 | 15.83 | 23.58 | 1.34× | 2.07× | 1.08 | 1.61 | 97 / 13,355 / 0 | — | 0.0282 ms per file | — |
| fs.grep | 1 files · uncontended | 2 | 2.27 | 2.27 | 2.27 | 9.72 | 1.80× | 1.80× | 0.90 | 1.13 | 48 / 3,951 / 0 | — | 2.273 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 4 | 16.44 | 19.15 | 19.15 | 21.57 | 3.04× | 3.54× | 2.62 | 3.17 | 327 / 25,179 / 0 | — | 0.5633 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 5 | 18.54 | 19.51 | 19.51 | 25.80 | 5.15× | 4.50× | 3.15 | 3.92 | 328 / 18,847 / 0 | — | 0.4759 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 3.24 | 3.24 | 3.24 | 7.88 | 1.39× | 1.13× | 0.83 | 1.18 | 89 / 6,272 / 0 | — | 1.62 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 9 | 3.36 | 4.48 | 4.48 | 5.20 | 1.77× | 1.30× | 1.09 | 1.38 | 61 / 3,695 / 0 | — | 1.487 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 3 | 7.83 | 7.83 | 7.83 | 8.20 | 3.28× | 1.84× | 4.65 | 6.01 | 177 / 9,662 / 0 | — | 0.8608 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 11 | 8.42 | 10.20 | 10.20 | 10.36 | 2.67× | 2.97× | 2.36 | 2.80 | 145 / 9,746 / 0 | — | 1.0525 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 4 | 34.64 | 41.10 | 41.10 | 49.13 | 2.27× | 2.69× | 1.78 | 2.30 | 690 / 26,765 / 0 | — | 0.0328 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 4 | 24.47 | 34.04 | 34.04 | 42.01 | 2.13× | 2.16× | -0.36 | -0.31 | 556 / 23,644 / 0 | — | 0.0287 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 4.72 | 4.72 | 4.72 | 4.72 | 2.66× | 2.66× | 5.17 | 6.55 | 71 / 4,438 / 0 | — | 4.719 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 2.95 | 2.95 | 2.95 | 2.95 | 1.74× | 1.74× | — | — | 44 / 2,897 / 0 | — | 2.947 ms per entrie | — |
| fs.list | 17–64 entries · contended | 4 | 4.38 | 7.40 | 7.40 | 11.30 | 2.44× | 3.55× | 2.13 | 2.75 | 70 / 7,764 / 0 | — | 0.1542 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 14 | 4.63 | 6.19 | 6.19 | 7.02 | 1.92× | 2.46× | 1.69 | 2.17 | 73 / 7,969 / 0 | — | 0.1712 ms per entrie | — |
| fs.list | 2–4 entries · contended | 1 | 3.69 | 3.69 | 3.69 | 3.69 | 1.83× | 1.83× | 2.03 | 2.55 | 29 / 3,147 / 0 | — | 1.8475 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 5 | 2.21 | 2.40 | 2.40 | 5.04 | 1.23× | 1.01× | 0.22 | 0.26 | 40 / 3,321 / 0 | — | 0.735 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 2.84 | 2.84 | 2.84 | 2.84 | 1.45× | 1.15× | 2.53 | 3.30 | 67 / 6,760 / 0 | — | 0.4737 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 15 | 3.32 | 4.30 | 4.30 | 5.46 | 2.05× | 2.10× | 2.07 | 2.60 | 55 / 4,760 / 0 | — | 0.4749 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 3 | 2.11 | 2.11 | 2.11 | 3.28 | 1.77× | 1.77× | — | — | 34 / 3,986 / 0 | — | 0.0054 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 2.32 | 2.32 | 2.32 | 2.32 | 1.02× | 1.02× | -0.88 | -1.13 | 52 / 3,567 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 6 | 2.85 | 4.37 | 4.37 | 4.88 | 1.44× | 1.85× | 1.34 | 1.72 | 58 / 4,297 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 35 | 2.91 | 6.38 | 8.36 | 12.40 | 1.62× | 2.23× | 1.80 | 2.27 | 51 / 3,610 / 0 | — | 0.0013 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 12 | 13.86 | 28.15 | 28.15 | 29.39 | 1.73× | 2.09× | -0.11 | -0.25 | 206 / 11,217 / 0 | — | 13.863 ms per file | commit |
| fs.rm | 1 files · uncontended | 63 | 12.06 | 18.46 | 23.72 | 30.30 | 1.79× | 1.75× | 2.75 | 3.40 | 154 / 8,627 / 0 | — | 12.063 ms per file | commit |
| fs.stat | ≤1 KiB · uncontended | 7 | 3.19 | 5.95 | 5.95 | 7.25 | 1.96× | 3.09× | 3.20 | 4.01 | 49 / 4,040 / 0 | — | 0.0079 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 3 | 3.11 | 3.11 | 3.11 | 3.87 | 1.81× | 1.64× | 2.06 | 2.74 | 40 / 3,336 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 13 | 2.38 | 4.59 | 4.59 | 4.94 | 1.36× | 2.23× | 0.21 | 0.24 | 36 / 3,253 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 2.86 | 2.86 | 2.86 | 3.78 | 2.04× | 1.26× | 0.48 | 0.52 | 59 / 5,732 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 17 | 2.31 | 10.14 | 10.14 | 10.43 | 1.54× | 4.64× | 1.31 | 1.63 | 44 / 3,587 / 0 | — | 0.0006 ms per byte | — |
| fs.write | ≤1 KiB · contended | 19 | 19.68 | 33.23 | 33.23 | 40.07 | 2.69× | 2.46× | 4.71 | 5.95 | 260 / 14,556 / 0 | — | 0.0226 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 124 | 10.12 | 19.37 | 22.23 | 34.74 | 1.73× | 2.15× | 2.52 | 3.15 | 137 / 6,649 / 0 | — | 0.0131 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 1 | 16.97 | 16.97 | 16.97 | 16.97 | 1.53× | 1.14× | 1.68 | 2.07 | 321 / 16,537 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 14 | 11.06 | 16.67 | 16.67 | 27.30 | 1.19× | 1.75× | 0.56 | 0.68 | 136 / 5,112 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 48 | 14.86 | 37.82 | 43.96 | 51.29 | 1.60× | 2.37× | 2.09 | 2.65 | 261 / 15,179 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 228 | 10.07 | 17.05 | 25.75 | 39.18 | 1.44× | 1.74× | 1.52 | 1.91 | 161 / 7,505 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 59 | 12.71 | 31.02 | 32.99 | 53.94 | 1.49× | 1.89× | 2.23 | 2.92 | 236 / 13,886 / 0 | — | 0.0054 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 274 | 9.42 | 17.55 | 19.46 | 24.01 | 1.50× | 1.71× | 1.98 | 2.49 | 149 / 6,674 / 0 | — | 0.0041 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.73 | 0.73 | 0.73 | 0.73 | 1.24× | 1.24× | 0.11 | 0.11 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 32 | 37.38 | 62.79 | 73.78 | 106.82 | 1.64× | 1.49× | 0.07 | 0.08 | 412 / 37,327 / 25 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 66 | 29.53 | 63.04 | 82.19 | 259.87 | 1.29× | 1.61× | 0.25 | 0.29 | 273 / 26,768 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 8 | 5.10 | 5.94 | 5.94 | 12.79 | 1.57× | 1.42× | 1.86 | 2.31 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 27 | 4.11 | 6.62 | 10.35 | 15.07 | 1.23× | 1.42× | 1.04 | 1.32 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 8 | 13.96 | 33.65 | 33.65 | 36.40 | 1.62× | 1.97× | 2.38 | 3.08 | 123 / 4,104 / 0 | — | 13.962 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 12 | 10.18 | 20.85 | 20.85 | 39.51 | 1.34× | 2.00× | 0.92 | 1.15 | 114 / 5,108 / 0 | — | 10.182 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 651.23 | 651.23 | 651.23 | 651.23 | 12.95× | 12.95× | 1.51 | 1.60 | 10,316 / 520,867 / 8,191 | — | 651.232 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 21.63 | 30.40 | 30.40 | 42.91 | 1.41× | 1.45× | 1.31 | 1.50 | 178 / 11,080 / 0 | — | 6.978 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 11.24 | 13.22 | 13.22 | 21.33 | 1.13× | 1.18× | -0.82 | -0.98 | 117 / 4,943 / 0 | — | 4.354 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 3 | 27.95 | 27.95 | 27.95 | 64.05 | 2.47× | 2.47× | 1.17 | 1.25 | 317 / 19,955 / 0 | — | 4.9146 ms per file | commit |
| sandbox.commit | — · Committed · contended | 3 | 100.18 | 100.18 | 100.18 | 136.07 | no baseline | no baseline | -13.52 | -17.54 | 800 / 66,868 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 8 | 67.92 | 330.35 | 330.35 | 13475.78 | 0.98× | 4.79× | 1.49 | 1.93 | 500 / 38,226 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 176 | 529.62 | 1243.18 | 1934.25 | 2145.59 | 13.07× | 3.59× | 10.27 | 12.36 | — | 2229.70 | — | — |
| sandbox.exec | 0 files · uncontended | 125 | 37.94 | 585.02 | 731.75 | 5889.47 | 1.40× | 2.27× | 0.32 | 0.37 | — | 2221.50 | — | — |
| sandbox.exec | 1 files · contended | 35 | 50.13 | 68.35 | 73.23 | 76.72 | 1.59× | 1.16× | 2.09 | 2.59 | — | 5 | 50.128 ms per file | — |
| sandbox.exec | 1 files · uncontended | 33 | 39.50 | 86.23 | 95.66 | 168.71 | 1.30× | 1.47× | 0.60 | 0.75 | — | 4.70 | 39.501 ms per file | — |
| sandbox.exec | 17–64 files · contended | 3 | 122.64 | 122.64 | 122.64 | 142.24 | 1.91× | 1.91× | 3.38 | 3.96 | — | 107 | 6.1318 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 3 | 69.52 | 69.52 | 69.52 | 74.08 | 1.01× | 1.01× | 0.39 | 0.54 | — | 103 | 3.476 ms per file | — |
| sandbox.exec | 2–4 files · contended | 24 | 55.87 | 78.65 | 80.72 | 93.54 | 1.47× | 1.27× | 2.52 | 3.15 | — | 11.80 | 19.495 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 39 | 47.27 | 77.01 | 84.73 | 86.34 | 1.44× | 1.46× | 2.04 | 2.55 | — | 9.80 | 18.9163 ms per file | — |
| sandbox.exec | 5–16 files · contended | 14 | 57.17 | 80.69 | 80.69 | 122.18 | 1.09× | 1.39× | 2.35 | 3.10 | — | 19.80 | 6.1996 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 18 | 58.72 | 98.05 | 98.05 | 149.37 | 1.12× | 1.36× | 2.69 | 3.49 | — | 19.80 | 8.4172 ms per file | — |
| sandbox.exec | — · contended | 12 | 2728.55 | 28164.07 | 28164.07 | 29443.60 | no baseline | no baseline | 2.37 | 3.02 | — | 30029.30 | — | — |
| sandbox.exec | — · uncontended | 27 | 149.89 | 10643.02 | 11389.12 | 36825.90 | 0.30× | 2.23× | -3.88 | -5.04 | — | 30029.30 | — | — |
| sandbox.mount | — · contended | 60 | 13.24 | 35.27 | 39.28 | 67.01 | 1.32× | 2.29× | 1.47 | 1.87 | 56 / 1,556 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 120 | 11.52 | 22.79 | 24.10 | 43.48 | 1.25× | 1.64× | 1.09 | 1.36 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 4.48 | 25.27 | 25.27 | 30.97 | no baseline | no baseline | -1.62 | -2.10 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 47 | 14.30 | 32.33 | 35.81 | 72.31 | 1.72× | 2.62× | 2.36 | 2.98 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 133 | 12.54 | 25.34 | 88.84 | 110.46 | 1.38× | 1.82× | 1.51 | 1.87 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 10 | 0.0 KiB | 531.2 KiB | 2,392 | ok 10 |
| branch.diff_commits | branch | 265 | 0.0 KiB | 14.4 MiB | 49,127 | ok 265 |
| branch.fork | branch | 23 | 0.0 KiB | 0.0 KiB | 0 | Forked 23 |
| branch.list_commits | project | 9 | 0.0 KiB | 84.3 KiB | 143 | ok 9 |
| branch.merge | branch | 8 | 0.0 KiB | 0.0 KiB | 0 | Merged 8 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 68 | 1.7 MiB | 0.0 KiB | 79 | Committed 68 |
| fs.diff_files | fs | 44 | 0.0 KiB | 410.0 KiB | 33 | Text 30, NoSuchPath 11, Equal 3 |
| fs.glob | fs | 53 | 0.0 KiB | 36.6 KiB | 625 | ok 53 |
| fs.grep | fs | 54 | 0.0 KiB | 158.8 KiB | 794 | ok 54 |
| fs.list | fs | 54 | 0.0 KiB | 107.2 KiB | 965 | ok 54 |
| fs.read | fs | 50 | 0.0 KiB | 137.6 KiB | 50 | ok 50 |
| fs.rm | fs | 75 | 0.0 KiB | 0.0 KiB | 75 | Committed 75 |
| fs.stat | fs | 51 | 0.0 KiB | 10.8 KiB | 51 | ok 51 |
| fs.write | fs | 767 | 10.5 MiB | 0.0 KiB | 767 | Committed 767 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 186 | 0.0 KiB | 0.0 KiB | 0 | Committed 150, UpToDate 35, Conflict 1 |
| sandbox.exec | sandbox | 519 | 1.9 MiB | 3.0 MiB | 0 | exit:0 516, exit:2 2, exit:1 1 |
| sandbox.mount | sandbox | 190 | 0.0 KiB | 0.0 KiB | 0 | Mounted 190 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 190 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 190 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 0.68 · end 1.23.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 3.491 | 3.649 · 3.489 · 2.808 · 3.491 · 4.503 | 1.5–1.5 | statements 15, vm_steps 1138, fullscan_steps 0, sorts 0, returned_rows 109 |
| read | 1.547 | 1.547 · 2.384 · 1.732 · 1.38 · 1.254 | 1.5–1.5 | statements 14, vm_steps 1108, fullscan_steps 0, sorts 0, returned_rows 108 |
| list_small | 1.413 | 1.318 · 2.084 · 1.627 · 1.413 · 1.308 | 1.5–1.5 | statements 14, vm_steps 1117, fullscan_steps 0, sorts 0, returned_rows 108 |
| list_largest | 7.229 | 7.806 · 7.055 · 7.677 · 7.229 · 7.025 | 1.5–1.5 | statements 103, vm_steps 14492, fullscan_steps 0, sorts 0, returned_rows 1483 |
| grep_scoped | 1.417 | 1.974 · 1.334 · 1.022 · 2.909 · 1.417 | 1.5–1.5 | statements 19, vm_steps 1263, fullscan_steps 0, sorts 0, returned_rows 117 |
| glob_scoped | 1.362 | 1.362 · 1.138 · 2.617 · 1.389 · 1.194 | 1.5–1.5 | statements 13, vm_steps 1096, fullscan_steps 0, sorts 0, returned_rows 107 |
| grep_tree | 3492.821 | 3759.95 · 3933.85 · 3466.068 · 3486.58 · 3492.821 | 1.36–1.46 | statements 33985, vm_steps 2739864, fullscan_steps 0, sorts 0, returned_rows 276988 |
| glob_tree | 9.647 | 12.927 · 9.647 · 9.355 · 10.219 · 9.492 | 1.36–1.36 | statements 208, vm_steps 20813, fullscan_steps 0, sorts 0, returned_rows 2163 |
| diff_files | 5.957 | 5.718 · 6.227 · 5.499 · 5.957 · 6.073 | 1.36–1.36 | statements 66, vm_steps 6532, fullscan_steps 0, sorts 0, returned_rows 648 |
| list_commits | 0.78 | 1.387 · 0.78 · 0.718 · 0.698 · 1.91 | 1.36–1.36 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.778 | 3.585 · 2.778 · 2.458 · 2.36 · 3.043 | 1.36–1.36 | statements 52, vm_steps 2261, fullscan_steps 0, sorts 0, returned_rows 244 |
| fork | 0.57 | 0.787 · 0.57 · 0.826 · 0.351 · 0.306 | 1.36–1.36 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 31.394 | 31.705 · 31.734 · 28.922 · 30.349 · 31.394 | 1.36–1.36 | statements 453, vm_steps 26637, fullscan_steps 4, sorts 8, returned_rows 1967 |
| oneshot_mount_unmount | 16.843 | 19.42 · 16.788 · 16.85 · 16.843 · 16.8 | 1.36–1.36 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 72.942 | 77.403 · 72.942 · 67.076 · 76.825 · 71.097 | 1.36–1.36 | statements 135, vm_steps 8327, fullscan_steps 80, sorts 2, returned_rows 758 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.36–1.36 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r017: 68,012 pages of 4,096 B, 0 free · Commits 15,941 · Branches 263 · Layers 21 · compression 4.01× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 58,250 | 328.9 MiB |
| 2 | 25,862 | 277.3 MiB |
| 3 | 11,892 | 1.7 MiB |
| 4 | 19 | 4.4 KiB |
| 5 | 11,836 | 1.2 MiB |
| 6 | 26,486 | 141.3 MiB |
| 7 | 40,391 | 9.1 MiB |
| 8 | 70 | 20.8 KiB |
| 9 | 23,758 | 34.3 MiB |
| 10 | 17,475 | 2.1 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,566 | 126.3 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 16,097 | 25.7 MiB |
| 1 | 26,839 | 173.5 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 54,369 | 212.4 MiB | 10.8 MiB |
| inode_value | 6,411 | 25.0 MiB | 615.3 KiB |
| object_location | 3,111 | 12.2 MiB | 1.3 MiB |
| binding_hint | 1,675 | 6.5 MiB | 630.6 KiB |
| commit | 1,222 | 4.8 MiB | 792.0 KiB |
| commit_runs | 342 | 1.3 MiB | 202.5 KiB |
| commit_lineage | 339 | 1.3 MiB | 143.1 KiB |
| commit_identity | 243 | 972.0 KiB | 97.4 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 11 | 44.0 KiB | 5.8 KiB |
| history_meta | 8 | 32.0 KiB | 2.6 KiB |
| sqlite_schema | 6 | 24.0 KiB | 8.0 KiB |
| branch_names | 5 | 20.0 KiB | 6.1 KiB |
| branch_identity | 4 | 16.0 KiB | 5.7 KiB |
| run_merges | 3 | 12.0 KiB | 7.8 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| reach | 1 | 4.0 KiB | 3.2 KiB |

### E. Stage times

**Time 317.2 s** (tooling): play 99.5 · consolidate 91.1 · verify 98.0 · probes 19.2 · tests 0.0 · seal + snapshot 3.5 · report 5.9

317.20 s tooling: prepare 1.99 · play 97.53 · consolidate 91.09 · verify 86.33 (diff_commits + full compareTree) · version walk 11.63 · probes 19.20 · metrics 1.03 · seal 1.42 · sealed figures 0.87 · snapshot copy 1.20 · report 0.27

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T14:13:20.633Z | optimize | Speed: branch.diff_commits >64 entries · uncontended: 17.82× baseline (no phase); Scaling: list_largest per entry of the largest directory: depth exponent 2.22; Counters: list_largest.statements per entry of the largest directory: depth exponent 1.188; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (10 classes too narrow); Reinstall growth: 8.427× the raw bytes of 55 changed packages; Range growth: 24.1 MiB; median not judged: 2 of 3 earlier ranges |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T14:39:11.985Z | watch | Speed: branch.diff_commits >64 entries · uncontended: 18.13× baseline (no phase); Scaling: fork: depth exponent 3.441; time-only trip (identical SQL counters at every point): watch, optimize only if it repeats at range 18; Counters: glob_tree.returned_rows per tree file: depth exponent 0.325; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (11 classes too narrow); Range growth: 24.2 MiB; median not judged: 2 of 3 earlier ranges; Snapshot time: 1141 ms for 236.7 MiB new; size exponent 0.552 |

### G. Evidence

- `~/lfs-history/metrics/range-017.a1.json`
- `~/lfs-history/metrics/range-017.a2.json`
- trace `~/lfs-history/runs/p3-main-g/trace/range-017.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-g/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-017.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r017-3-packages-bash | 636 | 187.2 KiB |
| r017-2-docs-rfc | 613 | 186.9 KiB |
| r017-1-root | 272 | 182.2 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 351.0 | 1,520 |
| `git diff --stat` | 39.0 | 1,513 |
| `git add -f` | 30.0 | — |
| `git rm --cached` | 7.0 | — |
| `git commit` | 37.0 | 1,515 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r017-1-root | end | P1 | pass | — | ✓ |
| r017-1-root | end | P2 | pass | exit 0 | ✓ |
| r017-1-root | end | P3 | n/a | an install, not a refresh | ✓ |
| r017-1-root | end | P4 | pass | 18 emitted files, exit 2 | ✓ |
| r017-1-root | end | P5 | n/a | no calibrated file | ✓ |
| r017-1-root | end | P6 | n/a | not a repair | ✓ |
| r017-2-docs-rfc | end | P1 | pass | — | ✓ |
| r017-2-docs-rfc | end | P2 | pass | exit 0 | ✓ |
| r017-2-docs-rfc | end | P3 | pass | 160 bookkeeping path(s) | ✓ |
| r017-2-docs-rfc | end | P4 | pass | 81 emitted files, exit 1 | ✓ |
| r017-2-docs-rfc | end | P5 | pass | 25 files | ✓ |
| r017-2-docs-rfc | end | P6 | n/a | not a repair | ✓ |
| r017-3-packages-bash | end | P1 | pass | — | ✓ |
| r017-3-packages-bash | end | P2 | pass | exit 0 | ✓ |
| r017-3-packages-bash | end | P3 | pass | 160 bookkeeping path(s) | ✓ |
| r017-3-packages-bash | end | P4 | pass | 143 emitted files, exit 2 | ✓ |
| r017-3-packages-bash | end | P5 | pass | 38 files | ✓ |
| r017-3-packages-bash | end | P6 | n/a | not a repair | ✓ |
| lead | repair | P1 | n/a | folded into P6 | ✓ |
| lead | repair | P2 | pass | exit 0 | ✓ |
| lead | repair | P3 | n/a | a repair, not a no-op | ✓ |
| lead | repair | P4 | n/a | folded into P6 | ✓ |
| lead | repair | P5 | pass | 30 files | ✓ |
| lead | repair | P6 | pass | P1 pass, P4 pass (274 emitted files, exit 0) | ✓ |

### J. Conflicts by path class

No conflicts by path recorded.
