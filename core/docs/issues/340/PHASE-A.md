# Phase A preparation and gates

> **Status:** Current planning checklist; no release candidate exists.

Phase 0 approval is recorded in
[issue #340](https://github.com/Ephemeral-AI-Lab/layerfs/issues/340#issuecomment-6202814124).
Documents PR #341 merged as `5d9008e479229f6d29b70923ca76d70bb2744e23` with
unchanged production LOC 87,657 and the verified planned tree. Campaign branch
`codex/issue340-node-multiagent` has a separate worktree.

| Gate | Current disposition | Evidence |
| --- | --- | --- |
| A1 identities and registry | Passed | ENVIRONMENT.json; DEPENDENCIES.md; raw init, immediate initial stats, corrected runtime command and image inspection |
| A2 mechanics | Passed at actual capacity, with T-001 deviation | Nested lead/worker messages; five logical workers plus replacement in waves; extra active spawn refused; A2-TOPOLOGY.md |
| A3 six-client LayerFS load | Passed after retained P-001 failure and fix | Twelve successful install/test/Commit/unmount cycles, six moved-head merges; six selected-service reads and six forks passed; full close/replacement/survival passed |
| A4 conflict guidance | Passed | Scenarios 1, 2, 5, 6, 7, 8, 9; clean, non-fast-forward, fast-forward and Conflict results; actual publication race Added/HeadMoved; deliberate overwrite |
| A5 freeze | Revision 1 inputs prepared from passed gates | Counter passes 45 external self-tests on host and exact pinned runtime; FREEZE.json pins every builder input, SDK/skill and product identity before Build 1 Init |

Raw evidence and the current main ledger live at
`core/target/issue340/phase-a/` in the campaign worktree. Final external evidence
exports were verified read-only with WAL visible. No Build 1 Init or Crew application
implementation has started at this freeze checkpoint.

P-001 commit `9f3f466cc9a00f5b3f402fb867bc41ac8c445345` honors explicit
`new LayerFS(project, { sandbox: ownId })` selection. Before regression:
five failed/two passed; after: seven passed. Existing packaging/trace checks,
boundary scan and 25 guard self-tests pass. Production LOC 87,657 → 87,658
(+1), all in the JavaScript SDK. Rust/config/lock/patches are unchanged; their
tests/Clippy/fmt are inapplicable to this JavaScript-only change. Actual native
rebuild and affected live proof passed. The initial actual native rebuild was
followed by another actual incremental release build after the owner requested
the reviewed #342 diff fix be merged before this first freeze.

The combined product is `123fee2a22171fdb03ebad69e47f76c46231c763`, tree
`75bf028b2029d842bbaf071f2893afafa214b64e`. Its Linux ARM64 daemon SHA256 is
`47f354e5d92ea9e70032a8a28fbda052292ca761c76dd1e0a076b984247ceb8f` and
Darwin ARM64 addon is `979602bcce9ccb8d6bad253006c3314e9ffd5d21863e99fc9d3a9b58a864b6b0`.
Both locked/offline release builds retain the required ARM64 flags. The daemon
was copied to a replacement executable path after every Sandbox closed; all six
fresh clients then verified all 34 Branch bases/heads, passed syntax and three
tests each, returned UpToDate, unmounted and closed after both logs were saved.
All 18 explicit Sandbox lifetimes were closed with retained logs.

The large-LWW probe had 801 overlapping generated paths. Its reply returned
73 decisions with `lwwTruncated:true`, and the complete paged candidate diff
contained 803 entries. This does not claim all decisions fit in the reply.
After the observed Added/HeadMoved race was inspected, a separately authorized
chosen-Branch publication returned an actual nonempty `overwrote` list.

Final Phase A collection covers all 34 Branches' history/storage pages and all
three publication Layers (`moreLayers:false`). Final operator bytes: logical
344,030; canonical 774,322; stored 289,435; metadata 970,548; file 1,159,168;
free 0. These are tiny-fixture diagnostics. Both final observer log streams were
saved and its close returned Closed. No Phase A SDK call followed that boundary.

Stopped export verification at `~/.codex/issue340-evidence/phase-a/` recovered
57 unique Commits and all three Layers. Branch first-parent pages exposed 56
unique Commits; the full SQLite inventory also retained the displaced Commit.
Commit logical bytes 343,687 plus Layer logical bytes 343 equal operator logical
344,030 exactly. Canonical objects, stored packs, metadata/SQLite overhead and
file/free counters reconcile. Raw main/WAL/SHM files remain unchanged; the separate
portable backup explicitly uses WAL/OFF. Export checksums and read-only verification
receipts remain outside Git.

Decisions before freeze: retain five roles with at most two simultaneous workers;
coordinator creates agent Sandboxes serially; agents select their own Sandbox for
Store and Bash operations; ordinary `bash -c` preserves the pinned Node PATH.
Every attempted SDK call retains a full result/refusal JSON in addition to its
trace so missing trace fields cannot become invented merge or concurrency counts.
All numerical observations are diagnostic, with tracing and unknown cache state.
