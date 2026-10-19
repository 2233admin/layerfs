# Range 016 · **watch** · attempt 3

**Matches git ✓** · daemon `44ac6c91abf6` · image `d3773b4e` · plan v2 · forked from snapshot r015 (run p3-main-d)
dsh `8e6ad0a34`..`44e126e30` · **88 commits** (10 mainline, 78 side) · 2026-07-15 → 2026-07-17
Areas changed: `packages/core` 11% · `examples/acp-agent` 10% · `docs/rfc` 10% · other 69%
**Phase P3** · **Git ✓** · **Node ✓** (P1–P6: 21 pass, 0 stop, 0 NOT_RUN over 5 points) · **Content 0.22×** · **Churn 0.00**
**Time split:** play 95.0 s · git 154.6 s · Node 188.9 s · verify 76.8 s

| Latest version | Store on disk | Space amplification | Added this range | Commits | Time |
| --- | --- | --- | --- | --- | --- |
| **433.7 MiB** (+11.9 MiB) | **243.7 MiB** (+35.9 MiB) | **0.56×** (prev 0.49×) | **39.8 MiB** | **1,915** (total 14,766) | **317.5 s** tooling (total 14.6 min) |

**Checks:** 13 pass · 6 watch: Speed branch.diff_commits >64 entries · uncontended: 15.95× baseline (no phase); Scaling insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Contended work not judged: no contended class has 3 ranges of 5+ calls; Range growth 39.8 MiB; median not judged: 1 of 3 earlier ranges; Snapshot time 1017 ms for 215.7 MiB new; size exponent not judged (2 snapshots)
**D-6 triggers** (none): max candidate paths in a merge not traced (needs a candidate-path count on branch.merge (e.g. daemon timing `merge.paths` carrying `candidates`)) (trips > 50,000) · max lane hold of the merge at publish not traced (needs a span for the publication-lane hold inside branch.publish (e.g. daemon timing `publish.lane`, ms)) (trips > 500 ms) · Capacity/ObjectLimitExceeded/Busy from 9 merges: 0 (trips at 1)
**Moved most:** ▲ branch.diff_commits p95 +930% · ▲ fs.read p95 +221% · ▲ fs.write p95 +135%
**Budget:** 17 of 202 ranges · projected total 16.0 h (budget 16.8 h) · disk 36% of budget at range 202

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
| lead | repair | `3c4cbcb779fc` | `null` | n/a | pass | n/a | n/a | pass | pass (95,599 rewritten) |

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
| Commit Conflict | 1 / 1 | r016-1, a01 after a02 | 0.1 s |
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
| r016-1-root | 25 | 25 | 25 | 9 | 25 | 408 |
| r016-3-packages-prompt | 47 | 47 | 46 | 2 | 47 | 817 |
| r016-4-docs-rfc | 53 | 53 | 53 | 4 | 53 | 846 |
| **lead** | — | — | — | — | 188 commit-tree | index rebuild ✓ · repack ✓ |

| Lane | Installs | Refreshes | tsc -b | vitest points | Test files | Equal to native |
| --- | --- | --- | --- | --- | --- | --- |
| r016-1-root | 1 | 0 | 1 | 1 | 5 | 5 / 5 |
| r016-2-packages-sdk | 0 | 1 | 1 | 1 | 22 | 22 / 22 |
| r016-4-docs-rfc | 0 | 1 | 1 | 0 | 0 | — / — |
| r016-3-packages-prompt | 0 | 1 | 1 | 1 | 21 | 21 / 21 |
| **lead repair** | 1 | — | 1 | — | — | 95,599 files rewritten |

## 3. Storage

**3a. Overview**

|  | Previous (r015) | Now | Change |
| --- | --- | --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 421.8 MiB (9.3 MiB / 390.9 MiB / 8.3 MiB / 13.3 MiB) | 433.7 MiB (10.3 MiB / 396.5 MiB / 11.1 MiB / 15.8 MiB) | +11.9 MiB |
| Version figures from | — | full: first (no manifest for range 15) | — |
| Files / directories / symlinks | 40,504 / 6,733 / 2,569 | 41,376 / 6,927 / 2,663 | +872 / +194 / +94 |
| Largest file / largest directory | 23.5 MiB / 1,884 entries | 23.5 MiB (`node_modules/.pnpm/@rolldown+binding-linux-arm64-gnu@1.1.1/node_modules/@rolldown/binding-linux-arm64-gnu/rolldown-binding.linux-arm64-gnu.node`) / 1,884 entries (`node_modules/.pnpm/@mistralai+mistralai@2.2.1/node_modules/@mistralai/mistralai/esm/models/components`) | — |
| **Store on disk** (allocated, sealed) | 207.8 MiB | 243.7 MiB | +35.9 MiB |
| **Space amplification** (total · tracked) | 0.49× · tracked 3.26× | 0.56× · tracked 3.26× | 0.07 |
| Head cost / history cost | — | — (needs a reachability walk of the sealed file; not built) / — | — |
| **Stored per byte changed** (content / metadata / shared) | — | **9.24** (0.64 / 0.12 / 0.41) | 5.30× the median range |
| **Stored per Commit** | 60.3 KiB | 19.1 KiB | — |
| Metadata share | 0.31 | 0.33 | this range 0.41 |
| History: Commits / Layers / Branches | 12,851 | 14,766 / 10 / 69 | +1,915 |
| Projection at range 202 (estimate: study model, per-Commit cost × planned Commits + install and build forecast) | — | 8.15 GiB (Commits 6.70 GiB · installs 1.10 GiB · build 118.7 MiB) | — |
| Disk guard floor at range 202 (headroom: 256 MiB per range minimum) / disk budget | — | 46.70 GiB / 36% | — |
| Snapshot | — | r016, 215.7 MiB new blocks | — |

**3b. Where the bytes are**

