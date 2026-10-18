# #352 · Commit construction cost: record windows, direct new files, measured split, one-statement reads

| | |
| --- | --- |
| Trigger | #352 liaison, 2026-10-19: root-cause and cut Commit cost. Commit after a first `pnpm install` 16.1 s (target ≤ 5 s, ≤ 4 overlay record jobs per inode); small one-file Commit 19 ms (target ≤ 5 ms). RCA first, then approved fixes one commit each |
| Kind | code path (namespace construction cursor, captured file construction), one overlay read statement, one Workspace port method, append-only telemetry. No Store format change, no overlay schema change |
| Branch | `claude/commit-cost-033`, based on `d679c84ee` (contains staging head `dd9193762`) |
| Approved | F1, F2, F3 in that order (liaison 2026-10-19). Then, after F1's result, the liaison put F3 on hold and asked for the values and update split (counters only) before anything else. S1 (lazy delta-candidate load) and O1 (the Save's writer) are Storage's, record 034, not this record's. O2 and O3 are noted below |
| Commits | F1 `d5439e71a`, F2 `e5b868f09`, split counters `53edff9bb`, B1 `31a3507d4`. F3 written, not committed: recorded and skipped (see F3) |

## Root cause (before any edit)

> **Corrected after F1.** The RCA below inferred that Content's update took
> most of construct (8–10 s), because the s331 trace lost its `update` timer.
> F1's phase counters measured the values pass as the larger phase
> (7.77 s values, 4.80 s update in s664). Reason 3 (the new-file record route)
> was also underestimated: F2 measured about −3 s, not −0.5 to −1 s. The text
> below is kept as written before the edits.

Sources: record 026 samples `s331-pnpm-first-head` and `s359-small-commit-head`,
and warm `s437`. Counts are the Commit's own: the daemon's observation record
at the Commit minus the Status record just before it.

### Commit after a first pnpm install (47,938 inode rows; 38,528 files; 2,723 symlinks)

Trace: commit 15,256 ms = begin 35 + construct 13,283 + the rest. All of
construct is inside `captured.namespace`. The trace stops after 208 `file`
spans (`incomplete: true`) and loses the `update` timer, so the split between
the values pass and Content's update is not in that sample (F1 adds counters for it).

| What | Count | Time |
| --- | --- | --- |
| Overlay owner jobs | 1,505,093 | hold 7.38 s summed, lock wait 0.04 s |
| `operation_record` SQL statements | 3,296,279 | 4.50 s; 2.26 M rows returned, 581,631 written |
| Capture SQL statements | 181,034 | 0.39 s |
| Payload reads | 111,465 | 0.40 s; 415 MB read, 831 MB zeroed |
| Foreground transactions | 114,655 | begin + commit 0.37 s |
| Maintenance (reclaim) jobs | 20,153 | 0.84 s |
| Store writer statements | 103,732 | 2.23 s; 255 MB blob reads |
| Namespace `record_jobs` | 890,283 | 18.6 per inode |

Construction counters: header passes 8 × 6,373 rows, change passes 6 × 47.5k
(38,238 opens, 39,588 provider pages), value passes 4 × 47.6k, fresh passes
4 × 47.5k. Points: header 541,905, fresh 799,431, value 66,547, change 95,052.

Why the work is per inode:

1. Content's update runs a check pass, validation, directories, values and
   references. Each asks `is_new`, `directory_for` or `value_for` per serial
   or per binding. The cursor kept a 1024-slot residue memo per kind. Every
   miss was one overlay job, and each pass re-read every value with one
   `get` per row, because the slot had been overwritten since the last pass.
2. A batched `get_many` is one SQL statement per key plus a fence. Batching
   keys saves jobs, not statements.
3. A file with no base goes through the normalized-edit records: context
   write, seal, verify, verify. That is 4 record jobs per file and about
   3 rows written and later reclaimed, about 154k jobs here (F2).
4. The check pass's `check_point` asks the provider for each name the pass
   has just served: 95,052 capture lookups (F3).

### Small one-file Commit (s359: daemon 14.3 ms, wall 19 ms)

begin 7.2 · construct 2.1 (update 1.0; 38 record jobs for one inode) · finish 2.4 ·
logical.count 0.9 · validate 0.6 · bindings 0.5 · publish 0.2 · install 0.1 ms;
about 4.7 ms is outside the daemon trace. `begin` is Storage loading its
whole delta-candidate table on the handle's first Save: 8,721 rows, 8,191
fullscan steps, 6.2–6.8 ms, in both the cold and the warm-daemon arm (W1 never
saved). That is S1, Storage's.

