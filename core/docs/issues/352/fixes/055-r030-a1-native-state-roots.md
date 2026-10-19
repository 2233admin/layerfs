# Range 030 a1 · native state snapshots were built at the oracle root

> **Status:** Current fix record. Oracle fix in `dsh/tools/history`; no product change.

| | |
| --- | --- |
| Trigger | range 030 a1 Node proofs: 13 pass, 2 stop, 0 NOT_RUN over 4 points; `r030-1-root.end` and `r030-2-packages-client.end` P4: 4 emitted `packages/client/ui-*/lib/client.js` files differ |
| Playbook step | D2 (Node proof stop, oracle checked first) |
| Kind | none: `nodeproof.mjs` `savestate` (`asState`) and the re-judge's use of a remade snapshot; daemon `45a196ef`, addon `4668012e` and the Store format unchanged |
| Commits | this commit |
| Recovery | the r029 native state remade at LayerFS's roots (`state-c5fa74cd…` for `state-bd3c4cd2…`, same four states), then re-judged on retained state (`--rejudge "fix 055"`); the swap is recorded in the metrics (`node.chainRestated`) |

## What went wrong

- At both points `tsc -b` fails on both sides (exit 2), so `tsdown` does not
  run and the UI bundles are left over from the last repair build.
- tsdown writes a module's absolute path into its output: the CSS-module
  class hash (`OxHa6q_` at `/workspaces/4`, `ecX-Eq_` elsewhere) and the
  `#region` comment.
- LayerFS's leftovers come from the lead repair's build at `/workspaces/4`.
  The native leftovers came from the native state snapshot. `savestate`
  replayed the chain without each state's root (`asState` dropped it), so
  the snapshot's repair build ran at `/lfs352-native-root`.
- Earlier ranges did not show it: no point before r030 compared a CSS-module
  bundle its own build did not rewrite. Every snapshot since step 0 has the
  same flaw, so their leftover bundles carry the oracle root's paths.

## Fix

- `savestate` replays each state at the root recorded in the run's chain, as
  the cached oracles and the proofs do.
- The r029 snapshot was remade from its pre-snapshot chain (r028 native state
  plus r029's repair install, build and test at `/workspaces/3`, `/4`, `/5`).
  The repair build cleans every `lib/` and `*.tsbuildinfo`, so the older
  snapshot under it does not matter. Its `ui-layout` bundle now carries
  `/workspaces/4`.
- A re-judge takes the run's current native state in place of the recorded
  one only when it stands for the same states (`of`), and records the swap.
- After the re-judge: 15 pass, 0 stop, 0 NOT_RUN over 4 points, repair P6
  pass.
