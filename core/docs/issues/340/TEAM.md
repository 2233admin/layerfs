# Crew team coordination — #340

> **Status:** Current planning checklist; no release candidate exists.

How the Crew team divides, builds and integrates [SPEC.md](SPEC.md) through LayerFS.
The same protocol runs in Build 1 and Build 2. Phase A turns this file into the frozen
team-lead and worker prompts; the main agent's own duties are in [ROLLOUT.md](ROLLOUT.md).

## Roles

| Agent | Codex slot | Can use | Owns | Never does |
| --- | --- | --- | --- | --- |
| Main agent | primary | repository, SDK, Docker, issue | environment, LayerFS fixes, halts, evidence, report | writes application code |
| Team lead | 1 | SDK, skill, SPEC, TEAM, its run folder | skeleton L0, lane plans, assignments, integration, branch merges, publishing to `main`, final acceptance | takes over a lane's features |
| W1, W2 | 2 | SDK, skill, lane brief, its run folder | `work` lane tasks | publishes to `main`, merges Branches |
| I1, I2 | 2 | SDK, skill, lane brief, its run folder | `insight` lane tasks | publishes to `main`, merges Branches |
| P1 | 1 | SDK, skill, lane brief, its run folder | `people` lane tasks | publishes to `main`, merges Branches |

Six subagent slots are all in use while the team runs. Replacing an agent means
closing it before spawning its successor.

The team lead and workers never read the LayerFS repository, its issues or earlier
runs. A LayerFS problem is reported, not worked around by reading LayerFS source.

## What each agent has

Every agent works in its own folder under the run folder:

```
<run>/agents/<agent>/
  scripts/        its own small .mjs SDK scripts
  out/            command outputs it chooses to keep
  daemon/         its Sandbox's daemon stdout and stderr, saved before close
  NOTES.md        its working notes and final report
```

- **One Sandbox per agent.** A Sandbox runs one operation at a time and refuses a
  second process with `Busy`, so agents never share one. Each agent creates its own Bash
  Sandbox at start and closes it at the end after saving its daemon logs.
- **Shared project settings.** All agents use the same `LAYERFS_HOME`, `LAYERFS_DOCKER`,
  `LAYERFS_IMAGE`, `LAYERFS_VOLUME`, `LAYERFS_DAEMON` and project name. Phase A
  confirms how `fs.*` and Branch calls from several processes share the service Sandbox
  and writes the exact rule into the frozen prompts.
- **Own trace file.** `LAYERFS_TRACE=<run>/trace/<agent>.jsonl` and
  `LAYERFS_TRACE_STEP="<agent>-<nnn> <milestone>: <summary>"`, numbering steps per agent.
- `LAYERFS_CONSTRUCTION_WORKERS=1`. Every command has an explicit wall timeout of at
  most 120 seconds; every `sandbox.exec` command also has an inner `timeout 110`.

## Branches

| Branch | Created by | Purpose |
| --- | --- | --- |
| `main` | Init | Only the team lead publishes to it |
| `lead` | Team lead | Skeleton L0 |
| `work.1`, `insight.1`, `people.1` | Team lead, from `main` after L0 | First generation of each lane |
| `<lane>.<g>` | Team lead | Next generation of a lane after an integration or sync |
| `int-<lane>-m<k>` | Team lead | Integration of a lane milestone with `main` |
| `int-<lane>-m<k>-r<n>` | Team lead | Re-integration after `main` moved during publishing |
| `final` | Team lead | Last integration before acceptance, if any lane is unmerged |
| `acceptance` | Team lead | Fresh fork of the final `main` Layer for full acceptance |
| `fix-*` | Team lead or assigned worker | Working forks for resolving a Branch-merge conflict |

`branch.merge` always creates a **new** Branch, so a lane moves to a new generation
when it takes in `main`. Workers commit only to the generation the lead last named.
Old generations stay in history as evidence.

## Worker step loop

Each tool call is one step and each step that changes files is one Commit:

