# Issue 334: verify the SDK skill live, then build "shop" on LayerFS with two agents

> **Status:** Archived; retained for historical evidence only.

The A–D exercise completed on 2026-10-16. [RESULTS.md](RESULTS.md) preserves the
original diagnostic results and Builder 2 report. [CLOSURE.md](CLOSURE.md) records
the subsequent owner-authorized review, publication and merge disposition;
[EVIDENCE.md](EVIDENCE.md) locates the portable receipts and stopped Store exports.
The two collection deviations remain disclosed. This completed run plan is not a
new assignment, a release qualification or a benchmark campaign.

## Goal

Show that an agent can build a real project purely through the LayerFS JavaScript SDK
and the `layerfs-js-sdk` skill. Collect what that costs. One orchestrator runs three
phases in order:

| Phase | Who | Job |
| --- | --- | --- |
| A | The orchestrator | Run every skill example once, live. Correct the skill to what LayerFS really does |
| B | Builder 1, a subagent | **Bug fixing.** Build the store in [SPEC.md](SPEC.md), fixing every LayerFS, SDK or skill bug it hits, and keep going from the current state |
| C | Builder 2, a fresh subagent | **The real test.** Build the same store from the spec and the skill alone, on the fixed build, with no access to the repository |
| D | The orchestrator | Collect traces, daemon records and storage figures. Write the results |

Two metrics matter in every phase:

1. **Storage over a long history:** deduplication and compression must hold as Commits
   pile up, `node_modules` and lockfile churn included. Stored bytes must not blow up.
2. **Speed of each SDK operation:** count, median, p95 and max per method, plus the
   phase breakdown of `sandbox.commit`, `sandbox.mount` and `branch.merge`.

Every number here is diagnostic: one run, tracing on, no cache control. It is not a
benchmark measurement under the
[measurement workflow](../../../../docs/general/agent-measurement-policy.md), and must
not be reported as one.

## Standing rules

- Root and core `AGENTS.md` apply. **Disposable** Store profile only; Durable is
  `NOT_RUN — disabled by owner until explicit reauthorization`.
  `LAYERFS_CONSTRUCTION_WORKERS=1`.
- **No command runs longer than 2 minutes**, including builds and test invocations;
  give each one an explicit wall timeout. A builder puts `timeout 110` inside long
  `exec` commands.
- One attempted operation; no blind retries. Preserve every failure with its evidence.
- Every repository commit records production LOC before, after and the delta
  (`tools/production_loc.py`). No push, PR or merge to `main` unless the owner asks.
  The owner subsequently authorized all five closure steps, including publication
  and merge; that authorization is recorded in [CLOSURE.md](CLOSURE.md).
- Work on branch `issue334-shop-run` in its own worktree. The orchestrator and
  Builder 1 commit there, one after the other, never at the same time. Builder 2
  never writes to the repository.

## Setup, once per phase

1. Build the Linux daemon as in
   [PHASE5, "Exact Linux build"](../327/PHASE5-20261015.md), and the host addon with
   `npm --prefix sdk/js run build:native`. Record the identities: source commit,
   daemon and addon sha256, and the runtime image digest
   (`sha256:2d929c6d66c21c962febba8ede6ddb6405faefa057d3b4d21750de07fe81918b`, Node 22).
2. Give each phase its own **fresh Docker volume, `LAYERFS_HOME` and project name**
   (`shop-a`, `shop-b`, `shop-c`), and its own run folder under
   `core/target/issue334/` (ignored; it holds everything raw).
3. Set `LAYERFS_TRACE=<run folder>/trace.jsonl` for every process in the phase.
4. Snapshot `operator.store.stats()` right after Init and at the end of the phase.
   The per-Commit figures come from the trace `sizes` and `store.commits`, so no
   snapshot is taken while a builder works.

## Phase A: run every skill example once, live

- **Check `npm` first.** In a Workspace, run `npm view express version`. If the
  Sandbox can't reach the registry, stop and report to the owner before Phase B: the
  spec needs `npm install`.
