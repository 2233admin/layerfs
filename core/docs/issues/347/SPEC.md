# dsh demo conversion — #347

> **Status:** Current implementation plan; Shop (#348) is closed, Depot (#349) is converted, Crew is in progress.

Convert the three finished application runs of collection
[#336](https://github.com/Ephemeral-AI-Lab/layerfs/issues/336) into Live demos of
the dsh demo workspace (`dsh/demo-workspace`, from
[#346](https://github.com/Ephemeral-AI-Lab/layerfs/issues/346)):

| Iteration | Sub-issue | Source run | Agents | Recorded steps | Commands | Command time |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [#348](https://github.com/Ephemeral-AI-Lab/layerfs/issues/348) Shop | #334 Builder 2 | 1 | 19 | 12 | ~20 s |
| 2 | [#349](https://github.com/Ephemeral-AI-Lab/layerfs/issues/349) Depot | #337 Builder 2 | 1 | 107 | 82 | 352 s |
| 3 | [#350](https://github.com/Ephemeral-AI-Lab/layerfs/issues/350) Crew | #340 Builder 2 r3 | 19 → 6 roles | 2,795 SDK calls | 305 | 2,861 s |

The work is mostly conversion plus fixing what the conversion finds. Bugs are
expected in the converter, dsh, the SDK and LayerFS. A sub-issue closes only after a
successful Live run (see [Gates](#gates)). #347 closes when all three have closed.

## Decisions

- **Live LayerFS only.** These demos run on real LayerFS in Docker. The simulator
  does not model everything they do (POSIX behaviour inside Workspaces, real
  toolchains), and Live is the target. Their scenarios set `"live": true`; the strip
  shows no Sim choice for them, and the Host refuses a Sim Init of their projects.
- **Writes are replayed, commands are re-run.** A recorded file write (`fs.apply`,
  `fs.write`) is applied with the recorded content. A recorded command runs again,
  verbatim, in a Workspace of the same Branch, with the real toolchain. So npm,
  cargo, esbuild, Chromium and the builds' generated output (`node_modules`,
  `target`, `.cargo-home`, `dist`) are produced again, not copied.
- **The recorded run is the expectation.** Each command's exit code and each SDK
  reply kind must match the record. Output text and timings are shown, not compared.
- **One runtime image.** The campaigns' frozen runtime image
  `layerfs-issue337-runtime:frozen` (`sha256:091f785ba7d5d036dfa350e8fd69ee1fcd2d8320c3706841c8c95e6411eee9d2`:
  Node 22.23.1, Rust 1.85.1, Chromium and chromedriver 155, Selenium 4.8.3). A
  scenario's `image` field names it; other demos keep the profile's image.
- **Each demo Inits from its own seed.** `seed.json` holds what the original Init
  imported, with exact modes; Git cannot hold it as a folder because it contains a
  `.git` folder. Play writes it out once (`packages/mock/src/seed.js`) and Inits
  the demo's project from that folder, not from `demo-workspace/`.
- **One attempt per Play.** No automatic retry or resend. A failed run is kept,
  diagnosed and fixed; the next Play is a new run.

## Inputs

| Project | Step records | Stopped Store | Notes |
| --- | --- | --- | --- |
| Shop | `issue334/phase-c/` in release `issue334-diagnostic-evidence-20261016` | `volume-exports/` in the same release | 19 MB download |
| Depot | `~/.codex/issue337-evidence/builder2-raw.tar`: `receipts/steps.jsonl`, `receipts/trace.jsonl`; scripts in `builder2-environment.tar` | `builder2-final/restored` (75 Commits, 7 Layers) | Every command exited 0 |
| Crew | `core/docs/issues/340/tables/b2-r3-final-analysis-r1/primary-final-r1/b2-r3-steps.csv`, archives in `~/.codex/issue340-evidence/` | `b2-r3-store` | Exclude the zero-contribution startup |

The converter reads a restored copy of each stopped Store from its own disposable
LayerFS home, never the evidence originals. The recorded Stores predate the
`store_totals` columns of `bb8fe890f`, which the current daemon refuses
(`Malformed`), and a Store is never converted in place, so the converter reads
them with the SDK and daemon built at `f64d74231` (`bb8fe890f^`), named by
`LAYERFS_READER`. `dsh/tools/restore-store.mjs` copies the Store folder into a
new volume (root-owned, `global` 0700) and writes the `project.record` that opens
it (`sdk/js/native/examples/restore_record.rs`, from `history_meta.binding_key`).
Replays run on the current SDK and daemon.

## Files

```
dsh/tools/import-run.mjs             converter; run once per project; reads records + Store
dsh/scenarios/shared/replay.mjs      helpers for replayed steps (the scenario's "lib")
dsh/scenarios/<id>/scenario.json     generated mock-model steps, as for the existing demos
dsh/scenarios/<id>/run/NNN.json      generated, one per kept step (fields below)
dsh/scenarios/<id>/seed.json         the original Init's imported folder (paths, modes, bytes)
dsh/scenarios/<id>/final.json        generated: each tracked path's SHA-256 on the recorded final
                                     main, and each Branch's recorded history
dsh/tools/import/<format>.mjs        one reader per record format
dsh/tools/restore-store.mjs          opens a copy of a stopped Store (see Inputs)
dsh/tools/checks/                    the gates, shared by check-demo and run-scenario
dsh/tools/run-scenario.mjs           headless development runner (no dsh web, no mock model)
```

`run/NNN.json` fields: `step` (recorded label), `agent` (role), `kind`, `branch`,
`writes` (path → text, or null for a removal), `command`, `exit`, `output` (the last
12 recorded lines, at most 2 KB), `ms`, `expect` (the recorded reply kinds), and
`calls`: the step's SDK calls in recorded order, which `replay.mjs` makes one by
one (writes as one `fs.apply`, `$PWD` for the recorded Workspace path).

Changes to existing code (paths under `dsh/`):
- `packages/mock/src/scenario.js`: validate `live` and `image`.
- `packages/mock/src/demo.js` and the `/layerfs-demo` route: carry each demo's `live`,
  `image` and `seed` folder.
- `packages/client/src/client/demo.ts` and `DemoStrip.tsx`: Init from the seed and
  pass the image; offer Live only for `live` demos.
- `packages/host`: refuse a Sim Init of a `live` demo's project. `sandbox.create`
  uses the scenario's image when one is set.
- `packages/mock/src/plan.js`: a bash result whose text ends in a non-zero
  `[exit code: N]`, a signal or a timeout marker stops the agent. dsh's bash tool
  does not mark those results as errors.
- `packages/mock` and `scenarios/shared/terminal.mjs`: `LAYERFS_DEMO_FAST=1` skips
  typing, think-time and terminal delays (development only; it changes no step or
  its order).
- `tools/check-demo.mjs`: the closed, order and final-tree checks against
  `final.json`.
- `README.md`: the replayed demos, the formula and the gates.

## Conversion formula

Recorded calls are grouped into steps by their recorded label, then classified:

| Recorded step contains | Scenario step |
| --- | --- |
| `sandbox.exec` | `["replay", agent, branch, "NNN"]`: mount a Workspace on the Branch, apply any folded writes, run the command, commit, unmount |
| only `fs.apply` / `fs.write` | `["write", agent, branch, "NNN"]`: one direct Commit with the recorded writes |
| `branch.fork` / `branch.merge` / `branch.publish` | `["history", "<verb and recorded arguments>"]`; a recorded Commit or Layer is named by its place (`orders#2`, `L3`) and resolved in the run |
| `sandbox.create` / `sandbox.close` | the agent's Sandbox opened or closed, in recorded order; a `create` moves before the agent's first Store call, so no replayed call goes through the service Sandbox the Host uses; the recorded service Sandbox close is dropped |
| only reads (`fs.read`, `fs.list`, `fs.glob`, `fs.grep`, `fs.stat`, `branch.list_commits`, `branch.diff_*`, `project.list_branches`, `operator.*`) | dropped; its time joins the next step's pause |
| `sandbox.service`, observer and collection labels | dropped |

Each field of a kept step comes from the record:

- **Writes.** For a write step, its Commit's tracked changes: the tracked trees
  of its parent (a Branch's first Commit: its base Layer) and of the Commit are
  compared, walking only folders the project's own `.gitignore` files do not
  exclude, with `fs.diff_files` for content; then `fs.read` at the Commit for each
  added or modified file. Ignored paths are regenerated by the commands. A write
  step whose remaining changes are empty is dropped. (`branch.diff_commits` is not
  used: it walks both whole trees, build caches included, for every page.)
- **Folding (Crew).** An agent's consecutive write steps on one Branch, before its
  next command step on that Branch, fold into that command step's `writes`.
- **Command.** The recorded command, verbatim. The recorded Workspace path (for
  example `/workspaces/1`) is replaced by `$PWD`. A command that names a host path or
  a variable the Workspace lacks is a converter error, fixed in the converter.
- **Expect.** The recorded reply kinds in order, for example `sandbox.exec:exit:0`,
  `sandbox.commit:Committed`, `branch.merge:Merged`, `branch.publish:Added`, or a
  recorded refusal. A recorded `Committed` of a command step whose changes were all
  generated files may come back `UpToDate`; the converter writes
  `sandbox.commit:Committed|UpToDate` there; the order check treats such a Commit
  as optional. The other way round, a recorded `UpToDate` gets
  `sandbox.commit:UpToDate|Committed`, because a tool may touch its own cache
  depending on wall time (cargo's last-use times); a `Committed` there must
  change no tracked file, which `replay.mjs` checks before going on and the
  order check checks again (`final.json` `extras` places such Commits).
- **Agent.** Shop and Depot: the builder plays as `root`. Crew: lead → `root`;
  `P1…P1f` → `people`; `W1*` → `work-a`; `W2*` → `work-b`; `I1*` → `insight-a`;
  `I2*` → `insight-b`. The observer (`main`) is dropped.
- **Order.** Steps keep their recorded start order within an agent. Crew: the lead
  wakes a role with `send_message` at its first recorded step. A step that merges,
  publishes or forks from a Branch that another role wrote waits (`reply until`)
  for that role's last earlier recorded write to it.
- **Pause.** `clamp(gap × k, 400, 3000)` ms, where `gap` is the time since the
  agent's previous kept step ended. `k` is chosen so that the pauses sum to the
  demo's target thinking time: Shop 1 min, Depot 4 min, Crew 8 min. The commands'
  real run time comes on top.
- **Timeouts.** Recorded commands carry their own inner `timeout` (at most 110 s).
  The converter rejects a command without one, except one recorded under 10 s,
  which it accepts with a note (Shop step 010's two heredocs); the step's tool
  timeout still bounds it.

## Gates

A Live run is successful when all of these hold. Each is recorded on the sub-issue
with the session id, the project name, the image and the dsh and LayerFS commits:

1. The strip reads `Finished · N of N steps`.
2. `node tools/check-demo.mjs '<URL>' <session> <id>` passes: every step's replies
   match `expect`, including every command's exit code, and every Branch's
   Commits, forks, merges and publishes come in the recorded order (`final.json`
   `history`).
3. The final-tree check passes: every tracked path on `main` matches `final.json`
   by the SHA-256 of its bytes (taken with `sha256sum` in a Workspace on a
   `final-tree-check-<stamp>` Branch forked from `main`), and no other tracked
   path exists. `final.json` `varies` names what no replay can reproduce, decided
   from the record by fixed rules: a name holding a clock reading (16 or more
   digits) is matched as a pattern, its content still compared; SQLite databases,
   CPython bytecode and test-server logs (which hold an OS-assigned port) are
   compared by presence only. Shop has none; Depot has 82 stamped files and 35
   such formats (see BUGS.md).
4. No Workspace is mounted and every Sandbox of the run, including the service
   Sandbox, is closed.
5. A Replay of the finished demo starts cleanly (the previous run's project and
   Sandboxes removed) and reaches its first command.

## Rollout

Each iteration runs the same loop: convert → Live Play → diagnose → fix → Play
again until the gates pass.

**Iteration 1 — Shop (#348): the shared tooling.**
1. Download and verify the #334 release assets into an empty folder, then restore the Builder 2 Store into a disposable home.
2. Add `live`, `image` and `seed` end to end (scenario, route, client, Host).
3. Write `replay.mjs` and the converter for Shop's record format.
4. Generate `dsh/scenarios/shop/`, Play it Live, fix, repeat. Close #348 on a
   successful run.

**Iteration 2 — Depot (#349): real toolchains and long builds.**
1. Add Depot's record format (`steps.jsonl` with `trace.jsonl`) to the converter.
2. Generate, Play Live, fix. Expected trouble:
   - crates.io reached from inside the Sandbox;
   - cargo `target` and `.cargo-home` growing the Store by gigabytes;
   - Chromium inside a Workspace;
   - commands near their 110 s timeout.
3. Close #349 on a successful run.

**Iteration 3 — Crew (#350): several agents at once.**
1. Add Crew's record format (the per-call CSV with the run archives), the role
   mapping, folding and `reply until` ordering.
2. Generate, Play Live, fix. Expected trouble:
   - four concurrent agents and their Sandboxes;
   - same-Branch Commit merges and Branch merges arriving in a different order than
     recorded;
   - the lead's merges waiting for the right writes.
3. Close #350, then #347, on a successful run.

## Bugs

- A finding gets one line in `BUGS.md` in this folder: symptom, layer (converter,
  dsh, SDK, LayerFS), the failing run's session and project, and the fix commit.
- A LayerFS or SDK defect keeps its failing case as a regression test before the fix.
- A run that fails is kept; it is never relabelled as successful after a patch.
  The successful run is a new Play after the last fix.

## Standing rules

- Root and core `AGENTS.md` apply. Disposable / WAL / synchronous=OFF Store only;
  Durable is **NOT_RUN — disabled by owner until explicit reauthorization**.
- Every automated test or check invocation has a wall timeout of at most 120 s. A
  demo Play is a product run, not a test; its commands keep their recorded inner
  timeouts.
- Every repository commit records production LOC before/after/delta from
  `tools/production_loc.py`. Generated scenario folders are fixtures and do not
  count.
- The owner has authorized this work in full ([HANDOFF.md](HANDOFF.md)):
  - downloading the #334 evidence;
  - committing `run/` files with the builders' application source;
  - pushing `dsh-demo-conversion`;
  - closing the issues;
  - the final merge into `main`.
- Timings and sizes from these runs are diagnostic, not benchmarks.
