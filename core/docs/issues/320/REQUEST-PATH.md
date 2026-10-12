# Issue 320 — what one filesystem request costs the overlay owner, and what was removed

> **Status:** Diagnosis and four implemented changes; host in-process counts;
> not a qualified result. Every number called *measured* is an exact count
> pinned by a host test on macOS over the real overlay owner and a real
> Disposable/WAL/synchronous=OFF Store, without a kernel mount. No mounted or
> Linux test was run, no wall time was measured, and no speed-up of the mounted
> product is claimed. Numbers called *predicted* were not observed.

Branch `perf-experiments-e`, cut from `0cbd84213`. Commits, each with its
production LOC comparison in its message:

| Commit | Change | Production LOC |
| --- | --- | --- |
| `ae589dbbd` | counting only: the replay and its pins | 82,299 -> 82,299 |
| `9916b6c81` | a visit reads the rows of one name once | 82,299 -> 82,330 |
| `026be5b32` | a visit's fence reads the row of the inode it names | 82,330 -> 82,394 |
| `5b906774f` | FORGET's fence in one statement; the release reads each fact once | 82,394 -> 82,464 |
| `cd075772c` | a write reads the row shapes of its slots once | 82,464 -> 82,476 |

## 1. Method

`layerfs-daemon/tests/request_path_anatomy.rs` replays the kernel request
sequences of cells C01, C03, C04, C06 and C10 through the daemon's Fuse port
on the real owner, in order, without a mount. The sequences come from the
opcode counts of the retained receipts
(`docs/issues/307/checks/r7-optimization-20261009`). A test-only observer
(`tests/support/statement_trace.rs`, `sqlite3_trace_v2`) names the template of
every statement; it changes no statement, plan or product counter, and the
test checks that its count equals the engine's own `attempts`. Pinned per kind
of request: owner jobs by class, write transactions, attempts, executions and
statements by template (`tests/support/request_path_counts/cNN.txt`); VM steps
are pinned under SQLite 3.51.0 only.

Two readings of "statements" exist and both are reported:

- **attempts**: statements the engine ran.
- **executions**: `SQLITE_STMTSTATUS_RUN`, which a cell receipt sums. It counts
  each accounting trigger program run as well as each statement.

Families 0, 1 and 2 of a cell receipt are `PRAGMA main.freelist_count`,
`BEGIN IMMEDIATE` and `COMMIT`: the frame of every write transaction, not a
liveness check. The fence was already one statement per job before this work.

Replay against the receipts at `ae589dbbd` (requests with a job / owner jobs /
executions): C01 5,001 / 5,002 / 44,004, C04 5,341 / 5,342 / 42,644 and C06
517 / 518 / 9,766 equal their receipts (a FLUSH has no job). C10 is 1,545 /
1,547 / 14,408 against 1,547 / 1,546 / 14,406: the base file's LOOKUP takes two
visits in the replay and one in the mount. C03 is 9,020 / 9,037 / 102,202
against 9,022 / 9,038 / 102,537: one GETATTR more in the mount, and about 334
orphan-domain probes that depend on how late each FORGET arrives. The mount's
C03 count is timing dependent (102,537 and 102,540 were both observed by the
coordinator); the replay sends every FORGET directly after its UNLINK.

## 2. Measured: cells, before and after

Executions / attempts; write transactions did not change (C01 3,000, C03
5,018, C04 3,220, C06 514, C10 1,029).

| Cell | `ae589dbbd` | `9916b6c81` | `026be5b32` | `5b906774f` | `cd075772c` | change |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | 44,004 / 37,003 | 40,004 / 33,003 | 36,003 / 29,002 | same | same | -18.2% / -21.6% |
| C03 | 102,202 / 86,183 | 96,202 / 80,183 | 89,200 / 73,181 | 82,200 / 66,181 | same | -19.6% / -23.2% |
| C04 | 42,644 / 36,073 | 40,404 / 33,833 | 36,073 / 29,502 | same | same | -15.4% / -18.2% |
| C06 | 9,766 / 7,711 | 9,762 / 7,707 | 9,246 / 7,191 | same | 7,710 / 5,655 | -21.1% / -26.7% |
| C10 | 14,408 / 12,349 | 14,403 / 12,344 | 13,372 / 11,313 | same | 12,348 / 10,289 | -14.3% / -16.7% |

