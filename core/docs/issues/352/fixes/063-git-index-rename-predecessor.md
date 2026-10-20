# F-063 · a file saved by rename-over stored every changed chunk FULL

> **Status:** Current fix record (#352, from the
> [`.git` storage RCA](../GIT_STORAGE_RCA.md) §4, owner-approved
> 2026-10-20). Product change in `layerfs-content`, `layerfs-overlay`,
> `layerfs-workspace` and `layerfs-store-service`. The Store format is
> unchanged. The per-Workspace overlay schema goes from 38 to 39 (one new
> table).

| | |
| --- | --- |
| Trigger | RCA of r28–42: the git index cost 4.5–6.3 MiB per range, all FULL chunks, a third of `.git`'s growth |
| Issue | #352 |
| Kind | code path: `operations/namespace/rename.rs`, `layerfs-overlay` `namespace/predecessor.rs` and `compound.rs`, `construction/namespace/normalize.rs` and `inodes.rs`, `construction/captured/owner.rs`, Content `construct_runs_with_predecessor` |
| Binaries | Linux release, pinned image `378b799ef433`: old daemon `7ca090bd` (origin/main `6e8986ff46`) → new daemon `fd95a02d`; addon `1247df6b` for both arms; runtime image `d3773b4e` |
| Commits | this commit; tests in `core/crates/layerfs-daemon/tests/rename_predecessor.rs` |
| Recovery | none: no attempt reran |

## Root cause

**git saves its index by writing `index.lock` and renaming it over `index`.
The renamed file is a fresh inode, and Commit construction found its delta
base only by inode serial.**

`construct_file` binds a predecessor with `base.captured_file(serial)`.
A fresh inode has none, so it went to `construct_new` → `construct_runs`
with `no_hint`. Every chunk that CAS did not reuse was stored FULL. Each
lane step rewrites about half of a 545 KB index (`st_dev` changes with every
mount, so 48% of entries change), which gave about 6 changed chunks of 18 KB
each per lane Commit.

## Change

- **Record (no Store I/O).** `rename()` passes `(moved, replaced)` in
  `Changes::predecessor` when a regular file replaces a regular file.
  Overlay `apply_checked` writes it to `fs_predecessor` in the same job.
  `check_changes` refuses a malformed pair. If the replaced file was itself
  created in this Workspace (`created_above(born)`), the moved file inherits
  the replaced file's predecessor. A chain such as `git add` then
  `git commit` in one Workspace therefore ends at the base file. The
  replaced file's own row is dropped.
- **Read.** `values()` asks for predecessors once per page. It asks only
  for fresh, linked, non-root files at or above the small-file threshold
  (128 KiB). `captured_predecessors` is a defaulted port method:
  the Overlay and `OwnerClient` implement it, and other providers return
  none.
- **Use.** `construct_new` resolves `base.captured_file(predecessor)`.
  If the base holds it, `construct_runs_with_predecessor` opens it lazily
  at the first chunk and offers each chunk through the existing F-005
  `Aligner`. If the base does not hold it (a wrong role or no file), the
  file gets no hint and the Commit does not fail.
- **Unchanged:** canonical identity, the selector's one trial and PREFIX
  only when strictly smaller, chunk depth cap 8, chain budgets
  (512 KiB / 256 KiB), the Store format and the Store layout.
  `Decided::Publish` now boxes `Changes`; the extra field crossed Clippy's
  `large_enum_variant` threshold.

## Proof

`rename_predecessor.rs` (daemon, real overlay, SQLite Store, 400 KiB
files):

1. A rename-over from another directory, then Commit. Chunks are PREFIX
   with 0 FULL, stored bytes are under a quarter of the file, the read-back
   is byte-identical, and the root equals a plain build of the same bytes.
2. A chain of two renames before one Commit ends at the base file. A third
   Commit covers a stale row after install.
3. A predecessor the base does not hold gives no hint and no error.
4. A file renamed back over its own replacement (hard link) is not its own
   predecessor.

With the rename hook disabled, tests 1 and 2 fail. No existing assertion
changed.

## Performance and storage, old vs new

r42 sealed Store (`p3-main-w/restore`), a clone per arm, 25 lane steps per
arm. Each step mounts, writes a new file, appends to `README.md`, runs the
lane's git commands (`gitlanes.mjs` `laneCommands`: status, diff, add,
porcelain commit), Commits and unmounts. One sample per arm. Host 1-min load
8.5–10.

| Steps 2–25 (24 lane Commits) | Old | New |
| --- | --- | --- |
| Stored payload bytes | 1,463,988 | 297,095 (−80%, −48.6 KB per Commit) |
| Metadata bytes | 93,681 | 93,696 |
| Index chunks FULL / PREFIX | 120 / 0 | 10 / 110 (FULL at each 9th version: depth cap) |
| Whole files FULL / PREFIX | 173 / 43 | 173 / 43 |
| Commit p50 / p95 | 19.2 / 25.5 ms | 20.1 / 24.9 ms |
| Fresh-mount `git status` p50 / p95 | 480 / 668 ms | 440 / 630 ms |

- **Pack parse (all 25 steps).** Index chunks: 148 in both arms, raw
  3,001,914 bytes.
  - Old: stored 1,511,399 bytes, all FULL.
  - New: stored 344,931 bytes (−77%). That is 38 FULL chunks (333,981
    bytes, including step 1's 28) and 110 PREFIX chunks (10,950 bytes,
    about 99 bytes each).
- **Step 1** has no predecessor (`read-tree` writes the index). It is FULL
  in both arms: 234,472 vs 234,476 bytes.
- **Time.** Commit p50 +0.9 ms and p95 −0.6 ms, both under the 5 ms floor.
  `git status` did not slow down. The PREFIX chunks decode within the
  depth cap.
- **Estimate.** The RCA estimated 85–87% of index bytes. The measured
  saving is 80% on lane Commits. The RCA's 4–5.5 MiB per range scales
  down to about 3.8–5.1 MiB.
- **Binaries.** The measured new daemon predates two changes: boxing
  `Changes` in `Decided` and renaming the comments from F-061 to F-063.
  Neither changes behaviour.

## Checks

- Clippy `-D warnings`, `--all-targets`, on content, overlay, workspace,
  store-service and daemon: host `+1.85.1` passes, Linux (image
  `378b799ef433`) passes.
- Tests, each run ≤120 s:
  - content: 485 passed, 2 ignored;
  - overlay: all passed;
  - workspace: 176 passed;
  - store-service: 3 passed;
  - daemon: 57 binaries, one at a time, 55 pass.
- **Daemon test gap:** `complete_installed_roots` (1 of 5) and
  `host_handoff` (1 of 1) fail on the macOS host. These are the known host
  precondition failures and do not come from this change.
- Boundary guard: 57 violations, the same set as origin/main.
- rustfmt: the changed files are clean. Main has formatting drift in files
  this change does not touch.

## Left open

- **Delete then create** (`rm f; write f`) and copies from outside the
  mount (`EXDEV`) still get no hint. Only rename-over names a predecessor.
- **Lane step 1** and each depth-cap refresh stay FULL.
- **Loose objects and packs** are about 7–9 MiB per range. They are zlib
  streams out of CAS reach (RCA §5).
- **The replay** keeps its binaries. This reaches it at the next
  re-baseline.
