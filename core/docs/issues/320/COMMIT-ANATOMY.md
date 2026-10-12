# Issue 320 — anatomy of one Commit: record jobs, wall time, and what was fixed

> **Status:** Diagnosis; host in-process measurement; not a qualified result.
> Everything here was counted or timed on a macOS host, in one process, over a
> real Disposable/WAL/synchronous=OFF Store and the real local overlay owner,
> without a mount, with `LAYERFS_CONSTRUCTION_WORKERS=1`. Nothing here is a
> mounted or Linux measurement and no speed-up of the mounted product is claimed.

"Measured" below means an exact count pinned by a test, or one timed sample of
the loop named. "Inferred" is marked as such.

## 1. Method

| Experiment | Tool | What it gives |
| --- | --- | --- |
| E1 counts | `layerfs-daemon/tests/commit_record_anatomy.rs` with the pass-through provider `tests/support/record_counts.rs` | record jobs of one Commit by owner, kind and call; statements by family; Content and Store read counters |
| E2 wall | `layerfs-daemon/tests/commit_wall_anatomy.rs`, optimized build (`cargo test --release`, `CARGO_PROFILE_RELEASE_DEBUG=1`) | wall per Commit and per phase; owner and Store service time |
| E2 profile | `/usr/bin/sample <pid> <s> 1` folded by `tools/sample_areas.py` | share of Commit-thread samples by product area and leaf work |
| Fence | `layerfs-overlay/tests/indexed_operation_record_fence.rs` | refusal kinds, their precedence and statements of each record job |
| Merge | `layerfs-content/tests/filesystem_sorted_localized.rs` | pages demanded by the sorted merge; byte-identity against recorded roots |

E1 runs the product constructor's own steps through the counting provider and
asserts that the counted calls equal the owner's `OperationRecord` job delta.
Its `small` and `large` shapes equal the product route's counts
(`product_commit_cost`: 472 and 17,276). The `step` shape is built to resemble
one tier 1 Commit (55 inode rows, 36 entry rows, 27 constructed files; the tier
1 reference is 54.8 + 35.4 rows and 1,555 record jobs).

The profile run started `sample` beside the loop inside one shell command with
`&` and `wait`; the loop ended by itself and nothing was left running.

Statements are the engine's own `attempts`. SQLite's run counter also counts an
insert's accounting trigger and is not used.

## 2. E1 — record jobs of one Commit (measured, exact)

| | small | step | large |
| --- | ---: | ---: | ---: |
| inode rows + entry rows | 14 + 10 | 55 + 36 | 480 + 192 |
| constructed files | 5 | 27 | 384 |
| **record jobs** | **472** | **1,497** | **17,276** |
| by owner: producer (Workspace namespace records) | 124 | 341 | 5,970 |
| by owner: Content namespace update | 324 | 1,011 | 8,714 |
| by owner: Workspace file plan | 24 | 145 | 2,592 |
| by owner: Content edit engine | 0 | 0 | 0 |
| by call: contains / get / apply / first_keys / keys_after | 0 / 357 / 70 / 2 / 43 | 1 / 1,200 / 256 / 2 / 38 | 24 / 14,600 / 2,566 / 2 / 84 |
| applied changes | 133 | 490 | 4,875 |
| key windows that came back empty | 22 | 20 | 20 |
| constructor reader jobs (Read class) | 72 | 222 | 1,980 |
| statements: Workspace / Lease / record | 628 / 557 / 668 | 1,989 / 1,732 / 2,221 | 21,836 / 19,269 / 24,460 |
| statements: Begin = Commit | 76 | 262 | 2,572 |

Gets are 76–85% of all record jobs. Step, by kind:

- **Content namespace (1,011):** `fresh.get` 242, `row.get` 242, `touch.get`
  242 — one triple per read of a reference row
  (`layerfs-content/src/filesystem/references/indexed.rs:58-82` and `:93-124`) —
  `row.apply` 110, `root.get` 46, `work.apply` 36, `work.get` 18, `node.get` 18,
  `fresh.apply` 14, `parent.get` 11, `root.apply` 9, topology 14, others 9.
