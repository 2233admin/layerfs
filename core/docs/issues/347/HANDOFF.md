# Handoff prompt — #347

> **Status:** Current; give this whole file to the agent that runs #347.

You own LayerFS issue [#347](https://github.com/Ephemeral-AI-Lab/layerfs/issues/347)
(dsh-demo-conversion) and its sub-issues #348 Shop, #349 Depot and #350 Crew,
working in `/Users/yifanxu/Ephemeral-AI-Lab/layerfs` on branch `dsh-demo-conversion`.
Convert the three recorded application runs into Live demos of the dsh demo
workspace, fix every bug the conversion finds, and close each sub-issue after its
successful Live run. Then close #347.

**You do not stop until all three have passed and are closed.** The owner is away
and expects to find everything finished. Do not ask questions and do not wait for
replies. Make the best decision, write it down in `BUGS.md` or the sub-issue, and
keep going.

## Authority

You have full authority for this work. You need no further approval to:
- download the #334 release evidence;
- commit generated `run/` files, including the builders' application source;
- change any code (dsh packages, the SDK, LayerFS core, tools, tests);
- push `dsh-demo-conversion`, comment on and close #347–#350;
- merge into `main` at the end.

Use your judgement and record the reason for each decision.

## Read first

1. Root `AGENTS.md` and `core/AGENTS.md`.
2. [SPEC.md](SPEC.md) in this folder: the decisions, the inputs, the files, the
   conversion formula, the gates and the rollout. It is the plan; improve it where
   the work shows it is wrong, in the same commit as the change.
3. `dsh/README.md`, especially "Mock model and demos", "The demo workspace" and
   "Develop".
4. The demo machinery you build on:
   - `dsh/packages/mock/src/{scenario,adapter,demo,progress}.js`
   - `dsh/scenarios/shared/terminal.mjs` and an existing scenario (`dsh/scenarios/agents/scenario.json` for several agents)
   - `dsh/packages/client/src/client/{demo.ts,DemoStrip.tsx}`
   - `dsh/packages/host/src/remove.js`
   - `dsh/tools/check-demo.mjs`

## Environment

- **dsh source:** `/Users/yifanxu/Ephemeral-AI-Lab/deepseek-harness`. Never edit it;
  this work changes only the layerfs repository.
- **Runtime image** for these demos: `layerfs-issue337-runtime:frozen`,
  `sha256:091f785ba7d5d036dfa350e8fd69ee1fcd2d8320c3706841c8c95e6411eee9d2`. It has
  Node 22.23.1, Rust 1.85.1, Chromium and chromedriver 155, and Selenium 4.8.3. The
  existing demos use `sha256:2d929c6d…` (Node only).
- **Linux daemon:** `core/target/cluster2-linux/release/layerfs-daemon`. Rebuild it
  when you change core; the core guide has the build.
- **Your own dsh profile:** a scratch `DSH_HOME` of your own, set up as in
  `dsh/README.md` "Install into a dsh profile". Never use `~/.dsh`; it is the
  owner's real home. Start dsh web on a port no one else uses (for example 8795) with
  `TSX_TSCONFIG_PATH=<dsh>/tsconfig.base.json DSH_HOME=<yours> node --import <dsh>/node_modules/tsx/dist/esm/index.mjs <dsh>/apps/cli/src/bin.ts web --no-open --port 8795`.
  Leave other sessions' servers (8792, 8793) alone.
- **Evidence:**
  - Depot: `~/.codex/issue337-evidence/`.
  - Crew: `~/.codex/issue340-evidence/` and `~/.codex/issue340-control/`.
  - Shop: release `issue334-diagnostic-evidence-20261016`; download into an empty folder and verify `SHA256SUMS`.

  Never modify the originals. Copy a stopped Store into a disposable LayerFS home
  before opening it.
- **Disk:** about 445 GB free. Cargo `target` folders make Depot's Commits large, so
  remove each finished run's projects and Docker volumes once their receipts are
  recorded.
- **Sandbox escapes:** `git push` and `gh` need the sandbox disabled (the keychain
  helper is blocked inside it). So may Docker.

## How to work: fast during development, faithful at the end

Iterate fast. Development runs have **no artificial latency**: no scenario pauses, no
typing or run delays, no playback holds. Build a headless runner,
`dsh/tools/run-scenario.mjs`, that plays a scenario's steps directly against Live
LayerFS without dsh web or the mock model, and give the mock and `terminal.mjs` a
zero-delay switch for development runs through dsh.

Speed must never change what runs or in what order:
- every recorded write and every recorded command still executes for real, on Live
  LayerFS, with the frozen image;
- order comes only from explicit waits: the recorded order within an agent, and
  `reply until` for another agent's writes. **Never from a pause or a delay.** A run
  that passes only because of timing is a bug; find it by running fast;
- concurrency matches the record: Crew's agents run at the same time, as recorded;
- `check-demo` checks order as well as outcomes: each Branch's Commits arrive in the
  recorded order, and every merge and publish sees the recorded heads.

Fix with the cheapest loop that reproduces the problem. Run one step, or one
Branch's steps, before a whole scenario. Each case's closing run is a dsh web Live
Play at the demo's normal pacing.

## Each case (Shop #348, then Depot #349, then Crew #350)

1. Convert: extend `dsh/tools/import-run.mjs` for the record format and generate
   `dsh/scenarios/<id>/` (scenario.json, run/, seed/, final.json).
2. Iterate in fast mode until a full headless Live run passes the gates.
3. Closing run: Play the demo Live in your dsh web at normal pacing. It must pass
   every gate in SPEC.md:
   1. the strip reads `Finished · N of N steps`;
   2. `check-demo` passes, with every exit code and reply as recorded and the order
      checks above;
   3. the final-tree check matches `final.json`;
   4. no Workspace is mounted and no Sandbox is left open;
   5. a Replay starts cleanly.
4. Commit everything for the case on `dsh-demo-conversion`:
   - every commit records `Production LOC: <before> -> <after> (delta ±N)` from
     `tools/production_loc.py`, and ends with
     `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
   - commit only your own paths (`git commit -- <paths>`);
   - push.
5. Post on the sub-issue: the session id, project, image, dsh and LayerFS commits,
   the gates' output and the findings fixed. Then close it.

## Bugs

Bugs are expected; the work is conversion plus fixing them.
- Fix each at its cause, in whichever layer has it: the converter, dsh, the SDK or
  LayerFS.
- A LayerFS or SDK defect gets a failing regression test first, then the fix.
- Add one line per finding to [BUGS.md](BUGS.md).
- Keep failed runs. Never relabel a patched run as successful; the successful run is
  a new run after the last fix.

**Not allowed:**
- weakening a gate or an `expect` to make a run pass;
- editing a recorded outcome;
- replacing a command with recorded output.

If a recorded command cannot run as recorded (for example a registry is
unreachable), fix the environment: proxy settings, a mirror, or a dependency cache
committed inside the Workspace as the campaigns did. Write the cause and the fix in
`BUGS.md`.

## Standing rules

- Disposable / WAL / synchronous=OFF Store only. Durable stays **NOT_RUN — disabled
  by owner until explicit reauthorization**.
- Every automated test or check invocation has a wall timeout of at most 120 s
  (`perl -e 'alarm 120; exec @ARGV' …`). Run anything longer, such as a demo Play or
  a headless run, in the background and read its log. A demo's recorded commands
  keep their own inner `timeout`.
- One attempt per operation: no automatic retry, no blind resend after an uncertain
  outcome.
- `rm` only with literal paths. New production files stay under 999 lines.
- Never commit `dsh/assets/`.

## Finish

When #348, #349 and #350 are all closed:
1. Merge `dsh-demo-conversion` into `main` with `--no-ff`. The merge commit records
   the first-parent LOC comparison, as earlier main merges do. Run `cd dsh && npm test`
   and the `sdk/js` tests on the merged tree, then push `main`.
2. Post a summary on #347 and #336: the three demos, the findings, and the final
   commit.
3. Close #347.

Your final message says exactly what passed, what was fixed and where the
evidence is, with nothing claimed that was not run.
