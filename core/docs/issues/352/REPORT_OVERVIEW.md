# #352 — Range report Overview format

> **Status:** Superseded in part, 2026-10-18, by [REPORT_FORMAT.md](REPORT_FORMAT.md),
> which defines the whole report. This file stays binding for the four Activity
> tables (calls by category, Branches, conflicts, agents), their rules and their
> checks, which REPORT_FORMAT.md §3 "2. Activity" uses unchanged. Where the two
> differ, REPORT_FORMAT.md wins. The example below is **simulated**.

## 1. Rules

- **Placement:** the first section of the report, right after the title, before
  the header table and Attempts. One screen.
- **Played, not planned.** Every count is what the range actually played. Where
  the plan differs, the planned figure follows in brackets: `1 [3] Branches`.
- **Steps and calls are different units.** A *step* is one bash call of an agent
  (an fs batch, a one-shot Workspace, a lead consolidation entry). A *call* is
  one SDK call; one step makes many calls. The category table counts calls; the
  agent table counts steps by category and Commits.
- **Categories:** `fs` (write, edit, apply, mkdir, rm, cp, mv; read, list, stat,
  grep, glob, diff_files, blame), `sandbox` (create, service, mount, exec,
  status, commit, unmount, close), `branch` (fork, merge, publish, diff_commits,
  diff_branches), `project` (init, list_commits, branches, other project
  methods), `operator` (store.stats, store.commits, files.stats, inspect.snapshot, workspace.overlay). A method not in
  this list fails the check until it is assigned here.
- **A step's category** is the category of the call that defines it: an fs batch
  is fs; a one-shot Workspace (mount, exec, commit, unmount) is sandbox; a lead
  merge, publish or fork is branch; a lead list or history read is project.
- **The lead is an agent row and main is a Branch row**, so consolidation work
  (merges, reconcile, publish, install, build, tests) is visible.
- **Conflicts:** one row per planned kind, `hit / planned`, plus an
  **Unplanned** row that is always shown. Any unplanned conflict is a stop finding.
- **Time** is tooling wall time (never operation latency), with its stage split;
  operation latency stays in §3.
- **Units:** counts as integers with thousands separators, seconds with one
  decimal place. Every cell is filled; a category or kind the phase does not
  play shows `0` or `— (not played in Pn)`, never a blank.

## 2. Layout

```markdown
## Overview · Range NNN · **<verdict>** · attempt K · daemon `<id12>`

**Time T s** (tooling): play · consolidate · verify · probes · tests · seal + snapshot · report
**N calls** · **C Commits** (running R) · **B Branches** · **A agents + lead** · conflicts **h / p** hit

**Calls by category**

| Category | Calls | Writes | Reads | Outcomes |

**Branches**

| Branch | Agents | Steps | Commits | Merged into main | Published |

**Conflicts**

| Kind | Hit / planned | Where | Resolved in |

**Agents**

| Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
```

Column meanings:

| Table | Column | Content |
| --- | --- | --- |
| Calls | Writes / Reads | calls that change state / calls that only read, within the category |
| Calls | Outcomes | outcome kinds with counts (`Committed`, `UpToDate`, `Conflict`, `Merged`, `Added`, …); for sandbox and branch also the per-method counts |
| Branches | Merged into main | ✓, ✓ (Nth try) after a race, or — |
| Conflicts | Where | Branch and agents involved |
| Conflicts | Resolved in | time from the Conflict to the resolving Commit or merge, or what resolved it |
| Agents | Steps by category | the four category counts sum to Steps |
| Agents | Conflicts | the conflict kinds this agent hit |

Totals rows: the Calls table ends with **Total**; the Agents table ends with
**Total** whose Steps and Commits equal the totals line.

## 3. Checks (`report.mjs check`, F1)

- The Overview exists, is first, and has the totals lines and the four tables in
  this order.
- Calls total equals the sum of the category rows and the range's SDK call count.
- Agents' Steps total equals the played bash calls; Commits total equals the
  range's LayerFS Commits; each agent's category counts sum to its Steps.
- Branches' Commits sum to the range's Commits.
- Conflicts has every planned kind and the Unplanned row.
- The time line's stages sum to the total within 0.1 s.

