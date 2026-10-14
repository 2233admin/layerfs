# Compare and merge of immutable roots

> **Status:** Implemented in Content for #327 (step 4). The daemon does not call
> it yet: merge-on-commit, Branch merge, diffs and blame wire it in later steps.
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
