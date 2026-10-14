# Handoff: implement reference pieces, unattended

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Prepared 2026-10-11 for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). It replaces the
earlier attended handoff in this file. This is the whole assignment for one
agent working alone while the owner is away. It adds no product rule: where it
and a document in section 2 disagree on design, the document governs.

## 1. Assignment

Implement reference pieces in `core/`, phase by phase, exactly as the
[implementation plan](PIECE-STRUCTURE-IMPLEMENTATION-PLAN.md) specifies, under
the [rules and guidelines](PIECE-STRUCTURE-GUIDELINES.md).

Goal: when an ordinary program rewrites bytes that did not change, overlay
storage and Commit work no longer depend on file size. Exec is not required to
become independent of file size (owner, 2026-10-11).

Owner instructions for this run, 2026-10-11:

- Work iteratively and without asking questions. Nobody will answer.
- Follow the plan's file and folder structure and its algorithm strictly.
- Verify with the fast targeted tier first, then widen step by step.
- Commit at every checkpoint.
- Report optimization progress on
  [issue 317](https://github.com/Ephemeral-AI-Lab/layerfs/issues/317).
- Use the existing worktree, which already carries one optimization.
- Subagents may be used.
- Round trips, inefficient FUSE handling, database operations and internal
  steps found on the way may be optimized too (section 9).

## 2. Read first, in this order

1. [AGENTS.md](../../../../AGENTS.md) and [core/AGENTS.md](../../../AGENTS.md).
2. [Requirements note](LOCALIZED-EDIT-REQUIREMENTS.md): what a generic command
   is and which routes are forbidden.
3. [Rules and guidelines](PIECE-STRUCTURE-GUIDELINES.md): rules are cited by
   number; section 5 lists the stop conditions, section 6 the owner decisions.
4. [Implementation plan](PIECE-STRUCTURE-IMPLEMENTATION-PLAN.md): sections 3, 4
   and 7 are the algorithm and tables, section 9 the files, section 10 the
   phases, tests and tiers.
5. [Cache inventory](CACHE-INVENTORY.md).
6. The [optimization guide](../../../../docs/general/optimization-guide.md),
   the [measurement workflow](../../../../docs/general/agent-measurement-policy.md)
   and the [harness guide](../../../benchmark/fs-bench-pro/AGENTS.md).

## 3. Where to work

- This worktree, branch `issue316-fsb-rescue`, local and unpushed. Never push.
- Do not merge, rebase or otherwise bring in `main`. Every tier-2 and tier-3
  case is runnable at this base. `main` moves under another agent, and a merge
  conflicts in a benchmark file.
- Another agent is running in the main checkout. Never write to that checkout,
  to any other worktree, or to their lock, receipts, containers or volumes.
  Stop or remove only containers this run started.
- The branch carries one exploratory product commit, `8c1993f4a` (captured
  reader returns shapes only; compose by runs), with tests `0ad8b6f43` and
  `f5bfa0afa`. The plan assumes it. It has not had warning-denying Clippy,
  Linux tests or its architecture-document update. Phase 0 completes those.

## 4. Working without the owner

- Never ask a question and never wait for an answer. When a choice is needed,
  take the option that the documents in section 2 support, record it in the
  ledger as "decided by agent, pending owner review" with the reason, and
  continue.
- Ledger: `core/docs/issues/316/PROGRESS.md`, append-only, created at the
  first checkpoint. One entry per checkpoint: commit, what changed, checks run
  with results, the tier table, decisions taken, what failed.
- A stop condition (guideline section 5, and the list below) cannot be
  returned to the owner tonight. Instead: do not commit the failing work, or
  `git revert` the stage commits that caused it; record the evidence in the
  ledger and on issue 317; then continue with the next independent item, which
  may be the optimization track in section 9. Never patch around a stop
  condition.
- Stop conditions added by this handoff: moving a long piece between layers
  cannot be done in bounded steps; the prepared-statement capacity of 256 is
  not enough; a test command reaches 120 s (a hang: diagnose from source and
  bounded output before any rerun).
- Never weaken a rule, a benchmark oracle, a proof, a contract or the
  benchmark writer to make progress. Three points stay with the owner and are
  reported as observed, never assumed: how the retention guard is judged for
  the shift cases (O-6), whether the 2 s limit on the capped cases stays
  (O-9), and Storage's exact-reuse readback contract.
- Subagents: read-only research may run in parallel. Only one agent writes a
  given set of files at a time. Only one build, test or benchmark runs at a
  time, under the worktree lock. Subagents do not commit and do not post to
  GitHub; the main agent checks their work and commits it.
- End the run only when phase 3 is handed back (section 10) or every remaining
  item is blocked by a recorded stop condition.

## 5. Fixed constraints

- Only ordinary filesystem requests create or influence a piece. No ioctl, SDK
  call, control-channel call, wrapper, edit tool or changed benchmark writer
  (rules A-1 to A-4).
- A miss stores bytes exactly as today, and every read returns the same bytes
  either way (rules B-2, B-3).
- No speed bought with allocated storage, unbounded memory or raised cache
  bounds. No benchmark-fitting.
- Structure: create exactly the files of plan section 9, in those folders.
  Respect the 999-line file and 200-line `lib.rs`/`mod.rs` ceilings; no tests
  in `src`. Split `layerfs-daemon/src/overlay/commands.rs` before adding a
  variant to it. A deviation is allowed only where the source makes the listed
  placement impossible; record why, and update plan section 9 in the same
  commit.
- Algorithm: plan sections 3, 4 and 7. The same deviation rule applies.
- Disposable/WAL/OFF only; Durable is
  `NOT_RUN — disabled by owner until explicit reauthorization`. Export
  `LAYERFS_CONSTRUCTION_WORKERS=1`.
- Host cargo is `+1.85.1 --locked`. Every test command stops at 120 s; build
  with `--no-run` first.
- A SQLite claim needs the query plan and a correlated runtime database
  profile.
- Update the affected architecture document in the same change as the source.

## 6. Phases

| Phase | Work | Done when |
| --- | --- | --- |
| 0 | Clippy, formatting, guard, Linux tests and the architecture update for `8c1993f4a`; the control sample (tag `c0`) of the nine cases; throughput of chunk hashing and cut scanning on this host; count of prepared statements in use | Numbers and receipts in the ledger; no product change beyond what the pending checks require |
| 1 | Table and statements, read path, truncate, full lifecycle, Reference step, edit script. Pieces are created only by tests through the public overlay API | Plan section 10.2 phase 1 tests pass; byte-exact read-back across capture, Commit and remount; Commit counts equal at two file sizes; the nine cases show counts equal to `c0` |
| 2 | Recognizer without carry | Target cases improve in overlay bytes and Commit writer jobs; regression cases unchanged; tier 3 sampled |
| 3 | Carry across requests with the content sequence; byte-compared edges | Overlay bytes and Commit writer jobs of the 10 MiB and 500 MiB insert are nearly equal; tier 3 and tier 4 sampled |

Cross-file sources and `copy_file_range` are not part of this run.

## 7. Checkpoints

A checkpoint is one small, coherent, green step. Several make up a phase.

1. Tier 1 passes for every crate touched.
2. `cargo fmt --check`, Clippy with `-D warnings` on the touched packages,
   `python3 -B core/tools/check_product_boundary.py`.
3. Count production LOC from the staged tree and commit with
   `Production LOC: <before> -> <after> (delta <signed>)`, scope and method:
   `python3 -B core/docs/issues/307/checks/r9c-reference-retirement-20261010/tools/count_absent_aware.py staged`.
   Report the reference scope as
   `reference absent (retired R9c; last counted 65,417 at tree 498dd1917812)`.
   End the message with the attribution line this repository's sessions use.
4. At a stage checkpoint (the end of each phase, and each recognizer step in
   phases 2 and 3): after the commit, sample tier 2 at that clean identity
   under a new tag; add the table to the ledger in a following documentation
   commit; post one comment to issue 317.

## 8. Verification tiers

Fast and targeted first; widen only when the narrower tier is green.

| Tier | When | What |
| --- | --- | --- |
| 1 | Every change | Tests of the crate being edited (plan section 10.3), each under 120 s |
| 2 | Every stage checkpoint | The nine fixed cases of plan section 10.3 |
| 3 | End of phases 2 and 3 | All of `edit_length_changing`, `edit_length_preserving`, `edit_canonical_chunk_count`, `edit_length_changing_capped` (61 cases) |
| 4 | Final hand-back | `payload_create_read`, `workspace_change_locality`, `tiny_file_churn`, `small_file_delta_smoke`; full package tests, each command under 120 s; Clippy on all targets; guard and its self-tests; mounted proofs, including one process started outside the Exec API |

Tools, in [tools/](tools/):

```sh
python3 -B core/docs/issues/316/tools/cargo_step.py 600 build-overlay test -p layerfs-overlay --locked --no-run --manifest-path core/Cargo.toml
python3 -B core/docs/issues/316/tools/cargo_step.py 120 test-overlay test -p layerfs-overlay --locked --manifest-path core/Cargo.toml --test captured_runs
python3 -B core/docs/issues/316/tools/tier_step.py <tag> 120 build
python3 -B core/docs/issues/316/tools/tier_step.py <tag> 115 prepare $(python3 -B core/docs/issues/316/tools/tier.py t2)
python3 -B core/docs/issues/316/tools/tier_step.py <tag> 115 run $(python3 -B core/docs/issues/316/tools/tier.py t2)
python3 -B core/docs/issues/316/tools/tier_table.py --md c0 <tag>
```

- `tier.py <t2|t3|t4>` prints the cases of a tier. `tier_step.py` refuses a
  dirty tree, builds once per tag and never samples a case twice for one tag.
  Use a new tag for every commit sampled (`c0`, `p1`, `p2a`, ...). It sets the
  construction worker count and the interference declaration.
- Time (owner, 2026-10-11): no command runs longer than 2 minutes, 5 in an
  extreme case. `tier_step.py` runs the steps it is given inside the stated
  budget and prints the ones it did not start; call it again to continue.
- Storage (owner, 2026-10-11): at most two copies of a case's payload. The
  original (prepared folder and master volume) is shared by every tag under
  `issue316-originals/`, never changed, and replaced only when the product or
  harness source changes. The test copy (the sample's clone volume, its
  containers and the exported closed Store) is removed as soon as its sample
  ends, whatever its status; receipts, logs and counts stay.
  `tier_step.py <tag> 60 clean` removes any test copy left behind and
  `clean originals` also removes the originals.
- `bench.py run` exits 1 for every row that is not PASS, INELIGIBLE included.
  That is a result to record, not a failed step. Do not run `bench.py report`.
- Families `file_size_transition`, `git_tool_workflow`, `dedup_branch_history`
  and `mixed_load_bearing` are registered as `pending` at this base. Report
  them as not runnable here; do not port them.
- One sample per case and tag. A surprising result is diagnosed from its
  counts and receipt, not sampled again. Failed samples stay as failed.
- Compare in this order: overlay bytes of the target cases; Commit writer jobs
  and statements; request counts, which must not change; exec and Commit time,
  reported separately and treated as diagnostic. Identical code has given 4.9
  to 8.2 s of Commit for `payload-create-500m`.
- Several control rows are FAIL or INELIGIBLE before any change. Read each
  receipt's original failure and record it; a row is never described as
  passing unless its receipt says PASS.

## 9. Optimization track

Allowed after a phase checkpoint, or when the phase work is blocked.

- Each optimization is its own small counted commit with the tier-2 counts
  before and after. Keep it only if counts improve and nothing regresses;
  otherwise revert it and record the result.
- Leads from earlier reading, each to be confirmed by counts before any
  change: construction windows smaller than 128 KiB; more than one reader
  transaction per READ demand; an object authenticated more than once after
  one fetch; point reads of operation records in the edit engine (71 to 307
  provider calls for a single-edit file); overlay read-back and Store writer
  cost on a new-content Commit, which is the larger share of measured Commit
  time and which pieces do not help.
- Not allowed: anything in section 5; changing Storage's exact-reuse readback;
  a cooperating-program route; a change that helps only a benchmark case.

## 10. Progress on issue 317 and hand-back

One comment per stage checkpoint, posted with
`gh issue comment 317 --repo Ephemeral-AI-Lab/layerfs --body-file <file>`.
Keep draft files under `core/target/issue316/`, which is ignored.

Each comment states: the checkpoint and phase; that the branch is local and
unpushed, with the short commit; what changed in one or two sentences; the
`tier_table.py --md` output for the control and the new tag, exec and Commit in
separate columns; every failed or ineligible row as observed; decisions taken
by the agent; the next step. The repository is public: no local absolute paths,
user names, host names or receipt paths. Do not edit the issue body or close
the issue.

Final hand-back, in the ledger and as the last comment: commits with their
production LOC lines; tests run and results, including failures; the tier
tables; what was reverted and why; decisions awaiting owner review; what was
not done.

## 11. Known obstacles and mechanics

- The daemon test target `e2_startup_receipts` does not compile because of a
  moved harness path. The two tests of overlay `close_custody` share one
  temporary directory and fail intermittently. Confirm each at `2590a4536`
  before treating it as pre-existing.
- `core/target/r4-locked.pl <seconds> <command>` is the worktree lock with a
  wall stop: exit 124 is the wall stop, exit 75 is a busy lock.
- In this worktree the shell refuses compound git commands and commands whose
  paths come from shell variables. Use one git command per call and literal
  paths, or put the logic in a script. Do not change directory.
- The harness identity needs a clean tree: commit before sampling, and keep
  scratch files under `core/target/` or outside the repository.
