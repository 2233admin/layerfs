# Range 044 · a package folder the checkpoint no longer tracks: kept by the repair clean (native first) and by decision B's `git clean -f` (a1 stop)

> **Status:** Current fix record. Harness workload fix in `dsh/tools/history`; no product change. Caught by the step-0 native-first repair check, before any LayerFS attempt.

| | |
| --- | --- |
| Trigger | (1) `nodeproof.mjs calibrate --range 44` (run `p3-main-v`): NATIVE REFERENCE BROKEN, build exit 1, tsdown `[@deepseek-ai/dsh-root] Cannot find entry: ["lib/types/{index,invariant}.js"]`. (2) r044 a1 after part 1: STOP `r044.git-main: git status --porcelain lists 1 lines at the checkpoint: ?? packages/subagent/subagent-subprocess/` |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: the repair's clean command (F-059, `repairClean`); daemon `27a769a4`, addon `0611f3e0` and Store format unchanged |
| Commits | `45ea9ee411`: `nodeconfig.mjs` `repairClean`, test in `tests/p2.mjs`. Part 2: `gitlanes.mjs` (`UNTRACKED_LIST`, `UNTRACKED_DIRS`, `cleanScript`), `nodeproof.mjs` `nativeClean`, `gitplay.mjs` (metrics), `p3.mjs` (report line); test in `tests/p3.mjs` |
| Recovery | r44 a1 stays a stop (git); a2 plays on a fork of the r43 snapshot with both parts |

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

## Part 2 · decision B with `-d` (liaison ruling 2026-10-20)

- With part 1, the native reference passed, but r044 a1 stopped at the lead's git
  check. On LayerFS the folder held the same emitted files. `git clean -f`
  (decision B, no `-d`) cleaned 0 files: its list drops a wholly untracked
  folder's `dir/` entry. `git status` then listed `?? packages/subagent/subagent-subprocess/`.
- The liaison's ruling, quoted in part: "approved. The lead's clean becomes `git clean
  -f -d`, still without `-x`." Its conditions: identical in the LayerFS lead and in the
  native chain, and in no other step; every removed path, files and folders, recorded
  in the range metrics, with the count cited in each range comment; the removed folders
  listed in the 41–45 and 46–50 summaries, and any folder that held a file tracked at
  an earlier checkpoint, or that is not a leftover of a removed package or failed
  build, flagged to the liaison.
- The fix:
  - `UNTRACKED_LIST` is every untracked, unignored file at any depth, including
    inside an untracked folder.
  - `UNTRACKED_DIRS` lists the wholly untracked folders that `-d` reaches.
  - The lead runs `git clean -f -d -q`. Its metrics `git.lead.cleaned` add `dirs`
    and `dirPaths`, and the report's Git line names the folders.
  - The native clean removes the same files, then the emptied folders
    (`find -depth -type d -empty -delete`), and records them as `@@cleandir`
    (`proofs["lead.repair"].nativeCleaned[].dirs`).
  - Ignored files and node_modules stay on both sides, so a folder that also holds
    ignored output keeps it.
- Test: `tests/p3.mjs` decision B case. It covers a folder left with only emitted
  files, one that also holds ignored `lib/`, and an untracked `newdir/`, on both
  the lead and the native side (35/35). `tests/p2.mjs` 70/70, `tests/runner.mjs` 20/20.