| Part | Bytes | × latest version | Change this range |
| --- | --- | --- | --- |
| Content | 162.8 MiB | 0.38 | +19.5 MiB |
| Metadata | 23.4 MiB | 0.05 | +3.8 MiB |
| Index rows | 41.2 MiB | 0.10 | +10.7 MiB |
| Waste | 16.0 MiB | 0.04 | +1.8 MiB |
| Other | 308.0 KiB | 0.00 | +48.0 KiB |
| **Total = Store on disk** | **243.7 MiB** | **= 0.56** space amplification | +35.9 MiB |

Exact: from the sealed file.

**3c. By source**

| Source | Latest version | Stored (content + metadata) | Amplification | Head cost | Added this range | Changed this range | Stored per byte changed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tracked | 10.3 MiB | 33.6 MiB (14.6 MiB + 19.0 MiB) | 3.26× | — | 3.2 MiB | 4.3 MiB | 0.75 |
| `node_modules` | 396.5 MiB | 105.7 MiB (103.3 MiB + 2.4 MiB) | 0.27× | — | 2.1 MiB | 24.3 MiB | 0.09 |
| Build output | 11.1 MiB | 3.2 MiB (3.1 MiB + 77.8 KiB) | 0.29× | — | 1.0 MiB | 2.1 MiB | 0.49 |
| `.git` | 15.8 MiB | 43.4 MiB (41.7 MiB + 1.7 MiB) | 2.74× | — | 16.7 MiB | 0.0 KiB | — |
| Shared (index rows + waste + other) | — | 57.5 MiB | — (not divided) | — | 12.6 MiB | — | — |
| Unattributed (Saves without traced sizes) | — | 277.3 KiB | — | — | — | — | — |
| **Total** | — | **243.7 MiB** | **= 0.56×** space amplification | — | — | — | — |

Sources by the Commit that wrote them (an install Commit is `node_modules`, a build Commit build output). Any comparison with git uses the Tracked row only.

**3d. What's inside**

| Object | Total | Added | Avg size | Reused (dedupe hits) | As delta |
| --- | --- | --- | --- | --- | --- |
| Whole files | 55,371 | +6,302 | 5.8 KiB | 37,693 (derived) | 51% |
| Chunks (large files) | 25,187 | +1,190 | 10.8 KiB | — | 8% |
| Large-file extents | 11,793 | — | 0.1 KiB | — | — |
| Directories | 31,294 | 5,688 (with inodes, pooled) | 0.2 KiB | — | 68% |
| Inodes and attributes | 85,526 | ↑ pooled | 1.9 KiB | — | — |
| Symlinks | 1,552 | +2,843 | 0.1 KiB | — | — |

Delta: 2.3% at depth cap · 32% of refused bases stopped by budget · `node_modules` reinstall: 0.106× the raw bytes of 101 changed packages

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
| 9.5 ms / 29.8 ms (1.27×) | 2.5 ms / 10.1 ms (1.40×) | 3.4 ms / 9.3 ms (1.69×) | 22.5 ms / 76.1 ms (1.19×) | 11.0 ms / 22.8 ms (1.12×) | 1361 ms / 1880 ms (3.70×) | — (native comparison in P3; exec 40.1 ms / 766 ms) |
| SQL p50: 171 stmts | 56 stmts | 65 stmts | 217 stmts | 48 stmts | 31,605 stmts | — |

**Commit cost:** 7.35 ms per changed file · **One-shot Workspace** (mount + exec + commit + unmount): 580 ms p50 over 339
**Slowest:** sandbox.exec 35403 ms · sandbox.exec 28319 ms · sandbox.exec 27730 ms · checkpoint diff_commits 1.31 ms and 16.58 statements per entry (49,205 entries per page)
**Scaling:** not judged: fewer than 3 same-binary ranges (16 probes)

**Git and Node** (LayerFS ÷ native on the identical tree; ×base compares only with the P3 re-baseline)

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) | #362 case ÷ native |
| --- | --- | --- | --- | --- |
| git status (cold) | 310 ms / 310 ms | — / — | — | git / status-cold: — |
| git status (steady) | 290 ms / 490 ms | — / — | — | git / status-steady: — |
| git add | 24.0 ms / 93.0 ms | — / — | — | git / add: — |
| git commit (lane) | 35.0 ms / 72.0 ms | — / — | — | git / commit: — |
| lead writes main | 7038 ms / 7038 ms | — / — | — | — |
| repack | 4953 ms / 4953 ms | — / — | — | — |
| pnpm install (incremental) | 2748 ms / 2748 ms | 1103 ms / 1103 ms | 2.49× | pnpm-reinstall / cold: — |
| pnpm refresh | 2264 ms / 2264 ms | 1083 ms / 1083 ms | 2.09× | pnpm-reinstall / steady: — |
| tsc -b | 2560 ms / 3417 ms | 2796 ms / 2859 ms | 0.92× | tsc-b / cold: — |
| vitest | 3208 ms / 3208 ms | 2154 ms / 2154 ms | 1.49× | vitest / cold: — |

**Health:** 0 Workspaces open · 0 overlay files left · daemons 2 MB (+0 MB) over 5 of 5 Sandboxes · 15 open files · WAL before seal 0.0 KiB
**Resilience:** Busy 0 · EAGAIN 0 · refused unmount 0 · writer wait — · lane hold — per Commit (p50 / p95) · daemon RSS max 2 MB, median 2 MB over 1 daemons · overlay max — · unmount 10.5 ms / 27.3 ms

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

- **a3 (`p3-main-f`, harness `e071c5d436`, daemon `44ac6c91`, addon `77597adb`, image `d3773b4eac6a`): WATCH, terminal.** Checkpoint ok, git ✓ (188 commits, status clean, 0 read back). Node 21 pass, 0 stop, 0 NOT_RUN over 5 points; the repair's P6 rewrote 95,623 files. Tests 30/30 equal to native. Report check F1–F8 PASS. The run forked range 15's snapshot with range 15's git and Node state (`13df9bf31a`, from the source run's state).
- **Decision B:** the lead's `git clean -f` removed 116 untracked, unignored files (464,352 B), the tsc outputs from the lane split of dsh `72bb02e68e`. None was tracked or ignored, none was left, and the native repair chain removed the same 116.
- **Watch rows:**
  - **Speed** (`branch.diff_commits >64 entries · uncontended` 15.95×): verify's first diff of a relink over a relink, explained under a2. Verify took 76.8 s against 9.1 s.
  - **Scaling, Counters:** 2 of 3 same-binary points; range 17 makes them judgeable.
  - **Contended:** not judged.
  - **Range growth, Snapshot time:** not judgeable before range 18.
