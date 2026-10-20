# Ranges 51–60 · a snapshot after every range (run switch)

> **Status:** Current fix record. Harness change in `dsh/tools/history/run.mjs`; no product change. Liaison 2026-10-20: "Snapshots: every range, approved", on the condition that one snapshot adds at most 2 GB on disk and host free space stays at or above 100 GB over the ten ranges.

| | |
| --- | --- |
| Trigger | P3 snapshots fell on alternate ranges (`due()`). After an odd-range stop, R11 replays the gap fast (lead, cuts and repair, about 4–5 min each time) |
| Playbook step | D0 (before r52) |
| Kind | none: snapshot cadence only; gates and timing are unchanged |
| Commits | `run.mjs` `snapshotsEvery()` and the `snapshots --every` command; test in `tests/p3.mjs`; SCRIPTS §16 |
| Recovery | none needed |

## Numbers behind the choice

| | r50 | r51 |
| --- | --- | --- |
| New blocks on disk | 1,340,084,224 B | 1,344,229,376 B |
| Copy + seal | 6.2 s + 1.5 s | 4.9 s + 1.6 s |

Host free space was 397.6 GB (`tools/cleanup.py check`). Ten snapshots at
about 1.35 GB each leave about 384 GB, above the 100 GB floor.

## Design

`snapshotsEvery(phase, manifest)` is true for the phase's own `"every"` (p1)
or for `run.json` `snapshots.every === true`. `run.mjs snapshots --run R
--every` sets that from the range the run stands at, and writes a ledger
note. It refuses a run stopped mid-range.

## Proof

`tests/p3.mjs` "snapshots every range (fix 071)": 41/41 pass.
