# project methods

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Fields are
> read from source on `main`; example outputs show the shape and are not yet captured
> from a live run. Ids are 66 hex characters, shortened here as `"9f3c…"`.

Examples use `layerfs` as connected in [SKILL.md](../../SKILL.md#connect-to-a-project).

## `project.init(sourcePath)`

Creates the project: copies a host folder into a new Store, once. Afterwards the files
live only in LayerFS.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `sourcePath` | string | yes | Host folder to copy. Everything in it is imported, including `.git` and ignored files |

The project name comes from `new LayerFS(name)`: 1–63 characters from `a-z`, `0-9`,
`_`, `-`, `.`, starting and ending with a letter or digit. A bad name throws
`InvalidInput` from the constructor.

**Returns:** `{ kind: "Initialized", project, layer, … }`, where `layer` is `main`'s
first Layer.

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `Exists` | This `LAYERFS_HOME` already has the project | Don't init again: the project is ready to use |
| `InvalidInput` | Bad path or name | Use an absolute folder path |
| `Unknown`, `Failed` | Init is uncertain or failed | Stop and report |

**Start from a small skeleton** (shell): a folder with a `README.md` and a `.git/HEAD`,
the shape the SDK's own test harness uses.

```bash
mkdir -p /work/shop-skeleton/.git
printf 'ref: refs/heads/main\n' > /work/shop-skeleton/.git/HEAD
printf '# Shop\n' > /work/shop-skeleton/README.md
```

```js
const r = await layerfs.project.init("/work/shop-skeleton");
console.log(r.kind, r.layer);
```
```json
{ "kind": "Initialized", "project": "shop", "layer": "41ab…" }
```

**Notes:** run it once per project. Later processes with the same `LAYERFS_HOME` find
the project without it; `fs.*` and `branch.*` calls work right away.

## `project.list_branches(pageSize?, pagePos?)`

Lists the project's Branches, including `main`.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `pageSize` | number | no | 1–1000, default 50 |
| `pagePos` | number | no | Offset, default 0 |

**Returns:** a page `{ items, hasMore, nextPagePos }`. Each item:

| Field | Meaning |
| --- | --- |
| `name` | Branch name |
| `id` | Branch id |
| `base` | The `main` Layer it's based on |
| `head` | Newest Commit, or `null` before its first Commit |
| `forkedFrom` | The node it was forked from, or `null` |

**Refusals:** `NoSuchProject` (wrong name, or `init` not run with this `LAYERFS_HOME`),
`InvalidInput`.

```js
const page = await layerfs.project.list_branches();
const exists = page.items.some((b) => b.name === "cart");
```
```json
{ "items": [{ "name": "cart", "id": "07d2…", "base": "41ab…", "head": "9f3c…", "forkedFrom": "41ab…" }], "hasMore": false, "nextPagePos": null }
```
