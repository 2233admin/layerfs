# Directory entries and operation records

> **Status:** Current source terminology following owner direction2026-10-07.
> The table names and the record shapes below were revised by issue #321
> Step C (2026-10-14); the section "Schema 34" is current and supersedes the
> relation names, the `ns` partition and the schema numbers in the older text.

## Schema 34: one Workspace per database

Each Workspace has its own overlay database file, so no row carries a
Workspace key. Only the `workspace` row names its namespace (`ns`), and the
engine refuses to open a second Workspace in a database. Open state stays in
memory, keyed by that namespace. Rust type, method and counter names are
unchanged; only the SQL relations, their indexes and three column names changed.

| Relation (schema 34) | Was | Holds |
| --- | --- | --- |
| `fs_inode` | `inode` | inode rows per generation |
| `fs_entry` | `directory_entry` | directory entries, including recorded removals |
| `fs_data` | `payload` | payload cells and dense runs |
| `fs_data_ref` | `payload_reference` | reference pieces naming committed content |
| `fs_truncate` | `shrink` | truncation steps |
| `commit_run` | `operation_owner` | an engine-minted operation owner |
| `commit_reader` | `captured_reader` | a captured reader |
| `commit_base_pin` | `base_source` | a base-source owner |
| `commit_pin` | `lease` | a custody pin |
| `commit_record` | `indexed_operation_record` | indexed operation records |
| `cleanup_task` | `maintenance` | the bounded maintenance queue |

Columns `serial`, `gen` and `owner` are `inode`, `generation` and `holder`.
Indexes follow their tables (`fs_inode_capture`, `fs_entry_capture`,
`fs_data_generation`, `fs_truncate_generation`, `commit_pin_resource`,
`cleanup_task_ready`, `cleanup_task_generation`).

The integer-keyed `operation_record` and `owned_operation_record` relations
and their methods are removed, not merged. One shape cannot serve an integer
key and an (8-byte file scope, kind, 32-byte key) identity without an untyped
key, a caller-chosen and an engine-minted operation number could collide in
one relation, and neither integer-keyed relation had a production writer.

Schema 35 removes the `accounting` table and all 27 accounting triggers.
`Resources` computes identical row counts and byte sums on demand in one SQL
observation, projecting lengths rather than payload values. The explicit observer
pays for table visits; mutations, base reads and cleanup no longer maintain a
diagnostic row. The daemon aggregate remains the sum over Workspace files. The
maintenance cursor is (kind, resource, target). Configured page quotas remain
physical limits: creation fails if its schema exceeds the chosen quota. The
schema-34 30-page observation precedes accounting removal and is not a
schema-35 size claim.

`user_version` is 35. The file is created fresh and is never reopened: there
is no migration, conversion or retry.

## Rows the engine remembers

Issue #321 Step D. The connection of a Workspace file is the only one, holds
the exclusive lock and runs one job at a time, so three rows change only by
its own statements. The engine keeps what it last read or wrote of each:

| Remembered | Read by | Forgotten by |
| --- | --- | --- |
| The `workspace` row with its incarnation | `Overlay::state` and every fence built on it | a writing statement whose text names `workspace` |
| The operation owner last found in `commit_run` | `check_operation`, `fence_operation` | a writing statement whose text names `commit_run` |
| The captured reader last found in `commit_reader` | `check_captured_reader` | a writing statement whose text names `commit_reader` |

A statement cannot change a table that its text does not name; schema 35 has
no triggers. Only statements of the Workspace,
Capture and Lease families write these tables, so the text of any other
writing statement is not searched (a debug assertion checks the rule). A job
that began a transaction and failed forgets all three, because it may have
read its own writes before they were rolled back; a job that failed before
its first write wrote nothing and forgets nothing. An owner or reader that is
not found is not remembered.

The frontier advance of a publication returns the row it wrote
(`FRONTIER_ADVANCE ... RETURNING`), and the fence that reads an inode's row
with the Workspace's (`FENCE_LOOKUP_ROW`) returns it too, so both refresh the
memory. A fence that needs only the Workspace row and a custody that is
remembered is then no statement: the fences of RELEASE, RELEASEDIR, READ,
READDIR and FORGET, and of every record and reader job of a Commit.

## Earlier terminology (schema 16 to 33)

A `directory_entry` is a directory name-to-inode binding, including a recorded
removal. The Overlay public DirectoryEntry and its windows/changes describe the
same concept. The SQL table, capture index, accounting triggers, prepared
identifiers, source/captured read methods, counters and daemon responses use
that terminology. Bare component bytes remain `name`/PathName; kernel/VFS dentry
terminology remains external terminology.

An `operation_record` is an intermediate record owned by a Workspace operation.
The three existing access/ownership shapes retain their distinctions:

| SQL relation | Public shape | Existing ownership |
| --- | --- | --- |
| operation_record | OperationRecord, integer key | Explicit operation lease |
| owned_operation_record | OperationRecord, integer key | Engine-minted OperationOwner |
| indexed_operation_record | IndexedOperationRecordScope/Key/Change/Apply | OperationOwner plus full file scope/kind/binary key |

Workspace uses OverlayOperationRecords and typed OperationRecord replies,
refusals and copy observations. Daemon routes IndexedOperationRecord jobs through
the same fair service class/lane positions. Module filenames and function names
match those concepts. No keys, algorithms, limits or release prerequisites change.
Qualification and construction still use these rows in the one daemon-local
overlay. All Workspaces still share physical tables partitioned by `ns`; no
per-Workspace table or database design is introduced.

The physical SQL name change advances user_version from15 to16. The same
application id and MEMORY/OFF/EXCLUSIVE profile remain. Overlay creates a fresh
owned file with create_new and verifies schema16. Existing paths are refused;
there is no implicit migration, reopen, conversion or retry.

Generic Content sorting/decoder heap scratch, native crypto/frame buffers and
filesystem temporary scratch directories are different concepts and keep their
terminology. Historical source snapshots, raw receipts and E04 schema parsers
also keep the vocabulary of their recorded identity. The previous49 document
path remains as a historical link to the current operation-record description.

[The naming checkpoint](../issues/307/PRE-S8-TERMINOLOGY-20261007.md) records
file planning, exact SQL equivalence under names/version substitutions, runtime
checks, failures and source/LOC identities. This is a naming change and supplies
no new storage-layout, performance, FUSE or complete Commit qualification.