1. **Read** with `fs.read`, `fs.grep`, `fs.glob`, `fs.list` on the lane Branch.
2. **Change source** with `fs.write`, `fs.edit` or `fs.apply` (one Commit each), or run
   **Bash** in a fresh Workspace: `sandbox.mount` → `sandbox.exec` → `sandbox.commit`
   → `sandbox.unmount`. Commit after every Bash call, failing ones included.
3. **Commit messages:** `<agent> <nnn> <milestone>: <what> (exit <code>)`, for example
   `W2 041 W-M2: npm test -w server (exit 1)`.
4. **Before reporting a task done**, run the affected packages' tests in a Workspace on
   the lane head and quote the result.

Refusals and uncertainty, following the skill:

| Event | Worker does |
| --- | --- |
| `HeadMoved` on `fs.*` | Another writer committed. Read again, redo the change |
| `Conflict` on `sandbox.commit` | Resolve in the same Workspace by reading both sides, run tests, Commit again. Discard and redo when the conflict is bigger than the change. `force` only with the lead's approval |
| `Conflict` involving a generated file | Regenerate it; a lockfile is regenerated with `npm install`; tell the lead if `/.lww` needs a new rule |
| `Busy` | Not expected with one Sandbox per agent: report a blocker |
| `Unknown`, `Failed`, lost reply | Inspect `branch.list_commits` and `sandbox.status` first. Never replay blindly |
| Anything that looks like a LayerFS defect | Stop that line of work, keep the evidence, report a blocker |

Workers on the same lane share its Branch. Their Commits merge on their own when they
touch different lines. They coordinate overlapping work through the lead.

## Messages

Agents talk through Codex messages in a star: workers ↔ team lead ↔ main agent. Each
message starts with its kind:

| Kind | From → to | Content |
| --- | --- | --- |
| `ASSIGN` | lead → worker | Lane Branch, milestone, task ids and acceptance for each task |
| `STATUS` | worker → lead | Tasks done with Commit ids and test results; next tasks |
| `DONE` | worker → lead | Milestone tasks complete, lane head, test results |
| `BLOCKER` | worker → lead → main | What failed, exact refusal or output, evidence paths, last good Commit |
| `PAUSE` | lead → workers | Finish the current step, commit, unmount, reply `PAUSED <last Commit>` |
| `RESUME` | lead → workers | The Branch to continue on and anything that changed |
| `HALT` | main → lead | Stop the whole team for a LayerFS fix; lead sends `PAUSE` to all |
| `HANDOFF` | worker → lead | Context nearly full: done, in progress, Branch, last Commit, open problems |
| `REPORT` | lead → main | Milestone integrations, conflicts, acceptance results, final report |

## Default split of work

The lead plans each lane before spawning workers, from these defaults. The lead may
change a split and records why.

| Agent | Default ownership |
| --- | --- |
| W1 | Issue core (fields, numbering, workflow states, API), comments and mentions, labels, relations, issue pages, CLI `issue` |
| W2 | Projects and workflow configuration, kanban board and ranking, bulk edit, sprints and burndown data, attachments, project/board/sprint pages, CLI `project`, `board`, `sprint` |
| I1 | Filter language, search index, search API and page, saved filters, CLI `search` |
| I2 | Activity feed, subscriptions, notifications, email outbox and digest, SSE live updates, dashboards, export/import, CLI `feed`, `inbox`, `export`, `import` |
| P1 | Organizations, teams, roles and permission middleware across all routes, invitations, sessions, password change/reset, API tokens, audit log, admin pages, CLI `org`, `team`, `invite`, `token` |

Lanes depend on each other where the product does. Insight indexes and notifies on
work's issues; people's permissions guard every route; the outbox serves both
invitations and notifications. A lane that needs another lane's code waits for it on
`main` or builds against the agreed interface in `shared/` and says so in `STATUS`.

## Rollout within a build