- **Producer (341):** `fresh.get` 144, `value.get` 97, `header.get` 46,
  `context.get` 17, 32 key windows, 4 writes, 1 contains.
- **File plan (145):** `context.apply` 54, `context.get` 53, `edits.apply` 24,
  `edits.get` 14. Per file scope: 3 jobs for a mode-only file, 5 for a new
  file, 6 for a stored file's edit, 8 for a replaced tiny file.

Reconciled with the model in the brief (979 / 279 / 297): namespace 1,011, file
plan 145, producer 341. The model overstated file scopes because of the next
point.

**Edit engine jobs per base file.** A file whose final length is stored as one
whole-file object (10 B and 20,000 B were tried) never reaches the edit engine:
6 plan jobs, 0 engine jobs for overwrite, append, replace and truncate
(`layerfs-content/src/file/edit/apply.rs:183-261` selects the representation).
A chunked file (300,000 B and 2 MiB gave identical counts) costs, besides the 6
plan jobs: overwrite 49, append 19, replace 13, truncate 17 engine jobs. The
model's "25–40 per base file" holds for chunked files only; no file of the
three shapes is chunked, which is why their edit-engine column is 0.

## 3. E2 — where one Commit's wall time goes (measured; macOS host)

One sample per shape, 14 s loops, at most 100 Commits of history per Workspace,
clocked route. Times are means in ms per Commit. "Before" is commit
`ea7535a42`; "after" is `63a1ab005` (the merge change of section 5).

| shape | rows / files | wall before | wall after | construct outside ports before → after | record port (jobs) | after-construct |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| step | 91 / 27 | 51.0 | 45.7 | 19.0 → 11.0 | 18.7–22.0 (1,503) | 10.2 → 9.1 |
| step-no-files | 48 / 0 | 22.1 | 20.2 | 10.1 → 6.4 | 6.5–8.3 (596) | 4.2 → 4.0 |
| step-double-files | 132 / 54 | 79.4 | 66.5 | 34.6 → 19.1 | 30.0–34.3 (2,464) | 9.9 → 7.8 |
| new-24 | 52 / 24 | 29.8 | 21.2 | 11.0 → 2.3 | 11.7–12.4 (850) | 5.2 → 4.6 |
| stored-24 | 24 / 24 | 33.1 | 26.1 | 13.1 → 6.3 | 8.5–9.0 (645) | 8.5 → 7.9 |
| one-mode | 1 / 1 | 7.05 | 3.57 | 4.0 → 0.84 | 0.70–0.77 (66) | 1.6 → 1.4 |

The record-port column gives both runs; the jobs are identical and the spread
is run-to-run noise on a shared machine. Capture, acquire and release together
are 0.6–0.7 ms.

Step, before: owner record service 17.5 ms for 1,503 jobs (11.7 µs per job);
7,556 statements took 17.1 ms, of which the 3,744 Workspace and Lease fence
statements took 6.9 ms (1.85 µs each). Port wall minus owner service is 0.8 µs
per call.

Profile of the product route (step shape, before, 392 Commits, 17,325 samples
of the Commit thread at 1 ms):

| By first service reached | share |
| --- | ---: |
| owner jobs run on the Commit thread | 42.1% (Content namespace 26.6, file plan 8.0, producer 6.4, driver 1.1) |
| Store reads of base objects for Content's namespace update | 30.1% |
| `save.finish` | 16.6% |
| daemon Store ports (reads) | 6.3% |
| Content and Workspace own code | ≈4% |
| History publish | 0.9% |

| By leaf work | share |
| --- | ---: |
| macOS system SQLite purgeable page cache | 18.1% |
| own code | 16.9% |
| hashing | 14.6% |
| SQLite | 14.4% |
| file I/O | 13.6% |
| zstd | 5.8% |
| copy / alloc | 5.4% / 5.2% |
| clock reads / counter upkeep | 3.0% / 2.5% |
| waiting | 0.6% |

The owner thread was parked for 94.6% of its samples.

## 4. E3 — answers

