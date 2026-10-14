# Handoff: benchmark integration and a new baseline, unattended

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Prepared 2026-10-11 for
[#318](https://github.com/Ephemeral-AI-Lab/layerfs/issues/318). This is the
whole assignment for one agent working alone. It adds no product rule: where
it and a document in section 2 disagree on design, the document governs.

## 1. Assignment

Merge the reference-piece work with the completed fs-bench-pro harness, sample
every case of the 25 families once at the merged source, fix what that
exposes one issue at a time, and report a final full run as the new baseline.
The issue holds the rollout plan and the checklist; this file says how to work.

Owner instructions for this run, 2026-10-11:

- **Work iteratively. Never ask a question and never wait for an answer.**
- **Do not stop before terminal success** (section 9). An obstacle is
  diagnosed and worked through, or recorded with its evidence while the next
  independent item is started (section 8). Ending a turn with work left and
  no recorded blocker is a failure of this assignment.
- Merge `main`; run the full benchmark; fix issues along the way; report the
  new baseline numbers honestly.
- No command runs longer than 2 minutes, 5 in an extreme case.
- At most two copies of a benchmark payload: one original, one test copy.

## 2. Read first, in this order

1. [AGENTS.md](../../../../AGENTS.md) and [core/AGENTS.md](../../../AGENTS.md).
2. Issue 318: the plan, the rules and the checklist.
3. The reference-piece ledger, [316/PROGRESS.md](../316/PROGRESS.md): read the
   last four entries (tier 4 interrupted; Docker stop; tier 4 samples; phase 3
   hand-back). They hold the only surviving numbers of that run, its open
   items and its mistakes.
4. [Reference-piece rules](../316/PIECE-STRUCTURE-GUIDELINES.md) and
   [plan](../316/PIECE-STRUCTURE-IMPLEMENTATION-PLAN.md), sections 3, 4, 7
   and 13, before changing any product source.
5. After the merge, from `main`: `core/benchmark/fs-bench-pro/AGENTS.md`,
   `core/docs/benchmark/fs-bench-pro/implementation-spec.md`,
   `core/docs/benchmark/fs-bench-pro/ITERATION-1-COMPLETION.md` and
   `core/docs/benchmark/fs-bench-pro/ROLLOUT-LEDGER.md`. Iteration 1 is the
   control of this rollout. These files are not on the branch before the
   merge.
6. The [measurement workflow](../../../../docs/general/agent-measurement-policy.md)
   and the [optimization guide](../../../../docs/general/optimization-guide.md).

## 3. Where to work

- The existing worktree of branch `issue316-fsb-rescue`. Create branch
  `issue318-benchmark-baseline` from that branch's tip and work there.
  `issue316-fsb-rescue` stays as the record of the reference-piece run.
- Merge local `main` (`8f911fe6b` when this was written; take its tip) into
  the new branch. **Never write to the main checkout, to another worktree, or
  to `main` itself.** Never push. No pull request.
- The agent that produced iteration 1 has finished. Its containers, volumes
  and receipts are still not yours: stop or remove only what this run starts.
- Git in this worktree: one git command per call. A compound shell command is
  often refused; put multi-step logic in a script file under the ignored
  `core/target/issue318/` and run it as one plain command.

## 4. Hard limits

- **Baseline before fixes.** Phase C is sampled at one merged commit with no
  product or harness fix in between. Fixes start in phase D.
- **One sample per case and source identity.** No retry, no best-of, no
  second sample to look for a pass. A failed sample stays failed.
- **No weakened oracle, proof, contract, limit or Storage readback.** No
  benchmark-fitting. No speed bought with allocated storage, unbounded memory
  or raised cache bounds.
- **Only ordinary filesystem requests create or influence a piece.** No
  ioctl, SDK, wrapper, edit tool or changed benchmark writer.
- **Time.** Every command has a wall stop of at most 120 s; 300 s only for a
  step that cannot fit, with the reason recorded. Nothing runs in the
  background to wait it out. A case that cannot finish inside 300 s is
  recorded as not sampled.
- **Storage.** Section 6. Check `df` and `docker system df` before the run
  and after every family; record both.
- **The harness engine stays iteration 1's.** Apply the storage rule in the
  driver, not in `engine/`, so the harness identity matches the control. The
  one exception is the merge conflict of section 5A.
- Disposable/WAL/OFF only. `LAYERFS_CONSTRUCTION_WORKERS=1`. Host cargo is
  `+1.85.1 --locked`. Durable is
  `NOT_RUN — disabled by owner until explicit reauthorization`.
- 999-line file and 200-line `lib.rs`/`mod.rs` ceilings; no tests in `src`;
  architecture documents updated in the same change; a SQLite claim needs a
  query plan and a runtime profile.
- **Left to the owner, report as observed and change nothing:** how the
  payload-retention check is judged for shift edits (O-6), the 2 s limit of
  the capped family (O-9), and the benchmark volumes earlier runs left in
  Docker.

## 5. Phases

Each phase ends with a ledger entry, a commit and one comment on the issue.

### A. Merge

1. Branch, then merge `main`. Expected: one conflict, in
   `core/benchmark/fs-bench-pro/engine/recipes/edit_model.rs`. Take `main`'s
   side; re-apply the branch's small change (commit `a95414ac5`, the final
   digest check kept out of the timed writer) only if `main` does not already
   do the same, and record which. `writers/edit.rs` merges by itself; read
   the result.
