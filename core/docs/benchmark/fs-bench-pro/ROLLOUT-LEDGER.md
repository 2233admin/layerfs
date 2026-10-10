# fs-bench-pro first-iteration rollout ledger

> **Status:** Dated planning checkpoint; no release evidence or product contract.

Started 2026-10-10 on local `main` at `84323b47a`. The
[implementation spec](implementation-spec.md) governs this run together with
the owner's handoff and the repository measurement policies. This iteration
records function, time, storage, counts and cleanup; it makes no speed,
comparison or release-admission claim. Durable is
`NOT_RUN — disabled by owner until explicit reauthorization`.

## Stages and batches

| Stage | Status | Commits | Next step |
| --- | --- | --- | --- |
| Handoff specification | COMPLETE | `3c32fbc97` | Harvest released references |
| 0.1 Released references | COMPLETE | `8e4a78fa0` | Stage 0.2 move-only organization |
| 0.2 Move-only organization | COMPLETE, historical check failures retained | `13f9dec38`; routing `9af29e01e` | Update routing guide, then stage 0.3 catalogue |
| 0.3 Case catalogue | COMPLETE | `f182e9a63`; prerequisite correction `30b798192` | Stage 0.4 reproducible engine |
| 0.4 Reproducible engine | CLOSED: functional proof complete; exact reproduction FAILED C10/C12 | Cell-route correction `bb8e07df8`; build support `c496025fc`; oracle support `7a27a4f26`; fixture support `516c2f009`; workspace/report support `358eca082`; cleanup-observer correction `a1f2c259c` | Begin batch 1 under failed-reproduction closure recorded below |
| 1 Pilot | COMPLETE: 36 functional/proof/clean-close passes; 7 numeric PASS, 29 INELIGIBLE | Init `c1d7dd0e8`/`39bbcbd6b`; payload `200f81493`/`c1d9b6c58`; parallel routing `b3c96ecb1`; tiny `36849bcc2`/`d6e0ef952`; namespace `98b14b233`/`be1f56a23`; H-2 fix `222526fa0`; closure `d4314ed62`; membership supplement `cca598d0b` | Batch 2, retaining original receipts plus exhaustive membership supplement |
| 2 Edits | IN_PROGRESS: canonical 12 and preserving 12 closed; capped 5 closed (2 functional passes, 3 watchdog failures); changing 32 closed (12 strict passes, 20 retention failures); small-delta authoring | Model `e2840c270`; writer `8dd9d99a8`; graph `37ec6826b`; cache `98b6b7260`; routing `ac7beb4dd`; seal/audit `cca598d0b`; reuse `849b0aff1`; canonical `a34b5d44b` / this commit | Integrate the two completed workers, finish changing and small-delta; no batch 3 |
| 3 Trees and tools | PENDING | — | Wait for batch 2 completion |
| 4 History on one branch | PENDING | — | Wait for batch 3 completion |
| 5 Branches and Workspaces | PENDING | — | Wait for batch 4; verify existing P-1 SDK methods |
| 6 Dedup and storage | PENDING | — | Wait for batch 5 completion |
| 7 Reliability | PENDING | — | Wait for batch 6 completion |

## Decisions

| Number | What | Why | Alternative |
| --- | --- | --- | --- |
| 1 | Commit the supplied spec and README addition unchanged before implementation; include this initial ledger | Explicit handoff; the ledger accompanies the work it describes | Editing the proposal before preserving its handed-over identity |
| 2 | Treat timing limits as reported soft limits for this iteration; retain independent watchdogs and verifier limits | Owner explicitly says slow completed cases are not failures; a watchdog expiry is still a hang/failure and is never enlarged after a miss | Judging latency or removing a watchdog |
| 3 | Preserve cache eligibility separately from functional observations; unknown preconditions yield INELIGIBLE | Measurement rules remain binding; functional completion cannot invent cold eligibility | Claiming PASS for unknown cache state |
| 4 | Create no additional family under P-6 and make no GitHub changes under P-7 | Explicit handoff scope supersedes proposal recommendations | Adding per-call families or closing issues |
| 5 | Use `Co-Authored-By: Codex <noreply@openai.com>` for this session's commits | This is a Codex session; no other attribution line was supplied in its instructions | Copying the prior agent's attribution |

| 6 | Correct section 8 to state the verification source has 227 total rows (28 reliability); preserve original seconds beside labelled decimal-to-ns conversion | Source CSV and its generator agree on 227; the handoff requires every row | Harvesting only the 28 reliability rows or inventing precision |

| 7 | Specify supporting-file destinations and permit path-only root/manifest/asset adjustments; retain historical source-gated tests | Section 4 omitted `r7-tools`, shared files and the old runner; depth changes require more than import text; old tests name retired product drivers | Inventing silent destinations or restoring retired product source |

| 8 | Correct P-1 and reuse existing public ProjectApi fork/history; record the ForkSource::Commit route for P-2 | Source at handed-over product tree already exports both methods and validates ancestor membership; duplication would add no capability | Adding duplicate SDK methods or bypassing the SDK with wire requests |

| 9 | Catalogue all 273 original IDs as pending; leave execution fields explicitly unset until each family is ported | The root contains 269 Rust registrations plus three repository-history profiles and one small-file-delta case; release rows are not the complete registry | Dropping unreleased/proof/extended cases or inventing runnable definitions |
| 10 | Resolve the original Rust registry using a std-only metadata exporter; read both Python wrapper registries separately | Root SDK cannot build after retirement, while its product-neutral workload definitions compile without product dependencies | Restoring retired crates or guessing formatted IDs from text |

| 11 | Route stage 0.4 through `bench.py run cluster-two/cells` and put its generated CSVs in cluster-two baselines | The spec requires the twelve existing cells through bench.py but only named family execution; separate subjects must remain separate | Treating cells as a 26th workload family or adding a second entry point |

| 12 | A source identity reports the protected untracked handoff but excludes it from compilation; refuse all other untracked source and tracked dirt | The owner requires that prompt remain untracked; it supplies no product, harness or workload bytes | Staging it or pretending an arbitrary untracked executable is clean |
| 13 | Preserve OWNER-3 checker failures as FAIL records and admit a build only when the exact two known passthrough refusals are the entire error set | Owner explicitly retains those refusals; daemon builds use the authorized product patch, while any new provenance error must stop | Weakening the checker or claiming its aggregate PASS |

| 14 | Reuse the intact cell tree/index checkers and the recovered version-pinned Git policy; collect actual image Git/config witnesses anew | Preserves the original full-tree and index exclusions/checks; copied policy plus provenance removes its untracked data dependency | Guessing defaults, comparing raw native/FUSE index stat caches, or weakening tree checks |

| 15 | Rebuild empty and full-written 64 MiB-zero masters through the existing SDK provision mode; retain prepared masters during the rollout and remove only passing sample resources | Same initial acquisition/install boundary as the working path; setup masters are needed for independent byte-copy reuse | Mounting a master for measurement or depending on old /tmp trees/master volumes |

| 16 | Freeze the twelve original B:L cells, enforce class B using actual demand counters and original terminal cleanup, generate all twelve result rows | Stage 0.4 requires exact count reproduction through bench.py; unavailable evidence stays unavailable and soft limits remain separate | Sampling pending workload families before the engine proof or filling absent measurements with zeros |

| 17 | Close stage 0.4 exact reproduction as FAILED for C10/C12, preserve strict checker/results, amend only the stage closure in its own spec commit and continue | All twelve functional proofs/terminal unmounts pass at clean identities with identical daemon/product; kernel batching and conditional reclamation probes prevent a semantic equality claim; handoff explicitly permits source-backed spec correction | Resampling unchanged cases, injecting requests/probes, altering workloads or pretending exact equality passed |

| 18 | Port the actual frozen Init-only infra route and original deterministic bytes/sample set; use current public Init and existing public read APIs | `src/infra.rs` selects namespace_init_diagnostic, not the older auxiliary edit/Commit function; sampled prefixes/metadata/reopen root match the selected verifier | Timing a different historical function or omitting undeclared auxiliary mutations |
| 19 | Init preparation creates only native inputs; every measured Init gets a fresh Store. Label setup warmth and unavailable host cold metadata as INELIGIBLE | Initial full acquisition must remain measured; preparing/cloning an already initialized Store would remove its product work; unknown coldness cannot receive PASS | Cloning a Store for an initialization case or claiming coldness from file generation |
| 20 | Reuse original product-neutral Rust planner/stream/digest definitions and compile native-only fixture/verifier tools | Guarantees original names, modes, mtime, count/byte allocation and exact content digest without restoring retired product code | Guessing fixtures or building the retired SDK |

| 21 | Reuse unchanged original product-neutral syscall program for payload work; fully check fresh mounted and persisted current-format roots | Exact generated bytes/read offsets/normalization/fsync requests remain in the frozen program; current public readers validate current representation and complete declared semantic tree outside timers | Transcribing random offsets by guess, weakening byte checks or interpreting retired encodings as current |
| 22 | Export only the new stopped sample Store for an independent offline oracle; current daemon remains the complete live data path | Closed export permits independent current Content/Storage/History reads without a host/server serving route or second constructor; root is tied to the original typed Commit reply | Reading a live WAL inconsistently or making the host a runtime data adapter |
| 23 | Copy generic original verification 45 s work / 59 s hard limits, preserve 15 s reported product limit and original 120 s operation watchdog | The frozen selected-verification policy declares these values; separate timers/topology are recorded as differences before any payload sample | Widening a limit after a miss or shrinking payload tiers |
| 24 | Owner-authorized subagents use separate new worktrees for tiny_file_churn and namespace_mutation while the lead samples payload_create_read; all remain in batch 1 | Latest owner instruction explicitly requests concurrent families in worktrees and supersedes the earlier no-extra-worktree restriction; independent worktree locks/targets retain local serialization | Serial family authoring or starting a later batch |
| 25 | Integrate worker changes locally onto main; keep engine, product fixes and the master ledger under the lead; record shared Docker VM interference in each source receipt through LAYERFS_BENCH_INTERFERENCE | Isolated family edits avoid conflicts; parallel samples share host/VM resources and cannot claim isolated timing; original workloads/cache/limits remain fixed | Multiple owners editing the engine, hiding interference, or pushing worker branches |
| 26 | Correct port_review.source_commit to the peeled reference commit and preserve the annotated tag object as source_tag_object; require both exact objects in parity | The annotated recovery tag is ae3310f..., while its source commit is d296981...; reviewed source bytes remain identical and old receipts remain valid at their actual source | Keeping a misleading commit label, deleting the tag pin, or replaying unchanged samples |

| 27 | Reuse a validated closed sibling master for an exactly matching complete initial tree, product, UID/GID and Disposable profile; keep expected/helper trees case-specific and sample byte clones independent | Setup reuse policy requires compatible sealed inputs; the changing family has six unique initial sizes despite 32 cases | Duplicate Init/install for the same input, reusing a mutated sample, or claiming coldness |

| 28 | Canonical preparation references the preserving worker's four immutable closed masters through explicit prepared-parent links, then validates the complete original seals and exact semantic fixture digest | Identical initial trees and unchanged product make those setup masters compatible; all 12 canonical expectations/helpers remain new and sample byte copies independent | Duplicate Init/install or borrowing a previously measured sample |

## Bugs

| Bug | Case | Symptom | Cause | Fix commit | External test |
| --- | --- | --- | --- | --- | --- |
| H-1 | C07 | Workload and verifier passed, unmount returned, residency helper refused changed file identity | Harness inspected overlay while automatic post-unmount reclamation was still mutating backing | `a1f2c259c` | `test_backing_observer_waits_for_original_reclamation_to_finish` |

| H-3 | Generic mounted pilot proofs and prospective SDK proofs | Reachable path walk omitted exhaustive inode-table membership from original canonical verifier | Runtime compared declared paths/bytes but never enumerated current inode table | `37ec6826b` | edit_oracle_complete_membership_accepts_exact_and_rejects_unreachable_or_missing_rows |
| H-4 | Prospective B/C Commit eligibility | Zero source demands could credit own-written backing without independent pre-Commit coldness | Cache classifier checked source demand/lifetime but not own-written phase inputs | `98b6b7260` | test_zero_source_demands_cannot_credit_own_written_commit_input |
| H-2 | 36 batch-1 reviewed registrations | source_commit was an annotated tag object; parity accepted it and rejected the actual peeled commit | git rev-parse on an annotated reference returns the tag object unless peeled | `222526fa0` | test_review_identity.py rejects the tag through both parity routes, admits the peeled commit and checks every ported review |

H-1 and H-2 are harness faults, not product correctness or performance defects.
The original file-identity checker remains intact; no product source changed.

## Failed, ineligible, not-applicable and unrun cases

At `358eca082`, C01–C06 passed with exact baseline request/owner-job/statement
counts, independent verifier PASS, automatic cleanup Gone and known Stop. C07
failed on H-1 after successful command, verifier and unmount. C08–C12 remain
NOT_RUN in this source's two generated CSVs. All 273 workload cases remain
pending; this checkpoint closes none of them. Corrected-source sampling covers
C07 and the remaining five cells only; unaffected successful cells are retained,
not re-sampled.

## Checks and source size

Handoff commit: documentation-only; checked whitespace and the new spec's
local links. Rust/runtime checks do not cover this documentation change.
Production LOC is counted before each commit with the pinned
`count_absent_aware.py staged` and confirmed against the committed tree.
Initial active core: 79,366. Reference absent (retired R9c; last counted
65,417 at tree `498dd1917812`).

## Resource custody

New immutable masters retained for setup reuse:
`layerfs-fsb-master-empty-ee794ff64e0a4bcb` and
`layerfs-fsb-master-big64m-c60eb32e5145496b`. Passing build, provision, native
oracle, byte-copy and C01–C06 sample containers have been removed; their exact
names and acknowledged removal are in raw receipts. Passing sample volumes
also removed.

H-1 failed resources retained: running container
`3b5974a094800d78dc72648dbeb08c75cdea933957ed188891a812bb7cad6483`, sample volume
`layerfs-fsb-sample-09fa81ddc18a4c0c`. No mounted key remained at the failure;
known Stop and physical cleanup were not established. Host runtime group was
fenced once with original-cause custody retained, not interpreted as Docker
Stop. Read-only inspection confirms the original container still running.

