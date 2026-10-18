# Range 013 a2 · fork probe time exponent is timer noise on identical work

| | |
| --- | --- |
| Trigger | Scaling: `fork` depth exponent 1.076 (optimize). p2-main-e (forked from p2-main-d range 11, ranges 12–13 replayed), daemon `6d467539`, addon `7ec591f1`. Points: ranges 11, 12 and 13 at depth 7,783, 8,519 and 9,385, with 0.635, 0.477 and 0.770 ms |
| Playbook step | D0 (where the time goes), from the recorded metrics only |
| Kind | none: not a product finding. Every counter is identical at all three points; the time moves both ways over sub-millisecond samples |
| Binaries | daemon `6d467539`, addon `7ec591f1` (unchanged) |
| Commits | this record only; no product or harness change |
| Recovery | none. No rerun; the lane continues to range 14 (lead, 2026-10-18) |

## Finding

The `fork` probe is one `branch.fork` of main, one sample per range
(`~/lfs-history/metrics/range-01{1,2,3}.a*.json`, `probes.fork`):

| Range (attempt) | Run | Depth | ms | statements | VM steps | full scans | rows |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11 (a2) | p2-main-d | 7,783 | 0.635 | 16 | 271 | 0 | 7 |
| 12 (a1) | p2-main-d | 8,519 | 0.477 | 16 | 271 | 0 | 7 |
| 13 (a1) | p2-main-d | 9,385 | 0.407 | 16 | 271 | 0 | 7 |
| 13 (a2) | p2-main-e | 9,385 | 0.770 | 16 | 271 | 0 | 7 |

The fork does the same SQL work at every depth. The same input on the same
binary measured 0.407 ms in 013.a1 and 0.770 ms in 013.a2: a spread of
0.36 ms, larger than the whole range-11 to range-13 change (0.135 ms). Over
ranges 11–13 the series falls and then rises. With identical counters, a
sub-millisecond single sample cannot carry a time exponent, so this is timer
and scheduling noise, not growth.

The fixer's two Docker builds ended at 03:23:57Z, and range 13 a2 played
03:24:01–03:24:25Z. They were adjacent, not overlapping (lead).

## Left open

- Judging a sub-millisecond probe with flat counters by its time exponent is
  a gate question for the lead and builder (compare F-024 and the split
  `oneshot` probe). No gate change is proposed here.
- Finding: `~/lfs-history/metrics/finding-013.a2.json`.
