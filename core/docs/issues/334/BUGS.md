# Issue #334 bug ledger

> **Status:** Current planning checklist; no release candidate exists.

Raw run evidence is retained under `core/target/issue334/`; timings here are
diagnostic, not performance qualification. Global Store execution uses explicitly
selected Disposable/WAL/OFF. Durable: NOT_RUN — disabled by owner until explicit
reauthorization.

| ID | Phase / step | Symptom and evidence | Root cause | Fix commit | Regression / verification | State |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | A / 025, 031 (`fs-read-01`, `fs-read-07`); B / 005 | `fs.glob('work', 'test/**/*.test.js', '/')` omitted `/test/cart.test.js`; `src/**/*.js` omitted direct children. Phase A outputs and trace retained. | Shared `Rule` parser treated `**` and its following `/` independently: the wildcard could match zero characters but the slash was mandatory. | `222240012` (shared pattern matcher and skill) | External `layerfs-content/tests/glob_directories.rs`: all three tests failed before the fix (`phase-b/glob-before.out`), pass after (`glob-after.out`). All Content tests/examples pass (471 passed, 2 ignored); scoped Clippy, boundary guard and its 50 self-tests pass. Rebuilt daemon and host addon; live SDK step 005 returned `/test/health.test.js` from `test/**/*.test.js`. | FIXED |

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