Protected handoff scripts,
prepared inputs, master volumes, running containers, merged worktrees and the
untracked `PROMPT-R8-R9-NEXT-AGENT-20261010.md` remain untouched.

Specification correction commit: docs-only; source rows counted directly and
whitespace checked. Production LOC 79,366 -> 79,366 (delta +0), same pinned
absent-aware method. Handoff spec/README tree preserved at `3c32fbc97`.

Stage 0.1: harvested 461 rows, preserving original fields and source hashes.
Scoped reference tests run under the checkout lock with a 120 s wall stop.
No benchmark invocation; no container/volume created. Harness/docs-only
production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware method.

Stage 0.2 specification clarification is docs-only. It does not permit an
expectation change or weakening a checker. Production LOC 79,366 -> 79,366
(delta +0); pinned absent-aware method.

Stage 0.2 relocated 316 tracked files into the specified subjects. Supporting
paths follow decision 7. All 14 moved JSON registrations and Cargo lockfiles
are byte-identical to their first-parent versions; active product and frozen
root definitions are unchanged. `git diff --check` and Python syntax pass.
Raw check outputs, including every failed intermediate path check, are retained
under `benchmark-results/fs-bench-pro/2026-10-10-stage-0-2-checks/`, with a hash
manifest and the complete move map. No workload sample or Docker resource was
created. No assertion, verifier, threshold or registration was weakened.

The final affected checks are: cell suite 300 passing tests plus the three
Git-index helper tests after their import correction; 65 proof tests; cache
suite 10 passing and two existing Linux-only skips; 44 evidence registration
tests; five retired writer registry tests; 19 isolation tests; 14 fuser guard
self-tests; two storage-content Rust registry tests. Both runtime and
storage-content `cargo +1.85.1 test --locked --all-targets --no-run` builds pass
using the repository ARM64 flags, `core/target`, construction workers 1 and
120 s locked wall stops. Other affected shell/mutation checks are in the raw
outputs. No command reached its wall stop; the slowest Python check was the
retired Workspace collection (87.719 s).

Historical failures retained, with their assertions unchanged:

- `test_phase7` expects the old `Handles::create` timer seam in the current
  Project example; that seam is absent in unchanged product source.
- `test_phase7_history_vehicle` expects two old textual reference seams and an
  old verifier failure order/profile. All three checks fail on current source;
  its first assertion stops before its later Durable argument can execute.
  Do not run this historical MEMORY/Durable selection again.
- `test_substrate` expects the retired host-mediated runner to dispatch/build;
  the actual retirement guard refuses it before resources are acquired.
  Four errors remain in its final selected check; no restored Server route.
- Storage-content's two source-scan assertions reject `sync_all` in native
  global Store installation and the FUSE `fsync` callback name in unchanged
  product source. Their frozen scanner is retained. This is not an observation
  of an fsync on Disposable Workspace backing.
- Fuser integrity keeps OWNER-3's two passthrough refusals at its relocated
  manifest/lock. The checker only changes the approved platform manifest path;
  no third-party bytes or allowlist policy change.

The old cold-native test needed its declared `target/phase7-agent` scratch
parent, which was prepared without editing the test or running a Store. Its
six selected tests then passed. These historical checks are not new workload
verdicts. Applicable relocation checks pass; unavailable/stale contracts remain
visible and do not authorize a retired route.

Stage 0.2 Production LOC: 79,366 -> 79,366 (delta +0), active core only;
reference absent (retired R9c; last counted 65,417 at `498dd1917812`). Method:
pinned absent-aware parent/staged archive counter. No speed claim.

Routing follow-up: update the current harness guide and add its README to
point to moved subjects and this rollout. Local links and whitespace checked.
Documentation-only; Production LOC 79,366 -> 79,366 (delta +0), pinned
absent-aware method. No runtime check or workload sample repeated.

P-1/P-2 source correction: source checked in `project/history.rs`,
`project/mod.rs`, Workspace binding, Persistence History fork, and the existing
`mounted_cycles` ancestor-fork test. No product execution or capability proof
was repeated. Public native route is verified when batch 5 is reached. This
specification-only commit keeps Production LOC 79,366 -> 79,366 (delta +0),
pinned absent-aware method. Catalogue work remains unstaged for its own commit.

Stage 0.3: `bench.py list` reports exactly 25 families and 273 unique case IDs,
all pending. This includes inherited, proof-only, capped and extended IDs.
Forty-seven exact IDs have no released timing; every one is listed in
`baselines/v0.1.6/missing.md`. No 26th family was found in the root directories,
Rust registries, SDK edit registries or Python wrappers; storage-smoke aliases
remain profiles of existing families. No P-6 family was added.

The original std-only workload module supplied 269 registrations; the original
repository-history registry supplied three more and small-file-delta its one.
The exporter includes harness definitions only and invokes no product, fixture,
workload or verifier. It was compiled with toolchain 1.85.1 and the ARM64 flags
under a 120 s checkout lock. Three owning catalogue tests pass in 4.843 s,
including mechanical membership against the compiled original registry and the
Python wrapper registry, and the product-free CLI. No workload case sampled.
Raw catalogue/check evidence is retained under
`benchmark-results/fs-bench-pro/2026-10-10-stage-0-3-catalogue/`.

P-2 source check: direct SDK bind selects the Branch's coherent current
snapshot. Existing public `ProjectApi::fork` can use `ForkSource::Commit`;
Persistence validates ancestry and returns the selected Commit root. The
existing native mounted-cycle source tests demonstrate the related-root
composition. Its actual SDK/mounted verification belongs to batch 5; an extra
Branch must be declared as a difference in historical-access ports. No missing
feature or not-applicable verdict is invented at the catalogue stage.

Stage 0.3 Production LOC: 79,366 -> 79,366 (delta +0); active core only,
reference absent (retired R9c; last counted 65,417 at `498dd1917812`), pinned
absent-aware parent/staged archive method. Engine execution is not implemented
or claimed by this catalogue. Containers/volumes created: none.

## Production LOC by commit

All comparisons use the same pinned absent-aware counter over exact first-parent
and committed snapshots; active core only, reference absent as recorded above.

| Commit | Purpose | Before | After | Signed delta |
| --- | --- | ---: | ---: | ---: |
| `3c32fbc97` | Preserve handoff and initialize ledger | 79366 | 79366 | +0 |
| `d5d33a73b` | Correct verification-source count/units | 79366 | 79366 | +0 |
| `8e4a78fa0` | Stage 0.1 reference harvest | 79366 | 79366 | +0 |
| `abcfad75c` | Clarify supporting-file relocation | 79366 | 79366 | +0 |
| `13f9dec38` | Stage 0.2 move-only reorganization | 79366 | 79366 | +0 |
| `9af29e01e` | Current routing guide | 79366 | 79366 | +0 |
| `30b798192` | Correct existing SDK History methods | 79366 | 79366 | +0 |
| `f182e9a63` | Stage 0.3 case catalogue | 79366 | 79366 | +0 |
| `bb8e07df8` | Define separate cell execution/report route | 79366 | 79366 | +0 |
| `c496025fc` | Stage 0.4 build and receipt custody support | 79366 | 79366 | +0 |
| `7a27a4f26` | Stage 0.4 independent tree/index oracle | 79366 | 79366 | +0 |
| `516c2f009` | Stage 0.4 fixture provisioning and clone support | 79366 | 79366 | +0 |

Stage 0.4 entry-point clarification: docs-only; no sample or product change.
Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware method.

Stage 0.4 build support: `bench.py build` now drives one locked/offline host
release build and one daemon release build in the pinned image. It checks host
source hashes inside the Linux container before and after Cargo; checks host
source equality; retains exact binary hashes in immutable archives; and records
worktree-local incremental cache reuse. A failed/unknown build container is
retained. Passing build containers alone are removed. Source admission and
receipts have seven passing scoped tests (three identity, four custody) under
120 s checkout-locked invocations. The CLI help and whitespace pass.
Raw tests: `benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-build-tests/`.
No new release build, preparation, container, volume or measurement has been
attempted by this step; execution waits for the committed engine inputs.
Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware method.

Stage 0.4 oracle support reuses the original cell tree comparison, hard-link
classes and semantic Git index/TREE/checksum checker without editing them.
Expected state is built on an independent native root outside every timer;
observations and comparisons are append-only. All ordinary cell payload bytes
are hashed. The original timing-cell inode/time exclusions stay explicit;
C12 retains its exact scoped index stat-cache exclusions and checks actual
Git binary, version, config and effective values through the existing query
collector. Paired pin witnesses follow that collector's existing same-context
rule; actual independent witnesses remain in each observation.

The recovered C12 Git policy and a source/provenance record are now committed
under engine recipes; runtime reads these committed files, not their historical
`/tmp` origins. Their version-pinned primary-source hashes/review receipt remain
unchanged. This reuses policy evidence only, never a measurement or a native
control arm. Three scoped external oracle tests pass in 0.047 s: exact bytes,
namespace/hard-link mismatch and tampered evidence refusal. Raw checks are under
`benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-oracle-tests/`.
No Store, mount, Docker resource or measured case was invoked. Fixture preparation
and mounted execution remain next. Production LOC 79,366 -> 79,366 (delta +0),
pinned absent-aware method.

Stage 0.4 fixture support adds `bench.py prepare empty|big64m --build <seal>`.
Committed generators write independent native roots with fixed modes/mtime and
seed, then the existing release runtime calls public ProjectApi Init/seal/install
once. No second encoder, Store API or data route is added. Native expected states
are built once from original C-cell commands in separate pinned-image containers.
Prepared data, helper hashes, native oracles, Store bytes and manifest are sealed
under gitignored result paths. Nothing reads the old prepared /tmp trees or old
master volumes at runtime. Source/provenance labels alone refer to history.

Samples get fresh named volumes and full writable byte copies with reflinks and
sparse-copy substitution disabled; compare/SHA-256 bind each clone to its closed
master. Clone warmth is declared and is not cold eligibility. Resource claims
precede creation; failed/unknown containers/volumes are retained. Passing copy,
provision and native-author containers alone are removed. New master volumes
remain immutable setup inputs until the rollout no longer needs them, when their
explicit owned disposition is recorded.

Four scoped fixture tests pass in 0.016 s (the recorded wall in the raw log),
covering deterministic identity/exclusive outputs, exact cell membership,
failed clone custody and all copied helper hashes. CLI help and whitespace pass.
Raw checks: `benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-fixture-tests/`.
No actual build, Store, Docker resource, prepare or sample has run in this step.
Workspace execution/cache enforcement and CSV reporting remain to implement.
Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware method.

Stage 0.4 workspace/report support adds one-shot cell execution through the
existing SDK runtime, original command bodies, independent native tree/index
oracles, terminal unmount plus observed automatic cleanup and known Stop.
Raw numeric telemetry is correlated with original control identities and priced
using the unchanged matrix helpers; exact totals are checked against the pinned
closed baseline (SHA-256 `a6ada570050f14bb6ff5bd61c74c0d0fda439f323f695fdea1212b26b590d3f8`).
Class B requires fresh measured mount, successful untimed warm terminal cleanup
and actual zero immutable object demands. Residency observation, setup, cleanup
and Stop are separate from the matrix performance clock. No cold claim is made.

`run cluster-two/cells --case Cxx` appends a fresh case to a source-fixed run
registration; the original claim refuses unchanged re-sampling. `verify`
compares retained independent observations without replaying product work.
`report` exclusively generates both exact section 6.1 CSV schemas with all
registered cases, raw ns/bytes/counts, original failure reasons and UNAVAILABLE
for missing values. A completed EXCEEDED row remains functionally PASS.

Twenty-one scoped engine tests pass at final source in 0.275 s under the 120 s
lock. The first invocation exposed macOS temporary-path aliasing in the new
receipt finalizer; resolving the comparison root fixed it without changing the
original failure or assertions. Both logs are retained under
`benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-workspace-tests/`.
CLI help/whitespace pass. No Store, mount or Docker resource has yet run.
Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware method.

| `358eca082` | Stage 0.4 workspace/cache/CSV support | 79366 | 79366 | +0 |

Stage 0.4 actual build/prepare: host and pinned-image Linux release builds pass,
with in-container source hashes checked before/after Cargo. Binary hashes match
the retained working path: runtime `fdd962b7258903252bf097cd1be22f8acd56d3047369d08b68affe4c491d0573`,
daemon `f44900cfc975901b7101f4874f708390b6f7401981e06d608b3df52a50848c0e`.
Exact OWNER-3 passthrough refusals remain recorded as FAIL; no checker success
claimed. Both fresh recipes provisioned through public Init/seal/install and
built independent native expectations for all twelve cells. Existing masters,
/tmp inputs and containers were untouched. Raw build/preparation paths:
`benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-build/` and
`benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-prepared/`.

Original C01–C07 receipts are under
`benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-cells-358eca082/`; generated
CSV files preserve six PASS, one FAIL and five NOT_RUN rows. No measured limit
exceeded among these seven observations. H-1 moves the same unmodified backing
observer after read-only original cleanup observations reach Gone, still outside
product time. It changes no workload, timer limit, cache class or demand-counter
eligibility. Twenty-two scoped engine tests pass at corrected final source;
raw checks are in `benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-cache-order-tests/`.
No product change or product check is claimed. Remaining cells run only after
this harness correction is committed. Production LOC 79,366 -> 79,366 (delta +0).

| `a1f2c259c` | Fix H-1 and preserve first cell run results | 79366 | 79366 | +0 |

