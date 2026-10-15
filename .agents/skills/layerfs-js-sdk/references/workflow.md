# Workflow

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill.

## Two ways to change files

| Route | How | Good for | History |
| --- | --- | --- | --- |
| Direct (`fs.*`) | Store calls on a Branch; no Workspace | Writing and editing source files, scaffolding, moves | Each call publishes one Commit; `fs.apply` publishes a batch as one |
| Workspace (`sandbox.*`) | Mount a Branch, run shell commands there, Commit | Anything a program does: install, build, test, format, codegen | `sandbox.commit` captures everything changed since the mount |

Use both: source edits go through `fs.*`, and commands go through a Workspace.

## The per-step loop (default)

One step = one coherent change that you verify. Mount a fresh Workspace for each step;
mounting is cheap and doesn't copy the tree.

1. **Edit.** `fs.apply(branch, changes, "cart: add line items")` for multi-file
   changes, or `fs.edit` for a one-line fix.
2. **Mount.** `sandbox.mount(id, branch)` sees the head you just published.
3. **Verify.** `sandbox.exec(id, path, "timeout 110 npm test", "cart tests")`. Read
   `exitCode`, `stdout` and `stderr`. If it fails, unmount with `{ discard: true }` (or
   commit what's useful), fix the source with `fs.*`, and repeat from step 2.
4. **Commit.** `sandbox.commit(id, path, { message: "cart: tests pass" })` captures what
   the commands produced: lockfile, `node_modules`, build output. The result `kind` is
   `Committed` or `UpToDate` (nothing changed, no new Commit).
5. **Unmount.** `sandbox.unmount(id, path)`. A Workspace with uncommitted changes
   refuses with `Dirty`; commit first or pass `{ discard: true }`.

Install dependencies once in a step of its own (`npm install`, then commit). Later
Workspaces mount with `node_modules` already in the Branch, so they don't reinstall.

## A long-lived Workspace (alternative)

You may keep one Workspace mounted across many steps and commit in it repeatedly.
That's useful for a slow `npm install` followed by several build/test rounds. Two rules:

- **It shows the head as of its mount.** `fs.*` writes to the same Branch are not
  visible in it. Its next `sandbox.commit` merges them in (see below), but tests you
  ran before that commit ran against the old files.
- **Edit inside it, through `exec`, while it's mounted**, if you need the change
  visible right away. Write files with a small Node one-liner rather than shell quoting
  (see [recipes](recipes.md#write-a-file-inside-a-workspace)).

When in doubt, use the per-step loop.

## When the Branch moved: merge on Commit

If the Branch head moved after the mount (an `fs.*` write, another Workspace's Commit),
`sandbox.commit` merges first:

- **Clean merge.** Returns `Committed` with `merged: { from, head }`. The Workspace now
  shows the merged result.
- **Conflict.** Refuses with `Conflict`. Markers are written into the conflicting files
  in the Workspace and nothing is committed. `detail.conflicts` lists the files. Resolve
  them inside the Workspace, then commit again. See
  [errors](errors.md#conflict-on-sandboxcommit).
- `{ force: true }` overwrites the newer head with the Workspace's view. Don't use it
  unless you mean to drop the other changes.

Check beforehand with `sandbox.status(id, path)`: `headMovedSinceMount` tells you
whether a merge will happen.

## Branches, merging and publishing

- **Fork per feature** if you like: `branch.fork("cart", "main")`. Keep one working
  Branch if the task is linear.
- **Merge Branches:** `branch.merge(a, b, "cart-checkout", message)` creates a new
  Branch `cart-checkout` with both. It can be a fast-forward (`fastForward: true`).
  A conflicting merge is refused with `Conflict` and creates nothing.
- **Publish to `main`:** `branch.publish(branch)` adds the Branch's head to `main` as a
  Layer. The result `kind` is `Added`, `UpToDate` or `NoChanges`. Publish at milestones:
  a feature that builds and passes its tests.
- **Look back:** `branch.list_commits(branch, 20, 0)` (newest first),
  `branch.diff_commits(a, b)`, `branch.diff_branches(a, b)`, `fs.blame(ref, path)`.

## Verifying the result

At the end, verify from a fresh Workspace on the published state, as a newcomer would:

1. `branch.fork("verify", "main")`.
2. Mount it and run, each as its own `exec`: install (if `node_modules` isn't committed),
   build, test, and a short server smoke test
   (see [recipes](recipes.md#smoke-test-a-server)).
3. Unmount with `{ discard: true }`. Verification creates no Commit.

## Finishing

Unmount every Workspace (commit or discard), then `sandbox.close(id)` for each Sandbox
you created. `close` refuses with `MountsActive` while anything is still mounted.
