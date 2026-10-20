# Ranges 51–100 prep · a thin baseline class no longer hides the Speed row

> **Status:** Current fix record. Harness report fix in `dsh/tools/history`; no product change. From the ranges 31–50 lessons (LESSONS R6) and the liaison's review, for ranges 51–100.

| | |
| --- | --- |
| Trigger | Speed rows of r31–r48: one class with fewer than 5 calls per baseline range (for example `sandbox.commit` "—", p95 = the repair's build Commit against pilot-sized calls) turned the whole row into "not judged", so every other class went unread |
| Playbook step | D6 (report) |
| Kind | none: gate reading only; thresholds, `BASELINE_MIN_N` (5) and the F-024 rule unchanged; daemon, addon and Store format unchanged |
| Commits | `gates.mjs` `evaluate` (Speed); test in `tests/p2.mjs` (F-024 case) |
| Recovery | none needed: applies to the report of the next range played or re-judged |

## Old design

`evaluate` kept the single thin class with the highest ratio. When that ratio
was above the watch band and above every judged class, the row became
"not judged: <class>: baseline class has a/b/c calls" (watch), and the judged
classes' worst ratio was never shown or banded.

## New design

- The Speed row is decided by the judged classes alone, exactly as before
  (worst ratio, the 5 ms floor, rising series for optimize).
- Every thin class over the watch band is listed after it, worst first:
  `; not judged: <op> <class>: a/b/c calls (r×) (baseline class under 5 calls per range)`.
  Thin classes under the watch band are not listed.
- With no judged class over the floor and no floored class, the row stays
  "not judged: … baseline class has a/b/c calls (minimum 5 per range); r× it"
  (watch, F8), now naming every thin class over watch.

## Proof

`tests/p2.mjs` F-024: a judged `fs.read ≤8 KiB` at 1.1× beside a thin
`branch.merge … UpToDate` at 85.47× reads `fs.read ≤8 KiB: 1.1× baseline …;
not judged: branch.merge … 1/0/0 calls (85.47×) …` and passes; the thin class
alone is still not judged (watch); 3/3/8 still thin, 5/5/5 judged. 71/71.