- **Against range 15 (BASELINE_R15 §6), same binary:**
  - **Uncontended p50s** are 1.0–1.4× the baseline: write ≤8 KiB 1.27×, mount 1.12×, Commit 0 files 1.19×, exec 0 files 1.26×. Docker VM load matched range 15 (start 0.24, end 1.38, against 1.05 and 1.75); the macOS host load was 11–14 from other work.
  - **p95 tails** are wider: `fs.list` 5–16 5.96× and unmount 2.93×, but the gate judges them watch, not act, until they rise over 3 points.
  - **Storage:** stored per Commit 19.1 KiB (range 15 60.3 KiB, its first install). Index rows +10.7 MiB for 1,915 Commits, 5.7 KiB a Commit (range 15 +20.5 MiB for 2,303, 9.1 KiB). Content ratio 0.22× (0.29×). Churn 0.00: 3.1 MiB stored for 1.55 GiB rewritten (0.26). None grows faster than the work.
- **Wall:** tooling 317.5 s; the final command took 216 s under the 295 s alarm (range 15: 121 s), with consolidate 101.7 s and verify 76.8 s. Wall projection 0.95 of the P3 budget (pass). If verify's relink diff holds, ranges 17–20 may reach watch (> 1).
- **Known open items:** F-056 and F-057 are unchanged (BASELINE_R15 §5). The clean relink cost exec 31.6 s and rewrote 95.6k inodes (range 15: 26.1 s, 94.5k). No new F-number.
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
| Speed | branch.diff_commits >64 entries · uncontended: 15.95× baseline (no phase) | ≤ 1.2× | watch |
| Scaling | insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 2 of 3 points of probe version 1 | < 0.15 | watch |
| Counters | insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6) | < 0.05 | watch |
| Contended work | not judged: no contended class has 3 ranges of 5+ calls | < 0.05 (SQL work against tree size) | watch |
| Directory share | 0.413 | < 0.5 | pass |
| Reinstall growth | 0.106× the raw bytes of 101 changed packages | ≤ 2× changed packages; ≤ 1 MiB with none | pass |
| Delta at cap | 0.0229 (budget 0.3159) | < 0.1 | pass |
| Range growth | 39.8 MiB; median not judged: 1 of 3 earlier ranges | ≤ 3× median, ≤ 2 GiB | watch |
| Snapshot time | 1017 ms for 215.7 MiB new; size exponent not judged (2 snapshots) | < 0.15 | watch |
| Disk projection | 0.36 | < 0.8 | pass |
| Wall projection | 0.95 | ≤ 1 (p3 budget) | pass |
| Git | HEAD = checkpoint; 188 commits; clean; 0 read back; 0 guard violations | HEAD = checkpoint, commits = dsh, clean, 0 read back, 0 guard | pass |
| Node proofs | 21 pass · 0 stop · 0 NOT_RUN over 5 points | P1–P6 pass at every point | pass |
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

Binary: daemon `44ac6c91abf6` (attempt 3). Each call's own input is its size class; ×base compares the same operation and class only.

