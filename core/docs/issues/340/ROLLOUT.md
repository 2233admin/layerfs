# Main agent rollout — #340

> **Status:** Current planning checklist; no release candidate exists.

You are the main agent for LayerFS issue
[#340](https://github.com/Ephemeral-AI-Lab/layerfs/issues/340), under collection
[#336](https://github.com/Ephemeral-AI-Lab/layerfs/issues/336), working in
`/Users/yifanxu/Ephemeral-AI-Lab/layerfs`. You run every phase: you prepare the
environment, spawn and supervise the team, fix LayerFS in Build 1, keep the evidence
and write the report. You never write Crew application code.

Read first: root `AGENTS.md`, `core/AGENTS.md`, issue #340 and this folder
([SPEC.md](SPEC.md), [TEAM.md](TEAM.md), [REPORT.md](REPORT.md), [BUGS.md](BUGS.md)),
then the current `layerfs-js-sdk` and `layerfs-sdk-observe` skills. For the two-builder
precedent read [#337 README](../337/README.md) and [#337 RESULTS](../337/RESULTS.md).

## Standing rules

- Explicit Disposable / WAL / synchronous=OFF global Store only. Durable:
  **NOT_RUN — disabled by owner until explicit reauthorization**.
- `LAYERFS_CONSTRUCTION_WORKERS=1` for every process.
- Every command, build and test has an explicit wall timeout of at most 120 seconds.
  Commands through `sandbox.exec` also carry an inner `timeout 110`. Build test targets
  before running tests. A timeout is a failure: diagnose it before a changed follow-up.
- No automatic retries, no guessed replay after an uncertain outcome.
- Every repository commit records exact production LOC before/after/delta from
  `tools/production_loc.py` on the first-parent and staged trees.
- No push, PR or merge to Git `main` without owner authorization for #340.
- All timings, storage figures and ratios are diagnostic, not benchmarks.
- Phase A2 observed four active agents including the main agent. The lead and
  at most two workers run concurrently; all five logical worker roles remain in
  staggered milestone waves. Same-lane pairs overlap. Record this limitation
  explicitly and do not claim five-worker concurrency.

## Identity and folders

Work on Git branch `codex/issue340-node-multiagent`, created from current `main` in its
own worktree. The #340 documents are its starting inputs.

Every phase or run gets its own:

| Item | Pattern |
| --- | --- |
| Raw folder | `core/target/issue340/<run>/` (Build 2: outside the repository, see below) |
| Docker volume | `layerfs-issue340-<run>-<yyyymmdd>` |
| `LAYERFS_HOME` | `<raw folder>/home`, mode 0700, empty before Init |
| Project name | `crew-<run>-<yyyymmdd>` |
| Traces | `<raw folder>/trace/<agent>.jsonl`, one per agent and one for you |

Runs are `phase-a`, `b1`, `b2-r1` (and `b2-r2`… if a Build 2 run has to restart).
Keep a run ledger at `<raw folder>/MAIN-LEDGER.md`: phase, gates passed, agents alive,
Sandboxes open, halts, fixes and evidence paths. Update it after every event, so a
context compaction never loses the state.

For every run: Init is its own step, and the very next observation is
`operator.store.stats`, before any fork, skeleton or mount. Save both daemon log
streams of every Sandbox before closing it, including service Sandboxes.

## Phase 0 — documents and owner review

The documents in this folder exist. Present them to the owner, apply requested changes,
and wait for approval before Phase A. Owner approval is recorded in the issue.

## Phase A — pin, prove, freeze

No application work happens in Phase A. Each gate keeps its own receipts under
`core/target/issue340/phase-a/`.

**A1. Pin the environment.** Runtime image digest (Node 22), exact `node` and `npm`
versions, whether `node:sqlite` needs `--experimental-sqlite`, `npm view express version`
run from inside a Workspace (registry access), exact versions of `express`, `preact`,
`esbuild` and, if the image provides a browser, the browser and driver. Product source
commit, built Linux daemon and host addon SHA-256. Write `ENVIRONMENT.json` and
`DEPENDENCIES.md`. If the registry is unreachable from a Workspace, stop and report.

**A2. Prove the Codex team mechanics** with throwaway agents and no LayerFS work:
- you spawn a lead; the lead spawns five workers, if a subagent may spawn subagents;
- messages pass main ↔ lead ↔ each worker;
- a worker can be closed and replaced while six slots are in use;
- all slots are released at the end.

If subagents cannot spawn subagents, you spawn the lead and the five workers yourself
and the lead coordinates by messages. If workers cannot message the lead directly, you
relay. Record the topology that works; the frozen prompts use it.

**A3. Prove LayerFS under team load** with a scripted probe on a tiny npm project, no
agents. At least six concurrent client processes, each with its own Bash Sandbox: two
on one Branch, two on a second, two on a third. Each runs several rounds of mount →
`npm install` → `node --test` → commit → unmount. Also exercise:
- concurrent `fs.*` and Branch calls from all six processes (how the service Sandbox
  is shared, and whether any process sees `Busy`);
- same-Branch Commit merges, and one Commit conflict written into a Workspace and resolved;
- `branch.merge` clean, fast-forward, `Conflict`, and with a large `/.lww` list;
- `branch.publish` racing another publish (`HeadMoved`, `overwrote`);
- halting all clients, closing every Sandbox, replacing the daemon binary, new Sandboxes
  on the same Store, and every Branch intact.

A defect found here is fixed now, under the Build 1 fixing rules below, and only the
affected checks run again. If the per-agent setup needs a rule the skill does not state,
write it into the skill as live-checked guidance.

**A4. Check the skill live** for every multi-agent path the team will use (conflict
scenarios 1, 2, 5, 6, 7, 8 and 9 of the skill's conflict guide). Correct gaps.

**A5. Freeze.** Write from SPEC and TEAM:
- `LEAD-PROMPT.md`: the lead's complete instructions, including skeleton L0, the
  topology from A2 and the per-agent settings from A3;
- `WORKER-PROMPT.md` plus one lane brief per lane (`LANE-WORK.md`,
  `LANE-INSIGHT.md`, `LANE-PEOPLE.md`);
- `ACCEPTANCE.md`: exact acceptance commands, timeouts and expected outputs;
- the application LOC counter `count-loc.mjs` and its self-test;
- `FREEZE.json`: SHA-256 of every frozen input, the product commit and the binaries.

Commit the frozen inputs before Build 1 Init. Any later change to a frozen input is a
new freeze revision with its reason; the old one stays archived.

## Build 1 — fixing run

1. Create the run's volume and HOME; Init the project from an empty folder holding only
   `.gitignore`, `.lww` and a README stub, as its own step; capture initial stats.
2. Spawn the team lead with `LEAD-PROMPT.md`, the run's settings and the lane briefs.
   The lead builds L0, then schedules all five worker roles within the observed
   two-active-worker capacity (TEAM T0–T1 and the frozen prompt).
3. While the team works:
   - answer every `BLOCKER` the lead forwards. Decide whether it is a LayerFS/SDK/skill
     defect, an environment problem, or an application problem the team owns;
   - for a LayerFS defect: send `HALT`, wait for every agent to save daemon logs and close
     its Sandbox, keep the failing evidence, diagnose from source, fix with an external
     regression test, commit with the LOC record, rebuild the daemon and addon, record
     new hashes, then let the team create new Sandboxes and resume. Preserve the Store
     and every Branch; reinitialize only if the Store is unusable, and record why;
   - keep `BUGS.md` current;
   - do not edit application code or steer design; the lead owns the project.
4. The lead finishes T5 full acceptance on `acceptance` and sends `REPORT`. Verify it:
   read the acceptance receipts, rerun the LOC counter yourself through `fs.*` reads or
   a Workspace, check that no Workspace is mounted and every Sandbox is closed.
5. Collect Build 1 (see Phase D) before tearing anything down. Stop the volume's last
   service Sandbox only after the final Store observation.

## Rebuild and Build 2 freeze

After Build 1, rebuild the committed product tip and record its identities. Prepare a
standalone folder outside the repository, `~/.codex/issue340-independent/b2-r1/`,
holding only:

- the installed SDK and the copied SDK skill;
- SPEC, TEAM, `LEAD-PROMPT.md`, `WORKER-PROMPT.md`, the lane briefs and `ACCEPTANCE.md`
  as frozen (revised only for LayerFS facts Build 1 proved, as a new freeze revision);
- `count-loc.mjs`, the environment settings and empty run/output folders.

No Build 1 application code, scripts, ledgers, notes, conflict history or reports.

## Build 2 — independent run

1. Fresh volume, HOME, project, traces; Init as its own step; initial stats.
2. Spawn a **new** team lead with only the standalone folder and the frozen prompt; it
   spawns five new workers as in Build 1.
3. You only operate the environment and observe. You do not steer, hint, review code,
   or pass anything learned in Build 1 to the team.
4. The team fixes no LayerFS, SDK or skill code. A blocker goes to the lead's report
   with exact evidence. If a LayerFS defect blocks progress, end the run, preserve it
   as failed, return to the fixing rules, rebuild, and start a newly identified
   `b2-r<n+1>` from scratch. Never relabel a patched continuation as independent.
5. The lead finishes full acceptance and sends `REPORT`; the lead's and every worker's
   final `NOTES.md` are kept verbatim.

## Phase D — collect and report

For each run, before cleanup:

- page every Branch's history (`branch.list_commits`) and every lane generation and
  integration Branch; keep publication Layers and `overwrote` lists;
- final `operator.store.stats`; both daemon streams of every Sandbox;
- every agent trace, decoded and joined with daemon observations;
- the lead's ledger and every agent's `NOTES.md`;
- a stopped, checksummed Store export verified read-only with WAL visible, stored
  outside the worktree under `~/.codex/issue340-evidence/`.

Then write `RESULTS.md` with every section [REPORT.md](REPORT.md) requires and the
tables under `tables/`. Update #340 and collection #336 with actual outcomes, links and
limitations. Prepare closure for owner review; do not push or merge without approval.

## Done when

- Phase A gates passed and inputs frozen before Build 1 Init.
- Build 1 and an independent Build 2 each finished SPEC full acceptance, or a failed
  run is preserved with its reason.
- Every LayerFS fix has a retained failure, a regression test and a LOC record.
- `RESULTS.md` covers every REPORT.md section, with tables, evidence and limitations.
- No mounted Workspace, open Sandbox, running application process or live agent remains.