Stage 0.4 corrected-source run: C07–C09 and C11 pass with identical baseline
counts, independent verifier PASS, cleanup Gone and known Stop. C10 and C12
complete all functional/cleanup checks but fail the unchanged exact count
comparison. No latency limit exceeded. C10 observed 1,547 requests / 1,546 owner
jobs / 14,406 statements versus 1,548 / 1,547 / 14,408. Its entire opcode delta
is one READ (512 versus 513); the corresponding one Workspace and one Inode
SQL execution account for both SQL deltas. Historical C10 receipts already
show both 512 and 513 READ counts across product identities; they are evidence,
not re-used measurements. The exact current daemon binary and product tree are
the same as the frozen baseline. An exact kernel-request partition is not
specified by the ordinary `cp` workload. The observed kernel is 6.12.76-linuxkit;
[the corresponding upstream stable FUSE source](https://raw.githubusercontent.com/gregkh/linux/v6.12.76/fs/fuse/file.c)
constructs asynchronous READ batches from the readahead window and congestion
state (`fuse_readahead`, `fuse_send_readpages`). Request partition variation is
an inference supported by that path and the observed READ-only delta; no
per-request length trace exists to identify the exact split. Do not claim an
EOF request or a proven individual kernel scheduling event.

C12 observed 3,436 / 3,439 / 24,145 versus 3,436 / 3,439 / 24,146. Opcodes and
job-class counts are identical. The sole difference is an Inode-family query
with 164 SQL bytes, 16 bound bytes, zero returned/changed rows and 12 VM steps.
Source identifies exactly that SQL text in
`core/crates/layerfs-overlay/src/lifetime/orphan.rs:50`: the `gen=-1` orphan-inode
probe. It is conditional on the live engine's `orphan_seen`; last-owner
reclamation resets the flag after deleting orphan rows. Git rename/unlink and
reclamation can interleave, so exact aggregate probe count is not a workload
semantic invariant. Exact event attribution cannot be reconstructed from the
bounded aggregates; this remains an explicitly labelled cause inference.
There is no wrong byte, refused successful operation, leaked mount or crash in
these two samples, and no authorized product correctness fix identified.

Raw source-pinned arithmetic/provenance:
`benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-count-diagnostics/diagnostic.json`.
Raw corrected run: `benchmark-results/fs-bench-pro/2026-10-10-stage-0-4-cells-a1f2c259c/`.
Generated CSVs retain four PASS, two exact-count FAIL and six NOT_RUN rows for
this identity. Independent retained verification confirms all six sampled
case observations PASS; CLI completeness returns 1 because the other six
registered cases are NOT_RUN at this identity, as intended. Earlier C01–C06
functional/count receipts remain unaffected and are not repeated. Overall ten
of twelve exact triples reproduced; twelve functional workloads verified.
The strict stage 0.4 target has not been met and is not claimed as met.

C10/C12 stopped failure containers and sample volumes are retained and named in
their receipts; their exact IDs are included below. Passing C07–C09/C11 sample
resources have been removed. H-1's original running container/volume remain.
Production LOC 79,366 -> 79,366 (delta +0); docs/results only, same pinned method.

| `23ba793ef` | Preserve remaining twelve-cell outcomes and count diagnosis | 79366 | 79366 | +0 |

Retained C10: container `96dd83a9e8ea10ad2e7a50aa3e4e2dd8d970509a22435c146569f20a16b8d200`, volume `layerfs-fsb-sample-070f622942e64f72`, acknowledged `KNOWN_STOP`.

Retained C12: container `6a122c4664d39141006eabc62c538060796dbb1da57579e4beeb8495a5f2b0f5`, volume `layerfs-fsb-sample-bc7e58da1e4b4068`, acknowledged `KNOWN_STOP`.

Stage 0.4 closure correction: the original exact-count target did not work for
C10/C12 and is truthfully closed FAILED, not satisfied or silently relaxed.
The unchanged checker still records FAIL for both original comparisons. Spec
section 9 now allows this explicit failed closure when functional proofs and
terminal cleanup are established and no product correctness bug is identified.
This follows the handoff's instruction to correct an unworkable spec in its
own commit, decide without owner questions and continue. All twelve cells were
attempted at clean source; the H-1 affected case alone received a changed-source
sample. No arbitrary tolerance, acceptance threshold, product optimization or
extra family was added. Numeric kernel partition/probe attribution remains
limited to the source-backed aggregate inferences above. Stage 0.4 independent
verification is complete for all twelve sampled workloads, with retained
per-case proof receipts; no speed or repeatability claim is made.

Scope of this commit: spec and ledger only. Whitespace/local links checked;
no build/test/Store/mount invocation. Production LOC 79,366 -> 79,366 (delta +0)
with the pinned absent-aware counter. Batch 1 is next, one family at a time.

| `1a8375dbe` | Correct stage closure while preserving reproduction FAIL | 79366 | 79366 | +0 |

Batch 1 / init_namespace implementation: four cases now have frozen ported
registrations and product-neutral workload.sh. Fixture generation transcribes
only the native create_namespace_fixture write loop and calls the frozen
std-only planner/content stream/metadata/tree digest. Preparation mechanically
compares the generated native tree with the original full native namespace
verifier (count, bytes, complete content digest). Parity binds original registry,
reviewed source hashes/commit, fixture equality, ordered Init operation and
original sampled verifier coverage. No preparation/sample has run yet at this
new harness source; registration is committed before those operations.

The runtime adds host-only `init` and separate-process `verify-init` modes over
existing public ProjectApi and Content/Storage/History ports. Public Init creates
one explicitly Disposable Store, constructs the complete root, publishes its
first Branch and consumes its session with seal. Independent proof reopens the
returned sealed root/first Branch and checks exactly the original <=11 sample
set, metadata/lengths and <=64 KiB prefixes. No daemon, mount, host data server,
product feature, encoder, optimization or product source change is added.
Unselected paths/bytes remain explicit proof omissions. Global daemon counts
are UNAVAILABLE for this host route, not invented as zero. A new release build
will compile both original native-only tools and pin all included frozen source
bytes. Existing dependencies/versions are preserved; the manifest/lock change
only adds already-transitive first-party layerfs-content as a direct dependency.

Two new external runtime tests pass in 2.00 s after locked --no-run compilation:
sealed public Init/reopen proof and exact-byte corruption rejection. Every
invocation had the explicit 120 s checkout lock and each child has a bounded
12 s wait. An accidentally broad first selection also discovered historical
inline tests through the frozen module; it was explicitly stopped at 77 s
before the ceiling while the unrelated mixed_v2_contract CPU check ran. Its
exit 143/logs are retained and it is not claimed passing. No historical test
was weakened/edited; the final selection filters only the two new sdk_init_
tests. Initial compile failures (manifest ID width/API field names) are retained.
An offline lockfile-generation attempt also upgraded unrelated versions; those
own draft changes were restored from the parent, leaving only the direct
first-party dependency list addition. That initial unsealed build is not a
release identity, measurement or dependency-change claim.

Twenty-three engine tests pass in 0.319 s; three catalogue tests pass in 0.124 s.
Report reference values now resolve the exact preserved released source row;
verification-only timing is not promoted into a performance reference. Class A
requires integer zero content-page residency and separately verified cold
metadata; booleans cannot fabricate eligibility. Rust formatting checks use
skip_children=true on the owned files to preserve frozen external modules;
whitespace passes. Product tree remains unchanged. Raw checks:
`benchmark-results/fs-bench-pro/2026-10-10-batch-1-init-harness-checks/`.
Actual parity and four samples remain next. Production LOC 79,366 -> 79,366
(delta +0), same pinned absent-aware method.

| `c1d7dd0e8` | Port Init definitions and host runtime/parity support | 79366 | 79366 | +0 |

Batch 1 / init_namespace complete: all four original mandatory cases are ported
and parity PASS. Exact generated native counts, bytes and content digests match
the original full native verifier; reviewed operation/coverage hashes are sealed.
The locked release build passes with host source hashes checked inside Linux
before/after its build. The new host runtime/native tools are archived by SHA;
the daemon remains `f44900cfc975901b7101f4874f708390b6f7401981e06d608b3df52a50848c0e`.
Four cases each sampled once at clean `c1d7dd0e8`, through public Init and a
fresh Store; independent separate-process reopen/root/first Branch/sampled
metadata-and-byte proofs all PASS. Stores seal/close without WAL/SHM/journal
sidecars. No Docker sample resource or mount was created for this host route.

All four numeric rows remain INELIGIBLE because source bytes were generated
and read in preparation and host cold metadata cannot be verified. Functional
completion is PASS for each; INELIGIBLE is preserved and no cold/performance
qualification is asserted. Requests/owner jobs/daemon statements and overlay
storage are UNAVAILABLE because this route uses no daemon/overlay. Complete
wall is host child launch-to-exit; command_ns is the complete public Init/seal
span. Neither includes fixture setup or independent proof. Reference rows
retain release 0.1.5 and its different layerstack_init_ns timer/topology, without
ratios. No declared 15 s wall or 9.5 s verifier limit exceeded.

| Case | Functional / proof | Numeric status | Complete wall ns | Public Init/seal ns | Proof wall ns | Store logical = allocated B | Close |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| namespace-100-compact-v3 | PASS / PASS | INELIGIBLE | 3336290834 | 51216875 | 23149958 | 5263360 | SEALED_CLOSED; no mount |
| namespace-1000-compact-v3 | PASS / PASS | INELIGIBLE | 182638250 | 166821125 | 22118958 | 20606976 | SEALED_CLOSED; no mount |
| namespace-10000 | PASS / PASS | INELIGIBLE | 2127532084 | 2076532083 | 39871875 | 305762304 | SEALED_CLOSED; no mount |
| namespace-100000 | PASS / PASS | INELIGIBLE | 7829361042 | 7694068833 | 187957917 | 516554752 | SEALED_CLOSED; no mount |

The two CSVs were generated once by bench.py report under
`core/benchmark/fs-bench-pro/baselines/core/2026-10-10-c1d7dd0e8/`; all four cases
are present. bench.py verify checks retained proof records and immutable
original evidence hashes, with four PASS and no product replay. Raw build,
prepared input, parity and measured receipts are under
`benchmark-results/fs-bench-pro/2026-10-10-batch-1-init-build/`,
`benchmark-results/fs-bench-pro/2026-10-10-batch-1-init-prepared/`,
`benchmark-results/fs-bench-pro/2026-10-10-batch-1-init-parity/` and
`benchmark-results/fs-bench-pro/2026-10-10-batch-1-init-c1d7dd0e8/`. No product correctness bug surfaced.
The complete prepared native trees and closed sample Store files remain owned
raw setup/evidence; their paths are explicit in each receipt. No new failed or
uncertain container/volume was created. Existing retained H-1/C10/C12 resources
remain untouched. Unaffected engine/runtime scoped test evidence from the port
commit is reused; this result/doc commit changes no harness or product source.
Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware method.

| `39bbcbd6b` | Record four Init samples/parity and generated CSVs | 79366 | 79366 | +0 |

Batch 1 / payload_create_read implementation: eight original cases have frozen
ported definitions, original names/tiers, seed1, ordinary syscall workload.sh
and explicit differences/review pins. A native-only workspace fixture generator
uses the original fixture/expected algebra and complete native verifier, retaining
full file count/byte/content digests. The build now also seals the original
product-neutral Linux syscall executable after host-source hash checks inside
the pinned image. It compiles no retired product package or root crates.

The same existing SDK/Sandbox control machinery performs an untimed identical
ordinary call, terminal unmount/automatic cleanup, then fresh measured mount,
one unchanged ordinary call and one public Commit. Known read-only UpToDate
is allowed without manufacturing a new Commit. Performance stops at terminal
unmount; setup, cleanup, fresh native and persisted-root verification and Stop
are separate. Original control identities/numeric pricing remain the count
method. A new typed root field in the harness Commit event binds the separate
proof to the exact acknowledged root; no Debug result is parsed.

Independent proof uses the original complete native tree/byte checker after a
fresh mount, then current typed/authenticated public Content/Storage/History
reads over a closed, exported sample Store. Complete names/kinds/portable
metadata/lengths/link classes and every payload byte are checked. Current format
is validated by current public readers, with no retired encoding substitution.
This is an offline oracle after known Stop, with no live host data path or new
product encoder. Unreferenced-object census/encoding identity are not comparison
claims. The source review records these topology/grammar differences explicitly.
The copied 45 s work/59 s hard verification scope is frozen before sampling;
product 15 s is a reported soft limit. The existing 120 s operation watchdog is
unchanged; every invocation additionally has the checkout's explicit 120 s stop.
Class B eligibility is checked against actual measured object demands after
warm terminal cleanup; any miss remains INELIGIBLE. Functionally passing samples
are removed after both proofs and confirmed Stop while retaining their numeric
eligibility and complete raw evidence. Failed/uncertain resources remain owned.

Two external persisted-proof tests pass in 1.72 s after locked --no-run build,
covering full bytes/names and corruption with otherwise matching metadata.
The tests filter workspace_graph_ so the 19 historical inline tests are not
executed; bounded child waits prevent indefinite hangs. Twenty-four final-source
engine tests pass and three catalogue tests pass, under separate 120 s locks.
Rust formatting/whitespace pass on owned files with external children skipped.
Raw checks: `benchmark-results/fs-bench-pro/2026-10-10-batch-1-payload-harness-checks/`.
No product change, new dependency or product correctness bug is claimed. No
payload build/preparation/parity/sample has run yet; registration is committed
first. Production LOC 79,366 -> 79,366 (delta +0), same pinned absent-aware method.

| `200f81493` | Port payload definitions and complete workspace proof support | 79366 | 79366 | +0 |

Batch 1 parallel routing: the owner's follow-up authorizes two new isolated
worktrees and subagents for tiny_file_churn and namespace_mutation. They own
only their respective family definitions/tests/CSV outputs; the lead owns the
shared engine, product fixes, integration and master ledger. They must finish
within batch 1 before later batches begin. Each worktree uses its own ignored
lock script/path and Cargo targets; passing sample resources are removed only
by their creating run. Protected existing worktrees, containers, volumes and
inputs remain untouched. Local worker commits are integrated onto main with
the required unchanged-product LOC comparison and attribution.

The existing generic workspace runner/preparer/parity/retained-proof routes
now accept the two remaining batch-1 ordinary syscall families once their
committed cases become ported. Pending selections remain refused. No workload,
verifier, budget or product behavior changes. Source receipts additionally
record the explicit LAYERFS_BENCH_INTERFERENCE declaration; the three campaign
worktrees share the Docker VM and host and make no isolated timing claim.

The payload release build, all eight native/Store prepared inputs and all
eight parity cases passed before this routing change. The sealed binaries
can be reused because no compiled input changed; their archive and build
identity remain the original 200f81493 receipt. No payload sample has run.
Raw setup: benchmark-results/fs-bench-pro/2026-10-10-batch-1-payload-build/,
2026-10-10-batch-1-payload-prepared/ and 2026-10-10-batch-1-payload-parity/.
Prepared master volumes are listed in each append-only prepared.json.

Final-source scoped engine/catalogue checks are recorded with this commit.
Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware method;
reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).

| `b3c96ecb1` | Enable isolated concurrent batch-1 family work and declare interference | 79366 | 79366 | +0 |

