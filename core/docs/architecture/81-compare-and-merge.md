# Compare and merge of immutable roots

> **Status:** Content modules implemented for #327 step 4; merge-on-commit wired
> in the daemon in step 6. Branch merge, diffs and blame wire it in later steps.
> No timing, storage or resident-memory claim has been measured.

Content owns two modules over checked immutable filesystem roots:
[`compare/`](../../crates/layerfs-content/src/compare/mod.rs) answers what
changed between two roots, and
[`merge/`](../../crates/layerfs-content/src/merge/mod.rs) merges two roots
against their common ancestor. Both only read canonical objects and emit through
the caller's `FinalizedConsumer`. Neither opens a database or allocates serials
itself.

## Compare

| Function | Answer | Work |
| --- | --- | --- |
| `sorted::difference` | keys whose value differs between two sorted trees | page-skipping: a page id equal on both sides is never read |
| `inode_changes` | serials whose kind, content or metadata differ | one inode-table difference; the reference count is ignored |
| `binding_changes` | names whose binding differs in two directory contents | one directory difference |
| `locate` | first path of each wanted serial | breadth-first listing, stops when all are named or at a listing limit |
| `root_changes` | path-level Added/Removed/Modified with both sides' facts | the above, plus the subtree under a rebound directory |
| `line_diff`, `match_lines` | the simulator's line difference | LCS table bounded by `MAXIMUM_DIFF_CELLS`; beyond it the common prefix and suffix are kept and the middle is one block |

Text is a regular file of at most `MAXIMUM_TEXT_BYTES` (1 MiB) that is valid
UTF-8 with no NUL byte. Lines are the `\n`-separated pieces, as the simulator
splits them.

## Merge

`merge_roots(reader, consumer, input, fresh, timing)` merges `ours` into
`theirs` against `base`. The result is built on `theirs` with one
`update_filesystem` call, the same canonical producer as every other root. File
bytes it writes (merged text or marker text) go through `construct_bytes` into
the same consumer first.

1. **Candidates.** Only a path whose entry ours changed can differ from theirs
   in the result. They come from `inode_changes(base, ours)`: a directory
   changed in place contributes its changed names, with the whole subtree below
   any name it bound or unbound; a file changed in place contributes its path.
   The paths are named with `locate` in both base and ours. At most
   `MAXIMUM_MERGE_PATHS` paths are decided; more is `BoundedCapacityExceeded`,
   never a partial merge.
2. **Decisions.** Each candidate is resolved by path in all three trees and
   decided with the simulator's rules. An entry is its kind plus, for a file or
   symlink, its content. Two directories are the same entry, and their children
   decide.

   | Case | Result |
   | --- | --- |
   | ours = theirs, or ours = base | theirs |
   | theirs = base | ours |
   | a `/.lww` rule matches | the side with the newer mtime, ours on a tie; a deletion takes its nearest surviving parent's mtime |
   | both text files | `merge3`; differing chunks become marker blocks (`content`, or `add/add` without a base) |
   | both files, one not text | ours, unmarked (`binary`) |
   | one side deleted a file | the kept text inside a deletion marker block (`modify/delete`, `delete/modify`) |
   | anything else | ours if present, else theirs (`type`) |

3. **Revival.** A kept path needs directory parents. A parent decided absent
   comes back from theirs when theirs holds a directory there, else from ours.
   A path below a parent that stays a file is dropped.
4. **Build.** A directory taken from ours that theirs does not hold at that
   path is built from nothing: its bindings are exactly the kept paths below
   it. A file value keeps its serial in three cases: the serial is new to
   theirs, theirs already holds that value, or the value changes in place at
   the serial's only binding. Otherwise the caller's `fresh` allocator supplies
   a new serial, so one serial never carries two values. A directory serial
   theirs already holds is always given a fresh serial.

The `/.lww` rules are gitignore-style, with `%include <file>`. They are read
from the side `RulesFrom` names: theirs for a Workspace Commit, ours for a
Branch merge.

