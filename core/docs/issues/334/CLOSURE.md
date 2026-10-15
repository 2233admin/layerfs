# Issue #334 closure disposition

> **Status:** Archived; retained for historical evidence only.

The A–D SDK shop exercise is complete, with two disclosed collection deviations.
Both builders completed M1–M6 and fresh-Branch acceptance; Builder 2 independently
passed 14 tests, a clean dependency install, build and HTTP purchase smoke using
only the supplied outside folder, specification and SDK skill.
[RESULTS.md](RESULTS.md) is the diagnostic report, including Builder 2's verbatim
report. [EVIDENCE.md](EVIDENCE.md) locates checksummed portable receipts and all
three stopped Store exports.

The owner subsequently instructed the orchestrator to finish all five closure
steps: preserve evidence, record completion/deviations, review and create a PR,
merge, and verify closure before archiving the worktree. That instruction
authorizes the publication and merge that the original run plan held for owner
approval. The PR's closing reference and GitHub merge record establish the final
repository/issue disposition; this file records the reviewed result prepared for
that merge. It is not a product release approval or a benchmark qualification.

## Collection deviations retained

1. C's first script grouped Init, fork and scaffold. Its initial statistics were
   reconstructed read-only from the unchanged sealed host Init artifact using
   the exact product query/formulas. No contemporaneous initial operator capture
   exists. The source hash was verified unchanged and final counters reconcile.
2. One Phase A group Sandbox's daemon stderr was lost before removal; its SDK
   trace survives. B/C daemon logs preserve both streams and decode completely.

These limitations remain visible in the report, manifest and closure comment.
The closure disposition does not relabel either collection procedure as fully
compliant or claim that the owner expressly waived missing evidence. The scoped
diagnostic conclusion remains supported by the retained receipts.

## Closure source review and final verification

Review found a second shared Rule matcher defect: `src/**/**/index.js` still
omitted the direct child `/src/index.js`. BUG-001 had handled one recursive
directory segment, but consuming its slash hid the name boundary from the next
segment. Commit `02e0409cbaa7ebe38305a739422a4eb859ed8d60` recognizes an existing
recursive-directory token as that boundary. An external public-API regression
failed before the fix and covers two/three consecutive segments, leading
globstars, partial-name rejection and LWW selection after it.

Final product checks on that source:

- All Content test/example targets built first, then passed: **472 passed,
  2 existing ignored**.
- Warning-denying Content Clippy with all targets, scoped rustfmt, the product
  boundary guard, its **25 discovered self-tests**, and whitespace checks passed.
- Pinned Linux release daemon and host addon rebuilt successfully; authorized
  fuser provenance checks passed.
- Through the live public SDK on the retained C Store,
  `src/**/**/server.js` and `src/**/**/**/server.js` both returned
  `/src/server.js`. Store statistics matched C's final original values exactly.
  The separate automatic service Sandbox was logged, decoded and closed.

| Closure artifact | SHA256 |
| --- | --- |
| Linux daemon | `e82835beaf187c7be922bbf30fe7402f3ed7257fb26f50a2dba8b0383118a7dd` |
| Host addon | `e25b3e86de2c8d685e813083b4ca46794d8940267eb3f9f76d7b2432f4d7f2cb` |

All commands had explicit wall timeouts at or below 120 seconds. The original
B/C shop acceptance and timings keep their original source/artifact pins. Those
runs used no consecutive recursive-directory patterns; their unaffected
evidence is reused, and they are not relabelled as fresh runs on the closure
build. There is no aggregate CI or release qualification claim. Global Stores
used Disposable/WAL/OFF and one construction producer. Durable remains
`NOT_RUN — disabled by owner until explicit reauthorization`.

Final bug disposition: **2 found, 2 fixed, 0 open**, including closure review;
the original A–D campaign reported **1 found, 1 fixed, 0 open**. Expected source
conflicts and the builder's local tooling errors remain distinct from product
defects. [BUGS.md](BUGS.md) preserves both fixes and the skill corrections.

## Production source accounting

Commit `02e0409cb` records **87,550 → 87,552 (delta +2)**. Its exact first parent
and staged tree were counted with the same `tools/production_loc.py` (SHA256
`cb9cdb1a5d00b908763894133f97a9f2b1889066651f27ce6f66009976b46197`), then the
committed tree was confirmed equal. The closure documentation commit records
**87,552 → 87,552 (delta +0)** in its own message and receipt. Current production
scope is core Rust/runtime SQL **85,708** plus SDK native/JS/operator **1,844**;
tests, examples, docs, tooling and artifacts are excluded.

Against the original main `b30e4fb8ff61134640bec88af211cec283ed1a53`, the
combined product delta is **+20**: +18 for BUG-001 and +2 for BUG-002. The merge
must count its exact first parent and merge tree again and record the resulting
comparison in the merge message. Reference absent (retired R9c; last counted
65,417 at tree `498dd1917812`). This is a source-size comparison, diagnostic and
not a performance claim.
