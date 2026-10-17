# Handoff prompt — #352

> **Status:** Current; give this whole file to the agent that runs #352.

You own LayerFS issue [#352](https://github.com/Ephemeral-AI-Lab/layerfs/issues/352)
(dsh history replay). You work in `/Users/yifanxu/Ephemeral-AI-Lab/layerfs` on
branch `dsh-history-replay`.

Replay deepseek-harness's git history on LayerFS as multi-branch, multi-agent
work. For each range:
- prove that main matches git at the checkpoint;
- record the outputs [SPEC.md](SPEC.md) §3 lists;
- decide the gates.

Optimize what the gates flag. Run phases P0–P5 in order.

**Keep going until P5 is done or a Stop gate needs the owner.** Do not ask
questions and do not wait for replies. Make the best decision, write it down in
`BUGS.md`, `RESULTS.md` or `OPTIMIZATIONS.md`, and continue.

## Authority

You need no further approval to:
- write the tools, scenarios and docs SPEC.md names;
- change any code (dsh packages, the SDK, LayerFS core, tools, tests) to fix a
  bug or an optimize finding;
- change the delta depths further, following SPEC.md §8;
- commit and push `dsh-history-replay`, and comment on #352;
- create the Docker volumes, containers and host folders the run needs, under
  names starting with `layerfs-issue352-` and under `~/lfs-history/`.

You do **not** have authority to:
- change the SQLite page size (it stays 4 KiB);
- run Durable;
- raise Docker Desktop's disk limit;
- merge into `main`.

When you need one of these, stop and say so on #352.

## Read first

1. Root `AGENTS.md` and `core/AGENTS.md`, especially the measurement rules
   (§1–§3) and the test ceiling (§4).
2. [SPEC.md](SPEC.md): the plan, the per-range outputs, the scaling rules, the
   gates, the fix rules, disk, and the delta depth. It is the plan. Improve it
   where the work shows it is wrong, in the same commit as the change.
3. [SCRIPTS.md](SCRIPTS.md): how a range's plan becomes steps, a dsh scenario
   (lead and subagents) and the headless runner, through one step library.
4. `dsh/README.md`: "Mock model and demos", "The demo workspace" and "Develop".
5. What you build on:
   - `dsh/tools/run-scenario.mjs`, `dsh/scenarios/shared/replay.mjs`,
     `dsh/tools/import-run.mjs`;
   - `dsh/tools/check-scenario.mjs`, `dsh/tools/check-demo.mjs`,
     `dsh/tools/restore-store.mjs`;
   - `dsh/scenarios/crew/` (many agents) and `dsh/scenarios/conflicts/`;
   - `sdk/js/README.md` for the method table, the operator (`store.stats`,
     `store.commits`, `files.stats`) and the call trace (`LAYERFS_TRACE`, with
     daemon phase timings and storage counters).
6. The content model: `cas_cdc_deltaencoding_handbook.md`;
   `core/crates/layerfs-content/src/contract/policy.rs`;
   `core/crates/layerfs-storage/src/store/policy.rs`.

## What is already done

- **P0 is done.** `dsh/tools/history/` holds the git helpers and blob cache,
  `plan.mjs`, `oracle.mjs`, `gates.mjs` and `report.mjs`, with tests (in
  `npm test`). The plan (`~/lfs-history/plan/`) and the oracles
  (`~/lfs-history/oracle/`) exist for all 202 ranges, and every range's plan
  passes the static check. The results are in SPEC.md §2, "P0 results". Your
  work starts at P1, with `run.mjs`.
- **dsh source:** the full bare clone is `~/lfs-history/dsh.git` (SPEC.md §1). The
  owner's checkout is a partial clone and cannot be cloned locally.

- Issue #352, SPEC.md and this file.
- The delta depth defaults are doubled for new Stores: chunk 4 → 8, whole-file
  8 → 16; metadata stays 8 (SPEC.md §8). Tests of layerfs-content, -storage,
  -persistence, -project and -api pass with them. Any Store you create gets them
  unless you pass another policy.

## Environment

- **dsh source:** `/Users/yifanxu/Ephemeral-AI-Lab/deepseek-harness`. Never edit
  it. Read history only from `~/lfs-history/dsh.git`, the full bare clone from
  GitHub.
- **Run folders:** `~/lfs-history/` for the plan, oracles, snapshots and metrics.
  Commit only what SPEC.md §10 lists and the small demo folder.
- **Linux daemon:** `core/target/cluster2-linux/release/layerfs-daemon`. Rebuild
  it after any change to core; `core/AGENTS.md` has the build. Record each
  binary's id in the run manifest and label every measurement with it.
- **Runtime image:** choose one with Node and pnpm that matches dsh's
  `package.json` engines. Pin it by digest in the manifest.
- **dsh web, for the P4 demo:**
  - use your own scratch `DSH_HOME`, set up as `dsh/README.md` describes;
  - never use `~/.dsh`, which is the owner's real home;
  - use a free port;
  - leave other sessions' servers (8792, 8793, 8795) alone.
- **Containers:** leave `hungry_chebyshev`, `reverent_raman` and anything named
  `layerfs-issue325-*` alone.
- **Sandbox escapes:** `git push`, `gh` and Docker need the sandbox disabled.

## How to work

- **Fast loops while developing.** Run one step, one lane or one range before a
  whole phase. Use the fast-rebuild player to reach a range quickly. Measured
  runs use the measured player only, at final binary identity.
- **Maximum speed, always** (SPEC.md §2). The headless player has no delays.
  The `dsh-history` scenario plays at Max (`"speed": 0`), including P4's Live
  window. Agents run concurrently. Never slow a run down to make it pass.
- **Order comes from barriers.** It never comes from pauses or delays. A planned
  conflict that depends on timing is a bug in the plan.
- **One sample per case.** Follow AGENTS.md §3: no best-of, no rerun of an
  unchanged treatment. Keep failed and ineligible runs, and record their cause.
- **Warm caches never credit a measured phase** (AGENTS.md §1). Each probe
  declares its cache state.
- **Construction workers.** Export `LAYERFS_CONSTRUCTION_WORKERS=1` for
  measured runs (AGENTS.md §3.8).
- **Run lengths.** A range or a phase is a long run: start it in the background
  and read its log. Every test or check invocation has a wall timeout of at most
  120 s (`perl -e 'alarm 120; exec @ARGV' …`). Build first with `--no-run`.
- **Checkpoints and disk.** Follow SPEC.md §7: a proof checkpoint every range,
  a sealed snapshot on its cadence with a manifest, milestones restored and
  verified, retention of the last 2 plus about 6 milestones, and the disk guard
  before every range.

## Orchestration

Three agents run the work.

| Agent | Job | When it works |
| --- | --- | --- |
| **Lead** (you) | Owns the run: starts the runner, reads each range's report, decides the gate action, keeps the state files, posts on #352 | Throughout; idle while ranges pass |
| **Builder** (your subagent) | Builds and extends the tools: plan, oracle, player, gates, probes, report, demo seed. Makes forward plan changes you ask for | Mostly P0–P1, then on demand |
| **Fixer** (your subagent) | Diagnoses and fixes optimize and stop findings with SPEC.md's diagnosis playbook: the regression test, the fix, the old-vs-new probes, the fix kind | Whenever the runner stops |

**The loop:**
1. Start the runner (`run.mjs`) in the background. It plays ranges back to back
   and writes each range's report. It exits only when a range ends as optimize or
   stop, or when the phase is done. Its exit wakes you, so do not poll.
2. On waking, read the report. Give the fixer the report and the stop reason.
3. When the fixer reports, recover per SPEC.md §6 and start the runner again.

**First builder task (P1):** wire per-call SQL work (`SqlWork`) and per-Workspace
FUSE opcode counts into the SDK call trace. The P0 check found that neither
reaches it (SPEC.md §6). The fixer's playbook (D0–D6) depends on them.

**Rules:**
- Continue the same builder and fixer with SendMessage, so they keep what they
  learned. Start a fresh one, pointed at the state files, only when its context
  is exhausted.
- Nothing runs alongside a measured range: no build, no diagnosis, no test. The
  fixer works only while the runner is stopped.
- One writer at a time: the builder and the fixer never edit code concurrently.
- State lives in files, not in context: the manifest, `RANGES.md`, `ranges/`,
  `BUGS.md`, `OPTIMIZATIONS.md` and `RESULTS.md`. When your own context is long,
  hand off to a fresh lead pointed at this file and those.

## Each phase

1. Build what the phase needs, with tests for the tools: plan, oracle and gates
   logic are pure functions of git and metrics.
2. Run it.
3. At every range completion:
   - write `range-NNN.json` and the report `ranges/range-NNN.md`;
   - add the row to `RANGES.md`;
   - decide the gate.
4. Act on the gate:
   - **Stop:** run the bug cycle.
   - **Optimize:** fix it, then compare old and new binaries with the probes on
     the same snapshots.
   - Recover per SPEC.md §6. Never redo a checkpoint's proof.
5. Close the phase:
   - write its section in `RESULTS.md`;
   - commit and push;
   - post a short summary on #352 with the numbers and the commit.

Attention points the owner asked for:
- **Scaling rules.** Read SPEC.md §4 for the rules. If a probe that should stay
  flat grows with tree size or history depth, that is a finding even when the
  times are small. Read the internal counters, not just times.
- **Mount and logical construction speed** is an explicit optimization target.
- **Delta depth.** Run the old-depth control arm in P1 and decide by SPEC.md §8.
  Report the depth distribution and the cap-vs-budget shares for every range.

## Bugs

- Fix each bug at its cause, in whichever layer has it.
- A LayerFS or SDK defect gets a failing regression test first, then the fix.
- Add one line per finding to `BUGS.md`, with its fix kind and its recovery.
- Keep failed runs. The passing run is a new run after the last fix.

**Not allowed:**
- weakening a gate, a threshold or an oracle to make a range pass;
- editing a recorded outcome;
- relabeling measurements across binaries.

## Standing rules

- Disposable / WAL / `synchronous=OFF` Store only. Durable stays **NOT_RUN —
  disabled by owner until explicit reauthorization**.
- The SQLite page size stays 4 KiB.
- One attempt per operation: no automatic retry, and no blind resend after an
  uncertain outcome.
- `rm` only with literal paths.
- New production files stay under 999 lines.
- Never commit `dsh/assets/`.
- Commit only your own paths (`git commit -- <paths>`).
- Every commit records `Production LOC: <before> -> <after> (delta ±N)` from
  `python3 tools/production_loc.py`, and ends with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Finish

When P5 is done:
1. Write the final `RESULTS.md`:
   - the latency-vs-depth and storage curves;
   - history cost separated from tree size and from Commit granularity;
   - the delta decision;
   - every optimization with its probe table.
2. Push `dsh-history-replay` and post the summary on #352. Leave the merge into
   `main` to the owner.

Your final message says exactly:
- what ran and what passed;
- what was fixed or optimized;
- where the evidence is.

Claim nothing that was not run.
