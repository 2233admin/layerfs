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

A second test, `nested_harnesses_on_one_thread_share_the_gate`, nests two
Harnesses on one thread. Without nesting support it would wait out the
110 s bound and panic. It also starts a third Harness on another thread,
which proceeds once the owner stops. The 110 s wait is a readiness wait,
not a retry: on expiry the Harness panics with "mounted test gate held for
110 s".

## Outside tests: can a fork→exec copy happen in the product?

All of this is from source at `77fe3b20ec`.

- **(a) The daemon process: no.** No product source under
  `core/crates/*/src` creates a process. There is no `Command`, `fork`,
  `posix_spawn` or `exec`; the `fork` names there are Branch forks.
  - The mount is our own `mount(2)` with `fd=`, and the session is
    `fuser::Session::from_fd`, built without default features. So no
    `fusermount` runs (the `Command` in fuser 0.18 is in its own test
    module).
  - Sandbox Exec goes to the Docker Engine API over the socket
    (`layerfs-sandbox` `backend/docker/socket.rs`). Its processes run in
    containers and are real holders of the mount, so EBUSY from them is
    correct.
  - So nothing can copy the daemon's `/dev/fuse`, mount or Store
    descriptors.
- **(b) The SDK addon process: no mount copy; Store copies are harmless,
  with one narrow exception.**
  - The addon itself (`sdk/js/native/src`, `sdk/js/src`) starts no process.
  - Its host Node process may start processes (`child_process`, through
    libuv: fork or clone, then exec) while the addon has the Store open.
    The child then holds copies of the Store, WAL and SHM descriptors and
    of the writer-lane directory descriptor until its exec. Every one of
    them is close-on-exec: std `OpenOptions` always sets it, and the
    bundled SQLite's `robust_open` adds `O_CLOEXEC`
    (libsqlite3-sys 0.38.2 `sqlite3.c:41025`).
  - The SDK process holds no file in any mount; mounts live in the daemon's
    container. So it cannot produce an F-046 Busy.
  - **Exception (product, reported, not fixed): the discovery ownership
    lock.** `sdk/js/native/src/discovery.rs` `os_lock` takes
    `flock(LOCK_EX|LOCK_NB)` on `ownership.lock`, and `Guard` releases it
    only by closing the file. A flock belongs to the open file description,
    which a forked child shares. So if the host forks while a Guard is held,
    the lock outlives the Guard until the child's exec. In that window,
    another process's discovery mutation is refused `Busy` ("another
    process owns this discovery mutation"). Explicit `flock(LOCK_UN)` before
    the close would remove the window. The window needs a concurrent
    discovery mutation from a second process and is narrow. The owner filed
    it as F-053 (2026-10-19), and it is fixed in record 037.
- **(c) The range runner (`dsh/tools/history`): no mount copy.**
  - `run.mjs`, `lib.mjs` and `runner.mjs` start `docker`, `git`, `sh`,
    `node`, `df`, `chmod` and `cp` with `execFileSync`/`spawnSync`, in the
    same Node process that loads the SDK addon.
  - It reaches Workspaces only through SDK calls and `sandbox.exec`, and it
    opens no path inside a mount. So its forks copy Store descriptors only,
    which is case (b).
- **SQLite locking under a forked copy: no effect.**
  - SQLite's unix VFS uses process-associated `fcntl` locks, also on the
    `-shm` file. A child never inherits them. Closing the child's copy at
    exec releases only the child's own locks, which are none. The rule that
    "closing any descriptor drops the process's locks" applies within the
    parent and is untouched by a child.
  - The writer lane (`writer_admission.rs`) is a `flock` on the Store
    directory, which a child does share. It is released by explicit
    `unlock()` (`LOCK_UN`), which drops it for every copy. Closing a child's
    copy releases nothing while the parent's description stays open.
  - The telemetry retention lock is a nix `Flock`, which unlocks on drop.
  - So a forked child cannot hold or break a Store lock. That applies in
    tests and outside them.

## Checks

All runs were in the pinned image, each target in its own container,
with a 110 s limit and one attempt each.

| Target | Result | Wall | Host load (1 min) |
| --- | --- | --- | --- |
| `f046_fork_reference` (reproduction only) | 1/1 | 0.04 s | 14.4 |
| `f046_fork_reference` (with the nested test) | 2/2 | 0.09 s | 11.0 |
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
