# Tracing and statistics

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. The trace
> section is a stub until issue #333 (G1) lands on `main`; the statistics section
> describes what exists in 0.1.7.

## Step labels and the call trace (stub, pending #333 G1)

Issue [#333](https://github.com/Ephemeral-AI-Lab/layerfs/issues/333) adds an opt-in
per-call trace to the SDK. Until it merges, these variables do nothing.

Planned use, to be confirmed against the merged implementation:

- `LAYERFS_TRACE=<file>`: the SDK appends one JSON line per call, with method, short
  argument summary, wall time, ok or refusal code, and the Commit id for calls that
  publish. The orchestrator sets this; don't change or delete the file.
- `LAYERFS_TRACE_STEP="<label>"`: set it on every step command, so each line carries
  your step name:
  ```bash
  LAYERFS_TRACE_STEP="012 cart: add tests" node steps/012-cart-tests.mjs
  ```
  Use the step script's number and a few words. Keep labels short and unique per step.

TODO after G1 merges: the exact field list, a sample line, the G2 `timing` and
`storage` fields, and the G3 decoder command.

## Store statistics (operator surface, exists today)

The operator entry is internal: use it to check storage, never to change the
project. The orchestrator collects these; you may read them to check a step.

```js
import { LayerFSOperator } from "@layerfs/sdk/operator";
const operator = new LayerFSOperator(layerfs);
const totals = await operator.store.stats();
// { logical, canonical, stored, metadata, file, free, dedupe, compression }
const recent = await operator.store.commits(branch, 20, 0);
// per Commit: logical, newCanonical, newStored, newMetadata (newest first)
```

| Term | Meaning |
| --- | --- |
| logical | Bytes of regular files as written, counted every place a file appears in history |
| canonical | Bytes of distinct stored objects, after content-addressed dedupe |
| stored | Bytes of pack bodies, after compression and delta encoding |
| metadata | Metadata pack bodies, plus SQLite space outside pack bodies |
| file / free | Committed database pages / reusable free pages, in bytes |
| dedupe | logical / canonical |
| compression | canonical / stored |

`operator.workspace.overlay(id, path)` and `operator.workspace.changes(id, path)` show
a mounted Workspace's uncommitted rows and changed paths.
