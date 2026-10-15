# #327 publication counters: bounded statement working set v5

> **Status:** Prospective specification, 2026-10-15, before implementation/samples.
> V2, v3 and v4 remain FAIL. This is a component accounting screen only.

V4 passed both verifiers but missed speed: 75,795,542 ns off / 92,652,500 ns on
(+22.24%); allocated 4,435,968 / 4,440,064 bytes (+0.0924%). Runtime SQL statement
wall was 33,026,217 / 46,725,997 ns and VM steps 81,667 / 93,406. First-wins
object triggers repeat counter UPDATE machinery per locator and are rejected.
Return storage maintenance to v3's one UPDATE per publication, retain logical
insert triggers. The connection currently leaves rusqlite's 16-entry prepared
statement cache at its default; the closed construction/Save/history working set
can evict and reprepare statements. V5 sets a bounded 64-entry cache for ordinary
connections, in BOTH arms. This is no failed-operation reprepare or retry: only
successful statement preparation/lease caching. Record all seven wrapper phase
calls/wall and SQL statement wall as diagnostic attribution. A reduction is an
inference unless supported by those runtime observations and EXPLAIN.

All v2/v3 workload, sample, freshness, cache contract, arm order and gates remain:
128 x 32,768-byte distinct inputs; off then on once; 15-second commands; <=15%
operation overhead and <=5% allocation overhead; separate <10-second verifier.
V3 verification setup applies. Case is `issue327-publication-totals-v5`; example
and runner use v5; output root `core/target/issue327/counters-v5/`. Off removes only
storage-total maintenance/exclusive calculations and the two logical triggers.
Both arms include the same bounded statement cache and all per-record facts.
