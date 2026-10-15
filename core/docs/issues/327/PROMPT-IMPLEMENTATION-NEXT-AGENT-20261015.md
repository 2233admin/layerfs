# Prompt for the next #327 agent: implement the SDK standard and the operator surface

> **Status:** Dated handoff prompt (2026-10-15). It is not release evidence or a
> product contract, and it assigns work only when the owner sends it. Root and
> core `AGENTS.md` and the owner's recorded decisions govern where they differ.

You are taking over issue #327 in the worktree
`/Users/yifanxu/Ephemeral-AI-Lab/layerfs-issue327`, on branch
`issue327-sdk-redesign`. That branch is local and not pushed. The previous agent
stopped at the commit that adds this prompt, which follows `daacdb13c`.

The goal is to bring the JS SDK and the layers beneath it to the revised public
standard (#328). The standard is 29 positional methods in four groups:
- no `agent`, `call` or harness;
- messages on writes;
- `pageSize` and `pagePos` paging;
- line-range reads;
- Sandbox ids usable across processes.

The work also adds an internal operator surface for the UI: Store and per-Commit
sizes, per-file history, Workspace overlay and changes, process control and the
read model. Then it moves the live UI onto both.

## Where things stand

- **Phases 1–3 are done.**
  - The JS SDK runs on the real daemon through the napi addon.
  - Commit-time merge and conflicts work, and staging is gone.
  - The simulator UI runs live through `sdk_sim/server/` (D1–D6 PASS at `725c34c6d`).
- **UI previews.** Commits 22–24 preview the timer, the Store and overlay footers, and per-file statistics. They are UI only: no product surface reports stored bytes or metadata yet.
- **Not decided.** Nothing in the plan below has owner decisions yet. Issue #329 holds the questions.
- **Open.** VERIFICATION A9, a second process controlling a Sandbox, is still open.

## Read first, in this order

1. Root [AGENTS.md](../../../../AGENTS.md) and [core/AGENTS.md](../../../AGENTS.md),
   including "Checks and completion".
2. [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md): the public SDK, the operator
   surface and where it lives, the statistics definitions, the layouts with LOC,
   the remaining work, the blocking decisions and the order.
3. The [SDK standard](https://github.com/Ephemeral-AI-Lab/layerfs/blob/5321d6de320dcbd41402db9cb41aa36bceabdf4c/core/docs/issues/327/SDK-STANDARD.md)
   (branch `docs/issue327-sdk-standard`, `5321d6de3`; read it with
   `git show 5321d6de3:core/docs/issues/327/SDK-STANDARD.md`), and issues
   [#328](https://github.com/Ephemeral-AI-Lab/layerfs/issues/328) and
   [#329](https://github.com/Ephemeral-AI-Lab/layerfs/issues/329).
4. [PHASE2.md](PHASE2.md) and [PHASE3.md](PHASE3.md): what was verified, the
   deviations, the defects and the open owner items.
5. [SPEC.md](SPEC.md) for architecture and UI integration, and
   [VERIFICATION.md](VERIFICATION.md), which has to be migrated to the standard.

## Decisions you need from the owner

Ask for these before the work that depends on them. Do not decide them yourself.
- **#329 A1:** messages and Commit identity.
- **#329 A2:** bounded reads, and whether 0.1.7 has a byte read.
- **#329 A5:** offset paging and indexes for deep positions.
- **#329 A6:** reopening projects and Sandboxes from another process.
- **The Store version question:** a new record and identity version (for example
  `layerfs/commit/v3`) with no migration of old Disposable Stores, or a migration.

## What you can start now

These need no decision:
1. **A read-only written investigation of A6:**
   - how a second Node process could reach a running Sandbox daemon's control channel;
   - what has to be persisted;
   - what authorizes it;
   - what happens to the per-process service Sandbox and the process records in `sdk/js/native/src/exec.rs`.
   
   Write it in `core/docs/issues/327/` with a status banner. It is research, not capability.
2. **The Phase 2 cleanups** (plan section 6, item 4):
   - the registry references to the deleted `shared_processes` test;
   - the benchmark harness tests that still call `stage_and_commit`.
   
   Bring the reaping and replaced-inode items to the owner. Do not just pick a fix.
3. **Packaging** (item 5):
   - the constructor's environment variables;
   - addon builds for macOS and Linux;
   - `package.json` exports for `./operator`.

Then follow the plan's order:
1. the Store migration;
2. the public API (A2, A5);
3. `status` and the operator;
4. cross-process;
5. per-file history;
6. the UI server and the VERIFICATION migration;
7. the live D stories again.

## Rules for this work

- **Store profile and construction.**
  - Disposable / WAL / `synchronous=OFF` only, explicitly selected. Durable is NOT_RUN: disabled by the owner until explicit reauthorization. It may compile.
  - `LAYERFS_CONSTRUCTION_WORKERS=1` for every Commit and capture measurement.
- **Tests.**
  - Build first (`--no-run`).
  - Every test or verification command has an explicit wall timeout of at most 120 s. macOS has no `timeout`, so use a wrapper that kills the process group at the limit.
  - One command per case. No loops, no backgrounding, no filtering of test output, no retries.
  - A timeout is a failed hang: diagnose it before any rerun.
  - Host cargo is `+1.85.1`.
- **Failures.** One attempted operation, with no automatic retry or replay. Keep each failure as it happened.
- **Layering.**
  - Operator methods never become public. The public `call()` refuses `operator.*` names at every layer.
  - Process control stays with the Sandbox executor in the binding. The filesystem daemon supervises no commands.
  - HTTP exists only in the demo server.
  - Do not revive `layerfs-server` or add a host or server data path.
- **Dependencies and file sizes.**
  - No new dependency without owner approval. Never edit third-party code.
  - Production files stay at most 999 lines, and `lib.rs`/`mod.rs` at most 200.
- **Deleted features.** Delete tests of removed features outright: harness, `agent`/`call`, `remove`, public `inspect`. Convert only tests of behaviour that survives. Keep historical receipts and verdicts.
- **Counters.** They run inside the publication transaction. Screen both speed and storage under the measurement policy before keeping them.
- **Commits.** Every commit message carries `Production LOC: <before> -> <after> (delta <signed>)` with the scope and the method:
  - `tools/production_loc.py`, comparing the parent with the staged tree;
  - core and sdk subtotals;
  - `reference absent (retired R9c; last counted 65,417 at tree 498dd1917812)`.
  
  The baseline at `daacdb13c` is 84,814: core 83,668 and sdk 1,146. `sdk_sim`, tests and fixtures are outside the scope.
- **Owner's resources.** Do not push or open a PR unless the owner asks. Do not add untracked files to the main checkout at `/Users/yifanxu/Ephemeral-AI-Lab/layerfs`. Do not touch other owners' containers or volumes.

## Mechanics

- **Live UI.**
  - Start it with `node sdk_sim/server/server.mjs 8327` (127.0.0.1), then open `tui.html?backend=live`.
  - Stopping the server closes the project and removes its volume.
  - A browser console check needs a fresh tab.
- **D stories.** Run one story per command, each under the 120 s cap:
  ```bash
  node sdk_sim/test_live.js <tour|conflicts|merge|agents>
  ```
  Receipts go under `core/target/issue327/verify/`. Commit before final runs, because receipts record the commit.
- **Simulator suites:** `node sdk_sim/test.js`, `test_demo.js` and `test_terminal.js`.
- **Builds.** The Linux daemon is `core/target/issue327/layerfs-daemon` and the addon is `sdk/js/native/layerfs.node`. PHASE2's identity table records their hashes and the pinned build image. Rebuild them after any core or binding change, and record the new hashes.

## Hand back

When you stop, write a dated checkpoint in `core/docs/issues/327/` in PHASE3's style:
- identity (commit, binaries, profile);
- what changed;
- every check, with its command and result, including failures and checks not run;
- the decisions taken, quoted from the owner;
- the open items;
- each commit's production LOC line.

Update the plan's layouts with LOC for the commit you stop at. Say plainly what was not verified.
