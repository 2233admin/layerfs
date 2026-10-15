# fs read methods

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Fields are
> read from source on `main`; example outputs show the shape and are not yet captured
> from a live run. Ids are 66 hex characters, shortened here as `"9f3c…"`.

Examples use `layerfs` as connected in [SKILL.md](../../SKILL.md#connect-to-a-project) and work on the Branch
`"work"`.

**Shared rules**

- `ref` is `main`, a Branch name, a Commit id or a Layer id. Paths are absolute
  (`/src/cart.js`).
- Reads see committed state only: what a Branch or Commit holds, never a mounted
  Workspace's uncommitted changes. Look inside a Workspace with `sandbox.exec`.
- Single-file answers start with `{ kind: "ok", snapshot, root, path }`; `snapshot`
  labels the state that was read, such as `"work@9f3c0a1b2c4d"`.

**Pages.** `list`, `grep`, `glob` (and `branch.list_commits`, the diffs and
`project.list_branches`) return `{ items, hasMore, nextPagePos }`. `pageSize` is 1–1000,
default 50; `pagePos` defaults to 0. A page can be shorter than `pageSize` when it hits
its byte bound; that never means the end while `hasMore` is true. Deep offsets skip
linearly, so narrow the path or pattern rather than paging far.

```js
const all = [];
for (let pos = 0; ; ) {
  const page = await layerfs.fs.glob("work", "src/**/*.js", "/", 1000, pos);
  all.push(...page.items);
  if (!page.hasMore) break;
  pos += page.items.length;
}
```

**Shared refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `NoSuchPath` | The path doesn't exist in that ref | `fs.list` the parent |
| `NoSuchBranch`, `NoSuchCommit` | Wrong ref | `project.list_branches`, `branch.list_commits` |
| `InvalidInput` | Bad argument: page bounds, line numbers, a relative path | Read `message` |

## `fs.read(ref, path, startLine?, endLine?)`

Reads a line range of a text file.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `ref` | string | yes | What to read from |
| `path` | string | yes | A regular file |
| `startLine` | number | no | 1-based, default 1 |
| `endLine` | number | no | Inclusive; default: the end of the file |

**Returns**

| Field | Meaning |
| --- | --- |
| `text` | The lines, with their line endings |
| `startLine`, `endLine` | First and last line returned (`endLine` is `null` if none) |
| `truncated` | True if more lines remain in the range, or a line was cut |
| `lineTruncated` | True if a single huge line was cut to a prefix |
| `nextLine` | Where the next window starts, or `null` |
| `size` | File size in bytes |

**Limits:** one answer holds at most 2000 lines and 48 KiB. A huge single line comes
back as a prefix; the rest of that line can't be read with `fs.read` (use `sandbox.exec`).

**Refusals:** `IsDirectory`, `NotText` (binary: inspect it with `sandbox.exec`), plus
the shared ones.

```js
const r = await layerfs.fs.read("work", "/src/cart.js", 1, 40);
```
```json
{ "kind": "ok", "snapshot": "work@9f3c0a1b2c4d", "root": "5a07…", "path": "/src/cart.js", "text": "export class Cart {\n…", "startLine": 1, "endLine": 40, "lineTruncated": false, "truncated": true, "nextLine": 41, "size": 3812 }
```

**Read a whole file, window by window**

```js
let line = 1, text = "";
for (;;) {
  const r = await layerfs.fs.read("work", "/src/cart.js", line);
  text += r.text;
  if (r.nextLine == null) break;
  line = r.nextLine;
}
```

## `fs.list(ref, path?, pageSize?, pagePos?)`

Lists one folder.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `path` | string | no | Folder, default `/` |

**Returns:** a page; each item is `{ name, type, inode, size }` with `type` one of
`file`, `dir`, `symlink`. Names are in byte order.

**Refusals:** `NotDirectory`, plus the shared ones.

```js
const page = await layerfs.fs.list("work", "/src");
```
```json
{ "items": [{ "name": "cart.js", "type": "file", "inode": 41, "size": 3812 }, { "name": "routes", "type": "dir", "inode": 42, "size": 0 }], "hasMore": false, "nextPagePos": null }
```

## `fs.stat(ref, path)`

Describes one path.

**Returns:** `{ kind: "ok", snapshot, root, path, type, inode, size }`.

```js
const exists = await layerfs.fs.stat("work", "/package.json").then(() => true, (e) => { if (isRefusal(e, "NoSuchPath")) return false; throw e; });
```

## `fs.grep(ref, pattern, path?, pageSize?, pagePos?)`

Finds lines that contain `pattern` in every text file under `path`.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `pattern` | string | yes | Plain text, matched as bytes. **Not a regular expression.** Not empty |
| `path` | string | no | Folder or file to search, default `/` |

**Returns:** a page; each item is `{ path, line, text, lineTruncated }`. `skipped`
counts binary files passed over. Items come in path order, then line order.

```js
const hits = await layerfs.fs.grep("work", "TODO", "/src");
```
```json
{ "items": [{ "path": "/src/cart.js", "line": 88, "text": "  // TODO: tax rounding\n", "lineTruncated": false }], "skipped": 0, "hasMore": false, "nextPagePos": null }
```

**Notes:** searches everything under `path`, `node_modules` included. Keep `path` narrow.
For regular expressions, run `grep -rn` with `sandbox.exec` in a Workspace.

## `fs.glob(ref, pattern, path?, pageSize?, pagePos?)`

Finds paths matching a glob pattern.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `pattern` | string | yes | `*` and `?` match within one name; `**` spans folders |
| `path` | string | no | Where to search, default `/` |

**Returns:** a page whose `items` are absolute path strings.

```js
const tests = await layerfs.fs.glob("work", "test/**/*.test.js", "/");
```
```json
{ "items": ["/test/cart.test.js", "/test/routes/cart-api.test.js"], "hasMore": false, "nextPagePos": null }
```

## `fs.diff_files(leftRef, leftPath, rightRef, rightPath)`

Compares two files, from any refs and paths.

**Returns**

| Field | Meaning |
| --- | --- |
| `kind` | `"Text"` (line diff in `hunks`), `"Equal"` or `"Binary"` |
| `left`, `right` | Each side's ref, path and inode |
| `contentEqual` | True if the bytes are identical |
| `sameInode` | True if both sides are the same file identity |
| `hunks` | Lines as `{ op, text }`, where `op` is `" "`, `"-"` or `"+"` |
| `hunksOmitted` | True if the diff was too large to return |

```js
const d = await layerfs.fs.diff_files("main", "/src/cart.js", "work", "/src/cart.js");
console.log(d.hunks.filter((h) => h.op !== " ").map((h) => h.op + h.text).join(""));
```
```json
{ "kind": "Text", "contentEqual": false, "sameInode": true, "hunksOmitted": false, "hunks": [{ "op": "-", "text": "const TAX = 0.07;\n" }, { "op": "+", "text": "const TAX = 0.08;\n" }], "left": { "…": "…" }, "right": { "…": "…" } }
```

## `fs.blame(ref, path, fromLine?)`

Shows which Commit last changed each line.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `fromLine` | number | no | First line, default 1 |

**Returns:** `lines`, each `{ n, text, lineTruncated, commit, message }`; `versions`
(how many file versions were compared); `comparisonCoarse` (true when a large change
was reported as one removed/added block).

```js
const b = await layerfs.fs.blame("work", "/src/cart.js", 80);
```
```json
{ "lines": [{ "n": 80, "text": "  total() {", "lineTruncated": false, "commit": "9f3c…", "message": "cart: totals" }], "versions": 4, "comparisonCoarse": false }
```
