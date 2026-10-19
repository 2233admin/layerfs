# #352 — Range 15 baseline (P3)

> **Status:** Current, 2026-10-19. Owner: "range 15 is our new baseline".
> Ranges 16 and later, and every fix, are judged against range 15 attempt 4
> (run `p3-main-d`). The figures below are copied from
> [range-015.md](ranges/range-015.md); that report and its metrics file win
> over this summary. The gates are unchanged: SPEC.md §5 and `gates.mjs` still
> decide each verdict, against the P3 re-baseline file named below.

## 1. Identity

| Item | Value |
| --- | --- |
| Attempt | range 15 a4, run `p3-main-d`, verdict **watch**, terminal under D2 (liaison under owner delegation, 2026-10-19) |
| Harness | `4b725d5229` (played); reports on `1bcd2ef703` (main) |
| Daemon | `44ac6c91abf6…` at `core/target/issue352f/daemon-44ac6c91/layerfs-daemon` |
| SDK addon | `77597adb599e…` at `core/target/issue352f/sdk-linux-77597adb/layerfs.node` |
| Product tree | built from main's product tree: `c31c249ca6`'s product equals `60bfb0b856`'s. Production LOC 103,058 |
| Image | `sha256:d3773b4eac6a…`, tag `layerfs-352-runtime:node24` (re-tag by id before each command, LESSONS §3) |
| Plan | `~/lfs-history/plan-r1/` (plan v2, NODE_RULE §3 inputs rule R1); the frozen `~/lfs-history/plan/` serves ranges 0–14 |
| Native oracle | `~/lfs-history/oracle-r1/` |
| Gate baseline | `~/lfs-history/metrics/baseline-44ac6c91abf6-77597adb599e-p3.json` (101 op classes, run `rb-p3-44ac6c91-77597adb-d` ranges 2–4) |
| Snapshot | r015 of `p3-main-d`: manifest `~/lfs-history/snapshots/range-015.p3-main-d.json`, 217,890,816 bytes, dsh `b4ec4060a`, tree `ca5fdcb44dd2`, depth 12,851 Commits |
| Run path | `~/lfs-history/runs/p3-main-d/` (trace `trace/range-015.a4.jsonl`, `play.log`); metrics `~/lfs-history/metrics/range-015.a4.json` |
| pnpm store | Docker volume `layerfs-issue352-pnpm-store`, read-only, every intermediate lockfile fetched and verified (RESULTS 2026-10-19) |
| Profile | P3: git on (F-031), Node on (installs, `tsc -b`, vitest), 4-Sandbox pool, builds `-j 6`, Disposable Store |
| Lister | v6 (`b966ddb720`): installed results compared, pnpm state files counted only |
| Repair | clean relink of every `node_modules` on the merged tree, LayerFS and native alike (`4b725d5229`) |

A comparison on any other binary, image, plan, oracle, lister or repair is a
different series. Say so; never read it as a regression or a gain against
this file.

## 2. Speed

Daemon `44ac6c91abf6`, p50 / p95, ratio to the gate baseline in brackets.

**Headline (dominant size class):**

| write | read | list | Commit (one-shot) | mount | merge | exec |
| --- | --- | --- | --- | --- | --- | --- |
| 7.2 / 12.7 ms (0.99×) | 2.1 / 3.1 ms (1.11×) | 2.4 / 4.4 ms (1.32×) | 20.5 / 83.8 ms (1.21×) | 9.4 / 14.0 ms (0.99×) | 1,897 / 1,897 ms (3.73×, n = 2) | 36.6 / 853 ms |

- **Commit cost:** 6.07 ms per changed file.
- **One-shot Workspace** (mount + exec + Commit + unmount): **531 ms p50** over 231.
- **Unmount:** 8.8 / 14.0 ms.

**Main uncontended classes** (Appendix B):