Batch 1 / payload_create_read complete: all eight original cases prepared and
parity PASS; every case sampled once at clean b3c96ecb1 with sealed binary
reuse from the payload build at 200f81493. All eight functional/native/persisted
proofs PASS, exact acknowledged Commit/UpToDate roots match, terminal measured
and verifier mounts reach Gone, and Stop/container state is confirmed. All
eight passing sample containers/volumes were removed by their creating run.
No product correctness bug surfaced. Full allocated/logical bytes and numeric
counts are retained, without speed judgment or comparison verdict.

Numeric class B eligibility remains separate: the four creation cases each
record three measured source demands and the largest random-read case records
657; their rows are INELIGIBLE. The other three random-read cases record zero
and are PASS. All eight complete walls are WITHIN the unchanged 15 s reported
limit and all separate proofs are WITHIN the 45 s work / 59 s hard limits.
The unmodified actual demand guard is never bypassed or retried. All three
authorized worktrees share host/Docker VM resources and retained protected
services; source receipts contain the explicit interference declaration.

| Case | Functional / proof | Numeric | Complete wall ns | Proof wall ns | Requests / jobs / statements | Store logical / allocated B | Overlay logical / allocated B | Source demands / close |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| payload-create-1m-compact-v2 | PASS / PASS | INELIGIBLE | 181987875 | 1486514208 | 22 / 241 / 1178 | 1411992 / 1413120 | 1294336 / 269729792 | 3 / Gone; KNOWN_STOP |
| payload-create-10m-compact-v2 | PASS / PASS | INELIGIBLE | 297180584 | 1799140334 | 94 / 1177 / 6290 | 12738560 / 12738560 | 10895360 / 279330816 | 3 / Gone; KNOWN_STOP |
| payload-create-100m | PASS / PASS | INELIGIBLE | 1275518541 | 3791561250 | 814 / 10537 / 57410 | 109649920 / 109649920 | 106856448 / 375291904 | 3 / Gone; KNOWN_STOP |
| payload-create-500m | PASS / PASS | INELIGIBLE | 9449516000 | 11953190375 | 4014 / 52137 / 284610 | 534945792 / 534953984 | 533385216 / 801824768 | 3 / Gone; KNOWN_STOP |
| payload-random-read-1-compact-v2 | PASS / PASS | PASS | 178474292 | 1471486375 | 6 / 52 / 236 | 1327496 / 1331200 | 229376 / 268664832 | 0 / Gone; KNOWN_STOP |
| payload-random-read-10-compact-v2 | PASS / PASS | PASS | 160773916 | 1673532375 | 15 / 61 / 254 | 10887584 / 10891264 | 229376 / 268664832 | 0 / Gone; KNOWN_STOP |
| payload-random-read-100 | PASS / PASS | PASS | 171707875 | 11578540166 | 105 / 151 / 434 | 530792864 / 530796544 | 229376 / 268664832 | 0 / Gone; KNOWN_STOP |
| payload-random-read-500 | PASS / PASS | INELIGIBLE | 318755417 | 12251908917 | 503 / 550 / 1232 | 530792864 / 530800640 | 229376 / 268664832 | 657 / Gone; KNOWN_STOP |

The two CSVs under baselines/core/2026-10-10-b3c96ecb1/ contain every one of
the eight cases beside its released reference provenance. bench.py verify
checks retained original evidence hashes and reports eight PASS without
replaying any product operation. Raw samples:
benchmark-results/fs-bench-pro/2026-10-10-batch-1-payload-b3c96ecb1/.
Verify/report stdout/stderr and template reads:
benchmark-results/fs-bench-pro/2026-10-10-batch-1-parallel-routing-checks/.
A mistyped short read-case CLI ID was refused before selection or any sample
attempt; the correct original ID then received its sole sample. That refusal
is retained in refused-short-case-id.json, with zero product/mount attempts.

Prepared immutable masters remain owned setup for affected-case source-change
reuse, and are never measured directly:

| Prepared case | Owned master volume |
| --- | --- |
| payload-create-1m-compact-v2 | layerfs-fsb-master-payload-create-read-382a946a21d44b51 |
| payload-create-10m-compact-v2 | layerfs-fsb-master-payload-create-read-9a9f6e961def4a02 |
| payload-create-100m | layerfs-fsb-master-payload-create-read-3a2c1e8cf03b4064 |
| payload-create-500m | layerfs-fsb-master-payload-create-read-1abdd3a8148a4972 |
| payload-random-read-1-compact-v2 | layerfs-fsb-master-payload-create-read-e148a8fb9ca84eb1 |
| payload-random-read-10-compact-v2 | layerfs-fsb-master-payload-create-read-390b40805ee04325 |
| payload-random-read-100 | layerfs-fsb-master-payload-create-read-b8fab313624045c7 |
| payload-random-read-500 | layerfs-fsb-master-payload-create-read-b869121a3e1143e5 |

The attached worktrees are
/Users/yifanxu/.codex/worktrees/fs-bench-pro-tiny-file-churn/layerfs and
/Users/yifanxu/.codex/worktrees/fs-bench-pro-namespace-mutation/layerfs,
both created from b3c96ecb1. Their own ignored lock scripts point to their
respective core/target/r4.lock files. The workers reuse immutable verified
binary archives, without sharing writable Cargo targets. They own no product
changes. Tiny registration c4c137c13 and namespace registration dac8212de
are locally committed in their respective codex/ branches and remain the
actual fixed preparation/sample identities even after later main integration.
Their results are pending; no later batch has started.

Unchanged engine/runtime scoped checks from the port and routing commits are
reused; this commit changes only results/documents. No new failed or uncertain
sample resources were created. H-1/C10/C12 and all protected resources remain
untouched. Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware
method; reference absent (retired R9c; last counted 65,417).

| `c1d9b6c58` | Record eight payload samples and generated CSVs | 79366 | 79366 | +0 |

Batch 1 / tiny_file_churn registration integrated locally onto main from
worker commit c4c137c13. All twenty original cases retain their exact compact,
mixed-v3 and mixed-v4 IDs/tiers, seed1, original dense ordinary syscall body,
normalization and filesystem requests. Each has one public Commit after the
ordinary call; tiny-stat expects UpToDate. The port explicitly declares that
the complete original native semantic tree plus persisted current-format public
reader proof is stronger than the historical selected tiny/mixed path/range
coverage. The original reported/work/hard/operation limits are unchanged.
No product source or shared engine change accompanies this integration.

Worker source reviews match frozen file hashes against reference-v0.1.6-final.
Its catalogue three tests PASS in 4.105 s under its own 120 s lock; bash syntax
and whitespace checks PASS. Exact staged/committed production tree comparison
was verified for c4c137c13. All twenty original native inputs/final states and
public Init/seal/install masters prepared PASS, and parity PASS twenty cases
in at most 17 s with zero samples. Fixed preparation/sample source remains
c4c137c13; main integration does not relabel or rerun those receipts.

Worker raw evidence and owned resources remain under
/Users/yifanxu/.codex/worktrees/fs-bench-pro-tiny-file-churn/layerfs/benchmark-results/fs-bench-pro/.
Prepared and parity roots are 2026-10-10-batch-1-tiny-prepared/ and
2026-10-10-batch-1-tiny-parity/. Every master volume name/digest is in its
prepared.json and resource-claim.json; only the worker's passing sample
resources are removed. It declares shared host/VM interference in every
source receipt and reuses immutable sealed binaries with matched compilation
inputs. Samples/results are in progress, so the family is not yet complete.
This integration preserves the worker's exact definition/workload bytes and
reuses its qualifying scoped evidence; no unchanged sample is repeated.
Production LOC 79,366 -> 79,366 (delta +0), same pinned absent-aware method.

| `c4c137c13` (worker) | Port twenty tiny-file cases at isolated worktree source | 79366 | 79366 | +0 |
| `36849bcc2` | Integrate tiny-file registration with master ledger | 79366 | 79366 | +0 |

Batch 1 / namespace_mutation registration integrated locally onto main from
worker dac8212de. All four original compact-v2/mixed-v4 IDs, fixtures, tiers,
seed1, original subtree rename/delete/normalization/sync requests and known
Committed outcomes are preserved. The complete mounted/persisted byte/tree
proof is explicitly declared as stronger than the historical mixed-v4 selected
paths/ranges and moved/deleted witnesses. Original report/work/hard/operation
limits remain 15/45/59/120 seconds. No product/shared engine changes.

Worker qualified the compact native rename/deletion transcript and corruption
rejection with two scoped tests PASS in 0.134 s under its own 120 s lock; three
catalogue tests PASS in 3.297 s. The initial test-only expectation used the
word bytes while the verifier emits native content mismatch; native.stderr
retains that failure. The final assertion strengthens matching to the exact
content-mismatch path and offset; native-fixed.stderr retains PASS. No workload
or verifier was weakened. All four original native input/final-state checks,
public Init/seal/install and parity PASS at fixed dac8212de.

The worker has finished four single samples with both independent proofs,
Gone and KNOWN_STOP. Results are integrated separately; existing samples and
receipt identities are never changed or replayed. Full raw qualification,
preparation, parity and measured evidence remains in its attached worktree
/Users/yifanxu/.codex/worktrees/fs-bench-pro-namespace-mutation/layerfs/benchmark-results/fs-bench-pro/.
This integration preserves its exact registered bytes and reuses those scoped
qualifications. Production LOC 79,366 -> 79,366 (delta +0), pinned absent-aware
method; reference absent (retired R9c, last counted 65,417).

| `dac8212de` (worker) | Port four namespace mutation cases and scoped qualification | 79366 | 79366 | +0 |
| `98b14b233` | Integrate namespace registration with master ledger | 79366 | 79366 | +0 |

Batch 1 / namespace_mutation complete: worker results commit 3eaf14d95 is
integrated on main with all four original cases present in both CSVs under
baselines/core/2026-10-10-dac8212de/. All four original single samples at
clean dac8212de completed ordinary workload/public Commit, both full mounted
native and closed persisted-root independent proofs, exact acknowledged root,
terminal Gone and KNOWN_STOP. All functionally passing sample containers and
volumes, and passing setup/copy containers, were removed by their creating
worker. No product correctness bug, failed/NA case or limit exceedance surfaced.
All four numeric rows remain INELIGIBLE because exactly three actual measured
source-object demands violate the strict class B zero-demand guard. No
checker, workload, limit, source identity or receipt is changed to make PASS.

| Case | Functional / proof | Numeric | Complete wall ns | Proof wall ns | Requests / jobs / statements | Store logical / allocated B | Overlay logical / allocated B | Close |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| namespace-subtree-relocate-delete-1-compact-v2 | PASS / PASS | INELIGIBLE | 185745666 | 1910991458 | 129 / 890 / 5287 | 938736 / 942080 | 245760 / 268685312 | Gone; KNOWN_STOP |
| namespace-subtree-relocate-delete-10-compact-v2 | PASS / PASS | INELIGIBLE | 279461750 | 1783612417 | 1092 / 7581 / 45196 | 1483504 / 1486848 | 380928 / 268820480 | Gone; KNOWN_STOP |
| namespace-subtree-relocate-delete-100-mixed-v4 | PASS / PASS | INELIGIBLE | 231905500 | 6029095334 | 832 / 5738 / 34262 | 106984296 / 106987520 | 360448 / 268800000 | Gone; KNOWN_STOP |
| namespace-subtree-relocate-delete-500-mixed-v4 | PASS / PASS | INELIGIBLE | 678906875 | 17898625750 | 4072 / 27726 / 166750 | 534258584 / 534261760 | 802816 / 269238272 | Gone; KNOWN_STOP |

bench.py verify checks all four retained independent records and immutable
original manifests PASS without replaying a product operation. All clocks,
phase counts, original reference rows, helper/fixture/source/binary/image
identities and removal receipts remain in the attached worker raw tree:
/Users/yifanxu/.codex/worktrees/fs-bench-pro-namespace-mutation/layerfs/benchmark-results/fs-bench-pro/2026-10-10-batch-1-namespace-dac8212de/.
Preparation, parity and tests are in the sibling -prepared/, -parity/ and
-tests/ roots. Root-ready exact handoff is /tmp/fsbench-namespace-handoff.json.
The four immutable preparation masters remain retained for valid source-change
reuse, never direct measurement: layerfs-fsb-master-namespace-mutation-
b9ef36d8567e402d, e3115545ed674d03, 245fb63fd78946b3 and 29a2b1062e35457b
(each suffix uses that full prefix). Ignored receipts must be preserved before
any managed archive; no archive or deletion has been performed.

All samples explicitly declare shared host/Docker VM interference and make
no isolated timing, speed comparison or release-admission claim. The passed
scoped qualifications from registration are reused; this integration changes
only generated results/documents. Production LOC 79,366 -> 79,366 (delta +0),
same pinned absent-aware method.

| `3eaf14d95` (worker) | Record four namespace samples and generated CSVs | 79366 | 79366 | +0 |
| `be1f56a23` | Integrate complete namespace outcomes with master ledger | 79366 | 79366 | +0 |

H-2 provenance correction: all 36 currently ported batch-1 review entries
labelled annotated recovery tag object ae3310fada4a1fe35cb99ab02270b7538a0d03f7
as source_commit. git cat-file confirms type tag. Peeling that same unchanged
reference resolves actual commit d296981ace76fe751bebf00dee52818fe18a3eef.
The reviewed file hashes were obtained through git show on the tag and are
correct; neither frozen source bytes nor any workload, verifier or product
operation was wrong. The two parity routes compared the misleading label
to the tag object, admitting the wrong object type.

Before the fix, three external scoped regression methods fail (38 assertions
and two errors): both parity routes admit a tag as a commit, reject a valid
peeled commit, and every ported review has the wrong label. The exact failed
stdout/stderr is retained under benchmark-results/fs-bench-pro/
2026-10-10-review-pin-fix-checks/before.*. The fix uses explicit ^{commit},
retains source_tag_object separately in every review, and validates both
objects in parity. The namespace qualification's pin assertion is updated
to the true commit. All original reviewed hashes, steps, budgets, cache
contracts, oracle scope and cases remain unchanged. Frozen root and closed
records/registrations/receipts remain unchanged. Active tiny samples continue
at their original isolated c4c137c13 source with no metadata/source mutation.
No unchanged measured case is replayed for this labeling correction.

