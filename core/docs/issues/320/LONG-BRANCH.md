# Issue 320: a new Workspace on an already long branch

> **Status:** Diagnosis; host in-process measurement; not a qualified result.
> Written 2026-10-13 on branch `perf-experiments-b`. Counts are exact and come
> from one run each. Wall times are single samples on a shared macOS host with
> no mount and no container; they show order of growth and nothing else.
> Nothing here is a claim about the mounted product.

## 0. What was run

Test [`long_branch_session`](../../../crates/layerfs-daemon/tests/long_branch_session.rs)
with its rig [`long_branch_rig`](../../../crates/layerfs-daemon/tests/support/long_branch_rig.rs).
A branch is built by the product itself: every Commit is
`BoundWorkspace::commit_captured` over a real Disposable/WAL/OFF Store and the
real local owner, from a Workspace that is closed and replaced after 50
Commits. The base is 40 directories of 50 files (2,041 inodes). Every Commit
has the shape of `product_commit_history_cost`: one new file, one stored file
rewritten, one stored file's mode and time changed (4 inode rows, 1 entry row).

| Shape | Which stored files successive Commits change |
| --- | --- |
| hot | The same 200 files of 4 directories in turn; new files go to those 4 directories |
| distributed | Every file of the tree in turn; new files go to all 40 directories in turn |

The Store is kept under `core/target/issue320/long-branch/` and copied at
P = 0, 50, 200, 500, 1,000 and 2,000 Commits (section 7 adds 100, 400 and
800). A measurement copies one of those files, opens it as a new daemon does (one writer, two read handles, 2 MiB
canonical cache, a new local overlay), binds a NEW Workspace on the branch
head and counts each step. `LAYERFS_CONSTRUCTION_WORKERS=1`.

```sh
D=$PWD/core/target/issue320/long-branch
LAYERFS_LONG_BRANCH_DIR=$D LAYERFS_LONG_BRANCH_EXTEND=hot:500 cargo +1.85.1 test ... \
  -p layerfs-daemon --test long_branch_session -- --exact extend_kept_branch --nocapture
LAYERFS_LONG_BRANCH_DIR=$D LAYERFS_LONG_BRANCH_MEASURE=hot:0,hot:500 cargo +1.85.1 test ... \
  -p layerfs-daemon --test long_branch_session -- --exact measure_new_session_on_kept_branch --nocapture
python3 -B core/docs/issues/320/tools/long_branch_table.py <logs>
```

Building 2,000 Commits took 4 invocations a shape, each under 60 s.

## 1. L1: a new session against P (before any fix, tree `2b32d0cd4`)

"Pack reads" are Storage acquisitions (`read_pack_selections`), each one Store
read transaction. "Catalogue" is `value_groups` calls, each one transaction
whose statement sorts. Producer counts are the Commit's own Storage handle;
reader counts are the daemon's two read handles together.

### Hot shape

| P | Step | Wall ms | Producer pack reads | Producer catalogue | Producer bytes | Writer tx | Writer statements | Writer VM steps | Full-scan steps | Sorts | Re-prepares | Reader pack reads | Reader tx |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | bind | 3.5 | | | | | | | | | | 12 | 25 |
| 0 | first lookup+read | 3.0 | | | | | | | | | | 16 | 33 |
| 0 | Commit 1 | 12.5 | 12 | 42 | 257,084 | 69 | 273 | 7,513 | 0 | 41 | 2 | 8 | 16 |
| 0 | Commit 2 | 8.1 | 15 | 4 | 268,638 | 32 | 126 | 3,161 | 0 | 2 | 2 | 10 | 16 |
| 0 | Commit 50 | 11.3 | 116 | 5 | 698,811 | 134 | 436 | 5,371 | 0 | 3 | 2 | 29 | 37 |
| 50 | bind | 3.8 | | | | | | | | | | 35 | 58 |
| 50 | first lookup+read | 5.4 | | | | | | | | | | 82 | 110 |
| 50 | Commit 1 | 26.2 | 119 | 151 | 710,379 | 304 | 1,092 | 21,566 | 49 | 150 | 2 | 31 | 37 |
| 50 | Commit 2 | 15.1 | 122 | 5 | 721,967 | 140 | 454 | 5,485 | 0 | 3 | 2 | 33 | 53 |
| 50 | Commit 50 | 13.2 | 225 | 5 | 1,169,922 | 243 | 764 | 7,328 | 0 | 3 | 2 | 21 | 29 |
| 500 | bind | 4.9 | | | | | | | | | | 35 | 58 |
| 500 | first lookup+read | 35.8 | | | | | | | | | | 653 | 705 |
| 500 | Commit 1 | 52.6 | 1,133 | 776 | 5,066,907 | 1,961 | 6,689 | 117,235 | 499 | 775 | 2 | 31 | 49 |
| 500 | Commit 2 | 20.9 | 658 | 5 | 2,952,993 | 676 | 2,063 | 15,585 | 0 | 3 | 2 | 33 | 39 |
| 500 | Commit 50 | 22.4 | 711 | 6 | 3,175,154 | 730 | 2,229 | 16,763 | 0 | 4 | 2 | 21 | 27 |
| 2,000 | bind | 7.6 | | | | | | | | | | 29 | 46 |
| 2,000 | first lookup+read | 134.9 | | | | | | | | | | 2,166 | 2,238 |
| 2,000 | Commit 1 | 266.1 | 5,853 | 2,251 | 25,539,103 | 8,130 | 26,672 | 410,393 | 1,999 | 2,249 | 3 | 25 | 37 |
| 2,000 | Commit 2 | 85.0 | 2,166 | 1,759 | 9,365,315 | 3,939 | 13,606 | 189,818 | 0 | 1,757 | 2 | 27 | 35 |
| 2,000 | Commit 50 | 51.6 | 2,224 | 6 | 9,610,580 | 2,244 | 6,768 | 45,565 | 0 | 4 | 2 | 33 | 43 |

