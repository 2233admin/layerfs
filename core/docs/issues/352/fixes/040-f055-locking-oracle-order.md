# #352 · F-055: direct_locking_real's same-path pair had no order

> **Status:** Current fix record. Test-only fix in `sdk/js/test/verify/direct_locking_real.mjs`; no product change.

| | |
| --- | --- |
| Trigger | Run 1 of `direct_locking_real.mjs outer` on `issue352-api-shape` (`04f2576961`) failed with both `daemonA.shared` and `direct.same` Committed (`/same.txt` = `D`). Filed by the owner as F-055, OPEN, in `d51de35523`; the owner said "fix it" on 2026-10-19 |
| Kind | test: the test orders the same-path pair through the SDK's own results. No new product API |
| Branch | `issue352-f055-locking-order` off origin/main `d51de35523` |
| Production LOC | 103,058 → 103,058 (delta 0); the test and the docs are outside the counted scope |

## Cause

- The eight publishes start in one `Promise.allSettled`. Two of them change `/same.txt` on Branch `shared`:
  - `daemonA.shared` commits Workspace `wsA1`, which was mounted and written during setup. Its base is the `shared` head from before the publishes.
  - `direct.same` is an in-process `fs.write`. It binds a private Workspace when its native task runs, and takes the head at that moment as its base.
- The oracle allows at most one of the two to publish. That holds only if `direct.same` binds before daemon A publishes: then the second of the two merges against the first and is refused `Conflict`.
- Nothing ordered the bind against the publish. If A published first, `direct.same`'s base already held `/same.txt = A`. Its write was a plain overwrite with no merge, so both Commits were correct and the oracle failed. That is run 1.
- It was on main as well: the bind, Commit and merge code and the test were unchanged (see F-055 in [BUGS.md](../BUGS.md)).

## Fix

- `daemonA.shared`'s Commit is released only once `direct.same` has settled (a promise `direct.same` resolves in `finally`). There are no sleeps.
- `direct.same` binds and publishes on a base without `/same.txt`, and `wsA1`'s base never had it. So A's Commit always meets the moved head with `/same.txt` changed on both sides, and the daemon refuses it `Conflict` (`layerfs-api` `sandbox/values.rs`, `CommitReply::Conflict`).
- Every other publish still starts together with these, and the read loop runs alongside them.
- Every existing assertion is kept as written. One assertion is added for the ordered pair: `direct.same` Committed and `daemonA.shared` refused `Conflict`.
- Which writer is refused is now fixed: daemon A's Workspace Commit. The in-process write is never the one refused here. Previously either could be refused, or neither (run 1).
- The SDK cannot release a pending `fs.write` between its bind and its Commit; the call is atomic. So the reverse order (`direct.same` refused) cannot be forced without new product API.

## Evidence

- One run at the branch head, with a Linux addon and daemon built from `d51de35523`'s product source (addon `sha256:39a4f135…`, daemon `sha256:2b0bb722…`; Sandbox image `sha256:2d929c6d…`). Host 1-minute load 11.2.
- `direct_locking_real.mjs outer`: **pass** in 2 s.
  - `direct.same` Committed; `daemonA.shared` refused `Conflict` ("the head moved and 1 file(s) conflict with this Workspace").
  - The other six ops published: daemonB.shared, daemonA.lane-a, daemonB.lane-b, direct.shared and direct.lane-c Committed; direct.merge Merged.
  - 66 reads during publication, none refused; `PRAGMA integrity_check` ok.
- The run was not repeated.
