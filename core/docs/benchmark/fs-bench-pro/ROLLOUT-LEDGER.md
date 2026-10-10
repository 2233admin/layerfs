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
| 1 Pilot | COMPLETE: 36 functional/proof/clean-close passes; 7 recorded scoped B PASS, 29 INELIGIBLE; full numeric qualification of the 7 is unverified | Init `c1d7dd0e8`/`39bbcbd6b`; payload `200f81493`/`c1d9b6c58`; parallel routing `b3c96ecb1`; tiny `36849bcc2`/`d6e0ef952`; namespace `98b14b233`/`be1f56a23`; H-2 fix `222526fa0`; closure `d4314ed62`; membership supplement `cca598d0b` | Batch 2, retaining original receipts plus exhaustive membership supplement |
| 2 Edits | COMPLETE: all62 cases ported/parity/sampled once/recorded;39 strict proof and clean-close passes (numeric INELIGIBLE),20 strict retention failures and3 original capped-watchdog failures retained | Canonical `a34b5d44b`/`beeb7ad69`; preserving `b9ffa63be`; capped `4d8ccfc93`; changing `05ffbf971`; small-delta `c0c99a4a3`/`2e6a508b5`/`1c975ba30` | Begin batch3; no identified fixable product correctness defect remains in batch2 |
| 3 Trees and tools | COMPLETE: all33 original cases ported/parity/sampled, full applicable proofs and clean closePASS; numeric33INELIGIBLE; first snapshotFAIL retained separately; localitydense500 and snapshot EXCEEDED | Shared3c697ae92; directory50c297c68/ad4f95503; locality2590a4536/26c037d90; snapshot0344bfdc6/fix03033abdc/results98d3be30a/70d568e94; Git acebd7cbd/guard031d427a7/results31fff4d49 | Begin batch4 after this committed closure, no identified fixable product correctness bug |
| 4 History on one branch | IN_PROGRESS: all43 original cases ported; shared source/oracles/seal qualified; boundary7 and dedup26 preparation/parity PASS; mixed preparation underway; first boundary/dedup H11 FAIL retained; H11 fixed/actual recovery qualified; changed-source43selection execution active with lastmixedprepFAIL/NOT_RUN | Routing65f0c1fbe; nativea921bedbd; portsfc9e71fae/6a5433e79/4762b720c; prepared364e1a87a; guarded5ebdac535/report65df42e91; controller686344e8f/guard91cf97fab; public93f0d3dfe/census7d9380fe0; finalseal a70f3197b; preparation dispatch87857f5bd; first failed CSVs this commit | Complete each family's original one-attempt cases and commit its two CSVs with retained failures/custody |
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

| 29 | Distinguish the declared B/C daemon/mount predicate from full per-phase OS/backing/metadata/SQLite qualification; preserve old scoped labels and fail closed for future unknown inputs | Owner forbids setup or earlier-phase OS warmth; zero canonical object demand does not prove the still-paid history read's input cache state | Treating a post-unmount mincore observation or zero demand as full coldness, editing old verdicts, or changing cache treatment |
| 30 | Prove all retained small-delta roots through public offline current-format history/filesystem reads; declare omitted historical kernel Fork/Mount topology | Direct mounting takes a Branch and the existing batch-5 Fork route has not yet been qualified; final native remount/cleanup remain required | Manufacturing a feature or claiming identical proof topology |
| 31 | Preserve original payload DELTA existence and thirty-second per-state proof stops | The frozen selected contract requires actual DELTA reconstruction and bounds each state, independently of numeric storage/latency targets | Treating reported DELTA counts as optional or replacing per-state stops with only a phase stop |
| 32 | Reuse exact unchanged compiled support with original source/provenance receipts when only host control/oracle support changes | Unaffected evidence may be reused when actual compiled inputs and binary hashes remain identical | Rebuilding unaffected binaries or reusing a measured sample |
| 33 | Parallelize only the four current batch3 families after committed batch2 closure; lead owns shared controller and local snapshot, workers own directory/Git/locality | Owner explicitly authorized separate worktrees; previous batch done-when conditions are now closed | Starting later batches or editing one shared checkout concurrently |
| 34 | Clean locality case skips warm-up and measured Exec; scan/construction proofs validate recorded original semantic operation counts | Frozen clean case is owner-only; final tree equality alone cannot prove a read-only traversal visited every required path | Running a no-op Exec or replaying the workload to reconstruct its counters |
| 35 | Git's prior untimed mount runs the original verification variant before End without Commit; the fresh measured call retains the exact performance variant | Preserves actual mounted intermediate porcelain/diff/temp-save guards without adding timed filesystem reads or replaying a measured call | Claiming native-only intermediate coverage or modifying the timed workload |
| 36 | Reuse original native fixture/C1 generator for local snapshot, derive C2/C3 with frozen97*j/byte equations and verify every state with unchanged original native checker | Avoids changing compiled recipe support solely to select an already defined expected step; runtime also compares each manifest with original Rust expected(case,step) | Guessing state bytes or compiling another fixture producer |
| 37 | Retain the failed full-size debug proof and qualify the benchmark's prescribed release compilation at identical fixture/oracle/30s stop | Debug child reached its stop during the first25k state, without an error or completed root; engine builds the host runtime in release; no source speed change is selected | Enlarging the stop, shrinking the test or optimizing product source |
| 38 | Preserve Git's frozen41s work cutoff,45s cleanup deadline and59s publication deadline with0.25s guard, cumulatively charging prior qualification/custody/final proof | Original selected verifier reserves4s within45s, not an added allowance; public current offline graph requires early Stop/export, also conservatively charged before graph work | Dropping reserve, omitting receipt hashing/publication or granting each verification subphase a fresh45s |
| 39 | Publish original receipt/manifest once and require bound completion; revoke only an owned provisional completion link after an observed overrun, preserving its exact attempt bytes | A lost late-failure sidecar must not let a provisional proof qualify; original immutable receipt and all metrics remain available | Overwriting original receipts, accepting missing completion or omitting a late final write from the guard |
| 40 | Add an unfiltered read-only current SQLite Commit census of a custody-qualified closed export, alongside mandatory public typed history/content proof | Original dedup history queries the complete global set and parents; anchored ancestry cannot detect an extra unreachable Commit | Adding a product enumeration feature, counting only rows, filtering by stack/ancestry or silently omitting the original census |
| 41 | M1 uses independent shadow/range algebra and only original explicit attributes, helper-created directory modes and declared byte ranges; two exhaustive IDs are proof-only | Frozen generic expected() returns pristine fixture for M1; actual original exhaustive scope checks20 cycle-end roots plus all100 Commit IDs/parents, not all100 stage payloads | Using a wrong generic manifest, inventing timed performance or normalizing automatic mtimes to fit an oracle |
| 42 | Preserve strict boundary-alias parent-directory mtime compatibility failure without restoring the parent in the workload | Frozen ordinary helper changes the parent during its final atomic save, while original executable verifier requires fixture mtime; changing the helper/checker is forbidden | Normalizing parent mtime, dropping metadata verification or making a product change for an incompatible original definition |
| 43 | Retain owned sample resources through finalization and outer acknowledgement; remove only afterwards with separate bound administrative custody | Late output-close/publication failure must retain its diagnostic container/volume; partial Docker deletion must never claim both resources retained | Deleting before final verdict or overwriting the original receipt after deletion |
| 44 | Recover failed agent service compaction in the same worktree with a fresh context and reuse exact completed qualifications | Two service stream failures left source and receipts intact; source-hash-matched final6tests had already passed | Replaying tests/exporter or discarding unfinished source |
| 45 | Seal final stable native/Linux assets once, then rebuild only the changed host oracle with qualified eight-binary reuse | Pinned Linux/CPP scopes are final and unchanged by subsequent runtime-only proof work | Duplicating unchanged Linux/native builds or using an unqualified stale binary |
| 46 | Close original500MB exhaustive preparation as FAIL and its caseNOT_RUN; preserve failed parity/batch closure while permitting other originalcases and laterbatches | One unchanged120s preparation expired after15of20 native expectations; a sealed fixture cannot be invented, another attempt/limit increase/scope reduction is forbidden, and no product correctness defect was identified | Retrying setup, shrinking original proof scope, pretending whole-family parityPASS or indefinitely blocking runnable originalcases |
| 47 | Keep separate authenticated runs and CSV pairs when a shared harness fix interrupts a family; select unaffected earlier results by their actual source in the final family report | Each run binds one source, and completed unaffected cases must not be repeated or relabelled | Copying earlier receipts into a new source run, inventing a common measured identity, or repeating all earlier cases |

## Bugs

| Bug | Case | Symptom | Cause | Fix commit | External test |
| --- | --- | --- | --- | --- | --- |
| H-1 | C07 | Workload and verifier passed, unmount returned, residency helper refused changed file identity | Harness inspected overlay while automatic post-unmount reclamation was still mutating backing | `a1f2c259c` | `test_backing_observer_waits_for_original_reclamation_to_finish` |

| H-3 | Generic mounted pilot proofs and prospective SDK proofs | Reachable path walk omitted exhaustive inode-table membership from original canonical verifier | Runtime compared declared paths/bytes but never enumerated current inode table | `37ec6826b` | edit_oracle_complete_membership_accepts_exact_and_rejects_unreachable_or_missing_rows |
| H-4 | Prospective B/C Commit eligibility | Zero source demands could credit own-written backing without independent pre-Commit coldness | Cache classifier checked source demand/lifetime but not own-written phase inputs | `98b6b7260` | test_zero_source_demands_cannot_credit_own_written_commit_input |
| H-5 | Seven recorded pilot read-only B labels; future B/C rows | Scoped zero canonical-object demand was treated as full numerical cache qualification | Still-paid backing/metadata/SQLite pre-phase domains absent; terminal mincore and an object-demand interval ending before unmount cannot establish them | `25719de3b` (prospective only) | test_zero_object_demands_do_not_qualify_unobserved_paid_phase_inputs; test_each_phase_proof_rejects_late_unknown_wrong_identity_or_warm_inputs |
| H-2 | 36 batch-1 reviewed registrations | source_commit was an annotated tag object; parity accepted it and rejected the actual peeled commit | git rev-parse on an annotated reference returns the tag object unless peeled | `222526fa0` | test_review_identity.py rejects the tag through both parity routes, admits the peeled commit and checks every ported review |
| H-6 | local-snapshot-create-25000-onebyte-v1 | Original native witness exited0, then controller raised dictionary update #5 after measuredEnd | Frozen sample receipt has multiline path/range values and no verification_status; harness assumed full-tree key/value receipt | `03033abdc` | test_original_multiline_sample_with_successful_exit_is_preserved fails beforefix; altered paths/ranges/scope/exit are rejected afterfix |
| H-7 | Prospective Git4, found before first sample | Late observation publication followed by failed failure-sidecar write or process death before final post-check could reload provisional PASS | Draft guard bound timestamp before the observation write and lacked mandatory completion/known outer return | `031d427a7` | slow observation/completion publication plus failed failure-sidecar and os._exit(91) regressions fail before correction; missing completion/outer acknowledgement remain failed |
| H-8 | Prospective batch4, found before any attempt | Output-close or final publication failure could retain FAIL after deleting sample resources | Administrative container/volume removal occurred before finally close/verdict/publication and driver acknowledgement; partial removal also claimed blanket retained custody | `56a422544` | test_close_failure_after_all_proofs_keeps_container_and_volume fails against a921bedbd with both rm calls observed; missing outer ACK/failed return do no removal, partial lost-volume acknowledgement remains uncertain and immutable bound |
| H-9 | Prospective two verification-only cases | Overall output-closeFAIL could disappear in CSV when performance wasN/A and semantic proof retainedPASS | Original proof-only mask omitted the independent full-outcome failure tag | Worker2fe8e9b2e / integration65df42e91 | test_overall_close_failure_remains_visible_beside_passing_semantic_proof fails beforefix; final5reportchecks PASS0.048s |
| H-10 | Prospective batch4 prepared SDK routes | Missing/partial prepared-step map could invoke native fallback and regenerate original payloads inside measuredwork; stale sealed helpers could disagree with reported current build | Controller trusted optional prepared records without mandatory originalstep/binary/descriptor/payload/script correspondence admission | Workera8c56d570 / integration91cf97fab | test_helper_refusal_precedes_case_claim_and_any_clone_or_mount fails at686344e8f; exact-source temporary assets reject five old-admission bypasses and all15guard checks PASS |
| H-11 | v016-boundary-small-control-v1 and dedup-history-distributed-1 first attempts | Native proof/acknowledged Commits/Gone/KnownStop pass, independent public history proof fails acknowledged Commit missing | Controller copies only exported main file into typed-store, dropping closed WAL; immutable main-only census would also miss WAL | Workerf2c143b37 / integration2b52bdf17 | Real closed-WAL controller regression sees0 of100 acknowledged test rows on old main-only copy; red0.067s under120s mainlock |
| H-12 | Mixed final failed preparation and prospective failed family parity | First missing/invalid preparation aborts parity without retaining earlier/later original case outcomes; CLI propagates only an exception | parity_workspace raises inside first failed case before writing parity.json | Worker47e5a5500 / integrationea7148a19 | Missing middle preparation red fails old behavior; all original membership/pin/bytes/native/seal guards retain FAIL reasons,22checksPASS; CLI old exception red retained,new5driverchecksPASS |
| H-13 | dedup-history-distributed-500 setup at7905 | stage-code-check exits255: exec /bin/bash argument list too long, before any mount/product operation | fixtures.stage embeds all500 prepared-step/helper SHA rows into one165,872B Bash -c argv | PENDING file-backed complete authenticated checksum manifest | Worker owns external500-step/complete-row/remote-manifest/payload tamper regression; original fullchecker retained |

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
| `05ffbf971` | Integrate changing closure and exact retained failed resources | 79366 | 79366 | +0 |


H-5 cache qualification scope audit: at the original seven pilot read-only
numeric PASS receipts, Class B's daemon canonical-object predicate passed, but
full per-phase backing/metadata/SQLite cache eligibility was not established.
S8-PROOF-PLAN-20261008.md section 6 says B still pays the history read and must
declare Store residency; cluster-two/cache/README.md:32–35 explicitly limits
ELIGIBLE to the tested predicate and leaves metadata/reader/SQLite scope
separate. Actual bind still invokes read_handle::snapshot -> history.branch_snapshot
independently of canonical-object counters. Every reviewed row has UpToDate
and zero object-batch delta, but no pre-mount cold backing/metadata/reader proof.
Mincore runs only after measured unmount and automatic Gone, without eviction.

| Original recorded scoped-B PASS case | Post-phase Store resident/total pages |
| --- | --- |
| payload-random-read-1-compact-v2 | 301 / 301 |
| payload-random-read-10-compact-v2 | 2634 / 2634 |
| payload-random-read-100 | 121178 / 129564 |
| tiny-stat-1-compact-v2 | 306 / 306 |
| tiny-stat-10-compact-v2 | 2658 / 2658 |
| tiny-stat-100-mixed-v4 | 26179 / 26179 |
| tiny-stat-500-mixed-v4 | 121665 / 130025 |

