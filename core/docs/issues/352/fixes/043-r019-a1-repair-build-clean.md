# Range 019 a1 · the lead repair's build starts from clean output

> **Status:** Current fix record. Harness workload change in `dsh/tools/history`, approved by the owner; no product change (F-059).

| | |
| --- | --- |
| Trigger | range-019.md a1: Correctness, steps 2043/2044 (`r019.build exited 2`, TS2694/TS2339 on tool-bash's `Config`); Node proofs, `r019-2-packages-core` end P4 stop (`core/session/lib/types/tool-pairing.{d.ts,js}`) |
| Playbook step | D0 (oracle and workload checked before the product) |
| Kind | none: a harness workload change; the daemon, addon and Store format are unchanged |
| Binaries | daemon `44ac6c91` and addon `77597adb` unchanged |
| Commits | this commit: `nodeconfig.mjs` (`repairClean`, `repairBuild`), `closure.mjs` (`closureSteps`); tests in `tests/p2.mjs` |
| Recovery | range 18 replayed as attempt 5 (fork of snapshot `range-017`; stopped on this fix's first version, see the correction), then attempt 6, then range 19 attempt 2 (stopped on orphan package folders, see the second correction), then attempt 3 |
| Decision | owner, 2026-10-20, via the liaison: option A; option B (point base carried across ranges, build exit judged against native) is out |

## Old design

- The repair ran a clean relink of `node_modules` (F-057), then `tsc -b` over
  the packages the range changed, then dsh's bundler.
- `tsc -b` decides from its `tsbuildinfo` whether a package is up to date.

## What went wrong

- A lane point plays commits from a side branch. Lane 3 of range 19 built
  tool-bash at a commit whose `src/index.ts` has no `Config`. Lane 3 was the
  only lane that changed `lib/types/index.d.ts`, so the merge kept its copy.
  The `tsconfig.tsbuildinfo` was two-sided, and the newer write won.
- At the checkpoint the source exports `Config`, but the repair's `tsc -b`
  took tool-bash as up to date, so `agent-spine-demo` failed: exit 2. The native
  repair chain with the same merge (fix 042) gave the same exit and errors in a
  diagnostic run, so LayerFS matched its model.
- The lane-2 point's P4 stop has the same cause one range back. LayerFS's
  r18 main kept r18's repaired `tool-pairing` output (`c233d58c`). The point
  oracle's base is the previous closure on a fresh checkout, which built
  `2352ae25`.

## New design

- The repair's build command is `repairClean(files) && <whole build>`.
  `repairClean` removes `<pkg>/lib` and every `*.tsbuildinfo` (outside
  `node_modules`) in every package that has both `package.json` and
  `tsconfig.json` at the checkpoint. Then dsh's whole build runs (`wholeBuild`:
  `tsc -b` of every such package, then tsdown), and its emitted files are
  listed for P6. The build row's time includes the clean.
- The native repair chain replays the recorded command, so it cleans too. The
  closure chain records the command, so the next range's point base (a fresh
  checkout plus that chain) equals the repaired main.
- Lane points build as before. No gate, threshold, proof scope or timeout
  changes.

## Correction after range 18 a5

- The first version cleaned every package and then built only the changed
  ones (`pointBuild`). tsdown bundles every package from its `lib/types`, so
  r018 a5's repair build failed `UNRESOLVED_ENTRY ... lib/types/index.js`
  (exit 1). Natively it failed the same way.
- The repair now runs the whole build after its clean (`repairBuild(files)` =
  clean + `wholeBuild`). Natively that build of r18 exits 0 in 7.7 s with 719
  emitted files (diagnostic without lane states, see fix 044; r18 a6's proof,
  with lanes, then passed P6). The test pins the whole build. Recovery: range 18
  attempt 6 from the r017 snapshot, then range 19 attempt 2.

## Second correction after range 19 a2

- Lanes built in package folders that the checkpoint deletes
  (`packages/core/agent-core`, `packages/ui/stdio-agent`). The lead's git step
  removes their tracked files, but the untracked `lib/` stays. tsdown bundles
  every `packages/<group>/<name>` folder, so r019 a2's repair build failed:
  `MISSING_EXPORT "AgentId"`, exit 1. Natively it failed the same way.
- The clean now also removes `packages/*/*/lib` and every tsbuildinfo under
  `packages/`, then prunes empty folders (`PRUNE_EMPTY`). The repair install
  already removed their `node_modules`, so the orphan folders go, as on a fresh
  checkout. Natively the r19 repair build then exits 0 in 7.5 s with 721
  emitted files (diagnostic; that chain had no lane states, see fix 044). The test pins the sweep. Recovery: range 19
  attempt 3 from `p3-main-l`'s r018 snapshot.

## A closure chain reset, tried and reverted (range 20)

- The native chain behind the point oracles, calibration and seq oracles
  replays the closure chain from the last clean install. In `p3-main-n` that is
  range 15's first install plus every range's repair install, build and test:
  17 native states. Range 20's calibration of `r020-2-examples-acp-agent.end`
  (that chain plus native vitest timing out at 90 s) passed the 115 s command
  alarm.
- `0420a43db7` restarted the chain at a range's repair: its clean install and
  its build from clean output. Range 20 a1 then stopped at the root lane's P1
  on `node_modules/.bin`. On a fresh checkout the repair's clean install runs
  before any `lib/` exists, and pnpm links a workspace bin only when its target
  exists. LayerFS's repair install ran with `lib/` present. So the reset was not
  exact; it is reverted (code and test). The long chain stays.
- Range 20 calibration: points 1 and 3 on the long chain (90 s and 79 s
  commands). Point 2 keeps the short-chain record: native vitest timed out at
  90 s, so no tests. Its note in `node-020.json` says so. Range 20 a2 forks
  `p3-main-n`'s r19 snapshot (`p3-main-o`).

## Also fixed (report, a stop inside the closure)

- F1: a stop inside the closure lost the Commits of the steps already played.
  r019 a1 counted 958 LayerFS Commits against 959 in the Overview. `playClosure`
  now attaches its rows to the error, and the play counts their Commits.
- F7: the older report format puts the Overview first, and the check read
  only the text before the first section. The check now reads the header up
  to the first section after the Overview.

## Cost

- The repair builds every package's types from scratch, and the bundler
  rebuilds every bundle, each range (natively 7.7 s at r18). Range 18 a5 and 19 a2 report the
  build time against r15. If the full build pushes a range's final command
  past its 295 s alarm, the run stops and the liaison is told; the alarm is
  not raised.

## Tests

- `tests/p2.mjs` "closure (INSTALLS)": the repair's build is the clean, then
  `tsc -b` of every tsconfig package and tsdown. The clean covers every package with a tsconfig, never
  the root, and only the repair cleans. A stop inside the closure keeps the
  played rows (`closureRows`).