| Class | n | p50 ms | p95 ms | ×base p50 | ×base p95 |
| --- | --- | --- | --- | --- | --- |
| fs.write ≤1 KiB | 267 | 5.90 | 8.77 | 1.01× | 0.97× |
| fs.write ≤8 KiB | 633 | 6.21 | 9.48 | 0.99× | 0.92× |
| fs.write ≤64 KiB | 382 | 7.29 | 11.40 | 1.04× | 1.16× |
| fs.read ≤8 KiB | 28 | 1.99 | 2.81 | 1.11× | 0.98× |
| fs.list 5–16 entries | 14 | 2.14 | 2.93 | 1.32× | 1.43× |
| sandbox.mount | 130 | 9.12 | 14.80 | 0.99× | 1.07× |
| sandbox.unmount | 150 | 8.97 | 14.18 | 0.99× | 1.02× |
| sandbox.commit 0 files · Committed | 71 | 27.67 | 60.10 | 1.21× | 1.53× |
| sandbox.commit 0 files · UpToDate | 29 | 3.33 | 4.29 | 1.00× | 0.92× |
| sandbox.commit 1 file · Committed | 16 | 8.34 | 13.79 | 1.10× | 1.32× |
| sandbox.commit 5–16 files · Committed | 9 | 19.21 | 35.54 | 1.70× | 3.14× |
| sandbox.commit — · Committed (install, repair) | 13 | 51.32 | 11,435 | 0.74× | 165.79× (not judged, §4) |
| sandbox.exec 0 files | 145 | 34.90 | 597.58 | 1.29× | 2.32× |
| sandbox.exec 5–16 files | 75 | 35.60 | 61.77 | 0.68× | 0.86× |
| sandbox.exec — (Node, git batches) | 34 | 307.69 | 10,840 | 0.61× | 2.28× |
| branch.diff_commits >64 entries | 258 | 15.03 | 29.28 | 0.87× | 1.14× |
| branch.diff_branches >64 entries | 18 | 15.24 | 264.21 | 0.99× | 5.27× |
| branch.publish | 1 | 4.24 | 4.24 | 1.54× | 1.54× (thin class) |

**Git and Node against native** (same tree id, one sample each):

| Operation | LayerFS p50 / p95 | Native p50 / p95 | ÷ native (p50) |
| --- | --- | --- | --- |
| pnpm install (incremental) | 3,048 ms | 1,942 ms | 1.57× |
| pnpm refresh | 1,708 ms | 905 ms | 1.89× |
| `tsc -b` | 4,718 / 5,559 ms | 4,028 / 5,963 ms | 1.17× |
| vitest | 8,390 ms | 5,978 ms | 1.40× |
| git status (cold / steady) | 243 ms / 236 ms (p95 469) | — | — |
| git add / lane commit | 19.0 / 28.0 ms p50 | — | — |
| lead writes main (191 commits) / repack | 6,426 ms / 4,206 ms | — | — |

Git has no native row in P3 yet: the replay times git only in LayerFS.

**Stage times** (tooling, 253.7 s): prepare 1.59 · play 127.92 · consolidate
81.57 · verify 9.09 · version walk 8.24 · probes 15.57 · metrics 0.89 · seal
1.17 · sealed figures 0.40 · snapshot copy 0.86 · report 0.21. Time split:
play 127.9 s, git 98.5 s, Node 189.1 s, verify 9.1 s.

**Final command: 121 s**, under the 295 s alarm declared for range 15's final
command only. It covers consolidate (lead git 14.2 s for 191 commits), the
clean-relink repair, build and tests, verify and probes. The lanes played in
128 s through cuts at 20 and 41.1, each command under 118 s.

**Clean-relink repair:** exec 26.1 s, Commit 11.8 s, 94,536 inodes rewritten,
646,831 B new stored, 625,489 B new metadata; native install 2.60 s.

## 3. Storage

**3a. Overview**