| Operation | Size class | n | p50 | p95 | p99 | max | ×base p50 | ×base p95 | Depth slope | Tree slope | SQL p50: statements / VM steps / full-scan steps | FUSE opcodes p50 per exec | Per unit (p50) | Slowest phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| branch.diff_branches | >64 entries · uncontended | 17 | 21.36 | 270.47 | 270.47 | 314.36 | 1.39× | 5.40× | — | — | 247 / 20,178 / 0 | — | 0.0883 ms per entrie | — |
| branch.diff_commits | 17–64 entries · contended | 1 | 25.10 | 25.10 | 25.10 | 25.10 | no baseline | no baseline | — | — | 272 / 15,989 / 0 | — | 0.6783 ms per entrie | — |
| branch.diff_commits | 17–64 entries · uncontended | 2 | 13.48 | 13.48 | 13.48 | 15.52 | no baseline | no baseline | — | — | 199 / 12,036 / 0 | — | 0.3547 ms per entrie | — |
| branch.diff_commits | >64 entries · contended | 1 | 270.13 | 270.13 | 270.13 | 270.13 | no baseline | no baseline | — | — | 4,273 / 143,440 / 0 | — | 1.2391 ms per entrie | — |
| branch.diff_commits | >64 entries · uncontended | 261 | 277.01 | 324.06 | 355.43 | 456.49 | 15.95× | 12.65× | — | — | 3,556 / 552,146 / 0 | — | 1.4575 ms per entrie | — |
| branch.fork | — · uncontended | 8 | 0.50 | 1.31 | 1.31 | 1.78 | 0.72× | 0.96× | — | — | 16 / 274 / 0 | — | — | — |
| branch.list_commits | 17–64 entries · uncontended | 3 | 1.23 | 1.23 | 1.23 | 6.43 | no baseline | no baseline | — | — | 70 / 1,298 / 0 | — | 0.0614 ms per entrie | — |
| branch.merge | 17–64 entries · Merged · uncontended | 1 | 2.44 | 2.44 | 2.44 | 2.44 | 2.47× | 2.47× | — | — | 35 / 517 / 0 | — | 0.0718 ms per entrie | — |
| branch.merge | >64 entries · Merged (new Commit) · uncontended | 3 | 1880.23 | 1880.23 | 1880.23 | 2495.73 | 3.70× | 3.70× | — | — | 44,623 / 3,939,765 / 5,905 | — | 15.0418 ms per entrie | branch.merge |
| branch.publish | — · uncontended | 1 | 4.28 | 4.28 | 4.28 | 4.28 | 1.55× | 1.55× | — | — | 45 / 1,014 / 0 | — | — | — |
| fs.apply | >512 KiB · uncontended | 1 | 49.24 | 49.24 | 49.24 | 49.24 | 2.59× | 2.59× | — | — | 199 / 20,634 / 0 | — | 0 ms per byte | commit |
| fs.apply | ≤1 KiB · contended | 18 | 19.00 | 46.56 | 46.56 | 57.49 | 2.18× | 3.92× | — | — | 284 / 22,778 / 0 | — | 0.0329 ms per byte | commit |
| fs.apply | ≤1 KiB · uncontended | 14 | 7.52 | 11.05 | 11.05 | 13.29 | 1.16× | 1.58× | — | — | 117 / 4,671 / 0 | — | 0.0107 ms per byte | commit |
| fs.apply | ≤64 KiB · contended | 6 | 15.31 | 19.00 | 19.00 | 25.88 | 1.72× | 1.46× | — | — | 306 / 28,899 / 0 | — | 0.0009 ms per byte | commit |
| fs.apply | ≤64 KiB · uncontended | 8 | 7.15 | 8.15 | 8.15 | 8.35 | 1.06× | 0.88× | — | — | 116 / 4,145 / 0 | — | 0.0005 ms per byte | commit |
| fs.apply | ≤8 KiB · contended | 33 | 22.94 | 54.87 | 67.75 | 85.45 | 2.71× | 3.71× | — | — | 337 / 76,154 / 8,191 | — | 0.0086 ms per byte | commit |
| fs.apply | ≤8 KiB · uncontended | 32 | 7.72 | 14.69 | 15.28 | 20.32 | 1.09× | 1.49× | — | — | 140 / 6,624 / 0 | — | 0.0033 ms per byte | commit |
| fs.diff_files | ≤1 KiB · contended | 9 | 7.44 | 10.09 | 10.09 | 16.46 | 1.33× | 1.61× | — | — | 223 / 10,263 / 0 | — | 0.0201 ms per byte | sdk.read |
| fs.diff_files | ≤1 KiB · uncontended | 24 | 6.46 | 13.25 | 14.98 | 15.32 | 1.20× | 1.79× | — | — | 151 / 7,746 / 0 | — | 0.0218 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · contended | 6 | 9.95 | 12.80 | 12.80 | 13.26 | 1.62× | 1.80× | — | — | 257 / 14,954 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤64 KiB · uncontended | 21 | 6.76 | 9.75 | 9.75 | 12.51 | 1.01× | 1.36× | — | — | 168 / 9,214 / 0 | — | 0.0004 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · contended | 4 | 7.50 | 7.73 | 7.73 | 8.03 | 1.42× | 1.12× | — | — | 158 / 10,539 / 0 | — | 0.002 ms per byte | sdk.read |
| fs.diff_files | ≤8 KiB · uncontended | 13 | 6.74 | 8.55 | 8.55 | 13.37 | 1.26× | 1.41× | — | — | 154 / 8,919 / 0 | — | 0.0018 ms per byte | sdk.read |
| fs.glob | 1 files · contended | 1 | 4.16 | 4.16 | 4.16 | 4.16 | 2.71× | 2.71× | — | — | 98 / 5,002 / 0 | — | 4.164 ms per file | — |
| fs.glob | 1 files · uncontended | 4 | 1.91 | 2.68 | 2.68 | 4.88 | 1.57× | 2.04× | — | — | 42 / 2,869 / 0 | — | 1.914 ms per file | — |
| fs.glob | 17–64 files · contended | 3 | 6.55 | 6.55 | 6.55 | 17.44 | 2.90× | 2.74× | — | — | 146 / 12,946 / 0 | — | 0.3277 ms per file | — |
| fs.glob | 17–64 files · uncontended | 6 | 5.83 | 7.02 | 7.02 | 8.19 | 3.02× | 2.69× | — | — | 100 / 11,625 / 0 | — | 0.2456 ms per file | — |
| fs.glob | 2–4 files · contended | 2 | 2.66 | 2.66 | 2.66 | 7.04 | 1.91× | 1.91× | — | — | 49 / 4,047 / 0 | — | 1.332 ms per file | — |
| fs.glob | 2–4 files · uncontended | 12 | 2.32 | 3.15 | 3.15 | 3.49 | 1.54× | 1.58× | — | — | 45 / 3,581 / 0 | — | 0.8732 ms per file | — |
| fs.glob | 5–16 files · contended | 9 | 4.95 | 9.15 | 9.15 | 32.90 | 3.83× | 6.46× | — | — | 74 / 7,923 / 0 | — | 0.825 ms per file | — |
| fs.glob | 5–16 files · uncontended | 18 | 2.63 | 4.85 | 4.85 | 5.78 | 1.36× | 2.09× | — | — | 55 / 5,095 / 0 | — | 0.3576 ms per file | — |
| fs.glob | >64 files · contended | 5 | 23.18 | 24.01 | 24.01 | 24.30 | 5.62× | 5.82× | — | — | 575 / 41,090 / 0 | — | 0.0183 ms per file | — |
| fs.glob | >64 files · uncontended | 14 | 13.05 | 42.67 | 42.67 | 43.02 | 2.49× | 5.58× | — | — | 247 / 17,006 / 0 | — | 0.0307 ms per file | — |
| fs.grep | 1 files · contended | 1 | 4.58 | 4.58 | 4.58 | 4.58 | 2.71× | 2.71× | — | — | 64 / 4,630 / 0 | — | 4.582 ms per file | sdk.lines |
| fs.grep | 1 files · uncontended | 2 | 2.09 | 2.09 | 2.09 | 3.40 | 1.66× | 1.66× | — | — | 33 / 2,488 / 0 | — | 2.092 ms per file | sdk.lines |
| fs.grep | 17–64 files · contended | 3 | 9.37 | 9.37 | 9.37 | 15.88 | 1.73× | 1.73× | — | — | 264 / 13,230 / 0 | — | 0.4682 ms per file | sdk.lines |
| fs.grep | 17–64 files · uncontended | 11 | 12.48 | 21.54 | 21.54 | 22.41 | 3.47× | 4.97× | — | — | 248 / 13,545 / 0 | — | 0.4921 ms per file | sdk.lines |
| fs.grep | 2–4 files · contended | 3 | 4.49 | 4.49 | 4.49 | 8.80 | 1.92× | 1.56× | — | — | 110 / 7,359 / 0 | — | 2.2425 ms per file | sdk.lines |
| fs.grep | 2–4 files · uncontended | 15 | 3.15 | 4.78 | 4.78 | 5.70 | 1.66× | 1.38× | — | — | 71 / 4,101 / 0 | — | 1.4105 ms per file | sdk.lines |
| fs.grep | 5–16 files · contended | 9 | 8.45 | 13.14 | 13.14 | 15.54 | 3.54× | 3.09× | — | — | 156 / 11,034 / 0 | — | 1.1513 ms per file | sdk.lines |
| fs.grep | 5–16 files · uncontended | 15 | 4.33 | 6.36 | 6.36 | 12.09 | 1.38× | 1.85× | — | — | 95 / 4,105 / 0 | — | 0.5198 ms per file | sdk.lines |
| fs.grep | >64 files · contended | 6 | 35.76 | 51.11 | 51.11 | 60.87 | 2.34× | 3.34× | — | — | 851 / 44,648 / 0 | — | 0.0397 ms per file | sdk.lines |
| fs.grep | >64 files · uncontended | 7 | 37.37 | 45.30 | 45.30 | 59.07 | 3.25× | 2.88× | — | — | 762 / 29,672 / 0 | — | 0.1582 ms per file | sdk.lines |
| fs.list | 1 entries · contended | 2 | 3.50 | 3.50 | 3.50 | 8.21 | 1.97× | 1.97× | — | — | 85 / 4,127 / 0 | — | 3.496 ms per entrie | — |
| fs.list | 1 entries · uncontended | 1 | 2.88 | 2.88 | 2.88 | 2.88 | 1.70× | 1.70× | — | — | 62 / 3,789 / 0 | — | 2.877 ms per entrie | — |
| fs.list | 17–64 entries · contended | 6 | 4.60 | 5.54 | 5.54 | 5.68 | 2.57× | 2.66× | — | — | 80 / 8,088 / 0 | — | 0.1458 ms per entrie | — |
| fs.list | 17–64 entries · uncontended | 17 | 4.59 | 9.34 | 9.34 | 16.14 | 1.91× | 3.71× | — | — | 80 / 8,115 / 0 | — | 0.1609 ms per entrie | — |
| fs.list | 2–4 entries · contended | 3 | 3.07 | 3.07 | 3.07 | 9.64 | 1.52× | 1.52× | — | — | 70 / 4,524 / 0 | — | 1.5365 ms per entrie | — |
| fs.list | 2–4 entries · uncontended | 13 | 2.07 | 2.78 | 2.78 | 3.42 | 1.15× | 1.17× | — | — | 42 / 3,437 / 0 | — | 1.011 ms per entrie | — |
| fs.list | 5–16 entries · contended | 9 | 3.17 | 6.14 | 6.14 | 6.99 | 1.62× | 2.48× | — | — | 108 / 7,265 / 0 | — | 0.4614 ms per entrie | — |
| fs.list | 5–16 entries · uncontended | 19 | 2.73 | 12.19 | 12.19 | 14.30 | 1.69× | 5.96× | — | — | 53 / 5,158 / 0 | — | 0.3629 ms per entrie | — |
| fs.read | ≤1 KiB · uncontended | 1 | 3.72 | 3.72 | 3.72 | 3.72 | 3.12× | 3.12× | — | — | 48 / 2,150 / 0 | — | 0.0051 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · contended | 1 | 4.57 | 4.57 | 4.57 | 4.57 | no baseline | no baseline | — | — | 83 / 5,217 / 0 | — | 0.0005 ms per byte | sdk.lines |
| fs.read | ≤64 KiB · uncontended | 3 | 2.27 | 2.27 | 2.27 | 2.34 | 1.00× | 1.00× | — | — | 47 / 3,429 / 0 | — | 0.0002 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · contended | 17 | 2.85 | 10.83 | 10.83 | 12.81 | 1.44× | 4.58× | — | — | 81 / 5,298 / 0 | — | 0.0012 ms per byte | sdk.lines |
| fs.read | ≤8 KiB · uncontended | 49 | 2.52 | 6.91 | 12.70 | 15.66 | 1.40× | 2.42× | — | — | 55 / 3,468 / 0 | — | 0.0009 ms per byte | sdk.lines |
| fs.rm | 1 files · contended | 41 | 10.31 | 38.95 | 46.14 | 54.89 | 1.29× | 2.90× | — | — | 230 / 13,687 / 0 | — | 10.309 ms per file | commit |
| fs.rm | 1 files · uncontended | 110 | 8.41 | 18.06 | 21.75 | 42.05 | 1.25× | 1.71× | — | — | 147 / 7,785 / 0 | — | 8.412 ms per file | commit |
| fs.stat | ≤1 KiB · contended | 3 | 3.55 | 3.55 | 3.55 | 7.30 | 2.47× | 2.47× | — | — | 50 / 4,135 / 0 | — | 0.0105 ms per byte | — |
| fs.stat | ≤1 KiB · uncontended | 8 | 2.38 | 3.65 | 3.65 | 8.10 | 1.46× | 1.90× | — | — | 43 / 4,285 / 0 | — | 0.0037 ms per byte | — |
| fs.stat | ≤64 KiB · contended | 6 | 3.97 | 5.55 | 5.55 | 6.77 | 2.32× | 2.92× | — | — | 88 / 4,563 / 0 | — | 0.0002 ms per byte | — |
| fs.stat | ≤64 KiB · uncontended | 29 | 2.16 | 3.37 | 3.38 | 3.56 | 1.23× | 1.64× | — | — | 42 / 3,411 / 0 | — | 0.0001 ms per byte | — |
| fs.stat | ≤8 KiB · contended | 8 | 2.18 | 2.91 | 2.91 | 9.18 | 1.55× | 1.29× | — | — | 40 / 2,716 / 0 | — | 0.0005 ms per byte | — |
| fs.stat | ≤8 KiB · uncontended | 22 | 1.97 | 8.72 | 9.28 | 13.50 | 1.32× | 3.99× | — | — | 39 / 3,089 / 0 | — | 0.0005 ms per byte | — |
| fs.write | ≤1 KiB · contended | 133 | 14.59 | 35.70 | 50.22 | 73.79 | 1.99× | 2.64× | — | — | 284 / 19,462 / 0 | — | 0.0195 ms per byte | commit |
| fs.write | ≤1 KiB · uncontended | 170 | 7.83 | 13.56 | 19.27 | 27.93 | 1.34× | 1.50× | — | — | 137 / 6,936 / 0 | — | 0.0107 ms per byte | commit |
| fs.write | ≤512 KiB · contended | 7 | 13.27 | 25.32 | 25.32 | 35.66 | 1.20× | 1.70× | — | — | 323 / 19,937 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤512 KiB · uncontended | 17 | 9.88 | 13.27 | 13.27 | 28.79 | 1.06× | 1.39× | — | — | 136 / 7,452 / 0 | — | 0.0001 ms per byte | commit |
| fs.write | ≤64 KiB · contended | 154 | 13.44 | 44.12 | 59.32 | 94.61 | 1.44× | 2.77× | — | — | 305 / 18,557 / 0 | — | 0.0008 ms per byte | commit |
| fs.write | ≤64 KiB · uncontended | 316 | 8.79 | 19.30 | 24.18 | 30.16 | 1.25× | 1.97× | — | — | 159 / 6,961 / 0 | — | 0.0005 ms per byte | commit |
| fs.write | ≤8 KiB · contended | 255 | 14.86 | 39.42 | 74.86 | 79.68 | 1.74× | 2.40× | — | — | 301 / 18,560 / 0 | — | 0.0056 ms per byte | commit |
| fs.write | ≤8 KiB · uncontended | 345 | 8.02 | 15.22 | 18.79 | 30.90 | 1.27× | 1.48× | — | — | 149 / 6,716 / 0 | — | 0.0031 ms per byte | commit |
| operator.store.stats | — · uncontended | 1 | 0.67 | 0.67 | 0.67 | 0.67 | 1.13× | 1.13× | — | — | 3 / 61 / 0 | — | — | — |
| sandbox.commit | 0 files · Committed · contended | 76 | 36.61 | 80.24 | 116.02 | 148.04 | 1.61× | 1.91× | — | — | 519 / 41,871 / 43 | — | — | commit |
| sandbox.commit | 0 files · Committed · uncontended | 102 | 27.24 | 51.41 | 78.90 | 360.00 | 1.19× | 1.31× | — | — | 277 / 26,541 / 0 | — | — | commit |
| sandbox.commit | 0 files · UpToDate · contended | 25 | 4.04 | 9.15 | 13.76 | 20.26 | 1.24× | 2.20× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 0 files · UpToDate · uncontended | 53 | 3.96 | 5.64 | 7.59 | 50.04 | 1.19× | 1.21× | — | — | 6 / 71 / 0 | — | — | observe.after |
| sandbox.commit | 1 files · Committed · contended | 18 | 14.79 | 28.83 | 28.83 | 32.11 | 1.71× | 1.69× | — | — | 134 / 5,677 / 0 | — | 14.785 ms per file | commit |
| sandbox.commit | 1 files · Committed · uncontended | 14 | 9.16 | 17.87 | 17.87 | 27.82 | 1.21× | 1.72× | — | — | 114 / 4,389 / 0 | — | 9.165 ms per file | commit |
| sandbox.commit | 1 files · Conflict · contended | 1 | 249.94 | 249.94 | 249.94 | 249.94 | 4.97× | 4.97× | — | — | 5,769 / 147,042 / 0 | — | 249.943 ms per file | commit |
| sandbox.commit | 17–64 files · Committed · contended | 1 | 73.76 | 73.76 | 73.76 | 73.76 | no baseline | no baseline | — | — | 1,280 / 91,122 / 127 | — | 1.5693 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · contended | 17 | 13.01 | 20.29 | 20.29 | 32.21 | 0.85× | 0.97× | — | — | 143 / 6,947 / 0 | — | 5.8095 ms per file | commit |
| sandbox.commit | 2–4 files · Committed · uncontended | 9 | 14.09 | 23.81 | 23.81 | 27.25 | 1.42× | 2.13× | — | — | 156 / 8,093 / 0 | — | 5.4465 ms per file | commit |
| sandbox.commit | 5–16 files · Committed · uncontended | 2 | 13.50 | 13.50 | 13.50 | 20.58 | 1.19× | 1.19× | — | — | 142 / 7,622 / 0 | — | 1.1248 ms per file | commit |
| sandbox.commit | — · Committed · contended | 2 | 68.14 | 68.14 | 68.14 | 417.43 | no baseline | no baseline | — | — | 808 / 87,096 / 0 | — | — | commit |
| sandbox.commit | — · Committed · uncontended | 11 | 70.47 | 343.25 | 343.25 | 13295.17 | 1.02× | 4.98× | — | — | 649 / 60,392 / 0 | — | — | commit |
| sandbox.commit | — · UpToDate · uncontended | 1 | 12.65 | 12.65 | 12.65 | 12.65 | no baseline | no baseline | — | — | 95 / 8,978 / 0 | — | — | commit |
| sandbox.exec | 0 files · contended | 349 | 48.77 | 803.75 | 1157.40 | 2066.75 | 1.20× | 2.32× | — | — | — | 2,081 | — | — |
| sandbox.exec | 0 files · uncontended | 201 | 34.07 | 429.22 | 716.69 | 8157.09 | 1.26× | 1.67× | — | — | — | 2060.70 | — | — |
| sandbox.exec | 1 files · contended | 67 | 38.02 | 64.98 | 84.64 | 110.42 | 1.21× | 1.10× | — | — | — | 4.30 | 38.015 ms per file | — |
| sandbox.exec | 1 files · uncontended | 47 | 37.70 | 60.42 | 70.79 | 96.79 | 1.24× | 1.03× | — | — | — | 5.30 | 37.697 ms per file | — |
| sandbox.exec | 17–64 files · contended | 18 | 41.00 | 139.86 | 139.86 | 189.75 | 0.64× | 2.18× | — | — | — | 34.70 | 0.8724 ms per file | — |
| sandbox.exec | 17–64 files · uncontended | 5 | 78.50 | 83.53 | 83.53 | 96.10 | 1.14× | 1.21× | — | — | — | 103 | 3.925 ms per file | — |
| sandbox.exec | 2–4 files · contended | 71 | 44.15 | 69.06 | 76.37 | 79.19 | 1.16× | 1.11× | — | — | — | 9.70 | 18.312 ms per file | — |
| sandbox.exec | 2–4 files · uncontended | 52 | 38.86 | 74.00 | 77.44 | 101.20 | 1.18× | 1.40× | — | — | — | 9.70 | 14.2135 ms per file | — |
| sandbox.exec | 5–16 files · contended | 15 | 69.67 | 95.36 | 95.36 | 129.47 | 1.33× | 1.64× | — | — | — | 41 | 8.837 ms per file | — |
| sandbox.exec | 5–16 files · uncontended | 27 | 64.35 | 78.04 | 92.12 | 92.20 | 1.23× | 1.08× | — | — | — | 34 | 6.4379 ms per file | — |
| sandbox.exec | — · contended | 14 | 2558.45 | 27729.60 | 27729.60 | 28318.53 | no baseline | no baseline | — | — | — | 27303.60 | — | — |
| sandbox.exec | — · uncontended | 34 | 129.05 | 12235.74 | 13041.54 | 35403.34 | 0.26× | 2.57× | — | — | — | 27303.60 | — | — |
| sandbox.mount | — · contended | 142 | 12.54 | 26.93 | 65.11 | 83.30 | 1.25× | 1.75× | — | — | 57 / 1,544 / 80 | — | — | sandbox.mount.attach |
| sandbox.mount | — · uncontended | 187 | 10.30 | 16.34 | 22.46 | 31.55 | 1.12× | 1.18× | — | — | 45 / 1,337 / 80 | — | — | observe.after |
| sandbox.status | — · uncontended | 5 | 4.20 | 4.31 | 4.31 | 26.74 | no baseline | no baseline | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · contended | 128 | 12.22 | 26.11 | 47.58 | 78.59 | 1.47× | 2.12× | — | — | 0 / 0 / 0 | — | — | observe.after |
| sandbox.unmount | — · uncontended | 201 | 10.18 | 40.66 | 94.90 | 139.84 | 1.12× | 2.93× | — | — | 0 / 0 / 0 | — | — | observe.after |

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

