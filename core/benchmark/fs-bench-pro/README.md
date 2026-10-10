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
Stage 0.3 catalogues all 273 cases as pending.
`python3 -B core/benchmark/fs-bench-pro/bench.py list` lists every case and its
released reference. The reproducible engine and runnable case ports are the
next stages; pending cases have no frozen steps, cache preconditions or budgets.

Read [AGENTS.md](AGENTS.md) before changing or running the harness. It identifies
current paths, profiles, lock and test requirements. The frozen root harness
remains read-only. Durable remains disabled. All first-iteration numbers will
be raw one-sample observations with their cache eligibility, not comparisons.
