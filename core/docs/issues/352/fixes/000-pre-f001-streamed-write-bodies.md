# F-001 (open before any range) · fs.write bodies are streamed, not capped at one record

| | |
| --- | --- |
| Trigger | BUGS.md F-001: one fs request carries at most 65,519 bytes, so `fs.write` refused files above ~64 KiB (`TooLarge`). The plan routes them through Sandbox `apply` steps. Must be fixed before P3. No measured attempt |
| Kind | 1 forward-only (REBUILD.md): transport only |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | **passed** with the batch's final daemon `71001f65`: range-4 fork written by `511dceed`, whole-tree proof checkpoint ok (530 files) (REBUILD.md §4; run recorded in [the F-011 record](002-a1-f011-binding-hint-migration.md#compatibility)). The size probe below wrote into a range-4 fork with this fix's daemon |
| Playbook step | D0 (refusal by a transport limit) |
| Fix kind (SPEC §6) | code path in the control channel's client and daemon ends; no Store format change |
| Binaries | daemon `511dceed…` → `ed66aa0d48b35d425c4a93a654ee9c401b31b6f94c4910cb2386cffb577671a4` (kept in `core/target/issue352/daemon-ed66aa0d/`); SDK addon `506b646f…` (kept) → `3da0f6658cdc1816b3f377c828778694b5cc35167b2edef569a31a3877b4c1ed`. The intermediate addon `4e141e51` (F-009) was overwritten without a copy; it can be rebuilt from `bda03912b` |
| Commits | the commit that adds this file; regression test `sdk/js/test/verify/fs_write_large_real.mjs`; `layerfs-api/tests/sdk_admission.rs` now oversizes an edit's text |
| Recovery | fork newest snapshot; the builder drops the size clause from the planner's `viaSandbox` |

## Old design

Every SDK call is one control record. A record is one Noise transport message:
65,535 − 16 = 65,519 plaintext bytes (`layerfs-bridge/src/wire.rs:5`,
`duplex/profile.rs:14`, `duplex/channel.rs:154`). `Control::call` encoded the whole
request, write body included (`layerfs-api/src/base/control.rs:107`), and an
oversized one became `TooLarge` (`base/sdk.rs:29-45`).

The daemon also took the whole body as one value and wrote it as one
`Operation::Write`. For an equal-length file it compared against a full read of
the old file (`layerfs-daemon/src/sdk/mutation.rs:146-170` at `370480f4e`). Even
without the transport limit, the daemon held the whole file in memory.

## New design

The same pattern as Store install (`install.rs`): a header record, then the
payload as raw records on the same connection.

- **Client, `layerfs-api` `base/stream.rs` (new; the client end of the control
  channel lives in `layerfs-api`).** `exchange_call` moves each write body above
  4 KiB (`fs.write` content/bytes, each `fs.apply` write change) out of the
  arguments and names its length (`streamed`). `Control::call_with` sends the call
  record, then each body in records of at most 65,519 bytes, then awaits the one
  answer. One attempt. A failure while sending is a failed attempted send with
  unknown effect, as before.
- **Daemon, `layerfs-daemon` `sdk/body.rs` (new; the daemon end that serves SDK
  calls).** `Bodies` reads exactly the declared bytes from the connection a record
  at a time. `files.rs` hands each `streamed` write to `Mutation::write_streamed`,
  which writes each record at its offset. Over a file of equal length it writes
  only the records that differ, so an equal body is still `UpToDate`; then it sets
  the size. Whatever the call does not consume (a refusal, an earlier failed
  change) is read and dropped before the answer, so the channel stays in step.
  The connection and observed-control paths pass the `Bodies` down
  (`application/connection.rs`, `diagnostics.rs`,
  `control/operations.rs::execute_control_with`).
- Daemon memory per write: one record plus one overlay write job.

## Proof

`fs_write_large_real.mjs` (real Docker, Disposable Store, new daemon and addon):

- 1 MiB of text written with `fs.write` and read back through `fs.read` windows:
  equal.
- Rewriting it unchanged gives `UpToDate`.
- 64 MiB of bytes written with `fs.write`; `sha256sum` and size in a mounted
  Workspace are equal.
- Daemon peak RSS (VmHWM) grew 13.7 MiB for the 64 MiB write. The test requires
  < 32 MiB.

On the old binaries it fails at once: `TooLarge`.

Also passing: host `layerfs-api` and `layerfs-bridge` (16 + 3), 13 host daemon
targets (39 passed), and Linux `observed_application`, `kernel_application` and
`r5_1_actual_daemon_commit`. Clippy clean.

## Performance, old vs new

`fs.write` of one new file per size class on a fork of snapshot range 4, a fresh
lane per binary, a fresh service daemon, traced, one sample each.

| Size | Snapshot | Cache | Old `511dceed`/`506b646f` | New `ed66aa0d`/`3da0f665` | Change |
| --- | --- | --- | --- | --- | --- |
| 1 KiB | range-4 fork | fresh daemon, first write | 17.6 ms, 436 stmts | 20.3 ms, 434 stmts | inline both; first call of the daemon |
| 32 KiB | same | same | 13.4 ms, 314 | 12.7 ms, 312 | −5% (streamed in 1 record) |
| 60,000 B | same | same | 13.7 ms, 332 | 10.1 ms, 330 | −26% |
| 1 MiB | same | same | `TooLarge` | 27.2 ms, 356 | now possible |
| 64 MiB | same | same | `TooLarge` | 1,023 ms, 853 | now possible (~63 MiB/s end to end) |
| Daemon peak RSS after the series | same | same | 30.1 MiB | 44.2 MiB | +14 MiB for the 64 MiB write |

Storage: unchanged (the same bytes are written; content construction at Commit
is unchanged).

## Cost of the fix

- Bodies over 4 KiB cost one extra record per 64 KiB, plus one overlay write job
  per record. The 64 MiB file takes 1,025 records and jobs.
- A refused call with a large body still transfers the body before the answer:
  a 64 MiB write to a missing directory took 459 ms to refuse.
- The client process still holds the caller's buffer and one copy of it (the
  addon's conversion), as before.

## Planner change (builder)

- In `dsh/tools/history/steps.mjs:77`, drop `(f.size ?? 0) > FS_MAX` from
  `viaSandbox`. Files of any size go through `fs.write`/`fs.apply`.
- Executables, symlinks and mode changes stay Sandbox steps (lead's decision).
- The 60,000-byte check on Sandbox *command strings* (`steps.mjs:160`) stays: an
  exec command is not a write body.

## Left open

- An exec command string is still bounded by one record.