These post-phase observations cannot establish pre-attempt state or attribute
warmth. Original receipt/CSV labels, walls, counts, storage and functional proofs
remain unchanged as history; the seven labels establish only their original
scoped predicate and must not be read as full numerical cache qualification.
All 36 pilot cases retain functional proof/clean closure, with the missing
membership check separately completed. No pilot replay or numerical performance
claim follows from the scope audit. The lead previously summarized those labels
as numeric PASS without this qualification; this supplement corrects that
interpretation, without relabeling or promoting a historical receipt.

The spec's cache paragraph is clarified in its own commit to follow the owner's
absolute no-setup/earlier-phase warmth rule. B/C remain the requested product
regimes, while full cache eligibility needs identity-bound pre-phase backing,
metadata and SQLite/reader evidence. Future missing/unknown scope fails closed
INELIGIBLE, without eviction, cache/workload/limit changes, or product changes.
The current guard correction and its external failing regression are pending
next, with no new sample begun. Small-delta already declares unavailable own-write
coldness and INELIGIBLE; its authoring continues independently. Production LOC
79,366 -> 79,366 (delta +0), pinned absent-aware staged method; reference absent
retired R9c, last counted 65,417. Documents only, no tests or measurement replay.

| `c9aaddf02` | Clarify full phase-cache qualification and preserve old scoped predicates | 79366 | 79366 | +0 |


H-5 prospective fail-closed guard: cache.regime_status retains the original
selected B/C predicate, while cache.validate additionally requires complete
identity-bound observations before mount, command, Commit and unmount for
still-paid OS backing, metadata and SQLite/reader scopes. Exact measured
phase bindings and starts must match observations, clocks must be monotonic,
observations strictly precede starts, all scopes must be complete, present
Store/overlay identities checked, backing pages zero and metadata/reader states
verified cold. Missing, mismatched, warm, late, partial or unknown evidence is
INELIGIBLE. The original own-write pre-Commit guard remains independently
required; no observer or measurement is fabricated to satisfy either guard.
Current runners supply no such full evidence, so future B/C numeric rows fail
closed while independent functional proof status is unchanged. No eviction,
cache policy/workload/worker/limit change or product optimization is introduced.

External regression fails on the before source with ELIGIBLE instead of
INELIGIBLE for zero object demand plus only a terminal observation. Raw failed
output is benchmark-results/fs-bench-pro/2026-10-10-phase-cache-guard-checks/
before.stdout and before.stderr. Thirteen final owning workspace evidence/cache
checks PASS 0.061 s under the 120 s lock; raw after.stdout/after.stderr retain
all results. Positive synthetic evidence tests include all required phase
bindings, so existing terminal cleanup/demand/lifetime and own-write checks are
still meaningfully tested rather than masked by missing new fields. Every
phase rejects late observation, wrong identity, positive/bool residency,
unknown metadata/reader scope or incomplete paid inputs. Whitespace PASS.
Original seven labels/receipts/CSVs remain unchanged and their full numerical
qualification remains unverified, as the separate spec supplement records.
No case replay. No product source change, no Clippy/CI claim. Production LOC
79,366 -> 79,366 (delta +0), pinned staged absent-aware method; reference absent
retired R9c, last counted 65,417.

Additional audit scope: StoreWork.object_batches scalar ends at measured Status
before timed unmount, not the complete timed boundary. The seven original
mount-after-warm intervals report 27 foreground SQLite executions (31 for tiny
stat 500), 10/11 canonical cache hits and zero object batches. Those instrumented
counts remain paid observations, not disk/cache-miss/coldness proof. History
snapshot reads are not canonical-object batches. This guard avoids using that
scoped scalar as an all-phase cache certificate.

| `25719de3b` | Require complete pre-phase cache evidence beyond B/C scoped predicates | 79366 | 79366 | +0 |

Small-file-delta support integrated from worker commits `bec3a0e75`,
`cf9fe706e` and `53853a02e`; worker `561b5ec10` carries the identical H-5
Python guard already on main and is not duplicated. Registration is committed
before preparation or sampling. The unchanged original builder supplies ten
files (245,760 initial bytes), thirty whole-file fs::copy imports and thirty-one
independent semantic manifests. Current public History/Filesystem/Storage reads
bind every actual acknowledged Commit, parent, stack/base and final head to the
same stopped sample Store, check every byte/path/mode/mtime and exhaustive inode
membership, then inspect authenticated selected regular-file payload records.
The historical kernel Fork/Mount proof topology is declared as an omission;
the final fresh mounted native proof and terminal cleanup remain required.

Original actual DELTA-path execution remains an existence condition independent
of complete semantic proof. Known FULL-only output or unavailable payload
encoding evidence leaves the case FAIL and retains stopped resources; generic
metadata links do not substitute. No count/percentage or latency/storage quota
is added. Every retained state is proved by its own child with a thirty-second
stop, while each child also validates all thirty-one acknowledgement rows and
the final head. The original absolute 600-second phase stop is unchanged.
Original resource/free-space guards run at their original boundaries; exact
read-only observer walls are retained and excluded from product time using the
existing PerformanceClock exclusion API, but still consume the absolute phase
deadline. The actual own sample container must read back the original two-CPU,
2-GiB/no-swap/256-PID profile. No master or protected resource is configured.

Pre-sample authoring failures remain visible: the first host --no-run found an
extra extracted-verifier borrow and missing PackPersistence trait import, fixed
in harness support; a formatting invocation followed modules into six frozen
files, which were restored exactly and checked against the recovery source
before any commit/sample; the first broad history/workspace test selection
included unrelated frozen reference self-checks and reached the 120-second
ceiling (FAILED/hang), diagnosed from the full-size debug history self-check.
Final restored-source builds and explicitly scoped complete_history_ and
workspace_graph_ tests passed without weakening any test. The first native
qualification failed E0603 on the frozen wrapper's private storage_smoke module;
the corrected test compiles the unchanged original module directly. Final
native qualification PASS 6.846 seconds covers all thirty-one states, thirty
full imports, metadata/inode preservation and intentional final-byte corruption
rejection; its first failed receipt stays retained. No product bug or sample
replay occurred during these authoring checks.

At integrated source the five mechanical family tests PASS 0.256 seconds; the
native test is explicitly skipped because its qualified worker seal is reused.
Thirteen owning workspace/cache tests PASS 0.061 seconds, both under the
120-second lock. One lead discovery invocation mistakenly named the parent
tests directory, found zero tests and returned failure; corrected discovery
names tests/engine and runs all thirteen. Read-only probes also named nonexistent
engine module paths; corrected file inventory established the owning paths.
Neither invocation touched product/source or repeated a benchmark. Worker final
external complete/selected-old-root ancestry and byte-corruption tests pass;
the final host compiled identity is still being sealed before any sample.
Product tree remains 10bd8215443766fa2509fa5f90cf0044200ba7be. Production LOC
79,366 -> 79,366 (delta +0), exact pinned staged absent-aware method; reference
absent (retired R9c; last counted 65,417). No Clippy/CI or numerical cache
qualification claim follows from harness-only checks.

| `bec3a0e75` (worker) | Register original small-delta fixture/history support | 79366 | 79366 | +0 |
| `cf9fe706e` (worker) | Qualify unchanged native importer through original module | 79366 | 79366 | +0 |
| `561b5ec10` (worker) | Apply main H-5 guard without duplicate main integration | 79366 | 79366 | +0 |
| `53853a02e` (worker) | Preserve payload mechanism and per-state proof stops | 79366 | 79366 | +0 |
| `c0c99a4a3` | Integrate reviewed small-delta support before preparation/sample | 79366 | 79366 | +0 |

Qualified compiled-support reuse integrated from worker `dbcae7b12`. The
committed entry point now accepts bench.py build --reuse-unchanged ORIGINAL:
only host-runtime compiled inputs may differ. Exact eight binary keys,
hashes/sizes, original full build manifest, clean before/after source identities,
both complete Linux source hash passes, pinned image/readback, ARM64 flags,
Disposable/overlay/worker profiles, product tree and exact OWNER-3 refusal
evidence are checked before reuse. Changed product, recipe, workload or writer
bytes refuse admission. Failure retains declared scope and attempted child
custody without a successful seal. No Docker resource is created by the narrow
host build. Chained host-only seals are not accepted as original full builds.

Eight owning build identity tests PASS 0.012 seconds under the main120s lock;
worker eight PASS0.018 seconds and original full-build evidence validation PASS.
The earlier ad hoc host diagnostic rebuilt in8seconds but remains diagnostic
and unsampled. The committed route created a separate supported final seal in
<=3seconds at dbcae7b12, runtime
fb2031585ac06026a4871f755d63d79420db7a7d3d1d63ceb68f0c1b9dd33c2f,
seven immutable support binaries reused and daemon f44900... unchanged.
Raw worker build directory is benchmark-results/fs-bench-pro/
2026-10-10-batch-2-small-delta-build-dbcae7b12-supported. Final case preparation
is in progress; no sample outcome is yet claimed. This implements decision32
without changing the product, workload, cache, worker count or any limit.
Production LOC79,366 ->79,366 (delta+0), pinned staged absent-aware method;
reference absent (retired R9c; last counted65,417).

| `dbcae7b12` (worker) | Add qualified host-only build support to bench.py | 79366 | 79366 | +0 |
| `2e6a508b5` | Integrate qualified immutable support reuse and its scoped checks | 79366 | 79366 | +0 |

Small-file-delta closed from worker result commit `be5fc295e`. One sample at
clean dbcae7b12: all30 original whole-file imports and Created/Committed
acknowledgements completed on one Workspace. All31 actual roots from the same
closed measured Store passed complete bytes/metadata/ancestry/inode proof,
7,624,960 verified bytes and341 total paths. Authenticated regular-file payload
DELTA dependency existence passed,257 per-state record observations (repeated
content IDs possible, not a unique-object count). Final fresh native verifier
PASS, measured and verifier terminal unmounts Gone and KNOWN_STOP. Numeric
INELIGIBLE stays visible because initial/warm interval, full paid backing,
metadata/SQLite and own-write coldness are unavailable. No product bug surfaced
and the case was not repeated.

Recorded complete product wall1,688,425,918ns; raw absolute mount-through-End
wall5,420,649,583ns includes60 read-only original resource-observer intervals
totaling3,732,223,665ns, retained individually. Phases are mount8,160,042ns,
commands1,289,511,875ns, Commits236,492,002ns and unmount4,011,125ns. Separate
proof2,402,421,666ns; max importer+Commit step71,246,667ns and max selected-root
proof child43,129,417ns. All original600s phase and30s per-state stops are
WITHIN, with no limit or workload changes. Counts402 requests/3142 owner
jobs/14764 statements. Store logical2,412,624B/allocated2,416,640B; overlay
logical286,720B/allocated268,722,176B. Original2CPU/2GiB/no-swap/256PID profile
readback is exact; all30 resource checks record zero OOM/OOM-kill/swap. The
53,334,016B VmHWM is process-lifetime diagnostic only, not a phase peak.

Raw run remains in the tiny worker at
/Users/yifanxu/.codex/worktrees/fs-bench-pro-tiny-file-churn/layerfs/
benchmark-results/fs-bench-pro/2026-10-10-batch-2-small-delta-dbcae7b12/.
Retained receipt verification PASS, report generated once. The two generated
CSVs under baselines/core/2026-10-10-dbcae7b12 have the exact30/14-column
schemas and one row each (performance INELIGIBLE/proof PASS). Functionally
passing sample container
96cfc0e55fae6165dd4362632339ffd2112e9f47d37bd25b2bd9964c771f12e4 and sample
volume layerfs-fsb-sample-60324439af044ce5 were removed with successful cleanup
receipts. Closed initial master
layerfs-fsb-master-small-file-delta-smoke-7ab14dadc3d1479c remains for reuse.
All earlier failed/uncertain resources, protected resources and unsampled
diagnostic builds remain untouched.

Batch2 closure: five original families/all62 cases registered as ported,
parity passed with differences declared, one sample each, generated CSVs
committed with every row/reference. Canonical12, preserving12, changing12,
capped2 and small-delta1 have strict proof/clean-close PASS;39 numeric rows
are INELIGIBLE. Changing20 strict original retention failures and capped3
watchdog failures remain FAIL with the source-backed reasons and resources
recorded above. None establishes a fixable wrong-byte/publication/refusal/
deadlock product defect; no optimization or new splice feature is authorized.
All batch2 declared reporting limits are WITHIN. The rollout now has98 ported
cases across nine families and175 pending cases across sixteen families.
Product79,366 unchanged; no speed, release or reference-comparison verdict.

| `be5fc295e` (worker) | Record one small-delta sample with all31 root proofs | 79366 | 79366 | +0 |
| `1c975ba30` | Integrate small-delta CSVs and close all62 batch2 cases | 79366 | 79366 | +0 |

Batch3 shared activation admits the four original families through the existing
fixture/entry-point allowlist; pending registrations remain unsampleable. A
control_only registration now skips both untimed warm-up Exec and measured
Exec, retaining mount, Commit and terminal unmount and command_ns0. The explicit
original_ordinary_guards declaration configures/read-backs only the own sample's
original2CPU/2GiB/no-swap/256PID container profile before timing, then observes
the exact frozen main-file Store apparent/allocated4GiB bound and actual
cgroup OOM/swap before/after Commit and after native proof. Read-only observer
walls remain individually recorded and excluded from product time. No page
touch/eviction, retry, Disposable backing fsync or product configuration change
is introduced. Full Store+sidecar/overlay metric scopes remain separate.

Retired host Store RSS and physical-spool peak observers belonged to the retired
host data plane. Current cgroup/stat checks do not assert equivalence or a PASS
for those unavailable peak domains; registrations must state the exact gaps.
The original_operation_counts declaration additionally requires each exact
frozen semantic counter once in the original workload stdout (paths/files/
directory entries/read bytes or constructed chains), rejecting absent,
duplicated, unknown or wrong values without rerunning any operation. Counts
remain source/receipt observations; no nominal syscall-count equality is added.

Sixteen owning workspace/controller/cache tests PASS0.076s under120s lock,
including clean no-Exec control flow with original refusal custody, exact main
Store boundary, unknown/type/overflow/OOM/swap rejection, and missing/duplicate/
wrong traversal-counter rejection. Fixture scoped checks and whitespace PASS.
No batch3 sample has begun. Worker source review finds all33 batch3 cases
expressible using existing product routes, subject to actual parity/proof.
Production LOC79,366 ->79,366(delta+0), pinned staged absent-aware method;
reference absent, retiredR9c,last65,417. Harness changes only.

| `3c697ae92` | Activate batch3 routing with clean control and original ordinary guards | 79366 | 79366 | +0 |

Directory-construction/traversal registration integrated from `5773c34fb`:
twelve original IDs, seed1, four exact tiers, original ranked chain/depth
algebra and untouched ordinary workload. Construction expects Committed;
metadata/content scans expect UpToDate. Mechanical source/provenance/algebra
checks PASS under120s lock, and original total-path/file/directory-entry/read
byte or constructed-chain counters are declared for retained stdout checking.
Unknown ClassB paid backing/metadata/SQLite and own-write cache evidence remains
INELIGIBLE. Current complete native/persisted names/kinds/modes/mtime/bytes and
inode census are stronger than the original mixed-tier sampled reopen proof;
retired-format ObjectId equivalence/unreferenced-object census and retired
host Store RSS/physical-spool peak diagnostics are explicitly omitted.
All15s report/120s operation/45s proof/59s hard bounds, original container and
4GiB main Store guards remain. No preparation or sample outcome is claimed.
Eight distinct initial masters suffice after exact checks: four construction
trees and four scan trees shared by the two scan modes; samples stay independent.
Product79,366 unchanged, reference absent, exact pinned staged counting method.