Load average (1-min, runner (Docker VM kernel)): start 0.24 · end 1.38.

| Probe | ms (median) | Samples | Load 1-min | Counters (first sample) |
| --- | --- | --- | --- | --- |
| stat | 2.386 | 2.953 · 1.505 · 2.386 · 3.563 · 1.654 | 1.57–1.57 | statements 16, vm_steps 1198, fullscan_steps 0, sorts 0, returned_rows 118 |
| read | 1.356 | 4.706 · 1.356 · 1.112 · 1.081 · 3.696 | 1.57–1.57 | statements 15, vm_steps 1168, fullscan_steps 0, sorts 0, returned_rows 117 |
| list_small | 1.559 | 1.559 · 1.191 · 1.347 · 3.531 · 2 | 1.57–1.57 | statements 15, vm_steps 1177, fullscan_steps 0, sorts 0, returned_rows 117 |
| list_largest | 7.762 | 7.522 · 7.835 · 7.491 · 7.762 · 8.18 | 1.57–1.57 | statements 92, vm_steps 13222, fullscan_steps 0, sorts 0, returned_rows 1473 |
| grep_scoped | 2.434 | 4.953 · 1.762 · 1.387 · 2.974 · 2.434 | 1.57–1.57 | statements 20, vm_steps 1323, fullscan_steps 0, sorts 0, returned_rows 126 |
| glob_scoped | 2.367 | 4.074 · 2.367 · 1.754 · 1.918 · 2.97 | 1.57–1.57 | statements 14, vm_steps 1156, fullscan_steps 0, sorts 0, returned_rows 116 |
| grep_tree | 3357.3 | 3818.286 · 3290.267 · 3392.839 · 3287.739 · 3357.3 | 1.44–1.52 | statements 33506, vm_steps 2742892, fullscan_steps 0, sorts 0, returned_rows 280201 |
| glob_tree | 8.373 | 9.603 · 8.373 · 8.437 · 7.91 · 7.974 | 1.49–1.49 | statements 185, vm_steps 18030, fullscan_steps 0, sorts 0, returned_rows 1989 |
| diff_files | 5.445 | 5.717 · 5.183 · 5.531 · 5.445 · 5.016 | 1.49–1.49 | statements 72, vm_steps 6892, fullscan_steps 0, sorts 0, returned_rows 702 |
| list_commits | 0.923 | 2.125 · 1.212 · 0.923 · 0.837 · 0.641 | 1.49–1.49 | statements 70, vm_steps 1298, fullscan_steps 0, sorts 0, returned_rows 52 |
| diff_commits | 3.013 | 4.251 · 3.033 · 2.695 · 2.649 · 3.013 | 1.49–1.49 | statements 55, vm_steps 2385, fullscan_steps 0, sorts 0, returned_rows 259 |
| fork | 0.56 | 0.726 · 0.56 · 0.373 · 0.741 · 0.398 | 1.49–1.49 | statements 16, vm_steps 274, fullscan_steps 0, sorts 0, returned_rows 7 |
| merge | 33.568 | 33.53 · 35.63 · 30.844 · 33.568 · 34.525 | 1.49–1.49 | statements 473, vm_steps 27315, fullscan_steps 4, sorts 8, returned_rows 2082 |
| oneshot_mount_unmount | 17.353 | 18.998 · 16.234 · 17.2 · 17.704 · 17.353 | 1.49–1.49 | statements 44, vm_steps 1311, fullscan_steps 80, sorts 2, returned_rows 140 |
| oneshot_commit | 73.53 | 73.53 · 70.521 · 74.237 · 63.565 · 79.571 | 1.49–1.49 | statements 140, vm_steps 9404, fullscan_steps 80, sorts 2, returned_rows 927 |
| oneshot_exec | — |  ·  ·  ·  ·  | 1.49–1.49 | statements 0, vm_steps 0, fullscan_steps 0, sorts 0, returned_rows 0 |

