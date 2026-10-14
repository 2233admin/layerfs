# Issue 323 — public SDK real-project experiment

> Status: Dated planning checkpoint; not release evidence or a product contract.

This independent, unpublished harness exercises the implemented Rust SDK against a complete DeepSeek Harness root. It is not a Node binding, a benchmark family or a product implementation. [Issue 323](https://github.com/Ephemeral-AI-Lab/layerfs/issues/323) owns the API allowlist and staged experiment matrix. [Experiment log](../../docs/benchmark/deepseek-probe-20261014/EXPERIMENT-LOG.md) records original failures and fixes.

## Actual calls

ProjectApi performs Init, Branch list/fork and Commit history. SandboxApi performs create/install, reopen and close. WorkspaceApi performs mount, Exec, Commit, status and normal unmount. ExecCreated and its returned start/stream/inspect owners carry actual command completion. The driver does not call SDK internal helpers, raw Control/Bridge requests, direct runtime execution/lifecycle operations or database methods. The bridge/sandbox/storage/history/persistence types construct the SDK's required configuration and typed inputs; they are not used to substitute data-path operations.

Shell/Python workloads are ordinary filesystem operations launched through SDK Exec. Their independent expected hashes are constructed from the prepared native input before Init. No host process opens the Store after install. The returned runtime identity is read only to record resource custody.

## Reproduction prerequisites

Use an independently copied complete native input; preserve owner and symlinks. Never execute a workload in the protected original checkout. Supply a plain local named Docker volume that already exists and is empty, the pinned image `sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6`, and a sealed daemon executable from the selected product identity. Volume creation is explicitly separate operator infrastructure; SDK create performs installation. Do not copy Store bytes into the volume manually.

Run from the worktree root to retain `.cargo/config.toml`. Build with `cargo +1.85.1 build --manifest-path core/benchmark/deepseek-sdk-experiment/Cargo.toml --locked --offline --release`, using a worktree-local Cargo target and bounded lock. Run formatting and warning-denying scoped Clippy with the same manifest. The native daemon is reused only after exact current source/vendor/build-input and executable hash checks.

Run `python3 core/benchmark/deepseek-sdk-experiment/prepare.py <prepared-input> <fresh-campaign-directory>` outside the test. It creates the immutable `workloads/`, independent expected hashes and workload seals. Invoke the built executable with four arguments: `<fresh-run-output> <prepared-input> <existing-empty-volume> <sealed-daemon>`. The run output must not already exist; workloads are read from its parent's `workloads/`. Use an outer wall stop of at most 120 seconds. The scripts have independent, prospectively declared command/verification stops. An SDK failure retains its exact cause and ownership; no automatic alternate route, teardown or replay runs.

## Executed scope

At product `d4b0c68084c2fcb2c1280fd87de0644f35b53947`, the first SDK-only invocation passed E01 full Init/install/list/fork/read, E02 existing-source change/Commit/fresh mount/UpToDate, M01 256 small-file create plus rename/delete, M02 a 4-KiB patch in a 9,144,216-byte file plus later mutation and four-Commit ancestry, E03 SDK close/reopen, and H01 expected Busy unmount with a retained cwd followed by explicit holder release and normal unmount. Both Sandbox closes acknowledged stop/delete through SDK.

M03/M04 and H02/H03/H04 remain NOT_RUN as recorded in the campaign result, with the Node toolchain absent for M03. No Node SDK, direct Branch fs, SDK diff or main-line Publish is implemented here. Raw receipts are worktree-local under `benchmark-results/fs-bench-pro/deepseek-sdk-20261014/`, including the API audit, binary/source seals, stdout/stderr, `sdk-calls.tsv` and result. Natural/setup warmth and possible other-worktree interference are declared; there were zero performance samples. Sampled status is not a continuous residency bound. The borrowed named volume remains retained; this SDK exposes no volume-cleanup operation.

## Issue 323 execution continuation — 2026-10-14

At unchanged product `d4b0c68084c2fcb2c1280fd87de0644f35b53947`, separate prospective checkpoints M04, M05 append/truncate-regrow/scattered, H02, H03 and H04 passed. M03 remains NOT_RUN for the compatible Linux Node prerequisite. The detailed log preserves every original failure and publication/cleanup receipt. New raw artifacts are under `benchmark-results/fs-bench-pro/deepseek-sdk-20261014/checkpoints-1/`; `summary.json` is a scoped functional disposition, not a full-matrix or performance PASS.

The separate `deepseek-sdk-checkpoint` binary preserves the first driver's source and results. Its public call helpers were reviewed; no lower-level product operation is used. H02 uses the returned public stdin writer and bounded ordinary-process synchronization; independent saved-first-root and later-root checks establish the frontier interleaving. H03 uses two Branches/Workspaces in one Sandbox and checks actual same-kernel ordinary command lifetime overlap. H04 uses six same-mount cycles and explicitly expects exit23 after cycle2 mutations; this expected command outcome is separate from SDK transport/control failure.

Reproduction needs a fresh output root and one newly prepared empty plain local volume per checkpoint. Build separately with `CARGO_TARGET_DIR=core/target/issue323-checkpoints-host perl core/target/r4-locked.pl 120 cargo +1.85.1 build --manifest-path core/benchmark/deepseek-sdk-experiment/Cargo.toml --bin deepseek-sdk-checkpoint --locked --offline --release`, from the worktree root. The locked daemon reuse must first match source/build inputs and executable hash.

Preparation scripts accept one optional fresh campaign-directory argument: `python3 core/benchmark/deepseek-sdk-experiment/prepare_git.py <fresh-campaign>` for M04; `prepare_shapes.py <fresh-campaign>` for three distinct M05 plans; `prepare_hard.py <fresh-campaign>` for H02/H03/H04 plans. These read the declared complete independent native input, create exclusive case/workload directories and compute independent oracles. They neither install nor execute product operations. Existing case directories cause an error; do not replay closed passing cases.

Run exactly one selected case: `python3 core/benchmark/deepseek-sdk-experiment/run_checkpoint.py <fresh-campaign>/<case> <existing-empty-volume>`. The outer test watchdog is120 s, ordinary command watchdog15 s, independent verifier9 s. This runner records source/tree/binary/daemon/driver/config/lock/workload identities, exports construction workers1 and serializes under the worktree lock. The driver's full Init is repeated only to acquire independent writable SDK state, never to claim a new E01 PASS or a cold measurement. No volume or Store clone substitutes for SDK installation.

Current compatible-toolchain gap: cached Linux x64 Node22.13.1 requires its x64 dynamic loader/libraries, while the qualified daemon image is ARM64. Native host runtimes inspected are macOS ARM64. No compatible local runtime was qualified; no package download, npm/pnpm install or macOS binary substitution occurred. M03 is the concrete remaining checkpoint.

## M03 focused compile/runtime — completed

M03 passed at the same product pin using pre-qualified Linux ARM64 Node22.23.1 image `sha256:2d929c6d66c21c962febba8ede6ddb6405faefa057d3b4d21750de07fe81918b`. It compiled packages/util/brand through installed TypeScript6.0.3 and ran two explicitly campaign-owned Node built-in tests of the emitted library. This does not claim existing Vitest-suite coverage. [Completion report](../../docs/benchmark/deepseek-probe-20261014/M03-COMPLETION.md) links exact operator acquisition/image qualification, oracle/workload inputs, SDK outcomes and retained failures.

For a separately selected reproduction, `python3 core/benchmark/deepseek-sdk-experiment/prepare_build.py <fresh-M03-case-directory>` creates exclusive workload/oracle outputs. Native oracle writes are intercepted into that new directory; the input is read only. Use a case directory whose basename begins M03- so the driver runs test and verify-before before Commit. Set the frozen plan.json image field to the exact qualified runtime image; run_checkpoint.py selects and records it as ISSUE323_IMAGE. The Rust setup uses that explicit image configuration. Build separately under the existing lock/target and invoke the one-case runner with a fresh empty operator volume. Do not repeat this passing case merely for cleaner evidence.

Node is downloaded/qualified as an explicit operator runtime and baked into an image before SDK create, not copied into a live Workspace. No package install/restoration runs during mount/Exec. Exact complete prepared project still goes through ProjectApi::init and SDK installation. Commands/verifiers retain15/9-second limits and the120-second outer ceiling. Earlier image/results remain at their original pins.

## Separate operation/native timing diagnostics

The independently registered issue323-op-native-diagnostic-v1 completed one observation per public SDK operation and three paired native/FUSE workloads. [Report](../../docs/benchmark/deepseek-probe-20261014/OPERATION-NATIVE-DIAGNOSTIC.md) retains raw values, cache INCOMPLETE/INELIGIBLE status, complete-command EXCEEDED and original setup/build failures; no ratio or performance PASS. New binary deepseek-sdk-measure (src/measure.rs) records direct public-call Instant spans and nested Exec spans; identical ordinary scripts select roots through ISSUE323_FS_ROOT. Native complete byte copy stays on a plain local volume beside the private Store and all application commands use WorkspaceApi::exec.

prepare_measurement.py creates the prospective workloads/oracle; run_measurement.py seals identities and runs once under the worktree lock with120s diagnostic test ceiling. Freeze plan.json image before invocation and prepare the independent immutable/native volume input through the declared operator image and SDK clone. Preparation does not substitute SDK installation. No unchanged resampling is authorized. Physical backing/cache/peak gaps remain explicit. Registration commit44760151c records production LOC79447→79447 (+0), same exact-snapshot counter; product tree unchanged.
