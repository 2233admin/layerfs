# Re-baseline r049 · a baseline may accept one named counter row

> **Status:** Current fix record. Harness change in `dsh/tools/history`; no product change. Liaison ruling 2026-10-20 (under owner delegation), during the 51–100 re-baseline.

| | |
| --- | --- |
| Trigger | `rb-p3-32eda22d-4c52d23c-b` r049: Counters `oneshot_mount_unmount.statements`, depth exponent 0.68, optimize. `rebaseline --write` accepted only the Reinstall growth exception, so it refused |
| Playbook step | D6 (baseline) |
| Kind | none: baseline admission only; gates, thresholds and the counter's later judging unchanged |
| Commits | `e9dbadc43b` (`run.mjs` `baselineRows`, `--accept-counter`; test in `tests/runner.mjs`); used by `28e20a731d` |
| Recovery | none needed |

## Evidence

- The row's points were the first three on the new binaries: 64 / 66 / 66
  statements and 2,235 / 2,290 / 2,290 VM steps.
- Full scans stayed flat at 82, over depth 56,578 → 59,295 (4.8%).
- `p3-main-w` shows the same step at the same ranges on the old binaries
  (64 / 67 / 66).

The step is a property of the workload, not of the build.

## Change

`rebaseline --write … --accept-counter <probe.counter> --accept-ranges N
--reason <text>` accepts a Counters row at optimize when all of these hold:

- the row's value names exactly that counter;
- it is in a listed range;
- it is the range's only row above watch.

Any other counter, or "Counters" in general, is still refused. So is a stop.
The accepted row is recorded in the baseline's `note.acceptedRows`.

## Proof

`tests/runner.mjs` "a baseline takes one named counter at optimize, never
Counters in general" (21/21) checks:

- the named counter at r49 is accepted;
- another counter of the same probe, another probe, another range, a
  missing counter name, and the storage form are each refused.

## Use

Baseline `baseline-32eda22d657d-4c52d23cd1b4-p3.json`, r049 only. The
counter stays judged from r51 on: a rise there is a finding.