`paths_with_markers(reader, root, paths, timing)` reports which of the named
paths are text files that still hold a complete marker block (an opening
`<<<<<<< ` line, a later `=======` line and a later `>>>>>>> ` line).

## Limits

- Locating paths lists directories breadth-first from the root. Its cost grows
  with the directories above the deepest change, not only with the change.
- A hard-linked file changed in place is located at its first path only.
- Merged text and marker files take the kind and metadata of the side they
  came from. Directory metadata follows theirs.

## Merge-on-commit

[`store/commit.rs`](../../crates/layerfs-daemon/src/store/commit.rs) and
[`store/commit_merge.rs`](../../crates/layerfs-daemon/src/store/commit_merge.rs)
run it inside the Commit's one Save, after the captured candidate is built.

1. A Workspace with a pending conflict is refused while any file that
   conflicted still holds a complete marker block. The reply is `Conflict` with
   `markers: true`. Nothing is published, and the failed capture is resolved as
   for any definite nonpublication.
2. The Branch snapshot is read again. If neither its head nor its base Layer
   moved, or `force` is set, the candidate is published as before. A forced
   Commit over a moved head keeps the captured parent and reports the displaced
   head.
3. Otherwise `merge_roots` merges ours (the candidate) into theirs (the current
   head's root). The base is the history root the Workspace is bound to. Theirs'
   `/.lww` applies, and the labels are `workspace` and `<branch>@<head>`.
   Serials come from the Store's allocator in reservations of 64.
4. **Clean:** the merged root is published against the head it merged with and
   installed as the Workspace's base. The reply is `MergeCommitted` with
   `from`, `head` and the `lww` decisions. If the head moved again in between,
   the publication is `HeadMoved` and nothing merges again.
5. **Conflict:** nothing is published. The merged root, with its marker files,
   is installed as the Workspace's *local* base, and the Workspace's history
   binding moves to the head. The conflicted paths are kept with it. The reply
   is `Conflict` with `head`, `base`, the conflicts with their hunks, the `lww`
   decisions and the paths the merge changed in the Workspace (at most 4096).
   The next Commit merges against the head it now follows.
6. **Kernel caches.** A clean or conflicted merge installs a root other than
   the one the Workspace showed, so the kernel may hold entries, attributes and
   pages that the install changed. Before answering, the control Commit walks
   the two roots with `inode_changes` and sends `inval_inode` for every inode
   the shown root had and the installed root changed or dropped, and
   `inval_entry` for every name rebound in a directory both roots hold
   ([`control/invalidate.rs`](../../crates/layerfs-daemon/src/control/invalidate.rs),
   [`session/invalidate.rs`](../../crates/layerfs-fuse/src/session/invalidate.rs)).
   The walk streams and has no cap. An entry the kernel does not cache answers
   ENOENT, which counts as done. A failed notification turns the known answer
   into a failure after it (`Failure::After`); nothing is resent. A process
   that still holds a descriptor or working directory on a replaced inode gets
   a failed request, which is retained as any other and makes the mount
   terminal. Found by VERIFICATION B10: without the step, a directory both sides
   created (`.next`) stayed cached under the Workspace's own serial and failed
   with ENOENT and EIO after the install.

The SPEC asks for the merge to be written into the Workspace overlay. This
implementation instead installs the merged root as the local base, which
retires the captured rows and keeps later rows on top. The Workspace view is
the same. The difference is that `status` reports the merged root as the local
base while the binding names the head.

### Control wire

`Request::Commit` carries `CommitControl { token, force }`. The new replies are
`MergeCommitted(MergedCommit)` and `Conflict(ConflictReport)`. A control record
may now fill one Noise transport plaintext (`u16::MAX - 16` bytes, up from
8192). A conflict report writes conflicts, hunk lines, decisions and written
paths while they fit, and sets `truncated` when it leaves some out. Paths and
lines longer than 4096 bytes are clipped at a character boundary.

