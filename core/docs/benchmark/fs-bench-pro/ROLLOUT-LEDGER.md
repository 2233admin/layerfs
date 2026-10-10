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
| 1 Pilot | IN_PROGRESS | Init port/runtime support in this commit | Release build, four fixture preparations, parity and four Init samples |
| 2 Edits | PENDING | — | Wait for batch 1 completion |
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

## Bugs

| Bug | Case | Symptom | Cause | Fix commit | External test |
| --- | --- | --- | --- | --- | --- |
| H-1 | C07 | Workload and verifier passed, unmount returned, residency helper refused changed file identity | Harness inspected overlay while automatic post-unmount reclamation was still mutating backing | This commit | `test_backing_observer_waits_for_original_reclamation_to_finish` |

H-1 is a harness ordering fault, not a product correctness or performance defect.
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

| This commit | Port Init definitions and host runtime/parity support | 79366 | 79366 | +0 |
