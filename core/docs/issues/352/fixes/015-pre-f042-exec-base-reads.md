# Pre-range 15 · F-042 · exec over committed content: vitest 3.7× and tsc 1.5× native, base reads growing with directory size (RCA first)

| | |
| --- | --- |
| Trigger | P3 dev range 15 (`dev352-p3f`, RESULTS row 124), one sample each, LayerFS vs native: vitest 5.6 vs 1.5 s (3.7×), `tsc -b` 9.8 vs 6.4 s (1.5×), first install 13.0 vs 4.1 s (3.2×). #356 flatness probe: lookup per entry 59 → 99 µs from 100- to 10,000-entry committed directories, every lookup missing memory and re-reading the base |
| Playbook step | D0 (RCA: per-op timing and counts) before any change |
| Kind | 1 forward-only (REBUILD.md), expected: daemon/FUSE/read-path code and configuration. Revised in this record if the RCA calls for a Store format change |
| Old Stores | not involved (expected) |
| Old data | not involved (expected) |
| Compatibility test | not applicable unless the RCA changes a stored format |
| Recovery | none expected: no Store change |
| Issue | GitHub `Ephemeral-AI-Lab/layerfs#357` |
| Owner | #352 lead and fixer (owner decision 2026-10-18), order placed by the lead |
| Status | open: RCA |

## What is known

- The SDK starts each daemon with a 64 KiB shared canonical cache
  (`sdk/js/native/src/sandbox.rs:61`); the daemon's own default is 8 MiB. The
  #356 work raises it to 8 MiB (with daemon RSS before and after). This record
  measures what remains after that.
- The Store read path costs ~28 SQL statements per object fetch
  (`FileView::open`, likely delta-chain resolution, whole-file depth up to 16),
  measured by #354 on range 14. #354 now optimizes that path (F-035 scope
  extension); this record consumes its result, it does not duplicate it.
- Candidates from code reading (crazy_work_load_watch_out.md P1, P4; not
  measured):
  - failed lookups answered as `ENOENT` errors, not cached negative entries
    (`layerfs-fuse/src/attributes.rs:102`); Node module resolution probes
    many missing paths;
  - one background request in flight per mount (`max_background = 1`,
    `mount/profile.rs:45-46`) and two receive loops; one Workspace lock; one
    `ReadSession` mutex per Workspace;
  - Workspace pager 1 MiB; a fresh one-shot Workspace starts with a cold
    kernel cache and a new Store reader;
  - readdir of a committed directory looks up each entry separately
    (`operations/kernel_directory.rs:245`, F-026 in the mount path);
  - link count of a committed directory by listing it (`base/links.rs:85-127`).

## RCA (to be filled)

For `vitest run` (the range's 30 files) and `tsc -b` (81 packages) on the
P3 dev tree, LayerFS and native, same image and paths:
1. Per FUSE opcode: count, total ms, µs each, and `ENOENT` lookups.
2. Store side: cache hits and misses, statements and pages read per opcode,
   `ReadSession` and Workspace-lock wait.
3. Kernel side: `strace -c -f` natively and in the Workspace: syscalls per
   failed `stat`/`open`.
4. Cold vs steady: run each twice, once in a fresh one-shot Workspace and
   once again in the same Workspace.
5. Time outside callbacks (kernel, transport, exec).
6. Growth: per-entry lookup cost against directory size (the #356 probe) and
   against tree size.

Then rank the causes by measured share and fix the top ones.

## Rules

Generic (no special-cased paths), exact POSIX results, kernel permission
checks kept (`default_permissions`), no retries, Disposable profile, no speed
bought with unbounded memory or storage; caches bounded and declared. One
sample per arm, quiet window, cache state declared (AGENTS §1).

## Target

Set from the RCA with the owner. Reference: SPEC §5 "FUSE vs native exec"
row (≤ 1.2× baseline pass, optimize > 1.5×). Per-entry cost flat against
directory size.

## Proof (to be filled)

Old vs new per-op tables; vitest and `tsc -b` LayerFS vs native; flatness
probe; results equal (test outcomes and build outputs unchanged).
