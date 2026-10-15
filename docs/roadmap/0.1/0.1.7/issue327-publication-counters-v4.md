# #327 publication counters: insert-trigger screen v4

> **Status:** Prospective specification, 2026-10-15, before implementation and
> samples. V2 and v3 retain FAIL. This component screen is not release evidence.

[V3](issue327-publication-counters-v3.md) verified both arms but missed speed:
80,572,167 ns off versus 97,499,292 ns on (+21.01%); allocation identical at
4,435,968 bytes. Statements/VM steps were 3,027/81,667 and 3,157/89,598. Logical
trigger integration removed 127 wrapper executions versus v2 (two additional
trigger DDL statements remain). The remaining 128 publication wrappers allocate
bindings and execute the entire measured prepare/step/status/drop lifecycle.
V4 eliminates that remaining separate statement: first-wins object INSERT triggers
maintain canonical length; pack INSERT triggers maintain complete stored and
metadata-domain lengths. History triggers remain. All triggers update the same
one-row totals in the original publication transaction. No scans or retry.

Use all unchanged v2/v3 workload, order, cache, freshness, sample count and gates:
128 distinct 32,768-byte fixtures; off then on exactly once; 15-second commands;
on/off time <=1.15 and allocation <=1.05; separate <10-second verification.
The only off ablation removes the four accounting trigger definitions. All schema
records/per-Commit facts, object insertion, packs and construction are matched.
Case is `issue327-publication-totals-v4`; example/runner suffix is `_v4`/`-v4`;
outputs are `core/target/issue327/counters-v4/`. Record EXPLAIN plus runtime SQL/VM
counts and statement lifecycle wall, source/patch/binary/dependency manifests.
V3's independent verification-copy setup and sealed immutable SQL oracle apply.
No unchanged resampling, budget change, workload inflation or failed-row removal.
