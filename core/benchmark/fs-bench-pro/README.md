# fs-bench-pro workload benchmark

> **Status:** Current planning checklist; no release candidate exists.

The [implementation spec](../../docs/benchmark/fs-bench-pro/implementation-spec.md)
and [rollout ledger](../../docs/benchmark/fs-bench-pro/ROLLOUT-LEDGER.md) define
the first iteration: port the 25 frozen v0.1.6 workload families, run each
case once, verify results and cleanup, and fix correctness bugs. No speed,
comparison or release gate is selected.

Stage 0.1 has harvested all 461 released source rows into
[the reference catalogue](baselines/v0.1.6/README.md). Stage 0.2 has moved the
working SDK runtime here and separated cluster-one and cluster-two harnesses.
Stage 0.3 catalogued all 273 cases as pending. Four Init cases now have ported
definitions; their parity and samples are pending at this checkpoint.
`python3 -B core/benchmark/fs-bench-pro/bench.py list` lists every case and its
released reference. The reproducible engine has build, prepare, twelve-cell run, retained verify and
CSV report commands. Its twelve mounted cells completed functional proof and clean unmount; exact
count reproduction failed for C10/C12 and remains explicitly failed in the
ledger and generated CSVs. Workload ports follow that documented closure. Pending cases have no frozen steps, cache preconditions or budgets.

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
