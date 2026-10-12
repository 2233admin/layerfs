# LayerFS SDK surface

> **Status:** Proposal; target LayerFS 0.1.7; not a released contract.
> Drafted 2026-10-12 from an owner discussion; owner decisions of the same day
> are marked. The "today" columns and line counts were read at `8f911fe6b`.
> Stage 1 relocation is implemented in this branch; the surface changes remain
> proposed until their gates complete. No
> measurement or qualification is claimed.

The public SDK is three groups and eleven methods. Everything else the SDK
crate exports today is folded into one of these, moved to an internal module,
or removed.

| Group | Methods |
| --- | --- |
| [Project](#project) | `init`, `fork`, `branches`, `commits` |
| [Sandbox](#sandbox) | `create`, `close` |
| [Workspace](#workspace) | `mount`, `exec`, `commit`, `status`, `unmount` |

`publish` (put a branch commit on the trunk) is deferred; see
[Deferred](#deferred-and-open).

The signatures below are a sketch of shape, not final Rust. Names of existing
types are the ones the source defines.

## Project

Runs on the host. A project is one sealed Store file with its history.

```rust
impl ProjectApi {
    fn init(source: &Path, store: &Path) -> Result<Project, InitFailure>;
    fn fork(sandbox: &Sandbox, branch: BranchId, commit: Option<CommitId>, new_branch_name: &str) -> Result<BranchId, OperationFailure>;
    fn branches(sandbox: &Sandbox, limit: u16, cursor: Option<Cursor>) -> Result<PageResult<BranchRecord>, OperationFailure>;
    fn commits(sandbox: &Sandbox, branch: BranchId, limit: u16, cursor: Option<Cursor>) -> Result<PageResult<CommitRecord>, OperationFailure>;
}
```

| Method | Purpose | Today |
| --- | --- | --- |
| `init` | Import a complete directory tree and produce a sealed project with its first layer and first branch | Exists as [`ProjectApi::init`](core/crates/layerfs-api/sdk/src/project/init.rs). Its request has eleven fields; most become defaults |
| `fork` | Create a branch from a commit of another branch. Without a commit it starts where the source branch is now | Exists as [`ProjectApi::fork`](core/crates/layerfs-api/sdk/src/project/commits.rs) with source `Commit { branch, commit }` |
| `branches` | List branches with id, name, base layer and head commit | The history catalog has [`branches(stack, page)`](core/crates/layerfs-history/src/contract/catalog.rs). No daemon control request and no SDK method |
| `commits` | List one branch's commits from its head backwards | Exists as `ProjectApi::history` and the daemon's `History` request. This is a rename |

### History model

The history layer already has a trunk, and it is not a branch.

| Idea | In the history layer |
| --- | --- |
| Trunk ("main") | A layer stack: one ordered line of immutable layers with a single head |
| Branch | A working line forked from a layer or from another branch's commit |
| Commit | One captured Workspace state on a branch, with a parent pointer |
| Publish | `add_layer`: one branch commit becomes the next layer of the stack |

## Sandbox

One container that runs the filesystem daemon and holds the installed project.

```rust
impl SandboxApi {
    fn create(options: SandboxOptions, project: &Project) -> Result<Sandbox, SandboxFailure>;
    fn close(sandbox: Sandbox) -> Result<(), SandboxFailure>;
}
```

| Method | Purpose | Today |
| --- | --- | --- |
| `create` | Start the container, authenticate, install the sealed project, wait until the daemon has opened it | [`SandboxApi::create`](core/crates/layerfs-api/sdk/src/sandbox/create.rs) exists. Install is a separate call (`ProjectApi::install`) and folds in here |
| `close` | Stop and delete the container | New on the SDK. `stop` and `delete` exist on the [container type](core/crates/layerfs-sandbox/src/backend/docker/container.rs) one layer down |

`ManagedSandbox::exec` is not part of the public surface. Command launch is
reached through `WorkspaceApi::exec`.

## Workspace

One mounted, writable view of a branch inside a sandbox.

```rust
impl WorkspaceApi {
    fn mount(sandbox: &Sandbox, branch: BranchId) -> Result<Workspace, MountFailure>;
    fn exec(workspace: &Workspace, command: Command) -> Result<Exec, ExecFailure>;
    fn commit(workspace: &Workspace) -> Result<CommitStagedOutcome, OperationFailure>;
    fn status(workspace: &Workspace) -> Result<WorkspaceStatus, OperationFailure>;
    fn unmount(workspace: &Workspace, force: bool) -> Result<(), OperationFailure>;
}
```

| Method | Purpose | Today |
| --- | --- | --- |
| `mount` | Create the Workspace over a branch and expose it as a mounted directory. Returns its identity and path | Exists as [`bind` then `attach`](core/crates/layerfs-api/sdk/src/workspace/mount.rs), wrapped by `mount`. The caller supplies a `WorkspaceId` |
| `exec` | Run one ordinary command with the mounted directory as its working directory. The caller owns its streams and exit status | New. The [exec contract](core/docs/issues/303/workspace-api/exec.md) describes it as an optional convenience that delegates to Sandbox execution |
| `commit` | Capture everything published in the Workspace so far as a new commit on its branch. Returns `Committed` or `UpToDate` | Exists as [`WorkspaceApi::commit`](core/crates/layerfs-api/sdk/src/workspace/commit.rs) |
| `status` | Report the Workspace's current state | Exists as [`WorkspaceApi::status`](core/crates/layerfs-api/sdk/src/workspace/status.rs) |
| `unmount` | Terminal unmount. Without `force`, a Workspace that is in use reports Busy and stays usable | Exists as [`unmount` and `force_unmount`](core/crates/layerfs-api/sdk/src/workspace/unmount.rs) |

A failed `mount` still reports which half failed, so that a kernel mount is
never assumed from a Store binding alone.

## Source layout

One file per public method, named after it; everything shared lives in one
folder.

The relocation co-locates Init and its request/failure types in `project/init.rs`,
Fork in `project/fork.rs`, ancestry reads in `project/commits.rs`, Sandbox startup
and its inputs in `sandbox/create.rs`, and bind/attach in `workspace/mount.rs`.
Shared authenticated control, operation failures and install plumbing live in
`base/`. Separate facade files are removed. The original public names remain
available for this relocation; tests, examples and the benchmark now import
control through the hidden `internal` export. Narrowing follows in a separate
change. The completed layout will be recorded after the surface is implemented.
Tests live outside `src/` and do not contribute to production LOC.

`branches` also needs a new control request in the bridge
(`control_types.rs`, `control_request.rs`, `control_reply.rs`,
`control_history.rs`) and one dispatch arm in the daemon
(`control/operations.rs`, with its operation number in
`application/diagnostics.rs`).

## What leaves the public surface

No product crate depends on the SDK. Its consumers are the benchmark runtime,
the daemon's tests and the SDK's own tests and examples, so each item below costs
test and benchmark edits, not product changes.

| Today | Disposition |
| --- | --- |
| `WorkspaceApi::bind`, `WorkspaceApi::attach` | Folded into `mount` |
| `WorkspaceApi::force_unmount` | Folded into `unmount(force)` |
| `ProjectApi::install`, free `install`, `Control::install_project` | Folded into `SandboxApi::create` |
| `ManagedSandbox::exec` | Replaced by `WorkspaceApi::exec` |
| `ManagedSandbox::status` | Removed; `create` already waits for startup |
| `WorkspaceApi::cleanup` | Internal module; reclamation is automatic |
| Free `initialize` | Removed; duplicate of `ProjectApi::init` |
| `Control::into_connection` | Removed |
| `Control::new`, `Control::call` | Internal module; tests call `call` directly |
| `WorkspaceApi::with_observations`, `Control::channel_work` | Internal module; the benchmark's request, owner-job and statement counts depend on them |
| `WorkspaceApi::locate` | Internal module; the recovery path after a lost reply |

The daemon's control requests are a separate question. This proposal changes
the SDK surface and adds one request, for `branches`. It does not merge `Mount`
with `Attach` or remove `Locate`, `Cleanup` or the `Observed` wrapper.

## Decisions

Owner decisions, 2026-10-12:

- The refactor happens before the benchmark is simplified. It is gated by the
  crates' tests, the twelve cells and one case per benchmark family, with
  request, owner-job and statement counts equal to the #319 terminal run.
- After the refactor and the benchmark simplification, the everyday tier and
  then the heavy tier are each run once as the new baseline. Command and Commit
  times are reported as measured.
- Performance optimization is deferred to later work.

Working defaults, proposed and not yet confirmed by the owner:

- `mount` takes no project argument; the project is fixed at `SandboxApi::create`,
  because one daemon serves one installed Store today.
- `exec` delegates to the existing Sandbox execution.
- The shared folder is named `base/`. The owner asked for `core/`; that name is
  also the repository's workspace folder and Rust's standard `core` crate, which
  makes `core::` paths ambiguous inside the SDK.

## Deferred and open

1. **`publish`.** The history catalog has `add_layer`, which carries the stack
   head and branch base the caller expects and returns `Added`, `UpToDate` or
   `NoChanges`. It has no daemon control request. This document reads the
   expected values as a fast-forward-only rule; the implementation was not read
   to confirm what happens when the trunk has moved.
2. **A faster `exec` launcher.** An in-container launcher would be a new
   component, and the current contract says the filesystem daemon supervises no
   commands and adds no launcher to its control channel. Deferred with the
   performance work.
3. **Lost replies.** An operation is attempted once and never replayed. Each
   method needs an "outcome unknown" result; `locate` stays reachable through
   the internal module for a caller whose mount reply was lost.
4. **Trunk and branch naming.** Callers name the first working branch "main"
   today, while the real trunk is the layer stack.
5. **Commit metadata.** A commit record holds an id, a root, a parent and a base
   layer. A readable log would need a message, an author or a time.
6. **Combining branches.** Nothing merges content from two branches.

## Why `exec` matters for latency

In the issue #319 terminal run (source `fc45a1bc4`, tag `p319t15`, single
samples on a shared virtual machine, timings not eligible for performance
claims), each command step cost a median of about 43 ms and a minimum of about
28 ms regardless of its file work. The 500-step history cases spent about 22 s
in command time for roughly six filesystem requests per step. Attributing that
floor to process launch through the Docker engine is an inference from those
numbers; it was not profiled.
