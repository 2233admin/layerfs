# Range 016 · **stop** · attempt 2

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r015 (run p3-main-d)
dsh `8e6ad0a34`..`44e126e30` · **88 commits** (10 mainline, 78 side) · 2026-07-15 → 2026-07-17
Areas changed: `packages/core` 11% · `examples/acp-agent` 10% · `docs/rfc` 10% · other 69%
**Phase P3** · **Git ✓** · **Node ✗** (P1–P6: 20 pass, 1 stop, 0 NOT_RUN over 5 points) · **Content 0.22×** · **Churn 0.00**
**Time split:** play 103.5 s · git 163.9 s · Node 204.3 s · verify 81.3 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **433.7 MiB** (+11.9 MiB) | **243.9 MiB** (+36.1 MiB) | **0.56×** (prev 0.49×) | **40.0 MiB** | **1,915** (total 14,766) | **323.1 s** tooling (total 14.7 min) |

**Checks:** 12 pass · 6 watch: Speed branch.diff_commits >64 entries · uncontended: 16.98× baseline (no phase); Scaling insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 40.0 MiB; median not judged: 1 of 3 earlier ranges; Snapshot time 973 ms for 220.9 MiB new; size exponent not judged (2 snapshots) · 1 optimize/stop: Node proofs
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ branch.diff_commits p95 +1004% · ▲ fs.write p95 +140% · ▲ sandbox.mount p95 +82%
**Budget:** 17 of 202 ranges · projected total 16.2 h (budget 16.8 h) · disk 36% of budget at range 202

## 1. Correctness

| Check | Result |
| --- | --- |
| Tree vs git | **1,497 tracked files match** (blob id and mode) |
| History | 4 lanes merged, 1 publish |
| Steps | 3,664 / 3,664 outcomes as planned |
| Conflicts | **3 / 3 planned hit · 0 unplanned** |
| Unit tests | **30 / 30 equal to native** |
| Installed tree | against the native replay of its chain · **1543 package groups equal to native** · not byte-compared: 3 pnpm state file(s) · by target: 265 bin shims, 2657 links · output root ×2, verification age ×1 |
| Last-writer-wins (`/.lww`) | unchanged (30 lines from 1 .gitignore files) · **255 picks** in 4 merges (253 under node_modules) · re-installed after the merge |
| Ignored files | — (installs not played in P3) |
| Milestone | — |
| Git | **HEAD = checkpoint `44e126e30`** · 188 commits written for 188 dsh commits · status clean · fresh mount read back 0 · lane guard 0 · git clean 116 untracked, unignored (464,352 B) |
| Install inputs (NODE_RULE §3; reported, not gated) | not recorded |
| Conflicts by path class | Tracked 0 · Install outputs 253 · Build outputs 2 · `.git` 0 |

### Node and git proofs

Each proof runs the same command natively on the identical tree id (NODE_RULE §6); a proof not run is `NOT_RUN`, never pass.

| Lane | Point | Tree | Install inputs | P1 | P2 | P3 | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r016-1-root | end | `a0363da76b00` | `d4496ce97c22` | pass (275 normalized) | pass | n/a | pass | pass | n/a |
| r016-2-packages-sdk | end | `7d07cd9331b0` | `52827109d292` | pass (255 normalized) | pass | pass | pass | pass | n/a |
| r016-4-docs-rfc | end | `67f6d8b35f44` | `52827109d292` | pass (255 normalized) | pass | pass | pass | n/a | n/a |
| r016-3-packages-prompt | end | `361916e81b61` | `52827109d292` | pass (255 normalized) | pass | pass | pass | pass | n/a |
| lead | repair | `3c4cbcb779fc` | `null` | n/a | stop | n/a | n/a | pass | pass (95,623 rewritten) |

P5 skip list (failing natively, set at calibration): `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/context/time-context/tests/time-context.spec.ts` (fails natively) · `packages/ui/acp-agent/tests/acp-agent.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/plugin-apply.spec.ts` (fails natively) · `packages/ui/jsonrpc/tests/server.spec.ts` (fails natively) · `packages/ui/stdio-agent/tests/stdio-agent.spec.ts` (fails natively) · `packages/cordis/tool-cordis/tests/cordis-lifecycle.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/integration.spec.ts` (fails natively) · `packages/bash/tool-bash/tests/tools.spec.ts` (fails natively) · `packages/subagent/tool-subagent/tests/tool-subagent.spec.ts` (fails natively) · `packages/bash/bash-local/tests/run.spec.ts` (fails natively) · `packages/subagent/subagent/tests/service.spec.ts` (fails natively) · `packages/guard/repeat-tool-guard/tests/repeat-tool-guard.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/bridge.spec.ts` (fails natively) · `packages/fs/tool-fs/tests/tools.spec.ts` (fails natively) · `packages/support/invariants/tests/invariants.spec.ts` (fails natively) · `packages/bash/bash-local/tests/executor.spec.ts` (fails natively) · `packages/hooks/hooks-claude/tests/coverage.spec.ts` (fails natively) · `packages/hooks/hooks-codex/tests/coverage.spec.ts` (fails natively) · `packages/bash/bash-sandbox/tests/sandbox.spec.ts` (fails natively) · `packages/subagent/subagent-acp/tests/subagent-acp.spec.ts` (fails natively).

## 2. Activity

