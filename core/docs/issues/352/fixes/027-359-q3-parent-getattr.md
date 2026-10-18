# #359 · Q3: the parent GETATTR after every unlink (kernel source and trace)

| | |
| --- | --- |
| Trigger | Liaison 2026-10-18 (owner Q3, "yes, examine it"): read the kernel source and trace the behaviour, keep `default_permissions` on, and report whether any route drops the parent revalidation with it kept. Implement nothing that weakens permission checks |
| Kind | investigation only. No product change |
| Kernel | `6.12.76-linuxkit` (Docker Desktop VM), source `linux-6.12.76/fs/fuse/` (`core/target/cluster2-307/linux-timestamp-fix/`) |
| Trace | one diagnostic `rm-rf-nm --part lfs`, ledger seq 401, label `trace-diag` (not a measured sample; kprobe overhead included), daemon `cc185d13`. A private tracefs instance `layerfs-issue359-q3` held a kprobe on `fuse_do_getattr` with a `stacktrace:400` trigger and a 16 MiB buffer per CPU. No overrun. The probe and the instance were removed afterwards |
| Status | answered: **no route in 6.12 keeps `default_permissions` and drops this GETATTR** |

## Source (6.12.76)

- `fuse_unlink` and `fuse_rmdir` (`dir.c:983–1027`) call `fuse_dir_changed(dir)` on success. `fuse_dir_changed` (`dir.c:132`) calls `fuse_invalidate_attr(dir)`, which sets `inval_mask |= STATX_BASIC_STATS` (`dir.c:118–130`). That includes `STATX_MODE`, `STATX_UID` and `STATX_GID`, although an unlink cannot change any of them on the parent.
- With `default_permissions`, `fuse_permission` (`dir.c:1527–1590`) refreshes the inode's attributes before `generic_permission` whenever `(STATX_MODE | STATX_UID | STATX_GID) & inval_mask` is set, or the attribute timeout has passed. The refresh is `fuse_perm_getattr` → `fuse_do_getattr`, one FUSE GETATTR.
- The next unlink in the same directory resolves its parent through `link_path_walk`, whose `may_lookup` checks `MAY_EXEC` on the parent. That check finds the bits stale and sends the GETATTR. The later `may_delete` (`MAY_WRITE | MAY_EXEC`) finds them fresh and sends none.

## Trace (`rm -rf` of the committed `node_modules`, 46,722 entries)

| | Count |
| --- | ---: |
| `fuse_do_getattr` hits in the window | 47,368 (47,364 from `rm`) |
| Daemon GETATTRs in this sample's own receipts (seq 401, rm-committed step) | 47,366 |

The first 400 stacks:

| Stacks | Path | Cause |
| ---: | --- | --- |
| 349 (87%) | `unlinkat` → `do_unlinkat` → `__filename_parentat` → `path_parentat` → `link_path_walk` → `inode_permission` → `fuse_do_getattr` | parent permission refresh after the previous unlink |
| 32 | `newfstatat` → `vfs_fstat` → `fuse_getattr` | `rm`'s own stat of a directory fd |
| 15 | `newfstatat` → `vfs_statx` → `path_lookupat` → `link_path_walk` → `inode_permission` | the same parent refresh, on a stat |
| 3 | `openat` → `path_openat` → `link_path_walk` → `inode_permission` | the same parent refresh, on an open |
| 1 | `chdir` → `inode_permission` | |

So about 92% of the GETATTRs are the permission refresh of a parent that the kernel itself marked stale, and about 8% are `rm`'s own `fstat` calls.

## Routes considered, with `default_permissions` kept

| Route | Drops the GETATTR? | Why |
| --- | --- | --- |
| Longer attribute TTL in our replies | no | the trigger is `inval_mask`, not the timeout |
| An UNLINK reply carrying the parent's attributes | no | `FUSE_UNLINK` has no output arguments in the protocol |
| A daemon notification that refreshes attributes | no | 6.12 has only `FUSE_NOTIFY_INVAL_*`, no store-attributes notify |
| An init capability flag | no | none in 6.12 changes `fuse_dir_changed`'s mask |
| A different `rm` | no | `unlinkat(dirfd, name)` still runs `may_lookup` on `dirfd`'s directory |
| `default_permissions` off | yes | excluded by the owner (#356) and by this assignment |
| Kernel: `fuse_dir_changed` invalidating only the bits a namespace change can alter (mtime, ctime, size, nlink, blocks), not mode, uid or gid | yes | not ours to change: it is the host kernel, and third-party patching is excluded (AGENTS §4) |

**Upstream lead, not verified.** One web-search summary described an
upstream FUSE patch (v7.2-rc1 `fs/fuse/dir.c` history) that stops
invalidating the parent's uid and gid on a directory change, so
that `fuse_permission` no longer sends a GETATTR for every unlink. Neither
its diff nor a second source could be fetched; one mirror timed out and one
had an expired certificate. It is not claimed here.

If such a kernel lands on the host, this GETATTR goes away with no LayerFS
change. Mode is part of the permission mask too, so mode has to be left out
of the invalidation as well.

## Effect on the rm -rf floor (record 025)

The GETATTR is 1.014 of the 3.67 synchronous requests per entry. On this
host it stays, so the zero-daemon-time floor without LOOKUP is still
(2.67 × 38.1 + 10.7) µs × 46,722 ≈ 5.2 s. Only a kernel with the narrower
invalidation brings it down to ≈3.5 s.

## Production LOC

98479 → 98479 (delta 0), docs only.
