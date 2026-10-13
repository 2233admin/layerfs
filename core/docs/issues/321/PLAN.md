> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Plan with the owner decisions of 2026-10-13 recorded. Step 1 exists in source on a private branch and is not qualified; nothing else here is implemented.
> Every time below is one diagnostic run on a shared virtual machine, with no oracle or proof step. They are observations, not eligible performance results.

Sub-issue of #320. It widens that issue's scope on one point: #320 lists "new schema element" as out of scope, and the owner has since allowed schema and format changes for this work (2026-10-13).

## 1. Why

The concern is command (exec) time when several Workspaces of one daemon mutate files at once. A Workspace commits at most every half second to a few seconds; commands mutate all the time.

Before this work every Workspace of a daemon shared one overlay SQLite database, one connection and one thread. A diagnostic in which 1 to 4 Workspaces each create, append to and read 2,000 small files showed:

| Workspaces writing at once | Time per file (create + append + read) | Whole-daemon file operations per second |
| --- | ---: | ---: |
| Native filesystem, one writer | 42 µs | — |
| 1 | 752 µs | 3,990 |
| 2 | 1,003 µs | 5,980 |
| 3 | 1,256 µs | 7,170 |
| 4 | 1,726 µs | 6,950 |

- The container had no CPU limit and 8 CPUs free. With four writers, each spent 2.0 s of its 3.45 s waiting in the one connection's queue.
- One create + append + read is 13 kernel requests and 12 jobs on that connection; 8 of the 12 are write transactions.
- A Commit of 2,000 new files beside three writing Workspaces took 3.3 s and slowed those writers by about 29%.

A throwaway prototype (one overlay database per Workspace, reservation dropped, each SQLite connection with its own page cache) gave:

| Workspaces writing at once | One database | Database per Workspace | Gain |
| --- | ---: | ---: | ---: |
| CPUs unlimited: 1 | 698 µs | 660 µs | 1.06× |
| CPUs unlimited: 2 | 1,006 µs | 697 µs | 1.44× |
| CPUs unlimited: 3 | 1,388 µs | 777 µs | 1.79× |
| CPUs unlimited: 4 | 1,752 µs | 972 µs | 1.80× |
| 2 CPUs: 1 | 702 µs | 631 µs | 1.11× |
| 2 CPUs: 2 | 987 µs | 674 µs | 1.46× |
| 2 CPUs: 3 | 1,327 µs | 899 µs | 1.48× |
| 2 CPUs: 4 | 2,330 µs | 1,627 µs | 1.43× |

- The 2,000-file Commit beside three writers went from 3.2 s to 0.7 s (3.7 s to 1.2 s at 2 CPUs).
- Mount (5.8 ms), unmount (3.9 ms), command (46 ms), Commit on a branch of 0 to 750 Commits (11.9 to 15.1 ms) and a new daemon on a cold Store file were unchanged within noise.
- The shared immutable object cache was unaffected: identical hit, miss and seeding counters in both builds.
- Dropping the reservation alone gave no measurable time gain.
- Two runs of an identical binary differed by 5 to 7%.
- Not explained yet: with no queue wait left, a write's own service time still rose from 33 µs to 68 µs as more Workspaces wrote.

The gate agreed beforehand was "roughly 2× for four Workspaces at a realistic CPU allotment". It was **not met** (1.8× with CPUs free, 1.4× at 2 CPUs).

One Workspace alone is still about 16 times slower per small file than the native filesystem. A database per Workspace does not change that; sections 4 and 9 (steps A and B) address it.

## 2. Owner decisions (2026-10-13)

First round:

- Go ahead with one overlay SQLite file per Workspace despite the gate result.
- No reservation of database storage. A clean and optimized implementation, not the prototype carried forward.
- Any Store or overlay format change and new or changed SQLite tables are allowed if they give the best result. No limit on file count, file size, edit size or edit count may come back. Nothing is allocated on disk outside SQLite database files.
- The repository guide's statements that one overlay database belongs to each daemon, and that a mount creates no new database, will be replaced.
- Focus is Commit, mount and exec time. Daemon start is out of scope: it happens once.