### Ranked fixes and ceilings (estimates from the RCA)

| Fix | Where | Ceiling |
| --- | --- | --- |
| F1 record windows | namespace cursor, one overlay range read | record jobs 890k → ≤ 40k; about −5 to −7 s |
| F2 direct route for new files | captured file construction | −154k jobs, −115k reclaimed rows; about −1 s |
| F3 change points from the held page | namespace cursor | −95k capture lookups; about −0.4 s |
| S1 lazy delta-candidate load | Storage (not this record) | about −6 ms on the small Commit |
| O1 the Save's writer (2.2 s) | Storage (not this record) | needed for ≤ 5 s |
| O2 payload zeroing at 2× the bytes read | overlay (not this record) | 0.1–0.2 s |
| O3 fewer update passes | Content (not this record) | after F1 the passes cost windows, not rows |

## F1 · record windows

### Design

- **Overlay** (`lifetime/indexed_operation_record.rs`, `database/statements.rs`):
  `indexed_operation_record_entries_after(scope, kind, after)` is one
  key-ordered `SELECT key,value … LIMIT 64` under the same fence as
  `keys_after`. It never refuses on size. The window stops before the row
  that would take its values past one record envelope (`OPERATION_RECORD_BYTES`),
  always returns at least one row while rows remain, and returns whether the
  kind ends there. A row past the envelope is stepped, but its value is not
  copied. The caller continues after the last key (owner's limits rule,
  2026-10-18). The query plan check covers both forms.
- **Port** (`ports/operation_record.rs`): `operation_record_entries_after`.
  The default (a key window, then one point read per key) keeps other
  providers working. The Overlay and the Store service's `OwnerClient`
  serve it as one job.
