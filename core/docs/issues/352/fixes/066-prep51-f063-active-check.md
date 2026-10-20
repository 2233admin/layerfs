# Ranges 51–100 prep · F-063 proved active from the run's own traces

> **Status:** Current fix record. Harness check in `dsh/tools/history`; no product change. Owner 2026-10-20: "the .git improvements should be ported into the 51-100 lane once it starts running"; liaison request for proof in the re-baseline and first 51–100 reports.

| | |
| --- | --- |
| Trigger | F-063 (`2de43d0a02`, rename-over chunk predecessor) reaches the replay only through the Part B re-baseline build; nothing in the reports showed whether a run's binaries use it |
| Playbook step | D0 (before r51) and D6 (report) |
| Kind | none: a read-only trace check; gates unchanged |
| Commits | `f063.mjs` (new); test in `tests/p3.mjs`; SCRIPTS §16 |
| Recovery | none needed |

## Design

`f063.mjs` reads `trace/range-NNN.aK.jsonl` and sums, over the lane git
Commits (`sandbox.commit` whose step ends in `.git-commit`), each Commit's
`delta.payload.chunk_depths`. Depth 0 is a FULL chunk; any depth above 0 is
PREFIX. It also checks with `git merge-base --is-ancestor` that the build
commit contains `2de43d0a02`.

It prints the JSON and one report line, and exits:

- 0 when active;
- 4 when the build lacks the fix, or PREFIX is 0 while chunks were stored
  (the liaison's stop before r51);
- 2 when no lane git Commit, or no chunk, was traced.

## Proof

- `tests/p3.mjs` "fix 066" (37/37) covers:
  - the step and method filter;
  - a pre-fix shape (PREFIX 0, exit 4);
  - a post-fix shape (first step FULL, then PREFIX at depths 1–2, exit 0,
    with the exact report line);
  - a build without the fix (exit 4);
  - the not-judged cases;
  - the ancestry check on a scratch history.
- Real trace r049.a1 (`p3-main-w`, pre-fix daemon `27a769a4`): 139 lane git
  Commits, chunk FULL 782 / PREFIX 0. That gives exit 4, the reference the
  51–100 lane must differ from.
