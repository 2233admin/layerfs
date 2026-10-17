# #352 — Roles and when each one works

> **Status:** Current, 2026-10-18. Consolidates the crew of the dsh history replay:
> the agents, the processes they start, and when each one works. It replaces
> HANDOFF.md's "Orchestration" section where they differ. Owner rules in
> HANDOFF.md (authority, never-do list) and AGENTS.md stay binding.

## 1. Actors

Two kinds. **Agents** think and write. **Processes** are runs the lead starts;
each one wakes the lead when it exits, so nobody polls.

| Actor | Kind | Owns | Never |
| --- | --- | --- | --- |
| **Lead** | agent | Every decision; the state files (`RESULTS.md`, `BUGS.md`, `OPTIMIZATIONS.md`, `RANGES.md`, `ranges/`, this file); every commit of those files; pushing; every #352 comment; starting and stopping every process; cleanup of run resources | Writes tool or product code |
| **Builder** | subagent | `dsh/tools/` (runner, lib, plan, oracle, gates, probes, report, snapshot, inspect), plan and oracle regeneration, runner features (scout lane, recover, viewer in P4) | Fixes product code in `core/` or `sdk/` |
| **Fixer** | subagent | Diagnosis and fix of every optimize and stop finding (SPEC §6, D0–D6) in `core/` and `sdk/`, with the regression test, old-vs-new probes, `finding-NNN.aK.json`, and one `fixes/NNN-aK-<slug>.md` per cause | Tool features beyond what its own fix needs |
| **Measured lane** | process (`run.mjs play --mode measured`) | The record: timed ranges, gates, reports, comments' sources | Running alongside any build, test, diagnosis, scout or viewer |
| **Scout lane** | process (`run.mjs`, scout mode; **not built yet**) | Proving later ranges ahead and queuing counter findings while the fixer works | Producing reports, timings that count, or issue comments |
| **Viewer** | process (P4; **not built**) | Playing range k on a fork in dsh for the owner to watch | Touching a live Store |

**Non-stop rule** (PROMPT.md, owner 2026-10-18): every actor keeps working
until the terminal pass and never asks a question. The lead decides and records;
a subagent decides within its task and reports what it decided, with a
recommended action for any true blocker. "Owner asks to watch" below means the
owner's own direction, never a question the lead puts to the owner.

Exactly two subagents: the builder and the fixer. Each is started once and
continued with SendMessage; a fresh one replaces it only when its context is
exhausted, pointed at the state files. Subagents start no subagents. The scout,
the measured lane and the viewer are processes, not agents.

## 2. When each one works

| Situation | Lead | Builder | Fixer | Measured | Scout | Viewer |
| --- | --- | --- | --- | --- | --- | --- |
| Ranges passing | sleeps until the runner exits | idle | idle | **runs** | off | off |
| Optimize finding | commits, comments, hands off | idle | **fixes** | stopped | **runs ahead** (once built) | off |
| Stop finding (wrong result) | commits, comments, hands off | idle | **fixes, first priority** | stopped | **off**: same binary, same bug | off |
| Tool or plan change | decides, asks the builder | **builds** | idle | stopped | off | off |
| Owner asks to watch (P4 onward) | starts the viewer | — | — | stopped | stopped | **runs** |
| Phase end | RESULTS section, summary comment | next phase's tools | — | stopped | off | off |

**One code writer at a time** (owner rule): the builder and the fixer never edit
code at the same time. A fix that needs a tool change asks the lead, who
sequences it.

**Nothing runs alongside the measured lane**: no build, test, diagnosis, scout,
viewer or fork. The fixer's work and the scout may overlap each other, because
neither is a measurement.

## 3. Triggers

- **Measured lane:** the lead starts it when no code is being written and no
  scout or viewer runs. It plays back to back and exits only on optimize (3),
  stop (4), guard (5), error (1) or the phase's end (0).
- **Fixer:** when the measured lane exits 3 or 4, or a scout-queued finding is
  next. Its first step for a queued finding is to re-check it on the current
  binary, from counters on a fork (a fix may already have cured it).
- **Builder:** at a phase start for that phase's tools; for a forward plan
  change; for a gate or report defect; for a feature the owner asks for.
