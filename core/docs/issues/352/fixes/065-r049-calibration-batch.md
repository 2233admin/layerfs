# Range 049 · the test calibration sizes its own batch

> **Status:** Current fix record. Harness fix in `dsh/tools/history`; no product change. Liaison request, 2026-10-20, after r049.

| | |
| --- | --- |
| Trigger | r049 test calibration: four `--max-files 40` commands, all four stopped at the 115 s alarm. r049's 110 candidates take 2.65 s each natively (max 5.1 s), so 40 files need about 106 s of vitest alone, before the container and the checkout move |
| Playbook step | D0 (preparation) |
| Kind | none: `calibrate-tests.mjs` batching; daemon, addon, Store format and gates unchanged |
| Commits | `calibrate-tests.mjs` `batchSize`, `FIRST_BATCH`, `BATCH_TARGET_MS`; test in `tests/tools.mjs`; SCRIPTS §16 |
| Recovery | none needed |

## Old design

The lead picked `--max-files` by hand (40). Nothing used the measured time
per file, and the first command after a checkout move also paid for the move
and install (LESSONS R4).

## New design

- When the working tree's HEAD is not the range's checkpoint before the
  checkout, or this checkpoint has no earlier probe command, the batch is
  `FIRST_BATCH` (15).
- Otherwise the batch is ⌊60 s ÷ the slowest wall per file⌋ over this
  checkpoint's earlier probe commands, with a minimum of 1. The wall counts
  the probe container only, not the move or the install.
- Each command's `{ files, wallMs }` is appended to the partial file's
  `commands`. A partial file of another checkpoint is ignored, as before.
- `--max-files` caps the batch and never raises it.

## Proof

`tests/tools.mjs` "fix 065": 15 after a move, whatever the rate; 15 with no
rate; 15 files in 45 s gives 20 (r049's shape, not 40); the slowest rate
decides; fast files give a large batch; the cap only lowers; at least 1; an
empty command is no rate. tools 16/17. The REBUILD.md §4 case fails
identically on origin/main `bc5c5c1564`.