### Distributed shape

| P | Step | Wall ms | Producer pack reads | Producer catalogue | Producer bytes | Writer tx | Writer statements | Writer VM steps | Full-scan steps | Sorts | Re-prepares | Reader pack reads | Reader tx |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | bind | 3.8 | | | | | | | | | | 12 | 25 |
| 0 | first lookup+read | 2.7 | | | | | | | | | | 16 | 33 |
| 0 | Commit 1 | 14.1 | 13 | 42 | 273,018 | 70 | 279 | 7,720 | 0 | 41 | 2 | 8 | 16 |
| 0 | Commit 2 | 9.6 | 16 | 5 | 284,519 | 34 | 136 | 3,471 | 0 | 3 | 2 | 10 | 18 |
| 0 | Commit 50 | 13.4 | 160 | 5 | 840,558 | 177 | 565 | 6,198 | 0 | 3 | 2 | 56 | 72 |
| 50 | bind | 6.0 | | | | | | | | | | 62 | 85 |
| 50 | first lookup+read | 5.9 | | | | | | | | | | 81 | 112 |
| 50 | Commit 1 | 21.9 | 162 | 187 | 847,477 | 470 | 1,626 | 27,984 | 49 | 186 | 2 | 58 | 64 |
| 50 | Commit 2 | 15.2 | 165 | 5 | 859,030 | 183 | 583 | 6,302 | 0 | 3 | 2 | 60 | 80 |
| 50 | Commit 50 | 17.7 | 310 | 5 | 1,415,121 | 327 | 1,016 | 8,934 | 0 | 3 | 2 | 48 | 54 |
| 500 | bind | 7.8 | | | | | | | | | | 66 | 89 |
| 500 | first lookup+read | 33.4 | | | | | | | | | | 580 | 630 |
| 500 | Commit 1 | 72.4 | 1,248 | 1,112 | 5,417,807 | 2,621 | 9,005 | 150,309 | 499 | 1,111 | 2 | 62 | 80 |
| 500 | Commit 2 | 52.1 | 1,152 | 5 | 5,004,743 | 1,169 | 3,542 | 24,932 | 0 | 3 | 2 | 64 | 72 |
| 500 | Commit 50 | 35.9 | 1,172 | 5 | 5,155,120 | 1,189 | 3,602 | 25,312 | 0 | 3 | 2 | 52 | 60 |
| 2,000 | bind | 9.4 | | | | | | | | | | 63 | 80 |
| 2,000 | first lookup+read | 131.7 | | | | | | | | | | 2,210 | 2,287 |
| 2,000 | Commit 1 | 377.0 | 7,723 | 4,098 | 33,498,228 | 11,888 | 39,795 | 592,617 | 1,999 | 4,096 | 3 | 59 | 65 |
| 2,000 | Commit 2 | 172.4 | 3,982 | 2,936 | 17,098,890 | 6,931 | 23,762 | 322,222 | 0 | 2,934 | 2 | 61 | 75 |
| 2,000 | Commit 50 | 206.2 | 4,206 | 4,263 | 18,066,021 | 8,481 | 29,739 | 436,550 | 0 | 4,261 | 2 | 69 | 85 |

P = 200 and 1,000 were also measured; they lie on the same lines.

### Commits 2 to 50 of the session, summed

| Shape | P | Wall ms | Pack reads | Catalogue | Bytes read | Writer tx | Writer statements | Sorts | Writer tx ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| hot | 0 | 496 | 3,335 | 236 | 24,061,987 | 4,207 | 14,255 | 138 | 114 |
| hot | 50 | 641 | 8,650 | 245 | 46,785,671 | 9,531 | 30,295 | 147 | 190 |
| hot | 200 | 797 | 17,701 | 285 | 83,196,757 | 18,622 | 57,743 | 187 | 317 |
| hot | 500 | 1,119 | 33,851 | 285 | 151,370,875 | 34,772 | 106,190 | 187 | 572 |
| hot | 1,000 | 1,852 | 58,488 | 285 | 256,265,928 | 59,409 | 180,101 | 187 | 1,096 |
| hot | 2,000 | 2,634 | 107,714 | 2,039 | 465,543,106 | 110,438 | 334,834 | 1,941 | 1,735 |
| distributed | 0 | 584 | 4,269 | 245 | 27,323,216 | 5,107 | 16,985 | 147 | 144 |
| distributed | 50 | 829 | 11,650 | 245 | 55,689,144 | 12,485 | 39,157 | 147 | 247 |
| distributed | 200 | 1,100 | 26,420 | 252 | 119,042,021 | 27,262 | 83,530 | 154 | 457 |
| distributed | 500 | 2,060 | 57,114 | 256 | 249,130,819 | 57,960 | 175,640 | 158 | 1,086 |
| distributed | 1,000 | 3,583 | 105,620 | 267 | 460,333,265 | 106,477 | 321,233 | 169 | 2,019 |
| distributed | 2,000 | 9,563 | 200,326 | 171,878 | 860,486,456 | 372,794 | 1,291,872 | 171,780 | 7,037 |

