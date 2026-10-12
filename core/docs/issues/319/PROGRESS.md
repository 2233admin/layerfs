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

## Phase 1 exit — selected sampling, tag `p319-12`, 2026-10-11

Sealed build and both preparation/sample calls use `0d1eeb560` (product tree
`b99f79e3dd972ebd6bbd1db2fc2626d08a289e19`); daemon SHA-256
`401eeb8eda506e61a33f719d8b8e149bf396dd97da1c74780c690cb52b269015`.
The owning build seal validates source bytes before/after Linux compilation,
repository ARM flags and the pinned image. Cargo builds explicitly use `-j 3`;
whole seal stops at 118 seconds. Fresh originals, ordinary independent writable
sample clones, one sample each; original and test copies removed afterward.
Retained services share the 4 GB VM; interference is declared. Cache state
retains the frozen family declaration, not a new cold claim.

Counts below compare **b1 only**, never timings or iteration 1.

| Case | Status | Functional / proof | Requests b1 → current | Jobs b1 → current | Statements b1 → current | Overlay bytes b1 → current |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| dedup-workspace-exact-1-compact-v2 | INELIGIBLE | PASS / PASS | 28 → 28 | 186 → 186 | 981 → 981 | 1298432 → 1298432 |
| store-footprint-unique-100-low-v1 | INELIGIBLE | PASS / PASS | 12 → 12 | 95 → 95 | 443 → 443 | 233472 → 233472 |

Both receipts report functional PASS, proof PASS, Gone and KNOWN_STOP.
Status remains INELIGIBLE; no speed/resource qualification is claimed. The
three stale pins and missing version/count interpretation are fixed; all
original accounting/schema/custody obligations remain. No product code was
changed for phase 1. Its implementation commit `b97857b7f` records
Production LOC: 81718 -> 81718 (delta +0).

Exact reproduction: `go.py p319-12 110 prepare` and `run` with
`dedup_workspace_reuse:dedup-workspace-exact-1-compact-v2` and
`store_footprint:store-footprint-unique-100-low-v1`, each externally stopped by
118 seconds. Raw receipts under `benchmark-results/fs-bench-pro/2026-10-11-issue318-p319-12-run-<family>/<case>/`.
Engine-generated partial-selection CSVs (every other case explicitly NOT_RUN)
are under `core/benchmark/fs-bench-pro/baselines/core/2026-10-11-0d1eeb560/`
in those two family directories. This is not a complete-family pass.

Required three harness modules: 23/23 PASS, retained above; changed Python
scope adds no Rust crate requiring Clippy. Latest daemon/Workspace Clippy is
PASS at the sampled source; formatting, whitespace and boundary guard checked
for this evidence commit. Production LOC: 81727 -> 81727 (delta +0).
Phase 1 complete. Decided by agent, pending owner review: retain the harness fix.

## Phase 2 exit — selected cases and guards, tag `p319-12`, 2026-10-11

Fix commit `0d1eeb560` is confirmed by exact committed-tree LOC:
81718 -> 81727 (delta +9). All five preparations and samples use that commit
and the sealed build identified in phase 1. One original at a time for these
edit cases, one sample clone, all copies removed after their own receipts.
Counts below compare b1, with no timing comparison.

| Case | Status | Functional / proof | Requests b1 → current | Jobs b1 → current | Statements b1 → current | Overlay bytes b1 → current |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| insert-middle-4k-on-1mib-ops-1 | INELIGIBLE | PASS / PASS | 27 → 27 | 212 → 160 | 1227 → 929 | 286720 → 262144 |
| insert-middle-4k-on-100mib-ops-1 | INELIGIBLE | PASS / PASS | 1611 → 1611 | 2362 → 2007 | 23775 → 22112 | 323584 → 299008 |
| replace-grow-middle-2k-to-4k-on-10mib-ops-1 | INELIGIBLE | PASS / PASS | 172 → 172 | 1376 → 1055 | 8252 → 6740 | 331776 → 311296 |
| delete-middle-4k-on-100mib-ops-1 | INELIGIBLE | PASS / PASS | 1212 → 1212 | 2661 → 2661 | 26166 → 26166 | 339968 → 339968 |
| overwrite-middle-4k-on-1mib-ops-1 | INELIGIBLE | PASS / PASS | 11 → 11 | 145 → 145 | 740 → 740 | 245760 → 245760 |

All five actual receipts: functional PASS, proof PASS, Gone and KNOWN_STOP;
overall INELIGIBLE under unchanged cache declarations and shared-VM interference.
Both guards have **exactly equal requests/jobs/statements/overlay bytes**.
The target rows save 52, 355 and 321 writer jobs; 298, 1,663 and 1,512
statements; 24,576, 24,576 and 20,480 overlay logical bytes respectively.
Arithmetic is b1 minus current. No byte, retention or readback oracle changed.

Decided by agent, pending owner review: keep the fix. Revert condition is not
triggered. The architecture update and external failing-before-fix assertion
are in the fix commit. Only the phase's requested tests and samples ran.
O-6 is not decided by this result; the full final cohort remains to be sampled.

Exact commands: `go.py p319-12 110 prepare|run <family>:<case>` for the five
IDs in the table, then `clean originals` and engine `report`. Every call has an
external 118-second stop. Raw evidence remains under the tag's run directories;
partial-selection engine CSVs are committed under
`core/benchmark/fs-bench-pro/baselines/core/2026-10-11-0d1eeb560/` in
`edit_length_changing` and `edit_length_preserving`. Unsampled rows remain
NOT_RUN. This entry does not claim complete-family results.

Storage after the whole selected batch: zero new volumes, containers or
original masters; zero originals; no deletion from the protected pre-run lists.
The ignored result folder is 1,177 MB, host free disk 221 GiB. Existing protected
containers and 69.06 GB of VM volumes remain. Latest required touched-crate
Clippy, formatting, boundary guard and self-tests passed at the fix source;
this evidence commit checks formatting/whitespace/guard with no Rust changes.
Production LOC: 81727 -> 81727 (delta +0).
Phase 2 complete; phase 1 evidence exit committed at `8f1bd9db4`.

## Phase 3 exit — conditional fix not selected, 2026-10-11

Phase 2 evidence exit commit `a9fe3ce5a`; production still 81,727 LOC.
Phase 0's two-size delete diagnostic did **not** reproduce stored cells between
pieces: both 1 MiB and 10 MiB held one reference row, one stored cell and 4,096
bytes. Producer record jobs stayed 42. Record-class jobs 118 -> 361, owner jobs
131 -> 374, statements 667 -> 1,942 still show growth. This remains an **open
scaling finding**, with no cause confirmed by these counts alone.

The condition for phase 3's assertion/fix is false at the diagnostic scope.
No failing cell-between-pieces assertion was invented and no product change
was made. The phase 3 delete/recognizer/overlay-pieces test selection and its
100/500 MiB delete and 100 MiB replace-shrink samples are NOT_RUN for this
phase. The 100 MiB delete ran once as phase 2's guard, with functional/proof
PASS and exactly equal b1 counts: 1,212 requests, 2,661 jobs, 26,166 statements,
339,968 overlay logical bytes. That receipt is reused as evidence of the guard,
not relabeled as phase 3's proof or a scaling fix.

Decided by agent, pending owner review: close the conditional work in this
batch without a fix; preserve the growth finding open. No claim that delete
jobs scale like replace-shrink, no timing comparison, SQL attribution or
100/500 MiB diagnostic extrapolation. The full phase 5 run retains those
original cases without weakening their checks.

Docs-only checks: local links/claims and whitespace, Rust formatting, boundary
guard PASS. No Rust crate touched, so new Clippy or runtime tests are
inapplicable; latest changed-scope checks remain above.
Production LOC: 81727 -> 81727 (delta +0).

## Phase 4 exit — blocked by owner decision, 2026-10-11

