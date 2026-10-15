# Operator methods

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Internal
> surface, for observation and troubleshooting only. Fields are read from source on
> `main`; example outputs show the shape and are not yet captured from a live run.

```js
import { LayerFS } from "@layerfs/sdk";
import { LayerFSOperator } from "@layerfs/sdk/operator";
const layerfs = new LayerFS("shop");
const operator = new LayerFSOperator(layerfs);
```

The public SDK refuses every `operator.*` name; only this entry point reaches them.
Store and file methods go through the client's service Sandbox. Workspace and process
methods take a Sandbox id and a mount path.

## `operator.store.stats()`

Store totals. Terms are defined in [storage metrics](storage-metrics.md#sources).

**Returns:** `{ logical, canonical, stored, metadata, file, free, dedupe, compression }`.
Bytes are integers; `dedupe` and `compression` are numbers or `null`.

```json
{ "logical": 412880311, "canonical": 61203377, "stored": 18800412, "metadata": 4210688, "file": 24117248, "free": 1036288, "dedupe": 6.746, "compression": 3.255 }
```

## `operator.store.commits(branch, pageSize?, pagePos?)`

Per-Commit size counters, newest first along first parents.

**Returns:** a page whose items are `{ commit, logical, newCanonical, newStored,
newMetadata }`. `logical` is the Commit's whole tree; the `new*` counters are that
Commit's Save.

## `operator.files.stats(ref, path)`

One file's current size and revision count.

**Returns:** the file's size and type, `revisions` (exact up to 1000), `revisionsMore`
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
`{ unchanged: true }` when nothing changed.

## `operator.process.start(id, path, command)`

Starts a background command in a mounted Workspace. Owned by the native executor; the
filesystem daemon supervises nothing.

**Returns:** `{ kind: "running", process, command }`. Save `process` to cancel it.

## `operator.process.list(id)`

**Returns:** the Sandbox's background processes, each with its `process` id, `path`,
`command` and `status` (`running` or `exited`, with `exitCode` when known).

## `operator.process.cancel(id, process)`

Stops a background process group. A cancelled process can leave one unreaped zombie
(a 0.1.7 limit).

**Refusals:** `NoSuchProcess`.

**Notes:** `sandbox.unmount` refuses with `Busy` while a background process started
here still runs in that Workspace.
