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