## 4. STATS.md

Running totals in the same four shapes, one row per range plus a cumulative
row: time, calls per category, Commits, Branches, agents, conflicts hit/planned.
Ranges 000–004 are backfilled from their metrics; their committed reports stay
unchanged (F2).

## 5. Simulated example

A P2-shaped range (3 lanes, 9 agents, planned conflicts). **All numbers are
invented** to show the format.

> ## Overview · Range 057 · **watch** · attempt 1 · daemon `511dceeda1b5`
>
> **Time 41.8 s** (tooling): play 31.2 · consolidate 2.4 · verify 1.9 · probes 0.4 · tests 3.1 · seal + snapshot 2.6 · report 0.2
> **2,184 calls** · **1,042 Commits** (running 61,388) · **4 Branches** · **9 agents + lead** · conflicts **4 / 4** hit
>
> **Calls by category**
>
> | Category | Calls | Writes | Reads | Outcomes |
> | --- | --- | --- | --- | --- |
> | fs | 1,512 | 1,031 | 481 | Committed 1,004 · UpToDate 27 |
> | sandbox | 588 | 294 | 0 | mount 98 · exec 196 · commit 98 (Committed 61, UpToDate 36, Conflict 1) · unmount 98 · status 98 |
> | branch | 71 | 9 | 62 | fork 4 · merge 4 (Merged 3, Conflict 1) · publish 1 (Added 1) · diff_commits 58 · diff_branches 4 |
> | project | 8 | 0 | 8 | list_commits 8 |
> | operator | 5 | 0 | 5 | store.stats 5 |
> | **Total** | **2,184** | **1,334** | **556** | |
>
> **Branches**
>
> | Branch | Agents | Steps | Commits | Merged into main | Published |
> | --- | --- | --- | --- | --- | --- |
> | r057-1-packages-cli | a01 a02 a03 | 64 | 402 | ✓ (2nd try) | — |
> | r057-2-packages-core | a04 a05 a06 | 58 | 371 | ✓ | — |
> | r057-3-docs | a07 a08 a09 | 41 | 212 | ✓ | — |
> | main | lead | 12 | 57 | — | ✓ |
>
> **Conflicts**
>
> | Kind | Hit / planned | Where | Resolved in |
> | --- | --- | --- | --- |
> | Commit Conflict | 1 / 1 | r057-1, a02 after a01 | 0.8 s |
> | Stale clean merge | 1 / 1 | r057-2, a05 | merged cleanly |
> | Decoy edit | 1 / 1 | r057-3, a08 | reverted before the checkpoint |
> | Merge / publish race | 1 / 1 | lead merge vs r057-1 publish | 1.2 s, merged again |
> | **Unplanned** | **0** | — | — |
>
> **Agents**
>
> | Agent | Branch | Steps | fs | sandbox | branch | project | Commits | Conflicts |
> | --- | --- | --- | --- | --- | --- | --- | --- | --- |
> | a01 | r057-1 | 22 | 19 | 3 | 0 | 0 | 141 | — |
> | a02 | r057-1 | 21 | 17 | 4 | 0 | 0 | 129 | Commit Conflict |
> | a03 | r057-1 | 21 | 18 | 3 | 0 | 0 | 132 | — |
> | a04 | r057-2 | 20 | 18 | 2 | 0 | 0 | 130 | — |
> | a05 | r057-2 | 19 | 15 | 4 | 0 | 0 | 118 | stale merge |
> | a06 | r057-2 | 19 | 17 | 2 | 0 | 0 | 123 | — |
> | a07 | r057-3 | 14 | 12 | 2 | 0 | 0 | 71 | — |
> | a08 | r057-3 | 14 | 11 | 3 | 0 | 0 | 72 | decoy |
> | a09 | r057-3 | 13 | 12 | 1 | 0 | 0 | 69 | — |
> | lead | main | 12 | 3 | 4 | 4 | 1 | 57 | race |
> | **Total** | | **175** | **142** | **28** | **4** | **1** | **1,042** | **4** |

For a P1 range (fs only, one lane, one agent) the same shape reads, for example,
`1 [3] Branches · 1 [9] agents + lead`, with the conflict kinds shown as
`0 / 0 — (not played in P1)`.