At final changed source, all 27 engine tests PASS in 0.512 s; the changed
namespace pin qualification PASS in 0.012 s; catalogue three tests PASS in
0.114 s. Each invocation has its own 120 s lock/wall stop. The unaffected
native transcript/corruption test is reused from its passing registration
evidence. This is Python/JSON harness metadata only, with unchanged product
and compiled inputs; no product regression, Linux product build, Clippy or
boundary claim is manufactured. Corrected parity evidence will be recorded
without any product sample replay. Production LOC 79,366 -> 79,366 (delta +0),
pinned absent-aware method; reference absent (retired R9c, last counted 65,417).

| `222526fa0` | Correct annotated recovery tag/source commit review identity | 79366 | 79366 | +0 |

Batch 1 / tiny_file_churn complete: worker results commit 323cd6dfa is
integrated on main with every original case in both twenty-row CSVs under
baselines/core/2026-10-10-c4c137c13/. All twenty cases were sampled once at
clean c4c137c13, passed the full mounted native and closed persisted semantic
proofs with exact acknowledged Commit/UpToDate root, and ended both measured
and verifier mounts with Gone and KNOWN_STOP. All passing sample containers/
volumes and setup/copy containers were removed by their creating worker.
There was no product bug, failed/NA case or exceeded product/proof limit.

All four tiny-stat rows are numeric PASS with zero source demands. Eight
tiny-create/unlink rows are INELIGIBLE with three actual demands each; eight
bulk-create/delete rows are INELIGIBLE with four each. The strict guard remains
unchanged; completed work/clean proofs remain functional PASS independently.
No case was repeated to obtain a different cache observation.

| Case | Functional / proof | Numeric | Complete wall ns | Proof wall ns | Requests / jobs / statements | Store logical / allocated B | Overlay logical / allocated B |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| tiny-create-1-compact-v2 | PASS / PASS | INELIGIBLE | 172780583 | 2170305458 | 16 / 140 / 645 | 1405656 / 1409024 | 229376 / 268664832 |
| tiny-create-10-compact-v2 | PASS / PASS | INELIGIBLE | 171092084 | 2549466792 | 115 / 956 / 4452 | 11084912 / 11087872 | 266240 / 268701696 |
| tiny-create-100-mixed-v4 | PASS / PASS | INELIGIBLE | 270797708 | 5553232500 | 736 / 5745 / 27408 | 106945928 / 106946560 | 548864 / 268984320 |
| tiny-create-500-mixed-v4 | PASS / PASS | INELIGIBLE | 566336917 | 16850427292 | 3496 / 28841 / 134888 | 534873568 / 534876160 | 1847296 / 270282752 |
| tiny-stat-1-compact-v2 | PASS / PASS | PASS | 180196833 | 2107919500 | 4 / 51 / 249 | 1347976 / 1351680 | 229376 / 268664832 |
| tiny-stat-10-compact-v2 | PASS / PASS | PASS | 203780416 | 2550262542 | 22 / 69 / 501 | 10985888 / 10989568 | 262144 / 268697600 |
| tiny-stat-100-mixed-v4 | PASS / PASS | PASS | 199141125 | 5670476250 | 112 / 159 / 1671 | 107327904 / 107331584 | 389120 / 268824576 |
| tiny-stat-500-mixed-v4 | PASS / PASS | PASS | 255376583 | 16564206042 | 512 / 559 / 6871 | 532681120 / 532684800 | 598016 / 269033472 |
| tiny-unlink-1-compact-v2 | PASS / PASS | INELIGIBLE | 193983458 | 2233676000 | 12 / 122 / 594 | 1372696 / 1376256 | 229376 / 268664832 |
| tiny-unlink-10-compact-v2 | PASS / PASS | INELIGIBLE | 191469000 | 2653523250 | 75 / 608 / 3301 | 11018848 / 11022336 | 262144 / 268697600 |
| tiny-unlink-100-mixed-v4 | PASS / PASS | INELIGIBLE | 233279625 | 5783532667 | 435 / 3035 / 17991 | 107435168 / 107438080 | 389120 / 268824576 |
| tiny-unlink-500-mixed-v4 | PASS / PASS | INELIGIBLE | 410351250 | 16350211959 | 2035 / 13939 / 83655 | 532792048 / 532795392 | 565248 / 269000704 |
| tiny-bulk-create-1-compact-v2 | PASS / PASS | INELIGIBLE | 366151625 | 2475651167 | 1429 / 15063 / 65179 | 1426280 / 1429504 | 1495040 / 269930496 |
| tiny-bulk-create-10-compact-v2 | PASS / PASS | INELIGIBLE | 837759583 | 3245791000 | 4651 / 43140 / 196321 | 13705216 / 13705216 | 11735040 / 280170496 |
| tiny-bulk-create-100-mixed-v3 | PASS / PASS | INELIGIBLE | 1918278000 | 5651561541 | 8709 / 80032 / 375318 | 111820800 / 111820800 | 108724224 / 377163776 |
| tiny-bulk-create-500-mixed-v3 | PASS / PASS | INELIGIBLE | 13508792208 | 18308321000 | 39665 / 351248 / 1669693 | 536412160 / 536416256 | 541491200 / 809930752 |
| tiny-bulk-delete-1-compact-v2 | PASS / PASS | INELIGIBLE | 318064125 | 2024159625 | 1145 / 9966 / 53086 | 1422088 / 1425408 | 348160 / 268783616 |
| tiny-bulk-delete-10-compact-v2 | PASS / PASS | INELIGIBLE | 509469958 | 2184369209 | 3012 / 22772 / 129867 | 11039520 / 11042816 | 634880 / 269070336 |
| tiny-bulk-delete-100-mixed-v3 | PASS / PASS | INELIGIBLE | 761838833 | 2889839417 | 4987 / 36093 / 210354 | 107774848 / 107778048 | 913408 / 269348864 |
| tiny-bulk-delete-500-mixed-v3 | PASS / PASS | INELIGIBLE | 2643373875 | 5621920792 | 21187 / 146056 / 872798 | 533111632 / 533114880 | 3248128 / 271683584 |

The largest complete product wall is 13,508,792,208 ns for original
tiny-bulk-create-500-mixed-v3 (15,000,000,000 ns reported limit), with separate
proof 18,308,321,000 ns (45,000,000,000 ns work / 59 s hard limit). Its
39,665 requests / 351,248 jobs / 1,669,693 statements are recorded without
judgment or comparison. Every row includes its original released reference
provenance. Raw preparation/parity/run receipts remain under
/Users/yifanxu/.codex/worktrees/fs-bench-pro-tiny-file-churn/layerfs/benchmark-results/fs-bench-pro/
2026-10-10-batch-1-tiny-prepared/, -parity/ and -c4c137c13/ respectively.
The twenty immutable prepared masters are listed explicitly below; they remain
closed reusable setup, never direct measurement:

| Prepared case | Owned master volume |
| --- | --- |
| tiny-create-1-compact-v2 | layerfs-fsb-master-tiny-file-churn-d8611b3edb224292 |
| tiny-create-10-compact-v2 | layerfs-fsb-master-tiny-file-churn-4b582e0f3a314380 |
| tiny-create-100-mixed-v4 | layerfs-fsb-master-tiny-file-churn-9aeb5aba230e420e |
| tiny-create-500-mixed-v4 | layerfs-fsb-master-tiny-file-churn-6e39c5ff6dd247a3 |
| tiny-stat-1-compact-v2 | layerfs-fsb-master-tiny-file-churn-1dbdf1f9afe5439f |
| tiny-stat-10-compact-v2 | layerfs-fsb-master-tiny-file-churn-a329b9fd36d54027 |
| tiny-stat-100-mixed-v4 | layerfs-fsb-master-tiny-file-churn-d89da5abc69e450f |
| tiny-stat-500-mixed-v4 | layerfs-fsb-master-tiny-file-churn-307f1d1ac9d7400e |
| tiny-unlink-1-compact-v2 | layerfs-fsb-master-tiny-file-churn-6a25097b09874030 |
| tiny-unlink-10-compact-v2 | layerfs-fsb-master-tiny-file-churn-262566f5b9ae4d01 |
| tiny-unlink-100-mixed-v4 | layerfs-fsb-master-tiny-file-churn-f1511e0f2f824988 |
| tiny-unlink-500-mixed-v4 | layerfs-fsb-master-tiny-file-churn-93b0b33df1684caa |
| tiny-bulk-create-1-compact-v2 | layerfs-fsb-master-tiny-file-churn-9e8ec14e26e1446b |
| tiny-bulk-create-10-compact-v2 | layerfs-fsb-master-tiny-file-churn-1db068255c914185 |
| tiny-bulk-create-100-mixed-v3 | layerfs-fsb-master-tiny-file-churn-fe3860c319e64160 |
| tiny-bulk-create-500-mixed-v3 | layerfs-fsb-master-tiny-file-churn-254ce6c1f22543d6 |
| tiny-bulk-delete-1-compact-v2 | layerfs-fsb-master-tiny-file-churn-13f68d6d9c8d49fd |
| tiny-bulk-delete-10-compact-v2 | layerfs-fsb-master-tiny-file-churn-42fdc1d872284079 |
| tiny-bulk-delete-100-mixed-v3 | layerfs-fsb-master-tiny-file-churn-92c7d60100c841a9 |
| tiny-bulk-delete-500-mixed-v3 | layerfs-fsb-master-tiny-file-churn-37f4306ee67a4e15 |

bench.py report validates the original retained manifests and emits all twenty
performance/proof rows without product replay. The worker's original scoped
catalogue/syntax qualification is reused; this integration changes only CSVs/
documents. Ignored raw evidence is retained in its attached worktree. No
archive/deletion of that evidence or any protected resource has occurred.
Worker cohorts and old review-tag labels remain immutable in their receipts;
main's H-2 correction changes only prospective metadata and strict parity
validation, with no measured case replay. Corrected parity for all four
batch-1 families is the remaining batch checkpoint before batch 2 starts.
Production LOC 79,366 -> 79,366 (delta +0), same pinned absent-aware method.

| `323cd6dfa` (worker) | Record twenty tiny-file samples and generated CSVs | 79366 | 79366 | +0 |
| `d6e0ef952` | Integrate complete tiny-file outcomes with master ledger | 79366 | 79366 | +0 |

Batch 1 closed: all four families meet the done-when list with every original
case ported, parity PASS, one functional/proof/clean-close sample each, and
the two complete CSVs per original source run integrated on main. There are
36 cases: Init4, payload8, tiny20 and namespace4. Seven numeric rows are PASS
and 29 INELIGIBLE; no numeric eligibility is upgraded by functional completion.
All registered product/proof limits are WITHIN. Every passing mounted sample
resource was removed by its creating run; prepared masters and all ignored raw
evidence remain retained and explicitly owned. No product bug or unrun/failed/
not-applicable pilot case remains. H-1 and H-2 are fixed harness faults; stage
0.4's unchanged C10/C12 exact-count failures remain historical FAIL.

After H-2, at clean d6e0ef952 each corrected strict parity route passed once
without any new product sample: Init4 (13 s wall stop receipt), payload8
(5 s), tiny20 (18 s), namespace4 (individual 120 s wall stop). Each consumes
its previously sealed original native fixture/final-state evidence, validates
all reviewed source hashes and both exact source commit/tag objects, and
records zero samples. Raw roots are benchmark-results/fs-bench-pro/
2026-10-10-review-pin-init-parity/, -payload-parity/, -tiny-parity/ and
-namespace-parity/. These are metadata-check observations, with no performance
claim. The complete failed H-2 regression receipt remains under
2026-10-10-review-pin-fix-checks/before.*.

Batch 2 can now begin. The owner-authorized workers will be reused for
separate original edit families while the lead owns shared exact-write
machinery, production bugs and ledger/integration. Their pilot branches and
ignored receipt trees remain intact; later family work uses new local
branches from the completed main checkpoint, without resetting saved work.
No later batch may start until batch 2's complete outcome is recorded.
This closure changes documents only, reusing all final-source scoped checks.
Production LOC 79,366 -> 79,366 (delta +0), same pinned absent-aware method;
reference absent (retired R9c, last counted 65,417).

| `d4314ed62` | Close all four pilot families and corrected source-pin parity | 79366 | 79366 | +0 |

Batch 2 / shared native edit model: the original SDK scenario registries and
payload algebra now define the same native payload.bin input/final trees for
preserving, changing, canonical-count and capped families. Original start/
delete/replacement lengths, existing capped inputs, payload generators/digests
and exact final lengths are reused directly from frozen product-neutral Rust.
The native fixture recipe accepts these cases through one shared adapter; it
keeps the original full materialization/metadata/manifest/digest checks and
explicitly validates the original fixture byte SHA. Existing ordinary cases
continue through their unchanged original expected-state route. No product
package or retired encoder is compiled or restored.

The host native tool compiles with rustup1.85.1 and all repository ARM64 flags
under the main120s lock (4 s). Its native 1MiB overwrite-head fixture and
independent expected state qualify: exact original fixtureSHA
d7dfe3d2828aceb85177e6efbeb600f23672a326c902e525e401c1545bb05bdc,
replacementSHA faca857b3e7f8b1b8f46c19b1625a1b9995248ae9ac85eae672b85fbc9932375,
all 1,044,480 suffix bytes unchanged, root0750/file0640 and fixed mtime
1700000000000000000 ns. This is native-only preparation/model qualification,
with no Store, SDK call, mount or measured product sample. Raw evidence:
benchmark-results/fs-bench-pro/2026-10-10-batch-2-edit-model-checks/.

Three isolated workers author preserving12, changing32 and capped5 cases.
The added managed capped worktree is
/Users/yifanxu/.codex/worktrees/fs-bench-pro-edit-capped/layerfs, from
d4314ed62, with its own ignored lock script/targets. Existing pilot worktrees
use new codex/ edit branches from that same checkpoint while retaining pilot
branches and every ignored receipt/master. The preserving worker additionally
owns only shared writers/edit.rs and its native qualification test; the
changing worker additionally owns only new runtime/src/edit_oracle.rs and
external tests for current untouched-payload/source-offset preservation and
complete inode-table membership. The lead owns model/engine/runtime integration,
production bugs and ledger. This independent ownership avoids overlap while
shared source is composed. All dependent setup/sampling remains unattempted.

