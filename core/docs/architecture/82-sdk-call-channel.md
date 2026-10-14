# SDK call channel

> **Status:** Implemented for #327 step 7. It serves the JavaScript SDK's
> non-Workspace methods. No timing claim has been measured.

The JavaScript SDK is the only public SDK, and its arguments and results are
plain objects. The Workspace control operations (Mount, Attach, Commit, Status,
Unmount) keep their typed records. Every other SDK method travels as one
`Request::Sdk(SdkCall { method, args })` and is answered with
`Reply::Sdk(value)` or `Reply::SdkRefused(SdkRefusal { code, message, detail })`.

## Values

[`control_sdk.rs`](../../crates/layerfs-bridge/src/control_sdk.rs) defines
`SdkValue`: null, boolean, 64-bit integer, text, bytes, list, and a map of
unique field names. A value nests at most 16 levels. A whole record fits one
control record (`u16::MAX - 16` bytes), so a large result is windowed by its
method. A refusal's `code` is stable and alone decides; the message is for
people.

## Names and identities

A project is named by its stack name. A Branch is named by its name; `main` is
the stack's line of Layers. Commits and Layers travel as the lowercase hex of
their tagged identity. A Branch the SDK creates (fork, merge) gets
`BranchId::named(stack, name)`. Branch names are unique in their stack and are
not reused.

## Methods

The table lists what [`sdk/`](../../crates/layerfs-daemon/src/sdk/mod.rs)
serves today.

| Method | Arguments | Result | Refusals |
| --- | --- | --- | --- |
| `project.list_branches` | `project` | `items[]`: name, base, head (main first) | `NoSuchProject` |
| `branch.fork` | `project, name, from?` (Branch, `main`, or a Commit or Layer id) | `Forked` | `ReservedName`, `NameTaken`, `NoSuchBranch` |
| `branch.list_commits` | `project, branch, cursor?` | `items[]` (newest first), `nextCursor` | `NoSuchBranch` |
| `branch.merge` | `project, branch, with, name, agent?` | `Merged` with `fastForward`, `head`, `root`, `sources`, `mergeBase`, `lww` | `Conflict` (detail: sources, mergeBase, conflicts with hunks, lww), `NameTaken`, `ReservedName`, `HeadMoved` |
| `branch.publish` | `project, branch, commit?` | `Added` with `overwrote[]`, `UpToDate`, `NoChanges` | `NoCommit`, `HeadMoved` |

### Branch merge

`branch.merge` never changes either side. When one side is an ancestor of the
other, the new Branch starts at the newer node (`fastForward: true`, no new
Commit). Otherwise the two roots are merged against their merge base in one
Save, with the left side's `/.lww`. The labels are `<name>@<short id>`. A
clean result becomes one Commit (`via: merge`) whose parent is the left head
(when it is a Commit) and whose second parent is the right node. Its base is
main's head when main is a side, else the left Branch's base. A conflict drops
the unfinished Save and creates nothing. Both sides must still be at the merged
nodes when the Branch is created (`HeadMoved` otherwise, one attempt).