| `5773c34fb` (worker) | Register twelve original directory cases | 79366 | 79366 | +0 |
| `50c297c68` | Integrate directory registration and its scoped contracts | 79366 | 79366 | +0 |

Locality registration/writer integrated from `fa69ab6b7`. All16 original cases
retain clean Commit/fixed move/distributed edits/dense rewrite at the four
frozen tiers. Clean uses control_only with no workload Exec; distributed edits
reuse the unchanged original sdk_edits ranked paths and exact4KiB XOR0x5a
replacements at offset0/delete4096 via ordinary pwrite, original target-length
guard, checked close and exact metadata restoration. There is no suffix copy,
read, truncate, splice feature or new dependency. The precise fixture staging
condition additionally copies the edit-linux binary for ordinary_sdk_edits;
its independent native oracle remains the original ordinary workload verifier.
The clean cache declaration now describes the actual prior read-only mount
without Exec. Retired host Store RSS/spool peaks remain declared gaps.

Two owning mechanical locality contracts PASS0.028s on main; two sealed-native
qualifiers were explicitly NOT_RUN there pending changed writer compilation.
Worker final clean build at67ec7f464 PASS<=97s with actual pinned Linux source
hashes before/after, unchanged daemon f44900.../runtime fb203158..., new edit-host
aab49ace5121d8c7a8b39baf6590d4ec5b6b3b754f4ee2c647d25daa5e1d77c4 and edit-linux
efc81ac5d393630e1d41b1c7d09fcea5430eb399e8b460624df0d770d92201b6. Passing build
container removed; OWNER-3 refusal retained. After source was sealed during
build, the Python-only clean declaration correction was committed960a7f81e;
compiled-input validation admits that exact unchanged binary set. All four
mechanical/native qualifiers PASS3.775s at final source: full compact original
oracle, selected stable inodes/suffix/background/modes/mtime, intentional byte
corruption refusal and wrong selected length refusal before mutation. No
product or original source changed, no sample has yet been reported.
Production LOC79,366 unchanged, reference absent, pinned staged method.

| `fa69ab6b7` (worker) | Register sixteen locality cases and ordinary positional adapter | 79366 | 79366 | +0 |
| `c66af2c19` (directory worker) | Apply exact shared ordinary source without lead ledger | 79366 | 79366 | +0 |
| `67ec7f464` (locality worker) | Apply shared source and precise edit helper staging | 79366 | 79366 | +0 |
| `960a7f81e` (locality worker) | Correct clean mount provenance without compiled changes | 79366 | 79366 | +0 |
| `2590a4536` | Integrate locality adapter/registration and exact helper provenance | 79366 | 79366 | +0 |

Local snapshot registration/shared history support: one original25k one-byte
case, one Workspace, exactlyC1 create25000/C2 edit256 ordinals97*j/C3 restore
original bytes, three distinct Commit operations. Existing frozen fixture/C1
generator is unchanged; independent Python equations produce all four semantic
manifests and C2/C3 native inputs, checked by the unchanged original full native
verifier before sampling. Runtime compares each local manifest against the
original Rust expected state, binds all actual acknowledgements/parent/stack/
base/finalhead and checks every retained root's bytes/metadata/complete inode
census. Equal C1/C3 immutable roots are valid; distinct Commit identities and
correct parent ancestry remain required. Small-delta's31-state uniqueness and
payload DELTA existence guard remain intact. Final native proof uses the exact
original deterministic root/seven-file sample; all75,004 retained paths/75,000
bytes have complete independent persisted coverage.

The local15s reporting limit is separate from its original120s execution
allowance; no soft limit is used as the sequence watchdog. Original45s proof/
59s hard remain. ClassC initial/own-write/full paid cache evidence is unknown
and numericINELIGIBLE. Retired-format object census and retired host Store RSS/
spool peaks remain explicit gaps. No product or frozen source changed.

Checks at this source: host history --no-run PASS11.70s, exact existing
complete_history_ proof PASS1.73s (twenty imported tests filtered). The new
complete_snapshot_history_ debug test FAILED/hang at its original30s child
stop, total34.54s; retained child Store/transcript/events at
/var/folders/s4/xpkmz7wn6yq97w1ls_4f_dfc0000gn/T/fsb-snapshot-history-91527/.
Only initial-root verification finished; stderr was empty and first25k-root
work was unfinished at fencing. No failure output is relabeled or deleted.
One read-only diagnostic incorrectly assumed /tmp, then mishandled a null
event span; corrected inspection found the exact retained evidence. Source
uses full canonical reads and complete membership, and benchmark compilation
is release. At the separate prescribed release identity, --no-run PASS7.51s
and the unchanged full-size external test PASS10.30s, including restored-root
equality and deliberate C2 oracle corruption refusal. Same30s child stop,
same25000/256 data, same verifier, outer120s; no timeout/test/workload weakening
or product optimization. The debug failure remains unverified as a debug
performance problem; it is not claimed repaired. Existing two unused fixture
helper warnings remain visible; no Clippy/CI claim.

Two local mechanical tests PASS0.187s, sealed-native qualification explicitly
pending committed final build. Sixteen owning workspace and six fixture checks
PASS under120s locks; bash/skip_children rustfmt/whitespace PASS. No local
snapshot preparation or sample yet. Production79,366 unchanged, reference
absent (retiredR9c,last65,417), exact pinned staged absent-aware method.

| `0344bfdc6` | Register original three-Commit local snapshot and full retained state proof | 79366 | 79366 | +0 |

H-6 first local snapshot sample at0344bfdc6 FAILED after all three measured
Committed replies and measured terminalEnd/Gone, then native witness exit0.
The controller could not parse the original multiline sampled_paths/ranges;
that receipt intentionally has no verification_status. Measured product wall
22,049,536,459ns is EXCEEDED against15s, with command13,025,547,001ns,
Commit8,851,071,916ns, mount9,189,333ns and unmount33,389,042ns. Counts/storage
remain UNAVAILABLE in its original row, not guessed. Original final witness
is runtime.events.artifacts/000062-verify.stdout. Its six exact fields specify
root/seven paths/seven one-byte ranges, no absent paths, full namespace/file
coverage false and original omissions. Actual checks succeeded; full persisted
four-root proof had not yet run. This is a harness contract mismatch, not a
wrong-byte/publication/product defect.

Failed sample container
f23dc735b265869a9ff91544ba366b5568787993fe23ad9d9df62a173a442bf9 is still running;
volume layerfs-fsb-sample-b86ad3b8b2b94919 retained, verifier mount and Stop
uncertain, host fenced-9. Do not infer teardown or remove it. Initial master
layerfs-fsb-master-local-snapshot-ec2d6edff2f14397 remains. Failed worker raw
run2026-10-10-batch-3-local-snapshot-0344bfdc6, handoff-failed.json and both
generated FAIL/EXCEEDED CSVs are retained at worker commit3a7c3fd96; root
integration is pending. One earlier parity call named the sealed case folder
instead of its parent, failed before fixture load, retained; a fresh wrapper
link and correct parent passed with zero samples and no setup replay.

H-6 fixed prospectively by a case/schema-bound exact original six-field
sample-receipt comparison plus known exit0. It preserves all multiline values,
exact path/range/absence selection and false coverage flags/omissions; it does
not invent verification_status or promote the bounded witness into a full
native tree proof. Existing full-verifier PASS check stays required elsewhere;
independent full four-root/history/census proof stays required after this
witness. Regression fails at the before-source parser with the original #5
ValueError, raw before.stdout/stderr under
benchmark-results/fs-bench-pro/2026-10-10-local-snapshot-native-receipt-fix/.
Three final scoped native-receipt tests PASS and sixteen owning workspace
checks PASS0.063s under120s locks. Altered paths/ranges/absence/coverage, extra
inventedstatus and missing/nonzero exit are rejected. Source/runtime/workload
compiled inputs unchanged: reuse qualified native/build/external proofs.
Only affected local snapshot may be sampled once at the corrected committed
engine identity; failed original row/resources remain visible. No product
change, optimization, limit/cache/workload/test reduction or unchanged replay.
Production79,366 unchanged; reference absent; pinned staged absent-aware method.

The qualified release history authoring check is source-qualified reuse, not
an identical-binary claim: main --release --test emitted runtime9bcf33f9...,
worker sealed release9a9e7fd5...; all four checked source hashes match0344bfdc6.
The main authoring checks.json identifies summary vs original tool-transcript
evidence explicitly. Worker native qualification PASS11.124s is a separate
actual sealed-binary check. Native/preparation/runtime/source identities stay
distinct; no evidence or original verdict is relabeled.

| `3a7c3fd96` (worker) | Preserve first local snapshot FAIL/EXCEEDED and uncertain resources | 79366 | 79366 | +0 |
| `03033abdc` | Fix exact original sampled-native receipt contract without weakening proof | 79366 | 79366 | +0 |

Directory cohort integrated from worker f9d6e366e: all12 original cases sampled
once at c66af2c19, full native/persisted inode/semantic count/resource proof
PASS, Committed/UpToDate exact, measured/verifier Gone and KNOWN_STOP. All12
numericINELIGIBLE underH5; noneFAILED/NA/EXCEEDED. Max product5,456,931,833ns,
max proof22,433,335,875ns; unchanged15s/45s limits. Thirty-six original read-only
count/resource intervals remain excluded and individually retained; no guessed
syscall values. Both12-row CSVs have exact30/14column schemas and source/raw
identities unchanged. Retained verification PASS withoutreplay; raw complete
case/phases/counts/logical+allocated storage/limits/profile/custody inventory is
namespace worker benchmark-results/fs-bench-pro/
2026-10-10-batch-3-directory-c66af2c19/handoff.json. All44 removal receipts
PASS (12samplecontainers/12samplevolumes/12copyhelpers/8provisionhelpers), no
teardown repeated. No productbug or uncertain/failed resource in this cohort.
Eight closed reusable masters retained:
layerfs-fsb-master-directory-construction-traversal-4cfb97a81b1c4764,
-50de5bba1d6449fd,-906afd940f3e4df7,-9f2e95078b7d45de,
-a398b7f797434873,-c206c4580d884ef2,-c679ac16c49b4245,-cdf67089171d4f76
(all suffixes share the full preceding prefix). Original/frozen/protected
resources and earlierfailedreceipt rows untouched. Retired-format object
census/RSS/spool diagnostics and full coldness remain explicitly unverified.
Production79,366unchanged, referenceabsent, pinnedstagedmethod; CSV/docs only.

| `f9d6e366e` (worker) | Record twelve complete directory outcomes | 79366 | 79366 | +0 |
| `ad4f95503` | Integrate directory CSVs and complete family custody | 79366 | 79366 | +0 |

Locality cohort integrated from7f29c1dc4: all16 original cases sampledonce at
960a7f81e, fullnative/persisted/inode proofPASS, Gone/KNOWN_STOP and removed
sample resources. Numeric16INELIGIBLE underH5, including zero-demand clean
cases whose actual no-Exec behavior/command_ns0/UpToDate is recorded. Counts
and allphase/storage fields come directly from originalreceipts, not revisited
measurement. Complete rawHANDOFF.json remains in tinyworker
benchmark-results/fs-bench-pro/2026-10-10-batch-3-locality-960a7f81e/.
Both16-row CSVs exact30/14columns verified. Original generic tags retained,
H5 paid backing/metadata/SQLite denial specified separately; retiredcanonical
format/hostRSS/spoolpeak remain explicitgaps. Retainedverify16PASS, reportonce.
One reportwrapper attemptR4_LOCK_BUSY75 refused while verifier stillactive;
no reportexecuted/overlap or caseattempt, corrected invocation onlyafterknown
verifyexit0/noCSVdestination, then generatedonce. Keep this orchestrationfailure.

Dense500 original15s reportinglimit EXCEEDED:15,251,166,166ns, excess
251,166,166ns; separateproof20,002,030,708ns WITHIN45s/59s, no120s hang.
Requests33359/ownerjobs282059/statements1353145. Storelogical1,066,713,088B /
allocated1,066,717,184B; overlaylogical541,495,296B/allocated809,934,848B.
Slowcase completesfunctionally and remainsnumericINELIGIBLE. No optimization,
limit/workload/cache/worker/fixture alteration or repeat; no productbug.
Four ownclosedmasters retained:
layerfs-fsb-master-workspace-change-locality-d26a3afb0f06417a,
layerfs-fsb-master-workspace-change-locality-1570757bb67b4c04,
layerfs-fsb-master-workspace-change-locality-7094f06f0f3542eb,
layerfs-fsb-master-workspace-change-locality-f5fe3ef6c5d94aa5.
Allpassingsamplepairs/helpercontainers removedwithoriginalreceipts; prior
failed/uncertain/protectedresources untouched. Product79,366unchanged, reference
absent, pinnedstagedcount; CSV/docsonly. Currentbatch28of33distinctcases closed,
onefailedsnapshotattemptretained pendingcorrectedsource, fourGitunsampled.

| `7f29c1dc4` (worker) | Record sixteen locality cases and dense500EXCEEDED | 79366 | 79366 | +0 |
| `26c037d90` | Integrate locality outcomes without optimizing the soft-limit miss | 79366 | 79366 | +0 |

First failed local-snapshot CSVs integrated unchanged from3a7c3fd96, exact
30/14columns/one row each underbaselines/core/2026-10-10-0344bfdc6. StatusFAIL,
proofFAIL, wall22,049,536,459ns/15sEXCEEDED; unknowncounts/storage andStop
remainUNAVAILABLE, no inferredcleanup. H6fixed03033abdc is prospective only:
the failedrows/verifierstdout/source/raw/resourcecustody stay original.
Workerb1f8150e applies exactthreefileH6fix withoutleadledger, staged/committed
tree1f81185621f54cd278b68935274d66e9905f6244 and79,366unchanged. Owningthree
receipt checksPASS0.012s. Exactoldpreparedmaster/helper/fixture andcompiled
seal reused; correctedparity/newsource sample is pending. No setup/native/
debugproof replay. No productfix/optimization or publicationclaim.

| `b1f8150e` (worker) | Apply exact sampled-receipt fix at changed case identity | 79366 | 79366 | +0 |
| `98d3be30a` | Integrate original failed snapshot rows without relabeling | 79366 | 79366 | +0 |

