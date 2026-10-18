# #352 — Limits audit of the product code

> **Status:** Research; informative and not a product contract. Written
> 2026-10-18 by a side session of the #352 liaison, at source `efcb6d880`
> (branch `dsh-history-replay`). It classifies limits and does not select
> fixes. A LIVE-ARTIFICIAL row is a candidate finding for the owner, not a
> fix decision. Scope: `core/crates/*/src`, `sdk/js/native/src`,
> `sdk/js/src`. Tests, benchmarks and fs-bench-pro are out of scope.

## Method

1. Listed every `const`/`static` in scope (670), then the 317 whose names
   read as a bound (`MAX*`, `MAXIMUM*`, `*_LIMIT`, `*WINDOW*`, `*_BYTES`,
   `*_ROWS`, `*_DEPTH`, `*_WAIT`, `Duration` and similar), plus every
   remaining numeric constant (checked by hand).
2. Listed every refusal site: `Capacity(`, `BackendError::Capacity`,
   `BoundedCapacityExceeded`, `ObjectLimitExceeded`, `PathLimitExceeded`,
   `TooLarge`, `TooMany*`, `Busy`, deadlines and `Duration` constants.
3. For each constant, counted references outside its own definition across
   `core/crates`, `sdk/js/native` and `core/benchmark` (all of src, tests,
   examples). Zero references means dead code.
4. Read each enforcement site and classified it. **Evidence** is `code` (read
   at `efcb6d880`) unless a test is named.

Classes:

- **LIVE-ARTIFICIAL**: enforced, and it refuses (or silently drops) work over a
  count, history length, depth or time that is not a resource or format
  limit. Fixed admission counts that the caller cannot choose are listed
  here too, marked *fixed admission*. The owner decides whether those count as
  "explicit admission".
- **STALE**: a constant, refusal, test or doc line for a limit that is no
  longer enforced, or a doc that describes a retired bound.
- **LEGITIMATE**: a resource, platform or on-disk format limit, or a bounded
  window that streams, pages or chunks and never refuses the whole job.
- **THRESHOLD**: changes behaviour (fallback, truncation with a flag,
  eviction) without refusing.

Counts: LIVE-ARTIFICIAL 15 (6 count/history/depth, 3 time, 6 fixed
admission or resident-route), STALE 5 dead constants plus 3 stale docs and
1 product-unreachable refusal, THRESHOLD 16, LEGITIMATE about 230 (grouped
below; the rest are format tags, versions, offsets and row sizes).

## 1. LIVE-ARTIFICIAL

