# #352 · F-046: a sibling test's fork keeps this test's mount busy

> **Status:** Current fix record. Test harness only; no product change.

| | |
| --- | --- |
| Trigger | F-046, eight intermittent `Busy` / `unmount:kernel` panics at `support/mounted.rs:133` (`mounted_commit` r5_3 ×2 and r5_9 ×2, `mounted_cycles`, `mounted_install` ×2, `kernel_coherence` probe). The eighth, on staging `b2c43386d`, came on a build without the gate. A side session was asked for the RCA, a deterministic reproduction, and a fix |
| Kind | test harness (`core/crates/layerfs-daemon/tests/support/mounted.rs`), plus one new test |
| Branch | `claude/f046-busy-unmount` off staging `claude/dsh-352-integration-c98eb1` `77fe3b20ec` |
| Production LOC | 102723 → 102723 (delta +0) |

## Cause

- **Product side: correct.** `KernelSession::detach` makes one
  `umount2(target, 0)` call (`layerfs-fuse` `mount/syscalls.rs`). EBUSY
  becomes `Detach::Busy`, and `control/detach.rs` returns the same
  connection to the registry. Neither the daemon nor the FUSE session opens
  a path inside the mount. The abort control file lives under fusectl, not
  in the mount. So EBUSY means a real mount reference held by some process.
- **Who holds it: a forked child of another test thread.**
  - `fork` copies the whole descriptor table, and so does glibc
    `posix_spawn`'s clone. std's `Command` forks whenever `uid`/`gid` or
    `pre_exec` is set, as every harness spawn of `bash`, `sh` or `sleep`
    as `COMMAND` does.
  - The child keeps its copies until its `execve` closes the close-on-exec
    descriptors. Those `fput`s run as task work when the exec returns.
  - Libtest runs a binary's tests on parallel threads. A spawn in test B
    therefore copies whatever mount file test A has open at that instant:
    an `fs::read`, a `host()` walk, an append loop, a shared mapping's
    file.
  - If A's plain unmount lands before B's child finishes its exec, the
    kernel counts the copy and returns EBUSY. Under load the fork→exec
    window is long; the occurrences came at host load 4.6–8, and the step 8
    run was busier still.
- **Why it stays intermittent.** It needs a sibling's fork to overlap a
  descriptor this test holds, and then this test's unmount to land inside
  that child's fork→exec window. A test's own children do not cause it:
  each one is waited for or killed before the unmount, so it has passed its
  exec.

## Reproduction

`tests/f046_fork_reference.rs`,
`a_descriptor_copied_by_another_threads_fork_keeps_the_plain_unmount_busy`:

1. Mount, create `held`, and open it on the test thread.
2. A second thread spawns `true` with a `pre_exec` that reports the
   child's pid and then blocks on a pipe. The child is held between fork
   and exec, with the copied table.
3. The test thread closes its descriptor. It checks that
   `/proc/<child>/fd` names the mount file, then calls `try_unmount` once.
   The expected result is `Busy` / `unmount:kernel`, with the mount still
   `Ready` and not detached.
4. It releases the child (end of file on the pipe) and waits for the
   spawn to complete. The normal `unmounted` path then drains.

The run (pinned image `sha256:378b799e…`, FUSE flags, built with `-j2`;
host load 14.4): 1 passed in 0.04 s.
`F046_REPRODUCED child=487 … "/tmp/layerfs-q1-475-Mixed-f046/mounts/1/held" … failure=KernelFailure { code: Busy, phase: "unmount:kernel", … }`,
then `F046_AFTER_EXEC receipt=Some(Drained { … terminal: true … })`.
The child's table also held copies of `/dev/fuse` and the Store and
overlay SQLite descriptors. The reproduction runs one test, so it does not
depend on the gate below.

## Fix

`support/mounted.rs` adds a process-wide gate (`Serial`), which every
`Harness::new` takes and the `Harness` holds until it drops:

- The mounted tests of one test binary run one at a time. No sibling
  test's fork can then copy a mount file of a live mount.
- A nested Harness on the same thread does not take the gate again. The
  gate is released when the owning Harness drops, including in a
  `let Harness { .., .. } = harness` destructure and during unwinding.
- The wait for the gate is bounded at 110 s, as the 2-minute test ceiling
  requires.
- There is no retry, no change to `try_unmount` or `unmount`, and no
  change to the product.

## Checks

All runs were in the pinned image, each target in its own container,
with a 110 s limit and one attempt each.

| Target | Result | Wall | Host load (1 min) |
| --- | --- | --- | --- |
| `f046_fork_reference` | 1/1 | 0.04 s | 14.4 |
| `mounted_commit` | 9/9 | 2 s | 31.9 |
| `mounted_install` | 4/4 | 2 s | 31.9 |
| `mounted_cycles` | 4/4 | 5 s | 22.7 |
| `kernel_coherence` | 6/6 | 1 s | 21.4 |
| `cargo clippy -p layerfs-daemon --tests -D warnings` | clean | 87 s | — |

Serializing the tests cost little: each target finished in 5 s or less.
One clean run per target does not show that an intermittent failure is
gone. The reproduction is the evidence for the cause.

## Limits

- The gate covers tests that build a `Harness`. A test that spawns
  processes without one, in a binary that also mounts, is outside it.
  None of the four affected binaries has such a test: the
  `map_close_store_exit_process` entries return at once unless they are
  re-executed as a child.
- The other daemon targets that include `support/mounted.rs` compile with
  the gate (Clippy above), but they were not run in this record.
- Deleted tests: none.
