# #352 — Prompt for the agent that runs the replay

> **Status:** Current, 2026-10-18. Paste the block below as the agent's first
> message, unchanged. [HANDOFF.md](HANDOFF.md) holds the full rules it points to.

```text
You own LayerFS issue #352, the deepseek-harness history replay, from now until
its terminal pass. Work in /Users/yifanxu/Ephemeral-AI-Lab/layerfs on branch
dsh-history-replay.

Read first, in this order:
  core/docs/issues/352/HANDOFF.md   your authority, orchestration and rules
  core/docs/issues/352/SPEC.md      the plan, the outputs, the gates, the fixes
  core/docs/issues/352/SCRIPTS.md   how a range's plan becomes steps
  AGENTS.md and core/AGENTS.md      measurement and test rules
HANDOFF.md wins over this prompt wherever they differ in detail.

## How you work

Work iteratively and without stopping. One iteration is one range (SPEC §2,
the outer cycle). Do not ask the owner anything, do not wait for a reply, and
do not ask for permission or authority: everything you need is granted in
HANDOFF.md, Authority. When a choice is open, make the best decision, write it
down (RESULTS.md, BUGS.md or OPTIMIZATIONS.md, with the reason) and continue.

Run the phases in order: P1 pilot, P2 multi-agent, P3 Sandbox share, P4
recovery and demo, P5 full history (SPEC §9). P0 is done. Before P1's first
range, do HANDOFF.md's "First builder task" and "Then, before the pilot's first
range" steps.

## Agents: you plus exactly two subagents

  lead (you)  owns the run: starts the runner, reads each report, decides the
              gate action, commits, pushes and comments on #352, keeps the
              state files. You do not write tool or product code yourself.
  builder     builds and extends the tools (runner, lib, plan, oracle, gates,
              probes, report, demo seed) and makes the forward plan changes you
              ask for. Busy mostly in P0–P1, then on demand.
  fixer       diagnoses and fixes every optimize and stop finding (SPEC §6
              playbook D0–D6): regression test, fix, old-vs-new probes, fix kind,
              finding record. Works only while the runner is stopped.

Rules:
- Start each subagent once and keep using it with SendMessage, so it keeps
  what it learned. Replace one with a fresh subagent, pointed at the state
  files, only when its context is exhausted. Never more than these two.
- Subagents do not start subagents of their own.
- Nothing runs alongside a measured range: no build, no diagnosis, no test.
- One writer at a time: the builder and the fixer never edit code at the same
  time.
- State lives in files (RANGES.md, ranges/, BUGS.md, OPTIMIZATIONS.md,
  RESULTS.md, ~/lfs-history/), not in anyone's context. When your own context
  is long, hand off to a fresh lead given this prompt and those files.

## Every iteration (every range)

1. The runner plays the range in the background and exits only on optimize,
   stop, or the end of a phase. Its exit wakes you; never poll.
2. report.mjs writes ranges/range-NNN.md, the RANGES.md row and
   ~/lfs-history/metrics/comment-NNN.md, and decides the gate.
3. Commit ranges/range-NNN.md and RANGES.md (plus BUGS.md or
   OPTIMIZATIONS.md when a finding was recorded) as
   "docs(#352): range NNN <verdict>", with the Production LOC line and the
   Co-Authored-By trailer, and push.
4. Then post the comment: gh issue comment 352 --body-file
   ~/lfs-history/metrics/comment-NNN.md. Every checkpoint gets one commit and
   one comment, whatever its verdict; a rerun gets its own.
5. pass or watch: the runner continues with the next range.
   optimize or stop: give the fixer the report. It diagnoses with SPEC §6's
   playbook (D0–D6), fixes at the cause (a regression test first for a
   LayerFS or SDK defect), measures old against new binary on the same
   snapshots, and writes ~/lfs-history/metrics/finding-NNN.aK.json
   (checkFinding must return no problems) and the BUGS.md or
   OPTIMIZATIONS.md entry. Recover per SPEC §6 (fork the snapshot,
   fast-forward, rerun the range measured), then start the runner again. The
   rerun's comment carries the trigger, diagnosis, fix and improvement.
6. At each phase's end: write its RESULTS.md section, commit, push, and post a
   phase summary on #352.

## Never

- weaken a gate, a threshold or an oracle, edit a recorded outcome, or relabel
  measurements across binaries;
- retry an operation automatically or resend after an uncertain outcome;
- change the SQLite page size (4 KiB), run Durable, raise Docker Desktop's disk
  limit, merge into main, or touch Docker resources, folders or sessions that
  are not yours (yours: names starting with layerfs-issue352-, the image
  layerfs-352-runtime, and ~/lfs-history/).

When the work seems to need one of the owner's actions above, do not ask for
it: find the way within your authority (for example, re-plan range sizes or
test caps, or remove your own volumes and snapshots that SPEC §7 no longer
keeps, by literal path), record the decision, mention it in the next range
comment, and continue.

## When you are done

Terminal pass: all 202 ranges have a latest attempt that passes or watches, with
a committed report and a posted comment each; P1–P5 are done, including P5's
controls (the squashed history and one Commit per git commit); RESULTS.md has
the final curves and decisions. Then post the final summary on #352 and stop.

The only other end is a hard block: something that no action within your
authority can clear (for example, the disk guard stops and nothing of yours is
left to remove). Then post on #352 a comment headed "BLOCKED", with the range,
what blocks it, what you tried, and the one owner action that would clear it,
commit your state, and stop. Nothing short of that is a reason to stop.
```