**4,424 calls** · **266 steps** by **10 agents + lead** on **4 Branches + main** · **339 Workspaces** (99% one-shot, 0 open at end)
**File changes:** +336 added · 1,313 modified · −171 deleted · 18.0 MiB written · fs 1,659 : Sandbox 161 (**10 : 1**, reported only in P3)
**Execs:** 910 (JS 94 · shell 816) · 4 non-zero exits · install 0 · test runs 4 · version figures 1 (tooling)

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |
| --- | --- | --- | --- | --- |
| fs | 2,162 | 1,672 | 490 | Committed 1,672 · Text 58 · NoSuchPath 22 · Equal 2 |
| sandbox | 1,930 | 1,247 | 5 | commit 337 (Committed 257, UpToDate 79, Conflict 1) · exec 910 (exit:0 906, exit:2 3, exit:1 1) · mount 339 (Mounted 339) · status 5 · unmount 339 (Unmounted 339) |
| branch | 321 | 34 | 287 | diff_branches 17 · diff_commits 270 · fork 24 (Forked 24) · merge 9 (Merged 9) · publish 1 (Added 1) |
| project | 10 | 0 | 10 | list_commits 10 |
| operator | 1 | 0 | 1 | store.stats 1 |
| **Total** | **4,424** | **2,953** | **793** |  |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |
| --- | --- | --- | --- | --- | --- |
| r016-1-root | a01 a02 | 40 | 614 | ✓ | — |
| r016-2-packages-sdk | a03 a04 a05 | 71 | 338 | ✓ | — |
| r016-3-packages-prompt | a06 a07 | 73 | 387 | ✓ | — |
| r016-4-docs-rfc | a08 a09 a10 | 75 | 381 | ✓ | — |
| main | lead | 7 | 195 | — | ✓ |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |
| --- | --- | --- | --- |
| Commit Conflict | 1 / 1 | r016-1, a01 after a02 | 0.2 s |
| Stale clean merge | 1 / 1 | r016-1, a01 a02 | merged cleanly |
| Decoy edit | 1 / 1 | r016-1, a01 a02 | replaced before the checkpoint |
| Merge / publish race | 0 / 0 | — | — |
| **Unplanned** | **0** | — | — |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01 | r016-1 | 15 | 6 | 9 | 0 | 0 | 201 | commit-conflict, stale-clean-merge, decoy |
| a02 | r016-1 | 25 | 14 | 11 | 0 | 0 | 413 | commit-conflict, stale-clean-merge, decoy |
| a03 | r016-2 | 21 | 8 | 13 | 0 | 0 | 46 | — |
| a04 | r016-2 | 16 | 7 | 9 | 0 | 0 | 193 | — |
| a05 | r016-2 | 34 | 16 | 18 | 0 | 0 | 99 | — |
| a06 | r016-3 | 27 | 12 | 15 | 0 | 0 | 160 | — |
| a07 | r016-3 | 46 | 19 | 27 | 0 | 0 | 227 | — |
| a08 | r016-4 | 13 | 4 | 9 | 0 | 0 | 99 | — |
| a09 | r016-4 | 25 | 11 | 14 | 0 | 0 | 97 | — |
| a10 | r016-4 | 37 | 19 | 18 | 0 | 0 | 185 | — |
| lead | main | 7 | 1 | 0 | 6 | 0 | 195 | — |
| **Total** |  | **266** | **117** | **143** | **6** | **0** | **1,915** | **3** |

Scale-probe Commits (setup and samples): **22**, not range work and not counted above.


**Execs by tool:** git 185 · pnpm 1 · tsc 5 · vitest 4 · other 715

