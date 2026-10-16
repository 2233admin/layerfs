# Phase A results — #340

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Phase A1–A5 passed before Build 1 Init. This checkpoint records preparation and
probe evidence; the application campaign remains in progress. All timings,
storage figures and ratios are diagnostics with tracing enabled and unknown
OS cache state. Disposable/WAL/synchronous=OFF was selected explicitly;
Durable is **NOT_RUN — disabled by owner until explicit reauthorization**.
Construction used `LAYERFS_CONSTRUCTION_WORKERS=1`.

The [checkpoint source manifest](tables/phase-a-checkpoint.sources.json) pins
the supporting gate reports, full result JSON, final collection and verification
files by byte size and SHA256. Source-aware tables retain the
[per-commit LOC comparisons](tables/campaign-production-loc-preparation.csv),
[final Store counters](tables/phase-a-storage.csv) and
[export identities](tables/phase-a-export.csv), each with its `.sources.json`.

## Gates and evidence

| Gate | Observed result | Retained evidence |
| --- | --- | --- |
| A1 environment | Node 22.23.1, npm 10.9.8, `node:sqlite` without a flag; registry reachable from a Workspace; Express 4.22.3, Preact 11.0.1 and esbuild 0.28.2 pinned. Chromium and ChromeDriver 155.0.8059.39 available. | `core/target/issue340/phase-a/a1-runtime-corrected.json`, receipts 004–005 and `ENVIRONMENT.json` |
| A2 agent mechanics | Nested lead spawning, direct messages, five distinct logical workers, a replacement and completed-worker slot reuse passed. Actual capacity is four active agents including the primary. | `core/target/issue340/phase-a/A2-TOPOLOGY.md` |
| A3 team load | Six clients and six Bash Sandboxes, two per Branch, completed twelve npm/syntax/test/Commit/unmount executions. Each execution passed three tests. Six moved-head Commit merges were observed. Six concurrent public reads and six forks passed through own selected Sandboxes after P-001. | `core/target/issue340/phase-a/a3/RESULTS.md`, `final-summary.json`, call receipts and traces |
| A4 conflict guidance | Scenarios 1, 2, 5, 6, 7, 8 and 9 passed, including marker resolution, force restrictions, discard/redo, identical resolution on working forks and generated-only LWW. Clean non-fast-forward, resolved non-fast-forward, fast-forward and typed Conflict were observed. | Same A3 evidence, including full conflict results and paged diffs |
| A3 restart survival | All clients closed; daemon replaced by the identical rebuilt artifact at a new path. Six fresh clients each verified all 34 Branch bases/heads, mounted, passed syntax and three tests, returned UpToDate and closed. | A3 pre-replacement refs, survival receipts and daemon streams |
| A5 freeze | Twelve inputs, 41 SDK files, nine skill files and the wall helper pinned. Counter passed 45 self-tests on host and pinned runtime. Freeze committed before Build 1 Init. | [revision 1 FREEZE.json](frozen/revision-1/FREEZE.json), commit `4308d725fe110ecd787837b1d62ae95dd2d4c664`, Phase A receipts 016 and 030–032 |

The actual topology permits the primary, lead and two workers simultaneously.
Both builds therefore retain W1/W2, I1/I2 and P1 in waves, with same-lane pairs
overlapping. Five simultaneous workers were not exercised. Six-process LayerFS
load was exercised separately in A3.

## Product correction and integrations

P-001 exposed ignored `options.sandbox` in the JavaScript constructor. All six
fresh clients originally discovered one automatic service; cold discovery
returned five Busy refusals, while a sixth persistent connection later received
UnexpectedEof at the fixed service admission limit. The correction honors an
explicit existing Sandbox through the existing validator. Default discovery,
lazy construction and connection budgets remain unchanged; no retry was added.

Commit `9f3f466cc9a00f5b3f402fb867bc41ac8c445345` records production LOC
87,657 → 87,658 (delta +1), core 85,813 unchanged and SDK 1,844 → 1,845.
The external regression failed five and passed two before the correction, then
passed all seven. Packaging-lazy, trace on/off/failure, boundary and 25 guard
self-tests passed. Both native artifacts were actually rebuilt. The affected
six-client live check then passed without Busy or EOF. [BUGS.md](BUGS.md)
retains the original failure and full procedure corrections.

