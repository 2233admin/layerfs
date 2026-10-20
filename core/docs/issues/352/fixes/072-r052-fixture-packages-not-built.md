# Range 52 · a test fixture's folder is not a package

> **Status:** Current fix record. Harness fix in `dsh/tools/history`; no product change. Caught by the step-0 native-first repair check, before any LayerFS attempt.

| | |
| --- | --- |
| Trigger | r052 native first: `NATIVE REFERENCE BROKEN`, `build exit 2: packages/typert/generator/tests/fixtures/type-model/packages/client/tsconfig.json(9,5): error TS6310: Referenced project '…/type-model/packages/host' may not disable emit` |
| Playbook step | D0 (native first, before the LayerFS attempt) |
| Kind | workload (the harness's build list); gates unchanged |
| Commits | `nodeconfig.mjs` `isFixture`, used by `wholeBuild`, `nodelanes.mjs` `changedPackages` and `closure.mjs` `planClosure`; test in `tests/p3.mjs` |
| Recovery | `nodeproof.mjs calibrate --run p3-main-x --range 52 --repair`: repair ok (70 s) |

## Cause

The tree has no `tsconfig.build.json`, so the repair's whole build is `tsc -b`
of every folder that holds both a package.json and a tsconfig.json. r052 adds
typert's test fixture `tests/fixtures/type-model/`. That folder and its three
`packages/*` each have both files. `tsc -b` of the fixture client fails
TS6310. dsh's own build (`tsc -b` of the root solution, `tsconfig.json`) never
builds the fixture, and nor does pnpm (it is not a workspace member).

## Fix

A folder with a path segment `fixtures` or `__fixtures__` is not a package.
A file under it belongs to the real package around it, so a lane that
changes a fixture builds `packages/typert/generator`.

## What does not change

- No checkpoint of ranges 1–51 has a `tsconfig.json` under a fixtures folder
  (all 202 plan checkpoints checked). The build list for every played range is
  unchanged.
- `native/landlock-run` and `native/landlock-run/packages/entry` are not
  workspace members either, but they have been built since r30. They stay in
  the list, so a workspace-glob filter was not used.
- `repairClean` is unchanged: it still cleans `lib/` and tsbuildinfo
  everywhere, on both sides.

## Proof

- `tests/p3.mjs` "fix 072": 42/42 pass. p2 72/72, runner 21/21.
- tools 16/17: the REBUILD.md §4 failure is the one already on main.
- Native repair at r052 after the fix: ok, no broken step.