- **Cursor** (`construction/namespace/cursor.rs`): every pass reads windows of
  up to 64 (key, value) rows, one job each. Every header, value and
  fresh-rank point is answered from a held window. A window covers a serial
  range and answers absence inside it. A miss reads the window that starts at
  the asked serial and holds it. Each kind holds a fixed ring of 16 windows
  (at most 1,024 answers, the old memo's size). Sealed records cannot change,
  so a held answer cannot go stale. Windows live only inside one Cursor, and
  nothing is kept across jobs outside it. The fresh pass now also checks that
  each serial carries the next dense rank.
- **Counters**: `window_jobs` counts the windows read (they are also
  `record_jobs`). `normalize_ns`, `values_ns` and `update_ns` are the wall
  time of the three phases, as observations.

### Telemetry schema change

Observation section 15 (`commit_namespace`) and the traced `construction` map
are **appended**, 31 → 35 values: `window_jobs`, `normalize_ns`, `values_ns`,
`update_ns`, after `fresh_points`. No field moves. The #333 decoder
(`tools/decode_observations.py`) names the four new fields. A 31-value record
decodes as before, with the new names absent and nothing `unnamed`
(`test_commit_namespace_decodes_old_and_current_lengths`). The traced map is
by name, so its readers (dsh model, `cost.mjs`) need no change.

## F2 · direct route for new files

### Design

A file the immutable base does not hold has one edit: an insert of its whole
final length. The record route still wrote a context record and that edit,
sealed and verified them (four record jobs, about three rows, later
reclaimed) and then read the file's runs. `CapturedFileEdits::construct_new`
makes the same binding as `prepare` and refuses a file the base holds
(`captured new file has a base`), then builds the file straight from its
captured runs with `construct_runs`. The namespace's values pass uses it for
each fresh file (`stored.is_none()`). Base files keep the record route.

### Why no check is lost

- The binding is the same function (`bind`): engine/route/owner checks, the
  reader's exact root, the captured inode's serial, kind and link count, the
  base file lookup, and the creation-binding check against the reader.
- The record route's checks guard records that can be rewritten underneath
  the construction: the context is verified before the first run and again
  before the stream ends. The direct route writes no record. Its inputs are
  the same reader's snapshot facts (final size, runs) that the record route
  read after its checks, so there is no rewritable record to verify.
- `Complete` and `construct_runs` are unchanged. `Complete` checks the context
  at the end only when it is `sealed`; the record route passes `sealed: true`.
- Custody is unchanged: a failed binding or construction returns the file's
  whole original custody, as `construct` does. The namespace attempt still
  constructs each serial once.

### Tests

- `captured_new_file_route.rs` (new): five new files (empty, small, sparse,
  300 KB multi-chunk, a piece claimed from committed content) built on both
  routes from the same captured input give the same root, length, emitted
  object ids in order and oracle bytes. The direct scope has no record left.
  A base file is refused on the direct route, keeping custody, emitting
  nothing.
- Two namespace tests used file-scoped record applies as evidence that a file
  was constructed. They now check the sealed VALUE record's content root plus
  a pinned zero for the file scope (`captured_namespace_states.rs`,
  `captured_namespace_holds.rs`). That is not a weaker check: the VALUE row is
  what the update reads.

## F3 · change points from the held page (recorded, skipped)

The change pass's `check_point` asks the provider for each name the pass has
just served (95,052 capture points in the pnpm Commit). F3 answers a point
from the parent page the same pass holds, inside the same capture snapshot,
and falls back to the provider otherwise. The code, the adapted custody and
cursor tests and a concurrent-write test (a write to the same directory during
the change pass is not seen by this Commit and is captured by the next) passed
on the host (workspace suite 172/172). The liaison put it on hold after F1's
result, and after the split it was recorded and skipped (liaison,
2026-10-19). It is kept as a patch (`r033-f3-held-page.patch` in the #352
shared notes), not committed. Measured ceiling: at most −0.4 s, likely −0.2 s.

## Values and update split (counters only)

`53edff9bb` appends 12 values to observation section 15 (35 → 47; no field
moves; the decoder reads 31-, 35- and 47-value records, tested):
`inode_page_ns`, `file_ns`, `file_bind_ns`, `file_source_ns`,
`values_emit_ns`, `values_record_ns`, `update_record_ns`, `update_capture_ns`,
`update_emit_ns`, `backing_calls`, `backing_keys`, `backing_ns`.
`CapturedFileWork` gains `bind_ns` and `source_ns`. No behaviour change.
Emit time is the caller's consumer: in the daemon, Storage's `Save::accept`
(through `Staging`).

s681 (pnpm-first, binary `r033-split`), the Commit's own counters:

| Phase / part | ms | Notes |
| --- | --- | --- |
| **values** | **4,937** | 38,528 files, 2,723 symlinks, 47,624 values |
| inode pages + base demands | 37 | |
| file constructions (whole) | 4,444 | includes the three rows below |
| · bind (captured inode, base file) | 162 | |
| · run reads (payload, committed) | 1,199 | 111,465 payload statements, 415 MB read, 831 MB zeroed (O2) |
| · Storage `Save::accept` | 2,598 | all objects of the pass, symlinks and metadata included |
| · chunking, hashing, Content (rest) | ≈ 485 | |
| record jobs | 287 | values, ranks, headers |
| rest (symlinks, metadata, pass) | ≈ 169 | |
| **update** | **4,346** | |
| Content state via `Backing` | 2,624 | 222,567 calls, 1,348,670 keys (one overlay statement per key) |
| cursor record windows | 683 | 35,843 windows |
| captured name reads | 412 | 39,588 parent pages + 95,052 points |
| Storage `Save::accept` | 263 | |
| Content's own compute (rest) | ≈ 364 | |
| normalize | 63 | |
| outside construct | ≈ 1,530 | finish, logical.count (O1-a, record 034), validate, bindings, publish |

**Correction to F1's claim.** The adapter's record jobs are 0.95 per inode,
but Content's state calls through the same overlay scope are another 4.67 per
inode (222,567). Counted together, 5.6 record jobs per inode: the ≤ 4 target
is **not** met.

## Measured results

All samples `cost.mjs case <id> --part lfs`, one per arm, from
`layerfs-issue359-prep` (golden switch cancelled). Times are the daemon trace
(`commit` span). Load is the 1-min/5-min/15-min average at the sample; per the
owner's direction (2026-10-19) samples were not deferred or repeated for load,
and counts are the primary evidence.

| Arm | Sample | Source | Load | Commit ms | construct | values | update | owner jobs | opr stmts | record jobs | writer s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RCA reference | s331 | record 026 head | 7.3 | 15,256 | 13,283 | — | — | 1,505,093 | 3,296,279 | 890,283 | 2.23 |
| base | s659 | r034 base `f72b9b9c` | 38.1 (disturbed) | 50,782 | 32,367 | — | — | 1,513,830 | 3,296,575 | 890,579 | 19.04 |
| F1 | s664 | `d5439e71a` | 20.2 | 14,753 | 12,626 | 7,765 | 4,797 | 681,412 | 2,362,012 | 45,310 | 3.17 |
| F2 | s675 | `e5b868f09` | 21.6 | 11,019 | 9,553 | 5,078 | 4,413 | 505,767 | 2,053,604 | 45,073 | 1.54 |
| split | s681 | `53edff9bb` | 14.4 | 10,877 | 9,347 | 4,937 | 4,346 | 505,726 | 2,053,553 | 45,023 | 1.50 |
| B1 | s687 | `31a3507d4` | 13.1 | 11,799 | 10,169 | 5,917 | 4,190 | 505,662 | 1,352,184 | 44,966 | 2.38 |

Small one-file Commit (trace ms): base s649 13.8 (wall 18.6) · F1 s661 13.1
(wall 16.4) · F2 s673 13.1 (wall 17.0). `begin` stays 6.6–6.8 ms (S1,
Storage's). Not resampled for the split.

- The base before-arm s659 ran under load 38 with other measurements; its
  times are not evidence, its counts are (they match s331). F1's time gain is
  judged against s331.
- s683 is an accidental second sample of the split arm (a `--help` flag that
  `cost.mjs` does not parse ran the case again). It is kept, append-only, and
  not used: trace 10,611 ms, the same counts.
- Interference: other sessions' containers (`layerfs-issue352-scale-s4-*` and
  others) were running during every sample. Record 034's samples s677/s679
  ran in the same window.
- Reuse: the before-arm s659/s649 is record 034's base build `f72b9b9c`,
  whose product source is identical to this branch's base `d679c84ee`.
- None of these arms contains record 034's O1-a (logical.count after finish,
  −1.2 to −1.6 s). It is separate and stacks with these fixes.