### D. Storage internals

From the sealed file at snapshot r016: 62,393 pages of 4,096 B, 0 free · Commits 14,874 · Branches 232 · Layers 20 · compression 4.00× (canonical ÷ stored).

| Role | Objects | Canonical bytes |
| --- | --- | --- |
| 1 | 55,371 | 311.2 MiB |
| 2 | 25,187 | 266.2 MiB |
| 3 | 11,774 | 1.6 MiB |
| 4 | 19 | 4.4 KiB |
| 5 | 11,718 | 1.2 MiB |
| 6 | 23,350 | 125.7 MiB |
| 7 | 31,242 | 7.1 MiB |
| 8 | 52 | 15.3 KiB |
| 9 | 21,278 | 28.5 MiB |
| 10 | 16,358 | 2.0 MiB |
| 11 | 12,822 | 1.7 MiB |
| 13 | 1,552 | 125.5 KiB |

| Pack domain | Packs | Bytes |
| --- | --- | --- |
| 0 | 15,005 | 23.4 MiB |
| 1 | 25,994 | 162.8 MiB |

| Table or index | Pages | Bytes | Unused |
| --- | --- | --- | --- |
| pack | 50,888 | 198.8 MiB | 10.3 MiB |
| inode_value | 5,091 | 19.9 MiB | 519.1 KiB |
| object_location | 2,831 | 11.1 MiB | 1.1 MiB |
| binding_hint | 1,281 | 5.0 MiB | 501.3 KiB |
| commit | 1,143 | 4.5 MiB | 767.4 KiB |
| commit_lineage | 321 | 1.3 MiB | 152.4 KiB |
| commit_runs | 320 | 1.3 MiB | 192.5 KiB |
| commit_identity | 227 | 908.0 KiB | 91.9 KiB |
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