### Order of growth

| Step | Growth against P (measured) | Where it levels off |
| --- | --- | --- |
| Open and bind | Flat: 12 to 29-66 reader pack reads, 3.5 to 7.6-9.4 ms | At the one root-inode leaf's ceiling (section 4), by P = 50 |
| First lookup+read | Linear, 1.08 pack reads for each earlier Commit: 16 to 2,166 (hot) and 2,210 (distributed) at P = 2,000; 3 ms to 132-135 ms | Not within 2,000. Bounded by one read for each live value group of every leaf read, about one for each inode row |
| First Commit | Linear, 2.9 (hot) to 3.9 (distributed) pack reads for each earlier Commit: 12 to 5,853 and 7,723; 12 ms to 266 and 377 ms | Not within 2,000. The rebuild reads every value group in the candidate window: 131,072 values, about 33,000 Commits of this shape |
| Commits 2 to 50 | Linear, 1.1 (hot) and 2.0 (distributed) pack reads for each earlier Commit; 8-10 ms to 52-85 ms (hot) and 172-206 ms (distributed) | Distributed reaches about one read an inode row (3,982 to 4,206 for 4,041 to 4,091 rows) at P = 2,000. Hot is still growing because every Commit adds an inode row |
| Catalogue queries | 4 to 6 a Commit until the catalogue holds 4,096 groups, then 1,759 to 4,263 a Commit | A cliff, not a slope: see section 4.4 |

The 100-Commit mounted evidence (1.4 to 2.9 ms a Commit for each 100 Commits)
is the same slope: on this host, 0.9 ms (hot) to 4 ms (distributed) a Commit
for each 100 earlier Commits.

## 2. L2: Store size and pack population against P

Read with `/usr/bin/sqlite3` (3.51.0, read-only) from copies of the kept files.

| Shape | P | Main file bytes | Packs | Metadata / payload packs | Pack bytes | Value groups | Values | Pooled packs | Locator rows | Content-hint rows | Commit rows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| hot | 0 | 1,196,032 | 28 | 19 / 9 | 479,371 | 40 | 2,041 | 3 | 10,253 | 0 | 0 |
| hot | 50 | 1,437,696 (+4.1 MB WAL) | 228 | 119 / 109 | 869,883 | 181 | 2,191 | 53 | 11,091 | 50 | 50 |
| hot | 200 | 3,149,824 | 828 | 419 / 409 | 2,073,160 | 722 | 2,741 | 203 | 13,324 | 200 | 200 |
| hot | 500 | 6,893,568 | 2,028 | 1,019 / 1,009 | 4,588,516 | 1,895 | 3,941 | 503 | 17,793 | 500 | 500 |
| hot | 1,000 | 13,213,696 | 4,028 | 2,019 / 2,009 | 9,041,379 | 3,850 | 5,941 | 1,003 | 25,243 | 1,000 | 1,000 |
| hot | 2,000 | 24,907,776 | 8,028 | 4,019 / 4,009 | 18,756,361 | 7,760 | 9,941 | 2,003 | 40,654 | 2,000 | 2,000 |
| distributed | 500 | 6,279,168 | 2,028 | 1,019 / 1,009 | 4,458,940 | 1,594 | 3,599 | 503 | 17,494 | 500 | 500 |
| distributed | 2,000 | 24,522,752 | 8,028 | 4,019 / 4,009 | 17,747,680 | 6,972 | 8,991 | 2,003 | 39,366 | 2,000 | 2,000 |

One Commit of this shape adds 4 packs (one ordinary metadata pack, one pooled
pack, two payload packs), 3.5 to 3.9 value groups holding 3.5 to 4.0 values,
about 15 locator rows, one content-hint row and 11.9 KB of main file (hot,
P = 0 to 2,000). Growth is linear; nothing is reclaimed.

Measured at hot P = 2,000, packs after Init: a pooled pack is 4,425 to 4,532
bytes and holds 2 to 17 groups, 3.87 on average; a group holds 1.02 values on
average. A pooled pack therefore carries about 290 bytes of values in 4.5 KB:
the rest is its reserved 4,120-byte directory. That pack is 38% of the bytes a
Commit adds to the Store. This is a property of the physical format and is not
proposed for change here.

## 3. L3: the statements

Plans are `EXPLAIN QUERY PLAN` from the hot P = 2,000 copy. Runtime counters
are the writer session of section 1.

