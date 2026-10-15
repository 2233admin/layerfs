# Required report — #340

> **Status:** Current planning checklist; no release candidate exists.

What the main agent's `RESULTS.md` must contain, in this order. It follows the shape of
[#337 RESULTS](../337/RESULTS.md) and adds the multi-agent sections. Every number comes
from a retained receipt or table; every table under `tables/` lists its source files and
their SHA-256. An unavailable figure is written as unavailable, never as zero.

All figures are diagnostics with tracing enabled and unknown OS cache state. Build 1 and
Build 2 are different implementations by different teams; their figures are compared
side by side, never as a performance comparison.

## 1. Outcome summary

One table per build: acceptance result, application production LOC, test count, agents
used (including replacements), wall time per phase, LayerFS fixes, blockers, and whether
Build 2 needed any product change. Then a short paragraph on what the run shows about
LayerFS for parallel agent development.

## 2. Identities

Starting `main`, campaign branch, every fix commit, frozen-input commit and freeze
revision hashes, rebuilt product tip and tree, runtime image digest, Node and npm
versions, `node:sqlite` mode, daemon and addon SHA-256, lockfile SHA-256, and the run
table (run, project, volume, Init Layer).

## 3. Team and timeline

- The Codex topology that ran (from Phase A2): who spawned whom, the message path.
- Agent table: id, role, lane, start/end time, steps, Commits, Sandboxes used,
  replacement reason if any.
- Timeline of the build: skeleton published, workers started, each lane milestone
  `DONE`, each integration published, halts, acceptance. A table with times, plus a
  lane/time chart if it reads clearly.
- Concurrency profile from trace timestamps: the maximum and the time-weighted average
  of concurrently mounted Workspaces, concurrently open Sandboxes and overlapping
  `sandbox.exec` calls; how long all five workers were active at once.

## 4. SDK operation collection

Per build, from the decoded traces (median with `statistics.median`, p95 by nearest
rank `ceil(0.95·n)`, raw milliseconds):

- per method: count, median, p95, max — overall, per agent and per lane;
- public SDK calls, internal service calls and operator calls counted separately;
- refusals per code (`Conflict`, `HeadMoved`, `Busy`, `NameTaken`, `NoSuchBranch`,
  `Unknown`, …) per agent, and how each was handled;
- `sandbox.commit` split by result: plain Commit, Commit with merge, `UpToDate`,
  `Conflict`; and by whether the Branch moved since the mount;
- Commit, mount and merge phase timings from daemon telemetry, reported per phase path
  without adding overlapping spans;
- filesystem request counters where available, kept apart from SDK calls. Ordinary
  command syscalls are not `fs.*` calls.

Tables: `b<n>-methods.csv`, `b<n>-agents.csv`, `b<n>-refusals.csv`, `b<n>-phases.csv`,
`b<n>-steps.csv`.

## 5. Parallel work, merges and conflicts

The core of the report. Everything is counted as it happened; nothing was planned.

- **Same-Branch work:** number of Commits that merged against a moved head, per lane;
  Commit conflicts written into Workspaces, their files and how they were resolved
  (fixed, regenerated, discarded and redone, forced with approval).
- **Branch merges:** every `branch.merge` with inputs, result (`Merged`, fast-forward,
  `Conflict`), conflict paths and kinds, `lww` decisions, resolver, steps and wall time
  to resolve.
- **Publishing:** every `branch.publish` with result, `HeadMoved` refusals, re-integrations
  and any non-empty `overwrote`.
- **Broken behavior after clean merges:** tests that failed after a textual merge
  succeeded, what broke, and the fix.
- **Generated state:** lockfile and `node_modules` decisions taken by `/.lww`, and any
  dependency lost by a newer-wins decision and restored by reinstalling.
- **Lane generations:** every `<lane>.<g>` with its source, as a list or diagram.
- A conflict log table: time, Branch(es), path, kind, resolution, resolver, time to
  resolve. Table: `b<n>-conflicts.csv`, `b<n>-merges.csv`.

## 6. Problems fixed

- **LayerFS, SDK and skill defects:** id, symptom, first evidence, root cause, fix commit,
  production LOC delta, regression test, verification, and whether it was found in
  Phase A or Build 1. Build 2 should have none; any it hit is reported with its failed
  run.
- **Codex and team-mechanics problems:** spawning, messaging, slot limits, context
  handoffs, and what changed in the prompts.
- **Environment corrections** before Init, kept apart from product fixes.

`BUGS.md` holds the full ledger; this section summarizes it.

## 7. Findings

What worked, what did not, and what to change, each tied to evidence:

- how often parallel work merged on its own versus needed a person-like resolution;
- whether Commit-time merging on a shared lane Branch helped or hurt two workers;
- cost of a Workspace per Bash step under five-agent load;
- skill gaps found by the team, and the guidance added;
- limits met: 2-minute ceiling, `npm` under concurrency, browser checks, context size.

## 8. Storage and deduplication

- Operator counters at initial and final observation for each run: logical, canonical,
  stored, metadata including SQLite overhead, file, free; ratios logical/canonical and
  canonical/stored. Never add stored and metadata to derive physical bytes.
- Reconciliation: Commit records and Layers reproduce final logical bytes; initial
  totals plus acknowledged Save counters reproduce canonical, stored and metadata-pack
  totals. Report any gap with candidates, without invented attribution.
- Per-Commit growth: logical, new canonical, new stored, new metadata, cumulative,
  per agent and lane (`b<n>-commits.csv`).
- **Dependency deduplication across agents:** the number of `node_modules` trees in all
  Commits and Workspaces, their summed logical bytes, and the new canonical and stored
  bytes the installs actually added. Show the first install against later installs of
  the same lockfile by other agents.
- Store file, WAL and portable export sizes after stop.

## 9. Application outcome

- Production LOC from the frozen counter, per package and in total; the largest files
  reviewed for padding.
- File census: maintained files and bytes, tests per package with pass/fail/skip.
- Feature checklist per lane milestone, with the acceptance step that proves each.
- Full acceptance receipts, including the fresh-remount proof.

## 10. Build 1 and Build 2 side by side

One table of the main figures from sections 1, 3, 4, 5, 8 and 9 for both builds, with the
reasons they differ. No winner is declared.

## 11. Evidence, limitations and publication

- Raw evidence locations, checksum manifests, verified Store exports.
- Every limitation and deviation: unknown cache state, missing streams, browser gap,
  any reconstructed observation.
- Production LOC comparison for every repository commit in the campaign.
- Publication disposition: what the owner authorized.

## 12. Verbatim reports

The Build 2 team lead's final report and every Build 2 worker's final `NOTES.md`,
verbatim. Build 1 reports may be summarized with links to the originals.
