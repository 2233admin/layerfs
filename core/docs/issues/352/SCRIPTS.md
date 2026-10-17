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
| `root` | the lead | Creates the window's Sandboxes; starts and wakes agents; consolidates each range (merges, reconcile, publish); runs closure (install, build, unit tests); closes Sandboxes |
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
per merge, reconcile, publish, install, build and unit-test run).

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
| lead: install, build, unit tests | one-shot Workspace each; exec exit 0, and each test file's result equal to its native one (SPEC §2, Tests) | `commit:Committed` / `UpToDate` |

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
| `closure(range, what)` | Install, the build of changed packages, or the range's unit tests (`vitest run <files>`, the plan's list), in a one-shot Workspace |
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
  forks it into the demo's own volume and LayerFS home (SPEC §7, Forking from a
  snapshot) instead of Initing.

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

## 12. As built for P1 (2026-10-18)

The headless player is `dsh/tools/history/run.mjs` over `lib.mjs` (SDK
calls) and `steps.mjs` (pure routing and checks, tested by
`tests/runner.mjs`). Its header gives the commands and exit codes. Where it
differs from the text above:

- **Non-regular files go through a Sandbox.** Executables, symlinks and mode
  changes are written by one Sandbox step per op (base64 chunks, then one
  script) and committed by unmount. Large regular files go through fs: since
  F-001 (daemon `71001f65`) an fs body streams, so size no longer routes a
  file (before, files over 60,000 bytes went through a Sandbox because one
  request carried at most 65,519 bytes).
- **The seal** checkpoints the WAL with `pragma wal_checkpoint(TRUNCATE)` in
  the runtime image after every daemon of the run is gone. Closing the
  Sandboxes alone leaves the WAL non-empty.
- **The checkpoint's base is a Commit.** diff_commits takes saved Commits
  only, so range 0 compares against the probe fixture's Commit, and each
  later range against the previous range's head. Metadata-only items (a
  timestamp that changed while the bytes came back) are checked by blob id.
- **Range 0 is a yarn project** with no pnpm lock; its calibration marks
  every test file skipped with that reason. Offline pnpm installs need the
  metadata cache on the store volume (`--cache-dir /pnpm-store/.cache`).
- **Calibration is per phase.** A phase with tests refuses a range whose
  tests-NNN.json is missing (exit 5). P1 has no tests.
- **Probe branches accumulate.** The SDK has no branch removal, so each
  range adds its lane, check and probe branches (about seven). Counters that
  grow with the branch count (fork `returned_rows`) climb with depth for
  that reason; read such a verdict with the branch count beside it.
- **Scoped probes are fitted per unit of their own input** (finding 002).
  SPEC §4 lets grep over the whole tree grow with the bytes in its scope, so
  the Scaling and Counters gates fit `grep_tree` per tree byte against depth
  (`gates.mjs` `SCOPED`). The runner records the checkpoint tree's files and
  bytes from the oracle as `inputs.tree`; report.mjs attaches the same to
  earlier ranges' metrics in memory. An attempt recorded without `inputs` is
  judged raw, exactly as it was, so recorded outcomes do not change.
- **A rerun line's snapshots sit beside the old line's.** A run that snaps a
  range another run already snapped writes `range-NNN.<run>.json`; manifests
  name their run, and `fork` and the runner read a run's own manifest first.
  A plain manifest that names no run (taken before this) serves its run.
- **Gates use one binary's points** (finding 002, SPEC §6 "never merge series
  across binaries"). `evaluate` keeps only earlier attempts measured with the
  judged attempt's daemon for every series, fit and baseline; a baseline built
  from another daemon is reported, not compared. Fewer than three same-binary
  points make Scaling and Counters say `insufficient same-binary points: n of 3`
  and count as watch, never as a silent pass (ranges 0 and 1 of `p1-pilot` now
  read so; their verdicts were already watch). A fix seeds its new daemon's
  series with the probe points it measured on the earlier snapshots:
  `metrics/probes-<daemon>.json` `{ daemon, points: [{ range, depth, binary,
  cache, probes }] }`, read by report.mjs (`loadSeeds`). A seed fills only a
  range that no same-binary attempt covers.

## 13. As built for P2 (2026-10-18)

