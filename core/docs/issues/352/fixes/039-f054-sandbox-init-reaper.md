# #352 · F-054: a Sandbox's PID 1 never reaps orphaned processes

> **Status:** Current fix record. Product fix: a Sandbox container setting in `layerfs-sandbox`.

| | |
| --- | --- |
| Trigger | dsh `packages/bash/bash-local/tests/run.spec.ts` timed out on LayerFS at the dev slice's test point `r015-1-docs-rfc.end` (P5 stop) in 4 of 5 replays, and always passed natively. Diagnosed from the recorded runs plus one bounded count. The owner filed it as F-054 on 2026-10-19 (relayed by the liaison) |
| Kind | product: a Sandbox container setting (HostConfig `"Init": true`, layerfs-sandbox `backend/docker/container.rs`), and the endpoint check requires it (`topology.rs`). No Store format change. Sandboxes created by an earlier build are refused on reopen and must be closed and created again |
| Branch | `dsh-352-f054-reaper` off origin/main `bb53c4f91` |
| Commits | `99728208c5`: the fix, cherry-picked from `sandbox-init-reaper` `fb71dcca4` with no conflict, and `reap_real.mjs` ported to the direct route; this record |
| Production LOC | 102,794 → 102,797 (delta +3), all in `core` (94,103 → 94,106, `topology.rs`) |

## Cause

- **The daemon is PID 1.** The Sandbox container ran `layerfs-daemon` as its entrypoint without an init, so the daemon was PID 1. It never waits on processes it did not start: there is no `SIGCHLD` handling and no `waitpid` in `core/crates`.
- **Orphans reparent to it.** `sandbox.exec` runs `bash -c` through a Docker Engine exec. A process that outlives its parent is reparented to the container's PID 1, so after it exits it stayed a zombie until the Sandbox closed.
- **Natively it is reaped.** The native oracle's container runs `sh -c` as PID 1, and sh reaps any child it waits on.
- **How the test is hit.** dsh's `run.spec.ts` "kills the whole process group (grandchildren die too)" starts `sleep 60 & echo $! > pid; wait`, kills the group with SIGTERM, then polls `process.kill(pid, 0)` until the grandchild is gone.
  - If bash dies before it reaps its sleep, the sleep becomes a zombie under PID 1.
  - A zombie answers `kill(pid, 0)`, so the poll never ends.
  - The test's default 5 s timeout fires. vitest reports it as `Error: STACK_TRACE_ERROR` at `@vitest/runner/dist/chunk-artifact.js:1784`: test creation, whose handler is wrapped by `withTimeout`.
- **Not filesystem cost, not load.** The point's Workspace counters were the same in failing and passing replays: about 50.4k lookups, 46.5k opens, 37.6k reads, 235k requests served in 12.4–12.9 s, and 0 Store units.
- **The same leak elsewhere.** #347 BUGS row 30 found 290 Chromium zombies after 16 browser proofs in one Sandbox, which is why `sandbox-init-reaper` was written. This record carries that fix to main's line.

## Evidence (one bounded count, before the fix)

The test's grandchild sequence ran 20 times in one command: `setsid bash -c "sleep 60 & …; wait"`, SIGTERM the group, then read the grandchild's state. Same image `sha256:d3773b4e…` on both sides.

| Environment | PID 1 | Zombies under PID 1 afterwards |
| --- | --- | --- |
| LayerFS Sandbox exec (cwd `/workspaces/1`, binaries `af0c828b`/`a3b8f30a`) | `layerfs-daemon` | **19 of 20** |
| Native container (`docker run --entrypoint sh`) | `sh` | **0 of 20** |

Replays of the point before the fix:

| Replay | End point result | vitest exec |
| --- | --- | --- |
| g, h, i, k | fail | 6.5–6.6 s |
| j | pass | 5.0 s |

At the mid point it passed 5 of 5. Native runs `run.spec.ts` in 503–524 ms.