**Time 317.5 s** (tooling): play 96.9 · consolidate 101.7 · verify 89.3 · probes 18.2 · tests 0.0 · seal + snapshot 3.2 · report 8.2

317.53 s tooling: prepare 1.83 · play 95.03 · consolidate 101.68 · verify 76.84 (diff_commits + full compareTree) · version walk 12.46 · probes 18.20 · metrics 1.14 · seal 1.34 · sealed figures 0.84 · snapshot copy 1.07 · report 0.24

### F. Attempts

| # | Binary | Started | Result | Reason |
| --- | --- | --- | --- | --- |
| 1 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T13:32:20.936Z | stop | Correctness: tree 0 missing, 0 extra, 0 content, 0 mode; steps 3645/3646; conflicts 3/3; tests 0/0 equal to native; Speed: branch.diff_commits >64 entries · uncontended: 10.95× baseline (no phase); Scaling: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Counters: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 32.1 MiB; median not judged: 1 of 3 earlier ranges; Git: git status not clean at the checkpoint |
| 2 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T13:53:08.197Z | stop | Speed: branch.diff_commits >64 entries · uncontended: 16.98× baseline (no phase); Scaling: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 40.0 MiB; median not judged: 1 of 3 earlier ranges; Snapshot time: 973 ms for 220.9 MiB new; size exponent not judged (2 snapshots); Node proofs: 20 pass · 1 stop · 0 NOT_RUN over 5 points: lead repair P2 |
| 3 | 44ac6c91abf6c2e36775192a3993343789667157c914d4e208fc3ffa75d762a3 | 2026-10-19T14:03:07.267Z | watch | Speed: branch.diff_commits >64 entries · uncontended: 15.95× baseline (no phase); Scaling: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); also not judged: oneshot_exec: 2 of 3 points of probe version 1; Counters: insufficient same-binary points: 2 of 3 (daemon 44ac6c91abf6); Contended work: not judged: no contended class has 3 ranges of 5+ calls; Range growth: 39.8 MiB; median not judged: 1 of 3 earlier ranges; Snapshot time: 1017 ms for 215.7 MiB new; size exponent not judged (2 snapshots) |