During preparation the owner explicitly requested immediate integration of
PR #343, the #342 indexed diff correction. It merged into main at
`b0f8e33305f47b37c0b3c66b061318b034434081` and into the campaign at
`123fee2a22171fdb03ebad69e47f76c46231c763`, tree
`75bf028b2029d842bbaf071f2893afafa214b64e`. The campaign first-parent
comparison is 87,658 → 87,681 (delta +23), core 85,813 → 85,836 and SDK
1,845 unchanged. That correction was selected by the owner, not found by the
Crew probe. Its original scoped verification was reused and the combined
native artifacts rebuilt before resumption.

The combined daemon SHA256 is
`47f354e5d92ea9e70032a8a28fbda052292ca761c76dd1e0a076b984247ceb8f`
(10,054,440 bytes); the host addon is
`979602bcce9ccb8d6bad253006c3314e9ffd5d21863e99fc9d3a9b58a864b6b0`
(3,839,728 bytes). Exact locked/offline build inputs, ARM64 flags and receipts
are in `core/target/issue340/builds/r2/BUILD-IDENTITY.json`.

## Merge details and cleanup

The large generated-state merge had 801 overlapping generated paths and returned
73 decisions with `lwwTruncated:true`; all 803 candidate diff entries were paged.
The returned list is not a complete enumeration of decisions. An actual publish
race returned one Added and one HeadMoved; after inspection, a separately
identified deliberate overwrite returned a nonempty `overwrote` list. Originals
and displaced history remain in the Store.

All 18 explicit probe Sandbox lifetimes closed after both daemon streams were
saved. The primary then collected every history/sizes page for all 34 Branches,
all three Layers and final counters, saved the final observer streams and closed
it. No further Phase A SDK call followed this boundary. Every mount list was
empty. A3's 942-file SHA256 manifest is retained with its report.

## Stopped Store export

The final collection is in `core/target/issue340/phase-a/final-collection/`.
The stopped export is outside Git at
`/Users/yifanxu/.codex/issue340-evidence/phase-a/`. The source volume was mounted
read-only, main/WAL/SHM bytes were copied and checked unchanged, and a separate
restored copy was opened with `mode=ro`, `query_only=ON`, `synchronous=OFF`,
timeout zero and WAL visible. No immutable flag or source checkpoint was used.
`quick_check` returned `ok`; foreign-key checks were empty. A separate portable
backup explicitly selected WAL/OFF and reproduced all logical inventories.

| Quantity | Bytes |
| --- | ---: |
| Logical | 344,030 |
| Canonical | 774,322 |
| Stored pack bodies | 289,435 |
| Metadata pack bodies | 100,815 |
| SQLite overhead | 869,733 |
| Operator metadata, including overhead | 970,548 |
| Database logical file size | 1,159,168 |
| Free | 0 |

All 57 Commit records contribute 343,687 logical bytes; all three Layers add
343 bytes, reproducing 344,030 exactly. Public first-parent histories contain
56 unique Commits. The additional retained Commit
`12e0a65abd88f4a136dcf0a945019a9fefa218fe6018b80313a29f8bc86e3a6050`
matches the displaced head recorded by the deliberate A4 force operation in
`a3/calls/client-1-0038.json`. It remains included in full accounting.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `store-volume.tar` | 5,396,480 | `39a438c9808e3e547b2c59c4bf7c2cc902587b664748f8c844cc7ec1257b67d8` |
| `portable/store.sqlite` | 1,159,168 | `352ba6438c8c63d1e90defc22b3ef2b431f3e964af1629ea1509df067726629c` |
| `SHA256.json` | 23,805 | `8239df8fac00e2079be9daaaf2088396c145c54a3d6c09179d50a6e270c03f95` |

Verification, SQL inventory and public-history reconciliation are retained as
`verification.json`, `readonly-inventory.json` and `export-reconciliation.json`.
Stored already includes metadata pack bodies; stored and operator metadata must
not be added to derive physical bytes. The export proves retained logical
consistency, not cold-cache speed or power-loss durability.

The complete stopped Phase A raw run is also archived separately at
`/Users/yifanxu/.codex/issue340-evidence/run-archives/phase-a/run.tar.gz`.
It contains 1,200 evidence entries and 66,753,397 source-file bytes. Every
archive payload was rehashed against the source inventory; the source's
before/after inventories match. The archive is 24,473,937 bytes, SHA256
`c7e719e02cc0d6f57885a7a7283886b5be34376c338340c34bf360a0b5872362`.
The [raw-run archive table](tables/phase-a-run-archive.csv) and its source
sidecar pin the verification, full file inventory, stopped-volume check and
exact archiver. This operation opened no SQLite Store and did not change the
previously sealed Store export.