| | Statement | Source | Plan | Runtime | Removable |
| --- | --- | --- | --- | --- | --- |
| a | Catalogue covering set: `WITH wanted(ordinal) AS(VALUES ...),covering AS(...) SELECT DISTINCT g.first_ordinal,... ORDER BY g.first_ordinal` | `layerfs-persistence/src/backend/sqlite/metadata_pooling.rs:46` | `SCAN w`; `SEARCH g USING INTEGER PRIMARY KEY`; correlated `SEARCH ... (rowid<?)`; `USE TEMP B-TREE FOR DISTINCT`; `USE TEMP B-TREE FOR ORDER BY` | One sort an execution: every "Sorts" count of section 1 except 1 to 3 a session. 2,249 at the first Commit of hot P = 2,000 | Yes, by a rewrite. Both b-trees only deduplicate and order rows that the caller already puts in an ordered map (`layerfs-persistence/src/metadata/pooling.rs:42-46`). Without `DISTINCT` and `ORDER BY` the plan is the same three searches and no temporary b-tree |
| b | Content hints: `SELECT slot,stamp,object_id,signature FROM content_signature ORDER BY stamp LIMIT 8193` | `metadata_signatures.rs:9` | `SCAN content_signature`; `USE TEMP B-TREE FOR ORDER BY` | Once for each new producer: full-scan steps = rows = P (49, 199, 499, 999, 1,999), one sort | The sort, by reading in `slot` order and ordering in memory (not done: one statement a producer). The scan is the read itself and is bounded at 8,192 rows; only a keyed need for hints would avoid it |
| c | Policy: `SELECT ... FROM store_policy WHERE id=1` | `metadata_policy.rs:5` | `SEARCH store_policy USING INTEGER PRIMARY KEY` | Once for each new producer | Nothing to remove |
| d | Catalogue pages: `... WHERE first_ordinal>=?1 ORDER BY first_ordinal LIMIT ?2` and `... AND first_ordinal<?2 ORDER BY first_ordinal LIMIT ?3` | `metadata_pooling.rs:30` and `:38` | `SEARCH metadata_value_group USING INTEGER PRIMARY KEY (rowid>? AND rowid<?)` | Exactly the 2 re-prepares of every Commit | Yes: see below |
| e | Locators: `SELECT o.object_id,... FROM object_location o JOIN pack p ... WHERE o.object_id IN(...)` | `metadata_locations.rs:13` | `SEARCH o USING PRIMARY KEY (object_id=?)`; `SEARCH p USING INTEGER PRIMARY KEY` | 9 to 11 calls a Commit, flat in P | Nothing to remove |
| f | Pack descriptor of a selected read: `SELECT pack_id,domain,digest,length FROM pack WHERE pack_id=?1` | `objects_selection.rs:44` | `SEARCH pack USING INTEGER PRIMARY KEY` | One for each pack read, in its own transaction with `BEGIN` and `COMMIT`: 3 statements a pack read | Not by a query change |

**Why two statements are re-prepared at every Commit.** Both catalogue page
statements bind their `LIMIT`. Since SQLite 3.47 the planner reads a bound
`LIMIT` value, so it marks that parameter as plan-relevant, and every new
binding of it expires the cached statement; the next step re-parses and
re-plans it. Each Save runs one of each: the window read (a page with `LIMIT 0`,
`layerfs-storage/src/read/fetch.rs:461`) and the bounded catalogue walk of the
pooled index (`fetch.rs:238`). Found by printing the statement text wherever
`SQLITE_STMTSTATUS_REPREPARE` was non-zero; the print was temporary and is not
in the tree. The same mechanism gives one re-prepare at every open
(`PRAGMA journal_mode`, expired by the flag pragmas that follow it).
The statement cache of a Store session is rusqlite's default of 16 statements.

## 4. L4: where the growth comes from

### 4.1 One leaf

One cold Storage reader reading the inode leaf of `d-01/f-25`:

| Shape | P | Pack reads | of them value-group fetches | of them chain records and other | Chain edges | Catalogue | Transactions | Wall ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| hot | 0 | 3 | 1 | 2 | 0 | 1 | 7 | 0.4 |
| hot | 50 | 12 | 10 | 2 | 0 | 1 | 16 | 0.6 |
| hot | 200 | 53 | 51 | 2 | 1 | 2 | 59 | 1.2 |
| hot | 500 | 65 | 57 | 8 | 7 | 8 | 83 | 1.6 |
| hot | 1,000 | 61 | 55 | 6 | 5 | 6 | 75 | 1.5 |
| hot | 2,000 | 53 | 51 | 2 | 1 | 2 | 59 | 1.3 |
| distributed | 500 | 31 | 23 | 8 | 6 | 7 | 47 | 1.2 |
| distributed | 2,000 | 54 | 51 | 3 | 1 | 2 | 60 | 1.4 |

A leaf's cost does level off: this leaf has about 50 rows that Commits
rewrite, and it stops at 51 to 57 value groups, each in a different pooled
pack, plus at most 9 chain records. The ceiling is the leaf's row count (at
most 100) plus the delta chain (at most 8), as the source says. Every value
group of one leaf is in a different pack, because one Commit writes one group
a leaf (section 2): grouping one leaf's needs by pack removes nothing.

### 4.2 Why a Commit and a first lookup grow without levelling off

A leaf is bounded; the number of leaves read is not.

* **Commit.** Applying inode changes reads every child of each branch page it
  edits, in one grouped demand, whether or not the child holds a change
  (`layerfs-content/src/filesystem/sorted/merge.rs:245-247`, reached from
  `apply_inode_changes`). With one branch level, as here, that is every inode
  leaf of the table: one demand of 80 leaves at hot P = 2,000 for a Commit
  that changes 3 or 4 of them. The Save then pays every leaf's value groups.
  This was read from a backtrace and a per-demand count; both were temporary.