Local snapshot corrected-source closure froma95ca5375: one sample atb1f8150e,
originalthree25k/256/restoreoperations, threeCommitted replies, exact native
samplePASS and completeactualsameStore4roots/3Commitancestry/75004paths/
75000bytes/inodecensusPASS. RestoredC1/C3 rootexactlyequal. BothmountsGone,
KNOWN_STOP, passingcontainer67298f865bd6d1db6d252613ec982aa11c7cf55f9d82bd51a5e52a394cea3b54
andvolumelayerfs-fsb-sample-40a7ee17335e48df removed. NumericINELIGIBLE underH5,
wall24,397,444,499ns EXCEEDED15s (excess9,397,444,499ns), proof11,633,937,583ns
WITHIN45s/59s, no120s hang. Counts177581/1456520/6956183; Storelogical921712B/
allocated925696B; overlaylogical28672000B/allocated297111552B. Absolutecontroller
24,965,019,583ns minus6read-onlyobservers567,575,084ns matches recordedproductwall.
FinalretainedverifyPASS/reportonce; exact30/14-columnone-rowCSVs integrated.
Raw bothattempts/arithmetic/proofidentity/resource inventory remains namespace
worker benchmark-results/fs-bench-pro/2026-10-10-batch-3-local-snapshot-b1f8150eb/handoff.json.
Fiveoriginalpassingremovalreceiptsaudited, no teardownreplay. Initialmaster
layerfs-fsb-master-local-snapshot-ec2d6edff2f14397 retained; firstfailedlive
container/volumeverifiermount retained, includingmountkey
 a442fd804322640166fdeaa1d505535fbe1ea76e94417c63f7389969465f02fe.
No productbug/feature/optimization/limit/cache/workloadchange. FirstFAILrow
and correctedINELIGIBLErow remain separate at originalsources. Currentbatch
29of33distinctcasesclosed; Git4pending, no batch4. Production79,366unchanged,
referenceabsent, pinnedstagedcounter. Allsource/binaryreuse gaps remainexplicit.

| `a95ca5375` (worker) | Record corrected snapshot proof/closure withEXCEEDED | 79366 | 79366 | +0 |
| `70d568e94` | Integrate corrected snapshot while retaining failed history | 79366 | 79366 | +0 |

Git workflow support integrated from worker d73fb8a0841fd58e09a2895ed78ea9ed2ac24e20:
all four original IDs retain exact native Git preparation, genesis/configuration,
six performance commands, intermediate verification variant, editor temporary
saves and positional edits. Real .git is imported by Init; independent reference
HEAD/tree/parent and full working-source expectations cannot be replaced by
custody. Complete precommit and fresh-root .git manifests cover raw index stat
bytes before any semantic Git command. The persisted hybrid oracle uses custody
only for .git, retains the independent source oracle and complete inode census.
Lead controller wires prior mounted qualification discarded without Commit,
excluded precommit custody, fresh custody before semantic Git, acknowledged
root graph binding and cumulative proof work. Counts explicitly include custody
FUSE/SQL work; no guessed verifier subtraction or pure performance count claim.
Prior additional reads and full paid cache inputs remain unqualified under H5.

Root owning checks at this composed source: Git engine4PASS0.013s; family4PASS;
Rust --no-runPASS5.36s then exact five external Git oracle tests PASS11.65s,
nineteen frozen inline tests filtered. Worker had engine4/family4/shared16/
fixture6 PASS and native recipe ARM64 compilation PASS. Retain its earlier
unintentionally broad Rust invocation stopped by its owner at67s/exit101
while frozen inline history tests ran; this was not a product hang or successful
check. Remaining exact Git check subsequently passed1.81s at worker source.
Two harmless test-runtime dead-code warnings concern edit_model helpers; no
product source changed. These source-qualified checks are not mounted samples.

Read-only review found final controller publication and cleanup deadline scopes
needed completion before the first Git run. The frozen ordinary verifier has
45s work including a4s cleanup reserve, 59s hard through receipt publication,
and a0.25s publication guard. A worker is preparing an append-only late-failure
receipt overlay; lead owns controller wiring and meaningful ordering/deadline
checks. No Git sample is authorized by this intermediate support commit.
Compiled support may build and native preparation/parity may proceed in its
own worktree; samples wait for the reviewed final guard source. No batch4 work
has started; read-only planning uses exact existing dedup_branch_history name.
Raw support check/outcome provenance remains capped worker
benchmark-results/fs-bench-pro/2026-10-10-batch-3-git-tool-support-d73fb8a08/.
All previous failed/uncertain/protected resources and receipt identities remain.

| `ce47e2b18` (worker) | Apply lead shared source without ledger duplication | 79366 | 79366 | +0 |
| `d73fb8a08` (worker) | Original Git workload and complete custody support | 79366 | 79366 | +0 |
| `acebd7cbd` | Integrate Git support before final guarded-run qualification | 79366 | 79366 | +0 |

Git final controller review preserves the frozen ordinary policy: cumulative
proof work stops at41s (45s less original4s cleanup reserve), cleanup at45s,
and receipt publication at59s with original0.25s margin. Prior mounted original
verification and precommit custody are charged once, including their real
read/export/hash/cleanup walls. Measured performance remains outside proof time.
The current offline oracle requires early terminal unmount/known Stop/closed
export before graph reads; their cost remains conservatively charged before
remaining graph work. No new allowance, operation, cache treatment or timer
extension is introduced. Final counts/log collection, resource checks, passing
removal and stream closure are bounded in their declared work/cleanup domains.
The final prepublication proof wall includes these intervals; separate bound
publication observations retain hash/write durations, rather than substituting
an earlier graph-only wall. Prior/custody exhaustion fails before measured
Commit; no replay or automatic cleanup of an uncertain failure.

Root's six Git engine tests PASS at the composed controller, including exact
41/45/59 deadline arithmetic and rejection of changed budgets; one original
qualification discarded before fresh performance; custody before the single
Commit; fresh custody before any semantic Git; refusal/mismatch remain failed,
retain exact mounted ownership and charged proof wall. Shared engine16PASS,
receipt-custody4PASS, frozen Git family4PASS. Current tests use original declared
fixtures only where relevant; controller fault tests do not constitute samples.
No product source or compiled input changed after acebd7cbd's support seal.

H7 was found in the prospective publisher during source review, before Git's
first sample. External regression at the initial guard returned provisional
PASS/PASS after a late observation write and an OSError creating the failure
sidecar. Additional absent-manifest regression raised FileNotFoundError and
prevented a failed case CSV. Keep actual before-fix outputs in tiny worker
benchmark-results/fs-bench-pro/2026-10-10-publication-completion-guard/.
Original receipt/manifest remain immutable. Mandatory completion binds their
SHAs, source/product/case/image/binary identity, exact observation SHA, clock,
deadline, retained completion-attempt bytes and declared scope. A late or
interrupted attempt/link retains exact raw bytes and removes only its own
provisional successful completion link before optional failure emission; missing
completion fails closed even when failure emission also fails. A guarded attempt
with no original manifest reports FAIL using registration identity only; all
unauthenticated metrics are UNAVAILABLE. Existing tampered seals still reject.
All historic unguarded load/finalization behavior remains scoped unchanged.

Git full8-binary build at acebd7cbd PASS under its private120s lock in<=73s,
host release21.91s; pinned Linux source hash checks before/after and host source
unchanged. Passing build container removed, OWNER-3 exact refusal retained.
Runtime faf3b953674eb72ae7d6958141e99aba86d9ef2716f23cfea5ba0362731ece74;
workspace writer5fa075450ba74f3fea041d4a8212697dd766060defb8e1080cc76ff62d3bc13b;
daemon f44900cfc975901b7101f4874f708390b6f7401981e06d608b3df52a50848c0e.
Declared compiler cache copies are independent private byte copies of closed
main registry/incremental artifacts; actual8scope rebuild and source verification
still ran, no writable main target or binary substitution. Seal remains capped
worker benchmark-results/fs-bench-pro/2026-10-10-batch-3-git-full-build-acebd7cbd.
All4 native preparations and parity PASS at this source, zero samples, original
Git2.39.5 and independent HEAD/tree/parent/source/fsck/clean/two-commit guards.
Initial real .git/source logical bytes2,120,903/8,467,515/70,886,251/95,873,900;
complete files243/558/4850/10865. Transient bytes38,859,392/45,254,556/
104,085,977/129,928,663 retain original256MiB bound. Closed masters retained:
layerfs-fsb-master-git-tool-workflow-5126837eb6534685,
layerfs-fsb-master-git-tool-workflow-6808aa0ae3474ff4,
layerfs-fsb-master-git-tool-workflow-0b236dd02e6f4192,
layerfs-fsb-master-git-tool-workflow-24100f1f10984c27.
Passing native/provision helpers removed with receipts. Prepared parent and
parity remain under worker2026-10-10-batch-3-git-prepared-acebd7cbd and
2026-10-10-batch-3-git-parity-acebd7cbd; final guard-source parity still required
before sampling. No product bug or preparation failure; full coldness and all
original topology/format omissions remain explicit. No batch4 started.

The H7 completion review also reproduced actual process death: a bounded child
os._exit(91) immediately after provisional link creation, before its post-check,
left an old draft load reporting PASS/PASS. Raw failed-before-outer-ack.txt is
retained. The final bench.py driver invokes acknowledge_guarded exactly once,
only after one_family_case returns. A successful guarded report requires that
known outer return, exact completion SHA, original receipt/manifest identity and
nonpromoted returned verdict. Missing or partial acknowledgement is FAIL with
all authenticated metrics retained; altered bindings reject. Its emission is
explicitly outside the original59s family timer, and does not claim its own
unwitnessed write duration. It attests that the guarded finalizer returned after
its post-publication deadline check, closing the prior process-death gap without
rewriting any receipt or inventing a successful unknown operation.

Final Root composed checks:50 engine tests PASS0.531s (23 publication,7 Git
including actual outer driver ordering/refusal,16 shared workspace/report/cache,
4 original receipt custody), locked<=120s. Frozen Git family/catalogue checks
PASS; exact25families/273IDs retained. No native/mounted workload repeated for
these harness corrections. Worker final23 publication checks PASS0.258s and
16 shared checks PASS0.064s, strict original0.25 margin and monotonic numeric
clocks. Four worker purpose commits and original guard scaffold all have exact
pinned absent-aware+0 LOC/tree confirmation. No product change/optimization.
Compilation and prepared source checks remain source-qualified at acebd7cbd,
with unchanged compiled bytes; final guard-source parity precedes Git sampling.
Concurrent private worktrees and protected/retained containers share host and
DockerVM; this unquantified interference remains declared, no numeric eligibility.

| `b8f1d4c36` (worker) | Append-only original Git publication guard scaffold | 79366 | 79366 | +0 |
| `524a8bded` (worker) | Mandatory completion, late-link revocation and partial-manifest failure rows | 79366 | 79366 | +0 |
| `1ccdbeb65` (worker) | Freeze0.25 margin and validate monotonic numeric clocks | 79366 | 79366 | +0 |
| `3d92ebb10` (worker) | Require known outer finalization acknowledgement after post-check | 79366 | 79366 | +0 |
| `031d427a7` | Complete original Git deadlines and H7 guarded finalization before sampling | 79366 | 79366 | +0 |

## Batch3 closure

Git4 CSVs integrated unchanged from76545dd1bb3ae621d5877e864ce64338aba7daee,
exact30/14columns, four rows each, measured source031d427a7. Allfour once-only
cases PASS original mounted intermediate guards, six measured Git commands,
complete precommit/fresh.git index-byte custody before semantic Git, independent
HEAD/tree/parent/fsck/clean/twoGitcommits, current authenticated persisted hybrid
and exhaustive inode census, Gone/KNOWN_STOP and valid guarded publication plus
outer returned-finalization acknowledgement. Final parity and retained verify
PASS, reportonce. NumericfourINELIGIBLE: prior additional verifier reads/full
paid backing/metadata/SQLite/own-write coldness unqualified. Counters include
excluded precommit custody FUSE/SQL work; pure-command intervals are not claimed.
Raw family-handoff.json remains capped worker benchmark-results/fs-bench-pro/
2026-10-10-batch-3-git-report-031d427a7/. No failed/NA/exceeded Gitcase, product
bug, resample, optimization, changed limit/workload/fixture/cache/worker profile.

| Case tier | Complete ns | Combined prepublication proof ns | Requests/jobs/statements | Store logical/allocated B | Overlay logical/allocated B |
| --- | ---: | ---: | --- | --- | --- |
| 1 | 569462750 | 4085816083 | 5895/7423/45762 | 1516464/1519616 | 299008/268734464 |
| 10 | 882749792 | 4880959000 | 9394/12330/75496 | 4875688/4878336 | 401408/268836864 |
| 100 | 4612947959 | 15050067417 | 51386/69392/416614 | 64759408/64761856 | 1490944/269926400 |
| 500 | 10502533917 | 33127619000 | 118176/193539/1079116 | 80558592/80560128 | 4886528/273321984 |

Allfour passing sample pairs removed with original acknowledgements after
proof/Gone/KnownStop. Four closed Gitmasters listed above retained; earlier
capped/snapshot/R7 failures and owner-protected resources untouched. Worker
CSV-only countedtree2d93ae28ef468b07aa56686e0b51de3b1d3a3f7f confirmed/+0.
Root integration changes only the twoCSV files and thisledger. Product79366
unchanged, referenceabsent, pinnedstagedcounter/first-parent method.

Allfour batch3 families meet done-when:33 original IDs ported; familyparity,
single-source attempts, original applicable independent proof and cleanclose;
alltwoCSV files committed. Initial snapshot H6FAIL remains at0344bfdc6 and the
corrected sourceb1f8150e has its separate row. Two slow completions retain
unchanged15s reporting limits: localitydense50015,251,166,166ns and corrected
snapshot24,397,444,499ns. No speed/comparison/release verdict. Thirteen families
and131distinctcases are now closed acrossbatches1–3;132attempt rows include
the failed snapshot identity. Twenty-three original batch2failed cases remain,
and all their known reasons/resources are retained; no identified fixable
productcorrectnessbug remains. Later142cases/12families remain pending.
Batch4 has not been authored or executed; only originalsource read-only plans
were prepared concurrently. The next committed work activates its3families
under the same separate-worktree/current-batch-only policy.

| `76545dd1b` (worker) | Record four original Git outcomes without replay | 79366 | 79366 | +0 |
| `31fff4d49` | Integrate Git CSVs and close all33 batch3 cases | 79366 | 79366 | +0 |

Batch4 begins only after31fff4d49476219b9a172e010abe37f4e4056ee0 committed
batch3 closure. Three existing managed worktrees take exact original families
file_size_transition7, dedup_branch_history26, mixed_load_bearing10. Leadowns
shared Python/controller/public-runtime/census and ledger integration; worker
ownership is isolated for the native recipe CLI, independent model, P3 writer
and eachfamily. Old branches/raw receipts/resources remain recoverable. Private
locks/targets and sharedhost/DockerVM interference retain decision33's scope.
No batch5 and no stage4 sample while sharedsupport is unqualified. Routing adds
only these existing family names; pending cases remain unsampleable before
clone/mount/claim. Owning17 engine checks PASS0.107s, locked<=120s; the new
pending-family refusal uses isolated prospective registrations so it remains
valid after actual families are ported. No product/compiled source changed in
this routing commit, no new family or limit.

Read-only plans established three essential distinctions before authoring.
Dedup globalcensus must stream all current Commit rows, validate raw BLOB tags/
widths and complete five-field tuples, custody/hash/no-sidecar closure and real
current schema/binding; public typed proof remains mandatory. Pythonstandard
SQLite read-only/immutable/query-only/synchronousOFF can observe a separate
closedcopy without a product feature or data-serving path; no checkpoint,
repair, deletion or retry on that input. Extra valid unreachableCommit is the
required external regression, not only a malformedrow test.

