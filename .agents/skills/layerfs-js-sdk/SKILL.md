---
name: layerfs-js-sdk
description: Use when building, editing, testing or inspecting a project through LayerFS with the JavaScript SDK (`@layerfs/sdk`) from the command line. Activates on LayerFS Branches, Commits, Workspaces or Sandboxes; `layerfs.fs.*`, `layerfs.branch.*` or `layerfs.sandbox.*` calls; running npm install, build or tests inside a mounted Workspace; resolving LayerFS Conflict, Dirty or Busy refusals; or reading LayerFS Store statistics and traces.
---

# LayerFS JavaScript SDK

> **Status:** Current general guide. It describes LayerFS 0.1.7 on `main`.

You work on a project that lives in LayerFS, not on your local disk. Everything goes
through the SDK, from the shell: you write small Node scripts and run them with `node`.
There's no wrapper CLI. This page is the hub; open a reference page only when you need it.

## Mental model

- **Project.** One Store holding the project's whole history. `project.init` copies a
  source folder into it, once.
- **Branch.** A named line of Commits. `main` changes only through `branch.publish`.
  Do your work on your own Branch, made with `branch.fork`.
- **Commit.** An immutable snapshot. Every `fs.*` write publishes exactly one Commit on
  its Branch; `fs.apply` publishes many changes as one Commit.
- **Sandbox.** A container running one LayerFS daemon. Its id is persistent: save it
  and reuse it from later `node` processes.
- **Workspace.** A complete, writable view of a Branch head, mounted inside a Sandbox.
  `sandbox.exec` runs ordinary shell commands there (`npm install`, build, tests).
  `sandbox.commit` saves **everything** in it to the Branch: `node_modules`, `.git`,
  build output, caches. Git ignore rules don't filter anything. Nothing commits on its own.

## Rules

1. **Full CLI.** Write each step as a script under your run folder
   (`steps/NNN-name.mjs`) and run it with `node`. Keep the scripts: they are the record
   of what you did.
2. **Every command finishes in under 2 minutes.** `exec` has no timeout of its own, so
   wrap long commands inside it: `timeout 110 npm test`.
3. **One attempt.** A refusal throws a `LayerFSError` with a stable `code`. Read the
   code and decide; never resend blindly. On `Unknown` (an uncertain outcome), stop,
   inspect with `list_commits`/`read`, and report. See [errors](references/errors.md).
4. **A non-zero exit is not a refusal.** `exec` returns `{ exitCode, stdout, stderr,
   truncated }`; always check `exitCode`.
5. **A Workspace shows the head as of its mount.** After `fs.*` writes on the same
   Branch, mount a fresh Workspace before you build or test.
6. **Commit at every working step, with a message**, and publish to `main` only at
   milestones.
7. **Label every step** for the trace: `LAYERFS_TRACE_STEP="cart: add tests" node
   steps/012-cart-tests.mjs`. See [tracing](references/tracing.md).
8. **Clean up.** Commit or discard, unmount every Workspace, then close the Sandboxes
   you created.

## The step loop

```
fs.apply / fs.edit on your Branch      (source edits: one Commit each)
  → sandbox.mount(id, branch)          (fresh view of the new head)
  → sandbox.exec … install/build/test  (check exitCode)
  → sandbox.commit                     (captures generated files, lockfiles, node_modules)
  → sandbox.unmount
  → branch.publish(branch)             (milestones only)
```

Details and variations are in the [workflow](references/workflow.md).

## Which method for which job

| Job | Use |
| --- | --- |
| Create or change one file | `fs.write`, or `fs.edit` (exactly one match of `oldText`) |
| Create or change many files at once | `fs.apply(branch, [{op:"write",…}, …], message)`, one Commit |
| Create folders, copy, move, delete | `fs.mkdir`, `fs.cp`, `fs.mv`, `fs.rm` (recursive) |
| Install, build, test, run anything | `sandbox.mount`, then `sandbox.exec`, then `sandbox.commit` |
| Look at files | `fs.read` (line ranges), `fs.list`, `fs.stat`, `fs.grep`, `fs.glob` |
| Compare | `fs.diff_files`, `branch.diff_commits`, `branch.diff_branches` |
| History | `branch.list_commits`, `fs.blame` |
| Check a Workspace | `sandbox.status` (base, whether the head moved, overlay counts) |
| Combine Branches | `branch.merge(a, b, name)`, then `branch.publish(name)` |

## Method signatures

Copied from [`sdk/js/README.md`](../../../sdk/js/README.md), which is the source of truth.
Every method is positional and returns a Promise.

| Group | Methods |
| --- | --- |
| project | `init(sourcePath)`, `list_branches(pageSize?, pagePos?)` |
| fs reads | `read(ref, path, startLine?, endLine?)`, `list(ref, path?, pageSize?, pagePos?)`, `stat(ref, path)`, `grep(ref, pattern, path?, pageSize?, pagePos?)`, `glob(ref, pattern, path?, pageSize?, pagePos?)`, `diff_files(leftRef, leftPath, rightRef, rightPath)`, `blame(ref, path, fromLine?)` |
| fs writes | `write(branch, path, content, message?)`, `edit(branch, path, oldText, newText, message?)`, `apply(branch, changes, message?)`, `mkdir(branch, path, message?)`, `rm(branch, path, message?)`, `cp(branch, from, to, message?)`, `mv(branch, from, to, message?)` |
| branch | `fork(name, fromRef?)`, `list_commits(branch, pageSize?, pagePos?)`, `diff_commits(from, to, pageSize?, pagePos?)`, `diff_branches(from, to, pageSize?, pagePos?)`, `merge(a, b, name, message?)`, `publish(branch, commit?)` |
| sandbox | `create()`, `mount(id, branch)`, `exec(id, path, command, message?)`, `status(id, path)`, `commit(id, path, {message?, force?}?)`, `unmount(id, path, {discard?}?)`, `close(id)` |

A `ref` is `main`, a Branch name, a Commit id or a Layer id. Paths are absolute in the
view (`/src/index.js`). Pages are `{ items, hasMore }`; advance with
`pagePos + items.length`.

## Reference pages

| When you need to… | Read |
| --- | --- |
| Set up the environment, import the SDK, keep state between commands | [setup](references/setup.md) |
| Plan the work: per-step loop, long-lived Workspace, merging, publishing | [workflow](references/workflow.md) |
| Copy a working snippet for a common task | [recipes](references/recipes.md) |
| Handle a refusal: `Conflict`, `Dirty`, `Busy`, `NoMatch`, `Unknown`, … | [errors](references/errors.md) |
| Label steps, write the trace, read Store statistics | [tracing](references/tracing.md) |
| Know the 0.1.7 limits: output caps, read bounds, no restart recovery | [limits](references/limits.md) |

Deeper material: the [SDK reference](../../../sdk/js/README.md) and the
[0.1.7 SDK and UI guide](../../../docs/versioned/0.1.7/sdk-and-ui.md).