| # | Constant / value | Defined | Enforcement sites | What refuses, with which error | Evidence |
| --- | --- | --- | --- | --- | --- |
| A1 | `MAXIMUM_LINEAGE_ROWS` = 4,096 | `layerfs-history/src/contract/records.rs:24` | `layerfs-persistence/src/history/ancestry.rs:23-25` (`capacity`, called by the Commit walk `:56`, `layers_between :117`, `published_below :136`, merge-base build `:193`), `layerfs-persistence/src/history/layerstack.rs:389`, `layerfs-persistence/src/history/commit.rs:68` | Publish, merge, fork-from-Commit and Commit start checks fail `HistoryError::Capacity("lineage work")` → SDK `Capacity` once a walk passes 4,096 Commits since the base Layer, 4,096 Layers between sides, or 4,096 first-parent depth | Already **F-033**; bounded tests in `dsh-352-scale-experiments` `9ee945370`; v0.1.7 validation H02 asserts it |
| A2 | `MAXIMUM_MERGE_PATHS` = 262,144 | `layerfs-content/src/merge/decide.rs:32` | `decide.rs:176-182` (`merge.locate`), `:211-214`, `:220-221` (`merge.paths`) | A merge (`branch.merge`, merge at publish) with more than 262,144 candidate paths, or a path search listing that many directories, fails `ContentError::BoundedCapacityExceeded{what:"merge.locate"/"merge.paths"}` → SDK `Capacity` | code |
| A3 | Merge result build on the resident route: `FilesystemResources::default()` (`DEFAULT_ORDERING_BYTES` 64 MiB) → topology containers `ordering_bytes/1024` = 65,536 entries, declared rows `ordering_bytes/16` = 4,194,304 | `layerfs-content/src/filesystem/references/runs.rs:39`, `filesystem/input.rs:76-85, :97` | `merge/build.rs:172,177` calls `update_filesystem` without backing; `filesystem/validate.rs:248-256, :282-300` (declared), `validate/backed.rs:119-125` (`TopologyRecords::held`), `filesystem/update.rs:334-339, :676` | The merged root build fails `ObjectLimitExceeded` past 65,536 placement/territory/rooted entries or 4.19M declared rows. Workspace Commit construction uses the backed route (`layerfs-workspace/src/construction/driver.rs:215-220`) and is not affected. *Resident-route fixed admission*; the 65,536 bound is lower than A2's 262,144 for merges that move directories | code; not test-confirmed — needs a bounded merge test that moves a directory with more than 65,536 descendants |
| A4 | `MAXIMUM_PATH_COMPONENTS` = 256 | `layerfs-content/src/filesystem/limits.rs:16` | `filesystem/path.rs:157-164` (every `PathName`: SDK fs paths, merge and compare paths), `layerfs-workspace/src/operations/namespace/rename.rs:40-41` | A path deeper than 256 components fails `ContentError::PathLimitExceeded`; a mounted rename whose ancestry path is longer fails `Refusal::Invalid` (EINVAL). Linux has no component limit (`PATH_MAX` is per syscall string, and `openat` reaches deeper trees) | code |
| A5 | `ANCESTRY_STEPS` = 257 | `layerfs-overlay/src/lifetime/kernel_mutation.rs:10` | `kernel_mutation.rs:88-90`, used by `rename.rs:29-30` (directory moved to a new parent) | Moving a directory into a parent more than 256 levels deep fails `OverlayError::Invalid("kernel ancestry depth")`. Its comment says "not a namespace depth limit", but it refuses the rename | code |
| A6 | `MAXIMUM_MESSAGE_BYTES` = 4,096, plus refusal of control characters other than `\n` and `\t` | `layerfs-history/src/contract/records.rs:127` | `records.rs:172-180` (`CommitAttribution::check`), `layerfs-bridge/src/control_history.rs:163, :192`, `control_merge.rs:70, :83` | A Commit or merge message over 4 KiB, or one containing `\r` or any other control character, fails `HistoryError::InvalidInput("Commit message")`. Real Git histories contain longer messages and CRLF messages (relevant to the replay with F-031) | code |
| A7 | `MAXIMUM_RULE_FILES` = 16 | `layerfs-content/src/merge/lww.rs:18` | `lww.rs:72` | LWW rule `%include` files past the 16th are **silently ignored** (no error): the merge applies a partial rule set. The `seen` set already prevents cycles | code |
| A8 | admission `WINDOW` = 2 s | `layerfs-persistence/src/backend/sqlite/admission.rs:12` | `admission.rs:57-58, :80-83`; `transaction.rs:146, :194`; `seal.rs:23`; `lane.rs:5`; Linux writer lock `writer_admission.rs:41-55` | Any writer (Commit, Save, inode serial reservation, seal) that waits more than 2 s for the connection or the cross-process writer lock fails `BackendError::Busy` → SDK `Busy`; for a mount's serial refill it ends as `EAGAIN` (`layerfs-daemon/src/service/filesystem_port.rs:388-398` → `layerfs-fuse/src/attributes.rs:118`). A time limit on correct queued work (watch-out S2, S3) | code |
| A9 | `INIT_DEADLINE` = 60 s | `sdk/js/native/src/project.rs:22` | `project.rs:69` → `layerfs-project/src/import/namespace.rs:58, :186`, `import/files.rs:199, :222` | SDK `project.init` of any tree that takes longer than 60 s fails with the import deadline error. A large repository cannot be initialised through the SDK | code |
| A10 | `IN_PROCESS_WAIT` = 60 s | `sdk/js/native/src/discovery.rs:128` | `discovery.rs:150-161` | A discovery mutation (mount, unmount, sandbox create/close on one Sandbox directory) that waits more than 60 s for another call in the same process fails `Busy` (watch-out P6) | code |
| A11 | `WAITERS` = 1,024 | `layerfs-persistence/src/backend/sqlite/admission.rs:14` | `admission.rs:67-69` | The 1,025th thread queued on one Store connection fails `BackendError::Capacity`. *Fixed admission*; 8 KiB of tickets is not a resource limit | code |
| A12 | SDK daemon `namespaces: 16` | `sdk/js/native/src/sandbox.rs:62` | `layerfs-daemon/src/application/owner.rs:67` → `layerfs-store-service/src/overlay/workspaces.rs:182-184` (`OwnerError::AdmissionFull`) → `layerfs-daemon/src/control/failure.rs:224` | The 17th concurrent mount on one Sandbox fails `Capacity`. `DaemonLimits` calls it explicit admission, but the SDK fixes it and the caller cannot choose. *Fixed admission* | code |
| A13 | `DAEMON_CONNECTIONS` = 8, `pool::CONNECTIONS` = 6 | `sdk/js/native/src/sandbox.rs:46`, `pool.rs:25` | daemon accept loop `layerfs-daemon/src/application/connection.rs:20-32` (slots from `owner.rs:134`, `connections + 1`) | With every slot busy, the daemon drops a new socket unauthenticated, so the caller sees a failed connection rather than a typed refusal. More than 8 concurrent control connections to one Sandbox (all processes together) fail. In one process the pool waits for a free one of its 6. *Fixed admission* | code |
| A14 | `CALLS` = 64 (in-process Store-call Workspaces) | `layerfs-store-service/src/store_service.rs:32` | `store_service.rs:139-147`; also `OwnerConfig{namespaces: CALLS}` `:109` | More than 64 concurrent SDK Store calls in one process fail `"Capacity: Store call Workspace capacity"`. *Fixed admission* | code |
| A15 | Read-session admission: `state.sessions.len() > self.capacity` | `layerfs-store-service/src/store/read_service.rs:101-104` | same | A read session past the configured count fails `ReadAdmissionError::Capacity`. The count is set from A12/A14, so this is the same fixed admission at the read side | code |