- Run each example in `.agents/skills/layerfs-js-sdk` and
  `.agents/skills/layerfs-sdk-observe`, one command each, in the order they depend on
  each other:
  - the four group scripts in `SKILL.md`;
  - each method page's examples;
  - `rules/lww.md`: one Commit merge and one Branch merge decided by a rule;
  - `rules/conflicts.md`: a Commit conflict with markers and `inspect.mjs`, a
    generated-file conflict, `force`, giving up with discard, and a Branch-merge
    conflict fixed with `merge-fix.mjs` and `merge-apply.mjs`;
  - the observe skill: one trace line, the decoder join, and the `store.stats` and
    `store.commits` fields.
- **Correct the skill to the observed behaviour:** replace each documented output with
  the real one, and fix wrong field names, refusal codes or behaviour. Once a page's
  outputs are captured, drop its "not yet captured from a live run" note.
- **A product or SDK bug:** log it in the ledger. Fix it yourself only if it blocks
  Phase A; otherwise hand it to Builder 1 as a known bug.
- Commit the corrected skill (docs only, LOC delta 0).

## Builder instructions

Both builders get [SPEC.md](SPEC.md), the `layerfs-js-sdk` skill and these
instructions, verbatim:

> You are building the store in `SPEC.md`. The project lives in LayerFS, not on your
> disk: you read, change, build and test it only through the LayerFS JavaScript SDK,
> following the `layerfs-js-sdk` skill. Read the skill's `SKILL.md` first, then its
> method pages as you need them.
>
> - **Plain SDK scripts only.** Write small Node `.mjs` scripts that import
>   `@layerfs/sdk` and run them with `node`. No helper CLI or wrapper library of your
>   own: each script calls SDK methods directly. Your local folder holds only these
>   scripts and their output, never a copy of the project that you edit and sync back.
> - **Follow the skill's mental model.** `fs.*` for cheap reads and small edits; a
>   Workspace per Bash command (mount, exec, commit, unmount) for installs, builds,
>   tests and changes across many files. Commit after every Bash command, even a
>   failing one, with a message naming the step and its result.
> - **Label every step.** Set `LAYERFS_TRACE_STEP` on every command, as
>   `"<3-digit step> <milestone>: <action>"`, for example
>   `LAYERFS_TRACE_STEP="042 M3: npm test" node step.mjs`. Number steps in order across
>   the whole run. `LAYERFS_TRACE` is already set; don't change it.
> - **Your own Branches.** Create the project with `project.init` from a local folder
>   holding only `.git/HEAD` (`ref: refs/heads/main`), then fork Branches from `main`.
>   Publish to `main` at the end of each milestone in the spec's delivery order.
> - **Keep every command under 2 minutes.** Put `timeout 110` inside long commands.
> - **Parallel work, required:**
>   1. Do M4 on a Branch `orders` and M5 on a Branch `web`, both forked after M3 is
>      published, alternating steps between them. Combine them with `branch.merge`,
>      then publish the result.
>   2. At least once, mount two Workspaces of the same Branch, change different files
>      in each, and commit both.
>   3. Resolve every conflict as the skill's conflict guide says: read both sides and
>      fix, or rule a generated file in `/.lww`. Never discard work to avoid one.
> - **Finished when** the spec's acceptance (section 10) holds in a fresh Workspace of
>   a Branch forked from the final `main`, and every Sandbox is closed and every
>   Workspace unmounted.
> - **Report.** Write `REPORT.md` in your local folder: the milestones done and the
>   final `main` head; each Branch and every merge with its result; every conflict and
>   how you resolved it; every refusal or surprise from the SDK, with the call, the
>   step and what you did; anything in the skill that was wrong, missing or unclear.

## Phase B: Builder 1 fixes what breaks