Original capped-v1 has a two-second SDK-edit+Commit+End group watchdog. It will
remain one two-second group for the ordinary edit+Commit+terminal unmount,
excluding setup/warmup/mount/proof, with actual expiration retained. It is
never substituted with a120s operation window. Standard SDK fixture rootmtime
was not fixed in the old native preparation, so deterministic rootmtime is an
explicit difference for the three direct SDK families. Capped inherited
preparation already fixed rootmtime; it needs no such difference. All input
root modes are0750 and payload modes0640. A mistaken pre-sample reviewer
assumption of0755 was checked against both frozen sources and actual native
stat, withdrawn and caused no source change or sample.

The capped review identified original complete inode-index membership beyond
reachable paths. The lead will restore that current-format check and audit
retained pilot Store exports separately, without replaying measurements or
altering sealed receipts; no completeness claim is silently widened.
Final shared binary/native/runtime qualifications and case parity await the
writer/oracle integration; none is claimed complete here. Production LOC
79,366 -> 79,366 (delta+0), same pinned absent-aware method; reference absent
(retired R9c, last counted65,417).

| `e2840c270` | Add original SDK-edit native fixture and expected-tree algebra | 79366 | 79366 | +0 |

Batch 2 / edit_length_preserving registration integrated from worker98fa838f4.
All twelve original head/middle/tail-by-tier cases preserve exact fixture
bytes, range starts, 4096-byte deletion/replacement, payload seeds/digests and
original plan/registry seals. The original standard native file0640, root0750
and filemtime are pinned; rootmtime normalization is an explicit topology
difference. The thin script uses the shared exact edit writer; no SDK/product
implementation is placed in the family. Every proposed current verifier
retains inode identity, full bytes/current grammar and applicable untouched
current payload IDs; retired source-format and SDK-only zero-FUSE/resource
fields remain explicit differences, never fabricated current zero values.

Worker scoped original registry/provenance/fixture qualification PASS in
3.416s, catalogue three PASS in0.134s; syntax/whitespace PASS, all under its
120s wall/own lock. Registration commit's exact parent/staged/committed
production comparison is79,366->79,366+0. Qualifying unchanged definitions/
checks are reused on integration. Shared final compile/verification, new
prepared inputs, parity, all twelve samples and CSVs remain pending; no
sample or mounted resource has been created for this family. Raw checks:
/Users/yifanxu/.codex/worktrees/fs-bench-pro-tiny-file-churn/layerfs/benchmark-results/fs-bench-pro/2026-10-10-batch-2-length-preserving-tests/.
No product source or workload limit changed. Production LOC79,366->79,366
(delta+0), same pinned absent-aware method; reference absent retiredR9c.

| `98fa838f4` (worker) | Port twelve exact length-preserving scenarios | 79366 | 79366 | +0 |
| `5e8dc5fd6` | Integrate length-preserving registration and master ledger | 79366 | 79366 | +0 |

Batch 2 / edit_length_changing registration integrated from681413760.
All32 original plans and their ordered positional edit remain frozen, including
five original growing500MiB capped-v2 IDs/inputs already defined by registry().
Their final length is exactly500MiB; no new cap is added. Insert/delete/append/
prepend/grow/shrink/truncate/zero-extend offsets, payload seeds/digests, six
original input byte hashes and independent plan seals are retained. Every
sdk_scenario field independently reproduces the frozen registry TSV digest
f59a1a68a19b95e1dcc8e6e5e273c7279c69fca373adca9980a9a9ffbd9fa517.

Worker two scoped plan/provenance/capped-input tests PASS0.042s, catalogue
three PASS0.115s under its own120s lock; syntax/whitespace PASS. No input,
Store, mount or sample exists yet; original checks are reused for this byte-
identical integration. Explicit differences record P-3 ordinary suffix movement/
pwrite/truncate, deterministic rootmtime, actual cache/route/resource scope and
current typed grammar/retention identifiers rather than retired format fields.
Final shared runtime/writer build, fixture/parity,32 samples and both CSVs
remain pending. Raw worker checks:
/Users/yifanxu/.codex/worktrees/fs-bench-pro-namespace-mutation/layerfs/benchmark-results/fs-bench-pro/2026-10-10-batch-2-length-changing-tests/.
No product or budget change. Production LOC79,366->79,366(delta+0), pinned
absent-aware method; reference absent retiredR9c.

| `681413760` (worker) | Port32 original length-changing scenarios and plan checks | 79366 | 79366 | +0 |
| `cbdff2006` | Integrate length-changing registration and master ledger | 79366 | 79366 | +0 |

Batch 2 / edit_length_changing_capped registration integrated from worker
d03f8435b and prospective coverage/watchdog follow-up90029a1fe. Five original
capped-v1 cases retain exact existing input prefixes (524,283,904 bytes, or
524,285,952 for replace-grow), all final lengths524,288,000, original seeds/
payloads/plans/fixture hashes and fixed0750/0640/1700000000 metadata. No
fixture, workload, limit or verifier is shrunk. The two-second group watchdog
for edit+Commit+End remains an active exact group budget, distinct from15s
reported full wall and45/59s independent proof limits. A refused operation or
expiry retains its original receipt/resources, without enlarging a deadline.

Current proof obligations include stable scope/inode serial, all bytes,
untouched current payload IDs and shifted source-offset transcript, current
format grammar and complete canonical inode-table membership. Retired
encoding/root IDs and unreferenced non-inode object census are explicitly
not compared. Capped original inherited fixture already fixed rootmtime, so
no artificial root-time difference is introduced. Frozen full digest model
self_check passes independently; computed original final fileSHA values are
retained in the worker's native-model diagnostic as derivations, not product
samples. Four final prospective contract checks PASS0.020s under own30s
lock, whitespace PASS; earlier raw contract checks retained. Exact worker
parent/staged/committed LOC comparisons are79,366->79,366+0.

Raw checks/model diagnostic:
/Users/yifanxu/.codex/worktrees/fs-bench-pro-edit-capped/layerfs/benchmark-results/fs-bench-pro/2026-10-10-batch-2-capped-registration/ and
2026-10-10-batch-2-capped-native-model-diagnostic/. No new container, volume,
Store, mount, preparation or product sample was created. Shared integration/
final qualification, five inputs/parity/samples/CSVs remain pending. This
integration reuses byte-identical qualification; no product change.
Production LOC79,366->79,366(delta+0), pinned absent-aware method.

| `d03f8435b` (worker) | Port five original capped-v1 edit scenarios | 79366 | 79366 | +0 |
| `90029a1fe` (worker) | Freeze active original2s group/current oracle obligations | 79366 | 79366 | +0 |
| `b9f955976` | Integrate capped registration and exact prospective constraints | 79366 | 79366 | +0 |

Batch 2 / shared ordinary edit writer integrated from cdf7fa635 and test-only
exact error attribution d7cce5759. One pure std Unix program executes all four
SDK scenario registries: original exact ranges/payloads,64KiB scratch, backward
suffix movement on growth, forward on shrink, exact final truncate, metadata
normalization and consumed checked close. Same-length overwrite moves no suffix.
Errors/zero IO preserve cause; successful short IO makes byte progress without
resending an error. No new fsync request, product API/encoder or dependency is
added. Independent native verification uses the unchanged full original checker
over the original expected algebra, never the mutation algorithm as its oracle.

At composed main source, Rust1.85.1/ARM64 compilation PASS in4s under120s
lock. Two dead-code warnings name model fixture-only helper functions unused
by this writer; they are retained, with no compiler/Clippy-clean claim. A fresh
independent byte copy of the native1MiB input receives one overwrite-head,
preserves native inode and exactly matches every independent expected byte;
its original complete native verifier PASS. No product Store, SDK, mount or
measurement ran. Raw native qualification:
benchmark-results/fs-bench-pro/2026-10-10-batch-2-edit-model-checks/
writer-apply.*, writer-verify.*, writer-native-checked.json. The original
model input/expected receipt trees remain unchanged.

The meaningful sealed-build qualification test covers all11 original small
overwrite/splice shapes, full bytes/metadata/native inode, wrong-length refusal
before effects, and an intentionally corrupted untouched byte. It requires a
matching immutable sealed build; it has not run before that prerequisite.
Writer/provenance syntax/format/whitespace PASS; full shared runtime/build and
final owning suite remain pending. All SDK samples remain unattempted.
Production LOC79,366->79,366(delta+0), pinned absent-aware method.

| `cdf7fa635` (worker) | Add shared positional writer and native qualification | 79366 | 79366 | +0 |
| `d7cce5759` (worker) | Pin exact original content-corruption cause before first test | 79366 | 79366 | +0 |
| `8dd9d99a8` | Integrate bounded positional writer with native source qualification | 79366 | 79366 | +0 |

H-3 current-format proof coverage correction: source review found the original
canonical verifier requires exhaustive inode-table membership, beyond reachable
path traversal. Earlier generic full byte/tree proofs did not enumerate that
table. Their sealed receipts remain unchanged and do not gain an unperformed
check. The integrated current oracle uses public typed rows_after with actual
root context, validates all unique serial rows, and rejects any unreachable,
missing or duplicate membership against the full resolved namespace. Existing
native byte, metadata, alias, root and current-format checks remain intact.
A membership-only offline mode reuses the previously proven bytes and will
audit independent copies of the32 retained pilot Store exports before any
SDK case setup/sample. Those audits are separate changed-oracle verification,
never a measurement replay or rewrite of old receipts. No product defect is
yet established; complete pilot qualification awaits those retained audits.

The SDK offline route now reuses the exact frozen edit model and validates
initial/final current roots: unchanged allocation scope plus inode serial,
original lengths, complete authenticated mapping grammar and parent/child
counts/lengths/levels, old untouched-payload subset rule using current IDs, and
capped strict shifted source-offset transcript for unchanged ranges. Guards
remain strict. A P-3 suffix rewrite may fail a legacy SDK representation
property; any failure will be retained and diagnosed against source/contracts,
without weakening a guard, adding a feature, optimizing storage/speed or
resampling unchanged work. Retired format/root/object IDs are never used as
current expectations.

Worker8e02fbed9's five external tests PASS0.01s after no-run compilation in
its own target, with19 frozen inline tests explicitly filtered. They cover
missing/unreachable table rows, insertion/deletion retention, scope/serial
replacement, capped shifted offsets and forged complete mapping summaries.
Composed main no-run initially failed on a harness ObjectId argument type
(borrow/success propagation), corrected to the actual public from_bytes API.
The host compiler failure is retained in tool output, not claimed a product
bug. Corrected main no-run PASS3.86s; same five scoped tests PASS0.01s under
separate120s locks. Owned rustfmt check PASS with skip_children=true; frozen
reference source is not formatted or modified. Two fixture-only unused helper
warnings remain visible, with no warnings-clean/Clippy claim. Basic persisted
full-byte/corruption tests are also checked at this source. Raw composed
checks: benchmark-results/fs-bench-pro/2026-10-10-batch-2-shared-oracle-checks/.
No new measured case, mount or Docker resource has been created. Production
LOC79,366->79,366(delta+0), pinned absent-aware method; reference absent
retiredR9c,lastcount65,417.

| `8e02fbed9` (worker) | Add typed edit-retention and exhaustive inode membership oracle | 79366 | 79366 | +0 |
| `37ec6826b` | Restore complete current inode membership and SDK edit proofs | 79366 | 79366 | +0 |

H-4 own-write cache classification: the zero source-demand/lifetime guard
was insufficient when Commit consumes newly written backing pages. The
external regression fails before the fix (ELIGIBLE rather than INELIGIBLE),
with exact failed output retained under
benchmark-results/fs-bench-pro/2026-10-10-batch-2-shared-oracle-checks/own-write-before.*.
B/C eligibility now requires explicit knowledge of own-written input; modified
input additionally needs independent actual pre-Commit verified-cold page/
metadata/identity observations with a preceding monotonic timestamp. No
existing observer supplies that proof here, so committed mutations are
INELIGIBLE. Read-only UpToDate cases explicitly declare no own-written input;
actual original zero source demands and cache lifetimes still apply. No
eviction, warm-state change, new hint, limit, workload, request or product
optimization is introduced to obtain eligibility. The seven pilot numeric
PASS rows are read-only UpToDate; all pilot mutations were already INELIGIBLE.
Earlier cell receipts remain unchanged; their missing own-write declaration
is not evidence of numerical cache qualification, regardless of functional
proof/count equality. No speed or release claim is made from them.

Completed counts/storage can also be collected once after a separately failed
closed-Store graph proof, provided Stop is known and telemetry has never been
requested. This is read-only receipt completion after the proof clock ends;
no product operation is replayed, no missing response is guessed and the
original graph failure remains primary. Collection errors are independent
observation failures. Passing-case timer/order remains unchanged. A scoped
test verifies original failure/status remain FAIL while measured counts are
preserved through the read-only collection helper. Ten final workspace
evidence/cache tests PASS0.056s under main120s lock. Raw final test output is
workspace-final.* in the same checks root.

These are stricter harness evidence guards only; product source unchanged.
Shared build/remaining final owning checks and pilot membership audits remain
pending, with no SDK case setup/sample started. Production LOC79,366->79,366
(delta+0), same pinned absent-aware method; reference absent retiredR9c.

| `98b6b7260` | Guard own-write cache qualification and preserve failed-proof metrics | 79366 | 79366 | +0 |


Batch 2 shared execution route: sealed builds now compile/archive both host and
pinned-image edit writers, and compilation reuse binds every current recipe and
writer source. Original native SDK fixtures and expected states use the shared
frozen model; native preflight invokes the original full-byte verifier through
the edit tool, and each prepared helper seal includes the actual Linux writer.
The three committed SDK edit families are routed through the existing ordinary
Bash/Commit path. Capped cases retain their frozen 2,000 ms combined edit/Commit/
End watchdog; command, Commit, observer snapshot and End share one absolute
stop. Per-operation watchdogs never extend that group. Setup/warmup/mount/proof
are outside the original group. No SDK sample has begun.

`bench.py verify <run> --membership-audit <fresh-output> --build <seal>` adds
only the outstanding H-3 census over independent copies of retained stopped
Store exports. It requires the prior byte proof, Gone, known Stop, unchanged
product, sealed prepared manifest, exact original acknowledged root, and
unchanged old evidence hashes after each audit. It records zero samples and
leaves failed audit copies visible. Pilot audits remain pending until the
new sealed build exists; this commit claims no new oracle result.