Related defect seen in passing (not a limit refusal): `WRITTEN_PATHS` = 4,096
(`layerfs-store-service/src/store/commit_merge.rs:20, :141`) truncates the
merge report's written-path list, but `root_changes` sets a `truncated`
flag that `commit_merge.rs` drops; `layerfs-daemon/src/control/operations.rs:39-44`
then sends `truncated: false`. A conflict report with more than 4,096
written paths states that it is complete.

## 2. STALE

| # | Item | Where | Why stale | Action in this branch |
| --- | --- | --- | --- | --- |
| S1 | `LOOKUP_PAGE_IDS` = 128 | `layerfs-storage/src/store/policy.rs:36` | No reference anywhere in Rust source, tests or benches; the lookup now uses `Transaction::input_limit` (SQLite variable/length limits) | deleted (dead code) |
| S2 | `CLEANUP_PAGE_ROWS` = 128 | `layerfs-storage/src/store/policy.rs:70` | No reference | deleted (dead code) |
| S3 | `POOLED_LEAF_ROWS_LIMIT` = 100 | `layerfs-storage/src/store/policy.rs:92` | No Rust reference (one comment in a non-member benchmark crate); the bound is `layerfs_content::object::inode_leaf::MAXIMUM_LEAF_ROWS` | deleted (dead code) |
| S4 | `inode_leaf::MINIMUM_LEAF_ROWS` = 50 | `layerfs-content/src/object/inode_leaf.rs:36` | No reference; the live twin is `filesystem::limits::MINIMUM_INODE_LEAF_ROWS` | deleted (dead code) |
| S5 | `EDIT_DEFERRED_LIMIT` = 8 MiB − 1 (memory-route deferred edit state) | `layerfs-content/src/file/edit/objects.rs:14`, enforced `edit/engine.rs:205-210` | No product caller reaches the memory route: the only product edit entry is `apply_indexed_edits_view_backed` (`layerfs-workspace/src/construction/captured/owner.rs:264`). `apply_edits`/`EditObjects::new` are public library API used by 16 content test files | **kept**: removing the memory route is a refactor of a public API and its tests, not a limit cleanup; proposed as a follow-up |
| S6 | `core/docs/architecture/06-limits.md` §9 | rows naming `MAXIMUM_EDITS_PER_OPERATION`, `BATCH_CANONICAL_BYTES_LIMIT`, `METADATA_GROUP_LIMIT`, `METADATA_DECODED_WORK_LIMIT`, `VALUES_PER_GROUP`, `LOOKUP_PAGE_IDS`, `CLEANUP_PAGE_ROWS`, `POOLED_LEAF_ROWS_LIMIT`, `MAX_CONCURRENT_WRITES_LIMIT`, `store_policy.max_concurrent_writes`, `MAX_READ_OPERATIONS`, `session_capacity`, `MAX_FILE` (4 GiB), `MAX_SAVE_STREAM_BYTES`, `file_stream::*`, `metadata_pages::*`, `key_limit`, `MAX_PREPARED_STREAM_BYTES`, `METADATA_BYTES`; wrong values for the dependency pack cache (now 2 MiB) and delta depth defaults (now 16 / 8 / 8); no history, merge, depth or time limits | None of those names exists at `efcb6d880`; the file size limit is `i64::MAX` (`layerfs-workspace/src/operations/file/write.rs:56-60`) | corrected: current-source banner, stale rows marked retired, new subsection of live undeclared limits pointing here |
| S7 | `core/docs/architecture/10-counters.md` §15.4 "the twelve 4,096s" | table | Lists the retired `MAXIMUM_EDITS_PER_OPERATION` and the retired `validate::walk_limit` row as a 4,096, and omits ten current 4,096s, among them `MAXIMUM_LINEAGE_ROWS` | corrected: table replaced by the current list |
| S8 | `06-limits.md` "three bounds", bound 2 | text | Says twelve constants are 4,096; now there are 22 | corrected with S7 |

