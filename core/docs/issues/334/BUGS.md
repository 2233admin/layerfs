# Issue #334 bug ledger

> **Status:** Current planning checklist; no release candidate exists.

Raw run evidence is retained under `core/target/issue334/`; timings here are
diagnostic, not performance qualification. Global Store execution uses explicitly
selected Disposable/WAL/OFF. Durable: NOT_RUN — disabled by owner until explicit
reauthorization.

| ID | Phase / step | Symptom and evidence | Root cause | Fix commit | Regression / verification | State |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | A / 025, 031 (`fs-read-01`, `fs-read-07`); B / 005 | `fs.glob('work', 'test/**/*.test.js', '/')` omitted `/test/cart.test.js`; `src/**/*.js` omitted direct children. Phase A outputs and trace retained. | Shared `Rule` parser treated `**` and its following `/` independently: the wildcard could match zero characters but the slash was mandatory. | `222240012` (shared pattern matcher and skill) | External `layerfs-content/tests/glob_directories.rs`: all three tests failed before the fix (`phase-b/glob-before.out`), pass after (`glob-after.out`). All Content tests/examples pass (471 passed, 2 ignored); scoped Clippy, boundary guard and its 50 self-tests pass. Rebuilt daemon and host addon; live SDK step 005 returned `/test/health.test.js` from `test/**/*.test.js`. | FIXED |
| BUG-002 | Closure review, after the original campaign | Consecutive globstar directories, e.g. `src/**/**/index.js`, still omitted `/src/index.js`. The new external regression failed on that exact path before the fix. | Parsing the first `**/` consumes its slash into a `Directories` token, but the next segment recognized only an empty token stream or literal `/` as a name boundary. | Closure source commit; exact id recorded in the closure receipt | External `consecutive_recursive_directory_globs_include_zero_directories` covers two/three consecutive segments, leading globstars, partial-name rejection and shared LWW rules. All Content tests/examples pass after the fix: 472 passed, 2 existing ignored; scoped Clippy, rustfmt, boundary guard and its 25 discovered self-tests pass. | FIXED; separate from the original B/C source pins |

Phase B completed M1–M6 and fresh-Branch acceptance on the original volume.
The only SDK refusal was the expected source conflict when merging `orders` and
`web` at step 015. Steps 016–017 read both sides and resolved the two server
hunks identically on working forks; the merge and combined tests passed. This
was normal conflict handling, with no product defect inferred. All 12 shop tests,
the clean dependency install, standalone build and HTTP smoke passed. Full run
details, refs, recoveries and lifecycle evidence are in
`core/target/issue334/phase-b/REPORT.md`.

## Skill gaps corrected in Phase A

- Actual Branch order is main then work. Forking from a Branch inherits its head.
- `fs.list` entries have `path`, no `size`; examples now contain actual replies.
- Diff hunk text has no line endings; the inspect output is concatenated unless the
  script inserts newlines. Printed examples and source data are kept separately.
- Writing a combined file on just one Branch can still conflict. Resolve identically
  on forks of both sides; the corrected `merge-apply` recipe succeeded. An add/add
  base has no file, so read the two Branches directly.
- The smoke server starts at `src/main.js`; a module exporting `createApp` alone does
  not start listening. The live fixture has an explicit listening entrypoint.
- Docker assigns friendly names; the Sandbox suffix is a container identifier.
- Synthetic output shapes were replaced with live captures, including `UpToDate`
  when a fixture write was byte-identical and a range read with `truncated: false`.

## Phase A fixture and collection notes

The first mv example refused `Exists` because its destination already existed in
our shared fixture. The original refusal is retained. A separate Branch with an
absent destination exercised the revised setup successfully; no product fix implied.
The first one-sided combined Branch resolution refused `Conflict`; its evidence is
retained and the corrected two-fork recipe has its own script/output.
The four group scripts, all method snippets and conflict recipes ran as separate
Node commands. Additional fixtures, cp, LWW merges and every operator method were
exercised explicitly. jq examples and decoder joins also ran once. One group Sandbox
was closed after collecting stdout only from `docker logs`; its stderr observation
log is unavailable, but its SDK trace remains. Other Phase A daemon logs were decoded.

## Phase B completion and subsequent observer corrections

Builder 1 completed M1–M6 and clean acceptance, preserving the original Store.
Its report is `core/target/issue334/phase-b/REPORT.md`. The expected orders/web
source conflict was resolved on two working forks, with no discarded work.
All Workspaces were unmounted and the three workload Sandboxes closed.

The observer then verified `await layerfs.service()` and its `Closed` reply in
`phase-b/observe-service-cleanup.out`, under an `OBS` trace label excluded from
workload statistics. This separate observer Sandbox was also logged and closed.
The skill now explains the automatic service, corrects the old no-container claim,
and shows how to discover and close it last. Observation docs also correct
`process.list` item `id`, the unchanged snapshot shape, `store.commits(main)`'s
`NoSuchBranch` refusal, file revision logical bytes, and overlapping stored/metadata
accounting. These are documentation corrections, not additional product bugs.

## Phase C completion

The independent builder completed M1–M6 and acceptance with 14 tests, a clean
install/build, and one-command HTTP purchase smoke. It used only the supplied
outside folder, SDK, specification and skill; no LayerFS/SDK/skill fixes were made.
No SDK refusal or uncertain outcome occurred. Its final main Layer is
`32fdced5c175d45e682ca03f08da5be09987e61d3fbe8543873a793461ae56f3b6`.
The verbatim report is preserved under `phase-c/builder2/REPORT.md` and in RESULTS.

Two builder tooling errors remain in the evidence: step 004 shell quoting
interpreted backticks while creating a local script (no SDK call reached), and
step 023 treated `LAYERFS_DOCKER` as a CLI executable (EACCES before close).
The builder inspected state and corrected the local commands. The skill's
variable table now says that LAYERFS_DOCKER is a daemon socket/endpoint, and
log collection uses the docker executable. The main-entry Layer/null-head
semantics are also explicit. These are tool-use/documentation findings, not
additional LayerFS defects.

Collection gap: the first Phase C script grouped Init and scaffold, preventing a
contemporaneous initial operator snapshot. Initial statistics were reconstructed
read-only from the unchanged sealed host Init file using the exact product query
and formulas; hash/WAL-header evidence is in
`phase-c/stats-init-reconstruction.json` and `stats-init-final-hash.json`.
The reconstruction is never described as a live operator capture. Final canonical
and stored counters reconcile exactly; Layer logical and SQLite overhead growth
explain the remaining counter differences. No live Store snapshot was taken while
the builder mutated the project.