The P2 player is `dsh/tools/history/agents.mjs`, called by `run.mjs` when the
run's phase is `p2` (`PHASES.p2`, `p2Plan` and `consolidationSteps` in
`steps.mjs`, tested by `tests/p2.mjs`). A run moves to P2 with `run.mjs phase
--run <id> --phase p2`: same pinned binaries and Store, the move recorded in
`run.json` (`phases`) and the ledger. Where it differs from the text above:

- **Agents are concurrent tasks with their own SDK client.** Each agent runs
  its steps in plan order and awaits only the `after` barriers of each step;
  a failure rejects every pending barrier so no agent waits forever. Each
  agent has its own client (Store calls through the run's service Sandbox) so
  trace labels never mix; every call is recorded (`lib.mjs record`) and its
  trace label is `<step>#<seq>`, which joins the trace line to its record.
- **One Sandbox per agent** (at least 4), created once by the lead, kept
  across ranges until a seal. Two concurrent unmounts of different Workspaces
  in one Sandbox failed "Workspace absent" on daemon `511dceed` (dev run,
  F-009, fixed in addon `3da0f665`). The pool is kept after the fix (builder
  decision, 2026-10-18): dropping it would change P2's measured shape and need
  its own dev run, and one agent per Sandbox matches the target.
  The seal closes named Sandboxes at once and the service last.
- **Lanes are the plan's Branch names**, forked from main by the lead at the
  range start (one lead step), with the lead's own Branch `r<k>-main`. Each
  merge makes a new Branch `r<k>-main-<n>`; the reconcile and the publish run
  on the last one.
- **The race** (`merge-race`): the first raced lane publishes (from its own
  client) while the lead merges the second; then the lead merges the published
  lane. A raced merge answering Conflict is merged again before the reconcile.
- **Decoys change every line** of the base (prefixed with the marker). A
  decoy that only appended a line merged cleanly with the real change, so the
  planned Commit Conflict answered Committed.
- **Removals never take a folder another agent of the lane writes under**
  (`p2Plan` `keep`), and a write under such a folder that did not exist at the
  range start makes it again (`mkdir` of an existing folder is a no-op), so
  concurrent agents never race on a folder. A folder left empty is invisible
  to every check (git and the checks list files only).
- **Apply and stale-apply steps put removals in the Sandbox too** (`rm -rf` of
  the removal target in the step's script).
- **Same-Branch concurrent Commits** answered HeadMoved on daemon `511dceed`
  (F-008). Daemon `71001f65` merges at publish, so concurrent Commits on one
  lane need no player aid; the development-only `--serialize-commits` aid is
  removed, and a HeadMoved now is an unplanned outcome (stop).
- **Not in P2:** installs and unit tests (P3); `p2Plan` reports them as left out.
- **The proof checkpoint pages by cursor** (F-010, daemon `71001f65`):
  `verify()` asks `diff_commits(prev, head, 1000, 0, { cursor, hunks: false })`
  and resumes each page at the previous `nextCursor`; a page that says
  `hasMore` without a new cursor fails the checkpoint.
- **Fix kinds are checked** (REBUILD.md §4): `findings.mjs checkFinding`
  requires `fix.kind` 1–3 with `oldStores`, `oldData`, `recovery`, and
  `compat` (kinds 1–2) or `justification { kind1, kind2, cost, snapshot }`
  (kind 3). `report.mjs check` applies the same rule to each fixes/ record a
  finding names, and `report.mjs records` to every record (rows Kind, Old
  Stores, Old data, Compatibility test, Recovery; kind 3: Why not kind 1, Why
  not kind 2, Rebuild cost, Start snapshot). Finding `002.a1` and its six
  records predate REBUILD.md and keep the SPEC §6 kind (F2).
- **A speed baseline per daemon.** `baseline.json` stays the pilot's
  (`511dceed`, `p1-pilot-b` ranges 2–4). A later daemon gets its own
  `baseline-<daemon12>.json` beside it, built by `report.mjs baseline --run
  <id> --metrics <run>/metrics --ranges 2-4` from one re-baseline run (label
  `baseline`, its own folders) under that daemon alone, with all its size
  classes. Each attempt is compared with its own daemon's baseline; a mix of
  daemons, an unmeasured attempt or a second baseline for one daemon is
  refused. `run.mjs new|fork --daemon <file>` pins a run to a daemon file.
- **STATS.md bytes:** a derived range (†) has no byte data; a method seen only
  in derived ranges reads "—", and a total over both carries ‡ (measured
  ranges only).

