# #352 — Ranges 21–29 against range 15

> **Status:** Current summary, 2026-10-20, written from the committed range
> reports ([range-021](ranges/range-021.md) … [range-029](ranges/range-029.md)),
> fix records 048 and 050–054 and the RESULTS decision log at `efcc2ddc6b`.
> Nothing was rerun. Range 30 and the final 21–30 summary belong to the ranges
> session and RESULTS.md. Where a field is not in the reports it reads "not recorded".

The baseline is range 15's terminal attempt ([BASELINE_R15.md](BASELINE_R15.md)).
Ranges 21–29 ran in phase P3 (git and Node on) in the owner's fast mode: slowness
and storage rows are recorded, not stops, and time rows have the 5 ms absolute
floor. One sample per attempt. Every terminal attempt matched git at its
checkpoint, and its Node proofs ended with 0 stop and 0 NOT_RUN. No terminal
attempt stopped on correctness or a Node proof, and no stop in 21–29 was a
LayerFS product defect.

**Binaries.** Ranges 21–22 ran on the range-15 binaries: daemon `44ac6c91`,
addon `77597adb`. From range 23 the run used binaries built from main
`3ef00d32e5` (owner, 2026-10-20), which carries all #364 fixes: daemon
`45a196ef`, addon `4668012e`, built at `79758e8c12`. The image `d3773b4e` and
SDK JS `be717af4` did not change. The switch was made in place on run
`p3-main-r` at the 22/23 boundary. The speed baseline stays on r15's binary
without a re-baseline, so from r23 the Speed rows read "not judged" and the
Scaling and Counters gates restart their 3 same-binary points.

## 1. Per range