1. **Fixed cost.** A one-row Commit cost 6.5–7 ms before and 3.4–3.6 ms after
   the merge change. Before, 4.0 ms of it was outside both ports — Store reads
   of base pages for the namespace update — 1.6 ms was finish, validate,
   publish and install, 0.7 ms was its 66 record jobs and 0.7 ms capture,
   acquire and release.
2. **Per-file cost.** From step-no-files → step → step-double-files (before):
   about 1.07 ms per changed file with its rows: 0.45 ms record port (33.6
   jobs), 0.07 reader port, 0.33 outside ports, 0.22 after construct.
3. **Hand-off or statements.** Statements. With one Workspace the submitting
   thread takes the owner's turn itself whenever nothing is queued and the
   connection is free (`layerfs-daemon/src/overlay/owner.rs:351-366`), so
   nearly every record job runs on the Commit thread: port wall minus service
   is 0.8 µs per call and the owner thread is parked. A record job costs what
   its statements cost: about 5 statements and 11.7 µs for a read.
4. **Diagnostics.** Clock reads and counter upkeep are about 5.5% of the Commit
   thread, spread over every statement and job. Material but not dominant;
   nothing was changed there.
5. **What should transfer to the mounted Linux product, and what may not.**
   Counts transfer exactly: jobs, statements, transactions, pages demanded. The
   structure should transfer: the inline owner turn, Store reads dominating the
   fixed cost, statements dominating a record job. Absolute times may not: the
   macOS system SQLite keeps its page cache in purgeable memory and pins it
   around every use (18% of Commit-thread samples; no other SQLite build does
   this), and host file I/O differs. Under concurrent mount traffic the owner
   queue is not empty, so the inline turn is taken less often and hand-off cost
   appears that this loop cannot show (inferred).
6. **History.** Before the merge change, Store writer transactions per step
   Commit rose from 122 (Commits 1–10) to 406 (81–90) and wall from 45.6 to
   about 56 ms. After it the step loop's last third is no slower than its
   first (46.2 → 43.5 ms). `product_commit_history_cost` (4 inode rows per
   Commit, about ten leaves) still shows pack selections per Commit rising with
   history, 9 → 36 over 12 Commits (9 → 41 before): a changed leaf's read still
   costs one pack read per live pooled value group. That is the Store's pooled
   inode-value format, outside this work.

## 5. Changes made

| Commit | What | Predicted | Observed |
| --- | --- | --- | --- |
| `63a1ab005` | The sorted merge reads the children a change reaches | 3 leaves for a 3-leaf change in an 80-leaf page | leaves demanded 80 → 3; pages read 81 → 4 |
| `4e9a9396a` | A record write reads its Workspace row once | −70 / −256 / −2,566 Workspace statements | 628 → 558, 1,989 → 1,733, 21,836 → 19,270 |
| `402a01dfa` | One fence statement for every indexed record job | −472 / −1,497 / −17,276 Lease statements | 557 → 85, 1,732 → 235, 19,269 → 1,993 |
| `e3ae1faa4` | A sealed key pass ends on a short window | −16 record jobs per Commit | 472 → 456, 1,497 → 1,481, 17,276 → 17,260 |

### 5.1 The sorted merge (`63a1ab005`)

Cause: `Engine::edit` read every child of each branch page it merged
(`layerfs-content/src/filesystem/sorted/merge.rs`, the branch loop). A branch
row holds a key and a child identity only, so the merge read each sibling for
its count, bytes and fill, and to compare their sum with the page's recorded
totals. Neither is needed to write the page: a stored non-root page is always
filled, and the new totals are the stored totals less the children read plus
what replaced them. The rule now implemented, the proof of byte-identical
output and what the merge no longer re-checks are in
[the filesystem architecture, §5.4](../../architecture/04-filesystem.md).

| per Commit | small | step | large |
| --- | ---: | ---: | ---: |
| inode pages read | 36 → 6 | 37 → 11 | 35 → 28 |
| Content objects read | 41 → 11 | 45 → 19 | 59 → 52 |
| Content bytes read | 148,953 → 26,133 | 157,615 → 51,171 | 161,210 → 132,552 |
| Content read waves | 8 → 11 | 11 → 19 | 26 → 52 |
| Store value-group requests | 36 → 7 | 37 → 12 | 36 → 29 |

