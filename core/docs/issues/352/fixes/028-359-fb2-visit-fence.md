# #359 · F-B2 visit-fence half: keep a non-orphan parent's fence row while orphans exist (rm -rf prototype 1)

| | |
| --- | --- |
| Trigger | Liaison 2026-10-18: rm -rf prototypes, measured separately and then together, each reported against ~3 s and the 7.0 s round-trip floor (record 025), with synchronous requests per entry and daemon µs per entry. The first is "no avoidable facts reads on unlink" (record 025 §3: the parent's fence row is not kept while orphans exist) |
| Kind | code path only (overlay). No format change, no schema change |
| Commit | `89a2aa480` on local branch `issue359-proto-fence`, on top of `issue359-impl` `46e17bdf3` (neither pushed) |
| Binaries | head `cc185d13` (`2d84fe1bb`'s product) → fence: daemon `ab239126`, addon `e744e9c1` (`89a2aa480`) |
| Production LOC | 98479 → 98480 (+1) |
| Status | prototype implemented and tested; one sample per case. **Small count gain, no wall gain shown** |

## Change

`Overlay::visit_fence` (`layerfs-overlay/src/lifetime/kernel_visit.rs`)
starts the job's row memory with the fence row of the inode the visit names.
It kept nothing while the engine held any orphan, so the job read that row
again, through `SourceRows::inode`. Now it leaves out only a serial that is
itself an orphan. The engine's in-memory orphan map decides, with no
statement, as `orphan_inode` and `SourceRows::inode` already do. A serial the
job itself detaches is detached in `apply_checked`, after the job's last kept
read.

## Test

`layerfs-workspace` `kernel_visit`
`an_unlink_beside_an_orphan_reads_its_parent_row_once` (new):

- creates two files and unlinks both;
- measures inode statement attempts on the deciding visit of each unlink.

| Unlink | Inode statement attempts |
| --- | ---: |
| First | 5 |
| Second, beside an orphan, with the fix | 5 |
| Second, beside an orphan, on the revert check (old `visit_fence`) | 6, so the test fails |

## Samples

`cost.mjs case <id> --part lfs --binary ab239126 --label fence`, ledger
seq 403 (rm-rf-nm) and 405 (cp-rm-nm), one sample each. Head arms are
seq 349 and 347 (record 026), and A1 arms are seq 291 and 293 (record 025).

- **Cache state:** as `cost.mjs` declares. Each sample gets a fresh daemon
  and Workspace, and the Store page cache stays resident (declared, not
  controlled). Wall times are warm-Store diagnostics (AGENTS §1); counts are
  exact.
- **Budget:** these commands exceed the 15 s default (rm-rf-nm 27 s,
  cp-rm-nm 63 s). They run under the #359 scoped exception, "each case runs
  in its own command, under 2 minutes" (RCA §10).
- **Interference:** two non-#359 issue containers ran in both arms
  (`layerfs-issue352-scale-s4-a`/`-b`). 1-minute load was 5.8 for fence
  rm-committed vs 6.5 for head, and 7.4 for fence rm-created vs 5.5 for head.

Columns are per removed entry (46,722 in both steps). "Sync requests" are
the synchronous FUSE requests. "Daemon µs" is the sum of their callbacks.
"Outside" is wall minus that sum. Deltas are after − before of the daemon's
cumulative counters, from the step's status records. Breakdown script:
`rmbr.py`, a scratch tool that reads `trace.jsonl` and `daemon.jsonl`.

| Step | Arm | Wall ms | Sync requests / e | Daemon µs / e | Outside µs / e | UNLINK+RMDIR µs / e | Mutation hold µs / e | Foreground statements / e | Inode statements | Transactions / e | LOOKUP |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rm-committed | A1 | 23,566 | 3.672 | 353.9 | 150.5 | 84.1 | 64.8 | 26.11 | 551,039 | 2.00 | 46,722 |
| rm-committed | head | 22,255 | 3.672 | 337.4 | 139.0 | 80.7 | 62.1 | 26.11 | 551,152 | 2.00 | 46,722 |
| rm-committed | fence | 24,204 | 3.672 | 368.3 | 149.7 | 90.1 | 70.0 | **25.84** | **538,265** | 2.00 | 46,722 |
| rm-created | A1 | 12,026 | 3.061 | 137.6 | 119.8 | 52.7 | 30.5 | 23.29 | 446,619 | 2.00 | 18,196 |
| rm-created | head | 10,588 | 2.860 | 118.9 | 107.7 | 49.9 | 27.8 | 22.68 | 427,540 | 2.00 | 8,813 |
| rm-created | fence | 11,276 | 2.999 | 126.2 | 115.2 | 49.6 | 28.6 | 22.82 | 427,572 | 2.00 | 15,305 |

Native is 499 ms (rm-committed, seq 291) and 508 ms (rm-created, seq 345). Against the targets:

| Step | Fence wall | ~3 s target | Round-trip floor at this mix (record 025) |
| --- | ---: | --- | --- |
| rm-committed | 24.2 s | missed, 8.1× | 7.0 s, 3.5× |
| rm-created | 11.3 s | missed, 3.8× | 5.6 s, 2.0× |

## Reading

- **Count:** rm-committed foreground inode statements fell by **12,887**
  (−2.3%), or 0.28 statements per entry, about 1% of foreground statements.
  Requests and transactions are unchanged; this fix removes no request.
- **Why 12,887 and not one per entry** (inferred from source). The engine
  clears `orphan_seen` once its orphan map is empty (`orphans_deleted`).
  Every orphan is reclaimed by its FORGET on the second receive loop. So the
  second parent read happened only while a FORGET was still outstanding at
  the next unlink, in about 28% of mutations here. Record 025's "10
  statements, parent read twice" was an estimate from source and is
  corrected by this count.
- **rm-created:** inode statements were flat (+32). This sample's LOOKUPs
  rose 8,813 → 15,305, the kernel-dentry variation left open in record 020,
  and LOOKUPs read inode rows too. The receipts do not split inode reads by
  request, so the fence saving there is not separated.
- **Wall:** rm-committed rose 22.3 → 24.2 s (+8.8%), but every callback rose
  by a similar share, including ones this change does not run:

  | Callback | Change |
  | --- | ---: |
  | LOOKUP | +8.8% |
  | GETATTR | +7.1% |
  | UNLINK | +11.6% |
  | FORGET | +8.1% |

  So the wall difference is not attributable to the change from one sample
  per arm. It is reported, not resampled. Mutation hold rose in the same
  proportion, although the job now runs fewer statements.
- **What it does to the target:** nothing measurable. The fix removes
  about 0.28 statements per entry, at about 2.5 µs each (head: 64.4 µs of
  foreground SQL over 26.11 statements per entry), so about 0.7 µs per entry, against a 64 µs per entry budget for ~3 s. As record 025 found,
  the gap is synchronous requests (3.67 per entry against about 1.4), not
  this read.

## Proof

All runs used the pinned image, the Disposable Store and
`LAYERFS_CONSTRUCTION_WORKERS=1`, each command ≤120 s, with the test
binaries built first.

- `layerfs-overlay` + `layerfs-workspace`: 227 passed, 0 failed (226 before,
  plus the new test).
- `layerfs-daemon` targets that pass in full:

  | Target | Passed |
  | --- | ---: |
  | `kernel_custody` | 2 |
  | `kernel_coherence` | 6 |
  | `kernel_mutation` | 2 |
  | `kernel_mount` | 3 |
  | `fp31_forget_underflow` | 2 |
  | `mounted_links` | 1 |
  | `negative_entries` | 2 |
  | `mounted_drain` | 1 |
  | `mounted_install` | 4 |
  | `mounted_cycles` | 4 |
  | `r5_5_install_survival` | 4 |
  | `mounted_concurrency` | 5 |
  | `mounted_serial_admission` | 4 |
  | `mounted_listing_reads` | 1 |
  | `mounted_patterns` | 1 |
  | `store_commit` | 7 |
  | `mount_control` | 9 |

  The kept proofs are among these:
  - `mounted_install` R5-5a (`retained_descriptors_and_kernel_caches_are_unchanged_by_install`)
    holds O_PATH and open references across a Commit's install;
  - `kernel_coherence` `removed_references_keep_exact_state_without_open_custody`
    holds removed O_PATH references;
  - `kernel_custody` and `fp31_forget_underflow` hold kernel custody and
    orphan reclaim.
- **`mounted_commit`: 7 of 8.**
  `r5_3_commit_captures_what_every_launch_published_whatever_became_of_the_process`
  failed at `support/mounted.rs:133`: `Kernel(KernelFailure { code: Busy,
  phase: "unmount:kernel", detail: "kernel reported the mount busy; no
  terminal effect" })`. This is an **F-046** occurrence, with its error text
  captured for the first time (BUGS.md). It passed on one diagnostic rerun
  run alone (`--test mounted_commit r5_3`). That is not a pass for the
  target.
- clippy `-D warnings` (overlay, workspace, all targets) is clean, and
  rustfmt is clean on both changed files.

No test was deleted.

## Production LOC

98479 → 98480 (+1). `tools/production_loc.py --root` on `git archive` of
the parent and of the committed tree: core 89797 → 89798, sdk 2635, dsh
6047, reference absent (retired R9c; last counted 65,417 at tree
`498dd1917812`). This record is docs only: 98480 → 98480 (delta 0).
