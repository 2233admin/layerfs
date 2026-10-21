# Operator methods

> **Status:** Current general guide. Part of the `layerfs-sdk-observe` skill. Internal
> surface, for observation and troubleshooting only. Examples were captured live in issue #334
> Phase A at `b30e4fb8f`; raw replies remain in the phase run folder.

```js
import { LayerFS } from "@layerfs/sdk";
import { LayerFSOperator } from "@layerfs/sdk/operator";
const layerfs = new LayerFS("shop");
const operator = new LayerFSOperator(layerfs);
```

The public SDK refuses every `operator.*` name; only this entry point reaches them.
Store and file methods, and the history half of `inspect.snapshot`, read the Store in
this process. Workspace and process methods take a Sandbox id and a mount path.

## `operator.store.stats()`

Store totals. Terms are defined in [storage metrics](storage-metrics.md#sources).

**Returns:** `{ logical, canonical, stored, metadata, file, free, dedupe, compression, init }`.
Bytes are integers; `dedupe` and `compression` are numbers or `null`.
`init` is what Init imported and what it cost, recorded once when Init sealed the
Store: `{ entries, files, bytes, canonical, stored, metadata, millis }`. `files` counts
regular-file identities (hardlinks once) and `bytes` their size; `canonical`,
`stored` and `metadata` are the Store totals Init left; `millis` is Init's wall time.
It is `null` for a Store built before Init recorded it.

```json
{
  "logical": 101087,
  "canonical": 132603,
  "stored": 58521,
  "metadata": 251680,
  "file": 270336,
  "free": 0,
  "dedupe": 0.762328,
  "compression": 2.265905,
  "init": { "entries": 11, "files": 9, "bytes": 2012, "canonical": 8012, "stored": 4780, "metadata": 161720, "millis": 13 }
}
```

## `operator.store.commits(branch, pageSize?, pagePos?)`

Per-Commit size counters for a mutable Branch, newest first along first parents.
`main` is a Layer chain: this method refuses it with `NoSuchBranch`. Preserve that
refusal if collecting every name from `project.list_branches`; collect its
publication Layers through the final inspection snapshot instead.

**Returns:** a page whose items are `{ commit, logical, newCanonical, newStored,
newMetadata }`. `logical` is the Commit's whole tree; the `new*` counters are that
Commit's Save.

## `operator.files.stats(ref, path)`

One file's current size and revision count.

**Returns:** the file's `size`, cumulative revision `logical` bytes, `revisions` (exact up to 1000), `revisionsMore`
(true beyond that), and `canonical`, `stored`, `metadata` as `null`: per-file physical
bytes are not attributed.

## `operator.files.history(ref, path, pageSize?, pagePos?)`

A file's revisions, newest first.

**Returns:** a page; each item names the `commit` (or Layer) that changed the file and
its `message`. `newCanonical` and `newStored` are `null` (not attributed per file).

## `operator.workspace.overlay(id, path)`

What a mounted Workspace holds uncommitted.

**Returns**

| Field | Meaning |
| --- | --- |
| `inodes` | Changed inode rows |
| `entries` | Changed directory-entry rows |
| `payload` | Uncommitted file bytes stored, including validity masks |
| `metadataRows` | Inode, entry and operation-record rows together |
| `metadata` | `null` (no exclusive byte attribution) |
| `changes` | `{ added, modified, removed }` path counts |

## `operator.workspace.changes(id, path, pageSize?, pagePos?)`

The changed paths in a mounted Workspace, compared with its base.

**Returns:** a page; each item is `{ path, kind, markers }`, with `kind` one of
`Added`, `Modified`, `Removed`, and `markers: true` when the file still holds conflict
markers.

**Notes:** walks the namespace linearly; slow on huge trees.

## `operator.inspect.snapshot(since?)`

The read model the terminal UI draws: Branches, Workspaces, Sandboxes and Store
statistics, with a `version`. Pass the last `version` as `since` to get
`{ kind: "unchanged", version }` when nothing changed.

It starts no Sandbox. History comes from the Store in this process; Workspaces come
only from the client's Sandboxes that are running, including the project's service
Sandbox if one exists (`operator.sandbox.service()` returns its id, or `null`).
A known Sandbox whose container is gone or stopped is left out of `sandboxes` and
listed in `gone` as `{ id, detail }`.

## `operator.process.start(id, path, command)`

Starts a background command in a mounted Workspace. Owned by the native executor; the
filesystem daemon supervises nothing.

**Returns:** `{ kind: "running", process, command }`. Save `process` to cancel it.

## `operator.process.list(id)`

**Returns:** the Sandbox's background processes, each with its `id`, `path`,
`command` and `status` (`running` or `exited`, with `exitCode` when known).

## `operator.process.cancel(id, process)`

Stops a background process group. A cancelled process can leave one unreaped zombie
(a 0.1.7 limit).

**Refusals:** `NoSuchProcess`.

**Notes:** `sandbox.unmount` refuses with `Busy` while a background process started
here still runs in that Workspace.
