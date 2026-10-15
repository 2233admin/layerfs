# Issue 334 bug ledger

> **Status:** Current planning checklist; no release candidate exists.

All observations are diagnostic, tracing on, without cache control. Durable is
`NOT_RUN — disabled by owner until explicit reauthorization`.

| ID | Phase / step | Symptom | Evidence | Root cause | Fix commit | Regression / verification | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | A / 025, 031 | `fs.glob("work", "test/**/*.test.js", "/")` omits `/test/cart.test.js`, returns only `/test/routes/cart-api.test.js`; `src/**/*.js` returns empty for direct children | `phase-a/fs-read-01.out`, `fs-read-07.out`, `trace.jsonl` | Not yet diagnosed; assigned to Builder 1 | pending | Live explicit fixture contains both paths; regression pending | OPEN; does not block Phase A |

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