| Measure | Value |
| --- | --- |
| Latest version (tracked / `node_modules` / build / `.git`) | 421.8 MiB (9.3 / 390.9 / 8.3 / 13.3 MiB) |
| Files / directories / symlinks | 40,504 / 6,733 / 2,569 |
| **Store on disk** (sealed) | **207.8 MiB** (+161.3 MiB this range) |
| **Space amplification** (total · tracked) | **0.49×** · tracked 3.26× |
| Stored per byte changed (content / metadata) | 23.34 (0.33 / 0.01) |
| **Stored per Commit** | 60.3 KiB (r014: 2.8 KiB) |
| Metadata share | 0.31 (this range 0.17) |
| History: Commits / Layers / Branches | 12,851 / 10 / 67 |
| Range growth | 164.1 MiB |
| Projection at range 202 | 24.55 GiB (Commits 23.11 GiB, installs 1.12 GiB, build 119.4 MiB); disk 35% of budget |
| Snapshot | 207.8 MiB new blocks, 817 ms |

**3b. By part**

| Part | Bytes | × latest version |
| --- | --- | --- |
| Content | 143.3 MiB | 0.34 |
| Metadata | 19.6 MiB | 0.05 |
| **Index rows** | **30.5 MiB** | 0.07 |
| **Waste** | **14.2 MiB** | 0.03 |
| Other | 260.0 KiB | 0.00 |
| Total | 207.8 MiB | 0.49 |

**3c. By source**

| Source | Latest | Stored (content + metadata) | Amplification | Stored per byte changed |
| --- | --- | --- | --- | --- |
| Tracked | 9.3 MiB | 30.4 MiB (13.2 + 17.2) | 3.26× | 0.46 |
| `node_modules` | 390.9 MiB | 103.6 MiB (101.9 + 1.7) | 0.27× | 0.27 |
| Build output | 8.3 MiB | 2.2 MiB | 0.27× | 0.56 |
| `.git` | 13.3 MiB | 26.7 MiB (26.0 + 0.7) | 2.00× | — |
| Shared (index rows + waste + other) | — | 44.9 MiB | — | — |

**3d–3e. Inside and P3 ratios**

| Measure | Value |
| --- | --- |
| Whole files / chunks / directories / inodes | 49,699 / 24,066 / 19,848 / 73,754; 65% of whole files and 57% of directories stored as delta |
| Delta at the depth cap | 0.46% (gate 0.0046, budget 0.4304) |
| `node_modules` reinstall | 0.037× the raw bytes of 152 changed packages |
| Directory share of new bytes | 0.171 |
| **Content ratio** (stored content ÷ distinct new content) | **0.29×** (watch > 2×, act > 5×) |
| **Churn ratio** (stored ÷ bytes Node churn rewrote) | **0.26** (105.8 MiB for 409.4 MiB) |
| Native-disk equivalence | 0.16 (3 lanes × 421.8 MiB) |
| Store growth per git commit (index / loose / pack) | 0.5 / 7.5 / 10.4 KiB over 304 git commits |
| Metadata per file / per Commit | 0.1 KiB / 1.9 KiB |

## 4. Correctness

| Check | Value |
| --- | --- |
| Tree vs git | 1,332 tracked files match (blob id and mode) |
| Steps | 3,521 / 3,521 as planned |
| Conflicts | 3 / 3 planned hit, 0 unplanned |
| Unit tests | 30 / 30 equal to native |
| Node proofs | P1–P6: 20 pass, 0 stop, 0 NOT_RUN over 5 points (3 lane ends, lead initial, lead repair); the repair's P6 rewrote 94,536 files |
| Installed tree | 1,450 package groups equal to native; 252 shims and 2,563 links equal by target; 3 state files counted only |
| Git | HEAD = checkpoint `b4ec4060a`, 191 commits for 191 dsh commits, status clean, 0 read back, 0 guard violations |
| Resilience / health | Busy 0, EAGAIN 0, refused unmount 0; 0 Workspaces open, 0 overlay files left |
| Disk / wall projection | 0.35 / 0.84 |

## 5. Known open items (not regressions)

Report these by id. A later range that shows them has not regressed.

