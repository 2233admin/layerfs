# Localized edit: generic command, expectation, forbidden routes, complexity

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Draft for owner review, 2026-10-10, for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). It records what
was said and analysed before any product change. Owner statements are quoted
with their date. Everything else is analysis and is labelled as such. Section 5
lists what still needs an owner ruling.

## 1. What a generic arbitrary command is

Owner, 2026-10-10: "the file mutation is supposed to be caused by any random
command, could be a script a command, a program".

Working definition:

- Any process that can see the mount: a shell command, a script, a compiled
  program, an editor, a build tool. It may be started by `WorkspaceApi.exec` or
  by an external executor; the launch route makes no difference.
- It was not written or changed for LayerFS. It would run the same way, with the
  same result, on ext4 or tmpfs.
- Its only interface to LayerFS is ordinary filesystem system calls on the
  mount. It uses no LayerFS library, API, environment variable or wrapper.
- LayerFS never reads the command text and never classifies the program.

A benchmark writer counts as generic only if it meets the same test: it issues
the calls an ordinary tool would issue for that edit.

### Calls that can reach the daemon

Read from upstream Linux 6.12 `fs/fuse/file.c` on 2026-10-10. The pinned kernel
is a 6.12 build and has not been probed for this.

| Call | Reaches the daemon | Mount at `2590a4536` |
| --- | --- | --- |
| `write`, `pwrite` | yes, as WRITE requests (at most 128 KiB each on this mount) | served |
| `truncate`, `ftruncate` | yes, as SETATTR | served |
| create, rename, unlink, link | yes | served |
| `fallocate` keep-size, punch-hole, zero-range | yes | refused (`ENOSYS`) |
| `copy_file_range`, same mount | yes | refused (`ENOSYS`) |
| `fallocate` insert-range, collapse-range | no, the kernel returns `EOPNOTSUPP` | not applicable |
| reflink (`FICLONE`, `FICLONERANGE`) | no, FUSE has no remap operation | not applicable |

### How commands edit a file

| Pattern | Examples | Bytes submitted |
| --- | --- | --- |
| In place at a position | `dd conv=notrunc`, `>>`, `truncate`, a database page write | the changed bytes only |
| Rewrite the whole file | `sed -i`, `perl -pi`, editors, formatters, `patch`, read-then-write scripts | every byte of the new file |
| Shift a suffix in place | a `pread`/`pwrite` loop | the new bytes plus the whole suffix |

POSIX has no call that inserts or removes bytes in the middle of a file. A
command that does so uses the second or third pattern.

## 2. Expectation of localized edit

Owner, 2026-10-10: "one very important feature of layerfs is that we should
expect very optimized time for edit time to large file because we have localized
edit of extent tree. and we should expect the edit time only [proportional] to
the edit size itself while being agnostic to the file size it edits against".

Owner, 2026-10-10: "we need to come up with the generic design that is fast
optimized to any type of edit to any position, and does not scale when file size
increases." Scaling below `log n` in file size is accepted; linear is not.

Analysis. The canonical file is an extent tree whose nodes carry subtree byte
lengths ([design note](../../../../docs/roadmap/0.1/0.1.2/extent_tree.md)). One
splice `(start, delete length, replacement)` keeps the prefix and suffix
subtrees. The tree needs to be told that range. Through the mount, only an
in-place write, an append and a size change carry it.

Proposed restatement, **PENDING OWNER**:

1. LayerFS work for an edit is proportional to the bytes the command submits,
   plus a term bounded by tree height. This covers serving the writes, local
   overlay state, Commit and stored growth.
2. No other property of the file enters: not its size, not its extent count
   beyond tree height, not earlier edits.
3. Stored growth is proportional to the real change, even when the command
   submits more than the change.

Consequences:

| Edit by a generic command | Bytes submitted | Expected LayerFS cost |
| --- | --- | --- |
| Overwrite `k` bytes in place | `k` | `k` plus tree height |
| Append `k` bytes | `k` | `k` plus tree height |
| Truncate or extend | none | tree height |
| Insert, delete, prepend, replace with another length | at least the suffix | proportional to the bytes submitted |
| Any edit by a rewriting command | the whole file | proportional to the bytes submitted |

The last two rows do not meet "does not scale when file size increases". No
filesystem can make them do so, because the command itself submits those bytes
before the filesystem sees anything. This is the gap between the owner's
statement and the restatement; see section 5.

## 3. Forbidden

Owner rulings on this topic:

| Rule | Source |
| --- | --- |
| No SDK or control-channel range-edit call | Owner 2026-10-10: "the sdk of range edit is not acceptable", because it is not generic |
| No ioctl | Owner 2026-10-10: "ioctl must be ruled out"; first directed 2026-09-26 and recorded in the [#252 report](../252/REPORT.md) |
| No LayerFS edit tool and no program written to cooperate with LayerFS | Follows from the two rules above and the definition in section 1 |
| No parsing or classifying of command text | [Shell route correction](../232/SHELL_ROUTE_CORRECTION.md), [#245 architecture](../245/ARCHITECTURE.md) |
| No data structure, constant, shortcut or writer fitted to a benchmark case | Owner direction for R7, 2026-10-09 |
| No speed bought with allocated storage or unbounded memory | Owner direction for R7, 2026-10-09 |

Standing repository rules that limit the design:

| Rule | Source |
| --- | --- |
| No whole-file copy-up and no file-prefix amplification | [Speed test plan](../307/S7-S9-SPEED-TEST-PLAN.md), E05 |
| No artificial cap on file, edit, Workspace or Commit size | [Repository guide](../../../../AGENTS.md), mental model |
| Mutable state is SQLite-backed; no custom duplicate tree or graph; nothing quadratic | [Optimization guide](../../../../docs/general/optimization-guide.md) |
| No kernel notification or invalidation; kernel writeback stays off | [Native mutation coherence](../../architecture/77-native-mutation-coherence.md) |
| No kernel patch and no third-party patch beyond the authorized fuser ones | [Repository guide](../../../../AGENTS.md), section 4 |
| No extra construction worker, and no changed timeout, guard, workload or cache state to turn a miss into PASS | [Repository guide](../../../../AGENTS.md), section 3 |
| The retired predecessor crates and the root reference do not return | [Core guide](../../../AGENTS.md) |

Not forbidden, and not the generic edit route: `copy_file_range` and
`fallocate` punch-hole or zero-range are ordinary calls and may be served.
Ordinary commands do not use them to insert or delete inside a file, so serving
them does not answer section 2.

## 4. Time complexity

All of this section is analysis. Measured numbers are single samples from the
fs-bench-pro rollout at 2026-10-10, cache-INELIGIBLE, and are diagnostic only;
rows are under
[baselines/core](../../../benchmark/fs-bench-pro/baselines/core/) and the
[rollout ledger](../../benchmark/fs-bench-pro/ROLLOUT-LEDGER.md).

| Symbol | Meaning |
| --- | --- |
| `N` | file size before the edit |
| `k` | size of the real change |
| `p` | position of the change |
| `W` | bytes the command submits through write calls |
| `E` | extents in the file, about `N` divided by the average chunk size |
| `H` | extent tree height, `O(log E)` |
| `R` | separate changed runs in the file at Commit |

### Bytes submitted, `W`

| Edit | In-place command | Shifting command | Rewriting command |
| --- | --- | --- | --- |
| Overwrite `k` at `p` | `k` | not needed | `N` |
| Append `k` | `k` | not needed | `N + k` |
| Truncate, extend | `0` | not needed | new size |
| Insert `k` at `p` | not expressible | `k + (N - p)` | `N + k` |
| Delete `d` at `p` | not expressible | `N - p - d` | `N - d` |
| Prepend `k` | not expressible | `N + k` | `N + k` |

### Cost by stage

| Stage | Floor on any filesystem | Source at `2590a4536` | Target |
| --- | --- | --- | --- |
| Deliver writes to the daemon | `Ω(W)` | `W / 128 KiB` requests | unchanged |
| Store in the overlay | none | `W / 32 KiB` rows holding `W` bytes | `O(W)`, one write of each byte |
| Commit, find the changes | `Ω(R)` | reads all `W` bytes although it needs only lengths and validity | `O(W / 32 KiB)` metadata, no payload read |
| Commit, build the file | `Ω(W)` to chunk and hash | reads `W` bytes again; one owner job per window of about 32 KiB | `O(W + R·H)`, one read of each byte |
| Stored growth | `Ω(k)` | `k` plus boundary chunks | unchanged |
| Dependence on `N` beyond `W` | none | present, see below | `O(H)` |

### What the samples show

- In-place 4 KiB overwrite, append and truncate, `W ≤ 4 KiB`. Commit takes
  9.4 to 11.8 ms at 1 MiB and 12.1 to 27.1 ms at 500 MiB. Owner jobs rise from
  110–152 to 179–459. This is below linear. It is not yet shown to be bounded
  by `H`.
- Shifting commands on 500 MiB, `W` about 250 to 500 MiB. The command phase
  takes 2.9 to 7.2 s and Commit 2.7 to 5.4 s, about 70 to 90 MiB/s each. This is
  linear in `W`, as the floor requires, with a large constant.
- Stored growth for those shifts stays local: 3 of 54 chunks changed at 1 MiB
  and 6 of 5,394 at 100 MiB.

### Conclusions

1. For in-place edits the target is `O(k + H)` at every stage. This is the
   localized edit of section 2, and it is reachable.
2. For shifting and rewriting commands every stage is `Θ(W)` at best, and
   `W ≥ N - p`. The reachable target is one pass over `W` with no further term
   in `N`.
3. "Any edit, at any position, by any generic command, below linear in `N`" is
   not reachable under section 3, because the missing input is a call that
   POSIX does not have.
4. The extent tree's own bound is expected to be `O(k + H)` per splice. The
   design note does not claim it as a proved worst case.

## 5. Open, PENDING OWNER

1. Whether the restatement in section 2 is accepted as the generic requirement,
   given conclusion 3.
2. How the 23 failed structural-shift cases of batches 1 and 2 are judged: time
   per byte submitted and stored growth, or another rule.
3. Whether the retention guard may allow the boundary chunks a rewrite changes.
4. Whether the 2 s limit on the capped 500 MiB cases stays as it is.