* **First lookup.** The first stat of a base directory derives its
  child-directory count by reading the inode of every child
  (`directory_count_scans`, `layerfs-workspace/src/base/client.rs:133`). In a
  new session that is the root (40 children over all base leaves) and `d-01`
  (its files, old and new), so again nearly every leaf. Resolving the same
  path through Content's `FilesystemRead` alone costs 143 pack reads at hot
  P = 2,000 (15 demands, the largest 53).

Both are in crates this work does not own; neither is changed here.

### 4.3 Attribution at P = 500 and 2,000, hot shape

| Commit | Pack reads | Range reads (value-group fetches from pooled packs) | Whole reads (chain records, other metadata, payload) | Leaves reconstructed | Leaves written |
| --- | ---: | ---: | ---: | ---: | ---: |
| P = 500, Commit 2 | 658 | 504 | 154 | about 50 | 3 |
| P = 2,000, Commit 2 | 2,166 | 2,004 | 162 | 88 (80 in one demand) | 3 |
| P = 2,000, Commit 1 | 5,853 | 3,691 | 2,162 | the same, plus the rebuild | 3 |

At P = 2,000, 92.5% of a later Commit's pack reads are value-group fetches,
one for each of the 2,003 pooled packs: every Commit's pack still holds a
value that some leaf of the table uses.

### 4.4 What a new producer rebuilds at its first Save

| What | Query | Rows against P |
| --- | --- | --- |
| Policy | statement c | 1 |
| Content hints (delta candidates) | statement b, whole table | P, at most 8,192 |
| Pooled-value index | catalogue pages from the window start (`layerfs-storage/src/encoding/pool/index.rs:140-163`), then every group's values | Every value group in the window: 1,895 groups / 3,941 values at P = 500, 7,760 / 9,941 at P = 2,000; at most 131,072 values |

The index holds a fingerprint for each value and no table holds fingerprints,
so the rebuild decodes every group: one pack read a group, the second group
of a pack promoting that pack to a whole read. At hot P = 2,000 the first
Commit makes 3,687 more pack reads than the second (5,853 against 2,166). The
rebuild also fills the 512 KiB decoded-value cache and evicts from it
(3,228 pack-cache evictions at that Commit).

**The 4,096-row cliff.** A Storage handle remembers at most 4,096 catalogue
rows and drops them all when full (`layerfs-storage/src/read/fetch.rs:305`).
Once the groups one Commit consults exceed that (about P = 1,300 here), rows
are asked for again one ordinal at a time, each its own sorted statement and
transaction: 4 to 6 catalogue queries a Commit become 1,759 to 4,263, and the
distributed session at P = 2,000 makes 171,878 of them in 49 Commits.

## 5. What could not be determined

* Mounted cost of any of this: nothing here ran under a mount.
* Whether Content can leave unchanged sibling leaves unread without changing
  canonical output: not examined, the crate is not this work's.

## 6. The mounted read failure on a long branch (EIO at step 748)

Reported from a mounted 20 x 50 session on the tier 1 tree: an append to a
never-touched base file failed with `Input/output error` after about 750
Commits. The lead's diagnostic build printed the failed base demand:
`Storage(Integrity("metadata ordinal missing"))`, the same on two runs.

**Cause (source and host reproduction).** A Storage handle remembers at most
4,096 catalogue rows and drops them all when full. It made room row by row
inside the loop that stores one reply (`layerfs-storage/src/read/fetch.rs`,
`catalogue`). A pooled leaf read asks for all its ordinals in one reply
(`prefetch_values`). When the handle reached 4,096 rows in the middle of a
reply, the rows of that same reply stored before the clear were gone; the
prefetch then recorded their ordinals as absent for the rest of the demand,
`value_group` did not ask again, and
`layerfs-storage/src/encoding/pool/read.rs:588-590` failed the leaf. The Store
held every row. The absent set is per demand, so the next read succeeds: one
isolated failure and a silent daemon. A daemon's fixed read handles live for
the daemon, so the row count is cumulative over every Workspace; a file that
was never touched is hit because other rows of its inode leaf were rewritten.

| Reproduction (host) | Before `5cd1de4a1` | After |
| --- | --- | --- |
| `layerfs-storage/tests/catalogue_row_bound.rs`: 2,112 leaves of two rows, two Saves, one read handle | Fails at leaf 2,048: `Integrity("metadata ordinal missing")` | PASS; exactly 1 catalogue call for each of 2,111 leaves |
| `long_branch_session`, `one_read_handle_reads_every_leaf_of_a_kept_branch`, distributed P = 2,000, head root then roots 250 Commits apart | Fails at the 57th leaf demand of the second root, 579 catalogue calls | 500 leaf demands over 8 roots, no failure, 1,736 catalogue calls |
| The same, hot P = 2,000 | No failure: 8 roots do not reach 4,096 distinct groups | No failure |

**Fix, commit `5cd1de4a1`.** Room for the whole reply is made once, before its
first row. The bound, the cache and its lifetime are unchanged; nothing is
retried. Whether the mounted failure is gone is the lead's rerun, not a claim
of this document.

## 7. Design B: inode values as rows of the Store

> **Status:** Implemented on `perf-experiments-b`; host in-process measurement;
> not a qualified result. Counts are exact, one run each. Milliseconds are
> single host samples with no mount. The mounted figures quoted in 7.5 are the
> lead's, not this document's.

### 7.1 What changed

