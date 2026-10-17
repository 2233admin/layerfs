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

## P2 · Multi-agent

Pending.

## P3 · Sandbox share

Pending.

## P4 · Recovery and demo

Pending.

## P5 · Full history

Pending.