VM steps under SQLite 3.51.0, first and last commit: C01 1,670,068 ->
1,554,143 (-6.9%), C03 3,625,149 -> 3,349,222 (-7.6%), C04 1,609,503 ->
1,529,988 (-4.9%), C06 439,105 -> 407,839 (-7.1%), C10 607,943 -> 582,358
(-4.2%). VM steps fall less than statements: the removed statements were short
point reads.

## 3. Measured: statements per request, by kind

Attempts per request (executions in brackets where they differ), at
`ae589dbbd` and at `cd075772c`.

| Request | Before | After | What went |
| --- | --- | --- | --- |
| GETATTR | 2 | 1 | the row read (fence reads it) |
| LOOKUP, name absent | 4 | 2 | the row read; the second name read |
| LOOKUP, name found (C04) | 10 | 9 | the directory's row read |
| CREATE | 16 [21] | 12 [17] | three name reads; the directory's row read |
| MKDIR | 15 [20] | 12 [17] | the same |
| WRITE inside one cell | 9 [10] | 8 [9] | the file's row read |
| WRITE of 64 KiB | 11 [13] | 9 [11] | the row read; one of two shape reads |
| WRITE of 128 KiB | 15 [19] | 11 [15] | the row read; three of four shape reads |
| SETATTR | 7 | 6 | the row read |
| OPEN | 7 [8] | 6 [7] | the row read |
| OPENDIR | 8 [9] | 7 [8] | the row read |
| UNLINK | 17 [20] | 13 [16] | two name reads, the directory's row read, the orphan probe |
| FORGET of a removed one-cell file | 28 [34] | 22 [28] | section 4.3 |
| RELEASE | 6 [7] | 6 [7] | nothing |
| READ of 128 KiB | 2 | 2 | nothing |
| READDIR (visit and publish), RELEASEDIR | 9.65 [10.6], 8 [9] | unchanged | nothing |

What a request still runs, by template (C01, per file): GETATTR
`FENCE_LOOKUP_ROW`; LOOKUP `FENCE_LOOKUP_ROW`, `NAME_LAYERS`; CREATE
`FENCE_LOOKUP_ROW`, `NAME_LAYERS`, frame (3), `INODE_INSERT`, `INODE_UPDATE`,
`DIRECTORY_ENTRY_PUT`, native-lookup-insert, file-handle-insert,
`FILE_OPEN_LOOKUP_ADD`, `FRONTIER_ADVANCE`; WRITE `FENCE_FILE_ROW`, frame (3),
`CELL_COVER`, `CELL_PUT`, `INODE_UPDATE`, `FRONTIER_ADVANCE`; RELEASE
`FENCE_FILE`, frame (3), file-handle-drop, `FILE_OPENS_DROP`. That is 29
statements and 7 trigger runs for one created file; 9 of the 29 are the frame
of three write transactions.

## 4. The changes: prediction, observation, plans

### 4.1 A visit reads the rows of one name once (`9916b6c81`)

A visit evaluates its decision in rounds and its publication decided the
name's inheritance from the name's rows again: `NAME_LAYERS` ran twice for a
LOOKUP, four times for a CREATE and three times for an UNLINK, for one name.
The job's stack row memory (`namespace/job_rows.rs`) now keeps the rows of at
most `COMPOUND_DIRECTORY_ENTRIES` (2) names; a name beyond them is read by its
statement as before. Nothing outlives the job.

- Predicted: C01 40,004, C03 96,202, C04 40,404, C06 9,762, C10 14,403.
  Observed: the same five numbers.
- No statement text changed. `NAME_LAYERS`:
  `SEARCH directory_entry USING PRIMARY KEY (ns=? AND parent=? AND name=? AND gen>? AND gen<?)`.
- Tests: `layerfs-overlay/tests/job_name_rows.rs` (a publication from the
  job's own read equals one that reads for itself over every stored shape of a
  name, in two Workspaces of one engine; a kept read ends with its job; a
  failed job leaves nothing; more names than are kept).

### 4.2 The fence reads the row of the inode the request names (`026be5b32`)

