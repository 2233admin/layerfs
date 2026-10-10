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
| Handoff specification | COMPLETE | This commit | Harvest released references |
| 0.1 Released references | PENDING | — | Copy all source rows with provenance |
| 0.2 Move-only organization | PENDING | — | Map existing files and their owning tests |
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