Second round, later the same day. Where the two rounds differ, this round governs:

- **Each Workspace's memory is independent.** There is no memory budget shared between Workspaces. The boundary between what one Workspace has for itself and what the daemon shares must be clear and simple ([section 3](#3-what-a-workspace-owns-and-what-the-daemon-shares)).
- **Three rules are dropped**, with the machinery that exists only to serve them ([section 4](#4-what-is-removed-and-what-replaces-it)):
  1. One thread owns the connection, and every request reaches it through a queue with admission, credits and completion tracking.
  2. Open-file, directory-position and kernel-reference state is stored in SQLite.
  3. An unmounted Workspace is cleaned up row by row.
- **Three rules stay**: exact request, statement and storage counts remain evidence; a failed operation keeps its exact failure and is never retried or replayed; file requests keep being served while a Commit of the same Workspace runs.

This supersedes, for this work, the statements in #308 and #314 that the overlay is one database with one pager per daemon and that no new database layout is selected. Those issues stay as records.

## 3. What a Workspace owns and what the daemon shares

The rule: a Workspace's uncommitted state is held and cached only by that Workspace. Only committed, immutable content is cached for all Workspaces. One Workspace cannot evict, block or slow another's overlay pages.

| What | Owner | Size | Fixed? |
| --- | --- | --- | --- |
| Overlay file `<workspace>.sqlite` | each Workspace | grows with what commands write | No: disk, returned at unmount |
| One SQLite connection behind one lock | each Workspace | — | — |
| SQLite page cache | each Workspace | about 2 MiB target (`cache_size`) | A target, not a hard cap |
| Rollback journal and temporary data, in memory | each Workspace | the pages one transaction changes | Bounded by the largest single request |
| Request worker threads and their buffers | each Workspace | workers × one request window | Fixed at mount |
| Open-state maps: open files, directory positions, kernel references | each Workspace | grows with open files and with files the kernel remembers | **Not fixed**: see [section 13](#13-open-points-for-the-owner) |
| Immutable object cache | daemon | 8 MiB | Fixed; lost at daemon exit, as today |
| Global Store connections: one writer, fixed readers | daemon | fixed pool, each with its own page cache | Fixed |
| Control state: the roster of mounted Workspaces | daemon | small | Fixed by the Workspace capacity |
| Template `template.sqlite` | daemon | 57 pages on disk | Fixed |
| Name, attribute and file-page caches | Linux kernel, per mount | kernel-managed | Reclaimed by the kernel under memory pressure |

- **Total daemon memory** = Workspace capacity × one Workspace's allowance + the shared part. The configured Workspace capacity (16 today) is the only global bound. There is no ledger and there are no credits.
- **Separate SQLite page caches.** The bundled SQLite is built today with an option that puts every connection of the process into one page-cache group behind one lock. That is a shared cache, so the option is switched off, unless a measurement after step B shows one Workspace alone getting slower by more than the 5 to 7% run-to-run difference. It is a supported build setting of the existing SQLite dependency; no third-party source is changed.
- A SQLite cache size is a suggestion and the process-wide heap limit is not per connection, so these allowances are not hard isolation. The per-Workspace footprint is measured, idle and loaded, and reported.

## 4. What is removed and what replaces it

| Rule dropped | Removed | Replaced by |
| --- | --- | --- |
| 1. Owner thread, queue, credits | The per-Workspace owner thread; the job queue and its service classes; admission slots and notifications; byte credits; the memory ledger; completion tracking; the typed job list that carries each request to the thread; the daemon-wide request dispatcher with its parked requests. | One lock around each Workspace's connection. The thread that received the request takes the lock, runs one short job (at most one transaction), releases the lock and replies. A fixed number of plain worker threads per mount. |
| 2. Open state in SQLite | Eleven tables and their statements, triggers, cleanup jobs and diagnostics ([section 7](#7-table-names)). | Maps in the daemon's memory, one set per Workspace, guarded by the same lock as the connection. "Is this unlinked file still open?" becomes one lookup in memory. |
| 3. Row-by-row unmount cleanup | The `reclaim` table and the terminal half of the cleanup work. | Unmount drains requests, closes the connection and deletes the file. |

What does not change:

- A job is still short. The lock is never held across a read of the global Store, a whole command or a whole Commit, so a Commit and file requests of one Workspace interleave job by job.
- A Commit must not starve file requests of its own Workspace. An ordinary lock gives no ordering promise; the Commit-beside-writers run after step B decides whether more is needed, and the simplest mechanism that holds is used.
- Counts stay exact: each lock hold is one job with its class, statement count and hold time. Counters for things that no longer exist (queue length, credits, admission slots) are removed, not zeroed.
- One attempt, no retry, no busy handler. A failed job returns its exact failure directly to the caller. A panic while the lock is held fails that Workspace only.
- Kernel lookup, open and request ownership stays exact; it is exact in memory instead of in rows.
- Cleanup inside a live Workspace (a large deleted file releasing its pages) stays automatic and bounded.

Expected effect, not measured: one create + append + read needs about 7 visits to SQLite instead of 12, and 3 write transactions instead of 8, because lookup, open and release no longer touch the database.

## 5. Checklist

**Step 1 — one SQLite file per Workspace.** In source on the private branch at `20f237499`; not qualified, and no full benchmark case has run on it.
- [ ] Empty template database built before daemon readiness. *(in source)*
- [ ] Mount copies the template to the Workspace's own file and opens it. *(in source)*
- [ ] Terminal unmount closes the connection and deletes the file after the last owner releases. *(in source)*
- [ ] Every request, control job, Commit and cleanup observation goes to the Workspace's own database. *(in source)*
- [ ] Reservation removed: nothing reserved past the end of the file, no check before a write transaction. *(in source)*
- [ ] A full device rolls the write transaction back and the request reports no space, including when SQLite reports an I/O error. *(in source, with device-capacity proofs at their own pins)*
- [ ] SQLite temporary data in memory. *(in source)*
- [ ] Workspace numbers stay ordinary and distinct within a daemon. *(in source)*
- Superseded by the second round: "one memory budget for all overlay databases" and "keep job classes and the in-Workspace queue".

**Step A — open state in memory, unmount deletes the file**
- [ ] Trace each of the eleven tables in the code; move the ones that hold, record any that does not.
- [ ] One in-memory open-state structure per Workspace, held next to the connection.
- [ ] Remove the moved tables with their statements, triggers, cleanup jobs, query-plan diagnostics and typed jobs.
- [ ] Remove `reclaim` and the terminal row-by-row cleanup.
- [ ] Measure bytes per kernel-reference entry and the map size after walking the tier-1 tree.

**Step B — one lock per Workspace instead of thread, queue and credits**
- [ ] One lock around the connection and the open-state structure; the calling thread runs the job.
- [ ] Remove the owner thread, queue, service classes as scheduling, admission, credits, the memory ledger and completion tracking.
- [ ] Replace the daemon-wide request dispatcher with a fixed number of plain worker threads per mount; choose the number by one measurement and report threads per Workspace.
- [ ] Switch the bundled SQLite to separate page caches, under the condition in section 3.
- [ ] Idle and loaded memory of 1, 4 and 16 Workspaces measured and reported.
- [ ] Find why a write's service time doubles when several Workspaces write. Re-measure first: the cause may be in what this step removes.

**Step C — table revision of what remains**
- [ ] Remove the leading Workspace column from every table, index and statement.
- [ ] Apply the names in [section 7](#7-table-names).
- [ ] Trace the record-table merge; do it if one shape serves all three, record it if not.
- [ ] Bump the overlay schema version. No migration: the overlay is disposable.

**Step D — fewer statements and round trips per file operation**
- [ ] Review the accounting triggers (7 runs per created file); remove what the file's own size now answers.
- [ ] Remove the repeated attribute requests (2 per file in the diagnostic).
- [ ] Reduce the transaction frame per write.
- [ ] Reduce the Commit's jobs per new file (about 23).

**Step E — re-qualify once**
- [ ] Re-pin the exact request, job and statement counts of the twelve cells.
- [ ] All mounted proof binaries pass on Linux.
- [ ] Benchmark harness schema, profile and receipt-field pins updated without weakening any comparison.
- [ ] Engine contract, cache design guide, architecture guides and the repository guide updated ([section 11](#11-proposed-guide-wording)).
- [ ] Tier 1, the four-Workspace case, tier 3 and the unselected sample of #320 rerun, one sample each.
- [ ] Rebase onto the committed baseline of the SDK refactor.
- [ ] Results recorded in the #320 ledger.

## 6. Expected file and folder structure

### 6.1 In the sandbox

Before this work:

```
/usr/local/bin/layerfs-daemon
/layerfs-store/                 shared volume, opened by every daemon
  global/
    store.sqlite                committed content and history
    store.sqlite-wal
    store.sqlite-shm
/layerfs-local/                 private to one daemon, disposable
  config/
    daemon.setup
  overlay/
    overlay.sqlite              every Workspace's uncommitted state, plus a 256 MiB reservation
/workspaces/
  <n>/                          mount point of Workspace n
```

Target (only `overlay/` changes; the second round adds nothing on disk):

```
/layerfs-local/
  config/
    daemon.setup
  overlay/
    template.sqlite             empty schema, built once before readiness
    <workspace>.sqlite          one per mounted Workspace: copied at mount, deleted at unmount
```

- Each overlay database is exactly one file: journal in memory, `synchronous=OFF`, exclusive locking, temporary data in memory. No `-wal`, `-shm` or `-journal` file and no reservation, so size on disk equals logical size.
- An empty overlay database was 233,472 bytes (57 pages of 4,096 bytes) with 26 tables; it gets smaller with fewer tables. It grows with what commands write and is never synced.
- Nothing new on the shared volume. The immutable object cache stays in daemon memory with no file.

### 6.2 In the source

Scope: private branch commit `20f237499` (unpushed), production lines from the pinned `tools/production_loc.py --files`. Only the directories that change most are shown; a bracketed number covers the files listed under it. Tests live in each crate's `tests/` directory and are not counted. The product total at that commit is 84,220.

```
core/crates/layerfs-daemon/src/      [4769]  (part: overlay/ and service/ only)
  overlay/                           [4042]
    admission.rs                       225   (step B: removed)
    backing.rs                         118   (stays: deletes the file at unmount)
    budget.rs                          166   (step B: removed)
    captured_namespace_port.rs          91
    captured_run_port.rs                49
    commands.rs                        832   (step B: mostly removed; the typed job list)
    credits.rs                          56   (step B: removed)
    file_port.rs                        58
    indexed_operation_record.rs        130   (step B: shrinks)
    mod.rs                              16
    native_directory_job.rs             82   (step A: removed)
    native_job.rs                      140   (step A: removed)
    operation_record_port.rs           181
    owner.rs                           661   (step B: shrinks to a lock around one connection)
    queue.rs                           460   (step B: removed)
    read_port.rs                       133
    workspaces.rs                      644   (step B: shrinks)
  service/                            [727]
    completion.rs                      196   (step B: removed)
    filesystem_port.rs                 446   (step B: shrinks to direct calls)
    job_sql.rs                          63
    mod.rs                               5
    observations.rs                      9
    startup.rs                           8
```

```
core/crates/layerfs-overlay/src/     [5246]  (part: lifetime/ and maintenance/ only)
  lifetime/                          [3682]
    captured_reader.rs                 190
    close.rs                           152   (step A: shrinks)
    composition.rs                     245
    file_owners.rs                     368   (step A: to memory)
    frontier.rs                         47
    generation.rs                      206
    indexed_operation_record.rs        204
    lookup.rs                          130   (step A: to memory)
    mod.rs                              23
    native.rs                          269   (step A: to memory)
    native_cookie.rs                   170   (step A: to memory)
    native_directory.rs                141   (step A: to memory)
    native_directory_read.rs           164
    native_file.rs                      94   (step A: to memory)
    native_mutation.rs                  82   (step A: shrinks)
    native_observation.rs               31   (step A: removed)
    native_visit.rs                    336   (step A: shrinks)
    operation.rs                       177
    operation_record.rs                151
    orphan.rs                          187   (step A: shrinks)
    source.rs                          145
    tickets.rs                         103
    workspace.rs                        67   (step C: shrinks)
  maintenance/                       [1564]
    garbage.rs                         246
    indexed_operation_record.rs         79
    mod.rs                              17
    native.rs                           86   (step A: removed)
    native_directory.rs                 49   (step A: removed)
    orphan.rs                          431   (step A: shrinks)
    pieces.rs                           81
    ready.rs                           252   (step A: terminal work removed)
    reclaim.rs                         255   (step A: removed)
    source_wait.rs                      68
  open/                                  —   new (step A: open state held in memory)
    mod.rs                               —   new
    files.rs                             —   new (open handles; unlinked but still open)
    kernel.rs                            —   new (kernel reference counts)
    directories.rs                       —   new (directory read positions)
```

```
core/crates/layerfs-fuse/src/        [1218]  (part: dispatch/ only)
  dispatch/                          [1218]
    admission.rs                       280   (step B: removed)
    diagnostics.rs                      29   (step B: shrinks)
    mod.rs                              14
    queue.rs                           229   (step B: removed)
    task.rs                            298   (step B: removed)
    types.rs                            92   (step B: shrinks)
    workers.rs                         276   (step B: shrinks to plain workers per mount)
```

The file names under `open/` say where the state goes; they are not a required scaffold.

Expected production lines after steps A and B. These are estimates from file sizes and file headers, not from a traced design:

| Area | At `20f237499` | Expected |
| --- | ---: | ---: |
| daemon `overlay/` | 4,042 | 1,600–2,000 |
| daemon `service/` | 727 | 400–500 |
| daemon `control/` (unmount, forced unmount, cleanup) | 2,144 | 1,900–2,000 |
| overlay `lifetime/` | 3,682 | 2,100–2,500 |
| overlay `maintenance/` | 1,564 | 900–1,100 |
| overlay `open/` (new) | 0 | 500–800 |
| overlay SQL: schema and triggers | 447 | about 300 |
| overlay `database/`, `contract/`, `diagnostics/` | 2,680 | 2,400–2,500 |
| fuse `dispatch/` | 1,218 | 300–450 |
| fuse `request/` | 1,787 | 1,400–1,600 |
| **Whole product** | **84,220** | **about 77,500–79,500** |

Step 1 added 1,178 lines (83,042 to 84,220). Part of that is per-Workspace queue, credit and ledger code that step B removes.

## 7. Table names

26 tables become 14, or 12 if the record merge holds. Every remaining table loses its leading Workspace column.

**Moved to memory in step A** (11 tables):

| Table | Holds | In memory as |
| --- | --- | --- |
| `file_custody`, `file_handle` | Open files and what holds each inode open | Open-file map |
| `file_read`, `lookup_owner` | Requests in flight | Nothing: the request thread holds the lock or its own value |
| `orphan`, `orphan_wait` | Files deleted while still open | A flag on the open-file entry; the file's data rows stay in SQLite until the last close |
| `native_mount` | The kernel connection of the mount | Fields of the Workspace |
| `native_lookup`, `native_parent` | The kernel's reference count per inode | Kernel-reference map |
| `native_directory`, `native_cookie` | Open directories and where a listing left off | Directory map |

**Dropped in step A:** `reclaim`.

**Kept and renamed in step C:**

| Today | Proposed | Change |
| --- | --- | --- |
| `workspace` | `workspace` | Keep; one row |
| `inode` | `fs_inode` | Rename |
| `directory_entry` | `fs_entry` | Rename |
| `payload` | `fs_data` | Rename: the written bytes |
| `payload_reference` | `fs_data_ref` | Rename: ranges that point at committed content |
| `shrink` | `fs_truncate` | Rename |
| `operation_record`, `owned_operation_record`, `indexed_operation_record` | `commit_record` | Merge if tracing confirms one shape serves all three |
| `operation_owner` | `commit_run` | Rename |
| `captured_reader` | `commit_reader` | Rename |
| `base_source` | `commit_base_pin` | Rename |
| `lease` | `commit_pin` | Rename; keep only the kinds a Commit still needs |
| `maintenance` | `cleanup_task` | Rename |

Columns follow the same idea: `serial` → `inode`, `gen` → `generation`, `owner` → `holder`, `ns` removed.

- The moves and merges come from reading the schema and file headers. Each is traced in the code before it is done; one that does not hold is recorded and left out.
- The word `native` also names the control channel (bridge crate) and host files at project Init (persistence crate). Renaming it outside the overlay is a separate, later change.

## 8. Clean implementation

What "done" means beyond the checklist:

- **Removed, not bypassed.** The reservation, the queue, credits, admission, the memory ledger, completion tracking, the request dispatcher, the moved tables and the terminal cleanup are deleted with their tests replaced. Nothing is left switched off by a constant or reachable only from tests.
- **Nothing carried from the prototype.** No fixed pool of databases, no numbered spare files, no offset Workspace numbers.
- **No new limit** on files, file size, edit size, edit count, open files, Commit size, or Workspaces per daemon beyond the existing configured capacity.
- **Memory stated, not assumed.** Each Workspace's allowance is listed in section 3 and its real footprint is measured and reported. Nothing sized by a whole file or a whole namespace is held in memory, with the one exception named in section 13.
- **Disk returns at unmount.** A long-lived Workspace reuses its own freed pages.
- **Same failure semantics.** One attempt, no retry, no busy handler, exact failure preserved. Disposable overlay only: no sync call on it. Global Store stays Disposable/WAL/`synchronous=OFF`.
- **No weakened check.** No oracle, proof, contract comparison or Storage read-back is relaxed to make a step pass.
- **Speed and storage reported together** for every step, with raw deltas.
- **Repository rules hold:** 999-line file ceiling, production-line comparison in every commit, tests bounded to two minutes, locked builds, no new dependency, no third-party source change.

## 9. The steps

| Step | What | Statements rewritten | Counts re-pinned |
| --- | --- | --- | --- |
| 1 | One SQLite file per Workspace, no reservation | None | No |
| A | Open state to memory; unmount deletes the file | The moved tables' statements are deleted | No |
| B | One lock per Workspace; plain workers per mount; separate page caches | None | No |
| C | Table revision of what remains | Every remaining statement, once | No |
| D | Fewer statements and round trips | The ones each change touches | No |
| E | Re-qualify: cells, proofs, harness pins, contracts, guide, rebase | — | Yes, once |

Step A comes before step B on purpose: B rewrites how every job is called, and A first deletes the jobs that would otherwise be rewritten and then removed. The open-state structure lives next to the connection in both steps, so B only changes what guards it.

After every step, on a sealed build, one run each of:

- the concurrent exec diagnostic at 2 CPUs and with CPUs unlimited;
- the long-history and cold-daemon session (16 Workspaces of 50 Commits, then a new daemon on an evicted Store file);
- tier 1 (`v016-mixed-development-100mb-5000-k100-v1`);
- the four-Workspace case (`v016-workspace-four-100mb-5000-k100-v1`).

Byte-for-byte oracles and the mounted proofs do not depend on counts and must pass at every step. The twelve cells' exact-count check is expected to fail from step 1 until step E and is reported as failing until then.

Targets, stated as directions and not as acceptance thresholds:

- Steps A and B: time per small file for one Workspace falls well below the 650 to 750 µs seen so far (native: 42 µs); four Workspaces at least as fast as the prototype; mount and Commit not slower.
- Whole product at or below the estimate in section 6.2.

## 10. Risks

| Risk | Handling |
| --- | --- |
| Gain is limited by CPUs: at 2 CPUs four writers are short of processors | Measured at both allotments after every step |
| Memory per Workspace is an allowance, not a hard cap | Workspace capacity is the global bound; footprint measured idle and loaded |
| The kernel-reference map grows with the files the kernel remembers | Measured in step A; owner decision in section 13 |
| A Commit holds the lock often enough to starve file requests | Measured after step B; simplest ordering mechanism added only if needed |
| More threads: workers per mount times Workspace capacity | Fixed per mount, chosen by measurement, reported |
| A waiting worker is blocked, not parked | Each mount has its own workers, so one Workspace cannot block another |
| Freed pages are no longer reused between Workspaces | Space returns at unmount; long-lived Workspaces watched in the session run |
| Disk-full is a mid-write failure | Proven by the adapted device-capacity tests in step 1 |
| Re-qualification is large and diverges from the SDK refactor's baseline | Done once in step E, then rebased |
| Commits still share one Store writer | About 7 ms at four Workspaces today; left as is |

Failure isolation gets simpler: a database or lock judged unsafe affects one Workspace, and deleting a file cannot fail halfway.

## 11. Proposed guide wording

Draft for the owner to approve; not applied. It replaces the draft of the first round.

| Today | Proposed |
| --- | --- |
| "One local overlay SQLite database belongs to each daemon and is initialized before readiness. Workspace metadata, physical payload, operation records and custody are namespaced within it. One SQLite writer does not serialize whole Execs or Commits; use short atomic jobs and bounded fair service." | "Each mounted Workspace has its own local overlay SQLite file, copied at mount from a template built before readiness and deleted at terminal unmount. Its metadata, payload and operation records live only in that file; its open-file, directory-position and kernel-reference state lives in daemon memory. Workspaces share no overlay connection, writer, page cache or memory budget; the daemon shares only committed immutable content and the global Store. One lock guards a Workspace's connection: hold it for one short atomic job, never across Store I/O, a whole Exec or a whole Commit." |
| "Repeated mount binds the complete root without a whole-tree scan/copy/materialization, dependency restoration or new database." | "Repeated mount binds the complete root without a whole-tree scan/copy/materialization or dependency restoration. The only file it creates is the Workspace's own overlay database, copied from the template." |
| "Terminal unmount includes close/cleanup; physical SQL deletion may finish later. It does not delete global history or imply that the shared database file shrinks." | "Terminal unmount drains requests, closes the Workspace's overlay connection and deletes its file. Reclamation inside a live Workspace stays automatic and bounded. Neither deletes global history." |
| "Large files, huge namespaces and mutation bursts require indexed/backed state, bounded windows, streaming and backpressure." | Unchanged. Added, if the owner accepts section 13: "The one resident exception is a Workspace's open state, which grows with open files and with the files the kernel currently references." |
| "no `fsync`/`fdatasync`/`sync_data`/`sync_all` on disposable Workspace backing" | Unchanged. Added: "no space is reserved ahead of use on it". |

## 12. Constraints carried from #320

- Private local branches only; nothing pushed, no pull request, the issue stays open.
- One sample per case and source identity; no retry, no best-of; a failed sample stays failed; seal before sampling.
- No command over two minutes; benchmark cases one per command.
- Disposable/WAL/OFF Store only; one construction producer. Durable: `NOT_RUN — disabled by owner until explicit reauthorization`.
- Canonical object identities do not change without the owner's agreement.

## 13. Open points for the owner

1. **Kernel-reference map.** In memory it holds one small entry per file the kernel currently remembers, so a Workspace that walks a million files holds a million entries until the kernel forgets them. The kernel shrinks its own cache under the container's memory limit and then tells the daemon to forget, so the map follows that limit and not a constant. Step A measures the entry size. The alternative is to keep only this one table in SQLite, at the cost of one more write per lookup. The plan assumes memory unless the owner says otherwise.
2. **Guide wording** in section 11.
