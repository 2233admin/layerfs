# #352 · F-053: the SDK discovery lock outlives its Guard across a fork→exec window

> **Status:** Current fix record. Product fix in the SDK native addon.

| | |
| --- | --- |
| Trigger | Found from source by the F-046 RCA (record 036). The owner (2026-10-19, relayed by the liaison) asked to file it as F-053 and fix it with `flock(LOCK_UN)` before close, plus a test that a forked child no longer keeps the lock |
| Kind | product: `sdk/js/native/src/discovery.rs` (`Guard` drop) |
| Branch | `claude/f053-discovery-flock` off `claude/f046-busy-unmount` `402274d5e3`, which stacks on the F-046 harness fix |
| Commits | `c8767ac5f` failing test; the fix commit (below) |
| Production LOC | 102723 → 102727 (delta +4), all in `sdk` (2640 → 2644) |

## Cause

- `os_lock` opens `<directory>/ownership.lock` and takes
  `flock(LOCK_EX|LOCK_NB)`. `guard` returns a `Guard` that owns the file.
  Before the fix, `Guard`'s drop released this process's turn and then let
  the `File` close. The OS lock was released only by that close.
- A flock belongs to the open file description, not to the descriptor or
  the process. A child forked while the Guard is held shares the
  description until its exec closes the close-on-exec copy. The fork can
  come from Node `child_process` in the host, or from any thread's spawn.
  The lock is freed only when the last descriptor on the description
  closes. So if the Guard drops first, the lock stays held until the
  child's exec.
- In that window, another process's discovery mutation is refused `Busy`
  ("another process owns this discovery mutation"). That covers project
  init, Sandbox create and close, and exec and process records
  (`project.rs`, `sandbox.rs`, `exec.rs`). Busy is never retried.

## Test first

`discovery::tests::a_dropped_guard_releases_the_lock_while_a_forked_child_holds_a_copy`,
the first Rust test in `layerfs-node`. It is inline, under
`#[cfg(all(test, target_os = "linux"))]`.

1. Take a Guard on a private temporary directory.
2. A second thread spawns `true`, whose `pre_exec` reports the child's pid
   and blocks on a pipe. The child is held between fork and exec.
   `/proc/<child>/fd` must name `ownership.lock`.
3. Drop the Guard, then take the lock again from a second open of
   `ownership.lock` (`os_lock`), as another process would.
4. Release the child and wait for it.

The bounded waits are a 10 s poll for the fork signal and an end of file
that releases the child. Results, one run each in the pinned image:

| Code | Result | Host load (1 min) |
| --- | --- | --- |
| Before the fix (`c8767ac5f`) | FAILED: `Err(("Busy", "another process owns this discovery mutation"))` | 12.8 |
| After the fix | 1/1 passed, 0.01 s | 6.4 |

## Fix

`Guard` now names its file, and its drop calls `flock(fd, LOCK_UN)`
before anything else. `LOCK_UN` frees the lock on the shared description,
so a forked child's copy no longer holds it. The file then closes as
before. The flock operation numbers are named constants (`LOCK_EX`,
`LOCK_NB`, `LOCK_UN`); their values are the same on Linux and macOS. The
result of the unlock is not checked: a drop has no caller to report to,
and the close follows either way.

### Other flocks checked

- `core/crates/layerfs-persistence/src/backend/sqlite/writer_admission.rs`:
  nix `Flock`, released by `unlock()`, and nix's `Drop` calls `LOCK_UN`
  (nix 0.31.3 `fcntl.rs:1042`). Not affected.
- `core/crates/layerfs-telemetry/src/output/retention.rs`: nix `Flock`,
  whose drop unlocks. Not affected.
- No other `flock`, `lockf` or `F_SETLK` exists in `sdk/js/native/src`,
  `core/crates/*/src` or `dsh/packages`. SQLite's own `fcntl` locks are
  never inherited by a child (record 036).

## Checks

Each ran once with a 115 s limit or less. All Linux runs used the pinned
image `sha256:378b799e…` with `-j2`.

| Check | Result | Wall |
| --- | --- | --- |
| `cargo test -p layerfs-node --lib`, before the fix | 0/1 (the expected failure) | 0.01 s |
| `cargo test -p layerfs-node --lib`, after the fix | 1/1 | 0.01 s |
| `cargo clippy -p layerfs-node --lib --tests -D warnings` | clean | 12 s |
| `direct_refusal_real.mjs outer` (project init through the guard) | ok | 1 s |
| `direct_locking_real.mjs outer` (project init and two `sandbox.create`, through the guard) | ok; integrity ok | 8 s |

For the two `outer` runs, the binaries were dev-profile builds from this
branch's tree in the pinned image:

- daemon sha256 `c092635a…`
- addon sha256 `ddb5ae8b…`
- runtime image `layerfs-352-runtime:node24`
- daemon image `sha256:2d929c6d…`
- host load 8.7

`NOT_RUN`: `close_busy_real.mjs`, the one script in which another process
holds `ownership.lock`. It is host-launched, it loads the addon on the
macOS host, and it has had no in-runtime wrapper since F-020 (record 026
lists it as `NOT_RUN`). The new unit test covers the lock release directly.

Deleted tests: none.
