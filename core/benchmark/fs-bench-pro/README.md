# fs-bench-pro workload benchmark

> **Status:** First iteration closed with failures and not-applicable cases; no release admission is established.

The [implementation spec](../../docs/benchmark/fs-bench-pro/implementation-spec.md)
and [rollout ledger](../../docs/benchmark/fs-bench-pro/ROLLOUT-LEDGER.md) define
the first iteration: port the 25 frozen v0.1.6 workload families, run each
case once, verify results and cleanup, and fix correctness bugs. No speed,
comparison or release gate is selected.

Stage 0.1 has harvested all 461 released source rows into
[the reference catalogue](baselines/v0.1.6/README.md). Stage 0.2 has moved the
working SDK runtime here and separated cluster-one and cluster-two harnesses.
The first-iteration catalogue contained all 25 original families and 273 cases. All seven batches
are truthfully closed: 192 functional/verifier/clean-close passes, 50 failed
outcomes, three actual cases unrun after failed preparation, and 28 complete
reliability cases not applicable. Source-only reliability parity preserves the
missing physical accounting and creation-profile requirements; it is not a
native or mounted proof. The [iteration completion](../../docs/benchmark/fs-bench-pro/ITERATION-1-COMPLETION.md)
records every case, failed or unavailable scope, limit miss, fix, decision,
source pair and production LOC. Raw receipts and claims remain append-only;
closed results are not authorization to repeat an unchanged sample.

Current issue319 owner direction retires `workspace_reliability` and its28
cases, including the engine/runtime routes and dedicated tests. The active
registry has24 families and245 unique cases. All3 `repository_history` cases
remain selectable and are NOT_RUN — set aside by owner, leaving242 cases for
the terminal campaign. Historical reliability receipts and baseline CSVs stay
unchanged. This retirement tests the current contract scope, not performance;
no failing/slow ordinary case is removed. See the
[retirement record](../../docs/issues/319/checks/phase11-retirement.json).

Use `bench.py build --out <fresh-results-path>`, then
`bench.py prepare empty|big64m --build <seal> --out <fresh-results-path>`.
A stage 0.4 run uses `bench.py run cluster-two/cells --case Cxx --build <seal>
--prepared <master-receipt> --out <source-fixed-run>`. Run each case under its
own checkout lock and explicit wall stop. Both masters can also be placed in
`<prepared-parent>/empty` and `<prepared-parent>/big64m` for automatic selection.
`bench.py verify <run>` reads retained independent evidence; `bench.py report
<run>` creates the two CSVs once, including all twelve registered cells.

Read [AGENTS.md](AGENTS.md) before changing or running the harness. It identifies
current paths, profiles, lock and test requirements. The frozen root harness
remains read-only. Durable remains disabled. All first-iteration numbers will
be raw one-sample observations with their cache eligibility, not comparisons.

The Init family uses `prepare <namespace-case>` to create and completely verify
native inputs without running Init early. `parity init_namespace --prepared
<parent> --out <fresh-results-path>` compares each of the four prepared cases
with the frozen registry, fixture digest and agent review. `run init_namespace`
selects one public Init/seal per case, a fresh Store and a separate-process
sampled reopen proof. Use `--case` to bound each invocation independently.
This host route has no daemon/FUSE counts; those observations are UNAVAILABLE.
The source is setup-warm and host cold metadata is unverified, so its raw
observations remain INELIGIBLE even if functional verification passes.

Payload preparation uses `prepare <payload-case>` to generate and fully verify
original native fixture/expected states, then provision a sealed master through
public Init/install. `parity payload_create_read --prepared <parent> --out
<fresh-results-path>` checks all eight cases. Each `run payload_create_read
--case <id>` clones its master, runs the original ordinary syscall program,
commits through the SDK, terminally unmounts, verifies a fresh published-root
mount and performs a separate offline current-format persisted proof. The
runtime's `verify-workspace` mode is an independent harness oracle over a closed
sample Store; the live daemon data path stays in-process in the shared volume.

Historical access setup first creates a new complete closed original producer.
For a paired selection of that same producer, use `bench.py prepare <access-case>
--build <seal> --reuse-producer <first-access-prepared-folder> --out <fresh-path>`.
The adapter admits original source/helper/graph/custody seals, preserves the
original producer identity and installs a new independent complete Store byte
copy. This reuses setup only; each original access gets its own fresh mount,
reader and verifier, with zero performance samples and one proof attempt.
