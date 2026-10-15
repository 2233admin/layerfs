# #327 publication counters: statement-integrated screen v3

> **Status:** Prospective component specification, 2026-10-15. Same owner and
> limits as [v2](issue327-publication-counters-v2.md), committed before the v3
> implementation or samples. V2 remains FAIL; no v2 sample is replaced.

V2 measured off 78,462,500 ns and on 103,624,584 ns (+32.07%); both allocated
4,435,968 bytes. Runtime SQL work was 3,027/81,667 statements/VM steps off and
3,284/91,437 on. The 257 extra wrapper executions are 128 Save accounting updates,
128 Commit logical updates and the genesis logical update. Each wrapper performs
prepare/lease, bind, step, decode, cursor/status and drop phases. Logical UPDATE
RETURNING also allocates a result row. V3 moves logical maintenance into SQLite
AFTER INSERT triggers on Commit/Layer, so successful first insertion maintains the
same fixed row inside the existing history statement and transaction. Storage
maintenance remains one UPDATE per publication. No retry or dependency change.
EXPLAIN and correlated runtime counts are retained with the report.

All v2 workload, fixture, cache, order (off then on), one sample, fresh-output,
release/build, 15-second command, 15% speed and 5% allocation gates apply unchanged.
Case identity is `issue327-publication-totals-v3`, example `issue327_counters_v3`.
The off source removes only storage counter maintenance (and its exclusive
argument calculations) and the two history-counter triggers; the per-record
statistics and all other schema/implementation stay matched. Source manifests
and full patch pin both arms. Outputs use `core/target/issue327/counters-v3/`.

The v2 native read-only verifier failed CannotOpen/Uncertain on a sealed WAL Store
without sidecars on macOS SQLite 3.51.0. A labeled direct rusqlite diagnostic
confirmed CannotOpen on its first PRAGMA and subsequent reads; Python SQLite
could read the same bytes. This is a verifier setup issue, not permission to
replay a failed product operation. V3 verifies a fresh independent byte copy:
explicit Disposable writable opening provisions SQLite's live WAL ownership,
then an independently opened read-only public Handles validates all 128 records
while that owner is held. No mutation API is invoked. The immutable sealed source
is independently read through SQLite `mode=ro&immutable=1`; WAL header bytes,
identity/schema, row sums, integrity, file and allocation are verified there.
Verifier remains separate, once per arm, under 10 seconds. Preserve all v2
verifier failures, and do not claim sealed-sidecar-free native read-only support.