Sections 1 to 4 found one cause: a leaf's 73-byte inode values lived in pooled
value-group packs, found through an ordinal catalogue and a per-producer index
rebuilt from history. Design B (owner direction 2026-10-13: format and schema
changes allowed, nothing outside the Store file) stores each value as one row:

```sql
CREATE TABLE inode_value(
  ordinal INTEGER PRIMARY KEY CHECK(ordinal BETWEEN 1 AND 4294967295),
  value BLOB NOT NULL CHECK(length(value)=73)) STRICT;
```

| Commit | Change | Production LOC |
| --- | --- | ---: |
| `a6343e5f9` | Values as rows; value groups, ordinal catalogue, `PoolIndex` and its rebuild removed | 82,932 -> 81,977 (-955) |
| `5e2ffd8dc` | The Content change `63a1ab005` (the sorted merge reads only the children a change reaches) picked onto B, test expectations settled | 81,977 -> 82,073 (+96) |
| `b77fee002` | The pooled pack lane, its header versions 12/21/22 and its limits removed; four lanes remain | 82,073 -> 82,004 (-69) |

* **Leaf record.** Unchanged: a body of (serial, ordinal) pairs, FULL or a
  COPY/INSERT delta against one base, chain depth at most 8.
* **Read.** One leaf read rebuilds every body of its chain, collects their
  ordinals and asks once: one transaction holding one statement
  (`json_each(?1)` of inclusive ordinal runs joined to `inode_value` by a
  primary-key range). `SqlWork` counts it as 3 statements, because BEGIN and
  COMMIT count. A handle keeps at most 512 KiB of values and drops them whole.
* **Authentication.** No digest was added to the row. Every chain element, the
  root last, is rebuilt to canonical bytes from the looked-up values and hashed
  against its own ObjectId; a missing row is `metadata ordinal missing`. A
  corrupt or exchanged row therefore fails the identity check before anything
  is served (`stored_value_reads.rs`, `sqlite_inode_values.rs`, and
  `pooled_dependency_integrity.rs`, which is why each element is checked and
  not only the root: a valid dependent must not hide a corrupt base).
* **Save.** A value keeps the ordinal it has in a predecessor leaf the object
  names (at most 4, each read and authenticated); otherwise a per-Save memo
  (at most 131,072 entries of 12 bytes, cleared whole) finds it; otherwise it
  takes a new ordinal from the Save's reserved block and is published as a row
  in the same transaction as the batch whose leaf uses it. Nothing is rebuilt
  from history, so a producer's first Save no longer depends on P.
* **Duplicates.** Decided by measurement. Inode values that repeat inside one
  tree: 7 of 70,708 (0.01%) in this repository with `.git`, 4,999 of 24,441
  (20.5%) in a cargo registry `src`, 12,370 of 86,922 (14.2%) in a
  `node_modules`. The per-Save memo removes those inside a Save. A value equal
  to one stored by an earlier Save, with no predecessor naming it, is stored
  again: a global value index would be the history-sized structure this design
  removes.
* **Old Stores.** Schema versions moved from 1..6 to 7..12. A Store of the old
  format is refused at open with `Malformed`; nothing is migrated.
* **Limits.** None added: no bound on files, file size, edit size or edit
  count. No side file; no fsync-family call added or removed; Durable not run.

### 7.2 The one table

Rig as in section 0, plus a third shape **tier** that copies the mounted
session: 100 directories of 50 files of 2,048 bytes (5,101 inodes); a Commit
creates 2 files, appends to 3 stored files, overwrites the first byte of 2
more, at paths 997 files apart, and from Commit 20 unlinks one file
created 20 Commits earlier. In every shape a new Workspace replaces the old
one every 50 Commits while the branch is built. tier stops at P = 800: the
branch of the previous head costs 196 ms a Commit there on this host, and
2,000 would have taken about ten more bounded commands.

Each cell is **pack reads / statements / transactions / VM steps** of the
writer connection for one Commit (host ms in brackets). "First" is the first
Commit of a new Workspace bound at P; the other row is the mean of its next 49.