M1 fixtures follow executable decimal high-water arithmetic: initial4,984/
29,984regularnames,99,934,464/499,934,464B, initial64/314dirs includingroot,
5,048/30,298entries; caps5,000/30,000names and100,000,000/500,000,000B reserve
16names/65,536B. Role-data dirs53/303 and additional10 come fromsource; frozen
fixture prose differs and staysunchanged. Common guard is per-file500MiB and
aggregate<1GiB, so no bypass is authorized. Two verify-only exhaustive cases
retain original120/300s declarations and currentowner120s testceiling separately;
never split/extend a test to wait out that ceiling. Current routines preserve
five sequential stages, original14POSIX+2orderedP3 edits at stage2, original
ranges including exact131072/empty-byte omission and required modes/attributes.
No concurrent discard/reopen is added to sequential cases. Automatic mtime
normalization is forbidden.

Boundary alias byte model requires original hardlink class forstates0–4,
separate alias/target at5, executable finaltarget131072 vsalias131071; roots
canrepeat but actualCommitIDs/parents cannot. Original workspace_bench2315–2347
and workspace_verify865–875 require final directorymtime; unchanged atomic
helper does not restoredata/ parent after temporary-name changes. The native
compatibility refusal stays strict and visible, not a benchmarkPASS or a new
workload call. Final caseclosure waits actual qualified source/evidence.

| `65f0c1fbe` | Activate only current three history-family routes while pending remains refused | 79366 | 79366 | +0 |


Batch4 shared native authoring integration reuses exact worktree changes:
Namespace10bafc75d/d81a8af86/f97230027 (BA hardlink model, independent M1
shadow/range/explicit-attribute algebra and exact decimal constants),
Cappedf938d7faa/f5280d654 (selected native checkpoint and M1 selective CLI),
Tinye5e8216f3 (ordered ordinary P3 splice members). Original frozen source and
all product sources remain unchanged. Private native recipe failures, including
Capped's frozen-private validate_path compiler refusal before its owned-parser
correction, remain raw authoring history; no product failure or sample is
inferred. M1 native selective verification accepts only original cumulative
17-name created-directory mode domain and required subset, rejects unsafe,
duplicate/missing modes and declared-range corruption, and deliberately does
not invent automatic mtime or exact128KiB byte coverage omitted by the original.

Lead exact composed qualification: external Rust tests compiled --test first
with Rust1.85.1/repository ARM64 flags; BA3PASS0.02s, M1 model5PASS2.27s, frozen
inline reference tests filtered from this focused invocation. Fresh native
recipe compiled from composed source;7Python native CLI checks PASS4.470s.
Fresh native writer compiled from same model;5covering native checks
PASS1.305s. Writer tests substitute only load_build with these exact fresh host
binary paths for uncommitted direct-source authoring qualification; no clean
full-build seal, mounted operation, preparation, parity or measurement is
claimed. Raw source/binary hashes and all build/test attempts are under
benchmark-results/fs-bench-pro/2026-10-10-batch-4-native-composition-root,
-root-writer and-root-writer-launcher-fix. Initial writer launcher had a
SyntaxError because token replacement also touched its environment-variable
name; it failed before loading/running tests. Its exact failed receipt remains;
corrected launcher passes using unchanged compiled binaries. Every invocation
has an explicit120s wallstop under the main checkout lock. No Docker resource
or sample is created by these authoring checks. Full sealed Linux/host support
qualification waits the actual final composed batch4 source.

Ownership for remaining shared authoring is explicit: Tiny owns selective
preparation and untimed sealed SDK payload descriptors; Namespace owns persisted
public proof and the resolved history-step argument guard; Capped owns the
independent unfiltered closed SQLite census; lead owns Python controller/build
assets/finalization and thisledger. Workers are forbidden to revert sibling
changes or sample until the reviewed source/seal handoff.

| `10bafc75d` (worker) | Original boundary alias class model | 79366 | 79366 | +0 |
| `d81a8af86` (worker) | Original M1 independent shadow and ordered P3 model | 79366 | 79366 | +0 |
| `f97230027` (worker) | Exact decimal authoring constants | 79366 | 79366 | +0 |
| `f938d7faa` (worker) | Native selected checkpoint recipe | 79366 | 79366 | +0 |
| `f5280d654` (worker) | Native original selective M1 proof | 79366 | 79366 | +0 |
| `e5e8216f3` (worker) | Generic ordered ordinary SDK splice writer | 79366 | 79366 | +0 |
| `a921bedbd` | Integrate and qualify batch4 native model/recipe/writer | 79366 | 79366 | +0 |


Prospective H8 correction retains exact successful sample resources pending
finalization/known driver return. Original End, automaticGone, Stop, export,
independent proof and deadlines stay unchanged. Administrative Docker removal
moves after successful guarded outerACK (where required) and authentic final
functional/proof/cleanup custody. Separate resource-removal attempt/completion
and manifest bind the original receipt/manifest/ACK and exact64-hex container /
owned sample volume. Any finalization failure attempts no deletion. A first
successful deletion followed by missing volume acknowledgement records
containerREMOVED / volumeREMOVAL_ATTEMPT_UNCERTAIN; no inferred replay, retry or
both-retained claim. Original receipts remain immutable and report loading
validates the separate administrative custody without promoting a verdict.

External regression at exact parenta921bedbd observed both original rm calls
before output-closeFAIL, so failed as intended. Corrected source3retention
checks PASS; existing7Git controller checks and23publication checks PASS,
explicit120s wallstops/main lock. Rawbefore/after evidence is append-only under
benchmark-results/fs-bench-pro/2026-10-10-h8-resource-retention. No actual Docker
resources, prepared inputs or benchmark samples were created by these isolated
controller tests; old recorded removals/receipts remain unchanged.

| `56a422544` | Retain failed finalization resources and bind separate administrative custody | 79366 | 79366 | +0 |


Batch4 full builds now compile/archive the same workspace native recipe CLI
for Linux as workspace-linux, alongside its host workspace-writer. This
supports actual original selective M1 native proof in the pinned image rather
than routing the frozen generic expected() pristine fixture as M1's oracle.
There are nine prospective sealed binary keys; runtime-only rebuilds require
the nine-key full seal and reuse eight unchanged binaries. Closed eight-key
build receipts remain immutable; current changed recipe/writer scopes already
require a new full seal, so none is relabelled as nine-key qualification.
Linux compilation retains host source checksum validation before and after,
locked offline daemon build, pinned image and repository ARM64 flags. Full
build/execution has not occurred yet. Owning8build-identity tests PASS0.018s,
including refused missing workspace-linux reuse;120s wallstop/main lock;
raw benchmark-results/fs-bench-pro/2026-10-10-batch-4-linux-recipe-asset-authoring.
No product source or Docker resource changed in this authoring check.

| `cc8c239b8` | Seal Linux copy of current native selective recipe in future full builds | 79366 | 79366 | +0 |


Batch4 file_size_transition authoring is integrated from Tinyff03191bd,
e4f7f76cb and4b18789cf: exact seven originalIDs, all19Commit steps and26
initial/published states, original overwrite/roundtrip/alias helper calls,
strict exclusive131072-byte representation contract, every0..N proof index,
and sealed prepared-P3 payload hook with unchanged native fallback. Limits,
fixtures, worker count and original alias syscall sequence are unchanged.
Lead5owning definition/shell/native-alias checks PASS with explicit120s stop;
exact new native binaries substituted only for authoring load_build, no full
clean seal or sample claim. The unchanged BA helper completes allfive calls,
keeps expected complete file bytes/identity/link classes, and its final
strict native metadata checker refuses changeddata/mtime as predicted. This
is retained definition incompatibility, not a passing benchmark or authorized
parent-restoration change. Raw qualification:
benchmark-results/fs-bench-pro/2026-10-10-batch-4-boundary-family-root. Actual
family parity/preparation/one-attempt case execution remains pending final
shared support. No product source or Docker resource changed.

| `ff03191bd` (worker) | Register original seven boundary cases and calls | 79366 | 79366 | +0 |
| `e4f7f76cb` (worker) | Native alias strict compatibility qualification | 79366 | 79366 | +0 |
| `4b18789cf` (worker) | Bind every boundary proof step and prepared SDK payloads | 79366 | 79366 | +0 |
| `fc9e71fae` | Integrate original boundary family with owning native qualification | 79366 | 79366 | +0 |


Batch4 dedup_branch_history authoring integrates Capped2789b9dac,
44f2048c4 and26e414cb0:26original IDs and3,385orderedCommit steps,
unchanged seed1 fixtures and original checkpoint lists/budgets. Full routine
checkpoint coverage for unrelated-mixed-v2 is explicitly additional proof;
frozen executable2534–2597 checks global measuredCommit membership/parents
and final bounded payload sample before bypassing the routine fast checkpoint
loop. Nativegenesis is a Layer, not a fabricated Commit: current Init also
starts branchheadNone, transcript hasK+1roots but globalcensus must haveexactK
measured CommitIDs with firstparentNone. Prepared descriptor hooks preserve
original ordinary SDK member order and native fallback, including HNstage2.

Reuse exact owning worktree evidence by final changed-file scope: initial6
family checks PASS0.338s; affected mixed-v2 scope check PASS0.003s after44f;
affected shell/prepared descriptor route check PASS2.650s after26e. No changed
scope remains unqualified, and no duplicate native preparation or performance
sample is used. Raw receipts and each worker countedtree remain at
benchmark-results/fs-bench-pro/2026-10-10-batch-4-history-authoring in the
Cappedworktree. Strict immutable globalcensus and composed persisted/native
proof support are still authoring prerequisites;26actualcases remainunrun.
No product source or resources changed by this port.

| `2789b9dac` (worker) | Register all26 original branch-history cases | 79366 | 79366 | +0 |
| `44f2048c4` (worker) | Label original mixed-v2 final sample versus added routine full proofs | 79366 | 79366 | +0 |
| `26e414cb0` (worker) | Bound prepared SDK descriptors with native fallback | 79366 | 79366 | +0 |
| `6a5433e79` | Integrate original dedup branch history family | 79366 | 79366 | +0 |


Batch4 mixed_load_bearing authoring integrates Namespace96d472294,
319fad349 and13f413bee:10original IDs,4ordinary single-call agentepisodes,
4regular sequential M1 cases,2original exhaustive verification-only IDs.
M1declares every ordered helper/Commit and two separate stage2 ordinaryP3
members, selected original checkpoint roots (finalregular /20exhaustive cycle
ends), allactualCommitIDs/parents/head/globalcensus, selective original ranges
and explicit metadata with actualcreatedmode custody. Exhaustive performance
isN/A, original120/300s declarations retained beside owner120s testceiling;
no performancezero, fabricated coldness or automatic metadata normalization.
Original decimal fixture/caps and common guard arithmetic are recorded above.

Exact final changed scopes reuse owning private120s evidence: original/schema
3checks PASS2.024s after319f; finalprepared-script3checks PASS3.600s after13f,
including missingdescriptor seal refused before mutation and unchanged native
helper/member1/member2 order. Sourcefile hashes and counted worker trees pin
this reuse; no repeat of an unchanged benchmark. Raw owning summaries:
2026-10-10-batch-4-mixed-registration, -mixed-history-schema and prepared-hook
in Namespaceworktree under benchmark-results/fs-bench-pro. All10actualcases
remainunrun untilcomposed support; no product source or resources changed.

| `96d472294` (worker) | Register all10 original mixed cases and exact fixtures | 79366 | 79366 | +0 |
| `319fad349` (worker) | Use approved original history checkpoints/census schema | 79366 | 79366 | +0 |
| `13f413bee` (worker) | Preserve helper-first two-member prepared P3 order | 79366 | 79366 | +0 |
| `4762b720c` | Integrate original mixed load-bearing family | 79366 | 79366 | +0 |


Batch4 selective native preparation and original untimed P3 payload support
integrates Tiny7f381e27c/f439855d7/5a7dac7a6/9a434a6f5/a05b850dd.
Only declaredverification_steps have native expected trees/manifests; every
actualCommit remains in the separate transcript. M1 selected manifest is the
original8-column selective shadow scope, while full digest/None-created-mode
materialization is explicitly setup-only native recipe evidence. No501copies
or extra all-state payload claim. SDK generators run untimed; descriptor/member
bytes and SHA seals are staged, and measured wrappers read/hash-check the
originals without regenerating recipes. Each wrapper retains originalrun,
operator/member order, descriptor/hash and helper stdout. Successful positional
artifact reads advance by bytes; error/zero/checked-close failure stops, without
convenience EINTR retry. Linux native recipe stages aswriters/recipe, matching
original family fallback and exact sealedworkspace-linux asset.

Authoring corrections: the initial staged asset namewriters/workspace did not
match the family recipe fallback; affected worker test failed with missing
writers/recipe before9a, thenPASS0.080s. The unexecuted M1 prepared test initially
omitted the original14POSIX stage2 edits; source review corrected it ata05b to
call unchanged nativehelper before both preparedmembers, retaining strict
selective verifier. These are harness/test authoring corrections, no product
bug or failed measuredcase. Native prepared writer compiled at composed final
source first with1.85.1/ARM64;3newcovering tests PASS3.072s. Existing unaffected
native writer evidence remains;12owning fixture checks PASS0.157s, allunder
explicit120s/mainlock. Raw direct-source authoring binary/hash qualification
benchmark-results/fs-bench-pro/2026-10-10-batch-4-prepared-support-root; no clean
full-build seal, actualprepare/parity/sample/Store execution or Dockerresource
claim. Final full sealed Linux/host build waits runtime/controller composition.

| `7f381e27c` (worker) | Untimed sealed original payload generator and measured prepared operator | 79366 | 79366 | +0 |
| `f439855d7` (worker) | Positional no-retry artifact read and checked close | 79366 | 79366 | +0 |
| `5a7dac7a6` (worker) | Original selective checkpoint/payload preparation | 79366 | 79366 | +0 |
| `9a434a6f5` (worker) | Correct native M1 staged recipe path | 79366 | 79366 | +0 |
| `a05b850dd` (worker) | Include original14POSIX edits before test's two P3 members | 79366 | 79366 | +0 |
| `364e1a87a` | Integrate selective preparations and qualify original prepared splice support | 79366 | 79366 | +0 |


Batch4 unfiltered closed-Store census source integrates Capped70c61a91f.
It streams every globalCommit row toEOF using read-only immutable/query-only
SQLite/OFF/timeout0; exact K uniquefive-field raw typedBLOB tuples, actual
schema/application/source/definition identity, provisioning binding and current
mandatory public provider validation are required. ExportKnownStop/container/
volume/local/remote paths/hash/size and actual original successful Dockerexport
completion/runtimeevents/manifest/transcript hashes are independently bound.
No cursor or binding-key material is returned. Public typed offline proof runs
on a separate bytecopy; original census export must remain unchanged and free
of all-WAL/SHM/journal sidecars evenempty.