2. The merge commit carries a production LOC line against its first parent.
3. Verify: tests of content, overlay, Workspace, FUSE, daemon and persistence;
   Clippy `-D warnings` on all targets; formatting; the boundary guard and its
   self-tests; the Linux mounted proofs, including `mounted_recognizer`.
4. Exit: all of that recorded, failures included.

### B. Tests before the benchmark

Add the tests of the issue's phase B list to the owning packages' `tests/`
folders. Each asserts the bytes read back and counts piece rows. A pattern
that is not recognized is a recorded result, not a failure; wrong bytes, a
stale piece or a refused request is a product bug: stop sampling plans that
depend on it, write the failing test, fix it, and note it in the ledger as
found before the baseline. Exit: every listed pattern has a test and a
recorded outcome.

### C. Baseline run

1. The twelve exact-count cells first; compare with iteration 1's triples.
2. Then the families in iteration 1's batch order. `workspace_reliability`
   is recorded as iteration 1 classified it.
3. After the first sample of each family, measure its result folder and
   Docker. If a copy of the payload remains, extend the driver before the
   next sample.
4. When a family finishes: its table into the ledger, then `bench.py report`
   for that run so its CSVs are committed beside iteration 1's. Report
   folders are named by date and source commit; never overwrite iteration 1's.
5. Compare with iteration 1, counts first: overlay bytes, requests, writer
   jobs, statements; then exec and Commit time, separately, as diagnostic.
   Expected difference: the 20 payload-retention failures of
   `edit_length_changing` become 12. List every other difference.
6. Exit: every one of the 273 cases has an outcome at the merged commit:
   PASS, INELIGIBLE, FAIL with its original failure text, not applicable, or
   not sampled with the reason.

### D. Fixes

1. Classify every failed row: product bug, harness limit, or owner decision.
2. Order: the 12 payload-retention failures; the delete whose Commit grows
   with the file size (ledger of #316, "Open: a few stored cells in the large
   delete"); then the failures iteration 1 recorded.
3. One issue a commit: a failing external test first, the fix, the covering
   tests, a production LOC line. Then sample only the affected families under
   a new tag.
4. A bug whose cause is not found after reading its receipt, the source and
   one count profile is recorded as open with what was ruled out. It is not
   sampled again to look for a pass.
5. Exit: every failed row is fixed, recorded as open with a diagnosis, or
   recorded as an owner decision.

### E. Final run and report

All families once at the final source, under a new tag, as in phase C. Then
the hand-back entry in the ledger (commits with LOC lines, tests and results
including failures, the tables, what was reverted, decisions awaiting review,
what was not done) and the final comment on the issue.

## 6. Storage rule and the driver

Owner, 2026-10-11: "keep at most two copies of them (one original copy (never
change). one for test copy which is initially clone from original copy)". The
reference-piece run filled the disk and lost every receipt when its ignored
folders were removed.

- `python3 -B core/docs/issues/316/tools/tier_step.py <tag> <budget> <build | prepare | run | clean> [<family>:<case> ...]`
  keeps one original a case under `issue316-originals/`, shared by all tags,
  and removes each sample's test copy (clone volume, containers on it, the
  exported Store) when the sample ends. `clean` removes leftovers;
  `clean originals` removes the originals too. Run `clean originals` after
  the last sample of a phase.
- It starts a sample only with 75 s of its budget left. Give a case that
  needs longer a call of its own with a budget up to 300.
- It refuses a dirty tree, and a commit in the middle of a tag breaks the
  tag's run registration: commit before a tag starts and after it ends.
