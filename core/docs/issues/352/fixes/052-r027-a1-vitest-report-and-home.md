# Range 027 a1 · a cut vitest report and a different HOME on the native side

> **Status:** Current fix record. Harness fixes in `dsh/tools/history`; no product change.

| | |
| --- | --- |
| Trigger | range 027 a1 Node proofs: 14 pass, 1 stop, 1 NOT_RUN over 4 points |
| Playbook step | D2 (Node proof stop, oracle and harness checked first) |
| Kind | none: the harness's vitest command; daemon `45a196ef`, addon `4668012e` and the Store format unchanged |
| Commits | this commit: `unit-tests.mjs` `vitestCommand`, `nodelanes.mjs`; tests in `tests/p3.mjs`, `tests/tools.mjs` |
| Number | written as 050 in `f5ac09068f`; renumbered 052 on 2026-10-20 (liaison) because main's F-057 diagnostic took 050 |
| Recovery | range 027 a2 on a fork of r025's snapshot, with r026 replayed in `fast` mode as setup (point 1's LayerFS results were lost, so a re-judge on retained state is not allowed) |

## What went wrong

1. **`r027-1-root.end`, P5 NOT_RUN.** LayerFS's vitest run of 204 files
   exited 0, but its JSON report passed the Sandbox exec's stdout cap
   (about 1 MiB) and arrived cut ("Expected double-quoted property name in
   JSON at position 1047152"). The per-file results were not kept.
2. **`r027-3-docs-rfc.end`, P5 stop.** `packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts`
   (dsh `37f2c15e68`) passed natively and failed on LayerFS: an "outside"
   write resolved instead of being denied. The test puts its folders under
   `homedir()` because `workspace-write` grants `/tmp`. The SDK's Sandbox exec
   runs as uid 501 with `HOME=/tmp` (`sdk/js/native/src/exec.rs`), so on
   LayerFS the "outside" folder was under a granted path and the write was
   correctly allowed. The native replay runs as root with `HOME=/root`. This
   is an environment difference in the harness, not a LayerFS defect.

## Fix

- `vitestCommand` runs vitest with `HOME=/tmp` on both sides, so the native
  oracle judges the environment LayerFS runs in. A test that depends on HOME
  being outside the temp grants now fails natively too and is left out of
  the calibrated set, as any native failure is.
- The LayerFS side (`nodelanes.mjs`) writes vitest's report to a file under
  `/tmp`, outside the Workspace, and prints back only what the readers use:
  each file's name, status and message, and up to three failed tests' first
  messages (2,000 characters each). The exit status is kept.
- Tests: the compact report of a 1.3 MiB report (300 files) comes back under
  100 KB, parses, keeps the failing file's message and the exit status.

## Open question for the owner

The Sandbox exec's stdout cap (about 1 MiB) cut a 204-file vitest report.
Whether that cap is an artificial transport limit (AGENTS.md: resident
containers and transport frames must not impose artificial caps) is an open
question for the owner. The cap is not changed here; the harness works around
it by reading the report from a file.