No test asserts a retired refusal: all `#[ignore]` tests were read, and no
test refers to a retired limit name (any that did would not compile). The
v0.1.7 H02 Capacity regression asserts a **live** limit (A1); F-033 owns its
replacement.

Not limits, out of scope, seen dead: `IDENTITY_FORMAT`
(`layerfs-history/src/contract/identity.rs:44`) and the never-constructed
`ContentError::RootMutation` and `ContentError::IncompleteOperation`.

## 3. THRESHOLD (behaviour changes, nothing refused)

| Constant | Value | Defined | Effect |
| --- | ---: | --- | --- |
| `MAXIMUM_TEXT_BYTES` | 1 MiB | `layerfs-content/src/compare/text.rs:12` | Text merge/diff falls back to whole-file conflict/binary (`merge/decide.rs:262-272`) |
| `MAXIMUM_DIFF_CELLS` | 1 Mi cells | `compare/text.rs:14` | Line diff falls back to a coarse result |
| `MAXIMUM_CHANGED` | 65,536 | `compare/changes.rs:36` | Change listing reports truncation |
| `compare/named.rs` `DEPTH`/`PATHS` | 4,096 / 1,024 | `compare/named.rs:27,29` | Naming from hints gives up (`Ok(None)`) and falls back to the tree walk |
| `PREDECESSOR_DESCRIPTOR_LIMIT` | 4,096 | `file/mapping/predecessor.rs:27` | Predecessor search stops (`exhausted`); only delta candidates shrink |
| `MAXIMUM_ADVISORY_PREDECESSORS` | 4 | `object/predecessor.rs:14` | Advisory list bound; callers push at most the fixed few |
| `WRITTEN_PATHS` | 4,096 | `layerfs-store-service/src/store/commit_merge.rs:20` | Merge report truncation (flag lost, see §1) |
| `control/dirty.rs` `PATHS`/`ROWS`/`WALK`/`DEPTH` | 256 / 4,096 / 4,096 / 256 | `layerfs-daemon/src/control/dirty.rs:20-26` | Dirty report names at most 256 paths and says `truncated` |
| `KEPT` (exec output) | 1 MiB per stream | `sdk/js/native/src/exec.rs:18` | Rest counted, `truncated: true` (watch-out S6) |
| `window::LINES`/`BYTES` | 2,000 lines / 48 KiB | `layerfs-store-service/src/sdk/window.rs:15-16` | `fs.read`/grep/blame page; caller continues by offset |
| `MAX_NODES`/`MAX_DEPTH`/`MAX_LABEL_BYTES` | 1,024 / 32 / 128 | `layerfs-telemetry/src/timer/recording.rs:15-21` | Telemetry recording drops nodes past the bound |
| `PLANS` | 4 | `layerfs-store-service/src/sdk/plans.rs:15` | LRU of compare plans; a miss recomputes |
| `METADATA_INDEX_VALUES` memo | 131,072 | `layerfs-storage/src/store/policy.rs:152`, `save/pooled.rs:107` | Value memo cleared at the bound; a miss stores one more row |
| `SERIAL_REFILL`, `serial_low_water` | 1,024, 256 | `layerfs-workspace/src/workspace/serials.rs:8`, `sdk/js/native/src/sandbox.rs:64` | Inode serial pool refill size (refusal path is A8) |
| `DIRECTORY_COUNT_CAPACITY` | 16,384 | `layerfs-workspace/src/base/links.rs:23` | Link-count cache eviction |
| `DEFAULT_MAXIMUM_PENDING` | 4,096 | `filesystem/references/reduce.rs:25` | Reducer spills to runs |

