# Debug and trace

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. For whoever
> watches or troubleshoots a LayerFS run (an orchestrator, a maintainer), not for an
> agent doing production work: production use needs only the [usage pages](../../SKILL.md).

These pages use internal surfaces: the `@layerfs/sdk/operator` entry point, the opt-in
call trace and the daemon's diagnostic records. None of them changes the project. Don't
hand them to a production agent as tools.

| Question | Source | Page |
| --- | --- | --- |
| How long did each SDK call take, and which phase was slow? | Call trace (`LAYERFS_TRACE`) with phase timing | [tracing](tracing.md) |
| Is storage deduplicating and compressing over a long history, or blowing up? | `operator.store.stats`, `operator.store.commits`, trace `sizes` | [storage metrics](storage-metrics.md) |
| What did the Store, SQLite, locks and FUSE do during a call? | Daemon records in `docker logs`, decoded and joined to the trace | [daemon logs](daemon-logs.md) |
| What does a Workspace hold uncommitted, what is a file's history, which background processes run? | Operator methods | [operator](operator.md) |

## Collecting a run

For an agent run you want to analyse afterwards:

1. Before the run, set `LAYERFS_TRACE=<run>/trace.jsonl` for every process. Ask the
   agent to set `LAYERFS_TRACE_STEP` on each step command.
2. Record identities: LayerFS commit, daemon binary, runtime image digest, addon build.
3. Snapshot `operator.store.stats()` at the start, every N Commits if you can, and at
   the end.
4. After the run, before closing the Sandboxes: page `operator.store.commits(branch)`
   for every Branch, and save `docker logs <container>` for every Sandbox (the container
   name is the Sandbox id without `sb_`).
5. Decode and join: see [daemon logs](daemon-logs.md). Build the per-step table: see
   [storage metrics](storage-metrics.md#one-row-per-step).

Treat every number as diagnostic: one run, tracing on, no cache control. It is not a
benchmark measurement.