The scripts and raw output are in `~/lfs-history/dev/diag-runspec-20261019/`; the full diagnosis is in the liaison's notes (`f031-runspec-timeout-diagnosis-20261019.md`).

## Fix

- **`container.rs`.** The container is created with HostConfig `"Init": true`. Docker's init (`docker-init`, tini) is PID 1: it forwards signals and reaps orphans. The daemon is its child.
- **The daemon's own waits are untouched.** The commands it starts keep their exit statuses. A `waitpid(-1)` reaper inside the daemon would have raced those waits, so that design was not used.
- **`topology.rs`.** The endpoint check now requires `"Init": true` as it requires every other HostConfig setting, on create and on reopen. A Sandbox created by an earlier build is refused on reopen; close it and create it again.
- **Signals.** The daemon has no signal handlers.
  - As PID 1 it ignored SIGTERM (the kernel drops unhandled signals to PID 1), so `docker stop` (t=1, crash teardown) always ended in SIGKILL.
  - As PID 2, SIGTERM ends it at once.
  - There is no graceful drain either way, as before.
- **The test case.** `sdk/js/test/verify/reap_real.mjs` (new on the branch) was written before F-020 and called the SDK on the host. It now runs its inner part in the runtime image through `container.mjs`, as the other `*_real.mjs` cases do. Its assertions are unchanged:
  - three orphaned sleeps are gone after they exit;
  - PID 1 is not the daemon;
  - `exit 7` still answers 7.

## Checks

Each check ran once with a limit of 115 s or less, at host 1-min load 10.9–16.7. Binaries were built from the local, unpushed test merge `f054-testmerge-local` `19c700383a` (dsh-352-f031-build `58540f0076` + this branch) in image `378b799ef433`, release `--locked --offline -j 6`, in 31.71 s: daemon `c09a1010…`, addon `e2623e35…`.

| Check | Result | Wall |
| --- | --- | --- |
| `reap_real.mjs`, new binaries, Sandbox image `d3773b4e` | pass; PID 1 `docker-init` | 6 s |
| `reap_real.mjs`, old binaries `af0c828b`/`a3b8f30a` | fails: inner exit 1 on an assertion. The assertion text was lost to an output filter and was not rerun | 6 s |
| host (`+1.85.1`): `cargo test -p layerfs-sandbox --test engine_lifecycle` | 7 passed | 1 s |
| host: `cargo test -p layerfs-api --test sandbox_operations` | 7 passed | 1 s |
| host: `cargo clippy -p layerfs-sandbox -p layerfs-api --all-targets -D warnings` | clean | 11 s |
| Linux (image `378b799ef433`): engine_lifecycle | 7 passed | — |
| Linux: sandbox_operations | 7 passed | — |
| Linux: the same Clippy | clean | 10 s |

### The slice point once more (owner, 2026-10-19)

- **Setup.**
  - Run `f054-point`: a fork of `f031-slice-k` r15 onto the new binaries, in a fresh Sandbox.
  - Branch `f054-point` forked from the point's own state before vitest, Commit `12e01fc7…` (its install and tsc Commits were UpToDate).
  - The exact recorded 53 files with the recorded command (`vitestCommand(files, 110)`).
- **Result.** One attempt, recorded as it came: **pass**.
  - vitest exit 0 in 4.86 s; 0 of 53 files failed.
  - `run.spec.ts` passed in 519 ms with 35/35 tests. "kills the whole process group (grandchildren die too)" took 22 ms.
- **Zombies under PID 1:** 0 before and **0 after**, with PID 1 `docker-init`.
- Output: `~/lfs-history/dev/f054-point-20261019/result.json`.

## Not done

- The dev slice was not replayed in full on the new binaries; only this point was rerun, as the owner asked.
- Live Sandboxes from earlier builds, including the dev runs' and other sessions', are refused on reopen and need to be created again.
