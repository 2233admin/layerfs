# Ranges 51–100 prep · Contended work reads the call's own SQL (`sql.call`)

> **Status:** Current fix record. Harness gate input in `dsh/tools/history`; no product change. Owner 2026-10-20: "yes". Left open by fix 057 for the lead; the liaison assigned it before the 51–100 re-baseline.

| | |
| --- | --- |
| Trigger | Contended work optimize rows r44–r48 (`fs.write ≤1 KiB` 1.53–1.78, `fs.rm` 1.91–2.21). The gate read the session's `writer` + `readers`, which count the overlapping Commit's or merge's work too. Fix 057's r30 probe: a contended `/LICENSE` remove was 377 statements and 28,452 VM steps of session work, of which only 191 / 14,533 were the call's own (`sql.call`) |
| Playbook step | D6 (gate input) |
| Kind | measurement: gate input only. Thresholds, `CONTENDED_SPAN`, `BASELINE_MIN_N` and the bands are unchanged; daemon, addon and Store format are unchanged |
| Commits | `steps.mjs` `sqlCallCounters`, `callOf` (`sqlCall`); `gates.mjs` `aggregate` (`row.sqlCall`), `contendedWork`; test in `tests/p2.mjs`; RESULTS decision row; SCRIPTS §13 |
| Recovery | none: applies from the 51–100 re-baseline, whose binaries trace `sql.call` |

## Old design

`callOf` summed `sql.writer` + `sql.readers` per call, and Contended work
fitted that p50 against tree files. Under overlap, the session delta includes
the other caller's work, so the reading grew with overlap.

## New design

- `callOf` also records `sqlCall`: the sum of each exchange's `sql.call`, and
  only when every exchange has it.
- `aggregate` gives a class `sqlCall` p50s only when every call in the class
  has them.
- `contendedWork` reads `sqlCall.vm_steps` when this attempt's contended rows
  have it, and fits only points that have it. Process-wide points are never
  mixed in.
- Otherwise it reads `sql.vm_steps` as before. The row names its source:
  "per call (sql.call)" or "process-wide (writer + readers)".
- `sql` itself is unchanged, so probes, Speed, the baselines and every other
  reading are untouched.

## Proof

`tests/p2.mjs` "fix 067" (72/72) checks:

- `callOf` takes 191 / 14,325 from `call` beside 377 of session work;
- no `sqlCall` before fix 057, and none for a class with any call lacking it;
- overlap that doubles session work with flat own work: per call, exponent
  0, pass; process-wide, optimize, labelled;
- three process-wide ranges and one per-call range are not mixed (not judged).

The existing Contended work cases are unchanged.
