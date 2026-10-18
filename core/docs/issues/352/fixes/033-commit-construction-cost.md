# #352 · Commit construction cost: record windows (F1)

| | |
| --- | --- |
| Trigger | #352 liaison, 2026-10-19: root-cause and cut Commit cost. Commit after a first `pnpm install` 16.1 s (target ≤ 5 s, ≤ 4 overlay record jobs per inode); small one-file Commit 19 ms (target ≤ 5 ms). RCA first, then approved fixes one commit each |
| Kind | code path (namespace construction cursor), one overlay read statement, one Workspace port method, append-only telemetry. No Store format change, no overlay schema change |
| Branch | `claude/commit-cost-033`, based on `d679c84ee` (contains staging head `dd9193762`) |
| Approved | F1, F2, F3 in that order (liaison 2026-10-19). S1 (lazy delta-candidate load) and O1 (the Save's writer) are Storage's, not this record's. O2 and O3 are noted below |

## Root cause (before any edit)

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