Phase 3 record committed at `3f12669c1`, exact production total confirmed.
Reviewed current issue comments and the owner's handoff: no recorded decision
allows a wait at serial reservation or Commit Begin. The current
[integration contract](../303/06-cluster-one-integration.md#33-one-attempt-exact-outcome)
requires one `BEGIN IMMEDIATE`, checked zero busy timeout, and exact before-effect
Busy refusal with no wait/retry. The active root/core instructions independently
retain the same policy. The handoff explicitly blocks phase 4 without a new
recorded owner decision; no agent recommendation supplies that authorization.

No two-Workspace success regression, wait implementation or integration-contract
change was started. The phase 4 test, Linux `mounted_concurrency` and two named
100 MB K10 samples are NOT_RUN for this phase. Baseline nine Busy/EAGAIN rows
retain their failed receipts. Phase 5's whole catalogue will still exercise its
original concurrency rows once under the unchanged policy; a result cannot
retroactively authorize a wait or change the baseline.

Decided by agent, pending owner review: close phase 4's batch checklist items
with this explicit blocked reason and continue the independent final phase.
The owner decision remains pending, not resolved as "keep never wait" by the
agent. No automatic retry, reprepare or failed-operation replay added.

Docs-only local link/claim/whitespace review, Rust formatting and boundary
guard PASS; no touched Rust crate, new Clippy or runtime test is applicable.
Production LOC: 81727 -> 81727 (delta +0).

## Phase 5 — final source applicability review and registration, 2026-10-11

Earlier phase exits are committed; phase 4 exit is `2f77ddeff`. No product or
test edit follows this review. The review is bound to **the whole core/crates
tree, including tests**, `b99f79e3dd972ebd6bbd1db2fc2626d08a289e19`, at source
`2f77ddeff2cb3a2403f2203041834b52eff5ecd0`.
[Review artifact](checks/reliability-review.json) records the exact prior tree,
all 97 changed-file identities (27 external-test files), all 1,104 tree files
in scope, 12 unchanged reviewed public-source hashes and four additional
reviewed observability/Create sources. It is source applicability, not native
or full-case reliability proof.

Rechecked original `physical_state`: mandatory non-null exact per-Workspace
physical allocated/current and mutation-event peak, observation errors zero,
both within 2 GiB. Shared schema 33 resources expose logical cells, pieces,
bytes and shared database pages/debt, not those exclusive physical axes. Added
piece tests and capture/recognition ports are not a replacement full-case
physical proof. The 26 classifications and every additional case-specific gap
remain unchanged. The two original early integrity paths genuinely bypass
that physical check, but the unchanged public SandboxCreate/SandboxRequest
and Docker HostConfig still have no original creation-time CPU/memory/zero-swap/
PID profile or pre-Start adoption interface. Post-Start update remains invalid.

Only `reviewed_source_commit` and `reviewed_product_tree` changed in the 28
case records. A structural equality check after restoring those two fields
confirms that original scopes, guards, limits, operations, reason/needs and
classification are unchanged. Recomputed the exact policy digests binding
those complete records. No full-case runtime proof is claimed; old failures and
old reviews stay immutable. Decided by agent, pending owner review: all 28
remain NOT_APPLICABLE with their original reasons at this final core tree.

[Final accounting pin check](checks/final-accounting-pins.json): PASS on all
six source digests and exact schema definitions. Phases 2–4 touched none of
schema/accounting SQL or Rust accounting, so no second pin move is needed.

Next selections, fixed before execution: new tag `p319-final`; all twelve
exact-count cells once; `workspace_reliability` one call; complete 25-family
catalogue once, with the handed-over `repository_history` cases explicitly
NOT_RUN (out of scope) and no reliability case executed as a fabricated proof.
Every other ported case receives one preparation/sample selection; failures,
expired preparations and unrun selections stay recorded. Original 2 s/120 s
limits, frozen mtime helper/check and 41 s allowance are unchanged. Watch
`workspace-dense-rewrite-500-mixed-v4`; diagnose only if cleanup fails again.
Fresh source-bound originals and independent writable sample copies, at most
one original and one test copy per payload; copies are removed after a receipt.
Each shell invocation has a maximum 118-second wall stop. Frozen inner limits
are unchanged; this external ceiling is not a new performance allowance.

The final source review is a harness/metadata/docs change, production LOC
81727 -> 81727 (delta +0). Rust formatting, whitespace and boundary guard are
checked; no touched Rust crate needing new Clippy. Latest source-scope checks
remain valid. Applicability parity, cases, cells and whole final-run outcomes
will be appended after their actual receipts. This is not phase 5 completion.

## Phase 5 exit — full catalogue retained, 2026-10-11

Final review commit `5ff40d53c43da9a57b7fa963b54de40fb7d5db33`; tag
`p319-final`; whole `core/crates` tree (tests included)
`b99f79e3dd972ebd6bbd1db2fc2626d08a289e19` unchanged through completion.
[Campaign identities, binaries, command limits and append-only journal](checks/final-campaign.json)
record all selections and log digests. No later product/test edit, new wait,
profile change or oracle/readback/limit relaxation occurred.

The owning final build seal is PASS. It reuses the exact compiled scopes and
native binaries of the full `p319-12` seal through the owning
`identity.build_runtime` runtime-only path, with source-before/after, repository
ARM inputs, pinned image and binary checks; the final host runtime is rebuilt.
The product tree is identical, and daemon SHA-256 remains
`401eeb8eda506e61a33f719d8b8e149bf396dd97da1c74780c690cb52b269015`.
The unrelated reliability metadata/Python changes do not require a new native
product build. The original full build used Linux `-j 3`. The full fuser checker
still has the two pre-existing relocated passthrough manifest/lock failures;
actual core manifest/lock and all patched package bytes were verified with the
unchanged checker functions. Neither that checker nor its verdict was weakened.

The catalogue contains all **25 families / 273 cases**. The 242 ordinary
selections each have one preparation selection, at most one sample invocation,
and completed owned-payload cleanup. The separately selected reliability call
covers 28 source-dispositioned cases; the three `repository_history` cases are
explicitly NOT_RUN under the owner's out-of-scope handoff. Registration is not
execution. [Per-family and per-case b1 comparison](FINAL-COUNTS.md),
[exact metrics and signed deltas CSV](FINAL-COUNTS.csv), and
[receipt identities/digests and arithmetic](checks/final-counts.json) use b1,
not iteration 1 or timing ratios. Unknown counts/bytes remain unavailable.
Both Store logical/allocated and overlay logical/allocated bytes are retained.

| Final selection disposition | Cases | Evidence |
| --- | ---: | --- |
| Fresh completed final-tag receipts | 228 | 205 have functional and proof PASS; other outcomes remain failed |
| Identical treatment refused before execution | 7 | Owning final CSV FAIL / proof NOT_RUN; seven earlier matching receipts are separate |
| Sample invocation expired without a completed receipt | 5 | Partial original output retained; owning report FAIL / proof NOT_RUN |
| Preparation expired; sample not run | 2 | Original failure retained; no retry/reprepare; report treatment follows original proof-only scope |
| Reliability source review only | 28 | NOT_APPLICABLE proof, performance N/A; zero runtime samples |
| Repository history excluded by owner | 3 | NOT_RUN, no fabricated receipt |
| Total | 273 | Every original row has a disposition |

Final owning performance CSV classifications are **198 INELIGIBLE, 34 FAIL,
37 N/A, 4 NOT_RUN**. N/A includes 28 reliability rows and nine original
proof-only performance rows; it does not imply a passing or unattempted proof.
The corresponding proof CSV classifications are **205 PASS, 12 FAIL,
28 NOT_RUN, 28 NOT_APPLICABLE**. The two expired preparations include one
proof-only mixed-exhaustive row (performance N/A, proof NOT_RUN) and one branch
row (performance/proof NOT_RUN). The other three performance NOT_RUN rows are
the owner-excluded repository histories. These distinctions are preserved in
the owning CSVs, not flattened into an overall PASS.

**One-treatment guard:** the final tag encountered seven existing immutable
claims from `p319-12`: overwrite-middle 1 MiB; insert-middle 1/100 MiB;
delete-middle 100 MiB; replace-grow 10 MiB; exact reuse 1; unique footprint
100-low. Each refusal's key binds the full case, fixture, whole product tree,
command bodies, helper hashes, all binary hashes, engine and image to its
original successful receipt. The claim and receipt were not deleted, replayed,
retagged or promoted into a fresh final sample. The count comparison links them
as **separate prior matching evidence** at source `0d1eeb560` and records their
exact keys/digests. Decided by agent, pending owner review: retain this evidence
instead of bypassing the one-treatment rule. There are 205 fresh both-PASS
rows plus seven separate both-PASS prior observations; b1 had 184. The arithmetic
212 − 184 = 28 is evidence coverage across distinct cases, not 212 fresh final
samples, performance qualification, or a timing claim.

**Failures retained, without a retry:**

- The capped insert, prepend and replace-grow still fail their original 2 s
  command stop. Append and zero-extend pass both checks.
- File alias roundtrip and five mixed-development/exhaustive command rows
  retain the frozen mtime/helper disagreement (including the proof-only
  exhaustive 100 MB row). Original checks and metadata are unchanged.
- The five 500-step distributed, hotset, recurring, metadata and unrelated
  histories expire at the driver wall stop before a completed receipt. Inner
  110 s budget leaves about 109 s to the retained driver step; the original
  120 s case watchdog was not increased or resampled. Partial outputs and
  failed invocation logs are retained; owned resources removed.
- Mixed-exhaustive 500 MB K100 preparation expires without a qualifying
  prepared manifest. Its original outer HOLD remains in the journal; a later
  evidence-based FAILED_PREPARATION closure does not rewrite it. After checking
  that no owned custody process survived, 146 non-payload command/proof/custody
  records and a retained manifest were saved before removing owned payload.
  Branch-mixed 500 MB K100 preparation separately expires; its driver log and
  failure are retained, but the driver's cleanup had removed its underlying
  top-level preparation logs before retention. No full raw-log retention is
  claimed for that case. Neither preparation is retried; neither case sampled.
- Concurrent branch 100 MB K10/K100 and 500 MB K10, and all five multi-Workspace
  cases, retain EAGAIN/Store Busy refusals under one attempt / no wait. The
  remaining branch 500 MB K100 is unrun after its failed preparation. Phase 4
  authorization is still absent.
- CDC scattered-500 retains its original verifier wall-stop failure. The
  frozen 41 s allowance stays unchanged.
- Reuse exact/local 500 fail with TimeoutExpired during closed-overlay export;
  reuse unique 500 fails the verify-workspace deadline. These completed
  invocations have failed receipts; they are not passing reuse observations.
  Unique footprint 100000 fails the normalization absolute deadline, and
  metadata-cardinality 100000 fails verify-footprint with TimeoutExpired.
  All five retain proof FAIL and Gone / KNOWN_STOP cleanup. The smaller selected
  accounting cases still pass both checks at their original `p319-12` identity.

The watched `workspace-dense-rewrite-500-mixed-v4` has functional/proof PASS,
Gone / KNOWN_STOP, requests 33,359, writer jobs 222,679, statements 1,154,213,
overlay logical bytes 541,523,968. Its old cleanup failure did not reproduce;
no cleanup fix or unsupported diagnosis was made. The old failed receipt stays
unchanged. All 32 length-changing cases have both-PASS evidence: 28 fresh and
four separately matched prior observations. The two selected phase 2 guards
retain exact b1 counts; no guard-count worsening triggered a revert.

[Final exact-cell comparison](checks/final-cells.json): all twelve request/job/
statement triples equal b1. Eleven match the original frozen triples. C10
retains FAIL against that original oracle: actual **1547 / 1546 / 14406**,
expected **1548 / 1547 / 14408**, in request/job/statement order. All twelve have
proof PASS and Gone / KNOWN_STOP. C12 remains **3436 / 3439 / 24146**. The oracle
was not retargeted to b1, and no cell was resampled.

Reliability source-only parity: PASS, 28 reviewed cases, zero samples; runtime
parity NOT_RUN. The `workspace_reliability` family was invoked exactly once,
all 28 NOT_APPLICABLE with original reasons. Required exclusive physical
current/peak/error observations remain unavailable; the two early integrity
paths still lack the original creation-time container profile. Original guards,
limits, classifications and missing prerequisites are unchanged. Accounting
pins required no second move: final six-pin/schema check PASS, because phases
2–4 touched none of the three accounting files. Phase 3's delete scaling stays
open; phase 4 remains blocked, with no owner wait decision inferred.

Owning CSVs were generated once: [25-family directory](../../../benchmark/fs-bench-pro/baselines/core/2026-10-11-5ff40d53c/)
and [twelve cells](../../../benchmark/cluster-two/baselines/2026-10-11-5ff40d53c/).
For public portability, four of the 52 CSV files substitute only local location
text with `[worktree]` / `[home]`; every other field, status, identity, metric,
reason and limit is identical. Exact original owning CSVs are retained ignored;
[publication digests and field-preservation check](checks/final-csv-publication.json)
record both versions. Receipts, oracle and checks are untouched. Reproducible
count/cell/publication derivation tools are in `tools/`; they read the retained
ignored inputs from the repository root and are not product implementation.

[Resource audit](checks/final-resource-audit.json): zero new volumes, containers,
originals or unexplained resources; zero protected pre-run volumes/containers
removed. Retained results total 2,106 MiB; host free space 225 GiB. Shared Docker
images, containers and volumes are preserved, including unrelated pre-existing
resources. At most one original and one writable sample copy of a payload;
owned sample copies and originals removed after each selection. No cancellation
or deletion of another owner's work. Timings remain diagnostic: setup warmth and
own-write preconditions are declared; no cold-state/performance eligibility
claim. Sequential worktree lock/targets and shared host/4 GB Docker interference
are recorded. Construction workers 1; Disposable/WAL/OFF only; Durable NOT_RUN.

Final command selections: `invoke.py p319-final run cells:C01` through `C12`,
one `workspace_reliability:all` invocation, then one bounded `full_step.py`
phase per ordinary case; each delegates `go.py p319-final 110
prepare|run|clean`. Final report call selects all 25 registered families plus
cells once. Retained headers bind exact argv, source and report-template digest;
the journal records exit/expiration, classification and log SHA-256. Each shell
phase stops by 115 s; general invoke ceiling 118 s, all below the 120 s owner
ceiling. Successful samples are never reused as new measurement and failed
samples/preparations are never retried. No new runtime test was selected beyond
phase 5's cases/cells; earlier passed tests and Clippy remain valid at this
unchanged core tree. Final documentation/format/boundary checks are recorded
below after execution.

Production LOC: 81727 -> 81727 (delta +0), active core; reference absent
(retired R9c; last counted 65,417 at tree 498dd1917812). Pinned counter and exact
first-parent/staged comparison as specified above; generated CSVs, diagnostics,
tests, docs and derivation tools contribute no product LOC. Decided by agent,
pending owner review: phase 5 exits with the above explicit failures, exclusions,
matching-evidence refusals and blocked/open prerequisites. No issue closure,
push or PR is part of this batch.


Phase 5 final exit checks: documentation local links/anchors (18), one status
banner, claim/classification accuracy, public portability, all 273 receipt
identities/digests, derivation tool syntax and unchanged complete core tree:
PASS. The initial portability scan rejected a generic path-prefix literal in
its published checker; replaced with the dynamically obtained home prefix,
then the documentation check passes. No receipt/source/measurement changed.
Rust formatting: PASS under explicit 118 s wall stop. Boundary guard: PASS,
683 production files. No new Rust/runtime source changed in this exit, so new
Clippy/runtime tests are inapplicable; phase 2 warning-denying changed-crate
Clippy and scope tests and the 50 guard self-tests remain the valid source
checks. Whitespace and staged-tree/production comparison are checked before
commit; the resulting committed tree is confirmed afterwards.


## Second batch entry / phase 6 D-2 M1, 2026-10-11

Issue #319 read before edits; D-1–D-7 are recorded owner decisions. Both
owner action boxes remain unticked. Work stays on the handed-over local branch;
no push, PR, cleanup of protected resources or phase 8 execution is authorized.
The phase 5 exit and FINAL-COUNTS remain immutable comparison inputs.

The native failing external regression identified stage 5 atomic saves setting
mtime before the payload write. The preserved value 1700000010.123456789 became
the native write timestamp. The corrected helper writes first, then sets the
same mtime; syscall cardinality, bytes, inode checks and the M1 proof are unchanged.
A core harness copy differs from the frozen reference by exactly that order.
The build generates ordinary workload source with authenticated original module
paths and only the corrected M1 include. Root frozen sources and their recovery
pins remain unchanged. This is harness duplication, outside production LOC.

[Checks](checks/phase6-m1.json): red FAIL retained; green native and exact-copy
routing tests 2/2; build-identity tests 8/8; actual host helper compilation,
core formatting, boundary guard and whitespace PASS. Every invocation used
an explicit 118 s wall stop and one construction worker. One green invocation
was refused by the still-held build lock before execution; it is not a sample.
No product crate changed, so changed-crate Clippy is inapplicable. The selected
mounted case follows once after all five harness commits. Decided by agent,
pending owner review: retain the minimal core helper copy and generated routing.

Production LOC: 81727 -> 81727 (delta +0), active core; pinned counter, exact
first-parent/staged comparison and committed-tree confirmation. Reference absent
(retired R9c; last counted 65,417 at tree 498dd1917812). Disposable/WAL/OFF only;
Durable NOT_RUN — disabled by owner until explicit reauthorization.

### Phase 6 D-2 alias disposition

CLOSED FOR THIS BATCH — the native replay does not provide a reproducible exact
parent-directory mtime for a separate mounted execution. [Two native count-free
semantic diagnostics](checks/phase6-alias.json), using the original sealed
binaries, have identical payload hashes and initial parent mtime but different
final parent timestamps. Both fail the unchanged strict check at `data`.
No Store, mount, product timing sample or modified helper participated.

D-2 selects the expected parent field but supplies no comparison rule for this
automatic timestamp. An exact native-replay value would still fail the later
mounted execution; changing equality to an interval or deriving expected data
from mounted readback would introduce an additional oracle rule. Decided by
agent, pending owner review: retain the strict failure rather than invent that
rule. No expectation, check, workload, readback or pin changed. The named mounted
alias case is NOT_RUN in phase 6 because its authorized expectation is blocked.
This is a blocked disposition, not completion of D-2's requested correction.

Native invocations bounded at 118 s overall / 15 s per child; diagnostics finish
in under 2 s. Formatting, boundary guard, whitespace, evidence identity and
local links checked before commit. No Rust product/runtime changed; Clippy and
new mounted proofs are inapplicable. Production LOC: 81727 -> 81727 (delta +0),
active core and pinned exact snapshots; reference absent (retired R9c; last
counted 65,417 at tree 498dd1917812). No push/PR or issue closure.


### Phase 6 D-3 check allowance

Only the six named retained check failures advance: scattered CDC 500; reuse
exact/local/unique 500; unique and metadata-cardinality footprint 100000.
[Old/new declarations](checks/phase6-check-allowance.json) preserve each entire
budget. Verification work 45000 -> 75000 ms; hard publication 59000 -> 89000 ms;
work before cleanup 41000 -> 71000 ms. Cleanup reserve 4000 ms, publication
guard 250 ms, measured-operation watchdogs, resources and all content checks
stay unchanged. The engine validates the new tuple for exactly these six IDs
and requires the old tuple everywhere else. No larger allowance is generalized
to other 500 MiB cases. Actual separate check wall follows in phase 6 receipts;
no timing comparison is made.

New admission regression: six old validator refusals retained before fixing;
2 focused tests PASS after. Import engine 6 PASS / 1 compiler-only native skip;
16 owning family tests PASS. Formatting, boundary and whitespace PASS before
commit; no product Rust change, so Clippy inapplicable. Decided by agent,
pending owner review: choose the 75000/89000 ms tuple, preserving the existing
14-second work-to-publication gap. Every test has a 118 s wall stop.
Production LOC: 81727 -> 81727 (delta +0), pinned exact active-core snapshots;
reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).


