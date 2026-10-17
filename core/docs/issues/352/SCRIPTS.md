# #352 — Script generation

> **Status:** Current guideline, 2026-10-17. It describes how a range's plan
> becomes the steps that run it: a dsh mock scenario (main agent and
> subagents), and the same steps played headlessly. It reuses what Crew, Depot
> and Shop already proved (#347, #350). Improve it where the build shows it is
> wrong, in the same commit as the change.

Read with [SPEC.md](SPEC.md) §2 (the plan, maximum speed) and `dsh/README.md`
("Mock model and demos").

## 1. One step library, two players

Every bash call does the same work whichever player runs it. Only the
orchestration differs.

| | Headless runner (`run.mjs`) | dsh mock scenario (`scenario.mjs`) |
| --- | --- | --- |
| Used for | Every measured range, fast rebuild | Seeing or debugging any range Live in dsh; the P4 demo window |
| Who runs a step | One concurrent task per agent | The agent's subagent, through dsh's bash tool |
| Order between agents | The plan's `after` barriers, awaited directly | The lead's turns: `send_message` to start, `reply until` to wait |
| Step body | `step(range, id)` of `dsh/tools/history/step.mjs` | The same call, as the bash step's `run` |
| Checks | The step's own outcome checks, then the range's gates | The same, then check-demo |

So a bug a scenario shows is reproduced headlessly in seconds, and the
reverse.

## 2. What is copied from earlier scenarios

| From | What | Where |
| --- | --- | --- |
| Crew (#350) | Lead as root and one subagent per role, started once and woken per turn; turns cut where a dependency enters or leaves | `dsh/tools/import/turns.mjs` (`assemble`) |
| Crew, Depot, Shop | Bash step = `run: [["step", …]]` of a shared lib; one attempt; the first reply that differs exits 1 and stops the run | `dsh/scenarios/shared/replay.mjs` |
| Crew | The lead creates Sandboxes one at a time (a create during another create is refused Busy) | `tools/import/crew.mjs` |
| Crew, Depot | Kept Workspaces and Sandbox ids recorded under the project's LayerFS home entry, removed with the project | `replay.mjs` |
| 5 agents, Conflicts | A Workspace per call; after a Conflict, a fresh Workspace resolves it | `scenarios/agents`, `scenarios/conflicts` |
| All replays | `expect` per bash step, checked on the trace by check-demo; static checks before any run | `tools/check-scenario.mjs`, `tools/check-demo.mjs` |

## 3. Scenario format

`layerfs-mock-scenario` version 2, as the loader (`packages/mock/src/scenario.js`)
checks it:

```json
{
  "type": "layerfs-mock-scenario",
  "version": 2,
  "title": "dsh history · ranges 100–102",
  "order": 90,
  "speed": 0,
  "live": true,
  "image": "sha256:<runtime image digest>",
  "seed": "seed.json",
  "lib": "../../tools/history/lib.mjs",
  "blurb": "deepseek-harness's history, ranges 100–102: 8 agents on 3 lanes, …",
  "agents": { "root": [ … ], "a01": [ … ], "a02": [ … ] }
}
```

- `speed: 0` (Max): there are no pauses and no typing. The loader accepts 0 as
  of this commit.
- `live: true`: LayerFS only, never the simulator.
- `seed`: see §8.
- `lib` is the scenario's module of exported calls (§6).
- **Generated, never hand-written.** Run `scenario.mjs --plan <dir> --from k --to m
  --out <dir>`. Only the P4 demo window is committed, as
  `dsh/scenarios/dsh-history/`. Any other window goes to
  `~/lfs-history/scenarios/<k>-<m>/`.

## 4. Agents

| Scenario agent | Plan | Role |
| --- | --- | --- |
| `root` | the lead | Creates the window's Sandboxes; starts and wakes agents; consolidates each range (merges, reconcile, publish); runs closure (install, tests); closes Sandboxes |
| `a01` … `a10` | the plan's agents | Run their own steps, turn by turn |

- **Names.** An agent's `description` is its name (`a03`). The plan numbers
  agents per range, so `a03` in range 100 and in range 101 is the same subagent.
  A range with fewer agents leaves the rest idle.
- **Prompt** (copy of Crew's): `You are a03 of the dsh history replay. Each turn
  runs your planned steps from the one the lead names; report when they are done.`
- **Start and wake.** An agent is started once with `subagent`, the first time
  it has a turn. Every later turn is a `send_message` "Go on from r100.s0042."
- **End of a turn.** Each turn ends with one short `reply`: `a03: turn 4 done,
  through r100.s0057.` The last one is `a03: done.`

## 5. Steps

One plan step is one bash step, except the lead's consolidation (one bash step
per merge, reconcile, publish, install and test tier).

```json
{
  "bash": {
    "description": "r100.s0042 a03 fs · fix(cli): handle empty config (5 files)",
    "run": [["step", 100, "r100.s0042"]]
  },
  "expect": ["fs.write:Committed", "fs.write:Committed", "fs.rm:Committed", "fs.write:UpToDate", "fs.write:Committed"]
}
```

- **Description:** `<step id> <agent> <kind> · <dsh commit subject> (<n> files)`,
  cut to 120 characters. The strip and the trace show it, and a failure names it.
- **`expect`** comes from the plan's outcomes, in call order. Reads carry no
  `expect`: their result is checked inside the step.

| Plan kind | SDK calls (in order) | `expect` |
| --- | --- | --- |
| `fs` | `fs.write` / `fs.rm` per file, then the step's reads (`fs.stat`, `read`, `list`, `grep`, `glob`, `diff_files`) | per file: `Committed` or `UpToDate` |
| `apply` | `sandbox.mount`, `sandbox.exec` (writes the files from inline content; `chmod`, `ln -s`), `sandbox.commit`, `sandbox.unmount` | `sandbox.mount:Mounted`, `sandbox.commit:Committed` (or `UpToDate`), `sandbox.unmount:Unmounted` |
| `check` | mount, exec (prints git blob ids of the files; the step compares), commit, unmount | `commit:UpToDate` |
| `hold-mount` | `sandbox.mount`; the Workspace path is kept | `mount:Mounted` |
| `hold-write` | `sandbox.exec` in the kept Workspace (the decoy) | — |
| `hold-commit` | `sandbox.commit` | `commit:Conflict` |
| `hold-resolve` | unmount (discard), mount, exec (verify), commit, unmount | `commit:UpToDate` |
| `stale-mount` | `sandbox.mount`; kept | `mount:Mounted` |
| `stale-apply` | exec in the kept Workspace, commit, unmount | `commit:Committed` |
| lead: merge | `branch.merge` lane into main | `branch.merge:Merged` (a race: `branch.merge:Merged\|Conflict`) |
| lead: reconcile | `fs.write` / `fs.rm` on the lead's Branch | per file |
| lead: publish | `branch.publish` | `branch.publish:Added` |
| lead: install, tests | one-shot Workspace each; exec exit 0 | `commit:Committed` / `UpToDate` |

Write each entry in full as `method:Kind`, using the names the existing
scenarios use (`sandbox.mount:Mounted`, `sandbox.commit:Committed|UpToDate`,
`branch.publish:Added`, …); the table shortens them. `a|b` allows either. Add `fs.write`, `fs.rm` and the read methods to
check-scenario's method list.

## 6. The lib (`dsh/tools/history/lib.mjs`)

Its exports are the calls a bash step's `run` may name:

| Export | Does |
| --- | --- |
| `setup(window)` | The lead creates the window's 4–8 Sandboxes one at a time and records their ids |
| `step(range, id)` | Runs one plan step: content from the blob cache (fs) or inlined into the exec command (Sandbox), every call's outcome checked against the plan, exit 1 at the first difference |
| `consolidate(range, op)` | One consolidation entry: a merge, the reconcile, a publish |
| `closure(range, what)` | Install or the test tier, in a one-shot Workspace |
| `verify(range)` | The checkpoint check: one exec of a node script printing each tracked file's git blob id and mode, compared with `compareTree` |
| `teardown(window)` | Closes the Sandboxes |

Rules, as in `replay.mjs`:

- **One attempt.** No retry, no wait, no sleep. Order comes from the scenario's
  turns or the runner's barriers.
- **State between steps lives on disk.** Sandbox ids and kept Workspace paths
  are kept under the project's LayerFS home entry, keyed by step id, never in a
  process.
- **Output.** One line per call (`fs.write packages/cli/x.ts Committed 4 ms`),
  then the step's summary. Never file contents.
- **The trace step label** is the step id (`LAYERFS_TRACE_STEP`), so the
  per-call trace joins with the plan.
- **Content.** The lib reads `LFS_HISTORY` (default `~/lfs-history`) for the
  plan, and `dsh.git` for blobs.

The headless runner imports the same exports and calls them directly.

## 7. Main agent orchestration (turns)

Use `turns.mjs`'s `assemble` with the plan's own barriers. Change
`assemble(kept, stepsOf)` to `assemble(kept, stepsOf, waits = dependencies(kept))`,
then pass `waits` built from each step's `after` (cross-agent edges only). The
algorithm stays Crew's:

1. **Cut turns.** An agent's steps (in plan order) are cut into turns only where
   a dependency enters (the turn starts at that step) or leaves (the turn ends
   after that step).
2. **Lead events in plan order:**
   - start each turn: `subagent` the first time, then `send_message`;
   - before an event, `reply until: [agents]` for the turns it depends on;
   - the lead's own steps go between.
3. **Ranges in sequence.** After a range's last agent turn, the lead waits for
   every agent, then consolidates, runs closure and verify, then starts the next
   range's first turns.
4. **End.** Wait for all agents, run `teardown`, then `reply: "Done."`.

The plan is already checked to finish (`finishes`), so the turns cannot
deadlock.

**Worked example** (a planned Commit Conflict; B = a02 holds, A = a01 commits):

```text
root: send a02 "Go on from r100.s0101"   a02: s0101 hold-mount, s0102 hold-write; reply
root: reply until [a02]
root: send a01 "Go on from r100.s0042"   a01: s0042 fs (writes the file); reply
root: reply until [a01]
root: send a02 "Go on from r100.s0103"   a02: s0103 hold-commit (Conflict), s0104 hold-resolve (UpToDate); reply
```

Agents with no dependency between them run their turns at the same time. The
lead only waits where the plan has a barrier.

## 8. Seed and window

- **Range 0:** the seed is the Init commit's tree. `oracle.mjs checkout`, then
  `seed.js`'s format.
- **Any later window:** it starts from the milestone snapshot before it. That
  needs the one new dsh feature (SPEC §2): **seed a demo from a Store
  snapshot**. The scenario's `seed` names the snapshot manifest, and Play
  restores it into the demo's own volume and LayerFS home, as
  `restore-store.mjs` does, instead of Initing.

## 9. Speed

- `speed: 0`; no `pause` steps; replies of one short line; no thinking text.
- **Order comes from turns only.** A scenario that passes only at a lower speed
  is a bug in the generator (`agents` lost its Conflict to pacing, #347 BUGS
  row 54).
- **Nothing waits on time:** no `sleep`, polling or readiness loops in the lib
  beyond the SDK's own calls.

## 10. Validation, before any run

1. **`check-scenario.mjs dsh-history`**, extended for a plan-backed scenario.
   It has no `run/` files, so it checks that:
   - every plan step of the window appears exactly once;
   - each `expect` equals the plan's outcomes;
   - the lead starts each agent once before waking or waiting on it;
   - every turn is answered.
2. **A turn check.** Simulate the scenario's turns: every step's `after` is done
   before the turn holding it starts.
3. **A headless dry run of the window** (`run.mjs --from k --to m`) before the
   Live Play. Same steps, faster to diagnose.
4. **Live Play passes check-demo:**
   - expected outcomes;
   - nothing left open;
   - Branch order against the oracle's `expect`;
   - the final tree by `compareTree` (git blob ids), instead of `final.json`'s
     SHA-256.

## 11. Builder tasks this adds

- `dsh/tools/history/lib.mjs` (the step library) and `scenario.mjs` (the
  generator).
- `turns.mjs`: an optional `waits` argument to `assemble`.
- `check-scenario.mjs`: plan-backed mode and the fs and read methods.
- `check-demo.mjs`: a final-tree check by oracle and git blob id.
- Seeding a demo from a Store snapshot (SPEC §2, P4).