| Measure | Before, `120456785` | B alone, `a6343e5f9` | B with the merge change, `b77fee002` |
| --- | --- | --- | --- |
| hot, P = 0, first Commit | 12 / 273 / 69 / 7,513 (20 ms) | 6 / 207 / 62 / 16,821 (14 ms) | 6 / 96 / 25 / 4,675 (10 ms) |
| hot, P = 0, Commits 2 to 50, mean | 68 / 291 / 86 / 4,407 (15 ms) | 12 / 224 / 67 / 16,851 (12 ms) | 10 / 108 / 28 / 4,617 (8 ms) |
| hot, P = 500, first Commit | 1,045 / 3,677 / 1,186 / 90,865 (51 ms) | 35 / 438 / 138 / 32,187 (24 ms) | 16 / 177 / 51 / 14,225 (14 ms) |
| hot, P = 500, Commits 2 to 50, mean | 691 / 2,167 / 710 / 16,404 (30 ms) | 42 / 345 / 107 / 22,649 (14 ms) | 15 / 125 / 33 / 5,632 (9 ms) |
| hot, P = 2,000, first Commit | 4,167 / 12,986 / 4,287 / 300,741 (279 ms) | 57 / 517 / 164 / 64,490 (27 ms) | 13 / 145 / 40 / 36,995 (21 ms) |
| hot, P = 2,000, Commits 2 to 50, mean | 2,198 / 6,706 / 2,222 / 47,787 (58 ms) | 61 / 494 / 157 / 32,725 (17 ms) | 15 / 125 / 34 / 5,687 (10 ms) |
| distributed, P = 0, first Commit | 13 / 279 / 70 / 7,720 (11 ms) | 7 / 211 / 63 / 16,924 (11 ms) | 7 / 103 / 27 / 5,106 (9 ms) |
| distributed, P = 0, Commits 2 to 50, mean | 87 / 347 / 104 / 4,805 (13 ms) | 31 / 279 / 85 / 17,629 (12 ms) | 13 / 114 / 30 / 4,727 (8 ms) |
| distributed, P = 500, first Commit | 1,229 / 5,692 / 1,788 / 137,542 (59 ms) | 176 / 1,489 / 488 / 52,859 (30 ms) | 27 / 235 / 70 / 15,398 (13 ms) |
| distributed, P = 500, Commits 2 to 50, mean | 1,166 / 3,584 / 1,183 / 25,256 (43 ms) | 153 / 676 / 217 / 36,768 (19 ms) | 24 / 162 / 46 / 5,970 (9 ms) |
| distributed, P = 2,000, first Commit | 5,915 / 18,767 / 6,179 / 417,735 (299 ms) | 102 / 775 / 250 / 83,317 (42 ms) | 18 / 163 / 46 / 38,161 (24 ms) |
| distributed, P = 2,000, Commits 2 to 50, mean | 4,088 / 13,563 / 4,407 / 256,278 (129 ms) | 123 / 675 / 217 / 51,228 (22 ms) | 21 / 142 / 39 / 6,138 (9 ms) |
| tier, P = 0, first Commit | 27 / 593 / 151 / 91,179 (35 ms) | 15 / 436 / 138 / 114,274 (34 ms) | 15 / 151 / 43 / 83,104 (23 ms) |
| tier, P = 0, Commits 2 to 50, mean | 94 / 422 / 124 / 6,857 (22 ms) | 32 / 492 / 155 / 40,804 (26 ms) | 24 / 182 / 52 / 7,817 (15 ms) |
| tier, P = 500, first Commit | 1,783 / 8,694 / 2,677 / 447,174 (156 ms) | 149 / 1,644 / 538 / 206,768 (81 ms) | 25 / 237 / 69 / 124,963 (38 ms) |
| tier, P = 500, Commits 2 to 50, mean | 1,950 / 6,015 / 1,985 / 46,393 (88 ms) | 157 / 895 / 289 / 86,553 (43 ms) | 31 / 206 / 60 / 10,072 (17 ms) |
| tier, P = 800, first Commit | 4,265 / 16,756 / 5,352 / 600,237 (301 ms) | 186 / 2,241 / 737 / 234,351 (108 ms) | 30 / 300 / 90 / 136,673 (39 ms) |
| tier, P = 800, Commits 2 to 50, mean | 4,044 / 15,348 / 4,842 / 392,599 (196 ms) | 191 / 1,017 / 330 / 97,753 (55 ms) | 32 / 213 / 62 / 10,766 (18 ms) |
| Store bytes a Commit, hot, P 0 to 2,000 | 11,866 | 7,232 | same Store as B |
| Store bytes a Commit, distributed, P 0 to 2,000 | 11,760 | 7,004 | same Store as B |
| Store bytes a Commit, tier, P 0 to 800 | 14,899 | 10,732 | not rebuilt |
| Store after 2,000 Commits, hot: committed (main file + WAL file) | 24,928,256 (24,907,776 + 4,194,304) | 15,663,104 (15,626,240 + 4,194,304) | same Store as B |
| Store after 2,000 Commits, distributed | 24,715,264 (24,522,752 + 4,194,304) | 15,212,544 (15,196,160 + 4,194,304) | same Store as B |
| Store after 800 Commits, tier | 15,667,200 (15,638,528 + 4,194,304) | 12,357,632 (12,197,888 + 4,194,304) | not rebuilt |
| Pack bytes written, second Commit at P = 2,000, hot / distributed | 9,884 / 9,395 | 5,396 / 4,866 | 5,399 / 4,866 |
| Init, 5,000 files of 2,048 bytes: sealed Store bytes | 3,768,320 | 3,788,800 | 3,772,416 |
| Init, 5,000 files: wall ms (seal ms) | 815 (2) | 770 (2) | 738 (2) |
| Init, 100,000 files of 128 bytes: sealed Store bytes | 65,265,664 | 65,765,376 | 65,859,584 |
| Init, 100,000 files: wall ms (seal ms) | 21,779 (7) | 23,880 (7) | 21,017 (16) |

How the storage rows were measured:

* **Committed bytes** are the database length after the last committed
  transaction: the page count in the last commit frame of the WAL whose salts
  match the WAL header, times the 4,096-byte page. The files were read as
  plain bytes; no SQLite tool opened them. It includes free pages. Every kept
  snapshot after P = 0 has a 4,194,304-byte WAL file beside the main file in
  both formats; sections 2 and earlier quote the main file alone, which is
  16,384 to 270,336 bytes short of the committed length in these snapshots.
