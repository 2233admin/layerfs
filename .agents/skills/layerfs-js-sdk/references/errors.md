# Refusals and what to do

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill.

A refused call throws a `LayerFSError` with `code` (stable; decide on this),
`message` (for people) and `detail` (structured). Nothing is retried for you, and you
don't retry blindly either: read the code, inspect if needed, then decide. Issuing a
corrected call after a definite refusal is a new decision, not a retry.

An `exec` whose command fails is **not** a refusal: it returns normally with a
non-zero `exitCode`.

## Codes you'll meet

| Code | Typical cause | What to do |
| --- | --- | --- |
| `Conflict` | `sandbox.commit` after the Branch moved, with overlapping changes; or `branch.merge` of conflicting Branches | See [below](#conflict-on-sandboxcommit). For `branch.merge`, nothing was created: reconcile the files on one Branch with `fs.*`, then merge again |
| `Dirty` | `sandbox.unmount` with uncommitted changes | `detail.changed` lists paths. Commit them, or unmount with `{ discard: true }` |
| `Busy` | Another operation on the same Sandbox or discovery record is still running (often a second `node` process), or a background process still runs in the Workspace | Don't run two step scripts against one Sandbox at once. Wait for the other process to finish, then decide |
| `HeadMoved` | Another writer published on the Branch during your `fs.*` call or publish | Nothing was published. Re-read the files you changed, then decide whether to apply your change again |
| `MountsActive` | `sandbox.close` while Workspaces are mounted | Unmount them first |
| `NotMounted` | `exec`, `status`, `commit` or `unmount` with a path that isn't mounted in that Sandbox | Use the `path` from `sandbox.mount`, saved in `state.json` |
| `NoSuchSandbox` | Wrong or closed Sandbox id, or a different `LAYERFS_HOME` | Check `LAYERFS_HOME` and `state.json`; don't create a replacement silently |
| `NoSuchPath`, `IsDirectory`, `NotDirectory` | Wrong path or type | `fs.list` / `fs.stat` the parent and fix the path |
| `NoMatch`, `AmbiguousMatch` | `fs.edit` found the text zero or several times | `fs.read` the file, then use a longer, unique `oldText`, or `fs.write` the whole file |
| `Exists`, `NotEmpty` | `cp`/`mv` onto an existing destination; removing or replacing a non-empty folder | Choose a new destination, or `fs.rm` first (`rm` is recursive) |
| `NameTaken`, `ReservedName` | `branch.fork`/`merge` with a name in use, or `main` | Pick another Branch name |
| `ReadOnly` | An `fs.*` write on `main` | Write on your Branch and `branch.publish` it |
| `NoSuchBranch`, `NoSuchCommit`, `NoSuchProject` | Wrong ref or project name, or `init` not run | `project.list_branches` / `branch.list_commits` to find the right one |
| `NotText` | Reading, grepping or blaming binary content | Use `exec` (for example `file`, `xxd | head`) inside a Workspace |
| `TooLarge` | A value beyond a frame or message bound | Split the work: smaller `apply` batches, shorter messages, line windows |
| `InvalidInput` | Bad argument: page size, message bytes, a same-path `mv`/`cp`, … | Read `message`; fix the call |
| `Unknown`, `Failed` | The outcome is uncertain, or an internal failure | **Stop.** Don't resend. Inspect with `branch.list_commits` and `fs.read` to see what happened, record it in your log, and report it. Continue only if the state is clear |

`CODES` (exported by the SDK) lists the codes callers are expected to handle;
`Unknown` and `Failed` are deliberately not in it.

## Conflict on `sandbox.commit`

The Branch moved since the mount, and the merge found overlapping changes:

1. Nothing was committed. Markers were written into the conflicting files **in the
   Workspace**. `detail.conflicts` lists them; `detail.written` lists the paths the merge
   changed in the Workspace.
2. The markers are Git-style: `<<<<<<< `, `=======`, `>>>>>>> `. Look at each file inside
   the Workspace: `exec(id, path, "grep -n -e '^<<<<<<< ' -e '^>>>>>>> ' src/cart.js")`
   or `cat` it.
3. Resolve each file **inside the Workspace**, with
   [a Node one-liner through `exec`](recipes.md#write-a-file-inside-a-workspace).
   `fs.*` writes go to the Branch, not to this Workspace.
4. Commit again. While any file still contains markers, Commit refuses with `Conflict`
   and `detail.markers: true`.

To give up on the Workspace's changes: `sandbox.unmount(id, path, { discard: true })`,
then mount the current head fresh.

## Things that are not errors

- `kind: "UpToDate"` from `fs.*` or `sandbox.commit`: nothing changed, so no Commit was
  made.
- `kind: "NoChanges"` or `"UpToDate"` from `branch.publish`: `main` already has it.
- `truncated: true` on `exec`: the output went beyond 1 MiB per stream. The command
  still ran to completion; redirect its output to a file in `/tmp` and read the tail.