### G. Evidence

- `~/lfs-history/metrics/range-016.a1.json`
- `~/lfs-history/metrics/range-016.a2.json`
- `~/lfs-history/metrics/range-016.a3.json`
- trace `~/lfs-history/runs/p3-main-f/trace/range-016.a3.jsonl` · runner log `~/lfs-history/runs/p3-main-f/play.log` · snapshot manifest `/Users/yifanxu/lfs-history/snapshots/range-016.p3-main-f.json`

### H. Git internals

Seed pack: — objects, — (counted apart from lane objects).

| Lane | Objects | Index bytes |
| --- | --- | --- |
| r016-2-packages-sdk | 697 | 173.7 KiB |
| r016-1-root | 408 | 163.4 KiB |
| r016-3-packages-prompt | 817 | 166.1 KiB |
| r016-4-docs-rfc | 846 | 167.3 KiB |

| git command | ms | lstat |
| --- | --- | --- |
| `git status --porcelain` | 290.0 | 1,362 |
| `git diff --stat` | 34.0 | 1,353 |
| `git add -f` | 24.0 | — |
| `git rm --cached` | 5.0 | — |
| `git commit` | 35.0 | 1,359 |

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
| lead | repair | P1 | n/a | folded into P6 | ✓ |
| lead | repair | P2 | pass | exit 0 | ✓ |
| lead | repair | P3 | n/a | a repair, not a no-op | ✓ |
| lead | repair | P4 | n/a | folded into P6 | ✓ |
| lead | repair | P5 | pass | 30 files | ✓ |
| lead | repair | P6 | pass | P1 pass, P4 pass (385 emitted files, exit 0) | ✓ |

### J. Conflicts by path class

No conflicts by path recorded.
