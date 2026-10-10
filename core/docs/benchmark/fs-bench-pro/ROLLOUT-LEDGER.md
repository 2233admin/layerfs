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
| 0.2 Move-only organization | COMPLETE, historical check failures retained | This commit | Update routing guide, then stage 0.3 catalogue |
| 0.3 Case catalogue | PENDING | — | Inventory the frozen root registry and older-commit binding |
| 0.4 Reproducible engine | PENDING | — | Read retained working scripts and rebuild preparation |
| 1 Pilot | PENDING | — | Wait for stage 0.4 completion |
| 2 Edits | PENDING | — | Wait for batch 1 completion |
| 3 Trees and tools | PENDING | — | Wait for batch 2 completion |
| 4 History on one branch | PENDING | — | Wait for batch 3 completion |
| 5 Branches and Workspaces | PENDING | — | Wait for batch 4; add P-1 SDK forwarding methods |
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

## Bugs

None observed yet. Each entry will name case, symptom, source-backed cause,
fix commit and external regression test.

## Failed, ineligible, not-applicable and unrun cases

No case has been sampled. All families remain unrun pending the committed
catalogue and engine. No case is closed by this statement.

## Checks and source size

Handoff commit: documentation-only; checked whitespace and the new spec's
local links. Rust/runtime checks do not cover this documentation change.
Production LOC is counted before each commit with the pinned
`count_absent_aware.py staged` and confirmed against the committed tree.
Initial active core: 79,366. Reference absent (retired R9c; last counted
65,417 at tree `498dd1917812`).

## Resource custody

No containers or volumes created by this run yet. Protected handoff scripts,
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
