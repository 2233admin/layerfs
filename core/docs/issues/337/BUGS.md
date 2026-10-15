# Depot defects and guidance gaps

> **Status:** Current planning checklist; no release candidate exists.

Scope: issue #337. Retain exact failures, source diagnosis, fix/regression,
source identity and recovery outcome. P-001 was established and fixed during Phase A. Local orchestration and network
errors are recorded separately below.

| ID | Classification | Evidence / diagnosis | Status |
| --- | --- | --- | --- |
| A-ENV-01 | Environment prerequisite | Existing native image contains Rust 1.85.1 but its PATH omits `/usr/local/cargo/bin`; Depot runtime must explicitly supply that PATH. | Pin in runtime; not a LayerFS defect |
| A-ENV-02 | Docker build input | Docker BuildKit attempted remote lookup for a locally imported digest and received not found. Retained `phase-a/runtime-build` receipts. Use the inspected local tag for build, verify its exact image identity before build and freeze the resulting image ID. | Diagnosed; changed build input, not an SDK defect |
| A-ENV-03 | Network/image prerequisite | Debian HTTP package-index body ended with proxy HTTP 500 / unexpected EOF; no image was produced. HEAD diagnostics show the compressed HTTPS index is reachable. Changed build uses HTTPS, xz index preference and explicit zero APT retries. Original APT transport repeated fetches internally; retained as a procedure deviation. | HTTPS image build and browser prerequisite passed |
| A-LOCAL-01 | Orchestration error | Dockerfile v3 nested single quotes broke the sed command before network access. Dockerfile v4 uses exec-form RUN with a structured argv. V3 failure retained. | Corrected; not a product defect |
| A-ENV-04 | Toolchain prerequisite | Runtime version inspection found Rustfmt absent although Rustc/Cargo/Clippy are present. Add the exact 1.85.1 component to the image; freeze only after fmt and actual browser interaction pass. The multi-version shell returned zero despite the rustfmt error; the missing check remains a failure. | Pinned 1.85.1 Rustfmt installed; Cargo fmt passed |
| A-LOCAL-02 | Orchestration error | Initial fs.apply omitted parent directories; NoSuchPath detail.index=1, branch history stayed empty and root contained only .git. The documented ordered mkdir changes correct the batch. | Diagnosed; corrected scaffold selected |
| P-001 | LayerFS correctness blocker | Phase A step 007 Cargo store build exits 0; sandbox.commit fails in Commit Construct with `invalid record: file run accounting`. Branch head remains domain-build Commit; Workspace 4 is Idle with 143,474,630 payload bytes retained. Exact trace and both daemon streams saved. | Mixed pending suffix replaced after repeat count reaches zero; external regression fails before fix and passes in Content suite. Fixed in db5b1bac9; new-daemon Cargo build/Commit passed on the same Store |
| A-PROC-01 | Orchestration sequencing error | Step 008 server build was launched before checking step 007 Commit result. It exits 0 on a new Workspace; neither this build nor the failed store build is reported committed. Both Workspaces are retained. Further build steps halted for diagnosis. | Disclosed; dependent calls now gated on inspected success |

## P-001 source diagnosis and checks

`ExtentBuilder::repeat` consumes a short repetition while flushing the mixed
prefix, then falls through into uniform replacement with count zero. Unconsumed
mixed entries remain and must be kept. Return when count reaches zero. The
external regression constructs 193 extents: the old mapping reports 2,131,442
bytes against 35,057 actual bytes for count=1. Compare canonical roots against
the ordinary non-repeated builder. Counts 1/2/3 pass after the fix. No format,
profile, codec or construction parallelism changes.

The whole Content all-targets suite, scoped Rustfmt, boundary guard and 50
core-tool self-tests pass. Root-wide Rustfmt fails on an existing formatting
difference in `layerfs-persistence/tests/sqlite_group_rows_indexed.rs:133`;
that unrelated source is unchanged. Warning-denying Content Clippy passes; live Cargo-output Commit verification passed on the existing Store.

## P-001 recovery disposition

Commit `db5b1bac9490cb8aeef569cddf18b924cbc3b75d` fixes the source (+3
production LOC). Rebuilt addon/daemon identities are retained in Phase A.
The original Branch head was verified unchanged. Quiescent live local SQLite
files and both log streams were retained, then the two uncommitted generated
Cargo-output Workspaces were deliberately abandoned. No application source had
been changed in them. The following server build had no Commit attempt because
construction was already known defective; it is recorded uncommitted.
Both old Sandboxes were closed after final log capture. The existing Store was
exported while stopped, restored read-only with WAL visible, quick-checked and
reconciled exactly against the pre-fix operator statistics. A new daemon opened
the same volume, retained every prior Commit, and successfully committed a new
Cargo build from the last published view. No Init or Store replacement occurred.

| ID | Classification | Evidence / diagnosis | Status |
| --- | --- | --- | --- |
| S-001 | SDK skill guidance | Rust/Cargo cache placement, test prebuilds, package inspection and retained-Workspace build sequences were absent from the skill. Live Phase A calls now cover them. | Added references/rules/cargo.md; no new API |

## Builder 1 merge reply incident

