# Range 017 · **optimize** · attempt 1

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · continued from r016 (live Store)
dsh `a2c53a885`..`cf872d002` · **60 commits** (7 mainline, 53 side) · 2026-07-06 → 2026-07-17
Areas changed: `/` 13% · `examples/acp-agent` 11% · `packages/support` 7% · other 69%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 16 pass, 0 stop, 0 NOT_RUN over 4 points) · **Content 0.21×** · **Churn 0.00**
**Time split:** play 92.6 s · git 89.6 s · Node 170.8 s · verify 82.2 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **436.3 MiB** (+2.6 MiB) | **269.5 MiB** (+25.8 MiB) live | **0.62×** (prev 0.56×) | **24.1 MiB** | **1,045** (total 15,811) | **290.0 s** tooling (total 19.4 min) |

**Checks:** 13 pass · 3 watch: Speed branch.diff_commits >64 entries · uncontended: 17.82× baseline (no phase); Contended work not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (10 classes too narrow); Range growth 24.1 MiB; median not judged: 2 of 3 earlier ranges · 3 optimize/stop: Scaling, Counters, Reinstall growth
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 8 merges: 0 (trips at 1)
**Moved most:** ▼ fs.read p95 −65% · ▼ probe stat −46% · ▼ fs.write p95 −45%
**Budget:** 18 of 202 ranges · projected total 16.1 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **246 changed paths match** (blob id and mode) via diff_commits; full tree at snapshots |
| History | 3 lanes merged, 1 publish |
| Steps | 2,033 / 2,033 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of its chain · **differs**: 0 missing, 0 extra, 1 differ · not byte-compared: 3 pnpm state file(s) · by target: 273 bin shims, 2723 links · output root ×0, verification age ×1 |
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
| lead | repair | `07b0aca5a949` | `null` | n/a | pass | n/a | n/a | pass | pass (95,351 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/examples/acp-demo/tests/acp-agent.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/agent-core.spec.ts` (fails natively) · `packages/examples/agent-spine-demo/tests/gen-config-catalog.spec.ts` (fails natively) · `packages/examples/stdio-demo/tests/stdio-agent.spec.ts` (fails natively) · `packages/compact/compact-basic/tests/compact-loop-repro.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/multi-subagent.spec.ts` (fails natively) · `packages/subagent/subagent-fork/tests/subagent-fork.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/structured.spec.ts` (fails natively) · `packages/subagent/subagent-inprocess/tests/subagent-inprocess.spec.ts` (fails natively) · `packages/subagent/subagent-spawn/tests/subagent-spawn.spec.ts` (fails natively) · `packages/todo/tool-todo/tests/integration.spec.ts` (fails natively) · `packages/core/tools/tests/gen-tool-catalog.spec.ts` (fails natively) · `packages/context/workspace-context/tests/workspace-context.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/bash-env.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/integration.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/bridge.spec.ts` (fails natively) · `packages/skill/skill-local/tests/skill-local.spec.ts` (fails natively) · `packages/ui/acp/tests/approval.spec.ts` (fails natively) · `packages/ui/acp/tests/bridge.spec.ts` (fails natively) · `packages/ui/acp/tests/config-options.spec.ts` (fails natively) · `packages/ui/acp/tests/dispose.spec.ts` (fails natively) · `packages/ui/acp/tests/edges.spec.ts` (fails natively) · `packages/ui/acp/tests/load.spec.ts` (fails natively) · `packages/ui/acp/tests/multi-session.spec.ts` (fails natively) · `packages/ui/acp/tests/turns.spec.ts` (fails natively) · `packages/web/tool-web/tests/spill.spec.ts` (fails natively) · `packages/workflow/workflow-workerthread/tests/integration.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage-context.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-prompt.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage-post-tool.spec.ts` (fails natively) · `packages/session-query/session-query/tests/tracing.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-jsonl/tests/jsonl.spec.ts` (fails natively) · `packages/support/acp-snapshot/tests/suite.spec.ts` (fails natively) · `packages/session-persistence/session-persistence-sqlite/tests/sqlite.spec.ts` (fails natively).

## 2. Activity

**2,627 calls** · **142 steps** by **8 agents + lead** on **3 Branches + main** · **189 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +145 added · 755 modified · −76 deleted · 11.8 MiB written · fs 897 : Sandbox 79 (**11 : 1**, reported only in P3)
**Execs:** 527 (JS 47 · shell 480) · 3 non-zero exits · install 0 · test runs 4 · version figures 10 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 1,216 | 910 | 306 | Committed 910 · Text 30 · NoSuchPath 11 · Equal 3 |
| sandbox | 1,095 | 713 | 4 | commit 186 (Committed 150, UpToDate 35, Conflict 1) · exec 527 (exit:0 524, exit:2 2, exit:1 1) · mount 189 (Mounted 189) · status 4 · unmount 189 (Unmounted 189) |
| branch | 306 | 31 | 275 | diff_branches 10 · diff_commits 265 · fork 22 (Forked 22) · merge 8 (Merged 8) · publish 1 (Added 1) |
| project | 9 | 0 | 9 | list_commits 9 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **2,627** | **1,654** | **595** |  |

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
| Commit Conflict | 1 / 1 | r017-3, a08 after a06 | 0.1 s |
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


**Execs by tool:** git 104 · pnpm 1 · tsc 4 · vitest 4 · other 414

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
| **lead repair** | 1 | — | 1 | — | — | 95,351 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r016) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 433.7 MiB (10.3 MiB / 396.5 MiB / 11.1 MiB / 15.8 MiB) | 436.3 MiB (10.7 MiB / 396.6 MiB / 11.7 MiB / 17.3 MiB) | +2.6 MiB |
| Version figures from | — | incremental (48,739 changed paths) | — |
| Files / directories / symlinks | 41,376 / 6,927 / 2,663 | 41,546 / 6,995 / 2,729 | +170 / +68 / +66 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, live: file + WAL) | 243.7 MiB | 269.5 MiB | +25.8 MiB |
| **Space amplification** (total · tracked) | 0.56× · tracked 3.26× | 0.62× · tracked 3.29× | 0.06 |
| Head cost / history cost | — | — (not at a snapshot) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **9.01** (0.45 / 0.09 / 0.57) | 4.77× the median range |
| **Stored per Commit** | 19.1 KiB | 25.3 KiB | — |
| Metadata share | 0.33 | 0.34 | this range 0.47 |
| History: Commits / Layers / Branches | 14,766 | 15,811 / 11 / 99 | +1,045 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.88 GiB (Commits 7.42 GiB · installs 1.08 GiB · build 118.1 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.49 GiB / 36% | — |
| Snapshot | — | none this range | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 173.3 MiB | 0.40 | +10.5 MiB |
| Metadata | 25.6 MiB | 0.06 | +2.2 MiB |
| Index rows + waste + other (live, not split) | 70.7 MiB | 0.16 | — |
| **Total = Store on disk** | **269.5 MiB** | **= 0.62** space amplification | +25.8 MiB |

Live: content and metadata from the Commits' traced sizes; the remainder is the file + WAL less them.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 10.7 MiB | 35.3 MiB (15.3 MiB + 20.0 MiB) | 3.29× | — | 1.7 MiB | 2.7 MiB | 0.63 |
| `node_modules` | 396.6 MiB | 106.4 MiB (103.3 MiB + 3.1 MiB) | 0.27× | — | 712.6 KiB | 18.6 MiB | 0.04 |
| Build output | 11.7 MiB | 3.5 MiB (3.4 MiB + 101.5 KiB) | 0.30× | — | 269.7 KiB | 1.9 MiB | 0.14 |
| `.git` | 17.3 MiB | 53.4 MiB (51.2 MiB + 2.2 MiB) | 3.09× | — | 10.0 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 70.7 MiB | — (not divided) | — | 13.2 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 277.3 KiB | — | — | — | — | — |
| **Total** | — | **269.5 MiB** | **= 0.62×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | — (at snapshots) | +2,982 | — | 38,264 (derived) | 55% |
| Chunks (large files) | — (at snapshots) | +663 | — | — | 9% |
| Large-file extents | — (at snapshots) | — | — | — | — |
| Directories | — (at snapshots) | 3,240 (with inodes, pooled) | — | — | 59% |
| Inodes and attributes | — (at snapshots) | ↑ pooled | — | — | — |
| Symlinks | — (at snapshots) | +2,735 | — | — | — |

Delta: 2.6% at depth cap · 31% of refused bases stopped by budget · `node_modules` reinstall: 8.427× the raw bytes of 55 changed packages

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.29× (35.3 MiB for 10.7 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.9 KiB / 2.4 KiB / 6.8 KiB over 219 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.21× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (982.3 KiB stored for 1.16 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.21 (3 lanes × 436.3 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 2.1 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 8.9 ms / 16.3 ms (1.33×) | 2.7 ms / 3.6 ms (1.53×) | 3.6 ms / 7.2 ms (1.74×) | 24.5 ms / 69.6 ms (1.51×) | 11.2 ms / 16.9 ms (1.19×) | 849 ms / 849 ms (1.67×) | — (native comparison in P3; exec 42.5 ms / 796 ms) |
| SQL p50: 151 stmts | 52 stmts | 59 stmts | 209 stmts | 48 stmts | 11,712 stmts | — |

**Commit cost:** 13.03 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 662 ms p50 over 189
**Slowest:** sandbox.exec 30748 ms · sandbox.exec 29859 ms · sandbox.exec 29329 ms · checkpoint diff_commits 1.47 ms and 17.10 statements per entry (48,577 entries per page)
**Scaling:** 6 of 15 probes flat · `list_small` 0.22 · `list_largest` 2.77 · `grep_scoped` 0.87 · `glob_scoped` 0.27 · `grep_tree` 0.78 · `glob_tree` 1.26 · `list_commits` 1.57 · `diff_commits` 1.21 · `fork` 3.46

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 238 ms / 238 ms | — / — | — | git / status-cold: — |
| git status (steady) | 332 ms / 390 ms | — / — | — | git / status-steady: — |
| git add | 29.0 ms / 83.0 ms | — / — | — | git / add: — |
| git commit (lane) | 36.0 ms / 65.0 ms | — / — | — | git / commit: — |
| lead writes main | 4425 ms / 4425 ms | — / — | — | — |
| repack | 2704 ms / 2704 ms | — / — | — | — |
| pnpm install (incremental) | 2458 ms / 2458 ms | 1192 ms / 1192 ms | 2.06× | pnpm-reinstall / cold: — |
| pnpm refresh | 2437 ms / 2437 ms | 1168 ms / 1168 ms | 2.09× | pnpm-reinstall / steady: — |
| tsc -b | 4097 ms / 4097 ms | 2868 ms / 2898 ms | 1.43× | tsc-b / cold: — |
| vitest | 3700 ms / 3700 ms | 2326 ms / 2326 ms | 1.59× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL 4.0 MiB (live)
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.7 ms / 19.4 ms

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


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 2033/2033; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 17.82× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | list_largest per entry of the largest directory: depth exponent 2.22 | < 0.15 | optimize |
| Counters | list_largest.statements per entry of the largest directory: depth exponent 1.188 | < 0.05 | optimize |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (10 classes too narrow) | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.471 | < 0.5 | pass |
| Reinstall growth | 8.427× the raw bytes of 55 changed packages | ≤ 2× changed packages; ≤ 1 MiB with none | optimize |
| Delta at cap | 0.0259 (budget 0.3117) | < 0.1 | pass |
| Range growth | 24.1 MiB; median not judged: 2 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | not applicable: no snapshot this range | < 0.15 | pass |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 0.96 | ≤ 1 (p3 budget) | pass |
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
| Workspaces (one-shot share) | 189 (0.99) | 74 (0.973) |
| Reads | 263 | 263 |
| Reconcile writes | 174 | 174 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 1). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 10 | 29.39 | 227.42 | 227.42 | 252.97 | 1.91× | 4.54× | 3.06 | 3.82 | 364 / 31,331 / 0 | — | 0.1209 ms per entrie | — |
| branch.diff_commits | 17–64 entries · contended | 1 | 18.46 | 18.46 | 18.46 | 18.46 | no baseline | no baseline | — | — | 226 / 14,345 / 0 | — | 0.3296 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 1 | 18.95 | 18.95 | 18.95 | 18.95 | no baseline | no baseline | — | — | 254 / 16,018 / 0 | — | 0.3446 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 258 | 309.48 | 372.04 | 409.67 | 565.74 | 17.82× | 14.52× | 15.53 | 19.94 | 3,666 / 562,399 / 0 | — | 1.6322 ms per entrie | — |
| branch.fork | — · uncontended | 6 | 0.65 | 1.37 | 1.37 | 1.80 | 0.94× | 1.00× | -3.36 | -4.42 | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 2 | 0.87 | 0.87 | 0.87 | 1.28 | no baseline | no baseline | 1.31 | 1.81 | 70 / 1,298 / 0 | — | 0.0433 ms per entrie | — |
| branch.merge | 5–16 entries · Merged · uncontended | 1 | 0.92 | 0.92 | 0.92 | 0.92 | no baseline | no baseline | — | — | 35 / 517 / 0 | — | 0.0615 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 2 | 849.03 | 849.03 | 849.03 | 1486.82 | 1.67× | 1.67× | -3.32 | -3.99 | 11,712 / 741,756 / 1,336 | — | 8.8441 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 2.56 | 2.56 | 2.56 | 2.56 | 0.93× | 0.93× | -2.08 | -2.49 | 40 / 902 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 31.48 | 31.48 | 31.48 | 31.48 | 1.65× | 1.65× | 0.49 | 0.79 | 178 / 16,896 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 1 | 9.24 | 9.24 | 9.24 | 9.24 | 1.06× | 0.78× | -0.64 | -0.56 | 112 / 4,162 / 0 | — | 0.0124 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 12 | 10.21 | 14.58 | 14.58 | 16.79 | 1.58× | 2.08× | 1.65 | 2.02 | 147 / 8,260 / 0 | — | 0.0123 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 1 | 21.25 | 21.25 | 21.25 | 21.25 | 2.39× | 1.63× | -1.14 | -1.58 | 441 / 81,577 / 8,191 | — | 0.002 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 4 | 10.29 | 11.89 | 11.89 | 13.11 | 1.53× | 1.28× | -1.10 | -1.55 | 164 / 7,737 / 0 | — | 0.0008 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 7 | 12.55 | 13.78 | 13.78 | 18.41 | 1.48× | 0.93× | 0.04 | 0.26 | 247 / 16,243 / 0 | — | 0.0028 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 30 | 10.10 | 15.21 | 15.62 | 17.06 | 1.43× | 1.55× | 1.64 | 2.01 | 150 / 8,346 / 0 | — | 0.0039 ms per byte | files.change |
| fs.diff_files | ≤1 KiB · contended | 4 | 7.61 | 7.68 | 7.68 | 9.25 | 1.36× | 1.23× | 2.20 | 2.82 | 171 / 8,854 / 0 | — | 0.0243 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 12 | 7.17 | 11.13 | 11.13 | 13.04 | 1.33× | 1.50× | 2.25 | 2.86 | 155 / 9,420 / 0 | — | 0.0332 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 13 | 7.98 | 12.12 | 12.12 | 12.76 | 1.20× | 1.69× | 2.06 | 2.60 | 140 / 9,039 / 0 | — | 0.0003 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 10 | 7.98 | 13.11 | 13.11 | 16.47 | 1.50× | 2.15× | 2.37 | 2.99 | 163 / 10,460 / 0 | — | 0.0032 ms per byte | sdk.read |
| fs.glob | 1 files · uncontended | 1 | 3.67 | 3.67 | 3.67 | 3.67 | 3.00× | 2.80× | 3.23 | 3.93 | 66 / 6,677 / 0 | — | 3.675 ms per file | — |
| fs.glob | 17–64 files · contended | 1 | 5.49 | 5.49 | 5.49 | 5.49 | 2.43× | 2.29× | 1.04 | 1.40 | 169 / 14,482 / 0 | — | 0.2616 ms per file | — |
| fs.glob | 17–64 files · uncontended | 4 | 6.13 | 7.33 | 7.33 | 11.16 | 3.17× | 2.80× | 0.85 | 1.08 | 107 / 12,416 / 0 | — | 0.2452 ms per file | — |
| fs.glob | 2–4 files · contended | 1 | 2.12 | 2.12 | 2.12 | 2.12 | 1.52× | 1.52× | — | — | 38 / 3,147 / 0 | — | 0.7057 ms per file | — |
| fs.glob | 2–4 files · uncontended | 8 | 2.19 | 2.56 | 2.56 | 2.90 | 1.45× | 1.29× | 0.32 | 0.43 | 33 / 3,241 / 0 | — | 0.838 ms per file | — |
| fs.glob | 5–16 files · contended | 5 | 2.77 | 4.33 | 4.33 | 4.85 | 2.14× | 3.06× | 1.49 | 2.12 | 70 / 6,196 / 0 | — | 0.5417 ms per file | — |
| fs.glob | 5–16 files · uncontended | 11 | 3.31 | 7.06 | 7.06 | 17.25 | 1.71× | 3.05× | 1.29 | 1.58 | 50 / 4,677 / 0 | — | 0.425 ms per file | — |
| fs.glob | >64 files · contended | 1 | 17.93 | 17.93 | 17.93 | 17.93 | 4.35× | 4.35× | 3.15 | 4.15 | 561 / 47,748 / 0 | — | 0.0216 ms per file | — |
| fs.glob | >64 files · uncontended | 11 | 8.34 | 16.20 | 16.20 | 16.56 | 1.59× | 2.12× | 1.80 | 2.48 | 102 / 13,331 / 0 | — | 0.0202 ms per file | — |
| fs.grep | 1 files · uncontended | 2 | 2.72 | 2.72 | 2.72 | 10.16 | 2.15× | 2.15× | 1.65 | 2.02 | 48 / 3,951 / 0 | — | 2.722 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 1 | 9.63 | 9.63 | 9.63 | 9.63 | 1.78× | 1.78× | 0.41 | 0.52 | 410 / 33,309 / 0 | — | 0.4586 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 8 | 15.54 | 18.73 | 18.73 | 20.41 | 4.31× | 4.32× | 2.43 | 3.04 | 320 / 18,255 / 0 | — | 0.4818 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 2 | 2.40 | 2.40 | 2.40 | 3.90 | 1.03× | 0.84× | -0.41 | -0.30 | 51 / 3,463 / 0 | — | 0.8007 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 9 | 3.87 | 4.42 | 4.42 | 5.45 | 2.04× | 1.28× | 1.67 | 2.08 | 61 / 3,943 / 0 | — | 1.3645 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 4 | 7.15 | 9.01 | 9.01 | 14.35 | 2.99× | 2.12× | 4.28 | 5.57 | 136 / 10,284 / 0 | — | 0.9332 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 10 | 5.76 | 9.62 | 9.62 | 9.66 | 1.83× | 2.80× | 0.80 | 0.93 | 100 / 5,863 / 0 | — | 0.823 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 1 | 24.06 | 24.06 | 24.06 | 24.06 | 1.57× | 1.57× | 0.28 | 0.50 | 563 / 22,562 / 0 | — | 0.097 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 34.02 | 42.85 | 42.85 | 43.86 | 2.96× | 2.72× | 1.00 | 1.32 | 618 / 26,619 / 0 | — | 0.03 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 1 | 2.41 | 2.41 | 2.41 | 2.41 | 1.36× | 1.36× | 2.41 | 3.23 | 51 / 2,994 / 0 | — | 2.41 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 2.06 | 2.06 | 2.06 | 2.06 | 1.22× | 1.22× | — | — | 44 / 2,897 / 0 | — | 2.058 ms per entrie | — |
| fs.list | 17–64 entries · contended | 2 | 4.84 | 4.84 | 4.84 | 7.24 | 2.70× | 2.32× | 2.53 | 3.24 | 105 / 11,435 / 0 | — | 0.1767 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 16 | 4.18 | 7.28 | 7.28 | 7.86 | 1.74× | 2.90× | 1.27 | 1.67 | 70 / 7,775 / 0 | — | 0.1705 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 6 | 1.78 | 2.76 | 2.76 | 3.21 | 0.99× | 1.17× | -0.67 | -0.81 | 39 / 3,147 / 0 | — | 0.854 ms per entrie | — |
| fs.list | 5–16 entries · contended | 1 | 3.06 | 3.06 | 3.06 | 3.06 | 1.56× | 1.24× | 2.84 | 3.67 | 58 / 5,699 / 0 | — | 0.4374 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 15 | 2.80 | 4.94 | 4.94 | 11.11 | 1.73× | 2.41× | 1.37 | 1.75 | 51 / 4,727 / 0 | — | 0.4007 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 3 | 1.97 | 1.97 | 1.97 | 2.79 | 1.65× | 1.65× | — | — | 34 / 3,986 / 0 | — | 0.005 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 1 | 3.30 | 3.30 | 3.30 | 3.30 | 1.46× | 1.46× | 0.57 | 0.61 | 52 / 3,559 / 0 | — | 0.0004 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 5 | 2.50 | 2.74 | 2.74 | 3.34 | 1.26× | 1.16× | 0.79 | 1.07 | 66 / 3,782 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 36 | 2.75 | 3.70 | 6.82 | 8.97 | 1.53× | 1.29× | 1.58 | 2.00 | 51 / 3,610 / 0 | — | 0.0011 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 14 | 14.74 | 19.57 | 19.57 | 22.23 | 1.84× | 1.46× | 0.14 | 0.06 | 361 / 25,940 / 0 | — | 14.739 ms per file | commit |
| fs.rm | 1 files · uncontended | 61 | 10.31 | 16.06 | 18.99 | 26.21 | 1.53× | 1.52× | 2.10 | 2.63 | 145 / 8,251 / 0 | — | 10.31 ms per file | files.change |
| fs.stat | ≤1 KiB · uncontended | 7 | 2.27 | 2.73 | 2.73 | 2.97 | 1.39× | 1.42× | 1.79 | 2.32 | 48 / 3,964 / 0 | — | 0.0042 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 1 | 3.47 | 3.47 | 3.47 | 3.47 | 2.02× | 1.83× | 2.51 | 3.28 | 86 / 4,824 / 0 | — | 0.0004 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 15 | 2.65 | 2.99 | 2.99 | 5.46 | 1.51× | 1.46× | 0.65 | 0.76 | 38 / 3,320 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 3 | 2.81 | 2.81 | 2.81 | 2.93 | 2.01× | 1.24× | 0.41 | 0.43 | 65 / 3,595 / 0 | — | 0.0014 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 17 | 2.26 | 4.76 | 4.76 | 5.62 | 1.51× | 2.18× | 1.22 | 1.51 | 43 / 3,249 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 13 | 9.45 | 20.56 | 20.56 | 36.75 | 1.29× | 1.52× | 1.69 | 2.33 | 256 / 14,812 / 0 | — | 0.0122 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 130 | 8.10 | 13.95 | 19.19 | 29.85 | 1.38× | 1.55× | 1.60 | 2.05 | 138 / 6,558 / 0 | — | 0.0099 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 2 | 10.16 | 10.16 | 10.16 | 11.27 | 0.92× | 0.68× | -0.43 | -0.46 | 154 / 5,150 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 13 | 9.93 | 12.91 | 12.91 | 15.76 | 1.07× | 1.36× | 0.12 | 0.14 | 156 / 6,120 / 0 | — | 0 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 41 | 11.80 | 21.38 | 22.48 | 23.38 | 1.27× | 1.34× | 1.14 | 1.51 | 253 / 12,976 / 0 | — | 0.0007 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 235 | 9.04 | 14.60 | 20.27 | 25.52 | 1.29× | 1.49× | 1.08 | 1.38 | 155 / 7,396 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 67 | 11.46 | 18.95 | 29.26 | 55.98 | 1.34× | 1.15× | 1.80 | 2.41 | 276 / 14,395 / 0 | — | 0.0048 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 266 | 8.40 | 13.76 | 20.07 | 25.79 | 1.33× | 1.34× | 1.51 | 1.93 | 148 / 6,705 / 0 | — | 0.0032 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.96 | 0.96 | 0.96 | 0.96 | 1.64× | 1.64× | 1.27 | 1.50 | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 31 | 29.49 | 53.14 | 54.21 | 134.23 | 1.30× | 1.26× | -0.91 | -1.09 | 273 / 24,721 / 0 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 67 | 34.58 | 63.34 | 71.86 | 208.30 | 1.51× | 1.62× | 0.90 | 1.07 | 351 / 32,734 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 9 | 3.77 | 5.14 | 5.14 | 5.31 | 1.16× | 1.23× | 0.62 | 0.82 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 26 | 4.30 | 6.38 | 6.95 | 7.33 | 1.29× | 1.37× | 1.23 | 1.55 | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 10 | 11.68 | 36.37 | 36.37 | 74.69 | 1.35× | 2.13× | 1.64 | 2.20 | 123 / 4,092 / 0 | — | 11.684 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 10 | 9.51 | 12.52 | 12.52 | 34.93 | 1.25× | 1.20× | 0.64 | 0.81 | 117 / 4,842 / 0 | — | 9.513 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 417.33 | 417.33 | 417.33 | 417.33 | 8.30× | 8.30× | -0.33 | -0.60 | 10,316 / 520,869 / 8,191 | — | 417.333 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 4 | 15.20 | 22.10 | 22.10 | 31.37 | 0.99× | 1.05× | -0.15 | -0.24 | 180 / 8,578 / 0 | — | 7.368 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 10.91 | 15.57 | 15.57 | 16.57 | 1.10× | 1.39× | -0.94 | -1.13 | 133 / 4,868 / 0 | — | 4.1428 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · contended | 1 | 28.87 | 28.87 | 28.87 | 28.87 | 1.93× | 1.93× | — | — | 317 / 18,272 / 0 | — | 3.2076 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 27.59 | 27.59 | 27.59 | 28.40 | 2.44× | 2.44× | 1.12 | 1.18 | 300 / 19,955 / 0 | — | 2.759 ms per file | commit |
| sandbox.commit | — · Committed · contended | 3 | 87.98 | 87.98 | 87.98 | 138.17 | no baseline | no baseline | -14.05 | -18.18 | 800 / 65,105 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 8 | 65.86 | 291.33 | 291.33 | 12411.24 | 0.95× | 4.22× | 1.36 | 1.78 | 497 / 38,163 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 179 | 474.94 | 777.35 | 1733.92 | 1913.55 | 11.72× | 2.24× | 9.82 | 11.82 | — | 2,233 | — | — |
| sandbox.exec | 0 files · uncontended | 132 | 36.67 | 282.56 | 1294.17 | 7125.86 | 1.35× | 1.10× | 0.18 | 0.20 | — | 2,240 | — | — |
| sandbox.exec | 1 files · contended | 38 | 37.29 | 56.70 | 60.97 | 64.10 | 1.19× | 0.96× | 0.87 | 1.12 | — | 4.70 | 37.293 ms per file | — |
| sandbox.exec | 1 files · uncontended | 30 | 40.26 | 49.41 | 52.80 | 55.40 | 1.32× | 0.84× | 0.68 | 0.85 | — | 4.70 | 40.26 ms per file | — |
| sandbox.exec | 17–64 files · contended | 2 | 79.73 | 79.73 | 79.73 | 79.78 | 1.24× | 1.24× | 1.61 | 1.83 | — | 106 | 3.9864 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 4 | 79.28 | 81.94 | 81.94 | 97.15 | 1.16× | 1.19× | 0.93 | 1.19 | — | 103 | 3.9641 ms per file | — |
| sandbox.exec | 2–4 files · contended | 25 | 48.59 | 74.22 | 76.58 | 78.47 | 1.28× | 1.19× | 1.94 | 2.46 | 0 / 0 / 0 | 11.30 | 15.9623 ms per file | observe.after |
| sandbox.exec | 2–4 files · uncontended | 38 | 46.08 | 65.46 | 65.83 | 67.72 | 1.40× | 1.24× | 1.93 | 2.43 | — | 8.30 | 18.03 ms per file | — |
| sandbox.exec | 5–16 files · contended | 18 | 42.00 | 80.22 | 80.22 | 84.76 | 0.80× | 1.38× | 1.08 | 1.58 | — | 19.80 | 6.5767 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 14 | 57.81 | 83.47 | 83.47 | 88.28 | 1.10× | 1.16× | 2.62 | 3.41 | — | 19.80 | 6.3187 ms per file | — |
| sandbox.exec | — · contended | 12 | 2453.16 | 29328.97 | 29328.97 | 29859.01 | no baseline | no baseline | 1.93 | 2.50 | — | 28026.90 | — | — |
| sandbox.exec | — · uncontended | 25 | 196.15 | 11649.75 | 15991.84 | 30748.38 | 0.39× | 2.45× | -2.77 | -3.71 | — | 30042.80 | — | — |
| sandbox.mount | — · contended | 65 | 11.47 | 16.96 | 22.88 | 35.73 | 1.14× | 1.10× | 0.88 | 1.16 | 54 / 1,556 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 114 | 10.89 | 15.58 | 18.23 | 20.38 | 1.19× | 1.12× | 0.86 | 1.08 | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 4 | 3.83 | 3.84 | 3.84 | 44.13 | no baseline | no baseline | -2.26 | -2.87 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 52 | 11.52 | 19.34 | 23.05 | 120.78 | 1.38× | 1.57× | 1.47 | 1.91 | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 127 | 12.49 | 19.42 | 81.61 | 96.72 | 1.37× | 1.40× | 1.50 | 1.85 | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 10 | 0.0 KiB | 531.2 KiB | 2,392 | ok 10 |
| branch.diff_commits | branch | 265 | 0.0 KiB | 14.4 MiB | 49,127 | ok 265 |
| branch.fork | branch | 22 | 0.0 KiB | 0.0 KiB | 0 | Forked 22 |
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
| sandbox.exec | sandbox | 527 | 2.2 MiB | 2.7 MiB | 0 | exit:0 524, exit:2 2, exit:1 1 |
| sandbox.mount | sandbox | 189 | 0.0 KiB | 0.0 KiB | 0 | Mounted 189 |
| sandbox.status | sandbox | 4 | 0.0 KiB | 0.0 KiB | 0 | ok 4 |
| sandbox.unmount | sandbox | 189 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 189 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 1.97 · end 1.35.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 1.279 | 2.56 · 1.456 · 1.261 · 0.992 · 1.279 | 1.35–1.35 | statements 15, vm_steps 1138, fullscan_steps 0, sorts 0, returned_rows 109 |
| read | 1.473 | 1.795 · 1.349 · 1.319 · 2.375 · 1.473 | 1.35–1.35 | statements 14, vm_steps 1108, fullscan_steps 0, sorts 0, returned_rows 108 |
| list_small | 1.536 | 1.536 · 1.484 · 1.28 · 1.699 · 2.002 | 1.35–1.35 | statements 14, vm_steps 1117, fullscan_steps 0, sorts 0, returned_rows 108 |
| list_largest | 8.058 | 8.871 · 8.206 · 8.058 · 7.679 · 6.85 | 1.35–1.35 | statements 103, vm_steps 14484, fullscan_steps 0, sorts 0, returned_rows 1483 |
| grep_scoped | 1.703 | 2.026 · 1.355 · 1.689 · 2.431 · 1.703 | 1.35–1.35 | statements 19, vm_steps 1263, fullscan_steps 0, sorts 0, returned_rows 117 |
| glob_scoped | 1.482 | 1.219 · 1.475 · 2.032 · 1.779 · 1.482 | 1.35–1.35 | statements 13, vm_steps 1096, fullscan_steps 0, sorts 0, returned_rows 107 |
| grep_tree | 3354.232 | 3396.513 · 3447.544 · 3330.921 · 3247.814 · 3354.232 | 1.32–1.45 | statements 33977, vm_steps 2732160, fullscan_steps 0, sorts 0, returned_rows 275978 |
| glob_tree | 9.769 | 10.951 · 10.54 · 9.769 · 9.123 · 9.269 | 1.42–1.42 | statements 211, vm_steps 21056, fullscan_steps 0, sorts 0, returned_rows 2184 |
| diff_files | 5.626 | 4.647 · 5.626 · 6.416 · 6.168 · 5.573 | 1.42–1.42 | statements 66, vm_steps 6532, fullscan_steps 0, sorts 0, returned_rows 648 |
| list_commits | 1.304 | 2.034 · 1.142 · 1.304 · 1.149 · 1.483 | 1.42–1.42 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.774 | 3.179 · 2.35 · 2.019 · 2.774 · 3.004 | 1.42–1.42 | statements 52, vm_steps 2261, fullscan_steps 0, sorts 0, returned_rows 244 |
| fork | 0.573 | 0.573 · 0.486 · 0.518 · 0.638 · 0.826 | 1.42–1.42 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 30.224 | 31.454 · 30.645 · 27.501 · 26.384 · 30.224 | 1.42–1.42 | statements 453, vm_steps 26637, fullscan_steps 4, sorts 8, returned_rows 1967 |
| oneshot_mount_unmount | 17.791 | 17.782 · 18.29 · 17.615 · 17.791 · 19.163 | 1.42–1.42 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 74.109 | 76.192 · 75.688 · 68.039 · 74.109 · 67.702 | 1.42–1.42 | statements 135, vm_steps 8327, fullscan_steps 80, sorts 2, returned_rows 758 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.42–1.42 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

No snapshot this range: the sealed file's figures are read at snapshots.

### E. Stage times

**Time 290.0 s** (tooling): play 94.2 · consolidate 82.4 · verify 90.3 · probes 17.8 · tests 0.0 · seal + snapshot 0.0 · report 5.3

289.99 s tooling: prepare 1.62 · play 92.61 · consolidate 82.42 · verify 82.21 (diff_commits) · version walk 8.08 · probes 17.81 · metrics 0.93 · Store allocation 0.23 · report 0.22

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T14:13:20.633Z | optimize | Speed: branch.diff_commits >64 entries · uncontended: 17.82× baseline (no phase); Scaling: list_largest per entry of the largest directory: depth exponent 2.22; Counters: list_largest.statements per entry of the largest directory: depth exponent 1.188; Contended work: not judged: no contended class has 3 ranges of 5+ calls over a tree that grew 1.5× (10 classes too narrow); Reinstall growth: 8.427× the raw bytes of 55 changed packages; Range growth: 24.1 MiB; median not judged: 2 of 3 earlier ranges |

### G. Evidence

- `~/lfs-history/metrics/range-017.a1.json`
- trace `~/lfs-history/runs/p3-main-f/trace/range-017.a1.jsonl` · runner log `~/lfs-history/runs/p3-main-f/play.log`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r017-3-packages-bash | 636 | 187.2 KiB |
| r017-2-docs-rfc | 613 | 186.9 KiB |
| r017-1-root | 272 | 182.2 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 332.0 | 1,520 |
| `git diff --stat` | 36.0 | 1,513 |
| `git add -f` | 29.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 36.0 | 1,515 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r017-1-root | end | P1 | pass | — | — |
| r017-1-root | end | P2 | pass | exit 0 | — |
| r017-1-root | end | P3 | n/a | an install, not a refresh | — |
| r017-1-root | end | P4 | pass | 18 emitted files, exit 2 | — |
| r017-1-root | end | P5 | n/a | no calibrated file | — |
| r017-1-root | end | P6 | n/a | not a repair | — |
| r017-2-docs-rfc | end | P1 | pass | — | — |
| r017-2-docs-rfc | end | P2 | pass | exit 0 | — |
| r017-2-docs-rfc | end | P3 | pass | 160 bookkeeping path(s) | — |
| r017-2-docs-rfc | end | P4 | pass | 81 emitted files, exit 1 | — |
| r017-2-docs-rfc | end | P5 | pass | 25 files | — |
| r017-2-docs-rfc | end | P6 | n/a | not a repair | — |
| r017-3-packages-bash | end | P1 | pass | — | ✓ |
| r017-3-packages-bash | end | P2 | pass | exit 0 | ✓ |
| r017-3-packages-bash | end | P3 | pass | 160 bookkeeping path(s) | ✓ |
| r017-3-packages-bash | end | P4 | pass | 143 emitted files, exit 2 | ✓ |
| r017-3-packages-bash | end | P5 | pass | 38 files | ✓ |
| r017-3-packages-bash | end | P6 | n/a | not a repair | ✓ |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | pass | exit 0 | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (274 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
