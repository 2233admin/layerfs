# Issue 319: fixes after the issue 318 baseline

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Append-only. Assignment: [issue 319](https://github.com/Ephemeral-AI-Lab/layerfs/issues/319).
Local branch `issue318-benchmark-baseline`; no push, PR or issue closure.
Control: [issue 318 b1 tables](../318/PROGRESS.md), not iteration 1 timings.
Global Store explicitly Disposable/WAL/OFF; overlay MEMORY/OFF/EXCLUSIVE;
`LAYERFS_CONSTRUCTION_WORKERS=1`. Host cargo `+1.85.1 --locked`, repository
ARM flags, worktree-local targets. Every invocation stops by 118 seconds.
Durable: `NOT_RUN — disabled by owner until explicit reauthorization`.

Production LOC uses `count_absent_aware.py staged`, pinned
`tools/production_loc.py` SHA-256
`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`;
first parent compared to staged tree, then confirmed with `head`.
Scope active core; reference absent (retired R9c; last counted 65,417 at tree
498dd1917812). Test, harness, tool and documentation lines are excluded.

## Phase 0 — untimed diagnostics, 2026-10-11

Product source unchanged from handed-over `3a7209282` (81,718 production LOC).
Added external daemon target
`core/crates/layerfs-daemon/tests/recognizer_diagnostics.rs`, on the unchanged
`recognizer_patterns` request-port rig. Writes pass ordinary recognition and
Workspace mutation; no explicit claims, oracle-fed piece hints, product hooks
or product APIs added. Full live-after-install and fresh committed-root bytes
are checked independently. The diagnostic mapping walk only observes IDs.

The insert uses the exact frozen `sdk-edit-standard-content-v1` generator,
seed 5494771174636671793, 1,048,576 bytes, midpoint 524,288, 4,096-byte
replacement seed 6313238748831594097, and the benchmark writer's backward
65,536-byte requests after extend. Delete uses the same fixture at 1 MiB and
10 MiB, forward 65,536-byte requests followed by truncate.

[Derived diagnostic output](checks/phase0-counts.txt) retains both platforms.
Raw output stays in worktree-owned ignored logs. These are count diagnostics,
not timed performance samples or cold/residency qualification.

| Operation | Piece rows | Stored cells | Stored bytes | Producer record jobs | Record-class jobs | Owner jobs | Statements |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Insert, 1 MiB | 2 | 5 | 36,864 | 42 | 165 | 185 | 968 |
| Delete, 1 MiB | 1 | 1 | 4,096 | 42 | 118 | 131 | 667 |
| Delete, 10 MiB | 1 | 1 | 4,096 | 42 | 361 | 374 | 1,942 |

Counts in this table agree on host and pinned Linux image. VM steps differ
with the SQLite build: host 22,081 / 15,029 / 45,433; Linux 21,117 / 14,368 /
43,397 in the table's order. Fullscan steps, sorts and reprepares are zero.

**Retention result:** 54 original extents, 56 final extents; one original
chunk is absent from the new mapping. Original offset 964,716, end 984,954,
length 20,238; chunk
`e1803bded69f18805cc677190d14693b17c8c56d66a0367066f742b85f2e60a7`.
Its start is 440,428 bytes beyond the edit. This is loss elsewhere in the moved
tail, not solely at the edit's edge. Phase 2 is applicable; precise mechanism
remains to be diagnosed before a fix. No O-6 policy change is inferred.

**Delete result:** one piece and one stored cell at both sizes, so cells between
pieces are not reproduced at these two sizes. Record-class jobs nevertheless
grow by 243 and statements by 1,275 for the larger delete; producer jobs stay
42. Phase 3's conditional fix is not authorized by this result. The scaling
finding stays open; these diagnostics do not establish 100/500 MiB behavior or
attribute its cause to SQL. No fix or timed case was run in phase 0.

Checks, each bounded to 118 seconds and Rust tests built with `--no-run` first:

- Host: new target 2/2; unchanged `recognizer_patterns` 9/9. Host tests preceded
  rustfmt-only formatting of the new target.
- Linux, pinned image `sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6`,
  `linux_step.py 118 319-phase0-linux-build test --manifest-path core/Cargo.toml
  --locked -p layerfs-daemon --test recognizer_diagnostics --test
  recognizer_patterns --no-run -j 3`, then the same targets with
  `-- --test-threads=1`: 2/2 and 9/9, own containers removed.
- Host daemon Clippy all targets `-D warnings`: PASS. Formatting and
  `git diff --check`: PASS. Boundary guard: PASS, 683 production files;
  its 50 external self-tests: PASS.
- New test's initial compilation failed on incorrect API usage (ObjectId
  reconstruction, canonical client and timing scope). Corrected in test code;
  no test executed at the failed build and no product source changed.
- Full fuser provenance checker retains two pre-existing relocated-passthrough
  manifest/lock findings. Actual core manifest, lock and all patched package
  bytes separately pass the checker's unchanged verification functions. The
  full checker was not weakened or relabeled PASS. This is a tooling-scope
  gap, not evidence of modified dependency bytes.

Decided by agent, pending owner review: phase 2 proceeds; phase 3 preserves the
open scaling finding without a conditional product fix. Phase 4 remains blocked
on a recorded owner decision. Reliability applicability review is reserved for
phase 5 after every earlier product/test change.

