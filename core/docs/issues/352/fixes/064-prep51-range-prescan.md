# Ranges 51–100 prep · a pre-scan of each range from the dsh history

> **Status:** Current fix record. Harness tool in `dsh/tools/history`; no product change. From the ranges 31–50 lessons (R5, R7, R9) and the liaison's review.

| | |
| --- | --- |
| Trigger | Oracle and lane stops caused by dsh workload patterns that the git history shows before the range plays: r038 a1 (gitignored test output, fix 058), r044 a1 (a package added and removed in the range, fix 060), and P5 n/a points at hybrid lane trees (R5) |
| Playbook step | D0 (before the oracle) |
| Kind | none: a new read-only tool; daemon, addon, Store format and gates unchanged |
| Commits | `prescan.mjs` (new); test in `tests/p3.mjs`; SCRIPTS §16 |
| Recovery | none needed |

## Design

`prescan.mjs` reads the bare dsh clone and the range's plan file only. Per
range it lists packages added and removed within the range (with the plan
lanes that write into them), `.gitignore` line changes, test and script
lines that write files plus changed package.json scripts, and new workspace
and top-level folders. Output: `prescan-NNN.md` (plan notes) and `.json`
under `--out`; it never writes a plan directory.

## Proof

- `tests/p3.mjs` "fix 064": workspace globs, the writer patterns (positives
  and the false positives seen on r044: comparisons, method calls and
  definitions, generics, fd redirections), the r044 shape on synthetic sets,
  the notes text, and an end-to-end scratch history where a package is added
  and removed between two checkpoints beside a `.gitignore` change. 36/36.
- Recorded ranges: r044's notes list `packages/subagent/subagent-subprocess/`
  (lanes r044-1-root, r044-3-packages-ui) and `+ .sessions/` in
  `examples/web-cordis/.gitignore`. Those are the fix 060 and fix 058 paths.