- It was written for the families of #316. Iteration 1's families may prepare
  or sample differently (history schedules, host Init, parity). Extend the
  driver where a family needs it; do not go around it with bare `bench.py
  run`, which keeps every failed sample's volume and container.
- `tier_table.py --md <tag>` prints a tag's rows; `check_cleanup.py` checks
  the removal against Docker.
- Do not pipe a driver's output through `cut` or `tail`: that hid a
  `StorageFull` failure.

## 7. Mechanics that cost time before

- `core/target/r4-locked.pl <seconds> <command>` is the lock and wall stop.
  It is an ignored file with this worktree's lock path inside. If it is
  missing, copy the main checkout's and rewrite the lock path; using theirs
  takes their lock.
- `core/target/cluster2-linux-cargo`, `r7-host-release` and
  `r7-linux-release` are the benchmark's build caches; `bench.py build` runs
  offline with 120 s limits and needs them warm. If they are missing, clone
  them from the main checkout with `cp -cR` and warm both builds outside
  `bench.py` first.
- `python3 -B core/docs/issues/316/tools/cargo_step.py <limit> <label> <cargo args>`
  runs host cargo with the pinned toolchain; do not pass `+1.85.1` yourself.
  Build tests with `--no-run` before running them.
- The daemon package is tested by naming its test targets when one of them
  does not build. On the host, three daemon tests fail without being
  regressions: `complete_installed_roots::huge_native_namespace_is_complete_after_install`
  and `host_handoff` need inputs a plain run does not make, and the two tests
  of `r4_9_driver_causes` collide on one fixture folder unless run with
  `--test-threads=1`. Report them as observed.
- Linux tests run in the pinned image
  `sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6`
  with their own target folder; mount tests need `--device /dev/fuse
  --cap-add SYS_ADMIN --security-opt apparmor=unconfined` and
  `-- --test-threads=1`. The wrapper the last run used was an ignored file
  and is gone; write a new one under `core/target/issue318/`.
- A sample ended by a wall stop leaves its daemon container running under a
  random name. The driver removes it by its sample volume. Never stop a
  container you cannot tie to a volume of this run.
- Never edit a tracked file while a build or a sample is in progress.

## 8. Instead of stopping

| Obstacle | Do |
| --- | --- |
| A test or sample fails | Record it as failed with its text. Diagnose from the receipt and the source. Continue with the next item. |
| A command reaches its wall stop | It has failed as a hang. Diagnose before any rerun; split the work or give that one step up to 300 s with the reason. |
| The disk or Docker's disk is full | Run `clean`, then `clean originals`. If Docker is still full of resources this run did not make, record the counts, do every item that needs no Docker, and say so in the phase comment. |
| A product bug blocks a family | Record it, sample the families that do not depend on it, come back in phase D. |
| A question only the owner can answer | Take the conservative choice, record it as "decided by agent, pending owner review", continue. |
| A fix makes a count worse elsewhere | `git revert` it, record the evidence, continue. |
| The worktree's ignored files disappear | Recreate them from section 7; the ledger and the commits are the record. |

The only acceptable end before phase E is the issue's last line: every
unchecked item is recorded in the ledger as blocked, with its evidence.

## 9. Records and terminal success

- **Ledger:** `core/docs/issues/318/PROGRESS.md`, append-only, one entry a
  phase exit and one a family table. Numbers go into it when they are
  produced.
- **Commits:** at every checkpoint, each with
  `Production LOC: <before> -> <after> (delta <signed>)` from
  `python3 -B core/docs/issues/307/checks/r9c-reference-retirement-20261010/tools/count_absent_aware.py staged`,
  the scope line `reference absent (retired R9c; last counted 65,417 at tree
  498dd1917812)` and the method line.
- **Issue:** one comment a phase exit with `gh issue comment 318 --repo
  Ephemeral-AI-Lab/layerfs --body-file <file>`: the phase, the branch (local,
  unpushed) and commit, what changed, the tables with exec and Commit in
  separate columns, every failed, ineligible and unrun row as observed,
  decisions by agent, the next step. Tick a checklist box by editing the
  issue body only to change `[ ]` to `[x]`. **The repository is public:** no
  local absolute path, user name, host name or receipt path. Never describe a
  row as passing unless its receipt says PASS. Do not close the issue.
- **Terminal success:** phase E is recorded in the ledger and in a final
  comment on the issue, with the final run's CSVs committed beside iteration
  1's and the originals removed.
