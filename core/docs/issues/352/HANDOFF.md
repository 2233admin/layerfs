# Handoff prompt — #352

> **Status:** Current, 2026-10-18 (second crew). The agent that runs #352 starts
> from [PROMPT.md](PROMPT.md), which points here. Start with "State at handoff"
> below; [ROLES.md](ROLES.md) replaces the "Orchestration" section where they
> differ.

You own LayerFS issue [#352](https://github.com/Ephemeral-AI-Lab/layerfs/issues/352)
(dsh history replay). You work in `/Users/yifanxu/Ephemeral-AI-Lab/layerfs` on
branch `dsh-history-replay`.

Replay deepseek-harness's git history on LayerFS as multi-branch, multi-agent
work. For each range:
- prove that main matches git at the checkpoint;
- record the outputs [SPEC.md](SPEC.md) §3 lists;
- decide the gates.

Optimize what the gates flag. Run phases P0–P5 in order.

**Keep going until the terminal pass** (PROMPT.md, "When you are done"). Do not
ask questions, do not ask for authority, and do not wait for replies. Make the
best decision, write it down in `BUGS.md`, `RESULTS.md` or `OPTIMIZATIONS.md`,
and continue. A stop gate is a bug cycle you run, not a reason to wait.
PROMPT.md's **Non-stop rule** (owner, 2026-10-18) is binding on the lead and
both subagents and overrides any wording here that seems to allow a pause or a
question: the only ends are the terminal pass and a hard BLOCKED.

## Authority

You need no further approval to:
- write the tools, scenarios and docs SPEC.md names;
- change any code (dsh packages, the SDK, LayerFS core, tools, tests) to fix a
  bug or an optimize finding;
- change the delta depths further, following SPEC.md §8;
- commit and push `dsh-history-replay`, and comment on #352;
- create the Docker volumes, containers and host folders the run needs, under
  names starting with `layerfs-issue352-` and under `~/lfs-history/`, and remove
  your own (by literal name or path) when SPEC.md §7 no longer keeps them;
- use the image `layerfs-352-runtime:node24`, and rebuild it from its Dockerfile
  when a range needs it (a new id is a new binary; record it).

You do **not** have authority to:
- change the SQLite page size (it stays 4 KiB);
- run Durable;
- raise Docker Desktop's disk limit;
- merge into `main`.

Never do these. When the work seems to need one, find the way within your
authority (re-plan range sizes or test caps, remove your own data that is no
longer kept), record the decision and continue. Only a hard block that nothing
within your authority clears ends the run early: post a "BLOCKED" comment on
#352 with what would clear it (PROMPT.md), and stop.

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
7. [ROLES.md](ROLES.md): who works when, the scout lane and storage isolation.
8. [LESSONS.md](LESSONS.md): speed rules, lead bookkeeping, troubleshooting and
   known traps learned in P1. Read it before the first command.
9. [RESULTS.md](RESULTS.md) decision log, [BUGS.md](BUGS.md),
   [OPTIMIZATIONS.md](OPTIMIZATIONS.md), [fixes/](fixes/README.md) and
   [RANGES.md](RANGES.md): the state so far.

## State at handoff (2026-10-18, after range 2)

The first crew stopped on the owner's instruction after range 2's optimized
rerun was committed and commented. Nothing is running; the tree is clean.

**Ranges.** Main line is run `p1-pilot-b` (volume `layerfs-issue352-p1-pilot-b`,
`~/lfs-history/runs/p1-pilot-b/`, `state.json` `next: 3`).

| Range | Latest attempt | Verdict | Binary | Note |
| --- | --- | --- | --- | --- |
| 000 | a1 | watch | `0ef24121` | directory share 0.53 |
| 001 | a1 | watch | `0ef24121` | directory share 0.52 |
| 002 | a2 | watch | `511dceed` | a1 optimize (fork rows, grep); fixed with merge ancestry, diff_commits and project lookup; a2 watches list_largest 0.16 and merge.fullscan_steps 0.324 on 2 seeded points |

Each has a committed report, a RANGES.md row and a #352 comment. Ranges 0–1 of
`p1-pilot-b` were fast-rebuilt in the new Store format (oracle-checked), so their
measured attempts stay those of the abandoned line `p1-pilot` (old format,
binary `0ef24121`), kept as evidence.

**Binaries.** Daemon `511dceeda1b5ec7e4c65b50f4f885bc60f25d6beac1c0735c7e044c12e1e7ad0`
at `core/target/cluster2-linux/release/layerfs-daemon`, copies of every daemon by
id under `core/target/issue352/daemon-<id>/`; SDK addon `506b646f7d0a…`; image
`sha256:d3773b4eac6a…`; source `0c347ad33` and later docs. Store format includes
`binding_hint`; older Stores are refused on open.

**Built and proven:** trace wiring (SqlWork, FUSE opcodes, delta outcomes);
`run.mjs` (new, play measured/fast, fork, cleanup), `lib.mjs`, `steps.mjs`;
snapshots per run; `inspect.mjs` ls/cat/diff/stats; same-binary gates with
probe seeds (`~/lfs-history/metrics/probes-<daemon>.json`); per-stage tooling
time; calibration of ranges 0–4 (`tests-000..004.json`); the `node_modules` Init
ratio (RESULTS.md, P1).

**Not built:** the scout lane, `lines.json`, read-only pnpm mounts, the
cross-lane disk guard (ROLES.md §4–§5); `run.mjs recover` and the one-command
dev reproduction; the tooling overhead cuts (LESSONS.md S2); the P2–P5 players;
the viewer (P4). Unfinished viewer pieces are parked on the local, unpushed
branch `dsh-352-viewer-wip` (`1609344d2`: seeding a dsh demo from a snapshot,
container/volume prefixes, `assemble` waits); still missing there are
`scenario.mjs`, the scenario calls in `lib.mjs`, the plan-backed checks and
`view.mjs`. One limit: P1 plays on one lane, so a viewer of P1 ranges plays one
agent at a time.

**Open findings:** F-001 (fs request cap 65,519 bytes; fix before P3), F-002
(full-scan steps, bounded, watch), F-004 (`report.mjs` rewrote recorded reports
of earlier ranges after a gate change; the lead restored them; fix before the
next range). Watches: directory share ~0.53, list_largest, merge.fullscan_steps.

**Resources:** volumes `layerfs-issue352-p1-pilot` (abandoned line, evidence),
`layerfs-issue352-p1-pilot-b` (main line), `layerfs-issue352-pnpm-store`; snapshots
19 MB under `~/lfs-history/snapshots/`; ledgers under `~/lfs-history/ledger/` and
each run folder.

### Next, in order

1. **Builder:** fix F-004 (a regression test: playing range k leaves earlier
   reports byte-identical). Commit; the lead pushes.
2. **Lead:** `node dsh/tools/history/run.mjs play --run p1-pilot-b --from 3 --to 4
   --mode measured` in the background; commit, push, comment per range
   (LESSONS.md §2). Range 4 is a milestone: restore its snapshot into a fresh
   volume and run the oracle check and `PRAGMA quick_check` (SPEC §7).
3. **Control arm:** `run.mjs new --run p1-control --phase p1 --label control
   --policy control`, then `play --run p1-control --from 0 --to 4`; it must run on
   the same daemon as the arm it is compared with. Decide the delta depth per
   SPEC §8 and record it in RESULTS.md.
4. **Close P1:** baselines and gate thresholds from same-binary points (SPEC §5),
   wall time × 202 against the budget, growth against SPEC §7; RESULTS.md P1
   section; phase summary on #352.
5. **Builder, before P2:** the scout lane and its storage rules (ROLES.md §4–§5),
   `recover`, the dev reproduction command, the overhead cuts with the pilot's
   stage times, then P2's player. Calibrate P2's ranges just before P2.

## What was done before the first crew (history)

- **P0 is done.** `dsh/tools/history/` holds the git helpers and blob cache,
  `plan.mjs`, `oracle.mjs`, `gates.mjs` and `report.mjs`, with tests (in
  `npm test`). The plan (`~/lfs-history/plan/`) and the oracles
  (`~/lfs-history/oracle/`) exist for all 202 ranges, and every range's plan
  passes the static check. The results are in SPEC.md §2, "P0 results". Your
  work starts at P1, with `run.mjs`.
- **P1 tools are written, tested on synthetic data, and never run on real
  data:** `snapshot.mjs`, `inspect.mjs`, `unit-tests.mjs` with
  `calibrate-tests.mjs`, the test selection in `plan.mjs` (plan v2), and the
  range-growth and snapshot-time gates (tests in `tools/history/tests/tools.mjs`).
  The plan on disk is still v1: regenerate it (`plan.mjs`, then `oracle.mjs
  build`) before calibrating. Their first real runs are P1's, and each is a
  finding if it fails.
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
- **Checkpoints and disk.** Follow SPEC.md §7: a proof checkpoint every range
  (changed paths by `diff_commits`, the full tree at snapshots), block-incremental
  snapshots in one shared block store when due, milestones restored and verified,
  recovery by forking a snapshot (never by extracting from a Store), and the disk
  guard before every range.
- **Ignored files.** Follow SPEC.md §2, Ignored files: `node_modules` installed on
  top of the existing tree, a clean install only at milestones, no desktop
  build, the pnpm store outside LayerFS.
- **Tests.** Cheap unit tests only (SPEC.md §2, Tests): never a browser,
  Selenium or Playwright, Electron, the native addon, the network or dsh's own
  test scripts. A unit test must give its native result; one that passes
  natively and fails in LayerFS is a stop, never a new skip.
- **Troubleshooting a checkpoint.** Use `inspect.mjs` (SPEC.md §7, Inspecting a
  checkpoint) on the live Store or a fork, never on snapshot files in place.

## Orchestration

[ROLES.md](ROLES.md) is the current, consolidated version of this section
(actors, triggers, the scout lane, storage isolation). Where they differ, it wins.

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

**Then, before the pilot's first range (P1):**
1. One Init of a dsh checkout with `node_modules`; record its stored-to-raw
   ratio in `RESULTS.md` against SPEC.md §7's estimate.
2. Regenerate the plan as v2 and its oracles; fill the pnpm store once
   (`pnpm fetch`); run `calibrate-tests.mjs` for the pilot's ranges. The image
   is `layerfs-352-runtime:node24` (SPEC.md §2, Runtime image); prove one
   `sandbox.create` with its id first.
3. Wire the written tools into the runner: seal, then `snapshot.mjs take` when
   `due` says so, with the manifest facts (SPEC.md §7); the range's unit tests
   with `vitestCommand` and `compareResults`; `head` and `snapshot` in the
   metrics.
4. Prove `snapshot.mjs fork` and `inspect.mjs diff` and `stats` on the first
   pilot snapshot.

**Rules:**
- Continue the same builder and fixer with SendMessage, so they keep what they
  learned. Start a fresh one, pointed at the state files, only when its context
  is exhausted.
- Exactly these two subagents: never more, and they start none of their own.
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
   - decide the gate;
   - commit and push the checkpoint, then comment (in this order, because the
     comment links the pushed report):
     1. commit `ranges/range-NNN.md` and `RANGES.md`, plus `BUGS.md` or
        `OPTIMIZATIONS.md` when a finding was recorded, as
        `docs(#352): range NNN <verdict>` with the Production LOC line and the
        trailer; push;
     2. post `~/lfs-history/metrics/comment-NNN.md` (`report.mjs` writes it in
        SPEC.md §3's fixed format) with `gh issue comment 352 --body-file <it>`.
     Every range gets one commit and one comment, whatever its verdict; a rerun
     adds a commit and a comment for its attempt.
   - When the runner stops on optimize or stop, the comment says so with the
     trigger and "diagnosis pending". The fixer writes
     `~/lfs-history/metrics/finding-NNN.aK.json` (`findings.mjs`; `checkFinding`
     must return no problems). The rerun's comment then carries the trigger,
     diagnosis, fix, recovery and the old-vs-new improvement table.
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
