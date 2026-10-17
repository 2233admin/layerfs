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
