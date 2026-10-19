# Range 022 (native first) · the repair clean misses a tsBuildInfoFile outside the package

> **Status:** Current fix record. Harness workload fix in `dsh/tools/history`; no product change. Caught by the step-0 native-first repair check, before any LayerFS attempt.

| | |
| --- | --- |
| Trigger | `nodeproof.mjs calibrate --range 22 --repair`: NATIVE REFERENCE BROKEN, build exit 1, tsdown `UNRESOLVED_ENTRY lib/types/bin.js` |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: the repair's clean command (F-059); daemon, addon and Store format unchanged |
| Binaries | daemon `44ac6c91` and addon `77597adb` unchanged |
| Commits | this commit: `nodeconfig.mjs` `repairClean`; test in `tests/p2.mjs` |
| Recovery | none needed: range 22 a1 played with the fix |

## What went wrong

- `packages/examples/cli-demo/tsconfig.json` sets `tsBuildInfoFile` to
  `../../../.typecheck/cli-demo.tsbuildinfo`, at the repository root.
- The F-059 repair clean removed every package's `lib/` and the
  `*.tsbuildinfo` files under the packages only. The root `.typecheck/` file
  from an earlier build survived, so `tsc -b` took cli-demo as up to date and
  emitted nothing; tsdown then failed on its `lib/types/bin.js`. LayerFS
  would have stopped the same way (a closure build exit is a Mismatch).

## Fix

- The clean removes every `*.tsbuildinfo` in the tree (outside `.git` and
  node_modules), as F-059's rule says ("cleans lib/ and tsbuildinfo").
- Native first after the fix: repair ok (install 0, build 0, tests pass).
- `fixno.mjs` reads the fixes folder from the repository's top (it read it
  relative to the working directory).
