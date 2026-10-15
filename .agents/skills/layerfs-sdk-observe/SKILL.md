---
name: layerfs-sdk-observe
description: Use when observing, measuring or troubleshooting a LayerFS run rather than doing the work itself. Activates on the LayerFS call trace (`LAYERFS_TRACE`, `LAYERFS_TRACE_STEP`), SDK operation timing and phase breakdowns, LayerFS storage deduplication and compression over history, `@layerfs/sdk/operator` (`store.stats`, `store.commits`, `files.history`, `workspace.overlay`, `process.*`), or LayerFS daemon logs and observation records.
---

# Observing a LayerFS run

> **Status:** Current general guide. For whoever watches or troubleshoots a LayerFS run
> (an orchestrator, a maintainer), not for an agent doing the work. Using the SDK is the
> separate [`layerfs-js-sdk`](../layerfs-js-sdk/SKILL.md) skill.

This skill uses internal surfaces: the `@layerfs/sdk/operator` entry point, the opt-in
call trace and the daemon's diagnostic records. None of them changes the project. Don't
hand them to an agent doing production work.

| Question | Source | Page |
| --- | --- | --- |
| How long did each SDK call take, and which phase was slow? | Call trace (`LAYERFS_TRACE`) with phase timing | [tracing](references/tracing.md) |
| Is storage deduplicating and compressing over a long history, or blowing up? | `operator.store.stats`, `operator.store.commits`, trace `sizes` | [storage metrics](references/storage-metrics.md) |
| What did the Store, SQLite, locks and FUSE do during a call? | Daemon records in `docker logs`, decoded and joined to the trace | [daemon logs](references/daemon-logs.md) |
| What does a Workspace hold uncommitted, what is a file's history, which background processes run? | Operator methods | [operator](references/operator.md) |

## Collecting a run

For an agent run you want to analyse afterwards:

1. Before the run, set `LAYERFS_TRACE=<run>/trace.jsonl` for every process. Ask the
   agent to set `LAYERFS_TRACE_STEP` on each command it runs.
2. Record identities: LayerFS commit, daemon binary, runtime image digest, addon build.
3. Snapshot `operator.store.stats()` at the start, every N Commits if you can, and at
   the end.
4. After the run, before closing the Sandboxes: page `operator.store.commits(branch)`
   for every Branch, and save `docker logs <container>` for every Sandbox (the container
   identifier is the Sandbox id without `sb_`).
5. Decode and join: see [daemon logs](references/daemon-logs.md). Build the per-step
   table: see [storage metrics](references/storage-metrics.md#one-row-per-step).

Treat every number as diagnostic: one run, tracing on, no cache control. It is not a
benchmark measurement.