## 4. LEGITIMATE (resource, platform or format; windows that stream)

Grouped. "Window" means callers chunk to it; exceeding it only happens on a
caller bug and refuses that one call.

- **Platform/POSIX**: `MAXIMUM_NAME_BYTES` 255, `MAXIMUM_PATH_BYTES` 4,096,
  `MAXIMUM_SYMLINK_TARGET_BYTES` 4,096 (`filesystem/limits.rs:12-43`),
  `MAXIMUM_INODE_SERIAL` `i64::MAX` (`filesystem/identity.rs:20`), file size
  `i64::MAX` (`workspace/operations/file/write.rs:56-60`,
  `operations/attributes.rs:41`), `nlink` `i64::MAX`
  (`namespace/create.rs:124`), `MAXIMUM_NANOSECONDS`, FUSE `NAME_BYTES`,
  `BLOCK_BYTES`, `DECLARED_FILES`/`DECLARED_BLOCKS` (statfs reporting only),
  `MAX_INPUT_BYTES` (= `WRITE_WINDOW` + names, matches negotiated
  `max_write`), FUSE `TTL` 60 s.
- **Extended attributes (format, near platform)**: domain 64 B, key 255 B,
  value 32 KiB (= one chunk; Linux allows 64 KiB, ext4 one block),
  `MAXIMUM_ATTRIBUTE_KEYS` 4,096 per listing (`filesystem/read.rs:317`;
  Linux `XATTR_LIST_MAX` 64 KiB allows up to about 9,000 one-letter keys on
  tmpfs, so this is a borderline format limit — noted, not listed above).
- **Content format**: canonical object 16 MiB, field 8 MiB, chunk 8/16/32 KiB,
  mapping entries 64–128, level ≤ 31, node 8,192 B, tree page 8,192 B, inode
  leaf 50–100 rows, branch 64–127, small-file threshold range 128 KiB–1 MiB,
  delta depth ≤ 50 (policy range), whole-file frame limits, row byte sizes,
  `MAXIMUM_TREE_LEVEL`.
- **Storage format**: `GROUP_LIMIT`, `GROUP_TARGET`, `PACK_LIMIT`,
  `GROUP_COUNT_LIMIT`, `RECORD_COUNT_LIMIT`, `CANONICAL_LIMIT`,
  `SINGLETON_PACK_LIMIT`, chain limits, metadata chain/record limits,
  `INODE_LEAF_LIMIT`, `PROGRAM_LIMIT`, metadata ordinal space ≤ 2^32 per
  Store (`layerfs-persistence/src/metadata/allocation.rs:18-21`; a lifetime
  format bound, noted).
