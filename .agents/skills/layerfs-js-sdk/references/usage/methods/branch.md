# branch methods

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Fields are
> read from source on `main`; example outputs show the shape and are not yet captured
> from a live run. Ids are 66 hex characters, shortened here as `"9f3c…"`.

Snippets are the `// the step` part of the
[script template](../scripts.md#3-the-step-script-template). Paging works as described
in [fs reads](fs-read.md).

## `branch.fork(name, fromRef?)`

Creates a Branch. Metadata only: nothing is copied, so it's instant.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `name` | string | yes | New Branch name |
| `fromRef` | string | no | `main` (default), a Branch, a Commit or a Layer |

**Returns:** `{ kind: "Forked", branch, base, head }`. `head` is `null` until the
first Commit.

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `NameTaken` | A Branch with that name exists | Use it, or pick another name |
| `ReservedName` | The name is `main` | Pick another name |
| `NoSuchBranch`, `NoSuchCommit` | `fromRef` doesn't exist | Check it with `project.list_branches` |

```js
await layerfs.branch.fork("cart");
state.branch = "cart"; save();
```
```json
{ "kind": "Forked", "branch": "cart", "base": "41ab…", "head": null }
```

**Notes:** one working Branch is enough for linear work. Fork per feature when work
runs in parallel, and fork a throwaway Branch from `main` to verify a release.

## `branch.list_commits(branch, pageSize?, pagePos?)`

Lists a Branch's Commits, newest first, along first parents.

**Returns:** a page `{ items, hasMore, nextPagePos }`. Each item is a Commit record:

| Field | Meaning |
| --- | --- |
| `id` | Commit id |
| `branch` | Branch name |
| `parent`, `secondParent` | Parents (`secondParent` only for merges) |
| `base` | `main` Layer underneath |
| `root` | Filesystem root id |
| `message` | Commit message |
| `mergedFrom` | Merge source, for merge Commits |
| `time` | Commit time |

```js
const log = await layerfs.branch.list_commits(state.branch, 10, 0);
console.log(log.items.map((c) => `${c.id.slice(0, 12)} ${c.message}`).join("\n"));
```

**Notes:** after an uncertain outcome (`Unknown`, `Failed`), this is how you check
whether a Commit happened.

## `branch.diff_commits(from, to, pageSize?, pagePos?)`

Lists what changed between two Commits (ids, not Branch names; use `diff_branches` for
those).

**Returns:** `{ kind: "ok", from, to, items, hasMore, nextPagePos }`. Each item:

| Field | Meaning |
| --- | --- |
| `path` | Changed path |
| `kind` | `"Added"`, `"Removed"` or `"Modified"` |
| `type` | `file`, `dir` or `symlink` |
| `before`, `after` | `{ type, inode }` or `null` |
| `content`, `metadata`, `identity` | What changed: bytes, mode/attributes, file identity |
| `hunks`, `hunksOmitted` | Line diff for text files, as in `fs.diff_files` |

**Refusals:** `InvalidInput` (not two Commits), `NoSuchCommit`.

```js
const [newest, previous] = (await layerfs.branch.list_commits(state.branch, 2, 0)).items;
const d = await layerfs.branch.diff_commits(previous.id, newest.id);
console.log(d.items.map((c) => `${c.kind} ${c.path}`).join("\n"));
```

## `branch.diff_branches(from, to, pageSize?, pagePos?)`

Same as `diff_commits`, between the current heads of two Branches or `main`.

**Refusals:** `InvalidInput` (a Commit id instead of a Branch), `NoSuchBranch`.

```js
const d = await layerfs.branch.diff_branches("main", state.branch);
console.log(`${d.items.length}${d.hasMore ? "+" : ""} paths differ from main`);
```

## `branch.merge(a, b, name, message?)`

Merges Branches `a` and `b` into a **new** Branch `name`. `a` and `b` don't change.

**Returns:** `{ kind: "Merged", fastForward, branch, head, root, sources, mergeBase,
conflicts: [], lww }`. `fastForward: true` means one side already contained the other.
`lww` lists files decided last-writer-wins, each `{ path, kept, ours, theirs, deleted,
rule }`.

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `Conflict` | Overlapping changes; nothing was created. `detail.conflicts` lists `{ path, kind, blocks, hunks }` | Make the files agree on one Branch with `fs.*`, then merge again; or mount one side, commit a resolution there, then merge |
| `NoMergeBase` | The Branches share no history | Fork from a common ref |
| `NameTaken` | `name` exists | Pick a new name |
| `NoSuchBranch` | `a` or `b` doesn't exist | Check the names |

```js
try {
  const m = await layerfs.branch.merge(state.branch, "main", `${state.branch}-on-main`, "merge main in");
  state.branch = m.branch; save();
  done({ branch: m.branch, fastForward: m.fastForward });
} catch (error) {
  if (!isRefusal(error, "Conflict")) throw error;
  console.log(JSON.stringify({ ok: false, code: "Conflict", files: error.detail.conflicts.map((c) => c.path) }));
  process.exit(1);
}
```

## `branch.publish(branch, commit?)`

Makes `main` show the Branch's head, or the given Commit, by adding a Layer to `main`.

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `branch` | string | yes | The Branch to publish |
| `commit` | string | no | A Commit on it; default its head |

**Returns**

| `kind` | Meaning |
| --- | --- |
| `"Added"` | `main` now shows that Commit. `publishedLayer` is the new Layer; `overwrote` lists `main` Layers that were skipped |
| `"UpToDate"` | `main` already shows it |
| `"NoChanges"` | Nothing to publish |

**Refusals**

| Code | Meaning | Do |
| --- | --- | --- |
| `NoCommit` | The Branch has no Commit yet | Commit something first |
| `HeadMoved` | `main` moved during the call | Merge `main` in (below), then publish again |
| `InvalidInput` | A Layer id instead of a Commit | Pass a Commit id |

**Publishing replaces `main`'s view** with your Commit. Layers published to `main` after
your Branch's base that your Commit doesn't contain are skipped: they stay in history,
and `overwrote` lists them. If someone else may have published since you forked, merge
`main` in first, check the result, then publish the merged Branch:

```js
const m = await layerfs.branch.merge(state.branch, "main", `${state.branch}-release`, "merge main before publish");
// mount m.branch and run the tests here, then:
const p = await layerfs.branch.publish(m.branch);
if (p.kind === "Added" && p.overwrote.length) console.log("warning: skipped", p.overwrote);
done({ kind: p.kind, branch: m.branch });
```
