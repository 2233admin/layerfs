# Ranges 51–100 prep · a chain-bounded window maximum names the call that set it

> **Status:** Current fix record. Harness report fix in `dsh/tools/history`; no product change. From the liaison's review of ranges 31–50.

| | |
| --- | --- |
| Trigger | Counters `merge.returned_rows` (chain-bounded) read "2,513 vs 1,941 (1.295×)" as the only optimize row in every range r41–r48. The window maximum was one probe call (r041.a1, then 2,514 at r045.a1) repeated by the cap-period window, so each range's comment re-read one event as a finding |
| Playbook step | D6 (report) |
| Kind | none: text of the bound only; `BOUND` bands, the cap period and the result unchanged; daemon, addon and Store format unchanged |
| Commits | `gates.mjs` `chainBound`, `callName`; test in `tests/p2.mjs` |
| Recovery | none needed |

## Old design

`chainBound` reported `max over the latest cap period L vs the first F: r×`
without saying which point produced L or F, so a range that only carried an
earlier range's maximum read the same as the range that set it.

## New design

Each bound names the probe call behind both maxima (the latest on a tie) and
says whether this range set the latest one:

`max over the latest cap period 2514 (r045.a1 merge probe) vs the first 1941 (r033.a1 merge probe): 1.295× (bound, period 8; carried from r045.a1 merge probe; this range 1926, not a new maximum)`

A range that sets it reads `set by this range`. A seeded point is named
`rNNN seed`. The result and bands are unchanged, so a carried maximum still
reads optimize; the text lets the lead cite the first range instead of
reporting a new finding.

## Proof

`tests/p2.mjs` "a chain-bounded window maximum …": the recorded
`merge.returned_rows` r031–r048. r48 is optimize and names r045.a1 (carried)
and r033.a1; r45 reads "set by this range"; r43 carries r041.a1. 71/71.