### Phase 6 D-4 / O-9 capped Commit

[Old/new declarations and regression](checks/phase6-capped.json): the five
capped rows retain historical edit/Commit/End 2000 ms provenance, replace the
operative group key with Commit-only 2000 ms, and record the authorized route
difference. Command and unmount now use the uncapped ordinary per-operation
120000 ms watchdog. The 15000 ms reported complete-command target, payload,
readback, resource and verifier limits remain unchanged.

The controller regression supplies a three-second ordinary command: before
fixing, the measured command deadline was the shared two-second stop and
Commit was never reached. After fixing, command deadlines are ordinary, and
Commit receives a fresh two seconds from its own start. Red retained, focused
regression PASS; 14 Workspace engine tests and 4 owning capped-family tests
PASS. Formatting, boundary guard and whitespace PASS. No product crate changed;
Clippy is inapplicable. Selected capped sample follows at the phase6 seal.
All test invocations have explicit 118 s stops. Decided by agent, pending owner
review: retain the Commit-only watchdog implementation.

Production LOC: 81727 -> 81727 (delta +0), pinned exact active-core snapshots;
reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).


### Phase 6 D-5 driver

[Policy](checks/phase6-driver.json): committed `tools/invoke_case.py` admits
300 s only for the exact five500-step history runs and two large preparations.
Its retained inner driver gets 288 s; ordinary calls retain 118 s outer /110 s
inner. It reads and hashes the report template before every invocation, records
exact source/argv/reason/limits in an append-only journal, and stops the process
group before its outer ceiling. Case watchdogs are unchanged; a failed operation
is not replayed. Nearby IDs and the wrong operation phase cannot inherit D-5.
No command or test loop was added. The seven policy failures are retained;
focused eligibility tests 2/2 PASS. Formatting, boundary and whitespace PASS;
Clippy inapplicable to this tools/Python-only change. Scoped calls follow once
at the final phase6 source. Decided by agent, pending owner review: retain the
288-second inner allocation with room for final driver custody/cleanup.

Correction to the preceding D-4 entry: its Workspace engine suite ran **17**
tests, not14; all17 passed. The original invocation log is unchanged.
Production LOC: 81727 -> 81727 (delta +0), pinned exact active-core snapshots;
reference absent (retired R9c; last counted 65,417 at tree498dd1917812).

### Phase 6 verification registration

All five decisions have separate local implementation/disposition commits:
`ab7152db0` M1; `d419dc44d` alias blocked; `eea65f87a` six check allowances;
`b435074d9` Commit-only cap; `015aabec4` seven driver exceptions. Each has
Production LOC81727 ->81727 (+0); reference absent as above. Committed-tree
confirmation uses the same pinned counter before final handoff.

Selected once at this registration identity, tag `p319b6`: mixed-development
100MB K10, scattered CDC500, exact reuse500, capped insert500, hotset history500,
and branch-mixed500MB K100 preparation only. Alias sample is closed/unrun for
the recorded native timestamp blocker. Smaller ordinary calls stay below120 s;
only the exact hotset run and branch preparation use D-5's300 s call allowance,
with the reason recorded per call. All original case watchdogs remain unchanged.
Prepare and sample each case at this same commit. No full catalogue resampling.

The two M1 helpers are rebuilt at clean committed source in separate bounded
host/Linux build steps. `tools/build_m1.py` checks the previous final build and
its original full-build source/image/provenance evidence, admits exactly the
new core M1 helper as the changed compiled input, reuses seven exact unchanged
binaries, verifies source before/after Linux compilation and seals the result.
Generated workload source is hashed as an explicit input. This avoids combining
several compilers into one command exceeding120 s. These are harness tooling;
no new product path, dependency or proof relaxation. Syntax, formatting, guard
and whitespace checked. Decided by agent, pending owner review: use this
narrow compilation reuse; failures are retained, never converted into a seal.
Production LOC:81727 ->81727 (delta +0), exact pinned active-core snapshots.

### Phase 6 selected evidence at registration identity

[Original selected receipts and bounded calls](checks/phase6-selected.json)
are bound to clean `8dd3b184c`, tag `p319b6`, and the nine-binary build seal.
M1 mixed100 K10, scattered CDC500 and exact reuse500 have functional/proof
PASS, with overall INELIGIBLE as their receipts require. Requests/jobs/SQL:
M1 2699/20449/110595; exact reuse7014/46769/282013; host CDC daemon counts
UNAVAILABLE, not zero. D3 proof wall is43642502084 ns for scattered CDC and
43187727126 ns for exact reuse, within the new75000/89000 ms declarations.
These raw proof observations are not a speed comparison.

The capped500 insert command and Commit now complete, but independent graph
proof FAILs `persisted unchanged payload/source-offset transcript differs`:
8011 requests,8455 owner jobs,102318 statements; Gone/KNOWN_STOP. The stricter
mapping check exposes copied ragged edges still represented as replacement.
The hotset500 run ends in FAIL at its unchanged cumulative120000 ms execution
watchdog, with377 acknowledged Commits and proofNOT_RUN. Its300 s D5 call
returns in130.64 s; this is a retained receipt, never an unchanged rerun.
Branch500MB K100 preparation PASS in125.76 s under D5; no runtime sample was
selected at this registration. All owned original/test resources were cleaned;
protected services were untouched. Preparation and run used the same commit.

Aggregate harness tests ran326 in25.29 s:2 failures,4 errors,3 skips. One error
was the missing FSB_CONTEXT_NATIVE prerequisite; its corrected8-test module
passes. Reliability CLI has an import-order package-attribute double defect:
its isolated5 tests pass, while aggregate remains FAIL until the new regression
and repair. No aggregate PASS is claimed.

### Owner-expanded remaining-failures work

After the selected capped failure, the owner explicitly authorized the retention
repair, then authorized subagent research and fixes for all failed cases and
prospectively larger budgets for extreme cases. This supersedes the phase6-only
product restriction for correctness work. It does not erase existing receipts,
turn NOT_APPLICABLE into PASS, or qualify interference/cache state. Decided by
agent, pending owner review: repair bounded captured edit-edge authentication,
validate exact automatic alias timestamp custody after independent native
qualification, and extend only the named500-history cumulative execution
allowance from120000 to210000 ms. Ordinary individual operations remain120000
ms; reporting target15000 ms and independent proof limits remain unchanged.
The environment action remains unticked, so phase8 is still gated. Commit Begin
Busy and original concurrency-overlap proofs remain in force.

### Owner concurrency clarification, after expanded repair authorization

The owner now requires (1) at most one ongoing Commit per Workspace and
(2) parallel Workspaces with concurrent Commits that do not conflict or mix
state. Decided by agent, pending owner review: preserve the per-Workspace
admission guard and original overlapping-public-Commit benchmark proof; research
bounded before-effect admission of short global Store write transactions across
connections/processes. No failed Commit or transaction is replayed. The interim
branch-only harness serialization proposal is withdrawn before sampling because
the latest direction selects actual concurrent product Commits. Historical D1
Busy failures remain unchanged; external/uncoordinated writer refusal and exact
unknown custody still require proofs. This correctness work is not a Commit
speed optimization and does not qualify the gated clean-environment run.

During harness formatting, recursive rustfmt followed shared reference modules
and changed six frozen workload files. The changed bytes were verified exactly
against rustfmt1.85.1 of HEAD with skip_children=true, then restored to exact HEAD;
no frozen-format change enters a commit. Future harness formatting skips children.
The resulting source-pin refusal is retained and its corrected owning check will
run once. One root custody unit invocation omitted the wall wrapper (2PASS in
0.008s); this procedural gap is recorded, and later invocations remain bounded.

### Expanded repair verification before final catalogue selection

Alias custody retains the original workload and independently qualifies the one
native automatic parent-mtime field. The observation is bounded to the original
epoch, step5, path data and operation clock envelope; later native and persisted
publication compare its exact nanoseconds. All other model fields remain exact.
The SDK-only model builders moved verbatim to an explicitly consumed helper
module, eliminating six dead-code compiler warnings without modifying frozen
reference sources. Native/parser qualification and 12 SDK model tests PASS.
Runtime binary build/check PASS; warning-denying runtime Clippy remains FAIL on
retained frozen and unrelated runtime lints. No compiler suppression is added.
See the alias-custody and sdk-model check artifacts; earlier failures remain.

A failing exact payload/source-offset regression preceded bounded captured-edge
authentication. It trims at most64KiB per affected edge, only growth scripts with
reference pieces and changing geometry. Six new cases plus21 related tests
PASS. Existing delete counts remain identical; no schema/accounting change.
The new edge counters are constructor observations, not fields of the current
native numeric telemetry schema; no large-case telemetry count is invented.