### Production LOC beside the gain

| Change | Production LOC | Gain (trace, pnpm-first) |
| --- | --- | --- |
| F1 record windows (overlay statement, port method, cursor, 4 telemetry fields) | +168 | record jobs 18.6 → 0.95 per inode; Commit 15,256 → 14,753 ms (s331 → s664, different load) |
| F2 direct new-file route | +102 | construct 12,626 → 9,553 ms; owner jobs −176k; writer 3.17 → 1.54 s |
| Split counters | +134 | none (counters only); construct 9,553 → 9,347 ms, within noise |
| B1 one-statement `get_many` | +53 | Content state 2,624 → 2,457 ms (−167 ms); statements −701k |

## Re-ranked after the split (measured ceilings)

Against s681: Commit 10.9 s, target ≤ 5 s.

| Rank | Fix | Owner | Measured part | Ceiling |
| --- | --- | --- | --- | --- |
| 1 | Storage `Save::accept` during construction | Storage (record 034, O1) | 2,861 ms (values 2,598 + update 263) | the largest single part; this record cannot reach 5 s without it |
| 2 | O1-a logical.count after finish | Storage (record 034) | in the 1,530 ms outside construct | −1.2 to −1.6 s (034's figure) |
| 3 | B1 Content's state in fewer statements: `get_many` as one statement per call, or Content's update reading its state by windows (F1's shape) | overlay (cleared files) + Content | 2,624 ms, 1.35 M keys in 222k calls | −0.8 to −1.5 s; one statement per call saves the per-key statements (≈ 1.45 µs each), windows save the calls too |
| 4 | O2 payload zeroing (831 MB zeroed for 415 MB read) and run reads | overlay payload | 1,199 ms | −0.2 to −0.5 s |
| 5 | O3 fewer update passes (8 header, 6 change, 4 value, 4 fresh) | Content | 683 ms windows + part of 412 ms names | −0.3 to −0.5 s |
| 6 | F3 points from the held page | this record (held) | part of 412 ms | ≤ −0.4 s, likely −0.2 s; record and skip unless the rest lands |

Chunking and hashing (≈ 485 ms) and Content's own compute (≈ 364 ms) are the
work itself. Ranks 1–3 together are about −5 to −6 s; with them the Commit
would be near the 5 s target, and without rank 1 it cannot reach it.

## B1 · many record keys as one statement per call

Cleared by the liaison (2026-10-19) by the overlay route only; Content's
update is untouched.

### Design

- **Overlay** (`database/statements.rs`, `lifetime/indexed_operation_record.rs`,
  plan in `diagnostics/indexed_operation_record_plan.rs`):
  `indexed_operation_record_get_many` is one statement per call. The asked
  keys are a `VALUES` list, the outer loop of a `CROSS JOIN` with one
  primary-key search per slot, and rows come back in asked order (checked).
  A slot past the asked keys carries kind −1, which no row holds, so one
  statement text serves every call. A call answers a **prefix**: it stops at
  the keys one statement binds (SQLite's variable limit, two per key plus
  the scope's two, and at most `PAGE_ROWS`) and before the value that would
  take the reply past one record envelope, without copying it. It answers at
  least one key while keys remain and never refuses on key count or bytes.
  Before, it ran one statement per key and refused past 64 keys or the
  envelope.
- **Port** (`ports/operation_record.rs`): the `get_many` contract is that
  prefix. The default (one point read per key) answers every key and stays
  valid.
- **Content's backing** (`construction/records.rs`,
  `IndexedEditRecords::get_many`) asks again for the rest until every key is
  answered in the asked order, so Content's one-call `read_keys` sees the same
  full answer. Each call is one owner job.
- **Tests**: overlay, 150 keys across the 64-key boundary with missing keys,
  a repeat, other kinds and another file scope, equal to point reads, with
  prefixes [64, 64, 22]; envelope stops with misses between ([4, 4, 2] and
  [2, 2]); the plan searches the primary key with no temporary B-tree.
  Workspace, 160 keys through the port in four prefixes (one envelope stop),
  equal to point reads.

### Result (s687 against s681)

| | s681 split | s687 B1 | Δ |
| --- | --- | --- | --- |
| `operation_record` statements | 2,053,553 | 1,352,184 | −701,369 |
| `operation_record` SQL time | 2.97 s | 2.73 s | −0.24 s |
| Content state via `Backing` | 2,624 ms | 2,457 ms | −167 ms |
| backing calls / keys | 222,567 / 1,348,670 | 222,560 / 1,348,670 | same |
| owner jobs, hold | 505,726, 5.00 s | 505,662, 4.81 s | −0.19 s |
| update | 4,346 ms | 4,190 ms | −156 ms |
| values · Storage `Save::accept` | 2,598 ms | 3,564 ms | +966 ms (Storage writer 1.50 → 2.38 s) |
| Commit (trace) | 10,877 ms | 11,799 ms | +922 ms |

**B1 lands short of its ceiling** (−0.8 to −1.5 s estimated, −0.17 s
measured on its own part), so per the liaison it stops here; the
Content-window variant is not cleared. The statements fell by 701k, but the
per-statement cost was not what the backing time paid for: SQL time fell only
0.24 s. The rest of the 2.46 s is the 222,560 owner jobs themselves (about
11 µs each: fence, lock, reply copy) and `apply`'s precondition read plus
write per change, which B1 does not touch. The Commit's higher total comes
from Storage's `Save::accept` and writer in the values pass (+0.97 s), which
B1 does not touch either; it is one sample under different load and is not
attributed to B1.

Linux daemon checks on `31a3507d4` (pinned image, worktree-local target):
store_commit 10, mounted_commit 9, mounted_install 4, concurrent_commits 3,
r5_5_install_survival 4, mounted_commit_failures 4, all pass. Host: overlay
suite 64/64, workspace suite 173/173, Clippy clean.

### What remains (recorded, not built)

- **O2** payload zeroing and run reads: 1,186–1,199 ms measured;
  ceiling −0.2 to −0.5 s. Not built.
- **O3** fewer update passes: cursor windows 677–683 ms plus part of
  412–419 ms of name reads; ceiling −0.3 to −0.5 s. Not built.
- **Calls, not statements**, are what remains of Content's state cost:
  222k owner jobs at about 11 µs. Only fewer calls (the Content-window
  variant, not cleared) or a cheaper job would reach it.

## Integration (staging, 2026-10-19)

F1, F2 and the values/update split counters are integrated on the #352
staging branch (`claude/dsh-352-integration-c98eb1`, step 11), merged at
`c8314371d`. B1 (`31a3507d4`, +53 LOC, −167 ms on s687) and its docs
`695ead9ac` are measured, not integrated — owner decision 2026-10-19; F3
recorded and skipped.
