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
| `fs.write` | `project, branch, path, content` or `bytes`, `agent?, call?` | `Committed` or `UpToDate` | `NoSuchPath`, `IsDirectory`, `ReadOnly` (main), `HeadMoved` |
| `fs.edit` | `project, branch, path, oldText, newText, all?` | as `fs.write` | `NoMatch`, `AmbiguousMatch` (with `matches`), `NotText`, `TooLarge` |
| `fs.mkdir`, `fs.remove` | `project, branch, path, recursive?` | as `fs.write` | `Exists`, `NotDirectory`, `NotEmpty` |
| `fs.cp`, `fs.mv` | `project, branch, from, to, recursive?` | as `fs.write` | `Exists`, `InvalidMove`, `IsDirectory` |
| `fs.apply` | `project, branch, changes[]` (each with `kind`) | one Commit for all changes | the first invalid change |
| `fs.read` | `project, branch` or `commit, path, offset?` | `snapshot, root, path, inode, size, offset, text` or `bytes`, `nextOffset` | `NoSuchPath`, `IsDirectory`, `NotFile` |
| `fs.list` | `project, branch` or `commit, path?, cursor?` | `items[]`: name, path, type, inode; `nextCursor` | `NoSuchPath`, `NotDirectory` |
| `fs.stat` | `project, branch` or `commit, path` | `type, inode, size` | `NoSuchPath` |
| `fs.grep` | `project, branch` or `commit, pattern, path?, cursor?` | `items[]`: path, line, text; `skipped`, `nextCursor` | `TooLarge` |
| `fs.glob` | `project, branch` or `commit, pattern, path?, cursor?` | `items[]` (paths), `nextCursor` | `TooLarge` |
| `fs.diff_files` | `project, branch, left, right` (each `path, commit?`) | `Equal`, `Text` or `Binary`, with `contentEqual`, `sameInode`, `hunks` | `NoSuchPath`, `IsDirectory` |
| `fs.blame` | `project, branch` or `commit, path, fromLine?` | `versions`, `lines[]`: n, text, commit, agent, clipped; `origins[]`, `nextLine` | `NotText` |
| `branch.diff_commits` | `project, from, to` (Commit ids) | `from, to, items[]` (changes), `nextCursor`, `truncated` | `InvalidInput` |
| `branch.diff_branches` | `project, from, to` (Branches or `main`) | as `diff_commits` | `InvalidInput` |

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

### Direct Branch writes

Every `fs` write is one Commit with `via: fs` on the named Branch.
[`paths/`](../../crates/layerfs-content/src/paths/mod.rs) in Content applies
the ordered changes to the head's root. It follows the simulator's
`applyChanges` rules and refusal codes, and the first invalid change refuses
the whole list. Only the touched paths are kept, keyed by their current path;
every other path resolves through its parent into the base tree. The result is
built by one `update_filesystem` call in one Save:

- A written file keeps its serial and mode and gets the new modification time.
- A new file (`0o644`) or directory (`0o755`) gets a fresh serial from the
  Store's allocator.
- A copy gets fresh serials and the source values.
- A move keeps serials.

The Commit is published against the head it was built on, in one attempt.
`main` is refused (`ReadOnly`); it changes only by `branch.publish`. Edits read
a file as text within 1 MiB (`TooLarge` above it). A call's bytes are bounded
by one control record, and one change list may draft at most 65,536 paths.

### Reads, differences and blame

Reads name a saved snapshot: `commit` (a Commit or Layer id) when given, else
`branch` (a Branch's newest node, or `main`'s head Layer). They walk the
snapshot's immutable tree from its root and never read a live Workspace. Each
answer fits one control record:

- `fs.read` returns at most 48 KiB from `offset`; a window ending inside a
  character stops before it. Text is valid UTF-8 without NUL, else bytes.
- `fs.list` returns one directory window and the next name.
- `fs.grep` (literal, per line, text files within 1 MiB, lines shown up to
  1 KiB) and `fs.glob` (the `/.lww` pattern syntax, matching the whole path)
  walk at most 65,536 entries below their path and refuse a larger subtree
  with `TooLarge`. Both resume after `nextCursor`.

Tree differences come from Content's path-level root comparison (at most 4,096
changes, reported as `truncated` beyond). A directory whose only change is its
children is not listed. Each change has `content`, `identity` (a different
inode) and `metadata` flags, and the line difference of a text file while the
reply budget lasts (`hunksOmitted` after). `fs.diff_files` compares two files
within 1 MiB; larger or binary files compare by content identity.

`fs.blame` follows the simulator: the chain walks a Commit's parents, then its
base Layer; a published Layer continues through its source Commit. A line is
owned by the oldest version from which it is unchanged, found with the same
line matching as the difference. The chain is at most 1,024 versions, and the
oldest owns the lines still open. A version whose file has the same content
identity is passed without reading it.
