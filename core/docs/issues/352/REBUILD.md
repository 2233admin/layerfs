# #352 — Incremental by default: when a fix may rebuild the Store

> **Status:** Current, owner direction 2026-10-18. Binding on the lead, the fixer
> and the builder. Extends SPEC §6 "Fixes without redoing checkpoints"; where they
> differ, this file wins. A rebuild is the last resort, never the default.

## 1. What is never redone

- **Proof:** a checkpoint that matched git and its plan stays proven. Rebuilt or
  migrated Store bytes are checked against the same oracle; the proof record is
  not rewritten.
- **Measurements:** kept under the binary that took them (F2). A later binary gets
  its own series; nothing is relabeled.
- **Committed reports and comments:** never edited (F2).

Only **Store bytes** can change after a fix, and only by the cheapest kind below
that is correct.

## 2. The three kinds, cheapest first

| Kind | When it applies | What happens to earlier ranges | Recovery |
| --- | --- | --- | --- |
| **1. Forward-only** (default) | The fix changes code paths, or how *new* data is written; old data stays valid and readable | **Nothing.** Earlier objects, roots and history stay as written | Fork the newest snapshot; rerun the triggering range measured; continue |
| **2. Additive migration** | The fix needs a new table, index, column default or backfill, and the new binary can open an older Store and add it | **Migrate the newest snapshot only**, at open or with one migration command; older snapshots stay as evidence | Migrate the newest snapshot; check the oracle and `PRAGMA quick_check` once; rerun the triggering range measured; continue |
| **3. Incompatible** | Old data cannot be read correctly by the new binary, or was stored wrong | **Fast-rebuild** from the newest good snapshot (or from the plan if none is good), no timing or tests, checking every rebuilt checkpoint's oracle | SPEC §6 "Store format" / "Data written wrong" rows |

### Rules that keep a fix in kind 1 or 2

- **Content is immutable and content-addressed.** A better encoding (deltas,
  chunking, compression, packing) changes how *new* objects are stored. Old
  objects stay readable, so they are never rewritten for correctness. The
  storage effect starts at the fix and is reported under the new binary.
- **Readers accept both.** New code reads old objects, old roots and rows written
  before the fix. A missing optional record (an index entry, a hint, a cache)
  means the slower, correct path, never a refusal and never a wrong answer.
- **Schema changes are additive.** New tables and indexes are created when an
  older Store is opened; backfill is lazy (written as data is touched) or a
  bounded one-time migration. Never drop or reinterpret an existing column.
- **No refusal of older Stores** unless reading them would be wrong. "It would be
  slower" is not a reason to refuse.
- **Optional compaction is separate.** If old data should also benefit (for
  example re-encoding old chunks as deltas), that is a one-time compaction at a
  milestone, measured as its own operation, reported separately, and never a
  replay of ranges.

## 3. A rebuild needs a written justification

A kind 3 fix is allowed only when the fixer's record states, before any rebuild:

1. why kind 1 is wrong (what an old object or row would make the new code do
   incorrectly);
2. why kind 2 is impossible (why an additive migration or a fallback path cannot
   give correct answers);
3. the rebuild's cost: ranges to rebuild and estimated minutes at the current
   fast-rebuild rate, and the disk it needs;
4. the newest good snapshot it starts from (a data bug: found by the fixed
   checker, newest first).

The lead accepts or sends it back with the cheaper kind. The decision goes in
RESULTS.md's decision log.

**The later in the history, the higher the bar.** A rebuild at range 2 costs
seconds; at range 150 it costs hours. A format change that is truly needed is
made as early as possible (LESSONS S3) and batched with any other pending
format change, so the run rebuilds at most once for them.

## 4. Every fix states its kind

The fixer's `fixes/NNN-aK-<slug>.md` header and `finding-NNN.aK.json` carry:

| Field | Content |
| --- | --- |
| Kind | 1 forward-only · 2 additive migration · 3 incompatible |
| Old Stores | open unchanged · open and migrate (what is added) · refused (why) |
| Old data | still read as before · read through a fallback (which) · rewritten (why) |
| Recovery | fork newest snapshot · migrate newest snapshot · rebuild from rNNN (ranges, minutes) |
| Regression test for compatibility | for kind 1 and 2: a Store written by the old binary opens and reads correctly with the new one |

`checkFinding` refuses a kind 3 finding without the four justifications in §3,
and a kind 1 or 2 finding without the compatibility test.

## 5. Examples from this run

| Fix | Kind it was | Kind it should be | Why |
| --- | --- | --- | --- |
| 002.a1 fork, merge, grep, project lookup | 1 | 1 | Code paths only |
| 002.a1 `binding_hint` (diff_commits) | 3 (old Stores refused; ranges 0–1 rebuilt) | **2** | The diff already falls back to a full walk where a root has no hints; old Stores could open, record hints from then on, and stay correct. The rebuild was cheap at range 2 but set the wrong precedent |
| F-008 merge at publish | 1 | 1 | Changes how a Commit publishes; nothing stored changes |
| F-005 chunk delta bases | — | 1 | New chunks get delta bases; old full chunks stay readable |
| F-001 fs body streaming | — | 1 | Transport only |

## 6. Snapshots after a fix

- Kind 1: the newest snapshot keeps serving as the fork point.
- Kind 2: the migrated snapshot is a new manifest on the same line
  (`range-NNN.<run>.json`), sharing unchanged blocks; the unmigrated one stays
  as evidence until the next milestone, then follows SPEC §7 retention.
- Kind 3: the rebuilt line's snapshots form a new line in `lines.json`; the old
  line's blocks are kept until the reason is in BUGS.md, then removed by literal
  path.
