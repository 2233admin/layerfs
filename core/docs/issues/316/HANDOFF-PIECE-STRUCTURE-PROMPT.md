# Handoff: implement reference pieces

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Prepared 2026-10-11 for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). This is the
assignment for the agent that implements the plan. It adds no rule of its own:
where it and a document below disagree, the document governs.

## 1. Assignment

Implement reference pieces in `core/`, phase by phase, as specified in the
[implementation plan](PIECE-STRUCTURE-IMPLEMENTATION-PLAN.md), under the
[rules and guidelines](PIECE-STRUCTURE-GUIDELINES.md).

Goal: when an ordinary program rewrites bytes that did not change, overlay
storage and Commit work no longer depend on file size. Exec is not required to
become independent of file size (owner, 2026-10-11).

## 2. Read first, in this order

1. [AGENTS.md](../../../../AGENTS.md) and [core/AGENTS.md](../../../AGENTS.md).
2. [Requirements note](LOCALIZED-EDIT-REQUIREMENTS.md): what a generic command
   is and which routes are forbidden.
3. [Rules and guidelines](PIECE-STRUCTURE-GUIDELINES.md): every rule is cited
   by number; section 6 records the owner decisions.
4. [Implementation plan](PIECE-STRUCTURE-IMPLEMENTATION-PLAN.md): design,
   tables, files, phases, tests, iteration procedure.
5. [Cache inventory](CACHE-INVENTORY.md).
6. The [optimization guide](../../../../docs/general/optimization-guide.md) and
   the [measurement workflow](../../../../docs/general/agent-measurement-policy.md).

## 3. Where to work

- Branch `issue316-fsb-rescue`, local and unpushed, in its own worktree. Do
  not push. Do not write to any other checkout or worktree, and do not
  interrupt another agent's containers, locks or receipts.
- The branch is based at `2590a4536`. Before any benchmark run, bring in the
  local main that carries the runnable family ports (issue 317 names
  `27708c11d`) and take the control sample of plan section 10.3 there.
- The branch carries one exploratory product commit, `8c1993f4a`, with its
  test `0ad8b6f43`. The plan's line counts and its description of the captured
  reader assume it. It has not had warning-denying Clippy, Linux tests or its
  architecture update. Complete those in phase 0, or report why it must be
  dropped.

## 4. Fixed constraints

- Only ordinary filesystem requests create or influence a piece. No ioctl, SDK
  call, control-channel call, wrapper or changed benchmark writer (rules A-1 to
  A-4).
- A miss stores bytes exactly as today, and every read returns the same bytes
  either way (rules B-2, B-3).
- Disposable/WAL/OFF only; Durable is not run. One construction producer:
  export `LAYERFS_CONSTRUCTION_WORKERS=1`.
- Every test command stops at 120 s; build with `--no-run` first. Host cargo
  is `+1.85.1 --locked`.
- Every commit records production LOC before, after and delta.
- One sample per case and identity. No resampling for a better number.

## 5. Phases and what "done" means

| Phase | Work | Done when |
| --- | --- | --- |
| 0 | Checks for `8c1993f4a`; newer base; control sample of the nine cases; throughput of chunk hashing and cut scanning on this host; count of prepared statements in use | Numbers and receipts recorded; no product change beyond the pending checks |
| 1 | Table and statements, read path, truncate, full lifecycle, Reference step, edit script. Pieces are created only by tests through the public overlay API | Plan section 10.2 phase 1 tests pass; byte-exact read-back across capture, Commit and remount; Commit counts equal at two file sizes; the nine cases show counts equal to the control |
| 2 | Recognizer without carry | Nine cases sampled; target cases improve in overlay bytes and Commit jobs; regression cases unchanged |
| 3 | Carry across requests with the content sequence; byte-compared edges | Overlay bytes and Commit jobs of the 10 MiB and 500 MiB insert are nearly equal |

Cross-file sources and `copy_file_range` are not part of this assignment.

## 6. Stop and return to the owner

Do not work around any of these:

1. A bound in guideline section D cannot be met without breaking a rule in A,
   B or C.
2. A regression case in the nine-case set regresses beyond sample noise and the
   recognizer is the cause.
3. Moving a long piece between layers cannot be done in bounded steps.
4. The prepared-statement capacity of 256 is not enough.
5. A test command reaches 120 s.

## 7. Known obstacles

- The daemon test target `e2_startup_receipts` does not compile because of a
  moved harness path.
- The two tests of overlay `close_custody` share one temporary directory and
  fail intermittently.

Confirm each at the base before treating it as pre-existing.

## 8. Hand-back

For each phase: the commits with their production LOC lines; the tests run and
their results, including failures; the nine-case table with overlay bytes,
writer jobs, statements, requests, and exec and Commit times reported
separately; every sample that failed, kept as failed; what was not done.

Two decisions stay with the owner and are reported, not assumed: how the
retention guard is judged for the shift cases, and whether the 2 s limit on the
capped cases stays.
