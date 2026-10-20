# Range 050 (native first) · the test calibration probed under another HOME than the replay

> **Status:** Current fix record. Harness oracle fix in `dsh/tools/history`; no product change. Caught by the step-0 native-first repair check, before any LayerFS attempt.

| | |
| --- | --- |
| Trigger | `nodeproof.mjs calibrate --range 50` (run `p3-main-w`): NATIVE REFERENCE BROKEN, `1 calibrated test(s) fail natively: packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts` ("promise resolved … instead of rejecting") |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: the calibration probe's environment; daemon `27a769a4`, addon `0611f3e0` and Store format unchanged |
| Commits | this commit: `unit-tests.mjs` `probeEnv` (used by `probe`); test in `tests/p3.mjs` |
| Number | written as 066; renumbered 068 on 2026-10-20 (liaison) because main took 066 (f063.mjs) and 067 (sql.call Contended check) |
| Recovery | none needed: range 50's tests recalibrated, then a1 plays (`tests-050.pre-fix068.json` kept) |

## What went wrong

- `fs-sandbox.spec.ts` puts its "outside" folder under `homedir()`, because
  `workspace-write` grants `/tmp`. With `HOME=/tmp` that folder is inside a
  grant, so the write is allowed and the test fails.
- Fix 052 (r027) made the replay's vitest run with `HOME=/tmp` on both sides,
  as the SDK's Sandbox exec does. `calibrate-tests.mjs`'s per-file probe
  (`unit-tests.mjs probe`) still ran under the image's own HOME (`/root`). So
  the file probed as a pass, entered range 50's run set (160 files), and the
  native repair, which runs the set with `HOME=/tmp`, failed on it. LayerFS
  would have failed it the same way.
- Earlier ranges did not select the file or did not run it in the repair.
  Their run sets were checked natively by the repair under `HOME=/tmp`, which
  passed. So no earlier verdict depends on this.

## Fix

- The probe runs with `HOME=/tmp` (`probeEnv`), as `vitestCommand` does, so a
  test that needs HOME outside the temp grants probes as a native failure and
  is left out, as fix 052 intended.
- Range 50's `tests-050.json` was recalibrated in full under the fixed probe.
  The first file is kept as `tests-050.pre-fix068.json`.
- Test: `tests/p3.mjs` (36/36) checks that the probe's HOME is `/tmp` and
  matches `vitestCommand`'s.
