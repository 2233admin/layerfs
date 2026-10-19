# Range 029 a1 · the native replay gave every file a new time

> **Status:** Current fix record. Oracle fix in `dsh/tools/history`; no product change.

| | |
| --- | --- |
| Trigger | range 029 a1 Node proofs: 18 pass, 1 stop, 0 NOT_RUN over 5 points; `r029-2-root.end` P4 stop, "tsc exit 1, native 2" |
| Playbook step | D2 (Node proof stop, oracle checked first) |
| Kind | none: the native chain's tree extraction (`nodeproof.mjs` `nativeChain`, `SYNC_TREE`, `CHAIN_VERSION` 2 → 4); daemon `45a196ef`, addon `4668012e` and the Store format unchanged |
| Commits | this commit |
| Recovery | re-judged on retained state (`--rejudge "fix 054"`): LayerFS's recorded build exit and emitted files are unchanged, and only the native reference is rebuilt |

## What went wrong

- At `r029-2-root.end` the tree links `@earendil-works/pi-ai` 0.81.1, and
  0.79.3 is still in the store. `llm-pi-ai`'s source is unchanged in the
  lane, but it still uses the 0.79 API.
- LayerFS: `tsc -b` took `llm-pi-ai` as up to date (none of its files
  changed since its build), went on, and failed in `apps/cli` on `rootDir`.
  The exit was 1.
- Native: the chain extracted the whole point tree with `tar -x -m`, so every
  tracked file got the extraction time. `tsc -b` took every package as
  edited, rebuilt `llm-pi-ai` against 0.81.1 and failed there. The exit was 2.
- A checkout, and a LayerFS step, write only the files that changed. The
  native model rebuilt more than either. The `-m` itself stays: it was
  F-031 slice f's fix for changed sources looking older than their outputs.

## Fix

- When the folder already holds a tree, the native chain extracts the next
  tree to a scratch folder and copies in only the files and links that are
  missing or differ in content, mode or target (`SYNC_TREE`), still with new
  times. Every other file keeps its time. Deletions are removed as before. A
  first tree is extracted whole.
- The comparison is by content, not by a git diff. A first version extracted
  only `git diff --diff-filter=AMT prev tree` (`CHAIN_VERSION` 3). It broke
  the lead repair's native install (exit 1, 2,442 extra entries): after the
  lanes' capture, restore and merge the folder is not any one tree, so the
  diff missed files. That re-judge is superseded by the second one.
- `CHAIN_VERSION` 4, so no native oracle cached with an older extraction is
  reused.
- Checked on the retained state: the native replay of `r029-2-root.end` exits
  1 with LayerFS's errors (`apps/cli` `rootDir`) and emits 134 files, as
  LayerFS did. The re-judge gives 19 pass, 0 stop over 5 points, with repair
  P6 pass.
- Test: `SYNC_TREE` keeps an unchanged file's time and copies a changed
  file, an added file, a mode change, a retargeted link and a folder that
  became a file.