Phase7 count-first evidence: 2,050 creates use three authoritative1,024-serial
reservations, unchanged overall; preparing the first range before Ready moves
one reservation out of creates, leaving two refills. Two Ready mounts each
reserve once and their first creates make zero Store reservations even with a
raw SQLite writer held. Initial Attach Busy refuses before native mount. Eight
inclusive reservation transaction observations have maximum46,750ns; this is
not an exclusive physical lock maximum. Initial admission changes ordering,
not range size, low-water256, retry policy or Commit Begin's raw SQLite Busy.
Four serial admission regressions PASS after the retained red failure.

The latest owner concurrency rule separately authorizes cooperative short writer
admission. Linux FIFO-local and same-inode flock admission precede one SQL
attempt under a shared two-second bound; no whole Commit/Save lock or failed
SQL replay. Cross-process admission is bounded but not FIFO. macOS retains
cross-session SQLite Busy because its advisory lock conflicts with SQLite.
Linux eight and macOS six persistence tests PASS. The final native regression
has both Workspaces concurrently Committing, typed duplicate Busy/InFlight,
no ACK before admission release, distinct exact committed models and exact
isolated live views. It PASSes; an invocation missing --fuse first failed before
mount and is retained as a procedural failure. Workspace/daemon all-target
Clippy PASS; persistence all-target Clippy PASS on both tested platforms.
Decisions on queue/deadline and scope are by agent, pending owner review.

Owner E1 prospective allowances: five500-step histories cumulative execution
120000->210000ms; the named exhaustive500MiB complete invocation120000->275000ms,
leaving13s inside the288s driver allocation for return/custody. Its original
300000/310000ms proof declaration is retained. Ordinary individual filesystem
and control operations, reporting targets, and smaller case limits are unchanged.
No sample used the initially proposed300000ms owner ceiling; it was revised
before collection. Prior hotset failure remains failed. Native final sampling
waits for clean committed source, final reliability review and nine-binary seal.

### Phase 8 exit — clean environment remains owner-gated

The issue owner environment action is still unticked when checked2026-10-12.
Phase8 did not start. Environment qualification, the clean full-family/twelve-cell
run and its CSVs are NOT_RUN. Every phase8 box stays unticked with CLOSED and this
reason; no interference-free eligibility or timing comparison is claimed.
The expanded correctness verification is separately scoped, with interference
retained in its receipts. No protected container/volume was stopped or removed,
no VM setting changed, no push/PR/issue close. Decided by agent, pending owner
review: follow the issue gate and proceed to the independent count profiles.
Production LOC:82179 ->82179 (delta +0), exact pinned active-core snapshots;
reference absent (retired R9c; last counted65,417 at tree498dd1917812).

### Phase 9 exit — three retained count profiles, no optimization

[Count profiles](PHASE9-PROFILES.md), [machine operands and source hashes](checks/phase9-profiles.json)
and tools/profile_counts.py retain the three D7 investigations without a product
change. Exact/unique500MiB have identical7014requests/46768owner jobs/282012SQL
statements at exact pre-mount->Commit endpoints (the following Status is
excluded); logical Overlay reads524288000B each, exact observer costs zero at
those endpoints. Pack read/write counters differ and remain separately named.
Per-file chunking/hash bytes are UNAVAILABLE, not inferred from namespace work.

Delete100MiB has1426OperationRecord jobs vs shrink629; at1/10/500MiB delete
118/361/7200 vs shrink147/588/759. Namespace producer records remain42 for every
single-file row. There is no retained SQL query plan/runtime profile, so no SQL
cause or optimization is selected. Hotset500 retains377 commandACKs and377
CommitACKs,380 control round trips including Hello/two mounts; step378 has no
ACK,123declared steps unacknowledged. Its absent daemon counters stay UNAVAILABLE.

All original row verdicts are unchanged; no timings compared. Profile verifier
PASS. Three profile boxes are completed. Fix-specific test and twelve-cell
phase9 boxes remain unchecked with CLOSED: no optimization was selected because
phase8 has not run. Expanded owner correctness repairs are separate, with their
own red-first tests and final source receipts. Decided by agent, pending owner
review: retain diagnostic scope and wait for the clean-run gate before speed work.
Production LOC:82179 ->82179 (delta +0), pinned active-core snapshots;
reference absent (retired R9c; last counted65,417 at tree498dd1917812).

### Owner explicitly selects the 28 reliability gaps for implementation

After asking whether the28 NOT_APPLICABLE cases were being fixed, the owner
asked whether they would be fixed. The agent accepted this as additional
implementation work, not permission to turn a source review into a runtime
PASS. Original historical N/A receipts remain unchanged. Missing creation-time
Sandbox limits and allocation/event-peak observations are feature work; case-
specific API/fault/cleanup obligations remain mandatory. Two integrity cases
bypass the allocation check and can be selected after genuine creation-profile
support. The final applicability review waits for the last product/test change.

Read-only diagnosis of C10 also finds one fewer READ request than its frozen
single diagnostic census: requests/jobs/statements1547/1546/14406 vs frozen
1548/1547/14408. READ513->512, all other38opcode buckets identical; proofPASS
in both historical forms. One Workspace and one Inode statement account for
its two-statement difference. The cause of that request-shaping difference is
unproven without individual read offsets/reply lengths. Frozen count FAIL stays
FAIL; no artificial request or changed oracle is a correctness fix.

Alias semantic scope clarification: native replay qualifies the one automatic
field rule; the measured observation must lie in[start-1s,finish], wrapper<=60s,
then all later publication checks compare exact observed nanoseconds. The1s
allowance is declared, not measured calibration; an initial timestamp inside
the permitted interval can pass. No exact cross-execution realtime equality or
exact rename instant is claimed. Normal final proof includes allsix states.

### Complete public Commit lifecycle admission

One invocation-owned guard now covers capture, construction, publication, install
and captured owner releases for both public BoundWorkspace entrypoints. InFlight
acquires no guard and cannot clear another invocation; unknown/install failure,
retained owners and unwind retain admission. Supervised red reproduction has
known install while releases are parked and the prior flagfalse; green keeps
ittrue, both duplicate APIs refuse with zero extra owner jobs, separateWorkspace
progresses, exact committed/live models agree, known release clears admission.
[Portable red/green/source evidence](checks/captured-lifecycle-admission.json).
The initial fixture invocation hung at118s; revised independent5s resource-hold
supervisors return their ownership before bounded joins. A later invocation
omitting --fuse failed setup; corrected native parallel testPASS. Neither failure
is relabeled. Functional23PASS; three existing product raw-writer publication
refusal tests FAIL Committed vs Busy, now independently assigned for repair.
Daemon all-target Clippy, scopedfmt and686-file boundary guardPASS. This commit
fixes lifecycle admission only; concurrent writer qualification remains unfinished.

### SQLite kernel lock custody repair

The original raw-writer Busy failures exposed an unsafe main-file advisory
owner: closing any additional descriptor to the database inode can cancel
SQLite process POSIX locks. Independent kernel probes after real two-Session
reserves/Save show main_shared=false before the fix, including after one peer
Session drops. A simpler reserve-only Busy check passed and did not establish
lock custody. [Red/green kernel and original test evidence](checks/sqlite-lock-custody.json).

Linux cooperative admission now uses an existing parent-directory descriptor,
never an additional main/WAL/SHM descriptor. Bare relative filenames use dot.
This is a coarse lane shared by Stores in the same directory; short transactions
only, no wholeSave/Commit lock, unchanged2s bound, no sidecar or SQL replay.
Both kernel regressions show main_shared=true, rawBusy has one BEGIN and no
transaction/commit/rollback. Allthree original History Busy failures pass with
unchanged holder/expectations; cooperativewriter3, nativeparallel1, seals2PASS.
Persistence+daemon all-target Clippy, scopedfmt,687-file boundary guardPASS.
Earlier main-inode qualification is explicitly superseded; its receipts remain.
Decided by agent, pending owner review: use this safe directory coordination.


### Known SQLite Full preserves native ENOSPC and terminal cleanup

A separate real mounted regression filled the configured Overlay pager during
one ordinary128KiB write. Before repair, confirmed atomic rollback still returned
EIO5, retained131072 request bytes and made the mount terminal. The exact direct
SQLite DiskFull identity is now mapped to NoSpace only after known rollback with
no filesystem publication or provider ambiguity. The original completion owns
one ENOSPC28 reply and then releases normally. Wrapped uncertainty still retains
custody and EIO; no error text parsing or attempted-operation replay was added.
Decided by agent, pending owner review.

[Retained failures, final source pins and scope-qualified checks](checks/known-sqlite-full.json)
record two final mounted passing tests, actual Full1 per test, zero mutation ACK,
unchanged prior file, empty target, actual current0/peak65536 allocation observation,
zero retained request and both normal/forced drain and owner cleanup. One real
SQLite identity test and scoped source lint/format also pass. This is a genuine
current SQL-format errno repair, not qualification of the five old injected
fault cases or any full original reliability case. Their exact original fault
boundaries and message/hit assertions remain pending; final product review and
sealed original cases are NOT_RUN.


### Phase 10 entry — isolated source line, 2026-10-12

New local branch `issue319-terminal-pass` starts at `25c744e1b`. The previous
branch and worktree are read-only; main is untouched. The ENOSPC production
patch applies cleanly. The ledger conflict is resolved by retaining the base
ledger and only the selected fix entry; intervening feature entries are not
claims about this branch. Historical fix evidence retains its original identity.
New validation and exact LOC comparison follow before the local commit.

Original picked Linux regression build failed with E0412: `StateObservation`
is absent; that type and its two allocation-field assertions belong to dropped
`4cb79e26b`. The production patch has no dropped dependency. Minimal test-only
adaptation uses the existing `WorkspaceState` and `Resources` ports to assert
exact unchanged state, payload bytes and cells after rollback. Native errno28,
actual Full1, zero acknowledgement, unchanged files/history, zero retained
requests and both drains remain mandatory. Transient allocation peak is
UNAVAILABLE on this source line; no observation feature is restored.

Selected ENOSPC fix validation on the settled line: host `error_identity`1/1;
Linux `mounted_sqlite_full`2/2 and `error_identity`1/1, built with `--no-run`
first; host all-target Clippy Overlay/Fuse/daemon with `-D warnings` PASS.
Original Linux compiler failure is retained, not relabeled. Every invocation
has an explicit118s stop. Containers are uniquely named and removed. New
source comparison uses `tools/count_snapshot.py staged`, materializing exact
Git blobs and using the same pinned production counter including nested SDK
source and runtime SQL. Production LOC:82213 ->82227 (delta+14).
Reference absent (retired R9c; last counted65,417 at tree498dd1917812).
This commit carries the ENOSPC cause only; phase10 is not complete until the
second kept fix and host/Linux build gates finish.

Dropped from this branch, by the later owner direction: `7bf28e318` Sandbox
resource limits; `4cb79e26b` backed allocation observations; `991ef79cf` explicit
Clean/Discard End; `1aceab409` Sandbox external execution/control-loss cleanup;
`034478c7b` SQL failure/publication observations. Each introduced a feature
for the reliability campaign. Harness routes `664f09dbf`, `254469777`, and
`626d9dd22` and every old uncommitted file are excluded with them. None is
rebuilt. All historical receipts/CSVs remain at their original identity.
`repository_history` remains selected in the catalogue but is NOT_RUN — set
aside by owner. Durable: NOT_RUN — disabled by owner until explicit
reauthorization. Phase11 will retire exactly28 reliability cases.


### Concurrent Workspace Store metadata reservation/publication repair

The real mounted parallel Commit test exposed a Store bug after the Clean End
change: a later Save could publish its higher reserved range before an earlier
Save synchronized its pooled candidates. The earlier Save then rejected its own
still-valid range as metadata index chronology. A deterministic two-Save real
Disposable SQLite test failed before implementation. Its fix limits each first
catalogue synchronization to complete groups strictly below that Save's initial
reserved range, using actual indexed BeforePage queries and only a local index
floor clamp. No global allocator rewind, new reservation, busy replay or whole
Commit serialization is introduced. Decided by agent, pending owner review.

A second public real SQLite regression found an independent global-window bug:
late publication rewound the floor131075→1 and exposed262145 eligible values;
a late inside-floor publication exposed131073 against131072. Both failures are
retained. The existing per-group update now ignores below-floor candidates and,
on overflow, uses an indexed latest published group and its count. Serial order
still retains the incoming group. It preserves the authoritative floor and
canonical reads of evicted groups. Actual extra SQL instructions are paid; no
frozen statement/count limit, oracle, schema or format is changed. An explicit
monotonic batch floor advance may conservatively overcharge, never undercharge,
the candidate counter.