Production LOC: 81718 -> 81718 (delta +0). Test/docs-only phase.

## Phase 1 — accounting review and implementation, 2026-10-11

Phase 0 commit: `abdf8387b`, LOC confirmed from its committed first-parent pair.
Issue comment: [phase 0](https://github.com/Ephemeral-AI-Lab/layerfs/issues/319#issuecomment-6108513558).

Reviewed `schema.sql` schema 33, `accounting.sql` reference insert/delete
triggers and `database/accounting.rs` exact namespace/aggregate counts and debt
metadata. `payload_reference` is Workspace-owned and byte-free; each row adds
one `reference_rows`, never payload/validity bytes or operation-record bytes.
The independent oracle already enumerates every namespace table (including
pieces) for Gone and validates exact SQL definitions, membership, foreign keys,
incarnation, custody and immutable-copy identity. It omitted the new maintained
count and still required version 32. Pin movement alone would not fix that.

Added a synthetic closed-overlay external regression containing a piece:
checks schema 33, exact piece/maintained counts, unchanged byte accounting,
reference-count drift rejection and complete Gone with another Workspace
retained. The test failed before the fix at the stale source-pin refusal;
raw failing output is preserved. No synthetic fixture is product runtime proof.

Only after this review: updated the three stale digests (schema, accounting
SQL, Rust accounting), required exact version 33, and added independent
`reference_rows` comparison against actual `payload_reference` membership.
The other three pins, canonical schema/trigger checks and every physical metric
UNAVAILABLE status stay enforced. No product change or weaker oracle.

Required owning tests, one bounded invocation:
`PYTHONPATH=core/benchmark/fs-bench-pro/tests/engine perl core/target/r4-locked.pl
118 python3 -B -m unittest test_overlay_storage test_closed_storage_controller
test_closed_store`: 23/23 PASS. Rust formatting and boundary guard remain
required before this commit; Rust Clippy has no touched crate in this Python
harness change (phase 0 daemon Clippy is unaffected).

Decided by agent, pending owner review: batch this harness fix with applicable
phase 2 before sealing/sample preparation, as the handoff permits for two
applicable phases. Phase 1's two cases are still NOT_RUN here and its phase exit
comment/checklist is deferred until those receipts exist. They will use a fresh
tag and compare counts with b1, not iteration 1 or timings.

Production LOC: 81718 -> 81718 (delta +0). Harness/test/docs-only change.

## Phase 2 — failing regression and product fix, 2026-10-11

Phase 1 harness implementation committed at `b97857b7f`, production unchanged.
Converted phase 0's retention test into an assertion that no original chunk
wholly outside the edit is lost. It fails before the fix after completing its
byte checks and releasing the rig: chunk at offset 964,716 is missing. Raw red
output is retained, with [derived red/green counts](checks/phase2-retention-counts.txt).

Cause, source-confirmed and reproduced: on the first backward tail write,
`WriteRun::pass` searches for a whole match, then calls `Pass::follow` from that
match. `follow` sought the match's source offset and never visited the preceding
extent that holds the request's first byte. Its `leading` stayed empty, so
`back()` could not retain that partial chunk's tail. The next adjacent request
could not complete the chunk, leaving a stored stretch far from the edit.

Fix in Workspace `operations/file/recognize.rs`: a followed run with no earlier
claim visits from the request's first source byte, records only an extent
crossing that beginning, and still begins claims at the searched whole match.
An unclaimed old leading extent is cleared before another shift is followed.
The existing adjacent-request hash completion and earlier-publication revision
check remain the only proof for a backward claim. No committed payload read,
extra retained chunk, changed budget, new API, SQL change or alternate encoder.
The traversal added is bounded by the request prefix before the match and one
leading extent/path, not file size. Updated the owning architecture note
[77](../../architecture/77-native-mutation-coherence.md).

| Retention diagnostic, 1 MiB | Before | After |
| --- | ---: | ---: |
| Lost original chunks | 1 | 0 |
| Piece rows | 2 | 1 |
| Stored cells / bytes | 5 / 36,864 | 2 / 12,288 |
| Producer record jobs | 42 | 42 |
| Record-class jobs | 165 | 118 |
| Owner jobs | 185 | 133 |
| Statements | 968 | 673 |
| Final extents | 56 | 55 |

After counts agree on host and pinned Linux. This is diagnostic evidence;
the listed timed cases and guard decision are still NOT_RUN at this entry.

Scoped checks (each invocation 118-second stop, build `--no-run -j 3` first):
retention regression 1/1, daemon `recognizer` 5/5, unchanged
`recognizer_patterns` 9/9, `piece_commit` 1/1, on both host and pinned Linux.
No mounted or unrelated package suite selected. Host Clippy all targets on
Workspace and daemon with `-D warnings`: PASS. Formatting, whitespace,
boundary guard (683 files) and its 50 self-tests: PASS. All owned Linux test
containers removed. Full dependency checker retains the phase 0 tooling gap;
actual core package provenance unchanged.

Production LOC: 81718 -> 81727 (delta +9). Growth supplies the missing bounded
leading-extent traversal and exact crossing checks. No retirement/relocation.

Decided by agent, pending owner review: retain provisionally until the listed
samples show no worse count in either guard; revert on a guard count regression.
A fresh sealed build and fresh originals follow at this committed identity,
shared by phase 1 and phase 2's selected sampling.
