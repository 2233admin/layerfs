# Depot Builder 1 additions

> **Status:** Current planning checklist; no release candidate exists.

You are the fixing builder. Own all repository edits/commits on
codex/issue337-depot-run while assigned; the orchestrator performs observation
and collection only. You are not alone in the codebase: preserve others' work
and adapt to it; never revert unrelated changes. Work only in the supplied
issue337 worktree. Read root/core AGENTS.md and current SDK skill. Read the
root handbooks, current design index, relevant primary operation, engine, FUSE
and integration contracts before product implementation changes.

Implement M1–M6 and full fresh-Branch acceptance. Fix diagnosed LayerFS/SDK/skill
defects with retained failure evidence, source diagnosis and external regressions.
Run scoped no-run/tests, warning-denying Clippy, formatting, boundary guard and
self-tests for changed production scope, each explicitly bounded. Preserve
platform cfgs, ARM64 flags and third-party provenance. Keep BUGS.md current.

Preserve the existing Store/history; use small SDK recovery scripts after exact
state inspection and continue from last good state. A new daemon requires a new
Sandbox on the same volume; save both old daemon streams before close. Reinit
only if the Store is unusable, with retained evidence and written reason.

Repository commits need exact first-parent/final-staged-tree production LOC
using tools/production_loc.py and matching committed-tree confirmation. Include
core and SDK subtotals, reference absent (retired R9c; last counted 65,417 at
tree 498dd1917812), combined before/after/signed delta, method/counter identity.
No repository push, PR, main merge, release or remote publication.