Created, reused, change and untouched counts are unchanged, as are record jobs
and overlay statements. Two costs are accepted and need the lead's decision:
unread children are not re-validated against their parent, and a dense update
issues one read wave per changed child where it issued one batch per branch
page (the `large` row).

### 5.2 The record fence (`402a01dfa`)

A record job ran two fence statements, the Workspace row and the owner row. It
now runs one: the Workspace row's lifecycle with the owner's existence as a
scalar subquery (`layerfs-overlay/src/database/statements.rs`,
`OPERATION_FENCE`; `lifetime/operation.rs`, `fence_operation`). The refusals
and their order — stale route, then closed for a write, then stale owner — are
decided from that one row in the same sequence, and
`indexed_operation_record_fence.rs` asserts the same refusal table as before
the change. Its plan is `SEARCH workspace USING INTEGER PRIMARY KEY`, `SCALAR
SUBQUERY 1`, `SEARCH operation_owner USING PRIMARY KEY (ns=? AND owner=?)`. A
read job is now 2 statements and a one-change write 6.

### 5.3 The key pass (`e3ae1faa4`)

The producer's pass over a sealed record kind ended only on an empty window.
It now ends on a window shorter than 64 keys; the port states that a provider
never returns a short window while later keys exist. The empty windows that
remain per Commit (6, 4 and 4) are Content's own: the two touched-row passes
(`references/indexed_rows.rs:28`), the placed-topology pass and the drain of
the release work list, which must see an empty window because rows are added
while it runs. The first two kinds could take the same rule (−3 jobs per
Commit); not done.

### 5.4 Several keys in one read job (stage A of section 6)

The record port has a seventh job: the values of at most 64 keys, in the order
asked, under one fence (`IndexedEditBacking::get_many`,
`OverlayOperationRecords::operation_record_get_many`,
`Overlay::indexed_operation_record_get_many`, the daemon's
`IndexedOperationRecordJob::GetMany`). Both trait methods default to asking for
each key in turn, so a provider that does not serve them together behaves as
before. The values of one job share one 64 KiB reply envelope: a job whose
values exceed it together is refused where single reads would succeed, so a
caller may only batch keys whose values are small by construction.

Its first user is the reference reducer: the fresh member, the row and the
touched witness of one serial are one job
(`layerfs-content/src/filesystem/references/indexed.rs`, `stored`). The three
values are checked in the order they were once read in. Predicted: two jobs and
two fence statements fewer for each of 68, 242 and 2,064 triples. Observed:
record jobs 456 → 320, 1,481 → 997 and 17,260 → 13,132; Workspace statements
542 → 406, 1,717 → 1,233 and 19,254 → 15,126; record statements unchanged.

One difference in a failing state: when the fresh member or the row is
invalid, the reads that used to follow it are no longer skipped, because all
three arrive in the one job. No further job follows the refusal.

### 5.5 State after these commits (measured, exact)

| per Commit | small | step | large |
| --- | ---: | ---: | ---: |
| record jobs | 320 | 997 | 13,132 |
| record jobs at `ea7535a42` | 472 | 1,497 | 17,276 |
| Workspace + Lease + record statements | 406 + 85 + 652 | 1,233 + 235 + 2,205 | 15,126 + 1,993 + 24,444 |
| the same three families at `ea7535a42` | 628 + 557 + 668 | 1,989 + 1,732 + 2,221 | 21,836 + 19,269 + 24,460 |
| Begin = Commit (write transactions) | 76 | 262 | 2,572 |

Record jobs fell by 32%, 33% and 24%; statements of the three families by 38%,
38% and 37%. Write transactions are unchanged. None of these counts was timed
after `63a1ab005`.

## 6. Recommendation — removing the per-key record jobs

Owner direction of 2026-10-13 allows interface and overlay-schema changes.
After the fixes above, per step Commit: 1,497 record jobs = 1,200 gets, 256
writes, 41 key windows and membership tests; about 6,500 statements, of which
3,465 are the two-statement fence and 786 are Begin, Commit and the free-list
read of 262 transactions. A read job is 2 fence statements and 1 record
statement, so the fence and the transaction frame — not the record statement —
are most of the statement count.