Scoped final checks under separate 120 s locks: workspace evidence/cache/group
11 tests PASS 0.058 s; fixtures four PASS 0.011 s; offline audit copy/root-binding
one test (two root outcomes) PASS 0.013 s; build identity four PASS at corrected
import scope. The first added build-identity test invocation failed to import
the engine when run alone; use the same explicit module path as the owning
suite, preserving that failure in tool output. It now rejects changed model
and writer inputs before old executable use. Whitespace check PASS. Native
sealed-writer qualification, actual build and pilot census remain pending.
No product change. Production LOC 79,366 -> 79,366 (delta +0), pinned staged
absent-aware method; reference absent (retired R9c; last counted 65,417).

| `ac7beb4dd` | Seal SDK writer routing, frozen group watchdog and offline pilot census | 79366 | 79366 | +0 |


Prospective edit proof declarations integrated from workers `27713d9c7` and
`637d22460`: changing cases explicitly require exhaustive current inode-table
membership, current authenticated mapping grammar and complete summaries,
unchanged allocation scope/serial, and the strict retained-ID subset rule.
Capped cases additionally declare independent pre-Commit own-write cold backing
as an eligibility prerequisite; absence yields INELIGIBLE. Workloads, payloads,
limits, cache treatment and strict checkers do not change. These are pre-sample
metadata corrections, with no prepared SDK fixture or SDK sample yet. Final
owning six changing/capped contract tests PASS under the 120 s lock. Both worker
commits and this integration count unchanged product 79,366 -> 79,366, delta +0;
reference absent, pinned staged absent-aware counter.

| `27713d9c7` (worker) | Declare strict current edit and inode proof scope | 79366 | 79366 | +0 |
| `637d22460` (worker) | Declare independent own-write cache evidence for capped Commits | 79366 | 79366 | +0 |
| `f11ed53d1` | Integrate prospective edit proof and cache declarations | 79366 | 79366 | +0 |


H-3 pilot closure supplement at `f11ed53d1`: all 32 mounted pilot exported
Stores pass exhaustive current inode-table membership, complete paths/kinds/
metadata/aliases and exact original acknowledged root binding. Payload 8,
tiny 20 and namespace 4 audits use independent byte copies; every original
receipt manifest verifies again after its census. No original receipt or CSV
was modified, no case was replayed, no mount or Docker resource was created,
and every audit records zero samples. The four Init-only cases retain their
original selected-prefix verifier and are outside the mounted canonical census.
No product defect was found by this stronger check. Pilot batch completion
now includes the supplemental missing membership proof.

Raw supplemental receipts:
benchmark-results/fs-bench-pro/2026-10-10-pilot-payload-membership-f11ed53d1/;
benchmark-results/fs-bench-pro/2026-10-10-pilot-tiny-membership-f11ed53d1/;
benchmark-results/fs-bench-pro/2026-10-10-pilot-namespace-membership-f11ed53d1/.
Original per-family sources, measured walls/counts/storage/cache dispositions
and cleanup claims remain exactly those of their existing two CSVs.

Shared release build PASS under the 120 s lock (wall <=42 s), at clean
`f11ed53d1`, with host Cargo +1.85.1 locked/offline, repository ARM64 flags,
pinned image and actual source SHA-256 checks inside Linux before/after build.
OWNER-3's exact two passthrough refusals remain FAIL, not hidden or relabeled.
Build: benchmark-results/fs-bench-pro/2026-10-10-batch-2-edit-build-f11ed53d1/.
Runtime SHA-256 30fdd82303cf8f958386d0b68e0fae534ab037459baf75e14a5a697c406187e3;
daemon unchanged f44900cfc975901b7101f4874f708390b6f7401981e06d608b3df52a50848c0e;
edit host 50713e6f1eba811cc3c37bf813154dbac2d6bfd2f9f05d3abda98e6081f6151c;
edit Linux def64be844b0d5edf96af3903af0eae9511dbdc9161e7066daafa8f533e96fa1.
Native sealed writer qualification's three tests PASS 3.438 s, including all
11 original small shapes, complete bytes/metadata/native inode identity,
wrong-length refusal before mutation and detection of an untouched-byte
corruption. It ran once with the sealed compiled inputs before any SDK setup.
No product source changed; no full product/Clippy/CI claim is made.

The lead releases the current batch's three subagents to prepare/parity/sample
preserving, changing and capped families in their separate worktrees. Each
uses a new run branch from this audited integration plus a meaningful final
family registration/proof declaration commit; prior branches/receipts stay
intact. This keeps each two-CSV date/source destination distinct. Sealed
compiled inputs can be reused only if exact bytes still match; no shared
writable Cargo target is reused. Shared host/Docker VM interference is declared.
The lead owns the remaining canonical and small-delta families in batch 2.
No later batch has started. Production LOC 79,366 -> 79,366 (delta +0), pinned
absent-aware staged method; reference absent (retired R9c; last 65,417).

| `cca598d0b` | Close pilot membership supplement and release qualified edit workers | 79366 | 79366 | +0 |


Batch 2 setup reuse correction: the changing worker found no cross-case master
reuse mechanism in the preparation controller. The Python-only helper now
selects only a sibling sealed PASS workspace preparation with identical full
initial native fixture digest, unchanged product, explicit Disposable/WAL/OFF
profile and exact UID/GID. It validates all old evidence, closed host Store,
installed manifest and helper seals before reuse. A matching corrupt candidate
fails explicitly, with no fallback/reprepare/retry. New native expected trees
and executable helper seals remain case-specific; every measured sample still
gets an independent closed byte copy and original cache checks. No input,
workload, timeout, verifier or cache treatment changes. Resource receipts mark
reused master ownership false and name its prior sealed preparation. Setup
warmth remains explicit; reuse never establishes coldness. Existing prepared
cases are preserved without replay. Only preparation machinery changes; the
qualified compiled runtime/writer/daemon bytes can be reused unchanged.

Six scoped fixture tests PASS 0.028 s under the main 120 s lock, including
wrong input/profile/product/UID/GID rejection and refusal of a corrupt matching
master. No new measurement. Capped worker's first original insert preparation
already passed at `4f52124e4` (27 s) and is retained as the compatible closed
524,283,904-byte initial master:
layerfs-fsb-master-edit-length-changing-capped-d2b25e60d4de4cdb.
Other workers have not prepared an SDK case. Their prospective declarations
are `e1062c6d0` preserving and `d5336c13b` changing; all three are unchanged
product 79,366 -> 79,366 (delta +0), pinned staged absent-aware method. The
lead's canonical changes remain unstaged and are not part of this Python-only
reuse commit; workers must not take unrelated compiled-source changes.

| `4f52124e4` (worker) | Bind capped root and full payload proof declaration | 79366 | 79366 | +0 |
| `e1062c6d0` (worker) | Declare final preserving current graph/cache obligations | 79366 | 79366 | +0 |
| `d5336c13b` (worker) | Bind changing current oracle and own-write eligibility scope | 79366 | 79366 | +0 |
| `849b0aff1` | Reuse compatible closed initial masters without reusing measurement | 79366 | 79366 | +0 |


Batch 2 canonical family: all 12 original fixed 64 KiB overwrite cases are
ported under their original names. Exact frozen plans, fixture/payload seeds,
SHA-256 values and original count/digest pins are transcribed from the original
product-neutral registry, preserving the 147,456-byte offset and 65,536-byte
replacement. The shared positional writer remains the P-3 ordinary surface;
no product feature or optimization is added. Current typed file/map validation
is complete; initial and final extent counts must match the exact frozen
54/544/5,394/26,995 initial counts and original preserve/increase/decrease final
counts. Native expected bytes additionally match the original frozen final
SHA-256. Retired file/map/namespace ObjectIds remain explicit format provenance,
not current identifiers. Inode scope/serial, table membership and untouched
current payload-ID subset remain strict. Numeric own-write coldness remains
unknown and INELIGIBLE; limits and workload sizes remain unchanged.

Source metadata exporter initially used an incorrect scratch relative path;
compiler refused before any fixture/Store/run. Corrected metadata compile PASS
under 60 s lock and original self-check/export PASS under 10 s lock, with no
retired product linked. One owning original-plan/count/digest transcription
test PASS 2.483 s under 120 s lock. Runtime external oracle tests compiled with
--no-run first (PASS 2.04 s), then six scoped tests PASS under 120 s lock, with
19 frozen inline cases filtered; new guard rejects wrong initial or final
counts for every original canonical scenario. Owned rustfmt check and whitespace
PASS. The two known fixture-only unused helper warnings remain visible.
No canonical case has been prepared or sampled; release build, native parity
and 12 samples remain pending. Three worker edit cohorts proceed at independent
worktree sources with the previously qualified compiled bytes; the new canonical
count/digest code applies only to the canonical family and does not invalidate
their unaffected earlier qualification. Production LOC 79,366 -> 79,366 (delta
+0), pinned staged absent-aware method; reference absent (retired R9c; last 65,417).

| `7c4273669` (worker) | Integrate closed-master setup reuse for preserving cohort | 79366 | 79366 | +0 |
| `6fee225f4` (worker) | Integrate closed-master setup reuse for changing cohort | 79366 | 79366 | +0 |
| `1479e4d07` (worker) | Integrate closed-master setup reuse for capped cohort | 79366 | 79366 | +0 |
| `a34b5d44b` | Port all twelve canonical chunk-count cases with strict original counts | 79366 | 79366 | +0 |


Canonical cohort closure at clean `a34b5d44b`: every one of the twelve
original cases has sample/attempt/completed count exactly one, strict frozen
initial/final canonical counts and final digests PASS, complete native/current
persisted graph and inode census PASS, Gone and known Stop. All 12 numeric
rows are INELIGIBLE: measured source demands 5/7/9 across tiers and independent
pre-Commit own-write cold backing/metadata proof unavailable. No case failed,
no limit exceeded and no product defect surfaced. Maximum complete wall
3,090,631,083 ns; maximum independent proof 17,830,134,041 ns, against unchanged
15,000,000,000 and 45,000,000,000 ns. Counts/storage per original case are in
the generated two CSVs, with no ratio or speed judgment.

All twelve native preparations and parity passed before the first sample.
Their complete initial tree digests match the already sealed preserving inputs;
the explicit reuse-inputs.json plus four links in the prepared parent record
that setup reuse. Each reused origin is validated by committed compatible_master
before selecting its unchanged master volume. No new master volume was created
for canonical; all 24 passing sample container/volume removal receipts PASS.
No old or other worker resource is removed. Root mode/mtime normalization,
POSIX surface/timer, retired-format identities/resource assertions and unknown
coldness differences remain declared; strict count/byte/inode guards remain.

Raw root benchmark-results/fs-bench-pro/2026-10-10-batch-2-canonical-a34b5d44b/;
prepared/parity/build siblings retain original identities. Retained bench.py
verify PASS twelve cases without replay; report generated exactly 30-column
performance and 14-column verification CSVs, twelve rows each, under
baselines/core/2026-10-10-a34b5d44b/. One controller inspection attempted to
read report CSV before the async report command finished and got FileNotFound;
waiting for that existing command then reading its completed output corrected
the inspection, with no report rerun or sample. Source/build/proof receipts
were unaffected. Final source build uses runtime
51e6d7fd03e933ca753d99d557c50da6d2c964e18fae2f95244382f4157d4132,
edit-host 0acfd6b498d19b5156014091bc337bfeb1a7e3126a01bbc5bb094a3c26a7bfff,
edit-Linux a2060e5795c3e3b1bb4b904cf2acb762b135c14bd36aa654e4af5bc99786ac56;
daemon unchanged f44900cfc975901b7101f4874f708390b6f7401981e06d608b3df52a50848c0e.
Linux source hashes verified before/after; known OWNER-3 refusals remain FAIL.
No additional product tests/Clippy/CI claim. Production LOC 79,366 -> 79,366
(delta +0), pinned absent-aware staged method; reference absent retired R9c.

| `beeb7ad69` | Record twelve canonical cases, full strict proofs and numeric ineligibility | 79366 | 79366 | +0 |


Preserving family integration: prospective declaration `e1062c6d0` and result
`dcf4e75b9` are imported locally onto main, without duplicating shared setup
patch `7c4273669` (equivalent to main `849b0aff1`). Actual sampled source stays
`7c4273669dfb8a434c1ab58ce5433062b873575b` in the retained worker branch. All
12 cases have one attempt/sample/completion, full native/persisted byte/tree/
metadata/inode/mapping/retention proof PASS, Gone and known Stop. All 12 numeric
rows are INELIGIBLE from nonzero source demands and unavailable independent
pre-Commit own-write coldness. Exact demand vectors by 1/10/100/500 MiB: head
5/7/7/9, middle 5/8/8/10, tail 5/7/7/9. The worker corrected an earlier unverified
middle/tail summary; retained receipts and committed CSVs were always unchanged
and authoritative. No failure, hang, leaked mount, bug or exceeded limit.
Maximum measured wall 193,938,333 ns and proof 13,487,312,500 ns, against the
unchanged 15 s and 45 s bounds. Per-case storage and exact count triples remain
in both generated CSVs under baselines/core/2026-10-10-7c4273669/.

All 12 preparations and parity PASS before sampling, with exactly four closed
initial masters and independent per-case expectations/helpers; every measured
sample is an independent byte clone. All 24 passing sample container/volume
removal completions PASS. Retained masters are the four preserving volumes
named in the canonical reuse supplement above. Raw worktree root:
/Users/yifanxu/.codex/worktrees/fs-bench-pro-tiny-file-churn/layerfs/
benchmark-results/fs-bench-pro/2026-10-10-batch-2-preserving-7c4273669/.
Prepared and parity siblings stay intact; no archive/removal of ignored evidence.
Root integration's owning original scenario/payload/fixture/source test PASS;
imported 30/14-column CSVs have exactly 12 rows each, all proof PASS and Gone.
Unchanged writer/engine owning proof is reused, no native suite or measured case
replayed. No product source changed, no CI/product Clippy claim. Production LOC
79,366 -> 79,366 (delta +0), pinned staged absent-aware counter; reference absent
retired R9c, last counted 65,417.

| `dcf4e75b9` (worker) | Record twelve preserving cases and all strict proof results | 79366 | 79366 | +0 |
| `b9ffa63be` | Integrate preserving family closure and its two generated CSVs | 79366 | 79366 | +0 |