Eight owning schema/census unitchecks PASS0.291s and existing3oraclechecks
PASS0.033s underprivate120s locks, exact unchanged integrated filehashes reused.
These use isolated synthetic six-schema WAL/OFF SQLite fixtures and mocked
provider/custody attestations; extra unreachable tagged/FK-bound row is rejected,
130rows prove bounded batch-toEOF, and substitution/missingtuple/type/tag/schema/
binding/sidecar/hash/custody corruption are refused. They are not yet the
required genuine public canonical extraCommit regression: source review found
fixture IDs/rootbytes are invented, not actual publiccreated savedobjects.
Namespace/Capped are preparing a separate current-publicStore extraCommit
proof with anchoredtypedverificationPASS and unfilteredcensusFAIL. Decision40
qualification remainspending until that actual external test; no productfeature
or claim from syntheticvalidity. Rawowning tests/census-supplement.json remain
in Capped's2026-10-10-batch-4-history-authoring folder. No realcase/export/resource
was created by the synthetic checks.

| `70c61a91f` (worker) | Unfiltered immutable current-schema Commit census and synthetic guards | 79366 | 79366 | +0 |
| `1fa7facc4` | Integrate unfiltered census, retaining genuine public extraCommit test prerequisite | 79366 | 79366 | +0 |


Batch4 guardedpublication integrates Cappedc8a5a72db. Exact closed Git scope
string remains unchanged; new HISTORY_PUBLICATION_SCOPE identifies original
family cumulative proof/publication separately. Only those two scope constants
are admitted; same0.25s margin, immutable receipt/manifest/observation, guarded
completion attempt/link/post-check and mandatory known outerreturn apply.
Driver acknowledges every guarded result before existingH8administrative
resource removal, independent of family name. No original receipt/verdict is
rewritten. Owning newhistory3checks PASS0.009s, retained oldpublication23checks
PASS0.234s and2driverorderingchecks PASS0.008s, eachprivate120slock; final exact
changed sourcefilehashes reused. No actualcase/export/resource executed;
controller original work/reserve/hard budget integration remainsuncommitted
and unqualified until its own coveringtests. Rawpublication supplement is in
Capped's2026-10-10-batch-4-history-authoring folder.

| `c8a5a72db` (worker) | General original-family guarded publication and outer acknowledgement | 79366 | 79366 | +0 |
| `5ebdac535` | Integrate family guarded publication without altering closed Git scope | 79366 | 79366 | +0 |


Batch4 verification-only reporting integrates Capped6d47e3be3/2fe8e9b2e.
Authoritative original case.proof_only masks performance status/cache/time/
phases/limits/counts/storage/reference timing as literalN/A, including unrun
cases. Verification retains actualsemanticproof status/wall/originaldeclared
bound/cleanup/source and reasons, with original rawdiagnostic metrics unchanged.
Driver requires verification-only mode, sample_count0, verification_attempt_count1;
proof success does not credit any performance cache state. Neither case is
closed as not-applicable simply because performance isN/A. H9visibility fix
retains original overallFAIL and exact original/close cause in CSV tags even
when semanticbytespassed. Red regression remainsraw, final5reportchecks
PASS0.048s and4driverchecks PASS0.020s underprivate120s locks. Integratedfinal
receipts/bench hashes equal worker's f1ac20a... /70580094..., so covering exact
scope evidence is reused. No sample/preparation/resource has executed yet.
Controller owner120s invocation ceiling remains separate from original120/
300s proof definitions and is not a widened or silently rewritten declaration.

| `6d47e3be3` (worker) | Verification-only performance N/A and explicit no-sample driver | 79366 | 79366 | +0 |
| `2fe8e9b2e` (worker) | Keep overallFAIL/close cause visible beside semantic proofPASS | 79366 | 79366 | +0 |
| `65df42e91` | Integrate verification-only reporting and H9 outcome visibility | 79366 | 79366 | +0 |


Batch4 controller authoring integrates exact current interfaces: every ordered
acknowledgement, sparse original checkpoint manifests with '-' sentinels,
prepared_step_runs dispatch, perstep original semantic counters, helper-only
actualcreatedmode cumulativeprefix TSV/hash seals, finalK native proof, and
separate typed-provider bytecopy/immutableexport. Public-provider fields and
allactualCommit tuples/source/runtime/exportcustody feed the unfilteredcensus.
Full mandatory public proof and actualcanonicalextraCommit qualification still
wait Namespace/Capped; isolated controller mocks explicitly claim neither.

Original25/35 or45/59 work/cleanup/publication budgets retain3/4s reserves and
0.25s publication guard, including allfour ordinary agentepisode cases. The
separate owner120s exhaustive invocation cap retains its3s cleanup reserve;
original120/300definitions staydeclared and performance remainsN/A. Source
admission/setup/allcalls/Commits/proof/cleanup/Stop/close are recorded as the
exhaustive testinvocation wall, with zero performance samples. Ordinary source
15s reporting limits remainsoft; existing hard operation budgets are unchanged.
New ordered phase watchdog includes its measuredmount; old previouslyclosed
Small/Local timer wiring is retained. Resourceobservers retain raw excluded
wall and remain charged to applicable absolute stops, rather than each gaining
a fresh full allowance. NativeM1 JSON is parsed as its exact selective receipt
(case/seed/K/exit/scope/rangebytes/digests), never generic full coverage.

Lead covering5componentchecks initiallyPASS, existing7Git controller and3H8
retention checksPASS, then new full sparse100-ack orchestration test exposed
an isolated test-fixture path alias (/var versus canonical/private/var), not
an actual product/case failure. Failed6-test invocation remainsraw; testfixture
nowresolvesitsroot, matching real controller canonicaloutput, and final6checks
PASS0.061s underexplicit120s/mainlock. No weakened path/ownership guard. Raw
2026-10-10-batch-4-controller-authoring-root plus-orchestration and
-orchestration-canonical-path under benchmark-results/fs-bench-pro.
No actualclone/mount/Store/benchmarkcase was executed by these isolated tests.

Read-only worker review found a remaining mandatory preparation guard gap:
missing prepared_step_runs could silently choose native SDK fallback and
regenerateoriginalbytes inside measuredwork. Tiny owns a fail-closed helper/
SDKstep seal guard; leadwillwire it before claim/clone. No batch4case mayrun
untilthisguard, currentpublicoracle/canonicalcensus test andfull9-asset seal
qualify. This is a source authoring checkpoint, not batch4completion.

| `686344e8f` | Wire original history checkpoints/mode custody/census/deadlines and verification-only execution | 79366 | 79366 | +0 |


H10 integrates Tiny a8c56d570's read-only mandatory helper admission and wires
it before output directory, caseclaim, clone or mount. Exactoriginal SDKstep
indices derive from source case definitions (M1/HNstage2; otherSDK everydeclared
step; originalnonSDK none), notoptionalpreparedrecords. Generator edit-host
binary/sourceargv, current workload/edit/M1recipe runtime seals, source/staged
descriptor/payload geometry/metadata/SHA, exactoperator/member/run/script text
and helperasset set are bound. Missing, partial, swapped, stale or extra
SDKrecords cannot invoke nativefallback/regeneration in measuredwork. Existing
nonbatch4admission staysunchanged. Positive cases preserve original prepared
member order and partial/nonSDK fallback onlywhereoriginaldeclaresnoSDKedit.

Worker15owning byte/seal checks PASS0.273s and five explicit legacyadmission
refusal regressions FAIL beforeguard in0.012s, no product/resources. Lead actual
controller boundary regression against parent686344e8f failed because original
code created a claim/attempted clone rather thanraising the guard refusal.
Corrected7controller checks PASS0.082s;15fixture/admission checks PASS0.242s,
all120s/mainlock. Full sparse control unit uses opaque assets and explicitly
mocks admission/census onlyforchoreography; separate real temporary byte/seal
checks cover admission. All failed/green raw evidence remains at
benchmark-results/fs-bench-pro/2026-10-10-h10-prepared-helper-admission-root and
Tiny's2026-10-10-batch-4-selective-preparation-authoring. No actualcase/clone/
mount/Store was created; no product source changed. Currentpublicoracle and
actualcanonicalextraCommit qualification remain the last source prerequisites
before clean fullbuild/prepare/parity/oneattempts.

| `a8c56d570` (worker) | Fail closed on original prepared SDK placement and current helper seals | 79366 | 79366 | +0 |
| `91cf97fab` | Wire H10 admission before claims/clones and qualify exact guard boundary | 79366 | 79366 | +0 |


Batch4 public persisted proof source integrates recovered Namespace62246886d.
It covers exact boundaryallstates/currentmapping/alias serial+root retention;
frozen dedupselectedroot/metadata/A-B contentroot stability; original M1
selectiveranges/explicitattrs and measuredmode domain; allactualK IDs/parents/
root/scope/profile/stack/base/finalhead and provider catalog/binding/input+after
SHA/size. Args history-step bounds derive from originalcase, while exact
selection is additionally checked bypublicproof. LegacySmall30 rootdistinct/
delta condition andLocal3 repeatedroot/fourfullstate guards remainstrict.

Two agent service/remote-compaction failures (88524d1d-017d-46cb-8cff-
461dbfe33f9c;6b0c659b-1cf9-49ff-96b7-ee6d6e2ab210) are coordination errors,
not testcase failures. Fresh history_runtime_finish reused the same existing
namespaceworktree and exact source. Retained finalboth-target no-runPASS10.06s,
6owned batch4_ tests PASS5.45s (19frozeninline filtered), exact finalsrc hashes
match; no repeat. Earlierunfiltered21PASS4FAIL103.95s<=106/120 remainedraw;
fixtures had unsorted directory changes/missingemptyDirectoryUpdate/65536B
mapping extent above32768 max. Source-valid fixtures repairedthese without
changing any oracle/productguard. No wall ceiling expired. Scopedrustfmt1.85.1
andwhitespacePASS. Recovery also found no prior exporter; it invoked the single
exactexporter once,1PASS0.04s/1,574,447,000ns supervisorwall<=3/120, actualpublic
canonicalC3retrieved/derivechecked/savedroot; Capped'srealimmutablecensus proof
is integratedseparately. No mountedcase/Dockerresource/measurement here.

Lead covering legacyoracle validation at exactintegrated runtime source:
locked/offline release+1.85.1/ARMflags no-run firstPASS8,966,701,042ns;
2Small/Local historytests PASS10.90s (externalwall11,063,823,250ns),
2genericworkspace tests PASS0.56s (1,431,517,667ns),5Gitcustody tests PASS1.37s
(2,227,285,250ns). Each mainlock<=120s; frozen19inline namespaces filtered
perinvocation, no preparation-dependent unrelatedsuite run or case replay.
Raw benchmark-results/fs-bench-pro/2026-10-10-batch-4-legacy-oracle-checks-root.

During private publicoracle recovery, lead clean main91cf97fab built final
nineassets once: raw2026-10-10-batch-4-nine-asset-build-91cf97fab, host+Linux
PASS, completeouterwall<=51/240s build(not test); each actualcompilercommand
<=120s. Pinnedimage and hostsourcechecks insideLinuxbefore+afterPASS,
explicitDisposable/overlayMEMORYOFFEXCLUSIVE/workers1, exactOWNER3two-fuser
refusals remainFAIL; noDurable executed. DaemonSHA remainsf44900cf..., new
Linuxrecipe17aff632... andLinuxpreparedwriter846366af... sealed/archivebound.
Passingownbuildcontainer removedwithacknowledgement; no volume or sample
created. This first nineasset seal stillcontains pre-B4publicoracle runtime
7c66ee0a... and claims compilation only; currentchanged runtime will be rebuilt
with exact eightasset reuse before anyfamily preparation/measurement. No stale
old handler is qualified as a B4execution path. Producttree/79366 unchanged.

| `62246886d` (worker) | Currentpublic full/selected history proof and original step bounds | 79366 | 79366 | +0 |
| `93f0d3dfe` | Integrate public history proof, preserved failures and qualified unchanged assets | 79366 | 79366 | +0 |


Decision40genuine-extraCommit qualification closes with Capped0a6887af4,
dependency Namespace62246886d. Dedicated native publicfixture buildsactual
savedfilesystemobjects andK2 history, publishesC3 via publicHistoryCatalog,
checksCommitId::derive andretrievesexactrow. C3 parent isC2, root is savedC1
and differsfromC2. AfterHandles::seal, onlyisolated WAL/OFFcopy branchhead
is restoredC3toC2; allthreeCommit rows remain. Actualruntime anchoredoriginal
K2typedproofPASS on separatecopy, then exactlysameimmutableSQL/schema/provider/
tuplecore rejectsvalidunreachableC3 as expected. No fabricatedDockerStopped/
exportevents are used: publicsamplewrapper stillenforces actualDockerKnownStop
custody; nativefixtureexercises privateunchanged-readonlycore explicitly.
Synthetic8unitguards are now prospectively labelledsynthetic, receiptsunchanged.

Singleexactexporter1PASS0.04s reused; oneactualPython regressionPASS2.857s /
2,943,888,792ns supervisor<=4/120, typedchild25s stop. BaselinecensusPASS2;
retainedextra EXPECTED_FAIL 'global Commit membership or five-field tuples
differ'. Immutable reset217,088B/hash860b1193c6f05cde5bab691ed4f7016cf2a2d88c9c1fce136940e01a6c0a5c48
staysunchanged. CanonicalC3
1213fdbaa48a28294b483f5d63051ec2b11b42b80ffe4b8df3f3d0632194a0aeb1.
ActualprivatequalifiedruntimeSHAaacd4e5867495f2036d6ae6a216aa32fbbb4f57d663d09a3e76c1be3c17dcdfb.
Postfactor8syntheticguardsPASS0.327s. RawCappedcanonical-census-fixture/
python-canonical-check/qualification.json SHA5a4e106a30bcbb3994aba695c36bf7fcfe5c4a21d5a9aae469f4869012ce9dfe;
canonical-census-supplement.json SHAfc582d62e7e8b26ad3a0f7069debe0e1a020ae63b7be0f7ddf8c6dfd38b79426. Rootcreates no
secondfixture or unchangedproof replay. No mounted/Dockercase/preparation/
measurement/resourceoperations. Final source/binary handoff and familyparity/
actual43oneattempts are next; batch4remainsIN_PROGRESS andall43UNRUN.

| `0a6887af4` (worker) | Qualify actual canonical unreachableCommit and exact readonlycensus | 79366 | 79366 | +0 |
| `7d9380fe0` | Integrate genuine publiccensus regression and close native qualification gap | 79366 | 79366 | +0 |


Finalbatch4 hostruntime seal uses cleanmain7d9380fe0 and qualified fullnineasset
build91cf97fab via bench.py build --reuse-unchanged. Hostlocked/offline release
+1.85.1 PASS, external120s mainlock<=3s; newruntimeSHA
4f1a7d154ef588498116220e2c052d1d54a6000be10685fdb1bced1f03d59db6,
4,654,608B. Exacteight nonruntime binary hashes/profile/ARMflags/image/product/
compiledsource scopes and originalLinuxbefore-after sourcechecks are validated
from immutable fullbuild receipts, notrecompiled or relabelled. Currentfinal
build manifests allnineassets, sourcebefore/afterclean equality and unchanged
producttree. NoDockerresourcecreated byruntime-onlybuild; firstfullbuild's
passingcontainer alreadyremoved. Raw2026-10-10-batch-4-runtime-seal-final.
Durable disabled; explicitDisposable/WAL/OFF, overlayMEMORY/OFF/EXCLUSIVE and
workers1 remain. Fullsource/native/public/census/controller admission checks
are nowqualified; no new productsource/dependency or optimizerwork.