[Combined exact source/log evidence](checks/concurrent-pool-repair.json) and the
[window regression detail](checks/concurrent-pool-window.json) record14 passing
Storage/Persistence tests plus the real mounted parallel test: two Workspaces
have overlapping original Commits, duplicate admission is refused, both
acknowledge once and distinct captures produce distinct correct roots. Each
producer has one initial reservation, zero refill and one publication. The
bounded empty query and legacy empty query both pay4 statements. Linux owning
all-target Clippy passes; host checks/final sealed full-case qualification remain
pending. Source/hash capture limitations for the original untracked window test
are explicit, not presented as a sealed benchmark identity.


### Phase10 pooled-metadata pick

Production source of `4b0d5bf05` applies unchanged; only the ledger and old
batch-LOC receipt conflict. The ledger retains just this selected fix entry
with its historical identity, and the LOC artifact is regenerated from this
branch's exact parent/staged product trees. No dropped feature source is added.

### Phase10 exit — source settled, 2026-10-12

Both selected fixes are retained. ENOSPC is committed at `1906cf24d`; the
pooled fix production bytes equal `4b0d5bf05` exactly. The ENOSPC test-only
adaptation and its original missing-feature compiler failure are recorded above.
[New source checks](checks/phase10-checks.json) retain14 pooled tests PASS on
host and Linux, Linux native parallel1PASS, native ENOSPC2PASS and host/Linux
error-identity1PASS. All Rust tests were built with `--no-run` first.

Host and pinned Linux builds of Overlay,Workspace,Fuse,daemon (plus changed
Storage/Persistence) PASS. All six packages' all-target Clippy with warnings
denied PASS on both. Formatting and boundary guard checked below before commit.
Full fuser checker retains its two historical passthrough findings; actual core
manifest, lock and complete timestamp/lifecycle package inventory PASS via the
checker's unchanged functions. Initial native builds preceded that provenance
command: this ordering gap is retained; it is not a pre-build check PASS.
One overlapping provenance invocation was refused by the local lock without
execution. Future native builds follow the completed provenance check.

The regenerated [batch LOC receipt](checks/batch-production-loc.json) compares
this branch's exact first-parent/staged product snapshots, not the dropped
feature branch. Production LOC:82227 ->82335 (delta+108). Together with the
first pick:82213 +14 +108 =82335. No reference/source retirement or relocation
is credited as an algorithmic simplification. Scope active core; reference
absent (retired R9c; last counted65,417 at tree498dd1917812). Committed-tree
confirmation follows each commit. Existing38 containers/413 volumes remain
untouched; this branch's named check containers were removed after each run.
Phase10 complete; no benchmark has been sampled on this branch yet.

## Phase11 — reliability family retirement, 2026-10-12

