# Range 044 (native first) · the repair clean keeps a package folder the checkpoint no longer tracks

> **Status:** Current fix record. Harness workload fix in `dsh/tools/history`; no product change. Caught by the step-0 native-first repair check, before any LayerFS attempt.

| | |
| --- | --- |
| Trigger | `nodeproof.mjs calibrate --range 44` (run `p3-main-v`): NATIVE REFERENCE BROKEN, build exit 1, tsdown `[@deepseek-ai/dsh-root] Cannot find entry: ["lib/types/{index,invariant}.js"]` |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: the repair's clean command (F-059, `repairClean`); daemon `27a769a4`, addon `0611f3e0` and Store format unchanged |
| Commits | this commit: `nodeconfig.mjs` `repairClean`; test in `tests/p2.mjs` |
| Recovery | none needed: range 44 a1 plays with the fix |

## What went wrong

- Range 44's agents add `packages/subagent/subagent-subprocess` and remove it
  again before the checkpoint. The plan splits it across two lanes: the root lane
  writes and removes its `package.json`, and lane `r044-3-packages-ui` writes its
  sources. The consolidation's reconcile removes those sources.
- Lane 3's point build (`tsc -b` of `subagent-acp`, which imports the new
  package and fails with TS6059 rootDir errors) emitted `index.js`, `cwd.js`,
  `provider.js` and their `.d.ts` and `.map` files into
  `packages/subagent/subagent-subprocess/src/`.
- After the reconcile, the folder has no tracked file left. The lead's clean is
  `git clean -f` (decision B: no `-d`, no `-x`). It never enters an untracked
  folder, so the emitted files stayed. The F-059 clean removes `packages/*/*/lib`
  and prunes empty folders only.
- tsdown's workspace glob `packages/*/*` took the folder as a package. With no
  `package.json`, it fell back to the root's name and could not find the entry.
  A native probe of the chain, stopped before the build, listed the 12 emitted files.
  LayerFS would have stopped the same way: its lanes emit the same files and its
  repair runs the same commands.

## Fix

- The repair clean also removes, whole, every `packages/<group>/<name>` folder in
  which the checkpoint tracks no file, as a fresh checkout never has one. Folders the
  checkpoint tracks keep every file, including ignored ones and node_modules.
  Decision B's `git clean -f` is unchanged.
- Native first after the fix: repair ok (install 0, build 0, tests pass).
- Test: `tests/p2.mjs` runs the clean in a scratch folder. It removes an untracked
  folder's emitted files and keeps tracked folders' sources and node_modules
  (70/70). `tests/p3.mjs` 35/35.