| ID | Classification | Evidence / diagnosis | Status |
| --- | --- | --- | --- |
| B1-LOCAL-01 | Host orchestration | Host `timeout` is absent. The first bounded read exited 127 before Init. Subsequent host commands use the process-group-bounded Python runner. | Corrected; not a LayerFS defect |
| B1-APP-01 | Application implementation | M3 first build used Axum Query although the frozen dependency features omit `query`. Step 016 failed with E0432 and its changed files were committed. Built-in RawQuery plus bounded parsing compiled and passed M3 in steps 017–019. | Corrected without dependency changes |
| P-002 | SDK merge diagnostics | Builder 1 step 026 Branch merge returned Failed/UnexpectedEof after an attempted exchange. The service remained running and retained the original failed slot; step 027 found no combined Branch and unchanged source/publication refs. `sdk/branch.rs` encoded every Cargo LWW decision and conflict hunk into one 65,519-byte control frame. External normal-encoder regressions with 700 Cargo paths and 900 multibyte conflict paths both failed with `control record limit`. | Fixed in eaa64f4db; 25 Bridge tests, API conversion regression, scoped Clippy/formatting, boundary guard and 50 guard self-tests pass. Same-Store live recovery returned typed Conflict, reviewed source resolution merged, and full final-main Depot acceptance passed |
| B1-LOCAL-02 | Host orchestration sequencing | A Git commit command ran before the LOC script produced its message and exited 128 without a commit. Exact first-parent/staged-tree LOC was then completed before the successful source commit and the committed tree was confirmed identical. | Failed attempt retained; no commit without LOC occurred |

P-002 preserves the wire limit and merge semantics. Shared SDK merge-value
serialization uses separate 16 KiB byte windows for conflict diagnostics and
LWW decisions. Omitted paths/decisions are explicit (`conflictsTruncated`,
`lwwTruncated`); each conflict retains its original block count and marks omitted
whole hunks (`hunksOmitted`). The SDK guide documents paging the unchanged input
Branch diff and reading both sources/base when the summary is incomplete. No
source path receives LWW and no total merge-work cap is introduced. Raw evidence
lives in `core/target/issue337/builder1/026-*`, `027-*` and `p002-*`.

P-002 recovery retained the same volume and all original refs. Both old daemon
streams were preserved before close. New service step 029 returned `Conflict`
with `conflictsTruncated=false` and `lwwTruncated=true`, rather than the original
failed delivery. The actual Store `lib.rs` conflict retained both delete and
recovery modules on working forks. The other conflict was generated Python
bytecode: identical `api.py` source had different embedded Workspace paths,
confirmed by marshal inspection. Both inspected generated files were removed
on the working forks and rebuilt source was verified without new LWW rules.
Merge 032 created `combined` with no source conflicts. Original Branches and
the uncertain step 026 remain retained separately from this successful recovery.

Builder 1 completed M1–M6 and then full acceptance on the distinct
`final-main-acceptance` Branch forked from post-M6 main Layer
`3267a5a23faa4dfabe196cef0a90003a8abcd2d8c7982f578a56e08fc51eb04f84`.
The final acceptance head is
`121cccbc53ebf7baa8706f087b95057c0bd6b776af6e859be6bd4a509a8c069961`.
Steps 073–106 include source identity, fresh Workspace clean builds, every
package's tests/doc checks/warning-denying Clippy/package inspection, formatting,
real Chromium interaction, concurrency/recovery, all 71 exact frozen fixtures
and a fresh-remount 32 MiB CLI download. The earlier pre-M6 candidate is labelled
separately. All processes, Workspaces and Sandboxes, including the service,
closed after both daemon streams were preserved. The complete diagnostic report,
92-step command ledger and immutable receipts are retained in the Builder 1 raw
folder; this is no benchmark, release or power-loss qualification.

## Independent-run environment setup

| ID | Classification | Evidence / diagnosis | Status |
| --- | --- | --- | --- |
| C-ENV-01 | Orchestrator setup error | Builder 2 step 001 Init returned `Unauthorized` because the provided HOME was owned by uid 501 but mode 0755. The SDK already documents and enforces a current-user private directory with no group/other access. Original refusal remains `receipts/init.json`. Before changing anything, the orchestrator verified HOME and the assigned volume were empty. | HOME corrected to 0700; a newly identified step 002 Init passed, separate step 003 initial stats preceded all forks/scaffolding. SDK/daemon/skill bytes unchanged; no Store existed before the correction. Full independent acceptance remains separately reported in RESULTS.md. |

The standalone preparation script now creates HOME with mode 0700. This was
not a product defect or a reason to replay an uncertain operation. The first
refusal was before effects, and its exact evidence and environment inspection
remain in the independent raw receipts and `ENVIRONMENT-CORRECTION.json`.

## Independent run completion observations

Builder 2 completed every milestone and full fresh-final-main acceptance without
product/SDK/skill edits. All 82 Bash exits were 0; the setup-only Init refusal
above remains retained. Final immutable report and diagnostic evidence are
reproduced or linked in [RESULTS.md](RESULTS.md).

The final process audit had no live application or browser processes and 24
exited Chromium zombies, cleared by explicit container close. The explicit
daemon's final stderr retains a ConnectionFailure/UnexpectedEof with no received
bytes or decoded request. The committed connection handler transfers precisely
that unowned connection diagnostic to stderr and releases the slot; handshake
versus later receive and peer identity remain unknown. All SDK product outcomes
are known. Neither observation required a product fix or altered acceptance.