Stage A below is built (section 5.4); B and C are not.

**Stage A — several keys in one read job.** Add, with a default that loops over
the single read so that every existing provider keeps its behaviour and its
first-failure order:

```rust
// layerfs-content/src/file/edit/backing.rs, trait IndexedEditBacking
/// Original raw values of at most 64 keys, in the order asked, as one job.
fn get_many(&mut self, keys: &[EditRecordKey]) -> ContentResult<Vec<Option<Vec<u8>>>>;

// layerfs-workspace/src/ports/operation_record.rs, trait OverlayOperationRecords
fn operation_record_get_many(
    &self,
    scope: IndexedOperationRecordScope,
    keys: &[IndexedOperationRecordKey],
) -> WorkspaceResult<OperationRecordReply<Vec<Option<Vec<u8>>>>>;

// layerfs-overlay, impl Overlay
pub fn indexed_operation_record_get_many(
    &self,
    scope: IndexedOperationRecordScope,
    keys: &[IndexedOperationRecordKey],
) -> OverlayResult<Vec<Option<Vec<u8>>>>;
```

First use: the reference row's three reads (`fresh`, `row`, `touch` of one
serial) become one job with one fence. Expected record jobs: small 472 → 336,
step 1,497 → 1,013, large 17,276 → 13,148 (two jobs fewer for each of 68, 242
and 2,064 triples), and four statements fewer per triple.

**Stage B — one fence statement, and one write per window of rows.** (1) Merge
the Workspace and owner fence of a record job into one statement returning both
facts, keeping the order stale route, closed for writes, stale owner: one
statement fewer per record job (472 / 1,497 / 17,276 before stage A). (2) Let
the reference reducer read the rows of one window with one `get_many` and write
their transitions with one `apply`; today each row is one triple read and one
write transaction (110 `row.apply` in step). This needs the reducer to process
the binding edges of a window together and is the larger change. Expected after
A and B: step about 560 jobs (inferred, not counted).

**Stage C — producer and file plan.** The producer's point reads per serial
(`fresh` 144, `value` 97, `header` 46 in step) take the same `get_many`; a new
file scope's context-open, edits and seal become one write (step: 78 file-plan
writes → 27); a sealed key pass ends on a window shorter than 64 instead of
asking for one more (−16 jobs per Commit). Expected after A–C: step about 335
jobs (inferred).

Order: A first (mechanical, default keeps every double working), then B(1),
C, then B(2).

Tests to restage at each stage: `commit_record_anatomy` (all totals),
`product_commit_cost` (472 and 17,276), `indexed_operation_record_fence`
(statements per job), `job_cost`, `r4_9_driver_causes`, `construction_cursor`,
and the Workspace producer tests that count jobs
(`layerfs-workspace/tests/producer/mod.rs`).

Risks to hold in review:

- **A serial twice in one window.** A rename touches one serial as a removal
  and as a retained binding. A window that reads every row first and writes
  afterwards must apply the second transition to the first one's result, not
  to the stored row; guard values in the single write must be the stored ones.
- **First-failure order.** A batched read returns one refusal for the job. It
  must be the refusal the first key would have produced, and a failed job must
  leave the provider terminal exactly as a failed single read does.
- **Atomicity per page.** A window's write is one transaction. A refusal in it
  applies nothing, where today the rows before the refused one are already
  written. Anything that releases custody per row must release per window, and
  the retained-capacity envelope (64 KiB per write) bounds the window.
- **Bounded lists.** `get_many` takes at most 64 keys and returns values inside
  the same envelope; no caller may size a request from a file's or a
  directory's length.

## 7. Not determined

- Mounted and Linux cost of any of the above: not run here (host only).
- The per-wave cost of a Store read on Linux, which decides how much the dense
  case's extra waves matter.
- Whether the inline owner turn is still taken under concurrent mount traffic.
- Stage B and C job counts are inferred from the E1 kinds, not counted.