Launch a subagent with the [builder instructions](#builder-instructions), the spec, the
skill, the environment, and these additions:

- **Your job is to find and fix bugs** in LayerFS, the SDK or the skill while you build
  the project. Correctness first. Slowness counts only when it stops the work: a step
  that can't finish within 2 minutes, or a run that can't complete.
- **Work incrementally and never start over without need.** The Store, the Branches
  and their history, and Sandbox ids survive your process. When something breaks:
  1. keep the evidence: the trace line, the error with its `detail`, and the step;
  2. write a small recovery script that reads the state: `project.list_branches`,
     `branch.list_commits` and `sandbox.status` of the Workspaces you had mounted;
  3. clean up only what's stuck: unmount and commit or discard a Workspace, close a
     Sandbox;
  4. fix the cause in the repository;
  5. continue from the last good Commit.

  Start a new volume and Init only when the Store itself can't be opened or used,
  for example after a Store format change. Record why.
- **Fix rules:** diagnose from source, then make the smallest correct fix. Add an
  external regression test for a product defect. Rebuild only what changed. A daemon
  fix needs a new Sandbox to load it: close the old Sandboxes and create new ones on
  the same volume. Commit each fix on `issue334-shop-run` with its LOC line.
- **Ledger:** one row per bug in `BUGS.md` (in this folder), with id, phase, step,
  symptom, evidence, root cause, fix commit, regression test and how it was verified.
- **Finished:** the builder instructions' "Finished when" holds, and every ledger row
  is fixed or explicitly left open with a reason.

## Phase C: Builder 2 builds it fresh

After Phase B, rebuild the daemon and addon from the tip of `issue334-shop-run` and
record the identities. Then prepare a working folder outside the repository:

- `@layerfs/sdk` already installed from that build;
- a copy of `.agents/skills/layerfs-js-sdk` and of `SPEC.md`;
- the environment variables set; `LAYERFS_TRACE` pointing into the run folder.

Launch a **new** subagent with only that folder and the
[builder instructions](#builder-instructions). It does not read the LayerFS repository,
other documents, Builder 1's scripts or reports, or this issue. It doesn't fix LayerFS:
when a LayerFS problem blocks it, it records the call, the step and the evidence in
`REPORT.md`, works around it only with documented SDK behaviour, and stops if it can't
go on. Don't help it beyond answering questions about the spec.

Builder 2's run is the one whose storage and speed figures count.

## Phase D: collect and report

For Phases B and C, before closing anything left open:

1. Page `operator.store.commits(branch)` for every Branch. Save the final
   `operator.store.stats()`.
2. Save `docker logs` of every Sandbox the builder created (container name = Sandbox
   id without `sb_`). Decode and join them with `tools/decode_observations.py --trace`.
3. Build the per-step table, as in the observe skill's
   [storage metrics](../../../../.agents/skills/layerfs-sdk-observe/references/storage-metrics.md).

Write `RESULTS.md` in this folder:

- **Identities:** source commit, daemon, addon, image, volume, and each run folder.
- **Storage:** per Commit, the logical size, new canonical, new stored and new
  metadata bytes; cumulative stored against cumulative logical; the deduplication
  ratio (logical / canonical) and compression ratio (canonical / stored) over the
  history. Flag any step where stored bytes grow faster than the project's changed
  content, such as a reinstall storing `node_modules` again in full.
- **Speed:** per SDK method, the count, median, p95 and max ms. The phase breakdown for
  `sandbox.commit`, `sandbox.mount` and `branch.merge`. The ten slowest steps with
  their phase timing.
- **Bugs:** the `BUGS.md` summary: found, fixed and open.
- **Skill:** the gaps both builders reported, and what was changed in response.
- Builder 2's `REPORT.md`, verbatim, as an appendix.

## Checklist

- [x] Phase A: environment, `npm` reachable, every skill example run and corrected
- [x] Phase B: Builder 1 finished; every bug fixed or left open with a reason
- [x] Phase C: Builder 2 finished or stopped with a recorded blocker
- [x] Phase D: `RESULTS.md` written; raw evidence kept under `core/target/issue334/`