Every deciding visit ran its fence and then `INODE_LOOKUP` for the same
serial. `FENCE_LOOKUP_ROW`, `FENCE_FILE_ROW` and `FENCE_HANDLE_ROW` are the
fence with `LEFT JOIN inode i ON i.ns=w.ns AND i.serial=?4 AND i.gen<=w.active
AND i.gen>w.installed ... ORDER BY i.gen DESC LIMIT 1`; the row starts the
job's row memory. While the engine holds an orphan, an inode read asks the
orphan domain first, so the fence's row is not kept then and the read stays
where it was. READ, READLINK, RELEASE, FORGET and directory-handle jobs keep
the plain fences.

- Predicted: one statement fewer for every deciding visit. Observed: C01
  -4,001, C03 -7,002, C04 -4,331, C06 -516, C10 -1,031, which are the counts
  of deciding visits.
- Plans (the three differ only in the reference's subquery):

  ```
  SEARCH w USING INTEGER PRIMARY KEY (rowid=?)
  SEARCH m USING INTEGER PRIMARY KEY (rowid=?) LEFT-JOIN
  SEARCH i USING PRIMARY KEY (ns=? AND serial=? AND gen>? AND gen<?) LEFT-JOIN
  CORRELATED SCALAR SUBQUERY 1
    SEARCH l USING PRIMARY KEY (ns=? AND mount=? AND serial=?)
  ```

  No scan and no sorter: the latest generation is the first row of the
  reversed key range.
- Tests: `layerfs-overlay/tests/native_visit_row.rs` (the fence's row equals
  the indexed row with no local row, an active row, a lower row after a
  capture, a new active row above it, and after install, by lookup and by
  descriptor, in two Workspaces; an orphan keeps the read where it was; every
  refusal has the same outcome in one statement, with a closed Workspace
  refused before the mount and the reference; the plans).
- One pin changed meaning: the named inode's row holds one of the job's four
  row places even when the decision never reads it (`job_rows.rs`). Every
  real visit reads the named row first, so what it keeps is unchanged.

### 4.3 FORGET and the release of a removed file (`5b906774f`)

- `FENCE_FORGET` reads the Workspace row, the mount row and the lookup row in
  one statement (was three).
- The releasing job retires a lower layer in two steps of one transaction. It
  now keeps for that transaction that no generation owner holds the layer and
  that a step dropped a short page of its rows, so the second step does not
  ask `GENERATION_HELD` or the payload page again. A queue item's step starts
  from nothing, as before.
- `LAYER_SUPERSEDED` decides in one statement whether an emptied layer's row
  may be deleted (was incarnation, Workspace row and `LAYERS`). The owner's
  queue turns use it too.
- UNLINK does not probe for an orphan row while the engine holds none.

- Predicted: FORGET 28 -> 22, UNLINK 14 -> 13, C03 82,200 / 66,181, nothing
  else. Observed: exactly that.
- Plans:

  ```
  FENCE_FORGET
    SEARCH w USING INTEGER PRIMARY KEY (rowid=?)
    SEARCH m USING INTEGER PRIMARY KEY (rowid=?) LEFT-JOIN
    SEARCH l USING PRIMARY KEY (ns=? AND mount=? AND serial=?) LEFT-JOIN
  LAYER_SUPERSEDED
    SEARCH w USING INTEGER PRIMARY KEY (rowid=?)
    CORRELATED SCALAR SUBQUERY 1
      SEARCH i USING PRIMARY KEY (ns=? AND serial=? AND gen>? AND gen<?)
  ```

- Tests: `layerfs-overlay/tests/forget_release.rs`. Every refusal of FORGET
  (zero count, no lookup row, another Workspace's mount, a revoked mount, more
  than the kernel holds, the implicit root count) has the same outcome, in one
  statement and no transaction, with nothing written in three Workspaces of
  one engine; a closed Workspace still forgets. A removed file of 0, 1, 13,
  14, 15 and 40 payload rows, not installed and installed, leaves the same
  rows after the FORGET's own job, takes the same number of owner turns after
  it and leaves the same rows in the end. The two release tests were also run
  against the previous production code and printed identical outcomes.

FORGET of a removed one-cell file still runs 22 statements: frame (3),
`FENCE_FORGET`, native-lookup-drop, `FILE_LOOKUPS_DROP`, `ORPHAN_LOOKUP`,
`LAYERS`, orphan-wait-drop, orphan-lower-top, `GENERATION_HELD`,
layer-payload-page, `CELL_DROP`, orphan-payload-page, orphan-shrink-page,
orphan-inode-drop, orphan-drop, orphan-rows, file-custody-drop,
maintenance-drop, layer-shrink-page, `LAYER_SUPERSEDED`.

### 4.4 A write reads the row shapes of its slots once (`cd075772c`)

Whole cells are written one 32 KiB slot at a time and each slot ran its own
`CELL_SHAPES`. The write now reads the shapes of the slots ahead once, for at
most one read window of slots (at most 32 shapes, no bytes); a write that
starts in the middle of a slot reads once more for its fifth slot. A slot's
write changes rows of its own slot only and a partly covered first cell is
written before the first whole one, so each slot sees the rows its own read
returned.

- Predicted: C06 7,710 / 5,655, C10 12,348 / 10,289, the others unchanged.
  Observed: exactly that.
- No statement text changed. `CELL_SHAPES`:
  `SEARCH payload USING INDEX payload_generation (ns=? AND gen=? AND serial=? AND cell_offset>? AND cell_offset<?)`.
- Tests: `layerfs-overlay/tests/write_shapes.rs` (counts of a fresh, an
  overwritten and a slot-shifted window; 160 writes at slot, cell and byte
  alignments over whole-slot rows, one-cell rows with and without a mask,
  holes and stale rows, read back against the model, beside another
  Workspace). The same sequence on the previous production code passed every
  read-back and stored the same 20 rows and 585,295 bytes.

## 5. Pins that moved

Host tests, all run and passing at `cd075772c`:

| Test | Pin |
| --- | --- |
| `layerfs-daemon/tests/request_path_anatomy.rs` and its five count files | every commit |
| `layerfs-daemon/tests/read_cost.rs` | `LOOKUP_BASE`, `GETATTR_BASE`, `LOOKUP_UNSEEN`, `OPEN_BASE`, `OPEN_LOCAL`, `OPEN_UNSEEN` |
| `layerfs-daemon/tests/directory_cost.rs` | `OPENDIR_LOCAL`, `OPENDIR_BASE` |
| `layerfs-workspace/tests/native_unlink_cost.rs` | `LOOKUP`, `CREATE`, `WRITE`, `UNLINK`, `FORGET`, `FORGET_PAGE`, `FORGET_MIGRATED`, `LIVE_FORGET`, `INODE` |
| `layerfs-workspace/tests/native_visit_cost.rs` | getattr, lookup, `CREATE`, `WRITE`, `TOTAL` (37/44 -> 29/36) |
| `layerfs-overlay/tests/job_rows.rs` | the named row's place |
| `layerfs-overlay/tests/costs.rs` | write window (8,12,8,19) -> (5,9,8,16); overwrite (4,4,0,14) -> (1,1,0,11) |
| `layerfs-overlay/tests/payload_fragmentation.rs` | 14 -> 11, 58 -> 55, 15 -> 13 |

Mounted (Linux) tests: **no pin moved, and none was run.** Every `mounted_*`
and `native_*` test of `layerfs-daemon` was searched for the counters these
changes move (name, inode, payload and custody statement families, statement
totals, `sql_foreground`). `mounted_sqlite_full.rs` and `mounted_drain.rs`
print totals or pin maintenance lease statements only;
`mounted_failure_scope.rs` and `native_control.rs` pin Store session
statements; `native_jobs.rs` pins `BEGIN` and `COMMIT` executions, which did
not change. A mounted pin that the search missed would show as an exact-count
failure on Linux.

## 6. Mounted cell expectations

Expected counts of the twelve cells at `cd075772c`. **None of them was run.**
They come from a source model: statements per kind of request, before and
after, applied to the request mix the mount issued. The model was first
checked against the old numbers: for every cell it reproduces the statement
count of a mounted receipt taken before these changes, from that receipt's own
per-opcode request counts, and that count is the frozen one
(`timing-baseline-20261010/baseline.json`, with the named C10 correction of
`CELL_COUNT_CORRECTIONS`). The receipts are
`2026-10-13-issue320-i3b-run-cells/C01..C12` and, for C07,
`2026-10-13-issue320-i1b-run-cells/C07`, read at the end-of-command snapshot of
`observations.opcode_work`.

Requests and owner jobs do not change: no change adds, removes or splits a
request or a job. Statements are executions.

### 6.1 The model

Executions per request, before -> after. "Measured" kinds are pinned by the
host replay or by `read_cost`; "derived" kinds are a measured kind with one
known difference.

| Request | Before -> after | Basis |
| --- | --- | --- |
| state job of the status call | 1 -> 1 | measured |
| GETATTR | 2 -> 1 | measured; deciding visit |
| LOOKUP, absent name in the root | 4 -> 2 | measured; deciding visit, two name reads become one |
| LOOKUP, absent name in a directory made in this Workspace | 3 -> 2 | measured (C04); one name read before and after |
| LOOKUP of a base file, first in its mount | 13 -> 11 | derived: `read_cost` `LOOKUP_BASE` (10 -> 8) plus the lookup row and custody row it inserts with their two trigger runs |
| OPEN | 8 -> 7 | measured; deciding visit |
| CREATE in the root | 21 -> 17, the first in a mount 22 -> 18 | measured; the first inserts the root's local row |
| WRITE inside one cell | 10 -> 9 | measured; deciding visit |
| WRITE of 64 KiB, new rows | 13 -> 11 | measured; deciding visit and one of two shape reads |
| WRITE of 128 KiB, new rows | 19 -> 15 | measured; deciding visit and three of four shape reads |
| first WRITE of 128 KiB into a base file | 20 -> 16 | derived: the same with the inode's first local row inserted |
| OPENDIR | 9 -> 8 | measured; deciding visit |
| UNLINK of a last link, no orphan held | 20 -> 16 | measured |
| FORGET that releases a removed one-cell file | 34 -> 28 | measured |
| READ, RELEASE, READDIR, RELEASEDIR | unchanged | plain fences, measured |
| FLUSH, refused COPY_FILE_RANGE, STATFS | no job, no statement | |

A deciding visit loses its separate row read only while the engine holds no
orphan (section 4.2). C03 and C12 remove files; every other cell never holds
an orphan, so its count does not depend on timing.

### 6.2 The table

| Cell | Requests | Owner jobs | Statements before (frozen) | Model before | Statements expected | Exact |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | 5,002 | 5,002 | 44,004 | 44,004 | **36,003** | yes |
| C02 | 6,002 | 6,002 | 46,004 | 46,004 | **37,003** | yes |
| C03 | 9,022 | 9,038 | 102,540 | 102,204 + P | **82,201 + 2P** | no, see 6.3 |
| C04 | 5,342 | 5,342 | 42,644 | 42,644 | **36,073** | yes |
| C05 | 5,890 | 6,000 | 46,637 | 46,637 | **39,853** | yes |
| C06 | 518 | 518 | 9,766 | 9,766 | **7,710** | yes |
| C07 | 1,551 | 1,550 | 23,133 | 23,133 | **19,018** | yes |
| C08 | 521 | 521 | 9,783 | 9,783 | **7,725** | yes |
| C09 | 517 | 517 | 1,055 | 1,055 | **1,051** | yes |
| C10 | 1,547 | 1,546 | 14,406 (corrected) | 14,406 | **12,345** | yes |
| C11 | 517 | 517 | 9,760 | 9,760 | **7,708** | yes |
| C12 | 3,436 | 3,439 | 24,146 | not modelled | about 19,920 | no, see 6.4 |

"Exact" means: for the frozen request mix. A different mix (a kernel that
issues one request more or fewer) moves the number by that request's row of
6.1.

How each "model before" is built, and the same sum after:

- **C01, C04, C06**: the host replay issues the mount's requests and equals
  the receipt exactly before the changes (sections 1 and 2); the expected
  number is the replay's measured number after them.
- **C02** = C01 and 1,000 GETATTR of the files `stat` names: 44,004 + 2,000 =
  46,004; after, 36,003 + 1,000.
- **C05** = C04 and `find`: 101 GETATTR, 112 OPENDIR, 222 READDIR, 112
  RELEASEDIR and one STATFS. The receipts' family counts of C05 minus C04
  are those requests exactly (inode statements 435 = 101 + 112 + 222, one
  fence for each of 658 jobs, 335 write transactions = 112 + 112 + 111) and
  sum to 3,993 = 46,637 - 42,644. The 213 deciding visits lose one statement
  each: 36,073 + 3,993 - 213.
- **C06**: state job, one absent LOOKUP, two GETATTR, the first CREATE, 512
  WRITE of 128 KiB, one RELEASE: 1 + 4 + 4 + 22 + 9,728 + 7 = 9,766; after,
  1 + 2 + 2 + 18 + 7,680 + 7.
- **C07** = C06 and `cp` of the file just written (its reads are served by
  the page cache: the mount issued none): two absent LOOKUP, two GETATTR, one
  OPEN, one CREATE, 1,024 WRITE of 64 KiB, two RELEASE: 9,766 + 8 + 4 + 8 +
  21 + 13,312 + 14 = 23,133; after, 7,710 + 4 + 2 + 7 + 17 + 11,264 + 14.
- **C08** = C06 and `cat` (page cache again): one GETATTR, one OPEN, one
  RELEASE: 9,766 + 2 + 8 + 7 = 9,783; after, 7,710 + 1 + 7 + 7.
- **C09**: state job, one GETATTR, the base file's LOOKUP, one OPEN, 512
  READ, one RELEASE: 1 + 2 + 13 + 8 + 1,024 + 7 = 1,055; after, 1 + 1 + 11 +
  7 + 1,024 + 7.
- **C10**: state job, two GETATTR, the base file's LOOKUP, two absent LOOKUP,
  one OPEN, the first CREATE, 512 READ, 1,024 WRITE of 64 KiB, two RELEASE:
  1 + 4 + 13 + 8 + 8 + 22 + 1,024 + 13,312 + 14 = 14,406; after, 1 + 2 + 11 +
  4 + 7 + 18 + 1,024 + 11,264 + 14 = 12,345. This replaces the "about
  12,346" given earlier from the replay: the replay issues one GETATTR where
  the mount issues two, one READ more, and takes two visits for the base
  file's LOOKUP where the mount, whose daemon has seen the file in its
  warm-up mount, takes one. 12,345 is exact for the mount's mix.
- **C11**: state job, one GETATTR, the base file's LOOKUP, one OPEN, 512
  WRITE of 128 KiB of which the first inserts the inode's local row, one
  RELEASE: 1 + 2 + 13 + 8 + 9,729 + 7 = 9,760; after, 1 + 1 + 11 + 7 + 7,681
  + 7.

### 6.3 C03 is timing dependent

`rm` removes a file and the kernel sends that inode's FORGET later, not in
step with the next request. While a removed file waits for its FORGET the
engine holds an orphan, and every inode read of a visit asks the orphan domain
first. Let P be the number of such reads in a run (each is one more statement
before these changes).

- Before: 102,204 + P. The replay, which sends every FORGET at once, counts
  102,202; the mount issues one GETATTR more. The frozen 102,540 is P = 336;
  the sample that gave 102,537 is P = 333.
- After: 82,201 + 2P. Without any waiting FORGET the count is the replay's
  82,200 and the one GETATTR. A GETATTR in such a window costs two more than
  outside it (the probe, and its row read, which the fence could not keep);
  an UNLINK in such a window costs four more (two rows read, of which the
  directory's is the named one, and the orphan probe UNLINK otherwise skips)
  where it cost two more before. In both cases the extra is twice what it
  was, and the `rm` phase issues no other kind of visit.
- With the timing of the frozen sample: 82,873 (P = 336). With the other
  observed sample: 82,867 (P = 333). With no late FORGET: 82,201.

So C03 cannot be frozen as one number. A run's P can be read back from its
own receipt (the count is 82,201 + 2P and nothing else moves), and the
relation to the old runs is `after = 82,201 + 2 x (before - 102,204)`.
Requests (9,022) and owner jobs (9,038) do not depend on it.

### 6.4 C12 cannot be predicted exactly here

C12 is `git init`, 100 files, `git add`, `git commit`: 957 LOOKUP, 865
GETATTR, 231 CREATE, 235 WRITE, 229 OPEN, 106 UNLINK, 102 LINK, 97 MKDIR, 8
RENAME, 8 FORGET, 5 SETATTR, 5 OPENDIR, 1 SYMLINK and the requests that do not
move (READ, RELEASE, READDIR, RELEASEDIR). The replay does not issue this
sequence, LINK, RENAME and SYMLINK were never counted per request, the name
reads of each request depend on whether its directory exists in the base, and
the cell removes and replaces files, so it has C03's timing term too (its
samples gave 24,146 and 24,145). The estimate, each part with its assumption:

| Part | Statements | Assumption |
| --- | --- | --- |
| frozen before | 24,146 | |
| the named row read by the fence | -2,841 | every LOOKUP, GETATTR, SETATTR, MKDIR, UNLINK, SYMLINK, RENAME, LINK, OPEN, WRITE, OPENDIR and CREATE read its named inode's row, and none ran while an orphan was held |
| names read once | -1,327 | the receipt's 3,390 name statements are 553 writes (one per CREATE, MKDIR, SYMLINK, LINK and UNLINK, two per RENAME) and 2,837 reads; after, one read per name of a request: 1,510 |
| FORGET and release | -48 | each of the 8 FORGET releases a removed file of less than a page (six statements each) |
| UNLINK and RENAME orphan probe | -8 | eight last links removed while no orphan was held |
| writes | 0 | no write covers two whole 32 KiB slots |
| expected | about 19,920 | |

Each assumption can be off by a few statements, and a visit that runs while a
removed file waits for its FORGET keeps one. A range of 19,900 to 19,980 is
what this supports; it is an estimate, not a model result, and should be
recorded as a range. Requests (3,436) and owner jobs (3,439) do not change.

### 6.5 What the expectations rest on

- The receipts' request mixes. A run whose mix differs is not a failure of
  these changes; its count moves by the rows of 6.1.
- One mounted fact that the host cannot show: the base file's LOOKUP is one
  visit in C09, C10 and C11 because the daemon's warm-up mount has seen the
  file. The receipts show it (their Read-class job counts leave one job for
  it).
- Two derived rows of 6.1 (the base file's first LOOKUP and the first WRITE
  into a base file). Their before values reproduce C09, C10 and C11 exactly;
  their after values apply the measured changes of the kinds they derive
  from and were not themselves run.

## 7. The frame, several jobs per transaction, and the accounting triggers

### 7.1 The free-page answer (not built)

Admission needs the committed freelist count for two things: to subtract
reusable pages from the bytes a job must have reserved, and to refuse a count
larger than the file (`committed database length/accounting`, which
quarantines). The owner is the only writer, so the count changes only by its
own commits, but nearly every write transaction allocates or frees pages:
a remembered value is invalidated by the previous commit. Nothing cheaper than
the cookie read returns it. Two alternatives were examined:

- Reading it in the fence through `pragma_freelist_count`: the table-valued
  form prepares and runs the pragma as a nested statement on every use. It
  would lower the count of the engine's statements and raise the real work.
  Rejected.
- Skipping the read when it cannot change the decision: when the reserved
  tail already covers the job's whole budget (128 MiB for a cleanup job, 256
  MiB for a mutation) no allocation is made whatever the count is. After the
  first mutation that holds for most cleanup jobs (RELEASE, FORGET) and for
  few mutations, because the tail is established as budget minus reusable
  bytes and shrinks with every page the file grows. Predicted effect: one
  statement fewer for RELEASE and FORGET (C01 -1,000, C03 -2,000). It also
  skips the corrupt-header refusal for those transactions, which is a change
  to a failure-reporting path, so it was not built. It needs an owner
  decision.