| Range | Attempts | Terminal verdict, how it ended | Stop causes by attempt | Binaries | LayerFS Commits | New stored | Stored per Commit | Index rows (total) | Repair install / build s | Final command s (repair + verify + finish) | Verify s (stage / final step) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 (a4, baseline) | 4 | watch | — | `44ac6c91` | 2,303 | 164.1 MiB | 60.3 KiB | 30.5 MiB | 26.1 / 7.6 | 121 (one command) | 9.1 / not recorded |
| 21 | 2 | optimize (a2): advanced on optimize, #364 item 4 | a1 stop: oracle preparation (pnpm store lacked the lockfile versions, fix 048); a2 none | `44ac6c91` | 1,452 | 35.0 MiB | 22.4 KiB | 92.0 MiB | 40.7 / 12.2 | 245 (109 + 96 + 40) | 92.9 / 96 |
| 22 | 1 | stop verdict (a1), terminal under the liaison's ruling: advanced on optimize, #364 item 4 | a1 stop row: Disk projection 1.4, an environment cause (another session's cargo target). Fix 051 (harness) was caught by native first before the attempt | `44ac6c91` | 2,288 | 40.5 MiB | 17.4 KiB | not recorded (live Store; index + waste + other 132.4 MiB) | 33.6 / 12.6 | 231 (101 + 94 + 36) | 90.6 / 94 |
| 23 | 1 | watch (a1) | none | `45a196ef` | 1,460 | 67.8 MiB | 43.1 KiB | 116.5 MiB | 30.6 / 12.5 | 149 (95 + 13 + 41) | 9.9 / 13 |
| 24 | 1 | watch (a1) | none | `45a196ef` | 1,240 | 30.5 MiB | 25.1 KiB | not recorded (live; 159.4 MiB together) | 33.6 / 14.5 | 158 (110 + 13 + 35) | 8.3 / 13 |
| 25 | 1 | optimize (a1), terminal under the fast-mode ruling (counter row recorded) | none (optimize row: Counters `glob_tree.statements`) | `45a196ef` | 1,801 | 97.3 MiB | 51.4 KiB | 137.8 MiB | 40.2 / 14.7 | 167 (111 + 14 + 42) | 10.1 / 14 |
| 26 | 1 | optimize (a1), terminal under the fast-mode ruling (counter row recorded) | none (optimize row: Counters `glob_tree.vm_steps`) | `45a196ef` | 2,412 | 43.5 MiB | 17.8 KiB | not recorded (live; 186.2 MiB together) | 31.1 / 18.6 | 165 (117 + 12 + 36) | 8.9 / 12 |
| 27 | 2 | watch (a2, fork of r25's snapshot, r26 replayed in fast mode as setup) | a1 stop: harness (vitest report cut by the exec stdout cap; native HOME differed), fix 052; a2 none | `45a196ef` | 654 | 22.7 MiB | 54.3 KiB | 159.4 MiB | 31.8 / 15.8 | 149 (93 + 15 + 41) | 11.1 / 15 |
| 28 | 2 | watch (a2, fork of `p3-main-s`'s r027 snapshot) | a1 stop: oracle (tsdown CSS-module class maps in no fixed order), fix 053; a2 none | `45a196ef` | 1,919 | 53.6 MiB | 26.3 KiB | 171.5 MiB | 33.9 / 17.8 | 164 (104 + 16 + 44) | 12.1 / 16 |
| 29 | 1 | watch (a1), re-judged after fix 054 on retained state | a1 first judged stop: oracle (the native chain gave every file a new time), fix 054; watch after the re-judge | `45a196ef` | 930 | 37.1 MiB | 40.1 KiB | not recorded (live; 226.7 MiB together) | 36.2 / 19.1 | 161 (110 + 12 + 39) | 8.1 / 12 |

- "New stored" is the report's "Added this range" and "Stored per Commit" is the
  report's own row. The first is not the second times the Commits.
- The index-row split exists only for sealed ranges. On a live Store (r22, r24,
  r26, r29) the report gives index rows, waste and other as one figure.
- The final-command total is the sum of the three steps in the lead's note. Only
  r21 states a total (245 s). From step 0 the alarms were repair 130, verify 115
  and finish 50 s. From range 25 they were repair 160, verify 70 and finish 65 s.
  Both total 295 s.
- "Verify (stage)" is the report's time split (`diff_commits`, plus a full
  `compareTree` on sealed ranges). "Final step" is the verify step of the final
  command.
- Range 15's attempt count, final command and repair figures are from RESULTS.md
  and LESSONS S15/S17.

## 2. Uncontended p50 in ms (calls)

The same classes as the 16–20 summary. `sandbox.commit` is the
"0 files · Committed" class. ‖ marks the switch to main's binaries before r23.

| Class | r15 | r21 | r22 | ‖ r23 | r24 | r25 | r26 | r27 | r28 | r29 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fs.write ≤1 KiB | 5.9 (267) | 9.4 (64) | 7.0 (114) | 7.6 (158) | 7.8 (69) | 9.7 (57) | 6.5 (171) | 7.8 (73) | 6.6 (160) | 9.4 (50) |
| fs.write ≤8 KiB | 6.2 (633) | 8.0 (328) | 7.1 (374) | 7.3 (321) | 7.4 (255) | 8.2 (291) | 6.8 (678) | 8.1 (199) | 6.9 (446) | 8.4 (239) |
| fs.read ≤8 KiB | 2.0 (28) | 2.2 (28) | 1.9 (24) | 2.3 (28) | 2.7 (24) | 3.0 (20) | 2.4 (39) | 2.7 (14) | 2.4 (39) | 2.6 (36) |
| sandbox.mount | 9.1 (130) | 11.7 (171) | 10.5 (105) | 9.8 (129) | 11.0 (104) | 11.1 (112) | 10.0 (140) | 10.0 (104) | 10.0 (154) | 10.2 (279) |
| sandbox.commit | 27.7 (71) | 28.8 (92) | 31.0 (52) | 22.5 (71) | 25.4 (64) | 26.8 (53) | 33.5 (74) | 21.4 (61) | 24.1 (83) | 19.1 (156) |
| branch.diff_commits >64 entries | 15.0 (258) | 280.3 (320) | 271.4 (322) | 20.5 (325) | 21.7 (295) | 19.8 (297) | 22.2 (304) | 22.0 (301) | 20.1 (327) | 18.7 (373) |

## 3. Speed

- **The switch at r23 removed the `diff_commits` slowdown.** The checkpoint
  `diff_commits` p50 fell from 271–280 ms (r21–r22) to 18.7–22.2 ms (r23–r29).
  The verify stage fell from 92.9 and 90.6 s to 8.1–12.1 s (r15: 9.1 s), and the final
  command's verify step from 96 and 94 s to 12–16 s. The `diff_commits`
  optimize row, which had ended r18–r22, did not return from r23 on.
- **Merge** (the report's dominant-class p50): 1,007 ms (r21) and 1,655 ms
  (r22), then 229–456 ms in r23–r29. Range 15 was 1,897 ms.
- **One-shot Commit** (Speed table p50): 22.2 and 25.9 ms in r21–r22, then
  16.4–23.3 ms in r23–r29. Range 15 was 20.5 ms. The uncontended
  "0 files · Committed" class above ranges from 19.1 to 33.5 ms with no trend.
- **Final command:** 245 and 231 s in r21–r22, then 149–167 s in r23–r29.
  Most of the drop is the verify step. The repair build rose from 12.2 s (r21) to
  19.1 s (r29) on both binaries. The reports do not attribute the rise.
- **Classes over r15 by more than 5 ms.** In r21–r22 there is one,
  `diff_commits`, at 256–265 ms over (#364 item 4, which the switch fixed). In
  r23–r29 there are two, on main's binaries, which the reports mark "not judged"
  against r15's baseline:
  - `diff_commits` is 5.5 ms over at r23, 6.6 at r24, 7.2 at r26, 6.9 at r27 and
    5.1 at r28. It is under the floor at r25 (4.8) and r29 (3.7). These are
    1.2–1.5× on a 15 ms call.
  - `sandbox.commit` (0 files, Committed) is 5.9 ms over at r26 (33.5 against
    27.7). Every other range is under the floor, and r23, r27, r28 and r29 are
    faster than r15.
  - Every other class is at most 3.8 ms slower than r15 (`fs.write` ≤1 KiB at r25).
- **Control probe** (range 15 Store against the range's Store, same binaries):
  passed at every terminal attempt, r21 through r29.

## 4. Storage

| Range | Store on disk | `.git` stored (share of the Store) | Content ratio | Churn ratio | Disk projection (budget at range 202) | Projection at range 202 |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 207.8 MiB | 26.7 MiB (12.8%) | 0.29× | 0.258 | not recorded | not recorded |
| 20 | 374.1 MiB | 87.5 MiB (23.4%) | 0.18× | 0.0008 | not recorded | not recorded |
| 21 | 406.1 MiB | 102.4 MiB (25.2%) | 0.24× | 0.00 | 0.96 (96%) | 9.17 GiB |
| 22 | 444.9 MiB (live) | 118.4 MiB (26.6%) | 0.20× | 0.00 | **1.4 (140%)**, stop row | 7.12 GiB |
| 23 | 506.8 MiB | 131.3 MiB (25.9%) | 0.33× | 0.02 | 0.7 (70%) | 16.17 GiB |
| 24 | 537.2 MiB (live) | 143.2 MiB (26.7%) | 0.21× | 0.00 | 0.37 (37%) | 9.30 GiB |
| 25 | 627.9 MiB | 196.8 MiB (31.3%) | 0.59× | 0.00 | 0.4 (40%) | 18.48 GiB |
| 26 | 669.9 MiB (live) | 216.3 MiB (32.3%) | 0.21× | 0.00 | 0.42 (42%) | 7.27 GiB |
| 27 | 688.0 MiB | 203.2 MiB (29.5%) | 0.19× | 0.00 | 0.43 (43%) | 12.42 GiB |
| 28 | 737.6 MiB | 220.4 MiB (29.9%) | 0.24× | 0.01 | 0.43 (43%) | 10.29 GiB |
| 29 | 774.1 MiB (live) | 232.7 MiB (30.1%) | 0.21× | 0.00 | 0.43 (43%) | 13.95 GiB |

The `.git` share is `.git`'s stored content plus metadata (report §3c) divided
by the Store on disk. The 15 and 20 rows are from their reports.

- **Stored per Commit** ranged from 17.4 to 54.3 KiB. Range 15 was 60.3 KiB and
  ranges 16–20 were 19–40 KiB. The high ranges, as recorded:
  - r23 (43.1 KiB): an install. `node_modules` grew 45.3 MiB in the latest
    version and 33.6 MiB was added, with churn 0.02.
  - r25 (51.4 KiB): `.git` added 53.6 MiB, and the tracked source added
    25.2 MiB for 1.0 MiB changed (25.05 stored per byte changed). The reports do
    not give a cause.
  - r27 (54.3 KiB): 654 Commits, the fewest in 21–29.
  - r29 (40.1 KiB): 930 Commits.
- **Content ratio** stayed between 0.19× and 0.59×, all under the 2× watch line.
  r25 was highest. **Churn ratio** stayed at 0.00–0.02.
- **Index rows** grew from 81.5 MiB at r20 to 171.5 MiB at r28, the last sealed
  range. At r29 the live figure for index rows, waste and other together is
  226.7 MiB. Between sealed points the growth is +10.6 MiB (r21),
  +24.5 MiB (r22–r23), +21.3 MiB (r24–r25), +21.6 MiB (r26–r27) and
  +12.1 MiB (r28). That is about 6.5–7.4 KiB per LayerFS Commit, which is below
  r19–r20's 10.2–10.6 KiB and above r16's 5.9 KiB. Index rows were 0.16–0.24 of
  the latest version over 21–28. It is a watch fact, not a gate: no Storage gate
  tripped. These per-Commit figures are this summary's arithmetic (MiB added ÷
  Commits over the interval), not a report row.
- **`.git`'s share** rose from 25.2% (r21) to 30–32% from r25 on. Its stored
  amplification was 3.56–4.55× its latest version. The r25 step is the 53.6 MiB
  added that range.
- **Disk projection.** r22's stop row (1.4, 140% of budget) had an environment
  cause: the Docker VM's free space fell 16 GB after r21, because another
  session's `layerfs-issue364-cargo-target` volume grew to 78 GB. This run's
  data was about 3 GB. The liaison ruled that disk-projection rows are recorded
  in fast mode, and that the run stops if Docker free space falls under about
  20 GB. The projection then read 0.7 at r23 and 0.37–0.43 from r24 on. The
  reports do not record what freed the space.

## 5. Correctness

Every checkpoint matched git (tracked files by blob id and mode). The terminal
attempts' Node proofs had 0 stop and 0 NOT_RUN. Each stop below was found in
the harness, the oracle or its preparation. **None was a LayerFS product defect.**
Daemon, addon and Store format did not change in any of the fixes.

| Fix | Range, attempt | What stopped | Cause | Fix | Kind |
| --- | --- | --- | --- | --- | --- |
| [048](fixes/048-r021-a1-store-fetch-generation.md) | r21 a1 | Node proofs, `r021-1-root.end` P1 and P2 ("exit 0, native 1") | Ranges 21–30's intermediate lockfile versions had never been fetched into the pnpm store. The native install, offline, failed pnpm's release-age check. The Sandbox verified online and passed. The oracle cache key did not name the store | Fetched 74 versions. `cachedOracle`'s key carries the store's fetch generation. The re-judge on retained state still differed on P2's verification line, so a1 stays a stop and a2 replayed on the fetched store | Preparation and oracle |
| [050](fixes/050-f057-units-diagnostic.md) | none in 21–29 (a range-15 diagnostic) | — | A one-sample diagnostic of F-057 merge units on range 15's `lead.repair`, on main `3af7a4e96d` | Units fixed the stale `@cordisjs/plugin-loader` hoist (P1 and P6 pass). The incremental repair took 2.78 s install and 9.69 s build, against 26.1 / 7.6 s for r15 a4's clean relink. The diagnostic flag `diagUnits` is off on the main run path | Diagnostic only |
| [051](fixes/051-r022-native-first-tsbuildinfo.md) | before r22 a1 (native first) | `calibrate --repair`: NATIVE REFERENCE BROKEN, build exit 1 | The F-059 repair clean missed cli-demo's `tsBuildInfoFile` under the root's `.typecheck/` | The clean removes every `*.tsbuildinfo` in the tree, outside `.git` and `node_modules`. No attempt was lost | Harness workload |
| [052](fixes/052-r027-a1-vitest-report-and-home.md) | r27 a1 | `r027-1-root.end` P5 NOT_RUN; `r027-3-docs-rfc.end` P5 stop | (1) The 204-file vitest JSON report passed the Sandbox exec's stdout cap (about 1 MiB) and arrived cut. (2) `fs-sandbox.spec.ts` uses `homedir()`. The SDK exec sets `HOME=/tmp`, a granted path, while native ran with `HOME=/root`. LayerFS correctly allowed the write | vitest runs with `HOME=/tmp` on both sides. The LayerFS side writes the report to a file under `/tmp` and prints a compact form. a2 ran on a fork of r25's snapshot, because point 1's results were lost and no re-judge was allowed | Harness |
| [053](fixes/053-r028-a1-css-module-map-order.md) | r28 a1 | `lead.repair` P6 stop; P4 found 4 emitted `packages/client/ui-*/lib/client.js` differing | tsdown writes CSS-module class maps in no fixed order. A second native build gave a third set. Read back from the Store, LayerFS's files equal native once the maps are sorted | P4's emitted id sorts runs of `"key": "value"` lines on both sides. `oracleKey` covers the tail's emitted-id and vitest commands | Oracle |
| [054](fixes/054-r029-a1-native-unchanged-file-times.md) | r29 a1 | `r029-2-root.end` P4, tsc exit 1 on LayerFS against native 2 | The native chain extracted each tree whole with new times, so `tsc -b` rebuilt packages that a checkout, like LayerFS, leaves up to date | `SYNC_TREE` copies in only files that differ in content, mode or link target (`CHAIN_VERSION` 4). A first git-diff version (`CHAIN_VERSION` 3) broke the repair's native install and was superseded. The re-judge on retained state gave 19 pass, 0 stop | Oracle |

Fixes 051 and 052 were first numbered 049 and 050 while ranges 22 and 27
played. They were renumbered on 2026-10-20 because main's F-057 records took
049 and 050.

## 6. Harness

**Step 0** (`2764669229`, before range 21; harness only, SCRIPTS.md §15):

- **Fail loud.** Every native replay proves that each state, snapshot, clean,
  reconcile removal, lane capture and merge, build and test ran. A point whose
  reference did not run is NOT_RUN, with the reason.
- **Native first.** `calibrate` runs the predicted repair natively after the
  points. A broken reference exits 4 before any LayerFS attempt.
- **Re-judge on retained state** (`--rejudge "fix NNN"`). The headline says so,
  and the earlier results stay in the metrics.
- **The final command in three resumable steps** (`--until repair`,
  `--until verified`, `--resume`), within 295 s.
- **QUIET** is held and released by the harness.
- **Native state snapshots.** 17 states went from 74–94 s to 17–18 s, with equal
  results on two r20 proof oracles. A point's native run took 10 s at r21,
  against 73–94 s at r20.
- **Also:** the harness hash, host against container, and `fixno.mjs`.

**How it worked over 21–29:**

- 12 attempts over 9 ranges.
- 6 ranges ended at their first attempt: r22, r23, r24, r25, r26 and r29. Of
  those, r22 ended under a liaison ruling and r29 after a re-judge. 4 first
  attempts had no stop row at all: r23, r24, r25 and r26.
- 3 ranges needed a second attempt: r21, r27 and r28.
- No final command was killed at an alarm.
- **Native first** caught fix 051 before r22's attempt, so no LayerFS attempt was
  spent on it.
- **Re-judges:** two were used. r21 a1 after fix 048 still differed, because the
  store at play time could not be rebuilt. r29 a1 after fix 054 ended watch.
  r27 a1 could not be re-judged because point 1's results were lost.
- **Fail loud** held. Every stop above named its point and proof, and no proof
  passed on a reference that did not run.
- **Resumable steps.** After the r23 switch, the step alarms were rebalanced
  within the same 295 s from range 25: repair 160, verify 70, finish 65.

**Lessons that held** (LESSONS.md, unchanged since 2026-10-19; no lesson was
added in 21–29):

- *The native oracle differs from LayerFS's environment* (Known traps). Three
  of the stop-side fixes are this trap: 048 (store contents), 052 (HOME) and 054
  (file times). 053 is build nondeterminism that the oracle now absorbs.
- *S16, ask before changing a gate, an oracle or the workload.* The liaison's
  fast-mode rulings were made before the attempts that relied on them: disk
  projection and counter rows are recorded.
- *S18, a ratio on a millisecond is not a regression.* This let the
  1.1–1.6× `fs.write`/`fs.read` rows pass.
- *S15, split long stages.* Every final command stayed within 295 s, at
  149–245 s.

Merge units (F-057) were not used in 21–29. The lead's notes for r27 a2, r28 a2
and r29 say "units not used". r27 a2's harness was rebased on main
`9d45b7c8f0`, which has the units code.

## 7. Open items

- **The Sandbox exec stdout cap, about 1 MiB (fix 052).** It cut a 204-file
  vitest report. Whether it is an artificial transport limit under AGENTS.md
  (no artificial caps in resident containers or transport frames) is an open
  owner question. The cap is unchanged; the harness reads the report from a file.
- **Sandboxes reach the npm registry during an install (fix 048).** In LayerFS's
  Sandbox, pnpm verified the lockfile online while the native replay ran with
  the network off. It is recorded as an environment fact, not a LayerFS defect.
  The two sides' installs are not run in the same network condition.
- **Index-row growth.** 81.5 → 171.5 MiB over r21–r28 (sealed), about
  6.5–7.4 KiB per Commit. It is a watch fact without a gate. It should be judged
  against the work per Commit, as the 16–20 summary said, before it is called a
  trend.
- **Merge units are not yet used.** F-057 units are built (fix 049) and were
  diagnosed on range 15 (fix 050). The switch-over is after range 30. Until
  then the lead repair stays the clean relink and whole build (F-059 option A),
  whose repair build rose from 12.2 to 19.1 s over 21–29.
- Recorded, not stops, in fast mode:
  - Counters `glob_tree.statements` (r25, depth exponent 1.489) and
    `glob_tree.vm_steps` (r26–r29, 0.726 falling to 0.242).
  - Directory share 0.563 (r27) and 0.506 (r29), against the 0.5 line.
  - Several points with no calibrated test, because every candidate fails
    natively: r25, r26 and three of r28's points. P5 is n/a there.
