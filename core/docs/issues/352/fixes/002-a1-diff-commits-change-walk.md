# Range 002 a1 · diff_commits walked both whole trees

| | |
| --- | --- |
| Trigger | Not a gate trip at 002.a1 (the Counters row named `fork`/`merge` first); F-003 from the fixer's probes: `diff_commits` of one changed file had VM-step depth exponent 0.59, statements 0.48, returned rows 0.54 (counter threshold < 0.05, act > 0.5) over ranges 0–2. The coordinator scheduled it before the range 2 rerun because the rerun would trip on it. |
| Playbook step | D3 (statements per call grow with tree size), confirmed with a regression test at two tree sizes and two depths |
| Kind | Store format (SPEC §6): new table `binding_hint`, plus code path |
| Binaries | old daemon `b9c332b79bc5…58bfc` (after the three earlier 002.a1 fixes) → new daemon `511dceeda1b5…7ad0`, SDK addon `506b646f7d0a…9d2d` |
| Commits | fix `49499abac`; regression tests `core/crates/layerfs-daemon/tests/sdk_diff_size.rs`, `core/crates/layerfs-daemon/tests/history_diff_oracle.rs`; gates `0c347ad33` ([record](002-a1-gate-same-binary.md)) |
| Recovery | format change: fast rebuild of ranges 0–1 from the plan into run `p1-pilot-b` (each checkpoint's oracle verify passed: 678 and 622 calls), then range 2 measured, then ranges 3–4 |

## Old design

`core/crates/layerfs-daemon/src/sdk/compare.rs` at `bcb52a1f4`: `changes()`
(`:174`) opened a `window::Walker` on each root (`:184`, `:185`) and merged the
two complete listings in path order, descending into every directory pair. It
skipped emitting equal entries but still listed them, so every call read every
directory of both trees, and the inode values behind them.

Why no cheaper skip existed in the format: a directory's content root maps
name → inode serial, and inode values (size, content, mode) live in the root's
per-tree inode table, a content-addressed B+tree keyed by serial. Two trees can
share a directory id while a file under it changed (its serial is unchanged,
its inode value is not), so "equal directory id ⇒ equal subtree" is false. The
inode-table difference does give the changed serials cheaply, but locating a
serial's path needs its parent, which the format did not record.

Counter: `diff_commits` statements 5,069 → 6,617 → 8,213 and VM steps
176,552 → 317,220 over ranges 0–2 with one changed file in the diffed pair.

## New design

Placement (owner review): the walk lives in Content,
`core/crates/layerfs-content/src/compare/changes.rs` (364 lines).

- `BindingHints` is a narrow port Content defines:
  `bindings_of(child) -> Vec<(parent, name)>`. Content does not depend on
  History.
- The daemon's `sdk/compare.rs` keeps only the adapter: `CatalogHints` wires
  `HistoryCatalog::bindings_of` to the port, plus arguments, the reply budget,
  paging and `SdkValue`.

How a diff runs (`ChangeWalk::plan`):

1. `inode_differences` (`compare/tree.rs`) lists the serials whose inode value
   differs between the two inode tables. It descends only the B+tree pages that
   differ.
2. Each changed serial is located on each side by following its recorded
   bindings up to the root. Every hint is checked against that side's own tree:
   `lookup(parent, name) == child`. The walk needs at least
   `namespace_ref_count` verified bindings per changed inode, so a hard-linked
   file is found at every name.
3. The pruned descent:
   - a directory pair with the same serial visits only the names whose
     binding changed, plus the names leading to marked inodes;
   - a pair with mismatched serials, or a directory on one side only, is merged
     with full windowed listings (64 names or 8 KiB per window).
4. The daemon emits each pair, skipping an equal pair and a directory pair
   with the same serial and metadata root.

`ChangeWalk::full` is the full listing merge, moved from the daemon in the same
fix. It is used when `plan` answers `None`. The daemon's `window::Walker` stays
in the daemon for grep and glob reads.

Bound: O(changed inodes × path depth + entries of changed directories),
independent of tree size and history depth. `plan` returns `None`, and the full
walk answers, when a changed inode has fewer verified bindings than its
reference count, or when more than `MAXIMUM_CHANGED` (65,536) inodes changed.

### binding_hint (Store format)

`binding_hint(child, parent, name)` is a STRICT, WITHOUT ROWID table with all
three columns in the primary key (`history.sql`). Rows are written with
`INSERT OR IGNORE` in batches of 4,096 rows per write transaction, from three
producers:

- **Init** records every binding of the imported tree
  (`layerfs-project/src/import/hints.rs`, timer `history.record_bindings`),
  before `initialize_layerstack`.
- **A daemon Commit** records `new_bindings(effective base → new root)` in phase
  `bindings`, before publish (`layerfs-daemon/src/store/commit.rs:210`,
  `store/hints.rs`).
- **An SDK merge** records `new_bindings(ours → merged root)` before
  `merge_branch` (`layerfs-daemon/src/sdk/branch.rs:400`).

Fork, fast-forward merge and `branch.publish` (`add_layer`) only point at
existing roots, so they make no new bindings. Every root this binary writes has
all its bindings recorded before it is published. A failed recording fails the
Commit or merge (one attempt, no retry). Rows written before a publish that
then fails stay as harmless extra hints.

**Growth.** Rows are only added; nothing ever deletes them. A row is a binding
some saved tree has had. Editing a file in place keeps its serial and adds no
row; a create, a rename, a copy, or a recreate under a new serial adds one row.
Measured with `sqlite3` and `dbstat`, read-only on byte copies of the
fast-rebuilt Stores (`diag-b0`/`b1`/`b2`):

| After range | Depth (Commits) | Rows | New rows | Rows per Commit | Pages (4 KiB) | Store file |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (Init + range 0) | 571 | 350 | 350 | — | 3 | 2,572,288 B |
| 1 | 1,114 | 463 | 113 | 0.21 | 4 | 4,837,376 B |
| 2 | 1,533 | 573 | 110 | 0.26 | 5 | 6,438,912 B |

Bytes per binding at range 2:

- 35.7 B allocated (20,480 B of pages / 573 rows);
- 22.7 B of cell payload;
- 14.1 B of name on average.

The old-format Store after the same range 2 was 6,434,816 B (range-002.a1
metrics). The new file is 4,096 B larger, and the hint pages are 0.32% of it.

**Projection to 202 ranges.**

- The plan has 241,761 file mutations in total (`fsFiles` + `sandboxFiles` over
  `plan/range-*.json`). Ranges 1–2 added 0.22 and 0.28 rows per file mutation.
- At 0.28, that is about 68,000 rows, or about 2.4 MB at 36 B per row.
- A conservative bound: one row per file mutation, doubled for directories and
  merge rebinds. That is about 484,000 rows, or about 17 MB.
- SPEC §7's budget at range 2 is `diskBudget` 128,961,785,856 B, against a
  projected Store of 53,691,887,616 B (0.42). The bound adds 0.013% of the
  budget and leaves the 0.42 unchanged.

**Correctness of a stale or missing hint.** Hints are never trusted:

- A stale hint (a binding of another tree or an older tree) fails the
  per-side check `lookup(parent, name) == child`, and is ignored.
- A missing hint leaves fewer verified bindings than `namespace_ref_count`, so
  `plan` returns `None` and the full walk answers.
- A wrong answer would need a hint that passes the tree check but is not a real
  binding, which is impossible because the check is that binding.

`history_diff_oracle` compares the pruned answer with an in-test full walk of
both trees over random histories (seeds 352, 7 and 2026; 120 steps; renames,
copies, removals, forks, merges every 20 steps; page sizes 1,000 and 3). It
also asserts that every binding of every saved tree has a hint.

**How often the full walk happens in the replay.**

- *Missing hints:* never, for Stores built by this binary. Init, every daemon
  Commit and every SDK merge record their bindings before publish, and nothing
  else makes a root. A Store built by an older binary has no `binding_hint`
  table and is refused at open (schema check); it is never diffed with
  missing hints.
- *Over 65,536 changed inodes:* a diff changes at most every inode of both
  trees. The largest checkpoint tree in the plan has 16,297 files (range 201),
  so the cap would need more than about 16,000 directories on top of that.
  The probe diffs two adjacent Commits; the proof checkpoint diffs one range
  (hundreds of files).
- So no replay path is expected to fall back. A fallback would still be
  correct, only slower; the walk does not count fallbacks, and the probes show
  O(change) counters.

## Proof

- **`sdk_diff_size`**: trees of 10 and 100 directories × 30 files, a churn lane
  and `/hot`; diffs of one changed file at 2 and 60 Commits, after a warm
  sibling diff. Object batches and ids are equal in all four cells. Before the
  fix they were 98 at 300 files and 720 at 3,000; now they are 36 everywhere.
  SQL statements also pay metadata delta chains (capped at 8, at a
  layout-dependent position), so they are printed, not compared.
- **`history_diff_oracle`**: as above, the pruned answer equals the full walk,
  and every binding is recorded.

## Performance, old vs new

The new binary cannot open old-format Stores, so "the same snapshots" means the
same checkpoint trees and histories:

- **Old:** daemon `b9c332b7` on run `p1-pilot`'s range 0–2 snapshots (diagnostic
  copies).