| Step | What happens | Done when |
| --- | --- | --- |
| T0 Skeleton | Lead alone builds L0 on `lead`, publishes it to `main` | All package tests pass on a fresh Branch from `main` |
| T1 Start | Lead forks `work.1`, `insight.1`, `people.1`, writes lane plans, spawns all five workers at once with `ASSIGN` | Every worker has mounted and committed its first step |
| T2 Milestone 1 | Lanes build M1; lead integrates each lane as it reports `DONE` | All three M1s on `main` |
| T3 Milestone 2 | Same for M2 | All three M2s on `main` |
| T4 Milestone 3 | Same for M3 | All three M3s on `main` |
| T5 Acceptance | Lead forks `acceptance` from the final `main` Layer and runs SPEC full acceptance | Every acceptance step passes |
| T6 Close | Workers save daemon logs, close Sandboxes and write their final `NOTES.md`; lead does the same and sends `REPORT` | No mounted Workspace or open Sandbox remains |

Lanes move at their own pace: one lane may be in M3 while another is in M2.

### Integrating a lane milestone

One integration at a time, in the order lanes report `DONE`. The lane keeps working
on `<lane>.<g>` during steps 1–5; `branch.merge` reads the heads at that moment and
never changes its inputs.

1. Note the lane head the worker reported with `DONE`.
2. `branch.merge("<lane>.<g>", "main", "int-<lane>-m<k>")`.
3. On `Conflict`: read both sides, resolve on `fix-*` working forks as the skill
   describes, or rule a generated path in the lane's `/.lww`, then merge again. The
   lead resolves, or assigns the worker who wrote the code and waits.
4. Mount the integration Branch: `npm ci`, `npm run build`, every package's tests.
   A failure after a clean merge is a broken-behavior conflict; fix it on the
   integration Branch and record it.
5. `branch.publish("int-<lane>-m<k>")`. On `HeadMoved`, merge `main` in again into
   `int-<lane>-m<k>-r<n>`, retest, publish. Check `overwrote` is empty.
6. Cut the lane over: `PAUSE` it, wait for every `PAUSED`, then
   `branch.merge("<lane>.<g>", "int-<lane>-m<k>…", "<lane>.<g+1>")` to combine the
   work done since step 1 with the integration. Resolve as in step 3, run the lane's
   tests and `RESUME` the lane on `<lane>.<g+1>`.

If the lane's head at step 2 is later than the reported `DONE` head, the integration
simply includes that extra work; the lead records which head was merged.

### Syncing a lane between milestones

When a lane needs code another lane has published, the lead pauses it, merges
`branch.merge("<lane>.<g>", "main", "<lane>.<g+1>")`, resolves as above, runs the
lane's tests and resumes the lane on the new generation.

### Halting for a LayerFS fix (Build 1)

On `HALT`, the lead pauses every lane, confirms all `PAUSED`, and each agent saves its
daemon logs and closes its Sandbox. The main agent fixes LayerFS and rebuilds. On its
go-ahead, each agent creates a new Sandbox and the lead resumes the lanes. The Store
and every Branch are kept; nothing is reinitialized.

In Build 2 a LayerFS blocker ends the run; see [ROLLOUT.md](ROLLOUT.md#build-2--independent-run).

### Replacing an agent

A worker near its context limit sends `HANDOFF`. The lead saves the handoff in its
ledger, has the worker close its Sandbox, closes the agent, then spawns a successor
with the same lane brief, the handoff and the current Branch. The successor gets the
next id (`W1b`), its own trace file and its own Sandbox.

## Team lead ledger

The lead keeps `<run>/agents/lead/LEDGER.md` current after every event, so it survives
its own context compaction:

- lane plans with task ids, owners and states;
- every Branch generation and what it was forked or merged from;
- every merge and publish with its kind, conflicts, `lww` decisions, `overwrote`,
  resolver, resolution and time taken;
- tests broken after clean merges and how they were fixed;
- blockers, halts, replacements and their timestamps.

The main agent reads this ledger to write the report; it does not replace the trace.
