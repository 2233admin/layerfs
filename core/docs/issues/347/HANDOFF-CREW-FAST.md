# #350 Crew: fast-path handoff (2026-10-17)

You are finishing issue #350 (Crew), part of #347. Read this whole file before
acting. The original handoff, `HANDOFF.md`, still applies **except where this
file changes it** (the owner's decisions below).

## Scope: Crew only

- Work only on Crew (#350). Do **not** re-run, change or close Depot (#349) in
  this pass, and do not do the #347 finish (merge into main, #347/#336 posts)
  unless the owner asks. Shop (#348) is closed.
- Branch `dsh-demo-conversion`, checkout `/Users/yifanxu/Ephemeral-AI-Lab/layerfs`.
  Last commit: `b6c3131be` (pushed), "dsh(#350): convert #340's Crew run; races
  in the record get a checked rule". The tree was clean after it.

## Owner decisions (2026-10-17)

1. **What Crew must prove:** that agents can work and collaborate on a
   long-horizon project on LayerFS. That means 1,550 steps by 17 agents in 6
   concurrent roles: forks, merges, publishes, writes, Sandbox create/close,
   mount/unmount and Commits, each with its recorded outcome, in the recorded
   cross-agent order, ending in the recorded final tree. Whether the builders'
   own tests pass is **not** what Crew proves.
2. **Verification commands are disabled for now, with room to bring them back
   later.** 295 of the 304 recorded commands only verify (tests, builds,
   censuses, 93 Selenium browser proofs): the Commit after each records no
   tracked change. They do not run. Nothing replaces them: no stand-in command,
   and no recorded output presented as having run. Bringing them back later must
   be a switch, not a rewrite (see design below).
3. **Speed matters.** Headless iterations must take minutes, not an hour.
4. Earlier in the day the owner also approved: stopping old run containers
   (done), the zombie fix (done on a separate branch, see below).

5. **Live thinking time: 2 minutes** (approved). Set Crew's `target` in
   `dsh/tools/import-run.mjs` FORMATS from 480 to 120 seconds, so the closing
   Live Play's pauses total about 2 minutes (they were 620 s). Pacing stays the
   mock's normal pacing; order still comes only from the waits.
6. **No retry** (owner agreed with my recommendation). Every race found was in
   the disabled verification commands; one attempt per operation stays, so any
   mismatch from here on is a real finding. If a producing command turns out to
   race, bring the evidence to the owner instead of adding retries.

## Fast-path rules for Crew

What runs as recorded:
1. Every LayerFS SDK call with its recorded arguments and expected outcome.
2. The commands that may change tracked files (9 by the first count; see Step 2),
   with strict recorded exit codes, plus any install they need. If one turns out
   to change nothing tracked, it is verification-only and is disabled.

What is disabled:
3. The verification-only commands. Their step still exists in the scenario (so
   step counts, phases and waits are unchanged); the run file keeps the original
   command, its recorded exit code and output, and is marked as verification.
   The replay prints one line, for example `verification disabled: <command
   head>… (recorded exit 1)`, and makes **no** `sandbox.exec` call. Their
   `sandbox.exec:exit:N` expects are not emitted while disabled.
4. The race machinery (`RACES`, `PROOF_RACES`, the either-way expects in
   `tools/import/crew.mjs`, the `flaky` check in `scenarios/shared/replay.mjs`)
   stays in the code, dormant. It only matters when verification is on, and it
   is the evidence-based rule for bringing it back (BUGS rows 25, 29–39). Do
   not delete it.

What is checked, as strictly as before:
5. Every SDK outcome exactly as recorded. The one existing exception stays: a
   recorded `UpToDate` may come back `Committed` only if that Commit changes no
   tracked file (checked).
6. The Commit after a disabled command must still answer as recorded. That checks
   the Workspace matches its Branch at that point, a LayerFS check.
7. Final tree equals `final.json` (with its `varies` rules); Branch histories as
   recorded (the order gate).
8. Closing gates (unchanged from HANDOFF.md): strip reads "Finished · N of N
   steps"; `check-demo` passes (outcomes and order); final tree matches; nothing
   mounted and no Sandbox open; a Replay starts cleanly.

Parallel branch development (already in place; keep it):
9. The six roles run at the same time, waiting for each other only where they
   touched the same Branch with a write involved, in recorded order
   (`tools/import/turns.mjs`). Within a role the recorded order holds. The lead
   creates Sandboxes one at a time (the project lock refuses concurrent creates;
   that is real behaviour). Speed never changes what runs or in what order.

## Design for the switch (recommended)

- `dsh/tools/import-run.mjs`: a run-file call `{ op: "exec", …, verification:
  true }` for verification-only commands, decided from the record: the next
  Commit on that Workspace is `UpToDate` or generated-only (`generated: true`),
  and the command is not one of the producing ones. Add a converter input, for
  example `verification=off|on` (default `off` for crew), stored in
  `scenario.json` (for example `"verification": "off"`).
- With `off`: drop the exec's expect from the step's `expect` list, and the
  step's description says "verification disabled". With `on`: today's behaviour
  (commands run, races rule applies).
- `scenarios/shared/replay.mjs`: when the scenario (or the call) says
  verification is off, print the one line and skip the call. Keep the decision
  in data, not in code paths that guess.
- `dsh/tools/checks/gates.mjs` / `check-demo`: nothing should need to change if
  the expects are not emitted; check that the "expected" gate does not count
  disabled steps as missing.
- Document it: SPEC.md (a "Verification commands (Crew)" bullet: the owner's
  decision, the evidence of 295 of 304, how to turn it back on), BUGS.md (a row
  recording the decision), `dsh/README.md` (the crew row: "verification
  commands disabled").

## Speed work (do it, it is the point)

- **Import cache.** `import-run.mjs crew` takes about 10 minutes, mostly
  re-reading the recorded Store (`~/lfs347/restore/crew.json`) for `final.json`'s
  tree and Branch histories. Cache that derived data on disk, keyed by the
  Store file's SHA-256 (and the reader version), under the scratch area, for
  example `~/lfs347/cache/`. Re-imports should then take seconds. Never cache
  inside the repo.
- **Pre-run static check** (fast, before each headless run): every expect
  parses; every `until` names a started role; the dependency graph has no
  cycle; `node dsh/packages/mock/tests/mock.mjs` plays every scenario to the end
  (it does today, about 10 s). Several wasted runs were converter mistakes this
  catches.
- Headless runs are zero-pause (default). With commands disabled, a full Crew
  run should take a few minutes. Run it in the background and wait on its log.

## Step-by-step plan

1. Re-read `tools/import/crew.mjs`, `tools/import-run.mjs` (the `exec` call
   builder near the `flaky` spread, and how the step `expect` list is built),
   `scenarios/shared/replay.mjs` (`case "exec"`), `tools/checks/gates.mjs`.
2. Pin down the producing commands. From the current run files:
   `0006` (lead-007 dependency census), `0030` (lead-033 install, build, tests),
   `0073`, `0076`, `0372`, `0375` (scripts that write source files), `0295`
   (P1b build), `0305` (P1b-0110 people proof), `1046` (I1b build) were followed
   by a Commit expected `Committed`. Look at each record's Commit (what it
   changed, tracked vs ignored) and decide: producing (runs, strict exit) or
   verification-only (disabled). Some of these are builds or browser proofs
   whose `Committed` may be ignored files only; if so they are verification.
   Check what each producing command needs (for example `node_modules` from an
   earlier `npm ci`) and keep that install running too, strict.
3. Implement the switch, the import cache, the pre-run check, and the 120 s
   target. Keep every
   new or changed production file under 999 lines. Regenerate crew.
4. `node dsh/packages/mock/tests/mock.mjs` must pass.
5. Headless run (background), see Commands. Fix findings at their cause; one
   BUGS row per finding; keep failed runs.
6. When headless passes all gates: commit (LOC line, co-author line), push.
7. Closing Live Play of Crew in dsh web at normal pacing (see Live Play), then
   all gates, then Replay starts. Record session id, project, image, dsh and
   LayerFS commits, gates output.
8. Post on #350 (session id, project, image, commits, gates output, findings:
   BUGS rows 20–39 plus new ones, and the owner's verification decision
   stated plainly), then close #350. Tell the owner; do not merge into main or
   touch #349/#347 unless asked.

## Environment

- dsh source `/Users/yifanxu/Ephemeral-AI-Lab/deepseek-harness`: **never edit**.
- Runtime image `layerfs-issue337-runtime:frozen`,
  `sha256:091f785ba7d5d036dfa350e8fd69ee1fcd2d8320c3706841c8c95e6411eee9d2`.
- Linux daemon `core/target/cluster2-linux/release/layerfs-daemon` in the #347
  checkout (built from this branch; rebuild only if core changes, with the
  pinned `rust:1.85.1` image, see below).
- Scratch: `~/lfs347/` (evidence `~/lfs347/evidence/crew/run/{trace,agents,seed}`,
  recorded Store `~/lfs347/restore/crew.json`, reader `~/lfs347/reader-src`,
  runs `~/lfs347/runs/`, run home `~/lfs347/runs/home`). `DSH_HOME` is
  `~/lfs347/dsh-home`. **Never use `~/.dsh`.**
- dsh web: mine is port **8795**, token `ortdX_4yDSOlltSWkeeoWi25L6sGsgee3sY3spW8pxQ`
  (background task `b08yywprh`, started with `DSH_HOME=$HOME/lfs347/dsh-home` from
  the dsh source dir: `node --import <dsh>/node_modules/tsx/dist/esm/index.mjs
  <dsh>/apps/cli/src/bin.ts web --no-open --port 8795`, with
  `TSX_TSCONFIG_PATH=<dsh>/tsconfig.base.json`). It answered 401 (alive) at
  handoff time. Leave 8792 and 8793 alone (other sessions).
- `git push`, `gh` and Docker need the sandbox disabled.
- Containers: all my old run containers were stopped on the owner's request
  (Stores, receipts and logs kept). Leave `hungry_chebyshev`, `reverent_raman`
  and anything `layerfs-issue325-*` alone (not mine).

## Commands

```bash
# regenerate crew (about 10 min today; seconds once cached), from the checkout root
E=$HOME/lfs347/evidence/crew/run
node dsh/tools/import-run.mjs crew crew ~/lfs347/restore/crew.json traces=$E/trace agents=$E/agents seed=$E/seed > ~/lfs347/runs/import-crew-N.log 2>&1
# mock and static checks
perl -e 'alarm 120; exec @ARGV' node dsh/packages/mock/tests/mock.mjs
# headless run, background; receipt in ~/lfs347/runs/<run>/receipt.json, per-call output in call-NNNN.out
node dsh/tools/run-scenario.mjs crew --out ~/lfs347/runs --keep > ~/lfs347/runs/crew-N.log 2>&1
# closing gates against a dsh web session
perl -e 'alarm 120; exec @ARGV' node dsh/tools/check-demo.mjs 'http://127.0.0.1:8795/?token=ortdX_4yDSOlltSWkeeoWi25L6sGsgee3sY3spW8pxQ' <session id> crew --wait 90
# LOC for the commit message: count the first parent and the staged tree
python3 tools/production_loc.py --root <dir> --detail   # git archive HEAD / git checkout-index -a --prefix=<dir>/
# Linux daemon rebuild (only if core changes)
docker run --rm --platform linux/arm64 -v <checkout>:/work -w /work -v <checkout>/core/target/cluster2-linux-cargo:/cargo -e CARGO_HOME=/cargo -e CARGO_TARGET_DIR=/work/core/target/cluster2-linux sha256:e51d0265072d2d9d5d320f6a44dde6b9ef13653b035098febd68cce8fa7c0bc4 cargo build --manifest-path core/Cargo.toml --locked --release -p layerfs-daemon
```

Headless logs: `~/lfs347/runs/crew-1.log` … `crew-13.log`; import logs
`import-crew-*.log`. A run prints `✕ <step>: …` at its first mismatch and
`STOPPED: …`, then the gates (`PASS`/`FAIL finished|expected|closed|order|final
tree`).

## Live Play (how the earlier closing Plays were done)

Use the built-in browser pane: navigate to
`http://127.0.0.1:8795/?token=ortdX_4yDSOlltSWkeeoWi25L6sGsgee3sY3spW8pxQ`, find
the Crew demo session ("LayerFS mock · Crew"), open it, choose Live and click
Play. Progress is also readable from the `/layerfs-demo` route (`demos[].run`:
`state`, `done`, `of`, `error`). When the strip reads "Finished · N of N steps",
run check-demo with that session id, then click Replay and confirm it starts.
Remove the run's project and Docker volume once its receipts are recorded.

## Standing rules (from HANDOFF.md, still in force)

- Disposable / WAL / synchronous=OFF Store only; Durable stays NOT_RUN.
- Every test or check has a wall timeout ≤ 120 s (`perl -e 'alarm 120; exec @ARGV' …`);
  longer things run in the background.
- One attempt per operation; no automatic retry or blind resend.
- `rm` only with literal paths. New production files under 999 lines.
  Never commit `dsh/assets/`. Commit only your own paths.
- Every commit records `Production LOC: <before> -> <after> (delta ±N)` and ends
  with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Bugs: fix at the cause; a LayerFS/SDK defect gets a failing regression test
  first; one BUGS.md row per finding; keep failed runs; never relabel a patched
  run as successful; never weaken a gate or an expect beyond what the owner
  decided above.

## State of related work

- Kept failed headless runs: `run-crew-mvbojz2s` … `run-crew-mvbzpk5a` (13 runs;
  run 13 was stopped by the owner at call 992 with no mismatch). Their findings
  are BUGS rows 20–39.
- Zombie fix, separate from #347: branch `sandbox-init-reaper`, worktree
  `/Users/yifanxu/Ephemeral-AI-Lab/layerfs-reap`, commit `fb71dcca4` (from
  `origin/main` 631cdcc90): Sandbox containers get `HostConfig.Init: true`.
  Regression test `sdk/js/test/verify/reap_real.mjs` fails before, passes after.
  Pushed; PR https://github.com/Ephemeral-AI-Lab/layerfs/pull/351 (open,
  mergeable, no CI checks configured; merging is the owner's call). Do not use
  it for the Crew run (keep the Sandbox runtime the record was made with).
- Follow-up still open: the `diff_commits` paging defect (BUGS row 15).
