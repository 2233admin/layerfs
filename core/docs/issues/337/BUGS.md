# Depot defects and guidance gaps

> **Status:** Current planning checklist; no release candidate exists.

Scope: issue #337. Retain exact failures, source diagnosis, fix/regression,
source identity and recovery outcome. No product defect has been established.

| ID | Classification | Evidence / diagnosis | Status |
| --- | --- | --- | --- |
| A-ENV-01 | Environment prerequisite | Existing native image contains Rust 1.85.1 but its PATH omits `/usr/local/cargo/bin`; Depot runtime must explicitly supply that PATH. | Pin in runtime; not a LayerFS defect |
| A-ENV-02 | Docker build input | Docker BuildKit attempted remote lookup for a locally imported digest and received not found. Retained `phase-a/runtime-build` receipts. Use the inspected local tag for build, verify its exact image identity before build and freeze the resulting image ID. | Diagnosed; changed build input, not an SDK defect |
| A-ENV-03 | Network/image prerequisite | Debian HTTP package-index body ended with proxy HTTP 500 / unexpected EOF; no image was produced. HEAD diagnostics show the compressed HTTPS index is reachable. Changed build uses HTTPS, xz index preference and explicit zero APT retries. Original APT transport repeated fetches internally; retained as a procedure deviation. | Diagnosed; verification pending |
| A-LOCAL-01 | Orchestration error | Dockerfile v3 nested single quotes broke the sed command before network access. Dockerfile v4 uses exec-form RUN with a structured argv. V3 failure retained. | Corrected; not a product defect |
| A-ENV-04 | Toolchain prerequisite | Runtime version inspection found Rustfmt absent although Rustc/Cargo/Clippy are present. Add the exact 1.85.1 component to the image; freeze only after fmt and actual browser interaction pass. The multi-version shell returned zero despite the rustfmt error; the missing check remains a failure. | Image correction pending |
| A-LOCAL-02 | Orchestration error | Initial fs.apply omitted parent directories; NoSuchPath detail.index=1, branch history stayed empty and root contained only .git. The documented ordered mkdir changes correct the batch. | Diagnosed; corrected scaffold selected |
| P-001 | LayerFS correctness blocker | Phase A step 007 Cargo store build exits 0; sandbox.commit fails in Commit Construct with `invalid record: file run accounting`. Branch head remains domain-build Commit; Workspace 4 is Idle with 143,474,630 payload bytes retained. Exact trace and both daemon streams saved. | Mixed pending suffix replaced after repeat count reaches zero; external regression fails before fix and passes in Content suite. Live rebuilt-daemon verification pending; no replay |
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
that unrelated source is unchanged. Warning-denying Content Clippy passes; live recovery remains pending.