- **Scout** (after the builder builds it): the lead starts it when an optimize
  fix begins, from the newest main-line snapshot; stops it when the fix lands,
  on a wrong tree, or at the disk guard.
- **Viewer** (P4): only while the measured lane is stopped, on the owner's request.

## 4. The scout lane (to build)

| Measured lane stopped for | Scout? | Why |
| --- | --- | --- |
| Optimize (correct but slow) | Yes, from range k's snapshot, plays k+1, k+2, … | The tree is right, so later ranges are valid |
| Stop (wrong result) | No | Same binary, same bug; it would build later ranges on wrong state |
| Nothing (ranges passing) | No | Never alongside the measured lane |

While the fixer works, the scout proves each later range's tree against git,
takes snapshots, queues further optimize findings from the deterministic
counters (`~/lfs-history/queue.json`) without stopping, and stops on a wrong
tree. Its timings never count: they ran alongside the fixer.

When the fix lands: stop the scout; the measured lane forks the newest
snapshot whose format matches its binary and replays the backlog measured; the
fixer takes the next queued finding.

**Queue order:** stops first, then optimize findings by severity (the counter
with the steepest depth exponent first). **Batching:** the fixer may fix up to
three queued findings, or 90 minutes of work, before the measured lane catches
up once; each fix still gets its own commit, `fixes/` record and old-vs-new table.

## 5. Storage isolation

One lane, one Store, one daemon. Lanes share only immutable things.

| Lane | Volume / LayerFS home | Writes | Reads from others |
| --- | --- | --- | --- |
| Measured | `layerfs-issue352-<run>` | its own Store | snapshot blocks |
| Scout | `layerfs-issue352-scout-<n>` | its own Store | snapshot blocks |
| Fixer diagnostics | `layerfs-issue352-diag-*`, short-lived | a throwaway fork | snapshot blocks |
| Viewer (P4) | `layerfs-issue352-view-*` | its own fork | snapshot blocks |

- **No Store file is opened by two daemons**, and no lane reads another lane's
  live file. State crosses lanes only through a snapshot: sealed, hashed,
  rebuilt into the reader's own volume.
- **Format versions.** Every snapshot manifest records its schema version,
  binary, run and parent snapshot. A lane forks only a snapshot whose format its
  binary opens (the binding_hint change made old Stores unopenable). After a
  format fix: migrate, or fast-rebuild from the plan checking every checkpoint's
  oracle (SPEC §6). A format change is switched at a quiet point, never during
  play. The scout's old-format bytes become obsolete; its findings and proofs do
  not.
- **Shared block store** `~/lfs-history/snapshots/blocks/`: blocks are named by
  SHA-256 and written to a temporary name, then renamed; manifests are per run
  (`range-NNN.<run>.json`). Only the lead deletes blocks, only while no lane
  snapshots, by literal path, after counting manifest references; blocks only an
  abandoned line uses are removed once its diagnosis is in `BUGS.md`.
- **Lineage** in `~/lfs-history/lines.json` (to build): which run is the main
  line, which are scouts, abandoned or control.
- **Disk guard** counts every lane's working Store, the forks, the blocks and the
  install peak, on the Docker disk and the Mac disk separately. When space is
  short the scout stops first.
- **Binaries pinned by id**: each lane runs a copy at
  `core/target/issue352/daemon-<id>/`, so a rebuild never changes a running
  lane's binary.
- **Read-only shared inputs:** `dsh.git`, the plan and oracles (only the builder
  regenerates them, only while no lane runs), and the pnpm store volume
  (filled once by the builder, mounted read-only).
- **Records:** metrics are per run; only the measured lane writes `RANGES.md` and
  `ranges/` and gets issue comments.

## 6. Lead decisions recorded here (2026-10-18)

| Question | Decision |
| --- | --- |
| Builder and fixer writing code at once | No. One writer at a time stays (owner rule). Revisit only on the owner's word, with separate worktrees and areas and the lead as the only merger |
| Order of queued findings | Stops first, then by severity (steepest depth exponent) |
| Batching fixes | Up to 3 findings or 90 minutes per catch-up |
| Merge builder and fixer into one agent | No; two agents keep fixes and tools apart |
| Viewer | Back to P4 (owner, 2026-10-18); played only while the measured lane is stopped |