The frame's other cost is not a statement: `allocation.state()` makes two
metadata system calls per write transaction (descriptor and path identity).

### 7.2 Several queued jobs in one transaction (not built)

Per-job failure must stay per job: a failed job rolls back alone and another's
published effect stays. That needs `SAVEPOINT` and `RELEASE` (or `ROLLBACK TO`
and `RELEASE`) around every job, which is two statements per job, the same as
`BEGIN` and `COMMIT`; a batch adds its own `BEGIN` and `COMMIT`. No statement
is saved. Limiting it to jobs that cannot fail after their fence does not
work either: any statement can fail (a unique key that refuses a repeated
request, a full device), and without a savepoint that failure undoes the
other jobs of the batch. It would also change what callers observe:

- a failed `COMMIT` makes every job of the batch Uncertain where one is today;
- a reply cannot be sent before the batch commits, so the first job waits for
  the last;
- admission reserves one job's bounded growth per transaction and would have
  to cover the batch;
- reply tickets are issued and withdrawn per transaction.

And the sequential cells would not gain: a submitter serves its own job
inline when it is the only one queued, so the queue never holds two.

### 7.3 Accounting triggers (not built)

SQLite triggers are per row; there is no statement-level form. The causing
statement cannot update another table. Doing it once per transaction means
every writing statement of about 20 tables reports its delta in Rust and one
`UPDATE accounting` runs before `COMMIT`. That includes deletes that reach
rows through a cascading foreign key, bulk deletes, the payload byte lengths a
delete does not load, and the indexed operation-record port that another
agent owns. Predicted effect in C01: 7 trigger runs per file
become 3 (CREATE 5 -> 1, WRITE 1, RELEASE 1), 4,000 fewer executions and no
fewer statements. The exact counts would then rest on every statement
reporting correctly instead of on the schema. Not built; it belongs with the
custody redesign below, which removes two of CREATE's five trigger runs by
removing their rows.

