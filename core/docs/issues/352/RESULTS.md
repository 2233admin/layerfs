# #352 — Results

> **Status:** Current, kept by the lead. Baselines, thresholds, the delta
> decision and each phase's results. Measured claims name their binary.

## Decisions log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-10-18 | Lead starts P1 with the builder's trace wiring (HANDOFF, First builder task) | The fixer's playbook D0–D6 needs SqlWork and FUSE opcode counts in the call trace |
| 2026-10-18 | Native test calibration runs ahead, one phase at a time: the pilot's ranges before P1; each later phase's ranges just before it, after any re-plan. A range with no `tests-NNN.json` is refused, not run without tests | Native results depend only on git and the image, so running them ahead never goes stale and keeps test load out of measured ranges; per phase, because the pilot may re-plan range boundaries and test caps (SPEC §2, Speed-ups 10) |
| 2026-10-18 | Replay Sandbox containers are named `layerfs-issue352-<run>-<n>`; every created resource is logged in `~/lfs-history/ledger/` | The SDK named containers randomly; only `layerfs-issue352-*` resources are the run's to remove |
| 2026-10-18 | The pilot set is ranges 0–4 (311 dsh commits), and the delta control arm replays the same ranges 0–4 (SPEC §8 said 1–5) | It matches plan v2's pilot snapshots, the report baseline and milestone 4; the control must cover the same ranges as the arm it is compared with |
| 2026-10-18 | Files over 60,000 bytes, executables, symlinks and mode changes go through a Sandbox `apply` step | One fs request carries at most 65,519 bytes; recorded as open finding F-001 in BUGS.md |
| 2026-10-18 | A fork-probe optimize verdict that tracks the replay's own probe/lane Branch count is diagnosed by the fixer like any other, not waived | The SDK cannot delete a Branch, so ~7 Branches accumulate per range; a fork whose rows grow with Branch count is a real scaling question at 202 ranges |
| 2026-10-18 | Owner direction: implementation, play and recovery must all be fast. Every range records its tooling stage times; play removes tooling overhead; recovery is one command (`run.mjs recover`, newest good snapshot, fast-forward) | Passed ranges are never replayed measured; the time between LayerFS work must go to LayerFS work |
| 2026-10-18 | Process slip, recorded: ranges 000–002's comments were posted about a minute before their report commits were pushed (the lead's first commit command failed on untracked files). The links resolved once `a448fe02b`..`fdd4a7301` were pushed; later checkpoints commit, verify the push, then comment | HANDOFF's order (commit and push, then comment) keeps every comment's link working |
| 2026-10-18 | Owner: build the live viewer (fork the range k−1 snapshot into its own volume and home, play range k as a dsh scenario, check-demo against git) right after the range-2 fix lands, before the pilot continues, so the owner can monitor the replay | The owner monitors that the replay is right; the viewer writes only its own fork, so it never touches the live Store. One writer at a time: the builder starts when the fixer is done |
| 2026-10-18 | Range 2 finding fixed in two rounds (daemon `b9c332b7…`, then `511dceed…`, Store format change `binding_hint`). Recovery: fast rebuild of ranges 0–1 into `p1-pilot-b`, both oracle checks pass; `p1-pilot` (old format) is the abandoned line, its snapshots kept as evidence for the old-vs-new tables; `p1-pilot-a2` (never played) removed | SPEC §6 Store-format row: rebuild from the plan, checking every checkpoint's oracle |
| 2026-10-18 | Second lead crew starts at range 3 (HANDOFF, State at handoff); its builder and fixer are new subagents | The first crew's subagents are not continued (owner) |
| 2026-10-18 | Delta depth: keep the doubled defaults (chunk 8, whole-file 16, metadata 8) | SPEC §8 rule: storage improves (stored packs −1.5%, Store file −1.7% at range 4 vs the old-depth control on the same daemon) and read p95 stays within 1.2× (0.91–1.15× over ranges 2–4). Re-read at milestone 50, where chains are deeper (at cap 3% now) |
| 2026-10-18 | Milestone 4 proven restorable: fork into a fresh volume and home, oracle diff 530/530 files equal, `PRAGMA quick_check` ok, page size 4096; verification volumes removed | SPEC §7, Verification |
| 2026-10-18 | P1 baseline: `metrics/baseline.json`, built by report.mjs from ranges 2–4 on daemon `511dceed` (ranges 0–1 were measured on `0ef24121`, so never mixed in); thresholds stay gates.mjs `THRESHOLDS` as recorded in SPEC §5 | SPEC §5: same-binary points only |
| 2026-10-18 | Wall budget: 120 s per range, 24,240 s (6.7 h) for 202 ranges; projection = the current phase's mean range wall × 202; gates.mjs's bands (watch ≤ 1×, act 1.5×) apply | P1 measured 22.2–23.3 s per fs-only range; P2–P5 add agents, Sandboxes, installs and up to 60 s of tests, so ~5× headroom. Over budget means re-plan range size or the test cap (SPEC §2, 10) |
| 2026-10-18 | Phase windows: P2 ranges 5–14, P3 ranges 15–29, P4 ranges 30–50 (milestone 50: kill and resume, fast rebuild, demo seed), P5 ranges 51–201 with every feature, then the controls | The plan has no phase boundaries beyond the pilot; each phase gets ~10–20 ranges to prove its features before the next adds more, and P5 plays the rest |
| 2026-10-18 | Scope of the delta comparison (owner question, relayed): latency is compared only where both arms ran measured on daemon `511dceed`, ranges 2–4 (p1-pilot-b's ranges 0–1 were fast-rebuilt without timing; their measured attempts are on `0ef24121`); storage figures (stored bytes, cap and budget shares) may compare across 0–4. The decision above already used exactly this scope | Mixed binaries are never one series (AGENTS.md §3) |
| 2026-10-18 | Owner direction: complete range statistics before P2 (per-method call table, real size classes, ×baseline/slopes/SQL work/FUSE columns, mutation split, Played/Planned, STATS.md running totals, diff_commits judged per changed entry). Assigned to the builder as Task 4; committed reports 000–004 are not regenerated (F2) | SPEC §3b/§3c ask for most of it; the reports must say what was played |
| 2026-10-18 | Owner direction: every new range report opens with an Overview (calls by category, Commits range/running, Branches created/merged/published with steps and Commits each, conflicts hit/planned by kind, agents with steps by category and Commits, lead's consolidation as its own row; played counts, planned beside them); STATS.md carries it cumulatively, backfilled for 000–004. Added to the builder's Task 4, SPEC §3, TEMPLATE.md, F1 and `report.mjs check` | A one-screen view of what each range actually played. Addition (owner): the totals line also shows the range's total tooling time with its stage split (play, consolidate, verify, probes, tests, seal and snapshot, report); STATS.md keeps its running total |
| 2026-10-18 | Owner direction: REPORT_OVERVIEW.md (`ff1015001`) is the binding Overview spec; handed to the builder as Task 4's exact spec, to be linked from SPEC §3 and TEMPLATE.md when Task 4 lands | Owner |
| 2026-10-18 | F-001 fix design accepted (fixer): stream `fs.write`/`fs.apply` bodies over the record budget as raw records (`layerfs-api` `base/stream.rs`, `layerfs-daemon` `sdk/payload.rs`), bounded daemon memory, no Store format change. The optional fs mode/symlink surface is declined: executables and symlinks stay Sandbox `apply` steps | Fixes the cause (one call = one 65,519-byte transport record) without widening the public SDK; the plan's Sandbox share already carries mode changes. The fixer writes after the builder's Task 1–4, one writer at a time |
| 2026-10-18 | Owner direction: REPORT_FORMAT.md and ranges/EXAMPLE.md (`823e1ac78`) bind the whole range report (headline, five sections, appendix A–G, new measurements, Findings with fix context, cost and attempt-vs-rerun, check §7); REPORT_OVERVIEW.md now covers only the Activity tables. Builder's Task 4 follows it; F-005 (chunks never deltas) to the fixer for diagnosis, F-006 (overlay health) and F-007 (trends) to the builder | Owner; committed reports stay unchanged (F2), STATS.md backfills |
| 2026-10-18 | F-005 fix accepted (changed chunks get the old chunk at the same position as delta base) and sequenced with F-001: builder Tasks 1–4, then F-001, then F-005, all before P2's measured run; the delta-depth decision is re-read after F-005 because chunk chains then exist | Binary changes go in as early as possible (LESSONS S3) so P2 plays on one binary; the SPEC §8 decision was taken with chunk deltas absent |
| 2026-10-18 | F-005 base pairing: by byte-range overlap after aligning on unchanged chunks (fallback: the nearest unchanged neighbour's successor), not by chunk index; regression tests on a 1 MiB file for append, insert near the start and middle edit, each with changed chunks stored as deltas well below a full chunk, delta share and stored bytes per case in the fixes/ record | Review by the previous lead: with CDC an early insert shifts every later index, so index pairing compares unrelated content |
| 2026-10-18 | Builder Tasks 1–4 landed (`3a1a27317`, `a1d975ffa`): P2 player, `run.mjs phase`, wall budget (`~/lfs-history/budget.json`), call records, REPORT_FORMAT report and checks, STATS.md backfill; TEMPLATE.md kept as legacy with a pointer to REPORT_FORMAT.md. Dev run `p2-dev` (ranges 5–11, removed) matched git at every checkpoint only with the dev-only serialize aid; every planned conflict hit | Builder's report |
| 2026-10-18 | Fixer order before P2's measured run: F-008 (HeadMoved; a stop that blocks P2), F-009 (concurrent unmount), F-010 (diff_commits paging), F-001 (fs body streaming), F-005 (chunk delta base). Each its own commit, regression test first, fixes/ record; old daemon `511dceed` kept by id | Stops first, then optimize findings (ROLES §6); all binary changes before P2 so P2 plays on one binary (LESSONS S3) |
| 2026-10-18 | After the fixes, the speed baseline is re-measured on the new daemon: the pilot ranges 2–4 replayed measured on a fork of the range-1 snapshot (label `baseline`), which also gives the new size classes; the P1 baseline on `511dceed` stays as recorded | The gates compare only same-binary points; baseline.json lacks the new size classes; a re-measured baseline is a measurement of the new binary, not a relabel |
| 2026-10-18 | F-008 shape: one attempt whose publish is a merge against the head current at publish time (read head, merge, compare-and-publish in one writer transaction under the short write lane); no retry, no loop, no per-lane serialization in product or player; same for the fs write path. Same-path conflict gives Conflict, different paths give a merged Committed. The fixer checks it against the owner's Branch-overwrite decision (`docs/issues/307/BRANCH-OVERWRITE-DECISION-20261007.md`); if irreconcilable, the owner's contract stands and the finding is reported blocked with a recommended action | Review by the previous lead; AGENTS.md one-attempt rule |
| 2026-10-18 | Owner direction: incremental by default (REBUILD.md, `1c7cabf83`). Every fix states its kind (1 forward-only, 2 additive migration, 3 incompatible with written justification the lead accepts); the fixer states kinds for F-008/F-009/F-010/F-001/F-005 (all expected kind 1) and adds the §4 old-Store compatibility test; F-011 opened (binding_hint should have been kind 2: let old Stores open, queued after F-005); the builder makes findings.mjs/checkFinding enforce §4 after the fixer's batch | Owner; a rebuild costs minutes at range 2 and hours at range 150 (LESSONS S3) |
| 2026-10-18 | Owner decision (firm): every install is a real `pnpm install` exec in a mounted Workspace, reading the pnpm store volume mounted read-only outside every Workspace (INSTALLS.md, `59178bc16`; a private copy-on-write layer if pnpm needs to write). Builder, after the fixer queue and before P3: the store mount on `sandbox.create` (a product SDK change, if needed, goes to the fixer), install/build/test steps (incremental install on package.json/lockfile change, `tsc -b` of changed packages, clean install at milestones, each its own one-shot Workspace and Commit), the node_modules oracle per lockfile hash against a native install including pnpm's exit and output; then one dev range with install, build and tests compared with native. EXDEV across the store boundary is expected; any other FUSE error is a stop | Owner; INSTALLS.md §6 rules out tarballs, fs.write of node_modules, network, the store inside the Workspace, exclusions and reused installs |
| 2026-10-18 | Fixer batch landed, all kind 1 except F-011 (kind 2): F-008 `a3d0f75ea`, F-009 `bda03912b`, F-010 `370480f4e`, F-001 `78cff90e7`, F-005 `48ad603b1`, F-011 `dca67ccd7`; daemon `71001f65`, addon `3da0f665`; REBUILD §4 compat test passes (a `511dceed` range-4 fork reads 530/530 with the new daemon). F-008's contract note accepted: the overwrite-only decision was already superseded for non-forced Commits by #327; the fix closes #327 VERIFICATION B7's window; B7's row and `core/AGENTS.md`'s overwrite sentence are left for the owner to restate | Fixer's records in fixes/; owner text is not edited by the crew |
| 2026-10-18 | Main line moves to daemon `71001f65` by forking p1-pilot-b's range-4 snapshot into `p2-main` (kind 1, REBUILD.md); p1-pilot-b closes at range 4. A fresh pilot `p1-rebase` (default depths) and `p1-control-b` (old depths), ranges 0–4 on `71001f65`, give the new speed baseline (ranges 2–4) and re-read the delta decision now that chunk deltas exist (F-005) | Same-binary baseline; SPEC §8 decision re-read with chunk chains |
| 2026-10-18 | Delta depth re-read on daemon `71001f65` with chunk deltas (F-005): keep the doubled depths. At range 4, `p1-rebase` (new depths) vs `p1-control-b` (old): stored packs 7,770,885 vs 7,881,620 B (−1.4%), Store file 13,848,576 vs 13,987,840 B (−1.0%), at cap 3.14% vs 3.85%; `fs.read` ≤8 KiB p95 ranges 2/3/4 4.96/4.57/4.67 vs 4.84/4.47/4.66 ms (≤1.03×); chunk chains now reach depth 8 (3,524 FULL, 68 deltas) | SPEC §8 rule: storage improves, read p95 within 1.2×; same daemon, same ranges, one sample each |
| 2026-10-18 | New speed baseline: `baseline-71001f655acb.json` from `p1-rebase` ranges 2–4 (44 op/class rows, 15 probes), beside the `511dceed` one; each attempt is judged against its own daemon's baseline | Same-binary gates (SPEC §5) |
| 2026-10-18 | `p1-rebase` and `p1-control-b` gated optimize at range 2 on `branch.diff_commits` per entry (depth exponent 0.80 over ranges 0–2; 0.61 at 3, 0.42 at 4). Opened as F-012 and sent to the fixer for a counter diagnosis before P2's measured run; the control runs' verdicts stay as recorded (they are not main-line checkpoints) | LESSONS S1: settle a trip that can already be seen before the measured run |
| 2026-10-18 | F-012: not history-proportional (fixer's counters on a deep fork equal the originals). Fix the paging re-plan in the product (kind 1); the gate measures `diff_commits` per checkpoint (all pages) per changed entry | A k-page diff costing k plans breaks SPEC §4 for `diff_commits` |
| 2026-10-18 | Superseding the line above in part: the gate is NOT normalised by tree files (review by the previous lead). SPEC §4 lets `diff_commits` grow only with changed entries, flat with tree size and depth; statements per changed entry ≈ 0.25 × tree files is therefore tree-proportional work and part of F-012's fix: O(changed entries + their ancestors), with a small-vs-large-tree regression test. The one-file probe stays gated on raw counters | Normalising by tree files would hide exactly the growth §4 forbids |
| 2026-10-18 | F-012 fixed (`ac2502470`, kind 1, daemon `361bb09e`): a per-call B-tree page cache (≤256 pages) and the 4 most recent diff plans kept by root pair (fixed memory); statements per changed entry, ranges 0–4: 69/74/90/118/120 → 5.7/6.3/7.3/6.6/8.0; range-3 checkpoint 79,434 → 4,431 statements, 733 → 42 ms; plan not carried in the cursor (it would grow with the diff). Next: gate per changed entry, re-baseline `p1-rebase-b` on `361bb09e`, re-fork the unplayed `p2-main`; the delta decision stands (F-012 does not touch storage) | Fixer's record; same fork old vs new |
| 2026-10-18 | Process slip, recorded: the fixer's old-code regression run took 184 s, over the 120 s test ceiling, because `perl alarm` killed cargo but not the test binary; later runs use a process-group kill | AGENTS.md §4 test ceiling |
| 2026-10-18 | F-013: the per-entry `diff_commits` gate is corrected to judge fixed and marginal cost separately (both flat with tree size and depth); the gate commit `d740b32ec` carries a wrong LOC line (should be 96242 → 96242, delta 0), corrected in the next commit message, no amend | A fixed per-checkpoint cost spread over fewer entries is not tree- or depth-proportional work; the tree-walking test still trips |
| 2026-10-18 | Control-arm reports stay in `~/lfs-history/runs/p1-control/` and get no #352 checkpoint comment; the comparison is posted in the P1 summary | They are a control, not checkpoints of the main line (SPEC §3 counts one comment per main-line attempt) |

## P1 · Pilot

### Init with `node_modules` (2026-10-18, daemon `7871e6df…`, image `d3773b4e…`)

One Init of the range-4 checkpoint after an offline install
(`~/lfs-history/metrics/init-ratio.json`):

| Measure | Value |
| --- | --- |
| Raw | 227.2 MB in 21,223 files (tracked 3.5 MB / 524; `node_modules` 223.7 MB / 20,699) |
| Init time | 5.7 s |
| Store file | 81.5 MB = 0.359 of raw |
| Stored packs / packs + metadata | 0.309 / 0.375 of raw |
| Dedupe (logical/canonical) | 1.033 |
| Compression (canonical/stored) | 3.134 |
| Projected first install at HEAD | ~0.83 GiB, against SPEC §7's ~2.5 GiB estimate for all installs |

Within the estimate; no re-plan.

### Native test calibration (pilot ranges)

| Range | Files run / candidates | Native time |
| --- | --- | --- |
| 0 | 0 / 27 (yarn project, no offline install) | — |
| 1 | 30 / 41 | 24.2 s |
| 2 | 30 / 43 | 25.1 s |
| 3 | 30 / 50 | 22.8 s |
| 4 (milestone) | 63 / 63 | 71.6 s |

P1 plays fs only; these lists run from P3.

### Ranges 0–4 (main line `p1-pilot-b`)

| Range | Daemon | Verdict | Wall (tooling) | New stored | Directory share | Depth after |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | `0ef24121` (line `p1-pilot`) | watch | — | 2.9 MiB | 0.52 | 571 |
| 1 | `0ef24121` (line `p1-pilot`) | watch | — | 2.7 MiB | 0.58 | 1,114 |
| 2 | `511dceed` (a2) | watch | — | 2.0 MiB | 0.59 | 1,533 |
| 3 | `511dceed` | watch | 22.2 s | 5.3 MiB | 0.56 | 2,611 |
| 4 | `511dceed` | watch | 23.3 s | 4.5 MiB | 0.59 | 3,497 |

Every checkpoint matches git (530 files at range 4, full compareTree at each
snapshot). Growth: 2–5.5 MiB per fs-only range, ~0.8 GiB projected for tracked
history over 202 ranges against SPEC §7's ~3 GiB: within 2×, no re-plan.

### Delta control arm (`p1-control`, old depths 4/8/8, daemon `511dceed`)

| Measure (range 4 unless stated) | New depths (main) | Old depths (control) | Change |
| --- | --- | --- | --- |
| Stored packs | 8,011,210 B | 8,132,929 B | −1.5% |
| Store file | 14,061,568 B | 14,299,136 B | −1.7% |
| Objects at the depth cap | 3.1% | 3.6% | −0.5 pt |
| `fs.read` p95, ranges 2/3/4 | 4.49 / 4.91 / 6.17 ms | 4.96 / 4.29 / 5.49 ms | 0.91 / 1.15 / 1.12× |
| `fs.diff_files` p95, ranges 2/3/4 | 7.44 / 7.08 / 7.63 ms | 8.04 / 6.91 / 7.34 ms | 0.93 / 1.02 / 1.04× |
| `sandbox.commit` p95, ranges 2/3/4 | 14.46 / 13.76 / 16.52 ms | 13.94 / 13.00 / 14.75 ms | 1.04 / 1.06 / 1.12× |

One sample per range and arm. Latency rows: ranges 2–4 only, where both arms ran measured on daemon `511dceed`; storage rows may span 0–4, cache state as the
runner leaves it (warm daemon, same for both arms). Decision: keep the new
depths (decision log).

### Gate thresholds (from gates.mjs, recorded at P1 close)

Speed 1.2× / 1.5×; depth exponent 0.15 / 0.7; counter exponent 0.05 / 0.5;
directory share 0.5 / 0.7; reinstall growth 2 / 5; delta at cap 0.1 / 0.25;
disk 0.8 / 1; wall 1 / 1.5; rising for 3 ranges; range growth 3× median or
2 GiB. Watch items open at P1 close: directory share 0.56–0.60, the
merge.fullscan_steps signature-ring fill (F-002), oneshot_commit and fork
depth exponents 0.20–0.25 (sublinear).

## P2 · Multi-agent

Pending.

## P3 · Sandbox share

Pending.

## P4 · Recovery and demo

Pending.

## P5 · Full history

Pending.
