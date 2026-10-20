# Range 038 a1 · a gitignored test output read as an extra path at the checkpoint

> **Status:** Current fix record. Oracle fix in `dsh/tools/history`; no product change.

| | |
| --- | --- |
| Trigger | range 038 a1, the checkpoint check: `extra: [".sessions/session-query.db"]`, nothing missing, content and modes equal to git; Node 12 pass, 0 stop, 0 NOT_RUN; repair P6 pass |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: `lib.mjs` `verify`, `git.mjs` `gitIgnored`; daemon `27a769a4`, addon `0611f3e0` and the Store format unchanged |
| Test | `tests/runner.mjs` "gitIgnored: the checkpoint's own .gitignore files decide; an ignored test output is no extra" (20/20); `tests/p3.mjs` 35/35 |
| Commits | this commit |
| Recovery | range 38 attempt 2 on run `p3-main-v`, a fork of `p3-main-u`'s r037 snapshot; a1 stays a stop (a checkpoint stop leaves the run dirty, so it cannot be re-judged on retained state) |

## What went wrong

- From range 34 dsh has a session-query SQLite package. One of its tests writes
  `.sessions/session-query.db` at the repository root. The closure's test run
  wrote it into the lead's Workspace, and the publish carried it into the
  checkpoint Commit.
- dsh's `.gitignore` at the checkpoint ignores `.sessions/`, so git never
  tracks the file. A Workspace holds ignored files by design (AGENTS.md: Git
  ignore rules do not filter LayerFS state), and a native run writes the
  same file.
- The P3 checkpoint check compares the paths `diff_commits` lists against
  git's changed paths. It exempted only the fixed closure outputs
  (`CLOSURE_OUTPUT`: `node_modules`, `dist/`, `lib/`, `*.tsbuildinfo`) and the
  harness's own prefixes, so an ignored test output read as an extra path.

## Fix

- In P3, `verify` also exempts paths that the checkpoint's own `.gitignore`
  files ignore. `gitIgnored` writes only those files into a scratch
  repository and asks `git check-ignore --no-index`, so git's own rules
  decide: directory patterns, negations and nested files. Only paths that
  git does not track and that are not already exempt are asked.
- Both the path check and the full-tree check (sealed ranges) use it. The
  exempted paths are recorded in the verify result (`paths.gitIgnored`).
- Every tracked path is compared as before: blob id and mode against git's
  tree. An unignored new file is still an extra, and a missing tracked file
  is still a stop.

## Result

On r038's checkpoint, `gitIgnored` returns `.sessions/session-query.db` and
leaves tracked paths (`apps/web/package.json`, a session-query source file)
alone. a2's result is in [range-038.md](../ranges/range-038.md).