## 8. Not verified

- No mounted, FUSE or Linux run. The cell predictions of section 6 are
  arithmetic.
- No wall time. Fewer statements and VM steps are counts, not a measured
  latency change.
- VM steps are pinned under SQLite 3.51.0 (the macOS system library). The
  Linux build's SQLite may give other step counts; the test then skips that
  comparison and says so.
- The observer's Linux path (`sqlite3_auto_extension`) was never run; on
  macOS it binds `sqlite3_open_v2` in the test binary instead.
- "A Workspace closed while a job is queued" is covered where it is decided:
  jobs run one at a time, so the queued job runs after the close and its
  fence statement refuses it (`native_visit_row.rs`, `forget_release.rs`,
  and the existing `native_visit_fence.rs`). No new daemon-level test queues
  a job behind a close; the existing daemon suites passed unchanged.
- Failing before this work and still failing, not caused by it:
  `layerfs-daemon/tests/captured_edge_retention.rs` (`record_jobs` 38 against
  a pinned 42; checked by reverting to `ae589dbbd`), and Clippy
  `unnecessary_cast` in `tests/product_commit_history_cost.rs:152`.
  `complete_installed_roots` (needs `LAYERFS_Q1_PREPARED`) and `host_handoff`
  (needs the Linux binary) cannot run on this host.
