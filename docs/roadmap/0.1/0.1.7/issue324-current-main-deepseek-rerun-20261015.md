# Current-main DeepSeek rerun and Commit optimization

> Status: Dated planning checkpoint; not release evidence or a product contract.

Owner direction in the current conversation selects a full repeat of the earlier
issue323 operation/native diagnostic on the latest landed implementation, then
optimization of its exact changed Commit case. Issue324 remains the owning issue.
Origin/main was fast-forwarded from d4b0c6808 to 135531188 on 2026-10-15; the
remote full identity is 13553118857e0d71cf202847247e6e86f770fb6e.

## Frozen rerun

Scenario: `deepseek-current-main-full-diagnostic-20261015-v1`, one invocation.
Product: core at 135531188, with no production changes in this registration.
Reuse the original performance-1 plan, oracle and seven workload scripts from
the completed deepseek-probe receipts, verifying their hashes before invocation.
Reuse its independent complete input (3,475,776,149 logical bytes, including
.git, ignored files, dependencies, outputs and symlinks); do not mutate the
protected deepseek-harness checkout or the prepared source.

Use the public Rust SDK and its returned Exec handles throughout: actual full
Project Init/seal, Sandbox create/install, Branch operations, mount, native/FUSE
read and hash, mixed mutation, real TypeScript build, one changed Commit,
independent native/same/fresh-mount verification, history/UpToDate and normal
unmount/close. Native filesystem has no invented Commit analogue.

The exact mixed workload creates128 one-KiB files, renames32 and deletes32,
overwrites/appends/truncates/regrows its payload, performs the editor replacement,
and regenerates five compiler artifacts. The final selected Commit result has
103 regular files and226,196 logical bytes. The read case selects194 files and
21,856,018 bytes. Scripts/oracle, order and constants are unchanged.

Reuse the exact existing ARM64 Node/native-master image
sha256:74211c91701a917294988bfb530a5af044621def54f2519479d641ecfd580f18.
Reuse the sealed current-product daemon only after matching source/binary
identities; copy its immutable executable into this worktree. Build the external
driver separately in a worktree-local target, Cargo1.85.1 locked/offline release,
with the repository ARM profile. Driver adaptation is limited to renamed public
APIs and the retired shared-reader configuration field. No new SDK capabilities.

Fresh receipts under benchmark-results/fs-bench-pro/deepseek-current-main-20261015/full-1.
One sample per phase/arm/source identity. No repeat of unchanged treatments.
Disposable/WAL/OFF explicitly; LAYERFS_CONSTRUCTION_WORKERS=1. Init retains its
supported construction profile. Durable NOT_RUN, owner-disabled.
Preserve the original120s whole diagnostic stop,15s workloads,9s independent
verifiers and40s native clone/15s native census setup bounds. This is an explicit
full functional/diagnostic selection, not a default performance invocation.
The default15s complete-performance budget is reported independently as EXCEEDED
if missed; the120s stop is not a performance-gate relaxation.

Host monotonic public call spans and Linux workload monotonic spans remain
separate; nested spans are not summed. Setup/own-write/earlier-phase cache state
is INCOMPLETE/INELIGIBLE, with no cold or speedup claim. Other-worktree activity
is declared interference. Record unavailable SQL/phase-local RSS/live backing
observations honestly. Verification begins only after the measured work.
On any refusal/failure stop dependent product calls and retain exact custody;
no automatic retry, Docker teardown substitute or guessed recovery.

## Commit implementation plan after the rerun

Goal: reduce demonstrated repeated work in this exact Commit while preserving
bytes, names, links, lengths, shared captured frontier, later mutations through
install, continued use, remount/history, UpToDate and exact failure custody.
No promised2x or absolute latency gate follows from the old INELIGIBLE207ms.

First produce a source call/SQL model and correlate the largest costs with
existing counters. Current jobs are inline Workspace-local lock calls, not
the retired owner-thread scheduler. Candidate point-call batching must report
whether it removes lock acquisitions, actual SQL executions, or both.
SQLite acceptance needs the exact EXPLAIN plus correlated actual engine profile.
Missing access does not halt independent source analysis or justify building
a general instrumentation platform. Add no new public API without a concrete
necessity and the applicable owner decision.

Choose one highest-cost justified candidate, predict its count reduction,
implement one independently reversible change, run the smallest affected proof,
and collect one changed-identity comparison with honest cache/resource scope.
Report speed, storage and RSS independently. The owner's10% time/RSS allowance
is for structural tradeoffs, not permission to regress correctness or claim an
unqualified speed improvement. Record exact production LOC in every commit.
Exec and Init are part of this full rerun, but implementation optimization now
focuses only on Commit until its justified candidates are exhausted.