- **New:** daemon `511dceed` on `p1-pilot-b`'s fast rebuild of the same plan
  (diagnostic copies `diag-b0`/`b1`/`b2`; range 2 fast-played only in the
  copy).

Both arms: a fresh daemon in a new service container, one sample per probe,
and ms excluding `sandbox.service`/`sandbox.create`. Diagnostic, outside
RANGES.md.

| Probe / measure | Snapshot | Cache | Old | New | Change |
| --- | --- | --- | --- | --- | --- |
| diff_commits statements | r0 / r1 / r2 | fresh daemon | 5,069 / 6,617 / 8,213 | 488 / 530 / 518 | −90% / −92% / −94% |
| diff_commits vm_steps | r0 / r1 / r2 | fresh daemon | 176,552 / 260,904 / 317,220 | 18,478 / 21,730 / 19,394 | −90% / −92% / −94% |
| diff_commits returned_rows | r0 / r1 / r2 | fresh daemon | 17,870 / 25,170 / 30,594 | 1,896 / 1,996 / 1,988 | −89% / −92% / −94% |
| diff_commits ms | r0 / r1 / r2 | fresh daemon | 57.6 / 77.8 / 95.3 | 11.9 / 11.2 / 11.2 | −79% / −86% / −88% |
| oneshot_commit statements | r0 / r1 / r2 | fresh daemon | 274 / 280 / 265 | 328 / 346 / 325 | +54 / +66 / +60 (the `bindings` phase) |
| oneshot_commit ms | r0 / r1 / r2 | fresh daemon | 58.2 / 75.7 / 83.7 | 73.9 / 71.4 / 79.6 | +27% / −6% / −5% (one sample each) |
| merge statements | r0 / r1 / r2 | fresh daemon | 1,176 / 1,218 / 1,176 | 1,292 / 1,358 / 1,304 | +10% / +11% / +11% (records the merged root's bindings) |
| merge ms | r0 / r1 / r2 | fresh daemon | 39.0 / 40.1 / 64.1 | 63.2 / 53.1 / 46.5 | one sample each |

The other twelve probes are unchanged within one or two VM steps (statements
equal).

Counter exponents against depth (571, 1,114, 1,533), before → after:

| Counter | Before | After |
| --- | --- | --- |
| `diff_commits.statements` | 0.475 | 0.070 |
| `diff_commits.vm_steps` | 0.592 | 0.079 |
| `diff_commits.returned_rows` | 0.540 | 0.052 |
| `diff_commits` ms | 0.501 | −0.068 |
| `oneshot_commit.statements` | −0.024 | 0.004 |
| `merge.statements` | 0.008 | 0.019 |

Storage:

- Store file after range 2 went from 6,434,816 B to 6,438,912 B (+4,096 B).
- Binding hints are 20,480 B (5 pages).

The cost is a flat ~60 statements per Commit and ~120 per merge.

## Left open

- **Seeds.** The new daemon has probe points for ranges 0–1 only through
  `~/lfs-history/metrics/probes-511dceed….json`. The fast rebuild produces no
  metrics or snapshots for those ranges.
- **Diagnostic gate check.** Run against the `diag-b2` probes with the seeds,
  `evaluate` gives Scaling watch (`read` ms 0.311) and Counters watch
  (`merge.fullscan_steps` 0.324, F-002's signature ring). Both are below act.
- **Full-walk fallback counter.** The walk does not count fallbacks. A
  regression to the full walk would show as `diff_commits` counters growing
  with tree size again.
