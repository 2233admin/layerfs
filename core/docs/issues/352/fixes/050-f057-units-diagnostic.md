# #352 fix 050 · F-057 merge-units diagnostic (range 15)

> **Status:** Diagnostic record, 2026-10-20, one sample. Owner-approved via the
> liaison. It changes no gate, harness default or main run path, and does not
> change the ranges 21–30 run. Product under test: main `3af7a4e96d`, which has
> [fix 049](049-f057-merge-units.md).

| | |
| --- | --- |
| Question | Do F-057 merge units fix the case they were built for, range 15's `lead.repair`? There, a3 (`p3-main-c`) stopped on P6 because the public hoist `@cordisjs/plugin-loader` resolved to `vendor/loader`. |
| Binaries | Built from `3af7a4e96d` in the pinned image at `-j 2` while QUIET existed. Daemon sha256 `c62fa278…c4c468`, addon `78393364…bc60d` |
| Run | `diag-f057`, forked from `p2-main-f` range 14 (the same start as r015 a3/a4). `run.json` has `diagUnits: true`. Outputs are under `~/lfs-history/diag-f057/` |
| Units | `install`: `node_modules`, `packages/*/*/node_modules` · `build`: `packages/*/*/lib`, `**/tsconfig.tsbuildinfo` |
| Repair | The old incremental repair: `pnpm install --offline` without the clean relink, then `tsc -b` and tsdown without a clean build |

## Harness flag (diagnostic only)

`run.json` → `diagUnits: true` (`nodeconfig.mjs diagUnits`). It does four things:

- `agents.mjs` passes the units to `branch.merge` in `consolidateLanes`, and stops with a Mismatch if the answer has no `units` field.
- `closure.mjs` plans the incremental repair.
- `nodeproof.mjs` and `lanemerge.mjs --units` merge the native lane captures by the same rule: when both lanes changed a unit, the whole unit comes from the newest write, and the earlier lane wins a tie.
- `quiet.mjs` lets the run proceed without taking QUIET.

`globrules.mjs` holds the gitignore-style matcher, so `lanemerge.mjs` can be staged into the native container. Without the flag, every path is unchanged. Test: `tests/p3.mjs`, 31/31.

## Result

| Proof (`lead.repair`) | Result |
| --- | --- |
| P1 installed tree, including `node_modules/.pnpm/node_modules` | **pass**. Equal to native; folded into P6 |
| P4 emitted files, tsc exit | **pass**. 520 files, exit 0 |
| P6 | **pass**. 5,917 files rewritten |
| P2 / P5 | pass (exit 0) / pass (30 files) |
| Other points (initial, three lane ends) | pass. Range: 20 pass, 0 stop, 0 NOT_RUN over 5 points; verdict watch (pilot Speed/Scaling not judged) |

The stale `@cordisjs/plugin-loader` hoist is gone: the `.pnpm/node_modules` group (761 entries) now has the same digest as native.

**Units report** (LayerFS `branch.merge`):

| Merge | ms | install (ours/theirs changed → kept, dropped) | build |
| --- | --- | --- | --- |
| r015-1-root | 3.6 | no units changed on both sides | — |
| r015-2-docs-rfc | 809.2 | 5,480 / 238 → theirs, 5,480 dropped | 7 / 303 → theirs, 7 dropped |
| r015-3-packages-core | 649.5 | 238 / 238 → ours, 238 dropped | 303 / 380 → ours, 380 dropped |

`crossLinks` was 0 and `unitsTruncated` false on every merge. The whole consolidation took 57.8 s.

On the native side, during the calibration run with units: install changed on 5,450 / 105 / 105 paths in the three lanes, kept from store 1, 5,555 dropped; build kept from store 2, 529 dropped. The same model gave the same installed tree as LayerFS (P1).

**Repair time** (LayerFS closure exec):

| Repair | install | build |
| --- | --- | --- |
| Incremental with units (this run) | 2.78 s | 9.69 s |
| Clean relink + clean build, r015 a4 (`p3-main-d`) | 26.1 s | 7.6 s |
| Clean relink + clean build, r020 a2 (`p3-main-p`) | 34.0 s | 10.4 s |

Native incremental took 1.71 s for the install and 7.35 s for tsc.

## First attempt (kept, not counted)

The first fork pinned an older SDK JS, which silently dropped `units`: every merge answered `units []`. On that attempt:

- P6 stopped on `node_modules/.pnpm/node_modules`, the original F-057 symptom;
- P2 stopped: native gave `Packages: +135 -6`, LayerFS "Already up to date".

Its outputs are kept as `*-sdkdrop`. The fail-loud check in `agents.mjs` was added after it, and the run was forked again with `--sdk` pointing at this tree.