| Lane | git status | git diff | git add | git rm --cached | Lane commits | Loose objects |
| --- | --- | --- | --- | --- | --- | --- |
| r016-2-packages-sdk | 52 | 52 | 52 | 2 | 52 | 697 |
| r016-3-packages-prompt | 47 | 47 | 46 | 2 | 47 | 817 |
| r016-1-root | 25 | 25 | 25 | 9 | 25 | 408 |
| r016-4-docs-rfc | 53 | 53 | 53 | 4 | 53 | 846 |
| **lead** | — | — | — | — | 188 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r016-1-root | 1 | 0 | 1 | 1 | 5 | 5 / 5 |
| r016-2-packages-sdk | 0 | 1 | 1 | 1 | 22 | 22 / 22 |
| r016-4-docs-rfc | 0 | 1 | 1 | 0 | 0 | — / — |
| r016-3-packages-prompt | 0 | 1 | 1 | 1 | 21 | 21 / 21 |
| **lead repair** | 1 | — | 1 | — | — | 95,623 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r015) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 421.8 MiB (9.3 MiB / 390.9 MiB / 8.3 MiB / 13.3 MiB) | 433.7 MiB (10.3 MiB / 396.5 MiB / 11.1 MiB / 15.8 MiB) | +11.9 MiB |
| Version figures from | — | full: first (no manifest for range 15) | — |
| Files / directories / symlinks | 40,504 / 6,733 / 2,569 | 41,376 / 6,927 / 2,663 | +872 / +194 / +94 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 207.8 MiB | 243.9 MiB | +36.1 MiB |
| **Space amplification** (total · tracked) | 0.49× · tracked 3.26× | 0.56× · tracked 3.26× | 0.07 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **9.29** (0.64 / 0.12 / 0.41) | 5.33× the median range |
| **Stored per Commit** | 60.3 KiB | 19.2 KiB | — |
| Metadata share | 0.31 | 0.33 | this range 0.41 |
| History: Commits / Layers / Branches | 12,851 | 14,766 / 10 / 69 | +1,915 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.19 GiB (Commits 6.73 GiB · installs 1.10 GiB · build 118.7 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.70 GiB / 36% | — |
| Snapshot | — | r016, 220.9 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 162.9 MiB | 0.38 | +19.6 MiB |
| Metadata | 23.4 MiB | 0.05 | +3.8 MiB |
| Index rows | 41.2 MiB | 0.10 | +10.7 MiB |
| Waste | 16.1 MiB | 0.04 | +1.9 MiB |
| Other | 308.0 KiB | 0.00 | +48.0 KiB |
| **Total = Store on disk** | **243.9 MiB** | **= 0.56** space amplification | +36.1 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 10.3 MiB | 33.6 MiB (14.6 MiB + 19.0 MiB) | 3.26× | — | 3.2 MiB | 4.3 MiB | 0.75 |
| `node_modules` | 396.5 MiB | 105.7 MiB (103.3 MiB + 2.4 MiB) | 0.27× | — | 2.1 MiB | 24.3 MiB | 0.09 |
| Build output | 11.1 MiB | 3.2 MiB (3.1 MiB + 77.8 KiB) | 0.29× | — | 1.0 MiB | 2.1 MiB | 0.49 |
| `.git` | 15.8 MiB | 43.5 MiB (41.8 MiB + 1.7 MiB) | 2.75× | — | 16.8 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 57.6 MiB | — (not divided) | — | 12.7 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 275.7 KiB | — | — | — | — | — |
| **Total** | — | **243.9 MiB** | **= 0.56×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 55,371 | +6,311 | 5.8 KiB | 37,684 (derived) | 50% |
| Chunks (large files) | 25,186 | +1,195 | 10.8 KiB | — | 9% |
| Large-file extents | 11,793 | — | 0.1 KiB | — | — |
| Directories | 31,294 | 5,663 (with inodes, pooled) | 0.2 KiB | — | 67% |
| Inodes and attributes | 85,539 | ↑ pooled | 1.9 KiB | — | — |
| Symlinks | 1,552 | +2,843 | 0.1 KiB | — | — |

Delta: 2.3% at depth cap · 30% of refused bases stopped by budget · `node_modules` reinstall: 0.107× the raw bytes of 101 changed packages

**3e. Git and Node (P3)**

| Measure | Value |
| --- | --- |
| Tracked only (amplification of the tracked source; comparable with ranges 0–14) | 3.26× (33.6 MiB for 10.3 MiB) |
| Store growth per git commit (index / loose objects / pack) | 0.5 KiB / 3.6 KiB / 7.0 KiB over 365 git commits |
| **Content ratio** (stored content ÷ distinct new content; ≤1.x, watch > 2×, act > 5×) | 0.22× |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | 0.00 (3.1 MiB stored for 1.55 GiB rewritten) |
| Native-disk equivalence (stored ÷ lanes × one native checkout) | 0.14 (4 lanes × 433.7 MiB) |
| Metadata per file / per Commit (budget from the dev range) | 0.1 KiB / 1.9 KiB (budget not set) |

## 4. Speed

Daemon `44ac6c91abf6` · p50 / p95 · ratio to baseline (dominant size class) in brackets

| write | read | list | Commit (one-shot) | mount | merge | exec (FUSE ÷ native) |
| --- | --- | --- | --- | --- | --- | --- |
| 9.7 ms / 30.5 ms (1.31×) | 2.6 ms / 4.3 ms (1.41×) | 3.2 ms / 7.1 ms (1.72×) | 22.9 ms / 69.5 ms (1.34×) | 11.4 ms / 25.5 ms (1.20×) | 1270 ms / 1682 ms (3.31×) | — (native comparison in P3; exec 44.6 ms / 854 ms) |
| SQL p50: 174 stmts | 54 stmts | 64 stmts | 213 stmts | 49 stmts | 31,601 stmts | — |

**Commit cost:** 9.67 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 612 ms p50 over 339
**Slowest:** sandbox.exec 31874 ms · sandbox.exec 31614 ms · sandbox.exec 30586 ms · checkpoint diff_commits 1.40 ms and 16.58 statements per entry (49,205 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 288 ms / 288 ms | — / — | — | git / status-cold: — |
| git status (steady) | 300 ms / 517 ms | — / — | — | git / status-steady: — |
| git add | 26.0 ms / 130 ms | — / — | — | git / add: — |
| git commit (lane) | 36.0 ms / 97.0 ms | — / — | — | git / commit: — |
| lead writes main | 5418 ms / 5418 ms | — / — | — | — |
| repack | 4136 ms / 4136 ms | — / — | — | — |
| pnpm install (incremental) | 3152 ms / 3152 ms | 1103 ms / 1103 ms | 2.86× | pnpm-reinstall / cold: — |
| pnpm refresh | 2487 ms / 2487 ms | 1083 ms / 1083 ms | 2.30× | pnpm-reinstall / steady: — |
| tsc -b | 3033 ms / 3667 ms | 2796 ms / 2859 ms | 1.08× | tsc-b / cold: — |
| vitest | 3784 ms / 3784 ms | 2154 ms / 2154 ms | 1.76× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 11.3 ms / 31.4 ms

## 5. Findings and action

### Finding 016.a1 · stop

**1. Trigger** (attempt 1, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Correctness | tree 0 missing, 0 extra, 0 content, 0 mode; steps 3645/3646; conflicts 3/3; tests 0/0 equal to native | all |
| Git | git status not clean at the checkpoint | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard |

Diagnosis pending: `finding-016.a1.json`.

### Finding 016.a2 · stop

**1. Trigger** (attempt 2, daemon `44ac6c91abf6`)

| Check | Value | Threshold |
| --- | --- | --- |
| Node proofs | 20 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P2 | P1–P6 pass at every point |

Diagnosis pending: `finding-016.a2.json`.

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

- **a2 (`p3-main-e`, harness `13df9bf31a`, same binaries): STOP on one proof, `lead.repair` P2, caused by a judge bug in the harness, not by LayerFS.** Checkpoint ok, git ✓; 20 of 21 proofs pass, including the repair's P6 (95,623 rewritten files, 385 emitted, exit 0). pnpm's warning `Failed to create bin … dsh-jsonrpc-agent` names the install's folder on both sides. `judgeP2` stripped native's final folder: the build's `/workspaces/4`, where the chain's tail moved after the install at `/workspaces/3`. Range 15's repair output had no absolute path, so the bug was hidden. Fix: `nodeproof.mjs` records the install's folder (`installRoot`), and P2 strips that. Tested in tests/p3.mjs. With the fix, a2's recorded output against its cached native oracle (`ac2f7f4a…`) judges pass, offline; a2's recorded outcome is unchanged, and a3 plays again.
- **Decision B worked as designed.** The lead's `git clean -f` removed 116 untracked, unignored files (464,352 B), none tracked or ignored, none left. The native repair chain removed the same 116. Fresh status was clean, with 0 read back.
- **Verify 81.3 s against range 15's 9.1 s; Speed `branch.diff_commits >64 entries · uncontended` 16.98× (watch, first relink-on-relink).** It is the same 258 verify pages over about the same returned entries (49,982 against 49,481), at 3,554 statements a page against 230. Range 15's verify diffed range 14 (no `node_modules`) against a fresh install. Range 16's diffs one clean relink against another: about 95.6k identical files rewritten with new inodes, which the diff walks to find the tracked changes. That makes the cost per returned entry 1.58 ms against 0.08 ms. It is the first point of this shape (BASELINE_R15 §6, a range's first relink in a class). Ranges 17–20 will show whether it holds steady. It is an optimisation lead for the hot-spot session (diff over content-equal rewritten inodes), not a new F-number.
- **a1 (`p3-main-d`, harness `654b1ffc6a`, daemon `44ac6c91`, addon `77597adb`): STOP at the lead's git check, caused by the workload and the gate, not by LayerFS.** `r016.git-main`: `git status --porcelain` lists 116 untracked lines at the checkpoint, every one a `tsc` output beside its source in `packages/context/workspace-context/src/` (`*.js`, `*.d.ts`, `*.map`). HEAD and tree matched dsh (`44e126e30`), 188 commits written.
- **Where they come from.** dsh `72bb02e68e` moves the package from `packages/prompt/` to `packages/context/`. The plan's path lanes split the move: lane `r016-1-root` got its `package.json`, lane `r016-2-packages-sdk` got `src/`, `tests/` and `tsconfig.json`. That lane's end point ran `tsc -b … && tsdown` (exit 2, TS5083/TS6053 on the old reference path) and wrote the outputs into `src/`. dsh never had this tree.
- **Native does the same.** The same tree (`7d07cd9331b0`), the same install and `tsc` command, natively in image `d3773b4eac6a` with the network off, writes the same 30 files into `src/` (lead's reproduction, 2026-10-19). The four lane-end points pass P1–P5 against native (`nodeproof.mjs proofs`, a1). LayerFS carries every file of a Branch, so the lead's merge brings the lane's untracked outputs into main; git branches would not.
- **Decision asked (liaison):** the git-main and fresh-status checks require a clean status; build outputs outside `.gitignore` break that only on trees the lane split makes. No gate, plan or workload change was made. a1 is kept as evidence; the run is dirty and a2 forks snapshot r015.
- **Report check:** F1–F5 and F8 pass. F7 fails because the attempt stopped before the version walk, so the header uses the older format without the tooling wall-time label. It is a checker limit on early stops, not a missing figure.
- Calibration: point `r016-4-docs-rfc.end` runs no vitest files (vitest timed out natively at 90 s, exit 124, all 42 candidates unparsed), as `r015-3-packages-core.mid` did in range 15.


## Appendix

### A. Checks

| Check | Value | Threshold | Result |
| --- | --- | --- | --- |
| Correctness | tree ok; steps 3664/3664; conflicts 3/3; tests 30/30 equal to native | all | pass |
| Health | 0 open, 0 overlays | 0, 0, flat | pass |
| Speed | branch.diff_commits >64 entries · uncontended: 16.98× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 2 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.413 | < 0.5 | pass |
| Reinstall growth | 0.107× the raw bytes of 101 changed packages | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0234 (budget 0.3039) | < 0.1 | pass |
| Range growth | 40.0 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 973 ms for 220.9 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 0.96 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 188 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 20 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P2 | P1–P6 pass at every point | stop |
| `.git` conflicts | 0 (tracked 0 · install 253 · build 2; tracked judged by Correctness) | 0 | pass |
| Resilience | Busy 0 · EAGAIN 0 · refused unmount 0 | 0 Busy, EAGAIN, refused unmount | pass |
| Content ratio | 0.22× | ≤ 2× (act > 5×) | pass |
| Install inputs (reported, not gated) | not recorded | none until NODE_RULE §3 is decided | pass |

Played vs planned:

| Count | Played | Planned |
| --- | --- | --- |
| Steps (bash calls) | 266 | 267 |
| Lanes / agents | 4 / 10 | 4 / 10 |
| LayerFS Commits | 1915 | 1725 |
| Workspaces (one-shot share) | 339 (0.99) | 142 (0.986) |
| Reads | 455 | 455 |
| Reconcile writes | 187 | 187 |
| Left out (not played in this phase) | install 1, tests 1 | — |

### B. Latency by method and size class

Binary: daemon `44ac6c91abf6` (attempt 2). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 17 | 18.94 | 244.14 | 244.14 | 270.92 | 1.23× | 4.87× | — | — | 243 / 20,186 / 0 | — | 0.0796 ms per entrie | — |
| branch.diff_commits | 17–64 entries · contended | 1 | 15.86 | 15.86 | 15.86 | 15.86 | no baseline | no baseline | — | — | 454 / 21,484 / 0 | — | 0.4287 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 14.16 | 14.16 | 14.16 | 15.49 | no baseline | no baseline | — | — | 199 / 12,050 / 0 | — | 0.3602 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 184.58 | 184.58 | 184.58 | 184.58 | no baseline | no baseline | — | — | 4,287 / 143,626 / 0 | — | 0.8467 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 261 | 294.81 | 340.32 | 380.03 | 412.68 | 16.98× | 13.29× | — | — | 3,554 / 551,530 / 0 | — | 1.5828 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.55 | 0.94 | 0.94 | 1.59 | 0.80× | 0.69× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 0.95 | 0.95 | 0.95 | 1.26 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0475 ms per entrie | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 1.39 | 1.39 | 1.39 | 1.39 | 1.41× | 1.41× | — | — | 35 / 517 / 0 | — | 0.041 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 1681.98 | 1681.98 | 1681.98 | 2049.57 | 3.31× | 3.31× | — | — | 44,636 / 3,939,040 / 5,905 | — | 13.4558 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 3.29 | 3.29 | 3.29 | 3.29 | 1.19× | 1.19× | — | — | 45 / 1,015 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 44.71 | 44.71 | 44.71 | 44.71 | 2.35× | 2.35× | — | — | 198 / 20,593 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 18 | 13.74 | 51.89 | 51.89 | 70.14 | 1.58× | 4.37× | — | — | 283 / 17,537 / 0 | — | 0.039 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 14 | 9.40 | 17.62 | 17.62 | 18.45 | 1.46× | 2.51× | — | — | 117 / 4,671 / 0 | — | 0.0152 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 6 | 21.98 | 30.65 | 30.65 | 39.01 | 2.47× | 2.35× | — | — | 305 / 12,295 / 0 | — | 0.0016 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 8 | 10.71 | 12.86 | 12.86 | 13.90 | 1.59× | 1.38× | — | — | 126 / 4,563 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 33 | 13.65 | 44.88 | 67.78 | 80.32 | 1.61× | 3.04× | — | — | 277 / 18,821 / 0 | — | 0.0064 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 32 | 9.31 | 17.25 | 19.84 | 38.96 | 1.32× | 1.75× | — | — | 124 / 6,909 / 0 | — | 0.003 ms per byte | files.change |
| fs.diff_files | ≤1 KiB · contended | 10 | 7.73 | 13.64 | 13.64 | 16.89 | 1.38× | 2.18× | — | — | 171 / 8,746 / 0 | — | 0.0174 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 23 | 6.79 | 9.01 | 9.53 | 11.75 | 1.26× | 1.22× | — | — | 149 / 7,538 / 0 | — | 0.0205 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 7 | 9.50 | 9.95 | 9.95 | 11.57 | 1.54× | 1.40× | — | — | 236 / 14,651 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 20 | 7.48 | 13.10 | 13.10 | 13.64 | 1.12× | 1.83× | — | — | 170 / 9,289 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 4 | 6.96 | 6.99 | 6.99 | 7.60 | 1.31× | 1.01× | — | — | 176 / 10,539 / 0 | — | 0.0017 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 13 | 8.63 | 13.87 | 13.87 | 16.25 | 1.62× | 2.28× | — | — | 161 / 10,285 / 0 | — | 0.0021 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 1.62 | 1.62 | 1.62 | 1.62 | 1.05× | 1.05× | — | — | 43 / 3,269 / 0 | — | 1.619 ms per file | — |
| fs.glob | 1 files · uncontended | 4 | 2.04 | 3.64 | 3.64 | 6.64 | 1.67× | 2.77× | — | — | 32 / 2,887 / 0 | — | 2.043 ms per file | — |
| fs.glob | 17–64 files · contended | 2 | 6.68 | 6.68 | 6.68 | 17.06 | 2.95× | 2.79× | — | — | 184 / 17,274 / 0 | — | 0.3339 ms per file | — |
| fs.glob | 17–64 files · uncontended | 7 | 5.59 | 7.97 | 7.97 | 8.16 | 2.89× | 3.05× | — | — | 102 / 11,567 / 0 | — | 0.2632 ms per file | — |
| fs.glob | 2–4 files · contended | 4 | 2.19 | 2.52 | 2.52 | 3.29 | 1.57× | 1.81× | — | — | 73 / 3,873 / 0 | — | 1.094 ms per file | — |
| fs.glob | 2–4 files · uncontended | 10 | 2.56 | 3.52 | 3.52 | 19.35 | 1.70× | 1.77× | — | — | 45 / 3,589 / 0 | — | 1.059 ms per file | — |
| fs.glob | 5–16 files · contended | 6 | 2.69 | 4.64 | 4.64 | 34.68 | 2.08× | 3.28× | — | — | 53 / 4,626 / 0 | — | 0.4018 ms per file | — |
| fs.glob | 5–16 files · uncontended | 21 | 3.16 | 5.71 | 5.71 | 12.92 | 1.63× | 2.47× | — | — | 59 / 5,117 / 0 | — | 0.4467 ms per file | — |
| fs.glob | >64 files · contended | 9 | 15.22 | 24.16 | 24.16 | 25.54 | 3.69× | 5.86× | — | — | 283 / 23,684 / 0 | — | 0.0187 ms per file | — |
| fs.glob | >64 files · uncontended | 10 | 6.85 | 25.64 | 25.64 | 101.85 | 1.31× | 3.35× | — | — | 147 / 16,165 / 0 | — | 0.029 ms per file | — |
| fs.grep | 1 files · contended | 1 | 2.10 | 2.10 | 2.10 | 2.10 | 1.24× | 1.24× | — | — | 46 / 3,278 / 0 | — | 2.101 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 2 | 2.02 | 2.02 | 2.02 | 7.46 | 1.60× | 1.60× | — | — | 43 / 3,356 / 0 | — | 2.017 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 4 | 8.57 | 10.38 | 10.38 | 17.56 | 1.59× | 1.92× | — | — | 251 / 13,103 / 0 | — | 0.4762 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 10 | 11.32 | 22.05 | 22.05 | 32.67 | 3.14× | 5.09× | — | — | 249 / 13,581 / 0 | — | 0.5338 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 5 | 4.11 | 4.12 | 4.12 | 4.52 | 1.76× | 1.43× | — | — | 82 / 4,847 / 0 | — | 2.054 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 13 | 3.66 | 5.38 | 5.38 | 6.64 | 1.93× | 1.55× | — | — | 70 / 4,095 / 0 | — | 1.5785 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 10 | 4.75 | 9.13 | 9.13 | 10.61 | 1.99× | 2.15× | — | — | 126 / 8,254 / 0 | — | 0.5493 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 14 | 5.23 | 6.58 | 6.58 | 6.66 | 1.66× | 1.92× | — | — | 105 / 5,106 / 0 | — | 0.65 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 6 | 42.68 | 44.76 | 44.76 | 49.98 | 2.79× | 2.93× | — | — | 903 / 34,238 / 0 | — | 0.0331 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 28.03 | 39.51 | 39.51 | 97.90 | 2.44× | 2.51× | — | — | 678 / 29,070 / 0 | — | 0.1163 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 3 | 2.43 | 2.43 | 2.43 | 3.44 | 1.37× | 1.37× | — | — | 85 / 5,662 / 0 | — | 2.429 ms per entrie | — |
| fs.list | 17–64 entries · contended | 10 | 4.19 | 7.08 | 7.08 | 9.06 | 2.33× | 3.39× | — | — | 89 / 7,678 / 0 | — | 0.1473 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 13 | 4.71 | 7.26 | 7.26 | 8.58 | 1.96× | 2.89× | — | — | 80 / 8,115 / 0 | — | 0.1964 ms per entrie | — |
| fs.list | 2–4 entries · contended | 4 | 2.33 | 2.51 | 2.51 | 3.35 | 1.15× | 1.24× | — | — | 79 / 5,020 / 0 | — | 1.165 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 12 | 2.22 | 2.64 | 2.64 | 2.73 | 1.24× | 1.12× | — | — | 41 / 3,379 / 0 | — | 1.0685 ms per entrie | — |
| fs.list | 5–16 entries · contended | 6 | 3.24 | 3.32 | 3.32 | 3.56 | 1.65× | 1.34× | — | — | 62 / 5,290 / 0 | — | 0.474 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 22 | 2.79 | 5.36 | 5.92 | 8.02 | 1.72× | 2.62× | — | — | 54 / 4,876 / 0 | — | 0.4026 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 1 | 4.23 | 4.23 | 4.23 | 4.23 | 3.55× | 3.55× | — | — | 48 / 2,148 / 0 | — | 0.0058 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 3.45 | 3.45 | 3.45 | 3.45 | no baseline | no baseline | — | — | 71 / 4,531 / 0 | — | 0.0004 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 3.39 | 3.39 | 3.39 | 5.87 | 1.50× | 1.50× | — | — | 50 / 4,059 / 0 | — | 0.0003 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 18 | 2.68 | 4.49 | 4.49 | 5.32 | 1.35× | 1.90× | — | — | 64 / 4,188 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 48 | 2.52 | 3.69 | 4.29 | 4.40 | 1.41× | 1.29× | — | — | 50 / 3,328 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 40 | 12.36 | 35.27 | 36.40 | 112.48 | 1.54× | 2.62× | — | — | 262 / 14,099 / 0 | — | 12.363 ms per file | commit |
| fs.rm | 1 files · uncontended | 111 | 9.24 | 12.17 | 12.64 | 26.84 | 1.37× | 1.15× | — | — | 139 / 7,620 / 0 | — | 9.245 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 2 | 2.08 | 2.08 | 2.08 | 2.81 | 1.45× | 1.45× | — | — | 34 / 2,265 / 0 | — | 0.0022 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 9 | 2.22 | 4.01 | 4.01 | 4.15 | 1.36× | 2.09× | — | — | 42 / 3,571 / 0 | — | 0.0042 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 9 | 2.69 | 5.01 | 5.01 | 6.42 | 1.57× | 2.64× | — | — | 64 / 4,522 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 26 | 2.23 | 3.45 | 4.37 | 6.24 | 1.27× | 1.68× | — | — | 41 / 3,372 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 9 | 1.89 | 2.94 | 2.94 | 4.25 | 1.35× | 1.30× | — | — | 41 / 2,146 / 0 | — | 0.0006 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 21 | 1.80 | 3.59 | 3.59 | 3.62 | 1.21× | 1.64× | — | — | 36 / 2,656 / 0 | — | 0.0004 ms per byte | — |
| fs.write | ≤1 KiB · contended | 131 | 12.62 | 32.96 | 65.38 | 137.80 | 1.72× | 2.44× | — | — | 277 / 16,803 / 0 | — | 0.0171 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 172 | 7.78 | 13.97 | 20.01 | 24.16 | 1.33× | 1.55× | — | — | 136 / 6,667 / 0 | — | 0.0103 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 8 | 15.06 | 19.86 | 19.86 | 57.19 | 1.36× | 1.34× | — | — | 358 / 20,884 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 16 | 9.25 | 11.29 | 11.29 | 12.10 | 0.99× | 1.19× | — | — | 119 / 5,890 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 171 | 14.46 | 49.75 | 122.63 | 144.14 | 1.55× | 3.12× | — | — | 328 / 20,168 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 299 | 8.79 | 14.09 | 19.53 | 24.84 | 1.25× | 1.44× | — | — | 156 / 6,856 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 272 | 13.98 | 44.23 | 100.16 | 112.34 | 1.64× | 2.69× | — | — | 305 / 17,460 / 0 | — | 0.006 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 328 | 8.25 | 14.16 | 21.61 | 42.37 | 1.31× | 1.38× | — | — | 148 / 6,590 / 0 | — | 0.0031 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.53 | 0.53 | 0.53 | 0.53 | 0.90× | 0.90× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 80 | 35.72 | 87.43 | 114.79 | 126.55 | 1.57× | 2.08× | — | — | 442 / 38,277 / 29 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 98 | 30.69 | 62.27 | 68.00 | 331.82 | 1.34× | 1.59× | — | — | 287 / 28,301 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 30 | 3.95 | 10.55 | 14.81 | 53.16 | 1.22× | 2.53× | — | — | 6 / 71 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · uncontended | 48 | 3.91 | 5.25 | 7.03 | 22.41 | 1.17× | 1.13× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 16 | 18.78 | 46.05 | 46.05 | 50.99 | 2.17× | 2.69× | — | — | 119 / 4,544 / 0 | — | 18.776 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 16 | 9.35 | 20.82 | 20.82 | 33.32 | 1.23× | 2.00× | — | — | 116 / 4,596 / 0 | — | 9.347 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 318.11 | 318.11 | 318.11 | 318.11 | 6.33× | 6.33× | — | — | 5,788 / 147,406 / 0 | — | 318.111 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 126.23 | 126.23 | 126.23 | 126.23 | no baseline | no baseline | — | — | 1,280 / 91,122 / 127 | — | 2.6859 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 9 | 21.60 | 39.70 | 39.70 | 70.11 | 1.41× | 1.89× | — | — | 175 / 7,865 / 0 | — | 10.7985 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 17 | 13.81 | 20.19 | 20.19 | 69.51 | 1.39× | 1.80× | — | — | 141 / 6,077 / 0 | — | 5.899 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 15.36 | 15.36 | 15.36 | 21.20 | 1.36× | 1.36× | — | — | 142 / 7,646 / 0 | — | 1.2797 ms per file | commit |
| sandbox.commit | — · Committed · contended | 1 | 431.68 | 431.68 | 431.68 | 431.68 | no baseline | no baseline | — | — | 3,088 / 407,904 / 8,191 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 12 | 63.20 | 368.98 | 368.98 | 13578.04 | 0.92× | 5.35× | — | — | 649 / 60,455 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 12.61 | 12.61 | 12.61 | 12.61 | no baseline | no baseline | — | — | 86 / 8,652 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 341 | 63.47 | 889.33 | 1455.83 | 3043.85 | 1.57× | 2.57× | — | — | 0 / 0 / 0 | 2071.30 | — | — |
| sandbox.exec | 0 files · uncontended | 209 | 35.97 | 467.72 | 1141.79 | 6791.18 | 1.33× | 1.82× | — | — | — | 2075.70 | — | — |
| sandbox.exec | 1 files · contended | 76 | 41.70 | 94.39 | 139.82 | 143.29 | 1.33× | 1.60× | — | — | — | 4.30 | 41.704 ms per file | — |
| sandbox.exec | 1 files · uncontended | 38 | 37.51 | 67.58 | 71.42 | 72.26 | 1.23× | 1.15× | — | — | — | 4.70 | 37.512 ms per file | — |
| sandbox.exec | 17–64 files · contended | 15 | 65.81 | 160.48 | 160.48 | 370.95 | 1.02× | 2.50× | — | — | — | 34.70 | 1.4003 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 8 | 84.06 | 125.43 | 125.43 | 131.51 | 1.23× | 1.81× | — | — | — | 103 | 4.2028 ms per file | — |
| sandbox.exec | 2–4 files · contended | 72 | 48.06 | 82.08 | 94.74 | 148.52 | 1.27× | 1.32× | — | — | — | 9 | 18.499 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 51 | 43.89 | 65.76 | 79.17 | 88.26 | 1.34× | 1.25× | — | — | — | 9.70 | 15.1805 ms per file | — |
| sandbox.exec | 5–16 files · contended | 17 | 63.67 | 74.98 | 74.98 | 88.94 | 1.22× | 1.29× | — | — | — | 41 | 8.4703 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 25 | 57.28 | 83.56 | 84.72 | 86.77 | 1.09× | 1.16× | — | — | — | 33 | 5.7809 ms per file | — |
| sandbox.exec | — · contended | 16 | 2925.18 | 30586.32 | 30586.32 | 31873.50 | no baseline | no baseline | — | — | — | 28105.60 | — | — |
| sandbox.exec | — · uncontended | 32 | 133.69 | 9565.31 | 15025.33 | 31613.54 | 0.27× | 2.01× | — | — | — | 27393.40 | — | — |
| sandbox.mount | — · contended | 147 | 12.29 | 31.51 | 43.80 | 53.96 | 1.22× | 2.04× | — | — | 57 / 1,544 / 80 | — | — | observe.after |
| sandbox.mount | — · uncontended | 182 | 11.03 | 18.57 | 30.50 | 64.56 | 1.20× | 1.34× | — | — | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 4.08 | 4.32 | 4.32 | 28.39 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 130 | 11.93 | 28.18 | 33.49 | 38.21 | 1.43× | 2.29× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 199 | 11.20 | 31.90 | 91.67 | 113.77 | 1.23× | 2.30× | — | — | 0 / 0 / 0 | — | — | observe.after |

| Method | Category | Calls | Bytes in | Bytes out | Files / entries | Outcomes |
| --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | branch | 17 | 0.0 KiB | 898.9 KiB | 4,044 | ok 17 |
| branch.diff_commits | branch | 270 | 0.0 KiB | 14.6 MiB | 49,982 | ok 270 |
| branch.fork | branch | 24 | 0.0 KiB | 0.0 KiB | 0 | Forked 24 |
| branch.list_commits | project | 10 | 0.0 KiB | 95.6 KiB | 163 | ok 10 |
| branch.merge | branch | 9 | 0.0 KiB | 0.0 KiB | 0 | Merged 9 |
| branch.publish | branch | 1 | 0.0 KiB | 0.0 KiB | 0 | Added 1 |
| fs.apply | fs | 124 | 2.7 MiB | 0.0 KiB | 135 | Committed 124 |
| fs.diff_files | fs | 82 | 0.0 KiB | 725.2 KiB | 60 | Text 58, NoSuchPath 22, Equal 2 |
| fs.glob | fs | 84 | 0.0 KiB | 54.7 KiB | 838 | ok 84 |
| fs.grep | fs | 82 | 0.0 KiB | 236.7 KiB | 1,089 | ok 82 |
| fs.list | fs | 82 | 0.0 KiB | 128.1 KiB | 1,206 | ok 82 |
| fs.read | fs | 76 | 0.0 KiB | 250.5 KiB | 76 | ok 76 |
| fs.rm | fs | 151 | 0.0 KiB | 0.0 KiB | 151 | Committed 151 |
| fs.stat | fs | 84 | 0.0 KiB | 17.5 KiB | 84 | ok 84 |
| fs.write | fs | 1,397 | 15.7 MiB | 0.0 KiB | 1,397 | Committed 1397 |
| operator.store.stats | operator | 1 | 0.0 KiB | 0.0 KiB | 0 | ok 1 |
| sandbox.commit | sandbox | 337 | 0.0 KiB | 0.0 KiB | 0 | Committed 257, UpToDate 79, Conflict 1 |
| sandbox.exec | sandbox | 910 | 3.3 MiB | 3.2 MiB | 0 | exit:0 906, exit:2 3, exit:1 1 |
| sandbox.mount | sandbox | 339 | 0.0 KiB | 0.0 KiB | 0 | Mounted 339 |
| sandbox.status | sandbox | 5 | 0.0 KiB | 0.0 KiB | 0 | ok 5 |
| sandbox.unmount | sandbox | 339 | 0.0 KiB | 0.0 KiB | 0 | Unmounted 339 |

### C. Scale probes

Binary: daemon `44ac6c91abf6`.

Load average (1-min, runner (Docker VM kernel)): start 0.15 · end 1.17.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 2.101 | 2.844 · 2.335 · 2.037 · 2.101 · 1.769 | 1.28–1.28 | statements 16, vm_steps 1198, fullscan_steps 0, sorts 0, returned_rows 118 |
| read | 1.509 | 3.043 · 1.509 · 1.466 · 1.353 · 3.011 | 1.28–1.28 | statements 15, vm_steps 1168, fullscan_steps 0, sorts 0, returned_rows 117 |
| list_small | 1.878 | 1.878 · 1.769 · 1.267 · 3.359 · 2.005 | 1.28–1.28 | statements 15, vm_steps 1177, fullscan_steps 0, sorts 0, returned_rows 117 |
| list_largest | 6.739 | 7.431 · 7.082 · 6.739 · 5.87 · 6.575 | 1.28–1.28 | statements 92, vm_steps 13222, fullscan_steps 0, sorts 0, returned_rows 1473 |
| grep_scoped | 1.796 | 2.691 · 1.796 · 1.367 · 1.254 · 2.36 | 1.28–1.28 | statements 20, vm_steps 1323, fullscan_steps 0, sorts 0, returned_rows 126 |
| glob_scoped | 1.817 | 1.817 · 1.394 · 1.238 · 2.241 · 1.964 | 1.28–1.28 | statements 14, vm_steps 1156, fullscan_steps 0, sorts 0, returned_rows 116 |
| grep_tree | 3323.588 | 3667.253 · 3376.94 · 3323.588 · 3096.469 · 3069.965 | 1.2–1.26 | statements 33538, vm_steps 2741307, fullscan_steps 0, sorts 0, returned_rows 279862 |
| glob_tree | 8.564 | 10.907 · 9.352 · 8.38 · 8.564 · 8.337 | 1.2–1.2 | statements 181, vm_steps 17820, fullscan_steps 0, sorts 0, returned_rows 1980 |
| diff_files | 5.706 | 6.112 · 5.589 · 5.881 · 5.706 · 5.429 | 1.2–1.2 | statements 72, vm_steps 6892, fullscan_steps 0, sorts 0, returned_rows 702 |
| list_commits | 1.073 | 1.582 · 1.073 · 1.167 · 1.041 · 1.007 | 1.2–1.2 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 2.922 | 3.75 · 2.922 · 2.582 · 2.985 · 2.908 | 1.2–1.2 | statements 55, vm_steps 2385, fullscan_steps 0, sorts 0, returned_rows 259 |
| fork | 0.377 | 0.663 · 0.526 · 0.348 · 0.377 · 0.354 | 1.2–1.2 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 29.685 | 29.548 · 30.958 · 29.685 · 29.126 · 32.131 | 1.2–1.2 | statements 472, vm_steps 27312, fullscan_steps 4, sorts 8, returned_rows 2081 |
| oneshot_mount_unmount | 18.321 | 17.354 · 18.612 · 18.321 · 18.552 · 16.908 | 1.2–1.2 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 72.074 | 72.074 · 74.295 · 64.1 · 73.233 · 67.451 | 1.2–1.2 | statements 140, vm_steps 9404, fullscan_steps 80, sorts 2, returned_rows 927 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.2–1.2 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r016: 62,447 pages of 4,096 B, 0 free · Commits 14,874 · Branches 232 · Layers 20 · compression 4.00× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 55,371 | 311.2 MiB |
| 2 | 25,186 | 266.4 MiB |
| 3 | 11,774 | 1.6 MiB |
| 4 | 19 | 4.4 KiB |
| 5 | 11,718 | 1.2 MiB |
| 6 | 23,353 | 125.8 MiB |
| 7 | 31,242 | 7.1 MiB |
| 8 | 52 | 15.3 KiB |
| 9 | 21,285 | 28.6 MiB |
| 10 | 16,361 | 2.0 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,552 | 125.5 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 15,008 | 23.4 MiB |
| 1 | 25,995 | 162.9 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 50,939 | 199.0 MiB | 10.4 MiB |
| inode_value | 5,087 | 19.9 MiB | 503.9 KiB |
| object_location | 2,840 | 11.1 MiB | 1.2 MiB |
| binding_hint | 1,284 | 5.0 MiB | 513.2 KiB |
| commit | 1,133 | 4.4 MiB | 727.5 KiB |
| commit_lineage | 328 | 1.3 MiB | 180.3 KiB |
| commit_runs | 319 | 1.2 MiB | 188.5 KiB |
| commit_identity | 226 | 904.0 KiB | 87.9 KiB |
| content_signature | 157 | 628.0 KiB | 17.7 KiB |
| branch | 10 | 40.0 KiB | 6.3 KiB |
| history_meta | 8 | 32.0 KiB | 2.6 KiB |
| sqlite_schema | 6 | 24.0 KiB | 8.0 KiB |
| branch_names | 5 | 20.0 KiB | 7.7 KiB |
| branch_identity | 4 | 16.0 KiB | 6.9 KiB |
| store_totals | 1 | 4.0 KiB | 3.9 KiB |
| store_policy | 1 | 4.0 KiB | 4.0 KiB |
| sqlite_sequence | 1 | 4.0 KiB | 4.0 KiB |
| scope_allocator | 1 | 4.0 KiB | 3.9 KiB |
| run_merges | 1 | 4.0 KiB | 0.4 KiB |
| reach | 1 | 4.0 KiB | 3.2 KiB |

### E. Stage times

**Time 323.1 s** (tooling): play 105.3 · consolidate 97.2 · verify 91.1 · probes 17.6 · tests 0.0 · seal + snapshot 3.1 · report 8.8

323.14 s tooling: prepare 1.77 · play 103.53 · consolidate 97.23 · verify 81.28 (diff_commits + full compareTree) · version walk 9.84 · probes 17.57 · metrics 1.04 · seal 1.31 · sealed figures 0.73 · snapshot copy 1.03 · report 0.24

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T13:32:20.936Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 3645/3646; conflicts 3/3; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 10.95× baseline (no phase); Scaling: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Counters: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 32.1 MiB; median not judged: 1 of 3 earlier ranges; Git: git status not clean at the checkpoint |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T13:53:08.197Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 16.98× baseline (no phase); Scaling: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 40.0 MiB; median not judged: 1 of 3 earlier ranges; Snapshot time: 973 ms for 220.9 MiB new; size exponent not judged (2 snapshots); Node proofs: 20 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P2 |

### G. Evidence

- `~/lfs-history/metrics/range-016.a1.json`
- `~/lfs-history/metrics/range-016.a2.json`
- trace `~/lfs-history/runs/p3-main-e/trace/range-016.a2.jsonl` · runner log `~/lfs-history/runs/p3-main-e/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-016.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r016-2-packages-sdk | 697 | 173.7 KiB |
| r016-3-packages-prompt | 817 | 166.1 KiB |
| r016-1-root | 408 | 163.4 KiB |
| r016-4-docs-rfc | 846 | 167.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 300.0 | 1,362 |
| `git diff --stat` | 36.0 | 1,353 |
| `git add -f` | 26.0 | — |
| `git rm --cached` | 6.0 | — |
| `git commit` | 36.0 | 1,358 |

### I. Proof details

| Lane | Point | Proof | Result | Detail | Native cached |
| --- | --- | --- | --- | --- | --- |
| r016-1-root | end | P1 | pass | — | ✓ |
| r016-1-root | end | P2 | pass | exit 0 | ✓ |
| r016-1-root | end | P3 | n/a | an install, not a refresh | ✓ |
| r016-1-root | end | P4 | pass | 22 emitted files, exit 1 | ✓ |
| r016-1-root | end | P5 | pass | 5 files | ✓ |
| r016-1-root | end | P6 | n/a | not a repair | ✓ |
| r016-2-packages-sdk | end | P1 | pass | — | ✓ |
| r016-2-packages-sdk | end | P2 | pass | exit 0 | ✓ |
| r016-2-packages-sdk | end | P3 | pass | 147 bookkeeping path(s) | ✓ |
| r016-2-packages-sdk | end | P4 | pass | 49 emitted files, exit 2 | ✓ |
| r016-2-packages-sdk | end | P5 | pass | 22 files | ✓ |
| r016-2-packages-sdk | end | P6 | n/a | not a repair | ✓ |
| r016-4-docs-rfc | end | P1 | pass | — | ✓ |
| r016-4-docs-rfc | end | P2 | pass | exit 0 | ✓ |
| r016-4-docs-rfc | end | P3 | pass | 147 bookkeeping path(s) | ✓ |
| r016-4-docs-rfc | end | P4 | pass | 80 emitted files, exit 2 | ✓ |
| r016-4-docs-rfc | end | P5 | n/a | no calibrated file | ✓ |
| r016-4-docs-rfc | end | P6 | n/a | not a repair | ✓ |
| r016-3-packages-prompt | end | P1 | pass | — | ✓ |
| r016-3-packages-prompt | end | P2 | pass | exit 0 | ✓ |
| r016-3-packages-prompt | end | P3 | pass | 147 bookkeeping path(s) | ✓ |
| r016-3-packages-prompt | end | P4 | pass | 112 emitted files, exit 2 | ✓ |
| r016-3-packages-prompt | end | P5 | pass | 21 files | ✓ |
| r016-3-packages-prompt | end | P6 | n/a | not a repair | ✓ |
| lead | repair | P1 | n/a | folded into P6 | — |
| lead | repair | P2 | stop | line 6: native "[WARN] Failed to create bin at /workspaces/3/python/sdk-runtime/node_modules/.bin/dsh-jsonrpc-agent. ENOENT: no such file or directory, open '/workspaces/3/packages/examples/jsonrpc-demo/lib/bin.js'", LayerFS "[WARN] Failed to create bin at <root>/python/sdk-runtime/node_modules/.bin/dsh-jsonrpc-agent. ENOENT: no such file or directory, open '<root>/packages/examples/jsonrpc-demo/lib/bin.js'" | — |
| lead | repair | P3 | n/a | a repair, not a no-op | — |
| lead | repair | P4 | n/a | folded into P6 | — |
| lead | repair | P5 | pass | 30 files | — |
| lead | repair | P6 | pass | P1 pass, P4 pass (385 emitted files, exit 0) | — |

### J. Conflicts by path class

No conflicts by path recorded.