| Item | State | What a later range shows |
| --- | --- | --- |
| **F-056** (BUGS.md) | OPEN, owner decision (design 8 drops mtimes of rebuilt identical outputs) | `tsc -b` after a remount rebuilds `vendor/*`; natively 77 of 77 projects are up to date |
| **F-057** (BUGS.md) | OPEN, product fix owed | Newest-wins over pnpm's install state lets an incremental repair keep stale hoisting (a3: `@cordisjs/plugin-loader` → `vendor/loader`). Hidden while the repair is a clean relink |
| Install-state merge question | OPEN design observation (RESULTS) | Same root as F-057: merge install state differently, or always relink |
| Clean-relink repair and its cost | Owner decision 2026-10-19, workload | Repair exec ~26 s, Commit ~12 s, ~95k inodes rewritten per merged range; the final command is ~23 s longer than an incremental repair |
| Link-unit gate question | **CLOSED**, owner decision 2026-10-19 ("proceed with the fix") | Raw change under 1 MiB is judged by absolute stored bytes (≤ 1 MiB pass, watch over 1 MiB, optimize over 16 MiB); larger reinstalls keep the ratio. r017.a1 (638,855 B for 75,810 B raw) passes in absolute mode |
| Mount-path refresh cost | OPEN design observation (RESULTS) | A new mount path per mount makes pnpm skip its up-to-date shortcut: LayerFS refresh 1.7–1.8 s against native 0.9 s at a moved path and 0.5 s at a fixed one |
| Watch: `sandbox.commit — · Committed` | Not judged: baseline class 3/3/3 calls, minimum 5 | p95 is the clean-relink Commit (11,435 ms, 165.79×); p50 51 ms (0.74×) |
| Watch: thin classes (`branch.publish` 1.54×, merge 3.73× on n = 2, small `fs.glob` classes ~2×) | Not judged below 5 calls per range | Judge them only when a class has 5+ calls in 3 ranges |
| Watch: Scaling, Counters, Contended work | Need 3 same-binary ranges | Range 15 is point 1 of 3 on `44ac6c91`; ranges 16 and 17 make them judgeable |
| Watch: Range growth, Snapshot time | No earlier range or snapshot on this binary | Judgeable from range 18 (3 earlier ranges) |

## 6. How to compare

**Serious regression** (report it, do not explain it away):

- any Correctness or Node proof stop: tree, steps, conflicts, tests, P1–P6, git;
- a speed class over its act band on **uncontended** calls (SPEC §5: pass
  ≤ 1.2×, watch 1.2–1.5×, act > 1.5×), judged by `gates.mjs` with its minimum
  call counts, on the same binary;
- stored per Commit or index rows growing faster than the work (files changed,
  Commits, tree size), or content ratio / churn ratio moving toward their watch
  bands;
- a new F-number.

**Expected drift** (record it, no finding):

- tree growth: latest version, files, `node_modules` size and whole-tree probes
  growing with dsh (gates fit those per tree byte);
- first-of-series rows: the not-judged rows of §5 until 3 same-binary points
  exist, and a range's first install or first relink in a class;
- a different series (§1): a new binary, image, plan, oracle, lister or repair
  starts its own points.

Contended classes are reported, not judged against this file (Store
concurrency model: optimize the uncontended call).

## 7. Optimization hot spots (context)

A separate session works on these. They explain where range 15's time goes;
they are not findings against this baseline.

1. **Merge with `node_modules`.** `branch.merge` with a new Commit: 1,897 ms
   p50, 106,913 statements, 8.77 M VM steps and 13,332 full-scan steps;
   171 newest-wins picks in 3 merges, 160 under `node_modules`.
2. **The relink Commit.** The clean relink rewrites ~94.5k inodes: exec 26.1 s,
   Commit 11.8 s, 0.6 MB of new metadata, against 1.57 s / 58 ms for an
   incremental repair.
3. **pnpm on FUSE.** Install 1.57× and refresh 1.89× native; part of the
   refresh is the mount-path effect of §5.