* **Bytes a Commit** is (committed bytes at the last P minus the file at
  P = 0) divided by the Commits. The hot and distributed branches of the B
  column were built by `b77fee002`; the merge change does not alter what is
  stored (pack bytes of a Commit agree to 3 bytes), so they stand for both.
  The tier branch was built by `a6343e5f9`.
* **Init** is a host Project Init of a generated tree through
  `init_store_bytes`, sealed, one sample each. The two B samples of the same
  tree (different builds; Init also constructs in parallel) differ by 16,384
  and 94,208 bytes, so differences of that size are not attributed. What is measured: B's sealed
  Store is 0.1% to 0.5% larger for 5,000 files and 0.8% to 0.9% larger for
  100,000; the Init wall times overlap.
* The B-alone session counts were taken on the tree that became `a6343e5f9`
  with one literal different (a format profile number, reverted before the
  commit). Counts were not retaken on the commit itself.

### 7.3 What the table shows

* The slope against P is gone from pack reads, statements and transactions.
  A first Commit at P = 2,000 goes from 4,167 / 5,915 pack reads (hot /
  distributed) to 13 / 18; the following Commits from 2,198 / 4,088 to 15 / 21.
* B alone is worse than the previous head at P = 0: VM steps of a hot first
  Commit 7,513 to 16,821, and on the tier tree a mean Commit 422 to 492
  statements and 6,857 to 40,804 VM steps. Content read every inode leaf of
  the tree for each Commit, and each leaf read is now one statement where a
  warm in-memory catalogue used to answer. With the merge change only changed
  leaves are read, and every count is below the previous head except the mean
  VM steps at P = 0 of hot (4,407 to 4,617) and tier (6,857 to 7,817).
* First-Commit VM steps still grow with P (4,675 at 0, 36,995 at 2,000, hot).
  Pack reads and statements of that Commit do not. Not attributed further; the
  owner has ruled the remaining first-Commit cost out of scope.
* Storage: 39% to 40% fewer bytes a Commit on the 2,000-file shapes, 28% on
  tier.
  Resident state: the pooled index (one entry for each stored value in the
  candidate window, rebuilt by every producer) is gone; what replaces it is
  bounded by 131,072 x 12 bytes a Save and 512 KiB a read handle.

### 7.4 Tests whose exact counts moved, and what ran

Counts restaged because the format changed, not loosened:

| Test | Was | Is |
| --- | --- | --- |
| daemon `product_commit_history_cost` | catalogue queries and value groups a Commit | value lookups `[4,4,4,4,4,4,4,4,3,3,3,3]`; value rows written = inode rows (4); policy and signatures read by the first Commit only |
| persistence `concurrent_pooled_saves` | new value groups 0, reused 2 | new rows 2, reused 0 |
| persistence `sqlite_ordinal_lookahead` | new 0 | new 5, counted in `inode_value` |
| persistence `acquisition_schema`, `sqlite_group_rows`, `sqlite_group_rows_indexed` | schema versions 1 to 6 | 7 to 12; the fan-out case uses 16 Ordinary groups, 8,180 locators |
| storage `physical_formats` | pooled pack headers 12/21/22 read | refused |
| storage `pooled_dependency_integrity`, `pooled_demand_work`, `selected_cache_bounds` | group and catalogue counts | one value lookup a leaf demand |

Added: storage `stored_value_reads` (5), persistence `sqlite_inode_values`
(5, including a row corrupted through SQLite and an old Store). Removed with
the code they covered: storage `pooled_value_retention`,
`catalogue_row_bound`, `save_catalogue_calls`, `pool_index_rebuild_reads`;
persistence `concurrent_pool_window`. The reproduction of section 6 went with
them: the row cache it exercised no longer exists.

Run on the host on the tree of `b77fee002`, each command under 120 s:
`layerfs-storage` 18 binaries, 57 passed; `layerfs-persistence` 32 binaries,
129 passed; `layerfs-daemon` 184 passed, 2 failed; `layerfs-history`,
`layerfs-project` (`--tests`) and `layerfs-sdk` 13 binaries, 34 passed. The 2
daemon failures need inputs this host does not have:
`complete_installed_roots::huge_native_namespace_is_complete_after_install`
(a closed prepared input) and
`host_handoff::macos_init_handoff_to_linux_daemon_has_no_host_data_path` (the
Linux binary). `layerfs-content`, on the tree of `5e2ffd8dc` (the crate is
unchanged after it): the whole package was stopped by the 2-minute alarm with
52 binaries finished, 419 passed and 0 failed; it was not rerun whole, and
the three restaged binaries were run alone, 30 passed. Nothing mounted, no
container and no benchmark harness ran here.

### 7.5 Mounted figures (the lead's runs, quoted)

With `a6343e5f9` and `63a1ab005`: median Commit 13 to 16 ms from 0 to 950
earlier Commits (was 18 to 139 ms); first Commit of a new Workspace 17 to
23 ms; Store +15.0 MB for 1,000 Commits (was +19.6); Store after Init
106.84 MB (was 106.91). This document does not reproduce them.

### 7.6 Not done

* A Store of the old format is not converted.
* Values duplicated across Saves without a named predecessor are stored
  again; how often that happens in a long mounted session was not counted.
* tier at P = 2,000, and any Init above 100,000 files.
* The owner dropped the remaining first-Commit candidates (shared producer,
  chain in one statement, decoded-leaf cache, levelled chains, backward delta
  extension). None was built.