Capped family integration: prospective declaration `4f52124e4` and two-CSV
result `0ba775db9` imported onto main; shared `1479e4d07` is the already-main
setup patch, not applied twice. Actual sample source remains
`1479e4d07d6f75956bab750ba1eaee4344d60ca9` in the retained worktree branch.
All five original preparations and parity PASS before sampling; all five cases
attempted once, no retry/unchanged repeat. Append and zero extension complete
full 524,288,000-byte fresh native and strict persisted byte/inode/census/
retention proofs, Gone and known Stop; their passing sample resources are
removed. Both numeric rows are INELIGIBLE (seven measured source demands and
independent pre-Commit own-write coldness unavailable). Each recorded counts
11 requests / 179 owner jobs / 899 statements. Append wall 246,613,167 ns,
proof 11,862,696,041 ns, Store logical/allocated 530,875,288 / 530,882,560 B,
overlay logical/allocated 258,048 / 268,693,504 B. Zero extension wall
193,117,625 ns, proof 12,481,382,208 ns, Store 530,887,648 / 530,894,848 B,
overlay 258,048 / 268,693,504 B. Their unchanged 15 s product and 45 s proof
limits are WITHIN; no storage or speed judgment.

Three cases fail the original 2 s edit/Commit/End hard watchdog during command,
not a newly invented acceptance limit. Frozen supervisor source
benchmark/fs-bench-pro/src/main.rs:3883–3886 actually kills the original SDK
worker when that group expires. P-3 ordinary suffix read/write shifting is
incompatible with that unchanged watchdog for these cases. Later read-only
original Exec inspections find exit 0, separately retained; they establish no
bounded completion, Commit, byte proof, End, drain or Stop and cannot replace
missing original boundaries. No current-contract deadlock or byte defect is
established; a speed fix, workload change or SDK splice feature is forbidden.
These remain closed FAIL with proof NOT_RUN. Recorded partial controller
walls end at the original failure; command/Commit/unmount/count/storage values
remain UNAVAILABLE. The 15 s reported product limit is still WITHIN, independent
of the stricter group's failed execution. No limit is widened or reclassified.

| Exact failed original case | Partial controller wall ns | Retained sample volume | Retained container |
| --- | ---: | --- | --- |
| insert-middle-4k-input-524283904b-result-500mib-ops-1-capped-v1 | 2006271042 | layerfs-fsb-sample-88dfec81df194c75 | 8639e0ac339cbaec54f3797358f254279c31f167f27cfb81cf76a98f93b1db4e |
| prepend-head-4k-input-524283904b-result-500mib-ops-1-capped-v1 | 2009652334 | layerfs-fsb-sample-ca229edb569948cd | 8409dbd1acaaf98335da318be943bef3d6ad9ea2991d2fae11c0bc39857a9e1c |
| replace-grow-middle-2k-to-4k-input-524285952b-result-500mib-ops-1-capped-v1 | 2012600042 | layerfs-fsb-sample-085683615ce24524 | 2e2b4f2e30fa915a83ed047d025297e544f0f8a84d189394448af34043f55af5 |

Retained unknown mount keys, respectively:
8e28e42f94f1be1f5d6c4fdde8bdcdbe2eeb4e2bb70d00038f5355784ab20fc5;
6d50157b4c261c744631edbe9e27a02df34553f63c78dd434e1e15981f938d2b;
34f9c916704f2e210ee685fc694bf1357871e9f6ca72bfab75b3134ff59c3f6a.
Keep these containers/volumes/mount uncertainty intact. Closed prepared masters
layerfs-fsb-master-edit-length-changing-capped-d2b25e60d4de4cdb (524,283,904 B)
and layerfs-fsb-master-edit-length-changing-capped-7a73125237e64642
(524,285,952 B) remain available; exact shared fixture reuse is sealed in each
case-specific preparation. No old/other-owned resource is touched.

All five performance and five verification rows are committed under
baselines/core/2026-10-10-1479e4d07/. Retained verify preserves two PASS and
three NOT_RUN with aggregate exit 1, no proof replay; report succeeds with all
unknown failed metrics UNAVAILABLE. Raw worktree root:
/Users/yifanxu/.codex/worktrees/fs-bench-pro-edit-capped/layerfs/
benchmark-results/fs-bench-pro/2026-10-10-batch-2-capped-1479e4d07/.
Sealed report sibling family-handoff.json lists full custody and six worker
LOC comparisons. Root integration's four owning case-contract tests PASS
0.019 s under 120 s lock; imported 30/14-column CSVs each contain five cases.
No product source change, no optimization or CI/Clippy claim. Production LOC
79,366 -> 79,366 (delta +0), pinned staged absent-aware method; reference absent
(retired R9c; last counted 65,417).

| `0ba775db9` (worker) | Record five capped outcomes, including three unchanged watchdog failures | 79366 | 79366 | +0 |
| `4d8ccfc93` | Integrate capped closure and preserve every failed resource/case | 79366 | 79366 | +0 |


Changing family integration: prospective declaration `d5336c13b` and result
`b4ef6e208` imported onto main; local shared reuse `6fee225f4` is equivalent to
main's already integrated patch, not applied twice. Actual sample source stays
`6fee225f419ab019245592668300d693df88015a` in the retained worktree. All 32
original cases have sample/attempt/completed count exactly one, mounted full
native byte proof PASS, all mounts Gone and known runtime Stop. Twelve strict
persisted proofs PASS: append, truncate-tail and zero-extension at all four
sizes. Their passing sample resources are removed. Twenty strict proofs FAIL:
insert-middle, delete-middle, prepend, grow replacement and shrink replacement
at all four original sizes. All retain the unchanged payload-ID subset guard;
no checker is relaxed, operation replayed or product changed. Actual CSV status
is 12 INELIGIBLE plus 20 FAIL; all 32 cache predicates independently remain
INELIGIBLE for unavailable pre-Commit own-write cold evidence.

The maximum complete wall 12,772,310,459 ns and proof 11,821,126,209 ns remain
WITHIN unchanged 15,000,000,000 / 45,000,000,000 ns limits. Every case's exact
phase wall/count/storage observations are generated in the two 32-row CSVs
under baselines/core/2026-10-10-6fee225f4/. Failures keep completed measured
counts/storage collected once after known Stop, without replacing or replaying
the failed graph proof. No speed, storage or reference comparison verdict.

All twenty failures have independent copied-export public authenticated mapping
audits. Every acknowledged root matches, every complete mapping total is valid,
and every missing required old ID lies in the region actually overwritten by
the ordinary suffix-shifting writer; none is wholly before the actual write
start. Old SDK insertion/deletion was a semantic reference splice, whereas P-3
ordinary writes normalize into final-offset overwrite plus a tail adjustment.
Rechunking of actually modified capture therefore can replace old payload IDs
while exact logical bytes remain correct. This is an unsupported old SDK
physical-retention property on the authorized ordinary surface; no current
byte/refusal/publication/crash/hang defect is established. Restoring a splice
feature or changing construction for storage/speed is outside this iteration.
The strict original failures stay visible and closed, without a product fix.

First 1 MiB insertion example: inode serial 2 preserved, exact final length
1,052,672; mapping 54 -> 56 extents; three old IDs absent at
[532242,551701), [551701,567642), [1039075,1048576). Actual ordinary write
range [524288,1052672) becomes overwrite [524288,1048576) and tail insert
[1048576,1052672). Final root equals the exact acknowledged Commit. All native
and current persisted bytes/table membership were checked before the strict
retention guard rejected it. Original receipt/export hashes remain unchanged.

Raw root, containing handoff.json, retention-scope-analysis.json and current
resource observations:
/Users/yifanxu/.codex/worktrees/fs-bench-pro-namespace-mutation/layerfs/
benchmark-results/fs-bench-pro/2026-10-10-batch-2-changing-6fee225f4/.
One offline diagnostic assumed a case-local installed.manifest despite reuse
and failed FileNotFound before Store reads. Failed diagnostic is retained; a
new copied-export audit used the original graph command's exact manifest path.
No measured case or original export was replayed/mutated. Root's initial
handoff inspection treated an integer retained-resource count as an array and
failed TypeError; reading the documented resources list corrected inspection,
without changing results or resources.

All 32 preparations/parity PASS before the first sample: six exact immutable
initial masters, 26 validated reuse records, independent sample byte clones.
All 32 copy helpers and six provisioning helpers removed with original receipts;
12 passing sample pairs removed. Twenty failed sample pairs retained, known
Stop plus independent read-only Docker observation of stopped state. No mounts
remain in these failed cases; their actual Gone boundaries are preserved.

| Exact failed original case (retention property unsupported) | Retained sample volume | Retained stopped container |
| --- | --- | --- |
| insert-middle-4k-on-1mib-ops-1 | layerfs-fsb-sample-948436f3f23c4906 | 2f3211741fe6571ec6b2a56b377881b02ed7f3dec3443dca3f171f86474e8742 |
| insert-middle-4k-on-10mib-ops-1 | layerfs-fsb-sample-5beb04a85c12451f | 436946c2b114f502fa0a0e764ca51217db84182dee68bd04475c999ab118670e |
| insert-middle-4k-on-100mib-ops-1 | layerfs-fsb-sample-faf93ba5a2a9415a | c97f4c389a40e4c2b9205161eec3129859e5ce362b2b633a2297ff47bc40917c |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | layerfs-fsb-sample-722e993fa9a3493f | 57ab521d22f1990c5b9d04471a851e8c497c6ed265448b23765d7c4f7bbad924 |
| delete-middle-4k-on-1mib-ops-1 | layerfs-fsb-sample-42f4e454986c4610 | ef2fe1d8eaf2f7385730ad0f152d2e5b8d7f76ee023af1a991d8bbef01b6af2a |
| delete-middle-4k-on-10mib-ops-1 | layerfs-fsb-sample-b3ca99691e13414e | 029d95fcba2babb48e6457e0a3edded730389969936d74ba00df5764cd3ed569 |
| delete-middle-4k-on-100mib-ops-1 | layerfs-fsb-sample-5dfd9b92757a48d5 | c4a9096010dc1e81edd0dd73cc66f19a4ad4f8c24fceaac0d2bab2fec3f6f589 |
| delete-middle-4k-on-500mib-ops-1 | layerfs-fsb-sample-bbff2bdcac9a4549 | 6deb7ee42d76e68492999cef2718d467104aa147fa062c68399ced8cb30b1ce9 |
| prepend-head-4k-on-1mib-ops-1 | layerfs-fsb-sample-db30059350ac4178 | 7722cd9c332d8eb338b50a571246c98701c8d0a0409da2b540c7ce24c8da4b60 |
| prepend-head-4k-on-10mib-ops-1 | layerfs-fsb-sample-c33751b3b7cf4db5 | cc0e8dfd30eef3462a27491b820e4d1713367d3933cda38ec9ddea0d8c3c1579 |
| prepend-head-4k-on-100mib-ops-1 | layerfs-fsb-sample-961158709b444be1 | e215d5335233ada1599026c17dc3ab6aa579e39051f84d5f4c62248be762e9d0 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | layerfs-fsb-sample-28fdc3ccb85d44df | 7aadcc99dfce485fe36c3a89b66e0721357bc6628e64d30aaa87b51f2a97d33f |
| replace-grow-middle-2k-to-4k-on-1mib-ops-1 | layerfs-fsb-sample-11b57e9ab2c341a8 | aed5089da6a14f86ce7b707f4c8b74d8e3d728f4b6c0bd4a0d650280a68b4763 |
| replace-grow-middle-2k-to-4k-on-10mib-ops-1 | layerfs-fsb-sample-652b7f0606eb411b | 9467fb87e8971e24255feca9e6a23f35cf14a2b68540d8d9914ff1a7f160d311 |
| replace-grow-middle-2k-to-4k-on-100mib-ops-1 | layerfs-fsb-sample-d4ec0d5eec1549ec | 744bfaad410b2abf0a8ecce4b113f68ec00967ae1f34d0d573db0c72ee6b2e1d |
| replace-grow-middle-2k-to-4k-on-500mib-result-capped-v2-ops-1 | layerfs-fsb-sample-24556ffe6bf04529 | 8501df1719413d8c6ed530f88d4878312808bf4e1d4284af6b507fda7e0ec059 |
| replace-shrink-middle-4k-to-2k-on-1mib-ops-1 | layerfs-fsb-sample-65d255aadca341d7 | 2529b115192553f13d5154ca50411fee2d6e873427852bea5a211a7cee080e11 |
| replace-shrink-middle-4k-to-2k-on-10mib-ops-1 | layerfs-fsb-sample-1a343f218bb84d47 | d1ae0966f11f9972407a9dd3c85f32dce85a182615541719c7f4cf26d5769290 |
| replace-shrink-middle-4k-to-2k-on-100mib-ops-1 | layerfs-fsb-sample-0dd8ae3cc2ca4145 | bfacaef8520c9aabe9026ec3f12d4041d1486dc436ca170930c69850c9d64bad |
| replace-shrink-middle-4k-to-2k-on-500mib-ops-1 | layerfs-fsb-sample-87253580856148db | fb5f3b0552d51f533e47a168be33af089cd50c2dd3dbd38d5fa2db9f320dcb79 |

Six retained immutable master volumes:

- layerfs-fsb-master-edit-length-changing-131fa3579df147c5
- layerfs-fsb-master-edit-length-changing-1569ecbe61d64fe0
- layerfs-fsb-master-edit-length-changing-29c45685f6bf487b
- layerfs-fsb-master-edit-length-changing-67a2cd17955540f8
- layerfs-fsb-master-edit-length-changing-87a51e24fc0946df
- layerfs-fsb-master-edit-length-changing-99b212255e814bab

Root integration's two original-plan/payload/metadata tests PASS 0.040 s under
120 s lock; imported schemas/rows/failed statuses/Gone/limits match all original
receipts. Retained verify appropriately returns exit 1 for 20 FAIL / 12 PASS,
with all original manifests valid; no sample replay. No product change, no
optimization, no Clippy/CI claim. Production LOC 79,366 -> 79,366 (delta +0),
pinned staged absent-aware method; reference absent (retired R9c; last 65,417).

| `b4ef6e208` (worker) | Record all 32 changing cases and preserve twenty strict failures | 79366 | 79366 | +0 |
| This commit | Integrate changing closure and exact retained failed resources | 79366 | 79366 | +0 |
