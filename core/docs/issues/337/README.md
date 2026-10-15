# Issue #337 — Depot orchestration

> **Status:** Current planning checklist; no release candidate exists.

Owner objective: build the complete Rust Depot artifact registry through the
LayerFS JavaScript SDK, fix defects in Builder 1, and independently reconstruct
it with a fresh Builder 2. Application behavior is specified in [SPEC.md](SPEC.md).
Observed defects and guidance gaps are tracked in [BUGS.md](BUGS.md).

## Authority and identity

Issue [#337](https://github.com/Ephemeral-AI-Lab/layerfs/issues/337), collection
[#336](https://github.com/Ephemeral-AI-Lab/layerfs/issues/336), and the owner's
objective govern. Source begins at main `358e92cf74e55a4cbf38ea63a63eff2ca9aa2c22`
on `codex/issue337-depot-run` in its own worktree. No #334 application, Store,
mutated inputs or run scripts are reused.

Global Store: explicit Disposable / WAL / synchronous=OFF only.
Durable: **NOT_RUN — disabled by owner until explicit reauthorization**.
Construction: `LAYERFS_CONSTRUCTION_WORKERS=1`. Every command has an explicit
wall timeout <=120 seconds; Sandbox commands additionally contain an inner
timeout. Build test targets before executing them. No automatic retry.

## Phases

1. A: pin runtime/browser/toolchain/product/dependencies, initialize a tiny
   isolated probe, capture initial stats before mutation, exercise Cargo and
   SDK live, then freeze specification, fixture recipe and builder prompts.
2. B: one fixing builder owns all repository mutations/commits; completes
   M1–M6, branch exercises and fresh-Branch acceptance; preserves the Store.
3. C: rebuild committed product; new independent agent, standalone folder,
   fresh Store/volume/HOME/project/trace, same frozen specification and skill.
   A product blocker starts a new identified independent run after fixing.
4. D: collect histories, publication Layers, all daemon streams before close,
   initial/final stats, decoded joins, diagnostic timing/storage tables,
   checksummed raw evidence and verified stopped Store exports outside worktree.

Each run owns `core/target/issue337/<run>/`, a unique Docker volume,
`LAYERFS_HOME`, project name and trace. Init is a separate step and the very
next project observation is `operator.store.stats`. Save both daemon streams
before every Sandbox close, including the automatic service Sandbox.

All numerical observations are diagnostics with tracing enabled and unknown
OS cache state; no benchmark, release qualification or aggregate CI claim.
No repository push, PR or merge to main is authorized. Local campaign commits
require exact first-parent/staged-tree production LOC comparisons.

## Progress

- [x] Phase A frozen after live checks; see [PHASE-A.md](PHASE-A.md).
- [ ] Builder 1 complete.
- [ ] Fixed product rebuilt and independent environment installed.
- [ ] Builder 2 full fresh run complete.
- [ ] Results, exports and issue updates ready for owner closure review.

Frozen inputs: [FREEZE.json](FREEZE.json), [ENVIRONMENT.json](ENVIRONMENT.json),
[DEPENDENCIES.md](DEPENDENCIES.md), [ACCEPTANCE.md](ACCEPTANCE.md),
[FIXTURES.md](FIXTURES.md), [BUILDER-COMMON.md](BUILDER-COMMON.md) and
[BUILDER1.md](BUILDER1.md). No repository push/PR/main merge is authorized.
