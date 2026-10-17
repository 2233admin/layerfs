# Range 002 a1 · Gates fitted points from different daemons

| | |
| --- | --- |
| Trigger | Coordinator review of 002.a1. A rerun after a fix fitted depth exponents and baselines over points measured with the old and the new daemon, so a fix's effect was attributed to depth. |
| Playbook step | gate tooling (no product change) |
| Kind | code path (dsh tooling) |
| Binaries | no product binary; applies from daemon `511dceeda1b5…7ad0` on |
| Commits | fix `0c347ad33`, tests in `dsh/tools/history/tests/history.mjs` |
| Recovery | none needed; the range 2 rerun is evaluated with it |

## Old design

`dsh/tools/history/gates.mjs` at `49499abac`: `evaluate` fitted every probe and
counter over all earlier ranges' last attempts and compared Speed with the
pilot baseline, whatever binary measured them.

## New design

- **Same-binary series.** `sameBinary(m)` keeps only points whose
  `binary.daemon` equals the attempt's. The series, the fits and the Speed
  baseline all use those points only.
- **Baseline.** A baseline measured with another daemon reports Speed as
  watch. `buildBaseline` records its daemon and refuses a mix.
- **Seeds.** `report.mjs` `loadSeeds` reads
  `metrics/probes-<daemon>.json`. These are probe points a fix measured with
  its new daemon on earlier snapshots, each labelled with its cache state. A
  seed fills only a range that no same-binary measured attempt covers, and the
  Scaling and Counters values name how many seeded points they used.
- **Too few points.** With fewer than 3 same-binary points, Scaling and
  Counters report "insufficient same-binary points: n of 3 (daemon …)" as
  watch, never a silent pass.

## Proof

Two new tests in `dsh/tools/history/tests/history.mjs`:

- mixed daemons: old points are excluded, the insufficient-points text
  appears, an other-daemon baseline gives Speed watch, and a mixed baseline
  throws;
- seeds: the seeds fill uncovered ranges, another daemon's seed is ignored,
  a seeded series still finds growth, and a measured attempt replaces its
  range's seed.

The comment-shape test now expects **watch** for a single-point pilot range.
Suites: 19, 13 and 14 pass.

Seeds for the new daemon:
`~/lfs-history/metrics/probes-511dceeda1b5ec7e4c65b50f4f885bc60f25d6beac1c0735c7e044c12e1e7ad0.json`,
ranges 0 and 1 from the [diff_commits record](002-a1-diff-commits-change-walk.md)'s
probes. They are labelled diagnostic, with a fresh daemon on byte copies of the
fast-rebuilt Store, one sample each.

## Performance, old vs new

Not applicable (gate evaluation only).

## Left open

Range 2's measured attempt will have 2 seeds plus itself: 3 points, the
minimum.
