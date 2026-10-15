# LayerFS 0.1.7 manual

> **Status:** Released for LayerFS 0.1.7.

This is the versioned manual for LayerFS 0.1.7. The release is source-only. The
[GitHub release](https://github.com/Ephemeral-AI-Lab/layerfs/releases/tag/v0.1.7)
carries the tagged source. No npm package, prebuilt executable or public runtime
image is published.

## What 0.1.7 is

LayerFS gives programs versioned Workspaces over one shared Store: fork a
Branch, edit its files directly or in a mounted Workspace where ordinary commands
run, Commit, merge, and publish to `main`.

0.1.7 is a new implementation and a new public surface:

- **A rewritten core.** The `core/` workspace replaces the v0.1.6 implementation.
  The v0.1.6 source is retired from `main` and recoverable at tag
  `reference-v0.1.6-final`.
- **One shared Store, opened directly by every daemon.** The host runs project
  Init, installs one Store file into a Docker volume that all the project's
  Sandbox daemons share, and afterwards only controls them.
- **Per-Workspace overlays.** Each mounted Workspace keeps its uncommitted state
  in its own overlay. Commit captures the published frontier, and merges first
  when the Branch head has moved since the mount. A conflict writes markers into
  the Workspace and commits nothing.
- **A JavaScript SDK.** `@layerfs/sdk` has 29 positional methods in four groups:
  `project`, `fs`, `branch` and `sandbox`. An internal `@layerfs/sdk/operator`
  entry adds Store statistics, file history, Workspace overlays, background
  processes and the read model.
- **A terminal UI.** `sdk_sim/tui.html` runs four demo stories, either in an
  in-page simulator or live on the product.

## Contents

1. [SDK and terminal UI guide](sdk-and-ui.md): setup, concepts, methods,
   operator surface, the UI, tests and limits.
2. [SDK reference](sdk-reference.md): exact signatures, bounds, paging, read
   limits, statistics definitions and build notes.
3. [Release record, compatibility and waivers](../../../release-notes/0.1.7/README.md).

## Compatibility

0.1.7 is an owner-approved exception to the 0.1.x patch-line promise in the
[release policy](../../general/release-policy.md). It does not preserve the
v0.1.6 surface:

- **Removed.** The v0.1.6 CLI and the public Rust SDK are removed. The public
  surface is the JavaScript SDK.
- **Store format.** New Stores use schema versions 16–18 (pack layouts) or 22–24
  (with the acquisition tables), with Commit identity `layerfs/commit/v3`. Every
  older Store, including the v0.1.6 schema-10 Stores, is refused without
  migration. Create a fresh project.
- **Version matching.** The daemon protocol changed. Use the SDK, addon and
  daemon from the same tagged source.
- **Store profile.** Only the Disposable profile (WAL, `synchronous=OFF`) runs.
  The Durable profile compiles but is not executed until the owner reauthorizes
  it.

Recovery after a daemon or container restart, and replay of an uncertain
operation, are not supported. See the [known limits](sdk-and-ui.md#7-known-limits).
