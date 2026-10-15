# Phase A — live prerequisites and freeze

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Scope: #337. Initial main 358e92cf7; Content fix db5b1bac9. Runtime/product
pins are in ENVIRONMENT.json and frozen inputs in FREEZE.json. All numbers
are diagnostic with tracing on and unknown OS cache state. No Depot application
has been built yet. Builder 1 and independent Builder 2 remain required.

## Outcomes

- Tiny Init alone, then initial operator stats before fork/scaffold: logical
  21 B, canonical 2,104 B, stored 2,060 B; raw initial-stats.json.
- Workspace crates.io config and immutable crate archive reachable over HTTPS.
- Fresh dependency fetch: 157 locked packages; dependency sources and archive
  cache remain inside the LayerFS view. No #334 inputs, Store or application used.
- Four package builds succeeded. P-001 blocked a Cargo-output Commit, was
  diagnosed with a failing external regression, fixed, and verified on the same
  Store after rebuilding. See BUGS.md; all original failures remain retained.
- Same-Workspace unchanged build and source-edit rebuild succeeded. The former
  reported no compilation; the latter compiled project crates only. Fresh-mount
  steps had recompiled dependencies. These observations are not a speed comparison.
- Test targets built before execution; SQLite WAL/OFF create/write/close/reopen
  integration passed. Clippy -D warnings, formatting and all package lists passed.
- Clean removed 1,970 generated files / 436.2 MiB reported by Cargo; dependency
  cache retained. Complete clean rebuild passed (Cargo reported 24.30 s).
- Real Selenium/Chromium button click passed in the Workspace environment.
  This is a browser prerequisite, not the required Depot UI acceptance flow.
- Binary executed successfully after fresh remount; Cargo.lock stayed identical.
- Every selected final step has a successful Commit or explicit UpToDate. All
  Workspaces and explicit/service Sandboxes closed after both daemon streams
  were saved. Original uncommitted failed-build Workspaces were abandoned with
  forensics retained; see recovery disposition.

## Source checks and custody

The fix passed 473 Content all-target tests, scoped warning-denying Clippy,
changed-file Rustfmt, product boundary checks and 50 core-tool self-tests.
Whole-workspace Rustfmt has an unrelated existing Persistence-test diff.
Commit production LOC: 87,552 -> 87,555 (+3), core 85,708 -> 85,711,
SDK 1,844 unchanged; reference absent (retired R9c; last counted 65,417 at
tree 498dd1917812). Exact staged/parent counter receipts are in Phase A.

Original stopped export: /Users/yifanxu/.codex/issue337-evidence/phase-a-before-p001.
Read-only restore preserved WAL, quick_check passed, and store_totals, pages,
free space, logical/canonical/stored and metadata overhead reconciled exactly.
Final Phase A raw root: core/target/issue337/phase-a. Trace, per-step outcomes,
all branch history/storage pages, initial/final stats, logs, lockfile and binary
identities are retained. Final stopped export and checksummed archive are
collected with the campaign evidence.

## Disclosed collection and procedure limits

Docker's first local-digest lookup failed remotely. The first APT HTTP index
request repeated internally before failing; HTTPS with explicit zero retries
succeeded. One Dockerfile quoting mistake and one missing-mkdir SDK batch were
local orchestration errors. A subsequent server build was mistakenly launched
before checking the preceding failed Commit; neither was credited committed.
Prepared original steps 009–020 were not executed; the corrected continuation
uses 029–045. No passing or failed receipt is relabeled as a fresh independent run.

Host addon/Linux dependency builds overlapped during untimed preparation, and
image installation overlapped compilation. No performance claim uses those times.
SDK trace command summaries clip at 200 characters; full SDK scripts and Exec
result files retain commands. Host preparation here-doc bodies are in the chat
transcript; the generic host receipt records argv and outputs rather than stdin.
Daemon phase trees can omit nodes at their declared limit; preserve omitted
counts. Unavailable filesystem counters are unavailable, never zero.
