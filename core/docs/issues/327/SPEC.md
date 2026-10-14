# SDK redesign and UI wiring: specification

> **Status:** Proposal; target LayerFS 0.1.7; not a released contract.
> Tracking: [issue #327](https://github.com/Ephemeral-AI-Lab/layerfs/issues/327).
> It revises the SDK proposal in [issue #322](https://github.com/Ephemeral-AI-Lab/layerfs/issues/322)
> and wires the [`sdk-sim-terminals`](https://github.com/Ephemeral-AI-Lab/layerfs/tree/sdk-sim-terminals)
> browser UI to the real product. Source was read at `main` `2c31949ce`.
> Nothing below is implemented unless it says "existing".

## 0. Decisions this spec records

| # | Decision | Source |
| --- | --- | --- |
| D1 | JavaScript is the only public SDK. Rust is not an SDK: it implements every method as an internal library, which the JS package imports through a native binding and builds the public API from. | Owner, 2026-10-15 |
| D2 | Rust and JS are both organized as `{group}/{method}`, one file per method, so each JS method maps to exactly one Rust function. This reorganizes the existing Rust `project/`, `sandbox/` and `workspace/` families and supersedes #322's note that they stay as they are. | Owner, 2026-10-15 |
| D3 | No `connect`. `LayerFS.connect` and `sandbox.connect` are dropped: the client connects lazily on its first call, every `fs` and `branch` call names its Branch, and every Sandbox call after `create` takes the Sandbox id. | Owner, 2026-10-15 |
| D4 | No output streaming. `exec` returns output and exit status when the command ends. Streams stay with the Sandbox runtime owner. | Owner, 2026-10-15 |
| D5 | No user-facing staging. The internal two-step stage API and the `workspace_stage` table are removed (see section 3.4). | Owner, 2026-10-15 |
| D6 | Commit, merge and conflict behave as the simulator proposes (section 3), replacing today's overwrite-on-stale Commit. Adoption is this issue's main owner decision; until it is accepted, section 3 is a proposal. | Proposed |
| D7 | Process listing, process cancel and Workspace listing are not agent-facing. They belong to the operator surface (`inspect`) and to the Sandbox runtime owner. | Owner, 2026-10-15 |

Repository rules that apply throughout: Disposable / WAL / `synchronous=OFF` is the only
Store profile that may run; one attempted operation, with no automatic retry; one
construction producer per Commit and no second encoder; filesystem history is not a
process checkpoint; a test command never runs longer than 120 s.

## 1. File and folder structure

Scope: production LOC per file from `tools/production_loc.py --files` on a
`git archive` export of `core/` at `main` `2c31949ce`. Listings show only files this
work touches unless marked complete; bracketed numbers sum only the files shown.
`—` is a file that does not exist yet: `new` is planned, `cond.` depends on an owner
decision. Tests live in each crate's `tests/` and are not counted.

### 1.1 Rust implementation library (replaces `layerfs-api/sdk`)

The crate is renamed `layerfs-sdk` → `layerfs-api`, loses the `sdk/` level and is
never published. The move is a relocation; its production LOC is unchanged. The
daemon's dev-dependency path and `core/Cargo.toml` members are updated.

```
core/crates/layerfs-api/                 [1435]  (complete listing)
  src/
    lib.rs                                 19
    base/                               [644]  (unchanged)
      control.rs                          215
      failure.rs                           51
      install.rs                          142
      install_types.rs                     44
      internal.rs                         133
      mod.rs                                7
      recovery.rs                          52
    project/                            [194]
      mod.rs                                7
      init.rs                             161
      list_branches.rs                     26   (was project/branches.rs)
    fs/                                     —   new
      mod.rs                                —   new
      read.rs                               —   new
      list.rs                               —   new
      stat.rs                               —   new
      grep.rs                               —   new
      glob.rs                               —   new
      diff_files.rs                         —   new
      blame.rs                              —   cond.
      write.rs                              —   new
      edit.rs                               —   new
      apply.rs                              —   new
      mkdir.rs                              —   new
      remove.rs                             —   new
      cp.rs                                 —   new
      mv.rs                                 —   new
    branch/                              [48]
      mod.rs                                —   new
      fork.rs                              24   (was project/fork.rs; adds fork from any Commit)
      list_commits.rs                      24   (was project/commits.rs)
      diff_commits.rs                       —   new
      diff_branches.rs                      —   new
      publish.rs                            —   new
      merge.rs                              —   new
      drop.rs                               —   cond.
    sandbox/                            [530]
      mod.rs                                4   (absorbs workspace/mod.rs, 9, which is removed)
      create.rs                           322
      close.rs                             36
      mount.rs                             65   (was workspace/mount.rs)
      exec.rs                              39   (was workspace/exec.rs)
      status.rs                            15   (was workspace/status.rs)
      commit.rs                            16   (was workspace/commit.rs; Merged and Conflict outcomes)
      unmount.rs                           33   (was workspace/unmount.rs; discard)
    inspect/                                —   new  (operator surface; section 4.1)
      mod.rs                                —   new
      snapshot.rs                           —   new
```

### 1.2 Product crates

```
layerfs-history/src/                    [818]  (complete listing)
  lib.rs                                  20
  contract/                             [798]
    catalog.rs                            72   (drop stage, stages, stage_changes, commit_staged, discard_stage; add commit against expected head, merge_base)
    error.rs                             114   (add HeadMoved)
    identity.rs                          237   (drop StageToken)
    mod.rs                                 5
    query.rs                             135
    records.rs                           235   (drop Stage*; Commit gains an optional second parent)
```

```
layerfs-persistence/                   [1560]  (partial)
  sql/sqlite/                           [167]  (partial)
    history.sql                          156   (drop workspace_stage; add the second-parent column)
    queries/history/                     [11]  (partial)
      commit_advance_branch.sql            1
      commit_commit_by_id.sql              1
      commit_delete_stage.sql              1   (removed)
      commit_insert_commit.sql             1   (second parent)
      staging_bump_token.sql               1   (removed)
      staging_delete_stage.sql             1   (removed)
      staging_insert_stage.sql             1   (removed)
      staging_next_token.sql               1   (removed)
      staging_stage_by_workspace.sql       1   (removed)
      staging_stage_first_page.sql         1   (removed)
      staging_stage_next_page.sql          1   (removed)
      commit_merge_base.sql                —   new
  src/history/                         [1393]  (complete)
    allocation.rs                         63
    bindings.rs                           46
    branch.rs                            166
    catalog.rs                           136   (route the reduced contract)
    commit.rs                            257   (commit against expected head instead of stage_and_commit)
    layerstack.rs                        333
    mod.rs                                13
    provider.rs                            9
    rows.rs                              135   (drop stage_row)
    staging.rs                           205   (removed)
    transaction.rs                        30
    ancestry.rs                            —   new  (merge base; ancestry pages for blame)
```

```
layerfs-content/src/                    [999]  (partial)
  lib.rs                                  42   (declare merge, compare)
  filesystem/                           [957]  (partial)
    read.rs                              273   (reused: bounded reads of both sides)
    update.rs                            684   (reused: builds the merged root; one construction path)
  merge/                                   —   new
    mod.rs                                 —   new
    tree.rs                                —   new  (three-way entry rules)
    text.rs                                —   new  (line merge; large or binary files conflict whole)
    markers.rs                             —   new  (write and detect marker blocks)
    lww.rs                                 —   cond. (.lww rules)
  compare/                                 —   new
    mod.rs                                 —   new
    tree.rs                                —   new  (root against root, path level)
    text.rs                                —   new  (line diff; reused by blame)
```

```
layerfs-workspace/src/                 [1033]  (partial)
  workspace/                             [79]  (partial)
    install.rs                            79   (reused: install the merged root as the new base)
  construction/captured/                [688]  (partial)
    owner.rs                             268
    scan.rs                              420   (refuse commit while changed files hold markers)
  mutation/                             [266]  (partial)
    job.rs                               266   (reused: one owner job per write)
    conflict.rs                            —   new  (write the merge with markers into the overlay)
```

```
layerfs-daemon/src/                     [790]  (partial)
  store/                                [413]  (partial)
    commit.rs                            199   (merge-on-commit)
    commit_types.rs                      189   (Merged, Conflict, lww outcomes)
    mod.rs                                25
    merge.rs                               —   new  (Branch merge a + b → c)
    files.rs                               —   new  (direct Branch fs reads and one-Commit writes)
    compare.rs                             —   new  (diff_files, diff_commits, diff_branches, blame)
    inspect.rs                             —   new  (snapshot for the operator surface)
  control/                              [377]  (partial)
    operations.rs                        240   (route the new calls)
    registry.rs                          137
```

```
layerfs-bridge/src/                     [907]  (partial)
  control_history.rs                     212   (Merged and Conflict outcomes)
  control_reply.rs                       340
  control_request.rs                     206
  control_types.rs                       149
  control_files.rs                         —   new
  control_compare.rs                       —   new
  control_inspect.rs                       —   new
```

### 1.3 JavaScript SDK (the only public SDK)

Location is an owner decision; `sdk/js/` is a placeholder. The package counts toward
production LOC. `native/` is a Rust binding crate and needs a new third-party
dependency (a Node addon crate), which requires owner approval.

```
sdk/js/                                    —   new
  native/                                  —   cond. (Node addon over layerfs-api)
  src/
    index.ts                               —   new  (LayerFS class; lazy connection)
    errors.ts                              —   new  (typed refusals)
    project/
      init.ts                              —   new
      list_branches.ts                     —   new
    fs/
      read.ts                              —   new
      list.ts                              —   new
      stat.ts                              —   new
      grep.ts                              —   new
      glob.ts                              —   new
      diff_files.ts                        —   new
      blame.ts                             —   cond.
      write.ts                             —   new
      edit.ts                              —   new
      apply.ts                             —   new
      mkdir.ts                             —   new
      remove.ts                            —   new
      cp.ts                                —   new
      mv.ts                                —   new
    branch/
      fork.ts                              —   new
      list_commits.ts                      —   new
      diff_commits.ts                      —   new
      diff_branches.ts                     —   new
      publish.ts                           —   new
      merge.ts                             —   new
      drop.ts                              —   cond.
    sandbox/
      create.ts                            —   new
      close.ts                             —   new
      mount.ts                             —   new
      exec.ts                              —   new
      status.ts                            —   new
      commit.ts                            —   new
      unmount.ts                           —   new
    inspect/
      snapshot.ts                          —   new  (operator surface, not agent-facing)
    harness/
      tool_call.ts                         —   new  (mount → exec → commit → unmount; kept Workspace after a conflict)
      sandboxes.ts                         —   new  (one shared Sandbox per Branch)
      result.ts                            —   new  (the Bash tool result envelope)
```

### 1.4 UI wiring (demo tooling, outside production scope)

These files are a demo and are not counted as production; existing files show `n/a`.

```
sdk_sim/
  tui.html                               n/a   (async calls; backend switch ?backend=sim|live)
  terminal.js                            n/a   (Engine becomes async; reads go through the backend)
  files.js                               n/a   (blame and diff through the backend)
  model.js                               n/a   (unchanged: the sim backend)
  demo.js                                n/a   (stories gain live expectations where outputs differ)
  backend/
    sim.js                                 —   new  (adapter over model.js)
    live.js                                —   new  (adapter over the local server)
  server/
    server.mjs                             —   new  (local Node server: JS SDK + inspect over HTTP)
    executor.mjs                           —   new  (runs commands via sandbox.exec; tracks its own processes)
  test_live.js                             —   new  (stories against the live backend; VERIFICATION.md)
```

## 2. SDK

### 2.1 Client

```js
import { LayerFS } from "@layerfs/sdk";
const layerfs = new LayerFS({ project: "website" });   // no I/O until the first call
```

The client finds the daemon from its configuration (for example `LAYERFS_SOCKET`).
There is no bound Branch and no `connect`.

### 2.2 Agent-facing methods

Called by the model inside its tool calls. Every write is one Commit.

| Group | Method | Signature (sketch) | Returns |
| --- | --- | --- | --- |
| `fs` | `read` | `read(path, { branch, commit? })` | `{ snapshot, root, path, inode, text }` |
| `fs` | `list` | `list(path, { branch, commit? })` | `{ items: { name, path, type, inode }[], nextCursor }` |
| `fs` | `stat` | `stat(path, { branch, commit? })` | `{ snapshot, path, type, inode, size }` |
| `fs` | `grep` | `grep(pattern, { branch, path? })` | `{ items: { path, line, text }[], nextCursor }` |
| `fs` | `glob` | `glob(pattern, { branch })` | `{ items: string[] }` |
| `fs` | `diff_files` | `diff_files({ left: { path, commit? }, right: { path, commit? } }, { branch })` | `Equal \| Text` (with hunks) |
| `fs` | `blame` (cond.) | `blame(path, { branch, commit? })` | `{ lines: { commit, agent?, text }[] }` |
| `fs` | `write` | `write(path, content, { branch })` | `Committed` |
| `fs` | `edit` | `edit(path, { oldText, newText }, { branch })` | `Committed` |
| `fs` | `apply` | `apply(changes[], { branch })` | `Committed` (one Commit for all changes) |
| `fs` | `mkdir`, `remove` | `(path, { branch, recursive? })` | `Committed` |
| `fs` | `cp`, `mv` | `(from, to, { branch })` | `Committed` |
| `branch` | `list_commits` | `list_commits({ branch })` | `{ items: Commit[], nextCursor }` |
| `branch` | `diff_commits` | `diff_commits({ from, to })` | `{ items: Change[] }` |
| `branch` | `diff_branches` | `diff_branches({ from, to })` | `{ items: Change[] }` |
| `branch` | `fork` | `fork(name, { from: Branch \| CommitId })` | `Forked` (metadata only) |
| `branch` | `drop` (cond.) | `drop(name)` | `Dropped` (never reported as space freed) |

### 2.3 Harness and lead methods

Called by the code that runs agents, or by a lead agent.

| Group | Method | Signature (sketch) | Returns / refusals |
| --- | --- | --- | --- |
| `project` | `init` | `init(path, { name })` | `Initialized` |
| `project` | `list_branches` | `list_branches()` | `{ items: Branch[] }` |
| `sandbox` | `create` | `create()` | Sandbox id |
| `sandbox` | `mount` | `mount(sandbox, { branch })` | Workspace path |
| `sandbox` | `exec` | `exec(sandbox, path, command, { background? })` | `{ exitCode, stdout }` or a process handle |
| `sandbox` | `status` | `status(sandbox, path)` | `{ base, branchHead, headMovedSinceMount, overlay }` |
| `sandbox` | `commit` | `commit(sandbox, path, { force?, agent?, call? })` | `Committed \| UpToDate`; `Conflict`, `HeadMoved` |
| `sandbox` | `unmount` | `unmount(sandbox, path, { discard? })` | `Unmounted`; `Busy`, `Dirty` |
| `sandbox` | `close` | `close(sandbox)` | `Closed`; `MountsActive` |
| `branch` | `merge` | `merge(a, b, { name })` | `Merged` (incl. fast-forward); `Conflict` |
| `branch` | `publish` | `publish({ branch, commit? })` | `Added \| UpToDate \| NoChanges`, with `overwrote` |

`harness/tool_call.ts` wraps one Bash tool call: mount (or reuse the Workspace kept
after a conflict) → exec → commit → unmount, and returns the result envelope:
exit code, output, and the Commit outcome (Committed; merged with history; Conflict
with files and "markers written, your next call runs in the same Workspace";
`.lww` decisions). Mount, exec and commit are separate phases so tests and the UI
can force overlap by order, not by timing.

### 2.4 Not in the SDK

- Process listing and cancel: the Sandbox runtime owner returned by `exec` owns
  start, streams, exit status and cancellation.
- Workspace and Sandbox listing: `inspect` (section 4.1), for operators and the UI.
- Output streaming (D4).

## 3. Commit, merge and conflict

### 3.1 Commit from a Workspace

1. Capture the Workspace against its base (existing captured construction).
2. If the Branch head still equals the base: publish against that expected head.
3. If the head moved: three-way merge with base = the Workspace's base, ours = the
   Workspace, theirs = the head.
   - Clean: build the merged root through `content/filesystem/update.rs`, publish
     it against the head it merged with, and install it as the Workspace's new base.
     The result reports `merged: { from, head, lww }`.
   - Conflict: nothing is committed and the Branch is unchanged. The merge, with
     marker blocks, is written into the Workspace overlay and the Workspace base
     moves to the head. The refusal is `Conflict { head, base, conflicts[{ path,
     hunks }], written }`. The next call runs in this kept Workspace.
4. Commit is refused (`Conflict { markers }`) while any changed file still holds a
   complete marker block.
5. One attempt: if the head moves again between the merge and the publish, the
   commit returns `HeadMoved` and does not merge again.
6. `force: true` publishes the Workspace as is over the head (today's behaviour).

### 3.2 Merge rules

- Trees: an entry changed on one side only takes that side; the same change on
  both sides is kept once; different changes to the same file merge as text.
  Add/delete, delete/change and type changes on both sides conflict.
- Text: line merge with anchors (base lines unchanged on both sides). Files above a
  size bound or not valid text conflict whole; no resident buffer grows with file size.
- Merge base: the newest common ancestor through Commit parents (including the
  second parent), base Layers and the Commit each Layer was published from.
- `.lww` (cond.): gitignore-style patterns with `%include`; a matched path takes the
  newer write instead of conflicting, and the result reports each decision. "Newer"
  needs per-path write times, which do not exist today.

### 3.3 Branch merge and publish

- `branch.merge(a, b, { name: c })` creates Branch `c`; `a` and `b` never change.
  When one side contains the other it is a fast-forward (metadata only). Otherwise a
  clean merge creates one Commit with two parents. A conflict is refused and creates
  nothing; the refusal lists each file with both sides' lines. The user makes the
  two Branches agree, then merges again.
- `branch.publish` stays overwrite-only and reports `overwrote` when main's head
  was not in the published Commit's ancestry.

### 3.4 Staging removal

The daemon Commit uses only `stage_and_commit`, which writes a stage row and
overwrites the Branch in one transaction. The two-step API (`stage_changes`,
`commit_staged`, `stages`, `discard_stage`) is used only inside Persistence and its
tests. Remove the table, `staging.rs`, the stage queries and the stage records; carry
the expected head as a field of the Commit request. Before deleting, confirm that no
lost-reply or custody path reads the stage token.

### 3.5 Schema and record changes

- `commit`: an optional second parent column.
- Commit attribution (`agent`, `call`) is an owner decision: the UI shows it, but
  invocation auditing is separate under the current rules.

## 4. What the UI needs beyond the SDK

The `sdk-sim-terminals` UI (`sdk_sim/tui.html`, `terminal.js`, `files.js`) reads the
simulator's state directly in addition to calling it. A live UI needs the following.

### 4.1 Read model: `inspect.snapshot({ since? })`

An operator surface, not agent-facing. One call returns:

| Field | Used by | Today's source in the simulator |
| --- | --- | --- |
| `version` | Polling: skip work when nothing changed | none (sync re-render) |
| `branches[]`: name, base, head, forked-from, slot | Tabs, graph lanes | `sim.s.branches`, `branchOrder` |
| `commits[]`: id, branch, parent, second parent, base, root, via (fs / exec / merge), agent, call, merged, lww, time | History graph, hover card, blame, "+N" tab badges | `sim.s.commits` |
| `layers[]`: id, parent, root, source Branch, source Commit | main lane, publish view | `sim.s.layers` |
| `sandboxes[]`: id, status, workspaces[]: path, branch, base, mounted, headMovedSinceMount, overlay summary | Window prompts, stale marks, mount counts | `sim.s.sandboxes`, `liveMountsOf` |

Paging follows the existing bounded lineage rules; the UI keeps a cursor per Branch.
There is no event stream: the UI polls `snapshot({ since: version })` after each call
and on a slow timer.

### 4.2 Process state

The UI's server pill and Stop button need running processes per Workspace. These come
from the Sandbox runtime owner that `exec` returns, so the local server
(`sdk_sim/server/executor.mjs`) keeps the handles it started and answers `list` and
`cancel` itself. The daemon is not involved.

### 4.3 File views

The Files panel needs a file at any Commit or Layer (`fs.read` with `commit`), a
directory listing at both sides of a comparison, `diff_files`, `diff_commits`,
`diff_branches` and `blame`.

### 4.4 Local server and terminals

- The browser cannot load the native binding, so a local Node server runs the JS SDK
  and exposes it and `inspect` over HTTP to `tui.html`.
- The Sandbox pane runs real commands with `sandbox.exec` in the mounted Workspace, one
  command per request, output returned at the end (D4). No interactive terminal.
- The History pane's `fork`, `merge`, `publish`, `log` and `diff` and the fs pane's
  commands map onto SDK calls, as `terminal.js` already does for the simulator.

### 4.5 UI changes

- `Engine` becomes asynchronous; `tui.html` awaits each call.
- A backend switch (`?backend=sim|live`) chooses `backend/sim.js` or `backend/live.js`.
- Demo stories keep their outcome-code expectations. Where real output differs from the
  simulated shell (for example `npm ci`), a story checks exit codes, not text.
- The demo project must work offline inside the Sandbox: a small fixture project with
  local packages, so `npm ci`, `npm run build` and `npm test` need no network.

### 4.6 Open owner decisions

1. Adopt merge-on-commit (D6).
2. `.lww`, `blame` and `drop`: in or out.
3. Commit attribution (`agent`, `call`).
4. Location of the JS package; approval of the Node addon dependency.
5. Whether `inspect` is public or tooling-only.
