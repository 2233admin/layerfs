# Depot common builder instructions

> **Status:** Current planning checklist; no release candidate exists.

Scope: issue #337. The following owner instructions apply identically to both
builders. Read copied `.agents/skills/layerfs-js-sdk/SKILL.md` first; the environment is supplied by the
orchestrator. SPEC, DEPENDENCIES, Cargo.lock, FIXTURES, FIXTURE-HASHES and
ACCEPTANCE are one frozen specification bundle.


> Build the complete Depot application in the supplied frozen SPEC.md. The
> project lives in LayerFS. Read, edit, fetch dependencies, build and test only
> through the LayerFS JavaScript SDK, following the copied layerfs-js-sdk skill.
> Read SKILL.md first and method pages as needed.
>
> - Write small plain Node .mjs scripts importing @layerfs/sdk. No custom LayerFS
>   helper CLI or wrapper library. Your local folder contains orchestration
>   scripts and receipts, never an editable project copy. Depot's own Rust CLI
>   is an application deliverable and runs inside the Workspace.
> - Use fs.* for targeted reads/edits; use mount -> exec -> commit -> unmount for
>   ordinary commands. Keep Cargo dependencies, output and caches inside the
>   LayerFS view. Commit after every Bash step, even failure; label the result.
> - Set LAYERFS_TRACE_STEP on every command as a monotonic three-digit step plus
>   milestone/action. Do not change the assigned LAYERFS_TRACE path.
> - Init once from a tiny seed containing only .git/HEAD, fork your own Branches,
>   and publish completed milestones to LayerFS main in delivery order.
> - Complete the required M4/M5 alternating Branch work and same-Branch two-
>   Workspace exercise. Resolve conflicts by inspecting both sides; no discarded
>   source or source LWW. Rebuild generated state after merges.
> - Give every command an explicit wall timeout <=120 seconds, including inner
>   timeouts for commands launched by sandbox.exec. No automatic retries. Inspect
>   refs, Workspace status and exact refusal/uncertainty before any next action.
> - Finish only after full acceptance passes on a Branch forked from final main
>   and every application process/Workspace/Sandbox has been cleaned up after
>   log preservation. Application tests and the command wrapper must be bounded.
> - Write REPORT.md: milestones, final main Layer and source Commit, every Branch
>   and merge, conflicts/resolutions, failed commands/refusals/blockers, recovery,
>   acceptance commands/results, cleanup and skill feedback. Distinguish local
>   tool/application mistakes from LayerFS/SDK defects.


## Exact lifecycle requirements

Init is an isolated script using only a seed `.git/HEAD`. The orchestrator takes
initial operator.store.stats in a separate script immediately afterward, before
you fork/scaffold/mutate anything. Wait for that receipt before proceeding.
Capture every SDK call in the assigned trace. Each Bash step must have its own
Commit outcome, including failures and UpToDate. Retain the complete outputs and
command text. No custom LayerFS CLI, wrapper library or editable host app copy.

Every command/build/test has wall timeout <=120 s, including an inner timeout
inside sandbox.exec; use small scripts if Exec and Commit cannot both fit.
Always build test targets before running them. Tests have bounded readiness,
child lifecycle, connection and completion waits and deterministic cleanup.
Store profile is explicitly Disposable/WAL/OFF in the pinned SDK initializer.
Durable: NOT_RUN — disabled by owner until explicit reauthorization.
Set LAYERFS_CONSTRUCTION_WORKERS=1. Do not enable hidden external caches.

After M3 publication fork registry and web-recovery. Alternate their development
steps, test and publish passed M4 from registry, merge the two branches, test
the combined result, then publish M5. Source and Cargo.lock never use LWW.
Generated Cargo state may follow only target/ and .cargo-home/ rules. Rebuild
and verify it after merging. Preserve same-Branch two-Workspace edits to two
different source/test files with both Commits recorded.

Before closing ANY Sandbox save daemon stdout AND stderr on the host using
Docker logs with explicit timeout. Include the automatic service Sandbox; obtain
its id before final collection and close it last after all Store reads. Keep
exact log originals even where one stream is empty. No close before preservation.
REPORT.md records milestones, publication/source identities, all branches and
merges, conflicts and inspected resolution, every refusal/failure/timeout,
acceptance and cleanup, and skill feedback. Diagnostics are not benchmarks.

New application production files obey <=999 physical lines, and lib.rs/mod.rs
<=200 lines of declarations/thin forwarding. Put tests outside src. Never patch
downloaded dependencies. Avoid adding a dependency for an existing capability.

For related Cargo steps, the frozen procedure permits retaining one Workspace
across separate exec/Commit steps. Commit every Bash step and unmount at the
end. Use fresh Workspaces where acceptance requires them. Consult the copied
skill Cargo page for the live-checked workflow.
