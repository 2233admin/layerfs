# Range 007 a1 · F-017 · concurrent SDK calls take separate control connections

| | |
| --- | --- |
| Trigger | `p2-main` range 7 attempt 1 (daemon `361bb09e`): Speed `fs.read` ≤1 KiB 17.81× baseline (watch). Diagnosis: about 1 ms of daemon work, 19 ms p50 and 44 ms p95 at the client. BUGS.md F-017 |
| Playbook step | D6 (time outside the operation: client queueing) |
| Kind | 1 forward-only (REBUILD.md): SDK binding only, no daemon or Store change |
| Old Stores | open unchanged (no schema change; daemon unchanged) |
| Old data | still read as before |
| Compatibility test | **passed**: a range-4 fork of `p1-pilot-b` written by `511dceed`, read by daemon `361bb09e` through addon `5baa0f5d`, passes the whole-tree proof checkpoint (530 files, 283 blob ids, 285 changed paths) with `dsh/tools/history/compat.mjs` |
| Binaries | daemon `361bb09e1d9465ab47e93d1ae98226e62018aad71340140500bbcebb1fde41f4` unchanged. SDK addon `3da0f6658cdc…` (kept in `core/target/issue352/sdk-3da0f665/`) → `5baa0f5d64059afe66511c28734f08eedf8458edb66b60e4e14872118cb41af3` |
| Commits | the commit that adds this file. Regression test `sdk/js/test/verify/concurrent_reads_real.mjs` |
| Recovery | fork the `p2-main` range-7 snapshot onto daemon `361bb09e` and addon `5baa0f5d`, then rerun range 7 measured as attempt 2 with the corrected gate (F-016) |

## Old design

The binding (`sdk/js/native`) held one control connection per Sandbox, in
`registry.rs` as `control: Mutex<Control>` at `7e674b56d`. Every SDK call of
every agent on that Sandbox locked it for its whole exchange. So a 1 ms
`fs.read` waited for any `fs.write`, `sandbox.commit` or `fs.grep` in front of
it. The daemon already serves each connection on its own worker, so the queue
existed only in the client.

A second queue sat in front of it: the binding runs each call on the libuv
thread pool, which has 4 threads by default. A running `sandbox.exec` holds
one thread for the whole command.

## New design

- **Pool.** New `sdk/js/native/src/pool.rs` defines `Controls`, the
  connections of one Sandbox. A call borrows an idle connection. If none is
  idle, it opens another, up to `CONNECTIONS` = 6. At the limit it waits on a
  condition variable until one is returned.
- **Daemon admission.** A Sandbox this binding creates admits 8 connections
  (`DAEMON_CONNECTIONS`, previously 4), leaving 2 for other processes. If
  opening a connection fails because the daemon admits no more, the Sandbox
  keeps the connections it already has, and callers take turns on them.
- **Opening a connection.** Each new connection is authenticated, then a
  `Hello` checks that it reached the same daemon instance. Nothing is sent
  before the connection is ready, so opening one is not an attempt at any
  operation.
- **One attempt.** Each exchange runs whole on one connection and is sent
  once. A connection whose exchange failed is quarantined by its `Control`,
  as before. It is now closed instead of kept, and a later call may open a new
  one. The failed call is never resent.
- **Bounded memory.** At most 6 connections per Sandbox per process.
- **Thread pool.** `sdk/js/src/native.js` sets `UV_THREADPOOL_SIZE` to 64
  unless the caller already set it. Threads are only created when calls need
  them.
- **Queue wait in the trace.** Each call reports how long it waited for a
  connection, and the trace splits that wait from libuv queueing:
  `queue: { ms, thread, connection }` on every traced line.
- **Records removed during a refresh.** `discovery::refresh` now skips mount
  and process records that a concurrent unmount removed. Before, it failed with
  `NotFound`. Serialized calls hid this race. It showed up in
  `concurrent_unmount_real` (1 failure in 5 runs before the fix, 4 of 4
  after). The failure was only captured on the third run: the first two
  reruns came before diagnosis, against the diagnose-first rule.

## Proof

`concurrent_reads_real.mjs`, written first. It writes a 1 KiB file, then
starts a 64 MiB `fs.write` with four reader loops reading the file until the
write settles. It asserts at least 20 reads during the write, and a read p50
during the write of at most max(5 × solo, solo + 50 ms).

| Addon | Write | Reads during it | Read p50 solo → during |
| --- | --- | --- | --- |
| old `3da0f665` | 983 ms | 1 | fails: reads wait for the write |
| new `5baa0f5d` | 969 ms | 2,177 | 0.7 → 1.3 ms |

Other checks:
- Addon clippy `-D warnings` is clean.
- The SDK unit tests (9) pass, and so do all 8 `test/trace.mjs` cases.
- `fs_write_large_real` passes, and `concurrent_unmount_real` passes 4 of 4
  runs.
- `dsh/tools/history/tests/tools.mjs` passes.

## Performance, old vs new

Setup: two diag forks of the `p2-main` range-7 snapshot, label dev, daemon
`361bb09e`. Range 8 was played once on each, because a fork of the range-7
snapshot continues at range 8. Each fork used a fresh daemon on a
just-restored Store file. The old arm ran addon `3da0f665` with
`UV_THREADPOOL_SIZE=4` (its default). The new arm ran `5baa0f5d`. Both played
the same 166-call history: 37 reads, 48 greps, 101 Commits and 211 execs.

| Call | p50 old → new (ms) | p95 old → new (ms) | Queue wait new p50 / p95 (ms) |
| --- | --- | --- | --- |
| fs.read | 25.0 → 6.6 | 43.2 → 92.7 | 0.2 / 0.4 |
| fs.grep | 32.2 → 12.4 | 108.9 → 111.0 | 0.3 / 0.4 |
| fs.list | 24.3 → 7.0 | 39.5 → 85.7 | 0.2 / 0.5 |
| fs.stat | 21.8 → 5.0 | 118.7 → 80.8 | 0.2 / 0.5 |
| sandbox.commit | 14.4 → 13.4 | 92.5 → 133.4 | 0.3 / 1.1 |
| sandbox.exec | 43.5 → 38.0 | 87.7 → 78.5 | 0.3 / 0.8 |

- **Connection wait.** The new addon reports 0 ms connection wait at p95.
  Before the fix, the old addon's reads spent 23.5 ms at p50 outside the
  daemon's reader transaction (`ms` minus reader transaction time, fs.* calls).
  The new addon's reads spend 5.4 ms there.
- **Total play time.** Span 15.5 → 14.9 s.

**Cost.** The p95 of reads and Commits rose: `fs.read` 43 → 93 ms and
`sandbox.commit` 93 → 133 ms. The waiting moved into the daemon:

- **Commits.** They now overlap, and the Commit `begin` phase, which waits for
  the Store writer, has p95 25.7 → 69.2 ms.
- **Reads.** The slow reads spend about 1 ms in their reader transaction and
  0.2 ms in the client queue. The rest is in the daemon, not attributed yet.
  Candidates are the per-call `discovery::refresh` Status exchanges and a
  Workspace lock held across a Commit.

These are single samples of one range. The p95 tail is a watch item in
OPTIMIZATIONS.md for the rerun's gates, not a measured result.

Storage is unchanged.

## Left open

- Attribute the in-daemon p95 tail of reads during Commits (see above).
- `discovery::refresh` asks Status for every mount record on every call.
  This is O(mounts) per call; with the pool these exchanges run in parallel
  but are still paid.
