# Range 028 a1 · tsdown emits CSS-module class maps in no fixed order

> **Status:** Current fix record. Oracle fix in `dsh/tools/history`; no product change.

| | |
| --- | --- |
| Trigger | range 028 a1 Node proofs: 18 pass, 1 stop, 0 NOT_RUN over 5 points; `lead.repair` P6 stop, P4: 4 emitted files differ (`packages/client/ui-{layout,sidebar,trajectory,conversation}/lib/client.js`) |
| Playbook step | D2 (Node proof stop, oracle checked first) |
| Kind | none: the emitted-file identity of P4 (`nodeconfig.mjs` `EMITTED`); daemon `45a196ef`, addon `4668012e` and the Store format unchanged |
| Commits | this commit: `nodeconfig.mjs`, `nodeproof.mjs` `oracleKey`; tests in `tests/p3.mjs` |
| Recovery | range 028 a2 on a fork of `p3-main-s`'s r027 snapshot |

## What went wrong

- From range 28 the client UI packages bundle CSS modules. tsdown writes
  each module's class map (`"centerCol": "OxHa6q_centerCol", …`) in an
  order that changes from build to build.
- A second native build of the same chain gave a third set of ids for the
  same files (`ui-layout`: oracle `eb496b9d`, replay `8e5d9a28`, LayerFS
  `a2095c8e`).
- Read back from the Store, LayerFS's files equal this native replay once the
  lines inside each class map are sorted (`ui-layout`, `ui-sidebar`,
  `ui-trajectory` checked). They differ in no other way, so this is not a
  LayerFS defect.

## Fix

- P4's emitted-file id sorts each run of two or more `"key": "value"` lines
  and drops their commas before hashing, on both sides. Every other file
  keeps its git blob id, so unaffected outputs compare exactly as before.
- The native oracle's cache key (`oracleKey`) now covers the tail's emitted-id
  and vitest commands, so an oracle built with an older command is not reused
  (the first a2 calibration took the cached a1 repair with the old ids).
- Tests: a class map in another order gets the same id, a changed map gets a
  different one, and a plain file's id is its git blob id.
