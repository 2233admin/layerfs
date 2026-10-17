# F-009 (P2 dev run) · concurrent unmounts in one Sandbox

| | |
| --- | --- |
| Trigger | P2 dev run (builder, daemon `511dceed`): two concurrent unmounts of different Workspaces in one Sandbox failed "Workspace absent". The player was switched to one Sandbox per agent. No measured attempt |
| Kind | 1 forward-only (REBUILD.md) |
| Old Stores | open unchanged (addon only) |
| Old data | still read as before |
| Compatibility test | **passed** with the batch's final daemon `71001f65`: range-4 fork written by `511dceed`, whole-tree proof checkpoint ok (530 files) (REBUILD.md §4; run recorded in [the F-011 record](002-a1-f011-binding-hint-migration.md#compatibility)) |
| Playbook step | D1 (a call outcome differs from the plan) |
| Fix kind (SPEC §6) | code path, SDK addon only (`sdk/js/native/src/discovery.rs`); daemon and Store unchanged |
| Binaries | SDK addon `506b646f7d0a…` (kept in `core/target/issue352/sdk-506b646f/`) → `4e141e5162c9df07fc0ca917407d1d4e6d511138e78bb865b9aa0b87bf185e6d`; daemon unchanged by this fix (`18ab5415…`) |
| Commits | the commit that adds this file; regression test `sdk/js/test/verify/concurrent_unmount_real.mjs` |
| Recovery | fork newest snapshot (none needed pre-P2) |

## Old design

The addon keeps one Sandbox's mounts in process memory and in `mount-*.record`
files. Two things broke when one process ran calls concurrently in one Sandbox:

1. Every SDK call starts with `registry::sandbox` → `discovery::refresh`
   (`discovery.rs:362`, at `bfe16ad16`). That reads every mount record and asks
   the daemon for its Status. It fails the whole call if any Status fails. An
   unmount removes its Workspace in the daemon first and its record second. A
   sibling call whose refresh fell between the two got the daemon's
   `Missing "Workspace absent"` for the *other* Workspace and failed. This is the
   builder's symptom.
2. `discovery::guard` (`discovery.rs:131`) is a nonblocking `flock` on the Sandbox
   directory. It is meant to refuse another *process* (`Busy`), but two threads of
   one process hold separate descriptors, so a sibling mount or unmount of the same
   process was refused `Busy` too. This is the fixer's reproduction on the old addon:
   `["ok", "Busy: another process owns this discovery mutation", …]`.

## New design

- `refresh` skips a record whose Workspace the daemon reports `Missing`. The daemon
  owns mount truth; the record's own unmount call removes the file next. Any other
  Status failure still fails the call, as before.
- `guard` first takes this process's turn on the directory: an in-process set plus
  a condition variable. The wait is readiness, bounded at 60 s, and nothing has
  been attempted before it ends. Then it takes the same nonblocking OS lock. Another
  process holding the lock is still refused `Busy`, never waited for (SDK README).
  The `Guard` releases both when dropped.

## Proof

`concurrent_unmount_real.mjs` (real Docker, Disposable Store, new daemon): three
rounds of three concurrent `sandbox.mount` calls, then three concurrent
`sandbox.unmount` calls, in one Sandbox. Old addon: the first round's second and
third mounts were refused `Busy`. New addon: all nine mounts and nine unmounts ok.

## Performance, old vs new

No old-vs-new range sample: the player still uses one Sandbox per agent, so
measured calls never take the new wait. A call that does wait queues behind its
sibling's discovery mutation and is not refused.

## Cost of the fix

- A per-directory in-process wait, plus one set insert and remove per mutation.
- `refresh` still asks Status for every mount record on every call: O(mounts) per
  SDK call in a Sandbox. That cost is unchanged here and noted as open.

## Left open

- The player's one-Sandbox-per-agent workaround is no longer needed. Keeping it is
  the lead's call.
- O(mounts) Status reads per SDK call in `refresh`.