Phase10 source settlement committed at `e93a02508`; public comment
[phase10](https://github.com/Ephemeral-AI-Lab/layerfs/issues/319#issuecomment-6113316151).
[Retirement operands and all28 IDs](checks/phase11-retirement.json) preserve the
owner reason and prior applicability gaps. The family definition/workload,
engine route, integrity fixture branches, dedicated runtime module and their
tests are removed together. Every other family definition stays byte-identical.
The frozen root catalogue and all old receipts/baseline CSVs stay unchanged.
`repository_history`3 remain selectable and NOT_RUN — set aside by owner.
Registry target273 ->245, selected active set242. This is harness retirement;
production LOC stays82335. Registry/harness verification follows before commit.

Phase11 verification at this harness source: [check operands](checks/phase11-checks.json).
Registry3PASS:245 unique case IDs/24 families; repository_history3 selectable.
Other24 family definitions, frozen root definitions, historical receipts and
all baseline CSVs are byte-unchanged. Engine310-test invocation retained3
failures/15 subtest errors from7 unique Init-install tests because this command
omitted `LAYERFS_CONSTRUCTION_WORKERS=1`; all7 corrected-environment tests PASS
without source change. Already passing tests are not rerun. Native import1PASS
resolves its compiler-only prerequisite skip. Public census/staging prerequisites
remain explicit skips. Native splice8 are pending a clean nine-binary seal and
will run once before phase12 samples; no fabricated engine-wide PASS.

Host native helper builds PASS. Runtime all-target Clippy `-D warnings` remains
FAIL on the unchanged frozen/unrelated lints already recorded in phase6; no
suppression or frozen-source edit is introduced. The changed production packages'
phase10 host/Linux all-target Clippy PASS remains valid; this retirement changes
no production source. Formatting, boundary and whitespace checked before commit.
Production LOC:82335 ->82335 (delta+0), exact parent/staged snapshots via the
pinned counter; reference absent (retired R9c; last counted65,417 at tree498dd1917812).
This single harness commit contains the complete family retirement. Phase11's
engine exit and public comment follow the eight pending sealed-build tests.

### Phase11 exit — sealed native checks, 2026-10-12

Retirement commit `920cd9006` is confirmed at82335 ->82335 (delta+0).
The pending native splice8 tests all PASS against the clean nine-binary seal,
before any measurement. Unit-engine corrected scope stays as recorded; the
public census/actual staging prerequisites remain explicit skips. Registry245
unique cases/24 families, repository_history3 selectable, active set242.
Formatting/boundary PASS; inherited runtime Clippy FAIL remains unchanged.
Phase11 complete. The phase12 seal and actual samples are separately recorded.

## Phase12 — sealed open-case cohort, 2026-10-12

All27 selections were prepared and sampled exactly once under `p319n12` at
`920cd9006` (product tree `ee8970d026ae7794ab04dd849fa360b5402e0b28`).
The clean nine-binary build rebuilt every arm with host Rust1.85.1 locked and
the pinned Linux image; immutable archived binaries and source-before/after
equality are retained in [the cohort operands](checks/phase12-cohort.json).
No tracked edit occurred between sealing and the last sample. No dropped
feature/harness build was reused.38 pre-existing containers and shared4GB
Docker VM interference were declared; no clean timing eligibility is claimed.
The two exhaustive selections are verification-only: their receipt performance
sample_count is0 and verification_attempt_count1; no performance sample is claimed.

Actual outcomes:1 PASS,14 INELIGIBLE,12 FAIL;15 have both functional PASS and
proof PASS. All five500-step histories, all three capped edits, the four
reuse/footprint cases, alias, and the100MB development/exhaustive checks pass
their functional/proof fields. Nine concurrency cases and the three remaining
500MB mixed checks fail; missing functional/count/custody fields stay unavailable.
No Busy/EAGAIN failure occurred in these concurrency samples. The five100MB
topology failures reach public proof; the four500MB rows stop earlier during
verification. Detailed failure text and source hashes are in the operands.

The exhaustive500MB run explicitly kept the owner-authorized275-second ceiling
and300-second outer allowance. Its preparation succeeded259.8s; its sample
failed `verify-history` at the invocation stop (functional unavailable/proof FAIL).
No ceiling, cache, buffer or proof was changed to rescue any sample.
Every sample manifest was checked in full before owned test-copy removal;
each original was removed before the next case. Historical receipts/baselines
stay unchanged. The owning engine generated16 new CSVs beside earlier baselines,
with only location-text substitutions for public portability; their original
and published digests are recorded. Unsampled family rows remain NOT_RUN.
Repository_history: NOT_RUN — set aside by owner. Durable: NOT_RUN — disabled
by owner until explicit reauthorization. Phase13 starts from these retained failures.

| family / case | status | functional | proof | requests / jobs / statements | overlay logical / allocated B | Store logical / allocated B | command / Commit ms | cleanup / custody |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| edit_length_changing_capped / `insert-middle-4k-input-524283904b-result-500mib-ops-1-capped-v1` | INELIGIBLE | PASS | PASS | 8011 / 8376 / 101891 | 311296 / 268750848 | 530920608 / 530927616 | 2277.9 / 18.2 | Gone / KNOWN_STOP |
| edit_length_changing_capped / `prepend-head-4k-input-524283904b-result-500mib-ops-1-capped-v1` | INELIGIBLE | PASS | PASS | 16011 / 16212 / 200970 | 294912 / 268705792 | 530895888 / 530903040 | 4861.2 / 14.3 | Gone / KNOWN_STOP |
| edit_length_changing_capped / `replace-grow-middle-2k-to-4k-input-524285952b-result-500mib-ops-1-capped-v1` | INELIGIBLE | PASS | PASS | 8012 / 8460 / 102355 | 323584 / 268763136 | 530928824 / 530935808 | 2234.6 / 20.8 | Gone / KNOWN_STOP |
| multi_workspace_development / `v016-workspace-mixed-100mb-5000-k10-v1` | FAIL | FAIL | FAIL | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 1040384 / 269475840 | 108080704 / 108081152 | 1740.0 / 1064.2 | Gone / KNOWN_STOP |
| multi_workspace_development / `v016-workspace-mixed-100mb-5000-k100-v1` | FAIL | FAIL | FAIL | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 1388544 / 269828096 | 124006400 / 124006400 | 16766.3 / 13932.5 | Gone / KNOWN_STOP |
| multi_workspace_development / `v016-workspace-mixed-500mb-30000-k10-v1` | FAIL | FAIL | FAIL | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 1028096 / 269467648 | 514506752 / 514510848 | 2684.1 / 1729.5 | Gone / UNAVAILABLE |
| multi_workspace_development / `v016-workspace-mixed-500mb-30000-k100-v1` | FAIL | FAIL | FAIL | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 1343488 / 269778944 | 531537920 / 531542016 | 26382.9 / 20688.0 | Gone / UNAVAILABLE |
| multi_workspace_development / `v016-workspace-four-100mb-5000-k100-v1` | FAIL | FAIL | FAIL | 104312 / 813347 / 4410865 | 2228224 / 270663680 | 135245824 / 135245824 | 38402.4 / 60570.7 | Gone / KNOWN_STOP |
| branch_development / `v016-branch-mixed-100mb-5000-k10-v1` | FAIL | FAIL | FAIL | 8093 / 60917 / 330436 | 1048576 / 269484032 | 108314624 / 108314624 | 2447.5 / 1437.6 | Gone / KNOWN_STOP |
| branch_development / `v016-branch-mixed-100mb-5000-k100-v1` | FAIL | FAIL | FAIL | 54851 / 428182 / 2314315 | 1396736 / 269832192 | 123895808 / 123895808 | 17254.3 / 14772.5 | Gone / KNOWN_STOP |
| branch_development / `v016-branch-mixed-500mb-30000-k10-v1` | FAIL | FAIL | FAIL | 8108 / 61046 / 331407 | 1044480 / 269479936 | 514490368 / 514494464 | 3934.6 / 2476.3 | Gone / UNAVAILABLE |
| branch_development / `v016-branch-mixed-500mb-30000-k100-v1` | FAIL | FAIL | FAIL | 54938 / 428416 / 2316403 | 1355776 / 269795328 | 531570688 / 531574784 | 27278.6 / 21481.2 | Gone / UNAVAILABLE |
| dedup_branch_history / `dedup-history-distributed-500` | INELIGIBLE | PASS | PASS | 3443 / 45111 / 209694 | 249856 / 268685312 | 8462080 / 8462336 | 22190.8 / 5962.0 | Gone / KNOWN_STOP |
| dedup_branch_history / `dedup-history-hotset-500` | INELIGIBLE | PASS | PASS | 3421 / 46815 / 215406 | 249856 / 268689408 | 8474416 / 8474624 | 22039.2 / 5546.2 | Gone / KNOWN_STOP |
| dedup_branch_history / `dedup-history-recurring-500` | INELIGIBLE | PASS | PASS | 2513 / 43518 / 199624 | 282624 / 268722176 | 5631528 / 5632000 | 21772.5 / 3084.0 | Gone / KNOWN_STOP |
| dedup_branch_history / `dedup-history-metadata-500` | INELIGIBLE | PASS | PASS | 1511 / 39514 / 176585 | 249856 / 268685312 | 5603096 / 5603328 | 21436.1 / 2931.6 | Gone / KNOWN_STOP |
| dedup_branch_history / `dedup-history-unrelated-500-mixed-v2` | INELIGIBLE | PASS | PASS | 31535 / 223535 / 1148852 | 1310720 / 269746176 | 537104384 / 537108480 | 25170.8 / 12773.1 | Gone / KNOWN_STOP |
| mixed_load_bearing / `v016-mixed-development-100mb-5000-k100-v1` | INELIGIBLE | PASS | PASS | 26078 / 203933 / 1098657 | 815104 / 269254656 | 114925568 / 114929664 | 8091.5 / 3646.4 | Gone / KNOWN_STOP |
| mixed_load_bearing / `v016-mixed-development-500mb-30000-k10-v1` | FAIL | UNAVAILABLE | FAIL | 2704 / 20380 / 110273 | 2560000 / 270999552 | 513101824 / 513105920 | 1277.5 / 616.0 | Gone / KNOWN_STOP |
| mixed_load_bearing / `v016-mixed-development-500mb-30000-k100-v1` | FAIL | UNAVAILABLE | FAIL | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | UNAVAILABLE / UNAVAILABLE | UNAVAILABLE / UNAVAILABLE | 13032.1 / 6536.9 | Gone / UNAVAILABLE |
| mixed_load_bearing / `v016-mixed-exhaustive-100mb-5000-k100-v1` | PASS | PASS | PASS | 26078 / 203933 / 1098658 | 815104 / 269254656 | 115064832 / 115068928 | 8039.4 / 3641.1 | Gone / KNOWN_STOP |
| dedup_workspace_reuse / `dedup-workspace-local-500` | INELIGIBLE | PASS | PASS | 7014 / 46769 / 282013 | 533876736 / 802316288 | 151035904 / 151035904 | 1242.0 / 3566.4 | Gone / KNOWN_STOP |
| dedup_workspace_reuse / `dedup-workspace-unique-500` | INELIGIBLE | PASS | PASS | 7014 / 46769 / 282013 | 533876736 / 802316288 | 670633984 / 670638080 | 1243.7 / 15620.6 | Gone / KNOWN_STOP |
| store_footprint / `store-footprint-unique-100000` | INELIGIBLE | PASS | PASS | 12 / 95 / 443 | 233472 / 268673024 | 516699104 / 516706304 | 6466.1 / 91.0 | Gone / KNOWN_STOP |
| store_footprint / `store-footprint-metadata-cardinality-100000` | INELIGIBLE | PASS | PASS | 12 / 95 / 443 | 233472 / 268673024 | 556028896 / 556036096 | 13674.9 / 95.7 | Gone / KNOWN_STOP |
| file_size_transition / `v016-boundary-alias-roundtrip-v1` | INELIGIBLE | PASS | PASS | 108 / 624 / 3234 | 364544 / 268800000 | 937400 / 937984 | 237.3 / 41.2 | Gone / KNOWN_STOP |
| mixed_load_bearing / `v016-mixed-exhaustive-500mb-30000-k100-v1` | FAIL | UNAVAILABLE | FAIL | 26119 / 204162 / 1100028 | 2678784 / 271118336 | 522121216 / 522125312 | 12809.1 / 6575.0 | Gone / KNOWN_STOP |

Production LOC:82335 ->82335 (delta+0), exact parent/staged snapshots via the pinned counter; reference absent (retired R9c; last counted65,417 at tree498dd1917812). Documentation/receipt publication changes no product or runtime code.

## Phase13 — isolated repairs, 2026-10-12

### Topology checkpoint-mode binding (harness)

Cause, before editing: public topology verification rejected five completed
samples because the transcript emitter attached mode bindings to all860
acknowledged Commit rows, producing846 nonempty mode fields on omitted
checkpoints; the frozen schedules require bindings only on14 selected rows.
Counts by sample are18/20,198/200,396/400,27/30,207/210 malformed/total.
Exact selected schedules and every retained transcript are reproduced by the
existing emitter; mixed branch trunk5 is correctly omitted. The four500MB
rows stopped before this proof, so this cause is not claimed for their failures.

Predicted counter:846 ->0 malformed omitted mode fields, retaining all860
acknowledgements and14 selected payload/mode bindings. A new external controller
test fails in all nine current M1 topology definitions at the unmodified emitter:
omitted rows have `['-', 'declared-modes']` rather than `['-', '-']`.
Compact/no-modes cases and complete role-local row order are covered too.
No oracle, typed Commit comparison, complete public census, overlap requirement,
Storage readback or namespace proof changes. These are current contract cases;
none is retired. Only the emitter is selected for this cause commit.

The [count tier](checks/topology-mode-binding.json) observes846 ->0 malformed
rows on the exact retained transcripts, with all860 tuples and14 selected
bindings unchanged. All34 controller/fixture/count/incomplete-report/topology-
census tests PASS. Source fix is one emitter expression; no Rust crate changed,
so a new crate Clippy run is inapplicable. Formatting/boundary/whitespace and
exact production LOC are checked before commit. Fresh stage samples follow
the clean seal; this count tier is not a benchmark PASS.

Stage `49f38c973` / `p319n13t`: all five previously failing100MB topology
samples have functional PASS and proof PASS, overall INELIGIBLE. Compact
branch convergent-content guard also has both checks PASS/INELIGIBLE; its
requests/jobs/statements162/2664/12058 exactly equal the prior guard receipt.
Multi-Workspace100MB K10 serves as the low-cycle guard in its family; count
totals are UNAVAILABLE in both old/new receipts. Four-Workspace requests stay
104312, jobs813347 ->813125, statements4410865 ->4409295; overlay/Store bytes
fall. Branch K100 requests54851 unchanged, jobs428182 ->428121, statements
2314315 ->2314183. Branch K10 requests8093 unchanged, jobs60917 ->60920,
statements330436 ->330542; these affected-row variations are retained, not
attributed to a Python binding expression. Store bytes also vary between fresh
samples; no speed/storage optimization claim is made. All six cleanup Gone /
KNOWN_STOP, all removal manifests PASS. No tracked edit during sealing/sampling.

### Native M1 duplicate metadata pass (harness)

Cause before editing: each500MB native M1 proof enumerates30297 non-root paths
with lstat, then lstats all30298 entries again, paying60595 metadata calls per
role (121190 for two roles); retained successful single-role checks take21.64s
of the unchanged approximately22s work portion, leaving later proof work no room.
This is source-counted metadata amplification, not a qualified SQLite claim.

Predicted metadata calls60595 ->30298 per500MB role;121190 ->60596 for two.
The independent test-only Darwin lstat observer is built before the external
test and confirms its activation/symbol/counter. On the existing100MB step0
fixture, the unchanged helper's oracle passes but the count assertion fails:
10095 calls for5048 paths. Predicted guard5048 calls. The observer returns the
original syscall result and changes no helper JSON, Store or product surface.

The chosen repair streams each required path's metadata directly into the
existing full metadata/alias/range verifier; it retains the old path-membership
list, required class maps and two fixed1MiB buffers. No additional whole-tree
metadata mirror, raised cache/window, reduced readback or frozen-source edit is
selected. Extra names, kinds, lengths, declared modes/mtimes, links, symlinks and
all declared byte ranges still fail their unchanged checks.

[Native count receipt](checks/native-metadata-count.json): observed10095 ->5048
calls, exactly predicted. Native recipe8 PASS, and the new stage4 extra-name /
kind / symlink-target / hardlink refusal test PASS. Its first two setups wrongly
selected pre-link stages0/1 and failed in test setup; those logs remain, then
only the corrected stage4 test ran. A final count-only invocation emits the
actual5048 count with active observer evidence. No benchmark was repeated.

Host helper builds PASS with the five inherited SDK dead-code warnings. Its
warning-denying standalone Clippy check retains12 pre-existing unused SDK,
frozen-helper and unchanged discard-witness lints; no new changed-verifier
diagnostic or suppression. Product crates are unchanged. Formatting/boundary/
whitespace and exact parent/staged LOC follow before commit. Fresh stage seal
and affected-case samples remain pending. The prior topology stage's six exact
sample hashes and four portable CSVs are in [its result receipt](checks/topology-mode-stage.json).

Native stage `3856edb82` / `p319n13n` completed nine samples once: the six500MB
development/concurrency rows remain FAIL; the100MB development,100MB
multi-Workspace and compact branch guards have functional PASS/proof PASS and
overall INELIGIBLE. Compact guard remains162/2664/12058 requests/jobs/statements,
exactly unchanged. The two development failures now complete native proof and
time out at Store export; concurrency still stops during native verification.
No duplicate sample or changed ceiling. All removal manifests PASS; originals
removed case-by-case. Missing native-proof request/job/statement intervals remain
UNAVAILABLE; saved numeric groups cover the earlier product graph only.

Retained mixed500MB K10 native duration17.650415667s vs21.644549125s previously
is diagnostic only. Both native receipts retain30298 entries,464192768 checked
bytes and the exact same scope digest. Export starts19.513976875s into its22s
work window, leaving2.486023125s; it stops after2.499498542s. Actual partial
export392527872B is not a verified complete Store. Last pre-Stop snapshot
513077248 logical /513081344 allocated B is not an authenticated finalclosed
inventory; shutdown may alter WAL. Normalization/typed/census proof never begins
in that row. These failures remain active; no supported readback case is retired.

### Base stat repeated inode descent (product)

Cause before editing: each immutable base stat walks the same inode-table path
twice because portable metadata lookup resolves a serial whose exact InodeValue
the caller already holds; the eight-inode fixture makes10 canonical lookups
rather than9 per repeated stat. A new external public BaseView/CanonicalClient
test builds first, then fails10 !=9 before implementation. It keeps identical
metadata/length, zero new upstream demand, unchanged miss/batch totals and zero
remembered file lengths with the explicit owning length port.

Predicted count10 ->9 in that diagnostic; the portable-metadata part's
inode-table descents2H ->H for path heightH (symlink target reading retains its
separate existing descent). LOOKUP can supply two such stats; GETATTR/OPEN
one. No fewer FUSE request, writer-job, statement or SQL-runtime claim is made.
The existing public typed attribute reader accepts the already resolved inode's
metadata root/kind and preserves the same bounded portable metadata validation.
No public API, cache, profile, dependency, retry or observation surface is added.

[Count/check operands](checks/base-stat-inode-reuse.json) confirm10 ->9;
host and Linux each pass base8 and native-visit6 after `--no-run` builds.
Owning Workspace all-target Clippy `-D warnings` PASS on both. Actual core
fuser manifest/lock/authorized package inventory PASS before Linux build;
whole-checker's two inherited passthrough refusals remain. Formatting/boundary
686 PASS and boundary selftests50 PASS. No source field or metadata validation
is removed. New-identity sampling follows the commit; no benchmark speed or
SQLite causal claim is made. The [native-stage result](checks/native-metadata-stage.json)
retains all nine exact receipt identities and six owning-engine CSV publications.

Base-stat stage `c20a2c72e` / `p319n13b` completed all29 planned selections once:
23 family guards have functional PASS and proof PASS (one overall PASS,22
INELIGIBLE); all six500MB affected rows remain FAIL. No tracked source edit
occurred during the clean nine-binary build or sampling. Every payload-removal
manifest is PASS; each original was removed before the next case. Missing
native-proof counters and failed functional/custody fields remain unavailable.

Mixed500MB K10 native proof completed16.804990292s; closed Store export PASS
3.203089542s, with3.409904666s of the unchanged work budget available. The full
raw set is513130496B (main508903424 + WAL4194304 + SHM32768). Normalization
then fails its absolute deadline; no normalized/typed/census PASS is claimed.

### Closed Store duplicate raw read (harness)

Cause before editing: normalization hashes the raw Store set, then reads it
again to copy into independent scratch, later hashing scratch and raw-after.
For the exact513130496B export, a completed operation therefore streams
2052521984B through the Python raw/scratch loops. Predict one raw pass removed:
raw3S ->2S, scratchS unchanged, total4S ->3S =1539391488B; save513130496B.
Raw stream read calls including EOF23502 ->15668 at the existing64KiB window.
The failed sample does not establish that every modeled pass ran to completion.
SQLite backup reads are separate and unprofiled; this is a Python stream count,
not a SQLite or physical I/O speed claim. Hash input3S, independently copied
bytesS, full raw-after tamper detection, helper/schema/receipt bindings, WAL/OFF
backup, absolute deadlines and typed Storage readback all remain required.

The new external real-WAL count test expects raw2S and independently read
scratchS, identical three-file receipts/raw bytes, distinct scratch inode,
unchanged normalized identity and strict three-Commit census. Run it against
the unmodified helper before selecting the fused copy/digest repair.

[External count receipt](checks/normalization-stream-count.json) confirms the
188568B real-WAL fixture's raw read565704 ->377136B (3S ->2S), with independent
scratch188568B unchanged. All38 owning normalization, overlay-storage, history
fixture and closed-storage controller tests PASS, including source/receipt/
output tamper, unexpected-file/symlink refusal, exact profile, deadline and
no-retry checks. The initial command omitted Python module paths and failed to
import; its log is retained separately. The corrected red invocation reached
the expected count assertion before the helper edit. Formatting, boundary686
and boundary selftests50 PASS; no Rust crate changed, so fresh crate Clippy is
inapplicable. [Base-stat stage operands](checks/base-stat-stage.json) retain
all29 receipts and46 owning-engine CSVs. Historical access is proof-only
(sample_count0, one verification attempt); other stage cases sample_count1.
No SQLite speed claim or benchmark PASS follows from this Python count tier.

Normalization stage `a3c324017` / `p319n13c`: all eight actual normalization
family guards have functional PASS/proof PASS (seven INELIGIBLE, historical
access overall PASS). Two500MB development samples still FAIL at raw Store
export before the changed helper; no normalization benefit is attributed to
those samples. Compact branch162/2664/12058, history10/95/445, reuse28/186/981,
size-transition14/181/823 and footprint12/95/443 counts exactly match preceding
guards. Mixed100MB2699/20344/109985 retains a +2 statement variation; multi
aggregate counts remain UNAVAILABLE. Historical access is proof-only.

All10 selections ran once after a clean nine-binary seal; every removal
manifest PASS and originals removed case-by-case. [Stage operands](checks/normalization-stream-stage.json)
retain original receipt hashes and16 portable owning CSVs. Actual call-path
review limits this repair to eight active families/76 cases;166 active cases
do not normalize and reuse their earlier unaffected receipts. The four agent-
episodes mixed cases and twelve direct-export families never call this helper.
Repository_history remains unsampled. Production LOC for this harness cause:
82340 ->82340 (delta+0), exact snapshots with the pinned counter; reference
absent (retired R9c; last counted65,417 at tree498dd1917812).

### Typed proof repeated scratch allocation (harness)

Cause before editing: verify_tree allocates two1MiB scratch buffers for each
regular file, although every file uses the same bounded windows sequentially.
The500MB selected-stage fixture has29984 regular paths;20 exhaustive roots
therefore request1199360 such allocations. Predict40 after one lazy pair per
root; no buffer/window grows. Nominal requested zero initialization falls
628810055680 ->20971520B, not a physical-write/residency claim. The retained
exhaustive500MB proof stops after13/20 typed roots with6032670976B checked;
all20 still require605960 paths and9281233920 checked bytes. No scope is reduced.

A four-file,32-byte-per-file external public-object test predicts8 ->2 exact
1MiB allocation requests. Test-only thread-local System allocation observation
starts after fixture construction, stops before assertions, and has independent
membership-only and tiny FileView negative controls. A final-file tail beyond
two1MiB windows must still fail on corruption. Run the count assertion red
before selecting scratch reuse; this source count is not a benchmark PASS.

[Allocation count/check receipt](checks/typed-scratch-count.json): host and Linux
observe8 ->2 exact1MiB allocation requests, zero reallocations. Membership-only
and tiny public FileView controls independently observe0; the last-file final
short-window corruption is refused at offset2097152. Same6 paths/128 checked
bytes in the count fixture and4 paths/2097215 bytes in the multi-window fixture.
Host full runtime oracle28 PASS in107.74s under118s after --no-run; Linux builds
first, then3 scratch and4 owning oracle tests PASS. No passing test is looped.

Host/Linux all-target runtime Clippy-D warnings retain inherited frozen-fixture
and untouched harness lints; no diagnostic in the changed buffer block or new
allocation observer, and no suppression. A first Clippy command was refused
by the active measurement lock (exit75, never ran); only after tests completed
did the original Clippy execute. Initial count-test build's private LogicalPath
import E0603 is retained and corrected to the existing public reexport. Core
and touched runtime fmt, boundary686 and selftests50 PASS. No product source
changes. README documents the exact retained proof/window behavior.

Call-path review identifies20 active families/226 cases reaching this buffer
region. Historical_access runs membership-only and is unchanged; Init namespace
and footprint use other verifiers, and all12 cells use the mounted Python
oracle. Their unaffected earlier evidence remains separate; phase15 coverage
is still required. New-source seal, exhaustive500MB/100MB samples and one
guard per affected family follow the cause commit, without a raised ceiling.

Scratch stage `9cae8f766` / `p319n13s`: all20 affected family guards have
functional PASS/proof PASS, overall INELIGIBLE. Exhaustive100MB has overall
PASS, functional PASS and proof PASS; exhaustive500MB remains FAIL at275s,
functional unavailable/proof FAIL, despite100 command and100 Commit ACKs.
[Stage operands](checks/typed-scratch-stage.json) retain all22 original hashes
and40 owning CSVs; all payload-removal manifests PASS and originals removed
one at a time. Compact branch162/2664/12058, capped edit8011/8376/101891,
snapshot177581/1403960/6747991, Git5895/7400/45674 and the small controls
match previous counts; unavailable fields remain unavailable.

Large exhaustive retained typed progress improves13 ->14 of the20 required
roots (ordinals5..65 ->5..70),393874 ->424172 paths,6032670976 ->6496863744
checked bytes. Every root has30298 paths and alternates463930624/464192768B.
The typed child retains124.340068250s allowance and stops after124.355175250s;
its last successful root at122.753221375s is not complete proof. The thirteen
common roots complete4.020903167s sooner on the child clock, a diagnostic
comparison only. Exports PASS3.249292958/3.162731375s; normalization returned
complete identities but its isolated duration is unavailable after payload
cleanup. No benchmark-wide speed claim or raised limit.

The host28-test result contained two inherited unqualified recipe child filters
that matched0 tests. Those child exits are NOT_EXECUTED/no proof; the new
scratch assertions ran directly with explicit counts. Each missed branch was
then invoked once by its existing qualified test name and child flag in a
fresh empty owned cwd: native payload/episode1 PASS, Git reference1 PASS.
[Direct-child evidence](checks/ordinary-child-proof.json) records original log
hashes and scoped cleanup. No frozen source changed and no Durable Store ran.
Production LOC for the scratch cause:82340 ->82340 (delta+0); exact snapshots
with pinned counter; reference absent (retired R9c; last counted65,417 at
tree498dd1917812).

### Typed namespace repeated path resolution (harness)

Cause before editing: verify_tree discards five authenticated child bindings
in a six-path/four32-byte-file fixture and resolves their paths again from the
root. Initial source arithmetic predicted78 total; the retained red count
corrects it to20 inode-leaf and12 directory-leaf requests, with47
other role requests unchanged:79 total. The bounded repair queues directories
only, validates each listed name through the existing public point lookup
against that already authenticated parent, then batches child inode reads.
Predict inode20 ->7, directory12 ->7, other47 unchanged:79 ->61 requests.
The point lookup is retained because it checks child level and sibling lower
bounds that listing/grouped lookup omit. No structural refusal may be removed.

Every metadata/alias/length/mapping/byte-range/census check remains, with the
existing128-entry/16384-byte listing and one transient batch. No all-file
InodeValue queue, new cache, raised window, product port or schema is selected.
A forwarding external AuthenticatedObjects counter classifies FinalizedObject
roles before arming and asserts6 paths/128 bytes/four files and61 requests;
retain the red observed histogram before modifying traversal. This is a
canonical request count, not a SQLite, physical I/O or benchmark PASS claim.

Observed count tier:79 ->61 canonical requests/batches, exactly1 filesystem
root, inode20 ->7, directory12 ->7, attribute6, portable FileState/Extent/Chunk
12 each and four WholeFile reads unchanged. Six paths/128 bytes/four files
remain exact. Point validation is preserved on every listed name; the existing
public Inode lookup_many propagates child level/maximum exactly as point lookup.
No production API or validation change is needed. The one-page walk replaces
the old all-path queue with directories only; its new source file is120 lines.
External refusal support is separate, keeping test files below999 lines.

Host full31 tests PASS in108.16s under118s, plus the new missing-serial/provider-
loss/wrong-kind test1 PASS. Linux builds first and passes1 canonical count,
3 scratch,3 namespace refusal and4 original oracle tests. Existing metadata,
alias, mapping, final-tail and public-history tests stay intact. Child-level
fixture explicitly demonstrates that listing alone accepts a wrong-level tree
while point resolution and the repaired oracle reject it.129-file continuation,
symlink success/wrong target, extra/omitted names, logical missing inode and
authenticated provider loss are independently exercised.

All initial compile/setup outcomes remain: guessed root_serial field E0609,
wrong FilesystemRootId reexport E0425, a generated leaf instead of the intended
malformed branch, and a zero-test unqualified filter after moving refusal tests.
Each was corrected from source/output before the corresponding actual check.
The malformed-page correction uses valid filled14-row leaves and an explicitly
encoded wrong-level root. Two new needless-borrow Clippy diagnostics were fixed;
final host/Linux all-target runtime Clippy retain only inherited frozen/untouched
harness lints without suppression. No diagnostic remains in the new walk/tests.
Fresh formatting/boundary/LOC and clean-identity samples follow before acceptance.

### Typed namespace path-limit preservation (harness correction)

Read-only review of31f3467be found one dropped existing check: valid individual
components no longer passed through LogicalPath::new. Thus257 one-byte
components (513B) and18 240-byte components (4337B) could escape the existing
256-component/4096-byte limits. This is an oracle regression, not a reason to
retire these contract checks or add capability. External red test fails with
"whole-path limit must remain required" on the committed implementation.
Restore one existing LogicalPath::new call per delivered path before metadata/
content proof. Predict two malformed fixtures accepted -> zero; canonical
requests remain61 because validation uses no provider.

Observed: host/Linux four namespace refusals PASS including both limit
fixtures; canonical-count1 PASS on each at61 with the unchanged histogram.
Formatting, boundary686 and guard self-tests50 PASS. All-target runtime Clippy
retains inherited frozen/untouched harness diagnostics; no new limit-test or
walk diagnostic. No raised bound, schema, API or dependency. The preceding
p319n13w nine-binary seal completed cleanly but is NOT_RUN for samples after
this review found the refusal gap; it supplies no benchmark acceptance.
Production LOC:82340 ->82340 (delta+0), exact pinned counter; reference absent
(retired R9c; last counted65,417 at tree498dd1917812).

Corrected traversal stage p319n13v at86a785e19 seals all nine binaries cleanly
and samples23 selections once:23 functional PASS/proof PASS,3 overall PASS
(two exhaustive selections plus historical membership),20 INELIGIBLE timing
receipts retained,zero FAIL.21 owning-family guards include historical_access
because traversal also changes membership-only verification.42 portable CSVs
retain only path substitutions with exact original/published hashes.

Exhaustive500MiB completes20/20 typed roots at steps5..100:605960 paths,
9281233920 bytes,100 acknowledged Commits and exact global census. Receipt
proof wall211.763216875s under275s; typed span58.978395334s and child completion
61.354463750s. Provider Store517898240B has unchanged before/after hash.
Wrapper217.4s is a distinct command duration. Preceding9cae8f766 stopped
at14/20 roots under the same allowance; retain that FAIL, do not relabel it.
The100MiB exhaustive control and25000-file snapshot pass both proof fields.
All samples retain known-stop custody, Gone cleanup and manifest PASS before
payload removal; every original removed before the next preparation.
New phase13 work still required: six retained500MiB native-verification
failures, then phase14 slow-case causes and phase15 terminal campaign.
[Stage evidence](checks/typed-traversal-stage.json) pins every receipt.

### Named base fact repeated inode acquisition (product)

Receipt first: six retained500MiB failures still spend their native verification
allowance or reach export without time for complete typed proof. M1 development
K10 native17.650/16.805s in retained stages is diagnostic only; no assertion
that a missing native SQL interval proves dominance. Source cause: Need::Name
receives an authenticated child value, discards it to serial, then stat reacquires
the same immutable root/inode before reading attributes and owning length.
Zero-cache eight-inode external fixture actual red13 canonical IDs: child4 +
stat9. Predict11: child4 + unchanged attributes7, length1 unchanged.
Named symlink15 ->12 using the same existing kind-checked target decoder;
empty regular file13 ->11 with owning zero-length call still1. Alias on already
supplied inode remains4/no further length call. Remove two acquisitions, not
owner jobs or SQLite statements; no SQL/latency claim without scoped evidence.
Red actual external test fails13 versus11 before product edit.

Observed count tier after named-stat edit: regular11 IDs/length1; empty regular
11 IDs/length1 retaining0 bytes; symlink12 IDs/length0 retaining13-byte opaque
target; supplied alias4 IDs/no extra length call. Zero cache bytes/objects/
remembered lengths and no further directory-count scan. Original native owner
visit consumes these facts with0 upstream demands and exact mode/mtime/nlink/
size/cutoff/counts. Host/Linux10 base +6 native-visit tests PASS after no-run.
Workspace all-target Clippy-D warnings PASS on both,fmt/boundary686/selftests50
PASS. No public API, cache, schema, dependency, bounds or SQL job change.

Retain initial green failure Stale from the synthetic non-root parent without
a kernel lookup reference; fixture now acquires that reference through the
original public native Lookup before child visit. Read-only review also caught
the resolved route propagating PathNotFound where original base_inode mapped
it to None. New external error test fails before correction; shared conversion
now retains that exact narrow mapping and propagates MissingObject/other errors.
[Count and error evidence](checks/named-stat-count.json) retains all log hashes.
Production LOC:82340 ->82362 (delta+22), exact first-parent/staged product
snapshots with pinned production_loc counter; reference absent (retired R9c;
last counted65,417 at tree498dd1917812).

Named-stat stage p319n13r at7a4759173 seals all nine binaries cleanly and
samples29 selections once:23 functional PASS/proof PASS guards (one overall
PASS historical_access,22 INELIGIBLE retained timings),six original500MiB
failure selections remain FAIL.46 owning CSVs preserve all failed/not-run rows
and only path substitutions, with original/published hashes. All payloads and
originals removed through their owned claims; no resampling or source edits
during builds/samples.

Mixed500K10 native17.811908542s passes its original native helper with30298
entries/464192768 bytes, but export allowance2.306530875s expires after
2.316013750s and384434176 copied bytes. Typed Storage proof never begins:
whole row FAIL, proof FAIL, functional PASS absent. Its old c-stage native
17.862722375s/export2.324152875s also failed; -0.284 percent native wall change
is diagnostic only. Old b-stage native16.804990292s exported513130496 bytes
in3.203089542s with3.409904666s remaining, then failed normalization. No timing
effect is established by the real13 ->11 source count. Mixed500K100 now fails
at normalization; both500MiB concurrency and branch K10/K100 fail original
verify event wall stops. Every original failure remains its exact verdict.

Six timer failures continue as unresolved slow-proof work; phase13 completion
remains pending. Phase13 does not impose an all-PASS prerequisite before14,
whose explicit Subjects-in-order starts with delete Commit, then500-step
histories, exhaustive500 proof phase split, new-content Commit, C10. Begin
delete's count diagnosis first; leave every failing row unqualified and return
to the shared proof pipeline in the ordered proof subject. No feature/owner
decision is inferred and no ceiling is raised.
[Stage evidence](checks/named-stat-stage.json) pins every receipt.

### Phase14 delete Commit: copied shrinking edge (count diagnosis)

Inherited delete OperationRecord jobs at1/10/100/500MiB are118/361/1426/7200,
versus replace-shrink147/588/629/759. Fresh bounded ordinary request-port
count fixtures reproduce118/361 with namespace producer42 at both sizes,
one reference row/one4096-byte payload cell, and no SQL fullscan/sort/reprepare.
Complete owner jobs131/374 and statements667/1942 remain separate metrics.
The single-file forwarding trace observes55/298 backing calls, difference243;
42 namespace +55/298 file +21 other records exactly accounts for118/361.
Duplicate detached parent GETs0/4 explain only4 of243, not the leading cause.

The actual normalized script is one edit(p,p+8192,4096), not a many-edit
expansion. Shrinking final_size<=base_size skips the existing bounded edge
authentication, leaving4096 copied bytes replacement content. Frozen fixture
bytes prove suffix4096 equal to base[p+4096..p+8192], prefix0. Before product
edit, external test fails the exact expected(p,p+4096,0) after independently
checking every constructed output byte and releasing both fixtures' custody.
Both old work records have normalized_edits1,edge_windows0,retained0,
committed_bytes0: no claim of a materialized4096-byte object. Predict after
changing only the shrink exclusion: normalized1, retained4096, two windows,
16384 logical authenticated source bytes, committed_bytes still0. Keep
netzero/in-place exclusions, two64KiB windows, original signed translation,
all mismatch/error checks and final Storage/live-byte readback. Complete
post-edit job totals must be observed; no invented constant-count prediction.

Post-edit count tier meets the written prediction at both sizes: exact pure
4096-byte delete,normalized1,windows2,logical edge bytes16384,retained4096,
committed_bytes0. File calls55 ->41 and298 ->249; full OperationRecord
jobs118 ->104 and361 ->312; total owner131 ->118 and374 ->326. Namespace
producer42 remains unchanged. SQL executions667 ->596 and1942 ->1712;
VM15029 ->13497 and45433 ->40128, fullscan/sort/reprepare0. Existing indexed
OperationRecord plan+runtime test PASS host/Linux at populations128/1024/4096;
indexed visited rows remain unavailable. No timing/dominance claim from those
counts; fixed-change work still grows and requires the larger receipts/next cause.

Host/Linux Storage mapping7, captured file/piece25, recognized mutation patterns9
PASS. Linux also passes3 diagnostics; host2 exact delete count tests PASS.
Two negative-delta deletions retain correct base mapping at the second edit;
mismatches at both ends remain replacement, one changed copied byte survives
fresh Storage and live readback with exact payload offsets beyond it. Clippy
Workspace+Daemon all-targets-D warnings PASS both;fmt/boundary686/selftests50
PASS. Initial Linux parallel linking signal9 retained, serial-j1 build succeeds.
New external normal/mismatch cases initially shared a directory label and
failed AlreadyExists when simultaneous; unique labels fix fixture isolation,
full target PASS. Own-lock refusals execute no command and remain recorded.
[Count evidence](checks/delete-edge-count.json) preserves red/green log hashes.
Production LOC:82362 ->82362 (delta+0), pinned exact parent/staged counter;
reference absent (retired R9c; last counted65,417 at tree498dd1917812).

Delete stage p319n14e atf3a699c4d seals9 binaries, then35 once-only selections:
all35 functional PASS/proof PASS;1 overall PASS/34 INELIGIBLE retained timing
verdicts. Four delete sizes plus replace-shrink/truncate controls and23-family
guards pass;46 portable CSVs preserve every parsed field except exact local
path substitutions. All original/test payloads removed through owned claims
after manifest PASS; no tracked edit occurred through the last sample.

Delete OperationRecord jobs1/10/100/500MiB118/361/1426/7200 ->104/312/330/376,
namespace producer42 at every size. Source cause removes copied replacement
bytes, selecting existing pure-delete mapping path instead of replacement CDC
and its transient branch custody. Persisted ExtentSlice stores payload ID,
source offset and length; absolute offsets are computed during traversal, so
unchanged suffix nodes can retain IDs. New large counts plateau; exact tuples
are witnessed by external1/10MiB tests, not exposed by namespace31-field
receipts at100/500MiB. Do not invent their tuple or physical hashing counts.
Current Commit spans9.847250/15.334000/15.337916/22.367834ms remain diagnostic,
all timings INELIGIBLE; no qualified speedup from interference.

Actual per-Commit Storage pack-write bytes7413/17706/47089/115270 ->
6797/16840/20115/26776, with4096 reserved directory bytes,one pooled pack/group
unchanged. Whole-Store allocated deltas+12288/0/-49152/-180224B remain raw.
At1MiB main1232896B and SHM32768B unchanged; extra2 WAL frames at Commit,
3 after native proof. Historical serial reservations0; kept readiness repair
93ac3d77b yields1/2/3 across warm/measured/proof mounts, not at Commit. This
correlates with the WAL difference; individual SQL frame attribution is not
proven. Matching command/verifier/oracle scopes and exact final byte counts
qualify work comparison; helper/master seals differ across historical repairs.
Initial-to-final allocation growth and initial extent census unavailable.
Reduced Commit pack writing does not mean every final allocation is improved.
[Stage evidence](checks/delete-edge-stage.json) retains identity/receipt/CSV
hashes. Delete subject closes with counted bounded mapping work and full proof;
next subject500-step histories starts from retained phase12 receipts.

### Phase14 histories: external observer startup (receipt/source diagnosis)

Retained p319n12 five500-step receipts all functional/proof PASS/INELIGIBLE
under210s; original hotset120s FAIL stopped377/500 remains. Their500 step
walls total156.376..170.602s, including1000 pre-/post-Commit root guards
with127.019..127.954s wall,74.66..81.23percent. Hotset step20/400 owner93/93,
OperationRecord69/69,namespace42/42; command40.669459/54.180125ms,Commit
8.030625/12.331292ms,guards277.786209/276.696500ms. One terminal Status,
not500; no demonstrated history-depth product growth. Existing SQL profile
nested observations do not establish indexed plans or SQL cause; no such claim.

Source performs500 ordinary SDK commands and500 public Commits, separately
1000 root DockerCLI observations. Preserve exact pre/post stat of protected
Store and actual same-container cgroup,4GiB bounds,OOM baseline/zero swap,
absolute guard/stage deadlines,observer exclusion and all original failures.
Ordinary product Exec cannot replace root stat: admitted nonroot identity and
Store0700 already at25c; changing either would need forbidden capability.
Instead replace only controller DockerCLI transport with same existing root
Engine Exec create/start/inspect, Pythonstdlib, real bounded host child receipt.
Predicted guard DockerCLI processes1000 ->0, root Engine Execs/observations
1000 unchanged, workload SDKExec500/Commit500/terminalStatus1 unchanged.
Source/product APIs,control variants,options,schema,observations,dependencies
and limits unchanged; no persistent helper/background lane or operation replay.
External mock guard first must fail1 DockerCLI launch versus expected0 while
retaining exact5 values and append-only successful original completion.

Guard count tier after replacement:0 DockerCLI launches/one real Python host
child, same five values and PASS original attempt1. ScriptSHA22175c00865dd7386dd95d66bf04a7871bcc02a63d26c9e975b60a76f616e966
unchanged; private fakeEngine exactroot/container/body andthree requests.
Nine protocol/count controls PASS:read-ahead,byte fragmentation,empty/interleaved
frames,huge claimed length with bounded windows,truncation/systemerror,wrong
identity/running/unavailable/nonzero/bool exit,duplicate JSON,slowheaders at
all3stages,partial andshortoutput writes. No retry/inspectafterfailure.
Real child PID andexistingreceipt schema preserved; remoteack retainedstderr
onfailure,cancellation notestablished. Helper usesone deadline across3exchanges;
outerunchangedparentwall also coversPythonstartup. No productroot Exec bypass.

Fullenginecheck initially omitted worker env (3FAIL/18ERROR); correctedenv
thenexposed3 missing fixture variables. Pinnednativehelpers check reports323 tests,3skips,2configerrors: sealedbuild admission refuses dirtysource and
M1_WORKLOAD_TEST_WRITER unset. These are retained, not a fullsuitePASS. Native
writer compiledinputs are unchanged; aftercommit/newcleanseal run covering
enginecheck withallfixtures. Newtransport9PASS plusfmt/boundary686/selftests50
PASS; noRustcrate changed,ClippyN/A forprivatePythontransport. Inherited
RuntimeClippy refusals remain their originalqualification.
[Count evidence](checks/history-guard-count.json) pins the logs andold step
operands. Production LOC:82362 ->82362 (delta+0), exactfirstparent/staged
pinnedcounter; reference absent (retired R9c; last counted65,417 at tree498dd1917812).