Workers receive currentmain source snapshot and thisseal, synchronize only
reviewed harness changes in their existing three worktrees with own source /
scopedexact counter commits, then preparetheir currentfamily, runbenchparity,
and oneattempt per originalcase. Familyvariants/limits/cache/worker counts
stayfixed, everyfailed/ineligible/unrun outcome retained and resourcecustody
recorded; no laterbatch or unchangedresampling. Nativealias scope already
qualified atfc9e71fae; only genuinelyaffected finalsource checks are permitted.
All43actualcases stillUNRUN at this checkpoint, before dispatched preparation.

| `a70f3197b` | Record final hostruntime seal with qualified eight-binary reuse and dispatch current families | 79366 | 79366 | +0 |


The batch4 workers imported reviewed maina70f3197b harness bytes into their
same existing private worktrees. Exact synchronization commits are
Tinyd57450ed36b1b1ec12d9ca3b45ac3870cf9a0a36 and
Capped7e594f61579dfc7da1b1c96a5608715c7cd456c0, both tree
2c59ed1088c0cdb56189029e267ce974de480532; mixed4c83d1c79.
Each reported exact final nine-binary/compilation-input validation, unchanged
owned family/workload bytes, clean source and unchanged79366 productionLOC.
No redundant build or already-qualified native/public proof was replayed.

Boundary preparation7/7 and parity7 PASS; dedup preparation26/26 and parity26
PASS with zero samples during parity. Closed setup masters are reused only
through exact immutable fixture-digest compatibility. Boundary retains six
owned immutable masters ef90327722e54bf2,31d03200fe4a404e,
838717697a554c50,70cc7bd57bfe4b21,239e74723af54fe8,083f065425ff4f29
(fullprefix layerfs-fsb-master-file-size-transition; exact names remain in
raw prepared.json records). Dedup retains five owned immutable masters
2550381b32d04032,9eeb4a6867d044b0,1e35ef1e53ab4836,
b32f7508b7d24f29,e7d5133801934842, fullprefix
layerfs-fsb-master-dedup-branch-history-. These closed setup volumes are
retained for declared setup reuse, never reused as mutated measurements.
Mixed preparation9/10 PASS at this checkpoint; exhaustive100MB preparation
70.123s under120s, exhaustive500MB preparation underway. No whole-family
mixed parity or actual case outcome is claimed by this checkpoint.

Actual original case executions are dispatched after each family's parity.
Every worker invocation uses its private r4 lock and an explicit external
wall stop at most120s. The original internal operation/proof/publication
limits are retained, including declarations which can exceed the outer
ceiling in combination. The outer ceiling is never extended to accommodate
those declarations; expiry remains FAIL with diagnostic resources retained.
Separate worktrees serialize their own builds/tests/samples, while host and
DockerVM interference from concurrent workers, protected owners and retained
failed containers remains unquantified and disclosed. No unchanged repeat,
case reduction, workload/limit/cache change or optimization is authorized.
Root owns integration/ledger/product fixes; workers own disjoint families and
report exact failed/uncertain resource custody before any corrective source
change. Raw roots are the workers'2026-10-10-batch-4-file-size-transition-d57450ed3,
2026-10-10-batch-4-dedup-7e594f615 and mixed current run under their private
benchmark-results/fs-bench-pro directories. No later batch has begun.

| `87857f5bd` | Record qualified parallel preparation/parity and fixed invocation ceiling | 79366 | 79366 | +0 |


Batch4 first actual attempts expose H11 in the controller, not an identified
product history defect. Boundary small-control at privated57450ed3 acknowledged
both Commits, native verificationPASS, both mounted viewsGone and runtime
KNOWN_STOP. Its191,549,251ns product wall and1,570,163,833ns failedproof wall
are retained; exact14requests/192ownerjobs/857statements. Failed container
57aaa6346ac4cdeed0ce952ffd44d35d3d48cfd28b55b7a6e06835143b236813 and
volume layerfs-fsb-sample-f09bfe9cc54f40f4 remain retained. Raw closed main
180,224B/SHA7f6613a45069123e8b226782402c2202885c56a29aa752a2c585a6772a9d1dfc
matches initial clone; exported WAL181,312B/SHA
5d0a87a2b6faea60ba812aa8feb2d003b47d38fc447ebaa66a501a6a420e49f3
and SHM32,768B remain present. The separate typed copy omitted them and
therefore exposed only the initial state. Six other boundary cases remain
NOT_RUN at this source. Two CSVs preserve allseven rows, worker882f50cb8.

Dedup distributed1 at private7e594f615 likewise acknowledged actualCommit
1216470861ade6aff4c3e208f2879316b2ff9ed5aed3aa1095c970428a2df284b3,
nativeproofPASS, mountsGone/KnownStop;158,878,375ns product wall,
2,268,414,542ns failedproof wall;10requests/102jobs/466statements.
Storelogical1,434,304B/allocated1,437,696B; overlaylogical245,760B/
allocated268,681,216B. Failed container
e06cd7ce378329d80fba7f223d5e563bb6b310f235cac8af556ea95709ed4b24 and
volume layerfs-fsb-sample-e18eab20c1ee4f61 remain retained. MainSHA
d708e027865b52341e0adcab3e7ba4303597b18af4aed180b916513c37e24440
matches originalclone; WAL115,392B/SHA
cb05890a334878460c49b18ef741666113d38ca87f2bf3e60bee9c995d82ac83
and SHM32,768B were omitted by typed copy. Twentyfive othercases NOT_RUN.
Both26-row CSVs preserved, workera38242d7b. No limit miss in either sample,
no failedresource deletion, no replay; all furtheractual B4cases stopped.

Root read exact failed graph stderr/completions/receipts and traced the copy
at workspace.py to the mandatory unfiltered census's sidecar-free contract.
A real SQLite/WAL external controller regression keeps100 acknowledged test
rows in copied WAL; immutable main-only typed copy sees0, producingFAIL.
Red invocation0.067s/120mainlock remains at
benchmark-results/fs-bench-pro/2026-10-10-h11-closed-wal-controller-red.
This isolated orchestration fixture has synthetic rows, explicitly not a
canonical product/measurement proof. Prospective correction preserves raw
KnownStop export and binds a separate WAL-aware standalone snapshot to every
raw file hash, then uses independent typed/census copies. Sidecar refusal,
all original globaltuple/provider/schema/custody/deadline guards remain.
No product source/fix/performance claim follows from this retained failure.

Mixed has no actualcase/claim/sample resource. Nine preparations PASS; the
last v016-mixed-exhaustive-500mb-30000-k100-v1 preparation reaches external
120s ceiling: exit124,wall120,033,743,083ns, no prepared.json. Fifteen selected
cycle-end native states5..75 completed; step80 hasstdout297B/stderr0 but no
completion acknowledgement beforekill and remainsUNKNOWN, notPASS. Those
15completed writers total101,214,199,501ns, each6.389..7.299s and499,934,464B
logical paths; no individual state hang/native error/unsupported recipe was
observed. Source creates original full native fixture/manifest for each of
20selected states; this setup scope remains fixed. Partial preparation is
retained, never retried, shortened, split or promoted. Case is presently
UNRUN because original preparation failed; full-family parity is NOT_RUN.
Raw private namespaceworktree2026-10-10-batch-4-mixed-dispatch/preparation and
2026-10-10-batch-4-mixed-prepared/v016-mixed-exhaustive-500mb-30000-k100-v1.
No speed fix, workload/limit change or productfeature is selected.

| `882f50cb8` (worker) | Preserve first boundary FAIL plus six original NOT_RUN rows | 79366 | 79366 | +0 |
| `a38242d7b` (worker) | Preserve first dedup FAIL plus25 original NOT_RUN rows | 79366 | 79366 | +0 |
| `57648f448` | Integrate both failed run CSV pairs, H11 diagnosis and mixed failed preparation | 79366 | 79366 | +0 |


Section9's passing done-when list cannot be fulfilled for the retained original
500MB exhaustive preparation: no sealed input exists after its one120s attempt.
This own-purpose spec correction records explicit failed closure, notPASS:
preparationFAIL/caseNOT_RUN/parityFAIL, everyoriginal row retained in the two
CSVs; othercases require their own unchanged parityPASS. No nativecheckpoint,
workload, limit, cache, samplecount, verifier or productfeature changes. Family
aggregate parity/batch closure stayfailed for this case, and that truthful
closure permits the nextbatch after all remaining applicablecase work. Source
and bounded receipts show aggregateoriginal setup cost rather than an isolated
state error or identified product correctness bug. No preparation replay is
selected. Root owns guarded report/CLI visibility; worker will preserve original
per-case parity assertions and make failed selections visible without promotion.

| `1ba406e30` | Specify truthful failed closure for the original unprepared exhaustive case | 79366 | 79366 | +0 |


H12 preserves complete failed parity evidence without weakening any original
check. Worker47e5a5500 keeps membership, peeledreference/tagobject, reviewed
sourceSHA, preparedcase/family, nativeverification and fixtureseal assertions
verbatim inside per-case handling. Every original selection yields ordered
PASS or FAIL(reason,error_type), overallFAIL ifanycasefails. It writes new
parity.json/manifest once, then raises ParityFailure(ValueError) carrying exact
.result/.output and first original reason. Existing ValueError rejection tests
remain unchanged, all-PASS return unchanged; global catalogue/output/publication
exceptions stillraise without inventing case verdicts. No missingcase omission
or aggregateFAIL promotion. Worker external missing-middle regressionFAIL on
parent; final4new+3unchangedreview+15fixture checks22PASS0.485s/637,248,167ns
supervisor<=2/120. A first candidate test-fixture macOSpathalias failure remains
raw; resolving expectedpath didnot changeimplementation/guards. Raw private
2026-10-10-batch-4-parity-failure-visibility-red, -green and -fixed.

Root CLI catches only that typedfailed-parity exception, prints retained
family/statusFAIL/allcasecount/samples0/evidence, returns1; all-PASS returns0.
Red driver isolatedexception propagated beforefix, retained under
benchmark-results/fs-bench-pro/2026-10-10-parity-failure-cli-red. Final5driver
checksPASS0.020s/120mainlock at integratedsource, raw -fixed. Previouslyqualified
workerchecks sourcehashmatched and reused, not replayed. No real parity,
nativepreparation/actualcase/retry/product/source-speed change occurs here.
Mixed will retain allten rows, including finalpreparationFAIL/actualNOT_RUN;
only individual unchangedparityPASS cases can be dispatched after H11 closes.

| `47e5a5500` (worker) | Retain every failed parity outcome with original guard rejection API | 79366 | 79366 | +0 |
| `ea7148a19` | Integrate complete failed parity evidence and CLI nonzero summary | 79366 | 79366 | +0 |


H11 corrected source integrates Cappedf2c143b37's prepare_closed_store and
strict optionalnormalized census custody. Root controller preserves exact
KnownStop raw export, creates freshcensus-store/store.sqlite through thehelper,
then an independent writabletyped-store bytecopy. Allnormalization work is
charged to originalproof_work_stop/proof_stop; no timer/limit/cache/workload
changes. Both SQLcensus and publicprovider use the same initialstandalonebytes,
while provider's offlineWritable changes cannot alter censussource or rawexport.
OriginalDocker cp/mainfileSHA/size/manifest/transcript/runtimeStop/volume bindings
remain raw, additionally bound to normalization.json/hash/fullrawfileSHA-set,
helperSHA, exactoutputSHA/size/profile/singlebackup/closedconnections/deadline.
Legacy nonnormalized closedreceipts and wrapperbehavior remainunchanged.

Helper copies the full exact regular main/WAL/SHM set in64KiB windows, never
opensrawexport as SQLite, opens isolatedsource mode=ro/query_only/OFF/WAL,
backs up in128-page steps with zero sleep and immediateBUSY/LOCKED/error abort,
target explicitlyWAL/OFF. It checkpoints onlyits own target, closes bothowned
connections and requires sidecar-free output with WALheaderbytes18:20=[2,2].
Everyrawfile remainsSHA/sizeunchanged. Missing/extraneous/journal/symlink inputs,
sidecars on immutablecensusinput, invalidprofile/deadline/attempts, raw/receipt/
output tamper and rehashed forgedcontract remainrefused. No fsync, busyretry,
manualWAL/header editing, newdependency or productoperation is added.

Worker9externalSQLite-WAL/normalization/strictsyntheticcensus checks PASS0.307s
underprivate120s; legacy8census guardsPASS0.265s and finalnormalized-only guards
leavelegacybranch unchanged. Worker pre-helper regressionERROR(absentAPI) is
retained after demonstratingoldmain1/WAL3rows; Root's actualcontrollerred is
stronger: oldmaincopy0/100. SyntheticStoreFixture IDs/provider/Dockerevents are
explicitly labelledsynthetic; no fabricatedcanonical qualification. Actual
publiccanonicalC3 regression and frozenlegacyoracle qualifications are unaffected
and reused. FinaloracleSHA88393ba40bce9dd08da9e7afa8e8046588c2904fc6a1071faadc2ceb589cc4b4,
newtestSHA c68991799be4c3da8b82ca564d5cedbae9f6fb2eafbc4080191b2cb7846c76a7
matched importedsource exactly. Root final8controllerchecksPASS0.139s/120mainlock,
including realclosedWAL100rows arrivingin typedproof/censuscopy withrawbytes
unchanged; raw2026-10-10-h11-closed-wal-controller-fixed. No tests weakened.

Tiny retainedsample diagnosis independently foundoriginalraw-awarecopyexactly
twoacknowledgedfivefieldCommit tuples/finalhead, versusmain-onlyzero/headNULL.
Original180,224Bmain/181,312BWAL/32,768BSHM hashes stayedunchanged. Its first
analysisSQLitebackupDELETEheader was not a productStoreprofile qualification;
oneapprovedpublicdiagnostic promptlyFAIL44,835,792ns because existingbackend
profile.rs44–49 rejects journal!=wal, beforeprovider/roots. That failure remains
raw, no unchangedsecondattempt, no productbug/receipt promotion. Currenthelper
instead preservesrequiredWALheader. An exactcurrenthelper/newartifact public+
censusdiagnostic maynowqualify recovery before changed-source cases; original
sampleFAIL/custody/counts/CSVs remainimmutable. No mountedworkload/Commit replay
is partof that diagnosis. Producttree/79,366 unchanged; allninecompiledassets
stillmatch finalseal, so no redundantbuild is required. Batch4 remainsinprogress.

| `f2c143b37` (worker) | Normalize complete closed WAL snapshots with strict unchanged raw/census custody | 79366 | 79366 | +0 |
| `2b52bdf17` | Wire H11 complete WAL recovery before independent public/census proof | 79366 | 79366 | +0 |


H11 actual KnownStop sample recovery qualifies at Tiny private
 e2461e160e529c03dc31f0346f6851f565389132, sourcebyte-exact reviewedmain2b52,