- The whole `layerfs-daemon` suite does not fit one 115 s command; it was run
  as three bounded commands by test name range at every commit.

## 9. What to do next, by expected gain

Predicted, from the per-request tables; none of it is built.

1. **One custody row per file and mount.** CREATE writes three custody rows
   (lookup row, descriptor row, custody counts) and FORGET of a live file
   deletes two. The mount is one per namespace, so the lookup count can be a
   column of the custody row. Expected: CREATE and a positive LOOKUP one
   statement and one trigger run fewer, FORGET one statement fewer: C01 about
   -2,000 executions, C03 about -4,000. A schema change with its own
   revocation and cascade proofs.
2. **A removed file held only by kernel lookups without orphan rows.** UNLINK
   inserts an orphan row and an orphan-domain inode row that the FORGET
   deletes again, with a wait-row delete, a queue-item delete, the engine's
   orphan count read and two empty page reads on the way. Marking the custody
   row instead, and creating the orphan when a descriptor or reader first
   needs one, would take UNLINK from 13 to about 11 and that FORGET from 22 to
   about 14: C03 about -10,000 statements. It changes the stored state between
   UNLINK and FORGET and needs the orphan contract's proofs redone.
3. **One insert for the rows of a write window.** A 128 KiB write inserts four
   rows with four `CELL_PUT`. One statement of four value rows would take that
   write from 11 to 8 statements: C06 about -1,536, C10 about -1,024. Trigger
   runs stay per row.
4. **The cleanup frame** of 7.1, if the owner accepts skipping the header
   check when the reservation already covers the budget: C01 -1,000, C03
   -2,000.
5. **Accounting once per transaction** of 7.3: executions only.