- **Windows that chunk**: `BATCH_OBJECT_LIMIT` 512,
  `TRANSACTION_ROW_LIMIT` 8,191, `TRANSACTION_CANONICAL_BYTES_LIMIT`,
  `READ_OBJECT_LIMIT` 4,096, `MAXIMUM_READ_DEMANDS` 4,096, `DEMAND_IDS`,
  `DEMAND_BYTES`, `READ_WINDOW`/`WRITE_WINDOW` 128 KiB, `PAGE_ROWS` 64,
  `OPERATION_RECORD_BYTES` 64 KiB, `codec::WINDOW` 64 KiB, acquisition
  read/write windows, `METADATA_INDEX_VALUES` per reservation, SQLite
  `input_limit` (`transaction.rs:28-40`), dependency pack set
  (`objects_read.rs:45-49`, derived from pack and chain format),
  `MAXIMUM_PAGE_RECORDS` 128 and `MAXIMUM_RESULT_BYTES` 16 KiB (history pages
  with cursors), `HISTORY_WINDOW` 32, operator `BUDGET`/`LAYER_BUDGET` (pages
  with `more`), control record 65,519 B (`layerfs-bridge/src/wire.rs:5`).
- **Fixed-shape protocol fields**: `MOUNT_DIRECTORY_LIMIT` 1,024,
  `TEXT_FIELD_LIMIT` 4,096 (clipped report text), `MAXIMUM_VALUE_DEPTH` 16,
  `control_sdk::MAXIMUM_NAME_BYTES` 64, native `convert.rs` `DEPTH` 16,
  `MAXIMUM_CURSOR_BYTES` 160, history `NAME_MAX_BYTES` 63 (Branch and stack
  names; a declared name format).
- **SDK `TooLarge`** (`layerfs-api/src/base/sdk.rs:28-46`): after #352 F-020
  the only caller of `exchange_call` is `operator::call`
  (`layerfs-api/src/operator/call.rs:7-19`) with three operator methods whose
  arguments are a path or a project name. Exec goes to Docker directly
  (`layerfs-api/src/sandbox/exec.rs`), Store calls run in process, and
  operator replies page. Only a request over 65,519 B could reach it, which
  no valid argument is. Format limit of one control record; effectively
  unreachable.
- **Handshake and connection timeouts**: `handshake_ms` 2,000 and the pool's
  10 s connect/read/write timeouts are cleared after the handshake
  (`layerfs-bridge/src/duplex/channel.rs:67-74`,
  `layerfs-daemon/src/application/connection.rs:161-162`); Docker `ENGINE`/
  `STARTUP` 30 s and `KEPT_IDLE` 30 s bound container control calls, not
  product work; daemon `READY_WAIT`/`DRAIN_WAIT` 5 s are observation
  deadlines that keep owners retained (`application/filesystem.rs:50-54`).
- **Memory budgets that evict**: `CACHE_BYTES` 64 KiB, pager 1 MiB,
  `POOLED_VALUE_CACHE_BYTES`, `DECODED_GROUP_CACHE_BYTES`,
  `DEPENDENCY_PACK_CACHE_BYTES` 2 MiB, compare `MEMO_PAGES`, `RESIDENT_BYTES`.
- **Disk budget**: `DEFAULT_BACKING_CAPACITY_BYTES` 256 MiB
  (`filesystem/references/backing.rs:32`) is used only by `FileBacking::new`,
  which no product path calls.

## 5. Proposed next steps (owner's call)

1. Record A2–A15 as findings in the F-033 format (the liaison has the
   candidate text), each with a bounded test before any fix, as F-033 had.
2. A3 needs its bounded test first; it may make the effective merge cap 65,536
   rather than 262,144 for directory moves.
3. S5 (memory edit route) is a separate refactor: delete `apply_edits`, the
   memory `State` and the tests that drive it, or keep it as library API.