countedtreebc7bd355c08a99cd2ba3f6e01d009d3f21514814/+0. Finalninebuildinput/
actualbinary hashes allPASS, runtime4f1a7d...unchanged, no rebuild. Exactlyone
newartifact from actual completefailed rawStore: currenthelperproducesWALformat
217,088B/SHA3d4b147a6b3dac1fa979bd02639b5f846fdb4e16651838c6569db2bf6e077f1d.
Original publicverify-history argv/case/manifest/UID501/GID20/completeacknowledged
transcript remain, onlysealedinput and newreceipt differ. Independenttypedcopy
PASS48,923,875ns, allthree selectedroots0/1/2 andtwoacknowledgements, real
publicschema/catalog/binding/requiredDisposableWALOFF profile qualification.
Actualunfiltered immutablecensusPASS2, exactfivefieldtuples/head/firstparents/
stack/base/catalog/manifest/actualDockerStop/export/runtime/normalizationcustody.
Originalmain/WAL/SHM SHA/sizebeforeafter unchanged. Whole newhelper/public/census
within25s absolutestop, privateouter<=2/120. Thisis retainedcause diagnosis,
no workload/Commit/mount replay, no originalFAIL promotion orfailedresource
removal. Rootverified diagnosticSHA
5c373ffb08f0d1fb92b94c39460cb2d39aaf07e4db5562d24e10e15bf3201ac3;
normalizationreceiptSHAa1215a3fefb73832171ff667322eec6ecba87570a1f084dff12efa262d919534.
Raw Tiny originalcampaign/diagnosis-h11-e2461e160/diagnostic.json. Capped9-test
qualification evidence is explicitly retainedconsoletranscription, not arerun,
originalcampaign/h11-normalization-qualification.jsonSHA
d5f02ab0e804ad40de80484b3d09718972c1740a36cdf5dc399b311ac6b52dfc.

Sourcequalification/coldpolicy/originalcase declarations remainfixed; changed
Pythononly source affects proof machinery, not product/compiledassets. Root
GO dispatches originalsevenboundary cases at e246,26dedup cases at clean
7905e26a2a01af93d9dfacdd9b5256dc4f8fc43e/treea195e225520d43cccdc19e08c3334a63aa7e0a67,
ninemixed preparedcases atclean5faaa263c275f2a747adefab232e51d65be68f4b/
tree7b9fe57b9b7d03d3f51a80f73d7a1bb31255d45c. Eachprivatesync79366delta0,
ownedfamily/workloadhashes unchanged and allninecompiledsource/binarysealsPASS.
Closed originalpreparedinputs reused, nevermutatedsamples orfailedpreparation.
Onlyfirstboundarysmall/distributed1 are affected-source retests; all other
actualcases receivefirstattempts. No unchangedcase repetition orbestof.

Corrected dedupparity PASS26/zerosamples7,615,398,416ns/<=9/120. Mixed whole
parity exactlyonceFAIL34,618,928,375ns/<=35/120,10orderedrows: exactlyninePASS
andlast500MBmissingprepared.json FileNotFoundErrorFAIL. AggregateFAIL unchanged;
no failedselection omitted/promoted. Tiny reuses exactqualifiedsevenunchanged
per-case guards/preparationparity, no redundantnewparity replay. Newrunroots:
Tiny newrunpath willbe recordedfrom itsfinalhandoff; Capped
2026-10-10-batch-4-dedup-7905e26a2, Namespace
2026-10-10-batch-4-mixed-cases-h11-5faaa263c. Firstchangedboundarysmall completes
functional/native/public/globalK2PASS/Gone/KnownStop, numericINELIGIBLE;
223,655,332ns wall,1,802,061,417ns proof,14requests/192jobs/857statements,
no limitmiss; passing administrativepair removal follows knownouterACK.
Remainingcases underway; no family/batchcompletion claimedhere. Original
failedfirstpairs and CSVs remain unchanged. LastmixedpreparationFAIL/actual
NOT_RUN receives explicit administrativeclosure withzero actualattempts and
no fabricatedbenchmark/proofmetrics. Laterbatches remainpending.

| `e2461e160` (worker) | Sync current H11/failed-parity source and qualify actual retained WAL recovery | 79366 | 79366 | +0 |
| `7905e26a2` (worker) | Sync current shared source before corrected dedup one-attempt cases | 79366 | 79366 | +0 |
| `5faaa263c` (worker) | Sync current shared source before mixed failed-aggregate parity and ninecases | 79366 | 79366 | +0 |
| `ba000f704` | Record genuine H11 recovery and dispatch qualified changed-source cases | 79366 | 79366 | +0 |


Batch4 file_size_transition family closes allsevenoriginalcases at reviewed
privatee2461e160, resultse1081cb4b3f06f85f1530d7f33de1fb9f0b9d1e6 /
treef2723a686189653485be1eaf578b91a391c81aad/+0. Bothsevenrow CSVs at
baselines/core/2026-10-10-e2461e160 are importedunchanged. Root verified exact
rawhandoffSHAfb2eeaea43061ebe7d1f27814f3017cc6218828b1c66cf192c4a7800a68d0854
and row/cardinality/status alignment. Raw privateTiny
2026-10-10-batch-4-file-size-transition-e2461e160/FAMILY-HANDOFF.json includes
allsource/build/prepared/checkpoint/census/cache/metrics/limits/removal hashes.
Sixcases strictnative/publicselectedroot/inode/globalcensusPASS, Gone/KnownStop,
passingpairs removedafterguardedpub+outerACK; numericall6INELIGIBLE(H5),
no cachequalificationor speedclaim. Alloriginalfive overwrite K2 checkpoints
and SDKroundtrip K4 checkpoints/censuses qualified. No limit exceeded.

| Original boundary case | Complete ns | Proof ns | Requests/jobs/statements | Store allocated B | Overlay allocated B | Outcome |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| `v016-boundary-small-control-v1` | 223655332 | 1802061417 | 14/192/857 | 397312 | 268668928 | functional/proofPASS; numericINELIGIBLE; Gone/KnownStop |
| `v016-boundary-below-v1` | 237781501 | 1738565250 | 14/194/865 | 790528 | 268664832 | functional/proofPASS; numericINELIGIBLE; Gone/KnownStop |
| `v016-boundary-exact-v1` | 221404584 | 1754203709 | 14/272/1357 | 532480 | 268664832 | functional/proofPASS; numericINELIGIBLE; Gone/KnownStop |
| `v016-boundary-above-v1` | 195659750 | 1710119667 | 14/272/1357 | 532480 | 268664832 | functional/proofPASS; numericINELIGIBLE; Gone/KnownStop |
| `v016-boundary-large-control-v1` | 233357666 | 1804117333 | 14/272/1357 | 1466368 | 268668928 | functional/proofPASS; numericINELIGIBLE; Gone/KnownStop |
| `v016-boundary-roundtrip-v1` | 337660999 | 1724911667 | 26/407/1900 | 729088 | 268668928 | functional/proofPASS; numericINELIGIBLE; Gone/KnownStop |
| `v016-boundary-alias-roundtrip-v1` | 376628789 | 30703500 | UNAVAILABLE/UNAVAILABLE/UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | strictnativeFAIL; verifiermount/StopNOT_ESTABLISHED |

Alias executedallfive originalcommands withfiveCommitted acknowledgements and
measuredEnd/Gone, thenstrictnativefinalFAIL: data mode750/mtime
1791643360.694999760 differs fromexpectedmode750/1700000000.0. Frozenatomic
replacementhelper updatesparentmtime; its own nativeauthoringproof already
refuses that laststate. No parentrestore, weakenedmetadataoracle orproduct
change is authorized. Persistedproof/globalcensus/finalcounts/storageNOT_RUN
orUNAVAILABLE, neverzero/lifetime substitute. Failedverificationmount
 df6da775e176678746558265196886a4e1853ae9c8874365eab37d255fbc0d49 remains
retained; KnownStop notestablished, hostfencePermissionError/observedhostexit1
retained. Failedcontainer
fc826216619af5bc2907d540e8df3301835282b22c719708827d80b4ad375910 and
volume layerfs-fsb-sample-6edfcf62abf74b08 stayretained. OnlymeasuredmountGone
is established; completecase cleanclose is notclaimed. This is retained
originaldefinition/metadata compatibilityFAIL, no identifiedfixableproductbug.
Siximmutablepreparedmasters andoldH11failedsmallpair remainretained.
LaterH13stagingfix doesnotaffectthese completedreceipts; nonearerun.

Dedup at7905 completeddistributed1/10/100 once: allfunctional/proofPASS,
numericINELIGIBLE/Gone/KnownStop andpassingpairsremoved. Nextdistributed500
failssetup stage-code-check exit255 with165,872BsingleBash-c argument, before
anymount/productoperation (sample_count0/attempted_operation_count0). Every
preparedhelperSHA/path is expandedinto that argv byfixtures.stage. Raw
Capped2026-10-10-batch-4-dedup-7905e26a2/run/dedup-history-distributed-500/
staging/stage-code-check.attempt.json andstderr retained. Failedcontainer
2af4f1956a1853e695b5c8b916a849355be16de2112944c5e9c894a816e65ac4 and
volume layerfs-fsb-sample-c60f0a7c016f438a retained; cleanupUNAVAILABLE/
Stopnotestablished/mountkeys[]. Rootstopped furtherunattemptedcases, preserving
currentoriginalsource andallpreps. Workerowns H13 smallestfile-backed full
manifest correction: authenticate exactremotechecksumfileSHA, thenunchanged
sha256sum fullfilechecker; no omittedentries/truncation/tamper/retry/largeargv,
newdependency/product/workload/limit change. Earliercompletedcases unaffected.

Mixed at5faaa completedfouroriginalepisodes once(allstrictfunctional/proofPASS,
numericINELIGIBLE/Gone/KnownStop withpassingpairsremovedafterpubACK):
product/proof ns 1=193,719,124/2,480,153,458;
10=247,202,416/2,808,790,250;
100=1,048,731,959/18,072,620,625;
500=4,548,366,793/17,816,215,666.
Counts95/461/2367,833/3349/18118,8213/37158/190372,41013/186571/952225.
Externalwalls6.569/7.322/27.508/33.558s<120; noadditionalactualcases underway
whenSTOP honored. Preserve thissource/run withallten CSVselectionrows;
remainingfivepreparedM1 cases willusefreshcorrectedsource/run, earlierfour
neverrelabelled/rerun/copiedinto newrun. Finalfamily ledgerselects unaffected
oldfour+newfive+failedprep byexactsource andbothper-runCSVpairs.

Root inspectedlastmixed administrativeunrun-preparationclosure atold5faaa,
receiptSHA38a46e650bae7cc5f74540dc2b5b45cd817c75c4f03a44af2ecbccec085c35a4,
manifestSHA5159e3bafdbcffac69f16d278ca2af2e895e0db751f65d699e084985a49ce323;
allfour referencedoriginalfailedprep rawfilesSHA match. Correctschema/current
source-product-image/original4c83preparedsource, statusFAIL butactualcase/
functional/proofNOT_RUN, zero sample/verification/actualattempt counts;
allbenchmarktiming/count/cache/cleanup/storage fieldsabsent. Preparationwall
120,033,743,083ns is explicitlysetup only, notbenchmark/proofmeasurement.
ReportpreservesperformanceN/A/originaldeclared300s verifier plusactualNOT_RUN
reason; no finalcase bench.run/claim/retry invoked. Laterclosure mayrefer the
samefailedsetup atnewsource withoutinventing anotherattempt orsample.

| `e1081cb4b` (worker) | Record allsevenboundary outcomes, completeproofs and retainedstrictfailure | 79366 | 79366 | +0 |
| `88a2bd27b` | Integrate completed boundary CSV pair and preserve H13/partial mixed custody | 79366 | 79366 | +0 |


The first corrected dedup and mixed source runs are committed without changing
any original receipt. Dedup worker672f3320623762b735f61bae3de483f2136657fd,
tree5109ff7cdff6f62e66ca79d1e21690b39b899a51, adds only the CSV pair under
baselines/core/2026-10-10-7905e26a2. Both files have all26 original selections:
three functional/proof PASS with numeric INELIGIBLE, distributed500 setup FAIL
with proof NOT_RUN/sample_count0, and22 NOT_RUN. Root checked cardinality and
ordered case alignment. This does not claim that all26 cases ran or passed.
The original7e594 H11 failure remains separately committed.

Mixed worker36cd1ee26387787834c83246dd8a4df000e68585,
tree6680657b71c02ecbf4c979cd7ba46d53089baa8f, adds only the CSV pair under
baselines/core/2026-10-10-5faaa263c. Both files preserve allten original cases:
four ordinary episode proof PASS/numeric INELIGIBLE; five prepared M1 cases
NOT_RUN; final unprepared exhaustive case proof NOT_RUN with explicit failed
preparation reason, zero actual attempts and performance N/A. Both exhaustive
selections have performance N/A, with original declared proof limits retained.
Root verified exact performance SHA
6cd83a5ba8ed950a494772a61fff9298081dfbd66cb357a5ec9afb127f54d3c1
and verification SHA
045c9f1b6192ef5b44c27ccc1e76a3afb2d2a3688ba3c7372872bf1ebfb86170,
ordered ten-row membership and four PASS/six NOT_RUN proof outcomes.
Worker report376,161,416ns is reporting only, with no replay. The complete raw
handoff is private namespaceworktree
benchmark-results/fs-bench-pro/2026-10-10-batch-4-mixed-h11-sync/first-source-handoff/handoff.json,
SHAf3d2c04c9e3915630eccc576733dc497e70b08b55b2272e283dcddb509e13c62;
its manifest SHA is71cb9407b897a54ab214556235c7a68c51a06b8ceb28c26f4e4edcd6eb412337.

| Batch4 family | Original cases | Current recorded position | Remaining work |
| --- | ---: | --- | --- |
| file_size_transition | 7 | Six strict proof and clean-close PASS, numeric INELIGIBLE; one original strict metadata failure with verifier mount/Stop unestablished; allseven attempted | Closed failed case retained; reuse unaffected evidence after H13 |
| dedup_branch_history | 26 | Three corrected-source strict passes; one setup argument-size FAIL;22 unrun; older H11 failure retained | Qualify H13, then original23 affected/unattempted cases once at new source |
| mixed_load_bearing | 10 | Four strict passes at5faaa; five prepared cases unrun; final preparation FAIL/actual NOT_RUN; aggregate parity FAIL withnine individual PASS | Qualify H13, then originalfive prepared cases once at new source; retain failed preparation |

The new source runs will again select every original case, preserving NOT_RUN
rows for earlier unaffected cases and citing their earlier authenticated runs
in the final family report. Raw receipts remain at their actual source; no
receipt is copied into a different source registration. The two CSVs per run
keep this distinction explicit. Root will assemble family completion from the
unaffected earlier results and genuinely affected/new attempts, with every
failed and unrun selection visible. No new result ratio, comparison verdict,
cache claim, threshold, workload or limit is introduced.

| `672f33206` (worker) | Preserve three dedup passes, failed500 setup and22 unrun rows | 79366 | 79366 | +0 |
| `36cd1ee26` (worker) | Preserve four mixed passes and every remaining selection with failed preparation reason | 79366 | 79366 | +0 |
| This commit | Integrate both partial source CSV pairs and preserve evidence across the staging fix | 79366 | 79366 | +0 |
