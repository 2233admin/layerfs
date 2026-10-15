# Depot acceptance procedures

> **Status:** Current planning checklist; no release candidate exists.

Scope: #337. Frozen with SPEC, dependencies, fixtures and builder prompts in FREEZE.json
after Phase A checks. Both builders implement
all six milestones independently. Full acceptance uses a Branch forked from
final main and newly mounted Workspaces. No Builder 1 implementation is supplied
to Builder 2. Keep exact commands and output, including all failures.

## Command environment and budgets

Every outer host command has wall timeout <=120 s. Every `sandbox.exec` command
contains `timeout`, for example `timeout 110 bash -c 'set -eu; ...'`.
Set `CARGO_HOME="$PWD/.cargo-home"`, `CARGO_TARGET_DIR="$PWD/target"`,
`CARGO_NET_RETRY=0`, `CARGO_BUILD_JOBS=3`, `RUSTUP_HOME=/usr/local/rustup`,
`RUSTC_WRAPPER=` and `RUSTC_WORKSPACE_WRAPPER=` inside commands.
A declared Cargo build sequence may retain one Workspace across separate exec
and Commit steps to keep its path stable; unmount at the end and use new
Workspaces for fresh-remount/full-acceptance requirements. This uses the existing
SDK long-lived Workspace contract. The toolchain comes only from the pinned image. No external build/cache mounts.
All source/manifests/lockfile/application data remain outside LWW; the exact
generated-state rules are `target/` and `.cargo-home/`. Rebuild generated output
after the M4/M5 source merge. No third-party source edits.

Dependency fetch is its own command/Commit (110 s), then package-level first
builds (110 s each). Record an unchanged build (110 s) and a source-edit rebuild
(110 s) separately. Retain Cargo stdout/stderr and absolute path/config changes.
Full acceptance removes only generated `target/` output, retaining dependency
source cache, then rebuilds each package in dependency order, 110 s each.
No cold-cache/network claim. Read and diagnose timeout output before a changed
follow-up; do not repeat unchanged invocations or leave work in background.

## Required commands

Use the four packages `depot-domain`, `depot-store`, `depot-server`, `depot-cli`.
For each, run `cargo test --locked --offline -p PACKAGE --no-run` (110 s), then
`cargo test --locked --offline -p PACKAGE` (60 s). Compile documentation tests
through normal Cargo preparation, then run `cargo test --locked --offline
-p PACKAGE --doc` (60 s). Binaries have no doctests unless a library is present;
report exact applicability. Run `cargo clippy --locked --offline -p PACKAGE
--all-targets -- -D warnings` (110 s per package), `cargo fmt --all -- --check`
(20 s), and `cargo package --list --locked --allow-dirty -p PACKAGE` (30 s).
Record intended distributables and inspect listings for missing source/README,
private data, dependencies and generated output; this does not publish packages.
Build and execute any scoped integration target separately if needed for budget.

## Behavioral matrix

1. Health, configuration, random loopback port, bounded readiness and shutdown.
2. Repo create/list/detail; duplicate 409; absent 404; identifier validation 400.
3. Empty/text/binary/nested-path inputs and all 64 small fixtures upload/download
   with exact length/SHA256; name/version are opaque immutable identifiers.
4. Stream 32 MiB v1, identical v1 bytes under another version, then one-byte v2;
   check size/SHA256/ETag and committed history. Do not buffer whole files.
5. Paginate empty/nonempty repositories/versions, stable ordering, prefix filter;
   defaults 1/20, limit 100; reject zero/negative/noninteger/oversized values.
6. Same-identity concurrent PUTs: exactly one 201 and one 409; ready readers see
   a complete object or 404; different identities can proceed independently.
7. Delete one version (204), absent delete (404); another version remains exact.
8. Interrupt a streamed upload; no visible/downloadable partial; inject one
   deterministic publication-boundary fault; restart and reconcile incomplete
   uploads/deletions without losing previously acknowledged complete versions.
9. CLI create/list/upload/list/info/download/delete with `--json`; exit codes
   0 success, 2 usage/validation, 3 not-found/conflict, 1 transport/unexpected.
   A failed download leaves no partial final destination; exact bytes verified.
10. Actual Selenium/Chromium interaction: open UI, create repo through form,
    select/upload fixture, observe status, list/info/download, confirm deletion
    and see removal/error behavior. Asset HTTP checks alone do not qualify.
    Use installed `/usr/bin/chromedriver`, headless Chromium `--no-sandbox`,
    bounded page/script waits, and deterministic driver.quit/process cleanup.
11. Gracefully stop server, commit, unmount, mount a fresh Workspace, execute the
    retained binary (executable mode), restart against retained data and check
    checksums. Cover clean restart and fault recovery separately.
12. README: exact toolchain/build/test/run/CLI/config/API/recovery/storage,
    package inspection and explicit limitations. No power-loss claim.

## Branch and lifecycle evidence

Publish main after each passed M1–M6. Fork registry (M4) and web-recovery (M5)
from published M3, alternate their steps, merge with branch.merge, inspect and
resolve actual conflicts without discarded source or source LWW, then verify
combined behavior before publication. Mount two Workspaces of one Branch and
change different source/test files; commit both and preserve both changes.
Commit after every Bash step including failures. Record UpToDate separately
from new Commits. Save all Branch histories and main publication/source IDs.
Terminate applications and browser children, unmount every Workspace, save
both daemon stdout/stderr before close, and close all explicit Sandboxes and
the automatic service Sandbox last. Orchestrator captures initial stats in a
separate step immediately after Init before any fork/scaffold/mutation.
